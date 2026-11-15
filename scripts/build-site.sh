#!/usr/bin/env bash
# Assembles the folder GitHub Pages serves (deploy-site.yml): the web UI, its
# manifest and feeds, and digests/ under the same paths the repo root has, so
# every published URL stays as it is.
#
# Usage: bash scripts/build-site.sh [out-dir]   (default: dist/site)
set -euo pipefail

out="${1:-dist/site}"
rm -rf "$out"
mkdir -p "$out"
cp index.html manifest.json feed.xml ./*.png ./*.svg "$out/"
cp -R feeds digests "$out/"
echo "Site assembled in $out: $(find "$out" -type f | wc -l) files"
