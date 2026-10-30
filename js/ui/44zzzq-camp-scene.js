'use strict';
/* =============================================================================================================================
   44zzzq-camp-scene.js  --  THE PICTURE AT THE TOP OF THE CAMP TAB (js/ui/44zzzp-camp-page.js): a night camp with a tent, a fire and a lantern, and
   the giraffe going about it in a loop of thirty seconds: chopping wood at the stump, walking to the fire and sitting by it, then walking out to
   fight what comes out of the dark (a sword the first time round, a bow the next). All of it is drawn in code from the time alone (campSceneDraw),
   so any moment can be drawn on its own (the scenario does), and the fire burns higher the fuller the store.
   It runs about 24 frames a second, only while the Camp tab is showing; with Visual effects off it draws one still frame, sitting by the fire.
   ============================================================================================================================= */
const CAMP_SCENE = { W: 640, H: 240, GY: 196, cycle: 30, raf: 0, last: 0, t: 0, fixT: -1, fill: 0.5 };
/* where she is and what she is doing at second t of a 30-second round: { x, mode, f (seconds into the mode), walk } */
function campSceneAt(t){
  const c = ((t % 30) + 30) % 30;
  const lerp = function(a, b, u){ return a + (b - a) * Math.max(0, Math.min(1, u)); };
  if (c < 8) return { x: 100, mode: 'chop', f: c, walk: 0 };
  if (c < 10.5) return { x: lerp(100, 262, (c - 8) / 2.5), mode: 'walk', f: c - 8, walk: 1 };
  if (c < 10.9) return { x: 262, mode: 'sit', f: c - 10.5, sit: (c - 10.5) / 0.4, walk: 0 };
  if (c < 17) return { x: 262, mode: 'sit', f: c - 10.5, sit: 1, walk: 0 };
  if (c < 17.4) return { x: 262, mode: 'sit', f: c - 10.5, sit: 1 - (c - 17) / 0.4, walk: 0 };
  if (c < 19.4) return { x: lerp(262, 410, (c - 17.4) / 2), mode: 'walk', f: c - 17.4, walk: 1 };
  if (c < 27.4) return { x: 410, mode: 'fight', f: c - 19.4, walk: 0 };
  return { x: lerp(410, 100, (c - 27.4) / 2.6), mode: 'walk', f: c - 27.4, walk: -1 };
}
function campSceneRay(c, x1, y1, x2, y2, w, col){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
/* the giraffe, in her own coordinates (feet at the origin, facing +x): neck angle a from straight up (more is forward), the head's own tilt, the walk cycle, and what she holds */
function campSceneGiraffe(c, x, gy, o){
  const K = giraffeColours(), pat = giraffePattern(), acc = giraffeAccent() || '#3A2810', cape = typeof equippedCapeColor === 'function' ? equippedCapeColor() : null;     /* her own coat, spots, pattern, accent and cape */
  const sit = o.sit || 0, lift = 22 * sit, bodyY = -50 + lift + (o.dip || 0) * 6;
  c.save(); c.translate(x, gy); c.scale(o.face || 1, 1);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(4, 2, 38, 5, 0, 0, TAU); c.fill();
  const sw = o.walk ? Math.sin(o.ph) : 0;
  const leg = function(lx, ph, far){
    const sx = lx + (o.walk ? Math.sin(o.ph + ph) * 9 : 0), top = bodyY + 6, len = 44 - lift;
    c.strokeStyle = far ? K.dark : K.coat; c.lineWidth = 6; c.lineCap = 'round';
    if (sit > 0.5){ c.beginPath(); c.moveTo(lx, top + 6); c.lineTo(lx + 18, -4); c.lineTo(lx + 2, -4); c.stroke(); }
    else { c.beginPath(); c.moveTo(lx, top); c.lineTo(sx, top + len); c.stroke(); c.fillStyle = acc; c.fillRect(sx - 4, top + len - 3, 8, 4); }
  };
  leg(-18, Math.PI, true); leg(18, 0, true);
  c.strokeStyle = K.dark; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, bodyY - 2); c.quadraticCurveTo(-44, bodyY + 8 + sw * 4, -40, bodyY + 24); c.stroke();      /* tail */
  c.fillStyle = acc; c.beginPath(); c.arc(-40, bodyY + 25, 3.5, 0, TAU); c.fill();
  c.fillStyle = K.coat; c.beginPath(); c.ellipse(0, bodyY, 32, 16, 0, 0, TAU); c.fill();
  c.fillStyle = K.spot; [[-14, -3, 6, 4], [4, 4, 7, 5], [18, -5, 5, 4], [-2, -8, 4, 3], [-22, 5, 5, 4]].forEach(function(s){ wardSpot(c, pat, s[0], bodyY + s[1], s[2], s[3], 0.4); });
  leg(-16, 0, false); leg(20, Math.PI, false);
  if (cape){ c.fillStyle = cape; c.beginPath(); c.moveTo(18, bodyY - 12); c.quadraticCurveTo(-8, bodyY - 20 + sw * 3, -36 - sw * 4, bodyY + 4 + sw * 5); c.lineTo(-30, bodyY + 12); c.quadraticCurveTo(-4, bodyY + 4, 20, bodyY - 2); c.closePath(); c.fill(); }
  /* the neck: a tapered band from the shoulder to the head, with spots down it and a mane behind */
  const bx = 22, by = bodyY - 6, a = o.neck, L = 64, tx = bx + Math.sin(a) * L, ty = by - Math.cos(a) * L;
  c.strokeStyle = K.dark; c.lineWidth = 4; c.beginPath(); c.moveTo(bx - 4, by - 2); c.lineTo(tx - 3, ty + 2); c.stroke();
  campSceneRay(c, bx, by, tx, ty, 13, K.coat);
  c.fillStyle = K.spot; for (let i = 1; i <= 4; i++){ const u = i / 5; wardSpot(c, pat, bx + (tx - bx) * u, by + (ty - by) * u, 3.4, 2.6, a); }
  const hA = a + 1.25 + (o.head || 0);                                               /* the head points forward of the neck */
  c.save(); c.translate(tx, ty); c.rotate(hA - Math.PI / 2);
  c.fillStyle = K.coat; c.beginPath(); c.ellipse(5, 0, 13, 6.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#3A2810'; c.beginPath(); c.ellipse(15, 1, 3, 2.2, 0, 0, TAU); c.fill();
  c.fillStyle = '#1A1208'; c.beginPath(); c.arc(4, -2, 1.6, 0, TAU); c.fill();
  c.strokeStyle = '#5A3A14'; c.lineWidth = 2; c.beginPath(); c.moveTo(-1, -5); c.lineTo(-3, -12); c.moveTo(3, -5); c.lineTo(3, -12); c.stroke();
  c.fillStyle = acc; c.beginPath(); c.arc(-3, -12.5, 1.8, 0, TAU); c.arc(3, -12.5, 1.8, 0, TAU); c.fill();
  c.restore();
  const mx = tx + Math.cos(hA - Math.PI / 2) * 17, my = ty + Math.sin(hA - Math.PI / 2) * 17;          /* the mouth: where the weapon is held */
  if (o.item){ c.save(); c.translate(mx, my); c.rotate(o.itemA || 0); campSceneItem(c, o.item, o); c.restore(); }
  c.restore();
}
function campSceneItem(c, kind, o){
  if (kind === 'axe'){ campSceneRay(c, 0, 0, 34, 0, 3.5, '#8A5A2A'); c.fillStyle = '#C8CCD4'; c.beginPath(); c.moveTo(28, -3); c.lineTo(38, -12); c.lineTo(40, 6); c.lineTo(28, 3); c.closePath(); c.fill(); c.fillStyle = '#8A8E96'; c.fillRect(37, -10, 3, 14); }
  else if (kind === 'sword'){ campSceneRay(c, -4, 0, 4, 0, 4, '#7A5A2A'); c.fillStyle = '#6A4A1E'; c.fillRect(3, -7, 3, 14); c.fillStyle = '#E8EEF8'; c.beginPath(); c.moveTo(6, -2); c.lineTo(46, -1); c.lineTo(52, 0); c.lineTo(46, 1); c.lineTo(6, 2); c.closePath(); c.fill(); c.fillStyle = 'rgba(120,150,200,.6)'; c.fillRect(8, -.5, 36, 1); }
  else if (kind === 'bow'){
    const d = o.draw || 0;                                                            /* how far the string is pulled */
    c.strokeStyle = '#7A4E1E'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, -24); c.quadraticCurveTo(24 - d * 8, 0, 6, 24); c.stroke();
    c.strokeStyle = '#E8E0C8'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, -24); c.lineTo(-d * 14, 0); c.lineTo(6, 24); c.stroke();
    if (o.arrow !== false && d > 0){ campSceneRay(c, -d * 14, 0, 38 - d * 8, 0, 1.8, '#D8C8A0'); c.fillStyle = '#C8CCD4'; c.beginPath(); c.moveTo(38 - d * 8, -3); c.lineTo(46 - d * 8, 0); c.lineTo(38 - d * 8, 3); c.fill(); }
  }
}
function campSceneEnemy(c, x, gy, o){
  const sh = o.shrink == null ? 1 : o.shrink, ph = o.ph || 0;
  c.save(); c.translate(x + (o.kick || 0), gy); c.scale(-sh, sh); if (o.flash > 0) c.globalAlpha = 1 - Math.min(0.5, o.flash * 0.4);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 1, 22, 4, 0, 0, TAU); c.fill();
  const col = o.flash > 0 ? '#F4F0E8' : '#7A6A52', dk = o.flash > 0 ? '#E8E0D0' : '#5A4A38';
  [[-12, 0], [-5, Math.PI], [8, 0], [14, Math.PI]].forEach(function(l){ const s = Math.sin(ph + l[1]) * 5; c.strokeStyle = dk; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(l[0], -14); c.lineTo(l[0] + s, -1); c.stroke(); });
  c.fillStyle = col; c.beginPath(); c.ellipse(0, -20, 20, 11, -0.1, 0, TAU); c.fill();
  c.fillStyle = dk; c.beginPath(); c.moveTo(-18, -26); c.lineTo(-26, -34); c.lineTo(-12, -29); c.fill();                  /* the mane, and the tail */
  c.beginPath(); c.moveTo(16, -26); c.lineTo(26, -22); c.lineTo(16, -18); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-19, -20); c.quadraticCurveTo(-30, -26, -28, -14); c.lineWidth = 3; c.strokeStyle = dk; c.stroke();
  c.fillStyle = col; c.beginPath(); c.ellipse(21, -24, 9, 7, 0.2, 0, TAU); c.fill(); c.fillStyle = dk; c.beginPath(); c.moveTo(19, -30); c.lineTo(22, -38); c.lineTo(26, -30); c.fill();
  c.fillStyle = '#FF4A3A'; c.beginPath(); c.arc(24, -26, 1.8, 0, TAU); c.fill(); c.fillStyle = '#F4F0E8'; c.fillRect(26, -22, 2, 3); c.fillRect(29, -22, 2, 3);
  c.restore();
}
function campScenePoof(c, x, y, u){                                                  /* a puff of stars where something was beaten, u from 0 to 1 */
  if (u <= 0 || u >= 1) return;
  c.save(); c.globalAlpha = 1 - u; for (let i = 0; i < 7; i++){ const an = i / 7 * TAU, r = 6 + u * 26; c.fillStyle = i % 2 ? '#FFD66A' : '#FFF4C8'; c.beginPath(); c.arc(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.8, 3.4 * (1 - u * 0.5), 0, TAU); c.fill(); } c.restore();
}
function campSceneDraw(c, t, fill){
  const W = CAMP_SCENE.W, H = CAMP_SCENE.H, GY = CAMP_SCENE.GY, S = campSceneAt(t), tw = fxLevelNow() > 0 ? t : 0;
  const sky = c.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, '#141C28'); sky.addColorStop(1, '#2C3E4C'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 34; i++){ const sx = (i * 97 + 31) % W, sy = (i * 53 + 11) % 110, tz = 0.5 + 0.5 * Math.sin(tw * 1.6 + i * 1.7); c.fillStyle = 'rgba(255,255,255,' + (0.35 + tz * 0.55).toFixed(2) + ')'; c.fillRect(sx, sy, i % 5 === 0 ? 2 : 1.4, i % 5 === 0 ? 2 : 1.4); }
  c.fillStyle = '#F4E8B8'; c.beginPath(); c.arc(548, 46, 20, 0, TAU); c.fill(); c.fillStyle = '#141C28'; c.beginPath(); c.arc(556, 40, 18, 0, TAU); c.fill();
  c.fillStyle = '#26343C'; c.beginPath(); c.moveTo(0, GY - 40); c.lineTo(110, GY - 86); c.lineTo(210, GY - 50); c.lineTo(330, GY - 104); c.lineTo(450, GY - 54); c.lineTo(540, GY - 78); c.lineTo(640, GY - 46); c.lineTo(640, GY); c.lineTo(0, GY); c.fill();
  c.fillStyle = '#2E3A2A'; for (let i = 0; i < 9; i++){ const px = 20 + i * 76 + (i % 2) * 14, ph = 22 + (i * 7) % 16; c.beginPath(); c.moveTo(px - 10, GY - 30); c.lineTo(px, GY - 30 - ph); c.lineTo(px + 10, GY - 30); c.fill(); }
  c.fillStyle = '#3C3226'; c.fillRect(0, GY, W, H - GY); c.fillStyle = '#4A3E30'; c.fillRect(0, GY, W, 4); c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 26; i++) c.fillRect((i * 83) % W, GY + 8 + (i * 13) % 30, 14, 2);
  const glow = 0.5 + Math.max(0.15, Math.min(1, fill)) * 0.5, fl = 1 + Math.sin(tw * 9) * 0.06 + Math.sin(tw * 5.3) * 0.04;
  const fg = c.createRadialGradient(340, GY - 14, 4, 340, GY - 14, 150 * glow); fg.addColorStop(0, 'rgba(255,170,70,.34)'); fg.addColorStop(1, 'rgba(255,170,70,0)'); c.fillStyle = fg; c.fillRect(150, 0, 380, H);
  /* the tent, with a flag */
  c.fillStyle = '#B4864A'; c.beginPath(); c.moveTo(14, GY); c.lineTo(66, GY - 66); c.lineTo(118, GY); c.fill(); c.fillStyle = '#8E6736'; c.beginPath(); c.moveTo(66, GY - 66); c.lineTo(86, GY); c.lineTo(118, GY); c.fill(); c.fillStyle = '#2A1E12'; c.beginPath(); c.moveTo(52, GY); c.lineTo(66, GY - 34); c.lineTo(80, GY); c.fill();
  c.strokeStyle = '#D8C8A0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(66, GY - 66); c.lineTo(66, GY - 80); c.stroke(); c.fillStyle = '#C8402A'; c.beginPath(); c.moveTo(66, GY - 80); c.lineTo(80 + Math.sin(tw * 3) * 2, GY - 76); c.lineTo(66, GY - 72); c.fill();
  /* the stump and the logs */
  const chop = S.mode === 'chop' ? S.f : -1, hitT = chop >= 0 ? chop % 1.6 : -1, split = chop >= 0 ? Math.floor(chop / 1.6) : 0;
  c.fillStyle = '#5A3A1C'; c.fillRect(166, GY - 22, 26, 22); c.fillStyle = '#8A5E2E'; c.beginPath(); c.ellipse(179, GY - 22, 13, 5, 0, 0, TAU); c.fill(); c.strokeStyle = '#6A4620'; c.lineWidth = 1; c.beginPath(); c.ellipse(179, GY - 22, 7, 2.6, 0, 0, TAU); c.stroke();
  const cutDone = chop >= 0 && hitT > 1.05;                                          /* the log splits on the blow at 1.05 s of each 1.6 */
  if (!cutDone){ c.fillStyle = '#B07A3C'; c.fillRect(170, GY - 40, 18, 18); c.fillStyle = '#D8A458'; c.beginPath(); c.ellipse(179, GY - 40, 9, 3.5, 0, 0, TAU); c.fill(); }
  else { const u = Math.min(1, (hitT - 1.05) / 0.5); [-1, 1].forEach(function(d){ c.save(); c.translate(179 + d * (9 + 26 * u), GY - 31 + 8 * u * u * 3); c.rotate(d * u * 1.2); c.fillStyle = '#B07A3C'; c.fillRect(-5, -9, 10, 18); c.fillStyle = '#D8A458'; c.fillRect(-5, -9, 10, 3); c.restore(); }); }
  const pile = Math.min(5, 1 + Math.floor((t % 30) / 1.6)); for (let i = 0; i < pile; i++){ const px = 134 + (i % 3) * 20 - (i > 2 ? 10 : 0), py = GY - 8 - Math.floor(i / 3) * 12 - 0; c.fillStyle = i % 2 ? '#8A5A2A' : '#A06C34'; c.fillRect(px + 70, py + 6, 18, 9); c.fillStyle = '#D8A458'; c.fillRect(px + 70, py + 6, 3, 9); }
  /* the fire: stones, logs, flames and sparks */
  c.fillStyle = '#6A6E72'; for (let i = 0; i < 7; i++){ const an = i / 7 * TAU; c.beginPath(); c.ellipse(340 + Math.cos(an) * 26, GY - 2 + Math.sin(an) * 5, 6, 4, 0, 0, TAU); c.fill(); }
  campSceneRay(c, 322, GY - 4, 358, GY - 12, 6, '#5A3A1C'); campSceneRay(c, 322, GY - 12, 358, GY - 4, 6, '#6A4620');
  const fh = (26 + 28 * Math.max(0.15, Math.min(1, fill))) * fl;
  c.fillStyle = '#FF7A22'; c.beginPath(); c.moveTo(340, GY - 8 - fh); c.bezierCurveTo(358, GY - 8 - fh * 0.5, 360, GY - 8, 340, GY - 6); c.bezierCurveTo(320, GY - 8, 322, GY - 8 - fh * 0.5, 340, GY - 8 - fh); c.fill();
  c.fillStyle = '#FFC24A'; c.beginPath(); c.moveTo(340 + Math.sin(tw * 7) * 2, GY - 8 - fh * 0.66); c.bezierCurveTo(350, GY - 8 - fh * 0.3, 350, GY - 8, 340, GY - 7); c.bezierCurveTo(330, GY - 8, 330, GY - 8 - fh * 0.3, 340 + Math.sin(tw * 7) * 2, GY - 8 - fh * 0.66); c.fill();
  if (fxLevelNow() > 0) for (let i = 0; i < 7; i++){ const u = ((tw * 0.5 + i * 0.37) % 1), sx = 340 + Math.sin(i * 5.1 + tw) * (6 + u * 16), sy = GY - 14 - fh * 0.6 - u * 70; c.fillStyle = 'rgba(255,' + (190 - u * 80 | 0) + ',80,' + (1 - u).toFixed(2) + ')'; c.fillRect(sx, sy, 2.2, 2.2); }
  /* the lantern on its post */
  campSceneRay(c, 590, GY, 590, GY - 52, 3, "#6A4A2A"); campSceneRay(c, 590, GY - 52, 602, GY - 52, 3, '#6A4A2A'); c.fillStyle = 'rgba(255,200,112,.16)'; c.beginPath(); c.arc(602, GY - 42, 26, 0, TAU); c.fill(); c.fillStyle = '#FFC870'; c.fillRect(598, GY - 50, 9, 13); c.fillStyle = "#6A4A2A"; c.fillRect(597, GY - 52, 11, 3);
  /* what she is doing */
  const g = { neck: 0.12, head: 0, face: 1, ph: S.walk ? (S.walk * t * 7) : 0, walk: S.walk !== 0 ? 1 : 0, sit: 0, item: null, itemA: 0, dip: 0 };
  let enemies = [], fx = [];
  if (S.mode === 'chop'){
    const u = hitT / 1.6;
    const s2 = u < 0.5 ? 0 : u > 0.66 && u < 0.82 ? 1 : u >= 0.82 ? 1 - (u - 0.82) / 0.18 : (u - 0.5) / 0.16;
    g.item = 'axe'; g.neck = 0.55 + 0.95 * s2; g.head = -0.2 + 0.25 * s2; g.itemA = -1.25 + 2.2 * s2 + 0.1 * Math.sin(tw * 2); g.dip = s2 * 1.4;
    if (hitT > 1.05 && hitT < 1.4){ const v = (hitT - 1.05) / 0.35; for (let i = 0; i < 8; i++) fx.push([179 + (i - 4) * 5 * v, GY - 30 - Math.sin(v * 3 + i) * 18 * v + v * v * 30, 2.2, 'rgba(216,164,88,' + (1 - v).toFixed(2) + ')']); }
  } else if (S.mode === 'walk'){
    g.neck = 0.12 + Math.sin(g.ph * 2) * 0.03; g.face = S.walk < 0 ? -1 : 1;
  } else if (S.mode === 'sit'){
    g.sit = S.sit; g.walk = 0; g.neck = 0.1 - 0.22 * S.sit * (0.5 + 0.5 * Math.sin(tw * 0.5)) + 0.02; g.head = 0.18 * Math.sin(tw * 0.7);
  } else if (S.mode === 'fight'){
    const bow = Math.floor(t / 30) % 2 === 1, f = S.f; g.item = bow ? 'bow' : 'sword';
    if (!bow){
      const arrive = function(f0){ return Math.max(495, 630 - 80 * (f - f0)); };
      [[0, 2.1], [3, 5.1]].forEach(function(e){
        const f0 = e[0], hit = e[1]; if (f < f0 || f > hit + 0.6) return;
        const post = f - hit; let ex = arrive(f0), kick = 0, flash = 0, shrink = 1;
        if (post > 0){ kick = Math.min(30, post * 140); flash = Math.max(0, 1 - post * 3); shrink = Math.max(0.2, 1 - post * 1.4); }
        enemies.push({ x: ex, kick: kick, flash: flash, shrink: shrink, ph: f * 11 * (post > 0 ? 0 : 1) });
        if (post > 0.2 && post < 0.6) fx.push(['poof', ex + 30, GY - 22, (post - 0.2) / 0.4]);
      });
      const sl = [1.85, 4.85].reduce(function(b, h){ return f >= h && f < h + 0.55 ? (f - h) / 0.55 : b; }, -1);       /* a slash: raise, cut down, come back */
      const k = sl < 0 ? 0 : sl < 0.35 ? sl / 0.35 : 1 - (sl - 0.35) / 0.65;
      g.neck = 0.35 + 0.75 * k; g.head = -0.1 + 0.2 * k; g.itemA = -1.7 + 2.5 * k; g.dip = k;
      if (sl >= 0.3 && sl < 0.6){ c.save(); c.strokeStyle = 'rgba(255,255,255,' + (0.8 - (sl - 0.3) * 2.4).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(S.x + 52, GY - 78, 52, -0.9, 0.9); c.stroke(); c.restore(); }
    } else {
      const shots = [1.6, 4.2], starts = [0, 2.6];
      shots.forEach(function(sf, i){
        const f0 = starts[i], ex = 630 - 40 * (f - f0), hitF = i ? 4.45 : 1.85;
        if (f >= f0 && f < hitF + 0.6){
          const post = f - hitF; let x = ex, kick = 0, flash = 0, shrink = 1;
          if (post > 0){ x = 630 - 40 * (hitF - f0); kick = Math.min(26, post * 120); flash = Math.max(0, 1 - post * 3); shrink = Math.max(0.2, 1 - post * 1.4); }
          enemies.push({ x: x, kick: kick, flash: flash, shrink: shrink, ph: post > 0 ? 0 : f * 11 });
          if (post > 0.2 && post < 0.6) fx.push(['poof', x + 30, GY - 22, (post - 0.2) / 0.4]);
        }
        if (f >= sf && f < hitF) fx.push(['arrow', S.x + 62 + (f - sf) * 360, GY - 90]);
      });
      const nxt = shots.find(function(sf){ return f < sf + 0.1; }), draw = nxt == null ? 0 : Math.max(0, Math.min(1, 1 - (nxt - f) / 0.9));
      g.neck = 0.55; g.head = -0.25; g.itemA = 0.0; g.draw = draw; g.arrow = draw > 0 && (nxt != null);
    }
  }
  campSceneGiraffe(c, S.x, GY, g);
  enemies.forEach(function(e){ campSceneEnemy(c, e.x, GY, e); });
  fx.forEach(function(p){
    if (p[0] === 'poof') campScenePoof(c, p[1], p[2], p[3]);
    else if (p[0] === 'arrow'){ campSceneRay(c, p[1], p[2], p[1] + 30, p[2], 1.8, '#D8C8A0'); c.fillStyle = '#C8CCD4'; c.beginPath(); c.moveTo(p[1] + 30, p[2] - 3); c.lineTo(p[1] + 38, p[2]); c.lineTo(p[1] + 30, p[2] + 3); c.fill(); }
    else { c.fillStyle = p[3]; c.fillRect(p[0], p[1], p[2], p[2]); }
  });
  c.fillStyle = 'rgba(8,12,20,.18)'; c.fillRect(0, 0, W, H);
}
/* the loop: runs while the Camp tab is showing, and draws one still frame when Visual effects are off */
function campSceneFrame(now){
  const cv = document.getElementById('campCanvas');
  if (!cv || !(G.state === 'shop' && shopTab === 'camp')){ CAMP_SCENE.raf = 0; return; }
  const dt = Math.min(0.1, (now - (CAMP_SCENE.last || now)) / 1000); CAMP_SCENE.last = now;
  const still = fxLevelNow() <= 0, t = CAMP_SCENE.fixT >= 0 ? CAMP_SCENE.fixT : still ? 12 : (CAMP_SCENE.t += dt);
  if (!still || !cv.dataset.drawn || CAMP_SCENE.fixT >= 0){ campSceneDraw(cv.getContext('2d'), t, CAMP_SCENE.fill); cv.dataset.drawn = '1'; }
  CAMP_SCENE.raf = still || CAMP_SCENE.fixT >= 0 ? 0 : requestAnimationFrame(campSceneFrame);
}
function campSceneMount(fill){
  CAMP_SCENE.fill = fill; if (CAMP_SCENE.raf){ cancelAnimationFrame(CAMP_SCENE.raf); CAMP_SCENE.raf = 0; }
  CAMP_SCENE.last = 0; CAMP_SCENE.raf = requestAnimationFrame(campSceneFrame);
}
