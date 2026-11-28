function ShelfTab(props) {
  const t = props.t;
  const [kind, setKind] = React.useState('auto');
  const [path, setPath] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ title: '', path: '', tags: '', note: '' });
  const openEditor = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      path: item.path,
      tags: (item.tags || []).join(', '),
      note: item.note || '',
    });
  };
  const saveEditor = () => {
    if (!editing) return;
    api('shelf.update', {
      id: editing.id,
      patch: {
        title: form.title.trim(),
        path: form.path.trim(),
        tags: form.tags.split(',').map((entry) => entry.trim()).filter(Boolean),
        note: form.note,
      },
    })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const unlockEditor = () => {
    if (!editing) return;
    api('shelf.update', { id: editing.id, patch: { manual: false } })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const items = props.items || [];
  const add = (event) => {
    event.preventDefault();
    if (!path.trim()) return;
    api('shelf.add', {
      kind,
      path: path.trim(),
      tags: tags.split(',').map((entry) => entry.trim()).filter(Boolean),
    })
      .then(() => {
        setPath('');
        setTags('');
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'form',
      { className: 'lp-toolbar', onSubmit: add },
      h(Dropdown, {
        value: kind,
        onChange: setKind,
        options: [
          { value: 'auto', label: t('shelfAuto') },
          { value: 'dir', label: t('shelfDir') },
          { value: 'file', label: t('shelfFile') },
          { value: 'url', label: t('shelfUrl') },
        ],
      }),
      h('input', {
        className: 'lp-input',
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        value: path,
        placeholder: t('shelfPathHint'),
        onChange: (event) => setPath(event.target.value),
      }),
      h('input', {
        className: 'lp-input',
        value: tags,
        placeholder: t('shelfTagsHint'),
        style: { maxWidth: 160 },
        onChange: (event) => setTags(event.target.value),
      }),
      h('button', { className: 'lp-btn', type: 'submit' }, t('addButton')),
    ),
    items.length === 0
      ? h('div', { className: 'lp-empty' }, t('shelfEmpty'))
      : h(
          'div',
          { className: 'lp-study-grid' },
          items.map((item) =>
            h(
              'div',
              {
                key: item.id,
                className: 'lp-card',
                style: { cursor: 'pointer' },
                title: t('shelfEditHint'),
                onDoubleClick: () => openEditor(item),
              },
              h(
                'div',
                { className: 'lp-card-meta' },
                h('span', { className: 'lp-badge' }, item.kind),
                item.kind === 'url' && !item.fetchedAt
                  ? h('span', { className: 'lp-badge' }, t('shelfNotFetched'))
                  : null,
                item.manual ? h('span', { className: 'lp-badge', title: t('shelfLocked') }, '🔒') : null,
                (item.listing || []).length > 0
                  ? h('span', { className: 'lp-meta' }, `${(item.listing || []).length} ${t('shelfFiles')}`)
                  : null,
                item.truncated
                  ? h('span', { className: 'lp-badge', title: t('shelfTruncatedHint') }, t('shelfTruncated'))
                  : null,
              ),
              h('div', { className: 'lp-card-title', title: item.path }, item.title),
              h(TagChips, { tags: item.tags }),
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, width: '100%' } },
                h(
                  'button',
                  {
                    className: 'lp-btn-ghost',
                    onClick: (event) => {
                      event.stopPropagation();
                      props.onOpen(item);
                    },
                  },
                  t('shelfOpen'),
                ),
                h(
                  'button',
                  {
                    className: 'lp-btn-ghost',
                    onClick: (event) => {
                      event.stopPropagation();
                      if (typeof window !== 'undefined' && !window.confirm(t('shelfDeleteAsk'))) return;
                      api('shelf.delete', { id: item.id })
                        .then(props.onReload)
                        .catch((err) => props.onError(err.message));
                    },
                  },
                  t('delete'),
                ),
              ),
            ),
          ),
        ),
    editing
      ? h(
          Modal,
          { title: t('shelfEdit'), onClose: () => setEditing(null) },
            dialogField(t('shelfName'), {
              value: form.title,
              onChange: (event) => setForm({ ...form, title: event.target.value }),
            }),
            dialogField(t('shelfPath'), {
              value: form.path,
              onChange: (event) => setForm({ ...form, path: event.target.value }),
            }),
            h(DialogDisclosure, {
              title: t('shelfExtraDetails'),
              hint: form.tags || form.note ? t('dialogHasDetails') : undefined,
            },
              dialogField(t('shelfTags'), {
                value: form.tags,
                onChange: (event) => setForm({ ...form, tags: event.target.value }),
              }),
              dialogField(t('shelfNote'), {
                rows: 2,
                value: form.note,
                onChange: (event) => setForm({ ...form, note: event.target.value }),
              }, 'textarea'),
            ),
            h('div', { className: 'lp-meta' }, editing.manual ? t('shelfLocked') : t('shelfAutoHint')),
            h(
              DialogActions,
              null,
              editing.manual
                ? h('button', { className: 'lp-btn-ghost lp-dialog-side-action', onClick: unlockEditor }, t('shelfUnlock'))
                : null,
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditing(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveEditor }, t('save')),
            ),
        )
      : null,
  );
}
