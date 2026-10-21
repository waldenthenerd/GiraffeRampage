# Task 9: compare-panel triage

Baseline: main at 4f918b3. No game code changed in this task.

The scenario checks all 66 pieces (every slot and rarity) against empty slots, a full Herdhide set, the candidate's other two set pieces, Red Rampage/Burrow Boots/Lime Helmet together, a level-4 candidate, and each of the 16 trinkets separately: 1,386 cases. It compares every reported numeric delta with a real recalcStats before and after the swap, and checks set-completion text, unchanged 3/3 lines, hover clearing and a level-up redraw. Desktop and 390px runs both passed, with no script errors.

| Finding | Exact reproduction / result | Status |
|---|---|---|
| Endpoints omit non-gear bonuses | Wear the full Herdhide set, Red Rampage and Burrow Boots, then point at Thornweave's cape. The panel's speed row is +11.2% → 0%; recalcStats gives +17.2% → +6%. The change is the same, −11.2 percentage points. | Left for owner decision: gearDelta deliberately uses gearBaseStats. Showing total build endpoints would change the preview's meaning and needs decisions about shop, cards, mutations, town bonuses and temporary buffs. |
| Same offset with individual trinkets | The matrix records 242 numeric rows whose endpoints differ from total run stats, but no incorrect numeric swap delta in this fixture. | Left with the same decision. |
| 3/3 → 3/3 text | Every piece and setup checked through gearComparePanel. No such line displayed. | Not reproduced. |
| Panel stays after hovering away | Point at Worldspire armor, clear the hover, inspect the build panel. It returns to the build. | Not reproduced. A tapped selection staying selected is intentional. |
| Level-up staleness | Select Worldspire armor, level it once, call gearSyncSelection as a redraw, compare the panel text. The level and numbers update. | Not reproduced. |

Run: node tools/qa-cloud.mjs tools/scenarios/compare-panel-triage.js --wait 60000. Add --params view=offset for the endpoint example, or --touch --w 390 --h 844 for the phone. The scenario records the endpoint examples in its JSON. Screenshots are in the local cleanup deliverables.

Not tested: every possible combination of permanent upgrades, cards, town/college bonuses or timed effects; physical phone input. Chromium launch from this session's shell is blocked by macOS sandbox Mach-port permissions, so the targeted runs used the app browser at desktop and 390px widths. The full CI command and touch emulation remain required before a PR can be marked ready.
