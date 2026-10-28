'use strict';
/* Enemy types for chapters 1-7 and habitat looks. */
/* ========================= 18. ENEMY TYPES ========================= */
const ETYPES = {
  hyena:   { hp:24,  spd:132, dmg:7,  r:15, xp:11, kbRes:1.0, ai:'chase',   color:'#C2A279', dark:'#4A3A28', blood:'#7A4A21', val:10 },
  cheetah: { hp:23,  spd:108, dmg:10, r:14, xp:18, kbRes:1.1, ai:'dash',    color:'#E8B94F', dark:'#3E2A12', blood:'#8E3B2B', val:12 },
  rhino:   { hp:100, spd:74,  dmg:15, r:27, xp:46, kbRes:0.26, ai:'charge', color:'#ADABA8', dark:'#565452', blood:'#6E4A42', val:15 },
  termite: { hp:50,  spd:128, dmg:6,  r:17, xp:21, kbRes:0.9, ai:'chase',   color:'#66401F', dark:'#2E1D0C', blood:'#C9A46C', val:13,
             splitInto:'grub', splitCount:4 },
  grub:    { hp:11,  spd:176, dmg:4,  r:8,  xp:5,  kbRes:1.5, ai:'chase',   color:'#E6CE9C', dark:'#7A5836', blood:'#C9A46C', val:8 },
  vulture: { hp:36,  spd:140, dmg:8,  r:16, xp:23, kbRes:1.1, ai:'ranged',  color:'#3B332B', dark:'#221C16', blood:'#5A4438', val:14 },
  jackal:  { hp:30,  spd:118, dmg:9,  r:14, xp:16, kbRes:1.0, ai:'flank',   color:'#B3A488', dark:'#4A4234', blood:'#6E5238', val:13 },
  warthog: { hp:70,  spd:112, dmg:13, r:20, xp:30, kbRes:0.45, ai:'charge', color:'#8A6E52', dark:'#3A2C1C', blood:'#5A3E28', val:16 },
  baboon:  { hp:52,  spd:118, dmg:10, r:16, xp:27, kbRes:0.9, ai:'skirmish', color:'#6E5A48', dark:'#362A20', blood:'#4A3626', val:17 },
  honeybadger:{ hp:130, spd:118, dmg:12, r:15, xp:40, kbRes:0.08, ai:'chase', color:'#2A2622', dark:'#0E0C0A', blood:'#3A3430', val:20,
             pale:'#E8E4D8' },
  mamba:   { hp:26,  spd:196, dmg:16, r:10, xp:33, kbRes:1.3, ai:'dash',   color:'#5A7A52', dark:'#2E4028', blood:'#3A5834', val:22, windUp:0.28, dashT:0.3, dashSpd:820 },
  ember:   { hp:14,  spd:190, dmg:9,  r:9,  xp:9,  kbRes:1.2, ai:'chase',  color:'#FF8A4A', dark:'#B33A12', blood:'#FF8A4A', val:14 },
  lion:    { hp:620,  spd:104, dmg:18, r:42, xp:520,  kbRes:0.05, ai:'boss',  color:'#D9A250', dark:'#7A4A21', blood:'#8E3B2B',
             big:true, title:'Alpha Lion', val:24 },
  matriarch:{ hp:1700, spd:84,  dmg:23, r:56, xp:1100, kbRes:0.03, ai:'boss2', color:'#8F8A86', dark:'#57534F', blood:'#6E4A42',
             big:true, title:'The Matriarch', val:26 },
  buffalo: { hp:2500, spd:96,  dmg:27, r:46, xp:1500, kbRes:0.05, ai:'boss4', color:'#3A322A', dark:'#1C1712', blood:'#4A2E22',
             big:true, title:'The Widowmaker', val:28 },
  crocodile:{ hp:3400, spd:88,  dmg:32, r:50, xp:1950, kbRes:0.04, ai:'boss5', color:'#4E6B3E', dark:'#28381E', blood:'#3A5030',
             big:true, title:'Old Nile', val:30 },
  wildfire:{ hp:4600, spd:100, dmg:34, r:48, xp:2600, kbRes:0.04, ai:'boss3', color:'#FF6A32', dark:'#B23A12', blood:'#FF8A4A',
             big:true, title:'Wildfire', val:34 }
};

