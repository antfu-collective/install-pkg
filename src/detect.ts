import path from 'path'
import findUp from 'find-up'
import { readPackage } from 'read-pkg'

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
 * Detect yarn berry version (2+) based on the .yarn folder and the
 * package.json file.
 * Also checks in parent directories for yarn workspaces.
 */
export async function isYarnBerry(cwd = process.cwd()) {
  const result = await findUp('.yarn', { cwd, type: 'directory' })
  if (!result) return false

  // In yarn v1 was also the possibility that a .yarn folder exists.
  // Check package.json for yarn version.
  const pkg = await readPackage({ cwd: path.dirname(result) })
  if (pkg.packageManager) {
    const resultMatch = pkg.packageManager.match(/yarn@(\d+)/)
    if (resultMatch.length > 1 && resultMatch[1])
      return parseInt(resultMatch[1]) > 1
  }
  return false
}
