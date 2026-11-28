function CalendarView(props) {
  const t = props.t;
  const items = props.items;
  const selectedKey = props.selectedKey;
  const anchor = props.anchor;
  const scrollRef = React.useRef(null);
  const band = React.useRef(0);
  const collapsedRef = React.useRef(false);
  const [split, setSplit] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [expanded, setExpanded] = React.useState(420);
  // Collapsed always parks at scrollTop 0 so the sticky bar sits above the
  // day list instead of covering it.
  const ANCHOR = 0;

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
  const dayRow = (item) =>
    h(
      'div',
      {
        key: item.id,
        className: 'lp-tree-row',
        'data-done': String(item.derived.done),
        'data-selected': String(selectedId === item.id),
        'data-overdue': String(isOverdue(item)),
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
      h(
        TypeChip,
        { type: item.taskType, fallback: t('typeNone'), colorOverrides: props.colorOverrides },
      ),
      renaming && renaming.id === item.id
        ? h('input', {
            className: 'lp-inline',
            autoFocus: true,
            value: renaming.value,
            onClick: (event) => event.stopPropagation(),
            onChange: (event) => setRenaming({ id: item.id, value: event.target.value }),
            onBlur: commitRename,
            onKeyDown: (event) => {
              if (event.key === 'Enter') commitRename();
              if (event.key === 'Escape') setRenaming(null);
            },
          })
        : h(
            'span',
            {
              className: 'lp-title',
              title: item.title,
              onClick: (event) => event.stopPropagation(),
              onDoubleClick: (event) => {
                event.stopPropagation();
                setRenaming({ id: item.id, value: item.title });
              },
            },
            item.title,
          ),
      h(TagChips, { item, colorOverrides: props.colorOverrides }),
      item.derived.blocked
        ? h('span', { className: 'lp-badge' }, t('blocked'))
        : null,
      item.dueAt || item.startAt
        ? h('span', { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) }, timeLabel(item))
        : null,
    );
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

  // The month fills whatever height the panel gives us, leaving a strip of
  // the day list visible so it is obvious there is more below.
  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const measure = () => {
      const height = Math.round(node.clientHeight || 0);
      if (height <= 0) return;
      const room = Math.max(320, height - 150);
      const appearance = currentAppearance();
      const sideBySide = appearance.layout.calendar === 'auto' && node.clientWidth >= 860;
      setSplit(sideBySide);
      if (sideBySide && collapsedRef.current) setCollapse(false);
      const configured = appearance.size.calendarHeight;
      // A configured height wins, clamped to sane bounds so the day list below
      // always keeps a scrollable surface.
      const capped = Math.max(320, height - 40);
      const next = configured > 0 ? Math.min(Math.max(320, configured), capped) : room;
      setExpanded(Number.isFinite(next) && next >= 200 ? Math.round(next) : room);
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
    if (split) return;
    const node = event.currentTarget;
    const at = node.scrollTop;
    if (!collapsedRef.current) {
      if (at > 4) {
        setCollapse(true);
        // Park at the top so the collapsed bar never overlaps the day list;
        // the same wheel then continues scrolling the list.
        node.scrollTop = 0;
      }
      return;
    }
  };

  // Expanding deliberately costs more: reach the top, then keep pushing up
  // through an elastic band before the month comes back.
  const onWheel = (event) => {
    if (split) return;
    const node = scrollRef.current;
    if (!node) return;
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
    if (!cell.inMonth) props.onAnchor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
  };

  const dayItems = (byDay.get(selectedKey) || []).filter((item) => !item.derived.archived);
  const openCount = openEntries(dayItems).length;
  const selectedDate = new Date(`${selectedKey}T12:00:00`);
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
    { className: 'lp-cal-scroll', 'data-layout': split ? 'split' : 'stacked', ref: scrollRef, onScroll, onWheel },
    h(
      'div',
      {
        className: 'lp-cal-sticky',
        style: { height: collapsed ? 64 : expanded, transition: 'height .2s ease' },
      },
      h(
        'div',
        {
          className: 'lp-cal-month',
          style: {
            height: expanded,
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
            transition: 'opacity .18s ease',
          },
          'aria-hidden': collapsed,
          inert: collapsed,
        },
        h(
          'div',
          { className: 'lp-cal-bar' },
          h(
            'div',
            { className: 'lp-cal-side' },
            h(
              'button',
              {
                className: 'lp-btn-ghost',
                onClick: () => {
                  const now = new Date();
                  props.onAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
                  props.onSelect(dayKey(now));
                },
              },
              t('today'),
            ),
            collapsed ? null : renderTodayInfo(),
          ),
          h('div', { className: 'lp-cal-title' }, monthTitle(t, anchor)),
          h(
            'div',
            { className: 'lp-cal-side', 'data-right': 'true' },
            h(
              'button',
              {
                className: 'lp-iconbtn',
                onClick: () => props.onAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)),
                'aria-label': t('previousMonth'),
              },
              '‹',
            ),
            h(
              'button',
              {
                className: 'lp-iconbtn',
                onClick: () => props.onAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)),
                'aria-label': t('nextMonth'),
              },
              '›',
            ),
          ),
        ),
        h('div', { className: 'lp-wd' }, labels.map((label) => h('div', { key: label }, label))),
        h(
          'div',
          { className: 'lp-grid' },
          cells.map((cell, index) => {
            const list = byDay.get(cell.key) || [];
            const open = openEntries(list);
            const shown = open.slice(0, 2);
            const hidden = open.length - shown.length;
            // The month block is a staircase, not a rectangle: give each
            // in-month cell the sides its dimmed neighbours cannot draw.
            const leftEdge = cell.inMonth && (index % 7 === 0 || !(cells[index - 1] || {}).inMonth);
            const rightEdge = cell.inMonth && (index % 7 === 6 || !(cells[index + 1] || {}).inMonth);
            const topEdge = cell.inMonth && (index < 7 || !(cells[index - 7] || {}).inMonth);
            const bottomEdge = cell.inMonth && (index >= 35 || !(cells[index + 7] || {}).inMonth);
            const topPriority = open.reduce((best, entry) => Math.max(best, priorityOf(entry)), -1);
            return h(
              'div',
              {
                key: cell.key,
                className: 'lp-cell',
                tabIndex: 0,
                role: 'button',
                'data-priority': topPriority >= 0 && cell.inMonth ? toneOf(topPriority).key : undefined,
                'data-dim': String(!cell.inMonth),
                'data-today': String(cell.isToday),
                'data-selected': String(cell.key === selectedKey),
                'data-weekend': String(index % 7 >= 5),
                'data-edge-left': String(leftEdge),
                'data-edge-right': String(rightEdge),
                'data-edge-top': String(topEdge),
                'data-edge-bottom': String(bottomEdge),
                onClick: () => pick(cell),
                onKeyDown: keyActivate(() => pick(cell)),
              },
              h(
                'div',
                { className: 'lp-cell-top' },
                h('span', { className: 'lp-num' }, String(cell.day)),
                open.length > 0 ? h('span', { className: 'lp-count' }, String(open.length)) : null,
              ),
              shown.map((entry) =>
                h('div', { key: entry.id, className: 'lp-cell-title', title: entry.title }, entry.title),
              ),
              hidden > 0 ? h('div', { className: 'lp-cell-more' }, `+${hidden}`) : null,
            );
          }),
        ),
      ),
      h(
        'div',
        {
          className: 'lp-cal-week',
          style: {
            opacity: collapsed ? 1 : 0,
            pointerEvents: collapsed ? 'auto' : 'none',
            transition: 'opacity .18s ease',
          },
          'aria-hidden': !collapsed,
          inert: !collapsed,
        },
        week.map((cell) => {
          const list = byDay.get(cell.key) || [];
          const count = openEntries(list).length;
          return h(
            'button',
            {
              key: cell.key,
              className: 'lp-weekcell',
              type: 'button',
              'data-today': String(cell.isToday),
              'data-selected': String(cell.key === selectedKey),
              onClick: () => {
                props.onSelect(cell.key);
                if (cell.date.getMonth() !== anchor.getMonth() || cell.date.getFullYear() !== anchor.getFullYear()) {
                  props.onAnchor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                }
              },
            },
            h('span', null, labels[(cell.date.getDay() + 6) % 7]),
            h('strong', { className: 'lp-week-day' }, String(cell.day)),
            count > 0 ? h('span', { className: 'lp-count' }, String(count)) : null,
          );
        }),
      ),
      // Explicit affordance: the collapsed bar can always be opened by click,
      // even if a host eats wheel events or the page is mid-scroll.
      collapsed
        ? h(
            'button',
            {
              className: 'lp-cal-expand',
              type: 'button',
              title: t('expandCalendar'),
              'aria-label': t('expandCalendar'),
              onClick: () => {
                setCollapse(false);
                const node = scrollRef.current;
                if (node) node.scrollTop = 0;
              },
            },
            '▾',
          )
        : null,
    ),
    h(
      'div',
      { className: 'lp-day', style: split ? undefined : { minHeight: expanded } },
      h(
        'div',
        { className: 'lp-day-title' },
        h(
          'span',
          null,
          `${t('dayLabel').replace('{m}', String(selectedDate.getMonth() + 1)).replace('{d}', String(selectedDate.getDate()))} · ${labels[(selectedDate.getDay() + 6) % 7]}`,
        ),
        h('span', { className: 'lp-day-sub' }, t('itemsCount').replace('{n}', String(openCount))),
        selectedKey === todayKey && lunar ? h('span', { className: 'lp-day-sub lp-cal-lunar' }, lunar) : null,
        collapsed ? renderTodayInfo() : null,
      ),
      h(
        'form',
        { className: 'lp-add', onSubmit: props.onQuickAdd },
        h('input', {
          className: 'lp-input',
          value: props.draft,
          placeholder: t('addPlaceholder'),
          onChange: (event) => props.onDraft(event.target.value),
          // Focusing the box collapses the calendar so the whole plan area
          // is visible instead of the box sitting half under the bar.
          onFocus: () => {
            const node = scrollRef.current;
            if (!split && node && node.scrollTop < 48) node.scrollTo({ top: 48, behavior: 'smooth' });
          },
        }),
        h('button', { className: 'lp-btn', type: 'submit', disabled: !props.draft.trim() }, t('addButton')),
      ),
      dayItems.length === 0
        ? h('div', { className: 'lp-empty' }, t('emptyDay'))
        : dayItems.map((item) => dayRow(item)),
      longTerm.length > 0
        ? h(
            'div',
            { className: 'lp-longterm' },
            h('div', { className: 'lp-section' }, t('unscheduled')),
            longTerm.map((item) => dayRow(item)),
          )
        : null,
    ),
  );
}
