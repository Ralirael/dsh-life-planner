// Appearance model: fonts, sizes, per-area accents, backgrounds and skins.
// Everything here is presentation state, so it never reaches the host database.
const APPEARANCE_KEY = 'lpAppearance.v1';

// The artwork ships with the plugin, so every install starts with a background.
const BUILTIN_BACKGROUND_URL = '/life-planner/api/background?area=default&v=1'

const APPEARANCE_DEFAULTS = {
  // Ordered like the calendar page: tabs → titles → calendar → task rows →
  // type → tags → supporting text → mistake cards → everything else.
  font: {
    base: 16,
    tab: 24,
    title: 24,
    calendar: 18,
    task: 20,
    type: 20,
    tag: 20,
    meta: 16,
    mistakeTitle: 26,
    mistakeAnswer: 22,
    mistakeReason: 24,
  },
  // Mistake cards: 0 columns = as many as fit; 0 height = grow with the text.
  size: { calendarHeight: 580, mistakeColumns: 2, mistakeHeight: 0 },
  accent: { planning: '', study: '' },
  // How see-through the panels over a background image are: 0.15 = 15%.
  surface: 0.15,
  background: {
    planning: {
      mode: 'image',
      color: '#1b1e24',
      // Bundled artwork: served by the host, works for every install.
      imageUrl: BUILTIN_BACKGROUND_URL,
      opacity: 0.35,
      mask: { on: false, side: 'left', width: 25, strength: 0.35 },
    },
    study: {
      mode: 'image',
      color: '#1b1e24',
      imageUrl: BUILTIN_BACKGROUND_URL,
      opacity: 0.35,
      mask: { on: false, side: 'left', width: 25, strength: 0.6 },
    },
  },
};


// The shell changes port on every launch, so localStorage is only a paint
// cache: the durable copy of appearance and skins lives in the host database.
let HOST_UI = null;

function setHostUi(ui) {
  HOST_UI = ui && typeof ui === 'object' ? ui : null;
}

function hostAppearance() {
  return HOST_UI && HOST_UI.appearance && typeof HOST_UI.appearance === 'object' ? HOST_UI.appearance : null;
}

let hostSaveTimer = null;

function scheduleHostSave() {
  if (typeof api !== 'function') return;
  if (hostSaveTimer) clearTimeout(hostSaveTimer);
  hostSaveTimer = setTimeout(() => {
    hostSaveTimer = null;
    try {
      api('ui.save', { appearance: loadAppearance(), skins: userSkins() }).catch(() => {});
    } catch {
      // The host copy is best effort; the local cache still holds the state.
    }
  }, 400);
}

function cloneAppearance(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadAppearance() {
  // The built-in defaults above are the baseline; the host copy overlays them.
  const merged = cloneAppearance(APPEARANCE_DEFAULTS);
  // The host copy is the durable one, so it lands before the local cache.
  const host = hostAppearance();
  if (host) {
    for (const section of Object.keys(merged)) {
      if (host[section] === undefined) continue;
      merged[section] =
        typeof merged[section] === 'object' && merged[section] !== null
          ? { ...merged[section], ...host[section] }
          : host[section];
    }
  }
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    if (!raw) return merged;
    const saved = JSON.parse(raw);
    for (const section of Object.keys(merged)) {
      if (saved[section] === undefined) continue;
      if (typeof merged[section] === 'object' && merged[section] !== null) {
        merged[section] = { ...merged[section], ...saved[section] };
      } else {
        merged[section] = saved[section];
      }
    }
  } catch {
    // A corrupt value falls back to defaults rather than breaking the page.
  }
  // Older saves only had an image, so their mode is inferred from the file.
  for (const area of ['planning', 'study']) {
    const layer = merged.background[area] || {};
    merged.background[area] = { ...APPEARANCE_DEFAULTS.background[area], ...layer };
    const next = merged.background[area];
    if (!next.mode || next.mode === 'none') next.mode = next.imageUrl ? 'image' : 'none';
    next.mask = { ...APPEARANCE_DEFAULTS.background[area].mask, ...(layer.mask || {}) };
  }
  return merged;
}

function saveAppearance(value) {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('[life-planner] could not persist appearance', error);
  }
}

/**
 * The mask is a soft wash that covers one edge of the page and fades outwards.
 * It defaults to the left 25% so text on that side stays readable.
 */
