'use strict';
/* Chapter 16, Fort Shortneck: chaos, the alarm, explosions, hackable turrets and searchlights (the fort is in js/fort/44zzzk-fort-map.js). */
/* ========================= MAKING A MESS ========================= */
/* CHAOS is the score of this chapter. Every building, vehicle, tank, generator, light and gun emplacement that falls pays its chaos value (FT_KINDS), times a COMBO: each thing wrecked within
   five seconds of the last makes the next worth ten percent more (up to three times). The run's chaos climbs through eight LEVELS (FT_TIERS, each with its own colour); reaching one for
   the first time ever pays its BADGE, a gift of gems (about a hundred from Mayhem up), kept in Save.data.fortBadges. At the end of every wave a twelfth of the wave's chaos is paid as gold.
   The ALARM rises with the mess (a bit for a hut, more for a bunker or an explosion), sinks when she lies low, and at 35, 70 and 100 sends a squad of reinforcements; while it is at 100 chaos
   is worth half as much again. EXPLOSIVES (fuel tanks, ammo, the armoury, generators, helicopters, vehicles and the glimmer plant) blow up a moment after they fall and wreck what is
   next to them and the creatures in the way, which can set the next one off: a chain. They never hurt her. The GUN EMPLACEMENTS shoot at her until she stands beside one for a second and
   a half: it is HACKED, fires on the creatures for half a minute, and then burns out until the next wave. The SEARCHLIGHTS sweep the yard, and a beam that holds on her sets off the alarm
   and a squad; each runs from a generator, and a light or a generator that falls leaves the dark behind it. After every boss the fort is rebuilt, and its vehicles, tanks and guns come back
   every wave, so there is always more to break. */
const FT_TIERS = [
  { n: 'Scuffle',   at: 1000,  c: '#8FD6F2', gems: 0 },
  { n: 'Ruckus',    at: 3000,  c: '#6AE08A', gems: 0 },
  { n: 'Mayhem',    at: 7000,  c: '#F2E04A', gems: 60 },
  { n: 'Uproar',    at: 13000, c: '#F2A83A', gems: 80 },
  { n: 'Rampage',   at: 20000, c: '#EE5A3A', gems: 100 },
  { n: 'Havoc',     at: 30000, c: '#E04ABE', gems: 100 },
  { n: 'Cataclysm', at: 45000, c: '#9A6AF2', gems: 120 },
  { n: 'Calamity',  at: 70000, c: '#FFD24A', gems: 150 }
];
const FT_COMBO = { window: 5, step: 0.1, cap: 20 };
const FT_ALARM = { a: 35, b: 70, full: 100, decay: 3, quiet: 4, cap: { a: 2, b: 2, c: 3 } };
const FT_LIGHT = { range: 540, half: 0.19, spot: 0.6, cool: 9, speed: 0.55 };
const FT_HACK = { reach: 95, time: 1.6, ally: 30, fire: 0.22, range: 700 };
WARD.push({ name: 'Fort Camo', c: '#6A7048' }); WARD.push({ name: 'Calamity Gold', c: '#E8B83A' });          /* 51 and 52: Chapter 16's colors (wardUnlocked in js/ui/44e-wardrobe.js) */
BUILDING_DMG_TAKEN.blast = 1;                       /* an explosion's damage to a neighbouring building is not trimmed the way a blast from a card is */
function ftTierOf(c){ let t = -1; for (let i = 0; i < FT_TIERS.length; i++) if (c >= FT_TIERS[i].at) t = i; return t; }
function ftTierColor(){ const ft = G.ft; return ft && ft.tier >= 0 ? FT_TIERS[ft.tier].c : '#FFE49A'; }
function fortChaosInit(){
  G.ft = { chaos: G.ftChaosRestore | 0, waveChaos: 0, combo: 0, comboT: 0, alarm: 0, lvl: 0, quiet: 0, fullT: 0, squads: { a: 0, b: 0, c: 0 }, tracers: [], wrecked: 0, tip: false, smokeT: 0, arrowT: 0 };
  G.ftChaosRestore = 0; G.ft.tier = ftTierOf(G.ft.chaos);
  FT.fuse.length = 0; FT.all.forEach(function(b){ b.tState = 'hostile'; b.allyT = 0; b.hack = 0; b.cd = 1 + Math.random() * 2; b.cd2 = 0; b.burst = 0; b.bt = 0; b.muzzle = 0; b.ang = b.ang || 0; if (b.kind === 'light'){ b.ph = b.idx * 1.7; b.spotT = 0; b.cool = 0; } });
}

