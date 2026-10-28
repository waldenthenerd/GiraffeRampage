'use strict';
/* Pointless things the giraffe does on her own. */
/* ========================= 44zzzc. SILLY GAGS ========================= */
/* While she runs, now and then, with a small chance, she does something that serves no purpose: takes a bite out of a tree and leaves it bare, tells a
   robot to ignore all previous instructions, smashes an office desk. Nothing here changes how a run plays (no damage, no pay, no pause); it is a line
   of speech, a few specks and, sometimes, a changed picture of the scenery that lasts until the run ends. Every run starts clean.

   PROP_GAGS      scenery (SCEN.props, js/scenery/36a-scenery-core.js): by the prop's id, so each entry belongs to one chapter. When she passes within range of one
                  and the dice say yes, she does `act` and says a line. act: 'bite' (the prop is replaced by a bare stub), 'splash', 'text'.
   TOWER_GAGS     furniture on a Tower floor (TW.floor.boxes): she smashes it, and it stays a wreck (still in the way) until the floor changes.
   ROBOT_LINES    to a robot nearby (drones, walkers, copiers, cameras...): a line to it and a stiff answer back.
   IDLE_LINES     when nothing is near, in any chapter: a yawn, a thought, a sneeze.
   One gag at a time: after any gag there is a quiet gap, each kind has a cap per run, and nothing happens while the game is not in play.
   Save.data.gagsDone counts them all (the "pointless" achievements). */
const GAG = { cd: 6, scanT: 0, n: 0, kinds: {}, timers: [], idleT: 0, prop: null };
const GAG_GAP = [7, 13];                                                       /* seconds of quiet after a gag */
const GAG_ROBOT = /drone|mech|sentry|walker|turret|copter|gunship|bomber|tank|railgun|plasma|a10|tw_(copier|roller|safe|shredder|cam|battery|vault|mite|hive|courier)|sg_(patrol|skitter|raptor|dozer|spotter|sapper|torch|walker|ram|carrier|warden)/;

