# Task 5: vehicles declarations

Baseline: main at 4f918b3. The parser inventory regenerated 25 duplicated global function names, in index.html order. This batch removes only the earlier bodies below, one commit per name. There are no intervening captures of these names and no intervening function assignments in the baseline inventory. Later wrappers remain in place.

| Name | Earlier declaration removed | Live declaration retained | Intervening captures / assignments |
|---|---|---|---|
| planeOwned | js/town/44ze-town-runway.js:30 | js/town/44zf-town-economy.js:37 | None |
| planeColour | js/town/44ze-town-runway.js:31 | js/town/44zf-town-economy.js:39 | None |
| planeBuy | js/town/44ze-town-runway.js:32 | js/town/44zf-town-economy.js:40 | None |
| planePaint | js/town/44ze-town-runway.js:37 | js/town/44zf-town-economy.js:45 | None |
| townCarOwned | js/town/44z-town-bread-car.js:79 | js/town/44zf-town-economy.js:101 | None |
| townCarBuy | js/town/44z-town-bread-car.js:81 | js/town/44zf-town-economy.js:105 | None |
| townCarRunMul | js/town/44z-town-bread-car.js:90 | js/town/44zf-town-economy.js:104 | None |

Reproduce the inventory with `npm ci --prefix tools`, then `node tools/duplicate-functions.mjs`. It parses the QA dependency's Babel AST, inspects Program-level declarations, and includes captures and assignments between declarations. The complete baseline has these names:

`openCrate`, `wheelTabHTML`, `gearTabHTML`, `buyCrate`, `townRainNow`, `townShowMenu`, `townShowJournal`, `townShowMap`, `townShowHall`, `townShowBoard`, `townShowScores`, `townShowLibrary`, `townShowMission`, `townCarOwned`, `townCarBuy`, `townCarRunMul`, `townDrawRide`, `townShowGarage`, `planeOwned`, `planeColour`, `planeBuy`, `planePaint`, `flyRegions`, `townShowHangar`, `townNpcSlot`.

The other names belong to separate cleanup branches. Shared data and helpers used by the surviving implementations remain. No save fields, wrappers, game rules or screen markup in the live implementation were changed.

Validation: README counts and git diff whitespace checks pass. Targeted and regression scenarios were exercised in the app browser; exact results are in the local cleanup report. The session's shell cannot start Chromium (macOS Mach-port permission denial), so ci-check.sh cannot finish locally; the baseline's GitHub run passed all 17 checks. Publishing and CI on this branch are blocked because command-line Git has no credentials and the GitHub integration denies Git-tree writes (403). This branch must remain unmerged and cannot be marked ready until full CI and touch-phone QA run.
