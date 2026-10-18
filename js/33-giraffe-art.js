'use strict';
/* Drawing the giraffe and armour designs. */
/* ========================= 27. THE GIRAFFE ========================= */
const SPOTS = [];
(function(){
  const seed = [[-13,-6,5.2],[-6,4,4.6],[2,-7,5.0],[8,3,4.2],[-17,3,3.6],[14,-3,3.8],[-2,-1,3.2],[17,4,3.0],[5,8,3.4],[-10,-13,3.0]];
  for (let i = 0; i < seed.length; i++) SPOTS.push({ x: seed[i][0], y: seed[i][1], r: seed[i][2] });
})();

/* ========================= 27b. ARMOR DESIGNS ========================= */
/* One visual per gear set, drawn on the giraffe's back in the body's own
   local space (origin at the body's centre, already rotated to face the
   direction of movement). Complexity rises with rarity: common pieces are
   a simple wrap, legendary is the most ornate. All of them sit under the
   mane and cape, which are drawn afterward in drawPlayer(). */
function shade(hex, amt){ return amt >= 0 ? blendHex(hex, '#FFFFFF', amt) : blendHex(hex, '#14100E', -amt); }

const ARMOR_DESIGNS = {
  herdhide(ctx, c, t){
    /* a simple hide wrap with two straps and a buckle */
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(-2, -2, 15, 7.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = shade(c, -0.3); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-13, -6); ctx.lineTo(-13, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -6); ctx.lineTo(9, 7); ctx.stroke();
    fillCircle(ctx, -2, -2, 2.4, shade(c, -0.35));
    fillCircle(ctx, -2, -2, 1, shade(c, 0.3));
  },
  thornweave(ctx, c, t){
    /* woven mail with small thorns poking through */
    ctx.strokeStyle = shade(c, -0.2); ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = -3; i <= 3; i++){
      ctx.moveTo(-14, i * 2.4); ctx.lineTo(10, i * 2.4 + 4);
      ctx.moveTo(-14 + (i + 3) * 3.4, -8); ctx.lineTo(-14 + (i + 3) * 3.4 + 5, 8);
    }
    ctx.stroke();
    ctx.fillStyle = c;
    for (let i = 0; i < 6; i++){
      const px = -12 + i * 4.2, py = -3 + Math.sin(i * 1.7) * 4;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 1.6, py - 3.2); ctx.lineTo(px + 3.2, py); ctx.closePath(); ctx.fill();
    }
  },
  stoneplate(ctx, c, t){
    /* three chunky, riveted stone plates */
    ctx.fillStyle = shade(c, -0.15);
    for (let i = 0; i < 3; i++){
      ctx.beginPath(); ctx.ellipse(-11 + i * 9.5, -1 + (i === 1 ? -2 : 0), 6, 7.5, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = c;
    for (let i = 0; i < 3; i++){
      const px = -11 + i * 9.5, py = -1 + (i === 1 ? -2 : 0);
      ctx.beginPath(); ctx.ellipse(px, py, 4.6, 6, 0, 0, TAU); ctx.fill();
      fillCircle(ctx, px - 2, py - 3, 0.8, shade(c, -0.4));
      fillCircle(ctx, px + 2, py + 3, 0.8, shade(c, -0.4));
    }
  },
  frostbite(ctx, c, t){
    /* a frost-crusted hide with jagged icy edges */
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    for (let i = 0; i <= 6; i++){
      const x = -14 + i * 4.6, jag = (i % 2 === 0) ? -8 : -5.5;
      ctx.lineTo(x, jag);
    }
    ctx.lineTo(13, 7); ctx.lineTo(-14, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EAF9FF'; ctx.globalAlpha = 0.7;
    for (let i = 0; i < 5; i++){
      const x = -11 + i * 5.4;
      ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x + 1, -3); ctx.lineTo(x - 1, -3); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  acacia(ctx, c, t){
    /* vertical bark-strip plates with a leafy trim */
    for (let i = 0; i < 5; i++){
      const x = -13 + i * 5.6;
      ctx.fillStyle = i % 2 ? c : shade(c, -0.18);
      ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x + 4.6, -6); ctx.lineTo(x + 4.6, 7); ctx.lineTo(x, 8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(c, -0.35); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(x + 2.2, -6); ctx.lineTo(x + 2.2, 7); ctx.stroke();
    }
    ctx.fillStyle = shade(c, 0.25);
    for (let i = 0; i < 3; i++){
      const x = -10 + i * 9;
      ctx.beginPath(); ctx.ellipse(x, -8, 3, 1.6, 0.5, 0, TAU); ctx.fill();
    }
  },
  twinsoul(ctx, c, t){
    /* two mirrored bands crossing in an X, with a gem at the join */
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -7); ctx.quadraticCurveTo(-2, -1, 11, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 7); ctx.quadraticCurveTo(-2, 1, 11, -7); ctx.stroke();
    ctx.strokeStyle = shade(c, 0.35); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-14, -7); ctx.quadraticCurveTo(-2, -1, 11, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 7); ctx.quadraticCurveTo(-2, 1, 11, -7); ctx.stroke();
    ctx.lineCap = 'butt';
    fillCircle(ctx, -2, 0, 2.6, shade(c, 0.3));
    fillCircle(ctx, -2, 0, 1.1, '#FFFFFF');
  },
  glacierguard(ctx, c, t){
    /* large angular, faceted ice-shard plates */
    const shards = [[-13,-7,-3,-9,4,-4,-9,3],[-4,-9,7,-8,9,2,-2,5],[8,-4,15,-2,12,7,3,8]];
    shards.forEach((p, i) => {
      ctx.fillStyle = i === 1 ? shade(c, 0.15) : shade(c, -0.05);
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.lineTo(p[6], p[7]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.8; ctx.stroke();
    });
    softBlob(ctx, -2, -3, 12, '#FFFFFF', 0.12 + 0.05 * Math.sin(t * 2));
  },
  sunforged(ctx, c, t){
    /* an ornate gold plate engraved with a sunburst, gently shimmering */
    ctx.fillStyle = shade(c, -0.1);
    ctx.beginPath(); ctx.ellipse(-2, -1, 15, 8, 0, 0, TAU); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(-2, -1, 15, 8, 0, 0, TAU); ctx.clip();
    ctx.strokeStyle = shade(c, 0.3); ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++){
      const a = (i / 8) * TAU;
      ctx.beginPath(); ctx.moveTo(-2, -1); ctx.lineTo(-2 + Math.cos(a) * 18, -1 + Math.sin(a) * 18); ctx.stroke();
    }
    ctx.restore();
    fillCircle(ctx, -2, -1, 3.4, shade(c, 0.4));
    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3);
    fillCircle(ctx, -2, -1, 1.6, '#FFFBEF');
    ctx.globalAlpha = 1;
  },
  aurora(ctx, c, t){
    /* translucent, flowing streaks like the aurora, with small sparkles */
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 4; i++){
      const off = i * 4 - 6;
      ctx.strokeStyle = i % 2 ? shade(c, 0.35) : c;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(-15, -7 + off);
      ctx.quadraticCurveTo(-4 + Math.sin(t * 2.2 + i * 1.3) * 5, -1 + off + Math.cos(t * 1.6 + i) * 2, 12, 7 + off * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++){
      const off = i * 4 - 6;
      ctx.beginPath();
      ctx.moveTo(-15, -7 + off);
      ctx.quadraticCurveTo(-4 + Math.sin(t * 2.2 + i * 1.3) * 5, -1 + off + Math.cos(t * 1.6 + i) * 2, 12, 7 + off * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++){
      const a = t * 1.5 + i * 1.5;
      const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
      const sx = Math.cos(a) * 10 - 2, sy = Math.sin(a) * 6;
      ctx.globalAlpha = tw; fillCircle(ctx, sx, sy, 1.1, '#FFFFFF');
      ctx.globalAlpha = tw * 0.4; fillCircle(ctx, sx, sy, 2.4, shade(c, 0.4));
    }
    ctx.globalAlpha = 1;
  },
  starborn(ctx, c, t){
    /* the richest design: a plate scattered with stars linked like a
       constellation, with a slow pulsing glow at its core */
    ctx.fillStyle = shade(c, -0.15);
    ctx.beginPath(); ctx.ellipse(-2, -1, 15.5, 8.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(c, -0.3);
    ctx.beginPath(); ctx.ellipse(-2, -1, 15.5, 8.2, 0, 0, TAU); ctx.lineWidth = 1; ctx.stroke();
    const stars = [[-11,-4],[-5,-6],[2,-3],[8,-5],[-8,3],[0,4],[7,2]];
    ctx.strokeStyle = 'rgba(255,251,239,.55)'; ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 0; i < stars.length - 1; i++){ ctx.moveTo(stars[i][0], stars[i][1]); ctx.lineTo(stars[i+1][0], stars[i+1][1]); }
    ctx.stroke();
    stars.forEach((s, i) => {
      const tw = 0.6 + 0.4 * Math.sin(t * 4 + i * 2);
      fillCircle(ctx, s[0], s[1], 1.1, '#FFFBEF');
      ctx.globalAlpha = tw * 0.5; fillCircle(ctx, s[0], s[1], 2.2, '#FFFBEF'); ctx.globalAlpha = 1;
    });
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 2.2);
    softBlob(ctx, -2, -1, 13, c, 0.4);
    ctx.globalAlpha = 1;
  },
  tideshell(ctx, c, t){
    /* overlapping shell scallops, like a beach-shell breastplate */
    for (let i = 0; i < 4; i++){
      const x = -12 + i * 7;
      ctx.fillStyle = i % 2 ? c : shade(c, -0.15);
      ctx.beginPath(); ctx.arc(x, 0, 6.5, Math.PI, TAU); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(c, -0.35); ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let k = -2; k <= 2; k++){ ctx.moveTo(x, -6); ctx.lineTo(x + k * 2.4, 0); }
      ctx.stroke();
    }
  },
  riptide(ctx, c, t){
    /* two curling wave-crests crossing like a rip current, foam-capped */
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-2, 4 + Math.sin(t * 2) * 1.5, 11, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 7); ctx.quadraticCurveTo(-2, -3 + Math.sin(t * 2 + 1) * 1.5, 11, 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-2, 4, 11, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 7); ctx.quadraticCurveTo(-2, -3, 11, 8); ctx.stroke();
    ctx.lineCap = 'butt';
    fillCircle(ctx, -2, 0.5, 2.4, shade(c, 0.35));
    fillCircle(ctx, -2, 0.5, 1, '#FFFFFF');
  },
  abyssal(ctx, c, t){
    /* a dark carapace with glowing bioluminescent veins branching across it */
    ctx.fillStyle = shade(c, -0.6);
    ctx.beginPath(); ctx.ellipse(-2, -1, 15, 8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 3);
    const veins = [[-13, -2, -6, -5, 0, -2], [-13, 3, -5, 5, 3, 2], [3, -2, 8, -6, 13, -3], [3, 3, 9, 6, 13, 4]];
    ctx.beginPath();
    veins.forEach(v => { ctx.moveTo(v[0], v[1]); ctx.quadraticCurveTo(v[2], v[3], v[4], v[5]); });
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++){
      const a = t * 1.2 + i * 1.3;
      const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 2);
      const sx = Math.cos(a) * 9 - 2, sy = Math.sin(a) * 5;
      ctx.globalAlpha = tw; fillCircle(ctx, sx, sy, 1.2, c);
      ctx.globalAlpha = tw * 0.4; fillCircle(ctx, sx, sy, 2.6, c);
    }
    ctx.globalAlpha = 1;
  },
  canopy(ctx, c, t){
    /* common: overlapping broad leaves stitched into a vest */
    const leaves = [[-10, -3, -0.4], [-3, 3, 0.3], [4, -3, -0.3], [10, 2, 0.4], [-6, -6, 0.1], [2, 5, -0.2]];
    for (let i = 0; i < leaves.length; i++){
      const L = leaves[i];
      ctx.fillStyle = i % 2 ? c : shade(c, -0.18);
      ctx.beginPath(); ctx.ellipse(L[0], L[1], 7, 3.6, L[2], 0, TAU); ctx.fill();
      ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(L[0] - Math.cos(L[2]) * 6, L[1] - Math.sin(L[2]) * 6); ctx.lineTo(L[0] + Math.cos(L[2]) * 6, L[1] + Math.sin(L[2]) * 6); ctx.stroke();
    }
  },
  jaguar(ctx, c, t){
    /* rare: a pelt vest with jaguar rosettes and a trimmed edge */
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(-2, -1, 14.5, 7.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = shade(c, -0.45); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(-2, -1, 14.5, 7.8, 0, 0, TAU); ctx.stroke();
    const ros = [[-10, -3], [-4, 2], [2, -3], [8, 1], [-7, 3.5], [4, 4]];
    for (let i = 0; i < ros.length; i++){
      ctx.beginPath(); ctx.arc(ros[i][0], ros[i][1], 1.9, 0, TAU); ctx.stroke();
      fillCircle(ctx, ros[i][0], ros[i][1], 0.8, shade(c, -0.25));
    }
  },
  leviathan(ctx, c, t){
    /* the richest design: overlapping deep-sea scales around a glowing
       core like a leviathan's own eye, with bubbles drifting past */
    ctx.fillStyle = shade(c, -0.35);
    ctx.beginPath(); ctx.ellipse(-2, -1, 15.5, 8.4, 0, 0, TAU); ctx.fill();
    const scales = [[-11, -4], [-4, -6], [3, -5], [9, -3], [-9, 3], [-2, 5], [5, 3], [11, 2]];
    scales.forEach((sc, i) => {
      ctx.fillStyle = i % 2 ? shade(c, -0.1) : shade(c, 0.1);
      ctx.beginPath(); ctx.arc(sc[0], sc[1], 3.2, Math.PI, TAU); ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = 0.45 + 0.35 * Math.sin(t * 2.4);
    softBlob(ctx, -2, -1, 12, c, 0.5);
    ctx.globalAlpha = 1;
    fillCircle(ctx, -2, -1, 3, '#08141C');
    fillCircle(ctx, -2, -1, 1.4, c);
    for (let i = 0; i < 4; i++){
      const bt = (t * 0.6 + i * 0.7) % 2;
      const bx = -10 + i * 7, by = 6 - bt * 10;
      ctx.globalAlpha = clamp(1 - bt / 2, 0, 1) * 0.6;
      fillCircle(ctx, bx, by, 1, 'rgba(220,245,250,1)');
    }
    ctx.globalAlpha = 1;
  }
};

function drawPlayer(ctx){
  const ke = kickReach();                                 /* wind-up, snap and follow-through (44b-feedback.js) */
  const swimming = G.biome === 'ocean';
  const bob = swimming ? Math.sin(P.walk * 2.6) * 2.2 : Math.sin(P.walk * 2) * 1.5;
  const f = P.face, a = P.aim;
  const hurt = P.hurtT > 0;

  if (swimming){
    /* afloat, not grounded: a spreading ripple takes the place of a shadow */
    const moving = Math.hypot(P.vx, P.vy);
    ctx.globalAlpha = 0.4;
    ringPath(ctx, P.x, P.y + 15, 22 + Math.sin(G.time * 2.2) * 2, 2, '#DFF3FF', 0.35);
    ctx.globalAlpha = 1;
    if (moving > 20 && Math.random() < 0.4)
      addParticle(P.x - Math.cos(f) * 18 + rand(-4, 4), P.y - Math.sin(f) * 18 + 14 + rand(-3, 3),
        rand(-16, 16), rand(-10, 6), rand(1.5, 3), 0.5, '#EAF9FF', { glow: true, drag: 1.4 });
  } else {
    softShadow(ctx, P.x, P.y + 14, 26, 12, 0.32, 14);
    if (G.chapter === 10 || G.chapter === 13) softShadow(ctx, P.x, P.y + 2, 44, 30, 0.42, 24);       /* a darker pad where the coat matches the orange ground */
  }
  giraffeAuraUnder(ctx);                                  /* power glow and afterimages (36m-giraffe-fx.js) */

  const flick = (P.invuln > 0 && Math.floor(G.time * 20) % 2 === 0);
  if (flick) ctx.globalAlpha = 0.5;
  const rim = typeof giraffeRim === 'function' ? giraffeRim() : null;
  if (rim){ ctx.shadowColor = rim[0]; ctx.shadowBlur = rim[1]; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }      /* a dark edge, so she stands out from pale and green ground */

  const cl = typeof giraffeColours === 'function' ? giraffeColours() : null;       /* the coat colours she has chosen (js/44e-wardrobe.js) */
  const coat = hurt ? '#FFB9A8' : cl ? cl.coat : '#D6A44F';
  const spot = hurt ? '#E08878' : cl ? cl.spot : '#8A5A24';
  const dark = hurt ? '#C87A68' : cl ? cl.dark : '#A8762F';

  /* legs -- a paddling stroke, mostly awash, when swimming */
  ctx.save(); ctx.translate(P.x, P.y + bob); ctx.rotate(f);
  ctx.scale(1 + GF.sq + (GF.land || 0) * 0.2, 1 - GF.sq * 0.7 + GF.breath - (GF.land || 0) * 0.24);      /* stretches along the stride, breathes when still, squashes when her head lands (36n) */
  const sw = Math.sin(P.walk * (swimming ? 3.4 : 2.2)) * (swimming ? 10 : 6);
  const bootAcc = typeof accEquipped === 'function' && !swimming ? accEquipped('boot') : null;     /* boots won from the minigames (js/44f-minigames.js) */
  const bootMove = bootAcc && Math.hypot(P.vx, P.vy) > 40;
  ctx.fillStyle = dark;
  const legs = [[-13, -11, 1], [-13, 11, -1], [12, -10, -1], [12, 10, 1]];
  for (let i = 0; i < 4; i++){
    const L = legs[i];
    ctx.save(); ctx.translate(L[0] + sw * L[2] * 0.7, L[1]);
    if (ke > 0 && i >= 2) ctx.translate(ke * 10, 0);
    if (swimming){
      ctx.globalAlpha = 0.82;
      ctx.beginPath(); ctx.ellipse(0, 0, 7.4, 3.2, sw * L[2] * 0.05, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.beginPath(); ctx.ellipse(0, 0, 6.2, 4.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5C3A16';
      ctx.beginPath(); ctx.ellipse(2, 0, 2.6, 2.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = dark;
    }
    ctx.restore();
  }
  /* tail */
  ctx.strokeStyle = dark; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-22, 0);
  ctx.quadraticCurveTo(-32, Math.sin(P.walk * 3) * 8, -37, Math.sin(P.walk * 3) * 13);
  ctx.stroke();
  fillCircle(ctx, -37, Math.sin(P.walk * 3) * 13, 3.2, '#4A2E12');
  ctx.lineCap = 'butt';

  /* body */
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.clip();
  ctx.shadowBlur = 0;                                     /* the rim is for her outline only, not her spots */
  ctx.fillStyle = spot;
  const spPat = typeof giraffePattern === 'function' ? giraffePattern() : 0;           /* the spot pattern she has chosen (js/44e-wardrobe.js) */
  const gAcc = typeof giraffeAccent === 'function' ? giraffeAccent() : null;           /* and the accent colour for her cape and armour */
  for (let i = 0; i < SPOTS.length; i++){
    const s = SPOTS[i];
    if (spPat) wardSpot(ctx, spPat, s.x, s.y, s.r, s.r * 0.82, i * 0.7);
    else { ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.82, i * 0.7, 0, TAU); ctx.fill(); }
  }
  ctx.restore();

  if (bootAcc){                                           /* boots, on the feet that show along her flanks */
    for (let i = 0; i < 4; i++){
      const L = legs[i];
      ctx.save(); ctx.translate(L[0] + sw * L[2] * 0.7 + (ke > 0 && i >= 2 ? ke * 10 : 0), L[1] + (L[1] < 0 ? -6.5 : 6.5));
      drawBootTop(ctx, bootAcc.id, G.time, bootMove); ctx.restore();
    }
  }
  /* armor, worn on the back, still in the body's own rotated space */
  if (Settings.showGear && P.armorInfo && ARMOR_DESIGNS[P.armorInfo.setId]){
    ARMOR_DESIGNS[P.armorInfo.setId](ctx, gAcc || P.armorInfo.color, G.time);
  }
  if (typeof weaponArtBody === 'function') weaponArtBody(ctx, legs, sw, ke);          /* hoof and body weapons (js/33b-gear-art-weapons.js) */
  ctx.restore();

  /* neck + head, aimed at the cursor */
  const shx = P.x + Math.cos(a) * 11, shy = P.y + Math.sin(a) * 11 + bob;
  const nk = GF.neck || { ext: 0, bend: 0 };                  /* the lunge: the neck lengthens and whips (36n-neck-stretch.js) */
  const nlen = 40 + ke * 22 * (nk.ext ? 0 : 1) + GF.reach + nk.ext;
  const cv = typeof neckCurve === 'function' ? neckCurve(shx, shy, a, nlen, nk.bend, 9) : null;
  const px = -Math.sin(a), py = Math.cos(a);
  let hx = cv ? cv.hx : shx + Math.cos(a) * nlen, hy = cv ? cv.hy : shy + Math.sin(a) * nlen;
  hx += px * GF.sway; hy += py * GF.sway;                  /* the head sways when idle and nods when running */
  if (typeof neckGhostsDraw === 'function') neckGhostsDraw(ctx, coat);           /* motion-blur frames of the lunge */
  ctx.fillStyle = coat;
  if (cv){ neckPath(ctx, cv.pts); ctx.fill(); }
  else {
    ctx.beginPath();
    ctx.moveTo(shx + px * 8.5, shy + py * 8.5);
    ctx.lineTo(hx + px * 5.5, hy + py * 5.5);
    ctx.lineTo(hx - px * 5.5, hy - py * 5.5);
    ctx.lineTo(shx - px * 8.5, shy - py * 8.5);
    ctx.closePath(); ctx.fill();
  }
  /* neck spots */
  ctx.fillStyle = spot;
  if (rim) ctx.shadowBlur = 0;
  for (let i = 1; i <= 4; i++){
    const t = i / 5;
    const cp = cv ? cv.pts[Math.round(t * 9)] : null;
    const nx = cp ? cp.x : lerp(shx, hx, t), ny = cp ? cp.y : lerp(shy, hy, t);
    const off = (i % 2 ? 1 : -1) * 2.4;
    if (spPat) wardSpot(ctx, spPat, nx + px * off, ny + py * off, 3.4 - t * 1.1, 2.8 - t * 0.9, a);
    else { ctx.beginPath(); ctx.ellipse(nx + px * off, ny + py * off, 3.4 - t * 1.1, 2.8 - t * 0.9, a, 0, TAU); ctx.fill(); }
  }
  if (rim) ctx.shadowBlur = rim[1];
  /* mane */
  ctx.strokeStyle = '#7A4A21'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 5; i++){
    const t = i / 5, cp = cv ? cv.pts[Math.round(t * 9)] : null, mx = cp ? cp.x : lerp(shx, hx, t), my = cp ? cp.y : lerp(shy, hy, t);
    ctx.moveTo(mx + px * 6.5, my + py * 6.5);
    ctx.lineTo(mx + px * 9.5, my + py * 9.5);
  }
  ctx.stroke();

  /* cape: sits over the mane along the neck, and drifts on the wind.
     Drawn as a soft trailing sheet whose far edge lags behind the giraffe's
     own motion so it reads as cloth rather than a rigid plate. */
  if (Settings.showGear && P.capeColor){
    const windT = G.time * 1.7;
    const drift = Math.atan2(-P.vy, -P.vx);
    const moving = Math.hypot(P.vx, P.vy);
    const lag = moving > 14 ? drift : a + Math.PI;
    const flutter = Math.sin(windT) * 0.18 + Math.sin(windT * 2.3) * 0.07;
    const len = 30 + Math.min(16, moving * 0.055);
    const bx = shx - Math.cos(a) * 4, by = shy - Math.sin(a) * 4;
    const tipA = lag + flutter;
    const tx = bx + Math.cos(tipA) * len, ty = by + Math.sin(tipA) * len;
    const midA = lag + flutter * 0.45;
    const mx = bx + Math.cos(midA) * len * 0.55, my = by + Math.sin(midA) * len * 0.55;
    const spread = 11 + Math.sin(windT * 1.5) * 2.2;
    const ppx = -Math.sin(tipA), ppy = Math.cos(tipA);
    /* the set's own cape (js/33a-gear-art-capes.js); the plain cloth below is the fallback */
    const designed = typeof capeDraw === 'function' && P.capeSet && capeDraw(ctx, P.capeSet, { bx: bx, by: by, tipA: tipA, tx: tx, ty: ty, mx: mx, my: my, len: len, spread: spread, px: px, py: py, ppx: ppx, ppy: ppy, a: a, moving: moving, color: gAcc || P.capeColor, t: G.time, level: P.capeLevel || 1 });
    if (!designed){
    ctx.fillStyle = gAcc || P.capeColor;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(bx + px * 7, by + py * 7);
    ctx.quadraticCurveTo(mx + ppx * spread * 0.8, my + ppy * spread * 0.8, tx + ppx * spread, ty + ppy * spread);
    ctx.quadraticCurveTo(tx, ty + 1, tx - ppx * spread, ty - ppy * spread);
    ctx.quadraticCurveTo(mx - ppx * spread * 0.8, my - ppy * spread * 0.8, bx - px * 7, by - py * 7);
    ctx.closePath(); ctx.fill();
    /* fold shading down the centre so the cloth has some form */
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#1C1410';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx + ppx * 2, my + ppy * 2, tx + ppx * 3, ty + ppy * 3);
    ctx.quadraticCurveTo(tx, ty, tx - ppx * 3, ty - ppy * 3);
    ctx.quadraticCurveTo(mx - ppx * 2, my - ppy * 2, bx, by);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    /* collar clasp at the shoulders */
    fillCircle(ctx, bx, by, 3.4, gAcc || P.capeColor);
    fillCircle(ctx, bx, by, 1.6, '#FFF3CC');
    }
  }

  /* head */
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a + (cv ? cv.turn * 0.6 : 0));
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(10, 0, 5.4, 4.4, 0, 0, TAU); ctx.fill();
  fillCircle(ctx, 13, -1.8, 1.1, '#2B1D12');
  fillCircle(ctx, 13, 1.8, 1.1, '#2B1D12');
  /* ossicones */
  ctx.strokeStyle = dark; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(-3, -4.6); ctx.lineTo(-6, -8.6); ctx.moveTo(-3, 4.6); ctx.lineTo(-6, 8.6); ctx.stroke();
  fillCircle(ctx, -6.4, -9, 2.3, '#4A2E12');
  fillCircle(ctx, -6.4, 9, 2.3, '#4A2E12');
  /* ears */
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.ellipse(-6, -7.5, 4.4, 2.3, -0.7 - GF.ear, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-6, 7.5, 4.4, 2.3, 0.7, 0, TAU); ctx.fill();
  if (Settings.showGear && trinketEquipped('limehelmet')){
    ctx.fillStyle = '#5E9A2A';
    ctx.beginPath(); ctx.ellipse(-4, 0, 6.2, 6.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9BE04A';
    ctx.beginPath(); ctx.ellipse(-4.4, 0, 5.2, 5.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(240,255,210,.7)';
    ctx.beginPath(); ctx.ellipse(-5.6, -2, 2, 1.3, -0.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5E9A2A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0.5, 0); ctx.stroke();
  }
  const hatAcc = typeof accEquipped === 'function' ? accEquipped('hat') : null;                      /* a hat won from the minigames */
  if (hatAcc && hatAcc.id !== 'bag'){ if (rim) ctx.shadowBlur = 0; drawHatOnHeadTop(ctx, hatAcc.id, G.time); }     /* set back and tipped back, clear of her eyes */
  /* eyes */
  if (rim) ctx.shadowBlur = 0;
  if (GF.blink > 0){
    ctx.strokeStyle = '#20140C'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-0.6, -5.4); ctx.lineTo(3.4, -5.4); ctx.moveTo(-0.6, 5.4); ctx.lineTo(3.4, 5.4); ctx.stroke();
    ctx.lineCap = 'butt';
  } else {
    fillCircle(ctx, 1, -5.4, 2.5, '#FFFFFF');
    fillCircle(ctx, 1, 5.4, 2.5, '#FFFFFF');
    fillCircle(ctx, 2.2, -5.4, 1.4, '#20140C');
    fillCircle(ctx, 2.2, 5.4, 1.4, '#20140C');
  }
  if (hatAcc && hatAcc.id === 'bag'){ if (rim) ctx.shadowBlur = 0; drawHatOnHeadTop(ctx, 'bag', G.time); }          /* the paper bag goes over the face, eyes and all */
  if (G.biome === 'moon' || G.biome === 'venus' || G.biome === 'mars'){   /* no air up here: the glass helmet from the ending, and its neck ring */
    ctx.fillStyle = '#C8CCD4'; ctx.fillRect(-12, -6.6, 4, 13.2); ctx.strokeStyle = '#6E7480'; ctx.lineWidth = 1; ctx.strokeRect(-12, -6.6, 4, 13.2);
    const hg = ctx.createRadialGradient(-1, -3, 2, 2, 0, 15); hg.addColorStop(0, 'rgba(225,240,255,.14)'); hg.addColorStop(0.75, 'rgba(160,205,255,.12)'); hg.addColorStop(1, 'rgba(230,242,255,.4)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(2, 0, 15, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(235,245,255,.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(2, 0, 15, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(2, 0, 11, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
    fillCircle(ctx, -8, 0, 1.4, '#FF5A4A');
  }
  if (typeof weaponArtHead === 'function'){ if (rim) ctx.shadowBlur = 0; weaponArtHead(ctx); }       /* fangs, lances and clubs, in the head's space */
  ctx.restore();

  if (rim){ ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)'; }
  ctx.globalAlpha = 1;
  if (P.rage > 2){
    ringPath(ctx, P.x, P.y, 34 + P.rage * 0.35, 2, '#FF5A3C', 0.1 + Math.min(0.3, P.rage * 0.008));
  }
}

