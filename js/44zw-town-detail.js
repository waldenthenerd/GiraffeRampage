/* ==========================================================================================================================
   44zw-town-detail.js  --  Longneck Town, the small parts.
   Pure drawing. Everything in town is painted once into a cached layer (far, mid, field), so none of this costs anything per frame.
   The big shapes stay in 44v-town-art.js; this file adds the little things that make them look built:
     1. The shared pieces (tRect walls, tPoly roofs, tWin, tDoor, tAwning, tSign) are wrapped, so every building in every street gains
        brick or board or stucco, roof tiles, sills, shutters, panelled doors with steps and lamps, stitched awnings and screwed-on signs.
     2. townBuilding and townProp are wrapped: a foundation, drainpipe and a handful of parts per building kind, and per prop kind.
     3. The ground (paving, asphalt, grass, planks, cobbles) gets its small parts the first time a prop or building is painted.
     4. The far skyline, the rows of houses behind (hooks in 44v) and each district's backdrop get theirs.
   Wrapper pattern: later declarations override earlier ones; this file loads after 44zv.
   ========================================================================================================================== */
(function(){
  const hash = function(n){ const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  const WALL_KINDS = { tailor: 1, hall: 1, post: 1, cafe: 1, library: 1, arcade: 1, studio: 1, shack: 1, shed: 1, mission: 1 };
  const SHUTTER_KINDS = { library: 1, post: 1, cafe: 1, shack: 1, shed: 1 };
  let curG = null;                                   /* the building being painted: its box, its kind, and the doors found so far */

  /* ---------- small painters ---------- */
  function bricks(c, x, y, w, h, rowH, bw, seed){
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const r = miniRng(seed);
    for (let row = 0, yy = y; yy < y + h; row++, yy += rowH){
      const off = row % 2 ? bw / 2 : 0;
      for (let xx = x - off; xx < x + w; xx += bw){
        const v = r();
        c.fillStyle = v < 0.45 ? 'rgba(255,214,190,.08)' : v < 0.8 ? 'rgba(0,0,0,.07)' : 'rgba(60,20,10,.14)';
        c.fillRect(xx + 0.6, yy + 0.6, bw - 1.2, rowH - 1.2);
      }
      c.fillStyle = 'rgba(235,215,190,.2)'; c.fillRect(x, yy, w, 1);
      c.fillStyle = 'rgba(50,25,15,.2)';
      for (let xx = x - off; xx < x + w; xx += bw) c.fillRect(xx, yy, 1, rowH);
    }
    c.restore();
  }
  function boards(c, x, y, w, h, size, vertical, seed){
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const r = miniRng(seed), n = Math.ceil((vertical ? w : h) / size);
    for (let i = 0; i < n; i++){
      const o = i * size;
      c.fillStyle = r() < 0.5 ? 'rgba(255,240,210,.06)' : 'rgba(0,0,0,.06)';
      if (vertical){ c.fillRect(x + o, y, size, h); c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + o, y, 1.4, h); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(x + o + 1.4, y, 1, h); }
      else { c.fillRect(x, y + o, w, size); c.fillStyle = 'rgba(0,0,0,.26)'; c.fillRect(x, y + o + size - 1.4, w, 1.4); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(x, y + o, w, 1); }
      c.strokeStyle = 'rgba(60,35,15,.16)'; c.lineWidth = 0.8;                       /* grain */
      for (let k = 0; k < 3; k++){
        c.beginPath();
        if (vertical){ const gx = x + o + 2 + r() * (size - 4); c.moveTo(gx, y + r() * h * 0.4); c.lineTo(gx + (r() - 0.5) * 2, y + h * (0.5 + r() * 0.5)); }
        else { const gy = y + o + 2 + r() * (size - 4), gx = x + r() * w * 0.6; c.moveTo(gx, gy); c.lineTo(gx + 20 + r() * 50, gy + (r() - 0.5) * 1.5); }
        c.stroke();
      }
      if (r() < 0.22){ const kx = vertical ? x + o + size / 2 : x + r() * w, ky = vertical ? y + r() * h : y + o + size / 2; c.fillStyle = 'rgba(50,28,12,.3)'; c.beginPath(); c.ellipse(kx, ky, 2.2, 1.5, 0, 0, TAU); c.fill(); }
    }
    c.fillStyle = 'rgba(30,20,10,.55)';                                               /* nail heads */
    for (let i = 0; i < n; i++){ const o = i * size + size / 2; for (let k = 0; k < 2; k++){ if (vertical) c.fillRect(x + o, y + 8 + k * (h - 18), 1.6, 1.6); else c.fillRect(x + 8 + k * (w - 18), y + o, 1.6, 1.6); } }
    c.restore();
  }
  function stucco(c, x, y, w, h, seed){
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const r = miniRng(seed), n = Math.min(900, Math.round(w * h / 90));
    for (let i = 0; i < n; i++){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(70,45,25,.09)'; const s = 0.8 + r() * 1.4; c.fillRect(x + r() * w, y + r() * h, s, s); }
    c.strokeStyle = 'rgba(70,45,25,.07)'; c.lineWidth = 1.4;                          /* trowel sweeps */
    for (let i = 0; i < Math.round(w * h / 1800); i++){ const cx = x + r() * w, cy = y + r() * h; c.beginPath(); c.arc(cx, cy, 10 + r() * 14, 3.4, 5.4); c.stroke(); }
    c.restore();
  }
  function blocks(c, x, y, w, h, bw, bh, seed){                                      /* cut stone */
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const r = miniRng(seed);
    for (let row = 0, yy = y; yy < y + h; row++, yy += bh){
      for (let xx = x - (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)'; c.fillRect(xx + 1, yy + 1, bw - 2, bh - 2); c.fillStyle = 'rgba(60,50,35,.2)'; c.fillRect(xx, yy, 1, bh); }
      c.fillStyle = 'rgba(60,50,35,.22)'; c.fillRect(x, yy, w, 1);
    }
    c.restore();
  }
  function wallShade(c, x, y, w, h){                                                  /* light from the upper left: lit left edge, shaded right edge, dirt at the foot */
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,.06)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,20,10,.2)');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x, y, 3, h); c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x + w - 5, y, 5, h);
    c.fillStyle = 'rgba(40,25,10,.1)'; for (let i = 0; i < 5; i++) c.fillRect(x + 8 + hash(x + i * 7) * (w - 16), y + h * 0.5, 2, h * (0.15 + hash(x + i) * 0.3));   /* rain streaks */
  }
  function quoins(c, x, y, w, h, light){                                              /* corner stones */
    for (let yy = y + 6, i = 0; yy < y + h - 8; yy += 18, i++){ const lw = i % 2 ? 16 : 10; c.fillStyle = light; c.fillRect(x, yy, lw, 14); c.fillRect(x + w - lw, yy, lw, 14); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(x, yy + 13, lw, 1); c.fillRect(x + w - lw, yy + 13, lw, 1); }
  }
  function tiles(c, pts, seed){                                                       /* roof tiles on a polygon */
    let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
    for (let i = 0; i < pts.length; i += 2){ minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]); minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]); }
    c.save(); c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.clip();
    const r = miniRng(seed), rh = 7, tw = 10;
    for (let row = 0, yy = minY; yy < maxY; row++, yy += rh){
      for (let xx = minX - (row % 2 ? tw / 2 : 0); xx < maxX; xx += tw){
        const v = r(); c.fillStyle = v < 0.4 ? 'rgba(255,230,200,.1)' : v < 0.75 ? 'rgba(0,0,0,.06)' : 'rgba(0,0,0,.14)'; c.fillRect(xx, yy, tw, rh);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(xx, yy, 1, rh);
      }
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(minX, yy + rh - 1.5, maxX - minX, 1.5); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(minX, yy + rh, maxX - minX, 1);
    }
    c.restore();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(pts[0] + 1, pts[1] - 1); for (let i = 2; i < pts.length - 2; i += 2) c.lineTo(pts[i], pts[i + 1] - 1.5); c.stroke();
  }
  function rope(c, x, y, rx){                                                         /* a coil of rope seen from the front */
    c.strokeStyle = '#B79C6A'; c.lineWidth = 2.4; for (let i = 0; i < 4; i++){ c.beginPath(); c.ellipse(x, y - i * 0.8, rx - i * 2.2, rx * 0.38 - i * 0.6, 0, 0, TAU); c.stroke(); }
    c.strokeStyle = 'rgba(70,50,20,.4)'; c.lineWidth = 0.8; for (let i = 0; i < 12; i++){ const a = i * TAU / 12; c.beginPath(); c.moveTo(x + Math.cos(a) * (rx - 4), y + Math.sin(a) * rx * 0.3); c.lineTo(x + Math.cos(a) * (rx + 1), y + Math.sin(a) * rx * 0.38); c.stroke(); }
  }
  function leafBlob(c, x, y, rad, seed, base, lite, dark){                            /* a tuft of foliage made of many leaves */
    const r = miniRng(seed);
    for (let i = 0; i < Math.round(rad * 1.1); i++){
      const a = r() * TAU, d = Math.sqrt(r()) * rad, lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * 0.9, up = (ly - y) / rad;
      c.fillStyle = up < -0.2 ? lite : up > 0.35 ? dark : base; c.globalAlpha = 0.5 + r() * 0.4;
      c.beginPath(); c.ellipse(lx, ly, 3 + r() * 3.2, 2 + r() * 2, r() * TAU, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }

  /* ---------- wrapped pieces ---------- */
  const _tRect = tRect, _tPoly = tPoly, _tWin = tWin, _tDoor = tDoor, _tAwning = tAwning, _tSign = tSign;
  tRect = function(c, col, x, y, w, h){
    _tRect(c, col, x, y, w, h);
    const g = curG;
    if (g && !g.wall && x === g.x0 && y === g.wallTop && w === g.w && h === g.wallH){            /* the main wall of the building: give it its material */
      g.wall = true;
      const s = Math.round(g.x0 * 3 + g.w);
      switch (g.kind){
        case 'library': bricks(c, x, y, w, h, 9, 24, s); break;
        case 'hall': blocks(c, x, y, w, h, 46, 22, s); break;
        case 'tailor': case 'cafe': case 'post': stucco(c, x, y, w, h, s); if (g.kind !== 'post') quoins(c, x, y, w, h, 'rgba(255,248,230,.16)'); break;
        case 'shack': boards(c, x, y, w, h, 14, false, s); break;
        case 'shed': boards(c, x, y, w, h, 10, true, s); break;
        case 'studio': boards(c, x, y, w, h, 12, false, s); break;
        case 'arcade':
          c.fillStyle = 'rgba(255,255,255,.05)'; for (let xx = x + 40; xx < x + w - 20; xx += 54) c.fillRect(xx, y + 76, 2, h - 80);
          c.fillStyle = 'rgba(255,255,255,.15)'; for (let yy = y + 100; yy < y + h; yy += 40){ c.fillRect(x + 6, yy, 2, 2); c.fillRect(x + w - 8, yy, 2, 2); }
          break;
        case 'mission':
          c.fillStyle = 'rgba(0,0,0,.1)'; for (let xx = x + 54; xx < x + w; xx += 54) c.fillRect(xx, y + 60, 1.5, h - 60);
          c.fillStyle = 'rgba(0,0,0,.08)'; for (let yy = y + 80; yy < y + h; yy += 40) c.fillRect(x, yy, w, 1.5);
          c.fillStyle = 'rgba(80,90,110,.5)'; for (let xx = x + 54; xx < x + w; xx += 54) for (let yy = y + 80; yy < y + h; yy += 40){ c.fillRect(xx - 3, yy - 3, 2, 2); c.fillRect(xx + 2, yy - 3, 2, 2); c.fillRect(xx - 3, yy + 2, 2, 2); c.fillRect(xx + 2, yy + 2, 2, 2); }
          c.fillStyle = '#E3B93C'; for (let xx = x; xx < x + w; xx += 24) c.fillRect(xx, TG - 10, 12, 10);     /* hazard stripe at the foot */
          c.fillStyle = 'rgba(0,0,0,.8)'; for (let xx = x + 12; xx < x + w; xx += 24) c.fillRect(xx, TG - 10, 12, 10);
          break;
        default: if (TOWN_WALL_TEXTURE[g.kind]) TOWN_WALL_TEXTURE[g.kind](c, x, y, w, h, s);
      }
      wallShade(c, x, y, w, h);
    }
  };
  tPoly = function(c, col, pts){
    _tPoly(c, col, pts);
    const g = curG;
    if (g && g.kind !== 'hall' && pts.length >= 6 && Math.abs(pts[pts.length - 1] - pts[1]) < 70){
      let ok = true, wd = 0, mn = 1e9, mx = -1e9;
      for (let i = 0; i < pts.length; i += 2){ if (pts[i + 1] > g.wallTop + 2) ok = false; mn = Math.min(mn, pts[i]); mx = Math.max(mx, pts[i]); }
      wd = mx - mn;
      if (ok && wd > 60) tiles(c, pts, Math.round(pts[0] * 5 + pts[3]));
    }
  };
  tWin = function(c, D, x, y, w, h, col){
    _tWin(c, D, x, y, w, h, col);
    if (w < 14) return;
    const hv = hash(x * 0.37 + y * 0.91);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(20,40,70,.3)'); g.addColorStop(0.5, 'rgba(20,40,70,0)'); g.addColorStop(1, 'rgba(255,255,255,.1)');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(x + w * 0.5, y); c.lineTo(x + w * 0.78, y); c.lineTo(x + w * 0.3, y + h); c.lineTo(x + w * 0.02, y + h); c.closePath(); c.fill();
    if (hv < 0.55 && h >= 30){                                                         /* curtains, drawn back */
      c.fillStyle = hv < 0.2 ? 'rgba(200,90,90,.55)' : hv < 0.4 ? 'rgba(90,130,200,.5)' : 'rgba(240,230,200,.55)';
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.3, y); c.quadraticCurveTo(x + w * 0.1, y + h * 0.5, x + w * 0.2, y + h * 0.9); c.lineTo(x, y + h * 0.9); c.fill();
      c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w * 0.7, y); c.quadraticCurveTo(x + w * 0.9, y + h * 0.5, x + w * 0.8, y + h * 0.9); c.lineTo(x + w, y + h * 0.9); c.fill();
    } else if (hv >= 0.75 && h >= 30){                                                 /* a plant on the sill, seen through the glass */
      c.fillStyle = '#B5653A'; c.fillRect(x + w * 0.62, y + h - 8, 9, 8); c.fillStyle = '#4C8A44'; c.beginPath(); c.arc(x + w * 0.62 + 4.5, y + h - 11, 6, 0, TAU); c.fill(); c.fillStyle = '#6FB063'; c.beginPath(); c.arc(x + w * 0.62 + 2, y + h - 14, 3.6, 0, TAU); c.fill();
    }
    c.restore();
    c.fillStyle = '#4A3A2C';                                                           /* glazing bars */
    if (h >= 30) c.fillRect(x, y + h * 0.5 - 0.9, w, 1.8);
    if (w >= 36){ c.fillRect(x + w * 0.25 - 0.7, y, 1.4, h); c.fillRect(x + w * 0.75 - 0.7, y, 1.4, h); }
    c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x - 2, y - 2, w + 4, 1);          /* frame highlight, lintel, sill */
    c.fillStyle = '#B9AE9B'; c.fillRect(x - 5, y - 6, w + 10, 4); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 5, y - 6, w + 10, 1); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 3, y - 2, w + 6, 1);
    c.fillStyle = '#C9BFAC'; c.fillRect(x - 5, y + h + 2, w + 10, 4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 5, y + h + 2, w + 10, 1); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 3, y + h + 6, w + 6, 2);
    if (curG && SHUTTER_KINDS[curG.kind] && w >= 24 && w <= 60 && h >= 34){            /* shutters with slats */
      const sc = ['#3E6E52', '#2F4A7A', '#7A3B2A', '#5A4A7A'][Math.floor(hv * 4) % 4], sw = Math.max(8, w * 0.32);
      [x - 4 - sw, x + w + 4].forEach(function(sx){
        c.fillStyle = sc; c.fillRect(sx, y - 2, sw, h + 4); c.fillStyle = 'rgba(0,0,0,.28)'; for (let yy = y + 1; yy < y + h + 2; yy += 4) c.fillRect(sx + 1.5, yy, sw - 3, 1);
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(sx, y - 2, 1.4, h + 4); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(sx + sw - 1.4, y - 2, 1.4, h + 4);
      });
    }
    if (curG && curG.kind !== 'mission' && curG.kind !== 'arcade' && hv > 0.3 && hv < 0.68 && w >= 34){   /* a flower box under the window */
      c.fillStyle = '#6A4A32'; c.fillRect(x - 2, y + h + 6, w + 4, 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 2, y + h + 10, w + 4, 2);
      for (let i = 0; i < Math.floor(w / 7); i++){ const fx = x + 2 + i * 7 + hash(x + i) * 3; c.fillStyle = '#3E7A3A'; c.fillRect(fx, y + h + 1, 1.6, 6); c.fillStyle = ['#F29AC0', '#FFD84D', '#FFFFFF', '#FF8A5A'][i % 4]; c.beginPath(); c.arc(fx + 0.8, y + h + 1, 2.6, 0, TAU); c.fill(); }
    }
  };
  tDoor = function(c, x, w, h, col){
    _tDoor(c, x, w, h, col);
    if (curG) curG.doors.push([x - w / 2 - 14, x + w / 2 + 14]);
    const top = TG - h;
    c.fillStyle = '#B9AE9B'; c.fillRect(x - w / 2 - 8, top - 9, w + 16, 6); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - w / 2 - 8, top - 9, w + 16, 1);   /* lintel and keystone */
    c.fillStyle = '#A59A86'; c.beginPath(); c.moveTo(x - 6, top - 9); c.lineTo(x + 6, top - 9); c.lineTo(x + 4, top - 3); c.lineTo(x - 4, top - 3); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.2; c.strokeRect(x - w / 2 + 5, top + 8, w / 2 - 8, h * 0.4); c.strokeRect(x + 3, top + 8, w / 2 - 8, h * 0.4);               /* raised panels */
    c.strokeRect(x - w / 2 + 5, top + h * 0.5, w / 2 - 8, h * 0.38); c.strokeRect(x + 3, top + h * 0.5, w / 2 - 8, h * 0.38);
    c.strokeStyle = 'rgba(255,255,255,.2)'; c.strokeRect(x - w / 2 + 6, top + 9, w / 2 - 8, h * 0.4); c.strokeRect(x + 4, top + 9, w / 2 - 8, h * 0.4);
    c.fillStyle = '#3A3028'; c.fillRect(x - w / 2, top + 14, 3, 6); c.fillRect(x - w / 2, TG - 24, 3, 6);                               /* hinges */
    c.fillStyle = '#C9A24A'; c.fillRect(x - w / 2 + 3, TG - 14, w - 6, 8); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x - w / 2 + 3, TG - 14, w - 6, 1.5);   /* brass kick plate */
    c.fillRect(x - 7, top + h * 0.46, 14, 3);                                                                                               /* letterbox */
    c.fillStyle = '#9A9285'; c.fillRect(x - w / 2 - 10, TG - 5, w + 20, 5); c.fillStyle = '#B5AC9C'; c.fillRect(x - w / 2 - 10, TG - 5, w + 20, 1.5); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - w / 2 - 10, TG - 1, w + 20, 1);   /* the step */
    c.fillStyle = '#7A3B2A'; c.fillRect(x - w / 2 + 4, TG - 1, w - 8, 1.6);
    const lx = x + w / 2 + 16;                                                                                                              /* wall lantern */
    c.fillStyle = '#2E2A26'; c.fillRect(lx - 1, top + 8, 2, 7); c.fillRect(lx - 5, top + 15, 10, 2); c.fillStyle = '#FFE49A'; c.fillRect(lx - 3.5, top + 17, 7, 9); c.fillStyle = '#2E2A26'; c.fillRect(lx - 4, top + 26, 8, 2);
    const gg = c.createRadialGradient(lx, top + 22, 1, lx, top + 22, 18); gg.addColorStop(0, 'rgba(255,230,150,.3)'); gg.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = gg; c.fillRect(lx - 18, top + 4, 36, 36);
  };
  tAwning = function(c, x, y, w, h, c1, c2){
    _tAwning(c, x, y, w, h, c1, c2);
    const n = Math.max(4, Math.round(w / 22)), sw = w / n;
    c.fillStyle = '#3A2A1E'; c.fillRect(x - 3, y - 3, w + 6, 3);                                                 /* rail and brackets */
    c.fillRect(x - 3, y - 3, 3, h + 8); c.fillRect(x + w, y - 3, 3, h + 8);
    c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x, y, w, 3);
    c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 1;
    for (let i = 0; i <= n; i++){ c.beginPath(); c.moveTo(x + i * sw, y); c.lineTo(x + i * sw + 1.5, y + h); c.stroke(); }
    c.strokeStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < n; i++){ c.beginPath(); c.arc(x + (i + 0.5) * sw + 1, y + h, sw / 2, 0, Math.PI); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(x, y + h * 0.6, w, h * 0.4);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.8; c.setLineDash([2, 2]);                            /* stitching */
    for (let i = 0; i < n; i++){ c.beginPath(); c.moveTo(x + i * sw + 3, y + 2); c.lineTo(x + i * sw + 4, y + h - 3); c.stroke(); }
    c.setLineDash([]);
  };
  tSign = function(c, text, cx, cy, w, fill, ink){
    _tSign(c, text, cx, cy, w, fill, ink);
    const h = 28;
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1; c.beginPath(); c.roundRect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6, 4); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(cx - w / 2 + 5, cy - h / 2 + 1.5, w - 10, 2);
    [-1, 1].forEach(function(s){ c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.arc(cx + s * (w / 2 - 4.5), cy, 1.7, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(cx + s * (w / 2 - 4.5) - 0.4, cy - 0.4, 0.7, 0, TAU); c.fill(); });
  };

  const ln = function(c, col, lw, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const dot = function(c, col, x, y, r){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const tri = function(c, col, x1, y1, x2, y2, x3, y3){ c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill(); };
  const rr = function(c, col, x, y, w, h, r){ c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
  const glow = function(c, x, y, rad, rgb, a){ const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
  const pot = function(c, x, y, s, seed){                                               /* a clay pot with a plant in it, standing on y */
    c.fillStyle = '#B5653A'; c.beginPath(); c.moveTo(x - 7 * s, y - 11 * s); c.lineTo(x + 7 * s, y - 11 * s); c.lineTo(x + 5 * s, y); c.lineTo(x - 5 * s, y); c.closePath(); c.fill();
    c.fillStyle = '#C97A4A'; c.fillRect(x - 8 * s, y - 14 * s, 16 * s, 4 * s); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x + 3 * s, y - 11 * s, 3 * s, 11 * s);
    leafBlob(c, x, y - 20 * s, 10 * s, seed, '#4C8A44', '#6FB063', '#3A6E36');
    for (let i = 0; i < 3; i++) dot(c, ['#F29AC0', '#FFD84D', '#FF8A5A'][i], x - 5 * s + i * 5 * s, y - 24 * s - (i % 2) * 3 * s, 2 * s);
  };

  /* ---------- buildings ---------- */
  function foundation(c, g){
    const cuts = g.doors.slice().sort(function(a, b){ return a[0] - b[0]; });
    const seg = function(a, b){
      if (b - a < 4) return;
      c.fillStyle = '#7E7466'; c.fillRect(a, TG - 9, b - a, 9); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(a, TG - 9, b - a, 1.5);
      c.fillStyle = 'rgba(0,0,0,.28)'; for (let xx = a + 6 + hash(a) * 8; xx < b; xx += 15 + hash(xx) * 9) c.fillRect(xx, TG - 9, 1, 9);
      c.fillRect(a, TG - 4.5, b - a, 1);
    };
    let px = g.x0 - 3;
    for (let i = 0; i < cuts.length; i++){ seg(px, cuts[i][0]); px = Math.max(px, cuts[i][1]); }
    seg(px, g.x0 + g.w + 3);
    const sh = c.createLinearGradient(0, TG, 0, TG + 9); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.fillRect(g.x0 - 3, TG, g.w + 6, 9);
  }
  function drainpipe(c, g){
    let dx = g.doors.length ? (g.doors[0][0] + g.doors[0][1]) / 2 : g.x0 + g.w / 2;
    const left = dx > g.x0 + g.w / 2, px = left ? g.x0 + 7 : g.x0 + g.w - 9;
    c.fillStyle = '#6E727C'; c.fillRect(px, g.top, 4, g.h - 9); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(px, g.top, 1.3, g.h - 9); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px + 3, g.top, 1, g.h - 9);
    c.fillStyle = '#4E525C'; for (let yy = g.top + 18; yy < TG - 12; yy += 46) c.fillRect(px - 1.5, yy, 7, 3);
    c.fillStyle = '#6E727C'; c.fillRect(px - 3, TG - 14, 8, 5); c.fillRect(px - (left ? 8 : -1), TG - 10, 12, 3);                                     /* elbow and spout */
    if (g.kind !== 'studio'){ c.fillStyle = '#5A5E68'; c.fillRect(g.x0 - 4, g.top - 1, g.w + 8, 3); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(g.x0 - 4, g.top - 1, g.w + 8, 1); }    /* gutter (not where a sign sits on the roof edge) */
  }
  function stringLights(c, x1, x2, y, sag, n, seed){
    c.strokeStyle = 'rgba(30,24,20,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y); c.quadraticCurveTo((x1 + x2) / 2, y + sag * 2, x2, y); c.stroke();
    for (let i = 0; i <= n; i++){ const t = i / n, bx = x1 + (x2 - x1) * t, by = y + sag * 4 * t * (1 - t) + 2; glow(c, bx, by + 2, 9, '255,220,120', 0.35); dot(c, ['#FFE49A', '#FFB86B', '#FFE49A', '#FF9AC0'][(i + seed) % 4], bx, by + 2, 2.2); }
  }
  function buildingExtras(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = g.top, K = b.kind;
    if (K !== 'hall') foundation(c, g);
    drainpipe(c, g);
    switch (K){
      case 'tailor':
        for (let i = 0; i < 5; i++){ c.fillStyle = ['#C9628C', '#6BA5D6', '#F2C230', '#7AB87A', '#9A6AC9'][i]; c.beginPath(); c.roundRect(x0 + 36 + i * 11, top + 104, 9, 30 - (i % 2) * 6, 2); c.fill(); ln(c, 'rgba(255,255,255,.35)', 1, x0 + 38 + i * 11, top + 106, x0 + 38 + i * 11, top + 132); }   /* fabric bolts */
        c.fillStyle = '#7A4B2A'; c.fillRect(x0 + 30, top + 134, 150, 5); for (let i = 0; i < 6; i++){ dot(c, ['#E85D3C', '#FFD84D', '#6BBB45', '#4D9AE8', '#F29AC0', '#FFFFFF'][i], x0 + 122 + i * 10, top + 130, 3.4); ln(c, 'rgba(0,0,0,.35)', 1, x0 + 122 + i * 10, top + 127, x0 + 122 + i * 10, top + 133); }  /* shelf of spools */
        ln(c, '#3A2A1E', 2, x0 + W - 122, top + 62, x0 + W - 98, top + 62); ln(c, '#3A2A1E', 1, x0 + W - 117, top + 62, x0 + W - 117, top + 70); ln(c, '#3A2A1E', 1, x0 + W - 103, top + 62, x0 + W - 103, top + 70);
        c.fillStyle = '#FFF4F8'; c.beginPath(); c.roundRect(x0 + W - 124, top + 70, 28, 28, 4); c.fill(); c.strokeStyle = '#7A4B5A'; c.lineWidth = 1.5; c.stroke();
        ln(c, '#7A4B5A', 1.6, x0 + W - 116, top + 76, x0 + W - 104, top + 92); ln(c, '#7A4B5A', 1.6, x0 + W - 104, top + 76, x0 + W - 116, top + 92); dot(c, '#C9628C', x0 + W - 117, top + 93, 2.4); dot(c, '#C9628C', x0 + W - 103, top + 93, 2.4);   /* scissors sign */
        pot(c, x0 + W - 98, TG - 9, 1, Math.round(x0)); pot(c, x0 + 12, TG - 9, 0.9, Math.round(x0) + 3);
        break;
      case 'hall':
        for (let xx = x0 - 8; xx < x0 + W + 8; xx += 9){ c.fillStyle = '#CFC5AE'; c.fillRect(xx, top - 6, 6, 6); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(xx + 4, top - 6, 2, 6); }    /* dentils */
        c.strokeStyle = 'rgba(100,85,60,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + 6, top - 10); c.lineTo(x, top - 54); c.lineTo(x0 + W - 6, top - 10); c.stroke();
        for (let i = 0; i < 9; i++){ const a = Math.PI + 0.3 + i * (Math.PI - 0.6) / 8; ln(c, 'rgba(100,85,60,.18)', 1, x, top - 14, x + Math.cos(a) * 58, top - 14 + Math.sin(a) * 36); }
        c.fillStyle = '#7A6A50'; c.fillRect(x - 3, top - 22 - 0, 1, 1); ln(c, '#4A3A28', 2, x, top - 22, x, top - 36); ln(c, '#4A3A28', 2, x, top - 22, x + 11, top - 18);      /* the clock's hands */
        for (let i = 0; i < 5; i++){ const cx = x0 + 18 + i * (W - 60) / 4; for (let k = 0; k < 3; k++) ln(c, 'rgba(120,105,80,.25)', 1, cx + 4 + k * 5, top + 20, cx + 4 + k * 5, top + h - 44);
          c.fillStyle = '#E2DAC6'; c.fillRect(cx - 3, top + 6, 24, 6); c.fillRect(cx - 3, top + h - 40, 24, 6); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(cx - 3, top + 12, 24, 1.5); }
        [x0 + 12, x0 + W - 12].forEach(function(ux){ c.fillStyle = '#B5AC98'; c.beginPath(); c.ellipse(ux, TG - 46, 9, 12, 0, 0, TAU); c.fill(); c.fillRect(ux - 12, TG - 62, 24, 5); c.fillRect(ux - 5, TG - 36, 10, 18); leafBlob(c, ux, TG - 70, 12, Math.round(ux), '#4C8A44', '#6FB063', '#3A6E36'); });
        for (let i = 0; i < 4; i++){ c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(x0 - 10 + i * 3, TG - 18 + i * 4.5, W + 20 - i * 6, 1.2); }
        break;
      case 'post':
        c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x0 + 140, top + 74, 64, 54); c.fillStyle = '#8A6642'; c.strokeStyle = '#6A4A32'; c.lineWidth = 3; c.strokeRect(x0 + 138, top + 72, 68, 58); c.fillStyle = '#C9A272'; c.fillRect(x0 + 140, top + 74, 64, 54);
        [[146, 80, '#FFFFFF'], [170, 84, '#FFE9A8'], [150, 104, '#D6EBFF'], [176, 106, '#FFD1E0']].forEach(function(n, i){ c.fillStyle = n[2]; c.fillRect(x0 + n[0], top + n[1], 22, 18); ln(c, 'rgba(0,0,0,.3)', 1, x0 + n[0] + 3, top + n[1] + 5, x0 + n[0] + 17, top + n[1] + 5); ln(c, 'rgba(0,0,0,.3)', 1, x0 + n[0] + 3, top + n[1] + 10, x0 + n[0] + 14, top + n[1] + 10); dot(c, ['#D5352B', '#2F8A5A', '#4D9AE8', '#F2C230'][i], x0 + n[0] + 11, top + n[1] + 1.5, 2); });
        [[x0 + W - 150, 22, 18], [x0 + W - 128, 28, 24], [x0 + W - 158, 20, 20]].forEach(function(p, i){ const py = TG - 9 - (i === 2 ? 18 : 0); c.fillStyle = '#C9A272'; c.fillRect(p[0], py - p[2], p[1], p[2]); ln(c, 'rgba(120,80,40,.6)', 2, p[0] + p[1] / 2, py - p[2], p[0] + p[1] / 2, py); ln(c, 'rgba(120,80,40,.6)', 2, p[0], py - p[2] / 2, p[0] + p[1], py - p[2] / 2); c.fillStyle = '#fff'; c.fillRect(p[0] + 3, py - p[2] + 3, 6, 4); });  /* parcels */
        ln(c, '#6A5A44', 2, x0 + 10, top - 18, x0 + 10, top - 62); c.fillStyle = '#2F8A5A'; c.beginPath(); c.moveTo(x0 + 11, top - 62); c.lineTo(x0 + 40, top - 54); c.lineTo(x0 + 11, top - 46); c.fill(); dot(c, '#F4F1E8', x0 + 22, top - 54, 3);
        break;
      case 'cafe':
        stringLights(c, x0 + 10, x0 + W - 10, top + 66, 7, 14, 1);
        c.fillStyle = '#2E2A26'; c.beginPath(); c.moveTo(x0 + 124, TG - 9); c.lineTo(x0 + 134, TG - 62); c.lineTo(x0 + 168, TG - 62); c.lineTo(x0 + 178, TG - 9); c.closePath(); c.fill();
        c.fillStyle = '#22302A'; c.fillRect(x0 + 134, TG - 60, 34, 42); c.fillStyle = 'rgba(255,255,255,.75)'; c.font = 'bold 8px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('TODAY', x0 + 151, TG - 50); for (let i = 0; i < 4; i++) ln(c, 'rgba(255,255,255,.55)', 1.2, x0 + 139, TG - 42 + i * 7, x0 + 139 + 14 + (i % 2) * 8, TG - 42 + i * 7);
        dot(c, '#FFD84D', x0 + 160, TG - 32, 3);
        for (let i = 0; i < 3; i++) glow(c, x0 + 56 + i * 8, top - 70 - i * 18, 10 + i * 4, '230,230,230', 0.4);          /* smoke from the chimney */
        for (let yy = top - 54; yy < top - 14; yy += 7) ln(c, 'rgba(0,0,0,.2)', 1, x0 + 40, yy, x0 + 68, yy);
        c.fillStyle = '#5A3A2E'; c.fillRect(x0 + 37, top - 60, 34, 6);
        break;
      case 'library':
        ln(c, '#4A6A3A', 2, x0 + 8, TG - 30, x0 + 12, top + 40);
        { const r = miniRng(Math.round(x0)); for (let i = 0; i < 60; i++){ const t = r(), yy = TG - 30 - t * (h - 60), xx = x0 + 8 + Math.sin(t * 9) * 8 + r() * 14; c.fillStyle = ['#3E7A3A', '#4C8A44', '#5E9E55'][i % 3]; c.beginPath(); c.ellipse(xx, yy, 5, 3, r() * TAU, 0, TAU); c.fill(); } }     /* ivy */
        c.fillStyle = '#E8E0D0'; c.beginPath(); c.arc(x, top - 28, 14, 0, TAU); c.fill(); c.strokeStyle = '#5A3A2E'; c.lineWidth = 2.5; c.stroke(); for (let i = 0; i < 8; i++){ const a = i * TAU / 8; ln(c, '#5A3A2E', 1.2, x, top - 28, x + Math.cos(a) * 14, top - 28 + Math.sin(a) * 14); } dot(c, '#5A3A2E', x, top - 28, 2.4);    /* rose window */
        [x - 54, x + 46].forEach(function(px){ c.fillStyle = '#E2DAC6'; c.fillRect(px, top + 176, 8, TG - top - 176 - 22); c.fillStyle = '#EFE8D8'; c.fillRect(px - 2, top + 172, 12, 6); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(px + 6, top + 178, 2, TG - top - 200); });
        c.fillStyle = 'rgba(255,248,230,.5)'; c.font = 'bold 9px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('EST. 1887', x, top + 14);
        for (let i = 0; i < 5; i++){ c.fillStyle = ['#C9628C', '#4D9AE8', '#F2C230', '#6BBB45', '#FF8A5A'][i]; c.fillRect(x + 90 + i * 5, top + 118 - 6, 4, 6); }
        break;
      case 'arcade': {
        c.save(); c.shadowColor = '#FF4D8D'; c.shadowBlur = 12; c.strokeStyle = '#FF7AB0'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x0 + 20, top + 32, W - 40, 44, 8); c.stroke(); c.restore();
        const inv = ['0010000100', '0001001000', '0011111100', '0110110110', '1111111111', '1011111101', '1010000101', '0001001000'];
        const draw = function(ox, oy, col, px){ c.save(); c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col; for (let j = 0; j < inv.length; j++) for (let i = 0; i < 10; i++) if (inv[j][i] === '1') c.fillRect(ox + i * px, oy + j * px, px - 0.6, px - 0.6); c.restore(); };
        draw(x0 + 100, top + 130, '#6BFF8D', 4); draw(x0 + W - 140, top + 130, '#FF8AD0', 4);
        [[x0 + 18, '#4DD8FF'], [x0 + W - 88, '#6BFF8D']].forEach(function(cb){ c.fillStyle = 'rgba(0,0,0,.35)'; for (let yy = top + 102; yy < top + 134; yy += 3) c.fillRect(cb[0] + 8, yy, 54, 1); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(cb[0] + 8, top + 100, 54, 3);
          c.fillStyle = '#FFD84D'; c.fillRect(cb[0] + 28, top + 142, 2, 10); dot(c, '#D5352B', cb[0] + 29, top + 141, 4); dot(c, '#4DD8FF', cb[0] + 48, top + 150, 3.4); dot(c, '#FFD84D', cb[0] + 56, top + 154, 3.4);
          c.fillStyle = '#16102A'; c.fillRect(cb[0] + 20, top + 168, 30, 14); c.fillStyle = '#FFD84D'; c.fillRect(cb[0] + 31, top + 172, 8, 3); });
        [x0 + 8, x0 + W - 22].forEach(function(sx){ c.fillStyle = '#16102A'; c.beginPath(); c.roundRect(sx, top + 24, 14, 54, 3); c.fill(); dot(c, '#2A2A3A', sx + 7, top + 38, 4.4); dot(c, '#2A2A3A', sx + 7, top + 60, 4.4); });
        break; }
      case 'mission':
        for (let i = 0; i < 3; i++){ c.save(); c.translate(x0 + 40 + i * 52, top - 12); c.rotate(-0.28); c.fillStyle = '#243B7A'; c.fillRect(0, -26, 44, 26); c.fillStyle = 'rgba(120,160,255,.35)'; for (let k = 1; k < 4; k++) c.fillRect(k * 11 - 0.5, -26, 1, 26); c.fillRect(0, -13, 44, 1); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(0, -26, 44, 2); c.restore(); }   /* solar panels */
        for (let xx = x0 + 6; xx < x0 + W - 6; xx += 40) ln(c, '#9AA0AA', 1.5, xx, top - 10, xx, top - 22); ln(c, '#9AA0AA', 1.5, x0 + 6, top - 22, x0 + W - 6, top - 22);
        ln(c, '#6A6F78', 2, x0 + W - 90, top - 10, x0 + W - 90, top - 60); c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(x0 + W - 90, top - 60); c.lineTo(x0 + W - 66, top - 53); c.lineTo(x0 + W - 90, top - 46); c.fill();
        c.save(); c.translate(x0 + W - 58, top + 140); dot(c, '#2F4A8A', 0, 0, 24); c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 21, 0, TAU); c.stroke(); dot(c, '#FF9A3C', 0, 0, 9); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 0, 18, 6, -0.5, 0, TAU); c.stroke(); for (let i = 0; i < 5; i++) dot(c, '#FFFFFF', -12 + i * 6, -14 + (i % 2) * 2, 1); c.restore();
        for (let i = 0; i < 6; i++) dot(c, ['#6BFF8D', '#FFD84D', '#6BFF8D', '#FF4D4D', '#6BFF8D', '#4DD8FF'][i], x0 + 118 + i * 14, top + 124, 3);
        c.fillStyle = '#2A2F3C'; c.fillRect(x + 44, top + TG - top - 70, 14, 24); dot(c, '#6BFF8D', x + 51, TG - 62, 2.4); c.fillStyle = '#9AA0AA'; c.fillRect(x + 46, TG - 54, 10, 3);
        break;
      case 'shack':
        for (let i = 0; i < 4; i++){ const bx = x0 + 30 + i * 36; ln(c, '#6A5848', 1.2, bx, top + 10, bx, top + 20); dot(c, i % 2 ? '#F4F1E8' : '#D5352B', bx, top + 25, 6); c.fillStyle = i % 2 ? '#D5352B' : '#F4F1E8'; c.fillRect(bx - 6, top + 23, 12, 3); }
        c.strokeStyle = 'rgba(70,50,20,.5)'; c.lineWidth = 1; for (let i = 0; i < 9; i++){ ln(c, 'rgba(70,50,20,.5)', 1, x0 + 100 + i * 6, top + 20, x0 + 100 + i * 6, top + 70); } for (let j = 0; j < 8; j++) ln(c, 'rgba(70,50,20,.5)', 1, x0 + 100, top + 20 + j * 7, x0 + 152, top + 20 + j * 7);        /* the net */
        for (let i = 0; i < 3; i++){ const fx = x0 + 104 + i * 18; c.fillStyle = '#8FA8B8'; c.beginPath(); c.ellipse(fx + 6, top + 92, 8, 3.4, 0, 0, TAU); c.moveTo(fx - 3, top + 92); c.lineTo(fx - 9, top + 88); c.lineTo(fx - 9, top + 96); c.fill(); ln(c, '#6A5848', 1, fx + 6, top + 82, fx + 6, top + 90); }
        ln(c, '#6A5848', 2, x0 + 96, top + 80, x0 + 174, top + 80);
        for (let i = 0; i < 2; i++){ const px = x0 + W + 6 + i * 4, py = TG - 9 - i * 18; c.strokeStyle = '#8A6642'; c.lineWidth = 2; c.strokeRect(px, py - 18, 26, 18); for (let k = 1; k < 4; k++) ln(c, '#8A6642', 1.4, px + k * 6.5, py - 18, px + k * 6.5, py); ln(c, '#8A6642', 1.4, px, py - 9, px + 26, py - 9); }
        c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(x0 + 50, top - 36); c.quadraticCurveTo(x0 + 56, top - 42, x0 + 62, top - 36); c.quadraticCurveTo(x0 + 56, top - 38, x0 + 50, top - 36); c.fill(); ln(c, '#E8A24A', 1.4, x0 + 62, top - 37, x0 + 66, top - 35);
        break;
      case 'shed':
        for (let i = 0; i < 4; i++){ const tx = x0 + 10 + i * 12; ln(c, '#6A4A32', 2, tx, top + 34, tx, top + 100); }
        c.fillStyle = '#9AA0AA'; c.beginPath(); c.moveTo(x0 + 8, top + 44); c.lineTo(x0 + 28, top + 44); c.lineTo(x0 + 30, top + 56); c.lineTo(x0 + 6, top + 56); c.closePath(); c.fill(); ln(c, '#8A6642', 2, x0 + 18, top + 56, x0 + 18, top + 104);
        ln(c, '#8A6642', 2, x0 + 38, top + 40, x0 + 38, top + 104); for (let i = 0; i < 5; i++) ln(c, '#6A4A32', 1.4, x0 + 30 + i * 4, top + 40, x0 + 30 + i * 4, top + 50);     /* shovel and rake on pegs */
        for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.4)', 2, x + 30 - 18, top + 14 + i * 4, x + 30 + 18, top + 14 + i * 4);
        for (let i = 0; i < 2; i++){ c.fillStyle = '#B79C6A'; c.beginPath(); c.roundRect(x0 + W - 46 + i * 14, TG - 9 - 26 + i * 4, 22, 26 - i * 4, 6); c.fill(); ln(c, 'rgba(70,50,20,.5)', 1, x0 + W - 40 + i * 14, TG - 9 - 20 + i * 4, x0 + W - 28 + i * 14, TG - 9 - 20 + i * 4); }
        dot(c, '#C9A24A', x - 30 + 20, TG - 44, 2.4);
        break;
      case 'studio':
        for (let xx = x0 + 4; xx < x0 + W - 8; xx += 10){ c.fillStyle = '#16213A'; c.fillRect(xx, top + 15, 6, 6); }                                    /* film perforations */
        for (let i = 0; i < 16; i++){ const a = i * TAU / 16; dot(c, i % 2 ? '#FFE9A8' : '#FFFFFF', x + Math.cos(a) * 38, top + 53 + Math.sin(a) * 31, 1.8); }
        [x0 + 28, x0 + W - 28].forEach(function(px, i){ ln(c, '#2A2F3C', 3, px, top - 12, px, top - 26); c.fillStyle = '#2A2F3C'; c.fillRect(px - 6, top - 34, 12, 10); const g = c.createLinearGradient(px, top - 34, px + (i ? -40 : 40), top - 150); g.addColorStop(0, 'rgba(255,248,200,.35)'); g.addColorStop(1, 'rgba(255,248,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(px, top - 34); c.lineTo(px + (i ? -70 : 10), top - 150); c.lineTo(px + (i ? -20 : 60), top - 150); c.closePath(); c.fill(); });
        [x0 + 32, x0 + W - 32].forEach(function(px){ ln(c, '#C9A24A', 3, px, TG - 9, px, TG - 44); dot(c, '#E8C24A', px, TG - 46, 5); c.fillStyle = '#C9A24A'; c.fillRect(px - 8, TG - 11, 16, 3); });
        c.strokeStyle = '#8A1E24'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 32, TG - 42); c.quadraticCurveTo(x, TG - 22, x0 + W - 32, TG - 42); c.stroke();                       /* velvet rope */
        for (let i = 0; i < 5; i++){ ln(c, 'rgba(255,255,255,.18)', 1, x0 + 36 + i * 52, top + 100, x0 + 36 + i * 52, TG - 9); }
        break;
    }
  }

  const _tBuilding = townBuilding;
  let otherKinds = null;
  townBuilding = function(c, D, b, P, r){
    if (D.indoor || D.theme === 'runway') return _tBuilding(c, D, b, P, r);
    groundOnce(c, D);
    curG = { kind: b.kind, x0: b.x - b.w / 2, top: TG - b.h, wallTop: TG - b.h, w: b.w, h: b.h, wallH: b.kind === 'hall' ? b.h - 34 : b.h, doors: [], wall: false };
    if (TOWN_WALL_BOX[b.kind]){ const wb = TOWN_WALL_BOX[b.kind](b); curG.wallTop = TG - wb.h; curG.wallH = wb.h; }
    try { _tBuilding(c, D, b, P, r); } finally { var g = curG; curG = null; }
    if (TOWN_BUILD_EXTRAS[b.kind]) TOWN_BUILD_EXTRAS[b.kind](c, D, b, g);
    else if (WALL_KINDS[b.kind]) buildingExtras(c, D, b, g);
    else if (otherKinds) otherKinds(c, D, b, g);
  };

  /* ---------- the other buildings (no wall of their own) ---------- */
  otherKinds = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = g.top, K = b.kind;
    switch (K){
      case 'board': {
        const r = miniRng(Math.round(x));
        c.fillStyle = 'rgba(60,35,15,.2)'; for (let i = 0; i < 70; i++) c.fillRect(x - 60 + r() * 120, TG - 150 + r() * 80, 1.6, 1.6);                            /* cork */
        tiles(c, [x - 82, TG - 166, x, TG - 192, x + 82, TG - 166], 7); c.fillStyle = '#6A4A32'; c.fillRect(x - 76, TG - 168, 152, 3);
        [[-40, -138, '#D5352B'], [0, -140, '#4D9AE8'], [38, -136, '#2F8A5A'], [-26, -110, '#F2C230'], [20, -106, '#D5352B']].forEach(function(p){ dot(c, p[2], x + p[0] + 4, TG + p[1] + 2, 2.4); ln(c, 'rgba(0,0,0,.3)', 1, x + p[0] + 4, TG + p[1] + 4, x + p[0] + 6, TG + p[1] + 8); });
        for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.28)', 1, x - 44 + (i % 2) * 20, TG - 134 + i * 6, x - 20 + (i % 2) * 20, TG - 134 + i * 6);
        ln(c, '#B5402A', 1.4, x - 30, TG - 138, x + 6, TG - 108); ln(c, '#B5402A', 1.4, x + 6, TG - 108, x + 36, TG - 134);                                           /* red string between pins */
        c.fillStyle = '#3A2A1E'; c.fillRect(x - 70, TG - 8, 140, 8); for (let i = 0; i < 3; i++) ln(c, 'rgba(255,255,255,.12)', 1, x - 66, TG - 6 + i * 2, x + 66, TG - 6 + i * 2);
        break; }
      case 'scores':
        for (let i = 0; i < 18; i++){ dot(c, i % 2 ? '#FFE9A8' : '#FFF6D0', x - 82 + i * 9.6, TG - 186, 2.2); dot(c, i % 2 ? '#FFF6D0' : '#FFE9A8', x - 82 + i * 9.6, TG - 86, 2.2); }
        for (let i = 0; i < 4; i++){ dot(c, i % 2 ? '#FFE9A8' : '#FFF6D0', x - 82, TG - 180 + i * 28, 2.2); dot(c, i % 2 ? '#FFF6D0' : '#FFE9A8', x + 82, TG - 180 + i * 28, 2.2); }
        c.fillStyle = '#FFD84D'; c.beginPath(); c.moveTo(x - 66, TG - 176); c.lineTo(x - 52, TG - 176); c.lineTo(x - 54, TG - 166); c.lineTo(x - 64, TG - 166); c.closePath(); c.fill(); ln(c, '#FFD84D', 2, x - 59, TG - 166, x - 59, TG - 162); c.fillRect(x - 64, TG - 162, 10, 3);
        for (let i = 0; i < 4; i++){ c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 22, TG - 158 + i * 18, 2, 8); c.fillRect(x + 28, TG - 158 + i * 18, 2, 8); }
        c.fillStyle = '#3A2A1E'; c.fillRect(x - 80, TG - 8, 160, 8);
        break;
      case 'scope':
        c.save(); c.translate(x, TG - 96); c.rotate(-0.7); for (let i = 0; i < 3; i++){ c.fillStyle = '#B9923F'; c.fillRect(-11, -30 + i * 30, 22, 4); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-11, -30 + i * 30, 22, 1); }
        c.fillStyle = '#7A86A8'; c.fillRect(-18, -34, 5, 40); c.fillStyle = '#2F4A8A'; c.fillRect(-19, -36, 7, 6); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-8, -56, 3, 100); dot(c, '#9BD8FF', 0, -62, 6); dot(c, '#FFFFFF', -2, -64, 2);
        c.restore();
        for (let i = 0; i < 3; i++) ln(c, '#5A6578', 3, x - 4 + (i - 1) * 4, TG - 24, x - 40 + i * 40, TG - 2);
        c.fillStyle = '#E8EAF0'; c.beginPath(); c.arc(x + 4, TG - 12, 9, 0, TAU); c.fill(); for (let i = 0; i < 6; i++) ln(c, '#6A7488', 1, x + 4, TG - 12, x + 4 + Math.cos(i) * 8, TG - 12 + Math.sin(i) * 8);
        break;
      case 'tram':
        c.fillStyle = '#FFFFFF'; c.fillRect(x0 + 14, top + 24, 44, 30); c.fillStyle = '#2F6A5A'; c.fillRect(x0 + 14, top + 24, 44, 8); for (let i = 0; i < 4; i++) ln(c, '#2F6A5A', 1.4, x0 + 18, top + 38 + i * 4, x0 + 18 + 22 + (i % 2) * 8, top + 38 + i * 4);          /* timetable */
        ln(c, '#6A6F78', 1.2, x0 - 8, top - 22, x0 + W + 40, top - 40);                                                                                                       /* overhead wire */
        for (let i = 0; i < 4; i++) ln(c, '#6A6F78', 1, x0 + i * 52, top - 22 - i * 3.4, x0 + i * 52, top - 12);
        c.fillStyle = '#E8C24A'; c.beginPath(); c.arc(x0 + W - 16, top + 6, 5, Math.PI, TAU); c.fill(); ln(c, '#B8903A', 1, x0 + W - 16, top + 6, x0 + W - 16, top + 12);
        for (let i = 0; i < 6; i++) ln(c, 'rgba(0,0,0,.3)', 1, x0 + 22 + i * 18, TG - 28, x0 + 22 + i * 18, TG - 20);
        c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x0 - 8, top + 6, W + 16, 3);
        break;
      case 'grove': {
        const r = miniRng(Math.round(x));
        ln(c, 'rgba(40,24,12,.35)', 1.4, x - 18, TG - 12, x - 14, TG - 130); ln(c, 'rgba(40,24,12,.35)', 1.4, x + 4, TG - 10, x + 2, TG - 136); ln(c, 'rgba(40,24,12,.35)', 1.4, x + 20, TG - 14, x + 16, TG - 128);
        c.fillStyle = 'rgba(30,18,8,.4)'; c.beginPath(); c.ellipse(x - 6, TG - 70, 5, 9, 0, 0, TAU); c.fill();
        [[0, 250, 100], [-96, 214, 74], [96, 214, 76], [-56, 276, 62], [58, 272, 62], [0, 320, 54]].forEach(function(l, i){ leafBlob(c, x + l[0], TG - l[1], l[2], 40 + i, '#4C8A44', '#7BBE6A', '#376A34'); });
        for (let i = 0; i < 22; i++){ const a = r() * TAU, d = 40 + r() * 70; dot(c, i % 3 ? '#E85D3C' : '#FFD84D', x + Math.cos(a) * d, TG - 250 + Math.sin(a) * d * 0.8, 3); }
        ln(c, '#7A5A3A', 1.6, x - 90, TG - 182, x - 90, TG - 40); ln(c, '#7A5A3A', 1.6, x - 66, TG - 182, x - 66, TG - 40); c.fillStyle = '#8A6642'; c.fillRect(x - 96, TG - 42, 36, 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 96, TG - 38, 36, 2);   /* swing */
        for (let i = 0; i < 16; i++){ c.fillStyle = ['#C9772E', '#B5502A', '#D9A02E'][i % 3]; c.beginPath(); c.ellipse(x - 110 + r() * 220, TG + 4 + r() * 18, 4, 2.2, r() * TAU, 0, TAU); c.fill(); }
        for (let i = 0; i < 4; i++){ const mx = x + 54 + i * 9; c.fillStyle = '#F4EEDC'; c.fillRect(mx - 1, TG - 8 - (i % 2) * 2, 2, 7); c.fillStyle = i % 2 ? '#D5352B' : '#C9772E'; c.beginPath(); c.ellipse(mx, TG - 9 - (i % 2) * 2, 5, 3.4, 0, Math.PI, TAU); c.fill(); }
        break; }
      case 'farm':
        for (let xx = x0 - 4; xx <= x0 + W + 2; xx += 56){ c.fillStyle = '#5A3C28'; c.fillRect(xx - 1, TG - 94, 8, 4); ln(c, 'rgba(0,0,0,.3)', 1, xx + 1, TG - 88, xx + 1, TG); }
        for (let i = 0; i < 40; i++){ const r = hash(i * 3.1 + x); ln(c, '#D9C26A', 1.2, x0 + 10 + r * (W - 20), TG - 38 + hash(i) * 6, x0 + 14 + r * (W - 20), TG - 32 + hash(i + 9) * 6); }
        for (let i = 0; i < 4; i++){ c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0 + 2 + i * W / 4, TG - 44, 1.4, 5); }
        break;
      case 'ladder':
        for (let yy = 20; yy < TG; yy += 34){ dot(c, '#3A2A1E', x - 17, yy + 2.5, 1.4); dot(c, '#3A2A1E', x + 17, yy + 2.5, 1.4); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 20, yy + 5, 40, 2); }
        ln(c, 'rgba(0,0,0,.3)', 1, x - 18, 0, x - 18, TG); ln(c, 'rgba(0,0,0,.3)', 1, x + 16, 0, x + 16, TG);
        c.fillStyle = '#5A4A3A'; c.fillRect(x - 40, TG - 6, 80, 6); glow(c, x, 140, 70, '255,225,150', 0.16);
        break;
      case 'cavern':
        for (let i = 0; i < 15; i++){ const a = Math.PI + (i + 0.5) * Math.PI / 15, cx = x, cy = TG - 110, r0 = 118, r1 = 148 + (i % 2) * 12; c.fillStyle = i % 2 ? '#5A4A44' : '#4E3E3A'; c.beginPath(); c.moveTo(cx + Math.cos(a - 0.1) * r0 * (W / 300), cy + Math.sin(a - 0.1) * 100); c.lineTo(cx + Math.cos(a - 0.1) * r1 * (W / 300), cy + Math.sin(a - 0.1) * 118); c.lineTo(cx + Math.cos(a + 0.1) * r1 * (W / 300), cy + Math.sin(a + 0.1) * 118); c.lineTo(cx + Math.cos(a + 0.1) * r0 * (W / 300), cy + Math.sin(a + 0.1) * 100); c.closePath(); c.fill(); }
        [x0 + 20, x0 + W - 20].forEach(function(px){ c.fillStyle = '#6A4A32'; c.fillRect(px - 6, TG - 120, 12, 120); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(px - 6, TG - 120, 2, 120); ln(c, '#3A2A1E', 1.4, px, TG - 120, px, TG - 100); dot(c, '#FFE49A', px, TG - 96, 4); glow(c, px, TG - 96, 36, '255,210,120', 0.35); });
        ln(c, '#6A4A32', 10, x0 + 14, TG - 122, x0 + W - 14, TG - 122);
        for (let i = 0; i < 4; i++){ c.fillStyle = '#F4EEDC'; c.fillRect(x0 + 42 + i * 70, TG - 36, 14, 8); ln(c, 'rgba(0,0,0,.4)', 1, x0 + 44 + i * 70, TG - 34, x0 + 54 + i * 70, TG - 34); }
        break;
      case 'fusion':
        if (!(b.gate && !b.gate())){
          for (let i = 0; i < 8; i++){ dot(c, '#6A7078', x0 + 26 + i * 8, top + 70, 1.6); dot(c, '#6A7078', x0 + W - 98 + i * 8, top + 70, 1.6); }
          [x0 + 60, x0 + W - 60].forEach(function(px){ dot(c, '#2A2F3C', px, top + 120, 12); dot(c, '#E8EAF0', px, top + 120, 9); ln(c, '#D5352B', 1.8, px, top + 120, px + 5, top + 114); for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ln(c, '#6A7078', 1, px + Math.cos(a) * 7, top + 120 + Math.sin(a) * 7, px + Math.cos(a) * 9, top + 120 + Math.sin(a) * 9); } });
          for (let k = 0; k < 3; k++){ c.strokeStyle = 'rgba(255,255,255,' + (0.5 - k * 0.12) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(x, top + 90, 42 + k * 8, 0, TAU); c.stroke(); }
          glow(c, x, top + 90, 70, '255,170,70', 0.35);
          for (let i = 0; i < 3; i++) glow(c, x0 + 40 + i * 5, top + 36 - i * 16, 10 + i * 4, '230,230,230', 0.4);
          c.fillStyle = '#E3B93C'; for (let xx = x0; xx < x0 + W; xx += 24) c.fillRect(xx, TG - 8, 12, 8);
        } else {                                                                                           /* the sheet over the unbuilt machine */
          const P = [x0 + 10, TG - 24, x0 + 40, top + 30, x0 + W - 40, top + 40, x0 + W - 10, TG - 24];
          c.save(); c.beginPath(); c.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1]); c.closePath(); c.clip();
          const tg = c.createLinearGradient(0, top + 30, 0, TG - 24); tg.addColorStop(0, 'rgba(255,255,255,.1)'); tg.addColorStop(0.6, 'rgba(0,0,0,.12)'); tg.addColorStop(1, 'rgba(30,20,40,.4)'); c.fillStyle = tg; c.fillRect(x0, top, W, h);
          for (let i = 0; i < 9; i++){ const fx = x0 + 30 + i * (W - 60) / 8 + (hash(i) - 0.5) * 14; c.strokeStyle = 'rgba(40,40,56,.28)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(fx, top + 30); c.quadraticCurveTo(fx + (i % 2 ? 9 : -9), top + h * 0.45, fx + (hash(i + 4) - 0.5) * 16, TG - 24); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(fx + 3, top + 30); c.quadraticCurveTo(fx + 3 + (i % 2 ? 9 : -9), top + h * 0.45, fx + 3 + (hash(i + 4) - 0.5) * 16, TG - 24); c.stroke(); }
          for (let i = 0; i < 4; i++) ln(c, 'rgba(40,40,56,.2)', 1.6, P[0] + 6, TG - 30 - i * 30, P[0] + 70 + i * 24, TG - 60 - i * 34);
          c.fillStyle = 'rgba(60,50,80,.28)'; c.font = 'bold 84px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('?', x, top + 150);
          c.restore();
          for (let k = 0; k < 2; k++){ const ry = TG - 62 - k * 60, lx = x0 + 18 + k * 12, rx = x0 + W - 18 - k * 12; c.strokeStyle = '#B79C6A'; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, ry); c.quadraticCurveTo(x, ry + 10, rx, ry); c.stroke(); c.strokeStyle = 'rgba(70,50,20,.5)'; c.lineWidth = 1; c.setLineDash([2, 3]); c.stroke(); c.setLineDash([]); for (let i = 0; i < 5; i++){ const t = (i + 0.5) / 5, qx = lx + (rx - lx) * t, qy = ry + 10 * 2 * t * (1 - t); dot(c, '#8A6A3A', qx, qy, 3); } }
          [x0 + 14, x0 + W - 14].forEach(function(px){ ln(c, '#B79C6A', 2, px, TG - 62, px - 4, TG - 4); c.fillStyle = '#6A4A32'; c.fillRect(px - 8, TG - 12, 8, 10); tri(c, '#6A4A32', px - 8, TG - 12, px, TG - 12, px - 4, TG - 4); });
          c.fillStyle = '#E3B93C'; for (let xx = x0; xx < x0 + W; xx += 24) c.fillRect(xx, TG - 8, 12, 8); c.fillStyle = 'rgba(0,0,0,.8)'; for (let xx = x0 + 12; xx < x0 + W; xx += 24) c.fillRect(xx, TG - 8, 12, 8);
          for (let i = 0; i < 5; i++){ c.fillStyle = i % 2 ? '#8A6642' : '#9A7550'; c.fillRect(x0 + W + 6, TG - 6 - i * 6, 46, 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0 + W + 6, TG - 1 - i * 6, 46, 1); }
          rr(c, '#C9503C', x0 - 40, TG - 18, 30, 18, 3); c.fillStyle = '#6A6F78'; c.fillRect(x0 - 40, TG - 22, 30, 4); ln(c, '#6A6F78', 2, x0 - 34, TG - 22, x0 - 30, TG - 28); ln(c, '#6A6F78', 2, x0 - 16, TG - 22, x0 - 20, TG - 28);
        }
        break;
      case 'lighthouse':
        c.save(); c.beginPath(); c.moveTo(x - 70, TG); c.lineTo(x - 40, top + 60); c.lineTo(x + 40, top + 60); c.lineTo(x + 70, TG); c.closePath(); c.clip();
        for (let yy = top + 70; yy < TG; yy += 16){ ln(c, 'rgba(60,40,30,.16)', 1, x - 80, yy, x + 80, yy); for (let xx = x - 70 + ((yy / 16) % 2) * 12; xx < x + 70; xx += 24) ln(c, 'rgba(60,40,30,.12)', 1, xx, yy, xx, yy + 16); }
        const gr = c.createLinearGradient(x - 70, 0, x + 70, 0); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); c.fillStyle = gr; c.fillRect(x - 80, top + 60, 160, h);
        c.restore();
        for (let i = 0; i < 4; i++){ const wy = TG - 120 - i * 74, hw = 5; c.fillStyle = '#2A3A4A'; c.beginPath(); c.roundRect(x - hw, wy, hw * 2, 18, [hw, hw, 1, 1]); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - hw + 1, wy + 2, 2, 12); c.fillStyle = '#B5AC9C'; c.fillRect(x - hw - 2, wy + 18, hw * 2 + 4, 3); }
        for (let xx = x - 52; xx < x + 52; xx += 7) ln(c, '#3A3A44', 1.2, xx, top + 38, xx, top + 50);
        ln(c, '#3A3A44', 2, x - 54, top + 38, x + 54, top + 38);
        [-1, 1].forEach(function(sd){ const bg = c.createLinearGradient(x, 0, x + sd * 340, 0); bg.addColorStop(0, 'rgba(255,248,200,.34)'); bg.addColorStop(1, 'rgba(255,248,200,0)'); c.fillStyle = bg; c.beginPath(); c.moveTo(x, top + 33); c.lineTo(x + sd * 340, top + 4); c.lineTo(x + sd * 340, top + 60); c.closePath(); c.fill(); });
        glow(c, x, top + 33, 50, '255,245,170', 0.4); ln(c, '#3A3A44', 2, x, top - 26, x, top - 44); dot(c, '#3A3A44', x, top - 46, 3); ln(c, '#3A3A44', 1.6, x - 8, top - 40, x + 8, top - 40);
        [[x - 92, 26, 16], [x + 80, 30, 18], [x - 112, 16, 10]].forEach(function(rk){ c.fillStyle = '#6A6A74'; c.beginPath(); c.ellipse(rk[0], TG - 2, rk[1], rk[2], 0, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(rk[0] - 6, TG - 2 - rk[2] * 0.6, rk[1] * 0.4, rk[2] * 0.3, 0, 0, TAU); c.fill(); });
        break;
      case 'garden': {
        const r = miniRng(Math.round(x));
        c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 90; i++){ const dx = x0 + 14 + r() * (W - 28), dy = top + 26 + r() * (h - 80); c.beginPath(); c.ellipse(dx, dy, 1.3, 2, 0, 0, TAU); c.fill(); }   /* condensation */
        c.strokeStyle = 'rgba(70,130,70,.6)'; c.lineWidth = 1.4; for (let i = 0; i < 2; i++){ c.beginPath(); c.moveTo(x0 + 24 + i * (W - 48), TG - 30); for (let yy = TG - 30; yy > top + 30; yy -= 8) c.lineTo(x0 + 24 + i * (W - 48) + Math.sin(yy * 0.2) * 5, yy); c.stroke(); }
        for (let i = 0; i < 14; i++){ const t = r(); c.fillStyle = '#4C8A44'; c.beginPath(); c.ellipse(x0 + 24 + (i % 2) * (W - 48) + Math.sin((TG - 30 - t * (h - 70)) * 0.2) * 5, TG - 32 - t * (h - 70), 4, 2.2, r() * TAU, 0, TAU); c.fill(); }
        for (let i = 0; i < 8; i++) dot(c, '#E8402A', x0 + 24 + (i % 2) * (W - 48) + 3, TG - 60 - i * 10, 2.4);
        for (let i = 0; i < 6; i++){ const px = x0 + 40 + i * 56; for (let k = 0; k < 5; k++){ const a = k * TAU / 5; dot(c, ['#F29AC0', '#FFD84D', '#FF8A5A'][i % 3], px + 2 + Math.cos(a) * 5, TG - 86 + Math.sin(a) * 5, 4.2); } dot(c, '#7A4B1A', px + 2, TG - 86, 3.4); ln(c, '#3E7A3A', 2, px + 2, TG - 80, px - 6, TG - 64); c.fillStyle = '#4C8A44'; c.beginPath(); c.ellipse(px - 7, TG - 62, 6, 2.6, -0.5, 0, TAU); c.fill(); }
        c.fillStyle = '#4A3A2A'; c.fillRect(x0, TG - 30, W, 3); for (let i = 0; i < 12; i++) ln(c, 'rgba(255,255,255,.15)', 1, x0 + 10 + i * 30, TG - 30, x0 + 10 + i * 30, TG);
        ln(c, '#9AA0AA', 2, x0 + W + 12, TG - 30, x0 + W + 12, TG); c.fillStyle = '#4A8F6A'; c.beginPath(); c.roundRect(x0 + W + 4, TG - 28, 22, 14, 3); c.fill(); ln(c, '#4A8F6A', 3, x0 + W + 26, TG - 24, x0 + W + 34, TG - 32);                  /* watering can */
        break; }
      case 'hatch':
        for (let i = 0; i < 12; i++) dot(c, '#2E2E36', x + Math.cos(i * TAU / 12) * 50, TG + 33 + Math.sin(i * TAU / 12) * 10, 1.6);
        ln(c, 'rgba(255,255,255,.22)', 1.4, x - 40, TG + 30, x + 20, TG + 28); c.strokeStyle = '#E3B93C'; c.lineWidth = 2.4; c.setLineDash([6, 5]); c.beginPath(); c.ellipse(x, TG + 36, 66, 17, 0, 0, TAU); c.stroke(); c.setLineDash([]);
        break;
    }
  };

  /* ---------- props ---------- */
  const PROP_THEMES = { square: 1, market: 1, park: 1, harbour: 1, roofs: 1, launch: 1, burrows: 1 };
  const _tProp = townProp;
  townProp = function(c, D, p, P, r){
    if (D.indoor || !PROP_THEMES[D.theme]) return _tProp(c, D, p, P, r);
    groundOnce(c, D);
    _tProp(c, D, p, P, r);
    const x = p.x, s = p.s || 1, seed = Math.round(x * 3 + (p.y || 0));
    c.save();
    switch (p.k){
      case 'tree':
        for (let i = 0; i < 5; i++) ln(c, 'rgba(40,24,12,.4)', 1.4 * s, x - 7 * s + i * 3.5 * s, TG - 4, x - 5 * s + i * 2.5 * s, TG - 110 * s);
        c.fillStyle = '#6B4A32'; c.beginPath(); c.moveTo(x - 20 * s, TG); c.quadraticCurveTo(x - 12 * s, TG - 8 * s, x - 10 * s, TG - 24 * s); c.lineTo(x + 10 * s, TG - 24 * s); c.quadraticCurveTo(x + 12 * s, TG - 8 * s, x + 20 * s, TG); c.fill();
        c.fillStyle = 'rgba(30,18,8,.4)'; c.beginPath(); c.ellipse(x + 1 * s, TG - 50 * s, 3.2 * s, 6 * s, 0, 0, TAU); c.fill();
        [[-4, 160, 54], [-38, 140, 36], [38, 142, 38]].forEach(function(l, i){ leafBlob(c, x + l[0] * s, TG - l[1] * s, l[2] * s, seed + i, '#4F8A4A', '#8CCB78', '#3A6E36'); });
        for (let i = 0; i < 14; i++){ const a = hash(seed + i) * TAU, d = 20 + hash(seed + i * 2) * 50; dot(c, 'rgba(255,255,230,.35)', x - 4 * s + Math.cos(a) * d * s, TG - 170 * s + Math.sin(a) * d * 0.7 * s, 2.2 * s); }
        for (let i = 0; i < 10; i++){ c.fillStyle = 'rgba(30,60,20,.18)'; c.beginPath(); c.ellipse(x - 50 * s + hash(seed + i) * 100 * s, TG + 6 + hash(seed - i) * 8, 7 * s, 2.4 * s, 0, 0, TAU); c.fill(); }
        for (let i = 0; i < 6; i++){ c.fillStyle = ['#C9772E', '#B5502A', '#D9A02E'][i % 3]; c.beginPath(); c.ellipse(x - 40 * s + hash(seed + i * 4) * 80 * s, TG + 3 + hash(seed + i) * 10, 3.6, 2, hash(i) * TAU, 0, TAU); c.fill(); }
        for (let i = 0; i < 6; i++) ln(c, '#3E7A3A', 1.4, x - 24 * s + i * 3 - 2, TG, x - 26 * s + i * 4, TG - 6 - (i % 3) * 2);
        break;
      case 'bush':
        leafBlob(c, x - 16, TG - 14, 20, seed, '#4C8744', '#7BBE6A', '#376A34'); leafBlob(c, x + 8, TG - 20, 24, seed + 1, '#5A9A50', '#8CCB78', '#3F7A38'); leafBlob(c, x + 26, TG - 12, 17, seed + 2, '#6BAA5E', '#9AD88A', '#4A8A44');
        for (let i = 0; i < 9; i++) dot(c, i % 3 ? '#D5352B' : '#FFFFFF', x - 24 + hash(seed + i) * 56, TG - 32 + hash(seed - i) * 22, 2);
        for (let i = 0; i < 5; i++) ln(c, '#3E7A3A', 1.2, x - 30 + i * 14, TG, x - 30 + i * 14 + (i % 2 ? 3 : -3), TG - 6);
        break;
      case 'flowers':
        for (let i = 0; i < 9; i++){ const fx = x - 34 + i * 8 + hash(seed + i) * 4, fh = 8 + hash(seed - i) * 18; ln(c, '#3E7A3A', 1.4, fx, TG, fx + (i % 2 ? 2 : -2), TG - fh);
          c.fillStyle = '#4C8A44'; c.beginPath(); c.ellipse(fx + 4, TG - fh * 0.4, 5, 1.8, -0.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(fx - 4, TG - fh * 0.6, 5, 1.8, 0.5, 0, TAU); c.fill();
          if (i % 2) for (let k = 0; k < 5; k++){ const a = k * TAU / 5; dot(c, ['#F29AC0', '#FFFFFF', '#FF8A5A', '#B58AE8'][i % 4], fx + Math.cos(a) * 3.2, TG - fh + Math.sin(a) * 3.2, 2.2); } }
        for (let i = 0; i < 12; i++) ln(c, '#3E7A3A', 1, x - 38 + i * 6.6, TG, x - 40 + i * 6.6, TG - 5 - (i % 3) * 2);
        dot(c, '#FFD84D', x + 6, TG - 28, 1.6); dot(c, '#1A1A1A', x + 6, TG - 27, 0.8);
        break;
      case 'lamp':
        c.fillStyle = '#4A4A58'; c.fillRect(x - 13, TG - 14, 26, 6); c.fillRect(x - 9, TG - 22, 18, 8); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - 13, TG - 14, 26, 1.4);
        for (let i = 0; i < 3; i++){ c.fillStyle = '#4A4A58'; c.fillRect(x - 5, TG - 130 + i * 40, 10, 4); }
        ln(c, 'rgba(255,255,255,.28)', 1, x - 1.6, TG - 22, x - 1.6, TG - 150);
        c.fillStyle = '#2E2E36'; c.fillRect(x - 13, TG - 171, 26, 5); c.beginPath(); c.moveTo(x - 9, TG - 171); c.lineTo(x, TG - 182); c.lineTo(x + 9, TG - 171); c.fill(); dot(c, '#2E2E36', x, TG - 184, 2);
        ln(c, 'rgba(60,40,20,.5)', 1.2, x, TG - 165, x, TG - 151); ln(c, 'rgba(60,40,20,.35)', 1, x - 4, TG - 165, x - 4, TG - 151); ln(c, 'rgba(60,40,20,.35)', 1, x + 4, TG - 165, x + 4, TG - 151);
        glow(c, x, TG - 158, 44, '255,226,150', 0.22);
        ln(c, '#2E2E36', 2, x - 3, TG - 104, x - 18, TG - 104); ln(c, '#2E2E36', 1, x - 16, TG - 104, x - 16, TG - 99); c.fillStyle = '#6A4A32'; c.beginPath(); c.arc(x - 16, TG - 97, 6, 0, Math.PI); c.fill(); leafBlob(c, x - 16, TG - 101, 5, seed + 9, '#4C8A44', '#6FB063', '#3A6E36'); dot(c, '#F29AC0', x - 19, TG - 103, 1.8); dot(c, '#FFD84D', x - 14, TG - 104, 1.8); dot(c, '#FFFFFF', x - 16, TG - 106, 1.6);
        break;
      case 'bench':
        for (let i = 1; i < 5; i++) ln(c, 'rgba(0,0,0,.25)', 1, x - 36 + i * 14.4, TG - 24, x - 36 + i * 14.4, TG - 17);
        ln(c, 'rgba(255,255,255,.18)', 1, x - 36, TG - 24, x + 36, TG - 24); ln(c, 'rgba(0,0,0,.3)', 1.2, x - 36, TG - 36, x + 36, TG - 36);
        c.fillStyle = '#7B5A3E'; c.fillRect(x - 36, TG - 33, 72, 4); c.fillStyle = '#4A3624'; c.fillRect(x - 38, TG - 34, 5, 14); c.fillRect(x + 33, TG - 34, 5, 14);
        c.fillStyle = '#2E2E36'; c.fillRect(x - 40, TG - 21, 4, 3); c.fillRect(x + 36, TG - 21, 4, 3); for (let i = 0; i < 4; i++) dot(c, 'rgba(20,12,6,.6)', x - 30 + i * 20, TG - 20.5, 1);
        tEll(c, 'rgba(0,0,0,.2)', x, TG + 2, 40, 4); c.fillStyle = '#C9772E'; c.beginPath(); c.ellipse(x + 14, TG - 26, 3.4, 1.8, 0.4, 0, TAU); c.fill();
        break;
      case 'fountain':
        c.save(); c.beginPath(); c.rect(x - 100, TG - 36, 200, 36); c.clip(); for (let i = 0; i < 9; i++) ln(c, 'rgba(60,50,35,.25)', 1, x - 100 + i * 24, TG - 36, x - 100 + i * 24, TG - 12); ln(c, 'rgba(60,50,35,.25)', 1, x - 100, TG - 24, x + 100, TG - 24); c.restore();
        c.fillStyle = 'rgba(90,120,70,.35)'; for (let i = 0; i < 20; i++) c.fillRect(x - 98 + hash(seed + i) * 196, TG - 8 - hash(i) * 4, 4 + hash(i + 3) * 6, 3);
        ln(c, 'rgba(255,255,255,.45)', 1.2, x - 80, TG - 36, x + 80, TG - 36);
        for (let k = 0; k < 3; k++){ c.strokeStyle = 'rgba(255,255,255,' + (0.4 - k * 0.1) + ')'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x + (k - 1) * 30, TG - 36, 14 + k * 8, 3 + k, 0, 0, TAU); c.stroke(); }
        c.strokeStyle = 'rgba(200,235,255,.8)'; c.lineWidth = 1.6; for (let i = -3; i <= 3; i++){ c.beginPath(); c.moveTo(x, TG - 132); c.quadraticCurveTo(x + i * 14, TG - 150 - Math.abs(i) * -3, x + i * 22, TG - 112); c.stroke(); dot(c, 'rgba(220,245,255,.9)', x + i * 22, TG - 112, 1.8); }
        for (let i = 0; i < 6; i++) dot(c, '#E8C24A', x - 60 + hash(seed + i) * 120, TG - 34 + hash(i) * 2, 1.6);
        ln(c, 'rgba(255,255,255,.3)', 1.4, x - 8, TG - 98, x - 8, TG - 40); for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.18)', 1.2, x - 10, TG - 90 + i * 14, x + 10, TG - 90 + i * 14);
        c.fillStyle = '#B9B3A8'; c.beginPath(); c.arc(x - 6, TG - 126, 2, 0, TAU); c.arc(x + 6, TG - 126, 2, 0, TAU); c.fill();
        break;
      case 'stall':
        for (let i = 0; i < 6; i++){ const sx = x - 44 + i * 18; ln(c, '#6B5A3A', 1, sx, TG - 128, sx, TG - 118); dot(c, ['#D5352B', '#F2C230', '#7AB87A'][i % 3], sx, TG - 114, 4); }
        [[-40, '#E85D3C'], [-24, '#F2C230'], [-6, '#6BBB45'], [14, '#F29AC0'], [34, '#E85D3C']].forEach(function(f, i){ for (let k = 0; k < 3; k++) dot(c, f[1], x + f[0] - 6 + k * 6, TG - 63 + (k % 2) * -3, 5); ln(c, 'rgba(255,255,255,.4)', 1, x + f[0] - 8, TG - 66, x + f[0] - 5, TG - 68); c.fillStyle = '#F4F1E8'; c.fillRect(x + f[0] - 6, TG - 46, 12, 7); ln(c, 'rgba(0,0,0,.5)', 1, x + f[0] - 4, TG - 42, x + f[0] + 4, TG - 42); });
        for (let i = 0; i < 6; i++) ln(c, 'rgba(0,0,0,.2)', 1, x - 54, TG - 36 + i * 6, x + 54, TG - 36 + i * 6);
        c.fillStyle = '#C9A24A'; c.fillRect(x + 36, TG - 52, 14, 4); ln(c, '#6A5A3A', 1, x + 43, TG - 52, x + 43, TG - 60); c.beginPath(); c.arc(x + 43, TG - 60, 3, 0, TAU); c.stroke();
        c.fillStyle = '#8A6642'; c.fillRect(x - 54, TG - 14, 24, 14); ln(c, '#5E4430', 1, x - 54, TG - 7, x - 30, TG - 7); c.fillStyle = '#B79C6A'; c.beginPath(); c.roundRect(x + 24, TG - 18, 24, 18, 5); c.fill(); ln(c, 'rgba(70,50,20,.5)', 1, x + 28, TG - 12, x + 44, TG - 12);
        break;
      case 'crates':
        for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.25)', 1.2, x - 26, TG - 36 + i * 9, x + 26, TG - 36 + i * 9); for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.25)', 1.2, x - 14, TG - 72 + i * 9, x + 26, TG - 72 + i * 9);
        [[x - 22, TG - 40], [x + 20, TG - 40], [x - 22, TG - 6], [x + 20, TG - 6], [x - 10, TG - 76], [x + 22, TG - 76], [x - 10, TG - 48], [x + 22, TG - 48]].forEach(function(n){ dot(c, 'rgba(30,20,10,.6)', n[0], n[1], 1.2); });
        c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x - 6, TG - 30, 14, 9); ln(c, 'rgba(0,0,0,.5)', 1, x - 4, TG - 26, x + 6, TG - 26); ln(c, 'rgba(0,0,0,.5)', 1, x - 4, TG - 23, x + 3, TG - 23);
        ln(c, '#D9C26A', 1.4, x - 16, TG - 80, x - 18, TG - 86); ln(c, '#D9C26A', 1.4, x + 4, TG - 80, x + 6, TG - 87);
        break;
      case 'barrel':
        c.save(); c.beginPath(); c.roundRect(x - 18, TG - 46, 36, 46, 10); c.clip(); for (let i = 1; i < 6; i++) ln(c, 'rgba(0,0,0,.25)', 1, x - 18 + i * 6, TG - 46, x - 18 + i * 6, TG);
        const bg = c.createLinearGradient(x - 18, 0, x + 18, 0); bg.addColorStop(0, 'rgba(255,255,255,.2)'); bg.addColorStop(0.5, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = bg; c.fillRect(x - 18, TG - 46, 36, 46); c.restore();
        c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - 18, TG - 36, 36, 1); c.fillRect(x - 18, TG - 14, 36, 1); for (let i = 0; i < 3; i++){ dot(c, '#2E2A26', x - 12 + i * 12, TG - 34, 1); dot(c, '#2E2A26', x - 12 + i * 12, TG - 12, 1); }
        dot(c, '#3A2A1E', x + 4, TG - 24, 2.4); ln(c, 'rgba(80,40,10,.4)', 1.4, x + 4, TG - 22, x + 4, TG - 10);
        break;
      case 'pond':
        for (let i = 0; i < 6; i++){ c.strokeStyle = 'rgba(255,255,255,' + (0.3 - i * 0.03) + ')'; c.lineWidth = 1; c.beginPath(); c.ellipse(x + 60 - i * 22, TG + 22 + (i % 2) * 6, 16 + i * 5, 2.6 + i * 0.6, 0, 0, TAU); c.stroke(); }
        [[-90, 22], [20, 28], [95, 18]].forEach(function(l){ for (let k = 0; k < 6; k++){ const a = k * TAU / 6; ln(c, 'rgba(30,80,30,.4)', 1, x + l[0], TG + l[1], x + l[0] + Math.cos(a) * 14, TG + l[1] + Math.sin(a) * 4); } });
        for (let i = 0; i < 9; i++){ const rx = x - 180 + i * 46 + hash(seed + i) * 20, ry = TG + 28 - Math.abs(Math.sin(i * 0.9)) * 4; ln(c, '#4C7A3A', 1.6, rx, ry, rx + 1, ry - 20 - (i % 3) * 6); c.fillStyle = '#6A4A32'; c.beginPath(); c.roundRect(rx - 1.6, ry - 28 - (i % 3) * 6, 3.4, 9, 1.6); c.fill(); }
        for (let i = 0; i < 14; i++){ c.fillStyle = i % 2 ? '#8A8A92' : '#6E6E78'; c.beginPath(); c.ellipse(x - 188 + i * 28 + hash(i) * 6, TG + 42 - Math.abs(Math.sin(i * 0.45)) * 8, 7 + hash(i + 2) * 4, 3.4, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#6BBB45'; c.beginPath(); c.ellipse(x - 91, TG + 17, 5, 3.4, 0, 0, TAU); c.fill(); dot(c, '#1A1A1A', x - 93, TG + 15.4, 0.9); dot(c, '#1A1A1A', x - 89, TG + 15.4, 0.9);
        break;
      case 'pier':
        for (let xx = x - 160; xx < x + 180; xx += 12){ ln(c, 'rgba(0,0,0,.3)', 1, xx, TG - 12, xx, TG - 2); dot(c, 'rgba(20,12,6,.6)', xx + 6, TG - 9, 0.9); }
        for (let i = 0; i < 6; i++){ const px = x - 150 + i * 60; c.fillStyle = 'rgba(70,90,50,.4)'; c.fillRect(px - 1, TG + 20, 10, 8); c.fillStyle = '#E8E4D6'; for (let k = 0; k < 4; k++) dot(c, '#E8E4D6', px + 2 + (k % 2) * 4, TG + 36 + k * 6, 1.4); }
        [x - 150, x + 170].forEach(function(px){ c.fillStyle = '#4A3624'; c.fillRect(px - 5, TG - 34, 10, 24); c.fillStyle = '#6A4A32'; c.beginPath(); c.arc(px, TG - 34, 5, Math.PI, TAU); c.fill(); rope(c, px, TG - 22, 8); });
        break;
      case 'boat':
        for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.22)', 1, x - 106 + i * 6, TG - 62 + i * 8, x + 106 - i * 6, TG - 62 + i * 8);
        c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(x - 112, TG - 52); c.lineTo(x + 112, TG - 52); c.lineTo(x + 108, TG - 46); c.lineTo(x - 108, TG - 46); c.closePath(); c.fill();
        for (let i = 0; i < 6; i++){ dot(c, '#F4F1E8', x - 70 + i * 30, TG - 56, 4); dot(c, '#4A8FBF', x - 70 + i * 30, TG - 56, 2.6); }
        for (let i = 0; i < 12; i++) ln(c, '#F4F1E8', 1, x - 118 + i * 21.4, TG - 70, x - 118 + i * 21.4, TG - 84); ln(c, '#F4F1E8', 1.4, x - 118, TG - 84, x + 118, TG - 84);
        ln(c, 'rgba(40,30,20,.7)', 1, x, TG - 280, x - 118, TG - 70); ln(c, 'rgba(40,30,20,.7)', 1, x, TG - 280, x + 118, TG - 70); ln(c, 'rgba(40,30,20,.7)', 1, x, TG - 200, x + 60, TG - 70);
        c.fillStyle = '#E8C24A'; c.beginPath(); c.moveTo(x + 3, TG - 280); c.lineTo(x + 28, TG - 274); c.lineTo(x + 3, TG - 268); c.fill();
        c.strokeStyle = '#3A3A44'; c.lineWidth = 2; c.beginPath(); c.arc(x + 90, TG - 44, 6, 0, TAU); c.moveTo(x + 90, TG - 50); c.lineTo(x + 90, TG - 36); c.moveTo(x + 84, TG - 44); c.lineTo(x + 96, TG - 44); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(x - 40, TG - 66, 8, 0, TAU); c.stroke(); c.strokeStyle = '#D5352B'; c.lineWidth = 1.4; c.setLineDash([4, 4]); c.beginPath(); c.arc(x - 40, TG - 66, 8, 0, TAU); c.stroke(); c.setLineDash([]);
        for (let i = 0; i < 4; i++){ ln(c, 'rgba(255,255,255,.35)', 1.4, x - 100 + i * 50, TG - 28, x - 90 + i * 50, TG - 24); }
        break;
      case 'crane':
        for (let i = 0; i < 10; i++){ ln(c, '#A87A22', 1.6, x - 6, TG - 320 + i * 32, x + 6, TG - 288 + i * 32); ln(c, '#A87A22', 1.6, x + 6, TG - 320 + i * 32, x - 6, TG - 288 + i * 32); }
        for (let i = 0; i < 7; i++){ ln(c, '#A87A22', 1.4, x + 6 + i * 22, TG - 330, x + 17 + i * 22, TG - 320); ln(c, '#A87A22', 1.4, x + 17 + i * 22, TG - 320, x + 28 + i * 22, TG - 330); }
        c.fillStyle = '#E8E4D6'; c.fillRect(x + 8, TG - 346, 22, 16); c.fillStyle = '#7ACBEA'; c.fillRect(x + 12, TG - 343, 14, 8); c.fillStyle = '#4A4A52'; for (let i = 0; i < 3; i++) c.fillRect(x + 44 + i * 6, TG - 322 + 24, 5, 10);
        dot(c, '#FF4D4D', x, TG - 336, 3); glow(c, x, TG - 336, 18, '255,60,60', 0.4);
        c.fillStyle = '#E3B93C'; c.fillRect(x + 128, TG - 160, 18, 5); ln(c, '#444', 1.6, x + 137, TG - 155, x + 131, TG - 138); ln(c, '#444', 1.6, x + 137, TG - 155, x + 143, TG - 138);
        c.fillStyle = 'rgba(150,70,20,.25)'; for (let i = 0; i < 6; i++) c.fillRect(x - 4 + (i % 2) * 6, TG - 300 + i * 46, 2, 18);
        break;
      case 'antenna':
        for (let i = 0; i < 4; i++){ ln(c, 'rgba(60,60,70,.7)', 1, x, TG - 240 * s + i * 10, x + (i % 2 ? 1 : -1) * 90, TG); }
        for (let i = 1; i <= 5; i++){ dot(c, '#2E2E36', x - (36 - i * 4) * s, TG - 50 * i * s + 2, 2); dot(c, '#2E2E36', x + (36 - i * 4) * s, TG - 50 * i * s + 2, 2); }
        glow(c, x, TG - 262 * s, 24, '255,60,60', 0.5); c.fillStyle = '#2E2E36'; c.fillRect(x - 10, TG - 6, 20, 6); ln(c, 'rgba(255,255,255,.3)', 1, x - 1.5, TG - 250 * s, x - 1.5, TG);
        c.fillStyle = '#9AA0AA'; c.fillRect(x - 7, TG - 190 * s, 14, 8); dot(c, '#6BFF8D', x + 3, TG - 186 * s, 1.4);
        break;
      case 'tank':
        for (let i = 0; i < 4; i++){ ln(c, '#4A4F58', 1.6, x - 42 + i * 28, TG - 44, x - 14 + i * 28, TG - 2); }
        for (let i = 0; i < 7; i++) ln(c, 'rgba(0,0,0,.25)', 1, x - 50 + i * 16.6, TG - 128, x - 50 + i * 16.6, TG - 46);
        for (let i = 0; i < 6; i++){ dot(c, '#4A5568', x - 46 + i * 18, TG - 108, 1.3); dot(c, '#4A5568', x - 46 + i * 18, TG - 68, 1.3); }
        c.fillStyle = 'rgba(150,70,20,.25)'; for (let i = 0; i < 5; i++) c.fillRect(x - 44 + i * 22, TG - 90, 3, 28);
        const tg = c.createLinearGradient(x - 50, 0, x + 50, 0); tg.addColorStop(0, 'rgba(255,255,255,.2)'); tg.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = tg; c.beginPath(); c.roundRect(x - 50, TG - 130, 100, 86, 14); c.fill();
        ln(c, '#4A4F58', 2, x + 38, TG - 44, x + 38, TG - 8); c.fillStyle = '#4A4F58'; c.fillRect(x + 34, TG - 10, 16, 4); for (let i = 0; i < 8; i++) ln(c, '#4A4F58', 1, x - 56, TG - 120 + i * 11, x - 46, TG - 120 + i * 11);
        ln(c, '#4A4F58', 1.4, x, TG - 160, x, TG - 172); dot(c, '#D5352B', x, TG - 174, 2.4);
        break;
      case 'chimney':
        bricks(c, x - 24, TG - 150, 48, 150, 8, 14, seed);
        c.fillStyle = '#5A3A2E'; c.fillRect(x - 12, TG - 176, 9, 16); c.fillRect(x + 4, TG - 172, 9, 12); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 12, TG - 176, 9, 3); c.fillRect(x + 4, TG - 172, 9, 3);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x - 30, TG - 158, 60, 2); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x - 30, TG - 160, 60, 1.5);
        for (let i = 0; i < 4; i++) glow(c, x - 8 + i * 6, TG - 190 - i * 22, 12 + i * 5, '220,220,225', 0.4 - i * 0.07);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 24, TG - 150, 48, 10);
        break;
      case 'vent':
        c.save(); c.beginPath(); c.rect(x - 28, TG - 60, 56, 60); c.clip(); for (let i = 0; i < 7; i++) ln(c, 'rgba(0,0,0,.18)', 1.2, x - 28, TG - 56 + i * 8, x + 28, TG - 56 + i * 8); c.restore();
        for (let i = 0; i < 4; i++) dot(c, '#5A6068', i % 2 ? x + 30 : x - 30, i < 2 ? TG - 66 : TG - 8, 1.6);
        c.fillStyle = '#9AA0AA'; c.fillRect(x + 34, TG - 38, 18, 8); c.fillRect(x + 48, TG - 38, 8, 38); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 34, TG - 38, 18, 1.5);
        c.fillStyle = 'rgba(150,70,20,.25)'; c.fillRect(x - 20, TG - 20, 3, 18); c.fillRect(x + 8, TG - 30, 3, 26);
        break;
      case 'dish':
        ln(c, '#6A6F78', 1.4, x - 30, TG - 160, x + 26, TG - 120); for (let i = 0; i < 7; i++){ const a = -0.5 + i * 0.12 - 0.3; ln(c, 'rgba(0,0,0,.14)', 1, x, TG - 140, x + Math.cos(a - 0.5) * 70, TG - 140 + Math.sin(a - 0.5) * 30); }
        ln(c, '#6A6F78', 2, x + 4, TG - 142, x + 28, TG - 176); dot(c, '#D5352B', x + 29, TG - 178, 3);
        c.fillStyle = '#6A6F78'; c.fillRect(x - 12, TG - 14, 24, 14); dot(c, '#6BFF8D', x - 4, TG - 8, 1.6); dot(c, '#FFB84D', x + 2, TG - 8, 1.6); ln(c, '#2E2E36', 1.4, x + 12, TG - 8, x + 34, TG - 2);
        break;
      case 'rocket':
        for (let i = 0; i < 6; i++) ln(c, 'rgba(0,0,0,.14)', 1, x - 38, TG - 250 + i * 40, x + 38, TG - 250 + i * 40);
        ln(c, 'rgba(0,0,0,.14)', 1, x, TG - 270, x, TG); for (let i = 0; i < 18; i++){ dot(c, 'rgba(90,100,120,.5)', x - 34, TG - 262 + i * 14, 1); dot(c, 'rgba(90,100,120,.5)', x + 34, TG - 262 + i * 14, 1); }
        dot(c, '#2F4A8A', x, TG - 110, 15); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, TG - 110, 13, 0, TAU); c.stroke(); c.fillStyle = '#FFFFFF'; c.font = 'bold 11px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('GR', x, TG - 106);
        c.strokeStyle = '#5BA2CE'; c.lineWidth = 2.6; c.beginPath(); c.arc(x, TG - 200, 17, 0, TAU); c.stroke(); for (let i = 0; i < 8; i++){ const a = i * TAU / 8; dot(c, '#E8EAF0', x + Math.cos(a) * 17, TG - 200 + Math.sin(a) * 17, 1.2); }
        c.fillStyle = '#3A3A44'; c.beginPath(); c.moveTo(x - 30, TG); c.lineTo(x - 24, TG - 12); c.lineTo(x + 24, TG - 12); c.lineTo(x + 30, TG); c.closePath(); c.fill(); ln(c, 'rgba(255,255,255,.2)', 1, x - 24, TG - 12, x + 24, TG - 12);
        c.fillStyle = 'rgba(200,230,255,.3)'; for (let i = 0; i < 5; i++) c.fillRect(x - 30 + i * 14, TG - 60 - (i % 2) * 20, 3, 26);
        break;
      case 'tower':
        for (let i = 0; i < 6; i++){ ln(c, '#7A839A', 1.4, x - 20, TG - 290 + i * 48 + 5, x + 20, TG - 242 + i * 48); }
        for (let i = 0; i < 8; i++) ln(c, '#7A839A', 1.2, x - 26 + (i % 2) * 52, TG - 288 + i * 36, x - 26 + (i % 2) * 52, TG - 262 + i * 36);
        dot(c, '#FF4D4D', x, TG - 310, 3); glow(c, x, TG - 310, 20, '255,60,60', 0.45);
        for (let i = 0; i < 3; i++){ c.strokeStyle = '#4A4F58'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 26, TG - 240 + i * 20); c.quadraticCurveTo(x + 50, TG - 220 + i * 20, x + 66, TG - 240 + i * 20); c.stroke(); }
        c.fillStyle = '#5A6578'; c.fillRect(x + 26, TG - 252, 44, 6);
        break;
      case 'mush':
        for (let i = 0; i < 3; i++){ const mx = x + (i - 1) * 40, mh = 40 + i % 2 * 28, cr = 22 + (i === 1 ? 14 : 0);
          glow(c, mx, TG - mh, cr * 2, '110,240,170', 0.2);
          for (let k = 0; k < 4; k++) dot(c, 'rgba(255,255,255,.55)', mx - cr * 0.5 + k * cr * 0.33, TG - mh - cr * 0.3 + (k % 2) * 4, 2 + (k % 2));
          c.strokeStyle = 'rgba(40,120,80,.35)'; c.lineWidth = 1; for (let k = -3; k <= 3; k++){ c.beginPath(); c.moveTo(mx, TG - mh + 1); c.lineTo(mx + k * cr / 3.4, TG - mh + 3 + cr * 0.15); c.stroke(); }
          c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(mx + 1, TG - mh, 4, mh); ln(c, 'rgba(255,255,255,.4)', 1, mx - 2, TG - mh + 4, mx - 2, TG - 4); }
        for (let i = 0; i < 5; i++){ const mx = x - 70 + i * 34 + hash(i) * 8; c.fillStyle = '#CFC3A0'; c.fillRect(mx - 1, TG - 8, 2, 8); tEll(c, '#6EE0A0', mx, TG - 8, 6, 4); }
        c.fillStyle = 'rgba(60,110,60,.45)'; for (let i = 0; i < 14; i++) c.fillRect(x - 70 + i * 10, TG - 2, 5, 2);
        break;
      case 'stal':
        ln(c, 'rgba(255,255,255,.14)', 1.4, x - 6, TG - 20, x - 2, TG - 70 - 30 * s); for (let i = 0; i < 4; i++) ln(c, 'rgba(0,0,0,.18)', 1, x - 20 + i * 4, TG - 10 - i * 14, x + 20 - i * 6, TG - 14 - i * 14);
        dot(c, 'rgba(150,210,255,.8)', x + 4, TG - 90 * s + 4, 1.6); dot(c, 'rgba(150,210,255,.6)', x - 3, TG - 10, 1.4);
        c.fillStyle = 'rgba(110,200,255,.35)'; c.beginPath(); c.ellipse(x, TG + 3, 16, 3, 0, 0, TAU); c.fill();
        ln(c, 'rgba(160,230,255,.5)', 1, x + 4, 88, x + 4, 94); dot(c, 'rgba(180,240,255,.8)', x + 4, 96, 1.4);
        break;
    }
    c.restore();
  };

  /* ---------- the ground ---------- */
  let fieldD = null, groundDone = true;
  function groundOnce(c, D){ if (groundDone || fieldD !== D) return; groundDone = true; paintGround(c, D); }
  function paintGround(c, D){
    const W = D.w, r = miniRng(D.w * 5 + D.id.length), th = D.theme;
    if (th === 'park'){
      for (let i = 0; i < Math.round(W / 90); i++){ c.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,40,0,.04)'; c.fillRect(i * 90, TG + 38, 90, 62); }                    /* mowing stripes */
      for (let i = 0; i < Math.round(W / 4); i++){ const px = r() * W, py = TG + 4 + r() * 32; c.fillStyle = ['rgba(120,100,70,.55)', 'rgba(170,155,120,.6)', 'rgba(90,80,55,.5)'][i % 3]; c.beginPath(); c.ellipse(px, py, 1 + r() * 2.2, 0.8 + r() * 1.2, 0, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(80,60,30,.1)'; c.fillRect(0, TG + 12, W, 2); c.fillRect(0, TG + 26, W, 2);
      for (let x = 0; x < W; x += 15 + r() * 8){ const w = 9 + r() * 7; c.fillStyle = r() < 0.5 ? '#8E8A80' : '#A09C90'; c.beginPath(); c.roundRect(x, TG + 36, w, 6, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 1, TG + 36.5, w - 2, 1.3); }
      for (let i = 0; i < Math.round(W / 6); i++){ const gx = r() * W, gy = TG + 46 + r() * 52, l = 4 + r() * 7, col = ['#4C8A44', '#3E7A3A', '#5E9E55', '#7BBE6A'][i % 4]; c.strokeStyle = col; c.lineWidth = 1.1; for (let k = -1; k <= 1; k++){ c.beginPath(); c.moveTo(gx + k * 1.6, gy); c.lineTo(gx + k * 3.4, gy - l); c.stroke(); } }
      for (let i = 0; i < Math.round(W / 14); i++){ const fx = r() * W, fy = TG + 48 + r() * 48; ln(c, '#3E7A3A', 1, fx, fy, fx, fy - 6); dot(c, ['#FFFFFF', '#FFD84D', '#F29AC0', '#B58AE8'][i % 4], fx, fy - 7, 1.7); }
      for (let i = 0; i < 9; i++){ const cx = r() * W, cy = TG + 56 + r() * 36; for (let k = 0; k < 3; k++){ c.fillStyle = 'rgba(30,90,30,.3)'; c.beginPath(); c.arc(cx + k * 4 - 4, cy + (k % 2) * 3, 2.6, 0, TAU); c.fill(); } }
      return;
    }
    if (th === 'harbour'){
      for (let x = 0, i = 0; x < W; x += 34, i++){ const v = hash(i * 2.7); c.fillStyle = v < 0.35 ? 'rgba(255,230,190,.07)' : v < 0.7 ? 'rgba(0,0,0,.07)' : 'rgba(40,25,10,.12)'; c.fillRect(x + 1, TG, 33, 100);
        for (let k = 0; k < 3; k++) ln(c, 'rgba(50,30,10,.16)', 0.9, x + 6 + k * 9, TG + 2, x + 7 + k * 9 + (r() - 0.5) * 3, TG + 98);
        dot(c, 'rgba(20,12,6,.6)', x + 5, TG + 10, 1.1); dot(c, 'rgba(20,12,6,.6)', x + 28, TG + 10, 1.1); dot(c, 'rgba(20,12,6,.6)', x + 5, TG + 70, 1.1); dot(c, 'rgba(20,12,6,.6)', x + 28, TG + 70, 1.1);
        if (v > 0.8){ c.fillStyle = 'rgba(40,25,10,.3)'; c.beginPath(); c.ellipse(x + 14, TG + 20 + v * 30, 2.6, 1.6, 0, 0, TAU); c.fill(); } }
      for (let i = 0; i < 16; i++){ c.fillStyle = 'rgba(20,40,60,.14)'; c.beginPath(); c.ellipse(r() * W, TG + 20 + r() * 70, 14 + r() * 24, 3 + r() * 3, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 4; i++) rope(c, 120 + i * W / 4 + r() * 60, TG + 30 + r() * 20, 14);
      for (let i = 0; i < 4; i++){ const bx = 200 + i * (W - 300) / 3 + r() * 40; c.fillStyle = '#2E2E36'; c.beginPath(); c.roundRect(bx - 6, TG + 4, 12, 22, 3); c.fill(); c.fillStyle = '#3A3A44'; c.beginPath(); c.ellipse(bx, TG + 4, 9, 3, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(bx - 4, TG + 6, 2, 16); tEll(c, 'rgba(0,0,0,.25)', bx + 4, TG + 28, 12, 3); }
      for (let i = 0; i < 6; i++){ const fx = r() * W, fy = TG + 60 + r() * 30; c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + 10, fy); for (let k = 0; k < 3; k++){ c.moveTo(fx + 3 + k * 2.4, fy); c.lineTo(fx + 4 + k * 2.4, fy - 2.5); c.moveTo(fx + 3 + k * 2.4, fy); c.lineTo(fx + 4 + k * 2.4, fy + 2.5); } c.stroke(); }
      return;
    }
    if (th === 'burrows'){
      for (let row = 0; row < 5; row++) for (let x = -(row % 2) * 16; x < W; x += 32){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 16 + (r() - 0.5) * 4, TG + 8 + row * 20, 14, 7.5, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + 6, TG + 4 + row * 20, 12, 1.2); }
      for (let i = 0; i < Math.round(W / 24); i++){ c.fillStyle = ['#7A6A5E', '#5A4A40', '#8A7A6E'][i % 3]; c.beginPath(); c.ellipse(r() * W, TG + 4 + r() * 94, 1.5 + r() * 2.6, 1 + r() * 1.6, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 18; i++){ const cx = r() * W, cy = TG + 4 + r() * 20, col = ['#7AD8FF', '#F29AC0', '#9BFF7A'][i % 3]; glow(c, cx, cy - 4, 16, i % 3 === 0 ? '122,216,255' : i % 3 === 1 ? '242,154,192' : '155,255,122', 0.3); c.fillStyle = col; c.beginPath(); c.moveTo(cx - 3, cy); c.lineTo(cx, cy - 9 - r() * 5); c.lineTo(cx + 3, cy); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(cx - 0.6, cy - 7, 1.2, 5); }
      for (let i = 0; i < 6; i++){ const px = r() * W, py = TG + 46 + r() * 40; c.fillStyle = 'rgba(70,110,150,.3)'; c.beginPath(); c.ellipse(px, py, 18 + r() * 14, 3.4, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(180,220,255,.3)'; c.fillRect(px - 8, py - 1, 14, 1); }
      return;
    }
    /* the paved streets: Town Square, Market Street, the Rooftops, the Launchpad */
    const roofs = th === 'roofs', yMax = roofs ? TG + 62 : TG + 98;
    for (let row = 0; row < 2; row++){ const y = TG + row * 19; for (let xx = -(row ? 32 : 0); xx < W; xx += 64){ const v = r(); c.fillStyle = v < 0.3 ? 'rgba(255,255,255,.06)' : v < 0.55 ? 'rgba(0,0,0,.05)' : 'rgba(0,0,0,0)'; c.fillRect(xx + 1, y + 1, 62, 17); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(xx, y, 1.2, 19); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(xx + 1.2, y + 1, 62, 1); }
      c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(0, y + 18, W, 1); }
    for (let i = 0; i < Math.round(W / 22); i++){ const wx = Math.round(r() * W / 64) * 64 + (r() < 0.5 ? 0 : 32), wy = TG + (r() < 0.5 ? 19 : 38); c.strokeStyle = r() < 0.5 ? '#6E9A58' : '#8AB06A'; c.lineWidth = 1; for (let k = -1; k <= 1; k++){ c.beginPath(); c.moveTo(wx + k * 1.6, wy); c.lineTo(wx + k * 2.4, wy - 3 - r() * 3); c.stroke(); } }
    c.strokeStyle = 'rgba(40,30,20,.22)'; c.lineWidth = 1;
    for (let i = 0; i < Math.round(W / 300); i++){ let cx = r() * W, cy = TG + 3 + r() * 30; c.beginPath(); c.moveTo(cx, cy); for (let k = 0; k < 4; k++){ cx += 5 + r() * 8; cy += (r() - 0.4) * 6; c.lineTo(cx, cy); } c.stroke(); }
    for (let i = 0; i < 12; i++){ dot(c, ['rgba(220,120,160,.5)', 'rgba(255,255,255,.45)', 'rgba(90,70,50,.4)'][i % 3], r() * W, TG + 4 + r() * 32, 1.3); }
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(0, TG + 37, W, 2.4); c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(0, TG + 39.4, W, 3);
    for (let x = 0; x < W; x += 40) ln(c, 'rgba(0,0,0,.2)', 1, x, TG + 37, x, TG + 40);
    for (let i = 0; i < Math.round(W * (yMax - TG - 44) / 60); i++){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.14)'; const s = 1 + r() * 1.4; c.fillRect(r() * W, TG + 44 + r() * (yMax - TG - 46), s, s); }
    for (let i = 0; i < 7; i++){ c.fillStyle = 'rgba(0,0,0,.06)'; c.beginPath(); c.ellipse(r() * W, TG + 46 + r() * (yMax - TG - 50), 40 + r() * 60, 2.6, 0, 0, TAU); c.fill(); }
    if (!roofs){
      for (let i = 0; i < 2; i++){ const mx = W * (0.25 + i * 0.5) + (r() - 0.5) * 100, my = TG + 72; c.fillStyle = '#2E2E36'; c.beginPath(); c.ellipse(mx, my, 18, 5, 0, 0, TAU); c.fill(); c.fillStyle = '#4A4A54'; c.beginPath(); c.ellipse(mx, my - 0.8, 16, 4, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; for (let k = -3; k <= 3; k++){ c.beginPath(); c.moveTo(mx + k * 4.4, my - 3.4); c.lineTo(mx + k * 4.4, my + 2); c.stroke(); } c.beginPath(); c.ellipse(mx, my - 0.8, 10, 2.6, 0, 0, TAU); c.stroke(); }
      for (let i = 0; i < Math.round(W / 520); i++){ const gx = 300 + i * 520 + r() * 100; c.fillStyle = '#1F1F26'; c.fillRect(gx, TG + 41, 28, 4); c.fillStyle = '#5A5A66'; for (let k = 0; k < 6; k++) c.fillRect(gx + 2 + k * 4.4, TG + 41, 1.6, 4); }
      if (th === 'square' || th === 'market'){ const zx = W * (th === 'square' ? 0.12 : 0.88); for (let k = 0; k < 8; k++){ c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(zx + k * 14, TG + 46, 8, 50); } }
      for (let i = 0; i < 4; i++){ c.fillStyle = 'rgba(120,160,200,.2)'; c.beginPath(); c.ellipse(r() * W, TG + 52 + r() * 36, 26 + r() * 20, 4, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 16; i++){ c.fillStyle = ['#C9772E', '#B5502A', '#D9A02E', '#7A8A3A'][i % 4]; c.beginPath(); c.ellipse(r() * W, TG + 44 + r() * 50, 3.4, 1.8, r() * TAU, 0, TAU); c.fill(); }
    } else {
      for (let i = 0; i < 6; i++){ c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(r() * W, TG + 46 + r() * 14, 60 + r() * 40, 8); }
    }
  }
  const _tField = townPaintField;
  townPaintField = function(c, D, W, H, R){
    if (D.indoor || !PROP_THEMES[D.theme]) return _tField(c, D, W, H, R);
    fieldD = D; groundDone = false;
    try { _tField(c, D, W, H, R); groundOnce(c, D); } finally { fieldD = null; groundDone = true; }
  };

  /* ---------- the skyline, the houses behind, the backdrops ---------- */
  window.townFarBlockDetail = function(c, D, x, y, w, h){
    const hv = hash(x * 0.13 + w), r = miniRng(Math.round(x * 7 + w));
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x, y, 3, h); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + w - 5, y, 5, h);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x - 1, y - 3, w + 2, 4);
    for (let wy = y + 16; wy < TG - 30; wy += 26) for (let wx = x + 8; wx < x + w - 10; wx += 18){ const v = r(); if (v < 0.16){ c.fillStyle = 'rgba(255,226,150,.42)'; c.fillRect(wx, wy, 8, 12); } else if (v < 0.3){ c.fillStyle = 'rgba(30,45,80,.2)'; c.fillRect(wx, wy, 8, 12); } c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(wx, wy + 12, 8, 1.4); }
    for (let yy = y + 40; yy < TG - 20; yy += 52){ c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(x, yy, w, 1.5); }
    const cx = x + w * (0.2 + hv * 0.5);
    if (hv < 0.25){ c.fillStyle = 'rgba(70,80,100,.5)'; c.fillRect(cx - 9, y - 18, 18, 14); c.beginPath(); c.moveTo(cx - 11, y - 18); c.lineTo(cx, y - 26); c.lineTo(cx + 11, y - 18); c.fill(); for (let k = 0; k < 2; k++) ln(c, 'rgba(70,80,100,.5)', 1.4, cx - 6 + k * 12, y - 4, cx - 6 + k * 12, y); }
    else if (hv < 0.5){ ln(c, 'rgba(70,80,100,.55)', 1.4, cx, y - 3, cx, y - 30); ln(c, 'rgba(70,80,100,.55)', 1.2, cx - 6, y - 24, cx + 6, y - 24); ln(c, 'rgba(70,80,100,.55)', 1.2, cx - 4, y - 18, cx + 4, y - 18); dot(c, 'rgba(255,70,70,.8)', cx, y - 31, 1.6); }
    else if (hv < 0.75){ for (let k = 0; k < 3; k++){ c.fillStyle = 'rgba(80,90,110,.5)'; c.fillRect(x + 6 + k * 14, y - 7, 11, 7); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x + 6 + k * 14, y - 7, 11, 1.2); } }
    else { c.fillStyle = 'rgba(80,90,110,.5)'; c.beginPath(); c.moveTo(cx - 4, y); c.lineTo(cx, y - 24); c.lineTo(cx + 4, y); c.fill(); }
  };
  window.townGantryDetail = function(c, x, y){
    for (let i = 0; i < 6; i++){ ln(c, 'rgba(90,100,130,.7)', 1.4, x - 12, y + 6 + i * 40, x + 26, y + 46 + i * 40); ln(c, 'rgba(90,100,130,.7)', 1.4, x + 26, y + 6 + i * 40, x - 12, y + 46 + i * 40); }
    dot(c, '#FF4D4D', x + 7, y - 4, 3); glow(c, x + 7, y - 4, 22, '255,60,60', 0.45); ln(c, 'rgba(90,100,130,.6)', 1, x + 7, y - 4, x + 7, y - 20);
    for (let i = 0; i < 4; i++) ln(c, 'rgba(60,70,100,.4)', 1, x + 26, y + 40 + i * 50, x + 70, y + 20 + i * 70);
  };
  window.townMidHouseDetail = function(c, D, x, top, w, hh, wall, roof){
    const seed = Math.round(x * 3 + w), hv = hash(seed);
    c.fillStyle = 'rgba(0,0,0,.07)'; for (let yy = top + 5; yy < TG - 12; yy += 6) c.fillRect(x, yy, w, 1);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x, top, 3, hh - 10); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + w - 4, top, 4, hh - 10);
    tiles(c, [x - 6, top, x + w / 2, top - 28, x + w + 6, top], seed);
    if (hv > 0.35){ const cx = x + w * (0.62 + hv * 0.2), ry = top - 28 * (1 - (cx - x - w / 2) / (w / 2 + 6)); c.fillStyle = '#8A4E3A'; c.fillRect(cx - 5, ry - 16, 10, 18); c.fillStyle = '#5A3A2E'; c.fillRect(cx - 7, ry - 19, 14, 4); for (let k = 0; k < 3; k++) ln(c, 'rgba(0,0,0,.25)', 1, cx - 5, ry - 12 + k * 5, cx + 5, ry - 12 + k * 5); glow(c, cx, ry - 30, 12, '225,225,230', 0.35); }
    const door = x + w / 2 - 7;
    for (let wx = x + 10; wx < x + w - 14; wx += 24){
      const wy = top + 16;
      for (let row = 0; row < 2; row++){
        const yy = wy + row * 36; if (row && (yy + 16 > TG - 14 || Math.abs(wx + 6 - (x + w / 2)) < 16)) continue;
        c.fillStyle = 'rgba(255,224,150,' + (hash(wx + row) < 0.25 ? 0.5 : 0.0) + ')'; c.fillRect(wx, yy, 12, 16);
        if (row){ c.fillStyle = 'rgba(80,110,140,.5)'; c.fillRect(wx, yy, 12, 16); }
        c.strokeStyle = 'rgba(60,40,24,.85)'; c.lineWidth = 1.6; c.strokeRect(wx - 0.8, yy - 0.8, 13.6, 17.6); ln(c, 'rgba(60,40,24,.8)', 1, wx + 6, yy, wx + 6, yy + 16); ln(c, 'rgba(60,40,24,.8)', 1, wx, yy + 8, wx + 12, yy + 8);
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(wx - 2, yy + 17, 16, 2.4); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(wx + 1, yy + 1, 3, 14);
        if (hash(wx * 1.7 + row) < 0.4){ const sc = ['#3E6E52', '#2F4A7A', '#7A3B2A'][Math.floor(hash(wx) * 3)]; c.fillStyle = sc; c.fillRect(wx - 5, yy - 1, 4, 18); c.fillRect(wx + 13, yy - 1, 4, 18); }
      }
    }
    c.fillStyle = '#4A3024'; c.beginPath(); c.roundRect(door, TG - 10 - 25, 14, 25, [7, 7, 0, 0]); c.fill(); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(door + 2, TG - 10 - 22, 4, 20); dot(c, '#E9C46A', door + 11, TG - 10 - 12, 1.2); c.fillStyle = '#8C857A'; c.fillRect(door - 3, TG - 14, 20, 4);
    c.fillStyle = 'rgba(40,30,20,.35)'; c.fillRect(x - 1, TG - 14, w + 2, 4); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 1, TG - 14, w + 2, 1);
  };
  const _tFar = townPaintFar;
  townPaintFar = function(c, D, W, H, R){
    _tFar(c, D, W, H, R);
    if (D.indoor) return;
    const r = miniRng(D.w * 9 + 3);
    if (D.theme === 'park'){
      for (let k = 0; k < 2; k++) for (let x = 0; x < W + 20; x += 15 + r() * 14){
        const hy = TG - 100 - k * 50 - Math.sin(x * 0.006 + k * 2) * 50 - Math.sin(x * 0.017 + k) * 16, s = 0.7 + r() * 0.7;
        c.fillStyle = k ? '#6E9E6A' : '#5A9058'; c.beginPath(); c.arc(x, hy - 6 * s, 6 * s, 0, TAU); c.arc(x + 4 * s, hy - 4 * s, 5 * s, 0, TAU); c.arc(x - 4 * s, hy - 4 * s, 5 * s, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.arc(x - 1.6 * s, hy - 8 * s, 2.6 * s, 0, TAU); c.fill(); ln(c, '#5A4632', 1.2, x, hy - 2 * s, x, hy);
      }
      for (let i = 0; i < 5; i++){ const x = 160 + i * W / 5 + r() * 120, hy = TG - 100 - Math.sin(x * 0.006) * 50 - Math.sin(x * 0.017) * 16; c.fillStyle = '#E8D8B8'; c.fillRect(x - 7, hy - 9, 14, 9); tPoly(c, '#A8503A', [x - 9, hy - 9, x, hy - 17, x + 9, hy - 9]); c.fillStyle = 'rgba(80,60,40,.6)'; c.fillRect(x - 1.5, hy - 5, 3, 5); }
      for (let i = 0; i < 24; i++){ const fx = r() * W, fy = TG - 70 + r() * 60; c.fillStyle = 'rgba(0,50,0,.06)'; c.fillRect(fx, fy, 30 + r() * 30, 1.4); }
    } else if (D.theme === 'harbour'){
      for (let i = 0; i < 3; i++){ const cx = 140 + i * W / 3 + r() * 80, base = TG - 40; c.strokeStyle = 'rgba(110,135,155,.8)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx, base); c.lineTo(cx, base - 120); c.moveTo(cx - 40, base - 112); c.lineTo(cx + 70, base - 112); c.stroke(); c.lineWidth = 1; for (let k = 0; k < 5; k++){ c.beginPath(); c.moveTo(cx, base - k * 24); c.lineTo(cx + (k % 2 ? 5 : -5), base - k * 24 - 24); c.stroke(); } ln(c, 'rgba(110,135,155,.8)', 1, cx + 60, base - 112, cx + 60, base - 70); dot(c, 'rgba(255,70,70,.8)', cx, base - 122, 2); }
      for (let i = 0; i < 90; i++){ c.fillStyle = r() < 0.4 ? 'rgba(255,226,150,.45)' : 'rgba(255,255,255,.2)'; c.fillRect(r() * W, TG - 160 + r() * 118, 3, 4); }
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, TG - 42, W, 2);
    } else if (D.theme === 'burrows'){
      for (let i = 0; i < 60; i++){ c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 1; c.beginPath(); const sx = r() * W, sy = 40 + r() * 380; c.moveTo(sx, sy); c.lineTo(sx + 20 + r() * 60, sy + (r() - 0.5) * 8); c.stroke(); }
      for (let i = 0; i < 40; i++) dot(c, ['rgba(122,216,255,.6)', 'rgba(242,154,192,.5)', 'rgba(155,255,122,.5)'][i % 3], r() * W, 60 + r() * 340, 1 + r() * 1.4);
      for (let i = 0; i < 12; i++){ const rx = r() * W; ln(c, 'rgba(70,50,40,.7)', 1.4, rx, 0, rx + (r() - 0.5) * 8, 40 + r() * 70); }
    } else if (D.theme === 'launch'){
      for (let i = 0; i < 40; i++){ c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.beginPath(); const sx = r() * W, sy = TG - 200 + r() * 150; c.moveTo(sx, sy); c.lineTo(sx + 14 + r() * 30, sy - 8 - r() * 10); c.stroke(); }
    }
  };
  const _tMid = townPaintMid;
  townPaintMid = function(c, D, W, H, R){
    _tMid(c, D, W, H, R);
    if (D.indoor) return;
    const r = miniRng(D.w * 13 + D.id.length * 5);
    if (D.theme === 'park' || D.theme === 'square'){
      for (let i = 0; i < Math.round(W / 190); i++){
        const x = i * 190 + r() * 100, s = 0.8 + r() * 0.5, g = D.theme === 'park';
        for (let k = 0; k < 4; k++) ln(c, 'rgba(40,24,12,.4)', 1.2 * s, x - 4 * s + k * 2.6 * s, TG, x - 3 * s + k * 2 * s, TG - 86 * s);
        leafBlob(c, x, TG - 105 * s, 44 * s, i * 7 + 1, g ? '#5C9A58' : '#7BA46A', g ? '#8CCB78' : '#A6CC92', g ? '#3E7A3A' : '#5A8A52');
        leafBlob(c, x - 20 * s, TG - 90 * s, 30 * s, i * 7 + 2, g ? '#6BAE64' : '#8DB87A', g ? '#9AD88A' : '#B2D6A0', g ? '#4A8A44' : '#648E58');
        for (let k = 0; k < 8; k++) dot(c, 'rgba(255,255,230,.3)', x - 20 * s + hash(i * 9 + k) * 50 * s, TG - 120 * s + hash(i * 3 + k) * 30 * s, 1.8 * s);
        c.fillStyle = 'rgba(0,0,0,.1)'; c.beginPath(); c.ellipse(x, TG + 2, 30 * s, 4, 0, 0, TAU); c.fill();
      }
    } else if (D.theme === 'harbour'){
      for (let i = 0; i < 220; i++){ const wx = r() * W, wy = TG - 68 + r() * 64; c.strokeStyle = 'rgba(255,255,255,' + (0.18 + r() * 0.2) + ')'; c.lineWidth = 1; c.beginPath(); c.arc(wx, wy, 3 + r() * 4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      for (let i = 0; i < 40; i++) dot(c, 'rgba(255,255,230,.5)', r() * W, TG - 66 + r() * 20, 1);
      for (let i = 0; i < 6; i++){ const bx = r() * W, by = TG - 50 + r() * 36; c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(bx, by + 6, 8, 2, 0, 0, TAU); c.fill(); dot(c, '#D5352B', bx, by, 4); c.fillStyle = '#F4F1E8'; c.fillRect(bx - 4, by - 1, 8, 2.4); ln(c, '#3A3A44', 1, bx, by - 4, bx, by - 9); }
      const sg = c.createLinearGradient(0, TG - 70, 0, TG); sg.addColorStop(0, 'rgba(255,255,255,.1)'); sg.addColorStop(1, 'rgba(0,30,60,.16)'); c.fillStyle = sg; c.fillRect(0, TG - 70, W, 70);
    } else if (D.theme === 'burrows'){
      for (let i = 0; i < 9; i++){ const x = r() * W, h = 70 + r() * 150; ln(c, 'rgba(0,0,0,.2)', 1.2, x - 8, TG - h * 0.3, x + 8, TG - h * 0.5); ln(c, 'rgba(255,255,255,.1)', 1.2, x - 3, TG - h * 0.9, x - 14, TG - 4); }
    } else if (D.theme === 'roofs'){
      for (let x = 0; x < W; x += 74){ const hv = hash(x * 0.3 + 5); if (hv < 0.5){ c.fillStyle = 'rgba(90,100,120,.5)'; c.fillRect(x + 8, TG - 140 - hv * 40, 12, 14); c.fillRect(x + 28, TG - 134 - hv * 30, 18, 9); } }
    }
  };

  /* what the later districts (farm, isle) use: the small painters, and three tables to fill in by building kind */
  window.TOWN_WALL_TEXTURE = {};                     /* kind -> function(c, x, y, w, h, seed): the material of its main wall */
  window.TOWN_WALL_BOX = {};                         /* kind -> function(b) -> { h }: the wall's height, when it is not the building's */
  window.TOWN_BUILD_EXTRAS = {};                     /* kind -> function(c, D, b, g): the parts added after the building is drawn (g: x0, top, w, h, doors) */
  window.townDetailKit = { hash: hash, bricks: bricks, boards: boards, stucco: stucco, blocks: blocks, tiles: tiles, rope: rope, leafBlob: leafBlob, pot: pot, glow: glow, dot: dot, ln: ln,
    foundation: foundation, drainpipe: drainpipe, stringLights: stringLights, wallShade: wallShade, quoins: quoins };
})();
