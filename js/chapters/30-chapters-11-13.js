'use strict';
/* Chapters 11, 12 and 13. */
/* ========================= CHAPTER 11: THE CHANGED SAVANNAH ========================= */
/* She comes home to the savannah, and the grass glitters. Chapter 1's creatures and its five bosses are back, the same animals in the same order, but
   something has got into them: every one has a twist in how it fights (a hook that runs after its normal behavior and bends it), a faint glimmer in its
   look, and a few animations of its own. The twists are in GLIM_TWIST; the look is glimOverlay. */
const GLIM_MUL = { common: { hp: 30, dmg: 6.8, spd: 1.7, val: 12 }, boss: { hp: 21, dmg: 5.6, spd: 1.45, val: 9 } };
const GLIM_TITLES = { lion: 'The Pride Caller', matriarch: 'The Herd Mother', buffalo: 'The Stampede King', crocodile: 'Old Nile, Risen', wildfire: 'Wildfire Reborn' };
const ETYPES_GLIM = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], big = !!base.big, mul = big ? GLIM_MUL.boss : GLIM_MUL.common;
  ETYPES_GLIM[id] = Object.assign({}, base, { hp: base.hp * mul.hp, dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    color: blendHex(base.color, '#2FD8C0', 0.14), dark: blendHex(base.dark, '#0A3A38', 0.18), look: 'glim_' + id, glim: true, twist: id, title: big ? GLIM_TITLES[id] : undefined });
});
const WAVE_FLAVOUR_GLIM = [
  'The grass glitters', 'Something answers the howl', 'The herd has learned', 'Shapes in the shimmer', '',
  'They do not run any more', 'The ground hums', 'Eyes like cold lanterns', 'Nothing here is what it was', '',
  'The pack comes in from the sides', 'Dust, and a green glow', 'They remember you', 'The shimmer spreads', '',
  'Every shadow is moving', 'The savannah is awake', 'No quiet left', 'It knows your name', '',
  'The whole plain rises', 'Brighter, and closer', 'The glow reaches the sky', 'Hold the line', ''
];
const BOSS_INTRO_GLIM = { lion: 'The Pride Caller rises, crowned in crystal', matriarch: 'The Herd Mother calls for her kin', buffalo: 'The Stampede King lowers his horns', crocodile: 'Old Nile stirs the glowing mud', wildfire: 'Wildfire Reborn sets the savannah alight' };

/* ---- the twists. Each is called after the creature's normal behavior with (e, dt, ux, uy, d, mvx, mvy, spd, was): `was` is the state it was in last frame.
   Return nothing to leave its movement alone, or a new [mvx, mvy]. ---- */
function glimHowl(e){
  burstParticles(e.x, e.y, 16, '#4AF0D8', 190, 3.2, { glow: true }); sfx('whoosh', 0.1);
  const near = enemiesNear(e.x, e.y, 260, []);
  for (let i = 0; i < near.length; i++){ const o = near[i]; if (!o.dead && o.type === 'hyena') o.buffT = Math.max(o.buffT || 0, 2.6); }
}
const GLIM_TWIST = {
  hyena(e, dt, ux, uy, d, mx, my){                                                   /* pack tactics: they swing in from the sides, and a howl speeds the whole pack up */
    if (e.flankSide === undefined){ e.flankSide = Math.random() < 0.5 ? 1 : -1; e.twT = rand(2, 5); }
    e.twT -= dt; if (e.twT <= 0){ e.twT = rand(6, 9); glimHowl(e); }
    const bend = e.flankSide * 0.75 * clamp((d - 140) / 300, 0, 1), c = Math.cos(bend), s = Math.sin(bend);
    return [mx * c - my * s, mx * s + my * c];
  },
  cheetah(e, dt, ux, uy, d, mx, my, spd, was){                                       /* a second dash straight after the first */
    if (was === 'dash' && e.state === 'idle' && !e.second){ e.second = true; e.state = 'wind'; e.stateT = 0.2; }
    else if (e.state === 'idle' && was === 'idle') e.second = false;
    if (e.state === 'dash' && Math.random() < dt * 30) addParticle(e.x, e.y, 0, 0, rand(5, 8), 0.4, '#4AF0D8', { glow: true });
    return null;
  },
  rhino(e, dt, ux, uy, d, mx, my, spd, was){                                         /* a ground-slam at the end of every charge */
    if (was === 'dash' && e.state === 'idle'){ const x = e.x, y = e.y, dm = e.dmg * 0.7; addMarker(x, y, 150, 0.4, '#B8A27A', () => hostileBlast(x, y, 150, dm, '#B8A27A', { kb: 90, shake: 8, source: e }), { owner: e }); }
    return null;
  },
  termite(e, dt){                                                                    /* a mound that keeps hatching grubs */
    if (e.twT === undefined) e.twT = rand(3, 6);
    e.twT -= dt; if (e.twT <= 0){ e.twT = rand(5.5, 8); if (G.enemies.length < 220){ const a = Math.random() * TAU; spawnEnemy('grub', e.x + Math.cos(a) * 22, e.y + Math.sin(a) * 22, e.waveRef); burstParticles(e.x, e.y, 6, '#4AF0D8', 110, 2.6, { glow: true }); } }
    return null;
  },
  grub(e, dt, ux, uy, d, mx, my){                                                    /* it does not run: it hops, still, then a short fast lunge */
    e.twT = (e.twT === undefined ? rand(0, 0.8) : e.twT) + dt; const ph = e.twT % 0.85, f = ph < 0.5 ? 0 : 2.4;
    e.hop = f > 0; return [mx * f, my * f];
  },
  vulture(e, dt, ux, uy, d, mx, my, spd){                                            /* every so often it rears back, glows, and dives */
    if (e.twS === undefined){ e.twS = 0; e.twT = rand(3, 5); }
    e.twT -= dt;
    if (e.twS === 0){ if (e.twT <= 0 && d < 520){ e.twS = 1; e.twT = 0.32; e.aimX = ux; e.aimY = uy; } return null; }
    if (e.twS === 1){ if (e.twT <= 0){ e.twS = 2; e.twT = 0.5; sfx('whoosh', 0.14); } return [-ux * spd * 0.3, -uy * spd * 0.3]; }
    if (e.twT <= 0){ e.twS = 0; e.twT = rand(5, 7); return null; }
    if (Math.random() < dt * 40) addParticle(e.x, e.y, 0, 0, rand(4, 7), 0.35, '#4AF0D8', { glow: true });
    return [e.aimX * spd * 3.4, e.aimY * spd * 3.4];
  },
  jackal(e, dt, ux, uy, d){                                                          /* it blinks to the other side of her */
    if (e.twT === undefined) e.twT = rand(3, 5);
    e.twT -= dt;
    if (e.twT <= 0 && d < 520 && d > 120){
      e.twT = rand(4.5, 6.5); burstParticles(e.x, e.y, 10, '#4AF0D8', 150, 3, { glow: true });
      const a = Math.atan2(e.y - P.y, e.x - P.x) + Math.PI + rand(-0.5, 0.5);
      e.x = clamp(P.x + Math.cos(a) * 190, 30, ARENA_W - 30); e.y = clamp(P.y + Math.sin(a) * 190, 30, ARENA_H - 30);
      if (e.flankDir) e.flankDir = -e.flankDir; burstParticles(e.x, e.y, 10, '#4AF0D8', 150, 3, { glow: true }); sfx('whoosh', 0.1);
    }
    return null;
  },
  warthog(e, dt, ux, uy, d, mx, my, spd, was){                                       /* each charge is faster than the last, up to a point */
    if (e.state === 'dash' && was !== 'dash'){ e.chargeN = Math.min(3, (e.chargeN || 0) + 1); const m = 1 + 0.2 * e.chargeN; e.dashVX *= m; e.dashVY *= m; }
    return null;
  },
  baboon(e, dt, ux, uy, d){                                                          /* it lobs a slow, heavy boulder as well as its usual shot */
    if (e.twT === undefined) e.twT = rand(2, 4);
    e.twT -= dt;
    if (e.twT <= 0 && d < 620){ e.twT = rand(4.2, 5.5); addEProj(e.x + ux * 16, e.y + uy * 16, ux * 220, uy * 220, 13, e.dmg * 1.4, '#8A7050', { life: 5 }); sfx('spit', 0.12); }
    return null;
  },
  honeybadger(e, dt, ux, uy, d, mx, my){                                             /* the more it is hurt, the angrier and faster it gets */
    const h = 1 - clamp(e.hp / e.maxHp, 0, 1); e.glimHeat = h; const f = 1 + 0.8 * h;
    return [mx * f, my * f];
  },
  mamba(e, dt){                                                                      /* its dash leaves puddles of venom */
    if (e.state === 'dash'){ e.twT = (e.twT || 0) - dt; if (e.twT <= 0){ e.twT = 0.07; hostileZone(e.x, e.y, 22, 2.6, e.dmg * 0.35, '#8AE04A'); } }
    return null;
  },
  ember(e, dt, ux, uy, d, mx, my, spd){                                              /* it will not come straight: it weaves */
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const z = Math.sin(e.anim * 1.7 + e.jSeed) * spd * 0.9;
    return [mx - uy * z, my + ux * z];
  },
  /* ---- bosses ---- */
  lion(e, dt, ux, uy, d, mx, my, spd, was){                                          /* the roar becomes a pride call: everything near is worked up into a frenzy */
    if (was === 'roar' && e.state === 'idle'){ const near = enemiesNear(e.x, e.y, 700, []); for (let i = 0; i < near.length; i++){ const o = near[i]; if (!o.dead && o !== e) o.buffT = Math.max(o.buffT || 0, 4); } burstParticles(e.x, e.y, 24, '#4AF0D8', 260, 4, { glow: true }); }
    return null;
  },
  matriarch(e, dt){                                                                  /* every so often she calls two rhinos in from the edges */
    if (e.twT === undefined) e.twT = rand(6, 9);
    e.twT -= dt;
    if (e.twT <= 0){ e.twT = rand(11, 14); if (G.enemies.length < 220) for (const sx of [40, ARENA_W - 40]) spawnEnemy('rhino', sx, clamp(P.y + rand(-200, 200), 40, ARENA_H - 40), e.waveRef); burstParticles(e.x, e.y, 20, '#4AF0D8', 220, 4, { glow: true }); sfx('boom', 0.12); }
    return null;
  },
  buffalo(e, dt, ux, uy, d, mx, my, spd, was){                                       /* the stampede ends in a crash */
    if (was === 'dash' && e.state !== 'dash'){ const x = e.x, y = e.y, dm = e.dmg * 0.55; addMarker(x, y, 190, 0.3, '#B8A27A', () => hostileBlast(x, y, 190, dm, '#B8A27A', { kb: 100, shake: 10, source: e }), { owner: e }); }
    return null;
  },
  crocodile(e, dt){                                                                  /* glowing mud wells up under her feet */
    if (e.twT === undefined) e.twT = rand(5, 8);
    e.twT -= dt;
    if (e.twT <= 0){ e.twT = rand(8, 10); for (let k = 0; k < 3; k++){ const x = clamp(P.x + rand(-170, 170), 60, ARENA_W - 60), y = clamp(P.y + rand(-170, 170), 60, ARENA_H - 60), dm = e.dmg * 0.25; addMarker(x, y, 70, 0.8, '#B8A04A', () => hostileZone(x, y, 70, 5, dm, '#6A5A2A'), { owner: e }); } }
    return null;
  },
  wildfire(e, dt){                                                                   /* it sets the grass alight behind it */
    e.twT = (e.twT || 0) - dt;
    if (e.twT <= 0 && hyp(e.vx || 0, e.vy || 0) > 20){ e.twT = 0.45; hostileZone(e.x, e.y, 34, 3.5, e.dmg * 0.2, '#FF8A3A'); }
    return null;
  }
};
function glimTwist(e, dt, ux, uy, d, mvx, mvy, spd){
  const f = GLIM_TWIST[e.def.twist]; if (!f) return null;
  const was = e.twPrev; e.twPrev = e.state;
  return f(e, dt, ux, uy, d, mvx, mvy, spd, was);
}
/* ---- the look: the same animals, with a cold teal glimmer ---- */
const GLIM_DECOR = {
  hyena:       { shards: [[-12, -2, 6], [-6, 2, 6], [0, -2, 6], [6, 2, 5]], eyes: [[18, -2.6], [18, 2.6]] },
  cheetah:     { shards: [[-8, 0, 4], [0, -4, 4], [0, 4, 4], [8, 0, 4], [-30, 0, 6]], eyes: [[19, -2.4], [19, 2.4]] },
  rhino:       { shards: [[27, 0, 12], [20, -7, 7, -0.5], [20, 7, 7, 0.5], [-10, -6, 7], [-10, 6, 7]], eyes: [[18, -6], [18, 6]], aura: 1.2 },
  termite:     { shards: [[-6, -5, 5], [-6, 5, 5], [2, 0, 6], [8, -4, 4], [8, 4, 4]], eyes: [[12, -3], [12, 3]] },
  grub:        { shards: [[-3, 0, 4], [3, 0, 3]], eyes: [[7, -2], [7, 2]], aura: 1.5 },
  vulture:     { shards: [[-4, -16, 6, -1.57], [-4, 16, 6, 1.57], [-10, -10, 5, -2], [-10, 10, 5, 2]], eyes: [[10, -3], [10, 3]] },
  jackal:      { shards: [[-10, 0, 5], [-3, -3, 5], [4, 3, 5]], eyes: [[16, -2.4], [16, 2.4]] },
  warthog:     { shards: [[18, -7, 8, -0.3], [18, 7, 8, 0.3], [-8, 0, 7], [0, 0, 7]], eyes: [[14, -4], [14, 4]] },
  baboon:      { shards: [[2, 0, 6], [-6, -4, 5], [-6, 4, 5]], eyes: [[12, -3], [12, 3]] },
  honeybadger: { shards: [[-10, 0, 8], [-3, 0, 8], [4, 0, 7]], eyes: [[13, -3], [13, 3]] },
  mamba:       { shards: [[-4, 0, 4], [-12, 0, 4], [-20, 0, 4]], eyes: [[9, -2], [9, 2]] },
  ember:       { shards: [[0, 0, 4]], eyes: [[7, -2], [7, 2]], aura: 1.8 },
  lion:        { shards: [[26, -22, 12, -0.6], [34, -10, 12, -0.2], [36, 4, 12, 0.1], [32, 18, 12, 0.5], [22, 28, 12, 0.9], [-16, 0, 14], [-28, 0, 12]], px: true, eyes: [[40, -9], [40, 9]], aura: 1.5 },
  matriarch:   { shards: [[-20, -14, 14], [-6, -18, 14], [10, -16, 14], [-20, 14, 14], [-6, 18, 14], [10, 16, 14], [40, -10, 12, -0.4], [40, 10, 12, 0.4]], px: true, eyes: [[34, -8], [34, 8]], aura: 1.4 },
  buffalo:     { shards: [[34, -14, 16, -0.6], [34, 14, 16, 0.6], [-12, -10, 12], [-12, 10, 12], [4, 0, 12]], px: true, eyes: [[30, -7], [30, 7]], aura: 1.3 },
  crocodile:   { shards: [[-10, -8, 12], [-22, -8, 12], [-34, -8, 12], [-10, 8, 12], [-22, 8, 12], [-34, 8, 12], [32, 0, 10]], px: true, eyes: [[30, -8], [30, 8]], aura: 1.3 },
  wildfire:    { shards: [[-10, -14, 14], [4, -18, 14], [18, -14, 14], [-10, 14, 14], [4, 18, 14], [18, 14, 14], [-24, 0, 16]], px: true, eyes: [[30, -6], [30, 6]], aura: 1.6 }
};
/* The shimmer, redrawn so it sits on the creature instead of over it: a faint stepped halo, a thin crystalline rim, a few faceted crystals growing out of
   the silhouette, twinkling glints, a slow sheen that sweeps along the body, and glowing eyes. GLIM_LK is per animal, in the art's own pixels (the art is
   not scaled by radius): [body center x, half length, half width, crystal count, eye x, eye y, flags (1 = no rim or sheen, 2 = the crystals ride the wings)]. */