function enemyScale(w){
  return {
    hp:  1 + 0.16 * (w - 1) + 0.026 * (w - 1) * (w - 1),
    dmg: Math.min(3.0, 1 + 0.062 * (w - 1)),
    spd: Math.min(1.40, 1 + 0.016 * (w - 1))
  };
}

/* ========================= 18b. FROST VARIANTS (Chapter 2) ========================= */
/* Chapter 2 reuses every Chapter 1 creature's AI and draw code untouched --
   only the numbers and the palette change. blendHex cools each color toward
   pale ice or cold slate so every creature reads as its own frost twin
   without needing a single new case in drawEnemy(). */
function blendHex(hex, towardHex, amt){
  const h1 = hex.replace('#', ''), h2 = towardHex.replace('#', '');
  const r1 = parseInt(h1.substr(0, 2), 16), g1 = parseInt(h1.substr(2, 2), 16), b1 = parseInt(h1.substr(4, 2), 16);
  const r2 = parseInt(h2.substr(0, 2), 16), g2 = parseInt(h2.substr(2, 2), 16), b2 = parseInt(h2.substr(4, 2), 16);
  const r = Math.round(lerp(r1, r2, amt)), g = Math.round(lerp(g1, g2, amt)), b = Math.round(lerp(b1, b2, amt));
  const h = n => clamp(n, 0, 255).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
/* Blending only halfway toward a MUTED ice-blue (not near-white) keeps each
   creature's own hue and enough contrast to read clearly against the pale
   snow ground -- blending all the way to white washed everything out. */
const FROST_ICE = '#8FADC2';
const FROST_SHADOW = '#1E2A33';
const FROST_MUL = {
  common: { hp: 1.9,  dmg: 1.55, spd: 1.12, val: 1.85 },
  boss:   { hp: 2.325, dmg: 1.35, spd: 1.08, val: 1.6 }   /* 1.55 x 1.5 */
};
const FROST_TITLES = {
  lion: 'Frostmane', matriarch: 'Icebound Elder', buffalo: 'The Icebreaker',
  crocodile: 'The Deepfreeze', wildfire: 'Permafrost'
};
const ETYPES_FROST = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? FROST_MUL.boss : FROST_MUL.common;
  ETYPES_FROST[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp,
    dmg: base.dmg * mul.dmg,
    spd: base.spd * mul.spd,
    val: Math.round(base.val * mul.val),
    color: blendHex(base.color, FROST_ICE, 0.42),
    dark: blendHex(base.dark, FROST_SHADOW, 0.55),
    pale: base.pale ? blendHex(base.pale, FROST_ICE, 0.3) : base.pale,
    blood: '#BEEFFF',
    frost: true,
    title: base.title ? (FROST_TITLES[id] || ('Frost ' + base.title)) : undefined
  });
});

/* ========================= 18c. SWAMP VARIANTS (Chapter 3) ========================= */
/* Same trick again for Chapter 3 -- every creature's AI and draw code is
   untouched, only the numbers and the palette shift a second time, further
   than frost did, so the swamp reads as the hardest leg of the journey. */
const SWAMP_MURK = '#5A6B3A';
const SWAMP_SHADOW = '#141C10';
const SWAMP_MUL = {
  common: { hp: 2.85, dmg: 2.0,  spd: 1.22, val: 2.6 },
  boss:   { hp: 3.3,  dmg: 1.7,  spd: 1.14, val: 2.1 }   /* 2.2 x 1.5 */
};
const SWAMP_TITLES = {
  lion: 'Bogmane', matriarch: 'Swampbound Elder', buffalo: 'The Bogbreaker',
  crocodile: 'The Drowndeep', wildfire: 'The Miasma'
};
const ETYPES_SWAMP = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? SWAMP_MUL.boss : SWAMP_MUL.common;
  ETYPES_SWAMP[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp,
    dmg: base.dmg * mul.dmg,
    spd: base.spd * mul.spd,
    val: Math.round(base.val * mul.val),
    color: blendHex(base.color, SWAMP_MURK, 0.48),
    dark: blendHex(base.dark, SWAMP_SHADOW, 0.6),
    pale: base.pale ? blendHex(base.pale, SWAMP_MURK, 0.35) : base.pale,
    blood: '#3E4A22',
    swamp: true,
    title: base.title ? (SWAMP_TITLES[id] || ('Swamp ' + base.title)) : undefined
  });
});

