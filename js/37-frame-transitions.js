'use strict';
/* Frame composition, transform sequence, chapter transitions. */
/* ========================= 29. FRAME COMPOSITION ========================= */
let vignette = null, lowHpGrad = null;
function buildGradients(){
  const ctx = CTX;
  if (!ctx || !ctx.createRadialGradient) return;
  const r = Math.hypot(G.W, G.H) * 0.5;
  vignette = ctx.createRadialGradient(G.W / 2, G.H / 2, r * 0.42, G.W / 2, G.H / 2, r);
  vignette.addColorStop(0, 'rgba(12,9,8,0)');
  vignette.addColorStop(1, 'rgba(12,9,8,.42)');
  lowHpGrad = ctx.createRadialGradient(G.W / 2, G.H / 2, r * 0.3, G.W / 2, G.H / 2, r);
  lowHpGrad.addColorStop(0, 'rgba(207,68,51,0)');
  lowHpGrad.addColorStop(1, 'rgba(207,68,51,.5)');
}

function render(){
  const ctx = CTX;
  if (!ctx) return;
  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H);       /* the canvas is opaque (38-overlays-cards.js) */
  if (G.state === 'forage'){ renderForage(ctx); return; }
  if (G.state === 'mini'){ renderMini(ctx); return; }
  if (G.state === 'scout'){ renderScout(ctx); return; }
  if (G.state === 'mscout'){ renderMScout(ctx); return; }
  if (G.state === 'cutscene'){ if (G.cut) renderCutscene(ctx, G.cut.t, G.W, G.H, G.cut.kind); drawFade(ctx); return; }
  Light.on = fxLevelNow() > 0;                   /* follows the setting even while paused */

  const vw = G.W / G.zoom, vh = G.H / G.zoom;
  let cx = P.x, cy = P.y;
  const pull = bossIntroPull();                  /* a boss entrance drifts the camera toward the boss */
  if (pull > 0){ cx += (G.bossIntro.boss.x - cx) * pull; cy += (G.bossIntro.boss.y - cy) * pull; }
  cx = vw >= ARENA_W ? ARENA_W / 2 : clamp(cx, vw / 2, ARENA_W - vw / 2);
  cy = vh >= ARENA_H ? ARENA_H / 2 : clamp(cy, vh / 2, ARENA_H - vh / 2);
  G.camX = cx; G.camY = cy;

  /* shake: random, or along the direction of the blow when a hit gave it one */
  const sh = G.shake;
  if (sh < 0.5) G.shakeBias = 0;
  let ox = 0, oy = 0;
  if (sh > 0){
    const bias = G.shakeBias || 0;
    if (bias > 0){ const r = rand(-sh, sh); ox = Math.cos(G.shakeAng || 0) * r * bias + rand(-sh, sh) * (1 - bias); oy = Math.sin(G.shakeAng || 0) * r * bias + rand(-sh, sh) * (1 - bias); }
    else { ox = rand(-sh, sh); oy = rand(-sh, sh); }
  }

  ctx.save();
  const dzm = G.deathFX ? 1 + 0.1 * (1 - Math.pow(1 - clamp(G.deathFX.t / G.deathFX.dur, 0, 1), 2)) : 1;
  ctx.translate(G.W / 2 + ox, G.H / 2 + oy);
  ctx.scale(G.zoom * dzm, G.zoom * dzm);
  ctx.translate(-cx, -cy);

  drawGround(ctx, cx, cy, vw, vh);
  drawWaterFX(ctx, cx, cy, vw, vh);
  drawDecals(ctx, cx, cy, vw, vh);
  drawScenery(ctx, cx, cy, vw, vh);
  drawZones(ctx);
  drawAnthill(ctx);
  for (let i = 0; i < P.cards.length; i++){ const c = P.cards[i]; if (c.def.drawUnder) c.def.drawUnder(c, ctx); }
  drawShocks(ctx);
  drawHostileUnder(ctx);
  drawPickups(ctx);

  drawActorsSorted(ctx, cx, cy, vw, vh);        /* creatures, the giraffe and tall scenery, back to front */
  if (G.rocket) drawRocketOverlay(ctx);
  drawHostileOver(ctx); drawMarineOverlays(ctx, cx, cy, vw, vh); drawPulses(ctx);
  drawSwipes(ctx);
  drawProjectiles(ctx);
  for (let i = 0; i < P.cards.length; i++){ const c = P.cards[i]; if (c.def.drawOver) c.def.drawOver(c, ctx); }
  drawBolts(ctx);
  Light.pools(ctx);
  drawSceneryOver(ctx);
  drawParticles(ctx);
  drawTexts(ctx);

  ctx.restore();
  Atmos.draw(ctx, cx, cy, ox, oy);
  drawScreenFX(ctx);
}

