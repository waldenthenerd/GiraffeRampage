#!/bin/bash
# Everything a pull request has to pass: the README counts, the unit tests, the regression scenarios (desktop and phone), and the website package with its ship check.
# GitHub runs this on every push and pull request (.github/workflows/qa.yml); run it yourself before you open a pull request:  bash tools/ci-check.sh
# Needs the one-time setup in AGENTS.md (cd tools && npm ci && npx playwright install --with-deps chromium). Exit 0 = all passed.
#
# The browser checks run in one browser (tools/qa-batch.mjs), side by side, one per processor core (CI_JOBS=n sets how many), longest first, each in a
# fresh context with its own empty storage, exactly as when run alone. Every check prints how long it took. The scenarios that measure time (a drawing
# budget, a frame-time comparison) run afterwards one at a time on a quiet machine, so their budgets mean what they say.
# Only some of the frames the scenarios step through are drawn (draw=sampled, see the harness in tools/qa.html): what the game does is the same, and
# every scene is still drawn. CI_DRAW=all draws every frame (GitHub does that after each push to main); the timed checks always draw every frame.
# The game's scripts are inlined into the page, each still its own script (tools/qa-lib.mjs); CI_INLINE=0 loads them as files, as the game does.
# At the end the coverage record (tools/coverage.mjs) is compared with tools/coverage-baseline.txt, so a check that went missing fails the run.
#
# For a quicker look while you work (the whole run is still the one that counts before a pull request):
#   bash tools/ci-check.sh --only fort,island    only the checks whose label contains one of these words
#   bash tools/ci-check.sh --changed             only the checks a change since origin/main is likely to touch (everything, if a core file changed)
#   bash tools/ci-check.sh --fail-fast           stop starting checks after the first failure
# For GitHub: CI_SHARD=i/n runs the i-th of n shares (tools/ci-times.tsv says how long each check takes, so the shares come out even; the quick checks
# run in share 1); CI_PART=shared or timed runs only the side-by-side checks or only the timed ones; CI_PKG=<zip> uses a website package already
# built; CI_COVERAGE=<file> and CI_RESULTS=<dir> keep the coverage record and each check's result line and time; CI_LIST=1 only lists the checks.
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"; cd "$root"
only=""; changed=""; failfast=""
while [ $# -gt 0 ]; do case "$1" in
  --only) only="${2:-}"; shift 2;; --only=*) only="${1#--only=}"; shift;;
  --changed) changed=1; shift;; --fail-fast) failfast=1; shift;;
  *) echo "unknown option $1 (see the top of tools/ci-check.sh)"; exit 2;;
esac; done
jobs="${CI_JOBS:-$(nproc 2>/dev/null || echo 2)}"
shard="${CI_SHARD:-1/1}"; si="${shard%/*}"; sn="${shard#*/}"; part="${CI_PART:-all}"; draw="${CI_DRAW:-sampled}"
case "$si$sn" in *[!0-9]*|'') echo "CI_SHARD must look like 2/3"; exit 2;; esac
[ "$si" -ge 1 ] && [ "$si" -le "$sn" ] || { echo "CI_SHARD must look like 2/3"; exit 2; }
case "$part" in all|shared|timed) ;; *) echo "CI_PART must be all, shared or timed"; exit 2;; esac
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fails=(); pass=0; t0=$SECONDS
ok(){ echo "  ok   $1"; pass=$((pass + 1)); }
bad(){ echo "  FAIL $1"; fails+=("$1"); [ -n "${2:-}" ] && echo "$2" | tail -n 12 | cut -c1-600 | sed 's/^/       /'; }
quick(){                                                   # quick <label> <command...>: a fast check that needs no browser, run here and now
  local label="$1"; shift; local s=$SECONDS out
  if out="$("$@" 2>&1)"; then ok "$label ($((SECONDS - s))s)"; else bad "$label" "$out"; fi
}
whole=""; [ "$sn" -eq 1 ] && [ "$part" = all ] && [ -z "$only$changed$failfast" ] && whole=1      # a whole run: the coverage record must match

[ "$sn" -gt 1 ] && echo "== share $si of $sn"
if [ "$si" -eq 1 ] && [ "$part" != timed ] && [ -z "${CI_LIST:-}" ]; then
  echo "== README and lovable.md counts"
  quick "recount-readme" python3 tools/recount-readme.py --check
  quick "sync-gallery" node tools/sync-gallery.mjs --check
  echo "== unit tests"
  quick "challenge-data unit tests" node tools/challenge-data-test.mjs
  quick "challenge-play unit tests" node tools/challenge-play-test.mjs
  quick "joined scripts match the separate scripts" node tools/check-bundle.mjs
