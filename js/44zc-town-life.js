'use strict';
/* Longneck Town, third part: people walking about, the tram, the ride, and things that move. */
/* ========================= 44zc. TOWN LIFE ========================= */
/* Walkers are extra giraffes who stroll the street, sometimes go into a building and come out again, and say a word now and then; she can
   chat to them. The tram runs on a 40 second timetable in the square (arrives, waits with its doors open while passengers get off, leaves),
   and taking it from the map is a short ride. The rest is animation for the new scenery: the big wheel, the windmill, boats, birds,
   a balloon, washing, the radar, a mine cart, fires and the arcade's screens. Nothing here is saved. */
const TOWN_WALK_LOOKS = [['#E9B648', '#8A5A24'], ['#D8A8E8', '#6A3A8A'], ['#9AD0E8', '#2F6B9A'], ['#F2A08A', '#B04A32'], ['#B8D88A', '#5A7A2A'], ['#F0D890', '#9A7A2A'], ['#C9B8A0', '#6A5A44'], ['#E8C0D0', '#B04A72'], ['#A8E0C8', '#2F7A5A'], ['#E8E0A8', '#8A7A2A']];
const TOWN_WALK_HATS = ['', '', '', 'straw', 'beanie', 'tophat', 'cowboy', 'toque', 'sailor', 'party', 'flowers', 'propeller'];
const TOWN_WALK_SAY = ['Lovely day.', 'Mind the neck!', 'Is it Tuesday?', 'Hello there!', 'Fresh bread today.', 'Don’t mind me.', 'Seen Dot?', 'Off to the arcade.', 'What a lovely hat.', 'Rain later, I think.',
  'Almost home.', 'Excuse me!', 'Nice neck.', 'The tram is late again.', 'Have you tried the buns?', 'I lost a coin somewhere.', 'Careful on the roofs.'];
const TOWN_WALK_REPLY = [['Oh, hello! Lovely town, isn’t it?', 'I walk it every day. I still find new corners.'], ['Have you been up the clock tower? Well. Up it, I mean.', 'Mind the tram. It does not stop for giraffes.'],
  ['I heard there are coins hidden on every street.', 'The best hats are found, not bought.'], ['I’d chat, but I’m late for nothing in particular.', 'Is it true you’ve been to the Moon?']];
function townSpawnWalkers(){
  Town.walkers = [];
  const D = TOWN_DIST[Town.d]; if (!D) return;
  const mk = function(x, still, face){
    const lk = TOWN_WALK_LOOKS[Math.floor(Math.random() * TOWN_WALK_LOOKS.length)], hat = TOWN_WALK_HATS[Math.floor(Math.random() * TOWN_WALK_HATS.length)];
    Town.walkers.push({ x: x, dir: face || (Math.random() < 0.5 ? 1 : -1), speed: 38 + Math.random() * 34, tx: x, wait: Math.random() * 4, ph: Math.random() * 6, t: Math.random() * 9, still: !!still,
      look: { coat: lk[0], spot: lk[1], pat: Math.floor(Math.random() * 8), hat: hat, s: 0.95 + Math.random() * 0.25 }, say: '', sayT: 0, nextSay: 3 + Math.random() * 12, hid: 0, door: null, seed: Math.random() * 90 });
  };
  if (D.indoor){
    const fix = { in_cafe: [[330, 1], [560, -1], [690, 1]], in_library: [[320, 1], [1180, -1]], in_arcade: [[420, 1], [830, 1], [1220, -1]], in_bakery: [[380, 1], [470, 1]] }[D.id] || [];
    fix.forEach(function(p){ mk(p[0], true, p[1]); });
    return;
  }
  const n = { square: 5, market: 5, park: 6, harbour: 3, roofs: 3, launch: 3, burrows: 3 }[D.id] || 3;
  for (let i = 0; i < n; i++) mk(160 + Math.random() * (D.w - 320));
}
function townWalkerStep(w, D, dt){
  w.t += dt;
  w.nextSay -= dt;
  if (w.sayT > 0) w.sayT -= dt;
  if (w.nextSay <= 0){ w.nextSay = 9 + Math.random() * 18; if (Math.random() < 0.55){ w.say = TOWN_WALK_SAY[Math.floor(Math.random() * TOWN_WALK_SAY.length)]; w.sayT = 3.2; } }
  if (w.hid > 0){ w.hid -= dt; if (w.hid <= 0 && w.door){ w.x = w.door.x; w.tx = w.x + (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 300); w.door = null; } return; }
  if (w.still){ w.moving = false; return; }
  w.wait -= dt;
  if (Math.abs(w.tx - w.x) < 6){
    w.moving = false;
    if (w.door && Math.abs(w.door.x - w.x) < 14){ w.hid = 6 + Math.random() * 10; return; }
    if (w.wait <= 0){
      w.wait = 1 + Math.random() * 4;
      const doors = D.b.filter(function(b){ return b.to; });
      if (doors.length && Math.random() < 0.28){ w.door = doors[Math.floor(Math.random() * doors.length)]; w.tx = w.door.x; }
      else { w.door = null; w.tx = clamp(w.x + (Math.random() * 2 - 1) * 520, 90, D.w - 90); }
    }
    return;
  }
  w.dir = w.tx > w.x ? 1 : -1; w.x += w.dir * w.speed * dt; w.moving = true; w.ph += dt * 5;
}
function townWalkerChat(w){
  const D = TOWN_DIST[Town.d];
  const pool = TOWN_WALK_REPLY[Math.floor(Math.random() * TOWN_WALK_REPLY.length)], extra = [];
  const hat = accEquipped('hat'); if (hat) extra.push('That ' + hat.name.toLowerCase() + ' is a good one.');
  if (townCarOwned()) extra.push('Is that your car? I heard she goes fast.');
  if (townIsNight() && !D.cave) extra.push('Out late, aren’t you? Me too.');
  if (Town.rainK > 0.4) extra.push('Wet, isn’t it. I like the sound of it.');
  const all = pool.concat(extra);
  townSay({ name: 'A passer-by', text: all[Math.floor(Math.random() * all.length)] }, [{ label: 'Goodbye', fn: function(){ townCloseDialog(); } }]);
}

