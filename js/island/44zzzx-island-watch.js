'use strict';
/* Chapter 17, the Island Lab: being watched, and what is hidden (the island is in js/island/44zzzt-island-map.js, the creatures in 44zzzu). */
/* ========================= BEING WATCHED ========================= */
/* Between the boss waves the scientist is never far: once a wave a figure in a white coat shows at a lab window, in a tank house doorway or out on the island with
   binoculars, and goes (a blind comes down, or it hurries off) when she comes close. Security cameras on poles at the fence gates and the lab turn to follow her, the
   lab's doors slide shut as she walks up to them, and on a few waves the lab's screens flicker on for one short line (ISLE_BRIEF).
   Five lab notes lie hidden on the island (ISLE_NOTES): walking over one keeps it for good (Save.data.isleNotes, a bit each), shows it on a card, and adds it to
   the Bestiary under the chapter; all five is the achievement Field Notes.
   The bosses make an entrance (ISLE_ENTER) instead of walking in from a vent: King Claw bursts out of a sand mound near her, the Stormjelly rises glowing out of a
   tide pool, Old Hammerhead's fin cuts through the shallows to her and it breaches, the Leviathan Eel's wake winds through the water before it surfaces, and
   Specimen Zero smashes out of the floor tank in the middle of the tank room, where it has been coiled under the glass all chapter (if she is not in the room,
   a security camera's feed shows it). While it comes in a boss cannot be hit and does not attack.
   And a hidden swimmer warns before it strikes: bubbles always rise from it, a fin and a ring show when it is about to come up, and once up it waits half a second. */
function ilOnIsle(){ return !!G.il && G.chapter === ISLE_CHAPTER && G.biome === 'isle'; }
function ilInView(x, y, m){ const z = G.zoom || 1, hw = G.W / z / 2 - (m || 0), hh = G.H / z / 2 - (m || 0); return Math.abs(x - G.camX) < hw && Math.abs(y - G.camY) < hh; }
SFX.clunk = function(){ this.tone('square', 150, 70, 0.14, 0.09, 0, 0, this.abilityGain); this.burst(0.08, 0.1, 900, 300, 1, 0, 'lowpass', this.abilityGain); };
SFX.glass = function(){ this.burst(0.22, 0.14, 5200, 2600, 2, 0, 'highpass', this.abilityGain); this.tone('triangle', 2400, 1700, 0.12, 0.05, 0.02, 0, this.abilityGain); };

/* where the scientist can be seen. 'win': in a lit pane of a building's front wall (x, y, w, h), 'door': standing in a doorway (ISLE_DOORS[d]), 'out': on the island */
const ISLE_SIGHT = [
  { k: 'win', x: 2924, y: 408, w: 49, h: 20 }, { k: 'win', x: 3114, y: 408, w: 49, h: 20 }, { k: 'win', x: 1160, y: 344, w: 40, h: 14 },
  { k: 'door', d: 0 }, { k: 'door', d: 1 }, { k: 'door', d: 3 },
  { k: 'out', x: 1180, y: 1150 }, { k: 'out', x: 2480, y: 1250 }, { k: 'out', x: 3330, y: 1050 }, { k: 'out', x: 1600, y: 1760 }, { k: 'out', x: 2600, y: 1760 },
  { k: 'out', x: 1000, y: 2690 }, { k: 'out', x: 3520, y: 2700 }
];
/* the doorways of the tank houses, the pump house and the lab block (exactly where their dark doorways are painted) */
const ISLE_DOORS = [[600, 398, 80, 32], [600, 778, 80, 32], [990, 342, 60, 28], [3016, 406, 60, 34]];
/* the security cameras, each on its own pole: four at the fence gates, one by the pump house, two at the lab block's front corners */
const ISLE_CAMS = [[1288, 912], [2112, 912], [2338, 912], [3288, 912], [1342, 390], [2818, 452], [3268, 452]];      /* (none under a palm's crown) */
/* the lab's screens on a few ordinary waves (by chapter wave) */
const ISLE_BRIEF = { 3: 'Hm. It swims. Somebody write that down.', 8: 'The jellies do not like it either. Noted.', 13: 'Still standing. Close the tank room doors.',
  18: 'Who left the pumps on? Oh. That was me.', 23: 'Wave twenty-three. I am packing up the notes.' };
/* the five lab notes: where each lies, which creature it is about, and what it says */
const ISLE_NOTES = [
  { x: 3760, y: 530, type: 'warthog', title: 'Specimen log 04: the Crab Tank', text: 'A shore crab, fed the growth serum for nine weeks. The shell kept thickening after we stopped. It now weighs as much as the jeep. Do not stand in front of it.' },
  { x: 760, y: 1200, type: 'jackal', title: 'Specimen log 11: the Eel Hound', text: 'A moray, trained alongside the guard dogs. It comes when it is called. It also comes when it is not.' },
  { x: 1640, y: 1880, type: 'vulture', title: 'Specimen log 17: the Jelly Drifter', text: 'A moon jelly, charged in the pump house. Cut one in half and you get two. Please stop cutting them in half.' },
  { x: 2850, y: 2760, type: 'cheetah', title: 'Specimen log 22: the Urchin Roller', text: 'A long-spined urchin, taught to roll down the tank ramp for its food. It has kept practising. On everything.' },
  { x: 3650, y: 520, type: 'wildfire', title: 'Specimen log 00: Specimen Zero', text: 'The first one. Everything else in this lab was learned from it. Keep the tank room pumps running at all times, and never open the floor tank.' }
];
const ISLE_FTANK = { x: 2100, y: 400, r: 86 };          /* the floor tank in the middle of the tank room */
function ilNotesFound(){ let n = 0; const b = Save.data ? Save.data.isleNotes | 0 : 0; for (let i = 0; i < 5; i++) if (b & (1 << i)) n++; return n; }

