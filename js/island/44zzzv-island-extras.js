'use strict';
/* =============================================================================================================================
   44zzzv-island-extras.js  --  WHAT CHAPTER 17, THE ISLAND LAB, ADDS AROUND THE GAME: its coat color Kraken Violet (WARD 56, for finishing the chapter) and its
   pattern Reef scales (pattern 18, js/ui/44e-wardrobe.js), its minigame Tide Pool Dash (the popup after the chapter, three stars in MINI_STAR, a hat or boots
   from the wheel, and the coat color Tide Pool, WARD 57, for three stars), a photo backdrop (The Island, scene 26, added at the end of PHOTO_SCENES so every
   older photo code keeps its meaning), three achievements and the Guide's page for the chapter. Like the Fort, the island is played on its own, so the
   minigame's way on is "See the results" (miniEndsRun).
   ============================================================================================================================= */
WARD.push({ name: 'Kraken Violet', c: '#6A4A8A' }, { name: 'Tide Pool', c: '#5ACCE0' });          /* 56 and 57 */
MINI_STAR[ISLE_CHAPTER] = { t: [14, 18], lab: ['10', '14', '18'] };
MINI_STAR_CHAPTERS.push(ISLE_CHAPTER);
const isleBaseEndsRun = miniEndsRun;
miniEndsRun = function(ch){ return ch === ISLE_CHAPTER || isleBaseEndsRun.apply(this, arguments); };

