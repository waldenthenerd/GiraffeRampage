'use strict';
/* Longneck Town, twelfth part: Hayfield Village, a farming village at the end of the Savannah, reached by plane. */
/* ========================= 44zo. HAYFIELD VILLAGE ========================= */
/* 1 THE STRIP: after the Savannah (or the Changed Savannah) the flight has a short farm region with a dirt landing strip. It ends in a wall of
     hay bales and a rope net: roll into them slowly and she simply stops; hit them fast, or low in the air, and it is a crash. Park on the
     strip with the engine off and she lands at the village; from the village she can take off again, heading back west.
   2 THE VILLAGE (district 'farm', not on the tram or the map): Hollis's corn stand, Marge's barn (cargo), a hen coop (eggs once a day), a
     farmhouse and fields. Two new best-friend gifts: the Corn-husk Hat (Hollis) and the Farmer's Bandana (Marge).
   3 CORN: bought at the stand (a stock of up to 10). In a run, V (or the Corn button) eats one: +15% speed for 60 s, and the cooldown is the
     same 60 s, so the next one can go the moment the boost ends.
   4 CARGO: at the barn she loads sacks of corn, eggs (fragile) or pumpkins (heavy), flies them to the Old Runway in Longneck Town and lands
     there to be paid. A crash loses the load.
   Save.data.town.farm = { corn, cargo: { id, cracked } | null, eggDay, hauls, lost, day }. */
const FARM_STRIP_A = 300, FARM_STRIP_B = 1500, FARM_BALES = 1540, FARM_W = 2600, CORN_CAP = 10, CORN_BOOST = 60, CORN_CD = 60, CORN_MUL = 1.15;
const Corn = { cd: 0, boost: 0 };
const FARM_JOBS = [
  { id: 'corn', name: 'Sacks of corn', pay: { coin: 6 }, note: 'Steady and easy.' },
  { id: 'eggs', name: 'Crates of eggs', pay: { coin: 9, gems: 5 }, note: 'Fragile: a hard landing cracks them and halves the pay.' },
  { id: 'pumpkins', name: 'Pumpkins', pay: { coin: 11 }, note: 'Heavy: the plane climbs and flies a little slower.' }
];
FLY_BIOME[13] = { name: 'Hayfield Farm', g: '#C8B060', g2: '#8A7030', hill: '#9DB46A', tint: ['#FFE9A0', 0.08] };
function farmData(){
  const t = townData();
  if (!t.farm || typeof t.farm !== 'object' || Array.isArray(t.farm)) t.farm = {};
  const f = t.farm;
  f.corn = Math.max(0, Math.min(typeof cornCap === 'function' ? cornCap() : CORN_CAP, f.corn | 0));
  if (f.cargo && typeof f.cargo !== 'object') f.cargo = null;
  if (f.cargo && !FARM_JOBS.some(function(j){ return j.id === f.cargo.id; })) f.cargo = null;
  if (!f.cargo) f.cargo = null;
  f.eggDay = typeof f.eggDay === 'string' ? f.eggDay : '';
  f.hauls = f.hauls | 0; f.lost = f.lost | 0;
  return f;
}
function farmCargoJob(){ const c = farmData().cargo; return c ? FARM_JOBS.filter(function(j){ return j.id === c.id; })[0] : null; }
function cornPrice(){ return Math.max(60, Math.round(townCoin() * 0.6)); }
function cornBoostOn(){ return Corn.boost > 0 && G.state === 'playing'; }

/* ---- corn in a run: the button, the key, the boost ---- */
(function(){
  KEY_ACTIONS.push(['corn', 'Eat corn']); DEFAULT_KEYS.corn = 'KeyV';
  const crm = townCarRunMul;
  townCarRunMul = function(){ return crm() * (cornBoostOn() ? CORN_MUL : 1); };
  function cornReady(){ return G.state === 'playing' && !G.attract && !P.dead && P.hp > 0 && Corn.cd <= 0 && farmData().corn > 0; }
  function cornEat(manual){
    if (!cornReady()){ if (manual) SFX.deny(); return false; }
    const f = farmData(), t = townData();
    f.corn--; t.n.cornEaten = (t.n.cornEaten | 0) + 1; Corn.cd = CORN_CD; Corn.boost = CORN_BOOST; Save.write();
    addText(P.x, P.y - 46, 'corn: +15% speed', '#FFE066', 14, false);
    try { SFX.level(); } catch (e) {}
    return true;
  }
  const tick = Feedback.tick;
  let btn = null, last = '', shown = false;
  function make(){
    btn = document.createElement('button'); btn.id = 'cornBtn'; btn.type = 'button';
    ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ btn.addEventListener(ev, function(e){ e.stopPropagation(); }); });
    btn.addEventListener('click', function(e){ e.stopPropagation(); cornEat(true); });
    document.body.appendChild(btn);
  }
  Feedback.tick = function(dt){
    tick.call(this, dt);
    const playing = G.state === 'playing' && !G.attract;
    if (playing){ if (Corn.cd > 0) Corn.cd = Math.max(0, Corn.cd - dt); if (Corn.boost > 0) Corn.boost = Math.max(0, Corn.boost - dt); }
    const want = playing && (farmData().corn > 0 || Corn.cd > 0);
    if (want !== shown){ if (!btn) make(); shown = want; btn.className = want ? 'on' : ''; }
    if (want && btn){
      const left = Math.ceil(Corn.cd), pct = Math.round(Math.max(0, Corn.cd) / CORN_CD * 50) * 2, n = farmData().corn, boost = Math.ceil(Corn.boost);
      const k = n + '|' + left + '|' + pct + '|' + boost + '|' + (Input.hasTouch ? 't' : keyName(keyOf('corn')));
      if (k !== last){
        btn.innerHTML = '<svg class="bi" viewBox="0 0 40 40" width="26" height="30"><path d="M20 4 C30 8 32 24 20 36 C8 24 10 8 20 4Z" fill="#F2C230"/><path d="M20 6 L20 34 M14 12 L26 12 M12 20 L28 20 M14 28 L26 28" stroke="#C99A1A" stroke-width="1.6"/><path d="M20 38 C8 34 6 22 8 14 C10 24 14 32 20 34Z M20 38 C32 34 34 22 32 14 C30 24 26 32 20 34Z" fill="#5E9E3A"/></svg>' +
          '<span class="bt"><b>x' + n + '</b>' + (boost > 0 ? '<i>boost ' + boost + 's</i>' : left > 0 ? '<i>' + left + 's</i>' : (Input.hasTouch ? '' : '<i>' + keyName(keyOf('corn')) + '</i>')) + '</span><span class="bcd" style="width:' + pct + '%"></span>';
        last = k;
      }
      btn.classList.toggle('cool', left > 0 && boost <= 0); btn.classList.toggle('boost', boost > 0);
    }
  };
  window.addEventListener('keydown', function(e){
    if (e.repeat || G.rebinding || e.code !== keyOf('corn')) return;
    const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return;
    if (G.state === 'playing' && cornEat(true)) e.preventDefault();
  });
  const sr = startRun;
  startRun = function(){ Corn.cd = 0; Corn.boost = 0; return sr.apply(this, arguments); };
})();

