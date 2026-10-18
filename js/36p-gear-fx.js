'use strict';
/* =============================================================================================================================
   36p-gear-fx.js  --  EIGHT PIECES OF GEAR WITH A PLAYSTYLE. Most gear is a number; these eight also do something. Each effect belongs to one
   piece (GEAR_FX, by piece id), works only while that piece is worn, and grows with the piece's level (gearLevelScale() from 05a):
     thornweave:armor   Thorns       when she is hit, enemies within 70 take 10 damage
     stoneplate:cape    Dust cloak   moving leaves a dust trail; enemies crossing it are slowed 15% for 1s
     frostbite:weapon   Cold snap    the headbutt frosts a ring of 90: enemies in it are slowed 30% for 1.5s
     sunforged:armor    Sun ward     every 12s a flare shield soaks the next hit, up to 20 damage
     aurora:cape        Aurora drift standing still for 2s gives +10% XP for 6s
     starborn:weapon    Star crack   every 5th headbutt sends out a star shockwave (radius 140, 60% of the kick's damage)
     riptide:armor      Undertow     a hit taken in water pulls enemies within 160 toward her by 40
     leviathan:cape     Tidal wake   a wake of drops trails her; enemies in it take 4 damage a second
   Hooks: doKick (onKick), hurtPlayer (onHurt and the ward), updatePlayer (onTick), applyGear (the XP buff). Not in the attract demo, not while
   dead. At Visual effects "off" the effects still work and only the particles are left out. State: GearFx.
   ============================================================================================================================= */
const GearFx = { trail: [], wake: [], dustT: 0, wakeT: 0, dustHitT: 0, wakeHitT: 0, kicks: 0, ward: { ready: true, cd: 0 }, still: 0, auroraT: 0, pending: [], lastTime: 0 };
function gfxWorn(id){ const p = GEAR_INDEX[id]; return p && gearEquipped(p.slot) === id ? gearLevelScale(gearLevel(id)) : 0; }      /* 0 when not worn, else the level scale */
function gfxParticles(){ return typeof fxLevelNow !== 'function' || fxLevelNow() > 0; }
function gfxInWater(){ return G.biome === 'ocean' || !!(window.groundStateNow && groundStateNow().pond); }
function gfxHit(e, dmg){                                                                    /* damage from gear: no crits, no text, counted as 'gear' in the run report */
  const keep = dmgSrc; dmgSrc = 'gear'; try { damageEnemy(e, dmg, { noCrit: true, silent: true, kb: 0, sx: P.x, sy: P.y }); } finally { dmgSrc = keep; }
}
function gfxWithin(r){ const out = []; for (let i = 0; i < G.enemies.length; i++){ const e = G.enemies[i]; if (!e.dead && Math.hypot(e.x - P.x, e.y - P.y) <= r + e.r) out.push(e); } return out; }
function gfxReset(){
  GearFx.trail.length = 0; GearFx.wake.length = 0; GearFx.pending.length = 0; GearFx.dustT = GearFx.wakeT = GearFx.dustHitT = GearFx.wakeHitT = 0; GearFx.kicks = 0;
  GearFx.ward.ready = true; GearFx.ward.cd = 0; GearFx.still = 0;
  if (GearFx.auroraT > 0){ GearFx.auroraT = 0; recalcStats(); }
}
function gfxLater(t, f){ GearFx.pending.push({ t: t, f: f }); }

