'use strict';
/* Chapters 9 and 10, and the Deflector pulse. */
/* ========================= CHAPTER 9: VENUS ========================= */
/* Fire-themed aliens attack the giraffe on Venus, with Space Marines fighting alongside them. Nothing here is a new
   behaviour: both armies reuse the Chapter 8 AI (MARINE_AI), slot for slot, so a Cinder Spitter plays like a Marine
   Rifleman and the Inferno Queen fights like the Fleet Admiral. Only the look, the numbers and the world are new. */
const VENUS_MUL = { common: { hp: 22.0, dmg: 5.4, spd: 1.55, val: 10.0 }, boss: { hp: 16.0, dmg: 4.6, spd: 1.4, val: 7.0 } };
const VENUS_MARINE_SHARE = 0.35;                     /* about a third of the ordinary troops are Space Marines */
const VENUS_ALIEN = {
  hyena:       { look: 'cinderspitter', color: '#C23A18', dark: '#4A140A', pale: '#FFB830', blood: '#FF6A1E' },
  cheetah:     { look: 'flareleaper',   color: '#E8601A', dark: '#5A1C0A', pale: '#FFD860', blood: '#FF8A2A' },
  rhino:       { look: 'obsidianbrute', color: '#3A2A30', dark: '#14101A', pale: '#FF7A30', blood: '#FF5A1A', fx: '#FF8A3A' },
  termite:     { look: 'magmaegg',      color: '#8A3A1A', dark: '#2A100A', pale: '#FFB030', blood: '#FF7A1E' },
  grub:        { look: 'firewisp',      color: '#FF8A1E', dark: '#7A2A0A', pale: '#FFF0A0', blood: '#FFB030' },
  vulture:     { look: 'spearfiend',    color: '#5A4A48', dark: '#241C1C', pale: '#FF4A2A', blood: '#8A3A2A' },
  jackal:      { look: 'cinderbrawler', color: '#B83A1A', dark: '#401208', pale: '#FFC030', blood: '#FF6A1E' },
  warthog:     { look: 'forgetender',   color: '#7A4A2A', dark: '#2A1A0E', pale: '#FFD060', blood: '#C8641E' },
  baboon:      { look: 'emberpriest',   color: '#E8A84A', dark: '#6A3A14', pale: '#FFF2A0', blood: '#FFB030' },
  honeybadger: { look: 'pyrecrusher',   color: '#7A2A1A', dark: '#2A0E0A', pale: '#FF9A30', blood: '#E8501A' },
  mamba:       { look: 'smokewraith',   color: '#2A2430', dark: '#0E0A12', pale: '#FF6A3A', blood: '#4A3A4A' },
  ember:       { look: 'sporeimp',      color: '#6A2A1A', dark: '#240E08', pale: '#FF4A1A', blood: '#FF5A1A' },
  lion:        { look: 'pyrax',         color: '#A82A12', dark: '#3A0E08', pale: '#FFB020', blood: '#FF6A1E', title: 'Pyrax the Warlord',   fx: '#FF8A3A' },
  matriarch:   { look: 'pyreseer',      color: '#D8742A', dark: '#5A2410', pale: '#FFE070', blood: '#FFB030', title: 'The Pyre Seer',       fx: '#FF7A2A' },
  buffalo:     { look: 'magmacolossus', color: '#5A3A30', dark: '#1E1210', pale: '#FF6A1E', blood: '#FF5A1A', title: 'The Magma Colossus' },
  crocodile:   { look: 'maelstrom',     color: '#8A2A10', dark: '#2A0A06', pale: '#FFB040', blood: '#FF6A1E', title: 'The Maelstrom' },
  wildfire:    { look: 'infernoqueen',  color: '#E8501A', dark: '#5A1608', pale: '#FFE090', blood: '#FFB030', title: 'The Inferno Queen',   fx: '#FFC060' }
};
const ETYPES_VENUS = {}, ETYPES_VENUS_MARINE = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], mul = base.big ? VENUS_MUL.boss : VENUS_MUL.common, lk = MARINE_LOOKS[id], al = VENUS_ALIEN[id];
  const stats = { hp: base.hp * mul.hp * (lk.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val), kbRes: lk.kbRes !== undefined ? lk.kbRes : base.kbRes, ai: lk.ai, marine: true, splitInto: undefined, splitCount: undefined };
  ETYPES_VENUS_MARINE[id] = Object.assign({}, base, stats, { color: lk.color, dark: lk.dark, pale: lk.pale, look: lk.look, title: base.title ? lk.title : undefined }, lk.extra || {});
  ETYPES_VENUS[id] = Object.assign({}, base, stats, { color: al.color, dark: al.dark, pale: al.pale, blood: al.blood, look: al.look, title: base.title ? al.title : undefined, alien: true, fx: al.fx }, lk.extra || {});
});
ETYPES_VENUS.turret = Object.assign({}, ETYPES_MARINE.turret, { look: 'magmatotem', color: '#5A4038', dark: '#241814', pale: '#FF9A30', blood: '#FF7A1E', alien: true, fx: '#FF9A30' });
ETYPES_VENUS_MARINE.turret = Object.assign({}, ETYPES_MARINE.turret);
/* the sword carrier: a Blade Marine, or an alien Ember Duelist (a little tougher and quicker than the rifleman it replaces) */
ETYPES_VENUS_MARINE.sword = Object.assign({}, ETYPES_VENUS_MARINE.hyena, { ai: 'm_swordsman', look: 'bladeguard', color: '#3E64A0', dark: '#18284A', pale: '#7FE8FF', kbRes: 0.8, hp: ETYPES_VENUS_MARINE.hyena.hp * 1.3, spd: ETYPES_VENUS_MARINE.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });
ETYPES_VENUS.sword = Object.assign({}, ETYPES_VENUS.hyena, { ai: 'm_swordsman', look: 'emberblade', color: '#C8501E', dark: '#4A1608', pale: '#FFC040', blood: '#FF6A1E', kbRes: 0.8, hp: ETYPES_VENUS.hyena.hp * 1.3, spd: ETYPES_VENUS.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });
/* which army a unit belongs to: a roll below the marine share makes an ordinary soldier a Marine; bosses are always aliens,
   and a unit spawned BY another (a hatching egg, a turret an engineer builds) takes its parent's side */
