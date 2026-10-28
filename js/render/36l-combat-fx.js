'use strict';
/* Combat feedback: hit sparks and flashes, a death effect per kind of creature, stains and debris left on the ground. */
/* ========================= COMBAT FEEDBACK ========================= */
/* combatHit(...) is called from damageEnemy, combatDeath(...) from killEnemy, combatMuzzle(...) from addProj,
   drawDecals(...) from render(), and combatFxUpdate(dt) once per frame from update().
   Settings.fxLevel 0 turns it all off, 1 runs it at about 60%. A per-frame particle budget keeps crowded fights from
   turning into a wall of sparks. Nothing here changes damage, health or timing, except the tiny hit-stop on a critical. */
const FXB = { n: 0, cap: 40, stopT: -9, thumpT: -9, biome: '' };

function combatFxUpdate(dt){
  FXB.n = 0; FXB.cap = fxLevelNow() >= 2 ? 44 : 20;
  const ds = G.fxDecals; if (!ds) return;
  if (G.biome !== FXB.biome){ FXB.biome = G.biome; ds.length = 0; }
  for (let i = ds.length - 1; i >= 0; i--){ ds[i].life -= dt; if (ds[i].life <= 0) ds.splice(i, 1); }
}
/* a budgeted particle: sparks and flashes drop out when the frame is already busy */
function fxP(x, y, vx, vy, r, life, color, opts){
  if (FXB.n >= FXB.cap) return;
  FXB.n++;
  addParticle(x, y, vx, vy, r, life, color, opts);
}

/* ---- what a creature is made of decides how it falls apart ---- */
const DEATH_METAL = /drone|bot\b|mech|turret|tank|walker|copter|gunship|rover|bomber|fortress|hover|abrams|colossus|titan|sentry|crawler|droppod|a51_(drone|turret|walker|sledge)|a10|plasmaorb|reaper|swarmcarrier/;
const DEATH_FIRE = /magma|cinder|ember|flare|pyr|inferno|forge|slag|obsidian|firewisp|soot|smoke/;
const DEATH_ICHOR = /^dust_|glim|spore|a51_(pod|ghost|blade|jumper)|alien|venom|mosquito|blastbeetle|jellyfish|jellylet/;
function deathStyle(e){
  const d = e.def || {}, lk = String(d.look || e.type || '');
  if (d.frost) return 'ice';
  if (d.swamp) return 'goo';
  if (d.ocean) return 'bubbles';
  if (DEATH_METAL.test(lk)) return 'metal';
  if (d.inferno || DEATH_FIRE.test(lk)) return 'fire';
  if (d.alien || d.dust || DEATH_ICHOR.test(lk)) return 'ichor';
  return 'flesh';
}

