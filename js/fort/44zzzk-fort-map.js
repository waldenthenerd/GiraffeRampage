'use strict';
/* Chapter 16, Fort Shortneck: the compound as the arena (the chapter itself is in js/fort/30f-chapter-fort.js). */
/* ========================= THE FORT IN PLAY ========================= */
/* The arena is the fort, seen from above: a perimeter wall on every edge (drawn, with floodlights and razor wire), the south gate she came over, and between the wall and the
   parade ground in the middle the command bunker in the north, the hangar, radar dome and helipad round it, the barracks along the west wall, the fuel depot, ammo bunkers and
   armoury in the east, the motor pool and gatehouses in the south and the glimmer plant in the middle. Unlike the Siege's town every building here is a target: each is a destructible
   building like Houston's (the kicks, shots and blasts of js/chapters/15-buildings-space.js hurt it, and it falls into rubble), only with its own picture, its own health and its own
   chaos value (FT_KINDS), and some of them blow up (js/fort/44zzzl-fort-chaos.js). The Tower's flow field (towerFlow, towerSteer) is reused so creatures come round the buildings, which is
   why the fort is put in TW.floor like a floor of walls; when a building falls it is taken out of the walls and the nav maps are made again, and when it is rebuilt it goes back in.
   FT_PLAN is the plan as data (kind, x, y, w, h in arena pixels); ftDraw paints every kind. */
const FT_KINDS = {
  hangar:   { name: 'Hangar',            hp: 900,  chaos: 500,  expl: 0 },
  radar:    { name: 'Radar Dome',        hp: 520,  chaos: 400,  expl: 0 },
  comms:    { name: 'Comms Tower',       hp: 380,  chaos: 350,  expl: 0 },
  bunker:   { name: 'Command Bunker',    hp: 1500, chaos: 900,  expl: 0 },
  heli:     { name: 'Helicopter',        hp: 260,  chaos: 350,  expl: 150, ex: { dmg: 80,  mul: 0.10 } },
  armoury:  { name: 'Armoury',           hp: 800,  chaos: 700,  expl: 360, ex: { dmg: 260, mul: 0.30 } },
  tank:     { name: 'Fuel Tank',         hp: 360,  chaos: 250,  expl: 260, ex: { dmg: 180, mul: 0.18 } },
  ammo:     { name: 'Ammo Bunker',       hp: 520,  chaos: 400,  expl: 300, ex: { dmg: 220, mul: 0.25 } },
  barracks: { name: 'Barracks',          hp: 520,  chaos: 450,  expl: 0 },
  mess:     { name: 'Mess Hall',         hp: 480,  chaos: 400,  expl: 0 },
  garage:   { name: 'Motor Pool',        hp: 520,  chaos: 450,  expl: 0 },
  jeep:     { name: 'Jeep',              hp: 160,  chaos: 120,  expl: 110, ex: { dmg: 50,  mul: 0.08 }, back: true },
  truck:    { name: 'Truck',             hp: 220,  chaos: 180,  expl: 140, ex: { dmg: 70,  mul: 0.08 }, back: true },
  apc:      { name: 'Parked APC',        hp: 300,  chaos: 260,  expl: 160, ex: { dmg: 90,  mul: 0.10 }, back: true },
  plant:    { name: 'Glimmer Plant',     hp: 1400, chaos: 1200, expl: 480, ex: { dmg: 320, mul: 0.40 } },
  gen:      { name: 'Generator',         hp: 260,  chaos: 220,  expl: 170, ex: { dmg: 90,  mul: 0.12 } },
  light:    { name: 'Searchlight',       hp: 180,  chaos: 120,  expl: 0 },
  gate:     { name: 'Gatehouse',         hp: 360,  chaos: 300,  expl: 0 },
  flag:     { name: 'Flagpole',          hp: 90,   chaos: 60,   expl: 0, back: true },
  depot:    { name: 'Supply Depot',      hp: 600,  chaos: 500,  expl: 0 },
  turret:   { name: 'Gun Emplacement',   hp: 220,  chaos: 120,  expl: 0 }
};
/* [kind, x, y, w, h, extra]: gen is the generator a searchlight is wired to (by index into the generators, in order) */
const FT_PLAN = [
  ['hangar', 180, 150, 560, 320], ['radar', 880, 170, 260, 260], ['comms', 1280, 190, 130, 130], ['bunker', 1650, 130, 900, 380],
  ['heli', 2820, 200, 160, 110], ['heli', 3030, 340, 160, 110], ['armoury', 3380, 170, 560, 320],
  ['tank', 3380, 720, 120, 120], ['tank', 3600, 720, 120, 120], ['tank', 3380, 930, 120, 120], ['tank', 3600, 930, 120, 120],
  ['ammo', 3400, 1250, 300, 170], ['ammo', 3400, 1510, 300, 170], ['depot', 3380, 1960, 520, 300],
  ['barracks', 200, 700, 440, 210], ['barracks', 200, 1000, 440, 210], ['barracks', 200, 1300, 440, 210], ['barracks', 200, 1600, 440, 210], ['mess', 200, 1950, 540, 280],
  ['plant', 1560, 1780, 1000, 420],
  ['garage', 300, 2480, 420, 230], ['garage', 820, 2480, 420, 230],
  ['gate', 1690, 2850, 170, 170], ['gate', 2340, 2850, 170, 170],
  ['jeep', 1500, 2430, 95, 56], ['jeep', 1500, 2540, 95, 56], ['jeep', 1500, 2650, 95, 56],
  ['truck', 2650, 2430, 150, 80], ['truck', 2650, 2570, 150, 80], ['truck', 2650, 2710, 150, 80],
  ['apc', 3000, 2500, 140, 90], ['apc', 3000, 2680, 140, 90],
  ['flag', 2070, 1480, 60, 60],
  ['gen', 880, 1280, 100, 80], ['gen', 2480, 700, 100, 80], ['gen', 3150, 1150, 100, 80], ['gen', 1050, 2230, 100, 80], ['gen', 3250, 2400, 100, 80],
  ['light', 820, 820, 70, 70, { g: 0 }], ['light', 820, 1800, 70, 70, { g: 0 }], ['light', 1500, 560, 70, 70, { g: 1 }], ['light', 2720, 640, 70, 70, { g: 1 }],
  ['light', 3260, 1700, 70, 70, { g: 2 }], ['light', 3260, 2300, 70, 70, { g: 4 }], ['light', 1340, 2300, 70, 70, { g: 3 }], ['light', 2900, 2300, 70, 70, { g: 4 }]
];
/* the gun emplacements she can hack (js/fort/44zzzl-fort-chaos.js): each is a small building too, so it can also just be shot down */
const FT_TURRETS = [[700, 600], [1500, 1000], [2100, 1000], [3100, 1000], [3150, 1900], [1250, 1600], [2900, 1500], [1000, 2950], [3600, 2750], [1500, 2100]];
FT_TURRETS.forEach(function(p){ FT_PLAN.push(['turret', p[0] - 40, p[1] - 40, 80, 80]); });
const FT_VENTS = [{ x: 90, y: 90 }, { x: 1500, y: 90 }, { x: 2680, y: 80 }, { x: 3200, y: 80 }, { x: 4060, y: 100 }, { x: 4100, y: 1100 }, { x: 4100, y: 2000 }, { x: 4060, y: 3050 }, { x: 130, y: 3050 }, { x: 90, y: 1550 }, { x: 1700, y: 1300 }];
const FT = { all: [], gens: [], lights: [], turrets: [], cache: {}, ready: false, fuse: [] };

