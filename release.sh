#!/bin/env bash

declare -A targets=(
	["x86_64-pc-windows-msvc"]=win32-x64
	["aarch64-pc-windows-msvc"]=win32-arm64
	["x86_64-unknown-linux-gnu"]=linux-x64
	["aarch64-unknown-linux-gnu"]=linux-arm64
	["x86_64-apple-darwin"]=darwin-x64
	["aarch64-apple-darwin"]=darwin-arm64
	["x86_64-unknown-linux-musl"]=alpine-x64
)

dl_base="https://github.com/mohitsinghs/repo/releases/latest/download"

rm -rf dist
mkdir dist
for k in "${!targets[@]}"; do
	target="$k"
	code_target="${targets[$k]}"
	echo "Building for target => $target code_target => $code_target"
	mkdir bin
	if [[ $code_target = *"win32"* ]]; then
		wget "$dl_base/repo-${target}.zip"
		unzip "repo-${target}.zip"
		mv repo.exe bin
		rm "repo-${target}.zip"
	else
		wget "$dl_base/repo-${target}.tar.gz"
		tar xvzf "repo-${target}.tar.gz" -C ./bin
		rm "repo-${target}.tar.gz"
	fi
	npx vsce package -o "./dist/repo-${code_target}.vsix" --target "${code_target}"
	rm -rf bin
done
