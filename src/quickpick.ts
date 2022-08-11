import * as vscode from 'vscode'
import { RepositoryStore } from './store'

class Repository implements vscode.QuickPickItem {
  label: string
  description: string

  constructor(label: string, location: string) {
    this.label = label
    this.description = location
  }
}

export class RepositoryPicker {
  private _store: RepositoryStore

  constructor(store: RepositoryStore) {
    this._store = store
  }

  public async pickRepositories() {
    const disposables: vscode.Disposable[] = []

    try {
      return await new Promise<Repository | undefined>((resolve, reject) => {
        this._store.updateList()
        const repos = this._store.list
        if (!repos || this._store.hasListEmpty()) {
          vscode.window.showInformationMessage('No repositories are found')
          resolve(undefined)
        }

        const input = vscode.window.createQuickPick<Repository>()
        input.placeholder = 'Search repositories...'
        input.items = Object.entries(repos).map(
          ([label, location]) => new Repository(label, location)
        )
        input.onDidChangeSelection((repos) => {
          const repo = repos[0]
          if (repo) {
            input.hide()
            resolve(repo)
          }
        })
        input.onDidHide(() => {
          input.dispose()
          resolve(undefined)
        })
        input.show()
      })
    } finally {
      disposables.forEach((d) => d.dispose())
    }
  }
}
