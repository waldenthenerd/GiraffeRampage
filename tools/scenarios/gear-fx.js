/* Gear effects (plan Task 10): each of the eight, through the real hooks. Run: node tools/qa-cloud.mjs tools/scenarios/gear-fx.js --wait 40000 [--shot x.png --params "show=wake"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function wear(ids){ Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gear = Save.data.gear || {}; ids.forEach(function(id){ grantGear(id); Save.data.equipped[GEAR_INDEX[id].slot] = id; }); recalcStats(); }
function foe(dx, dy){ var e = spawnEnemy('hyena', P.x + dx, P.y + dy, G.wave); e.stunT = 99; e.hp = e.maxHp = 5000; return e; }
function clear(){ G.enemies.length = 0; G.shocks.length = 0; }
function steps(n){ for (var i = 0; i < n; i++){ GR.step(1 / 60); P.invuln = 0; } }
try {
  Save.data.gearLv = {}; Save.data.gems = 0;
  GR.startRun(1); G.introFX = null; for (var i = 0; i < 30; i++){ GR.step(1 / 60); } P.hp = P.maxHp; P.invuln = 0; gfxReset();
  out.state = G.state;
  /* 1. thorns: exactly 10 to a near enemy, nothing to a far one, nothing when not worn, and not when the hit is absorbed (no hp lost) */
  wear(['thornweave:armor']); clear(); var near = foe(40, 0), far = foe(200, 0), n0 = near.hp, f0 = far.hp;
  P.invuln = 0; hurtPlayer(10, near.x, near.y); out.thorns = n0 - near.hp === 10 && far.hp === f0;
  wear([]); clear(); near = foe(40, 0); n0 = near.hp; P.invuln = 0; hurtPlayer(10, near.x, near.y); out.thornsOff = near.hp === n0;
  /* 11. dead: nothing fires */
  wear(['thornweave:armor']); clear(); near = foe(40, 0); n0 = near.hp; P.dead = true; hurtPlayer(10, near.x, near.y); P.dead = false; out.deadQuiet = near.hp === n0;
  /* 3. sun ward: first hit soaked, second not, ready again after 12s */
  wear(['sunforged:armor']); P.hp = P.maxHp; P.invuln = 0; gfxReset(); var hp0 = P.hp; hurtPlayer(15, P.x + 30, P.y); out.wardSoaked = P.hp === hp0 && GearFx.ward.ready === false;
  P.invuln = 0; hurtPlayer(15, P.x + 30, P.y); out.wardSpent = P.hp < hp0;
  GearFx.ward.cd = 0.05; steps(10); out.wardBack = GearFx.ward.ready === true;
  P.invuln = 0; P.hp = P.maxHp; hp0 = P.hp; GearFx.ward.ready = true; hurtPlayer(60, P.x + 30, P.y); out.wardPartial = P.hp < hp0 && hp0 - P.hp < 60;
  /* 3b. the ward works after the per-hit cap: a 200 hit is capped to 41 (34% of 120), the ward soaks 20 of that */
  wear(['sunforged:armor']); gfxReset(); P.maxHp = 120; P.hp = 120; P.stats.dr = 0; P.invuln = 0; hurtPlayer(200, P.x + 30, P.y); out.wardCapped = P.hp === 120 - 21;
  gfxReset(); P.hp = 120; P.invuln = 0; P.hurtT = 0; var tk0 = G.runTaken || 0; hurtPlayer(15, P.x + 30, P.y); out.wardFullNoHurt = P.hp === 120 && (G.runTaken || 0) === tk0 && P.hurtT === 0;
  /* 4. aurora: still for 2s, then +10% xp */
  wear(['aurora:cape']); P.invuln = 99; gfxReset(); clear(); P.vx = 0; P.vy = 0; var xp0 = P.stats.xpMul; steps(135); out.aurora = GearFx.auroraT > 0 && Math.abs(P.stats.xpMul - xp0 - 0.10) < 0.005;
  GearFx.auroraT = 0.02; steps(5); out.auroraEnds = GearFx.auroraT === 0 && Math.abs(P.stats.xpMul - xp0) < 0.005;
  /* 5. star crack: the 5th kick, not the 4th */
  wear(['starborn:weapon']); P.invuln = 99; gfxReset(); clear(); var shock = [];
  for (var k = 1; k <= 5; k++){ P.kickCd = 0; doKick(); shock.push(G.shocks.filter(function(x){ return x.src === 'gear'; }).length); }
  out.starCrack = shock[3] === 0 && shock[4] === 1;
  /* 6. undertow: in water, a hit pulls a foe about 40 closer; on dry land nothing */
  wear(['riptide:armor']); clear(); var bio = G.biome; G.biome = 'ocean'; var w = foe(120, 0), d0 = Math.hypot(w.x - P.x, w.y - P.y); P.invuln = 0; P.hp = P.maxHp; hurtPlayer(10, w.x, w.y);
  var d1 = Math.hypot(w.x - P.x, w.y - P.y); out.undertow = Math.abs((d0 - d1) - 40) < 1.5; G.biome = bio;
  clear(); w = foe(120, 0); d0 = Math.hypot(w.x - P.x, w.y - P.y); P.invuln = 0; hurtPlayer(10, w.x, w.y); out.undertowDry = Math.abs(Math.hypot(w.x - P.x, w.y - P.y) - d0) < 0.5;
  /* 7. cold snap: a ring of slow 0.09s after the kick */
  wear(['frostbite:weapon']); P.invuln = 99; gfxReset(); clear(); var fz = foe(60, 0), fz2 = foe(200, 0); P.kickCd = 0; doKick(); steps(10);
  out.frost = fz.slowT > 0 && fz.slowMul <= 0.7 && !(fz2.slowT > 0 && fz2.slowMul <= 0.7);
  /* 2. dust cloak: a trail while moving, and a foe standing in it is slowed */
  wear(['stoneplate:cape']); P.invuln = 99; gfxReset(); clear();
  for (var s = 0; s < 14; s++){ P.vx = 200; GR.step(1 / 60); P.invuln = 99; }
  out.trail = GearFx.trail.length > 0;
  var tp = GearFx.trail[0]; clear(); var dd = foe(0, 0); dd.x = tp.x; dd.y = tp.y; P.vx = 0; P.vy = 0; steps(8); out.dust = dd.slowT > 0 && dd.slowMul < 1;
  /* 8. tidal wake: damage to a foe in the wake */
  wear(['leviathan:cape']); P.invuln = 99; gfxReset(); clear();
  for (s = 0; s < 14; s++){ P.vx = 200; GR.step(1 / 60); P.invuln = 99; }
  out.wakePts = GearFx.wake.length > 0; var wp = GearFx.wake[0]; clear(); var wf = foe(0, 0); wf.x = wp.x; wf.y = wp.y; var wh = wf.hp; P.vx = 0; P.vy = 0; steps(40); out.wake = wf.hp < wh;
  /* 10. two at once: thorns + wake both fire */
  wear(['thornweave:armor', 'leviathan:cape']); P.invuln = 99; gfxReset(); clear();
  for (s = 0; s < 14; s++){ P.vx = 200; GR.step(1 / 60); P.invuln = 99; }
  var wp2 = GearFx.wake[0]; clear(); var a = foe(30, 0), b = foe(0, 0); b.x = wp2.x; b.y = wp2.y - 0; b.stunT = 99; var ah = a.hp, bh = b.hp; P.vx = 0; P.vy = 0; P.invuln = 0; P.hp = P.maxHp; hurtPlayer(10, a.x, a.y); steps(40);
  out.both = a.hp < ah && b.hp < bh;
  /* levels: thorns at level 5 hits for 14 */
  Save.data.gearLv['thornweave:armor'] = 4; wear(['thornweave:armor']); clear(); near = foe(40, 0); n0 = near.hp; P.invuln = 0; P.hp = P.maxHp; hurtPlayer(10, near.x, near.y); out.thornsLv5 = n0 - near.hp === 14;
  out.catalog = Object.keys(GEAR_FX).length === 8 && Object.keys(GEAR_FX).every(function(id){ return !!GEAR_INDEX[id] && GEAR_FX[id].name && GEAR_FX[id].desc; });
  /* a shot of the visible ones */
  if (QA.params.show){ P.invuln = 99; clear(); var who = { wake: ['leviathan:cape'], dust: ['stoneplate:cape'], frost: ['frostbite:weapon'], star: ['starborn:weapon'], ward: ['sunforged:armor'] }[QA.params.show]; wear(who); gfxReset();
    var f1 = foe(80, 10), f2 = foe(-70, 30), f3 = foe(30, -70);
    if (QA.params.show === 'wake' || QA.params.show === 'dust'){ for (s = 0; s < 40; s++){ P.vx = 190; P.x = Math.min(ARENA_W - 100, P.x + 0); GR.step(1 / 60); P.invuln = 99; } }
    if (QA.params.show === 'frost'){ P.kickCd = 0; doKick(); steps(6); }
    if (QA.params.show === 'star'){ for (k = 0; k < 5; k++){ P.kickCd = 0; doKick(); if (k < 4) steps(1); } steps(5); }
    if (QA.params.show === 'ward'){ P.invuln = 0; hurtPlayer(10, P.x + 40, P.y); steps(4); P.invuln = 99; } }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var keys = ['thorns', 'thornsOff', 'deadQuiet', 'wardSoaked', 'wardSpent', 'wardBack', 'wardPartial', 'wardCapped', 'wardFullNoHurt', 'aurora', 'auroraEnds', 'starCrack', 'undertow', 'undertowDry', 'frost', 'trail', 'dust', 'wakePts', 'wake', 'both', 'thornsLv5', 'catalog'];
out.failed = keys.filter(function(k){ return !out[k]; });
out.pass = !out.failed.length && !out.errs.length;
QA.done(out);
