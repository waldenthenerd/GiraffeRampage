'use strict';
/* Chapter 14, the Tower: a floor in play (the plans are in js/30d-tower-layouts.js). */
/* ========================= THE TOWER IN PLAY ========================= */
/* The walls and the furniture are solid, unbreakable "buildings" (G.buildings): the giraffe, her ants and every creature, flyers too, have to go round them, and
   every shot dies on one. Creatures chase in a straight line when they can see her; when a wall is in the way they follow a flow field, a map of how many steps each
   spot is from her (towerFlow), so they come through the doorways instead of pressing against the wall. A floor is cleared, the lift opens, she walks into it, and
   the ride up swaps the floor (towerRide). Everything the floor looks like is drawn from the plan in drawGroundTower. */
const TW_NAV = 50, TW_NX = Math.ceil(ARENA_W / TW_NAV), TW_NY = Math.ceil(ARENA_H / TW_NAV), TW_RIDE = { out: 0.7, swap: 1.5, back: 2.3, end: 3.0 };
const TW = { floor: null, n: 0, solid: null, blocked: null, dist: null, flowAt: -1, lift: null, ride: null, open: false, cache: {} };
function towerWallBuilding(r){ return { x: r.x, y: r.y, w: r.w, h: r.h, style: 'tower', tower: true, kind: r.k, hp: 1, maxHp: 1, collapsed: false, flash: 0, indestructible: true, units: [], cracks: [], rubble: [] }; }
function towerNavBuild(f){
  const N = TW_NX * TW_NY, solid = new Uint8Array(N), blocked = new Uint8Array(N), rects = f.walls.concat(f.boxes);
  for (let k = 0; k < rects.length; k++){
    const r = rects[k], i0 = Math.max(0, Math.floor(r.x / TW_NAV)), i1 = Math.min(TW_NX - 1, Math.floor((r.x + r.w) / TW_NAV)), j0 = Math.max(0, Math.floor(r.y / TW_NAV)), j1 = Math.min(TW_NY - 1, Math.floor((r.y + r.h) / TW_NAV));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){ const cx = i * TW_NAV, cy = j * TW_NAV; if (cx + TW_NAV > r.x && cx < r.x + r.w && cy + TW_NAV > r.y && cy < r.y + r.h) solid[j * TW_NX + i] = 1; }
  }
  for (let j = 0; j < TW_NY; j++) for (let i = 0; i < TW_NX; i++){
    let b = 0;
    for (let dj = -1; dj <= 1 && !b; dj++) for (let di = -1; di <= 1; di++){ const a = i + di, c = j + dj; if (a < 0 || c < 0 || a >= TW_NX || c >= TW_NY || solid[c * TW_NX + a]){ b = 1; break; } }
    blocked[j * TW_NX + i] = b;
  }
  TW.solid = solid; TW.blocked = blocked; TW.dist = new Uint16Array(N); TW.dist.fill(65535); TW.flowAt = -1; TW.queue = new Int32Array(N);
}
/* put floor n in the world: its walls and furniture become the buildings, the nav maps are made, and the floor's pictures are got ready */
function towerLoadFloor(n){
  const f = twBuildPlan(n); TW.floor = f; TW.n = n; TW.open = false;
  G.buildings = f.walls.concat(f.boxes).map(towerWallBuilding); G.tower = true; G.rocket = null;
  towerNavBuild(f); towerDecor(f);
  return f;
}
function towerStartPoint(){ const s = TW.floor.start; return { x: s.x, y: s.y }; }
/* startWave for a tower floor: load its plan the first time it is wanted, and put her in the lift she arrives by */
function towerPrepareFloor(w){
  const n = chapterWaveOf(w);
  if (!G.tower || TW.n !== n || !TW.floor) towerLoadFloor(n);
  const s = towerStartPoint(); P.x = s.x; P.y = s.y; P.vx = 0; P.vy = 0;
  G.pickups.length = 0; G.eproj.length = 0; G.markers.length = 0; G.hzones.length = 0; G.beams.length = 0; G.blasts.length = 0;
  TW.open = false; G.fadeIn = null;
}
function buildTowerWorld(){ G.buildings = []; G.rocket = null; G.tower = true; TW.floor = null; TW.n = 0; TW.ride = null; TW.open = false; }
const towerBaseStartWave = startWave;
startWave = function(n){ if (chapterOf(n) === TOWER_CHAPTER) towerPrepareFloor(n); return towerBaseStartWave.apply(this, arguments); };

/* the last floor's boss has fallen: the vial and the coat colour are saved before the film, so quitting during it loses nothing */
function towerFinishSave(){
  const d = Save.data; if (!d) return;
  if (!d.chapter15Complete){ d.vials = (d.vials | 0) + 1; G.vialNew = true; }
  d.chapter14Complete = true; d.chapter15Complete = true; Save.write();
}