function drawScreenFX(ctx){
  if (vignette){ ctx.fillStyle = vignette; ctx.fillRect(0, 0, G.W, G.H); }
  if (lowHpGrad && G.state === 'playing' && P.hp / P.maxHp < 0.3){
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(G.time * 5);
    ctx.fillStyle = lowHpGrad; ctx.fillRect(0, 0, G.W, G.H);
    ctx.globalAlpha = 1;
  }
  if (G.flash){
    const a = G.flash.a * (1 - G.flash.t / G.flash.dur);
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = G.flash.color; ctx.fillRect(0, 0, G.W, G.H);
    ctx.globalAlpha = 1;
  }

  /* boss bar */
  if (G.bossAlive && G.boss && !G.boss.dead){
    const w = Math.min(460, G.W - 60), x = (G.W - w) / 2, y = G.W < 760 ? 140 : 86;
    ctx.fillStyle = 'rgba(18,13,10,.82)';
    ctx.fillRect(x - 3, y - 3, w + 6, 20);
    ctx.fillStyle = '#3A2B20'; ctx.fillRect(x, y, w, 14);
    const p = clamp(G.boss.hp / G.boss.maxHp, 0, 1);
    ctx.fillStyle = '#CF4433'; ctx.fillRect(x, y, w * p, 14);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, w * p, 5);
    ctx.font = '700 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center'; ctx.fillStyle = '#EFE6D4';
    ctx.fillText(G.boss.def.title + '   ' + Math.ceil(G.boss.hp) + ' / ' + Math.ceil(G.boss.maxHp), G.W / 2, y - 8);
    ctx.textAlign = 'left';
  }

  /* wave banner */
  if (G.banner){
    const b = G.banner;
    const k = b.t / b.dur;
    const a = k < 0.12 ? k / 0.12 : k > 0.78 ? (1 - k) / 0.22 : 1;
    const slide = k < 0.12 ? (1 - k / 0.12) * 40 : 0;
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.textAlign = 'center';
    const size = Math.min(78, Math.max(34, G.W * 0.075));
    ctx.font = '900 ' + size + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,9,8,.9)';
    const by = typeof bannerAvoidY === 'function' ? bannerAvoidY(ctx, b, size) : G.H * 0.3;      /* out of her way (36m-giraffe-fx.js) */
    ctx.strokeText(b.title, G.W / 2 + slide, by);
    ctx.fillStyle = b.color;
    ctx.fillText(b.title, G.W / 2 + slide, by);
    if (b.sub){
      ctx.font = '600 ' + Math.max(13, size * 0.24) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeText(b.sub, G.W / 2 + slide, by + size * 0.62);
      ctx.fillStyle = '#EFE6D4';
      ctx.fillText(b.sub, G.W / 2 + slide, by + size * 0.62);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  drawDeathFX(ctx); drawReviveFX(ctx);
  if (G.transformFX) drawTransform(ctx);
  if (G.chapterFX) drawChapterTrans(ctx);
  drawIntroFX(ctx);
  drawFeedbackOverlays(ctx);                     /* boss entrance card and the fade in from dark */
}

