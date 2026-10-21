'use strict';
/* Longneck Town, second part: places you can go inside, more of the streets, and more people. */
/* ========================= 44zb. INTERIORS AND EXTRA STREETS ========================= */
/* Interiors are districts too (TOWN_DIST entries with indoor:true, not listed in TOWN_IDS): the same walking, neck and pickups, with a
   painted room instead of a street. A building with `to` leads to one; the interior's door (act 'out') returns to Town.back.
   Items with `in` are found inside an interior (their `d` is the street it belongs to, for the counts). This file adds to the tables
   of js/44u-town-data.js (more of each street, new people and errands) and wraps townPaintFar/Mid/Field, townProp, townBuilding,
   townUse and townNeed to know about the new kinds. */
TOWN_PAL.interior = { far: '#000', mid: '#000', ground: '#7A5A3A', path: '#8A6A44', line: 'rgba(0,0,0,.25)', walls: ['#E8D5B0'], roofs: ['#6A4A32'] };

/* ---- the rooms ---- */
const TOWN_ROOM = {
  bakery:  { wall: '#F4E3C0', wains: '#B8864E', stripe: 'rgba(214,170,110,.18)', floor: '#8A5E38', beam: '#7A5230' },
  cafe:    { wall: '#E9D2A8', wains: '#6E4A32', stripe: 'rgba(120,70,40,.1)', floor: '#7A5436', beam: '#5A3A24' },
  garage:  { wall: '#C9CED6', wains: '#4A5568', stripe: null, floor: '#6A6F78', beam: '#3A4252' },
  library: { wall: '#CDB68A', wains: '#5A3B22', stripe: 'rgba(90,60,30,.12)', floor: '#6A4A30', beam: '#3E2A18' },
  tailor:  { wall: '#F0D5DF', wains: '#B5547A', stripe: 'rgba(181,84,122,.12)', floor: '#8A6A5A', beam: '#8A3A5A' },
  hall:    { wall: '#E4DCCB', wains: '#6A5A44', stripe: null, floor: '#9A9486', beam: '#4A4034' },
  arcade:  { wall: '#2A1E44', wains: '#16102A', stripe: 'rgba(255,77,141,.1)', floor: '#241A38', beam: '#0E0A1E' },
  studio:  { wall: '#C7D6EC', wains: '#2A4A7A', stripe: null, floor: '#8A8F9A', beam: '#2A3A5A' },
  house:   { wall: '#E7D2B0', wains: '#8A5A3A', stripe: 'rgba(160,110,70,.14)', floor: '#7A5A3C', beam: '#5A3A24' },
  cottage: { wall: '#DCE6C8', wains: '#6A8A5A', stripe: 'rgba(100,140,80,.12)', floor: '#8A6E4A', beam: '#5A4A2A' }
};
function townRoomDef(id, name, room, w, spawn, over){
  const D = Object.assign({ id: id, name: name, w: w, spawn: spawn, theme: 'interior', room: room, indoor: true, left: null, right: null, open: function(){ return true; }, need: '',
    b: [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }], p: [], L: [], npcs: [], dig: [] }, over || {});
  TOWN_DIST[id] = D; return D;
}

/* the street each room belongs to, for "Found x of y" and the way back */
const TOWN_DOORS = { tailor: 'in_tailor', hall: 'in_hall', cafe: 'in_cafe', library: 'in_library', arcade: 'in_arcade', studio: 'in_studio' };

