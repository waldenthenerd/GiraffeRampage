'use strict';
/* Chapter 13.5 (internal chapter 14): the Domes. Ten waves, 326 to 335, with a boss on 330 and 335. */
/* ========================= CHAPTER 13.5: THE DOMES ========================= */
/* Out in the savannah's heat the humans have built a ring of huge domes, their windows wrapped in mylar so the sun bounces off them. Inside it is cold:
   they keep Chapter 2's frozen creatures there, changed by the same glimmer that is spreading over the grass. The creatures are Chapter 2's cast
   (ARCTIC_LOOKS) with Chapter 11's twists (GLIM_TWIST, via def.twist) and the glimmer on top (def.glim). The numbers are tuned by hand and are the ones
   to change if it is too hard or too easy: DOME_MUL is the Mars table's strength, domeScale then takes it from 1.33x to 2x of Chapter 13's last wave. */
const DOME_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.65, val: 16 }, boss: { hp: 21, dmg: 5.8, spd: 1.45, val: 12 } };
const DOME_TUNE = { hp0: 4 / 3, hp1: 2, dmg0: 1.6 * 2 / 3, dmg1: 2.2 * 2 / 3, count0: 90, countStep: 6 };
function domeScale(cw){
  const k = clamp((cw - 1) / (DOME_WAVES - 1), 0, 1), b = enemyScale(WAVES_PER_CHAPTER);                    /* Chapter 13's last wave, then more */
  return { hp: b.hp * (DOME_TUNE.hp0 + (DOME_TUNE.hp1 - DOME_TUNE.hp0) * k), dmg: b.dmg * (DOME_TUNE.dmg0 + (DOME_TUNE.dmg1 - DOME_TUNE.dmg0) * k), spd: b.spd };
}
const ETYPES_DOME = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], lk = ARCTIC_LOOKS[id]; if (base.big || !lk) return;
  ETYPES_DOME[id] = Object.assign({}, base, { hp: base.hp * DOME_MUL.common.hp, dmg: base.dmg * DOME_MUL.common.dmg, spd: base.spd * DOME_MUL.common.spd, val: Math.round(base.val * DOME_MUL.common.val),
    look: lk.look, color: lk.color, dark: lk.dark, pale: lk.pale || base.pale, blood: '#BEEFFF', frost: true, glim: true, twist: id, dome: true, splitInto: undefined, splitCount: undefined });
});
/* the two bosses are new creatures with their own art (DOME_DRAW, js/35i-art-domes.js) and behaviour (DOME_AI below) */
ETYPES_DOME.thawed = { hp: 3000, spd: 92, dmg: 30, r: 46, xp: 1800, kbRes: 0.04, ai: 'd14_thawed', color: '#9FD6EA', dark: '#2A5A72', pale: '#EAFBFF', blood: '#8FE0FF',
  big: true, title: 'The Thawed', val: 30 * DOME_MUL.boss.val / 10, look: 'dome_thawed', frost: true, dome: true, melts: true };
ETYPES_DOME.iceheart = { hp: 5500, spd: 80, dmg: 38, r: 58, xp: 3200, kbRes: 0.03, ai: 'd14_iceheart', color: '#BFE4F2', dark: '#1F4A66', pale: '#E6FFFF', blood: '#6FD8FF',
  big: true, title: 'The Ice Heart', val: 38 * DOME_MUL.boss.val / 10, look: 'dome_iceheart', frost: true, dome: true };
Object.keys(ETYPES_DOME).forEach(id => { const t = ETYPES_DOME[id]; if (t.big){ t.hp *= DOME_MUL.boss.hp; t.dmg *= DOME_MUL.boss.dmg; t.spd *= DOME_MUL.boss.spd; } });

/* the Bestiary's total now that every table exists: each chapter's own creatures, bosses included */
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1); return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);

