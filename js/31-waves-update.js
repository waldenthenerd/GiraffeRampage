'use strict';
/* Banners, the wave director, entity updates, the main update. */
/* ========================= 21. BANNERS ========================= */
function banner(title, sub, color, dur){
  if (G.introFX){ G.bannerHold = { title: title, sub: sub, color: color, dur: dur, wait: 0.45 }; return; }      /* the chapter card finishes first, then the wave banner follows after a short pause */
  G.banner = { title: title, sub: sub || '', color: color || '#F2B33D', t: 0, dur: dur || 2.0 };
}

/* ========================= 22. WAVE DIRECTOR ========================= */
const WAVE_FLAVOUR = [
  'The herd has noticed you', 'Something faster is coming', 'They travel in numbers now',
  'Heavy hooves on the horizon', '', 'Scavengers circle overhead',
  'The savanna is awake', 'A jackal pack falls in behind you', 'No more stragglers',
  '', 'The dust never settles', 'A warthog breaks from the tree line',
  'They hunt in earnest now', 'Something is watching from the branches', '',
  'The pack thins, but grows bolder', 'A low growl you have not heard before', '',
  'The savanna holds its breath', '', 'Every shadow moves',
  'The ground itself feels uneasy', 'A snake in the grass', 'The air tastes like smoke',
  ''
];
const WAVE_FLAVOUR_SNOW = [
  'The wind turns and it is bitter', 'Something moves under the snow', 'Tracks in the frost, more than one set',
  'The cold gets into everything', '', 'Pale shapes circle at a distance',
  'The frost is thicker here', 'A frost jackal pack falls in behind you', 'The snow does not slow them down',
  '', 'Ice crunches with every step now', 'A frost warthog breaks from the drift',
  'They hunt in earnest, cold or not', 'Something pale watches from the ridge', '',
  'The pack thins, but grows bolder still', 'A frozen growl carries far', '',
  'The blizzard holds its breath', '', 'Every drift out there could be moving',
  'The ice itself is groaning', 'A pale shape coils in the snow', 'The air burns cold to breathe',
  ''
];
const WAVE_FLAVOUR_SWAMP = [
  'The swamp has noticed you', 'Something slips closer through the reeds', 'They move in numbers through the mud',
  'Heavy footfalls sink into the mire', '', 'Insects rise off the water in a cloud',
  'The marsh is wide awake', 'A jackal pack wades in behind you', 'No more stragglers',
  '', 'The mud never lets go', 'A warthog crashes out of the reeds',
  'They hunt in earnest, mud or not', 'Something is watching from the mangroves', '',
  'The pack thins, but grows bolder still', 'A low croak carries across the water', '',
  'The marsh holds its breath', '', 'Every ripple could be something',
  'The ground itself feels unstable', 'A shape coils beneath the surface', 'The air hangs thick and rotten',
  ''
];
const WAVE_FLAVOUR_OCEAN = [
  'The open water has noticed you', 'Something cuts closer through the current', 'They move in numbers beneath the waves',
  'The current pulls harder now', '', 'Gulls circle low over the swell',
  'The sea is wide awake', 'A jackal pack cuts through the water behind you', 'No more stragglers',
  '', 'The current never lets go', 'A warthog crashes up through the surf',
  'They hunt in earnest, tide or not', 'Something is watching from below', '',
  'The pack thins, but grows bolder still', 'A low call carries across the swell', '',
  'The sea holds its breath', '', 'Every wave could be something',
  'The water itself feels unsteady', 'A shape circles just beneath the surface', 'The air tastes of salt and static',
  ''
];
const WAVE_FLAVOUR_JUNGLE = [
  'The canopy closes overhead', 'Something rustles high in the branches', 'Hooves drum through the undergrowth',
  'A herd of peccaries is on the move', '', 'The air is thick and humming',
  'Spotted shapes pace between the trunks', 'Leafcutters march in endless lines', 'Nothing here is harmless',
  '', 'A howl rolls through the treetops', 'The ground shakes under something heavy',
  'Bright colours mean poison here', 'Eyes glint from every shadow', '',
  'The forest hunts in shifts', 'A great wingbeat passes overhead', '',
  'Even the leaves feel hostile', '', 'The river runs black and still',
  'The whole forest is against you', 'Something vast is coiling in the dark', 'The canopy holds its breath',
  ''
];
const WAVE_FLAVOUR_CITY = [
  'The city is empty. Almost.', 'Something is rummaging through the bins', 'A stray pack spills out of an alley',
  'Pigeons scatter off every ledge', '', 'Rotor noise over the rooftops',
  'The rats have come up from the drains', 'A coyote trots down the middle of the freeway', 'Tracks on the asphalt',
  '', 'Engines rumble somewhere downtown', 'Loudspeakers crackle: this area is restricted',
  'Something heavy is rolling up Main Street', 'The grackles will not stop shrieking', '',
  'They are herding you toward the bayou', 'A searchlight sweeps the plaza', '',
  'The whole city holds its breath', '', 'Every window is watching',
  'The ground shakes under a column of armour', 'Something big is circling overhead', 'The air smells of jet fuel',
  ''
];
const BOSS_SEQUENCE = ['lion', 'matriarch', 'buffalo', 'crocodile', 'wildfire'];
const BOSS_INTRO = {
  lion: 'The pride has arrived',
  matriarch: 'The ground trembles with every step',
  buffalo: 'Something enormous just snapped a tree in half',
  crocodile: 'The watering hole has gone still',
  wildfire: 'The horizon is turning orange'
};
const BOSS_INTRO_FROST = {
  lion: 'Something huge and white pads out of the blizzard',
  matriarch: 'The ice groans under a mountain of blubber and tusk',
  buffalo: 'Antlers wider than a tree crash through the drifts',
  crocodile: 'A spiral tusk punches up through the frozen river',
  wildfire: 'A great white owl drops silently out of the storm'
};
const BOSS_INTRO_SWAMP = {
  lion: 'A tawny shape slips between the cypress knees',
  matriarch: 'Something black and heavy is rooting through the reeds',
  buffalo: 'A shell like a boulder drags itself out of the mud',
  crocodile: 'Two eyes rise out of the black water',
  wildfire: 'The whine of a million wings fills the air'
};
const BOSS_INTRO_JUNGLE = {
  lion: 'Two green eyes open in the darkness',
  matriarch: 'A shadow with a seven-foot wingspan blots out the sun',
  buffalo: 'Something armoured is tearing through the roots',
  crocodile: 'The black river ripples, then rises',
  wildfire: 'The air turns sickly gold and bitter'
};
const WAVE_FLAVOUR_INFERNO = [
  'The fire has teeth now', 'Imps pour out of the cracks', 'Swords of slag', 'The ground opens and closes',
  '', 'Hoppers drop out of the smoke', 'Rams lower their horns', 'Cocoons split open', 'The air hums with whirling blades',
  '', 'Something moves under the rock', 'Shamans chant over the wounded', 'Serpents of smoke slip past', 'Beetles tick as they run',
  '', 'Everything is coming at once', 'The heat has a pulse', 'Chargers circle in the ash', 'Nothing out here is gentle',
  '', 'Closer, always closer', 'Hold the line at the base', 'The Sovereign draws near', 'The whole Inferno rises',
  ''
];
const BOSS_INTRO_INFERNO = {
  lion: 'Pyroclast the Tyrant roars the Inferno awake',
  matriarch: 'Mother Magma heaves herself up',
  buffalo: 'The Obsidian Rampager lowers its horns',
  crocodile: 'The Lava Leviathan surfaces',
  wildfire: 'The Inferno Sovereign rises from the fire'
};
const WAVE_FLAVOUR_VENUS = [
  'The ground is on fire', 'Something crawls out of the lava', 'Marines and aliens, side by side', 'Pyrax wants a word',
  '', 'Fire leaps between the rocks', 'Spear fiends circle in the haze', 'Cinder brawlers come in swinging',
  'Ember priests tend the wounded', '', 'Totems rise on the ridge', 'Smoke that walks',
  'Obsidian walls advance', 'The Marines are outnumbered and angry', '', 'Pyre crushers roar in',
  'Spore imps scatter with lit fuses', 'The eggs keep falling', 'The heat is getting personal', '',
  'Your base is the only safe place left', 'The Colossus is waking', 'The Maelstrom is turning', 'The Queen is coming',
  ''
];
const BOSS_INTRO_VENUS = {
  lion: 'Pyrax the Warlord rallies his burning horde',
  matriarch: 'The Pyre Seer calls fire down from the sky',
  buffalo: 'The Magma Colossus hauls itself out of the ground',
  crocodile: 'The Maelstrom pulls the air in',
  wildfire: 'The Inferno Queen rises from the lava'
};
const WAVE_FLAVOUR_MOON = [
  'They want their rocket back', 'Earth is not amused', 'Marines drop in over the horizon', 'Sergeant Vex has a lot to say',
  '', 'Jump troopers leap the craters', 'Lancers circle the ridge', 'The Marines are digging in',
  'Field medics patch up the line', '', 'Sentry turrets go up on the ridge', 'Something is cloaked out there',
  'Shock troopers come in swinging', 'Riot shields advance in a wall', '', 'Siege breakers pound the ground',
  'Breachers run with lit fuses', 'Every pod on the transport is empty', 'The fleet is in orbit and watching', '',
  'Nowhere left to retreat', 'The Colossus is almost here', 'A warship is coming down', 'The Admiral is on the line',
  ''
];
const BOSS_INTRO_MOON = {
  lion: 'Drill Sergeant Vex drops in, and he is not happy',
  matriarch: 'Captain Reyes calls down the sky',
  buffalo: 'A walking tank lands with a crack that shakes the Moon',
  crocodile: 'Space itself starts to bend',
  wildfire: 'Fleet Admiral Kestrel brings the flagship down'
};
const WAVE_FLAVOUR_SPACE = [
  'The gates of the Johnson Space Center', 'Sirens sound across the campus', 'Robot dogs pour out of the motor pool',
  'Scout rovers sweep the lawns', '', 'Drones lift off from the rooftops',
  'Hover bikes streak between the buildings', 'The rocket stands untouched on its pad', 'Reinforcements arrive by convoy',
  '', 'Sentry walkers take up positions', 'Something slithers out of a vent',
  'The force keeps growing', 'Swarm carriers roll in from the highway', '',
  'Hover tanks crest the hill', 'Every hangar is emptying', 'The whole base is mobilised',
  'Nothing is getting near that rocket', '', 'Reaper drones circle overhead',
  'The perimeter has collapsed. They keep coming', 'Plasma drones light up the dusk', 'Something enormous is powering up',
  ''
];
const BOSS_INTRO_SPACE = {
  lion: 'The ground shakes -- the Titan is walking',
  matriarch: 'A black shape slides silently over the launch site',
  buffalo: 'A railgun is charging beyond the tree line',
  crocodile: 'Four legs the size of buses stride onto the lawn',
  wildfire: 'The sky darkens under a flying fortress'
};
const BOSS_INTRO_CITY = {
  lion: 'A spiked collar glints in the mouth of an alley',
  matriarch: 'The rooftops shake to the thump of heavy rotors',
  buffalo: 'Seventy tons of armour turns onto your street',
  crocodile: 'Something ancient climbs out of Buffalo Bayou',
  wildfire: 'A low, rising roar -- the Warthog is making its run'
};
const BOSS_INTRO_OCEAN = {
  lion: 'A dorsal fin cuts a straight line toward you',
  matriarch: 'The sea swells as something vast surfaces',
  buffalo: 'A black-and-white shape is hunting from below',
  crocodile: 'Arms as long as a ship uncurl from the deep',
  wildfire: 'A single light bobs in the darkness below'
};
function bossForWave(w){
  if (chapterOf(w) === DOME_CHAPTER) return chapterWaveOf(w) >= DOME_WAVES ? 'iceheart' : 'thawed';          /* Chapter 13.5's two bosses */
  const cw = chapterWaveOf(w);
  const idx = Math.floor(cw / 5) - 1;
  return BOSS_SEQUENCE[Math.max(0, Math.min(BOSS_SEQUENCE.length - 1, idx))];
}

