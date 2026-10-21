'use strict';
/* Particles, zones, shockwaves, projectiles, pickups, damage and death, player damage, draw helpers, targeting. */
/* ========================= 6. PARTICLES & TEXT ========================= */
function addParticle(x, y, vx, vy, r, life, color, opts){
  const ps = G.particles;
  if (ps.length >= MAX_PARTICLES) ps.shift();
  opts = opts || {};
  ps.push({ x:x, y:y, vx:vx, vy:vy, r:r, life:life, max:life, color:color,
    drag: opts.drag === undefined ? 2.6 : opts.drag,
    shape: opts.shape || 'dot', rot: opts.rot || Math.random() * TAU,
    spin: opts.spin || rand(-6, 6), glow: !!opts.glow, shrink: opts.shrink !== false });
}
function burstParticles(x, y, n, color, spd, size, opts){
  for (let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = rand(spd * 0.35, spd);
    addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(size * 0.5, size), rand(0.22, 0.5), color, opts);
  }
}
function coneParticles(x, y, ang, n, color, spd, size, spread){
  for (let i = 0; i < n; i++){
    const a = ang + rand(-spread, spread), s = rand(spd * 0.3, spd);
    addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(size * 0.5, size), rand(0.18, 0.42), color, { glow:true });
  }
}
function addText(x, y, txt, color, size, crit){
  const ts = G.texts;
  if (ts.length >= MAX_TEXTS) ts.shift();
  const t = { x: x + rand(-6, 6), y: y, vy: crit ? -62 : -46, vx: rand(-14, 14),
    life: crit ? 0.95 : 0.7, max: crit ? 0.95 : 0.7, txt: txt, color: color,
    size: size || 14, crit: !!crit, pop: 0, val: 0, rot: crit ? rand(-0.16, 0.16) : 0 };
  ts.push(t);
  return t;
}

/* ========================= 7. GROUND ZONES (lingering damage) ========================= */
function addZone(x, y, r, dur, dps, color, opts){
  opts = opts || {};
  G.zones.push({ x:x, y:y, r:r, r0: opts.grow ? r * 0.25 : r, life: dur, max: dur, dps: dps,
    color: color, key: 'z' + (G.zones.length) + '_' + (G.time | 0), tick: opts.tick || 0.35,
    slow: opts.slow || 0, grow: !!opts.grow, id: ++zoneId, src: dmgSrc });
}
let zoneId = 0;

/* ========================= 8. SHOCKWAVES ========================= */
function addShock(x, y, maxR, dur, dmg, color, opts){
  opts = opts || {};
  G.shocks.push({ x:x, y:y, r: opts.r0 || 6, maxR: maxR, life: dur, max: dur, dmg: dmg, color: color,
    hit: new Set(), width: opts.width || 9, kb: opts.kb || 200, stun: opts.stun || 0,
    burn: opts.burn || 0, pull: opts.pull || 0, filled: !!opts.filled, id: ++shockId, src: dmgSrc });
}
let shockId = 0;

/* ========================= 9. PROJECTILES ========================= */
function addProj(x, y, vx, vy, r, dmg, color, opts){
  opts = opts || {};
  G.projectiles.push({ x:x, y:y, vx:vx, vy:vy, r:r, dmg:dmg, color:color,
    life: opts.life || 1.6, pierce: opts.pierce || 0, homing: opts.homing || 0,
    src: dmgSrc, hit: new Set(), split: opts.split || 0, pool: opts.pool || null, explode: opts.explode || null, kind: opts.kind || 'spit',
    rot: 0, spin: opts.spin || 0, trail: opts.trail !== false, burn: opts.burn || 0, kb: opts.kb || 90 });
  combatMuzzle(x, y, vx, vy, color, r);
}
/* Chapters 8 and 9: every enemy bullet flies at half speed (and lives twice as long, so it still covers the same distance). */
const EPROJ_SLOW = 0.5;
/* Chapters 8 and 9 are the gentler endgame: ordinary enemies have less health and hit softer, she is invulnerable for the
   normal 0.62 s after a hit (the other late chapters give 0.34 s), and she and her rover move a little faster. Bosses are untouched. */