function maskGradient(mask) {
  if (!mask || !mask.on) return 'none';
  const width = Math.min(90, Math.max(5, Number(mask.width) || 25));
  const strength = Math.min(1, Math.max(0.05, Number(mask.strength) || 0.6));
  const color = `color-mix(in srgb, var(--dsw-alias-bg-base) ${Math.round(strength * 100)}%, transparent)`;
  const direction =
    { left: 'to right', right: 'to left', top: 'to bottom', bottom: 'to top' }[mask.side] || 'to right';
  return `linear-gradient(${direction}, ${color} 0%, transparent ${width}%)`;
}

/**
 * Apply the appearance by writing one stylesheet plus per-page layers. Sizes are
 * emitted as variables so the tree, board and study panels inherit them.
 */
// Background bytes are fetched once and exposed as blob URLs. A plain CSS url
// cannot carry the page's request headers, so this is what actually works in
// the desktop shell.
const BACKGROUND_BLOBS = { planning: '', study: '' };
// The URL a blob belongs to, so a reload never fetches the same image twice.
const BACKGROUND_SOURCES = { planning: '', study: '' };
const BACKGROUND_PENDING = {};

async function hydrateBackgrounds(appearance, onlyAreas) {
  const areas = Array.isArray(onlyAreas) && onlyAreas.length > 0 ? onlyAreas : ['planning', 'study'];
  const tasks = areas.map(async (area) => {
    const layer = appearance && appearance.background && appearance.background[area];
    const url = layer && layer.imageUrl;
    if (!url) return { area, ok: true, skipped: true };
    if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
    if (BACKGROUND_PENDING[url]) {
      try {
        await BACKGROUND_PENDING[url];
        return { area, ok: true, cached: true };
      } catch {
        return { area, ok: false };
      }
    }
    const absolute = (() => {
      try {
        const base = (typeof document !== 'undefined' && document.baseURI) || 'http://dsh.internal/'
        return new URL(url, base).toString()
      } catch {
        return url
      }
    })()
    const pending = fetch(absolute).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('empty image');
      return blob;
    });
    BACKGROUND_PENDING[url] = pending;
    try {
      const blob = await pending;
      if (BACKGROUND_BLOBS[area]) URL.revokeObjectURL(BACKGROUND_BLOBS[area]);
      BACKGROUND_BLOBS[area] = URL.createObjectURL(blob);
      BACKGROUND_SOURCES[area] = url;
      return { area, ok: true };
    } catch (error) {
      console.error('[life-planner] background could not be loaded', area, error);
      return { area, ok: false };
    } finally {
      delete BACKGROUND_PENDING[url];
    }
  });
  const results = await Promise.all(tasks);
  applyAppearance(appearance);
  return {
    loaded: results.filter((entry) => entry.ok && !entry.skipped).map((entry) => entry.area),
    failed: results.filter((entry) => !entry.ok).map((entry) => entry.area),
  };
}

// Last applied appearance, so layout code can read a configured size, plus a
// subscription so layout can follow a change made in the settings dialog.
let CURRENT_APPEARANCE = null;
const APPEARANCE_LISTENERS = new Set();

function onAppearanceChange(listener) {
  APPEARANCE_LISTENERS.add(listener);
  return () => APPEARANCE_LISTENERS.delete(listener);
}

function currentAppearance() {
  if (CURRENT_APPEARANCE) return CURRENT_APPEARANCE;
  try {
    return loadAppearance();
  } catch {
    return cloneAppearance(APPEARANCE_DEFAULTS);
  }
}

/**
 * Changing a stylesheet does not always invalidate the paint in the desktop
 * shell, which left the panel looking unchanged until a dialog forced a
 * repaint. Toggling a compositing hint and a resize event forces it.
 */
function nudgePaint() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const page = document.querySelector('.lp-page');
  if (page) {
    page.style.transform = 'translateZ(0)';
    // Reading layout flushes the style change before the hint is removed.
    void page.offsetHeight;
    window.requestAnimationFrame(() => {
      page.style.transform = '';
    });
  }
  window.dispatchEvent(new Event('resize'));
}

/**
 * The control fill as an inline-ready colour. Reading the theme colour here
 * avoids depending on a stylesheet rule being present and winning the cascade.
 */
function controlSurface(alpha = 0.45) {
  try {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;display:block';
    probe.style.backgroundColor = 'var(--dsw-alias-bg-base)';
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const match = /^rgba?\(([^)]+)\)$/.exec(colour || '');
    if (!match) return `rgba(24, 26, 32, ${alpha})`;
    const parts = match[1].split(',').map((part) => part.trim())
    const [r, g, b] = parts
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } catch {
    return `rgba(24, 26, 32, ${alpha})`
  }
}

