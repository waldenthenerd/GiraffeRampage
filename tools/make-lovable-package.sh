#!/usr/bin/env bash
# Builds the ZIP that goes to Lovable: index.html (without the developer panel line), css/, js/ (without js/45b-dev-panel.js),
# README.md, lovable.md and LICENSE. Refuses to finish if any developer-panel text is left in the shipped files.
# usage: tools/make-lovable-package.sh [output.zip]      (default: dist/GiraffeRampage-lovable.zip)
set -euo pipefail
cd "$(dirname "$0")/.."
root="$PWD"
out="${1:-dist/GiraffeRampage-lovable.zip}"; case "$out" in /*) ;; *) out="$root/$out";; esac
stage="$(mktemp -d)"; trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/GiraffeRampage" "$(dirname "$out")"
cp -r css js LICENSE README.md lovable.md "$stage/GiraffeRampage/"
rm -f "$stage/GiraffeRampage/js/45b-dev-panel.js"
sed '/js\/45b-dev-panel\.js/d' index.html > "$stage/GiraffeRampage/index.html"
cd "$stage/GiraffeRampage"
if grep -rlE 'Developer Panel|debug-addgold|1391|Dev Test Run|debug-dr-|devRunBtn|devBegin|debug-mini-|debug-town-|45b-dev-panel' index.html css js; then echo "developer-panel text is still in the files above" >&2; exit 1; fi
for f in $(grep -o 'src="js/[^"]*"' index.html | sed 's/src="//;s/"//'); do [ -f "$f" ] || { echo "index.html lists a missing file: $f" >&2; exit 1; }; done
cd "$stage"
rm -f "$out"
python3 - "$out" <<'PY'
import os, sys, zipfile
with zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk('GiraffeRampage'):
        for f in sorted(files): z.write(os.path.join(root, f))
PY
echo "wrote $out ($(du -h "$out" | cut -f1)); scripts in index.html: $(grep -c '<script src' GiraffeRampage/index.html)"
