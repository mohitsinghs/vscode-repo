import { execSync } from 'child_process'
import * as vscode from 'vscode'

export class RepositoryStore {
  private _repoPath: string
  list: Record<string, string> = {}
  tree: Record<string, any> = {}

  constructor(repoPath: string) {
    this._repoPath = repoPath
  }

  updateList() {
    try {
      const repoData = execSync(`${this._repoPath} cmp -j`)
      this.list = JSON.parse(repoData.toString('utf-8'))
      return this.list
    } catch (error) {
      vscode.window.showErrorMessage('No repositories detected')
      console.error('failed to retrieve repositories', error)
      return []
    }
  }

  updateTree() {
    try {
      const repoData = execSync(`${this._repoPath} cmp -t`)
      this.tree = JSON.parse(repoData.toString('utf-8'))
      return this.tree
    } catch (error) {
      vscode.window.showErrorMessage('No repositories detected')
      console.error('failed to retrieve repositories', error)
      return {}
    }
  }

  hasListEmpty(): boolean {
    return Object.keys(this.list).length === 0
  }

  findByPath(p: string) {
    const result = Object.entries(this.list).find(
      ([name, location]) =>
        location.toLocaleLowerCase() === p.toLocaleLowerCase()
    )
    if (result) return result[0]
  }
}
