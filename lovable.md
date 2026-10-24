# Giraffe Rampage: everything Lovable needs to know

**Read this whole file before you change anything in the game or around it.** It replaces the older notes
(`LOVABLE-DO-NOT-INCLUDE-DEV-PANEL.md` is now only a pointer to this file). When this file and anything you remember disagree,
this file wins.

The game is developed locally by its owner, in a folder of separate files. You (Lovable) host a copy of it. Your job is to
keep the hosted copy in step with the files you are given, keep the website around it working, and **not to redesign, refactor
or "improve" the game's own code**. If something in the game looks odd, leave it and say so; do not fix it silently.

---

## 1. The ten rules

1. **Never include the developer panel.** Leave out `js/45b-dev-panel.js`, its `<script>` line, and (in a single-file build)
   everything that came from it. Details in section 6.
2. **Keep the `GR` export.** `js/45-test-exports.js` defines `window.GR`. The `/play` page reads `window.GR.G.state` from the
   game's iframe. It must stay, exactly as given.
3. **Keep the save bridge working** (section 4), and **keep saves backward compatible**. Never change the localStorage key
   `giraffe_rampage_save_v1`. A player's old save must still load.
4. **Scripts are classic scripts in one shared global scope, and their order matters** (section 3). Do not turn them into ES
   modules, do not wrap them in functions, do not reorder them, and do not rename globals.
5. **The game files you are given are the source of truth.** Copy them in as they are. Do not reformat, minify, or "tidy" them.
6. **Do not add features, settings, buttons or text to the game** unless the owner asked for exactly that in the same message.
   In particular there is deliberately **no screen-shake-reduction setting**. Do not add one.
7. **Never reveal locked content.** The in-game Guide only lists what a save has unlocked. Do not write marketing text, tooltips
   or pages that spoil later chapters.
8. **Everything is generated in the browser.** No audio files, no images, no fonts, no network calls from the game. Do not add
   any. The photo album, the share codes and the save are all text.
9. **Photo codes and the save format are append-only** (sections 4 and 5). Never reorder or remove anything they index into.
10. **When unsure, ask the owner.** Do not guess about saves or the bridge: a wrong guess loses people's progress.

---

## 2. What is hosted and how

- The Lovable project is "Giraffe Rampage Cloud". The game is a **folder of separate files**, `public/game/rampage/`
  (`index.html`, `css/`, `js/`), shown in an iframe on the `/play` route (`src="/game/rampage/index.html"`).
- A small **bridge script** sits right after `<head>` in the hosted `index.html`. It posts the player's save (the value of
  localStorage key `giraffe_rampage_save_v1`) up to the page, which stores it in the Supabase table `game_saves`; the page
  seeds localStorage from the cloud copy before the iframe loads. The bridge is **not** in the owner's `index.html`: you add
  it when you install an update (below).
- The website has its own, separate, secure admin panel. The game's developer panel is not it and must not be in the site.
- The owner updates the project by giving you a ZIP built from the game folder with `tools/make-lovable-package.sh`. The ZIP
  already leaves out the developer panel and its `<script>` line. This file, and your own skill
  `.agents/skills/update-giraffe-game/SKILL.md`, tell you how to apply it.

### How to apply an update

1. Unzip it somewhere temporary. Never copy a `.git` folder, `tools/`, `docs/` or `README.md` into `public/`. (`README.md` is
   for you to read: it describes every file. It also documents the developer panel for people who clone the repository, so the
   panel's words appear in it; that is expected, because it is not part of the shipped game.)
2. Replace `public/game/rampage/css/` and `public/game/rampage/js/` with the ZIP's (delete the old folders first, so removed
   files go away). There are six stylesheets, in this order: `style.css`, `polish.css`, `campus.css`, `townlife.css`,
   `gearpage.css`, `phone.css`; `index.html` links them.
3. Rebuild `public/game/rampage/index.html` as: the ZIP's `index.html` lines 1 to 3 (up to `<head>`), then the bridge script
   (kept from the current hosted file, **updated as described in section 4** if the save format changed), then the rest of the
   ZIP's `index.html` from line 4. Keep every `<script src>` as a separate, ordered tag (section 3); never concatenate them.
   Keep the HTML body exactly (the canvas, `#hud`, `#touch`, `#pausebtn`, `#overlay`).
4. Keep `js/45-test-exports.js` (`window.GR`) and `js/01b-savepack.js` (`window.GRSave`) exactly as given.
5. Run the checks in section 9.

---

## 3. The files, in load order

The scripts are loaded by `index.html` in this order. Every file may use things defined by an earlier file at load time, and
may call anything from any file once the game runs. New files go in the right place **before** `js/46-main.js`, which starts the
game. This is the complete list for this version (167 scripts; the developer panel is the one you must skip).

