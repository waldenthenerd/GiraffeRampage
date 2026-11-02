'use strict';
/* Chapter 17, the Island Lab: how the mutants and bosses move and attack, the water's pull on them, and the scientist (the kinds are in js/island/30g-chapter-island.js, their pictures
   in js/art/35o-art-island.js). */
/* ========================= THE ISLAND'S BEHAVIORS ========================= */
/* Each is called like a Tower behavior from the enemy update's default branch: (e, dt, ux, uy, d) -> [mvx, mvy], e.spdE is its speed. ux and uy already point the way round the
   rocks and buildings (towerSteer), and every shot dies on one, so the shooters check twSight first. The lunge and the rush are the Siege's (sgLunge, sgRush).
   The water: whatever a behavior returns is then scaled by ilWaterMul, so a swimmer (def.swim) is quicker in the shallows and slower on the sand, and everything else wades.
   The eels and the snakes go under when they are in the water and still some way off (e.hidden: only a dark shape and a wake show); they come up to strike.
   The bosses use the Tower's phase idea: at half health (Specimen Zero: at 70% and 35%) they change gear with a roar. */
function ilWaterMul(e){
  if (e.def.flyOver) return 1;
  const wet = isleWet(e.x, e.y); e.wet = wet;
  return e.def.swim ? (wet ? 1.18 : 0.8) : (wet ? 0.86 : 1);
}
function ilRoar(e, color){ e.state = 'roar'; e.stateT = 1; sfx('boom', 0.2); addShake(10); screenFlash(color || '#7FE8E0', 0.2, 0.3); }
function ilBlast(x, y, r, dm, wait, color){ addMarker(x, y, r, wait, color || '#7FE8E0', function(m){ hostileBlast(m.x, m.y, r, dm, '#C8FFF4', { shake: 6 }); }); }
/* spines in a ring: the urchin's burst, the puffer's, a boss's */
function ilSpines(e, n, speed, dmgMul){ twRing(e, n, speed, dmgMul, '#E8D8FF', 4, Math.random() * TAU); }
/* go under: in the water and further off than `near`, a hider swims fast and unseen; it surfaces with a splash */
function ilHide(e, d, near){
  const under = e.wet && d > near;
  if (under && !e.hidden){ e.hidden = true; ilSplash(e.x, e.y, 0.8); }
  else if (!under && e.hidden){ e.hidden = false; ilSplash(e.x, e.y, 1.1); sfx('whoosh', 0.06); }
  return e.hidden;
}
const ISLE_AI_COMMON = {
  il_hermit(e, dt, ux, uy, d){ return sgLunge(e, dt, ux, uy, d, 170, 3.0, [1, 1.7]); },                                       /* Hermit Squatter: scuttles in, then a snapping claw lunge */
  il_shrimp(e, dt, ux, uy, d){                                                                                                  /* Lab Shrimp: darts in panicky zigzags, in shoals */
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const w = Math.sin(e.anim * 2.2 + e.jSeed) * 1.4, dart = 1 + 0.6 * Math.max(0, Math.sin(e.anim * 3 + e.jSeed)); e.ang = Math.atan2(uy, ux);
    return [(ux - uy * w * twLat(e)) * e.spdE * dart, (uy + ux * w * twLat(e)) * e.spdE * dart];
  },
  il_eel(e, dt, ux, uy, d){                                                                                                     /* Eel Hound: under the water until it is close, then a lunge */
    if (ilHide(e, d, 240)){ e.ang = Math.atan2(uy, ux); return [ux * e.spdE * 1.25, uy * e.spdE * 1.25]; }
    return sgLunge(e, dt, ux, uy, d, 210, 3.6, [0.9, 1.6]);
  },
  il_urchin(e, dt, ux, uy, d){                                                                                                  /* Urchin Roller: winds up and rolls straight at her; spines burst off it at the end of a roll */
    if (e.state !== 'roll' && e.state !== 'wind' && d < 200){ if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1; e.stateT -= dt; return [(-ux * 0.7 - uy * 0.5 * e.dirS) * e.spdE, (-uy * 0.7 + ux * 0.5 * e.dirS) * e.spdE]; }      /* too close to build up speed: it rolls off a way first */
    const was = e.state, r = sgRush(e, dt, ux, uy, d, 140, 620, 720, 0.5, 0.85, [1.4, 2.2], 3);
    if (was === 'roll' && e.state !== 'roll') ilSpines(e, 8, 300, 0.35);
    return r;
  },
  il_crab(e, dt, ux, uy, d){                                                                                                    /* Crab Tank: marches plated front first; close up it snaps both claws */
    e.stateT -= dt;
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.4 * dt);
    if (e.state === 'snapwind'){ if (e.stateT <= 0){ const fx = e.x + Math.cos(e.ang) * e.r * 1.4, fy = e.y + Math.sin(e.ang) * e.r * 1.4; hostileBlast(fx, fy, 70, e.dmg * 0.9, '#F2A890', { shake: 4 }); e.state = 'snap'; e.stateT = 0.3; } return [0, 0]; }
    if (e.state === 'snap'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); } return [0, 0]; }
    if (e.stateT <= 0 && d < e.r + 90){ e.state = 'snapwind'; e.stateT = 0.45; }
    const side = Math.sin(e.anim * 0.8) * 0.35;                                                                                 /* crabs come in a little sideways */
    return [(ux - uy * side) * e.spdE, (uy + ux * side) * e.spdE];
  },
  il_jelly(e, dt, ux, uy, d){                                                                                                   /* Jelly Drifter: drifts over everything, pulsing, and shocks the ground under it */
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    const pulse = 0.55 + 0.45 * Math.max(0, Math.sin(e.anim * 2.4));
    if (e.state === 'zapwind'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.4, 3.4); } return [ux * e.spdE * 0.2, uy * e.spdE * 0.2]; }
    if (e.stateT <= 0 && d < 260){ e.state = 'zapwind'; e.stateT = 0.7; const rr = e.small ? 70 : 110, dm = e.dmg * 0.8; addMarker(e.x, e.y, rr, 0.7, '#D8C8FF', function(m){ hostileBlast(m.x, m.y, rr, dm, '#E8DCFF', { shake: 3 }); addShock(m.x, m.y, rr * 1.2, 0.3, 0, '#D8C8FF'); }, { owner: e }); }
    return [ux * e.spdE * pulse, uy * e.spdE * pulse];
  },
  il_brute(e, dt, ux, uy, d){                                                                                                   /* Barnacle Brute: lowers its tusked head and charges */
    e.stateT -= dt;
    if (e.state === 'ram'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2, 3); } e.ang = Math.atan2(e.dashVY, e.dashVX); if (Math.random() < dt * 20) ilSplash(e.x, e.y, 0.6); return [e.dashVX, e.dashVY]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt);
    if (e.state === 'ramwind'){ if (e.stateT <= 0){ e.state = 'ram'; e.stateT = 0.6; e.dashVX = Math.cos(e.ang) * 500; e.dashVY = Math.sin(e.ang) * 500; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 420 && d > 120 && twSight(e)){ e.state = 'ramwind'; e.stateT = 0.6; }
    return [ux * e.spdE, uy * e.spdE];
  },
  il_octo(e, dt, ux, uy, d){                                                                                                    /* Ink Spitter: keeps back and lobs a blob of ink that leaves a dark, stinging cloud */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.state === 'lobwind'){
      if (e.stateT <= 0){ const dm = e.dmg; addMarker(P.x + P.vx * 0.5, P.y + P.vy * 0.5, 95, 0.9, '#5A3A5A', function(m){ hostileBlast(m.x, m.y, 95, dm * 0.5, '#3A2A3A', { shake: 3 }); hostileZone(m.x, m.y, 110, 3.5, dm * 0.1, '#2A1A2A'); ilInk(m.x, m.y, 130, 3.5); }); sfx('spit', 0.08); e.state = 'idle'; e.stateT = rand(2.4, 3.4); }
      return [0, 0];
    }
    const dir = d > 460 ? 1 : d < 330 ? -0.7 : 0;
    if (e.stateT <= 0 && d < 640 && twSight(e)){ e.state = 'lobwind'; e.stateT = 0.55; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  il_mantis(e, dt, ux, uy, d){                                                                                                  /* Mantis Boxer: closes in and throws one punch so fast it cracks the water in a ring */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 5 * dt); e.stateT -= dt;
    if (e.state === 'punchwind'){ if (e.stateT <= 0){ const fx = e.x + Math.cos(e.ang) * (e.r + 30), fy = e.y + Math.sin(e.ang) * (e.r + 30); hostileBlast(fx, fy, 90, e.dmg, '#FFFFFF', { kb: 120, shake: 6 }); addShock(fx, fy, 150, 0.35, 0, '#E8FFF8'); e.state = 'punch'; e.stateT = 0.25; sfx('boom', 0.08); } return [0, 0]; }
    if (e.state === 'punch'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2); } return [0, 0]; }
    if (e.stateT <= 0 && d < e.r + 110 && twSight(e)){ e.state = 'punchwind'; e.stateT = 0.4; }
    return [ux * e.spdE, uy * e.spdE];
  },
  il_snake(e, dt, ux, uy, d){                                                                                                   /* Sea Snake: waits under the water, strikes out, and slides back */
    e.stateT -= dt;
    if (e.state === 'strike'){ if (e.stateT <= 0){ e.state = 'back'; e.stateT = 0.9; } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    if (e.state === 'back'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.6, 1.2); } e.ang = Math.atan2(uy, ux); return [-ux * e.spdE * 0.7, -uy * e.spdE * 0.7]; }
    if (ilHide(e, d, 300)){ e.ang = Math.atan2(uy, ux); const w = Math.sin(e.anim * 2) * 0.6; return [(ux - uy * w) * e.spdE, (uy + ux * w) * e.spdE]; }
    e.ang = Math.atan2(uy, ux);
    if (e.stateT <= 0 && d < 280 && twSight(e)){ e.state = 'strike'; e.stateT = 0.3; e.dashVX = ux * e.spdE * 4; e.dashVY = uy * e.spdE * 4; sfx('whoosh', 0.08); return [e.dashVX, e.dashVY]; }
    const w = Math.sin(e.anim * 2) * 0.8;
    return [(ux - uy * w * twLat(e)) * e.spdE, (uy + ux * w * twLat(e)) * e.spdE];
  },
  il_puffer(e, dt, ux, uy, d){                                                                                                  /* Puffer Bomber: swims up close, swells, and bursts into spines */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt);
    if (e.state === 'puff'){
      e.stateT -= dt; e.puff = clamp(1 - e.stateT / 0.9, 0, 1);
      if (e.stateT <= 0){ hostileBlast(e.x, e.y, 150, e.dmg * 1.2, '#FFF0B8', { shake: 8 }); ilSpines(e, 12, 320, 0.4); addShock(e.x, e.y, 180, 0.4, 0, '#E8C05A'); killEnemy(e, {}); }
      return [ux * e.spdE * 0.15, uy * e.spdE * 0.15];
    }
    if (d < e.r + 100){ e.state = 'puff'; e.stateT = 0.9; e.puff = 0; sfx('whoosh', 0.1); }
    return [ux * e.spdE, uy * e.spdE];
  },
  il_anemone(e, dt, ux, uy, d){                                                                                                 /* Anemone Nurse: creeps to a spot behind the others, roots, and heals whoever is hurt near it */
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'heal'){ if (e.stateT <= 0){ e.state = 'root'; e.stateT = 1.2; } return [0, 0]; }
    if (e.stateT <= 0){
      const near = enemiesNear(e.x, e.y, 240, []); let n = 0;
      for (let i = 0; i < near.length && n < 6; i++){ const o = near[i]; if (o === e || o.dead || o.untarg || o.hp >= o.maxHp) continue; o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (o.big ? 0.008 : 0.07)); n++; burstParticles(o.x, o.y, 3, '#FF9AB8', 70, 2.4, { glow: true }); }
      if (n){ e.state = 'heal'; e.stateT = 0.5; addShock(e.x, e.y, 130, 0.3, 0, '#FF9AB8'); return [0, 0]; }
      e.stateT = 0.5;
    }
    const dir = d > 480 ? 1 : d < 340 ? -0.8 : 0;
    if (e.state === 'root' && dir >= 0 && d < 560) return [0, 0];
    e.state = 'idle';
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  }
};

