'use strict';
/* The dust squad (alliance after chapter 13). */
/* ========================= THE DUST SQUAD (the alliance after Chapter 13) ========================= */
/* With the dust aliens as allies, up to five can be hired into the giraffe's squad. Hiring needs the Venus colony fully built (the Deep Colony) because they
   live in rooms built into the anthill. In a run, keys 1-5 (or a click on the right-hand panel) call one in; it fights the nearest enemy until it falls, then needs
   a cooldown before it can be called again. A squad alien has ten times the giraffe's health, and her armor does not help it. */
const SQUAD_CD = 40;
const SQUAD_SLOTS = [
  { type: 'warthog',     name: 'Bulwark Beetle' },
  { type: 'baboon',      name: 'Sand Leaper' },
  { type: 'cheetah',     name: 'Dune Strider' },
  { type: 'honeybadger', name: 'Rust Raker' },
  { type: 'rhino',       name: 'Rock Crusher' }
];
function squadAvailable(){ return !!(Save.data && Save.data.chapter13Complete && Save.data.antsUnlocked && venusHas('col3')); }
function squadHired(i){ return !!(Save.data && Save.data.squad && Save.data.squad[i]); }
function squadCost(i){ return { i: 120 + 60 * i, a: 20 + 15 * i, s: 50, b: 50 }; }
/* a cost is { i: iron, a: argon, s: sulfur, b: basalt } taken from the save */
const COST_KEYS = { i: 'iron', a: 'argon', s: 'sulfur', b: 'basalt' };
function canPay(c){ const d = Save.data; for (const k in c) if ((d[COST_KEYS[k]] | 0) < c[k]) return false; return true; }
function payCost(c){ const d = Save.data; for (const k in c) d[COST_KEYS[k]] = (d[COST_KEYS[k]] | 0) - c[k]; }
function squadRooms(){ return squadAvailable() ? SQUAD_SLOTS.map((s, i) => squadHired(i)) : null; }
function hireSquad(i){
  if (!squadAvailable() || squadHired(i) || !SQUAD_SLOTS[i]){ SFX.deny(); return false; }
  const c = squadCost(i); if (!canPay(c)){ SFX.deny(); return false; }
  payCost(c); if (!Save.data.squad) Save.data.squad = {}; Save.data.squad[i] = 1; Save.write(); SFX.buy(); return true;
}
function squadSectionHTML(){
  if (!Save.data.chapter13Complete) return '';
  let out = '<div class="sub" style="margin:18px 0 2px;font-weight:700;color:var(--sun)">The dust alliance</div>';
  if (!squadAvailable()){
    return out + '<p class="sub">The dust aliens will fight beside you, but they only live in a fully built colony. Build the <b>Deep Colony</b> at the Venus outpost (and unlock the ant colony) to give them rooms in the anthill.</p>';
  }
  out += '<p class="sub">Up to five dust aliens join the squad. In a run, ' + (Input.hasTouch ? 'tap them in the squad strip on the right edge' : 'keys <b>1–5</b>') + ' call them in; each has ten times your health (armor does not help it), fights the nearest enemy, and can be called again ' + SQUAD_CD + ' seconds after it falls. Each lives in a room of the anthill.</p><div class="shoplist">';
  for (let i = 0; i < SQUAD_SLOTS.length; i++){
    const s = SQUAD_SLOTS[i], k = DUST_KIT[s.type], hired = squadHired(i), c = squadCost(i), can = canPay(c);
    out += '<div class="shoprow"><div class="ic" style="color:' + k.color + '">' + (i + 1) + '</div><div class="txt"><div class="nm">' + s.name + (hired ? ' ✔' : '') + '</div><div class="ds">Key ' + (i + 1) + '. A dust alien of the Martian plains.</div></div>' +
      (hired ? '<div class="maxed">In the squad</div>' : '<button class="btn sm buy' + (can ? '' : ' ghost') + '" data-a="squad-hire-' + i + '"' + (can ? '' : ' disabled') + '>Hire<br><small>' + costText(c) + '</small></button>') + '</div>';
  }
  return out + '</div>';
}
function spawnSquadAlly(slot, x, y){
  const sl = SQUAD_SLOTS[slot], def = ETYPES_MARS[sl.type];
  const sc = enemyScale(chapterWaveOf(G.wave || 1)), hp = Math.max(120, P.maxHp) * 10;
  const a = { type: sl.type, def: def, x: x, y: y, r: def.r * 1.25, hp: hp, maxHp: hp, spd: def.spd * sc.spd, ang: Math.random() * TAU, anim: Math.random() * 6, atk: 0.2, flash: 0, hurt: 0,
    role: DUST_KIT[sl.type].role, state: 'idle', stateT: 0.4, dead: false, ally: true, squad: true, slot: slot, big: false, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1, brT: 3, dashT: rand(1, 3) };
  G.allies.push(a); burstParticles(x, y, 14, '#FFD27A', 220, 4, { glow: true }); addShock(x, y, 90, 0.35, 0, '#FFD27A', { width: 8 }); sfx('whoosh', 0.14);
  return a;
}
function squadSummon(i){
  if (G.state !== 'playing' || G.attract || !squadAvailable() || !squadHired(i) || !G.squadUnit) return false;
  const u = G.squadUnit[i];
  if (u && !u.dead && u.hp > 0) return false;
  if (G.squadCd[i] > 0){ SFX.deny(); return false; }
  const an = Math.random() * TAU;
  G.squadUnit[i] = spawnSquadAlly(i, clamp(P.x + Math.cos(an) * 110, 40, ARENA_W - 40), clamp(P.y + Math.sin(an) * 110, 40, ARENA_H - 40));
  addText(P.x, P.y - 60, SQUAD_SLOTS[i].name + ' answers!', '#FFD27A', 16, true);
  return true;
}
function squadInit(){
  G.squadCd = [0, 0, 0, 0, 0]; G.squadUnit = [null, null, null, null, null];
  buildSquadHUD();
}
function squadTick(dt){
  if (!G.squadCd) return;
  for (let i = 0; i < 5; i++){
    const u = G.squadUnit[i];
    if (u && (u.dead || u.hp <= 0)){ G.squadUnit[i] = null; G.squadCd[i] = SQUAD_CD; }
    else if (!u && G.squadCd[i] > 0) G.squadCd[i] = Math.max(0, G.squadCd[i] - dt);
  }
}
/* the panel on the right of the screen */
let SQUADHUD = null, squadEls = [];
function buildSquadHUD(){
  if (!SQUADHUD){
    SQUADHUD = document.createElement('div'); SQUADHUD.id = 'squadhud'; document.body.appendChild(SQUADHUD);
    SQUADHUD.addEventListener('click', e => { const s = e.target.closest('[data-sq]'); if (s) squadSummon(+s.dataset.sq); });
  }
  SQUADHUD.innerHTML = ''; squadEls = [];
  if (!squadAvailable()){ SQUADHUD.style.display = 'none'; return; }
  for (let i = 0; i < SQUAD_SLOTS.length; i++){
    if (!squadHired(i)) continue;
    const s = SQUAD_SLOTS[i], k = DUST_KIT[s.type], row = document.createElement('div');
    row.className = 'sq'; row.dataset.sq = i;
    row.innerHTML = '<canvas width="40" height="40"></canvas><span class="sqk">' + (i + 1) + '</span><div class="sqt"><div class="sqn">' + s.name + '</div><div class="sqs">Ready</div><div class="sqb"><i></i></div></div>';
    SQUADHUD.appendChild(row);
    const cv = row.querySelector('canvas'), c = cv.getContext('2d'), def = ETYPES_MARS[s.type];
    try { c.translate(20, 20); const z = 17 / Math.max(14, def.r); c.scale(z, z); drawEnemy(c, { portrait: true, def: def, type: s.type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 1, hp: 1, maxHp: 1, big: false, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 }); } catch (err) {}
    squadEls[i] = { row: row, status: row.querySelector('.sqs'), bar: row.querySelector('.sqb i'), sig: '' };
  }
}
function updateSquadHUD(){
  if (!SQUADHUD) return;
  const show = !G.attract && (G.state === 'playing' || G.state === 'paused' || G.state === 'levelup') && squadEls.length && G.squadUnit;
  const compact = !!(window.matchMedia && window.matchMedia('(max-width:760px),(max-height:520px),(pointer:coarse)').matches);
  SQUADHUD.style.display = (show && !(compact && G.state !== 'playing')) ? 'flex' : 'none';     /* the panel is a slim strip on phones, and gets out of the way of menus */
  if (!show) return;
  for (let i = 0; i < squadEls.length; i++){
    const el = squadEls[i]; if (!el) continue;
    const u = G.squadUnit[i], cd = G.squadCd[i];
    const sig = u ? 'a' + Math.round(100 * clamp(u.hp / u.maxHp, 0, 1)) : cd > 0 ? 'c' + Math.ceil(cd) : 'r';
    if (sig === el.sig) continue; el.sig = sig;
    el.row.className = 'sq' + (u ? ' act' : cd > 0 ? ' cd' : ' rdy');
    el.status.textContent = u ? 'Fighting' : cd > 0 ? Math.ceil(cd) + 's' : 'Ready';
    el.bar.style.width = (u ? clamp(u.hp / u.maxHp, 0, 1) * 100 : cd > 0 ? (1 - cd / SQUAD_CD) * 100 : 100) + '%';
  }
}
/* The squad's houses: five little 3D buildings (a front wall, a darker side wall, a roof) in a row along the foot of the colony, each joined to the colony
   by a covered tunnel that runs up into its side. Empty houses are boarded up; a hired alien's house has its door open, a warm light and eyes in the dark. */
