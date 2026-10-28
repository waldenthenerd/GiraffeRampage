# Gear Page and Gear Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-card Gear tab with a paper-doll page (live giraffe preview wearing the gear, slot pickers, stat comparison, drawn piece icons), add new in-world art for all 48 pieces, a crate reveal with pity, gear levels from duplicates, and 8 gear pieces with special effects.

**Architecture:** New classic-script files that override `gearTabHTML` and the cape/weapon/armor drawing by the wrapper pattern (later declarations win; `index.html` order matters). Gear art lives in a registry keyed by the existing piece ids (`setid:slot`) so ownership, equipping and saves stay untouched. New save data sits beside `Save.data.gear` and `Save.data.equipped`, never inside them, so old saves load unchanged.

**Tech Stack:** Plain canvas 2D, classic `<script>` files, no build step; the QA runner `tools/qa-cloud.mjs` (Playwright Chromium) for tests and screenshots.

**Spec:** The user's request in this session (changes 1, 2, 3, 6, 7, 8 from the gear discussion, plus: the preview shows gear in-world with new art, and hats and boots stay separate from gear). No separate spec file; the decisions are in "Global Constraints" below.

## Global Constraints

1. Scope: paper-doll layout (1), compare-before-equip (2), piece art (3, in detail), crate moment (6), gear upgrading (7), gear with a playstyle (8). Not in scope: loadouts (5), rebalancing the 16 sets, sets-view overhaul (4), linking university boosts to this page (9).
2. The giraffe preview shows gear in the world with new art (capes, weapons, armor), at the same drawing used in play.
3. Hats and boots are separate from gear: no hat or boot controls on the Gear page, `Save.data.equipped` keeps only `cape`, `weapon`, `armor`. The preview draws her current hat and boots as already chosen on the Coat colors screen (read-only), with one button to open that screen.
4. Saves stay backward compatible: existing keys (`gear`, `equipped`, `equippedTrinkets`, `cratesOpened`) are not renamed or reshaped. New keys default when absent.
5. `Settings.showGear` still hides gear art in play. Visual effects "off" turns the special-effect particles and the crate sparkle off.
6. `js/dev/45b-dev-panel.js` stays out of the website build; the Lovable `GR` export/save bridge is untouched.
7. No shake-reduction setting. Cutscenes never announce the end of the game.
8. Edits are exact-match replacements; new behavior goes in new files that wrap old functions.
9. After every task: update `README.md` (new rows, recount per-file line counts and totals), the script count in `lovable.md`, and `tools/QA-GUIDE.md`; verify visual work with screenshots.
10. Numbers pinned by this plan: gear levels 1 to 5 (stored as the number of upgrades, 0 to 4); each level adds 10% to a piece's own effect numbers (level 5 = +40%); pity: a Supply Crate guarantees rare or better on the 10th open without one, a Prime Crate guarantees epic or better on the 8th; 8 special-effect pieces.

## Review Focus

