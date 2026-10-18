'use strict';
/* Longneck Town: how it looks. */
/* ========================= 44v. TOWN ART ========================= */
/* Three layers per district are painted once into canvases and reused: the far skyline (moves at 25% of the camera), the middle
   distance (55%), and the street itself (100%: ground, buildings, scenery). Everything that moves (water, flags, lights, the people,
   things to find) is drawn each frame on top. The painted layers are in daylight colours; evening and night are a tint drawn over them
   plus a glow where the lights are. World units: the street is 600 high and the ground line is at y 500 (TOWN_GROUND). */
const TG = TOWN_GROUND;
function tRect(c, col, x, y, w, h){ c.fillStyle = col; c.fillRect(x, y, w, h); }
function tRound(c, col, x, y, w, h, r){ c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function tCircle(c, col, x, y, r){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function tEll(c, col, x, y, rx, ry){ c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function tPoly(c, col, pts){ c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); }
/* a window: frame, glass, a highlight. Its box is remembered so it can glow at night. */
function tWin(c, D, x, y, w, h, col){
  tRect(c, '#4A3A2C', x - 2, y - 2, w + 4, h + 4); tRect(c, col || '#9DCBEA', x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.32)'; c.fillRect(x + 2, y + 2, Math.max(2, w * 0.3), h - 4);
  c.fillStyle = 'rgba(60,40,24,.5)'; c.fillRect(x + w / 2 - 0.8, y, 1.6, h);
  if (D && D._win) D._win.push({ x: x, y: y, w: w, h: h });
}
function tDoor(c, x, w, h, col){
  tRound(c, '#3A2A1E', x - w / 2 - 3, TG - h - 3, w + 6, h + 3, 6);
  tRound(c, col || '#7A4B2A', x - w / 2, TG - h, w, h, 5);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - w / 2 + 4, TG - h + 8, w / 2 - 6, h - 14); c.fillRect(x + 2, TG - h + 8, w / 2 - 6, h - 14);
  tCircle(c, '#E9C46A', x + w / 2 - 8, TG - h * 0.45, 2.6);
}
function tSign(c, text, cx, cy, w, fill, ink){
  const h = 28;
  tRound(c, 'rgba(0,0,0,.25)', cx - w / 2 + 2, cy - h / 2 + 3, w, h, 6);
  tRound(c, fill || '#5A3B22', cx - w / 2, cy - h / 2, w, h, 6);
  c.fillStyle = ink || '#FFE9A8'; c.font = 'bold 16px system-ui, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  let s = String(text), mw = w - 14;
  while (c.measureText(s).width > mw && s.length > 3) s = s.slice(0, -2);
  c.fillText(s === text ? s : s + '.', cx, cy + 1); c.textBaseline = 'alphabetic';
}
function tAwning(c, x, y, w, h, c1, c2){
  const n = Math.max(4, Math.round(w / 22)), sw = w / n;
  for (let i = 0; i < n; i++){ c.fillStyle = i % 2 ? c2 : c1; c.beginPath(); c.moveTo(x + i * sw, y); c.lineTo(x + (i + 1) * sw, y); c.lineTo(x + (i + 1) * sw + 2, y + h); c.arc(x + (i + 0.5) * sw + 1, y + h, sw / 2, 0, Math.PI); c.closePath(); c.fill(); }
  tRect(c, 'rgba(0,0,0,.18)', x, y + h + 2, w, 6);
}
function tShade(hex, k){ return wardShade(hex, k); }

/* ---- the giraffe ---- */
/* Side view, feet at (x, gy), facing right (o.flip turns her). Like drawSideGiraffe (44f), but the neck can stretch: o.reach goes from -0.4
   (a short, lowered neck) to 1 (stretched all the way up). o.look is another giraffe's colours (coat, spot, dark, pat, hat, boot, hc, bc); without
   it she is drawn in the player's own colours, hat and boots. Returns where the head is, for picking things up and for props. */
function townGiraffe(ctx, x, gy, o){
  const sc = o.s || 1.5, L = o.look, t = o.t === undefined ? Town.t : o.t, reach = o.reach || 0;
  const cl = L ? { coat: L.coat, spot: L.spot, dark: L.dark || tShade(L.coat, 0.78) } : giraffeColours();
  const pat = L ? (L.pat | 0) : giraffePattern();
  const hat = L ? (L.hat && ACC_BY_ID[L.hat] ? ACC_BY_ID[L.hat] : null) : accEquipped('hat');
  const boot = L ? (L.boot && ACC_BY_ID[L.boot] ? ACC_BY_ID[L.boot] : null) : accEquipped('boot');
  const dir = o.flip ? -1 : 1, lean = o.lean || 0, dip = o.dip || 0, sit = !!o.sit, lie = sit && !!o.lie, seated = sit && !o.noLegs && !o.air;     /* seated: haunch down, hind legs folded, front legs straight; lie: all of her on the bed */
  const bodyY = gy - (lie ? 11 : seated ? 27 : sit ? 26 : 37) * sc + (o.bob || 0) * sc;
  const hx = 27 + lean + Math.max(0, reach) * 7, hy = -55 + dip - reach * 105;
  const keep = _accOv;
  if (L) _accOv = { hat: L.hc && WARD[L.hc] ? WARD[L.hc].c : null, boot: L.bc && WARD[L.bc] ? WARD[L.bc].c : null };
  ctx.save(); ctx.translate(x, bodyY); ctx.scale(sc * dir, sc);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.lineCap = 'round';
  try {
    const ph = o.ph || 0, lx = [-15, -9, 10, 16];
    for (let i = 0; i < 4; i++){
      if (o.noLegs) break;                                                    /* in the car: legs and boots are out of sight */
      const far = i % 2 === 0;
      if (seated){                                                            /* sitting or lying: the folded pose */
        const hind = i < 2, gl = lie ? 11 : 27, ox = far ? 3 : 0;
        ctx.strokeStyle = far ? cl.dark : cl.coat; ctx.lineCap = 'round';
        let px, py;
        if (hind){ const kx = lie ? -26 + ox : -3 + ox, ky = lie ? 9 : 22; ctx.lineWidth = 8.5; ctx.beginPath(); ctx.moveTo(-17, lie ? 3 : 11); ctx.lineTo(kx, ky); ctx.stroke(); px = lie ? -10 + ox : 8 + ox; py = gl; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(px, py); ctx.stroke(); }
        else { const sx = lx[i]; px = lie ? sx + 15 : sx; py = gl; ctx.lineWidth = 5.2; ctx.beginPath(); ctx.moveTo(sx, 7); ctx.lineTo(px, py); ctx.stroke(); }
        if (boot){ ctx.save(); ctx.translate(px, py); drawBootSide(ctx, boot.id, t, false); ctx.restore(); }
        else { ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.ellipse(px + 1.5, py + 2, 4.8, 3, 0, 0, TAU); ctx.fill(); }
        continue;
      }
      const sw = o.air ? (far ? -6 : 6) : sit ? 0 : Math.sin(ph + (far ? 0 : Math.PI)) * (o.moving ? 8 : 0);
      const lift = o.air ? 5 : sit ? 0 : Math.max(0, Math.cos(ph + (far ? 0 : Math.PI))) * (o.moving ? 5 : 0);
      const fx = lx[i] + sw, fy = (sit ? 28 : 30) - lift;
      ctx.strokeStyle = far ? cl.dark : cl.coat; ctx.lineWidth = 5.2; ctx.beginPath(); ctx.moveTo(lx[i], 8); ctx.lineTo(fx, fy); ctx.stroke();
      if (boot){ ctx.save(); ctx.translate(fx, fy); drawBootSide(ctx, boot.id, t, o.moving); ctx.restore(); }
      else { ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.ellipse(fx + 1, fy + 3, 4.6, 3.4, 0, 0, TAU); ctx.fill(); }
    }
    ctx.strokeStyle = cl.dark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, -2); ctx.quadraticCurveTo(-32, 0, -34, (seated ? (lie ? 12 : 24) : 9) + Math.sin(t * 5 + (o.seed || 0)) * (seated ? 1.5 : 3)); ctx.stroke();
    ctx.save(); if (seated) ctx.rotate(lie ? 0.02 : -0.13);
    ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(0, 0, 24, 15, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 24, 15, 0, 0, TAU); ctx.clip(); ctx.fillStyle = cl.spot;
    if (typeof SPOTS !== 'undefined') for (let i = 0; i < SPOTS.length; i++){ const sp = SPOTS[i]; wardSpot(ctx, pat, sp.x, sp.y * 0.9, sp.r, sp.r * 0.82, i * 0.7); }
    ctx.restore();
    if (seated){ ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(-12, lie ? 6 : 15, 11, 10, 0.5, 0, TAU); ctx.fill(); }     /* the folded haunch */
    ctx.restore();
    /* the neck: from the shoulder to the head, with spots that spread out as it stretches */
    ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(hx - 8, hy + 4); ctx.lineTo(hx + 4, hy + 4); ctx.lineTo(20, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = cl.spot;
    const ns = 4 + Math.round(Math.max(0, reach) * 5);
    for (let k = 0; k < ns; k++){ const u = (k + 0.7) / (ns + 0.4); wardSpot(ctx, pat, lerp(15, hx - 2, u), lerp(-3, hy + 8, u), 3.2 - Math.min(1.2, k * 0.14), 2.8 - Math.min(1.1, k * 0.12), 0.3); }
    ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(hx, hy, 12, 7.2, -0.25, 0, TAU); ctx.fill();
    ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(hx + 8, hy + 2, 5.4, 4.4, -0.25, 0, TAU); ctx.fill();
    ctx.strokeStyle = cl.dark; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(hx - 4, hy - 6); ctx.lineTo(hx - 6, hy - 14); ctx.moveTo(hx + 1, hy - 6.5); ctx.lineTo(hx + 1, hy - 14); ctx.stroke();
    ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(hx - 6, hy - 14.5, 2.1, 0, TAU); ctx.arc(hx + 1, hy - 14.5, 2.1, 0, TAU); ctx.fill();
    if (hat && hat.id !== 'bag') drawHatOnHeadSide(ctx, hat.id, t, hx, hy);
    const blink = (Math.sin(t * 0.9 + (o.seed || 0) * 3) > 0.985) ? 0.25 : 1;
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(hx + 6, hy - 1.6, 2.2, 2.2 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.ellipse(hx + 7, hy - 1.6, 1.2, 1.2 * blink, 0, 0, TAU); ctx.fill();
    if (hat && hat.id === 'bag') drawHatOnHeadSide(ctx, hat.id, t, hx, hy);
  } finally { ctx.restore(); _accOv = keep; }
  return { x: x + dir * hx * sc, y: bodyY + hy * sc, dir: dir, bodyY: bodyY };
}

/* ---- the sky ---- */
const TOWN_SKY = [
  [0, '#0A1030', '#1D2E66'], [5, '#0E1740', '#2B3F7A'], [6.2, '#4C5E9E', '#F2A06A'], [7.5, '#79BDEB', '#FFE2B0'], [10, '#68B7EE', '#CDEBFF'],
  [16.5, '#68B7EE', '#CDEBFF'], [18.3, '#E58A55', '#FFD79A'], [19.6, '#3E4A8C', '#C97A8A'], [21, '#0E1740', '#2B3F7A'], [24, '#0A1030', '#1D2E66']
];
function townSkyAt(h){
  for (let i = 1; i < TOWN_SKY.length; i++){
    const a = TOWN_SKY[i - 1], b = TOWN_SKY[i];
    if (h <= b[0]){ const k = (h - a[0]) / (b[0] - a[0]); return { top: blendHex(a[1], b[1], k), bot: blendHex(a[2], b[2], k) }; }
  }
  return { top: TOWN_SKY[0][1], bot: TOWN_SKY[0][2] };
}

/* ---- painted layers ---- */
const TOWN_PAL = {
  square:  { far: '#A9BCCD', mid: '#C9B79A', ground: '#8F8B7C', path: '#BDB6A2', line: 'rgba(60,50,40,.16)', walls: ['#EBDDBD', '#E2C7A0', '#EBCDC4', '#D5DDB5'], roofs: ['#B5543C', '#8F4A36', '#6E5A4A'] },
  market:  { far: '#B1AFC4', mid: '#CBA98F', ground: '#8A7F72', path: '#B8A892', line: 'rgba(60,45,35,.16)', walls: ['#E9C9A0', '#D9B08A', '#E8D49E', '#C9D1A8'], roofs: ['#A8442F', '#7F4A30', '#4D6B58'] },
  park:    { far: '#9DBFA8', mid: '#7FB06D', ground: '#6EA85A', path: '#C8B88A', line: 'rgba(30,70,30,.2)', walls: ['#E9E0C6', '#F0D9C0'], roofs: ['#6B4A3A', '#5E7A52'] },
  harbour: { far: '#8FB3CC', mid: '#7CA1BC', ground: '#8C7552', path: '#A68E66', line: 'rgba(50,35,20,.25)', walls: ['#D8CBB0', '#BFA680', '#C9D3D6'], roofs: ['#5C6F82', '#8A4B3A'] },
  roofs:   { far: '#B3B8C8', mid: '#9AA0B2', ground: '#6C707A', path: '#8D919B', line: 'rgba(255,255,255,.12)', walls: ['#CFC8BC', '#BDB4A6'], roofs: ['#6A5A52', '#7C6A5E'] },
  launch:  { far: '#A9B4D0', mid: '#8E99BD', ground: '#A6ABB6', path: '#C9CCD4', line: 'rgba(255,200,40,.5)', walls: ['#E8EAF0', '#D3D8E4'], roofs: ['#7A86A8'] },
  burrows: { far: '#3A2D3A', mid: '#4B3A3A', ground: '#4A3B30', path: '#5E4B3C', line: 'rgba(0,0,0,.25)', walls: ['#6B5A48', '#5C4C3C'], roofs: ['#3A2E26'] }
};
function townPaintFar(c, D, W, H, R){
  const P = TOWN_PAL[D.theme], r = miniRng(D.w * 7 + D.id.length);
  if (D.theme === 'burrows'){                                                /* a cave: the far wall and hanging rock */
    tRect(c, '#3A2C42', 0, 0, W, H);
    c.fillStyle = '#4A3A52'; c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= W + 60; x += 60) c.lineTo(x, 70 + r() * 120);
    c.lineTo(W, 0); c.closePath(); c.fill();
    c.fillStyle = '#42324A'; for (let i = 0; i < 18; i++){ const x = r() * W, w = 30 + r() * 70; tPoly(c, '#42324A', [x, TG - 60, x + w / 2, TG - 120 - r() * 160, x + w, TG - 60]); }
    return;
  }
  if (D.theme === 'launch'){                                                 /* mountains and a gantry */
    c.fillStyle = P.far; c.beginPath(); c.moveTo(0, TG);
    for (let x = 0; x <= W + 80; x += 80) c.lineTo(x, TG - 90 - r() * 130 - Math.sin(x * 0.004) * 40);
    c.lineTo(W, TG); c.closePath(); c.fill();
    for (let i = 0; i < 5; i++){ const x = r() * W; const gy = TG - 230 - r() * 70; tRect(c, '#8E99BD', x, gy, 14, 300); for (let y = 0; y < 5; y++) tRect(c, '#7A86A8', x - 12, TG - 220 + y * 40, 38, 5); if (typeof townGantryDetail === 'function') townGantryDetail(c, x, gy); }
    return;
  }
  if (D.theme === 'harbour'){                                                /* sea, and the skyline of the far shore */
    c.fillStyle = '#B7D1E0'; c.beginPath(); c.moveTo(0, TG - 40);
    for (let x = 0; x <= W + 50; x += 50) c.lineTo(x, TG - 120 - r() * 70);
    c.lineTo(W, TG - 40); c.closePath(); c.fill();
    for (let i = 0; i < 9; i++){ const x = r() * W, h = 60 + r() * 90; tRect(c, '#9FB8C8', x, TG - 40 - h, 30 + r() * 26, h); }
    return;
  }
  if (D.theme === 'park'){                                                   /* rolling hills */
    for (let k = 0; k < 2; k++){
      c.fillStyle = k ? '#86B882' : '#A9CDB5'; c.beginPath(); c.moveTo(0, TG);
      for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, TG - 100 - k * 50 - Math.sin(x * 0.006 + k * 2) * 50 - Math.sin(x * 0.017 + k) * 16);
      c.lineTo(W, TG); c.closePath(); c.fill();
    }
    return;
  }
  /* a city skyline of plain blocks with windows */
  c.fillStyle = P.far;
  let x = -20;
  while (x < W + 40){
    const w = 50 + r() * 70, h = D.theme === 'roofs' ? 80 + r() * 190 : 90 + r() * 170;
    tRect(c, P.far, x, TG - 20 - h, w, h + 20);
    c.fillStyle = 'rgba(255,255,255,.16)';
    for (let wy = TG - 4 - h; wy < TG - 30; wy += 26) for (let wx = x + 8; wx < x + w - 10; wx += 18) c.fillRect(wx, wy, 8, 12);
    if (typeof townFarBlockDetail === 'function') townFarBlockDetail(c, D, x, TG - 20 - h, w, h + 20);       /* js/44zw-town-detail.js */
    c.fillStyle = P.far; x += w + 4 + r() * 8;
  }
}
function townPaintMid(c, D, W, H, R){
  const P = TOWN_PAL[D.theme], r = miniRng(D.w * 13 + D.id.length * 5);
  if (D.theme === 'burrows'){
    for (let i = 0; i < 14; i++){ const x = r() * W; tPoly(c, '#5A4650', [x - 18, 0, x + 18, 0, x, 60 + r() * 120]); }
    for (let i = 0; i < 9; i++){ const x = r() * W, h = 70 + r() * 150; tPoly(c, '#5F4A55', [x - 30, TG, x, TG - h, x + 30, TG]); }
    return;
  }
  if (D.theme === 'park' || D.theme === 'square'){
    for (let i = 0; i < Math.round(W / 190); i++){
      const x = i * 190 + r() * 100, s = 0.8 + r() * 0.5;
      tRect(c, '#6B4A32', x - 6 * s, TG - 90 * s, 12 * s, 90 * s);
      tCircle(c, D.theme === 'park' ? '#5C9A58' : '#7BA46A', x, TG - 105 * s, 44 * s); tCircle(c, D.theme === 'park' ? '#6BAE64' : '#8DB87A', x - 20 * s, TG - 90 * s, 30 * s); tCircle(c, '#6BAE64', x + 22 * s, TG - 92 * s, 28 * s);
    }
    return;
  }
  if (D.theme === 'harbour'){                                                /* sea in front of the far shore, with a few boats */
    tRect(c, '#5F94B6', 0, TG - 70, W, 70);
    c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 60; i++) c.fillRect(r() * W, TG - 66 + r() * 60, 18 + r() * 24, 1.6);
    for (let i = 0; i < 4; i++){ const x = r() * W; tPoly(c, '#E9E4D6', [x, TG - 72, x + 40, TG - 72, x + 30, TG - 56, x + 8, TG - 56]); tRect(c, '#6A5848', x + 19, TG - 130, 2.4, 58); tPoly(c, '#F4F1E8', [x + 22, TG - 126, x + 42, TG - 80, x + 22, TG - 80]); }
    return;
  }
  /* rows of houses */
  let x = -30;
  while (x < W + 40){
    const w = 70 + r() * 80, h = 70 + r() * 70, wall = P.walls[Math.floor(r() * P.walls.length)], roof = P.roofs[Math.floor(r() * P.roofs.length)];
    tRect(c, tShade(wall, 0.9), x, TG - 10 - h, w, h + 10); tPoly(c, roof, [x - 6, TG - 10 - h, x + w / 2, TG - 38 - h, x + w + 6, TG - 10 - h]);
    c.fillStyle = 'rgba(80,110,140,.5)'; for (let wx = x + 10; wx < x + w - 14; wx += 24) c.fillRect(wx, TG - h + 6, 12, 16);
    if (typeof townMidHouseDetail === 'function') townMidHouseDetail(c, D, x, TG - 10 - h, w, h + 10, wall, roof);       /* js/44zw-town-detail.js */
    x += w + 10 + r() * 14;
  }
}
/* the street layer: ground, then the buildings and the scenery */
function townPaintField(c, D, W, H, R){
  const P = TOWN_PAL[D.theme], r = miniRng(D.w * 31 + D.id.length * 3);
  D._win = [];
  if (D.theme === 'harbour'){                                                /* water behind the quay, then the quay */
    tRect(c, '#4F86AA', 0, TG - 70, W, 70);
    c.fillStyle = 'rgba(255,255,255,.22)'; for (let i = 0; i < 70; i++) c.fillRect(r() * W, TG - 66 + r() * 62, 16 + r() * 26, 1.6);
  }
  if (D.theme === 'burrows') tRect(c, '#44343C', 0, 0, W, TG);
  tRect(c, P.ground, 0, TG, W, 100);
  tRect(c, P.path, 0, TG, W, 38);
  c.strokeStyle = P.line; c.lineWidth = 1.3;
  if (D.theme === 'harbour'){ for (let x = 0; x < W; x += 34){ c.beginPath(); c.moveTo(x, TG); c.lineTo(x, TG + 100); c.stroke(); } }
  else if (D.theme === 'park'){ c.lineWidth = 1.4; c.strokeStyle = 'rgba(30,80,30,.4)'; for (let i = 0; i < Math.round(W / 11); i++){ const x = r() * W, y = TG + 40 + r() * 54; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - 8); c.moveTo(x, y); c.lineTo(x + 3, y - 7); c.stroke(); } }
  else {
    for (let x = 0; x < W; x += 46){ c.beginPath(); c.moveTo(x, TG); c.lineTo(x - 12, TG + 38); c.stroke(); }
    c.beginPath(); c.moveTo(0, TG + 38); c.lineTo(W, TG + 38); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 80; i++) c.fillRect(r() * W, TG + 42 + r() * 54, 3 + r() * 6, 2);
  }
  c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(0, TG, W, 3);
  /* edge of the street: a low wall or fence so the world has a front */
  if (D.theme === 'roofs'){ tRect(c, '#8D919B', 0, TG + 70, W, 30); tRect(c, '#A9ADB6', 0, TG + 66, W, 6); }
  for (let i = 0; i < D.p.length; i++) townProp(c, D, D.p[i], P, r);
  for (let i = 0; i < D.b.length; i++) townBuilding(c, D, D.b[i], P, r);
}

