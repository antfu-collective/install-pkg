import type { Agent } from 'package-manager-detector'
import process from 'node:process'
import { detect } from 'package-manager-detector/detect'

export type { Agent } from 'package-manager-detector'

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun'

export async function detectPackageManager(cwd = process.cwd()): Promise<Agent | null> {
  const result = await detect({
    cwd,
    onUnknown(packageManager) {
      console.warn('[@antfu/install-pkg] Unknown packageManager:', packageManager)
      return undefined
    },
  })

  return result?.agent || null
}
