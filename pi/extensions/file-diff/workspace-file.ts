// Workspace-scoped file reading derived from pi-tool-display 0.5.0 by MasuRii (MIT). See ./LICENSE.
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, relative, resolve } from 'node:path'

export type WorkspaceFileRead = {
  exists: boolean
  content?: string
}

/** Reading the pre-write file is only for display, so anything large is skipped. */
const MAX_READ_BYTES = 1_000_000

/** Reads a utf8 file only when it resolves inside the workspace; never throws. */
export function readWorkspaceUtf8File(params: { cwd: string; path: unknown }): WorkspaceFileRead {
  const rawPath = typeof params.path === 'string' ? params.path.trim() : ''
  if (!rawPath) return { exists: false }

  const resolvedPath = resolveWorkspacePath(params.cwd, rawPath)
  if (!existsSync(resolvedPath)) return { exists: false }

  try {
    // Both sides are realpaths so a symlinked workspace root still contains its own files.
    if (!isWithinWorkspace(safeRealpath(params.cwd), safeRealpath(resolvedPath))) return { exists: false }

    const stats = statSync(resolvedPath)
    if (!stats.isFile() || stats.size > MAX_READ_BYTES) return { exists: true }

    return { exists: true, content: readFileSync(resolvedPath, 'utf8') }
  } catch {
    return { exists: true }
  }
}

function resolveWorkspacePath(cwd: string, rawPath: string): string {
  const expanded = expandHome(rawPath)
  return isAbsolute(expanded) ? expanded : resolve(cwd, expanded)
}

function expandHome(rawPath: string): string {
  if (rawPath === '~') return homedir()
  if (rawPath.startsWith('~/') || rawPath.startsWith('~\\')) return `${homedir()}${rawPath.slice(1)}`
  return rawPath
}

function isWithinWorkspace(workspacePath: string, targetPath: string): boolean {
  const relativePath = relative(workspacePath, targetPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

function safeRealpath(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return resolve(path)
  }
}