/* ========================= 18d. OCEAN VARIANTS (Chapter 4) ========================= */
/* Same trick a third time for Chapter 4 -- every creature's AI and draw code
   is still untouched, only the numbers and the palette shift once more, the
   furthest yet, so the open ocean reads as the hardest leg of the journey. */
const OCEAN_DEEP = '#1C4E6E';
const OCEAN_SHADOW = '#08141C';
const OCEAN_MUL = {
  common: { hp: 4.1, dmg: 2.5,  spd: 1.3,  val: 3.5 },
  boss:   { hp: 4.5, dmg: 2.05, spd: 1.2,  val: 2.6 }   /* 3.0 x 1.5 */
};
const OCEAN_TITLES = {
  lion: 'Tidemane', matriarch: 'Depthbound Elder', buffalo: 'The Tidebreaker',
  crocodile: 'The Abyssmaw', wildfire: 'The Maelstrom'
};
const ETYPES_OCEAN = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? OCEAN_MUL.boss : OCEAN_MUL.common;
  ETYPES_OCEAN[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp,
    dmg: base.dmg * mul.dmg,
    spd: base.spd * mul.spd,
    val: Math.round(base.val * mul.val),
    color: blendHex(base.color, OCEAN_DEEP, 0.55),
    dark: blendHex(base.dark, OCEAN_SHADOW, 0.65),
    pale: base.pale ? blendHex(base.pale, OCEAN_DEEP, 0.4) : base.pale,
    blood: '#3EFFC8',
    ocean: true,
    title: base.title ? (OCEAN_TITLES[id] || ('Ocean ' + base.title)) : undefined
  });
});

/* ========================= 18d2. HABITAT LOOKS (Chapters 2-4) ========================= */
/* Chapters 2-4 now use real animals of each habitat rather than recoloured
   chapter-1 creatures. Stats and AI stay exactly as each table above set
   them; this only swaps the look, palette and boss titles. */
