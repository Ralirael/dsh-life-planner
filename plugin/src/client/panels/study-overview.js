function TodayStudyProgress({ t, tasks }) {
  if (!tasks.length) return null;
  const done = (task) => task.state === 'done' || task.doneToday === true;
  const completed = tasks.filter(done).length;
  const label = t('studyTodayCompleted').replace('{n}', completed).replace('{total}', tasks.length);
  return h('div', { className: 'lp-group lp-today-study-progress' },
    h('div', { className: 'lp-group-head lp-today-study-head' },
      h('strong', null, t('studyTodayTasks')),
      h('span', { className: 'lp-meta', role: 'status' }, label),
    ),
    tasks.map((task) =>
      h('div', { key: task.id, className: 'lp-tree-row lp-today-study-task', 'data-done': String(done(task)) },
        h('span', { className: 'lp-title', title: task.title }, task.title),
        h('div', { className: 'lp-today-study-targets lp-meta' },
          h('span', null, `${t('studyNewLabel')} ${task.answeredNew ?? 0}/${task.targetNew ?? task.dailyNew ?? 0}`),
          h('span', null, `${t('studyReviewLabel')} ${task.answeredReview ?? 0}/${task.targetReview ?? task.dailyReview ?? 0}`),
          done(task) ? h('span', { className: 'lp-today-study-done' }, t('studyDone')) : null,
        ),
      ),
    ),
  );
}