const GEAR_FX = {
  'thornweave:armor': { name: 'Thorns', desc: 'When she is hit, enemies within 70 take 10 damage.',
    onHurt(sc){
      gfxWithin(70).forEach(function(e){ gfxHit(e, 10 * sc); });
      if (gfxParticles()) addParticle(P.x, P.y, 0, 0, 10, 0.4, 'rgba(155,196,92,.8)', { shape: 'wake', drag: 0, shrink: false });
    } },
  'stoneplate:cape': { name: 'Dust cloak', desc: 'Moving leaves a dust trail; enemies crossing it are slowed 15% for 1s.',
    onTick(sc, dt){
      GearFx.dustT -= dt;
      if (Math.hypot(P.vx, P.vy) > 40 && GearFx.dustT <= 0){
        GearFx.dustT = 0.12; GearFx.trail.push({ x: P.x - P.vx * 0.04, y: P.y + 10, t: 2.2 }); if (GearFx.trail.length > 22) GearFx.trail.shift();
        if (gfxParticles()) addParticle(P.x, P.y + 10, rand(-8, 8), rand(-8, 8), rand(5, 8), 1.6, 'rgba(190,170,130,.4)', { shape: 'puff', drag: 1.5, shrink: false });
      }
      GearFx.dustHitT -= dt;
      if (GearFx.dustHitT <= 0 && GearFx.trail.length){
        GearFx.dustHitT = 0.1;
        for (let i = 0; i < G.enemies.length; i++){ const e = G.enemies[i]; if (e.dead) continue;
          for (let j = 0; j < GearFx.trail.length; j++){ const t = GearFx.trail[j]; if (Math.hypot(e.x - t.x, e.y - t.y) < 22 + e.r * 0.5){ e.slowT = Math.max(e.slowT || 0, 1 * sc); e.slowMul = Math.min(e.slowMul === undefined ? 1 : e.slowMul, 1 - 0.15 * sc); break; } } }
      }
    } },
  'frostbite:weapon': { name: 'Cold snap', desc: 'The headbutt frosts a ring of 90: enemies in it are slowed 30% for 1.5s.',
    onKick(sc){
      gfxLater(0.09, function(){
        gfxWithin(90).forEach(function(e){ e.slowT = Math.max(e.slowT || 0, 1.5 * sc); e.slowMul = Math.min(e.slowMul === undefined ? 1 : e.slowMul, 0.7); });
        if (gfxParticles()){ addParticle(P.x, P.y + 10, 0, 0, 14, 0.5, 'rgba(170,230,255,.8)', { shape: 'wake', drag: 0, shrink: false }); for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; addParticle(P.x + Math.cos(a) * 20, P.y + Math.sin(a) * 12, Math.cos(a) * 90, Math.sin(a) * 60, 3, 0.5, 'rgba(225,248,255,.9)', { shape: 'puff', drag: 3, shrink: false }); } }
      });
    } },
  'sunforged:armor': { name: 'Sun ward', desc: 'Every 12s a flare shield soaks the next hit, up to 20 damage.',
    ward(sc, amount){                                                                         /* returns the damage left after the shield, and uses it up */
      if (!GearFx.ward.ready) return amount;
      GearFx.ward.ready = false; GearFx.ward.cd = 12;
      const dr = P.stats ? P.stats.dr : 0, cap = 20 * sc, eff = amount * (1 - dr);
      addText(P.x, P.y - 34, 'SUN WARD', '#FFD27A', 16, true);
      if (gfxParticles()){ addParticle(P.x, P.y, 0, 0, 14, 0.5, 'rgba(255,210,120,.9)', { shape: 'wake', drag: 0, shrink: false }); burstParticles(P.x, P.y, 10, '#FFD27A', 160, 3.5, { glow: true }); }
      if (eff <= cap){ P.invuln = Math.max(P.invuln, 0.45); return 0; }
      return Math.max(1, amount - cap / Math.max(0.05, 1 - dr));
    } },
  'aurora:cape': { name: 'Aurora drift', desc: 'Standing still for 2s gives +10% XP for 6s.',
    onTick(sc, dt){
      if (GearFx.auroraT > 0){ GearFx.auroraT -= dt; if (GearFx.auroraT <= 0){ GearFx.auroraT = 0; recalcStats(); } }
      if (Math.hypot(P.vx, P.vy) < 12) GearFx.still += dt; else GearFx.still = 0;
      if (GearFx.still >= 2 && GearFx.auroraT <= 0){ GearFx.auroraT = 6; GearFx.still = 0; recalcStats(); if (gfxParticles()) burstParticles(P.x, P.y - 10, 8, '#8FFFD1', 80, 3, { glow: true }); }
    } },
  'starborn:weapon': { name: 'Star crack', desc: "Every 5th headbutt sends out a star shockwave (radius 140, 60% of the kick's damage).",
    onKick(sc){
      GearFx.kicks++; if (GearFx.kicks % 5) return;
      const s = P.stats, w = P.weapon || DEFAULT_WEAPON, keep = dmgSrc; dmgSrc = 'gear';
      try { addShock(P.x, P.y, 140, 0.34, w.dmg * s.kickDmgMul * s.allDmgMul * 0.6 * sc, '#FFD84D', { width: 10, kb: 300 }); } finally { dmgSrc = keep; }
      if (gfxParticles()) burstParticles(P.x, P.y, 12, '#FFD84D', 220, 3.5, { glow: true });
    } },
  'riptide:armor': { name: 'Undertow', desc: 'A hit taken in water pulls enemies within 160 toward her by 40.',
    onHurt(sc){
      if (!gfxInWater()) return;
      gfxWithin(160).forEach(function(e){ const d = Math.hypot(e.x - P.x, e.y - P.y), a = Math.atan2(P.y - e.y, P.x - e.x), m = Math.min(40 * sc, Math.max(0, d - e.r - P.r)); e.x += Math.cos(a) * m; e.y += Math.sin(a) * m; });
      if (gfxParticles()) addParticle(P.x, P.y, 0, 0, 30, 0.5, 'rgba(120,200,235,.7)', { shape: 'wake', drag: 0, shrink: false });
    } },
  'leviathan:cape': { name: 'Tidal wake', desc: 'A wake of drops trails her; enemies in it take 4 damage a second.',
    onTick(sc, dt){
      GearFx.wakeT -= dt;
      if (GearFx.wakeT <= 0 && Math.hypot(P.vx, P.vy) > 40){
        GearFx.wakeT = 0.1; GearFx.wake.push({ x: P.x, y: P.y + 6, t: 1.4 }); if (GearFx.wake.length > 16) GearFx.wake.shift();
        if (gfxParticles()) addParticle(P.x + rand(-6, 6), P.y + 8 + rand(-4, 4), rand(-12, 12), rand(-12, 12), rand(3.5, 5.5), 1.4, 'rgba(170,235,255,.85)', { drag: 1.2, shrink: true, glow: true });
      }
      GearFx.wakeHitT -= dt;
      if (GearFx.wakeHitT <= 0 && GearFx.wake.length){
        GearFx.wakeHitT = 0.25;
        for (let i = 0; i < G.enemies.length; i++){ const e = G.enemies[i]; if (e.dead) continue;
          for (let j = 0; j < GearFx.wake.length; j++){ const t = GearFx.wake[j]; if (Math.hypot(e.x - t.x, e.y - t.y) < 20 + e.r * 0.5){ gfxHit(e, 1 * sc); break; } } }
      }
    } }
};

