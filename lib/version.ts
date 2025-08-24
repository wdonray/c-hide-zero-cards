// Version utility for accessing version information
import packageJson from '../package.json'

export function getVersion(): string {
  return packageJson.version
}

export const VERSION = getVersion()