/* Three chapters, 25 waves each. Chapters 2 and 3 reuse the exact same
   wave-1-25 curve shape (proven and tuned) rather than letting the
   difficulty formula run unbounded to wave 75 -- the harder feel comes
   from each chapter's own boosted enemy stats plus the richer pool
   that's unlocked by then. */
const WAVES_PER_CHAPTER = 25;
/* Wave pace (js/44s-wave-pace.js has the rest): every wave has 40% fewer enemies, arriving at the same rate, so a wave is 40% shorter at the same pressure.
   Each enemy that is left is worth 1/0.6 as much (experience, score and the chance of a drop; see killEnemy), so a wave pays what it always did. */
const WAVE_COUNT_MUL = 0.6;
const KILL_VALUE = 1 / WAVE_COUNT_MUL;
const WAVE_INTRO_S = 0.8, WAVE_CLEAR_S = 1.0, WAVE_PATIENCE_S = 6;      /* were 1.6, 2.1 and 11 */
/* Chapters 1 to 13 are 25 waves each. Internal chapter 14 is the mini-chapter shown as "13.5" (the Domes): ten waves, 326 to 335, with a boss on 330 and 335.
   A chapter after it starts at wave 336; CHAPTER_LABEL is the name the player sees. */
const TOTAL_CHAPTERS = 14;
const MAIN_CHAPTERS = 13, DOME_CHAPTER = 14, DOME_FIRST_WAVE = WAVES_PER_CHAPTER * MAIN_CHAPTERS + 1, DOME_WAVES = 10;
const CHAPTER_LAST_WAVE = DOME_FIRST_WAVE + DOME_WAVES - 1;
const CHAPTER_LABEL = { 14: '13.5' };
function chapterLabel(ch){ return CHAPTER_LABEL[ch] || String(ch); }
function chapterOf(w){ return w >= DOME_FIRST_WAVE ? DOME_CHAPTER : Math.ceil(w / WAVES_PER_CHAPTER); }
function chapterWaveOf(w){ return w >= DOME_FIRST_WAVE ? w - DOME_FIRST_WAVE + 1 : ((w - 1) % WAVES_PER_CHAPTER) + 1; }
function chapterLen(ch){ return ch === DOME_CHAPTER ? DOME_WAVES : WAVES_PER_CHAPTER; }
function chapterFirstWave(ch){ return ch >= DOME_CHAPTER ? DOME_FIRST_WAVE : (ch - 1) * WAVES_PER_CHAPTER + 1; }
function isChapterFinaleWave(w){ return chapterWaveOf(w) === chapterLen(chapterOf(w)); }

