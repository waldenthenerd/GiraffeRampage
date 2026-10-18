'use strict';
/* Scenery definitions: ocean-jungle (see js/36a-scenery-core.js for the format). Chapter 4 = open ocean, chapter 5 = Amazon canopy. */

/* small shared helpers (prefixed) */
function oc_ell(ctx, x, y, rx, ry, rot, col){ ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); }
const OC_DASH = [10, 9], OC_SOLID = [];

/* ============================ CHAPTER 4: OPEN OCEAN ============================ */
sceneryRegister([4], {
  patches: [
    { fill: '#1C5A70', alpha: 0.2, count: 14, rMin: 220, rMax: 460, squash: 0.65 },     /* paler sand shelf */
    { fill: '#06263A', alpha: 0.26, count: 11, rMin: 240, rMax: 480, squash: 0.7 },     /* deeper hollows */
    { fill: '#2A6E6C', alpha: 0.13, count: 8, rMin: 200, rMax: 380, squash: 0.6 },      /* green-teal algae bloom */
    { fill: '#5AA0B4', alpha: 0.08, count: 7, rMin: 320, rMax: 600, squash: 0.32 }      /* long soft light shafts */
  ],
  decals: [
    { id: 'oc_ripple', count: 80, s: [0.8, 1.5], draw: function(ctx){
        ctx.strokeStyle = 'rgba(70,140,160,0.4)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-22, -8); ctx.quadraticCurveTo(-10, -13, 2, -8); ctx.quadraticCurveTo(14, -3, 24, -8);
        ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-12, -5, 0, 0); ctx.quadraticCurveTo(12, 5, 28, 0);
        ctx.moveTo(-20, 8); ctx.quadraticCurveTo(-8, 3, 4, 8); ctx.quadraticCurveTo(14, 12, 22, 8);
        ctx.stroke();
      } },
    { id: 'oc_trail', count: 26, s: [0.9, 1.6], draw: function(ctx){
        ctx.strokeStyle = 'rgba(4,24,36,0.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-60, -5); ctx.quadraticCurveTo(0, -14, 60, -4);
        ctx.moveTo(-60, 5); ctx.quadraticCurveTo(0, -4, 60, 6);
        ctx.stroke();
      } },
    { id: 'oc_fishbone', count: 20, s: [0.8, 1.3], draw: function(ctx){
        ctx.strokeStyle = 'rgba(150,180,184,0.4)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(14, 0);
        for (let k = -2; k <= 2; k++){ ctx.moveTo(k * 5, 0); ctx.lineTo(k * 5 - 2, -6); ctx.moveTo(k * 5, 0); ctx.lineTo(k * 5 - 2, 6); }
        ctx.moveTo(-16, 0); ctx.lineTo(-24, -5); ctx.moveTo(-16, 0); ctx.lineTo(-24, 5);
        ctx.stroke();
        oc_ell(ctx, 17, 0, 5, 3.4, 0, 'rgba(150,180,184,0.4)');
      } },
    { id: 'oc_pits', count: 44, s: [0.8, 1.4], draw: function(ctx){
        oc_ell(ctx, 0, 0, 9, 4.5, 0, 'rgba(4,22,32,0.42)');
        oc_ell(ctx, 14, 3, 5, 2.6, 0.3, 'rgba(4,22,32,0.36)');
        oc_ell(ctx, -11, 5, 4, 2, -0.2, 'rgba(4,22,32,0.3)');
      } },
    { id: 'oc_pebbles', count: 60, s: [0.8, 1.3], draw: function(ctx){
        oc_ell(ctx, 0, 0, 3.4, 2.2, 0.3, 'rgba(110,160,172,0.5)');
        oc_ell(ctx, 9, 4, 2.4, 1.6, -0.4, 'rgba(110,160,172,0.42)');
        oc_ell(ctx, -7, 6, 2, 1.4, 0.2, 'rgba(110,160,172,0.4)');
        oc_ell(ctx, 4, -6, 1.8, 1.2, 0, 'rgba(110,160,172,0.35)');
      } }
  ],
  props: [
    { id: 'oc_kelp', count: 38, r: 22, gap: 60, s: [0.9, 1.5], draw: function(ctx, p, t){
        scShadow(ctx, 14, 6, 0.2);
        const n = 3 + ((p.seed * 3) | 0);
        ctx.lineCap = 'round';
        for (let k = 0; k < n; k++){
          const bx = (k - (n - 1) / 2) * 6, h = 26 + scRnd(p.seed, k) * 18, sw = Math.sin(t * 0.9 + p.seed * 12 + k) * 5;
          ctx.strokeStyle = '#1B5A48'; ctx.lineWidth = 3.4;
          ctx.beginPath(); ctx.moveTo(bx, 6); ctx.quadraticCurveTo(bx + sw * 0.5, -h * 0.5, bx + sw, -h); ctx.stroke();
          oc_ell(ctx, bx + sw, -h, 2.6, 5.5, sw * 0.05, '#2A7658');
        }
        oc_ell(ctx, 0, 7, 8, 3.4, 0, '#0E3A2E');
      } },
    { id: 'oc_brain', count: 22, r: 20, gap: 50, s: [0.9, 1.5], draw: function(ctx, p){
        scShadow(ctx, 18, 8, 0.24);
        const c = p.seed < 0.5 ? ['#54567A', '#6A6C90', '#42445F'] : ['#4C6A78', '#607F8C', '#3A5460'];
        oc_ell(ctx, 0, 0, 17, 12, 0, c[0]);
        oc_ell(ctx, -3, -3, 11, 7, 0, c[1]);
        ctx.strokeStyle = c[2]; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-6, -8, 0, -3); ctx.quadraticCurveTo(6, 2, 12, -4);
        ctx.moveTo(-12, 4); ctx.quadraticCurveTo(-5, -1, 2, 4); ctx.quadraticCurveTo(8, 8, 13, 3);
        ctx.stroke();
      } },
    { id: 'oc_fan', count: 20, r: 20, gap: 50, s: [0.9, 1.4], draw: function(ctx, p, t){
        scShadow(ctx, 14, 6, 0.2);
        const sw = Math.sin(t * 0.8 + p.seed * 9) * 0.06, col = p.seed < 0.5 ? '#80556A' : '#6A5C80';
        ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = -4; k <= 4; k++){ const a = -Math.PI / 2 + k * 0.2 + sw; ctx.moveTo(0, 4); ctx.lineTo(Math.cos(a) * 26, 4 + Math.sin(a) * 26); }
        ctx.stroke();
        ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(0, 4, 17, -Math.PI / 2 - 0.85 + sw, -Math.PI / 2 + 0.85 + sw); ctx.stroke();
        ctx.lineWidth = 2.4; ctx.strokeStyle = '#3E3A4A'; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 3); ctx.stroke();
      } },
    { id: 'oc_tubes', count: 20, r: 18, gap: 50, s: [0.9, 1.4], draw: function(ctx, p, t){
        scShadow(ctx, 14, 6, 0.2);
        ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++){
          const bx = (k - 2) * 5, h = 10 + scRnd(p.seed, k) * 14;
          ctx.strokeStyle = '#3B6C7A'; ctx.lineWidth = 5.2;
          ctx.beginPath(); ctx.moveTo(bx, 5); ctx.lineTo(bx, 5 - h); ctx.stroke();
          oc_ell(ctx, bx, 5 - h, 2.8, 1.8, 0, '#16384A');
        }
      } },
    { id: 'oc_shells', count: 26, r: 18, gap: 40, s: [0.8, 1.3], draw: function(ctx, p){
        scShadow(ctx, 14, 5, 0.16);
        for (let k = 0; k < 4; k++){
          const x = (scRnd(p.seed, k) - 0.5) * 26, y = (scRnd(p.seed, k + 7) - 0.5) * 12, r = 4 + scRnd(p.seed, k + 3) * 2.4;
          oc_ell(ctx, x, y, r, r * 0.8, scRnd(p.seed, k + 5) * 3, '#5E8892');
          oc_ell(ctx, x, y - 1, r * 0.55, r * 0.4, 0, '#7AA2AA');
        }
      } },
    { id: 'oc_wreck', count: 8, r: 24, gap: 90, s: [0.9, 1.3], rot: true, draw: function(ctx, p){
        scShadow(ctx, 24, 10, 0.24);
        if (p.seed < 0.45){                                                            /* a rusting anchor */
          ctx.lineCap = 'round'; ctx.strokeStyle = '#3E4C50'; ctx.lineWidth = 4.4;
          ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 14); ctx.moveTo(-10, -9); ctx.lineTo(10, -9);
          ctx.moveTo(-14, 6); ctx.quadraticCurveTo(-12, 16, 0, 15); ctx.quadraticCurveTo(12, 16, 14, 6); ctx.stroke();
          ctx.strokeStyle = '#2C3A3C'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, -19, 4, 0, TAU); ctx.stroke();
          oc_ell(ctx, 0, 2, 5, 3, 0, '#2E5A4A');
        } else if (p.seed < 0.75){                                                     /* broken hull planks */
          ctx.lineCap = 'butt'; ctx.strokeStyle = '#3A3E36'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(24, -10); ctx.moveTo(-22, 2); ctx.lineTo(28, 1); ctx.moveTo(-24, 11); ctx.lineTo(14, 12); ctx.stroke();
          ctx.strokeStyle = '#22262A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-6, 20); ctx.moveTo(12, -18); ctx.lineTo(14, 20); ctx.stroke();
          oc_ell(ctx, 6, -3, 9, 3, 0, '#2E5A4A');
        } else {                                                                       /* a toppled barrel */
          oc_ell(ctx, 0, 0, 17, 10, 0, '#3E4036');
          oc_ell(ctx, -2, -2, 12, 6, 0, '#505244');
          ctx.strokeStyle = '#2A2C28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(-6, 9); ctx.moveTo(8, -9); ctx.lineTo(8, 9); ctx.stroke();
        }
      } },
    { id: 'oc_ribs', count: 6, r: 38, gap: 120, s: [0.9, 1.4], rot: true, draw: function(ctx, p){
        scShadow(ctx, 36, 12, 0.18);
        ctx.lineCap = 'round'; ctx.strokeStyle = '#8CA2A2'; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0);
        for (let k = 0; k < 5; k++){ const x = -26 + k * 13, h = 16 - Math.abs(k - 2) * 2.6; ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 4, -h * 1.1, x + 9, -h * 0.4); }
        ctx.stroke();
        ctx.strokeStyle = '#B0C2C0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-32, -1); ctx.lineTo(30, -1); ctx.stroke();
      } },
    { id: 'oc_vent', count: 6, r: 22, gap: 120, s: [0.9, 1.3], draw: function(ctx, p, t){
        oc_ell(ctx, 0, 6, 17, 7, 0, 'rgba(4,20,30,0.45)');
        oc_ell(ctx, 0, 3, 12, 7, 0, '#22404C');
        oc_ell(ctx, 0, -2, 8, 5, 0, '#2E5260');
        oc_ell(ctx, 0, -3, 4.4, 2.8, 0, '#07151D');
        ctx.strokeStyle = 'rgba(200,235,240,0.35)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let k = 0; k < 3; k++){ const ph = ((t * 0.5 + k / 3 + p.seed) % 1); const yy = -4 - ph * 34, rr = 1.6 + ph * 2.6; ctx.moveTo(Math.sin(ph * 6 + k) * 3 + rr, yy); ctx.arc(Math.sin(ph * 6 + k) * 3, yy, rr, 0, TAU); }
        ctx.stroke();
      } }
  ],
  landmarks: [
    { id: 'oc_hull', count: 2, r: 170, gap: 800, s: [1, 1.15], rot: true, draw: function(ctx, p){
        scShadow(ctx, 170, 60, 0.28);
        /* hull seen from above: pointed bow on the right, broken stern on the left */
        ctx.fillStyle = '#26363A';
        ctx.beginPath(); ctx.moveTo(-150, -34); ctx.lineTo(60, -50); ctx.quadraticCurveTo(140, -40, 170, 0); ctx.quadraticCurveTo(140, 40, 60, 50); ctx.lineTo(-150, 36); ctx.lineTo(-140, 10); ctx.lineTo(-152, -6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3A4C4C';
        ctx.beginPath(); ctx.moveTo(-136, -26); ctx.lineTo(58, -39); ctx.quadraticCurveTo(122, -31, 148, 0); ctx.quadraticCurveTo(122, 31, 58, 39); ctx.lineTo(-136, 27); ctx.closePath(); ctx.fill();
        /* deck planks and ribs */
        ctx.strokeStyle = 'rgba(20,30,32,0.55)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = -2; k <= 2; k++){ ctx.moveTo(-132, k * 11); ctx.lineTo(120 - Math.abs(k) * 20, k * 11); }
        ctx.stroke();
        ctx.strokeStyle = '#1C282A'; ctx.lineWidth = 4;
        ctx.beginPath(); for (let k = 0; k < 6; k++){ const x = -120 + k * 30; ctx.moveTo(x, -36); ctx.lineTo(x + 3, 38); }
        ctx.stroke();
        /* a hole in the deck, a stump of mast, algae */
        oc_ell(ctx, -40, 6, 26, 13, 0, '#07151D');
        oc_ell(ctx, 60, -2, 7, 7, 0, '#1C282A');
        oc_ell(ctx, 60, -3, 4.4, 4.4, 0, '#4A5A58');
        oc_ell(ctx, 20, -20, 38, 10, 0.1, 'rgba(46,100,76,0.5)');
        oc_ell(ctx, -90, 14, 26, 9, -0.1, 'rgba(46,100,76,0.45)');
        ctx.strokeStyle = '#3E4C50'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-148, -2); ctx.lineTo(-176, -16); ctx.moveTo(-140, 14); ctx.lineTo(-168, 28); ctx.stroke();
      } },
    { id: 'oc_reef', count: 2, r: 150, gap: 800, s: [0.9, 1.2], draw: function(ctx, p, t){
        scShadow(ctx, 150, 56, 0.26);
        const cols = ['#4A5878', '#5E4E70', '#3E6672', '#5C6A84', '#6A5468'], n = 13;
        for (let k = 0; k < n; k++){
          const a = k * 2.399 + p.seed * 6, d = Math.sqrt((k + 0.6) / n) * 118, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.62, r = 20 + scRnd(p.seed, k) * 18;
          oc_ell(ctx, x, y, r * 1.05, r * 0.72, 0, cols[k % 5]);
          oc_ell(ctx, x - r * 0.18, y - r * 0.2, r * 0.62, r * 0.4, 0, 'rgba(180,190,215,0.13)');
        }
        for (let k = 0; k < 3; k++){                                                     /* a few sea-fans standing up from the reef */
          const x = (scRnd(p.seed, k + 20) - 0.5) * 150, y = (scRnd(p.seed, k + 30) - 0.5) * 60, sw = Math.sin(t * 0.8 + k) * 2;
          ctx.strokeStyle = '#8A5A6C'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
          ctx.beginPath(); for (let j = -3; j <= 3; j++){ ctx.moveTo(x, y); ctx.lineTo(x + j * 4 + sw, y - 28); } ctx.stroke();
        }
        oc_ell(ctx, -20, -8, 3, 2, 0, '#C08A70'); oc_ell(ctx, 38, 14, 2.6, 1.8, 0, '#C08A70');
      } }
  ],
  terrain: [
    { id: 'oc_cur_e', kind: 'push', dir: 0.25, force: 60, count: 2, rMin: 110, rMax: 160, squash: 0.72, hint: 'A current pushes you along', draw: oc_currentDraw },
    { id: 'oc_cur_s', kind: 'push', dir: 1.95, force: 68, count: 2, rMin: 110, rMax: 160, squash: 0.72, hint: 'A current pushes you along', draw: oc_currentDraw },
    { id: 'oc_cur_w', kind: 'push', dir: 3.5, force: 56, count: 1, rMin: 110, rMax: 150, squash: 0.72, hint: 'A current pushes you along', draw: oc_currentDraw }
  ],
  ambient: [
    { id: 'oc_fish', count: 40, layer: 'under',
      init: function(a){ const g = (a.seed * 8) | 0; a.g = g; a.x = 300 + scRnd(g, 1) * (ARENA_W - 600) + (scRnd(a.seed, 3) - 0.5) * 240; a.y = 300 + scRnd(g, 2) * (ARENA_H - 600) + (scRnd(a.seed, 4) - 0.5) * 160; a.hd = scRnd(g, 5) * TAU; const sp = 34 + scRnd(g, 6) * 20; a.vx = Math.cos(a.hd) * sp; a.vy = Math.sin(a.hd) * sp; },
      update: function(a, dt, t){ const w = Math.sin(t * 1.4 + a.ph) * 7; a.x += (a.vx - Math.sin(a.hd) * w) * dt; a.y += (a.vy + Math.cos(a.hd) * w) * dt; },
      draw: function(ctx, a, t){
        ctx.rotate(a.hd);
        const tw = Math.sin(t * 9 + a.ph) * 2;
        oc_ell(ctx, 0, 0, 6.5, 2.7, 0, 'rgba(130,175,188,0.5)');
        ctx.fillStyle = 'rgba(130,175,188,0.45)'; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-11, -3 + tw); ctx.lineTo(-11, 3 + tw); ctx.closePath(); ctx.fill();
      } },
    { id: 'oc_jelly', count: 9, layer: 'under',
      init: function(a){ a.vx = (a.seed - 0.5) * 14; a.vy = -4 - scRnd(a.seed, 2) * 6; },
      update: function(a, dt, t){ a.x += a.vx * dt + Math.sin(t * 0.5 + a.ph) * 6 * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        const pu = 1 + 0.13 * Math.sin(t * 2 + a.ph), s = 0.8 + a.seed * 0.5;
        ctx.scale(s, s);
        ctx.strokeStyle = 'rgba(160,150,205,0.28)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let k = -1; k <= 1; k++){ const sw = Math.sin(t * 1.6 + a.ph + k) * 3; ctx.moveTo(k * 5, 2); ctx.quadraticCurveTo(k * 5 + sw, 12, k * 5 - sw, 22); }
        ctx.stroke();
        ctx.fillStyle = 'rgba(150,140,200,0.34)'; ctx.beginPath(); ctx.ellipse(0, 0, 12 * pu, 9 / pu, 0, Math.PI, 0); ctx.fill();
        oc_ell(ctx, 0, 0, 12 * pu, 2.6, 0, 'rgba(190,180,225,0.3)');
      } },
    { id: 'oc_manta', count: 2, layer: 'over',
      init: function(a){ a.vx = (a.seed < 0.5 ? -1 : 1) * (18 + a.seed * 10); a.vy = (scRnd(a.seed, 2) - 0.5) * 6; },
      update: function(a, dt){ a.x += a.vx * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        const f = Math.sin(t * 1.3 + a.ph) * 7, d = a.vx < 0 ? -1 : 1;
        ctx.scale(d * 1.5, 1.5);
        ctx.fillStyle = 'rgba(2,12,20,0.13)';
        ctx.beginPath(); ctx.moveTo(26, 0); ctx.quadraticCurveTo(6, -14 - f, -14, -34 - f); ctx.quadraticCurveTo(-8, -6, -18, 0); ctx.quadraticCurveTo(-8, 6, -14, 34 + f); ctx.quadraticCurveTo(6, 14 + f, 26, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(2,12,20,0.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-52, 4 + f * 0.2); ctx.stroke();
      } }
  ]
});