function StudyOverview(props) {
  const t = props.t;
  // The learning data comes from the parent page, which every tab shares.
  const data = props.data || null;
  const [tip, setTip] = React.useState(null);
  const [error, setError] = React.useState('');
  const [studyTasks, setStudyTasks] = React.useState(null);
  const [progressError, setProgressError] = React.useState('');
  const loadTip = () => api('tip').then(setTip).catch((err) => setError(err.message));
  const reload = () => {
    if (typeof props.onReload === 'function') props.onReload();
    return loadTip();
  };
  React.useEffect(() => {
    loadTip();
    const timer = setInterval(loadTip, 30000);
    return () => clearInterval(timer);
  }, []);
  React.useEffect(() => {
    let active = true;
    const loadProgress = () => {
      if (document.visibilityState === 'hidden') return;
      api('study-tasks').then((rows) => {
        if (!active) return;
        setStudyTasks(Array.isArray(rows) ? rows : []);
        setProgressError('');
      }).catch((err) => {
        if (active) setProgressError(err.message);
      });
    };
    loadProgress();
    const timer = setInterval(loadProgress, 10000);
    document.addEventListener('visibilitychange', loadProgress);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', loadProgress);
    };
  }, []);
  const finishPlan = (entry) =>
    api('plan.done', { id: entry.id })
      .then(reload)
      .catch((err) => setError(err.message));
  const finishMistake = (mistake) =>
    api('mistake.review', { id: mistake.id, days: 3 })
      .then(reload)
      .catch((err) => setError(err.message));
  const subjects = (data && data.subjects) || [];
  const topics = (data && data.topics) || [];
  const due = topics.filter((topic) => topic.due);
  // Study days roll over at 04:00, like the host-side scheduler.
  const todayKey = studyLocalDayKey();
  const todayPlan = ((data && data.plan) || []).filter((entry) => entry.date === todayKey);
  const todayTasks = (studyTasks || []).filter((task) => task.state !== 'todo' && !task.scheduled);
  const dueMistakes = ((data && data.mistakes) || []).filter((entry) => entry.due);
  const date = new Date(todayKey + 'T12:00:00');
  const adviceLines = (tip?.text?.trim() || t('tipPending')).split(/\r?\n/);
  // Mastery is owned by the tutor: the page only displays it.
  const masteryLabel = (value) => `${Math.min(10, Math.max(0, Number(value) || 0))}/10`;
  return h(
    'div',
    { className: 'lp-body lp-study-today' },
    error ? h('div', { className: 'lp-err' }, error) : null,
    progressError ? h('div', { className: 'lp-err', role: 'alert' }, progressError) : null,
    h('header', { className: 'lp-study-today-head' },
      h('h2', null, t('dayLabel').replace('{m}', String(date.getMonth() + 1)).replace('{d}', String(date.getDate())),
        h('small', null, weekdayLabels(t)[(date.getDay() + 6) % 7])),
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: props.onOpenPlan }, t('studyTabPlan') + ' ›')),
    h('div', { className: 'lp-study-today-grid' },
    h('section', { className: 'lp-card lp-study-today-primary' },
    h('div', { className: 'lp-card-title' }, t('studyTodayPlan')),
    h(TodayStudyProgress, { t, tasks: todayTasks }),
    todayPlan.length ? h(
      'div',
      { className: 'lp-toolbar' },
          h('span', { className: 'lp-meta' }, t('studyTodayCompleted').replace('{n}', todayPlan.filter((entry) => entry.doneAt).length).replace('{total}', todayPlan.length)),
    ) : null,
    todayPlan.length === 0
      ? studyTasks && !todayTasks.length ? h('div', { className: 'lp-empty' }, t('studyNoTodayPlan')) : null
      : todayPlan.map((entry) =>
          h(
            'div',
            { key: entry.id, className: 'lp-tree-row', 'data-done': String(Boolean(entry.doneAt)) },
            h(
              'span',
              { className: 'lp-title' },
              (topics.find((topic) => topic.id === entry.topicId) || {}).title || entry.kind,
            ),
            h('span', { className: 'lp-badge' }, entry.kind === 'review' ? t('masteryReview') : t('masteryLearning')),
            h('span', { className: 'lp-meta' }, `${entry.minutes}${t('studyMinuteUnit')}`),
            entry.materials && entry.materials.length > 0
              ? h(
                  'span',
                  { className: 'lp-meta', title: entry.materials.map((one) => one.title).join('、') },
                  `📎${entry.materials.length}`,
                )
              : null,
            entry.doneAt
              ? h('span', { className: 'lp-meta' }, t('studyDone'))
              : h('button', { className: 'lp-btn-ghost', onClick: () => finishPlan(entry) }, t('studyFinish')),
          ),
        ),
    ),
    h('aside', { className: 'lp-study-today-review' },
    h('section', { className: 'lp-card' },
    h('div', { className: 'lp-study-today-card-title' }, h('strong', null, t('studyDue')), h('span', { className: 'lp-meta' }, due.length)),
    due.length === 0
      ? h('div', { className: 'lp-meta' }, t('studyNoDue'))
      : due.map((topic) =>
          h(
            'div',
            { key: topic.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title' }, topic.title),
          ),
        ),
    ),
    h('section', { className: 'lp-card' },
    h('div', { className: 'lp-study-today-card-title' }, h('strong', null, t('studyMistakeReview')), h('span', { className: 'lp-meta' }, dueMistakes.length)),
    dueMistakes.length === 0
      ? h('div', { className: 'lp-meta' }, t('studyNoMistake'))
      : dueMistakes.map((mistake) =>
          h(
            'div',
            { key: mistake.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title', title: mistake.reason || '' }, mistake.question),
            h('span', { className: 'lp-meta' }, mistake.answer),
            h('button', { className: 'lp-btn-ghost', onClick: () => finishMistake(mistake) }, t('studyFinish')),
          ),
        ),
    )),
    ),
    h('details', { className: 'lp-card lp-study-advice' },
      h('summary', null,
        h('strong', null, t('studyTipTitle')),
        tip ? h('span', { className: 'lp-meta' }, t(tip.source === 'deepseek' ? 'tipDeepSeek' : 'tipLocal')) : null,
        h('span', { className: 'lp-advice-excerpt' }, adviceExcerpt(adviceLines) || t('tipPending'))),
      h('div', { className: 'lp-advice-copy' }, ...adviceBlocks(adviceLines))),
    subjects.map((subject) =>
      h(
        'div',
        { key: subject.id, className: 'lp-group' },
        h('div', { className: 'lp-group-head' }, h('span', null, subject.title)),
        topics
          .filter((topic) => topic.subjectId === subject.id)
          .map((topic) =>
            h(
              'div',
              { key: topic.id, className: 'lp-tree-row' },
              h('span', { className: 'lp-title' }, topic.title),
              h(
                'span',
                { className: 'lp-badge', 'data-mastery': topic.mastery, title: t('masteryReadOnly') },
                masteryLabel(topic.mastery),
              ),
            ),
          ),
      ),
    ),
  );
}
