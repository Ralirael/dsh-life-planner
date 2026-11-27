function StudyAdvice({ t, tip }) {
  const text = (tip?.text || t('tipPending')).trim();
  const lead = text.split(/\r?\n/, 1)[0].replace(/\*\*([^*]+)\*\*/g, '$1');
  return h(
    'details',
    { className: 'lp-workspace-card lp-study-advice' },
    h('summary', null,
      h('span', { className: 'lp-advice-heading' },
        h('span', { className: 'lp-overview-title' }, t('studyTipTitle')),
        tip ? h('span', { className: 'lp-advice-source' },
          t(tip.source === 'deepseek' ? 'studyAdviceDeepSeek' : 'studyAdviceLocal'),
        ) : null,
        h('span', { className: 'lp-chevron', 'data-direction': 'down', 'aria-hidden': true }),
      ),
      h('span', { className: 'lp-advice-preview', 'aria-hidden': true }, lead),
    ),
    h('div', { className: 'lp-advice-text' },
      // Advice can contain simple emphasis. Keep the response as text nodes.
      text.split(/\r?\n\s*\r?\n/).map((paragraph, paragraphIndex) =>
        h('p', { key: paragraphIndex }, paragraph.split(/(\*\*[^*\n]+\*\*)/g).map((part, partIndex) =>
          partIndex % 2 ? h('strong', { key: partIndex }, part.slice(2, -2)) : part,
        )),
      ),
    ),
  );
}