/* ---- the flight: the farm region, the strip and the hay bales ---- */
function farmRegion(){ return Fly.regions.filter(function(R){ return R.ch === 13; })[0] || null; }
function farmOnStrip(x){ const R = farmRegion(); return !!R && x >= R.x0 + FARM_STRIP_A && x <= R.x0 + FARM_STRIP_B + 20; }
(function(){
  const fr = flyRegions;
  flyRegions = function(){
    const out = fr();
    out.push({ ch: 13, name: FLY_BIOME[13].name, w: FARM_W, noGate: true, sub: 'Dirt strip: stop before the hay bales' });
    let x = 0; out.forEach(function(r){ r.x0 = x; x += r.w; r.x1 = x; });
    return out;
  };
  const ro = flyOnRunway;
  flyOnRunway = function(x){ return ro(x) || farmOnStrip(x); };
  const ff = flyFeatures, fgd = flyGroundDetail, ft = flyTakeoff, fl = flyLand, fc = flyCrash, up = updateFly, fp = flyPlane, rf = renderFly;
  flyGroundDetail = function(ctx, R, B, x0, x1, t){
    fgd(ctx, R, B, x0, x1, t);
    if (R.ch !== 13) return;
    const gy = FLY_GROUND;
    for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22){ if (x < R.x0 + FARM_STRIP_A - 20 || x > R.x0 + FARM_STRIP_B + 120){ ctx.strokeStyle = 'rgba(60,40,10,.25)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, gy + 10); ctx.lineTo(x - 8, gy + 150); ctx.stroke(); } }
    const a = R.x0 + FARM_STRIP_A, b = R.x0 + FARM_STRIP_B;                                /* the strip itself, cut into the ground */
    ctx.fillStyle = '#C7A670'; ctx.fillRect(a, gy - 3, b - a, 11); ctx.fillStyle = '#A98A56'; ctx.fillRect(a, gy + 6, b - a, 3);
    ctx.fillStyle = '#E8D8B0'; for (let x = a + 24; x < b - 40; x += 70) ctx.fillRect(x, gy + 1, 34, 2.4);
    for (let x = a; x <= b; x += 60){ tCircle(ctx, '#E8E0D0', x, gy + 10, 3); }
  };
  flyFeatures = function(ctx, R, cam, vw, t){
    if (R.ch !== 13) return ff(ctx, R, cam, vw, t);
    const gyA = flyGroundY, base = R.x0, a = Math.max(R.x0 + 10, cam - 220), b = Math.min(R.x1 - 10, cam + vw + 220);
    /* fields of corn, in rows, either side of the strip and beyond the hay bales */
    for (let x = Math.floor(a / 26) * 26; x < b; x += 26){
      const loc = x - base; if ((loc > FARM_STRIP_A - 40 && loc < FARM_BALES + 160) || loc < 160) continue;
      const h = 46 + flyH(x / 26, 120) * 24, gy = gyA(x), sway = Math.sin(t * 1.6 + x * 0.03) * 2;
      ctx.strokeStyle = '#5E9E3A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, gy + 2); ctx.lineTo(x + sway, gy - h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, gy - h * 0.45); ctx.lineTo(x - 11 + sway, gy - h * 0.7); ctx.moveTo(x, gy - h * 0.6); ctx.lineTo(x + 11 + sway, gy - h * 0.85); ctx.stroke();
      tEll(ctx, '#F2C230', x + 4 + sway, gy - h * 0.55, 3, 7);
    }
    /* the strip's furniture: a windsock, a sign on the ground, and the hay-bale wall with its net */
    const sx = base + FARM_STRIP_A + 120, sg = gyA(sx);
    tRect(ctx, '#5A3B22', sx - 1.5, sg - 70, 3, 70); ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(sx, sg - 70); ctx.lineTo(sx + 34 + Math.sin(t * 2) * 6, sg - 64); ctx.lineTo(sx, sg - 54); ctx.fill();
    const ex = base + FARM_BALES;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - (row > 1 ? 1 : 0); k++){
      const bx = ex + k * 42 + (row % 2) * 10, by = gyA(ex) - 28 * (row + 1) + 4;
      tRound(ctx, '#D9B857', bx, by, 42, 28, 4); tRect(ctx, '#A8872E', bx + 8, by, 3, 28); tRect(ctx, '#A8872E', bx + 28, by, 3, 28); tRect(ctx, 'rgba(255,255,255,.2)', bx + 2, by + 3, 36, 3);
    }
    const g0 = gyA(ex);
    tRect(ctx, '#D5352B', ex - 6, g0 - 130, 7, 130); tRect(ctx, '#F4F1E8', ex - 6, g0 - 100, 7, 18); tRect(ctx, '#F4F1E8', ex - 6, g0 - 56, 7, 18);
    tRect(ctx, '#D5352B', ex + 132, g0 - 130, 7, 130); tRect(ctx, '#F4F1E8', ex + 132, g0 - 100, 7, 18); tRect(ctx, '#F4F1E8', ex + 132, g0 - 56, 7, 18);
    ctx.strokeStyle = 'rgba(240,235,215,.7)'; ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i++){ ctx.beginPath(); ctx.moveTo(ex + i * 13.5, g0 - 130); ctx.lineTo(ex + i * 13.5 + Math.sin(t * 2 + i) * 1.5, g0 - 84); ctx.stroke(); }
    for (let j = 0; j < 4; j++){ ctx.beginPath(); ctx.moveTo(ex, g0 - 130 + j * 13); ctx.lineTo(ex + 135, g0 - 130 + j * 13 + 2); ctx.stroke(); }
    ctx.fillStyle = '#FFF6E0'; ctx.font = '800 14px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('STOP', ex + 67, g0 - 138);
    /* the village behind it: a barn, a silo, a windmill, a scarecrow, cows */
    const vx = ex + 330, vg = gyA(vx);
    tRect(ctx, '#B8453A', vx, vg - 90, 130, 90); tPoly(ctx, '#8A2E2A', [vx - 10, vg - 90, vx + 65, vg - 140, vx + 140, vg - 90]); tRect(ctx, '#F4F1E8', vx + 44, vg - 60, 42, 60); tRect(ctx, '#3A2A1E', vx + 49, vg - 56, 32, 56);
    ctx.strokeStyle = '#F4F1E8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(vx + 49, vg - 56); ctx.lineTo(vx + 81, vg); ctx.moveTo(vx + 81, vg - 56); ctx.lineTo(vx + 49, vg); ctx.stroke();
    tRound(ctx, '#C9CDD9', vx + 150, vg - 120, 34, 120, 14); tPoly(ctx, '#8A93A8', [vx + 146, vg - 118, vx + 167, vg - 144, vx + 188, vg - 118]);
    const wx = vx + 260; tPoly(ctx, '#6A6F78', [wx - 12, vg, wx - 2, vg - 90, wx + 2, vg - 90, wx + 12, vg]); ctx.save(); ctx.translate(wx, vg - 92); ctx.rotate(t * 1.2); for (let i = 0; i < 6; i++){ ctx.rotate(Math.PI / 3); tRect(ctx, '#E8E0D0', 0, -2, 32, 4); } ctx.restore();
    const cx = vx + 360; tRect(ctx, '#5A3B22', cx - 1.5, vg - 56, 3, 56); tRect(ctx, '#5A3B22', cx - 20, vg - 46, 40, 3); tCircle(ctx, '#E8D8A0', cx, vg - 62, 7); tPoly(ctx, '#8A4A2A', [cx - 10, vg - 66, cx + 10, vg - 66, cx, vg - 84]);
    for (let k = 0; k < 3; k++){ const px = base + 160 + k * 30 + Math.sin(t * 0.3 + k) * 16, py = gyA(px); tEll(ctx, '#F4F1E8', px, py - 12, 15, 9); tCircle(ctx, '#2A2A34', px - 4, py - 14, 3.4); tEll(ctx, '#F4F1E8', px + 14, py - 17, 6, 5); tRect(ctx, '#2A2A34', px - 9, py - 4, 2.4, 6); tRect(ctx, '#2A2A34', px + 6, py - 4, 2.4, 6); }
  };
  flyTakeoff = function(){
    const r = ft.apply(this, arguments);
    const c = farmData().cargo;
    if (Fly.on && c && c.id === 'pumpkins'){ FV.max *= 0.9; FV.cruise *= 0.94; FV.climb *= 0.85; }
    return r;
  };
  /* landing: at the farm, or on the Old Runway (where cargo is paid) */
  let rest = 0;
  updateFly = function(dt){
    const R = farmRegion();
    if (Fly.on && Fly.mode === 'fly' && R){
      if (Fly.onGround && farmOnStrip(Fly.x)) Fly.v = Math.max(0, Fly.v - 26 * dt);       /* dirt drags a little */
    }
    const c = farmData().cargo;
    up(dt);
    if (!Fly.on || Fly.mode !== 'fly') { rest = 0; return; }
    if (c && c.id === 'eggs' && Fly.shake > 0.25 && !c.cracked){ c.cracked = true; Save.write(); townToast('A hard bump: some of the eggs cracked.', '#FFB89A'); }
    if (R){
      const bx = R.x0 + FARM_BALES, alt = FLY_GROUND - 46 - Fly.y;
      if (Fly.x > bx - 26 && Fly.x < bx + 150){
        if (Fly.onGround){
          if (Fly.v > 140){ flyCrash('the hay bales'); return; }
          Fly.x = bx - 26; if (Fly.v > 30) Fly.shake = Math.max(Fly.shake, 0.3); Fly.v = 0;
        } else if (alt < 70){ flyCrash('the hay bales'); return; }
      }
      if (Fly.onGround && Fly.v < 6 && Fly.thr < 0.08 && farmOnStrip(Fly.x) && Fly.t > 6){ rest += dt; if (rest > 1.2){ rest = 0; farmLand(); return; } } else rest = 0;
    }
  };
  flyCrash = function(why){
    const f = farmData();
    if (f.cargo && Fly.mode !== 'crash'){ f.cargo = null; f.lost++; Save.write(); townToast('The cargo was lost in the crash.', '#FFB89A'); }
    return fc.apply(this, arguments);
  };
  flyLand = function(){
    if (!Fly.on) return;
    const R = farmRegion();
    if (R && Fly.x >= R.x0){ farmLand(); return; }                                         /* Esc over the farm lands at the village */
    const f = farmData();
    if (f.cargo){
      if (Fly.onGround && Fly.x < Fly.regions[0].x1){ farmDeliver(); }
      else townToast('The cargo is still aboard. Land on the Old Runway to be paid.', '#E8D8B0');
    }
    return fl.apply(this, arguments);
  };
  /* the load on the plane, and a card at the top of the screen */
  flyPlane = function(ctx, x, y, o){
    fp(ctx, x, y, o);
    o = o || {};
    const job = G.state === 'fly' && Fly.on && o.flipScale !== undefined && o.bank !== undefined ? farmCargoJob() : null;
    if (!job) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.bank || 0); ctx.scale(o.flipScale, 1);
    const col = job.id === 'corn' ? '#E8D8A0' : job.id === 'eggs' ? '#C9A27A' : '#E8862A';
    for (let i = 0; i < 3; i++){ tRound(ctx, col, -28 + i * 20, 33, 18, 14, 3); tRect(ctx, 'rgba(0,0,0,.2)', -28 + i * 20, 41, 18, 2); }
    ctx.restore();
  };
  renderFly = function(ctx){
    rf(ctx);
    if (!Fly.on || Fly.mode === 'crash') return;
    const job = farmCargoJob(), W = G.W, H = G.H, s = clamp(Math.min(H / 700, W / 760), 0.8, 1.2);
    if (job){
      const c = farmData().cargo;
      ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(10, 70 * s, 230 * s, 30 * s, 8); ctx.fill();
      ctx.fillStyle = c.cracked ? '#FFB89A' : '#FFE9A0'; ctx.font = '700 ' + Math.round(13 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('Cargo: ' + job.name + (c.cracked ? ' (cracked)' : ''), 20, 90 * s);
    }
  };
  /* landing at the village, and the pay for a delivery */
  window.farmLand = function(){
    if (!Fly.on) return;
    Fly.on = false; if (typeof szSaveSeen === 'function') szSaveSeen();
    const t = townData(); t.n.farmLand = (t.n.farmLand | 0) + 1;
    if (Fly.earned) townToast('Flight over: ' + Fly.got + ' ring' + (Fly.got === 1 ? '' : 's') + ', ' + fmt(Fly.earned) + ' gold.', '#BFFF9A');
    Save.write();
    townEnter('farm', 1240, 1);
  };
  window.farmDeliver = function(){
    const f = farmData(), job = farmCargoJob(); if (!job) return;
    const c = f.cargo, pay = { coin: job.pay.coin, gems: job.pay.gems || 0 };
    if (c.cracked){ pay.coin = Math.round(pay.coin * 0.5); pay.gems = 0; }
    const dk = townDaily().d, t = townData();
    if (t.n.haulDay !== dk){ t.n.haulDay = dk; pay.gems += 10; }
    const msg = townPay(pay);
    f.cargo = null; f.hauls++; t.n.hauls = (t.n.hauls | 0) + 1; Save.write();
    townToast('Delivered: ' + job.name + '. ' + msg + '.', '#BFFF9A'); SFX.level();
  };
})();