function buildWave(w){
  const q = [];
  const isBoss = (w % 5 === 0);
  let budget = Math.round((5 + w * 1.9 + Math.pow(w, 1.42) * 0.45) * 1.5);
  if (isBoss) budget = Math.round(budget * 0.55);
  budget = Math.min(budget, 135);
  const ch5 = chapterOf(w) >= 5;
  if (ch5) budget = Math.round(budget * 1.44);  /* the rainforest swarms */
  /* Chapter 7: the military keeps reinforcing. The base budget stops growing
     around wave 60, so the chapter ramps its own -- 20% larger than Houston's
     waves at the start, up to ~70% larger by the final wave. */
  const ch7 = chapterOf(w) === 7, ch8 = chapterOf(w) >= 8;
  if (ch7) budget = Math.round(budget * (1.2 + 0.021 * (chapterWaveOf(w) - 1)));
  if (ch8) budget = Math.round(budget * (chapterOf(w) >= 10 ? 1.45 + 0.013 * (chapterWaveOf(w) - 1) : chapterOf(w) >= 9 ? 1.3 + 0.012 * (chapterWaveOf(w) - 1) : 1.15 + 0.011 * (chapterWaveOf(w) - 1)));   /* fewer, smarter enemies than the machine army; Venus sends a few more */
  if (ch8 && chapterWaveOf(w) <= 5) budget = Math.round(budget * 0.5);   /* a gentle start to Chapters 8 and 9: half the enemies for the first five waves, so there is time to pick up some cards */
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));               /* shorter waves: fewer enemies at the same rate (the kills are worth more, see KILL_VALUE) */
  if (chapterOf(w) === DOME_CHAPTER) return buildDomeWave(w, isBoss);        /* Chapter 13.5 builds its own waves (js/30a-chapter-domes.js) */

  const pool = [];
  const add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); };
  add('hyena', 10);
  add('cheetah', w >= 2 ? 4 + w * 0.25 : 0);
  add('termite', w >= 3 ? 3.5 + w * 0.15 : 0);
  add('rhino',   w >= 4 ? 1.6 + w * 0.15 : 0);
  add('vulture', w >= 6 ? 3.0 + w * 0.13 : 0);
  add('jackal',      w >= 7  ? 2.6 + w * 0.14 : 0);
  add('warthog',     w >= 9  ? 1.4 + w * 0.13 : 0);
  add('baboon',      w >= 12 ? 2.0 + w * 0.12 : 0);
  add('honeybadger', w >= 16 ? 1.1 + w * 0.10 : 0);
  add('mamba',       w >= 19 ? 1.6 + w * 0.11 : 0);
  if (ch8){                                   /* the Marines' own mix: mostly riflemen, with specialists phasing in as the chapter goes on */
    pool.length = 0; const cw = chapterWaveOf(w), g = cw * 0.1;
    add('hyena', 5.6); add('sword', 8 + g); add('cheetah', cw >= 2 ? 5 + g : 0); add('ember', cw >= 3 ? 3.2 + g : 0); add('rhino', cw >= 3 ? 4 + g : 0);
    add('termite', cw >= 4 ? 3 + g * 0.6 : 0); add('vulture', cw >= 4 ? 4.5 + g : 0); add('jackal', cw >= 2 ? 7 + g : 0); add('grub', cw >= 7 ? 2 + g * 0.5 : 0);
    add('warthog', cw >= 8 ? 2.4 + g * 0.5 : 0); add('baboon', cw >= 9 ? 2.4 + g * 0.5 : 0); add('honeybadger', cw >= 6 ? 3.2 + g * 0.6 : 0); add('mamba', cw >= 13 ? 3 + g * 0.5 : 0);
  }
  if (chapterOf(w) >= 10){                                      /* the Inferno: nearly all of it fights up close; only two types shoot */
    pool.length = 0; const cw = chapterWaveOf(w), g = cw * 0.1;
    add('hyena', 14); add('sword', 9); add('cheetah', cw >= 2 ? 5 + g : 0); add('rhino', cw >= 3 ? 4 + g : 0); add('ember', cw >= 3 ? 3.4 + g : 0);
    add('termite', cw >= 4 ? 3 + g * 0.6 : 0); add('vulture', cw >= 4 ? 4.5 + g : 0); add('jackal', cw >= 5 ? 4 + g : 0);
    add('honeybadger', cw >= 6 ? 3.2 + g * 0.6 : 0); add('baboon', cw >= 8 ? 2.2 + g * 0.5 : 0); add('mamba', cw >= 9 ? 3 + g * 0.5 : 0);
    add('warthog', cw >= 3 ? 3.9 + g * 0.4 : 0); add('grub', cw >= 6 ? 2.6 + g * 0.4 : 0);
  }
  if (chapterOf(w) >= 12){                                      /* Area 51: soldiers, the Marines' mix with the security forces' own kit */
    pool.length = 0; const cw = chapterWaveOf(w), g = cw * 0.1;
    add('hyena', 7); add('sword', 6 + g); add('cheetah', cw >= 2 ? 5 + g : 0); add('rhino', cw >= 3 ? 4 + g : 0); add('jackal', cw >= 2 ? 6 + g : 0);
    add('termite', cw >= 4 ? 2.6 + g * 0.6 : 0); add('vulture', cw >= 4 ? 4 + g : 0); add('grub', cw >= 6 ? 2.4 + g * 0.5 : 0); add('ember', cw >= 5 ? 2.8 + g : 0);
    add('warthog', cw >= 7 ? 2.4 + g * 0.5 : 0); add('baboon', cw >= 8 ? 2.4 + g * 0.5 : 0); add('honeybadger', cw >= 6 ? 3.2 + g * 0.6 : 0); add('mamba', cw >= 11 ? 3 + g * 0.5 : 0);
  } else if (chapterOf(w) >= 11){                                      /* the Changed Savannah: Chapter 1's creatures, in Chapter 1's order */
    pool.length = 0; const w1 = chapterWaveOf(w);
    add('hyena', 10); add('cheetah', w1 >= 2 ? 4 + w1 * 0.25 : 0); add('termite', w1 >= 3 ? 3.5 + w1 * 0.15 : 0); add('rhino', w1 >= 4 ? 1.6 + w1 * 0.15 : 0);
    add('vulture', w1 >= 6 ? 3.0 + w1 * 0.13 : 0); add('jackal', w1 >= 7 ? 2.6 + w1 * 0.14 : 0); add('warthog', w1 >= 9 ? 1.4 + w1 * 0.13 : 0); add('baboon', w1 >= 12 ? 2.0 + w1 * 0.12 : 0);
    add('honeybadger', w1 >= 16 ? 1.1 + w1 * 0.10 : 0); add('mamba', w1 >= 19 ? 1.6 + w1 * 0.11 : 0);
  }
  if (chapterOf(w) === 13){                                      /* Mars: dust aliens alone for 15 waves, then the Marines come and the dust aliens turn on them */
    const cw13 = chapterWaveOf(w);
    if (cw13 > MARS_SWITCH_WAVE) return buildMarsWar(w, budget, isBoss);
    pool.length = 0; marsDustPool(cw13).forEach(p => pool.push(p));
  }
  let total = 0;
  for (let i = 0; i < pool.length; i++) total += pool[i].w;

  const gap = Math.max(ch8 ? 0.1 : ch7 ? 0.08 : ch5 ? 0.1 : 0.14, (0.52 - w * 0.015) * (ch5 ? 0.75 : 1));
  let t = 0.3;
  for (let i = 0; i < budget; i++){
    let r = Math.random() * total, type = pool[0].t;
    for (let k = 0; k < pool.length; k++){ r -= pool[k].w; if (r <= 0){ type = pool[k].t; break; } }
    q.push({ type: type, t: t });
    t += gap * rand(0.55, 1.5);
    if (Math.random() < 0.16) t += rand(0.3, 0.9);
  }
  if (isBoss) q.push({ type: bossForWave(w), t: 1.4, boss: true });
  q.sort((a, b) => a.t - b.t);
  return q;
}

