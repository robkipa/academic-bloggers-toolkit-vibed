#!/usr/bin/env bash
# Must be run via npm (e.g. npm run zip) so npm_package_version is set.
set -e

ROOTDIR="$(cd "$(dirname "$0")/.." && pwd)"
abt=academic-bloggers-toolkit-vibed
zip_filename="$abt-${npm_package_version:?This script must be invoked using npm scripts}".zip
cache_dir="$ROOTDIR/node_modules/.cache/$abt"

mkdir -p "$cache_dir/$abt" "$cache_dir/bin"
rm -f "$cache_dir/bin"/*
cp -a "$ROOTDIR/dist/." "$cache_dir/$abt"

cd "$cache_dir"
zip -r bin/"$zip_filename" "$abt"
rm -r "$abt"

mkdir -p "$ROOTDIR/release"
cp "$cache_dir/bin/$zip_filename" "$ROOTDIR/release/"
