'use strict';
/* =============================================================================================================================
   33a-gear-art-capes.js  --  SIXTEEN CAPES. Each gear set now has its own cape, not one colored cloth: a patched hide, a leafy shawl,
   stone flaps, a fur-trimmed cloak, a rippling wave, a night sky of stars and so on. drawPlayer() (33-giraffe-art.js) keeps working out
   where the cloth hangs and how the wind moves it, and hands that to capeDraw(); every design here shares the same cloth frame, so the
   wind, the lag behind her and the flutter are the same for all of them. The level of the piece adds a trim line (3 and up) and a moving
   glint (5). The old plain cape is still the fallback when no design is found.
   P.capeSet / P.capeLevel / P.weaponLevel / P.armorLevel are kept up to date here (a wrapper on recalcStats).
   ============================================================================================================================= */
/* A glow costs a blur pass on every draw it touches, so it is only used at full effects (the slow-device governor and the Effects setting turn it off);
   below that the draw is plain. Switching it off also drops the dark rim the giraffe carries, which these glows would otherwise inherit. */
function gaGlow(ctx, color, blur){
  if (typeof fxLevelNow === 'function' && fxLevelNow() >= 2){ ctx.shadowColor = color; ctx.shadowBlur = blur; }
  else ctx.shadowBlur = 0;
}

/* the cloth as a surface: F(u, v) is the point u along the cape (0 at the collar, 1 at the tip, more past it) and v across it (-1 to 1) */
function capeFrame(o){
  const s = (o.px * o.ppx + o.py * o.ppy) < 0 ? -1 : 1;                       /* the tip's cross-direction, turned to the same side as the collar's */
  function centre(u){
    if (u <= 1){ const w = 1 - u; return [w * w * o.bx + 2 * w * u * o.mx + u * u * o.tx, w * w * o.by + 2 * w * u * o.my + u * u * o.ty]; }
    return [o.tx + Math.cos(o.tipA) * (u - 1) * o.len, o.ty + Math.sin(o.tipA) * (u - 1) * o.len];
  }
  return function(u, v){
    const c = centre(u), k = Math.max(0, Math.min(1, u));
    const qx = o.px + (o.ppx * s - o.px) * k, qy = o.py + (o.ppy * s - o.py) * k, hw = 7 + (o.spread - 7) * Math.pow(k, 0.9);
    return [c[0] + qx * v * hw, c[1] + qy * v * hw];
  };
}
/* fill the cloth: down the left edge, along the hem (hem(v, j) gives how far past the tip it reaches), up the right edge */
function capePath(ctx, F, hem, n, m){
  n = n || 9; m = m || 12;
  ctx.beginPath(); let p = F(0, -1); ctx.moveTo(p[0], p[1]);
  for (let i = 1; i <= n; i++){ p = F(i / n, -1); ctx.lineTo(p[0], p[1]); }
  for (let j = 0; j <= m; j++){ const v = -1 + 2 * j / m; p = F(1 + (hem ? hem(v, j) : 0), v); ctx.lineTo(p[0], p[1]); }
  for (let i = n; i >= 0; i--){ p = F(i / n, 1); ctx.lineTo(p[0], p[1]); }
  ctx.closePath();
}
function capeLine(ctx, F, u0, v0, u1, v1, steps){
  steps = steps || 4; ctx.beginPath(); let p = F(u0, v0); ctx.moveTo(p[0], p[1]);
  for (let i = 1; i <= steps; i++){ const k = i / steps; p = F(u0 + (u1 - u0) * k, v0 + (v1 - v0) * k); ctx.lineTo(p[0], p[1]); }
}
function capeDot(ctx, F, u, v, r, col){ const p = F(u, v); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill(); }
function capeLeaf(ctx, F, u, v, len, wid, ang, col){                          /* one small leaf lying on the cloth */
  const p = F(u, v); ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, len, wid, 0, 0, TAU); ctx.fill(); ctx.restore();
}
/* the cloth's body in one go: shape, fill, and the soft fold down the middle that every cape has */
function capeBase(ctx, F, col, hem, alpha){
  ctx.globalAlpha = alpha || 0.94; ctx.fillStyle = col; capePath(ctx, F, hem); ctx.fill();
  ctx.globalAlpha = 0.2; ctx.strokeStyle = '#1C1410'; ctx.lineWidth = 1.4; capeLine(ctx, F, 0.05, 0, 1, 0.1, 5); ctx.stroke();
  ctx.globalAlpha = 1;
}
function capeTrim(ctx, F, hem, col){                                           /* level 3 and up: a bright line along the edge */
  ctx.globalAlpha = 0.8; ctx.strokeStyle = col; ctx.lineWidth = 1.1; capePath(ctx, F, hem); ctx.stroke(); ctx.globalAlpha = 1;
}
function capeGlint(ctx, F, o){                                                 /* level 5: a pale streak sliding down the cloth */
  const u = ((o.t * 0.45) % 1.6) - 0.3; if (u < -0.1 || u > 1.05) return;
  ctx.save(); capePath(ctx, F, null); ctx.clip();
  ctx.globalAlpha = 0.34; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3.2; capeLine(ctx, F, u, -1.1, u + 0.12, 1.1, 3); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
}
function hslc(h, s, l){ return 'hsl(' + Math.round(h) + ',' + s + '%,' + l + '%)'; }

