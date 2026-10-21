'use strict';
/* Longneck Town: the places, the herd, the errands and the things to find. */
/* ========================= 44u. TOWN DATA ========================= */
/* A side-on town she walks through between runs (menu button "Longneck Town"). It is made of districts laid out on one street:
       Harbour | Market Street | Town Square | Willow Park | Rooftops | Launchpad          (+ the Burrows, down the manhole in the square)
   The square, market and park are open from the start; the others open with chapters (see `open` in TOWN_DIST). A building is the front
   door of a screen the game already has (wardrobe, trading post, minigames, photo studio, album, bestiary, guide, the outposts and the
   lab), so each of them has a place to stand. Everything here is cosmetic or a small gift: gold, gems, hats, boots and five coat colours.

   Save.data.town = {
     found:{id:1}          things she has picked up (TOWN_ITEMS ids)         bond:{npc:points}     how well she knows each of the herd
     err:{id:1|2}          errands accepted (1) and finished (2)             talk:{npc:'date'}     last day each one was chatted to
     gift:{npc:'date'}     last day a gift was given                          vis:{district:1}      places she has been to
     night:{district:1}    places she has been to after dark                  done:{district:1}     districts with everything found
     daily:{d,dig:[],got:[],dot:0,n}  today's glimmering spots, which she has dug, whether Dot was found, how many in all
     tips:{key:1}          one-time tips shown     last:'district'   where she left off     n:{...} counters (wishes, talks) */
const TOWN_H = 600, TOWN_GROUND = 500;
const TOWN_ORDER = ['harbour', 'market', 'square', 'park', 'roofs', 'launch'];
function townDoneCh(n){ return !!(Save.data && Save.data['chapter' + n + 'Complete']); }
function townChaptersDone(){ let n = 0; for (let c = 1; c <= 13; c++) if (townDoneCh(c)) n++; return n; }
function townCoin(){ return 80 * (1 + townChaptersDone()); }                       /* what one coin is worth in gold: it grows with her progress */

/* ---- save data ---- */
function townData(){
  const d = Save.data; if (!d) return { found: {}, bond: {}, err: {}, talk: {}, gift: {}, vis: {}, night: {}, done: {}, daily: { d: '', dig: [], got: [], dot: 0, n: 0 }, tips: {}, n: {}, last: 'square' };
  let t = d.town;
  if (!t || typeof t !== 'object' || Array.isArray(t)) t = d.town = {};
  ['found', 'bond', 'err', 'talk', 'gift', 'vis', 'night', 'done', 'tips', 'n'].forEach(function(k){ if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {}; });
  if (!t.daily || typeof t.daily !== 'object' || Array.isArray(t.daily)) t.daily = {};
  const dl = t.daily;
  if (typeof dl.d !== 'string') dl.d = '';
  if (!Array.isArray(dl.dig)) dl.dig = [];
  if (!Array.isArray(dl.got)) dl.got = [];
  dl.dot = dl.dot ? 1 : 0; dl.n = Math.max(0, dl.n | 0);
  if (typeof t.last !== 'string' || !TOWN_DIST[t.last]) t.last = 'square';
  return t;
}