/* ---- chaos ---- */
function fortChaos(n, x, y, why){
  const ft = G.ft; if (!ft || G.attract) return 0;
  const full = ft.alarm >= FT_ALARM.full, m = (1 + Math.min(ft.combo, FT_COMBO.cap) * FT_COMBO.step) * (full ? 1.5 : 1), pts = Math.round(n * m);
  ft.chaos += pts; ft.waveChaos += pts; G.score += pts; ft.combo++; ft.comboT = FT_COMBO.window;
  addText(x, y, '+' + fmt(pts) + (why ? ' ' + why : ''), ftTierColor(), pts >= 500 ? 20 : 16, pts >= 300);
  fortTierCheck();
  return pts;
}
function fortTierCheck(){
  const ft = G.ft;
  while (ft.tier + 1 < FT_TIERS.length && ft.chaos >= FT_TIERS[ft.tier + 1].at){ ft.tier++; fortTierUp(ft.tier); }
  const d = Save.data; if (d && ft.chaos > (d.fortChaosBest | 0)) d.fortChaosBest = Math.min(99999999, ft.chaos | 0);
}
function fortTierUp(i){
  const T = FT_TIERS[i], d = Save.data, first = d && !((d.fortBadges | 0) & (1 << i)); let sub = 'Chaos ' + fmt(T.at);
  if (d && first){ d.fortBadges = (d.fortBadges | 0) | (1 << i); if (T.gems > 0){ d.gems = (d.gems | 0) + T.gems; sub += '  ·  Badge earned: +' + T.gems + ' gems'; } Save.write(); }
  banner(T.n.toUpperCase() + '!', sub, T.c, 3); SFX.level(); screenFlash(T.c, 0.2, 0.4);
  burstParticles(P.x, P.y, 24, T.c, 260, 5, { glow: true }); addShock(P.x, P.y, 220, 0.5, 0, T.c);
}

