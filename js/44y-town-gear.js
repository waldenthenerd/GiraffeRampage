'use strict';
/* Hats and boots that can only be found in Longneck Town. */
/* ========================= 44y. TOWN-ONLY HATS AND BOOTS ========================= */
/* Five hats and three boots that are NOT on the minigame wheel (they are left out of ACC_SLICES and miniSlicesFor skips anything with
   .town). They are appended to ACC_ITEMS, which is how photo codes number accessories (5 bits, so the list is now full at 31: it may only
   be added to at the end, and a code format change would be needed for more). They are drawn by wrapping the four drawing functions
   of js/44f-minigames.js; this file must load BEFORE js/44m-accessory-extras.js, which wraps those same functions for tinting and has to
   see these items too. Where each one is found is in TOWN_ITEMS and TOWN_NPCS (js/44u-town-data.js). */
ACC.townHats = [
  { id: 'conductor', name: 'Conductor Cap', c: '#22305C' }, { id: 'beret', name: 'Painter’s Beret', c: '#C4382F' }, { id: 'souwester', name: 'Fisher’s Sou’wester', c: '#F2C230' },
  { id: 'aviator', name: 'Aviator Cap', c: '#7A5230' }, { id: 'miner', name: 'Miner’s Helmet', c: '#F2C230' }
];
ACC.townBoots = [
  { id: 'roller', name: 'Roller Skates', c: '#F4F6FA' }, { id: 'dock', name: 'Dockside Boots', c: '#4B6A82' }, { id: 'moon', name: 'Moon Boots', c: '#C9CDD9' }
];
ACC.townHats.forEach(function(h){ h.kind = 'hat'; h.rare = false; h.p = 0; h.town = true; ACC_ITEMS.push(h); ACC_BY_ID[h.id] = h; });
ACC.townBoots.forEach(function(b){ b.kind = 'boot'; b.rare = false; b.p = 0; b.town = true; ACC_ITEMS.push(b); ACC_BY_ID[b.id] = b; });

