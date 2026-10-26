'use strict';
/* Buildings (chapter 6) and the Space Center (chapter 7). */
/* ========================= BUILDINGS (Chapter 6) ========================= */
/* Houston's buildings are solid: the giraffe, its ants and every ground
   creature have to go around them (flyers pass overhead). Kicks, projectiles
   and blasts all chip at them, and once one takes enough damage it collapses
   into rubble that can be walked over. Tanks crush straight through them. */
const CITY_BLOCK = 350;
/* Buildings take full damage from kicks (a deliberate demolition takes a
   while early on, far less once the cards stack up), half from projectiles,
   and only a fraction from blasts -- area attacks tuned to fight Houston's
   enemies would otherwise flatten the whole city within a minute. */
const BUILDING_HP_MUL = 1.3;
const BUILDING_DMG_TAKEN = { kick: 1, proj: 0.5, shock: 0.15, crush: 1 };
function seededRand(seed){ let s = seed % 233280; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function makeBuilding(x, y, w, h, style, seed){
  const r = seededRand(seed);
  const b = { x: x, y: y, w: w, h: h, style: style, hp: 0, maxHp: Math.round((300 + w * h / 35) * BUILDING_HP_MUL),
    collapsed: false, flash: 0, units: [], cracks: [], rubble: [] };
  b.hp = b.maxHp;
  const n = 2 + Math.floor(r() * 4);                  /* rooftop AC units and vents */
  for (let i = 0; i < n; i++) b.units.push({ x: x + 14 + r() * (w - 44), y: y + 14 + r() * (h - 40), w: 14 + r() * 16, h: 10 + r() * 12, round: r() < 0.3 });
  for (let i = 0; i < 7; i++){                        /* cracks, revealed as it takes damage */
    const pts = [x + r() * w, y + r() * h];
    for (let k = 0; k < 3; k++) pts.push(pts[pts.length - 2] + (r() - 0.5) * 40, pts[pts.length - 1] + (r() - 0.5) * 40);
    b.cracks.push(pts);
  }
  const cols = ['#6E6A62', '#8A847A', '#5A5650', '#9A9288', '#4A4640'];
  for (let i = 0; i < Math.round(w * h / 900); i++)   /* the rubble pile it becomes */
    b.rubble.push({ x: x + r() * w, y: y + r() * h, s: 5 + r() * 12, rot: r() * TAU, c: cols[Math.floor(r() * cols.length)] });
  return b;
}
function buildCityBuildings(){
  G.buildings = [];
  const styles = ['office', 'brick', 'garage', 'tower'];
  const avoid = [{ x: ARENA_W / 2, y: ARENA_H / 2, r: 330 }, { x: P.x, y: P.y, r: 260 }];
  if (G.water) avoid.push({ x: G.water.x, y: G.water.y, r: G.water.r * 1.15 + 50 });
  let seed = 1;
  for (let bx = 0; bx + CITY_BLOCK <= ARENA_W + 1; bx += CITY_BLOCK){
    for (let by = 0; by + CITY_BLOCK <= ARENA_H + 1; by += CITY_BLOCK){
      seed++;
      if (Math.random() < 0.22) continue;             /* empty lots and plazas */
      const w = rand(140, 225), h = rand(130, 220);
      const x = bx + (CITY_BLOCK - w) / 2 + rand(-12, 12), y = by + (CITY_BLOCK - h) / 2 + rand(-12, 12);
      let ok = true;
      for (let i = 0; i < avoid.length; i++){
        const a = avoid[i], nx = clamp(a.x, x, x + w), ny = clamp(a.y, y, y + h);
        if (hyp(a.x - nx, a.y - ny) < a.r){ ok = false; break; }
      }
      if (ok) G.buildings.push(makeBuilding(x, y, w, h, styles[Math.floor(Math.random() * styles.length)], seed * 7919 + Math.floor(Math.random() * 1000)));
    }
  }
}
function buildingAt(x, y){
  const bs = G.buildings;
  if (!bs) return null;
  for (let i = 0; i < bs.length; i++){ const b = bs[i]; if (!b.collapsed && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; }
  return null;
}
/* push a circle out of any standing building; returns the building it hit, if any */
function resolveBuildings(o, r){
  const bs = G.buildings;
  if (!bs || !bs.length) return null;
  let hit = null;
  for (let i = 0; i < bs.length; i++){
    const b = bs[i];
    if (b.collapsed) continue;
    if (o.x + r < b.x || o.x - r > b.x + b.w || o.y + r < b.y || o.y - r > b.y + b.h) continue;      /* most buildings are nowhere near: no arithmetic for them */
    const nx = o.x < b.x ? b.x : o.x > b.x + b.w ? b.x + b.w : o.x, ny = o.y < b.y ? b.y : o.y > b.y + b.h ? b.y + b.h : o.y;
    const dx = o.x - nx, dy = o.y - ny, d2 = dx * dx + dy * dy;
    if (d2 >= r * r) continue;
    if (d2 > 1e-6){ const d = Math.sqrt(d2); o.x = nx + dx / d * r; o.y = ny + dy / d * r; }
    else {
      const l = o.x - b.x, rr = b.x + b.w - o.x, t = o.y - b.y, bt = b.y + b.h - o.y, m = Math.min(l, rr, t, bt);
      if (m === l) o.x = b.x - r; else if (m === rr) o.x = b.x + b.w + r; else if (m === t) o.y = b.y - r; else o.y = b.y + b.h + r;
    }
    hit = b;
  }
  return hit;
}
function damageBuilding(b, amt, src){
  if (!b || b.collapsed || !(amt > 0)) return;
  if (b.indestructible){ deflectSpark(b, src); return; }   /* the rocket and its tower take no damage at all */
  amt *= BUILDING_DMG_TAKEN[src] === undefined ? 1 : BUILDING_DMG_TAKEN[src];
  /* no single blast or shot can take more than 5% of a building: fighting
     near one wears it down over time, but area cards can't level the city */
  if (src === 'shock' || src === 'proj') amt = Math.min(amt, b.maxHp * 0.05);
  if (G.bldStats) G.bldStats[src || '?'] = (G.bldStats[src || '?'] || 0) + Math.min(amt, b.hp);
  b.hp -= amt; b.flash = 0.1;
  if (Math.random() < 0.5) addParticle(clamp(P.x, b.x, b.x + b.w), clamp(P.y, b.y, b.y + b.h), rand(-40, 40), rand(-40, 40), rand(2, 4), 0.5, '#9A9288', { drag: 2 });
  if (b.hp <= 0) collapseBuilding(b);
}
function collapseBuilding(b){
  if (b.collapsed) return;
  b.collapsed = true; b.hp = 0;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  for (let i = 0; i < 6; i++) burstParticles(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 8, '#A89E90', 220, 6);
  /* the collapse itself batters anything standing close by (but never
     knocks down a neighboring building, so there are no chain reactions) */
  addShock(cx, cy, Math.max(b.w, b.h) * 0.7, 0.45, b.maxHp * 0.5, '#B8AE9E', { width: 20, kb: 240, filled: true });
  G.shocks[G.shocks.length - 1].noBuildings = true;
  addShake(12); sfx('boom', 0.1);
  G.score += b.maxHp * 10;
  addText(cx, cy - 20, 'Building down!', '#E8D8B8', 18, true);
}
function updateBuildings(dt){
  const bs = G.buildings;
  if (!bs) return;
  for (let i = 0; i < bs.length; i++) if (bs[i].flash > 0) bs[i].flash -= dt;
}
const BUILDING_ROOFS = {
  office: { roof: '#5E6E7E', edge: '#3E4A56', detail: '#8AA2B8' },
  brick:  { roof: '#8A4A36', edge: '#5A2E22', detail: '#A8644A' },
  garage: { roof: '#8C8C88', edge: '#5E5E5A', detail: '#E8D84A' },
  tower:  { roof: '#3E4A5A', edge: '#222A34', detail: '#E8E8E0' }
};
function drawBuilding(ctx, b){
  if (b.indestructible) return;   /* the launch mount and tower are painted with the launch pad */
  if (b.collapsed){
    ctx.fillStyle = 'rgba(120,110,98,.35)';
    ctx.fillRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
    for (let i = 0; i < b.rubble.length; i++){
      const r = b.rubble[i];
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
      ctx.fillStyle = r.c; ctx.fillRect(-r.s / 2, -r.s / 3, r.s, r.s * 0.66);
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(120,70,40,.8)'; ctx.lineWidth = 1.4;   /* bent rebar */
    ctx.beginPath();
    for (let i = 0; i < 4; i++){ const r = b.rubble[i * 3 % b.rubble.length]; ctx.moveTo(r.x, r.y); ctx.quadraticCurveTo(r.x + 10, r.y - 8, r.x + 18, r.y + 4); }
    ctx.stroke();
    return;
  }
  const st = BUILDING_ROOFS[b.style] || BUILDING_ROOFS.office;
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(b.x + 12, b.y + 14, b.w, b.h);   /* cast shadow */
  ctx.fillStyle = st.roof; ctx.fillRect(b.x, b.y, b.w, b.h);
  if (b.style === 'office'){                        /* glass curtain-wall grid */
    ctx.strokeStyle = 'rgba(160,190,215,.35)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = b.x + 14; x < b.x + b.w; x += 16){ ctx.moveTo(x, b.y + 6); ctx.lineTo(x, b.y + b.h - 6); }
    for (let y = b.y + 14; y < b.y + b.h; y += 16){ ctx.moveTo(b.x + 6, y); ctx.lineTo(b.x + b.w - 6, y); }
    ctx.stroke();
  } else if (b.style === 'garage'){                 /* parking-deck stripes */
    ctx.strokeStyle = st.detail; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let x = b.x + 18; x < b.x + b.w - 10; x += 18){ ctx.moveTo(x, b.y + 10); ctx.lineTo(x, b.y + b.h * 0.38); ctx.moveTo(x, b.y + b.h * 0.62); ctx.lineTo(x, b.y + b.h - 10); }
    ctx.stroke();
  } else if (b.style === 'tower'){                  /* helipad */
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rr = Math.min(b.w, b.h) * 0.28;
    ctx.strokeStyle = st.detail; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(cx - rr * 0.4, cy - rr * 0.5); ctx.lineTo(cx - rr * 0.4, cy + rr * 0.5);
    ctx.moveTo(cx + rr * 0.4, cy - rr * 0.5); ctx.lineTo(cx + rr * 0.4, cy + rr * 0.5);
    ctx.moveTo(cx - rr * 0.4, cy); ctx.lineTo(cx + rr * 0.4, cy); ctx.stroke();
  }
  if (SPACE_ROOF_STYLES[b.style]) drawSpaceRoof(ctx, b, st);
  if (b.style !== 'tower' && !SPACE_ROOF_STYLES[b.style]){
    for (let i = 0; i < b.units.length; i++){
      const u = b.units[i];
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(u.x + 3, u.y + 3, u.w, u.h);
      ctx.fillStyle = '#B8B8B0';
      if (u.round){ ctx.beginPath(); ctx.arc(u.x + u.w / 2, u.y + u.h / 2, u.h / 2, 0, TAU); ctx.fill(); }
      else { ctx.fillRect(u.x, u.y, u.w, u.h); ctx.strokeStyle = '#7A7A74'; ctx.lineWidth = 1; ctx.strokeRect(u.x, u.y, u.w, u.h); }
    }
  }
  ctx.strokeStyle = st.edge; ctx.lineWidth = 5;     /* parapet */
  ctx.strokeRect(b.x + 2.5, b.y + 2.5, b.w - 5, b.h - 5);
  const dmg = 1 - b.hp / b.maxHp;
  if (dmg > 0.2){                                   /* cracks spread as it takes damage */
    const shown = Math.min(b.cracks.length, Math.ceil((dmg - 0.2) / 0.8 * b.cracks.length));
    ctx.strokeStyle = 'rgba(20,16,12,.75)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < shown; i++){ const c = b.cracks[i]; ctx.beginPath(); ctx.moveTo(c[0], c[1]); for (let k = 2; k < c.length; k += 2) ctx.lineTo(c[k], c[k + 1]); ctx.stroke(); }
  }
  if (b.flash > 0){ ctx.fillStyle = 'rgba(255,255,255,' + (b.flash * 3).toFixed(2) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  if (dmg > 0 && dmg < 1){                           /* a thin health bar once it's been hit */
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(b.x + 8, b.y - 10, b.w - 16, 5);
    ctx.fillStyle = '#E8B84A'; ctx.fillRect(b.x + 8, b.y - 10, (b.w - 16) * (1 - dmg), 5);
  }
}

/* ---- Chapter 6 ground: an evacuated Houston street grid, seen from above ---- */
let groundPatternCity = null;
function buildGroundCity(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#6A6862'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++){
    g.fillStyle = ['#5E5C56', '#76746C', '#626058', '#7E7C74'][(Math.random() * 4) | 0];
    g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 2);
  }
  g.strokeStyle = 'rgba(40,38,34,.35)'; g.lineWidth = 1;   /* sidewalk slab joints */
  g.beginPath(); for (let k = 0; k <= 128; k += 32){ g.moveTo(k, 0); g.lineTo(k, 128); g.moveTo(0, k); g.lineTo(128, k); } g.stroke();
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternCity = ctx.createPattern(c, 'repeat');
}
function buildCityPaper(){
  G.cityPaper = [];
  for (let i = 0; i < 26; i++)
    G.cityPaper.push({ x: rand(0, 1600), y: rand(0, 900), s: rand(3, 6), spd: rand(20, 50), par: rand(0.05, 0.2), ph: Math.random() * TAU });
}
function drawGroundCity(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = groundPatternCity || '#6A6862';
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  /* streets run along the block edges, with a dashed yellow center line */
  const RW = 110;
  ctx.fillStyle = '#2E2E32';
  for (let gx = 0; gx <= ARENA_W; gx += CITY_BLOCK) if (gx + RW > x0 && gx - RW < x0 + vw) ctx.fillRect(gx - RW / 2, y0 - 40, RW, vh + 80);
  for (let gy = 0; gy <= ARENA_H; gy += CITY_BLOCK) if (gy + RW > y0 && gy - RW < y0 + vh) ctx.fillRect(x0 - 40, gy - RW / 2, vw + 80, RW);
  /* A dash pattern starts wherever its line starts, so lines that begin at the
     screen edge make the dashes crawl along with the camera. Start every line
     on a multiple of the dash period instead, so each dash sits at a fixed spot
     in the world and the giraffe simply walks past it. */
  const DASH = 18, GAP = 16, PERIOD = DASH + GAP;
  ctx.strokeStyle = '#D8B84A'; ctx.lineWidth = 2.4; ctx.setLineDash && ctx.setLineDash([DASH, GAP]);
  const ys = Math.floor((y0 - 40) / PERIOD) * PERIOD, xs = Math.floor((x0 - 40) / PERIOD) * PERIOD;
  ctx.beginPath();
  for (let gx = 0; gx <= ARENA_W; gx += CITY_BLOCK){ ctx.moveTo(gx, ys); ctx.lineTo(gx, y0 + vh + 40); }
  for (let gy = 0; gy <= ARENA_H; gy += CITY_BLOCK){ ctx.moveTo(xs, gy); ctx.lineTo(x0 + vw + 40, gy); }
  ctx.stroke();
  ctx.setLineDash && ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(240,240,232,.55)';          /* crosswalks at every intersection */
  for (let gx = 0; gx <= ARENA_W; gx += CITY_BLOCK) for (let gy = 0; gy <= ARENA_H; gy += CITY_BLOCK){
    if (gx < x0 - 120 || gx > x0 + vw + 120 || gy < y0 - 120 || gy > y0 + vh + 120) continue;
    for (let k = -3; k <= 3; k++){
      ctx.fillRect(gx - RW / 2 - 16, gy + k * 13 - 4, 12, 8); ctx.fillRect(gx + RW / 2 + 4, gy + k * 13 - 4, 12, 8);
      ctx.fillRect(gx + k * 13 - 4, gy - RW / 2 - 16, 8, 12); ctx.fillRect(gx + k * 13 - 4, gy + RW / 2 + 4, 8, 12);
    }
    fillCircle(ctx, gx + 30, gy + 30, 7, '#3A3A3A');   /* manhole */
  }
  /* a flooded bayou channel where the watering hole used to be */
  const w = G.water;
  if (w && w.x > x0 - w.r - 60 && w.x < x0 + vw + w.r + 60 && w.y > y0 - w.r - 60 && w.y < y0 + vh + w.r + 60){
    ctx.fillStyle = '#8A8880'; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3E4A3A'; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(160,190,150,.18)'; ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
  }
  /* decor: abandoned cars, street trees in planters, blown litter */
  const dl = G.decor;
  for (let i = 0; i < dl.length; i++){
    const d = dl[i];
    if (d.x < x0 - 80 || d.x > x0 + vw + 80 || d.y < y0 - 80 || d.y > y0 + vh + 80 || buildingAt(d.x, d.y)) continue;
    if (d.type === 'rock'){
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.s, d.s);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-15, -7, 32, 17);
      ctx.fillStyle = ['#A83A2E', '#3A5A8A', '#D8D2C4', '#4A4A4A'][i % 4]; ctx.fillRect(-16, -8, 32, 16);
      ctx.fillStyle = 'rgba(160,200,220,.7)'; ctx.fillRect(4, -6, 6, 12); ctx.fillRect(-11, -6, 5, 12);
      ctx.restore();
    } else if (d.type === 'tree'){
      ctx.fillStyle = '#8A8478'; ctx.fillRect(d.x - 10 * d.s, d.y - 10 * d.s, 20 * d.s, 20 * d.s);
      fillCircle(ctx, d.x + 5, d.y + 6, 22 * d.s, 'rgba(0,0,0,.25)');
      fillCircle(ctx, d.x, d.y, 22 * d.s, '#4E6B2E'); fillCircle(ctx, d.x - 6 * d.s, d.y - 6 * d.s, 13 * d.s, '#5E7A34');
    } else {
      ctx.fillStyle = 'rgba(232,228,216,.8)';
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.fillRect(-5 * d.s, -3.5 * d.s, 10 * d.s, 7 * d.s); ctx.restore();
    }
  }
  /* buildings go last so they sit above everything on the ground */
  const bs = G.buildings;
  if (bs) for (let i = 0; i < bs.length; i++){
    const b = bs[i];
    if (b.x + b.w + 20 < x0 || b.x - 20 > x0 + vw || b.y + b.h + 20 < y0 || b.y - 20 > y0 + vh) continue;
    drawBuilding(ctx, b);
  }
  ctx.strokeStyle = 'rgba(10,10,12,.9)'; ctx.lineWidth = 10;
  ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.fillStyle = '#121214';
  const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);
  /* ambient: loose sheets of paper tumbling down the empty streets */
  if (!G.cityPaper) buildCityPaper();
  ctx.fillStyle = 'rgba(240,236,224,.75)';
  for (let i = 0; i < G.cityPaper.length; i++){
    const f = G.cityPaper[i];
    const px = ((f.x + G.time * f.spd + cx * f.par) % (vw + 80)) + x0 - 40;
    const py = ((f.y + Math.sin(G.time + f.ph) * 20) % (vh + 80)) + y0 - 40;
    ctx.save(); ctx.translate(px, py); ctx.rotate(G.time * 2 + f.ph); ctx.fillRect(-f.s, -f.s * 0.7, f.s * 2, f.s * 1.4); ctx.restore();
  }
}