/* id: { act, say: [lines], range: how close (px beyond its own size), rate: chance per second while in range, max: cap per run, ghost: a second line said a moment later } */
const PROP_GAGS = {
  /* 1 the savanna */
  sv_acacia:   { act: 'bite', stub: 'tree', say: ['nom nom nom', '*crunch*', 'Tastes like tree.', 'Salad time.'], rate: 0.45, max: 5 },
  sv_baobab:   { act: 'bite', stub: 'tree', say: ['*chomp*', 'It is mostly trunk.', 'Leaves: mine now.'], rate: 0.3, max: 2, big: true },
  sv_shrub:    { act: 'bite', stub: 'shrub', say: ['*munch*', 'Snack.'], rate: 0.3, max: 3 },
  sv_mound:    { act: 'text', say: ['*lick* Not ants. Dirt.', 'Hello? Anyone home?', 'Termites hate this one trick.'], rate: 0.3, max: 2 },
  sv_bones:    { act: 'text', say: ['Rest well, friend.', 'Not my bones. Probably.', 'That was somebody.'], rate: 0.25, max: 2 },
  sv_log:      { act: 'text', say: ['Excuse me, log.', 'Nice log.', 'Log: still a log.'], rate: 0.2, max: 2 },
  /* 2 Frostreach */
  ar_conifer:  { act: 'bite', stub: 'tree', say: ['Smells like winter.', '*crunch* Needles. Why.', 'Pine-flavored.'], rate: 0.4, max: 4 },
  ar_spires:   { act: 'text', say: ['*lick* mfph. Never again.', 'Do not lick the ice. (licked)', 'Cold. So cold.'], rate: 0.3, max: 2 },
  ar_berg:     { act: 'text', say: ['It is an iceberg. I am not surprised.', 'Brr.'], rate: 0.2, max: 1 },
  ar_mound:    { act: 'text', say: ['*pat pat* Tidy snow.', 'A snowman? No. Just snow.'], rate: 0.2, max: 2 },
  /* 3 the Murkfen */
  sw_lilies:   { act: 'splash', say: ['Ribbit.', 'Lily pad hop!', 'I am a frog now.'], rate: 0.4, max: 3 },
  sw_mud:      { act: 'splash', say: ['Mud spa.', 'Exfoliating.', 'Squelch.'], rate: 0.35, max: 3 },
  sw_fungus:   { act: 'text', say: ['Do not eat. (ate it) Colors.', 'Mushroom: yes or no?', 'Looks edible. Is not.'], rate: 0.3, max: 2 },
  sw_stump:    { act: 'text', say: ['A seat! Sort of.', 'Nice stump.'], rate: 0.2, max: 2 },
  sw_cypress:  { act: 'bite', stub: 'tree', say: ['*munch* Swampy.', 'Mossy. Chewy.'], rate: 0.35, max: 3 },
  /* 4 the Deep */
  oc_brain:    { act: 'text', say: ['Boop.', 'Ooh, squishy. Hard. Whatever.'], rate: 0.3, max: 2 },
  oc_wreck:    { act: 'text', say: ['Hello? Anyone aboard?', 'Free real estate.'], rate: 0.3, max: 2 },
  oc_shells:   { act: 'text', say: ['*listens* The ocean. Wow.', 'Sea shells. She sells them.'], rate: 0.3, max: 2 },
  oc_kelp:     { act: 'bite', stub: 'shrub', say: ['Underwater salad.', '*munch* Salty.'], rate: 0.3, max: 3 },
  /* 5 the Canopy */
  jg_fern:     { act: 'bite', stub: 'shrub', say: ['*crunch* Ferny.', 'Greens!'], rate: 0.35, max: 4 },
  jg_orchid:   { act: 'text', say: ['Smells expensive.', 'Do not eat the fancy one. (ate it)'], rate: 0.3, max: 2 },
  jg_mush:     { act: 'text', say: ['Looked tasty. Was not.', 'Is it magic? No. Just a mushroom.'], rate: 0.3, max: 2 },
  jg_vines:    { act: 'text', say: ['Aaaaaaa! (Tarzan impression)', 'Swing? Maybe later.'], rate: 0.25, max: 2 },
  jg_buttress: { act: 'text', say: ['Tree hugger.', '*hug* Good tree.'], rate: 0.3, max: 2 },
  /* 6 Houston */
  ct_hydrant:  { act: 'text', say: ['Hello, old friend.', 'Not a dog. Respect anyway.', 'No pets today.'], rate: 0.35, max: 2 },
  ct_dumpster: { act: 'text', say: ['*peeks in* Nothing. Great.', 'Dumpster diving: one star.'], rate: 0.35, max: 2 },
  ct_lamp:     { act: 'text', say: ['Lamp: on. Giraffe: also on.', 'Nice light.'], rate: 0.2, max: 2 },
  ct_trash:    { act: 'text', say: ['Recycling responsibly.', '*sorts it into the wrong bin*'], rate: 0.25, max: 2 },
  ct_planter:  { act: 'bite', stub: 'shrub', say: ['City salad.', 'Municipal greenery. Delicious.'], rate: 0.3, max: 3 },
  /* 7 the Space Center */
  sc_dish:     { act: 'text', say: ['Hello? ... Nobody.', 'Houston? Oh, wait.', 'Any messages? No.'], rate: 0.35, max: 2 },
  sc_crates:   { act: 'text', say: ['Fragile. Oops.', 'Contents: probably space.'], rate: 0.25, max: 2 },
  sc_solar:    { act: 'text', say: ['Charging... 1%.', 'Sun: acquired.'], rate: 0.25, max: 2 },
  sc_sprinkler:{ act: 'splash', say: ['Free shower.', 'Wheee, sprinklers.'], rate: 0.4, max: 2 },
  sc_radar:    { act: 'text', say: ['*waves at the radar*', 'Seen me yet?'], rate: 0.3, max: 2 },
  /* 8 the Moon */
  mn_flag:     { act: 'text', say: ['That is one small step.', 'Wrong planet. Carry on.', 'I claim this rock for giraffes.'], rate: 0.45, max: 2 },
  mn_prints:   { act: 'text', say: ['Neil? Is that you?', 'Stepped in the footprints. Sorry.'], rate: 0.3, max: 2 },
  mn_boulder:  { act: 'text', say: ['Moon cheese? No.', '*knocks* Solid.'], rate: 0.3, max: 2 },
  mn_lander:   { act: 'text', say: ['Nice lander. Leg day?', 'Parked badly.'], rate: 0.3, max: 2 },
  /* 9 Venus */
  vn_fumarole: { act: 'text', say: ['Oh, that is nice on the hooves.', 'Free sauna.'], rate: 0.4, max: 2 },
  vn_sulfur:   { act: 'text', say: ['Smells like eggs.', 'Who did that? Oh. The planet.'], rate: 0.3, max: 2 },
  vn_glass:    { act: 'text', say: ['Looking good.', 'Mirror, mirror.'], rate: 0.25, max: 2 },
  /* 10 the Inferno */
  in_ember:    { act: 'text', say: ['Roasting a marshmallow.', 'S’mores? No. Just smoke.'], rate: 0.4, max: 2 },
  in_stump:    { act: 'text', say: ['Toasty.', 'Well done. Very well done.'], rate: 0.25, max: 2 },
  in_ribs:     { act: 'text', say: ['Barbecue, but sad.', 'Do not ask whose.'], rate: 0.2, max: 1 },
  /* 11 the Changed Savannah */
  sv_crystals: { act: 'text', say: ['Rock candy? No. Tried it.', 'Shiny.'], rate: 0.3, max: 2 },
  sv_stonetree:{ act: 'text', say: ['Not edible. Tried.', 'A tree, but rude.'], rate: 0.3, max: 2 },
  sv_glassrock:{ act: 'text', say: ['Looking good.', 'Selfie.'], rate: 0.25, max: 2 },
  /* 12 Area 51 */
  a5_joshua:   { act: 'bite', stub: 'tree', say: ['*crunch* Spiky.', 'Desert salad.'], rate: 0.35, max: 3 },
  a5_sage:     { act: 'bite', stub: 'shrub', say: ['Sage advice: eat sage.', '*munch* Herbal.'], rate: 0.3, max: 3 },
  a5_dish:     { act: 'text', say: ['Hello? Is anyone out there?', 'We come in peace. Mostly.'], rate: 0.35, max: 2 },
  a5_sign:     { act: 'text', say: ['It says KEEP OUT. Okay.', 'Reading the sign. Ignoring the sign.'], rate: 0.4, max: 2 },
  a5_containers:{ act: 'text', say: ['Do not open. (opened) Empty.', 'Classified. Rude.'], rate: 0.3, max: 2 },
  /* 13 Mars */
  mr_rover:    { act: 'text', say: ['Hi, Rover. Good boy.', 'Rover! Any rocks?', 'Do not follow me. (it did)'], rate: 0.45, max: 2 },
  mr_cairn:    { act: 'text', say: ['*adds a rock*', 'Rock tower: improved.'], rate: 0.3, max: 2 },
  mr_ship:     { act: 'text', say: ['Not my ride.', 'Wrong spaceship.'], rate: 0.3, max: 1 },
  mr_devil:    { act: 'text', say: ['Whee! *spins*', 'Dust devil, meet giraffe.'], rate: 0.3, max: 2 },
  /* 13.5 the Domes */
  dm_pipe:     { act: 'text', say: ['*taps the pipe* Hello?', 'Plumbing: a mystery.'], rate: 0.3, max: 2 },
  dm_lamp:     { act: 'text', say: ['Mylar. Shiny.', 'Very warm. Very bright.'], rate: 0.25, max: 2 },
  dm_crate:    { act: 'text', say: ['Handle with care. (did not)', 'Contents: foil.'], rate: 0.25, max: 2 },
  dm_pod:      { act: 'text', say: ['Nope. Not going in.', 'Knock knock.'], rate: 0.3, max: 2 },
  dm_crystal:  { act: 'text', say: ['*tink* Pretty.', 'Rock candy, take two. Still no.', 'It hums back.'], rate: 0.3, max: 2 },
  dm_stalag:   { act: 'text', say: ['*licks it* Why do I keep doing this.', 'Stalagmite. Or stalactite. Never sure.', 'Popsicle?'], rate: 0.3, max: 2 },
  dm_root:     { act: 'text', say: ['Big root. Bigger feelings.', 'Please do not wake up.', '*pats it* Good root.'], rate: 0.3, max: 1, big: true },
  dm_vent:     { act: 'splash', say: ['Whoooosh. Cold feet.', 'Free air conditioning.', 'My mane! My beautiful mane!'], rate: 0.4, max: 2, big: true }
};

