import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildPendingEditPreviewData,
  buildPendingWritePreviewData,
} from '../pending-diff-preview'

const temporaryDirectories: string[] = []

async function temporaryWorkspace(prefix: string): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), prefix))
  temporaryDirectories.push(workspace)
  return workspace
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe('pending write preview projection', () => {
  test('compares complete content with an existing workspace file', async () => {
    const workspace = await temporaryWorkspace('pi-write-preview-')
    await writeFile(join(workspace, 'sample.txt'), 'before\n')

    expect(buildPendingWritePreviewData({ path: 'sample.txt', content: 'after\n' }, workspace)).toEqual({
      filePath: 'sample.txt',
      previousContent: 'before\n',
      nextContent: 'after\n',
      fileExistedBeforeWrite: true,
      headerLabel: 'pending overwrite',
      notice: undefined,
    })
  })

  test('labels a missing workspace file as a pending create', async () => {
    const workspace = await temporaryWorkspace('pi-write-preview-')

    expect(buildPendingWritePreviewData({ path: 'new.txt', content: 'created\n' }, workspace)).toMatchObject({
      filePath: 'new.txt',
      nextContent: 'created\n',
      fileExistedBeforeWrite: false,
      headerLabel: 'pending create',
    })
  })
})

describe('pending edit preview projection', () => {
  test('projects multiple unique non-overlapping replacements', async () => {
    const workspace = await temporaryWorkspace('pi-edit-preview-')
    await writeFile(join(workspace, 'sample.txt'), 'alpha\nbeta\ngamma\n')

    const preview = buildPendingEditPreviewData({
      path: 'sample.txt',
      edits: [
        { oldText: 'alpha', newText: 'one' },
        { oldText: 'gamma', newText: 'three' },
      ],
    }, workspace)

    expect(preview?.notice).toBeUndefined()
    expect(preview?.previousContent).toBe('alpha\nbeta\ngamma\n')
    expect(preview?.nextContent).toBe('one\nbeta\nthree\n')
    expect(preview?.headerLabel).toBe('pending edit')
  })

  test('projects a partial newText value once oldText matches uniquely', async () => {
    const workspace = await temporaryWorkspace('pi-edit-preview-')
    await writeFile(join(workspace, 'sample.txt'), 'status: before\n')

    const preview = buildPendingEditPreviewData({
      path: 'sample.txt',
      oldText: 'status: before',
      newText: 'status: str',
    }, workspace)

    expect(preview?.notice).toBeUndefined()
    expect(preview?.nextContent).toBe('status: str\n')
  })

  test('keeps the line boundary stable until a streamed edit is complete', async () => {
    const workspace = await temporaryWorkspace('pi-edit-boundary-')
    await writeFile(join(workspace, 'sample.txt'), 'alpha\nbeta\n')
    const args = { path: 'sample.txt', oldText: 'alpha\n', newText: 'one' }

    const streaming = buildPendingEditPreviewData(args, workspace, { isPartialArguments: true })
    const complete = buildPendingEditPreviewData(args, workspace, { isPartialArguments: false })
    const streamingWithNewline = buildPendingEditPreviewData(
      { ...args, newText: 'one\n' }, workspace, { isPartialArguments: true },
    )

    expect(streaming?.nextContent).toBe('one\nbeta\n')
    expect(streamingWithNewline?.nextContent).toBe('one\nbeta\n')
    expect(complete?.nextContent).toBe('onebeta\n')
  })

  test('does not invent a boundary when the next edit replaces the adjacent text', async () => {
    const workspace = await temporaryWorkspace('pi-edit-adjacent-')
    await writeFile(join(workspace, 'sample.txt'), 'a\nb')
    const args = {
      path: 'sample.txt',
      edits: [
        { oldText: 'a\n', newText: 'x' },
        { oldText: 'b', newText: 'y' },
      ],
    }

    const preview = buildPendingEditPreviewData(args, workspace, { isPartialArguments: true })

    expect(preview?.nextContent).toBe('xy')
  })

  test('does not add a line break when the old text has none', async () => {
    const workspace = await temporaryWorkspace('pi-edit-boundary-')
    await writeFile(join(workspace, 'sample.txt'), 'alpha beta\n')

    const streaming = buildPendingEditPreviewData(
      { path: 'sample.txt', oldText: 'alpha', newText: 'one' },
      workspace,
      { isPartialArguments: true },
    )

    expect(streaming?.nextContent).toBe('one beta\n')
  })

  test('returns a non-projectable notice for incomplete replacement fields', async () => {
    const workspace = await temporaryWorkspace('pi-edit-preview-')
    await writeFile(join(workspace, 'sample.txt'), 'status: before\n')

    const preview = buildPendingEditPreviewData({
      path: 'sample.txt',
      oldText: 'status: before',
    }, workspace)

    expect(preview?.nextContent).toBeUndefined()
    expect(preview?.notice).toContain('did not include exact replacement blocks')
  })

  test('preserves BOM and CRLF while accepting LF replacement blocks', async () => {
    const workspace = await temporaryWorkspace('pi-edit-preview-')
    await writeFile(join(workspace, 'sample.txt'), '\uFEFFalpha\r\nbeta\r\ngamma\r\n')

    const preview = buildPendingEditPreviewData({
      path: 'sample.txt',
      oldText: 'alpha\nbeta',
      newText: 'alpha\nupdated',
    }, workspace)

    expect(preview?.notice).toBeUndefined()
    expect(preview?.nextContent).toBe('\uFEFFalpha\r\nupdated\r\ngamma\r\n')
  })

  test('rejects missing, ambiguous, and overlapping replacements', async () => {
    const workspace = await temporaryWorkspace('pi-edit-preview-')
    await writeFile(join(workspace, 'sample.txt'), 'alpha alpha beta\n')

    const missing = buildPendingEditPreviewData(
      { path: 'sample.txt', oldText: 'missing', newText: 'new' },
      workspace,
    )
    expect(missing?.notice).toContain('did not match')

    const ambiguous = buildPendingEditPreviewData(
      { path: 'sample.txt', oldText: 'alpha', newText: 'new' },
      workspace,
    )
    expect(ambiguous?.notice).toContain('matched 2 regions')

    const overlapping = buildPendingEditPreviewData({
      path: 'sample.txt',
      edits: [
        { oldText: 'alpha alpha', newText: 'one' },
        { oldText: 'alpha beta', newText: 'two' },
      ],
    }, workspace)
    expect(overlapping?.notice).toContain('overlap')
  })
})

