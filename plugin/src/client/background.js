const background = { listeners: new Set(), systemSent: new Set() };

const describeReminder = (note, t) => {
  const title = note.kind === 'study' ? t('notifyStudy') : note.kind === 'long' ? t('notifyLong') : t('notifyShort');
  if (note.kind === 'study') return { title, body: note.title };
  const parts = [note.title];
  if (note.dueAt) {
    parts.push(`${t('dueLabel')} ${toLocalInput(note.dueAt).replace('T', ' ')}`);
    if (new Date(note.dueAt).getTime() < Date.now()) parts.push(t('overdueLabel'));
  } else {
    parts.push(t('noDueDate'));
  }
  if (note.priority !== undefined && note.priority !== null) {
    const bucket = priorityBucket(Number(note.priority));
    parts.push(t(`priority${bucket.charAt(0).toUpperCase()}${bucket.slice(1)}`));
  }
  return { title, body: parts.join(' · ') };
};

const pullReminders = (t) => {
  if (typeof document === 'undefined') return;
  api('notifications')
    .then((list) => {
      if (!Array.isArray(list) || list.length === 0) return;
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const note = list.find((entry) => entry.browserFallback && !background.systemSent.has(entry.id));
        if (note) {
          try {
            const notice = describeReminder(note, t);
            new Notification(notice.title, { body: notice.body, tag: note.id });
            background.systemSent.add(note.id);
            if (background.systemSent.size > 100) background.systemSent.delete(background.systemSent.values().next().value);
            api('notifications.system', { id: note.id }).catch(() => {});
          } catch {
            // The in-app reminder remains available.
          }
        }
      }
      const pending = list.filter((entry) => entry.inAppPending !== false);
      if (!pending.length) return;
      for (const listener of Array.from(background.listeners)) {
        try {
          listener(pending);
        } catch {
          // One broken panel must not stop the reminder loop.
        }
      }
    })
    .catch(() => {});
};

const startBackgroundReminders = (t) => {
  pullReminders(t);
  return setInterval(() => pullReminders(t), 30000);
};
