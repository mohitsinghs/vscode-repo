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
      let repos: Repository[] = this.getReposTree(element)
      if (this._config.sort) {
        repos.sort((a, b) => a.label.localeCompare(b.label))
      }
      return Promise.resolve(repos)
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

  private getReposTree(element?: Repository): Repository[] {
    let values: Repository[] = []
    if (!element) {
      this._store.updateTree()
      values.push(...this.processNode(this._store.tree, []))
    } else {
      let ref = this._store.tree
      let lookup = element?.lookup || []
      for (const key of lookup) {
        ref = ref[key]
      }
      if (Array.isArray(ref)) {
        values = ref.map((v) => this.repoFromValue(lookup, v))
      } else {
        values.push(...this.processNode(ref, lookup))
      }
    }
    return values
  }

  private processNode(
    node: Record<string, any>,
    lookup: string[]
  ): Repository[] {
    let values: Repository[] = []
    // append direct descendants
    if (Array.isArray(node._children) && node._children.length) {
      values.push(
        ...node._children.map((v: any) => this.repoFromValue(lookup, v))
      )
    }
    // append descendants with keys
    values.push(
      ...Object.keys(node)
        .filter((k) => k !== '_children')
        .map(
          (k) =>
            new Repository(k, k, vscode.TreeItemCollapsibleState.Expanded, [
              ...(lookup || []),
              k,
            ])
        )
    )
    return values
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
