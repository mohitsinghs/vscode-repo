import * as vscode from 'vscode'
import { RepoValue, RepositoryStore } from './store'
import { getIconByProvider } from './utils'

export enum ViewMode {
  tree = 0,
  list = 1,
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

  updateStore(store: RepositoryStore) {
    this._store = store
    this.refresh()
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
      }
      vscode.window.showInformationMessage('No repositories found')
      return Promise.resolve([])
    }
    const repos: Repository[] = this.getReposTree(element)
    if (this._config.sort) {
      repos.sort((a, b) => a.label.localeCompare(b.label))
    }
    return Promise.resolve(repos)
  }

  private repoFromValue(
    lookup: string[] | undefined,
    v: RepoValue
  ): Repository {
    return new Repository(
      v.label,
      v.location,
      vscode.TreeItemCollapsibleState.None,
      [...(lookup || [])],
      v.provider,
      v.branch
    )
  }

  private getReposTree(element?: Repository): Repository[] {
    let values: Repository[] = []
    if (!element) {
      this._store.updateTree()
      values.push(...this.processNode(this._store.tree, []))
    } else {
      let ref = this._store.tree
      const lookup = element?.lookup || []
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
    node: Record<string, RepoValue>,
    lookup: string[]
  ): Repository[] {
    const values: Repository[] = []
    // append direct descendants
    if (Array.isArray(node._children) && node._children.length) {
      values.push(
        ...node._children.map((v: RepoValue) => this.repoFromValue(lookup, v))
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
    return Object.values(repos).map((value) => this.repoFromValue([], value))
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }
}

export class Repository extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly lookup?: string[] | undefined,
    public readonly provider?: string | undefined,
    public readonly branch?: string | undefined
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.location}`
    this.lookup = lookup
  }

  description = this.branch ?? ''

  isFolder = this.label === this.location
  iconPath = new vscode.ThemeIcon(
    this.isFolder
      ? 'folder'
      : this.provider
      ? getIconByProvider(this.provider)
      : 'repo'
  )
  command = this.isFolder
    ? undefined
    : {
        title: 'vscode.open',
        command: '_repo.open',
        arguments: [this.location],
      }
  contextValue = this.isFolder ? 'folder' : 'repository'
}
