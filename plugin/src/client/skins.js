// Skin layer: presets only override tokens, never layout code.
// Add a preset here and it becomes selectable in settings.
const LP_SKIN_STORAGE = 'lpSkin';

const SKINS = {
  default: { label: '默认' },
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

function currentSkin() {
  try {
    const name = localStorage.getItem(LP_SKIN_STORAGE) || 'default';
    return SKINS[name] ? name : 'default';
  } catch {
    return 'default';
  }
}

function applySkin(name) {
  if (typeof document === 'undefined') return name;
  const skin = SKINS[name] || SKINS.default;
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
  sheet.textContent = body ? `.lp-page{${body}}` : '';
  document.documentElement.dataset.lpSkin = name;
  try {
    localStorage.setItem(LP_SKIN_STORAGE, name);
  } catch {
    // Storage may be unavailable; the skin still applies for this session.
  }
  return name;
}
