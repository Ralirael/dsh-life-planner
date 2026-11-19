// Zero-dependency bundler: concatenates src/client sources into plugin/client.js.
// Order matters: shared helpers and UI primitives first, the entry object last.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = join(here, 'src', 'client')
const entry = join(srcDir, 'index.js')
const target = join(here, 'client.js')
const { version } = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'))

// Everything whose order is load-bearing is listed here; the rest is appended
// by directory, so a new file only needs an entry when it must load early.
const FIXED = [
  'i18n.js',
  'skin.js',
  'skins.js',
  'appearance.js',
  'helpers.js',
  'ui.js',
  'background.js',
  'api.js',
]
const ORDERED_DIRS = ['', 'views', 'dialogs', 'panels']

function modulesIn(directory) {
  return readdirSync(join(srcDir, directory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    // Sort so the bundle never depends on filesystem order.
    .map((entry) => (directory ? `${directory}/${entry.name}` : entry.name))
    .sort()
}

const modules = []
for (const fixed of FIXED) modules.push(fixed)
for (const directory of ORDERED_DIRS) {
  for (const name of modulesIn(directory)) {
    if (name === 'index.js' || name === 'app.js' || FIXED.includes(name)) continue
    modules.push(name)
  }
}
modules.push('app.js')

const template = readFileSync(entry, 'utf8')
// Only the entry template may carry the factory object; a stray `return {`
// anywhere else silently replaces it (this happened once with a stale copy).
const strayReturn = modules
  .filter((name) => name !== 'app.js')
  // Column 0 only: the include marker sits at the factory body's top level, so a
  // stray return there would replace the factory object. Indented returns belong
  // to ordinary functions.
  .find((name) => /^return\s*\{/m.test(readFileSync(join(srcDir, name), 'utf8')))
if (strayReturn) {
  throw new Error(`${strayReturn} contains a top-level "return {" — only app.js may define the factory object`)
}

// Every module shares one scope, so a duplicate top-level declaration silently
// replaces an earlier one. Catch that at build time instead of at runtime.
const declared = new Map()
for (const name of modules) {
  const source = readFileSync(join(srcDir, name), 'utf8')
  const pattern = /^(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)/gm
  let match
  while ((match = pattern.exec(source)) !== null) {
    const symbol = match[1] || match[2]
    const previous = declared.get(symbol)
    if (previous) {
      throw new Error(`duplicate top-level declaration "${symbol}" in ${name} (already defined in ${previous})`)
    }
    declared.set(symbol, name)
  }
}
const out = template.replace(/\/\*__INCLUDES__\*\//, () =>
  modules
    .map((name) => `// ---- ${name} ----\n${readFileSync(join(srcDir, name), 'utf8').trimEnd()}\n`)
    .join('\n'),
)
if (out === template || !out.includes('// ---- app.js ----')) {
  throw new Error('index.js is missing the /*__INCLUDES__*/ marker; client.js would be empty')
}
if (!out.includes('__PLUGIN_VERSION__')) {
  throw new Error('version placeholder __PLUGIN_VERSION__ is missing from the client sources')
}
const stamped = out.split('__PLUGIN_VERSION__').join(version)

writeFileSync(target, stamped, 'utf8')
console.log(`built client.js from ${modules.length} modules (${stamped.split('\n').length} lines), version ${version}`)
for (const name of modules) console.log('  -', name)
