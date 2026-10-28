# Task 5: gear-crates declarations

Baseline: main at 4f918b3. The parser inventory regenerated 25 duplicated global function names, in index.html order. This batch removes only the earlier bodies below, one commit per name. There are no intervening captures of these names and no intervening function assignments in the baseline inventory. Later wrappers remain in place.

| Name | Earlier declaration removed | Live declaration retained | Intervening captures / assignments |
|---|---|---|---|
| openCrate | js/game/05-gear.js:633 | js/game/05a-gear-levels.js:146 | None |
| gearTabHTML | js/ui/41-qol.js:514 | js/ui/41a-gear-page.js:169 | None |
| buyCrate | js/core/43-input.js:347 | js/ui/41a-gear-page.js:284 | None |
| wheelTabHTML | js/game/11-ants.js:324 | js/ui/41c-wheel-page.js:180 | None |

Reproduce the inventory with `npm ci --prefix tools`, then `node tools/duplicate-functions.mjs`. It parses the QA dependency's Babel AST, inspects Program-level declarations, and includes captures and assignments between declarations. The complete baseline has these names:

`openCrate`, `wheelTabHTML`, `gearTabHTML`, `buyCrate`, `townRainNow`, `townShowMenu`, `townShowJournal`, `townShowMap`, `townShowHall`, `townShowBoard`, `townShowScores`, `townShowLibrary`, `townShowMission`, `townCarOwned`, `townCarBuy`, `townCarRunMul`, `townDrawRide`, `townShowGarage`, `planeOwned`, `planeColour`, `planeBuy`, `planePaint`, `flyRegions`, `townShowHangar`, `townNpcSlot`.

The other names belong to separate cleanup branches. Shared data and helpers used by the surviving implementations remain. No save fields, wrappers, game rules or screen markup in the live implementation were changed.

Validation: README counts and git diff whitespace checks pass. Targeted and regression scenarios were exercised in the app browser; exact results are in the local cleanup report. The session's shell cannot start Chromium (macOS Mach-port permission denial), so ci-check.sh cannot finish locally; the baseline's GitHub run passed all 17 checks. Publishing and CI on this branch are blocked because command-line Git has no credentials and the GitHub integration denies Git-tree writes (403). This branch must remain unmerged and cannot be marked ready until full CI and touch-phone QA run.
