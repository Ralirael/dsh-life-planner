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
  const [draft, setDraft] = React.useState('');
  const [collapsedSubjects, setCollapsedSubjects] = React.useState(new Set());
  const [showSubjectAdd, setShowSubjectAdd] = React.useState(false);
  const drag = React.useRef(null);
  const [dropTarget, setDropTarget] = React.useState('');
  const [scheduling, setScheduling] = React.useState(null);
  const [startAt, setStartAt] = React.useState('');
  const [savingSchedule, setSavingSchedule] = React.useState(false);
  const [scheduleError, setScheduleError] = React.useState('');
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
  const reloadTasks = (fresh = false) =>
    api('study-tasks', undefined, { fresh })
      .then((list) => setTasks(Array.isArray(list) ? list : []))
      .catch((error) => props.onError(error.message));
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
        return reloadTasks(true);
      })
      .catch((err) => props.onError(err.message));
  };
  const openTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, workspacePath: task.workspacePath, template: normalizeTemplate(task.template), grading: task.grading || 'neutral', subjectId: task.subjectId || '' });
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
        grading: taskForm.grading,
        ...(taskForm.subjectId !== (editingTask.subjectId || '') ? { subjectId: taskForm.subjectId || null } : {}),
      },
    })
      .then(() => api('studytask.materials', { id: editingTask.id, shelfIds: taskShelf }))
      .then(() => {
        setEditingTask(null);
        return reloadTasks(true);
      })
      .catch((err) => props.onError(err.message));
  };
  const addSubject = (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    api('subject.add', { title })
      .then(() => { setShowSubjectAdd(false); return props.onReload(); })
      .catch((err) => props.onError(err.message));
  };


  const taskState = (task) => task.state || (task.doneToday ? 'done' : task.scheduled ? 'todo' : 'doing');
  const active = tasks.filter((task) => taskState(task) === 'doing');
  const done = tasks.filter((task) => taskState(task) === 'done');
  const future = tasks.filter((task) => taskState(task) === 'todo').sort((a, b) =>
    String(a.scheduledAt || '~').localeCompare(String(b.scheduledAt || '~')));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const upcoming = data.plan.filter((entry) => !entry.doneAt && entry.date >= dayKey(new Date(Date.now() - 4 * 3600000)));
  const fail = (error) => props.onError(error.message);
  const change = (method, body, reload) => {
    props.onError('');
    return api(method, body).then(reload).catch(fail);
  };
  const startDrag = (event, kind, id) => {
    drag.current = { kind, id };
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };
  const endDrag = () => {
    drag.current = null;
    setDropTarget('');
  };
  const showDrop = (event, key, kind) => {
    if (drag.current?.kind !== kind) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(key);
  };
  const readDrop = (event, kind) => {
    if (drag.current?.kind !== kind) return '';
    event.preventDefault();
    event.stopPropagation();
    const id = drag.current.id;
    endDrag();
    return id;
  };
  const dropZone = (key) => ({
    'data-drop': dropTarget === key ? 'inside' : undefined,
    onDragOver: (event) => showDrop(event, key, 'task'),
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
    },
    onDrop: (event) => {
      const task = taskById.get(readDrop(event, 'task'));
      if (!task || taskState(task) === 'done' || (taskState(task) === 'todo') === (key === 'future')) return;
      if (key === 'future') showSchedule(task);
      else change('studytask.schedule', { id: task.id, future: false }, () => reloadTasks(true));
    },
  });
  const showSchedule = (task) => {
    setScheduling(task);
    setStartAt(task.scheduledAt ? toLocalInput(task.scheduledAt) : '');
    setScheduleError('');
  };
  const saveSchedule = (event) => {
    event.preventDefault();
    if (!scheduling) return;
    const task = scheduling;
    const timestamp = startAt ? new Date(startAt).toISOString() : '';
    props.onError('');
    setSavingSchedule(true);
    setScheduleError('');
    api('studytask.schedule', { id: task.id, future: true, startAt: timestamp })
      .then(() => {
        setScheduling(null);
        return reloadTasks(true);
      })
      .catch((error) => setScheduleError(error.message))
      .finally(() => setSavingSchedule(false));
  };

  const sectionTitle = (label, count, action) => h('div', { className: 'lp-study-section-head' },
    h('h3', null, label), h('span', { className: 'lp-badge' }, count), action);
  const editTitle = (value, action) => h('button', {
    type: 'button',
    className: 'lp-title lp-study-task-title',
    title: value + ' · ' + t('studyDoubleClick'),
    onDoubleClick: action,
    onClick: (event) => { if (event.detail === 0) action(); },
  }, value);

  const renderTask = (task) => {
    const state = taskState(task);
    const schedule = state === 'todo' ? (task.scheduledAt ?
      toLocalInput(task.scheduledAt).replace('T', ' ') : t('studyUnscheduledStart')) : null;
    return h('div', {
      key: task.id, className: 'lp-row lp-study-task', 'data-status': state,
      draggable: state !== 'done',
      onDragStart: (event) => startDrag(event, 'task', task.id),
      onDragEnd: endDrag,
    },
      h('span', { className: 'lp-drag-handle', 'aria-hidden': true }, state === 'done' ? '✓' : '⠿'),
      h('div', { className: 'lp-study-task-main' },
        editTitle(task.title, () => openTask(task)),
        h('div', { className: 'lp-study-task-detail lp-meta' },
          schedule || (t('studyNewLabel') + ' ' + (task.answeredNew || 0) + '/' + (task.targetNew || 0) +
            ' · ' + t('studyReviewLabel') + ' ' + (task.answeredReview || 0) + '/' + (task.targetReview || 0)),
          task.missing ? h('span', { className: 'lp-badge' }, t('studyTaskMissing')) : null)),
      h('span', { className: 'lp-actions lp-study-actions' },
        state === 'done' ? null : h('button', {
          className: 'lp-mini', type: 'button', title: t(state === 'todo' ? 'studySetStart' : 'studySchedule'),
          'aria-label': t(state === 'todo' ? 'studySetStart' : 'studySchedule'), onClick: () => showSchedule(task),
        }, '◷'),
        state === 'todo' ? h('button', {
          className: 'lp-mini', type: 'button', title: t('studyStartNow'), 'aria-label': t('studyStartNow'),
          onClick: () => change('studytask.schedule', { id: task.id, future: false }, () => reloadTasks(true)),
        }, '▶') : null,
        h('button', {
          className: 'lp-mini', type: 'button', title: t('studyTaskEdit'), 'aria-label': t('studyTaskEdit'), onClick: () => openTask(task),
        }, '⋯')));
  };
  const moveSubject = (id, anchorId, after) => change('subject.move', { id, anchorId, after }, props.onReload);
  const linkTask = (subjectId, taskId) => change('subject.task', { subjectId, taskId }, () => reloadTasks(true));
  const afterMiddle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY >= bounds.top + bounds.height / 2;
  };
  const toggleSubject = (id) => setCollapsedSubjects((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const editSubject = (subject) => {
    setSubjectEditing(subject);
    setSubjectForm({ title: subject.title, examDate: subject.examDate || '', note: subject.note || '' });
  };
  const renderSubject = (subject, index) => {
    const linked = tasks.filter((task) => task.subjectId === subject.id);
    const open = !collapsedSubjects.has(subject.id);
    return h('div', { key: subject.id, className: 'lp-study-subject' },
      h('div', {
        className: 'lp-row lp-study-subject-head',
        draggable: true,
        'data-drop': dropTarget === subject.id + ':before' ? 'before' :
          dropTarget === subject.id + ':after' ? 'after' : dropTarget === subject.id ? 'inside' : undefined,
        onDragStart: (event) => startDrag(event, 'subject', subject.id),
        onDragEnd: endDrag,
        onDragOver: (event) => {
          if (drag.current?.kind === 'task') showDrop(event, subject.id, 'task');
          else if (drag.current?.id !== subject.id) {
            showDrop(event, subject.id + (afterMiddle(event) ? ':after' : ':before'), 'subject');
          }
        },
        onDragLeave: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
        },
        onDrop: (event) => {
          if (drag.current?.kind === 'task') {
            const id = readDrop(event, 'task');
            if (!id) return;
            setCollapsedSubjects((current) => {
              const next = new Set(current);
              next.delete(subject.id);
              return next;
            });
            linkTask(subject.id, id);
          } else {
            const id = readDrop(event, 'subject');
            if (id && id !== subject.id) moveSubject(id, subject.id, afterMiddle(event));
          }
        },
      },
        h('button', {
          className: 'lp-caret', type: 'button', disabled: !linked.length,
          'data-open': String(open), 'data-empty': String(!linked.length),
          'aria-expanded': open, 'aria-label': t(open ? 'collapseAll' : 'expandAll'),
          onClick: () => toggleSubject(subject.id),
        }, '▾'),
        editTitle(subject.title, () => editSubject(subject)),
        h('span', { className: 'lp-meta' }, linked.length),
        subject.examDate ? h('span', { className: 'lp-meta' }, t('studyExam') + ' ' + subject.examDate) : null,
        h('span', { className: 'lp-actions lp-study-actions' },
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studyMoveUp'), 'aria-label': t('studyMoveUp'),
            disabled: index === 0, onClick: () => moveSubject(subject.id, data.subjects[index - 1].id, false),
          }, '↑'),
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studyMoveDown'), 'aria-label': t('studyMoveDown'),
            disabled: index === data.subjects.length - 1, onClick: () => moveSubject(subject.id, data.subjects[index + 1].id, true),
          }, '↓'),
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studySubjectEdit'), 'aria-label': t('studySubjectEdit'), onClick: () => editSubject(subject),
          }, '⋯'))),
      open && linked.length ? h('div', { className: 'lp-children lp-study-links' },
        linked.map((task) => h('div', { key: task.id, className: 'lp-row lp-study-link', 'data-status': taskState(task) },
          editTitle(task.title, () => openTask(task)),
          h('span', { className: 'lp-meta' }, t('col' + ({ todo: 'Todo', doing: 'Doing', done: 'Done' }[taskState(task)])))))) : null);
  };
  return h(
    'div',
    { className: 'lp-body lp-study-planner' },
    h('div', { className: 'lp-study-planner-grid' },
      h('section', { className: 'lp-card lp-study-section', ...dropZone('active') },
        sectionTitle(t('studyTaskList'), active.length,
          h('button', { className: 'lp-btn', type: 'button', onClick: () => setShowNew(true) }, '+ ' + t('studyTaskAdd'))),
        weekMinutes !== null ? h('div', { className: 'lp-meta' }, t('studyWeekPlan').replace('{n}', weekMinutes)) : null,
        active.length ? active.map(renderTask) : h('div', { className: 'lp-empty' }, t('studyNoActive'))),
      h('section', { className: 'lp-card lp-study-section', ...dropZone('future') },
        sectionTitle(t('studyUpcoming'), future.length),
        future.length ? future.map(renderTask) : h('div', { className: 'lp-empty' }, t('studyDropFuture')))),
    h('section', { className: 'lp-card lp-study-section' },
      sectionTitle(t('studySubjects'), data.subjects.length, h('button', {
        className: 'lp-btn-ghost', type: 'button', 'aria-expanded': showSubjectAdd,
        onClick: () => setShowSubjectAdd(!showSubjectAdd),
      }, showSubjectAdd ? t('cancel') : '+ ' + t('studyAddSubject'))),
      showSubjectAdd ? h('form', { className: 'lp-toolbar', onSubmit: addSubject },
        h('input', {
          className: 'lp-input', autoFocus: true, value: draft, placeholder: t('studyAddSubject'), 'aria-label': t('studyAddSubject'),
          onChange: (event) => setDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'submit' }, t('addButton'))) : null,
      data.subjects.length ? data.subjects.map(renderSubject) : h('div', { className: 'lp-empty' }, t('studyNoSubject'))),
    done.length ? h('details', { className: 'lp-study-section lp-card' },
      h('summary', null, t('studyTaskDoneToday') + ' · ' + done.length), done.map(renderTask)) : null,
    upcoming.length ? h('details', { className: 'lp-study-section lp-card' },
      h('summary', null, t('studyExistingPlans')),
      upcoming.map((entry) => h('label', { key: entry.id, className: 'lp-study-link' },
        h('span', null, entry.title || data.topics.find((topic) => topic.id === entry.topicId)?.title || entry.kind),
        h('input', {
          type: 'date', className: 'lp-input', value: entry.date,
          onChange: (event) => {
            if (event.target.value) change('plan.move', { id: entry.id, date: event.target.value }, props.onReload);
          },
        })))) : null,
    scheduling ? h(Modal, { title: t('studySetStart') + ' · ' + scheduling.title, onClose: () => setScheduling(null) },
      h('form', { id: 'lp-study-schedule-form', className: 'lp-dialog-stack', onSubmit: saveSchedule },
        h('label', { className: 'lp-field' }, t('studyStartOptional'), h('input', {
          className: 'lp-input', type: 'datetime-local', value: startAt,
          onChange: (event) => setStartAt(event.target.value),
        })),
        h('p', { className: 'lp-meta' }, t('studyStartHint')),
        scheduleError ? h('p', { className: 'lp-err', role: 'alert' }, scheduleError) : null,
      ),
      h(DialogActions, null,
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setScheduling(null) }, t('cancel')),
        h('button', { className: 'lp-btn', type: 'submit', form: 'lp-study-schedule-form', disabled: savingSchedule }, t('save')),
      ),
    ) : null,
    editingTask ? h(
      Modal,
      { title: `${t('studyTaskEdit')} · ${editingTask.title}`, onClose: () => setEditingTask(null) },
      dialogField(t('studyTaskTitle'), {
        value: taskForm.title,
        onChange: (event) => setTaskForm({ ...taskForm, title: event.target.value }),
      }),
      dialogField(t('studyTaskPath'), {
        value: taskForm.workspacePath,
        onChange: (event) => setTaskForm({ ...taskForm, workspacePath: event.target.value }),
      }),
      h('div', { className: 'lp-dialog-grid' },
        dialogSelect(t('studyTaskTemplate'), {
          value: taskForm.template,
          onChange: (value) => setTaskForm({ ...taskForm, template: value }),
          options: TEMPLATE_OPTIONS,
        }),
        dialogSelect(t('studyGrading'), {
          value: taskForm.grading,
          onChange: (grading) => setTaskForm({ ...taskForm, grading }),
          options: ['strict', 'neutral', 'lenient'].map((value) => ({ value, label: t('studyGrading_' + value) })),
        }),
      ),
      h(DialogDisclosure, { title: t('studyTaskLinks') },
        dialogSelect(t('studySubjects'), {
          value: taskForm.subjectId,
          onChange: (subjectId) => setTaskForm({ ...taskForm, subjectId }),
          options: [
            { value: '', label: t('studyNoSubjectLink') },
            ...data.subjects.map((subject) => ({ value: subject.id, label: subject.title })),
          ],
        }),
        h(ShelfPicker, { t, items: props.shelf, selected: taskShelf, onChange: setTaskShelf }),
      ),
      h(DialogActions, null,
        h('button', {
          className: 'lp-btn-ghost lp-dialog-side-action',
          type: 'button',
          onClick: () => {
            const id = editingTask.id;
            if (!window.confirm(t('studyTaskDeleteConfirm'))) return;
            api('studytask.delete', { id })
              .then(() => {
                setEditingTask(null);
                return reloadTasks(true);
              })
              .catch((err) => props.onError(err.message));
          },
        }, t('delete')),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setEditingTask(null) }, t('cancel')),
        h('button', { className: 'lp-btn', type: 'button', onClick: saveTask }, t('save')),
      ),
    ) : null,
    showNew ? h(
      Modal,
      { title: t('studyTaskNew'), onClose: () => setShowNew(false) },
      dialogField(t('studyTaskTitle'), {
        value: newTitle,
        onChange: (event) => setNewTitle(event.target.value),
      }),
      dialogField(t('studyTaskPath'), {
        value: newPath,
        onChange: (event) => setNewPath(event.target.value),
      }),
      dialogSelect(t('studyTaskTemplate'), {
        value: newTemplate,
        onChange: setNewTemplate,
        options: TEMPLATE_OPTIONS,
      }),
      h(DialogDisclosure, { title: t('studyTaskShelf') },
        h(ShelfPicker, { t, items: props.shelf, selected: newShelf, onChange: setNewShelf }),
      ),
      h(DialogActions, null,
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setShowNew(false) }, t('cancel')),
        h('button', { className: 'lp-btn', type: 'button', onClick: createTask }, t('studyTaskAdd')),
      ),
    ) : null,
    subjectEditing ? h(
      Modal,
      { title: t('studySubjectEdit'), onClose: () => setSubjectEditing(null) },
      h('div', { className: 'lp-dialog-grid' },
        dialogField(t('studySubjectTitle'), {
          value: subjectForm.title,
          onChange: (event) => setSubjectForm({ ...subjectForm, title: event.target.value }),
        }),
        dialogField(t('studyExamDate'), {
          value: subjectForm.examDate,
          placeholder: t('studyExamDateHint'),
          onChange: (event) => setSubjectForm({ ...subjectForm, examDate: event.target.value }),
        }),
      ),
      dialogField(t('studyNote'), {
        rows: 2,
        value: subjectForm.note,
        onChange: (event) => setSubjectForm({ ...subjectForm, note: event.target.value }),
      }, 'textarea'),
      h(DialogActions, null,
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setSubjectEditing(null) }, t('cancel')),
        h('button', {
          className: 'lp-btn',
          type: 'button',
          onClick: () => {
            api('subject.update', {
              id: subjectEditing.id,
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
        }, t('save')),
      ),
    ) : null,
  );
}
