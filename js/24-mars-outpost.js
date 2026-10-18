'use strict';
/* The Mars outpost. */
/* ========================= THE MARS OUTPOST (after the Mutation Vial) ========================= */
/* Once the vial is found, the main menu gains the Mars outpost. Mars Iron is a new resource that exists only here; sulfur and basalt come back, and a
   fourth, argon, can only be had once the Atmospheric Collector is bought. Everything is gathered by scouting trips, and the upgrades grow what you see
   at the base: habitat tiers, machines that make resources on their own while you are out there (each joined to the habitat by a wire that the mice chew
   and the Marines cut), forged trinkets, a better rover and a new card. */
const MARS_UP = [
  { id: 'mh1', grp: 'Habitat', icon: '@t-x-tent', name: 'Pressure Tent', cost: { i: 20, s: 10, b: 10 }, req: [],
    desc: 'An inflatable tent beside the SP-1. The cold builds 20% slower on scouting trips.' },
  { id: 'mh2', grp: 'Habitat', icon: '@t-x-habmodule', name: 'Hab Module', cost: { i: 70, s: 40, b: 40 }, req: ['mh1'],
    desc: 'Sealed metal modules with solar panels. The cold builds 35% slower, and the base warms you up 50% faster.' },
  { id: 'mh3', grp: 'Habitat', icon: '@t-x-dome', name: 'Biodome', cost: { i: 200, s: 100, b: 100, a: 60 }, req: ['mh2'],
    desc: 'A glass dome with a garden inside. The cold builds 50% slower, the base warms you twice as fast, and you start every run with +15 max health.' },
  { id: 'collector', grp: 'Machines', icon: '@t-vacuum-cleaner', name: 'Atmospheric Collector', cost: { i: 40, s: 20, b: 20 }, req: ['mh1'],
    desc: 'A collector strapped to the giraffe’s back. It gathers small amounts of argon from the thin air as she walks around on Mars, on scouting trips and in Chapter 13. Argon cannot be had any other way.' },
  { id: 'collector2', grp: 'Machines', icon: '@t-filter', name: 'Dense Collector', cost: { i: 120, s: 60, b: 60, a: 30 }, req: ['collector'],
    desc: 'Finer filters: the collector gathers argon about 75% faster.' },
  { id: 'drill', grp: 'Machines', icon: '@t-x-drillbit', name: 'Iron Drill', cost: { i: 30, s: 20, b: 30 }, req: ['mh1'],
    desc: 'A drill rig beside the base, joined to the habitat by a wire. While you scout it brings up iron on its own. If the wire is chewed or cut it stops until you walk over it and mend it.' },
  { id: 'sifter', grp: 'Machines', icon: '@t-x-sieve', name: 'Basalt Sifter', cost: { i: 50, s: 30, b: 40 }, req: ['drill'],
    desc: 'A sifting rig that makes basalt on its own while you scout, on a wire of its own.' },
  { id: 'pump', grp: 'Machines', icon: '@t-x-barrel', name: 'Sulfur Pump', cost: { i: 50, s: 30, b: 40 }, req: ['drill'],
    desc: 'A pump that draws sulfur out of the ground while you scout, on a wire of its own.' },
  { id: 'gen', grp: 'Machines', icon: '@t-x-sun', name: 'Solar Generator', cost: { i: 80, s: 60, b: 60 }, req: ['drill'],
    desc: 'A field of solar panels, wired to the habitat. While it is connected every machine works 50% faster.' },
  { id: 'condenser', grp: 'Machines', icon: '@t-flask-2', name: 'Argon Condenser', cost: { i: 120, s: 80, b: 80, a: 40 }, req: ['collector', 'gen'],
    desc: 'A tall condenser that makes argon on its own while you scout, on a wire of its own.' },
  { id: 'shield', grp: 'Machines', icon: '@t-x-cable', name: 'Armoured Cabling', cost: { i: 60, s: 40, b: 40 }, req: ['drill'],
    desc: 'Every wire is armoured: mice take twice as long to chew through it and Marines twice as long to cut it.' },
  { id: 'mforge', grp: 'Trinkets', icon: '@t-x-anvil', name: 'Mars Forge', cost: { i: 60, s: 40, b: 40 }, req: ['mh1'],
    desc: 'A forge beside the base, running on Martian iron. Unlocks the trinkets below.' },
  { id: 't_gauntlet', grp: 'Trinkets', trinket: 'irongauntlet', cost: { i: 80, s: 20, b: 40 }, req: ['mforge'] },
  { id: 't_lamp', grp: 'Trinkets', trinket: 'argonlamp', cost: { i: 60, s: 30, b: 30, a: 40 }, req: ['mforge', 'collector'] },
  { id: 't_veil', grp: 'Trinkets', trinket: 'dustveil', cost: { i: 120, s: 60, b: 60, a: 60 }, req: ['t_gauntlet', 't_lamp', 'mh2'] },
  { id: 'rover2', grp: 'Vehicle', icon: '@t-x-rover', name: 'Rover Mk II', cost: { i: 200, s: 100, b: 120, a: 50 }, req: ['mh2'], venus: 'rover',
    desc: 'An upgrade for the Makeshift Rover, built on Mars: about 25% faster, a much longer battery that recharges quicker, 70% more armour in every chapter, and it pulls pickups in from further away.' },
  { id: 'm_card', grp: 'Gear', icon: '@t-wind', name: 'Dust Devils (card)', cost: { i: 150, s: 80, b: 80, a: 40 }, req: ['mforge'],
    desc: 'Adds the epic card Dust Devils to the cards you can be offered in a run: whirlwinds of red sand that hunt the nearest enemy, grinding it down and slowing it.' }
];
const MARS_BY_ID = {}; MARS_UP.forEach(u => { MARS_BY_ID[u.id] = u; });
const MARS_CUR = [['i', 'iron', 'iron', '#E8764A'], ['s', 'sulfur', 'sulfur', '#F2D43A'], ['b', 'basalt', 'basalt', '#AEB8E0'], ['a', 'argon', 'argon', '#B880FF']];
function marsUnlocked(){ return !!(Save.data && Save.data.mutationVial); }
function marsName(u){ return u.trinket ? TRINKETS[u.trinket].name : u.name; }
function marsIcon(u){ return u.trinket ? TRINKETS[u.trinket].icon : u.icon; }
function marsDesc(u){ return u.trinket ? TRINKETS[u.trinket].desc + ' Equip it from the Gear tab at the trading post.' : u.desc; }
function marsMissing(u){
  const m = u.req.filter(r => !marsHas(r)).map(r => marsName(MARS_BY_ID[r]));
  if (u.venus && !venusHas(u.venus)) m.push('the Venus ' + VENUS_BY_ID[u.venus].name);
  return m;
}
function marsAffordable(u){ const d = Save.data; return (d.iron | 0) >= (u.cost.i || 0) && (d.sulfur | 0) >= (u.cost.s || 0) && (d.basalt | 0) >= (u.cost.b || 0) && (d.argon | 0) >= (u.cost.a || 0); }
function marsBuyCheck(id){
  const u = MARS_BY_ID[id];
  if (!u) return 'unknown';
  if (!marsUnlocked()) return 'locked';
  if (marsHas(id)) return 'owned';
  if (marsMissing(u).length) return 'requires';
  if (!marsAffordable(u)) return 'poor';
  return '';
}
function buyMars(id){
  if (marsBuyCheck(id)) return false;
  const u = MARS_BY_ID[id], d = Save.data;
  d.iron -= u.cost.i || 0; d.sulfur -= u.cost.s || 0; d.basalt -= u.cost.b || 0; d.argon -= u.cost.a || 0;
  if (!d.marsUp) d.marsUp = {};
  d.marsUp[id] = 1;
  if (u.trinket) grantTrinket(u.trinket);
  Save.write(); recalcStats();
  return true;
}
function marsColdMul(){ return marsHas('mh3') ? 0.5 : marsHas('mh2') ? 0.65 : marsHas('mh1') ? 0.8 : 1; }
function marsWarmMul(){ return marsHas('mh3') ? 2 : marsHas('mh2') ? 1.5 : 1; }
function roverSpeedMul(){ return marsHas('rover2') ? 1.85 : 1.5; }
function roverPickupMul(){ return marsHas('rover2') ? 2.2 : 1.7; }
function costText(c){ return MARS_CUR.filter(k => c[k[0]]).map(k => c[k[0]] + ' ' + k[1]).join(' + '); }
/* ---------- the machines, the wires and the base, top-down ---------- */
const MARS_MACH = {
  drill:     { dx: -230, dy: -140, name: 'Iron Drill',      res: 'i', period: 7 },
  sifter:    { dx: 230,  dy: -150, name: 'Basalt Sifter',   res: 'b', period: 9 },
  pump:      { dx: -220, dy: 170,  name: 'Sulfur Pump',     res: 's', period: 9 },
  gen:       { dx: 10,   dy: -270, name: 'Solar Generator', res: null, period: 0 },
  condenser: { dx: 235,  dy: 175,  name: 'Argon Condenser', res: 'a', period: 11 }
};
const MARS_MACH_ORDER = ['drill', 'sifter', 'pump', 'gen', 'condenser'];
function marsMachines(){ return MARS_MACH_ORDER.filter(id => marsHas(id)); }
function drawMarsMachine(ctx, id, x, y, t, on){
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(4, 8, 34, 16, 0, 0, TAU); ctx.fill();
  if (id === 'drill'){
    ctx.fillStyle = '#5A606C'; ctx.fillRect(-26, -20, 52, 40); ctx.fillStyle = '#7A808C'; ctx.fillRect(-22, -16, 44, 32);
    ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(0, 0); ctx.lineTo(18, -14); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.stroke();
    ctx.save(); ctx.rotate(on ? t * 9 : 0.4); ctx.fillStyle = '#E8B040'; ctx.fillRect(-3, -14, 6, 28); ctx.fillRect(-14, -3, 28, 6); ctx.restore(); fillCircle(ctx, 0, 0, 5, '#2A2E38');
  } else if (id === 'sifter'){
    ctx.fillStyle = '#6A4A3A'; ctx.beginPath(); ctx.moveTo(-28, -18); ctx.lineTo(28, -18); ctx.lineTo(18, 20); ctx.lineTo(-18, 20); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2A1A14'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#3A3E52'; ctx.fillRect(-14, 20, 28, 8);
    for (let k = 0; k < 6; k++){ const a = on ? (t * 1.4 + k / 6) % 1 : k / 6; ctx.fillStyle = k % 2 ? '#8A93B8' : '#5A6078'; ctx.fillRect(-12 + (k * 7) % 22, -12 + a * 34, 4, 4); }
  } else if (id === 'pump'){
    ctx.fillStyle = '#B8A030'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 18, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8D050'; ctx.beginPath(); ctx.ellipse(-4, -4, 14, 9, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#4A4E58'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(18, 4); ctx.lineTo(34, 4); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#2A2E38'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 18, 0, 0, TAU); ctx.stroke();
    if (on) for (let k = 0; k < 3; k++){ const a = (t * 0.8 + k / 3) % 1; ctx.globalAlpha = 0.6 * (1 - a); fillCircle(ctx, 30 + a * 14, 4 - a * 18, 3 + a * 6, '#F2E060'); } ctx.globalAlpha = 1;
  } else if (id === 'gen'){
    ctx.fillStyle = '#2A3A6A'; ctx.fillRect(-34, -22, 68, 44); ctx.strokeStyle = '#8AA0D8'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let k = 1; k < 4; k++){ ctx.moveTo(-34 + k * 17, -22); ctx.lineTo(-34 + k * 17, 22); } ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke(); ctx.strokeRect(-34, -22, 68, 44);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + (on ? 0.12 * Math.sin(t * 2) : 0)) + ')'; ctx.fillRect(-34, -22, 68, 14);
  } else {
    ctx.fillStyle = '#5A3A8A'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 26, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#A070E0'; ctx.beginPath(); ctx.ellipse(-5, -6, 8, 14, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2A1A48'; ctx.lineWidth = 2.4; ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(-22, k * 8); ctx.lineTo(22, k * 8); } ctx.stroke();
    if (on) csGlow(ctx, 0, 0, 34, '#B880FF', 0.3 + 0.12 * Math.sin(t * 3));
  }
  if (!on){ ctx.strokeStyle = (Math.sin(t * 6) > 0) ? '#FF4A3A' : '#8A2A22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, 14); ctx.moveTo(14, -14); ctx.lineTo(-14, 14); ctx.stroke(); }
  ctx.restore();
}
/* a wire from a machine to the edge of the base. ok: working; chew: 0-1 how far through a mouse or Marine is */
function drawMarsWire(ctx, x1, y1, x2, y2, ok, t, chew){
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x1 + 2, y1 + 3); ctx.lineTo(x2 + 2, y2 + 3); ctx.stroke();
  if (ok){
    ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = '#E8B040'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    for (let k = 0; k < 5; k++){ const a = (t * 0.7 + k / 5) % 1; fillCircle(ctx, x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, 3, '#FFF2A0'); }
    if (chew > 0){ const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(mx - 18, my - 22, 36, 6); ctx.fillStyle = '#FF8A4A'; ctx.fillRect(mx - 17, my - 21, 34 * clamp(chew, 0, 1), 4); }
  } else {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ux = (x2 - x1) / (Math.hypot(x2 - x1, y2 - y1) || 1), uy = (y2 - y1) / (Math.hypot(x2 - x1, y2 - y1) || 1);
    ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - ux * 14, my - uy * 14); ctx.moveTo(mx + ux * 14, my + uy * 14); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = '#8A6A28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - ux * 14, my - uy * 14); ctx.moveTo(mx + ux * 14, my + uy * 14); ctx.lineTo(x2, y2); ctx.stroke();
    if (Math.sin(t * 9) > 0){ csGlow(ctx, mx - ux * 14, my - uy * 14, 14, '#FFE060', 0.8); csGlow(ctx, mx + ux * 14, my + uy * 14, 14, '#FFE060', 0.8); }
    ctx.fillStyle = (Math.sin(t * 5) > 0) ? '#FF5A3A' : '#FFB070'; ctx.font = '800 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', mx, my - 12); ctx.textAlign = 'left';
  }
  ctx.lineCap = 'butt';
}
function marsWireEnd(dx, dy, bx, by){ const L = Math.hypot(dx, dy) || 1; return { x: bx + dx / L * 62, y: by + dy / L * 62 }; }
/* the SP-1 and whatever has been built beside it. o: { hab: 0-3, t, s } */
function drawMarsBase(ctx, x, y, o){
  o = o || {}; const hab = o.hab | 0, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); if (o.s) ctx.scale(o.s, o.s);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(6, 14, 84, 28, 0, 0, TAU); ctx.fill();
  if (hab >= 3){                                                                      /* the biodome: glass over everything, with a garden inside */
    const cx = 52, cy = -6, r = 150, g = ctx.createRadialGradient(cx - 30, cy - 40, r * 0.1, cx, cy, r);
    g.addColorStop(0, 'rgba(190,255,200,.10)'); g.addColorStop(0.8, 'rgba(150,240,190,.16)'); g.addColorStop(1, 'rgba(200,255,230,.34)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    for (let k = 0; k < 9; k++){ const a = k * 2.4, rr = 40 + (k * 17) % 70; fillCircle(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8 + 20, 7 + (k % 3) * 2, k % 2 ? '#3E8A3A' : '#5AAA4A'); }
  }
  ctx.fillStyle = '#D6DAE4'; ctx.beginPath(); ctx.moveTo(-72, -9); ctx.quadraticCurveTo(10, -17, 80, -3); ctx.lineTo(80, 3); ctx.quadraticCurveTo(10, 17, -72, 9); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#5A606C'; ctx.lineWidth = 2; ctx.stroke();
  for (const sd of [-1, 1]){ ctx.fillStyle = '#B8BCC8'; ctx.beginPath(); ctx.moveTo(14, sd * 8); ctx.lineTo(-38, sd * 46); ctx.lineTo(-54, sd * 42); ctx.lineTo(-30, sd * 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5A606C'; ctx.stroke();
    ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(-50, sd * 41); ctx.lineTo(-54, sd * 42); ctx.lineTo(-44, sd * 33); ctx.fill(); }
  ctx.fillStyle = '#E8662A'; ctx.fillRect(-70, -2, 130, 4); ctx.fillStyle = '#2A4A8A'; ctx.beginPath(); ctx.ellipse(48, 0, 16, 5.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(40, -3, 8, 2);
  ctx.fillStyle = '#4A4E58'; ctx.fillRect(-80, -7, 10, 14);
  if (hab >= 1 && hab < 2){                                                           /* a tent */
    ctx.fillStyle = '#F0E8D8'; ctx.beginPath(); ctx.ellipse(110, -20, 46, 34, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#C8602A'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(110 + k * 14, -52); ctx.quadraticCurveTo(110 + k * 22, -20, 110 + k * 14, 12); } ctx.stroke();
    ctx.fillStyle = '#7A5A3A'; ctx.fillRect(100, 8, 20, 8);
  } else if (hab >= 2){                                                               /* modules, a tunnel and panels */
    ctx.fillStyle = '#7A8294'; ctx.fillRect(76, -8, 24, 16);
    for (const [bx, by, w, h] of [[98, -62, 80, 54], [98, 8, 80, 50]]){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(bx + 5, by + 7, w, h); ctx.fillStyle = '#6A7386'; ctx.fillRect(bx, by, w, h); ctx.fillStyle = '#B8C2D2'; ctx.fillRect(bx + 4, by + 4, w - 8, h - 8); ctx.fillStyle = '#7FD8FF'; for (let k = 0; k < 3; k++) ctx.fillRect(bx + 10 + k * 22, by + 10, 14, 8); }
    for (let k = 0; k < 3; k++){ ctx.fillStyle = '#2A4A8A'; ctx.fillRect(184, -60 + k * 38, 40, 30); ctx.strokeStyle = 'rgba(170,205,255,.6)'; ctx.lineWidth = 1; ctx.strokeRect(184, -60 + k * 38, 40, 30); ctx.beginPath(); ctx.moveTo(204, -60 + k * 38); ctx.lineTo(204, -30 + k * 38); ctx.stroke(); }
    fillCircle(ctx, 140, -2, 6, (Math.sin(t * 4) > 0) ? '#5CE08A' : '#2A5A3A');
  }
  if (hab >= 3){ const cx = 52, cy = -6, r = 150; ctx.strokeStyle = 'rgba(225,246,255,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(225,246,255,.4)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k < 10; k++){ const a = k / 10 * TAU; ctx.moveTo(cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.stroke(); }
  if (marsHas('mforge')){ ctx.fillStyle = '#3A3430'; ctx.fillRect(-150, 40, 54, 38); ctx.fillStyle = '#5A524A'; ctx.fillRect(-146, 44, 46, 30); csGlow(ctx, -124, 60, 22, '#FF7A1E', 0.55 + 0.2 * Math.sin(t * 5)); ctx.fillStyle = '#2A2622'; ctx.fillRect(-104, 36, 9, 18);
    for (let k = 0; k < 3; k++){ const a = (t * 0.6 + k / 3) % 1; ctx.globalAlpha = 0.5 * (1 - a); fillCircle(ctx, -100 + Math.sin(k + t) * 4, 30 - a * 36, 4 + a * 9, '#7A726A'); } ctx.globalAlpha = 1; }
  ctx.restore();
}
/* the base with its machines and wires, in world units around (bx, by); ok maps a machine id to whether its wire is whole (default: all whole), chew to its progress */
function drawMarsSite(ctx, bx, by, t, ok, chew, bs){
  const ms = marsMachines();
  for (let i = 0; i < ms.length; i++){ const m = MARS_MACH[ms[i]], e = marsWireEnd(m.dx, m.dy, bx, by); drawMarsWire(ctx, bx + m.dx, by + m.dy + 14, e.x, e.y, ok ? ok[ms[i]] !== false : true, t, chew ? chew[ms[i]] || 0 : 0); }
  drawMarsBase(ctx, bx, by, { hab: marsHabTier(), t: t, s: bs || 0.8 });
  for (let i = 0; i < ms.length; i++){ const m = MARS_MACH[ms[i]]; drawMarsMachine(ctx, ms[i], bx + m.dx, by + m.dy, t, ok ? ok[ms[i]] !== false : true); }
}
function drawMarsBaseView(cv){
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const W = cv.width, H = cv.height, k = Math.min(W / 660, H / 640), b = marsBasePos();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-b.x, -b.y);
  drawMarsTerrain(ctx, b.x - W / k / 2, b.y - H / k / 2, W / k, H / k, 1.3, ARENA_W, ARENA_H);
  drawMarsSite(ctx, b.x, b.y, 1.3, null, null, 0.8);
  if (marsHas('collector')) drawMarsCollectorAt(ctx, b.x - 70, b.y + 120, 1.3);
  if (venusHas('rover')) drawRoverTop(ctx, b.x + 150, b.y + 130, -0.3, { t: 1.3, mk2: marsHas('rover2') });
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, H - 26, W, 26); ctx.fillStyle = '#FFE0C8'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Habitat: ' + ['The bare SP-1', 'Pressure Tent', 'Hab Module', 'Biodome'][marsHabTier()] + '   ·   Machines: ' + marsMachines().length, W / 2, H - 9); ctx.textAlign = 'left';
}
function drawMarsCollectorAt(ctx, x, y, t){ ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#C8CCD6'; ctx.fillRect(-12, -8, 24, 16); ctx.strokeStyle = '#5A606C'; ctx.lineWidth = 1.4; ctx.strokeRect(-12, -8, 24, 16); ctx.fillStyle = '#7A3AC8'; ctx.fillRect(-9, -5, 8, 10); ctx.save(); ctx.translate(5, 0); ctx.rotate(t * 3); ctx.fillStyle = '#4A5060'; ctx.fillRect(-4.6, -1, 9.2, 2); ctx.fillRect(-1, -4.6, 2, 9.2); ctx.restore(); ctx.restore(); }
/* ---------- the outpost screen ---------- */
let marsTab = 'scout';
function marsButtonHTML(){
  if (!marsUnlocked()) return '';
  return '<button class="btn ghost" data-a="mars">Mars outpost<small>' + (Save.data.iron | 0) + ' iron · ' + (Save.data.argon | 0) + ' argon · ' + (Save.data.sulfur | 0) + ' sulfur · ' + (Save.data.basalt | 0) + ' basalt</small></button>';
}
function marsWorkshopHTML(){
  let out = '<p class="sub">Everything here is paid for in Martian iron, sulfur, basalt and (for the later upgrades) argon. Some things need an earlier upgrade first, and what you build appears in the picture above.</p><div class="shoplist">';
  let grp = '';
  for (let i = 0; i < MARS_UP.length; i++){
    const u = MARS_UP[i];
    if (u.grp !== grp){ grp = u.grp; out += '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">' + grp + '</div>'; }
    const why = marsBuyCheck(u.id), owned = why === 'owned', missing = marsMissing(u);
    out += '<div class="shoprow"' + (why === 'requires' ? ' style="opacity:.55"' : '') + '>' +
      '<div class="ic">' + ico(marsIcon(u)) + '</div>' +
      '<div class="txt"><div class="nm">' + marsName(u) + (owned ? ' ✔' : '') + '</div><div class="ds">' + marsDesc(u) + '</div>' +
        (why === 'requires' ? '<div class="ds" style="color:#E8A060">Requires: ' + missing.join(', ') + '</div>' : '') + '</div>' +
      (owned ? '<div class="maxed">Owned</div>'
        : '<button class="btn sm buy' + (why ? ' ghost' : '') + '" data-mbuy="' + u.id + '"' + (why ? ' disabled' : '') + '>' + (why === 'requires' ? 'Locked' : 'Build') + '<br><small>' + costText(u.cost) + '</small></button>') +
      '</div>';
  }
  return out + '</div>';
}
function showMars(tab){
  if (!marsUnlocked()){ showMenu(); return; }
  G.state = 'shop'; G.attract = true; G.marsScreen = true; G.venusScreen = false; G.labScreen = false; HUD.classList.remove('on');
  if (tab) marsTab = tab;
  const d = Save.data;
  const body = marsTab === 'work' ? marsWorkshopHTML() :
    '<p class="sub">The SP-1 sits on the red plain where it landed. Walk out and bring back <b>Martian iron</b>, sulfur and basalt: pick it up off the ground, or kick rubble open for more. ' +
    'The cold builds whenever you are away from the base, and faster inside the dust storms; at full cold you start losing health. The base warms you up and banks what you carry, and <b>anything still carried when the trip ends is lost</b>. ' +
    'A trip lasts 2½ minutes. ' + (marsMachines().length ? 'Your machines work on their own while you are out, but every one hangs on a wire to the base: <b>Mars mice chew the wires, and Space Marines cut them</b> (or shoot you), so keep an eye on the red "!" marks and walk over a broken wire to mend it. ' : 'Build machines in the workshop and they will work for you while you scout. ') +
    (marsHas('collector') ? 'Your collector gathers argon as you walk.' : 'Argon needs the Atmospheric Collector.') + '</p>' +
    '<button class="btn" data-a="mars-scout" style="margin:6px auto 4px;display:block">Scout Mars</button>';
  setOverlay(
    '<div class="panel slab">' +
      '<div class="goldline">' + MARS_CUR.map(k => '<span class="goldnum" style="color:' + k[3] + '">' + (d[k[2]] | 0) + '</span><span class="sub" style="margin:0">' + k[1] + '</span>').join('') + '</div>' +
      '<h2 class="head">Mars outpost</h2>' +
      '<canvas id="marsBase" width="720" height="300" style="width:100%;border-radius:6px;border:1px solid var(--bark2);margin:2px 0 8px"></canvas>' +
      '<div class="tabs"><button class="tab' + (marsTab === 'scout' ? ' on' : '') + '" data-a="mars-tab-scout">Scout</button><button class="tab' + (marsTab === 'work' ? ' on' : '') + '" data-a="mars-tab-work">Workshop</button></div>' +
      body +
      '<div class="row" style="margin-top:12px"><button class="btn ghost" data-a="menu">Main menu</button></div>' +
    '</div>');
  drawMarsBaseView(document.getElementById('marsBase'));
}
/* ---------- the Scout Mars minigame ---------- */
/* Like the Venus scouting trip, with the cold instead of the heat, Martian iron among the finds, and the wires: each machine hangs on a wire to the base,
   Mars mice (which only exist here, cannot be hurt and do not bother her) chew them, and Marines go for whichever is nearer, the giraffe or a wire (they
   can only shoot the giraffe). A broken wire stops its machine until she walks over it. */
const MS_COLD_RATE = 6, MS_STORM_EXTRA = 9, MS_WARM_RATE = 34, MS_FREEZE = 11, MS_BASE_HEAL = 3, MS_MARINE_DMG = 4;
const MS_RUBBLE = {
  drift:    { name: 'Dust drift',      hp: 2, r: 26, yield: [2, 3],  mix: { i: 0.5, s: 0.25, b: 0.25 }, w: 3.0, min: 150 },
  ironrock: { name: 'Iron boulder',    hp: 3, r: 30, yield: [3, 5],  mix: { i: 0.85, s: 0.05, b: 0.1 }, w: 2.6, min: 150 },
  crust:    { name: 'Sulfur crust',    hp: 3, r: 28, yield: [4, 6],  mix: { i: 0.15, s: 0.85, b: 0 },   w: 1.8, min: 400 },
  slab:     { name: 'Basalt slab',     hp: 4, r: 30, yield: [4, 6],  mix: { i: 0.15, s: 0, b: 0.85 },   w: 1.8, min: 400 },
  geode:    { name: 'Ore geode',       hp: 4, r: 28, yield: [5, 7],  mix: { i: 0.34, s: 0.33, b: 0.33 }, w: 1.4, min: 700 },
  meteor:   { name: 'Iron meteorite',  hp: 6, r: 32, yield: [8, 11], mix: { i: 0.9, s: 0, b: 0.1 },     w: 0.6, min: 1200 }
};
function msZone(){ const z = SCOUT_ZONES[marsHabTier()]; return { x: SCOUT_POD.x + z.dx, y: SCOUT_POD.y + z.dy, r: z.r }; }
function msPickType(d){ const ids = Object.keys(MS_RUBBLE).filter(id => MS_RUBBLE[id].min <= d); let tot = 0; ids.forEach(id => { tot += MS_RUBBLE[id].w; }); let r = Math.random() * tot; for (const id of ids){ r -= MS_RUBBLE[id].w; if (r <= 0) return id; } return ids[0]; }
function msRoll(mix){ const r = Math.random(); return r < mix.i ? 'i' : r < mix.i + mix.s ? 's' : 'b'; }
function startMScout(){
  if (!marsUnlocked()){ SFX.deny(); return false; }
  const ms = marsMachines();
  const sc = G.mscout = { t: 0, left: SCOUT_TIME, x: SCOUT_POD.x + 70, y: SCOUT_POD.y + 40, face: 0, anim: 0, hp: 100, cold: 0, carryI: 0, carryS: 0, carryB: 0, carryA: 0,
    gotI: 0, gotS: 0, gotB: 0, gotA: 0, lostI: 0, lostS: 0, lostB: 0, lostA: 0, items: [], rubble: [], storms: [], pops: [], kickCd: 0, swing: 0, done: false, reason: '', inBase: true,
    inStorm: false, warnedCold: false, warnedTime: false, prevBiome: G.biome, broke: 0, invuln: 0, hurtT: 0, killer: '', foes: [], mice: [], wires: [], machT: {}, ramCd: 0, walkAcc: 0,
    rover: venusHas('rover') ? { x: SCOUT_POD.x + 130, y: SCOUT_POD.y + 60, ang: 0.3, battery: 100, riding: false } : null,
    nextMarine: 20 + Math.random() * 25, nextMouse: 8 + Math.random() * 6, marinesKilled: 0, wiresMended: 0, wiresLost: 0, made: { i: 0, s: 0, b: 0, a: 0 } };
  for (let i = 0; i < ms.length; i++){ const m = MARS_MACH[ms[i]], e = marsWireEnd(m.dx, m.dy, SCOUT_POD.x, SCOUT_POD.y);
    sc.wires.push({ id: ms[i], mx: SCOUT_POD.x + m.dx, my: SCOUT_POD.y + m.dy + 14, bx: e.x, by: e.y, ok: true, chew: 0, by2: '' }); sc.machT[ms[i]] = Math.random() * 3; }
  const avoid = [{ x: SCOUT_POD.x, y: SCOUT_POD.y, r: 330 }];
  for (let i = 0; i < ms.length; i++){ const m = MARS_MACH[ms[i]]; avoid.push({ x: SCOUT_POD.x + m.dx, y: SCOUT_POD.y + m.dy, r: 60 }); }
  for (let i = 0; i < 12; i++){ const r = 85 + Math.random() * 55, p = scoutSpot(380, 2000, avoid, 60); sc.storms.push({ x: p.x, y: p.y, r: r, ph: Math.random() * TAU }); avoid.push({ x: p.x, y: p.y, r: r * 1.2 }); }
  for (let i = 0; i < SCOUT_RUBBLE; i++){ const p = scoutSpot(190, 2100, avoid, 40), type = msPickType(p.d), T = MS_RUBBLE[type]; sc.rubble.push({ x: p.x, y: p.y, r: T.r, type: type, hp: T.hp, maxHp: T.hp, shake: 0, seed: Math.random() * 9 }); avoid.push({ x: p.x, y: p.y, r: T.r }); }
  for (let i = 0; i < SCOUT_ITEMS; i++){ const p = scoutSpot(150, 2050, avoid, 14); sc.items.push({ x: p.x, y: p.y, t: msRoll({ i: 0.5, s: 0.25, b: 0.25 }), ph: Math.random() * TAU }); avoid.push({ x: p.x, y: p.y, r: 16 }); }
  G.enemies.length = 0; G.eproj.length = 0; G.bossAlive = false; G.boss = null;
  G.state = 'mscout'; G.attract = false; G.biome = 'mars';
  P.x = sc.x; P.y = sc.y; P.vx = 0; P.vy = 0; P.face = 0; P.aim = 0;
  hideOverlay(); HUD.classList.remove('on'); PAUSEBTN.classList.remove('on');
  if (Input.hasTouch) TOUCH.classList.add('on'); else TOUCH.classList.remove('on');
  return true;
}
function msPop(x, y, txt, col){ G.mscout.pops.push({ x: x, y: y, t: 0, txt: txt, col: col }); }
function msBank(sc){
  if (!sc.carryI && !sc.carryS && !sc.carryB && !sc.carryA) return;
  const d = Save.data; d.iron = (d.iron | 0) + sc.carryI; d.sulfur = (d.sulfur | 0) + sc.carryS; d.basalt = (d.basalt | 0) + sc.carryB; d.argon = (d.argon | 0) + sc.carryA;
  sc.gotI += sc.carryI; sc.gotS += sc.carryS; sc.gotB += sc.carryB; sc.gotA += sc.carryA;
  msPop(SCOUT_POD.x, SCOUT_POD.y - 70, '+' + sc.carryI + ' iron  +' + sc.carryS + ' sulfur  +' + sc.carryB + ' basalt' + (sc.carryA ? '  +' + sc.carryA + ' argon' : ''), '#FFD0A8');
  sc.carryI = sc.carryS = sc.carryB = sc.carryA = 0; Save.write(); SFX.buy();
}
function msHurt(sc, n, src, invuln){
  if (sc.invuln > 0 || sc.done) return false;
  sc.hp -= n; sc.invuln = invuln || 0.6; sc.hurtT = 0.3; sc.killer = src; msPop(sc.x, sc.y - 50, '-' + n, '#FF8A7A'); sfx('hurt', 0.15);
  return true;
}
function msHitRubble(sc, r){
  r.hp--; r.shake = 0.22; sfx('hit', 0.07);
  for (let k = 0; k < 5; k++) sc.pops.push({ x: r.x, y: r.y, t: 0, dust: true, vx: rand(-90, 90), vy: rand(-90, 40) });
  if (r.hp > 0) return;
  const T = MS_RUBBLE[r.type] || MS_RUBBLE.drift, n = scoutRandInt(T.yield[0], T.yield[1]);
  for (let k = 0; k < n; k++){ const a = Math.random() * TAU, dd = 24 + Math.random() * 34; sc.items.push({ x: clamp(r.x + Math.cos(a) * dd, 40, SCOUT_W - 40), y: clamp(r.y + Math.sin(a) * dd, 40, SCOUT_H - 40), t: msRoll(T.mix), ph: Math.random() * TAU }); }
  sc.rubble.splice(sc.rubble.indexOf(r), 1); sc.broke++; sfx('boom', 0.06); addShake(3);
}
function msHitFoe(sc, e, n){
  if (e.dead) return;
  e.hp -= n; e.flash = 0.15; sfx('hit', 0.08); sc.pops.push({ x: e.x, y: e.y, t: 0, dust: true, vx: rand(-60, 60), vy: rand(-60, 30) });
  if (e.hp <= 0){
    e.dead = true; sc.marinesKilled++; msPop(e.x, e.y - 30, 'Marine down!', '#9FE8FF');
    for (let k = 0; k < 3; k++){ const a = Math.random() * TAU; sc.items.push({ x: clamp(e.x + Math.cos(a) * 30, 40, SCOUT_W - 40), y: clamp(e.y + Math.sin(a) * 30, 40, SCOUT_H - 40), t: k === 0 ? 'i' : k === 1 ? 's' : 'b', ph: k }); }
  }
}
function msKick(sc){
  let best = null, bd = 1e9, isFoe = false;
  for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i], d = Math.hypot(r.x - sc.x, r.y - sc.y) - r.r; if (d < 64 && d < bd){ bd = d; best = r; } }
  for (let i = 0; i < sc.foes.length; i++){ const e = sc.foes[i]; if (e.dead) continue; const d = Math.hypot(e.x - sc.x, e.y - sc.y) - e.r; if (d < 64 && d < bd){ bd = d; best = e; isFoe = true; } }
  sc.kickCd = 0.38; sc.swing = 0.24;
  if (!best) return;
  sc.face = Math.atan2(best.y - sc.y, best.x - sc.x);
  if (isFoe) msHitFoe(sc, best, 45); else msHitRubble(sc, best);
}
function msSegDist(px, py, x1, y1, x2, y2){
  const abx = x2 - x1, aby = y2 - y1, t = clamp(((px - x1) * abx + (py - y1) * aby) / (abx * abx + aby * aby || 1), 0, 1), qx = x1 + abx * t, qy = y1 + aby * t;
  return { d: Math.hypot(px - qx, py - qy), x: qx, y: qy };
}
/* which wire is nearest to (x, y), among those still whole */
function msNearestWire(sc, x, y){
  let best = null, bd = 1e9;
  for (let i = 0; i < sc.wires.length; i++){ const w = sc.wires[i]; if (!w.ok) continue; const s = msSegDist(x, y, w.mx, w.my, w.bx, w.by); if (s.d < bd){ bd = s.d; best = { w: w, d: s.d, x: s.x, y: s.y }; } }
  return best;
}
function msBreakWire(sc, w, who){
  w.ok = false; w.chew = 0; w.by2 = who; sc.wiresLost++;
  msPop((w.mx + w.bx) / 2, (w.my + w.by) / 2 - 24, who === 'mouse' ? 'A mouse chewed the ' + MARS_MACH[w.id].name + '’s wire!' : 'A Marine cut the ' + MARS_MACH[w.id].name + '’s wire!', '#FF9A6A'); sfx('zap', 0.1);
}
function msSpawnMouse(sc){
  const live = sc.wires.filter(w => w.ok); if (!live.length || sc.mice.length >= 3) return;
  const w = live[Math.floor(Math.random() * live.length)], a = Math.random() * TAU, tt = 0.3 + Math.random() * 0.4;
  sc.mice.push({ x: clamp(SCOUT_POD.x + Math.cos(a) * 820, 80, SCOUT_W - 80), y: clamp(SCOUT_POD.y + Math.sin(a) * 820, 80, SCOUT_H - 80), w: w, tx: w.mx + (w.bx - w.mx) * tt, ty: w.my + (w.by - w.my) * tt, state: 'run', t: 0, ang: 0, anim: Math.random() * 6 });
}
function msUpdateMouse(sc, m, dt){
  m.anim += dt * 12; const shield = marsHas('shield') ? 2 : 1;
  if (m.state === 'run'){
    if (!m.w.ok){ m.state = 'flee'; m.t = 0; return; }
    const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy) || 1; m.ang = Math.atan2(dy, dx); m.x += dx / d * 120 * dt; m.y += dy / d * 120 * dt;
    if (d < 8){ m.state = 'chew'; m.t = 0; }
  } else if (m.state === 'chew'){
    if (!m.w.ok){ m.state = 'flee'; m.t = 0; return; }
    m.t += dt; m.w.chew = m.t / (3.2 * shield);
    if (Math.random() < dt * 14) sc.pops.push({ x: m.x, y: m.y, t: 0, dust: true, vx: rand(-40, 40), vy: rand(-50, -10) });
    if (m.t >= 3.2 * shield){ msBreakWire(sc, m.w, 'mouse'); m.state = 'flee'; m.t = 0; }
  } else {
    m.t += dt; const dx = m.x - SCOUT_POD.x, dy = m.y - SCOUT_POD.y, d = Math.hypot(dx, dy) || 1; m.ang = Math.atan2(dy, dx); m.x += dx / d * 170 * dt; m.y += dy / d * 170 * dt;
    if (m.t > 6 || m.x < 40 || m.y < 40 || m.x > SCOUT_W - 40 || m.y > SCOUT_H - 40) m.dead = true;
  }
}
function msSpawnMarine(sc){
  const p = scoutFoeSpawnPoint(sc, 800), e = scoutMakeFoe('hyena', 176, p.x, p.y);
  if (!e) return;
  e.kind = 'marine'; e.hp = e.maxHp = 90; e.state = 'idle'; e.stateT = 1.2; e.cutT = 0; sc.foes.push(e);
  msPop(sc.x, sc.y - 80, 'A Space Marine has landed!', '#9FE8FF');
}
/* a Marine goes for whichever is nearer, the giraffe or one of the wires; it can only shoot the giraffe */
function msUpdateMarine(sc, e, dt){
  const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, prev = e.state, shield = marsHas('shield') ? 2 : 1;
  const nw = msNearestWire(sc, e.x, e.y);
  e.spdE = e.spd * 0.6;
  if (nw && nw.d < d - 20){                                                    /* a wire is nearer: walk to it and cut it */
    const ex = nw.x - e.x, ey = nw.y - e.y, ed = Math.hypot(ex, ey) || 1; e.ang = Math.atan2(ey, ex);
    if (ed > 26){ e.x += ex / ed * e.spdE * dt; e.y += ey / ed * e.spdE * dt; e.cutT = 0; e.cutting = null; }
    else { e.cutting = nw.w; e.cutT = (e.cutT || 0) + dt; nw.w.chew = e.cutT / (2.4 * shield); if (Math.random() < dt * 12) sc.pops.push({ x: e.x, y: e.y, t: 0, dust: true, vx: rand(-40, 40), vy: rand(-40, 10) }); if (e.cutT >= 2.4 * shield){ msBreakWire(sc, nw.w, 'marine'); e.cutT = 0; e.cutting = null; } }
  } else {
    if (e.cutting){ e.cutting.chew = 0; e.cutting = null; e.cutT = 0; }
    const mv = MARINE_AI.m_rifle(e, dt, dx / d, dy / d, d);
    if (prev === 'burst' && e.state === 'idle') e.stateT = 2.4 + Math.random() * 1.4;
    e.x = e.x + mv[0] * dt; e.y = e.y + mv[1] * dt;
  }
  e.x = clamp(e.x, 60, SCOUT_W - 60); e.y = clamp(e.y, 60, SCOUT_H - 60);
  e.anim += dt * 6; if (e.flash > 0) e.flash -= dt;
}
function mscoutToggleRover(){
  const sc = G.mscout;
  if (!sc || sc.done || !sc.rover) return false;
  const r = sc.rover;
  if (r.riding){ r.riding = false; r.x = sc.x; r.y = sc.y; msPop(sc.x, sc.y - 50, 'Got out of the rover', '#E8ECF8'); return true; }
  if (Math.hypot(sc.x - r.x, sc.y - r.y) > 90){ msPop(sc.x, sc.y - 50, 'Walk to the rover first', '#FFD86A'); return false; }
  if (r.battery < 1){ msPop(sc.x, sc.y - 50, 'Battery flat: park it by the base to recharge', '#FF8A5A'); return false; }
  r.riding = true; sc.face = r.ang; msPop(sc.x, sc.y - 50, 'Rover on!', '#9FE8FF'); sfx('pickupS', 0.05);
  return true;
}
function updateMScout(dt){
  G.time += dt; updateParticles(dt);
  const sc = G.mscout;
  if (!sc || sc.done) return;
  sc.t += dt; sc.left -= dt; sc.anim += dt;
  if (sc.invuln > 0) sc.invuln -= dt; if (sc.hurtT > 0) sc.hurtT -= dt;
  const rv = sc.rover, riding = !!(rv && rv.riding), mk2 = marsHas('rover2');
  const inp = playerInputVector(), speed = riding ? (mk2 ? 440 : SCOUT_ROVER_SPEED) : SCOUT_SPEED;
  const ox = sc.x, oy = sc.y;
  sc.x = clamp(sc.x + inp.x * speed * dt, 40, SCOUT_W - 40); sc.y = clamp(sc.y + inp.y * speed * dt, 40, SCOUT_H - 40);
  if (inp.m > 0.1) sc.face = Math.atan2(inp.y, inp.x);
  P.x = sc.x; P.y = sc.y; P.vx = inp.x * speed; P.vy = inp.y * speed; P.face = sc.face; P.aim = sc.face;
  if (riding){ rv.x = sc.x; rv.y = sc.y; rv.ang = sc.face; }
  if (marsHas('collector') && !riding){                                                  /* the collector: argon as she walks */
    sc.walkAcc += Math.hypot(sc.x - ox, sc.y - oy); const step = marsHas('collector2') ? 170 : 300;
    while (sc.walkAcc >= step){ sc.walkAcc -= step; sc.carryA++; msPop(sc.x, sc.y - 36, '+1 argon', '#C8A0FF'); }
  }
  const zone = msZone();
  sc.inBase = Math.hypot(sc.x - zone.x, sc.y - zone.y) < zone.r;
  sc.inStorm = false;
  for (let i = 0; i < sc.storms.length; i++) if (Math.hypot(sc.x - sc.storms[i].x, sc.y - sc.storms[i].y) < sc.storms[i].r) sc.inStorm = true;
  if (sc.inBase){
    sc.cold = Math.max(0, sc.cold - MS_WARM_RATE * marsWarmMul() * dt); sc.hp = Math.min(100, sc.hp + MS_BASE_HEAL * dt); msBank(sc);
    if (sc.cold < 40) sc.warnedCold = false;
  } else if (!riding){
    sc.cold = Math.min(100, sc.cold + (MS_COLD_RATE + (sc.inStorm ? MS_STORM_EXTRA : 0)) * marsColdMul() * dt);
    if (sc.cold >= 75 && !sc.warnedCold){ sc.warnedCold = true; msPop(sc.x, sc.y - 70, 'Freezing! Back to the base!', '#9FD8FF'); }
  }
  if (sc.cold >= 100){ sc.hp -= MS_FREEZE * dt; sc.killer = 'cold'; }
  if (rv){
    if (riding){ rv.battery = Math.max(0, rv.battery - (mk2 ? 2 : 3) * dt); if (rv.battery <= 0){ rv.riding = false; rv.x = sc.x; rv.y = sc.y; msPop(sc.x, sc.y - 60, 'Battery flat! On foot from here.', '#FF8A5A'); } }
    else if (Math.hypot(rv.x - zone.x, rv.y - zone.y) < zone.r) rv.battery = Math.min(100, rv.battery + (mk2 ? 40 : 25) * dt);
  }
  const reach = riding ? 40 : 30;
  for (let i = sc.items.length - 1; i >= 0; i--){
    const it = sc.items[i];
    if (Math.hypot(it.x - sc.x, it.y - sc.y) < reach){
      sc.items.splice(i, 1); if (it.t === 'i') sc.carryI++; else if (it.t === 's') sc.carryS++; else sc.carryB++;
      msPop(it.x, it.y - 10, it.t === 'i' ? '+1 iron' : it.t === 's' ? '+1 sulfur' : '+1 basalt', it.t === 'i' ? '#FF9A6A' : it.t === 's' ? '#FFE27A' : '#B8C4E8'); sfx('pickupS', 0.04);
    }
  }
  sc.kickCd -= dt; sc.ramCd -= dt; if (sc.swing > 0) sc.swing -= dt;
  for (let i = 0; i < sc.rubble.length; i++) if (sc.rubble[i].shake > 0) sc.rubble[i].shake -= dt;
  if (riding && sc.ramCd <= 0 && inp.m > 0.1){
    for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i]; if (Math.hypot(r.x - sc.x, r.y - sc.y) < r.r + 30){ msHitRubble(sc, r); sc.ramCd = 0.4; break; } }
    if (sc.ramCd <= 0) for (let i = 0; i < sc.foes.length; i++){ const e = sc.foes[i]; if (!e.dead && Math.hypot(e.x - sc.x, e.y - sc.y) < e.r + 30){ msHitFoe(sc, e, 45); sc.ramCd = 0.4; break; } }
  }
  if (!riding && (Input.mdown || Input.touchKick || Input.keys[keyOf('kick')] || Settings.autoKick) && sc.kickCd <= 0){
    let near = false;
    for (let i = 0; i < sc.rubble.length && !near; i++) if (Math.hypot(sc.rubble[i].x - sc.x, sc.rubble[i].y - sc.y) - sc.rubble[i].r < 64) near = true;
    for (let i = 0; i < sc.foes.length && !near; i++) if (!sc.foes[i].dead && Math.hypot(sc.foes[i].x - sc.x, sc.foes[i].y - sc.y) - sc.foes[i].r < 64) near = true;
    if (near || Input.mdown || Input.touchKick || Input.keys[keyOf('kick')]) msKick(sc);
  }
  /* the wires: walking over a broken one mends it */
  for (let i = 0; i < sc.wires.length; i++){
    const w = sc.wires[i];
    if (!w.ok){ if (msSegDist(sc.x, sc.y, w.mx, w.my, w.bx, w.by).d < 36){ w.ok = true; w.chew = 0; sc.wiresMended++; msPop(sc.x, sc.y - 40, 'Wire mended!', '#9FE8A8'); sfx('level', 0.05); } }
    else if (w.chew > 0 && !sc.mice.some(m => m.w === w && m.state === 'chew') && !sc.foes.some(e => e.cutting === w)) w.chew = Math.max(0, w.chew - dt * 0.5);
  }
  /* the machines: each works while its own wire is whole */
  const genOn = sc.wires.some(w => w.id === 'gen' && w.ok), boost = genOn ? 1.5 : 1;
  for (let i = 0; i < sc.wires.length; i++){
    const w = sc.wires[i], m = MARS_MACH[w.id]; if (!m.res || !w.ok) continue;
    if (w.id === 'condenser' && !marsHas('collector')) continue;
    sc.machT[w.id] += dt * boost;
    if (sc.machT[w.id] >= m.period){ sc.machT[w.id] -= m.period; const d = Save.data; const key = m.res === 'i' ? 'iron' : m.res === 'b' ? 'basalt' : m.res === 's' ? 'sulfur' : 'argon'; d[key] = (d[key] | 0) + 1; sc.made[m.res]++; if (m.res === 'i') sc.gotI++; else if (m.res === 'b') sc.gotB++; else if (m.res === 's') sc.gotS++; else sc.gotA++; msPop(w.mx, w.my - 30, '+1 ' + key, '#C8E8B8'); Save.write(); }
  }
  /* visitors: mice (only if there is a wire to chew) and Marines */
  sc.nextMouse -= dt; if (sc.nextMouse <= 0){ sc.nextMouse = 11 + Math.random() * 8; if (sc.wires.length) msSpawnMouse(sc); }
  sc.nextMarine -= dt; if (sc.nextMarine <= 0){ sc.nextMarine = 26 + Math.random() * 14; if (sc.foes.length < 2) msSpawnMarine(sc); }
  for (let i = sc.mice.length - 1; i >= 0; i--){ msUpdateMouse(sc, sc.mice[i], dt); if (sc.mice[i].dead) sc.mice.splice(i, 1); }
  for (let i = sc.foes.length - 1; i >= 0; i--){ msUpdateMarine(sc, sc.foes[i], dt); if (sc.foes[i].dead) sc.foes.splice(i, 1); }
  for (let i = G.eproj.length - 1; i >= 0; i--){                                          /* the Marines' rounds: they can only hurt the giraffe */
    const p = G.eproj[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (Math.hypot(p.x - sc.x, p.y - sc.y) < 20){ msHurt(sc, MS_MARINE_DMG, 'marine', 0.5); G.eproj.splice(i, 1); }
    else if (p.life <= 0 || p.x < 0 || p.y < 0 || p.x > SCOUT_W || p.y > SCOUT_H) G.eproj.splice(i, 1);
  }
  for (let i = sc.pops.length - 1; i >= 0; i--){ const p = sc.pops[i]; p.t += dt; if (p.dust){ p.x += p.vx * dt; p.y += p.vy * dt; } if (p.t > (p.dust ? 0.5 : 1.1)) sc.pops.splice(i, 1); }
  if (sc.left <= 15 && !sc.warnedTime){ sc.warnedTime = true; msPop(sc.x, sc.y - 90, 'Back to the base: the trip is ending!', '#FFD86A'); }
  if (sc.hp <= 0) endMScout(sc.killer === 'cold' || !sc.killer ? 'collapse' : 'downed');
  else if (sc.left <= 0) endMScout('time');
}
function endMScout(reason){
  const sc = G.mscout;
  if (!sc || sc.done) return;
  sc.done = true; sc.reason = reason;
  if (sc.inBase) msBank(sc);
  sc.lostI = sc.carryI; sc.lostS = sc.carryS; sc.lostB = sc.carryB; sc.lostA = sc.carryA; sc.carryI = sc.carryS = sc.carryB = sc.carryA = 0;
  if (sc.rover) sc.rover.riding = false;
  sc.foes.length = 0; sc.mice.length = 0; G.eproj.length = 0;
  G.biome = sc.prevBiome || 'savanna';
  Save.write(); TOUCH.classList.remove('on'); SFX.level();
  const why = reason === 'collapse' ? 'The cold got to her. She collapsed, and what she was carrying was lost.'
    : reason === 'downed' ? 'She was knocked out, and what she was carrying was lost.' : reason === 'time' ? 'The trip is over.' : 'You gave up the trip.';
  const lost = sc.lostI + sc.lostS + sc.lostB + sc.lostA, d = Save.data;
  setOverlay(
    '<div class="panel slab" style="max-width:480px">' +
      '<h2 class="head">Scouting trip ' + (reason === 'collapse' || reason === 'downed' ? 'cut short' : 'over') + '</h2>' +
      '<p class="sub">' + why + '</p>' +
      '<p class="sub" style="margin-top:0">Brought back <b>' + sc.gotI + ' iron</b>, <b>' + sc.gotS + ' sulfur</b>, <b>' + sc.gotB + ' basalt</b>' + (sc.gotA ? ' and <b>' + sc.gotA + ' argon</b>' : '') + (lost ? ', and lost ' + lost + ' on the way' : '') + '. ' +
        sc.broke + (sc.broke === 1 ? ' rubble pile' : ' rubble piles') + ' kicked open.' +
        (sc.wires.length ? ' Wires mended: ' + sc.wiresMended + ' of ' + sc.wiresLost + ' lost.' : '') + (sc.marinesKilled ? ' ' + sc.marinesKilled + (sc.marinesKilled === 1 ? ' Marine was' : ' Marines were') + ' sent packing.' : '') + '</p>' +
      '<p class="sub" style="margin-top:0">You now have <b>' + (d.iron | 0) + ' iron</b>, <b>' + (d.sulfur | 0) + ' sulfur</b>, <b>' + (d.basalt | 0) + ' basalt</b> and <b>' + (d.argon | 0) + ' argon</b>.</p>' +
      '<div class="menucol" style="margin-top:0;width:100%"><button class="btn" data-a="mars-scout">Scout again</button><button class="btn ghost" data-a="mars">Mars outpost</button></div>' +
    '</div>');
}
/* ---- drawing the plain ---- */
function msRubbleDraw(ctx, r, t){
  const sx = r.shake > 0 ? Math.sin(t * 90) * 3 : 0, dmg = (r.maxHp || 3) - r.hp, x = r.x + sx, y = r.y, T = r.type;
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 10, r.r * 1.15, r.r * 0.6, 0, 0, TAU); ctx.fill();
  const stone = (px, py, rr, a, c1, c2) => { ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(px, py, rr * 0.7, rr * 0.55, a, 0, TAU); ctx.fill(); ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(px - 3, py - 3, rr * 0.35, rr * 0.22, a, 0, TAU); ctx.fill(); };
  if (T === 'ironrock'){ stone(x, y, r.r * 1.15, r.seed, '#5A3228', '#A8644A'); ctx.fillStyle = '#E8764A'; for (let k = 0; k < 4; k++) fillCircle(ctx, x - 10 + k * 7, y - 6 + (k % 2) * 8, 2.4, '#E8764A'); csGlow(ctx, x, y, 24, '#FF8A5A', 0.18); }
  else if (T === 'crust'){ stone(x, y, r.r * 1.1, r.seed, '#6A5A48', '#A89878'); ctx.strokeStyle = '#F2D43A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.moveTo(x - 14 + k * 12, y - 12); ctx.lineTo(x - 8 + k * 11, y); ctx.lineTo(x - 15 + k * 12, y + 11); ctx.stroke(); } ctx.lineCap = 'butt'; csGlow(ctx, x, y, 26, '#FFE040', 0.2); }
  else if (T === 'slab'){ for (let k = 0; k < 4; k++){ const a = r.seed + k * 1.5, cx = x + Math.cos(a) * r.r * 0.4, cy = y + Math.sin(a) * r.r * 0.3; ctx.fillStyle = '#20232E'; ctx.beginPath(); for (let j = 0; j < 6; j++) ctx.lineTo(cx + Math.cos(j / 6 * TAU) * 11, cy + Math.sin(j / 6 * TAU) * 9); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(150,170,255,.3)'; ctx.fillRect(cx - 5, cy - 4, 6, 2); } }
  else if (T === 'geode'){ stone(x, y, r.r * 1.15, r.seed, '#5A3A3A', '#8A6A64'); ctx.fillStyle = '#C8A0FF'; for (let k = 0; k < 5; k++){ const a = k * 1.26; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); ctx.lineTo(x + Math.cos(a - 0.3) * 13, y + Math.sin(a - 0.3) * 13); ctx.lineTo(x + Math.cos(a + 0.3) * 13, y + Math.sin(a + 0.3) * 13); ctx.closePath(); ctx.fill(); } csGlow(ctx, x, y, 24, '#C8A0FF', 0.35 + 0.12 * Math.sin(t * 3 + r.seed)); }
  else if (T === 'meteor'){ stone(x, y + 4, r.r * 1.25, r.seed, '#3A2A28', '#6A5048'); ctx.fillStyle = '#2A1E1C'; ctx.beginPath(); ctx.moveTo(x - 14, y + 6); ctx.lineTo(x - 2, y - 28); ctx.lineTo(x + 6, y - 18); ctx.lineTo(x + 15, y + 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,150,100,.5)'; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y - 24); ctx.lineTo(x + 2, y - 6); ctx.closePath(); ctx.fill(); csGlow(ctx, x, y - 12, 28, '#FF7A4A', 0.25); }
  else { for (let k = 0; k < 5; k++){ const a = r.seed + k * 1.26, rr = r.r * (0.45 + 0.3 * ((k * 37) % 5) / 5); stone(x + Math.cos(a) * r.r * 0.4, y + Math.sin(a) * r.r * 0.3, rr, a, k % 2 ? '#C0805A' : '#A8664A', 'rgba(255,220,190,.25)'); } }
  ctx.strokeStyle = '#1A0E08'; ctx.lineWidth = 2;
  for (let k = 0; k < dmg && k < 5; k++){ ctx.beginPath(); ctx.moveTo(x - 16 + k * 10, y - 18); ctx.lineTo(x - 8 + k * 10, y - 2); ctx.lineTo(x - 14 + k * 10, y + 14); ctx.stroke(); }
}
function msMouseDraw(ctx, m){
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.ang);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(1, 3, 9, 5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#C8A8A0'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-13, Math.sin(m.anim) * 4, -17, Math.sin(m.anim * 0.8) * 5); ctx.stroke(); ctx.lineCap = 'butt';
  const bob = m.state === 'chew' ? Math.sin(m.anim * 2) * 1.2 : 0;
  ctx.fillStyle = '#8A7A72'; ctx.beginPath(); ctx.ellipse(0, bob, 8, 4.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#A8988E'; ctx.beginPath(); ctx.ellipse(-1, bob - 1.2, 5, 2.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8A7A72'; ctx.beginPath(); ctx.ellipse(8, bob, 4.4, 3.2, 0, 0, TAU); ctx.fill(); fillCircle(ctx, 4.4, bob - 3.6, 2.2, '#C8A0A0'); fillCircle(ctx, 4.4, bob + 3.6, 2.2, '#C8A0A0'); fillCircle(ctx, 10, bob - 1.4, 0.9, '#201010'); fillCircle(ctx, 10, bob + 1.4, 0.9, '#201010'); fillCircle(ctx, 12, bob, 1.1, '#E8A0A0');
  ctx.restore();
}
function renderMScout(ctx){
  const sc = G.mscout;
  if (!sc) return;
  const W = G.W, H = G.H, z = clamp(Math.min(W, H) / 640, 0.85, 1.35), vw = W / z, vh = H / z;
  const cx = clamp(sc.x, vw / 2, SCOUT_W - vw / 2), cy = clamp(sc.y, vh / 2, SCOUT_H - vh / 2), t = G.time, x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = '#1C0A06'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  drawMarsTerrain(ctx, x0, y0, vw, vh, t, SCOUT_W, SCOUT_H);
  ctx.strokeStyle = 'rgba(40,14,8,.9)'; ctx.lineWidth = 12; ctx.strokeRect(-6, -6, SCOUT_W + 12, SCOUT_H + 12);
  for (let i = 0; i < sc.storms.length; i++){                                               /* dust storms: the cold is worse in here */
    const s = sc.storms[i]; if (s.x + s.r < x0 || s.x - s.r > x0 + vw || s.y + s.r < y0 || s.y - s.r > y0 + vh) continue;
    const g = ctx.createRadialGradient(s.x, s.y, s.r * 0.2, s.x, s.y, s.r); g.addColorStop(0, 'rgba(210,150,110,.5)'); g.addColorStop(1, 'rgba(210,150,110,.08)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    for (let k = 0; k < 4; k++){ ctx.strokeStyle = 'rgba(240,200,160,' + (0.5 - k * 0.08) + ')'; ctx.lineWidth = 3; const a0 = t * (1.4 + k * 0.3) + s.ph + k; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.3 + k * 0.2), a0, a0 + 3.2); ctx.stroke(); }
  }
  const zn = msZone(), p = SCOUT_POD;
  const pg = ctx.createRadialGradient(zn.x, zn.y, zn.r * 0.2, zn.x, zn.y, zn.r); pg.addColorStop(0, 'rgba(255,200,150,.28)'); pg.addColorStop(1, 'rgba(255,200,150,.06)');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(zn.x, zn.y, zn.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,180,' + (0.6 + 0.2 * Math.sin(t * 3)) + ')'; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.arc(zn.x, zn.y, zn.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  const okMap = {}, chewMap = {}; for (let i = 0; i < sc.wires.length; i++){ okMap[sc.wires[i].id] = sc.wires[i].ok; chewMap[sc.wires[i].id] = sc.wires[i].chew; }
  drawMarsSite(ctx, p.x, p.y, t, okMap, chewMap, 0.8);
  for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i]; if (r.x < x0 - 60 || r.x > x0 + vw + 60 || r.y < y0 - 60 || r.y > y0 + vh + 60) continue; msRubbleDraw(ctx, r, t); }
  for (let i = 0; i < sc.items.length; i++){
    const it = sc.items[i]; if (it.x < x0 - 40 || it.x > x0 + vw + 40 || it.y < y0 - 40 || it.y > y0 + vh + 40) continue;
    const pulse = 0.6 + 0.4 * Math.sin(t * 4 + it.ph);
    if (it.t === 'i') marsIronGlyph(ctx, it.x, it.y, 1 + 0.1 * pulse);
    else if (it.t === 's'){ csGlow(ctx, it.x, it.y, 26, '#FFE040', 0.35 * pulse); for (const [dx, dy, s] of [[-5, 3, 1], [5, 2, 0.85], [0, -4, 1.15]]){ ctx.fillStyle = '#F2D43A'; ctx.beginPath(); ctx.moveTo(it.x + dx, it.y + dy - 11 * s); ctx.lineTo(it.x + dx + 6 * s, it.y + dy); ctx.lineTo(it.x + dx, it.y + dy + 7 * s); ctx.lineTo(it.x + dx - 6 * s, it.y + dy); ctx.closePath(); ctx.fill(); } }
    else { csGlow(ctx, it.x, it.y, 22, '#8AA0FF', 0.22 * pulse); ctx.fillStyle = '#1C1E2A'; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(it.x + Math.cos(a) * 12, it.y + Math.sin(a) * 10); } ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(150,170,255,.55)'; ctx.beginPath(); ctx.moveTo(it.x - 6, it.y - 4); ctx.lineTo(it.x + 2, it.y - 7); ctx.lineTo(it.x - 1, it.y); ctx.closePath(); ctx.fill(); }
  }
  for (let i = 0; i < sc.mice.length; i++) msMouseDraw(ctx, sc.mice[i]);
  if (sc.rover) drawRoverTop(ctx, sc.rover.x, sc.rover.y, sc.rover.ang, { riding: sc.rover.riding, t: t, mk2: marsHas('rover2') });
  for (let i = 0; i < sc.foes.length; i++){ try { drawEnemy(ctx, sc.foes[i]); } catch (err) {} }
  drawPlayer(ctx); drawMarsCollector(ctx);
  if (sc.swing > 0){ const a = sc.face, f = sc.swing / 0.24; ctx.strokeStyle = 'rgba(255,255,255,' + f * 0.8 + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sc.x, sc.y, 52, a - 0.9, a + 0.9); ctx.stroke(); }
  for (let i = 0; i < G.eproj.length; i++){ const b = G.eproj[i]; ctx.strokeStyle = b.color || '#9FE8FF'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.045, b.y - b.vy * 0.045); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.lineCap = 'butt'; }
  for (let i = 0; i < sc.pops.length; i++){ const q = sc.pops[i];
    if (q.dust){ ctx.globalAlpha = 0.6 * (1 - q.t / 0.5); ctx.fillStyle = '#C8906A'; ctx.beginPath(); ctx.arc(q.x, q.y, 5 + q.t * 14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; continue; }
    ctx.globalAlpha = 1 - q.t / 1.1; ctx.font = '800 15px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(q.txt, q.x, q.y - q.t * 34); ctx.fillStyle = q.col; ctx.fillText(q.txt, q.x, q.y - q.t * 34); ctx.globalAlpha = 1; }
  ctx.textAlign = 'left';
  ctx.restore();
  const h = sc.cold / 100;                                                                    /* a blue chill at the edges as the cold builds */
  if (h > 0.05){ const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(120,180,255,0)'); v.addColorStop(1, 'rgba(110,170,255,' + (h * h * 0.5 + (sc.cold >= 100 ? 0.15 * (0.5 + 0.5 * Math.sin(t * 9)) : 0)) + ')'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  if (sc.hurtT > 0){ ctx.fillStyle = 'rgba(220,40,30,' + sc.hurtT * 0.5 + ')'; ctx.fillRect(0, 0, W, H); }
  const bar = (x, y, w, frac, col, label) => { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, w, 18); ctx.fillStyle = col; ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * clamp(frac, 0, 1)), 14); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 17); ctx.fillStyle = '#fff'; ctx.font = '700 11px sans-serif'; ctx.fillText(label, x + 6, y + 13); };
  const rvs = sc.rover, panelH = rvs ? 160 : 136;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(12, 12, 246, panelH);
  bar(20, 20, 230, sc.cold / 100, sc.cold >= 100 ? '#3A8AFF' : sc.cold > 70 ? '#5AA8FF' : '#8AC8FF', 'COLD ' + Math.round(sc.cold) + (sc.inBase ? '  (warming)' : rvs && rvs.riding ? '  (rover: no cold)' : ''));
  bar(20, 44, 230, sc.hp / 100, '#D8483C', 'HEALTH ' + Math.max(0, Math.round(sc.hp)));
  if (rvs) bar(20, 68, 230, rvs.battery / 100, rvs.battery < 20 ? '#E8603A' : '#4AB4F0', 'ROVER ' + Math.round(rvs.battery) + (rvs.riding ? '  (driving)' : ''));
  const ty0 = rvs ? 112 : 88;
  ctx.font = '700 13px sans-serif'; ctx.fillStyle = '#FFD0A8'; ctx.fillText('Carrying: ' + sc.carryI + ' iron  ' + sc.carryS + ' sulfur  ' + sc.carryB + ' basalt' + (marsHas('collector') ? '  ' + sc.carryA + ' argon' : ''), 20, ty0);
  ctx.fillStyle = '#E8ECF8'; ctx.fillText('Banked:     ' + sc.gotI + ' iron  ' + sc.gotS + ' sulfur  ' + sc.gotB + ' basalt' + (marsHas('collector') ? '  ' + sc.gotA + ' argon' : ''), 20, ty0 + 20);
  if (sc.wires.length){ let down = 0; for (let i = 0; i < sc.wires.length; i++) if (!sc.wires[i].ok) down++; ctx.fillStyle = down ? '#FF9A6A' : '#9FE8A8'; ctx.fillText(down ? 'Wires down: ' + down + ' of ' + sc.wires.length + '  (walk over them to mend)' : 'All ' + sc.wires.length + ' wires whole', 20, ty0 + 40); }
  const tl = Math.max(0, Math.ceil(sc.left)); ctx.textAlign = 'center'; ctx.font = '800 22px sans-serif'; ctx.fillStyle = tl <= 15 ? '#FFD86A' : '#fff'; ctx.fillText(Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0'), W / 2, 34); ctx.textAlign = 'left';
  const arrow = (tx, ty, col, label) => { const a = Math.atan2(ty - sc.y, tx - sc.x), ax = W / 2 + Math.cos(a) * Math.min(W, H) * 0.38, ay = H / 2 + Math.sin(a) * Math.min(W, H) * 0.38; ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -11); ctx.lineTo(-4, 0); ctx.lineTo(-10, 11); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.fillStyle = col; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, ax - Math.cos(a) * 26, ay - Math.sin(a) * 26 + 4); ctx.textAlign = 'left'; };
  if (Math.hypot(sc.x - p.x, sc.y - p.y) > 420) arrow(p.x, p.y, 'rgba(255,220,180,.9)', 'BASE');
  let bw = null, bwd = 1e9; for (let i = 0; i < sc.wires.length; i++){ const w = sc.wires[i]; if (w.ok) continue; const d = Math.hypot((w.mx + w.bx) / 2 - sc.x, (w.my + w.by) / 2 - sc.y); if (d < bwd){ bwd = d; bw = w; } }
  if (bw && bwd > 260) arrow((bw.mx + bw.bx) / 2, (bw.my + bw.by) / 2, 'rgba(255,120,80,.95)', 'WIRE');
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '12px sans-serif';
  ctx.fillText((Input.hasTouch ? 'Joystick to walk. ' : 'WASD to walk. ') + (rvs ? (Input.hasTouch ? 'ROVER button to board. ' : 'E boards the rover. ') : '') + (Settings.autoKick ? 'Stand by rubble to kick it open. ' : 'Hold the mouse or Space to kick. ') + 'Stay in the ring to warm up and bank your haul. ' + (Input.hasTouch ? '' : 'Esc gives up.'), 14, H - 14);
}
/* ---- the new card: Dust Devils (bought at the Mars outpost) ---- */
CARDS.push({
  id: 'dust_devils', icon: '@t-tornado', rarity: 'epic', type: 'weapon', marsCard: true,
  forms: [
    { lv: 1,  name: 'Dust Devils',       icon: '@t-wind', color: '#E8A070', desc: 'Whirlwinds of red sand wander the arena, hunt the nearest enemy, grind it down and slow it.' },
    { lv: 5,  name: 'Martian Cyclones',  icon: '@t-tornado', color: '#F0B888', desc: 'More of them, wider and longer-lived, and they fling whatever they catch aside.' },
    { lv: 10, name: 'The Great Storm',   icon: '@t-cloud-storm', color: '#FFD8B8', desc: 'A swarm of cyclones that hardly ever stops, scouring everything near you.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { cd: Math.max(2.4, 5.2 - 0.3 * L), n: 1 + Math.floor(L / 3) + [0, 1, 2][t], dmg: (14 + 5.5 * L) * [1, 1.25, 1.6][t], life: 4 + 0.25 * L + [0, 1, 2][t], rad: 54 + 3 * L + [0, 10, 22][t], kb: [90, 220, 320][t] };
  },
  init(i){ i.t = 0.8; i.devils = []; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    if (inst.t <= 0){ inst.t = s.cd * haste(); for (let k = 0; k < s.n; k++){ const a = Math.random() * TAU; inst.devils.push({ x: P.x + Math.cos(a) * 60, y: P.y + Math.sin(a) * 60, life: s.life, ph: Math.random() * TAU, tick: 0 }); } sfx('whoosh', 0.12); }
    for (let i = inst.devils.length - 1; i >= 0; i--){
      const v = inst.devils[i]; v.life -= dt;
      if (v.life <= 0){ inst.devils.splice(i, 1); continue; }
      const tgt = nearestEnemy(v.x, v.y, 700), tx = tgt ? tgt.x : P.x + Math.cos(G.time * 0.8 + v.ph) * 120, ty = tgt ? tgt.y : P.y + Math.sin(G.time * 0.8 + v.ph) * 120, a = Math.atan2(ty - v.y, tx - v.x);
      v.x += Math.cos(a) * 230 * dt; v.y += Math.sin(a) * 230 * dt; v.tick -= dt;
      if (v.tick <= 0){
        v.tick = 0.25; const near = enemiesNear(v.x, v.y, s.rad + 40, []);
        for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || Math.hypot(e.x - v.x, e.y - v.y) > e.r + s.rad) continue; damageEnemy(e, s.dmg, { kb: s.kb, sx: v.x, sy: v.y, color: '#E8B890', quiet: true, noCrit: true }); e.slowT = Math.max(e.slowT, 0.5); e.slowMul = Math.min(e.slowMul, 0.6); }
      }
    }
  },
  drawOver(inst, ctx){
    const s = inst.s, t = G.time;
    for (let i = 0; i < inst.devils.length; i++){
      const v = inst.devils[i], f = Math.min(1, v.life / 0.5);
      softBlob(ctx, v.x, v.y, s.rad * 1.2, '#E8B890', 0.14 * f);
      for (let k = 0; k < 5; k++){ const rr = s.rad * (0.25 + k * 0.17), a0 = t * (4 + k * 0.6) + v.ph + k; ctx.strokeStyle = k % 2 ? inst.form.color : '#FFF0D8'; ctx.globalAlpha = (0.85 - k * 0.1) * f; ctx.lineWidth = 3.4 - k * 0.4; ctx.beginPath(); ctx.arc(v.x, v.y, rr, a0, a0 + 3.8); ctx.stroke(); }
      ctx.globalAlpha = 1; fillCircle(ctx, v.x, v.y, 3, '#6A3A24');
    }
  }
});
{ const c = CARDS[CARDS.length - 1]; CARDMAP[c.id] = c; c.name = c.forms[0].name; c.icon = c.forms[0].icon; }

