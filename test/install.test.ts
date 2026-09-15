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

const { installPackage } = await import('../src/install')

describe('installPackage', () => {
  beforeEach(() => {
    existsSyncMock.mockReset().mockReturnValue(false)
    xMock.mockReset().mockResolvedValue({})
  })

  it('normalizes a single package name into an array', async () => {
    await installPackage('foo', { packageManager: 'npm' })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['install', 'foo'],
      expect.anything(),
    )
  })

  it('passes through multiple package names', async () => {
    await installPackage(['foo', 'bar'], { packageManager: 'npm' })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['install', 'foo', 'bar'],
      expect.anything(),
    )
  })

  it('uses "add" for yarn instead of "install"', async () => {
    await installPackage('foo', { packageManager: 'yarn' })
    expect(xMock).toHaveBeenCalledWith(
      'yarn',
      ['add', 'foo'],
      expect.anything(),
    )
  })

  it('adds -D when dev is set', async () => {
    await installPackage('foo', { packageManager: 'npm', dev: true })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'foo'],
      expect.anything(),
    )
  })

  it('always adds --config.prod=false for pnpm', async () => {
    await installPackage('foo', { packageManager: 'pnpm' })
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['install', '--config.prod=false', 'foo'],
      expect.anything(),
    )
  })

  it('adds -w for pnpm when a pnpm workspace is present', async () => {
    existsSyncMock.mockReturnValue(true)
    await installPackage('foo', { packageManager: 'pnpm', cwd: '/some/dir' })
    expect(existsSyncMock).toHaveBeenCalledWith('/some/dir/pnpm-workspace.yaml')
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['install', '-w', '--config.prod=false', 'foo'],
      expect.anything(),
    )
  })

  it('does not add -w for pnpm without a workspace', async () => {
    existsSyncMock.mockReturnValue(false)
    await installPackage('foo', { packageManager: 'pnpm' })
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['install', '--config.prod=false', 'foo'],
      expect.anything(),
    )
  })

  it('adds --prefer-offline when preferOffline is set', async () => {
    await installPackage('foo', { packageManager: 'npm', preferOffline: true })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['install', '--prefer-offline', 'foo'],
      expect.anything(),
    )
  })

  it('uses --cached instead of --prefer-offline for yarn berry', async () => {
    await installPackage('foo', { packageManager: 'yarn@berry', preferOffline: true })
    expect(xMock).toHaveBeenCalledWith(
      'yarn',
      ['add', '--cached', 'foo'],
      expect.anything(),
    )
  })

  it('accepts additionalArgs as an array', async () => {
    await installPackage('foo', { packageManager: 'npm', additionalArgs: ['--no-save'] })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      ['install', '--no-save', 'foo'],
      expect.anything(),
    )
  })

  it('accepts additionalArgs as a function receiving the agent and detected agent', async () => {
    const additionalArgs = vi.fn(() => ['--no-save'])
    await installPackage('foo', { packageManager: 'pnpm@9.0.0', additionalArgs })
    expect(additionalArgs).toHaveBeenCalledWith('pnpm', 'pnpm@9.0.0')
    expect(xMock).toHaveBeenCalledWith(
      'pnpm',
      ['install', '--config.prod=false', '--no-save', 'foo'],
      expect.anything(),
    )
  })

  it('sets stdio to inherit by default and ignore when silent', async () => {
    await installPackage('foo', { packageManager: 'npm' })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      expect.anything(),
      expect.objectContaining({ nodeOptions: expect.objectContaining({ stdio: 'inherit' }) }),
    )

    await installPackage('foo', { packageManager: 'npm', silent: true })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      expect.anything(),
      expect.objectContaining({ nodeOptions: expect.objectContaining({ stdio: 'ignore' }) }),
    )
  })

  it('passes cwd through to the spawned process', async () => {
    await installPackage('foo', { packageManager: 'npm', cwd: '/my/project' })
    expect(xMock).toHaveBeenCalledWith(
      'npm',
      expect.anything(),
      expect.objectContaining({ nodeOptions: expect.objectContaining({ cwd: '/my/project' }) }),
    )
  })
})
