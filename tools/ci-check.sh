#!/bin/bash
# Everything a pull request has to pass: the README counts, the unit tests, the regression scenarios (desktop and phone), and the website package with its ship check.
# GitHub runs this on every push and pull request (.github/workflows/qa.yml); run it yourself before you open a pull request:  bash tools/ci-check.sh
# Needs the one-time setup in AGENTS.md (cd tools && npm ci && npx playwright install --with-deps chromium). Exit 0 = all passed.
# The browser scenarios run side by side, one per processor core (CI_JOBS=n sets how many; CI_JOBS=1 runs them one at a time, as before), longest first,
# each in its own browser with its own empty storage, exactly as when run alone. Every check prints how long it took. The scenarios that measure time
# (a drawing budget, a frame-time comparison) run afterwards one at a time on a quiet machine, so their budgets mean what they say.
# CI_SHARD=i/n runs only the i-th of n shares of the browser checks (GitHub runs the shares on separate machines at once; the quick checks run in
# share 1). The shares are dealt out longest first, back and forth, so they take about as long as each other.
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"; cd "$root"
jobs="${CI_JOBS:-$(nproc 2>/dev/null || echo 2)}"
shard="${CI_SHARD:-1/1}"; si="${shard%/*}"; sn="${shard#*/}"
case "$si$sn" in *[!0-9]*|'') echo "CI_SHARD must look like 2/3"; exit 2;; esac
[ "$si" -ge 1 ] && [ "$si" -le "$sn" ] || { echo "CI_SHARD must look like 2/3"; exit 2; }
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fails=(); pass=0; t0=$SECONDS
ok(){ echo "  ok   $1"; pass=$((pass + 1)); }
bad(){ echo "  FAIL $1"; fails+=("$1"); [ -n "${2:-}" ] && echo "$2" | tail -n 12 | cut -c1-600 | sed 's/^/       /'; }
quick(){                                                   # quick <label> <command...>: a fast check that needs no browser, run here and now
  local label="$1"; shift; local s=$SECONDS out
  if out="$("$@" 2>&1)"; then ok "$label ($((SECONDS - s))s)"; else bad "$label" "$out"; fi
}

[ "$sn" -gt 1 ] && echo "== share $si of $sn"
if [ "$si" -eq 1 ]; then
  echo "== README and lovable.md counts"
  quick "recount-readme" python3 tools/recount-readme.py --check
  quick "sync-gallery" node tools/sync-gallery.mjs --check
  echo "== unit tests"
  quick "challenge-data unit tests" node tools/challenge-data-test.mjs
  quick "challenge-play unit tests" node tools/challenge-play-test.mjs
  quick "joined scripts match the separate scripts" node tools/check-bundle.mjs
fi
echo "== website package"
pkg=""
zip="$tmp/pkg.zip"
if out="$(bash tools/make-lovable-package.sh "$zip" 2>&1)"; then
  pkg="$tmp/site"; mkdir -p "$pkg"; unzip -q "$zip" -d "$pkg"; pkg="$pkg/GiraffeRampage"; ok "build the package"
else bad "build the package" "$out"; fi

# The browser checks, one line each: label | site folder ("" = this checkout) | scenario | runner options. The slowest come first, so the long ones
# start at once and the short ones fill the gaps (times from GitHub, November 2026: domes ~70s, sky-chase ~48s, island ~43s, siege ~34s, tower ~32s,
# fort ~28s, together ~21s, ship-check ~17s; most others take 1-3s).
list="$tmp/list"; : > "$list"; alone="$tmp/alone"; : > "$alone"
timed=" ants-engineer enemy-detail enemy-motion particles perf-cache scenery-detail save-gr3 "     # these time themselves: run one at a time at the end
add(){ case "$timed" in *" $3 "*) [ -z "$2" ] && { printf '%s|%s|%s|%s\n' "$1" "$2" "$3" "${4:-}" >> "$alone"; return; };; esac; printf '%s|%s|%s|%s\n' "$1" "$2" "$3" "${4:-}" >> "$list"; }
heavy="domes sky-chase island siege tower fort together"
onpkg="gear-oldsave town-layers domes tower siege fort island camp late-polish music jukebox"   # also run on the joined and minified copy
for s in $heavy; do add "$s" "" "$s"; case " $onpkg " in *" $s "*) [ -n "$pkg" ] && add "$s on the package" "$pkg" "$s";; esac; done
[ -n "$pkg" ] && add "ship-check on the package" "$pkg" ship-check
add "challenge-builder" "" challenge-builder
add "challenge-builder (390x844)" "" challenge-builder "--touch --w 390 --h 844"
add "challenge-builder (844x390)" "" challenge-builder "--touch --w 844 --h 390"
for s in gear-oldsave trinket-ui wheel-spotted ants-page ants-engineer upgrades-page nav-pages review-fixes oldsave-deep save-gr3 npc-voices gear-spotted perf-cache save-erase gold-bank achievements gags fishing fishing-fight input-choice town-layers wheels intel uni-bank uni-slides ui-pass enemy-detail enemy-motion scenery-detail minimap camp late-polish sea-chart runreport-gear preview-trail aurora-buff compare-panel-triage music jukebox town-choices particles gadgets town-detail addons; do add "$s" "" "$s"; done
add "films (all 27 films)" "" film-sheet '--params kind=all'
add "phone-pass (390x844)" "" phone-pass "--touch --w 390 --h 844"
add "uni-slides (390x844)" "" uni-slides "--touch --w 390 --h 844"
add "ui-pass (390x844)" "" ui-pass "--touch --w 390 --h 844"
add "phone-pass (844x390)" "" phone-pass "--touch --w 844 --h 390"
if [ -n "$pkg" ]; then for s in $onpkg; do case " $heavy " in *" $s "*) ;; *) add "$s on the package" "$pkg" "$s";; esac; done; fi

