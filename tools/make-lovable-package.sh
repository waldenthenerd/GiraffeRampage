#!/usr/bin/env bash
# Builds the ZIP that goes to Lovable: index.html, one stylesheet and a few script files (tools/build-site.mjs joins the scripts in index.html order and
# minifies them; the developer panel, js/dev/, is left out), plus README.md, lovable.md and LICENSE. Refuses to finish if any developer-panel text is left in the shipped files.
# usage: tools/make-lovable-package.sh [output.zip]      (default: dist/GiraffeRampage-lovable.zip)
set -euo pipefail
cd "$(dirname "$0")/.."
root="$PWD"
out="${1:-dist/GiraffeRampage-lovable.zip}"; case "$out" in /*) ;; *) out="$root/$out";; esac
stage="$(mktemp -d)"; trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/GiraffeRampage" "$(dirname "$out")"
node "$root/tools/build-site.mjs" "$stage/GiraffeRampage"            # index.html + css/ + js/: the scripts joined into a few files and minified; js/dev/ is left out
cp LICENSE README.md lovable.md "$stage/GiraffeRampage/"
cd "$stage/GiraffeRampage"
if grep -rlE 'Developer Panel|debug-addgold|1391|Dev Test Run|debug-dr-|devRunBtn|devBegin|debug-mini-|debug-town-|45b-dev-panel' index.html css js; then echo "developer-panel text is still in the files above" >&2; exit 1; fi
for f in $(grep -o 'src="js/[^"]*"' index.html | sed 's/src="//;s/"//'); do [ -f "$f" ] || { echo "index.html lists a missing file: $f" >&2; exit 1; }; done
for f in $(grep -o 'href="css/[^"]*"' index.html | sed 's/href="//;s/"//'); do [ -f "$f" ] || { echo "index.html lists a missing file: $f" >&2; exit 1; }; done
cd "$stage"
rm -f "$out"
python3 - "$out" <<'PY'
import os, sys, zipfile
with zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk('GiraffeRampage'):
        for f in sorted(files): z.write(os.path.join(root, f))
PY
echo "wrote $out ($(du -h "$out" | cut -f1)); script files in index.html: $(grep -c "<script src" GiraffeRampage/index.html)"