/* every frame of a run on the island */
function ilWatchTick(dt){
  const il = G.il, t = G.time;
  /* the scientist: one sighting a wave, somewhere she can see it */
  if (il.sightIn !== undefined && !il.sight && !il.glimpse){
    il.sightIn -= dt;
    if (il.sightIn <= 0){
      const can = [];
      for (let i = 0; i < ISLE_SIGHT.length; i++){ const s = ISLE_SIGHT[i], p = ilSightXY(s); if (ilInView(p.x, p.y, 70) && hyp(p.x - P.x, p.y - P.y) > 300 && (s.k !== 'door' || ilDoor(s.d).open > 0.9)) can.push(i); }
      if (can.length){ const i = can[Math.floor(Math.random() * can.length)], p = ilSightXY(ISLE_SIGHT[i]); il.sight = { i: i, t: 0, ph: 'look', x: p.x, y: p.y, a: 0, f: 0 }; il.sightIn = undefined; }
      else il.sightIn = 1;
    }
  }
  const sg = il.sight;
  if (sg){
    const s = ISLE_SIGHT[sg.i], d = hyp(P.x - sg.x, P.y - sg.y); sg.t += dt;
    if (sg.ph === 'look'){
      sg.a = Math.atan2(P.y - sg.y, P.x - sg.x); sg.f = Math.min(1, sg.f + dt * 3);
      if (d < 300 || sg.t > 6){ sg.ph = d < 300 ? 'duck' : 'leave'; sg.t = 0; if (s.k === 'win'){ ilShut(sg.i).want = 1; ilShut(sg.i).hold = 9; if (sg.ph === 'duck') sfx('clunk', 0.2, sg.x, sg.y); } else if (s.k === 'door'){ ilDoor(s.d).hold = 0; ilDoor(s.d).shut = true; sfx('clunk', 0.2, sg.x, sg.y); } }
    } else {
      if (s.k === 'out'){ const sp = sg.ph === 'duck' ? 300 : 90; sg.a = Math.atan2(sg.y - P.y, sg.x - P.x); sg.x += Math.cos(sg.a) * sp * dt; sg.y += Math.sin(sg.a) * sp * dt; }
      sg.f = Math.max(0, sg.f - dt * (sg.ph === 'duck' ? 1.4 : 0.9));
      if (sg.f <= 0 && (s.k !== 'win' || ilShut(sg.i).v > 0.98)) il.sight = null;
    }
  }
  /* the blinds behind the windows */
  if (il.shut) for (const k in il.shut){ const w = il.shut[k]; if (w.want && w.v >= 1){ w.hold -= dt; if (w.hold <= 0) w.want = 0; } w.v = clamp(w.v + (w.want ? dt * 4 : -dt * 0.8), 0, 1); }
  /* the doors: they slide shut as she walks up, and open again a while after she has gone */
  for (let i = 0; i < ISLE_DOORS.length; i++){
    const D = ISLE_DOORS[i], o = ilDoor(i), d = hyp(P.x - (D[0] + D[2] / 2), P.y - (D[1] + D[3] / 2));
    if (d < 230 && !P.dead){ if (!o.shut){ o.shut = true; sfx('clunk', 0.2, D[0] + D[2] / 2, D[1]); } o.hold = 0; }
    else if (o.shut && d > 380){ o.hold += dt; if (o.hold > 2.5) o.shut = false; }
    o.open = clamp(o.open + (o.shut ? -dt * 3.2 : dt * 0.9), 0, 1);
  }
  /* the cameras follow her when she is in reach, and sweep when she is not */
  il.cam = il.cam || ISLE_CAMS.map(function(){ return { a: Math.PI / 2, on: false }; });
  for (let i = 0; i < ISLE_CAMS.length; i++){ const c = il.cam[i], cx = ISLE_CAMS[i][0], cy = ISLE_CAMS[i][1]; c.on = !P.dead && hyp(P.x - cx, P.y - cy) < 700; c.a = turnTo(c.a, c.on ? Math.atan2(P.y - cy, P.x - cx) : Math.PI / 2 + Math.sin(t * 0.5 + i * 1.7) * 0.9, (c.on ? 3 : 0.8) * dt); }
  /* the screens' short word */
  if (il.brief){ if (il.brief.wait > 0) il.brief.wait -= dt; else { il.brief.t -= dt; if (il.brief.t <= 0) il.brief = null; } }
  if (il.feed && !il.glimpse){ il.feed.t -= dt; if (il.feed.t <= 0) il.feed = null; }
  /* the lab notes: walk over one to take it */
  if (Save.data && !P.dead && !G.attract){
    const had = Save.data.isleNotes | 0;
    for (let i = 0; i < ISLE_NOTES.length; i++){
      if (had & (1 << i)) continue; const N = ISLE_NOTES[i];
      if (hyp(P.x - N.x, P.y - N.y) < (P.r || 22) + 26){
        Save.data.isleNotes = had | (1 << i); Save.write(); il.noteCard = { i: i, t: 8, max: 8 };
        sfx('pickupS', 0.2); addText(N.x, N.y - 40, 'LAB NOTE ' + ilNotesFound() + ' / 5', '#C8F0E8', 18, true); burstParticles(N.x, N.y, 10, '#F4F0E2', 120, 2.4);
        break;
      }
    }
  }
  if (il.noteCard){ il.noteCard.t -= dt; if (il.noteCard.t <= 0) il.noteCard = null; }
}
function ilSightXY(s){ if (s.k === 'door'){ const D = ISLE_DOORS[s.d]; return { x: D[0] + D[2] / 2, y: D[1] + D[3] * 0.6 }; } return s.k === 'win' ? { x: s.x + s.w / 2, y: s.y + s.h / 2 } : { x: s.x, y: s.y }; }
function ilShut(i){ const il = G.il; il.shut = il.shut || {}; return il.shut[i] || (il.shut[i] = { v: 0, want: 0, hold: 0 }); }
function ilDoor(i){ const il = G.il || {}; il.door = il.door || []; return il.door[i] || (il.door[i] = { open: 1, shut: false, hold: 0 }); }
/* each wave: when the scientist will show, and whether the screens will say something */
const ilWatchBaseStartWave = startWave;
startWave = function(n){
  const r = ilWatchBaseStartWave.apply(this, arguments);
  if (chapterOf(n) === ISLE_CHAPTER && G.il){
    const cw = chapterWaveOf(n); G.il.sight = null;
    G.il.sightIn = n % 5 === 0 ? undefined : rand(5, 14);
    G.il.brief = ISLE_BRIEF[cw] ? { wait: 8, t: 4.4, max: 4.4, line: ISLE_BRIEF[cw] } : null;
  }
  return r;
};
const ilWatchBaseBld = updateBuildings;
updateBuildings = function(dt){ ilWatchBaseBld.apply(this, arguments); if (G.biome === 'isle' && G.chapter === ISLE_CHAPTER && G.il) ilWatchTick(dt); };

