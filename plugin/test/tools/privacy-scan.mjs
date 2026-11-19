/**
 * Privacy scan for a release directory: looks for personal paths, user names,
 * credentials and stray local data before a package is published.
 *
 *   node test/tools/privacy-scan.mjs <release-directory>
 *
 * Extend the extra needles with `LP_PRIVACY_EXTRA=a,b` when a machine has a
 * known user name that must not ship.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const root = process.argv[2]
if (!root) {
  console.error('usage: node test/tools/privacy-scan.mjs <release-directory>')
  process.exit(2)
}

const extra = String(process.env.LP_PRIVACY_EXTRA || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const patterns = [
  { name: 'windows-user-path', test: /[A-Za-z]:\\Users\\/i },
  { name: 'posix-user-path', test: /\/Users\/[^/\s"']+/ },
  { name: 'home-path', test: /\/home\/[^/\s"']+/ },
  { name: 'email', test: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, allow: /@(local|deepseek-ai)\// },
  { name: 'openai-key', test: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'github-token', test: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { name: 'aws-key', test: /AKIA[0-9A-Z]{16}/ },
  { name: 'jwt', test: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'private-key', test: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'secret-assign', test: /(?:api[_-]?key|secret|token|password|passwd|access[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: 'cn-mobile', test: /(?<!\d)1[3-9]\d{9}(?!\d)/ },
  { name: 'cn-id', test: /(?<!\d)(?:\d{17}[\dXx]|\d{15})(?!\d)/ },
  { name: 'landline', test: /(?<!\d)0\d{2,3}-?\d{7,8}(?!\d)/ },
  { name: 'bank-card', test: /(?<!\d)\d{16,19}(?!\d)/ },
  { name: 'qq-context', test: /(?:QQ|qq|群号|扣扣)\s*[:\uff1a]?\s*\d{5,11}/ },
  { name: 'wechat', test: /(?:微信|wechat)\s*[:\uff1a]?\s*[A-Za-z][A-Za-z0-9_-]{5,19}/i },
  { name: 'name-context', test: /(?:姓名|名字|真实姓名|作者|联系人|author)\s*[:\uff1a=]\s*["']?[\u4e00-\u9fa5A-Za-z][^\s"',}]{1,20}/ },
  { name: 'mac-address', test: /(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/ },
]

const skipExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.zip'])
const skipFiles = new Set(['privacy-scan.mjs'])

const hits = []
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full)
      continue
    }
    if (skipFiles.has(entry.name) || skipExtensions.has(extname(entry.name).toLowerCase())) continue
    if (statSync(full).size > 8 * 1024 * 1024) continue
    let text
    try {
      text = readFileSync(full, 'utf8')
    } catch {
      continue
    }
    for (const needle of extra) {
      if (text.includes(needle)) hits.push({ file: relative(root, full), kind: 'extra', sample: needle })
    }
    for (const pattern of patterns) {
      const match = text.match(pattern.test)
      if (!match) continue
      if (pattern.allow && pattern.allow.test(text.slice(Math.max(0, match.index - 20), match.index + 40))) continue
      hits.push({
        file: relative(root, full),
        kind: pattern.name,
        sample: text.slice(Math.max(0, match.index - 30), match.index + 60).replace(/\s+/g, ' '),
      })
    }
  }
}
walk(root)

if (hits.length === 0) {
  console.log(`privacy scan passed: ${root}`)
  process.exit(0)
}
for (const hit of hits) console.log(`${hit.file} [${hit.kind}] ${hit.sample}`)
console.error(`privacy scan failed: ${hits.length} hit(s)`)
process.exit(1)
