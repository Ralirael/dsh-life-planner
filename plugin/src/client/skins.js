// Skins use their own stylesheet. The saved appearance stays independent.
const LP_SKIN_STORAGE = 'lpSkin';
const LP_SKIN_CHOICE = 'lpSkinChoice.v1';
let selectedSkin;
let selectedSkinChoice;
let skinPreferenceChanged = false;

const SKINS = {
  default: { label: '默认' },
  clawd: { label: 'Clawd' },
  compact: {
    label: '紧凑',
    values: {
      '--lp-fs': '12px',
      '--lp-fs-lg': '13px',
      '--lp-fs-sm': '11px',
      '--lp-h': '24px',
      '--lp-row': '26px',
      '--lp-pad': '12px',
      '--lp-gap': '6px',
      '--lp-r': '6px',
      '--lp-r-sm': '4px',
      '--lp-r-lg': '10px',
    },
  },
  large: {
    label: '大字',
    values: {
      '--lp-fs': '14px',
      '--lp-fs-lg': '16px',
      '--lp-fs-sm': '12px',
      '--lp-h': '32px',
      '--lp-row': '34px',
      '--lp-pad': '20px',
      '--lp-gap': '10px',
      '--lp-r': '10px',
      '--lp-r-sm': '6px',
      '--lp-r-lg': '16px',
    },
  },
};

const CLAWD_CSS = `
html[data-lp-skin="clawd"] .lp-page {
  --lp-clawd-base-accent: #a35039;
  --lp-clawd-surface: #fff3e8;
  --lp-clawd-accent: var(--lp-accent, var(--lp-clawd-base-accent));
  --lp-clawd-on-accent: var(--lp-accent-ink, #fff9f3);
  --lp-clawd-outline: color-mix(in srgb, var(--lp-clawd-accent) 22%, var(--dsw-alias-border-l2));
  --lp-clawd-tint: color-mix(in srgb, var(--lp-clawd-accent) 13%, transparent);
  --lp-surface-base: color-mix(in srgb, var(--lp-clawd-surface) 22%, var(--dsw-alias-bg-base));
  --lp-clawd-card: var(--lp-surface-bg, var(--lp-surface-base));
  --lp-preset-page-bg: color-mix(in srgb, var(--lp-clawd-surface) 28%, var(--dsw-alias-bg-base));
  --dsw-alias-brand-primary: var(--lp-clawd-accent);
  --lp-r: 9px;
  --lp-r-lg: 13px;
}
html[data-lp-skin="clawd"] .lp-page[data-scheme="dark"] {
  --lp-clawd-base-accent: #f29b78;
  --lp-clawd-surface: #342620;
  --lp-clawd-on-accent: var(--lp-accent-ink, #2b1812);
}
html[data-lp-skin="clawd"] .lp-page .lp-head {
  border-color: var(--lp-clawd-outline);
  background: color-mix(in srgb, var(--lp-clawd-surface) 84%, transparent);
  gap: 8px;
  padding-block: 8px;
}
html[data-lp-skin="clawd"] .lp-page .lp-head .lp-tab {
  min-height: 31px;
  padding-inline: 11px;
}
html[data-lp-skin="clawd"] .lp-page .lp-grid {
  gap: 4px;
  padding: 0 10px 10px;
}
html[data-lp-skin="clawd"] .lp-page .lp-cell {
  border: 1px solid var(--lp-clawd-outline);
  border-radius: var(--lp-r);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-weekend="true"]:not([data-selected="true"]) {
  background: color-mix(in srgb, var(--lp-clawd-surface) 56%, transparent);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-dim="true"] {
  border-color: color-mix(in srgb, var(--lp-clawd-outline) 55%, transparent);
}
html[data-lp-skin="clawd"] .lp-page .lp-tab[data-active="true"],
html[data-lp-skin="clawd"] .lp-page .lp-settings-nav-button[aria-current="page"],
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-selected="true"],
html[data-lp-skin="clawd"] .lp-page .lp-weekcell[data-selected="true"] {
  background: var(--lp-clawd-tint);
  border-color: var(--lp-clawd-outline);
}
html[data-lp-skin="clawd"] .lp-page :is(.lp-cal-sticky, .lp-card, .lp-col-head, .lp-weather-details > div, .lp-settings-group) {
  border-color: var(--lp-clawd-outline);
  background: var(--lp-clawd-card);
}
html[data-lp-skin="clawd"] .lp-page[data-scheme="light"] .lp-backdrop:has(> .lp-settings) {
  background: rgba(24, 17, 13, 0.36);
}
html[data-lp-skin="clawd"] .lp-page :is(.lp-cal-bar, .lp-group-head, .lp-settings-nav) {
  border-color: var(--lp-clawd-outline);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-today="true"] {
  box-shadow: inset 0 0 0 1px var(--lp-clawd-accent);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-today="true"] .lp-num {
  padding-inline: .34em;
  border-radius: 6px;
  background: var(--lp-clawd-accent);
  color: var(--lp-clawd-on-accent);
}
html[data-lp-skin="clawd"] .lp-page .lp-btn {
  color: var(--lp-clawd-on-accent);
  background: var(--lp-clawd-accent);
  border-color: var(--lp-clawd-accent);
}
`;

