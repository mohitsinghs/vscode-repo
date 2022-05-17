import * as vscode from 'vscode'
import { RepositoryProvider } from './repositoryProvider'

function buildUri(node: string | any): vscode.Uri {
  if (typeof node === 'string') {
    return vscode.Uri.file(node)
  } else {
    return vscode.Uri.file(node.command.arguments[0])
  }
}

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('_repo.open', async (node: string | any) => {
    const uri = buildUri(node)
    try {
      await vscode.commands.executeCommand('vscode.openFolder', uri, false)
    } catch (e) {
      vscode.window.showInformationMessage('Could not open the project!')
    }
  })
  const repositoryProvider = new RepositoryProvider()
  vscode.commands.registerCommand('_repo.refresh', () =>
    repositoryProvider.refresh()
  )
  const disposable = vscode.window.registerTreeDataProvider(
    'repositories',
    repositoryProvider
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