function spawnPoint(){
  const viewR = hyp(G.W / G.zoom, G.H / G.zoom) * 0.5 + 80;
  for (let i = 0; i < 16; i++){
    const a = Math.random() * TAU, d = viewR * rand(1.0, 1.2);
    const x = clamp(P.x + Math.cos(a) * d, 34, ARENA_W - 34);
    const y = clamp(P.y + Math.sin(a) * d, 34, ARENA_H - 34);
    if (hyp(x - P.x, y - P.y) > viewR * 0.86) return { x: x, y: y };
  }
  const a = Math.random() * TAU;
  return { x: clamp(P.x + Math.cos(a) * 520, 34, ARENA_W - 34), y: clamp(P.y + Math.sin(a) * 520, 34, ARENA_H - 34) };
}

function startWave(n){
  G.wave = n;
  G.chapter = chapterOf(n);
  G.spawnQueue = buildWave(n);
  if (G.runSpeedLevel === 2) for (let i = 0; i < G.spawnQueue.length; i++) G.spawnQueue[i].t *= HYPER_CLUSTER;      /* hyperspeed: the same wave, arriving much closer together */
  if (G.runSpeedLevel === 3 && G.spawnQueue.length > 2){                 /* ultrafast: the whole wave arrives in 2-5 short bursts */
    const q = G.spawnQueue, n = q.length, bursts = 2 + Math.floor(Math.random() * 4), span = Math.max(2.6 * (bursts - 1), (q[n - 1].t || 4) * 0.35);
    const when = []; for (let b = 0; b < bursts; b++) when.push(0.3 + span * (b / (bursts - 1)));
    for (let i = 0; i < n; i++){
      if (q[i].boss) continue;                                          /* a boss keeps its own entrance */
      const b = Math.min(bursts - 1, Math.floor(i * bursts / n));
      q[i].t = when[b] + Math.random() * 0.7;
    }
    q.sort(function(a, c){ return a.t - c.t; });
  }  G.spawnTimer = 0;
  G.waveState = 'intro';
  G.waveTimer = WAVE_INTRO_S;
  G.waveOver = 0;
  G.hunt = 0;
  const isBossWave = (n % 5 === 0);
  const bossType = isBossWave ? bossForWave(n) : null;
  const cw = chapterWaveOf(n);
  const flavArr = G.chapter === DOME_CHAPTER ? WAVE_FLAVOUR_DOME : G.chapter === 13 ? (cw > MARS_SWITCH_WAVE ? WAVE_FLAVOUR_MARS_WAR : WAVE_FLAVOUR_MARS) : G.chapter === 12 ? WAVE_FLAVOUR_A51 : G.chapter === 11 ? WAVE_FLAVOUR_GLIM : G.chapter === 10 ? WAVE_FLAVOUR_INFERNO : G.chapter === 9 ? WAVE_FLAVOUR_VENUS : G.chapter === 8 ? WAVE_FLAVOUR_MOON : G.chapter === 7 ? WAVE_FLAVOUR_SPACE : G.chapter === 6 ? WAVE_FLAVOUR_CITY : G.chapter === 5 ? WAVE_FLAVOUR_JUNGLE : G.chapter === 4 ? WAVE_FLAVOUR_OCEAN : G.chapter === 3 ? WAVE_FLAVOUR_SWAMP : G.chapter === 2 ? WAVE_FLAVOUR_SNOW : WAVE_FLAVOUR;
  const introMap = G.chapter === DOME_CHAPTER ? BOSS_INTRO_DOME : G.chapter === 13 ? BOSS_INTRO_MARS : G.chapter === 12 ? BOSS_INTRO_A51 : G.chapter === 11 ? BOSS_INTRO_GLIM : G.chapter === 10 ? BOSS_INTRO_INFERNO : G.chapter === 9 ? BOSS_INTRO_VENUS : G.chapter === 8 ? BOSS_INTRO_MOON : G.chapter === 7 ? BOSS_INTRO_SPACE : G.chapter === 6 ? BOSS_INTRO_CITY : G.chapter === 5 ? BOSS_INTRO_JUNGLE : G.chapter === 4 ? BOSS_INTRO_OCEAN : G.chapter === 3 ? BOSS_INTRO_SWAMP : G.chapter === 2 ? BOSS_INTRO_FROST : BOSS_INTRO;
  const flav = bossType ? (introMap[bossType] || 'Something big is coming')
                        : (flavArr[Math.min(flavArr.length - 1, cw - 1)] || 'The wilds keep coming');
  const title = isChapterFinaleWave(n) ? 'CHAPTER FINALE' : ('WAVE ' + n);
  const hostiles = G.chapter === 7 ? ' \u00b7 ' + G.spawnQueue.length + ' hostiles inbound' : '';   /* the growing force, made visible */
  banner(title, flav + hostiles, bossType ? '#CF4433' : '#F2B33D', 2.1);
  if (bossType) SFX.boss(); else SFX.wave();
  saveRunNow();
}

