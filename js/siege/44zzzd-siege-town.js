'use strict';
/* Chapter 15, the Siege: Longneck Town as the arena (the chapter itself is in js/siege/30e-chapter-siege.js). */
/* ========================= THE SIEGE IN PLAY ========================= */
/* The whole arena is the town, seen from above, on a grid of three by three cells, each 1400 by 1050: the Square in the middle, Market Street above it, Willow Park to the
   east, the Harbor to the west, the Rooftops in the north-east corner and the Launchpad in the south-east; the other three cells are the town's outskirts and its south gate.
   The houses, stalls and tanks are solid, like the Tower's walls: the giraffe, her ants and every creature have to go round them, and every shot dies on one. The Tower's flow
   field (towerFlow, towerSteer in js/chapters/44zzza-tower-floors.js) is reused so creatures come round the buildings instead of pressing against them, which is why the town is put in
   TW.floor like a floor of walls (it has `vents`, the gates the machines arrive by). Five of the buildings are KEY buildings she has to protect (js/siege/44zzze-siege-defense.js).
   siegeLayout() is the plan as data (x, y, w, h in arena pixels, k the kind that decides how it is drawn); drawGroundSiege paints the streets, the lots and every building. */
const SG_CW = 1400, SG_CH = 1050;
/* the militia's posts: a sandbag nest with a wall of sandbags to each side (x, y of the nest, in arena pixels). Each is solid, so creatures go round it; the militia in it are in js/siege/44zzzf-siege-militia.js */
const SIEGE_POSTS = [
  { id: 'hallw', x: 1735, y: 1500 }, { id: 'halle', x: 2395, y: 1500 }, { id: 'lib', x: 1700, y: 500 }, { id: 'tpost', x: 2400, y: 500 }, { id: 'light', x: 640, y: 1450 },
  { id: 'mission', x: 3100, y: 2560 }, { id: 'south', x: 2010, y: 2480 }, { id: 'park', x: 3000, y: 1850 }, { id: 'harbor', x: 1100, y: 1950 }, { id: 'roofs', x: 3300, y: 800 }
];
const SG_NEST = { w: 110, h: 70 }, SG_WING = { w: 80, h: 26 };
function sgC(col, row, x, y, w, h, k, extra){ return Object.assign({ x: col * SG_CW + x, y: row * SG_CH + y, w: w, h: h, k: k }, extra || {}); }
function siegeLayout(){
  const H = [], K = {};
  const add = function(o){ H.push(o); return o; };
  /* the outskirts (north-west, south-west) and the south gate */
  add(sgC(0, 0, 260, 200, 300, 220, 'house', { roof: 0 })); add(sgC(0, 0, 820, 280, 280, 200, 'house', { roof: 2 })); add(sgC(0, 0, 640, 640, 230, 160, 'shed'));
  add(sgC(0, 2, 180, 200, 300, 220, 'house', { roof: 1 })); add(sgC(0, 2, 800, 320, 300, 200, 'house', { roof: 3 })); add(sgC(0, 2, 400, 700, 220, 150, 'shed'));
  add(sgC(1, 2, 420, 100, 200, 170, 'gate')); add(sgC(1, 2, 780, 100, 200, 170, 'gate'));
  add(sgC(1, 2, 200, 560, 260, 190, 'shed')); add(sgC(1, 2, 900, 520, 300, 200, 'house', { roof: 4 }));
  /* Market Street */
  K.library = add(sgC(1, 0, 140, 160, 400, 260, 'library', { key: 'library', name: 'Library' }));
  K.post = add(sgC(1, 0, 860, 160, 380, 240, 'post', { key: 'post', name: 'Trading Post' }));
  add(sgC(1, 0, 200, 600, 130, 76, 'stall')); add(sgC(1, 0, 540, 620, 130, 76, 'stall')); add(sgC(1, 0, 880, 600, 130, 76, 'stall')); add(sgC(1, 0, 1100, 760, 150, 100, 'cafe'));
  /* the Rooftops */
  add(sgC(2, 0, 160, 170, 420, 230, 'roofs', { roof: 5 })); add(sgC(2, 0, 800, 170, 240, 170, 'shed'));
  add(sgC(2, 0, 300, 600, 110, 110, 'tank')); add(sgC(2, 0, 700, 650, 110, 110, 'tank')); add(sgC(2, 0, 1050, 560, 110, 110, 'tank')); add(sgC(2, 0, 1100, 180, 150, 170, 'roofs', { roof: 6 }));
  /* the Harbor: the sea along the west edge, a lighthouse, the bait shack, a boat on the hard */
  add(sgC(0, 1, 0, 0, 260, 1050, 'sea'));
  K.lighthouse = add(sgC(0, 1, 400, 160, 190, 190, 'lighthouse', { key: 'lighthouse', name: 'Lighthouse' }));
  add(sgC(0, 1, 860, 170, 300, 200, 'shack')); add(sgC(0, 1, 700, 600, 300, 120, 'boat')); add(sgC(0, 1, 420, 640, 110, 110, 'crane')); add(sgC(0, 1, 1100, 650, 150, 130, 'crates'));
  /* the Town Square */
  K.hall = add(sgC(1, 1, 470, 140, 460, 280, 'hall', { key: 'hall', name: 'Herd Hall' }));
  add(sgC(1, 1, 150, 640, 270, 210, 'house', { roof: 7 })); add(sgC(1, 1, 640, 580, 120, 120, 'fountain')); add(sgC(1, 1, 1010, 660, 200, 150, 'tram'));
  /* Willow Park */
  add(sgC(2, 1, 150, 150, 320, 220, 'arcade')); add(sgC(2, 1, 860, 150, 360, 260, 'grove')); add(sgC(2, 1, 520, 560, 400, 240, 'pond')); add(sgC(2, 1, 1000, 720, 200, 150, 'booth'));
  /* the Launchpad */
  K.mission = add(sgC(2, 2, 150, 150, 420, 250, 'mission', { key: 'mission', name: 'Mission Control' }));
  add(sgC(2, 2, 820, 320, 190, 190, 'rocket')); add(sgC(2, 2, 1100, 190, 110, 110, 'tank')); add(sgC(2, 2, 1100, 600, 110, 110, 'tank')); add(sgC(2, 2, 600, 640, 150, 150, 'scope')); add(sgC(2, 2, 200, 600, 200, 140, 'crates'));
  SIEGE_POSTS.forEach(function(p){
    add({ x: p.x, y: p.y, w: SG_NEST.w, h: SG_NEST.h, k: 'nest', post: p.id });
    add({ x: p.x - 86, y: p.y + 22, w: SG_WING.w, h: SG_WING.h, k: 'wing', post: p.id }); add({ x: p.x + SG_NEST.w + 6, y: p.y + 22, w: SG_WING.w, h: SG_WING.h, k: 'wing', post: p.id });
  });
  /* where the machines come in: the gates at the ends of the roads, on the edges of the map */
  const V = [{ x: 700, y: 110 }, { x: 2100, y: 110 }, { x: 3500, y: 110 }, { x: 4100, y: 500 }, { x: 4100, y: 1575 }, { x: 4100, y: 2650 }, { x: 700, y: 3040 }, { x: 2100, y: 3040 }, { x: 3500, y: 3040 }, { x: 110, y: 300 }, { x: 110, y: 2850 }];
  return { houses: H, keys: K, vents: V };
}
const SG = { plan: null, keyList: [], cache: {} };
function siegeWallBuilding(r){ return { x: r.x, y: r.y, w: r.w, h: r.h, style: 'tower', tower: true, siege: true, kind: r.k, key: r.key || null, post: r.post || null, hp: 1, maxHp: 1, collapsed: false, flash: 0, indestructible: true, units: [], cracks: [], rubble: [] }; }
function buildSiegeWorld(){
  const plan = siegeLayout(); SG.plan = plan;
  const f = { walls: plan.houses, boxes: [], rooms: [], doors: [], vents: plan.vents, props: [], start: { x: ARENA_W / 2 - 120, y: SG_CH + 760 }, n: 1, name: 'Longneck Town', kind: 'siege', lift: null };
  TW.floor = f; TW.n = 1; TW.ride = null; TW.open = false;
  G.buildings = plan.houses.map(siegeWallBuilding); G.tower = true; G.rocket = null;
  SG.keyList = G.buildings.filter(function(b){ return !!b.key; });
  towerNavBuild(f);
  siegeDefenseInit(); siegeMilitiaInit();
}
/* where she stands when the run starts: the open street below the Square's fountain */
function siegeStart(){ return { x: 1400 + 700, y: 1050 + 860 }; }
const siegeBaseStartRun = startRun;
startRun = function(){
  const r = siegeBaseStartRun.apply(this, arguments);
  if (G.chapter === SIEGE_CHAPTER && G.biome === 'siege'){ const s = siegeStart(); P.x = s.x; P.y = s.y; P.vx = 0; P.vy = 0; }
  return r;
};

