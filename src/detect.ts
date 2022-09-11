import path from 'path'
import findUp from 'find-up'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

const LOCKS: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
}

/**
 * Detect the package manager and version based on the process.env var
 * "npm_config_user_agent".
 * Falls back to detection by lockfile without version if process.env
 * var is somehow missing.
 */
export async function detectPackageManager(cwd = process.cwd()) {
  let agent: string | null = null
  let version: string | null = null

  if (process.env?.npm_config_user_agent)
    [agent, version] = process.env.npm_config_user_agent.match(/[^\/\s]+/g) ?? []

  if (!agent) {
    const result = await findUp(Object.keys(LOCKS), { cwd })
    agent = (result ? LOCKS[path.basename(result)] : null)
  }

  return [agent, version]
}
