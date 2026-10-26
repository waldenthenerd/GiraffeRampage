'use strict';
/* Main menu chapter selector and the speed slider. */
/* ========================= MAIN MENU: CHAPTER SELECTOR ========================= */
/* One chapter at a time in a round window, with arrows to flip between them.
   The window is a live miniature of the chapter -- its own ground, the
   giraffe (in whatever gear is equipped), and a few of that chapter's own
   creatures slowly circling -- drawn with the same functions as the game. */
const CHAPTER_INFO = [
  { name: 'Savanna', biome: 'savanna',
    desc: 'Where it all begins. Something is building on the horizon.' },
  { name: 'Frostreach', biome: 'snow',
    desc: 'North, where the cold bites back.' },
  { name: 'Murkfen', biome: 'swamp',
    desc: 'Black water, long shadows, and a constant hum.' },
  { name: 'The Deep', biome: 'ocean',
    desc: 'Open water. Something is watching from far below.' },
  { name: 'The Canopy', biome: 'jungle',
    desc: 'The deepest green. It does not forgive.' },
  { name: 'Houston', biome: 'city',
    desc: 'The streets are empty, but someone knows she is here.' },
  { name: 'Space Center', biome: 'space',
    desc: 'Someone does not want her to leave.' },
  { name: 'The Moon', biome: 'moon',
    desc: 'She is not the only one up here.' },
  { name: 'Venus', biome: 'venus',
    desc: 'A burning world, and two armies on it.' },
  { name: 'The Inferno', biome: 'venus',
    desc: 'Deeper into the fire. Something waits at the bottom.' },
  { name: 'The Changed Savannah', biome: 'savanna',
    desc: 'Home, but the grass is glittering.' },
  { name: 'Area 51', biome: 'area51',
    desc: 'The glimmer came from somewhere.' },
  { name: 'Mars', biome: 'mars',
    desc: 'The vial points off the Earth.' },
  { name: 'The Domes', biome: 'dome', cast: ['hyena', 'cheetah', 'vulture', 'thawed'],       /* Chapter 13.5, a short one: ten waves */
    desc: 'A ring of mirrored domes shimmers in the savannah heat. Inside, it is freezing.' },
  { name: 'The Tower', biome: 'tower', cast: ['hyena', 'cheetah', 'vulture', 'lion'],            /* Chapter 14: twenty-five floors, one wave each */
    desc: 'New York. The domes were paid for from the top floor of a glass tower. Take the elevator, one floor at a time.' }
];
const MENU_PREVIEW_CAST = ['hyena', 'cheetah', 'vulture', 'lion'];
function chapterUnlocked(ch){ if (ch === 11) return !!(Save.data && Save.data.homecoming); return ch <= 1 || !!(Save.data && Save.data['chapter' + (ch - 1) + 'Complete']); }       /* Chapter 11 opens when she has flown home */
function menuChapter(){
  const n = Math.round(+(Save.data && Save.data.menuChapter) || 1);
  return clamp(n, 1, TOTAL_CHAPTERS);
}
function setMenuChapter(n){
  Save.data.menuChapter = clamp(Math.round(n), 1, TOTAL_CHAPTERS);
  Save.write();
}
function previewAtmosphere(c, ch, W, H){
  const fx = fxLevelNow(); if (fx <= 0) return;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const A = ATMOS[ch] || ATMOS[1];
  if (A.base[3] > 0){ c.fillStyle = 'rgba(' + A.base[0] + ',' + A.base[1] + ',' + A.base[2] + ',' + (A.base[3] * 0.9).toFixed(3) + ')'; c.fillRect(0, 0, W, H); }
  const Wx = Atmos.preview, dt = Math.min(0.1, Math.max(0, G.time - (Atmos.pvLast || G.time))); Atmos.pvLast = G.time;
  weatherSync(Wx, A.weather, 0.7, W, H);
  weatherUpdate(Wx, A.weather, dt, W, H, Math.sin(G.time * 0.22) * 16, Math.cos(G.time * 0.17) * 10, 1);
  weatherDraw(c, Wx, A.weather, A.accent, G.time);
}
function drawMenuPreview(){  const cv = document.getElementById('chPreview');
  if (!cv || !cv.getContext) return;
  const c = cv.getContext('2d');
  if (!c) return;
  const ch = menuChapter(), info = CHAPTER_INFO[ch - 1], table = bestiaryTable(ch);
  const W = cv.width, H = cv.height, z = W / 310;
  const cx = ARENA_W * 0.5 + 420, cy = ARENA_H * 0.5 - 260;
  const saved = { rocket: G.rocket, buildings: G.buildings, biome: G.biome, x: P.x, y: P.y, vx: P.vx, vy: P.vy, face: P.face, aim: P.aim, walk: P.walk,
    invuln: P.invuln, hurtT: P.hurtT, kickAnim: P.kickAnim };
  const keepParticles = G.particles.length;
  c.save();
  try {
    G.biome = info.biome;
    if (info.biome === 'city') G.buildings = menuCityPreviewBuildings(cx, cy);
    else if (info.biome === 'space'){ G.buildings = []; G.rocket = { x: cx + 64, y: cy - 22, s: 0.4 }; }
    else if (info.biome === 'moon'){ G.buildings = []; G.rocket = null; }
    else if (info.biome === 'venus'){ G.buildings = []; G.rocket = null; }
    else if (info.biome === 'area51' || info.biome === 'mars' || info.biome === 'dome' || info.biome === 'tower'){ G.buildings = []; G.rocket = null; }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cx, -cy);
    const dxp = Math.sin(G.time * 0.22) * 16, dyp = Math.cos(G.time * 0.17) * 10;
    c.save(); c.translate(dxp, dyp); drawGround(c, cx, cy, W / z + 90, H / z + 90); c.restore();
    let firstAng = 0;
    const cast = info.cast || MENU_PREVIEW_CAST;
    for (let i = 0; i < cast.length; i++){
      const type = cast[i], def = table[type];
      const a = i / cast.length * TAU + G.time * 0.12, dist = def.big ? 128 : 104;
      const ex = cx + Math.cos(a) * dist, ey = cy + Math.sin(a) * dist * 0.85;
      if (i === 0) firstAng = Math.atan2(ey - cy, ex - cx);
      drawEnemy(c, { portrait: true, def: def, type: type, x: ex, y: ey, r: def.r, ang: Math.atan2(cy - ey, cx - ex),
        flash: 0, state: 'idle', anim: G.time * 3 + i, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0,
        stunT: 0, burnT: 0, slowT: 0, slowMul: 1 });
    }
    P.x = cx; P.y = cy; P.vx = 0; P.vy = 0; P.invuln = 0; P.hurtT = 0; P.kickAnim = 0;
    P.walk = G.time * 2; P.aim = firstAng; P.face = firstAng;
    drawPlayer(c);
    if (info.biome === 'space') drawRocketOverlay(c);
    previewAtmosphere(c, ch, W, H);
  } catch (err) {}
  finally {
    c.restore();
    G.biome = saved.biome; G.buildings = saved.buildings; G.rocket = saved.rocket;
    P.x = saved.x; P.y = saved.y; P.vx = saved.vx; P.vy = saved.vy; P.face = saved.face; P.aim = saved.aim;
    P.walk = saved.walk; P.invuln = saved.invuln; P.hurtT = saved.hurtT; P.kickAnim = saved.kickAnim;
    if (G.particles.length > keepParticles) G.particles.length = keepParticles;
  }
}
function chapterSelectorHTML(){
  const ch = menuChapter(), info = CHAPTER_INFO[ch - 1], open = chapterUnlocked(ch);
  const first = chapterFirstWave(ch), last = first + chapterLen(ch) - 1, bosses = Math.floor(chapterLen(ch) / 5);
  let dots = '';
  for (let i = 1; i <= TOTAL_CHAPTERS; i++)
    dots += '<span class="chdot' + (i === ch ? ' on' : '') + (chapterUnlocked(i) ? '' : ' locked') + '"></span>';
  const start = !open
    ? '<button class="btn chstart" disabled>Locked<small>' + (ch === 11 ? 'Fly home in the spaceplane' : 'Clear Chapter ' + chapterLabel(ch - 1)) + ' to unlock</small></button>'
    : ch === 1
      ? '<button class="btn chstart" data-a="play">Start a run<small>Wave one. Nothing personal.</small></button>'
      : '<button class="btn chstart" data-a="play' + ch + '">Start Chapter ' + chapterLabel(ch) + '<small>Straight to wave ' + first + '. No cards to start.</small></button>';
  return '<div class="chsel">' +
      '<button class="charrow" data-a="ch-prev" aria-label="Previous chapter"' + (ch <= 1 ? ' disabled' : '') + '>\u276E</button>' +
      '<div class="chpic' + (open ? '' : ' locked') + '">' +
        '<canvas id="chPreview" width="400" height="400"></canvas>' +
        (open ? '' : '<div class="chlock"><div>' + ico('@t-x-lock') + '<small>' + (ch === 11 ? 'Fly home in the spaceplane' : 'Clear Chapter ' + chapterLabel(ch - 1)) + ' to unlock</small></div></div>') +
      '</div>' +
      '<button class="charrow" data-a="ch-next" aria-label="Next chapter"' + (ch >= TOTAL_CHAPTERS ? ' disabled' : '') + '>\u276F</button>' +
    '</div>' +
    '<div class="chname display">Chapter ' + chapterLabel(ch) + ' \u00b7 ' + info.name + '</div>' +
    '<div class="chdots">' + dots + '</div>' +
    '<p class="chdesc">' + info.desc + '</p>' +
    '<p class="chmeta">Waves ' + first + '\u2013' + last + ' \u00b7 ' + bosses + ' bosses</p>' +
    '<div class="chgo">' + start + speedButtonHTML() + '</div>';
}
/* Speed mode is chosen here, beside Start, and is then locked for the whole
   run (see G.runSpeed): there is deliberately no way to change it mid-run. */