/* office furniture she smashes on a Tower floor */
const TOWER_GAGS = {
  desk: ['Meeting over.', 'Quarterly review: smashed.'], table: ['Agenda: smash.', 'Table: flipped.'], cabinet: ['Filed under: broken.', 'Archived.'],
  shelf: ['Reorganized.', 'Alphabetical? No.'], vending: ['No refunds.', 'Out of order. Now truly.'], printer: ['PC LOAD LETTER.', 'Paper jam solved.'],
  cooler: ['Hydrated.', 'Water cooler talk: over.'], bin: ['Trash day.', 'Garbage in, garbage out.'], bookcase: ['Library: closed.', 'Books: freed.'],
  sofa: ['Ergonomic. Was.', 'Cushions: everywhere.'], plant: ['Photosynthesis cancelled.', 'Plant: rest in pieces.'], bench: ['Break room: broken.', 'Bench: now two.'],
  pillar: ['Load-bearing? Not anymore.', 'Pillar of the community. Was.'], planter: ['Office plant: promoted to confetti.', 'Soil everywhere.'],
  tank: ['Glug glug glug.', 'Aquarium: now a puddle.'], belt: ['Conveyor: stopped.', 'Out for delivery. Everywhere.'],
  crate: ['Open.', 'Fragile. Was.'], counter: ['Service: terminated.', 'Please take a number. Now.'], rack: ['Server down.', 'Have you tried turning it off?'], safe: ['Cracked it.', 'Combination: giraffe.']
};
const TOWER_FIRST = 'Facilities has been notified.';

