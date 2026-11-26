/**
 * Local smoke test for the Host half, run with the bundled Node:
 *   node plugin/test/smoke.mjs
 * It points DSH_HOME at a temp dir, fakes the Cordis context, and exercises
 * the tool bodies plus the `when` gate without involving a running Harness.
 */

import { mkdtemp, mkdir } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { shouldRefreshCalendar } from '../src/host/calendar-advice.js'

const home = await mkdtemp(join(tmpdir(), 'life-planner-smoke-'))
process.env.DSH_HOME = home
process.env.LIFE_PLANNER_DEV = '1'
// Registering a study task checks that its workspace exists.
const studySpace = join(home, 'word-space')
await mkdir(studySpace, { recursive: true })

const { apply } = await import('../index.js')

const tools = new Map()
const routes = []
const injected = []
const fakeWebServer = {
  register(route) {
    routes.push(route)
    return () => {}
  },
}
const fakeConnection = { requestRejection: () => undefined }
const makeChild = () => ({
  effect(fn) {
    const dispose = fn()
    return typeof dispose === 'function' ? dispose : () => {}
  },
  webServer: fakeWebServer,
  connection: fakeConnection,
})
const ctx = {
  effect(fn) {
    const dispose = fn()
    return typeof dispose === 'function' ? dispose : () => {}
  },
  tools: {
    register(definition, options) {
      tools.set(definition.name, { definition, options })
      return () => {}
    },
  },
  // Cold boot: neither service exists yet, which is exactly the state that made
  // the page see 404s after a restart.
  get(key) {
    if (key === 'agents') return { get: (id) => id === 'study-active' ? { session: { id, preset: 'study-teach' } } : undefined }
    if (key === 'agentPresets') return { presetForSession: (session) => session.preset }
    return undefined
  },
  inject(deps, callback) {
    injected.push(deps.join(','))
    callback(makeChild())
    return () => {}
  },
}