1. Old save (no `gearLv`, no `cratePity`) opens, equipped pieces keep working, level reads as 1. (Task 1)
2. Equipped id that no longer exists, or an upgraded piece whose set changed: loadout falls back to empty, page does not throw. (Task 1, Task 6)
3. Visual effects "off", `Settings.showGear` off, and a tiny/phone-width screen: page and preview still render without errors or horizontal scroll. (Task 6)
4. Rapid clicking Equip, Take off and crate open: no double spend, no duplicate level-up, preview and stats stay in sync. (Task 6, Task 8, Task 9)
5. Opening a crate while the reveal animation is playing, or leaving the tab mid-reveal: gems are spent once, the piece is granted once, and the animation does not leak a timer. (Task 8)

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `js/game/05a-gear-levels.js` | create (after 05-gear) | Level model, stat preview, pity counters, `GEAR_FX` registry data. No drawing, no HTML. |
| `js/art/33a-gear-art-capes.js` | create (after 33-giraffe-art) | 16 cape designs and the `capeDraw` hook used by `drawPlayer`. |
| `js/art/33b-gear-art-weapons.js` | create | 16 in-world weapon designs, drawn on the hooves/head during and between kicks. |
| `js/art/33c-gear-art-armor.js` | create | Armor pass: audit of the 16 `ARMOR_DESIGNS`, redraws where weak, level pips and rarity glint. |
| `js/art/33d-gear-icons.js` | create | `gearIcon(id, size)` canvas icons, silhouettes and rarity frames, cached. |
| `js/render/36p-gear-fx.js` | create | The 8 special effects at runtime: hooks on kick, hurt and tick. |
| `js/ui/41a-gear-page.js` | create (after 41-qol, before 43-input) | The new Gear tab: paper doll, preview canvas, slot picker, compare panel, crate reveal. Overrides `gearTabHTML`. |
| `css/gearpage.css` | create | Styles for the above (linked from `index.html`). |
| `js/core/43-input.js` | modify | Only new `case` lines in `handleAction` for the new `data-a` actions, plus unchanged dataset handlers. |
| `index.html` | modify | Script and stylesheet tags in the order above. |
| `README.md`, `lovable.md`, `tools/QA-GUIDE.md` | modify | Per rule 9. |

Branch: `gear-revamp`, created from `polish-pack` (it holds the neck-stretch hook the weapon art uses). If `polish-pack` is merged first, rebase onto `main`.

---

### Task 1: Level model, stat preview, pity (data layer)

**Files:**
- Create: `js/game/05a-gear-levels.js`
- Modify: `index.html` (tag after `05-gear.js`)
- Test: `tools/scenarios/gear-levels.js` (QA scenario; `QA.done({...})`)

**Interfaces:**
- Produces:
  - `gearLevel(id: string): number` (1 to 5; 1 when absent or not owned).
  - `gearLevelUp(id: string): boolean` (false at 5 or when not owned).
  - `GEAR_LV_MUL = 0.10` and `gearLevelScale(level: number): number` = `1 + 0.10 * (level - 1)`.
  - `gearStatsFor(loadout: {cape?: string|null, weapon?: string|null, armor?: string|null}): {stats: object, weapon: object}` — a fresh baseline stat object with that loadout applied; does not touch `Save.data.equipped` or `P.stats`.
  - `gearDelta(slot: string, id: string|null): Array<{key: string, label: string, from: number, to: number, better: boolean}>` — comparison of swapping `id` into `slot` against what is equipped now; includes set-completion info as an entry with `key: 'set'`.
  - `cratePityCount(kind: 'normal'|'rare'): number` and `cratePityBump(kind, gotGood: boolean): void`.
- Save keys added: `Save.data.gearLv` (`{[pieceId]: 0..4}`), `Save.data.cratePity` (`{normal: n, rare: n}`).

- [ ] **Step 1: Write the failing scenario** in `tools/scenarios/gear-levels.js` asserting: (a) fresh save, `gearLevel('herdhide:cape') === 1`; (b) after `grantGear` + `gearLevelUp` four times it is 5 and a fifth call returns false; (c) `gearLevelScale(5) === 1.4`; (d) `gearStatsFor({cape:'herdhide:cape'}).stats.maxHpAdd === 10` at level 1 and `14` at level 5; (e) `gearDelta('armor','herdhide:armor')` against an empty armor slot returns one entry for `dr` with `to - from === 0.04`; (f) `JSON.stringify(Save.data.equipped)` is unchanged after `gearStatsFor`.
- [ ] **Step 2: Run it, expect FAIL** ("gearLevel is not defined"): `node tools/qa-cloud.mjs tools/scenarios/gear-levels.js --wait 20000`
- [ ] **Step 3: Implement `js/game/05a-gear-levels.js`.**
  - `applyGear` is wrapped: after each equipped piece's `apply(s)` the numeric differences against a snapshot are scaled by `gearLevelScale(level)` (additive keys scale the difference; multiplicative keys such as `hasteMul`, `kickKb` scale `(after / before - 1)`). The set bonus is not scaled.
  - Weapon level adds 6% per level to `P.weapon.dmg` through a copied weapon object in `equippedWeapon` (wrapped), never mutating `WEAPONS`.
  - `Save.load` defaults: add the two keys when missing via a wrapper on `Save.load`, same pattern as other save files.
