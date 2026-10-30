'use strict';
/* Enemy update and movement. */
/* ========================= 19. ENEMY UPDATE ========================= */
function updateEnemies(dt){
  if (G.tower) towerFlow();                                    /* the Tower: how far every spot is from her, round the walls */
  const list = G.enemies, kdrag = Math.pow(0.0018, dt);        /* how much a shove has faded over this frame: the same for every creature */
  for (let i = list.length - 1; i >= 0; i--){
    const e = list[i];
    if (e.dead){
      if (e === G.boss){ G.bossAlive = false; G.boss = null; }
      list.splice(i, 1);
      continue;
    }
    if (typeof Mix !== 'undefined') Mix.src = e;                  /* sounds made from here on come from this enemy (02c-audio-mix.js) */
    if (e.flash > 0) e.flash -= dt;
    if (e.stunT > 0) e.stunT -= dt;
    if (e.buffT > 0) e.buffT -= dt;
    if (e.slowT > 0){ e.slowT -= dt; if (e.slowT <= 0) e.slowMul = 1; }
    if (e.burnT > 0){
      e.burnT -= dt;
      e.burnAcc += e.burnDps * dt;
      if (e.burnAcc >= 1){
        const d = Math.floor(e.burnAcc); e.burnAcc -= d;
        dmgSrc = 'burn'; damageEnemy(e, d, { noCrit: true, quiet: true, silent: Math.random() > 0.2, color: e.burnColor || '#FF9C4A' });
        if (e.dead) continue;
        if (Math.random() < 0.4) addParticle(e.x + rand(-6, 6), e.y - 4, rand(-14, 14), -rand(20, 46), rand(1.5, 3), 0.4, '#FF9C4A', { glow:true, drag:1 });
      }
      if (e.burnT <= 0){ e.burnDps = 0; e.burnColor = null; }
    }

    e.anim += dt * 6;
    /* head for the player, or for a nearer ant that has drawn its attention */
    /* who it heads for is looked up a few times a second, not every frame (staggered between creatures by a little jitter) */
    let antT;
    if (e.aggT > 0){ e.aggT -= dt; antT = e.aggTgt; if (antT && antT.dead) antT = null; }
    else { antT = e.aggTgt = antAggroTarget(e); e.aggT = 0.1 + Math.random() * 0.08; }
    const tgx = antT ? antT.x : P.x, tgy = antT ? antT.y : P.y;
    const dx = tgx - e.x, dy = tgy - e.y;
    const d = hyp(dx, dy) || 1;
    let ux = dx / d, uy = dy / d;
    if (G.tower && !e.def.flyOver){ const sv = towerSteer(e, tgx, tgy, dt); if (sv){ ux = sv[0]; uy = sv[1]; } }       /* a wall in the way: head for the next doorway instead */
    const spd = e.spd * e.slowMul * (1 + 0.55 * (G.hunt || 0)) * (e.buffT > 0 ? 1.35 : 1);
    let mvx = 0, mvy = 0;
    /* A creature that is still far away (beyond every attack or aggro range in the game, 700) and has nothing in mind but coming closer
       only needs to walk toward her: no behavior state machine, no crowding. It is the same movement the full version would give it. */
    const far = !G.attract && d > FAR_CHEAP_D && !e.big && e.state === 'idle' && e.stunT <= 0 && CHEAP_AI[e.ai] === 1 && !e.def.turret;
    if (far){ mvx = ux * spd; mvy = uy * spd; e.ang = Math.atan2(uy, ux); if (e.stateT !== undefined) e.stateT -= dt; }

    if (!far && e.stunT <= 0){
      switch (e.ai){
        case 'chase':
          mvx = ux * spd; mvy = uy * spd;
          e.ang = Math.atan2(uy, ux);
          break;

        case 'dash':
          e.stateT -= dt;
          if (e.state === 'idle'){
            mvx = ux * spd; mvy = uy * spd;
            e.ang = Math.atan2(uy, ux);
            if (d < 330 && e.stateT <= 0){ e.state = 'wind'; e.stateT = e.def.windUp || 0.52; }
          } else if (e.state === 'wind'){
            mvx = -ux * spd * 0.35; mvy = -uy * spd * 0.35;
            e.ang = Math.atan2(uy, ux);
            if (e.stateT <= 0){
              e.state = 'dash'; e.stateT = e.def.dashT || 0.4;
              const ds = e.def.dashSpd || 700;
              e.dashVX = ux * ds; e.dashVY = uy * ds;
              sfx('whoosh', 0.18);
            }
          } else if (e.state === 'dash'){
            mvx = e.dashVX; mvy = e.dashVY;
            if (Math.random() < dt * 40) addParticle(e.x, e.y, rand(-30, 30), rand(-30, 30), rand(2, 4), 0.28, '#D6A751', { drag:2 });
            if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.0, 1.7); }
          }
          break;

        case 'flank': {
          if (e.flankDir === undefined) e.flankDir = Math.random() < 0.5 ? 1 : -1;
          const desired = 210;
          const closeSpeed = d > desired ? spd : d < desired * 0.55 ? -spd * 0.4 : 0;
          const tx = -uy * e.flankDir, ty = ux * e.flankDir;
          mvx = ux * closeSpeed * 0.5 + tx * spd * 0.95;
          mvy = uy * closeSpeed * 0.5 + ty * spd * 0.95;
          const mvlen = hyp(mvx, mvy);
          if (mvlen > 4) e.ang = Math.atan2(mvy, mvx);
          break;
        }

        case 'charge':
          e.stateT -= dt;
          if (e.state === 'idle'){
            mvx = ux * spd; mvy = uy * spd;
            e.ang = Math.atan2(uy, ux);
            if (d < 480 && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.85; }
          } else if (e.state === 'wind'){
            e.ang = Math.atan2(uy, ux);
            if (e.stateT <= 0){
              e.state = 'dash'; e.stateT = 1.0;
              e.dashVX = ux * 540; e.dashVY = uy * 540;
              sfx('boom', 0.2);
            }
          } else {
            mvx = e.dashVX; mvy = e.dashVY;
            if (Math.random() < dt * 30) addParticle(e.x, e.y, rand(-40, 40), rand(-40, 40), rand(3, 6), 0.35, '#9A9694', { drag:2 });
            if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.4); }
          }
          break;

        case 'ranged': {
          const want = 300;
          const drift = d > want + 60 ? 1 : d < want - 60 ? -1 : 0;
          mvx = ux * spd * drift; mvy = uy * spd * drift;
          mvx += -uy * spd * 0.45; mvy += ux * spd * 0.45;
          e.ang = Math.atan2(uy, ux);
          e.stateT -= dt;
          if (e.stateT <= 0 && d < 520){
            e.stateT = rand(1.8, 2.6);
            const a = Math.atan2(dy, dx);
            addEProj(e.x + Math.cos(a) * 16, e.y + Math.sin(a) * 16, Math.cos(a) * 300, Math.sin(a) * 300, 7, e.dmg * 0.7, '#B9A0D6');
            sfx('spit', 0.1);
          }
          break;
        }

        case 'skirmish': {
          if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
          const want = 260;
          const drift = d > want + 80 ? 1 : d < want - 80 ? -1 : 0;
          const jag = Math.sin(e.anim * 3 + e.jSeed);
          mvx = ux * spd * drift * 0.55 + (-uy) * spd * 0.75 * jag;
          mvy = uy * spd * drift * 0.55 + (ux) * spd * 0.75 * jag;
          e.ang = Math.atan2(uy, ux);
          e.stateT -= dt;
          if (e.stateT <= 0 && d < 560){
            e.stateT = rand(1.5, 2.3);
            const a = Math.atan2(dy, dx);
            addEProj(e.x + Math.cos(a) * 16, e.y + Math.sin(a) * 16, Math.cos(a) * 270, Math.sin(a) * 270, 7, e.dmg * 0.85, '#C9A46C');
            sfx('spit', 0.1);
          }
          break;
        }

        case 'boss': {
          e.stateT -= dt;
          e.ang = Math.atan2(uy, ux);
          if (e.state === 'idle'){
            mvx = ux * spd; mvy = uy * spd;
            if (e.stateT <= 0){ e.state = Math.random() < 0.5 ? 'roar' : 'wind'; e.stateT = e.state === 'roar' ? 1.1 : 0.75; }
          } else if (e.state === 'roar'){
            if (e.stateT <= 0){
              e.state = 'idle'; e.stateT = rand(2.6, 4.0);
              addShock(e.x, e.y, 300, 0.55, e.dmg * 0.8, '#E8604A', { width: 20, kb: 520 });
              for (let k = 0; k < 4; k++){
                const a = Math.random() * TAU;
                spawnEnemy('hyena', e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80, e.waveRef);
              }
              SFX.boss(); addShake(14); screenFlash('#CF4433', 0.2, 0.3);
            }
          } else if (e.state === 'wind'){
            if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 1.1; e.dashVX = ux * 640; e.dashVY = uy * 640; sfx('boom', 0.2); }
          } else {
            mvx = e.dashVX; mvy = e.dashVY;
            if (Math.random() < dt * 40) addParticle(e.x, e.y, rand(-60, 60), rand(-60, 60), rand(4, 8), 0.4, '#D9A250', { drag:2 });
            if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.2, 3.4); }
          }
          break;
        }

        case 'boss2': {
          e.stateT -= dt;
          e.ang = Math.atan2(uy, ux);
          if (e.state === 'idle'){
            mvx = ux * spd; mvy = uy * spd;
            if (e.stateT <= 0){ e.state = 'stomp'; e.stateT = 0.9; }
          } else if (e.state === 'stomp'){
            if (e.stateT <= 0){
              e.state = 'idle'; e.stateT = rand(2.0, 3.2);
              for (let k = 0; k < 3; k++)
                setTimeoutish(inst => addShock(e.x, e.y, 200 + k * 130, 0.6, e.dmg * 0.55, '#C7D8E8', { width: 18, kb: 460 }), k * 0.18);
              for (let k = 0; k < 3; k++){
                const a = Math.random() * TAU;
                spawnEnemy(Math.random() < 0.5 ? 'rhino' : 'termite', e.x + Math.cos(a) * 110, e.y + Math.sin(a) * 110, e.waveRef);
              }
              SFX.boss(); addShake(18); screenFlash('#C7D8E8', 0.22, 0.34);
            }
          }
          break;
        }

        case 'boss4': {
          /* The Widowmaker: barely pauses between gores, chains charges back to back */
          e.stateT -= dt;
          e.ang = Math.atan2(uy, ux);
          if (e.state === 'idle'){
            mvx = ux * spd; mvy = uy * spd;
            if (e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.6; }
          } else if (e.state === 'wind'){
            mvx = -ux * spd * 0.3; mvy = -uy * spd * 0.3;
            if (e.stateT <= 0){
              e.state = 'dash'; e.stateT = 0.85; e.chainsLeft = 2;
              e.dashVX = ux * 620; e.dashVY = uy * 620;
              sfx('boom', 0.2);
            }
          } else {
            mvx = e.dashVX; mvy = e.dashVY;
            if (Math.random() < dt * 46) addParticle(e.x, e.y, rand(-60, 60), rand(-60, 60), rand(4, 8), 0.4, '#5A4030', { drag:2 });
            if (e.stateT <= 0){
              if (e.chainsLeft > 0){
                e.chainsLeft--;
                e.stateT = 0.85;
                const na = Math.atan2(P.y - e.y, P.x - e.x);
                e.dashVX = Math.cos(na) * 620; e.dashVY = Math.sin(na) * 620;
                addShake(6);
              } else { e.state = 'idle'; e.stateT = rand(1.6, 2.4); }
            }
          }
          break;
        }

        case 'boss5': {
          /* Old Nile: waits nearly still, then a sudden long-range lunge and a
             death-roll shock that drags the ground with it */
          e.stateT -= dt;
          e.ang = Math.atan2(uy, ux);
          if (e.state === 'idle'){
            mvx = ux * spd * 0.35; mvy = uy * spd * 0.35;
            if (d < 420 && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.95; }
          } else if (e.state === 'wind'){
            if (e.stateT <= 0){
              e.state = 'lunge'; e.stateT = 0.42;
              e.dashVX = ux * 920; e.dashVY = uy * 920;
              sfx('whoosh', 0.2); addShake(4);
            }
          } else if (e.state === 'lunge'){
            mvx = e.dashVX; mvy = e.dashVY;
            if (e.stateT <= 0){
              e.state = 'roll'; e.stateT = 0.5;
              addShock(e.x, e.y, 220, 0.5, e.dmg * 0.85, '#4E6B3E', { width: 20, kb: 480, stun: 0.4 });
              SFX.boss(); addShake(12); screenFlash('#4E6B3E', 0.16, 0.24);
            }
          } else {
            if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.4, 3.6); }
          }
          break;
        }

        case 'boss3': {
          /* Wildfire: leaves the ground burning as it moves, periodically
             erupts and scatters embers. Permafrost, The Miasma and The
             Maelstrom (its frost, swamp and ocean counterparts) play the
             identical pattern recoloured -- ice-blue for frost, murky toxic
             green for swamp, bioluminescent teal for the open ocean. */
          const zoneColor = e.def.inferno ? '#FF5A1E' : e.def.space ? '#54E0FF' : e.def.city ? '#FF8A3A' : e.def.jungle ? '#B8D83A' : e.def.ocean ? '#2ED6C8' : e.def.swamp ? '#7A9A3E' : e.def.frost ? '#7EC8E8' : '#FF7A3C';
          const shockColor = e.def.inferno ? '#FFB040' : e.def.space ? '#7FE8FF' : e.def.city ? '#FFB84A' : e.def.jungle ? '#9AC82A' : e.def.ocean ? '#3EE8DC' : e.def.swamp ? '#5C7A2E' : e.def.frost ? '#5FB0E0' : '#FF5A2C';
          e.stateT -= dt;
          e.ang = Math.atan2(uy, ux);
          mvx = ux * spd; mvy = uy * spd;
          if (Math.random() < dt * 7)
            addZone(e.x + rand(-14, 14), e.y + rand(-14, 14), 46, 2.6, e.dmg * 0.3, zoneColor, { grow: true });
          if (e.stateT <= 0){
            e.stateT = rand(3.4, 4.8);
            addShock(e.x, e.y, 320, 0.6, e.dmg * 0.9, shockColor, { width: 24, kb: 480, burn: e.dmg * 0.3 });
            for (let k = 0; k < 3; k++){
              const a = Math.random() * TAU;
              spawnEnemy('ember', e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90, e.waveRef);
            }
            SFX.boss(); addShake(16); screenFlash(shockColor, 0.24, 0.32);
          }
          break;
        }

        default: {                                                /* the Space Marines' behaviors live in MARINE_AI */
          const f = MARINE_AI[e.ai] || DUST_AI[e.ai] || DOME_AI[e.ai] || TOWER_AI[e.ai] || SIEGE_AI[e.ai] || FORT_AI[e.ai];
          if (f){ e.spdE = spd; const r = f(e, dt, ux, uy, d, dx, dy); mvx = r[0]; mvy = r[1]; }
        }
      }
    }

    if (!far && e.def.twist && e.stunT <= 0 && !e.dead){ const tw = glimTwist(e, dt, ux, uy, d, mvx, mvy, spd); if (tw){ mvx = tw[0]; mvy = tw[1]; } }     /* Chapter 11's twists */

    /* separation so bodies do not stack into a single pixel */
    /* It is a soft push, so it is worked out every few frames and reused in between (staggered between creatures), less often still off screen. */
    const offs = !G.attract && offscreenBoost(e);
    if (!far){
      let sx = 0, sy = 0;
      if (e.sepT > 0 && e.sepX !== undefined){ e.sepT -= dt; sx = e.sepX; sy = e.sepY; }
      else {
        const near = enemiesNear(e.x, e.y, e.r + 34, _q);
        for (let k = 0; k < near.length; k++){
          const o = near[k];
          if (o === e || o.dead) continue;
          const ox = e.x - o.x, oy = e.y - o.y;
          const od = hyp(ox, oy);
          const want = e.r + o.r;
          if (od > 0.01 && od < want){
            const push = (want - od) / want;
            sx += (ox / od) * push; sy += (oy / od) * push;
          }
        }
        e.sepX = sx; e.sepY = sy; e.sepT = (offs ? 0.12 : 0.035) + Math.random() * 0.03;
      }
      mvx += sx * 230; mvy += sy * 230;
    }
    if (offs){ const bm = OFFSCREEN_BOOST[G.runSpeedLevel | 0] || 1.3; mvx *= bm; mvy *= bm; }      /* far from the screen, enemies hurry in: 1.3x, or 1.8x in speed mode, 2.3x in hyperspeed, 4x in ultrafast */

    e.kx *= kdrag;
    e.ky *= kdrag;
    e.x += (mvx + e.kx) * dt;
    e.y += (mvy + e.ky) * dt;
    e.x = clamp(e.x, 12, ARENA_W - 12);
    e.y = clamp(e.y, 12, ARENA_H - 12);
    if (G.buildings && G.buildings.length && ((G.tower && !e.def.flyOver) || !CITY_FLYERS[e.def.look])){
      const hb = resolveBuildings(e, e.r * 0.85);
      if (hb){
        if (CITY_CRUSHERS[e.def.look] && e.state === 'dash') damageBuilding(hb, hb.maxHp * 0.5 * dt, 'crush');   /* a charging tank plows straight through */
        /* slide round the corner instead of pressing into the wall */
        let tx = -uy, ty = ux;
        if (tx * (e.x - (hb.x + hb.w / 2)) + ty * (e.y - (hb.y + hb.h / 2)) < 0){ tx = -tx; ty = -ty; }
        e.x += tx * e.spd * dt * 0.7; e.y += ty * e.spd * dt * 0.7;
      }
    }
    e.vx = mvx; e.vy = mvy;

    /* contact damage */
    if (e.atkCd > 0) e.atkCd -= dt;
    const cd2 = (e.r + P.r) * (e.r + P.r);
    const pdx = P.x - e.x, pdy = P.y - e.y;
    if (pdx * pdx + pdy * pdy < cd2 && e.atkCd <= 0 && P.invuln <= 0 && !e.untarg && !e.def.turret){
      e.atkCd = 0.75;
      hurtPlayer(e.dmg * (e.state === 'dash' ? 1.25 : 1), e.x, e.y);
      const a = Math.atan2(pdy, pdx);
      e.kx -= Math.cos(a) * 200 * e.kbRes; e.ky -= Math.sin(a) * 200 * e.kbRes;
    }
  }
  if (typeof Mix !== 'undefined') Mix.src = null;
}

const OFFSCREEN_BOOST = [1.3, 1.8, 2.3, 4];
const FAR_CHEAP_D = 780;                                                  /* the longest trigger distance in the creatures' behaviors is 700 */
const CHEAP_AI = { chase: 1, dash: 1, charge: 1, ranged: 1, skirmish: 1 };         /* behaviors whose only job when far away is to walk closer */
function offscreenBoost(e){
  const hw = G.W / G.zoom / 2 + 90, hh = G.H / G.zoom / 2 + 90;
  return Math.abs(e.x - G.camX) > hw || Math.abs(e.y - G.camY) > hh;
}
/* tiny deferred-call helper used by the boss stomp pattern */
const _timers = [];
function setTimeoutish(fn, delay){ _timers.push({ fn: fn, t: delay }); }
function updateTimers(dt){
  for (let i = _timers.length - 1; i >= 0; i--){
    _timers[i].t -= dt;
    if (_timers[i].t <= 0){ const f = _timers[i].fn; _timers.splice(i, 1); f(); }
  }
}