/* the buildings are drawn with the ground (they are flat, like the Tower's walls), so the city's own drawBuilding skips them */
const siegeBaseDrawBuilding = drawBuilding;
drawBuilding = function(ctx, b){ if (b.siege) return; return siegeBaseDrawBuilding.apply(this, arguments); };
/* kicking a wall throws sparks but no "Indestructible" note: there are buildings everywhere */
const siegeBaseDeflect = deflectSpark;
deflectSpark = function(b){ if (!b.siege) return siegeBaseDeflect.apply(this, arguments); const keep = G.rocketNoteT; G.rocketNoteT = 1e18; siegeBaseDeflect.apply(this, arguments); G.rocketNoteT = keep; };

/* ---------------------------------------------------------------- the ground */
function sgPattern(kind){
  if (SG.cache[kind]) return SG.cache[kind];
  const S = 160, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); if (!g) return '#807A70';
  const rn = function(i){ return csR(i + kind.length * 977 + kind.charCodeAt(0) * 31); };
  if (kind === 'cobble'){
    g.fillStyle = '#8A8478'; g.fillRect(0, 0, S, S);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++){ const x = i * 20 + (j % 2) * 10, y = j * 20, s = rn(i * 8 + j); g.fillStyle = s > 0.66 ? '#9A9488' : s > 0.33 ? '#8E887C' : '#827C70'; g.fillRect(x + 1, y + 1, 18, 18); }
    g.strokeStyle = 'rgba(40,36,30,.35)'; g.lineWidth = 1.5; for (let j = 0; j <= 8; j++){ g.beginPath(); g.moveTo(0, j * 20); g.lineTo(S, j * 20); g.stroke(); }
  } else if (kind === 'grass'){
    g.fillStyle = '#5E8A3E'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 260; i++){ g.fillStyle = ['#6C9A48', '#528034', '#76A44E', '#4A7430'][i % 4]; g.fillRect(rn(i) * S, rn(i + 400) * S, 2 + rn(i + 800) * 3, 2 + rn(i + 1200) * 3); }
  } else if (kind === 'planks'){
    g.fillStyle = '#8A6A44'; g.fillRect(0, 0, S, S);
    for (let j = 0; j < 8; j++){ g.fillStyle = j % 2 ? '#7E5F3C' : '#94734A'; g.fillRect(0, j * 20 + 1, S, 18); g.fillStyle = 'rgba(30,20,10,.5)'; g.fillRect(0, j * 20, S, 1.5); g.fillRect(rn(j) * S, j * 20, 1.5, 20); }
  } else if (kind === 'tar'){
    g.fillStyle = '#585A62'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 300; i++){ g.fillStyle = rn(i) > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.14)'; g.fillRect(rn(i + 500) * S, rn(i + 900) * S, 2 + rn(i + 1300) * 3, 2 + rn(i + 1700) * 3); }
    g.strokeStyle = 'rgba(20,20,26,.4)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S);
  } else {
    g.fillStyle = '#A4A6AA'; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(40,44,52,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S); g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S / 2, S); g.stroke();
    for (let i = 0; i < 160; i++){ g.fillStyle = rn(i) > 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'; g.fillRect(rn(i + 300) * S, rn(i + 700) * S, 2, 2); }
  }
  return SG.cache[kind] = (CTX && CTX.createPattern ? CTX.createPattern(c, 'repeat') : null) || '#807A70';
}
/* the lots: where the ground is not the cobbled street (x, y, w, h, pattern) */
const SG_LOTS = [
  [0, 0, 1400, 1050, 'grass', 150], [0, 2100, 1400, 1050, 'grass', 150], [1400, 2100, 1400, 1050, 'grass', 150], [2800, 1050, 1400, 1050, 'grass', 150],
  [0, 1050, 1400, 1050, 'planks', 40], [2800, 0, 1400, 1050, 'tar', 130], [2800, 2100, 1400, 1050, 'concrete', 130]
];
const SG_ROOFS = [['#9A4A38', '#6E3024'], ['#6A7E9A', '#46566E'], ['#8A6E4A', '#5C4630'], ['#7E8E62', '#56643E'], ['#A8643A', '#74422A'], ['#7A7A86', '#52525E'], ['#8A5A6E', '#5E3A4A'], ['#9A8A52', '#6C5E34']];
const SG_TREES = [], SG_LAMPS = [], SG_FLOWERS = [];
(function(){
  const hs = siegeLayout().houses;
  for (let i = 0; i < 160 && SG_TREES.length < 90; i++){                              /* trees and bushes in the grass lots, well off the buildings */
    const lot = SG_LOTS[i % 4]; if (lot[4] !== 'grass') continue;
    const q = { x: lot[0] + 180 + csR(i + 31000) * (lot[2] - 360), y: lot[1] + 180 + csR(i + 31100) * (lot[3] - 360), r: 28 + csR(i + 31200) * 26, c: csR(i + 31300) };
    if (hs.some(function(h){ return q.x > h.x - q.r - 30 && q.x < h.x + h.w + q.r + 30 && q.y > h.y - q.r * 1.4 - 30 && q.y < h.y + h.h + q.r + 40; })) continue;
    SG_TREES.push(q);
  }
  for (let col = 0; col < 3; col++) for (let row = 0; row < 3; row++){                 /* a lamp at each corner of every cell's road */
    SG_LAMPS.push({ x: col * SG_CW + 70, y: row * SG_CH + 70 }, { x: col * SG_CW + SG_CW - 70, y: row * SG_CH + 70 }, { x: col * SG_CW + 70, y: row * SG_CH + SG_CH - 70 }, { x: col * SG_CW + SG_CW - 70, y: row * SG_CH + SG_CH - 70 });
  }
  for (let i = 0; i < 140; i++) SG_FLOWERS.push({ x: 2800 + 160 + csR(i + 32000) * 1080, y: 1050 + 150 + csR(i + 32100) * 760, c: ['#F2E24A', '#F27AA8', '#FFFFFF', '#B07AF2'][i % 4] });
})();
function sgHit(o, x0, y0, x1, y1, m){ return o.x + (o.w || 0) + (m || 0) < x0 || o.x - (m || 0) > x1 || o.y + (o.h || 0) + (m || 0) < y0 || o.y - (m || 0) > y1; }
function drawGroundSiege(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  ctx.fillStyle = sgPattern('cobble'); ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);                               /* the streets */
  for (let i = 0; i < SG_LOTS.length; i++){                                                                           /* the lots, with a curb */
    const L = SG_LOTS[i], m = L[5]; if (sgHit({ x: L[0] + m, y: L[1] + m, w: L[2] - m * 2, h: L[3] - m * 2 }, x0, y0, x1, y1, 20)) continue;
    const lx = L[0] + m, ly = L[1] + m, lw = L[2] - m * 2, lh = L[3] - m * 2;
    ctx.fillStyle = 'rgba(30,26,20,.35)'; ctx.fillRect(lx - 8, ly - 8, lw + 16, lh + 16);
    ctx.fillStyle = '#B4AEA2'; ctx.fillRect(lx - 4, ly - 4, lw + 8, lh + 8);
    ctx.fillStyle = sgPattern(L[4]); ctx.fillRect(lx, ly, lw, lh);
  }
  sgDrawPlaza(ctx, x0, y0, x1, y1, t);
  sgDrawDecor(ctx, x0, y0, x1, y1, t);
  for (let i = 0; i < SG_FLOWERS.length; i++){ const f = SG_FLOWERS[i]; if (f.x < x0 || f.x > x1 || f.y < y0 || f.y > y1) continue; ctx.fillStyle = f.c; ctx.fillRect(f.x, f.y, 4, 4); }
  const plan = SG.plan || (SG.plan = siegeLayout());
  for (let i = 0; i < plan.houses.length; i++){ const b = plan.houses[i]; if (sgHit(b, x0, y0, x1, y1, 120)) continue; sgDrawBuilding(ctx, b, t); }
  for (let i = 0; i < SG_TREES.length; i++){ const q = SG_TREES[i]; if (q.x + q.r < x0 || q.x - q.r > x1 || q.y + q.r < y0 || q.y - q.r > y1) continue; sgDrawTree(ctx, q); }
  for (let i = 0; i < SG_LAMPS.length; i++){ const l = SG_LAMPS[i]; if (l.x < x0 - 60 || l.x > x1 + 60 || l.y < y0 - 60 || l.y > y1 + 60) continue; sgDrawLamp(ctx, l, t); }
  sgDrawSigns(ctx, x0, y0, x1, y1);
}
function sgDrawTree(ctx, q){
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(q.x + q.r * 0.3, q.y + q.r * 0.45, q.r * 0.95, q.r * 0.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A3A24'; ctx.fillRect(q.x - 4, q.y - 2, 8, 14);
  ctx.fillStyle = q.c > 0.5 ? '#3E7A34' : '#4A8A3A'; ctx.beginPath(); ctx.arc(q.x, q.y - q.r * 0.3, q.r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(190,240,120,.28)'; ctx.beginPath(); ctx.arc(q.x - q.r * 0.3, q.y - q.r * 0.6, q.r * 0.55, 0, TAU); ctx.fill();
}
function sgDrawLamp(ctx, l, t){
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(l.x + 5, l.y + 8, 7, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2E3038'; ctx.fillRect(l.x - 2.5, l.y - 22, 5, 26);
  ctx.fillStyle = '#FFE49A'; ctx.beginPath(); ctx.arc(l.x, l.y - 24, 6, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(l.x, l.y - 24, 2, l.x, l.y - 24, 70); g.addColorStop(0, 'rgba(255,200,110,.30)'); g.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = g; ctx.fillRect(l.x - 70, l.y - 94, 140, 140); ctx.globalCompositeOperation = 'source-over';
}
/* the Square's paving, its ring of flagstones and the hatch down to the Burrows where the herd is hiding */
function sgDrawPlaza(ctx, x0, y0, x1, y1, t){
  const px = 2100, py = 1575;
  if (px + 420 < x0 || px - 420 > x1 || py + 330 < y0 || py - 330 > y1) return;
  ctx.fillStyle = 'rgba(214,206,190,.55)'; ctx.beginPath(); ctx.ellipse(px, py + 20, 410, 300, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(80,70,56,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(px, py + 20, 410, 300, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py + 20, 300, 210, 0, 0, TAU); ctx.stroke();
  const hx = 1400 + 1180, hy = 1050 + 520;                                                                              /* the hatch */
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(hx + 4, hy + 6, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.arc(hx, hy, 44, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A707C'; ctx.beginPath(); ctx.arc(hx, hy, 36, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3A3E46'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx - 30, hy); ctx.lineTo(hx + 30, hy); ctx.moveTo(hx, hy - 30); ctx.lineTo(hx, hy + 30); ctx.stroke();
  ctx.fillStyle = '#F2D488'; ctx.fillRect(hx - 5, hy - 5, 10, 10);
}
const SG_SIGNS = [['HARBOR', 640, 1050 + 60], ['MARKET STREET', 2100, 70], ['TOWN SQUARE', 2100, 1050 + 60], ['WILLOW PARK', 3500, 1050 + 60], ['ROOFTOPS', 3500, 70], ['LAUNCHPAD', 3500, 2100 + 60], ['SOUTH GATE', 2100, 2100 + 60]];
function sgDrawSigns(ctx, x0, y0, x1, y1){
  ctx.save(); ctx.font = '800 34px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,246,216,.30)';
  for (let i = 0; i < SG_SIGNS.length; i++){ const s = SG_SIGNS[i]; if (s[1] + 240 < x0 || s[1] - 240 > x1 || s[2] + 30 < y0 || s[2] - 30 > y1) continue; ctx.fillText(s[0], s[1], s[2]); }
  ctx.restore();
}

/* ---------------------------------------------------------------- the small details: flat things on the ground that nothing collides with (the buildings are drawn over them) */
const SG_DECOR = { drains: [], crates: [], bollards: [], benches: [], vents: [], stripes: [] };
(function(){
  for (let i = 0; i < 46; i++) SG_DECOR.drains.push({ x: 120 + csR(i + 33000) * 4000, y: 120 + csR(i + 33100) * 2900 });
  for (let i = 0; i < 26; i++) SG_DECOR.crates.push({ x: 90 + csR(i + 33200) * 1200, y: 1050 + 90 + csR(i + 33300) * 880, s: 16 + csR(i + 33400) * 14, b: csR(i + 33500) > 0.5 });
  for (let i = 0; i < 14; i++) SG_DECOR.bollards.push({ x: 58 + i * 94, y: 1050 + 60 });
  for (let i = 0; i < 10; i++) SG_DECOR.benches.push({ x: 2800 + 260 + (i % 5) * 190 + csR(i + 33600) * 40, y: 1050 + (i < 5 ? 190 : 840) });
  for (let i = 0; i < 18; i++) SG_DECOR.vents.push({ x: 2800 + 200 + csR(i + 33700) * 1000, y: 160 + csR(i + 33800) * 740, r: 16 + csR(i + 33900) * 14 });
})();
function sgDrawDecor(ctx, x0, y0, x1, y1, t){
  const on = function(x, y, m){ return x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m; };
  /* lane lines down the middle of every street between cells, with a crosswalk at each crossing */
  ctx.fillStyle = 'rgba(245,225,120,.55)';
  for (let k = 1; k <= 2; k++){
    const rx = k * SG_CW, ry = k * SG_CH;
    if (rx > x0 - 20 && rx < x1 + 20) for (let y = Math.max(0, Math.floor((y0 - 40) / 90) * 90); y < Math.min(3150, y1 + 40); y += 90){ if (Math.abs((y % SG_CH) - 0) < 170 || Math.abs((y % SG_CH) - SG_CH) < 170) continue; ctx.fillRect(rx - 3, y, 6, 46); }
    if (ry > y0 - 20 && ry < y1 + 20) for (let x = Math.max(0, Math.floor((x0 - 40) / 90) * 90); x < Math.min(4200, x1 + 40); x += 90){ if (Math.abs((x % SG_CW) - 0) < 170 || Math.abs((x % SG_CW) - SG_CW) < 170) continue; ctx.fillRect(x, ry - 3, 46, 6); }
  }
  ctx.fillStyle = 'rgba(240,240,236,.5)';
  for (let a = 1; a <= 2; a++) for (let b = 1; b <= 2; b++){
    const cx = a * SG_CW, cy = b * SG_CH; if (!on(cx, cy, 200)) continue;
    for (let i = -3; i <= 3; i++){ ctx.fillRect(cx + i * 16 - 5, cy - 150, 10, 56); ctx.fillRect(cx + i * 16 - 5, cy + 94, 10, 56); ctx.fillRect(cx - 150, cy + i * 16 - 5, 56, 10); ctx.fillRect(cx + 94, cy + i * 16 - 5, 56, 10); }
  }
  /* storm drains and manholes */
  for (let i = 0; i < SG_DECOR.drains.length; i++){
    const d = SG_DECOR.drains[i]; if (!on(d.x, d.y, 30)) continue;
    if (i % 3){ ctx.fillStyle = 'rgba(50,52,58,.85)'; ctx.beginPath(); ctx.arc(d.x, d.y, 14, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(20,22,26,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(d.x, d.y, 9, 0, TAU); ctx.moveTo(d.x - 9, d.y); ctx.lineTo(d.x + 9, d.y); ctx.stroke(); }
    else { ctx.fillStyle = 'rgba(30,32,36,.8)'; ctx.fillRect(d.x - 18, d.y - 6, 36, 12); ctx.fillStyle = 'rgba(120,124,132,.8)'; for (let k = 0; k < 6; k++) ctx.fillRect(d.x - 16 + k * 6, d.y - 4, 3, 8); }
  }
  /* the Park: a pond with a path round it, benches under the trees */
  if (on(3500, 1575, 520)){
    const px = 3500, py = 1575;
    ctx.strokeStyle = 'rgba(206,188,148,.85)'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(px, py, 330, 200, 0, 0, TAU); ctx.moveTo(px - 330, py); ctx.lineTo(2800 + 160, py); ctx.moveTo(px + 330, py); ctx.lineTo(4200 - 160, py); ctx.moveTo(px, py - 200); ctx.lineTo(px, 1050 + 170); ctx.moveTo(px, py + 200); ctx.lineTo(px, 2100 - 170); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = '#2E6A8E'; ctx.beginPath(); ctx.ellipse(px, py, 290, 164, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A92B6'; ctx.beginPath(); ctx.ellipse(px - 20, py - 12, 250, 134, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++){ const w = ((t * 0.3 + i / 6) % 1); ctx.globalAlpha = 0.5 * (1 - w); ctx.beginPath(); ctx.ellipse(px + Math.sin(i * 2.1) * 120, py + Math.cos(i * 1.7) * 60, 14 + w * 40, 7 + w * 20, 0, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#4E8A3A'; for (let i = 0; i < 7; i++){ const a = i * 0.9 + 0.3; ctx.beginPath(); ctx.ellipse(px + Math.cos(a) * 190, py + Math.sin(a) * 100, 16, 10, a, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#F6A8C8'; for (let i = 0; i < 7; i += 2){ const a = i * 0.9 + 0.3; ctx.beginPath(); ctx.arc(px + Math.cos(a) * 190, py + Math.sin(a) * 100, 4, 0, TAU); ctx.fill(); }
  }
  for (let i = 0; i < SG_DECOR.benches.length; i++){
    const b = SG_DECOR.benches[i]; if (!on(b.x, b.y, 40)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x - 24, b.y - 6, 52, 18); ctx.fillStyle = '#7A5634'; ctx.fillRect(b.x - 26, b.y - 10, 52, 16); ctx.fillStyle = '#5E4026'; ctx.fillRect(b.x - 26, b.y - 14, 52, 5); ctx.fillStyle = '#2E2E34'; ctx.fillRect(b.x - 24, b.y + 6, 4, 6); ctx.fillRect(b.x + 18, b.y + 6, 4, 6);
  }
  /* the Harbor: bollards along the quay, crates and barrels stacked about, a coil of rope */
  for (let i = 0; i < SG_DECOR.bollards.length; i++){
    const b = SG_DECOR.bollards[i]; if (!on(b.x, b.y, 20)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(b.x + 3, b.y + 5, 9, 5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#2E3038'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A707C'; ctx.beginPath(); ctx.arc(b.x - 1, b.y - 1, 5, 0, TAU); ctx.fill();
    if (i % 3 === 0){ ctx.strokeStyle = '#C8B07A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x + 24, b.y + 4, 9, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(b.x + 24, b.y + 4, 4, 0, TAU); ctx.stroke(); }
  }
  for (let i = 0; i < SG_DECOR.crates.length; i++){
    const c = SG_DECOR.crates[i]; if (!on(c.x, c.y, 40)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(c.x - c.s / 2 + 5, c.y - c.s / 2 + 7, c.s, c.s);
    if (c.b){ ctx.fillStyle = '#6E4A2A'; ctx.beginPath(); ctx.arc(c.x, c.y, c.s * 0.55, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B4B8C0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c.x, c.y, c.s * 0.38, 0, TAU); ctx.stroke(); }
    else { ctx.fillStyle = '#A8824E'; ctx.fillRect(c.x - c.s / 2, c.y - c.s / 2, c.s, c.s); ctx.strokeStyle = '#6A4C2A'; ctx.lineWidth = 2; ctx.strokeRect(c.x - c.s / 2 + 1, c.y - c.s / 2 + 1, c.s - 2, c.s - 2); ctx.beginPath(); ctx.moveTo(c.x - c.s / 2, c.y - c.s / 2); ctx.lineTo(c.x + c.s / 2, c.y + c.s / 2); ctx.stroke(); }
  }
  /* the Rooftops: rows of roof vents and a painted walkway */
  for (let i = 0; i < SG_DECOR.vents.length; i++){
    const v = SG_DECOR.vents[i]; if (!on(v.x, v.y, 50)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(v.x + 4, v.y + 6, v.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#7C8088'; ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#A4A8B0'; ctx.lineWidth = 2; ctx.beginPath(); for (let a = 0; a < 3; a++){ const q = a * 2.09 + t * 0.8; ctx.moveTo(v.x, v.y); ctx.lineTo(v.x + Math.cos(q) * v.r * 0.55, v.y + Math.sin(q) * v.r * 0.55); } ctx.stroke();
  }
  if (on(3500, 520, 640)){
    ctx.fillStyle = 'rgba(244,214,90,.55)'; for (let x = 2800 + 140; x < 4200 - 140; x += 60){ ctx.fillRect(x, 1050 - 150, 34, 8); }
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 150; y < 900; y += 90) ctx.fillRect(2800 + 134, y, 1132, 3);
  }
  /* the Launchpad: a helipad ring, hazard stripes round the pad, and a row of landing lights */
  if (on(3500, 2625, 560)){
    const px = 3500, py = 2625;
    ctx.strokeStyle = 'rgba(244,244,236,.6)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(px, py, 150, 0, TAU); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py, 128, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(244,244,236,.6)'; ctx.fillRect(px - 52, py - 52, 12, 104); ctx.fillRect(px + 40, py - 52, 12, 104); ctx.fillRect(px - 52, py - 8, 104, 16);
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, 190, 0, TAU); ctx.arc(px, py, 168, 0, TAU, true); ctx.clip();
    for (let i = -8; i < 8; i++){ ctx.fillStyle = i % 2 ? 'rgba(244,196,40,.7)' : 'rgba(30,30,34,.7)'; ctx.beginPath(); ctx.moveTo(px - 200 + i * 28, py - 200); ctx.lineTo(px - 172 + i * 28, py - 200); ctx.lineTo(px + 200 + i * 28, py + 200); ctx.lineTo(px + 172 + i * 28, py + 200); ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < 12; i++){ const a = i * TAU / 12, lx = px + Math.cos(a) * 222, ly = py + Math.sin(a) * 222, on2 = ((t * 2 + i * 0.5) % 2) < 1; ctx.fillStyle = on2 ? '#FF7A5A' : '#6E3A30'; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, TAU); ctx.fill(); }
  }
}

/* ---------------------------------------------------------------- the buildings */
function sgShadow(ctx, b){ ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(b.x + 10, b.y + 14, b.w, b.h); }
function sgBlock(ctx, b, roof, wall, front){          /* a flat roof over a lower front face, the way every building here is seen */
  const f = front === undefined ? Math.min(34, b.h * 0.22) : front;
  sgShadow(ctx, b);
  ctx.fillStyle = wall; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = roof; ctx.fillRect(b.x, b.y, b.w, b.h - f);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(b.x, b.y, b.w, 5);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x, b.y + b.h - f - 4, b.w, 4);
  return f;
}
function sgWindows(ctx, b, f, n, c){
  const gap = b.w / (n + 1); ctx.fillStyle = c || '#F6E2A0';
  for (let i = 1; i <= n; i++){ ctx.fillRect(b.x + gap * i - 9, b.y + b.h - f + 6, 18, f - 12); }
}
function sgAwning(ctx, x, y, w, h, c1, c2){ const n = Math.max(2, Math.round(w / 22)); for (let i = 0; i < n; i++){ ctx.fillStyle = i % 2 ? c2 : c1; ctx.fillRect(x + i * w / n, y, w / n + 0.5, h); } ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y + h, w, 3); }
function sgDrawBuilding(ctx, b, t){
  const k = b.k, x = b.x, y = b.y, w = b.w, h = b.h;
  if (k === 'house' || k === 'roofs'){
    const P = SG_ROOFS[(b.roof | 0) % SG_ROOFS.length], f = sgBlock(ctx, b, P[0], P[1]);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 1; i < 6; i++){ const yy = y + (h - f) * i / 6; ctx.moveTo(x + 4, yy); ctx.lineTo(x + w - 4, yy); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, w, (h - f) * 0.5);
    ctx.fillStyle = P[1]; ctx.fillRect(x + w * 0.7, y + 14, 22, 26); ctx.fillStyle = '#2A2A30'; ctx.fillRect(x + w * 0.7 + 5, y + 19, 12, 12);
    sgWindows(ctx, b, f, Math.max(2, Math.round(w / 110)));
    if (k === 'roofs'){ ctx.fillStyle = '#9AA0AC'; ctx.fillRect(x + 16, y + 16, 54, 34); ctx.fillStyle = '#C8E4F4'; ctx.fillRect(x + 20, y + 20, 46, 26); }
  } else if (k === 'shed' || k === 'gate'){
    const f = sgBlock(ctx, b, k === 'gate' ? '#7A7E88' : '#7A6A52', k === 'gate' ? '#4C5058' : '#4E4232', 24);
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x + 6, y + 6, w - 12, (h - f) * 0.4);
    if (k === 'gate'){ ctx.fillStyle = '#E8C84A'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 10 + i * (w - 20) / 5, y + h - f - 14, (w - 20) / 10, 10); }
  } else if (k === 'stall' || k === 'cafe'){
    sgShadow(ctx, b);
    ctx.fillStyle = '#7A5A38'; ctx.fillRect(x, y + h * 0.4, w, h * 0.6);
    sgAwning(ctx, x - 4, y, w + 8, h * 0.5, k === 'cafe' ? '#3E7A9A' : '#D8483A', '#F4EEE0');
    ctx.fillStyle = ['#E8A83A', '#8AC84A', '#E85A5A'][Math.floor(Math.abs(x) / 7) % 3]; for (let i = 0; i < 5; i++) ctx.fillRect(x + 8 + i * (w - 16) / 5, y + h * 0.62, (w - 16) / 5 - 4, 10);
  } else if (k === 'tank' || k === 'crane'){
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x + w / 2 + 10, y + h / 2 + 14, w * 0.5, h * 0.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = k === 'tank' ? '#8A93A2' : '#C8A02A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.38, w * 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 6, 0, TAU); ctx.stroke();
    if (k === 'crane'){ ctx.strokeStyle = '#6A5014'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2 + 90, y + h / 2 - 30); ctx.stroke(); }
  } else if (k === 'crates'){
    sgShadow(ctx, b); for (let i = 0; i < 6; i++){ const cx2 = x + (i % 3) * (w / 3), cy2 = y + Math.floor(i / 3) * (h / 2); ctx.fillStyle = i % 2 ? '#A88A52' : '#B89A62'; ctx.fillRect(cx2 + 2, cy2 + 2, w / 3 - 4, h / 2 - 4); ctx.strokeStyle = '#6E5630'; ctx.lineWidth = 2; ctx.strokeRect(cx2 + 2, cy2 + 2, w / 3 - 4, h / 2 - 4); ctx.beginPath(); ctx.moveTo(cx2 + 2, cy2 + 2); ctx.lineTo(cx2 + w / 3 - 2, cy2 + h / 2 - 2); ctx.stroke(); }
  } else if (k === 'sea'){
    ctx.fillStyle = '#2E6A9A'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 22; i++){ const yy = y + (i + 0.5) * h / 22 + Math.sin(t * 1.4 + i) * 6; ctx.strokeStyle = 'rgba(200,236,255,.22)'; ctx.lineWidth = 3; ctx.beginPath(); for (let u = 0; u <= w; u += 20) ctx.lineTo(x + u, yy + Math.sin(u * 0.05 + t * 2 + i) * 5); ctx.stroke(); }
    ctx.fillStyle = '#4A3A24'; ctx.fillRect(x + w - 18, y, 18, h); ctx.fillStyle = '#6A5436'; ctx.fillRect(x + w - 18, y, 6, h);                          /* the quay edge */
  } else if (k === 'pond'){
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + w / 2 + 6, y + h / 2 + 8, w / 2 + 8, h / 2 + 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9A9A86'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 8, h / 2 + 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3E86A8'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(220,244,255,.4)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++){ ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * (0.2 + i * 0.12) + Math.sin(t + i) * 4, h * (0.2 + i * 0.12), 0, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#4A9A3A'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.arc(x + w * (0.25 + i * 0.12), y + h * (0.35 + (i % 2) * 0.3), 12, 0, TAU); ctx.fill(); }
  } else if (k === 'fountain'){
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(x + w / 2 + 6, y + h / 2 + 8, w / 2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#B8B2A4'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.fillStyle = '#4A9AC0'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 12, 0, TAU); ctx.fill();
    ctx.fillStyle = '#D8D2C2'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 14, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(230,248,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 22 + Math.sin(t * 3) * 3, 0, TAU); ctx.stroke();
  } else if (k === 'tram' || k === 'booth' || k === 'shack' || k === 'arcade' || k === 'grove' || k === 'scope' || k === 'boat'){
    const pal = { tram: ['#C84A3A', '#7E2A20'], booth: ['#7A6EA8', '#4A426E'], shack: ['#8E6A44', '#5E442A'], arcade: ['#3E7E9A', '#26506A'], grove: ['#3E7A34', '#285020'], scope: ['#C8CCD4', '#7E828E'], boat: ['#B8503A', '#6E2E22'] }[k];
    const f = sgBlock(ctx, b, pal[0], pal[1], k === 'boat' ? 20 : undefined);
    if (k === 'boat'){ ctx.fillStyle = '#F0E8D6'; ctx.fillRect(x + w * 0.18, y + 14, w * 0.64, h - 54); ctx.fillStyle = '#6A8AA8'; ctx.fillRect(x + w * 0.58, y + 20, 30, 24); }
    else if (k === 'scope'){ ctx.fillStyle = '#4A5060'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 8, w * 0.32, 0, TAU); ctx.fill(); ctx.fillStyle = '#9AD8F0'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 8, w * 0.2, 0, TAU); ctx.fill(); }
    else if (k === 'grove'){ for (let i = 0; i < 9; i++){ ctx.fillStyle = i % 2 ? '#4A9A3A' : '#5AAA48'; ctx.beginPath(); ctx.arc(x + 50 + (i % 3) * (w - 100) / 2, y + 44 + Math.floor(i / 3) * (h - 100) / 2, 36, 0, TAU); ctx.fill(); } }
    else { ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + 8, y + 8, w - 16, (h - f) * 0.35); sgWindows(ctx, b, f, Math.max(2, Math.round(w / 100))); if (k === 'arcade'){ ctx.fillStyle = '#F2E24A'; ctx.fillRect(x + w * 0.3, y + 22, w * 0.4, 18); } }
  } else if (k === 'rocket'){
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(x + w / 2 + 10, y + h / 2 + 12, w / 2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.strokeStyle = '#E8C84A'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 8, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#E8E8EE'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#D8483A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.1, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C8CCD4'; for (let i = 0; i < 4; i++){ const a = i * TAU / 4 + 0.78; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(a); ctx.fillRect(w * 0.18, -7, w * 0.26, 14); ctx.restore(); }
  } else if (k === 'nest' || k === 'wing') sgDrawSandbags(ctx, b, t);
  else sgDrawKey(ctx, b, t);
  if (b.key) sgDrawKeyStatus(ctx, b, t);
  if (b.post && k === 'nest') sgDrawPostStatus(ctx, b, t);
}
/* the five key buildings, each with something that says what it is */
function sgDrawKey(ctx, b, t){
  const k = b.k, x = b.x, y = b.y, w = b.w, h = b.h;
  if (k === 'hall'){
    const f = sgBlock(ctx, b, '#A8503C', '#6E3024', 44);
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, y, w, (h - f) * 0.45);
    ctx.fillStyle = '#7E3828'; ctx.fillRect(x + 20, y + 20, w - 40, h - f - 40); ctx.fillStyle = '#B8604A'; ctx.fillRect(x + 28, y + 28, w - 56, h - f - 56);        /* the roof's inner panels */
    ctx.fillStyle = '#D8CFA8'; ctx.fillRect(x + w / 2 - 54, y + 36, 108, 108); ctx.fillStyle = '#8A7A44'; ctx.fillRect(x + w / 2 - 44, y + 46, 88, 88);                    /* the bell tower */
    ctx.fillStyle = '#E8C84A'; ctx.beginPath(); ctx.arc(x + w / 2, y + 90, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#6E5A14'; ctx.beginPath(); ctx.arc(x + w / 2, y + 90, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#F6E2A0'; for (let i = 1; i <= 6; i++) ctx.fillRect(x + w * i / 7 - 10, y + h - f + 8, 20, f - 16);
    ctx.fillStyle = '#C8C2B2'; ctx.fillRect(x + w / 2 - 70, y + h, 140, 14); ctx.fillRect(x + w / 2 - 56, y + h + 14, 112, 10);                                           /* the steps */
  } else if (k === 'library'){
    const f = sgBlock(ctx, b, '#5E7898', '#364A66', 40);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, y, w, (h - f) * 0.4);
    for (let i = 0; i < 4; i++){ ctx.fillStyle = '#9ED4EC'; ctx.beginPath(); ctx.ellipse(x + w * (i + 0.5) / 4, y + 74, 30, 44, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2E4058'; ctx.lineWidth = 3; ctx.stroke(); }                 /* arched skylights */
    ctx.fillStyle = '#DCD0A8'; ctx.fillRect(x + w / 2 - 50, y + h - f - 2, 100, f + 2); ctx.fillStyle = '#2A2A34'; ctx.fillRect(x + w / 2 - 22, y + h - f + 6, 44, f - 6);
    ctx.fillStyle = '#F6E2A0'; for (let i = 1; i <= 7; i++) if (i !== 4) ctx.fillRect(x + w * i / 8 - 8, y + h - f + 8, 16, f - 16);
  } else if (k === 'post'){
    const f = sgBlock(ctx, b, '#8A6A44', '#5A4228', 38);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, y, w, (h - f) * 0.4);
    ctx.fillStyle = '#6E5434'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 14 + i * (w - 28) / 6, y + 18, (w - 28) / 6 - 6, h - f - 36);
    sgAwning(ctx, x + 10, y + h - f - 6, w - 20, 30, '#D8483A', '#F4EEE0');
    ctx.fillStyle = '#F6E2A0'; ctx.fillRect(x + w / 2 - 22, y + h - f + 12, 44, f - 14);
    ctx.fillStyle = '#E8C84A'; ctx.beginPath(); ctx.arc(x + w - 46, y + 52, 20, 0, TAU); ctx.fill(); ctx.fillStyle = '#6E5A14'; ctx.font = '800 22px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('$', x + w - 46, y + 60);
  } else if (k === 'lighthouse'){
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x + w / 2 + 12, y + h / 2 + 16, w / 2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#B8B2A4'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill();
    for (let i = 0; i < 3; i++){ ctx.fillStyle = i % 2 ? '#F4EEE0' : '#D8483A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 6 - i * 20, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFE49A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 14, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x + w / 2, y + h / 2); ctx.rotate(t * 0.8); const g = ctx.createLinearGradient(0, 0, 340, 0); g.addColorStop(0, 'rgba(255,230,150,.45)'); g.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(340, -34); ctx.lineTo(340, 34); ctx.closePath(); ctx.fill(); ctx.restore();
  } else if (k === 'mission'){
    const f = sgBlock(ctx, b, '#B8BCC4', '#6E727E', 40);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x, y, w, (h - f) * 0.4);
    ctx.fillStyle = '#7E828E'; ctx.beginPath(); ctx.arc(x + 110, y + 100, 62, 0, TAU); ctx.fill(); ctx.fillStyle = '#D8DCE4'; ctx.beginPath(); ctx.arc(x + 110, y + 100, 54, 0, TAU); ctx.fill();         /* the dish */
    ctx.strokeStyle = '#8E929E'; ctx.lineWidth = 3; for (let i = 1; i < 4; i++){ ctx.beginPath(); ctx.arc(x + 110, y + 100, 54 * i / 4, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#D8483A'; ctx.beginPath(); ctx.arc(x + 110, y + 100, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A5668'; ctx.fillRect(x + w - 190, y + 36, 150, 90); ctx.fillStyle = Math.sin(t * 3) > 0 ? '#7AF0B0' : '#2E6A4A'; ctx.fillRect(x + w - 180, y + 46, 20, 12);               /* the control room's roof lights */
    ctx.fillStyle = '#9ED4EC'; for (let i = 1; i <= 7; i++) ctx.fillRect(x + w * i / 8 - 11, y + h - f + 8, 22, f - 16);
  }
}
