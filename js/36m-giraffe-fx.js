'use strict';
/* The giraffe's presentation: stride stretch, breathing, head sway, blinking and ear flicks, hoof dust, a power glow that grows
   with the build, afterimages on fast moves, and a pulse on level-up. drawPlayer() (33-giraffe-art.js) reads GF. */
/* ========================= GIRAFFE PRESENTATION ========================= */
const GF = {
  blink: 0, nextBlink: 2.5, ear: 0, earT: 0, nextEar: 3,
  sq: 0, breath: 0, sway: 0, reach: 0,
  stepT: 0, lastLevel: 1, pulse: 0, power: 0, col: '#FFD27A', scanT: 0,
  trail: [], trailT: 0
};
/* the dust a hoof kicks up, by ground: rgb prefix (alpha is added) */
const STEP_DUST = {
  savanna: '190,164,112', snow: '240,248,252', swamp: '70,84,44', jungle: '90,110,60', city: '150,150,150', space: '190,190,190',
  moon: '200,200,205', venus: '220,170,96', area51: '196,170,120', mars: '190,100,74', dome: '236,246,252'
};

function giraffeFxUpdate(dt){
  if (fxLevelNow() <= 0){ GF.sq = 0; GF.breath = 0; GF.sway = 0; GF.reach = 0; GF.blink = 0; GF.ear = 0; GF.pulse = 0; GF.trail.length = 0; return; }
  const sp = hyp(P.vx, P.vy), mv = clamp(sp / 150, 0, 1), t = G.time;
  /* blinking and the odd ear flick */
  GF.nextBlink -= dt; if (GF.nextBlink <= 0){ GF.blink = 0.12; GF.nextBlink = rand(2.2, 5.5); }
  if (GF.blink > 0) GF.blink -= dt;
  GF.nextEar -= dt; if (GF.nextEar <= 0){ GF.earT = 0.32; GF.nextEar = rand(2.5, 6.5); }
  if (GF.earT > 0){ GF.earT -= dt; GF.ear = Math.sin((1 - Math.max(0, GF.earT) / 0.32) * TAU) * 0.55; } else GF.ear = 0;
  /* stretch along the stride, a longer lunge on a kick, and a slow breath when standing still */
  const kick = P.kickAnim > 0 ? Math.sin(P.kickAnim / 0.30 * Math.PI) * 0.1 : 0;
  const tx = clamp(sp / 260, 0, 1) * 0.055 + kick - (P.hurtT > 0 ? 0.05 : 0);
  GF.sq += (tx - GF.sq) * Math.min(1, dt * 12);
  GF.breath = Math.sin(t * 2.4) * 0.014 * (1 - mv);
  /* the head sways when idle and nods with the stride when running */
  GF.sway = Math.sin(t * 1.6) * 1.8 * (1 - mv) + Math.sin(P.walk * 2 + 0.6) * 1.6 * mv;
  GF.reach = Math.sin(P.walk * 2 + 1.1) * 1.8 * mv;
  /* hoof dust (the ocean has its own wake) */
  const swim = G.biome === 'ocean';
  if (sp > 55 && !swim && !P.dead && G.state === 'playing'){
    GF.stepT += dt * clamp(sp / 216, 0.4, 1.6);
    if (GF.stepT >= 0.17){
      GF.stepT = 0;
      const key = atmosChapter() === 10 ? null : STEP_DUST[G.biome] || STEP_DUST.savanna, rgb = key || '84,70,64';
      const bx = P.x - Math.cos(P.face) * 14, by = P.y - Math.sin(P.face) * 14 + 10;
      for (let k = 0; k < 2; k++)
        addParticle(bx + rand(-8, 8), by + rand(-3, 3), rand(-18, 18) - P.vx * 0.12, rand(-22, 4) - P.vy * 0.12, rand(2.6, 4.2), rand(0.35, 0.55), 'rgba(' + rgb + ',0.7)', { shape: 'puff', drag: 2.4, shrink: false });
    }
  }
  /* afterimages on a kick or a very fast move */
  GF.trailT -= dt;
  if ((P.kickAnim > 0 || sp > 250) && GF.trailT <= 0 && !P.dead){
    GF.trailT = 0.035; GF.trail.push({ x: P.x, y: P.y, f: P.face, age: 0 });
    if (GF.trail.length > 6) GF.trail.shift();
  }
  for (let i = GF.trail.length - 1; i >= 0; i--){ GF.trail[i].age += dt; if (GF.trail[i].age > 0.26) GF.trail.splice(i, 1); }
  /* the power glow follows the build: how many cards, how far they have come, and the colour of the strongest */
  GF.scanT -= dt;
  if (GF.scanT <= 0){
    GF.scanT = 0.5;
    let sum = 0, best = null, bw = 0;
    for (let i = 0; i < P.cards.length; i++){
      const c = P.cards[i]; if (c.hidden) continue;
      const lv = c.level || 1, w = c.def.combo ? lv * 3 : lv;
      sum += lv; if (w > bw){ bw = w; best = c; }
    }
    GF.power = clamp(sum / 38, 0, 1);
    if (best && best.def.forms && best.def.forms[0]) GF.col = best.def.forms[0].color || '#FFD27A';
  }
  /* a pulse of light and sparks when she levels up */
  if (P.level < GF.lastLevel) GF.lastLevel = P.level;
  if (P.level > GF.lastLevel){
    GF.lastLevel = P.level;
    if (G.state === 'playing' && !G.attract){
      GF.pulse = 1;
      addParticle(P.x, P.y + 14, 0, 0, 22, 0.9, 'rgba(255,230,160,0.9)', { shape: 'wake', drag: 0, shrink: false });
      for (let i = 0; i < 14; i++){
        const a = Math.random() * TAU, s = rand(60, 220);
        addParticle(P.x, P.y, Math.cos(a) * s, Math.sin(a) * s - 90, rand(2, 4), rand(0.5, 0.9), i % 3 ? '#FFE6A0' : '#FFFFFF', { glow: true, drag: 1.6 });
      }
    }
  }
  if (GF.pulse > 0) GF.pulse = Math.max(0, GF.pulse - dt * 1.6);
}

