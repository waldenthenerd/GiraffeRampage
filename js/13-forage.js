'use strict';
/* Foraging minigame. */
/* ========================= FORAGING MINIGAME ========================= */
/* A side-on scene under an acacia tree: leaves drop quickly from the canopy
   and the giraffe stretches its neck toward the cursor (or finger) to catch
   them. Every leaf caught is 1 food. One round is FORAGE_LEAVES leaves, and
   starting a round puts foraging on a 15-minute real-time cooldown (stopping
   early doesn't refund it, so a round can't be restarted until it's good). */
const FORAGE_COOLDOWN_MS = 15 * 60 * 1000;
const FORAGE_LEAVES = 25;
function forageReadyIn(){
  const last = +(Save.data && Save.data.lastForageAt) || 0;
  return Math.max(0, last + FORAGE_COOLDOWN_MS - Date.now());
}
function fmtClock(ms){
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function forageLabel(){
  const ms = forageReadyIn();
  return ms > 0 ? 'Ready in ' + fmtClock(ms) : 'Ready \u2014 catch falling acacia leaves for food';
}
function forageButtonHTML(cls){
  const ready = forageReadyIn() <= 0;
  return '<button class="' + (cls || 'btn ghost') + '" data-a="forage" data-forage-btn' + (ready ? '' : ' disabled') + '>' +
    'Forage for food<small data-forage-cd>' + forageLabel() + '</small></button>';
}
/* Keeps every visible countdown ticking. Called from the main loop (not a
   timer), a few times a second, and cheap when no forage button is showing. */
let forageLabelT = -1;
function refreshForageLabels(){
  if (Math.abs(G.time - forageLabelT) < 0.25) return;
  forageLabelT = G.time;
  const labels = document.querySelectorAll('[data-forage-cd]');
  if (!labels.length) return;
  const txt = forageLabel(), ready = forageReadyIn() <= 0;
  for (let i = 0; i < labels.length; i++) if (labels[i].textContent !== txt) labels[i].textContent = txt;
  const btns = document.querySelectorAll('[data-forage-btn]');
  for (let i = 0; i < btns.length; i++) btns[i].disabled = !ready;
}
function startForage(){
  if (forageReadyIn() > 0){ SFX.deny(); return false; }
  Save.data.lastForageAt = Date.now();
  Save.write();
  G.forage = { t: 0, spawned: 0, caught: 0, missed: 0, leaves: [], pops: [], next: 0.7,
    hx: G.W / 2, hy: G.H * 0.5, done: false, gulp: 0 };
  Input.sx = G.W / 2; Input.sy = G.H * 0.45;
  G.state = 'forage'; G.attract = false;
  hideOverlay();
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on');
  return true;
}
function forageGeom(){
  const W = G.W, H = G.H, s = clamp(H / 760, 0.7, 1.4);
  return { W: W, H: H, s: s, sx: W / 2, sy: H * 0.9, reach: H * 0.8, ground: H * 0.94,
    canopyY: H * 0.2, span: Math.min(W * 0.42, H * 0.7), catchR: 44 * s };
}
function updateForage(dt){
  const f = G.forage;
  G.time += dt;
  if (!f || f.done) return;
  f.t += dt;
  const g = forageGeom();
  /* the head chases the pointer, but the neck can only stretch so far */
  let tx = Input.sx, ty = Input.sy;
  const dx = tx - g.sx, dy = ty - g.sy, d = Math.hypot(dx, dy) || 1;
  if (d > g.reach){ tx = g.sx + dx / d * g.reach; ty = g.sy + dy / d * g.reach; }
  if (ty > g.sy - 40 * g.s) ty = g.sy - 40 * g.s;
  const k = Math.min(1, dt * 16);
  f.hx += (tx - f.hx) * k; f.hy += (ty - f.hy) * k;
  if (f.gulp > 0) f.gulp -= dt;
  /* leaves drop quicker, and more often, as the round goes on */
  const prog = f.spawned / FORAGE_LEAVES;
  f.next -= dt;
  if (f.spawned < FORAGE_LEAVES && f.next <= 0){
    f.spawned++;
    f.next = 1.0 - 0.55 * prog;
    f.leaves.push({ x: g.sx + rand(-g.span, g.span), y: g.canopyY, vy: g.H * (0.55 + 0.5 * prog),
      ph: Math.random() * TAU, rot: Math.random() * TAU });
  }
  for (let i = f.leaves.length - 1; i >= 0; i--){
    const L = f.leaves[i];
    L.y += L.vy * dt;
    L.x += Math.sin(f.t * 3 + L.ph) * 26 * dt;
    L.rot += dt * 4;
    if (Math.hypot(L.x - f.hx, L.y - f.hy) < g.catchR){
      f.leaves.splice(i, 1); f.caught++; f.gulp = 0.18;
      Save.data.food = Math.round((Save.data.food + 1) * 10) / 10;
      Save.write();
      f.pops.push({ x: L.x, y: L.y, t: 0, good: true });
      sfx('pickupS', 0.04);
    } else if (L.y >= g.ground){
      f.leaves.splice(i, 1); f.missed++;
      f.pops.push({ x: L.x, y: g.ground, t: 0, good: false });
    }
  }
  for (let i = f.pops.length - 1; i >= 0; i--){ f.pops[i].t += dt; if (f.pops[i].t > 0.6) f.pops.splice(i, 1); }
  if (f.spawned >= FORAGE_LEAVES && !f.leaves.length) endForage();
}
function endForage(){
  const f = G.forage;
  if (!f || f.done) return;
  f.done = true;
  f.missed += f.leaves.length + (FORAGE_LEAVES - f.spawned);   /* stopping early counts the rest as missed */
  f.leaves.length = 0;
  Save.write();
  SFX.level();
  setOverlay(
    '<div class="panel slab" style="max-width:430px">' +
      '<h2 class="head">Foraging done</h2>' +
      '<p class="sub">You caught <b>' + f.caught + '</b> of ' + FORAGE_LEAVES + ' acacia leaves: <b>+' + f.caught + ' food</b>. ' +
        'You now have ' + Save.data.food.toFixed(1) + ' food.' +
        (Save.data.antsUnlocked ? '' : ' Food is spent on hiring ants once the ant colony is unlocked.') + '</p>' +
      '<p class="sub" style="margin-top:0">Next forage ' + forageLabel().replace('Ready in', 'in') + '.</p>' +
      '<div class="menucol" style="margin-top:0;width:100%">' +
        (Save.data.antsUnlocked ? '<button class="btn" data-a="tab-ants">Spend it on ants</button>' : '') +
        '<button class="btn ghost" data-a="menu">Back to menu</button>' +
      '</div>' +
    '</div>');
}
function renderForage(ctx){
  const f = G.forage, g = forageGeom(), W = g.W, H = g.H, s = g.s, gs = g.s * 1.7;   /* gs: the giraffe and leaves read larger than the scenery */
  if (!f) return;
  /* sky and ground */
  const sky = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, H) : null;
  if (sky && sky.addColorStop){ sky.addColorStop(0, '#F6D69A'); sky.addColorStop(0.8, '#E9A55E'); ctx.fillStyle = sky; }
  else ctx.fillStyle = '#EDB778';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#8A6A3A'; ctx.fillRect(0, g.ground, W, H - g.ground);
  ctx.strokeStyle = '#6E5430'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 6; x < W; x += 14){ ctx.moveTo(x, g.ground + 2); ctx.lineTo(x + Math.sin(x) * 3, g.ground - 7 * s); }
  ctx.stroke();
  /* the acacia: a trunk off to one side forking into a wide flat umbrella */
  const tx0 = g.sx - g.span * 1.05;
  ctx.strokeStyle = '#5A4028'; ctx.lineCap = 'round';
  ctx.lineWidth = 20 * s; ctx.beginPath(); ctx.moveTo(tx0, H); ctx.quadraticCurveTo(tx0 + 20 * s, H * 0.5, tx0 + 60 * s, H * 0.16); ctx.stroke();
  ctx.lineWidth = 9 * s; ctx.beginPath();
  ctx.moveTo(tx0 + 30 * s, H * 0.4); ctx.quadraticCurveTo(g.sx - g.span * 0.4, H * 0.24, g.sx, H * 0.14);
  ctx.moveTo(tx0 + 50 * s, H * 0.24); ctx.quadraticCurveTo(g.sx + g.span * 0.3, H * 0.2, g.sx + g.span * 0.9, H * 0.13);
  ctx.stroke(); ctx.lineCap = 'butt';
  for (let k = 0; k < 11; k++){
    const cx = g.sx - g.span * 1.1 + k * g.span * 0.22, cy = H * 0.1 + Math.sin(k * 1.7) * H * 0.02;
    ctx.fillStyle = k % 2 ? '#4E6B2E' : '#5E7A34';
    ctx.beginPath(); ctx.ellipse(cx, cy, g.span * 0.2, H * 0.075, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(40,60,20,.35)'; ctx.fillRect(g.sx - g.span * 1.2, H * 0.155, g.span * 2.4, 3 * s);
  /* falling leaves: little paired acacia leaflets */
  for (let i = 0; i < f.leaves.length; i++){
    const L = f.leaves[i];
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot);
    ctx.strokeStyle = '#3E5A1E'; ctx.lineWidth = 1.4 * gs;
    ctx.beginPath(); ctx.moveTo(-9 * gs, 0); ctx.lineTo(9 * gs, 0); ctx.stroke();
    ctx.fillStyle = '#7FB23E';
    for (let j = -3; j <= 3; j++){
      ctx.beginPath(); ctx.ellipse(j * 2.6 * gs, -2.6 * gs, 1.5 * gs, 3 * gs, 0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(j * 2.6 * gs, 2.6 * gs, 1.5 * gs, 3 * gs, -0.3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  /* the giraffe: body at the bottom, a long spotted neck up to the head */
  const cu = typeof giraffeCustom === 'function' ? giraffeCustom() : null, pt = typeof giraffePattern === 'function' ? giraffePattern() : 0;      /* her chosen colours (js/44e-wardrobe.js) */
  const coat = cu ? cu.coat : '#D6A44F', spot = cu ? cu.spot : '#8A5A24';
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.ellipse(g.sx, g.sy + 70 * gs, 130 * gs, 70 * gs, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = spot;
  for (let k = 0; k < 7; k++) { wardSpot(ctx, pt, g.sx - 90 * gs + k * 30 * gs, g.sy + 40 * gs + (k % 2) * 22 * gs, 12 * gs, 9 * gs, 0.3); }
  const cx = g.sx + (f.hx - g.sx) * 0.15, cy = (g.sy + f.hy) / 2;
  ctx.strokeStyle = coat; ctx.lineCap = 'round'; ctx.lineWidth = 18 * gs;
  ctx.beginPath(); ctx.moveTo(g.sx, g.sy); ctx.quadraticCurveTo(cx, cy, f.hx, f.hy); ctx.stroke();
  ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 3 * gs;   /* the short mane down the back of the neck */
  ctx.beginPath(); ctx.moveTo(g.sx - 8 * gs, g.sy); ctx.quadraticCurveTo(cx - 8 * gs, cy, f.hx - 6 * gs, f.hy + 4 * gs); ctx.stroke();
  ctx.lineCap = 'butt';
  for (let k = 1; k < 8; k++){
    const t = k / 8, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    const px = a * g.sx + b * cx + c * f.hx, py = a * g.sy + b * cy + c * f.hy;
    if (pt){ ctx.fillStyle = spot; wardSpot(ctx, pt, px + (k % 2 ? 3 : -3) * gs, py, 4.2 * gs, 4.2 * gs, 0); } else fillCircle(ctx, px + (k % 2 ? 3 : -3) * gs, py, 4.2 * gs, spot);
  }
  /* head, aimed along the end of the neck */
  const ang = Math.atan2(f.hy - cy, f.hx - cx);
  ctx.save(); ctx.translate(f.hx, f.hy); ctx.rotate(ang);
  if (Math.cos(ang) < 0) ctx.scale(1, -1);   /* keep the ossicones on top when the neck leans left */
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(6 * gs, 0, 17 * gs, 11 * gs, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8C891'; ctx.beginPath(); ctx.ellipse(19 * gs, 0, 9 * gs, 8 * gs, 0, 0, TAU); ctx.fill();
  if (f.gulp > 0){ ctx.fillStyle = '#6A2A3A'; ctx.beginPath(); ctx.ellipse(26 * gs, 0, 4 * gs, 3 * gs, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 2.6 * gs;   /* ossicones */
  ctx.beginPath(); ctx.moveTo(-2 * gs, -8 * gs); ctx.lineTo(-6 * gs, -17 * gs); ctx.moveTo(4 * gs, -9 * gs); ctx.lineTo(2 * gs, -18 * gs); ctx.stroke();
  fillCircle(ctx, -6 * gs, -17 * gs, 2.4 * gs, '#4A2E12'); fillCircle(ctx, 2 * gs, -18 * gs, 2.4 * gs, '#4A2E12');
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(-6 * gs, -6 * gs, 6 * gs, 2.6 * gs, -0.6, 0, TAU); ctx.fill();
  fillCircle(ctx, 9 * gs, -4 * gs, 2.6 * gs, '#FFFFFF'); fillCircle(ctx, 9.6 * gs, -4 * gs, 1.4 * gs, '#1A1008');
  ctx.restore();
  /* catch/miss pops */
  for (let i = 0; i < f.pops.length; i++){
    const p = f.pops[i], a = 1 - p.t / 0.6;
    ctx.globalAlpha = a; ctx.fillStyle = p.good ? '#3E6A1E' : '#8A6A3A';
    ctx.font = 'bold ' + Math.round(18 * s) + 'px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.good ? '+1 food' : 'missed', p.x, p.y - p.t * 40 * s);
    ctx.globalAlpha = 1;
  }
  /* on-screen tally */
  ctx.textAlign = 'right'; ctx.fillStyle = '#2A1E10';
  ctx.font = 'bold ' + Math.round(22 * s) + 'px system-ui, sans-serif';
  ctx.fillText('Caught ' + f.caught + ' / ' + FORAGE_LEAVES, W - 16 * s, H * 0.26 + 20 * s);
  ctx.font = Math.round(14 * s) + 'px system-ui, sans-serif';
  ctx.fillText((Input.hasTouch ? 'Drag your finger' : 'Move the cursor') + ' to steer the neck' + (Input.hasTouch ? '' : ' \u00b7 Esc to stop'), W - 16 * s, H * 0.26 + 42 * s);
  ctx.textAlign = 'left';
}