/* ---- the tram ---- */
const TRAM_CYCLE = 40, TRAM_STOP_X = 260, TRAM_LEN = 300;
function townTramState(D){
  const c = (Date.now() / 1000) % TRAM_CYCLE;
  const ease = function(k){ return 1 - Math.pow(1 - k, 3); }, easeIn = function(k){ return k * k * k; };
  if (c < 7) return { phase: 'arrive', x: lerp(-TRAM_LEN, TRAM_STOP_X, ease(c / 7)), c: c };
  if (c < 19) return { phase: 'stop', x: TRAM_STOP_X, c: c };
  if (c < 27) return { phase: 'depart', x: lerp(TRAM_STOP_X, D.w + TRAM_LEN, easeIn((c - 19) / 8)), c: c };
  return { phase: 'away', x: -2000, c: c };
}
let _tramLastPhase = '';
function townDrawTram(ctx, D, t){
  const st = townTramState(D);
  /* the overhead wire runs the whole street */
  ctx.strokeStyle = 'rgba(40,40,50,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, TG - 150); ctx.lineTo(D.w, TG - 150); ctx.stroke();
  if (st.phase !== _tramLastPhase){
    _tramLastPhase = st.phase;
    if (st.phase === 'arrive'){ try { SFX.tone('triangle', 1175, 1175, 0.3, 0.1, 0, 0); SFX.tone('triangle', 880, 880, 0.35, 0.1, 0.18, 0); } catch (e) {} }
    if (st.phase === 'stop' && Town.walkers){
      for (let i = 0; i < 2; i++){ const lk = TOWN_WALK_LOOKS[Math.floor(Math.random() * TOWN_WALK_LOOKS.length)];
        Town.walkers.push({ x: TRAM_STOP_X + (i ? 40 : -40), dir: i ? 1 : -1, speed: 42, tx: TRAM_STOP_X + (i ? 1 : -1) * (160 + Math.random() * 200), wait: 0, ph: 0, t: 0, still: false, look: { coat: lk[0], spot: lk[1], pat: 0, hat: '', s: 1 }, say: '', sayT: 0, nextSay: 6, hid: 0, door: null, seed: i }); }
      if (Town.walkers.length > 14) Town.walkers.splice(0, Town.walkers.length - 14);
    }
  }
  if (st.phase === 'away') return;
  const x = st.x, y0 = TG - 96, L = TRAM_LEN, moving = st.phase !== 'stop';
  ctx.save();
  ctx.translate(x, 0);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, TG + 6, L / 2, 6, 0, 0, TAU); ctx.fill();
  tRound(ctx, '#3E7A5A', -L / 2, y0, L, 92, 14);
  tRect(ctx, '#F1E6C8', -L / 2 + 6, y0 + 32, L - 12, 34);
  tRect(ctx, '#2F5A44', -L / 2, y0 + 70, L, 8);
  tRect(ctx, '#F2C230', -L / 2 + 10, y0 + 8, L - 20, 8);
  for (let i = 0; i < 7; i++){
    const wx = -L / 2 + 14 + i * 40;
    if (st.phase === 'stop' && (i === 1 || i === 5)){                       /* the doors, open */
      tRect(ctx, '#1E1E24', wx, y0 + 34, 34, 54); tRect(ctx, '#B8C8C0', wx - 4, y0 + 34, 6, 54); tRect(ctx, '#B8C8C0', wx + 32, y0 + 34, 6, 54); continue;
    }
    tRect(ctx, '#BFE3F6', wx, y0 + 36, 32, 26);
    if (Math.sin(i * 7.1 + Math.floor(t * 0.2)) > 0.1){ ctx.fillStyle = '#E9B648'; ctx.beginPath(); ctx.arc(wx + 16, y0 + 56, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#E9B648'; ctx.fillRect(wx + 13, y0 + 44, 5, 12); }
  }
  tRound(ctx, '#1E3A2C', L / 2 - 52, y0 + 6, 46, 18, 4); ctx.fillStyle = '#9BFF7A'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('ROUTE 1', L / 2 - 29, y0 + 19);
  ctx.fillStyle = '#FFF6C0'; ctx.beginPath(); ctx.arc(L / 2 - 6, y0 + 76, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#444'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-20, y0); ctx.lineTo(-6, TG - 150); ctx.moveTo(-6, TG - 150); ctx.lineTo(20, TG - 150); ctx.stroke();
  if (moving && Math.sin(t * 40) > 0.8){ ctx.fillStyle = '#9FD8F2'; ctx.beginPath(); ctx.arc(6, TG - 150, 5, 0, TAU); ctx.fill(); }
  [-L / 2 + 40, -L / 2 + 90, L / 2 - 90, L / 2 - 40].forEach(function(wx){ tCircle(ctx, '#222', wx, TG - 2, 11); tCircle(ctx, '#888', wx, TG - 2, 5); });
  ctx.restore();
}

/* ---- riding it ---- */
function townRide(toId){
  if (!TOWN_DIST[toId] || !townOpen(toId)){ SFX.deny(); return; }
  if (toId === Town.d){ townGo(toId); return; }
  Town.ride = { t: 0, dur: 2.6, to: toId, from: TOWN_DIST[Town.d].name };
  Town.hold = true; Town.panel = false;
  try { SFX.tone('triangle', 1175, 1175, 0.28, 0.1, 0, 0); } catch (e) {}
}
function townDrawRide(ctx){
  const R = Town.ride, W = G.W, H = G.H, k = R.t / R.dur, h = townHour(), sky = townSkyAt(h);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sc = H / 600, speed = 520 + 900 * Math.sin(Math.min(1, k) * Math.PI);
  const off = R.t * speed;
  [[0.25, '#8FA6C0', 90, 230], [0.5, '#6F88A8', 60, 160], [1, '#4A6280', 40, 90]].forEach(function(l, li){
    ctx.fillStyle = l[1]; const w = 120 + li * 40, step = w + 30 + li * 14, base = H * 0.78;
    const o = (off * l[0] * 0.4) % step;
    for (let x = -step + -o; x < W + step; x += step){ const idx = Math.floor((x + off * l[0] * 0.4) / step), hh = l[2] + ((idx * 53) % 7) * l[3] / 7 * sc; ctx.fillRect(x, base - hh, w, hh + H); }
  });
  /* the carriage around the window */
  ctx.fillStyle = '#2A3A32'; ctx.fillRect(0, 0, W, H * 0.12); ctx.fillRect(0, H * 0.74, W, H * 0.26); ctx.fillRect(0, 0, W * 0.08, H); ctx.fillRect(W * 0.92, 0, W * 0.08, H);
  ctx.fillStyle = '#F1E6C8'; ctx.fillRect(0, H * 0.72, W, H * 0.03);
  ctx.fillStyle = '#7A3A2E'; for (let i = 0; i < 3; i++) ctx.fillRect(W * (0.12 + i * 0.3), H * 0.8, W * 0.22, H * 0.2);
  ctx.strokeStyle = '#C9CDD9'; ctx.lineWidth = 3; for (let i = 0; i < 5; i++){ const x = W * (0.15 + i * 0.18), sw = Math.sin(R.t * 6 + i) * 6; ctx.beginPath(); ctx.moveTo(x, H * 0.12); ctx.lineTo(x + sw, H * 0.3); ctx.stroke(); ctx.beginPath(); ctx.arc(x + sw, H * 0.31, 8, 0, TAU); ctx.stroke(); }
  /* she sits by the window */
  const bob = Math.sin(R.t * 18) * 1.5;
  townGiraffe(ctx, W * 0.5, H * 0.9 + bob, { s: Math.min(2.2, H / 330), sit: true, flip: false, reach: 0.15, t: Town.t, ph: 0 });
  miniText(ctx, 'Next stop: ' + TOWN_DIST[R.to].name, W / 2, H * 0.085, Math.min(26, W / 14), '#FFF6E0');
  miniText(ctx, 'from ' + R.from, W / 2, H * 0.085 + 24, 14, '#C9B890', 'center', false);
  ctx.fillStyle = 'rgba(8,6,5,' + (k > 0.85 ? (k - 0.85) / 0.15 : k < 0.12 ? 1 - k / 0.12 : 0).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H);
}

/* ---- things that move ---- */
function townBirds(ctx, D, t){
  const rainy = Town.rainK > 0.4; if (rainy || D.cave || D.indoor) return;
  ctx.strokeStyle = 'rgba(30,30,40,.7)'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < 5; i++){
    const x = ((t * 36 + i * 46 + 400) % (D.w + 500)) - 250, y = 90 + Math.sin(t * 0.7 + i) * 18 + i * 10, f = Math.sin(t * 9 + i * 1.3) * 5;
    ctx.moveTo(x - 9, y + f); ctx.quadraticCurveTo(x - 4, y - 5, x, y); ctx.quadraticCurveTo(x + 4, y - 5, x + 9, y + f);
  }
  ctx.stroke();
}
function townBalloon(ctx, D, t){
  const x = (t * 7 + 300) % (D.w + 400) - 200, y = 130 + Math.sin(t * 0.3) * 10;
  ctx.save(); ctx.translate(x, y);
  const cols = ['#D5352B', '#F2C230', '#4DA0D8', '#6BBB45'];
  for (let i = 0; i < 4; i++){ ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.ellipse(-18 + i * 12, 0, 14, 36, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(-8, -10, 8, 18, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5A3B22'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-22, 30); ctx.lineTo(-10, 56); ctx.moveTo(18, 30); ctx.lineTo(8, 56); ctx.stroke();
  tRect(ctx, '#8A6642', -12, 56, 24, 14);
  ctx.restore();
}
function townDynX(ctx, D, t, dark){
  const id = D.id;
  if (!D.indoor && !D.cave) townBirds(ctx, D, t);
  switch (id){
    case 'square': {
      townDrawTram(ctx, D, t);
      const cx = 2780, cy = TG - 270, d = new Date(), ha = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * TAU - Math.PI / 2, ma = d.getMinutes() / 60 * TAU - Math.PI / 2;
      ctx.strokeStyle = '#3A2A1E'; ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * 17, cy + Math.sin(ha) * 17); ctx.stroke();
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * 25, cy + Math.sin(ma) * 25); ctx.stroke();
      ctx.save(); ctx.translate(cx, TG - 370); ctx.rotate(Math.sin(t * 1.4) * 0.2); tCircle(ctx, '#C9A24A', 0, 8, 7); ctx.restore();
      break;
    }
    case 'market':
      for (let i = 0; i < 3; i++){ const a = (t * 0.5 + i * 0.3) % 1; tCircle(ctx, 'rgba(225,225,235,' + (0.5 - a * 0.5).toFixed(2) + ')', 2640 + a * 20, TG - 285 - a * 70, 5 + a * 10); }
      if (Math.sin(t * 0.8) > 0.2){ ctx.fillStyle = 'rgba(40,40,60,.7)'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'left'; ctx.fillText('z', 656, TG - 232 - (t % 2) * 6); ctx.font = 'bold 10px system-ui'; ctx.fillText('z', 668, TG - 246 - (t % 2) * 6); }
      break;
    case 'park': {
      const cx = 2830, cy = TG - 140, R = 118, a0 = t * 0.18;
      ctx.strokeStyle = '#C9CDD9'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, TAU); ctx.stroke();
      ctx.lineWidth = 2; for (let i = 0; i < 8; i++){ const a = a0 + i * TAU / 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
      for (let i = 0; i < 8; i++){
        const a = a0 + i * TAU / 8, gx = cx + Math.cos(a) * R, gy = cy + Math.sin(a) * R;
        ctx.fillStyle = ['#D5352B', '#F2C230', '#4DA0D8', '#6BBB45'][i % 4]; ctx.beginPath(); ctx.roundRect(gx - 10, gy - 2, 20, 18, 4); ctx.fill();
        ctx.fillStyle = '#2A2A34'; ctx.fillRect(gx - 10, gy - 4, 20, 3);
        if (dark > 0.2){ ctx.fillStyle = 'rgba(255,240,170,' + (0.5 + 0.5 * Math.sin(t * 5 + i)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 4, 0, TAU); ctx.fill(); }
      }
      tCircle(ctx, '#3A3A44', cx, cy, 10);
      townBalloon(ctx, D, t);
      /* the bandstand: two musicians who sway */
      [2430, 2530].forEach(function(bx, i){ townGiraffe(ctx, bx, TG - 34, { s: 1.0, look: { coat: i ? '#F2A08A' : '#9AD0E8', spot: i ? '#B04A32' : '#2F6B9A', pat: 0, hat: i ? 'tophat' : 'beanie' }, bob: Math.abs(Math.sin(t * 4 + i)) * 3, reach: 0.15 + 0.1 * Math.sin(t * 2 + i), flip: i === 1, t: t, seed: i }); });
      if (dark < 0.5){ ctx.fillStyle = 'rgba(40,40,60,.7)'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; for (let i = 0; i < 3; i++){ const a = (t * 0.6 + i * 0.33) % 1; ctx.globalAlpha = 1 - a; ctx.fillText(['♪', '♫'][i % 2], 2480 + Math.sin(a * 6 + i) * 24, TG - 180 - a * 60); } ctx.globalAlpha = 1; }
      break;
    }
    case 'harbour': {
      /* the sailboats sit out on the water, behind the quay: the buildings and the moored boat hide them, so each shape is cut out of the clip */
      const hide = [];
      D.b.forEach(function(b){
        if (!b.h) return; const top = TG - b.h;
        if (b.kind === 'lighthouse'){ hide.push([b.x - 70, TG, b.x - 40, top + 60, b.x + 40, top + 60, b.x + 70, TG]); hide.push([b.x - 54, top - 26, b.x + 54, top - 26, b.x + 54, top + 62, b.x - 54, top + 62]); }
        else hide.push([b.x - b.w / 2, top - 44, b.x + b.w / 2, top - 44, b.x + b.w / 2, TG, b.x - b.w / 2, TG]);
      });
      D.p.forEach(function(p){
        if (p.k === 'boat') hide.push([p.x - 120, TG - 62, p.x + 120, TG - 62, p.x + 90, TG - 28, p.x - 90, TG - 28], [p.x - 3, TG - 280, p.x + 3, TG - 280, p.x + 3, TG - 60, p.x - 3, TG - 60], [p.x + 6, TG - 270, p.x + 70, TG - 90, p.x + 6, TG - 90], [p.x - 6, TG - 240, p.x - 56, TG - 90, p.x - 6, TG - 90], [p.x - 100, TG - 86, p.x - 50, TG - 86, p.x - 50, TG - 62, p.x - 100, TG - 62]);
        if (p.k === 'crane') hide.push([p.x - 6, TG - 330, p.x + 6, TG - 330, p.x + 6, TG, p.x - 6, TG]);
      });
      ctx.save();
      hide.forEach(function(h){ ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5); ctx.moveTo(h[0], h[1]); for (let i = 2; i < h.length; i += 2) ctx.lineTo(h[i], h[i + 1]); ctx.closePath(); ctx.clip('evenodd'); });
      for (let k = 0; k < 2; k++){
        const bx = ((t * 12 + k * 1100) % (D.w + 400)) - 200, by = TG - 72 + Math.sin(t * 1.3 + k) * 2;
        tPoly(ctx, '#F4F1E8', [bx - 30, by, bx + 30, by, bx + 22, by + 14, bx - 22, by + 14]); tRect(ctx, '#6A5848', bx - 1.5, by - 56, 3, 56); tPoly(ctx, k ? '#E8D8B0' : '#FFFFFF', [bx + 4, by - 52, bx + 30, by - 6, bx + 4, by - 6]);
      }
      ctx.restore();
      const wx = 2560, wy = TG - 150;
      ctx.save(); ctx.translate(wx, wy); ctx.rotate(t * 0.7);
      for (let i = 0; i < 4; i++){ ctx.rotate(Math.PI / 2); tRect(ctx, '#8A6642', -3, 0, 6, 100); tRect(ctx, '#F4F1E8', 4, 12, 26, 70); ctx.strokeStyle = '#B8A890'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++){ ctx.beginPath(); ctx.moveTo(4, 12 + k * 17); ctx.lineTo(30, 12 + k * 17); ctx.stroke(); } }
      ctx.restore(); tCircle(ctx, '#5A3B22', wx, wy, 8);
      tPoly(ctx, '#D5352B', [2700, TG - 208, 2700 + 36 + Math.sin(t * 3) * 4, TG - 198, 2700, TG - 188]);
      break;
    }
    case 'roofs': {
      ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(2410, TG - 160); ctx.quadraticCurveTo(2500, TG - 140, 2590, TG - 160); ctx.stroke();
      for (let i = 0; i < 5; i++){ const px = 2430 + i * 34, sw = Math.sin(t * 2 + i) * 4, py = TG - 154 + Math.sin((i + 0.5) / 5 * Math.PI) * 10; tPoly(ctx, ['#F29AC0', '#FFFFFF', '#4DA0D8', '#FFD84D', '#9BE04A'][i], [px - 9, py, px + 9, py, px + 8 + sw, py + 30, px - 8 + sw, py + 30]); }
      for (let i = 0; i < 3; i++){ const px = 2615 + i * 24, hop = Math.max(0, Math.sin(t * 3 + i * 2)) * 4; tEll(ctx, '#8A8A96', px, TG - 104 - hop, 8, 5); tCircle(ctx, '#8A8A96', px + 7, TG - 109 - hop, 3.4); }
      break;
    }
    case 'launch': {
      const rx = 2540, ry = TG - 372;
      ctx.save(); ctx.translate(rx, ry); const wdt = Math.abs(Math.cos(t * 1.2)) * 36 + 3; tEll(ctx, '#C9CDD9', 0, 0, wdt, 8); tRect(ctx, '#6A6F78', -2, 0, 4, 20); ctx.restore();
      if (Math.sin(t * 2.4) > 0) tCircle(ctx, '#FF4A3C', rx, TG - 396, 4);
      if (dark > 0.2){ ctx.save(); ctx.translate(2380, TG - 200); ctx.rotate(-1.2 + Math.sin(t * 0.5) * 0.5); const g = ctx.createLinearGradient(0, 0, 0, -400); g.addColorStop(0, 'rgba(255,255,230,.35)'); g.addColorStop(1, 'rgba(255,255,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-40, -400); ctx.lineTo(40, -400); ctx.lineTo(8, 0); ctx.fill(); ctx.restore(); }
      break;
    }
    case 'burrows': {
      const k = (Math.sin(t * 0.35) + 1) / 2, mx = 2200 + k * 440, my = TG + 4;
      ctx.save(); ctx.translate(mx, my);
      tPoly(ctx, '#6A5A52', [-24, -26, 24, -26, 20, -4, -20, -4]); tRect(ctx, '#4A3A34', -26, -28, 52, 4);
      [[-8, -32], [4, -34], [12, -31]].forEach(function(o){ tCircle(ctx, '#8AA0B8', o[0], o[1], 7); });
      tCircle(ctx, '#222', -14, 0, 7); tCircle(ctx, '#222', 14, 0, 7); ctx.restore();
      for (let i = 0; i < 6; i++){ const a = (t * 0.4 + i * 0.17) % 1; ctx.fillStyle = 'rgba(77,216,200,' + (0.5 - a * 0.5).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(2470 + Math.sin(i * 2.3) * 70, TG + 14 - a * 80, 2.4, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 3; i++){ const a = (t * 0.6 + i * 0.33) % 1; ctx.fillStyle = 'rgba(150,200,255,' + (0.7 - a * 0.7).toFixed(2) + ')'; ctx.fillRect(2100 + i * 140, 30 + a * 420, 2, 6); }
      break;
    }
    case 'in_bakery': {
      for (let i = 0; i < 6; i++){ const f = Math.sin(t * 9 + i * 1.7) * 0.5 + 0.5; ctx.fillStyle = 'rgba(255,' + (150 + f * 80 | 0) + ',40,.85)'; ctx.beginPath(); ctx.ellipse(868 + i * 12, TG - 74, 5, 8 + f * 8, 0, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 3; i++){ const a = (t * 0.5 + i * 0.33) % 1; tCircle(ctx, 'rgba(255,255,255,' + (0.4 - a * 0.4).toFixed(2) + ')', 440 + i * 50, TG - 120 - a * 60, 6 + a * 10); }
      break;
    }
    case 'in_cafe':
      [[380, TG - 78], [620, TG - 76]].forEach(function(p, i){ for (let k = 0; k < 2; k++){ const a = (t * 0.6 + k * 0.5 + i * 0.2) % 1; ctx.fillStyle = 'rgba(255,255,255,' + (0.5 - a * 0.5).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(p[0] + 8 + Math.sin(a * 6) * 3, p[1] - a * 36, 3 + a * 4, 0, TAU); ctx.fill(); } });
      break;
    case 'in_garage': {
      const owned = townCarOwned(), sw = 0.5 + 0.5 * Math.sin(t * 0.8);
      townCarSide(ctx, 580, TG - 10 + Math.sin(t * 1.4) * 1.5, { col: owned ? townCarColour() : '#D5352B', t: t, spin: t * 2, moving: false });
      ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + 0.15 * sw).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(500 + sw * 140, TG - 90); ctx.lineTo(540 + sw * 140, TG - 90); ctx.lineTo(500 + sw * 140 + 30, TG - 20); ctx.lineTo(480 + sw * 140, TG - 20); ctx.fill();
      if (!owned){ tRound(ctx, '#F2C230', 520, TG - 170, 120, 30, 6); ctx.fillStyle = '#3A2A1E'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('FOR SALE', 580, TG - 149); }
      break;
    }
    case 'in_house1': case 'in_house2': {
      const x0 = 765;
      for (let i = 0; i < 5; i++){ const f = Math.sin(t * 8 + i * 2.1) * 0.5 + 0.5; ctx.fillStyle = 'rgba(255,' + (140 + f * 90 | 0) + ',30,.9)'; ctx.beginPath(); ctx.ellipse(x0 + 14 + i * 12, TG - 30 - f * 3, 5, 8 + f * 14, 0, 0, TAU); ctx.fill(); }
      break;
    }
    case 'in_arcade':
      for (let c = 1; c <= 13; c++){ if (!miniUnlocked(c)) continue; const x = 270 + (c - 1) * 100, f = Math.floor(t * 6 + c) % 3; ctx.fillStyle = ['rgba(255,255,255,.22)', 'rgba(255,255,255,.05)', 'rgba(255,230,120,.2)'][f]; ctx.fillRect(x - 24, TG - 120, 48, 42); }
      break;
  }
}

/* ---- wiring it in ---- */
(function(){
  const nr = townNearest, tu = townUse, un = updateTown, rt = renderTown, dy = townDynamic, sn = townSpawnNpcs;
  townSpawnNpcs = function(){ sn.apply(this, arguments); townSpawnWalkers(); };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o){ townRelabel(o, D); return o; }
    let best = null, bd = 70;
    (Town.walkers || []).forEach(function(w){ if (w.hid > 0) return; const a = Math.abs(Town.x - w.x); if (a < bd){ bd = a; best = w; } });
    return best ? { k: 'walker', w: best, label: 'Say hello' } : null;
  };
  townUse = function(o){ if (!townUseX(o)) tu(o); };
  updateTown = function(dt, frozen){
    if (Town.on){
      const D = TOWN_DIST[Town.d];
      if (Town.ride){
        Town.ride.t += Math.min(dt, 0.05);
        if (Town.ride.t >= Town.ride.dur){ const to = Town.ride.to; Town.ride = null; Town.hold = false; townEnter(to); }
        return;
      }
      (Town.walkers || []).forEach(function(w){ townWalkerStep(w, D, Math.min(dt, 0.05)); });
    }
    return un(dt, frozen);
  };
  renderTown = function(ctx){
    if (Town.ride){ townDrawRide(ctx); return; }
    return rt(ctx);
  };
  townDynamic = function(ctx, D, t, dark){
    dy(ctx, D, t, dark);
    townDynX(ctx, D, t, dark);
    const cam = Town.camX, V = townView();
    (Town.walkers || []).forEach(function(w){
      if (w.hid > 0 || w.x < cam - 140 || w.x > cam + V.vw + 140) return;
      const lk = w.look, hd = townGiraffe(ctx, w.x, TG, { s: 1.35 * lk.s, look: lk, flip: w.dir < 0, ph: w.ph, moving: w.moving, reach: w.still && D.room === 'library' ? 0.1 : w.reach || 0, bob: w.still && D.room === 'arcade' ? Math.abs(Math.sin(t * 5 + w.seed)) * 2 : 0, sit: false, seed: w.seed, t: t });
      if (w.sayT > 0){ ctx.globalAlpha = Math.min(1, w.sayT * 2); miniText(ctx, w.say, w.x, hd.y - 24, 13, '#FFF6E0'); ctx.globalAlpha = 1; }
    });
  };
})();
function townUseX(o){
  if (o.k === 'walker'){ townWalkerChat(o.w); return true; }
  if (o.k !== 'b') return false;
  const b = o.b;
  if (b.gate && !b.gate()) return false;
  if (b.to){ Town.back = { d: Town.d, x: b.x }; townGo(b.to, TOWN_DIST[b.to].spawn, 1); return true; }
  const say = function(txt){ townSay({ name: b.label, text: txt }, []); };
  const pick = function(a){ return a[Math.floor(Math.random() * a.length)]; };
  switch (b.act){
    case 'out': { const bk = Town.back && TOWN_DIST[Town.back.d] ? Town.back : { d: TOWN_ROOM_PARENT[Town.d] || 'square', x: undefined }; townGo(bk.d, bk.x === undefined ? TOWN_DIST[bk.d].spawn : bk.x, 1); return true; }
    case 'bakery': townShowBakery(); return true;
    case 'garage': townShowGarage(); return true;
    case 'mirror': townLeaveFor(function(){ SFX.click(); showWardrobe(); }); return true;
    case 'lib-bestiary': townLeaveFor(function(){ SFX.click(); showBestiary(); }); return true;
    case 'lib-guide': townLeaveFor(function(){ SFX.click(); showHelp(); }); return true;
    case 'lib-album': townLeaveFor(function(){ SFX.click(); showBook(); }); return true;
    case 'case': townShowHall(); return true;
    case 'scoreboard': townShowScores(); return true;
    case 'cab': {
      if (!miniUnlocked(b.ch)){ say('The screen is dark. A note says: finish Chapter ' + b.ch + ' and this one wakes up.'); SFX.deny(); return true; }
      if (miniReadyIn() > 0){ say(MINI[b.ch].name + ' is warming up. It will be ready in ' + fmtClock(miniReadyIn()) + '.'); SFX.deny(); return true; }
      townLeaveFor(function(){ if (!startMini(b.ch, null, 'menu')) townResume(); });
      return true;
    }
    case 'sit': {
      const t = townData(); t.n.sat = (t.n.sat | 0) + 1; Save.write();
      say(pick(['You sit for a while and watch the room. It is a good way to spend a minute.', 'You settle down. Your neck is very comfortable here.', 'A cosy seat. You feel like you could stay a while.']) + (Math.random() < 0.5 ? ' ' + (townHint() || '') : ''));
      return true;
    }
    case 'order': {
      townSay({ name: 'The bar', text: pick(['The cups clink. Everyone is murmuring. Nobody is in a hurry.', 'A steaming mug appears. You drink it with your head slightly tipped.', 'Someone slides over a warm bun. You eat it slowly.']) }, [
        { label: 'Listen in', fn: function(){ townSay({ name: 'Overheard', text: townHint() || 'Everyone is talking about you. Nicely.' }, []); } }, { label: 'Leave it', fn: function(){ townCloseDialog(); } }]);
      return true;
    }
    case 'oven': say(pick(['The oven roars. Something golden is rising inside.', 'The bread rises. So does the heat.', 'A tray of rolls slides in. Crumb nods approvingly.'])); return true;
    case 'tools': say(pick(['Every spanner has its outline painted on the board. Torque is very tidy.', 'A calendar of cars. Every month is red.'])); return true;
    case 'dummy': say(pick(['A mannequin in a half-finished jacket. The pins are still in.', 'A mannequin with a very long neck. Tailor-made, you suppose.'])); return true;
    case 'plinth': say('A bronze giraffe, neck up, looking brave. The plaque says: THE ONE WHO KICKED. It is you, more or less.'); return true;
    case 'hearth': say(pick(['The fire crackles. The room smells of wood and tea.', 'Warm. Very warm. You step back before your hat goes.'])); return true;
    case 'ctower': say('A radar dish sweeps the sky. The controllers wave from a window very high up.'); return true;
  }
  return false;
}