/* ---- the bosses ---- */
const ISLE_BOSS_AI = {
  il_kingclaw(e, dt, ux, uy, d){                                 /* King Claw: a crusher-claw sweep that throws a fan of spray, a slam marked round itself, and a spray of bubbles; at half, faster, and hermits come to its call */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ilRoar(e, '#F8B898'); twSpawnNear(e, 'hyena', 4, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 300 ? 1 : d < 180 ? -0.4 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'sweepwind' : p === 1 ? 'slamwind' : 'bubblewind'; e.stateT = p === 1 ? 0.9 : 0.6; e.slamMk = undefined; }
      const side = Math.sin(e.anim * 0.6) * 0.4;
      return [(ux - uy * side) * e.spdE * dir, (uy + ux * side) * e.spdE * dir];
    }
    if (e.state === 'sweepwind'){ if (e.stateT <= 0){ twFan(e, e.p2 ? 9 : 7, 0.16, 420, 0.45, '#F8D8C8', 6); hostileBlast(e.x + Math.cos(e.ang) * (e.r + 40), e.y + Math.sin(e.ang) * (e.r + 40), 110, e.dmg, '#F8B898', { kb: 140, shake: 8 }); e.state = 'sweep'; e.stateT = 0.4; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.state === 'sweep'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.4 * fast; } return [0, 0]; }
    if (e.state === 'slamwind'){
      if (e.slamMk === undefined){ e.slamMk = true; addMarker(e.x, e.y, 220, e.stateT, '#F8B898', null, { owner: e }); }
      if (e.stateT <= 0){ e.slamMk = undefined; hostileBlast(e.x, e.y, 220, e.dmg * 0.85, '#F8B898', { kb: 160, shake: 14 }); addShock(e.x, e.y, 260, 0.6, 0, '#C8FFF4'); ilSplash(e.x, e.y, 2); if (e.p2) ilSpines(e, 12, 300, 0.3); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'bubblewind'){ if (e.stateT <= 0){ e.state = 'bubble'; e.stateT = e.p2 ? 1.6 : 1.1; e.fireT = 0; } return [0, 0]; }
    if (e.state === 'bubble'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = e.p2 ? 0.08 : 0.12; fireBullet(e, e.ang + rand(-0.5, 0.5), rand(200, 300), 0.22, '#C8FFF4', 7); sfx('spit', 0.04); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.3 * fast; } return [ux * e.spdE * 0.2, uy * e.spdE * 0.2];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  il_stormjelly(e, dt, ux, uy, d){                               /* The Stormjelly: rains marked shocks round her, drops drifters, and lets off a ring of sparks; at half the rain thickens */
    e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ilRoar(e, '#C8D8FF'); twSpawnNear(e, 'vulture', 3, e.r + 50); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1, drift = 0.6 + 0.4 * Math.max(0, Math.sin(e.anim * 1.6));
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 340 ? 1 : d < 220 ? -0.5 : 0.15;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'rainwind' : p === 1 ? 'dropwind' : 'ringwind'; e.stateT = 0.7; }
      return [ux * e.spdE * dir * drift, uy * e.spdE * dir * drift];
    }
    if (e.state === 'rainwind'){ if (e.stateT <= 0){ const dm = e.dmg * 0.75, n = e.p2 ? 9 : 6; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-320, 320) : P.vx * 0.4), P.y + (k ? rand(-320, 320) : P.vy * 0.4)); ilBlast(p.x, p.y, 100, dm, 0.8 + k * 0.08, '#C8D8FF'); } sfx('zap', 0.1); e.state = 'idle'; e.stateT = 1.6 * fast; } return [0, 0]; }
    if (e.state === 'dropwind'){ if (e.stateT <= 0){ twSpawnNear(e, 'vulture', e.p2 ? 3 : 2, e.r + 30); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.8 * fast; } return [0, 0]; }
    if (e.state === 'ringwind'){ if (e.stateT <= 0){ twRing(e, e.p2 ? 18 : 12, 300, 0.32, '#E8DCFF', 5, Math.random() * TAU); addShock(e.x, e.y, 260, 0.5, 0, '#C8D8FF'); sfx('zap', 0.12); e.state = 'idle'; e.stateT = 1.5 * fast; } return [0, 0]; }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  il_hammer(e, dt, ux, uy, d){                                    /* Old Hammerhead: charges down the shallows, dives under and comes up behind her with a bite; at half it dives more */
    e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ilRoar(e, '#D8E4EA'); twSpawnNear(e, 'jackal', 3, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'charge'){ if (Math.random() < dt * 24) ilSplash(e.x, e.y, 1); if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.3 * fast; } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    if (e.state === 'dive'){                                                                                     /* under: unhittable, a fin and a wake heading for a spot behind her */
      const a = Math.atan2(P.vy || 0.01, P.vx || 0.01) + Math.PI, tx = P.x + Math.cos(a) * 170, ty = P.y + Math.sin(a) * 170, dx = tx - e.x, dy = ty - e.y, dd = hyp(dx, dy) || 1;
      e.ang = Math.atan2(dy, dx);
      if (e.stateT <= 0 || dd < 40){ e.untarg = false; e.hidden = false; e.state = 'bitewind'; e.stateT = 0.45; ilSplash(e.x, e.y, 2.2); addMarker(e.x, e.y, 150, 0.45, '#D8E4EA', null, { owner: e }); }
      return [dx / dd * e.spdE * 2.4, dy / dd * e.spdE * 2.4];
    }
    if (e.state === 'bitewind'){ e.ang = turnTo(e.ang, Math.atan2(P.y - e.y, P.x - e.x), 6 * dt); if (e.stateT <= 0){ hostileBlast(e.x, e.y, 150, e.dmg * 1.1, '#FFFFFF', { kb: 180, shake: 12 }); addShock(e.x, e.y, 200, 0.4, 0, '#C8FFF4'); if (e.p2) ilSpines(e, 10, 320, 0.3); e.state = 'idle'; e.stateT = 1.2 * fast; } return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.6 * dt);
    if (e.state === 'chargewind'){ if (e.stateT <= 0){ e.state = 'charge'; e.stateT = 0.85; e.dashVX = Math.cos(e.ang) * 640; e.dashVY = Math.sin(e.ang) * 640; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.state === 'idle' && e.stateT <= 0){
      const p = e.pat++ % (e.p2 ? 2 : 3);
      if (p === 1 && e.wet){ e.state = 'dive'; e.stateT = 1.4; e.untarg = true; e.hidden = true; ilSplash(e.x, e.y, 2); sfx('whoosh', 0.1); return [0, 0]; }
      e.state = 'chargewind'; e.stateT = 0.6; return [0, 0];
    }
    return [ux * e.spdE, uy * e.spdE];
  },
  il_leviathan(e, dt, ux, uy, d){                                /* The Leviathan Eel: circles her spitting, lunges the length of its body, and coils to throw a ring; at half, eel hounds join it */
    e.stateT -= dt;
    if (!e.trail) e.trail = [];                                                                                /* where the head has been: the body is drawn along it */
    const tl = e.trail[0]; if (!tl || hyp(e.x - tl[0], e.y - tl[1]) > e.r * 0.36){ e.trail.unshift([e.x, e.y]); if (e.trail.length > 24) e.trail.pop(); }
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; e.circ = Math.random() < 0.5 ? 1 : -1; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ilRoar(e, '#8AF0D8'); twSpawnNear(e, 'jackal', 4, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'lunge'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.2 * fast; } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    if (e.state === 'lungewind'){ e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); if (e.stateT <= 0){ e.state = 'lunge'; e.stateT = 0.55; e.dashVX = Math.cos(e.ang) * 760; e.dashVY = Math.sin(e.ang) * 760; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.state === 'coil'){ if (e.stateT <= 0){ twRing(e, e.p2 ? 20 : 14, 290, 0.32, '#8AF0D8', 5, Math.random() * TAU); addShock(e.x, e.y, 240, 0.5, 0, '#8AF0D8'); e.state = 'idle'; e.stateT = 1.4 * fast; sfx('boom', 0.1); } e.ang += dt * 6; return [0, 0]; }
    if (e.state === 'idle' && e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'circle' : p === 1 ? 'lungewind' : 'coil'; e.stateT = p === 0 ? 2.4 : p === 1 ? 0.6 : 0.8; e.fireT = 0.3; return [0, 0]; }
    if (e.state === 'circle'){
      e.fireT -= dt; if (e.fireT <= 0 && twSight(e)){ e.fireT = e.p2 ? 0.3 : 0.45; fireBullet(e, leadAim(e, 400), 400, 0.4, '#8AF0D8', 6); sfx('spit', 0.05); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.5; }
      const rad = d > 380 ? 0.8 : d < 300 ? -0.6 : 0, tx = -uy * e.circ, ty = ux * e.circ; e.ang = Math.atan2(uy * rad + ty, ux * rad + tx);
      return [(ux * rad + tx) * e.spdE * 1.3, (uy * rad + ty) * e.spdE * 1.3];
    }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
    return [ux * e.spdE, uy * e.spdE];
  },
  il_zero(e, dt, ux, uy, d){                                      /* Specimen Zero: three phases (70%, 35%). Arms come up through the grates and the floor round her, ink floods the room, it calls what is left in the tanks, and spits rings; each phase faster */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.8 * dt); e.stateT -= dt;
    const f = e.hp / e.maxHp, ph = f < 0.35 ? 3 : f < 0.7 ? 2 : 1;
    if (e.pat === undefined){ e.pat = 0; e.phase = 1; e.glow = 0; }
    if (ph > e.phase){ e.phase = ph; ilRoar(e, '#C8F0A8'); twSpawnNear(e, ph === 2 ? 'baboon' : 'ember', ph === 2 ? 2 : 3, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.phase > 1 ? dt : -dt), 0, 1);
    const fast = ph === 1 ? 1 : ph === 2 ? 0.8 : 0.62;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 360 ? 0.8 : d < 220 ? -0.4 : 0.05;
      if (e.stateT <= 0){ const p = e.pat++ % (ph === 3 ? 4 : 3); e.state = p === 0 ? 'armswind' : p === 1 ? 'spawnwind' : p === 2 ? 'ringwind' : 'inkwind'; e.stateT = 0.8; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'armswind'){
      if (e.stateT <= 0){ const n = ph + 2, dm = e.dmg * 0.85; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-300, 300) : P.vx * 0.45), P.y + (k ? rand(-300, 300) : P.vy * 0.45)); ilArm(p.x, p.y, 0.9 + k * 0.12, dm); } sfx('whoosh', 0.12); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    if (e.state === 'spawnwind'){
      if (e.stateT <= 0){ twSpawnNear(e, ph === 1 ? 'grub' : ph === 2 ? 'jackal' : 'mamba', ph === 1 ? 5 : 3, e.r + 60); addShock(e.x, e.y, 170, 0.4, 0, '#C8F0A8'); sfx('boom', 0.08); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    if (e.state === 'ringwind'){
      if (e.stateT <= 0){ twRing(e, ph === 1 ? 12 : 18, 290, 0.34, '#C8F0A8', 6, Math.random() * TAU); twFan(e, ph + 3, 0.2, 420, 0.4, '#E8FFD8', 5); sfx('boom', 0.1); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'inkwind'){
      if (e.stateT <= 0){ const dm = e.dmg; for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + Math.random(), p = towerOpenNear(P.x + Math.cos(a) * 200, P.y + Math.sin(a) * 200); hostileZone(p.x, p.y, 150, 4, dm * 0.12, '#1A0E1E'); ilInk(p.x, p.y, 170, 4); } addShock(e.x, e.y, 300, 0.5, 0, '#3A2A3A'); sfx('spit', 0.12); e.state = 'idle'; e.stateT = 1.8 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  }
};
const ISLE_AI_RAW = Object.assign({}, ISLE_AI_COMMON, ISLE_BOSS_AI);
/* every behavior goes through the water: a swimmer quicker in it, the rest slower */
Object.keys(ISLE_AI_RAW).forEach(function(k){ const f = ISLE_AI_RAW[k]; ISLE_AI[k] = function(e){ const m = ilWaterMul(e), r = f.apply(this, arguments); return m === 1 ? r : [r[0] * m, r[1] * m]; }; });

/* ---- ink clouds and Specimen Zero's arms: world effects that are not creatures, drawn in the live ground layer (ilDrawLive) ---- */
function ilInk(x, y, r, dur){ if (!G.il) return; G.il.ink = G.il.ink || []; if (G.il.ink.length < 16) G.il.ink.push({ x: x, y: y, r: r, t: 0, dur: dur }); }
function ilArm(x, y, wait, dm){
  if (!G.il) return; G.il.arms = G.il.arms || [];
  addMarker(x, y, 85, wait, '#C8F0A8', function(m){ hostileBlast(m.x, m.y, 85, dm, '#C8F0A8', { shake: 6 }); ilSplash(m.x, m.y, 1.6); if (G.il.arms.length < 12) G.il.arms.push({ x: m.x, y: m.y, t: 0, dur: 1.4, a: Math.random() * TAU }); });
}
function ilEffectsTick(dt){
  const il = G.il; if (!il) return;
  if (il.ink) for (let i = il.ink.length - 1; i >= 0; i--){ il.ink[i].t += dt; if (il.ink[i].t > il.ink[i].dur) il.ink.splice(i, 1); }
  if (il.arms) for (let i = il.arms.length - 1; i >= 0; i--){ il.arms[i].t += dt; if (il.arms[i].t > il.arms[i].dur) il.arms.splice(i, 1); }
  if (il.glimpse){ il.glimpse.t -= dt; if (il.glimpse.t <= 0) il.glimpse = null; }
}
function ilDrawEffects(ctx, x0, y0, x1, y1, t){
  const il = G.il; if (!il) return;
  if (il.ink) for (let i = 0; i < il.ink.length; i++){
    const k = il.ink[i], a = Math.min(1, k.t * 4) * Math.min(1, (k.dur - k.t) * 1.5);
    for (let q = 0; q < 6; q++){ const qa = q * TAU / 6 + k.t * 0.3, rr = k.r * (0.45 + 0.1 * Math.sin(k.t * 2 + q)); ctx.fillStyle = 'rgba(26,14,30,' + (0.32 * a).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(k.x + Math.cos(qa) * k.r * 0.4, k.y + Math.sin(qa) * k.r * 0.35, rr, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(16,8,20,' + (0.5 * a).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(k.x, k.y, k.r * 0.55, 0, TAU); ctx.fill();
  }
  if (il.arms) for (let i = 0; i < il.arms.length; i++){
    const m = il.arms[i], up = Math.sin(Math.min(1, m.t / m.dur) * Math.PI), L = 120 * up, sw = Math.sin(m.t * 6 + m.a) * 0.4;
    ctx.fillStyle = 'rgba(10,20,26,.4)'; ctx.beginPath(); ctx.ellipse(m.x, m.y + 6, 34, 20, 0, 0, TAU); ctx.fill();
    ilTentacle(ctx, m.x, m.y, m.a - Math.PI / 2 + sw, L, 22 * (0.4 + up * 0.6), '#5A3A6A', '#C8F0A8');
    ctx.strokeStyle = 'rgba(240,252,250,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(m.x, m.y, 30 + up * 10, 18 + up * 6, 0, 0, TAU); ctx.stroke();
  }
}
/* a tentacle from its root at (x, y), curling: tapering segments, suckers on the underside, the tip curled over */
function ilTentacle(ctx, x, y, a, L, w, c, suck){
  const n = 9; let px = x, py = y, pa = a; const pts = [[x, y]];
  for (let i = 1; i <= n; i++){ pa += 0.16 + i * 0.03; px += Math.cos(pa) * L / n; py += Math.sin(pa) * L / n; pts.push([px, py]); }
  for (let i = 0; i < n; i++){ const ww = w * (1 - i / n * 0.85); ctx.strokeStyle = tw_sh(c, 0.4); ctx.lineWidth = ww + 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); }
  for (let i = 0; i < n; i++){ const ww = w * (1 - i / n * 0.85); ctx.strokeStyle = c; ctx.lineWidth = ww; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); }
  for (let i = 1; i < n; i += 1){ const ww = w * (1 - i / n * 0.85), q = pts[i], r = pts[i + 1], na = Math.atan2(r[1] - q[1], r[0] - q[0]) + Math.PI / 2; fillCircle(ctx, q[0] + Math.cos(na) * ww * 0.28, q[1] + Math.sin(na) * ww * 0.28, Math.max(1.2, ww * 0.18), suck); }
  ctx.lineCap = 'butt';
}

/* under the water a hider is only a dark shape with a wake, and a dorsal fin for the shark: drawn instead of its picture */
const isleBaseDrawEnemy = drawEnemy;
drawEnemy = function(ctx, e){
  if (!e.hidden || !e.def.isle) return isleBaseDrawEnemy.apply(this, arguments);
  const a = e.ang || 0, L = e.r * (e.big ? 1.6 : 1.4), t = G.time;
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(10,40,48,.42)'; ctx.beginPath(); ctx.ellipse(0, 0, L, e.r * 0.42, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(10,40,48,.3)'; ctx.beginPath(); ctx.moveTo(-L * 0.8, 0); for (let i = 0; i <= 6; i++) ctx.lineTo(-L * 0.8 - i * L * 0.12, Math.sin(t * 8 + i) * e.r * 0.14 * i / 6); ctx.lineTo(-L * 1.5, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(240,252,250,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L * 0.9, 0); ctx.lineTo(-L * 0.6, -e.r * 0.9); ctx.moveTo(L * 0.9, 0); ctx.lineTo(-L * 0.6, e.r * 0.9); ctx.stroke();
  if (e.type === 'buffalo'){ ctx.fillStyle = e.def.dark; ctx.beginPath(); ctx.moveTo(L * 0.15, 0); ctx.lineTo(-L * 0.25, -4); ctx.lineTo(-L * 0.3, 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.moveTo(L * 0.1, -1); ctx.lineTo(-L * 0.2, -10); ctx.lineTo(-L * 0.24, 0); ctx.closePath(); ctx.fill(); }
  ctx.restore();
};

/* ---- the scientist: on each boss wave, a lit screen in the corner with a face behind lab glass and one line ---- */
const ISLE_GLIMPSE = {
  lion: 'Ah. The giraffe from the fort. Do try not to step on the crabs. They were expensive.',
  matriarch: 'Fascinating. You are faster in the water than my notes said.',
  buffalo: 'Old Hammerhead has not been fed today. I expect you will do.',
  crocodile: 'Please stop breaking my reef. It took eleven years.',
  wildfire: 'You will not like Zero. Nobody likes Zero. I am leaving now.'
};
const isleBaseStartWave = startWave;
startWave = function(n){
  const r = isleBaseStartWave.apply(this, arguments);
  if (chapterOf(n) === ISLE_CHAPTER && G.il){
    G.il.wetAtStart = G.il.wet;
    if (n % 5 === 0){ const bt = bossForWave(n); G.il.glimpse = { t: 6.5, max: 6.5, line: ISLE_GLIMPSE[bt] || '' }; G.il.bossHit = false; G.il.bossType = bt; }
  }
  return r;
};
/* a boss beaten without a scratch is remembered (the achievement "Untouchable") */
const isleBaseHurtPlayer = hurtPlayer;
hurtPlayer = function(){ const hp = P.hp; const r = isleBaseHurtPlayer.apply(this, arguments); if (G.il && G.chapter === ISLE_CHAPTER && G.bossAlive && P.hp < hp) G.il.bossHit = true; return r; };
const isleBaseKill = killEnemy;
killEnemy = function(e){
  const was = e.dead, r = isleBaseKill.apply(this, arguments);
  if (!was && e.big && G.il && G.chapter === ISLE_CHAPTER && e.def.isle && !G.il.bossHit && Save.data){
    const bit = ['lion', 'matriarch', 'buffalo', 'crocodile', 'wildfire'].indexOf(e.type);
    if (bit >= 0 && !((Save.data.isleClean | 0) & (1 << bit))){ Save.data.isleClean = (Save.data.isleClean | 0) | (1 << bit); Save.write(); }
  }
  return r;
};
const isleBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ isleBaseBldUpdate.apply(this, arguments); if (G.biome === 'isle' && G.chapter === ISLE_CHAPTER) ilEffectsTick(dt); };
const isleBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  isleBaseOverlays.apply(this, arguments);
  const il = G.il; if (G.chapter !== ISLE_CHAPTER || G.biome !== 'isle' || !il || !il.glimpse || G.attract || G.state === 'levelup') return;
  const g = il.glimpse, k = clamp(Math.min((g.max - g.t) * 3, g.t * 2), 0, 1), W = G.W, H = G.H, sw = clamp(W * 0.26, 180, 260), sh = sw * 0.62;
  const x0 = W - sw - 16, y0 = clamp(H * 0.16, 70, 140) + (1 - k) * -30;
  ctx.save(); ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(8,14,16,.92)'; ctx.fillRect(x0 - 6, y0 - 6, sw + 12, sh + 12); ctx.strokeStyle = '#7AF0E0'; ctx.lineWidth = 2; ctx.strokeRect(x0 - 6, y0 - 6, sw + 12, sh + 12);
  ilScientist(ctx, x0, y0, sw, sh, G.time);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = y0; yy < y0 + sh; yy += 3) ctx.fillRect(x0, yy, sw, 1);
  ctx.fillStyle = '#FF5A4A'; ctx.beginPath(); ctx.arc(x0 + 12, y0 + 12, 4, 0, TAU); ctx.fill(); ctx.font = '800 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#E8FFF8'; ctx.fillText('LAB FEED', x0 + 20, y0 + 16);
  const lines = [], words = g.line.split(' '); let cur = ''; ctx.font = '600 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  for (let i = 0; i < words.length; i++){ const tt = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(tt).width > sw + 4){ lines.push(cur); cur = words[i]; } else cur = tt; } if (cur) lines.push(cur);
  ctx.fillStyle = 'rgba(8,14,16,.85)'; ctx.fillRect(x0 - 6, y0 + sh + 8, sw + 12, lines.length * 15 + 10); ctx.fillStyle = '#C8F0E8';
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x0, y0 + sh + 22 + i * 15);
  ctx.restore();
};
/* the scientist behind the lab glass: a head and shoulders in a white coat, round glasses, a headset, the tanks glowing behind; drawn into a box (x, y, w, h) */
function ilScientist(ctx, x, y, w, h, t){
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#1E4A48'); g.addColorStop(1, '#0E2224'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 3; i++){ const tx = x + w * (0.15 + i * 0.35), gl = 0.5 + 0.3 * Math.sin(t * 2 + i); ctx.fillStyle = 'rgba(90,230,190,' + (0.25 * gl).toFixed(3) + ')'; ctx.fillRect(tx - w * 0.1, y + h * 0.05, w * 0.2, h * 0.7); ctx.strokeStyle = 'rgba(160,240,220,.4)'; ctx.lineWidth = 2; ctx.strokeRect(tx - w * 0.1, y + h * 0.05, w * 0.2, h * 0.7); ctx.fillStyle = 'rgba(20,50,44,.6)'; ctx.beginPath(); ctx.ellipse(tx, y + h * 0.42, w * 0.05, h * 0.12, Math.sin(t * 0.5 + i) * 0.3, 0, TAU); ctx.fill(); }
  const cx = x + w * 0.5, by = y + h, s = h / 100, nod = Math.sin(t * 1.4) * 1.5 * s;
  ctx.fillStyle = '#E8ECEE'; ctx.beginPath(); ctx.moveTo(cx - 44 * s, by); ctx.quadraticCurveTo(cx - 40 * s, by - 30 * s, cx - 14 * s, by - 34 * s); ctx.lineTo(cx + 14 * s, by - 34 * s); ctx.quadraticCurveTo(cx + 40 * s, by - 30 * s, cx + 44 * s, by); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8D0D4'; ctx.beginPath(); ctx.moveTo(cx - 12 * s, by - 34 * s); ctx.lineTo(cx, by - 14 * s); ctx.lineTo(cx + 12 * s, by - 34 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A5A54'; ctx.beginPath(); ctx.moveTo(cx - 6 * s, by - 32 * s); ctx.lineTo(cx, by - 18 * s); ctx.lineTo(cx + 6 * s, by - 32 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7AF0E0'; ctx.fillRect(cx + 20 * s, by - 24 * s, 10 * s, 5 * s); ctx.fillStyle = '#3A4244'; ctx.fillRect(cx - 30 * s, by - 22 * s, 8 * s, 12 * s);
  ctx.fillStyle = '#D8B494'; ctx.fillRect(cx - 7 * s, by - 44 * s + nod, 14 * s, 12 * s);
  ctx.fillStyle = '#E8C4A4'; ctx.beginPath(); ctx.ellipse(cx, by - 58 * s + nod, 17 * s, 20 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#C8C8C4'; ctx.beginPath(); ctx.ellipse(cx, by - 74 * s + nod, 18 * s, 8 * s, 0, Math.PI, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx - 16 * s, by - 62 * s + nod, 4 * s, 9 * s, 0.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx + 16 * s, by - 62 * s + nod, 4 * s, 9 * s, -0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 1.6 * s; for (const sd of [-1, 1]){ ctx.beginPath(); ctx.arc(cx + sd * 7 * s, by - 58 * s + nod, 5.4 * s, 0, TAU); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx - 1.6 * s, by - 58 * s + nod); ctx.lineTo(cx + 1.6 * s, by - 58 * s + nod); ctx.stroke();
  ctx.fillStyle = 'rgba(200,240,255,.45)'; for (const sd of [-1, 1]){ ctx.beginPath(); ctx.arc(cx + sd * 7 * s, by - 58 * s + nod, 4.6 * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#2A2E34'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sd * 7 * s + Math.sin(t * 0.7) * 1.2 * s, by - 58 * s + nod, 1.6 * s, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#8A5A44'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); const talk = Math.abs(Math.sin(t * 9)) * 2.4 * s; ctx.ellipse(cx, by - 47 * s + nod, 4 * s, 1 * s + talk * 0.5, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(cx, by - 60 * s + nod, 20 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); fillCircle(ctx, cx - 19 * s, by - 58 * s + nod, 3 * s, '#2A2E34'); ctx.beginPath(); ctx.moveTo(cx - 19 * s, by - 56 * s + nod); ctx.quadraticCurveTo(cx - 16 * s, by - 46 * s + nod, cx - 6 * s, by - 46 * s + nod); ctx.stroke();
  ctx.restore();
}