/* an ocean current: soft pool, dashed rim, a few still chevrons, and streaks flowing along the push direction */
function oc_currentDraw(ctx, z, t){
  oc_ell(ctx, 0, 0, z.rx, z.ry, 0, 'rgba(70,160,180,0.07)');
  ctx.strokeStyle = 'rgba(140,205,220,0.2)'; ctx.lineWidth = 2;
  ctx.setLineDash(OC_DASH); ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(OC_SOLID);
  ctx.rotate(z.def.dir - z.rot);
  const R = z.ry * 0.92;
  ctx.strokeStyle = '#B4E4EE'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++){
    const v = (k - 3) * R / 3.5, hx = Math.sqrt(Math.max(0, R * R - v * v)), ph = (t * 0.2 + k * 0.29 + z.seed) % 1, u = -hx + ph * 2 * hx;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.62;
    ctx.beginPath(); ctx.moveTo(Math.max(-hx, u - 30), v); ctx.lineTo(u, v); ctx.lineTo(u - 6, v - 4); ctx.moveTo(u, v); ctx.lineTo(u - 6, v + 4); ctx.stroke();
  }
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  for (let k = -1; k <= 1; k++){ const x = k * R * 0.5; ctx.moveTo(x - 8, -12); ctx.lineTo(x + 4, 0); ctx.lineTo(x - 8, 12); }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ============================ CHAPTER 5: AMAZON CANOPY ============================ */
function jg_tangleDraw(ctx, z){
  oc_ell(ctx, 0, 0, z.rx, z.ry, 0, 'rgba(14,22,8,0.5)');
  ctx.strokeStyle = 'rgba(86,118,50,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.97, z.ry * 0.97, 0, 0, TAU); ctx.stroke();
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let k = 0; k < 11; k++){
    const a1 = scRnd(z.seed, k) * TAU, a2 = a1 + 1.6 + scRnd(z.seed, k + 20) * 2.2;
    ctx.moveTo(Math.cos(a1) * z.rx * 0.9, Math.sin(a1) * z.ry * 0.9);
    ctx.quadraticCurveTo((scRnd(z.seed, k + 40) - 0.5) * z.rx * 0.7, (scRnd(z.seed, k + 60) - 0.5) * z.ry * 0.7, Math.cos(a2) * z.rx * 0.85, Math.sin(a2) * z.ry * 0.85);
  }
  ctx.strokeStyle = '#2E4818'; ctx.lineWidth = 4.4; ctx.stroke();
  ctx.strokeStyle = '#6A8C3A'; ctx.lineWidth = 1.4; ctx.stroke();
  for (let k = 0; k < 7; k++){
    const a = scRnd(z.seed, k + 80) * TAU, d = 0.25 + scRnd(z.seed, k + 90) * 0.6;
    oc_ell(ctx, Math.cos(a) * z.rx * d, Math.sin(a) * z.ry * d, 6, 3, a, '#4E7A2E');
  }
}
function jg_mudDraw(ctx, z, t){
  oc_ell(ctx, 0, 0, z.rx, z.ry, 0, 'rgba(34,26,14,0.8)');
  ctx.strokeStyle = 'rgba(96,78,42,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke();
  oc_ell(ctx, -z.rx * 0.2, -z.ry * 0.2, z.rx * 0.5, z.ry * 0.28, -0.3, 'rgba(120,104,66,0.28)');
  ctx.strokeStyle = 'rgba(140,120,76,0.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let k = 0; k < 3; k++){ const ph = (t * 0.3 + k / 3 + z.seed) % 1, r = 3 + ph * 4; const x = (scRnd(z.seed, k) - 0.5) * z.rx, y = (scRnd(z.seed, k + 5) - 0.5) * z.ry; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.stroke();
}

