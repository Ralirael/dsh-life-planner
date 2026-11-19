/**
 * Runtime probe for the parts of the host half that depend on the real process,
 * not on the fake Cordis context the smoke tests build: `node:sqlite`, the
 * read-only knowledge.db seal, `study_run_program` re-spawning `process.execPath`,
 * directory scans and the PDF extractor.
 *
 * Run it with the same binary the DSH desktop uses for its Host process, so
 * `process.execPath` and the inherited environment match production:
 *
 *   ELECTRON_RUN_AS_NODE=1 "/Applications/DeepSeek Harness.app/Contents/MacOS/DeepSeek Harness" \
 *     plugin/test/tools/runtime-probe.mjs
 *
 * On Windows the equivalent is the packaged `DeepSeek Harness.exe` with
 * ELECTRON_RUN_AS_NODE=1, or plain `node` for a quick check (the spawn test then
 * only proves the plain-Node path).
 *
 * It is a diagnostic, not part of the acceptance suite: it never touches the
 * real data directory because DSH_HOME points at a fresh temp dir.
 */

import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { appendFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const home = await mkdtemp(join(tmpdir(), 'life-planner-probe-'))
process.env.DSH_HOME = home
process.env.LIFE_PLANNER_DEV = '1'

let failures = 0
function check(label, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'ok  ' : 'FAIL'} - ${label}${detail ? ` [${detail}]` : ''}`)
}
const info = (label, value) => console.log(`     ${label}: ${value}`)
const mode = (path) => (statSync(path).mode & 0o777).toString(8).padStart(3, '0')

const { apply } = await import('../../index.js')

const tools = new Map()
const effect = (fn) => {
  const dispose = fn()
  return typeof dispose === 'function' ? dispose : () => {}
}
const child = {
  effect,
  webServer: { register: () => () => {} },
  connection: { requestRejection: () => undefined },
}
const ctx = {
  effect,
  tools: {
    register(definition) {
      tools.set(definition.name, definition)
      return () => {}
    },
  },
  get: () => undefined,
  inject: (_deps, callback) => {
    callback(child)
    return () => {}
  },
  on: () => () => {},
}
apply(ctx, {})
const call = async (name, args) => JSON.parse(JSON.stringify(await tools.get(name).execute(args || {}, {})))

console.log('--- runtime ---')
info('node', process.versions.node)
info('electron', process.versions.electron || 'none')
info('platform', `${process.platform}/${process.arch}`)
info('execPath', process.execPath)
info('ELECTRON_RUN_AS_NODE', process.env.ELECTRON_RUN_AS_NODE || 'unset')

check('all 43 host tools register', tools.size === 43, `${tools.size}`)

// --- node:sqlite, the storage the whole plugin depends on ---------------------
let DatabaseSync = null
try {
  const sqlite = await import('node:sqlite')
  DatabaseSync = sqlite.DatabaseSync
} catch (error) {
  info('import error', error.message)
}
check('node:sqlite resolves in this runtime', typeof DatabaseSync === 'function')

// --- Electron reachability: decides whether system notifications can fire ----
let electronKind = 'unavailable'
try {
  const electron = createRequire(import.meta.url)('electron')
  electronKind = electron && typeof electron.Notification === 'function' ? 'Notification' : typeof electron
} catch (error) {
  electronKind = `unresolved (${error.code || 'threw'})`
}
info('electron module', electronKind)
info(
  'system notifications',
  electronKind === 'Notification' ? 'available' : 'unavailable - reminders stay in-app',
)

// --- study workspace, knowledge.db and the read-only seal --------------------
const space = join(home, 'workspace')
await mkdir(join(space, 'learning'), { recursive: true })
const task = await call('study_register_task', {
  title: 'probe',
  workspacePath: space,
  template: 'word-bank',
  dailyNew: 2,
  dailyReview: 2,
})
check('study task registers with an absolute POSIX workspace', Boolean(task.id), space)

const dbPath = join(space, 'learning', 'knowledge.db')
const stamp = new Date().toISOString()
const created = new DatabaseSync(dbPath)
created.exec(`
  CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    extra TEXT DEFAULT '',
    proficiency INTEGER NOT NULL DEFAULT 4,
    learned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT
  );
`)
const insert = created.prepare(
  'INSERT INTO cards (id, front, back, proficiency, learned, created_at, updated_at) VALUES (?,?,?,?,?,?,?)',
)
for (let index = 0; index < 4; index += 1) {
  insert.run(`probe-${index}`, `正面 ${index}`, `back ${index}`, 4, 0, stamp, stamp)
}
created.close()
info('knowledge.db mode after creation', mode(dbPath))

const quiz = await call('study_next_questions', { taskId: task.id, count: 2 })
check('questions read from a sealed knowledge.db', quiz.questions.length === 2, `pool new ${quiz.poolNew}`)

const graded = await call('study_answer', { taskId: task.id, itemId: quiz.questions[0].itemId, correct: true })
check('study_answer records and re-seals', graded.mastered === false && mode(dbPath) === '444', `mode ${mode(dbPath)}`)

let blocked = false
try {
  appendFileSync(dbPath, 'x')
} catch (error) {
  blocked = error.code === 'EACCES' || error.code === 'EPERM'
}
check('a plain file write cannot bypass the seal', blocked)

// --- study_run_program: spawns process.execPath inside the workspace ---------
const program = await call('study_run_program', {
  taskId: task.id,
  code: `
