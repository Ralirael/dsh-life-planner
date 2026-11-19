/**
 * Offline smoke test for the Client half: loads client.js with a fake module
 * loader and a minimal React stub, then runs the plugin's apply() against a fake
 * client context. Catches throwing code without a browser.
 *
 * Run: node plugin/test/smoke-client.mjs
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const code = await readFile(join(here, '..', 'client.js'), 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERT: ${message}`)
  console.log(`ok - ${message}`)
}

let captured

// The page fetches its bundled background through blob URLs; stub just enough
// for the offline harness.
Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:stub', configurable: true, writable: true })
Object.defineProperty(URL, 'revokeObjectURL', { value: () => {}, configurable: true, writable: true })
globalThis.fetch = async () => ({ ok: true, blob: async () => ({ size: 8, type: 'image/webp' }) })
const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
}

const fakeWindow = {
  __ModuleLoader__: {
    load(input) {
      captured = input
    },
  },
}

const run = new Function('window', code)
run(fakeWindow)

if (!captured) throw new Error('client.js never called window.__ModuleLoader__.load')
assert(code.includes('--lp-modal-bg'), 'dialogs use their own opacity token')
console.log(`ok - registered module id: ${captured.id}`)

const plugin = captured.factory((name) => {
  if (name === 'react') return ReactStub
  throw new Error(`unexpected require: ${name}`)
})

if (typeof plugin.apply !== 'function') throw new Error('factory returned no apply()')
console.log('ok - factory returned a plugin with apply()')

const dictionaries = []
const bindings = []
const slotRegistrations = []
const injections = []

const ctx = {
  locale: {
    register(...args) {
      dictionaries.push(args)
      return () => {}
    },
    bind(ns) {
      bindings.push(ns)
      return (key) => `${ns}:${key}`
    },
  },
  slots: {
    inject(slot, callback) {
      injections.push(slot)
      const dispose = callback()
      return typeof dispose === 'function' ? dispose : () => {}
    },
    register(options, component) {
      slotRegistrations.push({ options, component })
      return () => {}
    },
  },
}

plugin.apply(ctx)
console.log('ok - apply() ran without throwing')

const slots = slotRegistrations.map((entry) => `${entry.options.name}#${entry.options.id || entry.options.key}`)
console.log('   slots:', slots.join(', '))
console.log('   injections:', injections.join(', '))
console.log('   locales:', dictionaries.map((d) => `${d[0]}/${d[1]}`).join(', '))

const expected = [
  'sidebar.panellist#life-planner',
  'sidebar.panellist#life-planner-study',
  'main#life-planner',
  'main#life-planner-study',
  'conversation.session.header.utilities#life-planner-switch',
]
for (const want of expected) {
  if (!slots.includes(want)) throw new Error(`missing slot registration: ${want}`)
}
console.log('ok - all five expected slot registrations present')

if (dictionaries.length !== 2) throw new Error('expected two locale dictionaries')
if (bindings[0] !== 'life-planner') throw new Error('locale namespace mismatch')
console.log('ok - locale namespace and dictionaries registered')

for (const entry of slotRegistrations) {
  if (typeof entry.component !== 'function') throw new Error(`component for ${entry.options.name} is not a function`)
}
console.log('ok - every registration exposes a component')

// --- calendar helpers ------------------------------------------------------
const { groupByDay, monthMatrix, weekMatrix, topTask } = plugin.__internals
const at = (year, month, day, hour) => new Date(year, month - 1, day, hour, 0, 0).toISOString()
const sample = [
  { id: 'a', kind: 'task', title: '低优先级', dueAt: at(2026, 11, 10, 9), priority: 2, derived: { done: false, archived: false } },
  { id: 'b', kind: 'task', title: '高优先级', dueAt: at(2026, 11, 10, 13), priority: 8, derived: { done: false, archived: false } },
  { id: 'c', kind: 'task', title: '隔天任务', dueAt: at(2026, 11, 12, 9), priority: 5, derived: { done: false, archived: false } },
  { id: 'd', kind: 'task', title: '无截止', dueAt: null, priority: 9, derived: { done: false, archived: false } },
]

const grouped = groupByDay(sample)
assert(grouped.size === 2, 'groupByDay puts due items on two local days')
assert((grouped.get('2026-11-10') || []).length === 2, 'both same-day items land on one key')
assert((grouped.get('2026-11-12') || []).length === 1, 'the later item lands on its own key')
assert(topTask(grouped.get('2026-11-10')).id === 'b', 'topTask picks by priority, not insertion order')

const month = monthMatrix(new Date(2026, 10, 1))
assert(month.length === 42, 'monthMatrix always yields 6 weeks')
assert(month[0].date.getDay() === 1, 'monthMatrix starts on Monday')
assert(month.filter((cell) => cell.inMonth).length === 30, 'November 2026 contributes 30 in-month cells')

const week = weekMatrix('2026-11-10')
assert(week.length === 7, 'weekMatrix yields seven days')
assert(week[0].date.getDay() === 1, 'weekMatrix starts on Monday')
assert(week.some((cell) => cell.key === '2026-11-10'), 'weekMatrix contains the selected day')

console.log('\nclient smoke test passed')
