'use strict';
/* Longneck Town, eleventh part: the flight now covers the Savannah only. */
/* ========================= 44zn. THE SAVANNAH BELOW ========================= */
/* 1 THE WORLD: Longneck Town, then one long Savannah (and, once Chapter 10 is finished, the Changed Savannah in its place). The other chapters
     are no longer part of the flight.
   2 ANIMALS: herds of the Savannah's creatures walk about the ground (hyenas, jackals, cheetahs, warthogs, rhinos, baboons, honey badgers,
     buffalo, elephants, lions, crocodiles; vultures circle, mambas slide). In the Changed Savannah the same animals appear in their changed
     look. They are drawn with the Bestiary's own artwork (drawEnemy), like the photo studio does, and move on a fixed curve of time so they
     need no state.
   3 THE MAP: landmarks (baobabs, kopjes, waterholes, a village, a safari camp, a wind pump, acacia groves; crystals, glowing pools, arches and
     giant mushrooms in the Changed Savannah), small things between them, rivers and ponds in the ground, flocks of birds, and a map of the
     whole flight at the bottom right with the plane, the runway, the rings and the landmarks. */
const SZ_W = 9600;
const SZ_ANIMALS = ['hyena', 'jackal', 'cheetah', 'warthog', 'rhino', 'baboon', 'honeybadger', 'buffalo', 'matriarch', 'lion', 'vulture', 'mamba', 'crocodile'];
function flyRegions(){
  /* the Changed Savannah takes the Savannah's place once Chapter 10 is finished; there is no gateway sign into either */
  const sav = townDoneCh(10) ? { ch: 11, name: FLY_BIOME[11].name, w: SZ_W, noGate: true } : { ch: 1, name: FLY_BIOME[1].name, w: SZ_W, noGate: true };
  const out = [{ ch: 0, name: 'Longneck Town', w: FLY_TOWN_W }, sav];
  let x = 0; out.forEach(function(r){ r.x0 = x; x += r.w; r.x1 = x; });
  return out;
}
/* what she has flown over is kept between flights: one character per 60 units of the strip, in Save.data.town.flymap */
function szLoadSeen(){
  const t = townData(), s = typeof t.flymap === 'string' ? t.flymap : '', o = {};
  for (let i = 0; i < s.length && i < 600; i++) if (s.charAt(i) === '1') o[i] = 1;
  return o;
}
function szSaveSeen(){
  if (!Fly.seen) return;
  const t = townData(), n = Math.ceil(Math.max(Fly.end || 0, 1) / 60), old = typeof t.flymap === 'string' ? t.flymap : '';
  let s = '';
  for (let i = 0; i < Math.max(n, old.length); i++) s += (Fly.seen[i] || old.charAt(i) === '1') ? '1' : '0';
  if (s !== old){ t.flymap = s; Save.write(); }
}
/* ---- the animals ---- */
function szBuildHerd(){
  const herd = [], r = miniRng(townHash('herd' + (Date.now() >> 14)));
  Fly.regions.forEach(function(R){
    if (R.ch !== 1 && R.ch !== 11) return;
    const tab = bestiaryTable(R.ch) || {}, kinds = SZ_ANIMALS.filter(function(k){ return tab[k]; });
    if (!kinds.length) return;
    let x = R.x0 + 260;
    while (x < R.x1 - 260){
      const kind = kinds[Math.floor(r() * kinds.length)], n = kind === 'vulture' ? 2 : 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++){
        herd.push({ ch: R.ch, type: kind, x: x + k * (80 + r() * 50), range: 60 + r() * 180, sp: 0.18 + r() * 0.3, ph: r() * 6.28, row: r() < 0.35 ? 1 : 0, seed: herd.length });
      }
      x += 280 + r() * 420;
    }
  });
  return herd;
}
function szDrawAnimal(ctx, a, t, gy){
  const def = bestiaryTable(a.ch)[a.type]; if (!def) return;
  const phase = t * a.sp + a.ph, wx = a.x + Math.sin(phase) * a.range, dir = Math.cos(phase) >= 0 ? 1 : -1;
  const sc = (a.row ? 0.42 : 0.56) * Math.min(1.2, 30 / def.r + 0.35), r = def.r * sc;
  let y;
  if (a.type === 'vulture') y = gy(wx) - 150 - Math.sin(t * 0.6 + a.ph) * 30 - a.row * 40;
  else y = gy(wx) + (a.row ? 24 : 4) - r * 0.62 + Math.abs(Math.sin(t * 5 * (0.7 + a.sp) + a.ph)) * -2.5;
  const keep = G.particles.length, ss = softShadow; softShadow = function(){};
  if (a.type !== 'vulture') tEll(ctx, 'rgba(0,0,0,.2)', wx, gy(wx) + (a.row ? 24 : 4) + 2, r * 1.0, r * 0.22);
  ctx.save(); ctx.translate(wx, y); ctx.scale(dir * sc, sc);
  const e = { portrait: true, def: def, type: a.type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: t * 5 * (0.7 + a.sp) + a.ph, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 };
  try { drawEnemy(ctx, e); } catch (err) {} finally { softShadow = ss; ctx.restore(); }
  if (G.particles.length > keep) G.particles.length = keep;
}

