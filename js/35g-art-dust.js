'use strict';
/* Enemy art, Chapter 13: the dust aliens (DUST_DRAW). */
/* Chapter 13: the dust aliens. Twelve small species and three bosses, no two built alike: crabs, lizards, long-legged runners, beetles, a rock golem, a frog,
   a mantis, a whirlwind, a worm, a swollen mother, a mite and a puffball of spores. None of them carries anything. Drawn facing +x like every enemy.
   Shared look: umber shells with a darker rim, pale sand/bone highlights, and a teal "alien" accent (eyes, gems, glowing cores) that pops against the red ground. */
const DU_TEAL = '#35D8C4', DU_TEAL_L = '#B6FFF0', DU_EYE_DK = '#1C0E08';
const DU_ROCK = [1, 0.84, 1.1, 0.9, 1.14, 0.82, 1.06, 0.93, 1.12, 0.87, 1.03, 0.8];
const DU_MIXC = {};
function du_mix(a, c, t){ const k = a + c + t; return DU_MIXC[k] || (DU_MIXC[k] = blendHex(a, c, t)); }
function du_li(a, t){ return du_mix(a, '#FFEBC8', t); }     /* warm sand highlight */
function du_sh(a, t){ return du_mix(a, '#2A0C06', t); }     /* warm umber shade */
function du_ln(ctx, pts, w, c){ ctx.lineJoin = 'round'; lkLN(ctx, pts, w, c); ctx.lineJoin = 'miter'; }
function du_eye(ctx, x, y, r, c){ fillCircle(ctx, x, y, r * 1.35, DU_EYE_DK); fillCircle(ctx, x, y, r, c || DU_TEAL); fillCircle(ctx, x + r * 0.15, y, r * 0.42, DU_EYE_DK); fillCircle(ctx, x - r * 0.35, y - r * 0.4, r * 0.3, '#FFFFFF'); }
function du_rock(ctx, x, y, n, r, sy, rot, seed, c){
  ctx.fillStyle = c; ctx.beginPath();
  for (let k = 0; k < n; k++){ const an = rot + k / n * TAU, rr = r * DU_ROCK[(k + seed) % 12]; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * sy); }
  ctx.closePath(); ctx.fill();
}
/* a long shard: base centre (x,y), pointing along (dx,dy) (unit), half width hw */
function du_shard(ctx, x, y, dx, dy, len, hw, c){ lkTRI(ctx, x - dy * hw, y + dx * hw, x + dx * len, y + dy * len, x + dy * hw, y - dx * hw, c); }

