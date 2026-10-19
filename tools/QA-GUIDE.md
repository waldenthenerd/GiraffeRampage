# QA guide: how to test Giraffe Rampage with the headless harness

You test the game by writing a small JavaScript **scenario**, running it in the real game inside headless Edge, and reading the
result plus a screenshot. **Never edit anything under `<path-to-your-checkout>`.** Write your scenarios and
screenshots only into your own scratch folder (given in your task).

## Running a scenario

```powershell
powershell -NoProfile -File <path-to-your-checkout>\tools\qa-run.ps1 -Scenario <your-folder>\a.js -Shot <your-folder>\a.png -WaitMs 20000
```

- Always pass `-WaitMs 20000` (the machine is shared; the default 8000 can be too short).
- Optional: `-Params "view=boss&ch=3"` (read in the scenario as `QA.params.view`), `-W 1280 -H 720` (window size; try `-W 400 -H 800` for a phone),
  `-Seed 7` (random seed; same seed = same game).
- One run takes 15-30 seconds. Run them **one after another**, not in parallel. Plan for at most about 15 runs.
- It prints one line of JSON: `{"done":true,"result":{...},"errors":[...],"logs":[...]}`.
  `done:false` means your scenario threw before calling `QA.done`, took too long, or never finished: shorten it (fewer steps) and retry.
  `errors` lists every script error the game raised. **Any entry in `errors` is a bug worth reporting** (give the message).
- With `-Shot`, a PNG of the final state is saved. **Look at it with the Read tool** (it shows images). The real game area is the top-left
  1254 x 627 pixels; the strip below/right of that is a duplicate artifact of the tool, ignore it.

## Writing a scenario

A scenario is a plain classic script (not a module). It runs after the game has booted. It can use the game's globals directly:
`GR` (test API), `G` (game state), `P` (player), `Save`, `Settings`, `Atmos`, `Light`, `WxE`, `SCEN`, `CARDS`, `ETYPES`...
Finish with `QA.done({ ...anything JSON-able... })`. Use `QA.log('text')` for notes.

The game's own loop is stopped. You advance it yourself:

```js
GR.handleAction('splash-go');          // dismiss the title splash (do this first)
GR.startRun(3);                        // start chapter 3 (GR.startRun(1, 12) starts at wave 12)
G.introFX = null;                      // skip the chapter intro card
for (var i = 0; i < 300; i++) GR.step(1/60);   // 5 seconds of game time (also renders each step)
QA.done({ state: G.state, wave: G.wave, hp: P.hp, enemies: G.enemies.length });
```

Keep a scenario under about 700 `GR.step` calls. The final state is what the screenshot shows.

### Useful things

- **States** (`G.state`): `menu`, `playing`, `levelup`, `paused`, `dead`, `victory`, `shop`, `help`, `cutscene`, `transform`, `chaptertrans`, `miniask` (the popup after a chapter), `mini` (a minigame), `forage`, `scout`, `mscout`.
- **Chapters 1-13**: 1 savanna, 2 arctic, 3 swamp, 4 ocean, 5 jungle, 6 city (Houston), 7 space centre, 8 moon, 9 Venus, 10 inferno, 11 changed savannah, 12 Area 51, 13 Mars. Each is 25 waves; every 5th wave has a boss.
- **Player**: `P.hp`, `P.maxHp`, `P.x`, `P.y`, `P.cards`. Stay alive in a test with `P.invuln = 99;` inside the loop. Move her: set `P.x`/`P.y`.
- **Enemies**: `G.enemies`. Kill one: `damageEnemy(e, 1e9, {})`. Spawn: `spawnEnemy('hyena', P.x + 200, P.y, G.wave)`.
- **Cards**: `CARDS.map(function(c){return c.id})`; take one with `takeCard('neck_whip')` (call it repeatedly to level it). Level-up screen: `G.pendingLevels = 1; G.levelGate = 0;` then step twice; click a card with `document.querySelector('.card').click()` or `chooseCard(0)`.
- **Combos**: `allComboPairs()` lists the 76 pairs; `comboDefFor(a, b)`; `unlockAllCombos()`; take with `takeCombo(comboDefFor(a, b))` after maxing both cards; `upgradeCombo(inst)` for level 2 and 3.
- **Screens**: `showMenu()`, `showSettings()`, `showHelp()`, `showShop('upgrades'|'gear'|'ants'|'wheel'|'city')`, `showBestiary()`, `showFusionMachine()`, `showGallery()`, `showVenus()`, `showMars()`, `showLab()`, `showPause()`, `showStats()`. Click things with `GR.handleAction('settings')` or `document.querySelector('[data-a="s-fx"]').click()`.
- **Unlocks / cheats** (this copy has the developer panel): `GR.handleAction('debug-unlockall')`, `'debug-venus'`, `'debug-mars'`, `'debug-city'`, `'debug-lab'`, `'debug-combos'`, `'debug-ants'`, `'debug-enginepart'`, `'debug-buildship'`, `'debug-bestiary'`, `'debug-addgold'`. Or set `Save.data.gold = 1e7; Save.data.gems = 1e5; Save.write();`.
- **Films**: `startCutscene(null, false, kind)` with kind one of `moon`, `venus`, `home`, `a51`, `mars`, `mships`, `marshome`, `fusion`, `sh1`..`sh9`. Step with `GR.step(1/60)` until `G.state !== 'cutscene'`.
- **Mini-modes**: `startForage()`, `startScout()` (Venus), `startMScout()` (Mars); they run inside `GR.step`. The chapter minigames: `GR.startMini(ch, null, 'menu')` (clear the cooldown first with `GR.miniData().last = 0`), then press Space (or call `GR.step` with `GR.Input.keys.Space = true` for a frame) to begin; `GR.G.mini` holds `score`, `goal`, `phase` (`intro`, `play`, `done`) and `prize`. Chapter ch's completion flag (`chapter<ch>Complete`) unlocks the one in the minigames list.
- **Weather events**: `WxE.cur = WX_EVENTS[G.chapter][0]; WxE.age = 0; WxE.dur = 60; WxE.k = 1;` then step. Lightning: `WxE.flash = 1`.
- **Settings**: `Settings.fxLevel` (0 low, 1 medium, 2 high), `Settings.calmFlash`, `Settings.textScale` (0, 1, 2), `Settings.autoKick`.
- **Timing**: `performance.now()` around a loop gives milliseconds per frame (it is software-rendered, so treat only big numbers as meaningful).
- Boss wave: `GR.startRun(ch, (ch - 1) * 25 + 5)` and step until `G.bossAlive`.