function townProp(c, D, p, P, r){
  const x = p.x, s = p.s || 1;
  c.save();
  switch (p.k){
    case 'tree':
      tEll(c, 'rgba(0,0,0,.18)', x, TG + 4, 46 * s, 8 * s);
      tPoly(c, '#6B4A32', [x - 11 * s, TG, x - 6 * s, TG - 120 * s, x + 6 * s, TG - 120 * s, x + 11 * s, TG]);
      c.strokeStyle = '#5A3C28'; c.lineWidth = 6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG - 100 * s); c.lineTo(x - 30 * s, TG - 150 * s); c.moveTo(x, TG - 110 * s); c.lineTo(x + 28 * s, TG - 148 * s); c.stroke();
      tCircle(c, '#4F8A4A', x - 4 * s, TG - 160 * s, 54 * s); tCircle(c, '#5E9E55', x - 38 * s, TG - 140 * s, 36 * s); tCircle(c, '#5E9E55', x + 38 * s, TG - 142 * s, 38 * s); tCircle(c, '#6FB063', x + 6 * s, TG - 190 * s, 34 * s);
      c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.arc(x - 16 * s, TG - 180 * s, 26 * s, 0, TAU); c.fill();
      break;
    case 'bush':
      tEll(c, 'rgba(0,0,0,.15)', x, TG + 3, 40, 6);
      tCircle(c, '#4C8744', x - 16, TG - 14, 20); tCircle(c, '#5A9A50', x + 8, TG - 20, 24); tCircle(c, '#6BAA5E', x + 26, TG - 12, 17);
      break;
    case 'flowers':
      for (let i = 0; i < 7; i++){ const fx = x - 30 + i * 10 + r() * 4, fh = 10 + r() * 14; tRect(c, '#3E7A3A', fx, TG - fh, 2, fh); tCircle(c, ['#F29AC0', '#FFD84D', '#FFFFFF', '#FF8A5A'][i % 4], fx + 1, TG - fh - 1, 4.5); }
      break;
    case 'lamp':
      tRect(c, '#3C3C46', x - 3, TG - 150, 6, 150); tRect(c, '#2E2E36', x - 9, TG - 8, 18, 8); tRound(c, '#3C3C46', x - 11, TG - 168, 22, 20, 5);
      tRound(c, '#FFE9A8', x - 8, TG - 165, 16, 14, 4);
      break;
    case 'bench':
      tRect(c, '#6B4A32', x - 36, TG - 24, 72, 7); tRect(c, '#7B5A3E', x - 36, TG - 42, 72, 6); tRect(c, '#4A3624', x - 32, TG - 17, 6, 17); tRect(c, '#4A3624', x + 26, TG - 17, 6, 17);
      tRect(c, '#4A3624', x - 32, TG - 42, 5, 25); tRect(c, '#4A3624', x + 27, TG - 42, 5, 25);
      break;
    case 'fountain':
      tEll(c, 'rgba(0,0,0,.2)', x, TG + 4, 110, 12);
      tRound(c, '#A9A398', x - 100, TG - 36, 200, 36, 8); tRect(c, '#8E887D', x - 100, TG - 12, 200, 4);
      tEll(c, '#6DB6D8', x, TG - 36, 90, 11); tEll(c, 'rgba(255,255,255,.35)', x - 20, TG - 38, 46, 4);
      tRect(c, '#A9A398', x - 10, TG - 100, 20, 66); tRound(c, '#B9B3A8', x - 36, TG - 112, 72, 14, 7); tRect(c, '#A9A398', x - 6, TG - 130, 12, 20);
      break;
    case 'stall':
      tRect(c, '#6B4A32', x - 56, TG - 130, 5, 130); tRect(c, '#6B4A32', x + 51, TG - 130, 5, 130);
      tAwning(c, x - 62, TG - 150, 124, 22, '#D5352B', '#F4F1E8');
      tRect(c, '#8A6642', x - 54, TG - 40, 108, 40); tRect(c, '#A57C52', x - 58, TG - 46, 116, 8);
      [['#E85D3C', -34], ['#F2C230', -12], ['#6BBB45', 10], ['#F29AC0', 32]].forEach(function(f){ tCircle(c, f[0], x + f[1], TG - 54, 8); });
      break;
    case 'crates':
      tRect(c, '#8A6642', x - 26, TG - 44, 52, 44); c.strokeStyle = '#5E4430'; c.lineWidth = 2; c.strokeRect(x - 26, TG - 44, 52, 44); c.beginPath(); c.moveTo(x - 26, TG - 44); c.lineTo(x + 26, TG); c.moveTo(x + 26, TG - 44); c.lineTo(x - 26, TG); c.stroke();
      tRect(c, '#9A7550', x - 14, TG - 80, 40, 36); c.strokeRect(x - 14, TG - 80, 40, 36);
      break;
    case 'barrel':
      tRound(c, '#8A5A32', x - 18, TG - 46, 36, 46, 10); tRect(c, '#4A3624', x - 18, TG - 36, 36, 4); tRect(c, '#4A3624', x - 18, TG - 14, 36, 4);
      break;
    case 'pond':
      tEll(c, '#3E6A8E', x, TG + 22, 190, 28); tEll(c, '#5BA2CE', x, TG + 20, 180, 24);
      tEll(c, 'rgba(255,255,255,.3)', x - 40, TG + 14, 70, 5);
      [[-90, 22], [20, 28], [95, 18]].forEach(function(l){ tEll(c, '#4F9A4A', x + l[0], TG + l[1], 16, 5); tCircle(c, '#F29AC0', x + l[0] + 3, TG + l[1] - 3, 3.4); });
      break;
    case 'pier':
      for (let i = 0; i < 6; i++) tRect(c, '#5E4430', x - 150 + i * 60, TG - 10, 8, 80);
      tRect(c, '#8C7552', x - 160, TG - 12, 340, 10);
      break;
    case 'boat':
      tPoly(c, '#8A4B3A', [x - 120, TG - 62, x + 120, TG - 62, x + 90, TG - 28, x - 90, TG - 28]); tRect(c, '#F4F1E8', x - 118, TG - 70, 236, 8);
      tRect(c, '#6A5848', x - 3, TG - 280, 6, 220); tPoly(c, '#F4F1E8', [x + 6, TG - 270, x + 70, TG - 90, x + 6, TG - 90]); tPoly(c, '#E8D8B0', [x - 6, TG - 240, x - 56, TG - 90, x - 6, TG - 90]);
      tRound(c, '#D5352B', x - 100, TG - 86, 50, 24, 4); tWin(c, D, x - 92, TG - 82, 10, 12, '#BFE0F4'); tWin(c, D, x - 76, TG - 82, 10, 12, '#BFE0F4');
      break;
    case 'crane':
      tRect(c, '#C9962F', x - 6, TG - 320, 12, 320); tRect(c, '#C9962F', x - 6, TG - 330, 160, 10); tRect(c, '#A87A22', x + 40, TG - 322, 6, 100);
      c.strokeStyle = '#444'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 140, TG - 322); c.lineTo(x + 140, TG - 160); c.stroke(); tRect(c, '#555', x + 134, TG - 160, 12, 10);
      break;
    case 'antenna':
      tRect(c, '#6A6F78', x - 3, TG - 260 * s, 6, 260 * s);
      for (let i = 1; i <= 5; i++){ tRect(c, '#6A6F78', x - (36 - i * 4) * s, TG - 50 * i * s, (72 - i * 8) * s, 4); }
      tCircle(c, '#D5352B', x, TG - 262 * s, 6);
      break;
    case 'tank':
      for (let i = 0; i < 4; i++) tRect(c, '#4A4F58', x - 42 + i * 28, TG - 46, 6, 46);
      tRound(c, '#7C8AA0', x - 50, TG - 130, 100, 86, 14); tRect(c, '#5A6578', x - 50, TG - 110, 100, 5); tRect(c, '#5A6578', x - 50, TG - 70, 100, 5);
      tPoly(c, '#5A6578', [x - 56, TG - 128, x, TG - 160, x + 56, TG - 128]);
      break;
    case 'chimney':
      tRect(c, '#9A5A42', x - 24, TG - 150, 48, 150); tRect(c, '#7A4632', x - 30, TG - 160, 60, 14);
      for (let i = 0; i < 5; i++) tRect(c, 'rgba(0,0,0,.18)', x - 24, TG - 140 + i * 30, 48, 2);
      break;
    case 'vent':
      tRect(c, '#9AA0AA', x - 28, TG - 60, 56, 60); tRect(c, '#7A808A', x - 34, TG - 70, 68, 12); c.strokeStyle = '#5A6068'; c.lineWidth = 2; for (let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(x - 20, TG - 50 + i * 12); c.lineTo(x + 20, TG - 50 + i * 12); c.stroke(); }
      break;
    case 'dish':
      tRect(c, '#9AA0AA', x - 4, TG - 120, 8, 120); c.fillStyle = '#E8EAF0'; c.beginPath(); c.ellipse(x, TG - 140, 70, 30, -0.5, 0, TAU); c.fill(); c.fillStyle = '#C5CAD6'; c.beginPath(); c.ellipse(x + 4, TG - 138, 56, 22, -0.5, 0, TAU); c.fill();
      tRect(c, '#6A6F78', x - 2, TG - 170, 4, 40);
      break;
    case 'rocket':
      tEll(c, 'rgba(0,0,0,.2)', x, TG + 6, 74, 10);
      tPoly(c, '#C9CDD9', [x - 36, TG, x - 70, TG - 4, x - 40, TG - 100, x - 36, TG - 100]); tPoly(c, '#C9CDD9', [x + 36, TG, x + 70, TG - 4, x + 40, TG - 100, x + 36, TG - 100]);
      tRound(c, '#F4F6FA', x - 38, TG - 270, 76, 270, 20); tRect(c, '#D5352B', x - 38, TG - 150, 76, 14); tRect(c, '#D5352B', x - 38, TG - 62, 76, 10);
      tPoly(c, '#D5352B', [x - 38, TG - 250, x, TG - 310, x + 38, TG - 250]); tCircle(c, '#5BA2CE', x, TG - 200, 17); tCircle(c, '#FFFFFF', x - 5, TG - 205, 5);
      tRect(c, 'rgba(0,0,0,.1)', x + 14, TG - 268, 24, 268);
      break;
    case 'tower':
      for (let i = 0; i < 6; i++){ tRect(c, '#8A93A8', x - 24, TG - 290 + i * 48, 48, 5); c.strokeStyle = '#8A93A8'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 24, TG - 290 + i * 48); c.lineTo(x + 24, TG - 242 + i * 48); c.stroke(); }
      tRect(c, '#8A93A8', x - 26, TG - 292, 6, 292); tRect(c, '#8A93A8', x + 20, TG - 292, 6, 292); tRect(c, '#D5352B', x - 26, TG - 306, 52, 14);
      break;
    case 'mush':
      for (let i = 0; i < 3; i++){
        const mx = x + (i - 1) * 40, mh = 40 + i % 2 * 28 + r() * 10, cr = 22 + (i === 1 ? 14 : 0);
        tRect(c, '#CFC3A0', mx - 5, TG - mh, 10, mh); tEll(c, '#6EE0A0', mx, TG - mh, cr, cr * 0.7); tEll(c, '#A8FFD0', mx - cr * 0.3, TG - mh - 3, cr * 0.5, cr * 0.3);
      }
      break;
    case 'stal':
      tPoly(c, '#5A4A44', [x - 26, TG, x, TG - 70 - 30 * s, x + 26, TG]); tPoly(c, '#4A3C38', [x, TG - 70 - 30 * s, x + 26, TG, x + 8, TG]);
      tPoly(c, '#4A3C38', [x - 34, 0, x + 34, 0, x + 4, 90]);
      break;
  }
  c.restore();
}