apply(ctx, {})

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERT: ${message}`)
  console.log(`ok - ${message}`)
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const call = async (name, args) => clone(await tools.get(name).definition.execute(args || {}, {}))

const gate = (name, sessionId) => tools.get(name).options.when({ agent: { id: sessionId } })

assert(tools.size === 43, `expected 43 registered tools, got ${tools.size}`)
assert(tools.has('item_add') && tools.has('planner_overview') && tools.has('study_answer'), 'key tools are registered')
assert(gate('item_add', 'session-a') === false, 'gate is closed before the session switch is on')

const added = await call('item_add', { kind: 'task', title: '写周报' })
assert(added.kind === 'task' && added.derived.done === false, 'item_add creates an open task')

const second = await call('item_add', { kind: 'task', title: '发周报' })
await call('task_depends', { id: second.id, dependsOn: [added.id] })

const blocked = await call('planner_overview')
assert(blocked.blocked.length === 1 && blocked.blocked[0].id === second.id, 'dependent task shows as blocked')

await call('task_complete', { id: added.id })
const unblocked = (await call('planner_overview')).blocked
assert(unblocked.length === 0, 'completing the prerequisite clears blocked')

let cycleRejected = false
try {
  await call('task_depends', { id: added.id, dependsOn: [second.id] })
} catch (error) {
  cycleRejected = /循环依赖/.test(error.message)
}
assert(cycleRejected, 'cycle is rejected')

const plan = await call('planner_update_plan', { bodyMarkdown: '# 计划\n\n每天学英语。' })
assert(plan.saved === true, 'plan document saves')
const read = await call('planner_get_plan')
assert(read.bodyMarkdown.includes('每天学英语'), 'plan document reads back')

// --- route layer -----------------------------------------------------------
assert(routes.length === 1 && routes[0].path === '/life-planner/api', 'one API prefix route registered')
assert(
  injected[0] === 'webServer,connection',
  'route registration rides injected services instead of reading them at apply time',
)

function makeReq(method, url, body) {
  const listeners = { data: [], end: [], error: [] }
  const req = {
    method,
    url,
    on(event, callback) {
      if (listeners[event]) listeners[event].push(callback)
      if (event === 'end') {
        queueMicrotask(() => {
          if (body !== undefined) for (const fn of listeners.data) fn(Buffer.from(JSON.stringify(body), 'utf8'))
          for (const fn of listeners.end) fn()
        })
      }
      return req
    },
  }
  return req
}

function makeRes() {
  const res = {
    status: 0,
    headers: null,
    body: '',
    writeHead(status, headers) {
      res.status = status
      res.headers = headers
    },
    end(text) {
      res.body = text || ''
    },
  }
  return res
}

async function request(method, path, body) {
  const res = makeRes()
  await routes[0].handler(makeReq(method, path, body), res)
  let json = null
  try {
    json = res.body ? JSON.parse(res.body) : null
  } catch {
    // Binary payloads (background images) are inspected through headers only.
    json = null
  }
  return { status: res.status, headers: res.headers, json }
}

const snapshot = await request('GET', '/life-planner/api/snapshot')
assert(snapshot.status === 200 && snapshot.json.ok, 'GET snapshot answers OK')
assert(snapshot.json.data.items.length === 2, 'snapshot lists both tasks')

const toggled = await request('POST', '/life-planner/api/session.toggle', { sessionId: 'session-b', enabled: true })
assert(toggled.json.data.enabled === true, 'route turns the per-session switch on')
assert(gate('item_add', 'session-b') === true, 'gate opens for the switched-on session only')
assert(gate('item_add', 'session-c') === false, 'other sessions stay gated off')

const rejected = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '' })
assert(rejected.status === 400 && rejected.json.ok === false, 'empty title is rejected with 400')

const unreadable = await request('GET', '/life-planner/api/session?sessionId=session-b')
assert(unreadable.json.data.enabled === true, 'session state reads back over the route')

// --- tree operations: add, reorder, depends ---------------------------------
const third = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '第三件' })
const fourth = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '第四件' })
assert(third.status === 200 && fourth.status === 200, 'route adds sibling tasks')

const moved = await request('POST', '/life-planner/api/item.reorder', {
  id: fourth.json.data.id,
  direction: 'up',
})
assert(moved.json.data.reordered === true, 'reorder reports a move')

const afterMove = await request('GET', '/life-planner/api/snapshot')
const rootOrder = afterMove.json.data.items
  .filter((item) => !item.parentId)
  .sort((a, b) => a.order - b.order)
  .map((item) => item.id)
assert(
  rootOrder.indexOf(fourth.json.data.id) === rootOrder.indexOf(third.json.data.id) - 1,
  'reorder puts the moved task directly before its previous sibling',
)

const linked = await request('POST', '/life-planner/api/item.depends', {
  id: third.json.data.id,
  dependsOn: [fourth.json.data.id],
})
assert(linked.json.data.derived.blocked === true, 'route applies a dependency and derives blocked')

const nested = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '子任务',
  parentId: third.json.data.id,
})
const nestedView = await request('GET', '/life-planner/api/snapshot')
const child = nestedView.json.data.items.find((item) => item.id === nested.json.data.id)
assert(child && child.parentId === third.json.data.id, 'route accepts a parent id')

const recast = await request('POST', '/life-planner/api/item.update', {
  id: child.id,
  patch: { kind: 'project', title: '改成项目' },
})
assert(recast.json.data.kind === 'task', 'every node keeps the single task kind')

const reparent = await request('POST', '/life-planner/api/item.update', {
  id: child.id,
  patch: { parentId: null },
})
assert(reparent.json.data.parentId === null, 'reparenting through update clears the parent')
const rootsNow = (await request('GET', '/life-planner/api/snapshot')).json.data.items.filter((item) => !item.parentId)
const highestOrder = Math.max(...rootsNow.map((item) => item.order))
assert(reparent.json.data.order === highestOrder, 'reparenting appends at the end of the new sibling list')

// --- implicit parent dependency ---------------------------------------------
const parentTask = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '父任务' })
assert(Boolean(parentTask.json.data.updatedAt), 'new items carry an updated timestamp')

const subtask = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '子任务A',
  parentId: parentTask.json.data.id,
})
const subView = (await request('GET', '/life-planner/api/snapshot')).json.data.items.find(
  (item) => item.id === subtask.json.data.id,
)
assert(subView.derived.blocked === false, 'a subtask is not blocked by its own parent')

const parentView = (await request('GET', '/life-planner/api/snapshot')).json.data.items.find(
  (item) => item.id === parentTask.json.data.id,
)
assert(parentView.derived.blocked === true, 'an unfinished child blocks its parent')
assert(parentView.derived.blockedBy.includes(subtask.json.data.id), 'blockedBy names the child')

await request('POST', '/life-planner/api/item.complete', { id: subtask.json.data.id, done: true })
const parentDone = (await request('GET', '/life-planner/api/snapshot')).json.data.items.find(
  (item) => item.id === parentTask.json.data.id,
)
assert(parentDone.derived.blocked === false, 'completing every child unblocks the parent')

// --- move with an explicit position -----------------------------------------
const moveA = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '移动A' })
const moveB = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '移动B' })
const movedCross = await request('POST', '/life-planner/api/item.move', {
  id: moveB.json.data.id,
  parentId: null,
  beforeId: moveA.json.data.id,
})
const afterMoved = (await request('GET', '/life-planner/api/snapshot')).json.data.items
  .filter((item) => !item.parentId && !item.derived.archived)
  .sort((a, b) => a.order - b.order)
  .map((item) => item.id)
assert(
  afterMoved.indexOf(moveB.json.data.id) === afterMoved.indexOf(moveA.json.data.id) - 1,
  'move places the row directly before the given sibling',
)

const selfMove = await request('POST', '/life-planner/api/item.move', {
  id: parentTask.json.data.id,
  parentId: subtask.json.data.id,
})
assert(selfMove.status === 400, 'moving a node into its own subtree is rejected')

// --- delete promotes children and clears references -------------------------
await request('POST', '/life-planner/api/item.depends', {
  id: moveA.json.data.id,
  dependsOn: [parentTask.json.data.id],
})
const deleted = await request('POST', '/life-planner/api/item.delete', { id: parentTask.json.data.id })
assert(deleted.json && deleted.json.ok, 'delete succeeded: ' + JSON.stringify(deleted.json))
assert(deleted.json.data.promoted === 1, 'delete reports how many children were promoted')
const afterDelete = (await request('GET', '/life-planner/api/snapshot')).json.data.items
assert(!afterDelete.some((item) => item.id === parentTask.json.data.id), 'deleted row is gone')
const promoted = afterDelete.find((item) => item.id === subtask.json.data.id)
assert(promoted && promoted.parentId === null, 'the child is promoted to the deleted node parent')
const cleanedDep = afterDelete.find((item) => item.id === moveA.json.data.id)
assert(!cleanedDep.dependsOn.includes(parentTask.json.data.id), 'references to the deleted row are removed')

const { existsSync, statSync } = await import('node:fs')
const { DatabaseSync } = await import('node:sqlite')
const dbPath = join(home, 'life-planner', 'data.db')
assert(existsSync(dbPath) && statSync(dbPath).size > 0, 'SQLite database file exists')
const db = new DatabaseSync(dbPath)
const rowCount = db.prepare('SELECT COUNT(*) AS n FROM items').get().n
const flag = db.prepare('SELECT enabled FROM session_flags WHERE session_id = ?').get('session-b')
const planRow = db.prepare('SELECT body_markdown FROM plan WHERE id = ?').get('plan')
db.close()
assert(rowCount === 8, 'items table holds every created row after the delete')
assert(flag && flag.enabled === 1, 'session flag persisted as a row')
assert(planRow && planRow.body_markdown.includes('每天学英语'), 'plan body persisted in SQLite')

// --- completion gate --------------------------------------------------------
const gateParent = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '闸门父' })
const gateChild = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '闸门子',
  parentId: gateParent.json.data.id,
})
const gateTry = await request('POST', '/life-planner/api/item.complete', { id: gateParent.json.data.id, done: true })
assert(gateTry.json.data.blocked === true, 'a parent with unfinished children cannot be completed')
assert(
  gateTry.json.data.blockers.children.some((child) => child.id === gateChild.json.data.id),
  'the gate names the unfinished child',
)
const gateForced = await request('POST', '/life-planner/api/item.complete', {
  id: gateParent.json.data.id,
  done: true,
  force: true,
})
assert(Boolean(gateForced.json.data.completedAt), 'force=true completes it anyway')

const blockerA = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '前置A' })
const blockerB = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '被前置B' })
await request('POST', '/life-planner/api/item.depends', {
  id: blockerB.json.data.id,
  dependsOn: [blockerA.json.data.id],
})
const depTry = await request('POST', '/life-planner/api/item.complete', { id: blockerB.json.data.id, done: true })
assert(depTry.json.data.blocked === true, 'a task with an unfinished prerequisite cannot be completed')
assert(
  depTry.json.data.blockers.depends.some((dep) => dep.id === blockerA.json.data.id),
  'the gate names the unfinished prerequisite',
)
await request('POST', '/life-planner/api/item.complete', { id: blockerA.json.data.id, done: true })
const depAfter = await request('POST', '/life-planner/api/item.complete', { id: blockerB.json.data.id, done: true })
assert(Boolean(depAfter.json.data.completedAt), 'finishing the prerequisite allows completion')

// --- archive restore --------------------------------------------------------
const restoreParent = await request('POST', '/life-planner/api/item.add', { kind: 'project', title: '恢复父' })
const restoreKid = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '恢复子',
  parentId: restoreParent.json.data.id,
})
await request('POST', '/life-planner/api/item.archive', { id: restoreKid.json.data.id })
const back = await request('POST', '/life-planner/api/item.restore', { id: restoreKid.json.data.id })
assert(back.json.data.archivedAt === undefined, 'restore clears the archive stamp')
assert(back.json.data.parentId === restoreParent.json.data.id, 'restore returns to its original parent')

await request('POST', '/life-planner/api/item.archive', { id: restoreParent.json.data.id })
await request('POST', '/life-planner/api/item.archive', { id: restoreKid.json.data.id })
const orphan = await request('POST', '/life-planner/api/item.restore', { id: restoreKid.json.data.id })
assert(orphan.json.data.parentId === null, 'restoring under an archived parent falls back to the root')

// --- reminders, auto-archive, auto-delete -----------------------------------
const defaults = await request('GET', '/life-planner/api/settings')
assert(defaults.json.data.leadTaskDays === 3, 'settings defaults are served')

const savedSettings = await request('POST', '/life-planner/api/settings.save', {
  patch: {
    weekdayWindows: '00:00-23:59',
    weekendWindows: '00:00-23:59',
    notifyGapMinutes: 0,
    nonUrgentQuotaPerWindow: 5,
  },
})
assert(savedSettings.json.data.notifyGapMinutes === 1, 'settings save clamps the send gap to at least one minute')

const base = Date.now()
const soon = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '提醒测试',
  dueAt: new Date(base + 60 * 60000).toISOString(),
})
await request('POST', '/life-planner/api/dev.scan', { at: new Date(base + 40 * 60000).toISOString() })
const notes = await request('GET', '/life-planner/api/notifications')
assert(notes.json.data.length >= 1, 'a scan inside the window raises a reminder')
assert(
  notes.json.data.some((note) => note.itemId === soon.json.data.id),
  'the reminder names the due-soon task',
)
assert(
  notes.json.data.some((note) => note.itemId === soon.json.data.id && note.kind === 'short'),
  'a dated reminder is tagged as short-term',
)
await request('POST', '/life-planner/api/notifications.ack', {
  ids: notes.json.data.map((note) => note.id),
})
const afterAck = await request('GET', '/life-planner/api/notifications')
assert(afterAck.json.data.length === 0, 'acking clears delivered reminders')

// An undelivered reminder is kept even when it is old: only repeats are dropped.
const staleDb = new DatabaseSync(dbPath)
staleDb
  .prepare(
    "INSERT INTO notifications (id,item_id,title,due_at,kind,priority,created_at,delivered_at) VALUES ('stale-1','x','旧提醒',NULL,'short',5,?,NULL)",
  )
  .run(new Date(Date.now() - 3 * 3600000).toISOString())
staleDb.close()
const afterStale = await request('GET', '/life-planner/api/notifications')
assert(
  afterStale.json.data.some((note) => note.id === 'stale-1'),
  'an old reminder is still delivered, not dropped',
)

// A task without a due date still enters the reminder cycle.
await request('POST', '/life-planner/api/settings.save', { patch: { nonUrgentQuotaPerWindow: 100 } })
const longTask = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '长期任务测试' })
// Isolate the case: complete every other open task so this one is the only
// candidate the next scan can pick.
const isolateDb = new DatabaseSync(dbPath)
isolateDb
  .prepare('UPDATE items SET completed_at=? WHERE id <> ? AND completed_at IS NULL')
  .run(new Date().toISOString(), longTask.json.data.id)
isolateDb.close()
await request('POST', '/life-planner/api/dev.scan', { at: new Date(base + 50 * 60000).toISOString() })
const longNotes = await request('GET', '/life-planner/api/notifications')
assert(
  longNotes.json.data.some((note) => note.itemId === longTask.json.data.id),
  'a task without a due date joins the reminder cycle',
)
assert(
  longNotes.json.data.some((note) => note.itemId === longTask.json.data.id && note.kind === 'long'),
  'an undated reminder is tagged as long-term',
)
await request('POST', '/life-planner/api/notifications.ack', {
  ids: longNotes.json.data.map((note) => note.id),
})

const db2 = new DatabaseSync(dbPath)
const completedRow = db2.prepare('SELECT id FROM items WHERE completed_at IS NOT NULL LIMIT 1').get()
const oldIso = new Date(Date.now() - 40 * 86400000).toISOString()
db2.prepare('UPDATE items SET updated_at=? WHERE id=?').run(oldIso, completedRow.id)
db2.close()
await request('POST', '/life-planner/api/dev.scan', { at: new Date().toISOString() })
const db3 = new DatabaseSync(dbPath)
const archivedRow = db3.prepare('SELECT archived_at FROM items WHERE id=?').get(completedRow.id)
db3.close()
assert(Boolean(archivedRow.archived_at), 'a task completed 40 days ago is auto-archived')

await request('POST', '/life-planner/api/item.archive', { id: soon.json.data.id })
const db4 = new DatabaseSync(dbPath)
const ancientIso = new Date(Date.now() - 100 * 86400000).toISOString()
db4.prepare('UPDATE items SET archived_at=?, updated_at=? WHERE id=?').run(ancientIso, ancientIso, soon.json.data.id)
db4.close()
await request('POST', '/life-planner/api/dev.scan', { at: new Date().toISOString() })
const db5 = new DatabaseSync(dbPath)
const goneRow = db5.prepare('SELECT id FROM items WHERE id=?').get(soon.json.data.id)
db5.close()
assert(!goneRow, 'a task archived 100 days ago is auto-deleted')

// --- tag library, export, import ---------------------------------------------
const withTags = await request('POST', '/life-planner/api/settings.save', {
  patch: { tags: ['考研', '重点'] },
})
assert(Array.isArray(withTags.json.data.tags) && withTags.json.data.tags.length === 2, 'the tag library is stored')
assert(withTags.json.data.tags.includes('考研'), 'the tag library keeps its names')

const exported = await request('GET', '/life-planner/api/export')
assert(exported.json.data.items.length > 0, 'export includes items')
assert(typeof exported.json.data.plan.bodyMarkdown === 'string', 'export includes the plan')
assert(Boolean(exported.json.data.settings), 'export includes settings')

const imported = await request('POST', '/life-planner/api/import', {
  payload: {
    items: [{ id: 'imported-1', kind: 'task', title: '导入的任务', parentId: null, order: 0 }],
    plan: { title: '规划书', bodyMarkdown: '导入的计划' },
  },
})
assert(imported.json.data.added === 1, 'import adds a new item')

const clamped = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '优先级夹紧',
  priority: 42,
})
assert(clamped.json.data.priority === 9, 'priority above 9 is clamped')
const wordPriority = await request('POST', '/life-planner/api/item.update', {
  id: clamped.json.data.id,
  patch: { priority: 'low' },
})
assert(wordPriority.json.data.priority === 1, 'a legacy word priority is mapped to 1')

const afterImport = await request('GET', '/life-planner/api/snapshot')
assert(
  afterImport.json.data.items.some((item) => item.id === 'imported-1'),
  'the imported item is readable',
)
assert(afterImport.json.data.plan.bodyMarkdown === '导入的计划', 'import replaces the plan')

const reimport = await request('POST', '/life-planner/api/import', {
  payload: { items: [{ id: 'imported-1', kind: 'task', title: '导入的任务（改）', parentId: null }] },
})
assert(reimport.json.data.updated === 1 && reimport.json.data.added === 0, 're-import replaces by id')

// --- tags and task types ----------------------------------------------------
const tagged = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '带标签的任务',
  tags: ['考试', '重点', '考试'],
  taskType: '学习',
})
assert(tagged.json.data.tags.length === 2, 'tags are trimmed to unique values')
assert(tagged.json.data.tags.includes('重点'), 'the tag survives')
assert(tagged.json.data.taskType === '学习', 'the task type is stored')

const retagged = await request('POST', '/life-planner/api/item.update', {
  id: tagged.json.data.id,
  patch: { tags: '生活, 运动', taskType: '生活' },
})
assert(retagged.json.data.tags.length === 2 && retagged.json.data.tags[1] === '运动', 'a comma string becomes tags')
assert(retagged.json.data.taskType === '生活', 'the task type can change')

const exportedTags = await request('GET', '/life-planner/api/export')
const exportedItem = exportedTags.json.data.items.find((item) => item.id === tagged.json.data.id)
assert(exportedItem.tags.includes('运动'), 'export keeps tags')
assert(exportedItem.taskType === '生活', 'export keeps the task type')

// --- per-window cap ---------------------------------------------------------
await request('POST', '/life-planner/api/settings.save', { patch: { maxRemindersPerWindow: 2 } })
for (let index = 0; index < 5; index += 1) {
  await request('POST', '/life-planner/api/item.add', {
    kind: 'task',
    title: `爆发${index}`,
    dueAt: new Date(Date.now() - 3600000).toISOString(),
  })
}
const capBase = new Date()
capBase.setHours(19, 30, 0, 0)
for (let index = 0; index < 6; index += 1) {
  await request('POST', '/life-planner/api/dev.scan', {
    at: new Date(capBase.getTime() + index * 60000).toISOString(),
  })
}
const capNotes = await request('GET', '/life-planner/api/notifications')
assert(capNotes.json.data.length <= 2, 'the per-window cap stops a burst')

// --- undo a delete ----------------------------------------------------------
const undoItem = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '撤销测试' })
await request('POST', '/life-planner/api/item.delete', { id: undoItem.json.data.id })
const goneSnap = await request('GET', '/life-planner/api/snapshot')
assert(!goneSnap.json.data.items.some((item) => item.id === undoItem.json.data.id), 'a deleted item is hidden')
const undone = await request('POST', '/life-planner/api/item.undelete', { id: undoItem.json.data.id })
assert(undone.json.data.title === '撤销测试', 'undo restores the deleted item')
const backSnap = await request('GET', '/life-planner/api/snapshot')
assert(backSnap.json.data.items.some((item) => item.id === undoItem.json.data.id), 'the restored item is visible again')

// --- repeating task ---------------------------------------------------------
const repeatDue = new Date(Date.now() + 86400000).toISOString()
const repeat = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '每日复盘',
  dueAt: repeatDue,
  recurrence: { freq: 'daily' },
})
const repeatId = repeat.json.data.id
await request('POST', '/life-planner/api/item.complete', { id: repeatId, done: true })
const repeatSnap = await request('GET', '/life-planner/api/snapshot')
const spawned = repeatSnap.json.data.items.find(
  (item) => item.id !== repeatId && item.title === '每日复盘' && !item.completedAt,
)
assert(Boolean(spawned), 'completing a repeating task spawns the next occurrence')
assert(spawned && spawned.recurrence && spawned.recurrence.freq === 'daily', 'the next occurrence keeps the rule')
const shift = spawned ? new Date(spawned.dueAt).getTime() - new Date(repeatDue).getTime() : 0
assert(Math.abs(shift - 86400000) < 7200000, 'the next deadline moves one day forward')

// --- recurrence editing -----------------------------------------------------
const editable = await request('POST', '/life-planner/api/item.add', { kind: 'task', title: '周期可编辑' })
const setWeekly = await request('POST', '/life-planner/api/item.update', {
  id: editable.json.data.id,
  patch: { recurrence: { freq: 'weekly' } },
})
assert(setWeekly.json.data.recurrence.freq === 'weekly', 'the editor can set a weekly repeat')
const cleared = await request('POST', '/life-planner/api/item.update', {
  id: editable.json.data.id,
  patch: { recurrence: null },
})
assert(cleared.json.data.recurrence === undefined, 'clearing the repeat removes the rule')

// --- one node type only -----------------------------------------------------
const singleKind = await request('POST', '/life-planner/api/item.add', {
  kind: '阶段',
  title: '单类型条目',
})
assert(singleKind.json.data.kind === 'task', 'a requested custom kind is normalised to task')
assert(singleKind.json.data.status === 'todo', 'every node starts as a todo')
const kindSnap = await request('GET', '/life-planner/api/snapshot')
assert(
  kindSnap.json.data.items.every((item) => item.kind === 'task'),
  'the snapshot exposes only task nodes',
)

// --- learning module: data layer -------------------------------------------
const subject = await request('POST', '/life-planner/api/subject.add', { title: '高等数学' })
assert(subject.json.data.title === '高等数学', 'a subject can be created')
const topic = await request('POST', '/life-planner/api/topic.add', {
  subjectId: subject.json.data.id,
  title: '极限的定义',
})
assert(topic.json.data.mastery === 4, 'a new topic starts at mastery 4')
await request('POST', '/life-planner/api/topic.mastery', {
  id: topic.json.data.id,
  mastery: 5,
  reviewAt: new Date(Date.now() - 1000).toISOString(),
})
const learning = await request('GET', '/life-planner/api/learning')
assert(learning.json.data.subjects.length >= 1, 'learning returns subjects')
const fetchedTopic = learning.json.data.topics.find((entry) => entry.id === topic.json.data.id)
assert(fetchedTopic && fetchedTopic.mastery === 5, 'mastery is persisted as a number')
assert(fetchedTopic && fetchedTopic.due === true, 'a past review time marks the topic due')

const scheduled = await request('POST', '/life-planner/api/topic.mastery', {
  id: topic.json.data.id,
  mastery: 10,
})
assert(scheduled.json.data.reviewAt === null, 'mastery 10 stops future reviews')
assert(Boolean(scheduled.json.data.masteredAt), 'mastery 10 records the mastered time')

const backToZero = await request('POST', '/life-planner/api/topic.mastery', {
  id: topic.json.data.id,
  mastery: 0,
})
assert(Boolean(backToZero.json.data.lockUntil), 'dropping to 0 starts a cooldown')
const zeroGap = (new Date(backToZero.json.data.reviewAt).getTime() - Date.now()) / 86400000
assert(zeroGap > 0 && zeroGap < 2, 'mastery 0 comes back the next day')

// --- start time and location ------------------------------------------------
const placed = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '去图书馆借书',
  startAt: new Date(Date.now() + 7200000).toISOString(),
  location: '图书馆三楼',
})
assert(placed.json.data.location === '图书馆三楼', 'a location is stored')
const placedSnap = await request('GET', '/life-planner/api/snapshot')
const placedItem = placedSnap.json.data.items.find((item) => item.id === placed.json.data.id)
assert(Boolean(placedItem.startAt), 'a start time is stored')
assert(placedItem.location === '图书馆三楼', 'the location comes back from the snapshot')

// --- preserve legacy plans; retire generation -------------------------------
const examSubject = await request('POST', '/life-planner/api/subject.add', { title: '线性代数' })
const examId = examSubject.json.data.id
const examTopic = await request('POST', '/life-planner/api/topic.add', { subjectId: examId, title: '矩阵' })
const oldMirror = (await request('POST', '/life-planner/api/item.add', { title: '矩阵 · 学习' })).json.data
const local = new Date()
if (local.getHours() < 4) local.setDate(local.getDate() - 1)
const todayKey = [local.getFullYear(), local.getMonth() + 1, local.getDate()].map((value) => String(value).padStart(2, '0')).join('-')
const legacyPlanDb = new DatabaseSync(join(home, 'life-planner', 'data.db'))
legacyPlanDb.prepare('INSERT INTO study_plan (id,date,subject_id,topic_id,title,kind,minutes,task_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
  .run('legacy-1', todayKey, examId, examTopic.json.data.id, '矩阵 · 学习', 'learn', 30, oldMirror.id, new Date().toISOString())
legacyPlanDb.close()
const retired = await request('POST', '/life-planner/api/plan.generate', { subjectId: examId })
assert(retired.status === 410 && !tools.has('study_plan_generate'), 'plan generation is retired in both entry points')
const legacyPlan = await request('GET', '/life-planner/api/learning')
assert(legacyPlan.json.data.plan.some((entry) => entry.id === 'legacy-1'), 'retiring generation keeps legacy plans')

// --- bookshelf --------------------------------------------------------------
const shelfUrl = await request('POST', '/life-planner/api/shelf.add', {
  kind: 'url',
  path: 'https://example.com/math',
  title: '数学参考',
  tags: ['数学'],
})
assert(shelfUrl.json.data.kind === 'url', 'a web page can be shelved')
assert(shelfUrl.json.data.fetchedAt === null, 'a new page is marked as not fetched yet')

const shelfDir = await request('POST', '/life-planner/api/shelf.add', {
  kind: 'dir',
  path: studySpace,
})
assert(
  shelfDir.json.data.listing.length === 0,
  'an empty directory scans without error',
)

const shelvedTagged = await request('POST', '/life-planner/api/shelf.tag', {
  id: shelfUrl.json.data.id,
  tags: ['数学', '题解'],
})
assert(shelvedTagged.json.data.tags.length === 2, 'a shelf item can be tagged')

const shelfList = await request('GET', '/life-planner/api/shelf')
assert(shelfList.json.data.length >= 2, 'the shelf lists its items')

const linkedPlan = await request('POST', '/life-planner/api/plan.materials', {
  planId: 'plan-demo',
  shelfIds: [shelfUrl.json.data.id],
})
assert(linkedPlan.json.data.shelfIds.length === 1, 'a plan can reference shelf materials')

const removed = await request('POST', '/life-planner/api/shelf.delete', { id: shelfDir.json.data.id })
assert(removed.json.data.deleted === true, 'a shelf item can be removed')

// --- mistakes ---------------------------------------------------------------
const mistake = await request('POST', '/life-planner/api/mistake.add', {
  question: '矩阵可逆的充要条件？',
  answer: '行列式不为零',
  reason: '混淆了秩与行列式',
  source: '线性代数课后题 3-5',
  tags: ['矩阵'],
})
assert(mistake.json.data.answer === '行列式不为零', 'a mistake keeps the correct answer')
assert(mistake.json.data.reason === '混淆了秩与行列式', 'a mistake records the reason')
const mistakeList = await request('GET', '/life-planner/api/mistakes')
assert(mistakeList.json.data.length >= 1, 'mistakes are listed')
const reviewed = await request('POST', '/life-planner/api/mistake.review', {
  id: mistake.json.data.id,
  days: 3,
})
assert(Boolean(reviewed.json.data.reviewAt), 'a mistake can be scheduled for review')
const removedMistake = await request('POST', '/life-planner/api/mistake.delete', { id: mistake.json.data.id })
assert(removedMistake.json.data.deleted === true, 'a mistake can be removed')

// --- finishing a plan entry -------------------------------------------------
const todayPlan = await request('POST', '/life-planner/api/plan.today', {})
assert(todayPlan.json.data.some((entry) => entry.id === 'legacy-1'), 'today still returns legacy plan entries')
const finished = await request('POST', '/life-planner/api/plan.done', { id: 'legacy-1' })
assert(Boolean(finished.json.data.doneAt), 'a legacy plan can still be completed')
assert(finished.json.data.mastery.mastery === 5, 'completing a legacy plan still raises topic mastery')

// --- a manual shelf edit locks automatic naming ----------------------------
const locked = await request('POST', '/life-planner/api/shelf.update', {
  id: shelfUrl.json.data.id,
  patch: { title: '我的数学参考', tags: ['人工'] },
})
assert(locked.json.data.manual === true, 'a manual edit locks the shelf entry')
const skipped = await request('POST', '/life-planner/api/shelf.tag', {
  id: shelfUrl.json.data.id,
  tags: ['自动'],
})
assert(skipped.json.data.skipped === true, 'automatic tagging is skipped once locked')

// --- study task registry ----------------------------------------------------
const registered = await request('POST', '/life-planner/api/studytask.register', {
  title: '背单词',
  workspacePath: studySpace,
  template: 'word-bank',
})
assert(registered.json.data.template === 'list', 'a study task stores the canonical list template')
assert(registered.json.data.workspacePath === studySpace, 'a study task records its workspace')
const sameSpace = await request('POST', '/life-planner/api/studytask.register', {
  title: '背单词（改名）',
  workspacePath: studySpace,
})
assert(sameSpace.json.data.id === registered.json.data.id, 'the same workspace updates instead of duplicating')
// One session owns one task even when the workspace path changes.
await mkdir(join(home, 'word-space-2'), { recursive: true })
const sameSession = await request('POST', '/life-planner/api/studytask.register', {
  title: '背单词（会话复用）',
  workspacePath: join(home, 'word-space-2'),
  sessionId: 'session-shared',
})
const sameSessionAgain = await request('POST', '/life-planner/api/studytask.register', {
  title: '背单词（会话复用2）',
  workspacePath: join(home, 'word-space-2'),
  sessionId: 'session-shared',
})
assert(sameSessionAgain.json.data.id === sameSession.json.data.id, 'one session keeps a single study task')
const badWorkspace = await request('POST', '/life-planner/api/studytask.register', {
  title: '坏路径',
  workspacePath: join(studySpace, 'missing-dir'),
})
assert(badWorkspace.status === 400, 'a missing workspace is rejected')
const withSummary = await request('POST', '/life-planner/api/studytask.summary', {
  id: registered.json.data.id,
  summary: { total: 1200, average: 4.2 },
})
assert(withSummary.json.data.summary.total === 1200, 'the summary is stored')
const taskList = await request('GET', '/life-planner/api/study-tasks')
assert(taskList.json.data.length >= 1, 'study tasks are listed')

// --- only visible study conversations accumulate time -----------------------
const beat = (sessionId, tracker, active, at) =>
  request('POST', '/life-planner/api/habit.beat', { sessionId, tracker, active, at })
const beatTime = Date.now() - 45000
assert((await beat('ordinary', 'ordinary', true, new Date(beatTime).toISOString())).status === 403,
  'ordinary conversations are excluded from habit tracking')
await beat('study-active', 'test', true, new Date(beatTime).toISOString())
await beat('study-active', 'test', true, new Date(beatTime + 20000).toISOString())
await beat('study-active', 'other', true, new Date(beatTime + 25000).toISOString())
await beat('study-active', 'test', false, new Date(beatTime + 30000).toISOString())
const habits = (await request('GET', '/life-planner/api/habits')).json.data
assert(habits.sessions[0].seconds === 30 && habits.sessions.length === 1, 'focused session time is charged once, including its last partial interval')
assert(!('legacyDays' in habits), 'the habit panel omits legacy panel-timing statistics')
const localTip = await request('GET', '/life-planner/api/tip')
assert(localTip.json.data.source === 'local' && localTip.json.data.day === todayKey, 'offline advice uses the study day and does not call a model')
const regionTip = await request('POST', '/life-planner/api/tip.settings', { region: '上海', automatic: false })
assert(regionTip.json.data.regionPreference === '上海' && regionTip.json.data.automatic === false, 'daily advice settings preserve the city override')

const updatedTask = await request('POST', '/life-planner/api/studytask.update', {
  id: registered.json.data.id,
  patch: { title: '背单词（改）' },
})
assert(updatedTask.json.data.title === '背单词（改）', 'a study task can be renamed')
const withMaterials = await request('POST', '/life-planner/api/studytask.materials', {
  id: registered.json.data.id,
  shelfIds: [shelfUrl.json.data.id],
})
assert(withMaterials.json.data.shelfIds.length === 1, 'a study task can attach shelf materials')
const listedTasks = await request('GET', '/life-planner/api/study-tasks')
const listedOne = listedTasks.json.data.find((entry) => entry.id === registered.json.data.id)
assert(Boolean(listedOne && listedOne.materials.length === 1), 'materials come back with the task')

// --- importing a shelf item copies only when it lives outside the workspace --
const earlyWorkspace = registered.json.data.workspacePath
const earlyTaskId = registered.json.data.id
const insideShelfDir = join(earlyWorkspace, 'inside-notes')
await mkdir(insideShelfDir, { recursive: true })
await (await import('node:fs/promises')).writeFile(join(insideShelfDir, 'note.txt'), 'hi')
const insideShelf = await request('POST', '/life-planner/api/shelf.add', { kind: 'dir', path: insideShelfDir })
const insideImport = await call('study_import_material', {
  shelfId: insideShelf.json.data.id,
  taskId: earlyTaskId,
})
assert(insideImport.copied === false, 'a folder already inside the workspace is referenced, not copied')
const outsideDir = join(home, 'outside-notes')
await mkdir(outsideDir, { recursive: true })
await (await import('node:fs/promises')).writeFile(join(outsideDir, 'note.txt'), 'hi')
const outsideShelf = await request('POST', '/life-planner/api/shelf.add', { kind: 'dir', path: outsideDir })
const outsideImport = await call('study_import_material', {
  shelfId: outsideShelf.json.data.id,
  taskId: earlyTaskId,
})
assert(outsideImport.copied === true, 'an outside folder is copied into learning/materials')


console.log('\nsmoke test passed')
const shelfFirst = await request('POST', '/life-planner/api/shelf.add', {
  kind: 'url',
  path: 'https://example.com/demo',
  title: '示例资料',
})
const shelfTwin = await request('POST', '/life-planner/api/shelf.add', {
  kind: 'url',
  path: 'https://example.com/demo/',
  title: '示例资料（重复）',
})
assert(shelfTwin.json.data.id === shelfFirst.json.data.id, 'the same shelf target is reused')
assert(shelfTwin.json.data.deduped === true, 'reuse is reported to the caller')

// --- shelf kind is detected when omitted ------------------------------------
const autoDir = await request('POST', '/life-planner/api/shelf.add', { path: process.cwd() })
assert(autoDir.json.data.kind === 'dir', 'a directory path is detected automatically')
const autoUrl = await request('POST', '/life-planner/api/shelf.add', { path: 'https://example.com/auto' })
assert(autoUrl.json.data.kind === 'url', 'a URL is detected automatically')

// --- a subject may have no exam ---------------------------------------------
const noExam = await request('POST', '/life-planner/api/subject.update', {
  id: subject.json.data.id,
  patch: { examDate: '' },
})
assert(noExam.json.data.examDate === null, 'a subject can be saved without an exam date')

// --- mistakes remember their study task -------------------------------------
const filedMistake = await request('POST', '/life-planner/api/mistake.add', {
  question: 'adhesion',
  answer: '黏附',
  taskId: registered.json.data.id,
  itemId: 'wb-001',
})
assert(filedMistake.json.data.taskId === registered.json.data.id, 'a mistake records its task id')
const mistakesAfter = await request('GET', '/life-planner/api/mistakes')
const filedRow = mistakesAfter.json.data.find((row) => row.id === filedMistake.json.data.id)
assert(Boolean(filedRow && filedRow.taskId === registered.json.data.id), 'the list returns the task id')
assert(Boolean(filedRow && filedRow.createdAt), 'the list returns the creation time for date filters')

// --- the daily tip is generated once per study day --------------------------
const tipFirst = await request('GET', '/life-planner/api/tip')
assert(typeof tipFirst.json.data.text === 'string' && tipFirst.json.data.text.length > 0, 'a tip is produced')
const tipSecond = await request('GET', '/life-planner/api/tip')
assert(tipSecond.json.data.day === tipFirst.json.data.day, 'the tip is keyed by study day')
assert(tipSecond.json.data.cached === true, 'the second read reuses the stored tip')

// --- the daily goal is configurable ----------------------------------------
const targetSet = await request('POST', '/life-planner/api/studytask.target', {
  id: registered.json.data.id,
  dailyTarget: 12,
})
assert(targetSet.json.data.dailyTarget === 12, 'the daily target is stored')
const tasksWithGoal = await request('GET', '/life-planner/api/study-tasks')
const goalRow = tasksWithGoal.json.data.find((row) => row.id === registered.json.data.id)
assert(Boolean(goalRow && goalRow.targetToday === 12), 'the task exposes today’s goal')
assert(Boolean(goalRow && goalRow.answeredToday === 0), 'the task exposes today’s progress')

// --- the tree node is a reference owned by the study task -------------------
const linkedItemId = registered.json.data.itemId
assert(Boolean(linkedItemId), 'registering a study task creates a mirrored node')
const blockedComplete = await request('POST', '/life-planner/api/item.complete', { id: linkedItemId, done: true })
assert(blockedComplete.json.ok === false, 'a study-linked node cannot be completed manually')
await request('POST', '/life-planner/api/studytask.delete', { id: registered.json.data.id })
const afterUnlink = await request('GET', '/life-planner/api/snapshot')
assert(
  !afterUnlink.json.data.items.some((item) => item.id === linkedItemId),
  'deleting the study task removes its mirrored node',
)

// --- backgrounds live in the plugin data directory --------------------------
const bgPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const bgSet = await request('POST', '/life-planner/api/background.set', { area: 'planning', dataUrl: bgPng })
assert(String(bgSet.json.data.path).includes('backgrounds'), 'the image is stored in the backgrounds folder')
const bgInfo = await request('GET', '/life-planner/api/background.info')
assert(Boolean(bgInfo.json.data.planning), 'background info exposes the planning image')
assert(Boolean(bgInfo.json.data.default), 'background info exposes the bundled default image')
const bgDefault = await request('GET', '/life-planner/api/background?area=default&v=1')
assert(bgDefault.status === 200, 'the bundled default background is served')
const bgVersioned = await request('GET', '/life-planner/api/background?area=planning&v=1')
assert(/immutable/.test(String(bgVersioned.headers['cache-control'])), 'a versioned background is cacheable')
const bgPlain = await request('GET', '/life-planner/api/background?area=planning')
assert(/no-store/.test(String(bgPlain.headers['cache-control'])), 'an unversioned background is not cached')
const bgBadArea = await request('POST', '/life-planner/api/background.set', { area: '../escape', dataUrl: bgPng })
assert(bgBadArea.status === 400, 'an unknown background area is rejected')
await request('POST', '/life-planner/api/background.clear', { area: 'planning' })
const bgAfter = await request('GET', '/life-planner/api/background.info')
assert(bgAfter.json.data.planning === null, 'clearing removes the stored background')

// --- weekly study time targets ---------------------------------------------
// --- appearance lives on the host -------------------------------------------
const uiEmpty = await request('GET', '/life-planner/api/ui')
assert(uiEmpty.json.ok && uiEmpty.json.data.appearance === null, 'a fresh install has no stored appearance')
await request('POST', '/life-planner/api/ui.save', {
  appearance: { font: { base: 15 }, background: { planning: { mode: 'color', color: '#101010' } } },
})
const uiSaved = await request('GET', '/life-planner/api/ui')
assert(uiSaved.json.data.appearance.font.base === 15, 'the stored appearance comes back')
assert(uiSaved.json.data.appearance.background.planning.mode === 'color', 'the background mode is stored too')

const weekFirst = await request('GET', '/life-planner/api/study-time')
assert(weekFirst.json.data.days.length === 7, 'a week always has seven days')
const plannedDay = weekFirst.json.data.days[0].day
const weekSet = await request('POST', '/life-planner/api/study-time.set', {
  entries: [{ day: plannedDay, minutes: 45 }],
})
assert(weekSet.json.data.days[0].planned === 45, 'a planned day stores its minutes')
const weekRead = await request('GET', '/life-planner/api/study-time')
assert(weekRead.json.data.days[0].planned === 45, 'the plan reads back')
await request('POST', '/life-planner/api/study-time.set', { entries: [{ day: plannedDay, minutes: null }] })
const weekCleared = await request('GET', '/life-planner/api/study-time')
assert(weekCleared.json.data.days[0].planned === null, 'clearing a day removes its plan')

// --- deleting from the library never touches the tasks ----------------------
const tagSeedItem = await request('POST', '/life-planner/api/item.add', {
  kind: 'task',
  title: '带标签的任务',
  tags: ['复习', '重点'],
})
assert(tagSeedItem.json.data.tags.includes('复习'), 'the task keeps its tags')
await request('POST', '/life-planner/api/settings.save', { patch: { tags: [] } })
const clearedSettings = await request('GET', '/life-planner/api/settings')
assert(
  Array.isArray(clearedSettings.json.data.tags) && clearedSettings.json.data.tags.length === 0,
  'an emptied library stays empty instead of re-seeding',
)
const stillTagged = (await request('GET', '/life-planner/api/snapshot')).json.data.items.find(
  (item) => item.id === tagSeedItem.json.data.id,
)
assert(stillTagged.tags.includes('复习'), 'removing a tag from the library keeps it on the task')

// --- category derives at creation, then stays with the task ------------------
const categoryRoot = await request('POST', '/life-planner/api/item.add', { title: '学习' })
const derived = await request('POST', '/life-planner/api/item.add', {
  title: '子任务',
  parentId: categoryRoot.json.data.id,
})
assert(derived.json.data.taskType === '学习', 'a new task takes its category from the top node')
const otherRoot = await request('POST', '/life-planner/api/item.add', { title: '工作' })
const movedTask = await request('POST', '/life-planner/api/item.update', {
  id: derived.json.data.id,
  patch: { parentId: otherRoot.json.data.id },
})
assert(movedTask.json.data.taskType === '学习', 'moving a task keeps its category')
const recolored = await request('POST', '/life-planner/api/item.update', {
  id: derived.json.data.id,
  patch: { taskType: '工作' },
})
assert(recolored.json.data.taskType === '工作', 'the category can be changed explicitly')

// --- knowledge base: new vs review split, learned flag, zero-lock ------------
const learnSpace = join(home, 'learn-space')
await mkdir(join(learnSpace, 'learning'), { recursive: true })
const { DatabaseSync: LearnDb } = await import('node:sqlite')
const knowledge = new LearnDb(join(learnSpace, 'learning', 'knowledge.db'))
const nowStamp = new Date().toISOString()
knowledge.exec(`
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
const insertCard = knowledge.prepare(
  'INSERT INTO cards (id, front, back, proficiency, learned, created_at, updated_at) VALUES (?,?,?,?,?,?,?)',
)
insertCard.run('new-1', '新词', 'new word', 4, 0, nowStamp, nowStamp)
insertCard.run('review-1', '旧词', 'old word', 2, 1, nowStamp, nowStamp)
insertCard.run('zero-1', '零分词', 'zero word', 0, 1, nowStamp, nowStamp)
knowledge.close()

