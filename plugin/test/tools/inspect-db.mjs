/** Print the live plugin database summary: node plugin/test/inspect-db.mjs */
import { DatabaseSync } from 'node:sqlite'
import { homedir } from 'node:os'
import { join } from 'node:path'

const file = process.argv[2] || join(homedir(), '.dsh', 'life-planner', 'data.db')
const db = new DatabaseSync(file)

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
console.log('file:', file)
console.log('tables:', tables.map((row) => row.name).join(', '))

const columns = db.prepare('PRAGMA table_info(items)').all().map((column) => column.name)
console.log('item columns:', columns.join(', '))

const count = (sql) => db.prepare(sql).get().n
console.log('items:', count('SELECT COUNT(*) AS n FROM items'))
console.log('completed:', count('SELECT COUNT(*) AS n FROM items WHERE completed_at IS NOT NULL'))
console.log('archived:', count('SELECT COUNT(*) AS n FROM items WHERE archived_at IS NOT NULL'))
console.log('with due date:', count('SELECT COUNT(*) AS n FROM items WHERE due_at IS NOT NULL'))
console.log('root items:', count("SELECT COUNT(*) AS n FROM items WHERE parent_id IS NULL"))
console.log('session flags:', count('SELECT COUNT(*) AS n FROM session_flags'))
console.log('journal_mode:', db.prepare('PRAGMA journal_mode').get().journal_mode)

for (const table of ['settings', 'notifications']) {
  try {
    console.log(`${table}:`, count(`SELECT COUNT(*) AS n FROM ${table}`))
  } catch {
    console.log(`${table}: MISSING (host has not restarted with the new schema)`)
  }
}

const rows = db.prepare('SELECT id, kind, title, parent_id, ord, due_at FROM items ORDER BY created_at LIMIT 5').all()
if (rows.length > 0) {
  console.log('sample rows:')
  for (const row of rows) {
    console.log(`  ${row.kind} | ${row.title} | parent=${row.parent_id ?? '-'} | ord=${row.ord} | due=${row.due_at ?? '-'}`)
  }
}

db.close()
