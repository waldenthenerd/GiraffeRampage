'use strict';
/* The Venus outpost (shop, scouting, ship). */
/* ========================= VENUS OUTPOST (after the ending) ========================= */
/* Once the giraffe has been stranded on Venus (Chapter 8 complete) the menu gains the Venus outpost. Two new
   materials exist only here: sulfur and basalt. Gems cannot be found on Venus, so everything bought here costs
   sulfur and basalt only, and the only way to get them is the "Scout for Resources" minigame. */
const VENUS_UP = [
  /* the habitat: where the giraffe lives now. Everything else grows from it, and you can SEE it grow. */
  { id: 'hab1', grp: 'Habitat', icon: '@t-x-home', name: 'Habitat Room', cost: { s: 25, b: 25 }, req: [],
    desc: 'A sealed room built onto the wreck of the escape pod. Heat builds 20% slower on scouting trips.' },
  { id: 'hab2', grp: 'Habitat', icon: '@t-x-cottage', name: 'Bigger Habitat Room', cost: { s: 80, b: 80 }, req: ['hab1'],
    desc: 'The room doubles in size, gains a second wing and solar panels. Heat builds 35% slower, and the pod cools you down 50% faster.' },
  { id: 'hab3', grp: 'Habitat', icon: '@t-x-dome', name: 'Habitat Dome', cost: { s: 220, b: 220 }, req: ['hab2'],
    desc: 'A glass dome over the whole base. Heat builds 50% slower, the pod cools you twice as fast, and you start every run with +15 max health.' },
  /* the colony: a bigger, more elaborate anthill, and tougher, stronger ants */
  { id: 'col1', grp: 'Ant colony', icon: '@t-x-sulfur', name: 'Sulfur-Fed Colony', cost: { s: 60, b: 40 }, req: ['hab1'],
    desc: 'The whole anthill turns sulfur-yellow, crusted with crystals, and grows a second entrance. Each ant type can hold 2 more.' },
  { id: 'col2', grp: 'Ant colony', icon: '@t-x-burrow', name: 'Basalt Burrows', cost: { s: 150, b: 180 }, req: ['col1', 'hab2'],
    desc: 'The whole anthill turns dark grey basalt, walled, with tunnels and a side chamber. Each ant type can hold 2 more, and every ant has 20% more health.' },
  { id: 'col3', grp: 'Ant colony', icon: '@t-x-deepburrow', name: 'Deep Colony', cost: { s: 330, b: 400 }, req: ['col2', 'hab3'],
    desc: 'A tall stepped basalt tower with a turret on its side that turns to face enemies and spits sulfur at them. Each ant type can hold 4 more, and every ant hits 25% harder.' },
  /* trinkets forged from what you bring back */
  { id: 'forge', grp: 'Trinkets', icon: '@t-hammer', name: 'Venus Forge', cost: { s: 50, b: 50 }, req: ['hab1'],
    desc: 'A workshop beside the base (you will see its chimney smoking). Unlocks the trinkets below.' },
  { id: 't_lantern', grp: 'Trinkets', trinket: 'sulfurlantern', cost: { s: 70, b: 30 }, req: ['forge'] },
  { id: 't_plate', grp: 'Trinkets', trinket: 'basaltplate', cost: { s: 30, b: 70 }, req: ['forge'] },
  { id: 't_bellows', grp: 'Trinkets', trinket: 'ventbellows', cost: { s: 160, b: 160 }, req: ['forge', 'hab2', 't_lantern'] },
  { id: 't_heart', grp: 'Trinkets', trinket: 'forgeheart', cost: { s: 350, b: 350 }, req: ['t_bellows', 't_plate', 'col2'] },
  /* a vehicle */
  { id: 'rover', grp: 'Vehicle', icon: '@t-x-rover', name: 'Makeshift Rover', cost: { s: 140, b: 160 }, req: ['forge', 'hab2'],
    desc: 'Press E to climb aboard (or tap ROVER). On Venus it drives without building any heat and is faster, on a battery that lasts twice as long as the heat limit of a giraffe on foot; park it in the pod ring to recharge. ' +
      'In every chapter it carries you 50% faster, pulls pickups in from further away, and soaks up the hits for you until it is destroyed.' },
  /* a leveled upgrade: each level is one more starting level of the Deflector Pulse card */
  { id: 'deflector', grp: 'Gear', icon: '@t-x-hexpulse', name: 'Deflector Module', cost: { s: 50, b: 50 }, req: ['forge'], max: 5,
    desc: 'A pulse emitter for your harness. Every level starts each chapter with one more level of the Deflector Pulse card already in your hand, and the first level also makes room for an eighth card.' }
];
const VENUS_BY_ID = {}; VENUS_UP.forEach(u => { VENUS_BY_ID[u.id] = u; });
function venusUnlocked(){ return !!(Save.data && Save.data.chapter8Complete); }
function venusHas(id){ return !!(Save.data && Save.data.venusUp && Save.data.venusUp[id]); }
function venusLevel(id){ return (Save.data && Save.data.venusUp && Save.data.venusUp[id]) | 0; }
function venusName(u){ return u.trinket ? TRINKETS[u.trinket].name : u.name; }
function venusIcon(u){ return u.trinket ? TRINKETS[u.trinket].icon : u.icon; }
function venusDesc(u){ return u.trinket ? TRINKETS[u.trinket].desc + ' Equip it from the Gear tab at the trading post.' : u.desc; }
function venusMissing(u){ return u.req.filter(r => !venusHas(r)); }
function venusAffordable(u){ return (Save.data.sulfur | 0) >= u.cost.s && (Save.data.basalt | 0) >= u.cost.b; }
/* every reason a purchase can fail, in the order a player would want to hear them */
function venusBuyCheck(id){
  const u = VENUS_BY_ID[id];
  if (!u) return 'unknown';
  if (!venusUnlocked()) return 'locked';
  if (venusLevel(id) >= (u.max || 1)) return 'owned';
  if (venusMissing(u).length) return 'requires';
  if (!venusAffordable(u)) return 'poor';
  return '';
}
function buyVenus(id){
  if (venusBuyCheck(id)) return false;
  const u = VENUS_BY_ID[id], d = Save.data;
  d.sulfur -= u.cost.s; d.basalt -= u.cost.b;
  if (!d.venusUp) d.venusUp = {};
  d.venusUp[id] = (d.venusUp[id] | 0) + 1;
  if (u.trinket) grantTrinket(u.trinket);
  Save.write(); recalcStats();
  return true;
}
/* what the habitat does for a scouting trip and for the colony */
function venusHeatMul(){ return venusHas('hab3') ? 0.5 : venusHas('hab2') ? 0.65 : venusHas('hab1') ? 0.8 : 1; }
function venusCoolMul(){ return venusHas('hab3') ? 2 : venusHas('hab2') ? 1.5 : 1; }
function venusAntCap(){ return (venusHas('col1') ? 2 : 0) + (venusHas('col2') ? 2 : 0) + (venusHas('col3') ? 4 : 0); }
function venusAntHp(){ return venusHas('col2') ? 0.2 : 0; }
function venusAntDmg(){ return venusHas('col3') ? 0.25 : 0; }
function venusHabTier(){ return venusHas('hab3') ? 3 : venusHas('hab2') ? 2 : venusHas('hab1') ? 1 : 0; }
function venusColTier(){ return venusHas('col3') ? 3 : venusHas('col2') ? 2 : venusHas('col1') ? 1 : 0; }

/* ---------- drawing: the base, the colony and the rover (top-down) ---------- */
/* The same drawings are used in the outpost screen, around the pod on the plain, and (the colony) in real runs, so
   what you build is what you see. */
