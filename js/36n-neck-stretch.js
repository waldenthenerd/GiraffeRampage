'use strict';
/* =============================================================================================================================
   36n-neck-stretch.js  --  THE NECK WHIP, ANIMATED. Every kick is a headbutt now: the neck winds back, then lashes out to about three times its
   length along a bending S-curve, cracks like a whip at the end, and springs back. The moment the head lands there is a squash in the body
   (it drops and widens, then rebounds), a ring of dust at the hooves, a puff of shake, and a few ghost frames of the neck and head are left
   along the path (a motion blur). While a Neck Whip card is spinning, the neck is a little longer and swings with it.
   Everything here is presentation: the damage, the range and the cooldown are untouched. At Visual effects "off" it all shuts off.
   drawPlayer() (33-giraffe-art.js) reads GF.neck: { ext, bend, tilt }, draws neckGhostsDraw() under the neck and squashes the body by GF.land.
   ============================================================================================================================= */
const NS = { prevAnim: 0, side: 1, landed: false, ghostT: 0, ghosts: [], vel: 0, boost: 0 };
GF.neck = { ext: 0, bend: 0 };
GF.land = 0;
const NS_REACH = 88;                                           /* how many units longer the neck gets at the top of a lunge (it is 40 at rest) */

/* the lunge as a function of kick progress e (0 to 1): back, snap forward, crack, spring home */
function neckProfile(e){
  if (e < 0.1) return { k: -0.16 * Math.sin(e / 0.1 * Math.PI / 2), w: -0.25 * (e / 0.1) };                         /* wind-up: the neck draws back */
  if (e < 0.3){ const u = (e - 0.1) / 0.2, o = 1 - Math.pow(1 - u, 3); return { k: -0.16 + 1.16 * o, w: -0.25 + 1.25 * Math.sin(u * Math.PI * 0.5) }; }   /* the snap */
  const u = (e - 0.3) / 0.7;                                                                                         /* the recoil, with a little overshoot */
  return { k: Math.max(-0.08, Math.cos(Math.min(1, u) * Math.PI * 0.5) + Math.sin(u * Math.PI * 2.4) * 0.07 * (1 - u)), w: Math.sin(u * Math.PI * 2.2) * 0.9 * (1 - u) };
}
function neckStretchUpdate(dt){
  const G0 = GF.neck, fx = fxLevelNow();
  if (fx <= 0 || P.dead){ G0.ext = 0; G0.bend = 0; GF.land = 0; NS.ghosts.length = 0; NS.prevAnim = 0; return; }
  const anim = P.kickAnim > 0 ? P.kickAnim : 0;
  if (anim > NS.prevAnim + 0.1){ NS.side = -NS.side; NS.landed = false; NS.ghostT = 0; }                              /* a new kick */
  NS.prevAnim = anim;
  /* the Neck Whip card: a longer neck that swings with its arms */
  let boost = 0;
  for (let i = 0; i < P.cards.length; i++){ const c = P.cards[i]; if (c.def && c.def.id === 'neck_whip' && !c.hidden){ boost = 12 + 5 * Math.min(3, c.level || 1) + Math.sin((c.ang || 0) * (c.s ? c.s.arms : 1) * 2) * 8; break; } }
  NS.boost += (boost - NS.boost) * Math.min(1, dt * 6);
  if (anim > 0){
    const e = 1 - anim / 0.30, pr = neckProfile(e);
    G0.ext = pr.k * NS_REACH + NS.boost; G0.bend = pr.w * 30 * NS.side;
    /* ghost frames while the head is travelling */
    NS.ghostT -= dt;
    if (e > 0.08 && e < 0.62 && NS.ghostT <= 0 && !P.dead){ NS.ghostT = 0.022; NS.ghosts.push({ ext: G0.ext, bend: G0.bend, x: P.x, y: P.y, a: P.aim, age: 0, face: P.face }); if (NS.ghosts.length > 6) NS.ghosts.shift(); }
    /* the head lands: squash, dust ring, a nudge of shake */
    if (!NS.landed && e >= 0.3){
      NS.landed = true; GF.land = 1; NS.vel = 0;
      if (G.state === 'playing' || G.attract){
        const key = typeof STEP_DUST !== 'undefined' ? (atmosChapter() === 10 ? '84,70,64' : STEP_DUST[G.biome] || STEP_DUST.savanna) : '190,164,112';
        const by = P.y + 12;
        addParticle(P.x, by, 0, 0, 12, 0.5, 'rgba(' + key + ',0.55)', { shape: 'wake', drag: 0, shrink: false });
        for (let i = 0; i < 14; i++){ const a = i / 14 * TAU + rand(-0.15, 0.15), s = rand(70, 150); addParticle(P.x + Math.cos(a) * 12, by + Math.sin(a) * 6, Math.cos(a) * s, Math.sin(a) * s * 0.55, rand(3, 5.5), rand(0.35, 0.6), 'rgba(' + key + ',0.75)', { shape: 'puff', drag: 3, shrink: false }); }
        try { abilityShake(3.2, P.aim + Math.PI); } catch (e2) {}
        if (typeof neckStretchLanded === 'function') neckStretchLanded();                    /* the ground answers (02d-ground-sounds.js) */
      }
    }
  } else { G0.ext = NS.boost; G0.bend = Math.sin(G.time * 1.3) * NS.boost * 0.12; }
  /* the squash springs back: a damped spring, so it drops, rebounds a little and settles */
  NS.vel += (-GF.land * 190 - NS.vel * 13) * dt; GF.land += NS.vel * dt;
  if (Math.abs(GF.land) < 0.002 && Math.abs(NS.vel) < 0.02){ GF.land = 0; NS.vel = 0; }
  for (let i = NS.ghosts.length - 1; i >= 0; i--){ NS.ghosts[i].age += dt; if (NS.ghosts[i].age > 0.2) NS.ghosts.splice(i, 1); }
}
(function(){ const f = giraffeFxUpdate; giraffeFxUpdate = function(dt){ f(dt); neckStretchUpdate(dt); }; })();