/* ---- the alarm and the squads ---- */
function fortAlarm(n){
  const ft = G.ft; if (!ft || G.attract) return;
  ft.alarm = Math.min(FT_ALARM.full, ft.alarm + n); ft.quiet = FT_ALARM.quiet;
}
function fortUnlocked(cw){
  const out = ['hyena']; if (cw >= 2) out.push('grub'); if (cw >= 3) out.push('jackal'); if (cw >= 4) out.push('cheetah'); if (cw >= 6) out.push('warthog'); if (cw >= 7) out.push('vulture');
  if (cw >= 8) out.push('rhino'); if (cw >= 9) out.push('baboon'); if (cw >= 11) out.push('honeybadger'); if (cw >= 12) out.push('mamba'); if (cw >= 14) out.push('ember'); if (cw >= 16) out.push('termite');
  return out;
}
function fortSquad(kind){
  const ft = G.ft; if (!ft || G.attract || G.enemies.length > 150 || ft.squads[kind] >= FT_ALARM.cap[kind]) return;
  const cw = chapterWaveOf(G.wave), un = fortUnlocked(cw), light = un.filter(function(t){ return t === 'hyena' || t === 'grub' || t === 'jackal' || t === 'cheetah'; }),
    heavy = un.filter(function(t){ return t === 'warthog' || t === 'rhino' || t === 'baboon' || t === 'mamba' || t === 'honeybadger'; }), n = kind === 'a' ? 3 : kind === 'b' ? 3 : 4;
  const from = kind === 'a' ? light : kind === 'b' ? (heavy.length ? heavy.concat(['hyena']) : light) : un.filter(function(t){ return t !== 'grub'; });
  const sp = towerSpawnPoint(); if (!sp) return;
  ft.squads[kind]++;
  for (let i = 0; i < n; i++){ const p = towerOpenNear(sp.x + rand(-70, 70), sp.y + rand(-70, 70)); spawnEnemy(from[Math.floor(Math.random() * from.length)], p.x, p.y, G.wave); }
  addText(P.x, P.y - 96, kind === 'a' ? 'Reinforcements!' : kind === 'b' ? 'Heavy reinforcements!' : 'FULL ALARM: everyone out!', '#FF8A6A', 18, true); sfx('boom', 0.08); screenFlash('#FF5A4A', 0.1, 0.3);
}
function fortAlarmTick(dt){
  const ft = G.ft; ft.quiet -= dt;
  if (ft.quiet <= 0 && ft.alarm > 0) ft.alarm = Math.max(0, ft.alarm - FT_ALARM.decay * dt);
  const a = ft.alarm;
  if (a >= FT_ALARM.a && ft.lvl < 1){ ft.lvl = 1; fortSquad('a'); }
  if (a >= FT_ALARM.b && ft.lvl < 2){ ft.lvl = 2; fortSquad('b'); }
  if (a >= FT_ALARM.full && ft.lvl < 3){ ft.lvl = 3; ft.fullT = 0; banner('FULL ALARM', 'Chaos is worth half again', '#FF5A4A', 2.6); fortSquad('c'); }
  if (ft.lvl === 3){ ft.fullT += dt; if (ft.fullT >= 14){ ft.fullT = 0; fortSquad('c'); } }
  if (a < 30) ft.lvl = 0; else if (a < 65 && ft.lvl > 1) ft.lvl = 1; else if (a < 95 && ft.lvl > 2) ft.lvl = 2;
}

/* ---- things falling ---- */
const fortBaseCollapse = collapseBuilding;
collapseBuilding = function(b){
  if (!b.fort) return fortBaseCollapse.apply(this, arguments);
  if (b.collapsed) return;
  b.collapsed = true; b.hp = 0;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  for (let i = 0; i < 5; i++) burstParticles(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 8, i % 2 ? '#A89E90' : '#6A6458', 220, 6);
  addShock(cx, cy, Math.max(b.w, b.h) * 0.7, 0.45, b.maxHp * 0.5, '#B8AE9E', { width: 20, kb: 240, filled: true });
  G.shocks[G.shocks.length - 1].noBuildings = true;
  addShake(Math.min(14, 6 + b.maxHp / 160)); sfx('boom', 0.1);
  fortOnCollapse(b);
};
function fortOnCollapse(b){
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, ft = G.ft; if (!ft) return;
  b.smoke = 10; ft.wrecked++;
  fortChaos(b.chaos, cx, cy - 20, b.name + ' down!');
  fortAlarm(b.expl ? 10 : b.chaos >= 400 ? 8 : 4);
  if (b.expl){ b.fire = 4; FT.fuse.push({ t: 0.16 + Math.random() * 0.14, b: b }); }
  if (b.kind === 'gen') FT.lights.forEach(function(l){ if (l.gen === b && !l.collapsed) fortChaos(80, l.x + l.w / 2, l.y - 10, 'Lights out!'); });
  ftNav();
  if (!ft.tip && b.expl){ ft.tip = true; addText(cx, cy - 56, 'It blows! Anything next to it goes too', '#FFD890', 15, false); }
}
function fortExplode(b){
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = b.expl, sp = b.ex; if (!sp) return;
  addShock(cx, cy, r, 0.5, 0, '#FF9A3A', { width: 18, filled: true }); addShake(Math.min(16, 6 + r / 40)); sfx('boom', 0.14, cx, cy); screenFlash('#FFB070', 0.08, 0.2);
  for (let i = 0; i < 3; i++) burstParticles(cx + rand(-r, r) * 0.3, cy + rand(-r, r) * 0.3, 10, i % 2 ? '#FFB070' : '#FF6A2A', 260, 6, { glow: true });
  const bs = FT.all;
  for (let i = 0; i < bs.length; i++){
    const o = bs[i]; if (o === b || o.collapsed) continue;
    const dx = Math.max(o.x - cx, 0, cx - (o.x + o.w)), dy = Math.max(o.y - cy, 0, cy - (o.y + o.h)), d = Math.sqrt(dx * dx + dy * dy);
    if (d < r) damageBuilding(o, sp.dmg * (d < r * 0.6 ? 1 : (1 - d / r) / 0.4), 'blast');       /* full damage close in, fading to nothing at the edge: what is next to it goes too */
  }
  const near = enemiesNear(cx, cy, r + 60, []), prev = dmgSrc; dmgSrc = 'fort';
  for (let i = 0; i < near.length; i++){
    const e = near[i]; if (e.dead || e.untarg) continue; const d = hyp(e.x - cx, e.y - cy); if (d > r + e.r) continue;
    const k = 1 - clamp(d / (r + e.r), 0, 1) * 0.6, dmg = e.big ? e.maxHp * 0.012 * k : e.maxHp * sp.mul * k * 3;
    damageEnemy(e, dmg, { noCrit: true, quiet: true, color: '#FFB070' });
    if (e.dead) fortChaos(25, e.x, e.y - 10, '');
  }
  dmgSrc = prev;
}

