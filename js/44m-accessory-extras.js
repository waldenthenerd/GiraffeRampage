'use strict';
/* Hat and boot colors, the photo screen, and the one-time tips. */
/* ========================= 44m. ACCESSORY COLORS, PHOTO MODE, TIPS ========================= */
/* Save.data.mini.hatCol and bootCol hold 0 (the item's own colors) or a color number from the coat colors (1 to 26, whatever she has
   unlocked, see WARD in 44e-wardrobe.js). The hat and boots are drawn as usual, then tinted: 'color' blend keeps the item's light and
   shade and takes the chosen hue, so even the black top hat and the white toque take a color. Save.data.mini.tips remembers which
   one-time tips have been shown. */

/* ---- tinting the worn hat and boots ---- */
function accTintFor(kind){
  if (_accOv) return _accOv[kind] || null;
  const md = miniData(), n = (kind === 'boot' ? md.bootCol : md.hatCol) | 0;
  return n >= 1 && n <= WARD_MAX && wardUnlocked(n) && WARD[n] ? WARD[n].c : null;
}
const _tintA = document.createElement('canvas'), _tintB = document.createElement('canvas');
_tintA.width = _tintB.width = 330; _tintA.height = _tintB.height = 330;
const _tintCa = _tintA.getContext('2d'), _tintCb = _tintB.getContext('2d');
/* draw fn(c) into a small canvas for the box x0..x1, y0..y1 (in the caller's units), tint it, and put it on ctx in the same place */
function accTinted(ctx, col, x0, y0, x1, y1, fn){
  const k = Math.min(3, 320 / Math.max(x1 - x0, y1 - y0)), w = Math.ceil((x1 - x0) * k), h = Math.ceil((y1 - y0) * k);
  _tintCa.setTransform(1, 0, 0, 1, 0, 0); _tintCa.clearRect(0, 0, 330, 330);
  _tintCa.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); fn(_tintCa);
  _tintCa.setTransform(1, 0, 0, 1, 0, 0);
  const b = _tintCb; b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, 330, 330);
  b.drawImage(_tintA, 0, 0, w, h, 0, 0, w, h);
  b.globalCompositeOperation = 'color'; b.fillStyle = col; b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'destination-in'; b.drawImage(_tintA, 0, 0, w, h, 0, 0, w, h);
  b.globalCompositeOperation = 'source-over';
  ctx.drawImage(_tintB, 0, 0, w, h, x0, y0, x1 - x0, y1 - y0);
}
let _accDepth = 0;
(function(){
  const hs = drawHatOnHeadSide, ht = drawHatOnHeadTop, bs = drawBootSide, bt = drawBootTop;
  drawHatOnHeadSide = function(ctx, id, t, hx, hy){
    const col = _accDepth ? null : accTintFor('hat');
    if (!col) return hs(ctx, id, t, hx, hy);
    _accDepth++; try { accTinted(ctx, col, hx - 42, hy - 70, hx + 42, hy + 26, function(c){ hs(c, id, t, hx, hy); }); } finally { _accDepth--; }
  };
  drawHatOnHeadTop = function(ctx, id, t){
    const col = _accDepth ? null : accTintFor('hat');
    if (!col) return ht(ctx, id, t);
    _accDepth++; try { accTinted(ctx, col, -34, -34, 34, 34, function(c){ ht(c, id, t); }); } finally { _accDepth--; }
  };
  drawBootSide = function(ctx, id, t, moving){
    const col = _accDepth ? null : accTintFor('boot');
    if (!col) return bs(ctx, id, t, moving);
    _accDepth++; try { accTinted(ctx, col, -14, -16, 28, 14, function(c){ bs(c, id, t, moving); }); } finally { _accDepth--; }
  };
  drawBootTop = function(ctx, id, t, moving){
    const col = _accDepth ? null : accTintFor('boot');
    if (!col) return bt(ctx, id, t, moving);
    _accDepth++; try { accTinted(ctx, col, -16, -14, 22, 14, function(c){ bt(c, id, t, moving); }); } finally { _accDepth--; }
  };
  /* the icons in the wheel, the wardrobe and the collection always show the item as it comes */
  const ai = drawAccIcon;
  drawAccIcon = function(ctx, it, cx, cy, sc, t){ _accDepth++; try { ai(ctx, it, cx, cy, sc, t); } finally { _accDepth--; } };
})();

/* ---- the color strip under the hat and boots rows of the wardrobe ---- */
function accColourRowHTML(kind){
  const md = miniData(), cur = (kind === 'boot' ? md.bootCol : md.hatCol) | 0;
  let h = '<div class="sub" style="margin:4px 0 3px;font-size:12px">' + (kind === 'boot' ? 'Boot' : 'Hat') + ' color: <b>' + (cur && WARD[cur] ? WARD[cur].name : 'its own') + '</b></div><div class="swatches dots">';
  h += '<button class="swatch' + (cur ? '' : ' on') + '" data-a="ward-' + kind + 'col-0" title="Its own colors" aria-label="Its own colors" style="background:linear-gradient(135deg,#E9CB7C 50%,#D5352B 50%)"></button>';
  for (let n = 1; n <= WARD_MAX; n++){
    if (!wardUnlocked(n)) continue;
    h += '<button class="swatch' + (cur === n ? ' on' : '') + '" data-a="ward-' + kind + 'col-' + n + '" title="' + WARD[n].name + '" aria-label="' + WARD[n].name + '" style="background:' + WARD[n].c + '"></button>';
  }
  return h + '</div>';
}

/* ---- one-time tips ---- */
function tipOnce(key, text){
  const md = miniData(); if (!md.tips || typeof md.tips !== 'object') md.tips = {};
  if (md.tips[key]) return '';
  md.tips[key] = 1; Save.write();
  return '<div class="tip"><span class="tipi">' + (typeof ico === 'function' ? ico('@t-x-bulb') : '') + '</span><span>' + text + '</span></div>';
}

/* ---- the photo screen lives in 44n-photo-studio.js ---- */
function handleExtraAction(a){
  let m = /^ward-(hat|boot)col-(\d+)$/.exec(a);
  if (m){
    const n = +m[2], md = miniData();
    if (n === 0 || (n <= WARD_MAX && wardUnlocked(n))){ md[m[1] === 'boot' ? 'bootCol' : 'hatCol'] = n; Save.write(); SFX.pick(); } else SFX.deny();
    if (typeof showWardrobe === 'function') showWardrobe();
    return true;
  }
  return false;
}
