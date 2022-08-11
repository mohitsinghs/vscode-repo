import { execSync } from 'child_process'

export class RepositoryStore {
  private _repoPath: string
  list: Record<string, string> = {}
  tree: Record<string, any> = {}

  constructor(repoPath: string) {
    this._repoPath = repoPath
  }

  updateList() {
    const repoData = execSync(`${this._repoPath} cmp -j`)
    this.list = JSON.parse(repoData.toString('utf-8'))
    return this.list
  }

  updateTree() {
    const repoData = execSync(`${this._repoPath} cmp -t`)
    this.tree = JSON.parse(repoData.toString('utf-8'))
    return this.tree
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