/* A three-stop slider: Normal, Speed (x1.1) and Hyperspeed (x1.3, with each wave's enemies bunched closer together) */
/* dragging: press anywhere on the track (or on the knob) and slide; the knob follows and snaps to the nearest of the three stops on release */
function bindSpeedSlider(){
  let drag = null;
  const levelAt = (tr, x) => { const r = tr.getBoundingClientRect(), f = clamp((x - r.left - 14) / Math.max(1, r.width - 28), 0, 1); return Math.round(f * 3); };
  const show = (tr, x, snap) => {
    const r = tr.getBoundingClientRect(), f = clamp((x - r.left - 14) / Math.max(1, r.width - 28), 0, 1), v = snap ? levelAt(tr, x) / 3 : f;
    const pos = 'calc(14px + (100% - 28px) * ' + v + ')', knob = tr.querySelector('.spdknob'), fill = tr.querySelector('.spdfill');
    if (knob){ knob.style.transition = snap ? '' : 'none'; knob.style.left = pos; } if (fill) fill.style.width = pos;
  };
  document.addEventListener('pointerdown', e => {
    const tr = e.target.closest && e.target.closest('.spdtrack');
    if (!tr || G.state !== 'menu') return;
    drag = tr; e.preventDefault(); show(tr, e.clientX, false);
  });
  window.addEventListener('pointermove', e => { if (drag) show(drag, e.clientX, false); });
  const end = e => {
    if (!drag) return;
    const tr = drag, lv = levelAt(tr, e.clientX); drag = null;
    show(tr, e.clientX, true); handleAction('speed-' + lv);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', () => { if (drag){ drag = null; showMenu(); } });
}
function spdPos(i){ return 'calc(14px + (100% - 28px) * ' + (i / 3) + ')'; }      /* stops and knob sit 14px in from each end of the track */
function speedButtonHTML(){
  const lv = Settings.speedLevel | 0, names = ['Normal', 'Speed \u00d7' + SPEED_MODE_MUL, 'Hyperspeed \u00d7' + HYPER_MODE_MUL, 'Ultrafast \u00d7' + ULTRA_MODE_MUL];
  let stops = '';
  for (let i = 0; i < 4; i++) stops += '<button class="spdstop' + (i === lv ? ' on' : '') + '" data-a="speed-' + i + '" aria-label="' + names[i] + '" style="left:' + spdPos(i) + '"></button>';
  return '<div class="speedslider lv' + lv + '" title="Time runs faster for the whole run: you, enemies and ants all move faster and waves are shorter. Hyperspeed also bunches each wave\u2019s enemies much closer together, and Ultrafast sends a whole wave in just a few short bursts. No bonus rewards. Fixed once the run starts.">' +
    '<div class="spdhead"><span>Speed</span><b>' + names[lv] + '</b></div>' +
    '<div class="spdtrack"><div class="spdfill" style="width:' + spdPos(lv) + '"></div>' + stops + '<div class="spdknob" style="left:' + spdPos(lv) + '"></div></div>' +
    '<div class="spdends"><span>Normal</span><span>Ultra</span></div></div>';
}