const CH89_EASE_HP = 0.8, CH89_EASE_DMG = 0.75, CH89_SPEED_MUL = 1.08, CH89_INVULN = 1.0;
function biomeInvulnFactor(){
  if (G.biome === 'moon' || G.biome === 'venus') return CH89_INVULN;
  return (G.biome === 'jungle' || G.biome === 'city' || G.biome === 'space') ? 0.55 : 1;       /* the rainforest, the city and space give far less breathing room */
}
function eprojSpeedMul(){ return chapterOf(G.wave) >= 8 ? EPROJ_SLOW : 1; }
function addEProj(x, y, vx, vy, r, dmg, color, o){
  const p = { x:x, y:y, vx:vx, vy:vy, r:r, dmg:dmg, color:color, life: 3.2, rot: 0 };
  if (o) Object.assign(p, o);
  const m = eprojSpeedMul(); if (m !== 1){ p.vx *= m; p.vy *= m; p.life /= m; }
  G.eproj.push(p);
}

/* ========================= 10. PICKUPS ========================= */
function addPickup(x, y, type){
  G.pickups.push({ x:x, y:y, type:type, life: 18, bob: Math.random() * TAU, vx: rand(-40, 40), vy: rand(-40, 40), pulled: false });
}

/* ========================= 11. DAMAGE & DEATH ========================= */
/* Per-weapon hit cooldown stored on the enemy so it is cleaned up automatically. */
function canHit(e, key, cd){
  if (!e.hitCd) e.hitCd = {};
  else if (e.hitCdN > 48){ e.hitCd = {}; e.hitCdN = 0; }
  const prev = e.hitCd[key];
  if (prev !== undefined && prev > G.time) return false;
  if (prev === undefined) e.hitCdN = (e.hitCdN | 0) + 1;
  e.hitCd[key] = G.time + cd;
  return true;
}

let dmgSrc = 'other';
function damageEnemy(e, amount, opts){
  if (e.dead || amount <= 0) return 0;
  opts = opts || {};
  if (e.untarg) return 0;                                     /* airborne or still falling: cannot be hit */
  if (e.barrier > 0){                                         /* a shield soaks damage until it breaks, and breaking it stuns the owner */
    e.barrier -= amount; e.flash = Math.max(e.flash, 0.08);
    if (e.barrier <= 0){ e.barrier = 0; e.stunT = Math.max(e.stunT, 2.2); addText(e.x, e.y - e.r - 16, 'SHIELD DOWN', '#7FE8FF', 18, true); SFX.boss(); addShake(8); }
    return 0;
  }
  if (e.def.shieldArc && !opts.noShield && !opts.quiet){      /* a frontal shield: only the sides and back are soft */
    const fa = Math.atan2(P.y - e.y, P.x - e.x);
    if (Math.abs(angDiff(fa, e.ang)) < e.def.shieldArc){ amount *= 0.1; e.shieldFlash = 0.15; if (Math.random() < 0.3) sfx('zap', 0.1); }
  }
  if (e.def.cloak){ e.revealT = 0.9; e.vis = 1; }             /* being hit uncloaks */
  const s = P.stats;
  let dmg = amount;
  let crit = false;
  if (!opts.noCrit && Math.random() < s.crit){ crit = true; dmg *= s.critMul; }
  dmg = Math.max(1, Math.round(dmg));
  if (G.runDmg && !G.attract) G.runDmg[dmgSrc] = (G.runDmg[dmgSrc] || 0) + Math.min(dmg, Math.max(0, e.hp));
  e.hp -= dmg;
  e.flash = Math.max(e.flash, crit ? 0.16 : 0.1);

  if (opts.silent !== true){
    /* Roll repeated hits on the same target into one running number so the
       screen does not fill with identical ticks. */
    const prev = e.dmgText;
    if (!crit && prev && !prev.crit && prev.life > prev.max * 0.4){
      prev.val += dmg;
      prev.txt = fmt(prev.val);
      prev.size = Math.max(prev.size, dmgTextSize(prev.val, false));
      prev.color = dmgTextColor(prev.val, false, opts.color);
      prev.life = prev.max;
      prev.pop = 0.45;
      prev.x = e.x + rand(-3, 3);
      prev.y = e.y - e.r - 4;
    } else {
      const t = addText(e.x, e.y - e.r - 4, crit ? fmt(dmg) + '!' : fmt(dmg),
        dmgTextColor(dmg, crit, opts.color), dmgTextSize(dmg, crit), crit);
      t.val = dmg;
      if (!crit) e.dmgText = t;
    }
  }
  if (crit) sfxHit(e, true, opts); else if (!opts.quiet) sfxHit(e, false, opts);      /* by element, and placed where it happened (02c-audio-mix.js) */

  if (opts.kb){
    const a = opts.kbAngle !== undefined ? opts.kbAngle
      : Math.atan2(e.y - (opts.sy !== undefined ? opts.sy : P.y), e.x - (opts.sx !== undefined ? opts.sx : P.x));
    const k = opts.kb * e.kbRes;
    e.kx += Math.cos(a) * k; e.ky += Math.sin(a) * k;
  }
  combatHit(e, dmg, crit, opts);                              /* sparks, a flash, a star on a critical (36l-combat-fx.js) */
  if (opts.burn) applyBurn(e, opts.burn, opts.burnT || 2.2);
  if (opts.stun) e.stunT = Math.max(e.stunT, opts.stun);
  if (opts.slow) { e.slowT = Math.max(e.slowT, opts.slowT || 1.4); e.slowMul = Math.min(e.slowMul, opts.slow); }

  if (e.hp <= 0) killEnemy(e, opts);
  return dmg;
}
function applyBurn(e, dps, dur){
  if (dps >= e.burnDps){ e.burnDps = dps; e.burnT = Math.max(e.burnT, dur); }
  else e.burnT = Math.max(e.burnT, dur * 0.6);
}

