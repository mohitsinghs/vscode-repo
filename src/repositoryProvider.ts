import { execSync } from 'child_process'
import * as vscode from 'vscode'

export class RepositoryProvider implements vscode.TreeDataProvider<Repository> {
  constructor() {}

  getTreeItem(element: Repository): vscode.TreeItem {
    return element
  }

  getChildren(_element?: Repository): Thenable<Repository[]> {
    const repos = this.getRepositories()
    if (repos.length) {
      return Promise.resolve(repos)
    } else {
      vscode.window.showInformationMessage('No repositories found')
      return Promise.resolve([])
    }
  }

  private getRepositories(): Repository[] {
    const repoData = execSync(`repo cmp -j`)
    const repos: Record<string, string> = JSON.parse(repoData.toString('utf-8'))
    return Object.entries(repos).map(
      ([name, path]) =>
        new Repository(name, path, vscode.TreeItemCollapsibleState.None)
    )
  }
}

class Repository extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.location}`
  }
  iconPath = new vscode.ThemeIcon('repo')
  command = {
    title: 'vscode.open',
    command: '_repo.open',
    arguments: [this.location],
  }
}
