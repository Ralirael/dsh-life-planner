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
  useRef: (initial) => ({ current: initial }),
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useReducer: (_reduce, initial) => [initial, () => {}],
}

const fakeWindow = {
  __ModuleLoader__: {
    load(input) {
      captured = input
    },
  },
}

const run = new Function('window', code.replace('__internals: {',
  '__internals: { BoardView, TreeView, Modal, DialogActions, DialogDisclosure, MistakeTab, StudyOverview, TodayStudyProgress, studyLocalDayKey, listSkinOptions, applySkin, applySkinChoice, setHostUi, setLegacyBackgroundAssets, anchoredMenuPosition, profileForSkin, normalizeAppearance, colorOfName, adviceBlocks, adviceExcerpt,'))
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
const scheduledStudy = { ...sample[0], dueAt: null, startAt: at(2026, 11, 14, 9) }
assert(groupByDay([scheduledStudy]).get('2026-11-14')[0] === scheduledStudy, 'start-only tasks appear on the calendar at their scheduled day')

const month = monthMatrix(new Date(2026, 10, 1))
assert(month.length === 42, 'monthMatrix always yields 6 weeks')
assert(month[0].date.getDay() === 1, 'monthMatrix starts on Monday')
assert(month.filter((cell) => cell.inMonth).length === 30, 'November 2026 contributes 30 in-month cells')

const week = weekMatrix('2026-11-10')
assert(week.length === 7, 'weekMatrix yields seven days')
assert(week[0].date.getDay() === 1, 'weekMatrix starts on Monday')
assert(week.some((cell) => cell.key === '2026-11-10'), 'weekMatrix contains the selected day')
const { lunarDateLabel } = plugin.__internals
assert(lunarDateLabel(new Date(2026, 10, 27, 12)) === '丙午年 十月十九', 'today uses the Chinese lunar calendar')
assert(lunarDateLabel(new Date(2025, 6, 25, 12)).includes('闰六月初一'), 'lunar dates preserve the leap month')

const descendants = (value) => Array.isArray(value) ? value.flatMap(descendants) :
  value && typeof value === 'object' ? [value, ...descendants(value.children)] : []
const advice = ['', '## **先安排一段复习** ##', '1. 复习错题', '   - 先回想，再核对答案', '2. 预留休息时间', '',
  '> 参考 [官方说明](https://example.invalid/notes)', '',
  '<b>原样文本</b> [脚本链接](javascript:alert(1))']
const { adviceBlocks, adviceExcerpt } = plugin.__internals
const renderedAdvice = descendants(adviceBlocks(advice))
assert(adviceExcerpt(advice) === '先安排一段复习' &&
  ['h4', 'strong', 'ol', 'ul', 'blockquote'].every((tag) => renderedAdvice.some((node) => node.type === tag)),
  'today’s advice renders headings, emphasis, nested lists and quotes with a plain excerpt')
const adviceLinks = renderedAdvice.filter((node) => node.type === 'a')
assert(adviceLinks.length === 1 && adviceLinks[0].props.href === 'https://example.invalid/notes' &&
  renderedAdvice.some((node) => node.children.includes(advice.at(-1))),
  'advice keeps embedded HTML and non-web links as literal text')
const moves = []
const board = plugin.__internals.BoardView({
  t: (key) => key,
  items: sample.map((item) => item.id === 'a' ? { ...item, boardOrder: 0 } : item),
  onMove: (move) => moves.push(move),
  onEdit: () => {},
})
const cards = descendants(board).filter((entry) => entry.props.className === 'lp-card')
assert(cards[0].props.key === 'a', 'board cards render in persisted order regardless of priority')
const dataTransfer = { setData() {} }
const drag = {
  dataTransfer, preventDefault() {}, stopPropagation() {},
  clientY: 30, currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 40 }) },
}
cards[0].props.onDragStart(drag)
cards.find((card) => card.props.key === 'b').props.onDrop(drag)
assert(moves[0].id === 'a' && moves[0].anchorId === 'b' && moves[0].after, 'dropping below the midpoint requests insertion after the target')
cards[0].props.onDragStart(drag)
const columns = descendants(board).filter((entry) => entry.props.className === 'lp-col')
columns.find((column) => column.props.key === 'doing').props.onDrop(drag)
assert(moves[1].id === 'a' && moves[1].column === 'doing', 'drop into an empty column requests a status change')
assert(descendants(board).filter((node) => node.props.className === 'lp-board-count').map((node) => node.children[0]).join(',') === '4,0,0,0',
  'the board displays the item count in each status lane')