/* a dark soft rim around her silhouette, strongest on the grounds she tends to blend into (grey snow, olive swamp, green
   jungle, ochre Venus, and the orange Inferno and Mars); drawPlayer() sets it as a canvas shadow for the length of her drawing. Returns [colour, blur] or null. */
const GIRAFFE_RIM = { 1: 0.3, 2: 0.75, 3: 0.65, 4: 0.4, 5: 0.7, 6: 0.3, 7: 0.3, 8: 0.3, 9: 0.6, 10: 0.9, 11: 0.4, 12: 0.3, 13: 0.9, 14: 0.8 };
function giraffeRim(){
  if (fxLevelNow() <= 0) return null;
  const k = GIRAFFE_RIM[G.chapter | 0] || 0.3;
  return ['rgba(30,16,6,' + k.toFixed(2) + ')', k >= 0.85 ? 7 : k >= 0.6 ? 5 : 3.5];
}

/* where the wave banner sits, so it does not cover her: it stays at its usual height unless she is under it, and then eases
   up above her (or down below her if there is no room above) */
function bannerAvoidY(ctx, b, size){
  const base = G.H * 0.3, z = G.zoom || 1;
  const sx = G.W / 2 + (P.x - G.camX) * z, sy = G.H / 2 + (P.y - G.camY) * z;
  const tw = ctx.measureText(b.title).width / 2 + 24;
  const top = base - size * 0.8, bot = base + (b.sub ? size * 0.62 + 12 : 8);
  const gTop = sy - 78 * z, gBot = sy + 34 * z;
  let want = base;
  if (Math.abs(sx - G.W / 2) < tw + 45 * z && gBot > top && gTop < bot){
    const above = gTop - 12 - (bot - base);
    want = above - size * 0.8 >= 64 ? above : gBot + 14 + size * 0.8;
  }
  b.y = b.y === undefined ? want : b.y + (want - b.y) * 0.2;
  return b.y;
}

/* drawn under the body: the power glow and the afterimages */
function giraffeAuraUnder(ctx){
  if (fxLevelNow() <= 0 || P.dead) return;
  const t = G.time, p = GF.power, a = 0.05 + p * 0.17 + GF.pulse * 0.45;
  /* a soft pale halo under her so she stands out from orange and mauve ground (the Inferno, Mars, the Changed Savannah) */
  {
    const hot = G.chapter === 10 || G.chapter === 9 || G.chapter === 13 || G.chapter === 11, ha = hot ? 0.3 : 0.14, hr = hot ? 50 : 42;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ha;
    ctx.drawImage(lightSprite([255, 246, 225]), P.x - hr, P.y - hr * 0.75 + 4, hr * 2, hr * 1.5);
    ctx.restore();
  }
  if (a > 0.02){
    const r = 54 + p * 24 + GF.pulse * 46;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, a * (0.88 + 0.12 * Math.sin(t * 2.3)));
    ctx.drawImage(lightSprite(colRGB(GF.col)), P.x - r, P.y - r * 0.8 + 6, r * 2, r * 1.6);
    ctx.restore();
  }
  if (GF.trail.length){
    ctx.save();
    for (let i = 0; i < GF.trail.length; i++){
      const g = GF.trail[i], k = 1 - g.age / 0.26;
      ctx.globalAlpha = 0.2 * k; ctx.fillStyle = '#E8C070';
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.f);
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}
