'use strict';
/* Longneck Town, fifteenth part: insides for Hayfield Village and Driftwood Cove, and bigger baskets. */
/* ========================= 44zr. FARM AND ISLE INTERIORS, CARRYING UPGRADES ========================= */
/* 1 EIGHT ROOMS: the corn stand, the barn, the hen coop and the farmhouse (Hayfield Village); the cottage, the fish stall, the crab shack and the
     lighthouse (Driftwood Cove). Each street building now has a door (`to`), and the thing it used to do (corn shop, cargo board, eggs, fish
     shop, crab shop) is inside, with its keeper. Painted with the rules of 44zk: everything stands on the floor or hangs from something visible.
     The lighthouse stairs climb to the top, and the view fills in the sea chart around the island.
   2 CARRYING UPGRADES: six, all expensive. A bigger corn basket (Hollis), fish cooler (Brine) and crab pot (Pearl), two levels each: +5 of
     that item per level, from 10 to 20. Save: town.farm.cornLv, town.sea.fishLv, town.sea.crabLv. (The oven still raises the bread satchel.) */
const CARRY_UP = {
  corn: { name: 'Corn basket', who: 'Hollis', price: [60000, 150000], noun: 'cobs' },
  fish: { name: 'Fish cooler', who: 'Brine', price: [70000, 170000], noun: 'fish' },
  crab: { name: 'Crab pot', who: 'Pearl', price: [80000, 190000], noun: 'crabs' }
};
function carryLv(k){ const t = townData(), o = k === 'corn' ? t.farm : t.sea; return (o && (o[k === 'corn' ? 'cornLv' : k + 'Lv'] | 0)) || 0; }       /* reads the raw save: farmData() and seaData() call the caps */
function cornCap(){ return CORN_CAP + 5 * Math.min(2, carryLv('corn')); }
function seaCap(k){ return 10 + 5 * Math.min(2, carryLv(k)); }
function carryBuy(k){
  const U = CARRY_UP[k], lv = carryLv(k); if (lv >= 2) return false;
  if (goldInt(Save.data.gold) < U.price[lv]){ SFX.deny(); return false; }
  Save.data.gold -= U.price[lv];
  if (k === 'corn') farmData().cornLv = lv + 1; else seaData()[k + 'Lv'] = lv + 1;
  Save.write(); SFX.buy(); SFX.level(); townToast(U.name + ' upgraded: holds ' + (k === 'corn' ? cornCap() : seaCap(k)) + ' ' + U.noun + '.', '#BFFF9A'); return true;
}
function carryRow(k){
  const U = CARRY_UP[k], lv = carryLv(k), gold = goldInt(Save.data.gold), cap = k === 'corn' ? cornCap() : seaCap(k);
  return lv >= 2 ? 'The ' + U.name.toLowerCase() + ' is as big as it gets: <b>holds ' + cap + ' ' + U.noun + '</b>.'
    : '<button class="chalk" data-a="town-up-' + k + '"' + (gold >= U.price[lv] ? '' : ' disabled') + '>' + (lv ? 'Even bigger ' : 'Bigger ') + U.name.toLowerCase() + '<small>' + fmt(U.price[lv]) + ' gold: holds ' + (cap + 5) + ' ' + U.noun + '</small></button><div class="stock">' + U.name + ' level ' + lv + ' of 2: holds ' + cap + '</div>';
}
(function(){
  ['corn', 'fish', 'crab'].forEach(function(k){
    const fn = k === 'corn' ? 'townShowCornShop' : k === 'fish' ? 'townShowFishShop' : 'townShowCrabShop', orig = window[fn];
    window[fn] = function(){
      const r = orig.apply(this, arguments);
      const pnl = document.querySelector('#overlay .panel'), foot = pnl && pnl.querySelector('.tp-foot');
      if (foot){ const d = document.createElement('div'); d.className = 'ovenrow'; d.innerHTML = carryRow(k); pnl.insertBefore(d, foot); }
      return r;
    };
  });
  const h = handleTownAction;
  handleTownAction = function(a){
    const m = /^town-up-(corn|fish|crab)$/.exec(a);
    if (m){ carryBuy(m[1]); (m[1] === 'corn' ? townShowCornShop : m[1] === 'fish' ? townShowFishShop : townShowCrabShop)(); return true; }
    return h(a);
  };
})();

/* ---- the sea chart from the lighthouse ---- */
function seaRevealAround(wx, wy, rad){
  const d = seaData(), cells = SEA_MAP_N * SEA_MAP_N, arr = (d.map + '0'.repeat(cells)).slice(0, cells).split('');
  const cx = Math.floor(wx / SEA_MAP_C), cy = Math.floor(wy / SEA_MAP_C); let n = 0;
  for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++){
    if (dx * dx + dy * dy > rad * rad) continue; const X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= SEA_MAP_N || Y >= SEA_MAP_N) continue;
    const i = Y * SEA_MAP_N + X; if (arr[i] !== '1'){ arr[i] = '1'; n++; }
  }
  d.map = arr.join(''); if (n) Save.write(); return n;
}

