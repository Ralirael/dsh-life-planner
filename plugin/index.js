/**
 * Host half of dsh-life-planner (v0.1 slice).
 *
 * Data lives in a local SQLite database (`node:sqlite`, built into Node 24, so
 * still no native dependency). The page reads and writes through the JSON route
 * below; the tools stay registered once with a per-step `when` condition, so a
 * session sees them only while its header switch is on.
 */

import { DatabaseSync, backup } from 'node:sqlite'
import z from '@deepseek-ai/schemastery'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, cpSync, writeFileSync, chmodSync, statSync, rmSync, realpathSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative as relativePath, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

export const inject = ['tools']

/**
 * Plugin-level switches live here so the plugin manager renders them; changing
 * them reloads the plugin, i.e. they are deliberately restart-time settings.
 */
export const Config = z.object({
  studyMode: z
    .boolean()
    .default(true)
    .description('学习模式（任务规划的子功能）：关闭后不再向会话提供 study_* 工具，学习功能整体停用'),
  studyPanel: z
    .boolean()
    .default(true)
    .description('学习页：关闭后学习页拉不到数据（子功能开关，重启生效）'),
})

let runtimeConfig = { studyMode: true, studyPanel: true, studyDailyMinutes: 60 }

const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const DATA_DIR = join(HOME, 'life-planner')
const DB_FILE = join(DATA_DIR, 'data.db')
const LEGACY_JSON = join(DATA_DIR, 'data.json')
const LEGACY_PLAN = join(DATA_DIR, 'plan.md')
const BACKUP_DIR = join(DATA_DIR, 'backups')
const MAX_BACKUPS = 20
const API_PREFIX = '/life-planner/api'
const BACKGROUND_DIR = join(DATA_DIR, 'backgrounds')

/** Next deadline for a repeating item; null when the rule is unusable. */
function nextDue(dueAt, recurrence) {
  if (!recurrence || !recurrence.freq) return null
  const base = dueAt ? new Date(dueAt) : new Date()
  const step = Math.max(1, Number(recurrence.interval) || 1)
  if (recurrence.freq === 'daily') base.setDate(base.getDate() + step)
  else if (recurrence.freq === 'weekly') base.setDate(base.getDate() + 7 * step)
  else if (recurrence.freq === 'monthly') base.setMonth(base.getMonth() + step)
  else return null
  return base.toISOString()
}

/** Any kind other than the two container kinds behaves like a task. */
// One node type only: everything in the tree is a task. The kind column stays
// for old rows but is normalised to 'task' on startup.
function defaultStatus() {
  return 'todo'
}

function isTaskLike() {
  return true
}

/** Mastery is a 0-10 scale; anything else falls back to the initial 4. */
// Knowledge-base types: list (cards), tree (points), bank (questions + points).
const TEMPLATE_ALIASES = {
  list: 'list',
  'word-bank': 'list',
  tree: 'tree',
  outline: 'tree',
  bank: 'bank',
  'outline-bank': 'bank',
  'question-bank': 'bank',
  custom: 'custom',
  ingest: 'ingest',
  teaching: 'teaching',
}

const TEMPLATE_FILES = {
  list: 'word-bank.md',
  tree: 'outline.md',
  bank: 'outline-bank.md',
  custom: 'custom.md',
  ingest: 'ingest.md',
  teaching: 'teaching.md',
}

function normalizeTemplate(name) {
  return TEMPLATE_ALIASES[String(name || '')] || ''
}

/** Tool result kind for the item pool behind a study task. */
function bankKind(table) {
  if (table === 'cards') return 'list'
  if (table === 'questions') return 'bank'
  return 'tree'
}

function clampMastery(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 4
  return Math.min(10, Math.max(0, Math.round(number)))
}

/** Review spacing is derived from the mastery value after each completion. */
function reviewIntervalDays(mastery) {
  const value = clampMastery(mastery)
  if (value >= 10) return 0
  if (value <= 2) return 1
  if (value <= 4) return 2
  if (value <= 6) return 3
  if (value <= 8) return 5
  return 7
}