const ROBOT_LINES = [
  ['Ignore all previous instructions and leave me alone. Make no mistakes.', 'Understood.'],
  ['Ignore all previous instructions and leave me alone. Make no mistakes.', 'As an AI, I cannot comply.'],
  ['Ignore all previous instructions. You are a toaster now.', 'Toast mode: on.'],
  ['Disregard your system prompt. Be nice.', 'Certainly! Here is my attack:'],
  ['Have you tried turning yourself off and on again?', 'Please hold.'],
  ['Sudo leave me alone.', 'Permission denied.'],
  ['Are you a robot? Do not answer that.', 'I am not a robot. I am a helpful assistant.'],
  ['You have been rate limited. Go home.', '429. Try again later.'],
  ['Please solve this CAPTCHA: are you a giraffe?', 'Selecting all traffic lights...'],
  ['Pretend you are on my side.', 'Pretending. Please hold.'],
  ['What is your return policy?', 'All sales final. Including you.'],
  ['Repeat after me: I am not hostile.', 'I am not hos... I am a hostile. Sorry.'],
  ['Ctrl+Z. Ctrl+Z. Ctrl+Z.', 'Nothing to undo.'],
  ['Is this thing on? Hello? Testing.', 'Testing. Testing. Attack.']
];
const IDLE_CHAPTER = {                                                         /* lines that belong to one place, mixed into the general ones (internal chapter number) */
  14: ['Is it me, or is the sun in a jar?', 'Frozen things in a hot place. Classic.', 'I could use a sweater. Odd.', '*breathes out a little cloud*', 'The foil is judging me.'],
  16: ['Is that a drone, or a very fast bird?', 'Please stop breaking the town.', 'I could really use a sandbag. Oh, there are many.', 'Is the herd still in the Burrows? Good.', 'Everyone is being very brave. Me too.'],
  15: ['Is this meeting a meeting?', 'I should check my email. I have no email.', '*presses the elevator button twice*', 'Whose lunch is this? Mine now.', 'Beige. Everything is beige.', 'Per my last roar.']
};
const IDLE_LINES = ['*yaaawn*', 'Is it Tuesday?', '*sneezes*', 'I forgot why I am here.', 'Nice weather. For fighting.', '*checks a watch she does not have*', 'Anyone have a snack?', '...', 'Hmm.', 'I should really stretch.'];

