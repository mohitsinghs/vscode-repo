import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'

// Part of this file is derived from rust analyzer extension.

const isWindows = () => process.platform === 'win32'
const isMac = () => process.platform === 'darwin'
const isLinux = () => process.platform === 'linux'

async function isInPath(exec: string): Promise<boolean> {
  return (
    await Promise.all(
      (process.env.PATH ?? '')
        .split(path.delimiter)
        .flatMap((dirInPath) => {
          const candidate = path.join(dirInPath, exec)
          return os.type() === 'Windows_NT'
            ? [candidate, `${candidate}.exe`]
            : [candidate]
        })
        .map((path) => fileExits(vscode.Uri.file(path)))
    )
  ).some((isFile) => isFile)
}

async function fileExits(uri: vscode.Uri): Promise<boolean> {
  try {
    return (
      ((await vscode.workspace.fs.stat(uri)).type & vscode.FileType.File) !== 0
    )
  } catch {
    return false
  }
}

export async function getBinaryPath(
  context: vscode.ExtensionContext,
  executableName = 'repo'
): Promise<string> {
  const bundled = vscode.Uri.joinPath(
    context.extensionUri,
    'bin',
    `${executableName}${isWindows() ? '.exe' : ''}`
  )

  if (await isInPath(executableName)) return executableName
  if (await fileExits(bundled)) return bundled.fsPath

  vscode.window.showErrorMessage(
    `repo binary is required but not found.
Please ensure that it is [installed on your system](https://github.com/mohitsinghs/repo/releases/latest).`,
    'Got it'
  )
  return ''
}

export function getConfigPath(): string {
  const home = os.homedir()
  const configFile = 'repo.yml'
  if (isWindows()) {
    return path.join(
      process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
      configFile
    )
  } else if (isMac()) {
    return path.join(home, 'Library', 'Application Support', configFile)
  } else if (isLinux()) {
    return path.join(
      process.env.XDG_CONFIG_HOME || path.join(home, '.config'),
      configFile
    )
  } else {
    vscode.window.showWarningMessage(
      `Your platform is unsupported, Please [raise an issue](https://github.com/mohitsinghs/vscode-repo/issues/new).`,
      'Got it'
    )
    return ''
  }
}