function applyAppearance(value) {
  if (typeof document === 'undefined') return;
  const appearance = value || loadAppearance();
  CURRENT_APPEARANCE = appearance;
  const { font, size, accent, background } = appearance;
  const sheetId = 'life-planner-appearance';
  let sheet = document.getElementById(sheetId);
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.id = sheetId;
    document.head.appendChild(sheet);
  } else if (sheet.parentNode === document.head) {
    // Re-append so this sheet stays after every other plugin stylesheet: the
    // appearance must win the cascade even when a skin sheet was added later.
    document.head.appendChild(sheet);
  }
  const mix = (percent) => `color-mix(in srgb, var(--dsw-alias-bg-base) ${percent}%, transparent)`;
  const css = [];
  const px = (value, fallback) => `${Number(value) || fallback}px`;
  css.push(
    `.lp-page{--lp-fs:${px(font.base, 13)};` +
      // Two steps around the base keep every size a plain pixel value.
      `--lp-fs-sm:${Math.max(10, (Number(font.base) || 13) - 1)}px;` +
      `--lp-fs-xs:${Math.max(9, (Number(font.base) || 13) - 2)}px;` +
      `--lp-fs-lg:${(Number(font.base) || 13) + 2}px;` +
      `--lp-tab-fs:${px(font.tab, 13)};--lp-title-fs:${px(font.title, 15)};` +
      `--lp-cal-fs:${px(font.calendar, 12)};--lp-task-fs:${px(font.task, 13)};` +
      `--lp-type-fs:${px(font.type, 11)};--lp-tag-fs:${px(font.tag, 12)};--lp-meta-fs:${px(font.meta, 11)};` +
      // Mistake cards: three separate sizes plus a column count and card height.
      `--lp-mistake-title-fs:${px(font.mistakeTitle, 15)};` +
      `--lp-mistake-answer-fs:${px(font.mistakeAnswer, 13)};` +
      `--lp-mistake-reason-fs:${px(font.mistakeReason, 12)};` +
      `--lp-mistake-cols:${Number(size.mistakeColumns) > 0 ? Math.min(6, Math.round(Number(size.mistakeColumns))) : 'auto-fill'};` +
      `--lp-mistake-h:${Number(size.mistakeHeight) > 0 ? `${Math.round(Number(size.mistakeHeight))}px` : 'auto'};` +
      // Row and tag heights follow their text instead of being hand-tuned.
      `--lp-row:${Math.round((Number(font.task) || 13) + 17)}px;` +
      `--lp-tag-h:${Math.round((Number(font.tag) || 12) + 10)}px;` +
      `--lp-cal-h:${Number(size.calendarHeight) > 0 ? `${Number(size.calendarHeight)}px` : '420px'};}`,
  );
  if (accent.planning) css.push(`.lp-page:not(.lp-study){--lp-accent:${accent.planning};}`);
  if (accent.study) css.push(`.lp-page.lp-study{--lp-accent:${accent.study};}`);
  for (const area of ['planning', 'study']) {
    const layer = background[area] || {};
    const mask = layer.mask || { on: false };
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    const source = layer.mode === 'image' ? BACKGROUND_BLOBS[area] || layer.imageUrl : '';
    const solid = layer.mode === 'color' && layer.color ? layer.color : '';
    if (!source) {
      // A solid fill still paints, so only the image layers are cleared.
      css.push(
        `${selector}{--lp-bg-image:none;--lp-bg-overlay:none;--lp-bg-fade:none;` +
          `--lp-bg-color:${solid || 'var(--dsw-alias-bg-base)'};` +
          `--lp-surface-bg:${solid ? mix(0) : 'var(--dsw-alias-bg-base)'};` +
          `--lp-control-bg:var(--dsw-alias-bg-layer-1);` +
          `--lp-modal-bg:var(--dsw-alias-bg-base);}`,
      );
      continue;
    }
    // Panels over a background go translucent so the image stays visible.
    const keep = Math.round((1 - Math.min(0.9, Math.max(0, Number(value.surface ?? 0.15)))) * 100);
    // Controls sit on top of panels and are small, so they need a much lighter
    // fill: 45% of the base colour reads as translucent, 85% looks solid.
    const keepControl = 45;
    // `background-image` only accepts images, so a tint must be a gradient:
    // a bare colour there invalidates the whole declaration.
    const tint = mix(Math.round((1 - layer.opacity) * 100));
    const overlay = `linear-gradient(${tint}, ${tint})`;
    const fade = maskGradient(mask);
    css.push(
      `${selector}{--lp-surface-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keep}%, transparent);` +
        `--lp-control-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keepControl}%, transparent);` +
        // Dialogs stay almost opaque so the page behind cannot distract reading or input.
        `--lp-modal-bg:color-mix(in srgb, var(--dsw-alias-bg-base) 97%, transparent);` +
        `--lp-bg-color:var(--dsw-alias-bg-base);--lp-bg-image:url("${source}");--lp-bg-overlay:${overlay};--lp-bg-fade:${fade};}`,
    );
  }
  sheet.textContent = css.join('\n');
  document.documentElement.dataset.lpAccent = accent.planning || accent.study ? 'custom' : 'default';
  saveAppearance(appearance);
  scheduleHostSave();
  nudgePaint();
  // Layout that depends on a size (the calendar) re-measures on change.
  for (const listener of APPEARANCE_LISTENERS) {
    try {
      listener(appearance);
    } catch {
      // A listener must never break the appearance pass.
    }
  }
}