const DUST_DRAW = {
  dust_scuttler(ctx, e, b, dk, bob, wind, d){                                       /* a crab with snapping claws */
    const s = e.r / 14, a = e.anim * 2, lunge = e.state === 'lunge', o = lunge ? 5 : 2;
    const hi = du_li(b, 0.42), sh = du_sh(b, 0.3);
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){                        /* four jointed walking legs a side */
      const w = Math.sin(a + i * 1.7 + (sd > 0 ? 0 : 2.6)) * 2.4 * s, x0 = (5.5 - i * 3.8) * s, fw = i < 2 ? 1 : -1;
      du_ln(ctx, [x0, bob + sd * 5 * s, x0 + fw * 3 * s + w, bob + sd * 11.5 * s, x0 + fw * 6 * s - w * 0.6, bob + sd * 16 * s], 2 * s, dk);
    }
    for (const k of [-1, 0, 1]) lkTRI(ctx, -10 * s, bob + k * 3.6 * s - 1.8 * s, -15.5 * s, bob + k * 4.4 * s, -10 * s, bob + k * 3.6 * s + 1.8 * s, dk);   /* rear spikes */
    lkOV(ctx, 0, bob, 12.8 * s, 9.8 * s, dk); lkOV(ctx, 0, bob, 11.2 * s, 8.4 * s, b);
    lkOV(ctx, -1.4 * s, bob - 0.6 * s, 8.8 * s, 6 * s, hi); lkOV(ctx, -1.4 * s, bob, 8 * s, 5.2 * s, b);
    lkLN(ctx, [-10 * s, bob, 6 * s, bob], 1.2 * s, sh); lkCV(ctx, 2.6 * s, bob - 6 * s, 6.4 * s, bob, 2.6 * s, bob + 6 * s, 1.2 * s, sh);
    for (const [px, py] of [[-4, -3.4], [-4, 3.4], [-8, -1.8], [-8, 1.8], [0, -2]]) fillCircle(ctx, px * s, bob + py * s, 1.15 * s, hi);
    lkOV(ctx, -6 * s, bob - 4.4 * s, 4 * s, 1.5 * s, du_li(b, 0.6), -0.3);
    for (const sd of [-1, 1]){
      lkLN(ctx, [8.6 * s, bob + sd * 1.6 * s, 12.6 * s, bob + sd * 2.6 * s], 1.4 * s, dk); du_eye(ctx, 13.4 * s, bob + sd * 2.8 * s, 1.5 * s);   /* eye stalks */
      const ex = 12.5 * s, ey = bob + sd * (11 + o * 0.35) * s, px = 15.4 * s, py = bob + sd * (9.6 + o * 0.12) * s;
      du_ln(ctx, [7 * s, bob + sd * 5.6 * s, ex, ey, px, py], 3.2 * s, dk); fillCircle(ctx, ex, ey, 1.7 * s, hi);
      lkOV(ctx, px, py, 5.4 * s, 4 * s, dk, sd * 0.3); lkOV(ctx, px, py, 4.4 * s, 3.1 * s, b, sd * 0.3); lkOV(ctx, px - 0.6 * s, py - sd * 0.9 * s, 2.8 * s, 1.1 * s, hi, sd * 0.3);
      lkTRI(ctx, px + 1.4 * s, py + sd * 3.6 * s, px + 6.4 * s, py + sd * (3.6 + o * 0.55) * s, px + 2.6 * s, py + sd * 0.6 * s, dk);
      lkTRI(ctx, px + 1.4 * s, py + sd * 0.4 * s, px + 6.4 * s, py - sd * 0.2 * s, px + 1.4 * s, py - sd * 2.6 * s, dk);
      lkTRI(ctx, px + 3 * s, py + sd * 3.2 * s, px + 5.6 * s, py + sd * (3.4 + o * 0.5) * s, px + 3.4 * s, py + sd * 1.6 * s, hi);
      lkTRI(ctx, px + 3 * s, py + sd * 0.2 * s, px + 5.6 * s, py - sd * 0.1 * s, px + 3 * s, py - sd * 1.4 * s, hi);
    }
  },
  dust_skink(ctx, e, b, dk, bob, wind, d){                                          /* a banded lizard that swims through the sand */
    const s = e.r / 14, a = e.anim * 1.6;
    if (e.state === 'dig'){
      ctx.globalAlpha = 0.2; lkOV(ctx, -6 * s, bob, 18 * s, 8.4 * s, '#4A1C0E'); ctx.globalAlpha = 0.6;
      lkOV(ctx, -5 * s, bob, 14 * s, 7 * s, '#C8A870'); lkOV(ctx, 3 * s, bob, 8.4 * s, 4.4 * s, '#E6CC98'); lkOV(ctx, 7 * s, bob - 1 * s, 3.6 * s, 1.6 * s, '#FFF0C8');
      ctx.globalAlpha = 0.75; lkLN(ctx, [-16 * s, bob - 2 * s, -8 * s, bob - 3.6 * s, 0, bob - 3.2 * s], 1.4 * s, '#8A6A3A'); lkLN(ctx, [-16 * s, bob + 2 * s, -8 * s, bob + 3.6 * s, 0, bob + 3.2 * s], 1.4 * s, '#8A6A3A');
      for (let k = 0; k < 4; k++){ const t = (e.anim * 0.9 + k * 0.25) % 1; fillCircle(ctx, (10 - t * 22) * s, bob + Math.sin(k * 2.3 + e.anim) * 6 * s, (1.5 - t * 0.6) * s, '#F2DCA8'); }
      ctx.globalAlpha = 1; return;
    }
    const tail = Math.sin(a) * 4 * s, hi = du_li(b, 0.4), sh = du_sh(b, 0.3);
    du_ln(ctx, [-6 * s, bob, -16 * s, bob + tail, -26 * s, bob - tail * 0.8], 4.4 * s, dk); du_ln(ctx, [-6 * s, bob, -16 * s, bob + tail, -26 * s, bob - tail * 0.8], 2.8 * s, b);
    du_ln(ctx, [-20 * s, bob + tail * 0.4, -26 * s, bob - tail * 0.8], 1.2 * s, du_li(b, 0.45));
    ctx.strokeStyle = dk; ctx.lineWidth = 1 * s; ctx.lineCap = 'round'; ctx.beginPath();
    for (const [lx, sd, ph] of [[5, -1, 0], [5, 1, 3], [-4, -1, 3], [-4, 1, 0]]){
      const w = Math.sin(a * 2 + ph) * 2.4 * s, kx = (lx + 1.4) * s + w * 0.5, fx = (lx + 4) * s + w, fy = bob + sd * 11 * s;
      ctx.moveTo(fx, fy); ctx.lineTo(fx + 2.4 * s, fy + sd * 1.2 * s); ctx.moveTo(fx, fy); ctx.lineTo(fx + 1.6 * s, fy + sd * 2.4 * s); ctx.moveTo(fx, fy); ctx.lineTo(fx - 0.6 * s, fy + sd * 2.6 * s);
    }
    ctx.stroke(); ctx.lineCap = 'butt';
    for (const [lx, sd, ph] of [[5, -1, 0], [5, 1, 3], [-4, -1, 3], [-4, 1, 0]]){ const w = Math.sin(a * 2 + ph) * 2.4 * s; du_ln(ctx, [lx * s, bob + sd * 3.6 * s, (lx + 1.4) * s + w * 0.5, bob + sd * 8 * s, (lx + 4) * s + w, bob + sd * 11 * s], 2.2 * s, dk); }
    lkOV(ctx, 0, bob, 12.4 * s, 5.8 * s, dk); lkOV(ctx, 0, bob, 11 * s, 4.7 * s, b); lkOV(ctx, -0.6 * s, bob - 1.8 * s, 9 * s, 1.6 * s, hi);
    lkLN(ctx, [-10 * s, bob, 10 * s, bob], 1.3 * s, sh);
    for (let k = 0; k < 4; k++){ lkOV(ctx, (-6 + k * 4.4) * s, bob, 1.1 * s, 3.8 * s, d.pale); fillCircle(ctx, (-6 + k * 4.4) * s, bob - 3 * s, 0.7 * s, dk); fillCircle(ctx, (-6 + k * 4.4) * s, bob + 3 * s, 0.7 * s, dk); }
    lkOV(ctx, 11.6 * s, bob, 5.6 * s, 3.8 * s, dk); lkOV(ctx, 11.8 * s, bob, 4.8 * s, 3.1 * s, b); lkTRI(ctx, 14.6 * s, bob - 2.4 * s, 19.6 * s, bob, 14.6 * s, bob + 2.4 * s, dk); lkTRI(ctx, 14.6 * s, bob - 1.8 * s, 18.4 * s, bob, 14.6 * s, bob + 1.8 * s, b);
    lkOV(ctx, 9.6 * s, bob - 2.8 * s, 1.5 * s, 0.9 * s, dk, -0.5); lkOV(ctx, 9.6 * s, bob + 2.8 * s, 1.5 * s, 0.9 * s, dk, 0.5);
    du_eye(ctx, 12.6 * s, bob - 2.2 * s, 1.2 * s); du_eye(ctx, 12.6 * s, bob + 2.2 * s, 1.2 * s);
    if (Math.sin(a * 1.7) > 0.5) du_ln(ctx, [19.4 * s, bob, 22.4 * s, bob, 24 * s, bob - 1.2 * s, 22.4 * s, bob, 24 * s, bob + 1.2 * s], 0.8 * s, '#E0503A');
  },
  dust_strider(ctx, e, b, dk, bob, wind, d){                                        /* a spindly runner on six long legs */
    const s = e.r / 14, a = e.anim * 1.4, dash = e.state === 'dash', hi = du_li(b, 0.38), sh = du_sh(b, 0.32);
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){
      const ph = Math.sin(a + i * 1.2 + (sd > 0 ? 0 : 1.6)) * (dash ? 1 : 3) * s, bx = (6 - i * 5.4) * s, kx = bx + (3 - i * 0.6) * s + ph, ky = bob + sd * 12 * s, fx = bx + (1 + (i === 0 ? 3 : i === 2 ? -3 : 0)) * s - ph, fy = bob + sd * 22.5 * s;
      du_ln(ctx, [bx, bob + sd * 3 * s, kx, ky, fx, fy], 1.9 * s, dk); fillCircle(ctx, kx, ky, 1.6 * s, hi); fillCircle(ctx, fx, fy, 1 * s, dk);
    }
    lkTRI(ctx, -14 * s, bob - 1.8 * s, -20 * s, bob, -14 * s, bob + 1.8 * s, dk);
    lkOV(ctx, -7 * s, bob, 10.4 * s, 5.4 * s, dk); lkOV(ctx, -7 * s, bob, 9.2 * s, 4.4 * s, hi);
    for (let k = 0; k < 4; k++){ const x = (-12 + k * 3.4) * s; lkOV(ctx, x, bob, 1.1 * s, 4.2 * s, b); }
    lkLN(ctx, [-15 * s, bob, -2 * s, bob], 1 * s, sh);
    lkOV(ctx, 3.4 * s, bob, 5.4 * s, 4.4 * s, dk); lkOV(ctx, 3.4 * s, bob, 4.4 * s, 3.5 * s, b); lkOV(ctx, 2.8 * s, bob - 1 * s, 2.6 * s, 1 * s, hi);
    lkOV(ctx, 9 * s, bob, 4.4 * s, 3.8 * s, dk); lkOV(ctx, 9 * s, bob, 3.6 * s, 3 * s, b);
    const aw = Math.sin(a * 1.6) * 1.4 * s;
    for (const sd of [-1, 1]){
      du_ln(ctx, [11.6 * s, bob + sd * 1.2 * s, 14.6 * s, bob + sd * 2.8 * s, 17.4 * s, bob + sd * 1 * s], 1.5 * s, dk);
      du_ln(ctx, [10.4 * s, bob + sd * 1.8 * s, 15 * s, bob + sd * (5 + aw) * s, 20 * s, bob + sd * (6.4 + aw) * s], 0.8 * s, dk);
      du_eye(ctx, 10.2 * s, bob + sd * 2.6 * s, 1.3 * s);
    }
    if (wind){ csGlow(ctx, 8 * s, bob, 22 * s, d.pale, 0.4); ringPath(ctx, 4 * s, bob, 17 * s, 1.5, d.pale, 0.55); }
  },
  dust_beetle(ctx, e, b, dk, bob, wind, d){                                         /* a domed, plated beetle with horns */
    const s = e.r / 14, a = e.anim * 1.3, hi = du_li(b, 0.3), sh = du_sh(b, 0.35), pl = du_mix(b, d.pale, 0.22);
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 3)) * 2.6 * s, x0 = (5 - i * 6) * s, kx = x0 + 1.5 * s + w * 0.6, fx = x0 + (i === 0 ? 3 : i === 2 ? -3 : 0) * s + w;
      du_ln(ctx, [x0, bob + sd * 7 * s, kx, bob + sd * 11.5 * s, fx, bob + sd * 15.4 * s], 2.8 * s, dk); lkTRI(ctx, fx - 1.2 * s, bob + sd * 14.8 * s, fx + 0.4 * s, bob + sd * 18 * s, fx + 1.4 * s, bob + sd * 14.6 * s, dk);
    }
    lkOV(ctx, -1 * s, bob, 14.6 * s, 11.6 * s, dk); lkOV(ctx, -1 * s, bob, 13 * s, 10.2 * s, b);
    lkOV(ctx, -1 * s, bob - 5.2 * s, 12 * s, 4.6 * s, hi); lkOV(ctx, -1 * s, bob + 5.2 * s, 12 * s, 4.6 * s, hi);
    lkOV(ctx, 0, bob - 5.6 * s, 11 * s, 3.8 * s, b); lkOV(ctx, 0, bob + 5.6 * s, 11 * s, 3.8 * s, b);
    lkLN(ctx, [-13.6 * s, bob, 10 * s, bob], 1.5 * s, dk);
    for (const k of [-1, 1]){
      lkLN(ctx, [-11 * s, bob + k * 3.4 * s, -1 * s, bob + k * 4 * s, 8 * s, bob + k * 2.8 * s], 1.1 * s, sh);
      lkLN(ctx, [-9 * s, bob + k * 7.2 * s, -1 * s, bob + k * 8 * s, 6 * s, bob + k * 6.2 * s], 1.1 * s, sh);
      lkOV(ctx, -5 * s, bob + k * 5.4 * s, 4.2 * s, 1.1 * s, du_li(b, 0.6), k * -0.15);
      for (const px of [-7, 0, 6]) fillCircle(ctx, px * s, bob + k * 9 * s, 0.9 * s, sh);
    }
    ctx.strokeStyle = pl; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.ellipse(-1 * s, bob, 12.6 * s, 9.8 * s, 0, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-1 * s, bob, 12.6 * s, 9.8 * s, 0, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
    lkOV(ctx, 10.6 * s, bob, 5.4 * s, 7.4 * s, dk); lkOV(ctx, 10.4 * s, bob, 4.4 * s, 6.4 * s, hi); lkOV(ctx, 10.2 * s, bob, 3.2 * s, 4.6 * s, b);
    lkCV(ctx, 8.6 * s, bob - 5 * s, 11 * s, bob, 8.6 * s, bob + 5 * s, 1 * s, sh);
    for (const sd of [-1, 1]){
      du_ln(ctx, [15 * s, bob + sd * 2 * s, 20 * s, bob + sd * 5.4 * s, 23.6 * s, bob + sd * 2 * s], 3.2 * s, dk); du_ln(ctx, [15.6 * s, bob + sd * 2.4 * s, 20 * s, bob + sd * 5 * s, 22.4 * s, bob + sd * 2.6 * s], 1.3 * s, pl);
      du_ln(ctx, [15 * s, bob + sd * 3.8 * s, 18 * s, bob + sd * 7.4 * s, 20.4 * s, bob + sd * 8.4 * s], 0.9 * s, dk); fillCircle(ctx, 20.6 * s, bob + sd * 8.6 * s, 1.5 * s, dk);
    }
    lkOV(ctx, 14.4 * s, bob, 4.6 * s, 4 * s, dk); lkOV(ctx, 14.4 * s, bob, 3.6 * s, 3.1 * s, b); lkTRI(ctx, 16 * s, bob - 1.6 * s, 21.4 * s, bob, 16 * s, bob + 1.6 * s, dk);
    du_eye(ctx, 14.4 * s, bob - 2.6 * s, 1.15 * s); du_eye(ctx, 14.4 * s, bob + 2.6 * s, 1.15 * s);
  },
  dust_crusher(ctx, e, b, dk, bob, wind, d){                                        /* a golem of stacked rock with heavy fists */
    const s = e.r / 14, rear = e.state === 'rear', hi = du_li(b, 0.28), sh = du_sh(b, 0.32), glow = rear ? 0.95 : 0.55;
    for (const sd of [-1, 1]){                                                    /* arms first, so the body sits over the shoulders */
      const fx = (rear ? 20 : 15) * s, fy = sd * (rear ? 6 : 12) * s;
      du_ln(ctx, [6 * s, bob + sd * 9 * s, fx - 3 * s, bob + fy * 0.9], 6.6 * s, dk); du_ln(ctx, [6 * s, bob + sd * 9 * s, fx - 3 * s, bob + fy * 0.9], 4.2 * s, b);
      du_rock(ctx, fx + 3 * s, bob + fy, 8, (rear ? 8.2 : 7) * s, 1, 0.3, sd > 0 ? 0 : 5, dk); du_rock(ctx, fx + 3 * s, bob + fy, 8, (rear ? 6.6 : 5.6) * s, 1, 0.3, sd > 0 ? 0 : 5, b);
      for (const k of [-1, 0, 1]) fillCircle(ctx, fx + 6.6 * s, bob + fy + k * 3 * s, 1.5 * s, hi);
      lkOV(ctx, fx + 1 * s, bob + fy - 1.6 * s, 2.6 * s, 1.2 * s, hi);
      if (rear) csGlow(ctx, fx + 3 * s, bob + fy, 14 * s, d.pale, 0.5);
    }
    du_rock(ctx, 0, bob, 9, 14.2 * s, 0.92, 0.2, 0, dk); du_rock(ctx, 0, bob, 9, 12.2 * s, 0.92, 0.2, 0, b);
    du_rock(ctx, -3.4 * s, bob - 3 * s, 6, 6 * s, 0.8, 0.5, 3, hi); du_rock(ctx, 3 * s, bob + 4.4 * s, 6, 4.6 * s, 0.8, 0.1, 7, hi); du_rock(ctx, -7 * s, bob + 5 * s, 5, 3.4 * s, 0.8, 0.9, 1, sh);
    for (const [rx, ry, rr] of [[-5, -5.4, 2.4], [2, -1.4, 1.8], [-1, 8, 2], [-9, -1, 2.2]]) fillCircle(ctx, rx * s, bob + ry * s, rr * s, sh);
    const z1 = [-11, -6.4, -7.6, -3, -9.4, 0.6, -5.6, 3.6, -7, 8], z2 = [0, -8, 2.4, -4.4, -0.6, -1.6, 2, 1.4];
    for (const [zz, w2] of [[z1, 1.6], [z2, 1.3]]){
      ctx.strokeStyle = sh; ctx.lineWidth = w2 * 1.9 * s; ctx.lineJoin = 'round'; ctx.beginPath(); for (let k = 0; k < zz.length; k += 2) ctx.lineTo(zz[k] * s, bob + zz[k + 1] * s); ctx.stroke();
      ctx.strokeStyle = d.pale; ctx.globalAlpha = glow; ctx.lineWidth = w2 * 0.8 * s; ctx.beginPath(); for (let k = 0; k < zz.length; k += 2) ctx.lineTo(zz[k] * s, bob + zz[k + 1] * s); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
    }
    du_rock(ctx, -3.4 * s, bob + 0.4 * s, 6, 3.8 * s, 1, 0.5, 0, dk); du_rock(ctx, -3.4 * s, bob + 0.4 * s, 6, 2.9 * s, 1, 0.5, 0, DU_TEAL); du_rock(ctx, -3.8 * s, bob - 0.2 * s, 6, 1.3 * s, 1, 0.5, 0, DU_TEAL_L);
    du_rock(ctx, 7.4 * s, bob, 8, 6.4 * s, 1, 0.2, 2, dk); du_rock(ctx, 7.6 * s, bob, 8, 5.3 * s, 1, 0.2, 2, b); lkOV(ctx, 6.4 * s, bob - 2.8 * s, 2.8 * s, 1 * s, hi);
    lkLN(ctx, [8.6 * s, bob - 4.6 * s, 11 * s, bob - 3.6 * s], 1.3 * s, dk); lkLN(ctx, [8.6 * s, bob + 4.6 * s, 11 * s, bob + 3.6 * s], 1.3 * s, dk);
    du_eye(ctx, 9 * s, bob - 2.4 * s, 1.5 * s); du_eye(ctx, 9 * s, bob + 2.4 * s, 1.5 * s);
  },
  dust_leaper(ctx, e, b, dk, bob, wind, d){                                         /* a big-eyed frog that jumps */
    const s = e.r / 14, z = e.z || 0, k = 1 + z / 70, crouch = e.state === 'crouch', air = e.state === 'air', hi = du_li(b, 0.34), sh = du_sh(b, 0.32);
    ctx.save(); ctx.translate(0, -z * 0.45); ctx.scale(k * (crouch ? 1.1 : 1), k * (crouch ? 0.8 : 1));
    for (const sd of [-1, 1]){
      const kx = -12 * s, ky = bob + sd * (air ? 7 : 12) * s, fx = -19 * s, fy = bob + sd * (air ? 3 : 9) * s;
      du_ln(ctx, [-4 * s, bob + sd * 5 * s, kx, ky, fx, fy], 4.2 * s, dk); du_ln(ctx, [-4 * s, bob + sd * 5 * s, kx, ky], 2.6 * s, b);
      lkTRI(ctx, fx + 1 * s, fy - 2.4 * s, fx - 5 * s, fy, fx + 1 * s, fy + 2.4 * s, dk);
      ctx.strokeStyle = dk; ctx.lineWidth = 1 * s; ctx.lineCap = 'round'; ctx.beginPath(); for (const c of [-1, 0, 1]){ ctx.moveTo(fx - 3 * s, fy); ctx.lineTo(fx - 6.4 * s, fy + c * 2.6 * s); } ctx.stroke(); ctx.lineCap = 'butt';
      du_ln(ctx, [5 * s, bob + sd * 4 * s, 10 * s, bob + sd * 7.4 * s], 2.6 * s, dk); lkOV(ctx, 11 * s, bob + sd * 8 * s, 2.2 * s, 1.5 * s, dk);
    }
    lkOV(ctx, 0, bob, 11.8 * s, 8.6 * s, dk); lkOV(ctx, 0, bob, 10.4 * s, 7.2 * s, b);
    lkOV(ctx, -1 * s, bob - 3 * s, 8 * s, 2.6 * s, hi); lkLN(ctx, [-8 * s, bob, 6 * s, bob], 1.5 * s, hi);
    for (const [px, py] of [[-3, -3], [2, 3], [-5.4, 3], [3, -4], [-8, -1.4], [0, 0.6]]) fillCircle(ctx, px * s, bob + py * s, 1.5 * s, sh);
    for (const [px, py] of [[-1, -4.8], [4, 5], [-6, -5], [-2, 5.2]]) fillCircle(ctx, px * s, bob + py * s, 0.9 * s, DU_TEAL);
    for (const sd of [-1, 1]) lkOV(ctx, 3.4 * s, bob + sd * 5.6 * s, 2.6 * s, 1.3 * s, hi, sd * 0.4);
    lkOV(ctx, 10.4 * s, bob, 5.8 * s, 5.8 * s, dk); lkOV(ctx, 10.6 * s, bob, 5 * s, 5 * s, b);
    lkCV(ctx, 14 * s, bob - 3.6 * s, 16.4 * s, bob, 14 * s, bob + 3.6 * s, 0.9 * s, sh);
    fillCircle(ctx, 14.4 * s, bob - 1.2 * s, 0.6 * s, dk); fillCircle(ctx, 14.4 * s, bob + 1.2 * s, 0.6 * s, dk);
    for (const sd of [-1, 1]){
      fillCircle(ctx, 11 * s, bob + sd * 4 * s, 3.2 * s, b); fillCircle(ctx, 11 * s, bob + sd * 4 * s, 2.7 * s, d.pale);
      lkOV(ctx, 11.4 * s, bob + sd * 4 * s, 0.8 * s, 1.9 * s, '#201208'); fillCircle(ctx, 10.4 * s, bob + sd * 3.2 * s, 0.7 * s, '#FFFFFF');
    }
    ctx.restore();
  },
  dust_raker(ctx, e, b, dk, bob, wind, d){                                          /* a thin mantis that rakes with hooked forelegs */
    const s = e.r / 14, a = e.anim * 1.5, rage = e.rage || 0, sw = e.state === 'side' ? 5 : 0, hi = du_li(b, 0.4), sh = du_sh(b, 0.32), wing = du_li(b, 0.55);
    for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 3)) * 2.4 * s, x0 = (-2 - i * 6) * s;
      du_ln(ctx, [x0, bob + sd * 3 * s, x0 - 1 * s + w, bob + sd * 8 * s, x0 + (i ? -3 : 1) * s + w, bob + sd * 13 * s], 1.9 * s, dk);
    }
    lkOV(ctx, -9 * s, bob, 11.6 * s, 4.6 * s, dk); lkOV(ctx, -9 * s, bob, 10.2 * s, 3.5 * s, b);
    for (let k = 0; k < 4; k++) lkOV(ctx, (-14 + k * 3.6) * s, bob, 0.8 * s, 3 * s, sh);
    lkOV(ctx, -7 * s, bob - 1.8 * s, 9.6 * s, 1.7 * s, wing, -0.04); lkOV(ctx, -7 * s, bob + 1.8 * s, 9.6 * s, 1.7 * s, wing, 0.04); lkLN(ctx, [-15 * s, bob, 1 * s, bob], 0.9 * s, sh);
    lkOV(ctx, 0, bob, 6.4 * s, 3.8 * s, dk); lkOV(ctx, 0, bob, 5.4 * s, 3 * s, b); lkOV(ctx, 6.4 * s, bob, 4 * s, 2.4 * s, dk); lkOV(ctx, 6.4 * s, bob, 3.2 * s, 1.8 * s, b);
    for (const sd of [-1, 1]){
      const ex = 12.4 * s, ey = bob + sd * (6.4 + sw) * s, tx = 20 * s, ty = bob + sd * (3 + sw * 0.4) * s;
      du_ln(ctx, [5 * s, bob + sd * 2 * s, ex, ey], 3.6 * s, dk); du_ln(ctx, [6 * s, bob + sd * 2.4 * s, ex - 1 * s, ey - sd * 0.4 * s], 1.4 * s, hi);
      ctx.strokeStyle = dk; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round'; ctx.beginPath();
      for (const t of [0.3, 0.55, 0.8]){ const px = (5 + 7.4 * t) * s, py = bob + sd * (2 + (4.4 + sw) * t) * s; ctx.moveTo(px, py); ctx.lineTo(px + 1.4 * s, py - sd * 2.6 * s); }
      ctx.stroke(); ctx.lineCap = 'butt';
      du_ln(ctx, [ex, ey, 16.6 * s, bob + sd * (5.2 + sw * 0.8) * s, tx, ty], 2.4 * s, dk);
      lkTRI(ctx, tx, ty, 24.4 * s, bob + sd, 17 * s, bob + sd * (7 + sw) * s, dk); lkTRI(ctx, tx - 0.6 * s, ty, 23.4 * s, bob + sd * 1.2, 18.4 * s, bob + sd * (6.2 + sw) * s, d.pale);
    }
    lkTRI(ctx, 8.2 * s, bob - 3.2 * s, 14.4 * s, bob, 8.2 * s, bob + 3.2 * s, dk); lkTRI(ctx, 8.6 * s, bob - 2.4 * s, 13 * s, bob, 8.6 * s, bob + 2.4 * s, b);
    for (const sd of [-1, 1]){
      csGlow(ctx, 9 * s, bob + sd * 1.6 * s, (4 + 6 * rage) * s, d.pale, 0.5 + 0.4 * rage); du_eye(ctx, 9.6 * s, bob + sd * 1.8 * s, 1.2 * s);
    }
  },
  dust_devil(ctx, e, b, dk, bob, wind, d){                                          /* a corkscrew of sand: no body at all */
    const s = e.r / 14, sp = e.spin || 0;
    softBlob(ctx, 0, bob, 22 * s, '#5A200E', 0.16); softBlob(ctx, 0, bob, 20 * s, '#E8C898', 0.2);
    ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++){
      const rr = (5 + k * 3.2) * s, a0 = sp * (1 + k * 0.2) + k;
      ctx.strokeStyle = dk; ctx.globalAlpha = 0.5 - k * 0.04; ctx.lineWidth = (3.8 - k * 0.3) * s; ctx.beginPath(); ctx.arc(0, bob, rr, a0 - 0.1, a0 + 3.9); ctx.stroke();
      ctx.strokeStyle = k % 2 ? b : d.pale; ctx.globalAlpha = 0.9 - k * 0.1; ctx.lineWidth = (2.6 - k * 0.2) * s; ctx.beginPath(); ctx.arc(0, bob, rr, a0, a0 + 3.8); ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
    for (let k = 0; k < 7; k++){ const an = sp * 1.7 + k * 0.9, rr = (4 + (k % 3) * 5.4) * s; fillCircle(ctx, Math.cos(an) * rr, bob + Math.sin(an) * rr, (1.5 - (k % 2) * 0.5) * s, k % 3 ? dk : du_li(b, 0.5)); }
    fillCircle(ctx, 0, bob, 3.6 * s, dk); fillCircle(ctx, 0, bob, 2.6 * s, DU_TEAL); fillCircle(ctx, 0, bob, 1.1 * s, DU_TEAL_L);
  },
  dust_worm(ctx, e, b, dk, bob, wind, d){                                           /* a segmented worm with a ring of teeth */
    const s = e.r / 14, a = e.anim * 1.2, hi = du_li(b, 0.4), sh = du_sh(b, 0.3);
    if (e.state === 'bury' || e.state === 'wait'){
      ctx.globalAlpha = 0.22; lkOV(ctx, -12 * s, bob, 22 * s, 8 * s, '#4A1C0E'); ctx.globalAlpha = 0.6;
      for (let k = 0; k < 4; k++) lkOV(ctx, -k * 7 * s, bob + Math.sin(a + k) * 2 * s, (9 - k) * s, (4.6 - k * 0.6) * s, '#C8A070');
      ctx.globalAlpha = 0.8; for (let k = 0; k < 3; k++) lkOV(ctx, (-k * 7 - 1) * s, bob + Math.sin(a + k) * 2 * s - 1.2 * s, (5 - k) * s, 1.1 * s, '#F0D8A8');
      ctx.globalAlpha = 1; return;
    }
    const bx = [];                                                                /* segment centres, for the bristles drawn after the body */
    for (let k = 6; k >= 1; k--){
      const x = -k * 6.4 * s, y = bob + Math.sin(a - k * 0.7) * 3.4 * s, rr = (8.4 - k * 0.8) * s, c = k % 2 ? b : d.pale;
      lkOV(ctx, x - 1.6 * s, y, 1.4 * s, rr * 0.7, dk, 0);
      fillCircle(ctx, x, y, rr, dk); fillCircle(ctx, x, y, rr * 0.86, c); lkOV(ctx, x - rr * 0.1, y - rr * 0.38, rr * 0.55, rr * 0.2, du_li(c, 0.4));
      fillCircle(ctx, x - rr * 0.1, y, rr * 0.22, k % 2 ? sh : b);
      bx.push(x, y, rr);
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 1 * s; ctx.lineCap = 'round'; ctx.beginPath();
    for (let k = 0; k < bx.length; k += 3){ ctx.moveTo(bx[k], bx[k + 1] - bx[k + 2] * 0.8); ctx.lineTo(bx[k] - 1.6 * s, bx[k + 1] - bx[k + 2] * 1.25); ctx.moveTo(bx[k], bx[k + 1] + bx[k + 2] * 0.8); ctx.lineTo(bx[k] - 1.6 * s, bx[k + 1] + bx[k + 2] * 1.25); }
    ctx.stroke(); ctx.lineCap = 'butt';
    fillCircle(ctx, 1 * s, bob, 9.8 * s, dk); fillCircle(ctx, 1 * s, bob, 8.6 * s, b); lkOV(ctx, -1 * s, bob - 4 * s, 5.6 * s, 2 * s, hi);
    for (const k of [-1, 1]) lkCV(ctx, -2 * s, bob + k * 6.4 * s, 1.4 * s, bob + k * 5 * s, 4.4 * s, bob + k * 6.8 * s, 1 * s, sh);
    for (const sd of [-1, 1]){ du_ln(ctx, [8 * s, bob + sd * 5 * s, 12 * s, bob + sd * 7.4 * s, 15 * s, bob + sd * 6.6 * s], 1.1 * s, dk); fillCircle(ctx, 15.4 * s, bob + sd * 6.6 * s, 1.1 * s, DU_TEAL); }
    fillCircle(ctx, 7 * s, bob, 6.6 * s, sh); ctx.strokeStyle = hi; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(7 * s, bob, 6.2 * s, 0, TAU); ctx.stroke();
    fillCircle(ctx, 7 * s, bob, 5 * s, '#2A1008'); fillCircle(ctx, 7.4 * s, bob, 2 * s, '#5A1E14'); fillCircle(ctx, 7.6 * s, bob, 0.9 * s, DU_TEAL);
    ctx.fillStyle = d.pale; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const an = k / 10 * TAU + a * 0.1, cx = 7 * s + Math.cos(an) * 5 * s, cy = bob + Math.sin(an) * 5 * s, w2 = 0.34; ctx.moveTo(7 * s + Math.cos(an - w2) * 5.4 * s, bob + Math.sin(an - w2) * 5.4 * s); ctx.lineTo(7 * s + Math.cos(an) * 2.8 * s, bob + Math.sin(an) * 2.8 * s); ctx.lineTo(7 * s + Math.cos(an + w2) * 5.4 * s, bob + Math.sin(an + w2) * 5.4 * s); }
    ctx.fill();
  },
  dust_brood(ctx, e, b, dk, bob, wind, d){                                          /* a swollen mother covered in glowing egg sacs */
    const s = e.r / 14, a = e.anim * 1.1, lay = e.brT !== undefined && e.brT < 0.8, hi = du_li(b, 0.36), sh = du_sh(b, 0.32);
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 3)) * 2 * s, x0 = (4 - i * 7) * s;
      du_ln(ctx, [x0, bob + sd * 8 * s, x0 + 2 * s + w * 0.6, bob + sd * 12.4 * s, x0 + 1 * s + w, bob + sd * 16.4 * s], 2.6 * s, dk); fillCircle(ctx, x0 + 2 * s + w * 0.6, bob + sd * 12.4 * s, 1.5 * s, hi);
    }
    lkOV(ctx, -6 * s, bob, 13.6 * s, 11.6 * s, dk); lkOV(ctx, -6 * s, bob, 12.2 * s, 10.2 * s, b);
    lkOV(ctx, -8 * s, bob - 5.6 * s, 8.4 * s, 2.6 * s, hi, -0.12);
    for (const x of [-16, -10, -4]) lkCV(ctx, x * s, bob - 7.6 * s, (x - 3.4) * s, bob, x * s, bob + 7.6 * s, 1.1 * s, sh);
    for (const [ex, ey] of [[-10, -4], [-4, 4], [-12, 4], [-2, -5], [-8, 0]]){
      const pul = 1 + 0.1 * Math.sin(a * 1.6 + ex);
      fillCircle(ctx, ex * s, bob + ey * s, 3.6 * s * pul, sh); fillCircle(ctx, ex * s, bob + ey * s, 2.8 * s * pul, d.pale);
      fillCircle(ctx, (ex + 0.3) * s, bob + (ey + 0.3) * s, 1.3 * s, DU_TEAL); fillCircle(ctx, (ex - 0.8) * s, bob + (ey - 0.9) * s, 0.9 * s, '#FFFFFF');
    }
    lkOV(ctx, 4 * s, bob, 5.4 * s, 4.6 * s, dk); lkOV(ctx, 4 * s, bob, 4.6 * s, 3.8 * s, b);
    lkOV(ctx, 9 * s, bob, 6.2 * s, 5.2 * s, dk); lkOV(ctx, 9 * s, bob, 5.2 * s, 4.3 * s, b); lkOV(ctx, 8 * s, bob - 1.6 * s, 3 * s, 1.1 * s, hi);
    for (const sd of [-1, 1]){
      du_ln(ctx, [12.6 * s, bob + sd * 2 * s, 16 * s, bob + sd * 4 * s, 17.4 * s, bob + sd * 0.8 * s], 2 * s, dk);
      du_ln(ctx, [10 * s, bob + sd * 3.6 * s, 14 * s, bob + sd * 7 * s, 18 * s, bob + sd * 7.4 * s], 0.9 * s, dk);
      du_eye(ctx, 11.2 * s, bob + sd * 2.4 * s, 1.3 * s);
    }
    if (lay){ csGlow(ctx, -12 * s, bob, 14 * s, d.pale, 0.6); fillCircle(ctx, -20 * s, bob + Math.sin(a * 3) * 1.4 * s, 1.5 * s, d.pale); fillCircle(ctx, -23 * s, bob - Math.sin(a * 3) * 1.4 * s, 1.1 * s, d.pale); }
  },
  dust_mite(ctx, e, b, dk, bob, wind, d){                                           /* a tiny, frantic mite */
    const s = e.r / 9, a = e.anim * 3, hi = du_li(b, 0.45);
    for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 2 + sd) * 1.6 * s;
      du_ln(ctx, [i * 2.6 * s, bob + sd * 2 * s, i * 2.6 * s + w * 0.5 + 0.8 * s, bob + sd * 4.8 * s, i * 2.6 * s + w, bob + sd * 7.4 * s], 1.3 * s, dk);
    }
    lkOV(ctx, -0.4 * s, bob, 6.6 * s, 5 * s, dk); lkOV(ctx, -0.4 * s, bob, 5.5 * s, 3.9 * s, b); lkOV(ctx, -1.4 * s, bob, 3.4 * s, 2.2 * s, hi);
    fillCircle(ctx, -3.4 * s, bob - 1.4 * s, 0.7 * s, dk); fillCircle(ctx, -3.4 * s, bob + 1.4 * s, 0.7 * s, dk); fillCircle(ctx, 0.4 * s, bob, 0.7 * s, DU_TEAL);
    lkOV(ctx, 5.4 * s, bob, 2.6 * s, 2.4 * s, dk); lkOV(ctx, 5.4 * s, bob, 2 * s, 1.8 * s, b);
    for (const sd of [-1, 1]){ lkLN(ctx, [6.6 * s, bob + sd * 0.8 * s, 9 * s, bob + sd * 0.2 * s], 1.1 * s, d.pale); fillCircle(ctx, 5.6 * s, bob + sd * 1.7 * s, 1.1 * s, DU_TEAL); }
  },
  dust_spore(ctx, e, b, dk, bob, wind, d){                                          /* a puffball of spores that swells and bursts */
    const s = e.r / 13, sw = e.state === 'swell' ? 1 + (0.55 - Math.max(0, e.stateT)) * 1.2 : 1 + 0.06 * Math.sin(e.anim * 1.2), a = e.ang || 0, hi = du_li(b, 0.5), sh = du_sh(b, 0.2);
    softBlob(ctx, 0, bob, 22 * s * sw, d.pale, 0.2);
    for (let k = 0; k < 12; k++){
      const an = k / 12 * TAU + a, big = k % 2 === 0, rr = (big ? 11 : 8.4) * s * sw + 4 * s, ca = Math.cos(an), sn = Math.sin(an);
      lkLN(ctx, [ca * 8 * s * sw, bob + sn * 8 * s * sw, ca * rr, bob + sn * rr], (big ? 1.7 : 1.3) * s, dk);
      fillCircle(ctx, ca * rr, bob + sn * rr, (big ? 2.3 : 1.7) * s, dk); fillCircle(ctx, ca * rr, bob + sn * rr, (big ? 1.7 : 1.2) * s, big ? d.pale : DU_TEAL_L);
    }
    fillCircle(ctx, 0, bob, 10.8 * s * sw, dk); fillCircle(ctx, 0, bob, 9.4 * s * sw, b); fillCircle(ctx, -1.2 * s, bob - 1.2 * s, 6.4 * s * sw, hi); fillCircle(ctx, -0.4 * s, bob - 0.4 * s, 5.6 * s * sw, b);
    for (let k = 0; k < 5; k++){ const an = k / 5 * TAU + a * 1.3 + 0.4, rr = 6.8 * s * sw; fillCircle(ctx, Math.cos(an) * rr, bob + Math.sin(an) * rr, 1.3 * s, sh); }
    fillCircle(ctx, 0.6 * s, bob + 0.4 * s, 3 * s * sw, dk); fillCircle(ctx, 0.6 * s, bob + 0.4 * s, 2.2 * s * sw, DU_TEAL); fillCircle(ctx, 0, bob - 0.2 * s, 0.9 * s, DU_TEAL_L);
    lkOV(ctx, -3.6 * s, bob - 4.4 * s, 2.4 * s * sw, 1.1 * s * sw, '#FFFFFF', -0.7);
    if (e.state === 'swell') csGlow(ctx, 0, bob, 28 * s * sw, '#FFFFFF', 0.5);
  },
  dust_alpha(ctx, e, b, dk, bob, wind, d){                                          /* boss: a dune beast with a mane of glass shards */
    const s = e.r / 30, a = e.anim * 1.2, roar = e.state === 'roar', hi = du_li(b, 0.34), sh = du_sh(b, 0.34), sh2 = du_sh(b, 0.5), glass = du_mix(d.pale, b, 0.42);
    /* tail with a tuft of shards */
    const tx = -50 * s, ty = bob - Math.sin(a) * 8 * s;
    du_ln(ctx, [-26 * s, bob, -38 * s, bob + Math.sin(a) * 10 * s, tx, ty], 7.4 * s, dk); du_ln(ctx, [-26 * s, bob, -38 * s, bob + Math.sin(a) * 10 * s, tx, ty], 4.8 * s, b);
    for (const k of [-1, 0, 1]) lkTRI(ctx, tx + 1 * s, ty + k * 1.6 * s, tx - 12 * s, ty + k * 7 * s, tx - 1 * s, ty + k * 3.4 * s + 1.4 * s, k ? glass : d.pale);
    /* four legs: haunches, jointed limbs, paws with claws */
    for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 3 + (sd > 0 ? 0 : 1.6)) * 5 * s, bx = (14 - i * 28) * s, kx = bx + 5 * s + w * 0.7, kyy = bob + sd * 20 * s, fx = bx + 7 * s + w, fy = bob + sd * 27 * s;
      lkOV(ctx, bx, bob + sd * 12 * s, 10 * s, 8 * s, dk);
      du_ln(ctx, [bx, bob + sd * 13 * s, kx, kyy, fx, fy], 8 * s, dk); du_ln(ctx, [bx, bob + sd * 13 * s, kx, kyy], 5.4 * s, b);
      fillCircle(ctx, kx, kyy, 3.2 * s, hi);
      lkOV(ctx, fx + 1 * s, fy, 5.6 * s, 4.4 * s, dk); lkOV(ctx, fx + 1 * s, fy, 4.4 * s, 3.4 * s, b);
      for (let c = -1; c <= 1; c++){ const cy = fy + c * 2.6 * s; lkTRI(ctx, fx + 4.4 * s, cy - 1.2 * s, fx + 11 * s, cy + sd * 1.4 * s + c * 1.2 * s, fx + 4.4 * s, cy + 1.2 * s, d.pale); }
    }
    /* body */
    lkOV(ctx, -2 * s, bob, 30.4 * s, 17.8 * s, dk); lkOV(ctx, -2 * s, bob, 27.8 * s, 15.2 * s, b);
    lkOV(ctx, -1 * s, bob + 7.4 * s, 24 * s, 6.4 * s, sh); lkOV(ctx, -3 * s, bob - 7 * s, 22 * s, 5.4 * s, hi); lkOV(ctx, -3 * s, bob - 6.6 * s, 20 * s, 3.4 * s, du_li(b, 0.5));
    for (let k = 0; k < 5; k++){
      const x = (-20 + k * 7.4) * s, hw = 14.4 * Math.sqrt(Math.max(0.1, 1 - Math.pow((x / s + 2) / 27.8, 2))) * s;
      for (const sd of [-1, 1]) lkTRI(ctx, x - 2.4 * s, bob + sd * hw, x + 1.6 * s, bob + sd * hw, x - 0.6 * s, bob + sd * hw * 0.42, sh2);
    }
    lkOV(ctx, -5 * s, bob, 21 * s, 3.4 * s, sh2);
    for (let k = 0; k < 7; k++){ const x = (-22 + k * 6.2) * s; lkTRI(ctx, x - 2.6 * s, bob - 2.2 * s, x + 3 * s, bob, x - 2.6 * s, bob + 2.2 * s, du_li(b, 0.2 + k * 0.04)); }
    /* mane of glass shards fanned around the neck: a dim back row, then a bright front row (the head stays clear) */
    const mx = 19 * s;
    for (let k = 0; k < 12; k++){
      const sd = k < 6 ? -1 : 1, j = k % 6, an = sd * (0.7 + j * 0.34), ca = Math.cos(an), sn = Math.sin(an), px = mx + ca * 9 * s, py = bob + sn * 11 * s, len = (11 + (j % 2) * 3) * s;
      du_shard(ctx, px, py, ca, sn, len, 3.8 * s, dk); du_shard(ctx, px, py, ca, sn, len * 0.88, 2.8 * s, glass);
    }
    for (let k = 0; k < 10; k++){
      const sd = k < 5 ? -1 : 1, j = k % 5, an = sd * (0.85 + j * 0.4) + Math.sin(a * 1.5 + k) * 0.04, ca = Math.cos(an), sn = Math.sin(an), px = mx + ca * 8 * s, py = bob + sn * 9.4 * s, len = (8.4 + (j % 2) * 3) * s;
      du_shard(ctx, px, py, ca, sn, len, 3.2 * s, d.pale);
      if (j % 2 === 1) du_shard(ctx, px + ca * len * 0.62, py + sn * len * 0.62, ca, sn, len * 0.38, 1.3 * s, DU_TEAL);
    }
    /* head */
    for (const sd of [-1, 1]){
      du_ln(ctx, [27 * s, bob + sd * 6 * s, 22 * s, bob + sd * 12 * s, 14 * s, bob + sd * 13.4 * s], 4.2 * s, dk); du_ln(ctx, [25 * s, bob + sd * 7.4 * s, 21 * s, bob + sd * 11.6 * s, 15 * s, bob + sd * 13 * s], 2 * s, d.pale);
      fillCircle(ctx, 23.6 * s, bob + sd * 9.6 * s, 2.8 * s, dk); fillCircle(ctx, 23.6 * s, bob + sd * 9.6 * s, 1.7 * s, b);
    }
    lkOV(ctx, 28 * s, bob, 12.4 * s, 10.4 * s, dk); lkOV(ctx, 28 * s, bob, 10.8 * s, 9 * s, b); lkOV(ctx, 27 * s, bob - 3 * s, 7 * s, 2.6 * s, hi);
    lkOV(ctx, 36 * s, bob, 7.6 * s, 5.6 * s, dk); lkOV(ctx, 36 * s, bob, 6.4 * s, 4.6 * s, hi);
    lkTRI(ctx, 34 * s, bob - 4.4 * s, 45 * s, bob, 34 * s, bob + 4.4 * s, dk); lkTRI(ctx, 35 * s, bob - 2.6 * s, 42 * s, bob, 35 * s, bob + 2.6 * s, sh);
    fillCircle(ctx, 41 * s, bob - 1.6 * s, 0.9 * s, DU_EYE_DK); fillCircle(ctx, 41 * s, bob + 1.6 * s, 0.9 * s, DU_EYE_DK);
    for (const sd of [-1, 1]) lkTRI(ctx, 38 * s, bob + sd * 3.4 * s, 44 * s, bob + sd * 5.6 * s, 40 * s, bob + sd * 1.6 * s, '#FFF2D8');
    if (roar){ lkTRI(ctx, 37 * s, bob - 3.2 * s, 49 * s, bob, 37 * s, bob + 3.2 * s, '#2A0A06'); for (const sd of [-1, 1]) lkTRI(ctx, 39 * s, bob + sd * 2.6 * s, 47 * s, bob + sd * 1.2 * s, 41 * s, bob + sd * 0.4 * s, '#FFF2D8'); }
    for (const sd of [-1, 1]){ csGlow(ctx, 30 * s, bob + sd * 4 * s, 7 * s, d.pale, 0.95); du_eye(ctx, 30.6 * s, bob + sd * 4.2 * s, 2.1 * s); }
    if (roar) ringPath(ctx, 0, bob, 44 * s, 4, d.pale, 0.55);
  },
  dust_matron(ctx, e, b, dk, bob, wind, d){                                         /* boss: an enormous queen with a crown of spines */
    const s = e.r / 34, a = e.anim * 1.1, hi = du_li(b, 0.34), sh = du_sh(b, 0.3), sh2 = du_sh(b, 0.5);
    /* ovipositor tail */
    const ox = -52 * s, oy = bob + Math.sin(a) * 3 * s;
    du_ln(ctx, [-36 * s, bob, -44 * s, bob + Math.sin(a) * 2 * s, ox, oy], 7 * s, dk); du_ln(ctx, [-36 * s, bob, -44 * s, bob + Math.sin(a) * 2 * s, ox, oy], 4.4 * s, b);
    fillCircle(ctx, ox - 2 * s, oy, 3.6 * s, dk); fillCircle(ctx, ox - 2 * s, oy, 2.4 * s, DU_TEAL); fillCircle(ctx, ox - 2.6 * s, oy - 0.6 * s, 1 * s, DU_TEAL_L);
    /* four jointed pairs of legs */
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 1.7 + (sd > 0 ? 0 : 3)) * 5 * s, bx = (12 - i * 14) * s, kx = bx + 5 * s + w, ky = bob + sd * 30 * s, fx = bx + 2 * s + w * 0.5, fy = bob + sd * 41 * s;
      du_ln(ctx, [bx, bob + sd * 16 * s, kx, ky, fx, fy], 5 * s, dk);
      lkTRI(ctx, kx - 2.4 * s, ky, kx + 3.4 * s, ky + sd * 1 * s, kx - 0.4 * s, ky + sd * 5 * s, dk); fillCircle(ctx, kx, ky, 2.2 * s, hi);
      lkTRI(ctx, fx - 1.6 * s, fy - sd * 1 * s, fx + 1.4 * s, fy + sd * 6 * s, fx + 2.4 * s, fy - sd * 1 * s, d.pale);
    }
    /* abdomen */
    lkOV(ctx, -16 * s, bob, 30.6 * s, 24.6 * s, dk); lkOV(ctx, -16 * s, bob, 28 * s, 22.2 * s, b);
    lkOV(ctx, -20 * s, bob - 11 * s, 20 * s, 6 * s, hi, -0.08); lkOV(ctx, -14 * s, bob + 14 * s, 22 * s, 6 * s, sh);
    for (const x of [-34, -26, -18, -10, -2]){ const hw = 22 * Math.sqrt(Math.max(0.05, 1 - Math.pow((x + 16) / 28, 2))) * s * 0.92; lkCV(ctx, x * s, bob - hw, (x - 5) * s, bob, x * s, bob + hw, 1.6 * s, sh2); }
    for (let k = 0; k < 11; k++){
      const an = k * 2.4, rr = (6 + (k * 5) % 18) * s, ex = -14 * s + Math.cos(an) * rr, ey = bob + Math.sin(an) * rr * 0.8, pul = 1 + 0.12 * Math.sin(a * 1.4 + k);
      fillCircle(ctx, ex, ey, 5.6 * s * pul, sh2); fillCircle(ctx, ex, ey, 4.4 * s * pul, d.pale);
      if (k % 3 === 0){ fillCircle(ctx, ex + 0.4 * s, ey + 0.6 * s, 2.1 * s, DU_TEAL); fillCircle(ctx, ex - 0.2 * s, ey, 0.9 * s, DU_TEAL_L); }
      fillCircle(ctx, ex - 1.2 * s, ey - 1.4 * s, 1.5 * s, '#FFFFFF');
    }
    /* thorax and head */
    lkOV(ctx, 6 * s, bob, 10.4 * s, 9 * s, dk); lkOV(ctx, 6 * s, bob, 9 * s, 7.6 * s, b); lkOV(ctx, 4.6 * s, bob - 2.6 * s, 5.6 * s, 2 * s, hi); lkCV(ctx, 2 * s, bob - 6 * s, 5.6 * s, bob, 2 * s, bob + 6 * s, 1.3 * s, sh);
    for (const sd of [-1, 1]){ du_ln(ctx, [14 * s, bob + sd * 5 * s, 22 * s, bob + sd * 11 * s, 31 * s, bob + sd * 16 * s], 1.3 * s, dk); }
    for (let k = -3; k <= 3; k++){                                                /* crown of spines fanned around the head */
      const an = k * 0.34, ca = Math.cos(an), sn = Math.sin(an), px = 23 * s + ca * 10 * s, py = bob + sn * 10 * s, len = (k === 0 ? 17 : 14 - Math.abs(k) * 0.8) * s;
      du_shard(ctx, px, py, ca, sn, len + 1.6 * s, 3 * s, dk);
    }
    lkOV(ctx, 21 * s, bob, 13.6 * s, 12.4 * s, dk); lkOV(ctx, 21 * s, bob, 12 * s, 11 * s, b);
    for (let k = -3; k <= 3; k++){
      const an = k * 0.34, ca = Math.cos(an), sn = Math.sin(an), px = 23 * s + ca * 10 * s, py = bob + sn * 10 * s, len = (k === 0 ? 17 : 14 - Math.abs(k) * 0.8) * s;
      du_shard(ctx, px, py, ca, sn, len, 2.2 * s, d.pale);
    }
    lkOV(ctx, 19 * s, bob - 4 * s, 7 * s, 2.4 * s, hi); lkLN(ctx, [14 * s, bob, 26 * s, bob], 1.3 * s, sh);
    for (const sd of [-1, 1]){
      du_ln(ctx, [28 * s, bob + sd * 7 * s, 36 * s, bob + sd * 12 * s, 40 * s, bob + sd * 8 * s], 4 * s, dk); lkTRI(ctx, 38 * s, bob + sd * 10 * s, 43 * s, bob + sd * 5.6 * s, 40 * s, bob + sd * 11.6 * s, d.pale);
      csGlow(ctx, 25 * s, bob + sd * 6.4 * s, 6.4 * s, d.pale, 0.9); du_eye(ctx, 25.4 * s, bob + sd * 6.6 * s, 2.5 * s); du_eye(ctx, 29 * s, bob + sd * 2.6 * s, 1.5 * s);
    }
    if (e.state === 'stomp') ringPath(ctx, 0, bob, 50 * s, 4, d.pale, 0.5);
  },
  dust_titan(ctx, e, b, dk, bob, wind, d){                                          /* boss: a colossal armoured shell with cracks of light and heavy fists */
    const s = e.r / 36, a = e.anim * 1.0, dash = e.state === 'dash' || e.state === 'wind', hi = du_li(b, 0.3), sh = du_sh(b, 0.35), pl = du_mix(b, d.pale, 0.2);
    /* three jointed pairs of legs */
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 3)) * 4 * s, bx = (10 - i * 16) * s, kx = bx + 5 * s + w * 0.6, ky = bob + sd * 30 * s, fx = bx + 3 * s + w, fy = bob + sd * 38 * s;
      du_ln(ctx, [bx, bob + sd * 20 * s, kx, ky, fx, fy], 7 * s, dk); fillCircle(ctx, kx, ky, 3.6 * s, dk); fillCircle(ctx, kx, ky, 2.4 * s, hi);
      for (let c = -1; c <= 1; c++) lkTRI(ctx, fx - 1 * s + c * 2.2 * s, fy, fx + 1.4 * s + c * 3 * s, fy + sd * 5 * s, fx + 1.4 * s + c * 2.2 * s, fy, pl);
    }
    /* shell: rim, base, then overlapping transverse plates */
    lkOV(ctx, -2 * s, bob, 34.6 * s, 28.6 * s, dk); lkOV(ctx, -2 * s, bob, 31.6 * s, 25.8 * s, b);
    for (let k = 0; k < 6; k++){
      const x = (-27 + k * 9.6) * s, hw = 25.4 * Math.sqrt(Math.max(0.08, 1 - Math.pow((x / s + 2) / 31.6, 2))) * s;
      lkOV(ctx, x, bob, 6.8 * s, hw, sh); lkOV(ctx, x + 0.8 * s, bob, 5.4 * s, hw - 1.6 * s, k % 2 ? b : hi);
      lkOV(ctx, x + 0.2 * s, bob - hw * 0.5, 2.2 * s, hw * 0.3, du_li(b, 0.5));
    }
    lkLN(ctx, [-30 * s, bob, 26 * s, bob], 2.4 * s, dk);
    for (let k = 0; k < 8; k++){                                                  /* rim spikes */
      const an = k / 8 * TAU + 0.3, ca = Math.cos(an), sn = Math.sin(an), an2 = an + 0.34;
      lkTRI(ctx, ca * 27 * s, bob + sn * 22 * s, Math.cos(an + 0.1) * 40 * s, bob + Math.sin(an + 0.1) * 33 * s, Math.cos(an2) * 27 * s, bob + Math.sin(an2) * 22 * s, dk);
      lkTRI(ctx, ca * 29 * s, bob + sn * 24 * s, Math.cos(an + 0.12) * 37 * s, bob + Math.sin(an + 0.12) * 31 * s, Math.cos(an2 - 0.06) * 29 * s, bob + Math.sin(an2 - 0.06) * 24 * s, pl);
    }
    const crk = 0.4 + 0.25 * Math.sin(a * 2) + (dash ? 0.4 : 0);
    const cr = [-18, -8, -12, -5, -6, 2, 0, -3, 8, -6, 16, -3, -12, 12, -4, 7, 0, 4, 10, 9, -6, 2, -9, -8, 8, -6, 6, -15];
    for (let pass = 0; pass < 2; pass++){
      ctx.strokeStyle = pass ? d.pale : dk; ctx.globalAlpha = pass ? Math.min(1, crk) : 0.7; ctx.lineWidth = (pass ? 1.5 : 3.6) * s; ctx.lineJoin = 'round'; ctx.beginPath();
      ctx.moveTo(cr[0] * s, bob + cr[1] * s); for (let k = 2; k < 12; k += 2) ctx.lineTo(cr[k] * s, bob + cr[k + 1] * s);
      ctx.moveTo(cr[12] * s, bob + cr[13] * s); for (let k = 14; k < 20; k += 2) ctx.lineTo(cr[k] * s, bob + cr[k + 1] * s);
      ctx.moveTo(cr[20] * s, bob + cr[21] * s); ctx.lineTo(cr[22] * s, bob + cr[23] * s); ctx.moveTo(cr[24] * s, bob + cr[25] * s); ctx.lineTo(cr[26] * s, bob + cr[27] * s);
      ctx.stroke(); ctx.lineJoin = 'miter'; ctx.globalAlpha = 1;
    }
    for (const [gx, gy] of [[-6, 2], [8, -6], [0, 4]]){ lkTRI(ctx, gx * s, bob + gy * s - 3 * s, gx * s + 2.4 * s, bob + gy * s, gx * s, bob + gy * s + 3 * s, DU_TEAL); lkTRI(ctx, gx * s, bob + gy * s - 3 * s, gx * s - 2.4 * s, bob + gy * s, gx * s, bob + gy * s + 3 * s, DU_TEAL_L); }
    /* shoulders, arms and fists */
    for (const sd of [-1, 1]){
      lkOV(ctx, 21 * s, bob + sd * 17 * s, 10 * s, 8 * s, dk); lkOV(ctx, 21 * s, bob + sd * 17 * s, 8.6 * s, 6.8 * s, b); lkOV(ctx, 19.4 * s, bob + sd * 15.4 * s, 4.6 * s, 2 * s, hi);
      du_ln(ctx, [24 * s, bob + sd * 17 * s, 36 * s, bob + sd * 21 * s], 9.4 * s, dk); du_ln(ctx, [26 * s, bob + sd * 17 * s, 35 * s, bob + sd * 20.6 * s], 6.2 * s, b);
      fillCircle(ctx, 40 * s, bob + sd * 22 * s, 10 * s, dk); fillCircle(ctx, 40 * s, bob + sd * 22 * s, 8.2 * s, b); lkOV(ctx, 38 * s, bob + sd * 19.4 * s, 4.6 * s, 2 * s, hi);
      for (const c of [-1, 0, 1]) fillCircle(ctx, 46 * s, bob + sd * 22 * s + c * 4 * s, 2.5 * s, pl);
    }
    /* helmeted head */
    for (const sd of [-1, 1]) du_ln(ctx, [29 * s, bob + sd * 6 * s, 26 * s, bob + sd * 11 * s, 20 * s, bob + sd * 13 * s], 3.6 * s, dk);
    lkOV(ctx, 32 * s, bob, 10.6 * s, 9.4 * s, dk); lkOV(ctx, 32 * s, bob, 9.2 * s, 8 * s, b); lkOV(ctx, 31 * s, bob - 3.4 * s, 5.6 * s, 2 * s, hi);
    lkTRI(ctx, 38 * s, bob - 3.6 * s, 46 * s, bob, 38 * s, bob + 3.6 * s, dk); lkTRI(ctx, 38 * s, bob - 2 * s, 43 * s, bob, 38 * s, bob + 2 * s, sh);
    lkOV(ctx, 36 * s, bob, 4.8 * s, 3.8 * s, '#2A0E08');
    for (const sd of [-1, 1]){ csGlow(ctx, 36 * s, bob + sd * 3 * s, 5 * s, d.pale, 0.9); du_eye(ctx, 36.4 * s, bob + sd * 3 * s, 1.7 * s); }
    if (dash) csGlow(ctx, 0, bob, 50 * s, d.pale, 0.2);
  }
};

