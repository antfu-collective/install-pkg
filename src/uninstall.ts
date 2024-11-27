import { existsSync } from 'node:fs'
import process from 'node:process'
import { resolve } from 'node:path'
import { x } from 'tinyexec'
import { detectPackageManager } from './detect'

export interface UninstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
  additionalArgs?: string[]
}

export async function uninstallPackage(names: string | string[], options: UninstallPackageOptions = {}) {
  const detectedAgent = options.packageManager || await detectPackageManager(options.cwd) || 'npm'
  const [agent] = detectedAgent.split('@')

  if (!Array.isArray(names))
    names = [names]

  const args = options.additionalArgs || []

  if (agent === 'pnpm' && existsSync(resolve(options.cwd ?? process.cwd(), 'pnpm-workspace.yaml')))
    args.unshift('-w')

  return x(
    agent,
    [
      agent === 'yarn'
        ? 'remove'
        : 'uninstall',
      options.dev ? '-D' : '',
      ...args,
      ...names,
    ].filter(Boolean),
    {
      nodeOptions: {
        stdio: options.silent ? 'ignore' : 'inherit',
        cwd: options.cwd,
      },
      throwOnError: true,
    },
  )
}
