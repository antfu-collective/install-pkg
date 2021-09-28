import execa from 'execa'
import { detectAgent } from '.'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
}

export async function installPackage(name: string, options: InstallPackageOptions = {}) {
  const agent = options.packageManager || await detectAgent(options.cwd) || 'npm'
  return execa(
    agent,
    [
      agent === 'yarn'
        ? 'add'
        : 'install',
      name,
      options.dev ? '-D' : '',
    ],
    {
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd,
    },
  )
}