function updateWaves(dt){
  if (G.attract){ attractSpawn(dt); return; }
  if (G.waveState === 'intro'){
    G.waveTimer -= dt;
    if (G.waveTimer <= 0){ G.waveState = 'active'; G.spawnTimer = 0; }
    return;
  }
  if (G.waveState === 'active'){
    G.spawnTimer += dt;
    /* an empty field is waiting for nothing: bring the next arrival forward (the pressure is the same, only the waiting goes) */
    if (G.spawnQueue.length && G.enemies.length === 0){ const gapT = G.spawnQueue[0].t - G.spawnTimer; if (gapT > 0.45) G.spawnTimer += gapT - 0.15; }
    let guard = 0;
    while (G.spawnQueue.length && G.spawnQueue[0].t <= G.spawnTimer && guard++ < 12){
      const s = G.spawnQueue[0];
      const p = spawnPoint();
      if (s.ally){ G.spawnQueue.shift(); const aa = Math.random() * TAU, ad = rand(240, 440); spawnDustAlly(s.type, clamp(P.x + Math.cos(aa) * ad, 40, ARENA_W - 40), clamp(P.y + Math.sin(aa) * ad, 40, ARENA_H - 40)); continue; }          /* Mars, waves 16-25: the dust aliens fighting on the giraffe's side of the field */
      const e = spawnEnemy(s.type, p.x, p.y, G.wave);
      if (!e) break;                       /* at the cap: hold the queue until room frees up */
      G.spawnQueue.shift();
      burstParticles(p.x, p.y, 5, '#6B5B45', 120, 3);
      if (s.boss){
        screenFlash('#CF4433', 0.3, 0.55); addShake(16);
        if (!startBossIntro(e)) banner(e.def.title, 'Kill it before it kills you', '#CF4433', 2.4);     /* the entrance card replaces the banner */
      }
    }
    /* Once the wave has finished spawning, it resolves either by clearing the
       field or by running out of patience. Stragglers roll into the next wave,
       and the longer you stall the faster the herd moves. Every chapter's
       final wave has no patience clock at all -- its boss has to actually go
       down before the wave will resolve. */
    if (!G.spawnQueue.length){
      const finale = isChapterFinaleWave(G.wave);
      G.waveOver += dt;
      G.hunt = clamp((G.waveOver - 1) / 5, 0, 1);
      if (G.hunt > 0 && !G.huntWarned && G.enemies.length){
        G.huntWarned = true;
        addText(P.x, P.y - 58, 'The herd is closing in', '#E8604A', 17, false);
      }
      const domeBossDown = finale && G.chapter === DOME_CHAPTER && !G.bossAlive;     /* the Domes end the moment the Ice Heart falls: whatever is left of the crowd goes with it */
      if (domeBossDown) G.enemies.forEach(e => { if (!e.dead){ burstParticles(e.x, e.y, 8, e.blood || '#9AE8FF', 160, 4); e.dead = true; } });
      if (G.enemies.length === 0 || domeBossDown || (!finale && G.waveOver > WAVE_PATIENCE_S)){
        G.waveState = 'clear';
        G.waveTimer = WAVE_CLEAR_S;
        G.hunt = 0; G.huntWarned = false;
        const cleared = G.enemies.length === 0 || domeBossDown;
        /* A boss that outlasts the patience timer on a non-finale wave must
           not be allowed to wander on into later waves -- otherwise it can
           still be alive when the NEXT boss wave's boss spawns, and they
           stack indefinitely. It leaves the field without a kill reward,
           the same way ordinary stragglers are simply left behind. */
        if (!cleared && G.bossAlive && G.boss){
          const b = G.boss;
          burstParticles(b.x, b.y, 14, b.blood || '#8E3B2B', 200, 5);
          b.dead = true;
          G.bossAlive = false; G.boss = null;
        }
        const bonus = G.wave * 260 * (cleared ? 1 : 0.4);
        G.score += Math.round(bonus);
        addText(P.x, P.y - 58, (cleared ? 'Wave clear  +' : 'Wave survived  +') + fmt(bonus), '#F2B33D', 20, true);
        /* Guaranteed gem income per wave. Kill-drops alone left a new player
           earning ~1 gem a run, which deadlocked the gear that the harder
           difficulty depends on. Scaling with wave keeps deep runs worthwhile. */
        const waveGems = (chapterOf(G.wave) >= 9 && chapterOf(G.wave) <= 10) ? 0 : Math.max(1, Math.round(G.wave * (cleared ? 1 : 0.5)));   /* no gems on Venus */
        G.runGems = (G.runGems | 0) + waveGems;
        if (waveGems > 0) addText(P.x, P.y - 34, '+' + waveGems + ' gems', '#9AE8FF', 16, false);
        waveClearFX();                                  /* a chime and a ring of light, and the drops come to her (44b-feedback.js) */
      }
    }
  } else if (G.waveState === 'clear'){
    G.waveTimer -= dt;
    if (G.waveTimer <= 0){
      marsClearAllies();
      if (isRunEnd(G.wave)){ if (G.chapter === DOME_CHAPTER) startCutscene(function(){ marsRestoreHUD(); chapterComplete(); }, false, 'domeout'); else chapterComplete(); }       /* the last chapter's own film, then the report */
      else if (isChapterFinaleWave(G.wave)) finishChapter();
      else if (G.chapter === 13 && chapterWaveOf(G.wave) === MARS_SWITCH_WAVE && !G.marsShipsSeen){      /* the Marine ships come down: a short film, then the war */
        G.marsShipsSeen = true; saveRunAtBoundary(true); startCutscene(function(){ marsRestoreHUD(); startWave(G.wave + 1); }, false, 'mships');
      }
      else startWave(G.wave + 1);
    }
  }
}

