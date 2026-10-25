'use strict';
/* Hostile hazards and the Space Marine AI (chapter 8). */
/* ========================= 18h. HOSTILE HAZARDS (Chapter 8) ========================= */
/* The existing shock and zone helpers only ever hurt ENEMIES (they are the
   giraffe's own weapons). The Space Marines need attacks that hurt the giraffe
   and can be seen coming, so this is a separate layer:
     markers  - a telegraph on the ground that runs a callback when it completes
     blasts   - an instant hit in a radius, with a ring effect
     hzones   - fire that hurts anything standing in it
     beams    - a line that warns, then hurts anything on it
   Everything here is dodgeable: it always shows where and when. */
function segDist(px, py, x1, y1, x2, y2){
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return hyp(px - (x1 + dx * t), py - (y1 + dy * t));
}
function turnTo(a, target, maxStep){ return a + clamp(angDiff(target, a), -maxStep, maxStep); }
function addMarker(x, y, r, dur, color, fn, o){
  const m = { x: x, y: y, r: r, t: 0, dur: dur, color: color, fn: fn || null };
  if (o) Object.assign(m, o);
  G.markers.push(m); return m;
}
function updateMarkers(dt){
  const ms = G.markers;
  for (let i = ms.length - 1; i >= 0; i--){
    const m = ms[i];
    m.t += dt;
    if (m.owner && m.owner.dead){ ms.splice(i, 1); continue; }
    if (m.t >= m.dur){ ms.splice(i, 1); if (m.fn) m.fn(m); }
  }
}
function hostileBlast(x, y, r, dmg, color, o){
  o = o || {};
  G.blasts.push({ x: x, y: y, r: r, life: 0.45, max: 0.45, color: color, column: !!o.column });
  if (G.allies && G.allies.length) marsBlastAllies(x, y, r, dmg);
  if (hyp(P.x - x, P.y - y) < r + P.r * 0.6){
    hurtPlayer(dmg, x, y);
    if (o.kb){ const a = Math.atan2(P.y - y, P.x - x), k = typeof o.kb === 'number' && o.kb > 1 ? o.kb : 70; P.x = clamp(P.x + Math.cos(a) * k, 26, ARENA_W - 26); P.y = clamp(P.y + Math.sin(a) * k, 26, ARENA_H - 26); }
  }
  if (o.hurtEnemies){
    const near = enemiesNear(x, y, r + 40), hit = [];
    for (let i = 0; i < near.length; i++){ const q = near[i]; if (q.dead || q === o.source || q.untarg) continue; if (hyp(q.x - x, q.y - y) < r + q.r) hit.push(q); }
    for (let i = 0; i < hit.length; i++) damageEnemy(hit[i], hit[i].maxHp * o.hurtEnemies * (hit[i].big ? 0.1 : 1), { noCrit: true, color: '#FFB040', noShield: true });
  }
  burstParticles(x, y, 12, color, 240, 5, { glow: true });
  addShake(o.shake || 5); sfx('eBlast', 0.09, x, y);
}
function hostileZone(x, y, r, dur, dps, color){ G.hzones.push({ x: x, y: y, r: r, life: dur, max: dur, dps: dps, color: color, tick: 0.2 }); }
function updateHZones(dt){
  const zs = G.hzones;
  while (zs.length > 40) zs.shift();
  for (let i = zs.length - 1; i >= 0; i--){
    const z = zs[i];
    z.life -= dt; z.tick -= dt;
    if (z.tick <= 0 && hyp(P.x - z.x, P.y - z.y) < z.r + P.r * 0.5){ hurtPlayer(z.dps, z.x, z.y); z.tick = 0.5; }
    if (z.life <= 0) zs.splice(i, 1);
  }
}
function addBeam(x1, y1, x2, y2, w, warn, dur, dmg, color, o){
  const b = { x1: x1, y1: y1, x2: x2, y2: y2, w: w, warn: warn, dur: dur, dmg: dmg, color: color, t: 0, hit: false, tick: 0, once: true, fired: false };
  if (o) Object.assign(b, o);
  G.beams.push(b); return b;
}
function updateBeams(dt){
  const bs = G.beams;
  for (let i = bs.length - 1; i >= 0; i--){
    const b = bs[i];
    b.t += dt; b.tick -= dt;
    if (b.owner && b.owner.dead){ bs.splice(i, 1); continue; }
    if (b.upd) b.upd(b, dt);
    if (b.t >= b.warn && b.t < b.warn + b.dur){
      if (!b.fired){ b.fired = true; sfx('eBeam', 0.06, (b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2); addShake(3); }
      if (b.dmg > 0 && segDist(P.x, P.y, b.x1, b.y1, b.x2, b.y2) < b.w / 2 + P.r * 0.8 && (b.once ? !b.hit : b.tick <= 0)){ hurtPlayer(b.dmg, b.x1, b.y1); b.hit = true; b.tick = 0.3; }
    }
    if (b.t >= b.warn + b.dur) bs.splice(i, 1);
  }
}
/* drags the giraffe toward a point; the gravity warden's signature */
function pullPlayer(ax, ay, force, dt){
  const d = hyp(ax - P.x, ay - P.y) || 1;
  P.x = clamp(P.x + (ax - P.x) / d * force * dt, 26, ARENA_W - 26);
  P.y = clamp(P.y + (ay - P.y) / d * force * dt, 26, ARENA_H - 26);
}
/* where the giraffe will be, if she keeps going the way she is */
function leadAim(e, speed){
  const d = hyp(P.x - e.x, P.y - e.y), t = d / (speed * eprojSpeedMul());     /* the bullet really is slower in Chapters 8 and 9, so lead for that */
  return Math.atan2(P.y + P.vy * t * 0.85 - e.y, P.x + P.vx * t * 0.85 - e.x);
}
function fireBullet(e, a, speed, dmgMul, color, r){
  if (G.eproj.length >= 240) return;
  addEProj(e.x + Math.cos(a) * (e.r + 4), e.y + Math.sin(a) * (e.r + 4), Math.cos(a) * speed, Math.sin(a) * speed, r || 4, e.dmg * dmgMul, color || '#9FE8FF', { tracer: true, life: 2.4 });
}

/* ---------- drawing ---------- */
function drawHostileUnder(ctx){
  const v = viewBounds(0);
  for (let i = 0; i < G.hzones.length; i++){
    const z = G.hzones[i];
    if (z.x + z.r < v.x0 || z.x - z.r > v.x1 || z.y + z.r < v.y0 || z.y - z.r > v.y1) continue;
    const a = clamp(z.life / 0.5, 0, 1) * (0.55 + 0.12 * Math.sin(G.time * 12 + i));
    const g = ctx.createRadialGradient(z.x, z.y, z.r * 0.1, z.x, z.y, z.r);
    g.addColorStop(0, z.color); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.globalAlpha = a * 0.75; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.fill();
    ctx.globalAlpha = a; ctx.strokeStyle = z.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(z.x, z.y, z.r * 0.92, 0, TAU); ctx.stroke();
    /* a dashed inner ring that turns, so a danger zone reads by its pattern and not only by its colour */
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -G.time * 18; ctx.lineWidth = 2.4; ctx.strokeStyle = '#FFFFFF'; ctx.globalAlpha = a * 0.7;
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r * 0.7, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < G.markers.length; i++){
    const m = G.markers[i], p = clamp(m.t / m.dur, 0, 1), pulse = 0.55 + 0.45 * Math.sin(G.time * (10 + 14 * p));
    ctx.globalAlpha = 0.14 + 0.3 * p; ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * p, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.45 + 0.5 * pulse * p + 0.15; ctx.strokeStyle = m.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.x - m.r * 0.7, m.y); ctx.lineTo(m.x + m.r * 0.7, m.y); ctx.moveTo(m.x, m.y - m.r * 0.7); ctx.lineTo(m.x, m.y + m.r * 0.7); ctx.stroke();
    ctx.globalAlpha = 1;
    if (m.lobFrom){                                                        /* a grenade in the air, on its way down */
      const gx = lerp(m.lobFrom.x, m.x, p), gy = lerp(m.lobFrom.y, m.y, p) - Math.sin(Math.PI * p) * 110;
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(lerp(m.lobFrom.x, m.x, p), lerp(m.lobFrom.y, m.y, p), 6, 3, 0, 0, TAU); ctx.fill();
      fillCircle(ctx, gx, gy, 6, '#2A2E38'); fillCircle(ctx, gx - 1.4, gy - 1.6, 2.4, '#8A93A8'); fillCircle(ctx, gx + 3, gy - 3, 1.7, Math.sin(G.time * 30) > 0 ? '#FF5A3A' : '#FFD06A');
    }
    if (m.pod && m.fire){                                                  /* an alien egg arrives as a meteor */
      const py = m.y - (1 - p) * (1 - p) * 520;
      csGlow(ctx, m.x, py - 20, 46, '#FF7A1E', 0.8); ctx.strokeStyle = 'rgba(255,150,40,.7)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(m.x + 6, py - 110); ctx.lineTo(m.x, py - 14); ctx.stroke();
      ctx.fillStyle = '#3A1A10'; ctx.beginPath(); ctx.ellipse(m.x, py, 15, 17, 0, 0, TAU); ctx.fill(); csGlow(ctx, m.x, py, 14, '#FFD060', 0.9);
    } else if (m.pod){                                                            /* a drop pod on its way down through a streak of fire */
      const py = m.y - (1 - p) * (1 - p) * 520;
      ctx.strokeStyle = 'rgba(255,170,80,.6)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(m.x, py - 90); ctx.lineTo(m.x, py - 10); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.x, py - 70); ctx.lineTo(m.x, py - 10); ctx.stroke();
      ctx.fillStyle = '#9EA3AE'; ctx.beginPath(); ctx.moveTo(m.x - 15, py - 10); ctx.lineTo(m.x - 10, py + 16); ctx.lineTo(m.x + 10, py + 16); ctx.lineTo(m.x + 15, py - 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FF8A3A'; ctx.fillRect(m.x - 15, py - 10, 30, 4);
    }
  }
}
function drawHostileOver(ctx){
  for (let i = 0; i < G.arcs.length; i++){ const a = G.arcs[i], p = 1 - a.life / a.max; ctx.strokeStyle = a.color; ctx.globalAlpha = (1 - p) * 0.9; ctx.lineWidth = 10 * (1 - p) + 3; ctx.beginPath(); ctx.arc(a.x, a.y, a.range * (0.7 + 0.3 * p), a.a - a.arc, a.a + a.arc); ctx.stroke(); ctx.globalAlpha = 1; }
  for (let i = 0; i < G.beams.length; i++){
    const b = G.beams[i], active = b.t >= b.warn;
    if (!active){
      const locked = b.lockT !== undefined && b.t >= b.lockT;
      ctx.globalAlpha = locked ? 0.95 : 0.35 + 0.35 * Math.sin(G.time * 22);
      ctx.strokeStyle = b.color; ctx.lineWidth = locked ? 2.6 : 1.4; if (!locked && ctx.setLineDash) ctx.setLineDash([12, 9]);
      ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]);
      if (b.w > 14){ ctx.globalAlpha = 0.14; ctx.lineWidth = b.w; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); }
    } else {
      const f = 1 - clamp((b.t - b.warn) / b.dur, 0, 1) * 0.5;
      ctx.globalAlpha = 0.35 * f; ctx.strokeStyle = b.color; ctx.lineWidth = b.w * 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
      ctx.globalAlpha = f; ctx.lineWidth = b.w; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = b.w * 0.4; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.lineCap = 'butt';
    }
    ctx.globalAlpha = 1;
  }
  for (let i = G.blasts.length - 1; i >= 0; i--){
    const s = G.blasts[i], p = 1 - s.life / s.max;
    if (s.column){ ctx.globalAlpha = (1 - p) * 0.75; const g = ctx.createLinearGradient(0, s.y - 900, 0, s.y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, s.color); ctx.fillStyle = g; ctx.fillRect(s.x - s.r * 0.5 * (1 - p * 0.6), s.y - 900, s.r * (1 - p * 0.6), 900); }
    ctx.globalAlpha = (1 - p) * 0.6; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.3 + 0.7 * Math.sqrt(p)), 0, TAU); ctx.fill();
    ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4 * (1 - p) + 1; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * Math.sqrt(p), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  }
}
/* a melee swing: an instant hit in a wedge in front of the attacker, with a sweep of light and a shove */
function hostileSwing(e, range, arc, dmg, kb){
  G.arcs.push({ x: e.x, y: e.y, a: e.ang, range: range, arc: arc, life: 0.28, max: 0.28, color: e.def.pale || '#FFFFFF' });
  const dx = P.x - e.x, dy = P.y - e.y, d = hyp(dx, dy);
  if (d < range + P.r && (d < 40 || Math.abs(angDiff(Math.atan2(dy, dx), e.ang)) < arc)){     /* right on top of the attacker always counts as in front */
    hurtPlayer(dmg, e.x, e.y);
    const a = d < 40 ? e.ang : Math.atan2(dy, dx); P.x = clamp(P.x + Math.cos(a) * kb, 26, ARENA_W - 26); P.y = clamp(P.y + Math.sin(a) * kb, 26, ARENA_H - 26);
  }
  addShake(5); sfx('eSwing', 0.1, e.x, e.y);
}
function updateBlasts(dt){
  for (let i = G.arcs.length - 1; i >= 0; i--){ G.arcs[i].life -= dt; if (G.arcs[i].life <= 0) G.arcs.splice(i, 1); } for (let i = G.blasts.length - 1; i >= 0; i--){ G.blasts[i].life -= dt; if (G.blasts[i].life <= 0) G.blasts.splice(i, 1); } }
