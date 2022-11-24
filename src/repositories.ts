import * as vscode from 'vscode'
import { RepositoryStore } from './store'

export enum ViewMode {
  tree,
  list,
}

export interface RepositoryConfig {
  mode: ViewMode
  sort: boolean
}

export class RepositoryProvider implements vscode.TreeDataProvider<Repository> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Repository | undefined | null | void
  > = new vscode.EventEmitter<Repository | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    Repository | undefined | null | void
  > = this._onDidChangeTreeData.event
  _config: RepositoryConfig
  _store: RepositoryStore

  constructor(store: RepositoryStore, config: RepositoryConfig) {
    this._store = store
    this._config = config
  }

  switchMode(mode: ViewMode) {
    this._config.mode = mode
    this.refresh()
  }

  getTreeItem(element: Repository): vscode.TreeItem {
    return element
  }

  getChildren(element?: Repository): Thenable<Repository[]> {
    if (this._config.mode === ViewMode.list) {
      const repos = this.getRepositories()
      if (repos.length) {
        return Promise.resolve(repos)
      } else {
        vscode.window.showInformationMessage('No repositories found')
        return Promise.resolve([])
      }
    } else {
      let values: Repository[] = []
      if (!element) {
        this._store.updateTree()
        Object.keys(this._store.tree).forEach((k: string) => {
          if (k !== '_children') {
            values.push(
              new Repository(k, k, vscode.TreeItemCollapsibleState.Expanded, [
                k,
              ])
            )
          }
        })
        if (
          Array.isArray(this._store.tree._children) &&
          this._store.tree._children.length
        ) {
          values.push(
            ...this._store.tree._children.map((v: any) =>
              this.repoFromValue([], v)
            )
          )
        }
        values.sort((a, b) => a.label.localeCompare(b.label))
      } else {
        let ref = this._store.tree
        let lookup = element?.lookup
        if (lookup?.length) {
          let i = 0
          while (i < lookup.length) {
            ref = ref[lookup[i]]
            i++
          }
        }
        if (Array.isArray(ref)) {
          values = ref.map((v) => this.repoFromValue(lookup, v))
        } else {
          if (Array.isArray(ref._children) && ref._children.length) {
            values.push(
              ...ref._children.map((v: any) => this.repoFromValue(lookup, v))
            )
          }
          Object.keys(ref).forEach((k: string) => {
            if (k !== '_children') {
              values.push(
                new Repository(k, k, vscode.TreeItemCollapsibleState.Expanded, [
                  ...(lookup || []),
                  k,
                ])
              )
            }
          })
        }
      }
      if (this._config.sort) {
        values.sort((a, b) => a.label.localeCompare(b.label))
      }
      return Promise.resolve(values)
    }
  }

  private repoFromValue(lookup: string[] | undefined, v: any): Repository {
    return new Repository(
      v.label,
      v.location,
      vscode.TreeItemCollapsibleState.None,
      [...(lookup || [])]
    )
  }

  private getRepositories(): Repository[] {
    this._store.updateList()
    const repos = this._store.list
    return Object.entries(repos).map(
      ([name, path]) =>
        new Repository(name, path, vscode.TreeItemCollapsibleState.None)
    )
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }
}

export class Repository extends vscode.TreeItem {
  public lookup: string[] | undefined
  constructor(
    public readonly label: string,
    public readonly location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    lookup?: string[]
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.location}`
    this.lookup = lookup
  }
  isFolder = this.label === this.location
  iconPath = new vscode.ThemeIcon(this.isFolder ? 'folder' : 'repo')
  command = this.isFolder
    ? undefined
    : {
        title: 'vscode.open',
        command: '_repo.open',
        arguments: [this.location],
      }
  contextValue = this.isFolder ? 'folder' : 'repository'
}