const CAPE_DESIGNS = {
  herdhide(ctx, o){                                                            /* a patched hide, stitched down the middle */
    const F = capeFrame(o), c = o.color, hem = function(v){ return Math.sin(v * 7) * 0.05; };
    capeBase(ctx, F, c, hem);
    ctx.fillStyle = shade(c, -0.22); ctx.globalAlpha = 0.9;
    [[0.32, -0.42, 0.1, 0.34], [0.64, 0.3, 0.12, 0.38]].forEach(function(r){
      const a = F(r[0], r[1] - r[3] / 2), b = F(r[0], r[1] + r[3] / 2), c2 = F(r[0] + r[2], r[1] + r[3] / 2), d = F(r[0] + r[2], r[1] - r[3] / 2);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = 0.8; ctx.strokeStyle = shade(c, 0.5); ctx.lineWidth = 0.9; ctx.setLineDash([2, 2]); capeLine(ctx, F, 0.1, 0.02, 0.98, 0.04, 6); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    return hem;
  },
  thornweave(ctx, o){                                                          /* a shawl of leaves with thorn tips */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return (j % 2 ? 0.12 : -0.02); };
    capeBase(ctx, F, c, hem);
    ctx.strokeStyle = shade(c, -0.35); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++){ capeLine(ctx, F, 0.1, 0, 0.35 + i * 0.16, -0.8 + i * 0.1, 3); ctx.stroke(); capeLine(ctx, F, 0.1, 0, 0.35 + i * 0.16, 0.8 - i * 0.1, 3); ctx.stroke(); }
    ctx.globalAlpha = 1;
    for (let j = 1; j < 12; j += 2){ const v = -1 + 2 * j / 12, p = F(1.12, v); capeDot(ctx, F, 1.12, v, 1.5, '#3F2A18'); }
    return hem;
  },
  stoneplate(ctx, o){                                                          /* stiff stone flaps, riveted */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return (Math.floor((v + 1) * 1.5) % 2) ? 0.1 : -0.02; };
    capeBase(ctx, F, c, hem, 0.97);
    ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 1.2; ctx.globalAlpha = 0.75;
    [0.36, 0.68].forEach(function(u){ capeLine(ctx, F, u, -1, u, 1, 3); ctx.stroke(); });
    ctx.globalAlpha = 1;
    [0.18, 0.52, 0.84].forEach(function(u){ capeDot(ctx, F, u, -0.62, 1.1, shade(c, 0.45)); capeDot(ctx, F, u, 0.62, 1.1, shade(c, 0.45)); });
    return hem;
  },
  frostbite(ctx, o){                                                           /* a fur-trimmed cloak with beads of ice */
    const F = capeFrame(o), c = o.color, hem = function(v){ return -0.04; };
    capeBase(ctx, F, shade(c, -0.12), hem);
    for (let j = 0; j <= 9; j++){ const v = -1 + 2 * j / 9, p = F(1.0, v); ctx.fillStyle = '#F4FAFF'; ctx.beginPath(); ctx.arc(p[0], p[1], 3 + (j % 2) * 0.6, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 3; i++){ capeDot(ctx, F, 0.04 + i * 0.001, -0.8 + i * 0.8, 3.4, '#F4FAFF'); }
    for (let j = 1; j < 9; j += 2){ const v = -1 + 2 * j / 9; capeDot(ctx, F, 1.12, v, 1.4, '#BDEBFF'); }
    return hem;
  },
  acacia(ctx, o){                                                              /* woven bark and a sprig of leaves, a seed pouch at the hip */
    const F = capeFrame(o), c = o.color, hem = function(v){ return Math.sin(v * 5) * 0.04; };
    capeBase(ctx, F, c, hem);
    ctx.strokeStyle = shade(c, -0.3); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.65;
    for (let i = 1; i < 5; i++){ capeLine(ctx, F, i * 0.2, -1, i * 0.2 + 0.1, 1, 2); ctx.stroke(); }
    for (let i = -2; i <= 2; i++){ capeLine(ctx, F, 0.05, i * 0.4, 1, i * 0.4 + 0.1, 3); ctx.stroke(); }
    ctx.globalAlpha = 1;
    capeLeaf(ctx, F, 0.98, -0.5, 4, 1.7, o.tipA + 0.6, '#8FB04E'); capeLeaf(ctx, F, 0.98, 0.5, 4, 1.7, o.tipA - 0.6, '#A8C463');
    capeDot(ctx, F, 0.26, 0.74, 3, '#5C4326'); capeDot(ctx, F, 0.26, 0.74, 1.2, '#D2B77A');
    return hem;
  },
  twinsoul(ctx, o){                                                            /* a cloak split in two tones, with a second ribbon drifting after it */
    const F = capeFrame(o), c = o.color, c2 = shade(c, -0.32), hem = function(v){ return 0.02; };
    const o2 = Object.assign({}, o, { tipA: o.tipA + 0.5 + Math.sin(o.t * 2.1) * 0.25, spread: o.spread * 0.55, len: o.len * 1.15 });
    o2.tx = o.bx + Math.cos(o2.tipA) * o2.len; o2.ty = o.by + Math.sin(o2.tipA) * o2.len; o2.mx = o.bx + Math.cos(o2.tipA) * o2.len * 0.55; o2.my = o.by + Math.sin(o2.tipA) * o2.len * 0.55;
    o2.ppx = -Math.sin(o2.tipA); o2.ppy = Math.cos(o2.tipA);
    ctx.globalAlpha = 0.55; ctx.fillStyle = shade(c, 0.35); capePath(ctx, capeFrame(o2), null); ctx.fill(); ctx.globalAlpha = 1;
    capeBase(ctx, F, c, hem);
    ctx.save(); capePath(ctx, F, hem); ctx.clip(); ctx.fillStyle = c2; ctx.globalAlpha = 0.95;
    ctx.beginPath(); let p = F(0, 0); ctx.moveTo(p[0], p[1]); p = F(1.1, 0); ctx.lineTo(p[0], p[1]); p = F(1.1, 1.2); ctx.lineTo(p[0], p[1]); p = F(0, 1.2); ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
    capeDot(ctx, F, 0.5, -0.45, 2, shade(c2, 0.4)); capeDot(ctx, F, 0.5, 0.45, 2, shade(c, 0.4));
    return hem;
  },
  glacierguard(ctx, o){                                                        /* a crystal-edged cape, faceted */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return j % 4 === 2 ? 0.2 : (j % 4 === 0 ? 0.0 : 0.07); };
    capeBase(ctx, F, shade(c, -0.1), hem, 0.9);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.5;
    capeLine(ctx, F, 0.1, -0.8, 0.9, 0.2, 3); ctx.stroke(); capeLine(ctx, F, 0.1, 0.8, 0.9, -0.3, 3); ctx.stroke(); capeLine(ctx, F, 0.5, -1, 0.5, 1, 2); ctx.stroke();
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); let p = F(0.1, -0.8); ctx.moveTo(p[0], p[1]); p = F(0.5, -1); ctx.lineTo(p[0], p[1]); p = F(0.5, 0); ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    return hem;
  },
  sunforged(ctx, o){                                                           /* gold trim, and a hem of flame */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return 0.1 + 0.1 * Math.sin(o.t * 7 + v * 9) * (0.6 + 0.4 * Math.sin(j * 2.1)); };
    capeBase(ctx, F, shade(c, -0.15), hem);
    ctx.save(); capePath(ctx, F, hem); ctx.clip();
    const g = ctx.createLinearGradient.apply(ctx, [].concat(F(0.6, 0), F(1.25, 0)));
    g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(1, 'rgba(255,230,120,.95)'); ctx.fillStyle = g; capePath(ctx, F, hem); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#FFE08A'; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.85; capeLine(ctx, F, 0, -1, 0.7, -1, 4); ctx.stroke(); capeLine(ctx, F, 0, 1, 0.7, 1, 4); ctx.stroke(); ctx.globalAlpha = 1;
    capeDot(ctx, F, 0.3, 0, 2.6, '#FFE08A'); capeDot(ctx, F, 0.3, 0, 1.1, '#E88A1C');
    return hem;
  },
  aurora(ctx, o){                                                              /* ribbons of green, teal and pink that slowly trade places */
    const F = capeFrame(o), hem = function(v){ return Math.sin(v * 4 + o.t * 2) * 0.07; };
    const h0 = 150 + Math.sin(o.t * 0.5) * 40;
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i++){
      const v0 = -1 + i * 0.4, v1 = v0 + 0.4; ctx.fillStyle = hslc(h0 + i * 34, 70, 62); ctx.beginPath();
      let p = F(0, v0); ctx.moveTo(p[0], p[1]);
      for (let k = 1; k <= 8; k++){ p = F(k / 8, v0); ctx.lineTo(p[0], p[1]); }
      p = F(1 + hem(v1) + 0.05, (v0 + v1) / 2); ctx.lineTo(p[0], p[1]);
      for (let k = 8; k >= 0; k--){ p = F(k / 8, v1); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 0.2; ctx.strokeStyle = '#1C1410'; ctx.lineWidth = 1.2; capeLine(ctx, F, 0.05, 0, 1, 0.1, 5); ctx.stroke(); ctx.globalAlpha = 1;
    return hem;
  },
  starborn(ctx, o){                                                            /* a piece of night sky, with stars that twinkle */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return j % 2 ? 0.1 : 0.0; };
    capeBase(ctx, F, blendHex('#1B1F4A', c, 0.18), hem, 0.97);
    for (let i = 0; i < 11; i++){
      const u = 0.1 + ((i * 0.37) % 0.95), v = -0.8 + ((i * 0.53) % 1.6), tw = 0.5 + 0.5 * Math.sin(o.t * 4 + i * 1.7), p = F(u, v);
      ctx.globalAlpha = 0.45 + tw * 0.55; ctx.fillStyle = i % 3 ? '#FFF3B0' : '#FFFFFF';
      const r = 0.9 + (i % 3) * 0.5 + tw * 0.6; ctx.beginPath(); ctx.moveTo(p[0], p[1] - r * 1.8); ctx.lineTo(p[0] + r * 0.5, p[1] - r * 0.5); ctx.lineTo(p[0] + r * 1.8, p[1]); ctx.lineTo(p[0] + r * 0.5, p[1] + r * 0.5);
      ctx.lineTo(p[0], p[1] + r * 1.8); ctx.lineTo(p[0] - r * 0.5, p[1] + r * 0.5); ctx.lineTo(p[0] - r * 1.8, p[1]); ctx.lineTo(p[0] - r * 0.5, p[1] - r * 0.5); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1; capeTrim(ctx, F, hem, c);
    return hem;
  },
  tideshell(ctx, o){                                                           /* overlapping shell scales, a scalloped hem */
    const F = capeFrame(o), c = o.color, hem = function(v){ return 0.05 * Math.abs(Math.sin(v * 8)); };
    capeBase(ctx, F, shade(c, -0.15), hem);
    ctx.save(); capePath(ctx, F, hem); ctx.clip();
    for (let row = 0; row < 6; row++){
      for (let k = 0; k < 6; k++){
        const u = 0.1 + row * 0.17, v = -0.92 + k * 0.37 + (row % 2) * 0.18, p = F(u, v);
        ctx.fillStyle = (row + k) % 2 ? shade(c, 0.12) : c; ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, TAU); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
    return hem;
  },
  riptide(ctx, o){                                                             /* a ragged hem that rolls like a wave, with foam */
    const F = capeFrame(o), c = o.color, hem = function(v){ return 0.1 + 0.12 * Math.sin(v * 6 - o.t * 5); };
    capeBase(ctx, F, c, hem);
    ctx.strokeStyle = shade(c, 0.5); ctx.lineWidth = 0.9; ctx.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++){ ctx.beginPath(); for (let k = 0; k <= 10; k++){ const v = -1 + k * 0.2, p = F(0.3 + i * 0.22 + Math.sin(k * 1.2 - o.t * 3) * 0.04, v); if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
    ctx.globalAlpha = 0.95;
    for (let k = 0; k < 7; k++){ const v = -0.9 + k * 0.3, u = 1.02 + 0.12 * Math.sin(v * 6 - o.t * 5); capeDot(ctx, F, u, v, 1.5 + (k % 2) * 0.6, '#F4FBFF'); }
    ctx.globalAlpha = 1;
    return hem;
  },
  abyssal(ctx, o){                                                             /* near black cloth with seams that glow */
    const F = capeFrame(o), c = o.color, hem = function(v){ return Math.sin(v * 5) * 0.05; };
    capeBase(ctx, F, blendHex('#0B1A1C', c, 0.16), hem, 0.97);
    const pulse = 0.55 + 0.45 * Math.sin(o.t * 2.4);
    ctx.save(); gaGlow(ctx, c, 5); ctx.strokeStyle = c; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.5 + pulse * 0.5;
    capeLine(ctx, F, 0.06, -0.35, 0.96, -0.45, 4); ctx.stroke(); capeLine(ctx, F, 0.06, 0.35, 0.96, 0.45, 4); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 6; i++) capeDot(ctx, F, 0.2 + i * 0.14, ((i * 7) % 5 - 2) * 0.3, 1 + (i % 2) * 0.4, 'rgba(160,255,230,' + (0.35 + 0.5 * Math.sin(o.t * 3 + i)) + ')');
    return hem;
  },
  canopy(ctx, o){                                                              /* rows of overlapping leaves */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return j % 2 ? 0.1 : 0.02; };
    capeBase(ctx, F, shade(c, -0.25), hem);
    ctx.save(); capePath(ctx, F, hem); ctx.clip();
    for (let row = 0; row < 5; row++) for (let k = 0; k < 5; k++){
      const u = 0.12 + row * 0.22, v = -0.85 + k * 0.42 + (row % 2) * 0.21;
      capeLeaf(ctx, F, u, v, 6, 2.8, o.tipA + (k % 2 ? 0.5 : -0.5), (row + k) % 2 ? c : shade(c, 0.18));
    }
    ctx.restore();
    return hem;
  },
  jaguar(ctx, o){                                                              /* a spotted pelt with a tail curling off the end */
    const F = capeFrame(o), c = o.color, hem = function(v){ return Math.sin(v * 6) * 0.05; };
    const tp = F(1.02, 0), tq = F(1.3 + Math.sin(o.t * 3) * 0.05, Math.sin(o.t * 2.2) * 0.5);
    ctx.strokeStyle = shade(c, -0.1); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tp[0], tp[1]);
    ctx.quadraticCurveTo((tp[0] + tq[0]) / 2 + 3, (tp[1] + tq[1]) / 2 - 3, tq[0], tq[1]); ctx.stroke(); ctx.lineCap = 'butt';
    capeBase(ctx, F, c, hem);
    [[0.22, -0.5], [0.34, 0.45], [0.5, -0.1], [0.62, 0.62], [0.7, -0.62], [0.86, 0.1], [0.12, 0.2]].forEach(function(r){
      const p = F(r[0], r[1]); ctx.strokeStyle = '#3A2410'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0.3, TAU - 0.5); ctx.stroke(); ctx.fillStyle = '#3A2410'; ctx.beginPath(); ctx.arc(p[0], p[1], 0.9, 0, TAU); ctx.fill();
    });
    capeDot(ctx, F, 1.3, Math.sin(o.t * 2.2) * 0.5, 1.8, '#3A2410');
    return hem;
  },
  leviathan(ctx, o){                                                           /* a fin: long rays along the hem, gill slits at the collar */
    const F = capeFrame(o), c = o.color, hem = function(v, j){ return (j % 3 === 1) ? 0.3 + 0.05 * Math.sin(o.t * 4 + j) : 0.02; };
    capeBase(ctx, F, shade(c, -0.18), hem);
    ctx.strokeStyle = shade(c, 0.4); ctx.lineWidth = 0.9; ctx.globalAlpha = 0.65;
    for (let j = 1; j < 12; j += 3){ const v = -1 + 2 * j / 12; capeLine(ctx, F, 0.1, v * 0.4, 1.28, v, 5); ctx.stroke(); }
    ctx.strokeStyle = shade(c, -0.5); ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
    for (let i = 0; i < 3; i++){ capeLine(ctx, F, 0.08 + i * 0.05, -0.55, 0.14 + i * 0.05, -0.3, 2); ctx.stroke(); capeLine(ctx, F, 0.08 + i * 0.05, 0.3, 0.14 + i * 0.05, 0.55, 2); ctx.stroke(); }
    return hem;
  }
};

