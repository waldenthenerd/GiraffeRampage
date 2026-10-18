'use strict';
/* Derived player stats and the player. */
/* ========================= 16. DERIVED PLAYER STATS ========================= */
function recalcStats(){
  const s = {
    speedMul: 1, kickDmgMul: 1, kickRangeMul: 1, kickArc: 0, kickKb: 1, kickWave: false,
    hasteMul: 1, maxHpAdd: 0, dr: 0, crit: 0.05, critMul: 2.0, xpMul: 1, goldMul: 1,
    pickupMul: 1, dropMul: 1, regen: 0, reflect: 0, rageMax: 0, ragePer: 0.008, invulnMul: 1,
    allDmgMul: 1, bleedMul: 1, bonusRerolls: 0, weaponEcho: 0,
    slowPotency: 0, slowDurMul: 1, freezeBonus: 0, chainBonus: 0, chainFalloffBonus: 0,
    swimSpeedMul: 1, splashChance: 0, splashRadiusMul: 1, oceanDr: 0
  };
  /* shop perks (every effect here is half what it was before gear existed) */
  s.kickDmgMul += 0.06  * metaLevel('hooves');
  s.maxHpAdd   += 7.5   * metaLevel('hide');
  s.speedMul   += 0.025 * metaLevel('strides');
  s.goldMul    += 0.07  * metaLevel('prospect');
  s.xpMul      += 0.045 * metaLevel('learner');
  s.crit       += 0.02  * metaLevel('instinct');
  s.critMul    += 0.06  * metaLevel('instinct');
  s.pickupMul  += 0.13  * metaLevel('magnet');
  s.dropMul    += 0.10  * metaLevel('magnet');
  s.kickRangeMul += 0.03 * metaLevel('reach');
  s.regen      += 0.3   * metaLevel('regen');
  s.kickKb     *= (1 + 0.05 * metaLevel('thunder'));
  s.invulnMul  += 0.06  * metaLevel('steady');
  s.swimSpeedMul += 0.06 * metaLevel('swimlegs');
  s.splashChance += 0.04 * metaLevel('ripkick');
  s.oceanDr    += 0.04  * metaLevel('brine');

  applyGear(s);
  if (venusHas('hab3')) s.maxHpAdd += 15;
  if (trinketEquipped('sulfurlantern')){ s.pickupMul += 0.25; s.dropMul += 0.15; }
  if (trinketEquipped('basaltplate')) s.dr += 0.06;
  if (trinketEquipped('ventbellows')){ s.regen += 1; s.speedMul += 0.04; }
  if (trinketEquipped('forgeheart')){ s.kickDmgMul += 0.12; s.crit += 0.04; s.xpMul += 0.05; }
  if (marsHas('mh3')) s.maxHpAdd += 15;
  if (trinketEquipped('irongauntlet')){ s.kickDmgMul += 0.14; s.kickKb *= 1.1; }
  if (trinketEquipped('argonlamp')){ s.pickupMul += 0.2; s.regen += 1.2; }
  if (trinketEquipped('dustveil')){ s.dr += 0.08; s.speedMul += 0.05; s.xpMul += 0.06; }
  try { applyMutations(s); } catch (err) {}      /* recalcStats first runs while the file is still loading, before the mutation list exists */
  applyCityStats(s);

  for (let i = 0; i < P.cards.length; i++){
    const inst = P.cards[i];
    if (inst.def.passive) inst.def.passive(inst, s);
  }
  P.weapon = (typeof equippedWeapon === 'function') ? equippedWeapon() : null;
  if (!P.weapon) P.weapon = (typeof DEFAULT_WEAPON !== 'undefined') ? DEFAULT_WEAPON
    : { id:'hooves', name:'Bare Hooves', color:'#FFE6A3', cd:0.40, dmg:30, range:104, arc:1.55, kb:470, arcs:[0] };
  P.capeColor = (typeof equippedCapeColor === 'function') ? equippedCapeColor() : null;
  P.armorInfo = (typeof equippedArmorInfo === 'function') ? equippedArmorInfo() : null;
  if (!s.kickArc) s.kickArc = P.weapon.arc;
  const prevMax = P.maxHp;
  P.maxHp = 120 + s.maxHpAdd + (P.bonusHp || 0);
  if (P.maxHp > prevMax) P.hp += (P.maxHp - prevMax);
  P.hp = Math.min(P.hp, P.maxHp);
  P.stats = s;
  P.hasteNow = clamp(s.hasteMul, 0.25, 2);
}
/* recalcStats() is first called from 46-main.js, once every file (venusHas and friends) has loaded */