let menuCityBuildings = null;
function menuCityPreviewBuildings(cx, cy){
  if (!menuCityBuildings) menuCityBuildings = [makeBuilding(cx + 70, cy - 195, 130, 95, 'office', 11), makeBuilding(cx - 220, cy + 70, 105, 120, 'brick', 23)];
  return menuCityBuildings;
}

/* ========================= SPACE CENTER (Chapter 7) ========================= */
/* A campus of white-roofed buildings and roads around a launch complex. The
   rocket on its pad cannot be destroyed: it and its service tower are solid
   "buildings" flagged indestructible, so the giraffe, ants and ground units
   must go round them, and shots are stopped by them, but nothing hurts them.
   Every other building can be knocked down exactly as in Houston. */
const SPACE_CELL = 400;
const SPACE_ROOF_STYLES = { mission: 1, lab: 1, hangar: 1, vab: 1 };
Object.assign(BUILDING_ROOFS, {
  mission: { roof: '#C8CCD2', edge: '#7C8590', detail: '#E8ECF2' },
  lab:     { roof: '#B4C4D4', edge: '#6A7A8C', detail: '#1E3A6A' },
  hangar:  { roof: '#D8D8D2', edge: '#8A8A84', detail: '#2F5AA8' },
  vab:     { roof: '#E8E8E4', edge: '#9A9A96', detail: '#1F4FA8' }
});
/* Geometry of the launch complex, all relative to the mount center (rk.x, rk.y)
   and scaled by rk.s (1 in play, smaller in the menu preview). */