/* the neck as a curve: shoulder S, head H, bent sideways by `bend` in the middle. Returns the sampled points and the head's turn. */
function neckCurve(shx, shy, a, len, bend, n){
  const px = -Math.sin(a), py = Math.cos(a), hx = shx + Math.cos(a) * len, hy = shy + Math.sin(a) * len;
  const cx = (shx + hx) / 2 + px * bend, cy = (shy + hy) / 2 + py * bend, pts = [];
  for (let i = 0; i <= n; i++){
    const t = i / n, u = 1 - t, x = u * u * shx + 2 * u * t * cx + t * t * hx, y = u * u * shy + 2 * u * t * cy + t * t * hy;
    const dx = 2 * u * (cx - shx) + 2 * t * (hx - cx), dy = 2 * u * (cy - shy) + 2 * t * (hy - cy), l = Math.hypot(dx, dy) || 1;
    pts.push({ x: x, y: y, nx: -dy / l, ny: dx / l, t: t });
  }
  let da = Math.atan2(hy - cy, hx - cx) - a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
  return { pts: pts, hx: hx, hy: hy, turn: da };
}
/* the neck's outline from those points: wide at the shoulder (8.5), narrow at the head (5.5) */
function neckPath(ctx, pts){
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++){ const p = pts[i], w = 8.5 - 3 * p.t; if (i) ctx.lineTo(p.x + p.nx * w, p.y + p.ny * w); else ctx.moveTo(p.x + p.nx * w, p.y + p.ny * w); }
  for (let i = pts.length - 1; i >= 0; i--){ const p = pts[i], w = 8.5 - 3 * p.t; ctx.lineTo(p.x - p.nx * w, p.y - p.ny * w); }
  ctx.closePath();
}
/* the ghost frames: pale copies of the neck and head left along the path of the lunge */
function neckGhostsDraw(ctx, coat){
  if (!NS.ghosts.length || fxLevelNow() <= 0) return;
  ctx.save();
  for (let i = 0; i < NS.ghosts.length; i++){
    const g = NS.ghosts[i], k = 1 - g.age / 0.2; if (k <= 0) continue;
    const shx = g.x + Math.cos(g.a) * 11, shy = g.y + Math.sin(g.a) * 11, cv = neckCurve(shx, shy, g.a, 40 + g.ext, g.bend, 8);
    ctx.globalAlpha = 0.3 * k * k; ctx.fillStyle = coat; neckPath(ctx, cv.pts); ctx.fill();
    ctx.save(); ctx.translate(cv.hx, cv.hy); ctx.rotate(g.a + cv.turn * 0.6); ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