/* ---------- Tide Pool Dash: three channels of the tide run across the beach with eels in them. Fetch the shells from the far sand and from the bars between. ---------- */
const DASH_LANES = [0.34, 0.52, 0.7];
registerMini({
  ch: ISLE_CHAPTER, id: 'tidepool', name: 'Tide Pool Dash', unit: 'shells', dur: 45, goal: 10,
  blurb: 'The tide is going out, and the shells it leaves behind are on the far side of three channels.\nThe eels in the channels do not like being stepped on.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to walk toward the pointer.\nThe water slows you down. Cross between the eels.',
  touchHint: 'Drag your finger: she walks toward it.\nThe water slows her down. Cross between the eels.',
  goalText: 'Goal: gather 10 shells in 45 seconds',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.9, ph: 0, moving: false }; m.lives = 3; m.inv = 0;
    const R = miniRng(91); m.R = R; m.eels = [];
    DASH_LANES.forEach(function(ly, i){ for (let k = 0; k < 2; k++) m.eels.push({ lane: i, x: g.W * (k * 0.5 + R() * 0.3), d: i % 2 ? -1 : 1, ph: R() * 6 }); });
    m.shell = null; m.spawn = function(){ const top = m.R() < 0.6, y = top ? g.H * (0.2 + m.R() * 0.06) : g.H * (DASH_LANES[Math.floor(m.R() * 2)] + 0.09); m.shell = { x: g.W * (0.12 + m.R() * 0.76), y: y, ph: m.R() * 6 }; };
    m.spawn();
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt;
    const inLane = DASH_LANES.findIndex(function(ly){ return Math.abs(p.y - g.H * ly) < g.H * 0.045; }), spd = (inLane >= 0 ? 150 : 240) * s;
    p.x = clamp(p.x + st.x * spd * dt, 22 * s, g.W - 22 * s); p.y = clamp(p.y + st.y * spd * dt, g.H * 0.16, g.H * 0.96);
    p.moving = !!(st.x || st.y); if (p.moving) p.ph += dt * (inLane >= 0 ? 8 : 13);
    const es = (120 + m.score * 12) * s;
    m.eels.forEach(function(e){ e.x += e.d * es * dt * (1 + 0.25 * e.lane); e.ph += dt * 8; if (e.x > g.W + 60 * s) e.x = -60 * s; if (e.x < -60 * s) e.x = g.W + 60 * s;
      if (m.inv <= 0 && e.lane === inLane && (e.d > 0 ? p.x - e.x < 30 * s && e.x - p.x < 120 * s : e.x - p.x < 30 * s && p.x - e.x < 120 * s)) miniHurt(m, p.x, p.y - 30 * s, 'Bitten!'); });
    const sh = m.shell;
    if (sh && Math.hypot(p.x - sh.x, p.y - sh.y) < 30 * s){ m.score++; SFX.pickupS && SFX.pickupS(); miniPop(m, sh.x, sh.y - 24 * s, '+1 shell', '#F8E0C8'); m.spawn(); }
  }
});
function dashBeach(c, w, h, s, rng){
  c.fillStyle = '#E2CF9A'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++){ c.fillStyle = ['#EAD8A6', '#D6C28C', '#CCB680'][i % 3]; c.fillRect(rng() * w, rng() * h, 2, 2); }
  c.fillStyle = '#2E7A9A'; c.fillRect(0, 0, w, h * 0.15); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, h * 0.15 - 3 * s, w, 3 * s);
  DASH_LANES.forEach(function(ly){ const y = h * ly; c.fillStyle = 'rgba(150,126,80,.5)'; c.fillRect(0, y - h * 0.06, w, h * 0.12); c.fillStyle = 'rgba(70,184,192,.85)'; c.fillRect(0, y - h * 0.045, w, h * 0.09);
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2 * s; c.setLineDash([16 * s, 10 * s]); c.beginPath(); c.moveTo(0, y - h * 0.045); c.lineTo(w, y - h * 0.045); c.moveTo(0, y + h * 0.045); c.lineTo(w, y + h * 0.045); c.stroke(); c.setLineDash([]); });
}
MINI[ISLE_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'tidepool', dashBeach, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  const sh = m.shell;
  if (sh){ miniGlow(ctx, sh.x, sh.y, 44 * s, '255,240,220', 0.45 + 0.15 * Math.sin(t * 5));
    ctx.save(); ctx.translate(sh.x, sh.y); ctx.scale(1.6, 1.6); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(2 * s, 4 * s, 11 * s, 8 * s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#F4D8C8'; ctx.beginPath(); ctx.moveTo(0, 8 * s); ctx.arc(0, 0, 11 * s, Math.PI * 0.85, Math.PI * 2.15); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(160,110,90,.7)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); for (let k = -3; k <= 3; k++){ ctx.moveTo(0, 8 * s); ctx.lineTo(Math.sin(k * 0.4) * 11 * s, -Math.cos(k * 0.4) * 10 * s); } ctx.stroke(); ctx.restore(); }
  m.eels.forEach(function(e){                                                                         /* an eel: a wavy body behind its head, swimming along its channel */
    const y = H * DASH_LANES[e.lane], d = e.d;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#102A22'; ctx.lineWidth = 22 * s; ctx.beginPath(); for (let k = 0; k <= 9; k++) ctx.lineTo(e.x - d * k * 12 * s, y + Math.sin(e.ph - k * 0.8) * 7 * s * (k / 9)); ctx.stroke();
    ctx.strokeStyle = '#3A6A5A'; ctx.lineWidth = 17 * s; ctx.stroke(); ctx.strokeStyle = '#9AE0C0'; ctx.lineWidth = 2.4 * s; ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = '#102A22'; ctx.beginPath(); ctx.ellipse(e.x + d * 8 * s, y, 18 * s, 13 * s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#3A6A5A'; ctx.beginPath(); ctx.ellipse(e.x + d * 8 * s, y, 16 * s, 11 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3A1418'; ctx.fillRect(e.x + d * 18 * s - 3 * s, y - 2 * s, 6 * s, 4 * s);
    ctx.fillStyle = '#7AF0B8'; ctx.beginPath(); ctx.arc(e.x + d * 13 * s, y - 6 * s, 3.2 * s, 0, TAU); ctx.arc(e.x + d * 13 * s, y + 6 * s, 3.2 * s, 0, TAU); ctx.fill();
  });
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, -Math.PI / 2, 0.78 * s, p.ph, { moving: p.moving, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
};

/* ---------- the photo backdrop: the island from the beach, the lab on the hill ---------- */
(function(){
  PHOTO_SCENES.push(
    /* 26. Chapter 17: the Island Lab */
    function(c, W, H, R, T){
      T.sky(['#5A8AB8', '#A8D4E4', '#F2E6C8']);
      T.glow(W * 0.78, H * 0.22, 220, '255,246,220', 0.5);
      c.fillStyle = '#2E7A9A'; c.fillRect(0, T.gy - 90, W, 90); c.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 30; i++) c.fillRect(R() * W, T.gy - 88 + R() * 80, 14 + R() * 20, 1.6);
      c.fillStyle = '#2E5A3A'; c.beginPath(); c.moveTo(W * 0.32, T.gy - 80); c.quadraticCurveTo(W * 0.48, T.gy - 220, W * 0.62, T.gy - 230); c.quadraticCurveTo(W * 0.82, T.gy - 220, W * 0.98, T.gy - 80); c.closePath(); c.fill();
      c.fillStyle = '#C8D0D4'; c.fillRect(W * 0.52, T.gy - 252, W * 0.18, 30); c.fillStyle = 'rgba(160,230,230,.85)'; for (let i = 0; i < 4; i++){ c.beginPath(); c.arc(W * 0.545 + i * W * 0.045, T.gy - 252, 20, Math.PI, TAU); c.fill(); }
      c.fillStyle = '#9AA2A4'; c.fillRect(W * 0.74, T.gy - 236, 50, 24); c.fillRect(W * 0.74 + 40, T.gy - 290, 3, 56); T.glow(W * 0.74 + 41, T.gy - 292, 14, '255,90,74', 0.9);
      for (let i = 0; i < 6; i++){ const px = W * (0.36 + i * 0.1), py = T.gy - 90 - Math.max(0, 70 - Math.abs(i - 2.5) * 20); c.strokeStyle = '#4A3A24'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, T.gy - 80); c.quadraticCurveTo(px + 8, py + 20, px + 4, py); c.stroke();
        c.fillStyle = '#2A6A2E'; for (let q = 0; q < 6; q++){ const a = -Math.PI / 2 + (q - 2.5) * 0.55; c.beginPath(); c.moveTo(px + 4, py); c.quadraticCurveTo(px + 4 + Math.cos(a) * 26, py + Math.sin(a) * 18, px + 4 + Math.cos(a) * 46, py + Math.sin(a) * 16 + 14); c.quadraticCurveTo(px + 4 + Math.cos(a) * 22, py + Math.sin(a) * 10 + 8, px + 4, py); c.fill(); } }
      T.ground('#E8D8A8'); T.flecks('200,176,120', 0.4, 90, T.gy + 4, H);
      c.fillStyle = 'rgba(70,184,192,.75)'; c.beginPath(); c.moveTo(0, T.gy + 30); for (let x = 0; x <= W; x += 40) c.lineTo(x, T.gy + 30 + Math.sin(x * 0.02) * 6); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 40) c.lineTo(x, T.gy + 30 + Math.sin(x * 0.02) * 6); c.stroke();
      for (let i = 0; i < 5; i++){ const x = R() * W, y = T.gy + 8 + R() * 16; c.fillStyle = '#E8823A'; c.beginPath(); for (let k = 0; k < 10; k++){ const a = k * TAU / 10, rr = k % 2 ? 2.4 : 6; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.6); } c.closePath(); c.fill(); }
    }
  );
  PHOTO_BG.push('The Island'); PHOTO_SUN.push([0.78, 0.22]);
})();
