import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { existsSyncMock, xMock } = vi.hoisted(() => ({
  existsSyncMock: vi.fn(() => false),
  xMock: vi.fn(async () => ({})),
}))

vi.mock('node:fs', async importOriginal => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  existsSync: existsSyncMock,
}))

vi.mock('tinyexec', () => ({
  x: xMock,
}))

const { uninstallPackage } = await import('../src/uninstall')

describe('uninstallPackage', () => {
  beforeEach(() => {
    existsSyncMock.mockReset().mockReturnValue(false)
    xMock.mockReset().mockResolvedValue({})
  })

  it('normalizes a single package name into an array', async () => {
    await uninstallPackage('foo', { packageManager: 'npm' })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['uninstall', 'foo'],
      expect.anything(),
    )
  })

  it('uses "remove" for yarn instead of "uninstall"', async () => {
    await uninstallPackage('foo', { packageManager: 'yarn' })
    expect(xMock).toHaveBeenCalledWith(
      'yarn',
      ['remove', 'foo'],
      expect.anything(),
    )
  })

  it('adds -D when dev is set', async () => {
    await uninstallPackage('foo', { packageManager: 'npm', dev: true })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['uninstall', '-D', 'foo'],
      expect.anything(),
    )
  })

  it('adds -w for pnpm when a pnpm workspace is present', async () => {
    existsSyncMock.mockReturnValue(true)
    await uninstallPackage('foo', { packageManager: 'pnpm', cwd: '/some/dir' })
    expect(existsSyncMock).toHaveBeenCalledWith(resolve('/some/dir', 'pnpm-workspace.yaml'))
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['uninstall', '-w', 'foo'],
      expect.anything(),
    )
  })

  it('does not add -w for pnpm without a workspace', async () => {
    existsSyncMock.mockReturnValue(false)
    await uninstallPackage('foo', { packageManager: 'pnpm' })
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['uninstall', 'foo'],
      expect.anything(),
    )
  })

  it('accepts additionalArgs', async () => {
    await uninstallPackage('foo', { packageManager: 'npm', additionalArgs: ['--no-save'] })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['uninstall', '--no-save', 'foo'],
      expect.anything(),
    )
  })

  it('sets stdio to inherit by default and ignore when silent', async () => {
    await uninstallPackage('foo', { packageManager: 'npm', silent: true })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      expect.anything(),
      expect.objectContaining({ nodeOptions: expect.objectContaining({ stdio: 'ignore' }) }),
    )
  })
})