/* ---- landmarks and small things ---- */
function szLandmark(ctx, kind, x, gy, s, t, ch11, seed){
  const y = gy;
  if (!ch11){
    switch (kind){
      case 0: {                                                                       /* a baobab */
        tRect(ctx, '#7A5A3A', x - 26 * s, y - 120 * s, 52 * s, 120 * s); tEll(ctx, '#7A5A3A', x, y, 36 * s, 8 * s); tRect(ctx, '#6A4A2C', x + 8 * s, y - 120 * s, 18 * s, 120 * s);
        ctx.strokeStyle = '#6A4A2C'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 118 * s); ctx.lineTo(x - 50 * s, y - 150 * s); ctx.moveTo(x + 4 * s, y - 120 * s); ctx.lineTo(x + 6 * s, y - 166 * s); ctx.moveTo(x + 14 * s, y - 118 * s); ctx.lineTo(x + 52 * s, y - 152 * s); ctx.stroke();
        [[-50, -156, 26], [6, -172, 30], [52, -158, 26]].forEach(function(o){ tEll(ctx, '#4F8A44', x + o[0] * s, y + o[1] * s, o[2] * s, o[2] * 0.6 * s); });
        break;
      }
      case 1:                                                                         /* a kopje: stacked boulders */
        tEll(ctx, '#8A7A68', x - 30 * s, y - 20 * s, 48 * s, 26 * s); tEll(ctx, '#9A8A76', x + 24 * s, y - 28 * s, 42 * s, 30 * s); tEll(ctx, '#7A6A58', x - 4 * s, y - 56 * s, 34 * s, 22 * s); tEll(ctx, '#A89884', x + 20 * s, y - 70 * s, 20 * s, 14 * s);
        ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 44 * s); ctx.lineTo(x - 2 * s, y - 20 * s); ctx.stroke();
        tEll(ctx, '#5E8A3A', x - 60 * s, y - 4 * s, 14 * s, 8 * s);
        break;
      case 2:                                                                         /* a waterhole with reeds */
        tEll(ctx, '#7A5A38', x, y + 10, 100 * s, 16 * s); tEll(ctx, '#3A82B8', x, y + 8, 90 * s, 11 * s); tEll(ctx, 'rgba(255,255,255,.35)', x - 20 * s, y + 6, 30 * s, 2.4);
        for (let k = 0; k < 7; k++){ const rx = x - 80 * s + k * 26 * s; ctx.strokeStyle = '#4F8A44'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(rx, y + 6); ctx.lineTo(rx + Math.sin(t * 1.4 + k) * 3, y - (24 + (k % 3) * 8) * s); ctx.stroke(); tRect(ctx, '#7A4A28', rx - 1.5 + Math.sin(t * 1.4 + k) * 3, y - (30 + (k % 3) * 8) * s, 3, 8 * s); }
        break;
      case 3:                                                                         /* a little village of huts */
        for (let k = 0; k < 3; k++){ const hx = x - 60 * s + k * 62 * s; tRect(ctx, '#C9A27A', hx - 20 * s, y - 34 * s, 40 * s, 34 * s); tPoly(ctx, '#B88A52', [hx - 28 * s, y - 34 * s, hx, y - 64 * s, hx + 28 * s, y - 34 * s]); tRect(ctx, '#3A2A1E', hx - 6 * s, y - 22 * s, 12 * s, 22 * s); }
        tRect(ctx, '#5A3B22', x - 80 * s, y - 14 * s, 3 * s, 14 * s); tRect(ctx, '#5A3B22', x + 78 * s, y - 14 * s, 3 * s, 14 * s); tRect(ctx, '#5A3B22', x - 80 * s, y - 12 * s, 160 * s, 2.4 * s);
        { const sm = (t * 20) % 60; tEll(ctx, 'rgba(220,220,220,' + (0.5 - sm / 140).toFixed(2) + ')', x + 2 * s + Math.sin(t) * 4, y - 70 * s - sm, 6 + sm / 8, 5 + sm / 10); }
        break;
      case 4:                                                                         /* a safari camp: tent, jeep, flag */
        tPoly(ctx, '#E8D8B0', [x - 50 * s, y, x - 4 * s, y - 62 * s, x + 4 * s, y - 62 * s, x + 50 * s, y]); tPoly(ctx, '#3A2A1E', [x - 8 * s, y, x, y - 28 * s, x + 8 * s, y]); tRect(ctx, '#5A3B22', x - 1.5, y - 80 * s, 3, 20 * s); tPoly(ctx, '#D5352B', [x + 1.5, y - 80 * s, x + 20 * s, y - 74 * s, x + 1.5, y - 68 * s]);
        tRound(ctx, '#6A8A3E', x + 70 * s, y - 24 * s, 54 * s, 16 * s, 4); tRect(ctx, '#6A8A3E', x + 82 * s, y - 38 * s, 26 * s, 14 * s); tCircle(ctx, '#2A2A34', x + 82 * s, y - 6 * s, 7 * s); tCircle(ctx, '#2A2A34', x + 114 * s, y - 6 * s, 7 * s);
        { const fl = Math.sin(t * 9) * 3; tRect(ctx, '#4A3A28', x - 90 * s, y - 6 * s, 20 * s, 6 * s); tPoly(ctx, '#FF9A3A', [x - 86 * s, y - 6 * s, x - 80 * s, y - 24 * s - fl, x - 74 * s, y - 6 * s]); }
        break;
      case 5:                                                                         /* a wind pump */
        tPoly(ctx, '#6A6F78', [x - 20 * s, y, x - 3 * s, y - 120 * s, x + 3 * s, y - 120 * s, x + 20 * s, y]); ctx.save(); ctx.translate(x, y - 124 * s); ctx.rotate(t * 1.4);
        for (let k = 0; k < 8; k++){ ctx.rotate(Math.PI / 4); tRect(ctx, '#C9CDD9', 0, -2, 40 * s, 4); } ctx.restore(); tCircle(ctx, '#3A3A44', x, y - 124 * s, 5);
        tRect(ctx, '#7A8A98', x + 16 * s, y - 20 * s, 40 * s, 20 * s);
        break;
      default:                                                                        /* a grove of acacias */
        for (let k = 0; k < 3; k++){ const ax = x - 50 * s + k * 50 * s, h = (64 + (k % 2) * 24) * s; tRect(ctx, '#5A3C28', ax - 4 * s, y - h, 8 * s, h); tEll(ctx, '#4F8A44', ax, y - h - 8 * s, 44 * s, 12 * s); tEll(ctx, '#5E9E55', ax + 8 * s, y - h - 14 * s, 28 * s, 8 * s); }
    }
  } else {
    const gl = 0.55 + 0.45 * Math.sin(t * 2.2 + seed);
    switch (kind){
      case 0:                                                                         /* crystals */
        tPoly(ctx, '#C9A0FF', [x - 16 * s, y, x - 6 * s, y - 100 * s, x + 6 * s, y]); tPoly(ctx, '#8AF1FF', [x - 2 * s, y, x + 12 * s, y - 70 * s, x + 26 * s, y]); tPoly(ctx, '#B58CFF', [x + 18 * s, y, x + 30 * s, y - 50 * s, x + 40 * s, y]); tPoly(ctx, '#FFFFFF', [x - 16 * s, y, x - 8 * s, y - 70 * s, x - 10 * s, y]);
        tEll(ctx, 'rgba(180,140,255,' + (0.12 * gl).toFixed(2) + ')', x, y - 30 * s, 70 * s, 50 * s);
        break;
      case 1:                                                                         /* a glowing pool */
        tEll(ctx, '#4A2A7A', x, y + 10, 100 * s, 16 * s); tEll(ctx, 'rgba(120,255,230,' + (0.55 + 0.25 * gl).toFixed(2) + ')', x, y + 8, 88 * s, 11 * s);
        for (let k = 0; k < 5; k++){ const px = x - 60 * s + k * 30 * s, py = y - 6 - ((t * 18 + k * 17) % 40); tCircle(ctx, 'rgba(200,255,250,' + (0.7 - ((t * 18 + k * 17) % 40) / 60).toFixed(2) + ')', px, py, 2.4); }
        break;
      case 2:                                                                         /* a stone arch */
        tRect(ctx, '#8A7AA8', x - 54 * s, y - 100 * s, 24 * s, 100 * s); tRect(ctx, '#8A7AA8', x + 30 * s, y - 100 * s, 24 * s, 100 * s); tRound(ctx, '#9A8AB8', x - 62 * s, y - 124 * s, 124 * s, 34 * s, 16);
        tEll(ctx, 'rgba(200,170,255,' + (0.25 * gl).toFixed(2) + ')', x, y - 50 * s, 30 * s, 50 * s);
        break;
      case 3:                                                                         /* a giant mushroom */
        tRect(ctx, '#E8D8F0', x - 8 * s, y - 70 * s, 16 * s, 70 * s); tEll(ctx, '#B88AF0', x, y - 74 * s, 52 * s, 24 * s); tEll(ctx, '#E8C8FF', x - 12 * s, y - 80 * s, 30 * s, 10 * s);
        for (let k = 0; k < 4; k++) tCircle(ctx, '#FFFFFF', x - 30 * s + k * 20 * s, y - 70 * s - (k % 2) * 8 * s, 4 * s);
        break;
      case 4:                                                                         /* purple trees */
        for (let k = 0; k < 3; k++){ const ax = x - 46 * s + k * 46 * s, h = (62 + (k % 2) * 26) * s; tRect(ctx, '#6A5A8A', ax - 4 * s, y - h, 8 * s, h); tEll(ctx, '#B88AF0', ax, y - h - 8 * s, 40 * s, 14 * s); tEll(ctx, '#D8B0FF', ax + 8 * s, y - h - 14 * s, 24 * s, 8 * s); }
        break;
      default:                                                                        /* a floating rock */
        { const hv = Math.sin(t * 1.1 + seed) * 8; tPoly(ctx, '#7A6A9A', [x - 40 * s, y - 150 * s + hv, x + 40 * s, y - 150 * s + hv, x + 22 * s, y - 120 * s + hv, x, y - 100 * s + hv, x - 22 * s, y - 120 * s + hv]); tEll(ctx, '#7AB04A', x, y - 152 * s + hv, 40 * s, 8 * s); tEll(ctx, 'rgba(180,140,255,.12)', x, y - 60 * s, 30 * s, 60 * s); }
    }
  }
}
function szSmall(ctx, kind, x, gy, s, t, ch11, seed){
  const y = gy;
  switch (kind){
    case 0:                                                                           /* tufts of grass */
      ctx.strokeStyle = ch11 ? '#6AA040' : '#8A7A30'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      for (let k = -2; k <= 2; k++){ ctx.beginPath(); ctx.moveTo(x + k * 3, y); ctx.lineTo(x + k * 5 + Math.sin(t * 1.6 + seed + k) * 3, y - (12 + Math.abs(k) * -2 + 6) * s); ctx.stroke(); }
      break;
    case 1: tEll(ctx, ch11 ? '#7A6A9A' : '#8A7A68', x, y - 6 * s, 14 * s, 8 * s); tEll(ctx, ch11 ? '#8A7AAA' : '#9A8A76', x + 8 * s, y - 4 * s, 8 * s, 5 * s); break;      /* rocks */
    case 2:                                                                           /* a shrub */
      tEll(ctx, ch11 ? '#7A5AB0' : '#5E7A3A', x, y - 10 * s, 22 * s, 12 * s); tEll(ctx, ch11 ? '#9A7AD0' : '#6E8A44', x - 6 * s, y - 14 * s, 14 * s, 8 * s);
      if (ch11) for (let k = 0; k < 3; k++) tCircle(ctx, 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(t * 3 + k + seed)).toFixed(2) + ')', x - 10 * s + k * 10 * s, y - 14 * s, 2);
      break;
    case 3:                                                                           /* a termite mound (or a glowing stump) */
      tPoly(ctx, ch11 ? '#6A5A8A' : '#A0704A', [x - 18 * s, y, x - 8 * s, y - 40 * s, x - 2 * s, y - 52 * s, x + 6 * s, y - 38 * s, x + 18 * s, y]); tPoly(ctx, ch11 ? '#8A7AAA' : '#B88458', [x - 4 * s, y, x, y - 40 * s, x + 18 * s, y]);
      break;
    case 4:                                                                           /* flowers */
      for (let k = 0; k < 4; k++){ const fx = x + (k - 1.5) * 8 * s; ctx.strokeStyle = '#4E8A3A'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx + Math.sin(t + k) * 1.5, y - 12 * s); ctx.stroke(); tCircle(ctx, ch11 ? ['#FF9ECB', '#8AF1FF', '#FFE9A0', '#C9A0FF'][k] : ['#FFD84D', '#FF8A4A', '#FFFFFF', '#F2C230'][k], fx, y - 13 * s, 3 * s); }
      break;
    case 5:                                                                           /* a dead tree */
      ctx.strokeStyle = '#6A5848'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - 50 * s); ctx.moveTo(x + 2, y - 36 * s); ctx.lineTo(x - 18 * s, y - 56 * s); ctx.moveTo(x + 2, y - 44 * s); ctx.lineTo(x + 18 * s, y - 62 * s); ctx.stroke();
      break;
    case 6:                                                                           /* a fence */
      for (let k = 0; k < 4; k++) tRect(ctx, '#5A3B22', x + k * 14 * s, y - 20 * s, 3 * s, 20 * s); tRect(ctx, '#7A5230', x, y - 16 * s, 45 * s, 2.4 * s); tRect(ctx, '#7A5230', x, y - 8 * s, 45 * s, 2.4 * s);
      break;
    case 7:                                                                           /* a skull */
      tEll(ctx, '#E8E0D0', x, y - 7 * s, 11 * s, 7 * s); tPoly(ctx, '#E8E0D0', [x - 9 * s, y - 8 * s, x - 22 * s, y - 20 * s, x - 6 * s, y - 12 * s]); tPoly(ctx, '#E8E0D0', [x + 9 * s, y - 8 * s, x + 22 * s, y - 20 * s, x + 6 * s, y - 12 * s]);
      break;
    default:                                                                          /* a signpost */
      tRect(ctx, '#5A3B22', x - 2, y - 40 * s, 4, 40 * s); tPoly(ctx, '#8A5A32', [x - 26 * s, y - 40 * s, x + 14 * s, y - 40 * s, x + 24 * s, y - 33 * s, x + 14 * s, y - 26 * s, x - 26 * s, y - 26 * s]);
  }
}
(function(){
  const ff = flyFeatures, fgd = flyGroundDetail, ft = flyTakeoff, rf = renderFly, fl0 = flyLand, fc0 = flyCrash, up0 = updateFly;
  flyLand = function(){ szSaveSeen(); return fl0.apply(this, arguments); };
  flyCrash = function(){ szSaveSeen(); return fc0.apply(this, arguments); };
  updateFly = function(dt){ const r = up0.apply(this, arguments); if (Fly.on && (Fly.seenT = (Fly.seenT || 0) + dt) > 6){ Fly.seenT = 0; szSaveSeen(); } return r; };
  flyFeatures = function(ctx, R, cam, vw, t){
    if (R.ch !== 1 && R.ch !== 11) return ff(ctx, R, cam, vw, t);
    const ch11 = R.ch === 11, a = Math.max(R.x0 + 20, cam - 260), b = Math.min(R.x1 - 20, cam + vw + 260);
    /* small things between the landmarks */
    const cell = 70;
    for (let c = Math.floor(a / cell); c <= Math.ceil(b / cell); c++){
      const h = flyH(c, 61); if (h < 0.28) continue;
      const x = c * cell + flyH(c, 62) * cell, kind = Math.floor(flyH(c, 63) * 9);
      szSmall(ctx, kind, x, flyGroundY(x), 0.8 + flyH(c, 64) * 0.7, t, ch11, c);
    }
    /* landmarks: one every ~1000 px, each of a fixed kind */
    const span = 1000, k0 = Math.floor((a - R.x0) / span), k1 = Math.ceil((b - R.x0) / span);
    for (let k = k0; k <= k1; k++){
      if (k < 0) continue;
      const x = R.x0 + k * span + 260 + flyH(k, 70) * 480;
      if (x < R.x0 + 400 || x > R.x1 - 200) continue;
      szLandmark(ctx, Math.floor(flyH(k, 71) * 6), x, flyGroundY(x), 0.9 + flyH(k, 72) * 0.5, t, ch11, k);
    }
    /* birds high up, in a loose flock */
    for (let i = 0; i < 6; i++){
      const bx = a + ((i * 360 + t * (22 + i * 3)) % (b - a + 400)), by = 150 + flyH(i, 80) * 150 + Math.sin(t * 0.8 + i) * 10, fl = Math.sin(t * 9 + i * 2) * 5;
      ctx.strokeStyle = ch11 ? '#4A2A7A' : '#3A2A24'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 9, by - fl); ctx.quadraticCurveTo(bx - 3, by - 3, bx, by); ctx.quadraticCurveTo(bx + 3, by - 3, bx + 9, by - fl); ctx.stroke();
    }
    /* the animals, back row first */
    if (Fly.herd){
      for (let row = 1; row >= 0; row--) for (let i = 0; i < Fly.herd.length; i++){
        const an = Fly.herd[i]; if (an.ch !== R.ch || an.row !== row || an.x + an.range < cam - 160 || an.x - an.range > cam + vw + 160) continue;
        szDrawAnimal(ctx, an, t, flyGroundY);
      }
    }
  };
  flyGroundDetail = function(ctx, R, B, x0, x1, t){
    fgd(ctx, R, B, x0, x1, t);
    if (R.ch !== 1 && R.ch !== 11) return;
    const ch11 = R.ch === 11, gy = FLY_GROUND;
    /* a dry riverbed and pools in the ground: their places are fixed per region */
    for (let k = 0; k < 3; k++){
      const rx = R.x0 + 1900 + k * (R.w - 2800) / 2 + flyH(k, 90) * 120, w = 240 + flyH(k, 91) * 120;
      if (rx + w < x0 || rx > x1) continue;
      ctx.fillStyle = ch11 ? 'rgba(90,40,150,.55)' : 'rgba(40,110,170,.6)'; ctx.beginPath(); ctx.moveTo(rx, gy + 4);
      for (let x = rx; x <= rx + w; x += 16) ctx.lineTo(x, gy + 4 + Math.sin((x - rx) / w * Math.PI) * 26);
      ctx.lineTo(rx + w, gy + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; for (let q = 0; q < 5; q++){ const qx = rx + 20 + q * (w - 40) / 5 + Math.sin(t * 1.3 + q) * 4; ctx.beginPath(); ctx.moveTo(qx, gy + 12 + (q % 2) * 6); ctx.lineTo(qx + 18, gy + 12 + (q % 2) * 6); ctx.stroke(); }
    }
    /* tracks and cracks under the surface */
    const cell = 64;
    for (let c = Math.floor(x0 / cell); c <= Math.ceil(x1 / cell); c++){
      const f = flyH(c, 95), x = c * cell + f * cell, y = gy + 20 + flyH(c, 96) * 120;
      if (f > 0.6){ ctx.strokeStyle = ch11 ? 'rgba(200,170,255,.22)' : 'rgba(70,45,20,.22)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y + 3); ctx.lineTo(x + 6, y + 10); ctx.lineTo(x + 18, y + 12); ctx.stroke(); }
      else if (f < 0.18){ ctx.fillStyle = ch11 ? 'rgba(200,255,240,.35)' : 'rgba(255,230,160,.3)'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.arc(x + 7, y + 3, 1.6, 0, TAU); ctx.fill(); }
    }
  };
  flyTakeoff = function(){
    const r = ft.apply(this, arguments);
    if (!Fly.on) return r;
    /* the savannah is long: more rings along it */
    const rr = miniRng(townHash('r' + (Date.now() >> 12)));
    Fly.regions.forEach(function(R, i){ if (i === 0) return; const n = Math.floor(R.w / 700); for (let k = 0; k < n; k++) Fly.rings.push({ x: R.x0 + 400 + k * (R.w - 800) / (n - 1) + (rr() - 0.5) * 120, y: 170 + rr() * 280, got: false, ph: rr() * 6 }); });
    Fly.herd = szBuildHerd(); Fly.seen = szLoadSeen(); Fly.seenT = 0;
    return r;
  };
  /* the map, bottom right */
  renderFly = function(ctx){
    rf(ctx);
    if (!Fly.on || Fly.mode === 'crash' || !Fly.regions.length) return;
    const W = G.W, H = G.H, s = clamp(Math.min(H / 700, W / 760), 0.8, 1.2), mw = Math.min(W * 0.34, 260 * s), mh = 58 * s, mx = W - mw - 12, my = H - mh - 12;
    ctx.save();
    ctx.fillStyle = 'rgba(14,10,8,.66)'; ctx.beginPath(); ctx.roundRect(mx - 6, my - 18 * s, mw + 12, mh + 24 * s, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#E8D8B0'; ctx.font = '600 ' + Math.round(10.5 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('MAP', mx, my - 5 * s);
    const k = mw / Fly.end, gyM = my + mh * 0.78;
    Fly.regions.forEach(function(R){
      const B = FLY_BIOME[R.ch] || FLY_BIOME[0], x = mx + R.x0 * k, w = R.w * k;
      ctx.fillStyle = B.hill; ctx.fillRect(x, gyM - mh * 0.32, w, mh * 0.32);
      ctx.fillStyle = B.g; ctx.fillRect(x, gyM, w, mh * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '600 ' + Math.round(9 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(R.ch === 0 ? 'Town' : R.ch === 1 ? 'Savannah' : R.ch === 13 ? 'Farm' : 'Changed', x + w / 2, my + 10 * s);
      if (R.ch === 1 || R.ch === 11){                                                                   /* landmarks: a pip each, as they are placed */
        for (let q = 0; q * 1000 + 260 < R.w; q++){ const lx = R.x0 + q * 1000 + 260 + flyH(q, 70) * 480; if (lx < R.x0 + 400 || lx > R.x1 - 200) continue; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(mx + lx * k - 1, gyM - 7 * s, 2, 7 * s); }
      }
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, my + 14 * s, 1, mh - 14 * s);
    });
    ctx.fillStyle = '#FFD060'; ctx.fillRect(mx, gyM - 2, Math.min(FLY_RUNWAY_LEN * k, mw), 2);                  /* the runway */
    Fly.rings.forEach(function(r){ if (r.got) return; ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.arc(mx + r.x * k, my + 18 * s + (r.y / FLY_H) * (gyM - my - 18 * s), 1.8, 0, TAU); ctx.fill(); });
    (Fly.herd || []).forEach(function(a){ ctx.fillStyle = a.ch === 11 ? '#C9A0FF' : '#B8F0A0'; ctx.fillRect(mx + a.x * k - 0.5, gyM + 3, 1.2, 3); });
    /* only what she has flown over is shown: the rest of the map is covered */
    if (!Fly.seen) Fly.seen = {};
    for (let cx = Math.floor((Fly.x - 150) / 60); cx <= Math.floor((Fly.x + 150) / 60); cx++) Fly.seen[cx] = 1;
    ctx.fillStyle = 'rgba(14,10,8,.94)';
    const top = my, hgt = mh, nCells = Math.ceil(Fly.end / 60);
    for (let cx = 0; cx < nCells;){
      if (Fly.seen[cx]){ cx++; continue; }
      let ce = cx; while (ce < nCells && !Fly.seen[ce]) ce++;
      ctx.fillRect(mx + cx * 60 * k, top, Math.min(mw - cx * 60 * k, (ce - cx) * 60 * k + 0.6), hgt);
      cx = ce;
    }
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.strokeRect(mx, top, mw, hgt);
    const px = mx + Fly.x * k, py = my + 18 * s + (Fly.y / FLY_H) * (gyM - my - 18 * s);                       /* the plane */
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(px + 5 * Fly.face, py); ctx.lineTo(px - 4 * Fly.face, py - 3.4); ctx.lineTo(px - 4 * Fly.face, py + 3.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = 1; ctx.strokeRect(mx + clamp(Fly.cam, 0, Fly.end) * k, my + 14 * s, Math.min(mw, (G.W / clamp(G.H / FLY_H, 0.5, 1.5)) * k), mh - 14 * s);
    ctx.restore();
  };
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('Fly over the town and the chapters that are on the Earth (the Changed Savannah once Chapter 10 is finished, Area 51 once Chapter 11 is).', 'Fly over the town and the Savannah, with herds of its animals walking about below (replaced by the Changed Savannah, with its own changed creatures, once Chapter 10 is finished). A map at the bottom right shows the whole flight.'); }; }
})();
