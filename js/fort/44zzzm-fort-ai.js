'use strict';
/* Chapter 16, Fort Shortneck: how the soldiers, machines and bosses move and attack (the kinds are in js/fort/30f-chapter-fort.js, their pictures in js/art/35n-art-fort.js). */
/* ========================= THE FORT'S BEHAVIORS ========================= */
/* Each is called like a Tower behavior from the enemy update's default branch: (e, dt, ux, uy, d) -> [mvx, mvy], e.spdE is its speed. ux and uy already point the way round the
   buildings (towerSteer), and every shot dies on a building, so the shooters check twSight first. The lunge and the rush are the Siege's (sgLunge, sgRush in js/siege/44zzzg-siege-ai.js).
   The bosses use the Tower's phase idea: at half health (the Maker: at 70% and 35%) they change gear with a roar. */
function ftBlast(x, y, r, dm, wait, color){                                       /* a marked patch on the ground that goes off after `wait` */
  addMarker(x, y, r, wait, color || '#FF5A4A', function(m){ hostileBlast(m.x, m.y, r, dm, '#FFB070', { shake: 6 }); });
}
function ftRoar(e, color){ e.state = 'roar'; e.stateT = 1; sfx('boom', 0.2); addShake(10); screenFlash(color || '#FFB070', 0.2, 0.3); }
const FORT_AI_COMMON = {
  ft_guard(e, dt, ux, uy, d){                                                      /* Base Guard: keeps its distance, strafes, and fires a burst of three */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 5 * dt); e.stateT -= dt;
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    if (e.state === 'burst'){
      e.fireT -= dt; if (e.fireT <= 0 && e.shots > 0){ e.fireT = 0.15; e.shots--; fireBullet(e, leadAim(e, 420), 420, 0.5, '#FFD88A', 4); sfx('spit', 0.05); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); }
      return [-uy * e.spdE * 0.3 * e.dirS, ux * e.spdE * 0.3 * e.dirS];
    }
    const dir = d > 360 ? 1 : d < 240 ? -0.7 : 0, lat = 0.55 * twLat(e);
    if (e.stateT <= 0 && d < 600 && twSight(e)){ e.state = 'burst'; e.stateT = 0.5; e.shots = 3; e.fireT = 0.12; }
    return [ux * e.spdE * dir - uy * e.spdE * lat * e.dirS, uy * e.spdE * dir + ux * e.spdE * lat * e.dirS];
  },
  ft_cadet(e, dt, ux, uy, d){                                                      /* Cadet: runs at her in panicky zigzags */
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const w = Math.sin(e.anim * 1.4 + e.jSeed) * 1.5; e.ang = Math.atan2(uy, ux);
    return [(ux - uy * w * twLat(e)) * e.spdE, (uy + ux * w * twLat(e)) * e.spdE];
  },
  ft_hound(e, dt, ux, uy, d){ return sgLunge(e, dt, ux, uy, d, 190, 3.4, [1, 1.8]); },                                    /* Guard Hound: weaves in, then a snapping lunge */
  ft_jeep(e, dt, ux, uy, d){ return sgRush(e, dt, ux, uy, d, 160, 600, 760, 0.45, 0.8, [1.2, 2], 3.2); },                  /* Scout Jeep: revs up and drives straight at her */
  ft_riot(e, dt, ux, uy, d){                                                       /* Riot Trooper: marches behind its shield, then bashes forward with it */
    e.stateT -= dt;
    if (e.state === 'bash'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.6, 2.4); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
    if (e.state === 'bashwind'){ if (e.stateT <= 0){ e.state = 'bash'; e.stateT = 0.4; e.dashVX = Math.cos(e.ang) * 520; e.dashVY = Math.sin(e.ang) * 520; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 280 && d > 80 && twSight(e)){ e.state = 'bashwind'; e.stateT = 0.5; }
    return [ux * e.spdE, uy * e.spdE];
  },
  ft_copter(e, dt, ux, uy, d){                                                     /* Mini Copter: circles overhead and marks a bomb where she is going */
    e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    if (e.state === 'dropwind'){ if (e.stateT <= 0){ const dm = e.dmg * 0.8; ftBlast(P.x + P.vx * 0.5, P.y + P.vy * 0.5, 90, dm, 0.9); e.state = 'idle'; e.stateT = rand(2.6, 3.6); } return [-uy * e.spdE * 0.4 * e.dirS, ux * e.spdE * 0.4 * e.dirS]; }
    const rad = d > 380 ? 1 : d < 260 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 560){ e.state = 'dropwind'; e.stateT = 0.5; }
    return [ux * e.spdE * rad - uy * e.spdE * 0.8 * e.dirS, uy * e.spdE * rad + ux * e.spdE * 0.8 * e.dirS];
  },
  ft_apc(e, dt, ux, uy, d){                                                        /* APC: rolls up, rams her, and when it is half wrecked the back door drops and three cadets pile out */
    e.stateT -= dt;
    if (!e.unl && e.hp < e.maxHp * 0.5){ e.unl = true; twSpawnNear(e, 'grub', 3, e.r + 30); addText(e.x, e.y - e.r - 12, 'Out!', '#FFD890', 14, true); }
    if (e.state === 'ram'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2, 3); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt);
    if (e.state === 'ramwind'){ if (e.stateT <= 0){ e.state = 'ram'; e.stateT = 0.6; e.dashVX = Math.cos(e.ang) * 480; e.dashVY = Math.sin(e.ang) * 480; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 420 && d > 120 && twSight(e)){ e.state = 'ramwind'; e.stateT = 0.6; }
    return [ux * e.spdE, uy * e.spdE];
  },
  ft_mortar(e, dt, ux, uy, d){                                                     /* Mortar Crew: stays well back and lobs a shell onto a marked patch */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.state === 'lobwind'){ if (e.stateT <= 0){ ftBlast(P.x + P.vx * 0.6, P.y + P.vy * 0.6, 110, e.dmg * 0.9, 1.0); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = rand(2.8, 3.8); } return [0, 0]; }
    const dir = d > 520 ? 1 : d < 400 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 760){ e.state = 'lobwind'; e.stateT = 0.7; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  ft_grenadier(e, dt, ux, uy, d){                                                  /* Grenadier: lobs a grenade that bursts and leaves a patch of fire */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); e.stateT -= dt;
    if (e.state === 'lobwind'){
      if (e.stateT <= 0){ const dm = e.dmg; addMarker(P.x + P.vx * 0.4, P.y + P.vy * 0.4, 85, 0.8, '#FF8A3A', function(m){ hostileBlast(m.x, m.y, 85, dm * 0.6, '#FFB070', { shake: 4 }); hostileZone(m.x, m.y, 85, 3.5, dm * 0.12, '#FF8A3A'); }); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = rand(2.2, 3.2); }
      return [0, 0];
    }
    const dir = d > 340 ? 1 : d < 240 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 520 && twSight(e)){ e.state = 'lobwind'; e.stateT = 0.5; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  ft_sniper(e, dt, ux, uy, d){                                                     /* Sniper: far off, a red laser on her for a second, then one hard shot */
    e.stateT -= dt;
    if (e.state === 'aim'){ e.ang = turnTo(e.ang, Math.atan2(P.y - e.y, P.x - e.x), 6 * dt); if (e.stateT <= 0){ fireBullet(e, e.ang, 700, 1.4, '#FF5A4A', 5); sfx('boom', 0.08); e.state = 'idle'; e.stateT = rand(2.2, 3.2); } return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt);
    const dir = d > 680 ? 1 : d < 520 ? -0.8 : 0;
    if (e.stateT <= 0 && d < 760 && twSight(e)){ e.state = 'aim'; e.stateT = 0.95; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  ft_pyro(e, dt, ux, uy, d){                                                       /* Pyro Trooper: edges close, then breathes fire in a short cone */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.state === 'burnwind'){ if (e.stateT <= 0){ e.state = 'burn'; e.stateT = 0.9; e.fireT = 0; } return [0, 0]; }
    if (e.state === 'burn'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = 0.12; fireBullet(e, e.ang + rand(-0.22, 0.22), rand(260, 340), 0.22, '#FF8A3A', 5); sfx('whoosh', 0.1); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2, 3); } return [ux * e.spdE * 0.3, uy * e.spdE * 0.3];
    }
    const dir = d > 230 ? 1 : d < 150 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 330 && twSight(e)){ e.state = 'burnwind'; e.stateT = 0.5; }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  ft_medic(e, dt, ux, uy, d){                                                      /* Field Medic: stays behind the others and patches up whoever is hurt nearby */
    e.stateT -= dt; e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
    if (e.state === 'heal'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.6; } return [0, 0]; }
    if (e.stateT <= 0){
      const near = enemiesNear(e.x, e.y, 230, []); let n = 0;
      for (let i = 0; i < near.length && n < 6; i++){ const o = near[i]; if (o === e || o.dead || o.untarg || o.def.turret || o.hp >= o.maxHp) continue; o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (o.big ? 0.008 : 0.07)); n++; burstParticles(o.x, o.y, 3, '#6AE08A', 70, 2.4, { glow: true }); }
      if (n){ e.state = 'heal'; e.stateT = 0.5; addShock(e.x, e.y, 120, 0.3, 0, '#6AE08A'); return [0, 0]; }
      e.stateT = 0.5;
    }
    const dir = d > 460 ? 1 : d < 320 ? -0.8 : 0;
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  }
};