function ftMake(row, i){
  const k = row[0], K = FT_KINDS[k], x = row[1], y = row[2], w = row[3], h = row[4], ex = row[5] || {};
  const b = makeBuilding(x, y, w, h, 'office', 7000 + i * 131);                     /* the cracks and the rubble pile come from the city's maker; the rest is ours */
  b.style = 'fort'; b.fort = true; b.kind = k; b.name = K.name; b.maxHp = K.hp; b.hp = K.hp; b.chaos = K.chaos; b.expl = K.expl; b.ex = K.ex || null; b.back = !!K.back; b.idx = i; b.g = ex.g === undefined ? -1 : ex.g;
  b.smoke = 0; b.fire = 0; b.units.length = 0;
  return b;
}
function ftRect(b){ return { x: b.x, y: b.y, w: b.w, h: b.h }; }
/* the nav maps again, from the buildings that are standing (a fallen one is open ground, a rebuilt one is a wall again) */
function ftNav(){
  const f = TW.floor; if (!f) return;
  f.walls = FT.all.filter(function(b){ return !b.collapsed; }).map(ftRect);
  towerNavBuild(f);
}
function buildFortWorld(){
  FT.all = FT_PLAN.map(ftMake); FT.gens = FT.all.filter(function(b){ return b.kind === 'gen'; }); FT.lights = FT.all.filter(function(b){ return b.kind === 'light'; });
  FT.lights.forEach(function(l){ l.gen = FT.gens[l.g] || null; }); FT.turrets = FT.all.filter(function(b){ return b.kind === 'turret'; });
  const f = { walls: [], boxes: [], rooms: [], doors: [], vents: FT_VENTS, props: [], start: fortStart(), n: 1, name: 'Fort Shortneck', kind: 'fort', lift: null };
  TW.floor = f; TW.n = 1; TW.ride = null; TW.open = false;
  G.buildings = FT.all.slice(); G.tower = true; G.rocket = null;
  ftNav(); FT.ready = true;
  fortChaosInit();
}
/* where she stands when the run starts: just inside the south gate, where she dropped off the wall */
function fortStart(){ return { x: 2100, y: 2700 }; }
const fortBaseStartRun = startRun;
startRun = function(){
  const r = fortBaseStartRun.apply(this, arguments);
  if (G.chapter === COUNTER_CHAPTER && G.biome === 'fort'){ const s = fortStart(); P.x = s.x; P.y = s.y; P.vx = 0; P.vy = 0; }
  return r;
};

