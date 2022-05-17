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
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'repositories',
      new RepositoryProvider()
    )
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}