const ARCTIC_LOOKS = {
  hyena:       { look: 'arcticwolf', color: '#E4ECF0', dark: '#8A9AA6' },
  cheetah:     { look: 'lynx',       color: '#C8B8A0', dark: '#3A3026' },
  rhino:       { look: 'muskox',     color: '#4A3A2C', dark: '#221A12', pale: '#A8906C' },
  termite:     { look: 'arctichare', color: '#F4F6F8', dark: '#1A1A1E', pale: '#E8A8B0' },
  grub:        { look: 'leveret',    color: '#E8ECEE', dark: '#2A2A2E' },
  vulture:     { look: 'gyrfalcon',  color: '#EEF0F2', dark: '#3A3E44', pale: '#F2C84A' },
  jackal:      { look: 'arcticfox',  color: '#F6F8FA', dark: '#9AA4AC' },
  warthog:     { look: 'caribou',    color: '#7A6048', dark: '#3A2C20', pale: '#E8E0D0' },
  baboon:      { look: 'ermine',     color: '#F4F4F0', dark: '#1A1A1A' },
  honeybadger: { look: 'wolverine',  color: '#3A2A1E', dark: '#1A120C', pale: '#C9A26A' },
  mamba:       { look: 'lemming',    color: '#C8964A', dark: '#3A2A1A' },
  ember:       { look: 'owlet',      color: '#D8DCE0', dark: '#6A6E74' },
  lion:        { look: 'polarbear',  color: '#F2F0E6', dark: '#9A968A', title: 'The Ice King' },
  matriarch:   { look: 'walrus',     color: '#9A6A50', dark: '#4A3024', pale: '#F0E8D8', title: 'The Tusked Matriarch' },
  buffalo:     { look: 'moose',      color: '#3A2A1E', dark: '#1A120C', pale: '#C8B08A', title: 'The Antlered Titan' },
  crocodile:   { look: 'narwhal',    color: '#8A9AA4', dark: '#4A5660', pale: '#EDE6D2', title: 'The Narwhal Lord' },
  wildfire:    { look: 'snowyowl',   color: '#F4F6F8', dark: '#2A2A30', pale: '#F2C84A', title: 'The Great White Owl' }
};
const SWAMP_LOOKS = {
  hyena:       { look: 'nutria',        color: '#6A5038', dark: '#2E2218' },
  cheetah:     { look: 'bobcat',        color: '#B8905A', dark: '#3A2814' },
  rhino:       { look: 'feralhog',      color: '#3A302A', dark: '#16120E', pale: '#B08070' },
  termite:     { look: 'bullfrog',      color: '#5A8A3A', dark: '#2E4A1E', pale: '#E8D890' },
  grub:        { look: 'tadpole',       color: '#3A3A2A', dark: '#1A1A12' },
  vulture:     { look: 'heron',         color: '#7A8A9A', dark: '#2A3038', pale: '#E8C84A' },
  jackal:      { look: 'otter',         color: '#5A3E28', dark: '#2A1C10', pale: '#C8A888' },
  warthog:     { look: 'beaver',        color: '#6A4A2E', dark: '#2A1A0E', pale: '#E8883A' },
  baboon:      { look: 'raccoon',       color: '#7A7A76', dark: '#1A1A1A', pale: '#E8E8E4' },
  honeybadger: { look: 'opossum',       color: '#9A9A96', dark: '#1A1A1A', pale: '#F4F2EE' },
  mamba:       { look: 'cottonmouth',   color: '#3A3A28', dark: '#16160E', pale: '#F4F2EA' },
  ember:       { look: 'mosquito',      color: '#4A4038', dark: '#1A1612' },
  lion:        { look: 'panther',       color: '#B08A5A', dark: '#2A1E10', pale: '#E8DCC8', title: 'The Swamp Panther' },
  matriarch:   { look: 'blackbear',     color: '#1E1A18', dark: '#0A0808', pale: '#B89A70', title: 'The Mire Mother' },
  buffalo:     { look: 'snapper',       color: '#4A4A32', dark: '#22221A', pale: '#8A8A5A', title: 'The Snapjaw' },
  crocodile:   { look: 'alligator',     color: '#2A3222', dark: '#12160E', title: 'The Bayou King' },
  wildfire:    { look: 'mosquitoqueen', color: '#5A4A3E', dark: '#1E1812', pale: '#C8323A', title: 'The Swarm Mother' }
};
const OCEAN_LOOKS = {
  hyena:       { look: 'barracuda',   color: '#A8B8C4', dark: '#3A4854' },
  cheetah:     { look: 'sailfish',    color: '#2A5A8A', dark: '#0E2438', pale: '#6FB8E8' },
  rhino:       { look: 'hammerhead',  color: '#7A8894', dark: '#3A444E' },
  termite:     { look: 'jellyfish',   color: '#E8A8D8', dark: '#8A4A7A' },
  grub:        { look: 'jellylet',    color: '#F0C0E4', dark: '#8A4A7A' },
  vulture:     { look: 'pelican',     color: '#F2F0EA', dark: '#1A1A1A', pale: '#F2A83A' },
  jackal:      { look: 'dolphin',     color: '#7A8A9A', dark: '#3A4654' },
  warthog:     { look: 'swordfish',   color: '#2A3A5A', dark: '#0E1624', pale: '#C8D0D8' },
  baboon:      { look: 'octopus',     color: '#D8603A', dark: '#7A2A14' },
  honeybadger: { look: 'crab',        color: '#C8402A', dark: '#5A1A0E', pale: '#F2D8C8' },
  mamba:       { look: 'seasnake',    color: '#E8F0F4', dark: '#141A20' },
  ember:       { look: 'lanternfish', color: '#2A3A48', dark: '#0E161E', pale: '#8FFFEA' },
  lion:        { look: 'greatwhite',  color: '#7A8894', dark: '#2A323A', title: 'The Great White' },
  matriarch:   { look: 'whale',       color: '#3A4A5C', dark: '#1A222C', pale: '#E8ECF0', title: 'The Old Humpback' },
  buffalo:     { look: 'orca',        color: '#141618', dark: '#050606', pale: '#F4F6F8', title: 'The Orca' },
  crocodile:   { look: 'giantsquid',  color: '#B8402E', dark: '#5A1A12', title: 'The Kraken' },
  wildfire:    { look: 'anglerfish',  color: '#2A2A34', dark: '#0E0E14', pale: '#8FFFEA', title: 'The Abyssal Angler' }
};
function applyLooks(table, looks){
  Object.keys(looks).forEach(id => {
    const t = table[id], lk = looks[id];
    if (!t) return;
    t.look = lk.look; t.color = lk.color; t.dark = lk.dark;
    if (lk.pale) t.pale = lk.pale;
    if (t.title && lk.title) t.title = lk.title;
  });
}
applyLooks(ETYPES_FROST, ARCTIC_LOOKS);
applyLooks(ETYPES_SWAMP, SWAMP_LOOKS);
applyLooks(ETYPES_OCEAN, OCEAN_LOOKS);

