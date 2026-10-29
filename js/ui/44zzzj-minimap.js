'use strict';
/* The minimap: a small map of the arena in the corner of the screen. */
/* On a computer it is on by default, in the bottom-right corner; on a phone it is off and an opt-in in Settings (it is not tuned for small screens). It shows the whole arena, or
   with Settings > Map zoom a window of it that follows the giraffe, and it follows the chapter being played: the ground colour of the chapter, its mud, ice, drift and heat patches,
   the waterhole, its landmarks, its buildings (the Tower redraws with every floor's walls and furniture, the Siege colours each key building by its health and marks the wrecked
   ones), the rocket in the Space Center. Creatures are faint dots; bosses are bigger, pulsing, and when they are off the zoomed map an arrow at its edge points to them. A white
   frame shows what the screen is looking at. Size and zoom are sliders in Settings. It is drawn on top of the world, after the screen effects, and is one pass over the arena's
   objects, with no pictures kept. */
const MM_GROUND = { 1: '#8A7448', 2: '#C9D9E3', 3: '#4A5732', 4: '#14425E', 5: '#2E4220', 6: '#6E6C68', 7: '#6A8A44', 8: '#8F8E8A', 9: '#8E5630', 10: '#4F2C1C', 11: '#8A7448', 12: '#C5A877', 13: '#B65A33', 14: '#C6DCE6', 15: '#B9BCC2', 16: '#8A8478' };
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
function mmDraw(ctx){
  const mw = mmSizePx(), mh = Math.round(mw * ARENA_H / ARENA_W), z = mmZoomK(), ww = ARENA_W / z, wh = ARENA_H / z;
  const wx = clamp(P.x - ww / 2, 0, ARENA_W - ww), wy = clamp(P.y - wh / 2, 0, ARENA_H - wh), k = mw / ww;
  const mx = G.W - mw - 14, my = G.H - mh - (Input.hasTouch ? 160 : 14), t = G.time;
  const X = function(x){ return (x - wx) * k; }, Y = function(y){ return (y - wy) * k; };
  ctx.save();
  ctx.translate(mx, my);
  ctx.fillStyle = 'rgba(10,8,6,.72)'; mmRound(ctx, -3, -3, mw + 6, mh + 6, 7); ctx.fill();
  mmRound(ctx, 0, 0, mw, mh, 5); ctx.clip();
  ctx.fillStyle = MM_GROUND[G.chapter] || '#7F6C45'; ctx.fillRect(0, 0, mw, mh);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, mw, mh);
  if (SCEN.ch){
    for (let i = 0; i < SCEN.zones.length; i++){ const q = SCEN.zones[i]; if (q.x + q.rx < wx || q.x - q.rx > wx + ww || q.y + q.rx < wy || q.y - q.rx > wy + wh) continue;
      ctx.fillStyle = 'rgba(' + (MM_ZONE[q.kind] || '255,255,255') + ',.42)'; ctx.beginPath(); ctx.ellipse(X(q.x), Y(q.y), q.rx * k, q.ry * k, q.rot, 0, TAU); ctx.fill(); }
  }
  if (G.water){ ctx.fillStyle = 'rgba(70,160,215,.8)'; ctx.beginPath(); ctx.arc(X(G.water.x), Y(G.water.y), Math.max(2, G.water.r * k), 0, TAU); ctx.fill(); }
  if (SCEN.ch){
    const lm = mmLandmarks();
    for (let i = 0; i < SCEN.props.length; i++){ const p = SCEN.props[i]; if (!lm.has(p.def)) continue; const r = Math.max(2, p.r * p.s * 0.5 * k);
      ctx.fillStyle = 'rgba(30,22,16,.5)'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.stroke(); }
  }
  const sg = typeof SGB !== 'undefined' && G.biome === 'siege' ? SGB : null;
  for (let i = 0; i < G.buildings.length; i++){
    const b = G.buildings[i]; if (b.x + b.w < wx || b.x > wx + ww || b.y + b.h < wy || b.y > wy + wh) continue;
    let col = b.tower ? (b.kind === 'wall' || b.kind === 'w' ? '#20242E' : '#58606E') : '#7A7D88';
    const s = sg && b.key ? sg[b.key] : null;
    if (s) col = s.wrecked ? '#4A2A24' : (function(f){ return f > 0.66 ? '#6FBF5A' : f > 0.33 ? '#E8B84A' : '#E86A4A'; })(s.hp / SIEGE_BLD.max);
    else if (!b.tower && b.collapsed) col = 'rgba(70,66,62,.7)';
    else if (!b.tower && b.maxHp > 1 && b.hp < b.maxHp * 0.5) col = '#9A6A5A';
    ctx.fillStyle = col; ctx.fillRect(X(b.x), Y(b.y), Math.max(1, b.w * k), Math.max(1, b.h * k));
    if (s){ ctx.strokeStyle = s.wrecked ? '#FF5A4A' : 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.strokeRect(X(b.x) + 0.5, Y(b.y) + 0.5, Math.max(1, b.w * k) - 1, Math.max(1, b.h * k) - 1); }
  }
  if (typeof TW !== 'undefined' && G.tower && TW.floor && TW.floor.lift && TW.floor.lift.w){ const l = TW.floor.lift; ctx.fillStyle = '#FFD24A'; ctx.fillRect(X(l.x), Y(l.y), Math.max(3, l.w * k), Math.max(3, l.h * k)); }
  if (G.rocket){ ctx.fillStyle = '#F4F0E8'; ctx.beginPath(); ctx.arc(X(G.rocket.x), Y(G.rocket.y), 2.5, 0, TAU); ctx.fill(); }
  const es = G.enemies, bosses = [];
  ctx.fillStyle = 'rgba(255,110,90,.6)';
  for (let i = 0; i < es.length; i++){
    const e = es[i]; if (e.dead) continue;
    if (e.big){ bosses.push(e); continue; }
    if (e.x < wx || e.x > wx + ww || e.y < wy || e.y > wy + wh) continue;
    if (e.elite){ ctx.fillStyle = 'rgba(255,210,74,.95)'; ctx.fillRect(X(e.x) - 1.5, Y(e.y) - 1.5, 3, 3); ctx.fillStyle = 'rgba(255,110,90,.6)'; }
    else ctx.fillRect(X(e.x) - 0.9, Y(e.y) - 0.9, 1.8, 1.8);
  }
  const vw = G.W / G.zoom, vh = G.H / G.zoom;
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.strokeRect(X(G.camX - vw / 2) + 0.5, Y(G.camY - vh / 2) + 0.5, vw * k, vh * k);
  ctx.fillStyle = '#FFD24A'; ctx.strokeStyle = '#2A1E10'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(P.x), Y(P.y), 3.4, 0, TAU); ctx.fill(); ctx.stroke();
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  for (let i = 0; i < bosses.length; i++){
    const e = bosses[i], bx = X(e.x), by = Y(e.y);
    if (bx >= 0 && bx <= mw && by >= 0 && by <= mh){
      ctx.strokeStyle = 'rgba(255,90,60,' + (0.5 + 0.4 * pulse) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 5.5 + 2 * pulse, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#FF3A2A'; ctx.strokeStyle = '#FFF3C0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 4, 0, TAU); ctx.fill(); ctx.stroke();
    } else {                                                                  /* off the zoomed map: an arrow on its edge pointing there */
      const dx = bx - mw / 2, dy = by - mh / 2, f = Math.min((mw / 2 - 7) / Math.abs(dx || 1e-6), (mh / 2 - 7) / Math.abs(dy || 1e-6)), ax = mw / 2 + dx * f, ay = mh / 2 + dy * f, an = Math.atan2(dy, dx);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(an); ctx.fillStyle = '#FF3A2A'; ctx.strokeStyle = '#FFF3C0'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 4.5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  ctx.save(); ctx.translate(mx, my); ctx.strokeStyle = 'rgba(239,230,212,.6)'; ctx.lineWidth = 1.2; mmRound(ctx, 0, 0, mw, mh, 5); ctx.stroke();
  const label = G.biome === 'siege' ? 'Longneck Town' : G.tower && TW.n ? 'Floor ' + TW.n : '';
  if (label){ ctx.font = '700 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; const lw = ctx.measureText(label).width + 10; ctx.fillStyle = 'rgba(10,8,6,.7)'; ctx.fillRect(4, 4, lw, 14); ctx.fillStyle = '#EFE6D4'; ctx.fillText(label, 9, 14.5); }
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
