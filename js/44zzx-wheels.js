'use strict';
/* Skateboards and bicycles: a shop, riding them in town and indoors, falling off now and then, townsfolk who have opinions, and the photo studio. */
/* ========================= 44zzx. RIDES ========================= */
/* THE SHOP     Spoke & Board, at the far end of the Park, with a room inside (in_wheels) and its keeper, Spoke. Four things to buy with gold: a Skateboard and a
                Cruiser board, a Bicycle and a Racing bike. A car cannot go indoors, but these can.
   RIDING       The Ride button (or the key, V by default) gets on or off the one she has picked in the shop. On wheels she is faster than on foot, speeds up and slows
                down slowly, and keeps going through doors. Any panel, a seat or a car takes her off again.
   FALLING      Fast riding has a small chance of a fall (more indoors, and when she turns right round at speed): she is thrown, lies dizzy for a moment and gets up
                on foot with the board or bike rolling off. Nothing is lost.
   OPINIONS     Indoors, whoever is in the room says what they think of a giraffe on a bicycle in their bakery, in a speech bubble: crazy is the kind word.
   SAVE         Save.data.town.wheels = { owned: { id: 1 }, sel: id }, read raw until she owns one. */
const RIDES = [
  { id: 'skate',   kind: 'skate', name: 'Skateboard',   price: 3000,  mul: 1.6, fall: 0.05, col: '#D5352B', blurb: 'A plain deck. Quick, and a little wobbly.' },
  { id: 'cruiser', kind: 'skate', name: 'Cruiser board', price: 7000,  mul: 1.5, fall: 0.03, col: '#2DA79B', blurb: 'Long and steady, with big soft wheels.' },
  { id: 'bike',    kind: 'bike',  name: 'Bicycle',      price: 9000,  mul: 1.9, fall: 0.03, col: '#4DA0D8', blurb: 'Pedals, a bell and a basket-shaped gap in the frame.' },
  { id: 'racer',   kind: 'bike',  name: 'Racing bike',  price: 20000, mul: 2.4, fall: 0.06, col: '#F2C230', blurb: 'Thin tyres, drop bars, no brakes worth mentioning.' }
];
const WHEELS_BY_ID = {}; RIDES.forEach(function(w){ WHEELS_BY_ID[w.id] = w; });
function wheelsRaw(){ const t = Save.data && Save.data.town; return t && t.wheels && typeof t.wheels === 'object' && !Array.isArray(t.wheels) ? t.wheels : null; }
function wheelsData(){
  const t = townData(); if (!t.wheels || typeof t.wheels !== 'object' || Array.isArray(t.wheels)) t.wheels = {};
  const w = t.wheels; if (!w.owned || typeof w.owned !== 'object' || Array.isArray(w.owned)) w.owned = {};
  if (!w.sel || !WHEELS_BY_ID[w.sel] || !w.owned[w.sel]) w.sel = Object.keys(w.owned).filter(function(id){ return WHEELS_BY_ID[id] && w.owned[id]; })[0] || '';
  return w;
}
function wheelsOwned(){ const w = wheelsRaw(); return !!(w && w.owned && typeof w.owned === 'object' && Object.keys(w.owned).some(function(id){ return WHEELS_BY_ID[id] && w.owned[id]; })); }
function wheelsMul(){ const W = Town.wheels && WHEELS_BY_ID[Town.wheels]; return W ? W.mul : 1; }
function wheelsBodyUnits(){ const W = Town.wheels && WHEELS_BY_ID[Town.wheels]; return W && W.kind === 'bike' ? 34 : 41; }      /* how high her body sits, in units of her scale (37 on foot) */
function wheelsBuy(id){
  const W = WHEELS_BY_ID[id]; if (!W) return false; const w = wheelsData(); if (w.owned[id]) return false;
  if (goldInt(Save.data.gold) < W.price){ SFX.deny(); return false; }
  Save.data.gold -= W.price; w.owned[id] = 1; w.sel = id; Save.write(); SFX.buy(); SFX.level(); return true;
}
function wheelsToggle(){
  if (Town.wheels){ Town.wheels = null; SFX.click(); townToast('She hops off.', '#E8D8B0'); return; }
  if (Town.fall) return;
  if (!wheelsOwned()){ townToast('Buy a skateboard or a bicycle at Spoke & Board, at the far end of the Park.', '#E8D8B0'); SFX.deny(); return; }
  if (Town.car){ townToast('Get out of the car first.', '#FFB89A'); SFX.deny(); return; }
  if (Town.panel || Town.seat || Town.gym || Town.ride){ SFX.deny(); return; }
  const w = wheelsData(), W = WHEELS_BY_ID[w.sel]; if (!W) return;
  Town.wheels = W.id; Town.wspin = 0; Town.wcrank = 0; Town.wcT = 1.4; SFX.level();
  townToast(W.kind === 'bike' ? 'Ring ring. Hold up to stretch her neck.' : 'Kick, push, roll. Hold up to stretch her neck.', '#E8D8B0');
}