| # | File | What it does |
|---|---|---|
| 1 | `js/00-icons.js` | The icon table (41 outlined icons drawn for this game) and the icon helpers. Runs outside strict mode, as it always did. |
| 2 | `js/00b-icons-custom.js` | Every icon in the game other than the 41 in `00-icons.js` is drawn here (24x24 outlines in the same style, written `'@t-x-name'`). The old filled icon table is gone; `ICON_MIGRATE` maps the old names to the new pictures so an old name still resolves. To add an icon, put its path here and use it as `icon`. |
| 3 | `js/01-core.js` | Utilities, audio synthesis (with the limiter, voice cap and stereo placement), spatial grid, save/meta data, global game state. |
| 4 | `js/01b-savepack.js` | Save compression: LZW packing of the save, `window.GRSave`. Section 4 of this file describes the format. |
| 5 | `js/02-music.js` | Procedural background music: themes, the 16-bar sequencer (A, A, B, A), key climb through a chapter, boss second phase, theme fade-in, stingers. |
| 6 | `js/02b-ambience.js` | Extra sounds (card pick, wave clear, heartbeat, heavy thump), the per-chapter ambient bed that follows the weather, gamepad rumble. |
| 7 | `js/02c-audio-mix.js` | Sound design on top of the synth: a reverb that follows the place (`MIX_ENV`), a hit sound per element, a death sound per kind of creature, an attack sound per kind of enemy (`Mix.variant`), boss roar, death and half-health growl, footsteps by ground, the music stingers, and the ambience extras (thunder with a delay, sweeping wind gusts, far-off calls). |
| 8 | `js/02d-ground-sounds.js` | **What the ground sounds like.** Replaces `SFX.foot`: mud, snow, ice, metal (the Moon, Mars, the space centre), shallow water, dust, sand, leaf, asphalt, cinders and rock, changed by rain, blizzards, sandstorms and acid (`groundNow`), plus `SFX.groundImpact` and a ground answer when the head lands in a lunge. |
| 9 | `js/03-combat-core.js` | Particles, zones, shockwaves, projectiles, pickups, damage and death, player damage, draw helpers, targeting. |
| 10 | `js/04-cards.js` | The card registry: every card and its forms. |
| 11 | `js/05-gear.js` | Weapons, gear sets, ownership and equipping, trinkets, prize wheel, crates. |
| 12 | `js/05a-gear-levels.js` | **Gear levels and the crate rules.** A piece goes from level 1 to 5 (`gearLevel`, `gearLevelUp`; each level adds 10% to what the piece gives, a weapon also 6% damage), `gearStatsFor()` and `gearDelta()` say what a loadout or a swap would change without touching the save, crate pity (`CRATE_PITY`: rare or better within 10 Supply Crate opens, epic or better within 8 Prime Crate opens; a mythical roll never turns into something lesser; the Spotted Crate costs food too and has no pity) and `openCrate()` replaced so a duplicate levels the piece up. Save keys `gearLv` and `cratePity` sit beside `gear`. |
| 13 | `js/06-player.js` | Derived player stats and the player. |
| 14 | `js/07-enemies.js` | Enemy types for chapters 1-7 and habitat looks. |
| 15 | `js/08-hazards-marines.js` | Hostile hazards and the Space Marine AI (chapter 8). |
| 16 | `js/09-enemy-ai.js` | Enemy update and movement. |
| 17 | `js/10-settings.js` | Settings object (volumes, speed, layout, keys). |
| 18 | `js/11-ants.js` | The ant colony. |
| 19 | `js/12-bestiary.js` | Bestiary. |
| 20 | `js/13-forage.js` | Foraging minigame. |
| 21 | `js/14-menu.js` | Main menu chapter selector and the speed slider. |
| 22 | `js/15-buildings-space.js` | Buildings (chapter 6) and the Space Center (chapter 7). |
| 23 | `js/16-film-moon.js` | The ending cutscene (the launch and the Moon landing). |
| 24 | `js/17-film-venus.js` | The Venus film (end of chapter 8). |
| 25 | `js/18-chapter-moon.js` | The Moon (chapter 8). |
| 26 | `js/19-venus-outpost.js` | The Venus outpost (shop, scouting, ship). |
| 27 | `js/20-chapters-9-10.js` | Chapters 9 and 10, and the Deflector pulse. |
| 28 | `js/21-film-homecoming.js` | The homecoming film. |
| 29 | `js/22-film-area51.js` | The Area 51 film. |
| 30 | `js/23-film-short.js` | The short travel films between chapters. |
| 31 | `js/24-mars-outpost.js` | The Mars outpost. |
| 32 | `js/25-lab.js` | The Giraffe Lab (Mutation Vial). |
| 33 | `js/26-dust-squad.js` | The dust squad (alliance after chapter 13). |
| 34 | `js/27-film-mars.js` | The Mars films. |
| 35 | `js/28-spaceplane.js` | The spaceplane. |
| 36 | `js/29-city.js` | The Underground Giraffe City. |
| 37 | `js/30-chapters-11-13.js` | Chapters 11, 12 and 13. |
| 38 | `js/31-waves-update.js` | Banners, the wave director, entity updates, the main update. |
| 39 | `js/32-render.js` | Ground textures and the render pass. |
| 40 | `js/33-giraffe-art.js` | Drawing the giraffe and armour designs. |
| 41 | `js/33a-gear-art-capes.js` | **Twenty-two capes.** One design per gear set (`CAPE_DESIGNS`) on a shared cloth frame (`capeFrame`) so the wind and flutter are the same; `capeDraw()` is called by `drawPlayer`; level 3 adds a trim, level 5 a glint. Also keeps `P.capeSet`, `P.capeLevel`, `P.weaponLevel`, `P.armorLevel` up to date. |
| 42 | `js/33b-gear-art-weapons.js` | **Twenty-one weapons you can see.** `WEAPON_ART` draws each weapon on her: hoof pieces, head pieces (fangs, lances, a maul, a trident, an anglerfish lure) and body pieces (twin tails, a spinning maw ring), timed to the neck lunge. Level 4 and up glows. |
| 43 | `js/33c-gear-art-armor.js` | **The armor pass.** Four armors redrawn (`ARMOR_REDRAW`: Herdhide, Tideshell, Riptide, Twinsoul); every armor gains a rarity glint and level pips (`armorDecorate`, `armorDraw`). |
| 44 | `js/33e-gear-art-more.js` | **The art for six more sets.** Cinderhide and Rooftop Runner (common), Moondust and Rustwalker (rare), Site Zero (epic) and the mythical Worldspire: each a cape, a weapon and an armor, added to `CAPE_DESIGNS`, `WEAPON_ART` and `ARMOR_REDRAW`/`ARMOR_DESIGNS`. Worldspire is the showpiece: a cape of turning dawn colours, a spire of light with a halo, and a plate ringed by a constellation. |
| 45 | `js/33d-gear-icons.js` | **A drawn icon for every piece.** `gearIcon(id, size, {locked, level})` returns a cached PNG data URL (dark silhouette when not found yet); `gearFrame(rarity)` gives the four rarity looks. |
| 46 | `js/34a-art-helpers.js` | Shared drawing helpers for enemies: per-chapter mutation kits (frost, swamp, ocean) and the lk* shape helpers. |
| 47 | `js/34b-art-arctic.js` | Enemy art, Chapter 2: the Arctic (ARCTIC_DRAW). |
| 48 | `js/34c-art-swamp.js` | Enemy art, Chapter 3: the swamp (SWAMP_DRAW). |
| 49 | `js/34d-art-ocean.js` | Enemy art, Chapter 4: the open ocean (OCEAN_DRAW). |
| 50 | `js/34e-art-jungle.js` | Enemy art, Chapter 5: the Amazon canopy (JUNGLE_DRAW). |
| 51 | `js/35a-art-city.js` | Enemy art, Chapter 6: Houston (CITY_DRAW). |
| 52 | `js/35b-art-space.js` | Enemy art, Chapter 7: Johnson Space Center (SPACE_DRAW). |
| 53 | `js/35c-art-marines.js` | Enemy art, Chapter 8: Space Marines (MARINE_DRAW). Chapters 12 and 13 reuse this code. |
| 54 | `js/35d-art-aliens.js` | Enemy art, Chapter 9: the fire aliens of Venus (ALIEN_DRAW). |
| 55 | `js/35e-art-inferno.js` | Enemy art, Chapter 10: the Inferno (INFERNO_DRAW). |
| 56 | `js/35f-art-a51.js` | Enemy art, Chapter 12: Area 51 camouflage and night-vision gear on top of the Marine drawing code (A51_ALIAS, a51Gear). |
| 57 | `js/35g-art-dust.js` | Enemy art, Chapter 13: the dust aliens (DUST_DRAW). |
| 58 | `js/35h-draw-enemy.js` | Assembles ENEMY_LOOK_DRAW from every chapter table and draws an enemy (the Chapter 1 / Savannah creatures live in the switch inside drawEnemy). |
| 59 | `js/36a-scenery-core.js` | Scenery system: large ground patches, themed props and landmarks, ground decals, ambient life and light gameplay terrain, per chapter. |
| 60 | `js/36c-scenery-savanna.js` | Scenery definitions: savanna (see js/36a-scenery-core.js for the format). Chapter 1 the dry savanna, chapter 11 the Changed Savannah. |
| 61 | `js/36d-scenery-arctic-swamp.js` | Scenery definitions: arctic-swamp (see js/36a-scenery-core.js for the format). Chapter 2 = Arctic (ar_), chapter 3 = Swamp (sw_). |
| 62 | `js/36e-scenery-ocean-jungle.js` | Scenery definitions: ocean-jungle (see js/36a-scenery-core.js for the format). Chapter 4 = open ocean, chapter 5 = Amazon canopy. |
| 63 | `js/36f-scenery-city-space.js` | Scenery definitions: city-space (see js/36a-scenery-core.js for the format). Chapter 6 Houston, chapter 7 Johnson Space Center. |
| 64 | `js/36g-scenery-moon-venus-inferno.js` | Scenery definitions: moon-venus-inferno (see js/36a-scenery-core.js for the format). |
| 65 | `js/36h-scenery-area51-mars.js` | Scenery (patches, props, landmarks, ambient life) for Area 51 and Mars. |
| 66 | `js/36-atmosphere.js` | Light, weather and depth: per-chapter base weather, time of day, night, fog, the intro card. |
| 67 | `js/36i-lighting.js` | Lighting: per-chapter colour grade (GRADE), the sun and soft shadows (`softShadow`), light pools around bright things (PROP_LIGHT, PICKUP_LIGHT), sun shafts, ocean caustics. |
| 68 | `js/36j-weather-events.js` | Weather events (storms, blizzards, meteor showers...), lightning with thunder, rain ripples, fireflies and stars at dusk (WX_EVENTS, WX_TOD). |
| 69 | `js/36k-water-depth.js` | Moving water and wet or icy ground, wakes, and depth sorting so tall scenery overlaps creatures (SCEN_TALL). |
| 70 | `js/36l-combat-fx.js` | Combat feedback: hit sparks and flashes, a death effect per kind of creature (`deathStyle`), stains and debris on the ground, damage-number sizing. |
| 71 | `js/36m-giraffe-fx.js` | The giraffe's presentation: stride stretch, breathing, head sway, blinking, hoof dust, power glow, afterimages, level-up pulse (GF). |
| 72 | `js/36n-neck-stretch.js` | **The neck whip, animated.** Every kick lashes the neck out to about three times its length on a bending S-curve (`neckProfile`, `neckCurve`), with motion-blur ghost frames of the neck and head, a squash in the body when the head lands (a damped spring, `GF.land`), a ring of dust at the hooves and a nudge of shake. A Neck Whip card makes the neck longer and swing with its arms. `33-giraffe-art.js` draws the curved neck and the squash. Presentation only. |
| 73 | `js/36o-cloud-fronts.js` | **Weather that arrives.** Cloud shadows drift across the ground, thickening and tinting as a front nears (`WxE.front`, `WxE.pend` from `36j`); thin clouds drift in calm weather in the open-sky chapters. The weather itself builds from a few drops to a full fall over 14 seconds and eases off over 10 (`weatherDraw` takes a `frac`). |
| 74 | `js/36p-gear-fx.js` | **Eleven pieces with a playstyle.** `GEAR_FX`: Thorns, Dust cloak, Cold snap, Sun ward, Aurora drift, Star crack, Undertow, Tidal wake, and the mythical set's Dawnlight, Falling spire and Aegis, each tied to one piece and scaled by its level; hooks on `doKick`, `hurtPlayer`, `updatePlayer` and `applyGear`. State in `GearFx`. |
| 75 | `js/37-frame-transitions.js` | Frame composition, transform sequence, chapter transitions. |
| 76 | `js/38-overlays-cards.js` | DOM handles, card presentation, offer generation, overlay helper. |
| 77 | `js/39-run-report.js` | Run report, tooltips, key bindings, kick trails. |
| 78 | `js/40-fusion.js` | Card fusion: combos, the machine screen, the film. |
| 79 | `js/41-qol.js` | Quality of life: navigation, settings screens, gallery, save/continue, touch layout, developer panel, actions. |
| 80 | `js/42-run-hud.js` | Run lifecycle and the HUD. |
| 81 | `js/43-input.js` | Input: keyboard, mouse, touch, gamepad. |
| 82 | `js/41a-gear-page.js` | **The Gear page, redone.** Overrides `gearTabHTML`: a paper doll with a live picture of her wearing the gear (drawn by `drawPlayer`), slot buttons, a picker of drawn icons, a compare panel with stat changes and a try-on, a Sets view, the crate reveal (`gearReveal`) and Buy 5 / Buy 10 on every crate (`gearBuyMany`: all the openings play at once, five to a row). Loads after `43-input.js` because it wraps `handleAction`. Hats and boots stay on the Coat colours screen. |
| 83 | `js/41b-trinket-page.js` | The trinkets on the Gear page: framed tiles, tap to wear in place, a panel with the numbers (from `recalcStats`). Replaces `trinketsHTML`; load it after `js/41a-gear-page.js` and `js/43-input.js`. |
| 84 | `js/41c-wheel-page.js` | The prize wheels: the Wheel tab with the Prize wheel and the new Spotted wheel (Spotted keys: `Save.data.spottedKeys`, `lastSpottedKeyAt`), Spin 1/5/10. Replaces `wheelTabHTML`/`spinWheelUI`/`revealWheelResult`; load it after `js/41b-trinket-page.js`. |
| 85 | `js/41d-ants-page.js` | The Ants tab as a cutaway of the anthill (food store, a chamber per ant with the ants walking in it, Hire 1/5/10, the dust alliance rooms below). Replaces `antsTabHTML`; load it after `js/41c-wheel-page.js`. |
| 86 | `js/41e-upgrades-page.js` | The Upgrades tab: groups, rich rows with Buy / Buy 5 / Max, a bonus summary, Buy all I can, locked silhouettes. Replaces `upgradesTabHTML`; load it after `js/41d-ants-page.js`. |
| 87 | `js/44-loop-boot.js` | The main loop, resize, and the boot function. |
| 88 | `js/44b-feedback.js` | Pacing and presentation: title splash, one-time hints, fades, boss entrance, wave-clear beat, number count-ups, overlay fade-out, text size, the kick wind-up. |
| 89 | `js/44c-perf.js` | The slow-device governor: times each frame's work and, if the game cannot keep up, lowers the canvas sharpness and then the effects (`PERF_STEPS`); shows a notice with a "Back to full quality" button when it does (`perfNotice`; that button turns "Adapt to slow devices" off), counts minigames as play, and the minigame polish layers follow the effects level; brings them back when there is room. Off with Settings, Adapt to slow devices. Also the statistics panel (the `\` key). |
| 90 | `js/44ca-ground-cache.js` | The ground and the still scenery painted once into tiles for the menu, Low and Medium effects, and after the governor's first step down. Wraps `drawGround`, `drawScenery`, `buildDecor` and `buildScenery`; load it after `js/44c-perf.js`, `js/36a-scenery-core.js` and `js/32-render.js`. |
| 91 | `js/44d-visual-extras.js` | Second visual pass, added from the outside (it wraps functions from earlier files): extra Chapter 1 and 2 scenery, time-of-day colour (and the cycle for Chapters 5, 7 and 13), heat haze, footprints and trampled grass, elite and varied creatures (`ELITE`), the iris and biome screen edges at chapter changes, the run map on the death screen (`RunMap`), and moving bestiary portraits. |
| 92 | `js/44e-wardrobe.js` | Coat colours and patterns: one colour and one spot pattern per finished chapter (`WARD`, `WARD_PATTERNS`), separate choices for skin, spots, pattern and gear accent, `wardSpot()` (draws a spot in the chosen pattern, used by every giraffe drawing), the Coat colours screen and the unlock note. `giraffeColours()`, `giraffePattern()`, `giraffeAccent()` and `giraffeCustom()` are what the drawing code asks for. |
| 93 | `js/44f-minigames.js` | Minigames, core: the 120-second cooldown, the chapter-end popup (`miniOffer`, hooked into `beginChapterTransition` in `37-frame-transitions.js`), the run loop and results, the accessory wheel, and the 23 hats and boots (`ACC`, `ACC_SLICES`, including the Paper Bag) with their art for top-down and side views, `drawTopGiraffe` and `drawSideGiraffe`, and the hat and boot rows of the wardrobe. |
| 94 | `js/44g-minigames-a.js` | The rules of the minigames for Chapters 1 to 6: Watering Hole Dash, Ice Slide, Lily-Pad Hop, Tide Surf, Vine Swing, Rooftop Dash. Each is one `registerMini({...})` call; the drawing is in `44i`. |
| 95 | `js/44h-minigames-b.js` | The rules of the minigames for Chapters 7 to 13: Asteroid Slalom, Low-Gravity Bounce, Acid-Rain Shelter, Cool-Down Relay, Echo Crystals, Hack the Grid, Sandworm Escape; the drawing is in `44j`. |
| 96 | `js/44i-minigame-art-a.js` | How the Chapter 1 to 6 minigames look: each `MINI[n].draw` paints a pre-rendered backdrop (`miniBg`) and the moving parts, and sets `m.focus` (where she is on the screen, for the paper bag). |
| 97 | `js/44j-minigame-art-b.js` | The same for Chapters 7 to 13. |
| 98 | `js/44k-minigame-rewards.js` | Minigame rewards: three stars per minigame (`MINI_STAR`; 20 gems per new star), the wheel odds by stars (`miniSlicesFor`; rare hats 5, 7, 10, 15 percent, duplicates rolled again from two stars), pickup streaks and edge flashes, best-score and star HUD, the slow last second of a win, the celebration before the result, win and lose stingers, and the Collection screen. Its own minigame music loop is the `minigame` theme in `02-music.js`. |
| 99 | `js/44l-minigame-polish.js` | Minigame visual polish, all by wrapping the drawing: ambient life per scene (`POL_AMB`), gentle parallax on static backdrops (`miniLayer`), a colour grade per scene (`POL_GRADE`), squash, stretch, afterimages, footprints and landing puffs (wrappers around `drawSideGiraffe` and `drawTopGiraffe`), the camera push-in and GO! flash, the eased intro card, and the top bar with an icon badge, stars, timer and best score (`miniHud`). |
| 100 | `js/44y-town-gear.js` | Twenty hats and boots found ONLY in Longneck Town (eight found lying about, twelve given by best friends: every one of the sixteen people gives a different hat, pair of boots or colour) (`ACC.townHats`, `ACC.townBoots`, flagged `.town`): they are not on the prize wheel. Appended to `ACC_ITEMS` (photo codes number accessories by that list, 6 bits since format 3, so it holds 63; it is at 62 and may only be added to at the end). **Must load before `js/44m-accessory-extras.js`**, which wraps the same drawing functions. |
| 101 | `js/44m-accessory-extras.js` | Hat and boot colours (a 'color' blend tint over the worn item, `Save.data.mini.hatCol` and `bootCol`, saved in outfits as `hc` and `bc`), and the one-time tips (the Photo screen is in `44n`) (`tipOnce`, `Save.data.mini.tips`). |
| 102 | `js/44n-photo-studio.js` | The Photo screen in the wardrobe: backdrops, ten poses, fifteen draggable effects (`PHOTO_FXDRAW`) and draggable creatures from the Bestiary (only ones with `Save.data.bestiary.creatures[ch:type] > 0` can be placed; the rest show as silhouettes). Items are picked and dragged with pointer events on the canvas; Save and Copy re-draw the picture without the selection ring. |
| 103 | `js/44o-photo-scenes.js` | Sixteen more photo backdrops: Chapters 3 to 13 (Murkfen to Mars) and five extras (Sunny meadow, Beach sunset, Rainy day, Mountain peak, Autumn forest), each with its own light point for the shadows. Add one by pushing a painter onto `PHOTO_SCENES`, a name onto `PHOTO_SCENE_NAMES` and a light position onto `PHOTO_SCENE_SUN`. |
| 104 | `js/44p-photo-share.js` | Photo sharing and the album. A photo is described as data (backdrop, pose, her position and size, her look, every effect and creature) and packed into bits (version 4 now, version 5 when a filter, frame, time of day or freeze is used: about 100 characters of Base64 for a busy photo, against about 1,700 for the version 1 JSON text; all versions are read). Format in the file header. Get code / Open buttons, a size comparison line, the popup for creatures not yet in this save's Bestiary, and the Album tab: up to 48 photos in `Save.data.album` (`[{ c: code, t: time }]`) with thumbnails, open and delete. A shared look is shown as shared even if not earned (`PHOTO.look`). |
| 105 | `js/44q-photo-book.js` | The album as a book (opened from the Photo screen or the wardrobe): a red cover with sewn patches and "My Adventures" in black marker, which opens to taped-in photos, four to a page, six spreads for 48, with 3D page-flip animations (a rotating "leaf" over half the book). Clicking a photo opens it in the studio. Pure HTML and CSS (`.book` rules in `polish.css`); the photos are painted from `Save.data.album`. |
| 106 | `js/44r-guide.js` | The Guide (replaces the old How to Play page; `showHelp()` is reassigned here, and the quick settings of the old page are at its end). A list of fold-out topics (`GUIDE_TOPICS`), each with a `show()` test that is the same unlock test the game uses (for example `venusUnlocked()`, `Save.data.antsUnlocked`, `cityUnlocked()`, `marsUnlocked()`, `labUnlocked()`, `squadAvailable()`), so nothing is mentioned before it is unlocked. When a new feature is added, add a topic here with the same test. |
| 107 | `js/44s-wave-pace.js` | Shorter waves at the same difficulty and the "Call the next wave" button. Load it after `js/44r-guide.js` and before `js/45-test-exports.js`. |
| 108 | `js/44t-enemy-sprites.js` | A cache of pre-drawn creature pictures to speed up drawing. Load it after `js/44s-wave-pace.js`. It only caches drawings that it has proven are pure; do not edit its rules. |
| 109 | `js/44u-town-data.js` | **Longneck Town, data:** the seven districts (`TOWN_DIST`), the 54 things to find (`TOWN_ITEMS`), the eleven giraffes (`TOWN_NPCS`), the 31 errands (`TOWN_ERRANDS`), the friendship levels, and the town's part of the save (`townData()`, `Save.data.town`). Load it after `js/44t-enemy-sprites.js`. |
| 110 | `js/44v-town-art.js` | Longneck Town, art: a giraffe whose neck stretches (`townGiraffe`), the sky, three painted layers per district, every building and prop, the things to find. |
| 111 | `js/44w-town-engine.js` | Longneck Town, engine: `G.state === 'town'`, walking, the neck, pickups, the herd's behaviour, the clock (a day is 12 real minutes), rain, the HUD. It wraps `step`, `render`, `showMenu` and `startRun` (see its end), so load it after `js/44-loop-boot.js` and `js/44c-perf.js`. |
| 112 | `js/44x-town-ui.js` | Longneck Town, interface: conversations (`#townDlg`), errands, friendship, gifts, the journal, map, notice board, hall, scores, library and Mission Control panels, the main-menu button and the Guide page. |
| 113 | `js/44z-town-bread-car.js` | Bread (bought at the bakery; in a run it heals 5% every 15 seconds; key B and a button; `Settings.autoBread`) and the car (bought at the garage; driven with C in town, 2.2x; only in Chapter 6 in a run, +45% speed, drawn under her; never underground). Edits `js/06-player.js` through `townCarRunMul()`. |
| 114 | `js/44zb-town-interiors.js` | Ten rooms you can go into (`indoor:true` entries in `TOWN_DIST`), longer streets, more things to find, five more people and eight more errands. Wraps the painters, `townUse` and `townNeed`. |
| 115 | `js/44zc-town-life.js` | People walking about, the tram timetable (40 s) and the tram ride, and the animation of the scenery. |
| 116 | `js/44zd-town-panels.js` | The themed panels (cork notice board, brass hall, neon scoreboard, notebook journal, tram map, chalkboard bakery, blueprint garage, green-screen Mission Control), the speech lines (`townLine`) and the Guide page's additions. Its CSS is the end of `css/polish.css`. |
| 117 | `js/44ze-town-runway.js` | The Old Runway (the last street at the far right of town, painted like the airfield in the homecoming film; open from the start, reachable by tram), Wingnut Aviation (Hangar 7, a plane for sale, `Save.data.town.plane = { own, col }`), and flying: `G.state === 'fly'` with a small flight model (throttle, elevator, stall below `FV.stall`, rotation speed, crash and a rescue scene), a side-on strip of Longneck Town then the chapters on the Earth (1 to 7; 11 once Chapter 10 is finished; 12 once 11 is) with ground detail and gateways between regions, gold rings, Esc leaves. Adds one more hat (the Pilot's Peaked Cap, Wingnut's gift). Wraps `step` and `render`; touches `js/43-input.js` (touch and Esc for state 'fly') and `js/02-music.js`. Load after `js/44zd-town-panels.js`. |
| 118 | `js/44zf-town-economy.js` | Four planes (`PLANES`) and four cars (`CARS`) with their own stats (copied into `FV` at take-off), the oven upgrade (bread capacity and heal), Her Home (a house at the far end of Willow Park, eight furnishable slots, `Save.data.town.home`) and the photo gallery in Herd Hall (six frames, `Save.data.town.gal`). Wraps `flyPlane` and `townCarSide` for each model's look. |
| 119 | `js/44zg-town-activities.js` | The cafe shift, the weekly tournament (wraps `endMini` to record a score), fishing from the pier (`Save.data.town.fish`) and the daily post (`Save.data.town.mail`). |
| 120 | `js/44zh-town-qol.js` | What is left in a street, a hint when stuck, the Gear page of the journal, bigger touch buttons and tap-to-walk. |
| 121 | `js/44zi-town-atmosphere.js` | Ambience and footsteps, daily routines for seven of the herd, weather (rain, storms, fog), the aurora, and night flying effects. Wraps `Amb.update`, `Feedback.tick`, `townDrawSky`, `townSpawnNpcs` and `updateTown`. |
| 122 | `js/44zj-town-home.js` | Her Home furnished in detail, with things to do: sit, lie down, pet the cat, talk to the parrot, feed the goldfish, lamp, plant, window. Wraps `townRoomProps`, `townDynX`, `townNearest`, `townUse`, `updateTown`, `townDrawPlayer`, `townEnter`. |
| 123 | `js/44zk-town-interiors2.js` | More detailed building interiors where every object is connected (stands on the floor or hangs from a visible hook, chain or bracket). Wraps `townBuildingX`, `townPropX`, `townRoomProps`. |
| 124 | `js/44zl-photo-props.js` | Cars, planes and extra props for the photo studio, added to the end of the effects list (photo codes stay compatible). |
| 125 | `js/44zm-close-x.js` | A close (X) button in the corner of popup panels and the town conversation card; it presses the panel's own back/close button. |
| 126 | `js/44zn-savanna-flight.js` | Flights go over the Savannah only (Changed Savannah after Chapter 10), with Bestiary animals walking about, detailed scenery and a map. Overrides `flyRegions`; wraps `flyFeatures`, `flyGroundDetail`, `flyTakeoff`, `renderFly`. |
| 127 | `js/44zo-town-farm.js` | Hayfield Village farm at the end of the Savannah flight: dirt strip with hay bales, a village with a corn stand (speed boost button in runs, key V), cargo hauling to the Old Runway, eggs, two hats. Save data in `town.farm`. |
| 128 | `js/44zp-tram-ride.js` | A more detailed tram ride scene (carriage interior, route map, scenery through the window). Replaces `townDrawRide`, wraps `townRide`. |
| 129 | `js/44zq-sea.js` | Boat dealership at the Harbour, a top-down sailing sea with a saved chart, the island town Driftwood Cove, and fish / crab run items. Adds `G.state` `sail`; wraps `step`, `render`, `hurtPlayer`, `Feedback.tick`, `startRun`. Save data in `town.sea`. |
| 130 | `js/44zr-interiors-farm-isle.js` | Interiors for the farm and island buildings, a lighthouse climb that reveals the sea chart, and six expensive carrying upgrades (corn basket, fish cooler, crab pot). Load order matters: it must come after `44zk-town-interiors2.js` and `44zq-sea.js` (the order is 44zj, 44zk, 44zl, 44zm, 44zn, 44zo, 44zp, 44zq, 44zr). |
| 131 | `js/44zs-explore-rewards.js` | Eight new hats and boots and six new coat colours hidden in the air, at sea and in the two villages. Also edits `44e-wardrobe.js` (six more `WARD_TOWN` colours, `WARD_MAX` 41) and `44zh-town-qol.js` (Gear page sources). Must load after `44zq-sea.js` and `44zr-interiors-farm-isle.js`. |
| 132 | `js/44zt-sea-deep.js` | The Deep: the sea has no wall. The water deepens toward every edge (`seaDeepF`, `seaLevel` and the colour table in `44zq-sea.js`; the last 300 units slip under too, so the map ends in open water everywhere), past the edge is open water, and the deep has sharks that stalk, lunge and bite. One bite destroys the boat and plays a cutscene (shark breaches, planks scatter, life ring, a rescue boat tows her home; repair costs 5% of the boat's price, the boat is kept). Sharks only live in deep water. Wraps `updateSea`, `seaDrawFeatures`, `seaDrawBoat`, `renderSea`, `seaMapColour`, `seaStart`. Must load after `44zq-sea.js`. |
| 133 | `js/44zu-training-gym.js` | Longneck Fitness, the training gym at the end of Market Street: daily passes (five tiers, each locked behind a chapter), ten machines with seven kinds of minigame (none on more than two machines), skill levels with bonuses at 5/10/15 through `applyCityStats`, and a gym rank with rewards. Also edits `44zb-town-interiors.js` and `44zk-town-interiors2.js` (no generic windows in the gym) and `44e-wardrobe.js` (the Gold Medal colour, `WARD_MAX` 42). Must load after `44zs-explore-rewards.js`. |
| 134 | `js/44zv-gym-art.js` | The gym's painting (building, floor, machines, hats and boots). Load it right after `44zu-training-gym.js`. |
| 135 | `js/44zw-town-detail.js` | The small parts of Longneck Town (brick, roof tiles, shutters, ground detail, backdrops). Load it right after `44zv-gym-art.js`. |
| 136 | `js/44zx-farm-isle-detail.js` | The small parts of Hayfield Village and Driftwood Cove. Load it right after `44zw-town-detail.js`. |
| 137 | `js/44zy-sea-detail.js` | The small parts of the open sea (terrain, docks, village, boats). Load it right after `44zx-farm-isle-detail.js`. |
| 138 | `js/44zz-campus.js` | **Longneck University, the rules.** The eight faculties (`UNI_FAC`: Giraffe Studies, Earth & Weather, Biology, Chemistry, Maths, Physics, Space, History & Geography, each opening after a chapter), levels 1 to 15 (`uniNeed`), the energy (`uniEnergy`, refills at midnight, drinks can push it to twice the most), `uniAddXp`, degrees, the rank ladder (`UNI_RANKS`: Fresher to Chancellor, with a mortarboard, loafers and three coat colours), the smart-giraffe stats (`uniApply` through `applyCityStats`) and the run hooks (dodge in `hurtPlayer`, card cooldowns in `haste`, boss damage in `damageEnemy`, free rerolls in `startRun`, a fourth card in `rollOffer`, Eureka in `chooseCard`, one more slot in `maxCards`), the IQ chip over the HUD bars, and the fix for the gym's Haste stat. Saved in `Save.data.town.uni`. |
| 139 | `js/44zza-campus-questions.js` | The question bank, part 1: the question types (`mc`, `tf`, `ord`, `match`, `est`), `uqFactory`, and 160 questions for Giraffe Studies, Earth & Weather, Biology and Chemistry (tiers 1 to 3, with a short explanation each). |
| 140 | `js/44zzb-campus-questions2.js` | The question bank, part 2: 160 questions for Math, Physics, Space and History & Geography. `UNI_Q` and `UNI_Q_BY_ID` hold all 320. |
| 141 | `js/44zzc-campus-lectures.js` | `UNI_LECTURES`: 32 lectures (four per faculty), each four slides with a picture key and four questions (three are asked). |
| 142 | `js/44zzd-campus-books.js` | `UNI_BOOKS`: 24 books (three per faculty, one per tier), each five pages, three questions (two are asked) and a fact for the notebook. |
| 143 | `js/44zze-campus-town.js` | **The Campus district and its people.** The `campus` district (reached through an iron gate in the Town Square once Chapter 1 is done), six interiors (Registrar's Hall, Lecture Theater, Library, Homework Hall, Exam Hall, Campus Café), nine giraffes, ten errands (the `uni` need kind), five finds, the door and action wrappers, the café shop (`UNI_SHOP`; food from the satchel gives energy too), and the panels (registrar, faculties, degrees, ranks, notebook, café, and a Study tab in the journal). |
| 144 | `js/44zzf-campus-study.js` | **The four things to do.** Lecture (2 energy), reading (1), homework (1) and exam (3): the pickers, the slides and pages, the question card in all five formats, the 30-second exam timer (7 of 10 passes), flashcards, first-time bonuses, repeat decay, degrees and badges, and the errand counters. |
| 145 | `js/44zzg-campus-art.js` | The Campus painting outdoors: the spires, hills and trees, lawns and paving, the iron gate, the arch and the six street buildings, the hedge, notice board, bikes, founder's statue, fountain and faculty banners (`uniEmblem`), and the mortarboard and loafers. |
| 146 | `js/44zzh-campus-rooms.js` | The six rooms of the university: walls (`IV_ROOMS.uhall` and the rest) and every piece of furniture (`UNI_FURN` by `u_` kind: the registrar's desk, faculty board, hall of degrees, rank cabinet, stage, seats, the eight faculty bookcases, reading table, desks, results board, café bar and tables). |
| 147 | `js/44zzi-campus-pics.js` | `UNI_PICS`: the 49 pictures on the lecture slides (a giraffe in profile, the layers of the Earth, an atom, the solar system, the Colosseum and so on). |
| 148 | `js/44zzj-window-glow.js` | **Lit windows only where the glass shows.** Keeps a copy of each recorded window (`D._win`) while a street is painted (`townPaintField` wrapper) and, once it is finished, lights only the pixels that are still glass, so awnings, columns, signs and props in front of a window stay dark; arched, round and triangular windows keep only what is inside their outline. `townDrawWindows` (in `44w`) draws the glow before the herd and the player, not after them. |
| 149 | `js/44zzk-town-routines.js` | **The herd's day.** `TOWN_ROUTINES`: a timetable for each street giraffe (nine of them move between districts by the hour: the Mayor, Tilly, Barnaby, Penny, Rio, Gus, Marina, Skye, Nova). They walk off the edge of the street when their slot changes and walk in from the side they came from. Keeps the old rules (lunch at the café 12:00-13:30, the fountain 18:00-21:00, away at night for the seven keepers) and replaces 44zi's `townNpcSlot` and `townApplyRoutines`. `townNpcNow(id)` says where one is right now. |
| 150 | `js/44zzl-town-book.js` | **The collection book and the tram map.** `townShowBook` (a Book tab in the journal, a Collection button on the town menu): every district's coins, stars, gems, hats, boots, colours and tracks, plus cards for hats and boots, colours, photos, errands, friends, creatures, minigame stars, the gym and the university. Also wraps `townShowMap` to show who is at each stop, who has an errand, how many finds are left, and a Who is where list. |
| 151 | `js/44zzm-home-trophies.js` | Her home shows what she has done: framed diplomas for every university degree, a bookshelf of the books she has read, notebooks, and a trophy cabinet with a cup for every gym rank and a mounted fish, crab and shell from the sea. Painted into the cached room (`homePaintBase` wrapper); `homeTrophySig` refreshes it. |
| 152 | `js/44zzn-room-detail.js` | The older interiors in the campus rooms' detail: wall flecks and shadows, cobwebs, wainscot panels, floor grain and nail heads, window light shafts with dust, a switch and a socket by the door, bare walls given a picture, and floor-level props. Wraps `townRoomProps`; skips the gym and the campus rooms. |
| 153 | `js/44zzo-town-sound.js` | The rest of the town's sound: a footstep for every floor (`townStepSound`), door sounds going in and out (bells, creaks, the gym thud), and ambience beds and one-shots for the rooms and streets that had none (the tailor, hall, studio, farm and isle rooms, gym, campus and its six rooms). |
| 154 | `js/44zzp-photo-looks.js` | **The photo studio's look and light.** A Look and light tab: filters (Sepia, Noir, Glitch, Painterly), seven frames, a time-of-day slider, and a freeze-all-creatures toggle; twelve stickers in the Effects tab. All saved with the picture; photo code version 5 is written only when one is used (older codes are unchanged). |
| 155 | `js/44zzq-npc-voices.js` | Babble: townsfolk speak in short pitched blips, each with a voice of their own (all synthesised with `SFX.tone`; nothing recorded). Wraps `townSay`, `townDlgFinish` and `townCloseDialog`. Settings, Sound, "NPC voices" turns it off. Load it after `js/44x-town-ui.js`. |
| 156 | `js/44zzr-engineer-ants.js` | The Engineer Ant: unlocked by a new Venus upgrade (Engineer Garage); drives a rover and builds turrets. Wraps the ant code; load it after `js/44zzq-npc-voices.js` and before `js/45-test-exports.js`. |
| 157 | `js/44zzs-perf-cache.js` | Cheaper drawing for slow devices: a cache of pre-drawn soft shadows (`ShadowCache`, replaces `softShadow`) and a cheaper rim round the giraffe once the slow-device governor has stepped down. Changes nothing visible. Load it after `js/44zzr-engineer-ants.js` and before `js/45-test-exports.js`. |
| 158 | `js/44zzt-together.js` | Play together: two giraffes on one screen, just for fun, keeping nothing (the real save is put aside for the game and comes back untouched; `Save.write` does nothing meanwhile). Arena fight and a kick-about yard, started from a button on the main menu. Wraps `update`, `updatePlayer`, `updateWaves`, `gainXP`, `gameOver`, `doKick`, `hurtPlayer`, `antAggroTarget`, `drawPlayer`, `showPause`, `showMenu` and `handleAction`. Must load after `js/44zzs-perf-cache.js` and before `js/44zzu-achievements.js`. |
| 159 | `js/44zzv-fishing.js` | Fishing, grown: 35 kinds in a Fish book, sizes, tackle unlocked free by the number of kinds caught, Brine's weekly order, and casting from a boat at sea (F or a Cast button; `G.state` `fishing`). Rebuilds the pier game of `js/44zg-town-activities.js` and extends its `FISH` table. Saves in `Save.data.town` (`fish`, `fishBook`, `tackle`, `fishOrder`). Must load after `js/44zzu-achievements.js` (it adds trophies). |
| 160 | `js/44zzw-tackle-shop.js` | The Bait & Tackle shack gets an inside: a rod rack, a line wall and a bait tank, each a page listing every piece of tackle and letting her take the ones she has unlocked (still free, by kinds caught), and a gear bench that turns fish scales into gear levels. |
| 161 | `js/44zzx-wheels.js` | Skateboards and bicycles: a shop at the end of the Park with a room inside, riding (indoors too), a small chance of a fall, townsfolk who comment on it, and the photo studio props. Save: `town.wheels`. |
| 162 | `js/44zzy-fishing-fight.js` | Fishing, third part: a real fight after the hook, each fish pulling its own way, sound, conditions (time and weather), daily fishing spots at sea, a catch card, mounted fish at home, auto-recast and Cast again. `town.fishAuto` is the only new save key. |
| 163 | `js/44zzz-guide-more.js` | Guide topics for fishing, Trophies and Play together, and a line about the touch or mouse choice. |
| 164 | `js/44zzu-achievements.js` | Trophies: 80 goals worked out from the save, a few gems each, once; `Save.data.ach = { done: { id: time } }`; a "Trophies" button on the main menu. Wraps `Save.write`, `showMenu` and `handleAction`. Counts nothing while `js/44zzt-together.js` is running. |
| 165 | `js/45-test-exports.js` | The window.GR object used by the automated tests. |
| 166 | `js/45b-dev-panel.js` | **DEVELOPER PANEL. DO NOT INCLUDE IN THE WEBSITE.** Developer panel (testing only, not shipped to the website): the five-click code prompt, the panel, every `debug-*` action, `unlockAllCombos`, and the **Dev Test Run** (a Chapter 1 sandbox with no enemies, XP on/off, invincibility, any card or combo at any level, any enemy in any amount, jump to any wave; opened with the DEV button or the \` key; nothing it does is saved). Optional: delete it and its script tag and the game runs the same. See `LOVABLE-DO-NOT-INCLUDE-DEV-PANEL.md`. |
| 167 | `js/46-main.js` | Starts the game. |

CSS, in the order `index.html` links it: `css/style.css` (all the base styles), `css/polish.css` (layered on top: cards, buttons, HUD, menu, and every screen
added later: minigames, the album book, the guide, photo studio, collection, wide panels on big screens), `css/campus.css` (the university), `css/townlife.css` (Longneck Town panels),
`css/gearpage.css` (the Gear, Trinket, Wheel and Ants pages) and `css/phone.css` (phones and touch; it must stay last).

---

## 4. The save, and the bridge

### Where it lives

- localStorage key **`giraffe_rampage_save_v1`**. Do not change it.
- One save per browser. It is an object (`Save.data`) merged over defaults when it loads, so a missing field is always fine
  and **adding a field is always safe**. Removing or renaming a field is not.

### The new compressed format (this version)

The save used to be stored as plain JSON text. It is now **compressed**, by `js/01b-savepack.js`. What is stored in localStorage
is a **JSON string literal containing a packed code**:

```
"GR2:AQAAHpE..."          <- the whole stored value, quotes included
```

The code is `GR2:` followed by Base64 of:

| bytes | meaning |
|---|---|
| 1 | format: `0` = the JSON text as UTF-8 (only used if compressing would not shrink it), `1` = LZW |
| 4 | length of the JSON text in bytes, big endian |
| rest | the payload |

**LZW details** (so you can decode it anywhere): the input is the UTF-8 bytes of `JSON.stringify(save)`. Codes `0..255` are
single bytes; new entries are numbered from 256. A code is written with `max(9, bitLength(256 + j - 1))` bits, where `j` is how
many codes have been written since the dictionary was last emptied (so widths run 9 up to 16 and are never stored). The
dictionary is emptied (and `j` goes back to 0) once it holds 65,280 entries. Bits are packed most significant first. There is no
clear code and no end code; the length in the header says when to stop. The reference decoder is `unlzw()` in
`js/01b-savepack.js`.

**Measured:** a full late-game save is about 5 to 12 KB as JSON and about 42% to 58% of that once packed. (Saves are small
either way; the point is the cloud row and the localStorage are smaller, and photo codes inside it are already dense.)

### How the game reads it

- `Save.load()` accepts: the packed JSON-string literal above, a bare `GR2:...` string, **or an old plain JSON object**. An old
  save is read as normal and is rewritten in the new form the next time the game saves. Damaged or foreign data is ignored, not
  half-used.
- `Save.write()` always writes the new form.

### The helper the page can use: `window.GRSave`

```js
GRSave.key                // 'giraffe_rampage_save_v1'
GRSave.encode(obj)        // object -> 'GR2:...' string
GRSave.decode(value)      // 'GR2:...', a JSON string literal of one, or a JSON object text -> object (or null)
GRSave.read()             // the live save from localStorage as an object (or null)
GRSave.stats(obj?)        // { json, packed, ratio } character counts, for the given object or the live save
```

Use `GRSave.read()` whenever the website needs a field of the save (the best score for a leaderboard, say). **Do not
`JSON.parse` the localStorage value and expect an object any more**: you get a string.

### What the bridge must do (update the bridge accordingly)

The bridge was written when the value was a JSON object. Update it like this, and keep the rest of its behaviour:

1. **Upload:** read the localStorage value as text. It is valid JSON (a string literal). Send it as it is. Store it in the
   `game_saves` row as a JSON value (a JSON string in the jsonb column is fine), or as text. **Do not decode, edit, or re-encode
   it on the way.** If you want the readable form for the database (for analytics or admin screens), *add* a second column
   holding `GRSave.decode(value)`; do not replace the packed one.
2. **Download / restore:** whatever the row holds, write it back to localStorage so that `JSON.parse(localStorage value)` works:
   - if the row's value is a **string** (the new form): `localStorage.setItem(key, JSON.stringify(value))`;
   - if it is an **object** (a row saved before this version): `localStorage.setItem(key, JSON.stringify(value))` too. The game
     reads old objects, and repacks them on its next save.
3. **Never let an older cloud copy overwrite a newer local one** without asking the player. (Compare a timestamp or the
   packed length of the two only as a hint; it is the owner's rule, not a technical one.)
4. **Throttle uploads.** The game can write the save several times in quick succession (menu actions, purchases, run
   boundaries). Upload at most every few seconds, and once more when the page is hidden.
5. **Check any code of yours that tests `typeof save === 'object'`** or reads fields from the uploaded value: it will now see a
   string. That is the one thing this change can break in the site's own code.

If the bridge is left unchanged it keeps working: the packed code is valid JSON, so it uploads and restores it unchanged.

### Save fields added by recent features (all optional, all merged over defaults)

| Field | Shape | Set by |
|---|---|---|
| `mini` | `{ own:{id:count}, hat:'id', boot:'id', hatCol:n, bootCol:n, best:{ch:score}, stars:{ch:0..3}, last:ms, plays:n, tips:{key:1} }` | the minigames, the wardrobe, the guide's one-time tips |
| `skinCol`, `spotCol`, `gearCol` | `0` or `1..45` (`1..13` chapter colours, `14..26` minigame colours, `27..31` hidden in Longneck Town, `32..35` best-friend gifts, `36..42` found at sea, in the air, in the two villages and at the gym, `43..45` the university ranks; `WARD_MAX` in `js/44e-wardrobe.js`) | the wardrobe |
| `autoBread` | boolean (default true) | Settings: eat bread by itself |
| `npcVoice` | boolean (default true) | Settings: townsfolk babble while they speak |
| `town` | `{ car:{own:0|1,col:n}, n:{loaves,bought,eaten,...}, found:{id:1}, bond:{npc:points}, err:{id:1|2}, talk:{npc:'date'}, gift:{npc:'date'}, vis:{district:1}, night:{district:1}, done:{district:1}, daily:{d,dig:[],got:[],dot,n}, tips:{}, n:{}, last:'district' }` (all optional; shape in the header of `js/44u-town-data.js`) | Longneck Town |
| `patCol` | `0..13` | the wardrobe |
| `outfits` | six entries, each `null` or `{s,p,t,g,hat,boot,hc,bc}` | the wardrobe |
| `album` | up to 48 entries `{ c:'photo code', t:ms }` | the photo album (section 5) |
| `ach` | `{ done: { id: time } }` (trophies; the ids are in `js/44zzu-achievements.js`; a bad value is tidied on load) | the Trophies page |
| `town.wheels` | `{ owned: { id: 1 }, sel: id }` | the skateboards and bicycles she owns and the one she rides (`js/44zzx-wheels.js`); read raw until she owns one |
| `town.fishAuto` | `true` / absent | auto-recast switch for fishing (`js/44zzy-fishing-fight.js`); read raw |
| `town.scales` | a number | fish scales from fishing, spent at the tackle shop's gear bench (`js/44zzw-tackle-shop.js`); read raw, a key only appears after the first catch |
| `town.fishBook`, `town.tackle`, `town.fishOrder` | `{ id: biggest cm }`, `{ rod, line, bait }` (each an index, kept to what is unlocked), `{ w, id, done }` | fishing (`js/44zzv-fishing.js`); read lazily, so an old save is fine |
| `wardSeen` | `{n:1}` | the "new colour" toast |
| `gems` | number | gems also come from minigame duplicates and first-time stars |

The older fields (`gold`, `gems`, `best`, `bestWave`, `runs`, `chapterNComplete`, `bestiary`, `venusUp`, `marsUp`, `city`, `mutations`,
`ants`, `runSave`, settings like `musicVol`, and so on) are unchanged. See `DEFAULT_SAVE` in `js/01-core.js`.

---

## 5. The photo album and share codes

Players can take pictures in the **Photo studio** (opened from the wardrobe): pick a backdrop (21 scenes) and a pose (10), stand
her where they like, add effects (15) and creatures from the Bestiary, and drag everything around. The picture is a small
description, not an image. That description is what is saved and shared.

### What a photo is

```json
{ "v":1, "bg":n, "pose":n, "flip":bool,
  "giraffe":{"x":n,"y":n,"s":n},
  "look":{"skin":n,"spots":n,"pattern":n,"gear":n,"hat":"id","boots":"id","hatColour":n,"bootColour":n},
  "items":[{"type":"fx"|"creature","id":"...","chapter":n,"x":n,"y":n,"scale":n,"flip":bool,"tilt":n}] }
```

Picture coordinates are 960 by 540. Version 1 of the share code was this JSON as Base64 text (about 1,700 characters for a busy
photo). **Version 4, used now, packs it into bits** (about 100 characters for the same photo, 17 times smaller; version 5 is the same plus a tail, written only when the photo uses a filter, frame, time of day or freeze; version 2 had 5-bit colour and accessory fields and version 2 and 3 had 5-bit effect indexes; all are still read):

```
byte 0   = 4 or 5     (the format: 4 now, 5 with a tail; 2 and 3 before; JSON starts with "{", so the formats are told apart by this)
byte 1   = check      (a = 7; for each following byte: a = (a*31 + byte) & 255)
then bit fields, most significant bit first, no padding between them:
  bg 5 | pose 4 | flip 1 | giraffe x 10 | y 10 | size 8 (x100)
  look: skin 6 | spots 6 | pattern 4 | gear 6 | hat 6 | boots 6 | hat colour 6 | boot colour 6   (version 2: 5 bits for each of those but pattern)
        (hat and boots: 0 = none, else index in ACC_ITEMS + 1)
  item count 5, then each item:
    kind 1 (0 effect, 1 creature)
    effect:   index in PHOTO_FX, 6   (versions 2 and 3: 5)
    creature: chapter - 1, 4 | index in BESTIARY_ORDER, 5
    x + 100 (11) | y + 100 (10) | size x50 (8) | flip 1 | tilt as 1/128 of a turn (7)
  version 5 only, after the last item: filter 3 | frame 4 | time of day 6 (63 = none) | freeze 1
the whole is Base64 (standard alphabet; "-" and "_" are also accepted when reading)
```

All versions are read. Reading checks and clamps every value, so a hand-edited or damaged code cannot break anything: it is
rejected with a message ("That does not look like a photo code...") or its bad parts are dropped.

**Append-only.** The code stores *indexes* into these lists, so they may only ever have things added at the end:
`PHOTO_FX` (effects), `BESTIARY_ORDER` (creature types), `ACC_ITEMS` (hats and boots: hats, then boots, then rare hats),
the backdrops (`PHOTO_BG`), `PHOTO_POSE`, and the colours (`WARD`, `WARD_STAR` and `WARD_TOWN`). Reordering or removing one changes what old
codes mean. If a list has to grow past a field's width (5 bits = 32 entries for backdrops; 6 bits = 64 for effects, hats, boots and colours; `ACC_ITEMS` is at 62 of the 63 a 6-bit field can name),
make a new format byte (6) instead of widening the old one, and keep reading formats 2 to 5.

### How the album saves

1. The studio's current state is turned into the data above (`photoData()`), packed into bits (`photoPack()`), and written as
   Base64 (`photoToCode()`). That code is **the only thing stored**.
2. **Save to the album** appends `{ c: code, t: Date.now() }` to `Save.data.album` (`photoAlbum()` keeps it clean: entries
   without a string `c` are dropped, and it never holds more than **48**). When it is full, saving is refused with a message
   and the player must delete one first.
3. The album is part of the save, so it **travels through the same bridge, compression and merge** as everything else. There is
   no separate storage and no images. 48 photos are about 5 KB.
4. **Thumbnails are never stored.** They are redrawn from the codes when the album or the book is opened, in small batches, and
   cached in memory for the visit.
5. **Opening** a photo (from the album tab, the book, or by pasting a code) decodes it (`photoFromCode()`), validates it, and
   loads it into the studio, where it can be edited and saved or shared again.

### Looks and creatures in shared photos

- **Her look** (colours, pattern, hat, boots, and their colours) travels with the photo and is **shown as shared even if the
  viewer has not unlocked it**. This is deliberate: it encourages people to share. It is only a picture; it unlocks nothing.
  A "Use my own colours and outfit" button switches back.
- **Creatures** are different: a creature the viewer has not discovered in the Bestiary is **left out**, and a popup says how
  many chapters to finish ("finish N more chapters and defeat the creatures there: ..."; if the chapter is done, it says to
  defeat them in a run). Effects are never locked.
- The album's **book view** (a red cover with patches and "My Adventures" in black marker, pages with taped-in photos, flip
  buttons, click a photo to edit it) is pure HTML and CSS drawn from the same codes (`js/44q-photo-book.js`).

### Sharing

**Get code** shows the packed code (and how much shorter it is than the plain JSON form, for the owner's interest) and copies
it. **Open** takes a pasted code. There is no server involved: a code is just text a friend can paste. If you ever add a
website feature around photos (a gallery, a link that opens a code), treat the code as opaque text, pass it to the game
unchanged, and do not decode or rewrite it.

---

## 6. The developer panel: never ship it

`js/45b-dev-panel.js` is a hidden panel for local testing. It hands out gold, gems, every card and every unlock, and its access
code is a fixed number in client JavaScript that anyone can read. The website already has its own secure admin panel.

**Leave out:** the file `js/45b-dev-panel.js`, and its `<script src="js/45b-dev-panel.js">` line. In a single-file build,
leave out everything that came from it: from the comment `DEVELOPER PANEL -- testing only` to the end of that file (the last
line closes the `if (typeof GR !== 'undefined')` block that adds the `GR.dev*` entries).

It also contains the **Dev Test Run** sandbox (a small DEV button, the ` key), and it replaces a few game functions while loaded
(`gainXP`, `hurtPlayer`, `updateWaves`, `gameOver`, `saveRunNow`, `saveRunAtBoundary`). Another reason it must stay out.

**Nothing else depends on it.** Any action starting with `debug-` is ignored when the panel is absent, the secret five clicks
on the "E" of the title do nothing, and `GR` stays complete without it.

**The minigame and town buttons in it** (`debug-mini-cd`, `debug-mini-own`, `debug-mini-colours`, `debug-mini-unlock`, `debug-town-open`, `debug-town-find`, `debug-town-friends`, `debug-town-errands`, `debug-town-reset`) are part of the
panel. **The minigames themselves ARE part of the game and must be included.**

**How to check the shipped game** (search `index.html`, `css/` and `js/` for these; none may be present): `Developer Panel`, `debug-addgold`, `1391`,
`Dev Test Run`, `debug-dr-`, `devRunBtn`, `devBegin`, `debug-mini-`, `debug-town-`.

---

## 7. What is in the game now (so you can recognise it)

- **The run:** 13 chapters of 25 waves (a boss every fifth wave), cards that level up and transform at levels 5 and 10, gear,
  trinkets, permanent upgrades, ants, a prize wheel.
- **Between chapters:** a **minigame** after each chapter (13 of them) with stars (three per game), a prize wheel for hats and
  boots (65/30/5), a 120 second shared cooldown, a Collection screen, and a coat colour unlocked by three stars in each.
- **Outfits and photos:** coat colours and patterns, hats and boots (recolourable), six saved outfits, the Photo studio, the
  album and its book view, share codes.
- **Late game:** the Venus and Mars outposts with scouting trips, the spaceplane, the underground city, the Card Fusion Machine,
  the lab, the dust squad. These are only shown, and only appear in the Guide, once a save has unlocked them.
- **Longneck Town** (`js/44u`-`44x`): a side-on town she walks through (main menu button *Longneck Town*, `G.state === 'town'`). Seven districts on one street (Harbour, Market Street, Town Square, Willow Park, Rooftops, Launchpad, and the Burrows down the manhole), each opening with a chapter. The buildings are the front doors of screens the game already has (wardrobe, trading post, minigames, photo studio, album, bestiary, guide, the outposts, the lab); closing one returns to the town because `showMenu()` is wrapped to do that while `G.townReturn` is true. She finds coins, stars, gems, hats, boots, creature tracks and five hidden coat colours (the neck stretches to reach high ones), digs three daily spots, meets eleven giraffes with errands and friendship, and the town has a day/night cycle and rain. It must be included in the website. Its dev buttons are in the developer panel, which is not.
- **Inside Longneck Town (second update):** ten rooms she can enter (bakery, caf\u00e9, garage, library, tailor, hall, arcade, photo booth, two homes), longer streets, walking townsfolk, an animated tram (and a short ride when picking a stop on the map), Houston-only car, bread, eight town-only hats and boots, and panels that look like what they are. The car is never available underground, in the Burrows or indoors. Hats and boots found in town are not on the wheel.
- **Longneck University** (`js/44zz`-`44zzg`): a campus district in the town opened by finishing Chapter 1, with eight faculties, lectures, a question bank, study activities, degrees and a rank. It is part of the game; include it.
- **Gear and trinkets, redone** (`js/05a`, `33a`-`33e`, `36p`, `41a`, `41b`): 22 gear sets (66 pieces, common to mythical) with drawn art on the giraffe, levels 1 to 5, set bonuses and eleven special effects, three crates (Supply, Prime, Spotted) with Open 5 and Open 10, pity counters, a Gear page with a live picture of her, a compare panel and a Sets view, and trinkets as framed tiles you tap to wear, with a panel showing what each does. The save gains `gearLv` and `cratePity`; both are optional.
- **Performance, second pass** (`js/44ca-ground-cache.js`): the ground and the scenery that holds still are painted into tiles when the menu is showing, at Low or Medium effects, or after the slow-device governor's first step down. Full effects draw everything live.
- **NPC voices** (`js/44zzq-npc-voices.js`): townsfolk babble in short pitched blips while their dialogue card types out, a different voice for each character (low and slow for the mayor, high and quick for the small ones). A Settings switch, "NPC voices", is on by default; the save gains the optional boolean `npcVoice`. It is part of the game; include it.
- **The Guide** (`js/44r-guide.js`) replaced the old "How to play" page.
- **Performance:** a picture cache for creatures (`EnemySprite`, `js/44t-enemy-sprites.js`) and staggered enemy updates (the crowding push and who an enemy heads for are worked out a few times a second, and creatures far from her walk toward her with a cheaper update). These change nothing visible. If an enemy ever looks wrong, `EnemySprite.on = false` turns the cache off for a test.
- **Wave pace:** waves have 40% fewer enemies arriving at the same rate (so each wave is about 40% shorter at the same pressure), each remaining enemy is worth proportionally more experience, score and drops so progression is unchanged, the wait on an empty field is skipped, and a Call the next wave button (key N) ends a wave once everything has spawned. These numbers are WAVE_COUNT_MUL, KILL_VALUE, WAVE_INTRO_S, WAVE_CLEAR_S and WAVE_PATIENCE_S in js/31-waves-update.js. Do not change them.
- **Quality:** a slow-device governor lowers detail by itself when the frame rate drops, and shows a notice with a "Back to
  full quality" button (which turns "Adapt to slow devices" off). Panels widen on big screens.

---

## 8. Editing rules for anything you do add around the game

- Do not touch files under `js/` or `css/` unless the owner gave you a new version of them.
- Do not add dependencies, a bundler step, minification or a framework to the game page.
- Any text you show about the game must be true of the version you have. Do not claim features that are not in it.
- Keep the game working offline and without any network call except the save bridge.
- Keep accessibility: do not remove focus outlines, `aria-label`s, or the "reduced flashing" setting (`calmFlash`).

---

## 9. Checks after every update

1. The page loads with no console errors, and the title screen appears.
2. **Dev panel check** (section 6): none of the listed strings are in the shipped files.
3. `typeof window.GR === 'object'` and `GR.G.state` is a string (the `/play` page depends on it).
4. `typeof window.GRSave === 'object'`; `GRSave.decode(GRSave.encode({a:1})).a === 1`.
5. **Save round trip:** play a moment, reload: progress is still there. Look at localStorage `giraffe_rampage_save_v1`: it
   must start with `"GR2:`.
6. **Old-save test:** put `{"gold":777}` (plain JSON) into that key, reload: the game shows 777 gold, and after any action that
   saves, the key holds the packed form.
7. **Bridge test:** sign in, play, reload on another browser: the cloud save arrives and loads.
8. **Photo test:** open the wardrobe, press Photo, add an effect, Get code, paste it back with Open: the same picture appears.
   Save it to the album, open the album book, click the photo: it opens for editing.
9. **Guide test:** with a brand-new save the Guide lists only the basics; it must not mention Venus, Mars, ants, the city, the
   lab or the squad.
10. Only after all of these pass, tell the owner the update is live, and list anything you changed beyond the files you were
    given (there should be nothing).