/* ========================= 17. PLAYER ========================= */
const Input = {
  keys: {}, mx: 0, my: 0, mdown: false, joyActive: false, joyX: 0, joyY: 0,
  touchKick: false, hasTouch: false,
  padOn: false, padX: 0, padY: 0, padAimOn: false, padAimAng: 0, padUsed: false
};

function playerInputVector(){
  if (G.attract) return attractInput();
  let ix = 0, iy = 0;
  const k = Input.keys;
  if (k[keyOf('left')] || k['ArrowLeft'])  ix -= 1;
  if (k[keyOf('right')] || k['ArrowRight']) ix += 1;
  if (k[keyOf('up')] || k['ArrowUp'])    iy -= 1;
  if (k[keyOf('down')] || k['ArrowDown'])  iy += 1;
  if (Input.joyActive){ ix += Input.joyX; iy += Input.joyY; }
  if (Input.padOn){ ix += Input.padX; iy += Input.padY; }
  const m = Math.hypot(ix, iy);
  if (m > 1){ ix /= m; iy /= m; }
  return { x: ix, y: iy, m: Math.min(1, m) };
}

function updatePlayer(dt){
  const s = P.stats;
  P.hasteNow = clamp(s.hasteMul * (1 - P.rage * s.ragePer), 0.2, 2);

  const inp = playerInputVector();
  /* Open water drags at every stride -- Swimmer's Legs (shop and gear) claws
     some of that back, but never past dry-land speed. */
  const swimMul = G.biome === 'ocean' ? Math.min(1, 0.6 * s.swimSpeedMul) : 1;
  const spd = 216 * s.speedMul * swimMul * (roverRiding() ? roverSpeedMul() : 1) * (chapterOf(G.wave) >= 8 ? CH89_SPEED_MUL : 1) * (G.terrain ? G.terrain.spd : 1) * (typeof townCarRunMul === 'function' ? townCarRunMul() : 1);
  const tvx = inp.x * spd, tvy = inp.y * spd;
  const accel = (inp.m > 0 ? 14 : 11) * dt * (G.terrain ? G.terrain.accel : 1);
  P.vx = lerp(P.vx, tvx, Math.min(1, accel));
  P.vy = lerp(P.vy, tvy, Math.min(1, accel));
  P.x = clamp(P.x + P.vx * dt, 26, ARENA_W - 26);
  P.y = clamp(P.y + P.vy * dt, 26, ARENA_H - 26);
  if (G.buildings && G.buildings.length) resolveBuildings(P, P.r * 0.8);

  const moving = Math.hypot(P.vx, P.vy);
  P.walk += dt * (2.5 + moving * 0.034);
  if (moving > 12) P.face = Math.atan2(P.vy, P.vx);

  /* aim */
  if (Input.padAimOn){
    P.aim = Input.padAimAng;
  } else if (Settings.aimMode === 'cursor' && !Input.hasTouch && !Input.padUsed){
    P.aim = Math.atan2(Input.my - P.y, Input.mx - P.x);
  } else {
    const t = nearestEnemy(P.x, P.y, 640);
    if (t) P.aim = Math.atan2(t.y - P.y, t.x - P.x);
    else if (moving > 12) P.aim = P.face;
  }

  if (P.kickCd > 0) P.kickCd -= dt;
  if (P.slowCd > 0) P.slowCd -= dt;
  if (P.kickAnim > 0) P.kickAnim -= dt;
  if (P.invuln > 0) P.invuln -= dt;
  if (P.hurtT > 0) P.hurtT -= dt;
  P.rage = Math.max(0, P.rage - dt * 2.6);

  if (s.regen > 0 && P.hp < P.maxHp){
    P.regenAcc += s.regen * dt;
    if (P.regenAcc >= 1){
      const h = Math.floor(P.regenAcc);
      P.regenAcc -= h;
      P.hp = Math.min(P.maxHp, P.hp + h);
    }
  }
  if (Input.mdown || Input.touchKick || Settings.autoKick || G.attract) doKick();
}