/* overlays that belong to a particular unit: shields, heal beams, buffs, barriers, sights */
function drawMarineOverlays(ctx, cx, cy, vw, vh){
  const es = G.enemies;
  for (let i = 0; i < es.length; i++){
    const e = es[i], d = e.def;
    if (!d.marine || e.dead || e.x < cx - vw / 2 - 120 || e.x > cx + vw / 2 + 120 || e.y < cy - vh / 2 - 120 || e.y > cy + vh / 2 + 120) continue;
    if (d.shieldArc){
      const f = e.shieldFlash > 0 ? 1 : 0;
      ctx.strokeStyle = f ? '#FFFFFF' : (d.fx || '#7FE8FF'); ctx.lineWidth = f ? 7 : 5; ctx.globalAlpha = f ? 1 : 0.85;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 9, e.ang - d.shieldArc, e.ang + d.shieldArc); ctx.stroke();
      ctx.globalAlpha = 0.16 + 0.2 * f; ctx.fillStyle = d.fx || '#7FE8FF'; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.arc(e.x, e.y, e.r + 9, e.ang - d.shieldArc, e.ang + d.shieldArc); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (d.melee && d.melee.type === 'cone' && e.state === 'wind'){            /* where the swing will land */
      const f = 0.5 + 0.5 * Math.sin(G.time * 18);
      ctx.fillStyle = 'rgba(255,70,40,' + (0.14 + 0.12 * f) + ')'; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.arc(e.x, e.y, d.melee.range, e.ang - d.melee.arc, e.ang + d.melee.arc); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,120,80,.75)'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (d.melee && d.melee.type === 'spin' && (e.state === 'wind' || e.state === 'spin')){        /* the ring of blades */
      ctx.strokeStyle = 'rgba(255,90,40,' + (0.45 + 0.25 * Math.sin(G.time * 20)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, d.melee.range, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,70,40,' + (e.state === 'spin' ? 0.13 : 0.07) + ')'; ctx.beginPath(); ctx.arc(e.x, e.y, d.melee.range, 0, TAU); ctx.fill();
    }
    if (e.healTgt && e.healTgtT > 0 && !e.healTgt.dead){
      ctx.strokeStyle = 'rgba(80,240,140,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.healTgt.x, e.healTgt.y); ctx.stroke();
      ctx.fillStyle = '#7CFFB0'; ctx.font = '700 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', e.healTgt.x, e.healTgt.y - e.healTgt.r - 6 - (G.time * 30 % 10)); ctx.textAlign = 'left';
    }
    if (e.buffT > 0){ ctx.strokeStyle = 'rgba(255,170,60,' + (0.5 + 0.3 * Math.sin(G.time * 8)) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 6, 0, TAU); ctx.stroke(); }
    if (e.barrier > 0){ ctx.globalAlpha = 0.28 + 0.1 * Math.sin(G.time * 6); ctx.fillStyle = d.fx || '#7FE8FF'; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 16, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.9; ctx.strokeStyle = '#DFFAFF'; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1; }
    if (e.ai === 'm_rifle' && e.state === 'wind'){ ctx.strokeStyle = 'rgba(255,90,70,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ang) * 130, e.y + Math.sin(e.ang) * 130); ctx.stroke(); }
    if (e.ai === 'm_breach' && e.fuse < 1.6 && Math.sin(e.fuse * 24) > 0){ ctx.strokeStyle = '#FF4A3A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 8, 0, TAU); ctx.stroke(); }
  }
}

