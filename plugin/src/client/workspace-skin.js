const WORKSPACE_CSS = `
/* The planning and study surfaces share the host palette and rhythm. */
.lp-workspace-head,
.lp-calendar-layout,
.lp-board,
.lp-tree-workspace,
.lp-study-overview {
  --lp-workspace-accent: var(--lp-accent, var(--dsh-ui-accent, var(--dsw-alias-brand-primary)));
  --lp-workspace-accent-fill: color-mix(in srgb, var(--lp-workspace-accent) 13%, var(--dsh-ui-surface, var(--dsw-alias-bg-layer-2)));
  --lp-workspace-on-accent: var(--dsh-ui-accent-foreground, var(--dsw-alias-bg-base));
  --lp-workspace-surface: color-mix(in srgb, var(--lp-surface-bg, var(--dsw-alias-bg-base)) 66%, var(--dsh-ui-surface, var(--dsw-alias-bg-layer-2)));
  --lp-workspace-muted: var(--dsh-ui-muted, var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-1)));
  --lp-workspace-text-muted: var(--dsh-ui-text-muted, var(--dsw-alias-label-secondary));
  --lp-workspace-line: var(--dsh-ui-border, var(--dsw-alias-border-l2));
  --lp-workspace-motion: var(--dsh-ui-motion, 210ms cubic-bezier(.23, .72, .26, 1));
  --lp-workspace-title: max(16px, calc(var(--lp-title-fs, 24px) - 4px));
  --lp-workspace-body: max(12px, calc(var(--lp-fs, 16px) - 2px));
  --lp-workspace-meta: max(11px, calc(var(--lp-meta-fs, 16px) - 4px));
}

.lp-page .lp-workspace-head {
  padding: 8px clamp(12px, 2.2vw, 24px);
  gap: 6px;
  border-color: var(--dsh-ui-toolbar-border, var(--lp-workspace-line));
}

.lp-page .lp-workspace-head > .lp-btn-ghost {
  height: 29px;
  padding-inline: 9px;
  gap: 5px;
  font-size: 13px;
}

.lp-page .lp-workspace-head .lp-tab {
  min-height: calc(var(--lp-tab-fs, 13px) + 15px);
  padding-inline: 10px;
  transition: background-color var(--lp-workspace-motion), color var(--lp-workspace-motion), border-color var(--lp-workspace-motion);
}

.lp-page .lp-workspace-head .lp-tab:hover {
  background: var(--lp-workspace-muted);
}

.lp-page .lp-workspace-head .lp-tab[data-active="true"] {
  background: var(--lp-workspace-accent-fill);
  border-color: color-mix(in srgb, var(--lp-workspace-accent) 36%, var(--lp-workspace-line));
}

.lp-page .lp-workspace-primary:is(.lp-btn, .lp-btn-ghost) {
  color: var(--lp-workspace-on-accent);
  background: var(--lp-workspace-accent);
  border-color: var(--lp-workspace-accent);
}

.lp-page .lp-workspace-primary:is(.lp-btn, .lp-btn-ghost):hover:not(:disabled) {
  background: color-mix(in srgb, var(--lp-workspace-accent) 90%, var(--dsh-ui-text, var(--dsw-alias-label-primary)));
}

.lp-page .lp-workspace-primary:is(.lp-btn, .lp-btn-ghost):disabled {
  opacity: 1;
  background: var(--lp-workspace-muted);
  color: var(--lp-workspace-text-muted);
  border-color: var(--lp-workspace-line);
}

.lp-workspace-plus {
  font-size: 16px;
  line-height: 1;
}

.lp-workspace-card {
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--lp-workspace-line);
  border-radius: var(--lp-r-lg, 12px);
  background: var(--lp-workspace-surface);
}

.lp-workspace-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: var(--lp-workspace-body);
  color: var(--lp-workspace-text-muted);
}

.lp-workspace-empty p {
  margin: 0;
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

.lp-chevron[data-direction="up"] { transform: rotate(225deg); }
.lp-chevron[data-direction="left"] { transform: rotate(135deg); }
.lp-chevron[data-direction="right"] { transform: rotate(-45deg); }

.lp-cal-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overflow-anchor: none;
  overscroll-behavior: contain;
}

.lp-calendar-layout,
.lp-study-overview-layout {
  width: 100%;
  max-width: 1180px;
  box-sizing: border-box;
  margin-inline: auto;
  padding: 18px clamp(12px, 2.4vw, 24px) 28px;
}

.lp-calendar-layout[data-layout="split"] {
  display: grid;
  align-items: start;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(248px, 31%);
}

.lp-cal-sticky {
  position: sticky;
  top: 8px;
  z-index: 5;
  height: var(--lp-month-height, 420px);
  overflow: clip;
  transition: height var(--lp-workspace-motion);
}

.lp-cal-sticky[data-collapsed="true"] {
  height: 64px;
}

.lp-cal-month,
.lp-cal-week {
  position: absolute;
  inset: 0;
  display: flex;
  opacity: 1;
  transition: opacity var(--lp-workspace-motion), visibility var(--lp-workspace-motion);
}

.lp-cal-month {
  height: var(--lp-month-height, 420px);
  flex-direction: column;
}

.lp-cal-month[aria-hidden="true"],
.lp-cal-week[aria-hidden="true"] {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.lp-cal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 49px;
  padding: 0 42px 0 14px;
  border-bottom: 1px solid var(--lp-workspace-line);
}

.lp-cal-title {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--lp-workspace-title);
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
}

.lp-cal-side,
.lp-month-nav {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
}

.lp-month-nav {
  flex: none;
  gap: 2px;
  background: var(--lp-workspace-muted);
  padding: 2px;
  border-radius: var(--lp-r, 8px);
}

.lp-month-nav .lp-iconbtn,
.lp-cal-disclosure,
.lp-day-edit {
  display: grid;
  flex: none;
  place-items: center;
  width: 25px;
  height: 25px;
  border-color: transparent;
  color: var(--lp-workspace-text-muted);
  transition: background-color var(--lp-workspace-motion), color var(--lp-workspace-motion);
}

.lp-month-nav .lp-iconbtn:hover,
.lp-cal-disclosure:hover,
.lp-day-edit:hover {
  background: var(--lp-workspace-accent-fill);
  color: var(--lp-workspace-accent);
}

.lp-cal-disclosure {
  position: absolute;
  z-index: 1;
  top: 12px;
  right: 9px;
}

.lp-cal-disclosure .lp-chevron {
  transition: transform var(--lp-workspace-motion);
}

.lp-cal-sticky[data-collapsed="true"] .lp-cal-disclosure { top: 19px; }

.lp-page .lp-cal-side .lp-cal-today,
.lp-page .lp-cal-side .lp-weather-trigger,
.lp-page .lp-day-title .lp-weather-trigger {
  height: 29px;
  min-height: 29px;
  flex: none;
  padding-inline: 7px;
  font-size: var(--lp-workspace-meta);
  background: transparent;
}

.lp-page .lp-cal-side .lp-cal-today:hover,
.lp-page .lp-cal-side .lp-weather-trigger:hover,
.lp-page .lp-day-title .lp-weather-trigger:hover {
  background: var(--lp-workspace-muted);
}

.lp-wd,
.lp-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
  padding-inline: 10px;
}

.lp-wd {
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
  padding-block: 8px 5px;
  text-align: center;
}

.lp-grid {
  padding-bottom: 12px;
  grid-template-rows: repeat(6, minmax(0, 1fr));
  min-height: 0;
  flex: 1;
}

.lp-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 5px;
  border: 1px solid color-mix(in srgb, var(--lp-workspace-line) 78%, transparent);
  border-radius: var(--lp-r-sm, 6px);
  color: inherit;
  text-align: start;
  background-color: var(--lp-cell-fill, transparent);
  font: inherit;
  cursor: pointer;
  transition: background-color var(--lp-workspace-motion), border-color var(--lp-workspace-motion), box-shadow var(--lp-workspace-motion);
}

.lp-cell[data-weekend="true"] {
  --lp-cell-fill: color-mix(in srgb, var(--lp-workspace-muted) 62%, transparent);
}

.lp-cell[data-priority="low"] { --lp-cell-tone: var(--lp-tone-low); }
.lp-cell[data-priority="medium"] { --lp-cell-tone: var(--lp-tone-medium); }
.lp-cell[data-priority="high"] { --lp-cell-tone: var(--lp-tone-high); }
.lp-cell[data-priority="highest"] { --lp-cell-tone: var(--lp-tone-highest); }

.lp-cell[data-priority] {
  --lp-cell-fill: color-mix(in srgb, var(--lp-cell-tone) 11%, var(--lp-workspace-surface));
}

.lp-cell[data-dim="true"] {
  color: var(--lp-workspace-text-muted);
  border-color: color-mix(in srgb, var(--lp-workspace-line) 45%, transparent);
  background: color-mix(in srgb, var(--lp-workspace-muted) 37%, transparent);
}

.lp-cell[data-dim="true"] .lp-num { opacity: .67; }

.lp-cell:hover {
  border-color: color-mix(in srgb, var(--lp-workspace-accent) 35%, var(--lp-workspace-line));
  background-color: color-mix(in srgb, var(--lp-workspace-accent) 7%, var(--lp-cell-fill, var(--lp-workspace-surface)));
}

.lp-cell[data-selected="true"] {
  border-color: color-mix(in srgb, var(--lp-workspace-accent) 62%, var(--lp-workspace-line));
  background: var(--lp-workspace-accent-fill);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lp-workspace-accent) 16%, transparent);
}

.lp-cell:focus-visible {
  outline-offset: -2px;
}

.lp-cell-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
}

.lp-num {
  display: grid;
  place-items: center;
  min-width: 1.52em;
  min-height: 1.52em;
  font-size: max(11px, calc(var(--lp-cal-fs, 18px) - 4px));
  line-height: 1;
  font-variant-numeric: tabular-nums;
  border-radius: 50%;
}

.lp-cell[data-today="true"] .lp-num {
  color: var(--lp-workspace-on-accent);
  background: var(--lp-workspace-accent);
  font-weight: 650;
}

.lp-count {
  font-size: max(9px, calc(var(--lp-workspace-meta) - 1px));
  line-height: 1;
  padding: 2px 4px;
  border-radius: 999px;
  color: var(--dsh-ui-accent-surface-foreground, var(--dsw-alias-label-primary));
  background: var(--lp-workspace-accent-fill);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lp-cell-title {
  display: block;
  font-size: var(--lp-workspace-meta);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--lp-workspace-text-muted);
}

.lp-cal-week {
  height: 62px;
  align-items: center;
  gap: 4px;
  padding: 4px 42px 4px 9px;
  box-sizing: border-box;
}

.lp-weekcell {
  flex: 1;
  min-width: 0;
  min-height: 49px;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 1px;
  padding: 2px;
  border-radius: var(--lp-r-sm, 6px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--lp-workspace-text-muted);
  font: inherit;
  font-size: var(--lp-workspace-meta);
  cursor: pointer;
  transition: background-color var(--lp-workspace-motion), border-color var(--lp-workspace-motion);
}

.lp-weekcell strong {
  color: var(--dsw-alias-label-primary);
  font-size: var(--lp-workspace-body);
}

.lp-weekcell:hover { background: var(--lp-workspace-muted); }
.lp-weekcell[data-selected="true"] { background: var(--lp-workspace-accent-fill); }
.lp-weekcell[data-today="true"] { border-color: var(--lp-workspace-accent); }

.lp-day {
  padding: 14px;
  margin-top: 14px;
}

[data-layout="split"] .lp-day {
  margin-top: 0;
}

.lp-day-title {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin-bottom: 12px;
}

.lp-day-date { flex: 1 1 auto; min-width: 0; }

.lp-day-title h2 {
  margin: 0;
  font-size: var(--lp-workspace-title);
  font-weight: 650;
  line-height: 1.3;
}

.lp-day-sub {
  display: flex;
  gap: 4px 8px;
  flex-wrap: wrap;
  margin-top: 3px;
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
}

.lp-day-sub:empty { display: none; }

.lp-add {
  display: flex;
  gap: 6px;
}

.lp-page .lp-add .lp-input {
  min-width: 0;
  width: 100%;
  min-height: 32px;
  border-color: var(--lp-workspace-line);
  background: var(--lp-workspace-muted);
  font-size: var(--lp-workspace-body);
}

.lp-page .lp-add .lp-input:focus {
  border-color: var(--dsh-ui-focus, var(--lp-workspace-accent));
  background: var(--lp-workspace-surface);
}

.lp-page .lp-add .lp-btn {
  flex: none;
  height: auto;
  padding-inline: 9px;
  font-size: var(--lp-workspace-meta);
}

.lp-day-content { margin-top: 12px; }

.lp-day-empty {
  min-height: 96px;
  padding: 8px;
  border-radius: var(--lp-r, 8px);
  background: color-mix(in srgb, var(--lp-workspace-muted) 70%, transparent);
}

.lp-day-list { display: grid; gap: 3px; }

.lp-page .lp-day .lp-tree-row {
  min-width: 0;
  min-height: 36px;
  align-items: flex-start;
  padding: 7px 3px 7px 5px;
  gap: 5px;
}

.lp-day .lp-tree-row > input[type="checkbox"] {
  flex: none;
  margin: 3px 1px 0 0;
}

.lp-day-row-main { flex: 1; min-width: 0; }

.lp-day-row-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
}

.lp-page .lp-day .lp-tree-row .lp-title {
  font-size: max(12px, calc(var(--lp-task-fs, 20px) - 5px));
}

.lp-page .lp-day .lp-meta,
.lp-page .lp-day .lp-badge {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--lp-workspace-meta);
}

.lp-day-row-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px 4px;
  margin-top: 3px;
}

.lp-day-row-tags :is(.lp-tag, .lp-type) {
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: max(10px, calc(var(--lp-type-fs, 20px) - 9px));
}

.lp-day-row-tags .lp-tag { font-size: max(10px, calc(var(--lp-tag-fs, 20px) - 9px)); }
.lp-day-edit { width: 21px; height: 21px; }

.lp-longterm {
  margin-top: 12px;
  border-top: 1px solid var(--lp-workspace-line);
  padding-top: 10px;
}

.lp-longterm h3 {
  margin: 0 0 4px;
  font-size: var(--lp-workspace-meta);
  color: var(--lp-workspace-text-muted);
  font-weight: 650;
}

[data-layout="compact"] .lp-cal-bar {
  padding-inline-start: 9px;
  gap: 4px;
}

[data-layout="compact"] .lp-cal-title {
  font-size: max(14px, calc(var(--lp-workspace-title) - 3px));
}

[data-layout="compact"] .lp-cal-side .lp-weather-compact { display: none; }
[data-layout="compact"] .lp-cell { padding-inline: 3px; }

.lp-page .lp-study-overview {
  container: lp-study-today / inline-size;
  padding: 0;
  overscroll-behavior: contain;
  font-size: var(--lp-workspace-body);
}

.lp-study-overview-layout {
  display: grid;
  gap: 14px;
}

.lp-overview-heading,
.lp-overview-card-head,
.lp-overview-row,
.lp-advice-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  min-width: 0;
}

.lp-overview-heading {
  flex-wrap: wrap;
  min-height: 38px;
  padding: 0 1px;
}

.lp-overview-heading h1 {
  font-size: max(19px, var(--lp-title-fs, 24px));
  line-height: 1.25;
  font-weight: 650;
  margin: 0;
}

.lp-overview-weekday {
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-body);
  font-weight: 400;
}

.lp-page .lp-study-overview .lp-btn-ghost {
  height: auto;
  min-height: 28px;
  flex: none;
  font-size: var(--lp-workspace-meta);
  padding: 4px 8px;
}

.lp-page .lp-study-overview .lp-btn-ghost:hover {
  background: var(--lp-workspace-accent-fill);
  border-color: var(--lp-workspace-accent);
}

.lp-overview-plan-link { gap: 8px; }

.lp-study-overview-columns,
.lp-overview-reviews {
  display: grid;
  gap: 12px;
  min-width: 0;
}

@container lp-study-today (min-width: 690px) {
  .lp-study-overview-columns { grid-template-columns: minmax(0, 5fr) minmax(0, 3fr); }
}

.lp-overview-card {
  padding: 12px 14px;
}

.lp-overview-card-head { min-height: 23px; }

.lp-overview-title {
  margin: 0;
  font-size: max(14px, calc(var(--lp-workspace-title) - 3px));
  font-weight: 650;
  line-height: 1.35;
}

.lp-overview-count {
  background: var(--lp-workspace-muted);
  border-radius: 999px;
  padding: 1px 6px;
  min-width: 14px;
  text-align: center;
}

.lp-overview-count[data-has-items="true"] {
  color: var(--dsh-ui-accent-surface-foreground, var(--dsw-alias-label-primary));
  background: var(--lp-workspace-accent-fill);
}

.lp-overview-count,
.lp-overview-progress-label,
.lp-overview-empty,
.lp-overview-row-meta,
.lp-advice-source {
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
  font-variant-numeric: tabular-nums;
}

.lp-overview-plan {
  display: flex;
  flex-direction: column;
}

.lp-overview-plan-empty {
  flex: 1;
  min-height: 80px;
  background: color-mix(in srgb, var(--lp-workspace-muted) 70%, transparent);
  border-radius: var(--lp-r, 8px);
  margin-top: 9px;
  padding: 7px;
}

.lp-overview-empty {
  margin: 5px 0 1px;
  line-height: 1.45;
}

.lp-overview-progress {
  height: 5px;
  border-radius: 999px;
  background: var(--lp-workspace-muted);
  overflow: hidden;
  margin: 9px 0 3px;
}

.lp-overview-progress > span {
  display: block;
  height: 100%;
  background: var(--lp-workspace-accent);
  border-radius: inherit;
  transition: inline-size var(--lp-workspace-motion);
}

.lp-overview-list {
  padding: 0;
  margin: 3px 0 0;
  list-style: none;
}

.lp-overview-row {
  padding: 7px 0;
  border-top: 1px solid var(--lp-workspace-line);
}

.lp-overview-row:first-child { border-top: 0; }
.lp-overview-row:last-child { padding-bottom: 1px; }
.lp-overview-row-main { min-width: 0; }

.lp-overview-row-title {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.lp-overview-row[data-done="true"] .lp-overview-row-title { color: var(--lp-workspace-text-muted); }

.lp-overview-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 9px;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.lp-overview-done {
  color: var(--dsh-ui-running-foreground, var(--dsw-alias-state-success-primary, var(--lp-workspace-text-muted)));
  font-size: var(--lp-workspace-meta);
  flex: none;
}

.lp-study-advice > summary {
  display: block;
  cursor: pointer;
  padding: 11px 14px;
  list-style: none;
  border-radius: inherit;
  transition: background-color var(--lp-workspace-motion);
}

.lp-study-advice > summary::-webkit-details-marker { display: none; }
.lp-study-advice > summary:hover { background: color-mix(in srgb, var(--lp-workspace-muted) 65%, transparent); }
.lp-advice-heading { justify-content: flex-start; }

.lp-advice-source {
  padding-inline-start: 7px;
  border-inline-start: 1px solid var(--lp-workspace-line);
}

.lp-advice-heading > .lp-chevron {
  margin-inline-start: auto;
  color: var(--lp-workspace-text-muted);
  transition: transform var(--lp-workspace-motion);
}

.lp-study-advice[open] .lp-advice-heading > .lp-chevron { transform: rotate(225deg); }

.lp-advice-preview {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-meta);
}

.lp-study-advice[open] .lp-advice-preview { display: none; }

.lp-advice-text {
  padding: 0 14px 14px;
  max-width: 78ch;
  font-size: var(--lp-workspace-body);
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.lp-advice-text p { margin: 0; }
.lp-advice-text p + p { margin-top: 9px; }

.lp-overview-subjects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 8px;
  margin-top: 6px;
}

.lp-overview-subject {
  min-width: 0;
  padding: 7px 8px;
  border-radius: var(--lp-r-sm, 6px);
  background: var(--lp-workspace-muted);
}

.lp-overview-subject h3 {
  margin: 0;
  font-size: var(--lp-workspace-body);
  overflow-wrap: anywhere;
}

.lp-page .lp-overview-subject .lp-badge {
  font-size: var(--lp-workspace-meta);
}

@keyframes lp-workspace-enter {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: no-preference) {
  .lp-day-content,
  .lp-study-overview-layout,
  .lp-study-advice[open] .lp-advice-text {
    animation: lp-workspace-enter var(--lp-workspace-motion) backwards;
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('life-planner-workspace-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-workspace-styles';
  sheet.textContent = WORKSPACE_CSS;
  document.head.appendChild(sheet);
}