/* ---------------------------------------------------------------- the ground */
function ftPattern(kind){
  if (FT.cache[kind]) return FT.cache[kind];
  const S = 160, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); if (!g) return '#7A745E';
  const rn = function(i){ return csR(i + kind.length * 911 + kind.charCodeAt(0) * 37); };
  if (kind === 'gravel'){
    g.fillStyle = '#7C7660'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 380; i++){ g.fillStyle = ['#8E8870', '#6A6450', '#9A9480', '#5E5846'][i % 4]; const sz = 1.5 + rn(i + 800) * 3; g.fillRect(rn(i) * S, rn(i + 400) * S, sz, sz * (0.6 + rn(i + 1200) * 0.6)); }
  } else if (kind === 'concrete'){
    g.fillStyle = '#9A9C98'; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(40,44,40,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S); g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S / 2, S); g.moveTo(0, S / 2); g.lineTo(S, S / 2); g.stroke();
    for (let i = 0; i < 170; i++){ g.fillStyle = rn(i) > 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'; g.fillRect(rn(i + 300) * S, rn(i + 700) * S, 2, 2); }
  } else if (kind === 'tar'){
    g.fillStyle = '#4A4C52'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 300; i++){ g.fillStyle = rn(i) > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.15)'; g.fillRect(rn(i + 500) * S, rn(i + 900) * S, 2 + rn(i + 1300) * 3, 2 + rn(i + 1700) * 3); }
  } else {
    g.fillStyle = '#6A5A3C'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 300; i++){ g.fillStyle = ['#7A6A4A', '#5A4A2E', '#86764E', '#4E4028'][i % 4]; g.fillRect(rn(i) * S, rn(i + 400) * S, 2 + rn(i + 800) * 3, 2 + rn(i + 1200) * 2); }
  }
  return FT.cache[kind] = (CTX && CTX.createPattern ? CTX.createPattern(c, 'repeat') : null) || '#7A745E';
}
/* the lots: where the ground is not the gravel of the yard (x, y, w, h, pattern, margin) */
const FT_LOTS = [
  [1500, 700, 1200, 1000, 'concrete', 0],         /* the parade ground */
  [150, 650, 640, 1650, 'dirt', 0],               /* the barracks yard */
  [250, 2400, 3400, 700, 'tar', 0],               /* the motor pool and the road to the gate */
  [3300, 650, 650, 1100, 'concrete', 0],          /* the fuel depot */
  [2700, 120, 560, 460, 'concrete', 0]            /* the helipad */
];
function ftHit(o, x0, y0, x1, y1, m){ return o.x + (o.w || 0) + (m || 0) < x0 || o.x - (m || 0) > x1 || o.y + (o.h || 0) + (m || 0) < y0 || o.y - (m || 0) > y1; }
function drawGroundFort(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  if (!FT.all.length) FT.all = FT_PLAN.map(ftMake);                                                              /* the menu's picture of the fort, before any run has built it */
  ctx.fillStyle = ftPattern('gravel'); ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  for (let i = 0; i < FT_LOTS.length; i++){
    const L = FT_LOTS[i]; if (ftHit({ x: L[0], y: L[1], w: L[2], h: L[3] }, x0, y0, x1, y1, 30)) continue;
    ctx.fillStyle = 'rgba(20,18,12,.4)'; ctx.fillRect(L[0] - 6, L[1] - 6, L[2] + 12, L[3] + 12); ctx.fillStyle = ftPattern(L[4]); ctx.fillRect(L[0], L[1], L[2], L[3]);
  }
  ftDecor(ctx, x0, y0, x1, y1, t);
  const bs = FT.all;                                                                                              /* back things first (a flag, the parked vehicles), then everything else */
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < bs.length; i++){ const b = bs[i]; if (b.back !== (pass === 0) || ftHit(b, x0, y0, x1, y1, 140)) continue; ftDrawBuilding(ctx, b, t); }
  if (typeof ftDrawMech === 'function') ftDrawMech(ctx, x0, y0, x1, y1, t);                                       /* the turrets and the searchlight beams */
  ftDrawWall(ctx, x0, y0, x1, y1, t);
}
function ftDecor(ctx, x0, y0, x1, y1, t){
  const on = function(x, y, m){ return x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m; };
  /* the parade ground: a painted ring and a compass star in the middle, the drill lines */
  if (on(2100, 1200, 700)){
    ctx.strokeStyle = 'rgba(244,244,236,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(2100, 1200, 330, 0, TAU); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2100, 1200, 300, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(244,244,236,.4)'; for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ctx.save(); ctx.translate(2100, 1200); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(0, -14); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = 'rgba(244,244,236,.3)'; ctx.lineWidth = 3; for (let y = 800; y <= 1600; y += 80){ ctx.beginPath(); ctx.moveTo(1560, y); ctx.lineTo(2640, y); ctx.stroke(); }
  }
  /* the helipad */
  if (on(2970, 350, 300)){
    ctx.strokeStyle = 'rgba(244,244,236,.6)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(2980, 330, 190, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(244,244,236,.55)'; ctx.font = '800 150px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', 2980, 385);
    for (let i = 0; i < 12; i++){ const a = i * TAU / 12, on2 = ((t * 2 + i * 0.5) % 2) < 1; ctx.fillStyle = on2 ? '#FFB84A' : '#6A4A22'; ctx.beginPath(); ctx.arc(2980 + Math.cos(a) * 220, 330 + Math.sin(a) * 220, 5, 0, TAU); ctx.fill(); }
  }
  /* the motor pool: bay lines, a lane in the middle of the road, and a painted crosswalk at the gate */
  if (on(2100, 2750, 1900)){
    ctx.fillStyle = 'rgba(244,214,90,.55)'; for (let x = 260; x < 3640; x += 90) ctx.fillRect(x, 2760, 46, 6);
    ctx.strokeStyle = 'rgba(244,244,236,.4)'; ctx.lineWidth = 3; ctx.beginPath(); for (let y = 2410; y < 2790; y += 110){ ctx.moveTo(1440, y); ctx.lineTo(1680, y); ctx.moveTo(2600, y); ctx.lineTo(2900, y); } ctx.stroke();
    ctx.fillStyle = 'rgba(240,240,236,.45)'; for (let i = -4; i <= 4; i++) ctx.fillRect(2100 + i * 22 - 7, 2800, 14, 70);
  }
  /* the fuel depot: hazard stripes round the tanks and spilled-fuel stains */
  if (on(3560, 880, 500)){
    ctx.save(); ctx.beginPath(); ctx.rect(3330, 670, 450, 440); ctx.rect(3350, 690, 410, 400); ctx.clip('evenodd');
    for (let i = -10; i < 20; i++){ ctx.fillStyle = i % 2 ? 'rgba(244,196,40,.65)' : 'rgba(30,30,34,.65)'; ctx.beginPath(); ctx.moveTo(3330 + i * 40, 670); ctx.lineTo(3330 + i * 40 + 20, 670); ctx.lineTo(3330 + i * 40 + 20 + 440, 1110); ctx.lineTo(3330 + i * 40 + 440, 1110); ctx.fill(); }
    ctx.restore();
  }
  /* the barracks yard: footpaths between the huts */
  if (on(420, 1400, 700)){ ctx.strokeStyle = 'rgba(206,188,148,.45)'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(700, 700); ctx.lineTo(700, 2200); ctx.moveTo(420, 930); ctx.lineTo(700, 930); ctx.moveTo(420, 1240); ctx.lineTo(700, 1240); ctx.moveTo(420, 1540); ctx.lineTo(700, 1540); ctx.moveTo(420, 1840); ctx.lineTo(700, 1840); ctx.stroke(); ctx.lineCap = 'butt'; }
  /* sandbag walls and chain-link fences, all flat on the ground and never in the way */
  ctx.fillStyle = 'rgba(190,170,120,.9)';
  for (const [sx, sy, n, vert] of [[1000, 540, 6, 0], [2700, 560, 5, 0], [1400, 1700, 5, 0], [1900, 2600, 4, 1], [2480, 2600, 4, 1], [3380, 1100, 6, 0]]) for (let i = 0; i < n; i++){ const x = sx + (vert ? 0 : i * 36), y = sy + (vert ? i * 22 : 0); if (!on(x, y, 40)) continue; ctx.fillRect(x, y, 34, 18); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x, y + 14, 34, 4); ctx.fillStyle = 'rgba(190,170,120,.9)'; }
  ctx.strokeStyle = 'rgba(200,204,212,.5)'; ctx.lineWidth = 2;
  for (const [fx, fy, fw, fh] of [[1500, 690, 1200, 1030], [3290, 640, 680, 1160]]) if (!ftHit({ x: fx, y: fy, w: fw, h: fh }, x0, y0, x1, y1, 20)){ ctx.strokeRect(fx, fy, fw, fh); ctx.setLineDash([2, 10]); ctx.strokeRect(fx + 4, fy + 4, fw - 8, fh - 8); ctx.setLineDash([]); }
}
/* the perimeter wall on all four edges, with floodlight posts, razor wire, the corner watchtowers and the closed south gate she came over */
function ftDrawWall(ctx, x0, y0, x1, y1, t){
  const W = ARENA_W, H = ARENA_H, T = 64;
  if (x0 < T + 20) { ctx.fillStyle = '#5E5C54'; ctx.fillRect(0, 0, T, H); ctx.fillStyle = '#7C7A70'; ctx.fillRect(T - 14, 0, 14, H); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(T, 0, 12, H); }
  if (x1 > W - T - 20) { ctx.fillStyle = '#5E5C54'; ctx.fillRect(W - T, 0, T, H); ctx.fillStyle = '#7C7A70'; ctx.fillRect(W - T, 0, 14, H); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(W - T - 12, 0, 12, H); }
  if (y0 < T + 20) { ctx.fillStyle = '#5E5C54'; ctx.fillRect(0, 0, W, T); ctx.fillStyle = '#7C7A70'; ctx.fillRect(0, T - 14, W, 14); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, T, W, 12); }
  if (y1 > H - T - 20) {
    ctx.fillStyle = '#5E5C54'; ctx.fillRect(0, H - T, W, T); ctx.fillStyle = '#7C7A70'; ctx.fillRect(0, H - T, W, 14); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, H - T - 12, W, 12);
    ctx.fillStyle = '#3A3E34'; ctx.fillRect(1860, H - T - 6, 480, T + 6); ctx.fillStyle = '#4A4E42'; ctx.fillRect(1866, H - T, 232, T); ctx.fillRect(2102, H - T, 232, T);
    ctx.fillStyle = '#E8C84A'; for (let i = 0; i < 8; i++) ctx.fillRect(1872 + i * 29, H - T + 8, 14, 10); for (let i = 0; i < 8; i++) ctx.fillRect(2108 + i * 29, H - T + 8, 14, 10);
  }
  ctx.fillStyle = 'rgba(40,40,36,.55)';
  for (let k = 0; k < 3; k++){ const o = 8 + k * 14; if (x0 < T + 20) ctx.fillRect(o, 0, 3, H); if (x1 > W - T - 20) ctx.fillRect(W - o - 3, 0, 3, H); if (y0 < T + 20) ctx.fillRect(0, o, W, 3); if (y1 > H - T - 20) ctx.fillRect(0, H - o - 3, W, 3); }
  ctx.strokeStyle = 'rgba(220,224,232,.55)'; ctx.lineWidth = 2;
  const wire = function(ax, ay, bx, by){ ctx.beginPath(); const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 24); for (let i = 0; i <= n; i++){ const px = ax + (bx - ax) * i / n, py = ay + (by - ay) * i / n, q = i % 2 ? 7 : -7; ctx.lineTo(px + (by === ay ? 0 : q), py + (bx === ax ? 0 : q)); } ctx.stroke(); };
  if (x0 < T + 20) wire(T + 6, Math.max(0, y0 - 40), T + 6, Math.min(H, y1 + 40)); if (x1 > W - T - 20) wire(W - T - 6, Math.max(0, y0 - 40), W - T - 6, Math.min(H, y1 + 40));
  if (y0 < T + 20) wire(Math.max(0, x0 - 40), T + 6, Math.min(W, x1 + 40), T + 6); if (y1 > H - T - 20) wire(Math.max(0, x0 - 40), H - T - 6, Math.min(W, x1 + 40), H - T - 6);
  for (let x = 200; x < W; x += 400) for (const y of [T + 2, H - T - 2]){ if (x < x0 - 60 || x > x1 + 60 || y < y0 - 60 || y > y1 + 60) continue; ftFloodPost(ctx, x, y, y < H / 2 ? 1 : -1, t); }
  for (let y = 200; y < H; y += 400) for (const x of [T + 2, W - T - 2]){ if (y < y0 - 60 || y > y1 + 60 || x < x0 - 60 || x > x1 + 60) continue; ftFloodPost(ctx, x, y, 0, t, x < W / 2 ? 1 : -1); }
  for (const [tx, ty] of [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]]){ if (tx < x0 - 120 || tx > x1 + 120 || ty < y0 - 120 || ty > y1 + 120) continue; ftWatchtower(ctx, tx, ty, t); }
}
function ftFloodPost(ctx, x, y, dy, t, dx){
  ctx.fillStyle = '#2E3038'; ctx.fillRect(x - 3, y - 3, 6, 6); ctx.fillStyle = '#FFF2B0'; ctx.beginPath(); ctx.arc(x + (dx || 0) * 8, y + dy * 8, 5, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 2, x, y, 110); g.addColorStop(0, 'rgba(255,230,160,.26)'); g.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 110, y - 110, 220, 220); ctx.globalCompositeOperation = 'source-over';
}
function ftWatchtower(ctx, x, y, t){
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - 38, y - 30, 90, 90); ctx.fillStyle = '#4A4E40'; ctx.fillRect(x - 44, y - 44, 88, 88); ctx.fillStyle = '#6A6E5A'; ctx.fillRect(x - 38, y - 38, 76, 76);
  ctx.fillStyle = '#8A8E78'; ctx.fillRect(x - 38, y - 38, 76, 10); ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 3; ctx.strokeRect(x - 30, y - 30, 60, 60); ctx.beginPath(); ctx.moveTo(x - 30, y - 30); ctx.lineTo(x + 30, y + 30); ctx.moveTo(x + 30, y - 30); ctx.lineTo(x - 30, y + 30); ctx.stroke();
  ctx.fillStyle = Math.sin(t * 4 + x) > 0 ? '#FF5A4A' : '#5A2A22'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
}