function drawSquadRooms(ctx, rooms, t){
  const n = rooms.length;
  for (let i = 0; i < n; i++){                                                        /* the tunnels first, so every house stands in front of its own */
    const x = (i - (n - 1) / 2) * 44, y = 74 + (i % 2) * 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#14161C'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x + 3, y - 22); ctx.quadraticCurveTo(x * 0.8, 52, x * 0.5, 38); ctx.stroke();
    ctx.strokeStyle = rooms[i] ? '#6A7288' : '#4A5060'; ctx.lineWidth = 5.4; ctx.stroke();
    ctx.lineCap = 'butt';
  }
  for (let i = 0; i < n; i++){
    const x = (i - (n - 1) / 2) * 44, y = 74 + (i % 2) * 6, k = DUST_KIT[SQUAD_SLOTS[i].type], on = rooms[i];
    const w = 24, h = 20, d = 7;
    ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 4, w * 0.8, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = on ? '#4A5266' : '#3A404E'; ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + d, y - h - 6); ctx.lineTo(x + w / 2 + d, y - 6); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();          /* the side wall */
    ctx.fillStyle = on ? '#7A849C' : '#5A6074'; ctx.fillRect(x - w / 2, y - h, w, h);                                                                                                            /* the front wall */
    ctx.fillStyle = on ? k.color : '#4A4E5C'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, y - h); ctx.lineTo(x - w / 2 + d - 1, y - h - 8); ctx.lineTo(x + w / 2 + d + 2, y - h - 8); ctx.lineTo(x + w / 2 + 2, y - h); ctx.closePath(); ctx.fill();   /* the roof */
    ctx.strokeStyle = 'rgba(10,12,18,.7)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.strokeRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = '#12141A'; ctx.fillRect(x - 5, y - 13, 10, 13);                                                                                                                              /* the door */
    if (on){
      csGlow(ctx, x, y - 6, 16, '#FFD890', 0.38 + 0.12 * Math.sin(t * 3 + i)); fillCircle(ctx, x - 2.2, y - 8, 1.3, k.pale); fillCircle(ctx, x + 2.2, y - 8, 1.3, k.pale);
      ctx.fillStyle = k.pale; ctx.fillRect(x - w / 2 + 2, y - h + 3, 5, 4);                                                                                                                      /* a lit window */
    } else {
      ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 12); ctx.lineTo(x + 6, y - 2); ctx.moveTo(x + 6, y - 12); ctx.lineTo(x - 6, y - 2); ctx.stroke();   /* boarded up */
    }
  }
}