function venusDefFor(type, roll, kind){
  if (kind === 'alien') return ETYPES_VENUS[type];
  if (kind === 'marine') return ETYPES_VENUS_MARINE[type];
  const a = ETYPES_VENUS[type];
  if (!a || a.big || type === 'turret') return a;
  return roll < VENUS_MARINE_SHARE ? ETYPES_VENUS_MARINE[type] : a;
}
/* ---------- the battlefield ---------- */
const VENUS_BASE_HEAL = 3;
function venusBasePos(){ return { x: ARENA_W * 0.30, y: ARENA_H * 0.30 }; }
function venusBaseZone(){ const z = SCOUT_ZONES[venusHabTier()], b = venusBasePos(); return { x: b.x + z.dx, y: b.y + z.dy, r: z.r }; }
function buildVenusWorld(){ G.buildings = []; G.rocket = null; }
/* the base heals her while she stands in it (3 health a second), more of it the more of the habitat she has built */
function updateVenusBase(dt){
  G.inBase = false;
  if (G.biome !== 'venus' || G.state !== 'playing' || G.attract || P.dead) return;
  const z = venusBaseZone();
  if (Math.hypot(P.x - z.x, P.y - z.y) < z.r){
    G.inBase = true;
    if (P.hp < P.maxHp){
      P.hp = Math.min(P.maxHp, P.hp + VENUS_BASE_HEAL * dt);
      if (Math.random() < dt * 6) addParticle(P.x + rand(-14, 14), P.y - 8, 0, -36, 2.6, 0.7, '#7CFFB0', { glow: true });
    }
  }
}
function drawGroundVenus(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, t = G.time;
  drawVenusGround(ctx, x0, y0, vw, vh, t, ARENA_W, ARENA_H);
  const z = venusBaseZone(), b = venusBasePos();
  if (z.x + z.r > x0 - 200 && z.x - z.r < x0 + vw + 200 && z.y + z.r > y0 - 200 && z.y - z.r < y0 + vh + 200){
    const pg = ctx.createRadialGradient(z.x, z.y, z.r * 0.2, z.x, z.y, z.r); pg.addColorStop(0, 'rgba(140,255,190,' + (G.inBase ? 0.30 : 0.16) + ')'); pg.addColorStop(1, 'rgba(140,255,190,' + (G.inBase ? 0.12 : 0.04) + ')');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(170,255,210,' + (0.5 + 0.25 * Math.sin(t * 3)) + ')'; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    drawHabitat(ctx, b.x, b.y, { hab: venusHabTier(), forge: venusHas('forge'), rover: false, t: t, s: 0.8 });
  }
  ctx.strokeStyle = 'rgba(10,6,4,.9)'; ctx.lineWidth = 10; ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.fillStyle = '#0A0605'; const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);
}
/* ---------- sulfur and basalt, instead of gold and gems ---------- */
function venusDropAmount(){ return 1 + Math.floor((chapterWaveOf(G.wave) - 1) / 9); }
function venusPickupGlyph(ctx, p, bob){
  if (p.type === 'sulfur'){
    softBlob(ctx, p.x, p.y + bob, 14, '#FFE040', 0.26);
    for (const [dx, dy, s] of [[-3.4, 2, 0.85], [3.4, 1.4, 0.75], [0, -2.4, 1.05]]){ ctx.fillStyle = '#F2D43A'; ctx.beginPath(); ctx.moveTo(p.x + dx, p.y + bob + dy - 8 * s); ctx.lineTo(p.x + dx + 4.4 * s, p.y + bob + dy); ctx.lineTo(p.x + dx, p.y + bob + dy + 5 * s); ctx.lineTo(p.x + dx - 4.4 * s, p.y + bob + dy); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFF6A0'; ctx.fillRect(p.x + dx - 0.8, p.y + bob + dy - 6.5 * s, 1.8, 4.4 * s); }
  } else {
    softBlob(ctx, p.x, p.y + bob, 13, '#8AA0FF', 0.2);
    ctx.fillStyle = '#1C1E2A'; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.3; ctx.lineTo(p.x + Math.cos(a) * 8.6, p.y + bob + Math.sin(a) * 7.4); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(150,170,255,.6)'; ctx.beginPath(); ctx.moveTo(p.x - 4, p.y + bob - 3); ctx.lineTo(p.x + 1.6, p.y + bob - 5.4); ctx.lineTo(p.x - 0.6, p.y + bob); ctx.closePath(); ctx.fill();
  }
}
function collectVenusPickup(p){
  const n = venusDropAmount();
  if (p.type === 'sulfur'){ G.runSulfur = (G.runSulfur | 0) + n; addText(P.x, P.y - 40, '+' + n + ' sulfur', '#FFE27A', 15, false); }
  else { G.runBasalt = (G.runBasalt | 0) + n; addText(P.x, P.y - 40, '+' + n + ' basalt', '#B8C4E8', 15, false); }
  sfx('coin', 0.05);
}

/* ========================= DEFLECTOR PULSE ========================= */
/* The Deflector Pulse card (epic, offered from Chapter 8 on) and the Deflector Module upgrade that starts every chapter
   with it. A pulse is a ring that rolls out from the giraffe and shoves every enemy bullet, missile and spit it touches
   straight away from her, and takes the aim out of anything that was homing. */
function maxCards(){ return 7 + (venusHas('deflector') ? 1 : 0); }
function grantStartCards(){
  const n = Math.min(10, venusLevel('deflector'));
  for (let i = 0; i < n; i++) takeCard('deflector');
}
function firePulse(radius, color){
  G.pulses.push({ x: P.x, y: P.y, r: 0, max: radius, t: 0, dur: 0.42, color: color || '#8FE8FF' });
  sfx('zap', 0.08);
}
function deflectProjectile(p, ox, oy){
  const a = Math.atan2(p.y - oy, p.x - ox), sp = Math.max(Math.hypot(p.vx, p.vy), 260) * 1.1;
  p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
  p.home = 0; p.deflected = true; p.life = Math.min(p.life, 1.4);
  burstParticles(p.x, p.y, 4, '#BFF4FF', 120, 2.6, { glow: true });
}
function updatePulses(dt){
  const ps = G.pulses;
  for (let i = ps.length - 1; i >= 0; i--){
    const q = ps[i];
    q.t += dt; q.x = P.x; q.y = P.y; q.r = q.max * Math.min(1, q.t / q.dur);       /* the ring stays centred on her as it grows */
    for (let k = 0; k < G.eproj.length; k++){ const p = G.eproj[k]; if (!p.deflected && Math.hypot(p.x - q.x, p.y - q.y) < q.r) deflectProjectile(p, q.x, q.y); }
    if (q.t >= q.dur) ps.splice(i, 1);
  }
}
function drawPulses(ctx){
  for (let i = 0; i < G.pulses.length; i++){
    const q = G.pulses[i], p = q.t / q.dur;
    const g = ctx.createRadialGradient(q.x, q.y, q.r * 0.6, q.x, q.y, Math.max(1, q.r)); g.addColorStop(0, 'rgba(143,232,255,0)'); g.addColorStop(1, 'rgba(143,232,255,' + 0.28 * (1 - p) + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = q.color; ctx.globalAlpha = 1 - p; ctx.lineWidth = 7 * (1 - p) + 2; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 0.97, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  }
}

/* ========================= CHAPTER 10: THE INFERNO ========================= */
/* Fire aliens only, no Marines, and almost all of them fight up close: the two ranged types (the Slag Slinger and the Cinder
   Gnat) are only about one enemy in ten. Same battlefield as Chapter 9. Each unit has its own new design; the behaviours are
   the melee ones from Chapter 8 plus two new ones (the spinning Blade Whirl and the burrowing Magma Maw). The five bosses use
   the original game's melee boss behaviours. */
const INFERNO_MUL = { common: { hp: 24.0, dmg: 5.8, spd: 1.6, val: 11.0 }, boss: { hp: 17.5, dmg: 5.0, spd: 1.42, val: 8.0 } };
const INFERNO_DROP_MUL = 1.6;                       /* sulfur and basalt drop 60% more often than in Chapter 9 */
const INFERNO_NEW_LK = {
  WHIRL:  { ai: 'm_whirler',  kbRes: 0.5, extra: { melee: { type: 'spin', range: 105 } } },
  BURROW: { ai: 'm_burrower', kbRes: 0.3, extra: { melee: { type: 'ring' } } }
};
/* which behaviour each slot borrows (a key of MARINE_LOOKS, or one of the new ones above) */
const INFERNO_SRC = { hyena: 'jackal', cheetah: 'cheetah', rhino: 'rhino', termite: 'termite', grub: 'grub', vulture: 'vulture', jackal: 'WHIRL', warthog: 'hyena', baboon: 'baboon', honeybadger: 'BURROW', mamba: 'mamba', ember: 'ember' };
const INFERNO_ALIEN = {
  hyena:       { look: 'cinderimp',    color: '#B8321A', dark: '#3A1008', pale: '#FFB030', blood: '#FF6A1E', hpMul: 1.4 },
  cheetah:     { look: 'magmahopper',  color: '#C4561E', dark: '#4A1A0A', pale: '#FFD060', blood: '#FF8A2A' },
  rhino:       { look: 'slagram',      color: '#5A3A34', dark: '#1E1214', pale: '#FF7A30', blood: '#FF5A1A', fx: '#FF8A3A' },
  termite:     { look: 'magmacocoon',  color: '#9A4A22', dark: '#32140A', pale: '#FFB030', blood: '#FF7A1E', hatch: ['hyena', 'hyena', 'jackal'] },
  grub:        { look: 'cindergnat',   color: '#E87A1E', dark: '#6A2208', pale: '#FFF0A0', blood: '#FFB030' },
  vulture:     { look: 'spikecharger', color: '#8A3A1E', dark: '#2E1008', pale: '#FF8A2A', blood: '#E8501A' },
  jackal:      { look: 'bladewhirl',   color: '#7A3A28', dark: '#2A100C', pale: '#FF9A30', blood: '#E8601E' },
  warthog:     { look: 'slagslinger',  color: '#6A2E22', dark: '#260E0A', pale: '#FFC040', blood: '#FF6A1E' },
  baboon:      { look: 'sootshaman',   color: '#6A5A52', dark: '#2A2220', pale: '#FFE090', blood: '#C8641E' },
  honeybadger: { look: 'magmamaw',     color: '#A8421A', dark: '#381208', pale: '#FF8A1E', blood: '#FF5A1A' },
  mamba:       { look: 'smokeserpent', color: '#3A2E3A', dark: '#14101A', pale: '#FF5A3A', blood: '#5A3A4A' },
  ember:       { look: 'blastbeetle',  color: '#7A3A1E', dark: '#2A0E08', pale: '#FF4A1A', blood: '#FF5A1A' },
  lion:        { look: 'tyrant',       color: '#A83214', dark: '#340C06', pale: '#FFB020', blood: '#FF6A1E', title: 'Pyroclast the Tyrant' },
  matriarch:   { look: 'magmamother',  color: '#B8561E', dark: '#3E1608', pale: '#FFD070', blood: '#FFB030', title: 'Mother Magma' },
  buffalo:     { look: 'rampager',     color: '#4E3430', dark: '#1A1012', pale: '#FF6A1E', blood: '#FF5A1A', title: 'The Obsidian Rampager' },
  crocodile:   { look: 'leviathan',    color: '#8A3218', dark: '#2A0C06', pale: '#FFB040', blood: '#FF6A1E', title: 'The Lava Leviathan' },
  wildfire:    { look: 'sovereign',    color: '#E8501A', dark: '#561408', pale: '#FFE090', blood: '#FFB030', title: 'The Inferno Sovereign' }
};
const ETYPES_INFERNO = {};
Object.keys(ETYPES).forEach(id => {
  const base = ETYPES[id], al = INFERNO_ALIEN[id], big = !!base.big, mul = big ? INFERNO_MUL.boss : INFERNO_MUL.common;
  if (big){                                                                           /* the original melee boss behaviours, with new bodies */
    ETYPES_INFERNO[id] = Object.assign({}, base, { hp: base.hp * mul.hp, dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
      color: al.color, dark: al.dark, pale: al.pale, blood: al.blood, look: al.look, title: al.title, alien: true, inferno: true });
    return;
  }
  const lk = INFERNO_NEW_LK[INFERNO_SRC[id]] || MARINE_LOOKS[INFERNO_SRC[id]];
  ETYPES_INFERNO[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (lk.hpMul || 1) * (al.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd, val: Math.round(base.val * mul.val),
    kbRes: lk.kbRes !== undefined ? lk.kbRes : base.kbRes, ai: lk.ai, marine: true, splitInto: undefined, splitCount: undefined,
    color: al.color, dark: al.dark, pale: al.pale, blood: al.blood, look: al.look, alien: true, inferno: true, fx: al.fx, hatch: al.hatch }, lk.extra || {});
});
/* the sword carrier (not a bestiary entry), for the same reason as in Chapters 8 and 9 */
ETYPES_INFERNO.sword = Object.assign({}, ETYPES_INFERNO.hyena, { ai: 'm_swordsman', look: 'infernoblade', color: '#C8501E', dark: '#4A1608', pale: '#FFC040', kbRes: 0.8, hp: ETYPES_INFERNO.hyena.hp * 1.1, spd: ETYPES_INFERNO.hyena.spd * 1.1, melee: { type: 'cone', range: 125, arc: 0.7 } });

