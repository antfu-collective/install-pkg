import execa from 'execa'
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
  const [agentDetected, versionDetected] = await detectPackageManager(options.cwd)
  const agent = options.packageManager || agentDetected || 'npm'
  // use version from options only if packageManager is also set by options
  const version = options.packageManager && options.packageManagerVersion
    ? options.packageManagerVersion
    // use detected version only if detected packageManager is also used
    : agentDetected === agent ? versionDetected : null

  if (!Array.isArray(names))
    names = [names]

  const args = options.additionalArgs || []

  if (options.preferOffline) {
    // yarn v2+ uses --cached option instead of --prefer-offline
    if (agent === 'yarn' && version && !version.startsWith('1.'))
      args.unshift('--cached')
    else
      args.unshift('--prefer-offline')
  }

  return execa(
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