function killEnemy(e, opts){
  if (e.dead) return;
  e.dead = true;
  const waveMul = 1 + 0.15 * (G.wave - 1);
  /* Experience per kill drops chapter by chapter (CHAPTER_XP_MUL). Chapters
     5 and 6 are measured against the matching chapter-4 wave, so their higher
     wave numbers never inflate the payout. Score still climbs as usual. */
  const xch = chapterOf(G.wave);
  const xpWave = xch >= 5 ? G.wave - WAVES_PER_CHAPTER * (xch - 4) : G.wave;
  const kv = e.big ? 1 : KILL_VALUE;                          /* waves have fewer enemies now (WAVE_COUNT_MUL), so each is worth more: the same experience, score and drops per wave */
  const gained = Math.round(e.xp * 1.35 * (1 + 0.085 * (xpWave - 1)) * P.stats.xpMul * CHAPTER_XP_MUL[xch - 1] * kv);
  const pts = Math.round(e.xp * e.val * waveMul * kv);
  /* gems are the gear currency: a small chance on anything, a handful from bosses */
  const onVenus = chapterOf(G.wave) >= 9 && chapterOf(G.wave) <= 10, infernoRate = chapterOf(G.wave) === 10 ? INFERNO_DROP_MUL : 1;     /* the Inferno drops sulfur and basalt more often */               /* on Venus there are no gems or gold: basalt and sulfur drop in their place */
  if (e.big){ for (let g = 0; g < (infernoRate > 1 ? randi(5, 8) : randi(3, 5)); g++) addPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), onVenus ? 'basalt' : 'gem'); }
  else if (Math.random() < 0.05 * infernoRate * P.stats.dropMul * kv) addPickup(e.x, e.y, onVenus ? 'basalt' : 'gem');
  if (chapterOf(G.wave) === 13){ if (e.big){ for (let g = 0; g < randi(4, 7); g++) addPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), 'iron'); } else if (Math.random() < 0.035 * P.stats.dropMul * kv) addPickup(e.x, e.y, 'iron'); }     /* Martian iron */
  if (cityUnlocked()){ if (e.big){ for (let g = 0; g < randi(5, 8); g++) addPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), 'grub'); } else if (Math.random() < GRUB_DROP * P.stats.dropMul * kv) addPickup(e.x, e.y, 'grub'); }     /* grubs, once the City is found */
  G.score += pts;
  G.kills++;
  gainXP(gained);

  burstParticles(e.x, e.y, e.big ? 26 : 11, e.blood || '#8E3B2B', e.big ? 300 : 190, e.big ? 7 : 4.5, { glow:false });
  burstParticles(e.x, e.y, e.big ? 12 : 5, '#E8C98A', 150, 3, { glow:true });
  combatDeath(e);                                             /* a death effect that fits what it was made of, and what it leaves behind */
  sfxKill(e);                                                 /* by what it was made of and how big it was */
  recordBestiaryKill(e);
  if (e.big){ addShake(12); sfx('bossDie', 0.5, e.x, e.y); screenFlash('#F2B33D', 0.18, 0.3); }

  if (e.def && e.def.onDeath) e.def.onDeath(e);
  /* splitter */
  if (e.splitInto && e.splitCount){
    for (let i = 0; i < e.splitCount; i++){
      const a = (i / e.splitCount) * TAU + rand(-0.3, 0.3);
      const c = spawnEnemy(e.splitInto, e.x + Math.cos(a) * 18, e.y + Math.sin(a) * 18, e.waveRef);
      if (c){ c.kx = Math.cos(a) * 190; c.ky = Math.sin(a) * 190; }
    }
  }
  /* drops */
  const dropBoost = P.stats.dropMul * kv;
  const roll = Math.random();
  if (roll < 0.035 * dropBoost) addPickup(e.x, e.y, 'heart');
  else if (roll < 0.055 * dropBoost) addPickup(e.x, e.y, 'nova');
  else if (roll < (0.055 + 0.045 * infernoRate) * dropBoost) addPickup(e.x, e.y, onVenus ? 'sulfur' : 'gold');
  if (e.big){ addPickup(e.x, e.y, 'heart'); addPickup(e.x + 26, e.y, onVenus ? 'sulfur' : 'gold'); addPickup(e.x - 26, e.y, onVenus ? 'sulfur' : 'gold'); addPickup(e.x, e.y + 26, 'nova'); }
  if (e.big && infernoRate > 1){ addPickup(e.x + 52, e.y, 'sulfur'); addPickup(e.x - 52, e.y, 'sulfur'); }     /* a richer haul from an Inferno boss */
  /* Lime Helmet: 0.1% from any kill, only ever found once, worn straight away */
  if (!G.attract && !trinketOwned('limehelmet') && Math.random() < 0.001){
    grantTrinket('limehelmet');
    if (!trinketEquipped('limehelmet')) Save.data.equippedTrinkets.push('limehelmet');
    Save.write(); recalcStats();
    banner('LIME HELMET FOUND', 'A 1-in-1000 find. Damage taken \u22127%, already equipped.', '#9BE04A', 3.6);
    SFX.level();
  }

  /* card on-kill hooks */
  const prevSrc = dmgSrc;
  for (let i = 0; i < P.cards.length; i++){
    const inst = P.cards[i];
    dmgSrc = inst.def.id;
    if (inst.def.onKill) inst.def.onKill(inst, e);
  }
  dmgSrc = prevSrc;
}

