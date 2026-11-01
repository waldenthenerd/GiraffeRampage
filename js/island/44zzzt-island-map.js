'use strict';
/* Chapter 17, the Island Lab: the island as the arena (the chapter itself is in js/island/30g-chapter-island.js). */
/* ========================= THE ISLAND IN PLAY ========================= */
/* The arena is the island, seen from above, south to north: the landing beach where the fishing boat is moored in the surf, the shallows and tide pools, the reef flats (three
   sheets of shallow water over the coral, with two dry causeways across), the mangrove edge, and behind a fence the lab compound: glass tank houses, a pump house, holding
   pools, the lab block, the helipad, and in the middle of the north side the flooded tank room. Deep sea runs down both sides and along the south, and the compound's back is
   a concrete sea wall; none of it can be crossed. The rocks, coral heads, mangroves, palms and buildings are solid, like the Siege's houses: she, her ants and every creature go
   round them, and every shot dies on one. The Tower's flow field (towerFlow, towerSteer) is reused so creatures come round them, which is why the island is put in TW.floor like a
   floor of walls (its vents are where the creatures come up out of the sea, and out of the lab's tanks).
   The water is the part that matters: isleWet(x, y) says whether a spot is in the shallows, from the same shapes the ground is painted with (ISLE_BANDS, ISLE_REEF, ISLE_POOLS,
   ISLE_BASIN), so what you see is what you wade in. In the water she is a little slower (ISLE_WADE), the swimmers among the creatures are quicker and the rest slower, and the
   eels and snakes hide under it (js/island/44zzzu-island-ai.js). ISLE_PROPS is the plan as data (kind, x, y, w, h in arena pixels); ilDrawProp paints every kind. */
const ISLE_WADE = 0.8;                                              /* her speed in the shallows, as a share of her speed on the sand */
const ISLE_SEA = [[0, 0, 200, 3150, 'sea'], [4000, 0, 200, 3150, 'sea'], [200, 3000, 3800, 150, 'sea'], [200, 0, 3800, 110, 'seawall']];
/* the shallow band along each coast: how far it reaches from the deep water, a little different every few metres */
function ilBandW(t, k){ return 150 + 40 * Math.sin(t / 210 + k) + 22 * Math.sin(t / 77 + 1.3 + k * 2); }
/* the reef flats: three sheets between a wavy top and bottom edge, with dry causeways between them */
const ISLE_REEF = [[200, 1500], [1700, 2500], [2700, 4000]];
function ilReefTop(x){ return 1430 + 40 * Math.sin(x / 260) + 18 * Math.sin(x / 90 + 0.7); }
function ilReefBot(x){ return 1930 + 40 * Math.sin(x / 300 + 1) + 16 * Math.sin(x / 110 + 2.1); }
/* the tide pools: [cx, cy, rx, ry, rotation] */
const ISLE_POOLS = [[700, 2150, 190, 110, 0.2], [960, 2420, 160, 90, -0.3], [1450, 2120, 200, 120, 0.1], [1720, 2400, 150, 90, 0.4], [2250, 2260, 220, 130, -0.2],
  [2600, 2080, 160, 90, 0.3], [3050, 2320, 200, 110, 0.15], [3520, 2200, 170, 100, -0.25], [3330, 2500, 150, 80, 0], [1260, 2560, 120, 70, 0.3]];
const ISLE_BASIN = { x: 1500, y: 160, w: 1200, h: 480 };            /* the flooded tank room */
/* is (x, y) in the shallows? */
function isleWet(x, y){
  if (x < 200 || x > 4000 || y < 110 || y > 3000) return false;
  if (x < 200 + ilBandW(y, 0) || x > 4000 - ilBandW(y, 1.7)) return true;
  if (y > 3000 - ilBandW(x, 0.5)) return true;
  if (x >= ISLE_BASIN.x && x <= ISLE_BASIN.x + ISLE_BASIN.w && y >= ISLE_BASIN.y && y <= ISLE_BASIN.y + ISLE_BASIN.h) return true;
  if (y > 1360 && y < 2000) for (let i = 0; i < ISLE_REEF.length; i++){ const r = ISLE_REEF[i]; if (x >= r[0] && x <= r[1] && y >= ilReefTop(x) && y <= ilReefBot(x)) return true; }
  if (y > 1950 && y < 2650) for (let i = 0; i < ISLE_POOLS.length; i++){
    const p = ISLE_POOLS[i], dx = x - p[0], dy = y - p[1], c = Math.cos(-p[4]), s = Math.sin(-p[4]), u = (dx * c - dy * s) / p[2], v = (dx * s + dy * c) / p[3];
    if (u * u + v * v <= 1) return true;
  }
  return false;
}
/* [kind, x, y, w, h] */
const ISLE_PROPS = [
  /* the lab compound */
  ['tankhouse', 420, 170, 440, 260], ['pump', 960, 170, 360, 200], ['tankhouse', 420, 560, 440, 250], ['pool', 960, 520, 380, 220],
  ['lab', 2840, 160, 420, 280], ['pool', 2840, 560, 420, 230], ['gen', 3720, 640, 150, 110], ['heli', 3390, 315, 190, 95], ['booth', 2000, 110, 200, 70],
  ['basinwall', 1460, 160, 40, 180], ['basinwall', 1460, 460, 40, 220], ['basinwall', 2700, 160, 40, 180], ['basinwall', 2700, 460, 40, 220], ['basinwall', 1500, 640, 460, 40], ['basinwall', 2200, 640, 500, 40],
  ['tank', 1580, 220, 110, 110], ['tank', 2510, 220, 110, 110], ['tank', 1580, 500, 100, 100], ['tank', 2520, 500, 100, 100],
  ['fence', 380, 900, 700, 24], ['fence', 1300, 900, 800, 24], ['fence', 2350, 900, 700, 24], ['fence', 3300, 900, 520, 24],
  /* the mangrove edge */
  ['mangrove', 430, 1010, 240, 150], ['mangrove', 860, 1220, 220, 140], ['mangrove', 1300, 1010, 240, 140], ['mangrove', 2620, 1040, 260, 150], ['mangrove', 3150, 1150, 240, 150], ['mangrove', 3560, 990, 260, 170],
  ['palm', 1075, 975, 50, 50], ['palm', 1875, 1035, 50, 50], ['palm', 2225, 1185, 50, 50], ['palm', 2935, 960, 50, 50], ['palm', 3425, 1305, 50, 50], ['palm', 575, 1305, 50, 50], ['palm', 1525, 1290, 50, 50],
  /* the reef flats */
  ['coral', 520, 1570, 140, 110], ['coral', 980, 1710, 170, 120], ['coral', 1250, 1520, 120, 100], ['coral', 1880, 1630, 150, 120], ['coral', 2250, 1500, 140, 110],
  ['coral', 2920, 1660, 160, 120], ['coral', 3350, 1520, 130, 110], ['coral', 3650, 1730, 150, 110],
  /* the shallows and tide pools */
  ['rock', 430, 2330, 170, 120], ['rock', 1120, 2240, 150, 110], ['rock', 1950, 2030, 140, 100], ['rock', 2700, 2330, 180, 120], ['rock', 3250, 2050, 150, 110], ['rock', 3700, 2420, 140, 100],
  /* the beach */
  ['boat', 1980, 2880, 300, 96], ['log', 700, 2700, 220, 40], ['log', 3200, 2650, 200, 40], ['crate', 2620, 2700, 80, 80], ['crate', 1300, 2640, 70, 70], ['crate', 2720, 2730, 60, 60]
];
/* where the creatures come in: up out of the sea in the shallows all round the island, and out of the lab's tanks */
const ISLE_VENTS = [{ x: 290, y: 420 }, { x: 290, y: 1100 }, { x: 290, y: 1750 }, { x: 290, y: 2350 }, { x: 290, y: 2850 }, { x: 3910, y: 420 }, { x: 3910, y: 1100 }, { x: 3910, y: 1750 },
  { x: 3910, y: 2350 }, { x: 3910, y: 2850 }, { x: 600, y: 2940 }, { x: 1300, y: 2940 }, { x: 2800, y: 2940 }, { x: 3400, y: 2940 }, { x: 2100, y: 400 }, { x: 2400, y: 780 }, { x: 2100, y: 770 }];
const IL = { all: [], cache: {}, rip: [] };