let created = 0
const emptyBoard = plugin.__internals.BoardView({ t: (key) => key, items: [], onCreate: () => { created++ } })
descendants(emptyBoard).find((node) => node.props.className === 'lp-board-create').props.onClick()
const emptyTree = plugin.__internals.TreeView({ t: (key) => key, items: [], onNew: () => { created++ } })
descendants(emptyTree).find((node) => node.type === 'button' && node.children.includes('newTask')).props.onClick()
assert(created === 2, 'the empty board and work tree both open the parent view’s task editor')

const { Modal, DialogActions, DialogDisclosure } = plugin.__internals
const footer = ReactStub.createElement(DialogActions, null, 'Save and cancel')
const details = DialogDisclosure({ title: 'Advanced', children: 'Optional fields' })
const modal = descendants(Modal({ title: 'Editor', children: [details, footer] }))
const modalBody = modal.find((node) => node.props.className === 'lp-modal-body')
assert(modalBody.children.includes(details) && !modalBody.children.includes(footer) && modal.includes(footer),
  'advanced fields scroll inside the modal while actions stay outside the body')

const anchored = plugin.__internals.anchoredMenuPosition(
  { left: 233, right: 262, top: 258, bottom: 286, width: 29 },
  { width: 270, height: 300 },
  { minWidth: 180, height: 200, maxHeight: 240, align: 'end' },
)
assert(anchored.top + 200 < 258 && anchored.left + anchored.width <= 262, 'menus flip above a bottom-right trigger and fit in the viewport')

const { StudyOverview, TodayStudyProgress, studyLocalDayKey, listSkinOptions, applySkin } = plugin.__internals
assert(studyLocalDayKey(new Date(2026, 10, 27, 3, 59)) === '2026-11-26' &&
  studyLocalDayKey(new Date(2026, 10, 27, 4)) === '2026-11-27', 'today study switches dates at local 04:00')
const offeredSkins = listSkinOptions((key) => key)
assert(offeredSkins.some((skin) => skin.value === 'builtin:default') &&
  offeredSkins.some((skin) => skin.value === 'builtin:clawd'), 'Clawd and Default are both selectable presets')
assert(applySkin('clawd') === 'clawd' && applySkin('default') === 'default', 'built-in presets switch in both directions')
const { applySkinChoice, setHostUi, setLegacyBackgroundAssets } = plugin.__internals
const legacyImg = '/life-planner/api/background?asset=' + 'a'.repeat(64) + '.png'
const clawdImg = '/life-planner/api/background?asset=' + 'b'.repeat(64) + '.png'
setLegacyBackgroundAssets({ planning: legacyImg })
setHostUi({
  appearance: { font: { base: 22 }, surface: 0.45, background: { planning: { mode: 'image', imageUrl: '/life-planner/api/background?area=planning&v=5' } } },
  skinBackgrounds: { 'builtin:clawd': { study: { mode: 'image', imageUrl: clawdImg } } },
})
const clawdBackground = applySkinChoice('builtin:clawd').background
const defaultBackground = applySkinChoice('builtin:default').background
assert(clawdBackground.planning.mode === 'none' && clawdBackground.study.imageUrl === clawdImg &&
  defaultBackground.planning.imageUrl === legacyImg && defaultBackground.study.imageUrl !== clawdImg,
  'each skin restores only its own images, and the legacy default is carried forward')
const { profileForSkin, colorOfName } = plugin.__internals
setHostUi({
  activeSkin: 'clawd',
  appearance: { font: { base: 22 }, surface: 0.45 },
  skins: { Notes: { skin: 'default', appearance: { font: { base: 18 } } }, Removed: {} },
  skinProfiles: {
    'builtin:clawd': { skin: 'clawd', appearance: { font: { base: 14, tab: 20 }, size: { mistakeHeight: 280 },
      surface: 0.6, layout: { studyToday: 'stacked' }, background: { study: { mode: 'image', imageUrl: clawdImg, mask: { on: true, width: 60 } } } } },
    'user:Removed': null,
  },
})
const clawdProfile = profileForSkin('builtin:clawd').appearance
const defaultProfile = profileForSkin('builtin:default').appearance
assert(defaultProfile.font.base === 22 && defaultProfile.surface === 0.45 && clawdProfile.font.base === 14 &&
  clawdProfile.font.tab === 20 && clawdProfile.size.mistakeHeight === 280 && clawdProfile.surface === 0.6 &&
  clawdProfile.layout.studyToday === 'stacked' && clawdProfile.background.study.mask.width === 60,
  'a skin round-trips its type scale, card dimensions, layers, transparency and layout as one profile')
