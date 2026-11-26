function SessionSwitch(props) {
  const t = props.t;
  const sessionId = props.sessionId;
  const [enabled, setEnabled] = React.useState(false);
  const [trackedSession, setTrackedSession] = React.useState('');

  React.useEffect(() => {
    if (!sessionId) return undefined;
    let alive = true;
    api('session?sessionId=' + encodeURIComponent(sessionId))
      .then((data) => {
        if (alive) {
          setEnabled(Boolean(data.enabled));
          setTrackedSession(data.studyTracking ? sessionId : '');
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sessionId]);

  React.useEffect(() => {
    if (!sessionId || trackedSession !== sessionId) return undefined;
    const tracker = globalThis.crypto.randomUUID();
    let lastActivity = Date.now();
    let running = false;
    const post = (active) => {
      if (!active && !running) return;
      running = active;
      fetch(new URL('life-planner/api/habit.beat', document.baseURI), {
        method: 'POST', keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, tracker, active }),
      }).catch(() => {});
    };
    const tick = () => post(document.visibilityState === 'visible' && document.hasFocus() && Date.now() - lastActivity < 300000);
    const activity = () => { lastActivity = Date.now(); if (!running) tick(); };
    const stop = () => post(false);
    const events = ['pointerdown', 'keydown', 'wheel'];
    for (const event of events) document.addEventListener(event, activity, { passive: true });
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', activity);
    window.addEventListener('blur', stop);
    window.addEventListener('pagehide', stop);
    const timer = setInterval(tick, 20000);
    tick();
    return () => {
      clearInterval(timer);
      for (const event of events) document.removeEventListener(event, activity);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', activity);
      window.removeEventListener('blur', stop);
      window.removeEventListener('pagehide', stop);
      stop();
    };
  }, [sessionId, trackedSession]);

  const flip = () => {
    const next = !enabled;
    setEnabled(next);
    api('session.toggle', { sessionId, enabled: next }).catch(() => setEnabled(!next));
  };

  return h(
    'button',
    {
      className: 'lp-switch',
      type: 'button',
      role: 'switch',
      'aria-checked': String(enabled),
      'data-on': String(enabled),
      title: enabled ? t('switchTipOn') : t('switchTipOff'),
      onClick: flip,
    },
    h('span', { className: 'lp-switch-label' }, t('switchLabel')),
    h('span', { className: 'lp-switch-track' }, h('span', { className: 'lp-switch-knob' })),
    h('span', { className: 'lp-switch-state' }, enabled ? t('stateOn') : t('stateOff')),
  );
}