/* ---------------------------------------------------------------- drawing it, in the world (over the props, under the creatures) */
const ilWatchBaseDrawGround = drawGround;
drawGround = function(ctx, cx, cy, vw, vh){
  ilWatchBaseDrawGround.apply(this, arguments);
  if (G.biome !== 'isle') return;
  ilWatchWorld(ctx, cx - vw / 2, cy - vh / 2, cx + vw / 2, cy + vh / 2, G.time, G.state !== 'menu' && !!G.il);
};
function ilWatchWorld(ctx, x0, y0, x1, y1, t, live){
  const il = live ? G.il : null;
  if (ilOn(x0, y0, x1, y1, ISLE_FTANK.x, ISLE_FTANK.y, 260)) ilFloorTank(ctx, t, il);
  for (let i = 0; i < ISLE_DOORS.length; i++){ const D = ISLE_DOORS[i]; if (!ilOn(x0, y0, x1, y1, D[0], D[1], 120)) continue;
    const sg = il && il.sight, s = sg && ISLE_SIGHT[sg.i];
    if (s && s.k === 'door' && s.d === i && sg.f > 0) ilFigureDoor(ctx, D, sg, t);
    ilShutter(ctx, D[0], D[1], D[2], D[3], il ? ilDoor(i).open : 1);
  }
  for (let i = 0; i < ISLE_SIGHT.length; i++){ const s = ISLE_SIGHT[i]; if (s.k !== 'win' || !ilOn(x0, y0, x1, y1, s.x, s.y, 100)) continue; const sg = il && il.sight;
    if (sg && sg.i === i && sg.f > 0) ilFigureWin(ctx, s, sg, t);
    const v = il && il.shut && il.shut[i] ? il.shut[i].v : 0; if (v > 0) ilBlind(ctx, s.x, s.y, s.w, s.h, v);
  }
  if (il && il.sight && ISLE_SIGHT[il.sight.i].k === 'out' && ilOn(x0, y0, x1, y1, il.sight.x, il.sight.y, 60)) ilFigureOut(ctx, il.sight, t);
  for (let i = 0; i < ISLE_CAMS.length; i++){ const c = ISLE_CAMS[i]; if (!ilOn(x0, y0, x1, y1, c[0], c[1], 300)) continue; const st = il && il.cam ? il.cam[i] : { a: Math.PI / 2 + Math.sin(t * 0.5 + i * 1.7) * 0.9, on: false }; ilCamera(ctx, c[0], c[1], st.a, st.on, t, i); }
  if (live && Save.data) for (let i = 0; i < ISLE_NOTES.length; i++){ const N = ISLE_NOTES[i]; if ((Save.data.isleNotes | 0) & (1 << i) || !ilOn(x0, y0, x1, y1, N.x, N.y, 60)) continue; ilClipboard(ctx, N.x, N.y, (csR(i * 13 + 5) - 0.5) * 0.8, t, i); }
}
/* a roller shutter down over a doorway: open is 1 for up out of sight, 0 for shut */
function ilShutter(ctx, x, y, w, h, open){
  const sh = h * (1 - open); if (sh < 0.5) return;
  ctx.fillStyle = '#6A7678'; ctx.fillRect(x, y, w, sh); ctx.fillStyle = '#7E8A8C'; for (let yy = y + 2; yy < y + sh - 2; yy += 4) ctx.fillRect(x, yy, w, 1.6);
  ctx.fillStyle = '#4A5254'; ctx.fillRect(x, y, w, 3); if (sh > 6) ftHazard(ctx, x, y + sh - 4, w, 4);
}
/* a blind pulled down inside a window: slats */
function ilBlind(ctx, x, y, w, h, v){ const bh = h * v; ctx.fillStyle = '#C8C4B4'; ctx.fillRect(x, y, w, bh); ctx.fillStyle = 'rgba(90,90,80,.35)'; for (let yy = y + 2.5; yy < y + bh; yy += 3) ctx.fillRect(x, yy, w, 1); }
/* the scientist at a window: head and shoulders against the lit pane, the glasses catching the light */
function ilFigureWin(ctx, s, sg, t){
  ctx.save(); ctx.beginPath(); ctx.rect(s.x, s.y, s.w, s.h); ctx.clip(); ctx.globalAlpha = sg.f;
  ctx.fillStyle = '#B8F0E8'; ctx.fillRect(s.x, s.y, s.w, s.h);
  const cx = s.x + s.w / 2 + Math.sin(t * 0.8) * 2, k = s.h / 20, hy = s.y + s.h - 11 * k;
  ctx.fillStyle = '#1E2A2C'; ctx.beginPath(); ctx.ellipse(cx, s.y + s.h + 2 * k, 14 * k, 8 * k, 0, Math.PI, TAU); ctx.fill(); fillCircle(ctx, cx, hy, 5.4 * k, '#1E2A2C');
  ctx.fillStyle = '#3A4446'; ctx.beginPath(); ctx.arc(cx, hy - 1 * k, 5.6 * k, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  if (Math.sin(t * 2.3) > -0.3){ fillCircle(ctx, cx - 2 * k, hy + 0.5 * k, 1.2 * k, '#F2FFFC'); fillCircle(ctx, cx + 2 * k, hy + 0.5 * k, 1.2 * k, '#F2FFFC'); }
  ctx.restore();
}
/* the scientist in a doorway: a white coat in the dark, grey hair, the glasses */
function ilFigureDoor(ctx, D, sg, t){
  const x = D[0], y = D[1], w = D[2], h = D[3], cx = x + w / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = sg.f;
  ctx.fillStyle = '#E8ECEE'; ctx.beginPath(); ctx.moveTo(cx - 13, y + h); ctx.quadraticCurveTo(cx - 12, y + h - 13, cx - 5, y + h - 15); ctx.lineTo(cx + 5, y + h - 15); ctx.quadraticCurveTo(cx + 12, y + h - 13, cx + 13, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8D0D4'; ctx.beginPath(); ctx.moveTo(cx - 4, y + h - 15); ctx.lineTo(cx, y + h - 8); ctx.lineTo(cx + 4, y + h - 15); ctx.closePath(); ctx.fill();
  fillCircle(ctx, cx, y + h - 20, 5.6, '#E8C4A4'); ctx.fillStyle = '#C8C8C4'; ctx.beginPath(); ctx.arc(cx, y + h - 21, 6, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 0.9; for (const sd of [-1, 1]){ ctx.beginPath(); ctx.arc(cx + sd * 2.4, y + h - 20, 1.8, 0, TAU); ctx.stroke(); }
  if (Math.sin(t * 2.3) > 0.4) fillCircle(ctx, cx - 2.4, y + h - 20.6, 0.9, '#FFFFFF');
  ctx.restore();
}
/* the scientist out on the island, seen from above: shadow, white coat, grey hair, binoculars held up toward her */
function ilFigureOut(ctx, sg, t){
  const run = sg.ph !== 'look', a = sg.a, step = run ? Math.sin(t * 14) * 3 : 0;
  ctx.save(); ctx.globalAlpha = sg.f; ctx.translate(sg.x, sg.y); ctx.scale(1.35, 1.35);
  ctx.fillStyle = 'rgba(10,30,40,.28)'; ctx.beginPath(); ctx.ellipse(5, 8, 15, 11, 0, 0, TAU); ctx.fill();
  ctx.rotate(a);
  ctx.fillStyle = '#2A2E34'; ctx.beginPath(); ctx.ellipse(-3 + step, -5, 4, 3, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-3 - step, 5, 4, 3, 0, 0, TAU); ctx.fill();      /* shoes */
  ctx.fillStyle = '#E8ECEE'; ctx.beginPath(); ctx.ellipse(-2, 0, 9, 13, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8A969A'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#C8D0D4'; ctx.beginPath(); ctx.ellipse(-5, 0, 5, 11, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#B8C0C4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(4, 0); ctx.stroke();
  if (!run){ ctx.strokeStyle = '#E8ECEE'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9, -4); ctx.moveTo(0, 9); ctx.lineTo(9, 4); ctx.stroke(); ctx.lineCap = 'butt';
    tw_rr(ctx, 8, -6, 7, 5, 1.5, '#2A2E34'); tw_rr(ctx, 8, 1, 7, 5, 1.5, '#2A2E34'); if (Math.sin(t * 3) > 0.6){ fillCircle(ctx, 15, -3.5, 1.4, '#F2FFFC'); fillCircle(ctx, 15, 3.5, 1.4, '#F2FFFC'); } }
  else { ctx.strokeStyle = '#E8ECEE'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(-2 - step, -14); ctx.moveTo(0, 9); ctx.lineTo(-2 + step, 14); ctx.stroke(); ctx.lineCap = 'butt'; }
  fillCircle(ctx, 1, 0, 6.4, '#E8C4A4'); ctx.fillStyle = '#C8C8C4'; ctx.beginPath(); ctx.arc(1, 0, 6.8, Math.PI * 0.5, Math.PI * 1.5); ctx.fill(); ctx.strokeStyle = '#8A7A6A'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(1, 0, 6.6, 0, TAU); ctx.stroke();
  if (!run){ ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(5.5, -3); ctx.lineTo(5.5, 3); ctx.stroke(); }      /* the glasses' bridge, under the binoculars */
  ctx.restore();
}
/* a security camera on its own pole: the pole's top, the arm, the housing with its sun hood and lens, a red light when it has her; a faint cone where it looks */
function ilCamera(ctx, x, y, a, on, t, i){
  if (on){ ctx.fillStyle = 'rgba(255,90,74,.06)'; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24); ctx.arc(x, y, 300, a - 0.2, a + 0.2); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(10,30,40,.3)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 8, 7, 5, 0, 0, TAU); ctx.fill();
  fillCircle(ctx, x, y, 6.5, '#3A4244'); fillCircle(ctx, x, y, 4.2, '#8A9294'); fillCircle(ctx, x - 1, y - 1, 1.6, '#C8D0D2');
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = '#5A6264'; ctx.fillRect(0, -2, 8, 4);
  tw_rr(ctx, 6, -6, 22, 12, 3, '#D8DCDC'); ctx.fillStyle = '#B8BEC0'; ctx.fillRect(6, 2, 22, 4); ctx.fillStyle = '#3A4244'; ctx.fillRect(24, -7.5, 8, 15);
  fillCircle(ctx, 29, 0, 4, '#1A2224'); fillCircle(ctx, 29.6, -1, 1.5, '#7AF0E0');
  fillCircle(ctx, 10, -3, 1.8, on && Math.sin(t * 6 + i) > -0.2 ? '#FF4A3A' : '#5A2A22');
  ctx.restore();
}
/* a lab note on the ground: a clipboard, its paper and clip, a tag in the lab's green, and a glint now and then so it can be found */
function ilClipboard(ctx, x, y, a, t, i){
  const ph = (t * 0.5 + i * 0.37) % 1;
  ctx.strokeStyle = 'rgba(240,255,250,' + (0.5 * (1 - ph)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 20 + ph * 26, 14 + ph * 18, 0, 0, TAU); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(10,30,40,.3)'; ctx.fillRect(-11, -13, 26, 32);
  tw_rr(ctx, -14, -17, 26, 33, 3, '#8A6A44'); tw_rr(ctx, -12, -15, 22, 29, 2, '#A07E54');
  ctx.fillStyle = '#F4F0E2'; ctx.fillRect(-10, -11, 18, 24); ctx.fillStyle = '#E2DCC8'; ctx.beginPath(); ctx.moveTo(8, 9); ctx.lineTo(8, 13); ctx.lineTo(4, 13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(60,70,80,.55)'; for (let k = 0; k < 6; k++) ctx.fillRect(-8, -6 + k * 3.2, k === 0 ? 10 : 14 - (k * 3) % 5, 1);
  ctx.strokeStyle = 'rgba(140,90,50,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(2, 6, 4, 0, TAU); ctx.stroke();                  /* a coffee ring */
  tw_rr(ctx, -6, -19, 10, 6, 2, '#9AA2A4'); ctx.fillStyle = '#5A6264'; ctx.fillRect(-4, -15, 6, 2);                                           /* the clip */
  ctx.fillStyle = '#3AA87A'; ctx.fillRect(8, -11, 4, 7);
  ctx.restore();
  if (ph < 0.12){ const g = 1 - ph / 0.12; ctx.strokeStyle = 'rgba(255,255,255,' + g.toFixed(2) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 6, y - 22); ctx.lineTo(x + 6, y - 10); ctx.moveTo(x, y - 16); ctx.lineTo(x + 12, y - 16); ctx.stroke(); }
}
/* the floor tank in the middle of the tank room: a steel ring set in the floor, a glass lid, and Specimen Zero coiled underneath. It cracks as the chapter
   goes on, splits during Zero's entrance (il.tankU, 0 to 1), and once it has broken (il.tankBroke) only the rim and its jagged glass are left */
function ilFloorTank(ctx, t, il){
  const T = ISLE_FTANK, broke = il && il.tankBroke, u = il && il.tankU ? il.tankU : 0, cw = il && G.wave ? chapterWaveOf(G.wave) : 1;
  const sx = u > 0 && !broke ? Math.sin(t * 50) * 2.4 * u : 0, x = T.x + sx, y = T.y;
  ctx.fillStyle = 'rgba(10,20,26,.35)'; ctx.beginPath(); ctx.arc(x + 6, y + 8, T.r, 0, TAU); ctx.fill();
  fillCircle(ctx, x, y, T.r, '#4A5658'); fillCircle(ctx, x, y, T.r - 6, '#8A9698'); fillCircle(ctx, x, y, T.r - 14, broke ? '#0C2224' : '#0E3A3A');
  for (let i = 0; i < 10; i++){ const a = i * TAU / 10; fillCircle(ctx, x + Math.cos(a) * (T.r - 10), y + Math.sin(a) * (T.r - 10), 2.4, '#C8D0D2'); }
  tw_rr(ctx, x - 26, y + T.r - 13, 52, 10, 2, '#E8C84A'); ctx.fillStyle = '#1A2224'; ctx.font = '800 7px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SPECIMEN 0', x, y + T.r - 5.5);
  const R = T.r - 14;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
  if (!broke){
    const thr = 1 + u * 3, gl = 0.22 + 0.1 * Math.sin(t * 1.4) + u * 0.4;
    ctx.fillStyle = 'rgba(110,240,190,' + gl.toFixed(3) + ')'; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    const rot = t * 0.15 * thr;                                                                             /* Zero, coiled: the mantle, the arms curled round it, an eye */
    for (let k = 0; k < 5; k++) ilTentacle(ctx, x + Math.cos(rot + k * 1.26) * 14, y + Math.sin(rot + k * 1.26) * 12, rot + k * 1.26 + Math.sin(t * thr + k) * 0.3, 40, 10, '#3A2448', '#6A8A5A');
    ctx.fillStyle = '#3A2448'; ctx.beginPath(); ctx.ellipse(x, y, 26, 20, rot * 0.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#4E3460'; ctx.beginPath(); ctx.ellipse(x - 5, y - 4, 14, 9, rot * 0.5, 0, TAU); ctx.fill();
    if (u > 0.3 || Math.sin(t * 0.7) > 0.85){ fillCircle(ctx, x + 8, y - 2, 4, '#C8F0A8'); fillCircle(ctx, x + 8, y - 2, 1.6, '#0A0A10'); }
    for (let q = 0; q < 4; q++){ const ph = (t * 0.6 + q * 0.27) % 1; ctx.strokeStyle = 'rgba(230,255,250,' + (0.6 * (1 - ph)).toFixed(3) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x - 30 + q * 20, y + 20 - q * 9, 2 + ph * 3, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = 'rgba(14,58,58,.35)'; ctx.fillRect(x - R, y - R, R * 2, R * 2);                       /* the glass over it all */
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, R - 8, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
    const n = Math.min(14, Math.max(0, cw - 20) + Math.floor(u * 12));                                      /* cracks: a few late in the chapter, many as it breaks out */
    ctx.strokeStyle = 'rgba(230,255,250,.85)'; ctx.lineWidth = 1.4;
    for (let c = 0; c < n; c++){ let a = csR(c * 7 + 3) * TAU, rr = R * (0.2 + csR(c * 11) * 0.5), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 4; s++){ a += (csR(c * 5 + s) - 0.5) * 1.2; px += Math.cos(a) * 12; py += Math.sin(a) * 12; ctx.lineTo(px, py); } ctx.stroke(); }
  } else {
    ctx.fillStyle = 'rgba(60,170,170,.45)'; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    ctx.strokeStyle = 'rgba(250,255,250,.25)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.arc(x, y, 18 + k * 18 + Math.sin(t * 1.5 + k) * 3, 0, TAU); ctx.stroke(); }
  }
  ctx.restore();
  if (broke){                                                                                            /* the glass still standing in the rim, and the shards it threw */
    ctx.fillStyle = 'rgba(210,250,250,.85)';
    for (let i = 0; i < 22; i++){ const a = i * TAU / 22 + csR(i) * 0.1, l = 5 + csR(i + 40) * 16, w = 0.08; ctx.beginPath(); ctx.moveTo(x + Math.cos(a - w) * R, y + Math.sin(a - w) * R); ctx.lineTo(x + Math.cos(a) * (R - l), y + Math.sin(a) * (R - l)); ctx.lineTo(x + Math.cos(a + w) * R, y + Math.sin(a + w) * R); ctx.closePath(); ctx.fill(); }
    for (let i = 0; i < 26; i++){ const a = csR(i * 3 + 1) * TAU, d = T.r + 10 + csR(i * 5 + 2) * 150, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.8, s = 3 + csR(i * 7) * 5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + s, py + s * 0.3); ctx.lineTo(px + s * 0.3, py + s * 0.9); ctx.closePath(); ctx.fill(); }
  }
}

/* ---------------------------------------------------------------- the screens: the short word, the tank room camera, the lab note card */
const ilWatchBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  ilWatchBaseOverlays.apply(this, arguments);
  const il = G.il; if (G.chapter !== ISLE_CHAPTER || G.biome !== 'isle' || !il || G.attract || G.state === 'levelup') return;
  const W = G.W, H = G.H, sw = clamp(W * 0.22, 160, 220), sh = sw * 0.62, x0 = W - sw - 16, y0 = clamp(H * 0.16, 70, 140);
  if (il.feed && !il.glimpse){
    const f = il.feed, k = clamp(Math.min((f.max - f.t) * 3, f.t * 2), 0, 1);
    ilFeedFrame(ctx, x0, y0, sw, sh, k, 'CAM 3 · TANK ROOM', function(){
      const span = 430, z = sw / span; ctx.translate(x0 + sw / 2, y0 + sh / 2); ctx.scale(z, z); ctx.translate(-ISLE_FTANK.x, -ISLE_FTANK.y);
      drawGroundIsle(ctx, ISLE_FTANK.x, ISLE_FTANK.y, span, sh / z); ilFloorTank(ctx, G.time, il);
      if (G.boss && !G.boss.dead && !G.boss.enter && G.boss.type === 'wildfire') drawEnemy(ctx, G.boss);
    }, f.t > f.max - 0.35 || f.t < 0.3);
  } else if (il.brief && il.brief.wait <= 0 && !il.glimpse){
    const b = il.brief, k = clamp(Math.min((b.max - b.t) * 3, b.t * 2), 0, 1);
    ilFeedFrame(ctx, x0, y0, sw, sh, k, 'LAB FEED', function(){ ilScientist(ctx, x0, y0, sw, sh, G.time); }, b.t > b.max - 0.45 || b.t < 0.35, b.line);
  }
  if (il.noteCard) ilNoteCard(ctx, il.noteCard);
};
/* a small screen in the corner: a frame, the picture (paint, clipped), scanlines, a label with a red light; static at the start and the end; a line under it */
function ilFeedFrame(ctx, x0, y0, sw, sh, k, label, paint, noisy, line){
  ctx.save(); ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(8,14,16,.92)'; ctx.fillRect(x0 - 6, y0 - 6, sw + 12, sh + 12); ctx.strokeStyle = '#7AF0E0'; ctx.lineWidth = 2; ctx.strokeRect(x0 - 6, y0 - 6, sw + 12, sh + 12);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, sw, sh); ctx.clip(); paint(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, sw, sh); ctx.clip();
  if (noisy){ for (let i = 0; i < 160; i++){ const g = Math.floor(Math.random() * 200 + 40); ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; ctx.fillRect(x0 + Math.random() * sw, y0 + Math.random() * sh, 3 + Math.random() * 10, 2); } }
  ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let yy = y0; yy < y0 + sh; yy += 3) ctx.fillRect(x0, yy, sw, 1);
  ctx.restore();
  if (Math.sin(G.time * 6) > -0.4){ ctx.fillStyle = '#FF5A4A'; ctx.beginPath(); ctx.arc(x0 + 12, y0 + 12, 4, 0, TAU); ctx.fill(); }
  ctx.font = '800 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#E8FFF8'; ctx.fillText(label, x0 + 20, y0 + 16);
  if (line){
    const lines = [], words = line.split(' '); let cur = ''; ctx.font = '600 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
    for (let i = 0; i < words.length; i++){ const tt = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(tt).width > sw + 4){ lines.push(cur); cur = words[i]; } else cur = tt; } if (cur) lines.push(cur);
    ctx.fillStyle = 'rgba(8,14,16,.85)'; ctx.fillRect(x0 - 6, y0 + sh + 8, sw + 12, lines.length * 15 + 10); ctx.fillStyle = '#C8F0E8';
    for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x0, y0 + sh + 22 + i * 15);
  }
  ctx.restore();
}
/* the note she has just picked up, on a card of paper low in the middle of the screen */
function ilNoteCard(ctx, c){
  const N = ISLE_NOTES[c.i], W = G.W, H = G.H, k = clamp(Math.min((c.max - c.t) * 4, c.t * 1.5), 0, 1), cw = Math.min(400, W - 32), pad = 14;
  ctx.save(); ctx.globalAlpha = k; ctx.font = '600 13px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  const lines = [], words = N.text.split(' '); let cur = '';
  for (let i = 0; i < words.length; i++){ const tt = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(tt).width > cw - pad * 2){ lines.push(cur); cur = words[i]; } else cur = tt; } if (cur) lines.push(cur);
  const ch = 50 + lines.length * 17 + 22, x = (W - cw) / 2, y = H - ch - clamp(H * 0.16, 70, 130) + (1 - k) * 20;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 4, y + 6, cw, ch);
  ctx.fillStyle = '#F4F0E2'; ctx.fillRect(x, y, cw, ch); ctx.fillStyle = '#3AA87A'; ctx.fillRect(x, y, 6, ch);
  tw_rr(ctx, x + cw / 2 - 22, y - 8, 44, 14, 3, '#9AA2A4'); ctx.fillStyle = '#5A6264'; ctx.fillRect(x + cw / 2 - 12, y - 2, 24, 3);
  ctx.textAlign = 'left'; ctx.fillStyle = '#5A6264'; ctx.font = '800 10px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillText('LAB NOTE ' + ilNotesFound() + ' OF 5', x + pad, y + 20);
  ctx.fillStyle = '#1E2A2C'; ctx.font = '800 15px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillText(N.title, x + pad, y + 40);
  ctx.fillStyle = '#2A3436'; ctx.font = '600 13px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x + pad, y + 62 + i * 17);
  ctx.fillStyle = '#6A7678'; ctx.font = '600 11px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillText('Added to the Bestiary', x + pad, y + ch - 10);
  ctx.restore();
}
/* the Bestiary: the notes she has found, under the chapters */
const ilWatchBaseBestiary = bestiaryCreaturesHTML;
bestiaryCreaturesHTML = function(){
  const out = ilWatchBaseBestiary.apply(this, arguments), b = Save.data ? Save.data.isleNotes | 0 : 0; if (!b) return out;
  let cells = '';
  for (let i = 0; i < ISLE_NOTES.length; i++) if (b & (1 << i)) cells += '<div class="bst-note"><b>' + ISLE_NOTES[i].title + '</b><p>' + ISLE_NOTES[i].text + '</p></div>';
  return out + '<h3 class="gh">Lab notes — found on the island<small style="font-weight:400;color:var(--dust);font-size:12px"> — ' + ilNotesFound() + ' / 5</small></h3><div class="bst-notes">' + cells + '</div>';
};