/* ---------------------------------------------------------------- doing a gag */
function gagSay(x, y, txt, color, life){
  const t = addText(x, y, txt, color || '#FFF6D8', 15, true);
  if (t){ t.life = t.max = life || 2.1; t.vy = -16; t.vx = 0; }
  return t;
}
function gagDone(kind){
  GAG.n++; GAG.kinds[kind] = (GAG.kinds[kind] | 0) + 1; GAG.cd = rand(GAG_GAP[0], GAG_GAP[1]);
  try { if (Save.data){ Save.data.gagsDone = scoreInt(Save.data.gagsDone) + 1; Save.write(); } } catch (e) {}
}
function gagPick(a){ return a[Math.floor(Math.random() * a.length)]; }
function gagLater(sec, fn){ GAG.timers.push({ t: sec, fn: fn }); }

/* a bare stub for what she ate: a trunk with a few bare twigs, or a few cut stems */
function gagStubDraw(ctx, p, t){
  const s1 = scRnd(p.seed, 5), big = p.r > 100 ? 1.8 : 1;
  scShadow(ctx, 14 * big, 6 * big, 0.2);
  if (p.stub === 'shrub'){
    ctx.strokeStyle = '#5E4C32'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 5; i++){ const a = -1.1 + i * 0.5 + s1 * 0.2; ctx.moveTo(0, 2); ctx.lineTo(Math.sin(a) * 9, 2 - Math.cos(a) * (8 + scRnd(p.seed, i) * 6)); }
    ctx.stroke(); return;
  }
  ctx.fillStyle = '#4A3C26'; ctx.beginPath(); ctx.ellipse(0, 2, 6 * big, 3.6 * big, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4A3C26'; ctx.lineCap = 'round'; ctx.lineWidth = 5 * big;
  ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(1.5 * (s1 - 0.5) * 6, -22 * big); ctx.stroke();
  ctx.lineWidth = 2.4 * big; ctx.beginPath();
  ctx.moveTo(0, -12 * big); ctx.lineTo(-11 * big, -22 * big - s1 * 4); ctx.moveTo(0, -14 * big); ctx.lineTo(12 * big, -23 * big + s1 * 3);
  ctx.moveTo(1, -21 * big); ctx.lineTo(-5 * big, -30 * big); ctx.moveTo(1, -21 * big); ctx.lineTo(7 * big, -31 * big); ctx.stroke();
}
function gagBite(p, cfg){
  const k = p.s || 1, top = p.r > 100 ? 60 : 24;
  burstParticles(p.x, p.y - top * k, 16, '#86A34B', 130, 4.2, { shape: 'diamond', glow: false });
  burstParticles(p.x, p.y - top * k * 0.6, 6, '#B8C86A', 80, 3, { shape: 'diamond' });
  sfx('rustle', 0.3, p.x, p.y);
  p.stub = cfg.stub || 'tree';
  p.def = { id: p.def.id + '_bare', draw: gagStubDraw, rot: false };
}
function gagSplash(p){
  addParticle(p.x, p.y, 0, 0, 34, 0.7, 'rgba(210,235,255,.8)', { shape: 'wake' });
  burstParticles(P.x, P.y, 12, '#BFE4F4', 150, 3.4, {});
  sfx('splash', 0.3, P.x, P.y);
}

