import { execSync } from 'child_process'
import * as vscode from 'vscode'

export interface Root {
  path: string
  depth?: number
}

export interface RepoValue {
  label: string
  location: string
  provider: string
  branch: string
}

export class RepositoryStore {
  private _repoPath: string
  private _roots?: Root[]
  list: Record<string, RepoValue> = {}
  tree: Record<string, any> = {}

  constructor(repoPath: string, roots?: Root[]) {
    this._repoPath = repoPath
    this._roots = roots
  }

  updateList() {
    try {
      const repoData = execSync(
        this._roots?.length
          ? `${this._repoPath} cmp -j -c '${JSON.stringify({
              roots: this._roots,
            })}'`
          : `${this._repoPath} cmp -j`
      )
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
      const repoData = execSync(
        this._roots?.length
          ? `${this._repoPath} cmp -t -c '${JSON.stringify({
              roots: this._roots,
            })}'`
          : `${this._repoPath} cmp -t`
      )

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
    const result = Object.values(this.list).find(
      (value) => value.location.toLocaleLowerCase() === p.toLocaleLowerCase()
    )
    if (result) return result
  }
}