/* ---- seeing, steering, and finding a place ---- */
function twCell(x, y){ return (y / TW_NAV | 0) * TW_NX + (x / TW_NAV | 0); }
function twIn(x, y){ return x >= 0 && y >= 0 && x < ARENA_W && y < ARENA_H; }
/* is the way from one point to another clear of walls and furniture? */
function towerSight(x1, y1, x2, y2){
  const s = TW.solid; if (!s) return true;
  const dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy), n = Math.ceil(d / 24);
  for (let k = 1; k < n; k++){ const x = x1 + dx * k / n, y = y1 + dy * k / n; if (!twIn(x, y) || s[twCell(x, y)]) return false; }
  return true;
}
function towerWallAhead(e, dx, dy, dist){
  const s = TW.solid; if (!s) return false;
  for (let k = 1; k <= 3; k++){ const x = e.x + dx * dist * k / 3, y = e.y + dy * dist * k / 3; if (!twIn(x, y) || s[twCell(x, y)]) return true; }
  return false;
}
function towerOpenNear(x, y){
  const b = TW.blocked; x = clamp(x, 80, ARENA_W - 80); y = clamp(y, 80, ARENA_H - 80);
  if (!b || !b[twCell(x, y)]) return { x: x, y: y };
  for (let r = 1; r <= 8; r++) for (let k = 0; k < 8; k++){ const a = k * TAU / 8, px = clamp(x + Math.cos(a) * r * TW_NAV, 80, ARENA_W - 80), py = clamp(y + Math.sin(a) * r * TW_NAV, 80, ARENA_H - 80); if (!b[twCell(px, py)]) return { x: px, y: py }; }
  return { x: x, y: y };
}
const TW_NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
/* how many steps every open spot is from her, recomputed whenever she moves to another cell */
function towerFlow(){
  const bl = TW.blocked; if (!bl) return;
  let ci = clamp(P.x / TW_NAV | 0, 0, TW_NX - 1), cj = clamp(P.y / TW_NAV | 0, 0, TW_NY - 1);
  if (bl[cj * TW_NX + ci]){
    let found = false;
    for (let r = 1; r <= 4 && !found; r++) for (let dj = -r; dj <= r && !found; dj++) for (let di = -r; di <= r; di++){ const a = ci + di, b = cj + dj; if (a < 0 || b < 0 || a >= TW_NX || b >= TW_NY || Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; if (!bl[b * TW_NX + a]){ ci = a; cj = b; found = true; break; } }
    if (!found) return;
  }
  const src = cj * TW_NX + ci; if (src === TW.flowAt) return; TW.flowAt = src;
  const dist = TW.dist, q = TW.queue; dist.fill(65535); dist[src] = 0; let h = 0, t = 0; q[t++] = src;
  while (h < t){
    const c = q[h++], i = c % TW_NX, j = (c / TW_NX) | 0, dc = dist[c] + 1;
    for (let k = 0; k < 8; k++){
      const a = i + TW_NB[k][0], b = j + TW_NB[k][1]; if (a < 0 || b < 0 || a >= TW_NX || b >= TW_NY) continue;
      const m = b * TW_NX + a; if (bl[m] || dist[m] <= dc) continue;
      if (k >= 4 && (bl[j * TW_NX + a] || bl[b * TW_NX + i])) continue;               /* no cutting a corner */
      dist[m] = dc; q[t++] = m;
    }
  }
}
/* the way a creature should head, round the walls: null means "straight at her" */
function towerSteer(e, tx, ty, dt){
  if (!TW.dist) return null;
  if (e.navT > 0){ e.navT -= dt; return e.navV || null; }
  e.navT = 0.07 + Math.random() * 0.06; e.navV = null;
  const bl = TW.blocked, dist = TW.dist;
  if (towerSightBlocked(e.x, e.y, tx, ty) === false) return null;                       /* it can see its target: no detour */
  let ci = clamp(e.x / TW_NAV | 0, 0, TW_NX - 1), cj = clamp(e.y / TW_NAV | 0, 0, TW_NY - 1), cur = cj * TW_NX + ci;
  let tgx = P.x, tgy = P.y;
  for (let step = 0; step < 3; step++){
    const i = cur % TW_NX, j = (cur / TW_NX) | 0; let best = -1, bd = dist[cur];
    for (let k = 0; k < 8; k++){
      const a = i + TW_NB[k][0], b = j + TW_NB[k][1]; if (a < 0 || b < 0 || a >= TW_NX || b >= TW_NY) continue;
      const m = b * TW_NX + a, dm = dist[m]; if (dm >= bd || dm === 65535) continue;
      if (k >= 4 && (bl[j * TW_NX + a] || bl[b * TW_NX + i])) continue;
      bd = dm; best = m;
    }
    if (best < 0) break;
    cur = best; tgx = (cur % TW_NX + 0.5) * TW_NAV; tgy = (((cur / TW_NX) | 0) + 0.5) * TW_NAV;
    if (dist[cur] === 0){ tgx = P.x; tgy = P.y; break; }
  }
  const dx = tgx - e.x, dy = tgy - e.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1) return null;
  return e.navV = [dx / d, dy / d];
}
/* the same sight test on the padded map: a straight line that does not skim a wall's corner */
function towerSightBlocked(x1, y1, x2, y2){
  const bl = TW.blocked, dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy), n = Math.ceil(d / 25);
  for (let k = 2; k < n; k++){ const x = x1 + dx * k / n, y = y1 + dy * k / n; if (!twIn(x, y) || bl[twCell(x, y)]) return true; }
  return false;
}
/* where something new comes in: one of the floor's vents, out of her sight and off the screen */
function towerSpawnPoint(){
  const f = TW.floor; if (!f || !f.vents.length) return null;
  const viewR = hyp(G.W / G.zoom, G.H / G.zoom) * 0.5 + 80, far = [];
  for (let i = 0; i < f.vents.length; i++){ const v = f.vents[i]; if (hyp(v.x - P.x, v.y - P.y) > viewR * 0.9) far.push(v); }
  const v = far.length ? far[Math.floor(Math.random() * far.length)] : f.vents.slice().sort((a, b) => hyp(b.x - P.x, b.y - P.y) - hyp(a.x - P.x, a.y - P.y))[0];
  return towerOpenNear(v.x + rand(-50, 50), v.y + rand(-50, 50));
}