/* ========================= 18i. SPACE MARINE AI (Chapter 8) ========================= */
/* Every behaviour here is new: none of it is a recolour of chase / dash / flank
   / charge / ranged / skirmish, and none of the bosses reuse an earlier boss's
   pattern. Each function is given the enemy, dt, the unit vector toward the
   giraffe (ux, uy), the distance d, the raw offset (dx, dy) and its speed, and
   returns [moveX, moveY]. State names follow the existing convention so the
   drawing code can tell "winding up" ('wind') from the rest. */
function orbitalStrike(x, y, dmg, col){
  hostileBlast(x, y, 78, dmg, col || '#7FE8FF', { column: true, shake: 8 });
  hostileZone(x, y, 56, 2.2, dmg * 0.3, col || '#54E0FF');
}
const MARINE_AI = {
  /* ---- the rank and file ---- */
  /* Bounding fire: moves in short bounds, then stops dead, takes aim (a red sight shows), and fires a three-round
     burst at where you are GOING, not where you are. Standing still to shoot is what makes them killable. */
  m_rifle(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 6 * dt);
    if (e.strafe === undefined) e.strafe = Math.random() < 0.5 ? 1 : -1;
    if (e.state === 'idle'){
      const dir = d > 320 ? 1 : d < 180 ? -0.7 : 0.25;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.55 * e.strafe; my = uy * e.spdE * dir + ux * e.spdE * 0.55 * e.strafe;
      if (e.stateT <= 0 && d < 560){ e.state = 'wind'; e.stateT = 0.4; }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){ e.state = 'burst'; e.stateT = 0.05; e.shots = 3; }
    } else if (e.state === 'burst'){
      if (e.stateT <= 0){
        fireBullet(e, leadAim(e, 520), 520, 0.5); sfx('spit', 0.07);
        e.shots--; e.stateT = 0.11;
        if (e.shots <= 0){ e.state = 'idle'; e.stateT = rand(0.9, 1.6); e.strafe *= -1; }
      }
    }
    return [mx, my];
  },
  /* Jump trooper: crouches, then rockets over the giraffe's head and lands where she was heading. Untargetable
     while airborne, and a marker shows the landing; being on it when it lands hurts. Vulnerable after landing. */
  m_jet(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; e.z = e.z || 0;
    if (e.jSeed === undefined) e.jSeed = Math.random() * 9;
    if (e.state === 'idle'){
      e.ang = Math.atan2(uy, ux);
      const dir = d > 320 ? 1 : d < 200 ? -1 : 0, w = Math.sin(e.anim * 0.7 + e.jSeed);
      mx = ux * e.spdE * dir * 0.8 + (-uy) * e.spdE * 0.6 * w; my = uy * e.spdE * dir * 0.8 + ux * e.spdE * 0.6 * w;
      if (e.stateT <= 0 && d < 540){ e.state = 'wind'; e.stateT = 0.45; }
    } else if (e.state === 'wind'){
      e.ang = Math.atan2(uy, ux);
      if (e.stateT <= 0){
        const tx = clamp(P.x + P.vx * 0.75, 40, ARENA_W - 40), ty = clamp(P.y + P.vy * 0.75, 40, ARENA_H - 40);
        e.jx0 = e.x; e.jy0 = e.y; e.jx1 = tx; e.jy1 = ty; e.state = 'air'; e.stateT = e.airT = 0.95; e.untarg = true;
        addMarker(tx, ty, 76, 0.95, '#FFB040', null, { owner: e }); sfx('whoosh', 0.1);
      }
    } else if (e.state === 'air'){
      const p = 1 - Math.max(0, e.stateT) / e.airT;
      e.x = lerp(e.jx0, e.jx1, p); e.y = lerp(e.jy0, e.jy1, p); e.z = Math.sin(Math.PI * p) * 86;
      e.ang = Math.atan2(e.jy1 - e.jy0, e.jx1 - e.jx0);
      if (e.stateT <= 0){ e.untarg = false; e.z = 0; e.state = 'recover'; e.stateT = 0.9; hostileBlast(e.x, e.y, 86, e.dmg * 1.05, '#FFB040', { kb: 1, source: e }); }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.2, 3.4); }
    return [mx, my];
  },
  /* Riot trooper: an energy shield across the front soaks nearly everything. It turns slowly, so the answer is to
     get round the side or behind. Occasionally bashes with the shield. */
  m_shield(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const want = Math.atan2(uy, ux);
    if (e.shieldFlash > 0) e.shieldFlash -= dt;
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, want, 1.3 * dt);
      mx = Math.cos(e.ang) * e.spdE * 0.85; my = Math.sin(e.ang) * e.spdE * 0.85;
      if (e.stateT <= 0 && d < 300){ e.state = 'wind'; e.stateT = 0.55; }
    } else if (e.state === 'wind'){
      e.ang = turnTo(e.ang, want, 3.2 * dt);
      if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.4; e.dashVX = Math.cos(e.ang) * 560; e.dashVY = Math.sin(e.ang) * 560; sfx('boom', 0.2); }
    } else { mx = e.dashVX; my = e.dashVY; if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.8, 4.2); } }
    return [mx, my];
  },
  /* Drop pod: falls from orbit onto a marked patch of ground near the giraffe, then sits sealed for a couple of
     seconds before the hatch opens on two riflemen and a drone. Destroy it while sealed and nothing comes out. */
  m_pod(e, dt){
    e.stateT -= dt;
    if (e.state === 'fall'){
      if (e.stateT <= 0){ e.untarg = false; e.state = 'sealed'; e.stateT = 2.6; hostileBlast(e.x, e.y, 74, e.dmg * 0.8, '#FF8A3A', { kb: 1, source: e }); }
    } else if (e.state === 'sealed'){
      if (e.stateT <= 0){
        const kd = e.def.alien ? 'alien' : 'marine', hk = e.def.hatch || ['sword', 'sword', 'grub']; spawnEnemy(hk[0], e.x - 24, e.y, e.waveRef, kd); spawnEnemy(hk[1], e.x + 24, e.y, e.waveRef, kd); spawnEnemy(hk[2], e.x, e.y - 22, e.waveRef, kd);
        burstParticles(e.x, e.y, 14, '#FF8A3A', 200, 5, { glow: true }); sfx('whoosh', 0.1); e.dead = true;
      }
    }
    return [0, 0];
  },
  /* Attack drone: orbits the giraffe in a tight circle, taking potshots, then dives and detonates. */
  m_drone(e, dt, ux, uy, d, dx, dy){
    if (e.orbDir === undefined){ e.orbDir = Math.random() < 0.5 ? 1 : -1; e.orbR = rand(120, 180); e.orbA = Math.atan2(-dy, -dx); e.life = rand(6, 8); e.shotT = rand(0.6, 1.4); }
    e.life -= dt; e.shotT -= dt; e.stateT -= dt; let mx = 0, my = 0;
    if (e.state === 'idle'){
      e.orbA += e.orbDir * 1.7 * dt;
      const tx = P.x + Math.cos(e.orbA) * e.orbR, ty = P.y + Math.sin(e.orbA) * e.orbR, ddx = tx - e.x, ddy = ty - e.y, dd = hyp(ddx, ddy) || 1, sp = Math.min(e.spdE * 1.8, dd * 6);
      mx = ddx / dd * sp; my = ddy / dd * sp; e.ang = Math.atan2(uy, ux);
      if (e.shotT <= 0 && d < 400){ e.shotT = rand(1.3, 1.9); fireBullet(e, leadAim(e, 360), 360, 0.35, '#FF7A5A', 3.4); }
      if (e.life <= 0){ e.state = 'wind'; e.stateT = 0.4; }
    } else if (e.state === 'wind'){
      e.ang = Math.atan2(uy, ux);
      if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.75; e.dashVX = ux * 480; e.dashVY = uy * 480; }
    } else {
      mx = e.dashVX; my = e.dashVY;
      if (e.stateT <= 0 || d < e.r + P.r + 6){ hostileBlast(e.x, e.y, 54, e.dmg * 0.8, '#FF7A5A', { source: e }); e.dead = true; }
    }
    return [mx, my];
  },
  /* Vanguard lancer: not a shooter. It circles at a distance, then braces and lunges the length of a line that is
     painted on the ground (half a second of warning), and is left stumbling afterwards. Step off the line. */
  m_lancer(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const face = Math.atan2(uy, ux);
    if (e.strafe === undefined) e.strafe = Math.random() < 0.5 ? 1 : -1;
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, face, 6 * dt);
      const dir = d > 360 ? 1 : d < 220 ? -0.8 : 0;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.9 * e.strafe; my = uy * e.spdE * dir + ux * e.spdE * 0.9 * e.strafe;
      if (e.stateT <= 0 && d < 580){
        e.state = 'wind'; e.stateT = 0.55; e.lockA = Math.atan2(P.y + P.vy * 0.3 - e.y, P.x + P.vx * 0.3 - e.x);
        addBeam(e.x, e.y, e.x + Math.cos(e.lockA) * 430, e.y + Math.sin(e.lockA) * 430, 34, 0.55, 0.06, 0, e.def.pale || '#FF8A2A', { owner: e });
      }
    } else if (e.state === 'wind'){
      e.ang = e.lockA;
      if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.45; e.dashVX = Math.cos(e.lockA) * 800; e.dashVY = Math.sin(e.lockA) * 800; sfx('whoosh', 0.1); }
    } else if (e.state === 'dash'){
      mx = e.dashVX; my = e.dashVY; e.ang = e.lockA;
      if (e.stateT <= 0){ e.state = 'recover'; e.stateT = 0.9; }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.0, 1.9); e.strafe *= -1; }
    return [mx, my];
  },
  /* Shock trooper: no gun at all. It runs straight at you, and once it is close it winds up (a red wedge shows exactly
     where the swing will land) and strikes twice in a row, then stands panting for a moment. Sidestep, then hit it. */
  m_brawler(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const face = Math.atan2(uy, ux);
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, face, 7 * dt);
      const w = Math.sin(e.anim * 0.9 + (e.jSeed || (e.jSeed = Math.random() * 9)));
      mx = ux * e.spdE * 1.15 + (-uy) * e.spdE * 0.35 * w; my = uy * e.spdE * 1.15 + ux * e.spdE * 0.35 * w;
      if (d < 125 && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.42; e.swings = 2; }
    } else if (e.state === 'wind'){
      e.ang = turnTo(e.ang, face, 3 * dt); mx = ux * e.spdE * 0.25; my = uy * e.spdE * 0.25;
      if (e.stateT <= 0){
        hostileSwing(e, 112, 0.95, e.dmg, 90); e.swings--;
        if (e.swings > 0) e.stateT = 0.3; else { e.state = 'recover'; e.stateT = 0.9; }
      }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.6, 1.2); }
    return [mx, my];
  },
  /* Combat engineer: hangs back and builds sentry turrets (two at a time). Kill it and the turrets stop being replaced. */
  m_eng(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    e.turrets = (e.turrets || []).filter(t => !t.dead);
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt);
    if (e.state === 'idle'){
      const dir = d < 300 ? -1 : d > 480 ? 0.6 : 0;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.3; my = uy * e.spdE * dir + ux * e.spdE * 0.3;
      if (e.stateT <= 0){ if (e.turrets.length < 2){ e.state = 'wind'; e.stateT = 1.3; } else e.stateT = 1.5; }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){
        const a = Math.atan2(uy, ux), t = spawnEnemy('turret', e.x + Math.cos(a) * 56, e.y + Math.sin(a) * 56, e.waveRef, e.def.alien ? 'alien' : 'marine');
        if (t) e.turrets.push(t);
        e.state = 'idle'; e.stateT = rand(4, 5.5);
      }
    }
    return [mx, my];
  },
  /* the turret the engineer builds: bolted down, swivels, fires two-round bursts, and packs itself up after 14 s */
  m_turret(e, dt, ux, uy, d){
    if (e.life === undefined) e.life = e.def.life || 14;
    e.life -= dt;
    if (e.life <= 0){ burstParticles(e.x, e.y, 8, '#FFE080', 160, 4, { glow: true }); e.dead = true; return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); e.stateT -= dt;
    if (e.state === 'idle'){ if (e.stateT <= 0 && d < 540){ e.state = 'burst'; e.shots = 2; e.stateT = 0.12; } }
    else if (e.stateT <= 0){
      fireBullet(e, e.ang, 470, 0.45, '#FFE080'); e.shots--; e.stateT = 0.13;
      if (e.shots <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.0); }
    }
    return [0, 0];
  },
  /* Field medic: stays out of the fight and heals the most badly hurt marine nearby, in a visible green beam.
     Weak on purpose: it is the one to kill first. */
  m_medic(e, dt, ux, uy, d){
    e.healTgtT = Math.max(0, (e.healTgtT || 0) - dt);
    let best = null, bf = 0.95, mx = 0, my = 0;
    const near = enemiesNear(e.x, e.y, 340);
    for (let i = 0; i < near.length; i++){ const o = near[i]; if (o === e || o.dead || o.untarg || o.def.medic || o.def.turret) continue; const f = o.hp / o.maxHp; if (f < bf){ bf = f; best = o; } }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt);
    if (best){
      const bx = best.x - e.x, by = best.y - e.y, bd = hyp(bx, by) || 1;
      if (bd > 130){ mx = bx / bd * e.spdE; my = by / bd * e.spdE; }
      else { best.hp = Math.min(best.maxHp, best.hp + best.maxHp * 0.10 * dt * (best.big ? 0.2 : 1)); e.healTgt = best; e.healTgtT = 0.2; if (Math.random() < dt * 8) addParticle(best.x + rand(-8, 8), best.y - 6, 0, -30, 2.4, 0.6, '#7CFFB0', { glow: true }); }
    }
    if (d < 250){ mx -= ux * e.spdE * 0.9; my -= uy * e.spdE * 0.9; }
    else if (!best && d > 420){ mx += ux * e.spdE * 0.5; my += uy * e.spdE * 0.5; }
    return [mx, my];
  },
  /* Siege breaker: slow and enormous. It walks you down, rears up (a ring on the ground shows where the fist will land),
     smashes it down, and the ground ripples outward a moment later in a wider ring. Then it needs a breather. */
  m_crusher(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const face = Math.atan2(uy, ux);
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, face, 2.2 * dt);
      mx = ux * e.spdE * 0.75; my = uy * e.spdE * 0.75;
      if (d < 175 && e.stateT <= 0){
        e.state = 'wind'; e.stateT = 0.85; e.sx = e.x + Math.cos(e.ang) * 95; e.sy = e.y + Math.sin(e.ang) * 95;
        addMarker(e.sx, e.sy, 120, 0.85, e.def.pale || '#FFB040', null, { owner: e });
      }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){
        const dmg = e.dmg, col = e.def.pale || '#FFB040', sx = e.sx, sy = e.sy;
        hostileBlast(sx, sy, 120, dmg * 1.3, col, { kb: 1, shake: 10, source: e });
        addMarker(sx, sy, 205, 0.3, '#FFFFFF', m => hostileBlast(m.x, m.y, 205, dmg * 0.6, col, { shake: 6 }));
        e.state = 'recover'; e.stateT = 1.1;
      }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.8, 1.5); }
    return [mx, my];
  },
  /* Blade carrier: a sword instead of a gun. It runs in on a weaving line and, once it is within reach, draws back (a
     wedge shows the first cut), lunges through it, and follows with a wide backhand sweep before it lowers the blade. */
  m_swordsman(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const face = Math.atan2(uy, ux);
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, face, 8 * dt);
      const w = Math.sin(e.anim * 1.1 + (e.jSeed || (e.jSeed = Math.random() * 9)));
      mx = ux * e.spdE * 1.25 + (-uy) * e.spdE * 0.5 * w; my = uy * e.spdE * 1.25 + ux * e.spdE * 0.5 * w;
      if (d < 190 && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.36; }
    } else if (e.state === 'wind'){
      e.ang = turnTo(e.ang, face, 4 * dt); mx = -ux * e.spdE * 0.2; my = -uy * e.spdE * 0.2;
      if (e.stateT <= 0){ const gap = hyp(P.x - e.x, P.y - e.y), run = clamp(gap - 30, 60, 160) / 0.16;     /* the lunge closes most of the gap and stops in front of her, never through her */
        e.state = 'dash'; e.stateT = 0.16; e.dashVX = Math.cos(e.ang) * run; e.dashVY = Math.sin(e.ang) * run; }
    } else if (e.state === 'dash'){
      mx = e.dashVX; my = e.dashVY;
      if (e.stateT <= 0){ hostileSwing(e, 125, 0.7, e.dmg, 70); e.state = 'back'; e.stateT = 0.22; }
    } else if (e.state === 'back'){
      e.ang = turnTo(e.ang, face, 10 * dt);
      if (e.stateT <= 0){ hostileSwing(e, 118, 1.5, e.dmg * 0.8, 60); e.state = 'recover'; e.stateT = 0.8; }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.5, 1.1); }
    return [mx, my];
  },
  /* Blade whirl: it rushes in, braces, then spins like a saw: for a second and a half it chases her with a ring of fire blades
     cutting all round it (the ring is drawn), and then it staggers, dizzy, in the open. Stay out of the ring. */
  m_whirler(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    if (e.state === 'idle'){
      e.ang = Math.atan2(uy, ux); mx = ux * e.spdE * 1.1; my = uy * e.spdE * 1.1;
      if (d < 300 && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.45; }
    } else if (e.state === 'wind'){
      e.ang += dt * 9;
      if (e.stateT <= 0){ e.state = 'spin'; e.stateT = 1.5; e.swingT = 0.1; }
    } else if (e.state === 'spin'){
      e.ang += dt * 16; mx = ux * e.spdE * 0.95; my = uy * e.spdE * 0.95; e.swingT -= dt;
      if (e.swingT <= 0){ e.swingT = 0.3; hostileSwing(e, 105, 3.3, e.dmg * 0.6, 55); }
      if (e.stateT <= 0){ e.state = 'recover'; e.stateT = 1.0; }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.7, 1.4); }
    return [mx, my];
  },
  /* Magma maw: a worm that hunts from under the ground. It sinks out of sight (nothing can hit it, and it hits nothing), tunnels
     to her, marks the spot with a ring, and erupts there; then it lies stunned in the open. Step out of the ring. */
  m_burrower(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    const under = e.state === 'burrow' || e.state === 'wind';
    e.untarg = under; if (under) e.atkCd = Math.max(e.atkCd, 0.3);
    if (e.state === 'idle'){
      e.ang = Math.atan2(uy, ux); mx = ux * e.spdE * 0.6; my = uy * e.spdE * 0.6;
      if (e.stateT <= 0){ e.state = 'burrow'; e.stateT = rand(1.6, 2.4); sfx('whoosh', 0.05); }
    } else if (e.state === 'burrow'){
      e.ang = Math.atan2(uy, ux); mx = ux * e.spdE * 1.7; my = uy * e.spdE * 1.7;
      if (e.stateT <= 0 || d < 150){ e.state = 'wind'; e.stateT = 0.75; e.sx = P.x; e.sy = P.y; addMarker(e.sx, e.sy, 100, 0.75, e.def.pale || '#FF8A1E', null, { owner: e }); }
    } else if (e.state === 'wind'){
      const gx = e.sx - e.x, gy = e.sy - e.y, gd = hyp(gx, gy) || 1, sp = Math.min(e.spdE * 2.6, gd / Math.max(dt, 0.016));
      mx = gx / gd * sp; my = gy / gd * sp;
      if (e.stateT <= 0){ e.x = e.sx; e.y = e.sy; e.untarg = false; hostileBlast(e.sx, e.sy, 100, e.dmg * 1.3, e.def.pale || '#FF8A1E', { kb: 1, shake: 9, source: e }); e.state = 'recover'; e.stateT = 1.3; }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.8, 1.4); }
    e.untarg = e.state === 'burrow' || e.state === 'wind';          /* decided by the state it ends the frame in, so it is never hittable for a frame while buried */
    if (e.untarg) e.atkCd = Math.max(e.atkCd, 0.3);
    return [mx, my];
  },
  /* Shadow operative: cloaked and nearly invisible, it works round to the giraffe's back (relative to the way she is
     facing), reveals itself for an instant, and stabs. Being hit uncloaks it. */
  m_cloak(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    if (e.vis === undefined) e.vis = 0.1;
    if (e.revealT > 0) e.revealT -= dt;
    const bx = P.x - Math.cos(P.face) * 180, by = P.y - Math.sin(P.face) * 180;
    if (e.state === 'idle'){
      e.idleT = (e.idleT || 0) + dt;
      const tx = bx - e.x, ty = by - e.y, td = hyp(tx, ty) || 1, side = (tx * -uy + ty * ux) >= 0 ? 1 : -1;
      /* it does not walk through her: it slides round her, keeping its distance, toward the spot behind her */
      let vx = tx / td * 0.5 + (-uy) * side * 0.8 + (d < 210 ? -ux * 0.6 : 0), vy = ty / td * 0.5 + ux * side * 0.8 + (d < 210 ? -uy * 0.6 : 0);
      const vl = hyp(vx, vy) || 1; mx = vx / vl * e.spdE * 0.95; my = vy / vl * e.spdE * 0.95; e.ang = Math.atan2(uy, ux);
      e.vis = approach(e.vis, e.revealT > 0 ? 1 : 0.1, dt * 3);
      const behindHer = (e.x - P.x) * Math.cos(P.face) + (e.y - P.y) * Math.sin(P.face) < 0;   /* only strikes once it is on her blind side */
      if (((td < 70 || (d < 200 && behindHer)) || e.idleT > 5) && e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.4; e.idleT = 0; }
    } else if (e.state === 'wind'){
      e.vis = approach(e.vis, 1, dt * 6); e.ang = Math.atan2(uy, ux);
      if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.3; e.dashVX = ux * 760; e.dashVY = uy * 760; sfx('whoosh', 0.1); }
    } else if (e.state === 'dash'){
      mx = e.dashVX; my = e.dashVY;
      if (e.stateT <= 0){ e.state = 'retreat'; e.stateT = 1.5; }
    } else {
      mx = -ux * e.spdE * 0.8; my = -uy * e.spdE * 0.8; e.vis = approach(e.vis, e.revealT > 0 ? 1 : 0.1, dt * 2);
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.2, 2.0); }
    }
    return [mx, my];
  },
  /* Breacher: sprints at the giraffe with a lit fuse. The blast hurts the marines around it as well, so a breacher
     that is lured into a crowd (or killed in one) does the giraffe's work for her. */
  m_breach(e, dt, ux, uy, d){
    if (e.fuse === undefined) e.fuse = 3.2;
    const before = Math.floor(e.fuse * 2); e.fuse -= dt;
    if (Math.floor(e.fuse * 2) !== before) sfx('click', 0.2);
    e.ang = Math.atan2(uy, ux);
    if (d < e.r + P.r + 14 || e.fuse <= 0){ e.detonated = true; breachBlast(e); e.dead = true; return [0, 0]; }
    return [ux * e.spdE * 1.1, uy * e.spdE * 1.1];
  },

  /* ---- the bosses ---- */
  /* Drill Sergeant: holds the middle distance and runs a cycle -- bark an order (every marine near him gets faster),
     call in drop pods, fire an aimed burst. Kill him before the pods stack up. */
  b_sarge(e, dt, ux, uy, d){
    e.stateT -= dt; e.ang = turnTo(e.ang, Math.atan2(uy, ux), 5 * dt);
    if (e.strafe === undefined){ e.strafe = 1; e.flipT = 2.4; }
    e.flipT -= dt; if (e.flipT <= 0){ e.strafe *= -1; e.flipT = rand(1.8, 3.0); }
    let mx = 0, my = 0;
    if (e.state === 'idle'){
      const dir = d > 360 ? 1 : d < 250 ? -1 : 0;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.55 * e.strafe; my = uy * e.spdE * dir + ux * e.spdE * 0.55 * e.strafe;
      if (e.stateT <= 0){
        e.cycle = (e.cycle || 0) + 1; const k = e.cycle % 3;
        e.state = k === 1 ? 'wind' : k === 2 ? 'pods' : 'burst'; e.stateT = k === 0 ? 0.5 : 0.9; e.shots = e.hp < e.maxHp * 0.5 ? 8 : 5;
      }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){
        const near = enemiesNear(e.x, e.y, 520);
        for (let i = 0; i < near.length; i++) if (!near[i].dead && near[i] !== e && near[i].def.marine) near[i].buffT = 6;
        addText(e.x, e.y - e.r - 20, 'MOVE, MOVE, MOVE!', '#FFB040', 18, true);
        G.blasts.push({ x: e.x, y: e.y, r: 210, life: 0.5, max: 0.5, color: '#FFB040' }); SFX.boss(); addShake(6);
        e.state = 'idle'; e.stateT = rand(1.5, 2.1);
      }
    } else if (e.state === 'pods'){
      if (e.stateT <= 0){
        const n = e.hp < e.maxHp * 0.5 ? 3 : 2;
        for (let k = 0; k < n; k++) spawnEnemy('termite', e.x, e.y, e.waveRef);
        addText(e.x, e.y - e.r - 20, 'DROP PODS INBOUND', '#FF8A3A', 18, true); SFX.boss();
        e.state = 'idle'; e.stateT = rand(1.8, 2.4);
      }
    } else if (e.state === 'burst'){
      if (e.stateT <= 0){
        fireBullet(e, leadAim(e, 540) + rand(-0.06, 0.06), 540, 0.55, '#FFC060', 4.6); sfx('spit', 0.06);
        e.shots--; e.stateT = 0.11;
        if (e.shots <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.0); }
      }
    }
    return [mx, my];
  },
  /* Orbital Spotter: paints the ground and the sky answers. Three patterns in turn -- a line of strikes across her
     path, a ring closing in with one in the middle, and a chain that tracks her every step. Calls snipers as well. */
  b_spotter(e, dt, ux, uy, d){
    e.stateT -= dt; e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
    let mx = 0, my = 0;
    if (e.state === 'idle'){
      const dir = d > 430 ? 1 : d < 330 ? -1 : 0;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.3; my = uy * e.spdE * dir + ux * e.spdE * 0.3;
      if (e.stateT <= 0){ e.cycle = (e.cycle || 0) + 1; e.state = 'wind'; e.stateT = 0.85; }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){
        const mode = e.cycle % 3, dmg = e.dmg, px = clamp(P.x + P.vx * 0.5, 70, ARENA_W - 70), py = clamp(P.y + P.vy * 0.5, 70, ARENA_H - 70);
        const strike = (x, y, dur) => addMarker(clamp(x, 30, ARENA_W - 30), clamp(y, 30, ARENA_H - 30), 78, dur, (e.def.fx || '#7FE8FF'), m => orbitalStrike(m.x, m.y, dmg, e.def.fx));
        if (mode === 0){ const a = Math.atan2(py - e.y, px - e.x) + Math.PI / 2; for (let k = -3; k <= 3; k++) strike(px + Math.cos(a) * k * 100, py + Math.sin(a) * k * 100, 1.05 + Math.abs(k) * 0.13); }
        else if (mode === 1){ for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; strike(px + Math.cos(a) * 170, py + Math.sin(a) * 170, 1.15); } strike(px, py, 1.65); }
        else { for (let k = 0; k < 5; k++) setTimeoutish(() => { if (!e.dead) strike(P.x + P.vx * 0.35, P.y + P.vy * 0.35, 0.95); }, k * 0.45); }
        if (e.cycle % 2 === 0){ spawnEnemy('vulture', e.x + 44, e.y, e.waveRef); spawnEnemy('vulture', e.x - 44, e.y, e.waveRef); }
        SFX.boss(); e.state = 'idle'; e.stateT = rand(3.2, 4.0) * (e.hp < e.maxHp * 0.5 ? 0.75 : 1);
      }
    }
    return [mx, my];
  },
  /* Colossus exosuit: three weapons. A gatling that sweeps a wide arc, a salvo of homing missiles that curve after
     the giraffe, and a jump-slam onto a marked circle (which leaves it briefly helpless). Never the same twice running. */
  b_colossus(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; const face = Math.atan2(uy, ux); e.z = e.z || 0;
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, face, 1.8 * dt);
      const dir = d > 260 ? 1 : 0; mx = Math.cos(e.ang) * e.spdE * 0.6 * dir; my = Math.sin(e.ang) * e.spdE * 0.6 * dir;
      if (e.stateT <= 0){
        const modes = ['gatling', 'salvo', 'slam']; let m; do { m = modes[Math.floor(Math.random() * 3)]; } while (m === e.lastMode);
        e.lastMode = m; e.mode = m; e.state = 'wind'; e.stateT = m === 'slam' ? 0.7 : m === 'salvo' ? 0.8 : 0.95; e.sweepDir = Math.random() < 0.5 ? 1 : -1;
      }
    } else if (e.state === 'wind'){
      e.ang = turnTo(e.ang, face, 3 * dt);
      if (e.stateT <= 0){
        if (e.mode === 'gatling'){ e.state = 'burst'; e.stateT = 2.6; e.fireT = 0; e.sweepA0 = face; }
        else if (e.mode === 'salvo'){ e.state = 'salvo'; e.stateT = 0.9; e.shots = e.hp < e.maxHp * 0.5 ? 9 : 6; e.fireT = 0; }
        else {
          const tx = clamp(P.x + P.vx * 0.8, 60, ARENA_W - 60), ty = clamp(P.y + P.vy * 0.8, 60, ARENA_H - 60);
          e.jx0 = e.x; e.jy0 = e.y; e.jx1 = tx; e.jy1 = ty; e.state = 'air'; e.stateT = e.airT = 1.0; e.untarg = true;
          addMarker(tx, ty, 150, 1.0, '#FF8A3A', null, { owner: e }); sfx('whoosh', 0.1);
        }
      }
    } else if (e.state === 'burst'){
      const p = 1 - e.stateT / 2.6, a = e.sweepA0 + e.sweepDir * (-0.75 + 1.5 * p);
      e.ang = a; e.fireT -= dt;
      if (e.fireT <= 0){ e.fireT = 0.07; fireBullet(e, a + (Math.floor(e.anim * 3) % 2 ? 1 : -1) * 0.05, 470, 0.28, '#FFB040', 3.6); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.0, 2.8); }
    } else if (e.state === 'salvo'){
      e.fireT -= dt;
      if (e.fireT <= 0 && e.shots > 0){
        e.fireT = 0.1; const a = face + (e.shots % 2 ? 1 : -1) * (0.12 + e.shots * 0.055);
        addEProj(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r, Math.cos(a) * 250, Math.sin(a) * 250, 7, e.dmg * 0.8, '#FF6A3A', { home: 1.35, life: 3.6, missile: true });
        e.shots--; sfx('whoosh', 0.06);
      }
      if (e.stateT <= 0 && e.shots <= 0){ e.state = 'idle'; e.stateT = rand(2.0, 2.8); }
    } else if (e.state === 'air'){
      const p = 1 - Math.max(0, e.stateT) / e.airT;
      e.x = lerp(e.jx0, e.jx1, p); e.y = lerp(e.jy0, e.jy1, p); e.z = Math.sin(Math.PI * p) * 110;
      if (e.stateT <= 0){ e.untarg = false; e.z = 0; e.state = 'recover'; e.stateT = 1.3; hostileBlast(e.x, e.y, 150, e.dmg * 1.2, '#FF8A3A', { kb: 1, shake: 14 }); SFX.boss(); }
    } else if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.8, 2.6); }
    return [mx, my];
  },
  /* Gravity Warden: bends space. It drags the giraffe toward it while a spiral of bolts turns outward (the pull
     fights the dodging), then releases in a shove. It also sweeps a rotating beam and seeds gravity mines. */
  b_warden(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0; e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.5 * dt);
    if (e.state === 'idle'){
      const dir = d > 300 ? 1 : d < 200 ? -1 : 0;
      mx = ux * e.spdE * dir * 0.7 + (-uy) * e.spdE * 0.3; my = uy * e.spdE * dir * 0.7 + ux * e.spdE * 0.3;
      if (e.stateT <= 0){ e.cycle = (e.cycle || 0) + 1; e.mode = e.cycle % 3; e.state = 'wind'; e.stateT = 0.85; }
    } else if (e.state === 'wind'){
      if (e.stateT <= 0){
        if (e.mode === 0){ e.state = 'pull'; e.stateT = 3.4; e.spA = 0; e.fireT = 0; }
        else if (e.mode === 1){
          const dir = Math.random() < 0.5 ? 1 : -1, a0 = Math.atan2(P.y - e.y, P.x - e.x) - dir * 0.6;
          e.state = 'sweep'; e.stateT = 3.9;
          addBeam(e.x, e.y, e.x + Math.cos(a0) * 780, e.y + Math.sin(a0) * 780, 26, 0.9, 3.0, e.dmg * 0.9, '#B080FF', {
            owner: e, once: false,
            upd(b){ const a = a0 + dir * Math.max(0, b.t - b.warn) * 1.05; b.x1 = e.x; b.y1 = e.y; b.x2 = e.x + Math.cos(a) * 780; b.y2 = e.y + Math.sin(a) * 780; }
          });
        } else {
          for (let k = 0; k < 4; k++){
            const a = Math.random() * TAU, dd = rand(40, 190), x = clamp(P.x + Math.cos(a) * dd, 40, ARENA_W - 40), y = clamp(P.y + Math.sin(a) * dd, 40, ARENA_H - 40), dmg = e.dmg;
            addMarker(x, y, 84, 1.3 + k * 0.12, '#B080FF', m => { hostileBlast(m.x, m.y, 84, dmg * 0.9, '#B080FF'); hostileZone(m.x, m.y, 70, 5, dmg * 0.35, '#B080FF'); });
          }
          e.state = 'idle'; e.stateT = rand(2.0, 2.8);
        }
      }
    } else if (e.state === 'pull'){
      if (d < 640) pullPlayer(e.x, e.y, 190 + (640 - d) * 0.32, dt);
      e.fireT -= dt;
      if (e.fireT <= 0){ e.fireT = 0.1; e.spA += 0.5; for (let k = 0; k < 3; k++) fireBullet(e, e.spA + k * TAU / 3, 230, 0.32, '#B080FF', 4.4); }
      if (e.stateT <= 0){ hostileBlast(e.x, e.y, 210, e.dmg, '#B080FF', { kb: 130, shake: 12 }); SFX.boss(); e.state = 'idle'; e.stateT = rand(2.0, 2.8); }
    } else if (e.state === 'sweep'){
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.8, 2.6); }
    }
    return [mx, my];
  },
  /* Fleet Admiral (final boss): a gunship that fights in three phases. Strafing runs that carpet the ground with
     bombs, rotating laser crosses, and calls for reinforcements. At two thirds health it raises a shield that
     must be broken (breaking it leaves it stunned); at one third it fights faster with more beams and orbital rain. */
  b_admiral(e, dt, ux, uy, d){
    e.stateT -= dt; let mx = 0, my = 0;
    const hpf = e.hp / e.maxHp, phase = hpf > 0.66 ? 1 : hpf > 0.33 ? 2 : 3;
    if (phase >= 2 && !e.shield2){ e.shield2 = true; e.barrier = e.maxHp * 0.2; addText(e.x, e.y - e.r - 24, 'SHIELDS UP', '#7FE8FF', 20, true); SFX.boss(); screenFlash('#7FE8FF', 0.2, 0.4); }
    if (phase >= 3 && !e.shield3){ e.shield3 = true; e.barrier = e.maxHp * 0.12; addText(e.x, e.y - e.r - 24, 'ALL GUNS!', '#FF6A5A', 20, true); SFX.boss(); screenFlash('#FF6A5A', 0.2, 0.4); }
    const cd = phase === 1 ? 1 : phase === 2 ? 0.8 : 0.62;
    if (e.strafe === undefined) e.strafe = 1;
    if (e.state === 'idle'){
      e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.2 * dt);
      const dir = d > 380 ? 1 : d < 260 ? -1 : 0;
      mx = ux * e.spdE * dir + (-uy) * e.spdE * 0.55 * e.strafe; my = uy * e.spdE * dir + ux * e.spdE * 0.55 * e.strafe;
      if (e.stateT <= 0){
        const modes = phase === 1 ? ['strafe', 'cross', 'call'] : phase === 2 ? ['strafe', 'cross', 'call', 'rain'] : ['strafe', 'cross', 'rain', 'call'];
        let m; do { m = modes[Math.floor(Math.random() * modes.length)]; } while (m === e.lastMode);
        e.lastMode = m; e.mode = m; e.state = 'wind'; e.stateT = 0.9 * cd; e.strafe *= -1;
      }
    } else if (e.state === 'wind'){
      e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
      if (e.stateT <= 0){
        if (e.mode === 'strafe'){
          const a = Math.random() * TAU, ax = clamp(P.x + Math.cos(a) * 640, 60, ARENA_W - 60), ay = clamp(P.y + Math.sin(a) * 640, 60, ARENA_H - 60), bx = clamp(P.x - Math.cos(a) * 640, 60, ARENA_W - 60), by = clamp(P.y - Math.sin(a) * 640, 60, ARENA_H - 60);
          e.ax = ax; e.ay = ay; e.bx = bx; e.by = by; e.state = 'pre'; e.stateT = 1.0 * cd;
          addBeam(ax, ay, bx, by, 60, 1.0 * cd, 0.05, 0, '#FF8A3A', { owner: e });
        } else if (e.mode === 'cross'){
          const n = phase === 3 ? 6 : 4, a0 = Math.random() * TAU, dir = Math.random() < 0.5 ? 1 : -1;
          e.state = 'cross'; e.stateT = 3.6;
          for (let k = 0; k < n; k++) addBeam(e.x, e.y, e.x, e.y, 24, 0.9, 2.7, e.dmg * 0.85, '#FF6A5A', {
            owner: e, once: false,
            upd(b){ const a = a0 + k * TAU / n + dir * Math.max(0, b.t - b.warn) * 1.05; b.x1 = e.x; b.y1 = e.y; b.x2 = e.x + Math.cos(a) * 820; b.y2 = e.y + Math.sin(a) * 820; }
          });
        } else if (e.mode === 'call'){
          const n = phase === 1 ? 2 : 3;
          for (let k = 0; k < n; k++) spawnEnemy('termite', e.x, e.y, e.waveRef);
          spawnEnemy('baboon', e.x + 30, e.y, e.waveRef);
          addText(e.x, e.y - e.r - 24, 'REINFORCEMENTS!', '#FF8A3A', 18, true); SFX.boss(); e.state = 'idle'; e.stateT = rand(2.2, 3.0) * cd;
        } else {
          for (let k = 0; k < 10; k++){ const a = Math.random() * TAU, dd = rand(30, 300), dmg = e.dmg; addMarker(clamp(P.x + Math.cos(a) * dd, 30, ARENA_W - 30), clamp(P.y + Math.sin(a) * dd, 30, ARENA_H - 30), 78, 1.0 + k * 0.09, (e.def.fx || '#7FE8FF'), m => orbitalStrike(m.x, m.y, dmg, e.def.fx)); }
          SFX.boss(); e.state = 'idle'; e.stateT = rand(2.6, 3.4) * cd;
        }
      }
    } else if (e.state === 'pre'){                                          /* flies to the start of the run while the path is shown */
      const tx = e.ax - e.x, ty = e.ay - e.y, td = hyp(tx, ty) || 1, sp = Math.min(900, td * 5);
      mx = tx / td * sp; my = ty / td * sp; e.ang = Math.atan2(e.by - e.ay, e.bx - e.ax);
      if (e.stateT <= 0){ e.state = 'run'; e.stateT = 0.95; e.runT = 0.95; e.bombT = 0; }
    } else if (e.state === 'run'){                                          /* the strafing run: carpet-bombing along the line */
      const p = 1 - Math.max(0, e.stateT) / e.runT;
      e.x = lerp(e.ax, e.bx, p); e.y = lerp(e.ay, e.by, p); e.bombT -= dt;
      if (e.bombT <= 0){ e.bombT = 0.09; const dmg = e.dmg; addMarker(e.x + rand(-30, 30), e.y + rand(-30, 30), 56, 0.55, '#FF8A3A', m => hostileBlast(m.x, m.y, 58, dmg * 0.7, '#FF8A3A')); }
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(2.2, 3.0) * cd; }
    } else if (e.state === 'cross'){
      e.ang += 0.6 * dt;
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.8, 2.6) * cd; }
    }
    return [mx, my];
  }
};
function breachBlast(e){ hostileBlast(e.x, e.y, 112, e.dmg * 1.5, '#FF8A3A', { kb: 1, source: e, hurtEnemies: 0.25, shake: 8 }); }