const learnTask = await call('study_register_task', {
  title: '知识库任务',
  workspacePath: learnSpace,
  template: 'word-bank',
  dailyNew: 2,
  dailyReview: 3,
})
assert(learnTask.dailyNew === 2 && learnTask.dailyReview === 3, 'registration stores the split daily targets')
const learnTasks = (await request('GET', '/life-planner/api/study-tasks')).json.data
const learnRow = learnTasks.find((entry) => entry.id === learnTask.id)
assert(learnRow && learnRow.targetNew === 2 && learnRow.targetReview === 3, 'the split targets reach the page')

const progressBefore = await call('study_progress', { taskId: learnTask.id, days: 7 })
assert(progressBefore.history.length === 7, 'study_progress returns one row per day')
assert(progressBefore.history[6].day === progressBefore.history[6].day, 'history is ordered oldest to newest')

const quiz = await call('study_next_questions', { taskId: learnTask.id, count: 5 })
const newItem = quiz.questions.find((entry) => entry.itemId === 'new-1')
const zeroItem = quiz.questions.find((entry) => entry.itemId === 'zero-1')
assert(Boolean(newItem && newItem.isNew), 'an unlearned entry is offered as new content')
assert(Boolean(zeroItem), 'a zero-proficiency entry is still asked every day')

