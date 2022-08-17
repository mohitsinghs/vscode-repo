import { execSync } from 'child_process'
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

  if (
    vscode.workspace
      .getConfiguration('repositories')
      .get('preferBundled') as boolean
  ) {
    if (await fileExits(bundled)) return bundled.fsPath
    if (await isInPath(executableName)) return executableName
  } else {
    if (await isInPath(executableName)) return executableName
    if (await fileExits(bundled)) return bundled.fsPath
  }

  vscode.window.showErrorMessage(
    `repo binary is required but not found.
Please ensure that it is [installed on your system](https://github.com/mohitsinghs/repo/releases/latest).`,
    'Got it'
  )
  return ''
}

export async function getConfigPath(
  repoPath: string
): Promise<vscode.Uri | undefined> {
  const home = os.homedir()
  const configFile = 'repo.yml'
  let configPath
  if (isWindows()) {
    configPath = path.join(
      process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
      configFile
    )
  } else if (isMac()) {
    configPath = path.join(home, 'Library', 'Application Support', configFile)
  } else if (isLinux()) {
    configPath = path.join(
      process.env.XDG_CONFIG_HOME || path.join(home, '.config'),
      configFile
    )
  }

  if (configPath) {
    let cfgUri = vscode.Uri.file(configPath)
    if (!(await fileExits(cfgUri))) {
      try {
        execSync(`${repoPath} init`)
      } catch (error) {
        vscode.window.showErrorMessage('Failed to generate config')
        console.error('failed to generate config', error)
      }
    }
    return cfgUri
  }

  vscode.window.showWarningMessage(
    `Your platform is unsupported, Please [raise an issue](https://github.com/mohitsinghs/vscode-repo/issues/new).`,
    'Got it'
  )
  return
}

export function getCurrentPath() {
  const workspace = vscode.workspace.workspaceFile
    ? vscode.workspace.workspaceFile
    : vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri
    : undefined

  return workspace ? workspace.fsPath : undefined
}

export function buildUri(node: string | any): vscode.Uri {
  if (typeof node === 'string') {
    return vscode.Uri.file(node)
  } else {
    return vscode.Uri.file(node.command.arguments[0])
  }
}