const GLIM_LK = {
  hyena: [-1, 17, 11, 3, 17.6, 3.1], cheetah: [0, 18, 8.6, 3, 18.6, 2.6], rhino: [-2, 27, 19, 5, 25, 7.4], termite: [-7, 13, 10, 3, 16.8, 3.6],
  grub: [0, 9, 5.5, 2, 10.4, 1.7], vulture: [-1, 13, 8, 2, 15.4, 2.4, 3], jackal: [-2, 15, 8, 3, 16.2, 2.6], warthog: [-3, 20, 13, 4, 19.2, 3.6],
  baboon: [-3, 12, 12, 3, 16.2, 3.1], honeybadger: [0, 17, 9, 3, 17.2, 3.2], mamba: [-4, 18, 4, 3, 20, 2, 1], ember: [-2, 9, 7, 2, 4.3, 2.1, 1],
  lion: [10, 38, 27, 8, 36, 6.5], matriarch: [-8, 50, 36, 9, 44, 9], buffalo: [-6, 44, 30, 8, 30, 8.4], crocodile: [-20, 36, 15, 8, 22, 10],
  wildfire: [0, 36, 30, 6, 10, 6.3, 1]
};
const GLIM_ANG = [2.5, -2.45, 1.7, -1.8, 3.05, 0.95, -0.95, 2.15, -2.2, -2.85];
const GLIM_SPK = [-0.55, -0.4, 0.15, 0.45, 0.5, -0.25, -0.15, 0.02, -0.75, 0.3, 0.3, 0.12, -0.35, 0.62, 0.7, 0.35, -0.05, -0.62, 0.45, -0.6];
/* one faceted crystal: a light and a dark half, pointing along ang from (x, y) */
function glimCrystal(ctx, x, y, ang, L, w){
  const c = Math.cos(ang), s = Math.sin(ang), m = L * 0.58, v = w * 0.9;
  ctx.fillStyle = '#A8FFF0'; ctx.beginPath();
  ctx.moveTo(x + w * s, y - w * c); ctx.lineTo(x + m * c + v * s, y + m * s - v * c); ctx.lineTo(x + L * c, y + L * s); ctx.lineTo(x, y); ctx.fill();
  ctx.fillStyle = '#1DB3A3'; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + L * c, y + L * s); ctx.lineTo(x + m * c - v * s, y + m * s + v * c); ctx.lineTo(x - w * s, y + w * c); ctx.fill();
}
function glimOverlay(ctx, e){
  const lk = GLIM_LK[e.type]; if (!lk) return;
  const t = G.time, r = e.r, u = clamp(r * 0.3, 4, 15), col = '#4AF0D8', big = !!e.big;
  const heat = e.glimHeat || 0, pulse = 0.65 + 0.35 * Math.sin(t * 3 + e.anim) + heat * 0.4, hc = heat > 0.4 ? '#FF8A4A' : col;
  const cx = lk[0], ax = lk[1], ay = lk[2], n = lk[3], fl = lk[6] || 0, ph = e.x * 0.011 + e.y * 0.007;
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
  softBlob(ctx, cx, 0, r * 1.22, hc, 0.035 + 0.025 * pulse);                                 /* a faint stepped halo, not a veil */
  softBlob(ctx, cx, 0, r * 1.5, hc, 0.03);
  if ((e.state === 'dash' || e.twS === 2) && !e.portrait){                                    /* ghost outlines trailing while it moves fast */
    ctx.strokeStyle = col; ctx.lineWidth = 1.4;
    for (let i = 1; i <= 3; i++){ ctx.globalAlpha = 0.3 / i; ctx.beginPath(); ctx.ellipse(cx - i * r * 0.9, 0, ax * 0.95, ay * 0.95, 0, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (!(fl & 1)){
    ctx.strokeStyle = '#7FFFEA'; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.2 + 0.14 * pulse;   /* thin crystalline rim */
    ctx.beginPath(); ctx.ellipse(cx, 0, ax + 1.2, ay + 1.2, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    const p = ((t * 0.42 + ph) % 1.7) - 0.35;                                                /* a slow sheen sweeping along the body */
    if (p > -0.15 && p < 1.15){
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, 0, ax, ay, 0, 0, TAU); ctx.clip();
      const x0 = cx - ax + p * 2 * ax, bw = ax * 0.22;
      ctx.globalAlpha = 0.2; ctx.fillStyle = '#DFFFF8'; ctx.beginPath();
      ctx.moveTo(x0, -ay); ctx.lineTo(x0 + bw, -ay); ctx.lineTo(x0 + bw - ay * 0.6, ay); ctx.lineTo(x0 - ay * 0.6, ay); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  if (fl & 2){                                                                                /* the vulture wears its crystals on the wing tips, flapping with them */
    const flap = Math.sin(e.anim * 1.6) * 0.5;
    for (let s = -1; s <= 1; s += 2){
      ctx.save(); ctx.rotate(s * flap);
      glimCrystal(ctx, -2, s * 21, s * 1.57 - s * 0.35, 7.5, 1.9); glimCrystal(ctx, -9, s * 19, s * 1.57 + s * 0.6, 5, 1.4);
      ctx.restore();
    }
  }
  for (let j = 0; j < n && j < GLIM_ANG.length; j++){                                        /* crystals growing out of the back and flanks */
    const th = GLIM_ANG[j], ca = Math.cos(th), sa = Math.sin(th), h = ((j * 37) % 7) / 7;
    const L = u * (0.8 + 0.55 * h) * (1 + 0.06 * Math.sin(t * 3 + j * 1.7)), px = cx + ax * ca * 0.96, py = ay * sa * 0.96, ph2 = Math.atan2(sa / ay, ca / ax);
    glimCrystal(ctx, px, py, ph2, L, L * 0.24);
    if (n >= 6 && j % 2 === 0) glimCrystal(ctx, px - sa * 1.5, py + ca * 1.5, ph2 + (sa > 0 ? 0.6 : -0.6), L * 0.55, L * 0.15);
  }
  const ns = big ? 8 : r > 20 ? 6 : r > 11 ? 4 : 2;                                           /* twinkling glints on the hide */
  ctx.fillStyle = '#E8FFFA';
  for (let k = 0; k < ns; k++){
    const sv = Math.sin(t * 1.9 + k * 2.3 + ph), v = sv > 0 ? sv * sv : 0;
    if (v < 0.12) continue;
    const sx = cx + GLIM_SPK[k * 2] * ax * 0.85, sy = GLIM_SPK[k * 2 + 1] * ay * 0.85, q = (1.2 + u * 0.2) * v, w = q * 0.28;
    ctx.globalAlpha = 0.35 + 0.6 * v; ctx.beginPath();
    ctx.moveTo(sx - q, sy); ctx.lineTo(sx - w, sy - w); ctx.lineTo(sx, sy - q); ctx.lineTo(sx + w, sy - w); ctx.lineTo(sx + q, sy);
    ctx.lineTo(sx + w, sy + w); ctx.lineTo(sx, sy + q); ctx.lineTo(sx - w, sy + w); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let s = -1; s <= 1; s += 2){                                                           /* cold lantern eyes, small */
    softBlob(ctx, lk[4], s * lk[5], 1.7 + u * 0.1, hc, 0.32 * pulse);
    fillCircle(ctx, lk[4] + 0.2, s * lk[5], 0.55 + u * 0.035, '#E8FFFA');
  }
  ctx.restore();
  if (!e.portrait){
    if (e.twS === 1 || e.twS === 2) ringPath(ctx, e.x, e.y, r + 6, 2, '#E8FFFA', 0.5 + 0.3 * Math.sin(t * 30));        /* the vulture's dive tell */
    if (Math.random() < 0.05) addParticle(e.x + rand(-r, r), e.y + rand(-r, r), rand(-6, 6), -rand(10, 24), rand(1.2, 2.4), 0.7, col, { glow: true, drag: 1 });
  }
}

/* ========================= CHAPTER 12: AREA 51 ========================= */
/* She drops into the Nevada desert to find out what has been changing the animals. The base is full of soldiers: the same kinds of
   unit as the Space Marines (so they reuse the Chapter 8 behaviors, slot for slot, through MARINE_AI), in desert camouflage with night-vision
   visors, harder than the Marines and in a mix of their own. Only the look, the numbers and the world are new. The look is A51_DRAW (below the
   Marine drawing code). The hidden lab hatch glows green in the middle of the base. */
const A51_MUL = { common: { hp: 27.0, dmg: 6.2, spd: 1.55, val: 13.0 }, boss: { hp: 19.5, dmg: 5.2, spd: 1.4, val: 9.5 } };
const A51_KIT = {
  hyena:       { look: 'a51_guard',    color: '#9C8A60', dark: '#3E3A22', pale: '#E8E0C0' },
  cheetah:     { look: 'a51_jumper',   color: '#8A7A56', dark: '#34301C', pale: '#FF9A2A' },
  rhino:       { look: 'a51_riot',     color: '#4E5A4A', dark: '#1C241C', pale: '#9BE86A', fx: '#9BE86A' },
  termite:     { look: 'a51_pod',      color: '#7E8472', dark: '#2E3228', pale: '#FFB03A' },
  grub:        { look: 'a51_drone',    color: '#B8BCB0', dark: '#3A3E36', pale: '#9BE86A' },
  vulture:     { look: 'a51_lancer',   color: '#6A6A48', dark: '#26261A', pale: '#FFC040' },
  jackal:      { look: 'a51_shock',    color: '#A4906A', dark: '#3E3622', pale: '#7FE8FF' },
  warthog:     { look: 'a51_engineer', color: '#C8A040', dark: '#5A4414', pale: '#FFE080' },
  baboon:      { look: 'a51_medic',    color: '#D8DCCC', dark: '#6E7462', pale: '#4AE07A' },
  honeybadger: { look: 'a51_sledge',   color: '#3E4A3A', dark: '#161C14', pale: '#FFC060' },
  mamba:       { look: 'a51_ghost',    color: '#1E2420', dark: '#0A0E0A', pale: '#9BE86A' },
  ember:       { look: 'a51_demo',     color: '#5E5E4A', dark: '#222218', pale: '#FF4A3A' },
  lion:        { look: 'a51_colonel',  color: '#6E6A44', dark: '#26241A', pale: '#FFB830', title: 'Colonel Hargrove',        fx: '#9BE86A' },
  matriarch:   { look: 'a51_major',    color: '#B8C0B0', dark: '#4A5446', pale: '#9BE86A', title: 'Major Pryce',             fx: '#9BE86A' },
  buffalo:     { look: 'a51_walker',   color: '#566052', dark: '#1E241C', pale: '#FF8A3A', title: 'The Prototype Walker' },
  crocodile:   { look: 'a51_warden',   color: '#2C3A32', dark: '#0C140E', pale: '#9BE86A', title: 'The Gravity Prototype',   fx: '#9BE86A' },
  wildfire:    { look: 'a51_general',  color: '#4C5A44', dark: '#1A2216', pale: '#9BE86A', title: 'General Mercer',          fx: '#9BE86A' }
};
const ETYPES_A51 = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], mul = base.big ? A51_MUL.boss : A51_MUL.common, lk = MARINE_LOOKS[id], k = A51_KIT[id];
  ETYPES_A51[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (lk.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    kbRes: lk.kbRes !== undefined ? lk.kbRes : base.kbRes, ai: lk.ai, marine: true, splitInto: undefined, splitCount: undefined,
    color: k.color, dark: k.dark, pale: k.pale, look: k.look, title: base.big ? k.title : undefined }, k.fx ? { fx: k.fx } : {}, lk.extra || {});
});
ETYPES_A51.turret = Object.assign({}, ETYPES_MARINE.turret, { look: 'a51_turret', color: '#6A6E5A', dark: '#26281E', pale: '#9BE86A' });
/* the knife trooper (not a bestiary entry, like the sword carrier in the other late chapters) */
ETYPES_A51.sword = Object.assign({}, ETYPES_A51.hyena, { ai: 'm_swordsman', look: 'a51_blade', color: '#8A7A56', dark: '#34301C', pale: '#E8E0C0', kbRes: 0.8, hp: ETYPES_A51.hyena.hp * 1.3, spd: ETYPES_A51.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });
const WAVE_FLAVOUR_A51 = [
  'Searchlights find the parachute', 'Boots on the gravel', 'Guards pour out of the barracks', 'Something hums under the sand', '',
  'Jetpacks over the fence line', 'Riot shields lock together', 'Airdrop pods rattle down', 'Medics follow the line', '',
  'Taser sparks in the dark', 'Black-ops shapes in the dust', 'Engineers throw up turrets', 'The hangar doors are opening', '',
  'Sledges swing at the bunker door', 'Drones sweep the runway', 'Every klaxon at once', 'Demolition crews run in', '',
  'The base is on full alert', 'Nowhere left to hide', 'Green light under the hatch', 'The General is on the radio', ''
];
const BOSS_INTRO_A51 = {
  lion: 'Colonel Hargrove has orders to hold the perimeter',
  matriarch: 'Major Pryce calls the airstrike down',
  buffalo: 'A prototype walker steps out of Hangar 18',
  crocodile: 'The ground itself starts to fall upward',
  wildfire: 'General Mercer takes the field in person'
};

/* ---- the base: sand, a runway, hangars seen from above, a fence, props, and the glowing hatch ---- */
let groundPatternA51 = null;
function buildGroundArea51(){
  const c = document.createElement('canvas'); c.width = 160; c.height = 160;
  const g = c.getContext('2d'); if (!g) return;
  g.fillStyle = '#C2A573'; g.fillRect(0, 0, 160, 160);
  for (let i = 0; i < 620; i++){ g.fillStyle = ['#B39663', '#CDB380', '#BCA06C', '#A88C5C', '#D4BC8C', '#B8A070'][(Math.random() * 6) | 0]; g.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  const ctx = CTX; if (ctx && ctx.createPattern) groundPatternA51 = ctx.createPattern(c, 'repeat');
}
const A51_HANGARS = [{ x: 560 * ARENA_K, y: 360 * ARENA_K, w: 380, h: 230 }, { x: 1400 * ARENA_K, y: 320 * ARENA_K, w: 440, h: 250 }, { x: 2240 * ARENA_K, y: 380 * ARENA_K, w: 360, h: 220 }];
const A51_RUNWAY = { x0: 160 * ARENA_K, x1: 2640 * ARENA_K, y: 1560 * ARENA_K, h: 150 };
const A51_HATCH = { x: ARENA_W / 2, y: ARENA_H / 2 - 120, r: 96 };
const A51_TONES = ['#A88C5C', '#D4BC8C', '#B39663', '#9A7E50', '#C8AC78'];
const A51_PATCHES = [], A51_PROPS = [];
for (let i = 0; i < 270; i++) A51_PATCHES.push({ x: csR(i + 9000) * ARENA_W, y: csR(i + 9050) * ARENA_H, rx: 80 + csR(i + 9100) * 220, ry: 50 + csR(i + 9150) * 120, a: csR(i + 9200) * TAU, c: A51_TONES[Math.floor(csR(i + 9250) * A51_TONES.length)], al: 0.16 + csR(i + 9300) * 0.16 });
for (let i = 0; i < 160; i++){
  const x = 80 + csR(i + 9400) * (ARENA_W - 160), y = 80 + csR(i + 9450) * (ARENA_H - 160);
  if (y > A51_RUNWAY.y - 40 && y < A51_RUNWAY.y + A51_RUNWAY.h + 40) continue;
  let bad = hyp(x - A51_HATCH.x, y - A51_HATCH.y) < A51_HATCH.r + 70;
  for (let k = 0; k < A51_HANGARS.length; k++){ const h = A51_HANGARS[k]; if (x > h.x - h.w / 2 - 40 && x < h.x + h.w / 2 + 40 && y > h.y - h.h / 2 - 40 && y < h.y + h.h / 2 + 40) bad = true; }
  if (!bad) A51_PROPS.push({ x: x, y: y, k: Math.floor(csR(i + 9500) * 4), a: (csR(i + 9550) - 0.5) * 0.7 });
}
function buildArea51World(){ G.buildings = []; G.rocket = null; }
function a51Hatch(ctx, t){
  const H = A51_HATCH;
  csGlow(ctx, H.x, H.y, H.r * 2.6, '#9BE86A', 0.2 + 0.07 * Math.sin(t * 2.4));
  ctx.fillStyle = '#34382E'; ctx.beginPath(); ctx.arc(H.x, H.y, H.r + 16, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#F2C230'; ctx.lineWidth = 8; ctx.setLineDash([22, 22]); ctx.beginPath(); ctx.arc(H.x, H.y, H.r + 8, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#1C201A'; ctx.beginPath(); ctx.arc(H.x, H.y, H.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4A5244'; ctx.lineWidth = 4; ctx.beginPath();
  for (let k = 0; k < 6; k++){ const a = k * TAU / 6 + 0.3; ctx.moveTo(H.x + Math.cos(a) * 24, H.y + Math.sin(a) * 24); ctx.lineTo(H.x + Math.cos(a) * H.r, H.y + Math.sin(a) * H.r); }
  ctx.stroke();
  csGlow(ctx, H.x, H.y, H.r * 0.95, '#9BE86A', 0.34 + 0.12 * Math.sin(t * 3.1)); fillCircle(ctx, H.x, H.y, 22, '#2C3A2A'); fillCircle(ctx, H.x, H.y, 13, '#CFFFB0');
}
function a51Prop(ctx, p){
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(4, 6, 22, 12, 0, 0, TAU); ctx.fill();
  if (p.k === 0){                                                                  /* a stack of crates */
    ctx.fillStyle = '#7A5E34'; ctx.fillRect(-18, -14, 36, 28); ctx.strokeStyle = '#4A3A1E'; ctx.lineWidth = 2; ctx.strokeRect(-18, -14, 36, 28);
    ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(18, 14); ctx.moveTo(18, -14); ctx.lineTo(-18, 14); ctx.stroke();
  } else if (p.k === 1){                                                           /* oil drums */
    for (const [dx, dy] of [[-10, -6], [10, -4], [0, 10]]){ fillCircle(ctx, dx, dy, 10, '#4E5A44'); fillCircle(ctx, dx, dy, 7, '#5E6C52'); ctx.strokeStyle = '#2E3828'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(dx, dy, 10, 0, TAU); ctx.stroke(); }
  } else if (p.k === 2){                                                           /* a parked jeep */
    ctx.fillStyle = '#2A2E24'; for (const [wx, wy] of [[-16, -13], [16, -13], [-16, 13], [16, 13]]) ctx.fillRect(wx - 6, wy - 3, 12, 6);
    ctx.fillStyle = '#6A6E4A'; ctx.fillRect(-26, -12, 52, 24); ctx.fillStyle = '#4A4E34'; ctx.fillRect(-26, -12, 52, 5);
    ctx.fillStyle = '#7FB8C8'; ctx.fillRect(8, -10, 8, 20); ctx.fillStyle = '#3A3E2A'; ctx.fillRect(-20, -8, 22, 16);
  } else {                                                                         /* a curve of sandbags */
    for (let k = 0; k < 6; k++){ const a = -1.1 + k * 0.44; ctx.fillStyle = k % 2 ? '#B8A06C' : '#A88E5C'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 22, Math.sin(a) * 22, 9, 6, a + 1.57, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
function drawGroundArea51(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  ctx.fillStyle = groundPatternA51 || '#C2A573';
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  for (let i = 0; i < A51_PATCHES.length; i++){
    const p = A51_PATCHES[i]; if (p.x + p.rx < x0 || p.x - p.rx > x1 || p.y + p.rx < y0 || p.y - p.rx > y1) continue;
    ctx.globalAlpha = p.al; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const R = A51_RUNWAY;                                                             /* the runway, with its threshold bars and edge lights */
  if (R.x1 > x0 && R.x0 < x1 && R.y + R.h > y0 && R.y < y1){
    ctx.fillStyle = '#4A4C50'; ctx.fillRect(R.x0, R.y, R.x1 - R.x0, R.h);
    ctx.fillStyle = '#5E6064'; ctx.fillRect(R.x0, R.y, R.x1 - R.x0, 6); ctx.fillRect(R.x0, R.y + R.h - 6, R.x1 - R.x0, 6);
    ctx.fillStyle = '#E8E4D0'; for (let x = R.x0 + 60; x < R.x1 - 120; x += 150) ctx.fillRect(x, R.y + R.h / 2 - 3, 80, 6);
    for (let k = 0; k < 6; k++){ ctx.fillRect(R.x0 + 14, R.y + 16 + k * 20, 70, 8); ctx.fillRect(R.x1 - 84, R.y + 16 + k * 20, 70, 8); }
    for (let x = R.x0 + 30; x < R.x1; x += 120){ const on = Math.sin(t * 3 + x * 0.01) > -0.4; fillCircle(ctx, x, R.y - 6, 3, on ? '#FFD060' : '#6A5A30'); fillCircle(ctx, x, R.y + R.h + 6, 3, on ? '#FFD060' : '#6A5A30'); }
  }
  for (let i = 0; i < A51_HANGARS.length; i++){                                    /* hangars, from above: corrugated roofs and a glowing bay door */
    const h = A51_HANGARS[i]; if (h.x + h.w / 2 < x0 - 60 || h.x - h.w / 2 > x1 + 60 || h.y + h.h / 2 < y0 - 60 || h.y - h.h / 2 > y1 + 60) continue;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(h.x - h.w / 2 + 10, h.y - h.h / 2 + 12, h.w, h.h);
    ctx.fillStyle = '#7C8078'; ctx.fillRect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
    ctx.fillStyle = '#9A9E94'; for (let k = 0; k < 9; k++) ctx.fillRect(h.x - h.w / 2 + k * (h.w / 9) + 2, h.y - h.h / 2, h.w / 9 - 4, h.h);
    ctx.fillStyle = '#6A6E66'; ctx.fillRect(h.x - h.w / 2, h.y - 3, h.w, 6);
    ctx.strokeStyle = '#4A4E48'; ctx.lineWidth = 4; ctx.strokeRect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
    ctx.fillStyle = '#1A2018'; ctx.fillRect(h.x - 60, h.y + h.h / 2 - 8, 120, 16);
    csGlow(ctx, h.x, h.y + h.h / 2 + 4, 70, '#9BE86A', 0.18 + 0.05 * Math.sin(t * 2 + h.x));
  }
  const H = A51_HATCH; if (H.x + H.r * 2.6 > x0 && H.x - H.r * 2.6 < x1 && H.y + H.r * 2.6 > y0 && H.y - H.r * 2.6 < y1) a51Hatch(ctx, t);
  for (let i = 0; i < A51_PROPS.length; i++){ const p = A51_PROPS[i]; if (p.x < x0 - 60 || p.x > x1 + 60 || p.y < y0 - 60 || p.y > y1 + 60) continue; a51Prop(ctx, p); }
  const FI = 26;                                                                    /* the perimeter fence */
  ctx.strokeStyle = 'rgba(214,218,204,.30)'; ctx.lineWidth = 9; ctx.strokeRect(FI, FI, ARENA_W - FI * 2, ARENA_H - FI * 2);
  ctx.strokeStyle = 'rgba(214,218,204,.75)'; ctx.lineWidth = 2; ctx.strokeRect(FI, FI, ARENA_W - FI * 2, ARENA_H - FI * 2);
  ctx.fillStyle = '#4A4E48';
  for (let x = FI; x <= ARENA_W - FI + 1; x += 90){ if (x > x0 - 20 && x < x1 + 20){ if (FI > y0 - 20 && FI < y1 + 20) ctx.fillRect(x - 3, FI - 6, 6, 12); if (ARENA_H - FI > y0 - 20 && ARENA_H - FI < y1 + 20) ctx.fillRect(x - 3, ARENA_H - FI - 6, 6, 12); } }
  for (let y = FI; y <= ARENA_H - FI + 1; y += 90){ if (y > y0 - 20 && y < y1 + 20){ if (FI > x0 - 20 && FI < x1 + 20) ctx.fillRect(FI - 6, y - 3, 12, 6); if (ARENA_W - FI > x0 - 20 && ARENA_W - FI < x1 + 20) ctx.fillRect(ARENA_W - FI - 6, y - 3, 12, 6); } }
  ctx.fillStyle = '#1A140C'; const pad = 400;                                       /* beyond the fence: dark desert */
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x1 > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x1 - ARENA_W + pad, vh + pad * 2);
  if (y1 > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y1 - ARENA_H + pad);
}

/* ========================= CHAPTER 13: MARS ========================= */
/* The SP-1 carries her to Mars. For the first 15 waves the planet's own creatures, the dust aliens, come up out of the sand: they carry no weapons at
   all (no guns, shields or spears), only claws, jaws, shells and the ground itself, and every kind fights in a way of its own (DUST_AI). After wave 15
   a film shows Marine ships coming down, and for waves 16-25 the dust aliens SWITCH SIDES: they fight the Marines and ignore the giraffe. Those allies
   are not in G.enemies (so nothing she does can touch them and they never hold a wave open); they live in G.allies and behave like ants, going for the
   nearest Marine. There are twice as many Marines as dust aliens, each 0.7 times as powerful as a dust alien would be. */
const MARS_SWITCH_WAVE = 15;
const MARS_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.65, val: 14 }, boss: { hp: 21, dmg: 5.8, spd: 1.45, val: 10 } };
const MARS_MARINE_POWER = 0.7;
const DUST_KIT = {
  hyena:       { look: 'dust_scuttler', ai: 'd_scuttle',  color: '#C8794A', dark: '#6A2E18', pale: '#FFD0A0', blood: '#B04A28', rMul: 0.95, hpMul: 0.8, spdMul: 1.15, role: 'melee' },
  jackal:      { look: 'dust_skink',    ai: 'd_burrow',   color: '#D8A860', dark: '#6A4A22', pale: '#FFE8A8', blood: '#A06A2A', rMul: 0.9,  hpMul: 0.85, spdMul: 1.1, role: 'dash' },
  cheetah:     { look: 'dust_strider',  ai: 'd_stride',   color: '#B8503A', dark: '#4A1810', pale: '#FFB090', blood: '#8A2E1E', rMul: 1.0,  hpMul: 0.8, spdMul: 1.0, role: 'dash' },
  warthog:     { look: 'dust_beetle',   ai: 'd_beetle',   color: '#6A4E3A', dark: '#2A1C12', pale: '#D8A878', blood: '#5A3A22', rMul: 1.2,  hpMul: 1.7, spdMul: 0.75, role: 'melee' },
  rhino:       { look: 'dust_crusher',  ai: 'd_crusher',  color: '#8A6A52', dark: '#3A281C', pale: '#FFC890', blood: '#6A4A32', rMul: 1.25, hpMul: 1.5, spdMul: 0.8, role: 'slam' },
  baboon:      { look: 'dust_leaper',   ai: 'd_leap',     color: '#9A8A4A', dark: '#3E3A1A', pale: '#F0E090', blood: '#7A6A2A', rMul: 1.0,  hpMul: 0.9, spdMul: 1.0, role: 'dash' },
  honeybadger: { look: 'dust_raker',    ai: 'd_raker',    color: '#A8442E', dark: '#3A120A', pale: '#FFA070', blood: '#782414', rMul: 1.0,  hpMul: 1.1, spdMul: 1.0, role: 'melee' },
  vulture:     { look: 'dust_devil',    ai: 'd_devil',    color: '#D8B890', dark: '#8A6A4A', pale: '#FFF0D0', blood: '#B89A70', rMul: 1.0,  hpMul: 0.7, spdMul: 1.15, role: 'whirl' },
  mamba:       { look: 'dust_worm',     ai: 'd_worm',     color: '#B07A52', dark: '#4A2E1A', pale: '#F0C898', blood: '#7A4A28', rMul: 1.05, hpMul: 1.2, spdMul: 1.0, role: 'melee' },
  termite:     { look: 'dust_brood',    ai: 'd_brood',    color: '#9A5A4A', dark: '#3A1A14', pale: '#F0B8A0', blood: '#6A2A20', rMul: 1.3,  hpMul: 1.6, spdMul: 0.65, role: 'brood' },
  grub:        { look: 'dust_mite',     ai: 'd_mite',     color: '#C89A7A', dark: '#6A4A32', pale: '#FFE0C0', blood: '#8A5A3A', rMul: 0.65, hpMul: 0.45, spdMul: 1.3, role: 'melee' },
  ember:       { look: 'dust_spore',    ai: 'd_spore',    color: '#E8A8B8', dark: '#8A3A58', pale: '#FFE8F0', blood: '#B86A88', rMul: 0.9,  hpMul: 0.6, spdMul: 0.7, role: 'burst' },
  lion:        { look: 'dust_alpha',    color: '#B8643A', dark: '#4A1E10', pale: '#FFC890', blood: '#8A3A1E', title: 'The Dune Alpha' },
  matriarch:   { look: 'dust_matron',   color: '#A8584A', dark: '#3E1A18', pale: '#F8B8A8', blood: '#7A2E28', title: 'The Hive Matron' },
  buffalo:     { look: 'dust_titan',    color: '#7A5A44', dark: '#2A1C14', pale: '#FFB878', blood: '#5A3A26', title: 'The Dust Titan' }
};
const ETYPES_MARS = {};
Object.keys(ETYPES).forEach(id => {
  const k = DUST_KIT[id]; if (!k) return;
  const base = ETYPES[id], big = !!base.big, mul = big ? MARS_MUL.boss : MARS_MUL.common;
  ETYPES_MARS[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (k.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd * (k.spdMul || 1), val: Math.round(base.val * mul.val),
    r: base.r * (k.rMul || 1), color: k.color, dark: k.dark, pale: k.pale, blood: k.blood, look: k.look, title: big ? k.title : undefined, dust: true, splitInto: undefined, splitCount: undefined,
    ai: k.ai || base.ai });
});
/* the Marines of Mars: the Chapter 8 troops again, a little over a third weaker than a dust alien would be, and the commanders of the last two boss waves */
const MARS_MARINE_BOSS = {
  crocodile: { look: 'mars_warden',  color: '#8A4A3A', dark: '#2A1410', pale: '#FFB070', title: 'Commander Voss',     fx: '#FFB070' },
  wildfire:  { look: 'mars_admiral', color: '#B8B0A8', dark: '#3A3430', pale: '#FF8A5A', title: 'Fleet Marshal Dray', fx: '#FFB070' }
};
const ETYPES_MARS_MARINE = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], lk = MARINE_LOOKS[id], big = !!base.big, mul = big ? MARS_MUL.boss : MARS_MUL.common, pw = big ? 1 : MARS_MARINE_POWER, bk = MARS_MARINE_BOSS[id];
  ETYPES_MARS_MARINE[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (lk.hpMul || 1) * pw, dmg: base.dmg * mul.dmg * pw, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    kbRes: lk.kbRes !== undefined ? lk.kbRes : base.kbRes, ai: lk.ai, marine: true, splitInto: undefined, splitCount: undefined,
    color: bk ? bk.color : lk.color, dark: bk ? bk.dark : lk.dark, pale: bk ? bk.pale : lk.pale, look: bk ? bk.look : lk.look, title: big ? (bk ? bk.title : lk.title) : undefined }, bk && bk.fx ? { fx: bk.fx } : {}, lk.extra || {});
});
ETYPES_MARS_MARINE.turret = Object.assign({}, ETYPES_MARINE.turret);
ETYPES_MARS_MARINE.sword = Object.assign({}, ETYPES_MARS_MARINE.hyena, { ai: 'm_swordsman', look: 'bladeguard', color: '#3E64A0', dark: '#18284A', pale: '#7FE8FF', kbRes: 0.8, hp: ETYPES_MARS_MARINE.hyena.hp * 1.3, spd: ETYPES_MARS_MARINE.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });
/* the bestiary page for Mars: the dust aliens, and the two Marine commanders in the last two boss slots */
const ETYPES_MARS_BEST = Object.assign({}, ETYPES_MARS, { crocodile: ETYPES_MARS_MARINE.crocodile, wildfire: ETYPES_MARS_MARINE.wildfire });
function marsTableFor(w){ return chapterWaveOf(w) > MARS_SWITCH_WAVE ? ETYPES_MARS_MARINE : ETYPES_MARS; }
function marsDustPool(cw){
  const g = cw * 0.1, out = [], add = (t, wt) => { if (wt > 0) out.push({ t: t, w: wt }); };
  add('hyena', 10); add('grub', cw >= 2 ? 3 + g : 0); add('jackal', cw >= 3 ? 4 + g : 0); add('cheetah', cw >= 3 ? 4 + g : 0);
  add('warthog', cw >= 4 ? 2.4 + g * 0.5 : 0); add('termite', cw >= 5 ? 1.6 + g * 0.4 : 0); add('rhino', cw >= 6 ? 2.6 + g * 0.5 : 0);
  add('ember', cw >= 6 ? 3 + g : 0); add('baboon', cw >= 7 ? 3 + g * 0.5 : 0); add('vulture', cw >= 8 ? 3.4 + g : 0);
  add('honeybadger', cw >= 9 ? 3 + g * 0.6 : 0); add('mamba', cw >= 11 ? 3 + g * 0.5 : 0);
  return out;
}
function marsPick(pool){ let tot = 0; for (let i = 0; i < pool.length; i++) tot += pool[i].w; let r = Math.random() * tot; for (let i = 0; i < pool.length; i++){ r -= pool[i].w; if (r <= 0) return pool[i].t; } return pool[0].t; }
/* waves 16-25: Marines (two thirds of the budget) and, on the other side, half as many dust aliens as there are Marines */
function buildMarsWar(w, budget, isBoss){
  const cw = chapterWaveOf(w), g = cw * 0.1, q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); };
  add('hyena', 7); add('sword', 6 + g); add('cheetah', 5 + g); add('rhino', 4 + g); add('jackal', 6 + g); add('termite', 2.6 + g * 0.6); add('vulture', 4 + g);
  add('grub', 2.4 + g * 0.5); add('ember', 2.8 + g); add('warthog', 2.4 + g * 0.5); add('baboon', 2.4 + g * 0.5); add('honeybadger', 3.2 + g * 0.6); add('mamba', cw >= 18 ? 3 + g * 0.5 : 0);
  const nM = Math.max(8, Math.round(budget * 2 / 3)), nD = Math.max(4, Math.round(nM / 2)), dpool = marsDustPool(MARS_SWITCH_WAVE);
  const gap = Math.max(0.1, 0.5 - w * 0.012);
  let t = 0.3;
  for (let i = 0; i < nM; i++){ q.push({ type: marsPick(pool), t: t }); t += gap * rand(0.55, 1.5); if (Math.random() < 0.16) t += rand(0.3, 0.9); }
  let td = 0.8; const dgap = Math.max(0.2, t / (nD + 1));
  for (let i = 0; i < nD; i++){ q.push({ type: marsPick(dpool), t: td, ally: true }); td += dgap * rand(0.6, 1.4); }
  if (isBoss) q.push({ type: bossForWave(w), t: 1.4, boss: true });
  q.sort((a, b) => a.t - b.t);
  return q;
}
const WAVE_FLAVOUR_MARS = [
  'The sand is moving', 'Something skitters in the dust', 'Burrowers under the ground', 'Long legs on the ridge', '',
  'Beetles roll out of the craters', 'The ground thumps', 'Leapers on the dunes', 'Mites by the hundred', '',
  'Spores drift on the wind', 'Devils walk across the plain', 'The dunes are crawling', 'Every crater is a nest', '',
  'Ships fill the sky', 'The dust has turned on them', 'A war on the plain', 'Rifles against claws', '',
  'The Marines are digging in', 'The dust pours over them', 'Drop pods and spore clouds', 'Nobody here is on your side', ''
];
const WAVE_FLAVOUR_MARS_WAR = WAVE_FLAVOUR_MARS;
const BOSS_INTRO_MARS = {
  lion: 'The Dune Alpha rises out of the red sand',
  matriarch: 'The ground splits as the Hive Matron surfaces',
  buffalo: 'The Dust Titan drags itself out of a crater',
  crocodile: 'Commander Voss leads the first Marine drop',
  wildfire: 'Fleet Marshal Dray brings the flagship down'
};