/* called from drawPlayer: draws the design for this set, returns false when there is none (the plain cape is then used) */
function capeDraw(ctx, setId, o){
  const d = CAPE_DESIGNS[setId]; if (!d) return false;
  ctx.save();
  const hem = d(ctx, o), F = capeFrame(o), lv = o.level || 1;
  ctx.shadowBlur = 0;                                                          /* the rim is for the cloth; trim and glint are drawn plain */
  if (lv >= 3) capeTrim(ctx, F, hem, shade(o.color, 0.45));
  if (lv >= 5) capeGlint(ctx, F, o);
  ctx.restore();
  fillCircle(ctx, o.bx, o.by, 3.4, o.color);                                   /* the clasp at the collar, as ever */
  fillCircle(ctx, o.bx, o.by, 1.6, '#FFF3CC');
  return true;
}

/* the worn pieces' set ids and levels, kept on P for the drawing code */
function gearArtSync(){
  const c = gearEquipped('cape'), w = gearEquipped('weapon'), a = gearEquipped('armor');
  P.capeSet = c && GEAR_INDEX[c] ? GEAR_INDEX[c].setId : null; P.capeLevel = c ? gearLevel(c) : 1;
  P.weaponLevel = w ? gearLevel(w) : 1; P.armorLevel = a ? gearLevel(a) : 1;
}
(function(){ const r = recalcStats; recalcStats = function(){ r.apply(this, arguments); if (typeof gearLevel === 'function') gearArtSync(); }; })();