(function(){
  const S = TOWN_DIST.square, M = TOWN_DIST.market, P = TOWN_DIST.park, H = TOWN_DIST.harbour, R = TOWN_DIST.roofs, L = TOWN_DIST.launch, B = TOWN_DIST.burrows;
  /* doors on the buildings that had only a screen behind them */
  Object.keys(TOWN_DOORS).forEach(function(k){ TOWN_IDS.forEach(function(id){ const b = TOWN_DIST[id].b.find(function(x){ return x.id === k; }); if (b) b.to = TOWN_DOORS[k]; }); });
  /* more street: each district is longer, and the new parts are on its far end */
  S.w = 3000; M.w = 3150; P.w = 3300; H.w = 3000; R.w = 3000; L.w = 3000; B.w = 2800;
  S.b.push({ id: 'house1', kind: 'house', x: 2520, w: 250, h: 215, label: 'Granny Hoof’s', act: 'house', to: 'in_house1', tint: '#C9A27A' });
  S.p.push({ k: 'statue', x: 2370 }, { k: 'kiosk', x: 2640 }, { k: 'clocktower', x: 2780 }, { k: 'flowers', x: 2300 }, { k: 'hedge', x: 1600 }, { k: 'hedge', x: 520 }, { k: 'signpost', x: 700 }, { k: 'lamp', x: 2420 }, { k: 'poster', x: 1450 });
  S.L.push({ x: 2420, y: 360, r: 110 }, { x: 2780, y: 120, r: 140 }, { x: 2520, y: 400, r: 120 });
  M.b.push({ id: 'bakery', kind: 'bakery', x: 2560, w: 320, h: 220, label: 'Crumb’s Bakery', act: 'bakery', to: 'in_bakery' }, { id: 'garage', kind: 'garage', x: 2900, w: 300, h: 200, label: 'Torque Motors', act: 'garage', to: 'in_garage' });
  M.p.push({ k: 'cart', x: 2250 }, { k: 'lamp', x: 2380 }, { k: 'bench', x: 2100 }, { k: 'signpost', x: 760 }, { k: 'cat', x: 640 }, { k: 'poster', x: 1360 }, { k: 'lamp', x: 2800 });
  M.L.push({ x: 2380, y: 360, r: 110 }, { x: 2560, y: 400, r: 140 }, { x: 2900, y: 400, r: 140 });
  P.b.push({ id: 'cottage', kind: 'house', x: 3020, w: 230, h: 200, label: 'Mim’s Cottage', act: 'house', to: 'in_house2', tint: '#B7C9A0' });
  P.p.push({ k: 'bandstand', x: 2480 }, { k: 'cart', x: 2700 }, { k: 'ferris', x: 2830 }, { k: 'flowers', x: 2930 }, { k: 'bench', x: 2640 }, { k: 'lamp', x: 2600 }, { k: 'hedge', x: 1400 });
  P.L.push({ x: 2600, y: 360, r: 110 }, { x: 2830, y: 200, r: 170 }, { x: 3020, y: 400, r: 120 });
  H.p.push({ k: 'fishstall', x: 2260 }, { k: 'nets', x: 2060 }, { k: 'windmill', x: 2560 }, { k: 'crates', x: 2440 }, { k: 'barrel', x: 2360 }, { k: 'lamp', x: 2180 }, { k: 'flagpole', x: 2700 });
  H.L.push({ x: 2180, y: 360, r: 110 });
  R.p.push({ k: 'laundry', x: 2500 }, { k: 'coop', x: 2640 }, { k: 'skylight', x: 2800 }, { k: 'antenna', x: 2300 }, { k: 'vent', x: 2720 }, { k: 'lamp', x: 2420 });
  R.L.push({ x: 2420, y: 360, r: 110 });
  L.b.push({ id: 'tower', kind: 'ctower', x: 2540, w: 170, h: 360, label: 'Control Tower', act: 'ctower' });
  L.p.push({ k: 'tanks', x: 2740 }, { k: 'sock', x: 2830 }, { k: 'flagpole', x: 2380 }, { k: 'lamp', x: 2640 });
  L.L.push({ x: 2540, y: 120, r: 150 }, { x: 2680, y: 360, r: 110 });
  B.p.push({ k: 'rails', x: 2300 }, { k: 'minecart', x: 2330 }, { k: 'glowpool', x: 2470 }, { k: 'crystal', x: 2620 }, { k: 'crystal', x: 2700 }, { k: 'mush', x: 2250 });
  B.L.push({ x: 2470, y: 440, r: 150 }, { x: 2650, y: 380, r: 150 });
  B.dig = B.dig.concat([2400]); S.dig = S.dig.concat([2700]); M.dig = M.dig.concat([2700]); P.dig = P.dig.concat([3000]);
  /* the rooms */
  const door = function(extra){ return [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }].concat(extra || []); };
  townRoomDef('in_bakery', 'Crumb’s Bakery', 'bakery', 1100, 190, { b: door([{ id: 'counter', kind: 'counter', x: 560, w: 360, h: 100, label: 'The counter', act: 'bakery' }, { id: 'oven', kind: 'oven', x: 930, w: 150, h: 160, label: 'Oven', act: 'oven' }]),
    p: [{ k: 'sacks', x: 340 }, { k: 'plant', x: 1040 }], L: [{ x: 300, y: 80, r: 150 }, { x: 700, y: 80, r: 170 }, { x: 930, y: 380, r: 150 }], npcs: ['crumb'] });
  townRoomDef('in_cafe', 'Penny’s Café', 'cafe', 1100, 190, { b: door([{ id: 'table1', kind: 'table', x: 380, w: 130, h: 70, label: 'A table by the window', act: 'sit' }, { id: 'table2', kind: 'table', x: 620, w: 130, h: 70, label: 'A table in the corner', act: 'sit' },
      { id: 'bar', kind: 'bar', x: 920, w: 260, h: 110, label: 'The bar', act: 'order' }]),
    p: [{ k: 'plant', x: 230 }, { k: 'plant', x: 1050 }], L: [{ x: 380, y: 80, r: 150 }, { x: 620, y: 80, r: 150 }, { x: 920, y: 80, r: 170 }], npcs: [] });
  townRoomDef('in_garage', 'Torque Motors', 'garage', 1200, 190, { b: door([{ id: 'turntable', kind: 'turntable', x: 580, w: 280, h: 90, label: 'The showroom car', act: 'garage' }, { id: 'toolwall', kind: 'toolwall', x: 980, w: 200, h: 200, label: 'Tools', act: 'tools' }]),
    p: [{ k: 'tyres', x: 320 }, { k: 'tyres', x: 1120 }], L: [{ x: 300, y: 80, r: 160 }, { x: 580, y: 80, r: 200 }, { x: 900, y: 80, r: 160 }], npcs: ['torque'] });
  townRoomDef('in_library', 'The Library', 'library', 1400, 190, { b: door([{ id: 'sh1', kind: 'shelf', x: 400, w: 240, h: 290, label: 'The Bestiary shelf', act: 'lib-bestiary', tone: '#6A3A2A' }, { id: 'sh2', kind: 'shelf', x: 700, w: 240, h: 290, label: 'The Guide shelf', act: 'lib-guide', tone: '#2A4A6A' },
      { id: 'sh3', kind: 'shelf', x: 1000, w: 240, h: 290, label: 'The album shelf', act: 'lib-album', tone: '#4A5A2A' }]),
    p: [{ k: 'plant', x: 230 }, { k: 'plant', x: 1300 }], L: [{ x: 400, y: 80, r: 150 }, { x: 700, y: 80, r: 150 }, { x: 1000, y: 80, r: 150 }], npcs: ['dewey'] });
  townRoomDef('in_tailor', 'The Tailor', 'tailor', 1000, 190, { b: door([{ id: 'mirror', kind: 'mirror', x: 560, w: 150, h: 250, label: 'The long mirror (wardrobe)', act: 'mirror' }, { id: 'dummy1', kind: 'dummy', x: 360, w: 80, h: 200, label: 'A mannequin', act: 'dummy' }, { id: 'dummy2', kind: 'dummy', x: 800, w: 80, h: 200, label: 'A mannequin', act: 'dummy' }]),
    p: [{ k: 'plant', x: 940 }], L: [{ x: 360, y: 80, r: 150 }, { x: 800, y: 80, r: 150 }], npcs: [] });
  townRoomDef('in_hall', 'Herd Hall', 'hall', 1400, 190, { b: door([{ id: 'case1', kind: 'case', x: 420, w: 220, h: 200, label: 'The trophy case', act: 'case' }, { id: 'case2', kind: 'case', x: 1000, w: 220, h: 200, label: 'The records case', act: 'case' }, { id: 'plinth', kind: 'plinth', x: 710, w: 140, h: 150, label: 'A statue of her', act: 'plinth' }]),
    p: [{ k: 'plant', x: 1300 }], L: [{ x: 420, y: 80, r: 160 }, { x: 710, y: 80, r: 170 }, { x: 1000, y: 80, r: 160 }], npcs: [] });
  const cabs = []; for (let c = 1; c <= 13; c++) cabs.push({ id: 'cab' + c, kind: 'cab', x: 270 + (c - 1) * 100, w: 80, h: 150, label: 'Cabinet ' + c, act: 'cab', ch: c });
  townRoomDef('in_arcade', 'The Arcade', 'arcade', 1700, 190, { b: door(cabs.concat([{ id: 'hs', kind: 'scoreboard', x: 1590, w: 150, h: 170, label: 'The high-score board', act: 'scoreboard' }])),
    p: [], L: [{ x: 400, y: 120, r: 190 }, { x: 800, y: 120, r: 190 }, { x: 1200, y: 120, r: 190 }, { x: 1590, y: 160, r: 150 }], npcs: [] });
  townRoomDef('in_studio', 'The Photo Booth', 'studio', 900, 190, { b: door([{ id: 'tripod', kind: 'tripod', x: 480, w: 120, h: 200, label: 'The camera', act: 'photo' }]),
    p: [{ k: 'backdrop', x: 740 }], L: [{ x: 300, y: 80, r: 180 }, { x: 700, y: 80, r: 180 }], npcs: [] });
  townRoomDef('in_house1', 'Granny Hoof’s', 'house', 1000, 190, { b: door([{ id: 'sofa', kind: 'sofa', x: 400, w: 220, h: 100, label: 'The sofa', act: 'sit' }, { id: 'fire', kind: 'fire', x: 840, w: 150, h: 170, label: 'The fireplace', act: 'hearth' }]),
    p: [{ k: 'plant', x: 230 }], L: [{ x: 400, y: 80, r: 150 }, { x: 840, y: 340, r: 170 }], npcs: ['granny'] });
  townRoomDef('in_house2', 'Mim’s Cottage', 'cottage', 1000, 190, { b: door([{ id: 'bed', kind: 'bed', x: 400, w: 230, h: 90, label: 'The bed', act: 'sit' }, { id: 'stove', kind: 'fire', x: 840, w: 150, h: 170, label: 'The stove', act: 'hearth' }]),
    p: [{ k: 'plant', x: 640 }], L: [{ x: 400, y: 80, r: 150 }, { x: 840, y: 340, r: 170 }], npcs: ['mim'] });
})();
const TOWN_IN_IDS = Object.keys(TOWN_DIST).filter(function(k){ return TOWN_DIST[k].indoor; });
const TOWN_ROOM_PARENT = { in_tailor: 'square', in_hall: 'square', in_house1: 'square', in_bakery: 'market', in_cafe: 'market', in_garage: 'market', in_library: 'market', in_arcade: 'park', in_studio: 'park', in_house2: 'park' };

