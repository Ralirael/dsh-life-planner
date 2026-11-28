function ItemEditor(props) {
  const t = props.t;
  const item = props.item;
  const items = props.items;
  const isNew = !item.id;
  const studyManaged = Boolean(item.derived?.studyManaged);
  const studyTask = Boolean(item.derived?.studyTask);

  const [title, setTitle] = React.useState(item.title || '');
  const kind = item.kind || 'task';
  const [taskType, setTaskType] = React.useState(item.taskType || '');
  const [parentId, setParentId] = React.useState(item.parentId || '');
  const [due, setDue] = React.useState(toLocalInput(item.dueAt));
  const [start, setStart] = React.useState(toLocalInput(item.startAt));
  const [location, setLocation] = React.useState(item.location || '');
  const [priority, setPriority] = React.useState(item.priority ?? 5);
  const [note, setNote] = React.useState(item.note || '');
  const [tags, setTags] = React.useState(item.tags || []);
  const [tagDraft, setTagDraft] = React.useState('');
  const existingTags = Array.from(
    new Set((props.items || []).flatMap((entry) => entry.tags || [])),
  ).sort();
  // The library comes from settings; already-used tags stay available so old
  // items are not cut off from their own data.
  const tagChoices = Array.from(
    new Set([...(props.tagLibrary || []), ...existingTags, ...tags]),
  ).sort();
  const toggleTag = (tag) =>
    setTags((current) => (current.includes(tag) ? current.filter((one) => one !== tag) : [...current, tag]));
  const commitTag = () => {
    const tag = tagDraft.trim().slice(0, 24);
    setTagDraft('');
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
  };
  const [freq, setFreq] = React.useState((item.recurrence && item.recurrence.freq) || '');
  const [done, setDone] = React.useState(Boolean(item.derived && item.derived.done));
  const [deps, setDeps] = React.useState(new Set(item.dependsOn || []));
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const blockedParents = React.useMemo(() => {
    const set = item.id ? descendantIds(items, item.id) : new Set();
    if (item.id) set.add(item.id);
    return set;
  }, [items, item.id]);

  const parentOptions = items.filter((entry) => !entry.derived.archived && !blockedParents.has(entry.id));
  // A descendant is already an implicit prerequisite through the tree, so it
  // is not offered as an explicit one.
  const dependencyOptions = items.filter(
    (entry) =>
      entry.kind === 'task' && !entry.derived.archived && entry.id !== item.id && !blockedParents.has(entry.id),
  );

  const toggleDep = (id) => {
    const next = new Set(deps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDeps(next);
  };

  const save = () => {
    if (!title.trim()) {
      setError(t('titleLabel'));
      return;
    }
    setBusy(true);
    const existingDeps = item.dependsOn || [];
    const depsChanged = existingDeps.length !== deps.size || existingDeps.some((id) => !deps.has(id));
    const payload = {
      title: title.trim(),
      kind,
      parentId: parentId || null,
      ...(!studyTask ? { dueAt: fromLocalInput(due), startAt: fromLocalInput(start), recurrence: freq ? { freq } : null } : {}),
      location: location.trim() || null,
      priority: kind === 'task' ? priority : null,
      note,
      tags,
      taskType: taskType || null,
      ...(isNew || depsChanged ? { dependsOn: kind === 'task' ? Array.from(deps) : [] } : {}),
    };
    const request = isNew
      ? api('item.add', payload)
      : api('item.update', { id: item.id, patch: payload });
    request
      .then(() => props.onSaved())
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const input = (key, attributes, tag) => dialogField(t(key), attributes, tag);
  const select = (key, attributes) => dialogSelect(t(key), attributes);

  return h(
    Modal,
    { className: 'lp-item-editor', title: t(isNew ? 'newTask' : 'editTaskDialog'), onClose: props.onClose },
    error ? h('div', { className: 'lp-err', role: 'alert' }, error) : null,
    input('titleLabel', {
      value: title,
      'aria-required': true,
      onChange: (event) => setTitle(event.target.value),
    }),
    h('div', { className: 'lp-dialog-grid' },
      input('dueLabel', {
        type: 'datetime-local', value: due, disabled: studyTask,
        onChange: (event) => setDue(event.target.value),
      }),
      kind === 'task' ? select('priorityLabel', {
        value: priority,
        onChange: setPriority,
        options: Array.from({ length: 10 }, (_, value) => ({ value, label: String(value) })),
      }) : null,
    ),
    h('div', { className: 'lp-dialog-grid' },
      select('typeLabel', {
        value: taskType,
        onChange: setTaskType,
        options: [
          { value: '', label: t('typeNone') },
          ...Array.from(new Set([...(props.taskTypes || []), item.taskType].filter(Boolean)))
            .map((name) => ({ value: name, label: name })),
        ],
      }),
      parentOptions.length || parentId ? select('parentLabel', {
        value: parentId,
        onChange: setParentId,
        placeholder: t('rootParent'),
        options: [
          { value: '', label: t('rootParent') },
          ...parentOptions.map((entry) => ({ value: entry.id, label: entry.title })),
        ],
      }) : null,
    ),
    !isNew && kind === 'task' && !studyManaged
      ? h('label', { className: 'lp-dialog-check' },
          h('input', {
            type: 'checkbox',
            checked: done,
            onChange: (event) => {
              const next = event.target.checked;
              setDone(next);
              props.onToggle(item, next, event);
            },
          }),
          t('doneLabel'),
        )
      : studyManaged ? h('p', { className: 'lp-meta' }, t('studyStatusManaged')) : null,
    h('div', { className: 'lp-dialog-options' },
      h(DialogDisclosure, {
        title: t('sectionTime'),
        hint: start || location || freq ? t('dialogHasDetails') : undefined,
      },
        h('div', { className: 'lp-dialog-grid' },
          input('startLabel', {
            type: 'datetime-local', value: start, disabled: studyTask,
            onChange: (event) => setStart(event.target.value),
          }),
          input('locationLabel', {
            value: location, placeholder: t('locationHint'),
            onChange: (event) => setLocation(event.target.value),
          }),
        ),
        kind === 'task' && !studyTask ? select('freqLabel', {
          value: freq,
          onChange: setFreq,
          options: [
            { value: '', label: t('freqNone') },
            { value: 'daily', label: t('freqDaily') },
            { value: 'weekly', label: t('freqWeekly') },
            { value: 'monthly', label: t('freqMonthly') },
          ],
        }) : null,
      ),
      h(DialogDisclosure, {
        title: t('taskNotesAndTags'),
        hint: note.trim() || tags.length ? t('dialogHasDetails') : undefined,
      },
        input('noteLabel', {
          rows: 3, value: note,
          onChange: (event) => setNote(event.target.value),
        }, 'textarea'),
        h('div', { className: 'lp-field' },
          h('span', null, t('tagsLabel')),
          tagChoices.length ? h('div', { className: 'lp-taglist' }, tagChoices.map((tag) =>
            h('button', {
              key: tag,
              type: 'button',
              className: 'lp-chip',
              'data-active': String(tags.includes(tag)),
              'aria-pressed': tags.includes(tag),
              style: { color: colorOfName(tag, props.colorOverrides) },
              onClick: () => toggleTag(tag),
            }, tag))) : null,
          h('div', { className: 'lp-dialog-inline' },
            h('input', {
              className: 'lp-input',
              value: tagDraft,
              placeholder: t('tagsNewHint'),
              'aria-label': t('tagsNewHint'),
              onChange: (event) => setTagDraft(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTag();
                }
              },
            }),
            h('button', { className: 'lp-btn-ghost', type: 'button', onClick: commitTag }, t('tagsAdd')),
          ),
        ),
      ),
      kind === 'task' && (dependencyOptions.length || deps.size) ? h(DialogDisclosure, {
        title: t('depsLabel'),
        hint: deps.size ? t('itemsCount').replace('{n}', String(deps.size)) : undefined,
      },
        h('p', { className: 'lp-meta' }, t('depsHint')),
        dependencyOptions.length ? h('div', { className: 'lp-deps' }, dependencyOptions.map((entry) =>
          h('label', { key: entry.id },
            h('input', { type: 'checkbox', checked: deps.has(entry.id), onChange: () => toggleDep(entry.id) }),
            entry.title,
          ))) : h('p', { className: 'lp-meta' }, t('noDeps')),
      ) : null,
    ),
    h(DialogActions, null,
      !isNew ? h('button', {
        className: 'lp-btn-ghost lp-dialog-side-action',
        type: 'button',
        disabled: busy,
        onClick: () => {
          setBusy(true);
          api('item.archive', { id: item.id })
            .then(() => props.onSaved())
            .catch((err) => setError(err.message))
            .finally(() => setBusy(false));
        },
      }, t('archive')) : null,
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: props.onClose, disabled: busy }, t('cancel')),
      h('button', { className: 'lp-btn', type: 'button', onClick: save, disabled: busy || !title.trim() }, t('save')),
    ),
  );
}