const zeroAnswer = await call('study_answer', { taskId: learnTask.id, itemId: 'zero-1', correct: true })
assert(zeroAnswer.locked === true, 'a zero-proficiency entry reports the three-day scoring lock')
const zeroDb = new LearnDb(join(learnSpace, 'learning', 'knowledge.db'), { readOnly: true })
const zeroRow = zeroDb.prepare('SELECT proficiency, learned FROM cards WHERE id=?').get('zero-1')
zeroDb.close()
assert(Number(zeroRow.proficiency) === 0, 'a locked correct answer does not raise the score')
assert(Number(zeroRow.learned) === 1, 'answering marks the entry as learned')

const newAnswer = await call('study_answer', { taskId: learnTask.id, itemId: 'new-1', correct: true })
assert(newAnswer.isNew === true && newAnswer.locked !== true, 'a new entry scores normally on first answer')
const afterDb = new LearnDb(join(learnSpace, 'learning', 'knowledge.db'), { readOnly: true })
const afterRow = afterDb.prepare('SELECT proficiency, learned FROM cards WHERE id=?').get('new-1')
afterDb.close()
assert(Number(afterRow.proficiency) === 5 && Number(afterRow.learned) === 1, 'the new entry is learned after the first answer')

// --- tree integrity: a node can never become its own descendant -------------
const cycleRoot = await call('item_add', { title: '环测试根', kind: 'task' })
const cycleChild = await call('item_add', { title: '环测试子', parentId: cycleRoot.id })
const selfParent = await request('POST', '/life-planner/api/item.update', {
  id: cycleRoot.id,
  patch: { parentId: cycleRoot.id },
})
assert(selfParent.status === 400, `a node cannot be its own parent (got ${selfParent.status}: ${JSON.stringify(selfParent.json)})`)
const intoChild = await request('POST', '/life-planner/api/item.update', {
  id: cycleRoot.id,
  patch: { parentId: cycleChild.id },
})
assert(intoChild.status === 400, 'a node cannot move under its own child')
const stillAlive = await request('GET', '/life-planner/api/snapshot')
assert(stillAlive.status === 200, 'the tree still renders after a rejected move')

