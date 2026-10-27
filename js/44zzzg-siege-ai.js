'use strict';
/* Chapter 15, the Siege: how the machines and the mutants move and attack (the kinds are in js/30e-chapter-siege.js, their pictures in js/35k-art-siege.js). */
/* ========================= THE SIEGE'S BEHAVIORS ========================= */
/* Each is called like a Tower behavior from the enemy update's default branch: (e, dt, ux, uy, d) -> [mvx, mvy], e.spdE is its speed. ux and uy already point the way round the
   buildings (towerSteer), or, for a hunter far from her, along the way to its building (js/44zzze-siege-defense.js), and every shot dies on a building, so the shooters check
   twSight first. The bosses use the Tower's phase idea: at half health (the Warden: at 55% and 25%) they change gear with a roar. */
function sgLunge(e, dt, ux, uy, d, reach, speed, rest){                                   /* weave in with the pack, then a snapping lunge */
  const spd = e.spdE; e.stateT -= dt;
  if (e.state === 'lunge'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(rest[0], rest[1]); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
  if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
  const w = Math.sin(e.anim * 0.9 + e.jSeed) * 0.9; e.ang = Math.atan2(uy, ux);
  if (d < reach && e.stateT <= 0 && twSight(e)){ e.state = 'lunge'; e.stateT = 0.28; e.dashVX = ux * spd * speed; e.dashVY = uy * spd * speed; return [e.dashVX, e.dashVY]; }
  return [(ux - uy * w * twLat(e)) * spd, (uy + ux * w * twLat(e)) * spd];
}
function sgRush(e, dt, ux, uy, d, lo, hi, speed, windT, runT, rest, turn){                /* wind up, then run flat out in a straight line */
  const want = Math.atan2(uy, ux); e.stateT -= dt;
  if (e.state === 'roll'){
    if (Math.random() < dt * 24) addParticle(e.x, e.y, rand(-20, 20), rand(-20, 20), rand(2, 3), 0.25, '#A8C8FF', { drag: 2 });
    if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(rest[0], rest[1]); }
    e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY];
  }
  e.ang = turnTo(e.ang, want, turn * dt);
  if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'roll'; e.stateT = runT; e.dashVX = Math.cos(e.ang) * speed; e.dashVY = Math.sin(e.ang) * speed; sfx('whoosh', 0.12); } return [0, 0]; }
  if (e.stateT <= 0 && d < hi && d > lo && twSight(e)){ e.state = 'wind'; e.stateT = windT; }
  return [ux * e.spdE, uy * e.spdE];
}
const SIEGE_AI_COMMON = {
  sg_patrol(e, dt, ux, uy, d){ return sgLunge(e, dt, ux, uy, d, 170, 3.2, [0.9, 1.6]); },                                  /* Patrol Bot */
  sg_glassfang(e, dt, ux, uy, d){ return sgLunge(e, dt, ux, uy, d, 200, 3.6, [1, 1.8]); },                                  /* Glassfang: a longer, faster lunge */
  sg_raptor(e, dt, ux, uy, d){ return sgRush(e, dt, ux, uy, d, 160, 560, 700, 0.45, 0.7, [1.2, 2], 3.4); },                 /* Raptor Bot: spins up and sprints */
  sg_hornback(e, dt, ux, uy, d){                                                                                           /* Glimmerhorn: lowers its horn, then charges */
    const want = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'charge'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.6, 2.4); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    e.ang = turnTo(e.ang, want, 2.4 * dt);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'charge'; e.stateT = 0.55; e.dashVX = Math.cos(e.ang) * 620; e.dashVY = Math.sin(e.ang) * 620; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 520 && d > 170 && twSight(e)){ e.state = 'wind'; e.stateT = 0.55; }
    return [ux * e.spdE, uy * e.spdE];
  },
  sg_skitter(e, dt, ux, uy, d){                                                                                            /* Skitter Drone: circles, then delivers itself straight through her */
    const spd = e.spdE; e.stateT -= dt;
    if (e.state === 'dash'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    e.ang = Math.atan2(uy, ux);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.55; e.dashVX = ux * 760; e.dashVY = uy * 760; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    const rad = d > 320 ? 1 : d < 230 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 500 && twSight(e)){ e.state = 'wind'; e.stateT = 0.4; }
    const lat = 0.9 * twLat(e); return [ux * spd * rad - uy * spd * lat * e.dirS, uy * spd * rad + ux * spd * lat * e.dirS];
  },
  sg_spotter(e, dt, ux, uy, d){                                                                                            /* Spotter Drone: hangs back with its light on her, then puts one fast bolt where she is going */
    e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'aim'){ if (e.stateT <= 0){ fireBullet(e, leadAim(e, 540), 540, 0.5, '#FFE8A0', 4); sfx('spit', 0.08); e.state = 'idle'; e.stateT = rand(1.5, 2.3); } return [0, 0]; }
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    const dir = d > 420 ? 1 : d < 300 ? -0.7 : 0, lat = 0.5 * twLat(e);
    if (e.stateT <= 0 && d < 620 && twSight(e)){ e.state = 'aim'; e.stateT = 0.6; }
    return [ux * e.spdE * dir - uy * e.spdE * lat * e.dirS, uy * e.spdE * dir + ux * e.spdE * lat * e.dirS];
  },
  sg_hurler(e, dt, ux, uy, d){                                                                                             /* Rockhurler: keeps its distance and lobs a rock */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); e.stateT -= dt;
    if (e.state === 'lobwind'){ if (e.stateT <= 0){ fireBullet(e, leadAim(e, 330), 330, 0.7, '#8A8E98', 8); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = rand(1.8, 2.8); } return [0, 0]; }
    const dir = d > 360 ? 1 : d < 240 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 520 && twSight(e)){ e.state = 'lobwind'; e.stateT = 0.6; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  sg_torch(e, dt, ux, uy, d){                                                                                              /* Torch Bot: edges close, then breathes fire in a short cone */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.state === 'burnwind'){ if (e.stateT <= 0){ e.state = 'burn'; e.stateT = 0.9; e.fireT = 0; } return [0, 0]; }
    if (e.state === 'burn'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = 0.12; fireBullet(e, e.ang + rand(-0.22, 0.22), rand(260, 340), 0.22, '#FF8A3A', 5); sfx('whoosh', 0.1); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2, 3); } return [ux * e.spdE * 0.3, uy * e.spdE * 0.3];
    }
    const dir = d > 230 ? 1 : d < 150 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 330 && twSight(e)){ e.state = 'burnwind'; e.stateT = 0.5; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  }
};

