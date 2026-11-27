function Panel(props) {
  const t = props.t;
  // The last snapshot and settings are cached so the first paint has content
  // while the real request is still in flight.
  const [cached] = React.useState(() => readPlannerCache());
  // The host slot sometimes keeps the first commit invisible until something
  // re-renders the tree; a couple of forced ticks make the panel paint itself.
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const first = setTimeout(() => forceTick((n) => n + 1), 40);
    const second = setTimeout(() => forceTick((n) => n + 1), 500);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);
  const [tab, setTab] = React.useState('calendar');
  const pageRef = React.useRef(null);
  // Native controls (checkbox, datetime picker, select popup) follow the
  // `color-scheme` value, so sample the actual panel background instead of
  // trusting a media query: the app theme can differ from the OS theme.
  const [scheme, setScheme] = React.useState('light');

  React.useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    const read = () => {
      const parts = window.getComputedStyle(node).backgroundColor.match(/\d+(\.\d+)?/g);
      if (!parts || parts.length < 3) return;
      const [r, g, b] = parts.map(Number);
      setScheme((r * 299 + g * 587 + b * 114) / 1000 > 128 ? 'light' : 'dark');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => observer.disconnect();
  }, []);

  const [snapshot, setSnapshot] = React.useState(cached ? cached.snapshot : null);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [planText, setPlanText] = React.useState(cached && cached.snapshot ? cached.snapshot.plan.bodyMarkdown || '' : '');
  const [busy, setBusy] = React.useState(false);
  const [editor, setEditor] = React.useState(null);
  const [settings, setSettings] = React.useState(cached ? cached.settings : null);
  const [settingsOpen, setSettingsOpen] = React.useState(null);
  const [notices, setNotices] = React.useState([]);
  const [focusItem, setFocusItem] = React.useState('');
  const [confirmCard, setConfirmCard] = React.useState(null);
  const snapshotGeneration = React.useRef(0);

  // An in-app floating confirmation anchored to the control that asked, so
  // the desktop shell never needs to render a native dialog.
  const askConfirm = (event, options) => {
    // The card is centered by CSS: anchoring to the click kept drifting inside
    // the host shell, and a centered dialog reads the same everywhere.
    setConfirmCard({
      title: options.title,
      lines: options.lines || [],
      confirmLabel: options.confirmLabel,
      onConfirm: options.onConfirm,
    });
  };
  const [selectedKey, setSelectedKey] = React.useState(dayKey(new Date()));
  const [anchor, setAnchor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const reloadData = React.useCallback(
    (background = false) => {
      const generation = ++snapshotGeneration.current;
      return api('snapshot', undefined, { fresh: !background }).then((data) => {
        if (generation !== snapshotGeneration.current) return data;
        setSnapshot(data);
        if (!background) {
          setPlanText((current) => (current === '' ? data.plan.bodyMarkdown || '' : current));
          setError('');
        }
        writePlannerCache({ snapshot: data });
        return data;
      });
    },
    [],
  );

  const reload = React.useCallback(() => {
    reloadData().catch((err) => setError(err.message));
  }, [reloadData]);

  React.useEffect(() => {
    if (typeof document === 'undefined' || !['board', 'tree', 'calendar'].includes(tab)) return undefined;
    const refresh = () => {
      if (document.visibilityState !== 'hidden') reloadData(true).catch(() => {});
    };
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [tab, reloadData]);

  React.useEffect(() => {
    // The panel can mount before the Web carrier accepts requests, so the first
    // load is retried instead of leaving the page empty.
    let alive = true;
    let attempt = 0;
    const tryLoad = () => {
      reloadData().catch((err) => {
        if (!alive) return;
        setError(err.message);
        attempt += 1;
        if (attempt <= 6) setTimeout(tryLoad, Math.min(4000, 200 * 2 ** attempt));
      });
    };
    tryLoad();
    return () => {
      alive = false;
    };
  }, [reloadData]);

  React.useEffect(() => {
    let alive = true;
    let attempt = 0;
    const trySettings = () => {
      api('settings')
        .then((data) => {
          if (!alive) return;
          setSettings(data);
          writePlannerCache({ settings: data });
        })
        .catch(() => {
          attempt += 1;
          if (alive && attempt <= 5) setTimeout(trySettings, Math.min(3000, 200 * 2 ** attempt));
        });
    };
    trySettings();
    return () => {
      alive = false;
    };
  }, []);


  React.useEffect(() => {
    const onBatch = (list) => {
      setNotices((current) => {
        const seen = new Set(current.map((note) => note.id));
        const fresh = list.filter((note) => !seen.has(note.id));
        return fresh.length ? [...fresh, ...current].slice(0, 8) : current;
      });
      api('notifications.ack', { ids: list.map((note) => note.id) }).catch(() => {});
    };
    background.listeners.add(onBatch);
    pullReminders(t);
    return () => background.listeners.delete(onBatch);
  }, []);

  const run = React.useCallback(
    (promise) => {
      setBusy(true);
      promise
        .then(() => reload())
        .catch((err) => setError(err.message))
        .finally(() => setBusy(false));
    },
    [reload],
  );

  const items = (snapshot && snapshot.items) || [];
  const taskTypes =
    settings && Array.isArray(settings.taskTypes) && settings.taskTypes.length > 0
      ? settings.taskTypes
      : ['学习', '工作', '生活', '其他'];
  const colorOverrides = (settings && settings.colorOverrides) || {};

  const toggleComplete = (item, done, event) => {
    if (item.derived?.studyManaged) return;
    if (!done) {
      run(api('item.complete', { id: item.id, done: false }));
      return;
    }
    setBusy(true);
    api('item.complete', { id: item.id, done: true })
      .then((outcome) => {
        if (outcome && outcome.blocked) {
          askConfirm(event, {
            title: t('forceCompleteTitle'),
            lines: [
              ...(outcome.blockers.children.length > 0
                ? [t('blockedChildren'), ...outcome.blockers.children.map((one) => `· ${one.title}`)]
                : []),
              ...(outcome.blockers.depends.length > 0
                ? [t('blockedDeps'), ...outcome.blockers.depends.map((one) => `· ${one.title}`)]
                : []),
              t('forceComplete'),
            ],
            confirmLabel: t('markDone'),
            onConfirm: () => {
              setBusy(true);
              api('item.complete', { id: item.id, done: true, force: true })
                .then(() => reload())
                .catch((err) => setError(err.message))
                .finally(() => setBusy(false));
            },
          });
          return;
        }
        reload();
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const moveBoardItem = (move) => {
    api('item.board', move)
      .then((result) => {
        if (!result.blocked) return reloadData();
        const tasks = [...result.blockers.children, ...result.blockers.depends];
        askConfirm(null, {
          title: t('forceCompleteTitle'),
          lines: [...tasks.map((item) => '· ' + item.title), t('forceComplete')],
          confirmLabel: t('markDone'),
          onConfirm: () => run(api('item.board', { ...move, force: true })),
        });
      })
      .catch((error) => setError(error.message));
  };

  const restoreItem = (item) => {
    setBusy(true);
    api('item.restore', { id: item.id })
      // Refresh first: the tree can only reveal a row it already lists.
      .then(() => reloadData())
      .then(() => {
        setFocusItem(item.id);
        setTab('tree');
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const dismissNotice = (note) => {
    if (note.undoId) {
      api('item.undelete', { id: note.undoId })
        .then(() => {
          setNotices((current) => current.filter((entry) => entry.id !== note.id));
          reload();
        })
        .catch((err) => setError(err.message));
      return;
    }
    setNotices((current) => current.filter((entry) => entry.id !== note.id));
  };

  const quickAdd = (event) => {        event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    // Adding to today after 09:00 should not create an already-past deadline.
    const now = new Date();
    const nine = new Date(`${selectedKey}T09:00:00`);
    const target =
      selectedKey === dayKey(now) && nine.getTime() <= now.getTime() ? new Date(now.getTime() + 3600000) : nine;
    run(api('item.add', { kind: 'task', title, dueAt: target.toISOString() }));
  };

  return h(
    'div',
    {
      className: 'lp-page',
      ref: pageRef,
      'data-scheme': scheme,
      style: {
        colorScheme: scheme,
        '--lp-tone-low': PRIORITY_TONES[0].color,
        '--lp-tone-medium': PRIORITY_TONES[1].color,
        '--lp-tone-high': PRIORITY_TONES[2].color,
        '--lp-tone-highest': PRIORITY_TONES[3].color,
      },
    },
    h(
      'div',
      { className: 'lp-head lp-workspace-head' },
      h(
        'div',
        {
          className: 'lp-tabs',
          // A wheel scrolls the strip sideways once it no longer fits.
          onWheel: (event) => {
            const strip = event.currentTarget;
            if (strip.scrollWidth <= strip.clientWidth) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            strip.scrollLeft += event.deltaY;
          },
        },
        [
          ['calendar', 'tabCalendar'],
          ['tree', 'tabTree'],
          ['board', 'tabBoard'],
          ['plan', 'tabPlan'],
          ['archive', 'tabArchive'],
        ].map(([view, label]) => h('button', {
          key: view,
          type: 'button',
          className: 'lp-tab',
          'data-active': String(tab === view),
          'aria-pressed': tab === view,
          onClick: () => setTab(view),
        }, t(label))),
      ),
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setSettingsOpen('tags') }, t('settings')),
      h('button', { className: 'lp-btn-ghost lp-workspace-primary', type: 'button', onClick: () => setEditor({ kind: 'task', title: '' }) },
        h('span', { className: 'lp-workspace-plus', 'aria-hidden': true }, '+'), t('newItem'),
      ),
    ),
    error ? h('div', { className: 'lp-err', style: { padding: '0 16px' } }, error) : null,
    !snapshot && !error ? h('div', { className: 'lp-meta', style: { padding: '10px 16px' } }, t('loading')) : null,
    tab === 'calendar'
      ? h(CalendarView, {
          t,
          items,
          colorOverrides,
          onRename: (id, title) => run(api('item.update', { id, patch: { title } })),
          selectedKey,
          anchor,
          draft,
          onDraft: setDraft,
          onSelect: setSelectedKey,
          onAnchor: setAnchor,
          onQuickAdd: quickAdd,
          onToggle: toggleComplete,
          onEdit: (item) => setEditor(item),
          onRegionSettings: () => setSettingsOpen('general'),
        })
      : null,
    tab === 'tree'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(TreeView, {
            t,
            items,
            taskTypes,
            colorOverrides,
            onToggle: toggleComplete,
            onEdit: (item) => setEditor(item),
            onArchive: (item) => run(api('item.archive', { id: item.id })),
            onReorder: (item, direction) => run(api('item.reorder', { id: item.id, direction })),
            onDelete: (id) => {
              const target = items.find((entry) => entry.id === id);
              api('item.delete', { id })
                .then(() => {
                  reload();
                  setNotices((current) =>
                    [
                      { id: `undo-${id}`, undoId: id, title: t('deletedHint'), body: target ? target.title : '' },
                      ...current,
                    ].slice(0, 8),
                  );
                })
                .catch((err) => setError(err.message));
            },
            onConfirm: askConfirm,
            onMove: (id, parentId, beforeId) => run(api('item.move', { id, parentId, beforeId })),
            onOutdent: (item) => {
              const parent = item.parentId ? items.find((entry) => entry.id === item.parentId) : null;
              run(api('item.move', { id: item.id, parentId: parent ? parent.parentId : null }));
            },
            onNew: (preset) => setEditor({ kind: 'task', title: '', ...(preset || {}) }),
            onCreate: (parentId, title, kind) => run(api('item.add', { kind, title, parentId })),
            onRename: (id, title) => run(api('item.update', { id, patch: { title } })),
            focusId: focusItem,
            onFocusHandled: () => setFocusItem(''),
          }),
        )
      : null,
    tab === 'archive'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(ArchiveView, { t, items, onRestore: restoreItem }),
        )
      : null,
    tab === 'board'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(BoardView, { t, items, colorOverrides, onEdit: (item) => setEditor(item), onMove: moveBoardItem }),
        )
      : null,
    tab === 'plan'
      ? h(
          'div',
          { className: 'lp-body' },
          h('textarea', {
            className: 'lp-plan',
            rows: 18,
            value: planText,
            placeholder: t('planPlaceholder'),
            onChange: (event) => setPlanText(event.target.value),
          }),
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 } },
            h('button', { className: 'lp-btn', onClick: () => run(api('plan.save', { bodyMarkdown: planText })), disabled: busy }, t('saveButton')),
          ),
        )
      : null,
    editor
      ? h(ItemEditor, {
          t,
          item: editor,
          items,
          taskTypes,
          tagLibrary: (settings && settings.tags) || [],
          colorOverrides,
          onClose: () => setEditor(null),
          onToggle: toggleComplete,
          onSaved: () => {
            setEditor(null);
            reload();
          },
        })
      : null,
    notices.length > 0
      ? h(
          'div',
          { className: 'lp-notices' },
          notices.map((note) =>
            h(
              'div',
              {
                key: note.id,
                className: 'lp-notice',
                title: new Date(note.createdAt).toLocaleString(),
                tabIndex: 0,
                role: 'button',
                onClick: () => dismissNotice(note),
                onKeyDown: keyActivate(() => dismissNotice(note)),
              },
              note.undoId
                ? h('div', { className: 'lp-notice-title' }, `${t('deletedHint')} ${note.body}`)
                : h('div', { className: 'lp-notice-title' }, describeReminder(note, t).title),
              h(
                'div',
                { className: 'lp-notice-body' },
                note.undoId ? t('undoHint') : describeReminder(note, t).body,
              ),
            ),
          ),
        )
      : null,
    settingsOpen
      ? h(SettingsModal, {
          t,
          initialPage: settingsOpen,
          settings:
            settings || {
              weekdayWindows: '10:00-13:00,19:00-02:00',
              weekendWindows: '10:00-02:00',
              leadTaskDays: 3,
              leadProjectDays: 8,
              notifyGapMinutes: 3,
              nonUrgentQuotaPerWindow: 2,
              maxDeferHours: 48,
              archiveAfterDays: 30,
              deleteAfterDays: 90,
            },
          onClose: () => setSettingsOpen(false),
          onSaved: (data) => {
            setSettings(data);
            writePlannerCache({ settings: data });
            window.dispatchEvent(new Event('lp-calendar-context-change'));
            setSettingsOpen(false);
          },
          onImported: () => {
            setSettingsOpen(false);
            reload();
          },
        })
      : null,
    confirmCard
      ? h(
          Modal,
          { title: confirmCard.title, className: 'lp-confirm-modal', confirm: true, onClose: () => setConfirmCard(null) },
          h(
            'div',
            { className: 'lp-pop-list' },
            confirmCard.lines.map((line, index) => h('div', { key: index }, line)),
          ),
          h(
            'div',
            { className: 'lp-pop-actions' },
            h('button', { className: 'lp-btn-ghost', onClick: () => setConfirmCard(null) }, t('cancel')),
            h(
              'button',
              {
                className: 'lp-btn',
                onClick: () => {
                  const action = confirmCard.onConfirm;
                  setConfirmCard(null);
                  if (action) action();
                },
              },
              confirmCard.confirmLabel || t('save'),
            ),
          ),
        )
      : null,
  );
}