/* ---- the lift ---- */
function towerInLift(){
  const l = TW.floor && TW.floor.lift; if (!l) return false;
  return P.x > l.zx && P.x < l.zx + 2 * TW_U && P.y > l.zy && P.y < l.zy + 2 * TW_U;
}
/* called every frame while a floor is cleared: the lift is open, and walking into it starts the ride */
function towerLiftTick(dt){
  if (!TW.open){ TW.open = true; addText(P.x, P.y - 70, 'The lift is open', '#9AE8FF', 18, true); SFX.level(); }
  if (!TW.ride && towerInLift() && !P.dead){ TW.ride = { t: 0, from: chapterWaveOf(G.wave), swapped: false, px: P.x, py: P.y }; SFX.whoosh(); }
}
function towerRideTick(dt){
  const r = TW.ride; if (!r) return;
  r.t += dt; P.vx = P.vy = 0; P.invuln = Math.max(P.invuln, 0.5);
  if (!r.swapped){ P.x = r.px; P.y = r.py; }
  if (r.t > TW_RIDE.out) addShake(2.4);
  if (!r.swapped && r.t >= TW_RIDE.swap){
    r.swapped = true; marsClearAllies(); startWave(G.wave + 1);
    r.px = P.x; r.py = P.y; G.waveTimer = WAVE_INTRO_S + (TW_RIDE.end - r.t); SFX.click();
  } else if (r.swapped){ P.x = r.px; P.y = r.py; }
  if (r.t >= TW_RIDE.end) TW.ride = null;
}
/* the black-out, the floor counter and the lift's own sounds, over the whole screen */
function towerRideDraw(ctx){
  const r = TW.ride; if (!r) return;
  const a = r.t < TW_RIDE.out ? r.t / TW_RIDE.out : r.t > TW_RIDE.back ? 1 - (r.t - TW_RIDE.back) / (TW_RIDE.end - TW_RIDE.back) : 1;
  if (a <= 0) return;
  ctx.fillStyle = 'rgba(6,8,12,' + clamp(a, 0, 1).toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H);
  const from = r.from, to = Math.min(TOWER_WAVES, from + 1), prog = clamp((r.t - TW_RIDE.out) / (TW_RIDE.back - TW_RIDE.out), 0, 1), cur = prog < 0.5 ? from : to;
  ctx.globalAlpha = clamp(a * 1.4, 0, 1); ctx.textAlign = 'center';
  const sz = Math.min(120, Math.max(48, G.W * 0.12)), cy = G.H * 0.45;
  ctx.fillStyle = 'rgba(30,40,56,.9)'; ctx.fillRect(G.W / 2 - sz * 1.1, cy - sz * 0.85, sz * 2.2, sz * 1.5);
  ctx.strokeStyle = '#8CA2B2'; ctx.lineWidth = 3; ctx.strokeRect(G.W / 2 - sz * 1.1, cy - sz * 0.85, sz * 2.2, sz * 1.5);
  ctx.font = '900 ' + sz + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif'; ctx.fillStyle = '#9AE8FF'; ctx.shadowColor = '#4FC8F0'; ctx.shadowBlur = 18;
  ctx.fillText(String(cur), G.W / 2, cy + sz * 0.3); ctx.shadowBlur = 0;
  ctx.font = '700 ' + Math.max(13, sz * 0.2) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillStyle = '#B8C6E8';
  ctx.fillText(prog < 0.5 ? 'GOING UP' : (TW.floor ? TW.floor.name.toUpperCase() : ''), G.W / 2, cy + sz * 0.95);
  const arrow = ((r.t * 3) % 1); ctx.fillStyle = '#9AE8FF'; for (let k = 0; k < 3; k++){ ctx.globalAlpha = clamp(a, 0, 1) * (0.25 + 0.75 * ((arrow + k / 3) % 1)); ctx.beginPath(); const ay = cy - sz * 0.7 - k * 6; ctx.moveTo(G.W / 2 - 10, ay + 2); ctx.lineTo(G.W / 2, ay - 8); ctx.lineTo(G.W / 2 + 10, ay + 2); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
const towerBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){ towerBaseOverlays.apply(this, arguments); if (G.tower) towerRideDraw(ctx); };
/* a drawn wall for the walls and the furniture (the city's own drawBuilding skips indestructible ones) */
const towerBaseDrawBuilding = drawBuilding;
drawBuilding = function(ctx, b){ if (b.tower) return; return towerBaseDrawBuilding.apply(this, arguments); };

