'use strict';
/* Enemy art, Chapter 7: Johnson Space Center (SPACE_DRAW). */
/* ======================== Chapter 7: Johnson Space Center ======================== */
/* The military has brought everything it has to the launch site: robot dogs,
   hover tanks, drones, a stealth bomber and a flying fortress. Nothing here is
   piloted in view -- these are machines. Same scheme as every chapter: each
   unit keeps the AI and hitbox of the creature it stands in for.
   One tech faction: every unit shares the same near-black rim color for seams
   and outlines, a steel-blue lift mixed into its panels so green hulls never
   melt into the lawn, lit top edges, bolts, and a lens with a dark ring and a
   tiny glint (cyan unless the unit's own definition says otherwise). */
const SP7_RIM = '#10151C';        /* seams, outlines, joints */
const SP7_STEEL = '#9AA6BA';      /* cool lift mixed into panels and highlights */
const SP7_LENS = '#54E0FF';       /* faction sensor light */
const SP7_TITAN = [-20, -14, 14, -18, 24, -8, 24, 8, 14, 18, -20, 14];
const SP7_TITAN_IN = [-16, -10, 12, -13, 19, -6, 19, 6, 12, 13, -16, 10];
const SP7_HOVER = [-22, -14, 20, -10, 28, 0, 20, 10, -22, 14];
const SP7_HOVER_IN = [-19, -11.4, 18, -7.6, 24, 0, 18, 7.6, -19, 11.4];
const SP7_BOMBER = [[36, 0], [-8, -64], [-16, -60], [-28, -40], [-18, -30], [-32, -14], [-22, -6], [-28, 0]];
const SP7_RAIL_HULL = [-42, -24, 34, -24, 44, -12, 44, 12, 34, 24, -42, 24];
const SP7_RAIL_TUR = [-20, -20, 16, -16, 24, -6, 24, 6, 16, 16, -20, 20];
const SP7_SW_HULL = [-38, -20, 30, -26, 46, -8, 46, 8, 30, 26, -38, 20];
const SP7_SW_LEGS = [[22, -24, 0], [22, 24, Math.PI], [-24, -24, Math.PI], [-24, 24, 0]];

function sp7_mix(c, t){ return blendHex(c, SP7_STEEL, t); }
/* a sensor lens: dark ring, lit color, white glint */
function sp7_lens(ctx, x, y, r, c){
  fillCircle(ctx, x, y, r + 0.9, SP7_RIM); fillCircle(ctx, x, y, r, c);
  fillCircle(ctx, x - r * 0.32, y - r * 0.32, Math.max(0.45, r * 0.36), '#FFFFFF');
}
/* closed polygon from a flat [x,y,x,y...] list, optional fill and outline */
function sp7_poly(ctx, pts, ox, oy, fill, edge, lw){
  ctx.beginPath(); ctx.moveTo(pts[0] + ox, pts[1] + oy);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] + ox, pts[i + 1] + oy);
  ctx.closePath();
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (edge){ ctx.strokeStyle = edge; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineJoin = 'miter'; }
}
/* a riveted plate: edge color, fill, lit top strip */
function sp7_plate(ctx, x, y, w, h, fill, edge, hl){
  ctx.fillStyle = edge; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill; ctx.fillRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
  if (hl){ ctx.fillStyle = hl; ctx.fillRect(x + 0.8, y + 0.8, w - 1.6, Math.min(1.5, h * 0.3)); }
}
/* many small dots (rivets / bolts) in one path */
function sp7_dots(ctx, pts, oy, r, c){
  ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2){ ctx.moveTo(pts[i] + r, pts[i + 1] + oy); ctx.arc(pts[i], pts[i + 1] + oy, r, 0, TAU); }
  ctx.fill();
}

