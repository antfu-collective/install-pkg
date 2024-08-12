import process from 'node:process'
import { type Agent, detect } from 'package-manager-detector'

export { type Agent } from 'package-manager-detector'

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun'

export async function detectPackageManager(cwd = process.cwd()): Promise<Agent | null> {
  return (await detect({
    cwd,
    onUnknown: (packageManager) => { console.warn('[@antfu/install-pkg] Unknown packageManager:', packageManager) },
  }))?.agent || null
}
