const VIEW_SURFACES_CSS = `
.lp-page {
  --lp-workspace-accent: var(--lp-accent, var(--dsw-alias-brand-primary));
  --lp-workspace-on-accent: var(--lp-clawd-on-accent, var(--lp-accent-ink, var(--dsw-alias-bg-base)));
  --lp-workspace-surface: var(--lp-clawd-card, var(--lp-surface-bg, var(--dsw-alias-bg-base)));
  --lp-workspace-muted: color-mix(in srgb, var(--lp-workspace-surface) 95%, var(--dsw-alias-label-primary));
  --lp-workspace-accent-fill: color-mix(in srgb, var(--lp-workspace-accent) 12%, var(--lp-workspace-surface));
  --lp-workspace-text-muted: var(--dsw-alias-label-secondary);
  --lp-workspace-line: var(--lp-clawd-outline, var(--dsw-alias-border-l2));
  --lp-workspace-motion: 180ms ease;
  --lp-workspace-title: var(--lp-title-fs, 24px);
  --lp-workspace-body: var(--lp-fs, 16px);
  --lp-workspace-meta: var(--lp-meta-fs, 14px);
}

.lp-page .lp-workspace-primary {
  color: var(--lp-workspace-on-accent);
  background: var(--lp-workspace-accent);
  border-color: var(--lp-workspace-accent);
}

.lp-workspace-card {
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--lp-workspace-line);
  border-radius: var(--lp-r-lg, 12px);
  background: var(--lp-workspace-surface);
}

.lp-empty-symbol {
  display: grid;
  flex: none;
  place-items: center;
  width: 35px;
  height: 35px;
  border-radius: var(--lp-r, 8px);
  background: var(--lp-workspace-accent-fill);
  color: var(--lp-workspace-accent);
}

.lp-workspace-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lp-workspace-text-muted);
}

.lp-chevron {
  display: inline-block;
  box-sizing: border-box;
  flex: none;
  width: 6px;
  height: 6px;
  border: solid currentColor;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.lp-chevron[data-direction="right"] { transform: rotate(-45deg); }

@keyframes lp-workspace-enter {
  from { opacity: .7; }
  to { opacity: 1; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('life-planner-workspace-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-workspace-styles';
  sheet.textContent = VIEW_SURFACES_CSS;
  document.head.appendChild(sheet);
}
