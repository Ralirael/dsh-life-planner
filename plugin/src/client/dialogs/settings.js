function SettingsModal(props) {
  const t = props.t;
  const [form, setForm] = React.useState(props.settings || {});
  React.useEffect(() => {
    if (props.settings) setForm(props.settings);
  }, [props.settings]);
  const [appearance, setAppearance] = React.useState(() => loadAppearance());
  const [page, setPage] = React.useState(props.initialPage || 'tags');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [calendarInfo, setCalendarInfo] = React.useState(null);
  const [refreshingRegion, setRefreshingRegion] = React.useState(false);
  React.useEffect(() => {
    if (page !== 'general') return undefined;
    let active = true;
    let timer;
    const read = () => api('calendar.context').then((data) => {
      if (!active) return;
      setCalendarInfo(data);
      if (data.updating) timer = setTimeout(read, 2000);
    }).catch(() => {});
    read();
    return () => { active = false; clearTimeout(timer); };
  }, [page, refreshingRegion]);
  const [permission, setPermission] = React.useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [feedback, setFeedback] = React.useState('');
  const [typesText, setTypesText] = React.useState(((props.settings || {}).taskTypes || []).join(', '));
  const [tagsText, setTagsText] = React.useState(((props.settings || {}).tags || []).join(', '));
  const [tagDraft, setTagDraft] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  const [tagLibDraft, setTagLibDraft] = React.useState('');
  const [selectedTagLib, setSelectedTagLib] = React.useState('');
  const [studyMode, setStudyMode] = React.useState(true);
  const [skinChoice, setSkinChoice] = React.useState(() => `builtin:${currentSkin()}`);
  const [skinName, setSkinName] = React.useState('');
  React.useEffect(() => {
    // Plugin-level switches live in the plugin manager; read them for gating only.
    api('config')
      .then((next) => {
        setStudyMode(next.studyMode !== false);
      })
      .catch(() => {});
    // Mirror the notification preference for the background reminder loop.
    try {
      const savedNotify = (props.settings || {}).systemNotify;
      if (savedNotify !== undefined) localStorage.setItem('lpSystemNotify', savedNotify === false ? 'off' : 'on');
    } catch {}
    // The host owns the files, so its answer wins over a stale local URL.
    api('background.info')
      .then((info) => {
        setAppearance((current) => {
          const next = {
            ...current,
            background: {
              planning: {
                ...current.background.planning,
                imageUrl: info.planning || current.background.planning.imageUrl || '',
              },
              study: { ...current.background.study, imageUrl: info.study || current.background.study.imageUrl || '' },
            },
          };
          applyAppearance(next);
          const areasWithImage = ['planning', 'study'].filter((area) => next.background[area] && next.background[area].imageUrl);
          hydrateBackgrounds(next, areasWithImage).catch(() => {});
          return next;
        });
      })
      .catch(() => {});
  }, []);
  const fileRef = React.useRef(null);
  const skinRef = React.useRef(null);
  const bgPlanningRef = React.useRef(null);
  const bgStudyRef = React.useRef(null);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setAppear = (patch) => setAppearance((current) => ({ ...current, ...patch }));

  const textField = (key, label) =>
    h(
      'label',
      { className: 'lp-field' },
      h('span', null, label),
      h('input', {
        className: 'lp-input',
        value: form[key] ?? '',
        onChange: (event) => set(key, event.target.value),
      }),
    );

  const numberField = (key, label) =>
    h(
      'label',
      { className: 'lp-field' },
      h('span', null, label),
      h('input', {
        className: 'lp-input',
        type: 'number',
        value: form[key] ?? 0,
        onChange: (event) => set(key, Number(event.target.value)),
      }),
    );

  const parseList = (text) =>
    text
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  const colorOverrides = form.colorOverrides || {};
  const setColor = (name, color) => set('colorOverrides', { ...colorOverrides, [name]: color });
  const clearColor = (name) => {
    const next = { ...colorOverrides };
    delete next[name];
    set('colorOverrides', next);
  };

  const colorSwatches = (name) =>
    h(
      'div',
      { className: 'lp-field' },
      h(
        'div',
        { className: 'lp-swatch-panel' },
        PALETTE.map((color) =>
          h('button', {
            key: color,
            type: 'button',
            className: 'lp-swatch',
            'data-active': String((colorOverrides[name] || colorOfName(name, colorOverrides)) === color),
            'aria-pressed': (colorOverrides[name] || colorOfName(name, colorOverrides)) === color,
            'aria-label': color,
            style: { background: color },
            onClick: () => setColor(name, color),
          }),
        ),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => clearColor(name) }, t('colorReset')),
      ),
    );

  const addTag = () => {
    const name = tagDraft.trim();
    if (!name) return;
    const list = parseList(typesText);
    if (!list.includes(name)) {
      setTypesText([...list, name].join(', '));
      const color = PALETTE[list.length % PALETTE.length];
      setColor(name, color);
    }
    setSelectedTag(name);
    setTagDraft('');
  };

  const addTagLib = () => {
    const name = tagLibDraft.trim();
    if (!name) return;
    const list = parseList(tagsText);
    if (!list.includes(name)) {
      setTagsText([...list, name].join(', '));
      const color = PALETTE[list.length % PALETTE.length];
      setColor(name, color);
    }
    setSelectedTagLib(name);
    setTagLibDraft('');
  };

  const removeType = (name) => {
    setTypesText(parseList(typesText).filter((entry) => entry !== name).join(', '));
    setSelectedTag('');
  };

  const removeTagLib = (name) => {
    setTagsText(parseList(tagsText).filter((entry) => entry !== name).join(', '));
    setSelectedTagLib('');
  };

  const save = () => {
    const weekday = parseWindowsText(form.weekdayWindows);
    const weekend = parseWindowsText(form.weekendWindows);
    if (weekday === null || weekend === null) {
      setError(t('invalidWindows'));
      setPage('notify');
      return;
    }
    setBusy(true);
    const patch = {
      weekdayWindows: String(form.weekdayWindows ?? ''),
      weekendWindows: String(form.weekendWindows ?? ''),
      leadTaskDays: Number(form.leadTaskDays ?? 3),
      leadProjectDays: Number(form.leadProjectDays ?? 8),
      notifyGapMinutes: clampNumber(form.notifyGapMinutes, 1, 720, 3),
      nonUrgentQuotaPerWindow: Number(form.nonUrgentQuotaPerWindow ?? 2),
      maxDeferHours: Number(form.maxDeferHours ?? 48),
      archiveAfterDays: clampNumber(form.archiveAfterDays, 1, 3650, 30),
      deleteAfterDays: clampNumber(form.deleteAfterDays, 7, 3650, 90),
      longTermReminderHours: Number(form.longTermReminderHours ?? 12),
      maxRemindersPerWindow: Number(form.maxRemindersPerWindow ?? 6),
      systemNotify: form.systemNotify !== false,
      taskTypes: parseList(typesText),
      tags: parseList(tagsText),
      colorOverrides,
      adviceRegion: (form.adviceRegion || '').trim(),
      calendarAutoRefresh: form.calendarAutoRefresh !== false,
      adviceRegionLocked: form.adviceRegionLocked === true,
      dailyAdvice: form.dailyAdvice !== false,
    };
    api('settings.save', { patch })
      .then((data) => {
        applyAppearance(appearance);
        props.onSaved(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const report = (value) => {
    setPermission(value);
    setFeedback(
      value === 'granted'
        ? t('notifyGranted')
        : value === 'denied'
          ? t('notifyDenied')
          : value === 'unsupported'
            ? t('notifyUnsupported')
            : t('notifyDefault'),
    );
  };

  const askPermission = () => {
    if (typeof Notification === 'undefined') {
      report('unsupported');
      return;
    }
    try {
      const result = Notification.requestPermission();
      if (result && typeof result.then === 'function') {
        result
          .then((value) => report(value))
          .catch((error) =>
            setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'request failed')),
          );
      } else {
        report(Notification.permission);
      }
    } catch (error) {
      setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'request failed'));
    }
  };

  const testNotify = () => {
    if (typeof Notification === 'undefined') {
      report('unsupported');
      return;
    }
    try {
      new Notification(t('noticeTitle'), { body: t('notifyTestBody') });
      setFeedback(t('notifySent'));
    } catch (error) {
      setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'send failed'));
    }
  };

  const doExport = () => {
    api('export')
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `life-planner-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setFeedback(t('exported'));
      })
      .catch((err) => setError(err.message));
  };

  const doImport = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    file
      .text()
      .then((text) => {
        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          throw new Error('JSON parse failed');
        }
        return api('import', { payload });
      })
      .then((result) => {
        setFeedback(t('imported').replace('{a}', String(result.added)).replace('{u}', String(result.updated)));
        if (props.onImported) props.onImported();
      })
      .catch((err) => setError(err.message));
  };

  const pickBackground = (area) => (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      api('background.set', { area, dataUrl })
        .then((saved) => {
          const next = {
            ...appearance,
            background: {
              ...appearance.background,
              [area]: { ...appearance.background[area], imageUrl: saved.url },
            },
          };
          if (area === 'planning' && window.confirm(t('bgSyncAsk'))) {
            return api('background.set', { area: 'study', dataUrl }).then((studySaved) => {
              next.background.study = { ...next.background.study, imageUrl: studySaved.url };
              return next;
            });
          }
          return next;
        })
        .then((next) => {
          setAppearance(next);
          // Only the area that just changed needs its bytes.
          return hydrateBackgrounds(next, [area]).then((result) => {
            if (result.failed.length > 0) setError(t('bgLoadFailed'));
            else setError('');
          });
        })
        .catch((err) => setError(err.message));
    };
    reader.readAsDataURL(file);
  };

  const clearBackground = (area) => {
    api('background.clear', { area })
      .then(() => {
        const next = {
          ...appearance,
          background: { ...appearance.background, [area]: { ...appearance.background[area], imageUrl: '' } },
        };
        setAppearance(next);
        applyAppearance(next);
      })
      .catch((err) => setError(err.message));
  };

  const setBackgroundLayer = (area, patch) => {
    const layer = appearance.background[area];
    const next = {
      ...appearance,
      background: {
        ...appearance.background,
        [area]: { ...layer, ...patch, mask: { ...(layer.mask || {}), ...(patch.mask || {}) } },
      },
    };
    setAppearance(next);
    applyAppearance(next);
  };

  const chooseSkin = (value) => {
    const next = applySkinChoice(value);
    setSkinChoice(value);
    setAppearance(next);
    hydrateBackgrounds(next).catch(() => {});
  };

  const saveCurrentSkin = () => {
    const name = String(skinName || '').trim();
    if (!name) {
      setFeedback(t('skinNameRequired'));
      return;
    }
    try {
      const saved = saveUserSkin(name);
      setSkinChoice(`user:${saved}`);
      setSkinName('');
      setFeedback(t('skinSaved'));
    } catch (err) {
      setError(err.message);
    }
  };


  const removeCurrentSkin = () => {
    const name = skinChoice.slice(5);
    if (!deleteUserSkin(name)) return;
    setSkinChoice(`builtin:${currentSkin()}`);
    setFeedback(t('skinDeleted'));
  };

  const setFont = (key, value) => {
    const fallback = Number((APPEARANCE_DEFAULTS.font || {})[key]) || 13;
    const next = { ...appearance, font: { ...appearance.font, [key]: Number(value) || fallback } };
    setAppearance(next);
    applyAppearance(next);
  };

  const setSize = (key, value) => {
    const next = { ...appearance, size: { ...appearance.size, [key]: Number(value) || 0 } };
    setAppearance(next);
    applyAppearance(next);
  };

  const setAccent = (area, value) => {
    const next = { ...appearance, accent: { ...appearance.accent, [area]: value } };
    setAppearance(next);
    applyAppearance(next);
  };

  const numberInput = (key, label, value, onChange) =>
    h(
      'label',
      { className: 'lp-field' },
      h('span', null, label),
      h('input', {
        className: 'lp-input',
        type: 'number',
        value,
        onChange: (event) => onChange(key, event.target.value),
      }),
    );

  const backgroundFields = (area) => {
    const layer = appearance.background[area];
    const mask = layer.mask || {};
    const inputRef = area === 'study' ? bgStudyRef : bgPlanningRef;
    const setLayer = (patch) => setBackgroundLayer(area, patch);
    const title = t(area === 'study' ? 'fBgStudy' : 'fBgPlanning');
    return h(
      DialogDisclosure,
      { title },
      h(Dropdown, {
        label: title,
        value: layer.mode || 'none',
        onChange: (value) => setLayer({ mode: value }),
        options: [
          { value: 'none', label: t('bgModeNone') },
          { value: 'color', label: t('bgModeColor') },
          { value: 'image', label: t('bgModeImage') },
        ],
      }),
      layer.mode === 'color'
        ? h(
            'div',
            { className: 'lp-row2', style: { marginTop: 6 } },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('bgColor')),
              h('input', {
                className: 'lp-input',
                type: 'color',
                value: layer.color || '#1b1e24',
                onChange: (event) => setLayer({ color: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('bgColorHint')),
              h('div', { className: 'lp-meta' }, t('bgColorHintText')),
            ),
          )
        : null,
      layer.mode === 'image'
        ? h(
            'div',
            null,
            h(
              'div',
              { className: 'lp-toolbar', style: { marginTop: 6 } },
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => inputRef.current && inputRef.current.click() }, t('fBgImport')),
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => api('background.open', {}).catch((err) => setError(err.message)) }, t('fBgOpen')),
              layer.imageUrl ? h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => clearBackground(area) }, t('fBgClear')) : null,
              h('input', {
                ref: inputRef,
                type: 'file',
                accept: 'image/*',
                style: { display: 'none' },
                onChange: pickBackground(area),
              }),
            ),
            h(
              'div',
              { className: 'lp-setting-grid' },
              h(
                'div',
                { className: 'lp-field' },
                h('label', null, t('fBgOpacity')),
                h('input', {
                  className: 'lp-input',
                  type: 'range',
                  min: 0,
                  max: 0.9,
                  step: 0.05,
                  value: layer.opacity,
                  onChange: (event) => setLayer({ opacity: Number(event.target.value) }),
                }),
              ),
              h(
                'div',
                { className: 'lp-field' },
                h('label', null, t('fMaskOn')),
                h(Switch, { value: mask.on !== false, onChange: (next) => setLayer({ mask: { ...mask, on: next } }) }),
              ),
            ),
            mask.on !== false
              ? h(
                  'div',
                  { className: 'lp-setting-grid' },
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskSide')),
                    h(Dropdown, {
                      value: mask.side || 'left',
                      onChange: (value) => setLayer({ mask: { ...mask, side: value } }),
                      options: [
                        { value: 'left', label: t('sideLeft') },
                        { value: 'right', label: t('sideRight') },
                        { value: 'top', label: t('sideTop') },
                        { value: 'bottom', label: t('sideBottom') },
                      ],
                    }),
                  ),
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskWidth')),
                    h('input', {
                      className: 'lp-input',
                      type: 'range',
                      min: 5,
                      max: 90,
                      step: 5,
                      value: mask.width || 25,
                      onChange: (event) => setLayer({ mask: { ...mask, width: Number(event.target.value) } }),
                    }),
                    h('div', { className: 'lp-meta' }, `${mask.width || 25}%`),
                  ),
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskStrength')),
                    h('input', {
                      className: 'lp-input',
                      type: 'range',
                      min: 0.1,
                      max: 1,
                      step: 0.05,
                      value: mask.strength || 0.6,
                      onChange: (event) => setLayer({ mask: { ...mask, strength: Number(event.target.value) } }),
                    }),
                  ),
                )
              : null,
          )
        : null,
    );
  };


  const group = (title, ...children) => h('section', { className: 'lp-settings-group' },
    h('h3', { className: 'lp-settings-heading' }, t(title)), ...children);
  const advanced = (title, ...children) => h(DialogDisclosure, { title: t(title) }, ...children);
  const switchRow = (label, hint, value, onChange) => h('div', { className: 'lp-settings-switch' },
    h('div', null, h('strong', null, t(label)), hint ? h('div', { className: 'lp-meta' }, t(hint)) : null),
    h(Switch, { label: t(label), value, onChange }));

  const classification = ({ title, hint, list, draft, onDraft, onAdd, placeholder, addLabel, selected, onSelect, empty, onRemove }) => {
    const active = list.includes(selected) ? selected : list[0];
    return group(title,
      h('form', { className: 'lp-toolbar', onSubmit: (event) => { event.preventDefault(); onAdd(); } },
        h('input', {
          className: 'lp-input', 'aria-label': t(placeholder), placeholder: t(placeholder),
          value: draft, onChange: (event) => onDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'submit', disabled: !draft.trim() }, t(addLabel))),
      active ? h('div', { className: 'lp-settings-classification' },
        h(Dropdown, { label: t(title), value: active, onChange: onSelect, options: list.map((name) => ({ value: name, label: name })) }),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => onRemove(active) }, t('delete')),
        h(DialogDisclosure, { title: t('tagColor') }, colorSwatches(active)))
      : h('div', { className: 'lp-meta' }, t(empty)),
      hint ? h('div', { className: 'lp-meta' }, t(hint)) : null,
    );
  };

  const tagsPage = () => h('div', { className: 'lp-settings-sections lp-settings-collections' },
    classification({
      title: 'sectionTags', hint: 'taskTypeAutoHint', list: parseList(typesText), draft: tagDraft, onDraft: setTagDraft,
      onAdd: addTag, placeholder: 'tagNamePlaceholder', addLabel: 'addTag', selected: selectedTag, onSelect: setSelectedTag,
      empty: 'noTags', onRemove: removeType,
    }),
    classification({
      title: 'sectionTagLibrary', list: parseList(tagsText), draft: tagLibDraft, onDraft: setTagLibDraft,
      onAdd: addTagLib, placeholder: 'tagLibName', addLabel: 'tagLibAdd', selected: selectedTagLib, onSelect: setSelectedTagLib,
      empty: 'tagLibEmpty', onRemove: removeTagLib,
    }));

  const regionDraftChanged = (form.adviceRegion || '').trim() !== (props.settings?.adviceRegion || '') ||
    (form.calendarAutoRefresh !== false) !== (props.settings?.calendarAutoRefresh !== false) ||
    Boolean(form.adviceRegionLocked) !== Boolean(props.settings?.adviceRegionLocked);
  const refreshNow = () => {
    setRefreshingRegion(true);
    setError('');
    api('calendar.refresh', {}).then((data) => {
      setCalendarInfo(data);
      window.dispatchEvent(new Event('lp-calendar-context-change'));
    }).catch((err) => setError(err.message)).finally(() => setRefreshingRegion(false));
  };

  const generalPage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('settingsLocation',
        h('div', { className: 'lp-setting-grid' },
          h('label', { className: 'lp-field' }, h('span', null, t('tipRegion')),
            h('input', { className: 'lp-input', value: form.adviceRegion || '', maxLength: 80,
              placeholder: t('tipRegionHint'), onChange: (event) => set('adviceRegion', event.target.value) })),
          h('label', { className: 'lp-field' }, h('span', null, t('calendarRefreshMode')),
            h('select', { className: 'lp-select', value: form.calendarAutoRefresh !== false ? 'auto' : 'manual',
              onChange: (event) => set('calendarAutoRefresh', event.target.value === 'auto') },
              h('option', { value: 'auto' }, t('calendarRefreshAuto')),
              h('option', { value: 'manual' }, t('calendarRefreshManual'))))),
        calendarInfo?.region ? h('div', { className: 'lp-meta' }, t('settingsCurrentRegion') + ' · ' + calendarInfo.region) : null,
        switchRow('calendarLockRegion', 'calendarLockHint', form.adviceRegionLocked === true, (next) => set('adviceRegionLocked', next)),
        h('div', { className: 'lp-settings-switch' },
          h('div', { className: 'lp-meta', role: 'status' },
            t(regionDraftChanged ? 'calendarRefreshOnSave' : calendarInfo?.updating ? 'calendarRefreshing' : 'calendarRefreshHint')),
          h('button', { type: 'button', className: 'lp-btn-ghost', onClick: refreshNow, disabled: refreshingRegion || regionDraftChanged }, t('calendarRefreshNow')))),
      group('studyTipTitle',
        switchRow('tipDeepSeek', 'settingsStudyAdviceHint', form.dailyAdvice !== false, (next) => set('dailyAdvice', next))),
      advanced('sectionData',
        h(
          'div',
          { className: 'lp-toolbar' },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: doExport }, t('exportData')),
          h(
            'button',
            { className: 'lp-btn-ghost', type: 'button', onClick: () => fileRef.current && fileRef.current.click() },
            t('importData'),
          ),
          h('input', { ref: fileRef, type: 'file', accept: 'application/json', style: { display: 'none' }, onChange: doImport }),
        ), h('div', { className: 'lp-meta' }, t('generalHint')),
      ),
    );

  const notifyPage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('sectionNotify',
        switchRow('fSystemNotify', 'fSystemNotifyHint', form.systemNotify !== false, (next) => {
          set('systemNotify', next);
          try { localStorage.setItem('lpSystemNotify', next ? 'on' : 'off'); } catch {}
        }),
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: testNotify }, t('notifyTest')),
          permission === 'granted'
            ? null
            : h('button', { className: 'lp-btn-ghost', type: 'button', onClick: askPermission }, t('enableNotify')),
          h('span', { className: 'lp-settings-status' }, t('notifyState').replace('{s}', t('notifyPermission_' + permission))),
        ),
      ),
      advanced('settingsNotifyWindows',
        h('div', { className: 'lp-setting-grid' },
          textField('weekdayWindows', t('fWeekdayWindows')),
          textField('weekendWindows', t('fWeekendWindows')),
          numberField('notifyGapMinutes', t('fGapMinutes')),
          numberField('nonUrgentQuotaPerWindow', t('fQuota')),
          numberField('maxRemindersPerWindow', t('fMaxPerWindow')),
          numberField('maxDeferHours', t('fMaxDefer')))),
      advanced('settingsNotifyLead',
        h('div', { className: 'lp-setting-grid' },
          numberField('leadTaskDays', t('fLeadTaskDays')),
          numberField('leadProjectDays', t('fLeadProjectDays')),
          numberField('longTermReminderHours', t('fLongTermHours')))),
      advanced('sectionTask', h('div', { className: 'lp-setting-grid' },
        numberField('archiveAfterDays', t('fArchiveDays')),
        numberField('deleteAfterDays', t('fDeleteDays')))),
    );

  const appearancePage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('sectionSkin',
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('fSkinPreset')),
        h(Dropdown, {
          label: t('fSkinPreset'),
          value: skinChoice,
          onChange: chooseSkin,
          options: listSkinOptions(),
        }),
      ),
      advanced('skinManage',
        h(
          'div',
          { className: 'lp-toolbar' },
          h('input', {
            className: 'lp-input',
            value: skinName,
            'aria-label': t('skinNamePlaceholder'),
            placeholder: t('skinNamePlaceholder'),
            onChange: (event) => setSkinName(event.target.value),
          }),
          h('button', { className: 'lp-btn', type: 'button', disabled: !skinName.trim(), onClick: saveCurrentSkin }, t('skinSaveAs')),
          skinChoice.indexOf('user:') === 0
            ? h('button', { className: 'lp-btn-ghost', type: 'button', onClick: removeCurrentSkin }, t('skinDelete'))
            : null,
        ),
        h(
          'div',
          { className: 'lp-toolbar' },
          h(
            'button',
            {
              className: 'lp-btn-ghost',
              type: 'button',
              onClick: () => {
                const blob = new Blob([exportAppearance()], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `life-planner-skin-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              },
            },
            t('skinExport'),
          ),
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => skinRef.current && skinRef.current.click() }, t('skinImport')),
          h('input', {
            ref: skinRef,
            type: 'file',
            accept: 'application/json',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.target.files && event.target.files[0];
              event.target.value = '';
              if (!file) return;
              file
                .text()
                .then((text) => {
                  const next = importAppearance(text);
                  setAppearance(next);
                  hydrateBackgrounds(next).catch(() => {});
                  setFeedback(t('skinImported'));
                })
                .catch((err) => setError(err.message));
            },
          }),
        ),
      )),

      advanced('sectionFont',
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('tab', t('fFontTab'), appearance.font.tab, setFont),
        numberInput('title', t('fFontTitle'), appearance.font.title, setFont),
        numberInput('calendar', t('fFontCalendar'), appearance.font.calendar, setFont),
        numberInput('task', t('fFontTask'), appearance.font.task, setFont),
        numberInput('type', t('fFontType'), appearance.font.type, setFont),
        numberInput('tag', t('fFontTag'), appearance.font.tag, setFont),
        numberInput('meta', t('fFontMeta'), appearance.font.meta, setFont),
        numberInput('base', t('fFontBase'), appearance.font.base, setFont),
      ),
      h('div', { className: 'lp-meta' }, t('fFontHint'))),
      advanced('sectionSize',
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('calendarHeight', t('fCalHeight'), appearance.size.calendarHeight, setSize),
      ),
      h('div', { className: 'lp-meta' }, t('fCalHeightHint'))),
      advanced('sectionMistake',
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('mistakeColumns', t('fMistakeCols'), appearance.size.mistakeColumns, setSize),
        numberInput('mistakeHeight', t('fMistakeHeight'), appearance.size.mistakeHeight, setSize),
      ),
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('mistakeTitle', t('fMistakeTitleFs'), appearance.font.mistakeTitle, setFont),
        numberInput('mistakeAnswer', t('fMistakeAnswerFs'), appearance.font.mistakeAnswer, setFont),
        numberInput('mistakeReason', t('fMistakeReasonFs'), appearance.font.mistakeReason, setFont),
      ),
      h('div', { className: 'lp-meta' }, t('fMistakeHint'))),
      advanced('sectionAccent',
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('fAccentPlanning')),
          h('input', {
            className: 'lp-input',
            type: 'color',
            value: appearance.accent.planning || '#4f7cff',
            onChange: (event) => setAccent('planning', event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('fAccentStudy')),
          h('input', {
            className: 'lp-input',
            type: 'color',
            value: appearance.accent.study || '#3fa66a',
            onChange: (event) => setAccent('study', event.target.value),
          }),
        ),
      )),
      advanced('sectionBackground',
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('fSurface')),
        h(
          'div',
          { className: 'lp-toolbar' },
          h('input', {
            className: 'lp-input',
            type: 'range',
            min: 0,
            max: 0.6,
            step: 0.05,
            value: appearance.surface ?? 0.15,
            onChange: (event) => {
              const next = { ...appearance, surface: Number(event.target.value) };
              setAppearance(next);
              applyAppearance(next);
            },
          }),
          h('span', { className: 'lp-meta' }, `${Math.round((appearance.surface ?? 0.15) * 100)}%`),
        ),
        h('div', { className: 'lp-meta' }, t('fSurfaceHint')),
      ),
      backgroundFields('planning'),
      studyMode ? backgroundFields('study') : null),
    );

  const tabs = [
    { key: 'tags', label: t('tabTags') },
    { key: 'general', label: t('tabGeneral') },
    { key: 'notify', label: t('tabNotify') },
    { key: 'appearance', label: t('tabAppearance') },
  ];

  return h(
    Modal,
    {
      title: t('settings'),
      titleMeta: 'v__PLUGIN_VERSION__',
      className: 'lp-settings',
      onClose: props.onClose,
    },
    h('div', { className: 'lp-settings-layout' },
      h('nav', { className: 'lp-settings-nav', 'aria-label': t('settings') },
        tabs.map((tab) =>
          h(
            'button',
            {
              key: tab.key,
              className: 'lp-settings-nav-button',
              type: 'button',
              'aria-current': page === tab.key ? 'page' : undefined,
              onClick: () => { setPage(tab.key); setFeedback(''); },
            },
            tab.label,
          ),
        ),
      ),
      h('div', { className: 'lp-settings-body', key: page },
        error ? h('div', { className: 'lp-err', role: 'alert' }, error) : null,
        feedback ? h('div', { className: 'lp-meta lp-feedback', role: 'status' }, feedback) : null,
        page === 'tags' ? tagsPage() : page === 'general' ? generalPage() : page === 'notify' ? notifyPage() : appearancePage()),
    ),
      h(
        DialogActions,
        null,
        h('button', { className: 'lp-btn-ghost', onClick: props.onClose, disabled: busy }, t('cancel')),
        h('button', { className: 'lp-btn', onClick: save, disabled: busy }, t('save')),
      ),
  );
}