/* ========================= 30. TRANSFORM SEQUENCE ========================= */
function startTransform(inst){
  G.transformFX = {
    t: 0, dur: 2.5, name: inst.form.name, icon: inst.form.icon,
    sub: inst.tier === 2 ? 'Final form' : 'Transformed',
    desc: inst.form.desc, color: inst.form.color, tier: inst.tier
  };
  G.state = 'transform';
  SFX.transform();
  screenFlash(inst.form.color, 0.75, 0.8);
  addShake(26);
  addShock(P.x, P.y, 760, 1.0, 0, inst.form.color, { width: 46 });
  addShock(P.x, P.y, 420, 0.7, 0, '#FFFFFF', { width: 26 });
  for (let i = 0; i < 70; i++){
    const a = Math.random() * TAU, s = rand(140, 520);
    addParticle(P.x, P.y, Math.cos(a) * s, Math.sin(a) * s, rand(3, 9), rand(0.6, 1.4), i % 3 ? inst.form.color : '#FFFBEF', { glow: true, drag: 1.2 });
  }
  /* clear the field a little so the moment reads */
  const list = G.enemies;
  for (let i = 0; i < list.length; i++){
    const e = list[i];
    const a = Math.atan2(e.y - P.y, e.x - P.x);
    e.kx += Math.cos(a) * 620 * e.kbRes; e.ky += Math.sin(a) * 620 * e.kbRes;
    e.stunT = Math.max(e.stunT, 1.1);
  }
}

/* ========================= 30f. CHAPTER TRANSITION ========================= */
const CHAPTER_TRANSITIONS = {
  1: { title: 'CHAPTER 1 COMPLETE', sub: 'The giraffe treks north, into the snow',
       color: '#8FE0FF', flashColor: '#EAF6FA', burstColor: '#FFFFFF', biome: 'snow', saveFlag: 'chapter1Complete' },
  2: { title: 'CHAPTER 2 COMPLETE', sub: 'The giraffe wades on, into the swamp',
       color: '#9ACB5E', flashColor: '#E8F2D0', burstColor: '#C8E080', biome: 'swamp', saveFlag: 'chapter2Complete' },
  3: { title: 'CHAPTER 3 COMPLETE', sub: 'The giraffe swims on, into open water',
       color: '#3EE8D8', flashColor: '#DFFAF6', burstColor: '#8FFFEA', biome: 'ocean', saveFlag: 'chapter3Complete' },
  4: { title: 'CHAPTER 4 COMPLETE', sub: 'The giraffe washes ashore, into the rainforest',
       color: '#7FD65A', flashColor: '#E6F6D8', burstColor: '#B8F08A', biome: 'jungle', saveFlag: 'chapter4Complete' },
  5: { title: 'CHAPTER 5 COMPLETE', sub: 'The giraffe wanders out of the forest and into an empty Houston',
       color: '#E8B84A', flashColor: '#F4ECD8', burstColor: '#F2D48A', biome: 'city', saveFlag: 'chapter5Complete' },
  6: { title: 'CHAPTER 6 COMPLETE', sub: 'The giraffe follows the freeway south-east, to the Johnson Space Center',
       color: '#7FD0FF', flashColor: '#EAF4FF', burstColor: '#A8D8FF', biome: 'space', saveFlag: 'chapter6Complete' },
  7: { title: 'CHAPTER 7 COMPLETE', sub: 'The giraffe is alone on the Moon. Earth has noticed.',
       color: '#DDE3EC', flashColor: '#FFFFFF', burstColor: '#B8C8E8', biome: 'moon', saveFlag: 'chapter7Complete' },
  8: { title: 'CHAPTER 8 COMPLETE', sub: 'The giraffe is stranded on Venus. Something out there is burning.',
       color: '#FFB070', flashColor: '#FFE0B0', burstColor: '#FF9A4A', biome: 'venus', saveFlag: 'chapter8Complete' },
  9: { title: 'CHAPTER 9 COMPLETE', sub: 'The fire is not finished with the giraffe. Something older is waking below.',
       color: '#FF8A4A', flashColor: '#FFD0A0', burstColor: '#FF6A2A', biome: 'venus', saveFlag: 'chapter9Complete' },
  10: { title: 'CHAPTER 10 COMPLETE', sub: 'Home again. Something on the savannah has changed.',
       color: '#6FF0DC', flashColor: '#D8FFF4', burstColor: '#4AF0D8', biome: 'savanna', saveFlag: 'chapter10Complete' },
  11: { title: 'CHAPTER 11 COMPLETE', sub: 'The giraffe drops into the Nevada desert. Area 51 is awake.',
       color: '#B8E86A', flashColor: '#F0FFD8', burstColor: '#9BE86A', biome: 'area51', saveFlag: 'chapter11Complete' },
  12: { title: 'CHAPTER 12 COMPLETE', sub: 'The SP-1 carries the giraffe and the Mutation Vial to Mars.',
       color: '#FF9A6A', flashColor: '#FFE0C8', burstColor: '#E8764A', biome: 'mars', saveFlag: 'chapter12Complete' },
  13: { title: 'CHAPTER 13 COMPLETE', sub: 'The helicopter finds a ring of mirrored domes in the heat. Something is wrong inside.',
       color: '#BFEFFF', flashColor: '#F0FFFF', burstColor: '#9FE8FF', biome: 'dome', saveFlag: 'chapter13Complete' }
};
/* Chapter 1 is always the savanna; every later chapter's biome comes from
   the transition that leads into it, so this is the one place that mapping
   lives -- nothing else needs its own copy of the chapter-to-biome list. */
