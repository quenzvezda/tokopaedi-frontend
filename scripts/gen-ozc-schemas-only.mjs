#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// Usage: node scripts/gen-ozc-schemas-only.mjs <input> <output>
const [,, input, output] = process.argv
if (!input || !output) {
  console.error('Usage: node scripts/gen-ozc-schemas-only.mjs <inputSpec> <outputFile>')
  process.exit(1)
}

const tmpOut = path.join(tmpdir(), `ozc-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`)

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

try {
  // Generate with openapi-zod-client, include schemas & types, ignore client specifics later
  await run('npx', [
    '-y',
    'openapi-zod-client',
    input,
    '--output', tmpOut,
    '--export-schemas',
    '--export-types',
    '--with-docs=false',
    '--with-description=false',
  ])

  let code = await fs.readFile(tmpOut, 'utf8')
  // Strip zodios client pieces
  code = code.replace(/^import\s+\{[^}]*\}\s+from\s+'@zodios\/core';?\r?\n/gm, '')
  code = code.replace(/^const\s+endpoints\s*=\s*makeApi\([\s\S]*?\);?\r?\n/gm, '')
  code = code.replace(/^export\s+const\s+api\s*=\s*new\s+Zodios[\s\S]*?;?\r?\n/gm, '')
  code = code.replace(/^export?\s*function\s+createApiClient[\s\S]*?\}\r?\n/gm, '')
  // Tidy extra blank lines
  code = code.replace(/\n{3,}/g, '\n\n')

  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, code, 'utf8')
} catch (err) {
  console.error(err)
  process.exit(1)
} finally {
  try { await fs.unlink(tmpOut) } catch {}
}
