const BOARD_CSS = `
.lp-page .lp-board-page {
  display: flex;
  overflow: hidden;
  padding: 0;
}

.lp-board {
  --lp-board-gap: 12px;
  --lp-board-lane-width: 170px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  max-width: 1440px;
  min-width: 0;
  margin-inline: auto;
  padding: 16px clamp(12px, 2.4vw, 24px) 12px;
}

.lp-board-toolbar,
.lp-board-filters,
.lp-board-hint,
.lp-board-keys {
  display: flex;
  align-items: center;
  min-width: 0;
}

.lp-board-toolbar {
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 0 1px 11px;
  border-bottom: 1px solid var(--lp-workspace-line);
}

.lp-board-filters {
  flex-wrap: wrap;
  max-width: 100%;
  gap: 6px;
}

.lp-board-filters .lp-dd {
  width: min(132px, 100%);
}

.lp-page .lp-board-filters :is(.lp-dd-btn, .lp-input, .lp-btn-ghost) {
  font-size: var(--lp-workspace-meta);
  min-height: 29px;
}

.lp-page .lp-board-filters input[type="date"] {
  width: min(150px, 100%);
  min-width: 0;
  flex: none;
}

.lp-board-hint {
  flex-wrap: wrap;
  gap: 4px 10px;
  font-size: var(--lp-workspace-meta);
  color: var(--lp-workspace-text-muted);
}

.lp-board-keys { gap: 3px; }

.lp-board-keys kbd {
  padding: 1px 5px;
  border: 1px solid var(--lp-workspace-line);
  border-radius: 4px;
  background: var(--lp-workspace-surface);
  font: inherit;
  font-size: max(10px, calc(var(--lp-workspace-meta) - 1px));
  line-height: 1.4;
}

.lp-board-scroll {
  flex: 1;
  min-height: 0;
  margin-inline: -3px;
  padding: 2px 3px 6px;
  overflow: auto;
  overscroll-behavior: contain;
  scroll-padding: 46px 10px 10px;
}

.lp-board-scroll:focus-visible {
  outline-offset: -2px;
  border-radius: var(--lp-r-sm, 6px);
}

.lp-board-lanes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--lp-board-gap);
  min-width: calc(4 * var(--lp-board-lane-width) + 3 * var(--lp-board-gap));
  min-height: clamp(236px, 49vh, 380px);
}

.lp-board .lp-col {
  --lp-board-status-color: var(--dsh-ui-icon-muted, var(--lp-workspace-text-muted));
  --lp-board-lane-surface: color-mix(in srgb, var(--lp-workspace-muted) 62%, var(--lp-workspace-surface));
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--lp-workspace-line);
  border-radius: var(--lp-r-lg, 12px);
  background: var(--lp-board-lane-surface);
  transition: border-color var(--lp-workspace-motion), background-color var(--lp-workspace-motion);
}

.lp-board .lp-col[data-column="doing"] { --lp-board-status-color: var(--lp-workspace-accent); }
.lp-board .lp-col[data-column="blocked"] {
  --lp-board-status-color: var(--dsh-ui-context-tool, var(--dsw-alias-state-warn-primary, var(--lp-workspace-text-muted)));
}
.lp-board .lp-col[data-column="done"] {
  --lp-board-status-color: var(--dsh-ui-running-foreground, var(--dsw-alias-state-success-primary, var(--lp-workspace-text-muted)));
}

.lp-board .lp-col[data-drop="inside"] {
  --lp-board-lane-surface: color-mix(in srgb, var(--lp-workspace-accent) 9%, var(--lp-workspace-surface));
  border-color: var(--lp-workspace-accent);
}

.lp-board .lp-col-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 10px;
  border-bottom: 1px solid var(--lp-workspace-line);
  border-radius: var(--lp-r-lg, 12px) var(--lp-r-lg, 12px) 0 0;
  background: var(--lp-board-lane-surface);
}

.lp-board .lp-col-head h2 {
  flex: 1;
  margin: 0;
  font-size: max(13px, calc(var(--lp-workspace-title) - 5px));
  font-weight: 650;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.lp-board-status,
.lp-board-count {
  display: grid;
  flex: none;
  place-items: center;
}

.lp-board-status {
  width: 24px;
  height: 24px;
  border-radius: var(--lp-r-sm, 6px);
  color: color-mix(in srgb, var(--lp-board-status-color) 80%, var(--lp-workspace-text-muted));
  background: color-mix(in srgb, var(--lp-board-status-color) 13%, var(--lp-board-lane-surface));
}

.lp-board-count {
  min-width: 16px;
  min-height: 19px;
  padding: 0 3px;
  border-radius: 999px;
  background: var(--lp-workspace-surface);
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
  font-variant-numeric: tabular-nums;
}

.lp-board-cards {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  padding: 8px;
}

.lp-board .lp-col-space {
  flex: 1;
  min-height: 34px;
}

.lp-board-empty {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  min-height: 62px;
  padding: 8px;
  border: 1px dashed color-mix(in srgb, var(--lp-board-status-color) 24%, var(--lp-workspace-line));
  border-radius: var(--lp-r, 8px);
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
  text-align: center;
}

.lp-board .lp-col[data-drop="inside"] .lp-board-empty {
  border-color: var(--lp-workspace-accent);
  color: var(--lp-workspace-accent);
}

.lp-board-create {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border: 1px solid transparent;
  border-radius: var(--lp-r-sm, 6px);
  background: transparent;
  color: var(--lp-workspace-text-muted);
  font: inherit;
  cursor: pointer;
  transition: background-color var(--lp-workspace-motion), color var(--lp-workspace-motion);
}

.lp-board-create:hover {
  background: var(--lp-workspace-accent-fill);
  color: var(--lp-workspace-accent);
}

.lp-board-create span { font-size: 16px; line-height: 1; }

.lp-board .lp-card {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  gap: 7px;
  padding: 10px;
  border-color: var(--lp-workspace-line);
  background: var(--lp-workspace-surface);
  cursor: grab;
  transition: border-color var(--lp-workspace-motion), box-shadow var(--lp-workspace-motion), opacity var(--lp-workspace-motion);
}

.lp-board:not([data-dragging="true"]) .lp-card:hover {
  border-color: color-mix(in srgb, var(--lp-workspace-accent) 40%, var(--lp-workspace-line));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--lp-workspace-text-muted) 10%, transparent);
}

.lp-board .lp-card[data-done="true"] { opacity: 1; }
.lp-board .lp-card[data-done="true"] .lp-card-title { color: var(--lp-workspace-text-muted); }
.lp-board .lp-card[data-dragging="true"] { opacity: .5; cursor: grabbing; }

.lp-board .lp-card::after {
  position: absolute;
  inset-inline: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: var(--lp-workspace-accent);
  opacity: 0;
  content: '';
  pointer-events: none;
  transition: opacity var(--lp-workspace-motion);
}

.lp-board .lp-card[data-drop="before"]::after { top: -6px; bottom: auto; }
.lp-board .lp-card[data-drop]::after { opacity: 1; }

.lp-board-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
}

.lp-board .lp-card-title {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: max(12px, calc(var(--lp-task-fs, 20px) - 5px));
  font-weight: 650;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
}

.lp-board .lp-card-prio {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  padding: 1px 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--lp-board-priority) 15%, var(--lp-workspace-surface));
  color: var(--lp-workspace-text-muted);
  font-size: max(10px, calc(var(--lp-workspace-meta) - 1px));
  font-variant-numeric: tabular-nums;
}

.lp-board .lp-card-prio::before {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lp-board-priority);
  content: '';
}

.lp-board-labels,
.lp-board-deadline {
  display: flex;
  align-items: center;
  gap: 3px 4px;
  max-width: 100%;
}

.lp-board-labels { flex-wrap: wrap; }

.lp-page .lp-board :is(.lp-board-labels .lp-meta, .lp-board-deadline) {
  font-size: var(--lp-workspace-meta);
}

.lp-board-labels :is(.lp-tag, .lp-type, .lp-meta) {
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-board-labels .lp-type { font-size: max(10px, calc(var(--lp-type-fs, 20px) - 9px)); }
.lp-board-labels .lp-tag { font-size: max(10px, calc(var(--lp-tag-fs, 20px) - 9px)); }

.lp-board-deadline {
  font-variant-numeric: tabular-nums;
  white-space: normal;
}

.lp-board-deadline svg { flex: none; }

@media (prefers-reduced-motion: no-preference) {
  .lp-board-lanes { animation: lp-workspace-enter var(--lp-workspace-motion) backwards; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('life-planner-board-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-board-styles';
  sheet.textContent = BOARD_CSS;
  document.head.appendChild(sheet);
}
