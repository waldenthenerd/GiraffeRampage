#!/bin/bash
# Everything a pull request has to pass: the README counts, the regression scenarios (desktop and phone), and the website package with its ship check.
# GitHub runs this on every push and pull request (.github/workflows/qa.yml); run it yourself before you open a pull request:  bash tools/ci-check.sh
# Needs the one-time setup in AGENTS.md (cd tools && npm ci && npx playwright install --with-deps chromium). Takes a few minutes. Exit 0 = all passed.
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"; cd "$root"
fails=(); pass=0
ok(){ echo "  ok   $1"; pass=$((pass + 1)); }
bad(){ echo "  FAIL $1"; fails+=("$1"); [ -n "${2:-}" ] && echo "$2" | tail -n 12 | cut -c1-600 | sed 's/^/       /'; }
scen(){                                                    # scen <label> <scenario> [runner options...]; passes when the scenario reports "pass":true
  local label="$1" name="$2"; shift 2
  local out; out="$(node tools/qa-cloud.mjs "tools/scenarios/$name.js" --wait 90000 "$@" 2>&1)"
  if echo "$out" | grep -q '"pass":true'; then ok "$label"; else bad "$label" "$out"; fi
}
echo "== README and lovable.md counts"
if out="$(python3 tools/recount-readme.py --check 2>&1)"; then ok "recount-readme"; else bad "recount-readme" "$out"; fi
echo "== scenarios"
for s in gear-oldsave trinket-ui wheel-spotted ants-page upgrades-page nav-pages npc-voices gear-spotted; do scen "$s" "$s"; done
scen "phone-pass (390x844)" phone-pass --touch --w 390 --h 844
scen "phone-pass (844x390)" phone-pass --touch --w 844 --h 390
echo "== website package"
zip="$(mktemp -d)/pkg.zip"
if out="$(bash tools/make-lovable-package.sh "$zip" 2>&1)"; then
  dir="$(mktemp -d)"; unzip -q "$zip" -d "$dir"
  out="$(QA_ROOT="$dir/GiraffeRampage" node tools/qa-cloud.mjs tools/scenarios/ship-check.js --wait 60000 2>&1)"
  if echo "$out" | grep -q '"pass":true'; then ok "ship-check on the package"; else bad "ship-check on the package" "$out"; fi
else bad "build the package" "$out"; fi
echo
if [ ${#fails[@]} -eq 0 ]; then echo "All $pass checks passed."; else echo "${#fails[@]} failed, $pass passed: ${fails[*]}"; exit 1; fi
