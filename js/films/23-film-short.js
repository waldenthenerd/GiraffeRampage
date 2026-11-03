'use strict';
/* The short travel films between chapters. */
/* ======================= THE SHORT TRAVEL FILMS (the end of Chapters 1-6, 9 and 10) ======================= */
/* Each is 8-10 seconds long: the giraffe on the move from the place she has just cleared to the next one. Chapters 1-6 are a walk (or a wade) in
   which the scenery fades from one place into the other; Chapter 9 stays on Venus, where more fire aliens come in over the battlefield; Chapter 10
   is the spaceplane's flight home. Like the other films, every frame is a pure function of time. */
const SH_LOC = {
  savanna: { sky: ['#3F78C4', '#BBD8F0'], gnd: ['#9A8450', '#6A5A30'], ridge: '#7A6A48' },
  snow:    { sky: ['#9CB4C8', '#E6EEF4'], gnd: ['#E8F0F6', '#B8CAD8'], ridge: '#B8CCDC' },
  swamp:   { sky: ['#4A5A3A', '#9AAA70'], gnd: ['#3E4A2C', '#2A3420'], ridge: '#4A5A3A' },
  ocean:   { sky: ['#2A78B0', '#A8D8F0'], gnd: ['#1E6AA0', '#0F3A60'], ridge: '#6AA8D0', water: true },
  jungle:  { sky: ['#5AA050', '#C8E0A0'], gnd: ['#2A4A1C', '#1A2E10'], ridge: '#2E5A2A' },
  city:    { sky: ['#6A7A98', '#E0C898'], gnd: ['#4A4A50', '#2E2E34'], ridge: '#8A92A8' },
  space:   { sky: ['#4A8AD0', '#C8E4F8'], gnd: ['#6A7A5A', '#4A5A3A'], ridge: '#8AA0B0' }
};
const SH_FILMS = {
  1:  { from: 'savanna', to: 'snow',   title: 'FROSTREACH',       sub: 'The giraffe treks north, into the snow', T: 8 },
  2:  { from: 'snow',    to: 'swamp',  title: 'MURKFEN',          sub: 'The giraffe wades on, into the swamp', T: 8 },
  3:  { from: 'swamp',   to: 'ocean',  title: 'THE DEEP',         sub: 'The giraffe swims on, into open water', T: 8 },
  4:  { from: 'ocean',   to: 'jungle', title: 'THE CANOPY',       sub: 'The giraffe washes ashore, into the rainforest', T: 8 },
  5:  { from: 'jungle',  to: 'city',   title: 'HOUSTON',          sub: 'The giraffe wanders out of the forest into an empty city', T: 8 },
  6:  { from: 'city',    to: 'space',  title: 'THE SPACE CENTER', sub: 'The giraffe follows the freeway south-east', T: 8 },
  9:  { special: 'inferno', title: 'THE INFERNO', sub: 'The fire is not finished. More are coming.', T: 10 }
};
function shLen(n){ return SH_FILMS[n] ? SH_FILMS[n].T : 8; }
function shChapterOf(kind){ return /^sh\d+$/.test(kind || '') ? +kind.slice(2) : 0; }
/* the horizon's hills, and the things that stand on the ground, for each place; a is how visible that place is while the two blend */
function shBack(ctx, name, sc, a){
  ctx.globalAlpha = a; afRidge(ctx, 462, name === 'ocean' ? 4 : 60, 2.7 + name.length, SH_LOC[name].ridge, sc * 0.1); ctx.globalAlpha = 1;
}
function shFront(ctx, name, sc, a, hy){
  if (a < 0.01 || name === 'ocean') return;
  ctx.globalAlpha = a;
  const N = name === 'city' ? 14 : 8;
  for (let k = 0; k < N; k++){
    const par = 0.75 + csR(k + 11100) * 0.5, y = hy + 8 + csR(k + 11200) * 70, s = 0.7 + csR(k + 11300) * 0.7 + (y - hy) / 200;
    const x = (((csR(k + 11000 + name.length * 7) * 2200 - sc * par) % 2200) + 2200) % 2200 - 400;
    if (name === 'snow' || name === 'swamp' || name === 'jungle'){ ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(x + 6 * s, y + 2 * s, (name === 'snow' ? 34 : name === 'swamp' ? 36 : 46) * s, 7 * s, 0, 0, TAU); ctx.fill(); }          /* each stands on a shadow */
    if (name === 'savanna'){                                                                                 /* daylight acacias: a brown trunk and an olive canopy, not a black silhouette */
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + 8 * s, y + 2 * s, 46 * s, 7 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5A3E26'; ctx.beginPath(); ctx.moveTo(x - 6 * s, y); ctx.lineTo(x - 3 * s, y - 62 * s); ctx.lineTo(x + 3 * s, y - 62 * s); ctx.lineTo(x + 7 * s, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5E6A2E'; ctx.beginPath(); ctx.ellipse(x, y - 70 * s, 58 * s, 15 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7E8A3E'; ctx.beginPath(); ctx.ellipse(x - 4 * s, y - 76 * s, 44 * s, 10 * s, 0, 0, TAU); ctx.fill();
    }
    else if (name === 'snow'){
      ctx.fillStyle = '#4A3A2A'; ctx.fillRect(x - 3 * s, y - 14 * s, 6 * s, 14 * s);
      for (let i = 0; i < 3; i++){ ctx.fillStyle = i % 2 ? '#2E5A46' : '#3A6A52'; ctx.beginPath(); ctx.moveTo(x - (34 - i * 8) * s, y - (10 + i * 26) * s); ctx.lineTo(x, y - (60 + i * 26) * s); ctx.lineTo(x + (34 - i * 8) * s, y - (10 + i * 26) * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F4F8FA'; ctx.beginPath(); ctx.moveTo(x - 12 * s, y - (38 + i * 26) * s); ctx.lineTo(x, y - (60 + i * 26) * s); ctx.lineTo(x + 12 * s, y - (38 + i * 26) * s); ctx.closePath(); ctx.fill(); }
    } else if (name === 'swamp'){
      ctx.fillStyle = '#2A2A1A'; ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x - 5 * s, y - 90 * s); ctx.lineTo(x + 5 * s, y - 90 * s); ctx.lineTo(x + 14 * s, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4A5A32'; ctx.beginPath(); ctx.ellipse(x, y - 96 * s, 46 * s, 16 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8A9A6A'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -3; i <= 3; i++){ ctx.moveTo(x + i * 12 * s, y - 90 * s); ctx.lineTo(x + i * 12 * s + 3, y - (50 + Math.abs(i) * 6) * s); } ctx.stroke();
    } else if (name === 'jungle'){
      ctx.fillStyle = '#3A2A1A'; ctx.fillRect(x - 8 * s, y - 130 * s, 16 * s, 130 * s);
      for (const [dx, dy, r] of [[0, -150, 50], [-34, -128, 38], [34, -130, 40]]){ ctx.fillStyle = '#1E4A1E'; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#2E6A2A'; ctx.beginPath(); ctx.arc(x + dx * s - 6 * s, y + dy * s - 6 * s, r * s * 0.6, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#3E7A2E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 120 * s); ctx.quadraticCurveTo(x + 18 * s, y - 70 * s, x + 4 * s, y - 20 * s); ctx.stroke();
    } else if (name === 'city'){
      const w = 40 + csR(k + 11400) * 50, h = 90 + csR(k + 11500) * 220;
      ctx.fillStyle = '#3A3E52'; ctx.fillRect(x - w / 2, y - h, w, h); ctx.fillStyle = '#2A2E42'; ctx.fillRect(x - w / 2, y - h, 6, h);
      for (let wy = y - h + 10; wy < y - 14; wy += 18) for (let wx = x - w / 2 + 10; wx < x + w / 2 - 8; wx += 14){ ctx.fillStyle = csR(wx * 3 + wy) > 0.6 ? '#FFD890' : '#4A5068'; ctx.fillRect(wx, wy, 7, 9); }
    } else if (name === 'space'){
      if (k < 2){                                                                                           /* a rocket on its pad, with a gantry beside it */
        const rx = x + k * 0, h = 260 * (0.8 + s * 0.3);
        ctx.fillStyle = '#F4F6FA'; ctx.fillRect(rx - 22, y - h, 44, h); ctx.beginPath(); ctx.moveTo(rx - 22, y - h); ctx.lineTo(rx, y - h - 60); ctx.lineTo(rx + 22, y - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#C8302A'; ctx.fillRect(rx - 22, y - h + 40, 44, 14); ctx.fillStyle = '#2A2E3A'; ctx.fillRect(rx - 22, y - 30, 44, 30);
        ctx.strokeStyle = '#6A6E7A'; ctx.lineWidth = 3; ctx.strokeRect(rx + 34, y - h * 0.9, 18, h * 0.9); ctx.beginPath(); for (let gy2 = y - h * 0.9; gy2 < y; gy2 += 24){ ctx.moveTo(rx + 34, gy2); ctx.lineTo(rx + 52, gy2 + 24); } ctx.moveTo(rx + 34, y - h * 0.7); ctx.lineTo(rx + 22, y - h * 0.7); ctx.stroke();
      } else {
        const w = 60 + csR(k + 11600) * 60, h = 36 + csR(k + 11700) * 44;
        ctx.fillStyle = '#9AA6B8'; ctx.fillRect(x - w / 2, y - h, w, h); ctx.fillStyle = '#6A7A98'; ctx.fillRect(x - w / 2, y - h, w, 6);
        ctx.fillStyle = '#5A8AC8'; for (let wx = x - w / 2 + 8; wx < x + w / 2 - 10; wx += 16) ctx.fillRect(wx, y - h + 14, 9, 10);
      }
    }
  }
  ctx.globalAlpha = 1;
}
/* the small things on each place's ground (js/films/23b-film-detail.js), faded in and out with it; drawn before what stands on the ground */
function shGround(ctx, name, sc, a, hy, t){
  if (a < 0.01) return;
  ctx.globalAlpha = a; const y0 = hy + 6, y1 = CS_H - 6;
  if (name === 'savanna'){
    fdMounds(ctx, { n: 3, seed: 21000, sc: sc, y0: hy + 10, y1: hy + 40, col: '#8A6A3E', hi: '#B08A52' });
    fdStones(ctx, { n: 16, seed: 21100, sc: sc, y0: y0, y1: y1, col: '#B8A274', dk: '#7A6A48' });
    fdGrass(ctx, { n: 46, seed: 21200, sc: sc, t: t, y0: y0, y1: y1, col: '#7A6A34', hi: '#C8B060' });
  } else if (name === 'snow'){
    ctx.fillStyle = 'rgba(160,184,206,.35)'; for (let i = 0; i < 9; i++){ const f = csR(21300 + i), x = fdWrap(csR(21310 + i) * 1500 - sc * (0.6 + f * 0.7), -140, 1500), y = y0 + 10 + f * (y1 - y0 - 20); ctx.beginPath(); ctx.ellipse(x, y, 60 + f * 70, 4 + f * 4, 0, 0, TAU); ctx.fill(); }   /* the blue shade of drifts */
    fdStones(ctx, { n: 10, seed: 21400, sc: sc, y0: y0, y1: y1, col: '#8A96A4', dk: '#5A6674' });
    for (let i = 0; i < 26; i++){ const x = fdWrap(csR(21500 + i) * 1500 - sc * 1.2, -20, 1500), y = y0 + csR(21550 + i) * (y1 - y0), on = Math.sin(t * 5 + i * 2.7) > 0.7; if (on) fillCircle(ctx, x, y, 1.4, '#FFFFFF'); }   /* glints of ice in the snow */
  } else if (name === 'swamp'){
    ctx.fillStyle = 'rgba(30,44,26,.55)'; for (let i = 0; i < 7; i++){ const f = csR(21600 + i), x = fdWrap(csR(21610 + i) * 1500 - sc * (0.6 + f * 0.7), -140, 1500), y = y0 + 12 + f * (y1 - y0 - 24); ctx.beginPath(); ctx.ellipse(x, y, 70 + f * 60, 6 + f * 5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(160,190,140,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 40 + f * 30 + Math.sin(t * 2 + i) * 6, 3 + f * 3, 0, 0, TAU); ctx.stroke(); }   /* pools with a ring spreading */
    for (let i = 0; i < 12; i++){ const f = csR(21700 + i), x = fdWrap(csR(21710 + i) * 1500 - sc * (0.6 + f * 0.7), -40, 1500), y = y0 + 8 + f * (y1 - y0 - 16), r = 6 + f * 6; ctx.fillStyle = '#4E7A34'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.4, 0, 0.25, TAU - 0.25); ctx.lineTo(x, y); ctx.fill(); if (i % 4 === 0) fillCircle(ctx, x + r * 0.3, y - 2, 2.2, '#F4C8D8'); }   /* lily pads, a few in flower */
    fdGrass(ctx, { n: 30, seed: 21800, sc: sc, t: t, y0: y0, y1: y1, s: 1.5, col: '#5A6A34', hi: '#8A9A50' });
  } else if (name === 'jungle'){
    fdStones(ctx, { n: 10, seed: 21900, sc: sc, y0: y0, y1: y1, col: '#5A6A3A', dk: '#2E3A1E' });
    for (let i = 0; i < 16; i++){ const f = csR(22000 + i), x = fdWrap(csR(22010 + i) * 1500 - sc * (0.6 + f * 0.7), -60, 1500), y = y0 + f * (y1 - y0), s = 0.6 + f * 0.8; ctx.fillStyle = i % 2 ? '#2E6A2A' : '#3E7A32';
      for (let k = -2; k <= 2; k++){ const an = -Math.PI / 2 + k * 0.42 + Math.sin(t * 1.4 + i) * 0.05; ctx.beginPath(); ctx.ellipse(x + Math.cos(an) * 12 * s, y + Math.sin(an) * 12 * s, 12 * s, 3.4 * s, an, 0, TAU); ctx.fill(); }   /* ferns */
      if (i % 3 === 0) fillCircle(ctx, x + 6 * s, y - 4 * s, 2.6 * s, i % 2 ? '#FF6A8A' : '#FFD84A'); }
  } else if (name === 'city'){
    ctx.fillStyle = 'rgba(232,224,200,.55)'; for (let x = fdWrap(-sc * 1.3, -200, 200); x < CS_W; x += 200) ctx.fillRect(x, hy + 62, 90, 4);   /* the lane line of the road she walks along */
    fdCracks(ctx, { n: 14, seed: 22100, sc: sc * 1.2, y0: y0, y1: y1 });
    fdSkids(ctx, { n: 5, seed: 22200, sc: sc * 1.2, y0: hy + 30, y1: hy + 110 });
    for (let i = 0; i < 6; i++){ const x = fdWrap(csR(22300 + i) * 1500 - sc * 1.25, -60, 1500), y = y1 - 30 - csR(22310 + i) * 40; ctx.fillStyle = '#7A7E8A'; ctx.fillRect(x - 10, y - 3, 20, 6); ctx.fillStyle = '#2A2E3A'; for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * 4 - 0.6, y - 3, 1.2, 6); }   /* drain grates */
  } else if (name === 'space'){
    fdCracks(ctx, { n: 10, seed: 22400, sc: sc * 1.2, y0: y0, y1: y1, col: 'rgba(30,40,24,.3)' });
    fdGrass(ctx, { n: 26, seed: 22500, sc: sc, t: t, y0: y0, y1: y1, col: '#5A6A3A', hi: '#8A9A5A' });
    ctx.fillStyle = 'rgba(244,192,64,.75)'; for (let x = fdWrap(-sc * 1.3, -160, 160); x < CS_W; x += 160) ctx.fillRect(x, hy + 40, 70, 3);   /* the access road's center line */
  }
  ctx.globalAlpha = 1;
}
/* small parts on what stands on each place's ground: leaves, moss, lights, aerials (drawn after shFront, with the same positions) */
function shFrontDetail(ctx, name, sc, a, hy, t){
  if (a < 0.01 || name === 'ocean') return;
  ctx.globalAlpha = a;
  const N = name === 'city' ? 14 : 8;
  for (let k = 0; k < N; k++){
    const par = 0.75 + csR(k + 11100) * 0.5, y = hy + 8 + csR(k + 11200) * 70, s = 0.7 + csR(k + 11300) * 0.7 + (y - hy) / 200;
    const x = (((csR(k + 11000 + name.length * 7) * 2200 - sc * par) % 2200) + 2200) % 2200 - 400;
    if (x < -150 || x > CS_W + 150) continue;
    if (name === 'savanna'){
      ctx.fillStyle = '#4A5626'; for (let i = 0; i < 9; i++){ const a2 = i / 9 * TAU; ctx.beginPath(); ctx.ellipse(x + Math.cos(a2) * 40 * s, y - 70 * s + Math.sin(a2) * 9 * s, 9 * s, 4 * s, 0, 0, TAU); ctx.fill(); }   /* clumps of leaves round the canopy's edge */
      ctx.strokeStyle = '#4A3420'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(x, y - 58 * s); ctx.lineTo(x - 22 * s, y - 68 * s); ctx.moveTo(x + 1, y - 56 * s); ctx.lineTo(x + 26 * s, y - 70 * s); ctx.stroke();   /* branches into the canopy */
      if (k % 3 === 0){ const nx = x + 30 * s, ny = y - 62 * s + Math.sin(t * 1.5 + k) * 1.5; ctx.strokeStyle = '#8A7040'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(nx, y - 66 * s); ctx.lineTo(nx, ny); ctx.stroke(); ctx.fillStyle = '#A88A50'; ctx.beginPath(); ctx.ellipse(nx, ny + 4 * s, 4 * s, 5 * s, 0, 0, TAU); ctx.fill(); }   /* a weaver bird's nest */
    } else if (name === 'snow'){
      ctx.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 3; i++){ const yy = y - (14 + i * 26) * s; ctx.beginPath(); ctx.ellipse(x - (22 - i * 6) * s, yy, 9 * s, 3 * s, 0, 0, TAU); ctx.ellipse(x + (22 - i * 6) * s, yy, 9 * s, 3 * s, 0, 0, TAU); ctx.fill(); }   /* snow lying on the boughs */
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.ellipse(x, y - 1, 16 * s, 3 * s, 0, 0, TAU); ctx.fill();
    } else if (name === 'swamp'){
      ctx.strokeStyle = 'rgba(120,140,90,.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = -2; i <= 2; i++){ const hx = x + i * 18 * s, L = (22 + csR(k * 7 + i + 22600) * 26) * s, sw = Math.sin(t * 1.2 + i + k) * 3; ctx.moveTo(hx, y - 96 * s); ctx.quadraticCurveTo(hx + sw, y - 96 * s + L * 0.6, hx + sw * 1.4, y - 96 * s + L); } ctx.stroke();   /* hanging moss */
      ctx.fillStyle = '#2A2A1A'; for (const sd of [-1, 1]){ ctx.beginPath(); ctx.moveTo(x + sd * 10 * s, y - 10 * s); ctx.quadraticCurveTo(x + sd * 22 * s, y - 4 * s, x + sd * 26 * s, y + 2); ctx.lineTo(x + sd * 18 * s, y + 2); ctx.closePath(); ctx.fill(); }   /* knees of roots */
    } else if (name === 'jungle'){
      ctx.strokeStyle = 'rgba(30,20,12,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < 6; i++){ ctx.moveTo(x - 6 * s, y - (20 + i * 18) * s); ctx.lineTo(x + 4 * s, y - (24 + i * 18) * s); } ctx.stroke();   /* bark rings */
      for (let i = 0; i < 5; i++){ const fx = x + (csR(k * 5 + i + 22700) - 0.5) * 90 * s, fy = y - (120 + csR(k * 5 + i + 22750) * 50) * s; fillCircle(ctx, fx, fy, 2.6 * s, i % 2 ? '#FF6A8A' : '#FFD84A'); }   /* flowers in the canopy */
      ctx.strokeStyle = '#3E7A2E'; ctx.lineWidth = 1.6; ctx.beginPath(); const lv = x - 30 * s, sw = Math.sin(t * 1.1 + k) * 4; ctx.moveTo(lv, y - 130 * s); ctx.quadraticCurveTo(lv + sw, y - 90 * s, lv + sw * 1.6, y - 54 * s); ctx.stroke(); fillCircle(ctx, lv + sw * 1.6, y - 54 * s, 2.2, '#4E8A3A');   /* a vine with a leaf at its end */
    } else if (name === 'city'){
      const w = 40 + csR(k + 11400) * 50, h = 90 + csR(k + 11500) * 220;
      ctx.fillStyle = '#2A2E42'; ctx.fillRect(x - w / 2 - 2, y - h - 4, w + 4, 4);                                   /* the parapet */
      if (k % 3 === 0){ ctx.fillStyle = '#4A4E62'; ctx.fillRect(x - 8, y - h - 18, 16, 14); ctx.fillRect(x - 6, y - h - 4, 2, 4); ctx.fillRect(x + 4, y - h - 4, 2, 4); }   /* a water tank */
      else if (k % 3 === 1) fdAerial(ctx, x + w * 0.25, y - h - 4, 26, t, '#3A3E52');
      ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = y - h + 26; yy < y - 20; yy += 36) ctx.fillRect(x - w / 2, yy, w, 2);   /* floor lines */
    } else if (name === 'space'){
      if (k < 2){ const h = 260 * (0.8 + s * 0.3); fdRivets(ctx, x - 20, y - h + 8, x - 20, y - 40, 12, 1.2, 'rgba(120,124,140,.6)'); ctx.fillStyle = '#2A2E3A'; ctx.font = '700 11px sans-serif'; ctx.save(); ctx.translate(x + 4, y - h * 0.5); ctx.rotate(-Math.PI / 2); ctx.fillText('USA', 0, 0); ctx.restore(); fdLamp(ctx, x + 43, y - h * 0.9 - 4, 2.2, '#FF4A3A', Math.sin(t * 3 + k) > 0); }   /* the rocket's seams and lettering, a lamp on the gantry */
      else { const w = 60 + csR(k + 11600) * 60, h = 36 + csR(k + 11700) * 44; fdDish(ctx, x + w * 0.3, y - h, 0.7, t); }
    }
  }
  ctx.globalAlpha = 1;
}
/* the sea's own small things: gulls, foam caps and a fin now and then */
function shSea(ctx, a, sc, hy, t){
  if (a < 0.01) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 24; i++){ const f = csR(22800 + i), x = fdWrap(csR(22810 + i) * 1500 - sc * (0.6 + f * 0.8), -40, 1500), y = hy + 10 + f * (CS_H - hy - 20), w = (10 + f * 26) * (0.6 + 0.4 * Math.sin(t * 2 + i)); ctx.beginPath(); ctx.ellipse(x, y, w, 1.6 + f, 0, 0, TAU); ctx.fill(); }   /* white caps */
  const fx = fdWrap(900 - sc * 0.9, -100, 1500), fy = hy + 70 + Math.sin(t * 1.3) * 3; ctx.fillStyle = '#2A4A68'; ctx.beginPath(); ctx.moveTo(fx - 12, fy); ctx.quadraticCurveTo(fx - 2, fy - 22, fx + 10, fy - 24); ctx.quadraticCurveTo(fx + 4, fy - 10, fx + 12, fy); ctx.closePath(); ctx.fill();   /* a dolphin's fin */
  ctx.globalAlpha = 1;
}
function shWalk(ctx, t, f){
  const A = SH_LOC[f.from], B = SH_LOC[f.to], p = csSm(2.0, 5.0, t), hy = 470, sc = t * 150;
  afSky(ctx, csHex(A.sky[0], B.sky[0], p), csHex(csHex(A.sky[0], A.sky[1], 0.5), csHex(B.sky[0], B.sky[1], 0.5), p), csHex(A.sky[1], B.sky[1], p));
  csGlow(ctx, 1000, 140, 260, '#FFF0C8', 0.25);
  afClouds(ctx, sc * 0.3, 5, 50, 250, 0.45, '#FFFFFF');
  const birdA = (f.from === 'snow' || f.from === 'space' ? 0 : 1 - p) + (f.to === 'snow' || f.to === 'space' ? 0 : p);
  if (birdA > 0.02){ ctx.globalAlpha = birdA; fdBirds(ctx, { n: 5, seed: 23000 + f.from.length, t: t, y0: 90, y1: 260, v: 26, col: f.to === 'ocean' || f.from === 'ocean' ? 'rgba(250,250,250,.75)' : 'rgba(40,34,30,.55)' }); ctx.globalAlpha = 1; }   /* birds, or gulls over the sea */
  shBack(ctx, f.from, sc, 1 - p); shBack(ctx, f.to, sc, p);
  const g = ctx.createLinearGradient(0, hy, 0, CS_H); g.addColorStop(0, csHex(A.gnd[0], B.gnd[0], p)); g.addColorStop(1, csHex(A.gnd[1], B.gnd[1], p)); ctx.fillStyle = g; ctx.fillRect(0, hy, CS_W, CS_H - hy);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 30; k++){ const x = (((csR(k + 11800) * 1500 - sc * 1.4) % 1500) + 1500) % 1500 - 100, y = hy + 20 + csR(k + 11900) * (CS_H - hy - 40); ctx.fillRect(x, y, 20 + csR(k + 11950) * 40, 2); }
  shGround(ctx, f.from, sc, 1 - p, hy, t); shGround(ctx, f.to, sc, p, hy, t);
  if (A.water || B.water) shSea(ctx, A.water ? 1 - p : p, sc, hy, t);
  shFront(ctx, f.from, sc, 1 - p, hy); shFront(ctx, f.to, sc, p, hy);
  shFrontDetail(ctx, f.from, sc, 1 - p, hy, t); shFrontDetail(ctx, f.to, sc, p, hy, t);
  const ws = (f.from === 'snow' ? 1 - p : 0) + (f.to === 'snow' ? p : 0);
  const wa = (A.water ? 1 - p : 0) + (B.water ? p : 0);
  if (wa < 0.95){ ctx.fillStyle = 'rgba(0,0,0,' + (0.28 * (1 - wa)).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(548, 614, 78, 11, 0, 0, TAU); ctx.fill(); }          /* her shadow on the ground, so she stands on it */
  csGiraffe(ctx, { x: 560, y: 612 + 20 * wa + Math.sin(t * 7) * 1.5, s: 0.95, face: 1, walk: t * 7, moving: true, neck: 0.3, head: 0.1, bare: true, boots: false });
  if (wa > 0.02){                                                                                       /* she is up to her knees, then deeper, in water */
    const wy = 580;
    ctx.beginPath(); ctx.moveTo(0, CS_H); ctx.lineTo(0, wy);
    for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 3) * 4);
    ctx.lineTo(CS_W, CS_H); ctx.closePath();
    const wg = ctx.createLinearGradient(0, wy, 0, CS_H); wg.addColorStop(0, 'rgba(70,170,220,' + 0.5 * wa + ')'); wg.addColorStop(1, 'rgba(20,80,140,' + 0.7 * wa + ')'); ctx.fillStyle = wg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,' + 0.5 * wa + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20){ const y = wy + Math.sin(x * 0.03 + t * 3) * 4; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  }
  const dry = (f.from === 'savanna' || f.from === 'city' || f.from === 'space' ? 1 - p : 0) + (f.to === 'savanna' || f.to === 'city' || f.to === 'space' ? p : 0);
  if (dry > 0.02) for (let k = 0; k < 6; k++){ const a = (t * 1.1 + k / 6) % 1; ctx.globalAlpha = 0.3 * dry * (1 - a); ctx.fillStyle = '#C8B490'; ctx.beginPath(); ctx.arc(520 - a * 120 + (k % 3) * 34, 612 - a * 14, 4 + a * 10, 0, TAU); ctx.fill(); }   /* a little dust from her hooves */
  ctx.globalAlpha = 1;
  const motes = { savanna: '#FFF0B8', swamp: '#E8FF8A', jungle: '#FFE0F0', city: '#FFE8C8' };
  for (const [nm, al] of [[f.from, 1 - p], [f.to, p]]) if (motes[nm] && al > 0.02) fdMotes(ctx, { n: nm === 'swamp' ? 22 : 14, seed: 23100 + nm.length * 50, t: t, y0: 300, y1: 700, v: nm === 'swamp' ? -0.05 : -0.04, r: nm === 'swamp' ? 2 : 1.4, a: 0.6 * al, col: motes[nm], sc: sc });   /* pollen, fireflies, petals, dust */
  if (ws > 0.02){ ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 60; k++){ ctx.globalAlpha = 0.85 * ws; ctx.beginPath(); ctx.arc(((csR(k + 12200) * 1400 + Math.sin(t + k) * 20 - sc * 0.2) % 1400 + 1400) % 1400 - 60, (csR(k + 12300) * 800 + t * 90 * (0.6 + csR(k + 12400))) % 800 - 40, 1.5 + csR(k + 12500) * 1.8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}
/* Chapter 9 into Chapter 10: the same battlefield, from above as in the game, and fire aliens flooding in from the east */
function shInferno(ctx, t){
  const z = venusBaseZone(), cx = z.x + 260, cy = z.y;
  const saved = { biome: G.biome, buildings: G.buildings, rocket: G.rocket, x: P.x, y: P.y, vx: P.vx, vy: P.vy, face: P.face, aim: P.aim, walk: P.walk, invuln: P.invuln, hurtT: P.hurtT, kickAnim: P.kickAnim };
  const keep = G.particles.length;
  ctx.save();
  try {
    G.biome = 'venus'; G.buildings = []; G.rocket = null;
    ctx.translate(CS_W / 2, CS_H / 2); ctx.translate(-cx, -cy);
    drawGroundVenus(ctx, cx, cy, CS_W, CS_H);
    const types = ['hyena', 'sword', 'cheetah', 'rhino', 'jackal', 'vulture', 'honeybadger', 'baboon'];
    for (let k = 0; k < 46; k++){
      const ts = 0.4 + k * 0.19; if (t < ts) continue;
      const u = csC((t - ts) / 3.2, 0, 1), e = 1 - Math.pow(1 - u, 3), th = (csR(k + 12000) - 0.5) * 2.2, d = 240 + csR(k + 12100) * 420;
      const dist = csLerp(1100, d, e), ex = z.x + Math.cos(th) * dist, ey = z.y + Math.sin(th) * dist, type = types[k % types.length], def = ETYPES_INFERNO[type];
      drawEnemy(ctx, { portrait: true, def: def, type: type, x: ex, y: ey, r: def.r, ang: Math.atan2(z.y - ey, z.x - ex), flash: 0, state: 'idle', anim: t * 6 + k, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 });
    }
    P.x = z.x; P.y = z.y; P.vx = 0; P.vy = 0; P.invuln = 0; P.hurtT = 0; P.kickAnim = 0; P.walk = 0; P.aim = 0; P.face = 0;
    drawPlayer(ctx);
  } catch (err) {}
  finally {
    ctx.restore();
    G.biome = saved.biome; G.buildings = saved.buildings; G.rocket = saved.rocket;
    P.x = saved.x; P.y = saved.y; P.vx = saved.vx; P.vy = saved.vy; P.face = saved.face; P.aim = saved.aim; P.walk = saved.walk; P.invuln = saved.invuln; P.hurtT = saved.hurtT; P.kickAnim = saved.kickAnim;
    if (G.particles.length > keep) G.particles.length = keep;
  }
  fdMotes(ctx, { n: 34, seed: 23300, t: t, v: -0.12, r: 1.8, a: 0.75, col: '#FFB050', wob: 18 });          /* embers rising off the battlefield */
  fdMotes(ctx, { n: 26, seed: 23400, t: t, v: 0.05, r: 1.5, a: 0.45, col: '#9A8A80', wob: 30 });           /* and ash coming down */
  const hz = csSm(0.5, 3, t); for (let k = 0; k < 5; k++){ const x = fdWrap(csR(23500 + k) * 1500 - t * 40, -200, 1500); csGlow(ctx, x, 690, 160, '#FF6A2A', 0.12 * hz); }   /* fire glow low along the ground */
}
function shScene(ctx, t, n){
  const f = SH_FILMS[n]; if (!f) return;
  if (f.special === 'inferno') shInferno(ctx, t);
  else shWalk(ctx, t, f);
}
function shOverlays(ctx, t, n){
  const f = SH_FILMS[n]; if (!f) return;
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, f.special === 'inferno' ? 'rgba(120,10,0,' + (0.35 + 0.12 * Math.sin(t * 5)) + ')' : 'rgba(0,0,0,.4)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  const c0 = f.special === 'inferno' ? 0.8 : 3.0, a = csSm(0, 0.3, t - c0) * (1 - csSm(3.3, 3.7, t - c0));
  if (a > 0.01){
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, 860, 84); ctx.fillStyle = f.special === 'inferno' ? '#FF8A3A' : '#FFD27A'; ctx.fillRect(0, 618, 5, 84);
    csText(ctx, f.title, 26, 652, 25, '#F4F8FF', 'left', '800'); csText(ctx, f.sub, 26, 682, 15, '#C8D0E0', 'left', '600'); ctx.globalAlpha = 1;
  }
  const fd = Math.max(1 - csSm(0, 0.8, t), csSm(f.T - 1.2, f.T, t));
  if (fd > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + fd + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
const SH_CUES = [];
(function(){
  const add = (t, fn) => SH_CUES.push([t, fn]);
  add(0.4, () => SFX.whoosh()); add(3.5, () => SFX.click()); add(6.5, () => SFX.whoosh());
  SH_CUES.sort((a, b) => a[0] - b[0]);
})();