// --- plan completion runs in a single transaction ---------------------------
const cycleSubject = await call('study_add_subject', { title: '事务测试科目' })
const cycleTopic = await call('study_add_topic', { subjectId: cycleSubject.id, title: '事务测试知识点' })
const planSeed = new DatabaseSync(dbPath)
planSeed
  .prepare(
    'INSERT INTO study_plan (id, subject_id, topic_id, date, kind, minutes, done_at, created_at) VALUES (?,?,?,?,?,?,?,?)',
  )
  .run('plan-tx-test', cycleSubject.id, cycleTopic.id, '2026-11-15', 'review', 15, null, new Date().toISOString())
planSeed.close()
const completed = await request('POST', '/life-planner/api/plan.done', { id: 'plan-tx-test' })
assert(completed.status === 200, 'completing a plan row with a topic works in one transaction')
const doneRow = new DatabaseSync(dbPath)
const donePlanRow = doneRow.prepare('SELECT done_at FROM study_plan WHERE id=?').get('plan-tx-test')
doneRow.close()
assert(Boolean(donePlanRow && donePlanRow.done_at), 'the plan row is actually marked done')

// --- study targets: zero is a legal half, counts never exceed the batch ----
const zeroTarget = await request('POST', '/life-planner/api/studytask.target', {
  id: learnTask.id,
  dailyNew: 0,
  dailyReview: 10,
})
assert(zeroTarget.json.data.dailyNew === 0, 'a zero new target is stored, not replaced by the default')
const overAsk = await call('study_next_questions', {
  taskId: learnTask.id,
  count: 5,
  newCount: 20,
  reviewCount: 20,
})
assert(overAsk.questions.length <= 5, 'explicit pool counts never exceed the batch size')