function townBuilding(c, D, b, P, r){
  const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h, closed = b.gate && !b.gate();
  c.save();
  switch (b.kind){
    case 'tram':
      tRect(c, '#5A6578', x0, top, 6, h); tRect(c, '#5A6578', x0 + W - 6, top, 6, h);
      tRound(c, '#C9D4E6', x0 - 8, top - 10, W + 16, 16, 6); tRect(c, '#4A8F6A', x0 - 8, top - 14, W + 16, 6);
      tRect(c, '#7B5A3E', x0 + 20, TG - 28, W - 40, 8); tRect(c, '#4A3624', x0 + 26, TG - 20, 6, 20); tRect(c, '#4A3624', x0 + W - 32, TG - 20, 6, 20);
      tRect(c, '#5A6578', x + W / 2 + 14, TG - 170, 6, 170); tRound(c, '#4A8F6A', x + W / 2 - 14, TG - 196, 62, 30, 6); c.fillStyle = '#FFF'; c.font = 'bold 15px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('TRAM', x + W / 2 + 17, TG - 175);
      break;
    case 'tailor':
      tRect(c, '#E8B7C9', x0, top, W, h); tRect(c, '#D79FB5', x0, top, W, 14); tPoly(c, '#B5547A', [x0 - 10, top, x0 + W + 10, top, x0 + W - 6, top - 30, x0 + 6, top - 30]);
      tRect(c, '#FFF4F8', x0 + 30, top + 48, 150, 94); tRect(c, 'rgba(120,150,180,.35)', x0 + 30, top + 48, 150, 94); c.strokeStyle = '#7A4B5A'; c.lineWidth = 4; c.strokeRect(x0 + 30, top + 48, 150, 94);
      tRound(c, '#C9628C', x0 + 76, top + 80, 28, 50, 8); tCircle(c, '#E8B7C9', x0 + 90, top + 72, 10); tRect(c, '#7A4B5A', x0 + 88, top + 128, 4, 14);
      D._win.push({ x: x0 + 30, y: top + 48, w: 150, h: 94 });
      tAwning(c, x0 + 14, top + 24, W - 28, 22, '#C9628C', '#FFF4F8');
      tDoor(c, x0 + W - 50, 52, 96, '#7A4B5A'); tSign(c, b.label, x, top - 14, 180, '#7A2F52');
      break;
    case 'hall':
      tRect(c, '#CFC7B6', x0 - 10, TG - 18, W + 20, 18); tRect(c, '#C2BAA8', x0 - 4, TG - 34, W + 8, 18);
      tRect(c, '#E8E0D0', x0, top, W, h - 34); tPoly(c, '#D9D0BC', [x0 - 12, top, x, top - 62, x0 + W + 12, top]);
      tCircle(c, '#FFFDF4', x, top - 22, 22); c.strokeStyle = '#6A5A44'; c.lineWidth = 3; c.beginPath(); c.arc(x, top - 22, 22, 0, TAU); c.stroke();
      c.lineWidth = 2; for (let i = 0; i < 12; i++){ const a = i * TAU / 12; c.beginPath(); c.moveTo(x + Math.cos(a) * 17, top - 22 + Math.sin(a) * 17); c.lineTo(x + Math.cos(a) * 20, top - 22 + Math.sin(a) * 20); c.stroke(); }
      for (let i = 0; i < 5; i++) { tRect(c, '#F4EFE2', x0 + 18 + i * (W - 60) / 4, top + 12, 18, h - 48); tRect(c, 'rgba(0,0,0,.1)', x0 + 30 + i * (W - 60) / 4, top + 12, 6, h - 48); }
      tDoor(c, x, 70, 104, '#5A3B22'); tRect(c, '#6A5A44', x - 2, top - 88, 4, 30); tPoly(c, '#D5352B', [x + 2, top - 88, x + 34, top - 78, x + 2, top - 68]);
      tSign(c, b.label, x, top + 38, 190, '#4A3624');
      break;
    case 'board':
      tRect(c, '#5A3B22', x - 62, TG - 150, 8, 150); tRect(c, '#5A3B22', x + 54, TG - 150, 8, 150);
      tRound(c, '#8A6642', x - 70, TG - 160, 140, 100, 6); tRect(c, '#C9A272', x - 62, TG - 152, 124, 84); tRect(c, '#5A3B22', x - 76, TG - 168, 152, 10);
      [[-48, -140, '#FFFFFF'], [-8, -142, '#FFE9A8'], [30, -138, '#FFD1E0'], [-34, -112, '#D6EBFF'], [14, -108, '#FFFFFF']].forEach(function(n){ tRect(c, n[2], x + n[0], TG + n[1], 30, 24); tCircle(c, '#D5352B', x + n[0] + 15, TG + n[1] + 3, 2.4); });
      break;
    case 'hatch':
      tEll(c, '#4A4A52', x, TG + 36, 62, 15); tEll(c, closed ? '#6A6A74' : '#80808C', x, TG + 33, 56, 12); c.strokeStyle = '#3A3A44'; c.lineWidth = 2; for (let i = -2; i <= 2; i++){ c.beginPath(); c.moveTo(x + i * 18, TG + 24); c.lineTo(x + i * 18, TG + 42); c.stroke(); }
      break;
    case 'post':
      tRect(c, '#D9B88A', x0, top, W, h); tRect(c, '#B8945E', x0, top, W, 14); tRect(c, '#7A4B2A', x0 - 8, top - 18, W + 16, 22);
      tAwning(c, x0 + 6, top + 36, W - 12, 24, '#2F8A5A', '#F4F1E8');
      tWin(c, D, x0 + 24, top + 76, 90, 62, '#BFE0F4'); tDoor(c, x0 + W - 70, 58, 100, '#5A3B22');
      [[x0 + 38, '#F2C230'], [x0 + 62, '#F2C230'], [x0 + 86, '#7AD8FF']].forEach(function(g){ tCircle(c, g[1], g[0], top + 128, 8); });
      tSign(c, b.label, x, top - 6, 200, '#2F6A44');
      break;
    case 'cafe':
      tRect(c, '#F2D49A', x0, top, W, h); tRect(c, '#D9B070', x0, top, W, 12); tRect(c, '#8A4B3A', x0 - 6, top - 14, W + 12, 18); tRect(c, '#7A4B3A', x0 + 40, top - 56, 28, 44);
      tAwning(c, x0 + 6, top + 34, W - 12, 26, '#7A4B2A', '#F4E8C8');
      tWin(c, D, x0 + 22, top + 74, 80, 56, '#FFE9A8'); tDoor(c, x0 + W - 56, 50, 92, '#7A3B2A'); tSign(c, b.label, x, top - 2, 210, '#7A3B2A');
      for (let i = 0; i < 2; i++){ const tx = x0 - 70 - i * 6 + (i ? W + 150 : 0); tRect(c, '#6A4A32', tx - 2, TG - 46, 4, 46); tPoly(c, i ? '#F29AC0' : '#6BBB45', [tx - 36, TG - 46, tx + 36, TG - 46, tx, TG - 74]); }
      break;
    case 'library':
      tRect(c, '#B8553E', x0, top, W, h); for (let yy = top + 6; yy < TG; yy += 12) tRect(c, 'rgba(0,0,0,.1)', x0, yy, W, 1.5);
      tRect(c, '#8A3E2C', x0 - 6, top - 10, W + 12, 16); tPoly(c, '#6A3A2E', [x0 - 6, top - 10, x, top - 54, x0 + W + 6, top - 10]);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++){ const wx = x0 + 28 + i * (W - 56) / 2.45; tWin(c, D, wx, top + 20 + j * 82, 36, 54, '#CFE6F2'); tPoly(c, '#CFE6F2', [wx, top + 20 + j * 82, wx + 36, top + 20 + j * 82, wx + 18, top + 4 + j * 82]); }
      tRect(c, '#E8E0D0', x0 + 8, TG - 22, W - 16, 22); tDoor(c, x, 66, 104, '#3A2A1E');
      tRound(c, '#E8E0D0', x + 80, top + 118, 74, 26, 4); tRect(c, '#6A4A32', x + 84, top + 122, 30, 18); tRect(c, '#6A4A32', x + 118, top + 122, 30, 18);
      tSign(c, b.label, x, top + 160, 140, '#3A2A1E');
      break;
    case 'arcade':
      tRect(c, '#3A2A5A', x0, top, W, h); tRect(c, '#2A1E44', x0, top, W, 14);
      for (let i = 0; i < Math.round(W / 22); i++) tCircle(c, ['#FF4D8D', '#FFD84D', '#4DD8FF', '#6BFF8D'][i % 4], x0 + 8 + i * 22, top + 22, 4);
      tRound(c, '#16102A', x0 + 24, top + 36, W - 48, 36, 6); c.fillStyle = '#FF4D8D'; c.font = 'bold 22px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('ARCADE', x, top + 62);
      tRect(c, '#2A1E44', x0 + 18, top + 90, 70, 110); tRect(c, '#4DD8FF', x0 + 26, top + 100, 54, 36); tRect(c, '#FF4D8D', x0 + 34, top + 150, 10, 10); tCircle(c, '#FFD84D', x0 + 62, top + 156, 6);
      tRect(c, '#2A1E44', x0 + W - 88, top + 90, 70, 110); tRect(c, '#6BFF8D', x0 + W - 80, top + 100, 54, 36); tRect(c, '#FFD84D', x0 + W - 72, top + 150, 10, 10);
      tDoor(c, x, 60, 100, '#16102A'); D._win.push({ x: x0 + 24, y: top + 36, w: W - 48, h: 36 });
      break;
    case 'scores':
      tRect(c, '#5A3B22', x - 70, TG - 130, 8, 130); tRect(c, '#5A3B22', x + 62, TG - 130, 8, 130);
      tRound(c, '#1F2A38', x - 86, TG - 190, 172, 108, 8); tRect(c, '#FFD84D', x - 74, TG - 178, 148, 14);
      for (let i = 0; i < 4; i++){ tRect(c, '#C9D4E6', x - 70, TG - 156 + i * 18, 90 - i * 10, 6); tRect(c, '#FFD84D', x + 36, TG - 156 + i * 18, 30, 6); }
      break;
    case 'grove':
      tEll(c, 'rgba(0,0,0,.2)', x, TG + 4, 130, 12);
      tPoly(c, '#6B4A32', [x - 40, TG, x - 22, TG - 140, x + 22, TG - 140, x + 40, TG]);
      c.strokeStyle = '#5A3C28'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 10, TG - 120); c.lineTo(x - 90, TG - 190); c.moveTo(x + 10, TG - 120); c.lineTo(x + 92, TG - 188); c.stroke();
      [[0, 250, 100], [-96, 214, 74], [96, 214, 76], [-56, 276, 62], [58, 272, 62], [0, 320, 54]].forEach(function(l){ tCircle(c, '#4C8A44', x + l[0], TG - l[1], l[2]); });
      [[0, 250, 80], [-90, 214, 56], [90, 212, 58]].forEach(function(l){ tCircle(c, '#5E9E55', x + l[0] - 8, TG - l[1] - 6, l[2]); });
      tSign(c, b.label, x, TG - 30, 190, '#4A3624');
      break;
    case 'studio':
      tRect(c, '#4A7FC8', x0, top, W, h); tRect(c, '#3A64A0', x0, top, W, 12); tRect(c, '#2A4A7A', x0 - 6, top - 12, W + 12, 14);
      tRound(c, '#FFFFFF', x - 32, top + 28, 64, 50, 10); tCircle(c, '#2A2A34', x, top + 53, 17); tCircle(c, '#5BA2CE', x, top + 53, 11); tCircle(c, '#FFFFFF', x - 4, top + 49, 3.5);
      tRect(c, '#D5352B', x0 + 30, top + 100, W - 60, TG - top - 100); tRect(c, '#E8574A', x0 + W / 2 - 3, top + 100, 6, TG - top - 100);
      tSign(c, b.label, x, top - 2, 190, '#2A4A7A');
      break;
    case 'shack':
      tRect(c, '#A57C52', x0, top, W, h); for (let i = 1; i < 9; i++) tRect(c, 'rgba(0,0,0,.18)', x0 + i * W / 9, top, 2, h);
      tPoly(c, '#5C6F82', [x0 - 14, top, x, top - 44, x0 + W + 14, top]); tWin(c, D, x0 + 26, top + 40, 56, 44, '#BFE0F4'); tDoor(c, x0 + W - 62, 54, 90, '#5A3B22');
      tCircle(c, '#D5352B', x0 + 44, top + 120, 15); tCircle(c, '#FFFFFF', x0 + 44, top + 120, 9); tCircle(c, '#D5352B', x0 + 44, top + 120, 4);
      c.strokeStyle = '#8A6642'; c.lineWidth = 1.6; for (let i = 0; i < 6; i++){ c.beginPath(); c.moveTo(x0 + 100, top + 20 + i * 10); c.lineTo(x0 + 150, top + 20 + i * 10); c.stroke(); }
      tSign(c, b.label, x, top - 26, 200, '#2F4A5C');
      break;
    case 'lighthouse':
      tPoly(c, '#F4F1E8', [x - 70, TG, x - 40, top + 60, x + 40, top + 60, x + 70, TG]);
      for (let i = 0; i < 4; i++) tPoly(c, '#D5352B', [x - 66 + i * 4.4, TG - 40 - i * 80, x - 56 + i * 4.4 + 0, TG - 80 - i * 80, x + 56 - i * 4.4, TG - 80 - i * 80, x + 66 - i * 4.4, TG - 40 - i * 80]);
      tRect(c, '#3A3A44', x - 54, top + 50, 108, 12); tRect(c, '#3A3A44', x - 54, top + 18, 4, 36); tRect(c, '#3A3A44', x + 50, top + 18, 4, 36);
      tRound(c, '#BFE8F8', x - 36, top + 14, 72, 38, 8); D._win.push({ x: x - 36, y: top + 14, w: 72, h: 38 });
      tPoly(c, '#D5352B', [x - 46, top + 14, x, top - 26, x + 46, top + 14]); tDoor(c, x, 40, 66, '#5A3B22');
      break;
    case 'garden':
      tRect(c, '#8A6A4A', x0, TG - 30, W, 30);
      tRect(c, 'rgba(190,235,230,.6)', x0 + 10, top + 20, W - 20, h - 50); c.strokeStyle = '#E8E8E8'; c.lineWidth = 3; c.strokeRect(x0 + 10, top + 20, W - 20, h - 50);
      for (let i = 1; i < 6; i++){ c.beginPath(); c.moveTo(x0 + 10 + i * (W - 20) / 6, top + 20); c.lineTo(x0 + 10 + i * (W - 20) / 6, TG - 30); c.stroke(); }
      tPoly(c, 'rgba(190,235,230,.75)', [x0 + 4, top + 20, x, top - 22, x0 + W - 4, top + 20]);
      for (let i = 0; i < 6; i++){ const px = x0 + 40 + i * 56; tRect(c, '#3E7A3A', px, TG - 80, 4, 50); tCircle(c, ['#F29AC0', '#FFD84D', '#FF8A5A'][i % 3], px + 2, TG - 86, 10); }
      tSign(c, b.label, x, top - 36, 200, '#2F6A44');
      break;
    case 'shed':
      tRect(c, '#8A93A8', x0, top, W, h); for (let i = 1; i < 12; i++) tRect(c, 'rgba(0,0,0,.14)', x0 + i * W / 12, top, 2, h);
      tPoly(c, '#6A7488', [x0 - 8, top, x0 + 24, top - 24, x0 + W + 8, top - 24 + 14, x0 + W + 8, top]); tDoor(c, x - 30, 52, 88, '#4A5568'); tWin(c, D, x + 26, top + 40, 50, 40, '#BFE0F4');
      tRect(c, '#6A6F78', x0 + W - 24, top - 100, 4, 78); tCircle(c, '#E8EAF0', x0 + W - 22, top - 106, 16); tSign(c, b.label, x, top - 36, 170, '#3A4558');
      break;
    case 'mission':
      tRect(c, '#E8EAF0', x0, top, W, h); tRect(c, '#4A6ED8', x0, top + 40, W, 18); tRect(c, '#C5CAD6', x0 - 8, top - 10, W + 16, 14);
      tCircle(c, '#FFFFFF', x0 + 50, top + 100, 26); tCircle(c, '#5BA2CE', x0 + 50, top + 100, 20); D._win.push({ x: x0 + 30, y: top + 80, w: 40, h: 40 });
      for (let i = 0; i < 3; i++) tWin(c, D, x0 + 110 + i * 62, top + 82, 40, 34, '#BFE0F4');
      tDoor(c, x, 66, 100, '#2F4A8A'); tRect(c, '#9AA0AA', x0 + W - 54, top - 66, 6, 58); c.fillStyle = '#E8EAF0'; c.beginPath(); c.ellipse(x0 + W - 52, top - 78, 40, 16, -0.6, 0, TAU); c.fill();
      tSign(c, b.label, x, top + 22, 220, '#2F4A8A');
      break;
    case 'scope':
      tRect(c, '#7A86A8', x - 60, TG - 24, 120, 24); tRect(c, '#5A6578', x - 4, TG - 90, 8, 66);
      c.save(); c.translate(x, TG - 96); c.rotate(-0.7); tRound(c, '#C5CAD6', -10, -58, 20, 116, 6); tRect(c, '#2F4A8A', -12, -62, 24, 12); tRect(c, '#2F4A8A', -12, 42, 24, 10); c.restore();
      tRect(c, '#3A3A44', x - 36, TG - 12, 72, 4);
      break;
    case 'cavern':
      tRect(c, '#4A3A34', x0 - 30, top - 80, W + 60, h + 80);
      c.fillStyle = '#1B1218'; c.beginPath(); c.moveTo(x0 + 20, TG); c.lineTo(x0 + 20, TG - 110); c.quadraticCurveTo(x, TG - 210, x0 + W - 20, TG - 110); c.lineTo(x0 + W - 20, TG); c.closePath(); c.fill();
      for (let i = 0; i < 4; i++){ tRect(c, '#8A6642', x0 + 40 + i * 70, TG - 40, 50, 40); tCircle(c, ['#FFD84D', '#7AD8FF', '#F29AC0', '#9BFF7A'][i], x0 + 65 + i * 70, TG - 50, 9); }
      tSign(c, b.label, x, TG - 190, 220, '#3A2A1E');
      break;
    case 'fusion':
      tRect(c, '#6A5A60', x0, TG - 24, W, 24);
      if (closed){ tPoly(c, '#8A8A96', [x0 + 10, TG - 24, x0 + 40, top + 30, x0 + W - 40, top + 40, x0 + W - 10, TG - 24]); c.strokeStyle = '#5A5A66'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 80, TG - 24); c.lineTo(x0 + 90, top + 40); c.moveTo(x0 + 190, TG - 24); c.lineTo(x0 + 180, top + 40); c.stroke(); break; }
      tRound(c, '#9AA0AA', x0 + 20, top + 60, 80, h - 84, 12); tRound(c, '#9AA0AA', x0 + W - 100, top + 60, 80, h - 84, 12);
      tCircle(c, '#FFE9A8', x, top + 90, 54); tCircle(c, '#FF9A3C', x, top + 90, 36); tCircle(c, '#FFFFFF', x - 6, top + 84, 14);
      c.strokeStyle = '#5A6068'; c.lineWidth = 8; c.beginPath(); c.moveTo(x0 + 60, top + 60); c.quadraticCurveTo(x0 + 80, top, x - 40, top + 50); c.moveTo(x0 + W - 60, top + 60); c.quadraticCurveTo(x0 + W - 80, top, x + 40, top + 50); c.stroke();
      D._win.push({ x: x - 50, y: top + 40, w: 100, h: 100 });
      break;
    case 'farm':
      tRect(c, '#5A4A3A', x0, TG - 40, W, 40); tRect(c, '#7A6A4A', x0 + 8, TG - 32, W - 16, 22);
      for (let i = 0; i < 6; i++) tEll(c, '#F2E8C8', x0 + 30 + i * 40, TG - 30, 9, 5);
      tRect(c, '#6B4A32', x0 - 4, TG - 90, 6, 90); tRect(c, '#6B4A32', x0 + W - 2, TG - 90, 6, 90); tRect(c, '#6B4A32', x0 - 4, TG - 80, W + 10, 6); tRect(c, '#6B4A32', x0 - 4, TG - 56, W + 10, 6);
      tSign(c, b.label, x, TG - 124, 180, '#3A2A1E');
      break;
    case 'ladder':
      tRect(c, 'rgba(255,230,150,.22)', x - 34, 0, 68, TG); tRect(c, '#8A6642', x - 20, 0, 6, TG); tRect(c, '#8A6642', x + 14, 0, 6, TG);
      for (let yy = 20; yy < TG; yy += 34) tRect(c, '#8A6642', x - 20, yy, 40, 5);
      tSign(c, b.label, x, TG - 190, 170, '#3A2A1E');
      break;
  }
  c.restore();
}

