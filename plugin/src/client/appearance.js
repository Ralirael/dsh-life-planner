// Appearance model: fonts, sizes, per-area accents, backgrounds and skins.
const APPEARANCE_KEY = 'lpAppearance.v1';
const SKIN_BACKGROUNDS_KEY = 'lpSkinBackgrounds.v1';
const SKIN_PROFILES_KEY = 'lpSkinProfiles.v2';
const DEFAULT_SKIN_CHOICE = 'builtin:default';
const APPEARANCE_AREAS = ['planning', 'study'];

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
  layout: { calendar: 'stacked', studyToday: 'stacked', studyPlan: 'auto', spacing: 'standard', fontFamily: 'system' },
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
let legacyBackgroundAssets = {};
let localSkinProfiles = {};
let changedSkinProfiles = {};

function setHostUi(ui) {
  HOST_UI = ui && typeof ui === 'object' ? ui : null;
}

function setLegacyBackgroundAssets(assets) {
  legacyBackgroundAssets = assets || {};
}

let hostSaveTimer = null;
let hostAppearanceSave = Promise.resolve();

function scheduleHostSave() {
  clearTimeout(hostSaveTimer);
  hostSaveTimer = setTimeout(() => {
    flushAppearanceSave().catch(() => {});
  }, 240);
}

function flushAppearanceSave(selection) {
  clearTimeout(hostSaveTimer);
  hostSaveTimer = null;
  hostAppearanceSave = hostAppearanceSave.catch(() => {}).then(async () => {
    const profiles = changedSkinProfiles;
    const hasProfiles = Object.keys(profiles).length > 0;
    if (!selection && !hasProfiles) return;
    await api('ui.save', { ...selection, ...(hasProfiles ? { skinProfiles: profiles } : {}) });
    if (HOST_UI && hasProfiles) HOST_UI.skinProfiles = { ...HOST_UI.skinProfiles, ...profiles };
    for (const [choice, profile] of Object.entries(profiles)) {
      if (changedSkinProfiles[choice] !== profile) continue;
      const next = { ...changedSkinProfiles };
      delete next[choice];
      changedSkinProfiles = next;
    }
  });
  return hostAppearanceSave;
}

function cloneAppearance(value) {
  return JSON.parse(JSON.stringify(value));
}

function cachedAppearanceValue(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {
    // A corrupt cache must not prevent the host copy from loading.
  }
  return {};
}

function skinProfiles() {
  return { ...cachedAppearanceValue(SKIN_PROFILES_KEY), ...HOST_UI?.skinProfiles, ...localSkinProfiles };
}

function legacyImageArea(value) {
  if (!value) return '';
  try {
    const url = new URL(value, 'http://dsh.internal/');
    const area = url.searchParams.get('area');
    if (url.pathname === '/life-planner/api/background' && APPEARANCE_AREAS.includes(area)) return area;
  } catch {}
  return '';
}

const APPEARANCE_LIMITS = {
  calendarHeight: [0, 1600], mistakeColumns: [0, 6], mistakeHeight: [0, 1200],
};
const APPEARANCE_LAYOUTS = {
  calendar: ['auto', 'stacked'], studyToday: ['auto', 'stacked'], studyPlan: ['auto', 'stacked'],
  spacing: ['compact', 'standard', 'roomy'], fontFamily: ['system', 'serif'],
};

function skinDefaults(skin) {
  const appearance = cloneAppearance(APPEARANCE_DEFAULTS);
  if (skin === 'clawd') {
    appearance.layout = { ...appearance.layout, calendar: 'auto', studyToday: 'auto', fontFamily: 'serif' };
    appearance.font = { ...appearance.font, base: 15, tab: 16, calendar: 15, task: 16, type: 14, tag: 14, meta: 14 };
    for (const layer of Object.values(appearance.background)) Object.assign(layer, { mode: 'none', imageUrl: '' });
  } else if (skin === 'compact' || skin === 'large') {
    appearance.layout.spacing = skin === 'compact' ? 'compact' : 'roomy';
  }
  return appearance;
}

