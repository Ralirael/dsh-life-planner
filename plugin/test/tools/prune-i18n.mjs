// Removes dictionary keys that no client source references.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const file = join(root, 'src/client/i18n.js')
const text = readFileSync(file, 'utf8')

const start = text.indexOf('  zh: {')
const end = text.indexOf('\n  },', start)
const body = text.slice(start, end)
const keys = [...body.matchAll(/^ {4}([A-Za-z0-9_]+):/gm)].map((m) => m[1])

const sources = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (entry.name.endsWith('.js')) sources.push(path)
  }
}
walk(join(root, 'src/client'))
const used = sources.map((f) => readFileSync(f, 'utf8')).join('\n')

const dynamicPrefixes = ['wd', 'filter_', 'priority', 'fade_']
const unused = new Set(
  keys.filter(
    (key) =>
      !dynamicPrefixes.some((prefix) => key.startsWith(prefix)) &&
      !used.includes(`'${key}'`) &&
      !used.includes('`' + key),
  ),
)

const kept = text
  .split(/\r?\n/)
  .filter((line) => {
    const match = /^ {4}([A-Za-z0-9_]+):/.exec(line)
    return !match || !unused.has(match[1])
  })
  .join('\n')

writeFileSync(file, kept, 'utf8')
console.log('removed', unused.size, 'unused keys:', [...unused].sort().join(', '))
