import { existsSync } from 'node:fs'
import process from 'node:process'
import { resolve } from 'node:path'
import { x } from 'tinyexec'
import { detectPackageManager } from './detect'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
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

  if (agent === 'pnpm' && existsSync(resolve(options.cwd ?? process.cwd(), 'pnpm-workspace.yaml'))) {
    args.unshift(
      '-w',
      /**
       * Prevent pnpm from removing installed devDeps while `NODE_ENV` is `production`
       * @see https://pnpm.io/cli/install#--prod--p
       */
      '--prod=false',
    )
  }

  return x(
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
      nodeOptions: {
        stdio: options.silent ? 'ignore' : 'inherit',
        cwd: options.cwd,
      },
      throwOnError: true,
    },
  )
}
