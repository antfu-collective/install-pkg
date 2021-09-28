import execa from 'execa'
import { detectPackageManager } from '.'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
}

export async function installPackage(names: string | string[], options: InstallPackageOptions = {}) {
  const agent = options.packageManager || await detectPackageManager(options.cwd) || 'npm'
  if (!Array.isArray(names))
    names = [names]

  return execa(
    agent,
    [
      agent === 'yarn'
        ? 'add'
        : 'install',
      options.dev ? '-D' : '',
      ...names,
    ].filter(Boolean),
    {
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd,
    },
  )
}