function StudyOverview({ t, data, onReload, onOpenPlan }) {
  const [tip, setTip] = React.useState(null);
  const [error, setError] = React.useState('');
  const loadTip = () => api('tip').then(setTip).catch((err) => setError(err.message));
  const reload = () => {
    if (typeof onReload === 'function') onReload();
    return loadTip();
  };
  React.useEffect(() => {
    loadTip();
    const timer = setInterval(loadTip, 30000);
    return () => clearInterval(timer);
  }, []);
  const finishPlan = (entry) =>
    api('plan.done', { id: entry.id })
      .then(reload)
      .catch((err) => setError(err.message));
  const finishMistake = (mistake) =>
    api('mistake.review', { id: mistake.id, days: 3 })
      .then(reload)
      .catch((err) => setError(err.message));
  const subjects = data?.subjects || [];
  const topics = data?.topics || [];
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const due = topics.filter((topic) => topic.due);
  // Study days roll over at 04:00, like the host-side scheduler.
  const studyDate = new Date(Date.now() - 4 * 3600 * 1000);
  const todayKey = dayKey(studyDate);
  const dateLabel = t('dayLabel')
    .replace('{m}', String(studyDate.getMonth() + 1))
    .replace('{d}', String(studyDate.getDate()));
  const weekday = weekdayLabels(t)[(studyDate.getDay() + 6) % 7];
  const todayPlan = (data?.plan || []).filter((entry) => entry.date === todayKey);
  const dueMistakes = (data?.mistakes || []).filter((entry) => entry.due);
  const completed = todayPlan.filter((entry) => entry.doneAt).length;
  const progressLabel = t('studyPlanProgress')
    .replace('{n}', String(completed)).replace('{total}', String(todayPlan.length));
  const masteryLabel = (value) => `${Math.min(10, Math.max(0, Number(value) || 0))}/10`;

  const reviewCard = (title, entries, empty, renderRow) =>
    h(
      'section',
      { className: 'lp-workspace-card lp-overview-card' },
      h('header', { className: 'lp-overview-card-head' },
        h('h2', { className: 'lp-overview-title' }, title),
        h('span', { className: 'lp-overview-count', 'data-has-items': String(entries.length > 0) }, entries.length),
      ),
      entries.length
        ? h('ul', { className: 'lp-overview-list' }, entries.map(renderRow))
        : h('p', { className: 'lp-overview-empty' }, empty),
    );

  return h(
    'div',
    { className: 'lp-body lp-study-overview' },
    h('div', { className: 'lp-study-overview-layout' },
      h('header', { className: 'lp-overview-heading' },
        h('h1', null, h('time', { dateTime: todayKey }, dateLabel),
          h('span', { className: 'lp-overview-weekday' }, ' · ' + weekday),
        ),
        h('button', { className: 'lp-btn-ghost lp-overview-plan-link', type: 'button', onClick: onOpenPlan },
          t('studyTabPlan'),
          h('span', { className: 'lp-chevron', 'data-direction': 'right', 'aria-hidden': true }),
        ),
      ),
      error ? h('div', { className: 'lp-err', role: 'alert' }, error) : null,
      h('div', { className: 'lp-study-overview-columns' },
        h('section', { className: 'lp-workspace-card lp-overview-card lp-overview-plan' },
          h('header', { className: 'lp-overview-card-head' },
            h('h2', { className: 'lp-overview-title' }, t('studyTodayPlan')),
            todayPlan.length ? h('span', { className: 'lp-overview-progress-label', 'aria-live': 'polite' }, progressLabel) : null,
          ),
          todayPlan.length
            ? h(React.Fragment, null,
                h('div', {
                  className: 'lp-overview-progress',
                  role: 'progressbar',
                  'aria-label': t('studyTodayPlan'),
                  'aria-valuemin': 0,
                  'aria-valuemax': todayPlan.length,
                  'aria-valuenow': completed,
                  'aria-valuetext': progressLabel,
                }, h('span', { style: { inlineSize: `${completed / todayPlan.length * 100}%` } })),
                h('ul', { className: 'lp-overview-list' }, todayPlan.map((entry) => {
                  const materialCount = entry.materials?.length || 0;
                  return h('li', { key: entry.id, className: 'lp-overview-row', 'data-done': Boolean(entry.doneAt) },
                    h('div', { className: 'lp-overview-row-main' },
                      h('span', { className: 'lp-overview-row-title' }, topicsById.get(entry.topicId)?.title || entry.kind),
                      h('div', { className: 'lp-overview-row-meta' },
                        h('span', null, t(entry.kind === 'review' ? 'masteryReview' : 'masteryLearning')),
                        entry.minutes > 0 ? h('span', null, `${entry.minutes}${t('studyMinuteUnit')}`) : null,
                        materialCount ? h('span', {
                          title: entry.materials.map((one) => one.title).join('、'),
                        }, t('studyPlanMaterials').replace('{n}', String(materialCount))) : null,
                      ),
                    ),
                    entry.doneAt
                      ? h('span', { className: 'lp-overview-done' }, t('studyDone'))
                      : h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => finishPlan(entry) }, t('studyFinish')),
                  );
                })),
              )
            : h('div', { className: 'lp-workspace-empty lp-overview-plan-empty' },
                h('span', { className: 'lp-empty-symbol' }, h(SidebarIcon, { variant: 'study', size: 19 })),
                h('p', null, t('studyNoTodayPlan')),
              ),
        ),
        h('div', { className: 'lp-overview-reviews' },
          reviewCard(t('studyDue'), due, t('studyNoDue'), (topic) =>
            h('li', { key: topic.id, className: 'lp-overview-row' },
              h('span', { className: 'lp-overview-row-title' }, topic.title),
            ),
          ),
          reviewCard(t('studyMistakeReview'), dueMistakes, t('studyNoMistake'), (mistake) =>
            h('li', { key: mistake.id, className: 'lp-overview-row' },
              h('div', { className: 'lp-overview-row-main' },
                h('span', { className: 'lp-overview-row-title', title: mistake.reason || '' }, mistake.question),
                h('div', { className: 'lp-overview-row-meta' }, mistake.answer),
              ),
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => finishMistake(mistake) }, t('studyFinish')),
            ),
          ),
        ),
      ),
      h(StudyAdvice, { t, tip }),
      subjects.length ? h('section', { className: 'lp-workspace-card lp-overview-card' },
        h('header', { className: 'lp-overview-card-head' },
          h('h2', { className: 'lp-overview-title' }, t('studySubjects')),
        ),
        h('div', { className: 'lp-overview-subjects' }, subjects.map((subject) =>
          h('div', { key: subject.id, className: 'lp-overview-subject' },
            h('h3', null, subject.title),
            h('ul', { className: 'lp-overview-list' }, topics
              .filter((topic) => topic.subjectId === subject.id)
              .map((topic) =>
                h('li', { key: topic.id, className: 'lp-overview-row' },
                  h('span', { className: 'lp-overview-row-title' }, topic.title),
                  h('span', {
                    className: 'lp-badge',
                    'data-mastery': topic.mastery,
                    title: t('masteryReadOnly'),
                  }, masteryLabel(topic.mastery)),
                ),
              )),
          ),
        )),
      ) : null,
    ),
  );
}