function drawVenusPod(ctx, x, y, lit){
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x + 4, y + 14, 38, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8A93A8'; ctx.beginPath(); ctx.moveTo(x - 34, y + 12); ctx.lineTo(x - 40, y - 6); ctx.quadraticCurveTo(x - 34, y - 30, x, y - 34); ctx.quadraticCurveTo(x + 34, y - 30, x + 40, y - 6); ctx.lineTo(x + 34, y + 12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3A4458'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#FF8A2A'; ctx.fillRect(x - 38, y - 4, 76, 7);
  ctx.fillStyle = '#0E1420'; ctx.beginPath(); ctx.ellipse(x + 6, y - 14, 13, 10, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 20, y - 30); ctx.lineTo(x - 24, y - 50); ctx.stroke(); fillCircle(ctx, x - 24, y - 50, 3, lit ? '#5CE08A' : '#FF5A4A');
}
function drawRoverTop(ctx, x, y, ang, o){
  o = o || {};
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang || 0);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(3, 6, 30, 19, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#20242E'; for (const [wx, wy] of [[-16, -17], [16, -17], [-16, 17], [16, 17]]) ctx.fillRect(wx - 8, wy - 5, 16, 10);
  if (o.mk2){ ctx.fillRect(-26, -17, 10, 10); ctx.fillRect(-26, 7, 10, 10); ctx.fillStyle = '#4A3A30'; for (const [wx, wy] of [[-16, -17], [16, -17], [-16, 17], [16, 17]]) ctx.fillRect(wx - 6, wy - 1.4, 12, 2.8); }
  ctx.fillStyle = o.flash ? '#FFFFFF' : o.mk2 ? '#B8503A' : '#C8902A'; ctx.fillRect(-26, -13, 52, 26);
  ctx.strokeStyle = o.mk2 ? '#4A1A10' : '#6A4A14'; ctx.lineWidth = 1.6; ctx.strokeRect(-26, -13, 52, 26);
  if (o.mk2){ ctx.fillStyle = '#E8E0D0'; ctx.fillRect(-26, -2, 52, 4); ctx.fillStyle = '#3A3E4A'; ctx.fillRect(-24, -12, 8, 3); ctx.fillRect(-24, 9, 8, 3); fillCircle(ctx, -14, 0, 2.6, (Math.sin((o.t || 0) * 4) > 0) ? '#FF5A4A' : '#7A2A22'); }
  ctx.fillStyle = '#2A4A8A'; ctx.fillRect(-20, -9, 22, 18); ctx.strokeStyle = 'rgba(160,200,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(-9, 9); ctx.moveTo(-20, 0); ctx.lineTo(2, 0); ctx.stroke();   /* solar panel */
  ctx.fillStyle = '#7FD8FF'; ctx.fillRect(8, -9, 12, 18); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(10, -8, 3, 7);                      /* windscreen */
  if (o.riding){ csGlow(ctx, 30, -8, 16, '#FFF2B0', 0.8); csGlow(ctx, 30, 8, 16, '#FFF2B0', 0.8); }
  fillCircle(ctx, 25, -9, 2.4, o.riding ? '#FFF6C0' : '#7A6A3A'); fillCircle(ctx, 25, 9, 2.4, o.riding ? '#FFF6C0' : '#7A6A3A');
  ctx.strokeStyle = '#B8BCC4'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-24, -10); ctx.lineTo(-30, -22); ctx.stroke();
  ctx.restore();
}
/* o: { hab: 0-3, forge: bool, rover: bool, t, s } */
function drawHabitat(ctx, x, y, o){
  o = o || {}; const hab = o.hab | 0, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); if (o.s) ctx.scale(o.s, o.s);
  const box = (bx, by, w, h, roof, wall, seams) => {
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(bx + 6, by + 8, w, h);
    ctx.fillStyle = wall; ctx.fillRect(bx, by, w, h); ctx.fillStyle = roof; ctx.fillRect(bx + 4, by + 4, w - 8, h - 8);
    ctx.strokeStyle = 'rgba(40,50,70,.55)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 1; i < seams; i++){ const sx = bx + 4 + (w - 8) * i / seams; ctx.moveTo(sx, by + 4); ctx.lineTo(sx, by + h - 4); } ctx.stroke();
  };
  if (o.forge){                                                                        /* the forge: furnace glow and a smoking chimney */
    box(-136, -84, 52, 38, '#3A3430', '#5A524A', 3); csGlow(ctx, -110, -64, 24, '#FF7A1E', 0.55 + 0.2 * Math.sin(t * 5));
    ctx.fillStyle = '#2A2622'; ctx.fillRect(-98, -98, 11, 20); ctx.fillStyle = '#FF9A3A'; ctx.fillRect(-127, -74, 14, 10);
    for (let k = 0; k < 4; k++){ const age = (t * 0.6 + k / 4) % 1; ctx.globalAlpha = 0.5 * (1 - age); fillCircle(ctx, -92 + Math.sin(k + t) * 5, -102 - age * 44, 5 + age * 11, '#7A726A'); } ctx.globalAlpha = 1;
  }
  if (hab >= 2){                                                                       /* the second wing (behind the pod) */
    ctx.fillStyle = '#7A8294'; ctx.fillRect(-30, 26, 14, 18);
    box(-78, 40, 76, 52, '#AEB6C4', '#6A7386', 3); ctx.fillStyle = '#7FD8FF'; ctx.fillRect(-68, 50, 14, 8); ctx.fillRect(-46, 50, 14, 8);
  }
  drawVenusPod(ctx, 0, 0, true);
  if (hab >= 1){
    ctx.fillStyle = '#7A8294'; ctx.fillRect(36, -8, 16, 16);
    if (hab === 1){ box(50, -28, 62, 56, '#AEB6C4', '#6A7386', 2); ctx.fillStyle = '#7FD8FF'; ctx.fillRect(58, -18, 12, 8); ctx.fillStyle = '#FF8A2A'; ctx.fillRect(96, -6, 10, 12); fillCircle(ctx, 80, 6, 5, '#7A8294'); fillCircle(ctx, 80, -22, 2.4, (Math.sin(t * 4) > 0) ? '#5CE08A' : '#2A5A3A'); }
    else {
      box(50, -46, 92, 92, '#B8C2D2', '#6A7386', 4);
      ctx.fillStyle = '#7FD8FF'; for (let k = 0; k < 3; k++) ctx.fillRect(60 + k * 26, -36, 16, 9);
      ctx.fillStyle = '#FF8A2A'; ctx.fillRect(128, -8, 10, 16); fillCircle(ctx, 96, 14, 7, '#7A8294'); fillCircle(ctx, 96, 14, 3.4, '#3A4458');
      for (let k = 0; k < 3; k++){ ctx.fillStyle = '#2A4A8A'; ctx.fillRect(54 + k * 30, -80, 26, 28); ctx.strokeStyle = 'rgba(170,205,255,.6)'; ctx.lineWidth = 1; ctx.strokeRect(54 + k * 30, -80, 26, 28); ctx.beginPath(); ctx.moveTo(54 + k * 30, -66); ctx.lineTo(80 + k * 30, -66); ctx.moveTo(67 + k * 30, -80); ctx.lineTo(67 + k * 30, -52); ctx.stroke(); }
    }
  }
  if (hab >= 3){                                                                       /* the dome: glass over everything */
    const cx = 34, cy = 10, r = 152, g = ctx.createRadialGradient(cx - 30, cy - 40, r * 0.1, cx, cy, r);
    g.addColorStop(0, 'rgba(200,238,255,.10)'); g.addColorStop(0.8, 'rgba(170,225,255,.18)'); g.addColorStop(1, 'rgba(200,240,255,.36)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(225,246,255,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(225,246,255,.4)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const a = k / 10 * TAU; ctx.moveTo(cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.stroke(); for (const f of [0.34, 0.68]){ ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r * 0.88, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.2; fillCircle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, (Math.sin(t * 3 + k) > 0) ? '#FFF6B0' : '#6A7A8A'); }
    ctx.fillStyle = '#8A93A8'; ctx.fillRect(cx - 18, cy + r - 6, 36, 14); ctx.fillStyle = '#FF8A2A'; ctx.fillRect(cx - 12, cy + r - 2, 24, 6);
  }
  if (o.rover) drawRoverTop(ctx, -56, 118, -0.3, { t: t });
  ctx.restore();
}
/* The anthill, tier 0-3. Each upgrade changes the WHOLE look, not just the size: 0 the original brown hill; 1 a
   sulfur-yellow mound; 2 a dark-grey basalt burrow inside a stone wall; 3 a tall stepped basalt tower with a turret
   on its side. o: { aim: radians the turret points, flash: true while it fires } */
