const DIALOG_CSS = `
.lp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: clamp(10px, 2.5vw, 24px);
  background: rgba(0, 0, 0, .44);
}

.lp-page .lp-modal {
  --lp-dialog-width: 550px;
  --lp-dialog-padding: clamp(12px, 2.3vw, 18px);
  --lp-dialog-surface: var(--lp-modal-bg, var(--dsw-alias-bg-base));
  --lp-dialog-muted: color-mix(in srgb, var(--lp-dialog-surface) 94%, var(--dsw-alias-label-primary));
  --lp-dialog-line: var(--lp-workspace-line);
  --lp-dialog-text-muted: var(--lp-workspace-text-muted);
  --lp-dialog-accent: var(--lp-workspace-accent);
  --lp-dialog-on-accent: var(--lp-workspace-on-accent);
  --lp-dialog-accent-fill: color-mix(in srgb, var(--lp-dialog-accent) 12%, var(--lp-dialog-surface));
  --lp-dialog-motion: var(--lp-workspace-motion);
  --lp-dialog-font: var(--lp-fs, 16px);
  --lp-dialog-meta: var(--lp-meta-fs, 14px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: min(var(--lp-dialog-width), 100%);
  max-height: min(88vh, 760px);
  min-width: 0;
  padding: 0;
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--lp-dialog-line);
  border-radius: var(--lp-r-lg, 12px);
  background: var(--lp-dialog-surface);
  box-shadow: 0 14px 44px rgba(0, 0, 0, .22);
  font-size: var(--lp-dialog-font);
}

.lp-page .lp-item-editor { --lp-dialog-width: 530px; }
.lp-page .lp-confirm-modal { --lp-dialog-width: 390px; }
.lp-page .lp-mistake-preview { --lp-dialog-width: 680px; }
.lp-page .lp-settings { --lp-dialog-width: 700px; }

.lp-modal-heading,
.lp-modal-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px 9px;
  padding-inline: var(--lp-dialog-padding);
}

.lp-modal-heading {
  justify-content: space-between;
  padding-block: 11px;
  border-bottom: 1px solid var(--lp-dialog-line);
}

.lp-modal-heading .lp-modal-title {
  min-width: 0;
  margin: 0;
  font-size: var(--lp-title-fs, 24px);
  font-weight: 650;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.lp-dialog-version {
  flex: none;
  color: var(--lp-dialog-text-muted);
  font-size: var(--lp-dialog-meta);
  font-variant-numeric: tabular-nums;
}

.lp-modal-body {
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding: 12px var(--lp-dialog-padding);
  overflow: auto;
  overscroll-behavior: contain;
}

.lp-modal-body > * { flex-shrink: 0; }

.lp-modal > .lp-modal-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  margin: 0;
  padding: 8px var(--lp-dialog-padding);
  border-top: 1px solid var(--lp-dialog-line);
  background: color-mix(in srgb, var(--lp-dialog-muted) 55%, var(--lp-dialog-surface));
}

.lp-modal-actions .lp-dialog-side-action { margin-inline-end: auto; }

.lp-page .lp-modal :is(.lp-input, .lp-select, .lp-dd-btn, .lp-btn, .lp-btn-ghost) {
  min-height: 30px;
  font-size: var(--lp-dialog-font);
  transition: background-color var(--lp-dialog-motion), border-color var(--lp-dialog-motion), box-shadow var(--lp-dialog-motion);
}

.lp-page .lp-modal :is(.lp-input, .lp-select, .lp-dd-btn) {
  min-width: 0;
  max-width: 100%;
  background: var(--lp-dialog-surface) !important;
  border-color: var(--lp-dialog-line);
  backdrop-filter: none;
}

.lp-page .lp-modal .lp-field :is(.lp-input, .lp-select) { width: 100%; }

.lp-page .lp-modal :is(.lp-input, .lp-select, .lp-dd-btn):focus-visible {
  border-color: var(--lp-dialog-accent);
  outline: 0;
  box-shadow: 0 0 0 2px var(--lp-dialog-accent-fill);
}

.lp-page .lp-modal input[type="range"].lp-input {
  min-height: 22px;
  padding: 0;
  accent-color: var(--lp-dialog-accent);
}

.lp-page .lp-modal .lp-input[type="color"] {
  padding-block: 3px;
  cursor: pointer;
}

.lp-modal textarea.lp-input {
  height: auto;
  resize: vertical;
}

.lp-page .lp-modal .lp-btn {
  color: var(--lp-dialog-on-accent);
  background: var(--lp-dialog-accent);
  border-color: var(--lp-dialog-accent);
}

.lp-page .lp-modal .lp-btn:not(:disabled):hover {
  background: color-mix(in srgb, var(--lp-dialog-accent) 90%, var(--dsw-alias-label-primary));
}

.lp-page .lp-modal .lp-btn-ghost:hover:not(:disabled) {
  background: var(--lp-dialog-muted);
}

.lp-page .lp-modal :is(.lp-btn, .lp-btn-ghost) {
  height: auto;
  white-space: normal;
  padding: 4px 10px;
}

.lp-modal .lp-field {
  min-width: 0;
  gap: 3px;
  color: var(--lp-dialog-text-muted);
  font-size: var(--lp-dialog-meta);
}

.lp-modal .lp-field > :is(label, span) {
  font-size: var(--lp-dialog-meta);
  overflow-wrap: anywhere;
}

.lp-page .lp-modal :is(.lp-meta, .lp-pop-list) {
  margin: 0;
  color: var(--lp-dialog-text-muted);
  font-size: var(--lp-dialog-meta);
  white-space: normal;
  overflow-wrap: anywhere;
}

.lp-modal .lp-pre-block {
  display: grid;
  gap: 4px;
}

.lp-modal .lp-pre-body {
  padding: 8px 10px;
  border: 1px solid var(--lp-dialog-line);
  border-radius: var(--lp-r, 8px);
  background: var(--lp-dialog-muted);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  line-height: 1.55;
}

.lp-modal :is(.lp-err, .lp-feedback) { margin: 0; }

.lp-modal .lp-dialog-grid,
.lp-modal .lp-row2,
.lp-settings .lp-setting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(182px, 100%), 1fr));
  gap: 8px 10px;
  align-items: start;
  min-width: 0;
}

.lp-dialog-stack,
.lp-dialog-options,
.lp-dialog-disclosure-body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.lp-dialog-options { gap: 6px; }

.lp-dialog-inline,
.lp-dialog-check,
.lp-modal .lp-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.lp-modal .lp-toolbar { padding: 0; border: 0; }
.lp-modal .lp-toolbar > .lp-input:not([type="range"]),
.lp-dialog-inline > .lp-input { flex: 1 1 min(120px, 100%); width: auto; }
.lp-modal .lp-toolbar > input[type="range"] { flex: 1 1 120px; width: auto; }
.lp-dialog-check input { margin: 0; }

.lp-dialog-disclosure {
  min-width: 0;
  border: 1px solid var(--lp-dialog-line);
  border-radius: var(--lp-r, 8px);
  background: var(--lp-dialog-surface);
}

.lp-dialog-disclosure > summary {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  min-height: 32px;
  padding: 5px 9px;
  gap: 8px;
  border-radius: inherit;
  background: color-mix(in srgb, var(--lp-dialog-muted) 48%, var(--lp-dialog-surface));
  cursor: pointer;
  list-style: none;
  font-weight: 550;
}

.lp-dialog-disclosure > summary:hover { background: var(--lp-dialog-muted); }
.lp-dialog-disclosure > summary::-webkit-details-marker { display: none; }
.lp-dialog-disclosure > summary .lp-chevron {
  color: var(--lp-dialog-text-muted);
  margin-inline: 1px 2px;
  transition: transform var(--lp-dialog-motion);
}
.lp-dialog-disclosure[open] > summary .lp-chevron { transform: rotate(45deg); }

.lp-dialog-disclosure-hint {
  flex: none;
  margin-inline-start: auto;
  color: var(--lp-dialog-text-muted);
  font-size: var(--lp-dialog-meta);
  font-weight: 400;
}

.lp-dialog-disclosure-body {
  padding: 9px;
  border-top: 1px solid var(--lp-dialog-line);
}

.lp-page .lp-settings > .lp-modal-body {
  padding: 0;
  overflow: hidden;
}

.lp-page .lp-settings .lp-settings-layout { flex: 1; flex-shrink: 1; }
.lp-settings-collections { grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); align-items: start; }
.lp-settings-classification > .lp-dialog-disclosure { grid-column: 1 / -1; }

@keyframes lp-dialog-fade { from { opacity: .65; } to { opacity: 1; } }

@media (prefers-reduced-motion: no-preference) {
  .lp-modal,
  .lp-dialog-disclosure[open] > .lp-dialog-disclosure-body {
    animation: lp-dialog-fade var(--lp-dialog-motion);
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('life-planner-dialog-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-dialog-styles';
  sheet.textContent = DIALOG_CSS;
  document.head.appendChild(sheet);
}
