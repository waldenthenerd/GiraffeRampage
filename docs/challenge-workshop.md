# Challenge Workshop (add-on)

Built by Codex on the branch `codex/challenge-builder`, and moved into the game as an **add-on** (id `challenges`): it is off until a player switches it on in **Add-ons**, and then the main menu has a **Challenge Workshop** button and the Guide a topic about it. The code is `js/addons/50a-addon-challenge-data.js`, `50b-addon-challenge-play.js` and `50c-addon-challenge-ui.js` (its stylesheet is inside the last one and is added to the page only when the workshop first opens). Switching the add-on off closes the workshop and any playtest. Nothing is published by this feature; drafts stay in the browser.

What changed in the move: the files and their tests moved to the paths above, the menu button, the action and the Guide topic only appear while the add-on is on, and `css/challenge.css` became part of the UI file. The prototype's screenshots are not carried over.

## Improvements since the move

1. Walkers find their way round walls (a flow field from the giraffe's square), and creatures keep apart instead of stacking on one spot.
2. A walled-off entrance is caught by the recipe check, not mid-playtest; heals show whole numbers.
3. A draft keeps its own id: Save draft updates the open draft, Save as copy makes a new one.
4. A challenge link with the add-on off offers to switch it on (once per visit); with it on, the workshop opens on the level. Nothing plays by itself.
5. The arena draws creatures from the game and her own top-down giraffe in her coat, hat and boots; the arena's simple drawings remain as a fallback.
6. Four more enemy kinds: flyer (vulture, crosses walls), charger (warthog, dashes along a line it shows first), splitter (termite, bursts into three grubs) and badger (honey badger, heals when left alone).
7. The game's sounds, and music: the biome's song during a playtest, harder with a brute or badger out, then the win or loss tune.
8. A controller in the arena (stick or D-pad, Start or B pauses, A retries) and in the workshop (D-pad between controls, left and right change lists and numbers, A press, B close, LB and RB change tab, a cursor on the arena).
9. Drag to move and drag the corner to resize with the Select tool; arrows and Enter on the focused arena place things at a cursor.
10. Tabs (Recipe, Arena, Designs, Waves, Play & share); on a computer the arena sits beside its tools.
11. The arena's ground is drawn once and reused (about 3.4 ms down to 0.24 ms a frame).
12. Short screens (a phone held sideways) get a taller arena in a playtest.

## Detail pass

1. Objects in each biome's own materials: walls (stone, ice blocks with icicles, metal panels, log palisade, adobe, mossy stone, basalt with glowing seams) and hazards (bramble, thin ice, glowing crater, mushroom patch, quicksand, acid bog, lava).
2. Things that move in a playtest: coins spin and glint, heals bob and glow, exits are swirling portals with lamps, banners ripple, trees sway, lava and seams breathe.
3. The arena's rim, and the edges waves come from marked with chevrons and a count; they light up just before a wave arrives from them.
4. Small life by biome and time of day: butterflies, fireflies at night, dust, bubbles and dragonflies, embers, ice glints.
5. Playtest effects: footstep dust, hit sparks and rings, kill puffs in the creature's colour, coin sparkle, heal pluses, a swept kick, thrown seeds with trails, a dash trail, flyers drawn above the walkers with their shadow on the ground, a shake and red edges when hurt, a slow red pulse at low health.
6. A wave ribbon that names what is coming ("3 hyenas from the north · 2 vultures over the walls").
7. An end card with the run's numbers and a gold, silver or bronze medal by health left (the medal is in the result too).
8. No boxes: walls have uneven, rounded outlines, and stone, ice, adobe and mossy walls are packed irregular stones; hazards are uneven patches; the heal pickup is a tied cloth pouch; the exit is a ring of standing stones. Each still fills the same rectangle the game uses for collision, so what you see is what blocks you.
9. Editor: a see-through preview of what you are about to place (red with the reason if it would be refused), erase and select outlines, tool icons painted in the recipe's biome, and creature pictures in the roster and on each wave row.

The notes below are Codex's.

1. Main-menu workshop and an always-available Guide topic.
2. Recipe editor: title, creator, opening message and reproducible seed.
3. Eleven templates, including decorated Dusk garden, Meteor yard, Rainy courier, Snow lanterns, Mushroom forest and Desert signal station.
4. Wave director: up to 12 waves, four groups each, directions, delays, duplication and reordering; 240 enemies per level.
5. Snap-grid arena builder: walls, hazards, coins, exit, healing pickups and decorative trees, rocks and banners; selection, moving, resizing, duplication, coordinate placement, erase/remove, undo/redo (60 edits), 48-object limit. Three layout recipes and an editor-only grid toggle.
6. Clear, survive, collect and escape objectives; three fixed kits, seven biomes, enemy speed/health and player speed/attack-rate modifiers, plus darkness. Cosmetic day/sunset/night, clear/drizzle/snow and scenery detail settings.
7. Independent autoattack arena runtime: four enemy archetypes, keyboard and hold-to-move pointer controls, collision, health, pause, retry and results.
8. Versioned, checksummed Unicode-safe code/link sharing; import/remix without automatic execution.
9. Exact-recipe local-clear sharing gate. Editing revokes it; imported completion is never trusted. Not online anti-cheat verification.
10. Separate browser-local 24-recipe draft shelf; no campaign rewards, save changes or cloud synchronization.
11. Import limits and clearance-aware reachability validation for collectibles/exits.
12. Data/runtime unit suites and integrated browser regression scenario.
13. Shared deterministic editor/playtest arena painter: textured terrain, shadows, detailed props, weather and improved creature silhouettes. A scene preview never consumes the combat random stream.
14. Authoritative kit-stat preview, objective hints, enemy role descriptions, rough composition budget and three quick-wave presets (Swarm, Ambush, Brute finale). Budget is not a measured difficulty rating.
15. Seven arena biomes: savanna, arctic, moon, forest, desert, swamp and volcanic. Biome, autumn, pastel, dusk and custom palettes affect the arena, not the original game's brown/gold interface.
16. Custom ground/accent/foliage colors and a layered custom-object designer. Up to eight reusable named designs with twelve rectangle/ellipse/triangle layers each; layers have their own dimensions, position, rotation and color. Definitions travel with the level code.
17. Custom objects are decorative by default. An optional solid setting blocks movement and attacks with the object's **entire rectangular bounds**, regardless of painted transparent space. The same bounds are used for spawn and reachability validation. Custom definitions contain validated shape data only, never scripts or remote assets.
18. Shape fill opacity and outline color/width; duplicate, center and horizontal-mirror actions, transparency checkerboard, and Lantern/Crate/Crystal starter designs. Mirroring/centering edits shape geometry; the checkerboard is editor-only and does not revoke a local clear.
19. Live recipe validation with specific errors, palette swatches and biome-color copying, selected-object semantics, authoritative enemy stats, per-wave summaries, and export code length/readiness.
20. More detailed biome terrain and prop materials, health/objective bars, wave/countdown banners, capped fading damage/pickup labels, and results with healing/health/wave totals. Presentation does not consume combat randomness or change balance.

## Tests

`node tools/challenge-data-test.mjs` — recipe/codec/library validation.

`node tools/challenge-play-test.mjs` — fixed-step combat, objectives, input, pauses, collision, cleanup and save isolation.

`node tools/qa-cloud.mjs tools/scenarios/challenge-builder.js --wait 60000 --shot workshop.png` — integrated DOM scenario; it also checks that with the add-on off there is no trace of it. Repeat at `--w 390 --h 844 --touch` and `--w 844 --h 390 --touch`.

`bash tools/ci-check.sh` runs both unit suites and the scenario on desktop and both phone sizes.