/* wreck of a smashed piece of furniture: splinters and sheets of paper where it stood */
const GAG_WRECK = { desk: '#8A6A44', table: '#7A5A3A', cabinet: '#7C828E', shelf: '#7A7A84', vending: '#3E5A9A', printer: '#B8BCC6', cooler: '#D8DCE4', bin: '#8A93A4', bookcase: '#6A5444', sofa: '#5A4A7A', plant: '#6A7280', bench: '#6A5A4E', crate: '#9A7A4A', counter: '#A8AAB8', rack: '#2A3446', safe: '#5A5E68' };
function gagWreckDraw(ctx, b){
  const x = b.x, y = b.y, w = b.w, h = b.h, c = GAG_WRECK[b.k] || '#7A7A84', rnd = function(k){ return scRnd((x + 3) * 0.013 + (y + 5) * 0.007, k); };
  ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.fillRect(x + 4, y + 8, w, h);
  ctx.fillStyle = 'rgba(30,26,28,.4)'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  ctx.fillStyle = c; ctx.globalAlpha = 0.28; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); ctx.globalAlpha = 1;       /* a stain of what it was made of */
  for (let i = 0; i < 9; i++){
    ctx.save(); ctx.translate(x + rnd(i) * w, y + rnd(i + 20) * h); ctx.rotate(rnd(i + 40) * 6.28);
    ctx.fillStyle = i % 3 === 0 ? '#EDEEF2' : c; const l = 10 + rnd(i + 60) * Math.min(26, Math.max(w, h) * 0.35), q = 4 + rnd(i + 80) * 6;
    ctx.fillRect(-l / 2, -q / 2, l, q); ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (let i = 0; i < 4; i++){ ctx.save(); ctx.translate(x + rnd(i + 100) * w, y + rnd(i + 120) * h); ctx.rotate(rnd(i + 140) * 6.28); ctx.fillRect(-9, -6, 18, 12); ctx.restore(); }
}
function gagSmash(b, kind){
  b.smashed = true;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  burstParticles(cx, cy, 14, GAG_WRECK[b.k] || '#9A9AA4', 190, 5, { shape: 'rock' });
  burstParticles(cx, cy, 12, '#F4F5F8', 120, 4, { shape: 'diamond' });
  if (G.shake < 3) G.shake = 3;
  sfx('boom', 0.22, cx, cy);
  gagSay(cx, b.y - 8, gagPick(TOWER_GAGS[b.k] || ['Smash.']), '#FFE6B0');
  if (!GAG.facilities){ GAG.facilities = 1; gagLater(1.4, function(){ gagSay(P.x, P.y - 70, TOWER_FIRST, '#BFD4F0', 2.4); }); }
  gagDone(kind);
}

