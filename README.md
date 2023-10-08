<h1 align='center'>Repositories</h1>
<p align="center">
  <b>Switch between repositories with ease</b><br/>
  <sub>Fastest way to access your local repositories within VSCode</sub>
</p>
<p align='center'>
  <a href="https://github.com/mohitsinghs/vscode-repo/actions/workflows/release.yml">
    <img alt="Release" src="https://img.shields.io/github/actions/workflow/status/mohitsinghs/vscode-repo/release.yml?style=flat-square" />
  </a>
  <a href="https://github.com/mohitsinghs/vscode-repo/blob/main/LICENSE">
    <img alt="LICENSE" src="https://img.shields.io/github/license/mohitsinghs/vscode-repo?style=flat-square" />
  </a>
  <img alt="version" src="https://img.shields.io/visual-studio-marketplace/v/mohitsingh.repo?style=flat-square" />
  <img alt="installs" src="https://img.shields.io/visual-studio-marketplace/i/mohitsingh.repo?style=flat-square" />
  <img alt="downloads" src="https://img.shields.io/visual-studio-marketplace/d/mohitsingh.repo?style=flat-square" />
</p>
<br />

## Features

- **Switch Repositories**: Easily switch between repositories.
- **Auto Repository Detection**: Automatically detect Git repositories.
- **View Options**: Choose between tree or list view.
- **Status Bar Integration**: See the current repository in the status bar.
- **Gitignore Friendly**: Respects your `.gitignore` settings.

## Demo

![vscode-repo](https://user-images.githubusercontent.com/4941333/210471039-01677d25-3e61-4e25-84fc-9eae24357bcb.gif)

## Commands

- `Repositories: Edit configuration` - Opens configuration for the repo and allows controlling root paths and scan depth.
- `Repositories: List Repos` - Opens a quick pick list of repositories to switch.

## Settings

| Setting                      | Description                                     | Default Value |
| ---------------------------- | ----------------------------------------------- | ------------- |
| repositories.treeAsDefault   | Use tree view as the default.                   | false         |
| repositories.sortByName      | Sort tree view by repository names.             | false         |
| repositories.showInStatusBar | Show the current project in the status bar.     | true          |
| repositories.preferBundled   | Prefer bundled binary; fallback to PATH binary. | true          |

## Platform Support

The extension is available on all major platforms, including Windows, macOS, and Linux. However, while it's generally compatible with these platforms, please note that testing is more extensive on some platforms than others. If you encounter any issues on your specific platform, feel free to raise an issue with relevant details.

> [!WARNING]
> If you are using **Windows Subsystem for Linux (WSL)**, please be aware that full support might be limited. In WSL, the [repo](https://github.com/mohitsinghs/repo) cli needs to be installed, and it may not work correctly if the PATH is not inherited. You can set `repositories.preferBundled` to `false` to always use the binary from the PATH instead of bundled one. For more information, refer to mohitsinghs/vscode-repo#2 and mohitsinghs/vscode-repo#4.

## Inspirations

- [Project Manager](https://github.com/alefragnani/vscode-project-manager)
- [Rust Analyzer](https://github.com/rust-lang/rust-analyzer)
