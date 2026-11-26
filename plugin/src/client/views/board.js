function BoardView(props) {
  const t = props.t;
  const byId = new Map(props.items.map((item) => [item.id, item]));
  const [filterDim, setFilterDim] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [beforeDate, setBeforeDate] = React.useState('');
  const dragging = React.useRef(null);
  const [dropTarget, setDropTarget] = React.useState('');
  const canMove = (item, from, to) => {
    if (from === to) return true;
    if (item.derived.studyTask) return from !== 'done' && (to === 'todo' || to === 'doing');
    return !item.derived.studyManaged || (from !== 'done' && to !== 'done');
  };
  const endDrag = () => {
    dragging.current = null;
    setDropTarget('');
  };
  const drop = (event, column, anchorId, after) => {
    const source = dragging.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    endDrag();
    if (source.item.id !== anchorId && canMove(source.item, source.column, column)) {
      props.onMove({ id: source.item.id, column, anchorId, after });
    }
  };
  const dragOver = (event, column, key) => {
    const source = dragging.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    const allowed = canMove(source.item, source.column, column);
    event.dataTransfer.dropEffect = allowed ? 'move' : 'none';
    setDropTarget(allowed ? key : '');
  };
  const afterMiddle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY >= bounds.top + bounds.height / 2;
  };
  const tagSet = new Set();
  const typeSet = new Set();
  for (const item of props.items) {
    for (const tag of item.tags || []) tagSet.add(tag);
    if (item.taskType) typeSet.add(item.taskType);
  }
  const valueOptions =
    filterDim === 'tag'
      ? Array.from(tagSet).map((name) => ({ value: name, label: name }))
      : filterDim === 'type'
        ? Array.from(typeSet).map((name) => ({ value: name, label: name }))
        : filterDim === 'priority'
          ? [
              { value: 'low', label: t('toneLow') },
              { value: 'medium', label: t('toneMedium') },
              { value: 'high', label: t('toneHigh') },
              { value: 'highest', label: t('toneHighest') },
            ]
          : filterDim === 'due'
            ? [
                { value: 'overdue', label: t('dueOverdue') },
                { value: 'today', label: t('dueToday') },
                { value: 'soon', label: t('dueSoon') },
                { value: 'none', label: t('dueNone') },
                { value: 'before', label: t('dueBefore') },
              ]
            : [];
  const matchesFilter = (item) => {
    if (!filterDim || !filterValue) return true;
    if (filterDim === 'tag') return (item.tags || []).includes(filterValue);
    if (filterDim === 'type') return item.taskType === filterValue;
    if (filterDim === 'priority') return toneOf(item.priority).key === filterValue;
    if (filterDim === 'due') {
      if (filterValue === 'overdue') return isOverdue(item);
      if (filterValue === 'none') return !item.dueAt;
      if (filterValue === 'before') {
        if (!beforeDate) return true;
        if (!item.dueAt) return false;
        return dayKey(new Date(item.dueAt)) < beforeDate;
      }
      if (!item.dueAt) return false;
      const days = (new Date(item.dueAt).getTime() - Date.now()) / 86400000;
      if (filterValue === 'today') return days >= 0 && days < 1;
      if (filterValue === 'soon') return days >= 0 && days <= 3;
    }
    return true;
  };
  const buckets = { todo: [], doing: [], blocked: [], done: [] };
  for (const item of props.items) {
    if (item.derived.archived) continue;
    if (!matchesFilter(item)) continue;
    const column = item.derived.boardColumn || (item.derived.done ? 'done' :
      item.status === 'blocked' || displayBlockers(item, byId, props.items).length > 0 ? 'blocked' :
        item.status === 'doing' ? 'doing' : 'todo');
    buckets[column].push(item);
  }
  for (const list of Object.values(buckets)) {
    list.sort(
      (a, b) =>
        (a.boardOrder ?? Infinity) - (b.boardOrder ?? Infinity) ||
        Number(isOverdue(b)) - Number(isOverdue(a)) ||
        priorityOf(b) - priorityOf(a) ||
        String(a.dueAt || '~').localeCompare(String(b.dueAt || '~')) ||
        a.id.localeCompare(b.id),
    );
  }
  const columns = [
    { key: 'todo', label: t('colTodo') },
    { key: 'doing', label: t('colDoing') },
    { key: 'blocked', label: t('colBlocked') },
    { key: 'done', label: t('colDone') },
  ];
  const onCardKey = (item, column, index, event) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!event.altKey || !keys.includes(event.key)) return keyActivate(() => props.onEdit(item))(event);
    event.preventDefault();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const after = event.key === 'ArrowDown';
      const anchor = buckets[column][index + (after ? 1 : -1)];
      if (anchor) props.onMove({ id: item.id, column, anchorId: anchor.id, after });
      return;
    }
    const position = columns.findIndex((entry) => entry.key === column);
    const target = columns[position + (event.key === 'ArrowRight' ? 1 : -1)];
    if (target && canMove(item, column, target.key)) props.onMove({ id: item.id, column: target.key });
  };
  return h(
    'div',
    { className: 'lp-board' },
    h(
      'div',
      { className: 'lp-filters', style: { gridColumn: '1 / -1' } },
      h(Dropdown, {
        value: filterDim,
        onChange: (next) => {
          setFilterDim(next);
          setFilterValue('');
        },
        options: [
          { value: '', label: t('filterNone') },
          { value: 'tag', label: t('filterTag') },
          { value: 'type', label: t('filterType') },
          { value: 'priority', label: t('filterPriority') },
          { value: 'due', label: t('filterDue') },
        ],
      }),
      filterDim
        ? h(Dropdown, {
            value: filterValue,
            onChange: setFilterValue,
            placeholder: t('filterValue'),
            options: valueOptions,
          })
        : null,
      filterDim === 'due' && filterValue === 'before'
        ? h('input', {
            className: 'lp-input',
            type: 'date',
            style: { width: 160, flex: 'none' },
            value: beforeDate,
            onChange: (event) => setBeforeDate(event.target.value),
          })
        : null,
      filterValue
        ? h(
            'button',
            {
              className: 'lp-btn-ghost',
              onClick: () => {
                setFilterDim('');
                setFilterValue('');
              },
            },
            t('filterClear'),
          )
        : null,
      h('span', { className: 'lp-meta' }, t('boardDragHint')),
    ),
    columns.map((column) =>
      h(
        'div',
        {
          key: column.key,
          className: 'lp-col',
          'data-column': column.key,
          'data-drop': dropTarget === column.key ? 'inside' : undefined,
          onDragOver: (event) => dragOver(event, column.key, column.key),
          onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
          },
          onDrop: (event) => drop(event, column.key),
        },
        h('div', { className: 'lp-col-head' }, `${column.label} · ${buckets[column.key].length}`),
        buckets[column.key].map((item, index) =>
          h(
            'div',
            {
              key: item.id,
              className: 'lp-card',
              tabIndex: 0,
              role: 'button',
              draggable: true,
              'data-item-id': item.id,
              'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight',
              'data-drop': dropTarget === item.id + ':after' ? 'after' : dropTarget === item.id + ':before' ? 'before' : undefined,
              'data-done': String(item.derived.done),
              style: { borderLeft: `3px solid ${toneOf(item.priority).color}` },
              onClick: () => props.onEdit(item),
              onKeyDown: (event) => onCardKey(item, column.key, index, event),
              onDragStart: (event) => {
                dragging.current = { item, column: column.key };
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('application/x-life-planner-board-task', item.id);
              },
              onDragEnd: endDrag,
              onDragOver: (event) => dragOver(event, column.key, item.id + (afterMiddle(event) ? ':after' : ':before')),
              onDrop: (event) => drop(event, column.key, item.id, afterMiddle(event)),
            },
            h(TypeChip, {
              type: item.taskType,
              fallback: t('typeNone'),
              colorOverrides: props.colorOverrides,
            }),
            h('div', { className: 'lp-card-title', title: item.title }, item.title),
            h(TagChips, { item, colorOverrides: props.colorOverrides }),
            h(
              'div',
              { className: 'lp-card-meta' },
              item.priority !== undefined && item.priority !== null
                ? h(
                    'span',
                    { className: 'lp-card-prio', style: { color: toneOf(item.priority).color } },
                    `P${item.priority}`,
                  )
                : h('span', { className: 'lp-card-prio' }, '—'),
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
        h('div', { className: 'lp-col-space', 'aria-hidden': true }),
      ),
    ),
  );
}
