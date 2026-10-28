'use strict';
/* =============================================================================================================================
   44zzg-campus-art.js  --  LONGNECK UNIVERSITY, the painting outdoors: the Campus backdrop (spires, hills, trees), the lawns and paving,
   the seven street buildings (the iron gate in the Town Square, the arch, Registrar's Hall, Lecture Theater, Library, Homework Hall,
   Exam Hall, Cafe), the campus props, the mortarboard and loafers, and the faculty banners. Pure drawing; the rooms are in 44zzh and the
   lecture pictures in 44zzi. The rules are in 44zz and 44zze.
   Everything is built from small parts (bricks, cut stone, slates, ivy, glass with a sill, lanterns) so that it holds up at 2x.
   ============================================================================================================================= */
(function(){
  const K = window.townDetailKit, hash = K.hash;
  const FILM = typeof FILM_R === 'function' ? FILM_R : function(i){ const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  /* ---------- the campus palette ---------- */
  const BRICK = '#A9553A', BRICK_D = '#8A4130', STONE = '#D9CFB6', STONE_D = '#B9AD92', SLATE = '#4B5568', SLATE_L = '#66728A', GOLD = '#E3B94A', CREAM = '#F3EAD2';
  const FAC_COL = {};
  UNI_FAC.forEach(function(F){ FAC_COL[F.id] = F.col; });

  /* ---------- small parts ---------- */
  function ln(c, col, w, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  function shadow(c, x, w){ tEll(c, 'rgba(0,0,0,.22)', x, TG + 5, w / 2 + 8, 8); }
  function ivy(c, x, y, w, h, seed){                                               /* hanging leaves, in clumps from the top edge */
    const r = miniRng(seed);
    for (let i = 0; i < Math.round(w / 7); i++){
      const lx = x + r() * w, ll = h * (0.25 + r() * 0.75);
      ln(c, 'rgba(40,70,30,.5)', 1, lx, y, lx + (r() - 0.5) * 5, y + ll);
      for (let k = 0; k < ll / 9; k++){ c.fillStyle = ['#3E7A3A', '#56933F', '#2E6030', '#6AA84A'][(i + k) % 4]; c.beginPath(); c.ellipse(lx + (r() - 0.5) * 8, y + k * 9 + r() * 4, 3.6, 2.4, r() * 3, 0, TAU); c.fill(); }
    }
  }
  function archWin(c, D, x, y, w, h, lit){                                         /* an arched window with a stone frame, mullions and a sill */
    const rr = w / 2;
    c.fillStyle = STONE_D; c.beginPath(); c.moveTo(x - 4, y + h + 2); c.lineTo(x - 4, y + rr); c.arc(x + rr, y + rr, rr + 4, Math.PI, 0); c.lineTo(x + w + 4, y + h + 2); c.fill();
    c.fillStyle = lit ? '#FFE7A8' : '#9DCBEA'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + rr); c.arc(x + rr, y + rr, rr, Math.PI, 0); c.lineTo(x + w, y + h); c.fill();
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 3, y + rr, w * 0.22, h - rr - 3);
    c.strokeStyle = 'rgba(60,45,30,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + rr, y); c.lineTo(x + rr, y + h); c.moveTo(x, y + h * 0.55); c.lineTo(x + w, y + h * 0.55); c.stroke();
    tRect(c, STONE, x - 7, y + h, w + 14, 5); tRect(c, 'rgba(0,0,0,.15)', x - 7, y + h + 4, w + 14, 2);
    tPoly(c, CREAM, [x + rr - 4, y - 3, x + rr + 4, y - 3, x + rr, y - 9]);      /* the keystone */
    if (D && D._win) D._win.push({ x: x, y: y, w: w, h: h, arch: true });
  }
  function sqWin(c, D, x, y, w, h, lit){
    tRect(c, STONE_D, x - 4, y - 4, w + 8, h + 8); tRect(c, lit ? '#FFE7A8' : '#9DCBEA', x, y, w, h);
    tRect(c, 'rgba(255,255,255,.3)', x + 2, y + 2, w * 0.25, h - 4);
    c.fillStyle = 'rgba(60,45,30,.6)'; c.fillRect(x + w / 2 - 1, y, 2, h); c.fillRect(x, y + h / 2 - 1, w, 2);
    tRect(c, STONE, x - 7, y + h + 3, w + 14, 5);
    if (D && D._win) D._win.push({ x: x, y: y, w: w, h: h });
  }
  function lantern(c, x, y){ ln(c, '#2A2A30', 2, x, y - 14, x, y - 6); tRound(c, '#2A2A30', x - 5, y - 6, 10, 14, 2); tRect(c, '#FFD97A', x - 3, y - 3, 6, 9); tPoly(c, '#2A2A30', [x - 7, y - 6, x + 7, y - 6, x, y - 13]); c.save(); c.globalAlpha = .25; tCircle(c, '#FFD97A', x, y + 2, 14); c.restore(); }
  function columns(c, x, y, h, n, gap, w){
    for (let i = 0; i < n; i++){
      const cx = x + i * gap; w = w || 14;
      tRect(c, STONE, cx - w / 2, y, w, h); tRect(c, 'rgba(255,255,255,.35)', cx - w / 2 + 2, y, 3, h); tRect(c, 'rgba(0,0,0,.16)', cx + w / 2 - 4, y, 4, h);
      for (let k = 1; k < 5; k++) tRect(c, 'rgba(0,0,0,.07)', cx - w / 2 + k * (w / 5), y, 1, h);                                       /* flutes */
      tRect(c, STONE_D, cx - w / 2 - 4, y - 7, w + 8, 8); tRect(c, STONE, cx - w / 2 - 6, y - 12, w + 12, 6); tRect(c, STONE_D, cx - w / 2 - 4, y + h - 5, w + 8, 5); tRect(c, STONE, cx - w / 2 - 6, y + h, w + 12, 4);
    }
  }
  function steps(c, cx, w, n, h0){
    for (let i = 0; i < n; i++){ const sw = w + (n - i) * 14, sy = TG - h0 + i * 7; tRect(c, i % 2 ? STONE : '#E4DBC4', cx - sw / 2, sy, sw, 7); tRect(c, 'rgba(0,0,0,.14)', cx - sw / 2, sy + 5, sw, 2); }
  }
  function slateRoof(c, pts, seed){ tPoly(c, SLATE, pts); K.tiles(c, pts, seed); }
  function crest(c, x, y, s, col){                                                 /* the university crest: a shield with a book and a giraffe's neck */
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#2B3A5A'; c.beginPath(); c.moveTo(-14, -16); c.lineTo(14, -16); c.lineTo(14, 2); c.quadraticCurveTo(14, 14, 0, 20); c.quadraticCurveTo(-14, 14, -14, 2); c.closePath(); c.fill();
    c.strokeStyle = col || GOLD; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#F6E7B8'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(0, 3); c.lineTo(9, 0); c.lineTo(9, 8); c.lineTo(0, 11); c.lineTo(-9, 8); c.closePath(); c.fill();
    c.strokeStyle = '#8A6A2A'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 3); c.lineTo(0, 11); c.stroke();
    c.fillStyle = '#E8A93C'; c.fillRect(-2, -13, 4, 14); c.beginPath(); c.ellipse(1, -14, 5, 3.4, -0.3, 0, TAU); c.fill(); c.fillStyle = '#7A4A1A'; c.fillRect(-1, -8, 1.6, 1.6); c.fillRect(0.4, -4, 1.6, 1.6);
    c.restore();
  }
  function clockFace(c, x, y, r, hh, mm){
    tCircle(c, GOLD, x, y, r + 4); tCircle(c, '#2B3040', x, y, r + 1.5); tCircle(c, '#FBF6E6', x, y, r);
    for (let i = 0; i < 12; i++){ const a = i * TAU / 12; ln(c, '#2B3040', i % 3 ? 1 : 2, x + Math.sin(a) * (r - 1), y - Math.cos(a) * (r - 1), x + Math.sin(a) * (r - (i % 3 ? 4 : 6)), y - Math.cos(a) * (r - (i % 3 ? 4 : 6))); }
    const ah = (hh % 12 + mm / 60) * TAU / 12, am = mm * TAU / 60;
    ln(c, '#2B3040', 3, x, y, x + Math.sin(ah) * r * 0.5, y - Math.cos(ah) * r * 0.5); ln(c, '#2B3040', 2, x, y, x + Math.sin(am) * r * 0.78, y - Math.cos(am) * r * 0.78); tCircle(c, '#B8342A', x, y, 2);
  }
  function plaque(c, text, x, y, w, size){ tRound(c, '#2B3A5A', x - w / 2, y - 14, w, 28, 4); tRect(c, GOLD, x - w / 2 + 3, y - 11, w - 6, 1.5); tRect(c, GOLD, x - w / 2 + 3, y + 9.5, w - 6, 1.5); ivText(c, text, x, y + 4, size || 14, '#F6E7B8'); }
  function door2(c, x, w, h, col){                                                  /* a double door with panels, glass over the top and brass */
    tRound(c, '#3A2A1E', x - w / 2 - 4, TG - h - 4, w + 8, h + 4, 8);
    tRound(c, col || '#6A3A22', x - w / 2, TG - h, w, h, 6);
    for (let s = 0; s < 2; s++){
      const dx = x - w / 2 + 4 + s * (w / 2); tRect(c, 'rgba(0,0,0,.2)', dx, TG - h + 8, w / 2 - 8, h * 0.36); tRect(c, 'rgba(0,0,0,.2)', dx, TG - h * 0.52, w / 2 - 8, h * 0.46);
      tRect(c, '#FFE7A8', dx + 3, TG - h + 11, w / 2 - 14, h * 0.36 - 6); tRect(c, 'rgba(60,40,24,.5)', dx + (w / 2 - 8) / 2 - 1, TG - h + 11, 2, h * 0.36 - 6);
      tCircle(c, GOLD, x + (s ? 8 : -8), TG - h * 0.42, 2.8);
    }
    tRect(c, 'rgba(0,0,0,.3)', x - 1, TG - h, 2, h);
  }
  function sign(c, text, x, y, w, col){ tSign(c, text, x, y, w, col || '#2B3A5A', '#F6E7B8'); }
  function pennant(c, x, y, col, dir){ ln(c, '#8A8E98', 3, x, y, x, y - 54); tPoly(c, col, [x + 1, y - 54, x + dir * 44, y - 44, x + 1, y - 34]); tRect(c, 'rgba(255,255,255,.3)', x + 2, y - 50, dir * 36, 2); tCircle(c, GOLD, x, y - 56, 3); }

  /* =============================================================== THE STREET BUILDINGS =============================================================== */
  const BUILD = {
    u_gate: function(c, D, b){
      const x = b.x, W = b.w, x0 = x - W / 2, open = !b.gate || b.gate();
      shadow(c, x, W + 80);
      K.blocks(c, x0 - 30, TG - 150, 34, 150, 17, 11, 91); tRect(c, STONE, x0 - 30, TG - 150, 34, 150); K.blocks(c, x0 - 30, TG - 150, 34, 150, 17, 11, 91);        /* two stone pillars with caps and lamps */
      tRect(c, STONE, x0 + W - 4, TG - 150, 34, 150); K.blocks(c, x0 + W - 4, TG - 150, 34, 150, 17, 11, 92);
      [x0 - 30, x0 + W - 4].forEach(function(px){ tRect(c, STONE_D, px - 4, TG - 160, 42, 12); tRect(c, STONE, px - 2, TG - 170, 38, 10); tPoly(c, STONE_D, [px, TG - 170, px + 34, TG - 170, px + 17, TG - 192]); tCircle(c, GOLD, px + 17, TG - 195, 4); lantern(c, px + 17, TG - 160 + 22); });
      tRect(c, '#1E1E24', x0 + 4, TG - 140, W - 8, 8);                                                                                                                            /* the sign arch over the top */
      c.strokeStyle = '#1E1E24'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 4, TG - 140); c.quadraticCurveTo(x, TG - 196, x0 + W - 4, TG - 140); c.stroke();
      c.lineWidth = 2; c.strokeStyle = GOLD; for (let i = 0; i < 7; i++){ const t = i / 6, ax = x0 + 4 + t * (W - 8), ay = TG - 140 - Math.sin(t * Math.PI) * 36; c.beginPath(); c.arc(ax, ay + 2, 3, 0, TAU); c.stroke(); }
      tRound(c, '#1E1E24', x - 74, TG - 188, 148, 22, 4); ivText(c, 'LONGNECK UNIVERSITY', x, TG - 172, 12, GOLD);
      crest(c, x, TG - 214, 0.8, GOLD);
      /* the gate leaves: iron bars with spear tips and scrolls */
      const bars = W > 160 ? 9 : 6;
      for (let side = 0; side < 2; side++){
        const gx = side ? x + 2 : x0 + 8, gw = W / 2 - 10;
        for (let i = 0; i < bars; i++){ const bx = gx + 4 + i * ((gw - 8) / (bars - 1)), tip = TG - 126 + Math.abs(i - (bars - 1) / 2) * 1.4; tRect(c, '#1E1E24', bx - 1.6, tip, 3.2, TG - tip); tPoly(c, '#1E1E24', [bx - 3.4, tip, bx + 3.4, tip, bx, tip - 11]); }
        tRect(c, '#1E1E24', gx, TG - 100, gw, 5); tRect(c, '#1E1E24', gx, TG - 40, gw, 5);
        c.strokeStyle = '#1E1E24'; c.lineWidth = 2.4; c.beginPath(); c.arc(gx + gw / 2, TG - 70, 16, 0, TAU); c.stroke(); c.beginPath(); c.arc(gx + gw / 2, TG - 70, 6, 0, TAU); c.stroke();
      }
      tRect(c, 'rgba(255,255,255,.12)', x0 + 12, TG - 124, 2, 120);
      if (!open){ ln(c, '#8A8E98', 3, x - 40, TG - 80, x + 40, TG - 66); tCircle(c, '#8A8E98', x - 40, TG - 80, 4); tRound(c, '#E3B94A', x - 11, TG - 72, 22, 20, 4); c.strokeStyle = '#B8902A'; c.lineWidth = 3; c.beginPath(); c.arc(x, TG - 72, 7, Math.PI, 0); c.stroke(); tCircle(c, '#7A5A10', x, TG - 62, 2); }
      else { tRect(c, 'rgba(255,233,160,.18)', x - 30, TG - 20, 60, 20); }
      ivy(c, x0 - 30, TG - 150, 34, 70, 31); ivy(c, x0 + W - 4, TG - 150, 34, 54, 32);
      tRect(c, '#B8AE96', x0 - 40, TG - 6, W + 80, 6);
    },
    u_arch: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2;
      shadow(c, x, W + 20);
      tRect(c, STONE, x0, TG - h, W, h); K.blocks(c, x0, TG - h, W, h, 24, 13, 41);
      c.fillStyle = '#2A2630'; c.beginPath(); c.moveTo(x - 46, TG); c.lineTo(x - 46, TG - 110); c.arc(x, TG - 110, 46, Math.PI, 0); c.lineTo(x + 46, TG); c.fill();
      c.fillStyle = '#7EAA5E'; c.beginPath(); c.moveTo(x - 38, TG); c.lineTo(x - 38, TG - 108); c.arc(x, TG - 108, 38, Math.PI, 0); c.lineTo(x + 38, TG); c.fill();       /* the lawn through the arch */
      tRect(c, '#9EC8E8', x - 38, TG - 146, 76, 30); tEll(c, '#F5F5F0', x - 10, TG - 128, 14, 5);
      c.strokeStyle = STONE_D; c.lineWidth = 8; c.beginPath(); c.arc(x, TG - 110, 50, Math.PI, 0); c.stroke();
      tPoly(c, CREAM, [x - 8, TG - 166, x + 8, TG - 166, x, TG - 178]);
      tRect(c, STONE_D, x0 - 8, TG - h - 8, W + 16, 10); tRect(c, STONE, x0 - 8, TG - h - 14, W + 16, 6);
      for (let i = 0; i < 6; i++){ tRect(c, STONE, x0 - 8 + i * ((W + 16) / 6), TG - h - 24, (W + 16) / 12, 10); }                                                            /* battlements */
      plaque(c, 'TOWN SQUARE', x, TG - h + 32, 118, 11); tPoly(c, GOLD, [x - 66, TG - h + 32, x - 56, TG - h + 26, x - 56, TG - h + 38]);
      lantern(c, x0 + 12, TG - 110); lantern(c, x0 + W - 12, TG - 110); ivy(c, x0, TG - h, 40, 90, 51); ivy(c, x0 + W - 36, TG - h, 36, 60, 52);
    },
    u_hall: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h, tw = 130, tx0 = x - tw / 2, wingTop = TG - 190;
      shadow(c, x, W + 30);
      /* the two wings, brick, with stone courses and a plinth */
      [[x0, (W - tw) / 2], [tx0 + tw, (W - tw) / 2]].forEach(function(wg, k){
        tRect(c, BRICK, wg[0], wingTop, wg[1], TG - wingTop); K.bricks(c, wg[0], wingTop, wg[1], TG - wingTop, 9, 20, 61 + k);
        tRect(c, STONE, wg[0], wingTop + 74, wg[1], 5); tRect(c, STONE_D, wg[0], TG - 16, wg[1], 16); tRect(c, 'rgba(0,0,0,.14)', wg[0], TG - 16, wg[1], 2);
        slateRoof(c, [wg[0] - 12, wingTop, wg[0] + wg[1] + (k ? 12 : 0), wingTop, wg[0] + wg[1] + (k ? -10 : 0) - 8, wingTop - 54, wg[0] + 8 + (k ? 0 : 6), wingTop - 54], 70 + k);
        tRect(c, STONE, wg[0] - 12, wingTop - 2, wg[1] + 24, 5);
        for (let i = 0; i < 2; i++){ const dx = wg[0] + 40 + i * ((wg[1] - 124) * 0.5 + 40); /* a dormer in the roof */ tRect(c, STONE, dx, wingTop - 44, 26, 26); tRect(c, '#FFE7A8', dx + 4, wingTop - 40, 18, 20); tPoly(c, SLATE_L, [dx - 4, wingTop - 44, dx + 30, wingTop - 44, dx + 13, wingTop - 58]); D._win.push({ x: dx + 4, y: wingTop - 40, w: 18, h: 20 }); }
        for (let i = 0; i < 2; i++){ const wx = wg[0] + 28 + i * (wg[1] - 90) * 0.6 + (k ? 20 : 0); archWin(c, D, wx, wingTop + 20, 30, 50, i === 1); archWin(c, D, wx, TG - 98, 30, 66, false); }
        for (let i = 0; i < 4; i++) tRect(c, '#E8E0CC', wg[0] + 14 + i * 7, wingTop - 10, 3, 6);                                                                           /* chimney pots */
      });
      tRect(c, BRICK_D, x0 + 40, wingTop - 62, 22, 30); tRect(c, STONE_D, x0 + 36, wingTop - 66, 30, 6);                                                                     /* a chimney */
      /* the clock tower in the middle: stone, a belfry, a clock and a spire */
      tRect(c, STONE, tx0, top + 30, tw, TG - top - 30); K.blocks(c, tx0, top + 30, tw, TG - top - 30, 26, 14, 81);
      tRect(c, STONE_D, tx0 - 8, top + 24, tw + 16, 10); tRect(c, STONE, tx0 - 4, top + 14, tw + 8, 10);
      clockFace(c, x, top + 76, 30, 10, 10);
      for (let i = 0; i < 3; i++) archWin(c, D, tx0 + 20 + i * 32, top + 128, 18, 34, i === 1);
      tRect(c, STONE_D, tx0 + 6, top + 118, tw - 12, 5);
      slateRoof(c, [tx0 - 10, top + 14, tx0 + tw + 10, top + 14, x + 8, top - 62, x - 8, top - 62], 95); ln(c, '#8A8E98', 3, x, top - 62, x, top - 90); tCircle(c, GOLD, x, top - 92, 4); tPoly(c, '#B8342A', [x + 1, top - 88, x + 30, top - 82, x + 1, top - 76]);
      for (let i = 0; i < 4; i++){ const cx = i < 2 ? tx0 - 6 + i * (tw + 12) : 0; if (i < 2){ tRect(c, STONE, cx, top + 6, 6, 16); tPoly(c, STONE_D, [cx - 2, top + 6, cx + 8, top + 6, cx + 3, top - 8]); } }
      /* the portico: four columns, a pediment with the crest, steps and the doors */
      const pw = 190, px0 = x - pw / 2, py = TG - 150;
      tRect(c, STONE_D, px0 - 6, py - 8, pw + 12, 10); tPoly(c, STONE, [px0 - 10, py - 8, px0 + pw + 10, py - 8, x, py - 52]); tPoly(c, STONE_D, [px0 + 8, py - 12, px0 + pw - 8, py - 12, x, py - 44]); crest(c, x, py - 22, 0.55, GOLD);
      tRect(c, '#33281E', px0, py, pw, 150); columns(c, px0 + 18, py + 4, 134, 4, (pw - 36) / 3, 16);
      door2(c, x, 54, 96, '#5A3220'); tPoly(c, STONE, [x - 34, TG - 96, x + 34, TG - 96, x + 28, TG - 108, x - 28, TG - 108]);
      steps(c, x, pw - 20, 4, 24); lantern(c, px0 + 42, TG - 110); lantern(c, px0 + pw - 42, TG - 110);
      plaque(c, 'REGISTRAR’S HALL', x, py + 22, 128, 12);
      ivy(c, x0, wingTop, 90, 120, 101); pennant(c, x0 + 14, wingTop - 40, '#2B3A5A', 1); pennant(c, x0 + W - 14, wingTop - 40, '#B8342A', -1);
    },
    u_lecture: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
      shadow(c, x, W + 30);
      tRect(c, '#C7B590', x0, top + 40, W, TG - top - 40); K.blocks(c, x0, top + 40, W, TG - top - 40, 30, 14, 121);
      tRect(c, STONE_D, x0 - 6, TG - 14, W + 12, 14);
      /* a copper dome with ribs, a lantern and a golden book on top */
      c.fillStyle = '#5E9A86'; c.beginPath(); c.ellipse(x, top + 44, W * 0.4, 70, 0, Math.PI, 0); c.fill();
      c.strokeStyle = 'rgba(20,60,50,.4)'; c.lineWidth = 2; for (let i = -3; i <= 3; i++){ c.beginPath(); c.moveTo(x + i * (W * 0.4 / 3.4), top + 44); c.quadraticCurveTo(x + i * 26, top - 14, x + i * 4, top - 24); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(x - W * 0.14, top + 8, 20, 36, -0.5, 0, TAU); c.fill();
      tRect(c, STONE, x - 14, top - 40, 28, 18); archWin(c, D, x - 5, top - 38, 10, 14, true); tPoly(c, '#5E9A86', [x - 17, top - 40, x + 17, top - 40, x, top - 62]);
      tRound(c, GOLD, x - 12, top - 72, 24, 10, 2); tPoly(c, GOLD, [x - 12, top - 72, x, top - 78, x + 12, top - 72]); ln(c, '#8A6A18', 1.4, x, top - 78, x, top - 62);
      tRect(c, STONE_D, x0 - 8, top + 36, W + 16, 10); tRect(c, STONE, x0 - 8, top + 30, W + 16, 7);
      /* a curved front: tall arched windows, a stepped entrance with a canopy */
      for (let i = 0; i < 4; i++){ const wx = x0 + 26 + i * 82 + (i > 1 ? 40 : 0) - (i > 1 ? 0 : 0); if (i === 1 || i === 2) continue; archWin(c, D, wx - (i > 1 ? 0 : 0), top + 70, 36, 90, true); }
      door2(c, x, 66, 110, '#4A3E58');
      tRect(c, '#33281E', x - 54, TG - 140, 108, 6); tPoly(c, '#5E9A86', [x - 66, TG - 140, x + 66, TG - 140, x + 56, TG - 158, x - 56, TG - 158]); ln(c, '#8A8E98', 4, x - 54, TG - 134, x - 54, TG - 6); ln(c, '#8A8E98', 4, x + 54, TG - 134, x + 54, TG - 6);
      steps(c, x, 120, 3, 18);
      /* a banner over the door and two posters either side */
      tRound(c, '#2B3A5A', x - 80, TG - 190, 160, 34, 4); tRect(c, GOLD, x - 76, TG - 187, 152, 1.5); ivText(c, 'LECTURE THEATER', x, TG - 166, 14, '#F6E7B8');
      [[x0 + 76, '#F2C230'], [x0 + W - 104, '#E85D4A']].forEach(function(p, k){ tRect(c, '#3A2A1E', p[0] - 2, TG - 120, 32, 44); tRect(c, '#F4F1E8', p[0], TG - 118, 28, 40); tRect(c, p[1], p[0] + 3, TG - 115, 22, 12); for (let r2 = 0; r2 < 3; r2++) tRect(c, '#8A8E98', p[0] + 3, TG - 99 + r2 * 6, 22 - r2 * 5, 2); });
      lantern(c, x - 72, TG - 100); lantern(c, x + 72, TG - 100); ivy(c, x0, top + 40, 60, 90, 131);
    },
    u_library: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
      shadow(c, x, W + 30);
      tRect(c, '#8E4A38', x0, top + 50, W, TG - top - 50); K.bricks(c, x0, top + 50, W, TG - top - 50, 9, 22, 141);
      tRect(c, STONE, x0, top + 44, W, 8); tRect(c, STONE_D, x0, TG - 16, W, 16);
      slateRoof(c, [x0 - 14, top + 50, x0 + W + 14, top + 50, x0 + W - 40, top - 4, x0 + 40, top - 4], 151);
      /* a high central gable with a round window and an owl */
      tPoly(c, STONE, [x - 90, top + 50, x + 90, top + 50, x, top - 60]); tPoly(c, STONE_D, [x - 74, top + 46, x + 74, top + 46, x, top - 44]); K.blocks(c, x - 74, top - 4, 148, 50, 28, 12, 152);
      tCircle(c, STONE, x, top + 6, 24); tCircle(c, '#2B3A5A', x, top + 6, 19); tCircle(c, '#FFE7A8', x, top + 6, 16);
      c.strokeStyle = '#3A2A1E'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 16, top + 6); c.lineTo(x + 16, top + 6); c.moveTo(x, top - 10); c.lineTo(x, top + 22); c.stroke(); D._win.push({ x: x - 16, y: top - 10, w: 32, h: 32, round: true });
      tEll(c, '#8A7A5A', x, top - 66, 8, 10); tCircle(c, '#FFD84D', x - 3, top - 68, 2.4); tCircle(c, '#FFD84D', x + 3, top - 68, 2.4); tPoly(c, '#C9772E', [x - 1.4, top - 65, x + 1.4, top - 65, x, top - 61]);
      /* tall windows with books on show, two columns and a studded oak door */
      for (let i = 0; i < 4; i++){ const wx = x0 + [22, 84, 284, 346][i]; archWin(c, D, wx, top + 82, 32, 94, true);
        for (let k = 0; k < 5; k++) tRect(c, ['#B5502A', '#2F5F94', '#3E7A3A', '#E8B830', '#8A3AA8'][(i + k) % 5], wx + 3 + k * 5, top + 150, 4, 22); }
      columns(c, x - 52, TG - 130, 118, 2, 104, 14);
      door2(c, x, 62, 108, '#4A2C1A'); tPoly(c, STONE, [x - 40, TG - 108, x + 40, TG - 108, x + 34, TG - 124, x - 34, TG - 124]);
      steps(c, x, 110, 3, 18); lantern(c, x - 60, TG - 110); lantern(c, x + 60, TG - 110);
      sign(c, 'UNIVERSITY LIBRARY', x, top + 66, 210); ivy(c, x0 + W - 70, top + 50, 70, 110, 161); ivy(c, x0, top + 50, 40, 80, 162);
    },
    u_hw: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
      shadow(c, x, W + 24);
      tRect(c, '#B8452F', x0, top + 36, W, TG - top - 36); K.bricks(c, x0, top + 36, W, TG - top - 36, 9, 22, 171);
      tRect(c, '#6A6A74', x0, TG - 14, W, 14);
      /* a sawtooth roof with glazed north lights */
      for (let i = 0; i < 3; i++){ const sx = x0 + i * (W / 3); tPoly(c, SLATE, [sx, top + 36, sx + W / 3, top + 36, sx + W / 3, top - 14, sx, top + 36]); tPoly(c, '#9DCBEA', [sx + W / 3 - 4, top + 34, sx + W / 3 - 4, top - 8, sx + W / 3 - 34, top + 34]); ln(c, '#4B5568', 2, sx + W / 3 - 20, top + 34, sx + W / 3 - 4, top - 4); D._win.push({ x: sx + W / 3 - 34, y: top - 8, w: 30, h: 42, poly: [[1, 1], [1, 0], [0, 1]] }); }
      tRect(c, '#4B5568', x0 - 4, top + 34, W + 8, 5);
      /* big workroom windows, each with a lamp and a desk inside */
      for (let i = 0; i < 4; i++){ if (i === 2 || i === 1 && false) continue; const wx = x0 + 22 + i * 74 - (i > 1 ? 0 : 0); if (Math.abs(wx + 28 - x) < 50) continue;
        tRect(c, '#3A4A5A', wx - 4, top + 62, 66, 78); tRect(c, '#FFE7A8', wx, top + 66, 58, 70); tRect(c, 'rgba(255,255,255,.28)', wx + 2, top + 68, 10, 66);
        tRect(c, '#7A5230', wx + 6, top + 112, 46, 5); tRect(c, '#5A3A1E', wx + 10, top + 117, 4, 18); tRect(c, '#5A3A1E', wx + 44, top + 117, 4, 18); ln(c, '#2A2A30', 2, wx + 38, top + 112, wx + 32, top + 96); tPoly(c, '#E8B830', [wx + 26, top + 96, wx + 40, top + 94, wx + 36, top + 88]);
        tRect(c, '#3A4A5A', wx + 28, top + 66, 2, 70); D._win.push({ x: wx, y: top + 66, w: 58, h: 70 }); }
      /* a pencil taller than the door, standing up against the wall, and a bulletin board */
      const pxx = x + 54; tRect(c, '#F2C230', pxx, top + 56, 18, 120); tRect(c, '#D49A1E', pxx + 12, top + 56, 6, 120); tPoly(c, '#E8C899', [pxx, top + 56, pxx + 18, top + 56, pxx + 9, top + 34]); tPoly(c, '#2B3040', [pxx + 5, top + 42, pxx + 13, top + 42, pxx + 9, top + 34]); tRect(c, '#C9CDD9', pxx, top + 172, 18, 8); tRect(c, '#E88A9A', pxx, top + 180, 18, 8);
      door2(c, x - 30, 54, 92, '#3A5A7A'); tRect(c, '#33281E', x - 62, TG - 108, 64, 6);
      sign(c, 'HOMEWORK HALL', x, top + 48, 190); lantern(c, x - 70, TG - 96);
      tRect(c, '#C9B48A', x + 84, TG - 80, 44, 34); tRect(c, '#7A5230', x + 82, TG - 82, 48, 4); [['#F4F1E8', 0], ['#FFE7A8', 1], ['#F2B8C9', 2], ['#B8E0F2', 3]].forEach(function(p){ tRect(c, p[0], x + 88 + (p[1] % 2) * 20, TG - 76 + Math.floor(p[1] / 2) * 16, 16, 13); });
    },
    u_exam: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
      shadow(c, x, W + 30);
      tRect(c, '#CFC8B8', x0, top + 40, W, TG - top - 40); K.blocks(c, x0, top + 40, W, TG - top - 40, 34, 16, 181);
      tRect(c, STONE_D, x0 - 6, TG - 12, W + 12, 12);
      /* a stern flat-topped front: tall slit windows, a heavy cornice, a great clock and four plain columns */
      tRect(c, '#B8AE96', x0 - 10, top + 28, W + 20, 14); tRect(c, STONE, x0 - 6, top + 20, W + 12, 10); tRect(c, 'rgba(0,0,0,.16)', x0 - 10, top + 40, W + 20, 3);
      for (let i = 0; i < 9; i++) tRect(c, STONE, x0 - 6 + i * ((W + 12) / 9), top + 10, (W + 12) / 18, 11);
      tPoly(c, STONE, [x - 70, top + 20, x + 70, top + 20, x + 56, top - 20, x - 56, top - 20]); tPoly(c, STONE_D, [x - 56, top + 14, x + 56, top + 14, x + 46, top - 12, x - 46, top - 12]);
      clockFace(c, x, top + 56, 24, 9, 0);
      /* the scales of justice over the clock */
      ln(c, GOLD, 2.4, x, top - 14, x, top - 4); ln(c, GOLD, 2, x - 16, top - 10, x + 16, top - 10); [[-16, 0], [16, 0]].forEach(function(p){ ln(c, GOLD, 1, x + p[0], top - 10, x + p[0] - 5, top - 2); ln(c, GOLD, 1, x + p[0], top - 10, x + p[0] + 5, top - 2); tEll(c, GOLD, x + p[0], top - 1, 6, 2); });
      for (let i = 0; i < 3; i++){ if (i === 1) continue; const wx = x0 + 30 + i * 110 + (i ? 20 : 0); tRect(c, STONE_D, wx - 4, top + 84, 36, 96); tRect(c, '#2B3A5A', wx, top + 88, 28, 88); tRect(c, '#FFE7A8', wx + 8, top + 92, 12, 80); tRect(c, 'rgba(255,255,255,.2)', wx + 2, top + 90, 4, 84); D._win.push({ x: wx + 8, y: top + 92, w: 12, h: 80 }); }
      columns(c, x - 74, top + 98, 130, 2, 148, 18);
      door2(c, x, 66, 104, '#2B3A5A');
      steps(c, x, 120, 4, 24);
      plaque(c, 'EXAMINATION HALL', x, top + 118, 156, 12);
      tRound(c, '#12141C', x0 + 12, TG - 74, 48, 42, 3); tRect(c, '#F4F1E8', x0 + 16, TG - 70, 40, 34); ivText(c, 'SILENCE', x0 + 36, TG - 52, 9, '#B8342A'); ivText(c, 'PLEASE', x0 + 36, TG - 41, 9, '#2B3040');
      lantern(c, x0 + W - 22, TG - 100); lantern(c, x - 78, TG - 110); ivy(c, x0 + W - 60, top + 40, 60, 80, 191);
    },
    u_cafe: function(c, D, b){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
      shadow(c, x, W + 24);
      tRect(c, '#E9D3A6', x0, top, W, h); K.stucco(c, x0, top, W, h, 201);
      tRect(c, '#8A5A3A', x0, TG - 24, W, 24); K.boards(c, x0, TG - 24, W, 24, 8, true, 202);
      tPoly(c, '#7A4A32', [x0 - 12, top + 4, x0 + W + 12, top + 4, x0 + W - 22, top - 34, x0 + 22, top - 34]); K.tiles(c, [x0 - 12, top + 4, x0 + W + 12, top + 4, x0 + W - 22, top - 34, x0 + 22, top - 34], 203);
      tRect(c, '#5A3A24', x0 - 14, top + 2, W + 28, 6); tRect(c, '#C98A44', x0 + W - 70, top - 62, 22, 30); tRect(c, '#8A5A3A', x0 + W - 74, top - 66, 30, 6);
      c.save(); c.globalAlpha = 0.5; for (let i = 0; i < 3; i++) tCircle(c, '#FFFFFF', x0 + W - 59 + i * 6, top - 76 - i * 16, 6 + i * 2); c.restore();
      /* a big shop window with cups and cakes on the sill, a striped awning, a hanging cup sign, a chalkboard */
      tRect(c, '#4A3A2C', x0 + 20, top + 50, 150, 98); tRect(c, '#FFE7A8', x0 + 24, top + 54, 142, 90); tRect(c, 'rgba(255,255,255,.3)', x0 + 28, top + 58, 22, 82); D._win.push({ x: x0 + 24, y: top + 54, w: 142, h: 90 });
      tRect(c, '#7A5230', x0 + 16, top + 148, 158, 7); for (let i = 0; i < 4; i++){ tRound(c, ['#F4F1E8', '#E8B7C9', '#F2D9A0', '#B8E0F2'][i], x0 + 32 + i * 34, top + 130, 24, 18, 4); tRect(c, '#6A3A1E', x0 + 36 + i * 34, top + 126, 16, 6); }
      tAwning(c, x0 + 10, top + 38, 170, 22, '#C9503C', '#F4F1E8');
      tDoor(c, x0 + W - 62, 52, 96, '#6A3A22'); tAwning(c, x0 + W - 94, top + 70, 68, 16, '#2F6A5A', '#F4F1E8');
      tRound(c, '#3A2A1E', x - 52, top + 12, 104, 24, 4); ivText(c, 'CAMPUS CAFÉ', x, top + 29, 13, '#FFE9A8');
      ln(c, '#2A2A30', 2, x0 + 200, top + 8, x0 + 200, top + 24); tRound(c, '#F4F1E8', x0 + 188, top + 24, 24, 20, 5); tRect(c, '#6A3A1E', x0 + 190, top + 28, 20, 5); c.strokeStyle = '#F4F1E8'; c.lineWidth = 3; c.beginPath(); c.arc(x0 + 214, top + 34, 5, -1.4, 1.4); c.stroke();
      tRect(c, '#2B3A2E', x0 + W - 28, TG - 96, 22, 60); tRect(c, '#7A5230', x0 + W - 30, TG - 98, 26, 4); ivText(c, 'TEA', x0 + W - 17, TG - 78, 7, '#F4F1E8');
      for (let i = 0; i < 3; i++){ const px = x0 + 40 + i * 50; K.pot(c, px, TG - 8, 1); }
      /* two outdoor tables under parasols */
      [x0 - 4, x0 + 104].forEach(function(tx, k){ const ty = TG; ln(c, '#6A4A2C', 3, tx + 40, ty, tx + 40, ty - 78); tPoly(c, k ? '#2F6A5A' : '#C9503C', [tx + 4, ty - 78, tx + 76, ty - 78, tx + 40, ty - 100]); tPoly(c, '#F4F1E8', [tx + 22, ty - 78, tx + 40, ty - 78, tx + 40, ty - 100, tx + 30, ty - 90]); tRound(c, '#8A8E98', tx + 20, ty - 34, 40, 5, 2); tRect(c, '#6A6E78', tx + 38, ty - 30, 4, 30); tRect(c, '#6A6E78', tx + 30, ty - 4, 20, 4); tRect(c, '#F4F1E8', tx + 28, ty - 42, 8, 8); });
    }
  };
  const prevB = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    const f = BUILD[b.kind];
    if (f && !D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return prevB(c, D, b, P, r);
  };

  /* =============================================================== PROPS =============================================================== */
  const PROPS = {
    u_ground: function(c, D){                                                       /* lawns in mown stripes, a paved path in running bond, steps to every door, daisies and leaves */
      const W = D.w, r = miniRng(777);
      for (let x = 0; x < W; x += 60){ c.fillStyle = (x / 60) % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,40,0,.07)'; c.fillRect(x, TG + 40, 60, 60); }
      tRect(c, '#C9BFA0', 0, TG, W, 38);
      for (let row = 0, y = TG; y < TG + 38; row++, y += 9.5){ for (let x = -(row % 2) * 20; x < W; x += 40){ const v = r(); c.fillStyle = v < 0.3 ? 'rgba(255,240,200,.18)' : v < 0.6 ? 'rgba(80,60,30,.08)' : 'rgba(0,0,0,.03)'; c.fillRect(x + 0.8, y + 0.8, 38.4, 8); } c.fillStyle = 'rgba(70,55,30,.22)'; c.fillRect(0, y + 8.6, W, 1); }
      for (let x = 0; x < W; x += 40) for (let row = 0; row < 4; row++){ if (r() < 0.5) continue; c.fillStyle = 'rgba(70,55,30,.2)'; c.fillRect(x + (row % 2 ? 20 : 0), TG + row * 9.5, 1, 9.5); }
      tRect(c, '#9A9078', 0, TG + 36, W, 4); tRect(c, 'rgba(255,255,255,.3)', 0, TG + 36, W, 1.4); tRect(c, 'rgba(0,0,0,.2)', 0, TG, W, 2);
      D.b.forEach(function(b){ if (b.kind === 'u_arch') return; const sw = Math.min(110, b.w * 0.4); tRect(c, '#CFC5A8', b.x - sw / 2, TG + 36, sw, 62); for (let i = 0; i < 4; i++) tRect(c, 'rgba(70,55,30,.2)', b.x - sw / 2, TG + 40 + i * 14, sw, 1); tRect(c, 'rgba(70,55,30,.2)', b.x, TG + 36, 1.4, 62); tRect(c, '#9A9078', b.x - sw / 2, TG + 98, sw, 3); });
      for (let i = 0; i < Math.round(W / 50); i++){ const dx = r() * W, dy = TG + 48 + r() * 46; ln(c, '#4E8A3E', 1.2, dx, dy, dx, dy - 4); tCircle(c, '#FFFFFF', dx - 2, dy - 5, 1.6); tCircle(c, '#FFFFFF', dx + 2, dy - 5, 1.6); tCircle(c, '#FFFFFF', dx, dy - 7, 1.6); tCircle(c, '#F2C230', dx, dy - 5, 1.4); }
      for (let i = 0; i < Math.round(W / 35); i++){ c.fillStyle = ['#C9772E', '#B5502A', '#D9A02E', '#8A7A2A'][i % 4]; c.beginPath(); c.ellipse(r() * W, TG + 4 + r() * 80, 3.6, 1.9, r() * TAU, 0, TAU); c.fill(); }
      for (let i = 0; i < Math.round(W / 14); i++){ const gx = r() * W, gy = TG + 44 + r() * 54; for (let k = 0; k < 3; k++) ln(c, '#3E7A3A', 1.2, gx + k * 2, gy, gx + k * 2 - 2 + k, gy - 6 - k); }
    },
    u_hedge: function(c, D, p){
      const x = p.x; shadow(c, x, 100);
      tRound(c, '#2E6030', x - 46, TG - 40, 92, 40, 8);
      for (let i = 0; i < 14; i++) K.leafBlob(c, x - 40 + i * 6.2, TG - 30 - (i % 3) * 3, 11, 300 + i + Math.round(x), '#3E7A3A', '#6AA84A', '#2A5A2C');
      tRect(c, 'rgba(255,255,255,.14)', x - 44, TG - 38, 88, 2);
      ln(c, '#5A3A1E', 3, x + 62, TG, x + 62, TG - 26); tCircle(c, '#3E7A3A', x + 62, TG - 44, 20); for (let i = 0; i < 8; i++) K.dot(c, 'rgba(160,220,110,.5)', x + 52 + (i % 4) * 7, TG - 54 + Math.floor(i / 4) * 12 + (i % 2) * 4, 2); tRound(c, '#B8774A', x + 52, TG - 8, 20, 10, 2);
    },
    u_notice: function(c, D, p){
      const x = p.x; shadow(c, x, 100);
      tRect(c, '#5A3A1E', x - 50, TG - 120, 6, 120); tRect(c, '#5A3A1E', x + 44, TG - 120, 6, 120); tPoly(c, '#7A4A32', [x - 60, TG - 120, x + 60, TG - 120, x + 48, TG - 138, x - 48, TG - 138]);
      tRound(c, '#5A3A1E', x - 46, TG - 116, 92, 66, 3); tRect(c, '#C9A26A', x - 42, TG - 112, 84, 58);
      [[-36, -106, 24, 20, '#F4F1E8'], [-8, -108, 22, 26, '#FFE79A'], [18, -106, 20, 18, '#F2B8C9'], [-30, -82, 26, 22, '#B8E0F2'], [2, -78, 20, 20, '#F4F1E8'], [22, -84, 16, 24, '#C8E8B0']].forEach(function(n, i){
        c.save(); c.translate(x + n[0] + n[2] / 2, TG + n[1] + n[3] / 2); c.rotate((i % 3 - 1) * 0.05); tRect(c, 'rgba(0,0,0,.18)', -n[2] / 2 + 1, -n[3] / 2 + 2, n[2], n[3]); tRect(c, n[4], -n[2] / 2, -n[3] / 2, n[2], n[3]);
        for (let k = 0; k < 3; k++) tRect(c, 'rgba(60,60,80,.45)', -n[2] / 2 + 3, -n[3] / 2 + 6 + k * 4, n[2] - 6 - k * 3, 1.4); tCircle(c, '#D5352B', 0, -n[3] / 2 + 2, 1.8); c.restore(); });
      tRect(c, '#5A3A1E', x - 46, TG - 52, 92, 6); tRect(c, '#4A3A2C', x - 44, TG - 36, 88, 8); ivText(c, 'LOST: ONE PENCIL. REWARD: A COOKIE', x, TG - 29.5, 5.5, '#FFE9A8', '600');
    },
    u_bikes: function(c, D, p){
      const x = p.x; shadow(c, x, 120);
      ln(c, '#6A6E78', 3, x - 54, TG - 22, x + 54, TG - 22); for (let i = 0; i < 4; i++){ c.strokeStyle = '#6A6E78'; c.lineWidth = 3; c.beginPath(); c.arc(x - 44 + i * 30, TG - 12, 13, Math.PI, 0); c.stroke(); }
      [['#D5352B', -40], ['#2F6AA8', -8], ['#3E8A5A', 24]].forEach(function(bk, i){
        const bx = x + bk[1], lean = (i - 1) * 0.06; c.save(); c.translate(bx, TG); c.rotate(lean);
        c.strokeStyle = '#1E1E24'; c.lineWidth = 2.4; c.beginPath(); c.arc(-17, -14, 14, 0, TAU); c.stroke(); c.beginPath(); c.arc(17, -14, 14, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 0.8; for (let s = 0; s < 6; s++){ const a = s * Math.PI / 3; c.beginPath(); c.moveTo(-17 + Math.cos(a) * 13, -14 + Math.sin(a) * 13); c.lineTo(-17 - Math.cos(a) * 13, -14 - Math.sin(a) * 13); c.moveTo(17 + Math.cos(a) * 13, -14 + Math.sin(a) * 13); c.lineTo(17 - Math.cos(a) * 13, -14 - Math.sin(a) * 13); c.stroke(); }
        ln(c, bk[0], 3, -17, -14, -4, -34); ln(c, bk[0], 3, -4, -34, 14, -34); ln(c, bk[0], 3, 14, -34, 17, -14); ln(c, bk[0], 3, -17, -14, 0, -14); ln(c, bk[0], 3, 0, -14, -4, -34); ln(c, bk[0], 3, 14, -34, 12, -42);
        ln(c, '#2A2A30', 3, 8, -42, 18, -42); tRound(c, '#2A2A30', -10, -40, 14, 5, 2); tCircle(c, '#8A8E98', 0, -14, 3);
        if (i === 1){ tRound(c, '#C98A44', 14, -50, 16, 12, 2); tRect(c, '#8A5A2A', 14, -52, 16, 3); }
        c.restore();
      });
      tRect(c, '#2B3A5A', x - 58, TG - 62, 20, 12); ivText(c, 'BIKES', x - 48, TG - 53, 6, '#F6E7B8');
    },
    u_statue: function(c, D, p){
      const x = p.x; shadow(c, x, 110);
      tRect(c, STONE_D, x - 44, TG - 16, 88, 16); K.blocks(c, x - 40, TG - 62, 80, 46, 20, 12, 441); tRect(c, STONE, x - 40, TG - 62, 80, 46); K.blocks(c, x - 40, TG - 62, 80, 46, 20, 12, 441); tRect(c, STONE_D, x - 46, TG - 70, 92, 10); tRect(c, 'rgba(255,255,255,.3)', x - 46, TG - 70, 92, 2);
      tRound(c, '#B8902A', x - 22, TG - 52, 44, 18, 2); ivText(c, 'THE FOUNDER', x, TG - 40, 7, '#2B3040');
      /* the founder: a bronze giraffe, reaching up, with a verdigris tinge */
      c.save(); c.translate(x, TG - 70);
      c.fillStyle = '#7A5A2E'; c.beginPath(); c.ellipse(0, -30, 24, 15, -0.1, 0, TAU); c.fill();
      [[-14, 8], [-6, 12], [10, 8], [18, 12]].forEach(function(l){ tRect(c, '#6A4A22', l[0], -20, 5, 20 + l[1] - 8); });
      c.fillStyle = '#7A5A2E'; c.beginPath(); c.moveTo(14, -38); c.lineTo(22, -90); c.lineTo(30, -88); c.lineTo(24, -34); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(30, -92, 11, 6.4, -0.3, 0, TAU); c.fill(); ln(c, '#6A4A22', 2, 28, -98, 27, -106); ln(c, '#6A4A22', 2, 33, -98, 34, -106); tCircle(c, '#6A4A22', 27, -107, 2); tCircle(c, '#6A4A22', 34, -107, 2);
      c.fillStyle = 'rgba(90,170,140,.45)'; c.beginPath(); c.ellipse(-4, -36, 14, 7, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(26, -70, 4, 12, 0.1, 0, TAU); c.fill();
      c.fillStyle = '#5A3E18'; for (let i = 0; i < 6; i++){ c.beginPath(); c.arc(-12 + i * 7, -32 + (i % 2) * 6, 2.8, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,230,160,.5)'; c.beginPath(); c.ellipse(-8, -38, 8, 2.6, -0.2, 0, TAU); c.fill();
      c.restore();
      /* a mortarboard that students have put on its head, as they do */
      c.save(); c.translate(x + 30, TG - 178); c.rotate(-0.15); tRect(c, '#1E1E24', -11, -2, 22, 3); tPoly(c, '#2B2F3A', [-8, -2, 8, -2, 6, 5, -6, 5]); ln(c, GOLD, 1.2, 10, -1, 12, 8); tCircle(c, GOLD, 12, 9, 1.8); c.restore();
    },
    u_fountain: function(c, D, p){
      const x = p.x; shadow(c, x, 190);
      tEll(c, STONE_D, x, TG - 4, 92, 14); tEll(c, '#6EA8C8', x, TG - 12, 84, 11); tEll(c, 'rgba(255,255,255,.28)', x - 20, TG - 14, 40, 3);
      tRound(c, STONE, x - 94, TG - 28, 188, 22, 6); K.blocks(c, x - 94, TG - 28, 188, 22, 24, 11, 451); tRect(c, 'rgba(255,255,255,.3)', x - 94, TG - 28, 188, 2); tEll(c, '#6EA8C8', x, TG - 26, 84, 8); tEll(c, 'rgba(255,255,255,.35)', x - 24, TG - 27, 34, 2.4);
      tRect(c, STONE, x - 10, TG - 90, 20, 66); tRect(c, 'rgba(0,0,0,.14)', x + 4, TG - 90, 6, 66); tEll(c, STONE, x, TG - 78, 48, 9); tEll(c, '#6EA8C8', x, TG - 80, 42, 6); tRect(c, STONE, x - 6, TG - 130, 12, 44); tEll(c, STONE, x, TG - 118, 28, 6); tEll(c, '#6EA8C8', x, TG - 120, 24, 4);
      tCircle(c, STONE, x, TG - 138, 8); tPoly(c, STONE, [x - 4, TG - 144, x + 4, TG - 144, x, TG - 158]);
      c.strokeStyle = 'rgba(200,235,255,.85)'; c.lineWidth = 2; [[-1, 44, 26], [1, 44, 26], [-1, 24, 16], [1, 24, 16]].forEach(function(j, i){ c.beginPath(); c.moveTo(x, TG - 156 + (i > 1 ? 36 : 0)); c.quadraticCurveTo(x + j[0] * j[2], TG - 160 + (i > 1 ? 30 : 0) - j[2], x + j[0] * j[1], (i > 1 ? TG - 82 : TG - 26)); c.stroke(); });
      c.strokeStyle = 'rgba(200,235,255,.55)'; c.lineWidth = 1.2; for (let i = 0; i < 6; i++){ const a = i * 0.9; c.beginPath(); c.moveTo(x + Math.cos(a) * 6, TG - 154); c.lineTo(x + Math.cos(a) * 8, TG - 126); c.stroke(); }
      for (let i = 0; i < 6; i++) tCircle(c, 'rgba(255,255,255,.7)', x - 60 + i * 24, TG - 24 + (i % 2) * 2, 2);
      for (let k = 0; k < 3; k++){ const cx = x - 70 + k * 70; tCircle(c, '#F2C230', cx, TG - 26, 2.4); }
    },
    u_banner: function(c, D, p){
      const x = p.x, col = FAC_COL[p.f] || '#2B3A5A'; shadow(c, x, 40);
      tRect(c, '#4A4F5C', x - 3, TG - 190, 6, 190); tRect(c, '#4A4F5C', x - 18, TG - 6, 36, 6); tCircle(c, GOLD, x, TG - 194, 5); ln(c, '#4A4F5C', 4, x - 30, TG - 176, x + 30, TG - 176); tCircle(c, GOLD, x - 30, TG - 176, 3); tCircle(c, GOLD, x + 30, TG - 176, 3);
      tPoly(c, col, [x - 26, TG - 174, x + 26, TG - 174, x + 26, TG - 90, x, TG - 74, x - 26, TG - 90]); tPoly(c, 'rgba(255,255,255,.18)', [x - 26, TG - 174, x - 14, TG - 174, x - 14, TG - 82, x - 26, TG - 90]); c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 22, TG - 170); c.lineTo(x + 22, TG - 170); c.lineTo(x + 22, TG - 92); c.lineTo(x, TG - 79); c.lineTo(x - 22, TG - 92); c.closePath(); c.stroke();
      uniEmblem(c, p.f, x, TG - 134, 15);
      ivText(c, (UNI_BY_ID[p.f] ? UNI_BY_ID[p.f].short : '').toUpperCase().slice(0, 8), x, TG - 100, 7, '#FFFFFF');
    }
  };
  /* a little symbol for each faculty (banners, the faculty board, the shelves) */
  window.uniEmblem = function(c, f, x, y, s){
    c.save(); c.translate(x, y); c.scale(s / 15, s / 15); c.fillStyle = '#FFF'; c.strokeStyle = '#FFF'; c.lineWidth = 2; c.lineCap = 'round';
    switch (f){
      case 'giraffe': c.fillRect(-2, -12, 4, 16); c.beginPath(); c.ellipse(2, -13, 6, 3.6, -0.3, 0, TAU); c.fill(); c.fillRect(-10, 2, 20, 6); break;
      case 'earth': c.beginPath(); c.arc(-4, 0, 6, 0, TAU); c.arc(4, -2, 7, 0, TAU); c.arc(10, 2, 4, 0, TAU); c.fill(); c.fillRect(-10, 0, 20, 5); break;
      case 'bio': c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(-16, 0, 0, -12); c.quadraticCurveTo(16, 0, 0, 12); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -8); c.stroke(); break;
      case 'chem': c.beginPath(); c.moveTo(-4, -12); c.lineTo(4, -12); c.lineTo(4, -4); c.lineTo(11, 10); c.lineTo(-11, 10); c.lineTo(-4, -4); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-9, 4, 18, 4); break;
      case 'maths': c.font = 'bold 26px serif'; c.textAlign = 'center'; c.fillText('π', 0, 9); break;
      case 'phys': c.lineWidth = 1.8; for (let i = 0; i < 3; i++){ c.save(); c.rotate(i * Math.PI / 3); c.beginPath(); c.ellipse(0, 0, 13, 5, 0, 0, TAU); c.stroke(); c.restore(); } c.beginPath(); c.arc(0, 0, 3, 0, TAU); c.fill(); break;
      case 'space': c.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); break;
      case 'geo': c.lineWidth = 1.8; c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(0, 0, 5, 11, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-11, 0); c.lineTo(11, 0); c.stroke(); break;
      default: c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill();
    }
    c.restore();
  };
  const prevP = townPropX;
  townPropX = function(c, D, p, P, r){
    const f = PROPS[p.k];
    if (f && !D.indoor){ c.save(); try { f(c, D, p); } finally { c.restore(); } return true; }
    return prevP(c, D, p, P, r);
  };
  /* the ground goes in first, so every prop and building stands on it */
  TOWN_DIST.campus.p.unshift({ k: 'u_ground', x: 0 });

  /* =============================================================== THE BACKDROP =============================================================== */
  const pfar = townPaintFar, pmid = townPaintMid;
  townPaintFar = function(c, D, W, H, R){
    if (D.theme !== 'campus') return pfar(c, D, W, H, R);
    [['#B8CBE0', 160, 0.0042, 0.8, 30], ['#A4BDB8', 110, 0.0061, 2.1, 22]].forEach(function(L){
      c.fillStyle = L[0]; c.beginPath(); c.moveTo(0, TG + 20);
      for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, TG - L[1] - L[4] * Math.abs(Math.sin(x * L[2] + L[3])) - 12 * Math.sin(x * 0.017));
      c.lineTo(W, TG + 20); c.closePath(); c.fill();
    });
    /* a far skyline of the old university: spires, a dome, gables, pale in the haze */
    for (let k = 0; k < Math.round(W / 220); k++){
      const x = 90 + k * 220 + FILM(k + 600) * 120, s = 0.8 + FILM(k + 610) * 0.7, t = k % 4, y = TG - 70;
      c.fillStyle = 'rgba(120,140,170,.55)';
      c.fillRect(x - 28 * s, y - 60 * s, 56 * s, 60 * s);
      if (t === 0){ c.beginPath(); c.moveTo(x - 32 * s, y - 60 * s); c.lineTo(x, y - 128 * s); c.lineTo(x + 32 * s, y - 60 * s); c.fill(); c.fillRect(x - 1, y - 150 * s, 2, 24 * s); }
      else if (t === 1){ c.beginPath(); c.ellipse(x, y - 60 * s, 30 * s, 36 * s, 0, Math.PI, 0); c.fill(); c.fillRect(x - 2, y - 112 * s, 4, 16 * s); }
      else if (t === 2){ c.fillRect(x - 36 * s, y - 40 * s, 72 * s, 40 * s); c.beginPath(); c.moveTo(x - 34 * s, y - 60 * s); c.lineTo(x - 18 * s, y - 84 * s); c.lineTo(x - 2 * s, y - 60 * s); c.moveTo(x + 2 * s, y - 60 * s); c.lineTo(x + 18 * s, y - 84 * s); c.lineTo(x + 34 * s, y - 60 * s); c.fill(); }
      else { c.fillRect(x - 10 * s, y - 120 * s, 20 * s, 62 * s); c.beginPath(); c.moveTo(x - 14 * s, y - 120 * s); c.lineTo(x, y - 156 * s); c.lineTo(x + 14 * s, y - 120 * s); c.fill(); }
      c.fillStyle = 'rgba(255,240,190,.5)'; for (let w = 0; w < 4; w++) c.fillRect(x - 20 * s + w * 12 * s, y - 40 * s, 5 * s, 9 * s);
    }
  };
  townPaintMid = function(c, D, W, H, R){
    if (D.theme !== 'campus') return pmid(c, D, W, H, R);
    tRect(c, '#7BA668', 0, TG - 34, W, 40);
    for (let k = 0; k < Math.round(W / 30); k++){ const x = k * 30 + FILM(k + 700) * 20; K.leafBlob(c, x, TG - 30 - FILM(k + 710) * 8, 20 + FILM(k + 720) * 8, 800 + k, '#5E9A4E', '#8CC470', '#3E7A3A'); }
    for (let k = 0; k < Math.round(W / 260); k++){                                  /* a row of big old trees and a brick wall between them */
      const x = 120 + k * 260 + FILM(k + 730) * 110, s = 0.8 + FILM(k + 740) * 0.5;
      ln(c, '#5A3E24', 7 * s, x, TG - 20, x + 2, TG - 100 * s); for (let i = 0; i < 4; i++) K.leafBlob(c, x + (i - 1.5) * 24 * s, TG - 128 * s + (i % 2) * 14, 34 * s, 900 + k * 4 + i, '#4E8A44', '#82C06A', '#366A32');
    }
    tRect(c, '#9A5A44', 0, TG - 24, W, 24); K.bricks(c, 0, TG - 24, W, 24, 8, 18, 5); tRect(c, '#C9BFA0', 0, TG - 28, W, 5);
    for (let x = 0; x < W; x += 180){ tRect(c, '#B8AE96', x, TG - 40, 14, 40); tRect(c, '#D9CFB6', x - 2, TG - 44, 18, 6); }
  };

  /* =============================================================== THE MORTARBOARD AND THE LOAFERS =============================================================== */
  [{ id: 'mortarboard', name: 'Graduation Mortarboard', c: '#1E1E24', kind: 'hat' }].forEach(function(o){
    const h = { id: o.id, name: o.name, c: o.c, kind: 'hat', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[o.id] = h; }
  });
  [{ id: 'loafers', name: 'Scholar’s Loafers', c: '#7A4A2A' }].forEach(function(o){
    const b = { id: o.id, name: o.name, c: o.c, kind: 'boot', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townBoots.push(b); ACC_ITEMS.push(b); ACC_BY_ID[o.id] = b; }
  });
  Object.assign(TOWN_HAT_SIDE, {
    mortarboard: function(c){
      c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-7, 1); c.lineTo(-6.4, -4); c.quadraticCurveTo(0, -6, 6.4, -4); c.lineTo(7, 1); c.closePath(); c.fill();
      c.fillStyle = '#1E1E24'; c.beginPath(); c.moveTo(-14, -4.4); c.lineTo(8, -7.6); c.lineTo(14, -4.8); c.lineTo(-8, -1.6); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(-14, -4.4); c.lineTo(8, -7.6); c.lineTo(9, -6.6); c.lineTo(-12, -3.4); c.closePath(); c.fill();
      c.fillStyle = '#E3B94A'; c.beginPath(); c.arc(0, -5, 1.6, 0, TAU); c.fill(); c.strokeStyle = '#E3B94A'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(10, -4, 12, 1); c.stroke(); c.fillStyle = '#E3B94A'; c.beginPath(); c.moveTo(11, 1); c.lineTo(13.4, 1); c.lineTo(14, 6); c.lineTo(10.4, 6); c.closePath(); c.fill();
    }
  });
  Object.assign(TOWN_HAT_TOP, {
    mortarboard: function(c){
      c.save(); c.rotate(Math.PI / 4); c.fillStyle = '#1E1E24'; c.fillRect(-8.5, -8.5, 17, 17); c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(-8.5, -8.5, 17, 3); c.restore();
      c.fillStyle = '#E3B94A'; c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.fill(); c.strokeStyle = '#E3B94A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(10, 3); c.stroke(); c.fillRect(9, 3, 3, 5);
    }
  });
  Object.assign(TOWN_BOOT_SIDE, {
    loafers: function(c){
      c.fillStyle = '#7A4A2A'; c.strokeStyle = '#4A2A14'; c.beginPath(); c.moveTo(-5, -9); c.lineTo(5, -9); c.lineTo(5, -1); c.quadraticCurveTo(12, -1, 12.6, 4); c.lineTo(12.6, 7); c.lineTo(-5, 7); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#2B1A0E'; c.fillRect(-5.4, 5.4, 18.4, 2.4); c.fillStyle = '#9A6A42'; c.fillRect(-5, -9, 10, 2); c.fillStyle = '#5A3418'; c.fillRect(1, -3, 7, 2.6); c.fillStyle = '#E3B94A'; c.beginPath(); c.arc(4.5, -1.7, 1.2, 0, TAU); c.fill();
    }
  });
  Object.assign(TOWN_BOOT_TOP, {
    loafers: function(c){ c.fillStyle = '#7A4A2A'; c.strokeStyle = '#4A2A14'; c.beginPath(); c.ellipse(0.5, 0, 7.8, 5.2, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#5A3418'; c.fillRect(0, -4, 4, 8); c.fillStyle = '#E3B94A'; c.beginPath(); c.arc(2, 0, 1.2, 0, TAU); c.fill(); c.fillStyle = '#2B1A0E'; c.beginPath(); c.ellipse(-5, 0, 2.2, 3.4, 0, 0, TAU); c.fill(); }
  });
  Object.assign(TOWN_SPECIAL_SRC, { mortarboard: 'Earned at the university: reach the Student rank.', loafers: 'Earned at the university: reach the Scholar rank.', uni_grad: 'Earned at the university: reach the Graduate rank.', uni_prof: 'Earned at the university: reach the Professor rank.', uni_chan: 'Earned at the university: reach the Chancellor rank.' });
})();