/* ---- the districts ---- */
/* b: the buildings (act is what the door does, see townUse in 44w). p: scenery. L: lights (they glow at night). */
const TOWN_DIST = {
  square: { id: 'square', name: 'Town Square', w: 2400, spawn: 1000, theme: 'square', left: 'market', right: 'park', open: function(){ return true; }, need: '',
    b: [
      { id: 'tram', kind: 'tram', x: 260, w: 170, h: 120, label: 'Tram', act: 'map' },
      { id: 'tailor', kind: 'tailor', x: 640, w: 300, h: 230, label: 'The Tailor', act: 'wardrobe' },
      { id: 'hall', kind: 'hall', x: 1280, w: 400, h: 270, label: 'Herd Hall', act: 'hall' },
      { id: 'board', kind: 'board', x: 1760, w: 150, h: 150, label: 'Notice board', act: 'board' },
      { id: 'hatch', kind: 'hatch', x: 2200, w: 130, h: 0, label: 'The Burrows', act: 'burrows', gate: function(){ return !!(Save.data && Save.data.homecoming); }, gateText: 'A heavy lid. Nothing here yet.' }
    ],
    p: [{ k: 'tree', x: 90 }, { k: 'lamp', x: 480 }, { k: 'fountain', x: 960 }, { k: 'bench', x: 780 }, { k: 'lamp', x: 1120 }, { k: 'tree', x: 1500, s: 1.15 }, { k: 'bench', x: 1560 },
      { k: 'lamp', x: 1920 }, { k: 'tree', x: 2060 }, { k: 'bush', x: 400 }, { k: 'bush', x: 1700 }, { k: 'flowers', x: 880 }, { k: 'flowers', x: 1040 }],
    L: [{ x: 480, y: 360, r: 110 }, { x: 1120, y: 360, r: 110 }, { x: 1920, y: 360, r: 110 }, { x: 640, y: 380, r: 120 }, { x: 1280, y: 400, r: 140 }],
    npcs: ['mayor', 'tilly'], dig: [560, 1450, 2020] },
  market: { id: 'market', name: 'Market Street', w: 2400, spawn: 1900, theme: 'market', left: 'harbour', right: 'square', open: function(){ return true; }, need: '',
    b: [
      { id: 'post', kind: 'post', x: 560, w: 330, h: 210, label: 'Trading Post', act: 'shop' },
      { id: 'cafe', kind: 'cafe', x: 1180, w: 300, h: 200, label: 'Penny’s Café', act: 'cafe' },
      { id: 'library', kind: 'library', x: 1780, w: 340, h: 280, label: 'Library', act: 'library' }
    ],
    p: [{ k: 'lamp', x: 200 }, { k: 'stall', x: 880 }, { k: 'crates', x: 960 }, { k: 'lamp', x: 1500 }, { k: 'stall', x: 1450 }, { k: 'barrel', x: 1040 }, { k: 'lamp', x: 2100 }, { k: 'tree', x: 2260 },
      { k: 'bench', x: 340 }, { k: 'bush', x: 2010 }, { k: 'barrel', x: 1560 }],
    L: [{ x: 200, y: 360, r: 110 }, { x: 1500, y: 360, r: 110 }, { x: 2100, y: 360, r: 110 }, { x: 560, y: 400, r: 130 }, { x: 1180, y: 400, r: 130 }, { x: 1780, y: 380, r: 130 }],
    npcs: ['barnaby', 'penny'], dig: [380, 1330, 2150] },
  park: { id: 'park', name: 'Willow Park', w: 2600, spawn: 300, theme: 'park', left: 'square', right: 'roofs', open: function(){ return true; }, need: '',
    b: [
      { id: 'arcade', kind: 'arcade', x: 520, w: 340, h: 230, label: 'Arcade', act: 'arcade' },
      { id: 'scores', kind: 'scores', x: 980, w: 190, h: 170, label: 'High scores', act: 'scores' },
      { id: 'grove', kind: 'grove', x: 1560, w: 380, h: 300, label: 'Foraging grove', act: 'forage' },
      { id: 'studio', kind: 'studio', x: 2160, w: 270, h: 200, label: 'Photo booth', act: 'photo' }
    ],
    p: [{ k: 'tree', x: 120 }, { k: 'bench', x: 300 }, { k: 'pond', x: 1220 }, { k: 'tree', x: 760, s: 1.2 }, { k: 'bush', x: 1760 }, { k: 'flowers', x: 1040 }, { k: 'lamp', x: 840 },
      { k: 'lamp', x: 1960 }, { k: 'tree', x: 2420, s: 1.1 }, { k: 'bench', x: 1900 }, { k: 'bush', x: 2400 }],
    L: [{ x: 840, y: 360, r: 110 }, { x: 1960, y: 360, r: 110 }, { x: 520, y: 400, r: 140 }, { x: 2160, y: 380, r: 120 }],
    npcs: ['gus', 'rio'], dig: [340, 1120, 2350] },
  harbour: { id: 'harbour', name: 'Harbour', w: 2200, spawn: 1900, theme: 'harbour', left: null, right: 'market',
    open: function(){ return townDoneCh(4); }, need: 'Finish Chapter 4 (The Deep)',
    b: [
      { id: 'shack', kind: 'shack', x: 640, w: 280, h: 190, label: 'Bait & Tackle', act: 'shack' },
      { id: 'lighthouse', kind: 'lighthouse', x: 1640, w: 170, h: 420, label: 'Lighthouse', act: 'lamp' }
    ],
    p: [{ k: 'crates', x: 280 }, { k: 'pier', x: 1000 }, { k: 'boat', x: 1180 }, { k: 'crane', x: 900 }, { k: 'barrel', x: 420 }, { k: 'lamp', x: 1400 }, { k: 'lamp', x: 150 }, { k: 'crates', x: 1980 }],
    L: [{ x: 1400, y: 360, r: 110 }, { x: 150, y: 360, r: 110 }, { x: 1640, y: 120, r: 200 }, { x: 640, y: 400, r: 110 }],
    npcs: ['marina'], dig: [220, 1300, 2050] },
  roofs: { id: 'roofs', name: 'Rooftops', w: 2400, spawn: 200, theme: 'roofs', left: 'park', right: 'launch',
    open: function(){ return townDoneCh(6); }, need: 'Finish Chapter 6 (Houston)',
    b: [
      { id: 'garden', kind: 'garden', x: 780, w: 380, h: 190, label: 'Rooftop garden', act: 'garden' },
      { id: 'shed', kind: 'shed', x: 1660, w: 240, h: 170, label: 'Signal shed', act: 'shed' }
    ],
    p: [{ k: 'antenna', x: 400 }, { k: 'tank', x: 1200 }, { k: 'chimney', x: 1400 }, { k: 'antenna', x: 1980, s: 1.3 }, { k: 'vent', x: 2200 }, { k: 'tank', x: 120 }, { k: 'lamp', x: 1000 }, { k: 'lamp', x: 1900 }],
    L: [{ x: 1000, y: 360, r: 110 }, { x: 1900, y: 360, r: 110 }, { x: 780, y: 400, r: 140 }, { x: 1660, y: 400, r: 110 }],
    npcs: ['skye'], dig: [330, 1130, 2250] },
  launch: { id: 'launch', name: 'Launchpad', w: 2400, spawn: 200, theme: 'launch', left: 'roofs', right: null,
    open: function(){ return townDoneCh(8); }, need: 'Finish Chapter 8 (The Moon)',
    b: [
      { id: 'mission', kind: 'mission', x: 700, w: 400, h: 250, label: 'Mission Control', act: 'mission' },
      { id: 'scope', kind: 'scope', x: 1450, w: 150, h: 170, label: 'Telescope', act: 'scope' }
    ],
    p: [{ k: 'dish', x: 330 }, { k: 'rocket', x: 1960 }, { k: 'tower', x: 2160 }, { k: 'lamp', x: 1120 }, { k: 'lamp', x: 1750 }, { k: 'crates', x: 1250 }, { k: 'lamp', x: 150 }],
    L: [{ x: 1120, y: 360, r: 110 }, { x: 1750, y: 360, r: 110 }, { x: 700, y: 400, r: 150 }, { x: 150, y: 360, r: 100 }, { x: 2160, y: 160, r: 120 }],
    npcs: ['nova'], dig: [300, 1300, 2150] },
  burrows: { id: 'burrows', name: 'The Burrows', w: 2200, spawn: 260, theme: 'burrows', left: null, right: null, cave: true,
    open: function(){ return !!(Save.data && Save.data.homecoming); }, need: 'Later in the journey',
    b: [
      { id: 'exit', kind: 'ladder', x: 130, w: 110, h: 0, label: 'Up to the square', act: 'exit' },
      { id: 'cavern', kind: 'cavern', x: 660, w: 340, h: 210, label: 'Cavern Market', act: 'cavern' },
      { id: 'fusion', kind: 'fusion', x: 1240, w: 330, h: 230, label: 'Fusion Machine', act: 'fusion', gate: function(){ return cityLevel('c_fusion') > 0; }, gateText: 'A sheet covers a huge shape. Not built yet.' },
      { id: 'farm', kind: 'farm', x: 1800, w: 280, h: 160, label: 'Grub farm', act: 'farm' }
    ],
    p: [{ k: 'mush', x: 380 }, { k: 'mush', x: 960 }, { k: 'mush', x: 1560 }, { k: 'lamp', x: 480 }, { k: 'lamp', x: 1050 }, { k: 'lamp', x: 1640 }, { k: 'stal', x: 300 }, { k: 'stal', x: 1100 }, { k: 'stal', x: 2000 }],
    L: [{ x: 480, y: 380, r: 150 }, { x: 1050, y: 380, r: 150 }, { x: 1640, y: 380, r: 150 }, { x: 660, y: 420, r: 150 }, { x: 1240, y: 420, r: 160 }, { x: 1800, y: 420, r: 130 }, { x: 130, y: 300, r: 130 }],
    npcs: ['ossi'], dig: [420, 1180, 2060] }
};
const TOWN_IDS = TOWN_ORDER.concat(['burrows']);
function townOpen(id){ const D = TOWN_DIST[id]; return !!(D && D.open()); }
function townOpenCount(){ let n = 0; TOWN_IDS.forEach(function(id){ if (townOpen(id)) n++; }); return n; }

