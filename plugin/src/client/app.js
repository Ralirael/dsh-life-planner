return {
  inject: ['slots', 'locale'],
  __internals: { dayKey, groupByDay, monthMatrix, weekMatrix, topTask, openEntries, lunarDateLabel },
  apply(ctx) {
    let t = (key) => DICTS.zh[key] || key;
    try {
      ctx.locale.register(NS, 'zh', DICTS.zh);
      ctx.locale.register(NS, 'en', DICTS.en);
      t = ctx.locale.bind(NS);
    } catch (error) {
      console.error('[life-planner] locale registration failed, falling back to Chinese labels', error);
    }

    const seat = (label, register) => {
      try {
        register();
      } catch (error) {
        console.error(`[life-planner] could not register ${label}`, error);
      }
    };

    // Apply the saved skin and the full appearance model before the first panel.
    seat('skin', () => applySkin(currentSkin()));
    seat('appearance', () => {
      const initial = loadAppearance();
      applyAppearance(initial);
      // Paint first, then warm the images in idle time: a 2 MB photo must never
      // delay the panel. The second one follows the first.
      const warm = () => {
        hydrateBackgrounds(initial, ['planning'])
          .then(() => hydrateBackgrounds(initial, ['study']))
          .catch(() => {});
      };
      // The durable appearance lives on the host, so adopt it when it arrives.
      api('ui')
        .then((ui) => {
          if (!ui || (!ui.appearance && !ui.skins)) return;
          setHostUi(ui);
          const merged = loadAppearance();
          applyAppearance(merged);
          hydrateBackgrounds(merged).catch(() => {});
        })
        .catch(() => {});
      // Read the stored images the same way the settings dialog does, so the
      // background is live on boot instead of only after opening settings.
      const syncBackgrounds = () =>
        api('background.info')
          .then((info) => {
            if (!info) return;
            const current = loadAppearance();
            const next = {
              ...current,
              background: {
                planning: { ...current.background.planning, imageUrl: info.planning || current.background.planning.imageUrl || '' },
                study: { ...current.background.study, imageUrl: info.study || current.background.study.imageUrl || '' },
              },
            };
            applyAppearance(next);
            hydrateBackgrounds(next).catch(() => {});
          })
          .catch(() => {});
      setTimeout(syncBackgrounds, 50);
      setTimeout(syncBackgrounds, 900);
      if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, { timeout: 1500 });
      else setTimeout(warm, 200);
    });

    const reminderTicker = typeof document !== 'undefined' ? startBackgroundReminders(t) : null;
    if (reminderTicker && typeof ctx.effect === 'function') {
      ctx.effect(() => () => clearInterval(reminderTicker));
    }

    seat('sidebar.panellist', () =>
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'life-planner', order: 20, label: () => t('navLabel') },
          ({ size }) => h(SidebarIcon, { size, variant: 'planning' }),
        ),
      ),
    );

    seat('main', () =>
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'life-planner' }, () => h(Panel, { t })),
      ),
    );

    seat('main:study', () =>
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'life-planner-study' }, () =>
          h(StudyPanel, { t, scheme: pageScheme() }),
        ),
      ),
    );

    seat('sidebar.panellist:study', () =>
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'life-planner-study', order: 21, label: () => t('studyNav') },
          ({ size }) => h(SidebarIcon, { size, variant: 'study' }),
        ),
      ),
    );

    seat('conversation.session.header.utilities', () =>
      ctx.slots.inject('conversation.session.header.utilities', () =>
        ctx.slots.register(
          { name: 'conversation.session.header.utilities', id: 'life-planner-switch', order: -20 },
          (props) => h(SessionSwitch, { t, sessionId: props.sessionId }),
        ),
      ),
    );
  },
};
