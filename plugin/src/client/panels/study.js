function StudyPanel(props) {
  const t = props.t;
  const [tab, setTab] = React.useState('today');
  const [pageRef, scheme] = usePageScheme();
  const [settings, setSettings] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [shelf, setShelf] = React.useState([]);
  const [mistakes, setMistakes] = React.useState([]);
  const [habits, setHabits] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState({ learning: true, shelf: true, mistakes: true, habits: true });
  const markLoaded = (key) => setLoading((state) => (state[key] ? { ...state, [key]: false } : state));
  const loadHabits = () =>
    api('habits')
      .then((next) => {
        setHabits(next);
        markLoaded('habits');
      })
      .catch(() => markLoaded('habits'));
  React.useEffect(() => {
    loadHabits();
    const timer = setInterval(loadHabits, 60000);
    return () => clearInterval(timer);
  }, []);
  const loadLearning = () =>
    api('learning')
      .then((next) => {
        setData(next);
        markLoaded('learning');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('learning');
      });
  const loadShelf = () =>
    api('shelf')
      .then((next) => {
        setShelf(next);
        markLoaded('shelf');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('shelf');
      });
  const loadMistakes = () =>
    api('mistakes')
      .then((next) => {
        setMistakes(next);
        markLoaded('mistakes');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('mistakes');
      });
  React.useEffect(() => {
    loadLearning();
    loadShelf();
    loadMistakes();
  }, []);
  const openShelf = (item) =>
    api('shelf.open', { id: item.id })
      .then((result) => {
        if (result && result.opened === false) {
          setError(
            result.reason === 'missing'
              ? `${t('shelfMissing')}：${result.path}`
              : `${t('shelfOpenFailed')}：${result.path}`,
          );
          return;
        }
        setError('');
      })
      .catch((err) => setError(err.message));
  const tabs = [
    { key: 'today', label: t('studyTabToday') },
    { key: 'plan', label: t('studyTabPlan') },
    { key: 'shelf', label: t('studyTabShelf') },
    { key: 'mistakes', label: t('studyTabMistakes') },
    { key: 'habits', label: t('studyTabHabit') },
  ];
  return h(
    'div',
    {
      className: 'lp-page lp-study',
      ref: pageRef,
      'data-scheme': scheme,
      style: {
        colorScheme: scheme || 'light dark',
        '--lp-tone-low': PRIORITY_TONES[0].color,
        '--lp-tone-medium': PRIORITY_TONES[1].color,
        '--lp-tone-high': PRIORITY_TONES[2].color,
        '--lp-tone-highest': PRIORITY_TONES[3].color,
      },
    },
    h(
      'div',
      { className: 'lp-head' },
      h(
        'div',
        { className: 'lp-tabs' },
        tabs.map((item) =>
          h(
            'button',
            {
              key: item.key,
              className: 'lp-tab',
              'data-active': String(tab === item.key),
              onClick: () => setTab(item.key),
            },
            item.label,
          ),
        ),
      ),
      h('button', { className: 'lp-btn-ghost', type: 'button',
        onClick: () => api('settings').then(setSettings).catch((err) => setError(err.message)) }, t('settings')),
    ),
    error
      ? h('div', { className: 'lp-err', style: { padding: '8px 14px', margin: 0 } }, error)
      : null,
    loading.learning && !data
      ? h('div', { className: 'lp-empty' }, t('loading'))
      : tab === 'today'
        ? h(StudyOverview, { t, data, onReload: loadLearning, onOpenPlan: () => setTab('plan') })
        : null,
    tab === 'plan' ? h(StudyPlanTab, { t, data, shelf, onReload: loadLearning, onError: setError }) : null,
    tab === 'shelf'
      ? loading.shelf && shelf.length === 0
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(ShelfTab, { t, items: shelf, onReload: loadShelf, onOpen: openShelf, onError: setError })
      : null,
    tab === 'mistakes'
      ? loading.mistakes && mistakes.length === 0
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(MistakeTab, { t, items: mistakes, onReload: loadMistakes, onError: setError })
      : null,
    tab === 'habits'
      ? loading.habits && !habits
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(StudyHabitTab, { t, data: habits })
      : null,
    settings ? h(SettingsModal, { t, settings, initialPage: 'appearance',
      onClose: () => setSettings(null), onSaved: () => setSettings(null) }) : null,
  );
}