/* a clear line from the edge of a gun or a light (they are solid buildings themselves, so the line starts just outside) to a point */
function ftSight(cx, cy, tx, ty, off){ const dx = tx - cx, dy = ty - cy, d = Math.sqrt(dx * dx + dy * dy) || 1; return d < off || towerSight(cx + dx / d * off, cy + dy / d * off, tx, ty); }

/* ---- guns and lights ---- */
function ftTurretDmg(){ return ETYPES_FORT.hyena.dmg * fortScale(chapterWaveOf(G.wave)).dmg * 0.7; }
function fortHack(b){
  b.tState = 'ally'; b.allyT = FT_HACK.ally; b.hack = 0;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  fortChaos(150, cx, cy - 50, 'HACKED'); sfx('pickupS', 0.12, cx, cy); burstParticles(cx, cy, 16, '#6AE08A', 200, 4, { glow: true }); addShock(cx, cy, 120, 0.4, 0, '#6AE08A');
}
function ftTrace(x1, y1, x2, y2, c){ G.ft.tracers.push({ x1: x1, y1: y1, x2: x2, y2: y2, t: 0.12, c: c }); }
function fortTurretTick(b, dt){
  const ft = G.ft, cx = b.x + b.w / 2, cy = b.y + b.h / 2, st = b.tState;
  if (b.muzzle > 0) b.muzzle -= dt;
  if (st === 'hostile'){
    const dx = P.x - cx, dy = P.y - cy, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 720 && ftSight(cx, cy, P.x, P.y, 52)){
      b.ang = turnTo(b.ang || 0, Math.atan2(dy, dx), 4.5 * dt); b.cd -= dt;
      if (b.cd <= 0){ b.burst = 3; b.bt = 0.35; b.cd = 2.6 + Math.random() * 0.8; addMarker(cx, cy, 14, 0.35, '#FF5A4A', null); }
    } else b.cd = Math.max(b.cd, 0.8);
    if (b.burst > 0){ b.bt -= dt; if (b.bt <= 0){ b.bt = 0.16; b.burst--; b.muzzle = 0.08; const a = b.ang || 0; addEProj(cx + Math.cos(a) * 42, cy + Math.sin(a) * 42, Math.cos(a) * 470, Math.sin(a) * 470, 4, ftTurretDmg(), '#FF9A6A', { tracer: true, life: 2.2 }); sfx('spit', 0.06, cx, cy); } }
    if (d < 300 && !ft.hackTip && !G.attract){ ft.hackTip = true; addText(cx, cy - 74, 'Stand beside a gun to hack it', '#9AF0C8', 15, false); }
    if (d < FT_HACK.reach && !G.attract){ b.hack = Math.min(1, b.hack + dt / FT_HACK.time); if (b.hack >= 1) fortHack(b); } else b.hack = Math.max(0, b.hack - dt * 0.8);
  } else if (st === 'ally'){
    b.allyT -= dt; b.cd2 -= dt;
    let tgt = null, bd = FT_HACK.range; const near = enemiesNear(cx, cy, FT_HACK.range, []);
    for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || e.untarg || e.def.turret) continue; const d = hyp(e.x - cx, e.y - cy); if (d < bd && ftSight(cx, cy, e.x, e.y, 52)){ bd = d; tgt = e; } }
    if (tgt){
      b.ang = turnTo(b.ang || 0, Math.atan2(tgt.y - cy, tgt.x - cx), 9 * dt);
      if (b.cd2 <= 0){
        b.cd2 = FT_HACK.fire; b.muzzle = 0.08; const a = b.ang; ftTrace(cx + Math.cos(a) * 42, cy + Math.sin(a) * 42, tgt.x, tgt.y, '#9AF0C8'); sfx('zap', 0.05, cx, cy);
        const prev = dmgSrc; dmgSrc = 'fort'; damageEnemy(tgt, tgt.big ? tgt.maxHp * 0.0016 : tgt.maxHp * 0.12 + 1, { noCrit: true, quiet: true, color: '#9AF0C8' }); dmgSrc = prev;
        if (tgt.dead) fortChaos(15, tgt.x, tgt.y - 10, '');
      }
    }
    if (b.allyT <= 0){ b.tState = 'dead'; addText(cx, cy - 50, 'Burned out', '#BBBBBB', 14, false); burstParticles(cx, cy, 10, '#6A6A6A', 120, 4); }
  }
}
function fortLightOn(l){ return !l.collapsed && !(l.gen && l.gen.collapsed); }
function fortLightAng(l, t){ return l.ph + t * FT_LIGHT.speed * (l.idx % 2 ? 1 : -1); }
function fortLightTick(l, dt){
  if (l.cool > 0) l.cool -= dt;
  if (!fortLightOn(l)){ l.spotT = 0; return; }
  const cx = l.x + l.w / 2, cy = l.y + l.h / 2, dx = P.x - cx, dy = P.y - cy, d = Math.sqrt(dx * dx + dy * dy);
  if (d < FT_LIGHT.range && Math.abs(angDiff(Math.atan2(dy, dx), fortLightAng(l, G.time))) < FT_LIGHT.half && ftSight(cx, cy, P.x, P.y, 46)){
    l.spotT += dt;
    if (l.spotT >= FT_LIGHT.spot && l.cool <= 0 && !G.attract){ l.cool = FT_LIGHT.cool; l.spotT = 0; fortAlarm(14); fortSquad(G.ft.lvl >= 1 ? 'b' : 'a'); addText(P.x, P.y - 70, 'SPOTTED!', '#FF8A6A', 18, true); }
  } else l.spotT = Math.max(0, l.spotT - dt * 2);
}