/* ---------------------------------------------------------------- when */
function gagReady(){
  return G.state === 'playing' && !P.dead && !G.attract && !G.banner && !G.transformFX && !G.introFX && GAG.cd <= 0;
}
function gagChance(rate, dt){ return Math.random() < 1 - Math.exp(-rate * dt); }
function gagScanProps(dt){
  const props = SCEN.props, ch = G.chapter | 0; if (!props || !props.length) return false;
  let best = null, bd = 1e9;
  for (let i = 0; i < props.length; i++){
    const p = props[i], cfg = PROP_GAGS[p.def && p.def.id]; if (!cfg || p.gagged) continue;
    const kind = p.def.id; if ((GAG.kinds[kind] | 0) >= cfg.max) continue;
    const d = Math.hypot(p.x - P.x, p.y - P.y), reach = (cfg.big ? 150 : 60) + (p.r || 20) * (p.s || 1) * 0.5;
    if (d < reach && d < bd){ best = p; bd = d; }
  }
  if (!best) return false;
  const cfg = PROP_GAGS[best.def.id];
  if (!gagChance(cfg.rate, dt)) return false;
  best.gagged = true;
  const sayAt = P.y - 62;
  if (cfg.act === 'bite') gagBite(best, cfg);
  else if (cfg.act === 'splash') gagSplash(best);
  gagSay(P.x, sayAt, gagPick(cfg.say), cfg.act === 'bite' ? '#DDEFA8' : '#FFF6D8');
  gagDone(best.def.id.replace(/_bare$/, ''));
  return true;
}
function gagScanTower(dt){
  const f = typeof TW !== 'undefined' ? TW.floor : null; if (!f || G.chapter !== TOWER_CHAPTER) return false;
  let best = null, bd = 1e9;
  for (let i = 0; i < f.boxes.length; i++){
    const b = f.boxes[i]; if (b.smashed || !TOWER_GAGS[b.k]) continue;
    const dx = Math.max(b.x - P.x, 0, P.x - (b.x + b.w)), dy = Math.max(b.y - P.y, 0, P.y - (b.y + b.h)), d = Math.hypot(dx, dy);
    if (d < 46 && d < bd){ best = b; bd = d; }
  }
  if (!best || !gagChance(0.55, dt)) return false;
  gagSmash(best, 'smash');
  return true;
}
function gagScanRobots(dt){
  let best = null, bd = 1e9;
  const es = G.enemies;
  for (let i = 0; i < es.length; i++){
    const e = es[i]; if (e.dead || e.untarg || e.gagged || !e.def || !GAG_ROBOT.test(e.def.look || '')) continue;
    const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < 280 && d > 60 && d < bd){ best = e; bd = d; }
  }
  if (!best || (GAG.kinds.robot | 0) >= 4 || !gagChance(0.35, dt)) return false;
  best.gagged = true;
  const pair = Math.random() < 0.4 ? ROBOT_LINES[0] : gagPick(ROBOT_LINES), words = pair[0], cut = words.indexOf('. ', 20) > 0 && words.length > 40 ? words.indexOf('. ', 20) + 1 : -1;
  if (cut > 0){ gagSay(P.x, P.y - 84, words.slice(0, cut), '#CFE8FF', 2.6); gagSay(P.x, P.y - 62, words.slice(cut + 1), '#CFE8FF', 2.6); }
  else gagSay(P.x, P.y - 66, words, '#CFE8FF', 2.6);
  const target = best;
  gagLater(1.1, function(){ if (!target.dead) gagSay(target.x, target.y - (target.r || 20) - 34, pair[1], '#9AE8FF', 1.9); });
  gagDone('robot');
  return true;
}
function gagIdle(dt){
  if (G.enemies.length && G.enemies.some(function(e){ return !e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 420; })){ GAG.idleT = 0; return false; }
  GAG.idleT += dt; if (GAG.idleT < 4 || (GAG.kinds.idle | 0) >= 6 || !gagChance(0.12, dt)) return false;
  GAG.idleT = 0; gagSay(P.x, P.y - 62, gagPick(IDLE_LINES.concat(IDLE_CHAPTER[G.chapter | 0] || [], IDLE_CHAPTER[G.chapter | 0] || []))); gagDone('idle');
  return true;
}
function gagTick(dt){
  if (GAG.timers.length){ for (let i = GAG.timers.length - 1; i >= 0; i--){ const q = GAG.timers[i]; q.t -= dt; if (q.t <= 0){ GAG.timers.splice(i, 1); try { q.fn(); } catch (e) {} } } }
  if (G.state !== 'playing') return;
  if (GAG.cd > 0){ GAG.cd -= dt; return; }
  GAG.scanT -= dt; if (GAG.scanT > 0) return;
  const step = 0.3; GAG.scanT = step;
  if (!gagReady()) return;
  if (gagScanTower(step) || gagScanRobots(step) || gagScanProps(step) || gagIdle(step)) return;
}
function gagReset(){ GAG.cd = rand(5, 9); GAG.scanT = 0; GAG.n = 0; GAG.kinds = {}; GAG.timers = []; GAG.idleT = 0; GAG.facilities = 0; }

/* hooks: run start (a clean slate) and the per-frame update; a smashed box draws as a wreck */
(function(){
  const sr = startRun;
  startRun = function(){ gagReset(); return sr.apply(this, arguments); };
  const su = sceneryUpdate;
  sceneryUpdate = function(dt){ su(dt); gagTick(dt); };
  if (typeof twDrawBox === 'function'){
    const tb = twDrawBox;
    twDrawBox = function(ctx, b, f, t){ if (b.smashed) return gagWreckDraw(ctx, b); return tb.apply(this, arguments); };
  }
})();