/* ---- drawing: a board or a bike, side view, facing right, wheels on y = gy (o: kind, flip, spin, crank, col) ---- */
function wheelsPedals(o){                                                      /* the two pedals, in the bike's own coordinates (ground at 0) */
  const a = o.crank || 0, R = (WHEELS_BY_ID[o.kind] || RIDES[2]).id === 'racer' ? 19 : 18, bx = -2, by = -R + 1;
  return { bb: [bx, by], near: [bx + Math.cos(a) * 9, by + Math.sin(a) * 9], far: [bx - Math.cos(a) * 9, by - Math.sin(a) * 9] };
}
function wheelsSide(ctx, x, gy, o){
  o = o || {};
  const W = WHEELS_BY_ID[o.kind] || RIDES[0], dir = o.flip ? -1 : 1, col = o.col || W.col, spin = o.spin || 0;
  ctx.save(); ctx.translate(x, gy); ctx.scale(dir, 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (W.kind === 'skate'){
    const L = W.id === 'cruiser' ? 70 : 54, wr = W.id === 'cruiser' ? 6 : 5;
    tEll(ctx, 'rgba(0,0,0,.2)', 0, 1, L / 2 + 4, 3);
    [-L / 2 + 11, L / 2 - 11].forEach(function(wx){
      tRect(ctx, '#6A6F78', wx - 5, -12, 10, 3);
      tCircle(ctx, W.id === 'cruiser' ? '#F2C230' : '#F4F1E8', wx, -wr, wr); tCircle(ctx, '#2A2A34', wx, -wr, wr * 0.42);
      ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(wx, -wr); ctx.lineTo(wx + Math.cos(spin) * wr * 0.9, -wr + Math.sin(spin) * wr * 0.9); ctx.stroke();
    });
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-L / 2, -17); ctx.lineTo(-L / 2 + 8, -12); ctx.lineTo(L / 2 - 8, -12); ctx.lineTo(L / 2, -17); ctx.lineTo(L / 2, -15); ctx.lineTo(L / 2 - 8, -9.5); ctx.lineTo(-L / 2 + 8, -9.5); ctx.lineTo(-L / 2, -15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(30,30,40,.55)'; ctx.fillRect(-L / 2 + 8, -12.6, L - 16, 2);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-L / 2 + 10, -10.2, L - 20, 1);
  } else {
    const R = W.id === 'racer' ? 19 : 18, rh = [-30, -R], fh = [30, -R], bb = [-2, -R + 1], seat = [-13, -R - 23], head = [24, -R - 24], bars = [26, -R - 30];
    tEll(ctx, 'rgba(0,0,0,.2)', 0, 1, 46, 3);
    [rh, fh].forEach(function(h){
      ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = W.id === 'racer' ? 2.6 : 3.6; ctx.beginPath(); ctx.arc(h[0], h[1], R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#C9CDD9'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(h[0], h[1], R - 3, 0, TAU); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.strokeStyle = '#9AA0AA'; for (let k = 0; k < 8; k++){ const a = spin + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0] + Math.cos(a) * (R - 3), h[1] + Math.sin(a) * (R - 3)); ctx.stroke(); }
      tCircle(ctx, '#6A6F78', h[0], h[1], 2.2);
    });
    const P = wheelsPedals(o);
    ctx.strokeStyle = '#9AA0AA'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bb[0], bb[1]); ctx.lineTo(P.far[0], P.far[1]); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3.6;
    [[rh, bb], [rh, seat], [bb, seat], [bb, head], [seat, head], [head, fh]].forEach(function(s){ ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); ctx.stroke(); });
    ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(seat[0], seat[1]); ctx.lineTo(seat[0] - 1, seat[1] - 5); ctx.moveTo(head[0], head[1]); ctx.lineTo(bars[0], bars[1]); ctx.stroke();
    ctx.fillStyle = '#2A2A34'; ctx.beginPath(); ctx.ellipse(seat[0] - 2, seat[1] - 6, 7, 2.4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = 2.6; ctx.beginPath();
    if (W.id === 'racer'){ ctx.moveTo(bars[0] - 3, bars[1] + 2); ctx.quadraticCurveTo(bars[0] + 10, bars[1] - 2, bars[0] + 10, bars[1] + 8); } else { ctx.moveTo(bars[0] - 2, bars[1]); ctx.lineTo(bars[0] + 8, bars[1] + 1); }
    ctx.stroke();
    if (W.id === 'bike'){ ctx.strokeStyle = '#B8864E'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(bars[0] + 10, bars[1] - 2, 3, 0, TAU); ctx.stroke(); }          /* a bell */
    ctx.strokeStyle = '#9AA0AA'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bb[0], bb[1]); ctx.lineTo(P.near[0], P.near[1]); ctx.stroke();
    tCircle(ctx, '#6A6F78', bb[0], bb[1], 3.2); tRect(ctx, '#2A2A34', P.far[0] - 4, P.far[1] - 1, 8, 2.4); tRect(ctx, '#2A2A34', P.near[0] - 4, P.near[1] - 1, 8, 2.4);
  }
  ctx.restore();
}
/* a leg of two bones from the hip to a pedal, the knee bent forward */
function wheelsLeg(ctx, hx, hy, fx, fy, dir, colour, boot){
  const L = 25, dx = fx - hx, dy = fy - hy, d = Math.min(2 * L - 1, Math.max(8, Math.hypot(dx, dy))), h = Math.sqrt(Math.max(0, L * L - d * d / 4)), ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  const kx = hx + ux * d / 2 + dir * Math.abs(uy) * h + (dir > 0 ? 0 : 0), ky = hy + uy * d / 2 - Math.abs(ux) * h * 0.6;
  ctx.strokeStyle = colour; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.ellipse(fx + dir * 2, fy + 1, 5, 3.2, 0, 0, TAU); ctx.fill();
}