/* ---- things to find ----
   t: coin (gold), star (a bigger prize), gem, hat or boot (acc: an item from ACC), swatch (a coat colour, see WARD_TOWN), track (a creature's
   footprints: ch + type name a creature of the Bestiary). h: how high above the street it hangs. Under 60 it is picked up by walking over it;
   higher, she has to stretch her neck up to it (hold the up key). note: where it is, used by the hints. */
const TOWN_ITEMS = [
  { id: 'sq_c1', d: 'square', t: 'coin', x: 450, h: 0, note: 'on the path near the tram stop' },
  { id: 'sq_c2', d: 'square', t: 'coin', x: 1500, h: 150, note: 'floating over the bench by the big tree' },
  { id: 'sq_c3', d: 'square', t: 'coin', x: 1900, h: 235, note: 'high above the notice board' },
  { id: 'sq_s1', d: 'square', t: 'star', x: 1280, h: 285, note: 'at the very top of Herd Hall' },
  { id: 'sq_tr', d: 'square', t: 'track', x: 190, h: 0, ch: 1, type: 'hyena', note: 'in the dust beside the tram stop' },
  { id: 'mk_c1', d: 'market', t: 'coin', x: 300, h: 0, note: 'behind the bench at the start of the street' },
  { id: 'mk_c2', d: 'market', t: 'coin', x: 1000, h: 150, note: 'on top of the barrels' },
  { id: 'mk_c3', d: 'market', t: 'coin', x: 2000, h: 0, note: 'by the bush at the far end' },
  { id: 'mk_g1', d: 'market', t: 'gem', x: 1780, h: 275, note: 'over the library sign' },
  { id: 'mk_h1', d: 'market', t: 'hat', acc: 'conductor', x: 880, h: 265, note: 'a cap floating high up over the stalls' },
  { id: 'mk_s1', d: 'market', t: 'star', x: 1450, h: 215, note: 'above the stall by the lamp' },
  { id: 'mk_tr', d: 'market', t: 'track', x: 2230, h: 0, ch: 6, type: 'cheetah', note: 'in the mud by the last tree' },
  { id: 'pk_c1', d: 'park', t: 'coin', x: 260, h: 0, note: 'by the first bench' },
  { id: 'pk_c2', d: 'park', t: 'coin', x: 1220, h: 125, note: 'hovering over the pond' },
  { id: 'pk_c3', d: 'park', t: 'coin', x: 1760, h: 205, note: 'in the branches near the grove' },
  { id: 'pk_h1', d: 'park', t: 'hat', acc: 'beret', x: 1760, h: 95, note: 'tucked in a bush' },
  { id: 'pk_b1', d: 'park', t: 'boot', acc: 'roller', x: 1180, h: 0, note: 'at the edge of the pond' },
  { id: 'pk_sw', d: 'park', t: 'swatch', x: 1560, h: 282, n: 27, note: 'in the very top of the foraging tree' },
  { id: 'pk_s1', d: 'park', t: 'star', x: 820, h: 215, note: 'in the big tree by the arcade' },
  { id: 'pk_tr', d: 'park', t: 'track', x: 2460, h: 0, ch: 1, type: 'warthog', note: 'in the soft earth past the photo booth' },
  { id: 'hb_c1', d: 'harbour', t: 'coin', x: 300, h: 0, note: 'between the crates on the quay' },
  { id: 'hb_c2', d: 'harbour', t: 'coin', x: 900, h: 140, note: 'on the crane hook' },
  { id: 'hb_c3', d: 'harbour', t: 'coin', x: 1400, h: 205, note: 'above the lamp near the lighthouse' },
  { id: 'hb_g1', d: 'harbour', t: 'gem', x: 1180, h: 255, note: 'at the top of the boat’s mast' },
  { id: 'hb_h1', d: 'harbour', t: 'hat', acc: 'souwester', x: 470, h: 265, note: 'flying from a mast over the bait shop' },
  { id: 'hb_b1', d: 'harbour', t: 'boot', acc: 'dock', x: 1010, h: 0, note: 'at the end of the pier' },
  { id: 'hb_sw', d: 'harbour', t: 'swatch', x: 1640, h: 285, n: 28, note: 'in the lamp of the lighthouse' },
  { id: 'hb_s1', d: 'harbour', t: 'star', x: 2000, h: 200, note: 'above the crates by the water' },
  { id: 'hb_tr', d: 'harbour', t: 'track', x: 130, h: 0, ch: 4, type: 'honeybadger', note: 'at the far left of the quay, in the wet sand' },
  { id: 'rf_c1', d: 'roofs', t: 'coin', x: 520, h: 150, note: 'beside the first antenna' },
  { id: 'rf_c2', d: 'roofs', t: 'coin', x: 1200, h: 225, note: 'over the water tank' },
  { id: 'rf_c3', d: 'roofs', t: 'coin', x: 1840, h: 270, note: 'near the top of the big antenna' },
  { id: 'rf_g1', d: 'roofs', t: 'gem', x: 1400, h: 255, note: 'on top of the chimney' },
  { id: 'rf_h1', d: 'roofs', t: 'hat', acc: 'aviator', x: 1980, h: 280, note: 'spinning at the very top of the antenna' },
  { id: 'rf_sw', d: 'roofs', t: 'swatch', x: 780, h: 270, n: 29, note: 'in the roof of the rooftop garden' },
  { id: 'rf_s1', d: 'roofs', t: 'star', x: 330, h: 235, note: 'above the far water tank' },
  { id: 'rf_s2', d: 'roofs', t: 'star', x: 2260, h: 120, note: 'on the vent at the far end' },
  { id: 'rf_tr', d: 'roofs', t: 'track', x: 1000, h: 0, ch: 6, type: 'grub', note: 'in the gravel between the lamp and the tank' },
  { id: 'ln_c1', d: 'launch', t: 'coin', x: 420, h: 0, note: 'under the big dish' },
  { id: 'ln_c2', d: 'launch', t: 'coin', x: 1250, h: 140, note: 'on top of the crates' },
  { id: 'ln_c3', d: 'launch', t: 'coin', x: 1750, h: 225, note: 'over the lamp on the right' },
  { id: 'ln_g1', d: 'launch', t: 'gem', x: 2160, h: 262, note: 'on the launch tower' },
  { id: 'ln_b1', d: 'launch', t: 'boot', acc: 'moon', x: 1900, h: 0, note: 'under the rocket' },
  { id: 'ln_sw', d: 'launch', t: 'swatch', x: 1960, h: 288, n: 30, note: 'on the nose of the rocket' },
  { id: 'ln_s1', d: 'launch', t: 'star', x: 1450, h: 240, note: 'above the telescope' },
  { id: 'ln_tr', d: 'launch', t: 'track', x: 2300, h: 0, ch: 7, type: 'hyena', note: 'in the scorched ground at the far end' },
  { id: 'bw_c1', d: 'burrows', t: 'coin', x: 520, h: 0, note: 'by the first glowing mushrooms' },
  { id: 'bw_c2', d: 'burrows', t: 'coin', x: 960, h: 140, note: 'over the big mushroom' },
  { id: 'bw_c3', d: 'burrows', t: 'coin', x: 1560, h: 220, note: 'hanging from a root' },
  { id: 'bw_g1', d: 'burrows', t: 'gem', x: 1100, h: 255, note: 'in the cave ceiling, over the lamp' },
  { id: 'bw_g2', d: 'burrows', t: 'gem', x: 2060, h: 120, note: 'beside the far stalagmite' },
  { id: 'bw_h1', d: 'burrows', t: 'hat', acc: 'miner', x: 800, h: 60, note: 'hanging on a peg by the lamp' },
  { id: 'bw_sw', d: 'burrows', t: 'swatch', x: 1640, h: 280, n: 31, note: 'in a cluster of glowcaps on the ceiling' },
  { id: 'bw_s1', d: 'burrows', t: 'star', x: 300, h: 230, note: 'on the first stalagmite' },
  { id: 'bw_tr', d: 'burrows', t: 'track', x: 1960, h: 0, ch: 11, type: 'honeybadger', note: 'beyond the grub farm' }
];
const TOWN_ITEM_BY_ID = {}; TOWN_ITEMS.forEach(function(it){ TOWN_ITEM_BY_ID[it.id] = it; });
function townItemsIn(d){ return TOWN_ITEMS.filter(function(it){ return it.d === d; }); }
function townFound(id){ return !!townData().found[id]; }
function townFoundIn(d){ let n = 0; TOWN_ITEMS.forEach(function(it){ if (it.d === d && townData().found[it.id]) n++; }); return n; }
function townFoundTotal(){ let n = 0; TOWN_ITEMS.forEach(function(it){ if (townData().found[it.id]) n++; }); return n; }
function townFoundType(t){ let n = 0; TOWN_ITEMS.forEach(function(it){ if (it.t === t && townData().found[it.id]) n++; }); return n; }