function skinLabel(name) {
  const entry = SKINS[name];
  return entry && entry.label ? entry.label : String(name || '');
}

// --- named skins ------------------------------------------------------------
// The skin dropdown lists the built-in token skins plus whatever the user saved.
// A saved skin is a full snapshot: appearance (fonts, sizes, background) + skin.
const USER_SKINS_KEY = 'lpUserSkins.v1';
// One-time clean-up requested by the user: keep only the default skin.
const USER_SKINS_RESET_KEY = 'lpUserSkins.reset.v2';

function userSkins() {
  try {
    const host = HOST_UI && HOST_UI.skins && typeof HOST_UI.skins === 'object' ? HOST_UI.skins : {};
    if (!localStorage.getItem(USER_SKINS_RESET_KEY)) {
      localStorage.removeItem(USER_SKINS_KEY);
      localStorage.setItem(USER_SKINS_RESET_KEY, '1');
      return host;
    }
    const local = JSON.parse(localStorage.getItem(USER_SKINS_KEY) || '{}');
    return { ...host, ...(local && typeof local === 'object' ? local : {}) };
  } catch {
    return {};
  }
}

function listSkinOptions() {
  // Only the default skin is built in; everything else is user-saved.
  const options = [{ value: 'builtin:default', label: skinLabel('default') || '默认' }];
  for (const name of Object.keys(userSkins())) options.push({ value: `user:${name}`, label: name });
  return options;
}

function saveUserSkin(name) {
  const clean = String(name || '').trim().slice(0, 24);
  if (!clean) throw new Error('empty skin name');
  const skins = userSkins();
  skins[clean] = { appearance: loadAppearance(), skin: currentSkin() };
  localStorage.setItem(USER_SKINS_KEY, JSON.stringify(skins));
  scheduleHostSave();
  return clean;
}

function deleteUserSkin(name) {
  // The default skin is built in and must stay selectable.
  if (String(name) === 'default') return false;
  const skins = userSkins();
  if (!skins[name]) return false;
  delete skins[name];
  localStorage.setItem(USER_SKINS_KEY, JSON.stringify(skins));
  scheduleHostSave();
  return true;
}

function applySkinChoice(value) {
  const [kind, name] = String(value || '').split(':');
  if (kind === 'user') {
    const entry = userSkins()[name];
    if (!entry) return loadAppearance();
    applySkin(entry.skin || 'default');
    const merged = cloneAppearance(APPEARANCE_DEFAULTS);
    for (const section of Object.keys(merged)) {
      if (entry.appearance && entry.appearance[section] !== undefined) {
        merged[section] = { ...merged[section], ...entry.appearance[section] };
      }
    }
    applyAppearance(merged);
    return merged;
  }
  applySkin(name || 'default');
  return loadAppearance();
}


function exportAppearance() {
  return JSON.stringify({ version: 1, appearance: loadAppearance() }, null, 2);
}

function importAppearance(text) {
  const parsed = JSON.parse(text);
  const incoming = parsed && parsed.appearance ? parsed.appearance : parsed;
  if (!incoming || typeof incoming !== 'object') throw new Error('invalid appearance file');
  const merged = cloneAppearance(APPEARANCE_DEFAULTS);
  for (const section of Object.keys(merged)) {
    if (incoming[section] === undefined) continue;
    merged[section] = { ...merged[section], ...incoming[section] };
  }
  applyAppearance(merged);
  return merged;
}