const COLONY_K = [1, 1.3, 1.6, 1.7];
const COLONY_TURRET = { x: 40, y: -30 };                 /* where the turret sits, in the hill's own units (tier 3) */
const COLONY_PALETTE = [
  { rings: ['#6A4A2A', '#7E5A34', '#93703F', '#A8844C'], dark: '#5A3E22', light: '#B8945A' },
  { rings: ['#9C8326', '#B89A32', '#D0B444', '#E6CC5C'], dark: '#7A6418', light: '#F5E79A' },
  { rings: ['#30343E', '#3D424E', '#4B5160', '#5A6172'], dark: '#22262E', light: '#8A92AA' },
  { rings: ['#30343E', '#3D424E', '#4B5160', '#5A6172'], dark: '#22262E', light: '#8A92AA' }
];
function colonyTurretPos(h){ const k = COLONY_K[3]; return { x: h.x + COLONY_TURRET.x * k, y: h.y + COLONY_TURRET.y * k }; }
function drawColony(ctx, x, y, tier, t, s, o){
  s = s || 1; tier = tier | 0; t = t || 0; o = o || {};
  const k = COLONY_K[tier], pal = COLONY_PALETTE[tier];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(5, 7, 58 + (tier >= 3 ? 12 : 0), 38 + (tier >= 3 ? 6 : 0), 0, 0, TAU); ctx.fill();
  if (tier >= 2){                                                                      /* a stone wall round the burrow */
    for (let i = 0; i < 22; i++){ const a = i / 22 * TAU; ctx.fillStyle = i % 2 ? '#20232C' : '#2A2E38'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 64, Math.sin(a) * 43, 7, 5.4, a, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,160,190,.55)'; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
  for (let i = 0; i < pal.rings.length; i++){ const rr = [56, 44, 31, 19][i]; ctx.fillStyle = pal.rings[i]; ctx.beginPath(); ctx.ellipse(0, -i * 2, rr, rr * 0.643, 0, 0, TAU); ctx.fill(); }
  if (tier === 1){                                                                     /* sulfur: crystals and bright veins all over the yellow mound */
    ctx.strokeStyle = 'rgba(255,240,140,.7)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++){ const a = i * 1.05 + 0.4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 9); ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 31); ctx.stroke(); } ctx.lineCap = 'butt';
    for (let i = 0; i < 8; i++){ const a = i * 0.79 + 0.2, cx = Math.cos(a) * 38, cy = Math.sin(a) * 25; ctx.fillStyle = '#FFF08A'; ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 3.4, cy); ctx.lineTo(cx, cy + 3); ctx.lineTo(cx - 3.4, cy); ctx.closePath(); ctx.fill(); }
  }
  for (let i = 0; i < 26; i++){ const a = i * 2.4, rr = 12 + (i * 7) % 40; fillCircle(ctx, Math.cos(a) * rr, Math.sin(a) * rr * 0.66 - 3, 1.3, i % 2 ? pal.dark : pal.light); }
  if (tier >= 2){                                                                      /* tunnels radiating out, and a side chamber */
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++){ const a = i * 1.6 + 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 13); ctx.quadraticCurveTo(Math.cos(a + 0.4) * 50, Math.sin(a + 0.4) * 32, Math.cos(a) * 70, Math.sin(a) * 46); ctx.stroke(); } ctx.lineCap = 'butt';
    ctx.fillStyle = pal.rings[1]; ctx.beginPath(); ctx.ellipse(86, 16, 20, 13, 0, 0, TAU); ctx.fill(); ctx.fillStyle = pal.rings[2]; ctx.beginPath(); ctx.ellipse(86, 14, 12, 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0E1016'; ctx.beginPath(); ctx.ellipse(86, 13, 5, 3.2, 0, 0, TAU); ctx.fill();
  }
  const holes = [[0, -7, 7, 4.6], [-22, 6, 5, 3.4], [20, 8, 5, 3.4], [-6, 18, 4.6, 3]];
  for (let i = 0; i < 1 + tier; i++){ ctx.fillStyle = tier >= 2 ? '#0E1016' : '#1A0E06'; ctx.beginPath(); ctx.ellipse(holes[i][0], holes[i][1], holes[i][2], holes[i][3], 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(210,190,140,.4)'; ctx.lineWidth = 1; ctx.stroke(); }
  if (tier >= 3){                                                                      /* the tower: three dark basalt terraces, sulfur-lit windows, a spire, and the turret */
    const steps = [{ rx: 42, h: 24 }, { rx: 30, h: 22 }, { rx: 19, h: 20 }];
    let yb = -4;
    for (let j = 0; j < steps.length; j++){
      const rx = steps[j].rx, h = steps[j].h, ry = rx * 0.62, top = yb - h;
      const g = ctx.createLinearGradient(-rx, 0, rx, 0); g.addColorStop(0, '#2A2E38'); g.addColorStop(0.45, '#4E5466'); g.addColorStop(1, '#1E212A');
      ctx.fillStyle = g; ctx.fillRect(-rx, top, rx * 2, yb - top); ctx.beginPath(); ctx.ellipse(0, yb, rx, ry, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#20232C'; for (let w = -2; w <= 2; w++){ const wx = w * rx * 0.36; ctx.fillRect(wx - 2, top + ry * 0.92 + 3, 4, 8); }
      ctx.fillStyle = '#FFD84A'; for (let w = -2; w <= 2; w++){ const wx = w * rx * 0.36; if ((w + j) % 2 === 0 || Math.sin(t * 2 + w + j) > 0) ctx.fillRect(wx - 1.4, top + ry * 0.92 + 4.4, 2.8, 5.2); }
      ctx.fillStyle = j === 0 ? '#5E6578' : '#6A7288'; ctx.beginPath(); ctx.ellipse(0, top, rx, ry, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(242,212,58,.8)'; ctx.lineWidth = 2; ctx.stroke();
      yb = top;
    }
    const sg = ctx.createLinearGradient(-8, 0, 8, 0); sg.addColorStop(0, '#2A2E38'); sg.addColorStop(0.5, '#5A6172'); sg.addColorStop(1, '#22262E');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-8, yb); ctx.lineTo(0, yb - 42); ctx.lineTo(8, yb); ctx.closePath(); ctx.fill();
    csGlow(ctx, 0, yb - 42, 16, '#FFE040', 0.6 + 0.25 * Math.sin(t * 3)); fillCircle(ctx, 0, yb - 42, 3.4, '#FFF6A0');
    for (let i = 0; i < 6; i++){ const a = i * 1.05 + 0.3, cx = Math.cos(a) * 52, cy = Math.sin(a) * 34; ctx.fillStyle = '#F2D43A'; ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 4, cy); ctx.closePath(); ctx.fill(); }
    /* the turret, bolted to the side of the lowest terrace: it swivels to face what it is shooting at */
    const tx = COLONY_TURRET.x, ty = COLONY_TURRET.y, aim = o.aim || 0;
    ctx.fillStyle = '#20232C'; ctx.fillRect(tx - 10, ty - 2, 20, 14); ctx.fillStyle = '#F2D43A'; ctx.fillRect(tx + 8, ty + 2, 8, 12); ctx.fillStyle = '#B89A20'; ctx.fillRect(tx + 8, ty + 2, 8, 3);
    ctx.fillStyle = '#2E323E'; ctx.beginPath(); ctx.arc(tx, ty, 8.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#F2D43A'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(aim);
    ctx.fillStyle = '#1A1D26'; ctx.fillRect(2, -3, 24, 6); ctx.fillStyle = '#F2D43A'; ctx.fillRect(22, -3.8, 7, 7.6); ctx.fillStyle = '#FFF6A0'; ctx.fillRect(25, -2, 4, 4);
    if (o.flash){ csGlow(ctx, 32, 0, 14, '#FFE040', 0.95); }
    ctx.restore();
    fillCircle(ctx, tx, ty, 3, '#FFD84A');
  }
  for (let i = 0; i < 4 + tier * 3; i++){ const a = ((t * 0.3 + i * 0.37) % 1), ang = i * 2.1; fillCircle(ctx, Math.cos(ang) * (60 + a * 26), Math.sin(ang) * (40 + a * 16), 1.6, tier >= 2 ? '#0E1016' : '#1A0E06'); }
  if (o.rooms && tier >= 3) drawSquadRooms(ctx, o.rooms, t);
  ctx.restore();
}
/* the tower's turret: swivels to the nearest enemy and spits sulfur at it (only once the ant colony is unlocked) */
const TURRET_RANGE = 560, TURRET_CD = 0.65, TURRET_SPEED = 560, TURRET_DMG_MUL = 1.5;
function updateColonyTurret(dt){
  if (!Save.data || !Save.data.antsUnlocked || !venusHas('col3') || G.attract || G.state !== 'playing') return;
  const T = G.turret || (G.turret = { ang: 0, cd: 0, flash: 0 });
  T.cd -= dt; if (T.flash > 0) T.flash -= dt;
  const p = colonyTurretPos(antHill()), e = nearestEnemy(p.x, p.y, TURRET_RANGE);
  if (!e) return;
  const want = Math.atan2(e.y - p.y, e.x - p.x);
  T.ang = turnTo(T.ang, want, 7 * dt);
  if (T.cd <= 0 && Math.abs(angDiff(want, T.ang)) < 0.12){
    T.cd = TURRET_CD; T.flash = 0.1;
    const c = Math.cos(T.ang), s = Math.sin(T.ang);
    addProj(p.x + c * 24, p.y + s * 24, c * TURRET_SPEED, s * TURRET_SPEED, 5.5, ANT_TYPES.shooter.dmg * antPower() * antDmgMul() * TURRET_DMG_MUL, '#F2D43A', { life: TURRET_RANGE / TURRET_SPEED + 0.1, kind: 'sulfur' });
    sfx('spit', 0.08);
  }
}

/* ---------- the Scout for Resources minigame ---------- */
/* Top-down. The giraffe walks the burning plain picking up sulfur and basalt, and kicks open rubble for more. Heat
   builds whenever she is away from the pod (and faster over lava); at 100 she starts losing health. The pod cools her
   down and banks whatever she carries. Anything still carried when the trip ends is lost. Now and then something
   turns up: a lone Marine (a nuisance), or, rarely, a Behemoth Widowmaker. */
const SCOUT_W = 4400, SCOUT_H = 3000, SCOUT_TIME = 150, SCOUT_SPEED = 215;
const SCOUT_POD = { x: 2200, y: 1500, r: 100 };
/* the cool zone is the base itself: it grows with the habitat, and with the dome it is exactly the dome */
const SCOUT_ZONES = [{ dx: 0, dy: 0, r: 100 }, { dx: 0, dy: 0, r: 100 }, { dx: 14, dy: 4, r: 112 }, { dx: 27.2, dy: 8, r: 121.6 }];
function scoutZone(){ const z = SCOUT_ZONES[venusHabTier()]; return { x: SCOUT_POD.x + z.dx, y: SCOUT_POD.y + z.dy, r: z.r }; }
const SCOUT_HEAT_RATE = 6, SCOUT_LAVA_EXTRA = 9, SCOUT_COOL_RATE = 34, SCOUT_BURN = 11, SCOUT_POD_HEAL = 3;
const SCOUT_ITEMS = 70, SCOUT_RUBBLE = 22, SCOUT_LAVA = 14;
/* the rover: a battery that lasts twice as long as a giraffe on foot lasts before overheating */
const SCOUT_ROVER_SPEED = 340, SCOUT_ROVER_DRAIN = SCOUT_HEAT_RATE / 2, SCOUT_ROVER_CHARGE = 25;
const SCOUT_MARINE_CHANCE = 0.3, SCOUT_BEHEMOTH_CHANCE = 0.08;
const SCOUT_MARINE_DMG = 4, SCOUT_BEHEMOTH_DMG = 26;
/* six kinds of rubble: what you kick open decides what you get. "mix" is the chance each piece is sulfur. */
const SCOUT_RUBBLE_TYPES = {
  slag:   { name: 'Slag heap',      hp: 2, r: 26, yield: [2, 3],  mix: 0.5, w: 3.0, min: 150 },
  heap:   { name: 'Rubble heap',    hp: 3, r: 30, yield: [3, 5],  mix: 0.5, w: 3.0, min: 150 },
  vein:   { name: 'Sulfur vein',    hp: 3, r: 28, yield: [4, 6],  mix: 1.0, w: 2.0, min: 400 },
  column: { name: 'Basalt column',  hp: 4, r: 30, yield: [4, 6],  mix: 0.0, w: 2.0, min: 400 },
  geode:  { name: 'Crystal geode',  hp: 4, r: 28, yield: [5, 7],  mix: 0.5, w: 1.5, min: 700 },
  spire:  { name: 'Obsidian spire', hp: 6, r: 32, yield: [8, 11], mix: 0.5, w: 0.6, min: 1200 }
};
const VEN_CRACKS = [];
/* the ground: patches of several tones (clay, rust, ash, sulfur-stained crust, dark basalt), a speckled texture,
   pebbles, and glowing lava veins, under the dark cracks */
const VEN_TONES = ['#6E3618', '#A35E2E', '#C08040', '#4E2E22', '#5A504A', '#B89A40', '#8A2E1E', '#3E3430'];
const VEN_PATCHES = [], VEN_PEBBLES = [], VEN_VEINS = [];
for (let i = 0; i < 300; i++) VEN_PATCHES.push({ x: csR(i + 7100) * SCOUT_W, y: csR(i + 7200) * SCOUT_H, rx: 90 + csR(i + 7300) * 240, ry: 60 + csR(i + 7400) * 170, a: csR(i + 7500) * TAU, c: VEN_TONES[Math.floor(csR(i + 7600) * VEN_TONES.length)], al: 0.22 + csR(i + 7700) * 0.22 });
for (let i = 0; i < 1800; i++) VEN_PEBBLES.push({ x: csR(i + 7800) * SCOUT_W, y: csR(i + 7900) * SCOUT_H, r: 1.2 + csR(i + 8000) * 3.2, c: ['#3A2418', '#7A4A2A', '#C89A64', '#5A504A', '#D8C078'][Math.floor(csR(i + 8100) * 5)] });
for (let i = 0; i < 170; i++) VEN_VEINS.push({ x: csR(i + 8200) * SCOUT_W, y: csR(i + 8300) * SCOUT_H, a: csR(i + 8400) * TAU, l: 60 + csR(i + 8500) * 200, ph: csR(i + 8600) * TAU });
let groundPatternVenus = null;
function buildGroundVenus(){
  const c = document.createElement('canvas'); c.width = 160; c.height = 160;
  const g = c.getContext('2d'); if (!g) return;
  g.fillStyle = '#8A5028'; g.fillRect(0, 0, 160, 160);
  for (let i = 0; i < 700; i++){ g.fillStyle = ['#6A3A1C', '#A8662F', '#7A4424', '#B47A40', '#5A3420', '#946A4A'][(Math.random() * 6) | 0]; g.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 3, 1 + Math.random() * 3); }
  const ctx = CTX; if (ctx && ctx.createPattern) groundPatternVenus = ctx.createPattern(c, 'repeat');
}
/* the pool: a warm glow bleeding into the ground, a scorched halo that fades out in soft stages (instead of a hard dark ring),
   flows that thin into cracks, a cooled crust of about the ground's own brightness for a rim, then the molten body */
function lavaBlobPath(ctx, l, k){
  const o = l.outline, n = o.length, q = i => ({ x: l.x + (o[(i + n) % n].x - l.x) * k, y: l.y + (o[(i + n) % n].y - l.y) * k });
  ctx.beginPath(); const m0 = q(0), m1 = q(1); ctx.moveTo((m0.x + m1.x) / 2, (m0.y + m1.y) / 2);
  for (let i = 1; i <= n; i++){ const a = q(i), b = q(i + 1); ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2); }
  ctx.closePath();
}
function lavaFlowPath(ctx, f, grow){
  const pts = f.pts, L = [], R = [];
  for (let i = 0; i < pts.length; i++){
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = hyp(dx, dy) || 1, nx = -dy / d, ny = dx / d, h = pts[i].w * grow / 2;
    L.push({ x: pts[i].x + nx * h, y: pts[i].y + ny * h }); R.push({ x: pts[i].x - nx * h, y: pts[i].y - ny * h });
  }
  ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y); for (let i = 1; i < L.length; i++) ctx.lineTo(L[i].x, L[i].y); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i].x, R[i].y); ctx.closePath();
}
function drawLavaPool(ctx, l, t){
  if (!l.outline) Object.assign(l, scoutMakeLava(l.x, l.y, l.r));      /* a plain round pool is given a shape the first time it is drawn */
  const pulse = 0.5 + 0.5 * Math.sin(t * 3 + l.ph);
  const gl = ctx.createRadialGradient(l.x, l.y, l.r * 0.5, l.x, l.y, l.r * 1.75); gl.addColorStop(0, 'rgba(255,120,40,' + (0.30 + 0.06 * pulse) + ')'); gl.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 1.75, 0, TAU); ctx.fill();
  for (const h of [[1.34, 0.10], [1.22, 0.12], [1.11, 0.16]]){ ctx.fillStyle = 'rgba(96,36,14,' + h[1] + ')'; lavaBlobPath(ctx, l, h[0]); ctx.fill(); }
  for (let i = 0; i < l.flows.length; i++){
    const f = l.flows[i], e = f.pts[f.pts.length - 1], d = f.pts.length > 1 ? Math.atan2(e.y - f.pts[f.pts.length - 2].y, e.x - f.pts[f.pts.length - 2].x) : 0;
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(40,18,8,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(d) * 44, e.y + Math.sin(d) * 44); ctx.stroke();      /* it vanishes into a crack */
    ctx.strokeStyle = 'rgba(255,110,40,' + (0.3 + 0.15 * pulse) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(d) * 30, e.y + Math.sin(d) * 30); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = 'rgba(96,36,14,.14)'; lavaFlowPath(ctx, f, 2.4); ctx.fill(); ctx.fillStyle = 'rgba(120,44,16,.28)'; lavaFlowPath(ctx, f, 1.55); ctx.fill();
    ctx.fillStyle = '#D8501A'; lavaFlowPath(ctx, f, 1.0); ctx.fill(); ctx.fillStyle = 'rgba(255,170,60,' + (0.6 + 0.25 * pulse) + ')'; lavaFlowPath(ctx, f, 0.42); ctx.fill();
  }
  ctx.fillStyle = 'rgba(154,58,22,.78)'; lavaBlobPath(ctx, l, 1.05); ctx.fill();
  const lg = ctx.createRadialGradient(l.x, l.y, l.r * 0.1, l.x, l.y, l.r * 1.05); lg.addColorStop(0, '#FFE070'); lg.addColorStop(0.5, '#FF8A1E'); lg.addColorStop(1, '#C8320E');
  ctx.fillStyle = lg; lavaBlobPath(ctx, l, 1); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,160,' + (0.25 + 0.15 * Math.sin(t * 3 + l.ph)) + ')'; ctx.beginPath(); ctx.arc(l.x + Math.sin(t + l.ph) * l.r * 0.3, l.y + Math.cos(t * 0.8 + l.ph) * l.r * 0.25, l.r * 0.35, 0, TAU); ctx.fill();
  for (let k = 0; k < 3; k++){ ctx.fillStyle = 'rgba(120,40,14,.30)'; ctx.beginPath(); ctx.ellipse(l.x + Math.cos(t * 0.25 + l.ph + k * 2.1) * l.r * 0.42, l.y + Math.sin(t * 0.3 + l.ph * 1.7 + k * 2.1) * l.r * 0.38, l.r * 0.2, l.r * 0.13, t * 0.2 + k, 0, TAU); ctx.fill(); }
}
function drawVenusGround(ctx, x0, y0, vw, vh, t, mw, mh){
  const MW = mw || SCOUT_W, MH = mh || SCOUT_H, fx = Math.max(0, x0), fy = Math.max(0, y0), fw = Math.min(MW, x0 + vw) - fx, fh = Math.min(MH, y0 + vh) - fy;
  const g = ctx.createLinearGradient(0, y0, 0, y0 + vh); g.addColorStop(0, '#8C4E26'); g.addColorStop(1, '#6E3A1C');
  ctx.fillStyle = g; ctx.fillRect(fx, fy, fw, fh);
  if (groundPatternVenus){ ctx.globalAlpha = 0.55; ctx.fillStyle = groundPatternVenus; ctx.fillRect(fx, fy, fw, fh); ctx.globalAlpha = 1; }
  for (let i = 0; i < VEN_PATCHES.length; i++){ const p = VEN_PATCHES[i]; if (p.x + p.rx < x0 || p.x - p.rx > x0 + vw || p.y + p.rx < y0 || p.y - p.rx > y0 + vh) continue;
    ctx.fillStyle = p.c; ctx.globalAlpha = p.al * 0.55; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, TAU); ctx.fill();
    ctx.globalAlpha = p.al * 0.7; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx * 0.62, p.ry * 0.62, p.a, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < VEN_PEBBLES.length; i++){ const p = VEN_PEBBLES[i]; if (p.x < x0 - 10 || p.x > x0 + vw + 10 || p.y < y0 - 10 || p.y > y0 + vh + 10) continue; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.7, 0, 0, TAU); ctx.fill(); }
  ctx.lineCap = 'round';
  for (let i = 0; i < VEN_VEINS.length; i++){ const v = VEN_VEINS[i]; if (v.x < x0 - 220 || v.x > x0 + vw + 220 || v.y < y0 - 220 || v.y > y0 + vh + 220) continue;
    const f = 0.55 + 0.45 * Math.sin(t * 1.6 + v.ph), ex = v.x + Math.cos(v.a) * v.l, ey = v.y + Math.sin(v.a) * v.l, mx = v.x + Math.cos(v.a) * v.l * 0.5 + Math.sin(v.a) * 18, my = v.y + Math.sin(v.a) * v.l * 0.5 - Math.cos(v.a) * 18;
    ctx.strokeStyle = 'rgba(200,50,20,' + 0.22 * f + ')'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,150,50,' + 0.5 * f + ')'; ctx.lineWidth = 2.4; ctx.stroke(); }
  for (let i = 0; i < VEN_CRACKS.length; i++){ const c = VEN_CRACKS[i]; if (c.x < x0 - 130 || c.x > x0 + vw + 130 || c.y < y0 - 130 || c.y > y0 + vh + 130) continue;
    ctx.strokeStyle = 'rgba(40,18,8,.55)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(c.a) * c.l * 0.5, c.y + Math.sin(c.a) * c.l * 0.5 + 6); ctx.lineTo(c.x + Math.cos(c.a) * c.l, c.y + Math.sin(c.a) * c.l); ctx.stroke(); }
  ctx.lineCap = 'butt';
}
for (let i = 0; i < 720; i++) VEN_CRACKS.push({ x: csR(i + 6100) * SCOUT_W, y: csR(i + 6200) * SCOUT_H, a: csR(i + 6300) * TAU, l: 30 + csR(i + 6400) * 110 });
function scoutRandInt(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
/* A lava pool is not a circle: its outline wobbles (a few smooth harmonics round its radius), and 2 to 4 flows of lava run out
   of its edge and thin into cracks in the ground. The heat zone uses the very same shape, so what looks hot is hot. */
function scoutLavaRho(L, th){ if (!L.harm) return L.r; let m = 1; for (let i = 0; i < L.harm.length; i++) m += L.harm[i].a * Math.cos(L.harm[i].k * th + L.harm[i].ph); return L.r * Math.max(0.62, m); }
function scoutMakeLava(x, y, r){
  const L = { x: x, y: y, r: r, ph: Math.random() * TAU, flows: [], outline: [],
    harm: [[2, 0.10 + Math.random() * 0.06], [3, 0.08 + Math.random() * 0.05], [5, 0.04 + Math.random() * 0.04]].map(h => ({ k: h[0], a: h[1], ph: Math.random() * TAU })) };
  for (let j = 0; j < 56; j++){ const th = j / 56 * TAU, rho = scoutLavaRho(L, th); L.outline.push({ x: x + Math.cos(th) * rho, y: y + Math.sin(th) * rho }); }
  const n = 2 + (Math.random() < 0.55 ? 1 : 0) + (Math.random() < 0.3 ? 1 : 0), a0 = Math.random() * TAU;
  for (let i = 0, tries = 0; L.flows.length < n && tries < 16; i++, tries++){
    const al = a0 + (tries < n ? i : Math.random() * n) * TAU / n + (Math.random() - 0.5) * 0.7, rho = scoutLavaRho(L, al), len = 90 + Math.random() * 160, steps = 9, w0 = 13 + Math.random() * 11, curve = (Math.random() - 0.5) * 0.85;
    let px = x + Math.cos(al) * rho * 0.88, py = y + Math.sin(al) * rho * 0.88, dir = al; const pts = [];
    for (let k = 0; k <= steps; k++){
      const u = k / steps;
      if (hyp(px - SCOUT_POD.x, py - SCOUT_POD.y) < 330 || px < 70 || py < 70 || px > SCOUT_W - 70 || py > SCOUT_H - 70) break;       /* never reach the base, or the edge of the map */
      pts.push({ x: px, y: py, w: Math.max(2, w0 * Math.pow(1 - u, 0.85) + 2) });
      dir += curve * 0.35 + (Math.random() - 0.5) * 0.35; px += Math.cos(dir) * len / steps; py += Math.sin(dir) * len / steps;
    }
    let fl = 0; for (let k = 1; k < pts.length; k++) fl += hyp(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    if (pts.length >= 3 && fl >= 50) L.flows.push({ pts: pts });          /* no little stubs: a flow is at least 50 px long, or it is tried again at another angle */
  }
  let R = r * 1.3; for (const o of L.outline) R = Math.max(R, hyp(o.x - x, o.y - y)); for (const f of L.flows) for (const q of f.pts) R = Math.max(R, hyp(q.x - x, q.y - y) + q.w); L.R = R + 30;
  return L;
}
function scoutLavaHit(L, x, y){
  const dx = x - L.x, dy = y - L.y, d = hyp(dx, dy);
  if (d > (L.R || L.r)) return false;                 /* a plain round pool (no outline or flows) still works */
  if (d < scoutLavaRho(L, Math.atan2(dy, dx))) return true;
  const flows = L.flows || [];
  for (let i = 0; i < flows.length; i++){
    const pts = flows[i].pts;
    for (let k = 0; k + 1 < pts.length; k++){
      const a = pts[k], b = pts[k + 1], abx = b.x - a.x, aby = b.y - a.y, t = clamp(((x - a.x) * abx + (y - a.y) * aby) / (abx * abx + aby * aby || 1), 0, 1);
      if (hyp(x - (a.x + abx * t), y - (a.y + aby * t)) < (a.w + (b.w - a.w) * t) * 0.5) return true;
    }
  }
  return false;
}
function scoutSpot(minD, maxD, avoid, pad){
  for (let n = 0; n < 60; n++){
    const a = Math.random() * TAU, d = minD + Math.random() * (maxD - minD);
    const x = SCOUT_POD.x + Math.cos(a) * d, y = SCOUT_POD.y + Math.sin(a) * d;
    if (x < 90 || y < 90 || x > SCOUT_W - 90 || y > SCOUT_H - 90) continue;
    let ok = true;
    for (let i = 0; i < avoid.length && ok; i++) if (hyp(x - avoid[i].x, y - avoid[i].y) < avoid[i].r + (pad || 30)) ok = false;
    if (ok) return { x: x, y: y, d: d };
  }
  return { x: SCOUT_POD.x + 300, y: SCOUT_POD.y, d: 300 };
}
function scoutPickRubbleType(d){
  const ids = Object.keys(SCOUT_RUBBLE_TYPES).filter(id => SCOUT_RUBBLE_TYPES[id].min <= d);
  let tot = 0; ids.forEach(id => { tot += SCOUT_RUBBLE_TYPES[id].w; });
  let r = Math.random() * tot;
  for (const id of ids){ r -= SCOUT_RUBBLE_TYPES[id].w; if (r <= 0) return id; }
  return ids[0];
}
function startScout(){
  if (!venusUnlocked()){ SFX.deny(); return false; }
  const sc = G.scout = { t: 0, left: SCOUT_TIME, x: SCOUT_POD.x + 70, y: SCOUT_POD.y + 40, face: 0, anim: 0, hp: 100, heat: 0, carryS: 0, carryB: 0,
    gotS: 0, gotB: 0, lostS: 0, lostB: 0, items: [], rubble: [], lava: [], pops: [], kickCd: 0, swing: 0, done: false, reason: '', inPod: true, inLava: false,
    warnedHot: false, warnedTime: false, prevBiome: G.biome, broke: 0, invuln: 0, hurtT: 0, killer: '', foes: [], ramCd: 0, downed: false,
    rover: venusHas('rover') ? { x: SCOUT_POD.x + 130, y: SCOUT_POD.y + 60, ang: 0.3, battery: 100, riding: false } : null,
    marineAt: Math.random() < SCOUT_MARINE_CHANCE ? 12 + Math.random() * 100 : null,
    behemothAt: Math.random() < SCOUT_BEHEMOTH_CHANCE ? 25 + Math.random() * 80 : null,
    marineSeen: false, behemothSeen: false, marinesKilled: 0 };
  const avoid = [{ x: SCOUT_POD.x, y: SCOUT_POD.y, r: SCOUT_POD.r + 150 }];
  for (let i = 0; i < SCOUT_LAVA; i++){ const r = 65 + Math.random() * 40, p = scoutSpot(330, 2000, avoid, 60), L = scoutMakeLava(p.x, p.y, r); sc.lava.push(L); avoid.push({ x: p.x, y: p.y, r: r * 1.3 });
    for (const f of L.flows) for (let k = 1; k < f.pts.length; k += 2) avoid.push({ x: f.pts[k].x, y: f.pts[k].y, r: f.pts[k].w + 16 });      /* resources keep off the flows too */ }
  for (let i = 0; i < SCOUT_RUBBLE; i++){ const p = scoutSpot(190, 2100, avoid, 40), type = scoutPickRubbleType(p.d), T = SCOUT_RUBBLE_TYPES[type]; sc.rubble.push({ x: p.x, y: p.y, r: T.r, type: type, hp: T.hp, maxHp: T.hp, shake: 0, seed: Math.random() * 9 }); avoid.push({ x: p.x, y: p.y, r: T.r }); }
  for (let i = 0; i < SCOUT_ITEMS; i++){ const p = scoutSpot(150, 2050, avoid, 14); sc.items.push({ x: p.x, y: p.y, t: i % 2 ? 'b' : 's', ph: Math.random() * TAU }); avoid.push({ x: p.x, y: p.y, r: 16 }); }
  G.enemies.length = 0; G.eproj.length = 0; G.bossAlive = false; G.boss = null;
  G.state = 'scout'; G.attract = false; G.biome = 'venus';
  P.x = sc.x; P.y = sc.y; P.vx = 0; P.vy = 0; P.face = 0; P.aim = 0;
  hideOverlay();
  HUD.classList.remove('on'); PAUSEBTN.classList.remove('on');
  if (Input.hasTouch) TOUCH.classList.add('on'); else TOUCH.classList.remove('on');
  return true;
}
function scoutPop(x, y, txt, col){ G.scout.pops.push({ x: x, y: y, t: 0, txt: txt, col: col }); }
function scoutBank(sc){
  if (!sc.carryS && !sc.carryB) return;
  Save.data.sulfur = (Save.data.sulfur | 0) + sc.carryS; Save.data.basalt = (Save.data.basalt | 0) + sc.carryB;
  sc.gotS += sc.carryS; sc.gotB += sc.carryB;
  scoutPop(SCOUT_POD.x, SCOUT_POD.y - 60, '+' + sc.carryS + ' sulfur  +' + sc.carryB + ' basalt', '#FFE27A');
  sc.carryS = 0; sc.carryB = 0; Save.write(); SFX.buy();
}
function scoutHurt(sc, n, src, invuln){
  if (sc.invuln > 0 || sc.done) return false;
  sc.hp -= n; sc.invuln = invuln || 0.6; sc.hurtT = 0.3; sc.killer = src;
  scoutPop(sc.x, sc.y - 50, '-' + n, '#FF8A7A'); sfx('hurt', 0.15);
  return true;
}
/* ---- rubble ---- */
function scoutBreakRubble(sc, r){
  const T = SCOUT_RUBBLE_TYPES[r.type] || SCOUT_RUBBLE_TYPES.heap, n = scoutRandInt(T.yield[0], T.yield[1]);
  for (let k = 0; k < n; k++){ const a = Math.random() * TAU, d = 24 + Math.random() * 34; sc.items.push({ x: clamp(r.x + Math.cos(a) * d, 40, SCOUT_W - 40), y: clamp(r.y + Math.sin(a) * d, 40, SCOUT_H - 40), t: Math.random() < T.mix ? 's' : 'b', ph: Math.random() * TAU }); }
  sc.rubble.splice(sc.rubble.indexOf(r), 1); sc.broke++;
  sfx('boom', 0.06); addShake(3);
}
function scoutHitRubble(sc, r){
  r.hp--; r.shake = 0.22; sfx('hit', 0.07);
  for (let k = 0; k < 5; k++) sc.pops.push({ x: r.x, y: r.y, t: 0, dust: true, vx: rand(-90, 90), vy: rand(-90, 40) });
  if (r.hp <= 0) scoutBreakRubble(sc, r);
}
function scoutHitFoe(sc, e, n){
  if (e.kind !== 'marine' || e.dead) return;
  e.hp -= n; e.flash = 0.15; sfx('hit', 0.08); sc.pops.push({ x: e.x, y: e.y, t: 0, dust: true, vx: rand(-60, 60), vy: rand(-60, 30) });
  if (e.hp <= 0){
    e.dead = true; sc.marinesKilled++; scoutPop(e.x, e.y - 30, 'Marine down!', '#9FE8FF');
    for (let k = 0; k < 3; k++){ const a = Math.random() * TAU; sc.items.push({ x: clamp(e.x + Math.cos(a) * 30, 40, SCOUT_W - 40), y: clamp(e.y + Math.sin(a) * 30, 40, SCOUT_H - 40), t: k % 2 ? 'b' : 's', ph: k }); }
  }
}
function scoutKick(sc){
  let best = null, bd = 1e9, isFoe = false;
  for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i], d = hyp(r.x - sc.x, r.y - sc.y) - r.r; if (d < 64 && d < bd){ bd = d; best = r; } }
  for (let i = 0; i < sc.foes.length; i++){ const e = sc.foes[i]; if (e.kind !== 'marine' || e.dead) continue; const d = hyp(e.x - sc.x, e.y - sc.y) - e.r; if (d < 64 && d < bd){ bd = d; best = e; isFoe = true; } }
  sc.kickCd = 0.38; sc.swing = 0.24;
  if (!best) return;
  sc.face = Math.atan2(best.y - sc.y, best.x - sc.x);
  if (isFoe) scoutHitFoe(sc, best, 45); else scoutHitRubble(sc, best);
}
/* ---- the two visitors ---- */
function scoutMakeFoe(type, wave, x, y){
  const wasBoss = G.bossAlive, wasTarget = G.boss;
  const e = spawnEnemy(type, x, y, wave);
  if (!e) return null;
  const i = G.enemies.indexOf(e); if (i >= 0) G.enemies.splice(i, 1);     /* it lives in the trip, not in the game's enemy list */
  G.bossAlive = wasBoss; G.boss = wasTarget;
  e.atkCd = 99; e.stunT = 0;
  return e;
}
function scoutFoeSpawnPoint(sc, dist){
  for (let n = 0; n < 12; n++){
    const a = Math.random() * TAU, x = sc.x + Math.cos(a) * dist, y = sc.y + Math.sin(a) * dist;
    if (x > 120 && y > 120 && x < SCOUT_W - 120 && y < SCOUT_H - 120) return { x: x, y: y };
  }
  return { x: clamp(sc.x + dist, 120, SCOUT_W - 120), y: sc.y };
}
const BEHEMOTH_DEF = {};
function scoutBehemothDef(){
  if (!BEHEMOTH_DEF.title) Object.assign(BEHEMOTH_DEF, ETYPES.buffalo, { color: '#B01818', dark: '#4A0808', blood: '#6A0A0A', title: 'Behemoth Widowmaker' });
  return BEHEMOTH_DEF;
}
function scoutSpawnFoe(kind){
  const sc = G.scout;
  if (!sc || sc.done) return null;
  if (kind === 'marine'){
    const p = scoutFoeSpawnPoint(sc, 700), e = scoutMakeFoe('hyena', 176, p.x, p.y);
    if (!e) return null;
    e.kind = 'marine'; e.hp = e.maxHp = 90; e.state = 'idle'; e.stateT = 1.2; sc.foes.push(e); sc.marineSeen = true;
    scoutPop(sc.x, sc.y - 80, 'A Space Marine has tracked you down!', '#9FE8FF');
    return e;
  }
  const p = scoutFoeSpawnPoint(sc, 900), e = scoutMakeFoe('buffalo', 1, p.x, p.y);
  if (!e) return null;
  e.def = scoutBehemothDef(); e.kind = 'behemoth'; e.state = 'idle'; e.stateT = 1.5; e.leaving = false; e.spd = ETYPES.buffalo.spd; sc.foes.push(e); sc.behemothSeen = true;
  scoutPop(sc.x, sc.y - 80, 'A Behemoth Widowmaker is coming!', '#FF6A5A');
  return e;
}
function scoutUpdateMarine(sc, e, dt){
  const dx = P.x - e.x, dy = P.y - e.y, d = hyp(dx, dy) || 1, prev = e.state;
  e.spdE = e.spd * 0.55;                                                   /* slow and easily dodged: a nuisance, not a threat */
  const mv = MARINE_AI.m_rifle(e, dt, dx / d, dy / d, d);
  if (prev === 'burst' && e.state === 'idle') e.stateT = 2.4 + Math.random() * 1.4;
  e.x = clamp(e.x + mv[0] * dt, 60, SCOUT_W - 60); e.y = clamp(e.y + mv[1] * dt, 60, SCOUT_H - 60);
  e.anim += dt * 6; if (e.flash > 0) e.flash -= dt;
}
/* The Widowmaker's own AI (walk at you, back up, then a triple charge), with one addition: when the giraffe is in the
   pod it loses interest, walks away from it, and leaves for good once it reaches the edge of the map. */
