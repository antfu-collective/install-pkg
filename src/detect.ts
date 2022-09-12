import path from 'path'
import findUp from 'find-up'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

const LOCKS: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
}

export async function detectPackageManager(cwd = process.cwd()) {
  const result = await findUp(Object.keys(LOCKS), { cwd })
  const agent = (result ? LOCKS[path.basename(result)] : null)
  return agent
}

/**
 * Detect yarn berry version (2+) based on the .yarn folder which did not
 * exists in version 1.
 * Also checks in parent directories for yarn workspaces.
 */
export async function isYarnBerry(cwd = process.cwd()) {
  const result = await findUp('.yarn', { cwd, type: 'directory' })
  return !!result
}
