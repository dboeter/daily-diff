#!/usr/bin/env bash
# Assembles the folder GitHub Pages serves (deploy-site.yml): the content of
# site/ at the root and digests/ next to it, where index.html fetches the
# reports. Also the local preview: serve the out-dir with any static server.
#
# Usage: bash scripts/build-site.sh [out-dir]   (default: dist/site)
set -euo pipefail

out="${1:-dist/site}"
rm -rf "$out"
mkdir -p "$out"
cp -R site/. "$out/"
cp -R digests "$out/digests"
echo "Site assembled in $out: $(find "$out" -type f | wc -l) files"