- [ ] **Step 4: Run the scenario, expect PASS.**
- [ ] **Step 5: Regression:** `node tools/qa-cloud.mjs tools/scenarios/reg.js --wait 20000` (chapters 1 to 13) must print no errors.
- [ ] **Step 6: Commit** `git add js/game/05a-gear-levels.js index.html tools/scenarios/gear-levels.js && git commit -m "Gear levels, stat preview and crate pity counters"`

---

### Task 2: New cape art (16 designs)

**Files:**
- Create: `js/art/33a-gear-art-capes.js`
- Modify: `js/art/33-giraffe-art.js` (the cape block at "cape: sits over the mane", replace the generic sheet with a call to the hook, keep the old drawing as the fallback)
- Test: `tools/scenarios/gear-art.js`

**Interfaces:**
- Consumes: `P.capeColor`, `P.armorInfo`, `GF`, `shade(hex, amt)`.
- Produces: `CAPE_DESIGNS: {[setId]: function(ctx, o)}` where `o = {bx, by, tipA, len, spread, ppx, ppy, color, t, level, rarity}`; `capeDraw(ctx, setId, o): boolean` (false = use the generic cape). `P.capeSet` is set in `recalcStats` by wrapping `equippedCapeColor`'s caller (wrap `recalcStats`, read `gearEquipped('cape')`).

**Design table (one line each; each design must read as different at the 2x close-up size, not only recoloured):**
Herdhide patched hide with stitched seam; Thornweave leafy shawl with thorn tips; Stoneplate tabbed stone flaps; Frostbite fur-trimmed cloak with ice beads; Acacia Warden woven bark-and-leaf mantle with a seed pouch; Twinsoul two-tone split cloak with a drifting second tail; Glacier Guard crystal-edged cape; Sunforged gold-trimmed flame hem; Aurora ribbon cape with a slow color shift; Starborn star-dusted night cloth with twinkles; Tideshell scalloped shell scales; Riptide ragged wave hem with foam flecks; Abyssal dark cloth with glowing seams; Canopy leaf-layered cape; Jaguarhide spotted pelt with a tail tip; Leviathan fin-like cape with a gilled edge.

- [ ] **Step 1: Write the failing check** in `gear-art.js`: for every set id in `GEAR_SETS`, `typeof CAPE_DESIGNS[id] === 'function'`, and `capeDraw(ctx, id, sample)` on a 120x120 canvas returns true and changes at least 40 pixels (`getImageData` non-transparent count).
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement the 16 designs.** Each uses the same cloth skeleton as the generic cape (anchor `bx,by`, quad curves toward `tip`) so the wind drift, lag and flutter stay shared. Level 3+ adds a trim line; level 5 adds a glint. Only the silhouette, hem and detail differ per design.
- [ ] **Step 4: Wire `drawPlayer`:** `if (typeof capeDraw === 'function' && P.capeSet && capeDraw(ctx, P.capeSet, o)) {} else { generic }`.
- [ ] **Step 5: Screenshots:** a scenario equips each of the 16 capes in turn, renders the player in a calm chapter 1 spot at 2x zoom (existing `GR` zoom helper from the 2x close-up pass), and saves a 4x4 contact sheet. Open the PNG and check each cape reads distinctly and nothing clips at the shoulder.
- [ ] **Step 6: Run the check, expect PASS; run `reg.js`; commit** `"Cape art: 16 designs"`.

---

### Task 3: In-world weapon art (16 designs)

**Files:**
- Create: `js/art/33b-gear-art-weapons.js`
- Modify: `js/art/33-giraffe-art.js` (one call after the head is drawn, for the held/worn weapon)
- Test: `tools/scenarios/gear-art.js` (extend)