/* ---- riding, falling, and what people say ---- */
const WHEELS_SAY = {
  any: ['Is that a BICYCLE? In here?!', 'You are absolutely crazy!', 'Wheels indoors! Who allowed this?!', 'Mind the shelves! Mind EVERYTHING!', 'I just mopped that floor!', 'Have you lost your mind? ...Do it again.', 'A giraffe on wheels, inside. I have seen it all now.', 'Duck at the door! You have a very long neck!', 'That is not allowed. Is it? Somebody check.'],
  skate: ['A skateboard! Inside! You madgiraffe!', 'No tricks near the furniture!', 'Kickflip over my rug and you are banned.'],
  bike: ['Ring ring! Out of my way, you lunatic!', 'Bicycles have a place and it is NOT here!', 'Who rides a bike in a house?!'],
  crumb: ['NOT NEAR THE BREAD! Not near the bread!', 'Crazy giraffe! You will knock the loaves!'],
  torque: ['Two wheels? Cars have four. Four!', 'Nice ride. Still crazy.'],
  dewey: ['SHH! And no wheels in the library!', 'This is a place of quiet, not a velodrome!'],
  granny: ['In my sitting room?! In my day we WALKED.', 'My rug! My poor rug! You are mad, dear.'],
  mim: ['Mind my window box! You are crazy!', 'It is a very small cottage for a very big bike!'],
  penny: ['Careful with the coffees! Are you crazy?!', 'Not between the tables! NOT between the tables!']
};
const WHEELS_FALL_SAY = ['Told you!', 'Are you all right?!', 'That is what happens!', 'Ooh. That looked like it hurt.', 'Crazy AND clumsy!'];
function wheelsBubbleAdd(n, txt){ Town.bubbles = Town.bubbles || []; Town.bubbles = Town.bubbles.filter(function(b){ return b.n !== n; }); Town.bubbles.push({ n: n, txt: txt, t: 0 }); }
function wheelsPickNpc(){
  const near = (Town.npcs || []).filter(function(n){ return Math.abs(n.x - Town.x) < 700 && n.def && n.def.id !== 'spoke'; });
  near.sort(function(a, b){ return Math.abs(a.x - Town.x) - Math.abs(b.x - Town.x); });
  return near[0] || null;
}
function wheelsComment(){
  const n = wheelsPickNpc(); if (!n) return false;
  const W = WHEELS_BY_ID[Town.wheels], pool = (WHEELS_SAY[n.def.id] || []).concat(WHEELS_SAY[W.kind], WHEELS_SAY.any);
  wheelsBubbleAdd(n, townPick1(pool)); return true;
}
function wheelsFall(){
  const W = WHEELS_BY_ID[Town.wheels]; if (!W || Town.fall) return;
  const dir = Town.vx < 0 ? -1 : Town.vx > 0 ? 1 : (Town.face < 0 ? -1 : 1);
  Town.fall = { t: 0, dir: dir, id: W.id, vx: Town.vx * 1.15, vehX: Town.x, spin: Town.wspin || 0 };
  Town.vx = dir * Math.min(150, Math.abs(Town.vx)); Town.reach = 0;
  const tn = townData().n; tn.wheelFalls = (tn.wheelFalls | 0) + 1;
  try { SFX.deny(); SFX.burst(0.1, 0.08, 700, 200, 0.8, 0, 'lowpass', SFX.eventGain); } catch (e) {}
  if (TOWN_DIST[Town.d].indoor){ const n = wheelsPickNpc(); if (n) wheelsBubbleAdd(n, townPick1(WHEELS_FALL_SAY)); }
}
function wheelsFallStep(dt){
  const f = Town.fall, D = TOWN_DIST[Town.d]; f.t += dt;
  f.vx *= Math.max(0, 1 - dt * 2.2); f.vehX = clamp(f.vehX + f.vx * dt, 60, D.w - 60); f.spin += f.vx * dt / 8;
  if (f.t >= 1.9){ Town.fall = null; Town.wheels = null; Town.vx = 0; townToast('Ouch! She dusts herself off. Press ' + (Input.hasTouch ? 'Ride' : keyName(keyOf('ride'))) + ' to get back on.', '#E8D8B0'); }
}
function wheelsRideStep(dt, D){
  const W = WHEELS_BY_ID[Town.wheels]; if (!W){ Town.wheels = null; return; }
  const v = Town.vx; Town.wspin = (Town.wspin || 0) + v * dt / (W.kind === 'bike' ? 18 : 5.5) * Town.face * 0 + v * dt / (W.kind === 'bike' ? 18 : 5.5);
  Town.wcrank = (Town.wcrank || 0) + Math.abs(v) * dt * 0.045;
  const sp = Math.min(1, Math.abs(v) / (TOWN_WALK * W.mul));
  if (Town.wlast && Math.sign(Town.wlast) !== Math.sign(v) && Math.abs(Town.wlast) > 90 && Math.abs(v) > 20) Town.wbump = (Town.wbump || 0) + 0.12;           /* turning right round at speed */
  Town.wlast = Math.abs(v) > 20 ? v : 0;
  const p = (W.fall * (D.indoor ? 1.35 : 1) * sp * sp + (Town.wbump || 0) * 0.5) * dt;
  Town.wbump = Math.max(0, (Town.wbump || 0) - dt);
  if (sp > 0.45 && (Town.fixFall || Math.random() < p)){ Town.fixFall = false; wheelsFall(); return; }
  Town.wcT = (Town.wcT || 0) - dt;
  if (D.indoor && Town.wcT <= 0 && !Town.panel){ if (wheelsComment()) Town.wcT = 5 + Math.random() * 3.5; else Town.wcT = 1.5; }
}
(function(){
  const un = updateTown;
  updateTown = function(dt, frozen){
    if (!Town.on) return un(dt, frozen);
    const D = TOWN_DIST[Town.d];
    if (Town.bubbles && Town.bubbles.length){ Town.bubbles.forEach(function(b){ b.t += Math.min(dt, 0.05); }); Town.bubbles = Town.bubbles.filter(function(b){ return b.t < 4.2; }); }
    if (Town.wheels && !Town.fall && (Town.panel || Town.seat || Town.gym || Town.car || Town.ride)) Town.wheels = null;
    if (Town.fall){ wheelsFallStep(Math.min(dt, 0.05)); return un(dt, true); }
    if (Town.wheels && !frozen && !Town.hold) wheelsRideStep(Math.min(dt, 0.05), D);
    return un(dt, frozen);
  };
  const st = step;
  step = function(dt){ if (!Town.on && (Town.wheels || Town.fall)){ Town.wheels = null; Town.fall = null; } return st(dt); };
  KEY_ACTIONS.push(['ride', 'Ride a skateboard or bike (in town)']); DEFAULT_KEYS.ride = 'KeyV';
  window.addEventListener('keydown', function(e){
    if (e.repeat || e.code !== keyOf('ride') || !Town.on || G.state !== 'town' || Town.panel || Town.hold) return;
    if (typeof townDialogOpen === 'function' && townDialogOpen()) return;
    e.preventDefault(); wheelsToggle();
  });
  /* drawing her: on a board or a bike, or tumbling off one; and the speech bubbles over everyone else */
  const dp = townDrawPlayer;
  townDrawPlayer = function(ctx, t){
    const f = Town.fall, W = WHEELS_BY_ID[f ? f.id : Town.wheels];
    if (W && !Town.seat && !Town.gym && !Town.car && !Town.ride){
      const flip = Town.face < 0, dir = flip ? -1 : 1, moving = Math.abs(Town.vx) > 30, cl = giraffeColours();
      if (f){
        const fd = f.dir, k = Math.min(1, f.t / 0.35), up = f.t < 0.35 ? Math.sin(k * Math.PI) * 34 : 0;
        let rot = f.t < 0.35 ? k * 1.65 : f.t < 1.5 ? 1.65 : 1.65 * (1 - (f.t - 1.5) / 0.4);
        const gx = Town.x + (f.t < 0.35 ? 0 : 0);
        ctx.save(); ctx.translate(f.vehX, 0); ctx.translate(0, TG - 9); ctx.rotate(fd * (W.kind === 'bike' ? Math.min(1.45, f.t * 4) : Math.min(3.1, f.t * 9))); ctx.translate(0, -(TG - 9));
        wheelsSide(ctx, 0, TG, { kind: W.id, flip: fd < 0, spin: f.spin, crank: f.spin }); ctx.restore();
        ctx.save(); ctx.translate(gx, TG - up); ctx.rotate(fd * Math.max(0, rot));
        townGiraffe(ctx, 0, 0, { s: 1.5, flip: fd < 0, moving: false, reach: 0, t: t }); ctx.restore();
        if (f.t > 0.4 && f.t < 1.6){ for (let i = 0; i < 3; i++){ const a = t * 5 + i * 2.1; tCircle(ctx, '#FFE24D', gx + fd * 52 + Math.cos(a) * 20, TG - 44 + Math.sin(a) * 7, 3.2); } }
      } else if (W.kind === 'skate'){
        const sp = Math.min(1, Math.abs(Town.vx) / (TOWN_WALK * W.mul));
        wheelsSide(ctx, Town.x, TG, { kind: W.id, flip: flip, spin: Town.wspin || 0 });
        ctx.save(); ctx.translate(Town.x, TG); ctx.rotate(dir * (sp * 0.05 + Math.sin(t * 9) * 0.012 * sp));
        townGiraffe(ctx, 0, -6, { s: 1.5, flip: flip, moving: false, reach: Town.reach, lean: moving ? 3 : 0, t: t }); ctx.restore();
      } else {
        const cx = Town.x + dir * 10, P = wheelsPedals({ kind: W.id, crank: Town.wcrank || 0 }), bodyY = TG - 12 - 26 * 1.5;
        wheelsSide(ctx, cx, TG, { kind: W.id, flip: flip, spin: Town.wspin || 0, crank: Town.wcrank || 0 });
        const hipX = Town.x - dir * 18, hipY = bodyY + 22;
        wheelsLeg(ctx, hipX, hipY, cx + dir * P.far[0], TG + P.far[1], dir, cl.dark, false);
        townGiraffe(ctx, Town.x, TG - 12, { s: 1.5, flip: flip, sit: true, noLegs: true, reach: Town.reach, lean: moving ? 3 : 0, t: t });
        wheelsLeg(ctx, hipX + dir * 4, hipY, cx + dir * P.near[0], TG + P.near[1], dir, cl.coat, false);
        ctx.strokeStyle = cl.coat; ctx.lineWidth = 5.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(Town.x + dir * 20, bodyY + 18); ctx.lineTo(cx + dir * 28, TG - (W.id === 'racer' ? 49 : 48)); ctx.stroke();
      }
    } else dp.apply(this, arguments);
    /* what the people nearby think of it */
    (Town.bubbles || []).forEach(function(b){
      const n = b.n; if (!n || !n.def) return;
      const lk = n.def.look || {}, y = TG - 92 * 1.45 * (lk.s || 1) - 34, a = Math.min(1, (4.2 - b.t) * 1.6, b.t * 6);
      const words = String(b.txt).split(' '), lines = []; let cur = '';
      words.forEach(function(w){ if ((cur + ' ' + w).trim().length > 24){ lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }); if (cur.trim()) lines.push(cur.trim());
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.font = 'bold 13px system-ui,sans-serif'; ctx.textAlign = 'center';
      let w = 0; lines.forEach(function(l){ w = Math.max(w, ctx.measureText(l).width); }); w += 18; const h = lines.length * 16 + 10, x0 = n.x - w / 2, y0 = y - h;
      ctx.fillStyle = 'rgba(255,252,240,.96)'; ctx.strokeStyle = 'rgba(60,40,20,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 8); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(n.x - 6, y0 + h - 0.5); ctx.lineTo(n.x, y0 + h + 9); ctx.lineTo(n.x + 6, y0 + h - 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3A2A1E'; lines.forEach(function(l, i){ ctx.fillText(l, n.x, y0 + 17 + i * 16); }); ctx.restore();
    });
  };
})();

/* ---- the shop: a building at the far end of the Park, and a room inside ---- */
TOWN_ROOM.wheels = { wall: '#D6E8F0', wains: '#2F6A8A', stripe: 'rgba(60,120,160,.1)', floor: '#8C9096', beam: '#3A4A5A' };
const WH_KINDS = {
  wh_rack: function(c, D, b){                                                 /* boards on a wall rack */
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#3A4A5A', x0, TG - h, W, h); tRect(c, '#4E6478', x0 + 6, TG - h + 8, W - 12, h - 16); tRect(c, '#2A3644', x0, TG - 10, W, 10);
    for (let r = 0; r < 3; r++){
      const y = TG - h + 40 + r * 70; tRect(c, '#2A3644', x0 + 8, y + 26, W - 16, 4);
      for (let k = 0; k < 4; k++){ const bx = x0 + 22 + k * ((W - 44) / 3), col = ['#D5352B', '#2DA79B', '#F2C230', '#9A6AE8', '#4DA0D8', '#E85D9F'][(r * 4 + k) % 6]; tRound(c, col, bx - 8, y - 22, 16, 50, 7); tRect(c, 'rgba(30,30,40,.45)', bx - 4, y - 16, 8, 38); tCircle(c, '#F4F1E8', bx, y - 12, 2); tCircle(c, '#F4F1E8', bx, y + 20, 2); }
    }
  },
  wh_stand: function(c, D, b){                                                /* bikes parked on the floor */
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 30);
    tRect(c, '#2A3644', x0, TG - 8, W, 8); [x0 + 30, x0 + W - 30].forEach(function(px){ tRect(c, '#4E6478', px - 3, TG - 38, 6, 30); });
    wheelsSide(c, b.x - 60, TG - 8, { kind: 'bike', spin: 0.4, crank: 0.6 }); wheelsSide(c, b.x + 62, TG - 8, { kind: 'racer', flip: true, spin: 1.1, crank: 2.2 });
  },
  wh_counter: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#5A7A94', x0, TG - 86, W, 86); for (let i = 0; i < 4; i++) tRect(c, 'rgba(255,255,255,.12)', x0 + 12 + i * ((W - 24) / 4), TG - 74, (W - 24) / 4 - 8, 52);
    tRect(c, '#2A3644', x0, TG - 10, W, 10); tRound(c, '#C9CDD9', x0 - 10, TG - 98, W + 20, 14, 4);
    tRound(c, '#E8C24A', x0 + 20, TG - 126, 56, 26, 5); tRect(c, '#2A2A34', x0 + 28, TG - 120, 40, 4);
    tCircle(c, '#2A2A34', x0 + W - 52, TG - 110, 12); tCircle(c, '#9AA0AA', x0 + W - 52, TG - 110, 7); tCircle(c, '#2A2A34', x0 + W - 28, TG - 108, 9); tCircle(c, '#9AA0AA', x0 + W - 28, TG - 108, 5);
  }
};
IV_ROOMS.wheels = function(c, D, K){
  ivLine(c, '#2A3644', 4, 150, 34, 560, 34);
  [[190, '#2DA79B'], [290, '#D5352B'], [390, '#F2C230'], [490, '#4DA0D8']].forEach(function(w, i){ ivLine(c, '#2A2A30', 1.6, w[0], 34, w[0], 62); c.strokeStyle = '#2A2A34'; c.lineWidth = 5; c.beginPath(); c.arc(w[0], 92, 28, 0, TAU); c.stroke(); c.strokeStyle = w[1]; c.lineWidth = 1.4; for (let k = 0; k < 8; k++){ const a = k * Math.PI / 4 + i; c.beginPath(); c.moveTo(w[0], 92); c.lineTo(w[0] + Math.cos(a) * 25, 92 + Math.sin(a) * 25); c.stroke(); } tCircle(c, '#9AA0AA', w[0], 92, 4); });
  ivBoard(c, 640, 56, 190, 70, '#F4F1E8', '#2A3644'); ivText(c, 'RIDE!', 735, 100, 30, '#D5352B'); c.strokeStyle = '#2A3644'; c.lineWidth = 3; c.beginPath(); c.moveTo(660, 112); c.lineTo(710, 112); c.moveTo(760, 112); c.lineTo(810, 112); c.stroke();
  ivLine(c, '#2A2A30', 2, 940, 34, 940, 64); tRound(c, '#E8C24A', 905, 64, 70, 44, 6); ivText(c, 'NO HELMET', 940, 84, 9, '#2A2A34'); ivText(c, 'NO PROBLEM', 940, 98, 9, '#2A2A34');
};
(function(){
  const bx = townBuildingX, px = townPropX;
  townBuildingX = function(c, D, b, P, r){
    const f = WH_KINDS[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
  townPropX = function(c, D, p, P, r){
    if (p.k === 'wheelrack'){                                                 /* a board and a bike leaning on a rail by the shop door */
      c.save(); try {
        tRect(c, '#5A3B22', p.x - 46, TG - 40, 5, 40); tRect(c, '#5A3B22', p.x + 40, TG - 40, 5, 40); tRect(c, '#5A3B22', p.x - 46, TG - 40, 92, 5);
        wheelsSide(c, p.x - 8, TG, { kind: 'bike', spin: 0.3, crank: 1.2 });
        c.save(); c.translate(p.x + 62, TG); c.rotate(-1.2); wheelsSide(c, 0, -2, { kind: 'skate' }); c.restore();
      } finally { c.restore(); }
      return true;
    }
    return px(c, D, p, P, r);
  };
  /* the room, the keeper, the building on the street */
  const door = [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }];
  townRoomDef('in_wheels', 'Spoke & Board', 'wheels', 1150, 190, { b: door.concat([
      { id: 'rack', kind: 'wh_rack', x: 400, w: 220, h: 250, label: 'The board rack', act: 'wheels' },
      { id: 'bikes', kind: 'wh_stand', x: 700, w: 240, h: 120, label: 'The bike stand', act: 'wheels' },
      { id: 'till', kind: 'wh_counter', x: 1010, w: 200, h: 100, label: 'The counter', act: 'wheels' }]),
    p: [], L: [{ x: 400, y: 80, r: 160 }, { x: 700, y: 80, r: 170 }, { x: 1010, y: 80, r: 150 }], npcs: ['spoke'] });
  TOWN_IN_IDS.push('in_wheels'); TOWN_ROOM_PARENT.in_wheels = 'park';
  Object.assign(TOWN_NPCS, { spoke: { id: 'spoke', name: 'Spoke', d: 'in_wheels', x: 880, range: 40, habit: 'stand', fav: 'sweets', look: { coat: '#B8E0D2', spot: '#2F6A8A', pat: 3, hat: 'beanie', s: 1.0 }, gift: { gems: 60, coin: 8 },
    say: ['Take one for a spin! Indoors is the best testing ground, and nobody is allowed to tell you otherwise. Well, they will. Ignore them.', 'Skateboards are quick but wobbly. Bikes are steadier but they take longer to learn to love.', 'You will fall off. Everyone falls off. The trick is to look fabulous doing it.', 'Hold the up key and your neck will go right over the handlebars. Very aerodynamic.', 'Folk in town will call you crazy for riding inside. That is just their way of saying they are jealous.'],
    night: ['I leave the lights on for the night riders.'], rain: ['Puddles are an extra challenge. I do not sell extra challenge, but I do not stop it.'] } });
  TOWN_NPC_LIST.push('spoke');
  const P = TOWN_DIST.park; P.w = 4200;
  P.b.push({ id: 'wheels', kind: 'house', x: 3900, w: 260, h: 205, label: 'Spoke & Board', act: 'house', to: 'in_wheels', tint: '#8CC8E0' });
  P.p.push({ k: 'lamp', x: 3760 }, { k: 'wheelrack', x: 4090 }, { k: 'bush', x: 4150 });
  P.L.push({ x: 3760, y: 360, r: 110 }, { x: 3900, y: 400, r: 130 });
  [{ id: 'wh_c1', d: 'park', in: 'in_wheels', t: 'coin', x: 400, h: 262, note: 'on top of the board rack in the bike shop' }].forEach(function(it){ TOWN_ITEMS.push(it); TOWN_ITEM_BY_ID[it.id] = it; });
  const tu = townUse, nr = townNearest;
  townUse = function(o){ if (o.k === 'b' && o.b.act === 'wheels'){ SFX.click(); townShowWheels(); return; } tu(o); };
  townNearest = function(D, inp){ const o = nr(D, inp); if (o && o.k === 'b' && o.b.act === 'wheels') o.label = 'Look at the boards and bikes'; return o; };
  const ha = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('wh-') === 0){
      let m = /^wh-buy-(\w+)$/.exec(a); if (m){ if (wheelsBuy(m[1])) townShowWheels(); return; }
      m = /^wh-use-(\w+)$/.exec(a); if (m){ const w = wheelsData(); if (w.owned[m[1]]){ w.sel = m[1]; Save.write(); SFX.click(); townShowWheels(); } return; }
    }
    return ha.apply(this, arguments);
  };
})();
function townShowWheels(){
  const gold = goldInt(Save.data.gold), raw = wheelsRaw(), owned = (raw && raw.owned) || {}, sel = wheelsOwned() ? wheelsData().sel : '';
  let cards = '';
  RIDES.forEach(function(W){
    const own = !!owned[W.id], on = own && sel === W.id;
    cards += '<div class="vcard' + (on ? ' on' : '') + '"><canvas width="190" height="96" data-wh="' + W.id + '"></canvas><b>' + W.name + '</b><span class="vb">' + W.blurb + '</span>' +
      '<span class="vs">speed ×' + W.mul + ' · ' + (W.fall >= 0.05 ? 'wobbly' : W.fall <= 0.03 ? 'steady' : 'a bit wobbly') + '</span>' +
      (own ? (on ? '<button class="bpbtn" disabled>Riding this one</button>' : '<button class="bpbtn" data-a="wh-use-' + W.id + '">Ride this one</button>')
           : '<button class="bpbtn" data-a="wh-buy-' + W.id + '"' + (gold >= W.price ? '' : ' disabled') + '>Buy<small>' + fmt(W.price) + ' gold</small></button>') + '</div>';
  });
  townPanelT('garage', '<div class="tp-title">SPOKE &amp; BOARD</div><div class="vgrid">' + cards + '</div><p class="bp">Press <b>' + (Input.hasTouch ? 'Ride' : keyName(keyOf('ride'))) + '</b> in town to get on and off. Boards and bikes can go indoors; cars cannot. Fast riding has a small chance of a fall.</p><div class="stock">' + fmt(gold) + ' gold</div>', { w: 760 });
  document.querySelectorAll('canvas[data-wh]').forEach(function(cv){ const g = cv.getContext('2d'), W = WHEELS_BY_ID[cv.getAttribute('data-wh')]; g.translate(95, W.kind === 'bike' ? 80 : 66); g.scale(W.kind === 'bike' ? 1.15 : 1.7, W.kind === 'bike' ? 1.15 : 1.7); wheelsSide(g, 0, 0, { kind: W.id, spin: 0.3, crank: 0.8 }); });
}

/* ---- the photo studio: the same painters, appended to the effects list ---- */
(function(){
  RIDES.forEach(function(W){
    PHOTO_FX.push(['wheels_' + W.id, (W.kind === 'bike' ? 'Bike: ' : 'Board: ') + W.name]);
    PHOTO_FXDRAW['wheels_' + W.id] = function(c){ c.save(); c.translate(0, 28); const k = W.kind === 'bike' ? 1.5 : 2.1; c.scale(k, k); wheelsSide(c, 0, 0, { kind: W.id, spin: 0.3, crank: 0.8 }); c.restore(); };
  });
})();