/* ---- the herd ---- */
/* look: coat, spot, pat (a WARD_PATTERNS number), hat, boot (ACC ids), hc/bc (tint colour numbers), s (size). habit: what she does when nobody is talking
   to her. fav: the gift she likes best. gift: what she gives at the best friend level. say/night/rain: things she says. */
const TOWN_NPCS = {
  mayor: { id: 'mayor', name: 'Mayor Lofty', d: 'square', x: 1000, range: 150, habit: 'stroll', fav: 'flowers', look: { coat: '#E5B558', spot: '#8D5A22', pat: 1, hat: 'tophat', s: 1.12 },
    gift: { gems: 60, coin: 8 },
    say: ["Welcome to Longneck Town! Mind the doorways. Oh, you never have to, do you?", "A fine day for stretching the neck.",
      "Every pennant on the square is for a chapter you finished. The herd keeps count.", "The town is small today. It opens up as you travel, I promise.",
      "If you find a hat up on a lamp post, it isn't mine. Probably."],
    night: ["Out late? The lamps do look lovely on the water.", "I like the square at night. Quiet. Very quiet."], rain: ["Rain! Splendid for the roses."] },
  tilly: { id: 'tilly', name: 'Tilly Stitch', d: 'square', x: 560, range: 70, habit: 'stand', fav: 'sweets', look: { coat: '#F29AC0', spot: '#B83B76', pat: 3, hat: 'beanie', hc: 0, s: 1.0 },
    gift: { gems: 60, coin: 8 },
    say: ["Stand still a moment. Mm. Yes. I have thoughts about your outfit.", "Hats and boots are half the look, darling.",
      "Three colours on the coat, one on the hat, one on the boots. That's my rule. I break it constantly.", "Everything can be recoloured. Everything. Ask me nothing about the paper bag."],
    night: ["Sewing by lamplight is the best kind."], rain: ["Wet fabric. Terrible. Come in if you like."] },
  barnaby: { id: 'barnaby', name: 'Barnaby Bartle', d: 'market', x: 800, range: 120, habit: 'stroll', fav: 'book', look: { coat: '#A9B86A', spot: '#5E6A2C', pat: 2, hat: 'straw', s: 1.05 },
    gift: { gems: 60, coin: 8 },
    say: ["Everything has a price. Even this chat. Kidding. Mostly.", "Gold goes round and round. That's the whole trick of it.",
      "Something shiny rolled off a cart on this street. Keep your eyes up.", "Rare wares, honest prices. Well. Prices."],
    night: ["Closed for business. Open for gossip."], rain: ["Rain's good for trade. Everyone ducks into a shop."] },
  penny: { id: 'penny', name: 'Penny Pip', d: 'market', x: 1260, range: 80, habit: 'stand', fav: 'sweets', look: { coat: '#F6DA92', spot: '#C77D3D', pat: 6, hat: 'toque', s: 0.95 },
    gift: { gems: 60, coin: 8 },
    say: ["Fresh acacia buns! Not for sale. Well. Sometimes.", "Leaves, honey, a pinch of salt. That's the secret.",
      "Everyone passes through the street sooner or later. I hear everything."],
    night: ["The ovens are warm. Come and stand by them."], rain: ["Hot buns and rain. Is there a better pair?"] },
  rio: { id: 'rio', name: 'Rio Reed', d: 'park', x: 2000, range: 90, habit: 'stand', fav: 'book', look: { coat: '#8FC3E8', spot: '#2F6B9A', pat: 4, hat: 'cowboy', s: 1.02 },
    gift: { gems: 60, coin: 8 },
    say: ["The light is everything. And a long neck helps, for the angles.", "Take a good one in the photo booth. Save it to the album and I'll look.",
      "Creatures make a picture. Just keep them at a polite distance.", "I only photograph what's in front of me. Which is mostly you."],
    night: ["Night shots. Long exposure. Hold very still."], rain: ["Rain on the lens. Moody. I'll take it."] },
  gus: { id: 'gus', name: 'Gus Gallop', d: 'park', x: 700, range: 110, habit: 'dance', fav: 'sweets', look: { coat: '#B58BE8', spot: '#5C2D9C', pat: 7, boot: 'sneaker', s: 1.0 },
    gift: { gems: 60, coin: 8 },
    say: ["High score or nothing! Okay, also a bit of nothing.", "Every minigame has three stars. I have all of them. In my dreams.",
      "The arcade doesn't open at night. It just glows at you.", "Try the cabinets in order. Or don't. Go wild."],
    night: ["Arcade lights are best after dark."], rain: ["Rain means arcade day."] },
  marina: { id: 'marina', name: 'Marina Mast', d: 'harbour', x: 1010, range: 20, habit: 'fish', fav: 'book', look: { coat: '#7ACFC4', spot: '#1E7E78', pat: 4, hat: 'sailor', s: 1.0 },
    gift: { gems: 60, coin: 8 },
    say: ["Shh. They bite better when it's quiet.", "I once caught a boot. Just the boot. It was a very good boot.", "The sea is patient. I'm learning."],
    night: ["Night's when the big ones come up."], rain: ["Fish love the rain. I love the fish."] },
  skye: { id: 'skye', name: 'Skye Sprocket', d: 'roofs', x: 1020, range: 130, habit: 'tinker', fav: 'book', look: { coat: '#F2A85C', spot: '#9A4C12', pat: 12, hat: 'propeller', s: 1.0 },
    gift: { gems: 60, coin: 8 },
    say: ["You can see all the way to the harbour from up here. Well. You can.", "Every antenna on this roof is mine. Don't touch the green one.",
      "Reach for it! That's the only rule of the rooftops."],
    night: ["The signals are clearer at night."], rain: ["Wet cables. Fun times."] },
  nova: { id: 'nova', name: 'Nova Nib', d: 'launch', x: 1380, range: 40, habit: 'stargaze', fav: 'book', look: { coat: '#9AA6F2', spot: '#3B3F8F', pat: 7, hat: 'wizard', s: 1.0 },
    gift: { gems: 60, coin: 8 },
    say: ["The sky is just very large and very close. Isn't it?", "You've been to the Moon. Tell me everything. Not now. At night.", "Venus is the bright one. Be careful with it."],
    night: ["Look up. No, higher. There."], rain: ["Clouds. I'll wait."] },
  ossi: { id: 'ossi', name: 'Elder Ossi', d: 'burrows', x: 1000, range: 100, habit: 'sit', fav: 'flowers', look: { coat: '#CDBB9C', spot: '#6F5E48', pat: 0, hat: 'cowboy', s: 1.15 },
    gift: { gems: 60, coin: 8 },
    say: ["We came down here when the sky got loud. Then we stayed.", "The mushrooms don't judge. That's why they glow.",
      "A good grub is a patient grub. Don't say that to the grubs."],
    night: [], rain: [] },
  dot: { id: 'dot', name: 'Dot', d: 'roam', x: 0, range: 0, habit: 'hide', fav: 'sweets', look: { coat: '#FFD36B', spot: '#C77F1A', pat: 6, hat: 'party', s: 0.66 },
    gift: { gems: 60, coin: 8 },
    say: ["Found me! Again!", "You're so tall. Can I sit on your head? No? Okay.", "I was behind a bin. A very good bin."],
    night: [], rain: [] }
};
const TOWN_NPC_LIST = ['mayor', 'tilly', 'barnaby', 'penny', 'rio', 'gus', 'marina', 'skye', 'nova', 'ossi', 'dot'];
const TOWN_GIFTS = [['flowers', 'Flowers'], ['sweets', 'Sweets'], ['book', 'A book']];
const TOWN_BOND_AT = [0, 5, 15, 30];                                               /* points for: stranger, acquaintance, friend, best friend */
const TOWN_BOND_NAMES = ['Stranger', 'Acquaintance', 'Friend', 'Best friend'];
function townBond(id){ return Math.max(0, townData().bond[id] | 0); }
function townBondLevel(id){ const b = townBond(id); let l = 0; for (let i = 1; i < TOWN_BOND_AT.length; i++) if (b >= TOWN_BOND_AT[i]) l = i; return l; }