/* prompts that say what the thing does, not just "go into" */
function townRelabel(o, D){
  if (o.k !== 'b') return;
  const b = o.b, low = b.label.charAt(0).toLowerCase() + b.label.slice(1);
  if (b.to){ o.label = 'Go into ' + b.label; return; }
  const m = { out: 'Go outside', bakery: 'Buy bread', garage: 'Look at the car', mirror: 'Use the mirror (wardrobe)', 'lib-bestiary': 'Open the Bestiary', 'lib-guide': 'Open the Guide', 'lib-album': 'Open the album',
    case: 'Look in the case', scoreboard: 'Read the high scores', sit: 'Sit down', order: 'Order something', oven: 'Look at the oven', tools: 'Look at the tools', dummy: 'Look at the mannequin', plinth: 'Read the plaque',
    hearth: 'Warm up', ctower: 'Look up', photo: 'Take a picture', forage: 'Pick leaves', arcade: 'Go into ' + b.label, shop: 'Open the trading post', cavern: 'Open the market', fusion: 'Use the machine',
    board: 'Read the notice board', scores: 'Read the high scores', hall: 'Look at ' + b.label, map: 'Look at the tram map' }[b.act];
  if (b.act === 'cab'){ o.label = miniUnlocked(b.ch) ? 'Play ' + MINI[b.ch].name : 'Cabinet ' + b.ch + ' (dark)'; return; }
  if (m) o.label = m;
}