const SPACE_DRAW = {
  quadbot(ctx, e, b, dk, bob, wind, d){
    const ph = e.anim * 7, lt = blendHex(b, '#FFFFFF', 0.55), sh = shade(b, -0.22), jt = sp7_mix(dk, 0.4);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 4; i++){                                   /* four jointed legs */
      const sx = i & 1 ? 1 : -1, fx = i & 2 ? 1 : -1;
      const s = Math.sin(ph + (fx > 0 ? 0 : Math.PI) + (sx > 0 ? 0 : Math.PI * 0.5)) * 3;
      const hx = fx * 9, hy = bob + sx * 6.4, kx = hx + fx * 3 + s, ky = hy + sx * 7, px = hx + fx + s * 1.6, py = hy + sx * 13;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(px, py);
      ctx.strokeStyle = dk; ctx.lineWidth = 3.6; ctx.stroke();
      ctx.strokeStyle = jt; ctx.lineWidth = 1.3; ctx.stroke();
      fillCircle(ctx, kx, ky, 2.3, SP7_RIM); fillCircle(ctx, kx, ky, 1.5, dk);   /* knee joint */
      fillCircle(ctx, px, py, 2.4, SP7_RIM); fillCircle(ctx, px - 0.3, py - 0.3, 1.1, jt);   /* foot pad */
    }
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    lkOV(ctx, 0, bob, 14, 7.4, dk);                               /* rim */
    lkOV(ctx, 0, bob, 13, 6.4, b);
    lkOV(ctx, 2.4, bob - 2.6, 8.4, 2, lt);                        /* lit shoulder */
    lkOV(ctx, 0, bob + 3.4, 11, 2, sh);                           /* underside shade */
    ctx.fillStyle = dk; ctx.fillRect(-10.4, bob - 3.8, 11.4, 7.6);      /* power pack */
    ctx.fillStyle = jt; for (let k = 0; k < 3; k++) ctx.fillRect(-9 + k * 3.2, bob - 3.2, 1.2, 6.4);
    lkOV(ctx, -3.4, bob, 4.4, 2, d.pale);                          /* status stripe */
    ctx.strokeStyle = sh; ctx.lineWidth = 0.9; ctx.beginPath();     /* plate seams */
    ctx.moveTo(4.6, bob - 5.4); ctx.lineTo(4.6, bob + 5.4); ctx.moveTo(8.4, bob - 4.6); ctx.lineTo(8.4, bob + 4.6); ctx.stroke();
    for (let i = 0; i < 4; i++){ const sx = i & 1 ? 1 : -1, fx = i & 2 ? 1 : -1; fillCircle(ctx, fx * 9, bob + sx * 6.4, 2.6, SP7_RIM); fillCircle(ctx, fx * 9, bob + sx * 6.4, 1.7, dk); fillCircle(ctx, fx * 9 - 0.4, bob + sx * 6.4 - 0.4, 0.8, jt); }
    ctx.fillStyle = dk; ctx.fillRect(10, bob - 2, 3, 4);           /* neck */
    lkOV(ctx, 14.6, bob, 5.4, 5, dk);                              /* sensor head */
    lkOV(ctx, 14, bob - 1.4, 3.6, 1.6, jt);
    fillCircle(ctx, 15.4, bob - 4.2, 1, d.pale); fillCircle(ctx, 15.4, bob + 4.2, 1, d.pale);   /* side sensors */
    sp7_lens(ctx, 17.6, bob, 2.3, SP7_LENS);
    lkLN(ctx, [-11, bob, -15, bob - 3, -19, bob - 6.4], 1.2, dk);   /* antenna */
    fillCircle(ctx, -19, bob - 6.4, 1.1, d.pale);
  },
  scoutrover(ctx, e, b, dk, bob, wind, d){
    const lt = blendHex(b, '#FFFFFF', 0.4), sh = shade(b, -0.28), jt = sp7_mix(dk, 0.4);
    for (let s = -1; s <= 1; s += 2){                              /* rocker-bogie booms and six wheels */
      lkLN(ctx, [-9, bob + s * 8.4, 0, bob + s * 7, 9, bob + s * 8.4], 1.6, dk);
      for (let k = -1; k <= 1; k++){
        const wx = k * 9;
        sp7_plate(ctx, wx - 4, bob + s * 8.4 - 2.2, 8, 4.4, dk, SP7_RIM, null);
        ctx.strokeStyle = '#8A8E94'; ctx.lineWidth = 0.9; ctx.beginPath();
        const t = e.anim * 5 + k; ctx.moveTo(wx - Math.cos(t) * 3, bob + s * 8.4); ctx.lineTo(wx + Math.cos(t) * 3, bob + s * 8.4); ctx.stroke();
        fillCircle(ctx, wx, bob + s * 8.4, 0.9, jt);
      }
    }
    ctx.fillStyle = SP7_RIM; ctx.fillRect(-13, bob - 7.6, 26, 15.2);       /* chassis */
    ctx.fillStyle = b; ctx.fillRect(-12, bob - 6.6, 24, 13.2);
    ctx.fillStyle = lt; ctx.fillRect(-12, bob - 6.6, 24, 1.6);
    ctx.fillStyle = sh; ctx.fillRect(-12, bob + 5, 24, 1.6);
    sp7_dots(ctx, [-11, -5.6, 11, -5.6, -11, 5.6, 11, 5.6, 4.6, -5.6, 4.6, 5.6], bob, 0.7, dk);
    ctx.fillStyle = dk; ctx.fillRect(-10.8, bob - 5.8, 14.6, 11.6);          /* solar array frame */
    ctx.fillStyle = d.pale; ctx.fillRect(-10, bob - 5, 13, 10);
    ctx.strokeStyle = 'rgba(0,0,40,.45)'; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let k = 1; k < 4; k++){ ctx.moveTo(-10 + k * 3.25, bob - 5); ctx.lineTo(-10 + k * 3.25, bob + 5); } ctx.moveTo(-10, bob); ctx.lineTo(3, bob); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, bob - 4); ctx.lineTo(-4, bob - 4); ctx.stroke();   /* glint */
    ctx.fillStyle = dk; ctx.fillRect(5, bob - 4.6, 6, 9.2);                  /* instrument deck */
    ctx.fillStyle = jt; ctx.fillRect(6, bob - 3.6, 4, 2); ctx.fillRect(6, bob + 1.6, 4, 2);
    lkOV(ctx, -13, bob, 1.8, 4.2, dk); lkOV(ctx, -13.4, bob, 0.9, 3, lt);     /* rear dish */
    lkLN(ctx, [11, bob + 4.4, 16, bob + 6.4, 18, bob + 4.4], 1.3, dk);        /* sampling arm */
    lkLN(ctx, [6, bob, 12, bob], 1.8, dk);                                    /* mast */
    fillCircle(ctx, 14, bob, 3, dk); fillCircle(ctx, 14, bob, 2.2, jt);
    sp7_lens(ctx, 15, bob, 1.4, '#FF4A3A');
  },
  hoverbike(ctx, e, b, dk, bob, wind, d){
    const lt = blendHex(b, '#FFFFFF', 0.28), jt = sp7_mix(dk, 0.5), hl = sp7_mix(b, 0.45);
    if (wind) ringPath(ctx, 0, bob, 24, 2.5, '#FFFFFF', 0.7);
    if (e.state === 'dash'){ ctx.globalAlpha = 0.5; lkTRI(ctx, -8, bob - 4, -34, bob, -8, bob + 4, d.pale); ctx.globalAlpha = 1; }
    softBlob(ctx, -3, bob, 16, d.pale, 0.18 + 0.08 * Math.sin(e.anim * 6));
    lkLN(ctx, [-6, bob - 5, -6, bob - 8, 0, bob - 5], 1.6, dk); lkLN(ctx, [-6, bob + 5, -6, bob + 8, 0, bob + 5], 1.6, dk);   /* struts */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -3, bob + s * 8, 9, 3.2, SP7_RIM); lkOV(ctx, -3, bob + s * 8, 8, 2.6, dk);     /* thruster pods */
      lkOV(ctx, -2, bob + s * 7.2, 5.6, 0.9, jt);
      lkOV(ctx, -8.4, bob + s * 8, 3, 1.7, d.pale);
      softBlob(ctx, -10, bob + s * 8, 3.6, d.pale, 0.35 + 0.25 * Math.sin(e.anim * 9 + s));
      lkTRI(ctx, 3, bob + s * 4.4, 8, bob + s * 9.4, 8.4, bob + s * 4.4, dk);                   /* canards */
    }
    lkLN(ctx, [-12, bob - 4.6, -18, bob - 5.6], 2, dk); lkLN(ctx, [-12, bob + 4.6, -18, bob + 5.6], 2, dk);   /* tail fins */
    lkTRI(ctx, 11, bob - 4.8, 23.4, bob, 11, bob + 4.8, SP7_RIM);
    lkOV(ctx, 0, bob, 15, 5.8, SP7_RIM);
    lkOV(ctx, 0, bob, 14, 4.8, b);
    lkTRI(ctx, 12, bob - 3.8, 22, bob, 12, bob + 3.8, b);
    lkOV(ctx, 0, bob - 2.4, 11, 1.2, hl);                         /* lit crest */
    lkLN(ctx, [-12, bob, 13, bob], 0.9, dk);                      /* spine seam */
    lkOV(ctx, -7, bob, 3.2, 3, dk); lkOV(ctx, -7, bob, 1.8, 1.8, lt);   /* engine cowl */
    lkOV(ctx, 6, bob, 5.6, 3.2, SP7_RIM); lkOV(ctx, 6, bob, 4.6, 2.4, d.pale);   /* canopy */
    lkOV(ctx, 7, bob - 0.9, 2.2, 0.8, 'rgba(255,255,255,.85)');
    fillCircle(ctx, 20.2, bob, 1.1, d.pale);                      /* nose light */
  },
  crawlerbot(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.4), lt = sp7_mix(b, 0.62), sh = shade(b, -0.3), jt = sp7_mix(dk, 0.4);
    drawTreads(ctx, -12, bob - 11, 24, 5.4, dk, e.anim); drawTreads(ctx, -12, bob + 5.6, 24, 5.4, dk, e.anim);
    for (let s = -1; s <= 1; s += 2){
      for (let k = 0; k < 4; k++){ const x = -9 + k * 6; fillCircle(ctx, x, bob + s * 8.3, 2.1, jt); fillCircle(ctx, x, bob + s * 8.3, 0.9, dk); }
    }
    lkTRI(ctx, 11, bob - 6.6, 20.4, bob - 9, 15, bob - 3, d.pale); lkTRI(ctx, 11, bob + 6.6, 20.4, bob + 9, 15, bob + 3, d.pale);   /* plow tusks */
    ctx.fillStyle = SP7_RIM; ctx.fillRect(-11.4, bob - 8.4, 22.8, 16.8);
    ctx.fillStyle = pl; ctx.fillRect(-10, bob - 7, 20, 14);
    ctx.fillStyle = lt; ctx.fillRect(-10, bob - 7, 20, 1.8);
    ctx.fillStyle = sh; ctx.fillRect(-10, bob + 5.4, 20, 1.6);
    sp7_poly(ctx, [10, -7, 15.4, -3.6, 15.4, 3.6, 10, 7], 0, bob, lt, SP7_RIM, 1);   /* sloped glacis */
    ctx.fillStyle = dk; ctx.fillRect(-9.4, bob - 6, 5.6, 12);       /* engine deck */
    ctx.fillStyle = jt; for (let k = 0; k < 4; k++) ctx.fillRect(-8.6, bob - 4.8 + k * 3, 4, 1.1);
    sp7_plate(ctx, -2.6, bob - 6, 3.2, 4, d.pale, dk, null);        /* marking panel */
    sp7_dots(ctx, [-2, 5.6, 7.4, -5.8, 7.4, 5.8], bob, 0.7, dk);
    lkLN(ctx, [3, bob, 17, bob], 2.8, dk); lkLN(ctx, [4, bob - 0.7, 15, bob - 0.7], 0.9, jt);
    ctx.fillStyle = SP7_RIM; ctx.fillRect(15.4, bob - 2.4, 3.4, 4.8); ctx.fillStyle = jt; ctx.fillRect(16, bob - 1.4, 1.4, 2.8);   /* muzzle brake */
    fillCircle(ctx, 3, bob, 6.2, SP7_RIM); fillCircle(ctx, 3, bob, 5.4, dk); fillCircle(ctx, 3, bob, 4.2, pl);
    ringPath(ctx, 3, bob, 2.6, 0.9, SP7_RIM, 1);
    fillCircle(ctx, 2.2, bob - 1.4, 1.8, lt);
    sp7_lens(ctx, 5.6, bob + 2, 1.2, SP7_LENS);
  },
  hovertank(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.22), lt = sp7_mix(b, 0.5), sh = shade(b, -0.3), jt = sp7_mix(dk, 0.45);
    if (wind) ringPath(ctx, 0, bob, 34, 4, '#FF6A4A', 0.6);
    const pulse = 0.5 + 0.5 * Math.sin(G.time * 8 + e.anim);
    softBlob(ctx, 0, bob, 30, d.pale, 0.16 + pulse * 0.1);
    lkOV(ctx, 0, bob, 26, 18, dk);                              /* skirt */
    ctx.strokeStyle = jt; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, bob, 25, 17, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, bob, 22, 15, 0, 0, TAU); ctx.strokeStyle = SP7_RIM; ctx.stroke();
    sp7_poly(ctx, SP7_HOVER, 0, bob, pl, SP7_RIM, 1.6);       /* hull */
    sp7_poly(ctx, SP7_HOVER_IN, 0, bob, lt, null, 0);
    sp7_poly(ctx, [-19, 1, 24, 0, 18, 7.6, -19, 11.4], 0, bob, pl, null, 0);   /* lower half stays mid tone */
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1; ctx.beginPath();           /* armor seams */
    ctx.moveTo(-8, bob - 12); ctx.lineTo(-8, bob + 12); ctx.moveTo(15, bob - 8); ctx.lineTo(19, bob); ctx.lineTo(15, bob + 8);
    ctx.moveTo(-19, bob - 6); ctx.lineTo(-8, bob - 6); ctx.moveTo(-19, bob + 6); ctx.lineTo(-8, bob + 6); ctx.stroke();
    ctx.fillStyle = dk; for (let k = 0; k < 3; k++) ctx.fillRect(-21, bob - 3.6 + k * 2.8, 5.6, 1.4);   /* exhaust vents */
    sp7_dots(ctx, [-12, -10.6, -12, 10.6, 8, -8, 8, 8, 21, -4.4, 21, 4.4], bob, 0.8, dk);
    const sp = G.time * 26;
    for (let k = 0; k < 4; k++){                                 /* lift fans */
      const fx = k & 1 ? 18 : -18, fy = k & 2 ? 15 : -15;
      const gy = (k & 1) ? (k & 2 ? 11 : -11) : fy;
      fillCircle(ctx, fx, bob + gy, 4.8, SP7_RIM); fillCircle(ctx, fx, bob + gy, 3.9, dk);
      ctx.strokeStyle = d.pale; ctx.lineWidth = 1.1; ctx.beginPath();
      const a = sp + k; ctx.moveTo(fx + Math.cos(a) * 3.4, bob + gy + Math.sin(a) * 3.4); ctx.lineTo(fx - Math.cos(a) * 3.4, bob + gy - Math.sin(a) * 3.4);
      ctx.moveTo(fx - Math.sin(a) * 3.4, bob + gy + Math.cos(a) * 3.4); ctx.lineTo(fx + Math.sin(a) * 3.4, bob + gy - Math.cos(a) * 3.4); ctx.stroke();
      fillCircle(ctx, fx, bob + gy, 1.1, jt);
    }
    for (let s = -1; s <= 1; s += 2){                            /* twin barrels */
      lkLN(ctx, [6, bob + s * 2.4, 34, bob + s * 2.4], 2.8, SP7_RIM);
      lkLN(ctx, [6, bob + s * 2.4, 34, bob + s * 2.4], 1.8, dk);
      lkLN(ctx, [8, bob + s * 2.4 - 0.5, 30, bob + s * 2.4 - 0.5], 0.7, jt);
      ctx.fillStyle = SP7_RIM; ctx.fillRect(32, bob + s * 2.4 - 2, 4.4, 4);
    }
    sp7_poly(ctx, [2, -10, 10, -5, 10, 5, 2, 10, -6, 5, -6, -5], 0, bob, SP7_RIM, null, 0);     /* turret */
    sp7_poly(ctx, [2, -8.6, 8.8, -4.4, 8.8, 4.4, 2, 8.6, -4.8, 4.4, -4.8, -4.4], 0, bob, pl, null, 0);
    sp7_poly(ctx, [2, -8.6, 8.8, -4.4, -4.8, -4.4], 0, bob, lt, null, 0);
    ringPath(ctx, 0.4, bob + 1, 3.6, 1, SP7_RIM, 1);
    fillCircle(ctx, 5, bob, 2.6, SP7_RIM); fillCircle(ctx, 5, bob, 2, d.pale); fillCircle(ctx, 4.4, bob - 0.7, 0.7, '#FFFFFF');
  },
  quadcopter(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.28), lt = sp7_mix(b, 0.6), jt = sp7_mix(dk, 0.5);
    lkLN(ctx, [-9, bob - 9, 9, bob + 9], 2.6, dk); lkLN(ctx, [-9, bob + 9, 9, bob - 9], 2.6, dk);
    lkLN(ctx, [-9, bob - 9, 9, bob + 9], 0.9, jt); lkLN(ctx, [-9, bob + 9, 9, bob - 9], 0.9, jt);
    for (let k = 0; k < 4; k++){ const px = k & 1 ? 9 : -9, py = k & 2 ? 9 : -9; fillCircle(ctx, px, bob + py, 3.8, SP7_RIM); fillCircle(ctx, px, bob + py, 3, jt); }   /* motor housings */
    for (const px of [-9, 9]) for (const py of [-9, 9]) drawRotor(ctx, px, bob + py, 6.4, 2, G.time * 60 + px + py, '#4A4E56');
    sp7_poly(ctx, [-5, -6, 5, -6, 7, -3, 7, 3, 5, 6, -5, 6, -7, 3, -7, -3], 0, bob, SP7_RIM, null, 0);   /* fuselage */
    sp7_poly(ctx, [-4.6, -5, 4.6, -5, 6, -2.8, 6, 2.8, 4.6, 5, -4.6, 5, -6, 2.8, -6, -2.8], 0, bob, pl, null, 0);
    ctx.fillStyle = lt; ctx.fillRect(-4.2, bob - 4.6, 8.4, 1.6);
    ctx.fillStyle = dk; ctx.fillRect(-5.6, bob - 2.6, 4, 5.2);     /* battery */
    ctx.fillStyle = jt; ctx.fillRect(-4.8, bob - 1.6, 2.2, 0.8); ctx.fillRect(-4.8, bob + 0.8, 2.2, 0.8);
    fillCircle(ctx, 5.6, bob, 3.2, SP7_RIM); fillCircle(ctx, 5.6, bob, 2.5, dk);          /* gimbal camera */
    sp7_lens(ctx, 6.4, bob, 1.5, d.pale);
    if (Math.sin(G.time * 7 + e.anim) > 0) fillCircle(ctx, -3.6, bob, 1.1, '#FF3A3A');
    fillCircle(ctx, -9, bob - 9, 0.8, d.pale); fillCircle(ctx, 9, bob - 9, 0.8, d.pale);
  },
  sentrywalker(ctx, e, b, dk, bob, wind, d){
    const st = Math.sin(e.anim * 6) * 3.2, pl = sp7_mix(b, 0.2), lt = sp7_mix(b, 0.55), sh = shade(b, -0.3), jt = sp7_mix(dk, 0.45);
    for (let s = -1; s <= 1; s += 2){                            /* two jointed legs with foot plates */
      const fx = s < 0 ? st : -st, fy = bob + s * 8;
      lkLN(ctx, [0, bob + s * 4, fx * 0.4 + 1.6, bob + s * 6.8, fx, fy], 3, dk);
      lkLN(ctx, [0, bob + s * 4, fx * 0.4 + 1.6, bob + s * 6.8, fx, fy], 1, jt);
      fillCircle(ctx, fx * 0.4 + 1.6, bob + s * 6.8, 2.2, SP7_RIM); fillCircle(ctx, fx * 0.4 + 1.6, bob + s * 6.8, 1.2, pl);
      lkOV(ctx, fx + 1, fy, 6, 3.4, SP7_RIM); lkOV(ctx, fx + 1, fy, 5, 2.6, dk); lkOV(ctx, fx + 2, fy - 0.6, 3, 1, jt);
    }
    ctx.fillStyle = SP7_RIM; ctx.fillRect(-10, bob - 7, 6.4, 14);     /* power pack */
    ctx.fillStyle = dk; ctx.fillRect(-9.2, bob - 6.2, 4.8, 12.4);
    ctx.fillStyle = jt; for (let k = 0; k < 4; k++) ctx.fillRect(-8.6, bob - 5 + k * 3, 3.6, 1);
    fillCircle(ctx, -6.8, bob, 1.1, d.pale);
    lkOV(ctx, 0, bob, 9.2, 8.2, SP7_RIM);                         /* torso */
    lkOV(ctx, 0, bob, 8.4, 7.4, b);
    lkOV(ctx, 1, bob - 3, 6.2, 2.4, lt);
    lkOV(ctx, 0, bob + 3.8, 6.6, 2, sh);
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-2, bob - 6.6); ctx.lineTo(-2, bob + 6.6); ctx.stroke();
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 3, bob + s * 7.2, 4, SP7_RIM); fillCircle(ctx, 3, bob + s * 7.2, 3.2, pl); fillCircle(ctx, 2.4, bob + s * 7.2 - 0.8, 1.4, lt);   /* pauldron */
      lkLN(ctx, [5, bob + s * 7, 16, bob + s * 7], 3.4, SP7_RIM);     /* arm guns */
      lkLN(ctx, [5, bob + s * 7, 16, bob + s * 7], 2.4, dk);
      ctx.fillStyle = jt; ctx.fillRect(9, bob + s * 7 - 2.4, 1.4, 4.8); ctx.fillRect(13, bob + s * 7 - 2, 1.2, 4);
      fillCircle(ctx, 16.4, bob + s * 7, 1.7, '#FFB030');
    }
    fillCircle(ctx, 6.4, bob, 4.6, SP7_RIM); fillCircle(ctx, 6.4, bob, 3.9, pl);  /* head */
    lkOV(ctx, 7.6, bob, 2.4, 3.2, SP7_RIM); lkOV(ctx, 7.8, bob, 1.9, 2.6, d.pale);   /* visor */
    fillCircle(ctx, 7.2, bob - 1, 0.7, '#FFFFFF');
  },
  reaperdrone(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.25), lt = sp7_mix(b, 0.6), sh = shade(b, -0.28), jt = sp7_mix(dk, 0.35);
    lkOV(ctx, -2, bob, 5, 26, SP7_RIM);
    lkOV(ctx, -2, bob, 3.8, 25, b);                             /* long straight wings */
    lkOV(ctx, -0.6, bob, 1.6, 24, lt);                           /* lit leading edge */
    lkOV(ctx, -3.6, bob, 1.4, 23, sh);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.8; ctx.beginPath();
    ctx.moveTo(-2, bob - 25); ctx.lineTo(-2, bob + 25);
    for (let k = -3; k <= 3; k++){ if (!k) continue; ctx.moveTo(-5, bob + k * 7); ctx.lineTo(1, bob + k * 7); }
    ctx.stroke();
    for (let s = -1; s <= 1; s += 2){
      lkLN(ctx, [0, bob + s * 13, 0, bob + s * 8], 1.4, dk); lkLN(ctx, [0, bob + s * 19, 0, bob + s * 14], 1.4, dk);   /* pylons */
      for (let k = 0; k < 2; k++){
        const y = bob + s * (13 + k * 6);
        lkOV(ctx, 1, y, 5.4, 2.2, SP7_RIM); lkOV(ctx, 1, y, 4.6, 1.6, jt); fillCircle(ctx, 5.6, y, 1.1, d.pale);   /* missiles */
        lkTRI(ctx, -3, y, -5.6, y - 2.6, -3.2, y - 0.4, dk); lkTRI(ctx, -3, y, -5.6, y + 2.6, -3.2, y + 0.4, dk);
      }
      fillCircle(ctx, -2, bob + s * 25, 1.1, s > 0 ? '#FF4A3A' : '#5AFF8A');          /* wingtip nav lights */
    }
    lkTRI(ctx, -12, bob, -23, bob - 10, -16, bob, SP7_RIM); lkTRI(ctx, -12, bob, -23, bob + 10, -16, bob, SP7_RIM);   /* V-tail */
    lkTRI(ctx, -12.4, bob, -21.4, bob - 8.6, -15.4, bob, dk); lkTRI(ctx, -12.4, bob, -21.4, bob + 8.6, -15.4, bob, dk);
    lkOV(ctx, 0, bob, 18, 4.8, SP7_RIM);
    lkOV(ctx, 0, bob, 17, 3.8, b);
    lkOV(ctx, 1, bob - 1.5, 12, 1.1, lt);
    lkOV(ctx, -6, bob, 5, 1.2, dk);                               /* dorsal intake */
    lkOV(ctx, 15, bob, 5.4, 4.2, SP7_RIM); lkOV(ctx, 15, bob, 4.6, 3.6, dk);    /* sensor ball */
    sp7_lens(ctx, 16.4, bob - 0.4, 1.9, d.pale);
    ctx.globalAlpha = 0.3; fillCircle(ctx, -18, bob, 6, '#FFFFFF'); ctx.globalAlpha = 1;   /* rear propeller */
    ctx.save(); ctx.translate(-18, bob); ctx.rotate(G.time * 50); lkLN(ctx, [-6, 0, 6, 0], 1, '#2A2A2A'); lkLN(ctx, [0, -6, 0, 6], 1, '#2A2A2A'); ctx.restore();
    fillCircle(ctx, -18, bob, 1.8, dk);
  },
  snakebot(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.5), lt = sp7_mix(b, 0.8), jt = sp7_mix(dk, 0.5), n = 11, ph = e.anim * 3;
    let lx = 0, ly = 0;
    for (let i = 0; i < n; i++){                                  /* dark rim pass, tail first */
      const t = i / (n - 1), y = bob + Math.sin(i * 0.9 + ph) * 4.6 * (1 - t * 0.6);
      fillCircle(ctx, -26 + 32 * t, y, 2.6 + 1.2 * t + 1.1, SP7_RIM);
    }
    for (let i = 0; i < n; i++){                                  /* segment pass */
      const t = i / (n - 1), x = -26 + 32 * t, y = bob + Math.sin(i * 0.9 + ph) * 4.6 * (1 - t * 0.6), r = 2.6 + 1.2 * t;
      fillCircle(ctx, x, y, r, pl);
      if (i & 1){ fillCircle(ctx, x, y, r * 0.85, dk); fillCircle(ctx, x - r * 0.15, y - r * 0.2, r * 0.45, jt); }
      else { fillCircle(ctx, x - r * 0.2, y - r * 0.25, r * 0.62, lt); }
      lx = x; ly = y;
    }
    lkLN(ctx, [-26, bob + Math.sin(ph) * 4.6, -30, bob + Math.sin(ph) * 4.6 * 1.1 + 1], 1.6, dk);    /* tail spike */
    fillCircle(ctx, -30, bob + Math.sin(ph) * 5 + 1, 1.2, d.pale);
    lkTRI(ctx, 3, bob - 6.6, 8, bob - 3, 3, bob - 1, SP7_RIM); lkTRI(ctx, 3, bob + 6.6, 8, bob + 3, 3, bob + 1, SP7_RIM);   /* hood flanges */
    lkTRI(ctx, 3.4, bob - 5.4, 7.2, bob - 2.8, 3.4, bob - 1.4, dk); lkTRI(ctx, 3.4, bob + 5.4, 7.2, bob + 2.8, 3.4, bob + 1.4, dk);
    lkTRI(ctx, 5, bob - 5.4, 16, bob, 5, bob + 5.4, SP7_RIM);      /* wedge head */
    lkTRI(ctx, 6, bob - 4.2, 14.4, bob, 6, bob + 4.2, dk);
    lkTRI(ctx, 7, bob - 3, 12, bob - 0.4, 7, bob - 0.4, jt);
    lkLN(ctx, [14, bob - 1.4, 17.4, bob - 2.4], 0.9, '#E8E8E8'); lkLN(ctx, [14, bob + 1.4, 17.4, bob + 2.4], 0.9, '#E8E8E8');   /* fangs */
    sp7_lens(ctx, 10, bob - 2.2, 1.3, d.pale); sp7_lens(ctx, 10, bob + 2.2, 1.3, d.pale);
  },
  swarmcarrier(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.2), lt = sp7_mix(b, 0.55), jt = sp7_mix(dk, 0.4);
    ctx.beginPath();
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(Math.cos(a) * 13.4, bob + Math.sin(a) * 13.4); }
    ctx.closePath(); ctx.fillStyle = SP7_RIM; ctx.fill();
    ctx.fillStyle = b; ctx.beginPath();
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(Math.cos(a) * 12, bob + Math.sin(a) * 12); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = lt; ctx.beginPath();                          /* lit upper plates */
    for (let k = 3; k <= 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(Math.cos(a) * 11, bob + Math.sin(a) * 11); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = jt; ctx.lineWidth = 1; ctx.beginPath();     /* radial seams */
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3 + 0.52; ctx.moveTo(Math.cos(a) * 4.4, bob + Math.sin(a) * 4.4); ctx.lineTo(Math.cos(a) * 10.2, bob + Math.sin(a) * 10.2); }
    ctx.stroke();
    for (let k = 0; k < 6; k++){                                  /* docked micro-drones */
      const a = k / 6 * TAU + 0.3, x = Math.cos(a) * 7.8, y = bob + Math.sin(a) * 7.8;
      fillCircle(ctx, x, y, 3.5, SP7_RIM); fillCircle(ctx, x, y, 2.9, dk);
      ctx.strokeStyle = jt; ctx.lineWidth = 0.9; ctx.beginPath();
      ctx.moveTo(x - 2.2, y - 2.2); ctx.lineTo(x + 2.2, y + 2.2); ctx.moveTo(x - 2.2, y + 2.2); ctx.lineTo(x + 2.2, y - 2.2); ctx.stroke();
      fillCircle(ctx, x, y, 1.5, d.pale);
    }
    fillCircle(ctx, 0, bob, 4.6, SP7_RIM); fillCircle(ctx, 0, bob, 3.8, dk); fillCircle(ctx, 0, bob, 2.2, d.pale);
    fillCircle(ctx, -0.6, bob - 0.7, 0.8, '#FFFFFF');
  },
  microdrone(ctx, e, b, dk, bob, wind, d){
    const lt = sp7_mix(b, 0.55);
    lkLN(ctx, [-4, bob - 4, 4, bob + 4], 1.4, dk); lkLN(ctx, [-4, bob + 4, 4, bob - 4], 1.4, dk);
    for (const px of [-4, 4]) for (const py of [-4, 4]){ fillCircle(ctx, px, bob + py, 1.9, SP7_RIM); }
    for (const px of [-4, 4]) for (const py of [-4, 4]) drawRotor(ctx, px, bob + py, 3, 2, G.time * 80 + px * py, '#5A6068');
    fillCircle(ctx, 0, bob, 3.4, SP7_RIM); fillCircle(ctx, 0, bob, 2.7, b);
    ctx.fillStyle = lt; ctx.fillRect(-1.6, bob - 2.3, 3.2, 1);
    fillCircle(ctx, 1.4, bob, 1, dk);
    if (Math.sin(G.time * 9 + e.anim) > 0) fillCircle(ctx, -0.8, bob, 1, d.pale);
  },
  plasmaorb(ctx, e, b, dk, bob, wind, d){
    softBlob(ctx, 0, bob, 17, b, 0.32 + 0.1 * Math.sin(e.anim * 4));
    const sp = G.time * 0.9;
    for (let k = 0; k < 4; k++){                                  /* emitter clamps */
      const a = sp + k * TAU / 4, cx = Math.cos(a), cy = Math.sin(a);
      lkOV(ctx, cx * 11.6, bob + cy * 11.6, 3.2, 2, SP7_RIM, a); lkOV(ctx, cx * 11.6, bob + cy * 11.6, 2.4, 1.3, dk, a);
      fillCircle(ctx, cx * 13.4, bob + cy * 13.4, 1.2, d.pale);
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.8;                    /* dark under-stroke for contrast */
    for (let k = 0; k < 2; k++){ ctx.beginPath(); ctx.ellipse(0, bob, 10.4, 4, G.time * 3 + k * 1.5, 0, TAU); ctx.stroke(); }
    fillCircle(ctx, 0, bob, 7.6, SP7_RIM); fillCircle(ctx, 0, bob, 6.4, dk); fillCircle(ctx, 0, bob, 5.2, b); fillCircle(ctx, 0, bob, 4.6, d.pale);
    ctx.strokeStyle = b; ctx.lineWidth = 1.3;
    for (let k = 0; k < 2; k++){ ctx.beginPath(); ctx.ellipse(0, bob, 10.4, 4, G.time * 3 + k * 1.5, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.8; ctx.beginPath();   /* arcing current */
    for (let k = 0; k < 4; k++){
      const a = sp + k * TAU / 4 + 0.4, cx = Math.cos(a), cy = Math.sin(a), j = Math.sin(G.time * 22 + k * 3) * 1.5;
      ctx.moveTo(cx * 4.6, bob + cy * 4.6); ctx.lineTo(cx * 7.4 - cy * j, bob + cy * 7.4 + cx * j); ctx.lineTo(cx * 10.2 + cy * j, bob + cy * 10.2 - cx * j);
    }
    ctx.stroke();
    for (let k = 0; k < 3; k++){ const a = G.time * 4 + k * 2.1; fillCircle(ctx, Math.cos(a) * 10.4, bob + Math.sin(a) * 4, 1.3, '#FFFFFF'); }
  },
  titanmech(ctx, e, b, dk, bob, wind, d){
    const st = Math.sin(e.anim * 3) * 7;
    const pl = sp7_mix(b, 0.34), lt = sp7_mix(b, 0.6), sh = shade(b, -0.25), jt = sp7_mix(dk, 0.4), inl = sp7_mix(b, 0.46);
    for (const s of [-1, 1]){                                   /* two stomping legs */
      const fx = s > 0 ? st : -st, ky = bob + s * 18.4, kx = (fx - 4) * 0.5;
      lkLN(ctx, [-4, bob + s * 13, fx, bob + s * 24], 7, SP7_RIM);
      lkLN(ctx, [-4, bob + s * 13, fx, bob + s * 24], 5.6, dk);
      lkLN(ctx, [-4, bob + s * 13, fx, bob + s * 24], 1.6, jt);
      for (let k = 0; k < 3; k++) lkTRI(ctx, fx + 15, bob + s * 26 - 4.6 + k * 4.6, fx + 22, bob + s * 26 - 3.2 + k * 4.6, fx + 15, bob + s * 26 - 2.4 + k * 4.6, SP7_RIM);   /* toe claws */
      lkOV(ctx, fx + 4, bob + s * 26, 14, 9, SP7_RIM); lkOV(ctx, fx + 4, bob + s * 26, 13, 8, dk);
      lkOV(ctx, fx + 6, bob + s * 26, 9.6, 5.8, pl); lkOV(ctx, fx + 7, bob + s * 26 - s * 1.6, 6.4, 1.8, lt);
      ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(fx + 1, bob + s * 21.4); ctx.lineTo(fx + 1, bob + s * 30.6); ctx.stroke();
      fillCircle(ctx, kx, ky, 5.4, SP7_RIM); fillCircle(ctx, kx, ky, 4.4, pl); fillCircle(ctx, kx - 0.8, ky - 0.8, 1.8, lt);   /* knee guard */
    }
    softBlob(ctx, -16, bob, 18, d.pale, 0.22 + 0.1 * Math.sin(e.anim * 5));   /* reactor glow */
    sp7_poly(ctx, SP7_TITAN, 0, bob, pl, SP7_RIM, 2.2);
    sp7_poly(ctx, SP7_TITAN_IN, 0, bob, inl, null, 0);
    sp7_poly(ctx, [-16, -10, 12, -13, 19, -6, -16, -2], 0, bob, lt, null, 0);       /* lit top half */
    sp7_poly(ctx, [-16, 2, 19, 6, 12, 13, -16, 10], 0, bob, sh, null, 0);
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1; ctx.beginPath();   /* plate seams */
    ctx.moveTo(-6, bob - 11.6); ctx.lineTo(-6, bob - 5); ctx.moveTo(-6, bob + 11.6); ctx.lineTo(-6, bob + 5);
    ctx.moveTo(4, bob - 12.6); ctx.lineTo(4, bob + 12.6); ctx.moveTo(4, bob); ctx.lineTo(19, bob);
    ctx.stroke();
    sp7_dots(ctx, [-18, -11.6, -18, 11.6, -8, -10.6, -8, 10.6, 8, -13, 8, 13, 21, -5.6, 21, 5.6], bob, 0.9, dk);
    fillCircle(ctx, -14, bob, 8, SP7_RIM); fillCircle(ctx, -14, bob, 6.8, dk);          /* reactor housing */
    ctx.strokeStyle = jt; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + e.anim; ctx.moveTo(-14 + Math.cos(a) * 4.6, bob + Math.sin(a) * 4.6); ctx.lineTo(-14 + Math.cos(a) * 6.6, bob + Math.sin(a) * 6.6); }
    ctx.stroke();
    fillCircle(ctx, -14, bob, 4.6, b); fillCircle(ctx, -14, bob, 3.6, d.pale); fillCircle(ctx, -14.8, bob - 0.9, 1.1, '#FFFFFF');
    for (const s of [-1, 1]){
      const py = bob + s * 21;
      sp7_plate(ctx, -7, py - 5, 18, 10, pl, SP7_RIM, lt);                      /* shoulder missile pods */
      for (let k = -1; k <= 1; k++){ lkLN(ctx, [-3, py + k * 2.6, 8, py + k * 2.6], 1.8, SP7_RIM); fillCircle(ctx, 9, py + k * 2.6, 1.2, '#FF8A3A'); }
      fillCircle(ctx, 10, bob + s * 13, 5.2, SP7_RIM); fillCircle(ctx, 10, bob + s * 13, 4, pl);        /* shoulder joint */
      lkLN(ctx, [10, bob + s * 13, 42, bob + s * 13], 5.4, SP7_RIM);          /* arm cannons */
      lkLN(ctx, [10, bob + s * 13, 42, bob + s * 13], 4.2, dk);
      lkLN(ctx, [14, bob + s * 13 - 0.8, 38, bob + s * 13 - 0.8], 1.1, jt);
      ctx.fillStyle = SP7_RIM; ctx.fillRect(21, bob + s * 13 - 3.4, 2.2, 6.8); ctx.fillRect(29, bob + s * 13 - 3, 2.2, 6); ctx.fillRect(37, bob + s * 13 - 3.4, 5, 6.8);
      if (e.state === 'wind' || e.state === 'roar') softBlob(ctx, 43, bob + s * 13, 9, d.pale, 0.6);
      else fillCircle(ctx, 42, bob + s * 13, 2, d.pale);
    }
    lkOV(ctx, 13, bob, 9.6, 11.4, SP7_RIM); lkOV(ctx, 13, bob, 8.6, 10.4, pl);        /* head */
    lkOV(ctx, 11.4, bob - 4.2, 6, 2.6, lt);
    lkOV(ctx, 14, bob, 6, 8, dk); lkOV(ctx, 16, bob, 3.6, 5.4, d.pale);               /* visor */
    fillCircle(ctx, 16.6, bob - 1.6, 1.2, '#FFFFFF');
    fillCircle(ctx, 18, bob - 9.6, 1.3, d.pale); fillCircle(ctx, 18, bob + 9.6, 1.3, d.pale);
  },
  stealthbomber(ctx, e, b, dk, bob, wind, d){
    const P1 = SP7_BOMBER, pl = sp7_mix(b, 0.18), lt = sp7_mix(b, 0.42), sh = shade(b, -0.35);
    const outline = function(){
      ctx.moveTo(P1[0][0], bob);
      for (let i = 1; i < P1.length; i++) ctx.lineTo(P1[i][0], bob + P1[i][1]);
      for (let i = P1.length - 2; i >= 1; i--) ctx.lineTo(P1[i][0], bob - P1[i][1]);
      ctx.closePath();
    };
    ctx.fillStyle = b; ctx.beginPath(); outline(); ctx.fill();
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineJoin = 'miter';
    ctx.fillStyle = pl; ctx.beginPath();                                       /* raised center section */
    ctx.moveTo(32, bob); ctx.lineTo(-4, bob - 34); ctx.lineTo(-14, bob - 22); ctx.lineTo(-22, bob - 6); ctx.lineTo(-24, bob);
    ctx.lineTo(-22, bob + 6); ctx.lineTo(-14, bob + 22); ctx.lineTo(-4, bob + 34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lt; ctx.beginPath();                                       /* sunlit upper half */
    ctx.moveTo(32, bob); ctx.lineTo(-4, bob - 34); ctx.lineTo(-14, bob - 22); ctx.lineTo(-22, bob - 6); ctx.lineTo(-24, bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = sh; ctx.beginPath();                                       /* wing tips in dark coating */
    ctx.moveTo(-8, bob - 64); ctx.lineTo(-16, bob - 60); ctx.lineTo(-22, bob - 49); ctx.lineTo(-4, bob - 48); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, bob + 64); ctx.lineTo(-16, bob + 60); ctx.lineTo(-22, bob + 49); ctx.lineTo(-4, bob + 48); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.16; lkTRI(ctx, 30, bob, -6, bob - 40, -6, bob + 40, d.pale); ctx.globalAlpha = 1;
    ctx.strokeStyle = lt; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7; ctx.beginPath();      /* leading-edge glint */
    ctx.moveTo(34, bob - 1); ctx.lineTo(-6, bob - 62); ctx.moveTo(34, bob + 1); ctx.lineTo(-6, bob + 62);
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.38)'; ctx.lineWidth = 1; ctx.beginPath();  /* panel lines */
    for (let k = 1; k <= 3; k++){ ctx.moveTo(30 - k * 12, bob - 4 - k * 8); ctx.lineTo(30 - k * 12, bob + 4 + k * 8); }
    ctx.moveTo(-6, bob - 5); ctx.lineTo(12, bob - 5); ctx.lineTo(12, bob + 5); ctx.lineTo(-6, bob + 5); ctx.closePath();       /* bomb bay */
    ctx.moveTo(2, bob - 5); ctx.lineTo(2, bob + 5);
    ctx.moveTo(-20, bob - 22); ctx.lineTo(-8, bob - 40); ctx.moveTo(-20, bob + 22); ctx.lineTo(-8, bob + 40);
    ctx.moveTo(28, bob - 2); ctx.lineTo(-2, bob - 44); ctx.moveTo(28, bob + 2); ctx.lineTo(-2, bob + 44);      /* chine lines */
    ctx.moveTo(-26, bob - 12); ctx.lineTo(-18, bob - 20); ctx.moveTo(-26, bob + 12); ctx.lineTo(-18, bob + 20);
    ctx.stroke();
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 6, bob + s * 11, 7.4, 3.2, SP7_RIM); lkOV(ctx, 6, bob + s * 11, 6.4, 2.6, dk);        /* engine intakes */
      lkOV(ctx, 7, bob + s * 11, 4, 1, sp7_mix(dk, 0.4));
      ctx.fillStyle = SP7_RIM; ctx.fillRect(-27, bob + s * 18 - 2.2, 3, 4.4);                         /* exhaust slits */
      ctx.fillRect(-23, bob + s * 8 - 1.8, 3, 3.6);
      fillCircle(ctx, -8, bob + s * 63, 1.3, s < 0 ? '#FF4A3A' : '#5AFF8A');                           /* wingtip lights */
    }
    lkOV(ctx, 25.4, bob, 5.8, 2.6, SP7_RIM); lkOV(ctx, 26, bob, 4.2, 1.8, d.pale);               /* cockpit glass */
    lkOV(ctx, 26.6, bob - 0.7, 1.8, 0.6, 'rgba(255,255,255,.85)');
    if (e.state === 'roar'){ ctx.fillStyle = '#FF6A2A'; ctx.globalAlpha = 0.85; ctx.fillRect(-14, bob - 6, 22, 12); ctx.globalAlpha = 1; }
  },
  railgunner(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.2), lt = sp7_mix(b, 0.5), sh = shade(b, -0.3), jt = sp7_mix(dk, 0.4), tur = blendHex(dk, b, 0.6);
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 60, d.pale, 0.12);
    drawTreads(ctx, -46, bob - 34, 92, 13, '#2E3038', e.anim); drawTreads(ctx, -46, bob + 21, 92, 13, '#2E3038', e.anim);
    for (let s = -1; s <= 1; s += 2){                            /* road wheels, sprockets and track guards */
      ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1.2; ctx.strokeRect(-46, bob + (s < 0 ? -34 : 21), 92, 13);
      for (let k = 0; k < 7; k++){ const x = -38 + k * 12.7; fillCircle(ctx, x, bob + s * 27.5, 4.6, dk); fillCircle(ctx, x, bob + s * 27.5, 3, jt); fillCircle(ctx, x, bob + s * 27.5, 1.2, SP7_RIM); }
      fillCircle(ctx, 41, bob + s * 27.5, 6, dk); fillCircle(ctx, 41, bob + s * 27.5, 3.6, jt);
    }
    for (let s = -1; s <= 1; s += 2){                            /* ramming horns */
      lkCV(ctx, 30, bob + s * 22, 52, bob + s * 33, 62, bob + s * 20, 6.2, SP7_RIM);
      lkCV(ctx, 30, bob + s * 22, 52, bob + s * 33, 62, bob + s * 20, 4, pl);
      lkCV(ctx, 34, bob + s * 24, 52, bob + s * 32.4, 60, bob + s * 22, 1.2, lt);
    }
    sp7_poly(ctx, SP7_RAIL_HULL, 0, bob, b, SP7_RIM, 2);
    ctx.fillStyle = lt; ctx.fillRect(-40, bob - 22, 72, 3.4);               /* upper side skirt */
    ctx.fillStyle = sh; ctx.fillRect(-40, bob + 18.6, 72, 3.4);
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 8; k++){ const x = -34 + k * 9.4; ctx.moveTo(x, bob - 22); ctx.lineTo(x, bob - 18.6); ctx.moveTo(x, bob + 18.6); ctx.lineTo(x, bob + 22); }
    ctx.stroke();
    ctx.fillStyle = dk; ctx.fillRect(-41, bob - 15, 12, 30);                 /* engine deck */
    ctx.fillStyle = jt; for (let k = 0; k < 6; k++) ctx.fillRect(-40, bob - 12.6 + k * 5, 10, 1.6);
    sp7_plate(ctx, 26, bob - 12, 14, 6, pl, SP7_RIM, lt); sp7_plate(ctx, 26, bob + 6, 14, 6, pl, SP7_RIM, lt);   /* front plates */
    sp7_dots(ctx, [-26, -17, -26, 17, 28, -20, 28, 20, 4, -22, 4, 22, 38, -9, 38, 9], bob, 1, dk);
    const charge = e.state === 'wind' || e.state === 'dash' ? 1 : 0.35;
    for (const s of [-1, 1]){                                                         /* twin rails */
      lkLN(ctx, [12, bob + s * 3.4, 84, bob + s * 3.4], 5.6, SP7_RIM);
      lkLN(ctx, [12, bob + s * 3.4, 84, bob + s * 3.4], 4.4, dk);
      lkLN(ctx, [14, bob + s * 3.4 - 1, 82, bob + s * 3.4 - 1], 1, jt);
    }
    ctx.fillStyle = SP7_RIM; for (let k = 0; k < 4; k++) ctx.fillRect(34 + k * 16, bob - 5.4, 2.4, 10.8);   /* rail insulators */
    ctx.strokeStyle = d.pale; ctx.lineWidth = 2;                                        /* glowing coils */
    for (let k = 0; k < 6; k++){ ctx.globalAlpha = (0.4 + 0.6 * Math.sin(G.time * 10 - k * 0.8) ** 2) * charge + 0.15; ctx.beginPath(); ctx.moveTo(24 + k * 10, bob - 6.2); ctx.lineTo(24 + k * 10, bob + 6.2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = SP7_RIM; ctx.fillRect(80, bob - 6, 5, 12);                           /* muzzle collar */
    softBlob(ctx, 84, bob, 10 + charge * 8, d.pale, 0.3 + charge * 0.4);
    for (let s = -1; s <= 1; s += 2){                                                  /* capacitor banks */
      sp7_plate(ctx, -16, bob + s * 17 - 4, 18, 8, dk, SP7_RIM, null);
      ctx.globalAlpha = 0.5 + 0.4 * charge; ctx.fillStyle = d.pale; ctx.fillRect(-14.4, bob + s * 17 - 2.4, 15, 4.8); ctx.globalAlpha = 1;
      ctx.fillStyle = SP7_RIM; ctx.fillRect(-9, bob + s * 17 - 4, 1.4, 8); ctx.fillRect(-3, bob + s * 17 - 4, 1.4, 8);
    }
    sp7_poly(ctx, SP7_RAIL_TUR, 0, bob, tur, SP7_RIM, 1.4);
    sp7_poly(ctx, [-18, -18, 15, -14.4, 22, -5.6, -18, -5], 0, bob, sp7_mix(tur, 0.2), null, 0);
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, bob - 19); ctx.lineTo(-10, bob + 19); ctx.moveTo(8, bob - 15); ctx.lineTo(8, bob + 15); ctx.stroke();
    ringPath(ctx, -4, bob, 9, 1.2, SP7_RIM, 1);
    fillCircle(ctx, -4, bob, 6.6, SP7_RIM); fillCircle(ctx, -4, bob, 6, dk); fillCircle(ctx, -4, bob, 3.6, d.pale);   /* commander lens */
    fillCircle(ctx, -5.2, bob - 1.2, 1.1, '#FFFFFF');
    lkLN(ctx, [-18, bob + 14, -26, bob + 22], 1.2, dk); fillCircle(ctx, -26, bob + 22, 1, d.pale);   /* whip antenna */
  },
  siegewalker(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.4), lt = sp7_mix(b, 0.64), sh = shade(b, -0.3), jt = sp7_mix(dk, 0.4), bd = sp7_mix(b, 0.3);
    if (e.state === 'roll') ringPath(ctx, 0, bob, 66, 3, '#FFB030', 0.4);
    const ph = e.anim * 2.4;
    for (let i = 0; i < 4; i++){
      const L = SP7_SW_LEGS[i], hx = L[0], hy = L[1], o = L[2];
      const s = Math.sin(ph + o) * 10, sxg = Math.sign(hx), syg = Math.sign(hy), kx = hx + sxg * 9, ky = hy + syg * 14;
      const fx = kx + s * 1.2 + sxg * 5, fy = ky + syg * 12;
      ctx.lineCap = 'round';
      lkLN(ctx, [hx, bob + hy, kx + s * 0.5, bob + ky], 7.4, SP7_RIM);
      lkLN(ctx, [kx + s * 0.5, bob + ky, fx, bob + fy], 5.6, SP7_RIM);
      lkLN(ctx, [hx, bob + hy, kx + s * 0.5, bob + ky], 6, dk);
      lkLN(ctx, [kx + s * 0.5, bob + ky, fx, bob + fy], 4.2, dk);
      lkLN(ctx, [hx + sxg * 1.6, bob + hy, kx + s * 0.5 + sxg * 1.6, bob + ky], 1.2, jt);      /* piston */
      ctx.lineCap = 'butt';
      fillCircle(ctx, hx, bob + hy, 6.4, SP7_RIM); fillCircle(ctx, hx, bob + hy, 5.2, pl);       /* hip */
      fillCircle(ctx, kx + s * 0.5, bob + ky, 5.4, SP7_RIM); fillCircle(ctx, kx + s * 0.5, bob + ky, 4.4, pl);
      fillCircle(ctx, kx + s * 0.5 - 0.8, bob + ky - 0.8, 1.6, lt);
      fillCircle(ctx, fx, bob + fy, 4.4, SP7_RIM); fillCircle(ctx, fx, bob + fy, 3.4, dk); fillCircle(ctx, fx, bob + fy, 1.5, jt);
    }
    sp7_poly(ctx, SP7_SW_HULL, 0, bob, bd, SP7_RIM, 2.2);
    sp7_poly(ctx, [-34, -17, 28, -22.6, 42, -7, -34, -3], 0, bob, lt, null, 0);       /* sunlit upper plate */
    sp7_poly(ctx, [-34, 3, 42, 7, 28, 22.6, -34, 17], 0, bob, pl, null, 0);
    ctx.fillStyle = sh; ctx.fillRect(-36, bob + 17, 62, 2.6);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    for (let k = 0; k < 5; k++) ctx.fillRect(-32 + k * 6, bob - 12, 3, 24);            /* vents */
    for (let k = 0; k < 6; k++){ const x = -34 + k * 7; lkTRI(ctx, x, bob - 3, x + 3.4, bob, x, bob + 3, k & 1 ? jt : dk); }   /* dorsal scutes */
    sp7_dots(ctx, [-35, -17, -35, 17, 22, -22, 22, 22, 40, -6, 40, 6, -2, -21, -2, 21], bob, 1.1, dk);
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1.1; ctx.beginPath();
    ctx.moveTo(-2, bob - 21); ctx.lineTo(-2, bob - 14); ctx.moveTo(-2, bob + 21); ctx.lineTo(-2, bob + 14);
    ctx.moveTo(24, bob - 24); ctx.lineTo(34, bob - 8); ctx.moveTo(24, bob + 24); ctx.lineTo(34, bob + 8); ctx.stroke();
    for (let s = -1; s <= 1; s += 2){                           /* jaw clamps */
      lkTRI(ctx, 36, bob + s * 11, 56, bob + s * 11.6, 40, bob + s * 3.6, SP7_RIM);
      lkTRI(ctx, 38, bob + s * 10.4, 53.6, bob + s * 10.8, 41, bob + s * 4.6, dk);
      lkTRI(ctx, 40, bob + s * 9.8, 50, bob + s * 10.2, 41.6, bob + s * 6.2, jt);
    }
    fillCircle(ctx, 10, bob, 16, SP7_RIM); fillCircle(ctx, 10, bob, 14, dk); fillCircle(ctx, 10, bob, 11.6, pl);
    fillCircle(ctx, 8.4, bob - 2, 6.6, lt);
    ringPath(ctx, 10, bob, 6.6, 1.2, SP7_RIM, 1);
    fillCircle(ctx, 10, bob, 3.2, dk); fillCircle(ctx, 9.4, bob - 0.8, 1.2, jt);
    lkLN(ctx, [14, bob, 60, bob], 7.6, SP7_RIM); lkLN(ctx, [14, bob, 60, bob], 6, dk);   /* laser cannon */
    lkLN(ctx, [18, bob - 1.4, 54, bob - 1.4], 1.2, jt);
    ctx.fillStyle = SP7_RIM; ctx.fillRect(24, bob - 4.4, 2.4, 8.8); ctx.fillRect(38, bob - 4.2, 2.4, 8.4); ctx.fillRect(54, bob - 5, 6, 10);
    fillCircle(ctx, 60, bob, 3.4, d.pale);
    softBlob(ctx, 60, bob, 10 + (e.state === 'roll' ? 6 : 0), d.pale, 0.45);
    fillCircle(ctx, 32, bob, 5.4, SP7_RIM); fillCircle(ctx, 32, bob, 4, d.pale); fillCircle(ctx, 30.8, bob - 1.2, 1.3, '#FFFFFF');   /* sensor lens */
  },
  skyfortress(ctx, e, b, dk, bob, wind, d){
    const pl = sp7_mix(b, 0.2), lt = sp7_mix(b, 0.5), sh = shade(b, -0.25), jt = sp7_mix(dk, 0.4);
    ringPath(ctx, 0, bob, 62 + Math.sin(e.anim * 3) * 4, 3, d.pale, 0.28);
    softBlob(ctx, 0, bob, 72, d.pale, 0.1);
    for (let i = 0; i < 4; i++){                                                          /* engine pods */
      const px = i & 1 ? 46 : -46, py = i & 2 ? 34 : -34, sg = Math.sign(py);
      lkLN(ctx, [px * 0.8, bob + py * 0.8, px, bob + py], 4, dk);
      sp7_plate(ctx, px - 10, bob + py - 7, 20, 14, dk, SP7_RIM, null);
      ctx.fillStyle = jt; ctx.fillRect(px - 8, bob + py - 5, 16, 1.4); ctx.fillRect(px - 8, bob + py + 3.6, 16, 1.4);
      softBlob(ctx, px, bob + py, 11, d.pale, 0.4 + 0.15 * Math.sin(G.time * 9 + px));
      fillCircle(ctx, px, bob + py, 4.6, SP7_RIM);
      const a = G.time * 22 + i; ctx.strokeStyle = d.pale; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(px + Math.cos(a) * 4, bob + py + Math.sin(a) * 4); ctx.lineTo(px - Math.cos(a) * 4, bob + py - Math.sin(a) * 4);
      ctx.moveTo(px - Math.sin(a) * 4, bob + py + Math.cos(a) * 4); ctx.lineTo(px + Math.sin(a) * 4, bob + py - Math.cos(a) * 4); ctx.stroke();
      fillCircle(ctx, px, bob + py, 3.2, '#FFFFFF'); fillCircle(ctx, px, bob + py, 1.6, d.pale);
    }
    fillCircle(ctx, 0, bob, 51.4, SP7_RIM); fillCircle(ctx, 0, bob, 50, dk); fillCircle(ctx, 0, bob, 46, b);
    for (let k = 0; k < 8; k++){                                                          /* alternating armor sectors */
      const a0 = k / 8 * TAU, a1 = (k + 1) / 8 * TAU;
      ctx.fillStyle = k & 1 ? pl : lt; ctx.beginPath(); ctx.moveTo(Math.cos(a0 + 0.02) * 22, bob + Math.sin(a0 + 0.02) * 22);
      ctx.arc(0, bob, 44.4, a0 + 0.02, a1 - 0.02); ctx.arc(0, bob, 22, a1 - 0.02, a0 + 0.02, true); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; ctx.moveTo(Math.cos(a) * 20, bob + Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * 46, bob + Math.sin(a) * 46); }
    ctx.stroke();
    ringPath(ctx, 0, bob, 41, 1.2, SP7_RIM, 1); ringPath(ctx, 0, bob, 34, 1, SP7_RIM, 1);
    ctx.fillStyle = dk; ctx.beginPath();                                                  /* rivets */
    for (let k = 0; k < 24; k++){ const a = k / 24 * TAU + 0.13, x = Math.cos(a) * 43.2, y = bob + Math.sin(a) * 43.2; ctx.moveTo(x + 1, y); ctx.arc(x, y, 1, 0, TAU); }
    ctx.fill();
    fillCircle(ctx, 0, bob, 31, SP7_RIM); fillCircle(ctx, 0, bob, 30, dk); fillCircle(ctx, 0, bob, 26, '#4A5468'); fillCircle(ctx, -3, bob - 3, 17, sp7_mix('#4A5468', 0.15));
    for (let k = 0; k < 8; k++){                                                          /* rotating gun turrets */
      const a = k / 8 * TAU + G.time * 0.5, ca = Math.cos(a), sa = Math.sin(a), tx = ca * 38, ty = bob + sa * 38;
      lkLN(ctx, [tx - sa * 1.7, ty + ca * 1.7, tx - sa * 1.7 + ca * 12, ty + ca * 1.7 + sa * 12], 2.4, SP7_RIM);
      lkLN(ctx, [tx + sa * 1.7, ty - ca * 1.7, tx + sa * 1.7 + ca * 12, ty - ca * 1.7 + sa * 12], 2.4, SP7_RIM);
      fillCircle(ctx, tx, ty, 6.4, SP7_RIM); fillCircle(ctx, tx, ty, 5.4, dk); fillCircle(ctx, tx - 0.8, ty - 0.8, 3, sp7_mix(dk, 0.45));
    }
    ctx.strokeStyle = SP7_RIM; ctx.lineWidth = 1; ctx.beginPath();                        /* core housing */
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.moveTo(Math.cos(a) * 13, bob + Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 20, bob + Math.sin(a) * 20); }
    ctx.stroke();
    ringPath(ctx, 0, bob, 17, 2.4, SP7_RIM, 1);
    const p = 0.6 + 0.4 * Math.sin(G.time * 5);
    softBlob(ctx, 0, bob, 24, d.pale, 0.5 * p); fillCircle(ctx, 0, bob, 11, d.pale); fillCircle(ctx, 0, bob, 6, '#FFFFFF');
    if (e.state === 'roar') ringPath(ctx, 0, bob, 34, 4, '#FFFFFF', 0.7);
  }
};