/* ========================= 23. ENTITY UPDATES ========================= */
const MAX_ZONES = 90;

function updateProjectiles(dt){
  const ps = G.projectiles;
  for (let i = ps.length - 1; i >= 0; i--){
    const p = ps[i];
    p.life -= dt;
    if (p.homing){
      const t = nearestEnemy(p.x, p.y, 420, p.hit);
      if (t){
        const want = Math.atan2(t.y - p.y, t.x - p.x);
        const cur = Math.atan2(p.vy, p.vx);
        const na = cur + clamp(angDiff(want, cur), -p.homing * dt, p.homing * dt);
        const sp = hyp(p.vx, p.vy);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += dt * 14;
    if (p.trail && Math.random() < dt * 40)
      addParticle(p.x, p.y, rand(-16, 16), rand(-16, 16), p.r * 0.6, 0.22, p.color, { drag: 3 });

    let gone = p.life <= 0 || p.x < 0 || p.y < 0 || p.x > ARENA_W || p.y > ARENA_H;
    if (!gone && G.buildings && G.buildings.length){ const hb = buildingAt(p.x, p.y); if (hb){ damageBuilding(hb, p.dmg, 'proj'); gone = true; } }
    if (!gone){
      const near = enemiesNear(p.x, p.y, p.r + 40);
      for (let k = 0; k < near.length; k++){
        const e = near[k];
        if (e.dead || p.hit.has(e)) continue;
        const dx = e.x - p.x, dy = e.y - p.y, rr = e.r + p.r;
        if (dx * dx + dy * dy > rr * rr) continue;
        p.hit.add(e);
        dmgSrc = p.src || 'other'; damageEnemy(e, p.dmg, { kb: p.kb, kbAngle: Math.atan2(p.vy, p.vx), color: p.color, burn: p.burn });
        burstParticles(p.x, p.y, 5, p.color, 160, 3);
        if (p.pierce > 0) p.pierce--;
        else { gone = true; }
        break;
      }
    }
    if (gone){
      if (p.explode){                                                                   /* explosive acid: it bursts, hurting everything near where it landed */
        const near = enemiesNear(p.x, p.y, p.explode.r + 40, []);
        for (let k = 0; k < near.length; k++){ const q = near[k]; if (q.dead || hyp(q.x - p.x, q.y - p.y) > p.explode.r + q.r) continue; dmgSrc = p.src || 'other'; damageEnemy(q, p.explode.dmg, { kb: 140, kbAngle: Math.atan2(q.y - p.y, q.x - p.x), color: p.color, noCrit: true, quiet: true }); }
        addShock(p.x, p.y, p.explode.r, 0.26, 0, p.color, { width: 8, kb: 0, filled: true });
        burstParticles(p.x, p.y, 14, p.color, 230, 5, { glow: true }); sfx('boom', 0.07);
      }
      if (p.pool){
        addZone(p.x, p.y, p.pool.r, p.pool.dur, p.pool.dps, p.color, { grow: true });
        burstParticles(p.x, p.y, 6, p.color, 120, 4);
      }
      ps.splice(i, 1);
    }
  }

  const es = G.eproj;
  for (let i = es.length - 1; i >= 0; i--){
    const p = es[i];
    p.life -= dt; p.rot += dt * 9;
    if (p.home){ const sp = hyp(p.vx, p.vy), cur = Math.atan2(p.vy, p.vx), na = cur + clamp(angDiff(Math.atan2(P.y - p.y, P.x - p.x), cur), -p.home * dt, p.home * dt); p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (G.buildings && G.buildings.length && buildingAt(p.x, p.y)){ es.splice(i, 1); continue; }   /* buildings give cover */
    if (G.allies && G.allies.length && marsShotHitsAlly(p)){ es.splice(i, 1); continue; }
    const dx = P.x - p.x, dy = P.y - p.y, rr = P.r + p.r;
    if (dx * dx + dy * dy < rr * rr){
      hurtPlayer(p.dmg, p.x, p.y);
      burstParticles(p.x, p.y, 6, p.color, 180, 3);
      es.splice(i, 1); continue;
    }
    if (p.life <= 0 || p.x < -40 || p.y < -40 || p.x > ARENA_W + 40 || p.y > ARENA_H + 40) es.splice(i, 1);
  }
}

function updateZones(dt){
  const zs = G.zones;
  while (zs.length > MAX_ZONES) zs.shift();
  for (let i = zs.length - 1; i >= 0; i--){
    const z = zs[i];
    z.life -= dt;
    if (z.grow) z.r0 = approach(z.r0, z.r, z.r * dt * 5);
    const rr = z.grow ? z.r0 : z.r;
    const near = enemiesNear(z.x, z.y, rr + 30);
    for (let k = 0; k < near.length; k++){
      const e = near[k];
      if (e.dead) continue;
      const dx = e.x - z.x, dy = e.y - z.y;
      if (dx * dx + dy * dy > (rr + e.r) * (rr + e.r)) continue;
      if (z.slow){ e.slowT = Math.max(e.slowT, 0.4); e.slowMul = Math.min(e.slowMul, z.slow); }
      if (!canHit(e, 'z' + z.id, z.tick)) continue;
      dmgSrc = z.src || 'other'; damageEnemy(e, z.dps * z.tick, { noCrit: true, quiet: true, color: z.color, silent: Math.random() > 0.3 });
    }
    if (z.life <= 0) zs.splice(i, 1);
  }
}

function updateShocks(dt){
  const ss = G.shocks;
  for (let i = ss.length - 1; i >= 0; i--){
    const s = ss[i];
    s.life -= dt;
    const p = 1 - Math.max(0, s.life) / s.max;
    s.r = lerp(6, s.maxR, Math.sqrt(p));
    const near = enemiesNear(s.x, s.y, s.r + s.width + 30);
    for (let k = 0; k < near.length; k++){
      const e = near[k];
      if (e.dead || s.hit.has(e)) continue;
      const d = hyp(e.x - s.x, e.y - s.y);
      const ok = s.filled ? (d < s.r + e.r) : (d > s.r - s.width - e.r && d < s.r + s.width + e.r);
      if (!ok) continue;
      s.hit.add(e);
      dmgSrc = s.src || 'other'; damageEnemy(e, s.dmg, { kb: s.kb, sx: s.x, sy: s.y, color: s.color, stun: s.stun, burn: s.burn });
    }
    if (G.buildings && G.buildings.length && !s.noBuildings){
      if (!s.hitB) s.hitB = new Set();
      for (let k = 0; k < G.buildings.length; k++){
        const b = G.buildings[k];
        if (b.collapsed || s.hitB.has(b)) continue;
        const nx = clamp(s.x, b.x, b.x + b.w), ny = clamp(s.y, b.y, b.y + b.h);
        if (hyp(s.x - nx, s.y - ny) < s.r){ s.hitB.add(b); damageBuilding(b, s.dmg, 'shock'); }
      }
    }
    if (s.life <= 0) ss.splice(i, 1);
  }
}

function updatePickups(dt){
  /* just after a wave is cleared every drop on the field is drawn in (P.magnetT, set by waveClearFX) */
  const mag = P.magnetT > 0; if (mag) P.magnetT -= dt;
  const radius = mag ? 3000 : 76 * P.stats.pickupMul * (roverRiding() ? roverPickupMul() : 1);
  const ps = G.pickups;
  for (let i = ps.length - 1; i >= 0; i--){
    const p = ps[i];
    p.life -= dt; p.bob += dt * 4;
    if (mag) p.life = Math.max(p.life, 2);                 /* and nothing expires on its way */
    const dx = P.x - p.x, dy = P.y - p.y;
    const d = hyp(dx, dy) || 1;
    if (d < radius){
      p.pulled = true;
      const pull = mag ? 1100 : 240 + (radius - d) * 6;
      p.vx += (dx / d) * pull * dt * 4;
      p.vy += (dy / d) * pull * dt * 4;
    }
    p.vx *= Math.pow(0.02, dt); p.vy *= Math.pow(0.02, dt);
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (d < P.r + 12){
      collectPickup(p);
      ps.splice(i, 1); continue;
    }
    if (p.life <= 0) ps.splice(i, 1);
  }
}

function collectPickup(p){
  if (p.type === 'heart'){
    const h = Math.max(15, Math.round(P.maxHp * 0.18));
    P.hp = Math.min(P.maxHp, P.hp + h);
    addText(P.x, P.y - 40, '+' + h, '#7EE08A', 16, false);
    sfx('pickupS', 0.05);
  } else if (p.type === 'gold'){
    const g = 3 + Math.floor(G.wave * 0.4);
    G.bonusGold += g;
    addText(P.x, P.y - 40, '+' + g + ' gold', '#F2B33D', 15, false);
    sfx('coin', 0.05);
  } else if (p.type === 'gem'){
    G.runGems = (G.runGems | 0) + 1;
    addText(P.x, P.y - 40, '+1 gem', '#9AE8FF', 15, false);
    sfx('coin', 0.05);
  } else if (p.type === 'sulfur' || p.type === 'basalt'){
    collectVenusPickup(p);
  } else if (p.type === 'iron'){
    const n = 1 + Math.floor((chapterWaveOf(G.wave) - 1) / 9);
    G.runIron = (G.runIron | 0) + n; addText(P.x, P.y - 40, '+' + n + ' iron', '#E8764A', 15, false); sfx('pickupS', 0.05);
  } else if (p.type === 'grub'){
    G.runGrubs = (G.runGrubs | 0) + 1;
    addText(P.x, P.y - 40, '+1 grub', '#E8D8A0', 15, false);
    sfx('pickupS', 0.05);
  } else if (p.type === 'nova'){
    const dmg = 130 + G.wave * 32;
    addShock(P.x, P.y, 1100, 0.7, dmg, '#FFF3CC', { width: 90, kb: 620, stun: 0.5 });
    screenFlash('#FFF3CC', 0.55, 0.45);
    addShake(18);
    addText(P.x, P.y - 44, 'Sun Flare', '#FFF3CC', 20, true);
    SFX.transform();
  }
}

function updateParticles(dt){
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--){
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0){ ps.splice(i, 1); continue; }
    const k = Math.pow(0.5, dt * p.drag);
    p.vx *= k; p.vy *= k;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.spin * dt;
  }
  const ts = G.texts;
  for (let i = ts.length - 1; i >= 0; i--){
    const t = ts[i];
    t.life -= dt;
    if (t.life <= 0){ ts.splice(i, 1); continue; }
    t.y += t.vy * dt; t.x += t.vx * dt;
    t.vy += 92 * dt;
    t.pop = Math.min(1, t.pop + dt * 9);
  }
  const sw = G.swipes;
  for (let i = sw.length - 1; i >= 0; i--){ sw[i].t += dt; if (sw[i].t >= sw[i].dur) sw.splice(i, 1); }
  const bl = G.bolts;
  for (let i = bl.length - 1; i >= 0; i--){ bl[i].life -= dt; if (bl[i].life <= 0) bl.splice(i, 1); }
}

function updateCards(dt){
  for (let i = 0; i < P.cards.length; i++){
    const inst = P.cards[i];
    dmgSrc = inst.def.id;
    if (inst.def.update) inst.def.update(inst, dt);
  }
  dmgSrc = 'other';
}

/* ========================= 24. MAIN UPDATE ========================= */
function update(dt){
  dmgSrc = 'other';
  if (G.hitstop > 0){ G.hitstop -= dt; dt *= 0.18; }
  G.time += dt;
  G.runTime += dt;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 46);
  if (G.flash){ G.flash.t += dt; if (G.flash.t >= G.flash.dur) G.flash = null; }
  if (G.banner){ G.banner.t += dt; if (G.banner.t >= G.banner.dur) G.banner = null; }
  if (G.timeSlowT > 0) G.timeSlowT -= dt;
  /* Peaceful Lune slows the world -- enemies, their shots, hazard zones,
     and the wave clock -- while the giraffe and its own cards keep moving
     at full speed, for a genuine "everything but you" bullet-time beat. */
  const wdt = G.timeSlowT > 0 ? dt * 0.2 : dt;

  updateTimers(dt);
  updatePlayer(dt);
  roverUpdate(dt);
  updateVenusBase(dt);
  Grid.build(G.enemies);
  updateEnemies(wdt);
  updateCards(dt);
  updateAnts(dt);
  updateColonyTurret(dt);
  updateAllies(wdt);
  updateMarsCollector(dt);
  updateProjectiles(wdt);
  updateZones(wdt);
  updateShocks(wdt);
  updateMarkers(wdt); updateHZones(wdt); updateBeams(wdt); updateBlasts(wdt); updatePulses(wdt);
  updateBuildings(dt);
  updatePickups(dt);
  updateParticles(dt);
  updateWaves(wdt);
  sceneryUpdate(dt);
  waterUpdate(dt); combatFxUpdate(dt); giraffeFxUpdate(dt);
  checkAntUnlock();
  checkWheelKey();

  /* level-ups are offered at most once per LEVEL_PICK_GAP seconds: the first one opens straight away, and any levels earned during the
     gap wait and are then spent back to back in one go (see afterLevelChoice) */
  if (G.levelGate > 0) G.levelGate = Math.max(0, G.levelGate - dt);
  if (G.pendingLevels > 0 && G.state === 'playing' && !G.transformFX && !(G.levelGate > 0)) openLevelUp();
}
function tryTimeSlow(){
  if (G.state !== 'playing' || !trinketEquipped('peacefullune') || P.slowCd > 0) return;
  G.timeSlowT = 8;
  P.slowCd = 30;
  screenFlash('#8FAEE8', 0.16, 0.4);
  sfx('whoosh', 0.3);
}