function currentSkin() {
  if (selectedSkin) return selectedSkin;
  try {
    const name = localStorage.getItem(LP_SKIN_STORAGE) || 'default';
    return Object.hasOwn(SKINS, name) ? name : 'default';
  } catch {
    return 'default';
  }
}

function currentSkinChoice() {
  if (selectedSkinChoice) return selectedSkinChoice;
  try {
    const choice = localStorage.getItem(LP_SKIN_CHOICE);
    if (choice?.startsWith('user:') && choice.length > 5) return choice;
    if (choice?.startsWith('builtin:') && Object.hasOwn(SKINS, choice.slice(8))) return choice;
  } catch {}
  return `builtin:${currentSkin()}`;
}

function rememberSkinChoice(choice) {
  selectedSkinChoice = choice;
  try { localStorage.setItem(LP_SKIN_CHOICE, choice); } catch {}
}

function applySkin(name) {
  selectedSkin = Object.hasOwn(SKINS, name) ? name : 'default';
  if (typeof document === 'undefined') return selectedSkin;
  const skin = SKINS[selectedSkin];
  // Tokens live on `.lp-page`, so the override sheet must target it as well;
  // setting them on <html> would be shadowed by the page's own declarations.
  let sheet = document.getElementById('life-planner-skin');
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.id = 'life-planner-skin';
    document.head.appendChild(sheet);
  }
  const body = Object.entries(skin.values || {})
    .map(([key, value]) => `${key}:${value};`)
    .join('');
  sheet.textContent = selectedSkin === 'clawd' ? CLAWD_CSS : body ? `.lp-page{${body}}` : '';
  document.documentElement.dataset.lpSkin = selectedSkin;
  try {
    localStorage.setItem(LP_SKIN_STORAGE, selectedSkin);
  } catch {
    // Storage may be unavailable; the skin still applies for this session.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('lp-skin-change'));
  return selectedSkin;
}

function restoreHostSkin(name, choice) {
  if (skinPreferenceChanged || !Object.hasOwn(SKINS, name)) return;
  const builtin = `builtin:${name}`;
  const saved = typeof choice === 'string' && choice.startsWith('user:') && Object.hasOwn(userSkins(), choice.slice(5));
  const selected = saved ? choice : builtin;
  rememberSkinChoice(selected);
  applySkin(profileForSkin(selected).skin);
}

function saveActiveSkin() {
  skinPreferenceChanged = true;
  const activeSkin = currentSkin();
  const skinChoice = currentSkinChoice();
  return flushAppearanceSave({ activeSkin, skinChoice });
}
