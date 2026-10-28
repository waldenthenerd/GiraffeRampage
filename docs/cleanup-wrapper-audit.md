# Task 6: wrapper audit (report only)

Baseline: main at 4f918b3. No game code is changed or deleted by this branch. The fresh AST scan found **143 global function names across 281 literal function/arrow assignment sites**, rather than the handoff's older count of 123. Of these, 139 names have a load-time site; six sites execute inside runtime functions. Four names occur only at runtime in this literal-assignment scan (the shadow cache's permanent assignment is a member reference, discussed below). All 281 sites appear in the inventory.

Run `npm ci --prefix tools`, then `node tools/audit-wrappers.mjs`; add `--json` for the machine-readable records. The tool uses Babel already bundled with the pinned Playwright QA dependency. It does not write files. It reads scripts in index.html order, finds Program-level function declarations and global identifier assignments, resolves references to saved prior bindings through lexical scope, and recognizes guarded captures such as `typeof fn === 'function' ? fn : null`. A yes means at least one branch calls the captured version; it does not mean every path does. A no means the new body does not call it, not that the old body is globally unreachable. Runtime substitutions and restorations must be considered before proposing deletions.

## The 14 no-call sites

| Name / assignment | What it leaves, and why it is or is not dead |
|---|---|
| trinketsHTML — 41b-trinket-page:89 | Earlier plain trinket-list renderer is bypassed by the new tile UI; candidate dead body, subject to separate reachability review. |
| spinWheelUI — 41c-wheel-page:262 | Earlier wheel animation body is bypassed by the new wheel action entry point; candidate dead body. |
| revealWheelResult — 41c-wheel-page:263 | Earlier result renderer is bypassed by the new result function; candidate dead body. |
| upgradesTabHTML — 41e-upgrades-page:108 | Earlier simple upgrade list is bypassed by the grouped Upgrades UI; candidate dead body. |
| miniLayer — 44l-minigame-polish:148 | Earlier direct backdrop copy is replaced with parallax/ambient drawing using miniBg; candidate dead body. |
| softShadow — 44n-photo-studio:228 | Temporary no-op during creature drawing; restored from ss in finally. **No dead original body implied.** |
| giraffeColours — 44p-photo-share:40 | Shared-photo color substitution; restored from gc in finally. **No dead original body.** |
| giraffePattern — 44p-photo-share:41 | Shared-photo pattern substitution; restored from gp in finally. **No dead original body.** |
| accEquipped — 44p-photo-share:42 | Shared-photo accessory substitution; restored from ae in finally. **No dead original body.** |
| showHelp — 44r-guide:200 | Older How to Play UI is bypassed by the Guide; candidate dead UI body. Review older captures before removal. |
| softShadow — 44zn-savanna-flight:60 | Temporary no-op for side-view creatures; restored from ss in finally. **No dead original body.** |
| gymApply — 44zz-campus:189 | Earlier gym stat loop is replaced to correct Haste's direction; candidate dead implementation, while GYM_SKILLS/gymBonus remain live. |
| townDrawWindows — 44zzj-window-glow:62 | Earlier rectangular glow painter is replaced by the visible-glass painter; candidate old body. Window data and recording hooks remain live. |
| townApplyRoutines — 44zzk-town-routines:111 | Earlier in-place routine mutator is replaced by a no-op because timetable-aware spawn/update wrappers own the behavior; candidate old body. |

## Partial wrappers and nonliteral assignments

1. antsTabHTML in 41d-ants-page calls _antsLockedHTML **only for the locked view**. The older unlocked branch is unreachable through that wrapper. Its call to squadSectionHTML is after the locked early return, so this does not keep the squad renderer alive on the active page. The function remains unchanged in this audit.
2. softShadow = ShadowCache.draw in 44zzs-perf-cache is not a literal function assignment and is deliberately outside the generator's pattern. ShadowCache captures the old softShadow as base and calls it for disabled, huge or unsupported shadows. The old body is required as a fallback.
3. The three farm/island shop wrappers in 44zr-interiors-farm-isle use window[fn], with names selected from a fixed corn/fish/crab list; these are member assignments and outside the literal-identifier pattern. Their saved orig is called. Table-driven drawing callbacks and object methods are outside this scope too.
4. townShowGear's campus and Book wrappers, flyNightFX's exploration wrapper, and the dev panel's saveRunAtBoundary wrapper use guarded prior-function captures. Manual inspection confirms their yes classifications; a regex that accepts only a bare identifier initializer would misclassify them.
5. The separate task-5 inventory handles duplicate function declarations. This audit does not remove or resolve them. The tool's runtime/load distinction is conservative for callbacks and non-immediately-invoked functions.

