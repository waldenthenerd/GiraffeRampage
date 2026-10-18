'use strict';
/* Longneck Town, sixteenth part: things worth going to the sea, the sky and the villages for. */
/* ========================= 44zs. EXPLORER'S FINDS ========================= */
/* Eight hats and boots and six coat colours, each found once and found only out there:
   THE AIR (3): a gift balloon drifting high over the Savannah (Cloud Crown), one low over the fields (Rocket Boots), one near the farm (Jet Stream).
   THE SEA (4): a chest on each of four islets (Pirate Tricorne, Flippers, Seafoam, Coral Reef): sail up to the beach. The sea chart marks the
     ones you have not opened with a gold star once you have charted that bit of sea.
   HAYFIELD VILLAGE (4): the Scarecrow Hat on the scarecrow, Wellington Boots in the barn, Cornfield in the farmhouse, Harvest Orange in the coop.
   DRIFTWOOD COVE (3): Beach Sandals under the palms, the Shell Crown in the lighthouse, Shell Pink on the crab tank.
   The village ones are ordinary town items (TOWN_ITEMS); the air and sea ones are listed in TOWN_SPECIAL_SRC so the Gear page can say where they are.
   Colours are WARD 36 to 41 (WARD_TOWN in 44e-wardrobe.js); the save keeps each one as town.found[id]. */