function biomeForChapter(ch){
  return ch > 1 && CHAPTER_TRANSITIONS[ch - 1] ? CHAPTER_TRANSITIONS[ch - 1].biome : 'savanna';
}
/* Chapter 7's ending is the Moon landing film. The run carries straight on to the Marines afterwards, and the
   completion flag is written first so quitting during the film loses nothing. */
/* a run ends at the last chapter that exists, or at Chapter 10 until she has been home (that is where the engine part is found); after she has been home it runs straight on into Chapter 11 */
function isRunEnd(w){ return w >= CHAPTER_LAST_WAVE || (w === 250 && !(Save.data && Save.data.homecoming)); }
function finishChapter(){
  saveRunAtBoundary();                           /* quitting during the film continues from the next chapter, not the boss again */
  if (chapterOf(G.wave) === 7){
    if (!Save.data.chapter7Complete){ Save.data.chapter7Complete = true; Save.write(); }
    startCutscene(beginChapterTransition, false, 'moon');
  } else if (chapterOf(G.wave) === 8){
    if (!Save.data.chapter8Complete){ Save.data.chapter8Complete = true; Save.write(); }   /* saved first: this is what unlocks Venus and Chapter 9 */
    startCutscene(beginChapterTransition, false, 'venus');
  } else if (chapterOf(G.wave) === 11){
    if (!Save.data.chapter11Complete){ Save.data.chapter11Complete = true; Save.write(); }   /* saved first: this is what opens Area 51 and Chapter 12 */
    startCutscene(beginChapterTransition, false, 'a51');
  } else if (chapterOf(G.wave) === 12){
    Save.data.chapter12Complete = true; Save.data.mutationVial = true; Save.write();           /* saved first: the vial, and the way to Mars */
    startCutscene(beginChapterTransition, false, 'mars');
  } else if (chapterOf(G.wave) === 13){
    if (!Save.data.chapter13Complete){ Save.data.chapter13Complete = true; Save.write(); }   /* saved first: the lab, the dust squad, and the way to the domes */
    startCutscene(function(){ marsRestoreHUD(); startCutscene(beginChapterTransition, false, 'domeflight'); }, false, 'marshome');       /* home from Mars, then the helicopter over the domes */
  } else if (SH_FILMS[chapterOf(G.wave)]){                                         /* the short travel films: Chapters 1-6, 9 and 10 */
    const sc = chapterOf(G.wave), inf = CHAPTER_TRANSITIONS[sc];
    if (inf && !Save.data[inf.saveFlag]){ Save.data[inf.saveFlag] = true; Save.write(); }
    startCutscene(beginChapterTransition, false, 'sh' + sc);
  } else beginChapterTransition();
}
/* After a chapter's film, a popup offers its minigame (js/44f-minigames.js); the next chapter follows either way. */
function beginChapterTransition(){
  if (typeof miniOffer === 'function' && miniOffer(chapterOf(G.wave), runChapterTransition)) return;
  runChapterTransition();
}
function runChapterTransition(){
  const completed = chapterOf(G.wave);
  const info = CHAPTER_TRANSITIONS[completed] || CHAPTER_TRANSITIONS[1];
  G.chapterFX = { t: 0, dur: 3.4, title: info.title, sub: info.sub, color: info.color,
    toBiome: info.biome, toChapter: completed + 1, motesColor: info.burstColor };
  G.state = 'chaptertrans';
  SFX.transform();
  screenFlash(info.flashColor, 0.7, 1.1);
  addShake(18);
  burstParticles(P.x, P.y, 40, info.burstColor, 260, 6, { glow: true });
  if (!Save.data[info.saveFlag]){
    Save.data[info.saveFlag] = true;
    Save.write();
  }
}

