'use strict';
/* =============================================================================================================================
   44zzzzj-sky-chase.js  --  CHAPTER 17.5, THE AIR CHASE: THE SKY SHOOTER. The town helicopter flies up the screen over a sundown sea after LAB-1, the
   scientists' white helicopter, and she fights from the cabin. Played on its own screen (G.state 'sky', like the sea's 'sail'), not in the run's waves.
   STEERING: WASD or the arrow keys (or a held mouse button / finger: the helicopter flies toward it), within the screen.
   THREE GUNS: the nose gun fires straight ahead, the left and right door guns straight out of the side doors. She is at one of them at a time and that
     one fires by itself; J, K and L (the Controls page can change them; on a phone the three round buttons) move her to the left door, the nose and the
     right door. Moving takes a moment, with no shots while she does. I turns the dotted aiming line on and off (it shows where each gun fires, the one
     she is at brightest; the save keeps the choice, Save.data.skyAim).
   HER GEAR COUNTS: the hull is 100 plus her extra health, hits are cut by her damage reduction, her regeneration patches the hull, and her damage, haste
     and crits (P.stats from recalcStats) set the guns.
   TEN WAVES, numbered 436 to 445: lab drones (Rotor, Net, Mine, Laser and Carrier Drones) and hired Escort Gunships that fly in from the sides and break
     off after a while if they are not shot down; wave 5 is the Grey Escort (two big gunships flanking her), wave 10 the White Bird itself. After waves
     2, 4, 6 and 8 she picks one of three upgrades for the helicopter. Shot down, she can try again from wave 1, or from wave 6 once the Grey Escort is down.
   The art is in js/sky/44zzzzi-sky-art.js, the films in js/sky/44zzzzk-sky-films.js, and the menu card, Bestiary, Guide, rewards, achievements and the
   minigame in js/sky/44zzzzl-sky-extras.js. The numbers in SKY_TUNE are the ones to change if it is too hard or too easy.
   ============================================================================================================================= */
const SKY_TUNE = { hull: 100, gunDmg: 11, noseCd: 0.15, doorCd: 0.21, doorMul: 1.35, shotSpd: 940, move: 330, swap: 0.3, inv: 0.75, hpStep: 0.15, dmgStep: 0.06, gearDmgK: 0.6, gearDmgCap: 6, scroll: 240 };
/* the drones and gunships: hp, radius, speed, what a hit or a ram does, gold for each, and how long a hovering one stays */
const SKY_E = {
  rotor:   { type: 'hyena',   hp: 18,  r: 22, spd: 125, ram: 13, gold: 10 },
  net:     { type: 'grub',    hp: 30,  r: 25, spd: 110, shot: 6,  gold: 14, stay: 15 },
  mine:    { type: 'jackal',  hp: 16,  r: 20, spd: 70,  boom: 22, gold: 12 },
  laser:   { type: 'cheetah', hp: 40,  r: 26, spd: 140, beam: 24, gold: 18 },
  carrier: { type: 'vulture', hp: 100, r: 40, spd: 48,  ram: 18, gold: 30 },
  gunship: { type: 'rhino',   hp: 150, r: 50, spd: 170, shot: 8,  gold: 45, stay: 15 },
  grey:    { type: 'lion',    hp: 950, r: 64, spd: 150, shot: 9,  gold: 300, boss: true },
  white:   { type: 'wildfire', hp: 3400, r: 88, spd: 120, shot: 9, gold: 900, boss: true }
};
/* what each wave sends: [kind, how many]; the queue mixes them and spaces them out */
const SKY_WAVES_DEF = [
  [['rotor', 10]],
  [['rotor', 12], ['net', 3]],
  [['rotor', 10], ['mine', 6], ['net', 3]],
  [['rotor', 10], ['laser', 3], ['net', 3], ['gunship', 1]],
  [['grey', 2], ['rotor', 8]],
  [['rotor', 14], ['carrier', 2], ['mine', 6]],
  [['rotor', 12], ['laser', 4], ['gunship', 2], ['net', 4]],
  [['carrier', 3], ['mine', 8], ['rotor', 12], ['gunship', 2]],
  [['laser', 5], ['gunship', 3], ['carrier', 2], ['rotor', 14], ['net', 4]],
  [['white', 1]]
];
const SKY_FLAVOUR = ['Low over the water', 'The drones come out of its cargo door', 'Mines on the wind', 'Someone hired help', 'The Grey Escort closes in',
  'Out past the shipping lanes', 'Lasers in the sunset', 'The carriers are full', 'Everything they have left', 'The White Bird turns to fight'];
/* the helicopter's upgrades, one picked from three after waves 2, 4, 6 and 8 */
const SKY_PERKS = [
  { id: 'rapid', name: 'Oiled Breeches', desc: 'Every gun fires 20% faster.' },
  { id: 'twin', name: 'Twin Barrels', desc: 'Each gun fires one more shot side by side (up to three).', max: 2 },
  { id: 'plate', name: 'Armor Plate', desc: '25 more hull, and the new plate is put on now.' },
  { id: 'pierce', name: 'Steel Cores', desc: 'Shots go through one more drone.', max: 2 },
  { id: 'swift', name: 'Quick Feet', desc: 'She moves between the guns in half the time, and the helicopter steers 12% faster.', max: 1 },
  { id: 'patch', name: 'Field Patch', desc: 'Mend half of the hull right now.' }
];
const Sky = { on: false, mode: 'chapter', t: 0, wave: 1, ws: 'intro', wt: 0, q: [], en: [], shots: [], eb: [], fx: [], objs: [], x: 0, y: 0, hull: 100, max: 100, inv: 0, gun: 'nose', from: 'nose', sw: 0, fireT: 0,
  perks: {}, kills: 0, gold: 0, ckpt: 1, hold: '', down: 0, scroll: 0, slowT: 0, keysWas: {}, escSeen: 0, escDown: 0, bossHit: false, btn: null, ptrBtn: false, banner: 0, shake: 0 };
const SKY_GUNS = ['left', 'nose', 'right'];

function skyS(){ return clamp(Math.min(G.W, G.H) / 720, 0.55, 1.5); }
function skyWaveNo(cw){ return SKY_FIRST_WAVE + cw - 1; }
function skyStats(){ try { recalcStats(); } catch (e) {} return P.stats || {}; }
function skyGunDmg(){
  const st = Sky.st || {}, m = (st.kickDmgMul || 1) * (st.allDmgMul || 1);
  return SKY_TUNE.gunDmg * clamp(1 + (m - 1) * SKY_TUNE.gearDmgK, 1, SKY_TUNE.gearDmgCap);
}
function skyHasteMul(){ const st = Sky.st || {}; return clamp(st.hasteMul || 1, 1, 3) * Math.pow(1.2, Sky.perks.rapid | 0); }

