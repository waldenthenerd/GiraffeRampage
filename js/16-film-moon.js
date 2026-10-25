'use strict';
/* The ending cutscene (the launch and the Moon landing). */
/* ========================= ENDING CUTSCENE ========================= */
/* Played after the final boss: the giraffe launches from the pad, flies to the
   Moon and lands -- and is left stranded when the lander explodes.

   Everything is drawn as a PURE FUNCTION OF TIME: renderCutscene(ctx, t) needs
   no stored state, so any moment can be rendered on demand. That is what lets
   the scene be scrubbed for testing, and lets the dev panel jump straight to a
   scene. Drawn in a fixed 1280x720 space and scaled to fit, letterboxed. */
const CS_W = 1280, CS_H = 720;
const CS_T = { A: 0, B: 14, C: 36, D: 52, E: 58, F: 64, G: 76, END: 106 };
const CS_MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
function csR(i){ const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function csC(v, a, b){ return v < a ? a : v > b ? b : v; }
function csLerp(a, b, t){ return a + (b - a) * t; }
function csSm(a, b, t){ const x = csC((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function csBump(t, a, b, fade){ return csSm(a, a + fade, t) * (1 - csSm(b - fade, b, t)); }
function csHex(c1, c2, t){
  const p = c => [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
  const a = p(c1), b = p(c2), k = csC(t, 0, 1);
  const h = i => ('0' + Math.round(a[i] + (b[i] - a[i]) * k).toString(16)).slice(-2);
  return '#' + h(0) + h(1) + h(2);
}
function csRGBA(c, a){ return 'rgba(' + parseInt(c.substr(1, 2), 16) + ',' + parseInt(c.substr(3, 2), 16) + ',' + parseInt(c.substr(5, 2), 16) + ',' + a + ')'; }
/* a soft radial glow (the game's softBlob is a flat disc, which reads as a bubble at this size) */
function csGlow(ctx, x, y, r, color, alpha){
  if (!(alpha > 0.003) || !(r > 0.5) || !isFinite(x + y + r)) return;                      /* also false for a non-finite size, which would throw */
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, csRGBA(color, alpha)); g.addColorStop(0.45, csRGBA(color, alpha * 0.42)); g.addColorStop(1, csRGBA(color, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function csFireball(ctx, cx, cy, r, a){
  if (a <= 0.003) return;
  for (const [ox, oy, s] of [[0, 0, 1], [0.5, -0.3, 0.7], [-0.55, -0.2, 0.75], [0.2, -0.6, 0.6], [-0.3, 0.35, 0.6], [0.6, 0.3, 0.55], [-0.1, -0.85, 0.45], [0.85, -0.1, 0.45]])
    csGlow(ctx, cx + ox * r * 0.55, cy + oy * r * 0.5, r * s, '#FF8A2E', a * 0.6);
  csGlow(ctx, cx, cy, r * 0.75, '#FFD98A', a * 0.85); csGlow(ctx, cx, cy, r * 0.4, '#FFFFFF', a);
}
function csShake(u, amp){ return [Math.sin(u * 91.7) * amp + Math.sin(u * 47.3) * amp * 0.6, Math.cos(u * 83.1) * amp + Math.sin(u * 61.9) * amp * 0.5]; }

/* ---------- sky, stars, clouds, planets ---------- */
const CS_SKY = [[0, '#22335E', '#F0A86A'], [0.3, '#3F78C4', '#BBD8F0'], [0.6, '#0F2450', '#5A88C8'], [1, '#000004', '#02040E']];
function csSky(ctx, alt){
  let top = CS_SKY[3][1], bot = CS_SKY[3][2];
  for (let i = 1; i < CS_SKY.length; i++) if (alt <= CS_SKY[i][0]){
    const a = CS_SKY[i - 1], b = CS_SKY[i], t = (alt - a[0]) / (b[0] - a[0]);
    top = csHex(a[1], b[1], t); bot = csHex(a[2], b[2], t); break;
  }
  const g = ctx.createLinearGradient(0, 0, 0, CS_H); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
}
const CS_STARS = [];
for (let i = 0; i < 260; i++) CS_STARS.push({ x: csR(i) * CS_W, y: csR(i + 500) * CS_H, s: 0.6 + csR(i + 900) * 1.7, p: csR(i + 1300) * TAU });
function csStars(ctx, alpha, t, ox, oy){
  if (alpha <= 0.01) return;
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < CS_STARS.length; i++){
    const s = CS_STARS[i];
    ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(t * 1.7 + s.p)) * (0.4 + s.s / 3);
    const x = ((s.x + (ox || 0)) % CS_W + CS_W) % CS_W, y = ((s.y + (oy || 0)) % CS_H + CS_H) % CS_H;
    ctx.fillRect(x, y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
}
function csClouds(ctx, scroll, alpha){
  if (alpha <= 0.01) return;
  for (let k = 0; k < 18; k++){
    const cx = csR(k) * 1500 - 110, cy = (((csR(k + 50) * 1900 + scroll) % 1900) + 1900) % 1900 - 350, s = 0.7 + csR(k + 90) * 1.3;
    ctx.globalAlpha = alpha * (0.5 + 0.4 * csR(k + 120));
    ctx.fillStyle = '#FFFFFF';
    for (let j = 0; j < 5; j++){ ctx.beginPath(); ctx.ellipse(cx + (j - 2) * 34 * s, cy + Math.sin(j * 2.1 + k) * 8 * s, 46 * s, 20 * s, 0, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
function csEarth(ctx, cx, cy, r, rot, t, soft){
  const glow = ctx.createRadialGradient(cx, cy, r * 0.97, cx, cy, r * 1.09);
  glow.addColorStop(0, 'rgba(120,190,255,.55)'); glow.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, r * 1.09, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const oc = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  oc.addColorStop(0, '#4A9AEA'); oc.addColorStop(0.6, soft ? '#2A78D0' : '#1E5FB4'); oc.addColorStop(1, soft ? '#1A4C9A' : '#0A2A66');
  ctx.fillStyle = oc; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (let k = 0; k < 9; k++){                                  /* continents */
    const a = csR(k) * TAU + rot, d = csR(k + 20) * 0.72 * r, sz = (0.16 + csR(k + 40) * 0.22) * r;
    ctx.fillStyle = k % 3 === 0 ? '#B39A62' : '#4E8A3E'; ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, sz, sz * 0.62, a * 1.3, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFFFFF';              /* weather systems */
  for (let k = 0; k < 11; k++){
    const a = csR(k + 60) * TAU + rot * 1.4, d = csR(k + 80) * 0.85 * r, sz = (0.12 + csR(k + 100) * 0.2) * r;
    ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, sz, sz * 0.32, a + 0.6, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const sh = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.5, cx + r * 0.2, cy + r * 0.2, r * 1.25);   /* terminator shading */
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, soft ? 'rgba(0,0,10,.18)' : 'rgba(0,0,10,.72)');
  ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
function csMoon(ctx, cx, cy, r, soft){
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#DAD8D2'); g.addColorStop(0.7, soft ? '#B8B6B0' : '#A8A6A0'); g.addColorStop(1, soft ? '#8E8C88' : '#5E5C58');
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(70,68,64,.5)';
  for (let k = 0; k < 5; k++){ const a = csR(k + 200) * TAU, d = csR(k + 220) * 0.6 * r; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, (0.16 + csR(k + 240) * 0.2) * r, (0.12 + csR(k + 260) * 0.14) * r, a, 0, TAU); ctx.fill(); }
  for (let k = 0; k < 16; k++){ const a = csR(k + 300) * TAU, d = csR(k + 320) * 0.85 * r, cr = (0.03 + csR(k + 340) * 0.07) * r;
    ctx.strokeStyle = 'rgba(60,58,54,.55)'; ctx.lineWidth = Math.max(1, r * 0.012); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, 0, TAU); ctx.stroke(); }
  const sh = ctx.createRadialGradient(cx - r * 0.5, cy - r * 0.5, r * 0.4, cx + r * 0.25, cy + r * 0.25, r * 1.3);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, soft ? 'rgba(0,0,8,.3)' : 'rgba(0,0,8,.6)');
  ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/* ---------- exhaust ---------- */
/* Drawn pointing DOWN from (x, y). kind: 'kero' (orange, with shock diamonds), 'h2' (pale blue), 'small'. */
function csFlame(ctx, x, y, len, w, kind, t, diamonds){
  if (len < 2) return;
  const L = len * (1 + 0.07 * Math.sin(t * 61 + x) + 0.04 * Math.sin(t * 97 + y));
  const g = ctx.createLinearGradient(0, y, 0, y + L);
  if (kind === 'h2'){ g.addColorStop(0, '#F4F8FF'); g.addColorStop(0.3, '#A6C8FF'); g.addColorStop(0.7, 'rgba(90,130,255,.45)'); g.addColorStop(1, 'rgba(90,120,255,0)'); }
  else { g.addColorStop(0, '#FFF8DA'); g.addColorStop(0.2, '#FFD25A'); g.addColorStop(0.55, '#FF7A1E'); g.addColorStop(1, 'rgba(255,80,20,0)'); }
  csGlow(ctx, x, y + L * 0.22, w * 1.5, kind === 'h2' ? '#8FB4FF' : '#FFB050', kind === 'h2' ? 0.16 : 0.3);
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * 0.85, y + L * 0.5, x, y + L); ctx.quadraticCurveTo(x + w * 0.85, y + L * 0.5, x + w / 2, y); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.85; ctx.fillStyle = kind === 'h2' ? '#FFFFFF' : '#FFFBE8'; ctx.beginPath();
  ctx.moveTo(x - w * 0.22, y); ctx.quadraticCurveTo(x - w * 0.3, y + L * 0.3, x, y + L * 0.55); ctx.quadraticCurveTo(x + w * 0.3, y + L * 0.3, x + w * 0.22, y); ctx.fill();
  ctx.globalAlpha = 1;
  if (diamonds) for (let k = 1; k <= 4; k++){ ctx.globalAlpha = 0.75 - k * 0.12; ctx.fillStyle = '#FFFFF0'; ctx.beginPath(); ctx.ellipse(x, y + L * (0.1 + 0.11 * k) + Math.sin(t * 40 + k) * 2, w * (0.2 - k * 0.025), L * 0.03, 0, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
}

/* ---------- the launch tower ---------- */
function csTower(ctx, x, baseY, h, retract){
  const w = 46, cols = ['#C25A32', '#8A3A20'];
  ctx.strokeStyle = cols[0]; ctx.lineWidth = 4; ctx.beginPath();
  ctx.moveTo(x, baseY); ctx.lineTo(x, baseY - h); ctx.moveTo(x + w, baseY); ctx.lineTo(x + w, baseY - h); ctx.stroke();
  ctx.strokeStyle = cols[1]; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let y = baseY; y > baseY - h + 24; y -= 28){ ctx.moveTo(x, y); ctx.lineTo(x + w, y - 28); ctx.moveTo(x + w, y); ctx.lineTo(x, y - 28); }
  ctx.stroke();
  ctx.strokeStyle = cols[0]; ctx.lineWidth = 3.4; ctx.beginPath();
  for (let y = baseY - 60; y > baseY - h; y -= 60){ ctx.moveTo(x - 5, y); ctx.lineTo(x + w + 5, y); }
  ctx.stroke();
  ctx.strokeStyle = '#B8BEC8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w / 2, baseY - h); ctx.lineTo(x + w / 2, baseY - h - 30); ctx.stroke();
  ctx.fillStyle = '#FF3A3A'; if (Math.sin(csNow * 4) > 0) { ctx.beginPath(); ctx.arc(x + w / 2, baseY - h - 30, 3, 0, TAU); ctx.fill(); }
  /* swing arms: rotating away about the tower is foreshortened in side view, so they simply shorten and vanish */
  const reach = (1 - retract) * 70, levels = [100, 170, 240, 310, 380, 448];
  ctx.strokeStyle = '#C8623A'; ctx.lineWidth = 4;
  for (let i = 0; i < levels.length; i++){
    const yy = baseY - levels[i]; ctx.beginPath(); ctx.moveTo(x + w, yy); ctx.lineTo(x + w + reach, yy); ctx.stroke();
    if (reach > 4) { ctx.fillStyle = '#D8D8D4'; ctx.fillRect(x + w + reach - 3, yy - 4, 4, 8); }
  }
  const wr = baseY - 448;                                           /* the crew access arm ends in the white room */
  if (reach > 6){ ctx.fillStyle = '#F2F2EE'; ctx.fillRect(x + w + reach - 20, wr - 12, 20, 22); ctx.strokeStyle = '#8A8C92'; ctx.lineWidth = 1; ctx.strokeRect(x + w + reach - 20, wr - 12, 20, 22); }
}
let csNow = 0;

/* ---------- the stack: Saturn V-style stages, in stack units ---------- */
const CS_STK = { sic: [0, 150], sii: [172, 272], is1: [150, 172], is2: [272, 284], siv: [284, 354], iu: [354, 362], sla: [362, 422], sm: [422, 462], cm: [462, 488], les: [488, 558] };
const CS_ORDER = ['sic', 'sii', 'is1', 'is2', 'siv', 'iu', 'sla', 'sm', 'cm', 'les'];
const CS_WHITE = '#F2F2EE', CS_BLACK = '#1A1A1E';
function csShadeBody(ctx, x0, y0, w, h){
  ctx.fillStyle = 'rgba(0,0,0,.17)'; ctx.fillRect(x0 + w * 0.68, y0, w * 0.32, h);
  ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.fillRect(x0 + 2, y0, 3, h);
}
function csPartSIC(ctx){
  ctx.fillStyle = '#7C7E86';
  ctx.beginPath(); ctx.moveTo(-22, -46); ctx.lineTo(-46, 6); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(22, -46); ctx.lineTo(46, 6); ctx.lineTo(22, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2E2A26';
  for (const ex of [-14, -7, 0, 7, 14]){ const dy = ex === 0 ? 17 : 12; ctx.beginPath(); ctx.moveTo(ex - 3, 0); ctx.lineTo(ex - 5.4, dy); ctx.lineTo(ex + 5.4, dy); ctx.lineTo(ex + 3, 0); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-22, -150, 44, 150);
  ctx.fillStyle = CS_BLACK; ctx.fillRect(0, -150, 22, 150); ctx.fillRect(-22, -150, 44, 10);          /* the roll pattern */
  ctx.fillStyle = CS_BLACK; ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('U', -11, -118); ctx.fillText('S', -11, -105); ctx.fillText('A', -11, -92);
  csShadeBody(ctx, -22, -150, 44, 150);
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let y = -30; y > -150; y -= 30){ ctx.moveTo(-22, y); ctx.lineTo(22, y); } ctx.stroke();
}
function csPartIS1(ctx){
  ctx.fillStyle = '#2A2A2E'; ctx.fillRect(-22, -22, 44, 22);
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-22, -12, 44, 3);
  ctx.fillStyle = '#5A5C64'; for (const s of [-16, -6, 6, 16]) ctx.fillRect(s - 2, -20, 4, 6);
  csShadeBody(ctx, -22, -22, 44, 22);
}
function csPartSII(ctx){
  ctx.fillStyle = '#2E2A26';                                          /* five J-2 engines */
  for (const ex of [-13, -6.5, 0, 6.5, 13]){ ctx.beginPath(); ctx.moveTo(ex - 2.6, 0); ctx.lineTo(ex - 4.4, 12); ctx.lineTo(ex + 4.4, 12); ctx.lineTo(ex + 2.6, 0); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-22, -100, 44, 100);
  ctx.fillStyle = CS_BLACK; ctx.fillRect(-22, -100, 44, 9); ctx.fillRect(-22, -52, 44, 4);
  ctx.fillStyle = CS_BLACK; ctx.font = '700 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('NASA', 0, -66);
  csShadeBody(ctx, -22, -100, 44, 100);
}
function csPartIS2(ctx){
  ctx.fillStyle = '#2A2A2E'; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-15, -12); ctx.lineTo(15, -12); ctx.lineTo(22, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-19, -5, 38, 2);
}
function csPartSIVB(ctx){
  ctx.fillStyle = '#2E2A26'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-6, 16); ctx.lineTo(6, 16); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();   /* the single J-2 */
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-15, -70, 30, 70);
  ctx.fillStyle = CS_BLACK; ctx.fillRect(-15, -70, 30, 6); ctx.fillRect(-15, -8, 30, 8);
  ctx.fillStyle = '#7A7C84'; ctx.fillRect(-19, -14, 5, 9); ctx.fillRect(14, -14, 5, 9);                                                          /* attitude-control pods */
  csShadeBody(ctx, -15, -70, 30, 70);
}
function csPartIU(ctx){ ctx.fillStyle = CS_WHITE; ctx.fillRect(-15, -8, 30, 8); ctx.fillStyle = CS_BLACK; ctx.fillRect(-15, -5, 30, 3); csShadeBody(ctx, -15, -8, 30, 8); }
function csPartSLA(ctx){
  ctx.fillStyle = CS_WHITE; ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-9, -60); ctx.lineTo(9, -60); ctx.lineTo(15, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.moveTo(-15, -30); ctx.lineTo(15, -30); ctx.stroke();
  csShadeBody(ctx, -15, -60, 30, 60);
}
function csPartSM(ctx){
  ctx.fillStyle = '#3A3630'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-6, 14); ctx.lineTo(6, 14); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();   /* service engine */
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-9, -40, 18, 40);
  ctx.fillStyle = '#C8C8C4'; ctx.fillRect(-9, -34, 18, 4); ctx.fillRect(-9, -22, 18, 4); ctx.fillRect(-9, -10, 18, 4);
  ctx.fillStyle = '#7A7C84'; ctx.fillRect(-12, -28, 3, 6); ctx.fillRect(9, -28, 3, 6);
  csShadeBody(ctx, -9, -40, 18, 40);
}
function csPartCM(ctx){
  ctx.fillStyle = '#3E3C40'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-8, -6); ctx.lineTo(8, -6); ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();          /* heat shield */
  ctx.fillStyle = '#D8D8D4'; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-3, -24); ctx.quadraticCurveTo(0, -27, 3, -24); ctx.lineTo(8, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A3448'; ctx.beginPath(); ctx.moveTo(-2, -13); ctx.lineTo(2, -13); ctx.lineTo(1, -18); ctx.lineTo(-1, -18); ctx.closePath(); ctx.fill();   /* window */
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(2, -24, 6, 18);
}
function csPartLES(ctx){
  ctx.strokeStyle = '#9A9CA4'; ctx.lineWidth = 1.4; ctx.beginPath();
  ctx.moveTo(-5, 0); ctx.lineTo(-2, -26); ctx.moveTo(5, 0); ctx.lineTo(2, -26); ctx.moveTo(-4, -10); ctx.lineTo(4, -18); ctx.moveTo(4, -10); ctx.lineTo(-4, -18); ctx.stroke();   /* the truss */
  ctx.fillStyle = CS_WHITE; ctx.fillRect(-3.4, -52, 6.8, 26);                                                                                                        /* rocket motor */
  ctx.fillStyle = '#C8342A'; ctx.fillRect(-3.4, -34, 6.8, 3);
  ctx.beginPath(); ctx.moveTo(-3.4, -52); ctx.lineTo(0, -66); ctx.lineTo(3.4, -52); ctx.closePath(); ctx.fillStyle = '#E8E8E4'; ctx.fill();
  ctx.strokeStyle = '#8A8C92'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -70); ctx.stroke();
  ctx.fillStyle = '#B8BCC4'; ctx.fillRect(-9, -46, 5.6, 1.6); ctx.fillRect(3.4, -46, 5.6, 1.6);                                                                         /* canards */
}
const CS_PART_FN = { sic: csPartSIC, sii: csPartSII, is1: csPartIS1, is2: csPartIS2, siv: csPartSIVB, iu: csPartIU, sla: csPartSLA, sm: csPartSM, cm: csPartCM, les: csPartLES };
/* Draws the stack with its origin at the base of the S-IC, up being -y.
   cfg.hide[name] hides a part; cfg.off[name] = {x, y, r} detaches and moves it. */
function csStack(ctx, cfg){
  for (let i = 0; i < CS_ORDER.length; i++){
    const n = CS_ORDER[i];
    if (cfg.hide && cfg.hide[n]) continue;
    const st = CS_STK[n], h = st[1] - st[0], off = (cfg.off && cfg.off[n]) || null;
    ctx.save();
    if (off){ ctx.translate(off.x, -st[0] - h / 2 + off.y); ctx.rotate(off.r || 0); ctx.translate(0, h / 2); }
    else ctx.translate(0, -st[0]);
    CS_PART_FN[n](ctx);
    ctx.restore();
  }
}

/* ---------- the lunar lander: origin at the ground under it, up is -y, faces right ---------- */
/* c: legs 0..1 (folded..deployed), hatch 0..1, flame 0..1, beacon 0/1, probe 0/1, char 0..1, ascentGone, t */
function csLander(ctx, c){
  const legs = c.legs === undefined ? 1 : c.legs, t = c.t || 0;
  const padX = csLerp(28, 66, legs), padY = csLerp(-26, 0, legs), ch = c.char || 0;
  const foil = (a, b) => { const g = ctx.createLinearGradient(-36, -50, 36, -22); g.addColorStop(0, csHex(a, '#2A2620', ch)); g.addColorStop(1, csHex(b, '#1A1814', ch)); return g; };
  /* landing legs: the two on the far side first, smaller and darker */
  for (const far of [true, false]){
    for (const side of [-1, 1]){
      const px = far ? side * padX * 0.5 : side * padX, sc = far ? 0.82 : 1, py = padY;
      ctx.strokeStyle = far ? '#5E6068' : '#93959C'; ctx.lineWidth = 4 * sc; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(side * (far ? 16 : 30), -38); ctx.lineTo(px, py - 3); ctx.stroke();
      ctx.lineWidth = 2.6 * sc; ctx.beginPath(); ctx.moveTo(side * (far ? 9 : 16), -18); ctx.lineTo(csLerp(px, side * (far ? 12 : 24), 0.34), csLerp(py, -34, 0.28)); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = far ? '#8A8C94' : '#C4C7CE'; ctx.beginPath(); ctx.ellipse(px, py, 11 * sc, 3.2 * sc, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(px, py + 1.4, 11 * sc, 1.6 * sc, 0, 0, TAU); ctx.fill();
      if (!far && legs > 0.8){                                   /* contact probes */
        ctx.strokeStyle = '#DADCE0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py + 2); ctx.lineTo(px, py + 13); ctx.stroke();
        if (c.probe){ csGlow(ctx, px, py + 13, 12, '#5AB8FF', 0.85); fillCircle(ctx, px, py + 13, 2.2, '#DFF4FF'); }
      }
    }
  }
  if (legs > 0.6 && !c.noLadder){                                /* the ladder down the front leg */
    const lx0 = 44, ly0 = -50, lx1 = padX - 4, ly1 = -2;
    ctx.strokeStyle = '#B4B7BE'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly1); ctx.moveTo(lx0 + 5, ly0 + 2); ctx.lineTo(lx1 + 5, ly1 + 1); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath();
    for (let k = 1; k < 8; k++){ const f = k / 8; ctx.moveTo(csLerp(lx0, lx1, f), csLerp(ly0, ly1, f)); ctx.lineTo(csLerp(lx0, lx1, f) + 5, csLerp(ly0, ly1, f) + 1.2); }
    ctx.stroke();
  }
  /* descent stage, wrapped in gold foil */
  ctx.fillStyle = foil('#EBC562', '#B8862A');
  ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(34, -22); ctx.lineTo(38, -30); ctx.lineTo(38, -46); ctx.lineTo(34, -50); ctx.lineTo(-34, -50); ctx.lineTo(-38, -46); ctx.lineTo(-38, -30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,10,.55)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,170,.55)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k < 14; k++){ const x = -34 + k * 5.2 + csR(k) * 3, y = -48 + csR(k + 30) * 22; ctx.moveTo(x, y); ctx.lineTo(x + 5, y + 6 - csR(k + 60) * 4); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(110,72,12,.55)'; ctx.beginPath();
  for (let k = 0; k < 10; k++){ const x = -32 + k * 7 + csR(k + 90) * 3, y = -46 + csR(k + 120) * 22; ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 5); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(14, -50, 24, 28);
  ctx.fillStyle = csHex('#3A3A40', '#15151A', ch);                /* the descent engine */
  ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(-14, -6); ctx.lineTo(14, -6); ctx.lineTo(8, -22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1A1A1E'; ctx.beginPath(); ctx.ellipse(0, -6, 14, 2.4, 0, 0, TAU); ctx.fill();
  if (c.flame > 0.02) csFlame(ctx, 0, -6, 92 * c.flame, 22 + 8 * c.flame, 'h2', t, false);
  if (!c.ascentGone){
    /* ascent stage */
    const ag = ctx.createLinearGradient(-30, -96, 30, -50); ag.addColorStop(0, csHex('#DADAD6', '#2A2A2E', ch)); ag.addColorStop(1, csHex('#A8A8A4', '#1A1A1E', ch));
    ctx.fillStyle = ag; ctx.beginPath();
    ctx.moveTo(-26, -50); ctx.lineTo(26, -50); ctx.lineTo(30, -60); ctx.lineTo(30, -82); ctx.lineTo(16, -96); ctx.lineTo(-16, -96); ctx.lineTo(-30, -82); ctx.lineTo(-30, -60); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,60,66,.6)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#3A3A40'; ctx.fillRect(-26, -56, 52, 6);
    ctx.strokeStyle = 'rgba(70,70,76,.5)'; ctx.beginPath(); ctx.moveTo(-30, -70); ctx.lineTo(30, -70); ctx.moveTo(0, -96); ctx.lineTo(0, -56); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(12, -96, 18, 40);
    ctx.fillStyle = '#131A28'; ctx.beginPath(); ctx.moveTo(13, -91); ctx.lineTo(27, -80); ctx.lineTo(13, -75); ctx.closePath(); ctx.fill();        /* the triangular window */
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(15, -89); ctx.lineTo(21, -84); ctx.lineTo(15, -83); ctx.closePath(); ctx.fill();
    if (c.beacon && c.warnGlow) { ctx.fillStyle = 'rgba(255,60,50,.55)'; ctx.beginPath(); ctx.moveTo(13, -91); ctx.lineTo(27, -80); ctx.lineTo(13, -75); ctx.closePath(); ctx.fill(); }
    const h = c.hatch || 0, hy = c.wide ? -88 : -72, hh = c.wide ? 36 : 16, dk = c.deck || 0, dEnd = 50 + 46 * dk;       /* the front hatch, and a porch that can be extended for a big passenger */
    ctx.fillStyle = '#4A4C54'; ctx.fillRect(24, hy, 10, hh);
    if (h > 0){ ctx.fillStyle = 'rgba(255,224,150,' + (0.5 + 0.5 * h) + ')'; ctx.fillRect(25, hy + 2, 8 * h + 1, hh - 4); csGlow(ctx, 38, hy + hh / 2, 22 * h, '#FFE0A0', 0.4 * h); }
    ctx.strokeStyle = '#9A9CA4'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(34, hy + hh); ctx.lineTo(34 + 11 * h, hy + hh - hh * 0.55 * (1 - h) - 2); ctx.stroke();
    ctx.fillStyle = '#8A8C92'; ctx.fillRect(30, -53, dEnd - 30, 3);
    ctx.strokeStyle = '#8A8C92'; ctx.lineWidth = 1.2; ctx.beginPath();
    if (dk > 0.02){ ctx.moveTo(dEnd, -53); ctx.lineTo(dEnd, -64); ctx.moveTo(38, -62); ctx.lineTo(dEnd, -62); ctx.moveTo(dEnd - 4, -50); ctx.lineTo(dEnd - 12, -1); ctx.moveTo(dEnd - 34, -50); ctx.lineTo(dEnd - 22, -1); }
    else { ctx.moveTo(50, -53); ctx.lineTo(50, -62); ctx.moveTo(38, -53); ctx.lineTo(38, -60); }
    ctx.stroke();
    if (dk > 0.02){ ctx.fillStyle = '#B4B7BE'; ctx.beginPath(); ctx.ellipse(dEnd - 12, -1, 5, 1.6, 0, 0, TAU); ctx.ellipse(dEnd - 22, -1, 5, 1.6, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#2E2E34'; ctx.fillRect(-36, -78, 6, 10); ctx.fillRect(30, -78, 6, 10);                                                       /* thruster quads */
    ctx.strokeStyle = '#6A6C74'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-36, -76); ctx.lineTo(-40, -79); ctx.moveTo(-36, -70); ctx.lineTo(-40, -67); ctx.moveTo(36, -76); ctx.lineTo(40, -79); ctx.moveTo(36, -70); ctx.lineTo(40, -67); ctx.stroke();
    ctx.strokeStyle = '#B4B7BE'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-8, -96); ctx.lineTo(-8, -105); ctx.moveTo(-22, -92); ctx.lineTo(-32, -110); ctx.stroke();      /* antennas */
    ctx.fillStyle = '#D0D2D8'; ctx.beginPath(); ctx.ellipse(-8, -106, 5, 2, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-33, -112, 9, 3.4, -0.7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#26262A'; ctx.beginPath(); ctx.ellipse(0, -97, 8, 2.4, 0, 0, TAU); ctx.fill();                                              /* the docking tunnel */
    if (c.beacon){ csGlow(ctx, 8, -99, 18, '#FF3A2E', 0.8); fillCircle(ctx, 8, -99, 2.8, '#FF6A5A'); }
  }
}

/* ---------- the command and service module, nose up, origin at the service engine's base ---------- */
function csDrawCSM(ctx, probe){
  ctx.save(); ctx.translate(0, 0); csPartSM(ctx);
  ctx.save(); ctx.translate(0, -40); csPartCM(ctx); ctx.restore();
  ctx.strokeStyle = '#D0D2D8'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -66 - (probe === undefined ? 8 : probe)); ctx.stroke();      /* docking probe */
  ctx.fillStyle = '#D0D2D8'; ctx.beginPath(); ctx.moveTo(-2.4, -66 - (probe === undefined ? 8 : probe)); ctx.lineTo(0, -66 - (probe === undefined ? 8 : probe) - 3); ctx.lineTo(2.4, -66 - (probe === undefined ? 8 : probe)); ctx.fill();
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(9, -14); ctx.lineTo(16, -20); ctx.stroke();                                              /* high-gain antenna */
  ctx.fillStyle = '#E4E6EA'; ctx.beginPath(); ctx.ellipse(17, -21, 5, 2, -0.7, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ---------- the astronaut giraffe: a side view with a glass helmet ---------- */
const CS_SPOTS = [[-26, -104, 9, 7], [-8, -112, 8, 6], [10, -106, 9, 7], [-16, -92, 7, 5], [4, -92, 8, 5], [24, -98, 7, 6], [-36, -94, 6, 5], [34, -110, 6, 5]];
function csGiraffeGeom(g){
  const nk = g.neck === undefined ? 0.35 : g.neck, hd = g.head === undefined ? 0.15 : g.head, crouch = g.crouch || 0;
  const bx = 30, by = -112 + crouch, L = 92;
  const tx = bx + Math.sin(nk) * L, ty = by - Math.cos(nk) * L;
  const dx = Math.cos(hd), dy = Math.sin(hd);
  return { bx: bx, by: by, tx: tx, ty: ty, nk: nk, hd: hd, dx: dx, dy: dy, hx: tx + dx * 10, hy: ty + dy * 10 };
}
function csLimb(ctx, x0, y0, x1, y1, kx, ky, w0, w1, col){
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = w0; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.lineWidth = w1; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.lineCap = 'butt';
}
function csGiraffe(ctx, g){
  const s = g.s || 1, face = g.face || 1, walk = g.walk || 0, crouch = g.crouch || 0, tuck = g.tuck || 0;
  const cu = typeof giraffeCustom === 'function' ? giraffeCustom() : null, pt = typeof giraffePattern === 'function' ? giraffePattern() : 0;      /* her chosen colours and spots (js/44e-wardrobe.js) */
  const coat = g.coat || (cu ? cu.coat : '#D6A44F'), dark = g.darkc || (cu ? cu.dark : '#B98A3C'), spot = g.spotc || (cu ? cu.spot : '#8A5A24');
  ctx.save(); ctx.translate(g.x, g.y); ctx.scale(face * s, s);
  const geo = csGiraffeGeom(g);
  const legSet = (far) => {
    const pairs = far ? [[30, 0], [-32, 1]] : [[22, 1], [-40, 0]];
    for (let i = 0; i < pairs.length; i++){
      const hx = pairs[i][0] + (far ? 6 : 0), hy = -84 + crouch, ph = walk + pairs[i][1] * Math.PI + (far ? Math.PI * 0.5 : 0);
      const sw = (g.moving ? Math.sin(ph) * 15 : 0), lf = g.moving ? Math.max(0, Math.cos(ph)) * 11 : 0;
      const fx = hx + sw * 0.6 + tuck * 10, fy = -lf - tuck * 44 - (g.lift || 0);
      const kx = (hx + fx) / 2 + 5 + tuck * 7, ky = (hy + fy) / 2 + 3;
      csLimb(ctx, hx, hy, fx, fy, kx, ky, 9.6, 6.6, far ? dark : coat);
      if (g.boots !== false){ ctx.fillStyle = '#E6E6E4'; ctx.fillRect(fx - 4.4, fy - 8, 8.8, 8); ctx.fillStyle = '#4A4A50'; ctx.fillRect(fx - 4.8, fy - 1.6, 9.8, 2.6); ctx.fillStyle = 'rgba(150,146,140,' + (g.dust || 0) * 0.85 + ')'; ctx.fillRect(fx - 4.4, fy - 4, 8.8, 4); }
    }
  };
  legSet(true);
  /* tail */
  ctx.strokeStyle = coat; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-46, -104 + crouch); ctx.quadraticCurveTo(-60, -98 + crouch, -66 + Math.sin(walk) * 3, -76 + crouch); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#3A2A18'; ctx.beginPath(); ctx.ellipse(-66 + Math.sin(walk) * 3, -73 + crouch, 3.4, 6.4, 0.2, 0, TAU); ctx.fill();
  /* body */
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(0, -98 + crouch, 49, 26, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,200,.28)'; ctx.beginPath(); ctx.ellipse(2, -88 + crouch, 42, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = spot;
  for (let i = 0; i < CS_SPOTS.length; i++){ const sp = CS_SPOTS[i]; if (pt) wardSpot(ctx, pt, sp[0], sp[1] + crouch, sp[2], sp[3], (i % 3) * 0.4); else { ctx.beginPath(); ctx.ellipse(sp[0], sp[1] + crouch, sp[2], sp[3], (i % 3) * 0.4, 0, TAU); ctx.fill(); } }
  legSet(false);
  if (!g.bare){      /* life-support pack and hose (she has none once she is home) */
  ctx.fillStyle = '#ECECEA'; ctx.fillRect(-14, -132 + crouch, 32, 22); ctx.strokeStyle = '#8A8C94'; ctx.lineWidth = 1; ctx.strokeRect(-14, -132 + crouch, 32, 22);
  ctx.fillStyle = '#8A8C94'; ctx.fillRect(-9, -128 + crouch, 10, 4); ctx.fillRect(6, -128 + crouch, 8, 4); ctx.fillStyle = '#4A9CE0'; ctx.fillRect(-9, -120 + crouch, 4, 4); ctx.fillStyle = '#E86A3A'; ctx.fillRect(-2, -120 + crouch, 4, 4);
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(4, -132 + crouch); ctx.lineTo(4, -142 + crouch); ctx.stroke(); fillCircle(ctx, 4, -142 + crouch, 1.8, '#B8BCC4');
  }
  /* neck */
  const nx = Math.cos(geo.nk), ny = Math.sin(geo.nk);                                     /* perpendicular to the neck direction */
  const px = nx, py = ny;
  ctx.fillStyle = coat; ctx.beginPath();
  ctx.moveTo(geo.bx - px * 13, geo.by - py * 13 + 6); ctx.lineTo(geo.tx - px * 7.6, geo.ty - py * 7.6); ctx.lineTo(geo.tx + px * 7.6, geo.ty + py * 7.6); ctx.lineTo(geo.bx + px * 13, geo.by + py * 13 + 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = spot;
  for (let k = 1; k < 6; k++){ const f = k / 6.4, cx0 = csLerp(geo.bx, geo.tx, f) + (k % 2 ? 3 : -3), cy0 = csLerp(geo.by, geo.ty, f); if (pt) wardSpot(ctx, pt, cx0, cy0, 5.4 - f * 1.6, 4.4 - f * 1.2, geo.nk); else { ctx.beginPath(); ctx.ellipse(cx0, cy0, 5.4 - f * 1.6, 4.4 - f * 1.2, geo.nk, 0, TAU); ctx.fill(); } }
  /* head */
  const hx = geo.tx, hy = geo.ty, dx = geo.dx, dy = geo.dy, ux = -dy, uy = dx;              /* forward and "up" of the head */
  ctx.save(); ctx.translate(hx + dx * 8, hy + dy * 8); ctx.rotate(geo.hd);
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(0, 0, 21, 10.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8C891'; ctx.beginPath(); ctx.ellipse(18, 1.4, 11, 8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5A3A20'; ctx.beginPath(); ctx.ellipse(27, 1, 2.4, 3.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(-14, -7.6, 9, 3.6, -0.6, 0, TAU); ctx.fill();                                    /* ear */
  ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(-9, -19); ctx.moveTo(1, -9.4); ctx.lineTo(0, -19); ctx.stroke();  /* ossicones */
  fillCircle(ctx, -9, -20, 2.6, '#4A2E12'); fillCircle(ctx, 0, -20, 2.6, '#4A2E12');
  if ((g.blink || 0) > 0.5){ ctx.strokeStyle = '#2A1A0C'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5, -3.6); ctx.lineTo(11, -3.6); ctx.stroke(); }
  else { fillCircle(ctx, 8, -3.6, 3.4, '#FFFFFF'); fillCircle(ctx, 8.8 + (g.look || 0), -3.6, 2.2, '#1A1008'); fillCircle(ctx, 9.5 + (g.look || 0), -4.4, 0.8, '#FFFFFF'); }
  ctx.restore();
  if (!g.bare){
  /* the helmet: a glass bubble, a metal neck ring, and the hose */
  const cx = hx + dx * 9, cy = hy + dy * 9, R = 31;
  const rx = geo.tx - Math.sin(geo.nk) * 24, ry = geo.ty + Math.cos(geo.nk) * 24;
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx - px * 4, ry - py * 4 + 2); ctx.quadraticCurveTo(rx - 22, ry + 20, 6, -134 + crouch); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx - px * 4, ry - py * 4 + 1); ctx.quadraticCurveTo(rx - 22, ry + 19, 6, -135 + crouch); ctx.stroke();
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(geo.nk);
  ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.ellipse(0, 0, 14.6, 5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6E7480'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#7A808C'; for (const bx of [-9, -3, 3, 9]) fillCircle(ctx, bx, 0, 1, '#6A707C');
  ctx.restore();
  const gl = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  gl.addColorStop(0, 'rgba(225,240,255,.16)'); gl.addColorStop(0.7, 'rgba(160,205,255,.13)'); gl.addColorStop(1, 'rgba(230,242,255,.42)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(235,245,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R - 5, Math.PI * 1.08, Math.PI * 1.45); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(cx + R * 0.42, cy - R * 0.5, 4.2, 2.2, -0.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(cx - 6, cy - R); ctx.lineTo(cx - 8, cy - R - 11); ctx.stroke(); fillCircle(ctx, cx - 8, cy - R - 11, 1.8, '#FF5A4A');
  }
  ctx.restore();
}
/* where the head is, on screen, so a window can be framed around it */
function csGiraffeHead(g){
  const geo = csGiraffeGeom(g), s = g.s || 1, face = g.face || 1;
  return { x: g.x + face * (geo.tx + geo.dx * 9) * s, y: g.y + (geo.ty + geo.dy * 9) * s };   /* the helmet's centre, exactly as csGiraffe draws it */
}

/* ---------- shared overlays ---------- */
function csText(ctx, txt, x, y, size, color, align, weight){
  ctx.font = (weight || '700') + ' ' + size + 'px ' + CS_MONO; ctx.fillStyle = color || '#E8F0FF'; ctx.textAlign = align || 'left';
  ctx.fillText(txt, x, y); ctx.textAlign = 'left';
}
/* a small camera window inside the cabin, showing the helmeted giraffe */
function csCabin(ctx, x, y, w, h, t, o){
  o = o || {};
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,8,.78)'; ctx.fillRect(x - 6, y - 6, w + 12, h + 30);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#1E2534'); g.addColorStop(1, '#0B0F17'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 9; i++){
    const on = Math.sin(t * (1.3 + i * 0.37) + i * 2) > -0.25;
    ctx.fillStyle = on ? (i % 3 === 0 ? '#FFB030' : i % 3 === 1 ? '#5CE08A' : '#FF5A4A') : '#2A2E38';
    ctx.fillRect(x + 8 + i * (w - 16) / 9, y + h - 15, 6, 4);
  }
  const sh = o.shake ? csShake(t, o.shake) : [0, 0];
  const gc = { x: 0, y: 0, s: o.s || 1.25, face: 1, neck: o.neck === undefined ? 0.85 : o.neck, head: o.head === undefined ? -0.05 : o.head,
    blink: (Math.sin(t * 1.1) > 0.95 || Math.sin(t * 0.53 + 1) > 0.96) ? 1 : 0, look: o.look || 0, boots: false };
  const hp = csGiraffeHead(gc);
  ctx.save(); ctx.translate(x + w * 0.5 - hp.x + sh[0], y + h * 0.5 - hp.y + sh[1]); csGiraffe(ctx, gc); ctx.restore();
  if (o.glow){ ctx.fillStyle = o.glow; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  ctx.strokeStyle = '#8A93A8'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  csText(ctx, o.label || 'CABIN', x + 2, y + h + 15, 11, '#B8C6E8', 'left', '600');
}

/* ======================= SCENE 1: the launch pad (0-14s) ======================= */
function csScenePad(ctx, u, t){
  csNow = t;
  const T0 = 9.0, lift = u > T0 ? 20 * (u - T0) * (u - T0) : 0, cam = lift * 0.9;
  const alt = csC(lift / 1500, 0, 0.3);
  csSky(ctx, alt);
  csStars(ctx, 0.55 * (1 - csSm(0, 0.12, alt)), t, 0, 0);
  const sk = u > 8.2 ? csShake(t, (0.5 + 2.4 * csSm(9, 11, u)) * csSm(8.2, 9.2, u)) : [0, 0];
  ctx.save(); ctx.translate(sk[0], sk[1]);
  /* distant scenery: the assembly building, a water tower, trees, and dawn searchlights */
  ctx.save(); ctx.translate(0, cam * 0.3);
  const sla = 1 - csSm(0, 0.2, alt);
  for (const [bx, ph] of [[250, 0], [1020, 2.2]]){
    ctx.save(); ctx.translate(bx, 612); ctx.rotate(Math.sin(t * 0.4 + ph) * 0.45);
    const g = ctx.createLinearGradient(0, 0, 0, -720); g.addColorStop(0, 'rgba(255,240,200,' + (0.3 * sla) + ')'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-44, -720); ctx.lineTo(44, -720); ctx.lineTo(5, 0); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = '#1B2540'; ctx.fillRect(70, 380, 210, 240); ctx.fillStyle = '#26314F'; ctx.fillRect(70, 380, 210, 14);
  ctx.fillStyle = '#2E3A5C'; ctx.fillRect(150, 470, 50, 150); ctx.fillStyle = '#39466C';
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) ctx.fillRect(84 + i * 32, 410 + j * 16, 14, 6);
  ctx.strokeStyle = '#3A4668'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(262, 380); ctx.lineTo(262, 336); ctx.stroke();
  ctx.fillStyle = '#C8342A'; ctx.fillRect(262, 338, 22, 12);
  ctx.strokeStyle = '#1E2842'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1100, 612); ctx.lineTo(1112, 520); ctx.moveTo(1140, 612); ctx.lineTo(1128, 520); ctx.stroke();
  ctx.fillStyle = '#1E2842'; ctx.beginPath(); ctx.ellipse(1120, 506, 32, 22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#16241E';
  for (let i = 0; i < 62; i++){ ctx.beginPath(); ctx.arc(i * 21 + csR(i) * 10, 608, 13 + csR(i + 50) * 12, 0, TAU); ctx.fill(); }
  ctx.restore();
  /* the world, following the rocket up */
  ctx.translate(0, cam);
  const gg = ctx.createLinearGradient(0, 610, 0, 900); gg.addColorStop(0, '#2B3B26'); gg.addColorStop(1, '#1A2416');
  ctx.fillStyle = gg; ctx.fillRect(-100, 610, 1500, 1200);
  ctx.fillStyle = '#8E8E8A'; ctx.fillRect(360, 596, 560, 120); ctx.fillStyle = '#A8A8A4'; ctx.fillRect(360, 596, 560, 6);   /* the pad */
  for (let x = 360; x < 920; x += 20){ ctx.fillStyle = ((x - 360) / 20) % 2 ? '#E8C020' : '#1A1A1E'; ctx.fillRect(x, 704, 20, 12); }
  ctx.fillStyle = '#15151A'; ctx.fillRect(588, 602, 104, 114);                                                                 /* the flame trench */
  ctx.fillStyle = '#2A2A30'; ctx.beginPath(); ctx.moveTo(606, 716); ctx.lineTo(640, 636); ctx.lineTo(674, 716); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3E424A'; ctx.fillRect(596, 586, 88, 12);
  for (const sx of [-1, 1]){                                                                                                   /* hold-down arms release at T-0 */
    ctx.save(); ctx.translate(640 + sx * 34, 588); ctx.rotate(sx * csSm(T0, T0 + 0.5, u) * 0.9);
    ctx.fillStyle = '#5A5E68'; ctx.fillRect(-4, -14, 8, 14); ctx.restore();
  }
  for (const mx of [430, 850]){                                                                                                /* lightning masts */
    ctx.strokeStyle = '#6A6E78'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, 596); ctx.lineTo(mx, 70); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mx, 90); ctx.lineTo(mx - 46, 610); ctx.moveTo(mx, 90); ctx.lineTo(mx + 46, 610); ctx.stroke();
    if (Math.sin(t * 3 + mx) > 0){ csGlow(ctx, mx, 70, 12, '#FF3A3A', 0.6); fillCircle(ctx, mx, 70, 3, '#FF6A5A'); }
  }
  if (u > 5.4 && u < 9.6){                                                                                                     /* hydrogen burn-off igniters */
    for (const sx of [-1, 1]) if (Math.sin(t * 24 + sx) > -0.3){ csGlow(ctx, 640 + sx * 62, 610, 18, '#FFB040', 0.5); fillCircle(ctx, 640 + sx * 62, 611, 3.4, '#FFE8A0'); }
  }
  /* sound-suppression water */
  const wI = csSm(6.0, 6.8, u) * (1 - csSm(12, 14, u));
  if (wI > 0.01) for (const sx of [-1, 1]) for (let k = 0; k < 26; k++){
    const f = (t * 1.6 + k / 26) % 1, x = 640 + sx * (56 + 96 * f), y = 596 - 170 * Math.sin(Math.PI * f * 0.92);
    ctx.globalAlpha = 0.55 * wI * (1 - f * 0.5); ctx.fillStyle = '#D4ECFF'; ctx.beginPath(); ctx.arc(x, y, 2.6 - f, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  /* the rocket, with its exhaust */
  ctx.save(); ctx.translate(640, 600 - lift);
  const I = csSm(8.0, 9.4, u);
  if (I > 0.01){
    const len = I * (210 + Math.min(130, lift * 0.22));
    csGlow(ctx, 0, 30, 170 * I, '#FFB25A', 0.42 * I);
    for (const ex of [-14, -7, 0, 7, 14]) csFlame(ctx, ex, 14, len * (ex === 0 ? 1.06 : 1), 17, 'kero', t, ex === 0);
  }
  csStack(ctx, {});
  if (u < 9.7) for (let k = 0; k < 10; k++){                                                                                 /* liquid oxygen venting */
    const f = (t * 0.55 + k * 0.173) % 1, side = k % 2 ? 1 : -1, yy = -(250 + (k % 5) * 44 + f * 30);
    ctx.globalAlpha = 0.5 * (1 - f); ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(side * (22 + f * 34), yy, 9 + f * 14, 5 + f * 8, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  csTower(ctx, 502, 596, 480, csSm(4.0, 6.0, u));
  /* exhaust clouds rolling out across the ground, and the column of smoke left behind */
  for (let k = 0; k < 54; k++){
    const s = 8.3 + csR(k) * 1.8, age = u - s; if (age <= 0) continue;
    const dir = k % 2 ? 1 : -1, spd = 60 + csR(k + 10) * 240, rise = 14 + csR(k + 20) * 46;
    const x = 640 + dir * (50 + Math.sqrt(age) * spd * 0.9), y = 596 - Math.min(age * rise, 110) - (age > 4 ? age * 4 : 0), r = 24 + 40 * csR(k + 30) + age * 30;
    ctx.globalAlpha = 0.8 * csSm(0, 0.5, age) * (1 - csSm(3, 9, age)); ctx.fillStyle = csHex('#FFCF98', '#E4E0DA', csSm(0, 1.4, age));
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.75, 0, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 44; i++){
    const s = T0 + i * 0.14; if (s > u) break;
    const age = u - s, y = 600 - 20 * (s - T0) * (s - T0) + 26, x = 640 + (csR(i + 70) - 0.5) * 22 + Math.sin(i + age) * age * 5, r = 22 + age * 17;
    ctx.globalAlpha = 0.62 * (1 - csSm(1.2, 7, age)); ctx.fillStyle = '#E8E4DE'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  /* countdown */
  const T = T0 - u;
  if (T > -0.5 && u > 0.6){
    const n = Math.max(0, Math.ceil(T));
    csText(ctx, 'T-' + (T > 0 ? '00:0' + n : '00:00'), 250, 112, 38, T < 3 && T > 0 ? '#FFC84A' : '#E8F0FF', 'center', '700');
  }
  csCabin(ctx, 1028, 40, 220, 138, t, { label: 'CABIN CAM  ·  PILOT', shake: u > T0 ? 1.4 + csSm(T0, T0 + 3, u) * 1.8 : (u > 8 ? 0.6 : 0), s: 1.3, look: 1 });
}

/* ======================= SCENE 2: the ascent (14-36s) ======================= */
const CB = { cut1: 11.4, sep1: 12.0, ign2: 12.3, is1: 15.0, les: 15.6, cut2: 18.4, sep2: 19.0, ign3: 19.4 };
function csFall(tau, seed, dir){ return { x: dir * (10 + seed * 10) * tau, y: 26 * tau + 30 * tau * tau, r: dir * (0.10 + seed * 0.14) * tau * (1 + tau * 0.3) }; }
/* Where things are on screen during the ascent. The rocket only ever CLIMBS: it creeps up the frame all the way, and every stage that drops
   lets what is left climb a little further (it is never pulled back down to re-centre it). The background only ever streams DOWN: stars,
   clouds, and the edge of the Earth. So the whole ascent always reads as going up, and a staging is a lurch forwards, never a fall. */
function csAscentState(u){
  return {
    rise: 0.8 * u + 0.04 * u * u + 36 * csSm(CB.sep1, CB.sep1 + 2.4, u) + 12 * csSm(CB.is1, CB.is1 + 1.6, u) + 36 * csSm(CB.sep2, CB.sep2 + 2.4, u),   /* how far the stack has climbed in the frame, in stack units */
    eh: 170 - 70 * csSm(3, 22, u),                                                  /* the Earth's edge sinks away (a bigger number is higher on screen) */
    starY: 12 * u + 1.1 * u * u,                                                    /* the stars stream down, faster and faster */
    cloud: 60 * u + 9 * u * u                                                       /* and so do the clouds */
  };
}
function csSceneAscent(ctx, u, t){
  csNow = t;
  const S = csAscentState(u);
  const alt = 0.3 + 0.7 * csSm(0, 16, u);
  csSky(ctx, alt);
  csStars(ctx, csSm(0.5, 0.9, alt), t, -u * 4, S.starY);
  const rot = 0.30 * csSm(6, 22, u);
  csClouds(ctx, S.cloud, (1 - csSm(0.35, 0.62, alt)) * 0.9);
  if (u > 3){ const R = 2700; ctx.globalAlpha = csSm(3, 4.6, u); csEarth(ctx, 640 - rot * 260, CS_H + R - S.eh, R, u * 0.01, t, true); ctx.globalAlpha = 1; }
  const shakeAmp = 1.2 + 2.6 * csBump(u, 5.6, 9.6, 1.2) + 2.0 * csBump(u, CB.sep1 - 0.2, CB.sep1 + 0.9, 0.2) + 1.2 * csBump(u, CB.les - 0.1, CB.les + 0.9, 0.2);
  const sk = csShake(t, shakeAmp * (1 - csSm(20, 22, u) * 0.6));
  ctx.save(); ctx.translate(640 + sk[0], 330 + sk[1]); ctx.rotate(rot); ctx.scale(0.8, 0.8); ctx.translate(0, 260 - S.rise);
  const off = {}, hide = {};
  if (u >= CB.sep1){ off.sic = csFall(u - CB.sep1, 0.3, -1); if (u > CB.sep1 + 6) hide.sic = true; }
  if (u >= CB.is1){ off.is1 = csFall(u - CB.is1, 0.7, 1); if (u > CB.is1 + 5) hide.is1 = true; }
  if (u >= CB.les){ const tau = u - CB.les; off.les = { x: 26 * tau * tau + 8 * tau, y: -(50 * tau * tau + 90 * tau), r: 0.55 * tau }; if (tau > 2.4) hide.les = true; }
  if (u >= CB.sep2){ off.sii = csFall(u - CB.sep2, 0.5, -1); off.is2 = csFall(u - CB.sep2, 0.45, -1); if (u > CB.sep2 + 4) { hide.sii = true; hide.is2 = true; } }
  /* exhaust, drawn under the stages so the engine bells sit on top of it */
  const a = alt, vac = csSm(0.5, 0.95, alt);
  const f1 = (u < CB.sep1 + 0.05) ? (1 - csSm(CB.cut1, CB.cut1 + 0.35, u)) : 0;
  if (f1 > 0.01){
    const len = (170 + 90 * a) * f1, w = 20 * (1 + 0.7 * vac) * (0.6 + 0.4 * f1);
    csGlow(ctx, 0, 60, 120 * f1, '#FFB25A', 0.3 * f1);
    if (u < 10) for (let k = 0; k < 14; k++) csGlow(ctx, 0, 30 + k * 44, 34 + k * 9, '#E8E4DE', 0.2 * (1 - k / 14) * (1 - csSm(7, 10, u)));
    for (const ex of [-14, -7, 0, 7, 14]) csFlame(ctx, ex, 14, len * (ex === 0 ? 1.05 : 1), w * 0.8, 'kero', t, vac < 0.7 && ex === 0);
  }
  const f2 = csSm(CB.ign2, CB.ign2 + 0.5, u) * (1 - csSm(CB.cut2, CB.cut2 + 0.3, u));
  if (f2 > 0.01 && u < CB.sep2 + 0.1) for (const ex of [-13, -6.5, 0, 6.5, 13]) csFlame(ctx, ex, -160, 92 * f2, 15, 'h2', t, false);
  const f3 = csSm(CB.ign3, CB.ign3 + 0.4, u);
  if (f3 > 0.01) csFlame(ctx, 0, -268, 74 * f3, 17, 'h2', t, false);
  if (u > CB.sep1 - 0.05 && u < CB.sep1 + 0.7){                                     /* ullage and retro motors around the separation */
    const p = csBump(u, CB.sep1 - 0.05, CB.sep1 + 0.7, 0.12);
    for (const sx of [-1, 1]){ csFlame(ctx, sx * 20, -150, 34 * p, 6, 'kero', t, false); ctx.save(); ctx.translate(sx * 16, -150); ctx.rotate(Math.PI); csFlame(ctx, 0, 0, 34 * p, 6, 'kero', t, false); ctx.restore(); }
  }
  csStack(ctx, { hide: hide, off: off });
  if (u >= CB.les && !hide.les){                                                    /* the escape tower's own motor carries it away */
    const st = CS_STK.les, h = st[1] - st[0], o = off.les;
    ctx.save(); ctx.translate(o.x, -st[0] - h / 2 + o.y); ctx.rotate(o.r); ctx.translate(0, h / 2);
    csFlame(ctx, 0, -26, 96 * csBump(u, CB.les, CB.les + 2.2, 0.15), 11, 'kero', t, false); ctx.restore();
  }
  const mq = csBump(u, 6.0, 9.4, 0.9);                                              /* the vapour cone at maximum dynamic pressure */
  if (mq > 0.01){
    ctx.globalAlpha = 0.6 * mq; ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.moveTo(-6, -352); ctx.lineTo(-52, -270); ctx.lineTo(52, -270); ctx.lineTo(6, -352); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -270, 62, 14, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.3 * mq; ctx.beginPath(); ctx.ellipse(0, -232, 70, 18, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.restore();
  const altKm = 0.4 + 0.38 * u * u, vel = 40 + 16 * u * u;
  csText(ctx, 'ALTITUDE  ' + altKm.toFixed(0).padStart(4, ' ') + ' km', 1240, 44, 15, '#CFE0FF', 'right', '600');
  csText(ctx, 'VELOCITY  ' + Math.round(vel).toLocaleString('en-US').padStart(6, ' ') + ' m/s', 1240, 68, 15, '#CFE0FF', 'right', '600');
}

/* ======================= SCENE 3: translunar injection and docking (36-52s) ======================= */
function csAxis(ctx, X, Y, ang, k, fn){ ctx.save(); ctx.translate(X, Y); ctx.rotate(Math.PI / 2 + ang); ctx.scale(k, k); fn(ctx); ctx.restore(); }
function csPuff(ctx, x, y, age, dx, dy, r){
  if (age < 0 || age > 0.9) return;
  ctx.globalAlpha = 0.85 * (1 - age / 0.9); ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.ellipse(x + dx * age * 26, y + dy * age * 26, r * (0.5 + age), r * (0.3 + age * 0.5), Math.atan2(dy, dx), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
}
function csSLAPanel(ctx, side){
  ctx.fillStyle = CS_WHITE; ctx.beginPath();
  ctx.moveTo(side * 15, 0); ctx.lineTo(side * 9, -60); ctx.lineTo(side * 3.6, -60); ctx.lineTo(side * 9.4, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8A8C92'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(side * 12, 0); ctx.lineTo(side * 6.3, -60); ctx.lineTo(side * 3.6, -60); ctx.lineTo(side * 9.4, 0); ctx.closePath(); ctx.fill();
}
function csSceneTLI(ctx, u, t){
  csNow = t;
  ctx.fillStyle = '#01020A'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 1, t, -u * 12, 0);
  csEarth(ctx, 300, 1330, 900, u * 0.02, t);
  const k = 2.4, X0 = 390, Y0 = 290;
  const dr = u > 14.6 ? 70 * (u - 14.6) * (u - 14.6) : 0;                            /* the spent stage drifting away */
  const Xs = X0 - dr * k;
  const burn = csSm(0.4, 0.9, u) * (1 - csSm(3.2, 3.6, u));
  ctx.save(); ctx.translate(Xs, Y0); ctx.rotate(Math.PI / 2); ctx.scale(k, k); if (burn > 0.01) csFlame(ctx, 0, 16, 120 * burn, 18, 'h2', t, false); ctx.restore();
  csAxis(ctx, Xs, Y0, 0, k, csPartSIVB);
  csAxis(ctx, Xs + 70 * k, Y0, 0, k, csPartIU);
  /* the lander, folded inside the adapter, revealed when the panels open */
  if (u > 3.4) csAxis(ctx, X0 + 82 * k, Y0, 0, k * 0.46, () => csLander(ctx, { legs: 0, noLadder: true, t: t }));
  if (u < 3.8) csAxis(ctx, Xs + 78 * k, Y0, 0, k, csPartSLA);
  else {
    const phi = 1.08 * csSm(3.8, 5.6, u), tau = Math.max(0, u - 5.7);
    for (const side of [-1, 1]){
      ctx.save(); ctx.translate(Xs + 78 * k, Y0); ctx.rotate(Math.PI / 2); ctx.scale(k, k);
      ctx.globalAlpha = 1 - csSm(3.5, 5, tau);
      ctx.translate(side * (13.8 + 22 * tau), -8 * tau); ctx.translate(side * -13.8, 0); ctx.rotate(side * (phi + 0.5 * tau)); ctx.translate(side * 13.8, 0);
      csSLAPanel(ctx, side); ctx.globalAlpha = 1; ctx.restore();
    }
  }
  /* the command and service module: separates, turns end-for-end, and docks with the lander */
  const Ap = 171 + 61 * csSm(6.4, 8.4, u) - 65 * csSm(11.2, 13.8, u) - 8 * csSm(13.9, 14.6, u);
  const ang = Math.PI * csSm(8.4, 11.2, u), probe = u < 13.9 ? 8 : 2;
  const px = X0 + Ap * k;
  ctx.save(); ctx.translate(px, Y0); ctx.rotate(Math.PI / 2 + ang); ctx.translate(0, 33 * k); ctx.scale(k, k); csDrawCSM(ctx, probe); ctx.restore();
  for (const [a0, a1] of [[8.5, 8.8], [10.6, 10.9], [6.5, 6.75]]) for (const sy of [-1, 1]){ const age = (u - a0) / (a1 - a0 + 0.6); csPuff(ctx, px + Math.cos(ang) * 8, Y0 + sy * 26, age, sy * 0.2, sy, 7); csPuff(ctx, px - Math.cos(ang) * 18, Y0 - sy * 26, age, -sy * 0.2, -sy, 7); }
  if (u > 13.7 && u < 14.5){ const f = csBump(u, 13.7, 14.5, 0.1); csGlow(ctx, X0 + 128 * k, Y0, 46 * f, '#FFFFFF', 0.7 * f); }
  if (u > 10.4 && u < 15.4){                                                                   /* docking telemetry */
    const range = Math.max(0, (Ap - 159) * 0.19);
    ctx.strokeStyle = 'rgba(90,240,150,.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(X0 + 128 * k, Y0, 30, 0, TAU); ctx.moveTo(X0 + 128 * k - 40, Y0); ctx.lineTo(X0 + 128 * k + 40, Y0); ctx.moveTo(X0 + 128 * k, Y0 - 40); ctx.lineTo(X0 + 128 * k, Y0 + 40); ctx.stroke();
    csText(ctx, 'RANGE  ' + range.toFixed(1).padStart(5, ' ') + ' m', 900, 610, 15, '#7CF0A8', 'left', '600');
    csText(ctx, 'CLOSING ' + (u < 13.8 ? '0.10' : '0.00') + ' m/s', 900, 632, 15, '#7CF0A8', 'left', '600');
    if (u > 13.8) csText(ctx, u < 14.6 ? 'SOFT DOCK' : 'HARD DOCK  ·  CAPTURE LATCHES SET', 900, 654, 15, '#FFFFFF', 'left', '700');
  }
}

/* ======================= the Moon's surface, drawn in perspective ======================= */
const CS_CRATERS = [], CS_ROCKS = [];
for (let i = 0; i < 120; i++) CS_CRATERS.push({ gx: (csR(i + 700) - 0.5) * 900, gz: 9 + Math.pow(csR(i + 800), 1.6) * 900, R: 0.6 + Math.pow(csR(i + 900), 2.2) * 26 });
for (let i = 0; i < 110; i++) CS_ROCKS.push({ gx: (csR(i + 1200) - 0.5) * 260, gz: 6 + Math.pow(csR(i + 1300), 1.5) * 220, R: 0.06 + csR(i + 1400) * 0.42 });
CS_CRATERS.sort((a, b) => b.gz - a.gz); CS_ROCKS.sort((a, b) => b.gz - a.gz);
const CS_F = 560, CS_HZ = 430;
function csSurfaceSky(ctx, t){
  ctx.fillStyle = '#000003'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 0.9, t, 0, 0);
  csEarth(ctx, 1010, 150, 58, t * 0.02, t);
}
/* Hc: the camera's height above the ground in metres, camx: its sideways position */
function csMoonGround(ctx, Hc, camx){
  const g = ctx.createLinearGradient(0, CS_HZ, 0, CS_H); g.addColorStop(0, '#5C5A56'); g.addColorStop(0.3, '#8C8A84'); g.addColorStop(1, '#B6B4AD');
  ctx.fillStyle = g; ctx.fillRect(-2600, CS_HZ, CS_W + 5200, 2600);
  ctx.fillStyle = '#4A4844'; ctx.beginPath(); ctx.moveTo(-2600, CS_HZ);
  for (let x = -2600; x <= 3900; x += 40) ctx.lineTo(x, CS_HZ - 5 - 18 * Math.abs(Math.sin(x * 0.011 + 1 + camx * 0.05)) - 8 * Math.sin(x * 0.031));
  ctx.lineTo(3900, CS_HZ); ctx.closePath(); ctx.fill();
  for (let i = 0; i < CS_CRATERS.length; i++){
    const c = CS_CRATERS[i], y = CS_HZ + Hc * CS_F / c.gz, sx = 640 + (c.gx - camx) * CS_F / c.gz, sr = c.R * CS_F / c.gz;
    if (y > CS_H + sr * 2 || y < CS_HZ + 1 || sx < -sr - 60 || sx > CS_W + sr + 60) continue;
    const ry = sr * csC(Hc / c.gz * 1.5, 0.06, 1);
    ctx.fillStyle = 'rgba(48,46,44,.38)'; ctx.beginPath(); ctx.ellipse(sx, y, sr, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(232,230,222,.3)'; ctx.lineWidth = Math.max(1, sr * 0.07); ctx.beginPath(); ctx.ellipse(sx, y, sr, ry, 0, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < CS_ROCKS.length; i++){
    const c = CS_ROCKS[i], y = CS_HZ + Hc * CS_F / c.gz, sx = 640 + (c.gx - camx) * CS_F / c.gz, sr = c.R * CS_F / c.gz;
    if (y > CS_H + sr * 2 || y < CS_HZ + 1 || sx < -sr - 40 || sx > CS_W + sr + 40) continue;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(sx + sr * 0.5, y + sr * 0.35, sr * 1.1, sr * 0.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6E6C68'; ctx.beginPath(); ctx.ellipse(sx, y - sr * 0.3, sr, sr * 0.7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#A8A6A0'; ctx.beginPath(); ctx.ellipse(sx - sr * 0.25, y - sr * 0.5, sr * 0.5, sr * 0.3, 0, 0, TAU); ctx.fill();
  }
}
/* the dust thrown up by the descent engine, flying flat and far in the low gravity */
function csLandingDust(ctx, age, x0, yG){
  if (age <= 0) return;
  const amp = csSm(0, 1.2, age);
  for (let k = 0; k < 64; k++){
    const dir = k % 2 ? 1 : -1, sp = 90 + csR(k + 400) * 520, vup = 8 + csR(k + 450) * 60, a = age - csR(k + 500) * 0.8;
    if (a <= 0) continue;
    const x = x0 + dir * (24 + a * sp * (1 - 0.17 * a)), y = yG - 3 - Math.max(0, vup * a - 11 * a * a) - (k % 5) * 1.2;
    ctx.globalAlpha = 0.78 * (1 - csSm(1.6, 5.2, a)) * amp; ctx.fillStyle = '#F2F0EA';
    ctx.beginPath(); ctx.ellipse(x, y, 7 + a * 4, 3 + a * 1.5, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ======================= SCENE 4: coasting to the Moon (52-58s) ======================= */
function csDrawDocked(ctx, t){
  csDrawCSM(ctx, 2);
  ctx.save(); ctx.translate(0, -112.6); ctx.rotate(Math.PI); ctx.scale(0.46, 0.46); csLander(ctx, { legs: 0, noLadder: true, t: t }); ctx.restore();
}
function csSceneCoast(ctx, u, t){
  csNow = t;
  const p = csSm(0, 6, u);
  ctx.fillStyle = '#01020A'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 1, t, -u * 3, 0);
  csEarth(ctx, csLerp(250, 150, p), csLerp(500, 560, p), csLerp(420, 250, p), t * 0.03, t);
  csMoon(ctx, csLerp(1040, 1000, p), csLerp(200, 230, p), csLerp(38, 132, p), true);
  ctx.save(); ctx.translate(390, 360); ctx.rotate(Math.PI / 2 + Math.sin(t * 0.9) * 0.04); ctx.scale(2.6, 2.6); csDrawDocked(ctx, t); ctx.restore();
  const day = 1 + Math.floor(csC(u / 2, 0, 2.99));
  csText(ctx, 'DAY ' + day, 640, 80, 30, '#E8F0FF', 'center', '700');
  csText(ctx, 'DISTANCE TO MOON  ' + Math.round(384400 * (1 - 0.83 * p)).toLocaleString('en-US') + ' km', 640, 108, 15, '#9FB4E0', 'center', '600');
  csCabin(ctx, 1004, 500, 232, 146, t, { label: 'COMMAND MODULE  ·  PILOT', neck: 0.8, head: -0.02, look: 1.5, s: 1.3, glow: 'rgba(200,210,235,.06)' });
}

/* ======================= SCENE 5: lunar orbit and separation (58-64s) ======================= */
function csSceneOrbit(ctx, u, t){
  csNow = t;
  ctx.fillStyle = '#01020A'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 1, t, -u * 5, 0);
  csEarth(ctx, 210, 700 - 150 * csSm(0, 6, u), 50, t * 0.02, t);                        /* the Earth rises over the limb */
  csMoon(ctx, 640, 1560, 1000, true);
  ctx.save(); ctx.translate(230, 290); ctx.rotate(Math.PI / 2); ctx.scale(2.6, 2.6); csDrawCSM(ctx, u < 1.6 ? 2 : 8); ctx.restore();
  const XL = 642 + 230 * csSm(1.6, 4.0, u), YL = 290 + 90 * csSm(3.2, 6, u), th = -Math.PI / 2 * (1 - csSm(3.0, 5.4, u));
  ctx.save(); ctx.translate(XL, YL); ctx.rotate(th); ctx.scale(1.2, 1.2); csLander(ctx, { legs: 0, noLadder: true, t: t }); ctx.restore();
  for (const [a0, dx, dy, px, py] of [[1.6, -1, -0.3, XL - 60, YL - 10], [3.0, 0, -1, XL - 40, YL - 90], [5.2, 1, 0.6, XL + 30, YL - 60]])
    for (let j = 0; j < 3; j++) csPuff(ctx, px, py + j * 14 - 14, (u - a0) / 0.9, dx, dy + j * 0.3 - 0.3, 6);
  if (u > 0.4) csCabin(ctx, 1004, 500, 232, 146, t, { label: 'LANDER CABIN  ·  PILOT', neck: 0.75, head: 0.1, look: 1.2, s: 1.3, glow: 'rgba(255,170,60,.05)' });
}

/* ======================= SCENE 6: powered descent (64-76s) ======================= */
function csSceneDescent(ctx, u, t){
  csNow = t;
  const pr = csC(u / 11, 0, 1), ease = csSm(0, 11, u);
  const alt = 300 * (1 - pr) * (1 - pr);
  csSurfaceSky(ctx, t);
  csMoonGround(ctx, 3 + alt, 0);
  const XL = 560 + 120 * (1 - ease), sL = 1.0 + 0.8 * ease, yFeet = 250 + 350 * Math.pow(ease, 1.25);
  const touch = u >= 11.0, bump = csBump(u, 11.0, 11.55, 0.12) * 6;
  const legs = csSm(0.6, 1.6, u), thr = u < 11.35 ? 0.7 + 0.25 * Math.sin(u * 3.1) + 0.2 * (1 - pr) : 0.7 * (1 - csSm(11.35, 11.7, u));
  csLandingDust(ctx, (64 + u) - 73, XL, 600);
  ctx.save(); ctx.translate(XL, yFeet + bump); ctx.scale(sL, sL);
  csLander(ctx, { legs: legs, flame: u < 11.75 ? thr : 0, probe: u >= 10.75 ? 1 : 0, noLadder: false, t: t });
  ctx.restore();
  csText(ctx, 'ALT  ' + String(Math.max(0, Math.round(alt))).padStart(4, ' ') + ' m', 900, 60, 16, '#7CF0A8', 'left', '600');
  csText(ctx, 'VSPD ' + String(-Math.round(2 * 300 / 11 * (1 - pr) * (u < 11 ? 1 : 0))).padStart(4, ' ') + ' m/s', 900, 84, 16, '#7CF0A8', 'left', '600');
  const fuel = Math.max(2, Math.round(24 - 21 * pr));
  csText(ctx, 'FUEL ' + String(fuel).padStart(3, ' ') + ' %', 900, 108, 16, fuel < 6 && Math.sin(t * 10) > 0 ? '#FF6A5A' : '#7CF0A8', 'left', '600');
  if (fuel < 6) csText(ctx, 'LOW LEVEL', 900, 132, 14, '#FF6A5A', 'left', '700');
}

/* ======================= SCENE 7: the surface, the explosion, the stranding (76-106s) ======================= */
const CS_LX = 560, CS_LY = 600, CS_LS = 1.8;
const CS_DEBRIS = [];
for (let i = 0; i < 24; i++){
  const a = csR(i + 1500) * TAU, sp = 140 + csR(i + 1600) * 430; let vy = Math.sin(a) * sp; if (vy > 40) vy = -vy * 0.6;
  const y0 = CS_LY - 36 - csR(i + 1700) * 70, g = 150, disc = vy * vy + 2 * g * (CS_LY - 8 - y0);
  CS_DEBRIS.push({ type: i % 6, x0: CS_LX + (csR(i + 1800) - 0.5) * 70, y0: y0, vx: Math.cos(a) * sp, vy: vy, w: (csR(i + 1900) - 0.5) * 11, r0: csR(i + 2000) * TAU, s: 0.7 + csR(i + 2100) * 0.8,
    tL: (-vy + Math.sqrt(disc)) / g });
}
function csDebrisPiece(ctx, d){
  const s = d.s;
  switch (d.type){
    case 0: ctx.strokeStyle = '#A6A8B0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-15 * s, 0); ctx.lineTo(15 * s, 0); ctx.stroke(); break;
    case 1: ctx.fillStyle = '#C4C7CE'; ctx.beginPath(); ctx.ellipse(0, 0, 10 * s, 3.4 * s, 0, 0, TAU); ctx.fill(); break;
    case 2: ctx.fillStyle = '#D9A93A'; ctx.globalAlpha = 0.9; ctx.fillRect(-13 * s, -6 * s, 26 * s, 12 * s); ctx.fillStyle = '#F4D780'; ctx.fillRect(-13 * s, -6 * s, 26 * s, 3 * s); ctx.globalAlpha = 1; break;
    case 3: ctx.fillStyle = '#B8B8B4'; ctx.beginPath(); ctx.moveTo(-10 * s, -7 * s); ctx.lineTo(12 * s, -4 * s); ctx.lineTo(8 * s, 8 * s); ctx.lineTo(-11 * s, 5 * s); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#6A6C74'; ctx.lineWidth = 1; ctx.stroke(); break;
    case 4: ctx.fillStyle = '#C79A32'; ctx.beginPath(); ctx.arc(0, 0, 9 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7A5A18'; ctx.lineWidth = 1.4; ctx.stroke(); break;
    default: ctx.fillStyle = '#2E2E34'; ctx.beginPath(); ctx.moveTo(-5 * s, -8 * s); ctx.lineTo(-9 * s, 8 * s); ctx.lineTo(9 * s, 8 * s); ctx.lineTo(5 * s, -8 * s); ctx.closePath(); ctx.fill();
  }
}
function csSceneSurface(ctx, u, t){
  csNow = t;
  const tau = u - 17.6, boom = u >= 17.6;
  csSurfaceSky(ctx, t);
  const panPx = 240 * csSm(3, 14, u), zoom = 1 - 0.42 * csSm(19.6, 25, u);
  const shk = boom && tau < 0.9 ? csShake(t, 14 * (1 - csSm(0, 0.9, tau))) : [0, 0];
  ctx.save();
  ctx.translate(640 + shk[0], 560 + shk[1]); ctx.scale(zoom, zoom); ctx.translate(-640, -560);
  csMoonGround(ctx, 3, panPx * 9.9 / CS_F);
  ctx.translate(-panPx, 0);
  csLandingDust(ctx, (76 + u) - 73, CS_LX, CS_LY);
  /* hoofprints, one pair for every stride so far */
  const prog = csC((u - 10.2) / 4.8, 0, 1), xg = 820 + 190 * csSm(0, 1, prog);
  ctx.fillStyle = 'rgba(70,68,64,.7)';
  for (let k = 0; k < 8; k++){ const xp = 830 + 26 * k; if (u > 10.3 && xg > xp){ ctx.beginPath(); ctx.ellipse(xp, 601 + (k % 2) * 2, 4.6, 1.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(xp + 14, 604 - (k % 2) * 2, 4.6, 1.5, 0, 0, TAU); ctx.fill(); } }
  /* the lander: intact, then venting and alarming, then a wreck */
  ctx.save(); ctx.translate(CS_LX, CS_LY); ctx.scale(CS_LS, CS_LS);
  if (!boom){
    const blink = u > 15.2 && Math.sin(t * 11) > 0;
    csLander(ctx, { legs: 1, hatch: csSm(1.6, 3.0, u), wide: 1, deck: csSm(2.6, 3.4, u), beacon: blink, warnGlow: blink, t: t });
    if (u > 15.2){
      for (const [jx, jy, dx, dy] of [[-38, -34, -1, -0.5], [38, -30, 1, -0.4], [-24, -50, -0.7, -1], [26, -48, 0.6, -1]]){
        const f = csSm(15.2, 15.9, u), L = (18 + 16 * Math.abs(Math.sin(t * 14 + jx))) * f;
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(jx + dx * L, jy + dy * L); ctx.stroke(); ctx.lineCap = 'butt';
        ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let q = 1; q <= 3; q++){ ctx.beginPath(); ctx.arc(jx + dx * L * (1 + q * 0.5), jy + dy * L * (1 + q * 0.5) - q * 2, 2 + q, 0, TAU); ctx.fill(); }
      }
    }
  } else {
    csLander(ctx, { legs: 1, ascentGone: true, char: csSm(0, 1.2, tau), noLadder: true, hatch: 0, t: t });
    csGlow(ctx, 0, -26, 48, '#FF7A2A', 0.55 * (1 - csSm(1.5, 9, tau)));
  }
  ctx.restore();
  /* the giraffe */
  const gc = { s: 0.92, face: 1, neck: 0.35, head: 0.15, walk: 0, moving: false, tuck: 0, crouch: 0, lift: 0, dust: u > 9.4 ? 1 : 0, blink: (Math.sin(t * 1.3) > 0.96 || Math.sin(t * 0.61 + 2) > 0.97) ? 1 : 0, look: 0 };
  const porchY = CS_LY - 52 * CS_LS, hatchX = CS_LX + 34 * CS_LS;
  let visible = true, clipped = false;
  if (u < 3.2) visible = false;
  else if (u < 6.4){
    const st = csSm(5.0, 6.4, u);                                                    /* she crawls out low through the doorway, then stands up on the deck */
    gc.x = 528 + 162 * csSm(3.2, 6.4, u); gc.y = porchY; gc.moving = true; gc.walk = u * 3.2; clipped = true;
    gc.crouch = 34 * (1 - st); gc.neck = csLerp(1.3, 0.35, st); gc.head = csLerp(0.35, 0.15, st);
  }
  else if (u < 6.6){ gc.x = 690; gc.y = porchY; }
  else if (u < 9.4){
    const p = (u - 6.6) / 2.8, arc = Math.sin(Math.PI * p);
    gc.x = 690 + 130 * p; gc.y = csLerp(porchY, CS_LY, p) - 56 * 4 * p * (1 - p);
    gc.tuck = 0.9 * arc; gc.neck = 0.35 - 0.25 * arc; gc.head = 0.15 - 0.22 * arc; gc.walk = p * 3;
  } else {
    gc.x = 820; gc.y = CS_LY; gc.crouch = 9 * csBump(u, 9.4, 10.2, 0.2);
    if (u > 10.2 && u < 15.1){ gc.moving = true; gc.walk = (u - 10.2) * 4.6; gc.x = xg; gc.y = CS_LY - Math.abs(Math.sin(gc.walk)) * 5; }
    else if (u >= 15.1) gc.x = 1010;
    const up = csSm(14.6, 16.2, u);
    gc.neck = csLerp(0.35, 0.03, up); gc.head = csLerp(0.15, -0.34, up); gc.look = 1.2 * up;
    gc.face = Math.cos(Math.PI * csSm(16.3, 16.9, u));
    if (boom){
      const kx = csC(tau / 0.9, 0, 1);
      gc.x = 1010 - 40 * csSm(0, 0.5, tau); gc.y = CS_LY - 40 * 4 * kx * (1 - kx) * (tau < 0.9 ? 1 : 0); gc.tuck = tau < 0.9 ? 0.7 : 0; gc.crouch = 7 * csBump(tau, 0.9, 1.6, 0.2);
      gc.face = -1; const rec = csSm(1.4, 4.5, tau); gc.neck = csLerp(0.03, 0.62, rec); gc.head = csLerp(-0.34, 0.5, rec); gc.look = -1.4 * rec;
    }
  }
  if (visible){
    if (clipped){ ctx.save(); ctx.beginPath(); ctx.rect(hatchX, -400, 2600, 1800); ctx.clip(); csGiraffe(ctx, gc); ctx.restore(); }
    else csGiraffe(ctx, gc);
  }
  /* landing dust where she comes down */
  if (u > 9.4) for (let k = 0; k < 14; k++){
    const age = u - 9.4, dir = k % 2 ? 1 : -1, x = 820 + dir * (age * (20 + csR(k + 3000) * 70)), y = CS_LY - Math.min(38, age * 26 * csR(k + 3100)) - 2;
    ctx.globalAlpha = 0.5 * (1 - csSm(0.5, 2.4, age)); ctx.fillStyle = '#C4C1BA'; ctx.beginPath(); ctx.ellipse(x, y, 9 + age * 9, 4 + age * 3, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  /* the explosion: a flash, a short fireball, then everything flung out on long arcs in the low gravity */
  if (boom){
    const cx = CS_LX, cy = CS_LY - 52 * CS_LS;
    if (tau < 1.7){
      const fa = 1 - tau / 1.7;
      csFireball(ctx, cx, cy, 34 + 190 * Math.sqrt(tau), fa);
      for (let k = 0; k < 34; k++){ const a = csR(k + 4000) * TAU, sp = 260 + csR(k + 4100) * 520; ctx.strokeStyle = 'rgba(255,220,140,' + Math.max(0, 0.9 * fa) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * sp * tau * 0.5, cy + Math.sin(a) * sp * tau * 0.5); ctx.lineTo(cx + Math.cos(a) * sp * tau, cy + Math.sin(a) * sp * tau); ctx.stroke(); }
    }
    for (let i = 0; i < CS_DEBRIS.length; i++){
      const d = CS_DEBRIS[i], tt = Math.min(tau, d.tL), x = d.x0 + d.vx * tt, y = d.y0 + d.vy * tt + 75 * tt * tt;
      ctx.save(); ctx.translate(x, Math.min(y, CS_LY - 4)); ctx.rotate(d.r0 + d.w * tt); csDebrisPiece(ctx, d); ctx.restore();
      const la = tau - d.tL;
      if (la > 0 && la < 1.6){ ctx.globalAlpha = 0.5 * (1 - la / 1.6); ctx.fillStyle = '#C8C5BE'; ctx.beginPath(); ctx.ellipse(x, CS_LY - 2, 10 + la * 26, 3 + la * 5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    }
    for (let k = 0; k < 40; k++){                                                     /* dust thrown off the ground */
      const x0 = CS_LX + (csR(k + 5000) - 0.5) * 150, vx = (x0 - CS_LX) * 4 + (csR(k + 5100) - 0.5) * 260, vy = -(60 + csR(k + 5200) * 240);
      const tL = (-vy + Math.sqrt(vy * vy)) / 150, tt = Math.min(tau, tL * 2), y = CS_LY - 2 + vy * tt + 75 * tt * tt;
      ctx.globalAlpha = 0.6 * (1 - csSm(1, 5, tau)); ctx.fillStyle = '#BEBBB4'; ctx.beginPath(); ctx.arc(x0 + vx * tt, Math.min(y, CS_LY - 2), 3 + csR(k + 5300) * 3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (boom && tau < 0.45){ ctx.fillStyle = 'rgba(255,255,250,' + (0.95 * (1 - csSm(0, 0.45, tau))) + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  /* the ending card */
  const sa = csSm(24, 25.4, u);
  if (sa > 0.01){
    ctx.globalAlpha = sa; ctx.fillStyle = 'rgba(0,0,6,.35)'; ctx.fillRect(0, 240, CS_W, 150); ctx.globalAlpha = 1;
    const word = 'STRANDED', gap = 14; ctx.font = '800 82px ' + CS_MONO;
    let wtot = 0; for (const ch of word) wtot += ctx.measureText(ch).width + gap; wtot -= gap;
    let x = 640 - wtot / 2; ctx.textAlign = 'left';
    for (const ch of word){ ctx.fillStyle = 'rgba(0,0,0,' + 0.55 * sa + ')'; ctx.fillText(ch, x + 3, 335 + 3); ctx.fillStyle = 'rgba(244,244,240,' + sa + ')'; ctx.fillText(ch, x, 335); x += ctx.measureText(ch).width + gap; }
    csText(ctx, 'The lander was the only way home.', 640, 372, 21, 'rgba(200,214,240,' + csSm(25.4, 26.8, u) + ')', 'center', '600');
  }
}

/* ======================= the director ======================= */
/* [time, headline, subline, seconds shown] */
const CS_CAPS = [
  [1.0, 'JOHNSON SPACE CENTER', 'Launch complex. All stations report ready.', 3.4],
  [4.3, 'SWING ARMS RETRACTED', '', 2.0],
  [6.2, 'SOUND SUPPRESSION WATER ON', '', 1.9],
  [8.2, 'IGNITION SEQUENCE START', '', 1.0],
  [9.3, 'LIFTOFF', 'We have a liftoff.', 2.6],
  [12.6, 'TOWER CLEAR', '', 1.8],
  [21.0, 'MAX Q', 'Maximum dynamic pressure', 2.6],
  [25.4, 'FIRST STAGE ENGINE CUTOFF', '', 0.9],
  [26.0, 'STAGE SEPARATION', 'S-IC stage away', 1.3],
  [27.3, 'SECOND STAGE IGNITION', '', 1.6],
  [29.0, 'INTERSTAGE JETTISON', '', 0.8],
  [29.8, 'LAUNCH ESCAPE TOWER JETTISON', '', 2.1],
  [32.4, 'SECOND STAGE CUTOFF', '', 0.7],
  [33.1, 'SECOND STAGE SEPARATION', '', 1.0],
  [34.2, 'THIRD STAGE IGNITION', '', 1.2],
  [35.4, 'EARTH ORBIT ACHIEVED', '', 0.9],
  [36.4, 'TRANSLUNAR INJECTION', 'Third stage burn to leave Earth orbit', 3.4],
  [40.2, 'ADAPTER PANELS JETTISONED', 'The lander is exposed', 2.4],
  [43.0, 'TRANSPOSITION', 'Command module turns to meet the lander', 3.2],
  [46.4, 'DOCKING', '', 1.9],
  [48.4, 'LANDER EXTRACTED', 'Pulling it clear of the spent stage', 3.0],
  [52.3, 'TRANSLUNAR COAST', 'Three days to the Moon', 5.0],
  [58.3, 'LUNAR ORBIT', '', 2.6],
  [61.2, 'LANDER SEPARATION', 'The giraffe goes down alone', 2.6],
  [64.4, 'POWERED DESCENT', '', 1.9],
  [65.4, 'LANDING GEAR DEPLOYED', '', 1.6],
  [74.5, 'CONTACT LIGHT', '', 0.9],
  [75.5, 'ENGINE STOP', '', 1.4],
  [77.0, 'TOUCHDOWN', 'Tranquil, and utterly silent', 3.0],
  [91.0, 'MASTER ALARM', 'Descent stage propellant leak', 2.5]
];
/* mission elapsed time in seconds, at points in the film */
const CS_MET = [[9, 0], [21, 74], [25.4, 161], [29.6, 197], [33.1, 552], [35.5, 700], [36, 9420], [40, 9540], [49.6, 12000], [52, 15000], [58, 190000], [64, 254000], [74.6, 369000], [76, 369900], [100, 372000]];
function csMET(t){
  if (t <= CS_MET[0][0]) return 0;
  for (let i = 1; i < CS_MET.length; i++) if (t <= CS_MET[i][0]){ const a = CS_MET[i - 1], b = CS_MET[i]; return csLerp(a[1], b[1], (t - a[0]) / (b[0] - a[0])); }
  return CS_MET[CS_MET.length - 1][1];
}
function csFade(t){
  let f = 1 - csSm(0, 1.2, t);
  f = Math.max(f, csSm(CS_T.END - 1.6, CS_T.END, t));
  for (const b of [CS_T.B, CS_T.C, CS_T.D, CS_T.E, CS_T.F]) f = Math.max(f, 1 - csSm(0, 0.45, Math.abs(t - b)));
  return f;
}
function csOverlays(ctx, t){
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  if (t >= 9 && t < 100){
    const m = Math.floor(csMET(t)), hh = Math.floor(m / 3600), mm = Math.floor(m % 3600 / 60), ss = m % 60, p = n => ('0' + n).slice(-2);
    csText(ctx, 'MISSION ELAPSED', 40, 44, 11, '#8FA2C8', 'left', '600');
    csText(ctx, 'T+' + p(hh) + ':' + p(mm) + ':' + p(ss), 40, 68, 22, '#E8F0FF', 'left', '700');
  }
  let cap = null;
  for (let i = 0; i < CS_CAPS.length; i++) if (t >= CS_CAPS[i][0] && t < CS_CAPS[i][0] + CS_CAPS[i][3]) cap = CS_CAPS[i];
  if (cap){
    const a = csSm(0, 0.25, t - cap[0]) * (1 - csSm(cap[3] - 0.35, cap[3], t - cap[0]));
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, cap[2] ? 640 : 460, cap[2] ? 84 : 58);
    ctx.fillStyle = '#7FD0FF'; ctx.fillRect(0, 618, 5, cap[2] ? 84 : 58);
    csText(ctx, cap[1], 26, 652, 25, '#F4F8FF', 'left', '800');
    if (cap[2]) csText(ctx, cap[2], 26, 682, 15, '#A8BCE0', 'left', '600');
    ctx.globalAlpha = 1;
  }
  const f = csFade(t);
  if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
