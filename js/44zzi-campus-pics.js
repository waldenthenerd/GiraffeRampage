'use strict';
/* =============================================================================================================================
   44zzi-campus-pics.js  --  LONGNECK UNIVERSITY: the pictures on the lecture slides. UNI_PICS[key](ctx, w, h, faculty color) draws one
   520 x 300 picture; the keys are the ones named in 44zzc. Flat shapes in a chalk-and-paper style: a colored ground, a few big forms and
   a label or two, so each picture says one thing.
   ============================================================================================================================= */
const UNI_PICS = (function(){
  const P = {};
  const R = function(c, col, x, y, w, h){ c.fillStyle = col; c.fillRect(x, y, w, h); };
  const C = function(c, col, x, y, r){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  const E = function(c, col, x, y, rx, ry, a){ c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, a || 0, 0, Math.PI * 2); c.fill(); };
  const L = function(c, col, w, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const Pg = function(c, col, pts){ c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
  const T = function(c, s, x, y, size, col, al){ c.fillStyle = col || '#2B3040'; c.font = 'bold ' + Math.max(size, 14) + 'px system-ui, sans-serif'; c.textAlign = al || 'center'; c.fillText(s, x, y); };
  const G = function(c, w, h, a, b){ const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  const SKY = function(c, w, h, y){ G(c, w, h, '#8FD0F2', '#E4F4FA'); E(c, 'rgba(255,255,255,.8)', 90, 50, 44, 12); E(c, 'rgba(255,255,255,.7)', 400, 70, 52, 13); C(c, '#FFE27A', 460, 44, 22); };
  const GRASS = function(c, w, h, y, col){ R(c, col || '#8DBE5A', 0, y, w, h - y); R(c, 'rgba(255,255,255,.14)', 0, y, w, 4); for (let i = 0; i < 60; i++) L(c, 'rgba(40,80,20,.35)', 1.4, (i * 97) % w, y + 8 + (i * 41) % (h - y - 10), (i * 97) % w + 2, y + 2 + (i * 41) % (h - y - 10)); };
  const TREE = function(c, x, y, s, flat){ R(c, '#6A4A2C', x - 3 * s, y - 50 * s, 6 * s, 50 * s); if (flat){ E(c, '#4E8A3A', x, y - 56 * s, 36 * s, 9 * s); E(c, '#5E9A46', x - 12 * s, y - 62 * s, 24 * s, 7 * s); } else { C(c, '#4E8A3A', x, y - 66 * s, 26 * s); C(c, '#5E9A46', x - 12 * s, y - 56 * s, 16 * s); } };
  /* a giraffe in profile: body, legs, a long neck, a head, ossicones, spots; s scales it, x and y are where its feet are */
  const GIR = function(c, x, y, s, o){
    o = o || {}; const coat = o.coat || '#E8B23C', spot = o.spot || '#8A5A1C', nk = o.neck || 1, bow = o.bow || 0;
    c.save(); c.translate(x, y); c.scale(s, s);
    [[-30, 0], [-18, 4], [20, 0], [32, 4]].forEach(function(l){ R(c, coat, l[0] - 4, -52, 8, 52 + l[1] - 4); R(c, '#3A2A1A', l[0] - 5, -4 + l[1] - 4, 10, 6); });
    E(c, coat, 0, -62, 44, 24, 0); L(c, coat, 5, -42, -66, -52, -50);
    const nx = 28, ny = -64, hx = nx + 14 + bow * 16, hy = ny - 86 * nk + bow * 60;
    c.strokeStyle = coat; c.lineWidth = 15; c.lineCap = 'round'; c.beginPath(); c.moveTo(nx - 6, ny + 6); c.lineTo(hx - 10, hy + 12); c.stroke();
    c.strokeStyle = '#6A4A1A'; c.lineWidth = 3; c.beginPath(); c.moveTo(nx - 12, ny + 6); c.lineTo(hx - 18, hy + 12); c.stroke();
    E(c, coat, hx + 6, hy, 17, 10, -0.2); L(c, '#6A4A1A', 3, hx - 4, hy - 8, hx - 6, hy - 18); L(c, '#6A4A1A', 3, hx + 6, hy - 9, hx + 8, hy - 19); C(c, '#3A2A1A', hx - 6, hy - 19, 2.6); C(c, '#3A2A1A', hx + 8, hy - 20, 2.6); C(c, '#2B2018', hx + 4, hy - 3, 2); E(c, '#D88A8A', hx + 20, hy + 3, 4, 3);
    c.fillStyle = spot; [[-26, -70, 7], [-8, -58, 8], [12, -72, 7], [26, -56, 6], [-32, -54, 5]].forEach(function(p){ c.beginPath(); c.ellipse(p[0], p[1], p[2], p[2] * 0.8, 0.3, 0, 7); c.fill(); }); for (let i = 0; i < 5; i++){ c.beginPath(); c.ellipse(nx - 4 + (hx - nx) * i / 5 * 0.7, ny - 10 - 70 * nk * i / 5 + bow * 40 * i / 5, 4, 5, 0, 0, 7); c.fill(); }
    c.restore();
  };
  const LABEL = function(c, s, x, y, col){ T(c, s, x, y, 15, col || '#2B3040'); };
  const ARROW = function(c, col, x1, y1, x2, y2, w){ L(c, col, w || 3, x1, y1, x2, y2); const a = Math.atan2(y2 - y1, x2 - x1); Pg(c, col, [x2, y2, x2 - 11 * Math.cos(a - 0.45), y2 - 11 * Math.sin(a - 0.45), x2 - 11 * Math.cos(a + 0.45), y2 - 11 * Math.sin(a + 0.45)]); };

  /* ------------------------------------------------ GIRAFFE STUDIES ------------------------------------------------ */
  P.savanna = function(c, w, h){ G(c, w, h, '#F6B86A', '#FCE3A8'); C(c, '#FFF1C0', 400, 160, 40); GRASS(c, w, h, 210, '#C9B060'); TREE(c, 90, 215, 1.1, true); TREE(c, 440, 205, 0.8, true); TREE(c, 300, 200, 0.6, true); GIR(c, 200, 262, 1.1); GIR(c, 330, 250, 0.7, { nk: 0.8 }); };
  P.calf = function(c, w, h){ SKY(c, w, h); GRASS(c, w, h, 230); GIR(c, 160, 270, 1.35); GIR(c, 340, 262, 0.6, { nk: 0.7, bow: 0.1 }); ARROW(c, '#E55', 260, 150, 300, 190, 3); T(c, '1.8 m tall at birth', 400, 150, 15, '#B03030'); };
  P.run = function(c, w, h){ G(c, w, h, '#FFD9A0', '#FFF0D0'); GRASS(c, w, h, 230, '#C9B060'); for (let i = 0; i < 6; i++) L(c, 'rgba(120,90,40,.35)', 3, 40 + i * 30, 120 + i * 14, 130 + i * 30, 120 + i * 14); GIR(c, 260, 270, 1.2, { bow: 0.5, neck: 0.8 }); for (let i = 0; i < 4; i++) E(c, 'rgba(160,130,70,.5)', 100 - i * 24, 262 - i % 2 * 6, 14 - i * 2, 8 - i); T(c, '60 km/h', 420, 70, 24, '#B05A1A'); };
  P.family = function(c, w, h){ SKY(c, w, h); GRASS(c, w, h, 235); TREE(c, 70, 240, 0.9, true); GIR(c, 160, 275, 1.1); GIR(c, 270, 268, 0.85, { nk: 0.9 }); GIR(c, 350, 262, 0.6, { nk: 0.7 }); GIR(c, 420, 258, 0.45, { nk: 0.6 }); T(c, 'a tower of giraffes', 270, 40, 20, '#2B3040'); };

  /* ------------------------------------------------ EARTH AND WEATHER ------------------------------------------------ */
  P.plates = function(c, w, h){ G(c, w, h, '#B8D8F0', '#E4F0F8'); R(c, '#C9A26A', 0, 120, 250, 60); R(c, '#A07A42', 270, 150, 250, 30); R(c, '#E8662A', 0, 180, w, 70); R(c, '#C2461E', 0, 250, w, 50); Pg(c, '#9A7A4A', [250, 120, 270, 150, 270, 180, 250, 180]); ARROW(c, '#2B3040', 60, 150, 150, 150, 4); ARROW(c, '#2B3040', 460, 150, 380, 150, 4); Pg(c, '#8A6A3A', [200, 120, 230, 60, 260, 120]); Pg(c, '#F4F8FA', [220, 82, 230, 60, 240, 82]); T(c, 'two plates push together', 260, 28, 18, '#2B3040'); T(c, 'mountains', 230, 50, 12, '#6A4A2C'); };
  P.leaf = function(c, w, h){ G(c, w, h, '#DDF0C0', '#F4FAE4'); c.fillStyle = '#4E9A3A'; c.beginPath(); c.moveTo(80, 220); c.bezierCurveTo(100, 40, 400, 40, 440, 220); c.bezierCurveTo(400, 260, 120, 280, 80, 220); c.fill(); L(c, '#2E6A22', 5, 90, 224, 430, 218); for (let i = 0; i < 6; i++){ L(c, '#2E6A22', 2.4, 140 + i * 50, 220, 160 + i * 50, 120 + (i % 2) * 14); L(c, '#2E6A22', 2.4, 150 + i * 50, 222, 180 + i * 50, 250); } C(c, '#FFE27A', 460, 50, 26); ARROW(c, '#FFC83D', 430, 76, 350, 130, 4); T(c, 'light', 440, 106, 13, '#B07A10'); T(c, 'CO₂ + water', 150, 280, 14, '#2E6A22'); T(c, 'sugar + oxygen', 380, 286, 14, '#2E6A22'); };
  P.dna = function(c, w, h){ G(c, w, h, '#1E2440', '#2E3A64'); for (let i = 0; i < 20; i++){ const x = 60 + i * 20, y1 = 150 + Math.sin(i * 0.5) * 80, y2 = 150 - Math.sin(i * 0.5) * 80; L(c, ['#FF6A5A', '#FFD84D', '#6BE08A', '#4DB8FF'][i % 4], 3, x, y1, x, y2); C(c, '#E85DFF', x, y1, 6); C(c, '#6BD6FF', x, y2, 6); } T(c, 'a code of four letters', 260, 286, 16, '#C9D4F0'); };

  /* ------------------------------------------------ CHEMISTRY ------------------------------------------------ */
  P.states = function(c, w, h){ G(c, w, h, '#E4F0FA', '#F4FAFF'); [['solid', 90, 0], ['liquid', 260, 1], ['gas', 430, 2]].forEach(function(s){ tBox(c, s[1], s[2]); T(c, s[0], s[1], 270, 18, '#2B3040'); });
    function tBox(c, x, k){ R(c, '#FFFFFF', x - 66, 60, 132, 170); c.strokeStyle = '#8A9AB0'; c.lineWidth = 3; c.strokeRect(x - 66, 60, 132, 170); for (let i = 0; i < 16; i++){ let px, py; if (k === 0){ px = x - 48 + (i % 4) * 32; py = 90 + Math.floor(i / 4) * 32; } else if (k === 1){ px = x - 50 + (i % 4) * 30 + (Math.floor(i / 4) % 2) * 8; py = 160 + Math.floor(i / 4) * 16 + Math.sin(i) * 4 - 16; } else { px = x - 54 + ((i * 53) % 108); py = 76 + ((i * 71) % 140); } C(c, k === 0 ? '#4D9AE8' : k === 1 ? '#3AA8C8' : '#8AD8E8', px, py, 9); } } };
  P.flask = function(c, w, h){ G(c, w, h, '#EEF4FA', '#FFFFFF'); R(c, '#C9B48A', 0, 258, w, 42); c.fillStyle = 'rgba(200,225,245,.55)'; c.beginPath(); c.moveTo(225, 40); c.lineTo(295, 40); c.lineTo(295, 120); c.lineTo(380, 250); c.quadraticCurveTo(384, 262, 370, 262); c.lineTo(150, 262); c.quadraticCurveTo(136, 262, 140, 250); c.lineTo(225, 120); c.closePath(); c.fill(); c.strokeStyle = '#6A7A90'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#6BD6A0'; c.beginPath(); c.moveTo(190, 188); c.lineTo(330, 188); c.lineTo(372, 250); c.quadraticCurveTo(376, 258, 366, 258); c.lineTo(154, 258); c.quadraticCurveTo(144, 258, 148, 250); c.closePath(); c.fill(); for (let i = 0; i < 8; i++) C(c, 'rgba(255,255,255,.7)', 200 + i * 18, 170 - (i % 3) * 18 - i * 4, 4 + i % 3); R(c, '#C9CDD9', 218, 32, 84, 10); };
  P.atom = function(c, w, h){ G(c, w, h, '#14183A', '#2A2A64'); const cx = 260, cy = 150; [0, 1, 2].forEach(function(i){ c.save(); c.translate(cx, cy); c.rotate(i * Math.PI / 3); c.strokeStyle = 'rgba(160,200,255,.7)'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, 0, 130, 46, 0, 0, 7); c.stroke(); C(c, '#6BD6FF', 130 * Math.cos(i * 2), 46 * Math.sin(i * 2), 8); c.restore(); }); [[-6, -6], [6, -4], [0, 8], [-8, 6], [8, 8]].forEach(function(p, i){ C(c, i % 2 ? '#FF6A5A' : '#E8E4DC', cx + p[0], cy + p[1], 8); }); T(c, 'protons + neutrons in the middle', 260, 286, 14, '#C9D4F0'); T(c, 'electrons', 420, 70, 14, '#6BD6FF'); };
  P.periodic = function(c, w, h){ G(c, w, h, '#F4F1E8', '#FFFFFF'); const cols = ['#E85D4A', '#F2B230', '#6BBB45', '#4D9AE8', '#A56AD8', '#E88AB8', '#3AA8A8']; for (let r = 0; r < 6; r++) for (let q = 0; q < 18; q++){ if ((r === 0 && q > 0 && q < 17) || (r < 3 && q > 1 && q < 12)) continue; R(c, cols[(q < 2 ? 0 : q < 12 ? 3 : q < 14 ? 2 : q < 17 ? 1 : 4)], 14 + q * 28, 30 + r * 38, 25, 34); R(c, 'rgba(255,255,255,.35)', 17 + q * 28, 33 + r * 38, 19, 3); } T(c, 'a table that sorts the elements', 260, 280, 15, '#2B3040'); };
  P.ph = function(c, w, h){ G(c, w, h, '#F8F8F4', '#FFFFFF'); const cols = ['#E8332A', '#EE5A2A', '#F2862A', '#F2B230', '#E8D83A', '#B8D83A', '#6BBB45', '#3AA86A', '#3AA8A8', '#3A8AC8', '#3A5AC8', '#5A3AC8', '#7A2AA8', '#5A1A88']; cols.forEach(function(k, i){ R(c, k, 20 + i * 34, 90, 34, 70); T(c, '' + i, 37 + i * 34, 182, 14, '#2B3040'); }); T(c, 'acid', 80, 74, 18, '#B03030'); T(c, 'neutral', 260, 74, 18, '#2A7A3A'); T(c, 'alkaline', 440, 74, 18, '#3A3A9A'); T(c, 'lemon', 60, 228, 13, '#7A6A1A'); T(c, 'water', 260, 228, 13, '#2A7A3A'); T(c, 'soap', 410, 228, 13, '#3A3A9A'); };
  P.bond = function(c, w, h){ G(c, w, h, '#EAF0FA', '#FAFCFF'); [[130, 150], [390, 150]].forEach(function(p, k){ if (k === 0){ C(c, '#E85D4A', p[0] + 20, p[1], 40); C(c, '#4D9AE8', p[0] - 36, p[1] - 22, 26); C(c, '#4D9AE8', p[0] - 36, p[1] + 22, 26); T(c, 'O', p[0] + 20, p[1] + 6, 20, '#FFF'); T(c, 'H', p[0] - 36, p[1] - 15, 14, '#FFF'); T(c, 'H', p[0] - 36, p[1] + 29, 14, '#FFF'); T(c, 'water: H₂O', p[0], 240, 16, '#2B3040'); } else { C(c, '#F2B230', p[0] - 44, p[1], 34); C(c, '#6BBB45', p[0] + 44, p[1], 34); T(c, 'Na', p[0] - 44, p[1] + 6, 16, '#FFF'); T(c, 'Cl', p[0] + 44, p[1] + 6, 16, '#FFF'); T(c, 'salt: NaCl', p[0], 240, 16, '#2B3040'); } }); L(c, '#8A8E98', 2, 260, 60, 260, 240); };

  /* ------------------------------------------------ MATHS ------------------------------------------------ */
  P.fractions = function(c, w, h){ G(c, w, h, '#FFF2F6', '#FFFFFF'); [[100, 2, 1], [260, 4, 3], [420, 8, 5]].forEach(function(f){ const cx = f[0], cy = 130, n = f[1]; for (let i = 0; i < n; i++){ c.fillStyle = i < f[2] ? '#F2784A' : '#FBE8DC'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 62, i * Math.PI * 2 / n - Math.PI / 2, (i + 1) * Math.PI * 2 / n - Math.PI / 2); c.closePath(); c.fill(); c.strokeStyle = '#8A4A2A'; c.lineWidth = 2; c.stroke(); } T(c, f[2] + '/' + f[1], cx, 240, 24, '#2B3040'); }); };
  P.primes = function(c, w, h){ G(c, w, h, '#EEF4FF', '#FFFFFF'); const pr = { 2: 1, 3: 1, 5: 1, 7: 1, 11: 1, 13: 1, 17: 1, 19: 1, 23: 1, 29: 1 }; for (let i = 1; i <= 30; i++){ const q = (i - 1) % 10, r = Math.floor((i - 1) / 10); R(c, pr[i] ? '#E85D4A' : '#DCE4F0', 24 + q * 47, 52 + r * 64, 42, 56); T(c, '' + i, 45 + q * 47, 88 + r * 64, 20, pr[i] ? '#FFF' : '#6A7A90'); } T(c, 'primes: only 1 and itself divide them', 260, 270, 15, '#2B3040'); };
  P.pythag = function(c, w, h){ G(c, w, h, '#FFF8E0', '#FFFFFF'); R(c, 'rgba(77,154,232,.5)', 120, 100, 70, 70); R(c, 'rgba(110,187,69,.5)', 190, 170, 100, 100); Pg(c, 'rgba(232,93,74,.5)', [190, 100, 290, 170, 360, 70, 260, 0]); Pg(c, '#FFFFFF', [190, 170, 190, 100, 290, 170]); c.strokeStyle = '#2B3040'; c.lineWidth = 3; c.beginPath(); c.moveTo(190, 170); c.lineTo(190, 100); c.lineTo(290, 170); c.closePath(); c.stroke(); c.strokeRect(120, 100, 70, 70); c.strokeRect(190, 170, 100, 100); T(c, 'a', 155, 142, 20, '#2B3040'); T(c, 'b', 240, 228, 20, '#2B3040'); T(c, 'c', 300, 70, 20, '#2B3040'); T(c, 'a² + b² = c²', 430, 250, 20, '#B03030'); };

  /* ------------------------------------------------ PHYSICS ------------------------------------------------ */
  P.waves = function(c, w, h){ G(c, w, h, '#EAF6FA', '#FFFFFF'); c.strokeStyle = '#3A8AC8'; c.lineWidth = 5; c.beginPath(); for (let x = 20; x <= 500; x += 4) c.lineTo(x, 130 + Math.sin(x * 0.045) * 54); c.stroke(); L(c, '#8A9AB0', 2, 20, 130, 500, 130); ARROW(c, '#B03030', 168, 130, 168, 76, 2); ARROW(c, '#2A7A3A', 100, 244, 262, 244, 2); ARROW(c, '#2A7A3A', 262, 244, 100, 244, 2); T(c, 'amplitude', 168, 64, 13, '#B03030'); T(c, 'wavelength', 180, 270, 13, '#2A7A3A'); };

  /* ------------------------------------------------ SPACE ------------------------------------------------ */
  const STARS = function(c, w, h, n){ G(c, w, h, '#0A0E26', '#1A1E46'); for (let i = 0; i < (n || 60); i++) C(c, 'rgba(255,255,255,' + (0.3 + (i % 5) * 0.14) + ')', (i * 137) % w, (i * 71) % h, 0.8 + (i % 3) * 0.5); };
  P.galaxy = function(c, w, h){ STARS(c, w, h, 90); c.save(); c.translate(260, 150); for (let a = 0; a < 2; a++){ c.rotate(Math.PI); for (let i = 0; i < 150; i++){ const t = i / 150, ang = t * 5.2, r = 14 + t * 190; C(c, 'rgba(' + (200 + (i % 5) * 10) + ',' + (200 + (i % 3) * 18) + ',255,' + (0.8 - t * 0.5) + ')', Math.cos(ang) * r * 1.1 + (i % 7 - 3) * 3, Math.sin(ang) * r * 0.5 + (i % 5 - 2) * 3, 2 + (i % 3) * 1.1); } } E(c, 'rgba(255,230,170,.9)', 0, 0, 30, 18); c.restore(); T(c, 'billions of stars', 260, 286, 14, '#C9D4F0'); };

  /* ------------------------------------------------ HISTORY AND GEOGRAPHY ------------------------------------------------ */

  /* ------------------------------------------------ REFINED PICTURES ------------------------------------------------ */
  /* The pictures below were redrawn with more detail and labels that keep clear of the drawing (a label sits on its own pill or in empty sky, with a leader line to what it names). */
  const PILL = function(c, s, x, y, size, col, bg){ size = Math.max(size, 14); c.font = 'bold ' + size + 'px system-ui, sans-serif'; const tw = c.measureText(s).width + 14; c.fillStyle = bg || 'rgba(255,255,255,.88)'; c.beginPath(); c.roundRect(x - tw / 2, y - size * 0.82, tw, size * 1.5, 7); c.fill(); T(c, s, x, y + size * 0.18, size, col || '#2B3040'); };
  const DOT = function(c, col, x, y, r){ C(c, '#FFFFFF', x, y, r + 2); C(c, col, x, y, r); };
  const LEAD = function(c, x1, y1, x2, y2, col){ L(c, col || '#2B3040', 1.6, x1, y1, x2, y2); DOT(c, col || '#2B3040', x1, y1, 3); };
  const BLOB = function(c, col, x, y, r, seed){ c.fillStyle = col; c.beginPath(); for (let i = 0; i <= 36; i++){ const a = i / 36 * Math.PI * 2, k = r * (0.84 + 0.16 * Math.sin(a * 2 + seed) * Math.cos(a + seed * 1.7)); const px = x + Math.cos(a) * k * (1 + 0.16 * Math.sin(seed)), py = y + Math.sin(a) * k * 0.84; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); c.fill(); };
  const CLOUD = function(c, x, y, s, col){ [[0, 0, 16], [16, -8, 20], [38, 0, 16], [20, 6, 18]].forEach(function(p){ C(c, col || '#FFFFFF', x + p[0] * s, y + p[1] * s, p[2] * s); }); };
  const SUN = function(c, x, y, r){ for (let i = 0; i < 12; i++){ const a = i * Math.PI / 6; L(c, 'rgba(255,214,90,.7)', 3, x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5), x + Math.cos(a) * (r + 13), y + Math.sin(a) * (r + 13)); } C(c, '#FFE27A', x, y, r); };

  P.spots = function(c, w, h){                                       /* a patch of hide: no two patches alike, none touching */
    G(c, w, h, '#F6E2AE', '#F2D690');
    for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++){ const x = 66 + q * 88 + (r % 2) * 26, y = 52 + r * 72, s = r * 5 + q + 1; BLOB(c, ['#B8742A', '#A5621E', '#C98A3A'][(r + q) % 3], x, y, 27 + (s * 7) % 9, s * 1.3); }
    R(c, 'rgba(60,36,14,.86)', 90, 252, 340, 36); T(c, 'no two giraffes have the same pattern', 260, 276, 17, '#FFF0C8');
  };
  P.neck = function(c, w, h){                                         /* the seven bones, numbered along the neck */
    SKY(c, w, h); GRASS(c, w, h, 240); GIR(c, 170, 270, 1.4);
    for (let k = 0; k < 7; k++){ const t = (k + 0.5) / 7, x = 201 + 14 * t, y = 189 - 112 * t; c.save(); c.translate(x, y); c.rotate(0.12); c.fillStyle = '#FFFFFF'; c.strokeStyle = '#C0392B'; c.lineWidth = 2; c.beginPath(); c.roundRect(-12, -7, 24, 14, 6); c.fill(); c.stroke(); c.restore(); T(c, String(k + 1), 238 + 10 * t, y + 5, 14, '#C0392B'); }
    c.strokeStyle = '#C0392B'; c.lineWidth = 2; c.beginPath(); c.moveTo(262, 74); c.lineTo(268, 74); c.lineTo(268, 192); c.lineTo(262, 192); c.stroke();
    PILL(c, '7 neck bones', 380, 126, 22, '#C0392B'); PILL(c, 'just like a human', 380, 160, 17, '#2B3040'); PILL(c, 'each as long as a ruler', 380, 186, 15, '#2B3040');
  };
  P.tongue = function(c, w, h){                                       /* the tongue wraps round a branch; the labels sit in clear sky */
    G(c, w, h, '#A8DCF4', '#E8F6FA'); SUN(c, 52, 48, 20); CLOUD(c, 150, 40, 0.6); GRASS(c, w, h, 250); TREE(c, 410, 285, 1.6); GIR(c, 150, 282, 1.4);
    L(c, '#6A4A2C', 6, 372, 150, 300, 108); c.fillStyle = '#4E8A3A'; [[318, 100], [336, 116], [352, 130], [300, 120]].forEach(function(p){ E(c, '#4E9A3A', p[0], p[1], 11, 6, 0.5); });
    c.strokeStyle = '#6A3A8A'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(214, 80); c.quadraticCurveTo(250, 56, 296, 100); c.stroke(); c.lineWidth = 2; c.strokeStyle = '#B89AD8'; c.beginPath(); c.moveTo(216, 78); c.quadraticCurveTo(250, 54, 294, 98); c.stroke();
    PILL(c, 'dark purple tongue', 396, 34, 17, '#4A2A6A'); PILL(c, 'about 45 cm long', 396, 62, 15, '#2B3040'); LEAD(c, 296, 100, 360, 72, '#4A2A6A');
  };
  P.heart = function(c, w, h){                                        /* the heart sits low in the chest and pumps blood a long way up */
    G(c, w, h, '#FFE9E6', '#FFF8F6'); GIR(c, 140, 282, 1.3);
    c.save(); c.strokeStyle = 'rgba(213,53,43,.75)'; c.lineWidth = 3; c.setLineDash([2, 8]); c.lineCap = 'round'; c.beginPath(); c.moveTo(168, 204); c.lineTo(188, 128); c.lineTo(194, 52); c.stroke(); c.restore();
    [[176, 170], [186, 130], [190, 92]].forEach(function(p){ ARROW(c, '#D5352B', p[0], p[1] + 12, p[0] + 3, p[1] - 8, 2); });
    const hx = 160, hy = 206; c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(hx, hy + 12); c.bezierCurveTo(hx - 20, hy - 4, hx - 10, hy - 18, hx, hy - 8); c.bezierCurveTo(hx + 10, hy - 18, hx + 20, hy - 4, hx, hy + 12); c.fill();
    LEAD(c, 168, 206, 330, 206, '#D5352B'); const bx = 400, by = 200; c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(bx, by + 56); c.bezierCurveTo(bx - 84, by, bx - 48, by - 64, bx, by - 26); c.bezierCurveTo(bx + 48, by - 64, bx + 84, by, bx, by + 56); c.fill(); E(c, 'rgba(255,255,255,.3)', bx - 28, by - 24, 14, 7, -0.6);
    T(c, '11 kg', bx, by + 8, 28, '#FFFFFF'); PILL(c, 'a giraffe heart', 390, 96, 17, '#8A1A14'); PILL(c, 'pumps blood up a 2 m neck', 360, 62, 15, '#8A1A14');
  };
  P.layers = function(c, w, h){                                       /* the Earth's layers, each named with a leader line */
    G(c, w, h, '#161C38', '#222C54'); for (let i = 0; i < 24; i++) C(c, 'rgba(255,255,255,.5)', (i * 89) % w, (i * 53) % h, 1);
    const cx = 160, cy = 150; [['#6A4A2C', 132], ['#F2A53A', 124], ['#E8662A', 90], ['#C2461E', 50], ['#FFD84D', 28]].forEach(function(r){ C(c, r[0], cx, cy, r[1]); }); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.4; [124, 90, 50, 28].forEach(function(r){ c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); });
    [['crust', 'only 5 to 70 km thick', 128, -0.62, 50], ['mantle', 'hot, slowly flowing rock', 108, -0.3, 108], ['outer core', 'liquid metal', 70, 0.12, 166], ['inner core', 'solid metal', 14, 0.5, 224]].forEach(function(l){ const px = cx + Math.cos(l[3]) * l[2], py = cy + Math.sin(l[3]) * l[2]; LEAD(c, px, py, 310, l[4] + 6, '#FFFFFF'); T(c, l[0], 320, l[4] + 2, 19, '#FFD08A', 'left'); T(c, l[1], 320, l[4] + 21, 13, '#C8D0E8', 'left'); });
  };
  P.watercycle = function(c, w, h){                                   /* four arrows, four names, each on its own pill */
    G(c, w, h, '#9AD4F0', '#E8F6FA'); SUN(c, 466, 44, 22); R(c, '#3E7ACB', 0, 232, 190, 68); for (let i = 0; i < 5; i++) L(c, 'rgba(255,255,255,.5)', 2, 14 + i * 34, 246 + (i % 2) * 14, 36 + i * 34, 246 + (i % 2) * 14);
    Pg(c, '#8A9AA8', [240, 232, 340, 96, 440, 232]); Pg(c, '#FFFFFF', [316, 130, 340, 96, 364, 130, 340, 122]); R(c, '#7ABA4A', 190, 214, 330, 86); Pg(c, '#7ABA4A', [190, 232, 190, 214, 240, 232]);
    CLOUD(c, 120, 70, 1.3, '#F4F8FA'); CLOUD(c, 180, 80, 0.8, '#D8E0E8');
    ARROW(c, '#E8503A', 70, 226, 70, 112, 4); PILL(c, 'evaporation', 76, 176, 15, '#B03020');
    for (let i = 0; i < 4; i++) L(c, 'rgba(58,138,200,.8)', 2, 128 + i * 12, 112 + i * 2, 120 + i * 12, 130 + i * 2);
    ARROW(c, '#3A8AC8', 270, 100, 292, 150, 4); PILL(c, 'rain', 262, 140, 15, '#1A5A98');
    ARROW(c, '#3A8AC8', 372, 150, 330, 226, 3); PILL(c, 'runoff', 438, 196, 15, '#1A5A98'); ARROW(c, '#3A8AC8', 300, 252, 196, 262, 3);
    PILL(c, 'condensation', 150, 36, 15, '#4A5A70');
  };
  P.atmos = function(c, w, h){                                        /* the layers, with heights and one thing that lives in each */
    G(c, w, h, '#070A22', '#7FC4EC'); for (let i = 0; i < 40; i++) C(c, 'rgba(255,255,255,.75)', (i * 83) % w, (i * 37) % 110, 1.1); R(c, '#6EA84A', 0, 280, w, 20);
    [['exosphere', 'above 600 km', 28], ['thermosphere', '85 to 600 km', 80], ['mesosphere', '50 to 85 km', 132], ['stratosphere', '12 to 50 km, ozone', 184], ['troposphere', 'weather, up to 12 km', 236]].forEach(function(l, i){ L(c, 'rgba(255,255,255,.35)', 1.4, 20, l[2] + 24, 500, l[2] + 24); T(c, l[0], 24, l[2] + 4, 17, '#FFFFFF', 'left'); T(c, l[1], 24, l[2] + 20, 12, 'rgba(255,255,255,.85)', 'left'); });
    c.save(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.moveTo(330, 120); c.lineTo(380, 150); c.stroke(); c.restore(); L(c, '#FFE27A', 3, 330, 118, 346, 128);
    R(c, '#F4F4F4', 400, 228, 46, 9); Pg(c, '#C0C8D0', [420, 232, 440, 220, 446, 222, 432, 236]); C(c, '#E8503A', 452, 226, 3); CLOUD(c, 330, 252, 0.8, '#FFFFFF'); C(c, '#E8503A', 470, 166, 12); L(c, '#FFFFFF', 1, 470, 178, 470, 196); R(c, '#8A5A2A', 466, 196, 8, 6);
  };
  P.animals = function(c, w, h){                                      /* a mammal, a bird and a fish, each with what makes it that */
    G(c, w, h, '#E4F2D0', '#F6FBEC');
    [[88, 'mammal', 'fur and milk'], [260, 'bird', 'feathers and wings'], [432, 'fish', 'gills and scales']].forEach(function(a){ C(c, 'rgba(255,255,255,.8)', a[0], 126, 74); T(c, a[1], a[0], 244, 20, '#2B3040'); T(c, a[2], a[0], 266, 13, '#5A6A4A'); });
    E(c, '#B8742A', 86, 126, 34, 20); [[-22, 0], [-10, 0], [14, 0], [26, 0]].forEach(function(l){ R(c, '#8A5418', 86 + l[0] - 3, 138, 6, 28); }); L(c, '#B8742A', 14, 112, 112, 124, 90); E(c, '#B8742A', 130, 84, 14, 10, -0.3); Pg(c, '#8A5418', [124, 76, 120, 60, 132, 72]); Pg(c, '#8A5418', [134, 74, 140, 58, 142, 76]); C(c, '#2B2018', 135, 84, 2.2); L(c, '#B8742A', 5, 54, 118, 44, 136); E(c, '#E8C898', 80, 134, 18, 8);
    E(c, '#4D9AE8', 258, 130, 30, 22); E(c, '#3A7AC8', 246, 128, 18, 10, -0.5); C(c, '#4D9AE8', 284, 110, 14); Pg(c, '#F2A230', [296, 110, 312, 116, 296, 120]); C(c, '#FFFFFF', 288, 108, 3.4); C(c, '#2B2018', 289, 108, 1.8); Pg(c, '#2E6AB8', [230, 134, 204, 150, 232, 150, 236, 140]); Pg(c, '#2E6AB8', [230, 126, 200, 120, 228, 134]); L(c, '#F2A230', 3, 256, 150, 256, 172); L(c, '#F2A230', 3, 268, 150, 268, 172);
    E(c, '#3AA8A8', 430, 126, 40, 22); Pg(c, '#2A8888', [468, 126, 496, 104, 496, 148]); Pg(c, '#2A8888', [420, 106, 440, 92, 446, 108]); C(c, '#FFFFFF', 410, 120, 5.4); C(c, '#1A2A2A', 409, 120, 2.6); c.strokeStyle = '#1F7878'; c.lineWidth = 2; c.beginPath(); c.arc(424, 126, 14, -1, 1); c.stroke(); for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++){ c.beginPath(); c.arc(436 + i * 8, 120 + k * 7, 5, 0.5, 2.6); c.stroke(); }
  };
  P.cell = function(c, w, h){                                         /* a plant cell: each part sits on the row of its label, so no leader line crosses another part */
    G(c, w, h, '#F6F0E4', '#FFFFFF'); c.fillStyle = '#7CB84A'; c.beginPath(); c.roundRect(150, 24, 350, 252, 28); c.fill(); c.fillStyle = '#EAF6D8'; c.beginPath(); c.roundRect(160, 34, 330, 232, 22); c.fill();
    [[340, 80], [400, 60], [430, 120], [360, 160], [420, 190], [350, 236], [410, 246]].forEach(function(p, i){ if (i % 2) E(c, '#3E9A3A', p[0], p[1], 20, 9, i * 0.6); else E(c, '#F2A230', p[0], p[1], 16, 8, i * 0.5); });
    C(c, '#9A5AB8', 226, 98, 30); C(c, '#5A2A78', 232, 102, 11); for (let i = 0; i < 9; i++) C(c, 'rgba(255,255,255,.3)', 226 + Math.cos(i) * 22, 98 + Math.sin(i * 1.7) * 20, 2);
    E(c, '#CFE8F8', 256, 154, 34, 20); E(c, 'rgba(255,255,255,.45)', 248, 148, 12, 6);
    E(c, '#3E9A3A', 236, 208, 28, 13); L(c, '#256A22', 1.5, 214, 208, 258, 208); E(c, '#3E9A3A', 304, 236, 22, 10, 0.3); E(c, '#3E9A3A', 300, 70, 22, 10, -0.3);
    E(c, '#F2A230', 236, 246, 22, 10, 0.2); c.strokeStyle = '#B86A10'; c.lineWidth = 2; c.beginPath(); c.moveTo(220, 247); c.quadraticCurveTo(230, 238, 238, 247); c.quadraticCurveTo(246, 255, 254, 245); c.stroke(); E(c, '#F2A230', 318, 130, 16, 8, 0.4);
    for (let i = 0; i < 24; i++) C(c, 'rgba(120,160,90,.4)', 176 + (i * 53) % 150, 50 + (i * 71) % 200, 1.8);
    [['cell wall', 150, 50, 50], ['nucleus', 198, 98, 98], ['vacuole', 222, 154, 154], ['chloroplast', 208, 208, 208], ['mitochondrion', 214, 246, 246]].forEach(function(l){ LEAD(c, l[1] + 0, l[2], 146, l[2], '#2B3040'); T(c, l[0], 138, l[3] + 5, 16, '#2B3040', 'right'); });
  };
  P.foodchain = function(c, w, h){                                    /* who eats whom: four small drawings, three arrows */
    G(c, w, h, '#DDEFC8', '#F4FAE4'); SUN(c, 470, 40, 18); R(c, '#8DBE5A', 0, 232, w, 68); GRASS(c, w, h, 232);
    [[70, 'grass'], [190, 'grasshopper'], [320, 'frog'], [440, 'hawk']].forEach(function(a){ C(c, 'rgba(255,255,255,.72)', a[0], 130, 48); T(c, a[1], a[0], 218, 16, '#2B3040'); });
    for (let i = -2; i <= 2; i++) L(c, '#3E8A2E', 4, 70 + i * 9, 160, 70 + i * 14, 108 + Math.abs(i) * 8);
    E(c, '#7ABA3A', 190, 134, 24, 9); L(c, '#5E9A2A', 3, 176, 140, 168, 156); L(c, '#5E9A2A', 3, 196, 140, 210, 158); L(c, '#5E9A2A', 4, 205, 128, 222, 108); C(c, '#7ABA3A', 168, 128, 8); C(c, '#2B2018', 165, 126, 1.8); L(c, '#5E9A2A', 1.5, 166, 122, 160, 108);
    E(c, '#3A9A5A', 320, 138, 30, 18); C(c, '#3A9A5A', 296, 118, 10); C(c, '#3A9A5A', 316, 118, 10); C(c, '#FFFFFF', 296, 117, 4); C(c, '#FFFFFF', 316, 117, 4); C(c, '#2B2018', 296, 117, 2); C(c, '#2B2018', 316, 117, 2); L(c, '#256A3A', 3, 302, 132, 312, 132); Pg(c, '#256A3A', [342, 150, 360, 160, 336, 156]);
    E(c, '#8A5A2A', 440, 138, 24, 28, 0.2); C(c, '#8A5A2A', 436, 104, 12); Pg(c, '#F2B230', [428, 102, 414, 108, 428, 112]); C(c, '#FFFFFF', 432, 101, 3); C(c, '#2B2018', 431, 101, 1.6); Pg(c, '#5A3A18', [452, 120, 484, 100, 470, 146]); Pg(c, '#5A3A18', [430, 160, 440, 182, 450, 160]);
    [[120, 130, 160, 130], [236, 130, 274, 130], [356, 130, 396, 130]].forEach(function(a){ ARROW(c, '#D5352B', a[0], a[1], a[2], a[3], 3); }); T(c, 'an arrow means "is eaten by"', 260, 28, 17, '#2B3040');
  };
  P.shapes = function(c, w, h){                                       /* six shapes in six cells, each named */
    G(c, w, h, '#FFF8E0', '#FFFFFF');
    const hex = function(x, y, r, col){ const p = []; for (let i = 0; i < 6; i++) p.push(x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r); Pg(c, col, p); }, pent = function(x, y, r, col){ const p = []; for (let i = 0; i < 5; i++) p.push(x + Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5) * r, y + Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5) * r); Pg(c, col, p); };
    C(c, '#E85D4A', 90, 72, 44); R(c, '#4D9AE8', 214, 30, 84, 84); Pg(c, '#6BBB45', [434, 26, 478, 114, 390, 114]); pent(88, 206, 46, '#F2B230'); hex(260, 206, 44, '#A56AD8'); R(c, '#3AA8A8', 384, 178, 104, 56);
    [['circle', 90, 138], ['square', 256, 138], ['triangle', 434, 138], ['pentagon', 88, 268], ['hexagon', 260, 268], ['rectangle', 436, 268]].forEach(function(l){ T(c, l[0], l[1], l[2], 17, '#2B3040'); });
    [['0', 90, 145], ['4 sides', 256, 154], ['3 sides', 434, 154], ['5 sides', 88, 286], ['6 sides', 260, 286], ['4 sides', 436, 286]].forEach(function(l, i){ if (i) T(c, l[0], l[1], l[2], 12, '#6A6A7A'); });
  };
  P.circle = function(c, w, h){                                       /* radius, diameter and circumference, each on its own line */
    G(c, w, h, '#FFF8E0', '#FFFFFF'); C(c, 'rgba(77,154,232,.22)', 200, 150, 104); c.strokeStyle = '#4D9AE8'; c.lineWidth = 5; c.beginPath(); c.arc(200, 150, 104, 0, 7); c.stroke();
    L(c, '#2E8A3A', 4, 96, 150, 304, 150); L(c, '#C0392B', 4, 200, 150, 304, 150); DOT(c, '#2B3040', 200, 150, 5);
    ARROW(c, '#2E8A3A', 200, 150, 98, 150, 4); ARROW(c, '#2E8A3A', 200, 150, 302, 150, 4);
    PILL(c, 'diameter', 148, 190, 16, '#1E6A2A'); PILL(c, 'radius', 252, 118, 16, '#A02A20'); PILL(c, 'center', 200, 72, 14, '#2B3040'); c.fillStyle = '#2B3040'; LEAD(c, 200, 150, 200, 82, '#2B3040');
    PILL(c, 'distance round = circumference', 405, 66, 13, '#1E4A8A');
    R(c, '#FFFFFF', 330, 150, 168, 74); c.strokeStyle = '#8A9AB0'; c.lineWidth = 2; c.strokeRect(330, 150, 168, 74); T(c, 'C = π × d', 414, 186, 26, '#2B3040'); T(c, 'π is about 3.14', 414, 212, 14, '#6A6A7A');
  };
  P.graph = function(c, w, h){                                        /* y = 2x + 1 on a grid, with numbers on both axes */
    G(c, w, h, '#F4FAF4', '#FFFFFF'); const x0 = 70, y0 = 252, ux = 46, uy = 21;
    c.strokeStyle = '#D4DECA'; c.lineWidth = 1; for (let i = 0; i <= 8; i++){ c.beginPath(); c.moveTo(x0 + i * ux, y0); c.lineTo(x0 + i * ux, y0 - 10 * uy); c.stroke(); } for (let j = 0; j <= 10; j++){ c.beginPath(); c.moveTo(x0, y0 - j * uy); c.lineTo(x0 + 8 * ux, y0 - j * uy); c.stroke(); }
    L(c, '#2B3040', 3, x0, y0, x0 + 8 * ux + 8, y0); L(c, '#2B3040', 3, x0, y0, x0, y0 - 10 * uy - 8);
    for (let i = 0; i <= 8; i++) T(c, String(i), x0 + i * ux, y0 + 18, 12, '#4A5A6A'); for (let j = 0; j <= 10; j += 2) T(c, String(j), x0 - 14, y0 - j * uy + 4, 12, '#4A5A6A'); T(c, 'x', x0 + 8 * ux + 24, y0 + 5, 16, '#2B3040'); T(c, 'y', x0 - 4, y0 - 10 * uy - 16, 16, '#2B3040');
    L(c, '#4D9AE8', 4, x0, y0 - 1 * uy, x0 + 4.5 * ux, y0 - 10 * uy); [[0, 1], [1, 3], [2, 5], [3, 7], [4, 9]].forEach(function(p){ DOT(c, '#E85D4A', x0 + p[0] * ux, y0 - p[1] * uy, 5); });
    L(c, '#2E8A3A', 2.5, x0 + 1 * ux, y0 - 3 * uy, x0 + 2 * ux, y0 - 3 * uy); L(c, '#C0392B', 2.5, x0 + 2 * ux, y0 - 3 * uy, x0 + 2 * ux, y0 - 5 * uy); PILL(c, 'across 1', x0 + 1.5 * ux, y0 - 3 * uy + 18, 12, '#1E6A2A'); PILL(c, 'up 2', x0 + 2 * ux + 34, y0 - 4 * uy, 12, '#A02A20');
    PILL(c, 'y = 2x + 1', 400, 70, 24, '#1E4A8A'); PILL(c, 'slope 2: up 2 for every 1 across', 380, 108, 13, '#2B3040'); PILL(c, 'starts at 1 on the y axis', 386, 134, 13, '#2B3040');
  };
  P.forces = function(c, w, h){                                       /* a crate on the ground: four forces, each labeled outside its arrow */
    G(c, w, h, '#EEF4FA', '#FFFFFF'); R(c, '#C9B48A', 0, 230, w, 70); for (let i = 0; i < 16; i++) L(c, 'rgba(120,90,50,.25)', 2, 20 + i * 33, 252 + (i % 3) * 14, 32 + i * 33, 252 + (i % 3) * 14);
    R(c, '#8A5A2A', 200, 150, 120, 80); R(c, 'rgba(255,255,255,.18)', 200, 150, 120, 8); c.strokeStyle = '#5A3A18'; c.lineWidth = 3; c.strokeRect(200, 150, 120, 80); L(c, '#5A3A18', 3, 200, 150, 320, 230); L(c, '#5A3A18', 3, 320, 150, 200, 230);
    ARROW(c, '#E85D4A', 80, 190, 192, 190, 6); PILL(c, 'push', 120, 168, 18, '#A02A20'); ARROW(c, '#4D9AE8', 450, 190, 328, 190, 6); PILL(c, 'friction', 410, 168, 18, '#1A5A98');
    ARROW(c, '#3A9A3A', 260, 142, 260, 58, 6); PILL(c, 'the ground pushes up', 260, 40, 16, '#1E6A2A'); ARROW(c, '#8A1A14', 260, 238, 260, 288, 6); PILL(c, 'weight (gravity)', 372, 272, 16, '#8A1A14');
  };
  P.energy = function(c, w, h){                                       /* a ball at the top of a hill and the same ball moving at the bottom */
    G(c, w, h, '#FFF4DC', '#FFFFFF'); Pg(c, '#8DBE5A', [0, 300, 0, 100, 250, 232, 330, 232, 420, 196, 520, 236, 520, 300]); Pg(c, 'rgba(60,100,30,.25)', [0, 300, 0, 112, 250, 244, 330, 244, 420, 208, 520, 248, 520, 300]);
    DOT(c, '#E85D4A', 40, 103, 16); PILL(c, 'stored energy', 130, 40, 17, '#A02A20'); T(c, 'the ball waits at the top', 130, 70, 13, '#6A4A2A');
    ARROW(c, '#F2862A', 74, 118, 196, 180, 3); DOT(c, '#E85D4A', 300, 214, 16); [0, 1, 2].forEach(function(i){ L(c, 'rgba(232,93,74,' + (0.5 - i * 0.14) + ')', 3, 270 - i * 22, 204 + i * 8, 256 - i * 22, 204 + i * 8); });
    PILL(c, 'moving energy', 380, 100, 17, '#A02A20'); T(c, 'fast at the bottom', 380, 130, 13, '#6A4A2A');
  };
  P.newton = function(c, w, h){                                       /* three small scenes, one for each law */
    G(c, w, h, '#F4F0FF', '#FFFFFF'); [[90, '1', 'it stays still', 'unless pushed'], [260, '2', 'bigger push,', 'bigger speed-up'], [430, '3', 'push on it,', 'it pushes back']].forEach(function(s, i){ const x = s[0]; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#C8C0E8'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 80, 18, 160, 264, 14); c.fill(); c.stroke(); C(c, '#6A4AC8', x, 50, 20); T(c, s[1], x, 58, 24, '#FFFFFF'); R(c, '#C9B48A', x - 80, 196, 160, 86); T(c, s[2], x, 238, 16, '#2B3040'); T(c, s[3], x, 260, 16, '#2B3040'); });
    DOT(c, '#E85D4A', 90, 170, 24); T(c, 'zzz', 126, 140, 14, '#8A8AAA'); R(c, '#8A5A2A', 250, 152, 50, 44); R(c, 'rgba(255,255,255,.18)', 250, 152, 50, 7); ARROW(c, '#E85D4A', 182, 174, 244, 174, 9); [0, 1, 2].forEach(function(i){ L(c, 'rgba(120,100,160,' + (0.6 - i * 0.15) + ')', 3, 318 + i * 16, 166 + i * 8, 332 + i * 16, 166 + i * 8); });
    DOT(c, '#E85D4A', 400, 162, 22); DOT(c, '#4D9AE8', 462, 162, 22); ARROW(c, '#E85D4A', 392, 120, 360, 120, 5); ARROW(c, '#4D9AE8', 470, 120, 502, 120, 5); L(c, '#2B3040', 2, 424, 162, 440, 162);
  };
  P.sound = function(c, w, h){                                        /* a bell rings, the air squashes and stretches, an ear hears */
    G(c, w, h, '#FFF0E0', '#FFFFFF'); L(c, '#6A4A2C', 5, 70, 36, 70, 70); Pg(c, '#D8A82A', [40, 150, 50, 90, 90, 90, 100, 150, 112, 160, 28, 160]); E(c, '#F2D060', 70, 160, 42, 8); C(c, '#8A5A2A', 70, 176, 7); L(c, '#8A5A2A', 3, 70, 168, 70, 172);
    for (let i = 1; i <= 5; i++){ c.strokeStyle = 'rgba(232,93,74,' + (0.9 - i * 0.14) + ')'; c.lineWidth = 4; c.beginPath(); c.arc(70, 130, 40 + i * 44, -0.55, 0.55); c.stroke(); }
    c.fillStyle = '#F2C8A0'; c.beginPath(); c.ellipse(460, 130, 28, 42, 0, 0, 7); c.fill(); c.strokeStyle = '#C89870'; c.lineWidth = 3; c.beginPath(); c.arc(462, 130, 14, -1.2, 2.4); c.stroke(); c.beginPath(); c.arc(460, 130, 24, -1.6, 1.2); c.stroke(); PILL(c, 'ear', 460, 196, 16, '#2B3040');
    for (let i = 0; i < 14; i++) C(c, '#8A6A4A', 170 + i * 20 + ((i % 2) ? 2 : -2) * (i % 4), 250 + (i % 3) * 8, 3); T(c, 'squashed', 220, 232, 13, '#8A4A2A'); T(c, 'stretched', 330, 232, 13, '#8A4A2A'); PILL(c, 'sound is a wave of squashed and stretched air', 260, 286, 14, '#2B3040');
  };
  P.planets = function(c, w, h){                                      /* the eight planets in order, names clear of the edges and of each other */
    STARS(c, w, h, 40); const pl = [[44, 9, '#C9CDD9', 'Mercury', 0], [98, 14, '#E8C888', 'Venus', 1], [154, 15, '#4A8AD8', 'Earth', 0], [208, 11, '#D85A3A', 'Mars', 1], [272, 34, '#E8B070', 'Jupiter', 0], [364, 26, '#EAD8A0', 'Saturn', 1], [436, 16, '#8EDDEA', 'Uranus', 0], [482, 15, '#4A5AD8', 'Neptune', 1]];
    pl.forEach(function(p){ const y = 150; if (p[3] === 'Saturn'){ c.save(); c.translate(p[0], y); c.rotate(-0.3); c.strokeStyle = 'rgba(232,210,150,.9)'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, p[1] * 1.9, p[1] * 0.5, 0, 0, 7); c.stroke(); c.restore(); } C(c, p[2], p[0], y, p[1]); if (p[3] === 'Jupiter'){ L(c, 'rgba(160,100,50,.5)', 4, p[0] - 30, y - 8, p[0] + 30, y - 8); L(c, 'rgba(160,100,50,.5)', 4, p[0] - 32, y + 10, p[0] + 32, y + 10); } if (p[3] === 'Earth') E(c, '#6BBB45', p[0] - 3, y - 2, 6, 4, 0.5);
      T(c, p[3], p[0], p[4] ? 236 : 70, 15, '#E8ECF8'); L(c, 'rgba(255,255,255,.25)', 1, p[0], p[4] ? 224 : 80, p[0], p[4] ? y + p[1] + 16 : y - p[1] - 16); });
    T(c, 'in order from the Sun', 260, 284, 15, '#9AA8D8');
  };
  P.solar = function(c, w, h){                                        /* the Sun and its planets along their orbits (not to scale) */
    STARS(c, w, h); const g = c.createRadialGradient(0, 150, 10, 0, 150, 96); g.addColorStop(0, '#FFE27A'); g.addColorStop(1, '#F2862A'); c.fillStyle = g; c.beginPath(); c.arc(0, 150, 94, 0, 7); c.fill();
    [[118, 4, '#C9CDD9'], [150, 7, '#E8C888'], [186, 7, '#4A8AD8'], [224, 5, '#D85A3A'], [290, 22, '#E8B070'], [366, 18, '#EAD8A0'], [424, 12, '#8EDDEA'], [480, 11, '#4A5AD8']].forEach(function(p, i){ c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 150, p[0], -1.2, 1.2); c.stroke(); const a = (i % 2 ? 0.5 : -0.5) * 0.5, px = Math.cos(a) * p[0], py = 150 + Math.sin(a) * p[0]; C(c, p[2], px, py, p[1]); });
    T(c, 'eight planets, one star', 300, 284, 17, '#E8ECF8'); T(c, 'rocky planets', 170, 70, 14, '#C8D0E8'); T(c, 'gas and ice giants', 390, 70, 14, '#C8D0E8'); L(c, 'rgba(255,255,255,.35)', 1.4, 252, 56, 252, 100);
  };
  P.map = function(c, w, h){                                          /* the continents, the equator and the prime meridian */
    G(c, w, h, '#8FC4E8', '#B8DCF2'); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; for (let i = 1; i < 9; i++){ c.beginPath(); c.moveTo(i * 58, 0); c.lineTo(i * 58, h); c.stroke(); } for (let j = 1; j < 6; j++){ c.beginPath(); c.moveTo(0, j * 50); c.lineTo(w, j * 50); c.stroke(); }
    const land = function(pts, col){ Pg(c, col || '#7ABA5A', pts); c.strokeStyle = '#4E8A3A'; c.lineWidth = 2; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.stroke(); };
    land([36, 48, 112, 36, 168, 56, 158, 98, 130, 118, 112, 140, 92, 118, 60, 96]); land([124, 152, 164, 150, 188, 176, 168, 232, 142, 262, 130, 210]); land([248, 58, 292, 52, 304, 80, 272, 96, 246, 86], '#8CC86A'); land([252, 104, 302, 102, 324, 142, 306, 192, 282, 226, 260, 182, 242, 134], '#D8B85A'); land([306, 50, 440, 44, 486, 84, 452, 126, 400, 132, 360, 112, 322, 98], '#8CC86A'); land([424, 186, 472, 180, 488, 210, 452, 232, 422, 216]); land([20, 278, 500, 278, 480, 296, 40, 296], '#F4F8FA'); E(c, '#F4F8FA', 214, 30, 20, 16);
    c.save(); c.setLineDash([8, 6]); L(c, '#C0392B', 3, 0, 150, w, 150); L(c, '#2B3040', 2.4, 232, 0, 232, h); c.restore();
    PILL(c, 'equator', 60, 170, 14, '#A02A20'); PILL(c, 'prime meridian', 232, 14, 12, '#2B3040');
    [['N. America', 98, 84], ['S. America', 150, 200], ['Europe', 274, 76], ['Africa', 280, 176], ['Asia', 396, 90], ['Australia', 454, 206], ['Antarctica', 130, 290]].forEach(function(l){ T(c, l[0], l[1], l[2], l[0] === 'Antarctica' ? 12 : 13, '#26401A'); });
    c.save(); c.translate(488, 38); L(c, '#2B3040', 3, 0, 18, 0, -18); Pg(c, '#2B3040', [0, -26, -6, -12, 6, -12]); T(c, 'N', 0, 36, 14, '#2B3040'); c.restore();
  };
  P.silk = function(c, w, h){                                         /* a camel caravan carrying silk one way and spices the other */
    G(c, w, h, '#FFE0B0', '#FFF4DC'); SUN(c, 470, 176, 24); R(c, '#E8C888', 0, 214, w, 86); Pg(c, '#D8A84A', [0, 220, 120, 150, 250, 220]); Pg(c, '#C2923A', [190, 220, 320, 140, 470, 220]); L(c, '#B8924A', 3, 0, 262, w, 246);
    const camel = function(x, y, s, col, flip){ c.save(); c.translate(x, y); c.scale(flip ? -s : s, s); E(c, '#B8803A', 0, -48, 30, 17); E(c, '#A06A28', -12, -66, 9, 11); E(c, '#A06A28', 8, -66, 9, 11); [[-18, 0], [-8, 4], [12, 0], [22, 4]].forEach(function(l){ L(c, '#8A5A22', 5, l[0], -38, l[0] + (l[1] ? 3 : -2), -2); }); L(c, '#B8803A', 8, 24, -58, 40, -84); E(c, '#B8803A', 48, -88, 12, 8, -0.2); C(c, '#2B2018', 52, -90, 1.6); L(c, '#8A5A22', 3, -30, -52, -38, -34); c.fillStyle = col; c.beginPath(); c.roundRect(-14, -66, 28, 20, 4); c.fill(); L(c, 'rgba(0,0,0,.25)', 2, -14, -56, 14, -56); c.restore(); };
    camel(110, 252, 1.0, '#D5352B'); camel(210, 256, 1.0, '#2E6AB8'); camel(320, 262, 1.05, '#F2B230', true); camel(420, 258, 1.0, '#3AA84A', true);
    T(c, 'silk went west, spices came east', 260, 34, 18, '#6A3A18'); ARROW(c, '#D5352B', 60, 66, 180, 66, 4); ARROW(c, '#3AA84A', 460, 94, 340, 94, 4); PILL(c, 'silk', 120, 90, 14, '#A02A20'); PILL(c, 'spices', 400, 118, 14, '#1E6A2A');
  };
  P.storm = function(c, w, h){                                        /* a storm over a house and a bending tree */
    G(c, w, h, '#2E3650', '#6A7488'); [[110, 60, 130, 38, '#3E4660'], [270, 50, 160, 44, '#2E364E'], [420, 74, 110, 36, '#3E4660']].forEach(function(e){ E(c, e[4], e[0], e[1], e[2], e[3]); });
    Pg(c, '#FFE84A', [270, 84, 240, 160, 262, 156, 236, 232, 300, 140, 276, 144, 304, 84]); L(c, '#FFF6A0', 3, 300, 130, 330, 170); L(c, '#FFF6A0', 2, 330, 170, 322, 190);
    for (let i = 0; i < 50; i++) L(c, 'rgba(190,215,245,.55)', 1.6, (i * 53) % w, 90 + (i * 31) % 160, (i * 53) % w - 8, 104 + (i * 31) % 160); R(c, '#223022', 0, 262, w, 38);
    R(c, '#7A5A3A', 70, 212, 84, 52); Pg(c, '#8A3A2A', [60, 214, 112, 176, 164, 214]); R(c, '#FFD060', 90, 228, 16, 18); R(c, '#4A2A1A', 126, 236, 16, 28); R(c, '#5A3A1C', 410, 190, 6, 74); c.strokeStyle = '#2E5A28'; c.lineWidth = 5; c.beginPath(); c.moveTo(413, 200); c.quadraticCurveTo(450, 180, 480, 196); c.moveTo(413, 214); c.quadraticCurveTo(380, 196, 360, 208); c.stroke(); L(c, 'rgba(255,255,255,.5)', 3, 330, 232, 380, 224); L(c, 'rgba(255,255,255,.4)', 3, 340, 246, 396, 238);
    T(c, 'thunder follows lightning', 260, 286, 15, '#E8ECF8');
  };


  /* ---- the older pictures, given more to look at ---- */
  P.pyramids = function(c, w, h){                                     /* the Giza pyramids with palms, a camel and a far, hazy third */
    G(c, w, h, '#FFD9A0', '#FFF0D0'); SUN(c, 440, 62, 26); R(c, '#E8C888', 0, 230, w, 70); for (let i = 0; i < 8; i++) E(c, 'rgba(180,140,70,.25)', 40 + i * 66, 250 + (i % 3) * 14, 36, 4);
    Pg(c, '#E0B060', [330, 236, 400, 160, 470, 236]); Pg(c, '#C9964A', [400, 160, 470, 236, 410, 236]);
    Pg(c, '#D8A84A', [60, 244, 200, 70, 340, 244]); Pg(c, '#C2923A', [200, 70, 340, 244, 220, 244]); for (let i = 1; i < 9; i++) L(c, 'rgba(120,80,20,.22)', 1.4, 60 + i * 12 + 4, 244 - i * 19, 340 - i * 12 - 4, 244 - i * 19);
    [[40, 250], [490, 258]].forEach(function(p){ L(c, '#6A4A2C', 4, p[0], p[1], p[0], p[1] - 40); [-0.7, -0.1, 0.5, 1.1].forEach(function(a){ L(c, '#3E8A2E', 3.5, p[0], p[1] - 40, p[0] + Math.cos(a - 1) * 24, p[1] - 40 + Math.sin(a - 1) * 14 + 10); }); });
    E(c, '#A06A28', 420, 262, 22, 10); L(c, '#8A5A22', 4, 408, 268, 408, 284); L(c, '#8A5A22', 4, 432, 268, 432, 284); L(c, '#A06A28', 6, 438, 258, 446, 238); C(c, '#A06A28', 450, 236, 6); C(c, '#A06A28', 414, 252, 6);
    T(c, 'about 4,500 years old', 260, 280, 15, '#6A3A18');
  };
  P.colosseum = function(c, w, h){                                    /* three tiers of arches, a flag and a crowd */
    SKY(c, w, h); R(c, '#C9B48A', 0, 252, w, 48); for (let i = 0; i < 9; i++) L(c, 'rgba(120,90,50,.25)', 2, 20 + i * 58, 270 + (i % 2) * 12, 50 + i * 58, 270 + (i % 2) * 12);
    c.fillStyle = '#D8C8A0'; c.beginPath(); c.ellipse(260, 190, 214, 78, 0, 0, 7); c.fill(); R(c, '#D8C8A0', 46, 116, 428, 74); c.fillStyle = '#C8B88E'; c.beginPath(); c.ellipse(260, 116, 214, 30, 0, 0, 7); c.fill(); c.fillStyle = '#9A8A64'; c.beginPath(); c.ellipse(260, 114, 196, 22, 0, 0, 7); c.fill();
    for (let t = 0; t < 3; t++){ R(c, 'rgba(120,100,60,.3)', 46, 138 + t * 38, 428, 3); for (let i = 0; i < 14; i++){ const x = 66 + i * 30; c.fillStyle = t === 2 ? '#6A5A3A' : '#4A3A24'; c.beginPath(); c.roundRect(x - 8, 146 + t * 38 - (t === 0 ? 16 : 0), 16, 28, [8, 8, 0, 0]); c.fill(); } }
    L(c, '#6A4A2C', 3, 260, 60, 260, 100); Pg(c, '#D5352B', [260, 60, 292, 70, 260, 82]); for (let i = 0; i < 16; i++) C(c, ['#F2B230', '#D5352B', '#4D9AE8', '#6BBB45'][i % 4], 60 + i * 26, 276 + (i % 2) * 8, 4); T(c, 'built in Rome, about 80 AD', 260, 22, 15, '#2B3040');
  };
  P.wall = function(c, w, h){                                         /* the Wall climbing the hills, with watchtowers and fires */
    G(c, w, h, '#DCE8F0', '#F4F8FA'); Pg(c, 'rgba(120,140,170,.35)', [0, 190, 90, 90, 190, 170, 290, 70, 400, 160, 520, 100, 520, 200, 0, 200]); Pg(c, '#8DBE5A', [0, 250, 0, 190, 130, 130, 260, 200, 380, 120, 520, 180, 520, 250]); Pg(c, 'rgba(60,100,30,.25)', [0, 250, 0, 200, 130, 142, 260, 212, 380, 132, 520, 192, 520, 250]); R(c, '#C9B48A', 0, 250, w, 50);
    c.strokeStyle = '#8A6A4A'; c.lineWidth = 16; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, 194); c.lineTo(130, 134); c.lineTo(260, 202); c.lineTo(380, 124); c.lineTo(520, 184); c.stroke(); c.strokeStyle = '#B8946A'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 190); c.lineTo(130, 130); c.lineTo(260, 198); c.lineTo(380, 120); c.lineTo(520, 180); c.stroke();
    [[60, 168], [130, 126], [200, 168], [260, 194], [380, 116], [450, 150]].forEach(function(p, i){ R(c, '#7A5A3A', p[0] - 12, p[1] - 28, 24, 30); R(c, '#5A3A1E', p[0] - 14, p[1] - 32, 28, 6); R(c, '#2A1A0E', p[0] - 4, p[1] - 20, 8, 12); if (i % 2) { E(c, 'rgba(255,170,60,.8)', p[0], p[1] - 40, 4, 7); } });
    for (let i = 0; i < 20; i++) C(c, 'rgba(70,110,40,.5)', (i * 71) % w, 232 + (i * 29) % 40, 5); PILL(c, 'thousands of kilometers long', 260, 282, 15, '#4A3A24');
  };
  P.ship = function(c, w, h){                                         /* a wooden sailing ship, waves, gulls and a sun */
    G(c, w, h, '#B8DCF2', '#E4F4FA'); SUN(c, 90, 58, 22); R(c, '#3A7AB8', 0, 196, w, 104); for (let i = 0; i < 14; i++) E(c, 'rgba(255,255,255,.45)', 20 + i * 38, 214 + (i % 3) * 22, 18, 3);
    [[330, 60], [364, 84], [400, 52]].forEach(function(p){ c.strokeStyle = '#FFFFFF'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(p[0] - 9, p[1]); c.quadraticCurveTo(p[0] - 4, p[1] - 7, p[0], p[1]); c.quadraticCurveTo(p[0] + 4, p[1] - 7, p[0] + 9, p[1]); c.stroke(); });
    Pg(c, '#8A5A2A', [130, 206, 400, 206, 370, 262, 160, 262]); R(c, '#6A3A18', 130, 206, 270, 8); for (let i = 0; i < 4; i++) C(c, '#2A1A0E', 190 + i * 46, 232, 6); Pg(c, '#8A5A2A', [400, 206, 440, 188, 424, 214]);
    L(c, '#5A3A18', 5, 230, 206, 230, 62); L(c, '#5A3A18', 5, 320, 206, 320, 76); Pg(c, '#F4F1E8', [234, 66, 300, 100, 234, 170]); Pg(c, '#F4F1E8', [324, 80, 372, 112, 324, 176]); Pg(c, '#D5352B', [234, 60, 262, 52, 234, 44]); L(c, '#D5352B', 3, 250, 108, 250, 126); L(c, '#D5352B', 3, 237, 117, 263, 117); L(c, '#8A7A60', 1.6, 230, 66, 130, 206); L(c, '#8A7A60', 1.6, 320, 80, 400, 206);
    for (let i = 0; i < 5; i++) E(c, 'rgba(255,255,255,.55)', 150 + i * 62, 268 + (i % 2) * 6, 26, 4);
  };
  P.moon = function(c, w, h){                                         /* the Earth, the Moon and the distance between them */
    STARS(c, w, h, 40); C(c, '#4A8AD8', 90, 160, 70); E(c, '#6BBB45', 70, 150, 26, 18, 0.3); E(c, '#6BBB45', 114, 190, 14, 10, 0.1); E(c, 'rgba(255,255,255,.5)', 110, 130, 30, 8); E(c, 'rgba(255,255,255,.4)', 60, 190, 22, 6);
    c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 1.4; c.setLineDash([5, 6]); c.beginPath(); c.ellipse(90, 160, 330, 120, 0, 0, 7); c.stroke(); c.setLineDash([]);
    C(c, '#D8D4C8', 410, 96, 36); [[398, 86, 8], [420, 108, 6], [404, 112, 5], [424, 82, 4]].forEach(function(k){ C(c, 'rgba(120,116,104,.55)', k[0], k[1], k[2]); });
    ARROW(c, '#FFD84D', 170, 160, 360, 118, 3); L(c, '#FFD84D', 3, 170, 160, 160, 162); T(c, 'Earth', 90, 252, 16, '#C8D0E8'); T(c, 'Moon', 410, 154, 16, '#C8D0E8'); PILL(c, 'about 384,000 km', 270, 168, 16, '#2B3040', 'rgba(255,248,220,.92)'); T(c, 'about 27 days for one orbit', 270, 270, 14, '#9AA8D8');
  };
  P.rocket = function(c, w, h){                                       /* a rocket lifting off its pad */
    STARS(c, w, h, 50); G(c, w, h, '#0A0E26', '#2A3A6A'); for (let i = 0; i < 40; i++) C(c, 'rgba(255,255,255,.7)', (i * 137) % w, (i * 71) % 190, 1 + (i % 3) * 0.4);
    R(c, '#5A5A66', 120, 270, 280, 30); R(c, '#3A3A46', 210, 252, 100, 18); R(c, '#7A7A86', 120, 270, 280, 4);
    [[200, 262], [320, 262]].forEach(function(p){ C(c, 'rgba(255,255,255,.35)', p[0], p[1], 30); C(c, 'rgba(255,255,255,.3)', p[0] + (p[0] < 260 ? -20 : 20), p[1] + 4, 24); });
    R(c, '#E8E4DC', 236, 56, 48, 150); R(c, '#C8C4BC', 268, 56, 16, 150); Pg(c, '#D5352B', [236, 56, 260, 8, 284, 56]); C(c, '#6BD6FF', 260, 104, 14); C(c, '#FFFFFF', 256, 100, 4); L(c, '#D5352B', 4, 236, 150, 284, 150); Pg(c, '#D5352B', [236, 166, 200, 218, 236, 206]); Pg(c, '#D5352B', [284, 166, 320, 218, 284, 206]);
    Pg(c, '#FFB830', [240, 206, 280, 206, 260, 262]); Pg(c, '#FFF0A0', [248, 206, 272, 206, 260, 240]);
    T(c, '3 · 2 · 1 · lift-off!', 410, 56, 20, '#FFD84D'); T(c, 'thrust pushes the rocket up', 410, 82, 13, '#C8D0E8'); T(c, 'the exhaust pushes down', 410, 100, 13, '#C8D0E8');
  };
  P.blackhole = function(c, w, h){                                    /* the dark center, its bright disk and the edge it cannot be seen past */
    STARS(c, w, h, 70); const cx = 260, cy = 140; c.save(); c.translate(cx, cy); c.rotate(-0.2); for (let i = 0; i < 7; i++){ c.strokeStyle = ['#FF6A3A', '#FF9A3A', '#FFC24A', '#FFE27A', '#D8D8F8', '#8A8AC8', '#5A5A98'][i]; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 150 - i * 12, 36 - i * 3, 0, 0, 7); c.stroke(); } c.restore();
    C(c, '#000000', cx, cy, 46); c.strokeStyle = 'rgba(160,180,255,.55)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.stroke();
    LEAD(c, cx + 52, cy - 8, 400, 52, '#FFFFFF'); T(c, 'event horizon', 408, 50, 16, '#E8ECF8', 'left'); T(c, 'nothing returns', 408, 68, 12, '#9AA8D8', 'left'); LEAD(c, cx - 120, cy + 22, 120, 232, '#FFFFFF'); T(c, 'glowing gas', 118, 238, 16, '#E8ECF8', 'right'); T(c, 'swirling in', 118, 256, 12, '#9AA8D8', 'right'); T(c, 'light cannot escape', 260, 282, 15, '#E8ECF8');
  };
  P.light = function(c, w, h){                                        /* a lamp, a prism and the spectrum */
    G(c, w, h, '#14183A', '#2A2A64'); R(c, '#5A5A66', 14, 118, 34, 44); Pg(c, '#FFE27A', [48, 126, 70, 120, 70, 160, 48, 154]); L(c, '#FFFFFF', 4, 70, 140, 222, 140); T(c, 'white light', 120, 120, 14, '#C8D0E8');
    Pg(c, '#7FD8FF', [224, 70, 224, 214, 292, 214]); Pg(c, 'rgba(255,255,255,.22)', [224, 70, 292, 214, 224, 214]); L(c, 'rgba(255,255,255,.7)', 2, 224, 70, 224, 214); L(c, 'rgba(255,255,255,.7)', 2, 224, 214, 292, 214); L(c, 'rgba(255,255,255,.5)', 2, 224, 70, 292, 214);
    ['#E8332A', '#F2862A', '#F2D830', '#6BBB45', '#3A8AC8', '#6A3AC8'].forEach(function(col, i){ L(c, col, 5, 262, 160, 490, 100 + i * 22); });
    T(c, 'red', 500, 100, 13, '#E8332A', 'right'); T(c, 'violet', 500, 218, 13, '#9A6AE8', 'right'); T(c, 'white light splits into colors', 260, 282, 16, '#E8ECF8');
  };
  P.angles = function(c, w, h){                                       /* three angles with their sizes beside the arcs */
    G(c, w, h, '#F0F6FF', '#FFFFFF'); [[100, 'acute', 40, 'less than 90'], [260, 'right', 90, 'exactly 90'], [420, 'obtuse', 130, 'more than 90']].forEach(function(a){ const x = a[0] - 56, y = 190, r = a[2] * Math.PI / 180; L(c, '#2B3040', 4, x, y, x + 116, y); L(c, '#E85D4A', 5, x, y, x + Math.cos(-r) * 106, y + Math.sin(-r) * 106);
      c.strokeStyle = '#4D9AE8'; c.lineWidth = 4; c.beginPath(); if (a[2] === 90){ c.rect(x, y - 24, 24, 24); } else c.arc(x, y, 32, -r, 0); c.stroke(); T(c, a[2] + '°', x + 56 + (a[2] > 90 ? 6 : 0), 62, 28, '#2E6AB8'); T(c, a[1], a[0], 236, 20, '#2B3040'); T(c, a[3], a[0], 258, 13, '#6A6A7A'); });
  };

  P.percent = function(c, w, h){                                      /* 20 percent of 70: ten equal parts, two of them chosen */
    G(c, w, h, '#FFF2F6', '#FFFFFF'); T(c, '20% of 70', 260, 44, 28, '#A02A20');
    for (let i = 0; i < 10; i++){ const x = 30 + i * 46, on = i < 2; c.fillStyle = on ? '#E85D4A' : '#F4D8D4'; c.beginPath(); c.roundRect(x, 90, 42, 56, 6); c.fill(); T(c, '7', x + 21, 126, 22, on ? '#FFFFFF' : '#A08A86'); }
    c.strokeStyle = '#2B3040'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, 160); c.lineTo(490, 160); c.stroke(); T(c, 'the whole is 70, split into 10 parts of 7', 260, 188, 16, '#2B3040');
    c.beginPath(); c.moveTo(30, 154); c.lineTo(30, 166); c.moveTo(490, 154); c.lineTo(490, 166); c.stroke(); c.strokeStyle = '#E85D4A'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 76); c.lineTo(120, 76); c.stroke();
    PILL(c, '10% = 7', 90, 222, 18, '#2B3040'); PILL(c, '20% = 7 + 7 = 14', 300, 222, 18, '#A02A20'); T(c, 'divide by 10 for 10%, then double it for 20%', 260, 272, 15, '#6A6A7A');
  };
  /* ---- pictures for the later lectures ---- */
  P.necking = function(c, w, h){                                      /* two males swinging their necks */
    SKY(c, w, h); GRASS(c, w, h, 240); GIR(c, 130, 270, 1.15, { bow: 0.5 }); c.save(); c.translate(520, 0); c.scale(-1, 1); GIR(c, 130, 270, 1.15, { bow: 0.5, coat: '#D8A02C' }); c.restore();
    c.strokeStyle = 'rgba(232,93,74,.8)'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < 3; i++){ c.beginPath(); c.arc(260, 190, 40 + i * 14, 3.6, 5.8); c.stroke(); } PILL(c, 'necking', 260, 54, 22, '#A02A20'); PILL(c, 'the neck is the club', 260, 90, 15, '#2B3040');
  };
  P.rocks = function(c, w, h){                                        /* igneous, sedimentary and metamorphic samples */
    G(c, w, h, '#F4EEE0', '#FFFFFF'); [[90, '#8A8A92', 'igneous', 'cooled from magma'], [260, '#C9A26A', 'sedimentary', 'settled in layers'], [430, '#7A6A88', 'metamorphic', 'heat and pressure']].forEach(function(r, i){ const x = r[0]; c.save(); c.beginPath(); c.roundRect(x - 68, 46, 136, 120, 28); c.clip(); R(c, r[1], x - 68, 46, 136, 120);
      if (i === 0) for (let k = 0; k < 40; k++) C(c, ['#F4F0E8', '#2E2E36', '#D8B0A0'][k % 3], x - 60 + (k * 37) % 120, 54 + (k * 53) % 104, 2 + k % 3);
      if (i === 1) for (let k = 0; k < 6; k++) R(c, ['#D8B87A', '#B8925A', '#E4C890'][k % 3], x - 68, 50 + k * 20, 136, 12);
      if (i === 2){ c.strokeStyle = '#E8DCF0'; c.lineWidth = 5; for (let k = 0; k < 5; k++){ c.beginPath(); c.moveTo(x - 68, 62 + k * 22); c.bezierCurveTo(x - 30, 40 + k * 22, x + 20, 90 + k * 22, x + 68, 58 + k * 22); c.stroke(); } } c.restore(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.beginPath(); c.roundRect(x - 68, 46, 136, 120, 28); c.stroke(); T(c, r[2], x, 200, 19, '#2B3040'); T(c, r[3], x, 224, 12, '#6A6A7A'); });
    T(c, 'granite', 90, 258, 14, '#6A6A7A'); T(c, 'sandstone', 260, 258, 14, '#6A6A7A'); T(c, 'marble', 430, 258, 14, '#6A6A7A'); ARROW(c, '#8A8AAA', 172, 106, 192, 106, 3); ARROW(c, '#8A8AAA', 342, 106, 362, 106, 3);
  };
  P.greenhouse = function(c, w, h){                                   /* sunlight in, heat bounced back by the gas layer */
    G(c, w, h, '#0E1230', '#7AB8E8'); for (let i = 0; i < 20; i++) C(c, 'rgba(255,255,255,.7)', (i * 83) % w, (i * 37) % 60, 1.1); SUN(c, 70, 50, 22);
    c.fillStyle = '#3E7ACB'; c.beginPath(); c.ellipse(260, 360, 330, 130, 0, 0, 7); c.fill(); c.fillStyle = '#6EA84A'; c.beginPath(); c.ellipse(190, 316, 120, 56, 0, 0, 7); c.fill();
    for (let i = 0; i < 18; i++) C(c, 'rgba(255,248,200,.55)', 40 + i * 28, 138 + (i % 2) * 6, 7);
    ARROW(c, '#FFD84D', 100, 76, 190, 220, 5); ARROW(c, '#FFD84D', 134, 66, 234, 214, 5); ARROW(c, '#F2862A', 300, 224, 330, 154, 4); ARROW(c, '#F2862A', 360, 232, 386, 160, 4); ARROW(c, '#E85D4A', 330, 134, 300, 220, 3); ARROW(c, '#F2862A', 440, 236, 450, 40, 3);
    PILL(c, 'light comes in', 128, 120, 14, '#8A6A10'); PILL(c, 'heat is trapped', 420, 196, 14, '#A02A20'); PILL(c, 'a little escapes', 440, 22, 13, '#A02A20'); PILL(c, 'CO₂ and methane', 330, 118, 13, '#2B3040');
  };
  P.body = function(c, w, h){                                         /* some of the main organs */
    G(c, w, h, '#EEF4F8', '#FFFFFF'); c.fillStyle = '#F2D8C0'; c.beginPath(); c.arc(170, 52, 30, 0, 7); c.fill(); c.beginPath(); c.roundRect(122, 88, 96, 150, 30); c.fill(); R(c, '#F2D8C0', 112, 100, 14, 90); R(c, '#F2D8C0', 214, 100, 14, 90); R(c, '#F2D8C0', 134, 220, 30, 70); R(c, '#F2D8C0', 176, 220, 30, 70);
    E(c, '#E8A0C0', 170, 44, 18, 14); [[148, 118], [192, 118]].forEach(function(p, i){ E(c, '#E88080', p[0], p[1], 14, 24, i ? -0.1 : 0.1); }); E(c, '#D5352B', 168, 134, 11, 13, 0.3); E(c, '#E8A040', 186, 164, 22, 12, -0.3); c.strokeStyle = '#C97A8A'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 186); c.bezierCurveTo(190, 176, 150, 200, 190, 206); c.bezierCurveTo(150, 214, 190, 224, 160, 226); c.stroke();
    [['brain', 'thinks and sends messages', 188, 44, 30], ['lungs', 'take in oxygen', 206, 116, 86], ['heart', 'pumps the blood', 172, 134, 142], ['stomach', 'starts digesting food', 204, 164, 198], ['intestines', 'absorb the nutrients', 186, 210, 254]].forEach(function(l){ LEAD(c, l[2], l[3], 272, l[4], '#2B3040'); T(c, l[0], 282, l[4] + 5, 18, '#2B3040', 'left'); T(c, l[1], 282, l[4] + 22, 12, '#5A6A7A', 'left'); });
  };
  P.finches = function(c, w, h){                                      /* four beaks, each shaped for its food */
    G(c, w, h, '#DDF0F8', '#F4FAFC'); R(c, '#6A4A2C', 0, 250, w, 12); [[70, 'thick', 'cracks seeds'], [190, 'thin', 'picks insects'], [320, 'curved', 'probes cactus'], [440, 'small', 'eats fruit']].forEach(function(b, i){ const x = b[0]; E(c, '#8A6A3A', x, 168, 38, 30); C(c, '#8A6A3A', x + 16, 130, 26); C(c, '#2B2018', x + 22, 124, 3.6); E(c, '#B8944A', x, 176, 26, 16); Pg(c, '#5A3A18', [x - 34, 168, x - 62, 184, x - 30, 184]); L(c, '#C09040', 3, x - 8, 196, x - 8, 250); L(c, '#C09040', 3, x + 8, 196, x + 8, 250);
      if (i === 0) Pg(c, '#3A2A1A', [x + 36, 122, x + 62, 136, x + 36, 150]); if (i === 1) Pg(c, '#3A2A1A', [x + 40, 128, x + 78, 134, x + 40, 138]); if (i === 2){ c.fillStyle = '#3A2A1A'; c.beginPath(); c.moveTo(x + 38, 122); c.quadraticCurveTo(x + 74, 126, x + 78, 154); c.lineTo(x + 70, 150); c.quadraticCurveTo(x + 62, 134, x + 38, 138); c.fill(); } if (i === 3) Pg(c, '#3A2A1A', [x + 38, 126, x + 54, 136, x + 38, 144]);
      T(c, b[1] + ' beak', x, 60, 17, '#2B3040'); T(c, b[2], x, 82, 13, '#4A5A6A'); L(c, 'rgba(0,0,0,.25)', 1.4, x + 44, 92, x + 44, 116); });
    [[84, 280, '#6A4A2C'], [200, 280, '#7A9A4A'], [330, 280, '#4E9A3A'], [450, 280, '#D8503A']].forEach(function(f, i){ C(c, f[2], f[0], f[1], 8 + (i === 3 ? 3 : 0)); });
  };
  P.reaction = function(c, w, h){                                     /* reactants, a change, products, and the signs to look for */
    G(c, w, h, '#EEF4FA', '#FFFFFF'); const fl = function(x, y, col, lvl){ c.fillStyle = 'rgba(200,225,245,.55)'; c.strokeStyle = '#8A9AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 10, y - 50); c.lineTo(x + 10, y - 50); c.lineTo(x + 10, y - 22); c.lineTo(x + 36, y + 22); c.quadraticCurveTo(x + 40, y + 34, x + 26, y + 34); c.lineTo(x - 26, y + 34); c.quadraticCurveTo(x - 40, y + 34, x - 36, y + 22); c.lineTo(x - 10, y - 22); c.closePath(); c.fill(); c.stroke(); c.save(); c.clip(); R(c, col, x - 44, y + lvl, 90, 60); c.restore(); };
    fl(60, 120, '#4D9AE8', 4); fl(150, 120, '#F2B230', 4); T(c, '+', 105, 124, 28, '#2B3040'); ARROW(c, '#2B3040', 210, 120, 280, 120, 5); fl(350, 120, '#6BBB45', 0); [[336, 96, 5], [356, 84, 4], [346, 70, 6], [362, 104, 3]].forEach(function(b){ DOT(c, '#FFFFFF', b[0], b[1], b[2]); });
    T(c, 'reactants', 105, 190, 16, '#2B3040'); T(c, 'products', 350, 190, 16, '#2B3040'); T(c, 'atoms are rearranged', 245, 98, 13, '#6A6A7A');
    [['bubbles', 62], ['color change', 192], ['heat or light', 322], ['new solid', 438]].forEach(function(s, i){ PILL(c, s[0], s[1] + 20, 252, 14, '#2B3040', '#EAF0F8'); }); T(c, 'signs of a reaction', 260, 222, 14, '#6A6A7A');
    [[62, 240, '#FFFFFF'], [192, 240, '#E85D4A'], [322, 240, '#F2B230'], [438, 240, '#8A8A92']].forEach(function(s){ C(c, s[2], s[0] + 20, 238, 5); });
  };
  P.circuit = function(c, w, h){                                      /* battery, wires, switch and a lit bulb, with the three words that matter */
    G(c, w, h, '#EEF2F8', '#FFFFFF'); c.strokeStyle = '#2B3040'; c.lineWidth = 5; c.lineJoin = 'round'; c.strokeRect(70, 70, 330, 160);
    R(c, '#EEF2F8', 62, 130, 18, 40); R(c, '#2B3040', 56, 138, 30, 6); R(c, '#2B3040', 63, 154, 16, 12); T(c, '+', 100, 146, 20, '#C0392B'); T(c, 'battery', 28, 154, 13, '#2B3040');
    R(c, '#EEF2F8', 400 - 20, 90, 40, 80); C(c, '#FFF3A0', 400, 130, 26); E(c, 'rgba(255,230,90,.35)', 400, 130, 44, 44); c.strokeStyle = '#B8902A'; c.lineWidth = 3; c.beginPath(); c.moveTo(390, 150); c.lineTo(392, 126); c.lineTo(400, 136); c.lineTo(408, 126); c.lineTo(410, 150); c.stroke(); for (let i = 0; i < 8; i++){ const a = i * Math.PI / 4; L(c, 'rgba(255,220,60,.8)', 3, 400 + Math.cos(a) * 36, 130 + Math.sin(a) * 36, 400 + Math.cos(a) * 46, 130 + Math.sin(a) * 46); } T(c, 'bulb', 462, 134, 14, '#2B3040');
    R(c, '#EEF2F8', 200, 222, 90, 16); DOT(c, '#2B3040', 206, 230, 5); DOT(c, '#2B3040', 284, 230, 5); L(c, '#2B3040', 5, 206, 230, 284, 230); T(c, 'switch (closed)', 245, 262, 14, '#2B3040');
    [[150, 62, 190, 62], [300, 62, 340, 62]].forEach(function(a){ ARROW(c, '#E85D4A', a[0], a[1], a[2], a[3], 4); }); PILL(c, 'current flows round the loop', 245, 40, 14, '#A02A20');
    PILL(c, 'voltage = the push', 240, 110, 15, '#1A5A98'); PILL(c, 'resistance = hard to flow', 240, 150, 15, '#5A3A98');
  };
  P.equation = function(c, w, h){                                     /* a balance with x + 4 on one side and 9 on the other */
    G(c, w, h, '#F4FAF4', '#FFFFFF'); L(c, '#6A4A2C', 8, 260, 90, 260, 250); R(c, '#6A4A2C', 200, 250, 120, 14); L(c, '#6A4A2C', 8, 110, 90, 410, 90); C(c, '#F2B230', 260, 90, 12);
    [[110, 'x + 4'], [410, '9']].forEach(function(p, i){ L(c, '#8A6A3A', 2, p[0], 90, p[0] - 56, 160); L(c, '#8A6A3A', 2, p[0], 90, p[0] + 56, 160); c.fillStyle = '#C9A26A'; c.beginPath(); c.ellipse(p[0], 162, 66, 12, 0, 0, Math.PI); c.fill(); c.strokeStyle = '#8A6A3A'; c.lineWidth = 3; c.beginPath(); c.ellipse(p[0], 160, 66, 8, 0, 0, 7); c.stroke(); });
    R(c, '#4D9AE8', 66, 110, 46, 46); T(c, 'x', 89, 144, 28, '#FFFFFF'); for (let i = 0; i < 4; i++) R(c, '#F2B230', 118 + (i % 2) * 22, 134 - Math.floor(i / 2) * 22, 20, 20);
    for (let i = 0; i < 9; i++) R(c, '#F2B230', 366 + (i % 3) * 24, 138 - Math.floor(i / 3) * 24, 22, 22);
    PILL(c, 'x + 4 = 9', 260, 36, 24, '#1E4A8A'); PILL(c, 'take 4 from each side', 130, 214, 15, '#2B3040'); PILL(c, 'x = 5', 260, 290, 28, '#1E6A2A'); T(c, 'do the same to both sides', 392, 218, 14, '#6A6A7A');
  };
  P.lifecycle = function(c, w, h){                                    /* from a cloud of gas to the end of a star */
    STARS(c, w, h, 60); [['nebula', 54, '#8A6AD8'], ['young star', 148, '#FFE27A'], ['red giant', 252, '#E8503A'], ['white dwarf', 354, '#E8F0FF'], ['supernova', 458, '#FF9A3A']].forEach(function(s, i){ const x = s[1];
      if (i === 0){ for (let k = 0; k < 16; k++) C(c, 'rgba(160,120,240,' + (0.15 + (k % 4) * 0.06) + ')', x - 20 + (k * 17) % 44, 120 + (k * 29) % 56, 14 + k % 3 * 4); } else if (i === 4){ for (let k = 0; k < 12; k++){ const a = k * Math.PI / 6; L(c, '#FFD060', 3, x + Math.cos(a) * 14, 150 + Math.sin(a) * 14, x + Math.cos(a) * 38, 150 + Math.sin(a) * 38); } C(c, '#FFF4B0', x, 150, 14); } else { C(c, i === 1 ? 'rgba(255,226,122,.3)' : 'rgba(255,255,255,.12)', x, 150, i === 2 ? 50 : 30); C(c, s[2], x, 150, i === 2 ? 36 : i === 3 ? 9 : 18); }
      T(c, s[0], x, 232, 15, '#E8ECF8'); if (i < 4) ARROW(c, 'rgba(255,255,255,.7)', x + 44, 150, x + 62, 150, 3); });
    T(c, 'a star lives for millions to billions of years', 260, 42, 16, '#E8ECF8'); T(c, 'the Sun is here', 148, 100, 13, '#FFE27A'); L(c, '#FFE27A', 1.6, 148, 106, 148, 126); T(c, 'big stars end in a supernova', 260, 276, 14, '#9AA8D8');
  };
  P.explorer = function(c, w, h){                                     /* a voyage west across the ocean */
    G(c, w, h, '#9AD0F0', '#D8EEF8'); Pg(c, '#7ABA5A', [0, 40, 70, 30, 96, 90, 70, 130, 50, 170, 0, 190]); Pg(c, '#7ABA5A', [440, 10, 520, 10, 520, 270, 480, 240, 456, 190, 470, 150, 440, 100]); Pg(c, '#D8B85A', [0, 190, 50, 170, 60, 220, 20, 260, 0, 260]);
    for (let i = 0; i < 10; i++) L(c, 'rgba(255,255,255,.6)', 2, 130 + i * 30, 150 + (i % 3) * 40, 150 + i * 30, 150 + (i % 3) * 40);
    c.save(); c.setLineDash([8, 7]); c.strokeStyle = '#C0392B'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(78, 126); c.quadraticCurveTo(250, 160, 440, 134); c.stroke(); c.restore(); ARROW(c, '#C0392B', 400, 140, 440, 134, 4);
    c.save(); c.translate(250, 150); R(c, '#8A5A2A', -28, 0, 56, 14); Pg(c, '#8A5A2A', [-34, 0, 34, 0, 24, 14, -24, 14]); L(c, '#5A3A18', 4, 0, 0, 0, -50); Pg(c, '#F4F1E8', [2, -48, 28, -14, 2, -12]); Pg(c, '#F4F1E8', [-2, -44, -22, -14, -2, -12]); Pg(c, '#D5352B', [0, -50, 12, -46, 0, -42]); c.restore();
    PILL(c, 'Spain', 50, 28, 15, '#2B3040'); PILL(c, 'the Caribbean', 462, 282, 13, '#2B3040'); PILL(c, '1492', 250, 62, 24, '#A02A20'); PILL(c, 'sailing west to reach Asia', 250, 110, 14, '#2B3040');
  };
  P.egypt = function(c, w, h){                                        /* the Nile winding through the desert, pyramids behind, a sailboat on it */
    G(c, w, h, '#FFD9A0', '#FFF0D0'); SUN(c, 70, 52, 24); R(c, '#E8C888', 0, 140, w, 160); Pg(c, '#D8A84A', [230, 150, 340, 40, 450, 150]); Pg(c, '#C2923A', [340, 40, 450, 150, 360, 150]); Pg(c, '#D8A84A', [120, 150, 190, 84, 260, 150]); Pg(c, '#C2923A', [190, 84, 260, 150, 200, 150]);
    c.strokeStyle = '#6EA84A'; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 300); c.bezierCurveTo(130, 250, 330, 230, 290, 190); c.bezierCurveTo(260, 170, 400, 160, 470, 150); c.stroke(); c.strokeStyle = '#3E7ACB'; c.lineWidth = 26; c.beginPath(); c.moveTo(150, 300); c.bezierCurveTo(130, 250, 330, 230, 290, 190); c.bezierCurveTo(260, 170, 400, 160, 470, 150); c.stroke(); L(c, 'rgba(255,255,255,.4)', 2, 170, 276, 190, 266);
    [[60, 200], [90, 232], [450, 232]].forEach(function(p){ L(c, '#6A4A2C', 4, p[0], p[1], p[0], p[1] - 34); [-0.8, -0.2, 0.5, 1.1].forEach(function(a){ L(c, '#3E8A2E', 3, p[0], p[1] - 34, p[0] + Math.cos(a - 1) * 20, p[1] - 34 + Math.sin(a - 1) * 14 + 8); }); });
    c.save(); c.translate(238, 242); Pg(c, '#8A5A2A', [-22, 0, 22, 0, 14, 9, -14, 9]); L(c, '#5A3A18', 3, 0, 0, 0, -28); Pg(c, '#F4F1E8', [1, -27, 18, -6, 1, -4]); c.restore();
    PILL(c, 'the Nile', 330, 262, 20, '#1A4A8A'); T(c, 'a flood each year left rich soil', 330, 288, 13, '#6A4A2A'); PILL(c, 'pharaohs built pyramids', 300, 24, 15, '#6A3A18');
  };

  /* every picture gets a little paper grain and a soft edge, so the flat shapes feel printed rather than pasted */
  Object.keys(P).forEach(function(k){
    const f = P[k];
    P[k] = function(c, w, h, col){
      f.call(this, c, w, h, col);
      c.save();
      for (let i = 0; i < 160; i++){ c.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(40,30,20,.05)'; c.fillRect((i * 7919) % w, (i * 104729) % h, 2, 2); }
      const g = c.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,20,10,.16)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.restore();
    };
  });
  return P;
})();
