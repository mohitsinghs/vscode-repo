import * as vscode from 'vscode'
import { RepositoryPicker } from './quickpick'
import { RepositoryProvider, ViewMode } from './repositoryProvider'
import { showRepositoryStatus } from './statusbar'
import { RepositoryStore } from './store'
import { buildUri, getBinaryPath, getConfigPath } from './utils'

export async function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('_repo.open', async (node: string | any) => {
    const uri = buildUri(node)
    try {
      await vscode.commands.executeCommand('vscode.openFolder', uri, false)
    } catch (e) {
      vscode.window.showInformationMessage('Could not open the project!')
    }
  })

  let treeAsDefault = vscode.workspace
    .getConfiguration('repositories')
    .get('treeAsDefault') as boolean

  vscode.commands.executeCommand(
    'setContext',
    'repositories.hasTree',
    treeAsDefault
  )

  const repoPath = await getBinaryPath(context)
  if (repoPath === '') return

  const store = new RepositoryStore(repoPath)

  const repositoryProvider = new RepositoryProvider(
    store,
    treeAsDefault ? ViewMode.tree : ViewMode.list
  )

  const repositoryPicker = new RepositoryPicker(store)

  vscode.commands.registerCommand('_repo.refresh', () =>
    repositoryProvider.refresh()
  )

  vscode.commands.registerCommand('_repo.asTree', () => {
    vscode.commands.executeCommand('setContext', 'repositories.hasTree', true)
    repositoryProvider.switchMode(ViewMode.tree)
  })

  vscode.commands.registerCommand('_repo.asList', () => {
    vscode.commands.executeCommand('setContext', 'repositories.hasTree', false)
    repositoryProvider.switchMode(ViewMode.list)
  })

  vscode.commands.registerCommand('_repo.editConfig', () => {
    const configPath = getConfigPath()
    if (configPath) {
      vscode.workspace
        .openTextDocument(vscode.Uri.file(configPath))
        .then((cfg) => {
          vscode.window.showTextDocument(cfg, vscode.ViewColumn.Active, false)
        })
    }
  })

  vscode.commands.registerCommand('_repo.listRepos', async () => {
    const repo = await repositoryPicker.pickRepositories()
    if (repo) {
      const uri = buildUri(repo.description)
      try {
        await vscode.commands.executeCommand('vscode.openFolder', uri, false)
      } catch (e) {
        vscode.window.showInformationMessage('Could not open the project!')
      }
    }
  })

  const disposable = vscode.window.registerTreeDataProvider(
    'repositories',
    repositoryProvider
  )

  showRepositoryStatus(store)

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
