function StudyOverview(props) {
  const t = props.t;
  // The learning data comes from the parent page, which every tab shares.
  const data = props.data || null;
  const [tip, setTip] = React.useState(null);
  const [error, setError] = React.useState('');
  const reload = () => {
    if (typeof props.onReload === 'function') props.onReload();
    return api('tip')
      .then((next) => {
        setTip(next);
        setError('');
      })
      .catch((err) => setError(err.message));
  };
  React.useEffect(() => {
    reload();
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
  const todayKey = dayKey(new Date(Date.now() - 4 * 3600 * 1000));
  const todayPlan = ((data && data.plan) || []).filter((entry) => entry.date === todayKey);
  const dueMistakes = ((data && data.mistakes) || []).filter((entry) => entry.due);
  // Mastery is owned by the tutor: the page only displays it.
  const masteryLabel = (value) => `${Math.min(10, Math.max(0, Number(value) || 0))}/10`;
  return h(
    'div',
    { className: 'lp-body' },
    error ? h('div', { className: 'lp-err' }, error) : null,
    tip && tip.text
      ? h(
          'div',
          { className: 'lp-card', style: { marginBottom: 8 } },
          h('div', { className: 'lp-card-title' }, t('studyTipTitle')),
          h(
            'div',
            { className: 'lp-card-meta', style: { whiteSpace: 'pre-wrap', lineHeight: 1.6 } },
            tip.text,
          ),
        )
      : null,
    h(
      'div',
      { className: 'lp-toolbar' },
      h('span', { className: 'lp-meta' }, `1. ${t('studyTodayPlan')} ${todayPlan.filter((entry) => !entry.doneAt).length}/${todayPlan.length}`),
      h('span', { className: 'lp-meta' }, `· ${t('studyDue')} ${due.length}`),
      h('div', { style: { flex: 1 } }),
    ),
    todayPlan.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoTodayPlan'))
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
    h('div', { className: 'lp-section' }, `2. ${t('studyDue')} · ${due.length}`),
    due.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoDue'))
      : due.map((topic) =>
          h(
            'div',
            { key: topic.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title' }, topic.title),
          ),
        ),
    h('div', { className: 'lp-section' }, `3. ${t('studyMistakeReview')} · ${dueMistakes.length}`),
    dueMistakes.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoMistake'))
      : dueMistakes.map((mistake) =>
          h(
            'div',
            { key: mistake.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title', title: mistake.reason || '' }, mistake.question),
            h('span', { className: 'lp-meta' }, mistake.answer),
            h('button', { className: 'lp-btn-ghost', onClick: () => finishMistake(mistake) }, t('studyFinish')),
          ),
        ),
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