/* ---- the dust aliens' own behaviors. Called from the enemy update's default branch like MARINE_AI: (e, dt, ux, uy, d, dx, dy) -> [mvx, mvy]. e.spdE is the speed it should use.
   None of them shoots anything: they bite, slam, burst, burrow and swarm. ---- */
const DUST_AI = {
  d_scuttle(e, dt, ux, uy, d){                          /* Dust Scuttler: weaves in as one of a swarm, then a snapping lunge */
    const spd = e.spdE; e.stateT -= dt;
    if (e.state === 'lunge'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.9, 1.6); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const w = Math.sin(e.anim * 0.9 + e.jSeed) * 0.9; e.ang = Math.atan2(uy, ux);
    if (d < 170 && e.stateT <= 0){ e.state = 'lunge'; e.stateT = 0.28; e.dashVX = ux * spd * 3.2; e.dashVY = uy * spd * 3.2; return [e.dashVX, e.dashVY]; }
    return [(ux - uy * w) * spd, (uy + ux * w) * spd];
  },
  d_burrow(e, dt, ux, uy, d){                           /* Sand Skink: dives, runs unseen and untouchable under the sand, and springs up at her feet */
    const spd = e.spdE; e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'dig'){
      e.untarg = true; if (Math.random() < dt * 30) addParticle(e.x, e.y, rand(-30, 30), rand(-30, 30), rand(2, 4), 0.4, '#C8A870', { drag: 2 });
      if (e.stateT <= 0 || d < 70){ e.state = 'idle'; e.stateT = rand(2.6, 4.2); e.untarg = false; burstParticles(e.x, e.y, 10, '#C8A870', 200, 4); hostileBlast(e.x, e.y, 70, e.dmg * 0.8, '#C8A870', { kb: 40, source: e }); }
      return [ux * spd * 2.4, uy * spd * 2.4];
    }
    if (e.stateT <= 0 && d > 200 && d < 700){ e.state = 'dig'; e.stateT = 1.6; sfx('whoosh', 0.1); }
    return [ux * spd, uy * spd];
  },
  d_stride(e, dt, ux, uy, d){                           /* Dune Strider: circles at long range, then runs straight through her */
    const spd = e.spdE; e.stateT -= dt;
    if (e.state === 'dash'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); } e.ang = Math.atan2(e.dashVY, e.dashVX); if (Math.random() < dt * 40) addParticle(e.x, e.y, rand(-30, 30), rand(-30, 30), rand(2, 4), 0.3, '#D8A070', { drag: 2 }); return [e.dashVX, e.dashVY]; }
    e.ang = Math.atan2(uy, ux);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.75; e.dashVX = ux * 800; e.dashVY = uy * 800; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    const rad = d > 340 ? 1 : d < 250 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 520){ e.state = 'wind'; e.stateT = 0.45; }
    return [ux * spd * rad - uy * spd * 0.9 * e.dirS, uy * spd * rad + ux * spd * 0.9 * e.dirS];
  },
  d_beetle(e, dt, ux, uy, d){                           /* Bulwark Beetle: slow to start, hard to stop once it has built up momentum */
    const want = Math.atan2(uy, ux); e.ang = turnTo(e.ang, want, 2.4 * dt);
    const facing = Math.cos(e.ang - want) > 0.9;
    e.mom = clamp((e.mom || 0) + (facing ? dt * 0.55 : -dt * 1.5), 0, 1.6);
    const sp = e.spdE * (0.6 + e.mom);
    return [Math.cos(e.ang) * sp, Math.sin(e.ang) * sp];
  },
  d_crusher(e, dt, ux, uy, d){                          /* Rock Crusher: lumbers in, rears up, and brings both fists down */
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'rear'){
      if (e.stateT <= 0){ const x = e.x + ux * 60, y = e.y + uy * 60, dm = e.dmg * 1.1; e.state = 'idle'; e.stateT = rand(2.4, 3.4); hostileBlast(x, y, 150, dm, '#C8A070', { kb: 90, shake: 8, source: e }); burstParticles(x, y, 16, '#C8A070', 260, 5); }
      return [0, 0];
    }
    if (e.stateT <= 0 && d < 190){ e.state = 'rear'; e.stateT = 0.8; addMarker(e.x + ux * 60, e.y + uy * 60, 150, 0.8, '#C8A070', null, { owner: e }); return [0, 0]; }
    return [ux * e.spdE, uy * e.spdE];
  },
  d_leap(e, dt, ux, uy, d){                             /* Sand Leaper: crouches, jumps (nothing can hit it in the air) and lands in a crash */
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'crouch'){
      if (e.stateT <= 0){ e.state = 'air'; e.stateT = 0.55; e.untarg = true; const dd = Math.min(d, 520); e.dashVX = ux * dd / 0.55; e.dashVY = uy * dd / 0.55; sfx('whoosh', 0.12); }
      return [0, 0];
    }
    if (e.state === 'air'){
      e.z = Math.sin((1 - e.stateT / 0.55) * Math.PI) * 38;
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.3, 2.0); e.untarg = false; e.z = 0; hostileBlast(e.x, e.y, 80, e.dmg * 0.9, '#D8C070', { kb: 50, source: e }); }
      return [e.dashVX, e.dashVY];
    }
    if (e.stateT <= 0 && d < 560){ e.state = 'crouch'; e.stateT = 0.4; return [0, 0]; }
    return [ux * e.spdE * 0.8, uy * e.spdE * 0.8];
  },
  d_raker(e, dt, ux, uy, d){                            /* Rust Raker: a mantis that gets faster the more it is hurt, and sidesteps head-on attacks */
    const hurt = 1 - clamp(e.hp / e.maxHp, 0, 1); e.rage = hurt; e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'side'){
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.0, 2.0); }
      const f = e.spdE * 2.2 * (1 + hurt); return [(ux * 0.3 - uy * e.sideDir) * f, (uy * 0.3 + ux * e.sideDir) * f];
    }
    if (e.stateT <= 0 && d < 260){ e.state = 'side'; e.stateT = 0.22; e.sideDir = Math.random() < 0.5 ? 1 : -1; }
    const f = 1 + 0.9 * hurt; return [ux * e.spdE * f, uy * e.spdE * f];
  },
  d_devil(e, dt, ux, uy, d){                            /* Dust Devil: a corkscrew of sand that spirals in */
    e.spin = (e.spin === undefined ? Math.random() * TAU : e.spin) + dt * 5; e.ang = e.spin;
    if (e.dirD === undefined) e.dirD = Math.random() < 0.5 ? 1 : -1;
    if (Math.random() < dt * 20) addParticle(e.x + rand(-10, 10), e.y + rand(-10, 10), rand(-20, 20), -rand(10, 40), rand(2, 4), 0.5, '#E0C8A0', { drag: 1 });
    const k = clamp((d - 100) / 260, 0, 1), sp = e.spdE;
    return [ux * sp * (0.5 + 0.5 * k) - uy * sp * 0.9 * (0.4 + 0.6 * k) * e.dirD, uy * sp * (0.5 + 0.5 * k) + ux * sp * 0.9 * (0.4 + 0.6 * k) * e.dirD];
  },
  d_worm(e, dt, ux, uy, d){                             /* Dune Worm: tunnels under the sand, then erupts where she is about to be */
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'bury'){
      e.untarg = true; if (Math.random() < dt * 24) addParticle(e.x + rand(-8, 8), e.y + rand(-8, 8), rand(-30, 30), rand(-30, 30), rand(2, 4), 0.4, '#D8B070', { drag: 2 });
      if (d < 230 || e.stateT <= 0){
        const x = clamp(P.x + (P.vx || 0) * 0.35, 60, ARENA_W - 60), y = clamp(P.y + (P.vy || 0) * 0.35, 60, ARENA_H - 60), dm = e.dmg;
        e.state = 'wait';
        addMarker(x, y, 105, 0.7, '#D8B070', () => { if (e.dead) return; e.x = x; e.y = y; e.state = 'surface'; e.stateT = rand(2.2, 3.0); e.untarg = false; hostileBlast(x, y, 105, dm * 1.1, '#D8B070', { kb: 60, shake: 8, source: e }); burstParticles(x, y, 18, '#D8B070', 280, 5); }, { owner: e });
        return [0, 0];
      }
      return [ux * e.spdE * 1.5, uy * e.spdE * 1.5];
    }
    if (e.state === 'wait'){ e.untarg = true; return [0, 0]; }
    if (e.stateT <= 0 && d > 140){ e.state = 'bury'; e.stateT = 3.2; e.untarg = true; return [0, 0]; }
    return [ux * e.spdE * 0.7, uy * e.spdE * 0.7];
  },
  d_brood(e, dt, ux, uy, d){                            /* Brood Mother: keeps her distance and keeps laying mites */
    e.ang = Math.atan2(uy, ux);
    if (e.brT === undefined) e.brT = rand(1.5, 3);
    e.brT -= dt;
    if (e.brT <= 0 && G.enemies.length < 200){ e.brT = rand(4.5, 6.5); for (let k = 0; k < 2; k++){ const a = Math.random() * TAU; spawnEnemy('grub', e.x + Math.cos(a) * (e.r + 8), e.y + Math.sin(a) * (e.r + 8), e.waveRef); } burstParticles(e.x, e.y, 8, '#F0B8A0', 120, 3); sfx('spit', 0.08); }
    const dir = d > 340 ? 1 : d < 230 ? -1 : 0;
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  d_mite(e, dt, ux, uy, d){                             /* Dust Mite: tiny, frantic and everywhere */
    e.jt = (e.jt || 0) - dt; if (e.jt <= 0){ e.jt = rand(0.15, 0.4); e.jx = rand(-1, 1); e.jy = rand(-1, 1); }
    e.ang = Math.atan2(uy, ux);
    return [(ux + (e.jx || 0) * 0.9) * e.spdE, (uy + (e.jy || 0) * 0.9) * e.spdE];
  },
  d_spore(e, dt, ux, uy, d){                            /* Spore Puff: drifts in on the wind, swells, and bursts */
    e.ang = (e.ang || 0) + dt * 0.8;
    if (e.state === 'swell'){
      e.stateT = (e.stateT || 0) - dt;                    /* a missing or broken timer ends the swell at once instead of never */
      if (e.stateT <= 0){ e.detonated = true; hostileBlast(e.x, e.y, 120, e.dmg * 1.1, '#F0A8C0', { kb: 50, source: e }); hostileZone(e.x, e.y, 80, 3, e.dmg * 0.25, '#E888B0'); e.dead = true; }
      return [0, 0];
    }
    if (d < 100){ e.state = 'swell'; e.stateT = 0.55; sfx('click', 0.15); }
    const bob = Math.sin(e.anim * 0.7) * 0.6;
    return [(ux - uy * bob) * e.spdE, (uy + ux * bob) * e.spdE];
  }
};
/* ---- the dust aliens fighting for the giraffe (waves 16-25) ---- */
const ALLY_DMG = { hyena: 0.12, jackal: 0.16, cheetah: 0.16, warthog: 0.2, rhino: 0.22, baboon: 0.18, honeybadger: 0.15, vulture: 0.06, mamba: 0.16, termite: 0.04, grub: 0.05, ember: 0.5 };
function spawnDustAlly(type, x, y){
  const def = ETYPES_MARS[type], k = DUST_KIT[type];
  if (!def || def.big || !k || !G.allies || G.allies.length >= 70) return null;
  const sc = enemyScale(chapterWaveOf(G.wave || 1));
  const a = { type: type, def: def, x: x, y: y, r: def.r, hp: 1, maxHp: 1, spd: def.spd * sc.spd, ang: Math.random() * TAU, anim: Math.random() * 6, atk: rand(0, 0.5), flash: 0, hurt: 0,
    role: k.role, state: 'idle', stateT: rand(0.3, 1.2), dead: false, ally: true, big: false, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1, brT: rand(1.5, 3), dashT: rand(1, 3) };
  G.allies.push(a); burstParticles(x, y, 6, '#7FFFD4', 120, 3, { glow: true });
  return a;
}
function marsAllyHit(a, tgt, frac, extra){
  if (!tgt || tgt.dead || tgt.untarg) return;
  dmgSrc = (a && a.squad) ? 'squad' : 'allies'; damageEnemy(tgt, tgt.maxHp * frac * (tgt.big ? 0.06 : 1), Object.assign({ noCrit: true, quiet: true, color: a.def.color, kb: 40, sx: a.x, sy: a.y }, extra || {}));
}
function marsAllyBlast(a, r, frac){
  const near = enemiesNear(a.x, a.y, r + 40, []);
  for (let i = 0; i < near.length; i++){ const q = near[i]; if (q.dead || q.untarg || hyp(q.x - a.x, q.y - a.y) > r + q.r) continue; marsAllyHit(a, q, frac, { kb: 160 }); }
  burstParticles(a.x, a.y, 14, a.def.color, 260, 5, { glow: true }); addShake(4); sfx('boom', 0.08);
}
function updateAllies(dt){
  squadTick(dt);
  const al = G.allies;
  if (!al || !al.length) return;
  for (let i = al.length - 1; i >= 0; i--){
    const a = al[i];
    if (a.dead || a.hp <= 0){ burstParticles(a.x, a.y, a.squad ? 18 : 8, a.squad ? '#FFD27A' : (a.def.blood || '#B0603A'), a.squad ? 260 : 160, a.squad ? 5 : 3); if (a.squad){ addShake(5); addText(a.x, a.y - 40, SQUAD_SLOTS[a.slot].name + ' falls', '#FFB070', 15, false); a.dead = true; } al.splice(i, 1); continue; }
    a.anim += dt * 6; a.atk -= dt; a.flash -= dt; a.hurt -= dt; a.stateT -= dt; a.dashT -= dt;
    const touching = enemiesNear(a.x, a.y, 80 + a.r, []);
    for (let j = 0; j < touching.length && a.hurt <= 0; j++){
      const e = touching[j];
      if (e.dead || e.untarg || hyp(e.x - a.x, e.y - a.y) >= e.r + a.r) continue;
      if (a.squad){ a.hp -= e.dmg * 0.6; a.hurt = 0.4; a.flash = 0.1; }                       /* a squad alien takes the real damage: nothing reduces it */
      else if (e.def.marine){ a.hp -= 0.12; a.hurt = 0.4; a.flash = 0.1; }
    }
    let tgt = nearestEnemy(a.x, a.y, 1500); if (tgt && (tgt.untarg || tgt.dead)) tgt = null;
    let mx = 0, my = 0, spdMul = 1;
    if (tgt){
      const dx = tgt.x - a.x, dy = tgt.y - a.y, d = hyp(dx, dy) || 1, ux = dx / d, uy = dy / d, reach = tgt.r + a.r + 6;
      a.ang = Math.atan2(uy, ux);
      const frac = (ALLY_DMG[a.type] || 0.12) * (a.squad ? 0.75 : 1);
      if (a.role === 'slam'){
        if (d > 110){ mx = ux; my = uy; spdMul = 0.85; } else if (a.atk <= 0){ a.atk = 2.2; marsAllyBlast(a, 125, frac); }
      } else if (a.role === 'burst'){
        if (d > reach){ mx = ux; my = uy; spdMul = 0.85; } else { marsAllyBlast(a, 115, frac); a.hp = 0; }
      } else if (a.role === 'brood'){
        if (d > 330){ mx = ux; my = uy; spdMul = 0.7; } else if (d < 220){ mx = -ux; my = -uy; spdMul = 0.7; }
        if (a.brT <= 0 && G.allies.length < 60){ a.brT = rand(4, 5.5); const b = spawnDustAlly('grub', a.x + rand(-14, 14), a.y + rand(-14, 14)); if (b) b.ang = a.ang; }
        a.brT -= dt;
      } else if (a.role === 'whirl'){
        if (d > 90){ mx = ux - uy * 0.8; my = uy + ux * 0.8; } else { mx = -uy; my = ux; }
        if (d < 100 && a.atk <= 0){ a.atk = 0.3; marsAllyHit(a, tgt, frac, { kb: 200 }); }
      } else {
        const dashing = a.role === 'dash' && a.dashT < 0.4 && a.dashT > 0;
        if (a.role === 'dash' && a.dashT <= -1.6) a.dashT = rand(2.2, 3.4);
        if (d > reach){ mx = ux; my = uy; spdMul = dashing || (a.role === 'dash' && a.dashT < 0 && a.dashT > -0.4) ? 3 : 1; }
        else if (a.atk <= 0){ a.atk = 0.6; marsAllyHit(a, tgt, frac); sfx('hit', 0.05); }
      }
    } else {                                                           /* nothing to fight: stay near the giraffe */
      const dx = P.x - a.x, dy = P.y - a.y, d = hyp(dx, dy) || 1;
      if (d > 150){ mx = dx / d; my = dy / d; spdMul = 0.7; a.ang = Math.atan2(my, mx); }
    }
    const m = hyp(mx, my);
    if (m > 0){ a.x = clamp(a.x + mx / m * a.spd * spdMul * dt, 20, ARENA_W - 20); a.y = clamp(a.y + my / m * a.spd * spdMul * dt, 20, ARENA_H - 20); }
  }
}
function drawAllies(ctx){
  const al = G.allies;
  if (!al) return;
  const v = viewBounds(80);
  for (let i = 0; i < al.length; i++){
    if (al[i].x < v.x0 || al[i].x > v.x1 || al[i].y < v.y0 || al[i].y > v.y1) continue;
    const a = al[i], col = a.squad ? '#FFD27A' : '#7FFFD4', f = clamp(a.hp / a.maxHp, 0, 1), bw = a.squad ? 34 : 20;
    try { drawEnemy(ctx, a); } catch (err) {}
    ringPath(ctx, a.x, a.y, a.r + 6, a.squad ? 3 : 2, col, 0.55 + 0.2 * Math.sin(G.time * 5 + i));
    if (f < 1 || a.squad){ ctx.fillStyle = 'rgba(18,13,10,.8)'; ctx.fillRect(a.x - bw / 2, a.y - a.r - 12, bw, 4); ctx.fillStyle = col; ctx.fillRect(a.x - bw / 2, a.y - a.r - 12, bw * f, 4); }
  }
}
function marsClearAllies(){
  const al = G.allies; if (!al || !al.length) return;
  for (let i = al.length - 1; i >= 0; i--){ if (al[i].squad) continue; burstParticles(al[i].x, al[i].y, 6, '#7FFFD4', 120, 3, { glow: true }); al.splice(i, 1); }       /* the squad stays on the field */
}
function marsShotHitsAlly(p){
  const al = G.allies;
  for (let i = 0; i < al.length; i++){ const a = al[i]; if (a.dead) continue; if (hyp(a.x - p.x, a.y - p.y) < a.r + p.r){ a.hp -= a.squad ? p.dmg : 0.1; a.flash = 0.1; burstParticles(p.x, p.y, 4, p.color, 140, 3); return true; } }
  return false;
}
function marsBlastAllies(x, y, r, dmg){
  const al = G.allies;
  for (let i = 0; i < al.length; i++){ const a = al[i]; if (hyp(a.x - x, a.y - y) < r + a.r){ a.hp -= a.squad ? (dmg || 0) * 0.6 : 0.2; a.flash = 0.12; } }
}
function marsRestoreHUD(){ HUD.classList.add('on'); if (Input.hasTouch){ TOUCH.classList.add('on'); PAUSEBTN.classList.add('on'); } }