## What to report

For every feature in your area, say **both**:

1. **Does it work?** Compare what happened with what a player would expect. Quote any `errors`. Be specific (what you did, what you saw).
2. **How does it look?** Look at the screenshots. Comment honestly on: legibility and contrast, clutter, alignment, anything cut off or
   overlapping, odd colours, empty or dull areas, animation/effects that look wrong or cheap, text that is too small, inconsistent styling.
   Say what could be improved.

Do not invent problems: if you did not test something or could not tell, say so. Do not guess at causes you did not verify.

Finish with a report of at most about 600 words in exactly these sections:

- **Worked well**
- **Broken** (each item: what you did, what happened, what you expected, the error text if any)
- **Looked off or could be better** (each item: where, what, why)
- **Not tested / could not tell**

Your scenario files and screenshots stay in your scratch folder; mention their names so they can be found.

## The university (Campus)
- Districts and rooms: `townGo('campus', x, 1)` and `townGo('in_uhall' | 'in_ulecture' | 'in_ulibrary' | 'in_uhw' | 'in_uexam' | 'in_ucafe', x, 1)`. Open it with `Save.data.chapter1Complete = true`. Pin `townWeatherType=function(){return 'clear'}; Town.fixHour=12;` for steady screenshots.
- State: `uniData()` (`fac[id] = { l, xp }`, `deg`, `badge`, `rk`, `seen`, `read`, `lec`, `facts`, `buff`, `n`), `uniFac(id)`, `uniEnergy()`, `uniGainEnergy(n)`, `uniTotal()`, `uniRankIndex()`, `uniIQ()`, `uniCheckRank()` and `recalcStats()` after setting levels. Run stats are `P.stats.dodge`, `bossDmg`, `cdRed`, `xpMul`, `goldMul`, `dropMul`, `pickupMul`.
- Panels: `uniShowRegistrar()`, `uniShowFaculties()`, `uniShowDegrees()`, `uniShowRanks()`, `uniShowNotebook()`, `uniShowCafe()`, `uniShowJournalTab()`. Pickers: `uniBeginAct({ act: 'uni-lec' | 'uni-shelf' | 'uni-read' | 'uni-hw' | 'uni-exam', m: facultyId })`.
- Sessions are driven by actions through `handleTownAction`: `town-uq-lec-<id>`, `town-uq-book-<id>`, `town-uq-hw-<faculty>`, `town-uq-exam-<faculty>`, then `town-uq-next` / `town-uq-prev` (slides), `town-uq-a-<n>` or `-t` / `-f` (multiple choice, true or false), `town-uq-o-<i>` (order), `town-uq-ml-<i>` then `town-uq-mr-<j>` (match), `town-uq-est` (estimate, reads `#uq-slider`), `town-uq-q-next`, `town-uq-done`. To see a given question format, empty `UNI_Q` (`UNI_Q.length = 0`) and push the question you want, set its `f` to the faculty and `t` to 1, then start homework.
- A level-up with a fourth card: `UNI_EXTRA_CHOICE.fill(1)`, rank high enough, then `G.pendingLevels = 1; G.levelGate = 0;` and step.