function ilProp(row){ return { x: row[1], y: row[2], w: row[3], h: row[4], style: 'tower', tower: true, isle: true, kind: row[0], hp: 1, maxHp: 1, collapsed: false, flash: 0, indestructible: true, units: [], cracks: [], rubble: [] }; }
function ilRows(){ return ISLE_SEA.map(function(s){ return [s[4], s[0], s[1], s[2], s[3]]; }).concat(ISLE_PROPS); }
function buildIsleWorld(){
  const rows = ilRows();
  IL.all = rows.map(ilProp);
  const f = { walls: rows.map(function(r){ return { x: r[1], y: r[2], w: r[3], h: r[4], k: r[0] }; }), boxes: [], rooms: [], doors: [], vents: ISLE_VENTS, props: [], start: isleStart(), n: 1, name: 'The Island', kind: 'isle', lift: null };
  TW.floor = f; TW.n = 1; TW.ride = null; TW.open = false;
  G.buildings = IL.all.slice(); G.tower = true; G.rocket = null; G.water = null;      /* no waterhole: the whole island is water */
  towerNavBuild(f);
  G.il = { wet: false, glimpse: null, clean: true };
}
/* where she stands when the run starts: on the sand above the boat she came in */
function isleStart(){ return { x: 2130, y: 2760 }; }
const isleBaseStartRun = startRun;
startRun = function(){
  const r = isleBaseStartRun.apply(this, arguments);
  if (G.chapter === ISLE_CHAPTER && G.biome === 'isle'){ const s = isleStart(); P.x = s.x; P.y = s.y; P.vx = 0; P.vy = 0; }
  return r;
};
/* the props are drawn with the ground (they are flat, like the Siege's houses), so the city's own drawBuilding skips them */
const isleBaseDrawBuilding = drawBuilding;
drawBuilding = function(ctx, b){ if (b.isle) return; return isleBaseDrawBuilding.apply(this, arguments); };
/* kicking a rock throws sparks but no "Indestructible" note: the island is full of them */
const isleBaseDeflect = deflectSpark;
deflectSpark = function(b){ if (!b.isle) return isleBaseDeflect.apply(this, arguments); const keep = G.rocketNoteT; G.rocketNoteT = 1e18; isleBaseDeflect.apply(this, arguments); G.rocketNoteT = keep; };
/* wading: in the shallows she is slower (the scenery's own terrain, mud or ice, is worked out first and kept) */
const isleBaseSceneryUpdate = sceneryUpdate;
sceneryUpdate = function(dt){
  isleBaseSceneryUpdate.apply(this, arguments);
  if (G.biome !== 'isle' || G.state !== 'playing' || P.dead) return;
  if (isleWet(P.x, P.y)){
    G.terrain = G.terrain ? Object.assign({}, G.terrain, { spd: G.terrain.spd * ISLE_WADE }) : { kind: 'wade', spd: ISLE_WADE, accel: 1 };
    if (G.il && G.chapter === ISLE_CHAPTER) G.il.wet = true;
    if (Math.hypot(P.vx, P.vy) > 60 && Math.random() < dt * 9) ilSplash(P.x + rand(-10, 10), P.y + rand(-6, 10), 0.7);
  }
};
function ilSplash(x, y, s){
  for (let i = 0; i < 3; i++) addParticle(x, y, rand(-60, 60) * s, rand(-70, -20) * s, rand(1.6, 3) * s, 0.4, i ? '#E8FAFA' : '#9AE0E0', { drag: 3 });
  if (IL.rip.length < 60) IL.rip.push({ x: x, y: y, t: 0, s: s });
}

