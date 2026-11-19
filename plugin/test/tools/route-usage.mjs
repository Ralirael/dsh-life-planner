// Reports router methods that no client or test calls.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const host = readFileSync(join(root, 'index.js'), 'utf8')
const methods = [...host.matchAll(/case '([a-zA-Z0-9_.-]+)':/g)].map((m) => m[1])
const getMethods = [...host.matchAll(/method === '([a-zA-Z0-9_-]+)'/g)].map((m) => m[1])

const sources = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (/\.(js|mjs)$/.test(entry.name)) sources.push(path)
  }
}
walk(join(root, 'src', 'client'))
walk(join(root, 'test'))
const text = sources.map((file) => readFileSync(file, 'utf8')).join('\n')

const all = [...new Set([...methods, ...getMethods])]
const unused = all.filter((name) => !text.includes(`'${name}'`) && !text.includes(`"${name}"`))
console.log('total route methods:', all.length)
console.log('unused:', unused.sort().join(', '))