/* ---- ground decals: stains, scorch marks, shards and debris that fade away ---- */
function addDecal(x, y, kind, color, size, rot){
  if (fxLevelNow() <= 0) return;
  if (!G.fxDecals) G.fxDecals = [];
  const ds = G.fxDecals; if (ds.length >= 150) ds.shift();
  const life = kind === 'shards' ? 6 : kind === 'scorch' ? 26 : kind === 'print' ? 9 : kind === 'trample' ? 18 : 15;
  ds.push({ x: x, y: y, kind: kind, color: color, s: size, seed: Math.random(), rot: rot !== undefined ? rot : Math.random() * TAU, life: life, max: life });
}
function drawDecals(ctx, cx, cy, vw, vh){
  const ds = G.fxDecals; if (!ds || !ds.length || fxLevelNow() <= 0) return;
  const x0 = cx - vw / 2 - 40, x1 = cx + vw / 2 + 40, y0 = cy - vh / 2 - 40, y1 = cy + vh / 2 + 40;
  for (let i = 0; i < ds.length; i++){
    const d = ds[i];
    if (d.x < x0 || d.x > x1 || d.y < y0 || d.y > y1) continue;
    const a = Math.min(1, d.life / (d.max * 0.45)), s = d.s;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
    if (d.kind === 'print'){                                   /* a hoof pair pressed into the ground, fading as it fills in */
      ctx.fillStyle = d.color; ctx.globalAlpha = a;
      ctx.beginPath(); ctx.ellipse(-s * 0.7, -s * 0.55, s * 0.9, s * 0.55, 0, 0, TAU); ctx.ellipse(-s * 0.7, s * 0.55, s * 0.9, s * 0.55, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.globalAlpha = a * 0.6;
      ctx.beginPath(); ctx.ellipse(-s * 0.7 + 0.8, -s * 0.55 - 0.8, s * 0.55, s * 0.28, 0, 0, TAU); ctx.ellipse(-s * 0.7 + 0.8, s * 0.55 - 0.8, s * 0.55, s * 0.28, 0, 0, TAU); ctx.fill();
    } else if (d.kind === 'trample'){                          /* flattened grass where something fell */
      ctx.strokeStyle = d.color; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.globalAlpha = a * 0.75;
      ctx.beginPath();
      for (let k = 0; k < 7; k++){ const an = scRnd(d.seed, k) * TAU, di = s * (0.2 + scRnd(d.seed, k + 7) * 0.7), L = s * (0.5 + scRnd(d.seed, k + 14) * 0.5);
        const x0 = Math.cos(an) * di * 0.6, y0 = Math.sin(an) * di * 0.4; ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(an) * L, y0 + Math.sin(an) * L * 0.6); }
      ctx.stroke();
    } else if (d.kind === 'stain' || d.kind === 'goo' || d.kind === 'ichor'){
      ctx.fillStyle = d.color;
      ctx.globalAlpha = (d.kind === 'goo' ? 0.5 : 0.36) * a;
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.7, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 5; k++){
        const an = scRnd(d.seed, k) * TAU, di = s * (0.9 + scRnd(d.seed, k + 9) * 0.8), rr = s * (0.14 + scRnd(d.seed, k + 17) * 0.18);
        ctx.globalAlpha = 0.3 * a;
        ctx.beginPath(); ctx.ellipse(Math.cos(an) * di, Math.sin(an) * di * 0.7, rr, rr * 0.8, an, 0, TAU); ctx.fill();
      }
      if (d.kind !== 'stain'){                                 /* wet: a bright speck in the middle */
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (d.kind === 'ichor' ? 0.38 : 0.12) * a;
        ctx.beginPath(); ctx.ellipse(-s * 0.15, -s * 0.12, s * 0.45, s * 0.28, 0, 0, TAU); ctx.fill();
      }
    } else if (d.kind === 'scorch'){
      ctx.fillStyle = 'rgb(10,6,4)';
      ctx.globalAlpha = 0.3 * a; ctx.beginPath(); ctx.ellipse(0, 0, s * 1.15, s * 0.82, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.28 * a; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.72, s * 0.5, 0, 0, TAU); ctx.fill();
      if (d.life > d.max * 0.82){                              /* still hot */
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FF7A2A';
        ctx.globalAlpha = 0.35 * (d.life - d.max * 0.82) / (d.max * 0.18);
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.45, s * 0.3, 0, 0, TAU); ctx.fill();
      }
    } else if (d.kind === 'shards'){
      ctx.fillStyle = d.color;
      for (let k = 0; k < 6; k++){
        const an = scRnd(d.seed, k) * TAU, di = s * (0.2 + scRnd(d.seed, k + 5) * 0.9), w = 2 + scRnd(d.seed, k + 11) * 3;
        ctx.globalAlpha = 0.75 * a;
        ctx.save(); ctx.translate(Math.cos(an) * di, Math.sin(an) * di * 0.7); ctx.rotate(an * 2);
        ctx.beginPath(); ctx.moveTo(0, -w * 1.5); ctx.lineTo(w, 0); ctx.lineTo(0, w * 1.5); ctx.lineTo(-w, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    } else if (d.kind === 'debris'){
      ctx.fillStyle = 'rgb(10,6,4)'; ctx.globalAlpha = 0.22 * a;
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.9, s * 0.62, 0, 0, TAU); ctx.fill();
      const cols = ['#8A8E98', '#5A5E68', '#C8CCD6', '#3A3E48'];
      for (let k = 0; k < 7; k++){
        const an = scRnd(d.seed, k) * TAU, di = s * (0.1 + scRnd(d.seed, k + 5) * 0.95), w = 1.4 + scRnd(d.seed, k + 11) * 2.6;
        ctx.fillStyle = cols[k % 4]; ctx.globalAlpha = 0.85 * a;
        ctx.save(); ctx.translate(Math.cos(an) * di, Math.sin(an) * di * 0.7); ctx.rotate(an * 3);
        ctx.fillRect(-w, -w * 0.6, w * 2, w * 1.2);
        ctx.restore();
      }
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

/* ---- hits ---- */
function combatHit(e, dmg, crit, opts){
  const fx = fxLevelNow();
  if (fx <= 0 || opts.quiet || FXB.n >= FXB.cap) return;
  const maxHp = e.maxHp || e.hp || 1, heavy = dmg >= Math.max(40, maxHp * 0.2);
  const ang = opts.kbAngle !== undefined ? opts.kbAngle : Math.atan2(e.y - (opts.sy !== undefined ? opts.sy : P.y), e.x - (opts.sx !== undefined ? opts.sx : P.x));
  const hx = e.x - Math.cos(ang) * e.r * 0.75, hy = e.y - Math.sin(ang) * e.r * 0.75;
  const base = crit ? '#FFE8A0' : (typeof opts.color === 'string' && opts.color.charAt(0) === '#' ? opts.color : '#FFEFC4');
  const n = Math.max(2, Math.round((crit ? 7 : heavy ? 5 : 3) * (fx >= 2 ? 1 : 0.6)));
  for (let i = 0; i < n; i++){
    const a = ang + rand(-0.95, 0.95), s = rand(170, 420);
    fxP(hx, hy, Math.cos(a) * s, Math.sin(a) * s, rand(1.5, 2.6), rand(0.14, 0.3), i % 2 ? '#FFFFFF' : base, { shape: 'streak', drag: 3.4, glow: true });
  }
  fxP(hx, hy, 0, 0, Math.min(26, e.r * (crit ? 0.9 : 0.55) + 4), crit ? 0.18 : 0.12, crit ? '#FFF4C8' : base, { shape: 'flash', drag: 0, shrink: false, glow: true });
  if ((heavy || crit) && G.time - FXB.thumpT > 0.12) { FXB.thumpT = G.time; SFX.thump(); }       /* a low thump under a heavy hit */
  if (crit){
    for (let i = 0; i < 6; i++){                              /* a star: six short rays out of the wound */
      const a = i / 6 * TAU + rand(-0.15, 0.15);
      fxP(hx, hy, Math.cos(a) * 300, Math.sin(a) * 300, 2.6, 0.2, '#FFFFFF', { shape: 'streak', drag: 5, glow: true });
    }
    if (G.time - FXB.stopT > 0.28 && G.state === 'playing' && !G.attract){ FXB.stopT = G.time; hitstop(0.022); }
  }
}

/* a little flash where a shot leaves the giraffe */
function combatMuzzle(x, y, vx, vy, color, r){
  if (fxLevelNow() <= 0 || FXB.n >= FXB.cap || G.attract) return;
  if (hyp(x - P.x, y - P.y) > 90) return;             /* only shots that really leave her, not turrets and mines */
  const a = Math.atan2(vy, vx), c = typeof color === 'string' && color.charAt(0) === '#' ? color : '#FFE6A3';
  fxP(x, y, 0, 0, Math.max(5, r * 1.6), 0.1, c, { shape: 'flash', drag: 0, shrink: false, glow: true });
  fxP(x, y, Math.cos(a + 0.5) * 150, Math.sin(a + 0.5) * 150, 1.6, 0.14, '#FFFFFF', { shape: 'streak', drag: 4, glow: true });
  fxP(x, y, Math.cos(a - 0.5) * 150, Math.sin(a - 0.5) * 150, 1.6, 0.14, '#FFFFFF', { shape: 'streak', drag: 4, glow: true });
}

/* ---- deaths ---- */
function combatDeath(e){
  const fx = fxLevelNow(); if (fx <= 0) return;
  const d = e.def || {}, big = !!e.big, r = e.r, st = deathStyle(e), col = e.blood || d.blood || '#8E3B2B';
  const sc = big ? 1.8 : clamp(r / 15, 0.6, 1.4), q = fx >= 2 ? 1 : 0.6;
  const N = function(k){ return Math.max(1, Math.round(k * q * (big ? 1.8 : 1))); };
  const burst = function(n, spd, rr, life, color, opts, up){
    for (let i = 0; i < n; i++){
      const a = Math.random() * TAU, s = rand(spd * 0.4, spd);
      addParticle(e.x, e.y, Math.cos(a) * s, Math.sin(a) * s + (up || 0), rand(rr * 0.6, rr), rand(life * 0.7, life), typeof color === 'function' ? color(i) : color, opts);
    }
  };
  switch (st){
    case 'ice':
      burst(N(9), 260, 4.2 * sc, 0.8, function(i){ return ['#EAF6FA', '#BEEFFF', '#8FD6F0'][i % 3]; }, { shape: 'diamond', drag: 1.7 });
      addParticle(e.x, e.y, 0, 0, 9 * sc, 0.55, 'rgba(234,246,250,0.9)', { shape: 'puff', drag: 0, shrink: false });
      addDecal(e.x, e.y, 'shards', '#CFEFFF', r * 1.4);
      break;
    case 'goo':
      burst(N(8), 220, 4.6 * sc, 0.9, col, { drag: 2.2, shrink: false });
      addParticle(e.x, e.y, 0, -14, 10 * sc, 0.9, 'rgba(122,154,58,0.8)', { shape: 'puff', drag: 0.6, shrink: false });
      addDecal(e.x, e.y, 'goo', col, r * 1.15);
      break;
    case 'bubbles':
      for (let i = 0; i < N(9); i++) addParticle(e.x + rand(-r, r) * 0.6, e.y + rand(-r, r) * 0.6, rand(-22, 22), rand(-95, -40), rand(2, 4.4) * sc * 0.8, rand(0.8, 1.3), 'rgba(224,247,252,0.85)', { shape: 'ring', drag: 0.8, shrink: false });
      addParticle(e.x, e.y + r * 0.4, 0, 0, r * 0.9, 0.7, 'rgba(210,245,250,0.8)', { shape: 'wake', drag: 0, shrink: false });
      break;
    case 'metal':
      burst(N(8), 420, 2.2, 0.35, '#FFD27A', { shape: 'streak', drag: 3, glow: true });
      burst(N(6), 240, 3.4 * sc, 0.75, function(i){ return ['#8A8E98', '#5A5E68', '#C8CCD6'][i % 3]; }, { shape: 'rock', drag: 1.8, shrink: false });
      addParticle(e.x, e.y, 0, -22, 9 * sc, 0.9, 'rgba(58,58,64,0.9)', { shape: 'puff', drag: 0.5, shrink: false });
      addDecal(e.x, e.y, 'debris', col, r * 1.2);
      break;
    case 'fire':
      burst(N(11), 200, 3.2 * sc, 0.9, function(i){ return i % 3 ? '#FF9A3A' : '#FFD27A'; }, { glow: true, drag: 1.6 }, -60);
      addParticle(e.x, e.y, 0, -26, 10 * sc, 1.0, 'rgba(58,51,48,0.85)', { shape: 'puff', drag: 0.5, shrink: false });
      addDecal(e.x, e.y, 'scorch', col, r * 1.5);
      break;
    case 'ichor':
      burst(N(10), 260, 3.8 * sc, 0.75, col, { glow: true, drag: 2 });
      addParticle(e.x, e.y, 0, 0, 12 * sc, 0.45, col, { shape: 'flash', drag: 0, shrink: false, glow: true });
      addDecal(e.x, e.y, 'ichor', col, r * 1.2);
      break;
    default:
      burst(N(5), 150, 3.6 * sc, 0.7, 'rgba(201,181,138,0.75)', { shape: 'puff', drag: 1.5, shrink: false });
      addDecal(e.x, e.y, 'stain', col, r * 1.1);
  }
  if (big){                                                  /* a boss falls with a ring of dust and a burst of light */
    addParticle(e.x, e.y + r * 0.3, 0, 0, r * 1.4, 0.9, 'rgba(255,240,200,0.8)', { shape: 'wake', drag: 0, shrink: false });
    addParticle(e.x, e.y, 0, 0, r * 1.3, 0.35, '#FFF1C0', { shape: 'flash', drag: 0, shrink: false, glow: true });
    for (let i = 0; i < N(10); i++){
      const a = i / 10 * TAU + rand(-0.2, 0.2);
      addParticle(e.x, e.y, Math.cos(a) * 380, Math.sin(a) * 380, 3, 0.4, '#FFFFFF', { shape: 'streak', drag: 3.5, glow: true });
    }
  }
}

/* ---- how big a damage number is, from how hard the hit was ---- */
function dmgTextSize(dmg, crit){
  const s = 12 + Math.log(dmg + 1) * 1.45;
  return Math.round(clamp(crit ? s + 5 : s, 13, crit ? 30 : 24));
}
function dmgTextColor(dmg, crit, base){
  if (crit) return '#FFF1C2';
  if (base && base !== '#FFE6B8') return base;
  return dmg >= 400 ? '#FF9A5A' : dmg >= 120 ? '#FFC470' : dmg >= 40 ? '#FFD890' : '#FFE6B8';
}
