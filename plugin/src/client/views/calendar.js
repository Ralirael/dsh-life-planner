function CalendarView(props) {
  const t = props.t;
  const items = props.items;
  const selectedKey = props.selectedKey;
  const anchor = props.anchor;
  const scrollRef = React.useRef(null);
  const band = React.useRef(0);
  const collapsedRef = React.useRef(false);
  const splitRef = React.useRef(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [expanded, setExpanded] = React.useState(420);
  const [layout, setLayout] = React.useState('stacked');

  const setCollapse = (next) => {
    collapsedRef.current = next;
    setCollapsed(next);
  };
  const byDay = groupByDay(items);
  const [selectedId, setSelectedId] = React.useState('');
  const [renaming, setRenaming] = React.useState(null);
  // A row selected on one day should not stay highlighted on another.
  React.useEffect(() => {
    setSelectedId('');
    setRenaming(null);
  }, [selectedKey]);
  const commitRename = () => {
    if (!renaming) return;
    const next = renaming.value.trim();
    const target = renaming.id;
    setRenaming(null);
    if (next && target) props.onRename(target, next);
  };
  // Click selects, double-click on the name renames, double-click elsewhere
  // opens the editor — the same gestures as the work tree.
  const dayRow = (item) => {
    const overdue = isOverdue(item);
    return h(
      'div',
      {
        key: item.id,
        className: 'lp-tree-row',
        'data-done': String(item.derived.done),
        'data-selected': String(selectedId === item.id),
        'data-overdue': String(overdue),
        onClick: () => setSelectedId(item.id),
        onDoubleClick: () => props.onEdit(item),
      },
      h('input', {
        type: 'checkbox',
        checked: Boolean(item.derived.done),
        disabled: Boolean(item.derived.studyManaged),
        title: item.derived.studyManaged ? t('studyStatusManaged') : undefined,
        onClick: (event) => event.stopPropagation(),
        onChange: (event) => props.onToggle(item, event.target.checked, event),
        'aria-label': item.title,
      }),
      h('div', { className: 'lp-day-row-main' },
        h('div', { className: 'lp-day-row-heading' },
          renaming?.id === item.id
            ? h('input', {
                className: 'lp-inline',
                autoFocus: true,
                value: renaming.value,
                'aria-label': item.title,
                onClick: (event) => event.stopPropagation(),
                onDoubleClick: (event) => event.stopPropagation(),
                onChange: (event) => setRenaming({ id: item.id, value: event.target.value }),
                onBlur: commitRename,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') commitRename();
                  if (event.key === 'Escape') setRenaming(null);
                },
              })
            : h('span', {
                className: 'lp-title',
                title: item.title,
                onDoubleClick: (event) => {
                  event.stopPropagation();
                  setRenaming({ id: item.id, value: item.title });
                },
              }, item.title),
          item.dueAt || item.startAt
            ? h('span', { className: 'lp-meta', 'data-overdue': String(overdue) }, timeLabel(item))
            : null,
        ),
        h('div', { className: 'lp-day-row-tags' },
          h(TypeChip, { type: item.taskType, fallback: t('typeNone'), colorOverrides: props.colorOverrides }),
          h(TagChips, { item, colorOverrides: props.colorOverrides }),
          item.derived.blocked ? h('span', { className: 'lp-badge' }, t('blocked')) : null,
        ),
      ),
      h('button', {
        className: 'lp-iconbtn lp-day-edit',
        type: 'button',
        'aria-label': `${t('edit')} · ${item.title}`,
        title: t('edit'),
        onClick: (event) => {
          event.stopPropagation();
          props.onEdit(item);
        },
        onDoubleClick: (event) => event.stopPropagation(),
      }, h('span', { className: 'lp-chevron', 'data-direction': 'right', 'aria-hidden': true })),
    );
  };
  const cells = monthMatrix(anchor);
  const week = weekMatrix(selectedKey);
  const labels = weekdayLabels(t);
  const [today, setToday] = React.useState(() => new Date());
  const [todayInfo, setTodayInfo] = React.useState(null);
  React.useEffect(() => {
    let stopped = false;
    let timer;
    let generation = 0;
    const refresh = async () => {
      clearTimeout(timer);
      const requested = ++generation;
      let next;
      try {
        next = await api('calendar.context', undefined, { fresh: true });
      } catch {}
      if (!stopped && requested === generation) {
        if (next) setTodayInfo(next);
        setToday((previous) => dayKey(previous) === dayKey(new Date()) ? previous : new Date());
        timer = setTimeout(refresh, next?.updating ? 2500 : 30000);
      }
    };
    refresh();
    window.addEventListener('lp-calendar-context-change', refresh);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('lp-calendar-context-change', refresh);
    };
  }, []);
  const todayKey = dayKey(today);
  const lunar = React.useMemo(() => lunarDateLabel(today), [today]);
  const renderTodayInfo = () => h(CalendarToday, {
    t, data: todayInfo?.day === todayKey ? todayInfo : null, date: today, lunar, onSettings: props.onRegionSettings,
  });

  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const measure = () => {
      const width = node.clientWidth;
      const height = Math.round(node.clientHeight || 0);
      if (height <= 0 || width <= 0) return;
      splitRef.current = width >= 820;
      setLayout(splitRef.current ? 'split' : width < 475 ? 'compact' : 'stacked');
      const room = Math.max(320, height - (splitRef.current ? 32 : 118));
      const configured = Number(currentAppearance().size?.calendarHeight);
      setExpanded(configured > 0 ? Math.round(Math.min(Math.max(320, configured), room)) : room);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const off = onAppearanceChange(measure);
    return () => {
      observer.disconnect();
      off();
    };
  }, []);

  const onScroll = (event) => {
    const node = event.currentTarget;
    if (splitRef.current || collapsedRef.current || node.scrollTop <= 4) return;
    setCollapse(true);
    node.scrollTop = 0;
  };

  // Expanding deliberately costs more: reach the top, then keep pushing up
  // through an elastic band before the month comes back.
  const onWheel = (event) => {
    const node = scrollRef.current;
    if (!node || splitRef.current) return;
    if (!collapsedRef.current) {
      if (event.deltaY > 0) band.current = 0;
      return;
    }
    // Upward scrolling expands once the list is back at the top; the explicit
    // expand button covers hosts that eat wheel events.
    if (event.deltaY < 0) {
      // Only accumulate once the list is back at the top: scrolling up first
      // reveals the top, then expands.
      if (node.scrollTop > 0) {
        band.current = 0;
        return;
      }
      band.current += -event.deltaY;
      if (band.current >= 90) {
        band.current = 0;
        setCollapse(false);
      }
    } else {
      band.current = 0;
    }
  };

  const pick = (cell) => {
    props.onSelect(cell.key);
    if (cell.date.getMonth() !== anchor.getMonth() || cell.date.getFullYear() !== anchor.getFullYear()) {
      props.onAnchor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  const dayItems = (byDay.get(selectedKey) || []).filter((item) => !item.derived.archived);
  const openCount = openEntries(dayItems).length;
  const selectedDate = new Date(`${selectedKey}T12:00:00`);
  const weekday = (date) => labels[(date.getDay() + 6) % 7];
  const dayLabel = (date) => t('dayLabel')
    .replace('{m}', String(date.getMonth() + 1)).replace('{d}', String(date.getDate())) + ' · ' + weekday(date);
  const pendingLabel = (count) => t('calendarPendingItems').replace('{n}', String(count));
  const cellLabel = (cell, count) => count ? `${dayLabel(cell.date)} · ${pendingLabel(count)}` : dayLabel(cell.date);
  const toggleCalendar = () => {
    band.current = 0;
    setCollapse(!collapsed);
    if (!splitRef.current && scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  // Long-term work plus anything that blew its deadline: overdue tasks keep
  // their red date and join the long-term cycle instead of disappearing.
  const longTerm =
    selectedKey === todayKey
      ? items
          .filter(
            (item) =>
              item.kind === 'task' &&
              !item.derived.archived &&
              !item.derived.done &&
              !(item.derived.studyTask && item.derived.boardColumn === 'todo') &&
              (item.dueAt ? isOverdue(item) && dayKey(new Date(item.dueAt)) < todayKey :
                !item.startAt || dayKey(new Date(item.startAt)) < todayKey),
          )
          .sort((a, b) => {
            const ao = isOverdue(a) ? 0 : 1;
            const bo = isOverdue(b) ? 0 : 1;
            if (ao !== bo) return ao - bo;
            return String(a.dueAt || '~').localeCompare(String(b.dueAt || '~'));
          })
      : [];

  return h(
    'div',
    { className: 'lp-cal-scroll', ref: scrollRef, onScroll, onWheel },
    h(
      'div',
      { className: 'lp-calendar-layout', 'data-layout': layout },
      h(
        'div',
        {
          className: 'lp-cal-sticky lp-workspace-card',
          'data-collapsed': String(collapsed),
          style: { '--lp-month-height': `${expanded}px` },
        },
        h(
          'div',
          { className: 'lp-cal-month', 'aria-hidden': collapsed },
          h(
            'div',
            { className: 'lp-cal-bar' },
            h('h2', { className: 'lp-cal-title' }, monthTitle(t, anchor)),
            h(
              'div',
              { className: 'lp-cal-side' },
              collapsed ? null : renderTodayInfo(),
              h(
                'button',
                {
                  className: 'lp-btn-ghost lp-cal-today',
                  type: 'button',
                  tabIndex: collapsed ? -1 : undefined,
                  onClick: () => {
                    const now = new Date();
                    props.onAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
                    props.onSelect(dayKey(now));
                  },
                },
                t('today'),
              ),
              h('div', { className: 'lp-month-nav' },
                [-1, 1].map((step) => {
                  const label = t(step < 0 ? 'previousMonth' : 'nextMonth');
                  return h('button', {
                    key: step,
                    className: 'lp-iconbtn',
                    type: 'button',
                    tabIndex: collapsed ? -1 : undefined,
                    'aria-label': label,
                    title: label,
                    onClick: () => props.onAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + step, 1)),
                  }, h('span', { className: 'lp-chevron', 'data-direction': step < 0 ? 'left' : 'right', 'aria-hidden': true }));
                }),
              ),
            ),
          ),
          h('div', { className: 'lp-wd', 'aria-hidden': true },
            labels.map((label) => h('span', { key: label }, label)),
          ),
          h(
            'div',
            { className: 'lp-grid' },
            cells.map((cell, index) => {
              const open = openEntries(byDay.get(cell.key) || []);
              const topPriority = open.reduce((best, entry) => Math.max(best, priorityOf(entry)), -1);
              return h(
                'button',
                {
                  key: cell.key,
                  className: 'lp-cell',
                  type: 'button',
                  tabIndex: collapsed ? -1 : undefined,
                  'aria-label': cellLabel(cell, open.length),
                  'aria-pressed': cell.key === selectedKey,
                  'aria-current': cell.isToday ? 'date' : undefined,
                  'data-priority': topPriority >= 0 && cell.inMonth ? toneOf(topPriority).key : undefined,
                  'data-dim': String(!cell.inMonth),
                  'data-weekend': String(index % 7 >= 5),
                  'data-today': String(cell.isToday),
                  'data-selected': String(cell.key === selectedKey),
                  onClick: () => pick(cell),
                },
                h('span', { className: 'lp-cell-top' },
                  h('span', { className: 'lp-num' }, String(cell.day)),
                  open.length ? h('span', { className: 'lp-count' }, String(open.length)) : null,
                ),
                open.slice(0, 2).map((entry) =>
                  h('span', { key: entry.id, className: 'lp-cell-title', title: entry.title }, entry.title),
                ),
              );
            }),
          ),
        ),
        h(
          'div',
          { className: 'lp-cal-week', 'aria-hidden': !collapsed },
          week.map((cell) => {
            const count = openEntries(byDay.get(cell.key) || []).length;
            return h(
              'button',
              {
                key: cell.key,
                className: 'lp-weekcell',
                type: 'button',
                tabIndex: collapsed ? undefined : -1,
                'aria-label': cellLabel(cell, count),
                'aria-pressed': cell.key === selectedKey,
                'aria-current': cell.isToday ? 'date' : undefined,
                'data-today': String(cell.isToday),
                'data-selected': String(cell.key === selectedKey),
                onClick: () => pick(cell),
              },
              h('span', null, weekday(cell.date)),
              h('strong', null, String(cell.day)),
              count ? h('span', { className: 'lp-count' }, String(count)) : null,
            );
          }),
        ),
        h(
          'button',
          {
            className: 'lp-iconbtn lp-cal-disclosure',
            type: 'button',
            title: t(collapsed ? 'expandCalendar' : 'collapseCalendar'),
            'aria-label': t(collapsed ? 'expandCalendar' : 'collapseCalendar'),
            'aria-expanded': !collapsed,
            onClick: toggleCalendar,
          },
          h('span', { className: 'lp-chevron', 'data-direction': collapsed ? 'down' : 'up', 'aria-hidden': true }),
        ),
      ),
      h(
        'section',
        { className: 'lp-day lp-workspace-card', 'aria-label': t('calendarAgenda') },
        h(
          'div',
          { className: 'lp-day-title' },
          h('div', { className: 'lp-day-date', 'aria-live': 'polite' },
            h('h2', null, h('time', { dateTime: selectedKey }, dayLabel(selectedDate))),
            h('div', { className: 'lp-day-sub' },
              selectedKey === todayKey && lunar ? h('span', null, lunar) : null,
              dayItems.length ? h('span', null, openCount ? pendingLabel(openCount) : t('calendarAllDone')) : null,
            ),
          ),
          collapsed ? renderTodayInfo() : null,
        ),
        h(
          'form',
          { className: 'lp-add', onSubmit: props.onQuickAdd },
          h('input', {
            className: 'lp-input',
            value: props.draft,
            placeholder: t('calendarQuickAdd'),
            'aria-label': t('calendarQuickAdd'),
            onChange: (event) => props.onDraft(event.target.value),
            onFocus: (event) => {
              const node = scrollRef.current;
              if (!node || splitRef.current || collapsedRef.current) return;
              if (event.currentTarget.getBoundingClientRect().bottom > node.getBoundingClientRect().bottom) {
                setCollapse(true);
                node.scrollTop = 0;
              }
            },
          }),
          h('button', { className: 'lp-btn lp-workspace-primary', type: 'submit', disabled: !props.draft.trim() }, t('addButton')),
        ),
        h('div', { key: selectedKey, className: 'lp-day-content' },
          dayItems.length
            ? h('div', { className: 'lp-day-list' }, dayItems.map(dayRow))
            : h('div', { className: 'lp-workspace-empty lp-day-empty' },
                h('span', { className: 'lp-empty-symbol' }, h(SidebarIcon, { variant: 'planning', size: 19 })),
                h('p', null, t('emptyDay')),
              ),
          longTerm.length
            ? h('section', { className: 'lp-longterm' },
                h('h3', null, t('unscheduled')),
                h('div', { className: 'lp-day-list' }, longTerm.map(dayRow)),
              )
            : null,
        ),
      ),
    ),
  );
}