## Neck stretch, weather fronts, music stems, ground sounds, photo looks
- Neck stretch: `doKick()` then step a few frames; read `GF.neck.ext` (0 to about 90), `GF.neck.bend`, `GF.land` (the squash) and `NS.ghosts`. Fx level off (`Settings.fxLevel = 0`) turns it all off.
- Weather fronts: `WxE.pend = WX_EVENTS[ch][i]; WxE.next = WxE.t + 9; WxE.front = 0.65;` shows the clouds coming; `WxE.cur = ev; WxE.k = 0.3` is the first drops, `WxE.k = 1` the full fall.
- Music stems: `Music.stems` ({ bass, drums, lead, near, spike, low }) and `Music.stemOn` (true only in a normal run). Put enemies near her for the bass, 20+ enemies out for the drums, `P.hp` under 40% for the lead.
- Ground sounds: `groundNow()` says what she stands on and the weather's effect; `SFX.foot()` and `SFX.groundImpact()` play it. A pond: `G.water = { x: P.x, y: P.y, r: 150 }`.
- Photo studio: `PHOTO.filter` (0 to 4), `PHOTO.frame` (0 to 7), `PHOTO.tod` (-1 or 0 to 47, half hours), `PHOTO.freeze`, then `photoRender(canvas, false)`; `photoToCode()` writes code version 5 only if one is set.

## Gear page, gear art, levels, crates, effects
Scenarios are in `tools/scenarios/` (run each with `node tools/qa-cloud.mjs tools/scenarios/<name>.js --wait 25000`, add `--shot x.png` and the params below to see it):
- `gear-levels.js`: levels (`gearLevel(id)`, `gearLevelUp(id)`, `gearLevelScale(n)`), `gearStatsFor({cape, weapon, armor})`, `gearDelta(slot, id)`, `cratePityCount(kind)` / `cratePityBump(kind, good)`.
- `gear-art.js`: `view=capes|weapons|armor`, `lv=1..5`, `page=0|1` (weapons), `zoom=1.9`. Draws a contact sheet of all 16 over the page (capes by `drawPlayer` with each equipped); also checks that every design paints pixels.
- `gear-icons.js`: `size=64|128`. All 48 `gearIcon(id, size, {locked, level})` data URLs, cached (`gearIcon._draws`), `gearFrame(rarity)`, and a sheet of unlocked and locked icons.
- `gear-page.js`: `state=empty|one|set|kick|sets|compare` (+ `slot=`, `hover=` for compare). `showShop('gear')`, `gearPage` ({ slot, selected, hover, view }), `gearSyncSelection()`, `gearPreviewDraw(canvas, ms)` (the headless browser throttles `requestAnimationFrame`, so draw the picture by hand before a screenshot), `gearPreview.frames`. `phone`: add `--w 390 --h 844`.
- `gear-crates.js`: pity (`CRATE_PITY`), duplicates levelling a piece up, the reveal (`gearReveal`: `active`, `phase`, `timers`; `gearRevealSkip()`, `gearRevealPhase(n)`, `gearRevealEnd()`). Force a roll by replacing `rollRarity`. Add `--params "shot=1&phase=shake|burst|result"` for the screens.
- `gear-fx.js`: the eight effects (`GEAR_FX`, `GearFx`) through the real hooks: `wear([ids])`, `hurtPlayer(n, x, y)`, `doKick()`, `GR.step`. `show=wake|dust|frost|star|ward` stages a screenshot of one. Enemies are found with a loop over `G.enemies` (the spatial grid does not hold just-spawned ones), and `e.stunT = 99` keeps a test enemy still.

## More gear sets and the mythical tier
- `gear-more.js` (`node tools/qa-cloud.mjs tools/scenarios/gear-more.js --wait 60000`): 22 sets and 66 pieces by rarity, the new weapons, `RARITY_ORDER.mythical`, the crate odds (`CRATES.normal.weights.mythical` 0.02, `CRATES.rare.weights.mythical` 0.1, each crate summing to 100), the edge rolls (stub `Math.random`: 0.99985 gives a mythical from both crates, 0.9997 only from the Prime Crate), a two-million-roll count for each crate, art and icons for every new piece, a forced mythical roll through `openCrate`, and the odds printed on the crate cards. Add `sheet=capes|weapons|armor|all` (and `page=1` for the last two weapons) to draw a contact sheet of the six new sets.
- `gear-page.js` gained `state=mythic` (Worldspire worn, pointing at its weapon) and `state=mythicsets` (the Sets view filtered to it); `gear-crates.js` takes `rar=mythical` with `shot=1&phase=result` for the reveal. `gear-fx.js` covers Aegis, Dawnlight and Falling spire.

