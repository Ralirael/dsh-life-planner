const BOARD_ICON_PATHS = {
  todo: 'M5 4h14v16H5z M8 9h8 M8 13h6',
  doing: 'M12 7v5l3 2 M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z',
  blocked: 'M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z M8.5 15.5l7-7',
  done: 'M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z M8.5 12l2.3 2.3 4.6-4.6',
  time: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z M12 7v5l3.5 2',
};

function BoardIcon({ name }) {
  return h('svg', {
    viewBox: '0 0 24 24',
    width: 14,
    height: 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  }, h('path', { d: BOARD_ICON_PATHS[name] }));
}

function BoardView(props) {
  const t = props.t;
  const byId = new Map(props.items.map((item) => [item.id, item]));
  const [filterDim, setFilterDim] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [beforeDate, setBeforeDate] = React.useState('');
  const dragging = React.useRef(null);
  const [draggedId, setDraggedId] = React.useState('');
  const [dropTarget, setDropTarget] = React.useState('');
  const canMove = (item, from, to) => {
    if (from === to) return true;
    if (item.derived.studyTask) return from !== 'done' && (to === 'todo' || to === 'doing');
    return !item.derived.studyManaged || (from !== 'done' && to !== 'done');
  };
  const endDrag = () => {
    dragging.current = null;
    setDraggedId('');
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
  const dragOver = (event, column, key, anchorId) => {
    const source = dragging.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    const allowed = source.item.id !== anchorId && canMove(source.item, source.column, column);
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
  const dateFilter = filterDim === 'due' && filterValue === 'before';
  const filterActive = Boolean(filterValue && (!dateFilter || beforeDate));

  const renderCard = (item, column, index) => {
    const priority = item.priority;
    const deadline = item.dueAt ? toLocalInput(item.dueAt).replace('T', ' ') : '';
    const overdue = isOverdue(item);
    return h(
      'div',
      {
        key: item.id,
        className: 'lp-card',
        tabIndex: 0,
        role: 'button',
        draggable: true,
        'data-item-id': item.id,
        'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight',
        'data-drop': dropTarget === item.id + ':after' ? 'after'
          : dropTarget === item.id + ':before' ? 'before' : undefined,
        'data-done': String(item.derived.done),
        'data-dragging': draggedId === item.id ? 'true' : undefined,
        onClick: () => props.onEdit(item),
        onKeyDown: (event) => onCardKey(item, column, index, event),
        onDragStart: (event) => {
          dragging.current = { item, column };
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('application/x-life-planner-board-task', item.id);
          setDraggedId(item.id);
        },
        onDragEnd: endDrag,
        onDragOver: (event) => dragOver(event, column, item.id + (afterMiddle(event) ? ':after' : ':before'), item.id),
        onDrop: (event) => drop(event, column, item.id, afterMiddle(event)),
      },
      h('div', { className: 'lp-board-card-head' },
        h('div', { className: 'lp-card-title', title: item.title }, item.title),
        priority != null ? h('span', {
          className: 'lp-card-prio',
          title: `${t('priorityLabel')} ${priority}`,
          style: { '--lp-board-priority': toneOf(priority).color },
        }, `P${priority}`) : null,
      ),
      item.taskType || item.tags?.length || item.location ? h('div', { className: 'lp-board-labels' },
        item.taskType
          ? h(TypeChip, { type: item.taskType, fallback: t('typeNone'), colorOverrides: props.colorOverrides })
          : null,
        h(TagChips, { item, colorOverrides: props.colorOverrides }),
      ) : null,
      deadline ? h('time', {
        className: 'lp-meta lp-board-deadline',
        dateTime: item.dueAt,
        'data-overdue': String(overdue),
        title: `${t(overdue ? 'dueOverdue' : 'dueLabel')} ${deadline}`,
      }, h(BoardIcon, { name: 'time' }), deadline) : null,
    );
  };

  return h(
    'div',
    { className: 'lp-board', 'data-dragging': draggedId ? 'true' : undefined },
    h(
      'div',
      { className: 'lp-board-toolbar' },
      h('div', { className: 'lp-board-filters' },
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
        filterDim ? h(Dropdown, {
          value: filterValue,
          onChange: setFilterValue,
          placeholder: t('filterValue'),
          options: valueOptions,
        }) : null,
        dateFilter ? h('input', {
          className: 'lp-input',
          type: 'date',
          'aria-label': t('dueBefore'),
          value: beforeDate,
          onChange: (event) => setBeforeDate(event.target.value),
        }) : null,
        filterValue ? h('button', {
          className: 'lp-btn-ghost',
          type: 'button',
          onClick: () => {
            setFilterDim('');
            setFilterValue('');
          },
        }, t('filterClear')) : null,
      ),
      h('div', { className: 'lp-board-hint', title: t('boardDragHint') },
        h('span', null, t('boardDragAction')),
        h('span', { className: 'lp-board-keys' },
          h('kbd', null, 'Alt'), h('span', { 'aria-hidden': true }, '+'), h('kbd', null, t('boardArrowKeys')),
        ),
      ),
    ),
    h('div', { className: 'lp-board-scroll', role: 'region', tabIndex: 0, 'aria-label': t('tabBoard') },
      h('div', { className: 'lp-board-lanes' }, columns.map((column) => {
        const cards = buckets[column.key];
        const isDropColumn = dropTarget === column.key || cards.some((item) =>
          dropTarget === item.id + ':before' || dropTarget === item.id + ':after');
        let empty = t(filterActive ? 'boardNoMatches' : 'boardEmpty');
        if (isDropColumn) empty = t('boardDropHere');
        else if (!filterActive && !draggedId && column.key === 'todo' && props.onCreate) {
          empty = h('button', {
            className: 'lp-board-create',
            type: 'button',
            onClick: props.onCreate,
          }, h('span', { 'aria-hidden': true }, '+'), t('newTask'));
        }
        return h(
          'section',
          {
            key: column.key,
            className: 'lp-col',
            'aria-label': column.label,
            'data-column': column.key,
            'data-drop': isDropColumn ? 'inside' : undefined,
            onDragOver: (event) => dragOver(event, column.key, column.key),
            onDragLeave: (event) => {
              if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
            },
            onDrop: (event) => drop(event, column.key),
          },
          h('header', { className: 'lp-col-head' },
            h('span', { className: 'lp-board-status' }, h(BoardIcon, { name: column.key })),
            h('h2', null, column.label),
            h('span', { className: 'lp-board-count' }, cards.length),
          ),
          h('div', { className: 'lp-board-cards' },
            cards.length
              ? cards.map((item, index) => renderCard(item, column.key, index))
              : h('div', { className: 'lp-board-empty' }, empty),
            h('div', { className: 'lp-col-space', 'aria-hidden': true }),
          ),
        );
      })),
    ),
  );
}
