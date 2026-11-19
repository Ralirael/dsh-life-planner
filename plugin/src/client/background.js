// Reminders must keep firing while the page is open even if the planner
// panel is not the visible one, so the poller lives outside the component.
// The mounted panel owns delivery (toast list, throttled system notifications,
// ack); this module only decides when to ask the host for a new batch.
const background = { listeners: new Set() };

const describeReminder = (note, t) => {
  const title = note.kind === 'long' ? t('notifyLong') : t('notifyShort');
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

// Ask the host once and hand the whole batch to every mounted panel. The ack is
// the panel's job, so a batch that arrives while no panel is mounted simply
// stays queued on the host and is delivered again on the next poll.
const pullReminders = () => {
  if (typeof document === 'undefined') return;
  api('notifications')
    .then((list) => {
      if (!Array.isArray(list) || list.length === 0) return;
      for (const listener of Array.from(background.listeners)) {
        try {
          listener(list);
        } catch {
          // One broken panel must not stop the reminder loop.
        }
      }
    })
    .catch(() => {});
};

const startBackgroundReminders = () => {
  pullReminders();
  return setInterval(pullReminders, 30000);
};
