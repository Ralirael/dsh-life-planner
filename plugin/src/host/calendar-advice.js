export function shouldRefreshCalendar(now, day, cached, automatic) {
  return automatic && (!cached || (now.getHours() >= 12 && cached.autoDay !== day))
}

export function calendarAdvice(items, weather, dayOf, now) {
  const open = items.filter((item) =>
    ['task', 'project'].includes(item.kind) && !item.derived.done && !item.derived.archived && !item.derived.deleted)
  const due = open.filter((item) => item.dueAt && dayOf(item.dueAt))
  const starting = open.filter((item) => item.startAt && dayOf(item.startAt))
  const overdue = open.filter((item) => item.dueAt && Date.parse(item.dueAt) < now.getTime())
  const top = [...new Set([...due, ...starting])].filter((item) => !item.derived.blocked)
    .sort((a, b) => Number(due.includes(b)) - Number(due.includes(a)) ||
      (b.priority ?? 0) - (a.priority ?? 0) || (a.dueAt || a.startAt).localeCompare(b.dueAt || b.startAt))[0]
  const weatherAdvice = weather && (
    weather.wmoCode >= 95 ? 'storm' :
      weather.wmoCode >= 71 && weather.wmoCode <= 77 || [85, 86].includes(weather.wmoCode) ? 'snow' :
        weather.precipitationProbability >= 50 || weather.wmoCode >= 51 ? 'rain' :
          weather.maxC >= 33 ? 'heat' :
            weather.minC <= 2 ? 'cold' :
              weather.windKph >= 40 ? 'wind' : 'fair'
  )
  return { due: due.length, starting: starting.length, overdue: overdue.length, top: top?.title || '', weatherAdvice }
}