const TOWN_HAT_SIDE = {
  conductor: function(c){
    c.fillStyle = '#22305C'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-8, -9); c.quadraticCurveTo(0, -14, 9, -9); c.lineTo(10, 0); c.closePath(); c.fill();
    c.fillStyle = '#10183A'; c.fillRect(-9, -3.4, 19, 3.4);
    c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0.5, -6.4, 2.4, 0, TAU); c.fill(); c.fillStyle = '#B8860B'; c.beginPath(); c.arc(0.5, -6.4, 1, 0, TAU); c.fill();
    c.fillStyle = '#14102A'; c.beginPath(); c.ellipse(11.5, 0.2, 7, 1.9, 0.1, 0, TAU); c.fill();
  },
  beret: function(c){
    c.fillStyle = '#8E2A22'; c.beginPath(); c.ellipse(0, -0.8, 9, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = '#C4382F'; c.beginPath(); c.ellipse(1.5, -5, 11.5, 5.6, -0.18, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-2, -7, 5, 1.8, -0.18, 0, TAU); c.fill();
    c.fillStyle = '#7A1F1A'; c.fillRect(-0.4, -12.4, 2.6, 3.4);
  },
  souwester: function(c){
    c.fillStyle = '#E0AE1C'; c.beginPath(); c.moveTo(-6, -0.5); c.quadraticCurveTo(-17, 1, -19, 8); c.quadraticCurveTo(-8, 4, 8, 1); c.closePath(); c.fill();
    c.fillStyle = '#F2C230'; c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-8, -12, 0, -12); c.quadraticCurveTo(9, -12, 9.5, 0); c.closePath(); c.fill();
    c.strokeStyle = '#B8860B'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-5, -9); c.lineTo(-5, -1); c.moveTo(2, -11); c.lineTo(2, -1); c.stroke();
    c.fillStyle = '#E0AE1C'; c.beginPath(); c.ellipse(10, 0.6, 5, 1.4, 0.1, 0, TAU); c.fill();
  },
  aviator: function(c){
    c.fillStyle = '#7A5230'; c.beginPath(); c.arc(0, 0, 9.5, Math.PI, TAU); c.fill();
    c.fillStyle = '#5E3C20'; c.beginPath(); c.ellipse(-4, 3.4, 4, 6.4, 0.15, 0, TAU); c.fill();
    c.strokeStyle = '#3A2410'; c.lineWidth = 1; c.beginPath(); c.moveTo(-9.4, -1); c.quadraticCurveTo(0, -11, 9.4, -1); c.stroke();
    c.strokeStyle = '#2A1A0C'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-9, -4.4); c.lineTo(9, -4.4); c.stroke();
    [[-1.8, -6.6], [4.4, -6.6]].forEach(function(g){ c.fillStyle = '#C9CDD9'; c.beginPath(); c.arc(g[0], g[1], 3.4, 0, TAU); c.fill(); c.fillStyle = '#2E5A7A'; c.beginPath(); c.arc(g[0], g[1], 2.3, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(g[0] - 0.7, g[1] - 0.8, 0.8, 0, TAU); c.fill(); });
  },
  miner: function(c, t){
    c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0, 0, 9, Math.PI, TAU); c.fill();
    c.fillStyle = '#D9A91E'; c.fillRect(-11, -1.6, 24, 2.8); c.fillRect(-1.6, -9.4, 3.2, 8);
    c.fillStyle = '#3A3A44'; c.beginPath(); c.arc(6, -6, 3.2, 0, TAU); c.fill();
    const k = 0.5 + 0.5 * Math.sin((t || 0) * 5);
    c.fillStyle = 'rgba(255,244,170,' + (0.25 + 0.2 * k).toFixed(2) + ')'; c.beginPath(); c.arc(7.4, -6, 8, 0, TAU); c.fill();
    c.fillStyle = '#FFF6C0'; c.beginPath(); c.arc(6.8, -6, 2.2, 0, TAU); c.fill();
  }
};
const TOWN_HAT_TOP = {
  conductor: function(c){ c.fillStyle = '#22305C'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#10183A'; c.beginPath(); c.arc(0, 0, 4.5, 0, TAU); c.fill(); c.fillStyle = '#14102A'; c.beginPath(); c.ellipse(9, 0, 5, 7, 0, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(7, 0, 1.6, 0, TAU); c.fill(); },
  beret: function(c){ c.fillStyle = '#C4382F'; c.beginPath(); c.ellipse(1, 0.5, 11, 9.5, -0.3, 0, TAU); c.fill(); c.fillStyle = '#7A1F1A'; c.beginPath(); c.arc(1, 0.5, 1.8, 0, TAU); c.fill(); },
  souwester: function(c){ c.fillStyle = '#E0AE1C'; c.beginPath(); c.ellipse(-3, 0, 11, 10, 0, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.fillStyle = '#B8860B'; c.fillRect(-1, -8, 1.5, 16); },
  aviator: function(c){ c.fillStyle = '#7A5230'; c.beginPath(); c.arc(0, 0, 9.4, 0, TAU); c.fill(); c.fillStyle = '#5E3C20'; c.beginPath(); c.ellipse(-4, -9, 3, 5, 0, 0, TAU); c.ellipse(-4, 9, 3, 5, 0, 0, TAU); c.fill(); c.fillStyle = '#C9CDD9'; c.beginPath(); c.arc(7, -3.6, 3, 0, TAU); c.arc(7, 3.6, 3, 0, TAU); c.fill(); c.fillStyle = '#2E5A7A'; c.beginPath(); c.arc(7, -3.6, 1.9, 0, TAU); c.arc(7, 3.6, 1.9, 0, TAU); c.fill(); },
  miner: function(c, t){ c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#D9A91E'; c.fillRect(-9, -1.5, 18, 3); c.fillStyle = 'rgba(255,244,170,.35)'; c.beginPath(); c.arc(10, 0, 8, 0, TAU); c.fill(); c.fillStyle = '#FFF6C0'; c.beginPath(); c.arc(8, 0, 2.4, 0, TAU); c.fill(); }
};
const TOWN_BOOT_SIDE = {
  roller: function(c){
    c.fillStyle = '#F4F6FA'; c.strokeStyle = '#9FB0C4'; c.beginPath(); c.rect(-4.8, -9, 9.6, 10.5); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(3, 2.4, 7.8, 3.6, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#D5352B'; c.fillRect(-4.8, -9, 9.6, 2.4);
    c.fillStyle = '#3A3A44'; c.fillRect(-5.4, 5.4, 17, 1.8);
    [-3.4, 0.6, 5, 9] .forEach(function(x){ c.fillStyle = '#26201C'; c.beginPath(); c.arc(x, 8.2, 2.1, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(x, 8.2, 0.9, 0, TAU); c.fill(); });
    c.fillStyle = '#D5352B'; c.beginPath(); c.arc(11.4, 5.2, 1.5, 0, TAU); c.fill();
  },
  dock: function(c){
    c.fillStyle = '#4B6A82'; c.strokeStyle = '#2A3E50'; c.beginPath(); c.rect(-4.8, -9, 9.6, 10.5); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(3, 3, 7.8, 4, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#F2C230'; c.fillRect(-5.4, -10, 10.8, 3.2); c.fillStyle = '#C79A1C'; c.fillRect(-5.4, -7.2, 10.8, 0.9);
    c.fillStyle = '#1B2630'; c.fillRect(-4.8, 5.2, 14.6, 2.2);
    c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-2.8, -5, 1.6, 6);
  },
  moon: function(c){
    c.fillStyle = '#C9CDD9'; c.strokeStyle = '#7C8294'; c.beginPath(); c.roundRect(-6.6, -11, 13.2, 14, 3); c.fill(); c.stroke();
    c.fillStyle = '#E8EAF0'; c.beginPath(); c.ellipse(3, 4.4, 9.4, 5.2, 0, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = '#9AA0B2'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-6, -7); c.lineTo(6, -7); c.moveTo(-6, -3.4); c.lineTo(6, -3.4); c.stroke();
    c.fillStyle = '#6FF0DC'; c.fillRect(-6.6, 0, 13.2, 1.8);
    c.fillStyle = '#2A4A8A'; c.fillRect(-5.4, 7.2, 16, 3.2);
  }
};
const TOWN_BOOT_TOP = {
  roller: function(c){ c.fillStyle = '#F4F6FA'; c.strokeStyle = '#9FB0C4'; c.beginPath(); c.ellipse(0.5, 0, 7.4, 4.6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#D5352B'; c.beginPath(); c.ellipse(-4.4, 0, 2, 4, 0, 0, TAU); c.fill(); c.fillStyle = '#26201C'; [[-6, -5], [-6, 5], [7, -5], [7, 5]].forEach(function(w){ c.beginPath(); c.arc(w[0], w[1], 1.8, 0, TAU); c.fill(); }); },
  dock: function(c){ c.fillStyle = '#4B6A82'; c.strokeStyle = '#2A3E50'; c.beginPath(); c.ellipse(0.5, 0, 7.6, 5.4, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#F2C230'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(-2.6, 0, 3.4, 5.2, 0, 0, TAU); c.stroke(); },
  moon: function(c){ c.fillStyle = '#E8EAF0'; c.strokeStyle = '#7C8294'; c.beginPath(); c.ellipse(1, 0, 8.6, 6.4, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#6FF0DC'; c.lineWidth = 2; c.beginPath(); c.ellipse(-2.4, 0, 3.6, 5.8, 0, 0, TAU); c.stroke(); c.fillStyle = '#2A4A8A'; c.beginPath(); c.ellipse(5.4, 0, 2.2, 4, 0, 0, TAU); c.fill(); }
};
(function(){
  const hs = drawHatSide, ht = drawHatTop, bs = drawBootSide, bt = drawBootTop;
  drawHatSide = function(ctx, id, t){ const f = TOWN_HAT_SIDE[id]; if (!f) return hs(ctx, id, t); ctx.save(); ctx.lineJoin = 'round'; f(ctx, t); ctx.restore(); };
  drawHatTop = function(ctx, id, t){ const f = TOWN_HAT_TOP[id]; if (!f) return ht(ctx, id, t); ctx.save(); ctx.lineJoin = 'round'; f(ctx, t); ctx.restore(); };
  drawBootSide = function(ctx, id, t, moving){ const f = TOWN_BOOT_SIDE[id]; if (!f) return bs(ctx, id, t, moving); ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1; f(ctx, t); ctx.restore(); };
  drawBootTop = function(ctx, id, t, moving){ const f = TOWN_BOOT_TOP[id]; if (!f) return bt(ctx, id, t, moving); ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1; f(ctx, t); ctx.restore(); };
})();

/* ---- the best friends' gifts: twelve more (eight hats, four boots) ----
   Each of the sixteen people gives exactly one thing when she becomes a best friend: a hat, boots or a colour (see TOWN_GIFT_OF in
   js/44zb-town-interiors.js). The four colours are WARD 32 to 35 (WARD_TOWN in 44e-wardrobe.js). Photo codes are version 3 for these:
   6 bits for accessories and colours (44p-photo-share.js), and version 2 codes are still read. */
[
  { id: 'bicorne', name: 'Mayor\u2019s Bicorne', c: '#1E1E26' }, { id: 'bow', name: 'Tilly\u2019s Big Bow', c: '#F29AC0' }, { id: 'visor', name: 'Photographer\u2019s Visor', c: '#5FBF6A' },
  { id: 'nightcap', name: 'Stargazer\u2019s Nightcap', c: '#26307A' }, { id: 'bonnet', name: 'Granny\u2019s Bonnet', c: '#F4E3C0' }, { id: 'mortarboard', name: 'Scholar\u2019s Mortarboard', c: '#22222A' },
  { id: 'welder', name: 'Welder\u2019s Mask', c: '#3A3A44' }, { id: 'antennahat', name: 'Antenna Cap', c: '#6A8AC0' }
].forEach(function(h){ h.kind = 'hat'; h.rare = false; h.p = 0; h.town = true; ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[h.id] = h; });
[
  { id: 'hightops', name: 'Neon High-tops', c: '#FF4D8D' }, { id: 'waders', name: 'Fishing Waders', c: '#5A6A3A' }, { id: 'clogs', name: 'Wooden Clogs', c: '#B8864E' }, { id: 'felt', name: 'Felt Winter Boots', c: '#9A9AA6' }
].forEach(function(b){ b.kind = 'boot'; b.rare = false; b.p = 0; b.town = true; ACC.townBoots.push(b); ACC_ITEMS.push(b); ACC_BY_ID[b.id] = b; });
Object.assign(TOWN_HAT_SIDE, {
  bicorne: function(c){
    c.fillStyle = '#1E1E26'; c.beginPath(); c.moveTo(-15, -0.5); c.quadraticCurveTo(-9, -15, -1, -8); c.quadraticCurveTo(7, -15, 15, -0.5); c.quadraticCurveTo(0, 4, -15, -0.5); c.fill();
    c.strokeStyle = '#C9A24A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-15, -0.5); c.quadraticCurveTo(0, 4, 15, -0.5); c.stroke();
    c.fillStyle = '#D5352B'; c.beginPath(); c.arc(11, -3.4, 2.2, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(11, -3.4, 0.9, 0, TAU); c.fill();
  },
  bow: function(c){
    c.strokeStyle = '#D77FA3'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8.6, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.fillStyle = '#F29AC0'; c.beginPath(); c.ellipse(-6.4, -10, 6.6, 4.4, -0.5, 0, TAU); c.ellipse(6.4, -10, 6.6, 4.4, 0.5, 0, TAU); c.fill();
    c.fillStyle = '#E86A9A'; c.beginPath(); c.arc(0, -9.4, 2.6, 0, TAU); c.fill();
  },
  visor: function(c){
    c.fillStyle = '#2E2E34'; c.fillRect(-9, -3.6, 19, 3.6);
    c.fillStyle = 'rgba(95,191,106,.85)'; c.beginPath(); c.moveTo(2, -3.6); c.lineTo(17, -0.4); c.lineTo(15, 2); c.lineTo(2, 0); c.closePath(); c.fill();
    c.strokeStyle = '#2F7A3A'; c.lineWidth = 0.8; c.stroke();
  },
  nightcap: function(c){
    c.fillStyle = '#26307A'; c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-8, -15, 4, -16); c.quadraticCurveTo(14, -17, 14, -8); c.quadraticCurveTo(14, -4, 18, 2); c.lineTo(11, 0); c.closePath(); c.fill();
    c.fillStyle = '#F4F6FA'; c.fillRect(-8.6, -2.8, 20, 3.2); c.beginPath(); c.arc(18, 2.6, 3, 0, TAU); c.fill();
    c.fillStyle = '#FFD84D'; [[-2, -9], [4, -12], [8, -6]].forEach(function(s){ c.beginPath(); c.arc(s[0], s[1], 1.1, 0, TAU); c.fill(); });
  },
  bonnet: function(c){
    c.fillStyle = '#F4E3C0'; c.beginPath(); c.arc(0, 0, 9, Math.PI, TAU); c.fill();
    c.fillStyle = '#FFFFFF'; for (let k = 0; k < 6; k++){ c.beginPath(); c.arc(-9 + k * 3.6, 1, 2.4, 0, TAU); c.fill(); }
    c.fillStyle = '#6A9AD0'; c.fillRect(-9, -3.6, 18, 2); c.beginPath(); c.moveTo(0, -3); c.lineTo(5, 3); c.lineTo(2, 4); c.closePath(); c.fill();
  },
  mortarboard: function(c){
    c.fillStyle = '#22222A'; c.beginPath(); c.moveTo(-14, -9); c.lineTo(2, -14); c.lineTo(15, -9); c.lineTo(-1, -5); c.closePath(); c.fill();
    c.fillRect(-7, -9, 12, 9);
    c.strokeStyle = '#F2C230'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(1, -9.4); c.lineTo(12, -8); c.lineTo(12, -1); c.stroke(); c.fillStyle = '#F2C230'; c.fillRect(10.6, -2, 2.8, 5);
  },
  welder: function(c){
    c.fillStyle = '#3A3A44'; c.beginPath(); c.roundRect(-9, -13, 20, 13, 3); c.fill();
    c.fillStyle = '#2A8A9A'; c.fillRect(-5, -9, 12, 6); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-4, -8.4, 4, 2);
    c.fillStyle = '#D5352B'; c.fillRect(-9, -2.4, 20, 2.4);
  },
  antennahat: function(c, t){
    c.fillStyle = '#6A8AC0'; c.beginPath(); c.arc(0, 0, 8.6, Math.PI, TAU); c.fill(); c.fillStyle = '#4A6A9A'; c.fillRect(-9, -2.6, 18, 2.6);
    c.strokeStyle = '#C9CDD9'; c.lineWidth = 1.2; const w = Math.sin((t || 0) * 5) * 1.4;
    [[-3, -4], [3, 4]].forEach(function(a){ c.beginPath(); c.moveTo(a[0], -8); c.quadraticCurveTo(a[0] + a[1] * 0.6 + w, -14, a[0] + a[1], -19); c.stroke(); c.fillStyle = '#FF4A3C'; c.beginPath(); c.arc(a[0] + a[1], -19.4, 1.8, 0, TAU); c.fill(); });
  }
});
Object.assign(TOWN_HAT_TOP, {
  bicorne: function(c){ c.fillStyle = '#1E1E26'; c.beginPath(); c.ellipse(0, 0, 8, 12, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9A24A'; c.lineWidth = 1; c.stroke(); },
  bow: function(c){ c.fillStyle = '#F29AC0'; c.beginPath(); c.ellipse(1, -6, 5, 3.4, 0.5, 0, TAU); c.ellipse(1, 6, 5, 3.4, -0.5, 0, TAU); c.fill(); c.fillStyle = '#E86A9A'; c.beginPath(); c.arc(1, 0, 2.6, 0, TAU); c.fill(); },
  visor: function(c){ c.fillStyle = '#2E2E34'; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.fillStyle = 'rgba(95,191,106,.85)'; c.beginPath(); c.ellipse(9, 0, 6, 8, 0, 0, TAU); c.fill(); },
  nightcap: function(c){ c.fillStyle = '#26307A'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#F4F6FA'; c.beginPath(); c.arc(-9, 6, 3.4, 0, TAU); c.fill(); },
  bonnet: function(c){ c.fillStyle = '#F4E3C0'; c.beginPath(); c.arc(0, 0, 9.4, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(8, 0, 4, 0, TAU); c.fill(); },
  mortarboard: function(c){ c.fillStyle = '#22222A'; c.save(); c.rotate(0.6); c.fillRect(-10, -10, 20, 20); c.restore(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.fill(); },
  welder: function(c){ c.fillStyle = '#3A3A44'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#2A8A9A'; c.fillRect(2, -6, 8, 12); },
  antennahat: function(c){ c.fillStyle = '#6A8AC0'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#FF4A3C'; c.beginPath(); c.arc(-1, -3.4, 2, 0, TAU); c.arc(-1, 3.4, 2, 0, TAU); c.fill(); }
});
Object.assign(TOWN_BOOT_SIDE, {
  hightops: function(c){
    c.fillStyle = '#F4F6FA'; c.strokeStyle = '#B8B8C8'; c.beginPath(); c.rect(-4.8, -12.5, 9.6, 14); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 7.8, 4, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#FF4D8D'; c.fillRect(-4.8, -12.5, 9.6, 2.6); c.fillRect(-4.8, -5, 9.6, 1.6);
    c.fillStyle = '#6BFF8D'; c.fillRect(-5.4, 5.2, 15, 2.6);
    c.strokeStyle = '#FF4D8D'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 4; k++){ c.moveTo(-3, -9 + k * 2.6); c.lineTo(3, -8 + k * 2.6); }; c.stroke();
  },
  waders: function(c){
    c.fillStyle = '#5A6A3A'; c.strokeStyle = '#3A4A22'; c.beginPath(); c.rect(-5.2, -15, 10.4, 16.5); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 7.8, 4, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#26301A'; c.fillRect(-5.4, 5.2, 15, 2.2);
    c.fillStyle = '#F2C230'; c.fillRect(-5.2, -9, 10.4, 2); c.fillStyle = '#C9CDD9'; c.fillRect(-1, -9.6, 3, 3.2);
    c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(-3.4, -13, 1.6, 9);
  },
  clogs: function(c){
    c.fillStyle = '#B8864E'; c.strokeStyle = '#7A5230'; c.beginPath(); c.ellipse(1, 2, 10.5, 5.6, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-3, -2, 5, 5, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#7A5230'; c.fillRect(-5, 5.6, 14, 2); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(4, -0.6, 4, 1.2, 0, 0, TAU); c.fill();
  },
  felt: function(c){
    c.fillStyle = '#9A9AA6'; c.strokeStyle = '#6A6A78'; c.beginPath(); c.rect(-5.2, -10, 10.4, 11.5); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 8, 4.2, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#F4F1E8'; for (let k = 0; k < 5; k++){ c.beginPath(); c.arc(-4 + k * 2.2, -10.4, 2.4, 0, TAU); c.fill(); }
    c.fillStyle = '#E8DCC0'; c.fillRect(-5.4, 5.2, 15, 2.4);
  }
});
Object.assign(TOWN_BOOT_TOP, {
  hightops: function(c){ c.fillStyle = '#F4F6FA'; c.strokeStyle = '#B8B8C8'; c.beginPath(); c.ellipse(0.5, 0, 7.4, 5, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#FF4D8D'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-3, -3); c.lineTo(3, 3); c.moveTo(-3, 3); c.lineTo(3, -3); c.stroke(); },
  waders: function(c){ c.fillStyle = '#5A6A3A'; c.strokeStyle = '#3A4A22'; c.beginPath(); c.ellipse(0.5, 0, 7.6, 5.6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#F2C230'; c.fillRect(-3, -5, 2, 10); },
  clogs: function(c){ c.fillStyle = '#B8864E'; c.strokeStyle = '#7A5230'; c.beginPath(); c.ellipse(1, 0, 8.4, 5.4, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(2, -1.6, 3, 1, 0, 0, TAU); c.fill(); },
  felt: function(c){ c.fillStyle = '#9A9AA6'; c.beginPath(); c.ellipse(0.5, 0, 7.6, 5.4, 0, 0, TAU); c.fill(); c.strokeStyle = '#F4F1E8'; c.lineWidth = 3; c.beginPath(); c.ellipse(-2.4, 0, 3.4, 5.4, 0, 0, TAU); c.stroke(); }
});
