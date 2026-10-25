'use strict';
/* Enemy art, Chapter 13.5: the two bosses of the Domes (DOME_DRAW). */
/* The Thawed (wave 330): a polar bear caught half way through melting, its head and shoulders still furred and frosted, its back end slumping into a spreading
   puddle, drips falling from it, with a cold glow where the bones show through. The Ice Heart (wave 335): a huge, rough-cut crystal beast built round a great
   glowing heart of cold in its chest. Both are drawn facing +x like every enemy; the stage of the fight shows in e.state, and the Ice Heart's heart brightens with e.glow. */
const DM_CY = '#7FF0FF', DM_CY_L = '#E6FFFF', DM_EYE_DK = '#08202C';
const DM_MIXC = {};
function dm_mix(a, c, t){ const k = a + c + t; return DM_MIXC[k] || (DM_MIXC[k] = blendHex(a, c, t)); }
function dm_poly(ctx, pts, c){ ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
function dm_eye(ctx, x, y, r){ fillCircle(ctx, x, y, r * 1.4, DM_EYE_DK); fillCircle(ctx, x, y, r, DM_CY); fillCircle(ctx, x + r * 0.2, y, r * 0.45, DM_CY_L); csGlow(ctx, x, y, r * 4, DM_CY, 0.5); }
/* a faceted crystal: base centre (x,y), pointing along angle a, length L, half width w; one lit face and one shaded */
function dm_crystal(ctx, x, y, a, L, w, c, lit){
  const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
  dm_poly(ctx, [x + px * w, y + py * w, x + ca * L, y + sa * L, x - px * w, y - py * w], c);
  dm_poly(ctx, [x + px * w, y + py * w, x + ca * L, y + sa * L, x, y], lit);
}

const DOME_DRAW = {
  dome_thawed(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 46, t = G.time, a = e.anim, st = e.state;
    const slide = st === 'slide', sag = st === 'slumpwind' ? 0.35 : slide ? 1 : st === 'meltdown' ? 0.6 : 0;
    const squash = 1 - 0.5 * sag, wob = Math.sin(a * 1.6) * 1.6 * s;
    const ice = d.color, deep = d.dark, hi = d.pale, fur = dm_mix(hi, ice, 0.25), bone = '#2E6A86';
    /* the puddle it is leaving behind: wide, shiny, with floating chunks */
    const pw = (30 + sag * 40) * s;
    ctx.fillStyle = dm_mix(ice, '#1A4A66', 0.35); ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(-26 * s, bob + 2 * s, pw + 22 * s, (22 + sag * 6) * s, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(230,252,255,.5)'; ctx.beginPath(); ctx.ellipse(-34 * s, bob - 4 * s, pw * 0.6, 7 * s, -0.1, 0, TAU); ctx.fill();
    for (let k = 0; k < 4; k++){ const px = (-30 - k * 14) * s + Math.sin(a * 0.8 + k) * 3 * s, py = bob + ((k % 2) ? 8 : -8) * s; dm_poly(ctx, [px - 5 * s, py, px, py - 6 * s, px + 5 * s, py + 1 * s, px, py + 5 * s], hi); }
    /* the slumping back half: a soft mound with the bones showing */
    ctx.fillStyle = deep; ctx.beginPath(); ctx.ellipse(-16 * s, bob, 36 * s, 26 * s * squash, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = ice; ctx.beginPath(); ctx.ellipse(-16 * s, bob - 1 * s, 33 * s, 23 * s * squash, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = dm_mix(ice, '#FFFFFF', 0.4); ctx.beginPath(); ctx.ellipse(-20 * s, bob - 9 * s * squash, 24 * s, 8 * s * squash, -0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = bone; ctx.lineWidth = 2.2 * s; ctx.lineCap = 'round';                                              /* ribs seen through the ice */
    for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo((-36 + k * 9) * s, bob - 14 * s * squash); ctx.quadraticCurveTo((-34 + k * 9) * s, bob + 2 * s, (-30 + k * 9) * s, bob + 12 * s * squash); ctx.stroke(); }
    ctx.lineCap = 'butt';
    /* the front half: still furred, with ice crusted on it */
    for (const sd of [-1, 1]){ const pw2 = Math.sin(a * 1.4 + (sd > 0 ? 0 : 1.6)) * 4 * s * (1 - sag); lkOV(ctx, (14 + pw2) * s, bob + sd * 16 * s * squash, 9 * s, 7 * s * squash, dk); lkOV(ctx, (14 + pw2) * s, bob + sd * 16 * s * squash, 7.6 * s, 5.8 * s * squash, fur); }
    lkOV(ctx, 8 * s, bob + wob, 29 * s, 22 * s * squash, dk); lkOV(ctx, 8 * s, bob + wob, 27 * s, 20 * s * squash, fur);
    lkOV(ctx, 6 * s, bob + wob - 8 * s * squash, 19 * s, 7 * s * squash, '#FFFFFF');
    for (let k = 0; k < 6; k++){ const px = (-6 + k * 7) * s, py = bob + wob - 19 * s * squash; dm_crystal(ctx, px, py, -Math.PI / 2 + (k - 2.5) * 0.18, (11 + (k % 2) * 6) * s, 3.2 * s, '#BDE6F4', '#F4FFFF'); }       /* ice on its back */
    /* the head: a bear's, with a long snout, round ears, and cold eyes */
    lkOV(ctx, 38 * s, bob + wob, 15 * s, 12.6 * s, dk); lkOV(ctx, 38 * s, bob + wob, 13.4 * s, 11.2 * s, fur);
    lkOV(ctx, 49 * s, bob + 1 * s + wob, 9 * s, 6.4 * s, dk); lkOV(ctx, 49 * s, bob + 1 * s + wob, 7.6 * s, 5.2 * s, '#EAF6FA'); fillCircle(ctx, 55 * s, bob + wob, 2.4 * s, '#10303E');
    for (const sd of [-1, 1]){ fillCircle(ctx, 32 * s, bob + sd * 11 * s + wob, 4.2 * s, dk); fillCircle(ctx, 32 * s, bob + sd * 11 * s + wob, 2.8 * s, fur); dm_eye(ctx, 43 * s, bob + sd * 5 * s + wob, 1.9 * s); }
    if (st === 'shardwind'){ for (let k = -2; k <= 2; k++) dm_crystal(ctx, 20 * s, bob + k * 5 * s, k * 0.24, 20 * s, 3 * s, '#9AD8F0', DM_CY_L); csGlow(ctx, 20 * s, bob, 40 * s, DM_CY, 0.4); }
    /* the melt: drips from the jaw, the belly and the back, and steam where the heat reaches it */
    for (let k = 0; k < 7; k++){ const ph = (t * 0.9 + k * 0.37 + e.x * 0.01) % 1, dx = (-30 + k * 10) * s, dy = bob + (8 + ph * 26) * s; ctx.globalAlpha = 1 - ph; fillCircle(ctx, dx, dy, (2.2 - ph * 0.8) * s, '#CFF4FF'); }
    ctx.globalAlpha = 1;
    for (let k = 0; k < 4; k++){ const ph = (t * 0.5 + k * 0.27) % 1; ctx.globalAlpha = 0.3 * (1 - ph); ctx.fillStyle = '#F4FCFF'; ctx.beginPath(); ctx.ellipse((-18 + k * 14) * s + Math.sin(t + k) * 4 * s, bob - (22 + ph * 30) * s, (6 + ph * 8) * s, (4 + ph * 5) * s, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    csGlow(ctx, -20 * s, bob, 36 * s, DM_CY, 0.2 + 0.1 * Math.sin(t * 2.4));
    if (st === 'meltdown') ringPath(ctx, 0, bob, 50 * s, 4, DM_CY, 0.6);
  },
  dome_iceheart(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 58, t = G.time, a = e.anim, st = e.state, glow = e.glow || 0, ph = e.phase || 1;
    const body = d.color, deep = d.dark, hi = d.pale, rim = dm_mix(body, '#FFFFFF', 0.4), shade = dm_mix(body, deep, 0.5);
    const pulse = 0.6 + 0.4 * Math.sin(t * (2 + ph) + a), roar = st === 'roar', mouth = roar || st === 'novawind';
    /* a cold mist round its feet */
    for (let k = 0; k < 5; k++){ const m = (t * 0.25 + k * 0.2) % 1; ctx.globalAlpha = 0.22 * (1 - m); ctx.fillStyle = '#E8F8FF'; ctx.beginPath(); ctx.ellipse((-30 + k * 16) * s, bob + 22 * s, (22 + m * 20) * s, (10 + m * 6) * s, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    /* a tail of crystals, then four pillar legs */
    for (let k = 0; k < 5; k++) dm_crystal(ctx, -48 * s, bob + (k - 2) * 4 * s, Math.PI + (k - 2) * 0.28 + Math.sin(a * 0.7) * 0.05, (22 + (k % 2) * 8) * s, 5 * s, shade, rim);
    for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){
      const w = Math.sin(a * 1.1 + i * 3 + (sd > 0 ? 0 : 1.6)) * 4 * s, bx = (24 - i * 52) * s;
      dm_poly(ctx, [bx - 10 * s, bob + sd * 14 * s, bx + 10 * s + w, bob + sd * 30 * s, bx + 14 * s + w, bob + sd * 36 * s, bx - 12 * s + w, bob + sd * 36 * s], deep);
      dm_poly(ctx, [bx - 8 * s, bob + sd * 14 * s, bx + 8 * s + w, bob + sd * 30 * s, bx - 10 * s + w, bob + sd * 34 * s], body);
      dm_poly(ctx, [bx - 8 * s, bob + sd * 14 * s, bx + 2 * s + w, bob + sd * 28 * s, bx - 10 * s + w, bob + sd * 34 * s], rim);
    }
    /* the body: a heavy, rough-cut hull with a spine of crystals */
    for (let k = 0; k < 9; k++){ const x = (-44 + k * 9.6) * s; dm_crystal(ctx, x, bob - 28 * s, -Math.PI / 2 + (k - 4) * 0.08, (16 + ((k * 5) % 3) * 8) * s, 4.4 * s, '#9ED4EC', DM_CY_L); }
    dm_poly(ctx, [-58 * s, bob - 4 * s, -44 * s, bob - 30 * s, -6 * s, bob - 38 * s, 30 * s, bob - 32 * s, 52 * s, bob - 12 * s, 50 * s, bob + 16 * s, 18 * s, bob + 30 * s, -34 * s, bob + 28 * s], dk);
    dm_poly(ctx, [-54 * s, bob - 4 * s, -42 * s, bob - 28 * s, -6 * s, bob - 35 * s, 28 * s, bob - 30 * s, 48 * s, bob - 11 * s, 46 * s, bob + 14 * s, 18 * s, bob + 27 * s, -32 * s, bob + 25 * s], body);
    dm_poly(ctx, [-42 * s, bob - 28 * s, -6 * s, bob - 35 * s, 28 * s, bob - 30 * s, 0, bob - 14 * s, -30 * s, bob - 12 * s], rim);
    dm_poly(ctx, [-54 * s, bob - 4 * s, -30 * s, bob - 12 * s, -32 * s, bob + 25 * s], shade);
    ctx.strokeStyle = 'rgba(30,70,100,.5)'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(-30 * s, bob - 12 * s); ctx.lineTo(0, bob - 14 * s); ctx.lineTo(28 * s, bob - 30 * s); ctx.moveTo(0, bob - 14 * s); ctx.lineTo(10 * s, bob + 24 * s); ctx.moveTo(-30 * s, bob - 12 * s); ctx.lineTo(-10 * s, bob + 26 * s); ctx.stroke();
    /* the heart: a great faceted crystal in the open chest, brighter the closer it is to doing something */
    const hx = 12 * s, hy = bob + 2 * s, hr = (15 + 5 * glow + 2 * pulse) * s;
    csGlow(ctx, hx, hy, hr * (3.6 + 2.2 * glow), DM_CY, 0.28 + 0.35 * glow + 0.1 * pulse);
    dm_poly(ctx, [hx - hr * 0.9, hy, hx - hr * 0.3, hy - hr * 1.1, hx + hr * 0.5, hy - hr * 0.9, hx + hr, hy + hr * 0.1, hx + hr * 0.2, hy + hr * 1.1, hx - hr * 0.6, hy + hr * 0.8], '#0C3C58');
    dm_poly(ctx, [hx - hr * 0.7, hy, hx - hr * 0.2, hy - hr * 0.9, hx + hr * 0.4, hy - hr * 0.7, hx + hr * 0.8, hy + hr * 0.1, hx + hr * 0.1, hy + hr * 0.9, hx - hr * 0.5, hy + hr * 0.6], '#37C8F0');
    dm_poly(ctx, [hx - hr * 0.7, hy, hx - hr * 0.2, hy - hr * 0.9, hx + hr * 0.1, hy, hx - hr * 0.5, hy + hr * 0.6], DM_CY_L);
    dm_poly(ctx, [hx + hr * 0.1, hy, hx + hr * 0.4, hy - hr * 0.7, hx + hr * 0.8, hy + hr * 0.1, hx + hr * 0.2, hy + hr * 0.5], '#8CE4FF');
    if (glow > 0.2){ ctx.strokeStyle = 'rgba(230,255,255,' + (0.6 * glow) + ')'; ctx.lineWidth = 2; for (let k = 0; k < 8; k++){ const an = k * TAU / 8 + t * 0.6; ctx.beginPath(); ctx.moveTo(hx + Math.cos(an) * hr * 1.1, hy + Math.sin(an) * hr * 1.1); ctx.lineTo(hx + Math.cos(an) * hr * (1.7 + glow), hy + Math.sin(an) * hr * (1.7 + glow)); ctx.stroke(); } }
    /* the head: a blunt crystal skull with a crown of horns, and eyes lit from inside */
    dm_poly(ctx, [40 * s, bob - 14 * s, 62 * s, bob - 14 * s, 76 * s, bob - 2 * s, 70 * s, bob + 14 * s, 44 * s, bob + 16 * s, 36 * s, bob + 2 * s], dk);
    dm_poly(ctx, [41 * s, bob - 12 * s, 61 * s, bob - 12 * s, 73 * s, bob - 2 * s, 68 * s, bob + 12 * s, 45 * s, bob + 14 * s, 38 * s, bob + 2 * s], body);
    dm_poly(ctx, [41 * s, bob - 12 * s, 61 * s, bob - 12 * s, 56 * s, bob - 2 * s, 40 * s, bob], rim);
    if (mouth){ dm_poly(ctx, [62 * s, bob + 2 * s, 78 * s, bob + 6 * s, 70 * s, bob + 14 * s, 60 * s, bob + 10 * s], '#08202C'); csGlow(ctx, 70 * s, bob + 8 * s, 26 * s, DM_CY, 0.6); }
    for (let k = 0; k < 4; k++){ const sd = k < 2 ? -1 : 1, j = k % 2; dm_crystal(ctx, (46 + j * 8) * s, bob + sd * 12 * s, sd * (0.6 + j * 0.5), (22 + j * 8) * s, 4 * s, '#9ED4EC', DM_CY_L); }
    for (const sd of [-1, 1]) dm_eye(ctx, 62 * s, bob + sd * 6 * s, 2.5 * s);
    if (st === 'novawind') ringPath(ctx, hx, hy, 56 * s, 4, DM_CY, 0.4 + 0.4 * glow);
    if (roar) ringPath(ctx, hx, hy, 70 * s, 5, DM_CY_L, 0.55);
  }
};
Object.assign(ENEMY_LOOK_DRAW, DOME_DRAW);
