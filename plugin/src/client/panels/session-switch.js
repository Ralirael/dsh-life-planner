function SessionSwitch(props) {
  const t = props.t;
  const sessionId = props.sessionId;
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (!sessionId) return undefined;
    let alive = true;
    api('session?sessionId=' + encodeURIComponent(sessionId))
      .then((data) => {
        if (alive) setEnabled(Boolean(data.enabled));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sessionId]);

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
