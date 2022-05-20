import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'

// Adopted from rust-analyzer extension

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
    `${executableName}${process.platform === 'win32' ? '.exe' : ''}`
  )
  if (await fileExits(bundled)) return bundled.fsPath

  if (await isInPath(executableName)) return executableName

  vscode.window.showErrorMessage(
    `repo binary is required but not found.
Please ensure that it is [installed on your system](https://github.com/mohitsinghs/repo/releases/latest).`
  )
  return ''
}
