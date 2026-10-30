'use strict';
/* The minimap: a small map of the arena in the corner of the screen. */
/* On a computer it is on by default, in the bottom-right corner; on a phone it is off and an opt-in in Settings (it is not tuned for small screens). It shows the whole arena, or
   with Settings > Map zoom a window of it that follows the giraffe, and it follows the chapter being played: the ground colour of the chapter, its mud, ice, drift and heat patches,
   the waterhole, its landmarks, its buildings (the Tower redraws with every floor's walls and furniture, the Siege colours each key building by its health and marks the wrecked
   ones), the rocket in the Space Center. Creatures are faint dots; bosses are bigger, pulsing, and when they are off the zoomed map an arrow at its edge points to them. A white
   frame shows what the screen is looking at. Size and zoom are sliders in Settings. It is drawn on top of the world, after the screen effects, and is one pass over the arena's
   objects, with no pictures kept. */
const MM_GROUND = { 1: '#8A7448', 2: '#C9D9E3', 3: '#4A5732', 4: '#14425E', 5: '#2E4220', 6: '#6E6C68', 7: '#6A8A44', 8: '#8F8E8A', 9: '#8E5630', 10: '#4F2C1C', 11: '#8A7448', 12: '#C5A877', 13: '#B65A33', 14: '#C6DCE6', 15: '#B9BCC2', 16: '#8A8478', 17: '#7A745E' };
const MM_ZONE = { slow: '107,74,42', ice: '190,232,245', push: '255,255,255', hurt: '255,106,58' };
const MM_STATES = { playing: 1, levelup: 1, paused: 1, bossintro: 1 };
let MM_LM = { ch: -1, defs: null };
function mmOn(){ const m = Settings.minimap; return m === 'on' || (m !== 'off' && !Input.hasTouch); }
function mmSizePx(){ return Math.round(Math.min(120 + clamp(Settings.mmSize, 0, 1) * 280, G.W * (Input.hasTouch ? 0.42 : 0.3))); }
function mmZoomK(){ return 1 + clamp(Settings.mmZoom, 0, 1) * 3; }
function mmLandmarks(){
  if (MM_LM.ch !== SCEN.ch){ MM_LM.ch = SCEN.ch; const d = SCEN_DEFS[SCEN.ch]; MM_LM.defs = new Set(d && d.landmarks ? d.landmarks : []); }
  return MM_LM.defs;
}
function mmRound(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
const MM_PROP = { tree: '#2E5A2A', plant: '#6F8F3A', rock: '#7C766A', wood: '#6A4A2A', machine: '#8A90A0', crystal: '#9ADAF0', soft: '#8A7050', fire: '#D8602A', coral: '#D86A9A' };
const MM_COL = new Map();
/* the colour of a kind of prop: read from its own drawing (the scenery detail layer's mask), or a colour for its family */
function mmPropColor(def, kind){
  let c = MM_COL.get(def); if (c) return c;
  c = MM_PROP[typeof sdFamily === 'function' ? sdFamily(def.id) : 'rock'] || '#7C766A';
  try { const M = typeof sdMask === 'function' ? sdMask(def, kind) : null; if (M && M.avg) c = 'rgb(' + Math.round(M.avg[0]) + ',' + Math.round(M.avg[1]) + ',' + Math.round(M.avg[2]) + ')'; } catch (err){}
  MM_COL.set(def, c); return c;
}
function mmDraw(ctx){
  const mw = mmSizePx(), mh = Math.round(mw * ARENA_H / ARENA_W), z = mmZoomK(), ww = ARENA_W / z, wh = ARENA_H / z;
  const wx = clamp(P.x - ww / 2, 0, ARENA_W - ww), wy = clamp(P.y - wh / 2, 0, ARENA_H - wh), k = mw / ww;
  const mx = G.W - mw - 14, my = G.H - mh - (Input.hasTouch ? 160 : 14), t = G.time;
  const X = function(x){ return (x - wx) * k; }, Y = function(y){ return (y - wy) * k; };
  ctx.save();
  ctx.translate(mx, my);
  ctx.fillStyle = 'rgba(8,6,4,.85)'; mmRound(ctx, -4, -4, mw + 8, mh + 8, 8); ctx.fill();               /* a dark frame, so it reads on snow and on sand alike */
  mmRound(ctx, 0, 0, mw, mh, 5); ctx.clip();
  const g0 = MM_GROUND[G.chapter] || '#7F6C45';
  ctx.fillStyle = g0; ctx.fillRect(0, 0, mw, mh);
  if (SCEN.ch){                                                                                            /* the soft ground patches the chapter is painted with */
    for (let i = 0; i < SCEN.patches.length; i++){ const q = SCEN.patches[i]; if (q.x + q.rx < wx || q.x - q.rx > wx + ww || q.y + q.ry < wy || q.y - q.ry > wy + wh) continue;
      ctx.globalAlpha = Math.min(1, q.a * 1.6); ctx.drawImage(q.spr, X(q.x - q.rx), Y(q.y - q.ry), q.rx * 2 * k, q.ry * 2 * k); }
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(0, 0, mw, mh);
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.beginPath();                          /* a faint grid of sixteenths of the arena, to tell where you are */
  for (let i = 1; i < 4; i++){ const gx = X(ARENA_W * i / 4), gy = Y(ARENA_H * i / 4); if (gx > 0 && gx < mw){ ctx.moveTo(Math.round(gx) + 0.5, 0); ctx.lineTo(Math.round(gx) + 0.5, mh); } if (gy > 0 && gy < mh){ ctx.moveTo(0, Math.round(gy) + 0.5); ctx.lineTo(mw, Math.round(gy) + 0.5); } }
  ctx.stroke();
  if (SCEN.ch){
    for (let i = 0; i < SCEN.zones.length; i++){ const q = SCEN.zones[i]; if (q.x + q.rx < wx || q.x - q.rx > wx + ww || q.y + q.rx < wy || q.y - q.rx > wy + wh) continue;
      const rgb = MM_ZONE[q.kind] || '255,255,255'; ctx.fillStyle = 'rgba(' + rgb + ',.5)'; ctx.strokeStyle = 'rgba(' + rgb + ',.95)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(X(q.x), Y(q.y), q.rx * k, q.ry * k, q.rot, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  if (G.water){ const wxm = X(G.water.x), wym = Y(G.water.y), wr = Math.max(2, G.water.r * k); ctx.fillStyle = 'rgba(60,150,215,.95)'; ctx.beginPath(); ctx.arc(wxm, wym, wr, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(200,240,255,.9)'; ctx.lineWidth = 1.2; ctx.stroke(); }
  if (SCEN.ch){
    const lm = mmLandmarks(), cheap = SCEN.props.length > 260;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < SCEN.props.length; i++){
      const p = SCEN.props[i], isL = lm.has(p.def); if (isL !== (pass === 1)) continue;
      if (p.x < wx - 40 || p.x > wx + ww + 40 || p.y < wy - 40 || p.y > wy + wh + 40) continue;
      const r = isL ? Math.max(3, p.r * p.s * 0.5 * k) : Math.max(1.1, p.r * p.s * 0.3 * k), col = mmPropColor(p.def, isL ? 'landmark' : 'prop');
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), r, 0, TAU); ctx.fill();
      if (r > 1.7 || isL){ ctx.strokeStyle = isL ? 'rgba(0,0,0,.75)' : 'rgba(0,0,0,.5)'; ctx.lineWidth = isL ? 1.4 : 0.8; ctx.stroke(); if (isL){ ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(X(p.x) - r * 0.3, Y(p.y) - r * 0.3, r * 0.45, 0, TAU); ctx.fill(); } }
    }
  }
  const sg = typeof SGB !== 'undefined' && G.biome === 'siege' ? SGB : null;
  for (let i = 0; i < G.buildings.length; i++){
    const b = G.buildings[i]; if (b.x + b.w < wx || b.x > wx + ww || b.y + b.h < wy || b.y > wy + wh) continue;
    let col = b.tower ? (b.kind === 'wall' || b.kind === 'w' ? '#1A1D26' : '#6A7384') : '#8D909C', line = b.tower ? null : 'rgba(0,0,0,.6)';
    const s = sg && b.key ? sg[b.key] : null;
    if (s) col = s.wrecked ? '#5A2E26' : (function(f){ return f > 0.66 ? '#58C84A' : f > 0.33 ? '#F0B83A' : '#F0603A'; })(s.hp / SIEGE_BLD.max);
    else if (b.fort && typeof ftMmColor === 'function') col = ftMmColor(b);
    else if (!b.tower && b.collapsed) col = 'rgba(80,76,72,.8)';
    else if (!b.tower && b.maxHp > 1 && b.hp < b.maxHp * 0.5) col = '#B0725E';
    const bx = X(b.x), by = Y(b.y), bw = Math.max(1.5, b.w * k), bh = Math.max(1.5, b.h * k);
    ctx.fillStyle = col; ctx.fillRect(bx, by, bw, bh);
    if (!b.tower || b.kind !== 'wall'){ ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(bx, by, bw, Math.min(1.5, bh)); }       /* a lit top edge */
    if (s){ ctx.strokeStyle = s.wrecked ? '#FF5A4A' : '#FFFFFF'; ctx.lineWidth = 1.2; ctx.strokeRect(bx + 0.6, by + 0.6, bw - 1.2, bh - 1.2); if (s.wrecked){ ctx.beginPath(); ctx.moveTo(bx + 2, by + 2); ctx.lineTo(bx + bw - 2, by + bh - 2); ctx.moveTo(bx + bw - 2, by + 2); ctx.lineTo(bx + 2, by + bh - 2); ctx.stroke(); } }
    else if (line && bw > 3){ ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1); }
  }
  if (typeof TW !== 'undefined' && G.tower && TW.floor && TW.floor.lift && TW.floor.lift.w){ const l = TW.floor.lift; ctx.fillStyle = '#FFD24A'; ctx.fillRect(X(l.x), Y(l.y), Math.max(4, l.w * k), Math.max(4, l.h * k)); ctx.strokeStyle = '#3A2A10'; ctx.lineWidth = 1; ctx.strokeRect(X(l.x) + 0.5, Y(l.y) + 0.5, Math.max(4, l.w * k) - 1, Math.max(4, l.h * k) - 1); }
  if (G.rocket){ ctx.fillStyle = '#F4F0E8'; ctx.strokeStyle = '#1A1612'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X(G.rocket.x), Y(G.rocket.y), 3.2, 0, TAU); ctx.fill(); ctx.stroke(); }
  const es = G.enemies, bosses = [];
  for (let i = 0; i < es.length; i++){                                                                       /* a dark halo under a bright dot, so each reads on any ground */
    const e = es[i]; if (e.dead) continue;
    if (e.big){ bosses.push(e); continue; }
    if (e.x < wx || e.x > wx + ww || e.y < wy || e.y > wy + wh) continue;
    const ex = X(e.x), ey = Y(e.y);
    if (e.elite){ ctx.fillStyle = 'rgba(20,10,0,.85)'; ctx.fillRect(ex - 2.6, ey - 2.6, 5.2, 5.2); ctx.fillStyle = '#FFD24A'; ctx.fillRect(ex - 1.7, ey - 1.7, 3.4, 3.4); }
    else { ctx.fillStyle = 'rgba(12,6,4,.78)'; ctx.fillRect(ex - 1.9, ey - 1.9, 3.8, 3.8); ctx.fillStyle = '#FF5A44'; ctx.fillRect(ex - 1.1, ey - 1.1, 2.2, 2.2); }
  }
  const vw = G.W / G.zoom, vh = G.H / G.zoom, fx = X(G.camX - vw / 2), fy = Y(G.camY - vh / 2);
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3; ctx.strokeRect(fx, fy, vw * k, vh * k); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.3; ctx.strokeRect(fx, fy, vw * k, vh * k);
  const gx = X(P.x), gy = Y(P.y);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(gx, gy, 5.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFC21A'; ctx.strokeStyle = '#2A1A06'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(gx, gy, 4, 0, TAU); ctx.fill(); ctx.stroke();
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  for (let i = 0; i < bosses.length; i++){
    const e = bosses[i], bx = X(e.x), by = Y(e.y);
    if (bx >= 0 && bx <= mw && by >= 0 && by <= mh){
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 + 0.4 * pulse) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 7 + 2.5 * pulse, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#E4261A'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 4.8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 0.8, by - 2.6, 1.6, 3.2); ctx.fillRect(bx - 0.8, by + 1.2, 1.6, 1.6);
    } else {                                                                  /* off the zoomed map: an arrow on its edge pointing there */
      const dx = bx - mw / 2, dy = by - mh / 2, f = Math.min((mw / 2 - 9) / Math.abs(dx || 1e-6), (mh / 2 - 9) / Math.abs(dy || 1e-6)), ax = mw / 2 + dx * f, ay = mh / 2 + dy * f, an = Math.atan2(dy, dx);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(an); ctx.fillStyle = '#E4261A'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -6); ctx.lineTo(-2.5, 0); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  ctx.save(); ctx.translate(mx, my); ctx.strokeStyle = 'rgba(245,236,216,.85)'; ctx.lineWidth = 1.5; mmRound(ctx, 0, 0, mw, mh, 5); ctx.stroke();
  const label = G.biome === 'fort' ? 'Fort Shortneck' : G.biome === 'siege' ? 'Longneck Town' : G.tower && TW.n ? 'Floor ' + TW.n : '';
  if (label){ ctx.font = '700 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; const lw = ctx.measureText(label).width + 10; ctx.fillStyle = 'rgba(8,6,4,.85)'; ctx.fillRect(4, 4, lw, 14); ctx.fillStyle = '#F5ECD8'; ctx.fillText(label, 9, 14.5); }
  ctx.restore();
}
const mm_drawScreenFX = drawScreenFX;
drawScreenFX = function(ctx){
  mm_drawScreenFX.apply(this, arguments);
  if (!G.attract && MM_STATES[G.state] === 1 && G.chapter && mmOn() && G.buildings && typeof P !== 'undefined' && !G.deathFX) mmDraw(ctx);
};
/* the Settings rows: on or off, then size and zoom */
function mmSliderHTML(id, label, small, value, text){
  return '<div class="kv" style="width:100%"><div>' + label + '<small>' + small + '</small></div><div style="display:flex;align-items:center;gap:8px"><input id="' + id + '" type="range" min="0" max="100" step="5" value="' + Math.round(value * 100) + '" style="width:120px">' +
    '<span id="' + id + 'Val" style="min-width:52px;text-align:right">' + text + '</span></div></div>';
}
function mmSettingsHTML(){
  const on = mmOn(), s = Settings;
  return toggleRowHTML('s-minimap', 'Minimap', Input.hasTouch ? 'A small map of the arena above the buttons on the right. It is not made for phones: it takes room on a small screen and costs some speed, so it is off unless you choose it.' : 'A small map of the arena in the bottom-right corner, with the bosses marked. It follows the chapter you are in.', on) +
    mmSliderHTML('setMmSize', 'Map size', 'How big the minimap is.', s.mmSize, mmSizePx() + ' px') +
    mmSliderHTML('setMmZoom', 'Map zoom', 'The far left shows the whole arena; to the right it shows only the part around you, with an arrow for a boss that is off the map.', s.mmZoom, mmZoomK().toFixed(1) + 'x');
}
function mmWireSettings(){
  const size = document.getElementById('setMmSize'), zoom = document.getElementById('setMmZoom');
  if (size){ size.addEventListener('input', function(){ Settings.mmSize = clamp((+size.value || 0) / 100, 0, 1); const l = document.getElementById('setMmSizeVal'); if (l) l.textContent = mmSizePx() + ' px'; }); size.addEventListener('change', function(){ Settings.save(); }); }
  if (zoom){ zoom.addEventListener('input', function(){ Settings.mmZoom = clamp((+zoom.value || 0) / 100, 0, 1); const l = document.getElementById('setMmZoomVal'); if (l) l.textContent = mmZoomK().toFixed(1) + 'x'; }); zoom.addEventListener('change', function(){ Settings.save(); }); }
}
