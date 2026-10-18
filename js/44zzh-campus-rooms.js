'use strict';
/* =============================================================================================================================
   44zzh-campus-rooms.js  --  LONGNECK UNIVERSITY, the six rooms: the walls (IV_ROOMS.uhall, ulecture, ulibrary, uhw, uexam, ucafe) and
   every piece of furniture (UNI_FURN, by the 'u_' kind of the building that stands for it). Pure drawing; the doors and what they do are
   in 44zze, the street in 44zzg. Furniture stands on the floor line TG, as in the gym: nothing hangs in the air.
   The generic curtained windows are switched off here: each room paints its own windows, because a library does not want curtains.
   ============================================================================================================================= */
(function(){
  const K = window.townDetailKit;
  const GOLD = '#E3B94A', CREAM = '#F3EAD2', WOOD = '#7A5230', WOOD_D = '#5A3A1E', WOOD_L = '#9A6A3E', STONE = '#D9CFB6', SLATE = '#2F3F38';
  const ROOMS = window.UNI_ROOMS = { uhall: 1, ulecture: 1, ulibrary: 1, uhw: 1, uexam: 1, ucafe: 1 };
  const FC = function(id){ const F = UNI_BY_ID[id]; return F ? F.col : '#6A7A9A'; };

  /* ---------- parts ---------- */
  const ln = function(c, col, w, x1, y1, x2, y2){ ivLine(c, col, w, x1, y1, x2, y2); };
  function archTop(c, col, x, y, w, h){ c.fillStyle = col; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.fill(); }
  function tallWindow(c, x, y, w, h, sky){                                          /* an arched window with a sky, a stone frame, glazing bars and a sill */
    archTop(c, '#9A8F76', x - 8, y - 8, w + 16, h + 12); archTop(c, sky || '#A8D4F0', x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x + 4, y + h); c.lineTo(x + 4, y + w / 2); c.arc(x + w * 0.3, y + w / 2, w * 0.26, Math.PI, 0); c.lineTo(x + w * 0.56, y + h); c.fill();
    tEll(c, 'rgba(255,255,255,.5)', x + w * 0.62, y + h * 0.4, w * 0.18, 5); tEll(c, 'rgba(255,255,255,.4)', x + w * 0.4, y + h * 0.5, w * 0.14, 4);
    c.strokeStyle = 'rgba(70,55,35,.7)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); for (let k = 1; k < 4; k++){ c.moveTo(x, y + h * k / 4 + w / 4); c.lineTo(x + w, y + h * k / 4 + w / 4); } c.stroke();
    tRect(c, '#B8AE96', x - 12, y + h, w + 24, 7); tRect(c, 'rgba(0,0,0,.18)', x - 12, y + h + 6, w + 24, 2); tRect(c, 'rgba(255,255,255,.3)', x - 12, y + h, w + 24, 1.5);
  }
  function rosette(c, x, y, r, col){                                                 /* a round stained-glass window */
    tCircle(c, '#5A4A32', x, y, r + 7); tCircle(c, '#2A2420', x, y, r + 2);
    for (let i = 0; i < 12; i++){ const a0 = i * TAU / 12; c.fillStyle = i % 3 === 0 ? col : i % 3 === 1 ? '#FFE9A0' : '#F6D7A0'; c.globalAlpha = 0.9; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, a0, a0 + TAU / 12); c.closePath(); c.fill(); }
    c.globalAlpha = 1; c.strokeStyle = '#2A2420'; c.lineWidth = 2; for (let i = 0; i < 12; i++){ const a = i * TAU / 12; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
    c.beginPath(); c.arc(x, y, r * 0.55, 0, TAU); c.stroke(); tCircle(c, '#2A2420', x, y, 4); tCircle(c, col, x, y, 2.4);
    c.save(); c.globalAlpha = 0.14; tPoly(c, col, [x - r * 0.6, y + r, x + r * 0.6, y + r, x + r * 1.5, TG - 12, x - r * 0.2, TG - 12]); c.restore();     /* its coloured light on the floor, faint */
  }
  function wallClock(c, x, y, r, hh, mm){
    tCircle(c, WOOD_D, x, y, r + 5); tCircle(c, '#FBF6E6', x, y, r);
    for (let i = 0; i < 12; i++){ const a = i * TAU / 12, l = i % 3 ? 3 : 6; ln(c, '#2B3040', i % 3 ? 1 : 2, x + Math.sin(a) * (r - 1), y - Math.cos(a) * (r - 1), x + Math.sin(a) * (r - l), y - Math.cos(a) * (r - l)); }
    const ah = (hh % 12 + mm / 60) * TAU / 12, am = mm * TAU / 60; ln(c, '#2B3040', 3, x, y, x + Math.sin(ah) * r * 0.5, y - Math.cos(ah) * r * 0.5); ln(c, '#2B3040', 2, x, y, x + Math.sin(am) * r * 0.8, y - Math.cos(am) * r * 0.8); tCircle(c, '#B8342A', x, y, 2.4);
  }
  function crestWall(c, x, y, s){ c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#2B3A5A'; c.beginPath(); c.moveTo(-18, -22); c.lineTo(18, -22); c.lineTo(18, 4); c.quadraticCurveTo(18, 20, 0, 28); c.quadraticCurveTo(-18, 20, -18, 4); c.closePath(); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 2.6; c.stroke(); c.fillStyle = '#F6E7B8'; c.beginPath(); c.moveTo(-12, 2); c.lineTo(0, 6); c.lineTo(12, 2); c.lineTo(12, 13); c.lineTo(0, 17); c.lineTo(-12, 13); c.closePath(); c.fill(); c.strokeStyle = '#8A6A2A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, 17); c.stroke(); c.fillStyle = '#E8A93C'; c.fillRect(-2.6, -18, 5.2, 19); c.beginPath(); c.ellipse(1, -19, 7, 4.4, -0.3, 0, TAU); c.fill(); c.restore(); }
  function bunting(c, x1, x2, y, sag, cols){
    c.strokeStyle = 'rgba(40,30,20,.6)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x1, y); c.quadraticCurveTo((x1 + x2) / 2, y + sag * 2, x2, y); c.stroke();
    const n = Math.floor((x2 - x1) / 34);
    for (let i = 0; i <= n; i++){ const t = i / n, bx = x1 + (x2 - x1) * t, by = y + sag * 2 * t * (1 - t) * 1; tPoly(c, cols[i % cols.length], [bx - 10, by, bx + 10, by, bx, by + 24]); tPoly(c, 'rgba(255,255,255,.2)', [bx - 10, by, bx - 2, by, bx - 4, by + 12]); }
  }
  function pinned(c, x, y, w, h, col, lines, rot){ c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot || 0); tRect(c, 'rgba(0,0,0,.2)', -w / 2 + 1.5, -h / 2 + 2.5, w, h); tRect(c, col, -w / 2, -h / 2, w, h); for (let k = 0; k < lines; k++) tRect(c, 'rgba(60,60,80,.45)', -w / 2 + 4, -h / 2 + 9 + k * 5, w - 8 - (k % 3) * 6, 1.6); tCircle(c, '#D5352B', 0, -h / 2 + 3, 2); c.restore(); }
  function chalkLines(c, x, y, w, h, seed, col){ const r = miniRng(seed); c.strokeStyle = col || 'rgba(255,255,255,.75)'; c.lineWidth = 1.6; c.lineCap = 'round'; for (let k = 0; k < Math.floor(h / 14); k++){ const lx = x + 8 + r() * 10, len = (w - 30) * (0.3 + r() * 0.6); c.beginPath(); c.moveTo(lx, y + 10 + k * 14); for (let s = 0; s < len; s += 9) c.lineTo(lx + s, y + 10 + k * 14 + (r() - 0.5) * 3); c.stroke(); } }
  function lamp(c, x, y, len, col){ ln(c, '#2A2A30', 2, x, 34, x, y); tPoly(c, col || '#2F6A4A', [x - 20, y + 14, x + 20, y + 14, x + 10, y, x - 10, y]); tRect(c, 'rgba(255,255,255,.25)', x - 14, y + 2, 5, 10); c.save(); c.globalAlpha = 0.2; tPoly(c, '#FFE9A0', [x - 18, y + 14, x + 18, y + 14, x + (len || 70), TG - 20, x - (len || 70), TG - 20]); c.restore(); tEll(c, '#FFE7A8', x, y + 15, 14, 3); }
  function rug(c, x0, w, col, edge){ tRect(c, 'rgba(0,0,0,.2)', x0, TG + 6, w, 46); tRect(c, col, x0 + 2, TG + 7, w - 4, 42); tRect(c, edge, x0 + 8, TG + 12, w - 16, 3); tRect(c, edge, x0 + 8, TG + 41, w - 16, 3); for (let x = x0 + 18; x < x0 + w - 18; x += 36) tPoly(c, 'rgba(255,255,255,.16)', [x, TG + 28, x + 8, TG + 20, x + 16, TG + 28, x + 8, TG + 36]); for (let i = 0; i < w / 8; i++){ tRect(c, edge, x0 + i * 8 + 1, TG + 49, 2, 5); tRect(c, edge, x0 + i * 8 + 1, TG + 3, 2, 4); } }
  function book(c, x, y, w, h, col){ ivBook(c, x, y, w, h, col); }
  function globe(c, x, y, r){ ln(c, '#4A3A2A', 3, x, y + r, x, y + r + 20); tRect(c, WOOD_D, x - 14, y + r + 18, 28, 4); c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r + 3, Math.PI * 0.7, Math.PI * 2.3); c.stroke(); tCircle(c, '#3A7AB8', x, y, r); c.fillStyle = '#6AB04A'; c.beginPath(); c.ellipse(x - r * 0.3, y - r * 0.2, r * 0.36, r * 0.46, 0.3, 0, TAU); c.ellipse(x + r * 0.4, y + r * 0.3, r * 0.26, r * 0.3, -0.5, 0, TAU); c.fill(); tCircle(c, 'rgba(255,255,255,.2)', x - r * 0.3, y - r * 0.4, r * 0.3); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(x, y, r, r * 0.3, 0, 0, TAU); c.stroke(); }

  /* ============================================================ THE WALLS ============================================================ */
  IV_ROOMS.uhall = function(c, D, K2){
    const W = D.w;
    [330, 1000, 1480, 2060, 2420, 2680].forEach(function(x, i){ tallWindow(c, x, 70, 54, 190); });
    bunting(c, 760, 2640, 52, 14, ['#E3B94A', '#2B3A5A', '#B8342A', '#3E8A5A', '#8A5AA8']);
    crestWall(c, 640, 130, 1.4); ln(c, '#2A2A30', 1.6, 640, 56, 640, 96);
    wallClock(c, 1580, 100, 28, 10, 10);
    /* the portraits of the old chancellors, framed, each a giraffe's head and a different collar */
    [[190, 120], [300, 150]].forEach(function(p, i){ ivFrame(c, p[0], p[1], 64, 84, function(c, x, y, w, h){ tRect(c, ['#C9D4B8', '#B8C4D8'][i], x, y, w, h); tRect(c, '#E8B23C', x + w / 2 - 4, y + 26, 8, 40); tEll(c, '#E8B23C', x + w / 2 + 1, y + 24, 12, 8); tRect(c, ['#2B3A5A', '#8A1F3A'][i], x + 6, y + h - 22, w - 12, 22); tRect(c, '#F4F1E8', x + w / 2 - 6, y + h - 24, 12, 8); tCircle(c, '#5A3A1A', x + w / 2 - 2, y + 22, 1.4); }); });
    [2300, 2560, 2760].forEach(function(x, i){ if (x > W - 120) return; ivFrame(c, x - 24, 300, 48, 60, function(c, x, y, w, h){ tRect(c, ['#F3EAD2', '#D8E6F0', '#E8D8C0'][i], x, y, w, h); tRect(c, FC(UNI_FAC[i * 2].id), x + 6, y + 8, w - 12, 18); for (let k = 0; k < 3; k++) tRect(c, '#8A8E98', x + 6, y + 32 + k * 6, w - 12 - k * 6, 2); }); });
    rug(c, 520, 1900, '#7A2438', GOLD);
  };
  IV_ROOMS.ulecture = function(c, D){
    const W = D.w;
    [380, 2430, 2780].forEach(function(x){ tallWindow(c, x, 70, 54, 200, '#B8DCF2'); });
    /* a skeleton of a giraffe, a map of the world and a chart of the planets, framed on the wall above the seats */
    ivFrame(c, 2000, 130, 150, 84, function(c, x, y, w, h){ tRect(c, '#F3EAD2', x, y, w, h); c.strokeStyle = '#6A5A3A'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 40, y + 52); c.lineTo(x + 100, y + 52); c.moveTo(x + 92, y + 52); c.lineTo(x + 106, y + 16); c.stroke(); tCircle(c, '#6A5A3A', x + 110, y + 14, 5); for (let i = 0; i < 7; i++){ ln(c, '#6A5A3A', 1.4, x + 44 + i * 9, y + 46, x + 44 + i * 9, y + 56); } [44, 56, 88, 98].forEach(function(lx){ ln(c, '#6A5A3A', 2, x + lx, y + 52, x + lx, y + h - 8); }); });
    ivFrame(c, 2220, 130, 150, 84, function(c, x, y, w, h){ tRect(c, '#8FC4E8', x, y, w, h); c.fillStyle = '#6AB04A'; c.beginPath(); c.ellipse(x + 40, y + 34, 22, 14, 0.2, 0, TAU); c.ellipse(x + 80, y + 52, 16, 22, -0.3, 0, TAU); c.ellipse(x + 120, y + 30, 20, 12, 0.1, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.8; for (let i = 1; i < 6; i++){ c.beginPath(); c.moveTo(x + i * 25, y); c.lineTo(x + i * 25, y + h); c.stroke(); } });
    ivFrame(c, 2440, 130, 150, 84, function(c, x, y, w, h){ tRect(c, '#1E2440', x, y, w, h); for (let i = 0; i < 8; i++){ const rr = [3, 4.5, 5, 4, 10, 9, 7, 7][i]; tCircle(c, ['#C9CDD9', '#E8C888', '#4A8AD8', '#D85A3A', '#E8B070', '#E8D8A0', '#8AD8E8', '#4A6AD8'][i], x + 12 + i * 17, y + h / 2 + (i % 2 ? 8 : -8), rr * 0.9); } tCircle(c, '#FFD84D', x + 6, y + 8, 4); });
    bunting(c, 520, 2900, 50, 10, ['#2B3A5A', '#F4F1E8', '#2B3A5A', '#E3B94A']);
    for (let x = 700; x < W - 200; x += 420) lamp(c, x, 80, 90, '#2F4A6A');
    rug(c, 940, 700, '#2B3A5A', GOLD);
  };
  IV_ROOMS.ulibrary = function(c, D){
    const W = D.w;
    /* a dark panelled band and tall bookcases' worth of arches along the top, a stained rosette over every faculty shelf */
    for (let i = 0; i < 8; i++){ const x = 520 + i * 330; rosette(c, x, 118, 46, FC(UNI_FAC[i].id)); }
    tRect(c, 'rgba(60,35,20,.2)', 0, 40, W, 12);
    for (let x = 340; x < W - 100; x += 330){ archTop(c, 'rgba(60,35,20,.14)', x - 160, 40, 320, 120); }
    /* a rolling ladder along a brass rail */
    ln(c, '#B8902A', 4, 160, 238, 1100, 238); [[900, 0], [980, 0]].forEach(function(p){ ln(c, '#8A6A22', 3, p[0], 238, p[0] - 8, 238 + 10); });
    ln(c, WOOD_L, 5, 1010, 240, 1060, TG); ln(c, WOOD_L, 5, 1040, 240, 1090, TG); for (let k = 0; k < 7; k++) ln(c, WOOD_D, 3, 1013 + k * 8 - 0, 262 + k * 34 - (k ? 0 : 0), 1043 + k * 8, 262 + k * 34);
    globe(c, 3000, TG - 120, 34);
    for (let i = 0; i < 4; i++) lamp(c, 3380 + (i - 1.5) * 0, 84, 60, '#2F6A4A');
    ln(c, '#2A2A30', 2, 3380, 34, 3380, 80);
    rug(c, 3250, 440, '#2F4A3A', GOLD); rug(c, 360, 1900, '#5A2A3A', '#C9A24A');
    wallClock(c, 140, 120, 22, 3, 0);
  };
  IV_ROOMS.uhw = function(c, D){
    const W = D.w;
    [300, 1100, 1560, 2380].forEach(function(x){ tallWindow(c, x, 70, 54, 190, '#C0E4F6'); });
    /* a long blackboard of sums, a periodic table, a times table and a map */
    tRound(c, WOOD_D, 480, 98, 480, 188, 5); tRound(c, SLATE, 488, 106, 464, 172, 3); chalkLines(c, 488, 106, 464, 172, 21); ivText(c, 'A² + B² = C²', 640, 150, 22, 'rgba(255,255,255,.8)', '500'); ivText(c, '7 × 8 = 56', 800, 210, 20, 'rgba(255,255,255,.7)', '500'); ivText(c, 'WRITE YOUR WORKINGS', 720, 262, 12, 'rgba(255,220,120,.8)');
    tRect(c, '#C9B48A', 488, 278, 464, 6); for (let k = 0; k < 4; k++) tRect(c, ['#F4F1E8', '#F2B8C9', '#B8E0F2', '#FFE79A'][k], 520 + k * 64, 272, 28, 6);
    ivFrame(c, 1680, 130, 160, 100, function(c, x, y, w, h){ tRect(c, '#F4F1E8', x, y, w, h); for (let r = 0; r < 6; r++) for (let q = 0; q < 10; q++){ if ((r > 0 && r < 4 && q > 1 && q < 8) || (r === 0 && q > 0 && q < 9)) continue; tRect(c, ['#E85D4A', '#F2B230', '#4D9AE8', '#6BBB45', '#A56AD8', '#E88AB8'][(q + r * 2) % 6], x + 6 + q * 14.6, y + 8 + r * 14, 12.4, 12); } });
    ivFrame(c, 2010, 140, 120, 88, function(c, x, y, w, h){ tRect(c, '#FFF6D8', x, y, w, h); for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) tRect(c, (r + q) % 2 ? '#F2C230' : '#6BBB45', x + 8 + q * 26, y + 8 + r * 19, 24, 17); });
    bunting(c, 480, 2300, 52, 10, ['#4D9AE8', '#F2C230', '#E85D4A', '#6BBB45']);
    for (let x = 700; x < W - 100; x += 480) lamp(c, x, 76, 80, '#3A5A7A');
    rug(c, 560, 1500, '#3A5A7A', '#F2C230');
  };
  IV_ROOMS.uexam = function(c, D){
    const W = D.w;
    [380, 980, 2300, 2760].forEach(function(x){ tRect(c, '#9A8F76', x - 6, 78, 48, 170); tRect(c, '#B8DCF2', x, 84, 36, 158); tRect(c, 'rgba(255,255,255,.3)', x + 3, 86, 8, 154); c.strokeStyle = 'rgba(40,40,50,.7)'; c.lineWidth = 2; for (let k = 1; k < 6; k++){ c.beginPath(); c.moveTo(x, 84 + k * 26); c.lineTo(x + 36, 84 + k * 26); c.stroke(); } tRect(c, '#B8AE96', x - 10, 242, 56, 6); });
    wallClock(c, 1550, 120, 46, 9, 0);
    /* rules, framed in black: no talking, no phones, pencils down */
    [[1150, 'SILENCE', '#B8342A'], [1950, 'PENCILS DOWN WHEN TOLD', '#2B3A5A']].forEach(function(r, i){ tRound(c, '#12141C', r[0] - 80, 110, 160, 92, 4); tRect(c, '#F4F1E8', r[0] - 74, 116, 148, 80); tRect(c, r[2], r[0] - 74, 116, 148, 14); ivText(c, 'EXAM RULES', r[0], 127, 9, '#FFF'); [['1. NO TALKING', ''], ['2. NO PHONES', ''], ['3. NO PEEKING', '']].forEach(function(t, k){ ivText(c, t[0], r[0], 148 + k * 15, 10, '#2B3040', '600'); }); });
    ln(c, '#2A2A30', 2, 1550, 34, 1550, 66);
    [700, 1300, 1800, 2400].forEach(function(x){ ln(c, '#2A2A30', 2, x, 34, x, 64); tCircle(c, '#E8E4DC', x, 72, 12); tPoly(c, '#4A4A52', [x - 16, 60, x + 16, 60, x + 10, 48, x - 10, 48]); c.save(); c.globalAlpha = 0.16; tPoly(c, '#FFF6D0', [x - 14, 76, x + 14, 76, x + 80, TG - 10, x - 80, TG - 10]); c.restore(); });
    /* the floor: chalk-lined squares where the desks go */
    for (let x = 1100; x < 2250; x += 330){ c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.strokeRect(x - 10, TG + 8, 200, 42); }
    tRect(c, 'rgba(0,0,0,.06)', 400, TG + 6, W - 700, 46);
  };
  IV_ROOMS.ucafe = function(c, D){
    const W = D.w;
    /* a big window with a view of the lawn, a chalk menu, shelves of jars, string lights, and plants */
    tRect(c, WOOD_D, 1650, 90, 360, 220); tRect(c, '#B8DCF2', 1658, 98, 344, 204); tRect(c, '#7EAA5E', 1658, 240, 344, 62); tEll(c, '#5E9A4E', 1760, 244, 60, 30); ln(c, '#5A3E24', 5, 1760, 244, 1760, 270); tEll(c, 'rgba(255,255,255,.7)', 1880, 140, 40, 10); tEll(c, 'rgba(255,255,255,.6)', 1930, 160, 28, 7);
    tRect(c, WOOD_D, 1828, 98, 6, 204); tRect(c, WOOD_D, 1658, 196, 344, 6); tRect(c, 'rgba(255,255,255,.3)', 1664, 104, 20, 192); tRect(c, '#C9B48A', 1640, 310, 380, 8);
    tRound(c, WOOD_D, 420, 96, 460, 190, 6); tRound(c, SLATE, 428, 104, 444, 174, 4); ivText(c, 'TODAY AT THE CAFÉ', 650, 134, 18, 'rgba(255,230,160,.9)'); [['Tea', '3'], ['Currant bun', '4'], ['Toast and jam', '4'], ['Soup', '7'], ['Cake', '11']].forEach(function(m, i){ c.fillStyle = 'rgba(255,255,255,.78)'; c.font = '500 15px system-ui'; c.textAlign = 'left'; c.fillText(m[0], 460, 166 + i * 22); c.textAlign = 'right'; c.fillText('..... ' + m[1] + 'c', 840, 166 + i * 22); }); c.textAlign = 'center';
    tCircle(c, 'rgba(255,255,255,.7)', 840, 262, 2.4);
    ivShelfBoard(c, 1060, 160, 400, WOOD); ivShelfBoard(c, 1060, 232, 400, WOOD);
    for (let i = 0; i < 8; i++){ const jx = 1076 + i * 48; tRound(c, 'rgba(220,235,245,.55)', jx, 116, 34, 44, 6); tRect(c, ['#5A3A1E', '#C9A04A', '#8A5A2A', '#E8D8A0'][i % 4], jx + 3, 128, 28, 30); tRect(c, WOOD_D, jx + 4, 110, 26, 7); tRound(c, 'rgba(220,235,245,.55)', jx, 188, 34, 44, 6); tRect(c, ['#6A8A3A', '#B8342A', '#E8C060', '#3A5A8A'][i % 4], jx + 3, 202, 28, 28); tRect(c, WOOD_D, jx + 4, 182, 26, 7); }
    bunting(c, 120, 2300, 50, 16, ['#C9503C', '#F4F1E8', '#2F6A5A', '#E8B830']);
    K.stringLights(c, 160, 2260, 74, 22, 36, 5);
    [[2100, '#3E8A3A'], [2250, '#6BBB45']].forEach(function(p){ ln(c, '#7A5230', 2, p[0], 36, p[0], 100); tRound(c, '#B5603A', p[0] - 14, 100, 28, 22, 4); for (let k = 0; k < 7; k++) ln(c, p[1], 4, p[0], 104, p[0] - 22 + k * 7, 150 + (k % 3) * 14); });
    c.save(); c.shadowColor = '#FF6A4A'; c.shadowBlur = 14; tRound(c, '#2B2030', 2040, 180, 110, 40, 8); ivText(c, 'OPEN', 2095, 209, 24, '#FF8A6A'); c.restore();
    for (let y = TG + 6; y < TG + 52; y += 11) for (let x = 260; x < 2200; x += 22) tRect(c, ((x - 260) / 22 + (y - TG - 6) / 11) % 2 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)', x, y, 22, 11);
  };
  const iw = ivWindows;
  ivWindows = function(c, D, K2){ if (ROOMS[D.room]) return; iw(c, D, K2); };

  /* ============================================================ THE FURNITURE ============================================================ */
  const F = {
    u_regdesk: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      tRect(c, WOOD_D, x0, TG - 98, W, 98); tRect(c, WOOD, x0 + 8, TG - 90, W - 16, 82); K.boards(c, x0 + 8, TG - 90, W - 16, 82, 20, true, 11); tRect(c, 'rgba(0,0,0,.2)', x0 + 14, TG - 80, W - 28, 62);
      tRect(c, WOOD_L, x0 - 6, TG - 108, W + 12, 12); tRect(c, 'rgba(255,255,255,.2)', x0 - 6, TG - 108, W + 12, 2);
      crestWall(c, b.x, TG - 52, 0.9); tRect(c, GOLD, x0 + 14, TG - 80, W - 28, 1.6);
      tRound(c, '#12141C', x0 + 22, TG - 170, 62, 52, 5); tRound(c, '#6BD6FF', x0 + 27, TG - 165, 52, 40, 3); ivText(c, 'ENROL', x0 + 53, TG - 142, 12, '#12304A'); tRect(c, '#1E2230', x0 + 48, TG - 118, 10, 10);
      tRound(c, '#D5352B', x0 + W - 60, TG - 120, 26, 12, 6); tRect(c, '#8A8E98', x0 + W - 50, TG - 108, 6, 4);
      [['#F4F1E8', 0], ['#FFE79A', 6], ['#F2B8C9', 12]].forEach(function(p){ tRect(c, 'rgba(0,0,0,.2)', x0 + 120 + p[1], TG - 111 - p[1] / 3, 40, 3); tRect(c, p[0], x0 + 120 + p[1], TG - 114 - p[1] / 3, 40, 4); });
      ln(c, '#2A2A30', 1.6, x0 + 208, TG - 108, x0 + 220, TG - 142); tPoly(c, '#F4F1E8', [x0 + 216, TG - 142, x0 + 232, TG - 150, x0 + 226, TG - 130, x0 + 222, TG - 134]);
    },
    u_facboard: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRect(c, WOOD_D, x0 + 10, TG - 24, 10, 24); tRect(c, WOOD_D, x0 + W - 20, TG - 24, 10, 24);
      tRound(c, WOOD_D, x0, TG - H, W, H - 20, 8); tRound(c, '#2A3A52', x0 + 8, TG - H + 8, W - 16, H - 36, 5);
      ivText(c, 'THE FACULTIES', b.x, TG - H + 28, 16, GOLD); tRect(c, GOLD, x0 + 30, TG - H + 36, W - 60, 1.5);
      const cw = (W - 40) / 4;
      UNI_FAC.forEach(function(Fc, i){
        const cx = x0 + 20 + (i % 4) * cw + cw / 2, cy = TG - H + 66 + Math.floor(i / 4) * 94, open = uniOpen(Fc);
        tRound(c, 'rgba(0,0,0,.3)', cx - cw / 2 + 5, cy - 8, cw - 10, 84, 5); tRound(c, open ? Fc.col : '#6A6E78', cx - cw / 2 + 8, cy - 5, cw - 16, 36, 4);
        uniEmblem(c, Fc.id, cx, cy + 13, 11); ivText(c, Fc.short.toUpperCase().slice(0, 9), cx, cy + 46, 9, open ? '#F6E7B8' : '#9A9EA8'); ivText(c, 'CH ' + Fc.ch, cx, cy + 60, 8, open ? '#C9CDD9' : '#7A7E88', '600');
        if (!open){ tRect(c, '#C9CDD9', cx - 4, cy + 4, 8, 7); tRound(c, '#C9CDD9', cx - 6, cy + 10, 12, 10, 2); }
      });
    },
    u_degrees: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRound(c, WOOD_D, x0, TG - H, W, H, 6); tRect(c, '#E8DCC0', x0 + 10, TG - H + 10, W - 20, H - 20); tRect(c, 'rgba(0,0,0,.08)', x0 + 10, TG - H + 10, W - 20, 6);
      ivText(c, 'HALL OF DEGREES', b.x, TG - H + 30, 14, '#5A3A1E'); tRect(c, WOOD, x0 + 24, TG - H + 38, W - 48, 1.5);
      for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++){
        const dx = x0 + 22 + q * ((W - 44) / 4), dy = TG - H + 52 + r * 62, Fc = UNI_FAC[q + (r === 2 ? 4 : 0)] || UNI_FAC[q];
        tRect(c, '#5A3B22', dx, dy, 52, 44); tRect(c, '#F4F1E8', dx + 3, dy + 3, 46, 38); tRect(c, Fc.col, dx + 6, dy + 6, 40, 6); for (let k = 0; k < 3; k++) tRect(c, '#9A9EA8', dx + 8, dy + 17 + k * 5, 36 - k * 8, 1.6); tCircle(c, GOLD, dx + 38, dy + 34, 4); tCircle(c, '#B8342A', dx + 38, dy + 34, 2);
      }
    },
    u_trophy: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRect(c, WOOD_D, x0, TG - H, W, H); tRect(c, '#CFE4F0', x0 + 8, TG - H + 8, W - 16, H - 28); tRect(c, 'rgba(255,255,255,.3)', x0 + 12, TG - H + 10, 18, H - 32);
      for (let i = 0; i < 3; i++) tRect(c, WOOD_L, x0 + 8, TG - H + 66 + i * 52, W - 16, 5);
      [['#CD8A4A', 0, 0], ['#C9CDD9', 1, 0], ['#FFD84D', 0, 1], ['#E8B830', 1, 1], ['#E85DFF', 0, 2], ['#4DB8FF', 1, 2]].forEach(function(t, i){ ivTrophy(c, x0 + 50 + t[1] * 90, TG - H + 66 + t[2] * 52, t[0], i > 3); });
      tRound(c, '#2B3A5A', x0 + 20, TG - 16, W - 40, 12, 2); ivText(c, 'RANKS', b.x, TG - 7, 8, GOLD);
    },
    u_notebook: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 10);
      tRect(c, WOOD_D, x0 + 10, TG - 70, 10, 70); tRect(c, WOOD_D, x0 + W - 20, TG - 70, 10, 70); tRect(c, WOOD, x0, TG - 82, W, 12); tRect(c, 'rgba(255,255,255,.2)', x0, TG - 82, W, 2);
      c.save(); c.translate(b.x, TG - 84); c.fillStyle = '#7A2438'; c.beginPath(); c.moveTo(-50, 0); c.lineTo(50, 0); c.lineTo(46, -14); c.lineTo(-46, -14); c.closePath(); c.fill(); tPoly(c, '#F4F1E8', [-46, -2, -2, -2, -2, -16, -42, -16]); tPoly(c, '#F4F1E8', [2, -2, 46, -2, 42, -16, 2, -16]); for (let k = 0; k < 3; k++){ tRect(c, '#8A8E98', -38, -12 + k * 3.4, 30 - k * 4, 1.2); tRect(c, '#8A8E98', 8, -12 + k * 3.4, 28 - k * 3, 1.2); } c.restore();
      ln(c, '#2A2A30', 2, x0 + W - 40, TG - 84, x0 + W - 26, TG - 112); tPoly(c, '#F4F1E8', [x0 + W - 32, TG - 112, x0 + W - 16, TG - 122, x0 + W - 22, TG - 100]); tRound(c, '#2B2F3A', x0 + 20, TG - 98, 20, 14, 3); tRect(c, '#C9CDD9', x0 + 22, TG - 104, 16, 6);
    },
    u_timetable: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRect(c, WOOD_D, x0 + 14, TG - 60, 8, 60); tRect(c, WOOD_D, x0 + W - 22, TG - 60, 8, 60); tRound(c, WOOD_D, x0, TG - H, W, H - 50, 5); tRect(c, '#F4F1E8', x0 + 8, TG - H + 8, W - 16, H - 66);
      ivText(c, 'TIMETABLE', b.x, TG - H + 26, 13, '#2B3A5A'); for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++){ const cx = x0 + 14 + q * ((W - 28) / 3); tRect(c, UNI_FAC[(r * 3 + q) % 8].col, cx, TG - H + 38 + r * 22, (W - 28) / 3 - 4, 17); tRect(c, 'rgba(255,255,255,.7)', cx + 4, TG - H + 44 + r * 22, 18, 2); tRect(c, 'rgba(255,255,255,.5)', cx + 4, TG - H + 49 + r * 22, 12, 2); }
    },
    u_stage: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      tRound(c, WOOD_D, x0 + 40, TG - 280, W - 80, 160, 5); tRound(c, SLATE, x0 + 48, TG - 272, W - 96, 144, 3);                                  /* the blackboard on the back wall */
      chalkLines(c, x0 + 48, TG - 272, W - 96, 144, 31); ivText(c, 'F = m × a', x0 + 200, TG - 214, 26, 'rgba(255,255,255,.82)', '500'); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(x0 + 400, TG - 208, 28, 0, TAU); c.moveTo(x0 + 400, TG - 208); c.lineTo(x0 + 424, TG - 224); c.stroke();
      tRect(c, '#C9B48A', x0 + 48, TG - 130, W - 96, 6); [['#F4F1E8', 0], ['#FFE79A', 1]].forEach(function(p){ tRect(c, p[0], x0 + 70 + p[1] * 40, TG - 136, 24, 6); }); tRect(c, '#E88A9A', x0 + 160, TG - 134, 24, 4);
      tRect(c, WOOD, x0, TG - 40, W, 40); K.boards(c, x0, TG - 40, W, 40, 14, false, 41); tRect(c, WOOD_L, x0 - 6, TG - 46, W + 12, 8); tRect(c, 'rgba(255,255,255,.2)', x0 - 6, TG - 46, W + 12, 2);   /* the platform */
      for (let i = 0; i < 3; i++) tRect(c, i % 2 ? WOOD_L : WOOD, x0 - 30 + i * 10, TG - 12 - i * 12 + 12, 30 - i * 10, 12);
      /* the lectern, a jug of water and a pointer */
      tRect(c, WOOD_D, b.x + 120, TG - 128, 70, 82); tPoly(c, WOOD, [b.x + 112, TG - 128, b.x + 198, TG - 128, b.x + 190, TG - 144, b.x + 120, TG - 144]); tRect(c, '#F4F1E8', b.x + 128, TG - 142, 54, 10); crestWall(c, b.x + 155, TG - 90, 0.5);
      tRound(c, 'rgba(200,230,245,.8)', b.x - 150, TG - 66, 18, 26, 4); tRect(c, '#6AB8E8', b.x - 148, TG - 56, 14, 14); ln(c, '#C9B48A', 2, b.x - 220, TG - 46, b.x - 150, TG - 150);
    },
    u_seats: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      for (let row = 0; row < 3; row++){
        const y = TG - row * 22, n = Math.floor(W / 56) - row;
        tRect(c, row % 2 ? '#5A3A22' : '#6A4A2C', x0 - row * 6, y - 22, W + row * 12, 22); tRect(c, 'rgba(0,0,0,.2)', x0 - row * 6, y - 4, W + row * 12, 4);
        for (let i = 0; i < n; i++){ const sx = x0 + 20 + i * ((W - 40) / Math.max(1, n - 1)); if (row === 2 && i % 4 === 3) continue; tRound(c, ['#8A2438', '#2B3A5A', '#2F5A3A'][(i + row) % 3], sx - 16, y - 54 + 0, 32, 30, 6); tRound(c, ['#A83A50', '#3E5A8A', '#3E7A52'][(i + row) % 3], sx - 14, y - 52, 28, 12, 4); tRect(c, '#3A2A1E', sx - 3, y - 26, 6, 6); }
      }
      tRect(c, WOOD_D, x0, TG - 66, W, 6); tRect(c, 'rgba(255,255,255,.2)', x0, TG - 66, W, 1.5);
    },
    u_shelf: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h, col = FC(b.m), r = miniRng(Math.round(b.x * 7)); ivShadow(c, b.x, W + 14);
      tRect(c, '#4A2E1C', x0, TG - H, W, H); tRect(c, '#2A1A10', x0 + 8, TG - H + 8, W - 16, H - 8); tRect(c, '#5A3A24', x0 - 6, TG - H - 10, W + 12, 12); tRect(c, 'rgba(255,255,255,.16)', x0 - 6, TG - H - 10, W + 12, 2);
      tPoly(c, '#5A3A24', [x0 - 10, TG - H - 10, x0 + W + 10, TG - H - 10, x0 + W - 12, TG - H - 24, x0 + 12, TG - H - 24]);
      const rows = 5, rh = (H - 22) / rows;
      for (let rw = 0; rw < rows; rw++){
        const by = TG - H + 14 + (rw + 1) * rh - 4; let bx = x0 + 12;
        while (bx < x0 + W - 16){
          const bw = 6 + Math.floor(r() * 9), bh = rh - 14 + Math.floor(r() * 8), cc = r() < 0.34 ? col : ['#B5502A', '#2F5F94', '#3E7A3A', '#E8B830', '#8A3AA8', '#F4F1E8', '#5A3A1E', '#C9772E'][Math.floor(r() * 8)];
          if (bx + bw > x0 + W - 14) break;
          if (r() < 0.07){ tRect(c, cc, bx, by - bh, bw, bh); ln(c, cc, bw, bx + bw * 0.3, by - bh, bx + bw * 1.4, by - bh + 3); bx += bw + 5; continue; }
          ivBook(c, bx, by, bw, bh, cc); if (r() < 0.4) tRect(c, GOLD, bx + 1, by - bh * 0.6, bw - 2, 1.4); bx += bw + 1;
        }
        tRect(c, '#5A3A24', x0 + 8, by, W - 16, 4); tRect(c, 'rgba(255,255,255,.12)', x0 + 8, by, W - 16, 1);
      }
      tRect(c, 'rgba(0,0,0,.25)', x0 + 8, TG - H + 8, 6, H - 8);
      tRound(c, '#12141C', b.x - 60, TG - 28, 120, 20, 3); tRect(c, col, b.x - 60, TG - 28, 120, 4); ivText(c, (UNI_BY_ID[b.m] ? UNI_BY_ID[b.m].short : '').toUpperCase(), b.x, TG - 13, 10, '#F6E7B8');
    },
    u_readtable: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      tRect(c, WOOD_D, x0 + 16, TG - 76, 12, 76); tRect(c, WOOD_D, x0 + W - 28, TG - 76, 12, 76); tRect(c, WOOD_D, x0 + 30, TG - 40, W - 60, 6);
      tRound(c, WOOD, x0, TG - 90, W, 16, 4); K.boards(c, x0, TG - 88, W, 12, 6, false, 51); tRect(c, 'rgba(255,255,255,.22)', x0, TG - 90, W, 2);
      /* an open book, a stack, a green banker's lamp and a candle */
      c.save(); c.translate(x0 + 110, TG - 90); tPoly(c, '#F4F1E8', [-44, 0, -2, -3, -2, -22, -40, -18]); tPoly(c, '#F4F1E8', [2, -3, 44, 0, 40, -18, 2, -22]); for (let k = 0; k < 4; k++){ tRect(c, '#8A8E98', -36, -14 + k * 3.2, 28 - k * 3, 1.2); tRect(c, '#8A8E98', 8, -14 + k * 3.2, 26 - k * 2, 1.2); } tRect(c, '#7A2438', -46, -2, 92, 3); c.restore();
      [['#2F5F94', 22], ['#B5502A', 18], ['#3E7A3A', 14], ['#E8B830', 10]].forEach(function(s, i){ tRect(c, s[0], x0 + 200 - i * 2 + (i % 2) * 3, TG - 90 - 10 - i * 10, 52 - i * 4, 10); tRect(c, 'rgba(255,255,255,.22)', x0 + 202 - i * 2, TG - 90 - 10 - i * 10, 48 - i * 4, 2); });
      tRect(c, '#2A2A30', x0 + 270, TG - 108, 5, 18); tRound(c, '#2F6A4A', x0 + 256, TG - 128, 34, 20, 8); tRect(c, '#FFE7A8', x0 + 262, TG - 110, 22, 3); tRound(c, '#B8902A', x0 + 262, TG - 94, 22, 5, 2);
      ln(c, '#6A4A2C', 4, x0 + 40, TG - 20, x0 + 40, TG - 6);
      [x0 + 60, x0 + W - 70].forEach(function(cx){ tRect(c, '#4A2E1C', cx - 18, TG - 62, 36, 6); tRect(c, '#4A2E1C', cx - 16, TG - 98, 4, 36); tRect(c, '#4A2E1C', cx - 16, TG - 98, 32, 4); tRect(c, '#4A2E1C', cx - 14, TG - 56, 4, 56); tRect(c, '#4A2E1C', cx + 10, TG - 56, 4, 56); tRound(c, '#2F6A4A', cx - 18, TG - 70, 36, 10, 3); });
    },
    u_hwdesk: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 10);
      tRect(c, WOOD_D, x0 + 14, TG - 72, 10, 72); tRect(c, WOOD_D, x0 + W - 24, TG - 72, 10, 72); tRect(c, WOOD_D, x0 + 24, TG - 36, W - 48, 5);
      tRound(c, WOOD, x0, TG - 86, W, 14, 4); K.boards(c, x0, TG - 85, W, 11, 6, false, 61); tRect(c, 'rgba(255,255,255,.22)', x0, TG - 86, W, 2);
      tRect(c, '#F4F1E8', x0 + 44, TG - 94, 76, 9); for (let k = 0; k < 2; k++) tRect(c, '#8A8E98', x0 + 52, TG - 92 + k * 3, 56 - k * 12, 1); tRect(c, '#F2B8C9', x0 + 130, TG - 98, 32, 12); tRect(c, '#8A8E98', x0 + 132, TG - 95, 26, 1.4);
      ln(c, '#F2C230', 4, x0 + 168, TG - 86, x0 + 204, TG - 100); tPoly(c, '#E8C899', [x0 + 202, TG - 98, x0 + 208, TG - 103, x0 + 205, TG - 94]);
      ln(c, '#2A2A30', 3, x0 + W - 44, TG - 86, x0 + W - 58, TG - 130); ln(c, '#2A2A30', 3, x0 + W - 58, TG - 130, x0 + W - 90, TG - 124); tPoly(c, '#E8B830', [x0 + W - 100, TG - 120, x0 + W - 78, TG - 132, x0 + W - 80, TG - 112]); tRound(c, '#2A2A30', x0 + W - 52, TG - 90, 20, 5, 2);
      c.save(); c.globalAlpha = 0.18; tPoly(c, '#FFE9A0', [x0 + W - 98, TG - 114, x0 + W - 80, TG - 112, x0 + 140, TG - 86, x0 + 70, TG - 86]); c.restore();
    },
    u_hwboard: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRect(c, '#4A4F5C', x0 + 20, TG - 120, 6, 120); tRect(c, '#4A4F5C', x0 + W - 26, TG - 120, 6, 120);
      tRound(c, WOOD_D, x0, TG - H, W, H - 100, 6); tRect(c, '#C9A26A', x0 + 8, TG - H + 8, W - 16, H - 116);
      ivText(c, 'ANSWERS (CHECK AFTER)', b.x, TG - H + 24, 11, '#5A3A1E');
      [[0, 0, '#F4F1E8'], [1, 0, '#FFE79A'], [2, 0, '#F2B8C9'], [0, 1, '#B8E0F2'], [1, 1, '#F4F1E8'], [2, 1, '#C8E8B0']].forEach(function(p, i){ pinned(c, x0 + 22 + p[0] * ((W - 56) / 3), TG - H + 36 + p[1] * 48, 78, 40, p[2], 3, (i % 3 - 1) * 0.04); ivText(c, ['7×8', '√81', '3/4', 'H₂O', '9.8', 'π'][i], x0 + 22 + p[0] * ((W - 56) / 3) + 39, TG - H + 62 + p[1] * 48, 14, '#2B3A5A', '600'); });
    },
    u_invig: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      tRect(c, '#2B3040', x0, TG - 110, W, 110); tRect(c, '#3A4256', x0 + 8, TG - 100, W - 16, 92); tRect(c, 'rgba(0,0,0,.2)', x0 + 14, TG - 90, W - 28, 74);
      tRect(c, '#4A5062', x0 - 8, TG - 120, W + 16, 12); tRect(c, 'rgba(255,255,255,.2)', x0 - 8, TG - 120, W + 16, 2); tRect(c, '#D5352B', x0 + 8, TG - 60, W - 16, 4);
      ivText(c, 'PROCTOR', b.x, TG - 72, 14, '#F6E7B8');
      tRound(c, '#2B3A5A', x0 + 24, TG - 150, 60, 30, 3); ivText(c, 'TIME', x0 + 54, TG - 138, 8, '#C9CDD9'); ivText(c, '30:00', x0 + 54, TG - 126, 12, '#FF6A5A');
      tRound(c, '#B8342A', x0 + W - 70, TG - 138, 30, 18, 3); tRect(c, '#8A8E98', x0 + W - 56, TG - 144, 2, 8); tRound(c, '#E8E4DC', x0 + W - 106, TG - 130, 24, 10, 3); ln(c, '#2A2A30', 2, x0 + W - 24, TG - 120, x0 + W - 14, TG - 150);
      tRound(c, '#12141C', x0 + 110, TG - 138, 80, 18, 3); ivText(c, 'SILENCE', x0 + 150, TG - 125, 11, '#F6E7B8');
    },
    u_exdesk: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 6);
      tRect(c, '#5A5E68', x0 + 10, TG - 62, 6, 62); tRect(c, '#5A5E68', x0 + W - 16, TG - 62, 6, 62); tRect(c, '#5A5E68', x0 + 10, TG - 8, W - 20, 4);
      tRound(c, '#C9B48A', x0, TG - 76, W, 12, 3); tRect(c, 'rgba(255,255,255,.3)', x0, TG - 76, W, 2);
      tRect(c, '#F4F1E8', x0 + 28, TG - 84, 80, 9); for (let k = 0; k < 2; k++) tRect(c, '#8A8E98', x0 + 34, TG - 82 + k * 3, 60 - k * 14, 1); ln(c, '#F2C230', 3, x0 + 120, TG - 78, x0 + 148, TG - 90);
      tRect(c, '#4A5062', x0 + 8, TG - 128, W - 16, 52); tRect(c, 'rgba(255,255,255,.12)', x0 + 8, TG - 128, W - 16, 2); tRound(c, '#F4F1E8', x0 + W / 2 - 10, TG - 118, 20, 16, 2); ivText(c, ['1', '2', '3'][b.id.slice(-1) - 1] || '1', x0 + W / 2, TG - 106, 11, '#2B3040');
    },
    u_results: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w, H = b.h; ivShadow(c, b.x, W);
      tRect(c, '#4A4F5C', x0 + 20, TG - 100, 6, 100); tRect(c, '#4A4F5C', x0 + W - 26, TG - 100, 6, 100);
      tRound(c, '#2B3040', x0, TG - H, W, H - 90, 6); tRound(c, '#1E2438', x0 + 8, TG - H + 8, W - 16, H - 106, 3);
      ivText(c, 'RESULTS', b.x, TG - H + 28, 15, GOLD); tRect(c, GOLD, x0 + 24, TG - H + 36, W - 48, 1.5);
      const cols = ['FACULTY', 'DEGREE'];
      UNI_FAC.forEach(function(Fc, i){ const y = TG - H + 54 + i * 12; if (y > TG - 108) return; c.fillStyle = Fc.col; c.fillRect(x0 + 24, y - 7, 5, 8); c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 9px system-ui'; c.textAlign = 'left'; c.fillText(Fc.short, x0 + 36, y); const d = uniData().deg[Fc.id] | 0; c.fillStyle = d ? '#6BE08A' : '#8A8E98'; c.fillText(d ? UNI_DEG[d] : '-', x0 + W - 96, y); c.textAlign = 'center'; });
    },
    u_cafebar: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 20);
      tRect(c, '#6A3A22', x0, TG - 104, W, 104); K.boards(c, x0, TG - 104, W, 104, 14, true, 71); tRect(c, 'rgba(0,0,0,.22)', x0 + 12, TG - 92, W - 24, 78); for (let i = 0; i < 6; i++) tRect(c, 'rgba(255,255,255,.1)', x0 + 22 + i * ((W - 44) / 6), TG - 88, 3, 70);
      tRound(c, '#C9B48A', x0 - 8, TG - 116, W + 16, 14, 4); tRect(c, 'rgba(255,255,255,.35)', x0 - 8, TG - 116, W + 16, 2);
      /* an espresso machine, cups, a tray of buns and a cake under a glass dome */
      tRound(c, '#B8BCC8', x0 + 20, TG - 180, 96, 64, 6); tRect(c, '#8A8E98', x0 + 20, TG - 150, 96, 3); tRound(c, '#2B3040', x0 + 34, TG - 166, 22, 12, 2); tCircle(c, '#E8B830', x0 + 90, TG - 160, 6); tCircle(c, '#2B3040', x0 + 90, TG - 160, 2.4); tRect(c, '#4A4F5C', x0 + 40, TG - 140, 6, 22); tRect(c, '#4A4F5C', x0 + 76, TG - 140, 6, 22); ivCup(c, x0 + 43, TG - 118, 10, '#F4F1E8'); ivCup(c, x0 + 79, TG - 118, 10, '#E8B7C9');
      tRound(c, '#3A2A1E', x0 + 130, TG - 134, 60, 18, 3); ivText(c, 'FRESH', x0 + 160, TG - 122, 10, '#FFE9A8');
      for (let i = 0; i < 4; i++) ivLoaf(c, x0 + 230 + i * 28, TG - 116, ['#D9A05A', '#E8B876', '#C98A44', '#F0C890'][i]);
      tRect(c, '#F4F1E8', x0 + W - 124, TG - 120, 70, 4); tEll(c, '#6A3A22', x0 + W - 89, TG - 134, 28, 14); tEll(c, '#F2B8C9', x0 + W - 89, TG - 142, 28, 6); tCircle(c, '#B8342A', x0 + W - 89, TG - 150, 3); c.fillStyle = 'rgba(210,235,250,.35)'; c.beginPath(); c.ellipse(x0 + W - 89, TG - 134, 34, 28, 0, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(x0 + W - 89, TG - 134, 34, 28, 0, Math.PI, 0); c.stroke();
      c.save(); c.globalAlpha = 0.4; for (let i = 0; i < 3; i++) tCircle(c, '#FFFFFF', x0 + 88 + Math.sin(i) * 3, TG - 180 - i * 14, 4 + i); c.restore();
    },
    u_cafetable: function(c, D, b){
      const x0 = b.x - b.w / 2, W = b.w; ivShadow(c, b.x, W + 30);
      ln(c, '#4A3A2C', 5, b.x, TG - 70, b.x, TG - 6); tRect(c, '#4A3A2C', b.x - 24, TG - 6, 48, 6); tEll(c, '#C9503C', b.x, TG - 74, 52, 9); tEll(c, '#E85D4A', b.x, TG - 76, 52, 8); tEll(c, 'rgba(255,255,255,.3)', b.x - 12, TG - 78, 26, 2.4);
      ivCup(c, b.x - 16, TG - 76, 10, '#F4F1E8'); ivCup(c, b.x + 20, TG - 76, 10, '#B8E0F2'); tEll(c, '#F4F1E8', b.x + 2, TG - 74, 8, 2);
      [-1, 1].forEach(function(s){ const cx = b.x + s * 70; tRect(c, '#4A2E1C', cx - 14, TG - 56, 28, 5); tRect(c, '#4A2E1C', cx - 12, TG - 51, 4, 51); tRect(c, '#4A2E1C', cx + 8, TG - 51, 4, 51); tRect(c, '#4A2E1C', cx + (s > 0 ? 8 : -14), TG - 100, 6, 46); tRound(c, '#C9503C', cx - 14, TG - 62, 28, 8, 3); });
    }
  };
  const bx = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    const f = F[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
})();
