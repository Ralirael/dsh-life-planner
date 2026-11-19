// Collapses the repeated "fetch a study task or throw" guard into one helper.
import { readFileSync, writeFileSync } from 'node:fs'

const file = 'index.js'
let text = readFileSync(file, 'utf8')

if (!text.includes('function requireStudyTaskRow(')) {
  const anchor = '  /** Hard deletes must not leave dangling references behind'
  if (!text.includes(anchor)) throw new Error('anchor not found')
  const helper = `  /** Every study-task method starts with the same lookup and error. */
  function requireStudyTaskRow(id) {
    const row = db.prepare('SELECT * FROM study_tasks WHERE id=?').get(id)
    if (!row) throw new Error(\\\`study task not found: \\\${id}\\\`)
    return row
  }

`
  text = text.replace(anchor, helper + anchor)
}

const pattern =
  /const (\w+) = db\.prepare\('SELECT \* FROM study_tasks WHERE id=\?'\)\.get\(([\w.]+)\)\n\s+if \(!\1\) throw new Error\(`study task not found: \$\{\2\}`\)/g
let replaced = 0
text = text.replace(pattern, (match, name, arg) => {
  replaced += 1
  return `const ${name} = requireStudyTaskRow(${arg})`
})

writeFileSync(file, text, 'utf8')
console.log('collapsed', replaced, 'study-task guards')
