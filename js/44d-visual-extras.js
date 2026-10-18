'use strict';
/* A second visual pass: more scenery for Chapters 1 and 2, ground that remembers, elite and varied creatures, time-of-day colour,
   heat haze, biome screen edges and an iris at chapter changes, a map of the run on the death screen, and animated bestiary portraits. */
/* ========================= 44d. VISUAL EXTRAS ========================= */
/* Loaded after the files it extends (it wraps functions that live in 03, 08, 35h, 36i, 36l, 42 and 44), so everything here is
   added from the outside. The Visual effects setting gates anything that is only for looks; Low turns it all off. */

/* ---------- 1. more scenery for the savanna (Chapter 1) and Frostreach (Chapter 2) ---------- */
(function(){
  const S1 = SCEN_DEFS[1], S2 = SCEN_DEFS[2];
  if (S1){
    S1.props.push(
      { id: 'sv_flowers', count: 38, r: 14, gap: 36, s: [0.8, 1.3], draw: function(ctx, p, t){      /* wildflowers: small spots of colour */
          const cols = ['#E8A33C', '#D9534A', '#B98AE0', '#F2E27A'], c1 = cols[(p.seed * 4) | 0], c2 = cols[((p.seed * 4) | 0) + 1 & 3], sw = scSway(t, p, 1.6);
          ctx.lineCap = 'round'; ctx.lineWidth = 1.2; ctx.strokeStyle = '#6F7F3A';
          for (let i = 0; i < 5; i++){ const x = -9 + i * 4.4, h = 7 + scRnd(p.seed, i) * 8;
            ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + sw * 0.4, 3 - h); ctx.stroke();
            fillCircle(ctx, x + sw * 0.4, 3 - h, 2.3, i & 1 ? c1 : c2); fillCircle(ctx, x + sw * 0.4, 3 - h, 0.9, '#FFF4C4'); }
        } },
      { id: 'sv_tallgrass', count: 22, r: 20, gap: 50, s: [1.0, 1.6], draw: function(ctx, p, t){      /* big golden clumps that lean in the wind */
          const sw = scSway(t, p, 3.2); ctx.lineCap = 'round';
          for (let layer = 0; layer < 2; layer++){
            ctx.strokeStyle = layer ? '#C9B35E' : '#9C8B45'; ctx.lineWidth = layer ? 1.5 : 2; ctx.beginPath();
            for (let i = 0; i < 8; i++){ const x = -12 + i * 3.4 + layer * 1.6, h = 22 + scRnd(p.seed, i + layer * 9) * 20;
              ctx.moveTo(x, 4); ctx.quadraticCurveTo(x + (i - 3.5) * 1.8, -h * 0.5, x + (i - 3.5) * 3 + sw * (h / 30), -h); }
            ctx.stroke();
          }
          ctx.fillStyle = 'rgba(240,226,150,.7)';
          for (let i = 0; i < 4; i++){ const h = 30 + scRnd(p.seed, i + 30) * 10; ctx.fillRect(-8 + i * 5 + (i - 1.5) * 3 + sw * 1.1 - 0.7, -h - 1, 1.6, 4); }
        } }
    );
    S1.landmarks.push(
      { id: 'sv_arch', count: 1, r: 90, gap: 900, s: [1, 1.2], draw: function(ctx, p, t){             /* a wind-carved stone arch */
          scShadow(ctx, 96, 30, 0.22);
          ctx.fillStyle = '#6F6658'; ctx.beginPath(); ctx.ellipse(-52, -18, 22, 36, 0.08, 0, TAU); ctx.fill();
          ctx.fillStyle = '#7C7364'; ctx.beginPath(); ctx.ellipse(52, -16, 20, 34, -0.06, 0, TAU); ctx.fill();
          ctx.fillStyle = '#8A8070'; ctx.beginPath(); ctx.ellipse(0, -52, 70, 20, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#9C917E'; ctx.beginPath(); ctx.ellipse(-8, -58, 46, 9, -0.05, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(30,24,16,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-50, -30); ctx.lineTo(-46, 2); ctx.moveTo(40, -48); ctx.lineTo(34, -40); ctx.stroke();
        } },
      { id: 'sv_deadtree', count: 2, r: 56, gap: 800, s: [1, 1.3], draw: function(ctx, p, t){          /* a huge bare tree with a few dry leaves left */
          const sw = scSway(t, p, 1.2);
          scShadow(ctx, 60, 20, 0.22);
          ctx.fillStyle = '#4C4034'; ctx.beginPath(); ctx.moveTo(-9, 6); ctx.lineTo(-5, -70); ctx.lineTo(5, -70); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#4C4034'; ctx.lineCap = 'round'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(-4, -64); ctx.lineTo(-44, -98 + sw); ctx.moveTo(4, -66); ctx.lineTo(48, -104 + sw); ctx.moveTo(0, -70); ctx.lineTo(-6, -122);
          ctx.moveTo(-24, -82); ctx.lineTo(-52, -78); ctx.stroke();
          ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-44, -98 + sw); ctx.lineTo(-62, -118); ctx.moveTo(48, -104 + sw); ctx.lineTo(66, -112); ctx.moveTo(-6, -122); ctx.lineTo(8, -140); ctx.stroke();
          ctx.fillStyle = '#9C7A3A'; for (let i = 0; i < 5; i++) fillCircle(ctx, -40 + i * 22 + sw, -100 - (i % 3) * 8, 2, '#9C7A3A');
        } }
    );
    SCEN_TALL.sv_deadtree = 1;
    S1.decals.push(
      { id: 'sv_riverbed', count: 5, s: [1.6, 2.4], draw: function(ctx, d, t){                          /* a dry riverbed: pale, cracked, with pebbles */
          ctx.fillStyle = 'rgba(204,186,140,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 150, 17, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(224,208,160,.14)'; ctx.beginPath(); ctx.ellipse(8, -1, 118, 9, 0.02, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(70,54,32,.3)'; ctx.lineWidth = 1; ctx.beginPath();
          for (let i = 0; i < 7; i++){ const x = -110 + i * 36; ctx.moveTo(x, -4); ctx.lineTo(x + 8, 2); ctx.lineTo(x + 3, 8); }
          ctx.stroke();
          ctx.fillStyle = 'rgba(120,108,84,.5)';
          for (let i = 0; i < 9; i++) fillCircle(ctx, -120 + i * 30 + scRnd(d.seed, i) * 14, (scRnd(d.seed, i + 9) - 0.5) * 16, 1.6 + scRnd(d.seed, i + 20) * 1.6, 'rgba(120,108,84,.5)');
        } },
      { id: 'sv_pan', count: 6, s: [1, 1.7], draw: function(ctx, d, t){                                   /* a salt pan: pale crust with a bright rim */
          ctx.fillStyle = 'rgba(232,222,190,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 62, 30, 0, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,248,222,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 58, 27, 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(120,104,70,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-30, -4); ctx.lineTo(-8, 4); ctx.lineTo(10, -3); ctx.lineTo(32, 6); ctx.stroke();
        } }
    );
    S1.ambient.push(
      { id: 'sv_vshadow', count: 2, layer: 'under',                                                        /* a vulture's shadow crossing the ground */
        init: function(a){ a.vx = 34 + a.seed * 22; a.vy = (a.seed - 0.5) * 16; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += a.vy * dt; },
        draw: function(ctx, a, t){
          const f = 0.8 + Math.sin(t * 3 + a.ph) * 0.2;
          ctx.fillStyle = 'rgba(14,10,6,.17)';
          ctx.beginPath(); ctx.ellipse(0, 0, 5, 9, 0, 0, TAU); ctx.ellipse(-15 * f, 2, 14, 3.4, -0.25, 0, TAU); ctx.ellipse(15 * f, 2, 14, 3.4, 0.25, 0, TAU); ctx.fill();
        } }
    );
  }
  if (S2){
    S2.props.push(
      { id: 'ar_snowshrub', count: 28, r: 16, gap: 36, s: [0.8, 1.3], draw: function(ctx, p, t){         /* bare twigs under a cap of snow */
          scShadow(ctx, 16, 6, 0.14); ctx.lineCap = 'round'; ctx.strokeStyle = '#5E4C3E'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI + 0.25, L = 9 + scRnd(p.seed, i) * 8; ctx.moveTo(0, 2); ctx.lineTo(Math.cos(a) * L * 1.2, -Math.sin(a) * L); }
          ctx.stroke();
          ctx.fillStyle = 'rgba(244,250,255,.92)'; ctx.beginPath(); ctx.ellipse(-1, -2, 11, 5, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(190,214,236,.8)'; ctx.beginPath(); ctx.ellipse(2, 1, 9, 3, 0, 0, TAU); ctx.fill();
        } },
      { id: 'ar_snowboulder', count: 16, r: 24, gap: 40, s: [0.8, 1.4], draw: function(ctx, p, t){      /* a rock under a deep cap of snow */
          scShadow(ctx, 26, 10, 0.2);
          ctx.fillStyle = '#6C7684'; ctx.beginPath(); ctx.ellipse(0, 0, 21, 13, 0.05, 0, TAU); ctx.fill();
          ctx.fillStyle = '#566070'; ctx.beginPath(); ctx.ellipse(6, 4, 14, 7, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#F2F8FF'; ctx.beginPath(); ctx.ellipse(-2, -6, 20, 9, -0.05, 0, TAU); ctx.fill();
          ctx.fillStyle = '#C9DCEE'; ctx.beginPath(); ctx.ellipse(4, -2, 14, 4.5, 0, 0, TAU); ctx.fill();
        } },
      { id: 'ar_icicle', count: 10, r: 20, gap: 50, s: [0.8, 1.3], draw: function(ctx, p, t){             /* a cluster of ice spikes */
          scShadow(ctx, 20, 8, 0.16);
          const n = 5; for (let i = 0; i < n; i++){
            const x = -14 + i * 7, h = 16 + scRnd(p.seed, i) * 18, lean = (i - 2) * 1.6, w = 3.6 + scRnd(p.seed, i + 9) * 2;
            ctx.fillStyle = 'rgba(150,200,236,.85)'; ctx.beginPath(); ctx.moveTo(x - w, 3); ctx.lineTo(x + lean, 3 - h); ctx.lineTo(x + w, 3); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(236,248,255,.8)'; ctx.beginPath(); ctx.moveTo(x - w * 0.2, 3); ctx.lineTo(x + lean, 3 - h); ctx.lineTo(x + w * 0.3, 3 - h * 0.35); ctx.closePath(); ctx.fill();
          }
        } }
    );
    S2.landmarks.push(
      { id: 'ar_obelisk', count: 2, r: 60, gap: 900, s: [1, 1.3], draw: function(ctx, p, t){             /* a tall, faintly glowing ice monolith */
          scShadow(ctx, 50, 18, 0.2);
          ctx.fillStyle = 'rgba(120,176,224,.9)'; ctx.beginPath(); ctx.moveTo(-22, 6); ctx.lineTo(-14, -110); ctx.lineTo(0, -132); ctx.lineTo(16, -108); ctx.lineTo(24, 6); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(190,226,255,.85)'; ctx.beginPath(); ctx.moveTo(-18, 4); ctx.lineTo(-12, -106); ctx.lineTo(0, -128); ctx.lineTo(2, -60); ctx.lineTo(-4, 2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(240,250,255,.8)'; ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-8, -90); ctx.lineTo(-3, -92); ctx.lineTo(-4, -20); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 1.6 + p.seed * 9); fillCircle(ctx, 0, -100, 4, '#E8F6FF'); ctx.globalAlpha = 1;
        } },
      { id: 'ar_cairn', count: 2, r: 40, gap: 800, s: [1, 1.3], draw: function(ctx, p, t){               /* a stack of stones left by someone long ago */
          scShadow(ctx, 36, 12, 0.2);
          const R = [[0, 0, 30, 12, '#6A7482'], [-2, -16, 24, 10, '#7A8492'], [3, -29, 18, 8, '#8A94A2'], [-1, -40, 11, 6, '#9AA4B2']];
          for (let i = 0; i < R.length; i++){ const r = R[i]; ctx.fillStyle = r[4]; ctx.beginPath(); ctx.ellipse(r[0], r[1], r[2], r[3], 0, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(244,250,255,.8)'; ctx.beginPath(); ctx.ellipse(r[0] - 2, r[1] - r[3] * 0.55, r[2] * 0.7, r[3] * 0.4, 0, 0, TAU); ctx.fill(); }
        } }
    );
    SCEN_TALL.ar_obelisk = 1;
    PROP_LIGHT.ar_obelisk = { r: 120, c: [150, 215, 255], a: 0.4, dy: -50 };
    S2.decals.push(
      { id: 'ar_frozenpond', count: 7, s: [1, 1.6], draw: function(ctx, d, t){                           /* a frozen pond with cracks */
          ctx.fillStyle = 'rgba(176,214,240,.34)'; ctx.beginPath(); ctx.ellipse(0, 0, 54, 28, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(236,248,255,.3)'; ctx.beginPath(); ctx.ellipse(-8, -5, 32, 12, -0.1, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(70,110,150,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-34, 2); ctx.lineTo(-10, -4); ctx.lineTo(8, 6); ctx.lineTo(30, -2); ctx.moveTo(-10, -4); ctx.lineTo(-4, -16); ctx.stroke();
        } },
      { id: 'ar_driftline', count: 26, s: [1, 1.8], draw: function(ctx, d, t){                             /* wind-sculpted ridges of snow */
          ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-30, -9, 6, -2); ctx.quadraticCurveTo(40, 5, 72, -3); ctx.stroke();
          ctx.strokeStyle = 'rgba(120,150,190,.2)'; ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(-70, 5); ctx.quadraticCurveTo(-30, -4, 6, 3); ctx.quadraticCurveTo(40, 10, 72, 2); ctx.stroke();
        } }
    );
    S2.ambient.push(
      { id: 'ar_snowdevil', count: 2, layer: 'under',                                                    /* a swirl of snow lifted by the wind */
        init: function(a){ a.vx = 14 + a.seed * 16; a.vy = (a.seed - 0.5) * 18; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += a.vy * dt + Math.sin(t * 0.4 + a.ph) * 6 * dt; },
        draw: function(ctx, a, t){
          ctx.strokeStyle = 'rgba(244,250,255,.34)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
          for (let i = 0; i < 4; i++){ const r = 5 + i * 5, y = -i * 10, o = Math.sin(t * 3 + a.ph + i) * 3;
            ctx.beginPath(); ctx.ellipse(o, y, r, r * 0.32, 0, 0.2, Math.PI * 1.6); ctx.stroke(); }
        } }
    );
  }
})();

/* ---------- 5. time of day in more chapters, and a colour for each part of it ---------- */
ATMOS[5].cycle = true; ATMOS[7].cycle = true; ATMOS[13].cycle = true;       /* the canopy, the space center and Mars now run dawn to night too */
WX_TOD[5] = ['fireflies', 0.55]; WX_TOD[7] = ['stars', 0.55]; WX_TOD[13] = ['stars', 0.6];
/* [fraction of the chapter, r, g, b, strength]: dawn is rose, midday is clear, the afternoon is gold, dusk is violet, night is deep blue */
const TOD_KEYS = [[0, 255, 150, 130, 0.30], [0.14, 255, 200, 150, 0.14], [0.3, 255, 255, 255, 0], [0.5, 255, 236, 180, 0.08], [0.66, 255, 190, 90, 0.26],
                  [0.8, 200, 110, 190, 0.28], [0.92, 70, 90, 210, 0.3], [1, 50, 70, 190, 0.34]];
function todTint(f){
  let a = TOD_KEYS[0], b = TOD_KEYS[TOD_KEYS.length - 1];
  for (let i = 0; i < TOD_KEYS.length - 1; i++) if (f >= TOD_KEYS[i][0] && f <= TOD_KEYS[i + 1][0]){ a = TOD_KEYS[i]; b = TOD_KEYS[i + 1]; break; }
  const k = b[0] === a[0] ? 0 : (f - a[0]) / (b[0] - a[0]);
  return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k, a[4] + (b[4] - a[4]) * k];
}