/* ================== drawing the floor ================== */
const TW_KINDS = {
  lobby:     { floor: '#D9CDB4', alt: '#CFC2A6', line: '#B8A67E', wall: '#9A8A66', top: '#CDBB92', trim: '#C8A850', glass: true,  rug: '#8A2A2A' },
  mail:      { floor: '#A8A290', alt: '#9C9684', line: '#7E7868', wall: '#6A6658', top: '#8E8A78', trim: '#E8C23A', hazard: true },
  steel:     { floor: '#7C828C', alt: '#737984', line: '#5A606A', wall: '#454A54', top: '#6A7080', trim: '#E8C23A', hazard: true },
  carpet:    { floor: '#7A8498', alt: '#737D91', line: '#68728A', wall: '#B8BEC8', top: '#E0E4EC', trim: '#5A6478', glass: true,  rug: '#4A5A78' },
  marble:    { floor: '#E4E2DC', alt: '#D8D6D0', line: '#B8B6AE', wall: '#7E8090', top: '#B4B6C4', trim: '#C8A850', glass: true,  rug: '#5A2A4A' },
  tile:      { floor: '#E8E2D4', alt: '#C8C0AE', line: '#B0AA9A', wall: '#8A9098', top: '#C0C6CE', trim: '#5A7A9A' },
  server:    { floor: '#2E3646', alt: '#283040', line: '#1E2634', wall: '#161C28', top: '#3A4A60', trim: '#4FC8F0', led: true },
  lab:       { floor: '#D8E8E4', alt: '#CCDDD8', line: '#A8C4BE', wall: '#7A9490', top: '#C4DCD8', trim: '#6AE0A0', glass: true },
  vault:     { floor: '#8A7E68', alt: '#7E725C', line: '#6A5E48', wall: '#3E3A2E', top: '#6E6850', trim: '#C8A850', hazard: true },
  wood:      { floor: '#9A7448', alt: '#8E6A40', line: '#74542C', wall: '#4A3420', top: '#7A5A38', trim: '#C8A850', rug: '#6A2A2A' },
  penthouse: { floor: '#2A2A34', alt: '#22222C', line: '#C8A850', wall: '#101018', top: '#3A3A4A', trim: '#C8A850', glass: true, rug: '#6A1A2A' }
};
function twPattern(kind){
  if (TW.cache[kind]) return TW.cache[kind];
  const K = TW_KINDS[kind] || TW_KINDS.carpet, S = 200, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); if (!g) return null;
  g.fillStyle = K.floor; g.fillRect(0, 0, S, S);
  const rn = twRnd(kind.length * 31 + kind.charCodeAt(0));
  if (kind === 'carpet' || kind === 'penthouse'){ for (let i = 0; i < 900; i++){ g.fillStyle = rn() > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)'; g.fillRect(rn() * S, rn() * S, 2 + rn() * 3, 1 + rn() * 2); } if (kind === 'penthouse'){ g.strokeStyle = 'rgba(200,168,80,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, S - 2, S - 2); } }
  else if (kind === 'wood'){ for (let j = 0; j < 4; j++){ g.fillStyle = j % 2 ? K.alt : K.floor; g.fillRect(0, j * 50, S, 50); g.strokeStyle = K.line; g.lineWidth = 2; g.beginPath(); g.moveTo(0, j * 50); g.lineTo(S, j * 50); g.moveTo(((j * 71) % 200), j * 50); g.lineTo(((j * 71) % 200), j * 50 + 50); g.stroke(); for (let k = 0; k < 8; k++){ g.strokeStyle = 'rgba(60,30,10,.18)'; g.lineWidth = 1; g.beginPath(); const y = j * 50 + 6 + rn() * 38; g.moveTo(rn() * 40, y); g.lineTo(60 + rn() * 140, y + (rn() - 0.5) * 4); g.stroke(); } } }
  else if (kind === 'tile' || kind === 'lab'){ for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ g.fillStyle = (i + j) % 2 ? K.alt : K.floor; g.fillRect(i * 50, j * 50, 50, 50); } g.strokeStyle = K.line; g.lineWidth = 1.5; for (let i = 0; i <= 4; i++){ g.beginPath(); g.moveTo(i * 50, 0); g.lineTo(i * 50, S); g.moveTo(0, i * 50); g.lineTo(S, i * 50); g.stroke(); } }
  else if (kind === 'marble' || kind === 'lobby'){ g.fillStyle = K.alt; g.fillRect(0, 0, 100, 100); g.fillRect(100, 100, 100, 100); g.strokeStyle = K.line; g.lineWidth = 2; g.strokeRect(1, 1, 98, 98); g.strokeRect(101, 101, 98, 98); g.strokeRect(101, 1, 98, 98); g.strokeRect(1, 101, 98, 98);
    for (let k = 0; k < 14; k++){ g.strokeStyle = 'rgba(120,120,140,' + (0.1 + rn() * 0.12).toFixed(2) + ')'; g.lineWidth = 1 + rn(); g.beginPath(); let x = rn() * S, y = rn() * S; g.moveTo(x, y); for (let q = 0; q < 4; q++){ x += (rn() - 0.3) * 40; y += (rn() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); } }
  else if (kind === 'server'){ for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ g.fillStyle = (i + j) % 2 ? K.alt : K.floor; g.fillRect(i * 50 + 1, j * 50 + 1, 48, 48); for (let q = 0; q < 3; q++){ g.fillStyle = 'rgba(79,200,240,.14)'; g.fillRect(i * 50 + 10, j * 50 + 12 + q * 10, 30, 3); } } g.strokeStyle = 'rgba(79,200,240,.2)'; g.lineWidth = 1; for (let i = 0; i <= 4; i++){ g.beginPath(); g.moveTo(i * 50, 0); g.lineTo(i * 50, S); g.moveTo(0, i * 50); g.lineTo(S, i * 50); g.stroke(); } }
  else { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){ g.fillStyle = (i + j) % 2 ? K.alt : K.floor; g.fillRect(i * 100, j * 100, 100, 100); } g.strokeStyle = K.line; g.lineWidth = 2; g.beginPath(); g.moveTo(100, 0); g.lineTo(100, S); g.moveTo(0, 100); g.lineTo(S, 100); g.stroke(); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){ for (const [ox, oy] of [[8, 8], [92, 8], [8, 92], [92, 92]]) g.fillRect(i * 100 + ox - 1.5, j * 100 + oy - 1.5, 3, 3); } for (let i = 0; i < 300; i++){ g.fillStyle = rn() > 0.5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.1)'; g.fillRect(rn() * S, rn() * S, 1 + rn() * 2, 1 + rn() * 2); } }
  return TW.cache[kind] = (CTX && CTX.createPattern ? CTX.createPattern(c, 'repeat') : null) || K.floor;
}
/* the things on the floor that are only pictures: a rug in the middle of a room with nothing in it, lamps, a mat at every doorway */
function towerDecor(f){
  const out = { rugs: [], lamps: [], mats: [], seed: f.n };
  f.rooms.forEach(r => {
    const K = TW_KINDS[r.kind] || TW_KINDS.carpet, boxes = f.boxes.filter(b => b.room === r.id);
    if (K.rug && r.w >= 1200 && r.h >= 900 && !boxes.length) out.rugs.push({ x: r.x + r.w / 2 - 330, y: r.y + r.h / 2 - 210, w: 660, h: 420, c: K.rug });
    out.lamps.push({ x: r.x + r.w * 0.5, y: r.y + r.h * 0.5, r: Math.min(r.w, r.h) * 0.55 });
  });
  f.doors.forEach(d => { if (d.full) return; out.mats.push(d.v ? { x: d.x - 30, y: d.y + 10, w: 60, h: d.h - 20 } : { x: d.x + 10, y: d.y - 30, w: d.w - 20, h: 60 }); });
  TW.decor = out;
}
function drawGroundTower(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  let f = TW.floor;
  if (!f){ if (!TW.preview) TW.preview = twBuildPlan(1); f = TW.preview; if (!TW.previewDecor){ const keep = TW.decor; towerDecor(f); TW.previewDecor = TW.decor; TW.decor = keep; } }
  const decor = f === TW.preview ? TW.previewDecor : TW.decor;
  ctx.fillStyle = '#0A0C12'; ctx.fillRect(x0 - 400, y0 - 400, vw + 800, vh + 800);                                       /* beyond the building: night */
  for (let i = 0; i < f.rooms.length; i++){                                                                                /* the floor of each room */
    const r = f.rooms[i]; if (r.x > x1 || r.x + r.w < x0 || r.y > y1 || r.y + r.h < y0) continue;
    const K = TW_KINDS[r.kind] || TW_KINDS.carpet;
    ctx.fillStyle = twPattern(r.kind) || K.floor; ctx.fillRect(r.x, r.y, r.w, r.h);
    if (K.trim && (r.kind === 'lobby' || r.kind === 'marble' || r.kind === 'penthouse' || r.kind === 'wood')){ ctx.strokeStyle = K.trim; ctx.globalAlpha = 0.55; ctx.lineWidth = 5; ctx.strokeRect(r.x + 56, r.y + 56, r.w - 112, r.h - 112); ctx.globalAlpha = 1; }
  }
  if (decor){
    for (let i = 0; i < decor.rugs.length; i++){ const g = decor.rugs[i]; if (g.x > x1 || g.x + g.w < x0 || g.y > y1 || g.y + g.h < y0) continue; ctx.fillStyle = g.c; ctx.globalAlpha = 0.85; ctx.fillRect(g.x, g.y, g.w, g.h); ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(232,200,120,.7)'; ctx.lineWidth = 5; ctx.strokeRect(g.x + 22, g.y + 22, g.w - 44, g.h - 44); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.strokeRect(g.x + 34, g.y + 34, g.w - 68, g.h - 68); }
    for (let i = 0; i < decor.mats.length; i++){ const m = decor.mats[i]; if (m.x > x1 || m.x + m.w < x0 || m.y > y1 || m.y + m.h < y0) continue; ctx.fillStyle = 'rgba(30,34,44,.55)'; ctx.fillRect(m.x, m.y, m.w, m.h); ctx.strokeStyle = 'rgba(232,194,58,.55)'; ctx.lineWidth = 3; ctx.strokeRect(m.x + 3, m.y + 3, m.w - 6, m.h - 6); }
  }
  for (let i = 0; i < f.boxes.length; i++){ const b = f.boxes[i]; if (b.x > x1 || b.x + b.w < x0 || b.y > y1 || b.y + b.h < y0) continue; twDrawBox(ctx, b, f, t); }
  towerDrawLifts(ctx, f, t, x0, y0, x1, y1);
  for (let i = 0; i < f.walls.length; i++){ const w = f.walls[i]; if (w.x > x1 || w.x + w.w < x0 || w.y > y1 || w.y + w.h < y0) continue; twDrawWall(ctx, w, f, t, x0, y0, x1, y1); }
  for (let i = 0; i < f.doors.length; i++){ const d = f.doors[i]; if (d.full || d.x > x1 + 100 || d.x + d.w < x0 - 100 || d.y > y1 + 100 || d.y + d.h < y0 - 100) continue; twDrawDoor(ctx, d, f, t); }
  if (decor){ ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < decor.lamps.length; i++){ const l = decor.lamps[i]; if (l.x + l.r < x0 || l.x - l.r > x1 || l.y + l.r < y0 || l.y - l.r > y1) continue; const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); g.addColorStop(0, 'rgba(255,240,200,.07)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); } ctx.globalCompositeOperation = 'source-over'; }
}
function twRoomKind(f, x, y){ for (let i = 0; i < f.rooms.length; i++){ const r = f.rooms[i]; if (x >= r.x - 40 && x <= r.x + r.w + 40 && y >= r.y - 40 && y <= r.y + r.h + 40) return r.kind; } return f.kind; }
function twDrawWall(ctx, w, f, t, vx0, vy0, vx1, vy1){
  const K = TW_KINDS[twRoomKind(f, w.x + w.w / 2, w.y + w.h / 2)] || TW_KINDS.carpet, horiz = w.w >= w.h;
  ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.fillRect(w.x + 8, w.y + 12, w.w, w.h);                                          /* the shadow it throws on the floor */
  ctx.fillStyle = K.wall; ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.fillStyle = K.top; if (horiz) ctx.fillRect(w.x, w.y, w.w, w.h * 0.34); else ctx.fillRect(w.x, w.y, w.w * 0.34, w.h);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; if (horiz) ctx.fillRect(w.x, w.y + w.h * 0.8, w.w, w.h * 0.2); else ctx.fillRect(w.x + w.w * 0.8, w.y, w.w * 0.2, w.h);
  if (K.glass){                                                                                                           /* glass panels set in the wall, with mullions */
    const len = horiz ? w.w : w.h, n = Math.floor((len - 90) / 190);
    for (let k = 0; k < n; k++){ const o = 50 + k * ((len - 100) / n) + 8, L = (len - 100) / n - 22;
      if (horiz){ if (w.x + o > vx1 || w.x + o + L < vx0) continue; ctx.fillStyle = 'rgba(150,215,235,.7)'; ctx.fillRect(w.x + o, w.y + w.h * 0.22, L, w.h * 0.5); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(w.x + o + 4, w.y + w.h * 0.26, L * 0.35, w.h * 0.1); ctx.fillStyle = K.top; ctx.fillRect(w.x + o + L, w.y + w.h * 0.18, 8, w.h * 0.58); }
      else { if (w.y + o > vy1 || w.y + o + L < vy0) continue; ctx.fillStyle = 'rgba(150,215,235,.7)'; ctx.fillRect(w.x + w.w * 0.22, w.y + o, w.w * 0.5, L); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(w.x + w.w * 0.26, w.y + o + 4, w.w * 0.1, L * 0.35); ctx.fillStyle = K.top; ctx.fillRect(w.x + w.w * 0.18, w.y + o + L, w.w * 0.58, 8); }
    }
  } else if (K.hazard){ ctx.save(); ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip(); ctx.fillStyle = K.trim; const len = horiz ? w.w : w.h; for (let k = -2; k < len / 40; k += 2){ ctx.beginPath(); if (horiz){ ctx.moveTo(w.x + k * 40, w.y + w.h); ctx.lineTo(w.x + k * 40 + 20, w.y + w.h); ctx.lineTo(w.x + k * 40 + 40, w.y + w.h * 0.62); ctx.lineTo(w.x + k * 40 + 20, w.y + w.h * 0.62); } else { ctx.moveTo(w.x + w.w, w.y + k * 40); ctx.lineTo(w.x + w.w, w.y + k * 40 + 20); ctx.lineTo(w.x + w.w * 0.62, w.y + k * 40 + 40); ctx.lineTo(w.x + w.w * 0.62, w.y + k * 40 + 20); } ctx.fill(); } ctx.restore(); }
  if (K.led && Math.max(w.w, w.h) > 200){ const len = horiz ? w.w : w.h; for (let k = 0; k < len / 70; k++){ const on = Math.sin(t * 2 + k * 1.7 + w.x * 0.01) > 0; ctx.fillStyle = on ? '#4FC8F0' : '#1E4A60'; if (horiz) ctx.fillRect(w.x + 20 + k * 70, w.y + w.h * 0.46, 8, 6); else ctx.fillRect(w.x + w.w * 0.46, w.y + 20 + k * 70, 6, 8); } }
  if (K.trim && !K.hazard){ ctx.fillStyle = K.trim; ctx.globalAlpha = 0.75; if (horiz) ctx.fillRect(w.x, w.y + w.h * 0.34, w.w, 3); else ctx.fillRect(w.x + w.w * 0.34, w.y, 3, w.h); ctx.globalAlpha = 1; }
}
function twDrawDoor(ctx, d, f, t){
  const K = TW_KINDS[twRoomKind(f, d.x, d.y)] || TW_KINDS.carpet;
  const post = (x, y) => { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - 17, y - 15, 44, 44); ctx.fillStyle = '#4A5260'; ctx.fillRect(x - 22, y - 22, 44, 44); ctx.fillStyle = '#8CA2B2'; ctx.fillRect(x - 22, y - 22, 44, 14); ctx.fillStyle = K.trim; ctx.fillRect(x - 6, y - 6, 12, 12); };
  if (d.v){ post(d.x, d.y); post(d.x, d.y + d.h); ctx.fillStyle = 'rgba(160,230,255,.35)'; ctx.fillRect(d.x - 4, d.y + 20, 8, 20); ctx.fillRect(d.x - 4, d.y + d.h - 40, 8, 20); }
  else { post(d.x, d.y); post(d.x + d.w, d.y); ctx.fillStyle = 'rgba(160,230,255,.35)'; ctx.fillRect(d.x + 20, d.y - 4, 20, 8); ctx.fillRect(d.x + d.w - 40, d.y - 4, 20, 8); }
}
/* furniture, from above, by kind */
function twDrawBox(ctx, b, f, t){
  const x = b.x, y = b.y, w = b.w, h = b.h, k = b.k;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x + 7, y + 10, w, h);
  if (k === 'pillar'){ ctx.fillStyle = '#6A6E7E'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9AA0B2'; ctx.fillRect(x, y, w, h * 0.3); ctx.fillStyle = '#C8A850'; ctx.fillRect(x - 4, y - 4, w + 8, 6); ctx.fillRect(x - 4, y + h - 2, w + 8, 6); return; }
  if (k === 'desk'){ ctx.fillStyle = '#8A6A44'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#A8845A'; ctx.fillRect(x, y, w, h * 0.3); ctx.fillStyle = '#1E2430'; ctx.fillRect(x + w * 0.5 - 22, y + 6, 44, 26); ctx.fillStyle = Math.sin(t * 0.7 + x * 0.01) > 0 ? '#6AB8E8' : '#4A8AB8'; ctx.fillRect(x + w * 0.5 - 18, y + 9, 36, 17); ctx.fillStyle = '#D8DCE4'; ctx.fillRect(x + w * 0.5 - 20, y + h - 22, 40, 10); ctx.fillStyle = '#E8E4D8'; ctx.fillRect(x + 8, y + h * 0.42, 18, 12); ctx.fillRect(x + w - 30, y + h * 0.4, 20, 14); ctx.fillStyle = '#3A4A5A'; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h + 10, 13, 0, TAU); ctx.fill(); return; }
  if (k === 'table'){ ctx.fillStyle = '#7A5A3A'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9A7A52'; ctx.fillRect(x + 6, y + 6, w - 12, h - 12); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + 6, y + 6, w - 12, 10); const n = Math.max(2, Math.floor(w / 90)); ctx.fillStyle = '#E8E4D8'; for (let i = 0; i < n; i++){ ctx.fillRect(x + 20 + i * (w - 60) / n, y + 14, 30, 20); ctx.fillRect(x + 20 + i * (w - 60) / n, y + h - 30, 30, 18); } return; }
  if (k === 'rack'){ ctx.fillStyle = '#0E1218'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#2A3446'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); const n = Math.floor(h / 22); for (let i = 0; i < n; i++){ ctx.fillStyle = '#161C28'; ctx.fillRect(x + 8, y + 8 + i * 22, w - 16, 16); const on = Math.sin(t * 3 + i * 1.3 + y * 0.01 + x * 0.02) > 0; ctx.fillStyle = on ? '#6AFFB0' : '#1E4A38'; ctx.fillRect(x + 12, y + 13 + i * 22, 6, 5); ctx.fillStyle = Math.sin(t * 2.2 + i * 2.1 + x) > 0.3 ? '#FFB84A' : '#4A3A1E'; ctx.fillRect(x + 22, y + 13 + i * 22, 6, 5); } return; }
  if (k === 'shelf'){ ctx.fillStyle = '#5A5A62'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7A7A84'; ctx.fillRect(x, y, w, h * 0.3); const n = Math.floor(w / 46); for (let i = 0; i < n; i++){ ctx.fillStyle = ['#B8925A', '#C8A870', '#A8823E', '#D8C090'][(i * 7 + Math.floor(x / 150)) % 4]; ctx.fillRect(x + 6 + i * 46, y + 4, 36, h - 8); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 6 + i * 46, y + 4, 36, 4); } return; }
  if (k === 'belt'){ ctx.fillStyle = '#3A3E48'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#22262E'; ctx.fillRect(x + 6, y + 8, w - 12, h - 16); ctx.strokeStyle = '#4A505C'; ctx.lineWidth = 3; const off = (t * 60) % 30; for (let q = -30 + off; q < w; q += 30){ if (q > 6 && q < w - 6){ ctx.beginPath(); ctx.moveTo(x + q, y + 8); ctx.lineTo(x + q, y + h - 8); ctx.stroke(); } } ctx.fillStyle = '#C8A06A'; const bx = ((t * 60 + x) % (w + 60)) - 30; if (bx > 0 && bx < w - 36){ ctx.fillRect(x + bx, y + 12, 34, h - 24); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + bx, y + 12, 34, 6); } ctx.fillStyle = '#E8C23A'; ctx.fillRect(x, y, w, 5); ctx.fillRect(x, y + h - 5, w, 5); return; }
  if (k === 'planter'){ ctx.fillStyle = '#5A4A3A'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#6A5A48'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); for (let i = 0; i < 9; i++){ const a = i * 0.9 + x * 0.01; ctx.fillStyle = ['#4A8A3A', '#5AA044', '#3A7A2E'][i % 3]; ctx.beginPath(); ctx.arc(x + w / 2 + Math.cos(a) * w * 0.22 + Math.sin(t * 0.8 + i) * 1.5, y + h / 2 + Math.sin(a) * h * 0.22, w * 0.2, 0, TAU); ctx.fill(); } return; }
  if (k === 'sofa'){ ctx.fillStyle = '#4A3A6A'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#6A5A8A'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); ctx.fillStyle = '#3A2E54'; ctx.fillRect(x, y, w, h * 0.3); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 1; i < 3; i++) ctx.fillRect(x + i * w / 3 - 1, y + 4, 2, h - 8); return; }
  if (k === 'counter'){ ctx.fillStyle = '#9A9AA8'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#C8CAD4'; ctx.fillRect(x, y, w, h * 0.36); ctx.fillStyle = '#4A4A58'; for (let i = 0; i < Math.floor(Math.max(w, h) / 80); i++){ if (w > h) ctx.fillRect(x + 20 + i * 80, y + h * 0.5, 36, 12); else ctx.fillRect(x + w * 0.4, y + 20 + i * 80, 12, 36); } return; }
  if (k === 'tank'){ ctx.fillStyle = '#4A5A5A'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.58, 0, TAU); ctx.fill(); const g = ctx.createRadialGradient(x + w * 0.4, y + h * 0.4, 4, x + w / 2, y + h / 2, w * 0.5); g.addColorStop(0, '#CFFFD8'); g.addColorStop(1, '#3AB868'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.46, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.46, 0, TAU); ctx.stroke(); for (let i = 0; i < 5; i++){ const ph = (t * 0.6 + i * 0.21 + x * 0.001) % 1; ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - ph)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x + w / 2 + Math.sin(i * 2.3) * w * 0.2, y + h * 0.7 - ph * h * 0.4, 2.5, 0, TAU); ctx.fill(); } return; }
  if (k === 'safe'){ ctx.fillStyle = '#4A4E58'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#6A707C'; ctx.fillRect(x + 6, y + 6, w - 12, h - 12); ctx.fillStyle = '#8A909C'; ctx.fillRect(x + 6, y + 6, w - 12, 12); const cx = x + w / 2, cy = y + h / 2; ctx.fillStyle = '#C8A850'; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#2A2E38'; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.13, 0, TAU); ctx.fill(); ctx.strokeStyle = '#C8A850'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(x) * Math.min(w, h) * 0.12, cy + Math.sin(x) * Math.min(w, h) * 0.12); ctx.stroke(); ctx.strokeStyle = '#8A909C'; ctx.lineWidth = 4; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12); return; }
  ctx.fillStyle = '#6A6E78'; ctx.fillRect(x, y, w, h);
}
/* the two lifts: doors set in the wall, a floor number over them, and a light that goes green when this one is open */
function towerDrawLifts(ctx, f, t, vx0, vy0, vx1, vy1){
  [[f.start, false], [f.lift, true]].forEach(pair => {
    const l = pair[0], isExit = pair[1]; if (l.zx > vx1 || l.zx + 300 < vx0 || l.zy > vy1 || l.zy + 300 < vy0) return;
    const open = isExit ? TW.open : (TW.ride ? TW.ride.t < TW_RIDE.back + 0.4 : (G.waveTimer > 0 || G.runTime < 2.5)), glow = isExit && TW.open ? 0.6 + 0.3 * Math.sin(t * 4) : 0;
    ctx.save();
    ctx.fillStyle = isExit && TW.open ? 'rgba(120,240,200,.2)' : 'rgba(180,200,220,.14)'; ctx.fillRect(l.zx, l.zy, 300, 300);                                  /* the lift's own bit of floor */
    ctx.strokeStyle = isExit && TW.open ? 'rgba(154,232,255,' + (0.5 + 0.3 * Math.sin(t * 5)).toFixed(2) + ')' : 'rgba(200,214,230,.5)'; ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeRect(l.zx + 6, l.zy + 6, 288, 288); ctx.setLineDash([]);
    const fx = l.side === 'n' ? l.zx : l.side === 's' ? l.zx : l.side === 'w' ? l.zx - 18 : l.zx + 300 - 10, fy = l.side === 'n' ? l.zy - 18 : l.side === 's' ? l.zy + 300 - 10 : l.zy, fw = (l.side === 'n' || l.side === 's') ? 300 : 28, fh = (l.side === 'n' || l.side === 's') ? 28 : 300;
    ctx.fillStyle = '#22262E'; ctx.fillRect(fx - 6, fy - 6, fw + 12, fh + 12);
    ctx.fillStyle = open ? '#0E1620' : '#8A94A2'; ctx.fillRect(fx, fy, fw, fh);
    if (open){ ctx.fillStyle = 'rgba(200,236,255,' + (0.35 + glow * 0.4).toFixed(2) + ')'; ctx.fillRect(fx + 4, fy + 4, fw - 8, fh - 8); ctx.fillStyle = '#6A7280'; const vert = fw > fh; if (vert){ ctx.fillRect(fx, fy, 22, fh); ctx.fillRect(fx + fw - 22, fy, 22, fh); } else { ctx.fillRect(fx, fy, fw, 22); ctx.fillRect(fx, fy + fh - 22, fw, 22); } }
    else { ctx.fillStyle = '#B4BCC8'; if (fw > fh){ ctx.fillRect(fx + 2, fy + 2, fw / 2 - 4, fh - 4); ctx.fillRect(fx + fw / 2 + 2, fy + 2, fw / 2 - 4, fh - 4); ctx.fillStyle = '#6A7280'; ctx.fillRect(fx + fw / 2 - 1, fy, 2, fh); } else { ctx.fillRect(fx + 2, fy + 2, fw - 4, fh / 2 - 4); ctx.fillRect(fx + 2, fy + fh / 2 + 2, fw - 4, fh / 2 - 4); ctx.fillStyle = '#6A7280'; ctx.fillRect(fx, fy + fh / 2 - 1, fw, 2); } }
    const lx = fx + fw / 2, ly = fy + fh / 2, off = l.side === 'n' ? [0, -34] : l.side === 's' ? [0, 34] : l.side === 'w' ? [-34, 0] : [34, 0];
    ctx.fillStyle = '#10141C'; ctx.fillRect(lx + off[0] - 22, ly + off[1] - 14, 44, 28); ctx.fillStyle = isExit ? (TW.open ? '#6AFFB0' : '#FF6A5A') : '#9AE8FF'; ctx.font = '900 20px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(isExit ? Math.min(TOWER_WAVES, f.n + 1) : f.n), lx + off[0], ly + off[1] + 7); ctx.textAlign = 'left';
    if (glow){ csGlow(ctx, l.zx + 150, l.zy + 150, 260, '#7AF0C8', 0.18 * glow); }
    ctx.restore();
  });
}