/* ---------- the roster ---------- */
const MARINE_MUL = { common: { hp: 19.0, dmg: 4.9, spd: 1.5, val: 9.0 }, boss: { hp: 14.0, dmg: 4.2, spd: 1.35, val: 6.0 } };
const MARINE_LOOKS = {
  hyena:       { ai: 'm_rifle',  look: 'rifleman',   color: '#3B5B92', dark: '#162238', pale: '#E8ECF2', kbRes: 0.9 },
  cheetah:     { ai: 'm_jet',    look: 'jumptrooper', color: '#3B5B92', dark: '#162238', pale: '#FF8A2A', kbRes: 1.1 },
  rhino:       { ai: 'm_shield', look: 'riottrooper', color: '#4A6A9E', dark: '#1A2A48', pale: '#7FE8FF', kbRes: 0.3, extra: { shieldArc: 1.0 } },
  termite:     { ai: 'm_pod',    look: 'droppod',    color: '#8A8E98', dark: '#3A3E48', pale: '#FF8A3A', kbRes: 0, hpMul: 0.55, extra: { splitInto: undefined, splitCount: undefined, onSpawn(e){
                    const a = Math.random() * TAU, dd = rand(190, 330);
                    e.x = clamp(P.x + Math.cos(a) * dd, 50, ARENA_W - 50); e.y = clamp(P.y + Math.sin(a) * dd, 50, ARENA_H - 50);
                    e.state = 'fall'; e.stateT = e.fallT = 1.3; e.untarg = true; e.ang = -Math.PI / 2;
                    addMarker(e.x, e.y, 74, 1.3, '#FF8A3A', null, { owner: e, pod: true, fire: !!e.def.alien }); } } },
  grub:        { ai: 'm_drone',  look: 'attackdrone', color: '#C8CCD6', dark: '#3A3E48', pale: '#FF5A4A', kbRes: 1.5 },
  vulture:     { ai: 'm_lancer', look: 'lancer',     color: '#2E4A7A', dark: '#101C34', pale: '#FF8A2A', kbRes: 0.9, extra: { melee: { type: 'line' } } },
  jackal:      { ai: 'm_brawler', look: 'shocktrooper', color: '#3B5B92', dark: '#162238', pale: '#7FE8FF', kbRes: 0.7, extra: { melee: { type: 'cone', range: 112, arc: 0.95 } } },
  warthog:     { ai: 'm_eng',    look: 'engineer',   color: '#D89A3A', dark: '#6A4416', pale: '#FFE080', kbRes: 0.6 },
  baboon:      { ai: 'm_medic',  look: 'medic',      color: '#E8ECF2', dark: '#7A8290', pale: '#4AE07A', kbRes: 1.0, hpMul: 0.7, extra: { medic: true } },
  honeybadger: { ai: 'm_crusher', look: 'siegebreaker', color: '#2A3E66', dark: '#0E1830', pale: '#FFC060', kbRes: 0.12, extra: { melee: { type: 'ring' } } },
  mamba:       { ai: 'm_cloak',  look: 'shadowop',   color: '#1E2A40', dark: '#0A0E18', pale: '#B080FF', kbRes: 1.2, extra: { cloak: true } },
  ember:       { ai: 'm_breach', look: 'breacher',   color: '#5A5E68', dark: '#22262E', pale: '#FF4A3A', kbRes: 1.0, extra: { onDeath(e){ if (!e.detonated){ e.detonated = true; breachBlast(e); } } } },
  lion:        { ai: 'b_sarge',  look: 'sergeant',   color: '#274373', dark: '#0E1A30', pale: '#FF8A2A', title: 'Drill Sergeant Vex' },
  matriarch:   { ai: 'b_spotter', look: 'spotter',   color: '#DDE3EC', dark: '#5A6478', pale: '#7FE8FF', title: 'Captain Reyes' },
  buffalo:     { ai: 'b_colossus', look: 'colossus', color: '#4A5A74', dark: '#1A2434', pale: '#FF8A3A', title: 'The Colossus' },
  crocodile:   { ai: 'b_warden', look: 'warden',     color: '#2A2A48', dark: '#0E0E20', pale: '#B080FF', title: 'The Gravity Warden' },
  wildfire:    { ai: 'b_admiral', look: 'admiral',   color: '#7C8AA4', dark: '#2A3450', pale: '#7FE8FF', title: 'Fleet Admiral Kestrel' }
};
const ETYPES_MARINE = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], mul = base.big ? MARINE_MUL.boss : MARINE_MUL.common, lk = MARINE_LOOKS[id];
  ETYPES_MARINE[id] = Object.assign({}, base, {
    hp: base.hp * mul.hp * (lk.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    color: lk.color, dark: lk.dark, pale: lk.pale, ai: lk.ai, look: lk.look, kbRes: lk.kbRes !== undefined ? lk.kbRes : base.kbRes,
    marine: true, title: base.title ? lk.title : undefined, splitInto: undefined, splitCount: undefined
  }, lk.extra || {});
});
ETYPES_MARINE.turret = { hp: 18 * 19, spd: 0, dmg: 6 * 4.9, r: 14, xp: 4, kbRes: 0, ai: 'm_turret', color: '#8A8E98', dark: '#3A3E48', pale: '#FFE080', blood: '#5A5E68', val: 4, look: 'sentryturret', marine: true, turret: true, life: 14 };
ETYPES_MARINE.sword = Object.assign({}, ETYPES_MARINE.hyena, { ai: 'm_swordsman', look: 'bladeguard', color: '#3E64A0', dark: '#18284A', pale: '#7FE8FF', kbRes: 0.8, hp: ETYPES_MARINE.hyena.hp * 1.3, spd: ETYPES_MARINE.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });
/* the same behaviour functions, reached from the AI switch */
Object.assign(MARINE_AI, {});