/* ---- starting, and the screen's own state ---- */
function skyStart(fromWave, mode){
  Sky.on = true; Sky.mode = mode || 'chapter'; Sky.t = 0; Sky.st = skyStats();
  Sky.max = Math.round(SKY_TUNE.hull + (Sky.st.maxHpAdd || 0)); Sky.hull = Sky.max; Sky.inv = 0; Sky.gun = 'nose'; Sky.from = 'nose'; Sky.sw = 0; Sky.fireT = 0; Sky.perks = {};
  Sky.kills = 0; Sky.gold = 0; Sky.ckpt = fromWave >= 6 ? 6 : 1; Sky.hold = ''; Sky.down = 0; Sky.slowT = 0; Sky.escSeen = 0; Sky.escDown = 0; Sky.bossHit = false; Sky.shake = 0;
  Sky.en = []; Sky.shots = []; Sky.eb = []; Sky.fx = []; Sky.objs = []; Sky.scroll = 0; Sky.keysWas = {};
  Sky.x = G.W / 2; Sky.y = G.H * 0.76;
  if (fromWave >= 6){ Sky.perks.rapid = 1; Sky.perks.twin = 1; }                             /* starting again after the Grey Escort: the two upgrades she would have had */
  for (let i = 0; i < 6; i++) skySeaObj(Math.random() * G.H);
  G.state = 'sky'; G.attract = false; G.subScreen = ''; G.chapter = SKY_CHAPTER;
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on'); hideOverlay();
  if (Sky.mode === 'chapter' && Save.data){ Save.data.skyRuns = (Save.data.skyRuns | 0) + 1; Save.write(); }
  try { SFX.init(); SFX.resume(); } catch (e) {}
  skyWave(fromWave || 1); screenFadeIn(0.5);
}
function skyWave(cw){
  Sky.wave = cw; Sky.ws = 'intro'; Sky.wt = 1.8; Sky.banner = 0; Sky.q = []; Sky.qt = 0;
  const def = SKY_WAVES_DEF[cw - 1] || [], list = [];
  def.forEach(function(g){ for (let i = 0; i < g[1]; i++) list.push(g[0]); });
  const bosses = list.filter(function(k){ return SKY_E[k].boss; }), rest = list.filter(function(k){ return !SKY_E[k].boss; });
  for (let i = rest.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)), tmp = rest[i]; rest[i] = rest[j]; rest[j] = tmp; }
  let t = 0.4; const gap = Math.max(0.42, 1.05 - cw * 0.06);
  bosses.forEach(function(k, i){ Sky.q.push({ k: k, t: 0.6 + i * 0.05, side: i ? 1 : -1 }); });
  rest.forEach(function(k){ Sky.q.push({ k: k, t: bosses.length ? 4 + t * 1.6 : t }); t += gap * (k === 'gunship' || k === 'carrier' ? 2.2 : 1) * (0.6 + Math.random() * 0.8); });
  Sky.q.sort(function(a, b){ return a.t - b.t; });
  if (cw === 10) Sky.bossHit = false;
}
function skyEnemy(k, o){
  const D = SKY_E[k], s = skyS(), cw = Sky.wave, hpK = 1 + SKY_TUNE.hpStep * (cw - 1);
  const e = { k: k, type: D.type, def: ETYPES_SKY[D.type], hp: D.hp * (D.boss ? 1 : hpK), r: D.r * s, x: 0, y: -60 * s, vx: 0, vy: 0, ang: Math.PI / 2, t: 0, anim: Math.random() * 6, flash: 0, ph: Math.random() * 6, cd: 1 + Math.random(), boss: !!D.boss, phase: 1 };
  e.maxHp = e.hp;
  if (k === 'gunship' || k === 'grey'){
    const side = o && o.side ? o.side : (Math.random() < 0.5 ? -1 : 1);
    e.side = side; e.x = side < 0 ? -90 * s : G.W + 90 * s; e.y = G.H * (k === 'grey' ? 0.45 : 0.3 + Math.random() * 0.4); e.ang = side < 0 ? 0 : Math.PI; e.ty = e.y;
    if (k === 'gunship') Sky.escSeen++;
  } else if (k === 'white'){ e.x = G.W / 2; e.y = -140 * s; e.ty = G.H * 0.18; }
  else { e.x = G.W * (0.08 + Math.random() * 0.84); e.y = -50 * s; e.hx = e.x; e.ty = G.H * (0.14 + Math.random() * 0.26); }
  if (k === 'mine') e.vy = D.spd * s;
  Sky.en.push(e); return e;
}
/* the sea under her: ships, rocks, buoys and patches of fog drift down past as she flies on */
function skySeaObj(y){
  const r = Math.random(), k = r < 0.25 ? 'ship' : r < 0.5 ? 'rock' : r < 0.7 ? 'buoy' : r < 0.82 ? 'isle' : 'fog';
  Sky.objs.push({ k: k, x: Math.random() * G.W, y: y === undefined ? -160 : y, a: Math.random() * TAU, v: 0.6 + Math.random() * 0.5, r: 30 + Math.random() * 40, seed: Math.random() * 99 });
}

/* ---- every frame ---- */
function skyKey(a){ const k = Input.keys; return !!k[keyOf(a)]; }
function skyPressed(a){ const now = skyKey(a), was = !!Sky.keysWas[a]; Sky.keysWas[a] = now; return now && !was; }
function skyGoGun(g){
  if (Sky.gun === g && Sky.sw <= 0) return;
  Sky.from = Sky.sw > 0 ? Sky.from : Sky.gun; Sky.gun = g; Sky.sw = SKY_TUNE.swap * (Sky.perks.swift ? 0.5 : 1); Sky.swMax = Sky.sw;
  try { SFX.tone('triangle', 520, 700, 0.06, 0.05, 0, 0); } catch (e) {}
}
function skyToggleAim(){ if (!Save.data) return; Save.data.skyAim = !Save.data.skyAim; Save.write(); try { SFX.click(); } catch (e) {} }
function skyAimOn(){ return !Save.data || Save.data.skyAim !== false; }
/* where each gun is on the helicopter, and which way it fires */
function skyMuzzle(g){
  const s = skyS();
  if (g === 'left') return { x: Sky.x - 30 * s, y: Sky.y + 2 * s, dx: -1, dy: 0 };
  if (g === 'right') return { x: Sky.x + 30 * s, y: Sky.y + 2 * s, dx: 1, dy: 0 };
  return { x: Sky.x, y: Sky.y - 62 * s, dx: 0, dy: -1 };
}
function skyHurt(n, x, y){
  if (Sky.inv > 0 || Sky.down > 0 || Sky.hold) return;
  const st = Sky.st || {}, cw = Sky.wave, amt = n * (1 + SKY_TUNE.dmgStep * (cw - 1)) * (1 - clamp(st.dr || 0, 0, 0.6));
  Sky.hull = Math.max(0, Sky.hull - amt); Sky.inv = SKY_TUNE.inv * (st.invulnMul || 1); Sky.shake = Math.min(1, Sky.shake + 0.5);
  if (Sky.wave === 10) Sky.bossHit = true;
  skyBurst(x === undefined ? Sky.x : x, y === undefined ? Sky.y : y, 10, '#FFB070', 160);
  try { SFX.tone('square', 160, 70, 0.18, 0.12, 0, 0); } catch (e) {}
  if (Sky.hull <= 0){ Sky.down = 1.8; try { SFX.tone('sawtooth', 200, 40, 1.2, 0.16, 0, 0); } catch (e) {} }
}
function skyBurst(x, y, n, col, spd, o){
  o = o || {};
  for (let i = 0; i < n && Sky.fx.length < 260; i++){ const a = Math.random() * TAU, v = spd * (0.3 + Math.random() * 0.7) * skyS(); Sky.fx.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (o.r || 3) * (0.6 + Math.random() * 0.8) * skyS(), life: o.life || 0.5, t: 0, col: col, smoke: !!o.smoke }); }
}
function skyBoom(x, y, R, col){ Sky.fx.push({ ring: true, x: x, y: y, R: R, t: 0, life: 0.45, col: col || '255,200,120' }); skyBurst(x, y, 16, '#FFC870', 220); skyBurst(x, y, 8, 'rgba(60,56,52,.7)', 90, { smoke: true, life: 1, r: 6 }); }
function skySplash(x, y){ Sky.fx.push({ ring: true, x: x, y: y, R: 34 * skyS(), t: 0, life: 0.9, col: '235,250,255', thin: true }); skyBurst(x, y, 10, 'rgba(235,250,255,.9)', 120, { life: 0.6 }); }
function skyKill(e, by){
  if (e.dead) return; e.dead = true;
  Sky.kills++; Sky.gold += SKY_E[e.k].gold;
  if (Sky.mode === 'chapter') skyBestiary(e.type, e);
  if (e.k === 'gunship') Sky.escDown++;
  if (e.k === 'mine'){ skyMineBlast(e); return; }
  if (e.k === 'carrier') for (let i = 0; i < 3; i++){ const c = skyEnemy('rotor'); c.x = e.x + (i - 1) * 26 * skyS(); c.y = e.y; c.hx = c.x; }
  if (e.k === 'white'){ e.dead = false; e.ditch = 3.2; e.hp = 0; return; }       /* the White Bird does not blow up: it goes down into the sea */
  skyBoom(e.x, e.y, e.r * 1.6); e.fall = 0.7;
  try { SFX.tone('sawtooth', 240, 60, 0.3, 0.1, 0, 0); } catch (err) {}
}
function skyMineBlast(e){
  const R = 95 * skyS(); skyBoom(e.x, e.y, R, '255,150,90');
  if (Math.hypot(Sky.x - e.x, Sky.y - e.y) < R + 30 * skyS()) skyHurt(SKY_E.mine.boom, e.x, e.y);
  Sky.en.forEach(function(o){ if (o !== e && !o.dead && !o.boss && Math.hypot(o.x - e.x, o.y - e.y) < R + o.r){ o.hp -= 40; o.flash = 0.15; if (o.hp <= 0) skyKill(o); } });
  try { SFX.tone('square', 90, 40, 0.4, 0.14, 0, 0); } catch (err) {}
}
function skyBestiary(type, e){
  if (G.attract || !Save.data || typeof bestiaryData !== 'function') return;
  const b = bestiaryData(), key = SKY_CHAPTER + ':' + type, first = !b.creatures[key];
  b.creatures[key] = (b.creatures[key] | 0) + 1;
  if (first){ Sky.fx.push({ txt: 'New in Bestiary: ' + bestiaryName(SKY_CHAPTER, type).title, x: e.x, y: e.y - 30, t: 0, life: 2.2 }); Save.write(); }
}
function skyFire(){
  const g = Sky.gun, mz = skyMuzzle(g), s = skyS(), n = 1 + Math.min(2, Sky.perks.twin | 0), door = g !== 'nose', st = Sky.st || {};
  for (let i = 0; i < n; i++){
    const off = (i - (n - 1) / 2) * 9 * s, crit = Math.random() < (st.crit || 0.05);
    Sky.shots.push({ x: mz.x + (door ? 0 : off), y: mz.y + (door ? off : 0), vx: mz.dx * SKY_TUNE.shotSpd * s, vy: mz.dy * SKY_TUNE.shotSpd * s, dmg: skyGunDmg() * (door ? SKY_TUNE.doorMul : 1) * (crit ? (st.critMul || 2) : 1), crit: crit, pierce: Sky.perks.pierce | 0, hit: [] });
  }
  Sky.fx.push({ flash: true, x: mz.x, y: mz.y, dx: mz.dx, dy: mz.dy, t: 0, life: 0.06 });
  try { SFX.tone('square', door ? 300 : 380, 200, 0.04, 0.035, 0, 0); } catch (e) {}
}
function skyEShot(x, y, ang, spd, dmg, o){ const s = skyS(); Sky.eb.push({ x: x, y: y, vx: Math.cos(ang) * spd * s, vy: Math.sin(ang) * spd * s, dmg: dmg, r: ((o && o.r) || 5) * s, net: !!(o && o.net), t: 0 }); }
function skyAimAt(e){ return Math.atan2(Sky.y - e.y, Sky.x - e.x); }