/* ========================= THE BOSSES' ENTRANCES ========================= */
const ISLE_ENTER = { lion: { k: 'mound', dur: 2.2, c: '#F8B898' }, matriarch: { k: 'pool', dur: 2.4, c: '#C8D8FF' }, buffalo: { k: 'fin', dur: 2.4, c: '#D8E4EA' },
  crocodile: { k: 'wake', dur: 2.8, c: '#8AF0D8' }, wildfire: { k: 'tank', dur: 2.6, c: '#C8F0A8' } };
/* an open spot d0 to d1 from (cx, cy), wet or dry, clear of the props by r; with view, only one she can see (on a phone held upright the screen is narrow) */
function ilSpotNear(cx, cy, wet, d0, d1, r, view){
  for (let i = 0; i < 80; i++){
    const a = Math.random() * TAU, d = rand(d0, d1), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if (x < 230 || x > 3970 || y < 140 || y > 2980 || isleWet(x, y) !== wet || !ilClear(x, y, r) || (TW.blocked && TW.blocked[twCell(x, y)]) || (view && !ilInView(x, y, view))) continue;
    return { x: x, y: y };
  }
  return null;
}
/* is the way from (x0, y0) to (x1, y1) water all along (with a sideways wobble of `side`, for the eel's winding path)? */
function ilWetRun(x0, y0, x1, y1, side){
  const L = hyp(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
  for (let k = 0; k <= 16; k++){ const u = k / 16, o = Math.sin(u * TAU * 1.5) * side * (1 - u), x = x0 + (x1 - x0) * u + nx * o, y = y0 + (y1 - y0) * u + ny * o; if (!isleWet(x, y)) return false; }
  return true;
}
function ilEnterStart(e){
  const E = ISLE_ENTER[e.type]; if (!E) return;
  const en = { k: E.k, t: 0, dur: E.dur, c: E.c, pts: [] };
  if (E.k === 'tank'){ e.x = ISLE_FTANK.x; e.y = ISLE_FTANK.y; G.il.tankU = 0; if (hyp(P.x - e.x, P.y - e.y) > 600){ G.il.feed = { t: E.dur + 2.2, max: E.dur + 2.2 }; if (G.il.glimpse) G.il.glimpse.t = Math.min(G.il.glimpse.t, 0.4); } }      /* far from the room: the scientist's screen cuts to the tank room's camera */
  else if (E.k === 'mound'){ const p = ilSpotNear(P.x, P.y, false, 240, 470, e.r, e.r) || ilSpotNear(P.x, P.y, false, 340, 470, e.r) || ilSpotNear(P.x, P.y, false, 240, 640, e.r * 0.6); if (p){ e.x = p.x; e.y = p.y; } }
  else if (E.k === 'pool'){
    let best = null, bd = 1e9; for (let i = 0; i < ISLE_POOLS.length; i++){ const o = ISLE_POOLS[i], d = hyp(o[0] - P.x, o[1] - P.y), seen = ilInView(o[0], o[1], 40) ? 0 : 600; if (d > 220 && d < 900 && Math.abs(d - 450) + seen < bd){ bd = Math.abs(d - 450) + seen; best = o; } }
    const p = best ? { x: best[0], y: best[1] } : ilSpotNear(P.x, P.y, true, 300, 700, 10); if (p){ e.x = p.x; e.y = p.y; }
  } else {
    for (let tries = 0; tries < 30 && en.sx === undefined; tries++){
      const p = ilSpotNear(P.x, P.y, true, tries < 15 ? 220 : 330, 520, e.r * 0.5, tries < 15 ? e.r : 0); if (!p) continue;
      const q = ilSpotNear(p.x, p.y, true, 380, 620, 10); if (q && ilWetRun(q.x, q.y, p.x, p.y, E.k === 'wake' ? 60 : 0)){ en.sx = q.x; en.sy = q.y; e.x = p.x; e.y = p.y; }
    }
    if (en.sx === undefined){ en.sx = e.x; en.sy = e.y; }                                                  /* no water near her: it comes up where it is */
    en.fx = en.sx; en.fy = en.sy; en.fa = Math.atan2(e.y - en.sy, e.x - en.sx);
  }
  e.enter = en; e.untarg = true; e.hidden = false; e.atkCd = Math.max(e.atkCd || 0, E.dur + 0.5);
}
function ilEnterTick(e, dt){
  const en = e.enter; en.t += dt; const u = Math.min(1, en.t / en.dur);
  if (en.k === 'mound'){ if (Math.random() < dt * 30) addParticle(e.x + rand(-1, 1) * e.r * 0.7 * u, e.y + rand(-1, 1) * e.r * 0.5 * u, rand(-60, 60), rand(-90, -20), rand(1.6, 3.2), 0.5, '#D6C28C', { drag: 3 }); if (Math.random() < dt * 8) addShake(1.5 * u); }
  else if (en.k === 'pool'){ if (Math.random() < dt * 14) burstParticles(e.x + rand(-70, 70), e.y + rand(-40, 40), 2, '#E8DCFF', 80, 2, { glow: true }); if (Math.random() < dt * 6) ilSplash(e.x + rand(-60, 60), e.y + rand(-30, 30), 0.8); }
  else if (en.k === 'fin' || en.k === 'wake'){
    const v = Math.min(1, u / 0.8), s = v * v * (3 - 2 * v), L = hyp(e.x - en.sx, e.y - en.sy) || 1, nx = -(e.y - en.sy) / L, ny = (e.x - en.sx) / L, o = en.k === 'wake' ? Math.sin(v * TAU * 1.5) * 60 * (1 - v) : 0;
    const fx = en.sx + (e.x - en.sx) * s + nx * o, fy = en.sy + (e.y - en.sy) * s + ny * o; en.fa = Math.atan2(fy - en.fy, fx - en.fx) || en.fa; en.fx = fx; en.fy = fy;
    if (!en.pts.length || hyp(fx - en.pts[0][0], fy - en.pts[0][1]) > 14){ en.pts.unshift([fx, fy]); if (en.pts.length > 18) en.pts.pop(); }
    if (Math.random() < dt * 14) ilSplash(fx, fy, 0.6);
  } else if (en.k === 'tank'){
    const was = G.il.tankU || 0; G.il.tankU = u; if (Math.random() < dt * 10) addShake(1.2 * u);
    if ((was < 0.35 && u >= 0.35) || (was < 0.7 && u >= 0.7)) sfx('glass', 0.2, e.x, e.y);
    if (Math.random() < dt * 10) ilSplash(e.x + rand(-60, 60), e.y + rand(-50, 50), 0.6);
  }
  if (en.t < en.dur) return;
  e.enter = null; e.untarg = false; e.hidden = false;
  if (en.k === 'mound'){ burstParticles(e.x, e.y, 28, '#D6C28C', 280, 4); addShock(e.x, e.y, 220, 0.5, 0, '#F0E2B8'); }
  else if (en.k === 'pool'){ ilSplash(e.x, e.y, 2.4); burstParticles(e.x, e.y, 20, '#E8DCFF', 240, 3, { glow: true }); addShock(e.x, e.y, 240, 0.5, 0, '#C8D8FF'); }
  else if (en.k === 'tank'){ G.il.tankBroke = true; G.il.tankU = 1; burstParticles(e.x, e.y, 34, '#D8FFFA', 340, 3.4); ilSplash(e.x, e.y, 2.8); sfx('glass', 0.1, e.x, e.y); addShock(e.x, e.y, 260, 0.5, 0, '#C8F0A8'); }
  else { ilSplash(e.x, e.y, 2.8); ilSplash(e.x + 20, e.y - 10, 2); burstParticles(e.x, e.y, 22, '#E8FAFA', 260, 3); addShock(e.x, e.y, 220, 0.5, 0, '#C8FFF4'); }
  ilRoar(e, en.c);
}
/* every island boss makes its entrance */
const ilWatchBaseOnSpawn = isleOnSpawn;
isleOnSpawn = function(e){ ilWatchBaseOnSpawn.apply(this, arguments); if (e.big && G.il && G.biome === 'isle') ilEnterStart(e); };
/* while it comes in, a boss does nothing else; a hider that has just come up waits a moment before it strikes */
Object.keys(ISLE_AI).forEach(function(k){
  const f = ISLE_AI[k];
  ISLE_AI[k] = function(e, dt, ux, uy){
    if (e.enter){ ilEnterTick(e, dt); return [0, 0]; }
    if (e.surfT > 0){ e.surfT -= dt; e.ang = Math.atan2(uy, ux); return [ux * e.spdE * 0.15, uy * e.spdE * 0.15]; }
    return f.apply(this, arguments);
  };
});
/* the hiders: a warning as they near the surface, and a pause once they are up */
const ilWatchBaseHide = ilHide;
ilHide = function(e, d, near){
  const was = e.hidden, r = ilWatchBaseHide.apply(this, arguments);
  e.tell = r && d < near + 170;
  if (was && !r){ e.surfT = 0.5; e.atkCd = Math.max(e.atkCd || 0, 0.5); }
  return r;
};
/* drawing: a boss coming in is drawn as its entrance; a hider shows bubbles, and its fin when it is about to come up; one just up shows a ring */
const ilWatchBaseDrawEnemy = drawEnemy;
drawEnemy = function(ctx, e){
  if (e.enter && e.def && e.def.isle) return ilDrawEnter(ctx, e);
  const r = ilWatchBaseDrawEnemy.apply(this, arguments);
  if (e.def && e.def.isle && !e.dead){ if (e.hidden) ilDrawTell(ctx, e); else if (e.surfT > 0) ilDrawSurfaced(ctx, e); }
  return r;
};
function ilRise(ctx, e, k){ if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.4); ctx.translate(e.x, e.y); const s = 0.4 + 0.6 * k; ctx.scale(s, s); ctx.translate(-e.x, -e.y); ilWatchBaseDrawEnemy(ctx, e); ctx.restore(); }
function ilDrawEnter(ctx, e){
  const en = e.enter, u = Math.min(1, en.t / en.dur), t = G.time;
  if (en.k === 'mound'){
    const g = Math.min(1, u / 0.85), R = e.r * (0.5 + 0.75 * g), x = e.x + Math.sin(t * 40) * 2 * g, y = e.y;
    ctx.fillStyle = 'rgba(120,96,60,.35)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 8, R * 1.05, R * 0.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C8B07A'; ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.78, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#DCC690'; ctx.beginPath(); ctx.ellipse(x - R * 0.12, y - R * 0.14, R * 0.7, R * 0.52, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#EEDDAA'; ctx.beginPath(); ctx.ellipse(x - R * 0.22, y - R * 0.26, R * 0.3, R * 0.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8A7448'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++){ let a = i * TAU / 7 + 0.3, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 1; s <= 3; s++){ a += (csR(i * 9 + s) - 0.5) * 0.7; px = x + Math.cos(a) * R * g * s / 3.2; py = y + Math.sin(a) * R * 0.78 * g * s / 3.2; ctx.lineTo(px, py); } ctx.stroke(); }
    ctx.lineCap = 'butt';
    if (u > 0.7){ const k = (u - 0.7) / 0.3, aP = Math.atan2(P.y - y, P.x - x); for (const sd of [-1, 1]){ const a = aP + sd * 0.5, bx = x + Math.cos(a) * R * 0.35, by = y + Math.sin(a) * R * 0.3, L = 10 + 26 * k;
      ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * 9, by + Math.cos(a) * 9); ctx.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); ctx.lineTo(bx + Math.sin(a) * 9, by - Math.cos(a) * 9); ctx.closePath(); ctx.fill();
      fillCircle(ctx, bx + Math.cos(a) * L * 0.9, by + Math.sin(a) * L * 0.9, 3.4, e.def.pale); } }
  } else if (en.k === 'pool'){
    const pulse = 0.5 + 0.5 * Math.sin(t * 9);
    csGlow(ctx, e.x, e.y, 90 + 60 * u, '#C8D8FF', 0.25 + 0.3 * u * pulse);
    ctx.strokeStyle = 'rgba(232,220,255,' + (0.5 + 0.4 * pulse).toFixed(2) + ')'; ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++){ if (Math.sin(t * 17 + k * 2) < 0.2) continue; let a = csR(Math.floor(t * 8) + k * 5) * TAU, px = e.x, py = e.y; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 4; s++){ a += (Math.random() - 0.5) * 1.2; px += Math.cos(a) * 18; py += Math.sin(a) * 14; ctx.lineTo(px, py); } ctx.stroke(); }
    for (let k = 0; k < 3; k++){ const ph = (t * 1.2 + k / 3) % 1; ctx.strokeStyle = 'rgba(240,252,250,' + (0.55 * (1 - ph)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(e.x, e.y, 30 + ph * 90, 20 + ph * 60, 0, 0, TAU); ctx.stroke(); }
    ilRise(ctx, e, (u - 0.5) / 0.5);
  } else if (en.k === 'fin' || en.k === 'wake'){
    const L = e.r * 1.5;
    if (en.k === 'wake' && en.pts.length > 1){                                                              /* the long body under the water, thinning to the tail, foam along its back */
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const n = en.pts.length;
      for (let i = n - 1; i > 0; i--){ const a = en.pts[i], b = en.pts[i - 1], k = i / n; ctx.strokeStyle = 'rgba(10,40,48,' + (0.42 * (1 - k * 0.7)).toFixed(3) + ')'; ctx.lineWidth = e.r * (0.9 - k * 0.6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(240,252,250,.45)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.moveTo(en.pts[0][0], en.pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(en.pts[i][0], en.pts[i][1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    }
    if (u < 0.9){
      ctx.save(); ctx.translate(en.fx, en.fy); ctx.rotate(en.fa);
      ctx.fillStyle = 'rgba(10,40,48,.45)'; ctx.beginPath(); ctx.ellipse(0, 0, L, e.r * 0.45, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(240,252,250,.7)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(L * 0.9, 0); ctx.lineTo(-L * 0.3, -e.r * 0.75); ctx.moveTo(L * 0.9, 0); ctx.lineTo(-L * 0.3, e.r * 0.75); ctx.stroke();
      if (en.k === 'fin'){ ctx.fillStyle = e.def.dark; ctx.beginPath(); ctx.moveTo(L * 0.3, 2); ctx.lineTo(-L * 0.25, -4); ctx.lineTo(-L * 0.3, 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.moveTo(L * 0.25, 0); ctx.lineTo(-L * 0.2, -16); ctx.lineTo(-L * 0.26, 2); ctx.closePath(); ctx.fill(); }
      else { ctx.fillStyle = e.def.pale; for (let k = 0; k < 3; k++) fillCircle(ctx, L * 0.2 - k * 14, Math.sin(t * 8 + k) * 3, 3 - k * 0.6, 'rgba(160,240,220,.6)'); }
      ctx.restore();
    }
    if (u > 0.78){ const k = (u - 0.78) / 0.22; ctx.strokeStyle = 'rgba(240,252,250,' + (0.8 * (1 - k * 0.5)).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * (0.6 + k), e.r * (0.42 + k * 0.7), 0, 0, TAU); ctx.stroke(); }
    ilRise(ctx, e, (u - 0.82) / 0.18);
  }
  /* 'tank': the floor tank draws itself breaking, and Zero is still in it */
}
function ilDrawTell(ctx, e){
  const t = G.time, a = e.ang || 0;
  for (let k = 0; k < 3; k++){ const ph = (t * 1.3 + k / 3 + (e.anim || 0)) % 1, bx = e.x + Math.sin(k * 2.3 + (e.anim || 0)) * e.r * 0.5, by = e.y + Math.cos(k * 1.7) * e.r * 0.3; ctx.strokeStyle = 'rgba(240,252,250,' + (0.7 * (1 - ph)).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(bx, by, 2 + ph * 4, 0, TAU); ctx.stroke(); }
  if (!e.tell) return;
  const p = 0.5 + 0.5 * Math.sin(t * 10);
  ctx.strokeStyle = 'rgba(255,255,255,' + (0.45 + 0.4 * p).toFixed(2) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * (1.3 + 0.2 * p), e.r * (0.9 + 0.14 * p), 0, 0, TAU); ctx.stroke();
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(a);
  ctx.fillStyle = e.def.dark; ctx.beginPath(); ctx.moveTo(e.r * 0.4, 2); ctx.lineTo(-e.r * 0.3, -3); ctx.lineTo(-e.r * 0.35, 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.moveTo(e.r * 0.35, 0); ctx.lineTo(-e.r * 0.25, -e.r * 0.55); ctx.lineTo(-e.r * 0.3, 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(240,252,250,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(e.r * 0.45, 0); ctx.lineTo(-e.r * 0.4, -e.r * 0.7); ctx.moveTo(e.r * 0.45, 0); ctx.lineTo(-e.r * 0.4, e.r * 0.7); ctx.stroke();
  ctx.restore();
}
function ilDrawSurfaced(ctx, e){ const k = e.surfT / 0.5; ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 * k).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * (1.6 - k * 0.4), e.r * (1.1 - k * 0.3), 0, 0, TAU); ctx.stroke(); }
