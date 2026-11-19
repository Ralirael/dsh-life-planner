// The knowledge-base types the host ships; shared by the create and edit dialogs.
const TEMPLATE_OPTIONS = [
  { value: 'list', label: 'list · 列表库' },
  { value: 'tree', label: 'tree · 知识树' },
  { value: 'bank', label: 'bank · 题库' },
  { value: 'custom', label: 'custom · 自定义' },
];
// Tasks created before the rename keep their old id; show the canonical one.
const TEMPLATE_ALIASES = { 'word-bank': 'list', outline: 'tree', 'outline-bank': 'bank' };
const normalizeTemplate = (value) => TEMPLATE_ALIASES[value] || value;

function StudyPlanTab(props) {
  const t = props.t;
  const data = props.data || { subjects: [], topics: [], plan: [] };
  const [busy, setBusy] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const dragPlan = React.useRef('');
  const [tasks, setTasks] = React.useState([]);
  const [weekMinutes, setWeekMinutes] = React.useState(null);
  const [newTitle, setNewTitle] = React.useState(() => `学习任务 ${dayKey(new Date()).slice(5)}`);
  const [newPath, setNewPath] = React.useState(() => {
    try {
      return localStorage.getItem('lpStudyPath') || '';
    } catch {
      return '';
    }
  });
  const [newTemplate, setNewTemplate] = React.useState('list');
  const [editingTask, setEditingTask] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [newShelf, setNewShelf] = React.useState([]);
  const [subjectEditing, setSubjectEditing] = React.useState(null);
  const [subjectForm, setSubjectForm] = React.useState({ title: '', examDate: '', note: '' });
  const [taskForm, setTaskForm] = React.useState({ title: '', workspacePath: '', template: 'list' });
  const [taskShelf, setTaskShelf] = React.useState([]);
  const reloadTasks = () =>
    api('study-tasks')
      .then((list) => setTasks(Array.isArray(list) ? list : []))
      .catch(() => {});
  React.useEffect(() => {
    reloadTasks();
    const timer = setInterval(reloadTasks, 5000);
    return () => clearInterval(timer);
  }, []);
  // The week plan is written by the study conversation; this panel only shows it,
  // refreshed on the same beat as the task list.
  React.useEffect(() => {
    const loadWeek = () =>
      api('study-time')
        .then((week) => {
          const total = (week.days || []).reduce((sum, day) => sum + (Number(day.planned) || 0), 0);
          setWeekMinutes(total);
        })
        .catch(() => {});
    loadWeek();
    const timer = setInterval(loadWeek, 30000);
    return () => clearInterval(timer);
  }, []);
  const createTask = (event) => {
    event.preventDefault();
    const title = newTitle.trim();
    const path = newPath.trim();
    if (!title || !path) return;
    api('studytask.register', { title, workspacePath: path, template: newTemplate })
      .then((result) => {
        const taskId = result && result.id;
        if (taskId && newShelf.length > 0) {
          return api('studytask.materials', { id: taskId, shelfIds: newShelf }).then(() => result);
        }
        return result;
      })
      .then(() => {
        try {
          localStorage.setItem('lpStudyPath', path);
        } catch {
          /* storage may be unavailable */
        }
        setNewTitle(`学习任务 ${dayKey(new Date()).slice(5)}`);
        setNewPath(path);
        setShowNew(false);
        setNewShelf([]);
        return reloadTasks();
      })
      .catch((err) => props.onError(err.message));
  };
  const openTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, workspacePath: task.workspacePath, template: normalizeTemplate(task.template) });
    setTaskShelf((task.materials || []).map((one) => one.id));
  };
  const saveTask = () => {
    if (!editingTask) return;
    api('studytask.update', {
      id: editingTask.id,
      patch: {
        title: taskForm.title.trim(),
        workspacePath: taskForm.workspacePath.trim(),
        template: taskForm.template,
      },
    })
      .then(() => api('studytask.materials', { id: editingTask.id, shelfIds: taskShelf }))
      .then(() => {
        setEditingTask(null);
        return reloadTasks();
      })
      .catch((err) => props.onError(err.message));
  };
  const addSubject = (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    api('subject.add', { title })
      .then(() => props.onReload())
      .catch((err) => props.onError(err.message));
  };
  const today = dayKey(new Date());
  const generate = (subjectId) => {
    if (typeof window !== 'undefined' && !window.confirm(t('studyGenerateAsk'))) return;
    setBusy(subjectId);
    api('plan.generate', { subjectId })
      .then((info) => {
        setResult(info);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message))
      .finally(() => setBusy(''));
  };
  const upcoming = data.plan.filter((entry) => entry.date >= today).slice(0, 14);
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'form',
      { className: 'lp-toolbar', onSubmit: addSubject },
      h('input', {
        className: 'lp-input',
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        value: draft,
        placeholder: t('studyAddSubject'),
        onChange: (event) => setDraft(event.target.value),
      }),
      h('button', { className: 'lp-btn', type: 'submit' }, t('addButton')),
    ),
    h(
      'div',
      { className: 'lp-toolbar' },
      h(
        'div',
        { className: 'lp-section', style: { flex: 1, margin: 0 } },
          weekMinutes !== null
            ? `${t('studyTaskList')} · ${tasks.length} · ${t('studyWeekPlan').replace('{n}', String(weekMinutes))}`
            : `${t('studyTaskList')} · ${tasks.length}`,
      ),
      h(
        'button',
        { className: 'lp-btn-ghost', onClick: () => setShowNew(!showNew) },
        showNew ? t('cancel') : `+ ${t('studyTaskAdd')}`,
      ),
    ),
    tasks.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoTask'))
      : tasks.map((task) =>
          h(
            'div',
            {
              key: task.id,
              className: 'lp-tree-row',
              style: { cursor: 'pointer' },
              title: t('studyTaskEditHint'),
              onClick: () => openTask(task),
            },
            h('span', { className: 'lp-title', title: task.workspacePath }, task.title),
            h('span', { className: 'lp-badge' }, normalizeTemplate(task.template)),
            task.materials && task.materials.length > 0
              ? h('span', { className: 'lp-meta' }, `📎${task.materials.length}`)
              : null,
            task.summary && task.summary.total
              ? h('span', { className: 'lp-meta' }, `${task.summary.total} ${t('studyEntries')}`)
              : null,
            task.missing ? h('span', { className: 'lp-badge' }, t('studyTaskMissing')) : null,
            task.doneToday
              ? h('span', { className: 'lp-badge' }, t('studyTaskDoneToday'))
              : task.overdueDays > 0
                ? h(
                    'span',
                    { className: 'lp-badge' },
                    t('studyTaskOverdue').replace('{n}', String(task.overdueDays)),
                  )
                : null,
            h(
              'span',
              { className: 'lp-meta' },
              `${t('studyNewLabel')} ${task.answeredNew || 0}/${task.targetNew || 0} · ${t('studyReviewLabel')} ${task.answeredReview || 0}/${task.targetReview || 0}`,
            ),
            h('span', { className: 'lp-meta' }, task.updatedAt ? task.updatedAt.slice(0, 10) : ''),
          ),
        ),
    editingTask
      ? h(
          Modal,
          { title: `${t('studyTaskEdit')} · ${editingTask.title}`, onClose: () => setEditingTask(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTitle')),
              h('input', {
                className: 'lp-input',
                value: taskForm.title,
                onChange: (event) => setTaskForm({ ...taskForm, title: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskPath')),
              h('input', {
                className: 'lp-input',
                value: taskForm.workspacePath,
                onChange: (event) => setTaskForm({ ...taskForm, workspacePath: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTemplate')),
              h(Dropdown, {
                value: taskForm.template,
                onChange: (value) => setTaskForm({ ...taskForm, template: value }),
                options: TEMPLATE_OPTIONS,
              }),
            ),
            h(ShelfPicker, {
              t,
              items: props.shelf,
              selected: taskShelf,
              onChange: setTaskShelf,
            }),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    const id = editingTask.id;
                    if (!window.confirm(t('studyTaskDeleteConfirm'))) return;
                    api('studytask.delete', { id })
                      .then(() => {
                        setEditingTask(null);
                        return reloadTasks();
                      })
                      .catch((err) => props.onError(err.message));
                  },
                },
                t('delete'),
              ),
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditingTask(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveTask }, t('save')),
            ),
        )
      : null,
    showNew
      ? h(
          Modal,
          { title: t('studyTaskNew'), onClose: () => setShowNew(false) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTitle')),
              h('input', {
                className: 'lp-input',
                value: newTitle,
                onChange: (event) => setNewTitle(event.target.value),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskPath')),
              h('input', {
                className: 'lp-input',
                value: newPath,
                onChange: (event) => setNewPath(event.target.value),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTemplate')),
              h(Dropdown, {
                value: newTemplate,
                onChange: setNewTemplate,
                options: TEMPLATE_OPTIONS,
              }),
            ),
            h(ShelfPicker, {
              t,
              items: props.shelf,
              selected: newShelf,
              onChange: setNewShelf,
            }),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => setShowNew(false) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: createTask }, t('studyTaskAdd')),
            ),
        )
      : null,
    subjectEditing
      ? h(
          Modal,
          { title: t('studySubjectEdit'), onClose: () => setSubjectEditing(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studySubjectTitle')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.title,
                onChange: (event) => setSubjectForm({ ...subjectForm, title: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyExamDate')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.examDate,
                placeholder: t('studyExamDateHint'),
                onChange: (event) => setSubjectForm({ ...subjectForm, examDate: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyNote')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.note,
                onChange: (event) => setSubjectForm({ ...subjectForm, note: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => setSubjectEditing(null) }, t('cancel')),
              h(
                'button',
                {
                  className: 'lp-btn',
                  onClick: () => {
                    const id = subjectEditing.id;
                    api('subject.update', {
                      id,
                      patch: {
                        title: subjectForm.title.trim(),
                        examDate: subjectForm.examDate.trim(),
                        note: subjectForm.note,
                      },
                    })
                      .then(() => {
                        setSubjectEditing(null);
                        return props.onReload();
                      })
                      .catch((err) => props.onError(err.message));
                  },
                },
                t('save'),
              ),
            ),
        )
      : null,
    h('div', { className: 'lp-section' }, `1. ${t('studySubjects')}`),
    data.subjects.length === 0 ? h('div', { className: 'lp-empty' }, t('studyNoSubject')) : null,
    data.subjects.map((subject) => {
      const entries = data.plan.filter((entry) => entry.subjectId === subject.id);
      const done = entries.filter((entry) => entry.doneAt).length;
      return h(
        'div',
        { key: subject.id, className: 'lp-group' },
        h(
          'div',
          {
            className: 'lp-group-head',
            style: { cursor: 'pointer' },
            onClick: () => {
              setSubjectEditing(subject);
              setSubjectForm({
                title: subject.title,
                examDate: subject.examDate || '',
                note: subject.note || '',
              });
            },
          },
          h('span', null, subject.title),
          subject.examDate
            ? h('span', { className: 'lp-meta' }, `${t('studyExam')} ${subject.examDate}`)
            : h('span', { className: 'lp-meta' }, t('studyNoExam')),
          h('span', { className: 'lp-meta' }, `${done}/${entries.length}`),
          h(
            'button',
            {
              className: 'lp-btn-ghost',
              onClick: (event) => {
                event.stopPropagation();
                generate(subject.id);
              },
              disabled: busy === subject.id,
            },
            busy === subject.id ? '…' : t('studyGenerate'),
          ),
        ),
      );
    }),
    result
      ? h(
          'div',
          { className: 'lp-meta' },
          `${t('studyGenerated')} ${result.created}${
            result.unscheduled ? ` · ${t('studyUnscheduled')} ${result.unscheduled}` : ''
          }`,
        )
      : null,
    h('div', { className: 'lp-section' }, `2. ${t('studyUpcoming')}`),
    upcoming.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoPlan'))
      : upcoming.map((entry) =>
          h(
            'div',
            {
              key: entry.id,
              className: 'lp-tree-row',
              draggable: true,
              onDragStart: (event) => {
                dragPlan.current = entry.id;
                event.dataTransfer.setData('text/plain', entry.id);
                event.dataTransfer.effectAllowed = 'move';
              },
              onDragOver: (event) => {
                if (!dragPlan.current) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              },
              onDrop: (event) => {
                event.preventDefault();
                const moving = dragPlan.current || event.dataTransfer.getData('text/plain');
                dragPlan.current = '';
                if (!moving || moving === entry.id) return;
                api('plan.move', { id: moving, date: entry.date })
                  .then(() => props.onReload())
                  .catch((err) => props.onError(err.message));
              },
            },
            h('span', { className: 'lp-meta' }, entry.date.slice(5)),
            h(
              'span',
              { className: 'lp-title' },
              (data.topics.find((topic) => topic.id === entry.topicId) || {}).title || entry.kind,
            ),
            h('span', { className: 'lp-badge' }, `${entry.minutes}${t('studyMinuteUnit')}`),
            h('span', { className: 'lp-meta' }, entry.doneAt ? t('studyDone') : ''),
          ),
        ),
  );
}