describe('pending preview read safety', () => {
  test('does not read absolute paths or symlink targets outside the workspace', async () => {
    const workspace = await temporaryWorkspace('pi-preview-workspace-')
    const outside = await temporaryWorkspace('pi-preview-outside-')
    const outsideFile = join(outside, 'secret.txt')
    await writeFile(outsideFile, 'secret\n')
    await symlink(outsideFile, join(workspace, 'escape.txt'))

    for (const path of [outsideFile, 'escape.txt']) {
      const preview = buildPendingEditPreviewData(
        { path, oldText: 'secret', newText: 'exposed' },
        workspace,
      )
      expect(preview?.previousContent).toBeUndefined()
      expect(preview?.nextContent).toBeUndefined()
      expect(preview?.notice).toContain('outside the current workspace')
    }
  })

  test('does not read files over the preview limit', async () => {
    const workspace = await temporaryWorkspace('pi-preview-large-')
    await mkdir(join(workspace, 'nested'))
    await writeFile(join(workspace, 'nested/large.txt'), 'x'.repeat(1_000_001))

    const preview = buildPendingEditPreviewData(
      { path: 'nested/large.txt', oldText: 'x', newText: 'y' },
      workspace,
    )

    expect(preview?.previousContent).toBeUndefined()
    expect(preview?.nextContent).toBeUndefined()
    expect(preview?.notice).toContain('preview read limit')
  })
})
