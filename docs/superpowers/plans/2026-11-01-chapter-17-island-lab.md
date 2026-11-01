# Chapter 17: the Island Lab (plan)

The circle on the map in the fort's bunker is a speck in the ocean. She sails there in the fishing boat, wades ashore, and tears through an island
of sea creatures a scientist has mutated. At the end the scientist gets away by helicopter, and the town helicopter picks her up to follow.

Decided with the owners (1 Nov 2026):
- The island has both shore and water: beaches, shallows and tide pools she wades through. Water slows her and hides swimming enemies.
- The enemies are only sea mutants, with no soldiers or machines.
- 25 waves with five bosses, the same size as Chapters 14 to 16. There's no new rule beyond the water.
- The look uses Chapter 4's blues and teals and its water style, on new ground: beaches, reefs, and a lab compound with tanks and pools.
- During boss waves the scientist only shows up behind lab glass or on screens, saying a line or two. She never fights the scientist.
- In the closing film the scientist flies off in a helicopter. Soon after, the town helicopter (from the Domes and Tower films) picks her up and
  follows. The film closes nothing and doesn't announce the end of the game.

## Numbers and ids
- `ISLE_CHAPTER = 18` internally, shown as Chapter 17. `ISLE_WAVES = 25`, waves 411 to 435, with a boss every fifth wave.
- Save: `chapter18Complete`, plus `isleBest` if the run report needs it. Both get defaults in `DEFAULT_SAVE` and sanitizing lines in `Save.load`.
- Difficulty: `ISLE_MUL` and `ISLE_TUNE` work like `FORT_MUL` and `FORT_TUNE`. The table starts a little above the Fort's last wave and climbs
  from there. The numbers are set by hand, written at the top of the file to tweak, and haven't been played.

## The island (the map)
The map runs south to north, so the run moves from the beach to the lab:
1. **Landing beach.** Sand, the moored fishing boat, and driftwood and crates as cover.
2. **Shallows and tide pools.** Shallow water slows her (about 0.8 speed) and leaves ripples and splash. Eel hounds and sea snakes hide under it.
   Deep water at the map's edge can't be crossed.
3. **Reef flats.** Coral heads stand as solid props. At low spots she wades between them.
4. **Mangrove edge.** Roots and palms, the transition to the compound.
5. **The lab compound.** Glass tank houses, holding pools, pipes, a pump house and a helipad. It has solid buildings like the Fort's, but they don't
   have health, because there's no chaos score here.
6. **The flooded tank room.** This is the north end, where the last boss is.

The drawing follows the layer tiers: water and sand in the back picture, props in front, and ripples and splashes in the moving tier. Footsteps
use the existing sand and shallow-water ground sounds.

## The creatures (twelve kinds and five bosses)
They fill the usual Bestiary slots in an `ISLE_KIT`, written the same way as `FORT_KIT`. The four the owners picked are marked ★.

| Slot | Name | What it does |
|---|---|---|
| warthog | ★ Crab Tank | A slow, heavily plated crab. Hits from the front do much less damage, so she has to get behind it. |
| jackal | ★ Eel Hound | Hunts in packs, hides under shallow water until it's close, and moves fast. |
| vulture | ★ Jelly Drifter | Floats over everything and shocks the ground under it in pulses. It splits into two small ones once. |
| cheetah | ★ Urchin Roller | Rolls at her in a straight line and bursts into spines when it hits or dies. |
| grub | Lab Shrimp | Small and quick, and comes in swarms. |
| hyena | Hermit Squatter | A hermit crab wearing a lab barrel as its shell. It's the plain all-rounder. |
| rhino | Barnacle Brute | A huge barnacle-covered walrus-like mutant that charges. |
| baboon | Ink Spitter | An octopus that lobs ink blobs, which leave a cloud that dims the area for a few seconds. |
| honeybadger | Mantis Boxer | A mantis shrimp whose punch sends out a small shockwave. |
| mamba | Sea Snake | Strikes out of the water and retreats again. |
| ember | Puffer Bomber | Swells up when it's near her and bursts. |
| termite | Anemone Nurse | Sits still and heals the creatures near it, so kill it first. |
| lion (415) | **King Claw** | A giant crab with one huge crusher claw. It sweeps and slams. |
| matriarch (420) | **The Stormjelly** | A huge jellyfish that drifts over the pools, rains shocks and drops drifters. |
| buffalo (425) | **Old Hammerhead** | A mutant shark that charges along the shallows, dives under, and comes up behind her. |
| crocodile (430) | **The Leviathan Eel** | A very long eel that circles the reef flats and lunges out of the water. |
| wildfire (435) | **Specimen Zero** | A kraken in the flooded tank room. Its arms come up through the floor grates, and it has an ink phase. |

On each boss wave a lit screen or tank window shows the scientist for a few seconds, with one caption line.

## Films (`js/films/27e-film-island.js`)
1. **Opening film, about 25 s.** The cracked map with the red circle, then the fishing boat at sea in the morning, fog, the island coming out of
   it, the lab's lights, and her wading ashore.
2. **Closing film, about 22 s.** The tank room floods. The scientist runs to the helipad and the helicopter lifts off over the sea. She stands in
   the shallows watching it go. The town helicopter comes in low, she climbs aboard, and the two helicopters head out over the water together.

## Files
New files, in load order:
- `js/island/30g-chapter-island.js`: the chapter table, `ISLE_KIT`, tuning and the wave builder.
- `js/films/27e-film-island.js`: the two films.
- `js/art/35o-art-island.js`: art for the creatures and bosses.
- `js/island/44zzzt-island-map.js`: the map, water zones, wading slowdown and props.
- `js/island/44zzzu-island-ai.js`: behaviours (hiding in water, splitting, rolling, healing) and the boss attacks.
- `js/island/44zzzv-island-detail.js`: ground details, ripples, foam, and the scientist glimpses.

Existing files I'll need to change: `31-waves-update.js` (wave plumbing and the films), the menu chapter card, the Bestiary, the Guide, the HUD
and minimap, the music theme, and `01-core.js` (the save).

## Polish to match Chapters 14 to 16 (owners to confirm)
1. A coat color for finishing the chapter, plus a coat pattern (pattern 18, "Reef scales"). Photo codes take it with no format change.
2. A photo backdrop: the island beach.
3. A minigame, "Tide Pool Dash": cross tide pools between waves of eels. It would give a three-star coat color, like the other late chapters.
4. Achievements: finish the chapter, beat each boss without being hit, and the bonus "never stand in water".

## Steps
1. **Skeleton.** Chapter id, save field, the 25-wave table, menu card and wave plumbing. The chapter can be played with placeholder looks.
2. **The map.** The six zones, water and wading, props, minimap. Screenshots on desktop and phone.
3. **The creatures.** Art and behaviours for the twelve kinds.
4. **The bosses.** The five bosses and the scientist glimpses.
5. **The films.** Opening and closing.
6. **Bestiary, Guide, achievements, music, run report**, plus the polish items the owners keep.
7. **Tests and docs.** Add a `tools/scenarios/island.js` scenario. Add it to `ci-check.sh`, `AGENTS.md` and `QA-GUIDE.md`. Fix the old scenarios that
   count chapters or colors. Update the README and lovable.md rows, run the recount and the gallery sync, and run the full CI.
8. **Branch and PR.** All of it goes on `claude/island-lab` as one pull request, with screenshots. The owners say "merge", then it's packaged for
   Lovable.