fi
pkg=""
if [ "$part" != timed ] && [ -z "${CI_LIST:-}" ]; then
  echo "== website package"
  zip="$tmp/pkg.zip"
  if [ -n "${CI_PKG:-}" ]; then cp "$CI_PKG" "$zip" && ok "the package built while the browser installed (CI_PKG)"
  elif out="$(bash tools/make-lovable-package.sh "$zip" 2>&1)"; then ok "build the package"
  else bad "build the package" "$out"; zip=""; fi
  if [ -n "$zip" ] && [ -f "$zip" ]; then pkg="$tmp/site"; mkdir -p "$pkg"; unzip -q "$zip" -d "$pkg"; pkg="$pkg/GiraffeRampage"; fi
fi
[ -z "$pkg" ] && pkg="$tmp/no-package"                     # listed all the same, so a share's list does not depend on whether the package was built

# The browser checks, one line each: label | site folder ("" = this checkout) | scenario | runner options.
list="$tmp/list"; : > "$list"; alone="$tmp/alone"; : > "$alone"
timed=" ants-engineer enemy-detail enemy-motion particles perf-cache scenery-detail save-gr3 "     # these time themselves: run one at a time at the end
add1(){ case "$timed" in *" $3 "*) [ -z "$2" ] && { printf '%s|%s|%s|%s\n' "$1" "$2" "$3" "${4:-}" >> "$alone"; return; };; esac; printf '%s|%s|%s|%s\n' "$1" "$2" "$3" "${4:-}" >> "$list"; }
# the long scenarios are split into parts (QA.part in the scenario, part=i/n), each its own check, so no one check holds up a share; the coverage
# record joins a scenario's parts back together (tools/coverage.mjs)
parts=" domes:2 island:3 tower:3 siege:2 fort:3 sky-chase:2 "
add(){ local n="${parts#* $3:}"; [ "$n" = "$parts" ] && { add1 "$@"; return; }; n="${n%% *}"
  for i in $(seq 1 "$n"); do add1 "$1 (part $i of $n)" "$2" "$3" "${4:+$4 }--params part=$i/$n"; done; }
onpkg="gear-oldsave town-layers domes tower siege fort island camp late-polish music jukebox"   # also run on the joined and minified copy
for s in domes sky-chase island siege tower fort together; do add "$s" "" "$s"; done
add "ship-check on the package" "$pkg" ship-check
add "challenge-builder" "" challenge-builder
add "challenge-builder (390x844)" "" challenge-builder "--touch --w 390 --h 844"
add "challenge-builder (844x390)" "" challenge-builder "--touch --w 844 --h 390"
for s in gear-oldsave trinket-ui wheel-spotted ants-page ants-engineer upgrades-page nav-pages review-fixes oldsave-deep save-gr3 npc-voices gear-spotted perf-cache save-erase gold-bank achievements gags fishing fishing-fight input-choice town-layers wheels intel uni-bank uni-slides ui-pass enemy-detail enemy-motion scenery-detail minimap camp late-polish sea-chart runreport-gear preview-trail aurora-buff compare-panel-triage music jukebox town-choices particles gadgets town-detail addons monkey-hat speedrun local-addons; do add "$s" "" "$s"; done
add "films (all 27 films)" "" film-sheet '--params kind=all'
add "phone-pass (390x844)" "" phone-pass "--touch --w 390 --h 844"
add "uni-slides (390x844)" "" uni-slides "--touch --w 390 --h 844"
add "ui-pass (390x844)" "" ui-pass "--touch --w 390 --h 844"
add "phone-pass (844x390)" "" phone-pass "--touch --w 844 --h 390"
for s in $onpkg; do add "$s on the package" "$pkg" "$s"; done

# --only / --changed: keep the checks that match
pick(){ awk -F'|' -v w="$1" 'BEGIN{ n = split(w, a, ",") } { for (i = 1; i <= n; i++) if (a[i] != "" && index($1, a[i])) { print; next } }' "$2"; }
if [ -n "$changed" ]; then
  base="$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD)"
  files="$( { git diff --name-only "$base"; git ls-files --others --exclude-standard; } | sort -u)"
  if printf '%s\n' "$files" | grep -qE '^(index\.html|css/|js/core/|js/ui/|js/game/|js/audio/|tools/(qa|qa-lib|qa-batch|ci-check|coverage)\b)'; then only=""   # the core: everything
  else only="$(printf '%s\n' "$files" | sed -nE 's#^tools/scenarios/([^/]+)\.js$#\1#p; s#^js/([^/]+)/.*#\1#p; s#^js/addons/[0-9a-z]+-addon-([^.]+)\.js$#\1#p' | sort -u | paste -sd, -)"
    [ -z "$only" ] && only="ship-check"; fi
  echo "== checks for the change since origin/main: ${only:-everything}"