/* ---------- 6. heat haze (and a cold shimmer): the picture is re-drawn in thin strips that sway sideways ---------- */
const HAZE = { 2: 0.55, 9: 1.7, 10: 2.4, 13: 1.1 };
let _hazeBuf = null;
function drawHaze(ctx){
  const amp = HAZE[G.chapter | 0];
  if (!amp || fxLevelNow() < 2 || G.state === 'menu' || G.attract || !stage) return;
  const W = G.W, H = G.H, dpr = G.dpr, pw = stage.width, ph = stage.height;
  if (!_hazeBuf || _hazeBuf.width !== pw || _hazeBuf.height !== ph){ _hazeBuf = document.createElement('canvas'); _hazeBuf.width = pw; _hazeBuf.height = ph; }
  const b = _hazeBuf.getContext('2d');
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'copy'; b.drawImage(stage, 0, 0); b.globalCompositeOperation = 'source-over';
  const t = G.time, strip = 16;
  ctx.save();
  for (let y = 0; y < H; y += strip){
    const h = Math.min(strip, H - y), s = Math.sin(y * 0.045 + t * 2.1) * amp + Math.sin(y * 0.11 - t * 1.3) * amp * 0.5;
    ctx.drawImage(_hazeBuf, 0, y * dpr, pw, h * dpr, s, y, W, h);
  }
  ctx.restore();
}
(function(){
  const scr = Light.screen;
  Light.screen = function(ctx, cx, cy, ox, oy, S){
    if (this.on) drawHaze(ctx);
    scr.call(this, ctx, cx, cy, ox, oy, S);
    if (!this.on || G.state === 'menu') return;
    const f = this.todFrac(G.chapter | 0 || 1);
    if (f === null) return;
    const c = todTint(f); if (c[3] < 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + c[3].toFixed(3) + ')';
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.restore();
  };
})();

/* ---------- 2. the ground remembers: footprints, flattened grass ---------- */
const PRINT_COL = { snow: 'rgba(70,98,130,.55)', savanna: 'rgba(58,42,24,.45)', swamp: 'rgba(24,30,14,.55)', jungle: 'rgba(28,38,18,.45)',
                    moon: 'rgba(118,122,140,.55)', venus: 'rgba(110,70,20,.45)', mars: 'rgba(84,32,16,.5)', area51: 'rgba(110,86,50,.4)' };
const TRAMPLE_COL = { savanna: 'rgba(176,156,100,.55)', jungle: 'rgba(120,160,70,.45)', swamp: 'rgba(110,130,60,.4)' };
const Memory = { acc: 0, accE: 0, side: 1 };
(function(){
  const gfx = giraffeFxUpdate;
  giraffeFxUpdate = function(dt){
    gfx(dt);
    RunMap.tick(dt);
    if (fxLevelNow() <= 0 || G.state !== 'playing' || G.attract || P.dead) return;
    const col = PRINT_COL[G.biome];
    if (!col) return;
    const sp = Math.hypot(P.vx, P.vy);
    Memory.acc += dt * Math.min(1.5, sp / 180);
    if (sp > 55 && Memory.acc >= 0.2){
      Memory.acc = 0; Memory.side = -Memory.side;
      const nx = -Math.sin(P.face), ny = Math.cos(P.face);
      addDecal(P.x - Math.cos(P.face) * 10 + nx * 6 * Memory.side, P.y + 11 - Math.sin(P.face) * 4 + ny * 2 * Memory.side, 'print', col, 5, P.face);
    }
    Memory.accE += dt;
    if (Memory.accE >= 0.35){                                        /* the heavy ones leave tracks too */
      Memory.accE = 0; let n = 0; const es = G.enemies;
      for (let i = 0; i < es.length && n < 5; i++){
        const e = es[i]; if (e.dead || e.r < 22 || e.def.fly || (e.vx * e.vx + e.vy * e.vy) < 400) continue;
        if (Math.abs(e.x - P.x) > 520 || Math.abs(e.y - P.y) > 380) continue;
        n++; addDecal(e.x, e.y + e.r * 0.5, 'print', col, e.r * 0.3, Math.atan2(e.vy, e.vx));
      }
    }
  };
})();

/* ---------- 3. elite and varied creatures ---------- */
const ELITE = { chance: 0.06, minWave: 6, maxAlive: 4 };
(function(){
  const spawn = spawnEnemy, draw = drawEnemy, kill = killEnemy;
  spawnEnemy = function(type, x, y, wave, kind){
    const e = spawn(type, x, y, wave, kind);
    if (!e || e.big || G.attract) return e;
    e.vs = 0.92 + Math.random() * 0.17;                                         /* every creature is a little different in size */
    if (Math.random() < 0.22) e.scar = Math.random() * TAU;                    /* and some carry a pale scar */
    const w = wave || G.wave || 1;
    if (w >= ELITE.minWave && e.r >= 12 && !e.def.turret && Math.random() < ELITE.chance){
      let alive = 0; for (let i = 0; i < G.enemies.length; i++) if (G.enemies[i].elite) alive++;
      if (alive < ELITE.maxAlive){
        e.elite = true; e.vs = 1.2;
        e.hp *= 1.9; e.maxHp *= 1.9; e.dmg *= 1.2; e.xp *= 2.2; e.val = (e.val || 10) * 2; e.spd *= 1.04;
      }
    }
    return e;
  };
  drawEnemy = function(ctx, e){
    if (e.portrait || (e.vs === undefined && !e.elite)) return draw(ctx, e);
    const s = e.vs || 1, fx = fxLevelNow(), t = G.time;
    if (e.elite){                                                               /* a golden ring and glow on the ground */
      const r = e.r * 1.5 * s + 3 + Math.sin(t * 4 + e.anim) * 1.5;
      if (fx > 0){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.34; ctx.drawImage(lightSprite([255, 200, 80]), e.x - r * 1.6, e.y - r * 1.2, r * 3.2, r * 2.4); ctx.restore(); }
      ctx.strokeStyle = 'rgba(255,214,90,.85)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r * 0.3, r, r * 0.55, 0, 0, TAU); ctx.stroke();
    }
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(s, s); ctx.translate(-e.x, -e.y);
    draw(ctx, e);
    if (e.scar !== undefined){
      ctx.strokeStyle = 'rgba(240,226,196,.65)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      const c = Math.cos(e.scar), n = Math.sin(e.scar), L = e.r * 0.5;
      ctx.beginPath(); ctx.moveTo(e.x - c * L * 0.4 - n * L * 0.2, e.y - n * L * 0.4 + c * L * 0.2); ctx.lineTo(e.x + c * L * 0.5 + n * L * 0.2, e.y + n * L * 0.5 - c * L * 0.2); ctx.stroke();
    }
    ctx.restore();
    if (e.elite){                                                               /* a small crown over its head */
      const y = e.y - e.r * s - 9, x = e.x;
      ctx.fillStyle = '#FFD24A'; ctx.strokeStyle = 'rgba(70,40,0,.9)'; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x - 8, y + 6); ctx.lineTo(x - 8, y - 2); ctx.lineTo(x - 4, y + 2); ctx.lineTo(x, y - 5); ctx.lineTo(x + 4, y + 2); ctx.lineTo(x + 8, y - 2); ctx.lineTo(x + 8, y + 6); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  };
  killEnemy = function(e, opts){
    const was = e.dead;
    kill(e, opts);
    if (was || !e.dead) return;
    RunMap.kill(e);
    if (e.elite){ addPickup(e.x - 10, e.y, 'gold'); addPickup(e.x + 10, e.y, 'gold'); addText(e.x, e.y - e.r - 24, 'ELITE', '#FFD24A', 16, true); }
    if (fxLevelNow() > 0 && TRAMPLE_COL[G.biome] && !e.big && e.r >= 12 && !e.def.fly) addDecal(e.x, e.y, 'trample', TRAMPLE_COL[G.biome], e.r * 1.4);
  };
})();

/* ---------- 8. chapter changes: an iris closes on her, the world changes, it opens; and the screen edge takes on the biome ---------- */
const EDGE_FX = {                                   /* biome: [r, g, b, a, how] ; how: 'glow' adds light, 'frost' is jagged white ice, 'murk' darkens */
  savanna: [255, 190, 90, 0.4, 'glow'], snow: [225, 244, 255, 0.55, 'frost'], swamp: [90, 130, 40, 0.45, 'murk'], ocean: [40, 150, 230, 0.45, 'glow'],
  jungle: [150, 255, 110, 0.4, 'glow'], city: [255, 90, 190, 0.35, 'glow'], space: [90, 140, 255, 0.35, 'glow'], moon: [210, 224, 255, 0.35, 'glow'],
  venus: [255, 214, 70, 0.4, 'glow'], area51: [90, 255, 150, 0.35, 'glow'], mars: [255, 110, 60, 0.4, 'glow']
};
function drawIris(ctx, f){
  const W = G.W, H = G.H, k = f.t / f.dur, R = Math.hypot(W, H) * 0.6;
  const sx = W / 2 + (P.x - G.camX) * G.zoom, sy = H / 2 + (P.y - G.camY) * G.zoom;
  let r;
  if (k < 0.12) r = R - (R - R * 0.55) * (k / 0.12);
  else if (k < 0.4) r = R * 0.55 * (1 - (k - 0.12) / 0.28);
  else if (k < 0.6) r = 0;
  else r = R * Math.min(1, (k - 0.6) / 0.35);
  const open = k > 0.5, e = EDGE_FX[f.toBiome] || EDGE_FX.savanna;
  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = open ? 'rgb(' + ((e[0] * 0.12) | 0) + ',' + ((e[1] * 0.12) | 0) + ',' + ((e[2] * 0.12) | 0) + ')' : 'rgb(12,9,8)';
  ctx.beginPath(); ctx.rect(0, 0, W, H); if (r > 1) ctx.arc(sx, sy, r, 0, TAU, true);
  ctx.fill('evenodd');
  if (r > 4 && r < R){ ctx.globalAlpha = 0.6; ctx.strokeStyle = 'rgb(' + e[0] + ',' + e[1] + ',' + e[2] + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
(function(){
  const sw = startWave;
  startWave = function(n){
    sw(n);
    if (chapterWaveOf(n) === 1 && !G.attract) G.edgeFX = { t: 0, t0: G.time, dur: 3.6, biome: G.biome };
  };
})();
function drawEdgeFX(ctx){
  const f = G.edgeFX; if (!f || fxLevelNow() <= 0) return;
  f.t = G.time - f.t0;                                                         /* game time, so it does not depend on the frame rate */
  if (f.t >= f.dur || f.t < 0){ G.edgeFX = null; return; }
  const k = f.t / f.dur, a = (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88) * (Settings.calmFlash ? 0.5 : 1), e = EDGE_FX[f.biome]; if (!e || a <= 0) return;
  const W = G.W, H = G.H, r = Math.hypot(W, H) * 0.5, A = e[3] * a * a;
  ctx.save();
  if (e[4] === 'glow') ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(W / 2, H / 2, r * 0.55, W / 2, H / 2, r);
  const c = e[4] === 'murk' ? '10,22,6' : e[0] + ',' + e[1] + ',' + e[2];
  gr.addColorStop(0, 'rgba(' + c + ',0)'); gr.addColorStop(1, 'rgba(' + c + ',' + A.toFixed(3) + ')');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  if (e[4] === 'frost'){                                                       /* jagged ice creeping in from the edges */
    ctx.fillStyle = 'rgba(236,248,255,' + (0.5 * a).toFixed(3) + ')';
    const grow = 26 + 40 * Math.min(1, k * 4) * (1 - Math.max(0, (k - 0.5) * 2));
    for (let i = 0; i < 36; i++){
      const x = (i + 0.5) / 36 * W, h = grow * (0.35 + scRnd(i, 3) * 0.9), w = W / 36 * 0.55;
      ctx.beginPath(); ctx.moveTo(x - w, 0); ctx.lineTo(x, h); ctx.lineTo(x + w, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - w, H); ctx.lineTo(x, H - h); ctx.lineTo(x + w, H); ctx.fill();
    }
    for (let i = 0; i < 20; i++){
      const y = (i + 0.5) / 20 * H, h = grow * (0.35 + scRnd(i, 9) * 0.9), w = H / 20 * 0.55;
      ctx.beginPath(); ctx.moveTo(0, y - w); ctx.lineTo(h, y); ctx.lineTo(0, y + w); ctx.fill();
      ctx.beginPath(); ctx.moveTo(W, y - w); ctx.lineTo(W - h, y); ctx.lineTo(W, y + w); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------- 10. a map of the run on the death screen ---------- */
const RunMap = {
  path: [], kills: [], acc: 0, endX: 0, endY: 0,
  reset(){ this.path.length = 0; this.kills.length = 0; this.acc = 0; },
  tick(dt){
    if (G.state !== 'playing' || G.attract || P.dead) return;
    this.acc += dt;
    if (this.acc < 0.35) return;
    this.acc = 0;
    this.path.push([P.x | 0, P.y | 0]);
    if (this.path.length > 900){ const keep = []; for (let i = 0; i < this.path.length; i += 2) keep.push(this.path[i]); this.path = keep; }
  },
  kill(e){
    if (G.attract) return;
    this.kills.push([e.x | 0, e.y | 0, e.big ? 1 : e.elite ? 2 : 0]);
    if (this.kills.length > 500){ for (let i = 0; i < this.kills.length; i++) if (!this.kills[i][2]){ this.kills.splice(i, 1); break; } }
  },
  paint(){
    const cv = document.getElementById('runMap'); if (!cv || !cv.getContext) return;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, sx = W / ARENA_W, sy = H / ARENA_H, p = this.path;
    c.clearRect(0, 0, W, H);
    c.fillStyle = 'rgba(20,16,14,.9)'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,236,200,.12)'; c.lineWidth = 1;
    for (let i = 1; i < 4; i++){ c.beginPath(); c.moveTo(W * i / 4, 0); c.lineTo(W * i / 4, H); c.moveTo(0, H * i / 4); c.lineTo(W, H * i / 4); c.stroke(); }
    c.strokeStyle = 'rgba(255,236,200,.35)'; c.strokeRect(0.5, 0.5, W - 1, H - 1);
    for (let i = 0; i < this.kills.length; i++){
      const q = this.kills[i], x = q[0] * sx, y = q[1] * sy;
      if (q[2] === 1){ c.strokeStyle = '#FFD24A'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.stroke(); }
      else if (q[2] === 2){ c.fillStyle = '#FFD24A'; c.beginPath(); c.moveTo(x, y - 3.5); c.lineTo(x + 3.5, y); c.lineTo(x, y + 3.5); c.lineTo(x - 3.5, y); c.closePath(); c.fill(); }
      else { c.fillStyle = 'rgba(239,230,212,.38)'; c.fillRect(x - 1, y - 1, 2, 2); }
    }
    if (p.length > 1){
      c.lineWidth = 2.4; c.lineJoin = 'round'; c.lineCap = 'round';
      for (let i = 1; i < p.length; i++){
        const k = i / (p.length - 1);
        c.strokeStyle = k < 0.5 ? 'rgb(' + ((155 + 87 * k * 2) | 0) + ',' + ((224 - 45 * k * 2) | 0) + ',' + ((74 - 13 * k * 2) | 0) + ')'
                                 : 'rgb(' + ((242 - 35 * (k - 0.5) * 2) | 0) + ',' + ((179 - 111 * (k - 0.5) * 2) | 0) + ',' + ((61 - 10 * (k - 0.5) * 2) | 0) + ')';
        c.beginPath(); c.moveTo(p[i - 1][0] * sx, p[i - 1][1] * sy); c.lineTo(p[i][0] * sx, p[i][1] * sy); c.stroke();
      }
      c.fillStyle = '#9BE04A'; c.beginPath(); c.arc(p[0][0] * sx, p[0][1] * sy, 4, 0, TAU); c.fill();
    }
    const ex = this.endX * sx, ey = this.endY * sy;
    c.strokeStyle = '#FF5A4A'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 6, ey - 6); c.lineTo(ex + 6, ey + 6); c.moveTo(ex + 6, ey - 6); c.lineTo(ex - 6, ey + 6); c.stroke();
  }
};
(function(){
  const run = startRun, over = gameOver, death = showDeath;
  startRun = function(a, b, c){ RunMap.reset(); return run(a, b, c); };
  gameOver = function(){ RunMap.endX = P.x; RunMap.endY = P.y; return over(); };
  showDeath = function(){ death(); RunMap.paint(); if (typeof paintGiraffePortrait === 'function') paintGiraffePortrait(document.getElementById('deathGir')); };
})();

/* ---------- 10. bestiary portraits move when the pointer is over them ---------- */
(function(){
  let cv = null, timer = 0, t0 = 0, stopAt = 0;
  function repaint(anim){
    if (!cv) return;
    const def = bestiaryTable(+cv.getAttribute('data-bch'))[cv.getAttribute('data-btype')], keep = G.particles.length;
    BST_ANIM = anim; paintBestiaryPortrait(cv, def, cv.getAttribute('data-btype'), true); BST_ANIM = null;
    if (G.particles.length > keep) G.particles.length = keep;
  }
  function stop(){
    if (timer){ clearInterval(timer); timer = 0; }
    if (cv){ repaint(null); cv = null; }
  }
  function start(c){
    if (c === cv) return;
    stop(); cv = c; t0 = performance.now();
    timer = setInterval(function(){
      if (G.state !== 'bestiary' || !document.body.contains(cv) || (stopAt && performance.now() > stopAt)){ stop(); return; }
      repaint(1.2 + (performance.now() - t0) / 1000 * 6);
    }, 50);
  }
  function entryCanvas(el){
    const ent = el && el.closest ? el.closest('.bst-entry') : null;
    if (!ent || ent.classList.contains('unknown')) return null;
    return ent.querySelector('canvas.bst-pic');
  }
  OV.addEventListener('mouseover', function(e){ const c = entryCanvas(e.target); stopAt = 0; if (c) start(c); });
  OV.addEventListener('mouseout', function(e){ const ent = e.target.closest ? e.target.closest('.bst-entry') : null; if (ent && !ent.contains(e.relatedTarget)) stop(); });
  OV.addEventListener('touchstart', function(e){ const c = entryCanvas(e.target); if (c){ start(c); stopAt = performance.now() + 3000; } }, { passive: true });
})();
