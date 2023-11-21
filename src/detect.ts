import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { findUp } from 'find-up'

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun'

const AGENTS = ['pnpm', 'yarn', 'npm', 'pnpm@6', 'yarn@berry', 'bun'] as const
export type Agent = typeof AGENTS[number]

const LOCKS: Record<string, PackageManager> = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
}

export async function detectPackageManager(cwd = process.cwd()): Promise<Agent | null> {
  let agent: Agent | null = null
  const lockPath = await findUp(Object.keys(LOCKS), { cwd })
  let packageJsonPath: string | undefined

  if (lockPath)
    packageJsonPath = path.resolve(lockPath, '../package.json')
  else
    packageJsonPath = await findUp('package.json', { cwd })

  if (packageJsonPath && fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      if (typeof pkg.packageManager === 'string') {
        const [name, version] = pkg.packageManager.split('@')
        if (name === 'yarn' && Number.parseInt(version) > 1)
          agent = 'yarn@berry'
        else if (name === 'pnpm' && Number.parseInt(version) < 7)
          agent = 'pnpm@6'
        else if (AGENTS.includes(name))
          agent = name
        else
          console.warn('[ni] Unknown packageManager:', pkg.packageManager)
      }
    }
    catch {}
  }

  // detect based on lock
  if (!agent && lockPath)
    agent = LOCKS[path.basename(lockPath)]

  return agent
}