**Interfaces:**
- Consumes: `P.weapon.id`, `P.kickAnim`, `GF.neck` (36n), `GF.land`.
- Produces: `WEAPON_ART: {[weaponId]: {rest(ctx, o), swing(ctx, o)}}` with `o = {x, y, a, e, color, level, t}` (`e` = kick progress 0 to 1, same as `neckProfile`); `weaponArtDraw(ctx, weaponId, o): boolean`. Weapons are worn on the hooves or head, not held, so every design attaches to the front hoof pair (kicks) or the head (fangs, maul, lance).

**Design table:** hooves (bare, with a faint hoof shine, no art at rest); spurs (thorny hoof spurs, small bleed drip on hit); stone (stone hoof caps, dust on swing); icefangs (ice fangs on the head); lance (acacia lance along the neck line); twin (two trailing tails that whip with the swing); glaciermaul (ice maul head on the neck tip); sunspear (spear with a flame tip); aurora (ribbon fang with a color shift); starbreaker (star-shaped hoof guards); tideshellclub (shell club, water drops); riptide (trident, foam arc); abyssal (anglerfish lure light on the head); vinelash (vines trailing from the hooves); jaguarfang (claw hooks); leviathan (maw ring around the hooves, spinning with the strike).

- [ ] **Step 1: Extend the failing check:** each of the 15 non-default weapons in `WEAPONS` has `WEAPON_ART[id].rest` and `.swing`; `weaponArtDraw` returns true and paints at least 25 pixels for both poses.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement the designs.** `rest` draws the idle attachment; `swing(e)` uses the same `e` as the neck lunge so the swing and the headbutt line up; each design has one signature motion from the table. Level 4+ adds a glow in the weapon color.
- [ ] **Step 4: Screenshots:** two frames per weapon (rest, swing at `e = 0.3`) in a 4x8 contact sheet; confirm nothing covers the face or draws behind the body, and that the damage arc from the existing kick effect still reads over the art.
- [ ] **Step 5: Run the check (PASS), `reg.js`, commit** `"Weapon art: 16 in-world designs"`.

---

### Task 4: Armor pass

**Files:**
- Create: `js/art/33c-gear-art-armor.js`
- Test: `tools/scenarios/gear-art.js` (extend)