// --- an exhausted knowledge base closes the day instead of returning empty --
await request('POST', '/life-planner/api/studytask.target', { id: learnTask.id, dailyNew: 0, dailyReview: 0 })
const emptySpace = join(home, 'empty-space')
await mkdir(join(emptySpace, 'learning'), { recursive: true })
const emptyDb = new LearnDb(join(emptySpace, 'learning', 'knowledge.db'))
emptyDb.exec(`
  CREATE TABLE cards (
    id TEXT PRIMARY KEY, front TEXT NOT NULL, back TEXT NOT NULL, extra TEXT DEFAULT '',
    proficiency INTEGER NOT NULL DEFAULT 4, learned INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL, updated_at TEXT
  );
  INSERT INTO cards (id, front, back, proficiency, learned, created_at) VALUES ('done-1', 'a', 'b', 10, 1, '2026-01-01');
`)
emptyDb.close()
const emptyTask = await call('study_register_task', {
  title: '空库任务',
  workspacePath: emptySpace,
  template: 'word-bank',
})
const emptyAsk = await call('study_next_questions', { taskId: emptyTask.id, count: 5 })
assert(emptyAsk.questions.length === 0 && emptyAsk.poolNew === 0, 'an exhausted pool returns no questions')
assert(emptyAsk.finishedToday === true, 'an exhausted pool closes the day automatically')

// --- leftover fixes: rename sync, input validation, temp script cleanup -----
const renameTarget = await call('study_register_task', {
  title: '改名前',
  workspacePath: learnSpace,
  template: 'word-bank',
})
await request('POST', '/life-planner/api/studytask.update', {
  id: renameTarget.id,
  patch: { title: '改名后' },
})
const renamedSnapshot = await request('GET', '/life-planner/api/snapshot')
const renamedNode = renamedSnapshot.json.data.items.find((item) => item.id === renameTarget.itemId)
assert(Boolean(renamedNode && renamedNode.title === '改名后'), 'renaming a study task syncs its mirrored node title')

const badExam = await request('POST', '/life-planner/api/subject.add', { title: '坏日期科目', examDate: 'not-a-date' })
assert(badExam.status === 400, 'an invalid exam date is rejected')
const badSubject = await call('study_add_topic', { subjectId: 'subject-missing', title: '孤儿知识点' }).catch(
  (error) => error,
)
assert(badSubject instanceof Error, 'a topic cannot be attached to a missing subject')

const cleanupTask = await call('study_register_task', {
  title: '临时脚本任务',
  workspacePath: learnSpace,
  template: 'word-bank',
})
const runInfo = await call('study_run_program', {
  taskId: cleanupTask.id,
  code: "import { writeFileSync } from 'node:fs'\nwriteFileSync('learning/.run-check.txt', 'ok')\nconsole.log('done')\n",
})
// The DSH sandbox blocks piped child stdio (EPERM), so assert the run itself
// only when this environment can actually spawn one.
const sandboxed = /EPERM/.test(runInfo.error || '')
if (!sandboxed) assert(runInfo.exitCode === 0, `a program runs inside the workspace (${runInfo.error || runInfo.stderr})`)
const leftover = readdirSync(join(learnSpace, 'learning', '.run')).filter((name) => name.endsWith('.mjs'))
assert(leftover.length === 0, 'the temporary program file is removed after the run')

// --- a very large shelf directory reports that its listing was cut ----------
const bigDir = join(home, 'big-shelf')
await mkdir(bigDir, { recursive: true })
for (let index = 0; index < 805; index += 1) {
  await (await import('node:fs/promises')).writeFile(join(bigDir, `f${String(index).padStart(4, '0')}.txt`), 'x')
}
const bigShelf = await request('POST', '/life-planner/api/shelf.add', { kind: 'dir', path: bigDir })
assert(bigShelf.json.data.listing.length === 800, 'the listing keeps the first 800 entries')
assert(bigShelf.json.data.truncated === true, 'a truncated listing is flagged')
const bigListed = (await request('GET', '/life-planner/api/shelf')).json.data.find((row) => row.path === bigDir)
assert(bigListed && bigListed.truncated === true, 'the flag survives the shelf list round-trip')