/* ---- more things to find ---- */
[
  { id: 'sq_c4', d: 'square', t: 'coin', x: 2600, h: 0, note: 'by the kiosk at the far end of the square' },
  { id: 'sq_c5', d: 'square', t: 'coin', x: 2780, h: 255, note: 'near the top of the clock tower' },
  { id: 'sq_g1', d: 'square', t: 'gem', x: 2900, h: 110, note: 'behind the clock tower' },
  { id: 'ho_c1', d: 'square', in: 'in_house1', t: 'coin', x: 840, h: 150, note: 'on the mantelpiece in Granny Hoof’s house' },
  { id: 'mk_c4', d: 'market', t: 'coin', x: 2300, h: 100, note: 'over the flower cart' },
  { id: 'mk_c5', d: 'market', t: 'coin', x: 2760, h: 215, note: 'above the lamp past the bakery' },
  { id: 'mk_s2', d: 'market', t: 'star', x: 2900, h: 270, note: 'on the garage sign' },
  { id: 'ba_c1', d: 'market', in: 'in_bakery', t: 'coin', x: 330, h: 90, note: 'in a flour sack in the bakery' },
  { id: 'li_c1', d: 'market', in: 'in_library', t: 'coin', x: 700, h: 170, note: 'on a high shelf in the library' },
  { id: 'li_g1', d: 'market', in: 'in_library', t: 'gem', x: 1000, h: 275, note: 'on the very top shelf of the library' },
  { id: 'ga_c1', d: 'market', in: 'in_garage', t: 'coin', x: 1120, h: 60, note: 'in a stack of tyres in the garage' },
  { id: 'pk_c4', d: 'park', t: 'coin', x: 2480, h: 150, note: 'on the roof of the bandstand' },
  { id: 'pk_c5', d: 'park', t: 'coin', x: 2830, h: 262, note: 'at the top of the big wheel' },
  { id: 'pk_s2', d: 'park', t: 'star', x: 2960, h: 190, note: 'over the flowerbed by the cottage' },
  { id: 'ho_c2', d: 'park', in: 'in_house2', t: 'coin', x: 840, h: 120, note: 'on the stove in Mim’s cottage' },
  { id: 'ar_c1', d: 'park', in: 'in_arcade', t: 'coin', x: 1400, h: 190, note: 'on top of a cabinet in the arcade' },
  { id: 'hb_c4', d: 'harbour', t: 'coin', x: 2360, h: 0, note: 'by the fish stall' },
  { id: 'hb_c5', d: 'harbour', t: 'coin', x: 2560, h: 235, note: 'on the sails of the windmill' },
  { id: 'hb_g2', d: 'harbour', t: 'gem', x: 2700, h: 120, note: 'by the flagpole at the end of the quay' },
  { id: 'rf_c4', d: 'roofs', t: 'coin', x: 2500, h: 215, note: 'above the washing line' },
  { id: 'rf_s3', d: 'roofs', t: 'star', x: 2800, h: 150, note: 'on the skylight' },
  { id: 'ln_c4', d: 'launch', t: 'coin', x: 2540, h: 285, note: 'at the very top of the control tower' },
  { id: 'ln_g2', d: 'launch', t: 'gem', x: 2740, h: 110, note: 'on the fuel tanks' },
  { id: 'bw_c4', d: 'burrows', t: 'coin', x: 2400, h: 0, note: 'by the mine cart' },
  { id: 'bw_c5', d: 'burrows', t: 'coin', x: 2540, h: 100, note: 'over the glowing pool' },
  { id: 'bw_g3', d: 'burrows', t: 'gem', x: 2650, h: 210, note: 'in the crystals at the far end' }
].forEach(function(it){ TOWN_ITEMS.push(it); TOWN_ITEM_BY_ID[it.id] = it; });
/* townItemsIn (44u) counts by street; this counts what is inside one room */
function townInItems(room){ return TOWN_ITEMS.filter(function(it){ return it.in === room; }); }

/* ---- the new people ---- */
Object.assign(TOWN_NPCS, {
  crumb:  { id: 'crumb', name: 'Crumb', d: 'in_bakery', x: 640, range: 60, habit: 'stand', fav: 'flowers', look: { coat: '#F2D9A0', spot: '#B8864E', pat: 1, hat: 'toque', s: 1.08 }, gift: { gems: 60, coin: 8 },
    say: ["Mind the flour. It gets everywhere.", "A loaf a day, and you're a better giraffe."], night: ["The ovens never really sleep."], rain: ["Rain brings in the hungry."] },
  torque: { id: 'torque', name: 'Torque', d: 'in_garage', x: 920, range: 70, habit: 'tinker', fav: 'book', look: { coat: '#9AB0C8', spot: '#3A5A7A', pat: 12, hat: 'cowboy', boot: 'cowboyb', s: 1.05 }, gift: { gems: 60, coin: 8 },
    say: ["Good engine, good road. That's all there is.", "A giraffe in a car. Never thought I'd see it."], night: ["Late shift. The best kind."], rain: ["Rain on the roof. Lovely."] },
  dewey:  { id: 'dewey', name: 'Dewey', d: 'in_library', x: 1090, range: 80, habit: 'stand', fav: 'book', look: { coat: '#C9B8DC', spot: '#5A3A8A', pat: 4, hat: 'beanie', s: 1.02 }, gift: { gems: 60, coin: 8 },
    say: ["Shh. Quiet voices. Well, you're a giraffe, so you're quiet already.", "The high shelves have the best books. Naturally."], night: ["The library is quietest after dark."], rain: ["Reading weather."] },
  granny: { id: 'granny', name: 'Granny Hoof', d: 'in_house1', x: 560, range: 50, habit: 'sit', fav: 'sweets', look: { coat: '#E8D5B8', spot: '#8A6A44', pat: 6, hat: 'flowers', s: 1.0 }, gift: { gems: 60, coin: 8 },
    say: ["Sit, sit. You look thin. Have you eaten?", "I knew your great-great-grandfather. Terrible neck. Magnificent hat."], night: ["Is it late? It's always late."], rain: ["Listen to that rain on the roof."] },
  mim:    { id: 'mim', name: 'Mim', d: 'in_house2', x: 580, range: 50, habit: 'stand', fav: 'flowers', look: { coat: '#F5C6D6', spot: '#C25A82', pat: 11, hat: 'party', boot: 'bunny', s: 0.9 }, gift: { gems: 60, coin: 8 },
    say: ["This is my cottage. It's small. It's perfect.", "I grow everything in the window box."], night: ["I stay up painting."], rain: ["Muddy boots by the door, please."] }
});
['crumb', 'torque', 'dewey', 'granny', 'mim'].forEach(function(id){ TOWN_NPC_LIST.push(id); });
Object.assign(TOWN_DIST.in_bakery, {}); /* the rooms already list their people */
TOWN_ERRANDS.push(
  { id: 'cr1', npc: 'crumb', title: 'Daily bread', offer: "Buy three loaves from me. It's good for you and it's good for the bakery.", done: "Three loaves in your pockets. You'll thank me in a run.", need: { k: 'stat', key: 'bought', n: 3 }, r: { coin: 2 } },
  { id: 'cr2', npc: 'crumb', title: 'Breadwinner', offer: "Eat five loaves in your runs. It's what they're for.", done: "Five! They did their job.", need: { k: 'stat', key: 'eaten', n: 5 }, r: { gems: 25 } },
  { id: 'tq1', npc: 'torque', title: 'Kick the tyres', offer: "Come in and see the showroom car. Just look.", done: "Every customer kicks the tyres. Respect.", need: { k: 'visit', ids: ['in_garage'] }, r: { coin: 2 } },
  { id: 'tq2', npc: 'torque', title: 'Test drive', offer: "Own a car. Then drive it around town. Houston, too.", done: "She drives like she was built for it.", need: { k: 'car' }, r: { gems: 30 } },
  { id: 'dw1', npc: 'dewey', title: 'Quiet please', offer: "Come and sit in the library, and just be quiet for a while.", done: "Ah. Perfect.", need: { k: 'visit', ids: ['in_library'] }, r: { coin: 2 } },
  { id: 'dw2', npc: 'dewey', title: 'Bookworm', offer: "Discover twenty creatures in the Bestiary. Then you'll have read the best book there is.", done: "Twenty entries. A scholar.", need: { k: 'bestiary', n: 20 }, r: { gems: 30 } },
  { id: 'gh1', npc: 'granny', title: 'Tea and biscuits', offer: "Say hello to Penny and Crumb for me. They never visit.", done: "They're good children. Here, take this.", need: { k: 'talk', ids: ['penny', 'crumb'] }, r: { coin: 3 } },
  { id: 'mm1', npc: 'mim', title: 'Nightlight', offer: "Come to the cottage after dark. It's cosy at night.", done: "See? Cosy.", need: { k: 'night', d: 'in_house2' }, r: { gems: 20 } }
);
TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
(function(){
  const tn = townNeed;
  townNeed = function(er){
    const n = er.need, t = townData();
    if (n.k === 'stat'){ const v = t.n[n.key] | 0; return { cur: Math.min(n.n, v), max: n.n }; }
    if (n.k === 'car') return { cur: townCarOwned() ? 1 : 0, max: 1 };
    if (n.k === 'bestiary') return { cur: Math.min(n.n, bestiaryCounts().creatures), max: n.n };
    return tn(er);
  };
})();