## Spotted Crates
- `gear-spotted.js` (`node tools/qa-cloud.mjs tools/scenarios/gear-spotted.js --wait 60000`; `--params "view=card"` or `view=reveal` with `--shot` to see it): `CRATES.spotted` (1,000 gems and 50 food, weights 10 / 28 / 36 / 24 / 2 summing to 100), edge rolls with a stubbed `Math.random`, a 200,000-roll count, `openCrate('spotted')` returning null and spending nothing when gems or food are short (`Save.data.food` is kept to one decimal), exactly enough being enough, the card on the Gear page (three crates, the button disabled without food), a double `buyCrate` spending once, and the Supply and Prime Crates unchanged. Set food in a scenario with `Save.data.food = 120`.

## Buy 5 and Buy 10
- `gear-batch.js` (`node tools/qa-cloud.mjs tools/scenarios/gear-batch.js --wait 60000`; for pictures add `--shot x.png --params "view=ten|five"`, `kind=normal|rare|spotted`, `phase=shake` and `force=common,rare,epic,...` to stub the rolls): `gearBuyMany(kind, 5|10)` opens them all through `openCrate` (so pity, levelling, food and refunds work as for one), refuses unless the whole batch is affordable (nothing spent), then plays one reveal with every opening at once, five to a row (`#crateReveal .crc` cells in `.crgrid`; `gearReveal.batch` holds the results). The scenario checks the two rows, the cell names, the summary line, the second-click guard, the prices on the buttons (`[data-a="gear-buy-<kind>-<n>"]`), pity running through ten opens, duplicates levelling up inside a batch, the Visual effects "off" timer, and that leaving the tab ends the reveal.

## The Gear page's side panel
- `gear-side.js` (`node tools/qa-cloud.mjs tools/scenarios/gear-side.js --wait 30000`; add `--params "show=long" --shot x.png`, and `--w 390 --h 844` for a phone): the panel beside the picture (`#gearSide`) keeps one height whatever is shown (the picture's height on a wide screen, 240px in one column) and the picker below does not move; a long comparison scrolls inside it, with a soft fade (`.more`, `gearSideFlags()`) while there is more below; the pointer can travel from a tile to the panel (a 350 ms grace period, `gearPage.clearT`, `gearHoverClear()`) so it can be scrolled and Equip can be pressed. The headless harness does not run real timers, so the scenario checks that the timer is armed and cancelled and calls `gearHoverClear()` to simulate it expiring.

## Performance
Headless Chromium here draws in software, so milliseconds are not a good guide to a phone. Count canvas calls instead: they do not depend on the machine.
- `perf-calls.js` (`node tools/qa-cloud.mjs tools/scenarios/perf-calls.js --params "ch=5&n=120"`): canvas calls per frame in a held-alive run, split by draw stage, plus how many used a blur (`shadowCallsPerFrame`, each `@file:line` is one). Params: `ch`, `n`, `gear=1` (Worldspire worn at level 5), `menu=1` (the menu backdrop), `fx=1` (force the effects level), `nocache=1` (tiles off). `result.gc` shows the tile counters for both layers.
- `perf-ground.js` (`--wait 400000`): the ground and scenery tiles (`js/44ca-ground-cache.js`): live at full effects, tiled at level 1 with fewer calls on every biome tried (about two thirds fewer in total), a new world (even the same chapter again) makes new tiles, moving scenery such as ferns is kept out of them, and the tile counts stay capped. Prints `pass`.
- `perf-gearpage.js`: opening the Gear tab cold (icons are drawn on demand) and warm, and one preview frame. `perf-ab.js` and `perf-spike.js`: frame times and the frames over 25 ms.
- `node tools/qa-cloud.mjs x.js --profile` prints the top functions by self time on stderr. `QA_ROOT=/path/to/other/checkout` runs the harness against another copy of the game, for before-and-after comparisons.

## The trinkets
- `trinket-ui.js` (`node tools/qa-cloud.mjs tools/scenarios/trinket-ui.js --wait 60000`; for pictures add `--shot x.png` with `--params "show=pick|none|locked|helmet|sets"`, and `--w 390 --h 844 --scale 2` for a phone): the 14 tiles and the locked silhouettes, `trinketStats` equal to what `recalcStats` gives (Burrow Boots, the Lime Helmet's 7% cut) and everything restored afterwards, tapping wears and removes in place with the count and panel updated, pointing shows "if you wear it" rows and changes nothing, a locked one cannot be worn, the total of what is worn, the notes on Red Rampage and the Lune, the Lime Helmet tried on in the picture and put back, and an old save's worn list. Prints `pass`.