function scoutUpdateBehemoth(sc, e, dt){
  const spd = e.spd;
  let ux = P.x - e.x, uy = P.y - e.y; const d = hyp(ux, uy) || 1; ux /= d; uy /= d;
  if (sc.inPod && !e.leaving){ e.leaving = true; e.state = 'idle'; scoutPop(e.x, e.y - 60, 'The Behemoth loses interest and wanders off.', '#FFD86A'); }
  let mvx = 0, mvy = 0;
  if (e.leaving){
    const ax = e.x - SCOUT_POD.x, ay = e.y - SCOUT_POD.y, al = hyp(ax, ay) || 1;
    mvx = ax / al * spd; mvy = ay / al * spd; e.ang = Math.atan2(ay, ax);
  } else {
    e.stateT -= dt; e.ang = Math.atan2(uy, ux);
    if (e.state === 'idle'){
      mvx = ux * spd; mvy = uy * spd;
      if (e.stateT <= 0){ e.state = 'wind'; e.stateT = 0.6; }
    } else if (e.state === 'wind'){
      mvx = -ux * spd * 0.3; mvy = -uy * spd * 0.3;
      if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.85; e.chainsLeft = 2; e.dashVX = ux * 620; e.dashVY = uy * 620; sfx('boom', 0.2); }
    } else {
      mvx = e.dashVX; mvy = e.dashVY;
      if (e.stateT <= 0){
        if (e.chainsLeft > 0){ e.chainsLeft--; e.stateT = 0.85; const na = Math.atan2(P.y - e.y, P.x - e.x); e.dashVX = Math.cos(na) * 620; e.dashVY = Math.sin(na) * 620; }
        else { e.state = 'idle'; e.stateT = rand(1.6, 2.4); }
      }
    }
  }
  e.x += mvx * dt; e.y += mvy * dt; e.anim += dt * 5;
  if (!e.leaving){
    e.x = clamp(e.x, 40, SCOUT_W - 40); e.y = clamp(e.y, 40, SCOUT_H - 40);
    if (d < e.r + 18){ if (scoutHurt(sc, e.state === 'dash' ? Math.round(SCOUT_BEHEMOTH_DMG * 1.25) : SCOUT_BEHEMOTH_DMG, 'behemoth', 1.1)){ sc.x = clamp(sc.x + ux * 110, 40, SCOUT_W - 40); sc.y = clamp(sc.y + uy * 110, 40, SCOUT_H - 40); } }
  } else if (e.x < 70 || e.y < 70 || e.x > SCOUT_W - 70 || e.y > SCOUT_H - 70){
    e.dead = true; e.gone = true; scoutPop(clamp(e.x, 120, SCOUT_W - 120), clamp(e.y, 120, SCOUT_H - 120), 'It has left the plain.', '#FFD86A');
  }
}
function scoutToggleRover(){
  const sc = G.scout;
  if (!sc || sc.done || !sc.rover) return false;
  const r = sc.rover;
  if (r.riding){ r.riding = false; r.x = sc.x; r.y = sc.y; scoutPop(sc.x, sc.y - 50, 'Got out of the rover', '#E8ECF8'); return true; }
  if (hyp(sc.x - r.x, sc.y - r.y) > 90){ scoutPop(sc.x, sc.y - 50, 'Walk to the rover first', '#FFD86A'); return false; }
  if (r.battery < 1){ scoutPop(sc.x, sc.y - 50, 'Battery flat: park it in the pod ring to recharge', '#FF8A5A'); return false; }
  r.riding = true; sc.face = r.ang; scoutPop(sc.x, sc.y - 50, 'Rover on!', '#9FE8FF'); sfx('pickupS', 0.05);
  return true;
}
function updateScout(dt){
  G.time += dt; updateParticles(dt);
  const sc = G.scout;
  if (!sc || sc.done) return;
  sc.t += dt; sc.left -= dt; sc.anim += dt;
  if (sc.invuln > 0) sc.invuln -= dt; if (sc.hurtT > 0) sc.hurtT -= dt;
  const rv = sc.rover, riding = !!(rv && rv.riding);
  const inp = playerInputVector(), speed = riding ? SCOUT_ROVER_SPEED : SCOUT_SPEED;
  sc.x = clamp(sc.x + inp.x * speed * dt, 40, SCOUT_W - 40); sc.y = clamp(sc.y + inp.y * speed * dt, 40, SCOUT_H - 40);
  if (inp.m > 0.1) sc.face = Math.atan2(inp.y, inp.x);
  P.x = sc.x; P.y = sc.y; P.vx = inp.x * speed; P.vy = inp.y * speed; P.face = sc.face; P.aim = sc.face;   /* head and neck point the way she is walking */
  if (riding){ rv.x = sc.x; rv.y = sc.y; rv.ang = sc.face; }
  const zone = scoutZone();
  sc.inPod = hyp(sc.x - zone.x, sc.y - zone.y) < zone.r;
  sc.inLava = false;
  for (let i = 0; i < sc.lava.length; i++) if (scoutLavaHit(sc.lava[i], sc.x, sc.y)) sc.inLava = true;
  if (sc.inPod){
    sc.heat = Math.max(0, sc.heat - SCOUT_COOL_RATE * venusCoolMul() * dt);
    sc.hp = Math.min(100, sc.hp + SCOUT_POD_HEAL * dt);
    scoutBank(sc);
    if (sc.heat < 40) sc.warnedHot = false;
  } else if (!riding){
    sc.heat = Math.min(100, sc.heat + (SCOUT_HEAT_RATE + (sc.inLava ? SCOUT_LAVA_EXTRA : 0)) * venusHeatMul() * dt);
    if (sc.heat >= 75 && !sc.warnedHot){ sc.warnedHot = true; scoutPop(sc.x, sc.y - 70, 'Too hot! Back to the pod!', '#FF8A5A'); }
  }
  if (sc.heat >= 100){ sc.hp -= SCOUT_BURN * dt; sc.killer = 'heat'; }
  if (rv){                                                                              /* the rover's battery */
    if (riding){ rv.battery = Math.max(0, rv.battery - SCOUT_ROVER_DRAIN * dt); if (rv.battery <= 0){ rv.riding = false; rv.x = sc.x; rv.y = sc.y; scoutPop(sc.x, sc.y - 60, 'Battery flat! On foot from here.', '#FF8A5A'); } }
    else if (hyp(rv.x - zone.x, rv.y - zone.y) < zone.r) rv.battery = Math.min(100, rv.battery + SCOUT_ROVER_CHARGE * dt);
  }
  const reach = riding ? 40 : 30;
  for (let i = sc.items.length - 1; i >= 0; i--){
    const it = sc.items[i];
    if (hyp(it.x - sc.x, it.y - sc.y) < reach){
      sc.items.splice(i, 1); if (it.t === 's') sc.carryS++; else sc.carryB++;
      scoutPop(it.x, it.y - 10, it.t === 's' ? '+1 sulfur' : '+1 basalt', it.t === 's' ? '#FFE27A' : '#B8C4E8'); sfx('pickupS', 0.04);
    }
  }
  sc.kickCd -= dt; sc.ramCd -= dt; if (sc.swing > 0) sc.swing -= dt;
  for (let i = 0; i < sc.rubble.length; i++) if (sc.rubble[i].shake > 0) sc.rubble[i].shake -= dt;
  if (riding && sc.ramCd <= 0 && (inp.m > 0.1)){                                        /* the rover rams rubble (and marines) apart */
    for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i]; if (hyp(r.x - sc.x, r.y - sc.y) < r.r + 30){ scoutHitRubble(sc, r); sc.ramCd = 0.4; break; } }
    if (sc.ramCd <= 0) for (let i = 0; i < sc.foes.length; i++){ const e = sc.foes[i]; if (e.kind === 'marine' && !e.dead && hyp(e.x - sc.x, e.y - sc.y) < e.r + 30){ scoutHitFoe(sc, e, 45); sc.ramCd = 0.4; break; } }
  }
  if (!riding && (Input.mdown || Input.touchKick || Input.keys[keyOf('kick')] || Settings.autoKick) && sc.kickCd <= 0){
    let near = false;
    for (let i = 0; i < sc.rubble.length && !near; i++) if (hyp(sc.rubble[i].x - sc.x, sc.rubble[i].y - sc.y) - sc.rubble[i].r < 64) near = true;
    for (let i = 0; i < sc.foes.length && !near; i++) if (sc.foes[i].kind === 'marine' && !sc.foes[i].dead && hyp(sc.foes[i].x - sc.x, sc.foes[i].y - sc.y) - sc.foes[i].r < 64) near = true;
    if (near || Input.mdown || Input.touchKick || Input.keys[keyOf('kick')]) scoutKick(sc);
  }
  /* visitors */
  if (sc.marineAt !== null && sc.t >= sc.marineAt){ sc.marineAt = null; scoutSpawnFoe('marine'); }
  if (sc.behemothAt !== null && sc.t >= sc.behemothAt){ sc.behemothAt = null; scoutSpawnFoe('behemoth'); }
  for (let i = sc.foes.length - 1; i >= 0; i--){
    const e = sc.foes[i];
    if (e.kind === 'marine') scoutUpdateMarine(sc, e, dt); else scoutUpdateBehemoth(sc, e, dt);
    if (e.dead) sc.foes.splice(i, 1);
  }
  for (let i = G.eproj.length - 1; i >= 0; i--){                                        /* the marine's rounds */
    const p = G.eproj[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (hyp(p.x - sc.x, p.y - sc.y) < 20){ scoutHurt(sc, SCOUT_MARINE_DMG, 'marine', 0.5); G.eproj.splice(i, 1); }
    else if (p.life <= 0 || p.x < 0 || p.y < 0 || p.x > SCOUT_W || p.y > SCOUT_H) G.eproj.splice(i, 1);
  }
  for (let i = sc.pops.length - 1; i >= 0; i--){ const p = sc.pops[i]; p.t += dt; if (p.dust){ p.x += p.vx * dt; p.y += p.vy * dt; } if (p.t > (p.dust ? 0.5 : 1.1)) sc.pops.splice(i, 1); }
  if (sc.left <= 15 && !sc.warnedTime){ sc.warnedTime = true; scoutPop(sc.x, sc.y - 90, 'Back to the pod: the trip is ending!', '#FFD86A'); }
  if (sc.hp <= 0) endScout(sc.killer === 'heat' || !sc.killer ? 'collapse' : 'downed');
  else if (sc.left <= 0) endScout('time');
}
function endScout(reason){
  const sc = G.scout;
  if (!sc || sc.done) return;
  sc.done = true; sc.reason = reason;
  if (sc.inPod) scoutBank(sc);
  sc.lostS = sc.carryS; sc.lostB = sc.carryB; sc.carryS = 0; sc.carryB = 0;
  if (sc.rover) sc.rover.riding = false;
  sc.foes.length = 0; G.eproj.length = 0;
  G.biome = sc.prevBiome || 'savanna';
  Save.write(); TOUCH.classList.remove('on');
  SFX.level();
  const why = reason === 'collapse' ? 'The heat got to her. She collapsed, and what she was carrying was lost.'
    : reason === 'downed' ? 'She was knocked out, and what she was carrying was lost.'
    : reason === 'time' ? 'The trip is over.' : 'You gave up the trip.';
  setOverlay(
    '<div class="panel slab" style="max-width:460px">' +
      '<h2 class="head">Scouting trip ' + (reason === 'collapse' || reason === 'downed' ? 'cut short' : 'over') + '</h2>' +
      '<p class="sub">' + why + '</p>' +
      '<p class="sub" style="margin-top:0">Brought back <b>' + sc.gotS + ' sulfur</b> and <b>' + sc.gotB + ' basalt</b>' +
        (sc.lostS + sc.lostB ? ', and lost ' + (sc.lostS + sc.lostB) + ' on the way' : '') + '. ' + sc.broke + (sc.broke === 1 ? ' rubble pile' : ' rubble piles') + ' kicked open.' +
        (sc.marinesKilled ? ' A Space Marine was sent packing.' : '') + (sc.behemothSeen ? ' A Behemoth Widowmaker crossed your path.' : '') + '</p>' +
      '<p class="sub" style="margin-top:0">You now have <b>' + (Save.data.sulfur | 0) + ' sulfur</b> and <b>' + (Save.data.basalt | 0) + ' basalt</b>.</p>' +
      '<div class="menucol" style="margin-top:0;width:100%">' +
        '<button class="btn" data-a="venus-scout">Scout again</button>' +
        '<button class="btn ghost" data-a="venus">Venus outpost</button>' +
      '</div>' +
    '</div>');
}
/* ---- drawing the plain ---- */
function drawRubbleHeap(ctx, r, t){
  const sx = r.shake > 0 ? Math.sin(t * 90) * 3 : 0, dmg = (r.maxHp || 3) - r.hp, x = r.x + sx, y = r.y, T = r.type || 'heap';
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 10, r.r * 1.15, r.r * 0.6, 0, 0, TAU); ctx.fill();
  const stone = (px, py, rr, a, c1, c2) => { ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(px, py, rr * 0.7, rr * 0.55, a, 0, TAU); ctx.fill(); ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(px - 3, py - 3, rr * 0.35, rr * 0.22, a, 0, TAU); ctx.fill(); };
  if (T === 'column'){                                                                 /* a cluster of black hexagonal basalt columns */
    for (let k = 0; k < 5; k++){ const a = r.seed + k * 1.26, cx = x + Math.cos(a) * r.r * 0.45, cy = y + Math.sin(a) * r.r * 0.35; ctx.fillStyle = '#20232E'; ctx.beginPath(); for (let j = 0; j < 6; j++) ctx.lineTo(cx + Math.cos(j / 6 * TAU) * 11, cy + Math.sin(j / 6 * TAU) * 9); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(150,170,255,.35)'; ctx.beginPath(); ctx.moveTo(cx - 6, cy - 3); ctx.lineTo(cx + 2, cy - 7); ctx.lineTo(cx - 1, cy); ctx.closePath(); ctx.fill(); }
  } else if (T === 'vein'){                                                            /* a grey boulder laced with yellow sulfur */
    stone(x, y, r.r * 1.1, r.seed, '#6A5A50', '#A89888');
    ctx.strokeStyle = '#F2D43A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.moveTo(x - 14 + k * 12, y - 12); ctx.lineTo(x - 8 + k * 11, y); ctx.lineTo(x - 15 + k * 12, y + 11); ctx.stroke(); } ctx.lineCap = 'butt';
    csGlow(ctx, x, y, 26, '#FFE040', 0.22);
  } else if (T === 'geode'){                                                           /* a split rock with a crystal heart */
    stone(x, y, r.r * 1.15, r.seed, '#5A4A44', '#8A7A70');
    ctx.fillStyle = '#B8A8FF'; for (let k = 0; k < 5; k++){ const a = k * 1.26; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); ctx.lineTo(x + Math.cos(a - 0.3) * 13, y + Math.sin(a - 0.3) * 13); ctx.lineTo(x + Math.cos(a + 0.3) * 13, y + Math.sin(a + 0.3) * 13); ctx.closePath(); ctx.fill(); }
    csGlow(ctx, x, y, 24, '#C8B8FF', 0.4 + 0.15 * Math.sin(t * 3 + r.seed));
  } else if (T === 'spire'){                                                           /* a tall shard of volcanic glass */
    stone(x, y + 6, r.r * 1.2, r.seed, '#14141C', '#3A3A52');
    ctx.fillStyle = '#0C0C14'; ctx.beginPath(); ctx.moveTo(x - 12, y + 4); ctx.lineTo(x - 2, y - 40); ctx.lineTo(x + 4, y - 30); ctx.lineTo(x + 13, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(140,150,255,.55)'; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y - 36); ctx.lineTo(x + 1, y - 10); ctx.closePath(); ctx.fill();
    csGlow(ctx, x, y - 20, 28, '#8A90FF', 0.22);
  } else if (T === 'slag'){                                                            /* crusty grey-green slag */
    for (let k = 0; k < 4; k++){ const a = r.seed + k * 1.6; stone(x + Math.cos(a) * r.r * 0.4, y + Math.sin(a) * r.r * 0.3, r.r * 0.8, a, k % 2 ? '#4E5248' : '#3E4238', 'rgba(170,180,150,.3)'); }
  } else {
    for (let k = 0; k < 6; k++){ const a = r.seed + k * 1.05, rr = r.r * (0.45 + 0.3 * ((k * 37) % 5) / 5); stone(x + Math.cos(a) * r.r * 0.45, y + Math.sin(a) * r.r * 0.35, rr, a, k % 2 ? '#5C4438' : '#4A362C', 'rgba(200,170,140,.25)'); }
  }
  ctx.strokeStyle = '#1A0E08'; ctx.lineWidth = 2;
  for (let k = 0; k < dmg && k < 5; k++){ ctx.beginPath(); ctx.moveTo(x - 16 + k * 10, y - 18); ctx.lineTo(x - 8 + k * 10, y - 2); ctx.lineTo(x - 14 + k * 10, y + 14); ctx.stroke(); }
  if (dmg > 0){ ctx.strokeStyle = 'rgba(255,200,90,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 8, y - 6); ctx.lineTo(x + 8, y + 6); ctx.stroke(); }
}
function renderScout(ctx){
  const sc = G.scout;
  if (!sc) return;
  const W = G.W, H = G.H, z = clamp(Math.min(W, H) / 640, 0.85, 1.35), vw = W / z, vh = H / z;
  const cx = clamp(sc.x, vw / 2, SCOUT_W - vw / 2), cy = clamp(sc.y, vh / 2, SCOUT_H - vh / 2), t = G.time;
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = '#0C0806'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  drawVenusGround(ctx, x0, y0, vw, vh, t);
  ctx.strokeStyle = 'rgba(10,6,4,.9)'; ctx.lineWidth = 12; ctx.strokeRect(-6, -6, SCOUT_W + 12, SCOUT_H + 12);            /* the edge of the map */
  for (let i = 0; i < sc.lava.length; i++){
    const l = sc.lava[i]; if (l.x + l.R < x0 || l.x - l.R > x0 + vw || l.y + l.R < y0 || l.y - l.R > y0 + vh) continue;
    drawLavaPool(ctx, l, t);
  }
  const p = SCOUT_POD, zn = scoutZone();                                                   /* the base, and the cool zone round it */
  const pg = ctx.createRadialGradient(zn.x, zn.y, zn.r * 0.2, zn.x, zn.y, zn.r); pg.addColorStop(0, 'rgba(150,215,255,.30)'); pg.addColorStop(1, 'rgba(150,215,255,.06)');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(zn.x, zn.y, zn.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(190,235,255,' + (0.6 + 0.2 * Math.sin(t * 3)) + ')'; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.arc(zn.x, zn.y, zn.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  drawHabitat(ctx, p.x, p.y, { hab: venusHabTier(), forge: venusHas('forge'), rover: false, t: t, s: 0.8 });
  for (let i = 0; i < sc.rubble.length; i++){ const r = sc.rubble[i]; if (r.x < x0 - 60 || r.x > x0 + vw + 60 || r.y < y0 - 60 || r.y > y0 + vh + 60) continue; drawRubbleHeap(ctx, r, t); }
  for (let i = 0; i < sc.items.length; i++){                                                /* sulfur crystals and basalt glass */
    const it = sc.items[i]; if (it.x < x0 - 40 || it.x > x0 + vw + 40 || it.y < y0 - 40 || it.y > y0 + vh + 40) continue;
    const pulse = 0.6 + 0.4 * Math.sin(t * 4 + it.ph);
    if (it.t === 's'){
      csGlow(ctx, it.x, it.y, 26, '#FFE040', 0.35 * pulse);
      for (const [dx, dy, s] of [[-5, 3, 1], [5, 2, 0.85], [0, -4, 1.15]]){ ctx.fillStyle = '#F2D43A'; ctx.beginPath(); ctx.moveTo(it.x + dx, it.y + dy - 11 * s); ctx.lineTo(it.x + dx + 6 * s, it.y + dy); ctx.lineTo(it.x + dx, it.y + dy + 7 * s); ctx.lineTo(it.x + dx - 6 * s, it.y + dy); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFF6A0'; ctx.fillRect(it.x + dx - 1, it.y + dy - 9 * s, 2.4, 6 * s); }
    } else {
      csGlow(ctx, it.x, it.y, 22, '#8AA0FF', 0.22 * pulse);
      ctx.fillStyle = '#1C1E2A'; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(it.x + Math.cos(a) * 12, it.y + Math.sin(a) * 10); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(150,170,255,.55)'; ctx.beginPath(); ctx.moveTo(it.x - 6, it.y - 4); ctx.lineTo(it.x + 2, it.y - 7); ctx.lineTo(it.x - 1, it.y); ctx.closePath(); ctx.fill();
    }
  }
  if (sc.rover) drawRoverTop(ctx, sc.rover.x, sc.rover.y, sc.rover.ang, { riding: sc.rover.riding, t: t });
  for (let i = 0; i < sc.foes.length; i++){ const e = sc.foes[i]; try { drawEnemy(ctx, e); } catch (err) {} }
  drawPlayer(ctx);
  if (sc.swing > 0){ const a = sc.face, f = sc.swing / 0.24; ctx.strokeStyle = 'rgba(255,255,255,' + f * 0.8 + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sc.x, sc.y, 52, a - 0.9, a + 0.9); ctx.stroke(); }
  for (let i = 0; i < G.eproj.length; i++){ const b = G.eproj[i]; ctx.strokeStyle = b.color || '#9FE8FF'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.045, b.y - b.vy * 0.045); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.lineCap = 'butt'; }
  for (let i = 0; i < sc.pops.length; i++){ const q = sc.pops[i];
    if (q.dust){ ctx.globalAlpha = 0.6 * (1 - q.t / 0.5); ctx.fillStyle = '#B08A6A'; ctx.beginPath(); ctx.arc(q.x, q.y, 5 + q.t * 14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; continue; }
    ctx.globalAlpha = 1 - q.t / 1.1; ctx.font = '800 15px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(q.txt, q.x, q.y - q.t * 34); ctx.fillStyle = q.col; ctx.fillText(q.txt, q.x, q.y - q.t * 34); ctx.globalAlpha = 1; }
  ctx.textAlign = 'left';
  ctx.restore();
  /* heat haze, a red pulse once she is burning, and a flash when she is hit */
  const h = sc.heat / 100;
  if (h > 0.05){ const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(255,60,20,0)'); v.addColorStop(1, 'rgba(255,50,20,' + (h * h * 0.5 + (sc.heat >= 100 ? 0.15 * (0.5 + 0.5 * Math.sin(t * 9)) : 0)) + ')'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  if (sc.hurtT > 0){ ctx.fillStyle = 'rgba(220,40,30,' + sc.hurtT * 0.5 + ')'; ctx.fillRect(0, 0, W, H); }
  /* the HUD */
  const bar = (x, y, w, frac, col, label) => { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, w, 18); ctx.fillStyle = col; ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * clamp(frac, 0, 1)), 14); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 17); ctx.fillStyle = '#fff'; ctx.font = '700 11px sans-serif'; ctx.fillText(label, x + 6, y + 13); };
  const rvs = sc.rover, panelH = rvs ? 136 : 112;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(12, 12, 246, panelH);
  bar(20, 20, 230, sc.heat / 100, sc.heat >= 100 ? '#FF3A1E' : sc.heat > 70 ? '#FF8A2A' : '#F2C24A', 'HEAT ' + Math.round(sc.heat) + (sc.inPod ? '  (cooling)' : rvs && rvs.riding ? '  (rover: no heat)' : ''));
  bar(20, 44, 230, sc.hp / 100, '#D8483C', 'HEALTH ' + Math.max(0, Math.round(sc.hp)));
  if (rvs) bar(20, 68, 230, rvs.battery / 100, rvs.battery < 20 ? '#E8603A' : '#4AB4F0', 'ROVER ' + Math.round(rvs.battery) + (rvs.riding ? '  (driving)' : ''));
  const ty0 = rvs ? 112 : 88;
  ctx.font = '700 14px sans-serif'; ctx.fillStyle = '#FFE27A'; ctx.fillText('Carrying: ' + sc.carryS + ' sulfur   ' + sc.carryB + ' basalt', 20, ty0);
  ctx.fillStyle = '#E8ECF8'; ctx.fillText('Banked:     ' + sc.gotS + ' sulfur   ' + sc.gotB + ' basalt', 20, ty0 + 20);
  const tl = Math.max(0, Math.ceil(sc.left)); ctx.textAlign = 'center'; ctx.font = '800 22px sans-serif'; ctx.fillStyle = tl <= 15 ? '#FFD86A' : '#fff'; ctx.fillText(Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0'), W / 2, 34); ctx.textAlign = 'left';
  const pd = hyp(sc.x - SCOUT_POD.x, sc.y - SCOUT_POD.y);
  if (pd > 420){ const a = Math.atan2(SCOUT_POD.y - sc.y, SCOUT_POD.x - sc.x), ax = W / 2 + Math.cos(a) * Math.min(W, H) * 0.38, ay = H / 2 + Math.sin(a) * Math.min(W, H) * 0.38;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = 'rgba(150,215,255,.85)'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -11); ctx.lineTo(-4, 0); ctx.lineTo(-10, 11); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(150,215,255,.9)'; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('POD', ax - Math.cos(a) * 26, ay - Math.sin(a) * 26 + 4); ctx.textAlign = 'left'; }
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '12px sans-serif';
  ctx.fillText((Input.hasTouch ? 'Joystick to walk. ' : 'WASD to walk. ') + (rvs ? (Input.hasTouch ? 'ROVER button to board. ' : 'E boards the rover. ') : '') + (Settings.autoKick ? 'Stand by rubble to kick it open. ' : 'Hold the mouse or Space to kick. ') + 'Stay in the ring to cool down and bank your haul. ' + (Input.hasTouch ? '' : 'Esc gives up.'), 14, H - 14);
}

/* ---------- the rover in every chapter ---------- */
/* Press E (or tap ROVER) to climb aboard. It is faster, pulls pickups in from further away, and takes the hits
   for you. It can be destroyed, and then it is gone for the rest of the run. */
const ROVER_PICKUP_MUL = 1.7;
function roverInit(){
  const hp = Math.round(Math.max(120, P.maxHp | 0) * (marsHas('rover2') ? 1.7 : 1));
  G.rover = venusHas('rover') ? { x: P.x + 90, y: P.y + 50, hp: hp, maxHp: hp, riding: false, alive: true, ang: 0, flash: 0 } : null;
}
function roverRiding(){ return !!(G.rover && G.rover.alive && G.rover.riding && G.state === 'playing'); }
function roverToggle(){
  const r = G.rover;
  if (G.state !== 'playing' || !r || !r.alive) return false;
  if (r.riding){ r.riding = false; r.x = P.x; r.y = P.y; return true; }
  if (hyp(P.x - r.x, P.y - r.y) > 110){ addText(P.x, P.y - 40, 'Walk to the rover first', '#FFD86A', 14, false); return false; }
  r.riding = true; sfx('pickupS', 0.05); addText(P.x, P.y - 40, 'Rover on!', '#9FE8FF', 15, false);
  return true;
}
function roverUpdate(dt){
  const r = G.rover;
  if (!r || G.state !== 'playing') return;
  if (r.flash > 0) r.flash -= dt;
  if (r.alive && r.riding){ r.x = P.x; r.y = P.y; r.ang = P.face; }
}
function roverHit(dmg){
  const r = G.rover;
  r.hp -= dmg; r.flash = 0.2; addShake(6); sfx('hit', 0.1);
  addText(P.x, P.y - 34, '-' + dmg, '#FFB060', 16, false); burstParticles(P.x, P.y, 8, '#FFB040', 180, 4);
  if (r.hp <= 0) roverDestroy();
}
function roverDestroy(){
  const r = G.rover;
  r.hp = 0; r.alive = false; r.riding = false;
  burstParticles(P.x, P.y, 22, '#FF8A2A', 340, 6, { glow: true }); addShake(16); screenFlash('#FF8A2A', 0.3, 0.3); sfx('boom', 0.2);
  addText(P.x, P.y - 50, 'ROVER DESTROYED', '#FF8A5A', 20, true);
  P.invuln = Math.max(P.invuln, 1.4);
}
function drawRover(ctx){
  const r = G.rover;
  if (!r || !r.alive) return;
  drawRoverTop(ctx, r.x, r.y, r.ang || 0, { riding: r.riding, t: G.time, flash: r.flash > 0, mk2: marsHas('rover2') });
  if (r.hp < r.maxHp || r.riding){
    const f = clamp(r.hp / r.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(r.x - 24, r.y - 38, 48, 6); ctx.fillStyle = f > 0.35 ? '#5CC0F0' : '#E8603A'; ctx.fillRect(r.x - 23, r.y - 37, 46 * f, 4);
  }
  if (r.hp < r.maxHp * 0.35) for (let k = 0; k < 3; k++){ const a = ((G.time * 0.9 + k / 3) % 1); ctx.globalAlpha = 0.5 * (1 - a); fillCircle(ctx, r.x - 10 + k * 6, r.y - 14 - a * 30, 4 + a * 8, '#3A3632'); } ctx.globalAlpha = 1;
  if (!r.riding && G.state === 'playing' && hyp(P.x - r.x, P.y - r.y) < 140){ ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Input.hasTouch ? 'tap ROVER' : 'E: board rover', r.x, r.y + 38); ctx.textAlign = 'left'; }
}
function refreshRoverBtn(){
  const b = document.getElementById('roverbtn');
  if (!b) return;
  const on = Input.hasTouch && ((G.state === 'playing' && G.rover && G.rover.alive) || (G.state === 'scout' && G.scout && G.scout.rover && !G.scout.done) || (G.state === 'mscout' && G.mscout && G.mscout.rover && !G.mscout.done));
  b.classList.toggle('on', !!on);
  b.classList.toggle('hit', !!((G.rover && G.rover.riding && G.state === 'playing') || (G.scout && G.scout.rover && G.scout.rover.riding && G.state === 'scout') || (G.mscout && G.mscout.rover && G.mscout.rover.riding && G.state === 'mscout')));
}
function roverPress(){ if (G.state === 'scout') scoutToggleRover(); else if (G.state === 'mscout') mscoutToggleRover(); else roverToggle(); }

/* ---------- the outpost screen ---------- */
let venusTab = 'scout';
const HAB_NAMES = ['The bare escape pod', 'Habitat Room', 'Bigger Habitat Room', 'Habitat Dome'];
const COL_NAMES = ['The original anthill', 'Sulfur-Fed mound', 'Basalt Burrows', 'The Deep Colony'];
function drawVenusBase(cv){
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const W = cv.width, H = cv.height;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#A8602E'); g.addColorStop(1, '#6A3618'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(40,18,8,.45)'; ctx.lineWidth = 2; for (let i = 0; i < 30; i++){ const x = csR(i + 6500) * W, y = csR(i + 6600) * H, a = csR(i + 6700) * TAU; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40 + 4); ctx.stroke(); }
  drawHabitat(ctx, W * 0.29, H * 0.45, { hab: venusHabTier(), forge: venusHas('forge'), rover: venusHas('rover'), t: 1.3, s: 0.76 });
  drawColony(ctx, W * 0.74, H * 0.56, venusColTier(), 1.3, venusColTier() >= 3 ? 0.62 : 0.76, { aim: -0.45, rooms: squadRooms() });
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, H - 26, W, 26);
  ctx.fillStyle = '#FFE6B8'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Habitat: ' + HAB_NAMES[venusHabTier()], W * 0.29, H - 9); ctx.fillText('Colony: ' + COL_NAMES[venusColTier()], W * 0.74, H - 9); ctx.textAlign = 'left';
}
function venusButtonHTML(){
  if (!venusUnlocked()) return '';
  return '<button class="btn ghost" data-a="venus">Venus outpost<small>' + (Save.data.sulfur | 0) + ' sulfur \u00B7 ' + (Save.data.basalt | 0) + ' basalt</small></button>';
}
function venusWorkshopHTML(){
  let out = '<p class="sub">Everything here is paid for in sulfur and basalt only. Some things need an earlier upgrade first, and what you build appears in the picture above.</p><div class="shoplist">';
  let grp = '';
  for (let i = 0; i < VENUS_UP.length; i++){
    const u = VENUS_UP[i];
    if (u.grp !== grp){ grp = u.grp; out += '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">' + grp + '</div>'; }
    const why = venusBuyCheck(u.id), owned = why === 'owned', missing = venusMissing(u).map(r => venusName(VENUS_BY_ID[r]));
    const colony = u.grp === 'Ant colony' && !Save.data.antsUnlocked;
    out += '<div class="shoprow" data-vrow="' + u.id + '"' + (why === 'requires' ? ' style="opacity:.55"' : '') + '>' +
      '<div class="ic">' + ico(venusIcon(u)) + '</div>' +
      '<div class="txt"><div class="nm">' + venusName(u) + ((u.max || 1) > 1 && venusLevel(u.id) > 0 ? ' \u2014 level ' + venusLevel(u.id) + '/' + u.max : '') + (owned ? ' \u2714' : '') + '</div>' +
        '<div class="ds">' + venusDesc(u) + (colony ? ' <i>(The ants themselves matter once the ant colony is unlocked.)</i>' : '') + '</div>' +
        (why === 'requires' ? '<div class="ds" style="color:#E8A060">Requires: ' + missing.join(', ') + '</div>' : '') + '</div>' +
      (owned ? '<div class="maxed">Owned</div>'
        : '<button class="btn sm buy' + (why ? ' ghost' : '') + '" data-vbuy="' + u.id + '"' + (why ? ' disabled' : '') + '>' +
          (why === 'requires' ? 'Locked' : venusLevel(u.id) > 0 ? 'Upgrade' : 'Build') + '<br><small>' + u.cost.s + ' sulfur + ' + u.cost.b + ' basalt</small></button>') +
      '</div>';
  }
  return out + '</div>';
}
function showVenus(tab){
  if (!venusUnlocked()){ showMenu(); return; }
  G.state = 'shop'; G.attract = true; G.venusScreen = true; G.marsScreen = false; G.labScreen = false; HUD.classList.remove('on');
  if (tab) venusTab = tab;
  if (venusTab === 'ship' && !shipUnlocked()) venusTab = 'scout';
  const body = venusTab === 'ship' ? shipTabHTML() : venusTab === 'work' ? venusWorkshopHTML() :
    '<p class="sub">The pod is all that is left of the ship. Walk out onto the plain and bring back sulfur and basalt: pick it up off the ground, or kick rubble open for more (there are six kinds, and the rarer ones hold the most). ' +
    'Heat builds whenever you are away from the pod, and faster over lava. At full heat you start losing health. The pod cools you down and banks whatever you are carrying; ' +
    '<b>anything you are still carrying when the trip ends is lost</b>. A trip lasts 2\u00BD minutes. Watch out: now and then a lone Space Marine comes looking for you, and very rarely something much bigger.</p>' +
    '<button class="btn" data-a="venus-scout" style="margin:6px auto 4px;display:block">Scout for Resources</button>';
  setOverlay(
    '<div class="panel slab">' +
      '<div class="goldline">' +
        '<span class="goldnum" style="color:#F2D43A">' + (Save.data.sulfur | 0) + '</span><span class="sub" style="margin:0">sulfur</span>' +
        '<span class="goldnum" style="color:#AEB8E0">' + (Save.data.basalt | 0) + '</span><span class="sub" style="margin:0">basalt</span>' +
      '</div>' +
      '<h2 class="head">Venus outpost</h2>' +
      '<p class="sub" style="margin-top:0">Gems cannot be found on Venus. Sulfur and basalt take their place.</p>' +
      '<canvas id="venusBase" width="720" height="300" style="width:100%;border-radius:6px;border:1px solid var(--bark2);margin:2px 0 8px"></canvas>' +
      '<div class="tabs">' +
        '<button class="tab' + (venusTab === 'scout' ? ' on' : '') + '" data-a="venus-tab-scout">Scout</button>' +
        '<button class="tab' + (venusTab === 'work' ? ' on' : '') + '" data-a="venus-tab-work">Workshop</button>' +
        (shipUnlocked() ? '<button class="tab' + (venusTab === 'ship' ? ' on' : '') + '" data-a="venus-tab-ship">Spaceplane</button>' : '') +
      '</div>' + body +
      '<div class="row" style="margin-top:20px"><button class="btn sm ghost" data-a="menu">Back to menu</button></div>' +
    '</div>');
  drawVenusBase(document.getElementById('venusBase'));
  drawShipPic(document.getElementById('shipPic'));
}