/* ---- errands ---- (r: reward; coin is a number of coins' worth of gold; each NPC's errands come in order) */
const TOWN_ERRANDS = [
  { id: 'm1', npc: 'mayor', title: 'Welcome wagon', offer: "New in town? Walk down Market Street and out to Willow Park, then tell me what you think.", done: "Isn't it lovely? Here, a little something for the legs.", need: { k: 'visit', ids: ['market', 'park'] }, r: { coin: 3 } },
  { id: 'm2', npc: 'mayor', title: 'A finder’s fee', offer: "People keep dropping things around town. Bring the town's lost things back to the world: find ten of them, and I'll make it worth your while.", done: "Ten! The lost property office has never been so quiet.", need: { k: 'foundN', n: 10 }, r: { gems: 25 } },
  { id: 'm3', npc: 'mayor', title: 'Pride of the herd', offer: "Thirty things found, and the town would cheer. Shall we see if you can do it?", done: "Thirty! I'm going to need a bigger noticeboard.", need: { k: 'foundN', n: 30 }, r: { gems: 60 } },
  { id: 't1', npc: 'tilly', title: 'Something hat-ish', offer: "You're a vision, but your head is bare. Wear a hat. Any hat. Show me.", done: "Better. Much better. The head has a finish now.", need: { k: 'wear', what: 'hat' }, r: { coin: 2 } },
  { id: 't2', npc: 'tilly', title: 'A splash of colour', offer: "Change your coat colour to something that isn't your own, and tint a hat or boots too. In the wardrobe at the tailor's.", done: "Now that is a statement.", need: { k: 'wear', what: 'colours' }, r: { gems: 20 } },
  { id: 't3', npc: 'tilly', title: 'The full look', offer: "Hat, boots and a gear accent colour all at once. If you can do that I will weep.", done: "I'm weeping. Don't look.", need: { k: 'wear', what: 'outfit' }, r: { gems: 30 } },
  { id: 'b1', npc: 'barnaby', title: 'Shiny business', offer: "A star dropped off a cart on this street, somewhere high. Find it for me and I'll throw in a bonus. A gem went missing too, so bring both.", done: "Ha! Both of them. I'll keep the receipt.", need: { k: 'found', ids: ['mk_s1', 'mk_g1'] }, r: { coin: 4 } },
  { id: 'b2', npc: 'barnaby', title: 'Stock take', offer: "Bring me a purse of gold for the stock: twelve coins' worth. I'll pay you back in gems. I'm good for it.", done: "Honest dealing. I'll never forget it. Well. A week.", need: { k: 'give', cur: 'gold', coins: 12 }, r: { gems: 20 } },
  { id: 'b3', npc: 'barnaby', title: 'Rare wares', offer: "Collectors collect. Own six hats and boots and come and show me.", done: "A real collector. Here, for the shelf.", need: { k: 'own', n: 6 }, r: { gems: 25 } },
  { id: 'p1', npc: 'penny', title: 'Crumbs', offer: "The ovens eat coins like I eat buns. Find three coins about town, would you?", done: "Three! Warm hands, full pockets.", need: { k: 'type', t: 'coin', n: 3 }, r: { coin: 2 } },
  { id: 'p2', npc: 'penny', title: 'Taste test', offer: "Go and say hello to the Mayor and Barnaby, and come back and tell me what they said.", done: "Barnaby said that? Oh, he would.", need: { k: 'talk', ids: ['mayor', 'barnaby'] }, r: { gems: 15 } },
  { id: 'p3', npc: 'penny', title: 'Sweet tooth', offer: "Gems are good for the honey. Five of them, and I'll bake you something that sparkles.", done: "Sparkle buns! Tomorrow.", need: { k: 'give', cur: 'gems', n: 5 }, r: { coin: 5 } },
  { id: 'r1', npc: 'rio', title: 'First frame', offer: "Take any picture in the photo booth and save it to the album. Anything. A giraffe. You.", done: "Look at that composition. Marvellous.", need: { k: 'album', pred: 'any', n: 1 }, r: { coin: 2 } },
  { id: 'r2', npc: 'rio', title: 'Creature feature', offer: "Put a creature in a picture. One you've met. Save it to the album.", done: "A creature, framed. You've got an eye.", need: { k: 'album', pred: 'creature', n: 1 }, r: { gems: 20 } },
  { id: 'r3', npc: 'rio', title: 'Wild scene', offer: "A different scene from the first five, with at least two effects. Save it, and I'll hang it.", done: "Atmosphere! That's the word.", need: { k: 'album', pred: 'scene', n: 1 }, r: { gems: 25 } },
  { id: 'r4', npc: 'rio', title: 'Hat trick', offer: "Three pictures where she's wearing a hat. In the album, please.", done: "Three hatted portraits. The town will love them.", need: { k: 'album', pred: 'hat', n: 3 }, r: { gems: 30 } },
  { id: 'g1', npc: 'gus', title: 'Warm-up', offer: "Play any minigame at the arcade. Just once. I'll wait. I'm very patient. (I'm not.)", done: "That's the spirit!", need: { k: 'minis', n: 1 }, r: { coin: 2 } },
  { id: 'g2', npc: 'gus', title: 'Star power', offer: "Collect three stars across the minigames. Any three.", done: "Three stars! You're basically a constellation.", need: { k: 'stars', n: 3 }, r: { gems: 20 } },
  { id: 'g3', npc: 'gus', title: 'High roller', offer: "Get all three stars in one minigame. The three of them. In one.", done: "Three! In one! Legend.", need: { k: 'mini3' }, r: { gems: 35 } },
  { id: 'h1', npc: 'marina', title: 'Lost at sea', offer: "I lost my dockside boots off the pier. Grey-blue, with a yellow cuff. Find them, please.", done: "My boots! Keep them. They never fit.", need: { k: 'found', ids: ['hb_b1'] }, r: { coin: 3 } },
  { id: 'h2', npc: 'marina', title: 'Salty dog', offer: "Five things from the harbour. The sea gives, if you reach.", done: "The sea is generous when you're tall.", need: { k: 'dist', d: 'harbour', n: 5 }, r: { gems: 20 } },
  { id: 'h3', npc: 'marina', title: 'Night fishing', offer: "Come to the harbour after dark. Just stand with me.", done: "Quiet company. The best kind.", need: { k: 'night', d: 'harbour' }, r: { gems: 20 } },
  { id: 's1', npc: 'skye', title: 'Head in the clouds', offer: "There's a coin up near the top of the big antenna. Stretch for it. Neck all the way.", done: "All the way up. My hero.", need: { k: 'found', ids: ['rf_c3'] }, r: { coin: 3 } },
  { id: 's2', npc: 'skye', title: 'Signal boost', offer: "An aviator cap is spinning at the tip of that antenna. Fetch it before the wind does.", done: "Signal's perfect. And the hat's yours.", need: { k: 'found', ids: ['rf_h1'] }, r: { gems: 20 } },
  { id: 's3', npc: 'skye', title: 'View from above', offer: "Find everything on the rooftops. Everything.", done: "That's the whole roof. Nobody's ever done that.", need: { k: 'distAll', d: 'roofs' }, r: { gems: 40 } },
  { id: 'n1', npc: 'nova', title: 'Stargazer', offer: "Come to the Launchpad at night and look up with me.", done: "See? It's all so close.", need: { k: 'night', d: 'launch' }, r: { coin: 3 } },
  { id: 'n2', npc: 'nova', title: 'Night sky map', offer: "A star fragment fell near the telescope. Find it, and I'll finish my map.", done: "The map is complete!", need: { k: 'found', ids: ['ln_s1'] }, r: { gems: 20 } },
  { id: 'n3', npc: 'nova', title: 'To the Moon', offer: "Finish the Moon chapter, if you haven't. I want a report.", done: "You've been. You've really been. Tell me more.", need: { k: 'chapter', ch: 8 }, r: { gems: 30 } },
  { id: 'o1', npc: 'ossi', title: 'Down the hatch', offer: "Walk the whole Burrows. Come and see the grub farm at the far end.", done: "You see? It's not so dark.", need: { k: 'found', ids: ['bw_c1'] }, r: { coin: 3 } },
  { id: 'o2', npc: 'ossi', title: 'Grub hunt', offer: "The grubs are hungry. Bring me ten grubs, for the farm, and I'll have a gift ready.", done: "The farm thanks you. In its own way.", need: { k: 'give', cur: 'grubs', n: 10 }, r: { gems: 30 } },
  { id: 'o3', npc: 'ossi', title: 'The glow', offer: "There's a cluster of glowcaps in the ceiling, up past the lamps. Reach up and bring me one.", done: "Bright as the day we came down.", need: { k: 'found', ids: ['bw_sw'] }, r: { gems: 30 } }
];
const TOWN_ERR_BY_ID = {}; TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
function townErrandsOf(npc){ return TOWN_ERRANDS.filter(function(e){ return e.npc === npc; }); }
function townErrState(id){ return townData().err[id] | 0; }
/* the errand an NPC is offering or waiting on now: the first one she has not finished */
function townErrandFor(npc){
  const list = townErrandsOf(npc);
  for (let i = 0; i < list.length; i++) if (townErrState(list[i].id) < 2) return list[i];
  return null;
}
function townErrandAvailable(e){ return !!e && townOpen(TOWN_NPCS[e.npc].d === 'roam' ? 'square' : TOWN_NPCS[e.npc].d); }

