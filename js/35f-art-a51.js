'use strict';
/* Enemy art, Chapter 12: Area 51 camouflage and night-vision gear on top of the Marine drawing code (A51_ALIAS, a51Gear). */
/* Chapter 12: Area 51's soldiers are drawn by the Marine drawing code, in the base's desert colours (they come from the creature's def), with a
   camouflage pattern and a green night-vision visor on the ones that wear a helmet. The Marine code calls a51Camo itself (when d.look starts with
   'a51_') so the camouflage sits under the arms, rifle and visor; a51Gear then adds the goggles on top. */
const A51_ALIAS = { a51_guard: 'rifleman', a51_jumper: 'jumptrooper', a51_riot: 'riottrooper', a51_pod: 'droppod', a51_drone: 'attackdrone', a51_lancer: 'lancer',
  a51_shock: 'shocktrooper', a51_engineer: 'engineer', a51_medic: 'medic', a51_sledge: 'siegebreaker', a51_ghost: 'shadowop', a51_demo: 'breacher',
  a51_colonel: 'sergeant', a51_major: 'spotter', a51_walker: 'colossus', a51_warden: 'warden', a51_general: 'admiral', a51_blade: 'bladeguard', a51_turret: 'sentryturret' };
const A51_HELMETED = { rifleman: 1, jumptrooper: 1, riottrooper: 1, bladeguard: 1, lancer: 1, shocktrooper: 1, engineer: 1, medic: 1, siegebreaker: 1, shadowop: 1, breacher: 1, sergeant: 1, spotter: 1 };
/* the marine drawing code scales each kit differently (s = e.r / this) */
const A51_SCALE = { siegebreaker: 11, sergeant: 11, spotter: 12, shadowop: 8, breacher: 8 };
/* camouflage blotches: [x, y, radius] in units of the patch ellipse, colour slot 0 mid / 1 dark / 2 sand, and their jagged outlines */
const A51_BLOTCH = [[-0.5, -0.46, 0.62, 0], [0.46, -0.52, 0.5, 1], [-0.08, 0.06, 0.46, 2], [0.62, 0.36, 0.5, 0], [-0.62, 0.46, 0.5, 1], [0.04, 0.74, 0.42, 2], [0.1, -0.88, 0.36, 1]];
const A51_JIT = [1, 0.58, 0.9, 0.5, 1.1, 0.68];
const A51_VERT = A51_BLOTCH.map((c, i) => A51_JIT.map((j, k) => { const a = k / 6 * TAU + i * 0.9, r = j * (0.8 + 0.3 * ((i * 5 + k * 3) % 4) / 3); return [Math.cos(a) * r * 1.25, Math.sin(a) * r]; }));
/* a three-tone blotch camouflage clipped to an ellipse (the torso plate, a pauldron, the helmet). seed 0-3 flips the pattern so parts differ. */
function a51Camo(ctx, cx, cy, rx, ry, seed, c1, c2, c3, n){
  const m = Math.min(rx, ry), fx = (seed & 1) ? -1 : 1, fy = (seed & 2) ? -1 : 1;
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.clip();
  for (let i = 0, N = n || A51_BLOTCH.length; i < N; i++){
    const c = A51_BLOTCH[i], v = A51_VERT[i], px = cx + c[0] * rx * fx, py = cy + c[1] * ry * fy, R = c[2] * m;
    ctx.fillStyle = c[3] === 0 ? c1 : c[3] === 1 ? c2 : c3;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) ctx.lineTo(px + v[k][0] * R * fx, py + v[k][1] * R * fy);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
/* the night-vision goggles, flipped down over the marine visor of a helmeted soldier: a bracket, twin green tubes with a halo and glints */
function a51Gear(ctx, e, dk, bob){
  const base = e.def && A51_ALIAS[e.def.look], s = e.r / (A51_SCALE[base] || 14), ga = ctx.globalAlpha;
  ctx.fillStyle = '#161A22'; ctx.fillRect(4 * s, bob - 5.4 * s, 4.2 * s, 10.8 * s);                      /* the bracket */
  ctx.fillStyle = '#2E333F'; ctx.fillRect(4 * s, bob - 1 * s, 3.6 * s, 2 * s);
  ctx.globalAlpha = ga * 0.3; fillCircle(ctx, 7.2 * s, bob - 2.7 * s, 3.4 * s, '#5CFF7A'); fillCircle(ctx, 7.2 * s, bob + 2.7 * s, 3.4 * s, '#5CFF7A'); ctx.globalAlpha = ga;
  for (let k = -1; k <= 1; k += 2){
    const y = bob + k * 2.7 * s;
    fillCircle(ctx, 7.2 * s, y, 2.3 * s, '#0A0D12'); fillCircle(ctx, 7.2 * s, y, 1.8 * s, '#1E8A3A'); fillCircle(ctx, 7.4 * s, y, 1.2 * s, '#5CFF7A');
    fillCircle(ctx, 7.8 * s, y - 0.6 * s, 0.5 * s, '#E8FFE0');
  }
}