/* ---- painting ---- */
(function(){
  const pf = townPaintField, pfar = townPaintFar, pmid = townPaintMid, pp = townProp, pb = townBuilding;
  townPaintFar = function(c, D, W, H, R){ if (D.indoor) return; return pfar(c, D, W, H, R); };
  townPaintMid = function(c, D, W, H, R){ if (D.indoor) return; return pmid(c, D, W, H, R); };
  townPaintField = function(c, D, W, H, R){ if (D.indoor) return townPaintRoom(c, D, W, H, R); return pf(c, D, W, H, R); };
  townProp = function(c, D, p, P, r){ if (!townPropX(c, D, p, P, r)) pp(c, D, p, P, r); };
  townBuilding = function(c, D, b, P, r){ if (!townBuildingX(c, D, b, P, r)) pb(c, D, b, P, r); };
})();

function townPaintRoom(c, D, W, H, R){
  const K = TOWN_ROOM[D.room] || TOWN_ROOM.house, r = miniRng(D.w * 5 + D.id.length * 11);
  D._win = [];
  tRect(c, K.wall, 0, 0, W, TG);
  if (K.stripe){ c.fillStyle = K.stripe; for (let x = 0; x < W; x += 40) c.fillRect(x, 0, 20, TG - 90); }
  tRect(c, K.wains, 0, TG - 90, W, 90); tRect(c, 'rgba(0,0,0,.18)', 0, TG - 90, W, 5); tRect(c, 'rgba(255,255,255,.16)', 0, TG - 85, W, 2);
  for (let x = 0; x < W; x += 70){ tRect(c, 'rgba(0,0,0,.1)', x, TG - 84, 2, 84); }
  tRect(c, K.beam, 0, 0, W, 30); tRect(c, 'rgba(0,0,0,.25)', 0, 30, W, 5);
  for (let x = 80; x < W; x += 220){ tRect(c, K.beam, x, 0, 18, 40); }
  /* the floor, in boards */
  tRect(c, K.floor, 0, TG, W, 100); tRect(c, 'rgba(0,0,0,.2)', 0, TG, W, 3);
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.4;
  for (let y = TG + 22; y < 600; y += 24){ c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let i = 0; i < W / 30; i++){ const y = TG + Math.floor(r() * 4) * 24, x = r() * W; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 24); c.stroke(); }
  /* windows on the back wall, with daylight in them */
  const winN = Math.floor(W / 330);
  for (let i = 0; i < winN; i++){
    const wx = 220 + i * (W - 300) / Math.max(1, winN), wy = 80;
    if (D.room === 'arcade' || D.room === 'ilight' || D.room === 'gym' || D.room === 'garage' && i % 2 || window.UNI_ROOMS && UNI_ROOMS[D.room]) continue;
    tRect(c, '#4A3A2C', wx - 3, wy - 3, 84, 124); tRect(c, '#BFE3F6', wx, wy, 78, 118); tRect(c, 'rgba(255,255,255,.4)', wx + 6, wy + 6, 20, 106);
    tRect(c, '#4A3A2C', wx + 38, wy, 3, 118); tRect(c, '#4A3A2C', wx, wy + 56, 78, 3);
    tRect(c, '#C9A27A', wx - 10, wy + 118, 98, 8);
  }
  /* lamps hanging from the beams */
  D.L.forEach(function(l){ if (l.y < 140){ tRect(c, '#2A2A30', l.x - 1.5, 30, 3, l.y - 14); tPoly(c, '#E8C96A', [l.x - 18, l.y + 10, l.x + 18, l.y + 10, l.x + 8, l.y - 12, l.x - 8, l.y - 12]); tRect(c, '#FFF2B0', l.x - 12, l.y + 8, 24, 4); } });
  townRoomProps(c, D, K, r);
  for (let i = 0; i < D.p.length; i++) townProp(c, D, D.p[i], TOWN_PAL.interior, r);
  for (let i = 0; i < D.b.length; i++) townBuilding(c, D, D.b[i], TOWN_PAL.interior, r);
}
/* what hangs on the walls of each kind of room */
function townRoomProps(c, D, K, r){
  const W = D.w;
  switch (D.room){
    case 'bakery':
      for (let i = 0; i < 4; i++){ const x = 250 + i * 190; tRect(c, '#7A5230', x, 150, 120, 6); tRect(c, '#7A5230', x + 6, 156, 4, 40); tRect(c, '#7A5230', x + 110, 156, 4, 40); for (let k = 0; k < 3; k++) tEll(c, ['#D9A05A', '#E8B876', '#C98A44'][k], x + 24 + k * 36, 144, 15, 8); }
      tRound(c, '#FFFFFF', 740, 90, 110, 40, 6); c.fillStyle = '#7A4B2A'; c.font = 'bold 20px system-ui'; c.textAlign = 'center'; c.fillText('FRESH BREAD', 795, 117);
      break;
    case 'cafe':
      tRound(c, '#2E4A3A', 760, 90, 190, 100, 6); c.strokeStyle = '#B8864E'; c.lineWidth = 5; c.strokeRect(760, 90, 190, 100);
      c.fillStyle = '#F4F1E8'; c.font = '15px system-ui'; c.textAlign = 'left'; ['TEA  ·  2', 'BUN  ·  3', 'CAKE · 5', 'SOUP · 4'].forEach(function(l, i){ c.fillText(l, 780, 120 + i * 22); });
      break;
    case 'garage':
      for (let i = 0; i < 5; i++){ tCircle(c, '#2A2A34', 280 + i * 190, 190, 30); tCircle(c, '#C9CDD9', 280 + i * 190, 190, 14); }
      tRect(c, '#F2C230', 0, TG - 100, W, 8);
      break;
    case 'library':
      for (let x = 160; x < W - 100; x += 40){ if ((x > 270 && x < 1130)) continue; tRect(c, ['#6A3A2A', '#2A4A6A', '#5A6A2A', '#7A5A2A'][Math.floor(x / 40) % 4], x, 140, 30, 170); }
      c.fillStyle = '#E8D8B0'; c.beginPath(); c.arc(200, 120, 30, 0, TAU); c.fill(); c.strokeStyle = '#5A3B22'; c.lineWidth = 3; c.beginPath(); c.arc(200, 120, 30, 0, TAU); c.stroke();
      break;
    case 'tailor':
      for (let i = 0; i < 6; i++){ tRect(c, ['#C9628C', '#E8B7C9', '#8A5AA0', '#5A8AC0', '#F2C230', '#6BBB45'][i], 130 + i * 140, 150, 60, 80); tRect(c, 'rgba(0,0,0,.12)', 130 + i * 140, 150, 8, 80); }
      break;
    case 'hall':
      for (let i = 0; i < 13; i++){ const done = townDoneCh(i + 1); tPoly(c, done ? WARD[i + 1].c : 'rgba(80,70,60,.35)', [150 + i * 90, 40, 190 + i * 90, 40, 190 + i * 90, 104, 170 + i * 90, 90, 150 + i * 90, 104]); }
      tRect(c, '#9A2A2A', 160, TG - 8, W - 320, 8);
      break;
    case 'arcade':
      c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 60; i++) c.fillRect(r() * W, r() * (TG - 100), 2, 2);
      c.strokeStyle = '#FF4D8D'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 62); c.lineTo(W, 62); c.stroke(); c.strokeStyle = '#4DD8FF'; c.beginPath(); c.moveTo(0, 70); c.lineTo(W, 70); c.stroke();
      break;
    case 'studio':
      for (let i = 0; i < 4; i++){ tRect(c, ['#F2D9A0', '#9FD8F2', '#BFE0B0', '#F29AC0'][i], 520 + i * 70, 40, 60, 330); }
      break;
    case 'house': case 'cottage':
      tRound(c, '#C9A27A', 260, 110, 70, 90, 4); tRect(c, '#9FD8F2', 266, 116, 58, 78); tRect(c, '#E8D8B0', 600, 100, 90, 60); tCircle(c, '#8A6A44', 645, 130, 22);
      break;
  }
}