const TOWN_SPECIAL_SRC = {
  cloudcrown: 'Found in the air: a gift balloon high over the Savannah.', rocketb: 'Found in the air: a gift balloon low over the fields.', fl_sw: 'Found in the air: a gift balloon near the farm.',
  tricorne: 'Found at sea: a chest on an islet to the south.', flippers: 'Found at sea: a chest on an islet to the south-east.', sea_sw1: 'Found at sea: a chest on an islet to the south-west.', sea_sw2: 'Found at sea: a chest on an islet to the east.'
};
(function(){
  [{ id: 'cloudcrown', name: 'Cloud Crown', c: '#E8F4FF' }, { id: 'tricorne', name: 'Pirate Tricorne', c: '#2A2A34' }, { id: 'scarecrowhat', name: 'Scarecrow Hat', c: '#8A6A32' }, { id: 'shellcrown', name: 'Shell Crown', c: '#F4C4D0' }].forEach(function(o){
    const h = { id: o.id, name: o.name, c: o.c, kind: 'hat', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[o.id] = h; }
  });
  [{ id: 'rocketb', name: 'Rocket Boots', c: '#D5352B' }, { id: 'flippers', name: 'Flippers', c: '#2FA0C8' }, { id: 'wellies', name: 'Wellington Boots', c: '#4E8A3A' }, { id: 'sandals', name: 'Beach Sandals', c: '#E8C070' }].forEach(function(o){
    const b = { id: o.id, name: o.name, c: o.c, kind: 'boot', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townBoots.push(b); ACC_ITEMS.push(b); ACC_BY_ID[o.id] = b; }
  });
  Object.assign(TOWN_HAT_SIDE, {
    cloudcrown: function(c, t){
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-5, -4, 5.4, 0, TAU); c.arc(2, -7, 6.6, 0, TAU); c.arc(9, -4, 5.4, 0, TAU); c.fill(); c.fillRect(-10, -4, 20, 4);
      c.fillStyle = '#C9E4FF'; c.fillRect(-10, -1.6, 20, 1.8); c.fillStyle = '#FFD84D'; const s = 0.6 + 0.4 * Math.sin((t || 0) * 4); c.beginPath(); c.arc(2, -13, 1.2 + s, 0, TAU); c.fill();
    },
    tricorne: function(c){
      c.fillStyle = '#2A2A34'; c.beginPath(); c.moveTo(-15, -1); c.quadraticCurveTo(-8, -11, 0, -12); c.quadraticCurveTo(10, -11, 16, -1); c.quadraticCurveTo(0, 3, -15, -1); c.fill();
      c.strokeStyle = '#C9A24A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-15, -1); c.quadraticCurveTo(0, 3, 16, -1); c.stroke();
      c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(1, -6, 2.6, 0, TAU); c.fill(); c.fillStyle = '#2A2A34'; c.fillRect(-0.4, -7.6, 0.8, 3); c.fillRect(-1.6, -6.4, 3.2, 0.8);
    },
    scarecrowhat: function(c){
      c.fillStyle = '#8A6A32'; c.beginPath(); c.ellipse(1, -0.6, 14, 2.6, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-6, -1); c.lineTo(-4, -11); c.lineTo(7, -11); c.lineTo(9, -1); c.closePath(); c.fill();
      c.strokeStyle = '#5A4A1E'; c.lineWidth = 0.9; for (let k = -5; k <= 7; k += 3){ c.beginPath(); c.moveTo(k, -1); c.lineTo(k * 0.8 + 0.4, -10); c.stroke(); } c.fillStyle = '#C9503C'; c.fillRect(-6, -4, 15, 2.2);
      c.strokeStyle = '#E8C070'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-13, 3); c.moveTo(12, 0); c.lineTo(16, 3); c.stroke();
    },
    shellcrown: function(c){
      c.strokeStyle = '#E8A0B0'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8.4, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      [[-7, -5, 0.6], [-2.4, -9.4, 0.2], [3, -9, -0.2], [7.6, -5, -0.6]].forEach(function(s){ c.save(); c.translate(s[0], s[1]); c.rotate(s[2]); c.fillStyle = '#F4C4D0'; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(-5, -1, -3.6, -5); c.quadraticCurveTo(0, -7, 3.6, -5); c.quadraticCurveTo(5, -1, 0, 4); c.fill(); c.strokeStyle = '#E8A0B0'; c.lineWidth = 0.7; for (let k = -2; k <= 2; k++){ c.beginPath(); c.moveTo(0, 3.4); c.lineTo(k * 1.4, -5); c.stroke(); } c.restore(); });
    }
  });
  Object.assign(TOWN_HAT_TOP, {
    cloudcrown: function(c){ c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-3, -3, 5, 0, TAU); c.arc(3, 3, 5, 0, TAU); c.arc(-3, 4, 4, 0, TAU); c.arc(4, -4, 4, 0, TAU); c.fill(); c.fillStyle = '#C9E4FF'; c.beginPath(); c.arc(0, 0, 4, 0, TAU); c.fill(); },
    tricorne: function(c){ c.fillStyle = '#2A2A34'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(2, -11); c.lineTo(12, 0); c.lineTo(2, 11); c.closePath(); c.fill(); c.strokeStyle = '#C9A24A'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(2, 0, 2, 0, TAU); c.fill(); },
    scarecrowhat: function(c){ c.fillStyle = '#8A6A32'; c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.fill(); c.fillStyle = '#6A5022'; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill(); c.strokeStyle = '#C9503C'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.stroke(); },
    shellcrown: function(c){ c.fillStyle = '#F4C4D0'; for (let i = 0; i < 6; i++){ c.beginPath(); c.arc(Math.cos(i * 1.05) * 6, Math.sin(i * 1.05) * 6, 3.6, 0, TAU); c.fill(); } c.strokeStyle = '#E8A0B0'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.stroke(); }
  });
  Object.assign(TOWN_BOOT_SIDE, {
    rocketb: function(c, t){
      c.fillStyle = '#D5352B'; c.strokeStyle = '#8A1F18'; c.beginPath(); c.rect(-5, -12, 10, 13.5); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 7.8, 4, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#F4F1E8'; c.fillRect(-5, -8, 10, 2); c.fillStyle = '#3A3A44'; c.fillRect(-5.4, 5.2, 15, 2.2);
      const f = 0.6 + 0.4 * Math.sin((t || 0) * 18); c.fillStyle = '#FF9A3A'; c.beginPath(); c.moveTo(-5, 7.4); c.lineTo(-9 - f * 2, 10 + f * 3); c.lineTo(-2, 7.4); c.fill(); c.fillStyle = '#FFE27A'; c.beginPath(); c.moveTo(-4, 7.4); c.lineTo(-6, 9 + f); c.lineTo(-2.4, 7.4); c.fill();
    },
    flippers: function(c){
      c.fillStyle = '#2FA0C8'; c.strokeStyle = '#1E6E8E'; c.beginPath(); c.moveTo(-4, -3); c.lineTo(-4, 3); c.lineTo(8, 1); c.lineTo(16, 5); c.lineTo(15, 8); c.lineTo(-2, 8); c.lineTo(-6, 3); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#8AD8F0'; c.lineWidth = 1; for (let k = 0; k < 4; k++){ c.beginPath(); c.moveTo(6 + k * 2.4, 3 + k * 0.8); c.lineTo(8 + k * 2.4, 7.4); c.stroke(); } c.fillStyle = '#1E6E8E'; c.fillRect(-4.6, -12, 9, 9);
    },
    wellies: function(c){
      c.fillStyle = '#4E8A3A'; c.strokeStyle = '#2E5A22'; c.beginPath(); c.rect(-5.2, -14, 10.4, 15.5); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 7.8, 4, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#1E3A12'; c.fillRect(-5.4, 5.2, 15, 2.2); c.fillStyle = '#3A6A2A'; c.fillRect(-5.2, -14, 10.4, 2.4); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-3.6, -11, 1.8, 10);
    },
    sandals: function(c){
      c.fillStyle = '#E8C070'; c.strokeStyle = '#A8802E'; c.beginPath(); c.ellipse(2, 5, 10, 3.2, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#C9503C'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-3, 4); c.lineTo(2, -3); c.lineTo(7, 4); c.stroke(); c.beginPath(); c.moveTo(-4, -7); c.lineTo(4, -7); c.stroke();
      c.strokeStyle = '#C9A062'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -3); c.lineTo(0, -12); c.stroke();
    }
  });
  Object.assign(TOWN_BOOT_TOP, {
    rocketb: function(c){ c.fillStyle = '#D5352B'; c.strokeStyle = '#8A1F18'; c.beginPath(); c.ellipse(0.5, 0, 7.6, 5.4, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#F4F1E8'; c.fillRect(-3, -5, 2.4, 10); },
    flippers: function(c){ c.fillStyle = '#2FA0C8'; c.strokeStyle = '#1E6E8E'; c.beginPath(); c.moveTo(-3, -3); c.lineTo(8, -4); c.lineTo(16, -8); c.lineTo(16, 8); c.lineTo(8, 4); c.lineTo(-3, 3); c.closePath(); c.fill(); c.stroke(); },
    wellies: function(c){ c.fillStyle = '#4E8A3A'; c.strokeStyle = '#2E5A22'; c.beginPath(); c.ellipse(0.5, 0, 7.6, 5.6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-1, -2, 3, 1.2, 0, 0, TAU); c.fill(); },
    sandals: function(c){ c.fillStyle = '#E8C070'; c.strokeStyle = '#A8802E'; c.beginPath(); c.ellipse(1, 0, 8.4, 5, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#C9503C'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -4); c.lineTo(3, 4); c.moveTo(3, -4); c.lineTo(-3, 4); c.stroke(); }
  });
  /* the village finds */
  [
    { id: 'fm_h1', d: 'farm', t: 'hat', acc: 'scarecrowhat', x: 2230, h: 150, note: 'on the scarecrow’s head, in the cornfield' },
    { id: 'fm_b1', d: 'farm', in: 'in_barn', t: 'boot', acc: 'wellies', x: 1330, h: 0, note: 'in the hay beside the tractor' },
    { id: 'fm_sw1', d: 'farm', in: 'in_fhouse', t: 'swatch', n: 39, x: 700, h: 250, note: 'in the quilt on the farmhouse wall' },
    { id: 'fm_sw2', d: 'farm', in: 'in_coop', t: 'swatch', n: 40, x: 540, h: 230, note: 'on the hen coop’s perch' },
    { id: 'is_b1', d: 'isle', t: 'boot', acc: 'sandals', x: 660, h: 0, note: 'in the sand between the palms' },
    { id: 'is_h1', d: 'isle', in: 'in_ilight', t: 'hat', acc: 'shellcrown', x: 450, h: 269, note: 'on the lighthouse stair rail' },
    { id: 'is_sw1', d: 'isle', in: 'in_icrab', t: 'swatch', n: 41, x: 900, h: 190, note: 'on top of the crab tank' }
  ].forEach(function(it){ TOWN_ITEMS.push(it); TOWN_ITEM_BY_ID[it.id] = it; });
})();

/* ---- granting an air or sea find ---- */
function exploreGrant(sp){
  const t = townData(); if (t.found[sp.id]) return false;
  t.found[sp.id] = 1;
  if (sp.kind === 'swatch'){ townToast('New coat colour: ' + WARD[sp.n].name + '. Find it in Coat colours.', '#FFE9A0'); SFX.transform(); }
  else { const msg = townPay({ acc: sp.acc }); townToast('Found: ' + ACC_BY_ID[sp.acc].name + ' (' + msg + ')', '#FFE9A0'); SFX.level(); }
  Save.write(); return true;
}
function exploreFound(id){ return !!townData().found[id]; }

/* ---- the air: gift balloons ---- */
const AIR_FINDS = [
  { id: 'cloudcrown', kind: 'hat', acc: 'cloudcrown', off: 2400, y: 150, col: '#E8F4FF' },
  { id: 'rocketb', kind: 'boot', acc: 'rocketb', off: 5400, y: 458, col: '#D5352B' },
  { id: 'fl_sw', kind: 'swatch', n: 36, off: 8200, y: 210, col: '#8ED0F0' }
];
function airFindPos(a){ const R = Fly.regions && Fly.regions[1]; return R ? { x: R.x0 + a.off, y: a.y } : null; }
(function(){
  const fx = typeof flyNightFX === 'function' ? flyNightFX : null, up = updateFly;
  flyNightFX = function(ctx, cam, vw, t, dark){
    if (fx) fx.apply(this, arguments);
    AIR_FINDS.forEach(function(a){
      if (exploreFound(a.id)) return;
      const p = airFindPos(a); if (!p || p.x < cam - 100 || p.x > cam + vw + 100) return;
      const by = p.y + Math.sin(t * 1.6 + a.off) * 7;
      const g = ctx.createRadialGradient(p.x, by, 6, p.x, by, 80); g.addColorStop(0, 'rgba(255,240,170,' + (0.4 + 0.2 * Math.sin(t * 3)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - 80, by - 80, 160, 160);
      ctx.strokeStyle = '#6A4A28'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x - 14, by + 20); ctx.lineTo(p.x - 8, by + 38); ctx.moveTo(p.x + 14, by + 20); ctx.lineTo(p.x + 8, by + 38); ctx.stroke();
      tRect(ctx, '#8A5A32', p.x - 9, by + 38, 18, 12);
      ctx.fillStyle = a.col; ctx.beginPath(); ctx.ellipse(p.x, by, 26, 32, 0, 0, TAU); ctx.fill();
      for (let k = -1; k <= 1; k++){ ctx.fillStyle = k % 2 ? '#FFFFFF' : 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(p.x + k * 9, by, 7, 31, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(p.x - 10, by - 12, 5, 10, -0.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFE27A'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('?', p.x, by + 6);
    });
  };
  updateFly = function(dt){
    up(dt);
    if (!Fly.on || Fly.mode !== 'fly') return;
    AIR_FINDS.forEach(function(a){
      if (exploreFound(a.id)) return; const p = airFindPos(a); if (!p) return;
      if (Math.hypot(Fly.x - p.x, Fly.y - (p.y + 4)) < 66){ exploreGrant(a); Fly.pop = { x: p.x, y: p.y, t: 0, txt: 'a gift!' }; }
    });
  };
})();

/* ---- the sea: chests on islets ---- */
const SEA_FINDS = [
  { id: 'tricorne', kind: 'hat', acc: 'tricorne', blob: 5 }, { id: 'flippers', kind: 'boot', acc: 'flippers', blob: 7 },
  { id: 'sea_sw1', kind: 'swatch', n: 37, blob: 9 }, { id: 'sea_sw2', kind: 'swatch', n: 38, blob: 12 }
];
(function(){
  const dfe = seaDrawFeatures, dmap = seaDrawMap, up = updateSea;
  seaDrawFeatures = function(ctx, W, H, z, camX, camY, t){
    dfe.apply(this, arguments);
    SEA_FINDS.forEach(function(f){
      if (exploreFound(f.id)) return;
      const b = SEA_BLOBS[f.blob], p = seaWorldToScreen(b.x, b.y, W, H, z, camX, camY);
      if (p.x < -80 || p.x > W + 80 || p.y < -80 || p.y > H + 80) return;
      const pu = 1 + Math.sin(t * 3 + f.blob) * 0.08;
      tCircle(ctx, 'rgba(255,230,140,' + (0.18 + 0.1 * Math.sin(t * 2.4)).toFixed(2) + ')', p.x, p.y, 54 * z * pu);
      tCircle(ctx, 'rgba(0,0,0,.25)', p.x + 3 * z, p.y + 5 * z, 20 * z);
      tRound(ctx, '#7A5230', p.x - 18 * z, p.y - 12 * z, 36 * z, 24 * z, 4 * z); tRound(ctx, '#9A6A3A', p.x - 18 * z, p.y - 14 * z, 36 * z, 12 * z, 5 * z);
      tRect(ctx, '#C9A24A', p.x - 19 * z, p.y - 5 * z, 38 * z, 3.4 * z); tRect(ctx, '#C9A24A', p.x - 3 * z, p.y - 14 * z, 6 * z, 26 * z); tCircle(ctx, '#2A1E12', p.x, p.y + 1 * z, 2.4 * z);
      ctx.fillStyle = '#FFF6C0'; ctx.fillRect(p.x + 14 * z + Math.sin(t * 4) * 3, p.y - 22 * z, 3, 3);
    });
  };
  updateSea = function(dt){
    up(dt);
    if (!Sea.on) return;
    SEA_FINDS.forEach(function(f){
      if (exploreFound(f.id)) return; const b = SEA_BLOBS[f.blob];
      if (Math.hypot(Sea.x - b.x, Sea.y - b.y) < b.r + 80){ exploreGrant(f); Sea.pop = { x: b.x, y: b.y, t: 0, txt: 'a treasure chest!' }; }
    });
  };
  seaDrawMap = function(ctx, W, H, s){
    dmap.apply(this, arguments);
    if (!Sea.seen) return;
    const ms = Math.min(150 * s, W * 0.3), mx = W - ms - 12, my = H - ms - 12, k = ms / SEA_W;
    SEA_FINDS.forEach(function(f){
      if (exploreFound(f.id)) return; const b = SEA_BLOBS[f.blob];
      if (!Sea.seen[Math.floor(b.x / SEA_MAP_C) + Math.floor(b.y / SEA_MAP_C) * SEA_MAP_N]) return;
      const x = mx + b.x * k, y = my + b.y * k; ctx.fillStyle = '#FFD84D'; ctx.beginPath();
      for (let i = 0; i < 10; i++){ const r = i % 2 ? 2 : 5, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    });
  };
})();

(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>Explorer’s finds:</b> hats, boots and coat colours are hidden further afield. Gift balloons drift over the Savannah (one is high, one is low over the fields, one near the farm); each of four islets in the sea has a treasure chest (sail up to the beach, and the sea chart shows a gold star once you have charted one); and Hayfield Village and Driftwood Cove each hide a few of their own. The Gear page in the journal says where each one is.</li></ul>'); }; }
})();
