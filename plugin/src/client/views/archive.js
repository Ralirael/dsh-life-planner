function ArchiveView(props) {
  const t = props.t;
  const byId = new Map(props.items.map((item) => [item.id, item]));
  const [collapsed, setCollapsed] = React.useState(new Set());

  // Keep archived nodes plus the ancestors that explain where they sat; the
  // rest of the tree stays hidden so the page reads like a pruned work tree.
  const keep = new Set();
  for (const item of props.items) {
    if (!item.derived.archived) continue;
    keep.add(item.id);
    let node = item.parentId ? byId.get(item.parentId) : null;
    while (node) {
      keep.add(node.id);
      node = node.parentId ? byId.get(node.parentId) : null;
    }
  }
  const items = props.items.filter((item) => keep.has(item.id));
  const map = childrenMap(items);

  if (items.length === 0) return h('div', { className: 'lp-empty' }, t('emptyArchive'));

  const toggle = (id) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  const renderLevel = (parentId) => {
    const list = map.get(parentId) || [];
    if (list.length === 0) return null;
    return h('div', { className: parentId ? 'lp-children' : undefined }, list.map(renderNode));
  };

  const renderNode = (item) => {
    const kids = map.get(item.id) || [];
    const open = !collapsed.has(item.id);
    const archived = Boolean(item.derived.archived);
    return h(
      'div',
      { key: item.id, className: 'lp-node' },
      h(
        'div',
        {
          className: 'lp-row',
          'data-context': String(!archived),
          'data-done': String(item.derived.done),
        },
        kids.length > 0
          ? h(
              'button',
              { className: 'lp-caret', onClick: () => toggle(item.id), 'aria-label': item.title },
              open ? '▾' : '▸',
            )
          : h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
        h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
        h('span', { className: 'lp-title', title: item.title }, item.title),
        archived
          ? h(
              'span',
              { className: 'lp-meta' },
              `${t('archivedAt')} ${item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : '-'}`,
            )
          : null,
        archived
          ? h(
              'span',
              { className: 'lp-actions', style: { opacity: 1 } },
              h('button', { className: 'lp-btn-ghost', onClick: () => props.onRestore(item) }, t('restore')),
            )
          : null,
      ),
      kids.length > 0 && open ? renderLevel(item.id) : null,
    );
  };

  return h('div', { style: { padding: '8px 12px 28px' } }, renderLevel(null));
}