assert(profileForSkin('user:Notes').appearance.font.base === 18 &&
  !listSkinOptions((key) => key).some((option) => option.value === 'user:Removed'), 'legacy named skins restore and deleted entries stay hidden')
assert(colorOfName('same', { same: '#aabbcc', 'tag:same': '#112233' }) === '#aabbcc' &&
  colorOfName('same', { same: '#aabbcc', 'tag:same': '#112233' }, 'tag') === '#112233', 'tag and type colors are independent')

const originalUseState = ReactStub.useState
try {
  const tasks = [
    { id: 'now', state: 'doing', title: '背单词', answeredNew: 2, targetNew: 5, answeredReview: 3, targetReview: 10 },
    { id: 'done', state: 'done', title: '复习', answeredNew: 4, targetNew: 4 },
    { id: 'future', state: 'todo', title: '未来任务', scheduled: true },
  ]
  let stateIndex = 0
  ReactStub.useState = (initial) => originalUseState(stateIndex++ === 2 ? tasks : initial)
  const t = (key) => ({ studyTodayCompleted: '{n}/{total} complete', studyNewLabel: 'New', studyReviewLabel: 'Review' }[key] || key)
  const overview = descendants(StudyOverview({ t, data: { plan: [] }, onOpenPlan() {} }))
  const progressView = overview.find((node) => node.type === TodayStudyProgress)
  const progress = descendants(progressView.type(progressView.props))
  assert(progressView.props.tasks.length === 2 && !overview.some((node) => node.children.includes('studyNoTodayPlan')),
    'today shows modern study tasks even with no legacy plan and excludes future tasks')
  assert(progress.some((node) => node.props.role === 'status' && node.children.includes('1/2 complete')) &&
    progress.some((node) => node.children.includes('New 2/5')) &&
    progress.some((node) => node.children.includes('Review 3/10')), 'today counts completion and shows new and review progress')
} finally {
  ReactStub.useState = originalUseState
}
const mistakeState = []
let callIndex = 0
ReactStub.useState = (initial) => {
  const index = callIndex++
  if (!(index in mistakeState)) mistakeState[index] = typeof initial === 'function' ? initial() : initial
  return [mistakeState[index], (value) => { mistakeState[index] = value }]
}
const mistake = {
  id: 'offline-mistake', question: '题干\nA. 选项一\nB. 选项二', memoryTip: '主动回忆线索',
  sources: [{ title: '参考资料', url: 'https://example.invalid/book', pdfPage: 4, bookPage: 'iii' }],
}
const renderMistakes = () => {
  callIndex = 0
  const props = { t: (key) => key, items: [mistake] }
  return descendants(plugin.__internals.MistakeTab(props))
}
try {
  renderMistakes().find((node) => node.props.key === mistake.id && node.props.onDoubleClick).props.onDoubleClick()
  const preview = renderMistakes().find((node) => node.props.title === 'mistakePreview')
  const previewParts = descendants(preview)
  assert(previewParts.some((node) => node.children.includes(mistake.question)) &&
    previewParts.some((node) => node.children.includes(mistake.memoryTip)) &&
    previewParts.some((node) => node.children.some((one) => typeof one === 'string' && one.includes(mistake.sources[0].url))),
    'the mistake details show the full multiline question, retrieval cue, and source')
  previewParts.find((node) => typeof node.props.onClick === 'function' && node.children.includes('edit')).props.onClick()
  assert(renderMistakes().some((node) => node.type === 'textarea' && node.props.value === mistake.question),
    'the mistake editor keeps the original lines and all options')
} finally {
  ReactStub.useState = originalUseState
}

console.log('\nclient smoke test passed')