/* ---- the things to find ---- */
/* Drawn in world units with the item's origin at its middle. t is the town clock, so they bob and turn. */
function townItemArt(ctx, it, t, seed){
  const bob = Math.sin(t * 2.2 + seed) * 3, k = it.t;
  ctx.save(); ctx.translate(0, bob);
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
  glow.addColorStop(0, k === 'swatch' ? 'rgba(255,255,255,.7)' : 'rgba(255,240,170,.55)'); glow.addColorStop(1, 'rgba(255,240,170,0)');
  ctx.fillStyle = glow; ctx.fillRect(-30, -30, 60, 60);
  switch (k){
    case 'coin': { const w = Math.abs(Math.cos(t * 2.6 + seed)) * 11 + 2; tEll(ctx, '#B8861A', 0, 1.5, w, 11); tEll(ctx, '#FFD84D', 0, 0, w, 11); tEll(ctx, '#FFF2A8', -w * 0.2, -3, w * 0.45, 5); break; }
    case 'star': { ctx.rotate(Math.sin(t * 1.4 + seed) * 0.2); ctx.fillStyle = '#FFD84D'; ctx.strokeStyle = '#B8861A'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 7 : 16; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); break; }
    case 'gem': tPoly(ctx, '#2FB5E0', [0, -14, 12, -3, 0, 14, -12, -3]); tPoly(ctx, '#8FE6FF', [0, -14, 12, -3, 0, -3]); tPoly(ctx, '#1F86AA', [0, -3, 12, -3, 0, 14]); break;
    case 'hat': case 'boot': drawAccIcon(ctx, ACC_BY_ID[it.acc], 0, k === 'boot' ? 2 : 4, 1.35, t); break;
    case 'swatch': {
      const col = WARD[it.n] ? WARD[it.n].c : '#FFFFFF';
      ctx.rotate(t * 0.8); for (let i = 0; i < 6; i++){ ctx.rotate(TAU / 6); tCircle(ctx, col, 0, -11, 6.2); } tCircle(ctx, '#FFFFFF', 0, 0, 7); tCircle(ctx, col, 0, 0, 4.4);
      break;
    }
    case 'track': {
      ctx.fillStyle = '#6A4A32'; ctx.beginPath(); ctx.ellipse(0, 4, 9, 7, 0, 0, TAU); ctx.fill();
      [[-9, -6], [-3, -11], [4, -11], [10, -5]].forEach(function(p){ ctx.beginPath(); ctx.ellipse(p[0], p[1], 3.4, 4.4, 0, 0, TAU); ctx.fill(); });
      break;
    }
  }
  ctx.restore();
}
/* a glimmering patch of ground: today's digging spot */
function townDigArt(ctx, t, seed){
  tEll(ctx, '#5A4632', 0, 6, 30, 7); tEll(ctx, '#6E573D', 0, 4, 24, 5);
  for (let i = 0; i < 4; i++){ const a = t * 1.6 + i * 1.7 + seed, k = (Math.sin(a) + 1) / 2; ctx.fillStyle = 'rgba(255,240,170,' + (0.4 + k * 0.6).toFixed(2) + ')'; ctx.fillRect(-18 + i * 12, -4 - k * 12, 3, 3); }
}