/* ---- the rooms ---- */
(function(){
  TOWN_ROOM.farmshop = { wall: '#F0E2B0', wains: '#9A7A3A', stripe: 'rgba(200,170,60,.14)', floor: '#9A7A4A', beam: '#6A4A22' };
  TOWN_ROOM.barn = { wall: '#B8734A', wains: '#8A4A2C', stripe: 'rgba(60,20,10,.18)', floor: '#8A6A44', beam: '#4A2A18' };
  TOWN_ROOM.coop = { wall: '#E8D8B0', wains: '#A57C52', stripe: 'rgba(120,90,50,.12)', floor: '#B89A62', beam: '#6A4A32' };
  TOWN_ROOM.fhouse = { wall: '#F2E6C4', wains: '#6A8A5A', stripe: 'rgba(100,140,80,.12)', floor: '#8A6A44', beam: '#5A4A2A' };
  TOWN_ROOM.icottage = { wall: '#E4EEF0', wains: '#4A7A9A', stripe: 'rgba(60,110,150,.1)', floor: '#B89A66', beam: '#4A5A6A' };
  TOWN_ROOM.ifish = { wall: '#D8E6EC', wains: '#3A6A8A', stripe: 'rgba(40,90,130,.12)', floor: '#8A8F94', beam: '#3A4A5A' };
  TOWN_ROOM.icrab = { wall: '#F0D8C0', wains: '#B5603A', stripe: 'rgba(180,90,50,.12)', floor: '#9A7A58', beam: '#6A3A22' };
  TOWN_ROOM.ilight = { wall: '#F4F1E8', wains: '#C9503C', stripe: null, floor: '#8A8A90', beam: '#5A5A64' };
  const door = function(extra){ return [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }].concat(extra || []); };
  townRoomDef('in_fstand', 'Hollis’s Corn Stand', 'farmshop', 1000, 190, { b: door([
      { id: 'counter', kind: 'fs_counter', x: 520, w: 340, h: 100, label: 'The corn counter', act: 'cornshop' },
      { id: 'jars', kind: 'fs_shelves', x: 900, w: 140, h: 250, label: 'The shelves', act: 'fm-look', say: 'Jars of pickled corn, jars of honey, jars of something nobody has dared open. Each one has a label in Hollis’s very small writing.' }]),
    p: [{ k: 'fr_crates', x: 300 }], L: [{ x: 360, y: 80, r: 150 }, { x: 700, y: 80, r: 160 }], npcs: ['hollis'] });
  townRoomDef('in_barn', 'Marge’s Barn', 'barn', 1500, 190, { b: door([
      { id: 'board', kind: 'fb_board', x: 520, w: 220, h: 240, label: 'The cargo board', act: 'barn' }]),
    p: [{ k: 'fr_crates', x: 880 }, { k: 'fr_tractor', x: 1160 }, { k: 'fr_bales', x: 1380 }], L: [{ x: 300, y: 80, r: 170 }, { x: 760, y: 80, r: 190 }, { x: 1200, y: 80, r: 190 }], npcs: ['marge'] });
  townRoomDef('in_coop', 'The Hen Coop', 'coop', 800, 190, { b: door([
      { id: 'nests', kind: 'fc_nests', x: 470, w: 300, h: 160, label: 'The nest boxes', act: 'eggs' }]),
    p: [{ k: 'fr_hen', x: 260 }, { k: 'fr_hen', x: 700 }, { k: 'fr_hen', x: 650 }, { k: 'fr_barrels', x: 740 }], L: [{ x: 300, y: 80, r: 150 }, { x: 560, y: 80, r: 150 }], npcs: [] });
  townRoomDef('in_fhouse', 'The Farmhouse', 'fhouse', 1000, 190, { b: door([
      { id: 'table', kind: 'table', x: 520, w: 130, h: 70, label: 'The kitchen table', act: 'sit' },
      { id: 'stove', kind: 'fire', x: 860, w: 150, h: 170, label: 'The stove', act: 'hearth' }]),
    p: [{ k: 'fr_rocker', x: 300 }, { k: 'plant', x: 700 }], L: [{ x: 400, y: 80, r: 150 }, { x: 860, y: 340, r: 170 }], npcs: [] });
  townRoomDef('in_icottage', 'A Seaside Cottage', 'icottage', 900, 190, { b: door([
      { id: 'hammock', kind: 'is_hammock', x: 420, w: 280, h: 120, label: 'The hammock', act: 'sit' },
      { id: 'shells', kind: 'is_shelf', x: 740, w: 160, h: 220, label: 'The shell collection', act: 'fm-look', say: 'Every shell has a tiny label: where, and when, and what it sounded like. A few say “too loud”.' }]),
    p: [{ k: 'fr_barrels', x: 270 }], L: [{ x: 420, y: 80, r: 160 }, { x: 760, y: 80, r: 150 }], npcs: [] });
  townRoomDef('in_ifish', 'Brine’s Fish Stall', 'ifish', 1000, 190, { b: door([
      { id: 'icecounter', kind: 'is_icecounter', x: 520, w: 340, h: 100, label: 'The ice counter', act: 'fishshop' }]),
    p: [{ k: 'fr_barrels', x: 900 }, { k: 'fr_crates', x: 300 }], L: [{ x: 360, y: 80, r: 150 }, { x: 700, y: 80, r: 160 }], npcs: ['brine'] });
  townRoomDef('in_icrab', 'Claw & Order Crab Shack', 'icrab', 1000, 190, { b: door([
      { id: 'crabcounter', kind: 'is_crabcounter', x: 500, w: 330, h: 100, label: 'The crab counter', act: 'crabshop' },
      { id: 'tank', kind: 'is_tank', x: 900, w: 150, h: 170, label: 'The crab tank', act: 'fm-look', say: 'Six crabs in a tank, glaring at you. One of them has a tiny plaster on a claw. Pearl says it was “a disagreement”.' }]),
    p: [{ k: 'fr_barrels', x: 300 }], L: [{ x: 360, y: 80, r: 150 }, { x: 700, y: 80, r: 160 }], npcs: ['pearl'] });
  townRoomDef('in_ilight', 'The Cove Lighthouse', 'ilight', 560, 190, { b: door([
      { id: 'stairs', kind: 'is_stairs', x: 390, w: 270, h: 250, label: 'The spiral stair', act: 'isle-climb' }]),
    p: [], L: [{ x: 300, y: 150, r: 220 }], npcs: [] });
  ['in_fstand', 'in_barn', 'in_coop', 'in_fhouse'].forEach(function(id){ TOWN_IN_IDS.push(id); TOWN_ROOM_PARENT[id] = 'farm'; });
  ['in_icottage', 'in_ifish', 'in_icrab', 'in_ilight'].forEach(function(id){ TOWN_IN_IDS.push(id); TOWN_ROOM_PARENT[id] = 'isle'; });
  /* the street doors, and the keepers move indoors */
  const F = TOWN_DIST.farm, I = TOWN_DIST.isle, set = function(D, id, to){ const b = D.b.find(function(x){ return x.id === id; }); if (b){ b.to = to; b.act = 'house'; } };
  set(F, 'fstand', 'in_fstand'); set(F, 'fbarn', 'in_barn'); set(F, 'fcoop', 'in_coop'); set(F, 'fhouse', 'in_fhouse');
  set(I, 'ihouse1', 'in_icottage'); set(I, 'ifish', 'in_ifish'); set(I, 'icrab', 'in_icrab'); set(I, 'ilight', 'in_ilight');
  F.npcs = []; I.npcs = [];
  TOWN_NPCS.hollis.d = 'in_fstand'; TOWN_NPCS.hollis.x = 800; TOWN_NPCS.marge.d = 'in_barn'; TOWN_NPCS.marge.x = 760;
  TOWN_NPCS.brine.d = 'in_ifish'; TOWN_NPCS.brine.x = 780; TOWN_NPCS.pearl.d = 'in_icrab'; TOWN_NPCS.pearl.x = 740;
})();