function rocketGeom(rk){
  const s = rk.s || 1;
  return { s: s,
    mount: { x: rk.x - 52 * s, y: rk.y - 52 * s, w: 104 * s, h: 104 * s },
    tower: { x: rk.x - 140 * s, y: rk.y - 40 * s, w: 46 * s, h: 84 * s },
    towerH: 310 * s, rocketH: 372 * s, padHalf: 170 * s, padCy: rk.y - 50 * s };
}
function makeIndestructible(r){
  return { x: r.x, y: r.y, w: r.w, h: r.h, style: 'launch', hp: 1, maxHp: 1, collapsed: false, flash: 0,
    indestructible: true, units: [], cracks: [], rubble: [] };
}
function buildSpaceCenter(){
  G.buildings = [];
  const rk = { x: 1800, y: 650, s: 1 };
  G.rocket = rk;
  const g = rocketGeom(rk);
  G.buildings.push(makeIndestructible(g.mount), makeIndestructible(g.tower));
  const styles = ['mission', 'lab', 'hangar', 'lab', 'mission', 'vab', 'hangar'];
  const avoid = [{ x: ARENA_W / 2, y: ARENA_H / 2, r: 260 }, { x: P.x, y: P.y, r: 260 }];
  if (G.water) avoid.push({ x: G.water.x, y: G.water.y, r: G.water.r * 1.15 + 50 });
  let seed = 100;
  for (let ci = 0; ci * SPACE_CELL < ARENA_W; ci++){
    for (let cj = 0; cj * SPACE_CELL < ARENA_H; cj++){
      seed++;
      if (ci === 4 && cj === 1) continue;              /* the launch complex fills this block */
      if (Math.random() < 0.16) continue;              /* an empty lawn */
      const style = styles[Math.floor(Math.random() * styles.length)];
      const big = style === 'vab';
      const w = big ? rand(230, 285) : rand(150, 240), h = big ? rand(215, 260) : rand(140, 225);
      const x0 = ci * SPACE_CELL, y0 = cj * SPACE_CELL;
      const x = clamp(x0 + (SPACE_CELL - w) / 2 + rand(-10, 10), x0 + 58, x0 + SPACE_CELL - 58 - w);
      const y = clamp(y0 + (SPACE_CELL - h) / 2 + rand(-10, 10), y0 + 58, y0 + SPACE_CELL - 58 - h);
      let ok = true;
      for (let i = 0; i < avoid.length; i++){
        const a = avoid[i], nx = clamp(a.x, x, x + w), ny = clamp(a.y, y, y + h);
        if (hyp(a.x - nx, a.y - ny) < a.r){ ok = false; break; }
      }
      if (ok) G.buildings.push(makeBuilding(x, y, w, h, style, seed * 7919 + Math.floor(Math.random() * 1000)));
    }
  }
}
/* sparks and a throttled "clink" when something hits the rocket or its tower */
function deflectSpark(b, src){
  if (G.time < (b.sparkT || 0)) return;
  b.sparkT = G.time + 0.12;
  const x = clamp(P.x, b.x, b.x + b.w), y = clamp(P.y, b.y, b.y + b.h);
  burstParticles(x, y, 5, '#FFE9A0', 200, 2.4, { glow: true });
  sfx('hit', 0.12);
  if (!(G.time < (G.rocketNoteT || 0))){ G.rocketNoteT = G.time + 1.6; addText(x, y - 16, 'Indestructible', '#C8D0E0', 13, true); }
}
function drawSpaceRoof(ctx, b, st){
  const x = b.x, y = b.y, w = b.w, h = b.h;
  if (b.style === 'lab'){                                   /* rooftop solar arrays */
    for (let px = x + 14; px + 26 < x + w - 10; px += 29) for (let py = y + 16; py + 18 < y + h - 12; py += 22){
      ctx.fillStyle = st.detail; ctx.fillRect(px, py, 26, 18);
      ctx.strokeStyle = 'rgba(160,190,235,.55)'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(px + 13, py); ctx.lineTo(px + 13, py + 18); ctx.moveTo(px, py + 9); ctx.lineTo(px + 26, py + 9); ctx.stroke();
    }
  } else if (b.style === 'hangar'){                         /* arched roof ribs and a blue band */
    ctx.fillStyle = 'rgba(0,0,0,.06)';
    for (let px = x + 8; px < x + w - 8; px += 28) ctx.fillRect(px, y + 6, 14, h - 12);
    ctx.strokeStyle = 'rgba(90,90,86,.55)'; ctx.lineWidth = 1.4; ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w / 2, y + h - 4); ctx.stroke();
    ctx.fillStyle = st.detail; ctx.fillRect(x + 4, y + 4, w - 8, 10);
  } else if (b.style === 'vab'){                            /* the big assembly building with its emblem */
    ctx.strokeStyle = 'rgba(120,120,116,.4)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let py = y + 18; py < y + h - 8; py += 16){ ctx.moveTo(x + 8, py); ctx.lineTo(x + w - 8, py); }
    ctx.stroke();
    const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.24;
    ctx.fillStyle = st.detail; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.86, r * 0.32, -0.5, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#E8402E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - r * 0.7, cy + r * 0.5); ctx.quadraticCurveTo(cx, cy - r * 0.3, cx + r * 0.7, cy - r * 0.55); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 7; k++) fillCircle(ctx, cx + Math.cos(k * 2.4) * r * 0.6, cy + Math.sin(k * 2.4) * r * 0.5 - 2, 1, '#FFFFFF');
  } else {                                                  /* mission-control style: dish and equipment */
    const dx = x + w * 0.68, dy = y + h * 0.42, dr = Math.min(w, h) * 0.17;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(dx + 4, dy + 5, dr, 0, TAU); ctx.fill();
    ctx.fillStyle = '#F2F4F8'; ctx.beginPath(); ctx.arc(dx, dy, dr, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#9AA2AE'; ctx.lineWidth = 1.2;
    for (let k = 1; k <= 3; k++){ ctx.beginPath(); ctx.arc(dx, dy, dr * k / 3.4, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx - dr * 0.9, dy - dr * 0.9); ctx.stroke(); fillCircle(ctx, dx - dr * 0.9, dy - dr * 0.9, 2.4, '#6A7280');
    for (let i = 0; i < b.units.length; i++){
      const u = b.units[i]; if (hyp(u.x - dx, u.y - dy) < dr + 16) continue;
      ctx.fillStyle = '#A8B0BC'; ctx.fillRect(u.x, u.y, u.w, u.h); ctx.strokeStyle = '#6E7682'; ctx.lineWidth = 1; ctx.strokeRect(u.x, u.y, u.w, u.h);
    }
  }
}
let groundPatternSpace = null;
function buildGroundSpace(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#5F7F3C'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++){
    g.fillStyle = ['#557336', '#6B8C45', '#5A7A38', '#729450'][(Math.random() * 4) | 0];
    g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 2 + Math.random() * 3);
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternSpace = ctx.createPattern(c, 'repeat');
}
function drawLaunchPad(ctx){
  const rk = G.rocket;
  if (!rk) return;
  const g = rocketGeom(rk), s = g.s, cx = rk.x, cy = g.padCy, hp = g.padHalf;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(cx - hp + 8 * s, cy - hp + 10 * s, hp * 2, hp * 2);
  ctx.fillStyle = '#B9B7B0'; ctx.fillRect(cx - hp, cy - hp, hp * 2, hp * 2);   /* the concrete pad */
  ctx.strokeStyle = 'rgba(70,68,62,.35)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = -hp + 34 * s; k < hp; k += 34 * s){ ctx.moveTo(cx + k, cy - hp); ctx.lineTo(cx + k, cy + hp); ctx.moveTo(cx - hp, cy + k); ctx.lineTo(cx + hp, cy + k); }
  ctx.stroke();
  ctx.strokeStyle = '#E8C020'; ctx.lineWidth = 9 * s; ctx.strokeRect(cx - hp + 5 * s, cy - hp + 5 * s, hp * 2 - 10 * s, hp * 2 - 10 * s);   /* hazard border */
  if (ctx.setLineDash){ ctx.setLineDash([13 * s, 13 * s]); ctx.strokeStyle = '#1A1A1A'; ctx.strokeRect(cx - hp + 5 * s, cy - hp + 5 * s, hp * 2 - 10 * s, hp * 2 - 10 * s); ctx.setLineDash([]); }
  ctx.fillStyle = '#2A2A2E'; ctx.fillRect(cx - 62 * s, rk.y - 8 * s, 124 * s, 122 * s);   /* the flame trench */
  ctx.fillStyle = '#3A3A40'; ctx.fillRect(cx - 50 * s, rk.y + 6 * s, 100 * s, 100 * s);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.2; ctx.strokeRect(cx - 62 * s, rk.y - 8 * s, 124 * s, 122 * s);
  const m = g.mount, t = g.tower;
  ctx.fillStyle = '#3E424A'; ctx.fillRect(m.x, m.y, m.w, m.h);                              /* the launch mount */
  ctx.strokeStyle = '#8A909C'; ctx.lineWidth = 2 * s; ctx.strokeRect(m.x + 3 * s, m.y + 3 * s, m.w - 6 * s, m.h - 6 * s);
  for (const [bx, by] of [[m.x + 10 * s, m.y + 10 * s], [m.x + m.w - 10 * s, m.y + 10 * s], [m.x + 10 * s, m.y + m.h - 10 * s], [m.x + m.w - 10 * s, m.y + m.h - 10 * s]]) fillCircle(ctx, bx, by, 3.4 * s, '#B8BEC8');
  ctx.fillStyle = '#4A4E56'; ctx.fillRect(t.x - 4 * s, t.y - 4 * s, t.w + 8 * s, t.h + 8 * s);   /* the tower's footing */
  /* long shadows cast down and to the right, under everything that walks */
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  ctx.beginPath(); ctx.moveTo(rk.x - 22 * s, rk.y); ctx.lineTo(rk.x + 22 * s, rk.y); ctx.lineTo(rk.x + 22 * s + 210 * s, rk.y + 118 * s); ctx.lineTo(rk.x - 22 * s + 210 * s, rk.y + 118 * s); ctx.closePath(); ctx.fill();
  const tx = t.x + t.w / 2, ty = t.y + t.h;
  ctx.beginPath(); ctx.moveTo(tx - 20 * s, ty); ctx.lineTo(tx + 20 * s, ty); ctx.lineTo(tx + 20 * s + 180 * s, ty + 100 * s); ctx.lineTo(tx - 20 * s + 180 * s, ty + 100 * s); ctx.closePath(); ctx.fill();
}
function drawGroundSpace(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = groundPatternSpace || '#5F7F3C';
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  const RW = 100;
  ctx.fillStyle = '#A9A79E';                                   /* pavements along every road */
  for (let gx = 0; gx <= ARENA_W; gx += SPACE_CELL) if (gx + RW > x0 && gx - RW < x0 + vw) ctx.fillRect(gx - RW / 2 - 12, y0 - 40, RW + 24, vh + 80);
  for (let gy = 0; gy <= ARENA_H; gy += SPACE_CELL) if (gy + RW > y0 && gy - RW < y0 + vh) ctx.fillRect(x0 - 40, gy - RW / 2 - 12, vw + 80, RW + 24);
  ctx.fillStyle = '#3A3C40';
  for (let gx = 0; gx <= ARENA_W; gx += SPACE_CELL) if (gx + RW > x0 && gx - RW < x0 + vw) ctx.fillRect(gx - RW / 2, y0 - 40, RW, vh + 80);
  for (let gy = 0; gy <= ARENA_H; gy += SPACE_CELL) if (gy + RW > y0 && gy - RW < y0 + vh) ctx.fillRect(x0 - 40, gy - RW / 2, vw + 80, RW);
  /* dashed center lines, started on a multiple of the dash period so the dashes
     stay put in the world instead of crawling along with the camera */
  const DASH = 20, GAP = 18, PERIOD = DASH + GAP;
  ctx.strokeStyle = '#F0F0E8'; ctx.lineWidth = 2.4; ctx.setLineDash && ctx.setLineDash([DASH, GAP]);
  const ys = Math.floor((y0 - 40) / PERIOD) * PERIOD, xs = Math.floor((x0 - 40) / PERIOD) * PERIOD;
  ctx.beginPath();
  for (let gx = 0; gx <= ARENA_W; gx += SPACE_CELL){ ctx.moveTo(gx, ys); ctx.lineTo(gx, y0 + vh + 40); }
  for (let gy = 0; gy <= ARENA_H; gy += SPACE_CELL){ ctx.moveTo(xs, gy); ctx.lineTo(x0 + vw + 40, gy); }
  ctx.stroke();
  ctx.setLineDash && ctx.setLineDash([]);
  const w = G.water;                                           /* a retention pond, as on the real campus */
  if (w && w.x > x0 - w.r - 60 && w.x < x0 + vw + w.r + 60 && w.y > y0 - w.r - 60 && w.y < y0 + vh + w.r + 60){
    ctx.fillStyle = '#B4B2A8'; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.1, w.r * 0.85, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3F6E8A'; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(190,225,240,.22)'; ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
  }
  const dl = G.decor;
  for (let i = 0; i < dl.length; i++){
    const d = dl[i];
    if (d.x < x0 - 80 || d.x > x0 + vw + 80 || d.y < y0 - 80 || d.y > y0 + vh + 80 || buildingAt(d.x, d.y)) continue;
    if (d.type === 'rock'){                                    /* white utility carts */
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.s, d.s);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-11, -6, 24, 14);
      ctx.fillStyle = '#ECECE8'; ctx.fillRect(-12, -7, 24, 13);
      ctx.fillStyle = '#2F5AA8'; ctx.fillRect(-12, -7, 24, 3.4);
      ctx.fillStyle = 'rgba(120,170,200,.7)'; ctx.fillRect(-2, -3, 8, 8);
      ctx.restore();
    } else if (d.type === 'tree'){
      fillCircle(ctx, d.x + 5, d.y + 6, 24 * d.s, 'rgba(0,0,0,.25)');
      fillCircle(ctx, d.x, d.y, 24 * d.s, '#3F6A2C'); fillCircle(ctx, d.x - 6 * d.s, d.y - 6 * d.s, 14 * d.s, '#528238');
    }
  }
  drawLaunchPad(ctx);
  const bs = G.buildings;
  if (bs) for (let i = 0; i < bs.length; i++){
    const b = bs[i];
    if (b.x + b.w + 20 < x0 || b.x - 20 > x0 + vw || b.y + b.h + 20 < y0 || b.y - 20 > y0 + vh) continue;
    drawBuilding(ctx, b);
  }
  ctx.strokeStyle = 'rgba(10,10,12,.9)'; ctx.lineWidth = 10;
  ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.fillStyle = '#121214';
  const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);
}
/* The standing rocket and its service tower. Drawn after the creatures rather
   than with the ground, so anything walking behind them is properly hidden. */
