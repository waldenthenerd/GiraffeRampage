'use strict';
/* =============================================================================================================================
   44zzn-room-detail.js  --  THE OLDER ROOMS, IN THE CAMPUS ROOMS' DETAIL. A pass over every shop, cottage and farm and isle interior
   that was painted before the university (the gym and the campus rooms are left alone). It wraps townRoomProps, after the room's own
   painter has run, and adds:
     the wall      plaster flecks, a shadow under the ceiling beam and in the corners, a cobweb in each top corner
     the wainscot  raised panels with a lit top edge and a dark bottom edge, scuffs, a brass kick plate by the door
     the floor     grain, knots and nail heads in the boards, a dark line where wall meets floor, a pool of light under each window
     the light     a long shaft from each window, slanting across the room, with dust floating in it
     the door      a light switch and a socket beside it
     the walls     between every two windows, a picture where the wall is bare (a price list in the bakery, a framed print in the studio,
                   a sea chart in the lighthouse ...), and at floor level something that fits too (a radiator in
                   the cottages, flour sacks in the bakery, a tool chest in the garage, buckets by the fish stall ...)
   Everything is painted once into the room's cached layer. It draws nothing the room's own furniture needs.
   ============================================================================================================================= */
(function(){
  const K = window.townDetailKit;
  const SKIP = { gym: 1, uhall: 1, ulecture: 1, ulibrary: 1, uhw: 1, uexam: 1, ucafe: 1, runway: 1 };
  const HOMEY = { house: 1, cottage: 1, fhouse: 1, icottage: 1 };
  const ln = function(c, col, w, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };

  /* ---------- pictures for the walls ---------- */
  function frame(c, x, y, w, h, wood){ ln(c, '#2A2A30', 1.2, x + w / 2, y - 16, x + 6, y - 2); ln(c, '#2A2A30', 1.2, x + w / 2, y - 16, x + w - 6, y - 2); tRect(c, 'rgba(0,0,0,.2)', x + 2, y + 3, w, h); tRect(c, wood || '#5A3B22', x - 3, y - 3, w + 6, h + 6); tRect(c, 'rgba(255,255,255,.18)', x - 3, y - 3, w + 6, 1.5); }
  const PIC = {
    price: function(c, x, y){ frame(c, x, y, 60, 76); tRect(c, '#F6EEDA', x, y, 60, 76); ivText(c, 'TODAY', x + 30, y + 14, 9, '#8A3A1E'); for (let k = 0; k < 5; k++){ tRect(c, '#8A7A5A', x + 6, y + 24 + k * 10, 34, 1.6); tRect(c, '#8A7A5A', x + 44, y + 24 + k * 10, 10, 1.6); } },
    print: function(c, x, y){ frame(c, x, y, 70, 56, '#2A2A30'); tRect(c, '#F4F1E8', x, y, 70, 56); tRect(c, '#8FC4E8', x + 6, y + 6, 58, 34); tPoly(c, '#6BBB45', [x + 6, y + 40, x + 26, y + 20, x + 40, y + 32, x + 54, y + 16, x + 64, y + 40]); tCircle(c, '#FFD84D', x + 52, y + 14, 5); ivText(c, 'GIRAFFE ON A HILL', x + 35, y + 50, 6, '#5A5A64'); },
    calendar: function(c, x, y){ frame(c, x, y, 56, 70, '#8A3A1E'); tRect(c, '#FBF6E6', x, y, 56, 70); tRect(c, '#C9503C', x, y, 56, 16); ivText(c, 'MAY', x + 28, y + 12, 9, '#FFF'); for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) tRect(c, r === 1 && q === 2 ? '#C9503C' : '#C9CDD9', x + 5 + q * 9.5, y + 22 + r * 11, 7, 7); },
    horseshoe: function(c, x, y){ c.strokeStyle = '#6A6E78'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(x + 20, y + 22, 16, 0.9, Math.PI * 2 - 0.9, true); c.stroke(); for (let k = 0; k < 5; k++) tCircle(c, '#2A2A30', x + 20 + Math.cos(1.2 + k * 0.45 + 1.7) * 16, y + 22 + Math.sin(1.2 + k * 0.45 + 1.7) * 16, 1.4); tCircle(c, '#3A3A40', x + 20, y - 2, 2); },
    chart: function(c, x, y){ frame(c, x, y, 76, 54, '#4A3220'); tRect(c, '#E8DCC0', x, y, 76, 54); tRect(c, '#8FC4E8', x + 5, y + 5, 66, 44); tPoly(c, '#E8DCC0', [x + 12, y + 30, x + 24, y + 14, x + 38, y + 24, x + 30, y + 40]); tPoly(c, '#E8DCC0', [x + 44, y + 36, x + 60, y + 22, x + 66, y + 40]); ln(c, '#B8342A', 1.4, x + 14, y + 14, x + 60, y + 38); ivText(c, 'X', x + 60, y + 40, 8, '#B8342A'); },
    shells: function(c, x, y){ frame(c, x, y, 64, 50, '#6A4A2C'); tRect(c, '#2A4A6A', x, y, 64, 50); [[14, 16, '#F2D2B0'], [32, 22, '#E8A0A0'], [50, 14, '#F4F1E8'], [22, 36, '#F2C230'], [44, 36, '#E8B7C9']].forEach(function(s){ tEll(c, s[2], x + s[0], y + s[1], 8, 6); ln(c, 'rgba(0,0,0,.2)', 1, x + s[0] - 4, y + s[1], x + s[0] + 4, y + s[1]); }); },
    eggs: function(c, x, y){ frame(c, x, y, 62, 50, '#7A5230'); tRect(c, '#F6EEDA', x, y, 62, 50); ivText(c, 'EGGS LAID', x + 31, y + 12, 8, '#8A3A1E'); for (let r = 0; r < 2; r++) for (let q = 0; q < 5; q++) tEll(c, q % 2 ? '#F2D9A0' : '#FFF6E0', x + 10 + q * 11, y + 26 + r * 13, 4, 5.2); },
    notice: function(c, x, y){ frame(c, x, y, 64, 70, '#5A3B22'); tRect(c, '#C9A26A', x, y, 64, 70); [[4, 6, 26, 24, '#F4F1E8'], [34, 8, 24, 28, '#FFE79A'], [8, 36, 24, 26, '#F2B8C9'], [36, 42, 22, 22, '#B8E0F2']].forEach(function(p, i){ tRect(c, 'rgba(0,0,0,.18)', x + p[0] + 1, y + p[1] + 2, p[2], p[3]); tRect(c, p[4], x + p[0], y + p[1], p[2], p[3]); tCircle(c, '#D5352B', x + p[0] + p[2] / 2, y + p[1] + 3, 1.6); for (let k = 0; k < 3; k++) tRect(c, 'rgba(60,60,80,.4)', x + p[0] + 3, y + p[1] + 9 + k * 4, p[2] - 6, 1.2); }); },
    family: function(c, x, y){ frame(c, x, y, 56, 44, '#6A4A2C'); tRect(c, '#F4E3C0', x, y, 56, 44); [[16, 26, 0.7, '#E8B23C'], [30, 22, 1, '#C98A5A'], [44, 28, 0.6, '#F2A08A']].forEach(function(g){ tEll(c, g[3], x + g[0], y + 34, 6 * g[2] + 2, 4 * g[2] + 1); ln(c, g[3], 3, x + g[0] + 2, y + 32, x + g[0] + 3, y + g[1] - 6 * g[2]); tCircle(c, g[3], x + g[0] + 4, y + g[1] - 6 * g[2], 3 * g[2] + 1); }); },
    tools: function(c, x, y){ tRect(c, '#C9B48A', x, y, 70, 60); tRect(c, '#8A6A3A', x, y, 70, 3); [[10, '#C9CDD9', 40], [24, '#D5352B', 34], [38, '#F2C230', 44], [52, '#6A6E78', 30]].forEach(function(t){ ln(c, t[1], 4, x + t[0], y + 8, x + t[0], y + t[2]); tCircle(c, t[1], x + t[0], y + t[2], 3); }); for (let k = 0; k < 8; k++) tCircle(c, 'rgba(60,40,20,.4)', x + 6 + (k % 4) * 18, y + 54 - Math.floor(k / 4) * 5, 1.3); }
  };
  /* only where the wall is bare: the rooms that already hang their own pictures (houses, cottages, cafe, tailor, hall, barn, farmhouse) keep theirs */
  const ART = { bakery: ['price'], garage: ['tools'], studio: ['print'], farmshop: ['price'], coop: ['eggs'], ifish: ['chart'], icrab: ['chart'], ilight: ['chart'] };

  /* ---------- floor-level things ---------- */
  function radiator(c, x){ tRect(c, '#E8E4DC', x, TG - 62, 70, 46); for (let k = 0; k < 9; k++){ tRect(c, '#C9C4B8', x + 4 + k * 7.4, TG - 60, 3.4, 42); tRect(c, 'rgba(255,255,255,.6)', x + 4 + k * 7.4, TG - 60, 1, 42); } tRect(c, '#B8B2A4', x - 2, TG - 64, 74, 4); tRect(c, '#B8B2A4', x - 2, TG - 18, 74, 4); tRect(c, '#8A8E98', x + 66, TG - 40, 8, 4); }
  function sacks(c, x){ [[0, 0], [26, 0], [13, -22]].forEach(function(p, i){ tRound(c, ['#E8DCC0', '#DDD0B0', '#EFE4C8'][i], x + p[0], TG - 28 + p[1], 30, 26, 8); tRect(c, '#B8A880', x + p[0] + 6, TG - 28 + p[1], 18, 3); ivText(c, 'FLOUR', x + p[0] + 15, TG - 11 + p[1], 6, '#8A3A1E'); }); }
  function toolchest(c, x){ tRect(c, '#B8342A', x, TG - 40, 64, 32); tRect(c, '#8A2218', x, TG - 40, 64, 4); tRect(c, 'rgba(0,0,0,.25)', x + 2, TG - 28, 60, 2); tRect(c, 'rgba(0,0,0,.25)', x + 2, TG - 18, 60, 2); tRect(c, '#C9CDD9', x + 24, TG - 36, 16, 3); tRect(c, '#C9CDD9', x + 24, TG - 24, 16, 3); tCircle(c, '#2A2A30', x + 8, TG - 6, 4); tCircle(c, '#2A2A30', x + 56, TG - 6, 4); }
  function buckets(c, x){ [[0, '#4A8AC8'], [22, '#C9772E']].forEach(function(b){ c.fillStyle = b[1]; c.beginPath(); c.moveTo(x + b[0], TG - 34); c.lineTo(x + b[0] + 20, TG - 34); c.lineTo(x + b[0] + 17, TG - 6); c.lineTo(x + b[0] + 3, TG - 6); c.closePath(); c.fill(); tRect(c, 'rgba(255,255,255,.3)', x + b[0] + 4, TG - 32, 3, 24); ln(c, '#2A2A30', 1.4, x + b[0] + 2, TG - 33, x + b[0] + 10, TG - 46); ln(c, '#2A2A30', 1.4, x + b[0] + 18, TG - 33, x + b[0] + 10, TG - 46); }); }
  function crates(c, x){ [[0, 0], [30, 0], [15, -26]].forEach(function(p){ tRect(c, '#A87A44', x + p[0], TG - 28 + p[1], 30, 26); K.boards(c, x + p[0], TG - 28 + p[1], 30, 26, 6, false, Math.round(x + p[0])); tRect(c, '#6A4A22', x + p[0], TG - 28 + p[1], 30, 3); tRect(c, '#6A4A22', x + p[0], TG - 5 + p[1], 30, 3); }); }
  function cables(c, x){ c.strokeStyle = '#2A2A30'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG + 8); c.bezierCurveTo(x + 40, TG + 24, x + 70, TG + 2, x + 120, TG + 16); c.stroke(); c.strokeStyle = '#B8342A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 10, TG + 14); c.bezierCurveTo(x + 50, TG + 30, x + 90, TG + 8, x + 140, TG + 22); c.stroke(); }
  const FLOOR = { bakery: sacks, garage: toolchest, ifish: buckets, icrab: buckets, barn: crates, farmshop: crates, coop: crates, studio: cables, house: radiator, cottage: radiator, fhouse: radiator, icottage: radiator, cafe: radiator, tailor: radiator, hall: radiator, library: radiator };

  function detail(c, D, Kp){
    const W = D.w, r = miniRng(W * 13 + D.id.length * 7), winN = Math.floor(W / 330), step = (W - 300) / Math.max(1, winN);
    /* the wall */
    for (let i = 0; i < Math.round(W / 6); i++){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(60,40,20,.05)'; const s = 1 + r() * 1.6; c.fillRect(r() * W, 40 + r() * (TG - 130), s, s); }
    const sh = c.createLinearGradient(0, 30, 0, 100); sh.addColorStop(0, 'rgba(30,20,10,.2)'); sh.addColorStop(1, 'rgba(30,20,10,0)'); c.fillStyle = sh; c.fillRect(0, 30, W, 70);
    [[0, 1], [W, -1]].forEach(function(e){ const g = c.createLinearGradient(e[0], 0, e[0] + e[1] * 120, 0); g.addColorStop(0, 'rgba(30,20,10,.2)'); g.addColorStop(1, 'rgba(30,20,10,0)'); c.fillStyle = g; c.fillRect(e[1] > 0 ? 0 : W - 120, 30, 120, TG - 30); });
    [[0, 1], [W, -1]].forEach(function(e){ const x = e[0]; ln(c, 'rgba(255,255,255,.35)', 1, x + e[1] * 4, 36, x + e[1] * 34, 74); ln(c, 'rgba(255,255,255,.3)', 1, x + e[1] * 4, 36, x + e[1] * 22, 84); ln(c, 'rgba(255,255,255,.3)', 1, x + e[1] * 4, 36, x + e[1] * 40, 52); ln(c, 'rgba(255,255,255,.22)', 0.8, x + e[1] * 14, 48, x + e[1] * 22, 44); ln(c, 'rgba(255,255,255,.22)', 0.8, x + e[1] * 22, 62, x + e[1] * 32, 58); });
    /* the wainscot */
    for (let x = 140; x < W - 100; x += 140){ tRect(c, 'rgba(0,0,0,.14)', x, TG - 78, 96, 54); tRect(c, 'rgba(255,255,255,.12)', x + 3, TG - 75, 90, 1.5); tRect(c, 'rgba(255,255,255,.08)', x + 3, TG - 75, 1.5, 48); tRect(c, 'rgba(0,0,0,.2)', x + 3, TG - 27, 90, 1.5); }
    for (let i = 0; i < 18; i++){ c.fillStyle = 'rgba(255,240,200,.07)'; c.fillRect(r() * W, TG - 80 + r() * 66, 8 + r() * 14, 1.4); }
    tRect(c, '#B8902A', 168, TG - 40, 50, 16); tRect(c, 'rgba(255,255,255,.35)', 170, TG - 38, 46, 2); tRect(c, 'rgba(0,0,0,.25)', 170, TG - 28, 46, 2);
    /* the floor */
    for (let i = 0; i < Math.round(W / 70); i++){ const x = r() * W, y = TG + 10 + r() * 80; c.strokeStyle = 'rgba(40,26,12,.16)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, 5 + r() * 4, 1.8, 0, 0, TAU); c.stroke(); tCircle(c, 'rgba(40,26,12,.2)', x, y, 1.2); }
    for (let i = 0; i < Math.round(W / 24); i++){ c.fillStyle = 'rgba(255,230,180,.07)'; c.fillRect(r() * W, TG + 4 + r() * 90, 14 + r() * 24, 1.2); }
    for (let x = 30; x < W; x += 118){ for (let k = 0; k < 4; k++) tCircle(c, 'rgba(30,20,10,.35)', x + ((k % 2) * 59) % 118 + 2, TG + 14 + k * 24 - 14, 0.9); }
    tRect(c, 'rgba(20,12,4,.35)', 0, TG - 2, W, 3);
    /* the light */
    const warm = c.createLinearGradient(0, 0, 0, 1); void warm;
    for (let i = 0; i < winN; i++){
      if (D.room === 'arcade') break;
      const wx = 220 + i * step, top = 90, bot = 80 + 118, off = 180 + i * 20;
      tEll(c, 'rgba(255,238,190,.14)', wx + 39 + off * 0.6, TG + 34, 62, 11);
      c.save(); c.globalAlpha = 0.1; tPoly(c, '#FFF1C0', [wx + 4, bot, wx + 74, bot, wx + 74 + off, TG, wx + 10 + off, TG]); c.globalAlpha = 0.06; tPoly(c, '#FFF1C0', [wx + 30, bot, wx + 48, bot, wx + 48 + off, TG, wx + 34 + off, TG]); c.restore();
      for (let k = 0; k < 9; k++){ const t = r(), px = wx + 12 + t * (off + 60) - (1 - t) * 0, py = bot + (TG - bot) * t; c.fillStyle = 'rgba(255,250,220,' + (0.18 + r() * 0.25).toFixed(2) + ')'; c.fillRect(px + (r() - 0.5) * 30, py + (r() - 0.5) * 14, 1.6, 1.6); }
    }
    /* by the door: a switch and a socket */
    tRect(c, '#EDE6D2', 252, TG - 128, 14, 22); tRect(c, 'rgba(0,0,0,.2)', 252, TG - 106, 14, 1.5); tRect(c, '#B8B2A4', 256, TG - 122, 6, 10); tRect(c, '#4A4A52', 258, TG - 121, 2, 5);
    tRect(c, '#EDE6D2', 252, TG - 62, 14, 18); tCircle(c, '#2A2A30', 256, TG - 55, 1.3); tCircle(c, '#2A2A30', 262, TG - 55, 1.3); tRect(c, '#2A2A30', 257, TG - 50, 4, 1.4);
    /* the walls between the windows */
    const art = ART[D.room] || [];
    for (let i = 0; i < Math.min(art.length, Math.max(0, winN - 1)); i++){
      const mx = 220 + i * step + 78 + (step - 78) / 2 - 30; if (PIC[art[i]]) PIC[art[i]](c, mx, 118 + (i % 2) * 14);
    }
    if (!art.length || winN < 2) { /* a very narrow room: one picture over the door */ if (PIC[art[0]]) PIC[art[0]](c, 300, 128); }
    if (FLOOR[D.room] && W > 1000){ const mx = 220 + step * (Math.max(1, winN - 1)) + 78 + (step - 78) / 2 - 35; FLOOR[D.room](c, mx); }
  }

  const rp = townRoomProps;
  townRoomProps = function(c, D, K2, r){
    rp(c, D, K2, r);
    if (!D.indoor || SKIP[D.room]) return;
    try { c.save(); detail(c, D, K2); c.restore(); } catch (e) {}
  };
})();