**Interfaces:**
- Consumes: `ARMOR_DESIGNS` (33-giraffe-art.js, 16 existing functions `(ctx, c, t)`).
- Produces: `armorDecorate(ctx, setId, color, rarity, level, t)` called after each design (wrap in `drawPlayer` through a thin wrapper of the table's functions, so the originals stay intact); `ARMOR_REDRAW: {[setId]: function(ctx, c, t)}` that replaces a weak original.

- [ ] **Step 1: Audit.** Render all 16 armors at 3x on one sheet, screenshot, and list which look weak (flat ellipse, indistinguishable from another set). Redraw only those in `ARMOR_REDRAW`; the audit result goes in the commit message.
- [ ] **Step 2: Failing check:** `armorDecorate` exists; level 5 pixel count is greater than level 1 for every set (pips or glint add detail).
- [ ] **Step 3: Implement** the redraws, the rarity glint (rare: faint rim, epic: slow sparkle, legendary: orbiting motes) and the level pips (small dots on the back plate, 1 per level above 1).
- [ ] **Step 4: Screenshots** of the before/after sheet; verify and commit `"Armor pass: redraws, rarity glint, level pips"`.

---

### Task 5: Piece icons, silhouettes, rarity frames (detail)

**Files:**
- Create: `js/art/33d-gear-icons.js`, part of `css/gearpage.css`
- Test: `tools/scenarios/gear-icons.js`

**Interfaces:**
- Consumes: `CAPE_DESIGNS`, `WEAPON_ART`, `ARMOR_DESIGNS`, `ARMOR_REDRAW`, `GEAR_INDEX`.
- Produces:
  - `gearIcon(id: string, size: number = 64, opts?: {locked?: boolean, level?: number}): string` — a data-URL PNG, cached per `id|size|locked|level`.
  - `gearFrame(rarity: string): {border: string, glow: string, bg: string[]}` with the four rarity looks (common: dust gray, rare: acacia green, epic: jacaranda purple, legendary: gold with a slow shimmer class).
  - `gearIconInvalidate(): void` — clears the cache (called when the accent color changes on the Coat colors screen).
- Rules: the icon is the piece alone, no giraffe: a cape drawn flat on a hanger-like crop, a weapon drawn on a plain hoof pair, an armor drawn as a chest plate. Locked pieces draw the same shape as a flat dark silhouette (color `#1B1410`, 0.9 alpha) with no inner detail, so the shape shows but the design does not. The accent color (`giraffeAccent()`) is applied to unlocked icons, as it is in play.

- [ ] **Step 1: Write the failing check:** `gearIcon(id, 64)` returns a string starting with `data:image/png` for all 48 ids; locked icons differ from unlocked ones; second call returns the identical string without redrawing (spy on a draw counter exposed as `gearIcon._draws`).
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** the three icon renderers, the locked silhouette (draw, then `source-in` fill), the frame table, and the cache. Sizes in use: 56 (set list), 72 (slot picker), 96 (compare panel), 128 (crate reveal).
- [ ] **Step 4: Screenshots:** a sheet of all 48 icons unlocked and locked at 64 and 128; confirm the silhouettes are recognizable by shape and no icon is clipped.
- [ ] **Step 5: Run the check (PASS) and commit** `"Gear icons: drawn, silhouettes, rarity frames"`.

---

### Task 6: Paper-doll Gear page (change 1)

**Files:**
- Create: `js/ui/41a-gear-page.js`, `css/gearpage.css`
- Modify: `index.html`, `js/core/43-input.js` (new `case` lines only)
- Test: `tools/scenarios/gear-page.js`

**Interfaces:**
- Consumes: `gearIcon`, `gearFrame`, `gearLevel`, `gearDelta` (Task 7 fills the compare panel; this task leaves the panel empty), existing `equipGear(id)`, `unequipSlot(slot)`, `gearOwned`, `gearEquipped`, `toggleTrinket`, `trinketsHTML`, `showShop`, `showWardrobe` (the Coat colors entry; confirm the actual name in `44e-wardrobe.js`).
- Produces:
  - `gearTabHTML(): string` (override, same name and no arguments).
  - `gearPreviewMount(): void` — called after the tab is inserted; creates the preview `<canvas id="gearPreview">` loop and returns a stop function stored in `gearPreview.stop`.
  - `gearPage = {slot: 'cape'|'weapon'|'armor', selected: string|null, view: 'doll'|'sets'}`.
  - Actions (`data-a`): `gear-slot-cape|weapon|armor`, `gear-pick-<id>`, `gear-view-doll|sets`, `gear-demo-kick`, `gear-wardrobe`.
- Layout (top to bottom): header with owned count; the doll row (left: three slot buttons with icons and level; center: the preview canvas; right: trinkets stack); the slot picker grid for the chosen slot (owned pieces first, then silhouettes); the compare panel (Task 7); crates (Task 8); the existing set list kept as the second view `sets`, restyled with `gearIcon`s. Crate and trinket markup are reused, not rewritten.
- Preview: `drawPlayer`-equivalent for a standing giraffe on a plain painted backdrop. The preview draws the player in an offscreen call of the real drawing code (set `P` to a clone: `{x, y, aim: 0, face: 1, cards: []}`, swap in, draw, swap back, so the page shows exactly what play shows). Idle breathing, cape flutter on a fake wind, a "Kick" button that plays the kick and the neck lunge. Her hat and boots draw as she wears them now; no controls for them. A single "Hats, boots and colors" button calls the wardrobe screen.
- Hot paths: the preview loop runs only while the tab is open (`requestAnimationFrame`, canceled when `shopTab !== 'gear'` or the overlay closes) and caps at 30 frames per second.

- [ ] **Step 1: Failing scenario** `gear-page.js`: open `showShop('gear')`; assert `document.getElementById('gearPreview')` exists, three `[data-a^="gear-slot-"]` buttons exist, no element in the tab contains the text "Hat" or "Boots" as a control, the old `#gearSearch` is absent from the doll view. Equip a cape through the UI click and assert `P.capeSet` changed and the preview redrew (counter `gearPreview.frames` increased).
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** `gearTabHTML` override, the preview loop with its stop hook, the slot picker, the `sets` view (reusing the old list rendering moved verbatim), and the `handleAction` cases.
- [ ] **Step 4: Run, expect PASS.** Then rapid-click check: 20 clicks on Equip/Take off, assert `Save.data.equipped` matches the last click and the stat panel matches `P.stats`.
- [ ] **Step 5: Screenshots** at 1280x720 and 390x844 (phone width): doll view with nothing, one piece, a full set (set bonus line shown), and the sets view. Check no horizontal scroll and no overlap of the preview and picker.
- [ ] **Step 6: Run `all2.js`, `u3.js`, `reg.js`; commit** `"Gear page: paper doll with live preview"`.

---

### Task 7: Compare before equipping (change 2)

**Files:**
- Modify: `js/ui/41a-gear-page.js`, `css/gearpage.css`
- Test: `tools/scenarios/gear-page.js` (extend)

**Interfaces:**
- Consumes: `gearDelta(slot, id)` (Task 1), `activeSetBonus()`, `setWornCount(setId)`.
- Produces: `gearComparePanel(slot: string, id: string|null): string` HTML; `gearPage.selected` drives it; hovering a picker item on desktop and tapping on touch both set `selected` without equipping, and the preview shows the selected piece worn (a "try on" that does not change `Save.data.equipped`).

- [ ] **Step 1: Failing check:** select `herdhide:armor` with armor empty; panel text contains "Damage taken" and "-4%" in green; select a weaker piece than the one worn; panel shows red for the lost stat; selecting a second piece of a set where two are worn shows "Completes Herdhide 3/3" with the set bonus line.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** the panel (stat label table for `maxHpAdd`, `dr`, `speedMul`, `hasteMul`, `kickDmgMul`, `crit`, `regen`, `reflect`, etc. in `GEAR_STAT_LABELS`, with a format per key: percent, flat, or per second). Weapons show cooldown, damage, range, arc from the `WEAPONS` entry plus its blurb, with the same better/worse coloring (a lower `cd` is better).
- [ ] **Step 4: Check the try-on does not persist:** close and reopen the tab, equipped slot unchanged, no `recalcStats` called during try-on (spy count).
- [ ] **Step 5: Screenshots** of green, red and set-completion states; commit `"Gear page: compare panel and try-on"`.

---

### Task 8: Crate moment and pity (change 6)

**Files:**
- Modify: `js/ui/41a-gear-page.js`, `css/gearpage.css`
- Create: wrapper in `js/game/05a-gear-levels.js` for `openCrate`
- Test: `tools/scenarios/gear-crates.js`

**Interfaces:**
- Consumes: `openCrate(kind)` (returns `{piece, dupe, refund, rarity}`), `rollRarity(weights)`, `buyCrate(kind)` in `43-input.js` (find the existing wrapper; the new reveal replaces its `showShop` redraw), `crateResult`, `cratePityCount/Bump`.
- Produces: `openCrate` wrapper that forces the rarity floor when pity is reached (`normal` after 10 opens without rare+, `rare` after 8 without epic+), resets the counter on a qualifying drop, and sets `res.pity = true` when the floor was used; `crateReveal(res: object): void` — a full-panel overlay: crate shakes (0.6s), a light burst in the rarity color, the piece icon (128px) rises, name and set, "New" or "Level up to +N" or "Maxed, refunded N gems", with a skip on click. The reveal sounds use `SFX.tone` with a rarity-dependent rise; Visual effects "off" shortens the reveal to 0.2s with no particles.
- Rule: gems are spent and the piece is granted before the animation starts (the animation is cosmetic); a second `openCrate` while `crateReveal.active` is ignored.

- [ ] **Step 1: Failing scenario:** with `Save.data.cratePity.normal = 9` and every roll forced to common (stub `rollRarity`), the 10th `openCrate('normal')` returns rarity `rare` or better and `res.pity === true`; the counter resets to 0; a normal rare+ drop earlier also resets it; opening during `crateReveal.active` returns null and spends no gems.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** the wrapper and the reveal. The pity text appears in the crate card ("Rare or better guaranteed in N opens").
- [ ] **Step 4: Screenshots:** the shake frame, the burst frame, and the result for common and legendary; check the reveal closes on click and on tab change with no stray timers (`crateReveal.timers.length === 0`).
- [ ] **Step 5: Run the scenario (PASS), `reg.js`; commit** `"Crates: reveal animation and pity counters"`.

---

### Task 9: Upgrading gear with duplicates (change 7)

**Files:**
- Modify: `js/game/05a-gear-levels.js` (the `openCrate` wrapper), `js/ui/41a-gear-page.js`
- Test: `tools/scenarios/gear-levels.js` (extend)

**Interfaces:**
- Consumes: `gearLevelUp`, `DUPE_REFUND` (18 gems).
- Produces: duplicate behavior: a duplicate of an owned piece below level 5 calls `gearLevelUp` and refunds nothing; at level 5 it refunds `DUPE_REFUND` as now. `res.levelUp = newLevel` is set so the reveal can show "Level up to +N". Crates prefer unowned pieces first (unchanged), so levelling only starts once the rarity pool is owned. The page shows the level as pips on slot buttons and icons, and the compare panel lists "Level 3 -> 4: +10% of this piece".

- [ ] **Step 1: Extend the failing check:** own `herdhide:cape`, force a duplicate roll: `gearLevel` goes 1 to 2, gems unchanged apart from the crate cost; at level 5 the next duplicate refunds 18 gems and the level stays 5.
- [ ] **Step 2: Run, expect FAIL; implement; run, expect PASS.**
- [ ] **Step 3: Check stats:** `P.stats.maxHpAdd` for an equipped `herdhide:cape` at level 5 is 14; the weapon at level 5 deals 24% more damage (`6% x 4`).
- [ ] **Step 4: Screenshot** the picker showing level pips; commit `"Gear levels: duplicates upgrade pieces"`.

---

### Task 10: Gear with a playstyle (change 8)

**Files:**
- Create: `js/render/36p-gear-fx.js`
- Modify: `js/game/05a-gear-levels.js` (the `GEAR_FX` descriptions), `js/ui/41a-gear-page.js` (an "Effect" line on the piece and compare panel)
- Test: `tools/scenarios/gear-fx.js`

**Interfaces:**
- Consumes: `doKick()` (06-player.js), `hurtPlayer(amount, sx, sy)` (03-combat-core.js), `P.stats`, `addParticle`, `neckStretchLanded` (02d), `gearEquipped(slot)`, `gearLevel(id)`.
- Produces: `GEAR_FX: {[pieceId]: {name, desc, onKick?(lvl), onHurt?(lvl, amount), onTick?(lvl, dt)}}` for exactly these 8 (pieces are existing ids, effects scale with `gearLevelScale`):
  1. `thornweave:armor` — Thorns: when hurt, nearby enemies within 70 take `10 x scale` damage.
  2. `stoneplate:cape` — Dust cloak: while moving, a dust trail slows enemies that cross it by 15% for 1s.
  3. `frostbite:weapon` — Cold snap: the neck lunge landing frosts a ring of 90 radius (slow 30% for 1.5s).
  4. `sunforged:armor` — Sun ward: every 12s, a flare shield absorbs the next hit up to `20 x scale`.
  5. `aurora:cape` — Aurora drift: standing still for 2s grants +10% xp for 6s.
  6. `starborn:weapon` — Star crack: every 5th headbutt fires a star shockwave of 140 radius for 60% damage.
  7. `riptide:armor` — Undertow: taking a hit in water pulls nearby enemies 40 units toward you.
  8. `leviathan:cape` — Tidal wake: a wake of drops trails you; enemies in it take 4 damage per second.
- Hooks: wrap `doKick` (call `onKick` for the equipped weapon and neck), wrap `hurtPlayer` (call `onHurt` on the equipped cape and armor, the shield effect may reduce `amount`), and wrap the player update used for ticks (confirm the name in `06-player.js` before wrapping).
- Visual effects "off" keeps the effect but skips the particles.

- [ ] **Step 1: Failing scenario:** for each of the 8, equip the piece, call the hook through the real path (`doKick()` or `hurtPlayer(10)` in a staged fight with one enemy at distance 40), and assert the numeric result: thorns reduces the enemy's `hp` by 10, shield absorbs the first hit then expires, aurora gives `xpMul` +0.10 after 2s still, star crack fires on kick 5 and not on 4, undertow moves a staged enemy 40 units closer.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** hooks and the 8 effects, each in its own small function. Each effect reads `gearLevel(id)` for its scale.
- [ ] **Step 4: Check no effect fires when the piece is not equipped, and none fires at `P.dead`.** Edge: two pieces with hooks equipped together both fire.
- [ ] **Step 5: Screenshots** of the visible ones (frost ring, star shockwave, dust trail, tidal wake, sun ward flare) in a staged fight; commit `"Gear effects: eight pieces with a playstyle"`.

---

### Task 11: Docs, regression, merge readiness

**Files:** `README.md`, `lovable.md`, `tools/QA-GUIDE.md`, `index.html`, `css/gearpage.css` link.

- [ ] **Step 1:** README file-map rows for the 7 new JS files and the stylesheet; update the Gear and "Gear, weapons, trinkets" lines; recount per-file line counts and totals (CLAUDE.md rule 3); update the script count in `lovable.md`.
- [ ] **Step 2:** `tools/QA-GUIDE.md` section "Gear page, gear art, levels, crates, effects" listing the new scenarios and the helpers (`gearPage`, `gearPreview.frames`, `crateReveal.active`).
- [ ] **Step 3:** Full regression: `all2.js` (65 places, no errors), `u3.js`, `reg.js`, plus all five new scenarios; confirm `js/dev/45b-dev-panel.js` is still excluded from the website build list and the `GR` bridge works with an old-save fixture.
- [ ] **Step 4:** Old-save fixture check: load a saved game from before this branch (use a copy from `tools/` fixtures or generate one on `main`), open the Gear tab, confirm equipped pieces, level 1 everywhere, no errors.
- [ ] **Step 5:** Commit `"Docs for the gear revamp"`, push `git push -u origin gear-revamp`, and ask whether to merge.

---

## Self-Review

1. **Spec coverage:** change 1 (Task 6), 2 (Task 7), 3 with detail (Tasks 2 to 5: capes, weapons, armor, icons), 6 (Task 8), 7 (Task 9), 8 (Task 10); in-world preview with new art (Tasks 2 to 4 and 6); hats and boots separate (Global Constraint 3 and Task 6). No gaps.
2. **Step scan:** every task names files, signatures, the exact numbers pinned in the constraints, and a check with the values to assert. Art tasks give a per-piece design list and screenshot gates in place of code, since the drawing bodies are the implementer's work.
3. **Type consistency:** `gearLevel`, `gearLevelUp`, `gearLevelScale`, `gearStatsFor`, `gearDelta`, `cratePityCount/Bump`, `gearIcon`, `gearFrame`, `capeDraw`, `weaponArtDraw`, `armorDecorate`, `crateReveal`, `GEAR_FX` are used with the same names throughout. `P.capeSet` is introduced in Task 2 and read in Tasks 6 and 10.
4. **Review Focus:** all five lines have an owning task with a test (old save, bad ids, display settings, rapid clicks, crate reveal timers).
5. **Proportion:** the plan describes decisions and checks only; art code is left to the implementer.

## Open points to confirm before building

1. The name of the Coat colors screen function (Task 6 uses it for the wardrobe button).
2. The name of the player's per-frame update (Task 10 tick hook).
3. Whether the Lovable copy also needs the new files listed (the `lovable.md` rules say how; Task 11 covers the count).