/* ---- every frame, every wave ---- */
function fortTick(dt){
  const ft = G.ft; if (G.state !== 'playing' || !ft) return;
  ft.comboT -= dt; if (ft.comboT <= 0) ft.combo = 0;
  fortAlarmTick(dt);
  for (let i = FT.fuse.length - 1; i >= 0; i--){ const f = FT.fuse[i]; f.t -= dt; if (f.t <= 0){ FT.fuse.splice(i, 1); fortExplode(f.b); } }
  for (let i = 0; i < FT.turrets.length; i++){ const b = FT.turrets[i]; if (!b.collapsed) fortTurretTick(b, dt); }
  for (let i = 0; i < FT.lights.length; i++) fortLightTick(FT.lights[i], dt);
  for (let i = ft.tracers.length - 1; i >= 0; i--){ ft.tracers[i].t -= dt; if (ft.tracers[i].t <= 0) ft.tracers.splice(i, 1); }
  for (let i = 0; i < FT.all.length; i++){ const b = FT.all[i]; if (b.fire > 0) b.fire -= dt; if (b.flash > 0) b.flash -= dt; }
  ft.smokeT -= dt;
  if (ft.smokeT <= 0 && fxLevelNow() > 0){
    ft.smokeT = 0.2;
    for (let i = 0; i < FT.all.length; i++){
      const b = FT.all[i]; if (b.collapsed){ if (b.smoke <= 0) continue; b.smoke -= 0.2; addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.8, rand(-10, 10), -rand(30, 60), rand(10, 18), rand(1.2, 2), 'rgba(50,44,40,.5)', { drag: 0.6 }); if (Math.random() < 0.5) addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.8, rand(-8, 8), -rand(20, 50), rand(4, 8), 0.6, '#FF8A3A', { glow: true, drag: 1 }); }
      else if (b.hp < b.maxHp * 0.5 && (b.idx + Math.floor(G.time * 5)) % 3 === 0) addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.7, rand(-8, 8), -rand(24, 44), rand(7, 12), rand(0.9, 1.5), 'rgba(80,76,72,.4)', { drag: 0.6 });
    }
  }
}
const fortBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ fortBaseBldUpdate.apply(this, arguments); if (G.biome === 'fort' && G.chapter === COUNTER_CHAPTER) fortTick(dt); };