/* ========================= 18e. RAINFOREST ROSTER (Chapter 5) ========================= */
/* Unlike chapters 2-4, chapter 5's creatures are entirely new animals of the
   Amazon rainforest. Only the non-visual half of each chapter-1 creature is
   reused -- its AI pattern, hitbox and role (splitter, flanker, charger,
   boss pattern...) -- while `look` points drawEnemy at brand-new artwork.
   `type` itself stays the chapter-1 id so every AI branch, split and boss
   summon keeps working unchanged. Tuned deliberately brutal for now. */
const JUNGLE_MUL = {
  common: { hp: 9.025, dmg: 3.6, spd: 1.62, val: 5.0 },
  boss:   { hp: 6.65,  dmg: 3.2, spd: 1.45, val: 3.6 }
};
const JUNGLE_LOOKS = {
  hyena:       { look: 'peccary',    color: '#4A3E36', dark: '#1E1814', blood: '#6A2A1E' },
  cheetah:     { look: 'jaguar',     color: '#D9A441', dark: '#2A1C0C', blood: '#8E2B1E' },
  rhino:       { look: 'tapir',      color: '#3A3634', dark: '#1C1A18', blood: '#5A2A22', pale: '#D8D2C8' },
  termite:     { look: 'leafcutter', color: '#8A3A1C', dark: '#3A160A', blood: '#6A8A2A' },
  grub:        { look: 'ant',        color: '#7A2E14', dark: '#2E0E04', blood: '#6A8A2A' },
  vulture:     { look: 'harpy',      color: '#8A8A86', dark: '#2A2A28', blood: '#5A3A30', pale: '#E8E6E0' },
  jackal:      { look: 'ocelot',     color: '#C9A262', dark: '#3A2812', blood: '#7A2E1E' },
  warthog:     { look: 'capybara',   color: '#8A6A48', dark: '#4A3622', blood: '#6A3A22' },
  baboon:      { look: 'howler',     color: '#7A2E1A', dark: '#2E1008', blood: '#5A1E10' },
  honeybadger: { look: 'anteater',   color: '#6A5E52', dark: '#141210', blood: '#4A2E22', pale: '#F0ECE2' },
  mamba:       { look: 'dartfrog',   color: '#1E8FE0', dark: '#0A1420', blood: '#1E6AB0' },
  ember:       { look: 'froglet',    color: '#F2A830', dark: '#5A2A08', blood: '#F2A830' },
  lion:        { look: 'shadowjag',  color: '#1E1C22', dark: '#0A0A0E', blood: '#6A1E1E', title: 'Shadowpaw' },
  matriarch:   { look: 'harpyqueen', color: '#8A8A86', dark: '#1E1E1C', blood: '#5A3A30', pale: '#ECEAE4', title: 'The Harpy Matriarch' },
  buffalo:     { look: 'armadillo',  color: '#8A7A68', dark: '#3A3024', blood: '#5A3A28', title: 'The Ironback' },
  crocodile:   { look: 'anaconda',   color: '#5A6A32', dark: '#1A1E0C', blood: '#3A4A1E', title: 'The Great Anaconda' },
  wildfire:    { look: 'venomqueen', color: '#F2C230', dark: '#3A2A08', blood: '#B8E04A', title: 'The Venom Queen' }
};
const ETYPES_JUNGLE = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? JUNGLE_MUL.boss : JUNGLE_MUL.common;
  const lk = JUNGLE_LOOKS[id] || {};
  ETYPES_JUNGLE[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp,
    dmg: base.dmg * mul.dmg,
    spd: base.spd * mul.spd,
    val: Math.round(base.val * mul.val),
    color: lk.color || base.color,
    dark: lk.dark || base.dark,
    pale: lk.pale || base.pale,
    blood: lk.blood || base.blood,
    look: lk.look,
    jungle: true,
    title: base.title ? (lk.title || base.title) : undefined
  });
});