/* ---- the bosses ---- */
const FORT_BOSS_AI = {
  ft_sergeant(e, dt, ux, uy, d){                                  /* Sergeant Ironside: sprays the rotary gun in a sweep, slams his riot plate down, and lobs grenades onto marked patches; at half he is faster and the gun never stops */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ftRoar(e); twSpawnNear(e, 'hyena', 3, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 320 ? 1 : d < 200 ? -0.5 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'spinwind' : p === 1 ? 'slamwind' : 'grenwind'; e.stateT = p === 1 ? 0.9 : 0.7; e.slamMk = undefined; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'spinwind'){ if (e.stateT <= 0){ e.state = 'spin'; e.stateT = 1.8; e.fireT = 0; e.a0 = Math.atan2(P.y - e.y, P.x - e.x) - 0.5; } return [0, 0]; }
    if (e.state === 'spin'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = e.p2 ? 0.06 : 0.09; e.a0 += e.p2 ? 0.075 : 0.055; fireBullet(e, e.a0, 430, 0.2, '#FFD88A', 4); if (e.p2) fireBullet(e, e.a0 + Math.PI, 380, 0.2, '#FFD88A', 4); sfx('spit', 0.04); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.4 * fast; }
      return [ux * e.spdE * 0.25, uy * e.spdE * 0.25];
    }
    if (e.state === 'slamwind'){
      if (e.slamMk === undefined){ e.slamMk = true; addMarker(e.x, e.y, 210, e.stateT, '#FFB84A', null, { owner: e }); }
      if (e.stateT <= 0){ e.slamMk = undefined; hostileBlast(e.x, e.y, 210, e.dmg * 0.8, '#FFB84A', { kb: 160, shake: 14 }); addShock(e.x, e.y, 240, 0.6, 0, '#FFB84A'); if (e.p2) twRing(e, 10, 300, 0.3, '#FFD88A', 5); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'grenwind'){
      if (e.stateT <= 0){ const n = e.p2 ? 5 : 3, dm = e.dmg * 0.7; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-260, 260) : P.vx * 0.4), P.y + (k ? rand(-260, 260) : P.vy * 0.4)); ftBlast(p.x, p.y, 95, dm, 0.8 + k * 0.1); } sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  ft_gunship(e, dt, ux, uy, d){                                   /* The Gunship: hangs above the yard, makes strafing runs with its chin gun, calls a rocket volley onto marked patches, and drops cadets on ropes; at half it runs twice in a row */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ftRoar(e, '#A8BCD8'); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 380 ? 1 : d < 250 ? -0.7 : 0.1, lat = 0.5;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'strafewind' : p === 1 ? 'rocketwind' : 'dropwind'; e.stateT = p === 0 ? 0.8 : 0.7; e.runs = e.p2 ? 2 : 1; }
      return [ux * e.spdE * dir - uy * e.spdE * lat, uy * e.spdE * dir + ux * e.spdE * lat];
    }
    if (e.state === 'strafewind'){ if (e.stateT <= 0){ e.state = 'strafe'; e.stateT = 1.1; e.fireT = 0; e.dashVX = Math.cos(e.ang) * 540; e.dashVY = Math.sin(e.ang) * 540; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.state === 'strafe'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = 0.1; fireBullet(e, e.ang + rand(-0.12, 0.12), 480, 0.22, '#FFD88A', 4); }
      if (e.stateT <= 0){ e.runs--; if (e.runs > 0){ e.state = 'strafewind'; e.stateT = 0.5; } else { e.state = 'idle'; e.stateT = 1.5 * fast; } }
      return [e.dashVX, e.dashVY];
    }
    if (e.state === 'rocketwind'){
      if (e.stateT <= 0){ const n = e.p2 ? 7 : 5, dm = e.dmg * 0.7; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-300, 300) : 0), P.y + (k ? rand(-300, 300) : 0)); ftBlast(p.x, p.y, 100, dm, 0.8 + k * 0.1); } sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'dropwind'){ if (e.stateT <= 0){ twSpawnNear(e, 'grub', e.p2 ? 6 : 4, e.r + 40); addText(e.x, e.y - e.r - 12, 'Fast rope!', '#FFD890', 15, true); e.state = 'idle'; e.stateT = 1.8 * fast; } return [0, 0]; }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  ft_tank(e, dt, ux, uy, d){                                      /* Old Thunder: fires a fan of shells, drives straight through whatever is ahead (a wall stuns it), and shells her from afar onto marked patches; at half it fires more and throws a ring of shrapnel */
    e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; e.state = 'stun'; e.stateT = 1; sfx('boom', 0.2); addShake(10); screenFlash('#FFD890', 0.2, 0.3); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'charge'){
      e.ang = Math.atan2(e.dashVY, e.dashVX);
      const wall = towerWallAhead(e, Math.cos(e.ang), Math.sin(e.ang), e.r + 50);
      if (e.stateT <= 0 || wall){
        if (wall){ e.state = 'stun'; e.stateT = 1.4; hostileBlast(e.x + Math.cos(e.ang) * e.r, e.y + Math.sin(e.ang) * e.r, 170, e.dmg * 0.6, '#FFD890', { kb: 100, shake: 14 }); addShake(14); sfx('boom', 0.2); addText(e.x, e.y - e.r - 14, 'Stuck!', '#FFD890', 16, true); }
        else { e.state = 'idle'; e.stateT = 1.1 * fast; }
        if (e.p2) twRing(e, 8, 300, 0.3, '#C8D49A', 5);
        return [0, 0];
      }
      return [e.dashVX, e.dashVY];
    }
    if (e.state === 'stun'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.8; } return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.8 * dt);
    if (e.state === 'chargewind'){ if (e.stateT <= 0){ e.state = 'charge'; e.stateT = 1.1; e.dashVX = Math.cos(e.ang) * 600; e.dashVY = Math.sin(e.ang) * 600; sfx('whoosh', 0.14); } return [-Math.cos(e.ang) * e.spdE * 0.3, -Math.sin(e.ang) * e.spdE * 0.3]; }
    if (e.state === 'cannonwind'){ if (e.stateT <= 0){ twFan(e, e.p2 ? 7 : 5, 0.2, 420, 0.5, '#FFB84A', 6); sfx('boom', 0.1); e.state = 'cannon'; e.stateT = 0.25; } return [0, 0]; }
    if (e.state === 'cannon'){ if (e.stateT <= 0){ e.shotsLeft--; if (e.shotsLeft > 0){ e.state = 'cannonwind'; e.stateT = 0.5; } else { e.state = 'idle'; e.stateT = 1.5 * fast; } } return [0, 0]; }
    if (e.state === 'mortarwind'){
      if (e.stateT <= 0){ const n = e.p2 ? 6 : 4, dm = e.dmg * 0.7; for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-280, 280) : 0), P.y + (k ? rand(-280, 280) : 0)); ftBlast(p.x, p.y, 105, dm, 0.9 + k * 0.1); } sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    const dir = d > 340 ? 1 : d < 200 ? -0.5 : 0;
    if (e.stateT <= 0){
      const p = e.pat++ % 3;
      if (p === 0){ e.state = 'cannonwind'; e.stateT = 0.8; e.shotsLeft = e.p2 ? 3 : 2; }
      else if (p === 1 && d < 900){ e.state = 'chargewind'; e.stateT = 0.9; const a = e.ang; addMarker(e.x + Math.cos(a) * 260, e.y + Math.sin(a) * 260, 110, 0.9, '#FFB84A', null, { owner: e }); }
      else { e.state = 'mortarwind'; e.stateT = 0.7; }
    }
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  ft_colonel(e, dt, ux, uy, d){                                   /* Colonel Mortimer: walks her down with a flamethrower on each arm, sends his shield drones (hounds) out, and fires a fan from the walker's chest; at half the flames last longer and the fan is a ring too */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.phase = 1; e.glow = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.phase = 2; ftRoar(e, '#FFD890'); twSpawnNear(e, 'jackal', 3, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.p2 ? dt : -dt), 0, 1);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 300 ? 1 : d < 180 ? -0.5 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'burnwind' : p === 1 ? 'dronewind' : 'fanwind'; e.stateT = 0.7; e.shotsLeft = e.p2 ? 3 : 2; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'burnwind'){ if (e.stateT <= 0){ e.state = 'burn'; e.stateT = e.p2 ? 2.2 : 1.6; e.fireT = 0; } return [0, 0]; }
    if (e.state === 'burn'){
      e.fireT -= dt; if (e.fireT <= 0){ e.fireT = 0.07; for (const sd of [-1, 1]) fireBullet(e, e.ang + sd * 0.22 + rand(-0.12, 0.12), rand(300, 380), 0.16, '#FF8A3A', 6); sfx('whoosh', 0.06); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.5 * fast; } return [ux * e.spdE * 0.55, uy * e.spdE * 0.55];
    }
    if (e.state === 'dronewind'){ if (e.stateT <= 0){ twSpawnNear(e, 'jackal', e.p2 ? 4 : 3, e.r + 40); sfx('whoosh', 0.1); e.state = 'idle'; e.stateT = 1.8 * fast; } return [0, 0]; }
    if (e.state === 'fanwind'){
      if (e.stateT <= 0){ twFan(e, e.p2 ? 9 : 7, 0.2, 430, 0.45, '#FFB84A', 6); if (e.p2) twRing(e, 10, 300, 0.25, '#FFD88A', 5, Math.random()); sfx('boom', 0.08); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.45; else { e.state = 'idle'; e.stateT = 1.5 * fast; } }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  ft_maker(e, dt, ux, uy, d){                                     /* The Maker: three phases (70%, 35%). It floats down the yard sweeping glimmer beams across it, lets mutants out of the plant, rings the ground with green fire, and in the last phase marks the whole yard with blasts; each phase is faster and adds more */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.2 * dt); e.stateT -= dt;
    const f = e.hp / e.maxHp, ph = f < 0.35 ? 3 : f < 0.7 ? 2 : 1;
    if (e.pat === undefined){ e.pat = 0; e.phase = 1; e.glow = 0; }
    if (ph > e.phase){ e.phase = ph; ftRoar(e, '#7AFFC8'); twSpawnNear(e, 'grub', ph === 2 ? 4 : 6, e.r + 60); }
    e.glow = clamp((e.glow || 0) + (e.phase > 1 ? dt : -dt), 0, 1);
    const fast = ph === 1 ? 1 : ph === 2 ? 0.8 : 0.62;
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.6; } return [0, 0]; }
    if (e.state === 'idle'){
      const dir = d > 360 ? 1 : d < 220 ? -0.5 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % (ph === 3 ? 4 : 3); e.state = p === 0 ? 'zapwind' : p === 1 ? 'spawnwind' : p === 2 ? 'ringwind' : 'overwind'; e.stateT = 0.8; e.shotsLeft = ph + 1; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'zapwind'){
      if (e.stateT <= 0){ const a = Math.atan2(P.y - e.y, P.x - e.x), n = ph === 1 ? 2 : ph === 2 ? 3 : 5; for (let k = 0; k < n; k++){ const aa = a + (k - (n - 1) / 2) * 0.45 + (k % 2 ? 0.1 : -0.1); addBeam(e.x, e.y, e.x + Math.cos(aa) * 1300, e.y + Math.sin(aa) * 1300, 30, 0.75, 0.3, e.dmg * 0.65, '#7AFFC8', { owner: e }); } sfx('boom', 0.1); e.state = 'zap'; e.stateT = 0.4; }
      return [0, 0];
    }
    if (e.state === 'zap'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 1.4 * fast; } return [0, 0]; }
    if (e.state === 'spawnwind'){
      if (e.stateT <= 0){ twSpawnNear(e, ph === 1 ? 'grub' : ph === 2 ? 'rhino' : 'ember', ph === 1 ? 4 : 2, e.r + 50); twSpawnNear(e, 'grub', 3, e.r + 80); addShock(e.x, e.y, 160, 0.4, 0, '#7AFFC8'); sfx('boom', 0.08); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    if (e.state === 'ringwind'){
      if (e.stateT <= 0){ twRing(e, ph === 1 ? 12 : 16, 300, 0.35, '#7AFFC8', 5, Math.random() * TAU); twFan(e, ph + 3, 0.2, 440, 0.4, '#9AF0C8', 5); sfx('boom', 0.1); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    if (e.state === 'overwind'){
      if (e.stateT <= 0){ const dm = e.dmg * 0.8; for (let k = 0; k < 7; k++){ const p = towerOpenNear(P.x + (k ? rand(-380, 380) : P.vx * 0.4), P.y + (k ? rand(-380, 380) : P.vy * 0.4)); ftBlast(p.x, p.y, 115, dm, 0.8 + k * 0.1, '#7AFFC8'); } sfx('whoosh', 0.12); e.state = 'idle'; e.stateT = 1.8 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  }
};
Object.assign(FORT_AI, FORT_AI_COMMON, FORT_BOSS_AI);