# one check: runs the scenario, keeps its output in $tmp/<n>.out and writes "<pass|fail> <seconds>" to $tmp/<n>.res, then says it is done
one(){
  local n="$1" line="$2" label site name opts s=$SECONDS out
  IFS='|' read -r label site name opts <<< "$line"
  # shellcheck disable=SC2086                                 # the options are words on purpose
  out="$(QA_ROOT="${site:-$root}" node tools/qa-cloud.mjs "tools/scenarios/$name.js" --wait 240000 $opts 2>&1)"
  printf '%s\n' "$out" > "$tmp/$n.out"
  if printf '%s' "$out" | grep -q '"pass":true'; then echo "pass $((SECONDS - s))" > "$tmp/$n.res"; else echo "fail $((SECONDS - s))" > "$tmp/$n.res"; fi
  echo "  done $label ($((SECONDS - s))s)"
}
export -f one; export tmp root
# this machine's share: the i-th of every n checks, dealt back and forth (1 2 3 3 2 1 ...) down each list
mine(){ awk -v i="$si" -v n="$sn" '{ r = int((NR - 1) / n); p = (NR - 1) % n; if (r % 2) p = n - 1 - p; if (p == i - 1) print }' "$1"; }
mine "$list" > "$list.mine"; mine "$alone" > "$alone.mine"; mv "$list.mine" "$list"; mv "$alone.mine" "$alone"
nshared=$(wc -l < "$list"); cat "$alone" >> "$list"
if [ -n "${CI_LIST:-}" ]; then cut -d'|' -f1 "$list"; exit 0; fi           # CI_LIST=1: only say which browser checks this share would run
run(){ nl -ba -w1 -s'|' "$list" | sed -n "$1,$2p" | while IFS= read -r l; do printf '%s\0' "$l"; done |
  xargs -0 -P "$3" -I{} bash -c 'l="$1"; one "${l%%|*}" "${l#*|}"' _ {}; }
echo "== $nshared browser checks, $jobs at a time"
s=$SECONDS; run 1 "$nshared" "$jobs"
echo "== $(wc -l < "$alone") checks that time themselves, one at a time"
run $((nshared + 1)) '$' 1
echo "== results (in list order; $((SECONDS - s))s for the browser checks)"
n=0
while IFS= read -r line; do
  n=$((n + 1)); label="${line%%|*}"
  if [ ! -f "$tmp/$n.res" ]; then bad "$label" "did not run"; continue; fi
  read -r res secs < "$tmp/$n.res"
  if [ "$res" = pass ]; then ok "$label (${secs}s)"; else bad "$label (${secs}s)" "$(cat "$tmp/$n.out")"; fi
  printf '%s\t%s\n' "$label" "$tmp/$n.out" >> "$tmp/manifest"
done < "$list"

# the coverage record (tools/coverage.mjs): every check and every key it reports. CI_COVERAGE=<file> keeps it (GitHub joins the shares' records);
# a whole run (no CI_SHARD) compares it with tools/coverage-baseline.txt here, so a lost check fails the run.
rec="${CI_COVERAGE:-$tmp/coverage.txt}"
node tools/coverage.mjs record "$tmp/manifest" > "$rec"
if [ -n "${CI_RESULTS:-}" ]; then mkdir -p "$CI_RESULTS"; while IFS=$'\t' read -r l f; do printf '%s\t%s\n' "$l" "$(tail -n 1 "$f")"; done < "$tmp/manifest" > "$CI_RESULTS/results.tsv"; fi   # CI_RESULTS=<dir>: keep each check's result line, to compare two runs
if [ "$sn" -eq 1 ] && [ -f tools/coverage-baseline.txt ]; then quick "coverage record matches the baseline" node tools/coverage.mjs check tools/coverage-baseline.txt "$rec"; fi

echo
echo "Took $((SECONDS - t0))s."
if [ ${#fails[@]} -eq 0 ]; then echo "All $pass checks passed."; else echo "${#fails[@]} failed, $pass passed: ${fails[*]}"; exit 1; fi
