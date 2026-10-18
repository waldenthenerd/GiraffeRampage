'use strict';
/* Longneck Town, tenth part: the insides of the buildings, in more detail and without gaps. */
/* ========================= 44zk. INTERIORS, DETAILED ========================= */
/* The rule for everything painted here: a thing either stands on the floor (it reaches TG) or hangs from something you can see (a hook,
   a chain, a bracket, a rail). Nothing floats. The footprints (x, w, h) are the ones in 44zb, so what she can walk to and use is unchanged.
   1 THE OBJECTS: the door, counter, oven, tables and chairs, the bar, turntable, tool bench, library shelves, mirror, mannequins, display
     cases, statue, arcade cabinets and score board, camera stand, sofa, fireplace/stove and bed are redrawn (townBuildingX wrapper).
   2 THE ROOMS: curtains and sill plants at every window, a baseboard, and each room's own wall furniture (townRoomProps wrapper):
     shelves on brackets, signs on chains, a ladder on a rail, banners on a rod, tyres on hooks, and so on.
   3 THE STATUE in the square gets legs that reach its body. */
function ivShadow(c, x, w){ tEll(c, 'rgba(0,0,0,.2)', x, TG + 3, w / 2, 6); }
function ivLine(c, col, w, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function ivBracket(c, x, y, col, dir){ tPoly(c, col || '#3E2A18', [x, y, x + 12 * (dir || 1), y, x, y + 16]); }
function ivChains(c, x1, x2, y1, y2){ ivLine(c, '#2A2A30', 2, x1, y1, x1, y2); ivLine(c, '#2A2A30', 2, x2, y1, x2, y2); c.fillStyle = '#C9CDD9'; for (let y = y1 + 4; y < y2; y += 8){ c.fillRect(x1 - 2, y, 4, 3); c.fillRect(x2 - 2, y, 4, 3); } }
function ivBoard(c, x, y, w, h, fill, rim){ tRound(c, rim || '#3E2A18', x - 3, y - 3, w + 6, h + 6, 7); tRound(c, fill, x, y, w, h, 5); }
function ivText(c, txt, x, y, size, col, weight){ c.fillStyle = col; c.font = (weight || 'bold') + ' ' + size + 'px system-ui'; c.textAlign = 'center'; c.fillText(txt, x, y); }
function ivLoaf(c, x, y, col){ tEll(c, col || '#D9A05A', x, y - 8, 15, 8); c.strokeStyle = 'rgba(120,70,20,.5)'; c.lineWidth = 1.4; for (let k = -1; k <= 1; k++){ c.beginPath(); c.moveTo(x + k * 6 - 2, y - 13); c.lineTo(x + k * 6 + 2, y - 5); c.stroke(); } }
function ivCup(c, x, y, tall, col){ tRound(c, col || '#F4F1E8', x - 6, y - (tall || 12), 12, tall || 12, 3); tRect(c, 'rgba(0,0,0,.12)', x - 6, y - 3, 12, 3); c.strokeStyle = col || '#F4F1E8'; c.lineWidth = 2; c.beginPath(); c.arc(x + 7, y - (tall || 12) / 2, 3.4, -1.2, 1.2); c.stroke(); }
function ivBook(c, x, y, w, h, col){ tRect(c, col, x, y - h, w, h); tRect(c, 'rgba(255,255,255,.25)', x + 1, y - h, 2, h); tRect(c, 'rgba(0,0,0,.2)', x, y - h + 6, w, 2); tRect(c, 'rgba(0,0,0,.2)', x, y - 8, w, 2); }
function ivTrophy(c, x, y, col, big){
  const s = big ? 1.25 : 1;
  tRect(c, '#5A3B22', x - 12 * s, y - 6 * s, 24 * s, 6 * s);                 /* the base stands on the shelf */
  tRect(c, '#8A6A3A', x - 8 * s, y - 10 * s, 16 * s, 4 * s);
  tRect(c, col, x - 3 * s, y - 24 * s, 6 * s, 15 * s);                       /* the stem joins base and cup */
  tPoly(c, col, [x - 15 * s, y - 52 * s, x + 15 * s, y - 52 * s, x + 9 * s, y - 24 * s, x - 9 * s, y - 24 * s]);
  c.strokeStyle = col; c.lineWidth = 3 * s; c.beginPath(); c.arc(x - 15 * s, y - 42 * s, 7 * s, Math.PI * 0.5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(x + 15 * s, y - 42 * s, 7 * s, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
  tRect(c, 'rgba(255,255,255,.45)', x - 9 * s, y - 50 * s, 3 * s, 20 * s);
}

/* ======================= 1. THE OBJECTS ======================= */
const IV_KINDS = {
  door: function(c, D, b){
    const x = b.x;
    ivShadow(c, x, 120);
    tRect(c, '#3A2A1E', x - 58, TG - 148, 116, 148);                                 /* the frame, floor to lintel */
    tRect(c, '#4E3A28', x - 58, TG - 148, 116, 8);
    tRect(c, '#8A5A32', x - 50, TG - 140, 100, 140);                                 /* the door itself */
    tRect(c, 'rgba(0,0,0,.18)', x - 17, TG - 140, 2, 140); tRect(c, 'rgba(0,0,0,.18)', x + 15, TG - 140, 2, 140);
    tRect(c, 'rgba(255,255,255,.12)', x - 50, TG - 140, 4, 140);
    tRect(c, '#3A2A1E', x - 34, TG - 124, 68, 50);                                   /* the window, with four panes */
    tRect(c, '#9FD8F2', x - 30, TG - 120, 28, 20); tRect(c, '#9FD8F2', x + 2, TG - 120, 28, 20); tRect(c, '#CFEAF8', x - 30, TG - 96, 28, 18); tRect(c, '#CFEAF8', x + 2, TG - 96, 28, 18);
    tRect(c, 'rgba(255,255,255,.5)', x - 28, TG - 118, 6, 14);
    tRect(c, '#C9962F', x + 26, TG - 66, 12, 24); tCircle(c, '#E9C46A', x + 32, TG - 56, 5);  /* the plate and the knob */
    tRect(c, '#7A6A56', x - 64, TG - 6, 128, 6);                                     /* the step */
    tRound(c, '#6A5A3A', x - 40, TG + 8, 80, 14, 5); tRect(c, 'rgba(255,255,255,.2)', x - 32, TG + 13, 64, 3);
    ivChains(c, x - 30, x + 30, TG - 148, TG - 164);                                 /* the sign hangs from the lintel */
    ivBoard(c, x - 40, TG - 192, 80, 28, '#2F6A44', '#1E4A30'); ivText(c, 'OUT', x, TG - 172, 18, '#F4F1E8');
  },
  counter: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#B8864E', x0, TG - 90, W, 90);                                         /* the cabinet, floor to top */
    for (let i = 0; i < 5; i++){ const px = x0 + 14 + i * ((W - 28) / 5); tRect(c, 'rgba(0,0,0,.14)', px, TG - 78, (W - 28) / 5 - 8, 56); tRect(c, 'rgba(255,255,255,.14)', px, TG - 78, (W - 28) / 5 - 8, 3); }
    tRect(c, '#6A4A28', x0, TG - 10, W, 10);
    tRound(c, '#8A5A32', x0 - 10, TG - 102, W + 20, 14, 4); tRect(c, 'rgba(255,255,255,.2)', x0 - 6, TG - 100, W + 12, 2);
    /* the glass case on top, posts to the counter */
    const cx0 = x0 + 8, cw = W - 104;
    tRect(c, '#C9CDD9', cx0, TG - 184, 8, 82); tRect(c, '#C9CDD9', cx0 + cw - 8, TG - 184, 8, 82); tRound(c, '#C9CDD9', cx0 - 4, TG - 192, cw + 8, 10, 3);
    tRect(c, 'rgba(190,230,250,.4)', cx0 + 8, TG - 182, cw - 16, 80); tRect(c, '#C9CDD9', cx0 + 8, TG - 142, cw - 16, 4);
    tRect(c, 'rgba(255,255,255,.35)', cx0 + 14, TG - 180, 10, 74);
    const n = Math.floor((cw - 40) / 52);
    for (let i = 0; i < n; i++){ const lx = cx0 + 40 + i * 52; ivLoaf(c, lx, TG - 102, ['#D9A05A', '#E8B876', '#C98A44'][i % 3]); ivLoaf(c, lx, TG - 142, ['#E8B876', '#D9A05A', '#F2D9A0'][i % 3]); tRect(c, '#FFF6E0', lx - 8, TG - 100, 16, 5); }
    /* the till, standing on the counter at the right-hand end */
    const tx = x0 + W - 84;
    tRound(c, '#3A3A44', tx, TG - 128, 66, 26, 4); tRect(c, '#5A5A66', tx + 6, TG - 150, 46, 24); tRect(c, '#9FE8C8', tx + 10, TG - 146, 38, 14);
    for (let i = 0; i < 4; i++) tRect(c, '#C9CDD9', tx + 10 + i * 10, TG - 118, 7, 6);
    tRect(c, '#6A6F78', tx + 14, TG - 102, 40, 4); tRect(c, '#C9962F', tx + 56, TG - 140, 4, 38);
  },
  oven: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#6A5A52', b.x - 15, 36, 30, TG - h - 36);                                /* the flue goes up to the beam */
    tRect(c, '#5A4A44', b.x - 20, 36, 40, 8);
    tRound(c, '#8A4A3A', x0, TG - h, W, h, 12);                                       /* the brick body, floor to crown */
    c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 1.4;
    for (let y = TG - h + 12; y < TG; y += 14){ c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + W, y); c.stroke(); const off = ((y / 14) | 0) % 2 ? 0 : 12; for (let x = x0 + off + 12; x < x0 + W; x += 24){ c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); } }
    tRound(c, '#6A5A52', x0 - 8, TG - h - 8, W + 16, 14, 4);
    tRound(c, '#2A1E1A', x0 + 22, TG - 126, W - 44, 90, 14);                           /* the mouth, with its glow */
    tRound(c, '#FF9A3A', x0 + 32, TG - 114, W - 64, 62, 10); tRound(c, '#FFD84D', x0 + 46, TG - 100, W - 92, 34, 8);
    tRect(c, '#3A2E2A', x0 + 22, TG - 36, W - 44, 8);                                  /* the iron sill */
    tRect(c, '#4A3A34', x0 + 14, TG - 22, W - 28, 22);                                 /* the ash drawer */
    tCircle(c, '#C9CDD9', b.x, TG - 11, 3);
    ivLine(c, '#8A6642', 4, x0 - 10, TG, x0 + 4, TG - 104);                            /* a peel leans on the side */
    tEll(c, '#B8864E', x0 + 5, TG - 112, 8, 12);
  },
  table: function(c, D, b){
    const x = b.x, W = b.w;
    ivShadow(c, x, W + 70);
    tEll(c, '#5A3B22', x, TG - 4, 30, 7); tRect(c, '#6A4A32', x - 5, TG - 58, 10, 54);       /* foot and pedestal */
    tEll(c, '#7A5230', x, TG - 56, W / 2, 12); tRect(c, '#7A5230', x - W / 2, TG - 60, W, 4); tEll(c, '#A57C52', x, TG - 60, W / 2, 11);
    tEll(c, '#E8E0D0', x, TG - 61, W / 2 - 6, 9);                                      /* a cloth */
    c.strokeStyle = 'rgba(200,60,50,.55)'; c.lineWidth = 3; for (let k = -3; k <= 3; k++){ c.beginPath(); c.moveTo(x + k * 14, TG - 69); c.lineTo(x + k * 14, TG - 53); c.stroke(); }
    [-1, 1].forEach(function(d){                                                      /* a chair each side, legs to the floor */
      const cx = x + d * 74;
      tRect(c, '#5A3B22', cx - 14, TG - 34, 5, 34); tRect(c, '#5A3B22', cx + 9, TG - 34, 5, 34);
      tRect(c, '#7A5230', cx - 18, TG - 40, 36, 7);
      tRect(c, '#7A5230', cx + d * 12 - 3, TG - 88, 6, 48); tRect(c, '#8A6642', cx + d * 12 - 3, TG - 80, 6, 4); tRect(c, '#8A6642', cx + d * 12 - 3, TG - 68, 6, 4);
    });
    ivCup(c, x - 22, TG - 63, 12); tEll(c, '#E8E0D0', x - 22, TG - 62, 10, 3);
    tRect(c, '#9FD8F2', x + 18, TG - 82, 8, 20); tRect(c, '#9FD8F2', x + 14, TG - 64, 16, 4);   /* a vase on the cloth */
    tCircle(c, '#F29AC0', x + 22, TG - 88, 5); ivLine(c, '#3E7A3A', 2, x + 22, TG - 84, x + 22, TG - 76);
  },
  bar: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 30);
    tRect(c, '#5A3B22', x0, TG - 100, W, 100);
    for (let i = 0; i < 6; i++) tRect(c, 'rgba(0,0,0,.18)', x0 + 12 + i * ((W - 24) / 6), TG - 88, (W - 24) / 6 - 8, 62);
    tRect(c, '#C9A24A', x0 + 6, TG - 18, W - 12, 5); [x0 + 16, x0 + W / 2, x0 + W - 24].forEach(function(px){ tRect(c, '#C9A24A', px, TG - 18, 4, 18); });
    tRound(c, '#8A5A32', x0 - 8, TG - 112, W + 16, 14, 4); tRect(c, 'rgba(255,255,255,.2)', x0 - 4, TG - 110, W + 8, 2);
    /* the espresso machine sits on the bar */
    tRound(c, '#C9CDD9', x0 + 18, TG - 178, 58, 66, 6); tRect(c, '#9AA0AC', x0 + 18, TG - 120, 58, 8); tRect(c, '#2A2A34', x0 + 26, TG - 168, 42, 24); tCircle(c, '#D5352B', x0 + 36, TG - 138, 5); tCircle(c, '#6BBB45', x0 + 54, TG - 138, 5);
    tRect(c, '#6A6F78', x0 + 36, TG - 114, 22, 4); tRect(c, '#3A3A44', x0 + 28, TG - 114, 6, 4); ivCup(c, x0 + 46, TG - 112, 10);
    tCircle(c, '#D5352B', x0 + 96, TG - 122, 10); tRect(c, '#D5352B', x0 + 90, TG - 114, 12, 2);   /* a jam jar / apple */
    for (let i = 0; i < 4; i++){ const gx = x0 + 126 + i * 30; tRound(c, 'rgba(255,255,255,.55)', gx, TG - 134, 14, 22, 3); tRect(c, 'rgba(0,0,0,.1)', gx, TG - 116, 14, 4); }
    [x0 + 50, x0 + 120, x0 + 190].forEach(function(sx){                                 /* stools, legs to the floor */
      tEll(c, '#2A1E1A', sx, TG - 46, 18, 7); tEll(c, '#B5547A', sx, TG - 49, 17, 6);
      tRect(c, '#3A3A44', sx - 12, TG - 42, 3, 42); tRect(c, '#3A3A44', sx + 9, TG - 42, 3, 42); tRect(c, '#3A3A44', sx - 12, TG - 18, 24, 3);
    });
  },
  turntable: function(c, D, b){
    const x = b.x, W = b.w;
    tEll(c, 'rgba(0,0,0,.25)', x, TG + 12, W / 2 + 6, 18);
    tRect(c, '#2A2A32', x - W / 2, TG + 2, W, 10); tEll(c, '#2A2A32', x, TG + 12, W / 2, 16);
    tEll(c, '#4A4F5A', x, TG + 2, W / 2, 16); tEll(c, '#6A6F78', x, TG, W / 2 - 8, 12); tEll(c, '#7A808C', x, TG - 1, W / 2 - 22, 8);
    for (let i = 0; i < 14; i++){ const a = i / 14 * TAU; tCircle(c, '#FFD84D', x + Math.cos(a) * (W / 2 - 3), TG + 2 + Math.sin(a) * 14, 2.4); }
  },
  toolwall: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#9A7A4A', x0, TG - 260, W, 190);                                         /* the pegboard, down onto the bench */
    c.fillStyle = 'rgba(40,24,10,.45)'; for (let y = TG - 250; y < TG - 78; y += 14) for (let x = x0 + 10; x < x0 + W - 6; x += 14) c.fillRect(x, y, 2, 2);
    tRect(c, '#6A4A28', x0 - 4, TG - 262, W + 8, 6);
    [[0, '#C9CDD9', 70], [1, '#D5352B', 60], [2, '#C9CDD9', 76], [3, '#F2C230', 56], [4, '#C9CDD9', 66], [5, '#3A6AA0', 58]].forEach(function(t){
      const tx = x0 + 18 + t[0] * 30; ivLine(c, '#2A2A30', 2, tx, TG - 244, tx, TG - 236);   /* hook, then the tool hanging on it */
      tRect(c, t[1], tx - 3, TG - 236, 6, t[2]); tCircle(c, t[1], tx, TG - 236 + t[2], t[0] % 2 ? 7 : 5);
    });
    tRect(c, '#6A4A28', x0 - 6, TG - 76, W + 12, 10);                                  /* the bench top */
    tRect(c, '#5A3B22', x0 + 4, TG - 66, 10, 66); tRect(c, '#5A3B22', x0 + W - 14, TG - 66, 10, 66); tRect(c, '#5A3B22', x0 + 4, TG - 22, W - 8, 6);
    tRound(c, '#D5352B', x0 + 18, TG - 134, W - 80, 58, 5);                            /* the tool chest on the bench */
    for (let i = 0; i < 3; i++){ tRect(c, '#A82820', x0 + 22, TG - 128 + i * 18, W - 88, 14); tRect(c, '#C9CDD9', x0 + W / 2 - 22, TG - 124 + i * 18, 14, 4); }
    tCircle(c, '#2A2A34', x0 + W - 36, TG - 84, 8); tCircle(c, '#C9CDD9', x0 + W - 36, TG - 84, 4);   /* a vice-like clamp */
  },
  shelf: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h, top = TG - h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#3E2A18', x0 - 8, top - 10, W + 16, 12); tRect(c, '#4A3220', x0 - 6, top, W + 12, h);   /* the case: crown, sides, body to the floor */
    tRect(c, '#241608', x0 + 4, top + 6, W - 8, h - 16);
    tRect(c, '#2A1A0E', x0 - 8, TG - 12, W + 16, 12);
    const cols = ['#6A3A2A', '#2A4A6A', '#5A6A2A', '#7A5A2A', '#8A2A3A', '#4A3A6A'], rows = Math.floor((h - 16) / 66);
    for (let row = 0; row < rows; row++){
      const base = top + 6 + (row + 1) * 66;
      let bx = x0 + 8, i = 0;
      while (bx < x0 + W - 18){ const bw = 8 + ((i * 7) % 7), bh = 38 + ((i * 11 + row * 5) % 20); ivBook(c, bx, base, bw, bh, i % 4 ? cols[(i + row) % 6] : (b.tone || cols[0])); bx += bw + 1; i++; }
      tRect(c, '#5A3B22', x0 + 4, base, W - 8, 6); tRect(c, 'rgba(255,255,255,.15)', x0 + 4, base, W - 8, 1.5);
    }
    tRound(c, '#C9A24A', b.x - 22, top - 4, 44, 12, 3);
  },
  mirror: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h, top = TG - h - 8;
    ivShadow(c, b.x, W + 50);
    tRound(c, '#5A3B22', x0 - 14, TG - 14, W + 28, 14, 4);                              /* the base the frame stands in */
    tRound(c, '#C9A24A', x0 - 6, top, W + 12, h - 6, 14);
    tRound(c, '#CFE6F2', x0, top + 6, W, h - 18, 10);
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(x0 + 16, top + 12); c.lineTo(x0 + 56, top + 12); c.lineTo(x0 + 16, top + 100); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x0 + 66, top + 12); c.lineTo(x0 + 80, top + 12); c.lineTo(x0 + 30, top + 120); c.lineTo(x0 + 24, top + 120); c.closePath(); c.fill();
    tRound(c, '#E8C96A', b.x - 14, top - 8, 28, 14, 7);
  },
  dummy: function(c, D, b){
    const x = b.x;
    ivShadow(c, x, 70);
    tEll(c, '#3A2A1E', x, TG - 3, 26, 6); tRect(c, '#5A3B22', x - 3, TG - 78, 6, 76);        /* base and pole, up into the torso */
    tRound(c, '#E8D8C0', x - 22, TG - 172, 44, 104, 16);
    tRound(c, '#C9628C', x - 24, TG - 146, 48, 78, 10); tPoly(c, '#B24A78', [x - 24, TG - 78, x + 24, TG - 78, x + 30, TG - 66, x - 30, TG - 66]);
    tRect(c, 'rgba(255,255,255,.2)', x - 18, TG - 142, 6, 60);
    tRect(c, '#E8D8C0', x - 4, TG - 188, 8, 20); tCircle(c, '#5A3B22', x, TG - 194, 7);
    ivLine(c, '#F2D79A', 2, x - 22, TG - 150, x + 22, TG - 150);                          /* a tape measure round the middle */
  },
  case: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h, top = TG - h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#3A2A18', x0, TG - 56, W, 56); for (let i = 0; i < 3; i++) tRect(c, 'rgba(255,255,255,.1)', x0 + 8 + i * ((W - 16) / 3), TG - 48, (W - 16) / 3 - 6, 40);
    tRect(c, '#4A3A28', x0 - 4, top - 6, W + 8, 10); tRect(c, '#4A3A28', x0, top, 8, h - 56); tRect(c, '#4A3A28', x0 + W - 8, top, 8, h - 56);
    tRect(c, '#2A2230', x0 + 8, top + 4, W - 16, h - 60);                               /* the velvet back */
    tRect(c, 'rgba(190,230,250,.22)', x0 + 8, top + 4, W - 16, h - 60); tRect(c, 'rgba(255,255,255,.28)', x0 + 14, top + 8, 10, h - 68);
    tRect(c, '#C9A24A', x0, TG - 58, W, 4);
    const mid = TG - 130; tRect(c, '#9AA0AC', x0 + 8, mid, W - 16, 5);
    for (let i = 0; i < 3; i++){ ivTrophy(c, x0 + 44 + i * 66, TG - 58, i % 2 ? '#C9CDD9' : '#FFD84D', i === 1); ivTrophy(c, x0 + 78 + (i % 2) * 66, mid, ['#CD7F32', '#FFD84D', '#C9CDD9'][i], false); if (i === 1) break; }
    tRound(c, '#C9A24A', b.x - 24, TG - 50, 48, 14, 3);
  },
  plinth: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, x = b.x;
    ivShadow(c, x, W + 40);
    tRect(c, '#B8B2A4', x0, TG - 62, W, 62); tRect(c, 'rgba(0,0,0,.1)', x0, TG - 14, W, 14); tRect(c, '#A8A294', x0 - 8, TG - 78, W + 16, 18); tRect(c, 'rgba(255,255,255,.3)', x0 - 8, TG - 78, W + 16, 3);
    tRound(c, '#6A6A60', x - 30, TG - 46, 60, 18, 3); ivText(c, 'HER', x, TG - 33, 12, '#E8E0D0');
    const gold = '#C9A24A', d = '#A8842E';
    c.fillStyle = gold;                                                                /* the statue, built from its feet up */
    c.fillRect(x - 22, TG - 112, 8, 36); c.fillRect(x - 8, TG - 112, 8, 36); c.fillRect(x + 8, TG - 112, 8, 36); c.fillRect(x + 22, TG - 112, 8, 36);
    c.beginPath(); c.ellipse(x, TG - 120, 34, 18, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x + 14, TG - 128); c.lineTo(x + 30, TG - 214); c.lineTo(x + 44, TG - 212); c.lineTo(x + 30, TG - 112); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(x + 44, TG - 218, 16, 9, -0.25, 0, TAU); c.fill();
    c.fillStyle = d; c.fillRect(x - 22, TG - 82, 8, 6); c.fillRect(x - 8, TG - 82, 8, 6); c.fillRect(x + 8, TG - 82, 8, 6); c.fillRect(x + 22, TG - 82, 8, 6);
    tRect(c, d, x + 30, TG - 232, 4, 14); tRect(c, d, x + 40, TG - 230, 4, 12);
    tRect(c, 'rgba(255,255,255,.35)', x - 18, TG - 130, 20, 5);
  },
  cab: function(c, D, b){
    const x = b.x, un = miniUnlocked(b.ch), col = WARD[13 + b.ch] ? WARD[13 + b.ch].c : '#FF4D8D';
    ivShadow(c, x, 84);
    tRect(c, '#16102A', x - 36, TG - 152, 72, 152);
    tRect(c, '#241A40', x - 38, TG - 152, 6, 152); tRect(c, '#241A40', x + 32, TG - 152, 6, 152);   /* the side panels */
    tRect(c, '#0A0618', x - 36, TG - 10, 72, 10);                                       /* kick plate */
    tRound(c, un ? col : '#444', x - 30, TG - 150, 60, 16, 4); ivText(c, String(b.ch), x, TG - 137, 12, 'rgba(0,0,0,.6)');   /* marquee */
    tRect(c, '#0A0618', x - 32, TG - 130, 64, 62); tRound(c, un ? '#0E1A2A' : '#1A1A1A', x - 28, TG - 126, 56, 54, 4);   /* bezel and screen */
    if (un){ tRound(c, col, x - 24, TG - 122, 48, 46, 3); c.fillStyle = 'rgba(255,255,255,.55)'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.fillText(String(b.ch), x, TG - 90); tRect(c, 'rgba(255,255,255,.2)', x - 22, TG - 120, 8, 40); }
    else { c.fillStyle = '#FF6A5A'; c.font = 'bold 10px system-ui'; c.textAlign = 'center'; c.fillText('OUT OF', x, TG - 102); c.fillText('ORDER', x, TG - 90); }
    tPoly(c, '#4A3A6A', [x - 34, TG - 68, x + 34, TG - 68, x + 38, TG - 44, x - 38, TG - 44]);   /* the control deck */
    tRect(c, '#2A2A34', x - 14, TG - 80, 4, 14); tCircle(c, un ? '#D5352B' : '#555', x - 12, TG - 82, 6);   /* a joystick from the deck */
    tCircle(c, un ? '#FFD84D' : '#555', x + 6, TG - 56, 4.5); tCircle(c, un ? '#4DD8FF' : '#555', x + 18, TG - 56, 4.5);
    tRect(c, '#2A2A34', x - 14, TG - 38, 28, 28); tRect(c, '#C9962F', x - 4, TG - 30, 8, 3); tRect(c, '#C9962F', x - 3, TG - 24, 6, 8);   /* the coin door */
  },
  scoreboard: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#241A40', x0 - 6, TG - 196, W + 12, 196); tRect(c, '#0E0A1E', x0, TG - 190, W, 180);
    tRect(c, '#0A0618', x0 - 6, TG - 12, W + 12, 12);
    c.strokeStyle = '#FF4D8D'; c.lineWidth = 4; c.strokeRect(x0 + 4, TG - 186, W - 8, 172);
    ivText(c, 'HIGH SCORES', b.x, TG - 164, 15, '#4DD8FF'); c.font = 'bold 15px monospace';
    for (let i = 0; i < 5; i++){ tRect(c, 'rgba(255,255,255,.4)', x0 + 16, TG - 144 + i * 24, 70, 5); tRect(c, '#FFD84D', x0 + W - 66, TG - 144 + i * 24, 40, 5); ivText(c, String(i + 1), x0 + 8, TG - 138 + i * 24, 10, '#FF4D8D'); }
    ivLine(c, '#2A2A34', 3, b.x - 30, TG - 196, b.x - 30, TG - 210); ivLine(c, '#2A2A34', 3, b.x + 30, TG - 196, b.x + 30, TG - 210);
    tRound(c, '#FFD84D', b.x - 44, TG - 224, 88, 14, 6);
  },
  tripod: function(c, D, b){
    const x = b.x;
    ivShadow(c, x, 100);
    ivLine(c, '#3A3A44', 7, x, TG - 112, x - 46, TG); ivLine(c, '#3A3A44', 7, x, TG - 112, x + 46, TG); ivLine(c, '#3A3A44', 7, x, TG - 112, x, TG);
    tRect(c, '#2A2A34', x - 8, TG - 122, 16, 22);                                      /* the head the camera sits on */
    tRound(c, '#2A2A34', x - 40, TG - 192, 80, 72, 8);                                  /* the camera body, resting on the head */
    tRect(c, '#3A3A44', x - 28, TG - 202, 28, 10);
    tRound(c, '#1E2A3A', x + 32, TG - 176, 30, 40, 5); tCircle(c, '#1E2A3A', x + 66, TG - 156, 22); tCircle(c, '#5BA2CE', x + 66, TG - 156, 14); tCircle(c, '#FFFFFF', x + 62, TG - 161, 4);
    tRect(c, '#D5352B', x - 30, TG - 184, 14, 10); tRect(c, '#4A4A56', x - 34, TG - 160, 30, 20);
  },
  sofa: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 40);
    tRect(c, '#3A2A1E', x0 + 6, TG - 10, 10, 10); tRect(c, '#3A2A1E', x0 + W - 16, TG - 10, 10, 10);
    tRound(c, '#8A3A4A', x0 + 10, TG - 96, W - 20, 90, 14);                            /* the back */
    tRound(c, '#7A2A3A', x0 - 8, TG - 66, 30, 62, 10); tRound(c, '#7A2A3A', x0 + W - 22, TG - 66, 30, 62, 10);   /* the arms, resting on the floor line */
    tRound(c, '#A64A5A', x0 + 18, TG - 58, W / 2 - 20, 46, 10); tRound(c, '#A64A5A', x0 + W / 2 + 2, TG - 58, W / 2 - 20, 46, 10);
    for (let i = 0; i < 3; i++) tCircle(c, '#6A2A36', x0 + 40 + i * (W - 80) / 2, TG - 82, 3);
    tRound(c, '#E8D8B0', x0 + 36, TG - 90, 36, 34, 8); tRect(c, 'rgba(0,0,0,.12)', x0 + 54, TG - 88, 2, 30);
    tRound(c, '#E8B876', x0 + W - 78, TG - 66, 56, 12, 4);                              /* a folded blanket */
  },
  fire: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 30);
    if (b.id === 'stove'){
      tRect(c, '#2A2A30', b.x - 9, 36, 18, TG - h - 36 + 40);                           /* the stove pipe, to the beam */
      tRect(c, '#3A3A44', b.x - 14, 36, 28, 8);
      tRect(c, '#2A2A30', x0 + 18, TG - 14, 10, 14); tRect(c, '#2A2A30', x0 + W - 28, TG - 14, 10, 14);   /* its feet */
      tRound(c, '#3A3A44', x0 + 8, TG - 124, W - 16, 112, 12); tRect(c, '#2A2A30', x0 + 2, TG - 134, W - 4, 14);
      tRound(c, '#1E1612', x0 + 30, TG - 100, W - 60, 56, 8); tRound(c, '#FF9A3A', x0 + 38, TG - 92, W - 76, 40, 6); tRound(c, '#FFD84D', x0 + 50, TG - 84, W - 100, 22, 5);
      tRect(c, '#C9CDD9', x0 + 30, TG - 100, W - 60, 3); tCircle(c, '#C9CDD9', x0 + W - 36, TG - 70, 4);
      tRound(c, '#6A6F78', b.x - 16, TG - 156, 32, 22, 6); tRect(c, '#6A6F78', b.x + 14, TG - 150, 14, 5); tRect(c, '#2A2A30', b.x - 5, TG - 160, 10, 6);   /* a kettle on the lid */
      return;
    }
    tRect(c, '#8A7A6A', x0, TG - h, W, h);                                              /* the stone chimney breast, floor to mantel */
    c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.4;
    for (let y = TG - h + 14; y < TG; y += 18){ c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + W, y); c.stroke(); const off = ((y / 18) | 0) % 2 ? 0 : 14; for (let x = x0 + off + 14; x < x0 + W; x += 28){ c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 18); c.stroke(); } }
    tRect(c, '#6A5A4A', x0 - 10, TG - h - 14, W + 20, 16); tRect(c, 'rgba(255,255,255,.2)', x0 - 10, TG - h - 14, W + 20, 3);
    tRound(c, '#1E1612', x0 + 24, TG - 112, W - 48, 112, 12);                             /* the firebox */
    tRect(c, '#4A3A2A', x0 + 34, TG - 22, W - 68, 22);                                    /* logs, stacked on the hearth */
    tEll(c, '#6A4A2A', b.x - 18, TG - 18, 22, 8); tEll(c, '#7A5A34', b.x + 14, TG - 20, 22, 8);
    tPoly(c, '#FF7A2A', [b.x - 30, TG - 20, b.x - 22, TG - 70, b.x - 8, TG - 40, b.x + 2, TG - 88, b.x + 14, TG - 44, b.x + 28, TG - 66, b.x + 32, TG - 20]);
    tPoly(c, '#FFD84D', [b.x - 16, TG - 20, b.x - 8, TG - 50, b.x + 2, TG - 66, b.x + 10, TG - 40, b.x + 18, TG - 20]);
    tRect(c, '#3A3A44', x0 + 24, TG - 114, W - 48, 4); tRect(c, '#3A3A44', x0 + 24, TG - 40, W - 48, 3);
    tRect(c, '#7A5A3A', x0 - 14, TG - 6, W + 28, 6);                                      /* the hearthstone */
    tRect(c, '#F2E8D0', x0 + 14, TG - h - 30, 12, 16); tRect(c, '#FFD84D', x0 + 18, TG - h - 36, 4, 7);   /* a candle on the mantel */
    tRound(c, '#6A8AC0', x0 + W - 40, TG - h - 36, 24, 22, 4); tRect(c, '#FFF6E0', x0 + W - 36, TG - h - 32, 16, 12);
  },
  bed: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 30);
    tRect(c, '#5A3B22', x0 + 4, TG - 40, 10, 40); tRect(c, '#5A3B22', x0 + W - 14, TG - 40, 10, 40);   /* legs */
    tRect(c, '#5A3B22', x0, TG - 120, 14, 120); tRect(c, '#6A4A2C', x0 - 4, TG - 128, 22, 10);    /* the headboard post, to the floor */
    tRect(c, '#5A3B22', x0 + W - 12, TG - 62, 12, 62); tRect(c, '#6A4A2C', x0 + W - 16, TG - 68, 20, 8);
    tRect(c, '#6A4A2C', x0 + 8, TG - 58, W - 10, 18);                                        /* the frame rail */
    tRound(c, '#E8D5E0', x0 + 12, TG - 86, W - 24, 34, 10);                                /* the mattress */
    tRound(c, '#C25A82', x0 + 60, TG - 94, W - 76, 46, 10);                                /* the quilt, with patches */
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) tRect(c, (i + j) % 2 ? '#E8A0BC' : '#A8406A', x0 + 70 + i * 28, TG - 86 + j * 18, 24, 15);
    tRound(c, '#FFFFFF', x0 + 18, TG - 100, 52, 30, 12); tRect(c, 'rgba(0,0,0,.08)', x0 + 22, TG - 82, 44, 4);
  }
};
(function(){
  const bx = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    const f = IV_KINDS[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
  /* the statue in the square: legs that reach the body */
  const px = townPropX;
  townPropX = function(c, D, p, P, r){
    if (p.k === 'statue'){
      const x = p.x; c.save();
      tEll(c, 'rgba(0,0,0,.18)', x, TG + 4, 60, 8);
      tRect(c, '#B8B2A4', x - 40, TG - 40, 80, 40); tRect(c, '#A8A294', x - 48, TG - 52, 96, 14); tRect(c, 'rgba(255,255,255,.3)', x - 48, TG - 52, 96, 3);
      c.fillStyle = '#C9A24A';
      c.fillRect(x - 18, TG - 88, 7, 38); c.fillRect(x - 5, TG - 88, 7, 38); c.fillRect(x + 8, TG - 88, 7, 38); c.fillRect(x + 20, TG - 88, 7, 38);
      c.beginPath(); c.ellipse(x, TG - 94, 28, 15, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x + 8, TG - 100); c.lineTo(x + 22, TG - 170); c.lineTo(x + 34, TG - 168); c.lineTo(x + 22, TG - 86); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(x + 34, TG - 172, 12, 7, -0.25, 0, TAU); c.fill();
      c.restore(); return true;
    }
    return px(c, D, p, P, r);
  };
})();

/* ======================= 2. THE ROOMS ======================= */
function ivWindows(c, D, K){
  const W = D.w, winN = Math.floor(W / 330);
  for (let i = 0; i < winN; i++){
    if (D.room === 'arcade' || D.room === 'ilight' || D.room === 'gym' || D.room === 'garage' && i % 2) continue;
    const wx = 220 + i * (W - 300) / Math.max(1, winN), wy = 80, cur = ['#B5547A', '#3E6A8A', '#6A8A3E', '#C98A44'][(i + W) % 4];
    tRect(c, '#5A3B22', wx - 18, wy - 16, 114, 6);                                       /* the rod, on two brackets */
    tRect(c, '#5A3B22', wx - 18, wy - 16, 4, 12); tRect(c, '#5A3B22', wx + 92, wy - 16, 4, 12);
    tPoly(c, cur, [wx - 12, wy - 10, wx + 14, wy - 10, wx + 20, wy + 124, wx - 12, wy + 124]);
    tPoly(c, cur, [wx + 64, wy - 10, wx + 90, wy - 10, wx + 90, wy + 124, wx + 58, wy + 124]);
    tRect(c, 'rgba(0,0,0,.14)', wx - 4, wy - 10, 3, 134); tRect(c, 'rgba(0,0,0,.14)', wx + 76, wy - 10, 3, 134);
    tRect(c, 'rgba(255,255,255,.2)', wx - 10, wy - 10, 3, 134);
    for (let k = 0; k < 4; k++) tCircle(c, '#C9A24A', wx - 12 + k * 28, wy - 13, 2.2);
    if (i % 2 === 0){                                                                    /* a pot on the sill */
      tRound(c, '#B5603A', wx + 26, wy + 106, 26, 12, 3); ivLine(c, '#3E8A3A', 3, wx + 39, wy + 106, wx + 32, wy + 86); ivLine(c, '#3E8A3A', 3, wx + 39, wy + 106, wx + 46, wy + 84); ivLine(c, '#4EAA4A', 3, wx + 39, wy + 106, wx + 39, wy + 80);
    }
  }
}
function ivBaseboard(c, D, K){
  tRect(c, K.beam, 0, TG - 12, D.w, 12); tRect(c, 'rgba(255,255,255,.14)', 0, TG - 12, D.w, 2);
  tRect(c, 'rgba(255,255,255,.18)', 0, TG - 94, D.w, 4);
}
function ivShelfBoard(c, x, y, w, col){ tRect(c, col || '#7A5230', x, y, w, 8); tRect(c, 'rgba(255,255,255,.18)', x, y, w, 2); ivBracket(c, x + 8, y + 8, '#3E2A18', 1); ivBracket(c, x + w - 8, y + 8, '#3E2A18', -1); }
function ivFrame(c, x, y, w, h, art){
  ivLine(c, '#2A2A30', 1.4, x + w / 2, y - 14, x + 8, y); ivLine(c, '#2A2A30', 1.4, x + w / 2, y - 14, x + w - 8, y); tCircle(c, '#C9CDD9', x + w / 2, y - 14, 2);
  tRect(c, '#5A3B22', x - 4, y - 4, w + 8, h + 8); tRect(c, '#F4E3C0', x, y, w, h); art(c, x, y, w, h);
}
const IV_ROOMS = {
  bakery: function(c, D, K){
    for (let i = 0; i < 4; i++){
      const x = 250 + i * 190; ivShelfBoard(c, x, 150, 120);
      if (i % 2 === 0){ for (let k = 0; k < 3; k++) ivLoaf(c, x + 24 + k * 36, 150, ['#D9A05A', '#E8B876', '#C98A44'][k]); }
      else { for (let k = 0; k < 3; k++){ tRound(c, ['#E8B7C9', '#F2D9A0', '#9FD8F2'][k], x + 14 + k * 36, 124, 26, 26, 4); tRect(c, '#C9CDD9', x + 14 + k * 36, 120, 26, 6); } }
    }
    ivChains(c, 760, 830, 36, 86); ivBoard(c, 730, 86, 130, 44, '#FFFFFF', '#7A4B2A'); ivText(c, 'FRESH BREAD', 795, 116, 20, '#7A4B2A');
    ivFrame(c, 980, 100, 60, 46, function(cc, x, y, w, h){ for (let i = 0; i < 3; i++){ ivLine(cc, '#C9A24A', 3, x + 14 + i * 16, y + h - 6, x + 14 + i * 16, y + 8); tEll(cc, '#E8C96A', x + 14 + i * 16, y + 12, 4, 8); } });
    tCircle(c, '#5A3B22', 170, 120, 24); tCircle(c, '#FBF3DC', 170, 120, 20); ivLine(c, '#2A1A0A', 2.4, 170, 120, 170, 106); ivLine(c, '#2A1A0A', 2, 170, 120, 180, 124);
  },
  cafe: function(c, D, K){
    ivChains(c, 790, 920, 36, 88); ivBoard(c, 760, 88, 190, 100, '#2E4A3A', '#B8864E');
    c.fillStyle = '#F4F1E8'; c.font = '15px system-ui'; c.textAlign = 'left'; ['TEA  ·  2', 'BUN  ·  3', 'CAKE · 5', 'SOUP · 4'].forEach(function(l, i){ c.fillText(l, 780, 120 + i * 22); });
    c.strokeStyle = '#4A3A28'; c.lineWidth = 2; c.beginPath(); c.moveTo(150, 44); c.quadraticCurveTo(420, 96, 700, 44); c.stroke();   /* bunting on its string */
    for (let i = 0; i < 9; i++){ const u = (i + 0.5) / 9, bxp = 150 + u * 550, byp = 44 + Math.sin(u * Math.PI) * 38; tPoly(c, ['#D5352B', '#F2C230', '#4DA0D8', '#6BBB45', '#E85D9F'][i % 5], [bxp - 10, byp, bxp + 10, byp, bxp, byp + 22]); }
    ivFrame(c, 200, 120, 60, 50, function(cc, x, y, w, h){ tCircle(cc, '#FFD84D', x + 40, y + 14, 8); tPoly(cc, '#6BBB45', [x, y + h, x + 20, y + 22, x + 36, y + 38, x + 52, y + 18, x + w, y + h]); });
    ivFrame(c, 280, 160, 46, 36, function(cc, x, y, w, h){ tRect(cc, '#C9628C', x + 8, y + 6, w - 16, h - 12); });
    ivShelfBoard(c, 1010, 170, 80, '#7A5230'); ivCup(c, 1030, 170, 12, '#9FD8F2'); ivCup(c, 1052, 170, 12, '#F2D9A0'); ivCup(c, 1074, 170, 12, '#E8B7C9');
  },
  garage: function(c, D, K){
    tRect(c, '#F2C230', 0, TG - 102, D.w, 8); for (let x = 0; x < D.w; x += 40) tPoly(c, '#2A2A34', [x, TG - 102, x + 20, TG - 102, x + 10, TG - 94, x - 10, TG - 94]);
    tRect(c, '#3A3A44', 210, 150, 880, 8); ivBracket(c, 220, 158, '#2A2A30', 1); ivBracket(c, 1070, 158, '#2A2A30', -1); ivBracket(c, 650, 158, '#2A2A30', 1);   /* a tyre rail on brackets */
    for (let i = 0; i < 5; i++){ const x = 280 + i * 190; ivLine(c, '#2A2A30', 3, x, 158, x, 168); tRect(c, '#2A2A30', x - 3, 158, 6, 12); tCircle(c, '#2A2A34', x, 200, 32); tCircle(c, '#44444C', x, 200, 22); tCircle(c, '#C9CDD9', x, 200, 14); for (let k = 0; k < 5; k++){ const a = k / 5 * TAU; tCircle(c, '#8A93A8', x + Math.cos(a) * 8, 200 + Math.sin(a) * 8, 2); } }
    ivChains(c, 780, 880, 36, 80); ivBoard(c, 760, 80, 140, 36, '#D5352B', '#3A4252'); ivText(c, 'OPEN', 830, 106, 22, '#F4F1E8');
    tRound(c, '#3A6AA0', 1100, TG - 70, 40, 70, 6); tRect(c, '#2A4A7A', 1100, TG - 50, 40, 4); tRect(c, '#2A4A7A', 1100, TG - 30, 40, 4); tRect(c, '#C9CDD9', 1112, TG - 78, 16, 8);   /* an oil drum */
  },
  library: function(c, D, K){
    [150, 1130].forEach(function(x0, j){                                                     /* full-height wall cases at both ends */
      tRect(c, '#3E2A18', x0 - 6, 150, 132, 350); tRect(c, '#241608', x0, 156, 120, 340); tRect(c, '#2A1A0E', x0 - 6, TG - 12, 132, 12);
      for (let row = 0; row < 5; row++){ const base = 156 + (row + 1) * 68; let bx = x0 + 6, i = 0; while (bx < x0 + 110){ const bw = 8 + ((i * 7 + j) % 7), bh = 40 + ((i * 11 + row * 5) % 20); ivBook(c, bx, base, bw, bh, ['#6A3A2A', '#2A4A6A', '#5A6A2A', '#7A5A2A', '#8A2A3A', '#4A3A6A'][(i + row + j) % 6]); bx += bw + 1; i++; } tRect(c, '#5A3B22', x0, base, 120, 6); }
    });
    ivLine(c, '#2A2A30', 2, 200, 36, 200, 90); tCircle(c, '#5A3B22', 200, 120, 32); tCircle(c, '#E8D8B0', 200, 120, 27); ivLine(c, '#3A2A1E', 2.6, 200, 120, 200, 100); ivLine(c, '#3A2A1E', 2.2, 200, 120, 214, 128);
    tRect(c, '#C9A24A', 270, 190, 860, 5); tRect(c, '#C9A24A', 270, 186, 6, 14); tRect(c, '#C9A24A', 1124, 186, 6, 14);        /* the ladder rail, fixed at each end */
    tRect(c, '#8A6642', 536, 195, 6, 305); tRect(c, '#8A6642', 566, 195, 6, 305); tCircle(c, '#2A2A30', 539, 192, 5); tCircle(c, '#2A2A30', 569, 192, 5);   /* the ladder hangs from it, to the floor */
    for (let y = 230; y < 500; y += 36) tRect(c, '#6A4A2C', 536, y, 36, 5);
    ivChains(c, 640, 760, 36, 76); ivBoard(c, 620, 76, 160, 30, '#2A4A6A', '#C9A24A'); ivText(c, 'QUIET PLEASE', 700, 97, 15, '#F4F1E8');
  },
  tailor: function(c, D, K){
    tRect(c, '#5A3B22', 120, 90, 840, 8); tRect(c, '#5A3B22', 120, 150, 840, 6); tRect(c, '#5A3B22', 120, 214, 840, 6);                  /* a cubby rack: three rails, two end posts */
    tRect(c, '#5A3B22', 120, 90, 8, 130); tRect(c, '#5A3B22', 952, 90, 8, 130); for (let i = 1; i < 6; i++) tRect(c, '#5A3B22', 120 + i * 140, 90, 6, 130);
    const cols = ['#C9628C', '#E8B7C9', '#8A5AA0', '#5A8AC0', '#F2C230', '#6BBB45', '#E86A4A', '#4AAAA0'];
    for (let i = 0; i < 6; i++) for (let row = 0; row < 2; row++){ const rx = 130 + i * 140, ry = 98 + row * 60; tRound(c, cols[(i + row * 3) % 8], rx + 6, ry + 20, 118, 32, 14); tEll(c, 'rgba(255,255,255,.25)', rx + 20, ry + 36, 8, 14); ivLine(c, 'rgba(0,0,0,.15)', 2, rx + 24, ry + 24, rx + 108, ry + 24); }
    ivLine(c, '#F2D79A', 4, 120, 230, 960, 230); for (let x = 130; x < 960; x += 20) tRect(c, '#3A2A1E', x, 226, 1.5, 8);     /* the tape measure along the front */
    ivLine(c, '#2A2A30', 2, 900, 240, 900, 250); tPoly(c, '#C9CDD9', [896, 250, 904, 250, 912, 290, 888, 290]);                    /* scissors hung from a hook */
  },
  hall: function(c, D, K){
    const W = D.w;
    tRect(c, '#4A3624', 130, 36, W - 260, 8); tRect(c, '#C9A24A', 124, 33, 10, 14); tRect(c, '#C9A24A', W - 134, 33, 10, 14);      /* the banner rod */
    for (let i = 0; i < 13; i++){
      const done = townDoneCh(i + 1), x = 150 + i * 90, fill = done ? WARD[i + 1].c : 'rgba(80,70,60,.4)';
      tCircle(c, '#C9A24A', x + 2, 44, 3); tCircle(c, '#C9A24A', x + 38, 44, 3);
      tPoly(c, fill, [x, 44, x + 40, 44, x + 40, 106, x + 20, 92, x, 106]); tRect(c, 'rgba(255,255,255,.18)', x, 44, 5, 60);
      ivText(c, String(i + 1), x + 20, 74, 16, done ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.3)');
    }
    tRect(c, '#9A2A2A', 150, TG + 4, W - 300, 40); tRect(c, '#C9A24A', 150, TG + 4, W - 300, 4); tRect(c, '#C9A24A', 150, TG + 40, W - 300, 4); tRect(c, 'rgba(0,0,0,.18)', 150, TG + 8, W - 300, 3);
  },
  arcade: function(c, D, K){
    const W = D.w;
    tRect(c, '#1A1230', 0, TG + 2, W, 98); c.strokeStyle = 'rgba(77,216,255,.35)'; c.lineWidth = 1.4;
    for (let x = 0; x < W; x += 60){ c.beginPath(); c.moveTo(x, TG + 2); c.lineTo(x, TG + 100); c.stroke(); } for (let y = TG + 26; y < TG + 100; y += 24){ c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    [[62, '#FF4D8D'], [70, '#4DD8FF']].forEach(function(l){ for (let x = 60; x < W; x += 280){ tRect(c, '#2A2A34', x, l[0] - 3, 8, 8); } ivLine(c, l[1], 3, 0, l[0], W, l[0]); });
    for (let i = 0; i < 6; i++){ const x = 330 + i * 230, col = ['#FF4D8D', '#4DD8FF', '#FFD84D', '#6BFF9A', '#B58CFF', '#FF8A5A'][i]; tRect(c, '#2A2A34', x - 2, 130, 4, 12); tRound(c, '#16102A', x - 34, 142, 68, 60, 4); ivLine(c, col, 3, x - 28, 152, x + 28, 152); tCircle(c, col, x, 176, 12); tRect(c, col, x - 24, 192, 48, 3); }
  },
  studio: function(c, D, K){
    tRect(c, '#3A3A44', 500, 36, 340, 8); ivBracket(c, 504, 44, '#2A2A30', 1); ivBracket(c, 836, 44, '#2A2A30', -1);            /* the paper roll bar */
    for (let i = 0; i < 4; i++){ const col = ['#F2D9A0', '#9FD8F2', '#BFE0B0', '#F29AC0'][i], x = 520 + i * 74; tRound(c, '#6A6F78', x - 3, 40, 66, 10, 5); tRect(c, col, x, 50, 60, 320); tRect(c, 'rgba(255,255,255,.2)', x, 50, 6, 320); tRect(c, 'rgba(0,0,0,.14)', x, 366, 60, 4); }
    [{ x: 300, f: -1 }, { x: 640, f: 1 }].forEach(function(s){                                    /* softboxes on stands, legs to the floor */
      ivLine(c, '#2A2A30', 4, s.x, TG - 200, s.x - 34, TG); ivLine(c, '#2A2A30', 4, s.x, TG - 200, s.x + 34, TG); ivLine(c, '#2A2A30', 4, s.x, TG - 200, s.x, TG);
      tRect(c, '#2A2A30', s.x - 3, TG - 232, 6, 36); tRound(c, '#3A3A44', s.x - 30, TG - 290, 60, 62, 6); tRound(c, '#FFF8D8', s.x - 24, TG - 284, 48, 50, 4); tRect(c, 'rgba(255,255,255,.5)', s.x - 20, TG - 280, 10, 40);
    });
    tRect(c, '#5A3B22', 150, TG - 54, 6, 54); tRect(c, '#5A3B22', 214, TG - 54, 6, 54); tRound(c, '#8A5A32', 140, TG - 62, 90, 12, 4);   /* a prop table */
    tRound(c, '#C9628C', 160, TG - 90, 30, 28, 8); tRound(c, '#6A8AC0', 198, TG - 84, 24, 22, 6);
  },
  house: function(c, D, K){
    ivFrame(c, 330, 120, 70, 54, function(cc, x, y, w, h){ tCircle(cc, '#FFD84D', x + 50, y + 14, 8); tPoly(cc, '#6BBB45', [x, y + h, x + 22, y + 24, x + 40, y + 40, x + 56, y + 20, x + w, y + h]); });
    ivFrame(c, 558, 130, 44, 56, function(cc, x, y, w, h){ tCircle(cc, '#E8B7C9', x + w / 2, y + 22, 10); tRound(cc, '#C9628C', x + 8, y + 34, w - 16, h - 40, 6); });
    ivShelfBoard(c, 800, 170, 100, '#7A5230'); tRound(c, '#9FD8F2', 814, 144, 16, 26, 4); tRound(c, '#E8B7C9', 842, 150, 24, 20, 3); tRect(c, '#C9A24A', 874, 144, 6, 26);
    tEll(c, '#B88A5A', 400, TG + 40, 150, 26); tEll(c, '#E8D8B0', 400, TG + 40, 120, 18); tEll(c, '#B88A5A', 400, TG + 40, 80, 10);     /* a rug on the boards */
  },
  cottage: function(c, D, K){
    IV_ROOMS.house(c, D, K);
    /* an easel on a stand, canvas fixed to it, legs to the floor */
    const ex = 950;
    ivLine(c, '#6A4A2C', 5, ex, TG - 150, ex - 34, TG); ivLine(c, '#6A4A2C', 5, ex, TG - 150, ex + 34, TG); ivLine(c, '#6A4A2C', 5, ex + 4, TG - 150, ex + 4, TG - 40);
    tRect(c, '#6A4A2C', ex - 40, TG - 74, 90, 7);
    tRect(c, '#F4F1E8', ex - 34, TG - 200, 68, 96); tRect(c, '#9FD8F2', ex - 30, TG - 196, 60, 54); tPoly(c, '#6BBB45', [ex - 30, TG - 142, ex - 8, TG - 170, ex + 10, TG - 152, ex + 30, TG - 176, ex + 30, TG - 142]); tCircle(c, '#FFD84D', ex + 16, TG - 182, 6);
    tRound(c, '#8A5A32', ex - 22, TG - 62, 20, 14, 3); tCircle(c, '#D5352B', ex - 16, TG - 66, 3); tCircle(c, '#4DA0D8', ex - 8, TG - 66, 3);
  }
};
(function(){
  const rp = townRoomProps;
  townRoomProps = function(c, D, K, r){
    const mine = IV_ROOMS[D.room];
    if (!mine || !D.indoor){ rp(c, D, K, r); return; }
    const keep = D.room; D.room = '_' + keep;
    try { rp(c, D, K, r); } finally { D.room = keep; }
    ivWindows(c, D, K); ivBaseboard(c, D, K); mine(c, D, K, r);
  };
})();
