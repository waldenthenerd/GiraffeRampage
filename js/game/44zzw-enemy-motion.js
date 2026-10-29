'use strict';
/* Enemy motion: how a creature moves, reacts and falls. */
/* Everything here is drawn around the creature's own picture (the sprite cache in 44t-enemy-sprites.js keeps working) by bending the canvas before the picture is drawn, so it costs a few
   canvas transforms per creature and no new pictures:
     gait: the stride follows how fast the creature really moves (it stops when it stands or is stunned, runs when it is hurried or buffed), and each creature has its own stride
     idle life: a breath when it is still, a roll and a squash and stretch with every step, a wobble when stunned
     lean: it turns smoothly (its picture follows its heading a moment late) and leans into the turn
     telegraph: a wind-up crouches back and trembles, an attack stretches forward, so a fight can be read
     hit: a short recoil and squash away from the blow
     death: the creature does not vanish, it falls by what it was made of (deathStyle in 36l-combat-fx.js): it topples, shatters, melts, floats up and pops, jolts and spins, swells and bursts
   The extra motion is off when effects are off (fxLevelNow() === 0). Portraits (bestiary, menus, photos) are drawn plainly. */
const EM = { corpses: [], cap: 24, hitTime: 0.18 };
const EM_ATTACK = { dash: 1, lunge: 1, charge: 1, leap: 1, roll: 1, slam: 1, spin: 1, sprint: 1, burst: 1, stomp: 1, whip: 1, sweep: 1, salvo: 1, slide: 1, drive: 1, quake: 1 };
const EM_WIND = { crouch: 1, pre: 1, rear: 1, aim: 1, wind: 1 };
/* how much a creature rolls and squashes as it walks: animals fully, machines less */
function emFamily(d){
  if (d._emf !== undefined) return d._emf;
  const st = typeof deathStyle === 'function' ? deathStyle({ def: d, type: d.look || '' }) : 'flesh';
  return d._emf = st === 'metal' ? 0.35 : st === 'fire' ? 0.7 : 1;
}
function emWinding(s){ return EM_WIND[s] === 1 || /wind$/.test(s); }
const em_updateEnemies = updateEnemies;
updateEnemies = function(dt){
  const list = G.enemies;
  for (let i = 0; i < list.length; i++){ const e = list[i]; e._px = e.x; e._py = e.y; }
  em_updateEnemies(dt);
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 1;
  for (let i = 0; i < list.length; i++){
    const e = list[i]; if (e.dead || e._px === undefined) continue;
    if (e.gaitK === undefined){ e.gaitK = 0.88 + Math.random() * 0.24; e.ph = Math.random() * TAU; e._va = e.ang; e._st = e.state; e._stt = 0; }
    if (e.state !== e._st){ e._st = e.state; e._stt = 0; } else e._stt += dt;
    if (e.hitT > 0) e.hitT -= dt;
    if (fx <= 0) continue;
    const ref = Math.max(24, e.spd || 60), v = Math.hypot(e.x - e._px, e.y - e._py) / Math.max(dt, 1e-4);
    const f = e.stunT > 0 ? 0.08 : Math.min(2.2, Math.max(0.12, v / ref));
    e._f = f;
    e.anim += dt * 6 * (f * e.gaitK - 1);                                             /* the stride: the update added dt * 6, this makes it follow the real speed */
    const lag = angDiff(e.ang, e._va); e._lag = lag;
    e._va += lag * Math.min(1, dt * (e.big ? 8 : 15));                               /* the picture turns after the heading */
  }
  for (let i = EM.corpses.length - 1; i >= 0; i--){ const c = EM.corpses[i]; c.t += dt; if (c.t >= c.life || G.time < c.t0) EM.corpses.splice(i, 1); }
};
const em_damageEnemy = damageEnemy;
damageEnemy = function(e, amount, opts){
  const r = em_damageEnemy(e, amount, opts);
  if (r > 0){
    const o = opts || {};
    e.hitT = EM.hitTime; e.hitS = (e.big ? 0.4 : 1) * (r > 0 && e.def && e.def.shieldArc ? 0.5 : 1);
    e.hitA = o.kbAngle !== undefined ? o.kbAngle : Math.atan2(e.y - (o.sy !== undefined ? o.sy : P.y), e.x - (o.sx !== undefined ? o.sx : P.x));
  }
  return r;
};
const em_killEnemy = killEnemy;
killEnemy = function(e, opts){
  const was = e.dead;
  em_killEnemy(e, opts);
  if (was || !e.dead || G.attract || e.portrait || typeof fxLevelNow !== 'function' || fxLevelNow() <= 0) return;
  if (EM.corpses.length >= EM.cap) EM.corpses.shift();
  const f = Object.assign({}, e, { state: 'idle', flash: 0, hp: 1, maxHp: 1, burnT: 0, stunT: 0, slowT: 0, slowMul: 1, kx: 0, ky: 0, ang: e._va !== undefined ? e._va : e.ang, _sk: null, dead: false });
  const a = e.hitA !== undefined ? e.hitA : Math.atan2(e.y - P.y, e.x - P.x);
  EM.corpses.push({ e: f, st: deathStyle(e), t: 0, life: e.big ? 0.95 : 0.42, hx: Math.cos(a), hy: Math.sin(a), tilt: Math.sin((e.ph || e.x) * 12.9898) > 0 ? 1 : -1, t0: G.time });
};
const EM_M = [1, 0, 0, 1, 0, 0];
function emT(M, x, y){ M[4] += M[0] * x + M[2] * y; M[5] += M[1] * x + M[3] * y; }
function emR(M, a){ const c = Math.cos(a), s = Math.sin(a), a0 = M[0], b0 = M[1], c0 = M[2], d0 = M[3]; M[0] = a0 * c + c0 * s; M[1] = b0 * c + d0 * s; M[2] = c0 * c - a0 * s; M[3] = d0 * c - b0 * s; }
function emS(M, x, y){ M[0] *= x; M[1] *= x; M[2] *= y; M[3] *= y; }
const em_draw = drawEnemy;                                                          /* the drawing before this file (it already knows size variety and elite crowns) */
drawEnemy = function(ctx, e){
  if (e.portrait || e.dead || e._va === undefined || e._f === undefined || fxLevelNow() <= 0) return em_draw(ctx, e);
  const r = e.r, va = e._va, f = e._f, fam = emFamily(e.def), fly = e.def.fly ? 0.4 : 1, st = e.state, t = G.time;
  let sx = 1, sy = 1, roll = 0, fwd = 0, tx = 0, ty = 0;
  const walk = Math.min(1, f);
  roll += Math.sin(e.anim) * 0.05 * walk * fam * fly;                                 /* waddle */
  const sq = Math.sin(e.anim * 2) * walk; sx *= 1 + 0.03 * sq * fam; sy *= 1 - 0.022 * sq * fam;      /* squash and stretch with each step */
  if (f < 0.5){ const b = 1 + 0.018 * Math.sin(t * 2.4 + e.ph) * (1 - f * 2); sx *= b; sy *= b; }        /* a breath when still */
  const lag = e._lag || 0; sy *= 1 - 0.1 * Math.min(1, Math.abs(lag) * 2.5); roll += lag * 0.18 * fam;   /* a lean into the turn */
  if (e.stunT > 0) roll += Math.sin(t * 30 + e.ph) * 0.07;
  const big = e.big ? 0.6 : 1;
  if (emWinding(st)){                                                                 /* a wind-up: crouch back and tremble */
    const p = Math.min(1, e._stt / 0.4), q = p * p * (3 - 2 * p);
    fwd -= r * 0.16 * q * big; sx *= 1 - 0.12 * q * big; sy *= 1 + 0.1 * q * big;
    tx += Math.sin(t * 70 + e.ph) * r * 0.03 * q; ty += Math.cos(t * 83 + e.ph) * r * 0.03 * q;
  } else if (EM_ATTACK[st] === 1){                                                    /* an attack: stretch out and lunge */
    const p = 1 - Math.min(1, e._stt / 0.35);
    fwd += r * 0.12 * p * big; sx *= 1 + 0.14 * p * big; sy *= 1 - 0.08 * p * big;
  }
  const h = e.hitT > 0 ? e.hitT / EM.hitTime : 0, ha = e.hitA || 0, M = EM_M;
  M[0] = 1; M[1] = 0; M[2] = 0; M[3] = 1; M[4] = e.x; M[5] = e.y;                  /* the whole bend is worked out as one matrix, then applied once */
  if (h > 0){ const hs = e.hitS === undefined ? 1 : e.hitS; emT(M, Math.cos(ha) * r * 0.18 * h * hs, Math.sin(ha) * r * 0.18 * h * hs); emR(M, ha); emS(M, 1 - 0.2 * h * hs, 1 + 0.12 * h * hs); emR(M, -ha); }
  emR(M, va); emT(M, fwd + tx - r * 0.3, ty); emR(M, roll); emT(M, r * 0.3, 0);
  emS(M, sx, sy); emR(M, -va); emT(M, -e.x, -e.y);
  ctx.save();
  ctx.transform(M[0], M[1], M[2], M[3], M[4], M[5]);
  const ang = e.ang; e.ang = va;
  em_draw(ctx, e);
  e.ang = ang;
  ctx.restore();
};
/* the fallen: drawn flat, under everything that stands */
function emCorpse(ctx, c){
  const e = c.e, r = e.r, k = c.t / c.life, ease = 1 - (1 - k) * (1 - k), st = c.st;
  let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al = 1;
  if (e.big){
    const s = 1 - 0.6 * k * k; sx = sy = s; ox = Math.sin(k * 70) * r * 0.05 * (1 - k); oy = Math.cos(k * 83) * r * 0.05 * (1 - k); rot = c.tilt * 0.5 * k; e.flash = Math.floor(k * 12) % 2 ? 0.1 : 0;
  } else switch (st){
    case 'ice': sx = sy = 1 + 0.05 * Math.sin(k * 60) * (1 - k) - 0.3 * k * k; al = k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45; break;
    case 'goo': sy = 1 - 0.65 * ease; sx = 1 + 0.3 * ease; al = 1 - k * k; break;
    case 'bubbles': oy = -r * 0.8 * k; sx = sy = 1 + 0.15 * k; al = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4; break;
    case 'metal': rot = c.tilt * 1.4 * k; sx = sy = 1 - 0.3 * k; al = (k > 0.3 && Math.floor(k * 14) % 2 === 0 ? 0.45 : 1) * (1 - k * k * k); break;
    case 'fire': sx = sy = k < 0.35 ? 1 + 0.35 * (k / 0.35) : 1.35 - 1.15 * ((k - 0.35) / 0.65); al = 1 - Math.pow(k, 1.5); break;
    case 'ichor': sx = 1 + 0.12 * Math.sin(k * 30) - 0.5 * k; sy = 1 - 0.25 * k - 0.5 * k; rot = c.tilt * 0.2 * k; al = 1 - k; break;
    default: sy = 1 - 0.45 * ease; sx = 1 + 0.12 * k; rot = c.tilt * 0.35 * k; ox = c.hx * r * 0.4 * ease; oy = c.hy * r * 0.4 * ease; al = k < 0.5 ? 1 : 1 - (k - 0.5) * 2;
  }
  ctx.save();
  ctx.translate(e.x + ox, e.y + oy); ctx.rotate(rot); ctx.rotate(e.ang); ctx.scale(sx, sy); ctx.rotate(-e.ang); ctx.translate(-e.x, -e.y);
  if (al < 1) ctx.globalAlpha = Math.max(0, al);
  em_draw(ctx, e);
  ctx.restore();
}
const em_drawActorsSorted = drawActorsSorted;
drawActorsSorted = function(ctx, cx, cy, vw, vh){
  const cs = EM.corpses;
  if (cs.length && fxLevelNow() > 0){
    for (let i = 0; i < cs.length; i++){ const c = cs[i], e = c.e; if (e.x < cx - vw / 2 - 90 || e.x > cx + vw / 2 + 90 || e.y < cy - vh / 2 - 90 || e.y > cy + vh / 2 + 90) continue; emCorpse(ctx, c); }
  }
  em_drawActorsSorted(ctx, cx, cy, vw, vh);
};