/* a wave begins: the count starts again, the guns are mended, and what the fort can replace comes back (everything, after a boss) */
function ftRestore(b){
  b.collapsed = false; b.hp = b.maxHp; b.fire = 0; b.smoke = 0; b.flash = 0.35; b.tState = 'hostile'; b.allyT = 0; b.hack = 0;
  burstParticles(b.x + b.w / 2, b.y + b.h / 2, 8, '#C8CCD4', 140, 4);
}
function fortWaveStart(n){
  const ft = G.ft; if (!ft) return;
  const cw = chapterWaveOf(n), all = cw > 1 && cw % 5 === 1; let back = 0;
  ft.waveChaos = 0; ft.squads = { a: 0, b: 0, c: 0 }; ft.alarm = Math.min(ft.alarm, 20); ft.lvl = 0; ft.combo = 0; FT.fuse.length = 0;
  FT.all.forEach(function(b){
    if (b.kind === 'turret'){ if (b.collapsed){ ftRestore(b); back++; } b.tState = 'hostile'; b.hack = 0; b.allyT = 0; return; }
    if (b.collapsed && (all || b.back || b.kind === 'tank')){ ftRestore(b); back++; }
  });
  if (back > 0){
    ftNav();
    if (buildingAt(P.x, P.y)){ const p = towerOpenNear(P.x, P.y); P.x = p.x; P.y = p.y; }
    if (!G.attract && cw > 1) addText(P.x, P.y - 84, all ? 'The fort is rebuilt' : 'Fresh vehicles and guns roll in', '#FFE49A', 16, false);
  }
  if (cw === 1 && !G.attract && !ft.tip1){ ft.tip1 = true; addText(P.x, P.y - 130, 'Wreck everything: every building is chaos', '#FFE49A', 17, true); }
}
const fortBaseStartWave = startWave;
startWave = function(n){ const r = fortBaseStartWave.apply(this, arguments); if (chapterOf(n) === COUNTER_CHAPTER) fortWaveStart(n); return r; };
function fortWaveEnd(){
  const ft = G.ft; if (!ft || G.attract) return;
  const gold = Math.round(ft.waveChaos / 12);
  if (gold > 0){ G.bonusGold += gold; addText(P.x, P.y - 84, 'Chaos bonus  +' + fmt(gold) + ' gold', ftTierColor(), 18, true); }
  const d = Save.data; if (d){ d.fortBestWave = Math.max(d.fortBestWave | 0, chapterWaveOf(G.wave)); Save.write(); }
}
const fortBaseWaveClear = waveClearFX;
waveClearFX = function(){ if (G.chapter === COUNTER_CHAPTER && G.biome === 'fort') fortWaveEnd(); return fortBaseWaveClear.apply(this, arguments); };
/* the last wave is won: the flag is saved before the film, so quitting during it loses nothing */
function fortFinishSave(){ const d = Save.data; if (!d) return; d.chapter14Complete = true; d.chapter15Complete = true; d.chapter16Complete = true; d.chapter17Complete = true; if (G.ft) d.fortChaosBest = Math.max(d.fortChaosBest | 0, Math.min(99999999, G.ft.chaos | 0)); Save.write(); }