function gainXP(n){
  P.xp += n; if (!G.attract) G.runXp = (G.runXp || 0) + n;
  let guard = 0;
  while (P.xp >= P.xpNext && guard++ < 40){
    P.xp -= P.xpNext;
    P.level++;
    P.xpNext = xpForLevel(P.level);
    G.pendingLevels++;
  }
}
function xpForLevel(lv){ return Math.round(42 * Math.pow(1.17, lv - 1) + 12 * (lv - 1)); }

/* ========================= 12. PLAYER DAMAGE ========================= */
function hurtPlayer(amount, sx, sy){
  if (G.attract) return;
  if (P.invuln > 0 || P.dead || G.state !== 'playing') return;
  const s = P.stats;
  let dmg = amount * (1 - s.dr) * (G.biome === 'ocean' ? (1 - clamp(s.oceanDr, 0, 0.6)) : 1);
  if (s.reflect > 0 && sx !== undefined){
    const rd = amount * s.reflect;
    addShock(P.x, P.y, 132, 0.34, rd, '#C7D8E8', { width: 12, kb: 240 });
  }
  /* Enemy damage was doubled, which left late bosses (200+ per contact) able
     to delete a full-health giraffe in a single touch. Cap any one hit so it
     always takes at least three to go down from full, whatever the source. */
  dmg = Math.min(dmg, Math.max(14, P.maxHp * (G.biome === 'jungle' || G.biome === 'city' || G.biome === 'space' || G.biome === 'moon' || G.biome === 'venus' ? 0.5 : 0.34)));
  if (trinketEquipped('limehelmet')) dmg *= 0.93;
  dmg = Math.max(1, Math.round(dmg));
  if (G.rover && G.rover.alive && G.rover.riding){            /* the rover takes the hit instead */
    P.invuln = 0.62 * s.invulnMul * biomeInvulnFactor();
    roverHit(dmg); return;
  }
  P.hp -= dmg; G.runTaken = (G.runTaken || 0) + dmg; noteKiller(sx, sy);
  P.invuln = 0.62 * s.invulnMul * biomeInvulnFactor();   /* the rainforest gives you far less breathing room */
  P.hurtT = 0.32;
  addShake(9, sx !== undefined ? Math.atan2(P.y - sy, P.x - sx) : undefined);      /* the picture is shoved away from whatever hit her */
  screenFlash('#CF4433', 0.26, 0.24);
  sfx('hurt', 0.2);
  vibrate(35);
  addText(P.x, P.y - 34, '-' + dmg, '#FF9C8A', 17, false);
  burstParticles(P.x, P.y, 9, '#CF4433', 200, 4);
  if (P.hp <= 0){
    if (G.revives > 0){
      G.revives--;
      P.hp = Math.round(P.maxHp * 0.3);
      P.invuln = 2.4;
      addShock(P.x, P.y, 420, 0.7, 260, '#F2B33D', { width: 26, kb: 700, stun: 1.2 });
      screenFlash('#F2B33D', 0.6, 0.7);
      addShake(22);
      SFX.transform();
      banner('SECOND WIND', 'You get back up', '#F2B33D', 2.0);
      startSlowmo(0.8, 0.3, 0.05); G.reviveFX = { t: 0, dur: 1.1 };
      for (let i = 0; i < 26; i++){ const a = Math.random() * TAU; addParticle(P.x + Math.cos(a) * 24, P.y + Math.sin(a) * 24, Math.cos(a) * rand(60, 240), Math.sin(a) * rand(60, 240) - 90, rand(2, 4.5), 1.1, i % 3 ? '#FFE6A0' : '#FFFFFF', { glow: true, drag: 1.3 }); }
    } else {
      P.hp = 0;
      gameOver();
    }
  }
}
/* ========================= 13. DRAW HELPERS ========================= */
function fillCircle(ctx, x, y, r, c){ ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function ringPath(ctx, x, y, r, w, c, a){
  ctx.globalAlpha = a === undefined ? 1 : a;
  ctx.strokeStyle = c; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r), 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
}
function softBlob(ctx, x, y, r, c, a){
  ctx.globalAlpha = a === undefined ? 0.5 : a;
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
/* A tapering, gently curved limb — used for neck-whip style attacks so they
   read as an animal part lashing out rather than a uniform-width tube.
   Returns the polyline's centerline so a caller can decorate along it. */
function taperedLimb(ctx, ox, oy, ex, ey, bow, w0, w1, color){
  const dx = ex - ox, dy = ey - oy;
  const len = hyp(dx, dy) || 1;
  const perp = Math.atan2(dy, dx) + Math.PI / 2;
  const cx = (ox + ex) / 2 + Math.cos(perp) * bow;
  const cy = (oy + ey) / 2 + Math.sin(perp) * bow;
  const N = 9;
  const left = [], right = [], mid = [];
  for (let i = 0; i <= N; i++){
    const t = i / N, mt = 1 - t;
    const bx = mt * mt * ox + 2 * mt * t * cx + t * t * ex;
    const by = mt * mt * oy + 2 * mt * t * cy + t * t * ey;
    const tx = 2 * mt * (cx - ox) + 2 * t * (ex - cx);
    const ty = 2 * mt * (cy - oy) + 2 * t * (ey - cy);
    const tl = hyp(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl;
    const w = lerp(w0, w1, t * t);
    left.push([bx + nx * w, by + ny * w]);
    right.push([bx - nx * w, by - ny * w]);
    mid.push([bx, by, Math.atan2(ty, tx)]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i <= N; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = N; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return mid;
}

/* ========================= 14. TARGETING ========================= */
function nearestEnemy(x, y, maxR, skip){
  let best = null, bd = maxR === undefined ? Infinity : maxR * maxR;
  const list = G.enemies;
  for (let i = 0; i < list.length; i++){
    const e = list[i];
    if (e.dead || e.untarg || (skip && skip.has(e))) continue;
    const dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy;
    if (d < bd){ bd = d; best = e; }
  }
  return best;
}
function enemiesNear(x, y, r, out){ return Grid.query(x, y, r, out || _q); }
function haste(){ return P.hasteNow; }

