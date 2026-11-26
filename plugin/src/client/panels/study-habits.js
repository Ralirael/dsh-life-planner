function StudyHabitTab(props) {
  const t = props.t;
  const fallback = { days: [], totalMinutes: 0, streak: 0, averageMinutes: 0, completionRate: 0 };
  const data = { ...fallback, ...(props.data || {}) };
  if (!Array.isArray(data.days)) data.days = [];
  const [week, setWeek] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    api('study-time')
      .then(setWeek)
      .catch((err) => setError(err.message));
  }, []);

  const labels = weekdayLabels(t);
  const max = Math.max(30, ...data.days.map((day) => Number(day.minutes) || 0));
  const plannedTotal = week
    ? (week.days || []).reduce((sum, day) => sum + (Number(day.planned) || 0), 0)
    : 0;
  const popularHours = (data.hours || []).filter((hour) => hour.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds).slice(0, 3);
  const duration = (seconds) => seconds >= 60 ? Math.round(seconds / 60) + t('studyMinuteUnit') : '< 1' + t('studyMinuteUnit');

  return h(
    'div',
    { className: 'lp-body' },
    h(
      'div',
      { className: 'lp-toolbar' },
      h('span', { className: 'lp-meta' }, `${t('habitStreak')} ${data.streak} ${t('habitDays')}`),
      h('span', { className: 'lp-meta' }, `${t('habitAvg')} ${data.averageMinutes}${t('studyMinuteUnit')}`),
      h('span', { className: 'lp-meta' }, `${t('habitRate')} ${data.completionRate}%`),
    ),
    error ? h('div', { className: 'lp-err' }, error) : null,
    h('div', { className: 'lp-card lp-study-section' },
      h('div', { className: 'lp-card-title' }, t('habitCompletion')),
      h('div', { className: 'lp-meta' }, t('habitStudyDone') + ' ' + (data.studyDoneDays || 0) + '/' + (data.studyGoalDays || 0)),
      h('div', { className: 'lp-meta' }, t('habitTaskDone') + ' ' + (data.planningCompleted || 0) +
        ' · ' + t('habitOnTime') + ' ' + (data.planningOnTime || 0) + '/' + (data.planningWithDeadline || 0)),
      popularHours.length ? h('div', { className: 'lp-meta' }, t('habitHourly') + ' · ' + popularHours.map((slot) =>
        String(slot.hour).padStart(2, '0') + ':00 (' + duration(slot.seconds) + ')').join(' · ')) : null),
    h('div', { className: 'lp-section' }, t('habitSessions')),
    (data.sessions || []).length ? data.sessions.map((session, index) =>
      h('div', { key: session.id, className: 'lp-tree-row' },
        h('span', { className: 'lp-title' }, session.title || t('studyNav') + ' ' + (index + 1)),
        h('span', { className: 'lp-meta' }, duration(session.seconds)))) :
      h('div', { className: 'lp-empty' }, t('habitNoTime')),
    h(
      'div',
      { className: 'lp-section' },
      `${t('timePlanTitle')} · ${t('timePlanTotal')} ${plannedTotal}${t('studyMinuteUnit')}`,
    ),
    week
      ? h(
          'div',
          { className: 'lp-week' },
          week.days.map((day, index) =>
            h(
              'div',
              { key: day.day, className: 'lp-week-day', 'data-planned': String(day.planned !== null) },
              h('div', { className: 'lp-meta' }, `${labels[index] || ''} ${day.day.slice(5)}`),
              h(
                'div',
                { className: 'lp-week-value' },
                day.planned === null ? '—' : `${day.planned}${t('studyMinuteUnit')}`,
              ),
              h('div', { className: 'lp-meta' }, `${t('timePlanActual')} ${day.actual}`),
            ),
          ),
        )
      : h('div', { className: 'lp-meta' }, t('timePlanLoading')),
    h('div', { className: 'lp-meta' }, t('timePlanAgentHint')),
    h('div', { className: 'lp-section' }, `${t('habitRecent')} · ${data.days.length}`),
    data.days.length === 0
      ? null
      : data.days.map((day) =>
          h(
            'div',
            { key: day.day, className: 'lp-tree-row' },
            h('span', { className: 'lp-meta' }, day.day.slice(5)),
            h(
              'span',
              { className: 'lp-fill', style: { display: 'flex', alignItems: 'center' } },
              h('span', {
                className: 'lp-bar',
                style: { width: `${Number.isFinite(day.minutes / max) ? Math.round((day.minutes / max) * 100) : 0}%` },
              }),
            ),
            h('span', { className: 'lp-meta' }, `${day.minutes}${t('studyMinuteUnit')}`),
            h(
              'span',
              { className: 'lp-meta' },
              day.segments > 1 ? t('habitSegments').replace('{n}', String(day.segments)) : '',
            ),
          ),
        ),
  );
}