/* ========================= 18f. HOUSTON ROSTER (Chapter 6) ========================= */
const CITY_MUL = {
  common: { hp: 12.0, dmg: 4.0, spd: 1.7, val: 6.5 },
  boss:   { hp: 9.0,  dmg: 3.6, spd: 1.5, val: 4.4 }
};
const CITY_LOOKS = {
  hyena:       { look: 'streetdog',   color: '#8A6A48', dark: '#3A2A1C', pale: '#D8452E' },
  jackal:      { look: 'coyote',      color: '#B89A70', dark: '#4A3A28' },
  cheetah:     { look: 'alleycat',    color: '#B08A5A', dark: '#4A3420' },
  warthog:     { look: 'ninebanded',  color: '#8A7A6A', dark: '#4A3E34', pale: '#D8B0A0' },
  rhino:       { look: 'lighttank',   color: '#8A7E56', dark: '#3A3624', pale: '#9A8E64' },
  baboon:      { look: 'grackle',     color: '#1E1E2A', dark: '#0A0A12', pale: '#F2E27A' },
  honeybadger: { look: 'k9',          color: '#9A6A38', dark: '#1E1814', pale: '#3A4A34' },
  vulture:     { look: 'helicopter',  color: '#6B6B45', dark: '#3A3A26', pale: '#9AB0B8' },
  mamba:       { look: 'rat',         color: '#7A7470', dark: '#3A3634', pale: '#E8A8A8' },
  termite:     { look: 'pigeonflock', color: '#8A8E98', dark: '#4A4E58', pale: '#6FAE8A' },
  grub:        { look: 'pigeon',      color: '#8A8E98', dark: '#4A4E58', pale: '#6FAE8A' },
  ember:       { look: 'drone',       color: '#3A3E42', dark: '#141618', pale: '#FF4A3A' },
  lion:        { look: 'rottweiler',  color: '#1E1A18', dark: '#0A0808', pale: '#B8743A', title: 'The Junkyard King' },
  matriarch:   { look: 'gunship',     color: '#4E5236', dark: '#26281A', pale: '#9AB0B8', title: 'The Gunship' },
  buffalo:     { look: 'abrams',      color: '#B8A47A', dark: '#6A5E42', pale: '#A8946A', title: 'The Abrams' },
  crocodile:   { look: 'sewergator',  color: '#3A4232', dark: '#1A1E16', pale: '#E8A02A', title: 'The Bayou Gator' },
  wildfire:    { look: 'a10',         color: '#7A8288', dark: '#3A4046', pale: '#FF8A3A', title: 'The Warthog' }
};
/* flying units ignore buildings entirely */
const CITY_FLYERS = { helicopter: 1, gunship: 1, drone: 1, a10: 1, pigeon: 1, pigeonflock: 1, grackle: 1 };
/* armor smashes straight through buildings it pushes against */
const CITY_CRUSHERS = { lighttank: 1, abrams: 1 };
const ETYPES_CITY = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? CITY_MUL.boss : CITY_MUL.common;
  const lk = CITY_LOOKS[id] || {};
  ETYPES_CITY[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp, dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    color: lk.color || base.color, dark: lk.dark || base.dark, pale: lk.pale || base.pale,
    look: lk.look, city: true,
    title: base.title ? (lk.title || base.title) : undefined
  });
});

