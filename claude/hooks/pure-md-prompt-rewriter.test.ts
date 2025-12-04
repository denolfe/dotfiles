import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'child_process'

/**
 * Helper to run hook with test input
 */
function runHook(prompt: string) {
  const input = {
    session_id: 'test',
    transcript_path: 'test',
    cwd: '.',
    hook_event_name: 'UserPromptSubmit',
    prompt,
  }

  const result = spawnSync('/Users/edenolf/.dotfiles/claude/hooks/pure-md-prompt-rewriter.ts', {
    input: JSON.stringify(input),
    encoding: 'utf-8',
  })

  if (result.stdout) {
    return JSON.parse(result.stdout)
  }
  return null
}

/**
 * Helper to check if URL is in the rewrite list
 */
function expectUrlRewritten(result: any, url: string) {
  expect(result).toBeTruthy()
  expect(result.hookSpecificOutput.hookEventName).toBe('UserPromptSubmit')
  expect(result.hookSpecificOutput.additionalContext).toContain(url)
  expect(result.hookSpecificOutput.additionalContext).toContain(`https://pure.md/${url}`)
}

/**
 * Helper to check that no URLs were rewritten
 */
function expectNoRewrite(result: any) {
  expect(result).toBeNull()
}

describe('pure-md-prompt-rewriter', () => {
  describe('Clear content (should rewrite to pure.md)', () => {
    test('documentation URL with /docs/ path', () => {
      const url = 'https://example.com/docs/guide/'
      const result = runHook(`read the documentation at ${url}`)

      expectUrlRewritten(result, url)
    })

    test('documentation URL with /docs path (no trailing slash)', () => {
      const url = 'https://payloadcms.com/docs'
      const result = runHook(`read the docs at ${url}`)

      expectUrlRewritten(result, url)
    })

    test('Stack Overflow question', () => {
      const url = 'https://stackoverflow.com/questions/123'
      const result = runHook(`read the article at ${url}`)

      expectUrlRewritten(result, url)
    })

    test('blog post with .html extension', () => {
      const url = 'https://example.com/blog/post.html'
      const result = runHook(`read blog post at ${url}`)

      expectUrlRewritten(result, url)
    })

    test('multiple URLs in same prompt', () => {
      const url1 = 'https://stackoverflow.com/questions/123'
      const url2 = 'https://stackoverflow.com/questions/456'
      const result = runHook(`Compare ${url1} and ${url2}`)

      expectUrlRewritten(result, url1)
      expectUrlRewritten(result, url2)
    })
  })

  describe('Clear structured data (should NOT rewrite)', () => {
    test('API endpoint with /api/ path', () => {
      const url = 'https://api.github.com/repos/user/repo'
      const result = runHook(`fetch repo data from ${url}`)

      expectNoRewrite(result)
    })

    test('raw.githubusercontent.com CSV file', () => {
      const url = 'https://raw.githubusercontent.com/user/repo/main/data.csv'
      const result = runHook(`get data from ${url}`)

      expectNoRewrite(result)
    })

    test('JSON file extension', () => {
      const url = 'https://example.com/api/v1/users.json'
      const result = runHook(`fetch API endpoint data from ${url}`)

      expectNoRewrite(result)
    })
  })

  describe('Edge cases (should NOT rewrite)', () => {
    test('already proxied URL', () => {
      const url = 'https://pure.md/https://example.com'
      const result = runHook(`get content from ${url}`)

      expectNoRewrite(result)
    })

    test('localhost URL', () => {
      const url = 'http://localhost:3000/api'
      const result = runHook(`get local API from ${url}`)

      expectNoRewrite(result)
    })

    test('127.0.0.1 URL', () => {
      const url = 'http://127.0.0.1:8080/test'
      const result = runHook(`test local server ${url}`)

      expectNoRewrite(result)
    })

    test('private IP (192.168)', () => {
      const url = 'http://192.168.1.100/admin'
      const result = runHook(`access ${url}`)

      expectNoRewrite(result)
    })

    test('PDF file', () => {
      const url = 'https://example.com/doc.pdf'
      const result = runHook(`get PDF from ${url}`)

      expectNoRewrite(result)
    })

    test('pure.md domain itself', () => {
      const url = 'https://pure.md/'
      const result = runHook(`visit ${url}`)

      expectNoRewrite(result)
    })

    test('pure.md subdomain', () => {
      const url = 'https://docs.pure.md/guide'
      const result = runHook(`read ${url}`)

      expectNoRewrite(result)
    })

    test('github.com main domain (blocked for repo access)', () => {
      const url = 'https://github.com/user/repo'
      const result = runHook(`read the page at ${url}`)

      expectNoRewrite(result)
    })

    test('docs.github.com (GitHub documentation)', () => {
      const url = 'https://docs.github.com/en/actions/quickstart'
      const result = runHook(`read the GitHub Actions docs at ${url}`)

      expectUrlRewritten(result, url)
    })
  })

  describe('Mixed content (selective rewriting)', () => {
    test('content URL + API URL → only content rewritten', () => {
      const contentUrl = 'https://stackoverflow.com/questions/123'
      const apiUrl = 'https://api.example.com/data.json'
      const result = runHook(`Compare ${contentUrl} and fetch data from ${apiUrl}`)

      expect(result).toBeTruthy()
      expectUrlRewritten(result, contentUrl)
      expect(result.hookSpecificOutput.additionalContext).not.toContain(
        `https://pure.md/${apiUrl}`
      )
    })

    test('no URLs in prompt', () => {
      const result = runHook('What is the best way to learn TypeScript?')

      expectNoRewrite(result)
    })
  })

  describe('URL scoring edge cases', () => {
    test('no extension defaults to content', () => {
      const url = 'https://example.com/users'
      const result = runHook(`check ${url}`)

      // No extension gets +1, needs +2 more to reach threshold
      // This won't reach threshold without additional signals
      expectNoRewrite(result)
    })

    test('content domain with no extension → rewrite', () => {
      const url = 'https://stackoverflow.com/users/123'
      const result = runHook(`view ${url}`)

      // stackoverflow.com (+2) + no extension (+1) = 3 → should rewrite
      expectUrlRewritten(result, url)
    })

    test('structured extension prevents rewrite', () => {
      const url = 'https://stackoverflow.com/data.json'
      const result = runHook(`fetch ${url}`)

      // stackoverflow.com (+2) + .json (-3) = -1 → should NOT rewrite
      expectNoRewrite(result)
    })
  })
})