function appearanceNumber(value, min, max, fallback) {
  const number = typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN;
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function skinImageUrl(value) {
  if (typeof value !== 'string') return '';
  const local = /^\/life-planner\/api\/background\?(?:area=(?:planning|study|default)(?:&v=\d+)?|asset=[a-f0-9]{64}\.(?:png|jpe?g|gif|webp))$/;
  return local.test(value) ? value : '';
}

function normalizeAppearance(raw, defaults) {
  const appearance = cloneAppearance(defaults);
  const validColor = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
  for (const key of Object.keys(appearance.font)) {
    appearance.font[key] = Math.round(appearanceNumber(raw?.font?.[key], 8, 64, appearance.font[key]));
  }
  for (const [key, [min, max]] of Object.entries(APPEARANCE_LIMITS)) {
    appearance.size[key] = Math.round(appearanceNumber(raw?.size?.[key], min, max, appearance.size[key]));
  }
  if (appearance.size.calendarHeight > 0) appearance.size.calendarHeight = Math.max(320, appearance.size.calendarHeight);
  for (const [key, options] of Object.entries(APPEARANCE_LAYOUTS)) {
    if (options.includes(raw?.layout?.[key])) appearance.layout[key] = raw.layout[key];
  }
  appearance.surface = appearanceNumber(raw?.surface, 0, 0.9, appearance.surface);
  for (const area of APPEARANCE_AREAS) {
    const layer = appearance.background[area];
    const incoming = raw?.background?.[area] || {};
    if (['image', 'none', 'color'].includes(incoming.mode)) layer.mode = incoming.mode;
    else if (incoming.imageUrl) layer.mode = 'image';
    if (Object.hasOwn(incoming, 'imageUrl')) layer.imageUrl = skinImageUrl(incoming.imageUrl);
    if (validColor(incoming.color)) layer.color = incoming.color;
    layer.opacity = appearanceNumber(incoming.opacity, 0, 0.9, layer.opacity);
    const mask = incoming.mask || {};
    if (typeof mask.on === 'boolean') layer.mask.on = mask.on;
    if (['left', 'right', 'top', 'bottom'].includes(mask.side)) layer.mask.side = mask.side;
    layer.mask.width = appearanceNumber(mask.width, 5, 90, layer.mask.width);
    layer.mask.strength = appearanceNumber(mask.strength, 0.05, 0.9, layer.mask.strength);
    const oldArea = legacyImageArea(layer.imageUrl);
    if (oldArea && legacyBackgroundAssets[oldArea]) layer.imageUrl = legacyBackgroundAssets[oldArea];
    if (raw?.accent?.[area] === '' || validColor(raw?.accent?.[area])) appearance.accent[area] = raw.accent[area];
  }
  return appearance;
}

function profileForSkin(choice) {
  const profiles = skinProfiles();
  const saved = Object.hasOwn(profiles, choice) ? profiles[choice] : null;
  const named = choice.startsWith('user:') ? legacyUserSkins()[choice.slice(5)] : null;
  const skin = saved?.skin || named?.skin || (choice.startsWith('builtin:') ? choice.slice(8) : 'default');
  const base = Object.hasOwn(SKINS, skin) ? skin : 'default';
  const defaults = skinDefaults(base);
  if (saved?.appearance) return { skin: base, appearance: normalizeAppearance(saved.appearance, defaults) };
  const legacy = { ...cachedAppearanceValue(APPEARANCE_KEY), ...HOST_UI?.appearance };
  const legacyBackgrounds = { ...cachedAppearanceValue(SKIN_BACKGROUNDS_KEY), ...HOST_UI?.skinBackgrounds };
  const owned = legacyBackgrounds[choice];
  const activeNamed = named && HOST_UI?.skinChoice === choice;
  const raw = activeNamed
    ? { ...named.appearance, ...legacy, background: named.appearance?.background }
    : named?.appearance || (choice === DEFAULT_SKIN_CHOICE
      ? legacy : HOST_UI?.activeSkin === base && !HOST_UI?.skinChoice?.startsWith('user:') ? { ...legacy, background: undefined } : {});
  const appearance = normalizeAppearance({ ...raw, background: owned || raw.background }, defaults);
  if (!owned && choice === DEFAULT_SKIN_CHOICE) {
    for (const area of APPEARANCE_AREAS) {
      const layer = appearance.background[area];
      if (layer.mode === 'image' && (!layer.imageUrl || layer.imageUrl === BUILTIN_BACKGROUND_URL) && legacyBackgroundAssets[area]) {
        layer.imageUrl = legacyBackgroundAssets[area];
      }
    }
  }
  return { skin: base, appearance };
}

function loadAppearance() {
  return profileForSkin(currentSkinChoice()).appearance;
}

function saveSkinProfile(choice, profile) {
  localSkinProfiles = { ...localSkinProfiles, [choice]: profile };
  changedSkinProfiles = { ...changedSkinProfiles, [choice]: profile };
  try { localStorage.setItem(SKIN_PROFILES_KEY, JSON.stringify(skinProfiles())); } catch {}
  scheduleHostSave();
}

function saveAppearance(value) {
  saveSkinProfile(currentSkinChoice(), { skin: currentSkin(), appearance: value });
}

function migrateSkinProfiles() {
  if (!HOST_UI) return;
  const stored = HOST_UI.skinProfiles || {};
  for (const [choice, profile] of Object.entries(cachedAppearanceValue(SKIN_PROFILES_KEY))) {
    if (!Object.hasOwn(stored, choice) && !Object.hasOwn(localSkinProfiles, choice)) saveSkinProfile(choice, profile);
  }
  if (!HOST_UI.appearance && !HOST_UI.skinBackgrounds && !Object.values(legacyBackgroundAssets).some(Boolean)) return;
  const profiles = skinProfiles();
  for (const skin of new Set(['default', 'clawd', currentSkin()])) {
    const choice = 'builtin:' + skin;
    if (!Object.hasOwn(profiles, choice)) saveSkinProfile(choice, profileForSkin(choice));
  }
  const active = HOST_UI?.skinChoice;
  if (active?.startsWith('user:') && Object.hasOwn(legacyUserSkins(), active.slice(5)) && !Object.hasOwn(profiles, active)) {
    saveSkinProfile(active, profileForSkin(active));
  }
}

function updateSkinBackground(choice, layers) {
  const active = choice === currentSkinChoice();
  const profile = active ? { skin: currentSkin(), appearance: currentAppearance() } : profileForSkin(choice);
  const background = { ...profile.appearance.background };
  for (const [area, patch] of Object.entries(layers)) background[area] = { ...background[area], ...patch };
  const next = normalizeAppearance({ ...profile.appearance, background }, skinDefaults(profile.skin));
  if (active) {
    applyAppearance(next);
    return next;
  }
  if (!choice.startsWith('user:') || Object.hasOwn(userSkins(), choice.slice(5))) {
    saveSkinProfile(choice, { skin: profile.skin, appearance: next });
  }
  return null;
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
const BACKGROUND_PENDING = Object.create(null);

async function hydrateBackgrounds(appearance, onlyAreas) {
  const areas = Array.isArray(onlyAreas) && onlyAreas.length > 0 ? onlyAreas : ['planning', 'study'];
  const tasks = areas.map(async (area) => {
    const layer = appearance && appearance.background && appearance.background[area];
    const url = layer && layer.imageUrl;
    if (!url || layer.mode !== 'image') return { area, ok: true, skipped: true };
    if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
    const absolute = (() => {
      try {
        const base = (typeof document !== 'undefined' && document.baseURI) || 'http://dsh.internal/'
        return new URL(url, base).toString()
      } catch {
        return url
      }
    })()
    if (!BACKGROUND_PENDING[url]) {
      BACKGROUND_PENDING[url] = fetch(absolute).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!blob || blob.size === 0) throw new Error('empty image');
        return blob;
      }).finally(() => { delete BACKGROUND_PENDING[url]; });
    }
    try {
      const blob = await BACKGROUND_PENDING[url];
      if (currentAppearance().background[area]?.imageUrl !== url) return { area, ok: true, skipped: true };
      if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
      if (BACKGROUND_BLOBS[area]) URL.revokeObjectURL(BACKGROUND_BLOBS[area]);
      BACKGROUND_BLOBS[area] = URL.createObjectURL(blob);
      BACKGROUND_SOURCES[area] = url;
      return { area, ok: true };
    } catch (error) {
      console.error('[life-planner] background could not be loaded', area, error);
      return { area, ok: false };
    }
  });
  const results = await Promise.all(tasks);
  const current = CURRENT_APPEARANCE;
  if (current && results.some(({ area, ok, cached, skipped }) => ok && !cached && !skipped &&
    current.background[area].mode === 'image' && current.background[area].imageUrl === BACKGROUND_SOURCES[area])) {
    applyAppearance(current, { persist: false });
  }
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
  return 'color-mix(in srgb, var(--dsw-alias-bg-base) ' + Math.round(alpha * 100) + '%, transparent)';
}

