#!/usr/bin/env bash
set -e

ROOTDIR="$(cd "$(dirname "$0")/.." && pwd)"
version="${npm_package_version:?This script must be invoked using npm scripts}"
tag="v$version"
prefix="academic-bloggers-toolkit-vibed-${version}/"

mkdir -p "$ROOTDIR/release"
cd "$ROOTDIR"

git archive --format=zip --prefix="$prefix" -o "release/${version}.zip" "$tag"
git archive --format=tar.gz --prefix="$prefix" -o "release/${version}.tar.gz" "$tag"
