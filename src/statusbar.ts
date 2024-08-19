import * as path from 'path'
import * as vscode from 'vscode'
import { RepositoryStore } from './store'
import { getCurrentPath, getIconByProvider } from './utils'

let status: vscode.StatusBarItem

export function showRepositoryStatus(store: RepositoryStore) {
  const shouldShow = vscode.workspace
    .getConfiguration('repositories')
    .get('showInStatusBar') as boolean
  const rootPath = getCurrentPath()

  if (!shouldShow || !rootPath) return

  if (store.hasListEmpty()) {
    store.updateList()
  }

  if (!status) {
    status = vscode.window.createStatusBarItem(
      'repositories.statusBar',
      vscode.StatusBarAlignment.Left
    )
    status.name = 'Repositories'
  }

  status.tooltip = rootPath
  status.command = '_repo.listRepos'

  const repo = store.findByPath(rootPath)

  if (repo) {
    const provider = getIconByProvider(repo.provider)
    status.text = `$(${provider}) ${repo.label}`
  } else {
    console.log({ repo, rootPath, store: store.list })
    status.text = `$(folder) ${path.basename(rootPath)}`
  }
  status.show()
}