/* ---- the bosses ---- */
const SIEGE_BOSS_AI = {
  sg_walker(e, dt, ux, uy, d){                                  /* The Scrap Walker: a hunter that goes for the buildings first (its stomps crack the ones near it), and it stamps, fires its shoulder cannon, and sweeps a beam; at half it is faster and stamps with a ring of scrap */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'stompwind'; e.stateT = 0.9; e.stompMk = undefined; sfx('boom', 0.2); addShake(10); screenFlash('#FFB070', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 300 ? 1 : d < 180 ? -0.5 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'stompwind' : p === 1 ? 'cannonwind' : 'beamwind'; e.stateT = p === 0 ? 0.8 : 0.7; e.shotsLeft = e.p2 ? 3 : 2; e.stompMk = undefined; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'stompwind'){
      if (e.stompMk === undefined){ e.stompMk = true; addMarker(e.x, e.y, 230, e.stateT, '#FFB84A', null, { owner: e }); }
      if (e.stateT <= 0){ e.stompMk = undefined; hostileBlast(e.x, e.y, 230, e.dmg, '#FFB84A', { kb: 160, shake: 14 }); sgCollateral(e.x, e.y, 230, 7); addShock(e.x, e.y, 260, 0.6, 0, '#FFB84A'); if (e.p2) twRing(e, 10, 300, 0.35, '#C8CCD4', 5); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'cannonwind'){
      if (e.stateT <= 0){ twFan(e, e.p2 ? 7 : 5, 0.2, 430, 0.5, '#FFB84A', 6); sfx('boom', 0.08); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.5; else { e.state = 'idle'; e.stateT = 1.5 * fast; } }
      return [0, 0];
    }
    if (e.state === 'beamwind'){
      if (e.stateT <= 0){ const a = Math.atan2(P.y - e.y, P.x - e.x); for (let k = 0; k < (e.p2 ? 3 : 2); k++){ const aa = a + (k - (e.p2 ? 1 : 0.5)) * 0.5; addBeam(e.x, e.y, e.x + Math.cos(aa) * 1100, e.y + Math.sin(aa) * 1100, 26, 0.6, 0.22, e.dmg * 0.7, '#FF8A4A', { owner: e }); } e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  sg_queen(e, dt, ux, uy, d){                                   /* The Brood Queen: lays maggots, spits acid in a fan, and pools it where she is standing; at half she lays six at a time */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.4 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'spawnwind'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#C8FF6A', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 320 ? 1 : d < 200 ? -0.5 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'spawnwind' : p === 1 ? 'spitwind' : 'pool'; e.stateT = 0.7; e.shotsLeft = e.p2 ? 3 : 2; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'spawnwind'){ if (e.stateT <= 0){ twSpawnNear(e, 'grub', e.p2 ? 6 : 4, e.r + 60); addShock(e.x, e.y, 150, 0.4, 0, '#C8FF6A'); sfx('boom', 0.08); e.state = 'idle'; e.stateT = 1.6 * fast; } return [0, 0]; }
    if (e.state === 'spitwind'){
      if (e.stateT <= 0){ twFan(e, e.p2 ? 7 : 5, 0.22, 380, 0.45, '#BFFF6A', 6); sfx('spit', 0.1); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.5; else { e.state = 'idle'; e.stateT = 1.5 * fast; } }
      return [0, 0];
    }
    if (e.state === 'pool'){
      if (e.stateT <= 0){ const n = e.p2 ? 5 : 3; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + P.vx * 0.4 + (k ? rand(-220, 220) : 0), P.y + P.vy * 0.4 + (k ? rand(-220, 220) : 0)); addMarker(p.x, p.y, 95, 0.7 + k * 0.1, '#BFFF6A', function(m){ hostileZone(m.x, m.y, 95, 4, e.dmg * 0.15, '#9AE86A'); }); } e.state = 'idle'; e.stateT = 1.6 * fast; sgAcidOn(e); }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  sg_ram(e, dt, ux, uy, d){                                     /* The Battering Ram: backs its ram off, then drives it into whatever is ahead; a wall stuns it (and the building is hit as it arrives, by the siege code); at half it throws scrap */
    e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'stun'; e.stateT = 1; sfx('boom', 0.2); addShake(10); screenFlash('#FFD890', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'charge'){
      e.ang = Math.atan2(e.dashVY, e.dashVX);
      const wall = towerWallAhead(e, Math.cos(e.ang), Math.sin(e.ang), e.r + 50);
      if (e.stateT <= 0 || wall){
        if (wall){ e.state = 'stun'; e.stateT = 1.4; hostileBlast(e.x + Math.cos(e.ang) * e.r, e.y + Math.sin(e.ang) * e.r, 170, e.dmg * 0.6, '#FFD890', { kb: 100, shake: 14 }); addShake(14); sfx('boom', 0.2); sgCollateral(e.x, e.y, 170, 10); addText(e.x, e.y - e.r - 14, 'Stuck!', '#FFD890', 16, true); e.dashVX = e.dashVY = 0; }
        else { e.state = 'idle'; e.stateT = 1.1 * fast; }
        if (e.p2) twRing(e, 8, 300, 0.35, '#B8863A', 5);
        return [0, 0];
      }
      return [e.dashVX, e.dashVY];
    }
    if (e.state === 'stun'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.8; } return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.8 * dt);
    if (e.state === 'chargewind'){
      if (e.stateT <= 0){ e.state = 'charge'; e.stateT = 1.1; e.dashVX = Math.cos(e.ang) * 640; e.dashVY = Math.sin(e.ang) * 640; sfx('whoosh', 0.14); }
      return [-Math.cos(e.ang) * e.spdE * 0.3, -Math.sin(e.ang) * e.spdE * 0.3];
    }
    if (e.stateT <= 0 && d < 900){ e.state = 'chargewind'; e.stateT = 0.9; const a = e.ang; addMarker(e.x + Math.cos(a) * 260, e.y + Math.sin(a) * 260, 110, 0.9, '#FFB84A', null, { owner: e }); }
    return [ux * e.spdE, uy * e.spdE];
  },
  sg_carrier(e, dt, ux, uy, d){                                 /* The Hive Carrier: hangs over the street, opens its bay to let out the little drones, drops a pattern of bombs, and rains a ring of shot; at half it launches five */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.8 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'launchwind'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#B0C0DC', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 340 ? 1 : d < 220 ? -0.7 : 0.1, lat = 0.5;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'launchwind' : p === 1 ? 'bombwind' : 'ringwind'; e.stateT = p === 1 ? 0.7 : 0.8; }
      return [ux * e.spdE * dir - uy * e.spdE * lat, uy * e.spdE * dir + ux * e.spdE * lat];
    }
    if (e.state === 'launchwind'){ if (e.stateT <= 0){ twSpawnNear(e, 'jackal', e.p2 ? 5 : 3, e.r + 40); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.8 * fast; } return [0, 0]; }
    if (e.state === 'bombwind'){
      if (e.stateT <= 0){ const n = e.p2 ? 7 : 5, dm = e.dmg * 0.7; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-280, 280) : 0), P.y + (k ? rand(-280, 280) : 0)); addMarker(p.x, p.y, 100, 0.8 + k * 0.1, '#FF5A4A', function(m){ hostileBlast(m.x, m.y, 100, dm, '#FFB070', { shake: 6, column: true }); }); } e.state = 'idle'; e.stateT = 1.7 * fast; sgBombRun(e); }
      return [0, 0];
    }
    if (e.state === 'ringwind'){ if (e.stateT <= 0){ twRing(e, e.p2 ? 16 : 12, 300, 0.35, '#B0C0DC', 5, Math.random() * TAU); sfx('boom', 0.1); e.state = 'idle'; e.stateT = 1.5 * fast; } return [0, 0]; }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  sg_warden(e, dt, ux, uy, d){                                  /* The Warden: three phases (55%, 25%). It walks the street firing a rotating fan, sweeps beams across it, and stamps and calls patrol bots; each phase is faster and adds more */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.2 * dt); e.stateT -= dt;
    const f = e.hp / e.maxHp, ph = f < 0.25 ? 3 : f < 0.55 ? 2 : 1;
    if (e.pat === undefined){ e.pat = 0; e.phase = 1; e.glow = 0; }
    if (ph > e.phase){ e.phase = ph; e.state = 'roar'; e.stateT = 1; sfx('boom', 0.2); addShake(12); screenFlash('#FF5A4A', 0.2, 0.3); twSpawnNear(e, 'hyena', ph === 2 ? 3 : 5, e.r + 60); siegeJam(ph === 2 ? 8 : 10); }
    e.glow = clamp((e.glow || 0) + (e.phase > 1 ? dt : -dt), 0, 1);
    const fast = ph === 1 ? 1 : ph === 2 ? 0.8 : 0.62;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 340 ? 1 : d < 200 ? -0.5 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'barragewind' : p === 1 ? 'beamwind' : 'stompwind'; e.stateT = 0.7; e.shotsLeft = ph + 1; e.stompMk = undefined; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'barragewind'){
      if (e.stateT <= 0){ const n = ph === 1 ? 5 : ph === 2 ? 7 : 9; twFan(e, n, 0.2, 440, 0.45, '#FF8A6A', 6, leadAim(e, 440) + (e.shotsLeft % 2 ? 0.1 : -0.1)); sfx('boom', 0.08); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.4; else { e.state = 'idle'; e.stateT = 1.4 * fast; } }
      return [0, 0];
    }
    if (e.state === 'beamwind'){
      if (e.stateT <= 0){ const a = Math.atan2(P.y - e.y, P.x - e.x), n = ph === 1 ? 2 : ph === 2 ? 3 : 5; for (let k = 0; k < n; k++){ const aa = a + (k - (n - 1) / 2) * 0.45 + (k % 2 ? 0.1 : -0.1); addBeam(e.x, e.y, e.x + Math.cos(aa) * 1300, e.y + Math.sin(aa) * 1300, 30, 0.75, 0.3, e.dmg * 0.65, '#FF4A3A', { owner: e }); } e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    if (e.state === 'stompwind'){
      if (e.stompMk === undefined){ e.stompMk = true; addMarker(e.x, e.y, 260, e.stateT, '#FF5A4A', null, { owner: e }); }
      if (e.stateT <= 0){ e.stompMk = undefined; hostileBlast(e.x, e.y, 260, e.dmg * 0.8, '#FF5A4A', { kb: 160, shake: 14 }); sgCollateral(e.x, e.y, 260, 7); addShock(e.x, e.y, 290, 0.6, 0, '#FF8A6A'); twRing(e, ph === 1 ? 10 : 14, 320, 0.4, '#FF8A6A', 5); if (ph >= 2) twSpawnNear(e, 'hyena', 2, e.r + 50); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  }
};
Object.assign(SIEGE_AI, SIEGE_AI_COMMON, SIEGE_BOSS_AI);