function doKick(){
  if (P.kickCd > 0 || (G.state !== 'playing' && !G.attract)) return;
  dmgSrc = 'kick';
  const s = P.stats;
  const wp = P.weapon || DEFAULT_WEAPON;
  P.kickCd = wp.cd * haste();
  P.kickAnim = 0.30;
  const range = wp.range * s.kickRangeMul;
  const arc = wp.spin ? TAU : (s.kickArc || wp.arc);
  const dmg = wp.dmg * s.kickDmgMul * s.allDmgMul;
  const base = P.aim;
  const swings = wp.arcs && wp.arcs.length ? wp.arcs : [0];
  const strikes = 1 + (s.weaponEcho || 0);

  sfx('kick', 0.05);
  abilityShake(wp.cd > 0.6 ? 8 : 5.5, base + Math.PI);          /* the recoil goes back along the swing */

  let hits = 0;
  for (let rep = 0; rep < strikes; rep++){
    const repDmg = rep === 0 ? dmg : dmg * 0.6;
    for (let sw = 0; sw < swings.length; sw++){
      const a = base + swings[sw] + (rep ? rand(-0.25, 0.25) : 0);
      G.swipes.push({ x: P.x, y: P.y, a: a, range: range, arc: arc, t: 0, dur: 0.26, color: wp.color });
      kickTrail(a, range, arc);
      coneParticles(P.x + Math.cos(a) * range * 0.5, P.y + Math.sin(a) * range * 0.5, a, 5, wp.color, 260, 4, Math.min(1.2, arc * 0.4));

      const near = enemiesNear(P.x, P.y, range + 50);
      for (let i = 0; i < near.length; i++){
        const e = near[i];
        if (e.dead) continue;
        const dx = e.x - P.x, dy = e.y - P.y;
        const d = Math.hypot(dx, dy);
        if (d > range + e.r) continue;
        if (arc < TAU && Math.abs(angDiff(Math.atan2(dy, dx), a)) > arc * 0.5) continue;
        if (strikes > 1 && !canHit(e, 'wep' + rep, 0.05)) continue;
        hits++;
        const freezeChance = (wp.freezeChance || 0) + (s.freezeBonus || 0);
        const freezeHit = freezeChance > 0 && Math.random() < freezeChance;
        damageEnemy(e, repDmg, {
          kb: wp.kb * s.kickKb, sx: P.x, sy: P.y, color: wp.color,
          burn: wp.bleed ? repDmg * wp.bleed * s.bleedMul : 0, burnT: wp.bleedT || 2.2,
          stun: freezeHit ? (wp.freezeT || 0.6) : (wp.stun || 0),
          slow: wp.slow ? Math.min(0.92, wp.slow + s.slowPotency) : 0,
          slowT: wp.slow ? (wp.slowT || 1.4) * s.slowDurMul : 0
        });
        coneParticles(e.x, e.y, a, 6, wp.color, 300, 4.5, 0.8);
        if (freezeHit){
          burstParticles(e.x, e.y, 8, '#BEF0FF', 160, 3, { glow: true });
          sfx('freeze', 0.15);
        }
        if (wp.chain){
          sfx('zap', 0.08);
          const seen = new Set([e]);
          let fromX = e.x, fromY = e.y, chainDmg = repDmg;
          const jumps = wp.chain.count + (s.chainBonus || 0);
          const falloff = Math.min(0.99, wp.chain.falloff + (s.chainFalloffBonus || 0));
          for (let c = 0; c < jumps; c++){
            const nxt = nearestEnemy(fromX, fromY, wp.chain.range, seen);
            if (!nxt) break;
            seen.add(nxt);
            chainDmg *= falloff;
            damageEnemy(nxt, chainDmg, { color: wp.color, kb: wp.kb * 0.3 * s.kickKb, sx: fromX, sy: fromY });
            G.bolts.push({ pts: [{ x: fromX, y: fromY }, { x: nxt.x, y: nxt.y }], life: 0.2, max: 0.2, color: wp.color, width: 3 });
            fromX = nxt.x; fromY = nxt.y;
          }
        }
      }

      if (wp.projectile){
        const pj = wp.projectile;
        addProj(P.x + Math.cos(a) * 26, P.y + Math.sin(a) * 26,
          Math.cos(a) * pj.speed, Math.sin(a) * pj.speed, pj.rad || 7,
          repDmg * pj.dmgMul, wp.color, { pierce: pj.pierce || 0, life: 1.1, kind: 'spear' });
      }
    }
  }

  if (wp.shock){
    const wx = P.x + (wp.spin ? 0 : Math.cos(base) * range * 0.4);
    const wy = P.y + (wp.spin ? 0 : Math.sin(base) * range * 0.4);
    addShock(wx, wy, wp.shock.rad, 0.34, dmg * wp.shock.dmgMul, wp.color,
      { width: 14, kb: wp.shock.kb || 300 });
  }
  if (wp.pull){
    SFX.whoosh();
    const pulled = enemiesNear(P.x, P.y, wp.pull.rad);
    for (let i = 0; i < pulled.length; i++){
      const e = pulled[i];
      if (e.dead || e.big) continue;
      const ang = Math.atan2(P.y - e.y, P.x - e.x);
      e.kx += Math.cos(ang) * wp.pull.force * e.kbRes;
      e.ky += Math.sin(ang) * wp.pull.force * e.kbRes;
    }
  }
  if (wp.meteor && Math.random() < wp.meteor.chance){
    const tgt = nearestEnemy(P.x, P.y, 520);
    const mx = tgt ? tgt.x : P.x + Math.cos(base) * 220;
    const my = tgt ? tgt.y : P.y + Math.sin(base) * 220;
    addShock(mx, my, wp.meteor.rad, 0.42, dmg * wp.meteor.dmgMul, '#FFD84D', { width: 30, kb: 340, filled: true });
    burstParticles(mx, my, 18, '#FFD84D', 300, 6, { glow: true });
    screenFlash('#FFD84D', 0.1, 0.18);
    abilityShake(9);
    sfx('boom', 0.15);
  }
  if (G.buildings && G.buildings.length){
    /* kicks land on any building face inside the swing */
    for (let k = 0; k < G.buildings.length; k++){
      const b = G.buildings[k];
      if (b.collapsed) continue;
      const nx = clamp(P.x, b.x, b.x + b.w), ny = clamp(P.y, b.y, b.y + b.h), d = Math.hypot(nx - P.x, ny - P.y);
      if (d > range + 10) continue;
      if (arc < TAU - 0.01 && d > 30 && Math.abs(angDiff(Math.atan2(ny - P.y, nx - P.x), base)) > arc / 2 + 0.35) continue;
      damageBuilding(b, dmg * strikes, 'kick');
    }
  }
  if (hits){
    hitstop(0.035 + Math.min(0.03, hits * 0.008));
    abilityShake(3 + Math.min(6, hits * 1.6), base);              /* and a landed hit jolts it forward */
  }
  if (s.kickWave){
    const wx = P.x + Math.cos(base) * range * 0.55, wy = P.y + Math.sin(base) * range * 0.55;
    addShock(wx, wy, range * 1.5, 0.36, dmg * 0.85, '#F2B33D', { width: 15, kb: 320 });
  }
  /* Open water: every kick throws up a splash around the giraffe (not just
     the kick's own frontal arc) with a chance to briefly stun anything it
     catches -- pure crowd control, no extra damage, so it stays a distinct
     utility layered on top of the kick rather than a second hit. */
  if (G.biome === 'ocean'){
    const splashR = (range * 0.85 + 34) * s.splashRadiusMul;
    const chance = clamp(0.22 + (s.splashChance || 0), 0, 0.9);
    const around = enemiesNear(P.x, P.y, splashR);
    for (let i = 0; i < around.length; i++){
      const e = around[i];
      if (e.dead) continue;
      if (Math.random() < chance) e.stunT = Math.max(e.stunT, 0.45);
    }
    burstParticles(P.x, P.y, 10, '#DFF3FF', 190, 3.5, { glow: true });
    sfx('splash', 0.12);
  }
}