/* ---------------------------------------------------------------- the buildings */
function ftShadow(ctx, b){ ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(b.x + 10, b.y + 14, b.w, b.h); }
function ftBlock(ctx, b, roof, wall, front){
  const f = front === undefined ? Math.min(34, b.h * 0.2) : front;
  ftShadow(ctx, b);
  ctx.fillStyle = wall; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = roof; ctx.fillRect(b.x, b.y, b.w, b.h - f);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(b.x, b.y, b.w, 5);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x, b.y + b.h - f - 4, b.w, 4);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
  return f;
}
function ftRivets(ctx, x, y, w, h, n, c){ ctx.fillStyle = c || 'rgba(20,20,16,.5)'; for (let i = 0; i < n; i++){ ctx.fillRect(x + 6 + (w - 12) * i / Math.max(1, n - 1) - 1.5, y + 4, 3, 3); ctx.fillRect(x + 6 + (w - 12) * i / Math.max(1, n - 1) - 1.5, y + h - 7, 3, 3); } }
function ftHazard(ctx, x, y, w, h){ ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); for (let i = -2; i < w / 14 + 2; i++){ ctx.fillStyle = i % 2 ? '#E8C03A' : '#1E1E22'; ctx.beginPath(); ctx.moveTo(x + i * 14, y + h); ctx.lineTo(x + i * 14 + 7, y + h); ctx.lineTo(x + i * 14 + 7 + h, y); ctx.lineTo(x + i * 14 + h, y); ctx.fill(); } ctx.restore(); }
function ftWindows(ctx, b, f, n, lit){ const gap = b.w / (n + 1); for (let i = 1; i <= n; i++){ ctx.fillStyle = '#10141C'; ctx.fillRect(b.x + gap * i - 10, b.y + b.h - f + 5, 20, f - 10); ctx.fillStyle = lit ? '#F6E2A0' : '#4A5668'; ctx.fillRect(b.x + gap * i - 8, b.y + b.h - f + 7, 16, f - 14); } }
function ftDrawBuilding(ctx, b, t){
  if (b.collapsed){ ftDrawRuin(ctx, b, t); return; }
  const k = b.kind, x = b.x, y = b.y, w = b.w, h = b.h;
  if (k === 'hangar'){
    const f = ftBlock(ctx, b, '#7C8466', '#4A5038', 40);
    for (let i = 1; i < w / 16; i++){ ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.1)'; ctx.fillRect(x + i * 16, y + 6, 8, h - f - 10); }
    ctx.fillStyle = '#5A6248'; ctx.fillRect(x + 20, y + (h - f) / 2 - 6, w - 40, 12); ctx.fillStyle = '#2E3228'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 40 + i * (w - 80) / 6, y + 22, (w - 80) / 6 - 12, 26);
    ftHazard(ctx, x + w * 0.2, y + h - f + 4, w * 0.6, f - 8); ctx.fillStyle = '#10141C'; ctx.fillRect(x + w * 0.25, y + h - f + 8, w * 0.5, f - 16);
    ctx.fillStyle = '#F2EEDC'; ctx.beginPath(); ctx.arc(x + w - 56, y + 56, 24, 0, TAU); ctx.fill(); ctx.fillStyle = '#3A4E88'; ctx.beginPath(); ctx.arc(x + w - 56, y + 56, 17, 0, TAU); ctx.fill(); ctx.fillStyle = '#F2EEDC'; ctx.fillRect(x + w - 60, y + 40, 8, 32); ctx.fillRect(x + w - 72, y + 52, 32, 8);
    ftRivets(ctx, x, y, w, h - f, 16);
  } else if (k === 'radar'){
    ftShadow(ctx, { x: x, y: y, w: w, h: h }); ctx.fillStyle = '#4A4E40'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A6E5A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#D8DCE0'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.38, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9AA0A8'; ctx.lineWidth = 2; for (let i = 1; i < 5; i++){ ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.38 * i / 5, 0, TAU); ctx.stroke(); }
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(t * 0.9); ctx.strokeStyle = '#8A929C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.36, 0); ctx.stroke(); ctx.fillStyle = 'rgba(120,255,160,.2)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, w * 0.38, -0.5, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = Math.sin(t * 4) > 0 ? '#FF5A4A' : '#5A2A22'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 8, 0, TAU); ctx.fill();
  } else if (k === 'comms'){
    ftShadow(ctx, b); ctx.fillStyle = '#5A5E50'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7C806C'; ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
    ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 4; ctx.strokeRect(x + 16, y + 16, w - 32, h - 32); ctx.beginPath(); ctx.moveTo(x + 16, y + 16); ctx.lineTo(x + w - 16, y + h - 16); ctx.moveTo(x + w - 16, y + 16); ctx.lineTo(x + 16, y + h - 16); ctx.stroke();
    ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 14, 0, TAU); ctx.fill(); ctx.fillStyle = Math.sin(t * 5 + x) > 0 ? '#FF5A4A' : '#5A2A22'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++){ const a = i * TAU / 4 + 0.4; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2 + Math.cos(a) * 70, y + h / 2 + Math.sin(a) * 70); ctx.stroke(); }
  } else if (k === 'bunker'){
    const f = ftBlock(ctx, b, '#8A8C80', '#52544A', 50);
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x, y, w, (h - f) * 0.4); ctx.fillStyle = '#6E7064'; ctx.fillRect(x + 30, y + 26, w - 60, h - f - 52);
    ctx.fillStyle = '#9A9C90'; ctx.fillRect(x + 40, y + 36, w - 80, 12);
    ctx.fillStyle = '#3A3C34'; ctx.fillRect(x + w / 2 - 70, y + 80, 140, 110); ctx.fillStyle = '#2A2C26'; ctx.fillRect(x + w / 2 - 56, y + 94, 112, 82); ctx.strokeStyle = '#8A8C80'; ctx.lineWidth = 3; ctx.strokeRect(x + w / 2 - 56, y + 94, 112, 82); ctx.beginPath(); ctx.moveTo(x + w / 2, y + 94); ctx.lineTo(x + w / 2, y + 176); ctx.stroke();
    for (const vx of [90, 210, w - 210, w - 90]) { ctx.fillStyle = '#2E3028'; ctx.fillRect(x + vx - 22, y + 96, 44, 30); ctx.fillStyle = '#4A4C42'; for (let q = 0; q < 5; q++) ctx.fillRect(x + vx - 20, y + 100 + q * 5, 40, 2); }
    ctx.strokeStyle = '#C8CCD4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w - 70, y + 70); ctx.lineTo(x + w - 70, y - 24); ctx.moveTo(x + w - 52, y + 70); ctx.lineTo(x + w - 52, y - 8); ctx.stroke(); ctx.fillStyle = Math.sin(t * 3) > 0 ? '#FF5A4A' : '#5A2A22'; ctx.beginPath(); ctx.arc(x + w - 70, y - 24, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(244,244,236,.42)'; ctx.font = '800 28px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('COMMAND', x + w / 2, y + h - f - 14);
    ctx.fillStyle = '#F6E2A0'; for (let i = 1; i <= 9; i++) if (i !== 5) ctx.fillRect(x + w * i / 10 - 9, y + h - f + 8, 18, f - 16);
    for (let i = 0; i < 12; i++){ ctx.fillStyle = '#B8A878'; ctx.fillRect(x + 20 + i * 24, y + h + 4, 22, 12); ctx.fillRect(x + w - 40 - i * 24, y + h + 4, 22, 12); }
  } else if (k === 'heli'){
    ftShadow(ctx, b); ctx.fillStyle = '#4A5668'; ctx.beginPath(); ctx.ellipse(x + w * 0.4, y + h / 2, w * 0.34, h * 0.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#5E6C80'; ctx.beginPath(); ctx.ellipse(x + w * 0.38, y + h / 2 - 4, w * 0.3, h * 0.22, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A5668'; ctx.fillRect(x + w * 0.62, y + h / 2 - 4, w * 0.36, 8); ctx.fillRect(x + w * 0.92, y + h / 2 - 14, 6, 28); ctx.fillStyle = 'rgba(130,200,236,.8)'; ctx.beginPath(); ctx.ellipse(x + w * 0.22, y + h / 2, w * 0.1, h * 0.16, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,34,42,.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w * 0.4 - w * 0.5, y + h / 2 - 10); ctx.lineTo(x + w * 0.4 + w * 0.5, y + h / 2 + 10); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,34,42,.5)'; ctx.beginPath(); ctx.moveTo(x + w * 0.4 + w * 0.3, y + h / 2 - 30); ctx.lineTo(x + w * 0.4 - w * 0.3, y + h / 2 + 30); ctx.stroke();
    ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.arc(x + w * 0.4, y + h / 2, 7, 0, TAU); ctx.fill();
  } else if (k === 'armoury'){
    const f = ftBlock(ctx, b, '#7A7A68', '#46463A', 44);
    ftHazard(ctx, x, y, w, 12); ftHazard(ctx, x, y + h - f - 12, w, 12);
    for (let i = 0; i < 4; i++){ ctx.fillStyle = i % 2 ? '#5E5E4E' : '#6A6A58'; ctx.fillRect(x + 30 + i * (w - 60) / 4, y + 30, (w - 60) / 4 - 10, h - f - 70); ctx.fillStyle = '#2E2E26'; for (let q = 0; q < 3; q++) ctx.fillRect(x + 36 + i * (w - 60) / 4, y + 40 + q * 22, (w - 60) / 4 - 22, 3); }
    ctx.fillStyle = '#C84A2A'; ctx.beginPath(); ctx.moveTo(x + w - 54, y + 36); ctx.lineTo(x + w - 30, y + 80); ctx.lineTo(x + w - 78, y + 80); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2EEDC'; ctx.fillRect(x + w - 56, y + 50, 4, 16); ctx.fillRect(x + w - 56, y + 70, 4, 4);
    ctx.fillStyle = '#10141C'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 60 + i * (w - 120) / 3, y + h - f + 6, (w - 120) / 3 - 18, f - 12);
    for (let i = 0; i < 6; i++){ ctx.fillStyle = i % 2 ? '#A88A52' : '#B89A62'; ctx.fillRect(x + w + 8, y + 20 + i * 22, 36, 18); }
  } else if (k === 'tank'){
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x + w / 2 + 10, y + h / 2 + 14, w * 0.5, h * 0.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8A93A2'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.38, w * 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 6, 0, TAU); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 12, 0, TAU); ctx.clip(); ftHazard(ctx, x + w / 2 - 6, y, 12, h); ctx.restore();
    ctx.fillStyle = '#C84A2A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#F2EEDC'; ctx.font = '800 12px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('F', x + w / 2, y + h / 2 + 4);
    ctx.strokeStyle = '#5A606C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * 0.15); ctx.lineTo(x + w * 0.02, y - 10); ctx.stroke();
  } else if (k === 'ammo'){
    ftShadow(ctx, b); ctx.fillStyle = '#5E5240'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7A6A50'; ctx.fillRect(x + 8, y + 8, w - 16, h - 36);
    for (let i = 0; i < w / 14; i++){ ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.08)'; ctx.fillRect(x + 8 + i * 14, y + 8, 7, h - 36); }
    ctx.fillStyle = '#2E2A22'; ctx.fillRect(x + w / 2 - 44, y + h - 52, 88, 40); ctx.strokeStyle = '#A8A090'; ctx.lineWidth = 3; ctx.strokeRect(x + w / 2 - 44, y + h - 52, 88, 40); ftHazard(ctx, x + w / 2 - 44, y + h - 62, 88, 8);
    ctx.fillStyle = '#C84A2A'; ctx.beginPath(); ctx.moveTo(x + w - 40, y + 24); ctx.lineTo(x + w - 20, y + 60); ctx.lineTo(x + w - 60, y + 60); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2EEDC'; ctx.fillRect(x + w - 42, y + 36, 4, 12); ctx.fillRect(x + w - 42, y + 52, 4, 4);
  } else if (k === 'barracks' || k === 'mess' || k === 'depot'){
    const pal = k === 'barracks' ? ['#7C7860', '#4A4632'] : k === 'mess' ? ['#8A7A58', '#5A4C34'] : ['#6C7A74', '#44524C'], f = ftBlock(ctx, b, pal[0], pal[1], 34);
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 1; i < 7; i++){ const yy = y + (h - f) * i / 7; ctx.moveTo(x + 4, yy); ctx.lineTo(x + w - 4, yy); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, y, w, (h - f) * 0.45); ctx.fillStyle = pal[1]; ctx.fillRect(x + w * 0.72, y + 16, 24, 28);
    ftWindows(ctx, b, f, Math.max(3, Math.round(w / 90)), k !== 'depot'); ctx.fillStyle = '#2E2E26'; ctx.fillRect(x + w / 2 - 14, y + h - f + 4, 28, f - 4);
    if (k === 'mess'){ for (let i = 0; i < 3; i++){ ctx.fillStyle = '#9AA0A8'; ctx.beginPath(); ctx.arc(x + 80 + i * 70, y + 70, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#5A606C'; ctx.beginPath(); ctx.arc(x + 80 + i * 70, y + 70, 12, 0, TAU); ctx.fill(); } }
    if (k === 'depot'){ for (let i = 0; i < 5; i++){ ctx.fillStyle = i % 2 ? '#A88A52' : '#B89A62'; ctx.fillRect(x + 26 + i * (w - 52) / 5, y + 40, (w - 52) / 5 - 14, (h - f) - 80); ctx.strokeStyle = '#6E5630'; ctx.lineWidth = 2; ctx.strokeRect(x + 26 + i * (w - 52) / 5, y + 40, (w - 52) / 5 - 14, (h - f) - 80); } }
    ftRivets(ctx, x, y, w, h - f, Math.max(5, Math.round(w / 40)));
  } else if (k === 'garage'){
    const f = ftBlock(ctx, b, '#80806C', '#4E4E40', 46);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, y, w, (h - f) * 0.4); for (let i = 1; i < w / 20; i++){ ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x + i * 20, y + 6, 3, h - f - 10); }
    for (let i = 0; i < 3; i++){ const dx = x + 20 + i * (w - 40) / 3; ctx.fillStyle = '#2A2C26'; ctx.fillRect(dx, y + h - f + 4, (w - 40) / 3 - 14, f - 6); ctx.fillStyle = '#5E6054'; for (let q = 0; q < 4; q++) ctx.fillRect(dx + 2, y + h - f + 7 + q * 8, (w - 40) / 3 - 18, 3); ctx.fillStyle = '#E8C84A'; ctx.fillRect(dx + 6, y + h - f - 12, 22, 10); ctx.fillStyle = '#10141C'; ctx.font = '800 9px ui-sans-serif, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(String(i + 1), dx + 14, y + h - f - 4); }
    ctx.fillStyle = '#9AA0A8'; ctx.beginPath(); ctx.arc(x + w - 50, y + 56, 20, 0, TAU); ctx.fill(); ctx.fillStyle = '#5A606C'; ctx.beginPath(); ctx.arc(x + w - 50, y + 56, 10, 0, TAU); ctx.fill();
  } else if (k === 'jeep' || k === 'truck' || k === 'apc'){
    ftShadow(ctx, b); const col = k === 'jeep' ? '#8A9060' : k === 'truck' ? '#6E7A52' : '#70785A';
    ctx.fillStyle = '#14161C'; for (let i = 0; i < (k === 'truck' ? 3 : 2); i++){ const wx = x + 14 + i * (w - 28) / (k === 'truck' ? 2 : 1); ctx.fillRect(wx - 8, y - 2, 16, 8); ctx.fillRect(wx - 8, y + h - 6, 16, 8); }
    ctx.fillStyle = '#10121A'; ctx.fillRect(x, y + 4, w, h - 8); ctx.fillStyle = col; ctx.fillRect(x + 2, y + 6, w - 4, h - 12); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + 2, y + 6, w - 4, 6);
    if (k === 'truck'){ ctx.fillStyle = '#5E6A46'; ctx.fillRect(x + 6, y + 10, w * 0.62, h - 20); ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 1; i < 6; i++) ctx.fillRect(x + 6 + i * w * 0.62 / 6, y + 10, 2, h - 20); ctx.fillStyle = '#9AD8F0'; ctx.fillRect(x + w * 0.74, y + 12, 14, h - 24); }
    else if (k === 'jeep'){ ctx.fillStyle = '#3A3A2E'; ctx.fillRect(x + 22, y + 12, 18, h - 24); ctx.fillStyle = '#9AD8F0'; ctx.fillRect(x + w * 0.66, y + 10, 8, h - 20); ctx.fillStyle = '#F2EEDC'; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h / 2, 6, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = '#14160E'; ctx.beginPath(); ctx.arc(x + w * 0.4, y + h / 2, h * 0.32, 0, TAU); ctx.fill(); ctx.fillStyle = tw_li(col, 0.1); ctx.beginPath(); ctx.arc(x + w * 0.4, y + h / 2, h * 0.27, 0, TAU); ctx.fill(); ctx.fillStyle = '#10121A'; ctx.fillRect(x + w * 0.4, y + h / 2 - 3, w * 0.4, 6); }
  } else if (k === 'plant'){
    const f = ftBlock(ctx, b, '#5E7A6C', '#2E4A3E', 46);
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x, y, w, (h - f) * 0.35);
    for (let i = 0; i < 3; i++){ const cx2 = x + w * (0.2 + i * 0.3), cy2 = y + (h - f) * 0.5; ctx.fillStyle = '#10201A'; ctx.beginPath(); ctx.arc(cx2, cy2, 56, 0, TAU); ctx.fill(); ctx.fillStyle = '#7AFFC8'; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2 + i); ctx.beginPath(); ctx.arc(cx2, cy2, 44, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#E8FFF4'; ctx.beginPath(); ctx.arc(cx2, cy2, 18, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9AF0C8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx2, cy2, 56, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = '#7AFFC8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + (h - f) * 0.5); ctx.lineTo(x + w * 0.8, y + (h - f) * 0.5); ctx.stroke(); ctx.strokeStyle = '#10201A'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(x + w - 70, y + 54); ctx.rotate(t * 3); ctx.fillStyle = '#10201A'; for (let q = 0; q < 4; q++){ ctx.rotate(Math.PI / 2); ctx.fillRect(0, -4, 30, 8); } ctx.restore();
    ftHazard(ctx, x + 20, y + h - f + 6, w - 40, f - 12);
    ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * 0.6); g.addColorStop(0, 'rgba(120,255,200,.2)'); g.addColorStop(1, 'rgba(120,255,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - 100, y - 100, w + 200, h + 200); ctx.globalCompositeOperation = 'source-over';
  } else if (k === 'gen'){
    ftShadow(ctx, b); const on = !b.off; ctx.fillStyle = '#4A4C42'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#C8A02A'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + 4, y + 4, w - 8, 6);
    ctx.fillStyle = '#2E2E26'; ctx.beginPath(); ctx.arc(x + w * 0.3, y + h / 2, 22, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(x + w * 0.3, y + h / 2); ctx.rotate(t * (on ? 8 : 0)); ctx.fillStyle = '#8A8E96'; for (let q = 0; q < 5; q++){ ctx.rotate(TAU / 5); ctx.fillRect(2, -3, 18, 6); } ctx.restore();
    ctx.fillStyle = '#2E2E26'; ctx.fillRect(x + w * 0.62, y + 10, w * 0.3, h - 20); ctx.fillStyle = on ? '#7AF0B0' : '#5A2A22'; ctx.beginPath(); ctx.arc(x + w * 0.77, y + h * 0.35, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8C84A'; ctx.beginPath(); ctx.moveTo(x + w * 0.77, y + h * 0.55); ctx.lineTo(x + w * 0.72, y + h * 0.75); ctx.lineTo(x + w * 0.78, y + h * 0.72); ctx.lineTo(x + w * 0.74, y + h * 0.9); ctx.lineTo(x + w * 0.84, y + h * 0.66); ctx.lineTo(x + w * 0.78, y + h * 0.68); ctx.closePath(); ctx.fill();
  } else if (k === 'light'){
    ftShadow(ctx, b); ctx.fillStyle = '#3A3E34'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.fillStyle = '#5E6252'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + w - 8, y + h - 8); ctx.moveTo(x + w - 8, y + 8); ctx.lineTo(x + 8, y + h - 8); ctx.stroke();
    const lit = !(b.gen && b.gen.collapsed); ctx.fillStyle = '#2E3028'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 16, 0, TAU); ctx.fill(); ctx.fillStyle = lit ? '#FFF2B0' : '#6A6A58'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 11, 0, TAU); ctx.fill();
  } else if (k === 'gate'){
    const f = ftBlock(ctx, b, '#7A7E68', '#44483A', 32);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, y, w, (h - f) * 0.4); ctx.fillStyle = '#3A3E34'; ctx.fillRect(x + 20, y + 20, w - 40, 36); ctx.fillStyle = '#9AD8F0'; ctx.fillRect(x + 28, y + 26, w - 56, 24);
    ftHazard(ctx, x + 10, y + h - f + 4, w - 20, f - 8); ctx.fillStyle = Math.sin(t * 6) > 0 ? '#FF5A4A' : '#5A2A22'; ctx.beginPath(); ctx.arc(x + w - 22, y + 22, 7, 0, TAU); ctx.fill();
  } else if (k === 'turret'){
    const cx = x + w / 2, cy = y + h / 2, st = b.tState || 'hostile', col = st === 'ally' ? '#6AE08A' : '#FF5A4A';
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(cx + 5, cy + 7, 40, 0, TAU); ctx.fill();
    ctx.fillStyle = '#B8A878'; for (let i = 0; i < 12; i++){ const a = i * TAU / 12; ctx.save(); ctx.translate(cx + Math.cos(a) * 33, cy + Math.sin(a) * 33); ctx.rotate(a + Math.PI / 2); ctx.fillRect(-9, -5, 18, 10); ctx.restore(); }
    ctx.fillStyle = '#4A4C42'; ctx.beginPath(); ctx.arc(cx, cy, 25, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A6C5A'; ctx.beginPath(); ctx.arc(cx, cy, 21, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(b.ang || 0); ctx.fillStyle = '#2E3028'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#4A4C42'; ctx.fillRect(-10, -10, 20, 20); ctx.fillStyle = '#14161C'; ctx.fillRect(6, -6, 32, 4); ctx.fillRect(6, 2, 32, 4); ctx.fillStyle = '#8A8E96'; ctx.fillRect(34, -7, 6, 6); ctx.fillRect(34, 1, 6, 6);
    if (b.muzzle > 0){ ctx.fillStyle = '#FFE9A0'; ctx.beginPath(); ctx.arc(44, -4, 6, 0, TAU); ctx.arc(44, 4, 6, 0, TAU); ctx.fill(); }
    ctx.restore(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (b.hack > 0.02 && st === 'hostile'){ ctx.strokeStyle = '#6AE08A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + TAU * b.hack); ctx.stroke(); }
    if (st === 'ally'){ ctx.strokeStyle = 'rgba(106,224,138,.55)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(cx, cy, 56, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#6AE08A'; ctx.font = '800 14px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('HACKED ' + Math.ceil(b.allyT || 0), cx, cy - 62); }
  } else if (k === 'flag'){
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(x + w / 2 + 6, y + h / 2 + 8, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A6E5A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C8402A'; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2 - 3); for (let i = 0; i <= 8; i++) ctx.lineTo(x + w / 2 + i * 6, y + h / 2 - 3 + Math.sin(t * 4 + i * 0.8) * 4); for (let i = 8; i >= 0; i--) ctx.lineTo(x + w / 2 + i * 6, y + h / 2 + 12 + Math.sin(t * 4 + i * 0.8) * 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2EEDC'; ctx.fillRect(x + w / 2 + 8, y + h / 2 + 2, 28, 4);
  }
  ftDamage(ctx, b, t);
  if (b.hp < b.maxHp * 0.99) ftBar(ctx, b);
}
/* scorch, cracks, flames and a flash on a building that has been hurt */
function ftDamage(ctx, b, t){
  const pc = b.hp / b.maxHp;
  if (pc < 0.99){
    ctx.fillStyle = 'rgba(20,16,14,' + ((1 - pc) * 0.5).toFixed(3) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h);
    const n = Math.min(b.cracks.length, Math.round((1 - pc) * 8)); ctx.strokeStyle = 'rgba(14,10,8,.75)'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i < n; i++){ const c = b.cracks[i]; ctx.moveTo(c[0], c[1]); for (let k = 2; k < c.length; k += 2) ctx.lineTo(c[k], c[k + 1]); } ctx.stroke();
  }
  if (pc < 0.4){
    const f = Math.max(1, Math.round(b.w * b.h / 14000));
    for (let i = 0; i < f; i++){ const fx = b.x + (0.15 + 0.7 * csR(b.idx * 17 + i * 3)) * b.w, fy = b.y + (0.15 + 0.6 * csR(b.idx * 23 + i * 5)) * b.h, fl = 0.6 + 0.4 * Math.sin(t * 9 + i * 2.1);
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,140,40,' + (0.5 * fl).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(fx, fy, 12 + 5 * fl, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFD060'; ctx.beginPath(); ctx.ellipse(fx, fy - 4 * fl, 3.4, 6 * fl, 0, 0, TAU); ctx.fill(); }
  }
  if (b.flash > 0){ ctx.fillStyle = 'rgba(255,230,190,' + Math.min(0.6, b.flash * 4).toFixed(2) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h); }
}
function ftBar(ctx, b){
  const pc = clamp(b.hp / b.maxHp, 0, 1), bw = Math.max(70, Math.min(b.w, 180) * 0.8), bx = b.x + b.w / 2 - bw / 2, by = b.y - 16;
  ctx.fillStyle = 'rgba(14,12,16,.75)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 10); ctx.fillStyle = pc > 0.6 ? '#7AD86A' : pc > 0.3 ? '#E8C84A' : '#E8603A'; ctx.fillRect(bx, by, bw * pc, 6);
}
/* what is left: a scorched footprint, the rubble pile, bent rebar and a little smoke for a while */
function ftDrawRuin(ctx, b, t){
  ctx.fillStyle = 'rgba(24,20,16,.7)'; ctx.fillRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16); ctx.fillStyle = 'rgba(70,62,52,.55)'; ctx.fillRect(b.x, b.y, b.w, b.h);
  for (let i = 0; i < b.rubble.length; i++){ const r = b.rubble[i]; ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot); ctx.fillStyle = r.c; ctx.fillRect(-r.s / 2, -r.s / 3, r.s, r.s * 0.66); ctx.restore(); }
  ctx.strokeStyle = 'rgba(120,70,40,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 4; i++){ const r = b.rubble[i * 3 % b.rubble.length]; ctx.moveTo(r.x, r.y); ctx.quadraticCurveTo(r.x + 10, r.y - 8, r.x + 18, r.y + 4); } ctx.stroke();
  if (b.fire > 0 && b.expl){ const fl = 0.6 + 0.4 * Math.sin(t * 10 + b.idx); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,130,40,' + (0.4 * fl * Math.min(1, b.fire)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.min(b.w, b.h) * 0.4, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
}

/* the colour of a building on the minimap (js/ui/44zzzj-minimap.js): rubble is dark, things that blow up are orange, the guns red until hacked, the lights yellow while they have power */
function ftMmColor(b){
  if (b.collapsed) return 'rgba(52,46,42,.85)';
  if (b.kind === 'turret') return b.tState === 'ally' ? '#6AE08A' : b.tState === 'dead' ? '#7A7A70' : '#E8503A';
  if (b.kind === 'light') return b.gen && b.gen.collapsed ? '#5A5A50' : '#FFE890';
  if (b.kind === 'plant') return '#7AFFC8';
  if (b.expl) return b.hp < b.maxHp * 0.5 ? '#FF6A2A' : '#F0A23A';
  return b.hp < b.maxHp * 0.5 ? '#B0725E' : b.kind === 'bunker' ? '#D8D4B8' : '#9AA078';
}
