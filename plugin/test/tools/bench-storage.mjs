/**
 * Storage-shape benchmark: JSON file vs node:sqlite at a realistic size.
 * Run: node plugin/test/bench-storage.mjs
 */

import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const N = 2000
const dir = mkdtempSync(join(tmpdir(), 'life-planner-bench-'))
const today = new Date().toISOString().slice(0, 10)

function makeItems(count) {
  const items = []
  for (let index = 0; index < count; index += 1) {
    const day = new Date(Date.now() + ((index % 60) - 20) * 86400000).toISOString().slice(0, 10)
    items.push({
      id: `task-${index.toString(36).padStart(4, '0')}`,
      kind: index % 10 === 0 ? 'project' : 'task',
      title: `任务 ${index}：整理第 ${index % 12} 章笔记`,
      parentId: null,
      order: index,
      note: '',
      status: 'todo',
      priority: ['high', 'medium', 'low'][index % 3],
      dependsOn: index % 7 === 0 && index > 0 ? [`task-${(index - 1).toString(36).padStart(4, '0')}`] : [],
      dueAt: `${day}T09:00:00.000Z`,
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    })
  }
  return items
}

const items = makeItems(N)
const ms = (start) => Math.round(performance.now() - start)

// ---- JSON file -------------------------------------------------------------
const jsonPath = join(dir, 'data.json')
let start = performance.now()
const text = JSON.stringify(items, null, 2)
const stringifyMs = ms(start)
start = performance.now()
writeFileSync(jsonPath, text, 'utf8')
const writeMs = ms(start)
start = performance.now()
const parsed = JSON.parse(readFileSync(jsonPath, 'utf8'))
const readParseMs = ms(start)
const jsonBytes = statSync(jsonPath).size

start = performance.now()
const overdueJson = parsed.filter((item) => item.dueAt.slice(0, 10) < today)
const scanMs = ms(start)

// ---- SQLite ----------------------------------------------------------------
const dbPath = join(dir, 'data.db')
const db = new DatabaseSync(dbPath)
db.exec(`
  CREATE TABLE items (
    id TEXT PRIMARY KEY, kind TEXT, title TEXT, parent_id TEXT, ord INTEGER,
    status TEXT, priority TEXT, due_at TEXT, depends_on TEXT, created_at TEXT
  );
  CREATE INDEX items_due ON items(due_at);
`)

start = performance.now()
const insert = db.prepare(
  'INSERT INTO items (id,kind,title,parent_id,ord,status,priority,due_at,depends_on,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
)
db.exec('BEGIN')
for (const item of items) {
  insert.run(
    item.id,
    item.kind,
    item.title,
    item.parentId,
    item.order,
    item.status,
    item.priority,
    item.dueAt,
    JSON.stringify(item.dependsOn),
    item.createdAt,
  )
}
db.exec('COMMIT')
const insertMs = ms(start)

start = performance.now()
const overdueRows = db.prepare('SELECT id,title,due_at FROM items WHERE due_at < ? ORDER BY due_at LIMIT 20').all(today)
const queryMs = ms(start)
db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
db.close()
const dbBytes = statSync(dbPath).size

// ---- What the model actually reads ----------------------------------------
const fullDump = JSON.stringify(items)
const shaped = JSON.stringify(
  overdueRows.map((row) => ({ id: row.id, title: row.title, dueAt: row.due_at })),
)
const bytesToTokens = (bytes) => Math.round(bytes / 3.2)

console.log(`dataset: ${N} items\n`)
console.log('JSON file')
console.log(`  size on disk      ${(jsonBytes / 1024).toFixed(1)} KiB`)
console.log(`  stringify         ${stringifyMs} ms`)
console.log(`  write             ${writeMs} ms`)
console.log(`  read + parse      ${readParseMs} ms`)
console.log(`  in-memory filter  ${scanMs} ms (${overdueJson.length} matches)\n`)
console.log('SQLite (node:sqlite)')
console.log(`  size on disk      ${(dbBytes / 1024).toFixed(1)} KiB`)
console.log(`  insert ${N} rows   ${insertMs} ms`)
console.log(`  indexed query     ${queryMs} ms (${overdueRows.length} rows)\n`)
console.log('Model-facing result size')
console.log(`  full item dump    ${(fullDump.length / 1024).toFixed(1)} KiB  ~${bytesToTokens(fullDump.length)} tokens`)
console.log(`  top-20 shaped     ${(shaped.length / 1024).toFixed(1)} KiB  ~${bytesToTokens(shaped.length)} tokens`)
console.log(`  shaping saves     ${(((fullDump.length - shaped.length) / fullDump.length) * 100).toFixed(1)}% of the result payload`)