/* what a photo in the album shows (decoded once and kept) */
const _townAlb = {};
function townAlbumInfo(code){
  if (_townAlb[code]) return _townAlb[code];
  let o = { any: true, creature: false, scene: false, hat: false, crowd: false };
  try {
    const r = photoFromCode(code);
    if (r.ok){
      const st = r.state, fx = st.items.filter(function(i){ return i.t === 'fx'; }).length, foes = st.items.length - fx;
      o = { any: true, creature: foes > 0, scene: st.bg >= 5 && fx >= 2, hat: !!(st.look && st.look.hat), crowd: st.items.length >= 5 };
    }
  } catch (e) {}
  return (_townAlb[code] = o);
}
/* how far an errand is: { cur, max, give } (give: it takes something away when it is handed in) */
function townNeed(er){
  const n = er.need, t = townData(), d = Save.data;
  switch (n.k){
    case 'visit': { let c = 0; n.ids.forEach(function(id){ if (t.vis[id]) c++; }); return { cur: c, max: n.ids.length }; }
    case 'night': return { cur: t.night[n.d] ? 1 : 0, max: 1 };
    case 'found': { let c = 0; n.ids.forEach(function(id){ if (t.found[id]) c++; }); return { cur: c, max: n.ids.length }; }
    case 'foundN': return { cur: Math.min(n.n, townFoundTotal()), max: n.n };
    case 'type': return { cur: Math.min(n.n, townFoundType(n.t)), max: n.n };
    case 'dist': return { cur: Math.min(n.n, townFoundIn(n.d)), max: n.n };
    case 'distAll': { const m = townItemsIn(n.d).length; return { cur: townFoundIn(n.d), max: m }; }
    case 'minis': return { cur: Math.min(n.n, miniData().plays | 0), max: n.n };
    case 'stars': return { cur: Math.min(n.n, typeof miniStarTotal === 'function' ? miniStarTotal() : 0), max: n.n };
    case 'mini3': { const s = miniData().stars; let best = 0; Object.keys(s).forEach(function(k){ best = Math.max(best, s[k] | 0); }); return { cur: best >= 3 ? 1 : 0, max: 1 }; }
    case 'album': { let c = 0; photoAlbum().forEach(function(e){ if (townAlbumInfo(e.c)[n.pred]) c++; }); return { cur: Math.min(n.n, c), max: n.n }; }
    case 'wear': {
      const md = miniData(), hat = accEquipped('hat'), boot = accEquipped('boot');
      if (n.what === 'hat') return { cur: hat ? 1 : 0, max: 1 };
      if (n.what === 'colours') return { cur: (wardChoice('skinCol') && ((md.hatCol | 0) || (md.bootCol | 0))) ? 1 : 0, max: 1 };
      return { cur: (hat && boot && wardChoice('gearCol')) ? 1 : 0, max: 1 };
    }
    case 'own': return { cur: Math.min(n.n, accOwnedCount()), max: n.n };
    case 'chapter': return { cur: townDoneCh(n.ch) ? 1 : 0, max: 1 };
    case 'talk': { let c = 0; n.ids.forEach(function(id){ if (t.talk[id]) c++; }); return { cur: c, max: n.ids.length }; }
    case 'give': {
      const need = n.coins ? n.coins * townCoin() : n.n, have = n.cur === 'gold' ? goldInt(d.gold) : n.cur === 'gems' ? (d.gems | 0) : (d.grubs | 0);
      return { cur: Math.min(need, have), max: need, give: true, curr: n.cur };
    }
  }
  return { cur: 0, max: 1 };
}
function townNeedText(er){
  const nd = townNeed(er), k = er.need.k;
  if (nd.give) return 'Hand over ' + fmt(nd.max) + ' ' + nd.curr + '  (' + fmt(nd.cur) + ' of ' + fmt(nd.max) + ')';
  const lab = { visit: 'Places visited', night: 'Be there after dark', found: 'Things found', foundN: 'Things found in town', type: 'Coins found', dist: 'Found in this district',
    distAll: 'Found in this district', minis: 'Minigames played', stars: 'Minigame stars', mini3: 'A minigame with three stars', album: 'Matching photos in the album',
    wear: 'Wearing it', own: 'Hats and boots owned', chapter: 'Chapter finished', talk: 'Spoken to' }[k] || 'Progress';
  return lab + ': ' + nd.cur + ' of ' + nd.max;
}
function townErrandReady(er){ const nd = townNeed(er); return nd.cur >= nd.max; }
