function MistakeTab(props) {
  const t = props.t;
  const [filterTask, setFilterTask] = React.useState('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [form, setForm] = React.useState({ question: '', answer: '', reason: '' });
  const [hint, setHint] = React.useState('');
  const items = props.items || [];
  const taskOptions = [{ value: 'all', label: t('mistakeAllTasks') }];
  const seen = new Set();
  for (const item of items) {
    if (!item.taskId || seen.has(item.taskId)) continue;
    seen.add(item.taskId);
    taskOptions.push({ value: item.taskId, label: item.taskTitle || item.taskId });
  }
  const filtered = items.filter((item) => {
    if (filterTask !== 'all' && item.taskId !== filterTask) return false;
    const day = item.createdAt ? dayKey(new Date(item.createdAt)) : '';
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  });
  const filtering = filterTask !== 'all' || Boolean(dateFrom) || Boolean(dateTo);
  const ordered = React.useMemo(() => (filtering
    ? [...filtered].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    : (() => {
        const pool = [...filtered];
        for (let index = pool.length - 1; index > 0; index -= 1) {
          const swap = Math.floor(Math.random() * (index + 1));
          [pool[index], pool[swap]] = [pool[swap], pool[index]];
        }
        return pool;
      })()), [items, filterTask, dateFrom, dateTo]);
  const groups = new Map();
  for (const item of ordered) {
    const key = item.taskId || '';
    if (!groups.has(key)) groups.set(key, { title: item.taskTitle || t('mistakeNoTask'), items: [] });
    groups.get(key).items.push(item);
  }
  const [, forceAppearance] = React.useReducer((value) => value + 1, 0);
  React.useEffect(() => onAppearanceChange(forceAppearance), []);

  React.useEffect(() => {
    if (filterTask !== 'all' && !taskOptions.some((option) => option.value === filterTask)) {
      setFilterTask('all');
    }
  }, [filterTask, items.length]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer || '', reason: item.reason || '' });
  };
  const saveEdit = () => {
    if (!editing) return;
    api('mistake.update', { id: editing.id, patch: form })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const removeMistake = (item) => {
    if (typeof window !== 'undefined' && !window.confirm(t('mistakeDeleteAsk'))) return Promise.resolve(false);
    return api('mistake.delete', { id: item.id })
      .then(() => props.onReload())
      .then(() => true)
      .catch((err) => {
        props.onError(err.message);
        return false;
      });
  };

  const explain = (item) => {
    api('mistake.brief', { id: item.id })
      .then((brief) => {
        const text = brief.prompt || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        setHint(t('mistakeCopied').replace('{name}', brief.taskTitle || t('mistakeNoTask')));
      })
      .catch((err) => props.onError(err.message));
  };
  const sourcesFor = (item) => {
    const citations = Array.isArray(item.sources) ? item.sources.map((source) =>
      [...new Set([source.title, source.url || source.path, source.file,
        source.pdfPage ? t('mistakePdfPage').replace('{n}', source.pdfPage) : '',
        source.bookPage ? t('mistakeBookPage').replace('{n}', source.bookPage) : '',
        source.section].filter(Boolean))].join(' · ')).filter(Boolean) : [];
    if (citations.length === 0 && item.source) citations.push(item.source);
    return citations;
  };
  const sourceList = (item, className, label) => {
    const citations = sourcesFor(item);
    if (citations.length === 0) return null;
    const list = h('ul', { className }, citations.map((citation, index) => h('li', { key: index }, citation)));
    return label ? h('div', { className: 'lp-pre-block' }, h('div', { className: 'lp-meta' }, label), list) : list;
  };
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'div',
      { className: 'lp-toolbar' },
      h(Dropdown, { value: filterTask, onChange: setFilterTask, options: taskOptions }),
      h(
        'div',
        { className: 'lp-field', style: { margin: 0 } },
        h('label', null, t('mistakeFrom')),
        h('input', {
          className: 'lp-input',
          style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
          type: 'date',
          value: dateFrom,
          onChange: (event) => setDateFrom(event.target.value),
        }),
      ),
      h(
        'div',
        { className: 'lp-field', style: { margin: 0 } },
        h('label', null, t('mistakeTo')),
        h('input', {
          className: 'lp-input',
          style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
          type: 'date',
          value: dateTo,
          onChange: (event) => setDateTo(event.target.value),
        }),
      ),
      dateFrom || dateTo || filterTask !== 'all'
        ? h(
            'button',
            {
              className: 'lp-btn-ghost',
              type: 'button',
              onClick: () => {
                setFilterTask('all');
                setDateFrom('');
                setDateTo('');
              },
            },
            t('clear'),
          )
        : null,
      h('span', { className: 'lp-meta' }, `${filtered.length}/${items.length}`),
    ),
    hint ? h('div', { className: 'lp-meta' }, hint) : null,
    filtered.length === 0
      ? h('div', { className: 'lp-empty' }, t('mistakeEmpty'))
      : Array.from(groups.entries()).map(([taskId, group]) =>
          h(
            'div',
            { key: taskId || 'none', className: 'lp-group' },
            h(
              'div',
              { className: 'lp-group-head' },
              h('span', null, group.title),
              h('span', { className: 'lp-meta' }, String(group.items.length)),
            ),
            h(
              'div',
              {
                className: 'lp-study-grid lp-mistake-grid',
              },
              group.items.map((item) =>
                h(
                  'div',
                  {
                    key: item.id,
                    className: 'lp-card',
                    title: t('mistakeDblClick'),
                    onDoubleClick: () => setPreview(item),
                  },
                  h('div', { className: 'lp-card-title lp-mistake-title' }, item.question),
                  item.answer
                    ? h('div', { className: 'lp-card-meta lp-mistake-answer' }, `${t('mistakeAnswer')}: ${item.answer}`)
                    : null,
                  item.reason
                    ? h('div', { className: 'lp-card-meta lp-mistake-reason' }, `${t('mistakeReason')}: ${item.reason}`)
                    : null,
                  item.memoryTip ? h('div', { className: 'lp-card-meta lp-mistake-reason' }, item.memoryTip) : null,
                  sourceList(item, 'lp-card-meta'),
                  h('div', { className: 'lp-card-meta' }, item.createdAt ? dayKey(new Date(item.createdAt)) : ''),
                  h(TagChips, { tags: item.tags }),
                  h(
                    'div',
                    { style: { display: 'flex', gap: 6, justifyContent: 'flex-end' } },
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          explain(item);
                        },
                      },
                      t('mistakeExplain'),
                    ),
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          openEdit(item);
                        },
                      },
                      t('edit'),
                    ),
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          removeMistake(item);
                        },
                      },
                      t('delete'),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
    editing
      ? h(
          Modal,
          { title: t('mistakeEdit'), onClose: () => setEditing(null) },
            dialogField(t('mistakeQuestion'), {
              rows: 4,
              value: form.question,
              onChange: (event) => setForm({ ...form, question: event.target.value }),
            }, 'textarea'),
            dialogField(t('mistakeAnswer'), {
              rows: 3,
              value: form.answer,
              onChange: (event) => setForm({ ...form, answer: event.target.value }),
            }, 'textarea'),
            h(DialogDisclosure, {
              title: t('mistakeReason'),
              hint: form.reason ? t('dialogHasDetails') : undefined,
            },
              h('textarea', {
                className: 'lp-input',
                'aria-label': t('mistakeReason'),
                rows: 3,
                value: form.reason,
                onChange: (event) => setForm({ ...form, reason: event.target.value }),
              }),
            ),
            editing.taskTitle
              ? h('div', { className: 'lp-meta' }, `${t('mistakeSource')}: ${editing.taskTitle}`)
              : null,
            h(
              DialogActions,
              null,
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditing(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveEdit }, t('save')),
            ),
        )
      : null,
    preview
      ? h(
          Modal,
          { title: t('mistakePreview'), className: 'lp-mistake-preview', onClose: () => setPreview(null) },
            preview.taskTitle ? h('div', { className: 'lp-meta' }, `${t('mistakeSource')}: ${preview.taskTitle}`) : null,
            h(
              'div',
              { className: 'lp-pre-block' },
              h('div', { className: 'lp-meta' }, t('mistakeQuestion')),
              h('div', { className: 'lp-pre-body' }, preview.question),
            ),
            preview.answer
              ? h(
                  'div',
                  { className: 'lp-pre-block' },
                  h('div', { className: 'lp-meta' }, t('mistakeAnswer')),
                  h('div', { className: 'lp-pre-body' }, preview.answer),
                )
              : null,
            preview.reason
              ? h(
                  'div',
                  { className: 'lp-pre-block' },
                  h('div', { className: 'lp-meta' }, t('mistakeReason')),
                  h('div', { className: 'lp-pre-body' }, preview.reason),
                )
              : null,
            preview.memoryTip ? h('div', { className: 'lp-pre-block' },
              h('div', { className: 'lp-meta' }, t('mistakeMemoryTip')),
              h('div', { className: 'lp-pre-body' }, preview.memoryTip)) : null,
            sourceList(preview, 'lp-pre-body lp-mistake-sources', t('mistakeMaterialSource')),
            h('div', { className: 'lp-meta' }, preview.createdAt ? dayKey(new Date(preview.createdAt)) : ''),
            h(
              DialogActions,
              null,
              h('button', { className: 'lp-btn-ghost', onClick: () => explain(preview) }, t('mistakeExplain')),
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    openEdit(preview);
                    setPreview(null);
                  },
                },
                t('edit'),
              ),
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    removeMistake(preview).then((removed) => {
                      if (removed) setPreview(null);
                    });
                  },
                },
                t('delete'),
              ),
              h('button', { className: 'lp-btn', onClick: () => setPreview(null) }, t('close')),
            ),
        )
      : null,
  );
}
