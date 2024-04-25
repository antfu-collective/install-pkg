import { existsSync } from 'node:fs'
import process from 'node:process'
import { resolve } from 'node:path'
import { async as ezspawn } from '@jsdevtools/ez-spawn'
import { detectPackageManager } from '.'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
  packageManagerVersion?: string
  preferOffline?: boolean
  additionalArgs?: string[]
}

export async function installPackage(names: string | string[], options: InstallPackageOptions = {}) {
  const detectedAgent = options.packageManager || await detectPackageManager(options.cwd) || 'npm'
  const [agent] = detectedAgent.split('@')

  if (!Array.isArray(names))
    names = [names]

  const args = options.additionalArgs || []

  if (options.preferOffline) {
    // yarn berry uses --cached option instead of --prefer-offline
    if (detectedAgent === 'yarn@berry')
      args.unshift('--cached')
    else
      args.unshift('--prefer-offline')
  }

  if (agent === 'pnpm' && existsSync(resolve(options.cwd ?? process.cwd(), 'pnpm-workspace.yaml')))
    args.unshift('-w')

  return ezspawn(
    agent,
    [
      agent === 'yarn'
        ? 'add'
        : 'install',
      options.dev ? '-D' : '',
      ...args,
      ...names,
    ].filter(Boolean),
    {
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd,
    },
  )
}