const WAVE_FLAVOUR_DOME = [
  'A cold breath on hot glass', 'Frost where there should be none', 'The mylar hums', 'Something glitters in the pipes', '',
  'The vents are open', 'Cold fog on the floor', 'The roots are glowing', 'It knows you are here', ''
];
const BOSS_INTRO_DOME = { thawed: 'Something half-melted slumps out of the vents', iceheart: 'The glowing root cracks open, and something cold wakes inside it' };

/* a dome wave: Chapter 2's cast in Chapter 1's order, but quicker, because there are only ten waves of it */
function buildDomeWave(w, isBoss){
  const cw = chapterWaveOf(w), q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); }, g = cw * 0.12;
  let budget = DOME_TUNE.count0 + DOME_TUNE.countStep * (cw - 1);
  if (isBoss) budget = Math.round(budget * 0.55);
  if (cw <= 2) budget = Math.round(budget * 0.7);                                                           /* a few seconds to pick up a card or two first */
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));
  add('hyena', 8); add('cheetah', cw >= 2 ? 4.4 + g : 0); add('termite', cw >= 2 ? 3.2 + g * 0.6 : 0); add('rhino', cw >= 3 ? 3.6 + g : 0);
  add('vulture', cw >= 3 ? 3.6 + g : 0); add('jackal', cw >= 3 ? 3.4 + g : 0); add('warthog', cw >= 4 ? 2.8 + g * 0.6 : 0); add('baboon', cw >= 5 ? 2.8 + g * 0.6 : 0);
  add('honeybadger', cw >= 6 ? 2.6 + g * 0.6 : 0); add('mamba', cw >= 7 ? 2.8 + g * 0.5 : 0); add('ember', cw >= 4 ? 2.4 : 0);
  let total = 0; for (let i = 0; i < pool.length; i++) total += pool[i].w;
  const gap = Math.max(0.1, (0.52 - w * 0.015) * 0.75);                                                       /* the same pace as the late chapters */
  let t = 0.3;
  for (let i = 0; i < budget; i++){
    let r = Math.random() * total, type = pool[0].t;
    for (let k = 0; k < pool.length; k++){ r -= pool[k].w; if (r <= 0){ type = pool[k].t; break; } }
    q.push({ type: type, t: t });
    t += gap * rand(0.55, 1.5);
    if (Math.random() < 0.16) t += rand(0.3, 0.9);
  }
  if (isBoss) q.push({ type: cw >= DOME_WAVES ? 'iceheart' : 'thawed', t: 1.4, boss: true });
  q.sort((a, b) => a.t - b.t);
  return q;
}