/* ---- the village ---- */
(function(){
  TOWN_PAL.farm = { far: '#B8C79A', mid: '#9DB46A', ground: '#B08A56', path: '#C9A870', line: 'rgba(60,40,10,.18)', walls: ['#C9503C', '#E8D8B0', '#B5603A'], roofs: ['#7A3A2A', '#6A4A3A'] };
  TOWN_DIST.farm = { id: 'farm', name: 'Hayfield Village', w: 3000, spawn: 1240, theme: 'farm', left: null, right: null, open: function(){ return true; }, need: '',
    b: [
      { id: 'fstrip', kind: 'stripzone', x: 900, w: 100, h: 0, label: 'The landing strip', act: 'farmfly' },
      { id: 'fbales', kind: 'fm_bales', x: 1700, w: 150, h: 130, label: 'The hay bales', act: 'bales' },
      { id: 'fstand', kind: 'fm_stand', x: 2000, w: 190, h: 150, label: 'Hollis’s Corn Stand', act: 'cornshop' },
      { id: 'fbarn', kind: 'fm_barn', x: 2420, w: 300, h: 230, label: 'Marge’s Barn', act: 'barn' },
      { id: 'fcoop', kind: 'fm_coop', x: 2740, w: 130, h: 90, label: 'The hen coop', act: 'eggs' },
      { id: 'fhouse', kind: 'fm_house', x: 2900, w: 170, h: 150, label: 'The farmhouse', act: 'farmhouse' }
    ],
    p: [{ k: 'fm_strip', x: 120, len: 1560 }, { k: 'fm_pole', x: 330 }, { k: 'fm_corn', x: 0, n: 7 }, { k: 'fm_corn', x: 1760, n: 3 }, { k: 'fm_scarecrow', x: 2230 }, { k: 'fm_fence', x: 2560, n: 3 }, { k: 'fm_windpump', x: 1880 }, { k: 'fm_cart', x: 2640 }],
    L: [{ x: 2000, y: 420, r: 130 }, { x: 2420, y: 400, r: 150 }], npcs: ['hollis', 'marge'], dig: [] };
  TOWN_NPCS.hollis = { id: 'hollis', name: 'Hollis', d: 'farm', x: 2060, range: 60, habit: 'stand', fav: 'flowers', look: { coat: '#E8C070', spot: '#8A5A24', pat: 1, hat: 'straw', s: 1.08 }, gift: { acc: 'cornhat' },
    say: ['Sweetest corn in the Savannah. Don’t quote me. Do quote me.', 'Eat one before a run. Thirty seconds in and you’ll feel the wind change.', 'A cob a day keeps the hyenas at a distance.', 'Mind the chickens. They have opinions.'],
    night: ['Stars are better out here. No lamps.'], rain: ['Rain’s good for the corn. Bad for my hat.'] };
  TOWN_NPCS.marge = { id: 'marge', name: 'Marge', d: 'farm', x: 2330, range: 50, habit: 'stand', fav: 'sweets', look: { coat: '#D8B8A0', spot: '#8A4A32', pat: 6, hat: 'cowboy', s: 1.12 }, gift: { acc: 'bandana' },
    say: ['Load up, fly steady, land soft. That’s all there is to hauling.', 'The eggs crack if you bounce. Pumpkins don’t care, but the plane does.', 'Town pays well for fresh. Fresher the better.', 'Wind’s from the west in the mornings. Head into it.'],
    night: ['Barn’s warm. Come in out of the dark.'], rain: ['No flying in this. Well. Only a little.'] };
  TOWN_NPC_LIST.push('hollis', 'marge');
  TOWN_GIFT_OF.hollis = { acc: 'cornhat' }; TOWN_GIFT_OF.marge = { acc: 'bandana' };
  TOWN_LINES.hollis = { day: ['Fresh cobs this morning.'], dusk: ['Last cobs of the day. Half price. Not really.'], night: ['Closed. Mostly.'], new: ['New face! Corn?'], friend: ['You’re our best customer. Also our only one with a neck like that.'], best: ['Take the hat. It’s the best one I’ve got. I only have the one.'], chap: [[1, 'The Savannah’s lucky to have you.'], [10, 'I hear the old fields changed. Crops glow now, I bet.']] };
  TOWN_LINES.marge = { day: ['Got a load that needs flying.'], dusk: ['Last flight of the day, if you’re quick.'], night: ['Cargo keeps till morning.'], new: ['Pilot, eh? Good. I need one.'], friend: ['You land better than most.'], best: ['Wear the bandana. Keeps the dust out. Looks well on a giraffe.'], chap: [[1, 'Your Savannah farms are ours.']] };
  TOWN_ERRANDS.push(
    { id: 'fm1', npc: 'hollis', title: 'A taste of corn', offer: 'Buy a cob here and eat it on a run. Just once. You’ll see.', done: 'Told you. Faster, isn’t it?', need: { k: 'stat', key: 'cornEaten', n: 1 }, r: { coin: 3 } },
    { id: 'fm2', npc: 'marge', title: 'First haul', offer: 'Load something at the barn and fly it to the Old Runway.', done: 'In one piece, too. Good flying.', need: { k: 'stat', key: 'hauls', n: 1 }, r: { gems: 30 } },
    { id: 'fm3', npc: 'marge', title: 'Regular carrier', offer: 'Five deliveries. Then I’ll stop calling you “the new pilot”.', done: 'Five. Welcome to the firm.', need: { k: 'stat', key: 'hauls', n: 5 }, r: { coin: 8 } },
    { id: 'fm4', npc: 'hollis', title: 'Hungry for speed', offer: 'Eat ten cobs in your runs. There’s a prize.', done: 'You’ve got legs like a cheetah now.', need: { k: 'stat', key: 'cornEaten', n: 10 }, r: { gems: 40 } });
  TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
  /* the two hats */
  [{ id: 'cornhat', name: 'Corn-husk Hat', c: '#D8C070' }, { id: 'bandana', name: 'Farmer’s Bandana', c: '#C9503C' }].forEach(function(o){
    const h = { id: o.id, name: o.name, c: o.c, kind: 'hat', rare: false, p: 0, town: true };
    if (ACC_ITEMS.length < 62){ ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[o.id] = h; }
  });
  TOWN_HAT_SIDE.cornhat = function(c){ c.fillStyle = '#D8C070'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-7, -10); c.quadraticCurveTo(0, -15, 8, -10); c.lineTo(10, 0); c.closePath(); c.fill(); c.strokeStyle = '#A8902E'; c.lineWidth = 1.2; for (let i = -4; i <= 4; i += 4){ c.beginPath(); c.moveTo(i, 0); c.lineTo(i * 0.8, -11); c.stroke(); } c.fillStyle = '#B8A04A'; c.fillRect(-11, -2, 24, 3); };
  TOWN_HAT_TOP.cornhat = function(c){ c.fillStyle = '#D8C070'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.strokeStyle = '#A8902E'; c.lineWidth = 1.2; for (let i = 0; i < 6; i++){ c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 1.05) * 9, Math.sin(i * 1.05) * 9); c.stroke(); } };
  TOWN_HAT_SIDE.bandana = function(c){ c.fillStyle = '#C9503C'; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(0, -12, 10, 0); c.closePath(); c.fill(); c.fillStyle = '#F4F1E8'; for (let i = -5; i <= 5; i += 5){ c.beginPath(); c.arc(i, -4 + Math.abs(i) * 0.2, 1.3, 0, TAU); c.fill(); } c.fillStyle = '#C9503C'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-15, 5); c.lineTo(-10, -2); c.closePath(); c.fill(); };
  TOWN_HAT_TOP.bandana = function(c){ c.fillStyle = '#C9503C'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#F4F1E8'; for (let i = 0; i < 5; i++){ c.beginPath(); c.arc(Math.cos(i * 1.25) * 5, Math.sin(i * 1.25) * 5, 1.2, 0, TAU); c.fill(); } };
  /* far hills, and fields with a few barns, instead of the town's skyline */
  const pfar = townPaintFar, pmid = townPaintMid;
  townPaintFar = function(c, D, W, H, R){
    if (D.theme !== 'farm') return pfar(c, D, W, H, R);
    c.fillStyle = '#A8BC9A'; c.beginPath(); c.moveTo(0, TG + 20);
    for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, TG - 150 - 30 * Math.abs(Math.sin(x * 0.0042 + 0.8)) - 14 * Math.sin(x * 0.013));
    c.lineTo(W, TG + 20); c.closePath(); c.fill();
    c.fillStyle = '#8FAE7A'; c.beginPath(); c.moveTo(0, TG + 20);
    for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, TG - 90 - 26 * Math.abs(Math.sin(x * 0.0061 + 2.1)) - 10 * Math.sin(x * 0.021));
    c.lineTo(W, TG + 20); c.closePath(); c.fill();
  };
  townPaintMid = function(c, D, W, H, R){
    if (D.theme !== 'farm') return pmid(c, D, W, H, R);
    for (let k = 0; k < 14; k++){                                                  /* ploughed strips in two greens and a gold */
      const x = k * (W / 13), w = W / 13 + 4;
      c.fillStyle = ['#8DAA52', '#B8A850', '#7A9A48'][k % 3]; c.fillRect(x, TG - 56, w, 60);
      c.strokeStyle = 'rgba(40,60,20,.25)'; c.lineWidth = 1.4; for (let i = 0; i < 6; i++){ c.beginPath(); c.moveTo(x + i * w / 6, TG - 56); c.lineTo(x + i * w / 6 - 10, TG + 4); c.stroke(); }
    }
    for (let k = 0; k < 6; k++){                                                   /* far barns, a silo, haystacks and trees */
      const x = 120 + k * (W / 6) + FILM_R(k + 900) * 120, s = 0.5 + FILM_R(k + 910) * 0.3;
      c.fillStyle = '#9A4A3A'; c.fillRect(x, TG - 56 - 44 * s, 60 * s, 44 * s); c.fillStyle = '#6A2E26'; c.beginPath(); c.moveTo(x - 6 * s, TG - 56 - 44 * s); c.lineTo(x + 30 * s, TG - 56 - 74 * s); c.lineTo(x + 66 * s, TG - 56 - 44 * s); c.closePath(); c.fill();
      c.fillStyle = '#C9CDD9'; c.fillRect(x + 70 * s, TG - 56 - 60 * s, 14 * s, 60 * s);
      c.fillStyle = '#C9A24A'; c.beginPath(); c.ellipse(x - 40 * s, TG - 60, 16 * s, 11 * s, 0, 0, TAU); c.fill();
      c.fillStyle = '#3E6A2E'; c.beginPath(); c.arc(x + 130 * s, TG - 80 * s - 20, 20 * s, 0, TAU); c.fill(); c.fillRect(x + 128 * s, TG - 80 * s, 4 * s, 24 * s);
    }
  };  /* the strip, props and buildings */
  const px = townPropX, bx = townBuildingX;
  townPropX = function(c, D, p, P, r){
    const x = p.x;
    switch (p.k){
      case 'fm_strip':
        tRect(c, '#B89A66', x, TG + 2, p.len, 54); tRect(c, '#9A7E4E', x, TG + 52, p.len, 6); tRect(c, '#CDB07C', x, TG + 2, p.len, 4);
        c.fillStyle = '#E8D8B0'; for (let k = x + 30; k < x + p.len - 50; k += 90) c.fillRect(k, TG + 26, 46, 4);
        for (let k = x; k <= x + p.len; k += 60) tCircle(c, '#E8E0D0', k, TG + 8, 4);
        c.strokeStyle = 'rgba(60,40,10,.22)'; c.lineWidth = 1.4; for (let k = 0; k < 30; k++){ const sx = x + 20 + FILM_R(k + 700) * (p.len - 40), sy = TG + 10 + FILM_R(k + 710) * 40; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 24, sy + 2); c.stroke(); }
        return true;
      case 'fm_pole': c.strokeStyle = '#5A3B22'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, TG); c.lineTo(x, TG - 110); c.stroke(); return true;
      case 'fm_corn':
        for (let i = 0; i < (p.n || 4) * 12; i++){
          const cx = x + i * 18 + FILM_R(i + 800) * 8, h = 70 + FILM_R(i + 810) * 36, d = i % 2 ? 0 : 6;
          c.strokeStyle = d ? '#4E8A32' : '#5E9E3A'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, TG + d); c.lineTo(cx, TG + d - h); c.stroke();
          c.lineWidth = 3; c.beginPath(); c.moveTo(cx, TG + d - h * 0.4); c.quadraticCurveTo(cx - 14, TG + d - h * 0.6, cx - 18, TG + d - h * 0.5); c.moveTo(cx, TG + d - h * 0.6); c.quadraticCurveTo(cx + 14, TG + d - h * 0.8, cx + 18, TG + d - h * 0.7); c.stroke();
          tEll(c, '#F2C230', cx + 2, TG + d - h * 0.55, 3.4, 8); tEll(c, '#E8D060', cx - 2, TG + d - h * 0.62, 3, 7);
        }
        return true;
      case 'fm_scarecrow':
        tRect(c, '#5A3B22', x - 3, TG - 110, 6, 110); tRect(c, '#5A3B22', x - 34, TG - 90, 68, 5); tRound(c, '#6A8AC0', x - 16, TG - 94, 32, 44, 6); tCircle(c, '#E8D8A0', x, TG - 118, 12); tRect(c, '#5A3B22', x - 18, TG - 128, 36, 5); tPoly(c, '#8A6A32', [x - 14, TG - 128, x, TG - 150, x + 14, TG - 128]);
        c.fillStyle = '#E8C070'; for (let i = -1; i <= 1; i += 2){ c.beginPath(); c.moveTo(x + i * 30, TG - 88); c.lineTo(x + i * 40, TG - 70); c.lineTo(x + i * 34, TG - 68); c.fill(); }
        return true;
      case 'fm_fence':
        for (let i = 0; i <= (p.n || 3) * 3; i++) tRect(c, '#7A5230', x + i * 30, TG - 46, 6, 46);
        tRect(c, '#8A6642', x, TG - 38, (p.n || 3) * 90 + 6, 5); tRect(c, '#8A6642', x, TG - 22, (p.n || 3) * 90 + 6, 5);
        return true;
      case 'fm_windpump':
        tPoly(c, '#6A6F78', [x - 22, TG, x - 3, TG - 160, x + 3, TG - 160, x + 22, TG]); tRect(c, '#7A8A98', x + 22, TG - 40, 44, 40); tRect(c, '#3E8AC0', x + 26, TG - 14, 36, 8);
        return true;
      case 'fm_cart':
        tRound(c, '#8A6642', x - 50, TG - 52, 100, 34, 5); for (let i = 0; i < 6; i++) tEll(c, '#D9B857', x - 40 + i * 16, TG - 54, 12, 8);
        tCircle(c, '#3A2A1E', x - 30, TG - 14, 14); tCircle(c, '#8A6642', x - 30, TG - 14, 8); tCircle(c, '#3A2A1E', x + 30, TG - 14, 14); tCircle(c, '#8A6642', x + 30, TG - 14, 8);
        tRect(c, '#5A3B22', x + 48, TG - 38, 40, 5);
        return true;
    }
    return px(c, D, p, P, r);
  };
  townBuildingX = function(c, D, b, P, r){
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2;
    switch (b.kind){
      case 'fm_bales':
        c.save();
        for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - (row > 1 ? 1 : 0); k++){ const bx2 = x0 + k * 48 + (row % 2) * 12, by = TG - 32 * (row + 1); tRound(c, '#D9B857', bx2, by, 48, 32, 4); tRect(c, '#A8872E', bx2 + 10, by, 3, 32); tRect(c, '#A8872E', bx2 + 32, by, 3, 32); tRect(c, 'rgba(255,255,255,.2)', bx2 + 3, by + 3, 40, 3); }
        tRect(c, '#D5352B', x0 - 8, TG - 150, 8, 150); tRect(c, '#F4F1E8', x0 - 8, TG - 120, 8, 20); tRect(c, '#D5352B', x0 + W, TG - 150, 8, 150); tRect(c, '#F4F1E8', x0 + W, TG - 120, 8, 20);
        c.strokeStyle = 'rgba(240,235,215,.75)'; c.lineWidth = 1.4; for (let i = 0; i <= 10; i++){ c.beginPath(); c.moveTo(x0 + i * W / 10, TG - 150); c.lineTo(x0 + i * W / 10, TG - 96); c.stroke(); } for (let j = 0; j < 5; j++){ c.beginPath(); c.moveTo(x0, TG - 150 + j * 14); c.lineTo(x0 + W, TG - 150 + j * 14); c.stroke(); }
        tSign(c, 'STOP', x, TG - 168, 70, '#B8301E');
        c.restore(); return true;
      case 'fm_stand':
        c.save();
        tRect(c, '#8A6642', x0, TG - 60, W, 60); tRect(c, '#6A4A2C', x0 - 6, TG - 68, W + 12, 12);
        tRect(c, '#5A3B22', x0 + 4, TG - 150, 6, 90); tRect(c, '#5A3B22', x0 + W - 10, TG - 150, 6, 90);
        tAwning(c, x0 - 8, TG - 156, W + 16, 30, '#F2C230', '#FFF6E0');
        for (let i = 0; i < 4; i++){ const cx = x0 + 30 + i * 42; tRound(c, '#B88A52', cx - 16, TG - 92, 32, 24, 4); for (let k = 0; k < 3; k++){ tEll(c, '#F2C230', cx - 8 + k * 8, TG - 96, 4, 10); tPoly(c, '#5E9E3A', [cx - 10 + k * 8, TG - 90, cx - 8 + k * 8, TG - 108, cx - 5 + k * 8, TG - 90]); } }
        tSign(c, b.label, x, TG - 176, 190, '#7A5A1A', '#FFF6E0');
        c.restore(); return true;
      case 'fm_barn':
        c.save();
        tRect(c, '#B8453A', x0, TG - h, W, h); tRect(c, 'rgba(0,0,0,.14)', x0, TG - h, 8, h); tRect(c, 'rgba(0,0,0,.14)', x0 + W - 8, TG - h, 8, h);
        for (let i = 1; i < 10; i++) tRect(c, 'rgba(0,0,0,.12)', x0 + i * W / 10, TG - h, 2, h);
        tPoly(c, '#8A2E2A', [x0 - 16, TG - h, x, TG - h - 80, x0 + W + 16, TG - h]); tRect(c, '#6A1E1A', x0 - 16, TG - h - 4, W + 32, 8);
        tRect(c, '#F4F1E8', x0 + W / 2 - 52, TG - 140, 104, 140); tRect(c, '#3A2A1E', x0 + W / 2 - 46, TG - 134, 92, 134);
        c.strokeStyle = '#F4F1E8'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + W / 2 - 46, TG - 134); c.lineTo(x0 + W / 2 + 46, TG); c.moveTo(x0 + W / 2 + 46, TG - 134); c.lineTo(x0 + W / 2 - 46, TG); c.moveTo(x0 + W / 2, TG - 134); c.lineTo(x0 + W / 2, TG); c.stroke();
        tRect(c, '#F4F1E8', x - 26, TG - h + 18, 52, 44); tRect(c, '#2A1E12', x - 20, TG - h + 24, 40, 32);
        tSign(c, b.label, x, TG - h + 82, 210, '#4A3624', '#FFF6E0');
        c.restore(); return true;
      case 'fm_coop':
        c.save();
        tRect(c, '#A57C52', x0, TG - 66, W, 66); tPoly(c, '#6A4A32', [x0 - 8, TG - 66, x, TG - 100, x0 + W + 8, TG - 66]); tRect(c, '#2A1E14', x - 14, TG - 44, 28, 44);
        tRect(c, '#8A6642', x + 20, TG - 14, 36, 5); tRect(c, '#8A6642', x + 56, TG - 50, 5, 50);
        c.strokeStyle = '#C9CDD9'; c.lineWidth = 1; for (let i = 0; i < 5; i++){ c.beginPath(); c.moveTo(x + 20 + i * 8, TG - 50); c.lineTo(x + 20 + i * 8, TG); c.stroke(); }
        c.restore(); return true;
      case 'fm_house':
        c.save();
        tRect(c, '#E8D8B0', x0, TG - h, W, h); tPoly(c, '#7A3A2A', [x0 - 14, TG - h, x, TG - h - 64, x0 + W + 14, TG - h]);
        tRect(c, '#6A3A2E', x0 + W - 52, TG - h - 52, 22, 40);
        tRect(c, '#5A3B22', x0 + 20, TG - 92, 46, 46); tRect(c, '#BFE0F4', x0 + 25, TG - 87, 36, 36); tRect(c, '#5A3B22', x0 + 41, TG - 87, 3, 36);
        tRound(c, '#6A3A2E', x0 + W - 66, TG - 86, 40, 86, 6); tCircle(c, '#E9C46A', x0 + W - 36, TG - 44, 3);
        tRect(c, '#8A6642', x0 - 8, TG - 8, 60, 8);
        c.restore(); return true;
    }
    return bx(c, D, b, P, r);
  };
  /* the windsock, chickens, the wind pump's blades; the parked plane */
  const dyx = townDynX;
  townDynX = function(ctx, D, t, dark){
    dyx(ctx, D, t, dark);
    if (D.id !== 'farm') return;
    ctx.save(); ctx.translate(330, TG - 110); const sw = Math.sin(t * 2) * 6;
    ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(56 + sw, 6 + Math.sin(t * 3) * 3); ctx.lineTo(0, 24); ctx.fill(); ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.moveTo(18, 2); ctx.lineTo(34, 4); ctx.lineTo(18, 14); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(1880, TG - 164); ctx.rotate(t * 1.3); for (let i = 0; i < 8; i++){ ctx.rotate(Math.PI / 4); tRect(ctx, '#E8E0D0', 0, -2.5, 36, 5); } ctx.restore(); tCircle(ctx, '#3A3A44', 1880, TG - 164, 5);
    for (let i = 0; i < 4; i++){
      const hx = 2650 + i * 38 + Math.sin(t * 0.4 + i * 2) * 14, peck = Math.max(0, Math.sin(t * 3 + i * 1.7)) * 5;
      tEll(ctx, i % 2 ? '#F4F1E8' : '#C9803C', hx, TG - 9, 9, 7); tCircle(ctx, i % 2 ? '#F4F1E8' : '#C9803C', hx + 8, TG - 15 + peck, 4); tPoly(ctx, '#F2C230', [hx + 11, TG - 15 + peck, hx + 16, TG - 13 + peck, hx + 11, TG - 12 + peck]); tRect(ctx, '#F2C230', hx - 2, TG - 3, 1.6, 4); tRect(ctx, '#F2C230', hx + 2, TG - 3, 1.6, 4);
    }
    if (typeof flyPlane === 'function') flyPlane(ctx, 900, TG - 8, { rider: false, prop: t * 1.2, s: 1.0, t: t, col: planeColour() });
  };
  /* what the doors and the strip do */
  const tu = townUse, nr = townNearest, h = handleTownAction;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'farmfly'){ farmTakeoff(); return; }
      if (b.act === 'cornshop'){ townShowCornShop(); return; }
      if (b.act === 'barn'){ townShowBarn(); return; }
      if (b.act === 'eggs'){ farmEggs(); return; }
      if (b.act === 'bales'){ townSay({ name: 'Hay bales', text: 'A wall of bales and a rope net, at the end of the strip. They stop planes politely.' }, []); return; }
      if (b.act === 'farmhouse'){ townSay({ name: 'The farmhouse', text: 'Smoke from the chimney, a kettle on, and a quilt on the porch rail. Nobody answers, but it feels lived in.' }, []); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    let o = nr(D, inp);
    if (D.id === 'farm' && Town.x < 1620 && (!o || o.k === 'walker')){
      const sb = D.b.find(function(b){ return b.act === 'farmfly'; });
      return { k: 'b', b: sb, label: 'Take off' };
    }
    if (o && o.k === 'b'){
      const m = { farmfly: 'Take off', cornshop: 'Buy corn', barn: 'See the cargo board', eggs: 'Collect eggs', bales: 'Look at the hay bales', farmhouse: 'Look at the farmhouse' };
      if (m[o.b.act]) o.label = m[o.b.act];
    }
    return o;
  };
  handleTownAction = function(a){
    let m = /^town-farm-buycorn-(\d+)$/.exec(a);
    if (m){ farmBuyCorn(+m[1]); townShowCornShop(); return true; }
    m = /^town-farm-load-(\w+)$/.exec(a);
    if (m){ const f = farmData(); if (!f.cargo && FARM_JOBS.some(function(j){ return j.id === m[1]; })){ f.cargo = { id: m[1], cracked: false }; Save.write(); SFX.pick(); townToast('Loaded: ' + farmCargoJob().name + '. Fly it to the Old Runway.', '#BFFF9A'); } townShowBarn(); return true; }
    if (a === 'town-farm-unload'){ const f = farmData(); if (f.cargo){ f.cargo = null; Save.write(); SFX.click(); } townShowBarn(); return true; }
    return h(a);
  };
})();
function farmTakeoff(){
  if (!planeOwned()) return;
  flyTakeoff();
  const R = farmRegion(); if (!R || !Fly.on) return;
  Fly.x = R.x0 + FARM_STRIP_B - 120; Fly.face = -1; Fly.faceVis = -1; Fly.cam = Math.max(0, Fly.x - 420);
}
function farmBuyCorn(n){
  const f = farmData(), room = cornCap() - f.corn, want = Math.min(n, room), cost = cornPrice() * want;
  if (want <= 0){ SFX.deny(); townToast('You are carrying all the corn you can.', '#FFB89A'); return false; }
  if ((Save.data.gold | 0) < cost){ SFX.deny(); return false; }
  Save.data.gold -= cost; f.corn += want; Save.write(); SFX.buy(); return true;
}
function farmEggs(){
  const f = farmData(), dk = townDaily().d;
  if (f.eggDay === dk){ townSay({ name: 'The hen coop', text: 'The hens are sitting on whatever is left. Come back tomorrow.' }, []); return; }
  f.eggDay = dk; const msg = townPay({ gems: 8, coin: 2 }); Save.write(); SFX.coin();
  townBurst(2740, TG - 40, '#FFE9A0', 12); townToast('Fresh eggs: ' + msg + '.', '#BFFF9A');
  townSay({ name: 'The hen coop', text: 'A dozen warm eggs, and a hen who watches you leave with them.' }, []);
}
function townShowCornShop(){
  const f = farmData(), price = cornPrice(), gold = Save.data.gold | 0, room = cornCap() - f.corn;
  const btn = function(n){ const cost = price * Math.min(n, room); return '<button class="bpbtn" data-a="town-farm-buycorn-' + n + '"' + (room <= 0 || gold < cost ? ' disabled' : '') + '>Buy ' + n + '<small>' + fmt(price * Math.min(n, Math.max(1, room))) + ' gold</small></button>'; };
  townPanelT('bakery', '<div class="tp-title">HOLLIS’S CORN STAND</div>' +
    '<p class="bp">Sweet yellow corn, picked this morning. Eat one in a run: <b>+15% speed for 60 seconds</b>, and you can eat the next one the moment it wears off.</p>' +
    '<div class="spec"><div><span>In your satchel</span><b>' + f.corn + ' of ' + CORN_CAP + '</b></div><div><span>Price</span><b>' + fmt(price) + ' gold each</b></div><div><span>Key in a run</span><b>' + keyName(keyOf('corn')) + '</b></div></div>' +
    '<div class="bprow">' + btn(1) + btn(5) + btn(cornCap()) + '</div><div class="stock">' + fmt(gold) + ' gold</div>', { w: 560 });
}
function townShowBarn(){
  const f = farmData(), job = farmCargoJob();
  let h = '<div class="tp-title">MARGE’S BARN · CARGO</div>';
  if (job){
    h += '<p class="bp">On the plane: <b>' + job.name + '</b>' + (f.cargo.cracked ? ' (cracked)' : '') + '. Take off from the strip, fly it to the <b>Old Runway</b> in Longneck Town and park there with the engine off. ' + job.note + '</p>' +
      '<button class="tbtn" data-a="town-farm-unload">Unload it again</button>';
  } else {
    h += '<p class="bp">Pick a load. Fly it home to Longneck Town and land on the Old Runway to be paid. A crash loses the load. The first delivery each day pays 10 gems extra.</p><div class="jobs">';
    FARM_JOBS.forEach(function(j){
      h += '<button class="bpbtn" data-a="town-farm-load-' + j.id + '">' + j.name + '<small>' + (j.pay.coin * townCoin() > 0 ? fmt(j.pay.coin * townCoin()) + ' gold' : '') + (j.pay.gems ? ' + ' + j.pay.gems + ' gems' : '') + ' · ' + j.note + '</small></button>';
    });
    h += '</div>';
  }
  h += '<div class="stock">Deliveries so far: ' + f.hauls + (f.lost ? ' · lost: ' + f.lost : '') + '</div>';
  townPanelT('garage', h, { w: 600 });
}
(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>Hayfield Village</b> is a farming village past the end of the Savannah, reached by plane. Fly east to the dirt strip, line up and park with the engine off (stop before the hay bales!). <b>Hollis</b> sells corn: in a run, press <b>' + keyName(keyOf('corn')) + '</b> for 15% more speed for 60 seconds (the cooldown is the same 60 seconds). <b>Marge</b> hands out cargo to fly to the Old Runway in Longneck Town. Fresh eggs once a day at the coop.</li></ul>'); }; }
})();
