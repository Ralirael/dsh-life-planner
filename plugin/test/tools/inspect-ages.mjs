/** Show the archived rows and their ages, to predict what the first auto-scan will touch. */
import { DatabaseSync } from 'node:sqlite'
import { homedir } from 'node:os'
import { join } from 'node:path'

const file = process.argv[2] || join(homedir(), '.dsh', 'life-planner', 'data.db')
const db = new DatabaseSync(file)
const now = Date.now()
const days = (iso) => (iso ? Math.round((now - new Date(iso).getTime()) / 86400000) : null)

const rows = db
  .prepare('SELECT id, title, completed_at, archived_at, updated_at, created_at FROM items WHERE archived_at IS NOT NULL OR completed_at IS NOT NULL')
  .all()
if (rows.length === 0) console.log('no completed or archived rows')
for (const row of rows) {
  console.log(
    `archived=${row.archived_at ? days(row.archived_at) + 'd' : '-'} completed=${
      row.completed_at ? days(row.completed_at) + 'd' : '-'
    } sinceUpdate=${days(row.updated_at || row.created_at)}d | ${row.title}`,
  )
}
db.close()