fi
if [ -n "$only" ]; then pick "$only" "$list" > "$list.p"; pick "$only" "$alone" > "$alone.p"; mv "$list.p" "$list"; mv "$alone.p" "$alone"; fi
[ "$part" = timed ] && : > "$list"; [ "$part" = shared ] && : > "$alone"

# this machine's share: longest first (times in tools/ci-times.tsv; a check not in it counts 3 s), each to the share that has the least so far.
# Both lists are dealt the same way, and within a share the checks keep the longest-first order.
deal(){ awk -F'|' -v i="$si" -v n="$sn" 'NR == FNR { split($0, t, "\t"); T[t[1]] = t[2]; next }
  { s = ($1 in T) ? T[$1] : 3; print s "\t" FNR "\t" $0 }' tools/ci-times.tsv "$1" | sort -t$'\t' -k1,1gr -k2,2n |
  awk -F'\t' -v i="$si" -v n="$sn" -v q="$quick1" 'BEGIN{ load[1] = q } { b = 1; for (k = 2; k <= n; k++) if (load[k] < load[b]) b = k; load[b] += $1; if (b == i) print $3 }'; }
quick1=0; [ "$part" != timed ] && quick1=17                   # share 1 also runs the quick checks (about 17 s on GitHub), so it starts that far behind
deal "$list" > "$list.mine"; deal "$alone" > "$alone.mine"; mv "$list.mine" "$list"; mv "$alone.mine" "$alone"
nshared=$(wc -l < "$list"); cat "$alone" >> "$list"
if [ -n "${CI_LIST:-}" ]; then cut -d'|' -f1 "$list"; exit 0; fi           # CI_LIST=1: only say which browser checks this share would run

inl=""; [ "${CI_INLINE:-1}" = 1 ] && inl=" --inline"      # the game's scripts inlined into the page (tools/qa-lib.mjs); CI_INLINE=0 loads them one by one
batch(){ [ "$2" != '$' ] && [ "$2" -lt "$1" ] && return 0                 # an empty range (sed would still print line $1)
  nl -ba -w1 -s'|' "$list" | sed -n "$1,$2p" | awk -F'|' -v d="$3" -v x="$inl" 'BEGIN{OFS="|"} { $5 = $5 " --draw " d x; print }' > "$tmp/batch"
  [ -s "$tmp/batch" ] && node tools/qa-batch.mjs "$tmp/batch" "$tmp" --jobs "$4" ${failfast:+--fail-fast}; }
echo "== $nshared browser checks, $jobs at a time (drawing: $draw)"
s=$SECONDS; batch 1 "$nshared" "$draw" "$jobs"
if [ -z "$failfast" ] || ! grep -qs '^fail' "$tmp"/*.res; then
  echo "== $(wc -l < "$alone") checks that time themselves, one at a time"
  batch $((nshared + 1)) '$' all 1
fi
echo "== results (in list order; $((SECONDS - s))s for the browser checks)"
n=0; : > "$tmp/manifest"
while IFS= read -r line; do
  n=$((n + 1)); label="${line%%|*}"
  if [ ! -f "$tmp/$n.res" ]; then [ -n "$failfast" ] && continue; bad "$label" "did not run"; continue; fi
  read -r res secs < "$tmp/$n.res"
  if [ "$res" = pass ]; then ok "$label (${secs}s)"; else bad "$label (${secs}s)" "$(cat "$tmp/$n.out")"; fi
  printf '%s\t%s\n' "$label" "$tmp/$n.out" >> "$tmp/manifest"
done < "$list"

# the coverage record (tools/coverage.mjs): every check and every key it reports. CI_COVERAGE=<file> keeps it (GitHub joins the shares' records);
# a whole run compares it with tools/coverage-baseline.txt here, so a lost check fails the run.
rec="${CI_COVERAGE:-$tmp/coverage.txt}"
node tools/coverage.mjs record "$tmp/manifest" > "$rec"
if [ -n "${CI_RESULTS:-}" ]; then mkdir -p "$CI_RESULTS"; while IFS=$'\t' read -r l f; do printf '%s\t%s\n' "$l" "$(head -n 1 "$f")"; done < "$tmp/manifest" > "$CI_RESULTS/results.tsv"; cp "$tmp/times.tsv" "$CI_RESULTS/times.tsv" 2>/dev/null; fi
[ -n "$whole" ] && quick "coverage record matches the baseline" node tools/coverage.mjs check tools/coverage-baseline.txt "$rec"

echo
echo "Took $((SECONDS - t0))s."
if [ ${#fails[@]} -eq 0 ]; then echo "All $pass checks passed."; else echo "${#fails[@]} failed, $pass passed: ${fails[*]}"; exit 1; fi