/* the extra scenery, drawn once into the street layer. returns true when it drew the kind */
function townPropX(c, D, p, P, r){
  const x = p.x, s = p.s || 1; let ok = true;
  c.save();
  switch (p.k){
    case 'clocktower':
      tEll(c, 'rgba(0,0,0,.18)', x, TG + 4, 60, 8);
      tRect(c, '#B8A890', x - 44, TG - 330, 88, 330); tRect(c, '#A89878', x - 52, TG - 346, 104, 22); tPoly(c, '#8A4A3A', [x - 56, TG - 346, x, TG - 420, x + 56, TG - 346]);
      for (let i = 0; i < 6; i++) tRect(c, 'rgba(0,0,0,.1)', x - 44, TG - 300 + i * 50, 88, 2);
      tCircle(c, '#FFFDF4', x, TG - 270, 34); c.strokeStyle = '#5A4A30'; c.lineWidth = 4; c.beginPath(); c.arc(x, TG - 270, 34, 0, TAU); c.stroke();
      c.lineWidth = 2; for (let i = 0; i < 12; i++){ const a = i * TAU / 12; c.beginPath(); c.moveTo(x + Math.cos(a) * 27, TG - 270 + Math.sin(a) * 27); c.lineTo(x + Math.cos(a) * 31, TG - 270 + Math.sin(a) * 31); c.stroke(); }
      tRound(c, '#6A4A32', x - 14, TG - 120, 28, 56, 14); tRound(c, '#3A2A1E', x - 12, TG - 118, 24, 52, 12);
      break;
    case 'statue':
      tEll(c, 'rgba(0,0,0,.18)', x, TG + 4, 60, 8);
      tRect(c, '#B8B2A4', x - 40, TG - 40, 80, 40); tRect(c, '#A8A294', x - 48, TG - 52, 96, 14);
      c.fillStyle = '#C9A24A'; c.beginPath(); c.ellipse(x, TG - 82, 24, 14, 0, 0, TAU); c.fill(); c.fillRect(x - 17, TG - 52, 6, 20); c.fillRect(x + 12, TG - 52, 6, 20);
      c.beginPath(); c.moveTo(x + 8, TG - 90); c.lineTo(x + 22, TG - 168); c.lineTo(x + 34, TG - 166); c.lineTo(x + 20, TG - 84); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(x + 34, TG - 170, 12, 7, -0.25, 0, TAU); c.fill();
      break;
    case 'kiosk':
      tRect(c, '#5A8AC0', x - 48, TG - 110, 96, 110); tPoly(c, '#2A4A7A', [x - 58, TG - 110, x, TG - 140, x + 58, TG - 110]); tRect(c, '#FFF6E0', x - 38, TG - 90, 76, 40);
      [['#D5352B', -30], ['#F2C230', -10], ['#4DA0D8', 10], ['#6BBB45', 30]].forEach(function(m){ tRect(c, m[0], x + m[1] - 6, TG - 86, 12, 30); });
      tRect(c, '#8A6642', x - 44, TG - 44, 88, 8);
      break;
    case 'hedge':
      tRound(c, '#3E7A3A', x - 60, TG - 44, 120, 44, 14); for (let i = 0; i < 6; i++) tCircle(c, '#4C8A44', x - 50 + i * 20, TG - 44, 12);
      break;
    case 'signpost':
      tRect(c, '#5A3B22', x - 3, TG - 130, 6, 130); [[-20, '#2F6A44'], [-50, '#6A3A32']].forEach(function(sg, i){ tPoly(c, sg[1], i ? [x - 44, TG - 130 - sg[0] + 50, x + 6, TG - 130 - sg[0] + 50, x + 18, TG - 110 - sg[0] + 50, x + 6, TG - 100 - sg[0] + 50, x - 44, TG - 100 - sg[0] + 50] : [x - 8, TG - 130, x + 46, TG - 130, x + 58, TG - 114, x + 46, TG - 100, x - 8, TG - 100]); });
      break;
    case 'poster':
      tRect(c, '#E8D8B0', x - 22, TG - 150, 44, 60); tRect(c, '#D5352B', x - 14, TG - 142, 28, 8); tRect(c, '#3A2A1E', x - 14, TG - 126, 28, 3); tRect(c, '#3A2A1E', x - 14, TG - 118, 20, 3); tRect(c, '#3A2A1E', x - 14, TG - 110, 24, 3);
      break;
    case 'cart':
      tRect(c, '#8A6642', x - 40, TG - 56, 80, 30); tCircle(c, '#2A2A34', x - 26, TG - 14, 12); tCircle(c, '#2A2A34', x + 26, TG - 14, 12); tRect(c, '#5A3B22', x - 40, TG - 100, 4, 46); tRect(c, '#5A3B22', x + 36, TG - 100, 4, 46);
      tAwning(c, x - 50, TG - 110, 100, 16, '#F29AC0', '#FFF4F8'); [['#F29AC0', -22], ['#FFD84D', 0], ['#FF8A5A', 22]].forEach(function(f){ tCircle(c, f[0], x + f[1], TG - 62, 9); });
      break;
    case 'cat':
      tEll(c, '#E8A838', x, TG - 214, 14, 9); tCircle(c, '#E8A838', x + 10, TG - 222, 8); tPoly(c, '#E8A838', [x + 5, TG - 228, x + 8, TG - 238, x + 11, TG - 228]); tPoly(c, '#E8A838', [x + 12, TG - 228, x + 15, TG - 238, x + 18, TG - 228]);
      break;
    case 'bandstand':
      tRect(c, '#8A6642', x - 100, TG - 34, 200, 34); tPoly(c, '#B5547A', [x - 120, TG - 150, x, TG - 200, x + 120, TG - 150]); tRect(c, '#B5547A', x - 120, TG - 150, 240, 8);
      for (let i = 0; i < 5; i++) tRect(c, '#F4F1E8', x - 104 + i * 52, TG - 142, 8, 108);
      tRect(c, '#5A3B22', x - 60, TG - 70, 6, 36); tRect(c, '#5A3B22', x + 54, TG - 70, 6, 36);
      break;
    case 'ferris':
      tPoly(c, '#6A6F78', [x - 70, TG, x - 6, TG - 140, x + 6, TG - 140, x - 50, TG]); tPoly(c, '#6A6F78', [x + 70, TG, x + 6, TG - 140, x - 6, TG - 140, x + 50, TG]);
      tCircle(c, '#3A3A44', x, TG - 140, 10); tRect(c, '#C9962F', x - 80, TG - 8, 160, 8);
      break;
    case 'windmill':
      tPoly(c, '#E8E0D0', [x - 44, TG, x - 26, TG - 190, x + 26, TG - 190, x + 44, TG]); tPoly(c, '#B5543C', [x - 34, TG - 190, x, TG - 240, x + 34, TG - 190]); tRect(c, '#5A3B22', x - 12, TG - 70, 24, 70);
      tRect(c, '#9FD8F2', x - 8, TG - 150, 16, 22);
      break;
    case 'fishstall':
      tRect(c, '#5A8AC0', x - 60, TG - 120, 5, 120); tRect(c, '#5A8AC0', x + 55, TG - 120, 5, 120); tAwning(c, x - 66, TG - 140, 132, 22, '#2A6AA0', '#F4F1E8');
      tRect(c, '#8A6642', x - 56, TG - 36, 112, 36); tRect(c, '#E8EAF0', x - 50, TG - 44, 100, 10); for (let i = 0; i < 4; i++) tEll(c, ['#9FB8D0', '#E89A5A', '#B8C8D8', '#F2C230'][i], x - 34 + i * 24, TG - 48, 11, 5);
      break;
    case 'nets':
      c.strokeStyle = '#8A6642'; c.lineWidth = 1.4; tRect(c, '#5A3B22', x - 60, TG - 110, 5, 110); tRect(c, '#5A3B22', x + 55, TG - 110, 5, 110);
      for (let i = 0; i < 8; i++){ c.beginPath(); c.moveTo(x - 58 + i * 16, TG - 104); c.lineTo(x - 56 + i * 16, TG - 40); c.stroke(); } for (let j = 0; j < 5; j++){ c.beginPath(); c.moveTo(x - 58, TG - 100 + j * 14); c.lineTo(x + 58, TG - 98 + j * 14); c.stroke(); }
      break;
    case 'flagpole':
      tRect(c, '#C9CDD9', x - 2, TG - 210, 4, 210); tCircle(c, '#F2C230', x, TG - 212, 4);
      break;
    case 'laundry':
      tRect(c, '#5A3B22', x - 90, TG - 160, 5, 160); tRect(c, '#5A3B22', x + 90, TG - 160, 5, 160);
      break;
    case 'coop':
      tRect(c, '#A57C52', x - 44, TG - 70, 88, 70); tPoly(c, '#6A4A32', [x - 52, TG - 70, x, TG - 100, x + 52, TG - 70]); tCircle(c, '#2A1E14', x, TG - 40, 14); tRect(c, '#8A6642', x - 20, TG - 14, 40, 6);
      break;
    case 'skylight':
      tPoly(c, '#BFE3F6', [x - 50, TG, x - 36, TG - 50, x + 36, TG - 50, x + 50, TG]); c.strokeStyle = '#C9CDD9'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 50, TG); c.lineTo(x - 36, TG - 50); c.lineTo(x + 36, TG - 50); c.lineTo(x + 50, TG); c.stroke(); c.beginPath(); c.moveTo(x, TG); c.lineTo(x, TG - 50); c.stroke();
      break;
    case 'tanks':
      for (let i = 0; i < 2; i++){ tRound(c, '#E8EAF0', x - 56 + i * 62, TG - 120, 50, 120, 24); tRect(c, '#D5352B', x - 56 + i * 62, TG - 80, 50, 12); tRect(c, 'rgba(0,0,0,.1)', x - 22 + i * 62, TG - 120, 14, 120); }
      break;
    case 'sock':
      tRect(c, '#C9CDD9', x - 2, TG - 120, 4, 120);
      break;
    case 'rails':
      tRect(c, '#3A3A44', x - 130, TG + 8, 520, 4); tRect(c, '#3A3A44', x - 130, TG + 20, 520, 4); for (let i = 0; i < 18; i++) tRect(c, '#5A3B22', x - 126 + i * 30, TG + 4, 6, 24);
      break;
    case 'minecart':
      break;
    case 'glowpool':
      tEll(c, '#1E6A7A', x, TG + 22, 100, 18); tEll(c, '#4DD8C8', x, TG + 20, 88, 13); tEll(c, 'rgba(255,255,255,.35)', x - 20, TG + 16, 34, 4);
      break;
    case 'crystal':
      tPoly(c, '#9A6AE8', [x - 14, TG, x - 6, TG - 70, x + 4, TG]); tPoly(c, '#C9A0FF', [x - 4, TG, x + 8, TG - 100, x + 20, TG]); tPoly(c, '#7A4AC8', [x + 10, TG, x + 22, TG - 56, x + 32, TG]);
      break;
    case 'plant':
      tRound(c, '#8A5A32', x - 14, TG - 34, 28, 34, 6); for (let i = 0; i < 5; i++){ c.strokeStyle = '#3E7A3A'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG - 34); c.quadraticCurveTo(x + (i - 2) * 16, TG - 70, x + (i - 2) * 22, TG - 94 + Math.abs(i - 2) * 10); c.stroke(); }
      break;
    case 'sacks':
      tRound(c, '#E8D8B0', x - 30, TG - 46, 40, 46, 12); tRound(c, '#DDC99A', x + 6, TG - 40, 40, 40, 12); tRect(c, '#B8864E', x - 22, TG - 38, 24, 4);
      break;
    case 'tyres':
      for (let i = 0; i < 3; i++){ tEll(c, '#1E1E24', x, TG - 12 - i * 22, 36, 11); tEll(c, '#44444C', x, TG - 14 - i * 22, 22, 6); }
      break;
    case 'backdrop':
      tRect(c, '#9FD8F2', x - 90, TG - 280, 180, 280); tCircle(c, '#FFF2B0', x + 40, TG - 220, 24); tPoly(c, '#6BBB45', [x - 90, TG, x - 40, TG - 110, x + 10, TG - 40, x + 60, TG - 130, x + 90, TG]);
      break;
    default: ok = false;
  }
  c.restore();
  return ok;
}
function townBuildingX(c, D, b, P, r){
  const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h; let ok = true;
  c.save();
  switch (b.kind){
    case 'door':
      tRound(c, '#3A2A1E', x - 54, TG - 140, 108, 140, 8); tRound(c, '#7A4B2A', x - 48, TG - 134, 96, 134, 6); tCircle(c, '#E9C46A', x + 34, TG - 66, 4);
      tRect(c, '#9FD8F2', x - 30, TG - 118, 60, 40); tRect(c, '#3A2A1E', x - 1.5, TG - 118, 3, 40);
      tSign(c, 'OUT', x, TG - 156, 80, '#2F6A44');
      break;
    case 'house':
      tRect(c, b.tint || '#C9A27A', x0, top, W, h); tRect(c, 'rgba(0,0,0,.1)', x0, top, W, 10);
      tPoly(c, '#8A4A3A', [x0 - 14, top, x, top - 64, x0 + W + 14, top]); tRect(c, '#6A3A2E', x0 + W - 52, top - 52, 24, 40);
      tWin(c, D, x0 + 26, top + 44, 50, 54, '#BFE0F4'); tDoor(c, x0 + W - 66, 52, 96, '#6A3A2E'); tRect(c, '#4E7A3A', x0 + 14, TG - 26, 70, 26);
      for (let i = 0; i < 4; i++) tCircle(c, ['#F29AC0', '#FFD84D', '#FFFFFF', '#FF8A5A'][i], x0 + 28 + i * 16, TG - 30, 6);
      tSign(c, b.label, x, top - 20, 180, '#4A3624');
      break;
    case 'bakery':
      tRect(c, '#F2D9A0', x0, top, W, h); tRect(c, '#D9B070', x0, top, W, 14); tRect(c, '#8A4B3A', x0 - 8, top - 14, W + 16, 18);
      tRect(c, '#7A4B3A', x0 + 38, top - 70, 30, 56);
      tAwning(c, x0 + 8, top + 34, W - 16, 26, '#E8B876', '#FFF6E0');
      tWin(c, D, x0 + 26, top + 74, 110, 60, '#FFE9A8');
      for (let i = 0; i < 3; i++) tEll(c, ['#D9A05A', '#E8B876', '#C98A44'][i], x0 + 48 + i * 32, top + 128, 14, 8);
      tDoor(c, x0 + W - 58, 54, 96, '#7A3B2A'); tSign(c, b.label, x, top - 2, 230, '#7A3B2A');
      break;
    case 'garage':
      tRect(c, '#C9CED6', x0, top, W, h); tRect(c, '#4A5568', x0, top, W, 16); tRect(c, '#3A4252', x0 - 6, top - 12, W + 12, 14);
      tRect(c, '#8A93A8', x0 + 24, top + 46, W - 150, h - 46); for (let i = 1; i < 6; i++) tRect(c, 'rgba(0,0,0,.18)', x0 + 24, top + 46 + i * ((h - 46) / 6), W - 150, 2);
      tDoor(c, x0 + W - 52, 50, 92, '#3A4252'); tWin(c, D, x0 + W - 78, top + 40, 50, 30, '#BFE0F4');
      tCircle(c, '#D5352B', x0 + 40, top + 28, 9); tSign(c, b.label, x, top - 30, 220, '#3A4252');
      break;
    case 'ctower':
      tPoly(c, '#E8EAF0', [x - 60, TG, x - 40, top + 80, x + 40, top + 80, x + 60, TG]); tRect(c, '#4A6ED8', x - 50, TG - 120, 100, 14);
      tRect(c, '#BFE8F8', x - 50, top + 20, 100, 60); D._win.push({ x: x - 50, y: top + 20, w: 100, h: 60 }); tRect(c, '#3A3A44', x - 56, top + 12, 112, 10); tRect(c, '#3A3A44', x - 56, top + 80, 112, 8);
      tRect(c, '#6A6F78', x - 2, top - 40, 4, 52); tDoor(c, x, 40, 70, '#2F4A8A');
      break;
    case 'counter':
      tRect(c, '#B8864E', x0, TG - 80, W, 80); tRect(c, '#8A5A32', x0 - 8, TG - 90, W + 16, 14); tRect(c, 'rgba(0,0,0,.16)', x0, TG - 40, W, 3);
      tRect(c, 'rgba(190,230,250,.55)', x0 + 14, TG - 150, W - 28, 60); tRect(c, '#C9CDD9', x0 + 14, TG - 150, W - 28, 4);
      for (let i = 0; i < 6; i++) tEll(c, ['#D9A05A', '#E8B876', '#C98A44', '#F2D9A0'][i % 4], x0 + 40 + i * 52, TG - 106, 17, 9);
      tEll(c, '#E8D8B0', x0 + W - 30, TG - 96, 12, 8);
      break;
    case 'oven':
      tRound(c, '#6A5A52', x0, TG - 160, W, 160, 12); tRound(c, '#2A1E1A', x0 + 24, TG - 120, W - 48, 80, 8); tRound(c, '#FF9A3A', x0 + 34, TG - 108, W - 68, 56, 6);
      tRect(c, '#4A3A34', x0 + 20, TG - 160, W - 40, 10);
      break;
    case 'table':
      tRect(c, '#6A4A32', x - 4, TG - 52, 8, 52); tEll(c, '#8A5A32', x, TG - 54, W / 2, 11); tEll(c, '#A57C52', x, TG - 57, W / 2 - 4, 8);
      tRect(c, '#5A3B22', x - 62, TG - 36, 6, 36); tRect(c, '#5A3B22', x + 56, TG - 36, 6, 36); tRect(c, '#7A5230', x - 68, TG - 40, 24, 6); tRect(c, '#7A5230', x + 44, TG - 40, 24, 6);
      tRect(c, '#FFFFFF', x - 12, TG - 74, 16, 16); tRect(c, '#C9A27A', x + 14, TG - 70, 12, 12);
      break;
    case 'bar':
      tRect(c, '#5A3B22', x0, TG - 100, W, 100); tRect(c, '#8A5A32', x0 - 6, TG - 108, W + 12, 12);
      tRect(c, '#C9CDD9', x0 + 20, TG - 176, 50, 66); tRect(c, '#2A2A34', x0 + 28, TG - 168, 34, 22); tCircle(c, '#D5352B', x0 + 90, TG - 124, 8);
      for (let i = 0; i < 4; i++){ tRect(c, 'rgba(255,255,255,.6)', x0 + 120 + i * 30, TG - 130, 14, 22); }
      break;
    case 'turntable':
      tEll(c, '#3A3A44', x, TG + 6, W / 2, 16); tEll(c, '#6A6F78', x, TG, W / 2 - 8, 12);
      break;
    case 'toolwall':
      tRect(c, '#8A6642', x0, TG - 240, W, 200); for (let i = 0; i < 6; i++){ tRect(c, '#C9CDD9', x0 + 14 + i * 28, TG - 224 + (i % 2) * 20, 6, 70); tCircle(c, '#D5352B', x0 + 17 + i * 28, TG - 224 + (i % 2) * 20, 8); }
      tRect(c, '#D5352B', x0 + 14, TG - 120, W - 28, 80);
      break;
    case 'shelf': {
      tRect(c, '#3E2A18', x0 - 6, TG - h, W + 12, h); tRect(c, '#5A3B22', x0, TG - h + 6, W, h - 6);
      const cols = ['#6A3A2A', '#2A4A6A', '#5A6A2A', '#7A5A2A', '#8A2A3A', '#4A3A6A'];
      for (let row = 0; row < 4; row++){ tRect(c, '#3E2A18', x0, TG - h + 6 + row * 70, W, 5); let bx = x0 + 6, i = 0; while (bx < x0 + W - 14){ const bw = 8 + ((i * 7) % 7), bh = 46 + ((i * 11 + row * 5) % 16); tRect(c, i % 4 ? cols[(i + row) % 6] : (b.tone || cols[0]), bx, TG - h + 6 + row * 70 + 66 - bh, bw, bh); bx += bw + 1; i++; } }
      break;
    }
    case 'mirror':
      tRound(c, '#C9A24A', x0 - 6, TG - h - 6, W + 12, h + 6, 14); tRound(c, '#CFE6F2', x0, TG - h, W, h - 4, 10); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(x0 + 18, TG - h + 6); c.lineTo(x0 + 60, TG - h + 6); c.lineTo(x0 + 18, TG - h + 90); c.closePath(); c.fill();
      break;
    case 'dummy':
      tRect(c, '#5A3B22', x - 2, TG - 60, 4, 60); tRect(c, '#5A3B22', x - 20, TG - 4, 40, 4); tRound(c, '#E8D8C0', x - 22, TG - 168, 44, 100, 16); tCircle(c, '#E8D8C0', x, TG - 182, 12); tRound(c, '#C9628C', x - 22, TG - 140, 44, 52, 10);
      break;
    case 'case':
      tRect(c, '#4A3A28', x0, TG - h, W, h); tRect(c, 'rgba(190,230,250,.55)', x0 + 8, TG - h + 8, W - 16, h - 16); c.strokeStyle = '#C9A24A'; c.lineWidth = 4; c.strokeRect(x0 + 8, TG - h + 8, W - 16, h - 16);
      tRect(c, '#8A6A3A', x0 + 8, TG - 66, W - 16, 6); for (let i = 0; i < 4; i++){ tCircle(c, '#FFD84D', x0 + 40 + i * 44, TG - 90, 14); tRect(c, '#FFD84D', x0 + 36 + i * 44, TG - 78, 8, 12); tRect(c, '#FFD84D', x0 + 28 + i * 44, TG - 70, 24, 4); }
      break;
    case 'plinth':
      tRect(c, '#B8B2A4', x0, TG - 60, W, 60); tRect(c, '#A8A294', x0 - 8, TG - 74, W + 16, 16);
      c.fillStyle = '#C9A24A'; c.beginPath(); c.ellipse(x, TG - 106, 30, 17, 0, 0, TAU); c.fill(); c.fillRect(x - 20, TG - 74, 7, 24); c.fillRect(x + 14, TG - 74, 7, 24);
      c.beginPath(); c.moveTo(x + 10, TG - 116); c.lineTo(x + 26, TG - 210); c.lineTo(x + 40, TG - 208); c.lineTo(x + 24, TG - 108); c.closePath(); c.fill(); c.beginPath(); c.ellipse(x + 40, TG - 214, 14, 8, -0.25, 0, TAU); c.fill();
      break;
    case 'cab': {
      const un = miniUnlocked(b.ch), col = WARD[13 + b.ch] ? WARD[13 + b.ch].c : '#FF4D8D';
      tRound(c, '#16102A', x - 36, TG - 150, 72, 150, 8); tRect(c, '#2A1E44', x - 30, TG - 144, 60, 14); tRound(c, un ? '#0E1A2A' : '#1A1A1A', x - 28, TG - 124, 56, 50, 4);
      if (un){ tRound(c, col, x - 24, TG - 120, 48, 42, 3); c.fillStyle = 'rgba(255,255,255,.55)'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.fillText(String(b.ch), x, TG - 90); }
      else { c.fillStyle = '#FF6A5A'; c.font = 'bold 10px system-ui'; c.textAlign = 'center'; c.fillText('OUT OF', x, TG - 100); c.fillText('ORDER', x, TG - 88); }
      tRect(c, '#4A3A6A', x - 30, TG - 66, 60, 26); tCircle(c, un ? '#FF4D8D' : '#555', x - 14, TG - 54, 6); tCircle(c, un ? '#FFD84D' : '#555', x + 4, TG - 54, 4); tCircle(c, un ? '#4DD8FF' : '#555', x + 18, TG - 54, 4);
      break;
    }
    case 'scoreboard':
      tRect(c, '#0E0A1E', x0, TG - 190, W, 190); c.strokeStyle = '#FF4D8D'; c.lineWidth = 4; c.strokeRect(x0 + 4, TG - 186, W - 8, 182);
      c.fillStyle = '#4DD8FF'; c.font = 'bold 15px monospace'; c.textAlign = 'center'; c.fillText('HIGH SCORES', x, TG - 164);
      for (let i = 0; i < 5; i++){ tRect(c, 'rgba(255,255,255,.4)', x0 + 16, TG - 144 + i * 24, 70, 5); tRect(c, '#FFD84D', x0 + W - 66, TG - 144 + i * 24, 40, 5); }
      break;
    case 'tripod':
      c.strokeStyle = '#3A3A44'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG - 120); c.lineTo(x - 44, TG); c.moveTo(x, TG - 120); c.lineTo(x + 44, TG); c.moveTo(x, TG - 120); c.lineTo(x, TG); c.stroke();
      tRound(c, '#2A2A34', x - 40, TG - 190, 80, 66, 8); tCircle(c, '#1E2A3A', x + 30, TG - 158, 22); tCircle(c, '#5BA2CE', x + 30, TG - 158, 14); tCircle(c, '#FFFFFF', x + 26, TG - 163, 4); tRect(c, '#D5352B', x - 28, TG - 182, 14, 10);
      break;
    case 'sofa':
      tRound(c, '#8A3A4A', x0, TG - 80, W, 80, 14); tRound(c, '#A64A5A', x0 + 14, TG - 54, W - 28, 44, 10); tRound(c, '#7A2A3A', x0 - 6, TG - 70, 24, 70, 8); tRound(c, '#7A2A3A', x0 + W - 18, TG - 70, 24, 70, 8);
      tRound(c, '#E8D8B0', x0 + 40, TG - 76, 36, 34, 8);
      break;
    case 'fire':
      tRect(c, '#8A7A6A', x0, TG - h, W, h); tRect(c, '#6A5A4A', x0 - 8, TG - h - 12, W + 16, 14); tRound(c, '#1E1612', x0 + 24, TG - 100, W - 48, 100, 10);
      tRect(c, '#7A4A2A', x0 + 40, TG - 40, W - 80, 8);
      break;
    case 'bed':
      tRect(c, '#5A3B22', x0, TG - 70, W, 70); tRound(c, '#E8D5E0', x0 + 10, TG - 90, W - 20, 50, 12); tRound(c, '#C25A82', x0 + 70, TG - 84, W - 80, 44, 10); tRound(c, '#FFFFFF', x0 + 14, TG - 94, 52, 32, 12);
      tRect(c, '#5A3B22', x0 - 4, TG - 110, 10, 110);
      break;
    default: ok = false;
  }
  c.restore();
  return ok;
}