sceneryRegister([5], {
  patches: [
    { fill: '#5C7C32', alpha: 0.15, count: 14, rMin: 200, rMax: 420, squash: 0.62 },     /* dappled sunlight */
    { fill: '#101A0A', alpha: 0.26, count: 12, rMin: 240, rMax: 460, squash: 0.7 },     /* deep shade */
    { fill: '#4A3A20', alpha: 0.2, count: 8, rMin: 180, rMax: 340, squash: 0.65 },      /* bare brown earth */
    { fill: '#2E5028', alpha: 0.2, count: 8, rMin: 200, rMax: 380, squash: 0.6 }        /* moss */
  ],
  decals: [
    { id: 'jg_puddle', count: 26, s: [0.7, 1.5], draw: function(ctx){
        oc_ell(ctx, 0, 0, 18, 9, 0, 'rgba(14,14,8,0.55)');
        ctx.strokeStyle = 'rgba(70,60,30,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 18, 9, 0, 0, TAU); ctx.stroke();
        oc_ell(ctx, -4, -2, 8, 3, 0, 'rgba(100,130,110,0.3)');
      } },
    { id: 'jg_paw', count: 30, s: [0.8, 1.2], draw: function(ctx){
        oc_ell(ctx, 0, 3, 5, 4, 0, 'rgba(10,16,6,0.5)');
        oc_ell(ctx, -6, -4, 2.2, 2.8, -0.4, 'rgba(10,16,6,0.5)');
        oc_ell(ctx, -2, -8, 2.2, 2.8, -0.1, 'rgba(10,16,6,0.5)');
        oc_ell(ctx, 3, -8, 2.2, 2.8, 0.1, 'rgba(10,16,6,0.5)');
        oc_ell(ctx, 7, -4, 2.2, 2.8, 0.4, 'rgba(10,16,6,0.5)');
      } },
    { id: 'jg_litter', count: 80, s: [0.8, 1.4], draw: function(ctx){
        oc_ell(ctx, 0, 0, 7, 3, 0.3, 'rgba(100,84,42,0.7)');
        oc_ell(ctx, 9, 4, 6, 2.6, -0.5, 'rgba(76,100,44,0.7)');
        oc_ell(ctx, -8, 5, 6, 2.6, 0.9, 'rgba(120,96,44,0.65)');
        oc_ell(ctx, 3, -6, 5, 2.2, -0.2, 'rgba(70,92,40,0.7)');
      } },
    { id: 'jg_twigs', count: 50, s: [0.8, 1.5], draw: function(ctx){
        ctx.strokeStyle = 'rgba(78,60,36,0.8)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(12, -3); ctx.moveTo(-2, 0); ctx.lineTo(4, -9); ctx.moveTo(4, -2); ctx.lineTo(14, 5); ctx.stroke();
      } },
    { id: 'jg_dapple', count: 50, s: [0.8, 1.6], draw: function(ctx){
        oc_ell(ctx, 0, 0, 16, 8, 0.2, 'rgba(130,160,70,0.1)');
        oc_ell(ctx, 18, 6, 9, 5, -0.3, 'rgba(130,160,70,0.08)');
      } }
  ],
  props: [
    { id: 'jg_log', count: 26, r: 32, gap: 50, s: [0.8, 1.3], rot: true, draw: function(ctx, p){
        scShadow(ctx, 38, 12, 0.26);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#43341F'; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(28, 0); ctx.stroke();
        ctx.strokeStyle = '#5A4A2E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(26, -2); ctx.stroke();
        ctx.strokeStyle = '#4C7030'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-16 - scRnd(p.seed, 1) * 8, -4); ctx.lineTo(10 + scRnd(p.seed, 2) * 10, -4); ctx.stroke();
        oc_ell(ctx, 28, 0, 6, 8.4, 0, '#7A6642');
        oc_ell(ctx, 28, 0, 3, 4.4, 0, '#4A3A24');
        if (p.seed > 0.5){ oc_ell(ctx, -6, -8, 5, 3, 0, '#A0906A'); oc_ell(ctx, 2, -9, 4, 2.4, 0, '#B0A27A'); }
      } },
    { id: 'jg_fern', count: 44, r: 26, gap: 30, s: [1.2, 1.9], draw: function(ctx, p, t){
        scShadow(ctx, 20, 8, 0.2);
        const sw = scSway(t, p, 0.07);
        ctx.lineCap = 'round'; ctx.beginPath();
        for (let k = 0; k < 7; k++){
          const a = k * TAU / 7 + p.seed * 3 + sw, ex = Math.cos(a) * 24, ey = Math.sin(a) * 17;
          ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a + 0.35) * 14, Math.sin(a + 0.35) * 10, ex, ey);
        }
        ctx.strokeStyle = '#3F6228'; ctx.lineWidth = 6; ctx.stroke();
        ctx.strokeStyle = '#6E9040'; ctx.lineWidth = 1.3; ctx.stroke();
      } },
    { id: 'jg_leaf', count: 36, r: 30, gap: 30, s: [1.2, 1.9], rot: true, draw: function(ctx, p){
        scShadow(ctx, 24, 9, 0.2);
        ctx.fillStyle = '#3C6628';
        ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-8, -20, 26, -2); ctx.quadraticCurveTo(0, 18, -26, 0); ctx.fill();
        ctx.fillStyle = '#4A7A34';
        ctx.beginPath(); ctx.moveTo(-24, -1); ctx.quadraticCurveTo(-8, -17, 22, -3); ctx.quadraticCurveTo(0, -2, -24, -1); ctx.fill();
        ctx.strokeStyle = 'rgba(150,180,100,0.55)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(24, -2);
        for (let k = 0; k < 3; k++){ const x = -12 + k * 12; ctx.moveTo(x, -1); ctx.lineTo(x + 7, -9); ctx.moveTo(x, -1); ctx.lineTo(x + 7, 7); }
        ctx.stroke();
      } },
    { id: 'jg_brom', count: 24, r: 24, gap: 40, s: [1.2, 1.8], draw: function(ctx, p){
        scShadow(ctx, 17, 7, 0.22);
        ctx.fillStyle = '#3E6A38'; ctx.beginPath();
        for (let k = 0; k < 9; k++){ const a = k * TAU / 9 + p.seed; ctx.moveTo(Math.cos(a + 0.2) * 3, Math.sin(a + 0.2) * 2); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 13); ctx.lineTo(Math.cos(a - 0.2) * 3, Math.sin(a - 0.2) * 2); }
        ctx.fill();
        ctx.fillStyle = '#58844A'; ctx.beginPath();
        for (let k = 0; k < 6; k++){ const a = k * TAU / 6 + p.seed + 0.3; ctx.moveTo(Math.cos(a + 0.28) * 2, Math.sin(a + 0.28) * 1.5); ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 7); ctx.lineTo(Math.cos(a - 0.28) * 2, Math.sin(a - 0.28) * 1.5); }
        ctx.fill();
        oc_ell(ctx, 0, 0, 3.2, 2.2, 0, '#9A5240');
      } },
    { id: 'jg_mush', count: 22, r: 16, gap: 30, s: [0.9, 1.4], draw: function(ctx, p){
        scShadow(ctx, 14, 5, 0.2);
        for (let k = 0; k < 3; k++){
          const x = (k - 1) * 9, y = (k % 2) * 4 - 2, r = 5 + scRnd(p.seed, k) * 3;
          ctx.strokeStyle = '#B8AA88'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y); ctx.stroke();
          oc_ell(ctx, x, y - 2, r, r * 0.62, 0, p.seed < 0.5 ? '#7E5C40' : '#A89870');
          oc_ell(ctx, x - r * 0.3, y - 3.4, r * 0.4, r * 0.22, 0, 'rgba(230,220,190,0.5)');
        }
      } },
    { id: 'jg_orchid', count: 16, r: 14, gap: 40, s: [0.9, 1.3], draw: function(ctx, p, t){
        scShadow(ctx, 10, 4, 0.18);
        ctx.strokeStyle = '#3E6430'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(-10, -2); ctx.moveTo(0, 3); ctx.lineTo(10, -3); ctx.moveTo(0, 3); ctx.lineTo(1, -10); ctx.stroke();
        ctx.strokeStyle = '#4C7A38'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, 3); ctx.lineTo(4, -14); ctx.stroke();
        const col = p.seed < 0.5 ? '#A8789A' : '#C0A0B0';
        oc_ell(ctx, 4, -14, 3.2, 2.6, 0, col); oc_ell(ctx, 1, -9, 2.6, 2.2, 0, col); oc_ell(ctx, 6, -9, 2.4, 2, 0, col);
        oc_ell(ctx, 4, -14, 1, 1, 0, '#D8C478');
      } },
    { id: 'jg_vines', count: 22, r: 22, gap: 30, s: [0.9, 1.5], rot: true, draw: function(ctx, p){
        ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(-22, 4); ctx.bezierCurveTo(-10, -14, 4, 14, 22, -4);
        ctx.moveTo(-18, -6); ctx.bezierCurveTo(-4, 10, 8, -12, 20, 8);
        ctx.moveTo(-8, 10); ctx.bezierCurveTo(-2, -2, 6, 2, 10, -10);
        ctx.strokeStyle = '#2E4818'; ctx.lineWidth = 3.4; ctx.stroke();
        ctx.strokeStyle = '#587A34'; ctx.lineWidth = 1.1; ctx.stroke();
        oc_ell(ctx, -6, -2, 4, 2, 0.6, '#4E7A2E'); oc_ell(ctx, 10, 3, 4, 2, -0.5, '#4E7A2E'); oc_ell(ctx, 18, -2, 3, 1.6, 0.2, '#5A8A36');
      } },
    { id: 'jg_stump', count: 12, r: 20, gap: 50, s: [0.9, 1.4], draw: function(ctx, p){
        scShadow(ctx, 20, 8, 0.26);
        ctx.strokeStyle = '#43341F'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
        for (let k = 0; k < 5; k++){ const a = k * TAU / 5 + p.seed * 2; ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 12); }
        ctx.stroke();
        oc_ell(ctx, 0, 2, 11, 8, 0, '#4A3A24');
        oc_ell(ctx, 0, -1, 10, 7, 0, '#7A6644');
        ctx.strokeStyle = '#5A4830'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, -1, 6, 4, 0, 0, TAU); ctx.ellipse(0, -1, 2.4, 1.6, 0, 0, TAU); ctx.stroke();
        oc_ell(ctx, -6, 0, 4, 3, 0, '#4E7030');
      } }
  ],
  landmarks: [
    { id: 'jg_buttress', count: 3, r: 220, gap: 900, s: [1.5, 1.9], draw: function(ctx, p){
        scShadow(ctx, 140, 62, 0.3);
        ctx.lineCap = 'round'; ctx.beginPath();
        for (let k = 0; k < 8; k++){ const a = k * TAU / 8 + p.seed * 0.5, L = 100 + scRnd(p.seed, k) * 36; ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a + 0.12) * L * 0.5, Math.sin(a + 0.12) * L * 0.36, Math.cos(a) * L, Math.sin(a) * L * 0.7); }
        ctx.strokeStyle = '#3A2E1C'; ctx.lineWidth = 20; ctx.stroke();
        ctx.strokeStyle = '#54442A'; ctx.lineWidth = 11; ctx.stroke();
        ctx.strokeStyle = '#6E5C3A'; ctx.lineWidth = 3; ctx.stroke();
        const cl = [[0, 0, 56], [-34, -10, 34], [36, -12, 32], [-26, 22, 32], [30, 20, 34], [2, -34, 28]];
        for (let k = 0; k < cl.length; k++){ oc_ell(ctx, cl[k][0], cl[k][1] * 0.8, cl[k][2], cl[k][2] * 0.8, 0, k % 2 ? '#274C20' : '#305A26'); }
        oc_ell(ctx, -14, -12, 30, 20, 0, 'rgba(150,200,100,0.16)');
        ctx.strokeStyle = 'rgba(56,90,32,0.8)'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 4; k++){ const x = -30 + k * 20; ctx.moveTo(x, 26); ctx.lineTo(x + 3, 42 + (k % 2) * 8); }
        ctx.stroke();
      } },
    { id: 'jg_giantlog', count: 2, r: 150, gap: 800, s: [1, 1.2], rot: true, draw: function(ctx, p){
        scShadow(ctx, 150, 36, 0.28);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#3E301C'; ctx.lineWidth = 56; ctx.beginPath(); ctx.moveTo(-124, 0); ctx.lineTo(124, 0); ctx.stroke();
        ctx.strokeStyle = '#564630'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(-122, -4); ctx.lineTo(122, -4); ctx.stroke();
        ctx.strokeStyle = '#4A7030'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(-90, -8); ctx.lineTo(-20, -9); ctx.moveTo(20, -8); ctx.lineTo(96, -7); ctx.stroke();
        oc_ell(ctx, 124, 0, 20, 28, 0, '#7A6642');
        ctx.strokeStyle = '#5A4830'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(124, 0, 13, 19, 0, 0, TAU); ctx.ellipse(124, 0, 6, 10, 0, 0, TAU); ctx.stroke();
        oc_ell(ctx, 124, 0, 4, 6, 0, '#241A0E');
        oc_ell(ctx, 10, -26, 10, 4, 0, '#A89870'); oc_ell(ctx, 30, -27, 8, 3.4, 0, '#B8AA84');
        oc_ell(ctx, -80, 18, 18, 7, 0.1, '#3C6628'); oc_ell(ctx, -56, 22, 12, 5, -0.2, '#4A7A34');
        ctx.strokeStyle = '#43341F'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-124, 10); ctx.lineTo(-146, 22); ctx.moveTo(-122, -10); ctx.lineTo(-142, -24); ctx.stroke();
      } }
  ],
  terrain: [
    { id: 'jg_tangle', kind: 'slow', mul: 0.72, count: 4, rMin: 100, rMax: 160, squash: 0.75, hint: 'Tangled vines slow you down', draw: jg_tangleDraw },
    { id: 'jg_mud', kind: 'slow', mul: 0.78, count: 2, rMin: 90, rMax: 130, squash: 0.7, hint: 'Sticky mud slows you down', draw: jg_mudDraw }
  ],
  ambient: [
    { id: 'jg_firefly', count: 16, layer: 'under',
      init: function(a){ a.vx = (a.seed - 0.5) * 12; a.vy = (scRnd(a.seed, 3) - 0.5) * 12; },
      update: function(a, dt, t){ a.x += (a.vx + Math.sin(t * 0.7 + a.ph) * 8) * dt; a.y += (a.vy + Math.cos(t * 0.6 + a.ph) * 8) * dt; },
      draw: function(ctx, a, t){
        const g = Math.sin(t * 1.8 + a.ph); if (g < 0.1) return;
        ctx.globalAlpha = g * 0.4; oc_ell(ctx, 0, 0, 6, 6, 0, '#C8DC80');
        ctx.globalAlpha = 0.35 + g * 0.3; oc_ell(ctx, 0, 0, 1.5, 1.5, 0, '#E4EEB0');
        ctx.globalAlpha = 1;
      } },
    { id: 'jg_butterfly', count: 8, layer: 'over',
      init: function(a){ a.hd = a.seed * TAU; a.vx = 0; a.vy = 0; },
      update: function(a, dt, t){ a.hd += Math.sin(t * 1.3 + a.ph) * 1.6 * dt; a.x += Math.cos(a.hd) * 22 * dt; a.y += Math.sin(a.hd) * 22 * dt; },
      draw: function(ctx, a, t){
        oc_ell(ctx, 3, 14, 4, 1.8, 0, 'rgba(8,12,4,0.18)');
        const w = 0.3 + 0.7 * Math.abs(Math.sin(t * 9 + a.ph)), col = a.seed < 0.5 ? '#4E74A4' : '#A8703C';
        oc_ell(ctx, -3 * w, -4, 3.4 * w, 2.6, -0.4, col);
        oc_ell(ctx, 3 * w, -4, 3.4 * w, 2.6, 0.4, col);
        oc_ell(ctx, 0, -4, 0.9, 2.6, 0, '#1C1A10');
      } },
    { id: 'jg_macaw', count: 2, layer: 'over',
      init: function(a){ a.vx = (a.seed < 0.5 ? -1 : 1) * (60 + a.seed * 20); a.vy = (scRnd(a.seed, 2) - 0.5) * 16; },
      update: function(a, dt){ a.x += a.vx * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        oc_ell(ctx, 0, 34, 12, 4.4, 0, 'rgba(6,10,3,0.2)');
        const d = a.vx < 0 ? -1 : 1, fl = Math.abs(Math.sin(t * 6 + a.ph));
        ctx.translate(0, -20 + Math.sin(t * 3 + a.ph) * 2); ctx.scale(d, 1);
        oc_ell(ctx, -8, 0, 11, 1.8, 0.1, '#3A6AA8');                                  /* tail */
        oc_ell(ctx, 0, -2, 3 + 8 * fl, 7, 0, '#3C68A6');                               /* wings flap across the body */
        oc_ell(ctx, 0, 0, 9, 3.6, 0, '#AE4A3A');                                      /* body */
        oc_ell(ctx, 8, -1, 3.6, 3.2, 0, '#B85442');                                    /* head */
        oc_ell(ctx, 12, 0, 2, 1.4, 0, '#E0D8B8');                                      /* beak */
      } }
  ]
});