/* ---- pictures: the searchlight beams and the gun tracers on the ground, and the chaos panel over everything ---- */
function ftDrawMech(ctx, x0, y0, x1, y1, t){
  const ft = G.ft; if (!ft) return;
  for (let i = 0; i < FT.lights.length; i++){
    const l = FT.lights[i]; if (!fortLightOn(l)) continue;
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2; if (cx + FT_LIGHT.range < x0 || cx - FT_LIGHT.range > x1 || cy + FT_LIGHT.range < y0 || cy - FT_LIGHT.range > y1) continue;
    const a = fortLightAng(l, t), hot = l.spotT > 0;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, FT_LIGHT.range, 0); g.addColorStop(0, hot ? 'rgba(255,120,90,.34)' : 'rgba(255,240,180,.30)'); g.addColorStop(1, hot ? 'rgba(255,120,90,0)' : 'rgba(255,240,180,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, FT_LIGHT.range, -FT_LIGHT.half, FT_LIGHT.half); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  }
  for (let i = 0; i < ft.tracers.length; i++){ const tr = ft.tracers[i]; ctx.strokeStyle = tr.c; ctx.globalAlpha = Math.min(1, tr.t * 8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke(); ctx.globalAlpha = 1; }
}
const fortBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  fortBaseOverlays.apply(this, arguments);
  const ft = G.ft; if (G.chapter !== COUNTER_CHAPTER || G.biome !== 'fort' || !ft || G.attract || G.state === 'levelup') return;
  const W = G.W, pw = clamp(W * 0.46, 250, 400), x0 = W / 2 - pw / 2; let y0 = W < 700 && G.H > W ? 122 : 64; if (G.bossAlive && G.boss && !G.boss.dead) y0 = W < 700 && G.H > W ? 172 : 108;
  const T = ft.tier >= 0 ? FT_TIERS[ft.tier] : null, nx = FT_TIERS[Math.min(FT_TIERS.length - 1, ft.tier + 1)], col = T ? T.c : '#FFE49A', prog = ft.tier + 1 >= FT_TIERS.length ? 1 : clamp((ft.chaos - (T ? T.at : 0)) / (nx.at - (T ? T.at : 0)), 0, 1);
  ctx.save(); ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(14,12,16,.78)'; ctx.fillRect(x0, y0, pw, 78); ctx.fillStyle = col; ctx.fillRect(x0, y0, 4, 78);
  ctx.font = '800 15px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillStyle = col; ctx.fillText(T ? T.n.toUpperCase() : 'CHAOS', x0 + 12, y0 + 19);
  ctx.textAlign = 'right'; ctx.fillStyle = '#FFF6D8'; ctx.fillText(fmt(ft.chaos), x0 + pw - 10, y0 + 19);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x0 + 12, y0 + 26, pw - 22, 6); ctx.fillStyle = col; ctx.fillRect(x0 + 12, y0 + 26, (pw - 22) * prog, 6);
  for (let i = 0; i < FT_TIERS.length; i++){ const px = x0 + 12 + i * 15, on = i <= ft.tier, got = Save.data && ((Save.data.fortBadges | 0) & (1 << i)); ctx.fillStyle = on ? FT_TIERS[i].c : 'rgba(255,255,255,.14)'; ctx.fillRect(px, y0 + 36, 12, 5); if (got){ ctx.fillStyle = '#FFE49A'; ctx.fillRect(px + 4, y0 + 42, 4, 3); } }
  ctx.font = '800 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'right';
  if (ft.combo > 1){ const m = 1 + Math.min(ft.combo, FT_COMBO.cap) * FT_COMBO.step; ctx.fillStyle = col; ctx.fillText('COMBO ×' + m.toFixed(1), x0 + pw - 10, y0 + 43); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x0 + pw - 10 - 70 * clamp(ft.comboT / FT_COMBO.window, 0, 1), y0 + 46, 70 * clamp(ft.comboT / FT_COMBO.window, 0, 1), 2); }
  const al = ft.alarm / FT_ALARM.full, hot = ft.lvl >= 3 && Math.sin(G.time * 14) > 0, ac = ft.lvl >= 3 ? (hot ? '#FFFFFF' : '#FF3A2A') : ft.lvl >= 2 ? '#FF6A3A' : ft.lvl >= 1 ? '#F2B83A' : '#6AC85A';
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x0 + 12, y0 + 54, pw - 22, 14); ctx.fillStyle = ac; ctx.fillRect(x0 + 12, y0 + 54, (pw - 22) * al, 14);
  ctx.textAlign = 'left'; ctx.font = '800 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillStyle = al > 0.2 ? '#14120E' : '#FFF6D8'; ctx.fillText(ft.lvl >= 3 ? 'FULL ALARM' : ft.lvl >= 2 ? 'LOCKDOWN' : ft.lvl >= 1 ? 'ALERT' : 'ALARM', x0 + 18, y0 + 65);
  /* an arrow at the edge for the nearest big thing still standing, when none is on the screen */
  let best = null, bd = 1e9, anyOn = false;
  for (let i = 0; i < FT.all.length; i++){
    const b = FT.all[i]; if (b.collapsed || b.chaos < 300) continue;
    const sx = (b.x + b.w / 2 - G.camX) * G.zoom + W / 2, sy = (b.y + b.h / 2 - G.camY) * G.zoom + G.H / 2;
    if (sx > 20 && sx < W - 20 && sy > 20 && sy < G.H - 20){ anyOn = true; break; }
    const d = hyp(b.x + b.w / 2 - P.x, b.y + b.h / 2 - P.y); if (d < bd){ bd = d; best = b; }
  }
  if (!anyOn && best){
    const sx = (best.x + best.w / 2 - G.camX) * G.zoom + W / 2, sy = (best.y + best.h / 2 - G.camY) * G.zoom + G.H / 2, a = Math.atan2(sy - G.H / 2, sx - W / 2), ex = clamp(W / 2 + Math.cos(a) * W, 34, W - 34), ey = clamp(G.H / 2 + Math.sin(a) * G.H, y0 + 96, G.H - 34);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(G.time * 8); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.textAlign = 'center'; ctx.font = '800 11px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillStyle = '#FFF6D8'; ctx.fillText(best.name, clamp(ex, 56, W - 56), clamp(ey + 24, y0 + 112, G.H - 10));
  }
  ctx.restore();
};

