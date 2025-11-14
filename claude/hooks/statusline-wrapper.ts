#!/usr/bin/env bun

import { basename } from 'path'

const input = await Bun.stdin.text()
const data = JSON.parse(input)
const cwd = data.cwd

// Get git branch
let branch = ''
try {
  const proc = Bun.spawn(['git', '-C', cwd, 'branch', '--show-current'], {
    stdout: 'pipe',
  })
  branch = (await new Response(proc.stdout).text()).trim()
} catch {
  // Not a git repo or error
}

// Call ccusage with the input
const ccusage = Bun.spawn(['bun', 'x', 'ccusage', 'statusline'], {
  stdin: 'pipe',
  stdout: 'pipe',
})

await ccusage.stdin.write(input)
await ccusage.stdin.end()

const output = await new Response(ccusage.stdout).text()

// Default: 🤖 Sonnet 4.5 | 💰 $0.00 session / $0.35 today / $0.59 block (3h 43m left) | 🔥 $0.69/hr | 🧠 N/A

// Compact output
const compacted = output
  .replace(/^🤖[^|]+\|\s*/, '') // Remove model section
  .replace(/\s*\/\s*\$[\d.]+\s+block[^|]*/, '') // Remove block cost
  .replace(/\s+session/g, '') // Remove "session" label
  .replace(/(\$[\d.]+)\s+today/g, '📅 $1 ') // Replace with calendar emoji at front
  .trim()

// Add directory and branch
const dir = basename(cwd)
const branchInfo = branch ? ` (${branch})` : ''
const result = `${compacted} | 📁 ${dir}${branchInfo}`

process.stdout.write(result)
