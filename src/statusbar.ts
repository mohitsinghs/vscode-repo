import * as vscode from 'vscode'
import { RepositoryStore } from './store'
import { getCurrentPath } from './utils'

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
  status.text = '$(repo) '
  status.command = '_repo.listRepos'

  const repoName = store.findByPath(rootPath)
  if (repoName) {
    status.text += repoName
    status.show()
  }
}
