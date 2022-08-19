# Change Log

All notable changes to the "repo" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## 0.4.3

- Fixed wrong os selector in binary for macOS.

## 0.4.2

- On macOS, `~/Library` and `~/Applications` are ignored now as they were slowing down the scan and are unlikely to contain any repositories. In future, this behavior will be configurable and more such directories will be ignored.

## 0.4.1

- Fixed error when opening config for first time.
- Fixed missing repositories due to early exit in traversal.
- Fixed invisible single repository.

## 0.4.0

- Add quick pick list
- Add current repository in status bar.
- Add `repositories.preferBundled` and `repositories.showInStatusBar`.

## 0.3.1

- Fixed panic on nested directories in some cases.

## 0.3.0

- Enabled tree view on windows.
- Migrated to binary for building tree.

## 0.2.2

- Fixed missing repos from root level in tree view

## 0.2.1

- Add repositories.treeAsDefault config

## 0.2.0

- Platform specific packages and bundled binaries

## 0.1.2

- Added new logo and badges
- Added automated publishing with Actions
- Migrated from webpack to esbuild

## 0.1.1

- Fixed rendering of menu items in other views

## 0.1.0

- Added tree view ( Linux and macOS only )
- Used a more descriptive name

## 0.0.2

- Added icon and tags

## 0.0.1

- Initial release
- Add ability to switch between repositories
- Add ability to refresh repository list