function updateChapterTrans(dt){
  G.time += dt;
  G.chapterFX.t += dt;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 40);
  if (G.flash){ G.flash.t += dt; if (G.flash.t >= G.flash.dur) G.flash = null; }
  updateParticles(dt);
  if (Math.random() < dt * 30){
    const a = Math.random() * TAU, d = rand(40, 300);
    addParticle(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, rand(-14, 14), rand(30, 70),
      rand(1.5, 3), 0.9, G.chapterFX.motesColor, { glow: true, drag: 0.8 });
  }
  /* the world itself changes partway through the moment */
  if (G.chapterFX.t > G.chapterFX.dur * 0.45 && G.biome !== G.chapterFX.toBiome){
    G.biome = G.chapterFX.toBiome;
    G.chapter = G.chapterFX.toChapter;
    P.hp = P.maxHp;                 /* a fresh start heading into the new region */
    /* Every chapter after the first always begins with an empty loadout and
       level 1, whether you reach it by playing through the one before or
       jump straight to it from the menu -- otherwise carrying a high level
       in with zero cards just means a harder climb to your first new card,
       purely from staying on for one more chapter rather than starting
       fresh in it. */
    P.cards.length = 0;
    P.level = 1; P.xp = 0; P.xpNext = xpForLevel(1);
    grantStartCards();                /* the Deflector Module puts its card back in your hand for each new chapter */
    recalcStats();
    P.hp = P.maxHp;
    if (G.biome === 'snow') buildSnowflakes();
    else if (G.biome === 'swamp') buildSwampMotes();
    else if (G.biome === 'ocean') buildOceanBubbles();
    else if (G.biome === 'jungle') buildJungleLeaves();
    else if (G.biome === 'city'){ buildCityPaper(); buildCityBuildings(); }
    else if (G.biome === 'space') buildSpaceCenter();
    else if (G.biome === 'moon') buildMoon();
    else if (G.biome === 'venus') buildVenusWorld();
    else if (G.biome === 'area51') buildArea51World();
    else if (G.biome === 'mars') buildMarsWorld();
    else if (G.biome === 'dome') buildDomeWorld();
  }
  if (G.chapterFX.t >= G.chapterFX.dur){
    G.chapterFX = null;
    G.state = 'playing';
    startWave(G.wave + 1);
  }
}