import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'
const db = new DatabaseSync('learning/knowledge.db')
db.exec('CREATE TABLE IF NOT EXISTS probe_marker (id TEXT)')
db.prepare('INSERT INTO probe_marker (id) VALUES (?)').run(process.env.LP_TASK_ID)
db.close()
writeFileSync('learning/.probe.txt', process.env.LP_WORKSPACE)
console.log('PROBE_OK ' + process.cwd())
`,
  timeoutMs: 30000,
})
check(
  'study_run_program executes under process.execPath',
  program.exitCode === 0 && program.stdout.includes('PROBE_OK'),
  `exit ${program.exitCode}${program.stderr ? ` stderr ${program.stderr.slice(0, 160)}` : ''}`,
)
check('the program ran with cwd = workspace', String(program.stdout).includes(space))
check('the program left a marker inside the workspace', existsSync(join(space, 'learning', '.probe.txt')))
check('the seal is restored after the program', mode(dbPath) === '444', `mode ${mode(dbPath)}`)

const after = new DatabaseSync(dbPath, { readOnly: true })
const marker = after.prepare('SELECT COUNT(*) AS n FROM probe_marker').get()
after.close()
check('the program actually wrote to knowledge.db', Number(marker.n) === 1, `rows ${marker.n}`)

// --- directory scan: macOS litter must not reach the shelf listing ----------
const shelfDir = join(home, 'shelf')
await mkdir(join(shelfDir, 'nested'), { recursive: true })
await writeFile(join(shelfDir, 'a.txt'), 'a')
await writeFile(join(shelfDir, 'nested', 'b.txt'), 'b')
await writeFile(join(shelfDir, '.DS_Store'), 'junk')
const shelved = await call('study_shelf_add', { kind: 'dir', path: shelfDir })
const listing = shelved.listing || []
// `readdirSync(..., { recursive: true })` reports the nested directory itself as
// well as its children, so a.txt + nested + nested/b.txt is the full listing.
check(
  'directory scan lists files and nested paths',
  listing.includes('a.txt') && listing.includes(join('nested', 'b.txt')),
  listing.join(', '),
)
check('.DS_Store is filtered out', !listing.some((entry) => entry.endsWith('.DS_Store')))
const again = await call('study_shelf_add', { kind: 'dir', path: shelfDir, tags: ['probe'] })
check('a repeated absolute path dedupes', again.deduped === true && again.id === shelved.id)

// --- PDF extraction: pdftotext when present, PDFKit on macOS otherwise ------
// A hand-written single-page PDF keeps this portable: both engines read it.
const pdfStream = 'BT /F1 18 Tf 20 50 Td (Hello PDF probe) Tj ET'
const pdfSource = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${pdfStream.length} >> stream
${pdfStream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
trailer << /Root 1 0 R /Size 6 >>
%%EOF
`
await writeFile(join(space, 'learning', 'probe.pdf'), pdfSource)
let pdf = null
let pdfError = ''
try {
  pdf = await call('study_pdf_text', { taskId: task.id, relative: 'learning/probe.pdf' })
} catch (error) {
  pdfError = String(error.message || error)
}
check(
  'PDF text is extracted with an available engine',
  Boolean(pdf) && /Hello PDF probe/.test(pdf.content),
  pdf ? `${pdf.engine}, ${pdf.chars} chars` : pdfError.slice(0, 160),
)

// --- data directory: everything landed under the temp DSH_HOME --------------
const indexPath = join(home, 'life-planner', 'data.db')
check('the SQLite index lives under DSH_HOME', existsSync(indexPath), indexPath)
const indexMode = mode(indexPath)
check('the index database is writable', indexMode !== '444', `mode ${indexMode}`)

// --- native reminder notification (macOS) -----------------------------------
// A second activation scans immediately, so a due item is picked up without
// waiting for the one-minute tick. host_notified = 1 proves the notifier was
// actually launched (on this build that is osascript, not Electron).
if (process.platform === 'darwin') {
  const index = new DatabaseSync(indexPath)
  const window = JSON.stringify('00:00-23:59')
  const upsert = index.prepare(
    'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
  )
  upsert.run('weekdayWindows', window)
  upsert.run('weekendWindows', window)
  const now = new Date().toISOString()
  const due = new Date(Date.now() - 60 * 1000).toISOString()
  index
    .prepare(
      'INSERT INTO items (id,kind,title,note,status,priority,depends_on,created_at,updated_at,due_at,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    )
    .run('probe-reminder', 'task', '通知探针', '', 'todo', '5', '[]', now, now, due, '[]')
  index.close()

  const second = new Map()
  const secondCtx = {
    effect,
    tools: {
      register(definition) {
        second.set(definition.name, definition)
        return () => {}
      },
    },
    get: () => undefined,
    inject: (_deps, callback) => {
      callback(child)
      return () => {}
    },
    on: () => () => {},
  }
  apply(secondCtx, {})

  const read = new DatabaseSync(indexPath, { readOnly: true })
  const row = read.prepare("SELECT kind, host_notified FROM notifications WHERE item_id='probe-reminder'").get()
  read.close()
  check(
    'a due reminder launches the native notifier',
    Boolean(row) && Number(row.host_notified) === 1,
    row ? `host_notified=${row.host_notified}` : 'no notification row',
  )
}

console.log(`\n${failures === 0 ? 'runtime probe passed' : `runtime probe FAILED (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