/* ---------------------------------------------------------------- the ground */
function ilPattern(kind){
  if (IL.cache[kind]) return IL.cache[kind];
  const S = 160, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); if (!g) return '#E2CF9A';
  const rn = function(i){ return csR(i + kind.length * 733 + kind.charCodeAt(0) * 41); };
  if (kind === 'sand'){
    g.fillStyle = '#E2CF9A'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 420; i++){ g.fillStyle = ['#EAD8A6', '#D6C28C', '#F0E2B8', '#CCB680'][i % 4]; g.fillRect(rn(i) * S, rn(i + 400) * S, 1.5 + rn(i + 800) * 2, 1.5 + rn(i + 1200) * 2); }
    g.strokeStyle = 'rgba(180,156,100,.22)'; g.lineWidth = 2; for (let k = 0; k < 4; k++){ g.beginPath(); const y = 20 + k * 40; for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x / 18 + k) * 4); g.stroke(); }
  } else if (kind === 'mud'){
    g.fillStyle = '#9A8A5E'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 320; i++){ g.fillStyle = ['#A8986A', '#8A7A50', '#B4A476', '#7E6E48'][i % 4]; g.fillRect(rn(i) * S, rn(i + 400) * S, 2 + rn(i + 800) * 3, 2 + rn(i + 1200) * 2); }
    for (let i = 0; i < 18; i++){ g.fillStyle = 'rgba(80,110,60,.5)'; const x = rn(i + 1600) * S, y = rn(i + 1700) * S; for (let k = 0; k < 4; k++) g.fillRect(x + k * 2 - 3, y - 4 - k % 2 * 2, 1.4, 6); }
  } else if (kind === 'concrete'){
    g.fillStyle = '#B4BAB8'; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(60,70,70,.3)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S); g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S / 2, S); g.moveTo(0, S / 2); g.lineTo(S, S / 2); g.stroke();
    for (let i = 0; i < 180; i++){ g.fillStyle = rn(i) > 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.07)'; g.fillRect(rn(i + 300) * S, rn(i + 700) * S, 2, 2); }
    g.fillStyle = 'rgba(90,120,110,.12)'; g.beginPath(); g.ellipse(S * 0.7, S * 0.3, 26, 14, 0.4, 0, TAU); g.fill();
  } else {
    g.fillStyle = '#1C4E6E'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++){ g.strokeStyle = 'rgba(160,220,240,' + (0.06 + rn(i) * 0.1).toFixed(2) + ')'; g.lineWidth = 1.5; const x = rn(i + 100) * S, y = rn(i + 200) * S, l = 10 + rn(i + 300) * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  }
  return IL.cache[kind] = (CTX && CTX.createPattern ? CTX.createPattern(c, 'repeat') : null) || '#E2CF9A';
}
/* the water, as one path (every shape wound the same way, so where they overlap they join): the coast bands, the reef sheets and the tide pools; the tank room is its own */
function ilWaterPath(){
  if (IL.path) return IL.path;
  const p = new Path2D();
  p.moveTo(200, 110); for (let y = 110; y <= 3000; y += 30) p.lineTo(200 + ilBandW(y, 0), y); p.lineTo(200, 3000); p.closePath();
  p.moveTo(4000 - ilBandW(110, 1.7), 110); p.lineTo(4000, 110); p.lineTo(4000, 3000); for (let y = 3000; y >= 110; y -= 30) p.lineTo(4000 - ilBandW(y, 1.7), y); p.closePath();
  p.moveTo(200, 3000 - ilBandW(200, 0.5)); for (let x = 200; x <= 4000; x += 30) p.lineTo(x, 3000 - ilBandW(x, 0.5)); p.lineTo(4000, 3000); p.lineTo(200, 3000); p.closePath();
  for (let i = 0; i < ISLE_REEF.length; i++){
    const r = ISLE_REEF[i]; p.moveTo(r[0], ilReefTop(r[0]));
    for (let x = r[0]; x <= r[1]; x += 25) p.lineTo(x, ilReefTop(x)); p.lineTo(r[1], ilReefTop(r[1])); p.lineTo(r[1], ilReefBot(r[1]));
    for (let x = r[1]; x >= r[0]; x -= 25) p.lineTo(x, ilReefBot(x)); p.lineTo(r[0], ilReefBot(r[0])); p.closePath();
  }
  for (let i = 0; i < ISLE_POOLS.length; i++){ const o = ISLE_POOLS[i]; p.moveTo(o[0] + Math.cos(o[4]) * o[2], o[1] + Math.sin(o[4]) * o[2]); p.ellipse(o[0], o[1], o[2], o[3], o[4], 0, TAU); }
  return IL.path = p;
}
function ilOn(x0, y0, x1, y1, x, y, m){ return x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m; }
function ilHit(o, x0, y0, x1, y1, m){ return !(o.x + o.w + m < x0 || o.x - m > x1 || o.y + o.h + m < y0 || o.y - m > y1); }
function drawGroundIsle(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  if (!IL.all.length) IL.all = ilRows().map(ilProp);                                          /* the menu's picture of the island, before any run has built it */
  ctx.fillStyle = ilPattern('sand'); ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  /* the mangrove mud and the lab's concrete pad */
  if (y0 < 1450 && y1 > 900){ ctx.fillStyle = ilPattern('mud'); ctx.beginPath(); ctx.moveTo(200, 960); for (let x = 200; x <= 4000; x += 40) ctx.lineTo(x, 960 + 26 * Math.sin(x / 140)); for (let x = 4000; x >= 200; x -= 40) ctx.lineTo(x, 1390 + 34 * Math.sin(x / 170 + 1)); ctx.closePath(); ctx.fill(); }
  if (y0 < 960){ ctx.fillStyle = 'rgba(30,40,40,.25)'; ctx.fillRect(366, 104, 3468, 846); ctx.fillStyle = ilPattern('concrete'); ctx.fillRect(380, 110, 3440, 830); ilLabFloor(ctx, x0, y0, x1, y1, t); }
  /* the water: a dark wet-sand rim, the teal shallows, the sandy bottom showing through, and foam on the edge */
  const wp = ilWaterPath();
  ctx.save(); ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(150,126,80,.55)'; ctx.lineWidth = 56; ctx.stroke(wp);
  ctx.strokeStyle = 'rgba(176,152,100,.6)'; ctx.lineWidth = 26; ctx.stroke(wp);
  ctx.fillStyle = 'rgba(70,184,192,.78)'; ctx.fill(wp);
  ctx.clip(wp);
  ilWaterBed(ctx, x0, y0, x1, y1, t);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(240,252,250,' + (0.55 + 0.2 * Math.sin(t * 1.3)).toFixed(2) + ')'; ctx.lineWidth = 4; ctx.setLineDash([26, 14]); ctx.lineDashOffset = -t * 14; ctx.stroke(wp); ctx.setLineDash([]); ctx.restore();
  /* the flooded tank room: water over the tiled floor */
  if (ilOn(x0, y0, x1, y1, ISLE_BASIN.x + 600, ISLE_BASIN.y + 240, 900)) ilBasin(ctx, t);
  ilSea(ctx, x0, y0, x1, y1, t);
  ilDecor(ctx, x0, y0, x1, y1, t);
  for (let i = 0; i < IL.all.length; i++){ const b = IL.all[i]; if (b.kind === 'sea' || b.kind === 'seawall' || !ilHit(b, x0, y0, x1, y1, 160)) continue; ilDrawProp(ctx, b, t); }
}
/* the bottom of the shallows: rippled sand, weed, pebbles and the light moving over them (drawn inside the water's clip) */
function ilWaterBed(ctx, x0, y0, x1, y1, t){
  const gx0 = Math.floor(x0 / 120) * 120, gy0 = Math.floor(y0 / 120) * 120;
  for (let gx = gx0; gx < x1 + 120; gx += 120) for (let gy = gy0; gy < y1 + 120; gy += 120){
    const r = csR(gx * 7 + gy * 13), r2 = csR(gx * 11 + gy * 5 + 3);
    ctx.strokeStyle = 'rgba(250,255,250,' + (0.1 + 0.08 * Math.sin(t * 1.6 + r * 9)).toFixed(3) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); for (let k = 0; k < 3; k++){ const yy = gy + 20 + k * 34 + r * 10; ctx.moveTo(gx + 6, yy); for (let x = 6; x <= 114; x += 12) ctx.lineTo(gx + x, yy + Math.sin((gx + x) / 16 + t * 1.2 + k) * 4); } ctx.stroke();
    if (r < 0.35){ ctx.fillStyle = 'rgba(40,110,90,.5)'; for (let k = 0; k < 5; k++){ const bx = gx + 30 + r2 * 60 + k * 4, sw = Math.sin(t * 1.4 + k + r * 6) * 5; ctx.beginPath(); ctx.moveTo(bx, gy + 80); ctx.quadraticCurveTo(bx + sw, gy + 64, bx + sw * 1.6, gy + 48 - k * 2); ctx.lineTo(bx + sw * 1.6 + 2, gy + 48 - k * 2); ctx.quadraticCurveTo(bx + sw + 2, gy + 64, bx + 3, gy + 80); ctx.fill(); } }
    if (r2 < 0.5){ ctx.fillStyle = 'rgba(30,70,80,.35)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(gx + csR(gx + k * 3 + gy) * 110, gy + csR(gy + k * 7 + gx) * 110, 4 + k, 3 + k * 0.6, k, 0, TAU); ctx.fill(); } }
    if (r > 0.82){ ctx.fillStyle = '#E86A5A'; ctx.save(); ctx.translate(gx + 60 + r2 * 30, gy + 50); ctx.rotate(r * 6); ctx.beginPath(); for (let k = 0; k < 10; k++){ const a = k * TAU / 10, rr = k % 2 ? 5 : 13; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F8A890'; for (let k = 0; k < 5; k++){ const a = k * TAU / 5; ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 1.4, 0, TAU); ctx.fill(); } ctx.restore(); }
  }
}
/* the deep sea down both sides and along the south, and the sea wall behind the lab */
function ilSea(ctx, x0, y0, x1, y1, t){
  for (let i = 0; i < ISLE_SEA.length; i++){
    const s = ISLE_SEA[i], o = { x: s[0], y: s[1], w: s[2], h: s[3] }; if (!ilHit(o, x0, y0, x1, y1, 40)) continue;
    if (s[4] === 'seawall'){
      ctx.fillStyle = ilPattern('deep'); ctx.fillRect(o.x, o.y, o.w, 54); ctx.fillStyle = '#7A8284'; ctx.fillRect(o.x, o.y + 54, o.w, o.h - 54); ctx.fillStyle = '#9AA2A4'; ctx.fillRect(o.x, o.y + 54, o.w, 10); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(o.x, o.y + o.h, o.w, 10);
      ctx.strokeStyle = '#5A6264'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = Math.max(o.x, Math.floor(x0 / 80) * 80); x < Math.min(o.x + o.w, x1 + 80); x += 80){ ctx.moveTo(x, o.y + 64); ctx.lineTo(x, o.y + o.h); } ctx.stroke();
      ctx.strokeStyle = '#C8CED0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(Math.max(o.x, x0 - 20), o.y + o.h - 12); ctx.lineTo(Math.min(o.x + o.w, x1 + 20), o.y + o.h - 12); ctx.stroke();
      ctx.fillStyle = '#5A6264'; for (let x = Math.max(o.x, Math.floor(x0 / 60) * 60); x < Math.min(o.x + o.w, x1 + 60); x += 60) ctx.fillRect(x - 2, o.y + o.h - 18, 4, 12);
      ctx.strokeStyle = 'rgba(240,252,250,.5)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = Math.max(o.x, x0 - 20); x < Math.min(o.x + o.w, x1 + 20); x += 14) ctx.lineTo(x, o.y + 50 + Math.sin(x / 30 + t * 2) * 3); ctx.stroke();
      continue;
    }
    ctx.fillStyle = ilPattern('deep'); ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = 'rgba(8,20,28,.35)'; if (o.w < o.h) ctx.fillRect(o.x < 2000 ? o.x : o.x + o.w * 0.5, o.y, o.w * 0.5, o.h); else ctx.fillRect(o.x, o.y + o.h * 0.5, o.w, o.h * 0.5);
    ctx.strokeStyle = 'rgba(200,240,250,.18)'; ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++){ ctx.beginPath(); if (o.w < o.h){ const xx = o.x + o.w * (0.2 + k * 0.2); for (let y = Math.max(o.y, y0 - 30); y < Math.min(o.y + o.h, y1 + 30); y += 16) ctx.lineTo(xx + Math.sin(y / 40 + t * 1.5 + k) * 6, y); } else { const yy = o.y + o.h * (0.2 + k * 0.2); for (let x = Math.max(o.x, x0 - 30); x < Math.min(o.x + o.w, x1 + 30); x += 16) ctx.lineTo(x, yy + Math.sin(x / 40 + t * 1.5 + k) * 6); } ctx.stroke(); }
    /* the break where the deep meets the shallows */
    ctx.strokeStyle = 'rgba(250,255,255,.7)'; ctx.lineWidth = 6; ctx.beginPath();
    if (o.w < o.h){ const ex = o.x < 2000 ? o.x + o.w : o.x; for (let y = Math.max(o.y, y0 - 30); y < Math.min(o.y + o.h, y1 + 30); y += 12) ctx.lineTo(ex + Math.sin(y / 26 + t * 2.4) * 4, y); }
    else { for (let x = Math.max(o.x, x0 - 30); x < Math.min(o.x + o.w, x1 + 30); x += 12) ctx.lineTo(x, o.y + Math.sin(x / 26 + t * 2.4) * 4); }
    ctx.stroke();
  }
}
/* the lab's floor: painted walkways, drain grates, pipes from the tank houses to the tank room, and the helipad */
function ilLabFloor(ctx, x0, y0, x1, y1, t){
  ctx.fillStyle = 'rgba(232,200,74,.55)'; for (const [ax, ay, bx, by] of [[380, 480, 1460, 480], [1320, 300, 1460, 300], [2740, 420, 2840, 420], [2100, 680, 2100, 900], [1190, 480, 1190, 900], [3050, 470, 3050, 560]]){
    if (!ilHit({ x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay) }, x0, y0, x1, y1, 30)) continue;
    const n = Math.hypot(bx - ax, by - ay) / 40; for (let i = 0; i < n; i++){ const px = ax + (bx - ax) * i / n, py = ay + (by - ay) * i / n; ctx.fillRect(px - (ax === bx ? 3 : 10), py - (ax === bx ? 10 : 3), ax === bx ? 6 : 20, ax === bx ? 20 : 6); }
  }
  for (const [gx, gy] of [[900, 470], [1400, 720], [2400, 760], [3100, 480], [3600, 800], [700, 880]]){ if (!ilOn(x0, y0, x1, y1, gx, gy, 40)) continue; ctx.fillStyle = '#4A5254'; ctx.fillRect(gx - 18, gy - 12, 36, 24); ctx.fillStyle = '#22282A'; for (let k = 0; k < 6; k++) ctx.fillRect(gx - 15 + k * 5.4, gy - 9, 2.6, 18); }
  ctx.lineCap = 'round';
  for (const pts of [[860, 300, 960, 300], [860, 690, 1180, 690, 1180, 760, 1440, 760, 1440, 560], [1320, 260, 1440, 260], [2760, 300, 2840, 300], [2760, 560, 2840, 640]]){
    if (!ilHit({ x: Math.min(pts[0], pts[pts.length - 2]) - 10, y: Math.min(pts[1], pts[pts.length - 1]) - 10, w: Math.abs(pts[pts.length - 2] - pts[0]) + 20, h: Math.abs(pts[pts.length - 1] - pts[1]) + 400 }, x0, y0, x1, y1, 40)) continue;
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(pts[0] + 4, pts[1] + 6); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] + 4, pts[i + 1] + 6); ctx.stroke();
    ctx.strokeStyle = '#5E8A84'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke();
    ctx.strokeStyle = '#8ABAB2'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3A5A56'; for (let i = 0; i < pts.length; i += 2) { ctx.beginPath(); ctx.arc(pts[i], pts[i + 1], 9, 0, TAU); ctx.fill(); }
  }
  ctx.lineCap = 'butt';
  if (ilOn(x0, y0, x1, y1, 3480, 360, 320)){
    ctx.fillStyle = '#6A7072'; ctx.beginPath(); ctx.arc(3480, 360, 230, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(244,244,236,.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(3480, 360, 200, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(244,244,236,.6)'; ctx.font = '800 150px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', 3480, 412);
    for (let i = 0; i < 12; i++){ const a = i * TAU / 12, on = ((t * 2 + i * 0.5) % 2) < 1; ctx.fillStyle = on ? '#7AF0E0' : '#2A4A48'; ctx.beginPath(); ctx.arc(3480 + Math.cos(a) * 222, 360 + Math.sin(a) * 222, 5, 0, TAU); ctx.fill(); }
  }
}
/* the tank room: the tiled floor under a hand of water, glass and lab junk on the bottom, light from the broken tanks */
function ilBasin(ctx, t){
  const B = ISLE_BASIN;
  ctx.fillStyle = '#7E9A9C'; ctx.fillRect(B.x, B.y, B.w, B.h);
  ctx.strokeStyle = 'rgba(40,60,64,.45)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = B.x; x <= B.x + B.w; x += 60){ ctx.moveTo(x, B.y); ctx.lineTo(x, B.y + B.h); } for (let y = B.y; y <= B.y + B.h; y += 60){ ctx.moveTo(B.x, y); ctx.lineTo(B.x + B.w, y); } ctx.stroke();
  ctx.fillStyle = 'rgba(60,170,170,.55)'; ctx.fillRect(B.x, B.y, B.w, B.h);
  ctx.fillStyle = 'rgba(180,255,200,.08)'; ctx.beginPath(); ctx.ellipse(B.x + B.w / 2, B.y + B.h / 2, 260, 150, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(250,255,250,.18)'; ctx.lineWidth = 2;
  for (let k = 0; k < 8; k++){ ctx.beginPath(); const yy = B.y + 30 + k * 58; for (let x = B.x + 10; x <= B.x + B.w - 10; x += 16) ctx.lineTo(x, yy + Math.sin(x / 22 + t * 1.4 + k) * 4); ctx.stroke(); }
  for (let i = 0; i < 14; i++){ const gx = B.x + 80 + csR(i * 17 + 4) * (B.w - 160), gy = B.y + 60 + csR(i * 29 + 9) * (B.h - 120); ctx.fillStyle = 'rgba(210,250,250,.55)'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 10, gy + 3); ctx.lineTo(gx + 4, gy + 9); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(30,40,44,.6)'; ctx.fillRect(B.x + 520, B.y + 300, 70, 18); ctx.fillStyle = 'rgba(210,90,60,.6)'; ctx.fillRect(B.x + 540, B.y + 304, 20, 10);
  ctx.strokeStyle = 'rgba(30,40,44,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(B.x + 300, B.y + 380); ctx.quadraticCurveTo(B.x + 360, B.y + 340, B.x + 430, B.y + 390); ctx.stroke();
  /* the grates that Specimen Zero's arms come up through */
  for (const [gx, gy] of [[B.x + 360, B.y + 160], [B.x + 840, B.y + 160], [B.x + 360, B.y + 340], [B.x + 840, B.y + 340], [B.x + 600, B.y + 250]]){
    ctx.fillStyle = '#2E3A3C'; ctx.fillRect(gx - 34, gy - 24, 68, 48); ctx.fillStyle = '#0E1416'; for (let k = 0; k < 7; k++) ctx.fillRect(gx - 30 + k * 9.4, gy - 20, 4.6, 40); ctx.strokeStyle = '#6A7A7C'; ctx.lineWidth = 2; ctx.strokeRect(gx - 34, gy - 24, 68, 48);
  }
}
/* shells, starfish, footprints, seaweed and birds' tracks on the sand, glass and rope on the shore */
function ilDecor(ctx, x0, y0, x1, y1, t){
  const gx0 = Math.floor(x0 / 160) * 160, gy0 = Math.floor(y0 / 160) * 160;
  for (let gx = gx0; gx < x1 + 160; gx += 160) for (let gy = gy0; gy < y1 + 160; gy += 160){
    if (gy < 960 || gx < 200 || gx > 3980 || gy > 2990) continue;
    const r = csR(gx * 3 + gy * 7 + 1), r2 = csR(gx * 5 + gy * 3 + 2), px = gx + 20 + r * 120, py = gy + 20 + r2 * 120;
    if (isleWet(px, py)) continue;
    if (r < 0.22){                                                                                            /* a scallop shell */
      ctx.save(); ctx.translate(px, py); ctx.rotate(r2 * 6); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(2, 3, 9, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = r2 > 0.5 ? '#F4D8C8' : '#F2E6D0'; ctx.beginPath(); ctx.moveTo(0, 6); ctx.arc(0, 0, 9, Math.PI * 0.85, Math.PI * 2.15); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,110,90,.6)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = -3; k <= 3; k++){ ctx.moveTo(0, 6); ctx.lineTo(Math.sin(k * 0.4) * 9, -Math.cos(k * 0.4) * 8); } ctx.stroke(); ctx.restore();
    } else if (r < 0.34){                                                                                     /* a starfish */
      ctx.save(); ctx.translate(px, py); ctx.rotate(r2 * 5); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(2, 3, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = '#E8823A'; ctx.beginPath(); for (let k = 0; k < 10; k++){ const a = k * TAU / 10, rr = k % 2 ? 4.5 : 13; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F8B878'; for (let k = 0; k < 5; k++){ const a = k * TAU / 5; for (let q = 1; q < 3; q++){ ctx.beginPath(); ctx.arc(Math.cos(a) * q * 4, Math.sin(a) * q * 4, 1.2, 0, TAU); ctx.fill(); } } ctx.restore();
    } else if (r < 0.46 && gy > 2500){                                                                        /* a line of seaweed washed up */
      ctx.strokeStyle = '#4A6A3A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px - 30, py); for (let k = 0; k <= 6; k++) ctx.lineTo(px - 30 + k * 10, py + Math.sin(k * 1.3 + r2 * 5) * 5); ctx.stroke();
      ctx.fillStyle = '#5E7E44'; for (let k = 1; k < 6; k++){ ctx.beginPath(); ctx.ellipse(px - 30 + k * 10, py + Math.sin(k * 1.3 + r2 * 5) * 5 - 4, 4, 2, 0.6, 0, TAU); ctx.fill(); } ctx.lineCap = 'butt';
    } else if (r < 0.58){                                                                                     /* a gull's footprints */
      ctx.strokeStyle = 'rgba(150,126,80,.6)'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let k = 0; k < 5; k++){ const fx = px + k * 14 - 28, fy = py + (k % 2 ? 5 : -5); ctx.moveTo(fx, fy); ctx.lineTo(fx + 5, fy - 3); ctx.moveTo(fx, fy); ctx.lineTo(fx + 6, fy); ctx.moveTo(fx, fy); ctx.lineTo(fx + 5, fy + 3); ctx.moveTo(fx, fy); ctx.lineTo(fx - 3, fy); }
      ctx.stroke();
    } else if (r < 0.66){                                                                                     /* pebbles */
      for (let k = 0; k < 5; k++){ const qx = px + csR(gx + k) * 30 - 15, qy = py + csR(gy + k * 3) * 20 - 10; ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(qx + 1.5, qy + 2, 5 - k * 0.5, 3.6 - k * 0.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = ['#A8A090', '#C8BCA8', '#8A8478', '#B8AC98', '#9A9286'][k]; ctx.beginPath(); ctx.ellipse(qx, qy, 5 - k * 0.5, 3.6 - k * 0.3, k, 0, TAU); ctx.fill(); }
    } else if (r < 0.7 && gy < 1450){                                                                         /* a crab hole in the mud */
      ctx.fillStyle = '#5A4A2E'; ctx.beginPath(); ctx.ellipse(px, py, 6, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(110,94,60,.8)'; for (let k = 0; k < 6; k++){ const a = k * TAU / 6; ctx.beginPath(); ctx.arc(px + Math.cos(a) * 11, py + Math.sin(a) * 8, 2, 0, TAU); ctx.fill(); }
    }
  }
  /* the boat's mooring line and anchor chain, and a drag mark up the beach */
  if (ilOn(x0, y0, x1, y1, 2130, 2840, 260)){
    ctx.strokeStyle = 'rgba(150,126,80,.5)'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(2130, 2860); ctx.quadraticCurveTo(2140, 2800, 2120, 2760); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(2250, 2900); ctx.quadraticCurveTo(2320, 2830, 2360, 2790); ctx.stroke();
    ctx.fillStyle = '#6A5A44'; ctx.fillRect(2354, 2770, 14, 26); ctx.fillStyle = '#8A7A5E'; ctx.fillRect(2354, 2770, 14, 5);
  }
}

/* ---------------------------------------------------------------- the props */
function ilShadow(ctx, b, r){ ctx.fillStyle = 'rgba(10,30,40,.3)'; if (r){ ctx.beginPath(); ctx.ellipse(b.x + b.w / 2 + 10, b.y + b.h / 2 + 14, b.w / 2, b.h / 2, 0, 0, TAU); ctx.fill(); } else ctx.fillRect(b.x + 10, b.y + 14, b.w, b.h); }
function ilBlob(ctx, cx, cy, rx, ry, n, seed, c){
  ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i <= n; i++){ const a = i * TAU / n, k = 0.82 + 0.18 * csR(seed + (i % n) * 7); const px = cx + Math.cos(a) * rx * k, py = cy + Math.sin(a) * ry * k; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fill();
}
function ilDrawProp(ctx, b, t){
  const k = b.kind, x = b.x, y = b.y, w = b.w, h = b.h, cx = x + w / 2, cy = y + h / 2, sd = Math.round(x * 3 + y);
  if (k === 'rock'){
    ilShadow(ctx, b, 1);
    if (isleWet(cx, cy + h * 0.6) || isleWet(cx, cy - h * 0.6)){ ctx.strokeStyle = 'rgba(240,252,250,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.56 + Math.sin(t * 2 + sd) * 2, h * 0.56 + Math.sin(t * 2 + sd) * 2, 0, 0, TAU); ctx.stroke(); }
    ilBlob(ctx, cx, cy, w / 2, h / 2, 11, sd, '#5E6466'); ilBlob(ctx, cx - w * 0.06, cy - h * 0.08, w * 0.42, h * 0.4, 10, sd + 3, '#7E8486'); ilBlob(ctx, cx - w * 0.14, cy - h * 0.18, w * 0.22, h * 0.18, 8, sd + 5, '#9EA4A6');
    ctx.strokeStyle = 'rgba(30,34,36,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - w * 0.2, cy - h * 0.1); ctx.lineTo(cx, cy + h * 0.05); ctx.lineTo(cx + w * 0.18, cy - h * 0.02); ctx.moveTo(cx, cy + h * 0.05); ctx.lineTo(cx + w * 0.04, cy + h * 0.3); ctx.stroke();
    for (let i = 0; i < 9; i++){ const a = csR(sd + i) * TAU, rr = 0.6 + csR(sd + i + 20) * 0.3, bx = cx + Math.cos(a) * w * 0.4 * rr, by = cy + Math.sin(a) * h * 0.4 * rr; ctx.fillStyle = '#D8D0BC'; ctx.beginPath(); ctx.arc(bx, by, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A6458'; ctx.beginPath(); ctx.arc(bx, by, 1.3, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#2A2A3A'; for (let i = 0; i < 5; i++){ const a = csR(sd + i * 3 + 9) * TAU; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * w * 0.3, cy + Math.sin(a) * h * 0.3 + h * 0.15, 4, 2.6, a, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(60,120,70,.6)'; ctx.beginPath(); ctx.ellipse(cx + w * 0.2, cy + h * 0.32, w * 0.16, h * 0.08, 0.3, 0, TAU); ctx.fill();
  } else if (k === 'coral'){
    ilShadow(ctx, b, 1);
    ctx.strokeStyle = 'rgba(240,252,250,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.58, h * 0.58, 0, 0, TAU); ctx.stroke();
    ilBlob(ctx, cx, cy, w / 2, h / 2, 12, sd, '#C88A6A');
    for (let i = 0; i < 7; i++){                                                                              /* brain coral, fans and branches, each rooted on the mound */
      const a = i * TAU / 7 + csR(sd + i) * 0.5, rr = 0.42, px = cx + Math.cos(a) * w * rr, py = cy + Math.sin(a) * h * rr, kind2 = (i + sd) % 3;
      if (kind2 === 0){ ctx.fillStyle = '#E8A0B0'; ctx.beginPath(); ctx.arc(px, py, 14, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B86A80'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let q = 0; q < 4; q++){ ctx.moveTo(px - 10, py - 6 + q * 4); for (let s = 0; s <= 5; s++) ctx.lineTo(px - 10 + s * 4, py - 6 + q * 4 + (s % 2 ? 2 : -2)); } ctx.stroke(); }
      else if (kind2 === 1){ ctx.strokeStyle = '#F06A5A'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); const ox = Math.cos(a), oy = Math.sin(a); ctx.moveTo(px - ox * 10, py - oy * 10); ctx.lineTo(px + ox * 10, py + oy * 10); ctx.moveTo(px, py); ctx.lineTo(px + ox * 6 - oy * 9, py + oy * 6 + ox * 9); ctx.moveTo(px + ox * 4, py + oy * 4); ctx.lineTo(px + ox * 8 + oy * 9, py + oy * 8 - ox * 9); ctx.stroke(); ctx.lineCap = 'butt'; fillCircle(ctx, px + ox * 10, py + oy * 10, 3, '#FFB0A0'); }
      else { ctx.fillStyle = '#9A6AC8'; ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, 16, a - 0.7, a + 0.7); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#C8A0F0'; ctx.lineWidth = 1; ctx.beginPath(); for (let q = -2; q <= 2; q++){ ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a + q * 0.3) * 15, py + Math.sin(a + q * 0.3) * 15); } ctx.stroke(); }
    }
    ilBlob(ctx, cx - 4, cy - 4, w * 0.28, h * 0.26, 9, sd + 8, '#E0A884'); ctx.fillStyle = '#F4C8A8'; for (let i = 0; i < 12; i++){ ctx.beginPath(); ctx.arc(cx - 4 + (csR(sd + i * 5) - 0.5) * w * 0.4, cy - 4 + (csR(sd + i * 9) - 0.5) * h * 0.36, 2, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 3; i++){ const fx = cx + Math.sin(t * 0.9 + i * 2 + sd) * w * 0.5, fy = cy + h * 0.55 + Math.cos(t * 0.7 + i) * 8; ctx.fillStyle = ['#F0D04A', '#4AC8F0', '#F08AC8'][i]; ctx.beginPath(); ctx.ellipse(fx, fy, 5, 2.6, Math.cos(t * 0.9 + i * 2 + sd) > 0 ? 0 : Math.PI, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(fx - 4 * Math.sign(Math.cos(t * 0.9 + i * 2 + sd) || 1), fy); ctx.lineTo(fx - 8 * Math.sign(Math.cos(t * 0.9 + i * 2 + sd) || 1), fy - 3); ctx.lineTo(fx - 8 * Math.sign(Math.cos(t * 0.9 + i * 2 + sd) || 1), fy + 3); ctx.fill(); }
  } else if (k === 'mangrove'){
    ilShadow(ctx, b, 1);
    ctx.strokeStyle = '#5A4430'; ctx.lineWidth = 6; ctx.lineCap = 'round';                                  /* the prop roots, arching out into the mud from the trunks */
    for (let i = 0; i < 14; i++){ const a = i * TAU / 14, rx = w * 0.5, ry = h * 0.5; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rx * 0.3, cy + Math.sin(a) * ry * 0.3); ctx.quadraticCurveTo(cx + Math.cos(a + 0.2) * rx * 0.85, cy + Math.sin(a + 0.2) * ry * 0.85 - 10, cx + Math.cos(a) * rx * 1.02, cy + Math.sin(a) * ry * 1.02); ctx.stroke(); }
    ctx.lineCap = 'butt';
    ilBlob(ctx, cx, cy - 6, w * 0.46, h * 0.44, 14, sd, '#2E5A2A'); ilBlob(ctx, cx - w * 0.08, cy - 12, w * 0.36, h * 0.34, 12, sd + 2, '#3E7A36'); ilBlob(ctx, cx - w * 0.14, cy - 18, w * 0.2, h * 0.18, 10, sd + 4, '#5A9A48');
    for (let i = 0; i < 26; i++){ const px = cx + (csR(sd + i) - 0.5) * w * 0.8, py = cy - 6 + (csR(sd + i + 50) - 0.5) * h * 0.76; ctx.fillStyle = i % 3 ? '#4E8A40' : '#7AB85A'; ctx.beginPath(); ctx.ellipse(px, py, 6, 3, csR(sd + i + 90) * 3, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 2; i++){ ctx.fillStyle = '#F2EEDC'; const bx = cx + (i ? 30 : -24), by = cy + (i ? -20 : 10); ctx.beginPath(); ctx.ellipse(bx, by, 6, 4, 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8B84A'; ctx.beginPath(); ctx.moveTo(bx + 5, by - 1); ctx.lineTo(bx + 10, by); ctx.lineTo(bx + 5, by + 1.5); ctx.fill(); }
  } else if (k === 'palm'){
    ctx.fillStyle = 'rgba(10,30,40,.22)'; ctx.beginPath(); ctx.ellipse(cx + 26, cy + 30, 96, 80, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8A6A44'; ctx.beginPath(); ctx.arc(cx, cy, w / 2, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6A4E30'; ctx.lineWidth = 2; for (let q = 1; q < 4; q++){ ctx.beginPath(); ctx.arc(cx, cy, w / 2 * q / 4, 0, TAU); ctx.stroke(); }
    const sway = Math.sin(t * 0.8 + sd) * 0.06;
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 9; i++){                                      /* the fronds, each from the crown at the top of the trunk: a midrib, and leaflets down both sides that droop back */
      const a = i * TAU / 9 + sway + csR(sd + i) * 0.3 + layer * 0.35, L = (layer ? 78 : 100) + csR(sd + i + 7) * 18, bend = (csR(sd + i + 3) - 0.5) * 0.5;
      const mx = cx + Math.cos(a + bend * 0.5) * L * 0.5, my = cy + Math.sin(a + bend * 0.5) * L * 0.5, ex = cx + Math.cos(a + bend) * L, ey = cy + Math.sin(a + bend) * L;
      const leaf = layer ? (i % 2 ? '#4E9A40' : '#5AA84A') : (i % 2 ? '#2E6A2A' : '#3A7A32');
      for (let q = 1; q <= 12; q++){
        const u = q / 13, px = (1 - u) * (1 - u) * cx + 2 * u * (1 - u) * mx + u * u * ex, py = (1 - u) * (1 - u) * cy + 2 * u * (1 - u) * my + u * u * ey;
        const ta = Math.atan2(2 * (1 - u) * (my - cy) + 2 * u * (ey - my), 2 * (1 - u) * (mx - cx) + 2 * u * (ex - mx)), ll = 30 * Math.sin(Math.PI * (0.15 + u * 0.8)) + 4;
        for (const sg of [-1, 1]){ const la = ta + sg * 1.1, tipx = px + Math.cos(la) * ll + Math.cos(ta) * ll * 0.45, tipy = py + Math.sin(la) * ll + Math.sin(ta) * ll * 0.45;
          ctx.fillStyle = leaf; ctx.beginPath(); ctx.moveTo(px - Math.cos(ta) * 4, py - Math.sin(ta) * 4); ctx.quadraticCurveTo(px + Math.cos(la) * ll * 0.6, py + Math.sin(la) * ll * 0.6, tipx, tipy); ctx.quadraticCurveTo(px + Math.cos(la) * ll * 0.5 + Math.cos(ta) * 6, py + Math.sin(la) * ll * 0.5 + Math.sin(ta) * 6, px + Math.cos(ta) * 5, py + Math.sin(ta) * 5); ctx.closePath(); ctx.fill(); }
      }
      ctx.strokeStyle = layer ? '#7AB85A' : '#5A8A3A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
    }
    for (let i = 0; i < 4; i++){ const a = i * TAU / 4 + 0.4; fillCircle(ctx, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, 8, '#5A3A1E'); fillCircle(ctx, cx + Math.cos(a) * 10 - 2, cy + Math.sin(a) * 10 - 2, 3, '#8A6A44'); }
    fillCircle(ctx, cx, cy, 9, '#6A8A3A');
  } else if (k === 'log'){
    ilShadow(ctx, b, 0);
    tw_rr(ctx, x, y, w, h, h / 2, '#8A7A64'); tw_rr(ctx, x + 4, y + 4, w - 8, h * 0.4, h * 0.2, '#A8987E');
    ctx.strokeStyle = 'rgba(60,50,38,.5)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++){ ctx.beginPath(); ctx.moveTo(x + w * i / 6, y + 4); ctx.quadraticCurveTo(x + w * i / 6 + 8, y + h / 2, x + w * i / 6, y + h - 4); ctx.stroke(); }
    ctx.fillStyle = '#B8A88E'; ctx.beginPath(); ctx.ellipse(x + w - 4, y + h / 2, 6, h / 2 - 2, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7A6A54'; ctx.lineWidth = 1; for (let q = 1; q < 4; q++){ ctx.beginPath(); ctx.ellipse(x + w - 4, y + h / 2, 6 * q / 4, (h / 2 - 2) * q / 4, 0, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = '#7A6A54'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + 4); ctx.lineTo(x + w * 0.24, y - 18); ctx.moveTo(x + w * 0.62, y + h - 4); ctx.lineTo(x + w * 0.7, y + h + 14); ctx.stroke(); ctx.lineCap = 'butt';
  } else if (k === 'crate'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#7A5E3C'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9A7A50'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.strokeStyle = '#6A4E30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.moveTo(x + w - 4, y + 4); ctx.lineTo(x + 4, y + h - 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,40,20,.4)'; ctx.lineWidth = 1; for (let i = 1; i < 4; i++){ ctx.beginPath(); ctx.moveTo(x + 4, y + h * i / 4); ctx.lineTo(x + w - 4, y + h * i / 4); ctx.stroke(); }
    ctx.fillStyle = '#3A8A7A'; ctx.fillRect(x + w * 0.3, y + h * 0.38, w * 0.4, h * 0.24); ctx.fillStyle = '#E8F0E8'; ctx.fillRect(x + w * 0.34, y + h * 0.44, w * 0.32, h * 0.04); ctx.fillRect(x + w * 0.34, y + h * 0.52, w * 0.2, h * 0.04);
  } else if (k === 'boat'){
    ilShadow(ctx, b, 1);
    ctx.strokeStyle = 'rgba(240,252,250,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.54 + Math.sin(t * 2) * 3, h * 0.6 + Math.sin(t * 2) * 3, 0, 0, TAU); ctx.stroke();
    const bob = Math.sin(t * 1.6) * 1.5;
    ctx.save(); ctx.translate(cx, cy + bob);
    ctx.fillStyle = '#2E4A6A'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + 8); ctx.lineTo(w * 0.28, -h / 2); ctx.quadraticCurveTo(w / 2 + 14, 0, w * 0.28, h / 2); ctx.lineTo(-w / 2, h / 2 - 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E8E4D8'; ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h / 2 + 13); ctx.lineTo(w * 0.27, -h / 2 + 6); ctx.quadraticCurveTo(w / 2 + 2, 0, w * 0.27, h / 2 - 6); ctx.lineTo(-w / 2 + 6, h / 2 - 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A88A5E'; ctx.beginPath(); ctx.moveTo(-w / 2 + 12, -h / 2 + 18); ctx.lineTo(w * 0.25, -h / 2 + 12); ctx.quadraticCurveTo(w / 2 - 10, 0, w * 0.25, h / 2 - 12); ctx.lineTo(-w / 2 + 12, h / 2 - 18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,36,.5)'; ctx.lineWidth = 1.4; for (let i = -2; i <= 2; i++){ ctx.beginPath(); ctx.moveTo(-w / 2 + 12, i * 12); ctx.lineTo(w * 0.3, i * 10); ctx.stroke(); }
    ctx.fillStyle = '#F2EEDC'; ctx.fillRect(-w * 0.18, -h * 0.28, w * 0.24, h * 0.56); ctx.fillStyle = '#8AC8E8'; ctx.fillRect(w * 0.02, -h * 0.22, w * 0.03, h * 0.44); ctx.fillStyle = '#C8402A'; ctx.fillRect(-w * 0.18, -h * 0.28, w * 0.24, 6);
    fillCircle(ctx, -w * 0.32, 0, 6, '#5A4A34'); ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * 0.32, 0); ctx.lineTo(-w * 0.44, -h * 0.34); ctx.stroke();
    tw_rr(ctx, -w / 2 - 22, -12, 26, 24, 4, '#3A3A40'); ctx.fillStyle = '#5A5A62'; ctx.fillRect(-w / 2 - 18, -8, 18, 16); ctx.fillStyle = '#E8C84A'; ctx.fillRect(-w / 2 - 14, -3, 10, 6);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++){ fillCircle(ctx, -w * 0.3 + i * w * 0.22, s * (h / 2 - 4), 5, '#F2EEDC'); fillCircle(ctx, -w * 0.3 + i * w * 0.22, s * (h / 2 - 4), 2, '#C8402A'); }
    ctx.restore();
  } else if (k === 'tankhouse'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#4A5E60'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(160,230,230,.55)'; ctx.fillRect(x + 6, y + 6, w - 12, h - 44);
    ctx.strokeStyle = '#3A4A4C'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 1; i < 6; i++){ ctx.moveTo(x + w * i / 6, y + 6); ctx.lineTo(x + w * i / 6, y + h - 38); } ctx.moveTo(x + 6, y + (h - 38) / 2); ctx.lineTo(x + w - 6, y + (h - 38) / 2); ctx.stroke();
    for (let i = 0; i < 3; i++){                                                                              /* the tanks seen through the glass roof, each with something curled up in it */
      const tx = x + w * (0.2 + i * 0.3), ty = y + (h - 38) * 0.5, gl = 0.5 + 0.3 * Math.sin(t * 1.8 + i + sd);
      fillCircle(ctx, tx, ty, 46, '#1E3436'); fillCircle(ctx, tx, ty, 40, 'rgba(90,220,180,' + (0.4 + 0.2 * gl).toFixed(2) + ')');
      ctx.fillStyle = 'rgba(30,60,50,.75)'; ctx.beginPath(); ctx.ellipse(tx + 2, ty + 2, 18 + i * 3, 12, i * 1.2 + Math.sin(t * 0.6 + i) * 0.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(30,60,50,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx + 14, ty + 4); ctx.quadraticCurveTo(tx + 24, ty + 16, tx + 18, ty + 26); ctx.stroke();
      fillCircle(ctx, tx - 12, ty - 14, 8, 'rgba(255,255,255,.3)'); ctx.strokeStyle = '#8ABAB2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, ty, 46, 0, TAU); ctx.stroke();
      for (let q = 0; q < 3; q++){ const by = ty + 30 - ((t * 30 + q * 20 + i * 7) % 60); fillCircle(ctx, tx - 10 + q * 10, by, 2, 'rgba(230,255,250,.7)'); }
    }
    ctx.fillStyle = '#3A4A4C'; ctx.fillRect(x, y + h - 38, w, 38); ctx.fillStyle = '#5A6E70'; ctx.fillRect(x, y + h - 38, w, 6);
    ctx.fillStyle = '#1A2224'; ctx.fillRect(x + w / 2 - 40, y + h - 32, 80, 32); ctx.fillStyle = '#E8C84A'; ftHazard(ctx, x + w / 2 - 40, y + h - 38, 80, 6);
    ctx.fillStyle = '#C8F0E0'; ctx.font = '800 14px ui-sans-serif, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('SPECIMENS', x + 14, y + h - 14);
    ctx.fillStyle = Math.sin(t * 3 + sd) > 0 ? '#7AF0B0' : '#1E4A3A'; ctx.beginPath(); ctx.arc(x + w - 20, y + h - 19, 5, 0, TAU); ctx.fill();
  } else if (k === 'pump'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#5A6062'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7A8284'; ctx.fillRect(x + 6, y + 6, w - 12, h - 40); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + 6, y + 6, w - 12, 18);
    for (let i = 0; i < 2; i++){ const px = x + w * (0.3 + i * 0.4), py = y + (h - 40) / 2 + 3; fillCircle(ctx, px, py, 40, '#3A4244'); fillCircle(ctx, px, py, 34, '#5E8A84'); ctx.save(); ctx.translate(px, py); ctx.rotate(t * 4 * (i ? -1 : 1)); ctx.fillStyle = '#3A4244'; for (let q = 0; q < 5; q++){ ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(16, 0, 14, 6, 0.4, 0, TAU); ctx.fill(); } ctx.restore(); fillCircle(ctx, px, py, 8, '#C8D0D2'); }
    ctx.strokeStyle = '#3A5A56'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + 20); ctx.lineTo(x + w * 0.3, y - 14); ctx.lineTo(x + w * 0.7, y - 14); ctx.lineTo(x + w * 0.7, y + 20); ctx.stroke(); ctx.strokeStyle = '#8ABAB2'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3A4244'; ctx.fillRect(x, y + h - 34, w, 34); ctx.fillStyle = '#1A2224'; ctx.fillRect(x + 30, y + h - 28, 60, 28); ctx.fillStyle = '#9AD8F0'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 130 + i * 70, y + h - 26, 40, 14);
  } else if (k === 'pool'){
    ctx.fillStyle = 'rgba(10,30,40,.3)'; ctx.fillRect(x + 8, y + 10, w, h);
    ctx.fillStyle = '#9AA2A4'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#1A4E5E'; ctx.fillRect(x + 14, y + 14, w - 28, h - 28); ctx.fillStyle = 'rgba(70,200,190,.35)'; ctx.fillRect(x + 14, y + 14, w - 28, (h - 28) * 0.35);
    ctx.strokeStyle = 'rgba(200,250,250,.25)'; ctx.lineWidth = 2; for (let k2 = 0; k2 < 4; k2++){ ctx.beginPath(); const yy = y + 34 + k2 * (h - 60) / 4; for (let xx = x + 20; xx < x + w - 20; xx += 14) ctx.lineTo(xx, yy + Math.sin(xx / 20 + t * 1.6 + k2) * 3); ctx.stroke(); }
    const fx = x + w / 2 + Math.cos(t * 0.6 + sd) * (w * 0.3), fy = y + h / 2 + Math.sin(t * 0.9 + sd) * (h * 0.25); ctx.fillStyle = 'rgba(10,20,26,.6)'; ctx.beginPath(); ctx.ellipse(fx, fy, 30, 10, Math.atan2(Math.cos(t * 0.9 + sd) * 0.9 * h * 0.25, -Math.sin(t * 0.6 + sd) * 0.6 * w * 0.3), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#C8CED0'; ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6); ctx.fillStyle = '#5A6264'; for (let i = 0; i < w; i += 40) ctx.fillRect(x + i, y - 2, 4, 6);
    ctx.strokeStyle = '#C8CED0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w - 40, y + 14); ctx.lineTo(x + w - 40, y + 40); ctx.moveTo(x + w - 26, y + 14); ctx.lineTo(x + w - 26, y + 40); for (let i = 0; i < 3; i++){ ctx.moveTo(x + w - 40, y + 20 + i * 8); ctx.lineTo(x + w - 26, y + 20 + i * 8); } ctx.stroke();
  } else if (k === 'lab'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#5A6466'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#C8CED0'; ctx.fillRect(x + 6, y + 6, w - 12, h - 46); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + 6, y + 6, w - 12, 24);
    ctx.strokeStyle = 'rgba(60,70,72,.4)'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++){ ctx.beginPath(); ctx.moveTo(x + 6, y + 6 + (h - 52) * i / 6); ctx.lineTo(x + w - 6, y + 6 + (h - 52) * i / 6); ctx.stroke(); }
    for (const [ux, uy] of [[x + 60, y + 60], [x + 150, y + 90], [x + w - 80, y + 70]]){ ctx.fillStyle = '#8A9294'; ctx.fillRect(ux - 22, uy - 16, 44, 32); ctx.fillStyle = '#3A4244'; ctx.beginPath(); ctx.arc(ux, uy, 11, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(ux, uy); ctx.rotate(t * 6); ctx.fillStyle = '#8A9294'; ctx.fillRect(-10, -2, 20, 4); ctx.restore(); }
    ctx.fillStyle = '#2A3A3C'; ctx.fillRect(x + w - 150, y + 120, 110, 90); ctx.fillStyle = '#7AF0E0'; ctx.font = '800 54px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', x + w - 95, y + 182);
    ctx.fillStyle = '#3A4244'; ctx.fillRect(x, y + h - 40, w, 40); ctx.fillStyle = '#5A6466'; ctx.fillRect(x, y + h - 40, w, 6);
    for (let i = 0; i < 6; i++){ ctx.fillStyle = (i + Math.floor(t)) % 5 ? '#B8F0E8' : '#3A5A56'; ctx.fillRect(x + 20 + i * (w - 40) / 6, y + h - 32, (w - 40) / 6 - 14, 20); }
    ctx.fillStyle = '#1A2224'; ctx.fillRect(x + w * 0.42, y + h - 34, 60, 34); ctx.strokeStyle = '#C8CED0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w - 30, y + 30); ctx.lineTo(x + w - 30, y - 40); ctx.moveTo(x + w - 50, y - 20); ctx.lineTo(x + w - 10, y - 20); ctx.stroke(); fillCircle(ctx, x + w - 30, y - 40, 5, Math.sin(t * 4) > 0 ? '#FF5A4A' : '#5A2A22');
  } else if (k === 'gen'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#3A4244'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#4AA89A'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + 4, y + 4, w - 8, 8);
    fillCircle(ctx, x + w * 0.3, y + h / 2, 26, '#2A3234'); ctx.save(); ctx.translate(x + w * 0.3, y + h / 2); ctx.rotate(t * 8); ctx.fillStyle = '#8A9294'; for (let q = 0; q < 5; q++){ ctx.rotate(TAU / 5); ctx.fillRect(3, -3.5, 19, 7); } ctx.restore(); fillCircle(ctx, x + w * 0.3, y + h / 2, 5, '#C8D0D2');
    ctx.fillStyle = '#2A3234'; ctx.fillRect(x + w * 0.62, y + 14, w * 0.28, h - 28); ctx.fillStyle = '#7AF0B0'; ctx.beginPath(); ctx.arc(x + w * 0.76, y + 30, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8C84A'; ctx.fillRect(x + w * 0.66, y + h - 40, w * 0.2, 6);
    ctx.strokeStyle = '#1A2224'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + h * 0.7); ctx.quadraticCurveTo(x - 40, y + h, x - 80, y + h * 0.8); ctx.stroke();
  } else if (k === 'heli'){
    ctx.fillStyle = 'rgba(10,20,26,.32)'; ctx.beginPath(); ctx.ellipse(cx + 12, cy + 16, w * 0.42, h * 0.36, 0, 0, TAU); ctx.fill();
    for (const s of [-1, 1]){ ctx.fillStyle = '#2A2E34'; ctx.fillRect(x + w * 0.16, cy + s * h * 0.42 - 3, w * 0.5, 6); ctx.fillRect(x + w * 0.24, cy + s * h * 0.3 - 2, 5, h * 0.12 * s); ctx.fillRect(x + w * 0.54, cy + s * h * 0.3 - 2, 5, h * 0.12 * s); }
    ctx.fillStyle = '#E8ECEE'; ctx.beginPath(); ctx.ellipse(x + w * 0.4, cy, w * 0.3, h * 0.34, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#C8D0D4'; ctx.beginPath(); ctx.ellipse(x + w * 0.42, cy + 6, w * 0.26, h * 0.22, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#E8ECEE'; ctx.fillRect(x + w * 0.66, cy - 6, w * 0.3, 12); ctx.fillStyle = '#2A8A7A'; ctx.fillRect(x + w * 0.66, cy - 2, w * 0.3, 4); ctx.fillStyle = '#E8ECEE'; ctx.fillRect(x + w * 0.93, cy - 22, 8, 44);
    ctx.fillStyle = 'rgba(80,140,170,.85)'; ctx.beginPath(); ctx.ellipse(x + w * 0.2, cy, w * 0.11, h * 0.24, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x + w * 0.17, cy - 8, w * 0.04, h * 0.1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2A8A7A'; ctx.font = '800 16px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LAB-1', x + w * 0.46, cy + 6);
    ctx.save(); ctx.translate(x + w * 0.42, cy); ctx.rotate(0.5); ctx.strokeStyle = 'rgba(30,34,42,.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(130, 0); ctx.moveTo(0, -130); ctx.lineTo(0, 130); ctx.stroke(); ctx.restore();
    fillCircle(ctx, x + w * 0.42, cy, 9, '#5A6066'); fillCircle(ctx, x + w * 0.42, cy, 4, '#C8D0D4');
  } else if (k === 'shed'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#6A7A7C'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#8A9A9C'; ctx.fillRect(x + 4, y + 4, w - 8, h - 34); for (let i = 1; i < 8; i++){ ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x + 4 + i * (w - 8) / 8, y + 4, 3, h - 34); }
    ctx.fillStyle = '#3A4244'; ctx.fillRect(x, y + h - 30, w, 30); ctx.fillStyle = '#1A2224'; ctx.fillRect(x + 20, y + h - 26, w - 40, 26); ctx.fillStyle = '#5A6264'; for (let q = 0; q < 3; q++) ctx.fillRect(x + 22, y + h - 23 + q * 7, w - 44, 3);
    for (let i = 0; i < 3; i++){ ctx.fillStyle = '#C8402A'; ctx.beginPath(); ctx.arc(x + w + 16, y + 20 + i * 30, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8C84A'; ctx.fillRect(x + w + 12, y + 8 + i * 30, 8, 5); }
  } else if (k === 'booth'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#3A4244'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#5A6466'; ctx.fillRect(x + 4, y + 4, w - 8, h - 28);
    const gl = G.il && G.il.glimpse && G.il.glimpse.t > 0;
    ctx.fillStyle = gl ? '#8AF0E0' : 'rgba(120,200,210,.55)'; ctx.fillRect(x + 8, y + h - 24, w - 16, 18); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x + 12, y + h - 22, 30, 4);
    if (gl){ ctx.fillStyle = '#1A2224'; ctx.beginPath(); ctx.arc(cx, y + h - 15, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#F2F2EC'; ctx.fillRect(cx - 8, y + h - 10, 16, 6); csGlow(ctx, cx, y + h - 12, 60, '#7AF0E0', 0.4); }
    for (let i = 0; i < 4; i++){ ctx.fillStyle = (i + Math.floor(t * 2)) % 3 ? '#7AF0B0' : '#2A4A3A'; ctx.fillRect(x + 20 + i * 44, y + 12, 26, 14); }
  } else if (k === 'basinwall'){
    ilShadow(ctx, b, 0);
    ctx.fillStyle = '#5E6A6C'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#8A9698'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 3, y + 3, w - 6, 5);
    ctx.strokeStyle = 'rgba(40,50,52,.5)'; ctx.lineWidth = 2; const n = Math.max(w, h) / 40; ctx.beginPath(); for (let i = 1; i < n; i++){ if (w > h){ ctx.moveTo(x + i * 40, y + 3); ctx.lineTo(x + i * 40, y + h - 3); } else { ctx.moveTo(x + 3, y + i * 40); ctx.lineTo(x + w - 3, y + i * 40); } } ctx.stroke();
    ctx.fillStyle = 'rgba(20,30,32,.55)'; for (let i = 0; i < 4; i++){ const px = x + 6 + csR(sd + i) * (w - 12), py = y + 6 + csR(sd + i + 9) * (h - 12); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 6, py + 3); ctx.lineTo(px + 2, py + 8); ctx.closePath(); ctx.fill(); }
  } else if (k === 'tank'){
    ctx.fillStyle = 'rgba(10,30,40,.3)'; ctx.beginPath(); ctx.arc(cx + 8, cy + 10, w / 2, 0, TAU); ctx.fill();
    fillCircle(ctx, cx, cy, w / 2, '#3A4A4C'); fillCircle(ctx, cx, cy, w / 2 - 7, '#123A3A'); fillCircle(ctx, cx, cy, w / 2 - 12, 'rgba(90,230,190,' + (0.25 + 0.1 * Math.sin(t * 2 + sd)).toFixed(2) + ')');
    ctx.fillStyle = 'rgba(200,250,250,.8)'; ctx.beginPath();                                                 /* the glass broken out of one side, the shards still standing in the rim */
    for (let i = 0; i < 9; i++){ const a = -0.6 + i * 0.16, r1 = w / 2 - 7, r2 = r1 - 6 - csR(sd + i) * 14; ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a + 0.08) * r2, cy + Math.sin(a + 0.08) * r2); ctx.lineTo(cx + Math.cos(a + 0.16) * r1, cy + Math.sin(a + 0.16) * r1); }
    ctx.fill(); ctx.strokeStyle = '#8ABAB2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, w / 2 - 3, 0.8, TAU - 0.7); ctx.stroke();
    for (let i = 0; i < 4; i++){ const a = i * TAU / 4 + 0.4; fillCircle(ctx, cx + Math.cos(a) * (w / 2 - 3), cy + Math.sin(a) * (w / 2 - 3), 4, '#C8D0D2'); }
    ctx.strokeStyle = '#2A3234'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - w / 2 + 4, cy); ctx.quadraticCurveTo(cx - w / 2 - 20, cy + 20, cx - w / 2 - 6, cy + 46); ctx.stroke();
  } else if (k === 'fence'){
    ctx.fillStyle = 'rgba(10,20,26,.25)'; ctx.fillRect(x + 4, y + 10, w, h);
    ctx.fillStyle = '#5A6264'; for (let i = 0; i <= w; i += 60) { ctx.fillRect(x + i - 4, y - 2, 8, h + 4); fillCircle(ctx, x + i, y + h / 2, 5, '#8A9294'); }
    ctx.strokeStyle = 'rgba(200,206,210,.75)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 0; i < w; i += 10){ ctx.moveTo(x + i, y + 2); ctx.lineTo(x + i + 10, y + h - 2); ctx.moveTo(x + i + 10, y + 2); ctx.lineTo(x + i, y + h - 2); } ctx.stroke();
    ctx.strokeStyle = '#8A9294'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + w, y + 2); ctx.moveTo(x, y + h - 2); ctx.lineTo(x + w, y + h - 2); ctx.stroke();
    ctx.fillStyle = '#E8C84A'; ctx.fillRect(x + w / 2 - 22, y - 8, 44, 14); ctx.fillStyle = '#1A2224'; ctx.font = '800 9px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('KEEP OUT', x + w / 2, y + 2);
  }
}

/* what moves over the ground (drawn live over the cached ground every frame): rings in the water round everything that wades or swims, and the splashes */
function ilDrawLive(ctx, x0, y0, x1, y1, t){
  const ring = function(px, py, r, a){ ctx.strokeStyle = 'rgba(240,252,250,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.7, 0, 0, TAU); ctx.stroke(); };
  ctx.lineWidth = 2;
  const wade = function(o, r, moving){ if (!isleWet(o.x, o.y)) return; const ph = (t * 1.4 + (o.x + o.y) * 0.01) % 1; ring(o.x, o.y + r * 0.2, r * (1 + ph * 0.7), 0.5 * (1 - ph)); ring(o.x, o.y + r * 0.2, r * 1.05, 0.35); if (moving) ring(o.x, o.y + r * 0.2, r * (1 + ((ph + 0.5) % 1) * 0.7), 0.4 * (1 - (ph + 0.5) % 1)); };
  if (!P.dead && ilOn(x0, y0, x1, y1, P.x, P.y, 60)) wade(P, 22, Math.hypot(P.vx, P.vy) > 40);
  for (let i = 0; i < G.enemies.length; i++){ const e = G.enemies[i]; if (e.dead || e.def.flyOver || !ilOn(x0, y0, x1, y1, e.x, e.y, 80)) continue; wade(e, e.r, true); }
  if (typeof ilDrawEffects === 'function') ilDrawEffects(ctx, x0, y0, x1, y1, t);
  for (let i = IL.rip.length - 1; i >= 0; i--){ const r = IL.rip[i]; r.t += 1 / 60; if (r.t > 0.8){ IL.rip.splice(i, 1); continue; } if (ilOn(x0, y0, x1, y1, r.x, r.y, 40)) ring(r.x, r.y, (8 + r.t * 40) * r.s, 0.6 * (1 - r.t / 0.8)); }
}
/* the minimap (js/ui/44zzzj-minimap.js): the shallows and the tank room as teal under the props, and each prop in its own colour */
function ilMmWater(ctx, ox, oy, k){ ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k); ctx.fillStyle = 'rgba(70,184,192,.95)'; ctx.fill(ilWaterPath()); ctx.fillRect(ISLE_BASIN.x, ISLE_BASIN.y, ISLE_BASIN.w, ISLE_BASIN.h); ctx.fillStyle = 'rgba(150,158,160,.9)'; ctx.fillRect(380, 110, 3440, 790); ctx.fillStyle = 'rgba(70,184,192,.95)'; ctx.fillRect(ISLE_BASIN.x, ISLE_BASIN.y, ISLE_BASIN.w, ISLE_BASIN.h); ctx.restore(); }
const IL_MM = { sea: '#1C4E6E', seawall: '#5A6264', rock: '#7E8486', coral: '#E0907A', mangrove: '#2E6A2A', palm: '#4E9A40', log: '#8A7A64', crate: '#9A7A50', boat: '#E8E4D8', tankhouse: '#7ACAC8', pump: '#7A8284', pool: '#1A4E5E', lab: '#C8CED0', gen: '#4AA89A', heli: '#E8ECEE', shed: '#8A9A9C', booth: '#7AF0E0', basinwall: '#5E6A6C', tank: '#2A6A64', fence: '#3A4244' };
function ilMmColor(b){ return IL_MM[b.kind] || '#6A7384'; }
const isleBaseDrawGround = drawGround;
drawGround = function(ctx, cx, cy, vw, vh){
  isleBaseDrawGround.apply(this, arguments);
  if (G.biome !== 'isle') return;
  if (G.state !== 'menu') ilDrawLive(ctx, cx - vw / 2, cy - vh / 2, cx + vw / 2, cy + vh / 2, G.time);
};