/* experience per kill, per chapter (5 and 6 are measured against the matching chapter-4 wave) */
const CHAPTER_XP_MUL = [1, 0.9, 0.85, 0.8, 0.9 * 0.85, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7, 0.9 * 0.85 * 0.7];   /* chapters 7 to 13 pay out the same as chapter 6 */

/* ========================= 18g. SPACE CENTER ROSTER (Chapter 7) ========================= */
/* Tougher, harder-hitting and faster than Houston across the board: this is
   the military's best equipment. Roles and AI are borrowed from the same
   creatures as every other chapter. */
const SPACE_MUL = {
  common: { hp: 16.0, dmg: 4.4, spd: 1.8, val: 8.0 },
  boss:   { hp: 12.0, dmg: 3.9, spd: 1.55, val: 5.2 }
};
const SPACE_LOOKS = {
  hyena:       { look: 'quadbot',       color: '#D8D8D2', dark: '#3A3A40', pale: '#FF8A2A' },
  jackal:      { look: 'scoutrover',    color: '#B8B49C', dark: '#3A382E', pale: '#5FB4E8' },
  cheetah:     { look: 'hoverbike',     color: '#3A4A5A', dark: '#141C26', pale: '#54E0FF' },
  warthog:     { look: 'crawlerbot',    color: '#5C6A52', dark: '#262E22', pale: '#B8C0A8' },
  rhino:       { look: 'hovertank',     color: '#5A6478', dark: '#232A38', pale: '#54E0FF' },
  baboon:      { look: 'quadcopter',    color: '#5E626E', dark: '#1E2026', pale: '#FF3A3A' },
  honeybadger: { look: 'sentrywalker',  color: '#7A8286', dark: '#2E3438', pale: '#FFC83A' },
  vulture:     { look: 'reaperdrone',   color: '#8E959C', dark: '#3E454C', pale: '#54E0FF' },
  mamba:       { look: 'snakebot',      color: '#6A7A6A', dark: '#2A342A', pale: '#FF3A3A' },
  termite:     { look: 'swarmcarrier',  color: '#8A8E96', dark: '#3A3E46', pale: '#7CFFB0' },
  grub:        { look: 'microdrone',    color: '#7A7E88', dark: '#2A2C34', pale: '#FF5A3A' },
  ember:       { look: 'plasmaorb',     color: '#54E0FF', dark: '#1A6A8A', pale: '#FFFFFF' },
  lion:        { look: 'titanmech',     color: '#4C5A48', dark: '#1C241C', pale: '#54E0FF', title: 'The Titan' },
  matriarch:   { look: 'stealthbomber', color: '#5A6070', dark: '#1A1C22', pale: '#A8B4C8', title: 'The Stealth Bomber' },
  buffalo:     { look: 'railgunner',    color: '#586070', dark: '#1E242E', pale: '#6AA8FF', title: 'The Railgunner' },
  crocodile:   { look: 'siegewalker',   color: '#66705A', dark: '#262C20', pale: '#FFB030', title: 'The Siege Walker' },
  wildfire:    { look: 'skyfortress',   color: '#7C8494', dark: '#2A3040', pale: '#54E0FF', title: 'The Sky Fortress' }
};
Object.assign(CITY_FLYERS, { quadcopter: 1, reaperdrone: 1, microdrone: 1, plasmaorb: 1, stealthbomber: 1, skyfortress: 1 });
Object.assign(CITY_CRUSHERS, { hovertank: 1, railgunner: 1, siegewalker: 1, titanmech: 1 });
const ETYPES_SPACE = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id];
  const mul = base.big ? SPACE_MUL.boss : SPACE_MUL.common;
  const lk = SPACE_LOOKS[id] || {};
  ETYPES_SPACE[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp, dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    color: lk.color || base.color, dark: lk.dark || base.dark, pale: lk.pale || base.pale,
    look: lk.look, space: true,
    title: base.title ? (lk.title || base.title) : undefined
  });
});