/* ---- Mars: the world ---- */
function marsHas(id){ return !!(Save.data && Save.data.marsUp && Save.data.marsUp[id]); }
function marsHabTier(){ return marsHas('mh3') ? 3 : marsHas('mh2') ? 2 : marsHas('mh1') ? 1 : 0; }
function marsBasePos(){ return { x: ARENA_W * 0.30, y: ARENA_H * 0.30 }; }
function buildMarsWorld(){ G.buildings = []; G.rocket = null; }
let groundPatternMars = null;
function buildGroundMars(){
  const c = document.createElement('canvas'); c.width = 160; c.height = 160;
  const g = c.getContext('2d'); if (!g) return;
  g.fillStyle = '#B4552F'; g.fillRect(0, 0, 160, 160);
  for (let i = 0; i < 700; i++){ g.fillStyle = ['#9A4426', '#C86A3E', '#A84C2A', '#D07A4A', '#8A3C20', '#BC6038'][(Math.random() * 6) | 0]; g.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  const ctx = CTX; if (ctx && ctx.createPattern) groundPatternMars = ctx.createPattern(c, 'repeat');
}
const MARS_TONES = ['#8E3E22', '#C86A3E', '#A0472A', '#D98A56', '#7A3420', '#B85A34'];
const MARS_PATCHES = [], MARS_CRATERS = [], MARS_ROCKS = [], MARS_DEVILS = [], MARS_DUNES = [];
for (let i = 0; i < 360; i++) MARS_PATCHES.push({ x: csR(i + 12000) * ARENA_W, y: csR(i + 12050) * ARENA_H, rx: 90 + csR(i + 12100) * 240, ry: 50 + csR(i + 12150) * 140, a: csR(i + 12200) * TAU, c: MARS_TONES[Math.floor(csR(i + 12250) * MARS_TONES.length)], al: 0.16 + csR(i + 12300) * 0.18 });
for (let i = 0; i < 58; i++) MARS_CRATERS.push({ x: 120 + csR(i + 12400) * (ARENA_W - 240), y: 120 + csR(i + 12450) * (ARENA_H - 240), r: 40 + Math.pow(csR(i + 12500), 1.6) * 130 });
for (let i = 0; i < 200; i++) MARS_ROCKS.push({ x: csR(i + 12600) * ARENA_W, y: csR(i + 12650) * ARENA_H, r: 5 + csR(i + 12700) * 14, a: csR(i + 12750) * TAU });
for (let i = 0; i < 30; i++) MARS_DEVILS.push({ x: csR(i + 12800) * ARENA_W, y: csR(i + 12850) * ARENA_H, ph: csR(i + 12900) * TAU });
for (let i = 0; i < 200; i++) MARS_DUNES.push({ x: csR(i + 13000) * ARENA_W, y: csR(i + 13050) * ARENA_H, l: 80 + csR(i + 13100) * 200, a: -0.3 + csR(i + 13150) * 0.6 });
/* the ground, shared by the run map and the scouting map: o = { w, h } is the size of the map */
function drawMarsTerrain(ctx, x0, y0, vw, vh, t, mw, mh){
  const fx = Math.max(0, x0), fy = Math.max(0, y0), fw = Math.min(mw, x0 + vw) - fx, fh = Math.min(mh, y0 + vh) - fy, sx = mw / ARENA_W, sy = mh / ARENA_H;
  ctx.fillStyle = groundPatternMars || '#B4552F'; ctx.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < MARS_PATCHES.length; i++){ const p = MARS_PATCHES[i], px = p.x * sx, py = p.y * sy; if (px + p.rx < x0 || px - p.rx > x0 + vw || py + p.rx < y0 || py - p.rx > y0 + vh) continue; ctx.globalAlpha = p.al; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(px, py, p.rx, p.ry, p.a, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(120,50,26,.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < MARS_DUNES.length; i++){ const d = MARS_DUNES[i], px = d.x * sx, py = d.y * sy; if (px < x0 - 260 || px > x0 + vw + 260 || py < y0 - 80 || py > y0 + vh + 80) continue; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + Math.cos(d.a) * d.l * 0.5, py + 18, px + Math.cos(d.a) * d.l, py + Math.sin(d.a) * d.l * 0.3); ctx.stroke(); }
  ctx.lineCap = 'butt';
  for (let i = 0; i < MARS_CRATERS.length; i++){
    const c = MARS_CRATERS[i], px = c.x * sx, py = c.y * sy; if (px + c.r < x0 || px - c.r > x0 + vw || py + c.r < y0 || py - c.r > y0 + vh) continue;
    ctx.fillStyle = 'rgba(70,24,12,.35)'; ctx.beginPath(); ctx.ellipse(px, py, c.r, c.r * 0.82, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(140,60,32,.55)'; ctx.beginPath(); ctx.ellipse(px + c.r * 0.08, py + c.r * 0.06, c.r * 0.86, c.r * 0.7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(232,150,100,.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py, c.r, c.r * 0.82, 0, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  }
  for (let i = 0; i < MARS_ROCKS.length; i++){ const r = MARS_ROCKS[i], px = r.x * sx, py = r.y * sy; if (px < x0 - 30 || px > x0 + vw + 30 || py < y0 - 30 || py > y0 + vh + 30) continue; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(px + 3, py + 4, r.r * 1.1, r.r * 0.7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A3A2A'; ctx.beginPath(); ctx.ellipse(px, py, r.r, r.r * 0.7, r.a, 0, TAU); ctx.fill(); ctx.fillStyle = '#8A5440'; ctx.beginPath(); ctx.ellipse(px - r.r * 0.2, py - r.r * 0.2, r.r * 0.5, r.r * 0.3, r.a, 0, TAU); ctx.fill(); }
  for (let i = 0; i < MARS_DEVILS.length; i++){                                                  /* distant dust devils drifting across the plain */
    const v = MARS_DEVILS[i], px = v.x * sx + Math.sin(t * 0.2 + v.ph) * 60, py = v.y * sy + Math.cos(t * 0.15 + v.ph) * 40; if (px < x0 - 120 || px > x0 + vw + 120 || py < y0 - 160 || py > y0 + vh + 160) continue;
    for (let k = 0; k < 6; k++){ const h = k / 6, w = 8 + h * 34; ctx.globalAlpha = 0.16 * (1 - h * 0.5); ctx.fillStyle = '#E8B890'; ctx.beginPath(); ctx.ellipse(px + Math.sin(t * 2 + k + v.ph) * 8 * h, py - h * 90, w, w * 0.4, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
function drawGroundMars(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  drawMarsTerrain(ctx, x0, y0, vw, vh, t, ARENA_W, ARENA_H);
  const b = marsBasePos();
  if (b.x + 240 > x0 && b.x - 240 < x1 && b.y + 240 > y0 && b.y - 240 < y1) drawMarsBase(ctx, b.x, b.y, { hab: marsHabTier(), t: t, s: 0.8 });
  ctx.strokeStyle = 'rgba(40,14,8,.9)'; ctx.lineWidth = 10; ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.fillStyle = '#1C0A06'; const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x1 > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x1 - ARENA_W + pad, vh + pad * 2);
  if (y1 > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y1 - ARENA_H + pad);
}
/* the atmospheric collector on her back: argon trickles in as she walks (the upgrade is in the Mars workshop) */
function marsIronGlyph(ctx, x, y, s){
  softBlob(ctx, x, y, 14 * s, '#FF8A5A', 0.22);
  ctx.fillStyle = '#4A2A22'; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.4; ctx.lineTo(x + Math.cos(a) * 10 * s, y + Math.sin(a) * 8 * s); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8643A'; ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 2 * s, 6 * s, 4 * s, -0.4, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,160,.6)'; ctx.fillRect(x - 5 * s, y - 4 * s, 3 * s, 1.6 * s);
}
function updateMarsCollector(dt){
  if (G.state !== 'playing' || G.attract || G.chapter !== 13 || !marsHas('collector')) return;
  G.marsWalk = (G.marsWalk || 0) + hyp(P.vx || 0, P.vy || 0) * dt;
  const step = marsHas('collector2') ? 170 : 300;
  while (G.marsWalk >= step){ G.marsWalk -= step; G.runArgon = (G.runArgon | 0) + 1; addText(P.x, P.y - 46, '+1 argon', '#C8A0FF', 13, false); }
}
function drawMarsCollector(ctx){
  if (!marsHas('collector') || G.attract || !((G.state === 'playing' && G.chapter === 13) || G.state === 'mscout')) return;
  const moving = hyp(P.vx || 0, P.vy || 0) > 20, t = G.time;
  ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(P.face || 0);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-14, -8, 24, 18);
  ctx.fillStyle = '#C8CCD6'; ctx.fillRect(-15, -9, 22, 16); ctx.strokeStyle = '#5A606C'; ctx.lineWidth = 1.4; ctx.strokeRect(-15, -9, 22, 16);
  ctx.fillStyle = '#7A3AC8'; ctx.fillRect(-12, -6, 8, 10); ctx.fillStyle = '#C8A0FF'; ctx.fillRect(-11, -5, 6, 3);
  ctx.save(); ctx.translate(2, -1); ctx.rotate(t * (moving ? 14 : 3)); ctx.fillStyle = '#4A5060'; ctx.fillRect(-4.6, -1, 9.2, 2); ctx.fillRect(-1, -4.6, 2, 9.2); ctx.restore();
  if (moving) csGlow(ctx, -6, 0, 14, '#B880FF', 0.35 + 0.15 * Math.sin(t * 8));
  ctx.restore();
}

