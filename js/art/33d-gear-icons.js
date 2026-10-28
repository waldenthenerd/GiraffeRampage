'use strict';
/* =============================================================================================================================
   33d-gear-icons.js  --  A DRAWN ICON FOR EVERY PIECE OF GEAR. gearIcon(id, size, {locked, level}) returns a PNG data URL: the cape, the
   weapon on a hoof or a head, or the armor plate, drawn with the same code the game uses on her (33a, 33b, 33c) and fitted to the picture.
   A piece you have not found draws as a flat dark silhouette: the shape shows, the design does not. The icon is cached by id, size, locked,
   level and the gear accent color (so recolouring her on the Coat colors screen gives new icons by itself). gearFrame(rarity) gives the
   four rarity looks the Gear page puts around an icon. Used by the Gear page (41a-gear-page.js).
   ============================================================================================================================= */
const GEAR_FRAMES = {
  common:    { border: '#A9997F', glow: 'rgba(169,153,127,.22)', bg: ['#3A2B20', '#241B15'] },
  rare:      { border: '#7E9B4E', glow: 'rgba(126,155,78,.30)',  bg: ['#33402A', '#1F2619'] },
  epic:      { border: '#9A5BD6', glow: 'rgba(154,91,214,.34)',  bg: ['#3B2850', '#221730'] },
  legendary: { border: '#FFD84D', glow: 'rgba(255,216,77,.40)',  bg: ['#4D3F1C', '#2A210E'] },
  mythical:  { border: '#FF6BD6', glow: 'rgba(255,107,214,.50)', bg: ['#4A1F45', '#25102A'] }
};
function gearFrame(rarity){ return GEAR_FRAMES[rarity] || GEAR_FRAMES.common; }

const GI_CACHE = {};
function gearIconInvalidate(){ for (const k in GI_CACHE) delete GI_CACHE[k]; }

/* the piece alone, at its own size, centered on (0, 0) of ctx */
function giDrawPiece(ctx, p, level, acc){
  const T = 1.3;
  if (p.slot === 'cape'){
    const len = 40, o = { bx: 0, by: 0, tipA: Math.PI, len: len, spread: 13, px: 0, py: 1, ppx: 0, ppy: -1, a: 0, moving: 0, color: acc || p.color, t: T, level: level };
    o.tx = -len; o.ty = 0; o.mx = -len * 0.55; o.my = 0;
    if (!capeDraw(ctx, p.setId, o)){ ctx.fillStyle = o.color; ctx.fillRect(-len, -10, len, 20); }
  } else if (p.slot === 'armor'){
    armorDraw(ctx, p.setId, acc || p.color, p.rarity, level, T);
  } else {
    const w = WEAPONS[p.weapon] || DEFAULT_WEAPON, art = WEAPON_ART[w.id], o = { e: 0.3, swing: 0.45, t: T, color: w.color, level: level, side: 1 };
    ctx.fillStyle = '#D6A44F';
    if (art && art.hoof){
      [-1, 1].forEach(function(s){ ctx.save(); ctx.translate(0, s * 9); ctx.fillStyle = '#A8762F'; ctx.beginPath(); ctx.ellipse(-4, 0, 9, 4.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#5C3A16'; ctx.beginPath(); ctx.ellipse(1, 0, 3, 3, 0, 0, TAU); ctx.fill(); weaponGlow(ctx, o); art.hoof(ctx, Object.assign({}, o, { side: s })); ctx.restore(); });
    } else if (art && art.body){
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.fill(); ctx.save(); weaponGlow(ctx, o); art.body(ctx, o); ctx.restore();
    } else if (art && art.head){
      ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#A8762F'; ctx.beginPath(); ctx.ellipse(10, 0, 5.4, 4.4, 0, 0, TAU); ctx.fill();
      fillCircle(ctx, 13, -1.8, 1.1, '#2B1D12'); fillCircle(ctx, 13, 1.8, 1.1, '#2B1D12'); ctx.save(); weaponGlow(ctx, o); art.head(ctx, o); ctx.restore();
    } else {
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, TAU); ctx.fill();
    }
  }
}
/* gearIcon: the PNG data URL; '' for an id that is not gear */
function gearIcon(id, size, opts){
  opts = opts || {}; size = size || 64;
  const p = typeof GEAR_INDEX !== 'undefined' ? GEAR_INDEX[id] : null; if (!p) return '';
  const locked = !!opts.locked, level = Math.max(1, Math.min(GEAR_LV_MAX, opts.level | 0 || 1)), acc = (typeof giraffeAccent === 'function' && giraffeAccent()) || '';
  const key = id + '|' + size + '|' + (locked ? 1 : 0) + '|' + level + '|' + acc;
  if (GI_CACHE[key]) return GI_CACHE[key];
  gearIcon._draws++;
  /* draw at its own scale on a roomy canvas, find where the pixels are, then fit that box into the icon */
  const W = 280, tmp = document.createElement('canvas'); tmp.width = tmp.height = W; const tc = tmp.getContext('2d');
  tc.translate(W / 2, W / 2); giDrawPiece(tc, p, level, acc);
  const d = tc.getImageData(0, 0, W, W).data; let x0 = W, y0 = W, x1 = 0, y1 = 0;
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 12){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  if (x1 > x0 && y1 > y0){
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, k = Math.min(size * 0.8 / bw, size * 0.8 / bh, 5), dw = bw * k, dh = bh * k;
    c.imageSmoothingQuality = 'high'; c.drawImage(tmp, x0, y0, bw, bh, (size - dw) / 2, (size - dh) / 2 - (level > 1 ? size * 0.03 : 0), dw, dh);
  }
  if (locked){ c.globalCompositeOperation = 'source-in'; c.fillStyle = 'rgba(27,20,16,.92)'; c.fillRect(0, 0, size, size); c.globalCompositeOperation = 'source-over'; }
  else if (level > 1){                                                       /* a gold pip for each level above the first, along the bottom */
    const r = Math.max(1.6, size * 0.035), gap = r * 2.8, x = size / 2 - (level - 2) * gap / 2;
    for (let i = 0; i < level - 1; i++){ c.fillStyle = '#FFD84D'; c.beginPath(); c.arc(x + i * gap, size - r * 2, r, 0, TAU); c.fill(); c.strokeStyle = '#8A6A12'; c.lineWidth = 0.6; c.stroke(); }
  }
  return (GI_CACHE[key] = cv.toDataURL('image/png'));
}
gearIcon._draws = 0;