/* ---- the bosses' behaviour: each is called like a Marine behaviour, with e.spdE as its speed, and returns the way it moves ---- */
const DOME_AI = {
  d14_thawed(e, dt, ux, uy, d){                                  /* half melted: it drips, throws shards, slumps into a puddle and rises with a splash, and brings the roof down on her */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); e.stateT -= dt;
    if (e.puddleT === undefined){ e.puddleT = 0.4; e.pat = 0; e.p2 = false; e.strafe = Math.random() < 0.5 ? 1 : -1; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'meltdown'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#9FE8FF', 0.2, 0.3); }
    e.puddleT -= dt;
    if (e.state !== 'slide' && e.puddleT <= 0){ e.puddleT = 0.5; hostileZone(e.x, e.y, 34, 3.4, e.dmg * 0.12, '#7FD8F0'); }                 /* cold meltwater where it has been */
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 260 ? 1 : d < 150 ? -0.6 : 0.15;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'shardwind' : p === 1 ? 'slumpwind' : 'roofwind'; e.stateT = p === 1 ? 0.55 : 0.65; e.shotsLeft = e.p2 ? 3 : 2; }
      return [ux * e.spdE * dir - uy * e.spdE * 0.4 * e.strafe, uy * e.spdE * dir + ux * e.spdE * 0.4 * e.strafe];
    }
    if (e.state === 'shardwind'){                                      /* it draws itself up: a fan of ice is coming */
      if (e.stateT <= 0){
        const a0 = leadAim(e, 460), n = e.p2 ? 7 : 5;
        for (let k = 0; k < n; k++) fireBullet(e, a0 + (k - (n - 1) / 2) * 0.17, 460, 0.45, '#BFEFFF', 5);
        sfx('spit', 0.1); e.shotsLeft--;
        if (e.shotsLeft > 0) e.stateT = 0.5; else { e.state = 'idle'; e.stateT = 1.5 * fast; e.strafe *= -1; }
      }
      return [0, 0];
    }
    if (e.state === 'slumpwind'){                                      /* it sags toward the floor */
      if (e.stateT <= 0){ e.state = 'slide'; e.stateT = 1.25; e.slideA = Math.atan2(uy, ux); sfx('whoosh', 0.15); }
      return [0, 0];
    }
    if (e.state === 'slide'){                                          /* a low, fast slide that leaves a trail of water */
      if (e.slideA === undefined) e.slideA = Math.atan2(uy, ux);
      e.slideA = turnTo(e.slideA, Math.atan2(uy, ux), 1.4 * dt);
      if (Math.random() < dt * 5) hostileZone(e.x, e.y, 38, 2.6, e.dmg * 0.16, '#7FD8F0');
      if (Math.random() < dt * 40) addParticle(e.x, e.y, rand(-40, 40), rand(-40, 40), rand(3, 6), 0.5, '#BEEFFF', { drag: 2 });
      if (e.stateT <= 0){
        const x = e.x, y = e.y, dm = e.dmg * 0.85; e.state = 'idle'; e.stateT = 1.4 * fast;
        addMarker(x, y, 140, 0.4, '#8FE8FF', function(){ hostileBlast(x, y, 140, dm, '#BFEFFF', { kb: 120, shake: 9 }); });                        /* it rises with a splash */
      }
      return [Math.cos(e.slideA) * e.spdE * 2.7, Math.sin(e.slideA) * e.spdE * 2.7];
    }
    if (e.state === 'roofwind'){                                       /* meltwater and ice come down on her: marks on the floor first */
      if (e.stateT <= 0){
        const n = e.p2 ? 7 : 5, dm = e.dmg * 0.7;
        for (let k = 0; k < n; k++){
          const x = clamp(P.x + (k ? rand(-230, 230) : 0), 60, ARENA_W - 60), y = clamp(P.y + (k ? rand(-230, 230) : 0), 60, ARENA_H - 60);
          addMarker(x, y, 95, 0.75 + k * 0.1, '#8FE8FF', function(){ hostileBlast(x, y, 95, dm, '#CFF4FF', { shake: 6 }); hostileZone(x, y, 60, 3, e.dmg * 0.1, '#7FD8F0'); });
        }
        e.state = 'idle'; e.stateT = 1.6 * fast;
      }
      return [0, 0];
    }
    if (e.state === 'meltdown'){                                       /* halfway: it comes apart in a ring of cold water, and the pieces get up as grubs */
      if (e.stateT <= 0){
        const x = e.x, y = e.y, dm = e.dmg;
        hostileBlast(x, y, 260, dm, '#BFEFFF', { kb: 200, shake: 14 }); addShock(x, y, 300, 0.6, 0, '#8FE8FF');
        if (G.enemies.length < 200) for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.4; spawnEnemy('grub', x + Math.cos(a) * 90, y + Math.sin(a) * 90, e.waveRef); }
        e.state = 'idle'; e.stateT = 1;
      }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  d14_iceheart(e, dt, ux, uy, d){                                 /* a slow giant round a glowing heart of cold: novas, volleys, beams and spikes, faster as the heart is hurt */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.2 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.phase = 1; e.glow = 0; }
    const f = e.hp / e.maxHp, ph = f < 0.25 ? 3 : f < 0.55 ? 2 : 1;
    if (ph !== e.phase){ e.phase = ph; e.state = 'roar'; e.stateT = 1.1; sfx('boom', 0.25); addShake(14); screenFlash('#BFF4FF', 0.25, 0.35); }
    e.glow = e.state === 'idle' ? Math.max(0, e.glow - dt * 2) : Math.min(1, e.glow + dt * 3);
    const rate = ph === 3 ? 0.6 : ph === 2 ? 0.8 : 1;
    if (e.state === 'idle'){
      const dir = d > 330 ? 1 : d < 220 ? -0.7 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 4; e.state = ['novawind', 'volleywind', 'beamwind', 'spikewind'][p]; e.stateT = p === 0 ? 1 : 0.7; e.shotsLeft = ph === 3 ? 4 : 3; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.8; } return [0, 0]; }
    if (e.state === 'novawind'){                                      /* the heart swells, then a ring of cold goes out and a ring of shards after it */
      if (e.novaMk === undefined){ e.novaMk = true; const x = e.x, y = e.y; addMarker(x, y, 300, 1, '#9FE8FF', null, { owner: e }); }
      if (e.stateT <= 0){
        e.novaMk = undefined; const x = e.x, y = e.y, dm = e.dmg * 0.8;
        hostileBlast(x, y, 300, dm, '#CFF8FF', { kb: 160, shake: 14 }); addShock(x, y, 320, 0.7, 0, '#8FE8FF');
        const n = ph === 1 ? 12 : 16; for (let k = 0; k < n; k++) fireBullet(e, k * TAU / n + (e.pat % 2) * 0.2, 330, 0.4, '#BFEFFF', 5);
        e.state = 'idle'; e.stateT = 1.6 * rate;
      }
      return [0, 0];
    }
    if (e.state === 'volleywind'){                                    /* aimed bursts of three */
      if (e.stateT <= 0){
        const a0 = leadAim(e, 520); for (let k = -1; k <= 1; k++) fireBullet(e, a0 + k * 0.12, 520, 0.45, '#BFEFFF', 6);
        sfx('spit', 0.1); e.shotsLeft--;
        if (e.shotsLeft > 0) e.stateT = 0.36; else { e.state = 'idle'; e.stateT = 1.4 * rate; }
      }
      return [ux * e.spdE * 0.2, uy * e.spdE * 0.2];
    }
    if (e.state === 'beamwind'){                                      /* two beams of cold from the heart, one on her and one beside her, crossing as they go */
      if (e.stateT <= 0){
        const a = Math.atan2(P.y - e.y, P.x - e.x), n = ph === 3 ? 3 : 2;
        for (let k = 0; k < n; k++){ const aa = a + (k - (n - 1) / 2) * 0.55; addBeam(e.x, e.y, e.x + Math.cos(aa) * 1400, e.y + Math.sin(aa) * 1400, 38, 0.85, 0.35, e.dmg * 0.7, '#9FE8FF'); }
        sfx('whoosh', 0.2); e.state = 'idle'; e.stateT = 1.8 * rate;
      }
      return [0, 0];
    }
    if (e.state === 'spikewind'){                                     /* spikes of ice thrust up where she is, then where she was going */
      if (e.stateT <= 0){
        const n = ph === 1 ? 6 : ph === 2 ? 8 : 10, dm = e.dmg * 0.65;
        for (let k = 0; k < n; k++){
          const x = clamp(P.x + P.vx * 0.5 * (k % 3) + rand(-170, 170), 60, ARENA_W - 60), y = clamp(P.y + P.vy * 0.5 * (k % 3) + rand(-170, 170), 60, ARENA_H - 60);
          addMarker(x, y, 85, 0.7 + k * 0.08, '#9FE8FF', function(){ hostileBlast(x, y, 85, dm, '#E6FFFF', { column: true, shake: 5 }); });
        }
        e.state = 'idle'; e.stateT = 1.5 * rate;
      }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  }
};
