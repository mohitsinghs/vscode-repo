import { execSync } from 'child_process'
import * as vscode from 'vscode'

export enum ViewMode {
  tree,
  list,
}

export class RepositoryProvider implements vscode.TreeDataProvider<Repository> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Repository | undefined | null | void
  > = new vscode.EventEmitter<Repository | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    Repository | undefined | null | void
  > = this._onDidChangeTreeData.event
  _mode = ViewMode.list
  _tree: any = {}
  _repoPath: string

  constructor(repoPath: string, mode: ViewMode) {
    this._repoPath = repoPath
    this._mode = mode
  }

  switchMode(mode: ViewMode) {
    this._mode = mode
    this.refresh()
  }

  getTreeItem(element: Repository): vscode.TreeItem {
    return element
  }

  getChildren(element?: Repository): Thenable<Repository[]> {
    if (this._mode === ViewMode.list) {
      const repos = this.getRepositories()
      if (repos.length) {
        return Promise.resolve(repos)
      } else {
        vscode.window.showInformationMessage('No repositories found')
        return Promise.resolve([])
      }
    } else {
      if (!element) {
        this._tree = this.fetchRepositories(ViewMode.tree)
        let values: Repository[] = []
        Object.keys(this._tree).forEach((k: string) => {
          if (k !== '_children') {
            values.push(
              new Repository(k, k, vscode.TreeItemCollapsibleState.Expanded, [
                k,
              ])
            )
          }
        })
        if (
          Array.isArray(this._tree._children) &&
          this._tree._children.length
        ) {
          values.push(
            ...this._tree._children.map((v: any) => this.repoFromValue([], v))
          )
        }
        return Promise.resolve(values)
      } else {
        let ref = this._tree
        let lookup = element?.lookup
        if (lookup?.length) {
          let i = 0
          while (i < lookup.length) {
            ref = ref[lookup[i]]
            i++
          }
        }
        if (Array.isArray(ref)) {
          return Promise.resolve(ref.map((v) => this.repoFromValue(lookup, v)))
        } else {
          let values: Repository[] = []
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
          return Promise.resolve(values)
        }
      }
    }
  }

  private repoFromValue(lookup: string[] | undefined, v: any): Repository {
    return new Repository(
      v?.label,
      v?.location,
      vscode.TreeItemCollapsibleState.None,
      [...(lookup || [])]
    )
  }

  private fetchRepositories(mode: ViewMode): Record<string, any> {
    const repoData = execSync(
      mode === ViewMode.list
        ? `${this._repoPath} cmp -j`
        : `${this._repoPath} cmp -t`
    )
    return JSON.parse(repoData.toString('utf-8'))
  }

  private getRepositories(): Repository[] {
    const repos = this.fetchRepositories(ViewMode.list)
    return Object.entries(repos).map(
      ([name, path]) =>
        new Repository(name, path, vscode.TreeItemCollapsibleState.None)
    )
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }
}

class Repository extends vscode.TreeItem {
  public lookup: string[] | undefined
  constructor(
    public readonly label: string,
    private location: string,
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
}