function skyStep(dt){
  dt = Math.min(dt, 0.05);                                                                  /* (the loop's own catch-all moves G.time and the timers for this state) */
  if (Sky.hold) return;
  Sky.t += dt; const s = skyS(), W = G.W, H = G.H;
  if (Sky.shake > 0) Sky.shake = Math.max(0, Sky.shake - dt * 2);
  Sky.scroll += SKY_TUNE.scroll * s * dt;
  /* the sea below */
  for (let i = Sky.objs.length - 1; i >= 0; i--){ const o = Sky.objs[i]; o.y += SKY_TUNE.scroll * s * dt * o.v; if (o.y > H + 200) Sky.objs.splice(i, 1); }
  if (Sky.objs.length < 7 && Math.random() < dt * 0.8) skySeaObj();
  /* the helicopter going down */
  if (Sky.down > 0){
    Sky.down -= dt; Sky.y += 60 * s * dt; if (Math.random() < 0.6) skyBurst(Sky.x, Sky.y, 1, 'rgba(40,36,34,.7)', 40, { smoke: true, life: 1.2, r: 8 });
    skyUpdateFx(dt); if (Sky.down <= 0) skyShotDown(); return;
  }
  /* steering */
  const k = Input.keys, any = function(a){ for (let i = 0; i < a.length; i++) if (k[a[i]]) return true; return false; };
  let mx = (any(['ArrowRight', keyOf('right')]) ? 1 : 0) - (any(['ArrowLeft', keyOf('left')]) ? 1 : 0), my = (any(['ArrowDown', keyOf('down')]) ? 1 : 0) - (any(['ArrowUp', keyOf('up')]) ? 1 : 0);
  if (Input.padOn){ if (Math.abs(Input.padX) > 0.2) mx += Input.padX; if (Math.abs(Input.padY) > 0.2) my += Input.padY; }
  const spd = SKY_TUNE.move * s * (Sky.perks.swift ? 1.12 : 1) * (Sky.slowT > 0 ? 0.5 : 1) * ((Sky.st && Sky.st.speedMul) ? clamp(Sky.st.speedMul, 1, 1.3) : 1);
  if (Input.mdown && !Sky.ptrBtn && !mx && !my){                                            /* a held finger or mouse button: the helicopter flies toward it (a little above it, so a finger does not hide her) */
    const tx = Input.sx, ty = Input.sy - (Input.hasTouch ? 90 * s : 0), dx = tx - Sky.x, dy = ty - Sky.y, d = Math.hypot(dx, dy);
    if (d > 4){ const v = Math.min(spd * 1.15, d * 7); Sky.x += dx / d * v * dt; Sky.y += dy / d * v * dt; }
  } else { const m = Math.hypot(mx, my); if (m > 0){ Sky.x += mx / Math.max(1, m) * spd * dt; Sky.y += my / Math.max(1, m) * spd * dt; } }
  Sky.x = clamp(Sky.x, 60 * s, W - 60 * s); Sky.y = clamp(Sky.y, H * 0.32, H - 70 * s);
  if (Sky.slowT > 0) Sky.slowT -= dt;
  if (Sky.inv > 0) Sky.inv -= dt;
  const reg = Math.min(2, (Sky.st && Sky.st.regen) || 0); if (reg > 0) Sky.hull = Math.min(Sky.max, Sky.hull + reg * dt);
  /* the guns */
  if (skyPressed('skyLeft')) skyGoGun('left'); if (skyPressed('skyNose')) skyGoGun('nose'); if (skyPressed('skyRight')) skyGoGun('right'); if (skyPressed('skyAim')) skyToggleAim();
  if (Sky.sw > 0) Sky.sw -= dt;
  else { Sky.fireT -= dt; if (Sky.fireT <= 0 && Sky.ws !== 'clear'){ skyFire(); Sky.fireT = (Sky.gun === 'nose' ? SKY_TUNE.noseCd : SKY_TUNE.doorCd) / skyHasteMul(); } }
  /* the wave */
  if (Sky.ws === 'intro'){ Sky.wt -= dt; Sky.banner += dt; if (Sky.wt <= 0){ Sky.ws = 'fight'; Sky.qt = 0; } }
  else if (Sky.ws === 'fight'){
    Sky.qt += dt; Sky.banner += dt;
    while (Sky.q.length && Sky.q[0].t <= Sky.qt){ const it = Sky.q.shift(); skyEnemy(it.k, it); }
    if (!Sky.q.length && !Sky.en.some(function(e){ return !e.dead || e.fall > 0 || e.ditch > 0; })){ Sky.ws = 'clear'; Sky.wt = 1.4; try { SFX.level(); } catch (e) {} }
  } else if (Sky.ws === 'clear'){ Sky.wt -= dt; if (Sky.wt <= 0) skyWaveDone(); }
  skyUpdateEnemies(dt); skyUpdateShots(dt); skyUpdateFx(dt);
}
function skyUpdateEnemies(dt){
  const s = skyS(), W = G.W, H = G.H;
  for (let i = Sky.en.length - 1; i >= 0; i--){
    const e = Sky.en[i], D = SKY_E[e.k];
    e.t += dt; e.anim += dt * 3; if (e.flash > 0) e.flash -= dt;
    if (e.fall > 0){ e.fall -= dt; e.r *= 1 - dt * 1.2; e.ang += dt * 4; e.y += 40 * s * dt; if (e.fall <= 0){ skySplash(e.x, e.y); Sky.en.splice(i, 1); } continue; }
    if (e.ditch > 0){ skyWhiteDitch(e, dt); if (e.ditch <= 0){ skySplash(e.x, e.y); skySplash(e.x + 30 * s, e.y + 10 * s); Sky.en.splice(i, 1); } continue; }
    if (e.dead){ Sky.en.splice(i, 1); continue; }
    switch (e.k){
      case 'rotor': {                                                                        /* down in a weave, leaning toward her */
        e.hx += clamp(Sky.x - e.hx, -1, 1) * 40 * s * dt; e.x = e.hx + Math.sin(e.t * 2.4 + e.ph) * 38 * s; e.y += D.spd * s * dt * (1 + Sky.wave * 0.04);
        e.ang = Math.atan2(D.spd, Math.cos(e.t * 2.4 + e.ph) * 90); break;
      }
      case 'net': case 'laser': {                                                            /* down to a height, then hover there */
        if (e.y < e.ty) e.y += D.spd * s * dt; else { e.x += Math.sin(e.t * 0.9 + e.ph) * 60 * s * dt; }
        e.x = clamp(e.x, 30 * s, W - 30 * s); e.ang = Math.PI / 2;
        if (e.k === 'net'){ e.cd -= dt; if (e.cd <= 0 && e.y >= e.ty){ e.cd = 3.2 - Sky.wave * 0.1; skyEShot(e.x, e.y + e.r, skyAimAt(e), 210, D.shot, { r: 11, net: true }); } }
        else skyLaser(e, dt);
        if (e.t > (D.stay || 14) || e.shots >= 3){ e.ty = -200; e.y -= D.spd * 1.6 * s * dt; if (e.y < -80 * s) e.dead = true; }
        break;
      }
      case 'mine': {                                                                         /* drifting down; close to her it blinks, then goes off */
        e.y += e.vy * dt; e.x += Math.sin(e.t + e.ph) * 14 * s * dt; e.ang += dt;
        const d = Math.hypot(Sky.x - e.x, Sky.y - e.y);
        if (e.arm === undefined && d < 80 * s) e.arm = 0.55;
        if (e.arm !== undefined){ e.arm -= dt; e.blink = Math.sin(e.t * 30) > 0 ? 1 : 0; if (e.arm <= 0){ e.dead = true; skyMineBlast(e); } }
        break;
      }
      case 'carrier': { e.y += D.spd * s * dt; e.x += Math.sin(e.t * 0.6 + e.ph) * 20 * s * dt; e.ang = Math.PI / 2; break; }
      case 'gunship': case 'grey': skyGunship(e, dt); break;
      case 'white': skyWhite(e, dt); break;
    }
    if (e.y > H + 90 * s || e.x < -160 * s || e.x > W + 160 * s){ if (!e.boss && (e.y > H + 90 * s || e.left)) e.dead = true; }
    /* a ram */
    if (!e.dead && (D.ram || e.k === 'mine') && Math.hypot(Sky.x - e.x, Sky.y - e.y) < e.r + 34 * s){
      if (e.k === 'mine'){ e.dead = true; skyMineBlast(e); }
      else { skyHurt(D.ram, e.x, e.y); e.hp -= 30; e.flash = 0.15; if (e.hp <= 0) skyKill(e); }
    }
  }
}
function skyLaser(e, dt){                                                                     /* aims, shows a thin red line for a moment, then the beam */
  const s = skyS(); if (e.y < e.ty) return;
  e.cd -= dt; e.shots = e.shots | 0;
  if (e.beam > 0){ e.beam -= dt; if (!e.beamHit && Math.abs(Sky.x - e.x) < 28 * s && Sky.y > e.y){ e.beamHit = true; skyHurt(SKY_E.laser.beam, e.x, Sky.y); } if (e.beam <= 0){ e.shots++; e.cd = 1.6; } }
  else if (e.charge > 0){ e.charge -= dt; if (e.charge <= 0){ e.beam = 0.55; e.beamHit = false; try { SFX.tone('sawtooth', 900, 300, 0.4, 0.06, 0, 0); } catch (err) {} } }
  else if (e.cd <= 0){ e.charge = 1.15; e.x = clamp(e.x + (Sky.x - e.x) * 0.5, 30 * s, G.W - 30 * s); }
}
function skyGunship(e, dt){                                                                  /* in from a side, hold beside her and fire bursts; a hired one breaks off after a while */
  const s = skyS(), W = G.W, D = SKY_E[e.k], hold = e.k === 'grey' ? 0.16 : 0.1, hx = e.side < 0 ? W * hold : W * (1 - hold);
  if (e.left){ e.x -= e.side * D.spd * 1.4 * s * dt; e.y -= 30 * s * dt; e.ang = e.side < 0 ? Math.PI : 0; if (e.x < -200 * s || e.x > W + 200 * s){ e.dead = true; } return; }
  e.x += (hx - e.x) * Math.min(1, dt * 1.6);
  e.ty = clamp(e.ty + clamp(Sky.y - 40 * s - e.ty, -1, 1) * 70 * s * dt, G.H * 0.18, G.H * 0.82); e.y += (e.ty + Math.sin(e.t * 1.3 + e.ph) * 24 * s - e.y) * Math.min(1, dt * 2);
  { const base = e.side < 0 ? 0 : Math.PI; let da = Math.atan2(Sky.y - e.y, Sky.x - e.x) - base; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.ang = base + clamp(da, -0.5, 0.5); }      /* nose toward her, within reason */
  e.cd -= dt;
  if (e.cd <= 0 && Math.abs(e.x - hx) < 60 * s){
    const big = e.k === 'grey', n = big ? 5 : 3; e.cd = big ? 1.9 : 2.3;
    for (let i = 0; i < n; i++) setTimeoutish(function(){ if (!e.dead && Sky.on && !Sky.hold) skyEShot(e.x + (e.side < 0 ? e.r : -e.r), e.y, skyAimAt(e) + (Math.random() - 0.5) * 0.12, 330, D.shot); }, i * 0.12);
    if (big && Math.random() < 0.4) for (let q = -2; q <= 2; q++) skyEShot(e.x, e.y, skyAimAt(e) + q * 0.22, 230, D.shot, { r: 7 });
  }
  if (e.k === 'gunship' && e.t > D.stay){ e.left = true; }
}
function skyWhite(e, dt){                                                                     /* LAB-1: three ways of fighting, worse as it is hurt */
  const s = skyS(), W = G.W, H = G.H, f = e.hp / e.maxHp;
  e.phase = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
  if (e.phase !== e.wasPhase){ e.wasPhase = e.phase; e.cd = 1.2; e.drop = 1.5; if (e.phase > 1){ Sky.fx.push({ txt: e.phase === 2 ? 'It turns side on' : 'Smoking, and weaving low', x: W / 2, y: H * 0.42, t: 0, life: 2, big: true }); } }
  e.cd -= dt; e.drop -= dt;
  if (e.phase === 1){
    e.x = W / 2 + Math.sin(e.t * 0.55) * W * 0.3; e.y += (e.ty - e.y) * Math.min(1, dt * 1.2); e.ang = Math.PI / 2;
    if (e.drop <= 0){ e.drop = 2.6; for (let i = 0; i < 2; i++){ const c = skyEnemy('rotor'); c.x = e.x + (i ? 30 : -30) * s; c.y = e.y; c.hx = c.x; } }
    if (e.cd <= 0){ e.cd = 3.2; for (let q = -1; q <= 1; q++) skyEShot(e.x, e.y + e.r * 0.6, Math.PI / 2 + q * 0.3, 240, SKY_E.white.shot); }
  } else if (e.phase === 2){
    const tx = W / 2 + Math.sin(e.t * 0.8) * W * 0.32, ty = H * 0.26 + Math.sin(e.t * 1.1) * H * 0.05;
    e.x += (tx - e.x) * Math.min(1, dt * 1.5); e.y += (ty - e.y) * Math.min(1, dt * 1.5); e.ang = Math.PI / 2 + Math.sin(e.t * 0.8) * 1.1;
    if (e.cd <= 0){ e.cd = 1.6; for (let i = 0; i < 5; i++) setTimeoutish(function(){ if (!e.dead && Sky.on && !e.ditch && !Sky.hold) skyEShot(e.x, e.y, skyAimAt(e) + (Math.random() - 0.5) * 0.1, 320, SKY_E.white.shot); }, i * 0.11); }
    if (e.drop <= 0){ e.drop = 4; const m = skyEnemy('mine'); m.x = e.x; m.y = e.y + e.r; }
  } else {
    e.dive = (e.dive || 0) - dt;
    const diving = e.dive < 0 && e.dive > -1.6, tx = diving ? Sky.x : W / 2 + Math.sin(e.t * 1.4) * W * 0.36, ty = diving ? Sky.y - 160 * s : H * 0.2 + Math.sin(e.t * 2.2) * H * 0.04;
    if (e.dive < -1.6) e.dive = 5.5;
    e.x += (tx - e.x) * Math.min(1, dt * (diving ? 2.2 : 1.8)); e.y += (ty - e.y) * Math.min(1, dt * (diving ? 2.2 : 1.8)); e.ang = Math.PI / 2 + Math.sin(e.t * 1.4) * 0.6;
    if (Math.random() < dt * 8) skyBurst(e.x - 10 * s, e.y - 10 * s, 1, 'rgba(36,34,36,.7)', 30, { smoke: true, life: 1.4, r: 9 });
    if (e.cd <= 0){ e.cd = 2; for (let q = -3; q <= 3; q++) skyEShot(e.x, e.y, skyAimAt(e) + q * 0.18, 250, SKY_E.white.shot); }
    if (e.drop <= 0){ e.drop = 3.4; const c = skyEnemy('rotor'); c.x = e.x; c.y = e.y; c.hx = c.x; }
  }
  if (Math.hypot(Sky.x - e.x, Sky.y - e.y) < e.r * 0.8 + 30 * s) skyHurt(16, e.x, e.y);
}
function skyWhiteDitch(e, dt){                                                                 /* spinning down, smoking, onto the sea */
  const s = skyS(); e.ditch -= dt; e.t += dt; e.anim += dt * 2; e.ang += dt * (4 - e.ditch); e.y += (G.H * 0.42 - e.y) * Math.min(1, dt); e.x += (G.W / 2 - e.x) * Math.min(1, dt * 0.8);
  e.r = Math.max(30 * s, e.r - dt * 8 * s);
  if (Math.random() < 0.7) skyBurst(e.x, e.y, 1, 'rgba(36,34,36,.75)', 40, { smoke: true, life: 1.6, r: 10 });
}
function skyUpdateShots(dt){
  const s = skyS(), W = G.W, H = G.H;
  for (let i = Sky.shots.length - 1; i >= 0; i--){
    const b = Sky.shots[i]; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20){ Sky.shots.splice(i, 1); continue; }
    for (let j = 0; j < Sky.en.length; j++){
      const e = Sky.en[j]; if (e.dead || e.fall > 0 || e.ditch > 0 || b.hit.indexOf(e) >= 0) continue;
      if (e.boss && e.y < -20 * s) continue;
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4 * s){
        e.hp -= b.dmg; e.flash = 0.08; b.hit.push(e); skyBurst(b.x, b.y, 2, b.crit ? '#FFF0A0' : '#FFD8A0', 90, { life: 0.2 });
        if (e.hp <= 0) skyKill(e, b);
        if (b.pierce-- <= 0){ Sky.shots.splice(i, 1); break; }
      }
    }
  }
  for (let i = Sky.eb.length - 1; i >= 0; i--){
    const b = Sky.eb[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
    if (b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30){ Sky.eb.splice(i, 1); continue; }
    if (Math.hypot(b.x - Sky.x, b.y - Sky.y) < b.r + 26 * s){ if (b.net){ Sky.slowT = 2; } skyHurt(b.dmg, b.x, b.y); Sky.eb.splice(i, 1); }
  }
}
function skyUpdateFx(dt){
  for (let i = Sky.fx.length - 1; i >= 0; i--){
    const f = Sky.fx[i]; f.t += dt; if (f.t > f.life){ Sky.fx.splice(i, 1); continue; }
    if (f.vx !== undefined){ f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 1 - dt * 2.2; f.vy *= 1 - dt * 2.2; if (f.smoke){ f.y += SKY_TUNE.scroll * skyS() * dt * 0.5; f.r += dt * 8; } }
    if (f.txt) f.y -= 24 * dt;
  }
}