/* ---- the run report says how much she wrecked, and at what level ---- */
const fortBaseRunReport = runReport;
runReport = function(){
  const r = fortBaseRunReport.apply(this, arguments);
  if (G.ft && G.chapter === COUNTER_CHAPTER){ r.ftChaos = G.ft.chaos | 0; r.ftTier = G.ft.tier; r.ftWrecked = G.ft.wrecked | 0; }
  return r;
};
const fortBaseReportHTML = runReportHTML;
runReportHTML = function(r, died){
  const h = fortBaseReportHTML.apply(this, arguments), R = r && r.report;
  if (!R || R.ftChaos === undefined) return h;
  const T = R.ftTier >= 0 && FT_TIERS[R.ftTier] ? FT_TIERS[R.ftTier] : null;
  const line = '<div class="rr-line">Chaos <b style="color:' + (T ? T.c : '#FFE49A') + '">' + fmt(R.ftChaos) + '</b>' + (T ? ' \u00b7 level <b style="color:' + T.c + '">' + T.n + '</b>' : '') + ' \u00b7 ' + R.ftWrecked + ' things wrecked.</div>';
  return h.replace('<div class="rr-sub">', line + '<div class="rr-sub">').replace(/<\/div>$/, function(m){ return h.indexOf('<div class="rr-sub">') >= 0 ? m : line + m; });
};