function gearFxEvent(name, a, b){
  Object.keys(GEAR_FX).forEach(function(id){ const fx = GEAR_FX[id]; if (!fx[name]) return; const sc = gfxWorn(id); if (sc) fx[name](sc, a, b); });
}
function gearFxTick(dt){
  if (G.attract || G.state !== 'playing' || P.dead){ return; }
  if (G.time < GearFx.lastTime - 1) gfxReset();                                          /* a new run */
  GearFx.lastTime = G.time;
  for (let i = GearFx.pending.length - 1; i >= 0; i--){ const q = GearFx.pending[i]; q.t -= dt; if (q.t <= 0){ GearFx.pending.splice(i, 1); try { q.f(); } catch (e) {} } }
  for (let i = GearFx.trail.length - 1; i >= 0; i--){ GearFx.trail[i].t -= dt; if (GearFx.trail[i].t <= 0) GearFx.trail.splice(i, 1); }
  for (let i = GearFx.wake.length - 1; i >= 0; i--){ GearFx.wake[i].t -= dt; if (GearFx.wake[i].t <= 0) GearFx.wake.splice(i, 1); }
  if (!GearFx.ward.ready){ GearFx.ward.cd -= dt; if (GearFx.ward.cd <= 0) GearFx.ward.ready = true; }              /* the ward's own clock: 12s from the hit it soaked */
  gearFxEvent('onTick', dt);
}
(function(){
  const k = doKick;
  doKick = function(){ const ready = !(P.kickCd > 0), r = k.apply(this, arguments); if (ready && P.kickCd > 0 && !G.attract && !P.dead) gearFxEvent('onKick'); return r; };      /* a kick happened when the cooldown went from none to some */
  const h = hurtPlayer;
  hurtPlayer = function(amount, sx, sy){
    if (G.attract || P.invuln > 0 || P.dead || G.state !== 'playing') return h.apply(this, arguments);
    const hp0 = P.hp, ward = gfxWorn('sunforged:armor');
    let amt = amount;
    if (ward){ amt = GEAR_FX['sunforged:armor'].ward(ward, amount); if (amt <= 0) return; }
    const r = h.call(this, amt, sx, sy);
    if (P.hp < hp0 && !P.dead) gearFxEvent('onHurt', amount);
    return r;
  };
  const u = updatePlayer;
  updatePlayer = function(dt){ const r = u.apply(this, arguments); gearFxTick(dt); return r; };
  const ag = applyGear;
  applyGear = function(s){ ag.apply(this, arguments); const sc = GearFx.auroraT > 0 ? gfxWorn('aurora:cape') : 0; if (sc) s.xpMul += 0.10 * sc; };
})();