function accentInk(color) {
  const [r, g, b] = color.slice(1).match(/../g).map((pair) => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 0.179 ? '#171717' : '#ffffff';
}

function applyAppearance(value, { persist = true } = {}) {
  if (typeof document === 'undefined') return;
  const appearance = persist
    ? normalizeAppearance(value || loadAppearance(), skinDefaults(currentSkin()))
    : value || loadAppearance();
  CURRENT_APPEARANCE = appearance;
  const { font, size, accent, background, layout } = appearance;
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
  const surfaceBase = 'var(--lp-surface-base, var(--dsw-alias-bg-base))';
  const spacing = { compact: [12, 8, 11], standard: [16, 12, 17], roomy: [22, 16, 23] }[layout.spacing];
  const fontFamily = layout.fontFamily === 'serif'
    ? 'Georgia, "Songti SC", "Noto Serif CJK SC", "SimSun", serif' : 'inherit';
  const css = [];
  const px = (value, fallback) => `${Number(value) || fallback}px`;
  css.push(
    `.lp-page{--lp-fs:${px(font.base, 13)};--lp-font-family:${fontFamily};` +
      `--lp-content-pad:${spacing[0]}px;--lp-layout-gap:${spacing[1]}px;` +
      (layout.studyPlan === 'stacked' ? '--lp-study-plan-cols:minmax(0,1fr);--lp-study-plan-spacer:none;' : '') +
      (layout.studyToday === 'auto' ? '--lp-study-today-cols:minmax(0,1.65fr) minmax(0,1fr);' : '') +
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
      (size.mistakeColumns > 0 ? `--lp-mistake-cols:${size.mistakeColumns};` : '') +
      `--lp-mistake-h:${Number(size.mistakeHeight) > 0 ? `${Math.round(Number(size.mistakeHeight))}px` : 'auto'};` +
      // Row and tag heights follow their text instead of being hand-tuned.
      `--lp-row:${Math.round((Number(font.task) || 13) + spacing[2])}px;` +
      `--lp-tag-h:${Math.round((Number(font.tag) || 12) + 10)}px;` +
      `--lp-cal-h:${Number(size.calendarHeight) > 0 ? `${Number(size.calendarHeight)}px` : '420px'};}`,
  );
  for (const area of APPEARANCE_AREAS) {
    if (!accent[area]) continue;
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    css.push(`${selector}{--lp-accent:${accent[area]};--lp-accent-ink:${accentInk(accent[area])};--dsw-alias-brand-primary:${accent[area]};}`);
  }
  for (const area of ['planning', 'study']) {
    const layer = background[area] || {};
    const mask = layer.mask || { on: false };
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    const source = layer.mode === 'image'
      ? (BACKGROUND_SOURCES[area] === layer.imageUrl && BACKGROUND_BLOBS[area]) || layer.imageUrl : '';
    const solid = layer.mode === 'color' && layer.color ? layer.color : '';
    const keep = Math.round((1 - appearance.surface) * 100);
    const surface = `color-mix(in srgb, ${surfaceBase} ${keep}%, transparent)`;
    if (!source) {
      // A solid fill still paints, so only the image layers are cleared.
      css.push(
        `${selector}{--lp-bg-image:none;--lp-bg-overlay:none;--lp-bg-fade:none;` +
          `--lp-bg-color:${solid || 'var(--lp-preset-page-bg, var(--dsw-alias-bg-base))'};` +
          `--lp-surface-bg:${solid ? surface : surfaceBase};` +
          `--lp-control-bg:var(--dsw-alias-bg-layer-1);` +
          `--lp-modal-bg:var(--dsw-alias-bg-base);}`,
      );
      continue;
    }
    // Panels over a background go translucent so the image stays visible.
    // Controls sit on top of panels and are small, so they need a much lighter
    // fill: 45% of the base colour reads as translucent, 85% looks solid.
    const keepControl = 45;
    // `background-image` only accepts images, so a tint must be a gradient:
    // a bare colour there invalidates the whole declaration.
    const tint = mix(Math.round((1 - layer.opacity) * 100));
    const overlay = `linear-gradient(${tint}, ${tint})`;
    const fade = maskGradient(mask);
    css.push(
      `${selector}{--lp-surface-bg:${surface};` +
        `--lp-control-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keepControl}%, transparent);` +
        // Dialogs stay almost opaque so the page behind cannot distract reading or input.
        `--lp-modal-bg:color-mix(in srgb, var(--dsw-alias-bg-base) 97%, transparent);` +
        `--lp-bg-color:var(--dsw-alias-bg-base);--lp-bg-image:url("${source}");--lp-bg-overlay:${overlay};--lp-bg-fade:${fade};}`,
    );
  }
  sheet.textContent = css.join('\n');
  document.documentElement.dataset.lpAccent = accent.planning || accent.study ? 'custom' : 'default';
  document.documentElement.dataset.lpMistakeFixed = String(size.mistakeHeight > 0);
  if (persist) {
    saveAppearance(appearance);
  }
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

function legacyUserSkins() {
  return { ...cachedAppearanceValue(USER_SKINS_KEY), ...HOST_UI?.skins };
}

function userSkins() {
  const skins = legacyUserSkins();
  for (const [choice, profile] of Object.entries(skinProfiles())) {
    if (!choice.startsWith('user:')) continue;
    const name = choice.slice(5);
    if (profile === null) delete skins[name];
    else Object.defineProperty(skins, name, { value: profile, configurable: true, enumerable: true });
  }
  return skins;
}

function listSkinOptions(t) {
  const options = [
    { value: 'builtin:default', label: t('skinDefault') },
    { value: 'builtin:clawd', label: t('skinClawd') },
  ];
  if (!['default', 'clawd'].includes(currentSkin())) {
    options.push({ value: `builtin:${currentSkin()}`, label: skinLabel(currentSkin()) });
  }
  for (const name of Object.keys(userSkins())) options.push({ value: `user:${name}`, label: name });
  return options;
}

function saveUserSkin(name, profile = { skin: currentSkin(), appearance: currentAppearance() }) {
  const clean = Array.from(String(name || '').trim()).slice(0, 24).join('');
  if (!clean || /[\u0000-\u001f]/.test(clean)) throw new Error('invalid skin name');
  saveSkinProfile(`user:${clean}`, { skin: profile.skin, appearance: cloneAppearance(profile.appearance) });
  return clean;
}

function deleteUserSkin(name) {
  if (!Object.hasOwn(userSkins(), name)) return false;
  saveSkinProfile(`user:${name}`, null);
  return true;
}

function applySkinChoice(value) {
  if (value.startsWith('user:') && !Object.hasOwn(userSkins(), value.slice(5))) return currentAppearance();
  const profile = profileForSkin(value);
  rememberSkinChoice(value);
  applySkin(profile.skin);
  applyAppearance(profile.appearance, { persist: false });
  return profile.appearance;
}

function readImageData(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function exportAppearance(name) {
  const skin = currentSkin();
  const appearance = cloneAppearance(currentAppearance());
  const urls = new Set(Object.values(appearance.background).map((layer) => layer.imageUrl).filter(
    (url) => url && url !== BUILTIN_BACKGROUND_URL,
  ));
  const assets = {};
  for (const url of urls) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    assets[url] = await readImageData(await response.blob());
  }
  return JSON.stringify({ version: 2, name, skin, appearance, assets }, null, 2);
}

async function importAppearance(text, fallbackName, legacySkin) {
  const parsed = JSON.parse(text);
  const incoming = parsed?.appearance || parsed;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming) ||
    !Object.keys(APPEARANCE_DEFAULTS).some((section) => Object.hasOwn(incoming, section))) {
    throw new Error('invalid appearance file');
  }
  const skin = parsed.version === 2 && Object.hasOwn(SKINS, parsed.skin) ? parsed.skin : legacySkin;
  const appearance = normalizeAppearance(incoming, skinDefaults(skin));
  if (parsed.version === 2) {
    const images = new Map();
    for (const area of APPEARANCE_AREAS) {
      const layer = appearance.background[area];
      const oldUrl = skinImageUrl(incoming.background?.[area]?.imageUrl);
      if (!oldUrl || oldUrl === BUILTIN_BACKGROUND_URL) continue;
      const dataUrl = parsed.assets?.[oldUrl];
      if (typeof dataUrl !== 'string' || !/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(dataUrl)) {
        throw new Error('skin file is missing a background image');
      }
      if (!images.has(oldUrl)) {
        const saved = await api('background.set', { area, dataUrl, forPreset: true });
        images.set(oldUrl, saved.url);
      }
      layer.imageUrl = images.get(oldUrl);
    }
  }
  const desired = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallbackName;
  const names = userSkins();
  let name = Array.from(desired).slice(0, 24).join('');
  for (let index = 2; Object.hasOwn(names, name); index += 1) {
    const suffix = ' ' + index;
    name = Array.from(desired).slice(0, 24 - suffix.length).join('') + suffix;
  }
  return saveUserSkin(name, { skin, appearance });
}
