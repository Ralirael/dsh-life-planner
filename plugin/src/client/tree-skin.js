const TREE_CSS = `
.lp-page .lp-tree-page {
  padding: 0;
  overscroll-behavior: contain;
}

.lp-tree-workspace {
  box-sizing: border-box;
  width: 100%;
  max-width: 1180px;
  margin-inline: auto;
  padding: 18px clamp(12px, 2.4vw, 24px) 28px;
}

.lp-tree-empty {
  display: grid;
  justify-items: center;
  gap: 7px;
  max-width: 460px;
  margin: clamp(12px, 6vh, 52px) auto 0;
  padding: clamp(18px, 5vw, 30px) 16px;
  text-align: center;
}

.lp-tree-empty h2 {
  margin: 4px 0 0;
  font-size: var(--lp-workspace-title);
  font-weight: 650;
  line-height: 1.3;
}

.lp-tree-empty p {
  max-width: 34ch;
  margin: 0;
  color: var(--lp-workspace-text-muted);
  font-size: var(--lp-workspace-body);
  text-wrap: pretty;
}

.lp-page .lp-tree-empty .lp-btn {
  gap: 5px;
  height: 31px;
  margin-top: 6px;
  font-size: var(--lp-workspace-meta);
}

.lp-tree-toolbar,
.lp-tree-status-filters,
.lp-tree-toolbar-actions,
.lp-tree-fold-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.lp-tree-toolbar {
  gap: 8px 10px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--lp-workspace-line);
  margin-bottom: 12px;
}

.lp-page .lp-tree-toolbar .lp-search {
  flex: 1 1 160px;
  min-width: min(160px, 100%);
  min-height: 30px;
  padding: 4px 9px;
  border-radius: var(--lp-r, 8px);
  font-size: var(--lp-workspace-meta);
  background: var(--lp-workspace-surface);
}

.lp-tree-status-filters {
  gap: 2px;
  max-width: 100%;
  padding: 2px;
  border-radius: var(--lp-r, 8px);
  background: var(--lp-workspace-muted);
}

.lp-page .lp-tree-status-filters .lp-chip {
  height: 25px;
  padding-inline: 7px;
  color: var(--lp-workspace-text-muted);
  border: 1px solid transparent;
  border-radius: var(--lp-r-sm, 6px);
  font-size: var(--lp-workspace-meta);
  white-space: nowrap;
}

.lp-page .lp-tree-status-filters .lp-chip[data-active="true"] {
  color: var(--dsw-alias-label-primary);
  border-color: var(--lp-workspace-line);
  background: var(--lp-workspace-surface);
}

.lp-tree-toolbar-actions .lp-dd { width: min(128px, 100%); }

.lp-page .lp-tree-toolbar-actions :is(.lp-btn-ghost, .lp-dd-btn) {
  min-height: 30px;
  padding-inline: 8px;
  font-size: var(--lp-workspace-meta);
}

.lp-tree-content {
  min-height: 200px;
  padding-bottom: 20px;
}

.lp-tree-content .lp-group {
  margin: 0 0 9px;
}

.lp-tree-content .lp-group-head {
  min-height: 36px;
  padding: 3px 8px;
  box-sizing: border-box;
  border-color: var(--lp-workspace-line);
  border-radius: var(--lp-r-lg, 12px) var(--lp-r-lg, 12px) 0 0;
  background: color-mix(in srgb, var(--lp-workspace-muted) 72%, transparent);
}

.lp-tree-content .lp-group-head:last-child {
  border-bottom: 0;
  border-radius: inherit;
}

.lp-tree-group-toggle {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 7px;
  min-width: 0;
  min-height: 28px;
  padding: 0 2px;
  background: transparent;
  color: inherit;
  border: 0;
  border-radius: var(--lp-r-sm, 6px);
  text-align: start;
  font: inherit;
  cursor: pointer;
}

.lp-tree-group-toggle:hover { color: var(--dsw-alias-label-primary); }

.lp-tree-group-label {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--dsw-alias-label-primary);
  font-size: var(--lp-workspace-body);
  font-weight: 650;
}

.lp-tree-group-count {
  flex: none;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--lp-workspace-surface);
  color: var(--lp-workspace-text-muted);
  text-align: center;
  font-size: var(--lp-workspace-meta);
  font-variant-numeric: tabular-nums;
}

.lp-tree-content .lp-group-add {
  flex: none;
  border-color: transparent;
}

.lp-tree-content .lp-group-add:hover {
  background: var(--lp-workspace-accent-fill);
  opacity: 1;
}

.lp-tree-group-body { padding: 4px; }
.lp-tree-content .lp-tree-flat-row { margin: 2px 4px; }
.lp-tree-flat-row > .lp-title { flex: 1; }

.lp-tree-content .lp-children {
  margin-left: 15px;
  padding-left: 3px;
  border-color: var(--lp-workspace-line);
}

.lp-page .lp-tree-workspace .lp-row {
  min-width: 0;
  min-height: 31px;
  padding: 5px 6px;
  gap: 6px;
}

.lp-tree-row-leading {
  display: grid;
  flex: none;
  grid-template-columns: 14px 3px 14px 15px;
  place-items: center;
  gap: 4px;
}

.lp-tree-row-leading input { margin: 0; }
.lp-tree-row-leading .lp-prio { align-self: center; }

.lp-tree-row-content {
  display: flex;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px 9px;
  min-width: 0;
}

.lp-tree-row-name {
  display: grid;
  flex: 1 1 136px;
  gap: 2px;
  min-width: 0;
}

.lp-page .lp-tree-workspace .lp-row .lp-title {
  font-size: max(12px, calc(var(--lp-task-fs, 20px) - 5px));
}

.lp-tree-row-name .lp-inline {
  box-sizing: border-box;
  width: 100%;
}

.lp-tree-row-details,
.lp-tree-row-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 5px;
  min-width: 0;
}

.lp-tree-row-details:empty,
.lp-tree-row-tags:empty {
  display: none;
}

.lp-page .lp-tree-workspace .lp-row :is(.lp-meta, .lp-badge, .lp-progress) {
  font-size: var(--lp-workspace-meta);
  font-variant-numeric: tabular-nums;
}

.lp-tree-row-tags :is(.lp-type, .lp-tag, .lp-meta) {
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-tree-row-tags .lp-type { font-size: max(10px, calc(var(--lp-type-fs, 20px) - 9px)); }
.lp-tree-row-tags .lp-tag { font-size: max(10px, calc(var(--lp-tag-fs, 20px) - 9px)); }

.lp-tree-entry > .lp-actions { opacity: .65; }

.lp-tree-entry:is(:hover, :focus-within, [data-selected="true"]) > .lp-actions {
  opacity: 1;
}

.lp-tree-no-match {
  min-height: 82px;
  padding: 10px;
  text-align: center;
}

@media (prefers-reduced-motion: no-preference) {
  .lp-tree-empty { animation: lp-workspace-enter var(--lp-workspace-motion) backwards; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('life-planner-tree-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-tree-styles';
  sheet.textContent = TREE_CSS;
  document.head.appendChild(sheet);
}
