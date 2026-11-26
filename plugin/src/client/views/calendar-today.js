function lunarDateLabel(date) {
  const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'yearName')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  if (!month || day < 1 || day > 30 || !Number.isInteger(day)) return '';
  const numbers = '一二三四五六七八九十';
  const label = day <= 10 ? '初' + numbers[day - 1]
    : day === 20 ? '二十' : day === 30 ? '三十'
      : (day < 20 ? '十' : '廿') + numbers[day % 10 - 1];
  return (year ? year + '年 ' : '') + month + label;
}

function weatherAppearance(code) {
  if (code === 0) return ['☀️', 'weatherClear'];
  if (code === 1 || code === 2) return ['🌤️', 'weatherPartly'];
  if (code === 3) return ['☁️', 'weatherCloud'];
  if (code === 45 || code === 48) return ['🌫️', 'weatherFog'];
  if (code >= 95) return ['⛈️', 'weatherStorm'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['🌨️', 'weatherSnow'];
  if (code >= 51) return ['🌧️', 'weatherRain'];
  return ['◌', 'weatherUnavailable'];
}

function CalendarToday({ t, data, date, lunar, onSettings }) {
  const popup = useAnchoredMenu({ count: 10, minWidth: 330, maxHeight: 480 });
  const weather = data?.weather;
  const [icon, condition] = weatherAppearance(weather?.wmoCode);
  const temperature = Number.isFinite(weather?.minC) && Number.isFinite(weather?.maxC)
    ? `${Math.round(weather.minC)}–${Math.round(weather.maxC)} °C` : '';
  const format = (key, value) => t(key).replace('{n}', String(value));
  const details = [
    [t('calendarTemperature'), temperature],
    [t('calendarRain'), Number.isFinite(weather?.precipitationProbability) ? weather.precipitationProbability + '%' : ''],
    [t('calendarWind'), Number.isFinite(weather?.windKph) ? Math.round(weather.windKph) + ' km/h' : ''],
    [t('calendarSun'), weather?.sunrise && weather?.sunset ? weather.sunrise + ' / ' + weather.sunset : ''],
  ].filter(([, value]) => value);
  const advice = data?.advice;
  const updated = data?.updatedAt ? new Date(data.updatedAt) : null;
  const fullDate = t('calendarFullDate').replace('{y}', date.getFullYear())
    .replace('{m}', date.getMonth() + 1).replace('{d}', date.getDate()) +
    ' · ' + weekdayLabels(t)[(date.getDay() + 6) % 7];
  return h(
    'div', { className: 'lp-weather' },
    h('button', {
      className: 'lp-weather-trigger', ref: popup.anchorRef, type: 'button',
      onClick: popup.toggle, 'aria-expanded': popup.open, 'aria-controls': popup.open ? popup.menuId : undefined,
      'aria-label': t('calendarTodayInfo'), title: t('calendarTodayInfo'),
    },
    h('span', { className: 'lp-weather-icon', 'aria-hidden': true }, icon),
    h('span', { className: 'lp-weather-compact' }, temperature || t('calendarTodayShort'))),
    popup.open && popup.pos ? h('section', {
      ref: popup.menuRef, id: popup.menuId, className: 'lp-weather-popup', 'aria-label': t('calendarTodayInfo'),
      style: popup.pos,
    },
    h('div', { className: 'lp-weather-date' }, fullDate),
    lunar ? h('div', { className: 'lp-meta' }, t('calendarLunar') + ' · ' + lunar) : null,
    data?.holiday?.name ? h('div', { className: 'lp-meta' }, data.holiday.name) : null,
    h('div', { className: 'lp-weather-heading' },
      h('span', { className: 'lp-weather-icon', 'aria-hidden': true }, icon),
      h('div', null, h('strong', null, t(condition)), h('div', { className: 'lp-meta' }, data?.region || t('calendarRegionUnknown'))),
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => { popup.hide(); onSettings(); } }, t('tipRegion'))),
    details.length ? h('dl', { className: 'lp-weather-details' }, details.map(([label, value]) =>
      h('div', { key: label }, h('dt', null, label), h('dd', null, value)))) : null,
    h('div', { className: 'lp-weather-advice' },
      h('strong', null, t('calendarLifeAdvice')),
      updated ? h('div', { className: 'lp-meta' }, t('calendarAdviceUpdated') + ' ' +
        (data.adviceDay !== data.day ? data.adviceDay + ' · ' : '') +
        updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null,
      data?.updating ? h('div', { className: 'lp-meta', role: 'status' }, t('calendarRefreshing')) : null,
      advice ? h('ul', null,
        advice.weatherAdvice ? h('li', null, t('calendarAdvice_' + advice.weatherAdvice)) : null,
        h('li', null, advice.top ? format('calendarAdviceTask', advice.top)
          : t(advice.due || advice.starting ? 'calendarAdviceBlocked' : 'calendarAdviceNoTasks')),
        advice.overdue > 0 ? h('li', null, format('calendarAdviceOverdue', advice.overdue)) : null)
        : !data?.updating ? h('p', { className: 'lp-meta' }, t('calendarAdvicePending')) : null,
    )) : null,
  );
}
