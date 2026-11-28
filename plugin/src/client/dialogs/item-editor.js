function ItemEditor(props) {
  const t = props.t;
  const item = props.item;
  const items = props.items;
  const isNew = !item.id;
  const studyManaged = Boolean(item.derived?.studyManaged);
  const studyTask = Boolean(item.derived?.studyTask);

  const [title, setTitle] = React.useState(item.title || '');
  const [kind, setKind] = React.useState(item.kind || 'task');
  // One node type: the kind selector is gone, the value only feeds legacy calls.
  void setKind;
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

  return h(
    Modal,
    { title: isNew ? t('newItem') : t('edit'), onClose: props.onClose },
    error ? h('div', { className: 'lp-err' }, error) : null,
    h('div', { className: 'lp-form-section' }, t('sectionBasic')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('titleLabel')),
        h('input', { className: 'lp-input', value: title, onChange: (event) => setTitle(event.target.value) }),
      ),
      h('div', { className: 'lp-form-section' }, t('sectionClass')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('parentLabel')),
        h(Dropdown, {
          value: parentId,
          onChange: setParentId,
          placeholder: t('rootParent'),
          options: [
            { value: '', label: t('rootParent') },
            ...parentOptions.map((entry) => ({ value: entry.id, label: entry.title })),
          ],
        }),
      ),
      h('div', { className: 'lp-form-section' }, t('sectionTime')),
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('startLabel')),
          h('input', {
            className: 'lp-input',
            type: 'datetime-local',
            value: start,
            disabled: studyTask,
            onChange: (event) => setStart(event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('dueLabel')),
          h('input', {
            className: 'lp-input',
            type: 'datetime-local',
            value: due,
            disabled: studyTask,
            onChange: (event) => setDue(event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('locationLabel')),
          h('input', {
            className: 'lp-input',
            value: location,
            placeholder: t('locationHint'),
            onChange: (event) => setLocation(event.target.value),
          }),
        ),
        kind === 'task'
          ? h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('priorityLabel')),
              h(Dropdown, {
                value: priority,
                onChange: setPriority,
                options: Array.from({ length: 10 }, (_, value) => ({ value, label: String(value) })),
              }),
            )
          : null,
      ),
      kind === 'task' && !studyTask
        ? h(
            'div',
            { className: 'lp-field' },
            h('label', null, t('freqLabel')),
            h(Dropdown, {
              value: freq,
              onChange: setFreq,
              options: [
                { value: '', label: t('freqNone') },
                { value: 'daily', label: t('freqDaily') },
                { value: 'weekly', label: t('freqWeekly') },
                { value: 'monthly', label: t('freqMonthly') },
              ],
            }),
          )
        : null,
      h('div', { className: 'lp-form-section' }, t('sectionExtra')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('noteLabel')),
        h('textarea', { className: 'lp-input', rows: 3, value: note, onChange: (event) => setNote(event.target.value) }),
      ),
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('typeLabel')),
          h(Dropdown, {
            value: taskType,
            onChange: setTaskType,
            placeholder: t('typeNone'),
            options: [
              { value: '', label: t('typeNone') },
              ...Array.from(
                new Set([...(props.taskTypes || []), item.taskType].filter(Boolean)),
              ).map((name) => ({ value: name, label: name })),
            ],
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('tagsLabel')),
          h(
            'div',
            { className: 'lp-taglist' },
            tagChoices.length === 0
              ? h('span', { className: 'lp-meta' }, t('tagsEmpty'))
              : tagChoices.map((tag) =>
                  h(
                    'button',
                    {
                      key: tag,
                      type: 'button',
                      className: 'lp-chip',
                      'data-active': String(tags.includes(tag)),
                      style: { color: colorOfName(tag, props.colorOverrides, 'tag') },
                      onClick: () => toggleTag(tag),
                    },
                    tag,
                  ),
                ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: 6, marginTop: 4 } },
            h('input', {
              className: 'lp-input',
              value: tagDraft,
              placeholder: t('tagsNewHint'),
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
      !isNew && kind === 'task' && !studyManaged
        ? h(
            'label',
            { className: 'lp-field', style: { flexDirection: 'row', alignItems: 'center', gap: 8 } },
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
      kind === 'task'
        ? h(
            'div',
            { className: 'lp-field' },
            h('label', null, `${t('depsLabel')} · ${t('depsHint')}`),                dependencyOptions.length === 0
              ? h('div', { className: 'lp-meta' }, t('noDeps'))
              : h(
                  'div',
                  { className: 'lp-deps' },
                  dependencyOptions.map((entry) =>
                    h(
                      'label',
                      { key: entry.id },
                      h('input', {
                        type: 'checkbox',
                        checked: deps.has(entry.id),
                        onChange: () => toggleDep(entry.id),
                      }),
                      entry.title,
                    ),
                  ),
                ),
          )
        : null,
      h(
        'div',
        { className: 'lp-modal-actions' },
        !isNew
          ? h(
              'button',
              {
                className: 'lp-btn-ghost',
                disabled: busy,
                onClick: () => {
                  setBusy(true);
                  api('item.archive', { id: item.id })
                    .then(() => props.onSaved())
                    .catch((err) => setError(err.message))
                    .finally(() => setBusy(false));
                },
              },
              t('archive'),
            )
          : null,
        h('button', { className: 'lp-btn-ghost', onClick: props.onClose, disabled: busy }, t('cancel')),
        h('button', { className: 'lp-btn', onClick: save, disabled: busy || !title.trim() }, t('save')),
      ),
  );
}