/* ---- the painting ---- */
function frCob(c, x, y, s){ tEll(c, '#F2C230', x, y, 5 * s, 12 * s); tEll(c, '#E8D060', x - 2 * s, y - 2 * s, 3 * s, 9 * s); tPoly(c, '#5E9E3A', [x - 6 * s, y + 6 * s, x, y - 14 * s, x + 6 * s, y + 6 * s]); }
const FR_KINDS = {
  fs_counter: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#B8864E', x0, TG - 90, W, 90); for (let i = 0; i < 5; i++){ const px = x0 + 12 + i * ((W - 24) / 5); tRect(c, 'rgba(0,0,0,.14)', px, TG - 78, (W - 24) / 5 - 8, 56); tRect(c, 'rgba(255,255,255,.14)', px, TG - 78, (W - 24) / 5 - 8, 3); }
    tRect(c, '#6A4A28', x0, TG - 10, W, 10); tRound(c, '#8A5A32', x0 - 10, TG - 102, W + 20, 14, 4);
    for (let i = 0; i < 3; i++){ const bx = x0 + 28 + i * 70; tRound(c, '#B88A52', bx, TG - 128, 56, 28, 5); tRect(c, 'rgba(0,0,0,.18)', bx, TG - 112, 56, 3); for (let k = 0; k < 4; k++) frCob(c, bx + 10 + k * 12, TG - 132, 0.9); }
    tRect(c, '#3A3A44', x0 + W - 80, TG - 112, 60, 10); tRect(c, '#6A6F78', x0 + W - 64, TG - 150, 4, 40); tRect(c, '#6A6F78', x0 + W - 74, TG - 150, 24, 3); tRect(c, '#C9962F', x0 + W - 72, TG - 128, 18, 14); tRound(c, '#E8D8A0', x0 + W - 40, TG - 128, 24, 16, 4);
  },
  fs_shelves: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#7A5A32', x0, TG - h, W, h); tRect(c, '#5A3F20', x0 + 6, TG - h + 8, W - 12, h - 16); tRect(c, '#4A3418', x0, TG - 12, W, 12);
    for (let r = 0; r < 4; r++){ const base = TG - h + 8 + (r + 1) * ((h - 16) / 4); tRect(c, '#7A5A32', x0 + 6, base - 2, W - 12, 6);
      for (let k = 0; k < 3; k++){ const jx = x0 + 16 + k * 40; tRound(c, ['#F2C230', '#B8602A', '#8AB84A', '#E8B876'][(r + k) % 4], jx, base - 40, 30, 38, 6); tRect(c, '#C9CDD9', jx + 3, base - 46, 24, 7); tRect(c, 'rgba(255,255,255,.3)', jx + 4, base - 36, 5, 26); } }
  },
  fb_board: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#5A3B22', x0 + 6, TG - h, 10, h); tRect(c, '#5A3B22', x0 + W - 16, TG - h, 10, h); tRect(c, '#5A3B22', x0 + 6, TG - 12, W - 12, 12);
    tRect(c, '#9A7A4A', x0, TG - h + 10, W, h - 70); tRect(c, '#6A4A28', x0, TG - h + 10, W, 8); tRect(c, '#6A4A28', x0, TG - 60, W, 8);
    ivText(c, 'CARGO', b.x, TG - h + 44, 20, '#3A2A1E');
    [['#F4F1E8', 18, 62, -0.06], ['#FFE9A8', 78, 70, 0.05], ['#F4F1E8', 138, 60, -0.03], ['#E8F0D8', 28, 124, 0.04], ['#FFE9A8', 98, 130, -0.05]].forEach(function(n){
      c.save(); c.translate(x0 + n[1] + 20, TG - h + n[2] + 20); c.rotate(n[3]); tRect(c, n[0], -20, -20, 42, 46); c.fillStyle = '#3A2A1E'; for (let l = 0; l < 4; l++) c.fillRect(-14, -12 + l * 8, 28 - l * 4, 2); tCircle(c, '#D5352B', 0, -22, 3); c.restore();
    });
  },
  fc_nests: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#8A6642', x0, TG - h, W, h); tRect(c, '#5A3B22', x0 - 4, TG - h - 6, W + 8, 8); tRect(c, '#5A3B22', x0, TG - 10, W, 10);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++){
      const nx = x0 + 10 + k * ((W - 20) / 4), ny = TG - h + 12 + r * 66;
      tRect(c, '#3A2A1E', nx, ny, (W - 20) / 4 - 6, 56); tRect(c, '#D9B857', nx + 3, ny + 38, (W - 20) / 4 - 12, 15);
      for (let e = 0; e < 1 + ((r + k) % 3); e++) tEll(c, (k + e) % 2 ? '#F4F1E8' : '#E8C8A0', nx + 14 + e * 15, ny + 38, 7, 9);
      tRect(c, '#7A5230', nx, ny + 54, (W - 20) / 4 - 6, 4);
    }
  },
  is_hammock: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#5A3B22', x0, TG - h - 40, 12, h + 40); tRect(c, '#5A3B22', x0 + W - 12, TG - h - 40, 12, h + 40); tRect(c, '#4A3018', x0 - 8, TG - 8, 28, 8); tRect(c, '#4A3018', x0 + W - 20, TG - 8, 28, 8);
    c.strokeStyle = '#B8A070'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 12, TG - h - 24); c.quadraticCurveTo(b.x, TG - h + 50, x0 + W - 12, TG - h - 24); c.stroke();
    c.fillStyle = '#E8D8B0'; c.beginPath(); c.moveTo(x0 + 12, TG - h - 24); c.quadraticCurveTo(b.x, TG - h + 54, x0 + W - 12, TG - h - 24); c.quadraticCurveTo(b.x, TG - h + 30, x0 + 12, TG - h - 24); c.fill();
    c.strokeStyle = '#4DA0D8'; c.lineWidth = 3; for (let i = 1; i < 6; i++){ const u = i / 6, hx = lerp(x0 + 12, x0 + W - 12, u), hy = TG - h - 24 + Math.sin(u * Math.PI) * 38; c.beginPath(); c.moveTo(hx, hy - 4); c.lineTo(hx, hy + 8); c.stroke(); }
    tRound(c, '#E8B7C9', x0 + 50, TG - h + 10, 44, 16, 8);
  },
  is_icecounter: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#6A8AAA', x0, TG - 90, W, 90); for (let i = 0; i < 5; i++) tRect(c, 'rgba(255,255,255,.14)', x0 + 12 + i * ((W - 24) / 5), TG - 78, (W - 24) / 5 - 8, 56);
    tRect(c, '#4A6A8A', x0, TG - 10, W, 10); tRound(c, '#C9CDD9', x0 - 10, TG - 102, W + 20, 14, 4);
    tRect(c, '#BFE0F0', x0 + 10, TG - 128, W - 20, 28); tRect(c, '#E8F6FF', x0 + 10, TG - 128, W - 20, 6);
    for (let i = 0; i < 5; i++){ const fx = x0 + 44 + i * 58; tEll(c, ['#9FB8D0', '#E89A5A', '#B8C8D8', '#F2C230', '#6AB8D8'][i], fx, TG - 116, 22, 8); tPoly(c, '#7A9AB8', [fx + 20, TG - 116, fx + 32, TG - 124, fx + 32, TG - 108]); tCircle(c, '#111', fx - 12, TG - 118, 1.8); }
    tRect(c, '#3A3A44', x0 + W - 70, TG - 112, 50, 10); tRect(c, '#6A6F78', x0 + W - 50, TG - 150, 4, 40); tRect(c, '#C9CDD9', x0 + W - 66, TG - 152, 40, 4); tRound(c, '#C9962F', x0 + W - 70, TG - 138, 14, 6, 3); tRound(c, '#C9962F', x0 + W - 36, TG - 138, 14, 6, 3);
  },
  is_crabcounter: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#B5603A', x0, TG - 90, W, 90); for (let i = 0; i < 5; i++) tRect(c, 'rgba(0,0,0,.14)', x0 + 12 + i * ((W - 24) / 5), TG - 78, (W - 24) / 5 - 8, 56);
    tRect(c, '#6A3A22', x0, TG - 10, W, 10); tRound(c, '#8A4A2A', x0 - 10, TG - 102, W + 20, 14, 4);
    for (let i = 0; i < 3; i++){ const cx = x0 + 50 + i * 76; tEll(c, '#D5352B', cx, TG - 114, 22, 12); tCircle(c, '#E85D4A', cx - 18, TG - 124, 7); tCircle(c, '#E85D4A', cx + 18, TG - 124, 7); tCircle(c, '#fff', cx - 7, TG - 120, 2); tCircle(c, '#fff', cx + 7, TG - 120, 2); }
    tRound(c, '#6A6F78', x0 + W - 90, TG - 138, 56, 36, 6); tRect(c, '#3A3A44', x0 + W - 94, TG - 142, 64, 6);
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 3; i++){ c.beginPath(); c.moveTo(x0 + W - 74 + i * 14, TG - 146); c.quadraticCurveTo(x0 + W - 80 + i * 14, TG - 164, x0 + W - 72 + i * 14, TG - 180); c.stroke(); }
  },
  is_tank: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#5A3B22', x0 + 8, TG - 60, 10, 60); tRect(c, '#5A3B22', x0 + W - 18, TG - 60, 10, 60); tRect(c, '#5A3B22', x0, TG - 68, W, 10);
    tRect(c, '#3A2A1E', x0, TG - h, W, h - 66); tRect(c, 'rgba(90,170,220,.75)', x0 + 6, TG - h + 6, W - 12, h - 78); tRect(c, '#E8D8A0', x0 + 6, TG - 84, W - 12, 12);
    for (let i = 0; i < 4; i++){ const cx = x0 + 28 + i * 32; tEll(c, '#D5352B', cx, TG - 92, 11, 6); tCircle(c, '#E85D4A', cx - 9, TG - 98, 3.4); tCircle(c, '#E85D4A', cx + 9, TG - 98, 3.4); }
    c.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++){ c.beginPath(); c.arc(x0 + 20 + i * 36, TG - 100 - i * 18, 2.4, 0, TAU); c.fill(); }
    tRect(c, 'rgba(255,255,255,.2)', x0 + 12, TG - h + 8, 10, h - 82); tRect(c, '#5A3B22', x0, TG - h - 6, W, 8);
  },
  is_shelf: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#8A6642', x0, TG - h, W, h); tRect(c, '#5A3F20', x0 + 6, TG - h + 8, W - 12, h - 16); tRect(c, '#4A3018', x0, TG - 12, W, 12);
    for (let r = 0; r < 4; r++){ const base = TG - h + 8 + (r + 1) * ((h - 16) / 4); tRect(c, '#8A6642', x0 + 6, base - 2, W - 12, 6);
      for (let k = 0; k < 3; k++){ const sx = x0 + 22 + k * 40; if ((r + k) % 3 === 0){ tPoly(c, '#E8A0B0', [sx, base - 4, sx + 5, base - 24, sx + 10, base - 4]); tPoly(c, '#E8A0B0', [sx - 8, base - 12, sx + 18, base - 16, sx + 4, base - 6]); } else if ((r + k) % 3 === 1){ tEll(c, '#F4E8D0', sx + 6, base - 12, 12, 10); c.strokeStyle = '#C9A27A'; c.lineWidth = 1.5; c.beginPath(); c.arc(sx + 6, base - 12, 5, 0, 5); c.stroke(); } else tEll(c, '#9FD8F2', sx + 6, base - 10, 10, 8); } }
  },
  is_stairs: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h, steps = 14, sx = x0 + 10, topY = TG - h;
    ivShadow(c, b.x, W);
    tRect(c, '#7A7A84', x0 + W - 40, topY, 40, h); tRect(c, '#5A5A64', x0 + W - 46, topY - 8, 60, 12);                        /* the landing, on a pillar to the floor */
    for (let i = 0; i < steps; i++){ const x = sx + i * ((W - 50) / steps), y = TG - (i + 1) * (h / steps); tRect(c, '#9A9AA4', x, y, (W - 50) / steps + 2, TG - y); tRect(c, '#C9C9D2', x, y, (W - 50) / steps + 2, 5); tRect(c, 'rgba(0,0,0,.14)', x, y + 5, (W - 50) / steps + 2, 3); }
    ivLine(c, '#2A2A34', 4, sx, TG - 60, x0 + W - 46, topY - 52); for (let i = 0; i <= steps; i += 2){ const x = sx + i * ((W - 50) / steps), y = TG - (i + 1) * (h / steps); ivLine(c, '#2A2A34', 3, x, y, x, y - 54 + 0); }
    tRound(c, '#3A3A44', x0 + W - 36, topY - 56, 36, 44, 6); tCircle(c, '#FFE9A0', x0 + W - 18, topY - 36, 10);
    ivText(c, 'TOP', x0 + W - 20, topY - 66, 12, '#D5352B');
  }
};
const FR_PROPS = {
  fr_crates: function(c, x){
    for (let i = 0; i < 2; i++){ tRect(c, '#B88A52', x - 50 + i * 54, TG - 48, 50, 48); c.strokeStyle = '#6A4A28'; c.lineWidth = 3; c.strokeRect(x - 50 + i * 54, TG - 48, 50, 48); ivLine(c, '#6A4A28', 3, x - 50 + i * 54, TG - 48, x + i * 54, TG); }
    tRect(c, '#C9A062', x - 36, TG - 92, 52, 44); c.strokeStyle = '#6A4A28'; c.lineWidth = 3; c.strokeRect(x - 36, TG - 92, 52, 44); tEll(c, '#E8862A', x - 10, TG - 100, 16, 12); tRect(c, '#5E9E3A', x - 12, TG - 114, 4, 8);
    tRound(c, '#E8D8A0', x + 36, TG - 44, 40, 44, 12); tRect(c, '#B8864E', x + 44, TG - 38, 24, 4);
  },
  fr_tractor: function(c, x){
    tCircle(c, '#2A2A34', x - 40, TG - 34, 34); tCircle(c, '#6A6F78', x - 40, TG - 34, 14); tCircle(c, '#2A2A34', x + 52, TG - 18, 18); tCircle(c, '#6A6F78', x + 52, TG - 18, 8);
    tRect(c, '#D5352B', x - 14, TG - 64, 88, 34); tRound(c, '#B8301E', x + 20, TG - 76, 56, 24, 6); tRect(c, '#3A3A44', x + 66, TG - 96, 6, 24);
    tRect(c, '#E8D8A0', x - 48, TG - 88, 4, 52); tRect(c, '#3A3A44', x - 56, TG - 98, 40, 6); tRound(c, '#2A2A34', x - 44, TG - 72, 30, 12, 4);
    tRect(c, '#9FD8F2', x - 6, TG - 62, 22, 14);
  },
  fr_bales: function(c, x){
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - (row > 1 ? 1 : 0); k++){ const bx = x - 70 + k * 48 + (row % 2) * 12, by = TG - 32 * (row + 1); tRound(c, '#D9B857', bx, by, 48, 32, 4); tRect(c, '#A8872E', bx + 10, by, 3, 32); tRect(c, '#A8872E', bx + 32, by, 3, 32); }
  },
  fr_hen: function(c, x){
    tEll(c, '#F4F1E8', x, TG - 18, 20, 14); tCircle(c, '#F4F1E8', x + 16, TG - 32, 9); tPoly(c, '#F2C230', [x + 24, TG - 32, x + 32, TG - 29, x + 24, TG - 27]); tPoly(c, '#D5352B', [x + 12, TG - 40, x + 16, TG - 48, x + 20, TG - 40]);
    tPoly(c, '#E8E0D0', [x - 16, TG - 24, x - 30, TG - 34, x - 22, TG - 14]); tRect(c, '#F2C230', x - 4, TG - 6, 2.4, 6); tRect(c, '#F2C230', x + 6, TG - 6, 2.4, 6); tCircle(c, '#111', x + 18, TG - 34, 1.6);
  },
  fr_rocker: function(c, x){
    c.strokeStyle = '#6A4A28'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(x, TG - 54, 52, 0.18 * Math.PI, 0.82 * Math.PI); c.stroke(); tRect(c, '#6A4A28', x - 36, TG - 54, 5, 50); tRect(c, '#6A4A28', x + 30, TG - 54, 5, 50);
    tRect(c, '#8A6642', x - 40, TG - 56, 80, 8); tRect(c, '#8A6642', x - 40, TG - 110, 8, 56); for (let i = 0; i < 4; i++) tRect(c, '#8A6642', x - 40 + i * 4, TG - 104 + i * 10, 6, 40); tRect(c, '#8A6642', x - 40, TG - 112, 14, 6);
    tRound(c, '#C25A82', x - 32, TG - 66, 62, 14, 5);
  },
  fr_barrels: function(c, x){
    for (let i = 0; i < 2; i++){ tRound(c, '#8A5A32', x - 40 + i * 40, TG - 50, 36, 50, 8); tRect(c, '#3A2A1E', x - 40 + i * 40, TG - 38, 36, 3); tRect(c, '#3A2A1E', x - 40 + i * 40, TG - 14, 36, 3); }
    tRound(c, '#8A5A32', x - 22, TG - 98, 36, 50, 8); tRect(c, '#3A2A1E', x - 22, TG - 86, 36, 3); tRect(c, '#3A2A1E', x - 22, TG - 62, 36, 3);
  }
};
(function(){
  const bx = townBuildingX, px = townPropX;
  townBuildingX = function(c, D, b, P, r){
    const f = FR_KINDS[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
  townPropX = function(c, D, p, P, r){
    const f = FR_PROPS[p.k];
    if (f){ c.save(); try { f(c, p.x); } finally { c.restore(); } return true; }
    return px(c, D, p, P, r);
  };
  /* what is hung on the walls */
  IV_ROOMS.farmshop = function(c, D, K){
    ivChains(c, 470, 570, 36, 86); ivBoard(c, 420, 86, 200, 40, '#2E4A3A', '#B8864E'); ivText(c, 'FRESH CORN', 520, 114, 20, '#F4F1E8');
    ivLine(c, '#5A3B22', 3, 180, 34, 760, 34);
    for (let i = 0; i < 7; i++){ const hx = 220 + i * 78; ivLine(c, '#8A6642', 2, hx, 34, hx, 56); for (let k = 0; k < 3; k++) frCob(c, hx - 8 + k * 8, 76 + k * 4, 0.9); }
    ivFrame(c, 800, 120, 60, 46, function(cc, x, y, w, h){ for (let i = 0; i < 3; i++) frCob(cc, x + 14 + i * 16, y + 24, 0.8); });
  };
  IV_ROOMS.barn = function(c, D, K){
    tRect(c, '#5A3B22', 700, 214, 760, 12); tRect(c, '#6A4A28', 700, 226, 760, 6);                                         /* the hay loft */
    [704, 1076, 1444].forEach(function(x){ tRect(c, '#5A3B22', x, 226, 12, TG - 226); });
    ivLine(c, '#4A2A18', 6, 700, TG - 8, 660, 214); ivLine(c, '#4A2A18', 6, 730, TG - 8, 690, 214); for (let y = 250; y < TG - 20; y += 36){ const k = (TG - 8 - y) / (TG - 8 - 214); ivLine(c, '#6A4A28', 5, 700 - 40 * (1 - k) - 6 + 0, y, 730 - 40 * (1 - k) + 0, y); }
    for (let i = 0; i < 5; i++){ const hx = 760 + i * 130; tEll(c, '#D9B857', hx, 208, 52, 18); ivLine(c, '#B89A3A', 2, hx - 30, 206, hx - 20, 196); }
    tRect(c, '#D9B857', 1100, 176, 56, 38); tRect(c, '#A8872E', 1112, 176, 3, 38); tRect(c, '#A8872E', 1136, 176, 3, 38);
    ivLine(c, '#2A2A30', 2, 1000, 34, 1000, 150); tRound(c, '#C9962F', 988, 150, 24, 34, 6); tRound(c, '#FFE9A8', 992, 156, 16, 22, 4);
    ivLine(c, '#6A4A28', 5, 260, 130, 260, 300); [236, 252, 268, 284].forEach(function(x){ ivLine(c, '#C9CDD9', 3, x, 300, x, 330); }); ivLine(c, '#C9CDD9', 3, 236, 300, 284, 300);       /* a pitchfork on the wall */
    tCircle(c, '#5A3B22', 340, 200, 34); tCircle(c, '#8A6642', 340, 200, 26); tCircle(c, '#5A3B22', 340, 200, 5); for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; ivLine(c, '#5A3B22', 2, 340, 200, 340 + Math.cos(a) * 26, 200 + Math.sin(a) * 26); }
  };
  IV_ROOMS.coop = function(c, D, K){
    tRect(c, '#6A4A32', 120, 250, 560, 8); tRect(c, '#6A4A32', 120, 250, 8, TG - 250); tRect(c, '#6A4A32', 672, 250, 8, TG - 250);       /* a perch on two posts */
    for (let i = 0; i < 4; i++) tEll(c, '#E8D8A0', 560 + i * 24, 245, 10, 8);
    ivChains(c, 330, 440, 36, 96); ivBoard(c, 300, 96, 170, 36, '#F4F1E8', '#6A4A32'); ivText(c, 'EGGS: MIND THE HENS', 385, 120, 13, '#6A3A22');
  };
  IV_ROOMS.fhouse = function(c, D, K){
    ivShelfBoard(c, 560, 150, 220); for (let i = 0; i < 4; i++){ tRound(c, ['#B8602A', '#F2C230', '#8AB84A', '#C9503C'][i], 576 + i * 50, 112, 30, 38, 6); tRect(c, '#C9CDD9', 579 + i * 50, 106, 24, 7); }
    tCircle(c, '#5A3B22', 440, 110, 26); tCircle(c, '#FBF3DC', 440, 110, 22); ivLine(c, '#2A1A0A', 2.4, 440, 110, 440, 96); ivLine(c, '#2A1A0A', 2, 440, 110, 450, 114);
    ivFrame(c, 700, 190, 72, 56, function(cc, x, y, w, h){ for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++){ cc.fillStyle = (i + j) % 2 ? '#C9503C' : '#F4F1E8'; cc.fillRect(x + 6 + i * 15, y + 6 + j * 15, 15, 15); } });
  };
  IV_ROOMS.icottage = function(c, D, K){
    tCircle(c, '#5A3B22', 650, 130, 46); tCircle(c, '#9FD8F2', 650, 130, 40); ivLine(c, '#5A3B22', 4, 650, 90, 650, 170); ivLine(c, '#5A3B22', 4, 610, 130, 690, 130);
    ivLine(c, '#2A2A30', 2, 150, 34, 150, 70); ivLine(c, '#2A2A30', 2, 290, 34, 290, 70);
    c.strokeStyle = '#B8A070'; c.lineWidth = 1.4; for (let i = 0; i <= 10; i++){ c.beginPath(); c.moveTo(150 + i * 14, 70); c.quadraticCurveTo(150 + i * 14, 120, 150 + i * 14 + Math.sin(i) * 4, 150); c.stroke(); } for (let j = 0; j < 5; j++){ c.beginPath(); c.moveTo(150, 70 + j * 16); c.lineTo(290, 70 + j * 16 + 4); c.stroke(); }
    ivFrame(c, 330, 120, 56, 44, function(cc, x, y, w, h){ cc.fillStyle = '#9FD8F2'; cc.fillRect(x + 4, y + 4, w - 8, 24); cc.fillStyle = '#F4F1E8'; cc.beginPath(); cc.moveTo(x + 20, y + 28); cc.lineTo(x + 36, y + 28); cc.lineTo(x + 28, y + 8); cc.fill(); });
  };
  IV_ROOMS.ifish = function(c, D, K){
    ivLine(c, '#5A3B22', 4, 160, 34, 760, 34);
    for (let i = 0; i < 7; i++){ const hx = 200 + i * 86; ivLine(c, '#8A6642', 2, hx, 34, hx, 60 + (i % 2) * 8); tEll(c, ['#9FB8D0', '#E89A5A', '#B8C8D8'][i % 3], hx, 84 + (i % 2) * 8, 8, 24); tPoly(c, '#7A9AB8', [hx - 6, 104 + (i % 2) * 8, hx + 6, 104 + (i % 2) * 8, hx, 118 + (i % 2) * 8]); tCircle(c, '#111', hx, 70 + (i % 2) * 8, 1.6); }
    ivChains(c, 770, 850, 36, 96); ivBoard(c, 740, 96, 150, 60, '#E8F0F4', '#3A4A5A'); ivText(c, 'TIDES', 815, 118, 14, '#2F5F94'); c.strokeStyle = '#4DA0D8'; c.lineWidth = 2; c.beginPath(); c.moveTo(752, 140); for (let i = 0; i <= 12; i++) c.lineTo(752 + i * 11, 140 + Math.sin(i * 0.9) * 8); c.stroke();
  };
  IV_ROOMS.icrab = function(c, D, K){
    ivLine(c, '#4A3018', 3, 160, 60, 840, 60);
    for (let i = 0; i < 9; i++){ const lx = 190 + i * 76; ivLine(c, '#4A3018', 1.6, lx, 60, lx, 74); tCircle(c, '#FFE9A8', lx, 82, 6); const g = c.createRadialGradient(lx, 82, 1, lx, 82, 26); g.addColorStop(0, 'rgba(255,230,150,.5)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(lx - 26, 56, 52, 52); }
    [[120, '#D5352B'], [150, '#F2C230']].forEach(function(o){ ivLine(c, '#5A3B22', 2, o[0] + 8, 150, o[0] + 8, 170); tCircle(c, o[1], o[0] + 8, 184, 14); tRect(c, '#F4F1E8', o[0] - 6, 180, 28, 4); });
    ivChains(c, 570, 650, 36, 110); ivBoard(c, 540, 110, 150, 40, '#7A2A1E', '#3A2A1E'); ivText(c, 'CRAB · 6', 615, 138, 18, '#FFF6E0');
  };
  IV_ROOMS.ilight = function(c, D, K){
    /* compact: one red band clear of everything, one porthole over the door side, one lantern; the stair has the right-hand wall to itself */
    tRect(c, '#C9503C', 0, 121, D.w, 14); tRect(c, 'rgba(255,255,255,.18)', 0, 121, D.w, 2);
    tCircle(c, '#5A5A64', 120, 192, 36); tCircle(c, '#9FD8F2', 120, 192, 30); ivLine(c, '#5A5A64', 4, 120, 162, 120, 222); ivLine(c, '#5A5A64', 4, 90, 192, 150, 192);
    ivLine(c, '#2A2A30', 2, 120, 34, 120, 52); tRound(c, '#C9962F', 108, 52, 24, 34, 6); tRound(c, '#FFE9A8', 112, 57, 16, 24, 4);
  };})();

/* ---- what the new things do ---- */
(function(){
  const tu = townUse, nr = townNearest;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'fm-look'){ townSay({ name: b.label, text: b.say || 'It looks well looked after.' }, []); return; }
      if (b.act === 'isle-climb'){
        const d = SEA_DOCKS.isle, n = seaRevealAround(d.px, d.py - 300, 14);
        SFX.level();
        townSay({ name: 'The top of the lighthouse', text: n ? 'You climb and climb, and step out onto the gallery. The whole sea is laid out below, with the reefs showing as pink smudges. Your sea chart now shows the island and the water around it.' : 'You climb to the gallery again. The view is as good as you remember, and your sea chart already shows all of it.' }, []);
        return;
      }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b'){ const m = { 'fm-look': 'Have a look', 'isle-climb': 'Climb the stairs' }; if (m[o.b.act]) o.label = m[o.b.act]; }
    return o;
  };
})();
