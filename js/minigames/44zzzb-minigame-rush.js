'use strict';
/* Rush Hour: the minigame after Chapter 14, the Tower (internal chapter 15). */
/* ========================= 44zzzb. RUSH HOUR ========================= */
/* The lobby at half past eight, from above: six lanes of things on wheels (swivel chairs, trolleys, delivery drones) cross the hall, and she has to get from the door
   at the bottom to the elevator at the top, and back to the door for another floor, as many times as she can in 45 seconds. Three lives; a hit sends her back to the door.
   Registered like the others (44f-minigames.js); its stars are in MINI_STAR (44k-minigame-rewards.js) and its coat color, Brass Button, is WARD 48 for three stars. */
MINI_STAR[TOWER_CHAPTER] = { t: [9, 12], lab: ['6', '9', '12'] };
const RUSH_LANES = 6;
function rushLanes(m, g, level){
  const s = g.s, lanes = [], kinds = ['chair', 'trolley', 'drone', 'chair', 'trolley', 'drone'];
  for (let i = 0; i < RUSH_LANES; i++){
    const kind = kinds[(i + level) % kinds.length], dir = (i + level) % 2 ? 1 : -1, w = (kind === 'trolley' ? 74 : kind === 'drone' ? 46 : 38) * s;
    const v = (95 + i * 14 + level * 16 + rand(0, 20)) * s, n = Math.max(2, Math.round(g.W / (230 * s)) - (level > 3 ? 0 : 1)), objs = [];
    const span = g.W + 240 * s, gap = span / n, off = rand(0, gap);
    for (let k = 0; k < n; k++) objs.push({ x: -120 * s + off + k * gap + rand(-24, 24) * s, ph: rand(0, 6) });
    lanes.push({ y: g.H * (0.2 + i * 0.105), kind: kind, dir: dir, v: v, w: w, objs: objs });
  }
  return lanes;
}
registerMini({
  ch: TOWER_CHAPTER, id: 'rush', name: 'Rush Hour', unit: 'floors', dur: 45, goal: 6,
  blurb: 'Half past eight in the lobby, and everything on wheels is going somewhere.\nGet from the door to the elevator, and back for another go, without being run over.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to walk toward the pointer.\nChairs, trolleys and drones cross the hall in lanes: slip between them.',
  touchHint: 'Drag your finger: she walks toward it.\nChairs, trolleys and drones cross the hall in lanes: slip between them.',
  goalText: 'Goal: reach the elevator 6 times in 45 seconds',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.92, ph: 0, moving: false }; m.lives = 3; m.inv = 0; m.level = 0; m.lanes = rushLanes(m, g, 0); m.dingT = 0;
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt; if (m.dingT > 0) m.dingT -= dt;
    p.x = clamp(p.x + st.x * 250 * s * dt, 22 * s, g.W - 22 * s); p.y = clamp(p.y + st.y * 250 * s * dt, g.H * 0.05, g.H * 0.96);
    p.moving = !!(st.x || st.y); if (p.moving) p.ph += dt * 13;
    for (let i = 0; i < m.lanes.length; i++){
      const L = m.lanes[i], span = g.W + 240 * s;
      for (let k = 0; k < L.objs.length; k++){
        const o = L.objs[k]; o.x += L.dir * L.v * dt; o.ph += dt * 8;
        if (o.x > g.W + 120 * s) o.x -= span; else if (o.x < -120 * s) o.x += span;
        if (m.inv <= 0 && Math.abs(o.x - p.x) < L.w / 2 + 12 * s && Math.abs(L.y - p.y) < 17 * s){
          if (miniHurt(m, p.x, p.y - 30 * s, 'Mind the ' + (L.kind === 'chair' ? 'chair' : L.kind === 'trolley' ? 'trolley' : 'drone') + '!')){ p.x = g.W / 2; p.y = g.H * 0.92; }
        }
      }
    }
    if (p.y < g.H * 0.1){                                                           /* the elevator: another floor, and a faster hall */
      m.level++; m.score = m.level; m.dingT = 0.9; SFX.level(); miniPop(m, p.x, p.y + 30 * s, 'Floor ' + m.level + '!', '#9AE8FF');
      p.x = g.W / 2; p.y = g.H * 0.92; m.lanes = rushLanes(m, g, m.level);
    }
  }
});
/* the picture: a marble lobby with six lanes marked on it, the brass elevator doors at the top, a mat at the bottom */
function rushFloor(c, w, h, s, rng){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#CFC8B4'); g.addColorStop(1, '#E6E0CE'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(120,110,86,.28)'; c.lineWidth = 2; for (let x = 0; x < w; x += 120 * s){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 120 * s){ c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  for (let k = 0; k < 40; k++){ c.strokeStyle = 'rgba(140,140,160,' + (0.06 + rng() * 0.08) + ')'; c.lineWidth = 1 + rng(); c.beginPath(); let x = rng() * w, y = rng() * h; c.moveTo(x, y); for (let q = 0; q < 4; q++){ x += (rng() - 0.3) * 60 * s; y += (rng() - 0.5) * 40 * s; c.lineTo(x, y); } c.stroke(); }
  for (let i = 0; i < RUSH_LANES; i++){ const y = h * (0.2 + i * 0.105); c.fillStyle = 'rgba(60,70,100,.1)'; c.fillRect(0, y - 24 * s, w, 48 * s); c.strokeStyle = 'rgba(232,194,58,.55)'; c.setLineDash([22 * s, 16 * s]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, y - 24 * s); c.lineTo(w, y - 24 * s); c.moveTo(0, y + 24 * s); c.lineTo(w, y + 24 * s); c.stroke(); c.setLineDash([]); }
  c.fillStyle = '#8A2A2A'; c.fillRect(w * 0.3, h * 0.88, w * 0.4, h * 0.12); c.strokeStyle = '#E8C84A'; c.lineWidth = 3; c.strokeRect(w * 0.3 + 8, h * 0.88 + 8, w * 0.4 - 16, h * 0.12 - 16);
  c.fillStyle = '#E8C84A'; c.font = 'bold ' + Math.round(14 * s) + 'px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('ENTRANCE', w / 2, h * 0.955);
}
MINI[TOWER_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'rush', rushFloor, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  const ly = H * 0.1, lw = Math.min(W * 0.5, 420 * s);                                                       /* the elevator doors */
  ctx.fillStyle = '#22262E'; ctx.fillRect(W / 2 - lw / 2 - 10, 0, lw + 20, ly + 6); ctx.fillStyle = m.dingT > 0 ? '#DFF8FF' : '#B8A060'; ctx.fillRect(W / 2 - lw / 2, 0, lw / 2 - 2, ly); ctx.fillRect(W / 2 + 2, 0, lw / 2 - 2, ly);
  ctx.fillStyle = '#E8D890'; ctx.fillRect(W / 2 - lw / 2 + 4, 4, lw / 2 - 10, 6); ctx.fillRect(W / 2 + 6, 4, lw / 2 - 10, 6);
  if (m.dingT > 0){ miniGlow(ctx, W / 2, ly, lw * 0.7, '154,232,255', 0.5 * (m.dingT / 0.9)); }
  miniText(ctx, 'ELEVATOR', W / 2, ly * 0.75, 15 * s, '#2A2238');
  for (let i = 0; i < m.lanes.length; i++){
    const L = m.lanes[i];
    for (let k = 0; k < L.objs.length; k++){
      const o = L.objs[k], x = o.x, y = L.y, d = L.dir;
      if (x < -80 * s || x > W + 80 * s) continue;
      ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x + 4, y + 8 * s, L.w * 0.6, 12 * s, 0, 0, TAU); ctx.fill();
      if (L.kind === 'chair'){
        for (let q = 0; q < 5; q++){ const an = q * TAU / 5 + o.ph * 0.4; ctx.strokeStyle = '#1A1E26'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * 15 * s, y + Math.sin(an) * 15 * s); ctx.stroke(); ctx.fillStyle = '#10141C'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * 16 * s, y + Math.sin(an) * 16 * s, 3.4 * s, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#3E5A8A'; ctx.beginPath(); ctx.arc(x, y, 11 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#5A7AB0'; ctx.beginPath(); ctx.arc(x - 2 * s, y - 2 * s, 7 * s, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#1E2C48'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x - d * 3 * s, y, 11 * s, d > 0 ? Math.PI * 0.62 : -Math.PI * 0.38, d > 0 ? Math.PI * 1.38 : Math.PI * 0.38); ctx.stroke(); ctx.lineCap = 'butt';
      } else if (L.kind === 'trolley'){
        ctx.fillStyle = '#6A707C'; ctx.fillRect(x - L.w / 2, y - 13 * s, L.w, 26 * s); ctx.fillStyle = '#8A909C'; ctx.fillRect(x - L.w / 2, y - 13 * s, L.w, 5 * s);
        const cols = ['#C8A06A', '#E8D8B0', '#B8864A']; for (let q = 0; q < 3; q++){ ctx.fillStyle = cols[q]; ctx.fillRect(x - L.w / 2 + 5 * s + q * 21 * s, y - 8 * s + (q % 2) * 2 * s, 18 * s, 16 * s - (q % 2) * 4 * s); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x - L.w / 2 + 5 * s + q * 21 * s, y - 8 * s + (q % 2) * 2 * s, 18 * s, 3 * s); }
        ctx.fillStyle = '#1A1E26'; for (const wx of [-1, 1]) for (const wy of [-1, 1]) ctx.fillRect(x + wx * (L.w / 2 - 6 * s) - 3 * s, y + wy * 13 * s - 3 * s, 6 * s, 6 * s);
        ctx.strokeStyle = '#3A4050'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x - d * L.w / 2, y - 9 * s); ctx.lineTo(x - d * (L.w / 2 + 12 * s), y - 9 * s); ctx.lineTo(x - d * (L.w / 2 + 12 * s), y + 9 * s); ctx.lineTo(x - d * L.w / 2, y + 9 * s); ctx.stroke();
      } else {
        for (const [rx, ry] of [[1, -1], [1, 1], [-1, -1], [-1, 1]]){ ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rx * 14 * s, y + ry * 12 * s); ctx.stroke(); ctx.fillStyle = 'rgba(40,44,52,.3)'; ctx.beginPath(); ctx.arc(x + rx * 14 * s, y + ry * 12 * s, 9 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1A1E26'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x + rx * 14 * s + Math.cos(o.ph * 3 + rx) * 9 * s, y + ry * 12 * s + Math.sin(o.ph * 3 + rx) * 9 * s); ctx.lineTo(x + rx * 14 * s - Math.cos(o.ph * 3 + rx) * 9 * s, y + ry * 12 * s - Math.sin(o.ph * 3 + rx) * 9 * s); ctx.stroke(); }
        ctx.fillStyle = '#E8B83A'; ctx.beginPath(); ctx.ellipse(x, y, 11 * s, 9 * s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#B8864A'; ctx.fillRect(x - 6 * s, y - 5 * s, 12 * s, 10 * s); ctx.fillStyle = '#E8D8B0'; ctx.fillRect(x - 1 * s, y - 5 * s, 2 * s, 10 * s);
        ctx.fillStyle = '#10141C'; ctx.beginPath(); ctx.arc(x + d * 11 * s, y, 3 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#FF5A4A'; ctx.beginPath(); ctx.arc(x + d * 11.6 * s, y, 1.6 * s, 0, TAU); ctx.fill();
      }
    }
  }
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, -Math.PI / 2, 0.78 * s, p.ph, { moving: p.moving, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
};