function drawRocketOverlay(ctx){
  const rk = G.rocket;
  if (!rk) return;
  const g = rocketGeom(rk), s = g.s, bx = rk.x, by = rk.y;
  /* -- service tower -- */
  const tcx = g.tower.x + g.tower.w / 2, tby = g.tower.y + g.tower.h, th = g.towerH, tw = 20 * s;
  ctx.strokeStyle = '#C25A32'; ctx.lineWidth = 3.4 * s;
  ctx.beginPath(); ctx.moveTo(tcx - tw, tby); ctx.lineTo(tcx - tw, tby - th); ctx.moveTo(tcx + tw, tby); ctx.lineTo(tcx + tw, tby - th); ctx.stroke();
  ctx.strokeStyle = '#8A3A20'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
  for (let y = tby; y > tby - th + 20 * s; y -= 26 * s){ ctx.moveTo(tcx - tw, y); ctx.lineTo(tcx + tw, y - 26 * s); ctx.moveTo(tcx + tw, y); ctx.lineTo(tcx - tw, y - 26 * s); }
  ctx.stroke();
  ctx.strokeStyle = '#C25A32'; ctx.lineWidth = 3 * s; ctx.beginPath();
  for (let y = tby - 62 * s; y > tby - th; y -= 62 * s){ ctx.moveTo(tcx - tw - 4 * s, y); ctx.lineTo(tcx + tw + 4 * s, y); }
  ctx.stroke();
  ctx.strokeStyle = '#B8BEC8'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(tcx, tby - th); ctx.lineTo(tcx, tby - th - 26 * s); ctx.stroke();
  if (Math.sin(G.time * 4) > 0) fillCircle(ctx, tcx, tby - th - 26 * s, 3 * s, '#FF3A3A');
  /* -- swing arms reaching the rocket -- */
  ctx.strokeStyle = '#C25A32'; ctx.lineWidth = 3.4 * s; ctx.beginPath();
  for (const h of [120, 200, 270]){ ctx.moveTo(tcx + tw, tby - h * s); ctx.lineTo(bx - 22 * s, by - (h - 40) * s); }
  ctx.stroke();
  /* -- the rocket: three stages, capsule and escape tower -- */
  const half = 22 * s, top = (y) => by - y * s;
  ctx.fillStyle = '#2E3038'; ctx.beginPath(); ctx.moveTo(bx - 18 * s, top(14)); ctx.lineTo(bx - 24 * s, by + 2 * s); ctx.lineTo(bx + 24 * s, by + 2 * s); ctx.lineTo(bx + 18 * s, top(14)); ctx.closePath(); ctx.fill();   /* engine skirt */
  for (let k = -2; k <= 2; k++) fillCircle(ctx, bx + k * 8 * s, by - 1 * s, 3.2 * s, '#15161A');
  ctx.fillStyle = '#8A8C92';                                                                                       /* fins */
  ctx.beginPath(); ctx.moveTo(bx - half, top(16)); ctx.lineTo(bx - 46 * s, by + 4 * s); ctx.lineTo(bx - half, top(62)); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx + half, top(16)); ctx.lineTo(bx + 46 * s, by + 4 * s); ctx.lineTo(bx + half, top(62)); ctx.closePath(); ctx.fill();
  const seg = (y0, y1, col) => { ctx.fillStyle = col; ctx.fillRect(bx - half, top(y1), half * 2, (y1 - y0) * s); };
  seg(14, 150, '#F2F2EE');                                                                                         /* first stage */
  ctx.fillStyle = '#1B1B1F'; ctx.fillRect(bx, top(150), half, 136 * s); ctx.fillRect(bx - half, top(150), half * 2, 12 * s);
  seg(150, 168, '#6A6C72');                                                                                        /* interstage */
  seg(168, 250, '#F2F2EE'); ctx.fillStyle = '#1B1B1F'; ctx.fillRect(bx - half, top(214), half * 2, 12 * s); ctx.fillRect(bx - half, top(250), half * 2, 8 * s);
  seg(250, 300, '#F2F2EE'); ctx.fillStyle = '#1B1B1F'; ctx.fillRect(bx - half, top(300), half * 2, 12 * s);
  ctx.fillStyle = '#C8342A'; ctx.fillRect(bx - half, top(196), half * 2, 4 * s);                                    /* red band */
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(bx + 4 * s, top(300), half - 4 * s, 286 * s);                       /* shading on the far side */
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(bx - half + 2 * s, top(300), 3 * s, 286 * s);                 /* highlight */
  ctx.fillStyle = '#D8D8D4'; ctx.fillRect(bx - 14 * s, top(322), 28 * s, 22 * s);                                  /* service module */
  ctx.fillStyle = '#C8C8C4'; ctx.beginPath(); ctx.moveTo(bx - 14 * s, top(322)); ctx.lineTo(bx, top(346)); ctx.lineTo(bx + 14 * s, top(322)); ctx.closePath(); ctx.fill();   /* capsule */
  ctx.strokeStyle = '#8A8C92'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(bx, top(346)); ctx.lineTo(bx, top(372)); ctx.stroke();                  /* escape tower */
  fillCircle(ctx, bx, top(372), 1.8 * s, '#C8342A');
}

