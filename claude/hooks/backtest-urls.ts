#!/usr/bin/env bun

/**
 * Backtest URL rewriter against last 2 weeks of conversations
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

// Reuse detection logic from rewriter
const CONTENT_EXTENSIONS = ['.html', '.htm', '.php', '.asp', '.jsp']
const STRUCTURED_EXTENSIONS = ['.json', '.xml', '.csv', '.yaml', '.yml', '.rss', '.atom', '.pdf', '.zip', '.tar', '.gz']
const CONTENT_PATTERNS = [/\/docs?(\/|$)/i, /\/blog(\/|$)/i, /\/article(\/|$)/i, /\/post(\/|$)/i, /\/wiki(\/|$)/i, /\/tutorial(\/|$)/i, /\/guide(\/|$)/i]
const STRUCTURED_PATTERNS = [/\/api\//i, /\/v\d+\//i, /\.api\./i, /\/graphql/i]
const CONTENT_DOMAINS = ['stackoverflow.com', 'medium.com', 'dev.to', 'wikipedia.org', 'docs.github.com']
const NEVER_PROXY_DOMAINS = ['pure.md', 'localhost', '127.0.0.1']

function shouldUsePureMd(url: string): { rewrite: boolean; score: number; reasons: string[] } {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname.toLowerCase()

    // Never proxy these
    if (NEVER_PROXY_DOMAINS.some(d => domain.includes(d))) {
      return { rewrite: false, score: 0, reasons: ['Never proxy domain'] }
    }
    if (/^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(domain)) {
      return { rewrite: false, score: 0, reasons: ['Private IP'] }
    }
    if (url.startsWith('https://pure.md/')) {
      return { rewrite: false, score: 0, reasons: ['Already proxied'] }
    }

    // Block specific GitHub domains but allow docs.github.com
    if (domain === 'github.com' || domain === 'www.github.com') {
      return { rewrite: false, score: 0, reasons: ['Main GitHub domain'] }
    }
    if (domain === 'api.github.com' || domain === 'raw.githubusercontent.com') {
      return { rewrite: false, score: 0, reasons: ['GitHub API/raw'] }
    }

    let score = 0
    const reasons: string[] = []

    // File extension
    const ext = pathname.includes('.') ? pathname.substring(pathname.lastIndexOf('.')).toLowerCase() : ''
    if (ext && CONTENT_EXTENSIONS.includes(ext)) {
      score += 3
      reasons.push(`content ext (${ext})`)
    } else if (ext && STRUCTURED_EXTENSIONS.includes(ext)) {
      score -= 3
      reasons.push(`structured ext (${ext})`)
    } else if (!ext) {
      score += 1
      reasons.push('no extension')
    }

    // URL patterns
    if (CONTENT_PATTERNS.some(p => p.test(pathname))) {
      score += 2
      reasons.push('content path')
    }
    if (STRUCTURED_PATTERNS.some(p => p.test(pathname) || p.test(domain))) {
      score -= 2
      reasons.push('structured path')
    }

    // Domains
    if (CONTENT_DOMAINS.some(d => domain.includes(d))) {
      score += 2
      reasons.push('content domain')
    }
    if (domain.startsWith('api.')) {
      score -= 2
      reasons.push('API subdomain')
    }

    return { rewrite: score >= 3, score, reasons }
  } catch {
    return { rewrite: false, score: 0, reasons: ['Invalid URL'] }
  }
}

function extractUrlsFromConversation(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const urls: string[] = []

  for (const line of lines) {
    try {
      const entry = JSON.parse(line)

      // Only look at user message entries
      if (entry.type !== 'user') continue
      if (!entry.message) continue

      const message = entry.message

      // Only process user role messages
      if (message.role !== 'user') continue

      // Extract text content
      let text = ''
      if (typeof message.content === 'string') {
        text = message.content
      } else if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === 'text') {
            text += block.text + ' '
          }
        }
      }

      // Extract URLs
      const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
      const matches = text.match(urlRegex)
      if (matches) {
        urls.push(...matches)
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  }

  return urls
}

// Main
const projectsDir = `${process.env.HOME}/.claude/projects`
const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000)
const allUrls: string[] = []
const urlCounts = new Map<string, number>()

console.log('Scanning conversations from last 14 days...\n')

// Scan all project directories
for (const projectDir of readdirSync(projectsDir)) {
  const projectPath = join(projectsDir, projectDir)
  if (!statSync(projectPath).isDirectory()) continue

  // Scan conversation files
  for (const file of readdirSync(projectPath)) {
    if (!file.endsWith('.jsonl')) continue

    const filePath = join(projectPath, file)
    const stats = statSync(filePath)

    // Skip files older than 2 weeks
    if (stats.mtimeMs < twoWeeksAgo) continue

    const urls = extractUrlsFromConversation(filePath)
    allUrls.push(...urls)
  }
}

// Count and deduplicate
for (const url of allUrls) {
  urlCounts.set(url, (urlCounts.get(url) || 0) + 1)
}

console.log(`Found ${allUrls.length} total URL mentions`)
console.log(`Found ${urlCounts.size} unique URLs\n`)

// Test each unique URL
const results = {
  rewritten: [] as Array<{ url: string, count: number, score: number, reasons: string[] }>,
  notRewritten: [] as Array<{ url: string, count: number, score: number, reasons: string[] }>,
}

for (const [url, count] of urlCounts.entries()) {
  const { rewrite, score, reasons } = shouldUsePureMd(url)

  if (rewrite) {
    results.rewritten.push({ url, count, score, reasons })
  } else {
    results.notRewritten.push({ url, count, score, reasons })
  }
}

// Sort by count (most mentioned first)
results.rewritten.sort((a, b) => b.count - a.count)
results.notRewritten.sort((a, b) => b.count - a.count)

// Print report
console.log('='.repeat(80))
console.log('BACKTEST REPORT: URLs That WOULD Be Rewritten to pure.md')
console.log('='.repeat(80))
console.log()

if (results.rewritten.length === 0) {
  console.log('(None)')
} else {
  for (const { url, count, score, reasons } of results.rewritten) {
    console.log(`✓ [${count}x] ${url}`)
    console.log(`  Score: ${score}, Reasons: ${reasons.join(', ')}`)
    console.log()
  }
}

console.log()
console.log('='.repeat(80))
console.log('URLs That Would NOT Be Rewritten (Direct Fetch)')
console.log('='.repeat(80))
console.log()

if (results.notRewritten.length === 0) {
  console.log('(None)')
} else {
  // Show top 20 most mentioned
  const top20 = results.notRewritten.slice(0, 20)
  for (const { url, count, score, reasons } of top20) {
    console.log(`✗ [${count}x] ${url}`)
    console.log(`  Score: ${score}, Reasons: ${reasons.join(', ')}`)
    console.log()
  }

  if (results.notRewritten.length > 20) {
    console.log(`... and ${results.notRewritten.length - 20} more`)
  }
}

console.log()
console.log('='.repeat(80))
console.log('SUMMARY')
console.log('='.repeat(80))
console.log(`Total unique URLs: ${urlCounts.size}`)
console.log(`Would rewrite: ${results.rewritten.length} (${Math.round(results.rewritten.length / urlCounts.size * 100)}%)`)
console.log(`Would NOT rewrite: ${results.notRewritten.length} (${Math.round(results.notRewritten.length / urlCounts.size * 100)}%)`)

// Domain breakdown
const domainCounts = new Map<string, { rewrite: number, noRewrite: number }>()

for (const { url } of results.rewritten) {
  try {
    const domain = new URL(url).hostname
    const current = domainCounts.get(domain) || { rewrite: 0, noRewrite: 0 }
    current.rewrite++
    domainCounts.set(domain, current)
  } catch {}
}

for (const { url } of results.notRewritten) {
  try {
    const domain = new URL(url).hostname
    const current = domainCounts.get(domain) || { rewrite: 0, noRewrite: 0 }
    current.noRewrite++
    domainCounts.set(domain, current)
  } catch {}
}

console.log()
console.log('Domain Breakdown:')
const sortedDomains = Array.from(domainCounts.entries())
  .sort((a, b) => (b[1].rewrite + b[1].noRewrite) - (a[1].rewrite + a[1].noRewrite))
  .slice(0, 15)

for (const [domain, counts] of sortedDomains) {
  console.log(`  ${domain}: ${counts.rewrite} rewrite, ${counts.noRewrite} direct`)
}