function drawChapterTrans(ctx){
  const f = G.chapterFX;
  const k = f.t / f.dur;
  const a = k < 0.1 ? k / 0.1 : k > 0.82 ? (1 - k) / 0.18 : 1;
  if (typeof drawIris === 'function' && fxLevelNow() > 0) drawIris(ctx, f);       /* an iris closes on her and opens on the new place (44d-visual-extras.js) */
  else {
    ctx.globalAlpha = clamp(a, 0, 1) * 0.8;
    ctx.fillStyle = f.t > f.dur * 0.45 ? 'rgba(20,30,36,1)' : 'rgba(12,9,8,1)';
    ctx.fillRect(0, 0, G.W, G.H);
  }
  ctx.globalAlpha = clamp(a, 0, 1);

  const cx = G.W / 2, cy = G.H * 0.42;
  const size = Math.min(56, Math.max(26, G.W * 0.052));
  ctx.textAlign = 'center';
  ctx.font = '900 ' + size + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,9,8,.92)';
  ctx.strokeText(f.title, cx, cy);
  ctx.fillStyle = f.color;
  ctx.fillText(f.title, cx, cy);

  ctx.font = '600 ' + Math.max(13, size * 0.32) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#EFE6D4';
  ctx.fillText(f.sub, cx, cy + size * 0.62);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function updateTransform(dt){
  G.time += dt;
  G.transformFX.t += dt;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 46);
  if (G.flash){ G.flash.t += dt; if (G.flash.t >= G.flash.dur) G.flash = null; }
  updateParticles(dt);
  if (Math.random() < dt * 40){
    const a = Math.random() * TAU, d = rand(60, 320);
    addParticle(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, -Math.cos(a) * 200, -Math.sin(a) * 200,
      rand(2, 6), 0.7, G.transformFX.color, { glow: true, drag: 1 });
  }
  if (G.transformFX.t >= G.transformFX.dur){
    G.transformFX = null;
    afterLevelChoice();
  }
}

function drawTransform(ctx){
  const f = G.transformFX;
  const k = f.t / f.dur;
  const a = k < 0.08 ? k / 0.08 : k > 0.8 ? (1 - k) / 0.2 : 1;
  ctx.globalAlpha = clamp(a, 0, 1) * 0.72;
  ctx.fillStyle = 'rgba(12,9,8,1)';
  ctx.fillRect(0, 0, G.W, G.H);
  ctx.globalAlpha = clamp(a, 0, 1);

  /* radiating spokes */
  const cx = G.W / 2, cy = G.H * 0.44;
  const spin = f.t * 0.7;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
  ctx.globalAlpha = clamp(a, 0, 1) * 0.16;
  ctx.fillStyle = f.color;
  const R = Math.hypot(G.W, G.H);
  for (let i = 0; i < 16; i++){
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, i * TAU / 16, i * TAU / 16 + 0.1);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = clamp(a, 0, 1);

  const grow = clamp(k / 0.25, 0, 1);
  const rr = 70 + (1 - Math.pow(1 - grow, 3)) * 30;
  ringPath(ctx, cx, cy - 16, (rr * 0.82) + Math.sin(f.t * 8) * 4, 4, f.color, 0.8);
  ctx.textAlign = 'center';
  ctx.font = Math.round(48 * grow) + 'px serif';
  drawIcon(ctx, f.icon, cx, cy - 20, Math.round(48 * grow), f.color);

  const size = Math.min(64, Math.max(28, G.W * 0.062));
  ctx.font = '900 ' + size + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,9,8,.92)';
  ctx.strokeText(f.name, cx, cy + 142);
  ctx.fillStyle = f.color;
  ctx.fillText(f.name, cx, cy + 142);

  ctx.font = '700 ' + Math.max(12, size * 0.26) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#EFE6D4';
  ctx.fillText(f.sub, cx, cy + 142 + size * 0.52);

  ctx.font = '400 ' + Math.max(12, Math.min(16, G.W * 0.024)) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#C6B9A2';
  wrapText(ctx, f.desc, cx, cy + 142 + size * 0.52 + 36, Math.min(560, G.W - 60), 21);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function wrapText(ctx, text, x, y, maxW, lh){
  const words = String(text).split(' ');
  let line = '', yy = y;
  for (let i = 0; i < words.length; i++){
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line){
      ctx.fillText(line, x, yy); line = words[i]; yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}
