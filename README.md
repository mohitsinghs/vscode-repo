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

- Auto detect git repositories.
- View as tree or list.
- Current repo in status bar.
- Switch between repositories.
- Respects your gitignore.

## Demo

![vscode-repo](https://user-images.githubusercontent.com/4941333/169684717-ca144dd5-8f8f-4dd5-8a5c-33949aacc296.gif)

## Commands

- `Repositories: Edit configuration` - Opens configuration for the repo and allows controlling root paths and scan depth.
- `Repositories: List Repos` - Opens a quick pick list of repositories to switch.

## Settings

- `repositories.treeAsDefault` - If enabled, default view will be tree view.
- `repositories.sortByName` - If enabled, tree view will be sorted by repository names.
- `repositories.showInStatusBar` - If enabled, current project is shown in status bar.
- `repositories.preferBundled` - If enabled, bundled binary will be preferred otherwise binary from the PATH will be used and bundled binary will be used as fallback.

Default value of settings is as follows -

```json
{
  "repositories.treeAsDefault": false,
  "repositories.sortByName": false,
  "repositories.showInStatusBar": true,
  "repositories.preferBundled": true
}
```

## Platform Support

While the extension is available on all platforms, not all of these are tested thoroughly. If you are facing any problems on your platform, feel free to raise an issue with relevant info.

> WSL support is limited because for WSL, [repo](https://github.com/mohitsinghs/repo) need to be installed in WSL and does not work properly if PATH is not inherited correctly. See mohitsinghs/vscode-repo#2 and mohitsinghs/vscode-repo#4. Set `repositories.preferBundled` to false to always use binary from PATH.

## Inspirations

- [Project Manager](https://github.com/alefragnani/vscode-project-manager)
- [Rust Analyzer](https://github.com/rust-lang/rust-analyzer)
