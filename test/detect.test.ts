import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectPackageManager } from '../src/detect'

describe('detectPackageManager', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'install-pkg-test-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('detects pnpm from lockfile', async () => {
    writeFileSync(join(dir, 'pnpm-lock.yaml'), '')
    const agent = await detectPackageManager(dir)
    expect(agent).toBe('pnpm')
  })

  it('detects yarn from lockfile', async () => {
    writeFileSync(join(dir, 'yarn.lock'), '')
    const agent = await detectPackageManager(dir)
    expect(agent).toBe('yarn')
  })

  it('detects npm from lockfile', async () => {
    writeFileSync(join(dir, 'package-lock.json'), '{}')
    const agent = await detectPackageManager(dir)
    expect(agent).toBe('npm')
  })

  it('detects bun from lockfile', async () => {
    writeFileSync(join(dir, 'bun.lock'), '')
    const agent = await detectPackageManager(dir)
    expect(agent).toBe('bun')
  })

  it('detects agent from package.json packageManager field', async () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ packageManager: 'pnpm@9.0.0' }))
    const agent = await detectPackageManager(dir)
    expect(agent).toBe('pnpm')
  })

  it('returns null when nothing is detected', async () => {
    const agent = await detectPackageManager(dir)
    expect(agent).toBeNull()
  })

  it('warns and returns null on unknown packageManager', async () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ packageManager: 'notreal@1.0.0' }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const agent = await detectPackageManager(dir)
    expect(agent).toBeNull()
    expect(warn).toHaveBeenCalledWith('[@antfu/install-pkg] Unknown packageManager:', 'notreal@1.0.0')
    warn.mockRestore()
  })
})
