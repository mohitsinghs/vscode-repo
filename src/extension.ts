import * as vscode from 'vscode'
import { RepositoryPicker } from './quickpick'
import {
  Repository,
  RepositoryConfig,
  RepositoryProvider,
  ViewMode,
} from './repositories'
import { showRepositoryStatus } from './statusbar'
import { RepositoryStore } from './store'
import { getBinaryPath, getConfigPath, openFolder } from './utils'

export async function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('_repo.open', async (node: string | any) => {
    await openFolder(node)
  })

  let treeAsDefault = vscode.workspace
    .getConfiguration('repositories')
    .get('treeAsDefault') as boolean

  let sortByName = vscode.workspace
    .getConfiguration('repositories')
    .get('sortByName') as boolean

  vscode.commands.executeCommand(
    'setContext',
    'repositories.hasTree',
    treeAsDefault
  )

  const repoPath = await getBinaryPath(context)
  if (repoPath === '') return

  const store = new RepositoryStore(repoPath)
  const config: RepositoryConfig = {
    mode: treeAsDefault ? ViewMode.tree : ViewMode.list,
    sort: sortByName,
  }
  const repositoryProvider = new RepositoryProvider(store, config)

  const repositoryPicker = new RepositoryPicker(store)

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('repositories.sortByName')) {
      config.sort = vscode.workspace
        .getConfiguration('repositories')
        .get('sortByName') as boolean
      repositoryProvider.refresh()
    }
  })

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

  vscode.commands.registerCommand('_repo.editConfig', async () => {
    const configPath = await getConfigPath(repoPath)
    if (configPath) {
      const cfg = await vscode.workspace.openTextDocument(configPath)
      vscode.window.showTextDocument(cfg, vscode.ViewColumn.Active, false)
    }
  })

  vscode.commands.registerCommand(
    '_repo.openInNewWindow',
    async (repo: Repository) => {
      if (repo) {
        await openFolder(repo.location, true)
      }
    }
  )

  vscode.commands.registerCommand('_repo.listRepos', async () => {
    const repo = await repositoryPicker.pickRepositories()
    if (repo) {
      await openFolder(repo.description)
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