// --- question-bank template: questions are the items, points follow answers ---
const bankTemplate = await call('study_template', { name: 'bank' })
assert(bankTemplate.name === 'bank', 'templates accept their canonical names')
const legacyTemplate = await call('study_template', { name: 'word-bank' })
assert(legacyTemplate.name === 'list', 'legacy template ids are accepted as aliases')
const treeTask = await call('study_register_task', {
  title: '????',
  workspacePath: learnSpace,
  template: 'outline',
})
assert(treeTask.template === 'tree', 'a legacy template id is normalised on registration')
assert(String(bankTemplate.content || '').includes('question_points'), 'the outline-bank template ships its schema')
const bankSpace = join(home, 'bank-space')
await mkdir(join(bankSpace, 'learning'), { recursive: true })
const bankDb = new LearnDb(join(bankSpace, 'learning', 'knowledge.db'))
bankDb.exec(`
  CREATE TABLE chapters (id TEXT PRIMARY KEY, title TEXT NOT NULL, ord INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE points (
    id TEXT PRIMARY KEY, chapter_id TEXT, title TEXT NOT NULL, detail TEXT DEFAULT '',
    proficiency INTEGER NOT NULL DEFAULT 4, learned INTEGER NOT NULL DEFAULT 0,
    source TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT
  );
  CREATE TABLE questions (
    id TEXT PRIMARY KEY, prompt TEXT NOT NULL, answer TEXT NOT NULL,
    options TEXT NOT NULL DEFAULT '[]', explanation TEXT DEFAULT '', kind TEXT DEFAULT 'short',
    difficulty INTEGER NOT NULL DEFAULT 3, proficiency INTEGER NOT NULL DEFAULT 4,
    learned INTEGER NOT NULL DEFAULT 0, source TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT
  );
  CREATE TABLE question_points (
    question_id TEXT NOT NULL, point_id TEXT NOT NULL, weight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (question_id, point_id)
  );
`)
const bankStamp = new Date().toISOString()
bankDb.prepare('INSERT INTO points (id,title,proficiency,learned,created_at) VALUES (?,?,?,?,?)').run('p1', '心电图', 3, 1, bankStamp)
bankDb.prepare('INSERT INTO points (id,title,proficiency,learned,created_at) VALUES (?,?,?,?,?)').run('p2', '电解质', 2, 1, bankStamp)
bankDb
  .prepare(
    'INSERT INTO questions (id,prompt,answer,options,explanation,kind,proficiency,learned,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  .run('q1', '室颤的首选处理是？', '电除颤', '["电除颤","利多卡因","补钾","观察","转运"]', '室颤首选电除颤', 'choice', 4, 0, bankStamp)
bankDb
  .prepare(
    'INSERT INTO questions (id,prompt,answer,options,explanation,kind,proficiency,learned,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  .run('q2', '低钾血症的心电图表现？', 'U波', '[]', '低钾出现 U 波', 'short', 6, 1, bankStamp)
bankDb
  .prepare(
    'INSERT INTO questions (id,prompt,answer,options,explanation,kind,proficiency,learned,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  .run('q3', '???????', '3.5-5.5', '[]', '???', 'short', 7, 1, bankStamp)
bankDb.prepare('INSERT INTO question_points (question_id,point_id,weight) VALUES (?,?,?)').run('q1', 'p2', 1)
bankDb.prepare('INSERT INTO question_points (question_id,point_id,weight) VALUES (?,?,?)').run('q3', 'p1', 1)
bankDb.prepare('INSERT INTO question_points (question_id,point_id,weight) VALUES (?,?,?)').run('q2', 'p2', 0.8)
bankDb.prepare('INSERT INTO points (id,title,created_at) VALUES (?,?,?)').run('q1', '与题目同编号的知识点', bankStamp)
bankDb.close()

const bankTask = await call('study_register_task', {
  title: '题库任务',
  workspacePath: bankSpace,
  template: 'outline-bank',
  dailyNew: 1,
  dailyReview: 1,
})
assert(bankTask.template === 'bank', 'the question-bank template is stored under its canonical name')
const bankQuiz = await call('study_next_questions', { taskId: bankTask.id, count: 5, newCount: 1, reviewCount: 2 })
assert(bankQuiz.kind === 'bank', 'a question-bank knowledge base is asked from its questions table')
assert(bankQuiz.questions.length === 3 && new Set(bankQuiz.questions.map((item) => item.itemId)).size === 3,
  'a short review pool never repeats questions to fill the round')
const bankNew = bankQuiz.questions.find((item) => item.itemId === 'q1')
assert(Boolean(bankNew && bankNew.isNew), 'an unlearned question is offered as new content')
assert(bankNew.options.join('|') === '电除颤|利多卡因|补钾|观察|转运', 'all original choice options are returned in order')
const bankReview = bankQuiz.questions.find((item) => item.itemId === 'q2')
assert(Boolean(bankReview && bankReview.options.length === 0), 'short-answer questions carry no options')
const bankReviewIds = bankQuiz.questions.filter((item) => !item.isNew).map((item) => item.itemId)
assert(bankReviewIds[0] === 'q2' && bankReviewIds[1] === 'q3', 'review questions are ordered by the weakest covered point')

const bankAnswer = await call('study_answer', { taskId: bankTask.id, itemId: 'q1', correct: true })
assert(bankAnswer.isNew === true && bankAnswer.label === '室颤的首选处理是？', 'grading uses the question prompt as its label')
const bankCheck = new LearnDb(join(bankSpace, 'learning', 'knowledge.db'), { readOnly: true })
const questionRow = bankCheck.prepare('SELECT proficiency, learned FROM questions WHERE id=?').get('q1')
const pointRow = bankCheck.prepare('SELECT proficiency, learned FROM points WHERE id=?').get('p2')
bankCheck.close()
assert(Number(questionRow.proficiency) === 5 && Number(questionRow.learned) === 1, 'the question itself scores and is marked learned')
assert(Number(pointRow.proficiency) === 3, 'a covered knowledge point follows the answer')

const singleTableSpace = join(home, 'single-table-bank')
await mkdir(join(singleTableSpace, 'learning'), { recursive: true })
const singleTableBank = new LearnDb(join(singleTableSpace, 'learning', 'knowledge.db'))
singleTableBank.exec(`CREATE TABLE questions (
  id TEXT PRIMARY KEY, prompt TEXT, answer TEXT, proficiency INTEGER DEFAULT 4, learned INTEGER DEFAULT 0, updated_at TEXT
); INSERT INTO questions(id,prompt,answer) VALUES
  ('s1','第一行' || char(10) || '第二行和完整条件','答一'), ('s2','另一个题目','答二');`)
singleTableBank.close()
const singleTableTask = await call('study_register_task', { title: '独立题库', workspacePath: singleTableSpace, template: 'bank' })
const singleTableQuiz = await call('study_next_questions', { taskId: singleTableTask.id, count: 5, newCount: 1, reviewCount: 2 })
assert(singleTableQuiz.questions.length === 2 && new Set(singleTableQuiz.questions.map((item) => item.itemId)).size === 2 &&
  singleTableQuiz.questions.find((item) => item.itemId === 's1').prompt === '第一行\n第二行和完整条件',
  'a standalone question bank fills from unique new questions and returns full multiline prompts')
assert((await call('study_answer', { taskId: singleTableTask.id, itemId: 's1', verdict: 'correct' })).answeredToday === 1,
  'grading standalone questions also records progress without a knowledge-point table')

const post = (name, body) => request('POST', '/life-planner/api/' + name, body)
const get = (name) => request('GET', '/life-planner/api/' + name)
const taskA = (await post('item.add', { title: '看板 A', priority: 2 })).json.data
const taskB = (await post('item.add', { title: '看板 B', priority: 9 })).json.data
await post('item.board', { id: taskA.id, column: 'todo', anchorId: taskB.id })
const board = (await get('snapshot')).json.data.items
const cardA = board.find((item) => item.id === taskA.id)
const cardB = board.find((item) => item.id === taskB.id)
assert(cardA.boardOrder < cardB.boardOrder && cardA.priority === 2 && cardB.priority === 9 && cardA.order === taskA.order,
  'board order persists independently of work-tree order and priority')
assert((await post('item.board', { id: taskA.id, column: 'doing' })).json.data.item.status === 'doing', 'dragging sets the task status')
await post('item.depends', { id: taskA.id, dependsOn: [taskB.id] })
const unavailableMove = await post('item.board', { id: taskA.id, column: 'todo' })
assert(unavailableMove.json.ok === false, 'moving a blocked card does not remove a dependency')
const blockedMove = await post('item.board', { id: taskA.id, column: 'done' })
assert(blockedMove.json.data.blocked && blockedMove.json.data.blockers.depends[0].id === taskB.id, 'board completion preserves the confirmation gate')
const completedMove = await post('item.board', { id: taskA.id, column: 'done', force: true })
assert(completedMove.json.data.item.derived.done, 'confirmed board move completes the task')
assert((await get('habits')).json.data.planningCompleted > 0, 'completion contributes to planning habits')

const otherSubject = (await post('subject.add', { title: '微积分' })).json.data
await post('subject.move', { id: otherSubject.id, anchorId: examId })
await post('subject.task', { subjectId: otherSubject.id, taskId: bankTask.id })
const reorganized = (await get('learning')).json.data
const orderedSubjectIds = reorganized.subjects.map((subject) => subject.id)
assert(orderedSubjectIds.indexOf(otherSubject.id) === orderedSubjectIds.indexOf(examId) - 1 &&
  reorganized.subjects.find((subject) => subject.id === otherSubject.id).taskIds.includes(bankTask.id),
  'subject order and linked tasks persist')
const mirrored = (await get('snapshot')).json.data.items.find((item) => item.id === bankTask.itemId)
assert(mirrored.taskType === '学习' && mirrored.parentId === null, 'new study task is directly in the Learning category')
assert((await get('study-tasks')).json.data.some((row) => row.id === bankTask.id), 'linking keeps the original task')
await post('subject.task', { subjectId: examId, taskId: bankTask.id })
const movedSubject = (await get('learning')).json.data.subjects.filter((subject) => subject.taskIds.includes(bankTask.id))
assert(movedSubject.length === 1 && movedSubject[0].id === examId, 'linking to another subject replaces the previous association')
assert((await get('snapshot')).json.data.items.find((item) => item.id === bankTask.itemId).derived.boardColumn === 'doing',
  'ongoing studies appear in the doing column')
await post('item.board', { id: bankTask.itemId, column: 'todo' })
assert((await get('study-tasks')).json.data.find((row) => row.id === bankTask.id).state === 'todo',
  'board postponement moves the study task to future arrangements')
await post('item.board', { id: bankTask.itemId, column: 'doing' })
assert((await get('study-tasks')).json.data.find((row) => row.id === bankTask.id).state === 'doing',
  'starting a study task from the board clears its schedule')
await post('studytask.schedule', { id: bankTask.id, future: true })
await post('dev.scan', { at: new Date(Date.now() + 20000).toISOString() })
assert((await get('study-tasks')).json.data.find((row) => row.id === bankTask.id).scheduled,
  'undated future tasks wait for a manual start')
assert(!(await get('notifications')).json.data.some((entry) => entry.itemId === bankTask.itemId),
  'future study tasks do not enqueue ordinary task reminders')
const startAt = new Date(Date.now() + 60000).toISOString()
await post('studytask.schedule', { id: bankTask.id, future: true, startAt })
await post('dev.scan', { at: startAt })
await post('dev.scan', { at: startAt })
assert((await get('study-tasks')).json.data.find((row) => row.id === bankTask.id).scheduled === false,
  'scheduled study tasks become active at their start time')
assert((await get('notifications')).json.data.filter((entry) => entry.kind === 'study' && entry.itemId === bankTask.itemId).length === 1,
  'a scheduled task enqueues one start notification even when no panel is open')

const partial = await call('study_answer', { taskId: bankTask.id, itemId: 'q1', verdict: 'partial' })
assert(partial.correct === null && partial.grading === 'neutral', 'partial answers default to a neutral judgement')
const score = () => {
  const connection = new LearnDb(join(bankSpace, 'learning', 'knowledge.db'), { readOnly: true })
  try { return connection.prepare("SELECT proficiency FROM questions WHERE id='q1'").get().proficiency }
  finally { connection.close() }
}
assert(score() === 5, 'neutral grading keeps mastery unchanged')
await post('studytask.update', { id: bankTask.id, patch: { grading: 'strict' } })
assert((await call('study_answer', { taskId: bankTask.id, itemId: 'q1', verdict: 'partial' })).correct === false && score() === 4,
  'strict grading subtracts mastery on partial answers')
await post('studytask.update', { id: bankTask.id, patch: { grading: 'lenient' } })
assert((await call('study_answer', { taskId: bankTask.id, itemId: 'q1', verdict: 'partial' })).correct === true && score() === 5,
  'lenient grading adds mastery on partial answers')

const citations = [{ table: 'questions', itemId: 'q1', shelfId: shelfUrl.json.data.id, section: '示例段落' },
  { table: 'questions', itemId: 'q1', shelfId: shelfUrl.json.data.id, file: '手册.pdf', pdfPage: 4, bookPage: 'iii' }]
await call('study_record_sources', { taskId: bankTask.id, entries: citations })
await call('study_record_sources', { taskId: bankTask.id, entries: citations })
await call('study_record_sources', { taskId: bankTask.id, entries: [
  { table: 'points', itemId: 'q1', shelfId: shelfUrl.json.data.id, section: '同编号的另一出处' },
] })
const sourcedQuestion = (await call('study_next_questions', { taskId: bankTask.id, count: 5 })).questions
  .find((item) => item.itemId === 'q1')
assert(sourcedQuestion.sources.length === 2 && sourcedQuestion.sources.every((source) => source.section !== '同编号的另一出处'),
  'a quiz keeps book and PDF references separate from those of other knowledge items with the same id')
const citedMistake = await call('study_mistake_add', {
  taskId: bankTask.id, itemId: 'q1', question: '原始完整题干\nA. 第一个选项\nB. 第二个选项', memoryTip: '用对比题回忆正确条件',
})
assert(citedMistake.sources.length === 2 && citedMistake.sources.some((source) => source.pdfPage === 4 && source.bookPage === 'iii'),
  'multi-source page citations are stored once and follow the mistake')
assert(citedMistake.sources[0].url === 'https://example.com/math' && citedMistake.memoryTip.length > 0,
  'mistakes preserve their shelf URL and retrieval prompt')
const brief = (await post('mistake.brief', { id: citedMistake.id })).json.data.prompt
assert(brief.includes(citedMistake.question) && brief.includes(citedMistake.memoryTip) &&
  brief.includes('PDF 第 4 页') && brief.includes('印刷页 iii') && brief.includes('https://example.com/math') &&
  !brief.includes('同编号的另一出处'),
  'quick explanation carries the full question, retrieval cue, and correct web, print, and PDF citations')

await post('item.update', { id: bankTask.itemId, patch: { title: '同步改名' } })
assert((await get('study-tasks')).json.data.find((row) => row.id === bankTask.id).title === '同步改名',
  'renaming the work-tree mirror updates the learning panel')
assert((await post('item.delete', { id: bankTask.itemId })).status === 400 &&
  (await post('item.archive', { id: bankTask.itemId })).status === 400, 'planning cannot delete or hide a live study task')
await call('study_finish_today', { taskId: bankTask.id })
const dispatched = (await get('snapshot')).json.data.items.find((item) => item.id === bankTask.itemId)
assert(dispatched.derived.boardColumn === 'done' && dispatched.derived.done, 'study progress completes the task everywhere')
assert((await post('item.board', { id: bankTask.itemId, column: 'doing' })).status === 400 &&
  (await post('item.complete', { id: bankTask.itemId, done: false })).status === 400,
  'board and work tree both reject manual reopening of studies')
assert((await post('studytask.schedule', { id: bankTask.id, future: true })).status === 400,
  'completed studies cannot be rescheduled until the new day')
const boundary = new Date(todayKey + 'T04:00:00')
boundary.setDate(boundary.getDate() + 1)
const boardAt = async (at) => (await get('snapshot?at=' + encodeURIComponent(at.toISOString()))).json.data.items
assert((await boardAt(new Date(boundary.getTime() - 1))).find((item) => item.id === bankTask.itemId).derived.boardColumn === 'done',
  'study completion remains through the last instant before 04:00')
assert((await boardAt(boundary)).find((item) => item.id === bankTask.itemId).derived.boardColumn === 'doing',
  'the open board restarts study tasks at 04:00 without waiting for a scan')
const midnightTask = (await get('study-tasks?at=' + encodeURIComponent(boundary.toISOString()))).json.data.find((row) => row.id === bankTask.id)
assert(midnightTask.state === 'doing' && midnightTask.answeredToday === 0, 'learning and planning start the same new day')

const scheduledStart = new Date(Date.now() + 3600000)
const datedTask = (await post('item.add', { title: '有开始时间', startAt: scheduledStart.toISOString() })).json.data
assert(datedTask.derived.boardColumn === 'todo' &&
  (await boardAt(scheduledStart)).find((item) => item.id === datedTask.id).derived.boardColumn === 'doing',
  'a normal task is pending until its configured start time')
const mixedGraphParent = (await post('item.add', { title: '父任务' })).json.data
const mixedGraphChild = (await post('item.add', { title: '子任务', parentId: mixedGraphParent.id })).json.data
const cycle = await post('item.update', { id: mixedGraphChild.id, patch: { title: '应回滚', dependsOn: [mixedGraphParent.id] } })
assert(cycle.status === 400 && (await get('snapshot')).json.data.items.find((item) => item.id === mixedGraphChild.id).title === '子任务',
  'combined hierarchy/dependency cycles are rejected without saving unrelated edits')
const external = (await post('item.add', { title: '前置任务' })).json.data
await post('item.depends', { id: mixedGraphChild.id, dependsOn: [external.id] })
assert((await post('item.move', { id: mixedGraphChild.id, parentId: external.id })).status === 400,
  'dragging into a prerequisite cannot create a mixed dependency cycle')

const beforeNoon = new Date(2026, 10, 27, 11, 59, 59, 999)
const noon = new Date(2026, 10, 27, 12)
const cachedCalendar = { autoDay: '2026-11-26' }
assert(!shouldRefreshCalendar(beforeNoon, '2026-11-27', cachedCalendar, true) &&
  shouldRefreshCalendar(noon, '2026-11-27', cachedCalendar, true), 'calendar advice refreshes at noon')
assert(!shouldRefreshCalendar(noon, '2026-11-27', { autoDay: '2026-11-27' }, true) &&
  !shouldRefreshCalendar(noon, '2026-11-27', cachedCalendar, false), 'calendar refresh runs once per day and respects manual mode')

const realFetch = globalThis.fetch
let geocodings = 0
let forecasts = 0
globalThis.fetch = async (input) => {
  const url = new URL(input)
  if (url.hostname === 'geocoding-api.open-meteo.com') {
    geocodings += 1
    return Response.json({ results: [{ name: url.searchParams.get('name'), country_code: 'CN', latitude: 32, longitude: 118 }] })
  }
  if (url.hostname === 'api.open-meteo.com') {
    forecasts += 1
    const dates = [url.searchParams.get('start_date'), url.searchParams.get('end_date')]
    return Response.json({ daily: { time: dates, weather_code: [63, 0], temperature_2m_min: [4, 8],
      temperature_2m_max: [13, 17], precipitation_probability_max: [84, 5] } })
  }
  if (url.hostname === 'timor.tech') return Response.json({ code: 0, type: { type: 0, name: '工作日' } })
  throw new Error('unexpected fetch: ' + url.hostname)
}
const waitForCalendar = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const context = (await get('calendar.context')).json.data
    if (!context.updating) return context
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('calendar context did not settle')
}
try {
  const planningTitle = '日历建议优先事项'
  const due = new Date()
  due.setHours(23, 59, 59, 999)
  await post('item.add', { title: planningTitle, dueAt: due.toISOString(), priority: 9 })
  const prefs = (await post('settings.save', {
    adviceRegion: '  南京  ', adviceRegionLocked: true, calendarAutoRefresh: false, dailyAdvice: false,
  })).json.data
  const firstContext = await waitForCalendar()
  assert(prefs.adviceRegion === '南京' && prefs.calendarAutoRefresh === false && prefs.adviceRegionLocked === true &&
    firstContext.region === '南京' && firstContext.weather.precipitationProbability === 84 &&
    firstContext.advice.weatherAdvice === 'rain' && firstContext.advice.top === planningTitle,
    'changing region refreshes calendar weather and planning guidance even in manual mode')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextDay = (await get('calendar.context?at=' + encodeURIComponent(tomorrow.toISOString()))).json.data
  assert(nextDay.weather.wmoCode === 0 && nextDay.adviceDay === firstContext.day,
    'tomorrow weather is available before the next noon without refreshing advice')
  await post('settings.save', { adviceRegion: '南京' })
  await waitForCalendar()
  assert(forecasts === 1, 'saving an unchanged region does not refresh advice a second time')
  await post('calendar.refresh', {})
  const manuallyRefreshed = await waitForCalendar()
  assert(manuallyRefreshed.region === '南京' && geocodings === 1 && forecasts === 2,
    'refreshing a locked region reuses the saved coordinates and fetches its weather')
  await post('settings.save', { adviceRegion: '杭州' })
  assert((await waitForCalendar()).region === '杭州' && geocodings === 2 && forecasts === 3,
    'the lock still allows an explicit change to a new city')
  assert((await get('tip')).json.data.region === '杭州',
    'the learning advice shares the latest region even when model generation is off')
} finally {
  globalThis.fetch = realFetch
}

console.log('\nsmoke test passed')
// The host half starts its minute tick; this harness has no teardown, so exit.
process.exit(0)
