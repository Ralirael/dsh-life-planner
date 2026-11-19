function TreeView(props) {
  const t = props.t;
  const items = props.items.filter((item) => !item.derived.archived);
  const [collapsed, setCollapsed] = React.useState(new Set());
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [menuFor, setMenuFor] = React.useState('');
  const [renaming, setRenaming] = React.useState(null);
  const [creating, setCreating] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState('');
  const [draggingId, setDraggingId] = React.useState('');
  const [dropHint, setDropHint] = React.useState(null);
  const [groupBy, setGroupBy] = React.useState('hierarchy');
  // The dragged id must be readable synchronously inside dragover; React
  // state is not guaranteed to have committed by then, and without
  // preventDefault the browser refuses the drop entirely.
  const dragRef = React.useRef('');
  const cancelled = React.useRef(false);
  const map = childrenMap(items);
  const byId = new Map(items.map((item) => [item.id, item]));
  const focusId = props.focusId || '';
  const text = query.trim().toLowerCase();
  const filtering = text !== '' || filter !== 'all';

  // A restored item asks the tree to reveal it: select it, open its path,
  // and bring the row into view. The snapshot may still be stale when this
  // runs, so a missing target waits for the next items update instead of
  // consuming the request.
  React.useEffect(() => {
    if (!focusId) return undefined;
    const target = byId.get(focusId);
    if (!target) return undefined;
    setSelectedId(focusId);
    const chain = [];
    let node = target.parentId ? byId.get(target.parentId) : null;
    while (node) {
      chain.push(node.id);
      node = node.parentId ? byId.get(node.parentId) : null;
    }
    if (chain.length > 0) {
      setCollapsed((current) => {
        const next = new Set(current);
        for (const id of chain) next.delete(id);
        return next;
      });
    }
    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-item-id="${focusId}"]`);
      if (element && element.scrollIntoView) element.scrollIntoView({ block: 'center' });
    });
    props.onFocusHandled();
    return undefined;
  }, [focusId, items]);

  if (items.length === 0) {
    return h(
      'div',
      { className: 'lp-empty' },
      h('div', null, t('emptyTree')),
      h('button', { className: 'lp-btn', style: { marginTop: 12 }, onClick: () => props.onNew() }, `+ ${t('newItem')}`),
    );
  }

  const matches = (item) => {
    if (text && !item.title.toLowerCase().includes(text)) return false;
    if (filter === 'open') return !item.derived.done;
    if (filter === 'blocked') return displayBlockers(item, byId, items).length > 0;
    if (filter === 'done') return item.derived.done;
    return true;
  };

  // Filtering keeps every ancestor of a match, so the tree never loses the
  // path that explains where a hit lives.
  const visible = new Set();
  if (filtering) {
    for (const item of items) {
      if (!matches(item)) continue;
      let node = item;
      while (node) {
        visible.add(node.id);
        node = node.parentId ? byId.get(node.parentId) : null;
      }
    }
  } else {
    for (const item of items) visible.add(item.id);
  }

  // Flat grouping across the whole filtered set: a task with three tags
  // appears under each of them.
  const renderGroups = () => {
    const groups = new Map();
    for (const item of items) {
      if (!visible.has(item.id)) continue;
      const keys =
        groupBy === 'tag'
          ? item.tags && item.tags.length > 0
            ? item.tags
            : [t('untagged')]
          : [item.taskType || t('untyped')];
      for (const key of keys) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      }
    }
    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, list]) =>
        h(
          'div',
          { key, className: 'lp-group' },
          h(
            'div',
            { className: 'lp-group-head' },
            h('span', {
              className: 'lp-group-dot',
              style: { background: colorOfName(key, props.colorOverrides) },
            }),
            h('span', null, `${key} · ${list.length}`),
          ),
          list.map((item) =>
            h(
              'div',
              {
                key: item.id,
                className: 'lp-row',
                tabIndex: 0,
                role: 'button',
                'data-done': String(item.derived.done),
                'data-selected': String(selectedId === item.id),
                onClick: () => setSelectedId(item.id),
                onKeyDown: keyActivate(() => setSelectedId(item.id)),
                onDoubleClick: () => props.onEdit(item),
              },
              h('span', { className: 'lp-prio', style: { background: toneOf(item.priority).color } }),
              h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
              h('span', { className: 'lp-title', title: item.title }, item.title),
              item.dueAt
                ? h(
                    'span',
                    { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) },
                    toLocalInput(item.dueAt).replace('T', ' '),
                  )
                : null,
            ),
          ),
        ),
      );
  };

  // Only prerequisites outside this node's own subtree count as blockers; a
  // parent already depends on its children implicitly.
  const blockersOf = (item) => displayBlockers(item, byId, items);

  const progressOf = (item) => {
    let total = 0;
    let done = 0;
    const stack = [item.id];
    while (stack.length > 0) {
      const id = stack.pop();
      for (const child of map.get(id) || []) {
        if (child.kind === 'task') {
          total += 1;
          if (child.derived.done) done += 1;
        } else {
          stack.push(child.id);
        }
      }
    }
    return { total, done };
  };

  const toggle = (id) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  const remove = (item, event) => {
    const kids = (map.get(item.id) || []).length;
    props.onConfirm(event, {
      title: t('treeDeleteAsk').replace('{name}', item.title),
      lines: kids > 0 ? [t('treeDeleteMove').replace('{n}', String(kids))] : [],
      confirmLabel: t('delete'),
      onConfirm: () => props.onDelete(item.id),
    });
  };

  const commitCreate = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const draft = creating;
    if (!draft) return;
    setCreating(null);
    const title = draft.value.trim();
    if (title) props.onCreate(draft.parentId, title, 'task');
  };

  const commitRename = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const draft = renaming;
    if (!draft) return;
    setRenaming(null);
    const title = draft.value.trim();
    const current = byId.get(draft.id);
    if (title && (!current || title !== current.title)) props.onRename(draft.id, title);
  };

  const zoneOf = (event, node) => {
    const rect = node.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    // Right of 25% nests; everything left of it reorders by vertical
    // position, so an up/down drag never turns into a child drop.
    const xRatio = (event.clientX - rect.left) / width;
    if (xRatio > 0.25) return 'inside';
    const yRatio = (event.clientY - rect.top) / height;
    return yRatio < 0.5 ? 'before' : 'after';
  };

  const canDropOn = (target) => {
    const dragged = dragRef.current;
    if (!dragged || dragged === target.id) return false;
    let node = target.parentId ? byId.get(target.parentId) : null;
    while (node) {
      if (node.id === dragged) return false;
      node = node.parentId ? byId.get(node.parentId) : null;
    }
    return !descendantIds(items, dragged).has(target.id);
  };

  const dropOn = (event, target) => {
    event.preventDefault();
    event.stopPropagation();
    const dragged = dragRef.current || event.dataTransfer.getData('text/plain');
    dragRef.current = '';
    setDraggingId('');
    setDropHint(null);
    if (!dragged || dragged === target.id) return;
    if (descendantIds(items, dragged).has(target.id)) return;
    const zone = zoneOf(event, event.currentTarget);
    const parentId = target.parentId || null;
    if (zone === 'inside') {
      props.onMove(dragged, target.id, null);
      return;
    }
    const siblings = (map.get(parentId) || []).filter((item) => visible.has(item.id));
    const index = siblings.findIndex((item) => item.id === target.id);
    const beforeId = zone === 'before' ? target.id : siblings[index + 1] ? siblings[index + 1].id : null;
    props.onMove(dragged, parentId, beforeId);
  };

  const renderCreateRow = (parentId) =>
    h(
      'div',
      { key: '__create', className: 'lp-row' },
      h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
      h('span', { className: 'lp-ico', 'data-kind': 'task' }, KIND_GLYPH.task),
      h('input', {
        className: 'lp-inline',
        autoFocus: true,
        value: creating.value,
        placeholder: t('newChildPlaceholder'),
        onChange: (event) => setCreating({ parentId, value: event.target.value }),
        onKeyDown: (event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            cancelled.current = true;
            setCreating(null);
          }
        },
        onBlur: commitCreate,
      }),
    );

  // The first level is the task category, not a task: every root task is
  // grouped under its type, and an empty category simply never exists.
  const renderHierarchy = () => {
    const roots = (map.get(null) || []).filter((item) => visible.has(item.id));
    const byType = new Map();
    for (const item of roots) {
      const key = item.taskType || '';
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key).push(item);
    }
    const blocks = [...byType.entries()]
      .sort((a, b) => (a[0] || '').localeCompare(b[0] || ''))
      .map(([type, list]) => {
        const label = type || t('untyped');
        const groupId = `cat:${type}`;
        const open = filtering || !collapsed.has(groupId);
        return h(
          'div',
          { key: groupId, className: 'lp-group' },
          h(
            'div',
            {
              className: 'lp-group-head lp-group-toggle',
              'data-open': String(open),
              onClick: () => {
                const next = new Set(collapsed);
                if (next.has(groupId)) next.delete(groupId);
                else next.add(groupId);
                setCollapsed(next);
              },
            },
            h('span', { className: 'lp-caret', 'data-open': String(open) }, '▾'),
            h('span', {
              className: 'lp-group-dot',
              style: { background: colorOfName(label, props.colorOverrides) },
            }),
            h('span', null, `${label} · ${list.length}`),
            // Creating here pre-fills the category; the editor still lets you change it.
            h(
              'button',
              {
                className: 'lp-iconbtn lp-group-add',
                type: 'button',
                title: t('newItem'),
                onClick: (event) => {
                  event.stopPropagation();
                  if (typeof props.onNew === 'function') props.onNew({ taskType: type });
                },
              },
              '+',
            ),
          ),
          open ? h('div', { className: 'lp-children' }, list.map((item) => renderNode(item))) : null,
        );
      });
    const createRow = creating && creating.parentId === null ? renderCreateRow(null) : null;
    if (blocks.length === 0 && !createRow) return null;
    return h('div', null, blocks, createRow);
  };

  const renderLevel = (parentId) => {
    const list = (map.get(parentId) || []).filter((item) => visible.has(item.id));
    const rows = list.map((item) => renderNode(item));
    if (creating && creating.parentId === parentId) rows.push(renderCreateRow(parentId));
    if (rows.length === 0) return null;
    return h('div', { className: parentId ? 'lp-children' : undefined }, rows);
  };

  const renderNode = (item) => {
    const kids = (map.get(item.id) || []).filter((child) => visible.has(child.id));
    const expanded = filtering || !collapsed.has(item.id);
    const progress = item.kind === 'task' ? null : progressOf(item);
    const blockers = blockersOf(item);
    const selected = selectedId === item.id;
    const hint = dropHint && dropHint.id === item.id ? dropHint.zone : '';
    return h(
      'div',
      { key: item.id, className: 'lp-node' },
      h(
        'div',
        {
          className: 'lp-row',
          tabIndex: 0,
          role: 'button',
          'data-done': String(item.derived.done),
          'data-selected': String(selected),
          'data-drop': hint,
          'data-item-id': item.id,
          draggable: true,
          onClick: () => setSelectedId(item.id),
          onKeyDown: keyActivate(() => setSelectedId(item.id)),
          'data-dragging': String(draggingId === item.id),
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.id);
            dragRef.current = item.id;
            setDraggingId(item.id);
            // Dragging folds its own subtree so the target rows stay visible.
            if (!collapsed.has(item.id)) {
              const next = new Set(collapsed);
              next.add(item.id);
              setCollapsed(next);
            }
          },
          onDragEnd: () => {
            dragRef.current = '';
            setDraggingId('');
            setDropHint(null);
          },
          onDragEnter: (event) => {
            if (!canDropOn(item)) return;
            event.preventDefault();
            event.stopPropagation();
          },
          onDragOver: (event) => {
            if (!canDropOn(item)) return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            const zone = zoneOf(event, event.currentTarget);
            if (!dropHint || dropHint.id !== item.id || dropHint.zone !== zone) {
              setDropHint({ id: item.id, zone });
            }
          },
          onDragLeave: () => {
            if (dropHint && dropHint.id === item.id) setDropHint(null);
          },
          onDrop: (event) => dropOn(event, item),
        },
        kids.length > 0
          ? h(
              'button',
              {
                className: 'lp-caret',
                onClick: (event) => {
                  event.stopPropagation();
                  toggle(item.id);
                },
                'aria-label': item.title,
              },
              expanded ? '▾' : '▸',
            )
          : h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
        item.kind === 'task'
          ? h('span', {
              className: 'lp-prio',
              style: { background: toneOf(item.priority).color },
              title: `P${item.priority ?? 5}`,
            })
          : null,
        item.kind === 'task'
          ? h('input', {
              type: 'checkbox',
              checked: Boolean(item.derived.done),
              onClick: (event) => event.stopPropagation(),
              onChange: (event) => props.onToggle(item, event.target.checked, event),
              'aria-label': item.title,
            })
          : h('span', { style: { width: 13, flex: 'none' } }),
        h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
        item.recurrence && item.recurrence.freq
          ? h('span', { className: 'lp-meta', title: t('freqLabel') }, '⟳')
          : null,
        h(TypeChip, {
          type: item.taskType,
          fallback: t('typeNone'),
          colorOverrides: props.colorOverrides,
        }),
        renaming && renaming.id === item.id
          ? h('input', {
              className: 'lp-inline',
              autoFocus: true,
              value: renaming.value,
              onChange: (event) => setRenaming({ id: item.id, value: event.target.value }),
              onKeyDown: (event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
                if (event.key === 'Escape') {
                  cancelled.current = true;
                  setRenaming(null);
                }
              },
              onBlur: commitRename,
            })
          : h(
              'span',
              {
                className: 'lp-title',
                title: item.title,
                onClick: (event) => {
                  event.stopPropagation();
                  setSelectedId(item.id);
                },
                onDoubleClick: (event) => {
                  event.stopPropagation();
                  setRenaming({ id: item.id, value: item.title });
                },
              },
              item.title,
            ),
        h(TagChips, { item, colorOverrides: props.colorOverrides }),
        h('span', {
          className: 'lp-fill',
          onDoubleClick: (event) => {
            event.stopPropagation();
            props.onEdit(item);
          },
        }),
        progress && progress.total > 0
          ? h('span', { className: 'lp-progress' }, `${progress.done}/${progress.total}`)
          : null,
        blockers.length > 0
          ? h(
              'span',
              { className: 'lp-badge', title: blockers.map((dep) => dep.title).join('、') },
              t('blockedBy').replace('{n}', String(blockers.length)),
            )
          : null,
        item.dueAt ? h('span', { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) }, toLocalInput(item.dueAt).replace('T', ' ')) : null,
        h(
          'span',
          { className: 'lp-actions' },
          h(
            'button',
            {
              className: 'lp-mini',
              title: t('newChild'),
              onClick: (event) => {
                event.stopPropagation();
                if (collapsed.has(item.id)) {
                  const next = new Set(collapsed);
                  next.delete(item.id);
                  setCollapsed(next);
                }
                setSelectedId(item.id);
                setCreating({ parentId: item.id, value: '' });
              },
            },
            '+',
          ),
          h(
            'button',
            {
              className: 'lp-mini',
              title: t('edit'),
              onClick: (event) => {
                event.stopPropagation();
                setSelectedId(item.id);
                setMenuFor(menuFor === item.id ? '' : item.id);
              },
            },
            '⋯',
          ),
        ),
      ),
      menuFor === item.id
        ? h(
            'div',
            { className: 'lp-menu' },
            h('button', { onClick: () => { setMenuFor(''); props.onEdit(item); } }, t('edit')),
            item.kind === 'task'
              ? h(
                  'button',
                  {
                    onClick: (event) => {
                      setMenuFor('');
                      props.onToggle(item, !item.derived.done, event);
                    },
                  },
                  item.derived.done ? t('markUndone') : t('markDone'),
                )
              : null,
            h('button', { onClick: () => { setMenuFor(''); setRenaming({ id: item.id, value: item.title }); } }, t('rename')),
            h('button', { onClick: () => { setMenuFor(''); props.onReorder(item, 'up'); } }, t('moveUp')),
            h('button', { onClick: () => { setMenuFor(''); props.onReorder(item, 'down'); } }, t('moveDown')),
            item.parentId
              ? h('button', { onClick: () => { setMenuFor(''); props.onOutdent(item); } }, t('outdent'))
              : null,
            h('button', { onClick: (event) => { setMenuFor(''); remove(item, event); } }, t('delete')),
          )
        : null,
      kids.length > 0 && expanded ? renderLevel(item.id) : null,
      kids.length === 0 && creating && creating.parentId === item.id ? renderLevel(item.id) : null,
    );
  };

  const filters = ['all', 'open', 'blocked', 'done'];

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'lp-toolbar' },
      h('button', { className: 'lp-btn-ghost', onClick: () => props.onNew() }, `+ ${t('newItem')}`),
      filters.map((value) =>
        h(
          'button',
          {
            key: value,
            className: 'lp-chip',
            'data-active': String(filter === value),
            onClick: () => setFilter(value),
          },
          t(`filter_${value}`),
        ),
      ),
      h('div', { style: { flex: 1 } }),
      h(
        'div',
        { style: { width: 132 } },
        h(Dropdown, {
          value: groupBy,
          onChange: setGroupBy,
          options: [
            { value: 'hierarchy', label: t('groupHierarchy') },
            { value: 'tag', label: t('groupTag') },
            { value: 'type', label: t('groupType') },
          ],
        }),
      ),
      h('button', { className: 'lp-btn-ghost', onClick: () => setCollapsed(new Set()) }, t('expandAll')),
      h(
        'button',
        {
          className: 'lp-btn-ghost',
          onClick: () =>
            setCollapsed(new Set(items.filter((item) => (map.get(item.id) || []).length > 0).map((item) => item.id))),
        },
        t('collapseAll'),
      ),
      h('input', {
        className: 'lp-search',
        placeholder: t('search'),
        value: query,
        onChange: (event) => setQuery(event.target.value),
      }),
    ),
    h(
      'div',
      {
        style: { padding: '8px 12px 28px', minHeight: 200 },
        onDragOver: (event) => {
          if (!dragRef.current) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        },
        onDrop: (event) => {
          if (!dragRef.current) return;
          event.preventDefault();
          const dragged = dragRef.current;
          dragRef.current = '';
          setDraggingId('');
          setDropHint(null);
          props.onMove(dragged, null, null);
        },
      },
      groupBy === 'hierarchy' ? renderHierarchy() : renderGroups(),
      visible.size === 0 ? h('div', { className: 'lp-empty' }, t('noMatch')) : null,
    ),
  );
}
