#!/usr/bin/env bun

/**
 * Claude Code UserPromptSubmit Hook - Pure.md URL Rewriter
 *
 * Intercepts user prompts and rewrites URLs to use pure.md proxy for content.
 * Applies same detection logic as pure-md-proxy but at prompt level.
 */

import type { UserPromptSubmitHandler } from './types'
import { runHook } from './utils'

// Reuse detection constants from pure-md-proxy
const CONTENT_EXTENSIONS = ['.html', '.htm', '.php', '.asp', '.jsp']
const STRUCTURED_EXTENSIONS = ['.json', '.xml', '.csv', '.yaml', '.yml', '.rss', '.atom', '.pdf', '.zip', '.tar', '.gz']
const CONTENT_PATTERNS = [/\/docs?(\/|$)/i, /\/blog(\/|$)/i, /\/article(\/|$)/i, /\/post(\/|$)/i, /\/wiki(\/|$)/i, /\/tutorial(\/|$)/i, /\/guide(\/|$)/i]
const STRUCTURED_PATTERNS = [/\/api\//i, /\/v\d+\//i, /\.api\./i, /\/graphql/i]
const CONTENT_DOMAINS = ['stackoverflow.com', 'medium.com', 'dev.to', 'wikipedia.org', 'docs.github.com']
const NEVER_PROXY_DOMAINS = ['pure.md', 'localhost', '127.0.0.1']

function shouldUsePureMd(url: string): boolean {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname.toLowerCase()

    // Never proxy these
    if (NEVER_PROXY_DOMAINS.some(d => domain.includes(d))) return false
    if (/^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(domain)) return false
    if (url.startsWith('https://pure.md/')) return false

    // Block specific GitHub domains but allow docs.github.com
    if (domain === 'github.com' || domain === 'www.github.com') return false
    if (domain === 'api.github.com' || domain === 'raw.githubusercontent.com') return false

    let score = 0

    // File extension
    const ext = pathname.includes('.') ? pathname.substring(pathname.lastIndexOf('.')).toLowerCase() : ''
    if (ext && CONTENT_EXTENSIONS.includes(ext)) score += 3
    else if (ext && STRUCTURED_EXTENSIONS.includes(ext)) score -= 3
    else if (!ext) score += 1

    // URL patterns
    if (CONTENT_PATTERNS.some(p => p.test(pathname))) score += 2
    if (STRUCTURED_PATTERNS.some(p => p.test(pathname) || p.test(domain))) score -= 2

    // Domains
    if (CONTENT_DOMAINS.some(d => domain.includes(d))) score += 2
    if (domain.startsWith('api.')) score -= 2

    return score >= 3
  } catch {
    return false
  }
}

const handler: UserPromptSubmitHandler = data => {
  const { prompt } = data

  // Extract URLs using regex
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  const urls = prompt.match(urlRegex) || []

  if (urls.length === 0) return

  const contentUrls: string[] = []

  for (const url of urls) {
    if (shouldUsePureMd(url)) {
      contentUrls.push(url)
    }
  }

  if (contentUrls.length === 0) return

  // Inject instruction to rewrite URLs
  const urlList = contentUrls.map(u => `  - ${u} → https://pure.md/${u}`).join('\n')

  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: `<url-rewrite-instruction>
The following URLs should be fetched through pure.md proxy for better content extraction:

${urlList}

When you use WebFetch, automatically prepend https://pure.md/ to these URLs.
</url-rewrite-instruction>`,
    },
  }
}

runHook(handler)
