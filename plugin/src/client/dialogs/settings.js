function AppearanceNumber({ label, value, min, max, positiveMin = min, onChange }) {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => setDraft(String(value)), [value]);
  return h('label', { className: 'lp-field' },
    h('span', null, label),
    h('input', {
      className: 'lp-input', type: 'number', min, max, step: 1, value: draft,
      onChange: (event) => {
        const text = event.target.value;
        setDraft(text);
        const number = Number(text);
        if (text && Number.isInteger(number) && number >= min && number <= max && (number === 0 || number >= positiveMin)) {
          onChange(number);
        }
      },
      onBlur: () => setDraft(String(value)),
    }),
  );
}

const SETTINGS_NUMBERS = {
  leadTaskDays: [0, 60], leadProjectDays: [0, 120], notifyGapMinutes: [1, 720],
  nonUrgentQuotaPerWindow: [0, 50], maxRemindersPerWindow: [1, 50], maxDeferHours: [0, 720],
  longTermReminderHours: [0, 720], archiveAfterDays: [1, 3650], deleteAfterDays: [7, 3650],
};

function SettingsModal(props) {
  const t = props.t;
  const [form, setForm] = React.useState(props.settings || {});
  React.useEffect(() => {
    if (props.settings) setForm(props.settings);
  }, [props.settings]);
  const [appearance, setAppearance] = React.useState(() => currentAppearance());
  const [page, setPage] = React.useState(props.initialPage || 'tags');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
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
  const [types, setTypes] = React.useState(props.settings?.taskTypes || []);
  const [tags, setTags] = React.useState(props.settings?.tags || []);
  const [tagDraft, setTagDraft] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  const [tagLibDraft, setTagLibDraft] = React.useState('');
  const [selectedTagLib, setSelectedTagLib] = React.useState('');
  const [studyMode, setStudyMode] = React.useState(true);
  const [skinChoice, setSkinChoice] = React.useState(() => currentSkinChoice());
  const [skinName, setSkinName] = React.useState('');
  React.useEffect(() => {
    const sync = () => setSkinChoice(currentSkinChoice());
    window.addEventListener('lp-skin-change', sync);
    return () => window.removeEventListener('lp-skin-change', sync);
  }, []);
  React.useEffect(() => onAppearanceChange(setAppearance), []);
  React.useEffect(() => {
    // Plugin-level switches live in the plugin manager; read them for gating only.
    api('config')
      .then((next) => {
        setStudyMode(next.studyPanel !== false);
      })
      .catch(() => {});
  }, []);
  const fileRef = React.useRef(null);
  const skinRef = React.useRef(null);
  const bgPlanningRef = React.useRef(null);
  const bgStudyRef = React.useRef(null);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

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
        min: SETTINGS_NUMBERS[key][0],
        max: SETTINGS_NUMBERS[key][1],
        step: 1,
        value: form[key] ?? 0,
        onChange: (event) => set(key, event.target.value),
      }),
    );

  const colorOverrides = form.colorOverrides || {};
  const setColor = (kind, name, color) => setForm((current) =>
    ({ ...current, colorOverrides: { ...current.colorOverrides, [kind + ':' + name]: color } }));

  const colorSwatches = (kind, name) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, `${t(kind === 'tag' ? 'tagLibraryColor' : 'tagColor')} · ${name}`),
      h(
        'div',
        { className: 'lp-swatch-panel' },
        PALETTE.map((color) =>
          h('button', {
            key: color,
            type: 'button',
            className: 'lp-swatch',
            'data-active': String(colorOfName(name, colorOverrides, kind) === color),
            'aria-label': color,
            style: { background: color },
            onClick: () => setColor(kind, name, color),
          }),
        ),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setColor(kind, name, null) }, t('colorReset')),
      ),
    );

  const addTag = () => {
    const name = tagDraft.trim();
    if (!name) return;
    if (!types.includes(name)) {
      setTypes([...types, name]);
      setColor('type', name, PALETTE[types.length % PALETTE.length]);
    }
    setSelectedTag(name);
    setTagDraft('');
  };

  const addTagLib = () => {
    const name = tagLibDraft.trim();
    if (!name) return;
    if (!tags.includes(name)) {
      setTags([...tags, name]);
      setColor('tag', name, PALETTE[tags.length % PALETTE.length]);
    }
    setSelectedTagLib(name);
    setTagLibDraft('');
  };

  const removeType = (name) => {
    setTypes(types.filter((entry) => entry !== name));
    setSelectedTag('');
  };

  const removeTagLib = (name) => {
    setTags(tags.filter((entry) => entry !== name));
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
    const previous = props.settings || {};
    for (const [key, [min, max]] of Object.entries(SETTINGS_NUMBERS)) {
      if (String(form[key]) === String(previous[key])) continue;
      const number = Number(form[key]);
      if (form[key] === '' || !Number.isInteger(number) || number < min || number > max) {
        setError(t('settingsNumberRange').replace('{min}', min).replace('{max}', max));
        setPage('notify');
        return;
      }
    }
    const changed = (keys) => keys.some((key) => String(form[key]) !== String(previous[key]));
    if (changed(['archiveAfterDays', 'deleteAfterDays']) && Number(form.deleteAfterDays) < Number(form.archiveAfterDays)) {
      setError(t('settingsRetentionOrder'));
      setPage('notify');
      return;
    }
    if (changed(['nonUrgentQuotaPerWindow', 'maxRemindersPerWindow']) &&
      Number(form.nonUrgentQuotaPerWindow) > Number(form.maxRemindersPerWindow)) {
      setError(t('settingsQuotaOrder'));
      setPage('notify');
      return;
    }
    setBusy(true);
    setError('');
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
      taskTypes: types,
      tags,
      colorOverrides,
      adviceRegion: (form.adviceRegion || '').trim(),
      calendarAutoRefresh: form.calendarAutoRefresh !== false,
      adviceRegionLocked: form.adviceRegionLocked === true,
      dailyAdvice: form.dailyAdvice !== false,
    };
    for (const key of Object.keys(patch)) {
      if (JSON.stringify(previous[key]) === JSON.stringify(patch[key])) delete patch[key];
    }
    flushAppearanceSave()
      .then(() => Object.keys(patch).length ? api('settings.save', { patch }) : previous)
      .then((data) => {
        props.onSaved(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const close = () => {
    if (busy) return;
    flushAppearanceSave().then(props.onClose).catch((err) => setError(err.message));
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

  const testNotify = async () => {
    const title = t('noticeTitle');
    const message = t('notifyTestBody');
    try {
      const result = await api('notifications.test', { title, message });
      if (!result.sent) {
        if (typeof Notification === 'undefined') { report('unsupported'); return; }
        if (Notification.permission !== 'granted') { report(Notification.permission); return; }
        new Notification(title, { body: message });
      }
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
    const owner = currentSkinChoice();
    readImageData(file).then((dataUrl) => api('background.set', { area, dataUrl, forPreset: true }))
        .then((saved) => {
          const layer = { mode: 'image', imageUrl: saved.url };
          const layers = { [area]: layer };
          if (area === 'planning' && currentSkinChoice() === owner && window.confirm(t('bgSyncAsk'))) layers.study = layer;
          const next = updateSkinBackground(owner, layers);
          if (!next) return;
          return hydrateBackgrounds(next, Object.keys(layers)).then((result) => {
            if (currentSkinChoice() !== owner) return;
            if (result.failed.length > 0) setError(t('bgLoadFailed'));
            else setError('');
          });
        })
        .catch((err) => setError(err.message));
  };

  const clearBackground = (area) => {
    updateSkinBackground(currentSkinChoice(), { [area]: { mode: 'none', imageUrl: '' } });
  };

  const setBackgroundLayer = (area, patch) => {
    const layer = appearance.background[area];
    const next = updateSkinBackground(currentSkinChoice(), {
      [area]: { ...patch, mask: { ...layer.mask, ...patch.mask } },
    });
    if (next) hydrateBackgrounds(next, [area]).catch(() => {});
  };

  const chooseSkin = (value) => {
    migrateSkinProfiles();
    const next = applySkinChoice(value);
    setSkinChoice(currentSkinChoice());
    setAppearance(next);
    setError('');
    saveActiveSkin().catch((err) => setError(err.message));
    hydrateBackgrounds(next).catch(() => {});
  };

  const saveCurrentSkin = () => {
    const name = String(skinName || '').trim();
    if (!name) {
      setFeedback(t('skinNameRequired'));
      return;
    }
    try {
      const clean = Array.from(name).slice(0, 24).join('');
      if (Object.hasOwn(userSkins(), clean) && !window.confirm(t('skinOverwrite'))) return;
      const saved = saveUserSkin(name);
      chooseSkin(`user:${saved}`);
      setSkinName('');
      setFeedback(t('skinSaved'));
    } catch (err) {
      setError(err.message);
    }
  };


  const removeCurrentSkin = () => {
    const name = skinChoice.slice(5);
    if (!window.confirm(t('skinDeleteConfirm').replace('{name}', name))) return;
    if (!deleteUserSkin(name)) return;
    chooseSkin(`builtin:${currentSkin()}`);
    setFeedback(t('skinDeleted'));
  };

  const setFont = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, font: { ...current.font, [key]: value } });
  };

  const setSize = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, size: { ...current.size, [key]: value } });
  };

  const setAccent = (area, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, accent: { ...current.accent, [area]: value } });
  };

  const setLayout = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, layout: { ...current.layout, [key]: value } });
  };

  const layoutInput = (key, label) => h('label', { className: 'lp-field' },
    h('span', null, t(label)),
    h('select', { className: 'lp-select', value: appearance.layout[key], onChange: (event) => setLayout(key, event.target.value) },
      APPEARANCE_LAYOUTS[key].map((option) => h('option', { key: option, value: option }, t('layout_' + option))),
    ),
  );

  const skinNameLabel = () => listSkinOptions(t).find((option) => option.value === skinChoice)?.label || t('skinDefault');

  const exportSkin = async () => {
    try {
      const blob = new Blob([await exportAppearance(skinNameLabel())], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'life-planner-skin-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err.message); }
  };

  const numberInput = (key, label, value, onChange) => {
    const [min, max] = APPEARANCE_LIMITS[key] || [8, 64];
    return h(AppearanceNumber, { key: skinChoice + ':' + key, label, value, min, max,
      positiveMin: key === 'calendarHeight' ? 320 : min,
      onChange: (next) => onChange(key, next) });
  };

  const backgroundFields = (area) => {
    const layer = appearance.background[area];
    const mask = layer.mask || {};
    const inputRef = area === 'study' ? bgStudyRef : bgPlanningRef;
    const setLayer = (patch) => setBackgroundLayer(area, patch);
    return h(
      'div',
      { className: 'lp-field lp-settings-background' },
      h('label', null, area === 'study' ? t('fBgStudy') : t('fBgPlanning')),
      h(Dropdown, {
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
    h('h3', { className: 'lp-form-section' }, t(title)), ...children);
  const advanced = (title, ...children) => h(DialogDisclosure, {
    title: t(title),
    open: page === 'notify' && error ? true : undefined,
  }, ...children);
  const switchRow = (label, hint, value, onChange) => h('div', { className: 'lp-settings-switch' },
    h('div', null, h('strong', null, t(label)), hint ? h('div', { className: 'lp-meta' }, t(hint)) : null),
    h(Switch, { label: t(label), value, onChange }));

  const classification = ({ kind, title, hint, list, draft, onDraft, onAdd, placeholder, addLabel, selected, onSelect, empty, onRemove }) => {
    const active = list.includes(selected) ? selected : list[0];
    return group(title,
      h('form', { className: 'lp-toolbar', onSubmit: (event) => { event.preventDefault(); onAdd(); } },
        h('input', {
          className: 'lp-input', 'aria-label': t(placeholder), placeholder: t(placeholder),
          value: draft, onChange: (event) => onDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'submit', disabled: !draft.trim() }, t(addLabel))),
      active ? h('div', { className: 'lp-settings-classification' },
        h(Dropdown, { value: active, onChange: onSelect, options: list.map((name) => ({ value: name, label: name })) }),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => onRemove(active) }, t('delete')),
        h(DialogDisclosure, { title: t(kind === 'tag' ? 'tagLibraryColor' : 'tagColor') },
          colorSwatches(kind, active)))
      : h('div', { className: 'lp-meta' }, t(empty)),
      hint ? h('div', { className: 'lp-meta' }, t(hint)) : null,
    );
  };

  const tagsPage = () => h('div', { className: 'lp-settings-sections lp-settings-collections' },
    classification({
      kind: 'type', title: 'sectionTags', hint: 'taskTypeAutoHint', list: types, draft: tagDraft, onDraft: setTagDraft,
      onAdd: addTag, placeholder: 'tagNamePlaceholder', addLabel: 'addTag', selected: selectedTag, onSelect: setSelectedTag,
      empty: 'noTags', onRemove: removeType,
    }),
    classification({
      kind: 'tag', title: 'sectionTagLibrary', list: tags, draft: tagLibDraft, onDraft: setTagLibDraft,
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
        switchRow('fSystemNotify', 'fSystemNotifyHint', form.systemNotify !== false, (next) => set('systemNotify', next)),
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
          numberField('longTermReminderHours', t('fLongTermHours'))),
        h('div', { className: 'lp-meta' }, t('settingsLeadHint'))),
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
          value: skinChoice,
          onChange: chooseSkin,
          options: listSkinOptions(t),
        }),
        h('div', { className: 'lp-meta' }, t('skinAppearanceOwner').replace('{name}', skinNameLabel())),
      )),
      advanced('skinManage',
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('input', {
            className: 'lp-input',
            value: skinName,
            maxLength: 24,
            'aria-label': t('skinNamePlaceholder'),
            placeholder: t('skinNamePlaceholder'),
            onChange: (event) => setSkinName(event.target.value),
          }),
          h('button', { className: 'lp-btn', type: 'button', onClick: saveCurrentSkin, disabled: !skinName.trim() }, t('skinSaveAs')),
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
              onClick: exportSkin,
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
              const legacySkin = currentSkin();
              file
                .text()
                .then((text) => importAppearance(text, file.name.replace(/\.json$/i, '') || t('skinImport'), legacySkin))
                .then((name) => {
                  chooseSkin('user:' + name);
                  setFeedback(t('skinImported'));
                })
                .catch((err) => setError(err.message));
            },
          }),
        ),
      ),

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
        layoutInput('calendar', 'layoutCalendar'),
        numberInput('calendarHeight', t('fCalHeight'), appearance.size.calendarHeight, setSize),
        studyMode ? layoutInput('studyToday', 'layoutStudyToday') : null,
        studyMode ? layoutInput('studyPlan', 'layoutStudyPlan') : null,
        layoutInput('spacing', 'layoutSpacing'),
        layoutInput('fontFamily', 'layoutFontFamily'),
      ),
      h('div', { className: 'lp-meta' }, t('fCalHeightHint'))),
      studyMode ? advanced('sectionMistake',
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
      h('div', { className: 'lp-meta' }, t('fMistakeHint'))) : null,
      advanced('sectionAccent',
      h(
        'div',
        { className: 'lp-row2' },
        APPEARANCE_AREAS.filter((area) => studyMode || area === 'planning').map((area) => {
          const title = t(area === 'study' ? 'fAccentStudy' : 'fAccentPlanning');
          const value = appearance.accent[area];
          return h('div', { className: 'lp-field', key: area },
            h('label', null, title),
            h('div', { className: 'lp-settings-color' },
              h('input', { className: 'lp-input', type: 'color', 'aria-label': title,
                value: value || (currentSkin() === 'clawd' ? '#a35039' : '#4f7cff'), onChange: (event) => setAccent(area, event.target.value) }),
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setAccent(area, ''), disabled: !value }, t('colorReset'))));
        }),
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
            max: 0.9,
            step: 0.05,
            value: appearance.surface ?? 0.15,
            'aria-label': t('fSurface'),
            disabled: !APPEARANCE_AREAS.some((area) => (area === 'planning' || studyMode) &&
              (appearance.background[area].mode === 'color' || (appearance.background[area].mode === 'image' && appearance.background[area].imageUrl))),
            onChange: (event) => {
              applyAppearance({ ...currentAppearance(), surface: Number(event.target.value) });
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
  const hasPendingSettings = JSON.stringify(form) !== JSON.stringify(props.settings || {}) ||
    JSON.stringify(types) !== JSON.stringify(props.settings?.taskTypes || []) ||
    JSON.stringify(tags) !== JSON.stringify(props.settings?.tags || []);

  if (preview) {
    return h('div', { className: 'lp-settings-preview' },
      h('button', { type: 'button', className: 'lp-btn', autoFocus: true, onClick: () => setPreview(false) }, t('settingsReturn')));
  }

  return h(
    Modal,
    {
      title: `${t('settings')} · v__PLUGIN_VERSION__`,
      className: 'lp-settings',
      onClose: close,
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
        page === 'appearance' ? h('button', { type: 'button', className: 'lp-btn-ghost', onClick: () => setPreview(true), disabled: busy }, t('settingsPreview')) : null,
        h('button', { className: 'lp-btn-ghost', onClick: close, disabled: busy }, t(page === 'appearance' ? 'close' : 'cancel')),
        page !== 'appearance' || hasPendingSettings
          ? h('button', { className: 'lp-btn', onClick: save, disabled: busy }, t('save'))
          : null,
      ),
  );
}
