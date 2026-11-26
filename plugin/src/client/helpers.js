// helpers.js — shared helpers for the panels and views.
function pageScheme() {
  try {
    const probe = document.createElement('span');
    probe.style.color = 'var(--dsw-alias-label-primary)';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
    if (!match) return 'light dark';
    const luminance = (Number(match[1]) * 299 + Number(match[2]) * 587 + Number(match[3]) * 114) / 1000;
    return luminance > 128 ? 'light' : 'dark';
  } catch {
    return 'light dark';
  }
}
const pad = (value) => String(value).padStart(2, '0');

function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${dayKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function timeLabel(item) {
  const timestamp = item.dueAt || item.startAt;
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isOverdue(item) {
  return Boolean(item.dueAt) && !item.derived.done && new Date(item.dueAt).getTime() < Date.now();
}

// Semantic priority colours: four levels, readable on both themes.
const priorityOf = (item) => (Number.isFinite(Number(item.priority)) ? Number(item.priority) : 5);

const priorityBucket = (value) => (value >= 7 ? 'high' : value >= 3 ? 'medium' : 'low');
// Priority is an ordered ramp and owns the warm end (urgency). Low is a
// neutral so it never competes with the "done" green.
const PRIORITY_TONES = [
  { max: 2, key: 'low', color: '#8A8F98' }, // 中性灰
  { max: 5, key: 'medium', color: '#5976BA' }, // 苍苍
  { max: 8, key: 'high', color: '#EA5514' }, // 黄丹
  { max: 9, key: 'highest', color: '#D12920' }, // 银朱
];

const toneOf = (priority) => {
  const value = Number(priority);
  const safe = Number.isFinite(value) ? value : 5;
  return PRIORITY_TONES.find((tone) => safe <= tone.max) || PRIORITY_TONES[3];
};

// Categorical colours for task types and tags stay on the cool side so they
// never read as urgency (red/orange) or completion (green).
const PALETTE = [
  '#2E59A7', // 群青
  '#178069', // 石绿
  '#108B96', // 吉翠
  '#A6559D', // 紫蒲
  '#CB5C83', // 琅玕紫
  '#2B2E77', // 青金石
  '#B6A014', // 苍黄
  '#75C1C4', // 松石
];

const colorOfName = (name, overrides) => {
  if (overrides && overrides[name]) return overrides[name];
  let hash = 0;
  const text = String(name || '');
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  return PALETTE[hash % PALETTE.length];
};

/** Every unfinished, unarchived entry due on a day (projects included). */
function openEntries(items) {
  return items.filter((item) => !item.derived.archived && !item.derived.done);
}

function topTask(items) {
  let best = null;
  for (const item of openEntries(items)) {
    if (!best) {
      best = item;
      continue;
    }
    const rank = priorityOf(item);
    const bestRank = priorityOf(best);
    if (rank > bestRank) best = item;
    else if (rank === bestRank) {
      const a = item.dueAt ? new Date(item.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const b = best.dueAt ? new Date(best.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (a < b) best = item;
    }
  }
  return best;
}

function groupByDay(items) {
  const map = new Map();
  for (const item of items) {
    const timestamp = item.dueAt || item.startAt;
    if (!timestamp) continue;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const rank = priorityOf(b) - priorityOf(a);
      if (rank !== 0) return rank;
      return String(a.dueAt || a.startAt).localeCompare(String(b.dueAt || b.startAt));
    });
  }
  return map;
}

function monthMatrix(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  const todayK = dayKey(new Date());
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    cells.push({
      key: dayKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === anchor.getMonth(),
      isToday: dayKey(date) === todayK,
      date,
    });
  }
  return cells;
}

function weekMatrix(selectedKey) {
  const base = new Date(`${selectedKey}T12:00:00`);
  const offset = (base.getDay() + 6) % 7;
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset);
  const todayK = dayKey(new Date());
  const cells = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    cells.push({
      key: dayKey(date),
      day: date.getDate(),
      inMonth: true,
      isToday: dayKey(date) === todayK,
      date,
    });
  }
  return cells;
}

function weekdayLabels(t) {
  return [0, 1, 2, 3, 4, 5, 6].map((index) => t(`wd${index}`));
}

function monthTitle(t, anchor) {
  return t('monthLabel').replace('{y}', String(anchor.getFullYear())).replace('{m}', String(anchor.getMonth() + 1));
}

function childrenMap(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.parentId || null;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.createdAt).localeCompare(String(b.createdAt)));
  }
  return map;
}

function descendantIds(items, rootId) {
  const map = childrenMap(items);
  const out = new Set();
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const child of map.get(current) || []) {
      if (!out.has(child.id)) {
        out.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return out;
}

/**
 * Prerequisites worth showing: explicit ones that are not inside this node's
 * own subtree. A parent already waits for its descendants implicitly, so
 * repeating that as "blocked" would be noise.
 */
function displayBlockers(item, byId, items) {
  const below = descendantIds(items, item.id);
  return (item.dependsOn || [])
    .map((id) => byId.get(id))
    .filter((dep) => dep && !dep.derived.done && !below.has(dep.id));
}

// One node type only, so every label resolves to the same word.
// A tiny stale-while-revalidate cache: the panel paints the previous snapshot
// instantly, then the network answer replaces it.
const PLANNER_CACHE_KEY = 'lpPlannerCache.v1';

function readPlannerCache() {
  try {
    const raw = localStorage.getItem(PLANNER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePlannerCache(patch) {
  try {
    const current = readPlannerCache() || {};
    const next = { ...current, ...patch };
    const text = JSON.stringify(next);
    // The snapshot can grow large; keep well inside the storage quota.
    if (text.length > 3_500_000) return;
    localStorage.setItem(PLANNER_CACHE_KEY, text);
  } catch {
    // A full quota only costs the cache, never correctness.
  }
}

/** Numeric form fields: an empty box keeps the fallback instead of saving 0. */
function clampNumber(value, min, max, fallback) {
  const number = Number(value)
  if (value === '' || value === null || value === undefined || !Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function kindLabel(t) {
  return t('kindTask');
}

/** "10:00-13:00,19:00-02:00" → ranges, or null when the text is malformed. */
function parseWindowsText(text) {
  const parts = String(text || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return [];
  const ranges = [];
  for (const part of parts) {
    const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(part);
    if (!match) return null;
    const [sh, sm, eh, em] = match.slice(1).map(Number);
    if (sh > 23 || eh > 23 || sm > 59 || em > 59) return null;
    ranges.push({ start: sh * 60 + sm, end: eh * 60 + em });
  }
  return ranges;
}

const KIND_GLYPH = { area: '○', project: '○', task: '○' };