## Verification and limitations

The generated JSON has 267 yes and 14 no sites, with no unresolved saved-binding uses in this version. Every no site and the guarded-capture edge cases above were manually inspected. This is a syntactic call-chain audit, not a complete proof of reachability; owners must approve any follow-up deletions. No game files, bridge files or rules are touched. The baseline's GitHub run ends “All 17 checks passed.” Local shell Chromium is blocked by macOS Mach-port permissions, and PR publishing is blocked by GitHub integration write permissions, so this report makes no claim of new-branch CI completion.

# Complete generated inventory

143 names, 281 assignment sites. In index.html order; load/runtime phases are distinguished.

| Name | Earlier declaration(s) | Assignment site and previous-version call |
|---|---|---|
| equippedWeapon | js/game/05-gear.js:593 | js/game/05a-gear-levels.js:59 — yes (load; eq) |
| recalcStats | js/game/06-player.js:4 | js/art/33a-gear-art-capes.js:257 — yes (load; r) |
| giraffeFxUpdate | js/render/36m-giraffe-fx.js:17 | js/render/36n-neck-stretch.js:56 — yes (load; f)<br>js/ui/44d-visual-extras.js:202 — yes (load; gfx) |
| doKick | js/game/06-player.js:137 | js/render/36p-gear-fx.js:132 — yes (load; k) |
| hurtPlayer | js/game/03-combat-core.js:239 | js/render/36p-gear-fx.js:134 — yes (load; h)<br>js/sea/44zq-sea.js:448 — yes (load; hp)<br>js/campus/44zz-campus.js:139 — yes (load; hp)<br>js/dev/45b-dev-panel.js:292 — yes (load; _hurt) |
| updatePlayer | js/game/06-player.js:87 | js/render/36p-gear-fx.js:154 — yes (load; u) |
| applyGear | js/game/05-gear.js:455 | js/render/36p-gear-fx.js:156 — yes (load; ag) |
| handleAction | js/core/43-input.js:225 | js/ui/41a-gear-page.js:322 — yes (load; h)<br>js/ui/41b-trinket-page.js:116 — yes (load; h)<br>js/ui/41c-wheel-page.js:273 — yes (load; h)<br>js/ui/41d-ants-page.js:176 — yes (load; h)<br>js/ui/41e-upgrades-page.js:135 — yes (load; h) |
| showShop | js/ui/41-qol.js:443 | js/ui/41a-gear-page.js:324 — yes (load; s)<br>js/ui/41b-trinket-page.js:126 — yes (load; sh)<br>js/ui/41d-ants-page.js:170 — yes (load; sh)<br>js/ui/41e-upgrades-page.js:128 — yes (load; sh) |
| trinketsHTML | js/ui/41-qol.js:623 | js/ui/41b-trinket-page.js:89 — no (load) |
| checkWheelKey | js/game/05-gear.js:553 | js/ui/41c-wheel-page.js:61 — yes (load; base) |
| spinWheelUI | js/game/11-ants.js:362 | js/ui/41c-wheel-page.js:262 — no (load) |
| revealWheelResult | js/game/11-ants.js:395 | js/ui/41c-wheel-page.js:263 — no (load) |
| antsTabHTML | js/game/11-ants.js:268 | js/ui/41d-ants-page.js:81 — yes (load; _antsLockedHTML) |
| upgradesTabHTML | js/ui/41-qol.js:484 | js/ui/41e-upgrades-page.js:108 — no (load) |
| update | js/game/31-waves-update.js:629 | js/core/44c-perf.js:160 — yes (load; upd) |
| render | js/core/37-frame-transitions.js:17 | js/core/44c-perf.js:161 — yes (load; rnd)<br>js/minigames/44f-minigames.js:1001 — yes (load; inner)<br>js/town/44w-town-engine.js:596 — yes (load; rn)<br>js/town/44ze-town-runway.js:743 — yes (load; rn)<br>js/sea/44zq-sea.js:434 — yes (load; rn) |
| step | js/core/44-loop-boot.js:36 | js/core/44c-perf.js:162 — yes (load; inner)<br>js/town/44w-town-engine.js:587 — yes (load; st)<br>js/town/44ze-town-runway.js:742 — yes (load; st)<br>js/sea/44zq-sea.js:433 — yes (load; st) |
| buildDecor | js/render/32-render.js:85 | js/core/44ca-ground-cache.js:25 — yes (load; _buildDecorOrig) |
| buildScenery | js/scenery/36a-scenery-core.js:73 | js/core/44ca-ground-cache.js:26 — yes (load; _buildSceneryOrig) |
| drawGround | js/render/32-render.js:96 | js/core/44ca-ground-cache.js:62 — yes (load; drawGroundLive) |
| drawScenery | js/scenery/36a-scenery-core.js:105 | js/core/44ca-ground-cache.js:120 — yes (load; drawSceneryLive) |
| spawnEnemy | js/game/08-hazards-marines.js:759 | js/ui/44d-visual-extras.js:231 — yes (load; spawn) |
| drawEnemy | js/art/35h-draw-enemy.js:715 | js/ui/44d-visual-extras.js:246 — yes (load; draw) |
| killEnemy | js/game/03-combat-core.js:161 | js/ui/44d-visual-extras.js:269 — yes (load; kill) |
| startWave | js/game/31-waves-update.js:294 | js/ui/44d-visual-extras.js:304 — yes (load; sw) |
| startRun | js/ui/42-run-hud.js:19 | js/ui/44d-visual-extras.js:385 — yes (load; run)<br>js/town/44w-town-engine.js:613 — yes (load; sr)<br>js/town/44z-town-bread-car.js:74 — yes (load; sr)<br>js/town/44zo-town-farm.js:83 — yes (load; sr)<br>js/sea/44zq-sea.js:504 — yes (load; sr)<br>js/campus/44zz-campus.js:153 — yes (load; sr) |
| gameOver | js/ui/42-run-hud.js:79 | js/ui/44d-visual-extras.js:386 — yes (load; over)<br>js/dev/45b-dev-panel.js:309 — yes (load; _over) |
| showDeath | js/ui/41-qol.js:772 | js/ui/44d-visual-extras.js:387 — yes (load; death) |
| miniLayer | js/minigames/44f-minigames.js:514 | js/minigames/44l-minigame-polish.js:148 — no (load) |
| drawSideGiraffe | js/minigames/44f-minigames.js:389 | js/minigames/44l-minigame-polish.js:247 — yes (load; _polSide) |
| drawTopGiraffe | js/minigames/44f-minigames.js:425 | js/minigames/44l-minigame-polish.js:280 — yes (load; _polTop) |
| miniIntro | js/minigames/44f-minigames.js:653 | js/minigames/44l-minigame-polish.js:351 — yes (load; _polIntro) |
| drawHatSide | js/minigames/44f-minigames.js:71 | js/town/44y-town-gear.js:92 — yes (load; hs) |
| drawHatTop | js/minigames/44f-minigames.js:170 | js/town/44y-town-gear.js:93 — yes (load; ht) |
| drawBootSide | js/minigames/44f-minigames.js:276 | js/town/44y-town-gear.js:94 — yes (load; bs)<br>js/ui/44m-accessory-extras.js:44 — yes (load; bs) |
| drawBootTop | js/minigames/44f-minigames.js:336 | js/town/44y-town-gear.js:95 — yes (load; bt)<br>js/ui/44m-accessory-extras.js:49 — yes (load; bt) |
| drawHatOnHeadSide | js/minigames/44f-minigames.js:267 | js/ui/44m-accessory-extras.js:34 — yes (load; hs) |
| drawHatOnHeadTop | js/minigames/44f-minigames.js:261 | js/ui/44m-accessory-extras.js:39 — yes (load; ht) |
| drawAccIcon | js/minigames/44f-minigames.js:379 | js/ui/44m-accessory-extras.js:56 — yes (load; ai) |
| softShadow | js/render/36i-lighting.js:239 | js/photo/44n-photo-studio.js:228 — no (runtime)<br>js/town/44zn-savanna-flight.js:60 — no (runtime) |
| handleExtraAction | js/ui/44m-accessory-extras.js:80 | js/photo/44n-photo-studio.js:472 — yes (load; prev)<br>js/photo/44p-photo-share.js:277 — yes (load; prev)<br>js/photo/44q-photo-book.js:129 — yes (load; prev) |
| photoBackdrop | js/photo/44n-photo-studio.js:26 | js/photo/44o-photo-scenes.js:297 — yes (load; base)<br>js/photo/44zzp-photo-looks.js:89 — yes (load; bd) |
| photoRender | js/photo/44n-photo-studio.js:246 | js/photo/44p-photo-share.js:35 — yes (load; render)<br>js/photo/44zzp-photo-looks.js:171 — yes (load; render) |
| giraffeColours | js/ui/44e-wardrobe.js:52 | js/photo/44p-photo-share.js:40 — no (runtime) |
| giraffePattern | js/ui/44e-wardrobe.js:58 | js/photo/44p-photo-share.js:41 — no (runtime) |
| accEquipped | js/minigames/44f-minigames.js:58 | js/photo/44p-photo-share.js:42 — no (runtime)<br>js/town/44z-town-bread-car.js:141 — yes (runtime; ae) |
| showPhoto | js/photo/44n-photo-studio.js:342 | js/photo/44p-photo-share.js:260 — yes (load; show)<br>js/photo/44zzp-photo-looks.js:210 — yes (load; sp) |
| showHelp | js/ui/41-qol.js:353 | js/ui/44r-guide.js:200 — no (load) |
| showMenu | js/ui/41-qol.js:312 | js/town/44w-town-engine.js:607 — yes (load; sm) |
| drawPlayer | js/art/33-giraffe-art.js:272 | js/town/44z-town-bread-car.js:137 — yes (load; dp) |
| townNeed | js/town/44u-town-data.js:312 | js/town/44zb-town-interiors.js:147 — yes (load; tn)<br>js/campus/44zze-campus-town.js:124 — yes (load; tn) |
| townPaintFar | js/town/44v-town-art.js:132 | js/town/44zb-town-interiors.js:162 — yes (load; pfar)<br>js/town/44ze-town-runway.js:145 — yes (load; pfar)<br>js/town/44zo-town-farm.js:273 — yes (load; pfar)<br>js/sea/44zq-sea.js:552 — yes (load; pfar)<br>js/town/44zw-town-detail.js:766 — yes (load; _tFar)<br>js/town/44zx-farm-isle-detail.js:317 — yes (load; _tFar)<br>js/campus/44zzg-campus-art.js:375 — yes (load; pfar) |
| townPaintMid | js/town/44v-town-art.js:176 | js/town/44zb-town-interiors.js:163 — yes (load; pmid)<br>js/town/44ze-town-runway.js:151 — yes (load; pmid)<br>js/town/44zo-town-farm.js:282 — yes (load; pmid)<br>js/sea/44zq-sea.js:558 — yes (load; pmid)<br>js/town/44zw-town-detail.js:790 — yes (load; _tMid)<br>js/town/44zx-farm-isle-detail.js:340 — yes (load; _tMid)<br>js/campus/44zzg-campus-art.js:394 — yes (load; pmid) |
| townPaintField | js/town/44v-town-art.js:208 | js/town/44zb-town-interiors.js:164 — yes (load; pf)<br>js/town/44ze-town-runway.js:160 — yes (load; pf)<br>js/town/44zw-town-detail.js:720 — yes (load; _tField)<br>js/town/44zx-farm-isle-detail.js:305 — yes (load; _tField)<br>js/town/44zzj-window-glow.js:47 — yes (load; tpf) |
| townProp | js/town/44v-town-art.js:233 | js/town/44zb-town-interiors.js:165 — yes (load; pp)<br>js/town/44zw-town-detail.js:492 — yes (load; _tProp)<br>js/town/44zx-farm-isle-detail.js:274 — yes (load; _tProp) |
| townBuilding | js/town/44v-town-art.js:342 | js/town/44zb-town-interiors.js:166 — yes (load; pb)<br>js/town/44zw-town-detail.js:365 — yes (load; _tBuilding)<br>js/town/44zx-farm-isle-detail.js:311 — yes (load; _tBuilding) |
| townSpawnNpcs | js/town/44w-town-engine.js:47 | js/town/44zc-town-life.js:273 — yes (load; sn)<br>js/town/44zi-town-atmosphere.js:121 — yes (load; sn)<br>js/town/44zzk-town-routines.js:59 — yes (load; ts) |
| townNearest | js/town/44w-town-engine.js:191 | js/town/44zc-town-life.js:274 — yes (load; nr)<br>js/town/44ze-town-runway.js:300 — yes (load; nr)<br>js/town/44zf-town-economy.js:300 — yes (load; nr)<br>js/town/44zg-town-activities.js:242 — yes (load; nr)<br>js/town/44zj-town-home.js:162 — yes (load; nr)<br>js/town/44zo-town-farm.js:409 — yes (load; nr)<br>js/sea/44zq-sea.js:653 — yes (load; nr)<br>js/town/44zr-interiors-farm-isle.js:309 — yes (load; nr)<br>js/town/44zu-training-gym.js:439 — yes (load; nr)<br>js/campus/44zze-campus-town.js:172 — yes (load; nr) |
| townUse | js/town/44w-town-engine.js:284 | js/town/44zc-town-life.js:281 — yes (load; tu)<br>js/town/44ze-town-runway.js:291 — yes (load; tu)<br>js/town/44zf-town-economy.js:292 — yes (load; tu)<br>js/town/44zg-town-activities.js:229 — yes (load; tu)<br>js/town/44zj-town-home.js:234 — yes (load; tu)<br>js/town/44zo-town-farm.js:397 — yes (load; tu)<br>js/sea/44zq-sea.js:637 — yes (load; tu)<br>js/town/44zr-interiors-farm-isle.js:296 — yes (load; tu)<br>js/town/44zu-training-gym.js:430 — yes (load; tu)<br>js/campus/44zze-campus-town.js:162 — yes (load; tu) |
| updateTown | js/town/44w-town-engine.js:203 | js/town/44zc-town-life.js:282 — yes (load; un)<br>js/town/44zh-town-qol.js:78 — yes (load; uT)<br>js/town/44zi-town-atmosphere.js:123 — yes (load; uT)<br>js/town/44zj-town-home.js:203 — yes (load; uT)<br>js/town/44zu-training-gym.js:263 — yes (load; uT)<br>js/town/44zzk-town-routines.js:84 — yes (load; ut) |
| renderTown | js/town/44w-town-engine.js:456 | js/town/44zc-town-life.js:294 — yes (load; rt) |
| townDynamic | js/town/44w-town-engine.js:395 | js/town/44zc-town-life.js:298 — yes (load; dy)<br>js/town/44zu-training-gym.js:311 — yes (load; dyn) |
| handleTownAction | js/town/44x-town-ui.js:382 | js/town/44zd-town-panels.js:213 — yes (load; h)<br>js/town/44ze-town-runway.js:284 — yes (load; h)<br>js/town/44zf-town-economy.js:317 — yes (load; h)<br>js/town/44zg-town-activities.js:250 — yes (load; h)<br>js/town/44zh-town-qol.js:114 — yes (load; h)<br>js/town/44zo-town-farm.js:421 — yes (load; h)<br>js/sea/44zq-sea.js:661 — yes (load; hta)<br>js/town/44zr-interiors-farm-isle.js:41 — yes (load; h)<br>js/town/44zu-training-gym.js:448 — yes (load; hta)<br>js/campus/44zze-campus-town.js:180 — yes (load; hta)<br>js/campus/44zze-campus-town.js:365 — yes (load; h)<br>js/town/44zzl-town-book.js:74 — yes (load; hta) |
| townDrawSky | js/town/44w-town-engine.js:347 | js/town/44ze-town-runway.js:161 — yes (load; sky)<br>js/town/44zi-town-atmosphere.js:170 — yes (load; sky) |
| townPropX | js/town/44zb-town-interiors.js:239 | js/town/44ze-town-runway.js:171 — yes (load; px)<br>js/town/44zk-town-interiors2.js:301 — yes (load; px)<br>js/town/44zo-town-farm.js:298 — yes (load; px)<br>js/sea/44zq-sea.js:563 — yes (load; px)<br>js/town/44zr-interiors-farm-isle.js:237 — yes (load; px)<br>js/campus/44zzg-campus-art.js:365 — yes (load; prevP) |
| townBuildingX | js/town/44zb-town-interiors.js:346 | js/town/44ze-town-runway.js:197 — yes (load; bx)<br>js/town/44zf-town-economy.js:279 — yes (load; bx)<br>js/town/44zg-town-activities.js:217 — yes (load; bx)<br>js/town/44zj-town-home.js:110 — yes (load; bp)<br>js/town/44zk-town-interiors2.js:294 — yes (load; bx)<br>js/town/44zo-town-farm.js:335 — yes (load; bx)<br>js/sea/44zq-sea.js:587 — yes (load; bx)<br>js/town/44zr-interiors-farm-isle.js:232 — yes (load; bx)<br>js/town/44zv-gym-art.js:150 — yes (load; bx)<br>js/campus/44zzg-campus-art.js:262 — yes (load; prevB)<br>js/campus/44zzh-campus-rooms.js:289 — yes (load; bx) |
| townRoomProps | js/town/44zb-town-interiors.js:199 | js/town/44ze-town-runway.js:222 — yes (load; rp)<br>js/town/44zf-town-economy.js:248 — yes (load; rp)<br>js/town/44zj-town-home.js:153 — yes (load; rp2)<br>js/town/44zk-town-interiors2.js:436 — yes (load; rp)<br>js/town/44zzn-room-detail.js:86 — yes (load; rp) |
| townDynX | js/town/44zc-town-life.js:162 | js/town/44ze-town-runway.js:237 — yes (load; dyx)<br>js/town/44zg-town-activities.js:269 — yes (load; dyx)<br>js/town/44zj-town-home.js:112 — yes (load; dx)<br>js/town/44zo-town-farm.js:382 — yes (load; dyx) |
| flyTakeoff | js/town/44ze-town-runway.js:320 | js/town/44zf-town-economy.js:49 — yes (load; ft)<br>js/town/44zn-savanna-flight.js:221 — yes (load; ft)<br>js/town/44zo-town-farm.js:145 — yes (load; ft) |
| flyPlane | js/town/44ze-town-runway.js:50 | js/town/44zf-town-economy.js:51 — yes (load; fp)<br>js/town/44zo-town-farm.js:190 — yes (load; fp) |
| townCarSide | js/town/44z-town-bread-car.js:92 | js/town/44zf-town-economy.js:112 — yes (load; cs) |
| townShowBakery | js/town/44zd-town-panels.js:176 | js/town/44zf-town-economy.js:157 — yes (load; sb) |
| endMini | js/minigames/44f-minigames.js:705 | js/town/44zg-town-activities.js:81 — yes (load; em) |
| townShowScores | js/town/44x-town-ui.js:355<br>js/town/44zd-town-panels.js:72 | js/town/44zg-town-activities.js:99 — yes (load; ss) |
| townClosePanel | js/town/44x-town-ui.js:239 | js/town/44zg-town-activities.js:228 — yes (load; cp)<br>js/campus/44zzf-campus-study.js:395 — yes (load; tc) |
| townEnter | js/town/44w-town-engine.js:57 | js/town/44zh-town-qol.js:77 — yes (load; tE)<br>js/town/44zj-town-home.js:202 — yes (load; tE)<br>js/town/44zu-training-gym.js:262 — yes (load; tE)<br>js/audio/44zzo-town-sound.js:62 — yes (load; te) |
| townShowJournal | js/town/44x-town-ui.js:250<br>js/town/44zd-town-panels.js:86 | js/town/44zh-town-qol.js:103 — yes (load; tj)<br>js/campus/44zze-campus-town.js:363 — yes (load; tj)<br>js/town/44zzl-town-book.js:71 — yes (load; tj) |
| townDrawPlayer | js/town/44z-town-bread-car.js:155 | js/town/44zj-town-home.js:218 — yes (load; dp)<br>js/town/44zu-training-gym.js:271 — yes (load; dp) |
| townSay | js/town/44x-town-ui.js:44 | js/core/44zm-close-x.js:61 — yes (load; ts)<br>js/audio/44zzq-npc-voices.js:106 — yes (load; base) |
| flyLand | js/town/44ze-town-runway.js:335 | js/town/44zn-savanna-flight.js:166 — yes (load; fl0)<br>js/town/44zo-town-farm.js:178 — yes (load; fl) |
| flyCrash | js/town/44ze-town-runway.js:343 | js/town/44zn-savanna-flight.js:167 — yes (load; fc0)<br>js/town/44zo-town-farm.js:173 — yes (load; fc) |
| updateFly | js/town/44ze-town-runway.js:351 | js/town/44zn-savanna-flight.js:168 — yes (load; up0)<br>js/town/44zo-town-farm.js:153 — yes (load; up)<br>js/town/44zs-explore-rewards.js:121 — yes (load; up) |
| flyFeatures | js/town/44ze-town-runway.js:536 | js/town/44zn-savanna-flight.js:169 — yes (load; ff)<br>js/town/44zo-town-farm.js:110 — yes (load; ff) |
| flyGroundDetail | js/town/44ze-town-runway.js:490 | js/town/44zn-savanna-flight.js:200 — yes (load; fgd)<br>js/town/44zo-town-farm.js:100 — yes (load; fgd) |
| renderFly | js/town/44ze-town-runway.js:707 | js/town/44zn-savanna-flight.js:231 — yes (load; rf)<br>js/town/44zo-town-farm.js:200 — yes (load; rf) |
| townCarRunMul | js/town/44z-town-bread-car.js:90<br>js/town/44zf-town-economy.js:104 | js/town/44zo-town-farm.js:42 — yes (load; crm) |
| flyRegions | js/town/44ze-town-runway.js:39<br>js/town/44zn-savanna-flight.js:15 | js/town/44zo-town-farm.js:91 — yes (load; fr) |
| flyOnRunway | js/town/44ze-town-runway.js:319 | js/town/44zo-town-farm.js:98 — yes (load; ro) |
| townRide | js/town/44zc-town-life.js:112 | js/town/44zp-tram-ride.js:11 — yes (load; tr) |
| flyNightFX | js/town/44zi-town-atmosphere.js:187 | js/town/44zs-explore-rewards.js:106 — yes (load; fx) |
| seaDrawFeatures | js/sea/44zq-sea.js:253 | js/town/44zs-explore-rewards.js:138 — yes (load; dfe)<br>js/sea/44zt-sea-deep.js:181 — yes (load; df)<br>js/sea/44zy-sea-detail.js:70 — yes (load; _features) |
| updateSea | js/sea/44zq-sea.js:369 | js/town/44zs-explore-rewards.js:152 — yes (load; up)<br>js/sea/44zt-sea-deep.js:72 — yes (load; us) |
| seaDrawMap | js/sea/44zq-sea.js:297 | js/town/44zs-explore-rewards.js:160 — yes (load; dmap) |
| seaStart | js/sea/44zq-sea.js:351 | js/sea/44zt-sea-deep.js:22 — yes (load; seaStart0) |
| seaMapColour | js/sea/44zq-sea.js:120 | js/sea/44zt-sea-deep.js:25 — yes (load; mc) |
| seaDrawBoat | js/sea/44zq-sea.js:223 | js/sea/44zt-sea-deep.js:179 — yes (load; sb)<br>js/sea/44zy-sea-detail.js:125 — yes (load; _boat) |
| renderSea | js/sea/44zq-sea.js:308 | js/sea/44zt-sea-deep.js:192 — yes (load; rs) |
| applyCityStats | js/chapters/29-city.js:83 | js/town/44zu-training-gym.js:77 — yes (load; a)<br>js/campus/44zz-campus.js:133 — yes (load; a) |
| townDrawHud | js/town/44w-town-engine.js:527 | js/town/44zu-training-gym.js:334 — yes (load; hud) |
| tRect | js/town/44v-town-art.js:9 | js/town/44zw-town-detail.js:114 — yes (load; _tRect) |
| tPoly | js/town/44v-town-art.js:13 | js/town/44zw-town-detail.js:143 — yes (load; _tPoly) |
| tWin | js/town/44v-town-art.js:15 | js/town/44zw-town-detail.js:153 — yes (load; _tWin) |
| tDoor | js/town/44v-town-art.js:21 | js/town/44zw-town-detail.js:187 — yes (load; _tDoor) |
| tAwning | js/town/44v-town-art.js:36 | js/town/44zw-town-detail.js:205 — yes (load; _tAwning) |
| tSign | js/town/44v-town-art.js:27 | js/town/44zw-town-detail.js:219 — yes (load; _tSign) |
| seaDrawTerrain | js/sea/44zq-sea.js:174 | js/sea/44zy-sea-detail.js:18 — yes (load; _terrain) |
| haste | js/game/03-combat-core.js:345 | js/campus/44zz-campus.js:147 — yes (load; hs) |
| damageEnemy | js/game/03-combat-core.js:97 | js/campus/44zz-campus.js:148 — yes (load; de) |
| rollOffer | js/ui/38-overlays-cards.js:76 | js/campus/44zz-campus.js:160 — yes (load; ro) |
| chooseCard | js/ui/41-qol.js:699 | js/campus/44zz-campus.js:171 — yes (load; cc) |
| maxCards | js/chapters/20-chapters-9-10.js:107 | js/campus/44zz-campus.js:183 — yes (load; mc) |
| gymApply | js/town/44zu-training-gym.js:71 | js/campus/44zz-campus.js:189 — no (load) |
| updateHUD | js/ui/42-run-hud.js:197 | js/campus/44zz-campus.js:206 — yes (load; uh) |
| townNeedText | js/town/44u-town-data.js:342 | js/campus/44zze-campus-town.js:143 — yes (load; tt) |
| townShowGear | js/town/44zh-town-qol.js:37 | js/campus/44zze-campus-town.js:364 — yes (load; tg)<br>js/town/44zzl-town-book.js:72 — yes (load; tg) |
| ivWindows | js/town/44zk-town-interiors2.js:318 | js/campus/44zzh-campus-rooms.js:127 — yes (load; iw) |
| townDrawWindows | js/town/44w-town-engine.js:431 | js/town/44zzj-window-glow.js:62 — no (load) |
| townNpcStep | js/town/44w-town-engine.js:168 | js/town/44zzk-town-routines.js:73 — yes (load; un) |
| townApplyRoutines | js/town/44zi-town-atmosphere.js:108 | js/town/44zzk-town-routines.js:111 — no (load) |
| townShowMenu | js/town/44x-town-ui.js:243<br>js/town/44zd-town-panels.js:169 | js/town/44zzl-town-book.js:73 — yes (load; tm) |
| townShowMap | js/town/44x-town-ui.js:313<br>js/town/44zd-town-panels.js:142 | js/town/44zzl-town-book.js:81 — yes (load; sm) |
| homePaintBase | js/town/44zj-town-home.js:28 | js/town/44zzm-home-trophies.js:59 — yes (load; pb) |
| townStepSound | js/town/44zi-town-atmosphere.js:33 | js/audio/44zzo-town-sound.js:41 — yes (load; ts) |
| townChirp | js/town/44zi-town-atmosphere.js:40 | js/audio/44zzo-town-sound.js:97 — yes (load; tc) |
| photoFoeDraw | js/photo/44n-photo-studio.js:224 | js/photo/44zzp-photo-looks.js:93 — yes (load; fd) |
| photoAction | js/photo/44n-photo-studio.js:426 | js/photo/44zzp-photo-looks.js:202 — yes (load; act) |
| townCloseDialog | js/town/44x-town-ui.js:73 | js/audio/44zzq-npc-voices.js:112 — yes (load; close) |
| townDlgFinish | js/town/44x-town-ui.js:28 | js/audio/44zzq-npc-voices.js:113 — yes (load; fin) |
| venusHas | js/chapters/19-venus-outpost.js:39 | js/game/44zzr-engineer-ants.js:32 — yes (load; has) |
| antCost | js/game/11-ants.js:30 | js/game/44zzr-engineer-ants.js:38 — yes (load; ac) |
| upgLocked | js/ui/41e-upgrades-page.js:26 | js/game/44zzr-engineer-ants.js:47 — yes (load; ul) |
| buyUpgrade | js/core/43-input.js:360 | js/game/44zzr-engineer-ants.js:49 — yes (load; bu) |
| buyUpgradeMax | js/ui/41-qol.js:121 | js/game/44zzr-engineer-ants.js:50 — yes (load; bm) |
| updateAnts | js/game/11-ants.js:123 | js/game/44zzr-engineer-ants.js:179 — yes (load; base) |
| antAggroTarget | js/game/11-ants.js:83 | js/game/44zzr-engineer-ants.js:191 — yes (load; aggro) |
| drawAnts | js/game/11-ants.js:262 | js/game/44zzr-engineer-ants.js:232 — yes (load; da) |
| drawAntShadows | js/render/36-atmosphere.js:287 | js/game/44zzr-engineer-ants.js:240 — yes (load; ds) |
| giraffeRim | js/render/36m-giraffe-fx.js:84 | js/core/44zzs-perf-cache.js:50 — yes (load; rim) |
| gainXP | js/game/03-combat-core.js:226 | js/dev/45b-dev-panel.js:291 — yes (load; _gainXP) |
| saveRunNow | js/ui/41-qol.js:268 | js/dev/45b-dev-panel.js:293 — yes (load; _save) |
| saveRunAtBoundary | js/core/44b-feedback.js:133 | js/dev/45b-dev-panel.js:294 — yes (load; _bound) |
| updateWaves | js/game/31-waves-update.js:327 | js/dev/45b-dev-panel.js:295 — yes (load; _waves) |