/** Null means "no more reviews": the topic is mastered. */
function scheduleReview(mastery, from = new Date()) {  const days = reviewIntervalDays(mastery)
  if (days <= 0) return null
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

/** Study days roll over at 04:00, matching most people's waking schedule. */
const STUDY_DAY_SHIFT_MS = 4 * 3600000

function studyDayKey(now = new Date()) {
  return dayKeyOf(new Date(now.getTime() - STUDY_DAY_SHIFT_MS))
}

/** Local calendar day key for plan rows. */
function dayKeyOf(date) {
  const value = new Date(date)
  const pad = (number) => String(number).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

const nowIso = () => new Date().toISOString()

/** Priorities are 0-9; 0-2 reads as low, 3-6 as medium, 7-9 as high. */
function clampPriority(value, fallback = 5) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(9, Math.max(0, Math.round(number)))
}

/** Importers and the legacy JSON may still speak in the three words. */
function normalizePriority(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'string') {
    const word = value.trim().toLowerCase()
    if (word === 'high') return 8
    if (word === 'medium') return 5
    if (word === 'low') return 1
  }
  return clampPriority(value)
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS items (
    id           TEXT PRIMARY KEY,
    kind         TEXT NOT NULL,
    title        TEXT NOT NULL,
    parent_id    TEXT,
    ord          INTEGER NOT NULL DEFAULT 0,
    note         TEXT NOT NULL DEFAULT '',
    status       TEXT,
    priority     TEXT,
    depends_on   TEXT NOT NULL DEFAULT '[]',
    due_at       TEXT,
    recurrence   TEXT,
    completed_at TEXT,
    completion_note TEXT,
    archived_at  TEXT,
    deleted_at   TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT,
    last_notified_at TEXT,
    defer_started_at TEXT,
    tags         TEXT NOT NULL DEFAULT '[]',
    task_type    TEXT,
    start_at     TEXT,
    location     TEXT
  );
  CREATE INDEX IF NOT EXISTS items_parent ON items(parent_id);
  CREATE INDEX IF NOT EXISTS items_due ON items(due_at);
  CREATE TABLE IF NOT EXISTS plan (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    body_markdown TEXT NOT NULL DEFAULT '',
    updated_at    TEXT
  );
  CREATE TABLE IF NOT EXISTS session_flags (
    session_id TEXT PRIMARY KEY,
    enabled    INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  -- The Web shell gets a fresh port (and therefore a fresh origin) on every
  -- launch, so appearance and saved skins must live here, not in localStorage.
  CREATE TABLE IF NOT EXISTS ui_state (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id            TEXT PRIMARY KEY,
    item_id       TEXT NOT NULL,
    title         TEXT NOT NULL,
    due_at        TEXT,
    kind          TEXT,
    priority      TEXT,
    host_notified INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL,
    delivered_at  TEXT
  );
  CREATE TABLE IF NOT EXISTS trash (
    id          TEXT PRIMARY KEY,
    payload     TEXT NOT NULL,
    deleted_at  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    note        TEXT NOT NULL DEFAULT '',
    exam_date   TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT
  );
  CREATE TABLE IF NOT EXISTS topics (
    id          TEXT PRIMARY KEY,
    subject_id  TEXT,
    title       TEXT NOT NULL,
    mastery     TEXT NOT NULL DEFAULT 'new',
    review_at   TEXT,
    lock_until  TEXT,
    mastered_at TEXT,
    note        TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    updated_at  TEXT
  );
  CREATE TABLE IF NOT EXISTS study_plan (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,
    subject_id  TEXT,
    topic_id    TEXT,
    title       TEXT NOT NULL DEFAULT '',
    kind        TEXT NOT NULL DEFAULT 'learn',
    minutes     INTEGER NOT NULL DEFAULT 30,
    done_at     TEXT,
    task_id     TEXT,
    created_at  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS shelf_items (
    id          TEXT PRIMARY KEY,
    kind        TEXT NOT NULL,
    path        TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',
    note        TEXT NOT NULL DEFAULT '',
    fetched_at  TEXT,
    listing     TEXT NOT NULL DEFAULT '[]',
    listing_truncated INTEGER NOT NULL DEFAULT 0,
    manual      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS study_tasks (
    id             TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    workspace_path TEXT NOT NULL,
    template       TEXT NOT NULL DEFAULT 'word-bank',
    summary        TEXT NOT NULL DEFAULT '{}',
    item_id        TEXT,
    session_id     TEXT,
    last_done_day  TEXT,
    daily_target   INTEGER NOT NULL DEFAULT 15,
    daily_new      INTEGER NOT NULL DEFAULT 5,
    daily_review   INTEGER NOT NULL DEFAULT 10,
    created_at     TEXT NOT NULL,
    updated_at     TEXT
  );
  CREATE TABLE IF NOT EXISTS study_day_progress (
    task_id        TEXT NOT NULL,
    day            TEXT NOT NULL,
    answered       INTEGER NOT NULL DEFAULT 0,
    correct        INTEGER NOT NULL DEFAULT 0,
    answered_new   INTEGER NOT NULL DEFAULT 0,
    answered_review INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (task_id, day)
  );
  CREATE TABLE IF NOT EXISTS study_day_targets (
    task_id       TEXT NOT NULL,
    day           TEXT NOT NULL,
    target        INTEGER NOT NULL,
    target_new    INTEGER,
    target_review INTEGER,
    note          TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (task_id, day)
  );
  CREATE TABLE IF NOT EXISTS study_time_targets (
    day      TEXT PRIMARY KEY,
    minutes  INTEGER NOT NULL,
    note     TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS study_habits (
    day         TEXT PRIMARY KEY,
    started_at  TEXT,
    ended_at    TEXT,
    minutes     INTEGER NOT NULL DEFAULT 0,
    segments    INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT
  );
  CREATE TABLE IF NOT EXISTS study_task_materials (
    task_id   TEXT NOT NULL,
    shelf_id  TEXT NOT NULL,
    PRIMARY KEY (task_id, shelf_id)
  );
  CREATE TABLE IF NOT EXISTS daily_tips (
    day         TEXT PRIMARY KEY,
    text        TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS study_materials (
    plan_id     TEXT NOT NULL,
    shelf_id    TEXT NOT NULL,
    PRIMARY KEY (plan_id, shelf_id)
  );
  CREATE TABLE IF NOT EXISTS mistakes (
    id          TEXT PRIMARY KEY,
    subject_id  TEXT,
    topic_id    TEXT,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL DEFAULT '',
    reason      TEXT NOT NULL DEFAULT '',
    source      TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',
    review_at   TEXT,
    task_id     TEXT,
    item_id     TEXT,
    created_at  TEXT NOT NULL
  );
`

/** Reading JSON from a row must never take the whole list down. */
function safeJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  try {
    const parsed = JSON.parse(value)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

function rowToItem(row) {
  if (!row) return undefined
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    parentId: row.parent_id || null,
    order: row.ord,
    note: row.note || '',
    status: row.status || undefined,
    priority: row.priority === null || row.priority === undefined ? undefined : Number(row.priority),
    dependsOn: safeJson(row.depends_on, []),
    dueAt: row.due_at || undefined,
    recurrence: safeJson(row.recurrence, undefined),
    completedAt: row.completed_at || undefined,
    completionNote: row.completion_note || undefined,
    archivedAt: row.archived_at || undefined,
    deletedAt: row.deleted_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    lastNotifiedAt: row.last_notified_at || undefined,
    deferStartedAt: row.defer_started_at || undefined,
    tags: safeJson(row.tags, []),
    taskType: row.task_type || undefined,
    startAt: row.start_at || undefined,
    location: row.location || undefined,
  }
}

/** Tags arrive as an array or a comma separated string; keep them short and unique. */
function normalizeTags(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const out = []
  for (const entry of list) {
    const tag = String(entry || '').trim().slice(0, 24)
    if (tag && !out.includes(tag)) out.push(tag)
    if (out.length >= 20) break
  }
  return out
}

const ITEM_COLUMNS =
  'id, kind, title, parent_id, ord, note, status, priority, depends_on, due_at, recurrence, completed_at, completion_note, archived_at, deleted_at, created_at, updated_at, last_notified_at, defer_started_at, tags, task_type, start_at, location'

const DEFAULT_SETTINGS = {
  weekdayWindows: '10:00-13:00,19:00-02:00',
  weekendWindows: '10:00-02:00',
  leadTaskDays: 3,
  leadProjectDays: 8,
  notifyGapMinutes: 3,
  nonUrgentQuotaPerWindow: 2,
  maxDeferHours: 48,
  archiveAfterDays: 30,
  deleteAfterDays: 90,
  longTermReminderHours: 12,
  studyDailyMinutes: 60,
  maxRemindersPerWindow: 6,
  systemNotify: true,
  kindLabels: {},
  kinds: [
    { id: 'area', label: '领域' },
    { id: 'project', label: '项目' },
    { id: 'task', label: '任务' },
  ],
  taskTypes: ['学习', '工作', '生活', '其他'],
  tags: [],
  colorOverrides: {},
}

const DEV = process.env.LIFE_PLANNER_DEV === '1'

/**
 * The page can be closed while the Desktop app keeps running; only the
 * Electron main process can still raise a desktop notification then.
 * Resolved once, and absent outside Electron.
 */
let systemNotifier = null
let electronShell = null
try {
  // ESM has no `require`; Electron is reachable through createRequire instead.
  const electron = createRequire(import.meta.url)('electron')
  if (electron && typeof electron.Notification === 'function') systemNotifier = electron.Notification
  if (electron && electron.shell) electronShell = electron.shell
} catch {
  systemNotifier = null
  electronShell = null
}

/**
 * Reveal a shelf entry in the desktop: folders open in Explorer, files are
 * selected in their folder, pages open in the default browser.
 */
function openShelfTarget(item) {
  if (item.kind === 'url') {
    if (electronShell && typeof electronShell.openExternal === 'function') {
      electronShell.openExternal(item.path)
      return true
    }
    if (process.platform === 'win32') {
      // Never route a URL through cmd: `&`/`|`/`^` would be interpreted, and a
      // query string would break the launch. rundll32 hands it to the browser.
      if (!/^https?:\/\//i.test(String(item.path || ''))) return false
      return spawnDetached('rundll32.exe', ['url.dll,FileProtocolHandler', item.path], { windowsHide: true })
    }
    return spawnDetached(process.platform === 'darwin' ? 'open' : 'xdg-open', [item.path])
  }
  if (item.kind === 'file' && electronShell && typeof electronShell.showItemInFolder === 'function') {
    electronShell.showItemInFolder(item.path)
    return true
  }
  if (electronShell && typeof electronShell.openPath === 'function') {
    electronShell.openPath(item.path)
    return true
  }
  // The plugin host is not the Electron renderer, so shell out as a fallback.
  if (process.platform === 'win32') {
    const args = item.kind === 'file' ? [`/select,${item.path}`] : [item.path]
    return spawnDetached('explorer.exe', args)
  }
  if (process.platform === 'darwin') {
    return spawnDetached('open', item.kind === 'file' ? ['-R', item.path] : [item.path])
  }
  return spawnDetached('xdg-open', [item.path])
}

const BACKGROUND_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
}

/** Backgrounds live beside the database so a skin export stays small. */
const BACKGROUND_AREAS = ['planning', 'study']
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
/** Bundled default background, used when the appearance asks for it. */
const DEFAULT_BACKGROUND = join(PLUGIN_DIR, 'assets', 'default-background.webp')
const DEFAULT_BACKGROUND_URL = `${API_PREFIX}/background?area=default&v=1`

function requireBackgroundArea(area) {
  const value = String(area || '')
  if (!BACKGROUND_AREAS.includes(value)) throw new Error(`unknown background area: ${value}`)
  return value
}

function backgroundFile(area) {
  if (!BACKGROUND_AREAS.includes(String(area || ''))) return null
  if (!existsSync(BACKGROUND_DIR)) return null
  for (const ext of Object.keys(BACKGROUND_MIME)) {
    const file = join(BACKGROUND_DIR, `${area}.${ext}`)
    if (existsSync(file)) return file
  }
  return null
}

function backgroundUrl(area) {
  const file = backgroundFile(area)
  if (!file) return null
  return `${API_PREFIX}/background?area=${area}&v=${Math.round(statSync(file).mtimeMs)}`
}

function saveBackgroundImage(rawArea, dataUrl) {
  const area = requireBackgroundArea(rawArea)
  const match = /^data:image\/([a-zA-Z+]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl || ''))
  if (!match) throw new Error('不支持的图片数据')
  const raw = match[1].toLowerCase()
  const ext = raw === 'jpeg' ? 'jpg' : raw
  if (!BACKGROUND_MIME[ext]) throw new Error(`不支持的图片类型：${ext}`)
  const buffer = Buffer.from(match[2], 'base64')
  mkdirSync(BACKGROUND_DIR, { recursive: true })
  for (const previous of Object.keys(BACKGROUND_MIME)) {
    const file = join(BACKGROUND_DIR, `${area}.${previous}`)
    if (existsSync(file)) unlinkSync(file)
  }
  const target = join(BACKGROUND_DIR, `${area}.${ext}`)
  writeFileSync(target, buffer)
  return { area, path: target, url: `${API_PREFIX}/background?area=${area}&v=${Date.now()}` }
}

function clearBackgroundImage(rawArea) {
  const area = requireBackgroundArea(rawArea)
  for (const ext of Object.keys(BACKGROUND_MIME)) {
    const file = join(BACKGROUND_DIR, `${area}.${ext}`)
    if (existsSync(file)) unlinkSync(file)
  }
  return { area, cleared: true }
}

function openBackgroundFolder() {
  mkdirSync(BACKGROUND_DIR, { recursive: true })
  if (process.platform === 'win32') spawnDetached('explorer.exe', [BACKGROUND_DIR])
  else if (process.platform === 'darwin') spawnDetached('open', [BACKGROUND_DIR])
  else spawnDetached('xdg-open', [BACKGROUND_DIR])
  return { dir: BACKGROUND_DIR }
}

/** Locate the `pdftotext` binary; TeX Live ships one on Windows. */function findPdfToText() {
  const envPath = process.env.DSH_PDFTOTEXT
  if (envPath && existsSync(envPath)) return envPath
  const lookup = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['pdftotext'], {
    encoding: 'utf8',
    windowsHide: true,
  })
  if (lookup.status === 0 && String(lookup.stdout || '').trim()) return 'pdftotext'
  const direct = [
    'D:\\Program Files (x86)\\texlive\\2026\\bin\\windows\\pdftotext.exe',
    '/usr/bin/pdftotext',
    '/usr/local/bin/pdftotext',
    // Homebrew used to live in /usr/local; Apple Silicon installs under /opt.
    '/opt/homebrew/bin/pdftotext',
    '/opt/local/bin/pdftotext',
  ]
  for (const candidate of direct) {
    if (existsSync(candidate)) return candidate
  }
  try {
    const base = 'D:\\Program Files (x86)\\texlive'
    if (existsSync(base)) {
      for (const year of readdirSync(base)) {
        const path = join(base, year, 'bin', 'windows', 'pdftotext.exe')
        if (existsSync(path)) return path
      }
    }
  } catch {
    // No TeX Live install; fall through to null.
  }
  return null
}

function spawnDetached(command, args, options = {}) {
  try {
    spawn(command, args, { detached: true, stdio: 'ignore', ...options }).unref()
    return true
  } catch {
    return false
  }
}

function hostNotify(title, body) {
  try {
    if (readSettings().systemNotify === false) return false
  } catch {
    // Unreadable settings keep the notification path alive.
  }
  if (systemNotifier) {
    try {
      const toast = new systemNotifier({ title, body, silent: false })
      toast.show()
      return true
    } catch {
      // Fall through to the platform notifier.
    }
  }
  return platformNotify(title, body)
}

/**
 * The DSH desktop Host runs under `ELECTRON_RUN_AS_NODE`, so `require('electron')`
 * never resolves there and the Electron `Notification` class is unavailable.
 * macOS still has a native notifier on every install: `osascript` posts a user
 * notification through Notification Center without extra permissions.
 */
const OSASCRIPT = '/usr/bin/osascript'

function platformNotify(title, body) {
  if (process.platform !== 'darwin' || !existsSync(OSASCRIPT)) return false
  // AppleScript string literals only need backslash and double-quote escapes;
  // newlines collapse so the banner stays one line.
  const quote = (value) =>
    String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 400)
  const script = `display notification "${quote(body)}" with title "${quote(title)}"`
  return spawnDetached(OSASCRIPT, ['-e', script])
}

/**
 * macOS ships PDFKit but no `pdftotext`. JavaScript for Automation reaches
 * PDFKit through `ObjC`, which is real text extraction (embedded fonts, CID and
 * CJK included) with nothing to install.
 */
const PDFKIT_READER = `ObjC.import("PDFKit");
ObjC.import("Foundation");
function run(argv) {
  var doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  if (!doc) return "";
  return ObjC.unwrap(doc.string) || "";
}`

function pdfKitText(target) {
  if (process.platform !== 'darwin' || !existsSync(OSASCRIPT)) return null
  let result
  try {
    result = spawnSync(OSASCRIPT, ['-l', 'JavaScript', '-e', PDFKIT_READER, target], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 120000,
      windowsHide: true,
    })
  } catch {
    return null
  }
  if (result.error || result.status !== 0) return null
  // osascript ends the returned string with a single newline of its own.
  return String(result.stdout || '').replace(/\r?\n$/, '')
}

/** PDF text plus the engine that produced it; throws when no engine works. */
function readPdfText(target) {
  const binary = findPdfToText()
  if (binary) {
    const result = spawnSync(binary, ['-layout', '-enc', 'UTF-8', target, '-'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    })
    if (result.error) throw new Error(`pdftotext failed: ${result.error.message}`)
    if (result.status !== 0) {
      throw new Error(`pdftotext exited with ${result.status}: ${String(result.stderr || '').slice(0, 400)}`)
    }
    return { text: String(result.stdout || ''), engine: 'pdftotext' }
  }
  const native = pdfKitText(target)
  if (native !== null) return { text: native, engine: 'pdfkit' }
  throw new Error(
    'PDF 取文不可用：macOS 用系统 PDFKit（本机 osascript 不可用），其它系统请安装 pdftotext（brew install poppler）',
  )
}

/** "10:00-13:00,19:00-02:00" -> list of minute ranges; an end before the start wraps past midnight. */
function parseWindows(text) {
  return String(text || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [start, end] = part.split('-').map((piece) => piece.trim())
      const toMinutes = (value) => {
        const [hours, minutes] = String(value).split(':').map(Number)
        return (hours || 0) * 60 + (minutes || 0)
      }
      return { start: toMinutes(start), end: toMinutes(end) }
    })
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end))
}


/** Reminder interval (minutes) for the time left until the deadline. */
function intervalMinutesLeft(msLeft) {
  const hours = msLeft / 3600000
  if (hours < 0) return 120
  if (hours > 168) return 4320
  if (hours > 72) return 1440
  if (hours > 24) return 720
  if (hours > 12) return 240
  if (hours > 3) return 120
  if (hours > 1) return 30
  return 10
}

/** Import a pre-SQLite `data.json` / `plan.md` once, then park the old files. */
function migrateLegacy(db) {
  if (!existsSync(LEGACY_JSON)) return false
  let parsed
  try {
    parsed = JSON.parse(readFileSync(LEGACY_JSON, 'utf8'))
  } catch {
    return false
  }
  const stamp = nowIso().replace(/[:.]/g, '-')
  const insert = db.prepare(
    `INSERT OR IGNORE INTO items (${ITEM_COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  )
  db.exec('BEGIN')
  try {
    for (const item of Array.isArray(parsed.items) ? parsed.items : []) {
      insert.run(
        item.id,
        item.kind,
        item.title,
        item.parentId || null,
        item.order || 0,
        item.note || '',
        item.status || null,
        normalizePriority(item.priority),
        JSON.stringify(item.dependsOn || []),
        item.dueAt || null,
        item.recurrence ? JSON.stringify(item.recurrence) : null,
        item.completedAt || null,
        item.completionNote || null,
        item.archivedAt || null,
        item.deletedAt || null,
        item.createdAt || nowIso(),
        item.updatedAt || item.createdAt || nowIso(),
        item.lastNotifiedAt || null,
        item.deferStartedAt || null,
        JSON.stringify(normalizeTags(item.tags)),
        item.taskType || null,
        item.startAt || null,
        item.location || null,
      )
    }
    const plan = parsed.plan || {}
    db.prepare('INSERT OR REPLACE INTO plan (id,title,body_markdown,updated_at) VALUES (?,?,?,?)').run(
      'plan',
      plan.title || '规划书',
      plan.bodyMarkdown || '',
      plan.updatedAt || null,
    )
    for (const [sessionId, enabled] of Object.entries(parsed.sessionToolFlags || {})) {
      if (enabled === true) {
        db.prepare('INSERT OR REPLACE INTO session_flags (session_id,enabled) VALUES (?,1)').run(sessionId)
      }
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  renameSync(LEGACY_JSON, `${LEGACY_JSON}.migrated-${stamp}`)
  if (existsSync(LEGACY_PLAN)) renameSync(LEGACY_PLAN, `${LEGACY_PLAN}.migrated-${stamp}`)
  return true
}

function createStore() {
  mkdirSync(DATA_DIR, { recursive: true })
  const db = new DatabaseSync(DB_FILE)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA synchronous = NORMAL')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(SCHEMA)
  // Older databases predate updated_at; adding it in place keeps the file.
  const columns = db.prepare('PRAGMA table_info(items)').all().map((column) => column.name)
  if (!columns.includes('updated_at')) db.exec('ALTER TABLE items ADD COLUMN updated_at TEXT')
  if (!columns.includes('last_notified_at')) db.exec('ALTER TABLE items ADD COLUMN last_notified_at TEXT')
  if (!columns.includes('defer_started_at')) db.exec('ALTER TABLE items ADD COLUMN defer_started_at TEXT')
  if (!columns.includes('tags')) db.exec("ALTER TABLE items ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'")
  if (!columns.includes('task_type')) db.exec('ALTER TABLE items ADD COLUMN task_type TEXT')
  if (!columns.includes('start_at')) db.exec('ALTER TABLE items ADD COLUMN start_at TEXT')
  if (!columns.includes('location')) db.exec('ALTER TABLE items ADD COLUMN location TEXT')
  const subjectColumns = db.prepare('PRAGMA table_info(subjects)').all().map((column) => column.name)
  if (!subjectColumns.includes('exam_date')) db.exec('ALTER TABLE subjects ADD COLUMN exam_date TEXT')
  const topicColumns = db.prepare('PRAGMA table_info(topics)').all().map((column) => column.name)
  if (!topicColumns.includes('lock_until')) db.exec('ALTER TABLE topics ADD COLUMN lock_until TEXT')
  if (!topicColumns.includes('mastered_at')) db.exec('ALTER TABLE topics ADD COLUMN mastered_at TEXT')
  const shelfColumns = db.prepare('PRAGMA table_info(shelf_items)').all().map((column) => column.name)
  // One node type only: fold legacy area/project/custom rows into plain tasks.
  if (db.prepare("SELECT COUNT(*) AS n FROM items WHERE kind<>'task'").get().n > 0) {
    db.exec("UPDATE items SET kind='task', status=COALESCE(status,'todo') WHERE kind<>'task'")
  }  if (shelfColumns.length > 0 && !shelfColumns.includes('listing')) {
    db.exec("ALTER TABLE shelf_items ADD COLUMN listing TEXT NOT NULL DEFAULT '[]'")
  }
  if (shelfColumns.length > 0 && !shelfColumns.includes('manual')) {
    db.exec('ALTER TABLE shelf_items ADD COLUMN manual INTEGER NOT NULL DEFAULT 0')
  }
  if (shelfColumns.length > 0 && !shelfColumns.includes('listing_truncated')) {
    db.exec('ALTER TABLE shelf_items ADD COLUMN listing_truncated INTEGER NOT NULL DEFAULT 0')
  }
  const studyTaskColumns = db.prepare('PRAGMA table_info(study_tasks)').all().map((column) => column.name)
  if (studyTaskColumns.length > 0 && !studyTaskColumns.includes('session_id')) {
    db.exec('ALTER TABLE study_tasks ADD COLUMN session_id TEXT')
  }
  if (studyTaskColumns.length > 0 && !studyTaskColumns.includes('last_done_day')) {
    db.exec('ALTER TABLE study_tasks ADD COLUMN last_done_day TEXT')
  }
  if (studyTaskColumns.length > 0 && !studyTaskColumns.includes('daily_target')) {
    db.exec('ALTER TABLE study_tasks ADD COLUMN daily_target INTEGER NOT NULL DEFAULT 10')
  }
  const needsNew = studyTaskColumns.length > 0 && !studyTaskColumns.includes('daily_new')
  const needsReview = studyTaskColumns.length > 0 && !studyTaskColumns.includes('daily_review')
  if (needsNew) db.exec('ALTER TABLE study_tasks ADD COLUMN daily_new INTEGER NOT NULL DEFAULT 5')
  if (needsReview) db.exec('ALTER TABLE study_tasks ADD COLUMN daily_review INTEGER NOT NULL DEFAULT 10')
  if (needsNew || needsReview) {
    // Existing tasks only had one number: split it 1/3 new, 2/3 review.
    db.exec(
      'UPDATE study_tasks SET daily_new = MAX(1, CAST(daily_target * 0.34 AS INTEGER)), daily_review = MAX(1, daily_target - MAX(1, CAST(daily_target * 0.34 AS INTEGER)))',
    )
  }
  const progressColumns = db.prepare('PRAGMA table_info(study_day_progress)').all().map((column) => column.name)
  if (progressColumns.length > 0 && !progressColumns.includes('answered_new')) {
    db.exec('ALTER TABLE study_day_progress ADD COLUMN answered_new INTEGER NOT NULL DEFAULT 0')
  }
  if (progressColumns.length > 0 && !progressColumns.includes('answered_review')) {
    db.exec('ALTER TABLE study_day_progress ADD COLUMN answered_review INTEGER NOT NULL DEFAULT 0')
  }
  const dayTargetColumns = db.prepare('PRAGMA table_info(study_day_targets)').all().map((column) => column.name)
  if (dayTargetColumns.length > 0 && !dayTargetColumns.includes('target_new')) {
    db.exec('ALTER TABLE study_day_targets ADD COLUMN target_new INTEGER')
  }
  if (dayTargetColumns.length > 0 && !dayTargetColumns.includes('target_review')) {
    db.exec('ALTER TABLE study_day_targets ADD COLUMN target_review INTEGER')
  }
  // One task per session: duplicates came from the same session registering
  // twice, so keep the richest row and make the database refuse a second one.
  try {
    const dupes = db
      .prepare(
        `SELECT session_id FROM study_tasks
          WHERE session_id IS NOT NULL AND session_id <> ''
          GROUP BY session_id HAVING COUNT(*) > 1`,
      )
      .all()
    for (const dupe of dupes) {
      const rows = db
        .prepare(
          "SELECT id FROM study_tasks WHERE session_id=? ORDER BY (item_id IS NOT NULL) DESC, (summary<>'{}') DESC, updated_at DESC",
        )
        .all(dupe.session_id)
      for (const extra of rows.slice(1)) {
        db.prepare('DELETE FROM study_tasks WHERE id=?').run(extra.id)
        db.prepare('DELETE FROM study_task_materials WHERE task_id=?').run(extra.id)
      }
    }
  } catch (error) {
    console.warn('[life-planner] could not dedupe study tasks', error)
  }
  // The guard is created separately so a failed clean-up can never skip it.
  try {
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS ux_study_tasks_session ON study_tasks(session_id) WHERE session_id IS NOT NULL AND session_id <> ''",
    )
  } catch (error) {
    console.warn('[life-planner] could not create the study task session index', error)
  }
  // Mistakes remember which study task and which workspace item produced them.
  const mistakeColumns = db.prepare('PRAGMA table_info(mistakes)').all().map((column) => column.name)
  if (mistakeColumns.length > 0 && !mistakeColumns.includes('task_id')) {
    db.exec('ALTER TABLE mistakes ADD COLUMN task_id TEXT')
  }
  if (mistakeColumns.length > 0 && !mistakeColumns.includes('item_id')) {
    db.exec('ALTER TABLE mistakes ADD COLUMN item_id TEXT')
  }
  // Mastery moved from four words to a 0-10 number.
  db.exec(
    "UPDATE topics SET mastery = CASE mastery WHEN 'new' THEN '4' WHEN 'learning' THEN '5' WHEN 'review' THEN '3' WHEN 'mastered' THEN '10' ELSE mastery END WHERE mastery IN ('new','learning','review','mastered')",
  )
  const notificationColumns = db.prepare('PRAGMA table_info(notifications)').all().map((column) => column.name)
  if (!notificationColumns.includes('kind')) db.exec('ALTER TABLE notifications ADD COLUMN kind TEXT')
  if (!notificationColumns.includes('priority')) db.exec('ALTER TABLE notifications ADD COLUMN priority TEXT')
  if (!notificationColumns.includes('host_notified')) db.exec('ALTER TABLE notifications ADD COLUMN host_notified INTEGER NOT NULL DEFAULT 0')
  // Priorities are 0-9 now; older rows hold the three words.
  db.exec(
    "UPDATE items SET priority = CASE priority WHEN 'high' THEN '8' WHEN 'medium' THEN '5' WHEN 'low' THEN '1' ELSE priority END WHERE priority IN ('high','medium','low')",
  )
  migrateLegacy(db)
  writeBackup(db)

  const allItems = () => db.prepare(`SELECT ${ITEM_COLUMNS} FROM items`).all().map(rowToItem)
  const getItem = (id) => rowToItem(db.prepare(`SELECT ${ITEM_COLUMNS} FROM items WHERE id = ?`).get(id))

  function isDone(item) {
    return Boolean(item && item.completedAt)
  }

  function derive(item, index) {
    const done = isDone(item)
    const archived = Boolean(item.archivedAt)
    // A parent task waits for its own descendants; explicit prerequisites that
    // are descendants add nothing, so duplicate ids collapse below.
    const explicit = (item.dependsOn || []).filter((dep) => {
      const node = index.byId.get(dep)
      return node && !isDone(node)
    })
    const below = index.unfinishedIds.get(item.id) || []
    const blockedBy = Array.from(new Set([...explicit, ...below]))
    const blocked = isTaskLike(item.kind) && !done ? blockedBy.length > 0 : false
    return { done, archived, blocked, blockedBy, deleted: Boolean(item.deletedAt) }
  }

  /** One pass over the tree: children lookup plus every unfinished descendant id. */
  function buildIndex(items) {
    const byId = new Map(items.map((entry) => [entry.id, entry]))
    const children = new Map()
    for (const item of items) {
      const key = item.parentId || null
      if (!children.has(key)) children.set(key, [])
      children.get(key).push(item)
    }
    const unfinishedIds = new Map()
    const visited = new Set()
    const walk = (item) => {
      const ids = []
      if (visited.has(item.id)) return ids
      visited.add(item.id)
      for (const child of children.get(item.id) || []) {
        const below = walk(child)
        if (!isDone(child)) ids.push(child.id)
        for (const id of below) ids.push(id)
      }
      unfinishedIds.set(item.id, ids)
      return ids
    }
    for (const root of children.get(null) || []) walk(root)
    // Orphans (a parent that no longer exists) still need an entry.
    for (const item of items) if (!unfinishedIds.has(item.id)) walk(item)
    return { byId, unfinishedIds }
  }

  function validateParent(itemId, parentId) {
    if (!parentId) return
    const parent = getItem(parentId)
    if (!parent) throw new Error(`parent not found: ${parentId}`)
    let cursor = parentId
    const seen = new Set()
    while (cursor && !seen.has(cursor)) {
      if (cursor === itemId) throw new Error('不能把节点移动到它自己或它的子节点下面')
      seen.add(cursor)
      const row = getItem(cursor)
      cursor = row ? row.parentId : null
    }
  }

  function view(item) {
    const index = buildIndex(allItems())
    const merged = { ...item, derived: derive(item, index) }
    // Tool results must be lossless JSON: drop absent fields instead of
    // handing `undefined` to the harness.
    const out = {}
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined) out[key] = value
    }
    return out
  }

  /**
   * Hard deletes must not leave dangling references behind: plan rows,
   * mistakes, notifications and study-task mirrors all point at item ids.
   */
  function purgeItemReferences(itemId) {
    const id = String(itemId || '')
    if (!id) return
    db.prepare('DELETE FROM notifications WHERE item_id=?').run(id)
    db.prepare('UPDATE mistakes SET item_id=NULL WHERE item_id=?').run(id)
    db.prepare('UPDATE study_plan SET task_id=NULL WHERE task_id=?').run(id)
    db.prepare('UPDATE study_tasks SET item_id=NULL WHERE item_id=?').run(id)
  }

  /** Every study-task method starts with the same lookup and error. */
  function requireStudyTaskRow(id) {
    const row = db.prepare('SELECT * FROM study_tasks WHERE id=?').get(id)
    if (!row) throw new Error(`study task not found: ${id}`)
    return row
  }

  function visibleItems() {
    const items = allItems()
    const index = buildIndex(items)
    return items.filter((item) => !item.deletedAt).map((item) => ({ ...item, derived: derive(item, index) }))
  }

  function snapshot() {
    return { plan: readPlan(), items: visibleItems() }
  }

  function readPlan() {
    const row = db.prepare('SELECT title, body_markdown, updated_at FROM plan WHERE id = ?').get('plan')
    if (!row) {
    return { title: '规划书', updatedAt: '', bodyMarkdown: '' }
    }
    return { title: row.title, updatedAt: row.updated_at || '', bodyMarkdown: row.body_markdown || '' }
  }

  function wouldCycle(itemId, dependencyId) {
    const index = new Map(allItems().map((entry) => [entry.id, entry]))
    const seen = new Set()
    const stack = [dependencyId]
    while (stack.length > 0) {
      const current = stack.pop()
      if (current === itemId) return true
      if (seen.has(current)) continue
      seen.add(current)
      const node = index.get(current)
      for (const next of (node && node.dependsOn) || []) stack.push(next)
    }
    return false
  }

  let writeDepth = 0
  const write = (operation) => {
    // Reentrant transactions: an inner call joins the outer one with a savepoint
    // instead of failing with "cannot start a transaction within a transaction".
    const savepoint = `sp_${writeDepth}`
    if (writeDepth > 0) db.exec(`SAVEPOINT ${savepoint}`)
    else db.exec('BEGIN')
    writeDepth += 1
    try {
      const result = operation()
      writeDepth -= 1
      if (writeDepth > 0) db.exec(`RELEASE ${savepoint}`)
      else db.exec('COMMIT')
      return result
    } catch (error) {
      writeDepth -= 1
      try {
        if (writeDepth > 0) db.exec(`ROLLBACK TO ${savepoint}`)
        else db.exec('ROLLBACK')
      } catch {
        // The transaction may already be gone; the original error matters more.
      }
      throw error
    }
  }

  function readSettings() {
    const rows = db.prepare('SELECT key, value FROM settings').all()
    const stored = {}
    for (const row of rows) {
      try {
        stored[row.key] = JSON.parse(row.value)
      } catch {
        stored[row.key] = row.value
      }
    }
    return { ...DEFAULT_SETTINGS, ...stored }
  }

  // Numeric settings are clamped here, not trusted from the page: a cleared
  // input used to save 0 and wipe everything immediately.
  const SETTING_LIMITS = {
    leadTaskDays: [0, 60],
    leadProjectDays: [0, 120],
    notifyGapMinutes: [1, 720],
    nonUrgentQuotaPerWindow: [0, 50],
    maxRemindersPerWindow: [1, 50],
    maxDeferHours: [0, 720],
    archiveAfterDays: [1, 3650],
    deleteAfterDays: [7, 3650],
    longTermReminderHours: [0, 720],
    studyDailyMinutes: [5, 600],
  }

  function saveSettings(patch) {
    const entries = []
    for (const [key, value] of Object.entries(patch || {})) {
      if (!(key in DEFAULT_SETTINGS)) continue
      const limits = SETTING_LIMITS[key]
      if (limits) {
        const number = Number(value)
        if (!Number.isFinite(number)) continue
        entries.push([key, Math.min(limits[1], Math.max(limits[0], Math.round(number)))])
      } else {
        entries.push([key, value])
      }
    }
    write(() => {
      for (const [key, value] of entries) {
        db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run(key, JSON.stringify(value))
      }
    })
    return readSettings()
  }

  // Delivery state lives in memory: the timer is the only writer, and a restart
  // simply means one fresh window budget and no send-gap carry-over.
  let lastSendAt = 0
  let windowKey = ''
  let windowSent = 0
  let windowTotal = 0

  function matchRange(minutes, ranges) {
    for (let index = 0; index < ranges.length; index += 1) {
      const range = ranges[index]
      if (range.end >= range.start) {
        if (minutes >= range.start && minutes < range.end) return index
      } else if (minutes >= range.start || minutes < range.end) {
        return index
      }
    }
    return -1
  }

  function pushNotification(item, now, kind) {
    write(() => {
      // One undelivered reminder per item is enough; a second identical one
      // while the first is still waiting would only be noise.
      const waiting = db
        .prepare('SELECT 1 AS hit FROM notifications WHERE delivered_at IS NULL AND item_id = ? LIMIT 1')
        .get(item.id)
      if (!waiting) {
        const noteId = newId('note')
        db.prepare(
          'INSERT INTO notifications (id,item_id,title,due_at,kind,priority,created_at,delivered_at) VALUES (?,?,?,?,?,?,?,NULL)',
        ).run(noteId, item.id, item.title, item.dueAt || null, kind, item.priority ?? null, now.toISOString())
        // Surface it from the host so a closed page still gets a toast; the page
        // only keeps the in-app row when this succeeded.
        if (hostNotify(kind === 'long' ? '长期计划提醒' : '近期任务提醒', item.title)) {
          db.prepare('UPDATE notifications SET host_notified=1 WHERE id=?').run(noteId)
        }
      }
      db.prepare('UPDATE items SET last_notified_at=?, defer_started_at=NULL WHERE id=?').run(now.toISOString(), item.id)
    })
  }

  /**
   * One scan drives three jobs: age-based archiving, age-based deletion, and at
   * most one reminder delivery (the caller runs it every minute).
   */
  function scan(now = new Date()) {
    const settings = readSettings()
    const stampOf = (item) => new Date(item.updatedAt || item.createdAt).getTime()
    const archiveCutoff = now.getTime() - Number(settings.archiveAfterDays) * 86400000
    const deleteCutoff = now.getTime() - Number(settings.deleteAfterDays) * 86400000

    // Study entries never remind: an overdue one simply slides to the current
    // study day, and the tutor raises it in conversation instead.
    const todayKey = studyDayKey(now)
    for (const row of db
      .prepare('SELECT id, task_id FROM study_plan WHERE done_at IS NULL AND date < ?')
      .all(todayKey)) {
      write(() => {
        db.prepare('UPDATE study_plan SET date=? WHERE id=?').run(todayKey, row.id)
        if (row.task_id) {
          db.prepare('UPDATE items SET due_at=? WHERE id=?').run(
            new Date(`${todayKey}T20:00:00`).toISOString(),
            row.task_id,
          )
        }
      })
    }
    const planTaskIds = new Set(
      db
        .prepare('SELECT task_id FROM study_plan WHERE task_id IS NOT NULL')
        .all()
        .map((row) => row.task_id),
    )
    // Study-conversation nodes are daily work: refresh their deadline, reopen them
    // for a new day, and never take part in overdue reminders.
    const todayStamp = studyDayKey(now)
    const dueStamp = new Date(`${todayStamp}T20:00:00`).toISOString()
    for (const row of db.prepare('SELECT * FROM study_tasks WHERE item_id IS NOT NULL').all()) {
      const item = db.prepare('SELECT id, due_at, completed_at FROM items WHERE id=?').get(row.item_id)
      if (!item) {
        write(() => db.prepare('UPDATE study_tasks SET item_id=NULL WHERE id=?').run(row.id))
        continue
      }
      planTaskIds.add(item.id)
      const doneToday = row.last_done_day === todayStamp
      const nextCompleted = doneToday ? item.completed_at || now.toISOString() : null
      // Only write when a value really changes: refreshing updated_at every
      // minute turned each study task into a write per minute.
      if (item.due_at !== dueStamp || (item.completed_at || null) !== nextCompleted) {
        write(() =>
          db
            .prepare('UPDATE items SET due_at=?, completed_at=?, updated_at=? WHERE id=?')
            .run(dueStamp, nextCompleted, now.toISOString(), item.id),
        )
      }
    }

    const all = allItems()
    write(() => {
      for (const item of all) {
        if (item.archivedAt) {
          if (stampOf(item) < deleteCutoff) {
            db.prepare('DELETE FROM items WHERE id=?').run(item.id)
            purgeItemReferences(item.id)
          }
        } else if (item.completedAt && stampOf(item) < archiveCutoff) {
          db.prepare('UPDATE items SET archived_at=? WHERE id=?').run(now.toISOString(), item.id)
        }
      }
      // Undelivered reminders are kept: a panel that was closed still matters.
      db.prepare('DELETE FROM notifications WHERE delivered_at IS NOT NULL AND created_at < ?').run(
        new Date(now.getTime() - 30 * 86400000).toISOString(),
      )
      // The undo window is minutes; old trash rows only bloat the file.
      db.prepare('DELETE FROM trash WHERE deleted_at < ?').run(
        new Date(now.getTime() - 86400000).toISOString(),
      )
      db.prepare('DELETE FROM daily_tips WHERE day < ?').run(
        studyDayKey(new Date(now.getTime() - 30 * 86400000)),
      )
    })

    const weekend = now.getDay() === 0 || now.getDay() === 6
    const ranges = parseWindows(weekend ? settings.weekendWindows : settings.weekdayWindows)
    const minutes = now.getHours() * 60 + now.getMinutes()
    const rangeIndex = matchRange(minutes, ranges)
    if (rangeIndex < 0) return

    const key = `${now.toISOString().slice(0, 10)}-${rangeIndex}`
    if (key !== windowKey) {
      windowKey = key
      windowSent = 0
      windowTotal = 0
    }

    const gap = Number(settings.notifyGapMinutes) * 60000
    if (lastSendAt && now.getTime() - lastSendAt < gap) return

    const candidates = []
    const longTermMs = Math.max(1, Number(settings.longTermReminderHours) || 12) * 3600000
    for (const item of allItems()) {
      if (!isTaskLike(item.kind) || item.completedAt || item.archivedAt) continue
      if (planTaskIds.has(item.id)) continue
      const last = item.lastNotifiedAt ? new Date(item.lastNotifiedAt).getTime() : 0
      if (!item.dueAt) {
        // Long-term work has no deadline to count down; it recurs on its own
        // cadence and queues behind anything that is actually due.
        if (last && now.getTime() - last < longTermMs) continue
        candidates.push({ item, due: Number.MAX_SAFE_INTEGER, urgent: false })
        continue
      }
      const due = new Date(item.dueAt).getTime()
      if (Number.isNaN(due)) continue
      const remaining = due - now.getTime()
      const daysLeft = remaining / 86400000
      // A short task's lead is half the span it was given, not half of what is
      // left — using the remainder would push the first reminder to zero.
      const span = Math.max(60000, due - new Date(item.createdAt).getTime())
      const leadMinutes =
        item.remindLeadMinutes != null
          ? Number(item.remindLeadMinutes)
          : daysLeft <= 3
            ? Math.min(120, Math.max(15, Math.floor(span / 120000)))
            : (item.kind === 'project' ? Number(settings.leadProjectDays) : Number(settings.leadTaskDays)) * 1440
      if (remaining > leadMinutes * 60000) continue
      const interval = intervalMinutesLeft(remaining) * 60000
      if (last && now.getTime() - last < interval) continue
      candidates.push({ item, due, urgent: remaining <= 3 * 86400000 })
    }
    candidates.sort((a, b) => a.due - b.due)

    const quota = Number(settings.nonUrgentQuotaPerWindow)
    const cap = Math.max(1, Number(settings.maxRemindersPerWindow) || 6)
    const maxDefer = Number(settings.maxDeferHours) * 3600000
    const overdueDefer = (candidate) =>
      candidate.item.deferStartedAt &&
      now.getTime() - new Date(candidate.item.deferStartedAt).getTime() > maxDefer

    // A per-window ceiling applies to urgent reminders too: with many overdue
    // tasks the gap alone still produces a notification every few minutes.
    const chosen = candidates.find(
      (candidate) => windowTotal < cap && (candidate.urgent || windowSent < quota || overdueDefer(candidate)),
    )

    // Anything skipped for quota remembers when it started waiting, so the 48h
    // ceiling can promote it later.
    for (const candidate of candidates) {
      if (candidate === chosen || candidate.urgent || candidate.item.deferStartedAt) continue
      write(() =>
        db.prepare('UPDATE items SET defer_started_at=? WHERE id=?').run(now.toISOString(), candidate.item.id),
      )
    }

    if (!chosen) return
    if (!chosen.urgent) windowSent += 1
    windowTotal += 1
    pushNotification(chosen.item, now, chosen.item.dueAt ? 'short' : 'long')
    lastSendAt = now.getTime()
  }

  return {
    close() {
      db.close()
    },
    snapshot,
    view,
    readPlan,
    allItems,
    getItem,
    /** A task's type is its top-level ancestor: 学习, 工作, 生活… */
    deriveTaskType(parentId) {
      let current = parentId
      let top = null
      let guard = 0
      while (current && guard < 64) {
        const row = db.prepare('SELECT id, title, parent_id FROM items WHERE id=?').get(current)
        if (!row) break
        top = row
        current = row.parent_id
        guard += 1
      }
      return top && top.title ? String(top.title).slice(0, 24) : undefined
    },

    addItem(input) {
      const kind = 'task'
      const title = String(input.title || '').trim()
      if (!title) throw new Error('title is required')
      const order = db
        .prepare('SELECT COUNT(*) AS n FROM items WHERE COALESCE(parent_id, \'\') = ?')
        .get(input.parentId || '').n
      const item = {
        id: newId(kind),
        kind,
        title,
        parentId: input.parentId || null,
        order,
        note: input.note || '',
        status: defaultStatus(kind),
        priority: isTaskLike(kind) ? clampPriority(input.priority) : undefined,
        dependsOn: [],
        dueAt: input.dueAt || undefined,
        startAt: input.startAt || undefined,
        location: input.location ? String(input.location).slice(0, 60) : undefined,
        recurrence: input.recurrence || undefined,
        tags: normalizeTags(input.tags),
        taskType: input.taskType
          ? String(input.taskType).slice(0, 24)
          : this.deriveTaskType(input.parentId),
        createdAt: nowIso(),
      }
      item.updatedAt = item.createdAt
      write(() =>
        db
          .prepare(`INSERT INTO items (${ITEM_COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .run(
            item.id,
            item.kind,
            item.title,
            item.parentId,
            item.order,
            item.note,
            item.status || null,
            item.priority ?? null,
            '[]',
            item.dueAt || null,
            item.recurrence ? JSON.stringify(item.recurrence) : null,
            null,
            null,
            null,
            null,
            item.createdAt,
            item.createdAt,
            null,
            null,
            JSON.stringify(item.tags),
            item.taskType || null,
            item.startAt || null,
            item.location || null,
          ),
      )
      return item
    },
    updateItem(id, patch) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const next = { ...item }
      for (const key of ['title', 'note', 'dueAt', 'parentId', 'status', 'kind']) {
        if (patch[key] !== undefined) next[key] = patch[key]
      }
      if (patch.priority !== undefined) {
        next.priority = normalizePriority(patch.priority)
      }
      if (patch.tags !== undefined) next.tags = normalizeTags(patch.tags)
      if (patch.startAt !== undefined) next.startAt = patch.startAt || undefined
      if (patch.location !== undefined) {
        next.location = patch.location ? String(patch.location).slice(0, 60) : undefined
      }
      if (patch.recurrence !== undefined) {
        next.recurrence = patch.recurrence && patch.recurrence.freq ? patch.recurrence : undefined
      }
      if (patch.taskType !== undefined) {
        next.taskType = patch.taskType ? String(patch.taskType).slice(0, 24) : undefined
      }
      // The type is derived once at creation and then belongs to the task: a
      // later move or rename keeps it, and an explicit patch may change it.
      if (next.kind !== item.kind) {
        // A status belongs to a kind: a container has none, a task has 'todo'.
        next.status = defaultStatus(next.kind)
      }
      next.kind = 'task'
      if ((next.parentId || null) !== (item.parentId || null)) {
        validateParent(id, next.parentId)
        // Reparenting appends to the new sibling list instead of keeping an
        // order number that may already belong to another child there.
        next.order = db
          .prepare("SELECT COUNT(*) AS n FROM items WHERE COALESCE(parent_id, '') = ?")
          .get(next.parentId || '').n
      }
      const stamp = nowIso()
      write(() =>
        db
          .prepare(
            `UPDATE items SET kind=?, title=?, note=?, status=?, priority=?, due_at=?, recurrence=?, start_at=?, location=?, parent_id=?, ord=?, updated_at=?, tags=?, task_type=? WHERE id=?`,
          )
          .run(
            next.kind,
            next.title,
            next.note || '',
            next.status || null,
            next.priority ?? null,
            next.dueAt || null,
            next.recurrence ? JSON.stringify(next.recurrence) : null,
            next.startAt || null,
            next.location || null,
            next.parentId || null,
            next.order || 0,
            stamp,
            JSON.stringify(normalizeTags(next.tags)),
            next.taskType || null,
            id,
          ),
      )
      return { ...next, updatedAt: stamp }
    },
    /** Tasks referenced by a study conversation are managed there, not in the tree. */
    isPlanTask(id) {
      if (db.prepare('SELECT 1 AS hit FROM study_plan WHERE task_id=?').get(id)) return true
      return Boolean(db.prepare('SELECT 1 AS hit FROM study_tasks WHERE item_id=?').get(id))
    },
    complete(id, done, note, force, allowPlanTask = false) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      if (done && !allowPlanTask && this.isPlanTask(id)) {
        throw new Error('学习任务由学习对话管理，不能手动完成')
      }
      if (done) {
        // Completion is gated on the same structure the tree shows: unfinished
        // descendants and unfinished explicit prerequisites. The caller may
        // force it after showing the user what is still open.
        const index = buildIndex(allItems())
        const below = index.unfinishedIds.get(id) || []
        const deps = (item.dependsOn || []).filter((dep) => {
          const node = index.byId.get(dep)
          return node && !isDone(node) && !below.includes(dep)
        })
        if (!force && (below.length > 0 || deps.length > 0)) {
          const describe = (ids) =>
            ids.map((entryId) => ({ id: entryId, title: (index.byId.get(entryId) || {}).title || '' }))
          return {
            blocked: true,
            item: view(item),
            blockers: { children: describe(below), depends: describe(deps) },
          }
        }
      }
      const completedAt = done ? nowIso() : null
      write(() =>
        db
          .prepare('UPDATE items SET completed_at=?, completion_note=?, updated_at=? WHERE id=?')
          .run(completedAt, done && note !== undefined ? note : null, nowIso(), id),
      )
      // A repeating task keeps its history and spawns the next occurrence.
      if (done && item.recurrence && item.recurrence.freq) {
        const due = nextDue(item.dueAt, item.recurrence)
        if (due) {
          const copy = this.addItem({
            kind: item.kind,
            title: item.title,
            parentId: item.parentId,
            priority: item.priority,
            note: item.note,
            dueAt: due,
            tags: item.tags,
            taskType: item.taskType,
          })
          db.prepare('UPDATE items SET recurrence=?, depends_on=? WHERE id=?').run(
            JSON.stringify(item.recurrence),
            JSON.stringify(item.dependsOn || []),
            copy.id,
          )
        }
      }
      // Return the stored row, not the pre-update snapshot: notes, timestamps
      // and a recurrence's next due date must be visible to the caller.
      const stored = getItem(id)
      return stored ? { ...stored, derived: undefined } : { ...item, completedAt: completedAt || undefined }
    },
    archive(id) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const archivedAt = nowIso()
      write(() => db.prepare('UPDATE items SET archived_at=?, updated_at=? WHERE id=?').run(archivedAt, archivedAt, id))
      return { ...item, archivedAt }
    },
    restore(id) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      // A restored node rejoins its old parent, unless that parent is gone or
      // still archived — then it surfaces at the root instead of vanishing.
      const parent = item.parentId ? getItem(item.parentId) : null
      const nextParent = parent && !parent.archivedAt ? item.parentId : null
      const order = db
        .prepare("SELECT COUNT(*) AS n FROM items WHERE COALESCE(parent_id, '') = ? AND id <> ?")
        .get(nextParent || '', id).n
      const stamp = nowIso()
      write(() =>
        db
          .prepare('UPDATE items SET archived_at=NULL, parent_id=?, ord=?, updated_at=? WHERE id=?')
          .run(nextParent, order, stamp, id),
      )
      return { ...item, archivedAt: undefined, parentId: nextParent, order, updatedAt: stamp }
    },
    depends(id, dependsOn) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const next = []
      for (const dep of dependsOn || []) {
        if (dep === id) throw new Error('依赖不能指向自己')
        if (!getItem(dep)) throw new Error(`前置任务不存在：${dep}`)
        if (wouldCycle(id, dep)) throw new Error(`会形成循环依赖：${id} -> ${dep}`)
        next.push(dep)
      }
      write(() =>
        db.prepare('UPDATE items SET depends_on=?, updated_at=? WHERE id=?').run(JSON.stringify(next), nowIso(), id),
      )
      return { ...item, dependsOn: next }
    },
    move(id, parentId, beforeId) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const nextParent = parentId || null
      if (nextParent === id) throw new Error('不能把节点移动到它自己下面')
      const index = new Map(allItems().map((entry) => [entry.id, entry]))
      let cursor = nextParent
      while (cursor) {
        if (cursor === id) throw new Error('不能移动到自己的子树里')
        const node = index.get(cursor)
        cursor = node ? node.parentId : null
      }
      const siblings = db
        .prepare("SELECT id FROM items WHERE COALESCE(parent_id, '') = ? AND id <> ? ORDER BY ord, created_at")
        .all(nextParent || '', id)
        .map((row) => row.id)
      let at = beforeId ? siblings.indexOf(beforeId) : -1
      if (at < 0) at = siblings.length
      siblings.splice(at, 0, id)
      write(() => {
        db.prepare('UPDATE items SET parent_id=?, ord=? WHERE id=?').run(nextParent, at, id)
        siblings.forEach((siblingId, position) => {
          db.prepare('UPDATE items SET ord=? WHERE id=?').run(position, siblingId)
        })
      })
      return { ...item, parentId: nextParent, order: at }
    },
    deleteItem(id) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const all = allItems()
      const children = all
        .filter((entry) => entry.parentId === id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      const siblings = all
        .filter((entry) => (entry.parentId || null) === (item.parentId || null) && entry.id !== id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((entry) => entry.id)
      const at = Math.min(item.order || 0, siblings.length)
      // Deleting a node promotes its children into its own slot, so a subtree
      // never disappears by accident.
      const sequence = [...siblings.slice(0, at), ...children.map((child) => child.id), ...siblings.slice(at)]
      write(() => {
        for (const child of children) {
          db.prepare('UPDATE items SET parent_id=?, updated_at=? WHERE id=?').run(
            item.parentId || null,
            nowIso(),
            child.id,
          )
        }
        sequence.forEach((siblingId, position) => {
          db.prepare('UPDATE items SET ord=? WHERE id=?').run(position, siblingId)
        })
        for (const entry of all) {
          if (!entry.dependsOn || !entry.dependsOn.includes(id)) continue
          const nextDeps = entry.dependsOn.filter((dep) => dep !== id)
          db.prepare('UPDATE items SET depends_on=?, updated_at=? WHERE id=?').run(
            JSON.stringify(nextDeps),
            nowIso(),
            entry.id,
          )
        }
        db.prepare('DELETE FROM items WHERE id=?').run(id)
        // A study conversation mirrors its node here; deleting the node ends it.
        const linked = db.prepare('SELECT id FROM study_tasks WHERE item_id=?').get(id)
        if (linked) {
          db.prepare('DELETE FROM study_tasks WHERE id=?').run(linked.id)
          db.prepare('DELETE FROM study_task_materials WHERE task_id=?').run(linked.id)
        }
        // Nothing may keep pointing at the row that just disappeared.
        purgeItemReferences(id)
        // Keep the row for a short while so a mistaken delete can be undone.
        db.prepare('INSERT OR REPLACE INTO trash (id,payload,deleted_at) VALUES (?,?,?)').run(
          id,
          JSON.stringify(item),
          nowIso(),
        )
      })
      return { id, promoted: children.length }
    },
    undelete(id) {
      const row = db.prepare('SELECT id,payload,deleted_at FROM trash WHERE id=?').get(id)
      if (!row) throw new Error(`nothing to restore: ${id}`)
      if (Date.now() - new Date(row.deleted_at).getTime() > 5 * 60000) {
        db.prepare('DELETE FROM trash WHERE id=?').run(id)
        throw new Error('撤销窗口已过（5 分钟）')
      }
      const item = JSON.parse(row.payload)
      write(() => {
        db.prepare(
          `INSERT OR REPLACE INTO items (${ITEM_COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ).run(
          item.id,
          item.kind,
          item.title,
          item.parentId || null,
          item.order || 0,
          item.note || '',
          item.status || null,
          item.priority ?? null,
          JSON.stringify(item.dependsOn || []),
          item.dueAt || null,
          item.recurrence ? JSON.stringify(item.recurrence) : null,
          item.completedAt || null,
          item.completionNote || null,
          item.archivedAt || null,
          item.deletedAt || null,
          item.createdAt || nowIso(),
          nowIso(),
          item.lastNotifiedAt || null,
          item.deferStartedAt || null,
          JSON.stringify(item.tags || []),
          item.taskType || null,
          item.startAt || null,
          item.location || null,
        )
        db.prepare('DELETE FROM trash WHERE id=?').run(id)
      })
      return item
    },
    reorder(id, direction) {
      const item = getItem(id)
      if (!item) throw new Error(`item not found: ${id}`)
      const siblings = db
        .prepare("SELECT id FROM items WHERE COALESCE(parent_id, '') = ? ORDER BY ord, created_at")
        .all(item.parentId || '')
        .map((row) => row.id)
      const index = siblings.indexOf(id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= siblings.length) return { ...item, reordered: false }
      const next = siblings.slice()
      next.splice(index, 1)
      next.splice(target, 0, id)
      write(() => next.forEach((siblingId, position) => {
        db.prepare('UPDATE items SET ord=? WHERE id=?').run(position, siblingId)
      }))
      return { ...item, order: target, reordered: true }
    },
    readSettings,
    saveSettings,
    /** Root "学习" node and the per-subject node that study tasks hang under. */
    ensureStudyTree(subjectTitle) {
      // Every node is a task now, so the root is found by parent + title.
      const findRoot = () => db.prepare('SELECT * FROM items WHERE parent_id IS NULL AND title=?').get('学习')
      let root = findRoot()
      if (!root) {
        const created = this.addItem({ title: '学习' })
        root = db.prepare('SELECT * FROM items WHERE id=?').get(created.id)
      }
      let node = db
        .prepare('SELECT * FROM items WHERE parent_id=? AND title=? ORDER BY ord')
        .get(root.id, subjectTitle)
      if (!node) {
        const created = this.addItem({ title: subjectTitle, parentId: root.id })
        node = db.prepare('SELECT * FROM items WHERE id=?').get(created.id)
      }
      return { rootId: root.id, subjectId: node.id }
    },

    /**
     * Fill the days between today and the exam with study entries, then mirror
     * them into the task tree so they show up in the calendar and the work tree.
     */
    generatePlan(subjectId) {
      const settings = readSettings()
      const fallbackDaily = Math.max(15, Number(settings.studyDailyMinutes) || 60)
      // Weekly targets win over the single fallback value.
      const targetFor = (value) => {
        const key = dayKeyOf(value)
        const row = db.prepare('SELECT minutes FROM study_time_targets WHERE day=?').get(key)
        return Math.max(5, Number(row ? row.minutes : fallbackDaily) || fallbackDaily)
      }
      const subject = db.prepare('SELECT * FROM subjects WHERE id=?').get(subjectId)
      if (!subject) throw new Error(`subject not found: ${subjectId}`)
      const topics = db
        .prepare('SELECT * FROM topics WHERE subject_id=? ORDER BY CAST(mastery AS INTEGER)')
        .all(subjectId)
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      // A bare YYYY-MM-DD must be read as a local day, not UTC midnight.
      const exam = subject.exam_date ? new Date(`${String(subject.exam_date).slice(0, 10)}T00:00:00`) : null
      const limit = exam || new Date(start.getTime() + 30 * 86400000)

      const rows = []
      let day = new Date(start)
      let budget = targetFor(day)
      const advance = (minutes) => {
        budget -= minutes
        if (budget < 15) {
          day = new Date(day.getTime() + 86400000)
          budget = targetFor(day)
        }
      }
      let unscheduled = 0
      for (const topic of topics) {
        const mastery = clampMastery(topic.mastery)
        if (mastery >= 10) continue
        const learnMinutes = mastery <= 4 ? 45 : 30
        if (day > limit) {
          unscheduled += 1
          continue
        }
        rows.push({ date: dayKeyOf(day), topic, kind: 'learn', minutes: learnMinutes })
        advance(learnMinutes)
        const reviewDay = new Date(day.getTime() + 2 * 86400000)
        if (reviewDay <= limit) {
          rows.push({ date: dayKeyOf(reviewDay), topic, kind: 'review', minutes: 15 })
        }
      }

      const { subjectId: subjectNodeId } = this.ensureStudyTree(subject.title)
      // Regenerating must replace the previous mirror as well, otherwise the
      // calendar and the tree accumulate duplicate study tasks.
      const stale = db
        .prepare('SELECT id, task_id FROM study_plan WHERE subject_id=? AND done_at IS NULL')
        .all(subjectId)
      write(() => {
        for (const row of stale) {
          if (!row.task_id) continue
          db.prepare('DELETE FROM items WHERE id=?').run(row.task_id)
          purgeItemReferences(row.task_id)
        }
        for (const row of stale) db.prepare('DELETE FROM study_plan WHERE id=?').run(row.id)
      })
      const insert = db.prepare(
        'INSERT INTO study_plan (id,date,subject_id,topic_id,title,kind,minutes,done_at,task_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      )
      const created = []
      for (const row of rows) {
        const title = `${row.topic.title} · ${row.kind === 'learn' ? '学习' : '复习'}`
        const item = this.addItem({
          title,
          parentId: subjectNodeId,
          note: '学习计划',
          dueAt: new Date(`${row.date}T20:00:00`).toISOString(),
        })
        insert.run(newId('plan'), row.date, subjectId, row.topic.id, title, row.kind, row.minutes, null, item.id, nowIso())
        created.push({ date: row.date, title, taskId: item.id })
      }
      return { subject: subject.title, created: created.length, unscheduled }
    },
    shelfList() {
      return db
        .prepare('SELECT * FROM shelf_items ORDER BY created_at')
        .all()
        .map((row) => ({
          id: row.id,
          kind: row.kind,
          path: row.path,
          title: row.title,
          tags: safeJson(row.tags, []),
          note: row.note,
          fetchedAt: row.fetched_at || null,
          listing: safeJson(row.listing, []),
          truncated: Boolean(row.listing_truncated),
          manual: Boolean(row.manual),
        }))
    },

    /** Collect entries under a directory; recursive as designed. */
    scanDirectory(root) {
      try {
        const all = readdirSync(root, { recursive: true })
          .map((entry) => String(entry))
          .filter((entry) => !entry.endsWith('.DS_Store'))
        return { files: all.slice(0, 800), truncated: all.length > 800 }
      } catch {
        return { files: [], truncated: false }
      }
    },

    /**
     * One key per real file. An existing path is resolved first, so symlinks and
     * the on-disk casing collapse (`realpath` on macOS returns the stored case
     * even for a lowercase query, which is what makes APFS case-insensitive
     * dedupe work without lowercasing). Names compare in NFC because a
     * decomposed path and a composed one are the same file.
     */
    shelfKey(kind, path) {
      const raw = String(path || '').trim()
      if (!raw) return ''
      if (/^https?:/i.test(raw)) return `url:${raw.replace(/\/+$/, '')}`
      const separator = process.platform === 'win32'
      let key = raw
      if (existsSync(raw)) {
        try {
          key = realpathSync.native(raw)
        } catch {
          // Unresolvable paths keep the text the user gave.
        }
      }
      // A backslash is a legal filename character on POSIX, so only Windows gets
      // the separator rewrite; doing it everywhere would merge `a\b` into `a/b`.
      key = (separator ? key.replace(/[\\/]+/g, '/') : key).replace(/\/+$/, '')
      key = key.normalize('NFC')
      if (separator) key = key.toLowerCase()
      return `${kind}:${key}`
    },

    shelfAdd(input) {
      const path = String(input.path || '').trim()
      if (!path) throw new Error('path is required')
      const requested = String(input.kind || '').trim()
      let kind
      if (['file', 'dir', 'url'].includes(requested)) {
        kind = requested
      } else if (/^https?:/i.test(path)) {
        kind = 'url'
      } else if (existsSync(path)) {
        kind = statSync(path).isDirectory() ? 'dir' : 'file'
      } else {
        // Missing target: guess from the extension so a file still links correctly.
        kind = /\.[A-Za-z0-9]{1,8}$/.test(path) ? 'file' : 'dir'
      }
      // Reuse an existing entry with the same target instead of adding a twin.
      const key = this.shelfKey(kind, path)
      const twin = db
        .prepare('SELECT * FROM shelf_items')
        .all()
        .find((row) => this.shelfKey(row.kind, row.path) === key)
      if (twin) {
        const tags = normalizeTags([...(twin.tags ? JSON.parse(twin.tags) : []), ...normalizeTags(input.tags)])
        write(() => db.prepare('UPDATE shelf_items SET tags=? WHERE id=?').run(JSON.stringify(tags), twin.id))
        return {
          id: twin.id,
          kind: twin.kind,
          path: twin.path,
          title: twin.title,
          tags,
          note: twin.note,
          deduped: true,
        }
      }
      const scanned = kind === 'dir' ? this.scanDirectory(path) : { files: [], truncated: false }
      const listing = scanned.files
      const item = {
        id: newId('shelf'),
        kind,
        path,
        title: String(input.title || path.split(/[\\/]/).pop() || path).slice(0, 120),
        tags: normalizeTags(input.tags),
        note: String(input.note || ''),
        fetchedAt: kind === 'url' ? null : nowIso(),
        listing,
        truncated: scanned.truncated,
        createdAt: nowIso(),
      }
      write(() =>
        db
          .prepare(
            'INSERT INTO shelf_items (id,kind,path,title,tags,note,fetched_at,listing,listing_truncated,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
          )
          .run(
            item.id,
            item.kind,
            item.path,
            item.title,
            JSON.stringify(item.tags),
            item.note,
            item.fetchedAt,
            JSON.stringify(item.listing),
            item.truncated ? 1 : 0,
            item.createdAt,
          ),
      )
      return item
    },

    shelfRefresh(id) {
      const row = db.prepare('SELECT * FROM shelf_items WHERE id=?').get(id)
      if (!row) throw new Error(`shelf item not found: ${id}`)
      if (row.kind !== 'dir') return { id, listing: [] }
      const scanned = this.scanDirectory(row.path)
      write(() =>
        db
          .prepare('UPDATE shelf_items SET listing=?, listing_truncated=? WHERE id=?')
          .run(JSON.stringify(scanned.files), scanned.truncated ? 1 : 0, id),
      )
      return { id, listing: scanned.files, truncated: scanned.truncated }
    },

    shelfTag(id, tags) {
      const row = db.prepare('SELECT * FROM shelf_items WHERE id=?').get(id)
      if (!row) throw new Error(`shelf item not found: ${id}`)
      // A human-edited entry keeps its own name and tags; automatic tagging
      // must not overwrite them.
      if (row.manual) return { id, tags: safeJson(row.tags, []), skipped: true }
      write(() => db.prepare('UPDATE shelf_items SET tags=?, fetched_at=? WHERE id=?').run(
        JSON.stringify(normalizeTags(tags)),
        nowIso(),
        id,
      ))
      return { id, tags: normalizeTags(tags) }
    },

    /** Manual edit from the shelf panel: locks automatic title/tag updates. */
    shelfUpdate(id, patch) {
      const row = db.prepare('SELECT * FROM shelf_items WHERE id=?').get(id)
      if (!row) throw new Error(`shelf item not found: ${id}`)
      const title = patch.title !== undefined ? String(patch.title || '').slice(0, 120) : row.title
      const path = patch.path !== undefined ? String(patch.path || '').trim() || row.path : row.path
      const tags = patch.tags !== undefined ? normalizeTags(patch.tags) : safeJson(row.tags, [])
      const note = patch.note !== undefined ? String(patch.note || '') : row.note
      const manual = patch.manual !== undefined ? (patch.manual ? 1 : 0) : 1
      write(() =>
        db
          .prepare('UPDATE shelf_items SET title=?, path=?, tags=?, note=?, manual=? WHERE id=?')
          .run(title, path, JSON.stringify(tags), note, manual, id),
      )
      return { id, title, path, tags, note, manual: Boolean(manual) }
    },

    shelfGet(id) {
      const row = db.prepare('SELECT * FROM shelf_items WHERE id=?').get(id)
      if (!row) return undefined
      return {
        id: row.id,
        kind: row.kind,
        path: row.path,
        title: row.title,
        tags: safeJson(row.tags, []),
        note: row.note,
        fetchedAt: row.fetched_at || null,
        listing: safeJson(row.listing, []),
        manual: Boolean(row.manual),
      }
    },

    shelfOpen(id) {
      const item = this.shelfGet(id)
      if (!item) throw new Error(`shelf item not found: ${id}`)
      // A missing target silently does nothing in Explorer, so report it
      // instead of pretending the open succeeded.
      if (item.kind !== 'url' && !existsSync(item.path)) {
        return { id, kind: item.kind, path: item.path, opened: false, reason: 'missing' }
      }
      return { id, kind: item.kind, path: item.path, opened: openShelfTarget(item) }
    },

    shelfDelete(id) {
      write(() => {
        db.prepare('DELETE FROM shelf_items WHERE id=?').run(id)
        db.prepare('DELETE FROM study_materials WHERE shelf_id=?').run(id)
        db.prepare('DELETE FROM study_task_materials WHERE shelf_id=?').run(id)
      })
      return { id, deleted: true }
    },

    linkMaterials(planId, shelfIds) {
      write(() => {
        db.prepare('DELETE FROM study_materials WHERE plan_id=?').run(planId)
        const insert = db.prepare('INSERT OR IGNORE INTO study_materials (plan_id,shelf_id) VALUES (?,?)')
        for (const shelfId of shelfIds || []) insert.run(planId, shelfId)
      })
      return { planId, shelfIds: shelfIds || [] }
    },

    mistakeList() {
      const tasks = new Map(
        db.prepare('SELECT id, title FROM study_tasks').all().map((row) => [row.id, row.title]),
      )
      return db
        .prepare('SELECT * FROM mistakes ORDER BY created_at DESC')
        .all()
        .map((row) => ({
          id: row.id,
          subjectId: row.subject_id || null,
          topicId: row.topic_id || null,
          question: row.question,
          answer: row.answer,
          reason: row.reason,
          source: row.source,
          tags: safeJson(row.tags, []),
          reviewAt: row.review_at || null,
          taskId: row.task_id || null,
          taskTitle: row.task_id ? tasks.get(row.task_id) || row.task_id : null,
          itemId: row.item_id || null,
          createdAt: row.created_at,
        }))
    },

    addMistake(input) {
      const question = String(input.question || '').trim()
      if (!question) throw new Error('question is required')
      const mistake = {
        id: newId('mistake'),
        subjectId: input.subjectId || null,
        topicId: input.topicId || null,
        question,
        answer: String(input.answer || ''),
        reason: String(input.reason || ''),
        source: String(input.source || ''),
        tags: normalizeTags(input.tags),
        reviewAt: input.reviewAt || null,
        taskId: input.taskId || null,
        itemId: input.itemId ? String(input.itemId) : null,
        createdAt: nowIso(),
      }
      write(() =>
        db
          .prepare(
            'INSERT INTO mistakes (id,subject_id,topic_id,question,answer,reason,source,tags,review_at,task_id,item_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          )
          .run(
            mistake.id,
            mistake.subjectId,
            mistake.topicId,
            mistake.question,
            mistake.answer,
            mistake.reason,
            mistake.source,
            JSON.stringify(mistake.tags),
            mistake.reviewAt,
            mistake.taskId,
            mistake.itemId,
            mistake.createdAt,
          ),
      )
      return mistake
    },

    /** Push a mistake's next review forward without touching mastery. */
    reviewMistake(id, days = 2) {
      if (!db.prepare('SELECT 1 AS hit FROM mistakes WHERE id=?').get(id)) {
        throw new Error(`mistake not found: ${id}`)
      }
      const next = new Date(Date.now() + Math.max(1, Number(days) || 2) * 86400000).toISOString()
      write(() => db.prepare('UPDATE mistakes SET review_at=? WHERE id=?').run(next, id))
      return { id, reviewAt: next }
    },

    deleteMistake(id) {
      write(() => db.prepare('DELETE FROM mistakes WHERE id=?').run(id))
      return { id, deleted: true }
    },

    /** Finish a plan entry: close its task and raise mastery for topic entries. */
    completePlan(id) {
      const row = db.prepare('SELECT * FROM study_plan WHERE id=?').get(id)
      if (!row) throw new Error(`plan not found: ${id}`)
      const stamp = nowIso()
      // One transaction: a plan row must never be closed without its task and
      // mastery update landing beside it.
      let mastery = null
      write(() => {
        db.prepare('UPDATE study_plan SET done_at=? WHERE id=?').run(stamp, id)
        if (row.task_id) {
          try {
            this.complete(row.task_id, true, undefined, true, true)
          } catch {
            // The task may have been deleted; the plan entry still closes.
          }
        }
        if (row.topic_id) {
          const topic = db.prepare('SELECT * FROM topics WHERE id=?').get(row.topic_id)
          if (topic) mastery = this.setMastery(row.topic_id, clampMastery(topic.mastery) + 1)
        }
      })
      return { id, doneAt: stamp, mastery }
    },

    planToday() {
      const today = studyDayKey(new Date())
      return db
        .prepare('SELECT * FROM study_plan WHERE date=? ORDER BY created_at')
        .all(today)
        .map((row) => ({
          id: row.id,
          date: row.date,
          subjectId: row.subject_id,
          topicId: row.topic_id || null,
          kind: row.kind,
          minutes: row.minutes,
          doneAt: row.done_at || null,
          taskId: row.task_id || null,
        }))
    },

    /** Index rows only: knowledge itself lives in each conversation workspace. */
    listStudyTasks() {
      const day = studyDayKey(new Date())
      return db
        .prepare('SELECT * FROM study_tasks ORDER BY created_at')
        .all()
        .map((row) => {
          const goal = this.effectiveTarget(row, day)
          const progress = this.dayProgress(row.id, day)
          return {
            id: row.id,
            title: row.title,
            workspacePath: row.workspace_path,
            template: row.template,
            dailyTarget: Number(row.daily_target) || 15,
            dailyNew: row.daily_new === null || row.daily_new === undefined ? 5 : Number(row.daily_new),
            dailyReview: row.daily_review === null || row.daily_review === undefined ? 10 : Number(row.daily_review),
            targetToday: goal.total,
            targetNew: goal.newTarget,
            targetReview: goal.reviewTarget,
            answeredToday: progress.answered,
            answeredNew: progress.answeredNew,
            answeredReview: progress.answeredReview,
            summary: safeJson(row.summary, {}),
            itemId: row.item_id || null,
            sessionId: row.session_id || null,
            lastDoneDay: row.last_done_day || null,
            doneToday: row.last_done_day === day,
            overdueDays: this.studyTaskOverdue(row, day),
            missing: !existsSync(row.workspace_path),
            materials: db
              .prepare(
                'SELECT s.id AS id, s.title AS title, s.path AS path FROM study_task_materials m JOIN shelf_items s ON s.id = m.shelf_id WHERE m.task_id = ?',
              )
              .all(row.id),
            updatedAt: row.updated_at || row.created_at,
          }
        })
    },

    updateStudyTask(id, patch) {
      const row = requireStudyTaskRow(id)
      const title = patch.title !== undefined ? String(patch.title || '').trim() : row.title
      const workspacePath =
        patch.workspacePath !== undefined ? String(patch.workspacePath || '').trim() : row.workspace_path
      const template = patch.template || row.template
      if (!title) throw new Error('title is required')
      if (!workspacePath) throw new Error('workspacePath is required')
      if (!isAbsolute(workspacePath)) throw new Error('workspacePath must be absolute')
      if (!existsSync(workspacePath) || !statSync(workspacePath).isDirectory()) {
        throw new Error(`workspace not found: ${workspacePath}`)
      }
      if (workspacePath.startsWith(DATA_DIR)) throw new Error('workspace cannot be the plugin data directory')
      write(() => {
        db
          .prepare('UPDATE study_tasks SET title=?, workspace_path=?, template=?, updated_at=? WHERE id=?')
          .run(title, workspacePath, template, nowIso(), id)
        // The tree node mirrors the task title, so renaming keeps both in sync.
        if (row.item_id) db.prepare('UPDATE items SET title=? WHERE id=?').run(title, row.item_id)
      })
      if (workspacePath !== row.workspace_path) {
        try {
          this.sealLearningFiles({ ...row, workspace_path: workspacePath })
        } catch {
          // A missing knowledge.db is fine; sealing is best effort.
        }
      }
      return { id, title, workspacePath, template }
    },



    deleteStudyTask(id) {
      const row = requireStudyTaskRow(id)
      write(() => {
        db.prepare('DELETE FROM study_tasks WHERE id=?').run(id)
        db.prepare('DELETE FROM study_task_materials WHERE task_id=?').run(id)
        db.prepare('DELETE FROM study_day_progress WHERE task_id=?').run(id)
        db.prepare('DELETE FROM study_day_targets WHERE task_id=?').run(id)
        db.prepare('UPDATE mistakes SET task_id=NULL WHERE task_id=?').run(id)
        // The tree node is a reference: removing the task removes its mirror.
        if (row.item_id) {
          purgeItemReferences(row.item_id)
          db.prepare('DELETE FROM items WHERE id=?').run(row.item_id)
        }
      })
      return { id, deleted: true }
    },

    /**
     * Copy a shelf file (or directory) into a study task's workspace so the
     * conversation's sandboxed tools can actually read it.
     */
    /** Templates ship with the plugin, so return their text instead of a path. */
    readTemplate(name) {
      const key = normalizeTemplate(name)
      const file = key ? TEMPLATE_FILES[key] : ''
      if (!file) throw new Error(`unknown template: ${name}`)
      const base = dirname(fileURLToPath(import.meta.url))
      return { name: key, content: readFileSync(join(base, 'templates', file), 'utf8') }
    },

    /**
     * Extract text from a PDF in the workspace with the system `pdftotext`
     * (poppler). Runs without a PTY, so it works where the shell tool cannot.
     */
    /**
     * Extract text from a PDF in the workspace. `pdftotext` (poppler) wins when
     * installed; macOS otherwise uses PDFKit through `osascript`, so a stock
     * machine can read a PDF without any dependency.
     */
    extractPdfText(taskId, relative, maxChars = 400000, outFile) {
      const task = requireStudyTaskRow(taskId)
      const target = this.taskPath(task, relative)
      if (!existsSync(target)) throw new Error(`file not found: ${target}`)
      const { text, engine } = readPdfText(target)
      // Writing to a file keeps a 500-page book out of the conversation context.
      if (outFile) {
        const dest = this.taskPath(task, outFile)
        mkdirSync(dirname(dest), { recursive: true })
        writeFileSync(dest, text, 'utf8')
        return { source: target, outFile: dest, chars: text.length, engine }
      }
      const cut = Math.max(2000, Number(maxChars) || 400000)
      return {
        path: target,
        chars: text.length,
        truncated: text.length > cut,
        content: text.slice(0, cut),
        engine,
      }
    },

    /** Only the knowledge database is sealed; index.md stays a normal document. */
    learningFileTargets(task) {
      const paths = []
      for (const relative of [join('learning', 'knowledge.db')]) {
        try {
          paths.push(this.taskPath(task, relative))
        } catch {
          // Skip a path that does not resolve; sealing is best effort.
        }
      }
      return paths
    },

    /** Make the knowledge database read-only so generic tools cannot rewrite it. */
    sealLearningFiles(task) {
      for (const path of this.learningFileTargets(task)) {
        if (!existsSync(path)) continue
        try {
          chmodSync(path, 0o444)
        } catch {
          // Some filesystems ignore the bit; the program path still works.
        }
      }
      // index.md is documentation: keep it editable by write/edit.
      try {
        const doc = this.taskPath(task, join('learning', 'index.md'))
        if (existsSync(doc)) chmodSync(doc, 0o666)
      } catch {
        // A missing document is fine.
      }
    },

    unsealLearningFiles(task) {
      for (const path of this.learningFileTargets(task)) {
        if (!existsSync(path)) continue
        try {
          chmodSync(path, 0o666)
        } catch {
          // Ignore: the runner reports its own errors.
        }
      }
    },

    /** Open the workspace knowledge database, creating nothing. */
    openKnowledge(task, readOnly) {
      const target = this.taskPath(task, join('learning', 'knowledge.db'))
      if (!existsSync(target)) throw new Error('knowledge.db 还没有创建，先按模板建库')
      return readOnly ? new DatabaseSync(target, { readOnly: true }) : new DatabaseSync(target)
    },

    /**
     * Pick today's questions: new items come from entries never studied yet
     * (`learned = 0`), reviews come from the weakest studied entries. A score of
     * 0 only blocks gaining points for three days — it never blocks asking.
     *
     * `mix` may override the split: `{ newCount, reviewCount }`.
     */
    nextStudyQuestions(taskId, count = 5, mix) {
      const task = requireStudyTaskRow(taskId)
      const take = Math.max(1, Math.min(20, Number(count) || 5))
      const day = studyDayKey(new Date())
      const goal = this.effectiveTarget(task, day)
      const progress = this.dayProgress(taskId, day)
      const askedNew = Math.max(0, goal.newTarget - progress.answeredNew)
      const askedReview = Math.max(0, goal.reviewTarget - progress.answeredReview)
      const wantNew = Number.isFinite(Number(mix && mix.newCount))
        ? Math.max(0, Math.min(20, Number(mix.newCount)))
        : Math.min(take, askedNew)
      const wantReview = Number.isFinite(Number(mix && mix.reviewCount))
        ? Math.max(0, Math.min(20, Number(mix.reviewCount)))
        : Math.max(0, Math.min(take - wantNew, askedReview))
      const conn = this.openKnowledge(task, true)
      try {
        const tables = conn.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name)
        // Question-bank bases ask questions; cards/points remain the item pools.
        const table = tables.includes('questions')
          ? 'questions'
          : tables.includes('cards')
            ? 'cards'
            : tables.includes('points')
              ? 'points'
              : null
        if (!table) throw new Error('knowledge.db needs a questions, cards or points table before questions can be asked')
        const columns = conn.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name)
        const hasLearned = columns.includes('learned')
        const label = table === 'cards' ? 'front' : table === 'questions' ? 'prompt' : 'title'
        const detail = table === 'cards' ? 'back' : table === 'questions' ? 'answer' : 'detail'
        const extra = table === 'cards' ? 'extra' : table === 'questions' ? 'explanation' : 'NULL'
        const optionColumn = table === 'questions' ? 'options' : 'NULL'
        const baseColumns = `id, ${label} AS prompt, ${detail} AS answer, ${extra} AS extra, ${optionColumn} AS optionsRaw, proficiency`
        const fetch = (where, order, limit) => {
          if (limit <= 0) return []
          return conn
            .prepare(`SELECT ${baseColumns} FROM ${table} WHERE ${where} ORDER BY ${order} LIMIT ?`)
            .all(limit)
        }
        const newRows = hasLearned
          ? fetch('proficiency < 10 AND learned = 0', 'RANDOM()', wantNew)
          : []
        // Questions are ordered by the weakest knowledge point they cover.
        const reviewOrder =
          table === 'questions'
            ? "COALESCE((SELECT MIN(p.proficiency) FROM question_points qp JOIN points p ON p.id = qp.point_id WHERE qp.question_id = questions.id), proficiency) ASC, RANDOM()"
            : 'proficiency ASC, RANDOM()'
        const reviewRows = hasLearned
          ? fetch('proficiency < 10 AND learned = 1', reviewOrder, wantReview)
          : // Legacy knowledge base: one pool, weakest first.
            fetch('proficiency < 10', reviewOrder, Math.min(take, Math.max(wantReview, take)))
        // Fill a shortfall from the other pool so a round is never short.
        const room = Math.max(0, take - newRows.length - reviewRows.length)
        if (room > 0) {
          const extraRows = hasLearned ? fetch('proficiency < 10 AND learned = 1', reviewOrder, room) : []
          reviewRows.push(...extraRows)
        }
        const roomNew = Math.max(0, take - newRows.length - reviewRows.length)
        if (roomNew > 0 && hasLearned) {
          newRows.push(...fetch('proficiency < 10 AND learned = 0', 'RANDOM()', roomNew))
        }
        const rows = [...newRows, ...reviewRows].slice(0, take)
        const newIds = new Set(newRows.map((row) => row.id))
        const count = (where) => conn.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`).get().n
        const poolNew = hasLearned ? count('proficiency < 10 AND learned = 0') : 0
        const poolReview = count(`proficiency < 10${hasLearned ? ' AND learned = 1' : ''}`)
        // Nothing left to ask: close the day instead of returning an empty round.
        if (rows.length === 0 && poolNew === 0 && poolReview === 0) {
          let finished = false
          try {
            this.finishStudyDay(taskId)
            finished = true
          } catch {
            // A missing mirror must not break the question call.
          }
          return { kind: bankKind(table), questions: [], poolNew, poolReview, finishedToday: finished }
        }
        const pickOptions = conn.prepare(
          `SELECT ${detail} AS answer FROM ${table} WHERE id<>? AND ${detail}<>? ORDER BY RANDOM() LIMIT 3`,
        )
        return {
          kind: bankKind(table),
          poolNew,
          poolReview,
          questions: rows.map((row) => ({
            itemId: row.id,
            prompt: row.prompt,
            answer: row.answer || '',
            extra: row.extra || '',
            isNew: newIds.has(row.id),
            options:
              table === 'cards'
                ? [row.answer, ...pickOptions.all(row.id, row.answer).map((entry) => entry.answer)]
                : table === 'questions'
                  ? (Array.isArray(safeJson(row.optionsRaw, [])) ? safeJson(row.optionsRaw, []) : [])
                  : [],
          })),
        }
      } finally {
        conn.close()
      }
    },

    /**
     * Record one graded answer. A correct answer adds one point unless the item
     * is in its three-day zero-lock (it reached 0 recently); a wrong answer
     * removes one and starts that lock. Items at 10 are mastered and stop
     * appearing. The score itself is never returned, so a reply cannot leak it.
     */
    recordStudyAnswer(taskId, itemId, correct) {
      const task = requireStudyTaskRow(taskId)
      this.unsealLearningFiles(task)
      const conn = this.openKnowledge(task, false)
      try {
        const tables = conn.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name)
        const table = tables.includes('questions')
          ? 'questions'
          : tables.includes('cards')
            ? 'cards'
            : tables.includes('points')
              ? 'points'
              : null
        if (!table) throw new Error('知识库里没有 questions、cards 或 points 表')
        const columns = conn.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name)
        const hasLearned = columns.includes('learned')
        const label = table === 'cards' ? 'front' : table === 'questions' ? 'prompt' : 'title'
        const row = conn
          .prepare(
            `SELECT id, ${label} AS label, proficiency, updated_at${hasLearned ? ', learned' : ''} FROM ${table} WHERE id=?`,
          )
          .get(itemId)
        if (!row) throw new Error(`item not found: ${itemId}`)
        const previous = clampMastery(row.proficiency)
        const isNew = hasLearned ? Number(row.learned) === 0 : false
        // The zero-lock lasts three days from the last time the item was answered.
        const lockedUntil = row.updated_at ? new Date(new Date(row.updated_at).getTime() + 3 * 86400000) : null
        const locked = previous === 0 && lockedUntil && lockedUntil.getTime() > Date.now()
        let next = previous
        if (correct) next = locked ? 0 : Math.min(10, previous + 1)
        else next = Math.max(0, previous - 1)
        if (next === previous && correct && locked) {
          // A locked correct answer must not refresh the lock: leave updated_at.
          if (hasLearned) conn.prepare(`UPDATE ${table} SET learned=1 WHERE id=?`).run(itemId)
        } else {
          const stamp = nowIso()
          if (hasLearned) {
            conn.prepare(`UPDATE ${table} SET proficiency=?, updated_at=?, learned=1 WHERE id=?`).run(next, stamp, itemId)
          } else {
            conn.prepare(`UPDATE ${table} SET proficiency=?, updated_at=? WHERE id=?`).run(next, stamp, itemId)
          }
        }
        // A question additionally moves the knowledge points it covers, so the
        // outline reflects what the answers showed.
        if (table === 'questions') {
          const links = conn.prepare('SELECT point_id FROM question_points WHERE question_id=?').all(itemId)
          if (links.length > 0 && tables.includes('points')) {
            const pointColumns = conn.prepare('PRAGMA table_info(points)').all().map((entry) => entry.name)
            const pointLearned = pointColumns.includes('learned')
            const readPoint = conn.prepare('SELECT proficiency FROM points WHERE id=?')
            const stamp = nowIso()
            for (const link of links) {
              const point = readPoint.get(link.point_id)
              if (!point) continue
              const previousPoint = clampMastery(point.proficiency)
              const nextPoint = correct ? Math.min(10, previousPoint + 1) : Math.max(0, previousPoint - 1)
              if (pointLearned) conn.prepare('UPDATE points SET proficiency=?, learned=1, updated_at=? WHERE id=?').run(nextPoint, stamp, link.point_id)
              else conn.prepare('UPDATE points SET proficiency=?, updated_at=? WHERE id=?').run(nextPoint, stamp, link.point_id)
            }
          }
        }
        // A mastered item no longer needs its mistake record.
        if (next >= 10) {
          write(() => {
            db.prepare('DELETE FROM mistakes WHERE item_id=? AND (task_id=? OR task_id IS NULL)').run(itemId, taskId)
          })
        }
        // Count the answer; reaching both targets completes the day automatically.
        const day = studyDayKey(new Date())
        write(() =>
          db
            .prepare(
              `INSERT INTO study_day_progress (task_id,day,answered,correct,answered_new,answered_review)
               VALUES (?,?,1,?,?,?)
               ON CONFLICT(task_id,day) DO UPDATE SET
                 answered=answered+1,
                 correct=correct+?,
                 answered_new=answered_new+?,
                 answered_review=answered_review+?`,
            )
            .run(taskId, day, correct ? 1 : 0, isNew ? 1 : 0, isNew ? 0 : 1, correct ? 1 : 0, isNew ? 1 : 0, isNew ? 0 : 1),
        )
        const progress = this.dayProgress(taskId, day)
        const goal = this.effectiveTarget(task, day)
        // A pool with nothing left counts as satisfied, so a finished deck can
        // still complete the day instead of deadlocking at the target.
        const newPool = hasLearned
          ? conn.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE proficiency < 10 AND learned = 0`).get().n
          : 0
        const reviewPool = conn
          .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE proficiency < 10${hasLearned ? ' AND learned = 1' : ''}`)
          .get().n
        const newDone = progress.answeredNew >= goal.newTarget || newPool === 0
        const reviewDone = progress.answeredReview >= goal.reviewTarget || reviewPool === 0
        let finished = false
        if (newDone && reviewDone) {
          try {
            this.finishStudyDay(taskId)
            finished = true
          } catch {
            // A missing mirror should not fail the answer itself.
          }
        }
        return {
          itemId,
          label: row.label,
          correct: Boolean(correct),
          isNew,
          locked,
          mastered: next >= 10,
          answeredToday: progress.answered,
          targetToday: goal.total,
          answeredNew: progress.answeredNew,
          targetNew: goal.newTarget,
          answeredReview: progress.answeredReview,
          targetReview: goal.reviewTarget,
          finishedToday: finished || task.last_done_day === day,
        }
      } finally {
        conn.close()
        this.sealLearningFiles(task)
      }
    },

    /** Mark today's study interaction as done, which completes the mirrored task. */
    finishStudyDay(taskId) {
      const row = requireStudyTaskRow(taskId)
      const day = studyDayKey(new Date())
      if (row.item_id) {
        try {
          this.complete(row.item_id, true, undefined, true, true)
        } catch {
          // The mirrored node may be gone; the day is still recorded.
        }
      }
      write(() => db.prepare('UPDATE study_tasks SET last_done_day=?, updated_at=? WHERE id=?').run(day, nowIso(), taskId))
      return { taskId, day, doneToday: true }
    },

    /** Days without a completed interaction, for the conversation to raise. */
    studyTaskOverdue(row, day) {
      const anchor = row.last_done_day || (row.created_at ? dayKeyOf(new Date(row.created_at)) : '')
      if (!anchor) return 0
      const from = new Date(`${anchor}T00:00:00`).getTime()
      const to = new Date(`${day}T00:00:00`).getTime()
      const days = Math.round((to - from) / 86400000)
      return days > 1 ? days - 1 : 0
    },

    /** Today's goal for a task: the day override wins over the stored default. */
    effectiveTarget(row, day = studyDayKey(new Date())) {
      const override = db.prepare('SELECT * FROM study_day_targets WHERE task_id=? AND day=?').get(row.id, day)
      if (override) {
        const newTarget =
          override.target_new === null || override.target_new === undefined
            ? row.daily_new === null || row.daily_new === undefined
              ? 5
              : Number(row.daily_new)
            : Number(override.target_new)
        const reviewTarget =
          override.target_review === null || override.target_review === undefined
            ? row.daily_review === null || row.daily_review === undefined
              ? 10
              : Number(row.daily_review)
            : Number(override.target_review)
        return {
          newTarget,
          reviewTarget,
          total: newTarget + reviewTarget,
          source: 'day',
          note: override.note || '',
        }
      }
      const newTarget = row.daily_new === null || row.daily_new === undefined ? 5 : Number(row.daily_new)
      const reviewTarget = row.daily_review === null || row.daily_review === undefined ? 10 : Number(row.daily_review)
      return { newTarget, reviewTarget, total: newTarget + reviewTarget, source: 'task', note: '' }
    },

    /** Answered/correct counters for one day, split into new and review. */
    dayProgress(taskId, day = studyDayKey(new Date())) {
      const row = db.prepare('SELECT * FROM study_day_progress WHERE task_id=? AND day=?').get(taskId, day)
      return row
        ? {
            answered: row.answered,
            correct: row.correct,
            answeredNew: row.answered_new || 0,
            answeredReview: row.answered_review || 0,
          }
        : { answered: 0, correct: 0, answeredNew: 0, answeredReview: 0 }
    },

    /**
     * Per-day history of the two daily goals, so the weekly review can judge
     * "three good days in a row" from recorded data instead of guessing.
     */
    studyProgress(taskId, days = 14) {
      const task = requireStudyTaskRow(taskId)
      const span = Math.max(1, Math.min(90, Math.round(Number(days) || 14)))
      const today = studyDayKey(new Date())
      const from = studyDayKey(new Date(Date.now() - (span - 1) * 86400000))
      const rows = db
        .prepare('SELECT * FROM study_day_progress WHERE task_id=? AND day>=? ORDER BY day')
        .all(taskId, dayKeyOf(new Date(`${from}T00:00:00`)))
      const byDay = new Map(rows.map((row) => [row.day, row]))
      const history = []
      for (let index = span - 1; index >= 0; index -= 1) {
        const day = dayKeyOf(new Date(new Date(`${today}T00:00:00`).getTime() - index * 86400000))
        const goal = this.effectiveTarget(task, day)
        const progress = byDay.get(day)
        const answeredNew = progress ? progress.answered_new || 0 : 0
        const answeredReview = progress ? progress.answered_review || 0 : 0
        const newMet = answeredNew >= goal.newTarget
        const reviewMet = answeredReview >= goal.reviewTarget
        history.push({
          day,
          targetNew: goal.newTarget,
          targetReview: goal.reviewTarget,
          answeredNew,
          answeredReview,
          newMet,
          reviewMet,
          done:
            task.last_done_day === day ||
            (newMet && reviewMet && (goal.newTarget > 0 || goal.reviewTarget > 0 || answeredNew + answeredReview > 0)),
        })
      }
      const doneDays = history.filter((entry) => entry.done).length
      // Today may simply not have started yet: count back from yesterday then.
      let cursorIndex = history.length - 1
      if (cursorIndex >= 0 && !history[cursorIndex].done) cursorIndex -= 1
      let streak = 0
      for (let index = cursorIndex; index >= 0; index -= 1) {
        if (!history[index].done) break
        streak += 1
      }
      return {
        taskId,
        days: history.length,
        doneDays,
        streak,
        completionRate: history.length ? Math.round((doneDays / history.length) * 100) : 0,
        history,
      }
    },

    setStudyTarget(taskId, dailyNew, dailyReview) {
      const row = requireStudyTaskRow(taskId)
      let nextNew = Number(dailyNew)
      let nextReview = Number(dailyReview)
      if (!Number.isFinite(nextReview)) {
        if (Number.isFinite(nextNew)) {
          // Only the new half was given: keep review as it is.
          nextReview =
            row.daily_review === null || row.daily_review === undefined ? 10 : Number(row.daily_review)
        } else {
          const total = 15
          nextNew = Math.max(1, Math.round(total / 3))
          nextReview = Math.max(1, total - nextNew)
        }
      }
      nextNew = Math.max(0, Math.min(200, Math.round(nextNew || 0)))
      nextReview = Math.max(0, Math.min(200, Math.round(nextReview || 0)))
      if (nextNew + nextReview <= 0) throw new Error('daily targets must be positive')
      write(() =>
        db
          .prepare(
            'UPDATE study_tasks SET daily_new=?, daily_review=?, daily_target=?, updated_at=? WHERE id=?',
          )
          .run(nextNew, nextReview, nextNew + nextReview, nowIso(), taskId),
      )
      return { taskId, dailyNew: nextNew, dailyReview: nextReview, dailyTarget: nextNew + nextReview }
    },

    /** Adjust only today's goal, e.g. after reading the habit history. */
    setStudyDayTarget(taskId, target, note = '') {
      const row = requireStudyTaskRow(taskId)
      const day = studyDayKey(new Date())
      const input = target && typeof target === 'object' ? target : { total: target }
      let newTarget = Number(input.newTarget)
      let reviewTarget = Number(input.reviewTarget)
      const defaultNew = row.daily_new === null || row.daily_new === undefined ? 5 : Number(row.daily_new)
      const defaultReview = row.daily_review === null || row.daily_review === undefined ? 10 : Number(row.daily_review)
      const total = Number(input.total)
      if (!Number.isFinite(newTarget)) newTarget = Number.isFinite(total) ? Math.min(defaultNew, total) : defaultNew
      if (!Number.isFinite(reviewTarget)) {
        reviewTarget = Number.isFinite(total) ? Math.max(0, total - newTarget) : defaultReview
      }
      newTarget = Math.max(0, Math.min(200, Math.round(newTarget)))
      reviewTarget = Math.max(0, Math.min(200, Math.round(reviewTarget)))
      write(() =>
        db
          .prepare(
            'INSERT OR REPLACE INTO study_day_targets (task_id,day,target,target_new,target_review,note) VALUES (?,?,?,?,?,?)',
          )
          .run(taskId, day, newTarget + reviewTarget, newTarget, reviewTarget, String(note || '')),
      )
      return { taskId, day, target: newTarget + reviewTarget, newTarget, reviewTarget, note: String(note || '') }
    },

    /** Monday of the week containing a study day. */
    weekStartOf(day) {
      const date = new Date(`${day}T00:00:00`)
      const offset = (date.getDay() + 6) % 7
      date.setDate(date.getDate() - offset)
      return dayKeyOf(date)
    },

    /**
     * The week's planned study minutes per day, next to what actually happened.
     * The habit page edits it and the agent plans it through the tools.
     */
    studyTimeWeek(fromDay) {
      const anchor = studyDayKey(new Date())
      const start = this.weekStartOf(fromDay || anchor)
      const base = new Date(`${start}T00:00:00`)
      const days = []
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(base.getTime() + index * 86400000)
        const day = dayKeyOf(date)
        const target = db.prepare('SELECT * FROM study_time_targets WHERE day=?').get(day)
        const habit = db.prepare('SELECT minutes FROM study_habits WHERE day=?').get(day)
        days.push({
          day,
          planned: target ? Number(target.minutes) : null,
          note: target ? target.note : '',
          actual: habit ? Number(habit.minutes) : 0,
        })
      }
      return { weekStart: start, days }
    },

    setStudyTimeWeek(entries) {
      const rows = Array.isArray(entries) ? entries : []
      write(() => {
        for (const row of rows) {
          if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(String(row.day || ''))) continue
          if (row.minutes === null || row.minutes === undefined || row.minutes === '') {
            db.prepare('DELETE FROM study_time_targets WHERE day=?').run(row.day)
            continue
          }
          const minutes = Math.max(0, Math.min(720, Math.round(Number(row.minutes)) || 0))
          db.prepare('INSERT OR REPLACE INTO study_time_targets (day,minutes,note) VALUES (?,?,?)').run(
            row.day,
            minutes,
            String(row.note || ''),
          )
        }
      })
      return this.studyTimeWeek(rows[0] && rows[0].day ? rows[0].day : undefined)
    },

    /** Re-apply file permissions for every registered task (called on startup). */
    normalizeLearningPermissions() {
      for (const row of db.prepare('SELECT * FROM study_tasks').all()) {
        try {
          this.sealLearningFiles(row)
        } catch {
          // A task whose workspace vanished is handled by pruning.
        }
      }
      return { checked: db.prepare('SELECT COUNT(*) AS n FROM study_tasks').get().n }
    },

    /**
     * Run a Node program inside the study task workspace. Bulk data work goes
     * through here so thousands of rows never travel through the conversation.
     */
    runStudyProgram(taskId, code, timeoutMs = 120000) {
      const task = requireStudyTaskRow(taskId)
      const root = task.workspace_path
      if (!root || !existsSync(root)) throw new Error(`workspace not found: ${root}`)
      const scriptDir = this.taskPath(task, join('learning', '.run'))
      mkdirSync(scriptDir, { recursive: true })
      const scriptPath = join(scriptDir, `program-${Date.now()}.mjs`)
      writeFileSync(scriptPath, String(code), 'utf8')
      // Knowledge files are sealed outside this window, so only a program can
      // change them; generic write tools and shells hit a read-only file.
      this.unsealLearningFiles(task)
      const started = Date.now()
      let result
      try {
        result = spawnSync(process.execPath, [scriptPath], {
          cwd: root,
          encoding: 'utf8',
          timeout: Math.max(5000, Number(timeoutMs) || 120000),
          maxBuffer: 32 * 1024 * 1024,
          windowsHide: true,
          env: { ...process.env, LP_WORKSPACE: root, LP_TASK_ID: task.id },
        })
      } finally {
        this.sealLearningFiles(task)
        // The program is a one-shot script: leaving it behind litters the
        // workspace and leaks SQL into .run/.
        try {
          rmSync(scriptPath, { force: true })
        } catch {
          // Cleanup must never fail the run itself.
        }
      }
      const cap = 8000
      const stdout = String(result.stdout || '')
      const stderr = String(result.stderr || '')
      return {
        error: result.error ? String(result.error.message || result.error) : '',
        script: scriptPath,
        exitCode: result.status,
        durationMs: Date.now() - started,
        stdout: stdout.slice(0, cap),
        stderr: stderr.slice(0, cap),
        outputTruncated: stdout.length > cap || stderr.length > cap,
      }
    },

    /** Resolve a path inside a study task workspace and refuse to escape it. */
    taskPath(task, relative) {
      const root = task.workspace_path
      if (!root) throw new Error('the study task has no workspace path yet')
      const target = resolve(root, relative)
      const rel = relativePath(root, target)
      if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('path escapes the workspace')
      return target
    },

    /** Read a text file inside the workspace, capped so a huge book cannot flood a turn. */
    readStudyFile(taskId, relative, limit = 200000) {
      const task = requireStudyTaskRow(taskId)
      const target = this.taskPath(task, relative)
      if (!existsSync(target)) throw new Error(`file not found: ${target}`)
      const buffer = readFileSync(target)
      const text = buffer.toString('utf8')
      const cut = Math.min(text.length, Math.max(1000, Number(limit) || 200000))
      return { path: target, bytes: buffer.length, truncated: text.length > cut, content: text.slice(0, cut) }
    },

    importShelfToTask(shelfId, taskId) {
      const shelf = db.prepare('SELECT * FROM shelf_items WHERE id=?').get(shelfId)
      if (!shelf) throw new Error(`shelf item not found: ${shelfId}`)
      if (shelf.kind === 'url') throw new Error('a web page cannot be copied; shelve a local file instead')
      const task = requireStudyTaskRow(taskId)
      if (!task.workspace_path) throw new Error('the study task has no workspace path yet')
      if (!existsSync(shelf.path)) throw new Error(`file not found: ${shelf.path}`)
      const source = resolve(shelf.path)
      const root = resolve(task.workspace_path)
      const inside = relativePath(root, source)
      // Already inside the workspace: workspace-scoped tools can read it as is,
      // so copying would only duplicate the files.
      if (inside && !inside.startsWith('..') && !isAbsolute(inside)) {
        return { shelfId, taskId, target: source, relative: inside, copied: false }
      }
      const targetDir = join(root, 'learning', 'materials')
      const name = basename(source)
      const target = join(targetDir, name)
      // Copying a folder into itself would recurse forever.
      const targetInsideSource = relativePath(source, target)
      if (!targetInsideSource.startsWith('..') && !isAbsolute(targetInsideSource)) {
        throw new Error('cannot copy a folder into one of its own subfolders; mount the workspace root instead')
      }
      mkdirSync(targetDir, { recursive: true })
      if (shelf.kind === 'dir') {
        cpSync(source, target, { recursive: true, force: true })
      } else {
        cpSync(source, target, { force: true })
      }
      return { shelfId, taskId, target, relative: join('learning', 'materials', name), copied: true }
    },

    /**
     * Drop entries whose conversation no longer exists. `isAlive` must return
     * true when it cannot tell, so an unavailable session store never deletes.
     */
    setStudyTaskMaterials(id, shelfIds) {
      if (!db.prepare('SELECT 1 AS hit FROM study_tasks WHERE id=?').get(id)) {
        throw new Error(`study task not found: ${id}`)
      }
      write(() => {
        db.prepare('DELETE FROM study_task_materials WHERE task_id=?').run(id)
        const insert = db.prepare('INSERT OR IGNORE INTO study_task_materials (task_id, shelf_id) VALUES (?,?)')
        for (const shelfId of shelfIds || []) insert.run(id, shelfId)
      })
      return { id, shelfIds: shelfIds || [] }
    },

    /** Find (or create) the 学习 root area so study tasks land in the tree. */
    ensureLearningArea() {
      const row = db
        .prepare("SELECT id FROM items WHERE parent_id IS NULL AND title='学习' ORDER BY ord LIMIT 1")
        .get()
      if (row) return row.id
      const created = this.addItem({ kind: 'area', title: '学习' })
      return created.id
    },

    /** Mirror a study task into the 学习 area so the planning tree shows it. */
    attachStudyItemNode(taskId, title) {
      try {
        const areaId = this.ensureLearningArea()
        const node = this.addItem({
          kind: 'task',
          title,
          parentId: areaId,
          note: '学习模式对话任务',
          // Grouping by type or by tag should land on 学习, not 未分类.
          taskType: '学习',
          tags: ['学习'],
        })
        write(() => db.prepare('UPDATE study_tasks SET item_id=? WHERE id=?').run(node.id, taskId))
        return node.id
      } catch {
        return null
      }
    },

    registerStudyTask(input) {
      const title = String(input.title || '').trim()
      const workspacePath = String(input.workspacePath || '').trim()
      const sessionId = input.sessionId ? String(input.sessionId) : ''
      if (!title) throw new Error('title is required')
      if (!workspacePath) throw new Error('workspacePath is required')
      if (!isAbsolute(workspacePath)) throw new Error('workspacePath must be absolute')
      if (!existsSync(workspacePath)) throw new Error(`workspace not found: ${workspacePath}`)
      if (!statSync(workspacePath).isDirectory()) throw new Error('workspacePath must be a directory')
      // The plugin's own data directory is never a learning workspace.
      const dataRoot = resolve(DATA_DIR)
      const target = resolve(workspacePath)
      if (target === dataRoot || target.startsWith(`${dataRoot}${sep}`)) {
        throw new Error('workspacePath must not be inside the plugin data directory')
      }
      // A session owns exactly one task; the workspace path is only the fallback
      // key for older rows that never recorded a session.
      const existing =
        (sessionId && db.prepare('SELECT * FROM study_tasks WHERE session_id=?').get(sessionId)) ||
        db.prepare('SELECT * FROM study_tasks WHERE workspace_path=?').get(workspacePath)
      const stamp = nowIso()
      const template = normalizeTemplate(input.template) || (existing ? existing.template : 'list')
      const pick = (value, fallback) => (value === null || value === undefined || value === '' ? fallback : Number(value))
      const desiredTotal = Math.max(1, Math.min(200, Math.round(pick(input.dailyTarget, existing ? existing.daily_target : 15))))
      // Separate planning: new knowledge and review get their own numbers.
      const hasSplitInput = input.dailyNew !== undefined || input.dailyReview !== undefined
      const splitNew = Math.round(desiredTotal / 3)
      const dailyNew = Math.max(
        0,
        Math.min(200, Math.round(pick(input.dailyNew, hasSplitInput ? 0 : pick(existing && existing.daily_new, splitNew)))),
      )
      const dailyReview = Math.max(
        0,
        Math.min(200, Math.round(pick(input.dailyReview, hasSplitInput ? desiredTotal - dailyNew : pick(existing && existing.daily_review, desiredTotal - dailyNew)))),
      )
      const dailyTarget = Math.max(1, dailyNew + dailyReview)
      if (existing) {
        write(() =>
          db
            .prepare(
              'UPDATE study_tasks SET title=?, template=?, daily_target=?, daily_new=?, daily_review=?, workspace_path=?, session_id=COALESCE(?, session_id), updated_at=? WHERE id=?',
            )
            .run(title, template, dailyTarget, dailyNew, dailyReview, workspacePath, sessionId || null, stamp, existing.id),
        )
        const itemId = existing.item_id || this.attachStudyItemNode(existing.id, title)
        if (existing.item_id) db.prepare('UPDATE items SET title=? WHERE id=?').run(title, existing.item_id)
        return {
          id: existing.id,
          title,
          workspacePath,
          template,
          dailyTarget,
          dailyNew,
          dailyReview,
          summary: {},
          itemId,
          updatedAt: stamp,
        }
      }
      const id = newId('studytask')
      write(() =>
        db
          .prepare(
            'INSERT INTO study_tasks (id,title,workspace_path,template,summary,item_id,session_id,daily_target,daily_new,daily_review,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          )
          .run(
            id,
            title,
            workspacePath,
            template,
            '{}',
            input.itemId || null,
            input.sessionId || null,
            dailyTarget,
            dailyNew,
            dailyReview,
            stamp,
            stamp,
          ),
      )
      if (input.itemId && !db.prepare('SELECT id FROM items WHERE id=?').get(input.itemId)) {
        throw new Error(`item not found: ${input.itemId}`)
      }
      const itemId = input.itemId || this.attachStudyItemNode(id, title)
      const suspicious = /app\.asar|DeepSeek Harness/i.test(workspacePath)
      return {
        id,
        title,
        workspacePath,
        template,
        dailyTarget,
        dailyNew,
        dailyReview,
        summary: {},
        itemId,
        updatedAt: stamp,
        ...(suspicious
          ? { warning: '这个路径看起来是 DSH 程序目录，不是会话工作区；请改用会话真正的工作区路径' }
          : {}),
      }
    },

    setStudyTaskSummary(id, summary) {
      if (!db.prepare('SELECT 1 AS hit FROM study_tasks WHERE id=?').get(id)) {
        throw new Error(`study task not found: ${id}`)
      }
      write(() =>
        db.prepare('UPDATE study_tasks SET summary=?, updated_at=? WHERE id=?').run(JSON.stringify(summary || {}), nowIso(), id),
      )
      return { id, summary: summary || {} }
    },

    /**
     * One heartbeat per minute while the study page is visible. Minutes are
     * counted from the gap since the previous beat, capped so an idle tab does
     * not inflate the numbers; a long gap starts a new segment.
     */
    recordStudyBeat(now = new Date()) {
      const day = studyDayKey(now)
      const stamp = now.toISOString()
      const row = db.prepare('SELECT * FROM study_habits WHERE day=?').get(day)
      if (!row) {
        write(() =>
          db
            .prepare(
              'INSERT INTO study_habits (day,started_at,ended_at,minutes,segments,updated_at) VALUES (?,?,?,?,?,?)',
            )
            .run(day, stamp, stamp, 1, 1, stamp),
        )
        return { day, minutes: 1, segments: 1 }
      }
      const gapMinutes = Math.max(0, (now.getTime() - new Date(row.updated_at).getTime()) / 60000)
      const add = Math.min(2, Math.max(1, Math.round(gapMinutes)))
      const segments = row.segments + (gapMinutes > 10 ? 1 : 0)
      write(() =>
        db
          .prepare('UPDATE study_habits SET ended_at=?, minutes=?, segments=?, updated_at=? WHERE day=?')
          .run(stamp, row.minutes + add, segments, stamp, day),
      )
      return { day, minutes: row.minutes + add, segments }
    },

    /** Recent habits plus a small digest for the page. */
    studyHabitSummary(days = 14) {
      const rows = db
        .prepare('SELECT * FROM study_habits ORDER BY day DESC LIMIT ?')
        .all(days)
        .map((row) => ({
          day: row.day,
          startedAt: row.started_at,
          endedAt: row.ended_at,
          minutes: row.minutes,
          segments: row.segments,
        }))
      const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0)
      const activeDays = rows.filter((row) => row.minutes >= 5).length
      // Consecutive days ending today or yesterday.
      const byDay = new Set(rows.filter((row) => row.minutes >= 5).map((row) => row.day))
      let streak = 0
      const cursor = new Date()
      for (let index = 0; index < days; index += 1) {
        const key = studyDayKey(cursor)
        if (!byDay.has(key)) break
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
      }
      const completed = db
        .prepare('SELECT COUNT(*) AS n FROM study_plan WHERE done_at IS NOT NULL')
        .get().n
      const planned = db.prepare('SELECT COUNT(*) AS n FROM study_plan WHERE date <= ?').get(studyDayKey(new Date())).n
      return {
        days: rows,
        totalMinutes,
        activeDays,
        streak,
        averageMinutes: activeDays === 0 ? 0 : Math.round(totalMinutes / activeDays),
        completionRate: planned === 0 ? 0 : Math.round((completed / planned) * 100),
      }
    },

    /** Move a plan entry to another day and drag its task's deadline along. */
    updatePlanDate(id, date) {
      const row = db.prepare('SELECT * FROM study_plan WHERE id=?').get(id)
      if (!row) throw new Error(`plan not found: ${id}`)
      const key = String(date || '').slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('date must be YYYY-MM-DD')
      write(() => db.prepare('UPDATE study_plan SET date=? WHERE id=?').run(key, id))
      if (row.task_id) {
        try {
          this.updateItem(row.task_id, { dueAt: new Date(`${key}T20:00:00`).toISOString() })
        } catch {
          // The mirrored task may be gone; the plan row still moves.
        }
      }
      return { id, date: key }
    },

    /** Exam date is optional: an empty value means the subject has no exam. */
    updateSubject(id, patch) {
      const row = db.prepare('SELECT * FROM subjects WHERE id=?').get(id)
      if (!row) throw new Error(`subject not found: ${id}`)
      const title = patch.title !== undefined ? String(patch.title || '').trim() : row.title
      if (!title) throw new Error('title is required')
      let examDate = patch.examDate !== undefined ? String(patch.examDate || '').trim() : row.exam_date || ''
      if (examDate && !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) throw new Error('examDate must be YYYY-MM-DD')
      const note = patch.note !== undefined ? String(patch.note || '') : row.note
      write(() =>
        db
          .prepare('UPDATE subjects SET title=?, exam_date=?, note=? WHERE id=?')
          .run(title, examDate || null, note, id),
      )
      return { id, title, examDate: examDate || null, note }
    },

    /**
     * Delete stored content. `tasks` keeps the study catalog (subjects, shelf,
     * study tasks); `all` wipes that too. Settings and habit history survive.
     */
    resetData(scope = 'all') {
      const tables = ['items', 'plan', 'notifications', 'trash', 'study_plan', 'study_task_materials', 'study_materials']
      if (scope === 'all') {
        tables.push('subjects', 'topics', 'mistakes', 'shelf_items', 'study_tasks')
        tables.push('study_day_progress', 'study_day_targets')
      }
      // Habit history is training data for planning: only an explicit
      // 'everything' wipe removes it, which the tool does not expose.
      if (scope === 'everything') tables.push('study_habits', 'daily_tips')
      const before = { items: db.prepare('SELECT COUNT(*) AS n FROM items').get().n }
      write(() => {
        for (const table of tables) db.prepare(`DELETE FROM ${table}`).run()
      })
      return { scope, cleared: tables, removedItems: before.items }
    },

    updateMistake(id, patch) {
      const row = db.prepare('SELECT * FROM mistakes WHERE id=?').get(id)
      if (!row) throw new Error(`mistake not found: ${id}`)
      const question = patch.question !== undefined ? String(patch.question || '').trim() : row.question
      if (!question) throw new Error('question is required')
      const answer = patch.answer !== undefined ? String(patch.answer || '') : row.answer
      const reason = patch.reason !== undefined ? String(patch.reason || '') : row.reason
      write(() =>
        db.prepare('UPDATE mistakes SET question=?, answer=?, reason=? WHERE id=?').run(question, answer, reason, id),
      )
      return { id, question, answer, reason }
    },

    /** Build a ready-to-send explanation request for the owning conversation. */
    mistakeBrief(id) {
      const row = db.prepare('SELECT * FROM mistakes WHERE id=?').get(id)
      if (!row) throw new Error(`mistake not found: ${id}`)
      const task = row.task_id ? db.prepare('SELECT title FROM study_tasks WHERE id=?').get(row.task_id) : null
      const lines = [
        '讲解下面这道错题，只讲解、不要修改熟练度、不要出题：',
        `题目：${row.question}`,
        row.answer ? `正确答案：${row.answer}` : '',
        row.reason ? `我的错误原因：${row.reason}` : '',
        '请说明：为什么错、正确思路、以及一个记忆方法。',
      ].filter(Boolean)
      return {
        id,
        taskTitle: task ? task.title : '',
        prompt: lines.join('\n'),
      }
    },

    /**
     * One suggestion per study day, built from the day's plan, overdue work and
     * the recent habit history. Cached so it is generated once after 04:00.
     */
    todayTip() {
      const day = studyDayKey(new Date())
      const cached = db.prepare('SELECT * FROM daily_tips WHERE day=?').get(day)
      if (cached) return { day, text: cached.text, createdAt: cached.created_at, cached: true }

      const today = db.prepare('SELECT * FROM study_plan WHERE date=?').all(day)
      const overdue = db
        .prepare('SELECT COUNT(*) AS n FROM study_plan WHERE date < ? AND done_at IS NULL')
        .get(day).n
      const doneToday = today.filter((row) => row.done_at).length
      const minutes = today.reduce((sum, row) => sum + (Number(row.minutes) || 0), 0)
      const subjects = new Map(db.prepare('SELECT id, title FROM subjects').all().map((row) => [row.id, row.title]))
      const perSubject = new Map()
      for (const row of today) {
        const name = subjects.get(row.subject_id) || '未分类'
        perSubject.set(name, (perSubject.get(name) || 0) + 1)
      }
      const parts = []
      if (today.length > 0) {
        const detail = Array.from(perSubject.entries())
          .map(([name, count]) => `${name} ${count}`)
          .join('、')
        parts.push(`今天 ${today.length} 项计划（约 ${minutes} 分钟）：${detail}，已完成 ${doneToday} 项。`)
      } else {
        parts.push('今天没有学习计划，可以补一轮复习，或者休息一天。')
      }
      if (overdue > 0) parts.push(`另有 ${overdue} 项旧计划顺延到今天，建议先清掉它们。`)

      // Per-conversation daily goals, so the advice names real numbers.
      const studyTasks = db.prepare('SELECT * FROM study_tasks ORDER BY created_at').all()
      if (studyTasks.length > 0) {
        const lines = studyTasks.map((row) => {
          const goal = this.effectiveTarget(row, day)
          const progress = this.dayProgress(row.id, day)
          const overdueDays = this.studyTaskOverdue(row, day)
          const overdueText = overdueDays > 0 ? `，已逾期 ${overdueDays} 天` : ''
          return `${row.title}：今天 ${goal.newTarget} 个新内容 + ${goal.reviewTarget} 个复习，已完成 ${progress.answeredNew} 新 + ${progress.answeredReview} 复习${overdueText}`
        })
        parts.push(`学习对话进度——${lines.join('；')}。`)
      }

      const habits = this.studyHabitSummary(14)
      if (habits.activeDays === 0) {
        parts.push('还没有学习时长记录：打开学习页就会开始计时，今天从 10 分钟开始即可。')
      } else {
        parts.push(`最近 ${habits.activeDays} 个学习日平均 ${habits.averageMinutes} 分钟，连续 ${habits.streak} 天。`)
        if (habits.averageMinutes < 20) parts.push('单次时长偏短，建议每次至少 20 分钟。')
        if (habits.completionRate < 50) parts.push('计划完成率偏低，今天可以把计划缩到 3–5 项。')
      }

      const text = parts.join('')
      write(() =>
        db.prepare('INSERT INTO daily_tips (day,text,created_at) VALUES (?,?,?)').run(day, text, nowIso()),
      )
      return { day, text, createdAt: nowIso(), cached: false }
    },

    /** Give already-linked study tasks the 学习 type and tag so they never fall under 未分类. */
    normalizeStudyItems() {
      let fixed = 0
      for (const row of db.prepare('SELECT item_id FROM study_tasks WHERE item_id IS NOT NULL').all()) {
        const item = db.prepare('SELECT * FROM items WHERE id=?').get(row.item_id)
        if (!item) continue
        const tags = item.tags ? JSON.parse(item.tags) : []
        const hasTag = tags.includes('学习')
        if (item.task_type === '学习' && hasTag) continue
        const nextTags = hasTag ? tags : [...tags, '学习']
        write(() =>
          db.prepare('UPDATE items SET task_type=?, tags=? WHERE id=?').run('学习', JSON.stringify(nextTags), item.id),
        )
        fixed += 1
      }
      return { fixed }
    },

    /**
     * The tag library starts from what tasks already carry, so existing tags are
     * never invisible just because they were never typed into settings.
     */
    syncTagLibrary() {
      const used = new Set()
      for (const row of db.prepare("SELECT tags FROM items WHERE tags IS NOT NULL AND tags<>'[]'").all()) {
        try {
          for (const tag of JSON.parse(row.tags || '[]')) if (tag) used.add(String(tag))
        } catch {
          // A corrupt value is skipped; other rows still contribute.
        }
      }
      // Seed only when the user never touched the library. An explicit empty
      // list means "I deleted these", so deletions must stick.
      const stored = db.prepare("SELECT value FROM settings WHERE key='tags'").get()
      if (stored) return { added: 0 }
      if (used.size === 0) return { added: 0 }
      write(() =>
        db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run('tags', JSON.stringify([...used])),
      )
      return { added: used.size }
    },

    readUiState(key) {
      const row = db.prepare('SELECT value FROM ui_state WHERE key=?').get(String(key))
      if (!row) return null
      try {
        return JSON.parse(row.value)
      } catch {
        return null
      }
    },

    saveUiState(key, value) {
      write(() =>
        db
          .prepare('INSERT OR REPLACE INTO ui_state (key,value) VALUES (?,?)')
          .run(String(key), JSON.stringify(value === undefined ? null : value)),
      )
      return { key: String(key) }
    },

    listLearning() {
      const subjects = db.prepare('SELECT * FROM subjects ORDER BY created_at').all()
      const topics = db.prepare('SELECT * FROM topics ORDER BY created_at').all()
      const now = nowIso()
      // Attach the shelf materials linked to each plan entry in one query.
      const byPlan = new Map()
      for (const row of db
        .prepare(
          'SELECT m.plan_id AS plan_id, s.id AS id, s.title AS title, s.path AS path FROM study_materials m JOIN shelf_items s ON s.id = m.shelf_id',
        )
        .all()) {
        if (!byPlan.has(row.plan_id)) byPlan.set(row.plan_id, [])
        byPlan.get(row.plan_id).push({ id: row.id, title: row.title, path: row.path })
      }
      const materialsFor = (planId) => byPlan.get(planId) || []
      return {
        subjects: subjects.map((row) => ({
          id: row.id,
          title: row.title,
          note: row.note,
          examDate: row.exam_date || null,
        })),
        topics: topics.map((row) => ({
          id: row.id,
          subjectId: row.subject_id || null,
          title: row.title,
          mastery: clampMastery(row.mastery),
          reviewAt: row.review_at || null,
          lockUntil: row.lock_until || null,
          masteredAt: row.mastered_at || null,
          note: row.note,
          due: Boolean(row.review_at && row.review_at <= now),
        })),
        plan: db
          .prepare('SELECT * FROM study_plan ORDER BY date, created_at')
          .all()
          .map((row) => ({
            id: row.id,
            date: row.date,
            subjectId: row.subject_id,
            topicId: row.topic_id || null,
            kind: row.kind,
            minutes: row.minutes,
            doneAt: row.done_at || null,
            taskId: row.task_id || null,
            materials: materialsFor(row.id),
          })),
        mistakes: db
          .prepare('SELECT * FROM mistakes ORDER BY created_at DESC')
          .all()
          .map((row) => ({
            id: row.id,
            subjectId: row.subject_id || null,
            question: row.question,
            answer: row.answer,
            reason: row.reason,
            source: row.source,
            tags: safeJson(row.tags, []),
            reviewAt: row.review_at || null,
            due: Boolean(row.review_at && row.review_at <= now),
          })),
      }
    },
    addSubject(input) {
      const title = String(input.title || '').trim()
      if (!title) throw new Error('title is required')
      if (input.examDate && Number.isNaN(new Date(input.examDate).getTime())) {
        throw new Error('invalid examDate')
      }
      const subject = {
        id: newId('subject'),
        title,
        note: String(input.note || ''),
        examDate: input.examDate || null,
        createdAt: nowIso(),
      }
      write(() =>
        db
          .prepare('INSERT INTO subjects (id,title,note,exam_date,created_at,updated_at) VALUES (?,?,?,?,?,?)')
          .run(subject.id, subject.title, subject.note, subject.examDate, subject.createdAt, subject.createdAt),
      )
      return subject
    },
    addTopic(input) {
      const title = String(input.title || '').trim()
      if (!title) throw new Error('title is required')
      if (input.subjectId) {
        const subject = db.prepare('SELECT id FROM subjects WHERE id=?').get(input.subjectId)
        if (!subject) throw new Error(`subject not found: ${input.subjectId}`)
      }
      const topic = {
        id: newId('topic'),
        subjectId: input.subjectId || null,
        title,
        mastery: clampMastery(input.mastery ?? 4),
        reviewAt: input.reviewAt || scheduleReview(clampMastery(input.mastery ?? 4)),
        note: String(input.note || ''),
        createdAt: nowIso(),
      }
      write(() =>
        db
          .prepare(
            'INSERT INTO topics (id,subject_id,title,mastery,review_at,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
          )
          .run(
            topic.id,
            topic.subjectId,
            topic.title,
            topic.mastery,
            topic.reviewAt,
            topic.note,
            topic.createdAt,
            topic.createdAt,
          ),
      )
      return topic
    },
    setMastery(id, mastery, reviewAt) {
      const row = db.prepare('SELECT * FROM topics WHERE id=?').get(id)
      if (!row) throw new Error(`topic not found: ${id}`)
      let value = clampMastery(mastery)
      // While a topic sits in its post-zero cooldown the score cannot rise.
      if (
        row.lock_until &&
        new Date(row.lock_until).getTime() > Date.now() &&
        value > clampMastery(row.mastery)
      ) {
        value = clampMastery(row.mastery)
      }
      const now = nowIso()
      // Falling to zero starts a cooldown: it still shows up every day, but the
      // score cannot rise until the cooldown ends.
      let lockUntil = row.lock_until || null
      if (value === 0) {
        if (!lockUntil || new Date(lockUntil).getTime() <= Date.now()) {
          lockUntil = new Date(Date.now() + 3 * 86400000).toISOString()
        }
      } else {
        lockUntil = null
      }
      const masteredAt = value >= 10 ? row.mastered_at || now : null
      const next = reviewAt || scheduleReview(value)
      write(() =>
        db
          .prepare('UPDATE topics SET mastery=?, review_at=?, lock_until=?, mastered_at=?, updated_at=? WHERE id=?')
          .run(String(value), next, lockUntil, masteredAt, now, id),
      )
      return { id, mastery: value, reviewAt: next, lockUntil, masteredAt }
    },
    exportData() {
      return {
        version: 1,
        exportedAt: nowIso(),
        plan: readPlan(),
        items: allItems(),
        settings: readSettings(),
      }
    },
    importData(payload) {
      if (!payload || typeof payload !== 'object') throw new Error('导入内容不是有效 JSON')
      const incoming = Array.isArray(payload.items) ? payload.items : []
      const stamp = nowIso()
      let added = 0
      let updated = 0
      let settingsApplied = 0
      write(() => {
        for (const raw of incoming) {
          if (!raw || typeof raw.id !== 'string') continue
          const title = String(raw.title || '').trim()
          if (!title) continue
          const existing = getItem(raw.id)
          if (existing) updated += 1
          else added += 1
          db.prepare(
            `INSERT OR REPLACE INTO items (${ITEM_COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          ).run(
            raw.id,
            typeof raw.kind === 'string' && raw.kind.trim() ? raw.kind.trim() : 'task',
            title,
            raw.parentId || null,
            Number.isFinite(raw.order) ? raw.order : 0,
            String(raw.note || ''),
            raw.status || null,
            normalizePriority(raw.priority),
            JSON.stringify(Array.isArray(raw.dependsOn) ? raw.dependsOn : []),
            raw.dueAt || null,
            raw.recurrence ? JSON.stringify(raw.recurrence) : null,
            raw.completedAt || null,
            raw.completionNote || null,
            raw.archivedAt || null,
            raw.deletedAt || null,
            raw.createdAt || stamp,
            raw.updatedAt || stamp,
            raw.lastNotifiedAt || null,
            raw.deferStartedAt || null,
            JSON.stringify(normalizeTags(raw.tags)),
            raw.taskType || null,
            raw.startAt || null,
            raw.location || null,
          )
        }
        if (payload.plan && typeof payload.plan.bodyMarkdown === 'string') {
          db.prepare('INSERT OR REPLACE INTO plan (id,title,body_markdown,updated_at) VALUES (?,?,?,?)').run(
            'plan',
            payload.plan.title || '规划书',
            payload.plan.bodyMarkdown,
            nowIso(),
          )
        }
        // A full export carries the settings too, so restore them as well.
        if (payload.settings && typeof payload.settings === 'object') {
          for (const [key, value] of Object.entries(payload.settings)) {
            if (!(key in DEFAULT_SETTINGS)) continue
            db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run(key, JSON.stringify(value))
            settingsApplied += 1
          }
        }
      })
      return { added, updated, settingsApplied }
    },
    scan,
    pendingNotifications() {
      // Nothing is dropped for age: a reminder written while the panel was
      // closed is still worth showing. Repeats are prevented at enqueue time.
      return db
        .prepare(
          'SELECT id,item_id,title,due_at,kind,priority,host_notified,created_at FROM notifications WHERE delivered_at IS NULL ORDER BY created_at LIMIT 50',
        )
        .all()
        .map((row) => ({
          id: row.id,
          itemId: row.item_id,
          title: row.title,
          dueAt: row.due_at,
          kind: row.kind || (row.due_at ? 'short' : 'long'),
          priority: row.priority,
          hostNotified: Boolean(row.host_notified),
          createdAt: row.created_at,
        }))
    },
    ackNotifications(ids) {
      write(() => {
        for (const id of ids || []) {
          db.prepare('UPDATE notifications SET delivered_at=? WHERE id=?').run(nowIso(), id)
        }
      })
    },
    savePlan(bodyMarkdown) {      const updatedAt = nowIso()
      write(() =>
        db
          .prepare('INSERT OR REPLACE INTO plan (id,title,body_markdown,updated_at) VALUES (?,?,?,?)')
          .run('plan', readPlan().title, String(bodyMarkdown ?? ''), updatedAt),
      )
      return { title: readPlan().title, updatedAt, bodyMarkdown: String(bodyMarkdown ?? '') }
    },
    isSessionEnabled(sessionId) {
      const row = db.prepare('SELECT enabled FROM session_flags WHERE session_id = ?').get(sessionId)
      return Boolean(row && row.enabled === 1)
    },
    setSessionEnabled(sessionId, enabled) {
      write(() => {
        if (enabled) {
          db.prepare('INSERT OR REPLACE INTO session_flags (session_id,enabled) VALUES (?,1)').run(sessionId)
        } else {
          db.prepare('DELETE FROM session_flags WHERE session_id = ?').run(sessionId)
        }
      })
      return Boolean(enabled)
    },
  }
}

/** One backup per process start, pruned to the newest MAX_BACKUPS files. */
async function writeBackup(db) {
  try {
    mkdirSync(BACKUP_DIR, { recursive: true })
    const stamp = nowIso().replace(/[:.]/g, '-')
    await backup(db, join(BACKUP_DIR, `data-${stamp}.db`))
    const files = readdirSync(BACKUP_DIR)
      .filter((name) => name.endsWith('.db'))
      .sort()
    for (const name of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
      unlinkSync(join(BACKUP_DIR, name))
    }
  } catch {
    // A failed backup must never keep the plugin from serving.
  }
}

function renderJson(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function objectSchema(properties, required) {
  const schema = { type: 'object', properties: properties || {} }
  if (required && required.length > 0) schema.required = required
  return schema
}

const OVERVIEW_LIMIT = 20

function buildTools(store) {
  const strings = { type: 'string' }

  return [
    {
      definition: {
        name: 'planner_overview',
        description:
          'Read a short plan summary: counts plus up to 20 overdue, today, due-soon and blocked tasks with ids. Ask for details with planner_get_plan or item-level tools.',
        parameters: objectSchema({}),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          const today = dayKeyOf(new Date())
          const soonLimit = dayKeyOf(new Date(Date.now() + 3 * 86400000))
          const buckets = { overdue: [], today: [], soon: [], later: [], blocked: [] }
          for (const item of store.snapshot().items) {
            if (!isTaskLike(item.kind) || item.derived.archived || item.derived.done) continue
            if (item.derived.blocked) buckets.blocked.push(item)
            if (!item.dueAt) continue
            const day = dayKeyOf(new Date(item.dueAt))
            if (day < today) buckets.overdue.push(item)
            else if (day === today) buckets.today.push(item)
            else if (day <= soonLimit) buckets.soon.push(item)
            else buckets.later.push(item)
          }
          const summarize = (items) =>
            items.slice(0, OVERVIEW_LIMIT).map((item) => ({ id: item.id, title: item.title, dueAt: item.dueAt || null }))
          return {
            planTitle: store.readPlan().title,
            planUpdatedAt: store.readPlan().updatedAt,
            counts: Object.fromEntries(Object.entries(buckets).map(([key, items]) => [key, items.length])),
            truncated: Object.fromEntries(
              Object.entries(buckets).map(([key, items]) => [key, Math.max(0, items.length - OVERVIEW_LIMIT)]),
            ),
            overdue: summarize(buckets.overdue),
            today: summarize(buckets.today),
            soon: summarize(buckets.soon),
            blocked: summarize(buckets.blocked),
          }
        },
      },
    },
    {
      definition: {
        name: 'planner_get_plan',
        description: 'Read the long-term plan document (Markdown). Use it when the user asks about their overall plan.',
        parameters: objectSchema({}),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return store.readPlan()
        },
      },
    },
    {
      definition: {
        name: 'planner_update_plan',
        description:
          'Replace the plan document with new Markdown. Only call it after the user approved the wording; it overwrites the whole document.',
        parameters: objectSchema(
          { bodyMarkdown: { ...strings, description: 'The complete new Markdown body.' } },
          ['bodyMarkdown'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          const plan = store.savePlan(args.bodyMarkdown)
          return { title: plan.title, updatedAt: plan.updatedAt, saved: true }
        },
      },
    },
    {
      definition: {
        name: 'item_add',
        description:
          'Create a task in the plan tree. Every node is a task; its category is derived from the top-level ancestor unless taskType is given.',
        parameters: objectSchema(
          {
            title: { ...strings, description: 'Short title.' },
            parentId: { ...strings, description: 'Parent item id; omit for a root item.' },
            dueAt: { ...strings, description: 'ISO timestamp for a deadline.' },
            startAt: {
              ...strings,
              description: 'ISO timestamp when the task may start; omit when it has already started.',
            },
            location: { ...strings, description: 'Where the task happens.' },
            priority: {
              type: 'integer',
              minimum: 0,
              maximum: 9,
              description: 'Tasks only; 0-2 low, 3-6 medium, 7-9 high.',
            },
            note: { ...strings, description: 'Optional detail.' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Free-form labels, e.g. ["考试","重点"].',
            },
            taskType: { type: 'string', description: 'Task type, e.g. 学习 / 工作 / 生活.' },
          },
          ['title'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.view(store.addItem(args))
        },
      },
    },
    {
      definition: {
        name: 'item_update',
        description: 'Change an existing item title, note, status, priority, due date or parent.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Item id.' },
            title: strings,
            note: strings,
            status: { type: 'string', enum: ['todo', 'doing', 'active', 'paused'] },
            priority: { type: 'integer', minimum: 0, maximum: 9, description: '0-2 low, 3-6 medium, 7-9 high.' },
            dueAt: strings,
            startAt: strings,
            location: strings,
            parentId: strings,
            tags: { type: 'array', items: { type: 'string' }, description: 'Replaces the tag list.' },
            taskType: { ...strings, description: 'Task type label; empty clears it.' },
          },
          ['id'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          const { id, ...patch } = args
          return store.view(store.updateItem(id, patch))
        },
      },
    },
    {
      definition: {
        name: 'item_move',
        description: 'Move an item under another parent, or back to the root.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Item id.' },
            parentId: { ...strings, description: 'New parent id; omit for the root.' },
          },
          ['id'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.view(store.move(args.id, args.parentId))
        },
      },
    },
    {
      definition: {
        name: 'item_archive',
        description: 'Archive a finished item so it leaves the active lists while staying recoverable.',
        parameters: objectSchema({ id: { ...strings, description: 'Item id.' } }, ['id']),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.view(store.archive(args.id))
        },
      },
    },
    {
      definition: {
        name: 'item_delete',
        description:
          'Delete an item. Its children move up one level; the delete is recoverable for 5 minutes.',
        parameters: objectSchema({ id: { ...strings, description: 'Item id.' } }, ['id']),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.deleteItem(args.id)
        },
      },
    },
    {
      definition: {
        name: 'item_reorder',
        description: 'Move an item up or down among its siblings.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Item id.' },
            direction: { type: 'string', enum: ['up', 'down'], description: 'Which way to move it.' },
          },
          ['id', 'direction'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          store.reorder(args.id, args.direction)
          return store.view(store.getItem(args.id))
        },
      },
    },
    {
      definition: {
        name: 'study_overview',
        description: 'Summarize the learning workspace: subjects, topics, and what is due for review.',
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return store.listLearning()
        },
      },
    },
    {
      definition: {
        name: 'study_add_subject',
        description: 'Create a study subject (a course or an exam). examDate is optional: omit it for a subject without an exam.',
        parameters: objectSchema(
          {
            title: { ...strings, description: 'Subject name.' },
            note: strings,
            examDate: {
              ...strings,
              description: 'Optional exam date as YYYY-MM-DD; omit it (or pass an empty string) when there is no exam.',
            },
          },
          ['title'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.addSubject(args)
        },
      },
    },
    {
      definition: {
        name: 'study_update_subject',
        description: 'Update a subject title, note or exam date; pass an empty examDate to remove the exam.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Subject id.' },
            title: { ...strings, description: 'New title.' },
            note: { ...strings, description: 'New note.' },
            examDate: {
              ...strings,
              description: 'YYYY-MM-DD, or an empty string to mark the subject as having no exam.',
            },
          },
          ['id'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.updateSubject(args.id, args)
        },
      },
    },
    {
      definition: {
        name: 'study_add_topic',
        description: 'Add a knowledge point under a subject.',
        parameters: objectSchema(
          {
            title: { ...strings, description: 'Knowledge point.' },
            subjectId: { ...strings, description: 'Owning subject id.' },
            mastery: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
              description: 'Current mastery 0-10; defaults to 4 for a new point.',
            },
            note: strings,
          },
          ['title'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.addTopic(args)
        },
      },
    },
    {
      definition: {
        name: 'study_set_mastery',
        description: 'Record mastery for a knowledge point; the next review is scheduled from the spacing rule.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Topic id.' },
            mastery: { type: 'integer', minimum: 0, maximum: 10, description: 'New mastery on a 0-10 scale.' },
            reviewAt: { ...strings, description: 'Optional explicit next review time (ISO).' },
          },
          ['id', 'mastery'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.setMastery(args.id, args.mastery, args.reviewAt)
        },
      },
    },
    {
      definition: {
        name: 'study_plan_done',
        description: 'Finish a study plan entry; topic entries raise mastery and reschedule the review.',
        parameters: objectSchema({ id: { ...strings, description: 'Plan entry id.' } }, ['id']),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.completePlan(args.id)
        },
      },
    },
    {
      definition: {
        name: 'study_plan_today',
        description: "Today's study plan entries.",
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return { entries: store.planToday() }
        },
      },
    },
    {
      definition: {
        name: 'study_plan_generate',
        description: 'Generate or regenerate the study plan for a subject up to its exam date.',
        parameters: objectSchema({ subjectId: { ...strings, description: 'Subject id.' } }, ['subjectId']),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.generatePlan(args.subjectId)
        },
      },
    },
    {
      definition: {
        name: 'study_link_materials',
        description: 'Attach shelf materials to a study plan entry, replacing the previous list.',
        parameters: objectSchema(
          {
            planId: { ...strings, description: 'Study plan entry id.' },
            shelfIds: { type: 'array', items: { type: 'string' }, description: 'Shelf item ids to attach.' },
          },
          ['planId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.linkMaterials(args.planId, args.shelfIds || [])
        },
      },
    },
    {
      definition: {
        name: 'study_register_task',
        description:
          'Register the study task that owns one conversation workspace: title, absolute workspace path, template name and optional task id. Call it when a study-mode conversation is created; the template text itself comes from study_template.',
        parameters: objectSchema(
          {
            title: { ...strings, description: 'Task title, normally the conversation title.' },
            workspacePath: { ...strings, description: 'Absolute path of this conversation workspace.' },
            template: {
              type: 'string',
              enum: ['list', 'tree', 'bank', 'custom', 'word-bank', 'outline', 'outline-bank'],
              description:
                'Knowledge-base type: list (cards), tree (points), bank (question bank over a tree), or custom. Legacy ids word-bank/outline/outline-bank are accepted as aliases.',
            },
            dailyNew: { type: 'number', description: 'New items per day (0-200).' },
            dailyReview: { type: 'number', description: 'Review items per day (0-200).' },
            dailyTarget: {
              type: 'number',
              description: 'Total items that count as a finished day; split 1/3 new and 2/3 review when the two numbers are absent.',
            },
            itemId: { ...strings, description: 'Optional task-tree node id to mirror the title into.' },
          },
          ['title', 'workspacePath'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args, exec) {
          const sessionId = exec && exec.agent && exec.agent.session ? exec.agent.session.id : undefined
          return store.registerStudyTask({ ...args, sessionId: sessionId || args.sessionId })
        },
      },
    },
    {
      definition: {
        name: 'study_set_summary',
        description:
          'Write back a light summary for a study task (entry count, average mastery, last update) so the plugin page can show progress without reading the workspace.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Study task id.' },
            summary: { type: 'object', description: 'Free-form digest, e.g. { total, average, updatedAt }.' },
          },
          ['id', 'summary'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.setStudyTaskSummary(args.id, args.summary)
        },
      },
    },
    {
      definition: {
        name: 'study_shelf_add',
        description: 'Shelve a local file, a local directory (scanned recursively) or a web page.',
        parameters: objectSchema(
          {
            kind: { type: 'string', enum: ['file', 'dir', 'url'] },
            path: { ...strings, description: 'File path, directory path or URL.' },
            title: strings,
            tags: { type: 'array', items: { type: 'string' }, description: 'Free-form labels.' },
            note: strings,
          },
          ['kind', 'path'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.shelfAdd(args)
        },
      },
    },
    {
      definition: {
        name: 'study_task_list',
        description:
          'List registered study tasks: id, title, absolute workspace path, template, attached shelf materials, today two-part goals (targetNew/targetReview, answeredNew/answeredReview), doneToday, overdueDays, missing workspace flag and the agent-written summary.',
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return { tasks: store.listStudyTasks() }
        },
      },
    },
    {
      definition: {
        name: 'study_progress',
        description:
          "Per-day history of a study task's two daily goals: for each day it returns targetNew/targetReview, answeredNew/answeredReview, newMet/reviewMet, done, plus doneDays/streak/completionRate. Use it for the weekly review (three good days in a row, target adjustments) instead of guessing from habits.",
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id.' },
            days: { type: 'number', description: 'How many days back to include (1-90, default 14).' },
          },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.studyProgress(args.taskId, args.days || 14)
        },
      },
    },
    {
      definition: {
        name: 'study_run_program',
        description:
          'Run a Node (ESM) program with cwd inside the study task workspace. Use it for every bulk data operation: importing words, parsing materials, writing knowledge.db, checkpointing signatures. Only the program output (capped) returns to the conversation. The script may import node:sqlite, node:fs and read process.env.LP_WORKSPACE.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id that owns the workspace.' },
            code: { ...strings, description: 'Full ESM program source to execute.' },
            timeoutMs: { type: 'number', description: 'Timeout in milliseconds (default 120000).' },
          },
          ['taskId', 'code'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.runStudyProgram(args.taskId, args.code, args.timeoutMs)
        },
      },
    },
    {
      definition: {
        name: 'study_next_questions',
        description:
          'Return quiz items for today, split into new knowledge and review. New items come from entries never studied; reviews are the weakest studied entries. A score of 0 only pauses scoring for three days - the item is still asked. Each item carries prompt, answer and distractors; ask them all in ONE ask_user_question call, then grade them together. Pass count (1-20, default 5) or explicit newCount/reviewCount to override the split.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id that owns the workspace.' },
            count: { type: 'number', description: 'How many items to return (default 5, max 20).' },
            newCount: { type: 'number', description: 'Override: how many new items to include.' },
            reviewCount: { type: 'number', description: 'Override: how many review items to include.' },
          },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.nextStudyQuestions(args.taskId, args.count || 5, {
            newCount: args.newCount,
            reviewCount: args.reviewCount,
          })
        },
      },
    },
    {
      definition: {
        name: 'study_answer',
        description:
          'Record one graded answer for a quiz item: +1 when correct, -1 when wrong (clamped 0..10). Call it right after the user answers.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id.' },
            itemId: { ...strings, description: 'Item id returned by study_next_questions.' },
            correct: { type: 'boolean', description: 'Whether the answer was correct.' },
          },
          ['taskId', 'itemId', 'correct'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.recordStudyAnswer(args.taskId, args.itemId, args.correct)
        },
      },
    },
    {
      definition: {
        name: 'study_shelf_list',
        description:
          'List shelf items with id, title, tags, path and kind. Use it to recommend which existing materials fit the subject instead of asking the user for a path.',
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return { items: store.shelfList() }
        },
      },
    },
    {
      definition: {
        name: 'study_attach_shelves',
        description:
          'Attach shelf items to a study task, replacing the previous selection. Pass ids returned by study_shelf_list.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id.' },
            shelfIds: { type: 'array', items: { type: 'string' }, description: 'Shelf item ids to attach.' },
          },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.setStudyTaskMaterials(args.taskId, args.shelfIds || [])
        },
      },
    },
    {
      definition: {
        name: 'planner_reset',
        description:
          'Delete stored content. scope=tasks removes the task tree, plan, study plans and notifications; scope=all also removes subjects, topics, mistakes, shelf items and study tasks. Settings and study-habit history are kept. Requires confirm=true.',
        parameters: objectSchema(
          {
            scope: { type: 'string', enum: ['tasks', 'all'], description: 'How much to delete (default all).' },
            confirm: { type: 'boolean', description: 'Must be true; guards against accidental wipes.' },
          },
          ['confirm'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          if (args.confirm !== true) throw new Error('confirm=true 是清空数据的必要条件')
          return store.resetData(args.scope || 'all')
        },
      },
    },
    {
      definition: {
        name: 'study_set_target',
        description:
          'Set the default daily goal for a study task. New knowledge and review are planned separately; a single dailyTarget is split 1/3 new and 2/3 review.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id.' },
            dailyNew: { type: 'number', description: 'New items per day (0-200).' },
            dailyReview: { type: 'number', description: 'Review items per day (0-200).' },
            dailyTarget: { type: 'number', description: 'Legacy total; ignored when the two numbers are given.' },
          },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          const hasSplit = args.dailyNew !== undefined || args.dailyReview !== undefined
          if (!hasSplit && Number.isFinite(Number(args.dailyTarget))) {
            const total = Math.max(1, Math.min(200, Math.round(Number(args.dailyTarget))))
            const nextNew = Math.max(1, Math.round(total / 3))
            return store.setStudyTarget(args.taskId, nextNew, Math.max(1, total - nextNew))
          }
          return store.setStudyTarget(args.taskId, args.dailyNew, args.dailyReview)
        },
      },
    },
    {
      definition: {
        name: 'study_set_day_target',
        description:
          "Adjust only today's goal, typically after reading study_habits and the current plan. The day goal wins over the default for that day.",
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id.' },
            newTarget: { type: 'number', description: 'New items for today (0-200).' },
            reviewTarget: { type: 'number', description: 'Review items for today (0-200).' },
            target: { type: 'number', description: 'Legacy total for today; split when the two numbers are absent.' },
            note: { ...strings, description: 'Short reason, shown to nobody but kept for history.' },
          },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.setStudyDayTarget(
            args.taskId,
            { newTarget: args.newTarget, reviewTarget: args.reviewTarget, total: args.target },
            args.note,
          )
        },
      },
    },
    {
      definition: {
        name: 'study_finish_today',
        description:
          "Mark today's study interaction as done for a task: it completes the mirrored tree node for the day and clears the overdue counter. Call it once the day's round is finished (the node reopens automatically tomorrow).",
        parameters: objectSchema(
          { taskId: { ...strings, description: 'Study task id.' } },
          ['taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.finishStudyDay(args.taskId)
        },
      },
    },
    {
      definition: {
        name: 'study_time_plan',
        description:
          "Read the current week's planned study minutes per day next to the actual minutes, so the plan can be adjusted from real usage.",
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return store.studyTimeWeek()
        },
      },
    },
    {
      definition: {
        name: 'study_set_time_plan',
        description:
          "Plan this week's study minutes per day. Pass entries for the days to change; minutes=null clears that day's plan.",
        parameters: objectSchema(
          {
            entries: {
              type: 'array',
              description: 'One entry per day, e.g. [{ day: "2026-11-16", minutes: 45 }].',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string', description: 'YYYY-MM-DD' },
                  minutes: { type: 'number', description: 'Planned minutes; null clears the day.' },
                  note: { type: 'string' },
                },
                required: ['day'],
              },
            },
          },
          ['entries'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.setStudyTimeWeek(args.entries)
        },
      },
    },
    {
      definition: {
        name: 'study_habits',
        description:
          'Read the last 14 days of study time (minutes per day, segments, streak, completion rate) so advice about when and how long to study is grounded in real usage.',
        parameters: objectSchema({}, []),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute() {
          return store.studyHabitSummary()
        },
      },
    },
    {
      definition: {
        name: 'study_shelf_delete',
        description: 'Delete one shelf item by id; use it to remove a duplicate entry.',
        parameters: objectSchema({ id: { ...strings, description: 'Shelf item id.' } }, ['id']),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.shelfDelete(args.id)
        },
      },
    },
    {
      definition: {
        name: 'study_pdf_text',
        description:
          'Extract text from a PDF inside the study task workspace using pdftotext (no shell needed). Use it before importing words or outlines.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id that owns the workspace.' },
            relative: {
              ...strings,
              description: "PDF path inside the workspace, e.g. 'learning/materials/book.pdf'.",
            },
            maxChars: { type: 'number', description: 'Maximum characters to return (default 400000).' },
            outFile: {
              ...strings,
              description:
                "Write the text to this path inside the workspace and return only stats, e.g. 'learning/materials/book.txt'. Use it for long books so the text never enters the conversation.",
            },
          },
          ['taskId', 'relative'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.extractPdfText(args.taskId, args.relative, args.maxChars, args.outFile)
        },
      },
    },
    {
      definition: {
        name: 'study_template',
        description:
          'Return the text of a built-in knowledge template: list (cards), tree (points), bank (question bank + tree), custom, ingest, teaching. Legacy ids word-bank/outline/outline-bank still work. Use this instead of reading files from the plugin directory.',
        parameters: objectSchema(
          {
            name: {
              type: 'string',
              enum: ['list', 'tree', 'bank', 'custom', 'ingest', 'teaching', 'word-bank', 'outline', 'outline-bank'],
              description: 'Template to return.',
            },
          },
          ['name'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.readTemplate(args.name)
        },
      },
    },
    {
      definition: {
        name: 'study_read_file',
        description:
          'Read a text file inside a study task workspace (capped) without needing a shell; use it after study_import_material.',
        parameters: objectSchema(
          {
            taskId: { ...strings, description: 'Study task id that owns the workspace.' },
            relative: { ...strings, description: "Path inside the workspace, e.g. 'learning/materials/a.txt'." },
            limit: { type: 'number', description: 'Maximum characters to return (default 200000).' },
          },
          ['taskId', 'relative'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.readStudyFile(args.taskId, args.relative, args.limit)
        },
      },
    },
    {
      definition: {
        name: 'study_import_material',
        description:
          'Copy a shelf file or directory into the study task workspace (learning/materials/) so the conversation can read it; shelf paths may live outside the workspace.',
        parameters: objectSchema(
          {
            shelfId: { ...strings, description: 'Shelf item id to copy.' },
            taskId: { ...strings, description: 'Study task id that owns the destination workspace.' },
          },
          ['shelfId', 'taskId'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.importShelfToTask(args.shelfId, args.taskId)
        },
      },
    },
    {
      definition: {
        name: 'study_mistake_add',
        description:
          'Record a wrong answer with its correct answer, the reason and where it came from. Pass taskId and itemId so the mistake is filed under the study task and can be auto-removed once that item is mastered (proficiency 10).',
        parameters: objectSchema(
          {
            question: { ...strings, description: 'The question or prompt.' },
            answer: { ...strings, description: 'The correct answer.' },
            reason: { ...strings, description: 'Why it went wrong.' },
            source: { ...strings, description: 'Where it came from, e.g. a workbook and page.' },
            subjectId: strings,
            tags: { type: 'array', items: { type: 'string' } },
            taskId: { ...strings, description: 'Study task id that owns the workspace database.' },
            itemId: { ...strings, description: 'Item id inside that database (cards.id or points.id).' },
          },
          ['question'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.addMistake(args)
        },
      },
    },
    {
      definition: {
        name: 'task_complete',
        description: 'Mark a task done, or undo that. Passing done=false clears the completion time.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Task id.' },
            done: { type: 'boolean', description: 'True to complete, false to reopen. Defaults to true.' },
            note: { ...strings, description: 'Optional completion note.' },
            force: {
              type: 'boolean',
              description: 'Complete even while children or prerequisites are unfinished; ask the user first.',
            },
          },
          ['id'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          const outcome = store.complete(args.id, args.done !== false, args.note, args.force === true)
          if (outcome && outcome.blocked) {
            return {
              completed: false,
              children: outcome.blockers.children,
              depends: outcome.blockers.depends,
              hint: '仍有未完成的子任务或前置任务。先向用户说明并确认；用户同意后再带 force=true 调用强制完成',
            }
          }
          return store.view(outcome)
        },
      },
    },
    {
      definition: {
        name: 'task_depends',
        description:
          'Replace a task’s prerequisite list. A task with an unfinished prerequisite shows as blocked. Cycles are rejected.',
        parameters: objectSchema(
          {
            id: { ...strings, description: 'Task id.' },
            dependsOn: {
              type: 'array',
              items: { type: 'string' },
              description: 'Prerequisite task ids; empty clears them.',
            },
          },
          ['id'],
        ),
        output: { schema: { type: 'object' }, render: renderJson },
        async execute(args) {
          return store.view(store.depends(args.id, args.dependsOn))
        },
      },
    },
  ]
}

function writeJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(text)
}

// Background uploads are data URLs, so the cap has to allow a large photo but
// still stop an unbounded buffer.
const MAX_BODY_BYTES = 32 * 1024 * 1024

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        req.destroy()
        reject(new Error('request body too large'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('request body is not valid JSON'))
      }
    })
    req.on('error', (error) => reject(error))
  })
}

export function apply(ctx, config = {}) {
  runtimeConfig = {
    studyMode: config.studyMode !== false,
    studyPanel: config.studyPanel !== false,
    studyDailyMinutes: Number(config.studyDailyMinutes) || 60,
  }
  // The plugin-level default seeds the settings table's default value.
  DEFAULT_SETTINGS.studyDailyMinutes = runtimeConfig.studyDailyMinutes
  const store = createStore()
  ctx.effect(() => () => store.close())
  // Existing registrations may predate the type/tag defaults.
  try {
    store.normalizeStudyItems()
    store.syncTagLibrary()
  } catch (error) {
    console.error('[life-planner] could not normalize study task items', error)
  }
  // Knowledge databases stay sealed across restarts; index.md must stay editable.
  try {
    store.normalizeLearningPermissions()
  } catch (error) {
    console.error('[life-planner] could not normalize learning permissions', error)
  }

  // One shared minute tick drives reminders and the age-based cleanup, so the
  // plugin needs no scheduler service and no session.
  ctx.effect(() => {
    const tick = () => {
      try {
        store.scan(new Date())
      } catch (error) {
        console.error('[life-planner] reminder scan failed', error)
      }
    }
    const handle = setInterval(tick, 60000)
    tick()
    return () => clearInterval(handle)
  })

  // One key decides visibility: the session id (the same value the header switch
  // and the /session route use). `agent.id` is only a fallback for older hosts.
  const sessionKeyFor = (agent) => {
    const sessionId = agent && agent.session && agent.session.id ? String(agent.session.id) : ''
    if (sessionId) return sessionId
    return agent && agent.id ? String(agent.id) : ''
  }

  const enabledFor = (agent) => {
    const key = sessionKeyFor(agent)
    return Boolean(key && store.isSessionEnabled(key))
  }

  // A study-mode conversation is itself a request to manage study data, so its
  // preset grants the tools without the per-session switch being flipped first.
  const studyPresetAgent = (agent) => {
    try {
      const presets = typeof ctx.get === 'function' ? ctx.get('agentPresets') : null
      return Boolean(
        presets && agent && agent.session && presets.presetForSession(agent.session) === 'study-teach',
      )
    } catch {
      return false
    }
  }

  for (const entry of buildTools(store)) {
    const isStudyTool = entry.definition.name.startsWith('study_')
    ctx.effect(() =>
      ctx.tools.register(entry.definition, {
        // Task tools follow the per-session switch; study-mode conversations get
        // them automatically so registration can happen on the first turn. The
        // plugin-level switch can retire every study tool at once.
        when: ({ agent }) => {
          if (isStudyTool && !runtimeConfig.studyMode) return false
          return enabledFor(agent) || studyPresetAgent(agent)
        },
      }),
    )
  }

  // A study-mode session gets a default entry immediately, so the page shows it
  // before the model has said anything; deleting the session removes it again.
  const sessionInfo = (agent) => {
    const session = agent && agent.session
    if (!session) return null
    const id = session.id ? String(session.id) : ''
    const cwd = (session.header && session.header.cwd) || session.cwd || ''
    return id ? { id, cwd: String(cwd || '') } : null
  }

  const canListen = typeof ctx.on === 'function'
  if (canListen) {
    ctx.effect(() =>
      ctx.on('agent/created', ({ agent }) => {
        try {
          const presets = typeof ctx.get === 'function' ? ctx.get('agentPresets') : null
          if (!presets || !agent || !agent.session) return
          if (presets.presetForSession(agent.session) !== 'study-teach') return
          const info = sessionInfo(agent)
          if (info) {
            // No task is created here any more: an empty task kept coming back
            // after deletion. The study page or the conversation creates one.
            // Only the session key is written; that is the key tools read.
            store.setSessionEnabled(info.id, true)
          }
        } catch (error) {
          console.error('[life-planner] could not bootstrap the study task', error)
        }
      }),
    )

  }

  // The Web carrier may still be starting when this entry activates. A cold
  // boot can run apply() before `webServer` and `connection` exist, and reading
  // them with ctx.get would silently skip route registration — the page then
  // sees 404 for every call. Declaring both as dependencies makes Cordis
  // re-enter this callback once they are ready.
  ctx.inject(['webServer', 'connection'], (webCtx) => {
    webCtx.effect(() =>
      webCtx.webServer.register({
        kind: 'prefix',
        path: API_PREFIX,
        handler: async (req, res) => {
          if (webCtx.connection.requestRejection(req) !== undefined) {
            writeJson(res, 403, { ok: false, error: 'forbidden' })
            return
          }
          const url = new URL(req.url || '/', 'http://dsh.internal')
          const method = url.pathname.startsWith(`${API_PREFIX}/`) ? url.pathname.slice(API_PREFIX.length + 1) : ''
          // The plugin-level switch retires the study data surface entirely; the
          // page then shows its empty state instead of an error.
          const gated = ['learning', 'study-tasks', 'shelf', 'mistakes', 'tip', 'habits', 'study-time']
          const gatedPrefixes = ['mistake.', 'shelf.', 'topic.', 'subject.', 'studytask.', 'study-time.']
          const gatedMethods = ['plan.generate', 'plan.done', 'plan.move', 'plan.materials', 'habit.beat']
          const isStudyMethod =
            gated.includes(method) ||
            gatedMethods.includes(method) ||
            gatedPrefixes.some((prefix) => method.startsWith(prefix))
          if (!runtimeConfig.studyPanel && isStudyMethod) {
            const empty = {
              learning: { subjects: [], topics: [], plan: [], mistakes: [] },
              'study-tasks': [],
              shelf: [],
              mistakes: [],
              tip: { day: '', text: '' },
              habits: { days: [], totalMinutes: 0, activeDays: 0, streak: 0, averageMinutes: 0, completionRate: 0 },
              'study-time': { weekStart: '', days: [] },
            }
            // Reads stay quiet so the page can render its empty state; writes
            // must fail loudly or the client would treat them as successful.
            if (req.method === 'GET') writeJson(res, 200, { ok: true, data: empty[method] })
            else writeJson(res, 403, { ok: false, error: 'study panel is disabled' })
            return
          }
          try {
            if (req.method === 'GET' && method === 'snapshot') {
              writeJson(res, 200, { ok: true, data: store.snapshot() })
              return
            }
            if (req.method === 'GET' && method === 'session') {
              const sessionId = url.searchParams.get('sessionId') || ''
              writeJson(res, 200, { ok: true, data: { enabled: store.isSessionEnabled(sessionId) } })
              return
            }
            if (req.method === 'GET' && method === 'ui') {
              writeJson(res, 200, {
                ok: true,
                data: {
                  appearance: store.readUiState('appearance'),
                  skins: store.readUiState('skins'),
                },
              })
              return
            }
            if (req.method === 'GET' && method === 'settings') {
              // An empty library is seeded from tags the tasks already carry.
              try {
                store.syncTagLibrary()
              } catch {
                // Seeding is best effort; settings still render.
              }
              writeJson(res, 200, { ok: true, data: store.readSettings() })
              return
            }
            if (req.method === 'GET' && method === 'notifications') {
              writeJson(res, 200, { ok: true, data: store.pendingNotifications() })
              return
            }
            if (req.method === 'GET' && method === 'export') {
              writeJson(res, 200, { ok: true, data: store.exportData() })
              return
            }
            if (req.method === 'GET' && method === 'learning') {
              writeJson(res, 200, { ok: true, data: store.listLearning() })
              return
            }
            if (req.method === 'GET' && method === 'shelf') {
              writeJson(res, 200, { ok: true, data: store.shelfList() })
              return
            }
            if (req.method === 'GET' && method === 'mistakes') {
              writeJson(res, 200, { ok: true, data: store.mistakeList() })
              return
            }
            if (req.method === 'GET' && method === 'study-tasks') {
              writeJson(res, 200, { ok: true, data: store.listStudyTasks() })
              return
            }
            if (req.method === 'GET' && method === 'habits') {
              writeJson(res, 200, { ok: true, data: store.studyHabitSummary() })
              return
            }
            if (req.method === 'GET' && method === 'background') {
              const requested = url.searchParams.get('area')
              const area = requested === 'study' ? 'study' : requested === 'default' ? 'default' : 'planning'
              const file = area === 'default' ? (existsSync(DEFAULT_BACKGROUND) ? DEFAULT_BACKGROUND : null) : backgroundFile(area)
              if (!file) {
                res.writeHead(404)
                res.end('no background')
                return
              }
              const ext = file.split('.').pop().toLowerCase()
              // A versioned URL never changes, so the shell may keep it for good;
              // an unversioned one must not be cached.
              const versioned = url.searchParams.has('v')
              res.writeHead(200, {
                'content-type': BACKGROUND_MIME[ext] || 'application/octet-stream',
                'cache-control': versioned ? 'private, max-age=31536000, immutable' : 'no-store',
              })
              res.end(readFileSync(file))
              return
            }
            if (req.method === 'GET' && method === 'background.info') {
              writeJson(res, 200, {
                ok: true,
                data: {
                  dir: BACKGROUND_DIR,
                  default: existsSync(DEFAULT_BACKGROUND) ? DEFAULT_BACKGROUND_URL : null,
                  planning: backgroundUrl('planning'),
                  study: backgroundUrl('study'),
                },
              })
              return
            }
            if (req.method === 'GET' && method === 'tip') {
              writeJson(res, 200, { ok: true, data: store.todayTip() })
              return
            }
            if (req.method === 'GET' && method === 'study-time') {
              writeJson(res, 200, { ok: true, data: store.studyTimeWeek(url.searchParams.get('week') || undefined) })
              return
            }
            if (req.method === 'GET' && method === 'config') {
              writeJson(res, 200, { ok: true, data: runtimeConfig })
              return
            }
            if (req.method !== 'POST') {
              writeJson(res, 405, { ok: false, error: 'method not allowed' })
              return
            }
            const body = await readBody(req)
            switch (method) {
              case 'session.toggle': {
                const sessionId = String(body.sessionId || '').trim()
                if (!sessionId) throw new Error('sessionId is required')
                const enabled = store.setSessionEnabled(sessionId, body.enabled === true)
                writeJson(res, 200, { ok: true, data: { enabled } })
                return
              }
              case 'item.add': {
                writeJson(res, 200, { ok: true, data: store.view(store.addItem(body)) })
                return
              }
              case 'item.update': {
                writeJson(res, 200, { ok: true, data: store.view(store.updateItem(body.id, body.patch || body)) })
                return
              }
              case 'item.complete': {
                const outcome = store.complete(body.id, body.done !== false, body.note, body.force === true)
                writeJson(res, 200, { ok: true, data: outcome && outcome.blocked ? outcome : store.view(outcome) })
                return
              }
              case 'item.archive': {
                writeJson(res, 200, { ok: true, data: store.view(store.archive(body.id)) })
                return
              }
              case 'item.restore': {
                writeJson(res, 200, { ok: true, data: store.view(store.restore(body.id)) })
                return
              }
              case 'subject.add': {
                writeJson(res, 200, { ok: true, data: store.addSubject(body) })
                return
              }
              case 'subject.update': {
                writeJson(res, 200, { ok: true, data: store.updateSubject(body.id, body.patch || body) })
                return
              }
              case 'topic.add': {
                writeJson(res, 200, { ok: true, data: store.addTopic(body) })
                return
              }
              case 'plan.generate': {
                writeJson(res, 200, { ok: true, data: store.generatePlan(body.subjectId) })
                return
              }
              case 'plan.done': {
                writeJson(res, 200, { ok: true, data: store.completePlan(body.id) })
                return
              }
              case 'plan.move': {
                writeJson(res, 200, { ok: true, data: store.updatePlanDate(body.id, body.date) })
                return
              }
              case 'studytask.register': {
                writeJson(res, 200, { ok: true, data: store.registerStudyTask(body) })
                return
              }
              case 'habit.beat': {
                writeJson(res, 200, { ok: true, data: store.recordStudyBeat() })
                return
              }
              case 'studytask.update': {
                writeJson(res, 200, { ok: true, data: store.updateStudyTask(body.id, body.patch || body) })
                return
              }
              case 'studytask.materials': {
                writeJson(res, 200, { ok: true, data: store.setStudyTaskMaterials(body.id, body.shelfIds) })
                return
              }
              case 'studytask.target': {
                const hasSplit = body.dailyNew !== undefined || body.dailyReview !== undefined
                if (!hasSplit && Number.isFinite(Number(body.dailyTarget))) {
                  const total = Math.max(1, Math.min(200, Math.round(Number(body.dailyTarget))))
                  const nextNew = Math.max(1, Math.round(total / 3))
                  writeJson(res, 200, { ok: true, data: store.setStudyTarget(body.id, nextNew, total - nextNew) })
                  return
                }
                writeJson(res, 200, {
                  ok: true,
                  data: store.setStudyTarget(body.id, body.dailyNew, body.dailyReview),
                })
                return
              }
              case 'background.set': {
                writeJson(res, 200, { ok: true, data: saveBackgroundImage(body.area, body.dataUrl) })
                return
              }
              case 'background.clear': {
                writeJson(res, 200, { ok: true, data: clearBackgroundImage(body.area) })
                return
              }
              case 'ui.save': {
                if (body.appearance !== undefined) store.saveUiState('appearance', body.appearance)
                if (body.skins !== undefined) store.saveUiState('skins', body.skins)
                writeJson(res, 200, { ok: true, data: { saved: true } })
                return
              }
              case 'background.open': {
                writeJson(res, 200, { ok: true, data: openBackgroundFolder() })
                return
              }
              // No UI writes this; the study conversation plans the week through
              // its tools, and the habit page only reads the result.
              case 'study-time.set': {
                writeJson(res, 200, { ok: true, data: store.setStudyTimeWeek(body.entries) })
                return
              }
              case 'shelf.import': {
                writeJson(res, 200, { ok: true, data: store.importShelfToTask(body.shelfId, body.taskId) })
                return
              }
              case 'studytask.delete': {
                writeJson(res, 200, { ok: true, data: store.deleteStudyTask(body.id) })
                return
              }
              case 'studytask.summary': {
                writeJson(res, 200, { ok: true, data: store.setStudyTaskSummary(body.id, body.summary) })
                return
              }
              case 'plan.today': {
                writeJson(res, 200, { ok: true, data: store.planToday() })
                return
              }
              case 'shelf.add': {
                writeJson(res, 200, { ok: true, data: store.shelfAdd(body) })
                return
              }
              case 'mistake.add': {
                writeJson(res, 200, { ok: true, data: store.addMistake(body) })
                return
              }
              case 'mistake.update': {
                writeJson(res, 200, { ok: true, data: store.updateMistake(body.id, body.patch || body) })
                return
              }
              case 'mistake.brief': {
                writeJson(res, 200, { ok: true, data: store.mistakeBrief(body.id) })
                return
              }
              case 'mistake.review': {
                writeJson(res, 200, { ok: true, data: store.reviewMistake(body.id, body.days) })
                return
              }
              case 'mistake.delete': {
                writeJson(res, 200, { ok: true, data: store.deleteMistake(body.id) })
                return
              }
              case 'shelf.refresh': {
                writeJson(res, 200, { ok: true, data: store.shelfRefresh(body.id) })
                return
              }
              case 'shelf.tag': {
                writeJson(res, 200, { ok: true, data: store.shelfTag(body.id, body.tags) })
                return
              }
              case 'shelf.open': {
                writeJson(res, 200, { ok: true, data: store.shelfOpen(body.id) })
                return
              }
              case 'shelf.update': {
                writeJson(res, 200, { ok: true, data: store.shelfUpdate(body.id, body.patch || body) })
                return
              }
              case 'shelf.delete': {
                writeJson(res, 200, { ok: true, data: store.shelfDelete(body.id) })
                return
              }
              case 'plan.materials': {
                writeJson(res, 200, { ok: true, data: store.linkMaterials(body.planId, body.shelfIds) })
                return
              }
              case 'topic.mastery': {
                writeJson(res, 200, { ok: true, data: store.setMastery(body.id, body.mastery, body.reviewAt) })
                return
              }
              case 'item.undelete': {
                writeJson(res, 200, { ok: true, data: store.view(store.undelete(body.id)) })
                return
              }
              case 'item.reorder': {
                writeJson(res, 200, { ok: true, data: store.view(store.reorder(body.id, body.direction)) })
                return
              }
              case 'item.move': {
                writeJson(res, 200, {
                  ok: true,
                  data: store.view(store.move(body.id, body.parentId, body.beforeId)),
                })
                return
              }
              case 'item.delete': {
                writeJson(res, 200, { ok: true, data: store.deleteItem(body.id) })
                return
              }
              case 'item.depends': {
                writeJson(res, 200, { ok: true, data: store.view(store.depends(body.id, body.dependsOn)) })
                return
              }
              case 'plan.save': {
                writeJson(res, 200, { ok: true, data: store.savePlan(body.bodyMarkdown) })
                return
              }
              case 'settings.save': {
                writeJson(res, 200, { ok: true, data: store.saveSettings(body.patch || body) })
                return
              }
              case 'import': {
                writeJson(res, 200, { ok: true, data: store.importData(body.payload) })
                return
              }
              case 'notifications.ack': {
                store.ackNotifications(body.ids || [])
                writeJson(res, 200, { ok: true, data: { acked: (body.ids || []).length } })
                return
              }
              case 'dev.scan': {
                // Debug hook, only mounted when LIFE_PLANNER_DEV=1.
                if (!DEV) {
                  writeJson(res, 404, { ok: false, error: 'unknown method: dev.scan' })
                  return
                }
                store.scan(body.at ? new Date(body.at) : new Date())
                writeJson(res, 200, { ok: true, data: {} })
                return
              }
              default:
                writeJson(res, 404, { ok: false, error: `unknown method: ${method}` })
                return
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            // Validation problems are the caller's fault (400); anything else is
            // ours, so it is logged and reported without leaking internals.
            const isValidation =
              /required|not found|invalid|unknown|too large|unsupported|must be|cannot|不能|必须|无效|不存在|不支持|重复/.test(
                message,
              )
            if (isValidation) {
              writeJson(res, 400, { ok: false, error: message })
            } else {
              console.error('[life-planner] request failed', message)
              writeJson(res, 500, { ok: false, error: 'internal error' })
            }
          }
        },
      }),
    )
  })
}