/* ---- between the waves, shot down, paused, finished ---- */
function skyWaveDone(){
  Sky.shots.length = 0; Sky.eb.length = 0;
  if (Sky.mode === 'chapter' && Save.data && Sky.wave > (Save.data.skyBestWave | 0)){ Save.data.skyBestWave = Sky.wave; Save.write(); }
  if (Sky.wave === 5) Sky.ckpt = 6;
  if (Sky.wave >= SKY_WAVES){ skyFinish(); return; }
  if (Sky.wave % 2 === 0) skyPerkPick(); else skyWave(Sky.wave + 1);
}
function skyPerkPick(){
  const pool = SKY_PERKS.filter(function(p){ return !p.max || (Sky.perks[p.id] | 0) < p.max; });
  for (let i = pool.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  Sky.offer = pool.slice(0, 3); Sky.hold = 'perk'; G.subScreen = 'skyperk';
  setOverlay('<div class="panel slab" style="max-width:520px"><h2 class="head">Wave ' + skyWaveNo(Sky.wave) + ' cleared</h2><p class="sub">The town mechanic shouts over the rotor: one thing for the helicopter, quick.</p><div class="menucol" style="width:100%">' +
    Sky.offer.map(function(p){ return '<button class="btn" data-a="sky-perk-' + p.id + '">' + p.name + '<small>' + p.desc + '</small></button>'; }).join('') + '</div></div>');
}
function skyTakePerk(id){
  if (Sky.hold !== 'perk' || !Sky.offer || !Sky.offer.some(function(p){ return p.id === id; })) return;
  Sky.perks[id] = (Sky.perks[id] | 0) + 1;
  if (id === 'plate'){ Sky.max += 25; Sky.hull = Math.min(Sky.max, Sky.hull + 25); }
  if (id === 'patch') Sky.hull = Math.min(Sky.max, Sky.hull + Sky.max * 0.5);
  Sky.hold = ''; G.subScreen = ''; hideOverlay(); try { SFX.pick(); } catch (e) {}
  skyWave(Sky.wave + 1);
}
function skyPayKills(){
  if (Sky.mode !== 'chapter' || !Save.data) return 0;
  const gm = (Sky.st && Sky.st.goldMul) || 1, g = Math.round(Sky.gold * gm); Save.data.gold = goldInt(Save.data.gold) + g; Sky.gold = 0; Save.write(); return g;
}
function skyShotDown(){
  const paid = skyPayKills(); Sky.hold = 'down'; G.subScreen = 'skydown';
  setOverlay('<div class="panel slab" style="max-width:480px"><h2 class="head">Shot down</h2><p class="sub">The town helicopter comes down on the water, and the White Bird gets away west. She was on wave <b>' + skyWaveNo(Sky.wave) + '</b>' +
    (paid ? ', and the drones she downed pay <b>' + fmt(paid) + ' gold</b>' : '') + '.</p><div class="menucol" style="width:100%">' +
    '<button class="btn" data-a="sky-retry">Try again from wave ' + skyWaveNo(Sky.ckpt) + '<small>' + (Sky.ckpt > 1 ? 'The Grey Escort is down: start after it' : 'From the start of the chase') + '</small></button>' +
    '<button class="btn ghost" data-a="sky-quit">Back to the menu</button></div></div>');
}
function skyPause(){
  if (!Sky.on || Sky.hold) return;
  Sky.hold = 'pause'; G.subScreen = 'skypause';
  setOverlay('<div class="panel slab" style="max-width:440px"><h2 class="head">Paused</h2><p class="sub">Chapter 17.5, the Air Chase: wave ' + skyWaveNo(Sky.wave) + ' of ' + skyWaveNo(SKY_WAVES) + '.</p><div class="menucol" style="width:100%">' +
    '<button class="btn" data-a="sky-resume">Resume</button><button class="btn ghost" data-a="sky-quit">Give up the chase<small>Back to the menu. The drones downed so far still pay.</small></button></div></div>');
}
function skyResume(){ if (Sky.hold !== 'pause') return; Sky.hold = ''; G.subScreen = ''; hideOverlay(); Sky.keysWas = {}; }
function skyQuit(){ if (Sky.hold !== 'down') skyPayKills(); Sky.on = false; Sky.hold = ''; G.subScreen = ''; hideOverlay(); showMenu(); }
function skyRetry(){ const w = Sky.ckpt, m = Sky.mode; hideOverlay(); skyStart(w, m); }
/* the last wave: the White Bird is in the sea. The save, the film, then the minigame and the results */
function skyFinish(){
  const paid = skyPayKills(), d = Save.data || {}, first = !d.chapter19Complete, gm = (Sky.st && Sky.st.goldMul) || 1;
  const gold = Math.round((first ? 30000 : 8000) * gm), gems = first ? 150 : 15;
  d.gold = goldInt(d.gold) + gold; d.gems = (d.gems | 0) + gems; d.chapter19Complete = true; d.skyBestWave = SKY_WAVES;
  if (Sky.escSeen > 0 && Sky.escDown >= Sky.escSeen) d.skyEscorts = true;
  if (!Sky.bossHit) d.skyClean = true;
  Save.write();
  Sky.result = { gold: gold + paid, gems: gems, first: first, kills: Sky.kills, escorts: Sky.escDown + ' of ' + Sky.escSeen, clean: !Sky.bossHit };
  Sky.on = false; Sky.hold = '';
  startCutscene(function(){ G.attract = false; if (!miniOffer(SKY_CHAPTER, skyResults)) skyResults(); }, false, 'skyout');
}
function skyResults(){
  const r = Sky.result || { gold: 0, gems: 0, kills: 0, escorts: '0 of 0' };
  G.state = 'help'; G.attract = true; G.subScreen = 'skyresult';
  setOverlay('<div class="panel slab" style="max-width:520px"><h2 class="head">The White Bird is down</h2>' +
    '<p class="sub">LAB-1 is in the sea, the coast guard has the scientists, and the chase is over. Chapter 17.5 is cleared.</p>' +
    '<div style="margin:6px 0;width:100%">' + [['Gold', fmt(r.gold)], ['Gems', r.gems], ['Drones and gunships downed', r.kills], ['Escorts shot down', r.escorts], ['The White Bird, without a scratch', r.clean ? 'yes' : 'no']].map(function(x){
      return '<div style="display:flex;justify-content:space-between;gap:12px;padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.08)"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
    (r.first ? '<p class="sub">New: the coat color <b>Sky Ace</b>, and the wreck of LAB-1 on the quay in the Harbor.</p>' : '') +
    '<div class="menucol" style="width:100%"><button class="btn" data-a="sky-done">Back to the menu</button></div></div>');
}

/* ---- drawing ---- */
function skySeaCol(){ const k = clamp((Sky.wave - 1) / 9, 0, 1); return { top: tw_mix('#2E5A7A', '#2A2A52', k), bot: tw_mix('#1A3A56', '#141A34', k), glint: k < 0.6 ? '255,214,150' : '255,170,150' }; }
function skyDrawSea(ctx, W, H){
  const c = skySeaCol(), g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c.top); g.addColorStop(1, c.bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const s = skyS(), sc = Sky.scroll;
  const sun = ctx.createRadialGradient(W * 0.5, -H * 0.1, 0, W * 0.5, -H * 0.1, H * 0.9); sun.addColorStop(0, 'rgba(255,190,120,.42)'); sun.addColorStop(0.5, 'rgba(255,150,110,.12)'); sun.addColorStop(1, 'rgba(255,150,110,0)'); ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);      /* the sun going down ahead, in the west */
  for (let i = 0; i < 70; i++){                                                              /* wave crests streaming down, and the sun on them */
    const fx = (Math.sin(i * 91.7) * 0.5 + 0.5) * W, cy = ((i * 53.3 + sc * (0.8 + (i % 5) * 0.08)) % (H + 40)) - 20, len = (16 + (i % 7) * 6) * s;
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(' + c.glint + ',.35)' : 'rgba(230,246,255,.16)'; ctx.lineWidth = (i % 3 + 1) * s; ctx.beginPath(); ctx.moveTo(fx, cy); ctx.quadraticCurveTo(fx + len / 2, cy - 3 * s, fx + len, cy); ctx.stroke();
  }
  Sky.objs.forEach(function(o){ if (o.k !== 'fog') skyDrawObj(ctx, o, s); });
}
function skyDrawObj(ctx, o, s){
  const x = o.x, y = o.y;
  if (o.k === 'ship'){                                                                       /* a cargo ship from above, its wake behind it */
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2 + Math.sin(o.seed) * 0.2); ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(235,250,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-66, -14); ctx.lineTo(-190, -44); ctx.moveTo(-66, 14); ctx.lineTo(-190, 44); ctx.stroke(); ctx.fillStyle = 'rgba(235,250,255,.18)'; ctx.fillRect(-150, -8, 84, 16);
    ctx.fillStyle = '#7A2A22'; ctx.beginPath(); ctx.moveTo(-70, -16); ctx.lineTo(56, -16); ctx.quadraticCurveTo(84, 0, 56, 16); ctx.lineTo(-70, 16); ctx.closePath(); ctx.fill();
    const cols = ['#C84A3A', '#3A7AB8', '#E8B83A', '#4A8A4A']; for (let k = 0; k < 6; k++) tw_rect(ctx, -50 + k * 15, -12, 13, 24, cols[(k + Math.floor(o.seed)) % 4]);
    tw_rect(ctx, -68, -11, 14, 22, '#E8E4D8'); ctx.restore();
  } else if (o.k === 'rock'){
    ctx.fillStyle = 'rgba(235,250,255,.4)'; ctx.beginPath(); ctx.ellipse(x, y, o.r * 0.9 * s, o.r * 0.6 * s, o.a, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A4A4E'; ctx.beginPath(); ctx.ellipse(x, y, o.r * 0.6 * s, o.r * 0.4 * s, o.a, 0, TAU); ctx.fill(); fillCircle(ctx, x - o.r * 0.15 * s, y - o.r * 0.1 * s, o.r * 0.2 * s, '#6A6A6E');
  } else if (o.k === 'buoy'){
    ringPath(ctx, x, y, 9 * s + Math.sin(Sky.t * 2 + o.seed) * 2 * s, 1.5 * s, '#E8F6FF', 0.5); fillCircle(ctx, x, y, 6 * s, '#E84A2A'); fillCircle(ctx, x, y, 2.5 * s, Math.sin(Sky.t * 3 + o.seed) > 0 ? '#FFF0A0' : '#7A2A1A');
  } else if (o.k === 'isle'){                                                                /* a little island: sand, palms, the surf round it */
    const r = o.r * 1.6 * s; ctx.fillStyle = 'rgba(235,250,255,.35)'; ctx.beginPath(); ctx.ellipse(x, y, r * 1.12, r * 0.82, o.a, 0, TAU); ctx.fill();
    ctx.fillStyle = '#E2CF9A'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, o.a, 0, TAU); ctx.fill(); ctx.fillStyle = '#3A6A3A'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.66, r * 0.42, o.a, 0, TAU); ctx.fill();
    for (let k = 0; k < 3; k++){ const px = x + Math.cos(o.seed + k * 2) * r * 0.3, py = y + Math.sin(o.seed + k * 2) * r * 0.2; for (let q = 0; q < 5; q++){ const a = q * TAU / 5 + o.seed; tw_ln(ctx, [px, py, px + Math.cos(a) * 12 * s, py + Math.sin(a) * 12 * s], 4 * s, '#2A5A2A'); } }
  }
}
function skyDrawHeli(ctx){                                                                    /* the town helicopter, nose up, and her at her gun; the rotor last, over her */
  const s = skyS(), x = Sky.x, y = Sky.y, sc = s * 1.0, r = 62 * sc;
  ctx.fillStyle = 'rgba(8,16,28,.3)'; ctx.beginPath(); ctx.ellipse(x + 26 * s, y + 40 * s, r * 0.9, r * 0.5, 0, 0, TAU); ctx.fill();          /* the shadow on the sea */
  const flick = Sky.inv > 0 && Math.floor(Sky.t * 16) % 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 2 + (Sky.down > 0 ? (1.8 - Sky.down) * 2 : 0));
  if (flick) ctx.globalAlpha = 0.6;
  skyHeliTop(ctx, r, SKY_PAL.town, { open: true, doors: Sky.gun === 'nose' ? '' : Sky.gun, gun: true, noRotor: true });
  for (const sd of [-1, 1]){ ctx.fillStyle = '#2A3034'; ctx.fillRect(-r * 0.12, sd * r * 0.5 - (sd > 0 ? 0 : r * 0.08), r * 0.18, r * 0.08); }    /* the door guns on their mounts */
  /* her: at the nose (facing ahead), or at a door with her head out */
  const pos = function(g){ return g === 'left' ? { x: -r * 0.05, y: -r * 0.26, a: -Math.PI / 2 } : g === 'right' ? { x: -r * 0.05, y: r * 0.26, a: Math.PI / 2 } : { x: r * 0.12, y: 0, a: 0 }; };
  const A = pos(Sky.from), B = pos(Sky.gun), k = Sky.sw > 0 && Sky.swMax ? 1 - Sky.sw / Sky.swMax : 1, px = A.x + (B.x - A.x) * k, py = A.y + (B.y - A.y) * k;
  let da = B.a - A.a; const pa = A.a + da * k;
  drawTopGiraffe(ctx, px - Math.cos(pa) * r * 0.18, py - Math.sin(pa) * r * 0.18, pa, 0.44 * sc, Sky.sw > 0 ? Sky.t * 14 : 0, { moving: Sky.sw > 0, neck: 26 });
  ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.45; skyRotor(ctx, -r * 0.05, 0, r * 1.3, Sky.t * 26, 4, false, true); ctx.globalAlpha = 1;
  ctx.restore();
}
function skyDrawAim(ctx){
  if (!skyAimOn() || Sky.down > 0) return;
  const s = skyS(); ctx.save(); ctx.setLineDash([6 * s, 8 * s]); ctx.lineWidth = 2 * s;
  SKY_GUNS.forEach(function(g){
    const m = skyMuzzle(g), on = g === Sky.gun, len = m.dx ? (m.dx > 0 ? G.W - m.x : m.x) : m.y;
    ctx.strokeStyle = on ? 'rgba(255,240,200,.75)' : 'rgba(255,240,200,.2)'; ctx.beginPath(); ctx.moveTo(m.x + m.dx * 10 * s, m.y + m.dy * 10 * s); ctx.lineTo(m.x + m.dx * len, m.y + m.dy * len); ctx.stroke();
  });
  ctx.restore();
}
function skyDrawEnemy(ctx, e){
  const d = e.def || ETYPES_SKY[e.type], s = skyS();
  if (!d) return;
  ctx.fillStyle = 'rgba(8,16,28,.25)'; ctx.beginPath(); ctx.ellipse(e.x + e.r * 0.5, e.y + e.r * 0.8, e.r * 0.9, e.r * 0.5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang); if (e.fall > 0) ctx.globalAlpha = clamp(e.fall / 0.7, 0, 1);
  const hf = e.flash > 0 ? 0.75 : 0, body = hf ? blendHex(d.color, '#FFFFFF', hf) : d.color, dk = hf ? blendHex(d.dark, '#FFFFFF', hf * 0.6) : d.dark;
  const look = { r: e.r, anim: e.anim, blink: e.blink, charge: e.charge, phase: e.phase, portrait: false };
  try { SKY_DRAW[d.look](ctx, look, body, dk, 0, false, d); } catch (err) {}
  ctx.restore();
  if (e.k === 'laser' && (e.charge > 0 || e.beam > 0)){                                    /* the laser's warning line, then its beam */
    const bx = e.x, by = e.y + e.r * 0.6;
    if (e.beam > 0){ ctx.fillStyle = 'rgba(255,90,70,.35)'; ctx.fillRect(bx - 16 * s, by, 32 * s, G.H); ctx.fillStyle = 'rgba(255,230,220,.9)'; ctx.fillRect(bx - 5 * s, by, 10 * s, G.H); }
    else { ctx.strokeStyle = 'rgba(255,80,60,' + (0.3 + 0.4 * Math.abs(Math.sin(Sky.t * 18))).toFixed(2) + ')'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, G.H); ctx.stroke(); }
  }
  if (!e.boss && e.hp < e.maxHp && !e.fall){ const w = e.r * 1.6; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(e.x - w / 2, e.y - e.r - 10 * s, w, 4 * s); ctx.fillStyle = '#9FBF52'; ctx.fillRect(e.x - w / 2, e.y - e.r - 10 * s, w * clamp(e.hp / e.maxHp, 0, 1), 4 * s); }
}
function skyDrawShots(ctx){
  const s = skyS();
  Sky.shots.forEach(function(b){ const a = Math.atan2(b.vy, b.vx); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a); ctx.fillStyle = b.crit ? '#FFF6B0' : '#FFD27A'; ctx.fillRect(-9 * s, -1.6 * s, 14 * s, 3.2 * s); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1 * s, -1 * s, 4 * s, 2 * s); ctx.restore(); });
  Sky.eb.forEach(function(b){
    if (b.net){ ctx.strokeStyle = 'rgba(232,216,160,.9)'; ctx.lineWidth = 1.4 * s; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.t * 3); ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(-b.r, k * b.r * 0.4); ctx.lineTo(b.r, k * b.r * 0.4); ctx.moveTo(k * b.r * 0.4, -b.r); ctx.lineTo(k * b.r * 0.4, b.r); } ctx.stroke(); ctx.restore(); }
    else { fillCircle(ctx, b.x, b.y, b.r * 1.6, 'rgba(255,90,60,.25)'); fillCircle(ctx, b.x, b.y, b.r, '#FF6A4A'); fillCircle(ctx, b.x, b.y, b.r * 0.45, '#FFE0C8'); }
  });
}
function skyDrawFx(ctx){
  const s = skyS();
  Sky.fx.forEach(function(f){
    const u = f.t / f.life;
    if (f.ring){ ctx.strokeStyle = 'rgba(' + f.col + ',' + (0.8 * (1 - u)).toFixed(3) + ')'; ctx.lineWidth = (f.thin ? 2 : 4) * s * (1 - u) + 1; ctx.beginPath(); ctx.arc(f.x, f.y, f.R * (0.3 + u), 0, TAU); ctx.stroke(); if (!f.thin) fillCircle(ctx, f.x, f.y, f.R * 0.5 * (1 - u), 'rgba(255,220,150,' + (0.6 * (1 - u)).toFixed(3) + ')'); }
    else if (f.flash){ fillCircle(ctx, f.x + f.dx * 8 * s, f.y + f.dy * 8 * s, 7 * s, 'rgba(255,240,180,.85)'); }
    else if (f.txt){ ctx.globalAlpha = clamp(2 * (1 - u), 0, 1); miniText(ctx, f.txt, f.x, f.y, (f.big ? 26 : 15) * s, f.big ? '#FFE6A0' : '#E8C24A'); ctx.globalAlpha = 1; }
    else { ctx.globalAlpha = (1 - u) * (f.smoke ? 0.7 : 1); fillCircle(ctx, f.x, f.y, f.r, f.col); ctx.globalAlpha = 1; }
  });
}
function skyBossOf(){ return Sky.en.filter(function(e){ return e.boss && !e.dead && !(e.ditch > 0); }); }
function skyButtons(){                                                                       /* the phone's buttons: the three guns, the aiming line and pause */
  const s = skyS(), W = G.W, H = G.H, R = 34 * s, y = H - 58 * s, x0 = W - 58 * s - R * 4.4;
  return [{ id: 'left', x: x0, y: y, r: R }, { id: 'nose', x: x0 + R * 2.2, y: y - R * 0.9, r: R }, { id: 'right', x: x0 + R * 4.4, y: y, r: R }, { id: 'aim', x: 44 * s, y: H - 50 * s, r: 24 * s }, { id: 'pause', x: W - 34 * s, y: 34 * s, r: 22 * s }];
}
function skyDrawHud(ctx){
  const s = skyS(), W = G.W, H = G.H;
  /* the hull */
  const narrow = W < 640, x0 = 14, bw = Math.min(300 * s, W * (narrow ? 0.5 : 0.4)), bh = Math.max(13, 14 * s), f = clamp(Sky.hull / Sky.max, 0, 1);
  miniText(ctx, 'HULL', x0, 20, 13, '#FFF6E0', 'left');
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x0, 27, bw, bh); ctx.fillStyle = f > 0.5 ? '#9FBF52' : f > 0.25 ? '#F2B33D' : '#CF4433'; ctx.fillRect(x0, 27, bw * f, bh);
  miniText(ctx, Math.ceil(Sky.hull) + ' / ' + Sky.max, x0 + bw / 2, 27 + bh * 0.82, 12.5, '#FFFFFF');
  if (Sky.slowT > 0) miniText(ctx, 'Tangled in a net!', x0, 27 + bh + 20, 14, '#E8D8A0', 'left');
  /* the chapter and the wave: beside the hull on a wide screen, under it on a narrow one */
  const ty = narrow ? 27 + bh + (Sky.slowT > 0 ? 40 : 20) : 24;
  miniText(ctx, (narrow ? 'CH.17.5 · WAVE ' : 'CH.17.5 THE AIR CHASE · WAVE ') + skyWaveNo(Sky.wave), narrow ? x0 : W / 2, ty, 14, '#FFE6A0', narrow ? 'left' : 'center');
  const bosses = skyBossOf();
  if (bosses.length){
    let hp = 0, mx = 0; bosses.forEach(function(b){ hp += Math.max(0, b.hp); mx += b.maxHp; });
    const w = Math.min(460 * s, W * (narrow ? 0.8 : 0.6)), by = ty + 10; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(W / 2 - w / 2, by, w, 12); ctx.fillStyle = '#E86A4A'; ctx.fillRect(W / 2 - w / 2, by, w * clamp(hp / mx, 0, 1), 12);
    miniText(ctx, bosses[0].k === 'white' ? 'THE WHITE BIRD' : 'GREY ESCORT', W / 2, by + 30, 14, '#FFFFFF');
  }
  if (Sky.ws === 'intro' || (Sky.banner < 3 && Sky.ws === 'fight')){
    const a = clamp(Math.min(Sky.banner * 3, (3 - Sky.banner) * 1.5), 0, 1); ctx.globalAlpha = a;
    miniText(ctx, 'WAVE ' + skyWaveNo(Sky.wave), W / 2, H * 0.36, 40 * s, '#FFF6E0'); miniText(ctx, SKY_FLAVOUR[Sky.wave - 1] || '', W / 2, H * 0.36 + 34 * s, 18 * s, '#FFE6A0'); ctx.globalAlpha = 1;
  }
  if (Sky.ws === 'clear') miniText(ctx, 'Wave cleared', W / 2, H * 0.4, 30 * s, '#BFF0A0');
  /* the guns: where she is, and the key for each */
  if (Input.hasTouch){
    const lab = { left: '◀', nose: '▲', right: '▶', aim: 'AIM', pause: 'II' };
    skyButtons().forEach(function(b){
      const on = b.id === Sky.gun || (b.id === 'aim' && skyAimOn());
      fillCircle(ctx, b.x, b.y, b.r, on ? 'rgba(232,194,74,.55)' : 'rgba(20,24,32,.45)'); ringPath(ctx, b.x, b.y, b.r, 2 * s, '#FFF6E0', 0.7);
      miniText(ctx, lab[b.id], b.x, b.y + b.r * 0.3, b.id === 'aim' ? b.r * 0.55 : b.r * 0.8, '#FFF6E0');
    });
  } else {
    const names = { left: 'Left door', nose: 'Nose', right: 'Right door' }, keys = { left: 'skyLeft', nose: 'skyNose', right: 'skyRight' };
    SKY_GUNS.forEach(function(g, i){
      const x = W / 2 + (i - 1) * 150 * s, y = H - 26 * s, on = g === Sky.gun;
      ctx.fillStyle = on ? 'rgba(232,194,74,.5)' : 'rgba(10,14,20,.45)'; ctx.fillRect(x - 66 * s, y - 20 * s, 132 * s, 30 * s);
      miniText(ctx, keyName(keyOf(keys[g])) + '  ' + names[g], x, y, 14 * s, on ? '#FFFFFF' : '#D8D0C0');
    });
    miniText(ctx, keyName(keyOf('skyAim')) + ': aiming line ' + (skyAimOn() ? 'on' : 'off') + '   Esc: pause', W / 2, H - 56 * s, 12 * s, 'rgba(255,246,224,.75)');
  }
}
function skyRender(ctx){
  const W = G.W, H = G.H, s = skyS();
  ctx.save();
  if (Sky.shake > 0){ ctx.translate((Math.random() - 0.5) * 10 * Sky.shake * s, (Math.random() - 0.5) * 10 * Sky.shake * s); }
  skyDrawSea(ctx, W, H);                                                                    /* the sea, and the ships and rocks on it */
  skyDrawAim(ctx);
  skyDrawHeli(ctx);                                                                         /* the helicopter and her */
  skyDrawShots(ctx);                                                                        /* the shots */
  Sky.en.forEach(function(e){ skyDrawEnemy(ctx, e); });                                     /* the drones and gunships */
  skyDrawFx(ctx);                                                                           /* explosions, smoke, splashes */
  Sky.objs.forEach(function(o){ if (o.k === 'fog'){ for (let k = 0; k < 4; k++){ const fx = o.x + Math.cos(o.seed + k * 1.7) * o.r * 1.4 * s, fy = o.y + Math.sin(o.seed + k) * o.r * 0.6 * s, R = o.r * 1.8 * s, gr = ctx.createRadialGradient(fx, fy, 0, fx, fy, R); gr.addColorStop(0, 'rgba(240,236,232,.2)'); gr.addColorStop(1, 'rgba(240,236,232,0)'); ctx.fillStyle = gr; ctx.fillRect(fx - R, fy - R, R * 2, R * 2); } } });      /* low fog, over everything */
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,10,20,.35)'); ctx.fillStyle = v; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.restore();
  skyDrawHud(ctx);                                                                          /* the interface */
}