/* ---- one best-friend gift each ---- */
/* Sixteen people, sixteen different things: a hat, boots or a colour that nobody else gives and that is not on the wheel. */
const TOWN_GIFT_OF = {
  mayor: { acc: 'bicorne' }, tilly: { acc: 'bow' }, rio: { acc: 'visor' }, nova: { acc: 'nightcap' }, granny: { acc: 'bonnet' }, dewey: { acc: 'mortarboard' }, torque: { acc: 'welder' }, skye: { acc: 'antennahat' },
  gus: { acc: 'hightops' }, marina: { acc: 'waders' }, crumb: { acc: 'clogs' }, ossi: { acc: 'felt' },
  barnaby: { colour: 32 }, penny: { colour: 33 }, mim: { colour: 34 }, dot: { colour: 35 }
};
Object.keys(TOWN_GIFT_OF).forEach(function(id){ if (TOWN_NPCS[id]) TOWN_NPCS[id].gift = TOWN_GIFT_OF[id]; });
function townGiftName(id){
  const g = TOWN_GIFT_OF[id]; if (!g) return 'a surprise';
  return g.acc ? ACC_BY_ID[g.acc].name : 'the colour ' + WARD[g.colour].name;
}
/* hand it over (only once: a colour is a flag, a hat or boots go to her wardrobe); returns what to say */
function townGrantGift(id){
  const g = TOWN_GIFT_OF[id], t = townData(); if (!g) return '';
  if (g.acc){ if (!accOwned(g.acc)){ const pz = { item: ACC_BY_ID[g.acc] }; miniAward(pz); } }
  else t.found['gift_' + id] = 1;
  Save.write();
  return townGiftName(id);
}