const FINAL_BOSS_DMG = 0.65;
function spawnEnemy(type, x, y, wave, kind){
  if (G.enemies.length >= MAX_ENEMIES) return null;
  const w = wave || G.wave || 1;
  const cw3 = chapterOf(w);
  const table = cw3 === DOME_CHAPTER ? ETYPES_DOME : cw3 >= 13 ? marsTableFor(w) : cw3 >= 12 ? ETYPES_A51 : cw3 >= 11 ? ETYPES_GLIM : cw3 >= 10 ? ETYPES_INFERNO : cw3 >= 9 ? ETYPES_VENUS : cw3 === 8 ? ETYPES_MARINE : cw3 === 7 ? ETYPES_SPACE : cw3 === 6 ? ETYPES_CITY : cw3 === 5 ? ETYPES_JUNGLE : cw3 === 4 ? ETYPES_OCEAN : cw3 === 3 ? ETYPES_SWAMP : cw3 === 2 ? ETYPES_FROST : ETYPES;
  const t = cw3 === DOME_CHAPTER ? ETYPES_DOME[type] : cw3 >= 13 ? marsTableFor(w)[type] : cw3 >= 12 ? ETYPES_A51[type] : cw3 >= 11 ? ETYPES_GLIM[type] : cw3 >= 10 ? ETYPES_INFERNO[type] : cw3 >= 9 ? venusDefFor(type, Math.random(), kind) : table[type];     /* chapter 10: fire aliens only, no Marines */     /* chapter 9: aliens, with Marines among them */
  if (!t) return null;
  const sc = cw3 === DOME_CHAPTER ? domeScale(chapterWaveOf(w)) : enemyScale(chapterWaveOf(w));
  const hpMul = t.big ? Math.pow(sc.hp, 0.82) : sc.hp;
  const finalBossMul = (t.big && type === 'wildfire' && ((cw3 >= 8 && cw3 <= 10) || cw3 === 12 || cw3 === 13)) || type === 'iceheart' ? FINAL_BOSS_DMG : 1;
  const easy = cw3 >= 8 && !t.big, hpEase = easy ? CH89_EASE_HP : 1, dmgEase = easy ? CH89_EASE_DMG : 1;     /* the gentler endgame: ordinary enemies only */
  const e = {
    type: type, def: t, x: x, y: y, vx: 0, vy: 0, kx: 0, ky: 0,
    r: t.r, hp: t.hp * hpMul * hpEase, maxHp: t.hp * hpMul * hpEase,
    spd: t.spd * sc.spd, dmg: t.dmg * sc.dmg * 2 * dmgEase * finalBossMul, xp: t.xp, val: t.val || 10,
    kbRes: t.kbRes, ai: t.ai, big: !!t.big, blood: t.blood,
    dead: false, flash: 0, burnDps: 0, burnT: 0, burnAcc: 0,
    stunT: 0, slowT: 0, slowMul: 1, atkCd: 0, hitCd: null,
    state: 'idle', stateT: rand(0.3, 1.6), ang: Math.random() * TAU, anim: Math.random() * 6,
    dashVX: 0, dashVY: 0, waveRef: w, splitInto: t.splitInto, splitCount: t.splitCount,
    spots: null
  };
  G.enemies.push(e);
  if (e.big){ G.bossAlive = true; G.boss = e; }
  if (t.onSpawn) t.onSpawn(e);
  return e;
}