/* ---- wiring: the loop, the keys, the phone's buttons, the menu actions ---- */
(function(){
  KEY_ACTIONS.push(['skyLeft', 'Air Chase: left door gun'], ['skyNose', 'Air Chase: nose gun'], ['skyRight', 'Air Chase: right door gun'], ['skyAim', 'Air Chase: aiming line on/off']);
  DEFAULT_KEYS.skyLeft = 'KeyJ'; DEFAULT_KEYS.skyNose = 'KeyK'; DEFAULT_KEYS.skyRight = 'KeyL'; DEFAULT_KEYS.skyAim = 'KeyI';
  const st = step, rn = render;
  step = function(dt){ if (Sky.on && G.state === 'sky') skyStep(dt); return st(dt); };
  render = function(){
    if (Sky.on && G.state === 'sky'){ const ctx = CTX; if (!ctx) return; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H); skyRender(ctx); return; }
    return rn.apply(this, arguments);
  };
  window.addEventListener('keydown', function(e){
    if (!(Sky.on && G.state === 'sky')) return;
    if (e.code === 'Escape'){ e.preventDefault(); e.stopPropagation(); if (Sky.hold === 'pause') skyResume(); else if (!Sky.hold) skyPause(); }
  }, true);
  const btnAt = function(x, y){ const b = skyButtons(); for (let i = 0; i < b.length; i++) if (Math.hypot(x - b[i].x, y - b[i].y) < b[i].r * 1.15) return b[i].id; return ''; };
  window.addEventListener('pointerdown', function(e){
    if (!(Sky.on && G.state === 'sky') || Sky.hold || !CTX) return;
    const rc = CTX.canvas.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top, id = Input.hasTouch || e.pointerType === 'touch' ? btnAt(x, y) : (btnAt(x, y) === 'pause' ? 'pause' : '');
    Sky.ptrBtn = !!id;
    if (!id) return;
    e.preventDefault(); e.stopPropagation();
    if (id === 'aim') skyToggleAim(); else if (id === 'pause') skyPause(); else skyGoGun(id);
  }, true);
  window.addEventListener('pointerup', function(){ Sky.ptrBtn = false; }, true);
  const ha = handleAction;
  handleAction = function(a){
    if (typeof a === 'string'){
      if (a.indexOf('sky-perk-') === 0){ skyTakePerk(a.slice(9)); return; }
      if (a === 'sky-resume'){ skyResume(); return; }
      if (a === 'sky-quit'){ SFX.click(); skyQuit(); return; }
      if (a === 'sky-retry'){ SFX.click(); skyRetry(); return; }
      if (a === 'sky-done'){ SFX.click(); hideOverlay(); showMenu(); return; }
      if (a === 'play' + SKY_CHAPTER){ SFX.click(); tryFullscreen(); startCutscene(function(){ skyStart(1); }, false, 'skyin'); return; }
    }
    return ha.apply(this, arguments);
  };
  /* anything else that starts a run in this chapter (the phone, a saved run) starts the chase instead */
  const sr = startRun;
  startRun = function(ch, wave){ if ((ch === SKY_CHAPTER && !wave) || (wave && wave >= SKY_FIRST_WAVE)){ startCutscene(function(){ skyStart(1); }, false, 'skyin'); return; } return sr.apply(this, arguments); };
  /* the music: the war films' tune, the whole band in for the two bosses */
  if (typeof Music !== 'undefined' && Music.refresh){
    const mr = Music.refresh;
    Music.refresh = function(){
      const r = mr.apply(this, arguments);
      if (G.state === 'sky' && Sky.on && this.want){
        const boss = skyBossOf().length > 0;
        this.want.theme = 'filmwar'; this.want.lvl = Sky.hold ? 0 : boss ? 3 : Sky.wave >= 6 ? 2 : 1; this.want.shift = boss ? 0 : [0, 2, 3, 5, 7][Math.floor((Sky.wave - 1) / 2)] || 0;
      }
      return r;
    };
  }
})();
