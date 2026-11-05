'use strict';
/* =============================================================================================================================
   44zzzzl-sky-extras.js  --  WHAT CHAPTER 17.5, THE AIR CHASE, ADDS AROUND THE GAME: its card on the menu (and the round window's own picture: the
   town helicopter over the sea with drones round it), its Bestiary page, its Guide page, two coat colors (Sky Ace, WARD 58, for finishing it; Cloud
   Nine, WARD 59, for three stars in its minigame), three achievements, its two films in the Films list, the minigame Sky Patrol, and the wreck of LAB-1 on
   the quay in the Harbor once the chase is won. Like the Fort and the island, the chase is played on its own, so the minigame's way on is "See the results".
   ============================================================================================================================= */
CHAPTER_INFO.push({ name: 'The Air Chase', biome: 'sky', cast: ['hyena', 'cheetah', 'rhino', 'wildfire'],
  desc: 'LAB-1 is running west over the sea, and the town helicopter is right behind it. Shoot down its drones and its hired escorts, from the nose gun and both side doors, and bring the White Bird down.' });
BESTIARY_CHAPTERS.push('The Air Chase');
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1) || {}; return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);
WARD.push({ name: 'Sky Ace', c: '#E8823A' }, { name: 'Cloud Nine', c: '#DCE8F4' });          /* 58 and 59 */
WARD_MG[59] = SKY_CHAPTER;
MINI_STAR[SKY_CHAPTER] = { t: [34, 44], lab: ['24', '34', '44'] };
MINI_STAR_CHAPTERS.push(SKY_CHAPTER);
(function(){ const er = miniEndsRun; miniEndsRun = function(ch){ return ch === SKY_CHAPTER || er.apply(this, arguments); }; })();

/* ---- the menu: the round window's picture, and the card's small print ---- */
(function(){
  const dp = drawMenuPreview;
  drawMenuPreview = function(){
    if (menuChapter() !== SKY_CHAPTER) return dp.apply(this, arguments);
    const cv = document.getElementById('chPreview'); if (!cv || !cv.getContext) return;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, t = G.time;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    try {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3A4A6A'); g.addColorStop(1, '#1A2A44'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++){ const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * W, y = ((i * 37 + t * 60 * (0.8 + (i % 5) * 0.1)) % (H + 30)) - 15; c.strokeStyle = i % 4 ? 'rgba(230,246,255,.18)' : 'rgba(255,200,140,.4)'; c.lineWidth = 1 + i % 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16 + i % 6 * 4, y); c.stroke(); }
      const cast = ['hyena', 'grub', 'cheetah', 'jackal', 'rhino'];
      cast.forEach(function(k, i){ const d = ETYPES_SKY[k], a = i / cast.length * TAU + t * 0.4, x = W / 2 + Math.cos(a) * 130, y = H / 2 + Math.sin(a) * 120;
        c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); SKY_DRAW[d.look](c, { r: d.r * (k === 'rhino' ? 0.8 : 1.3), anim: t * 3 + i }, d.color, d.dark, 0, false, d); c.restore(); });
      c.save(); c.translate(W / 2, H / 2 + Math.sin(t * 1.3) * 4); c.rotate(-Math.PI / 2); skyHeliTop(c, 62, SKY_PAL.town, { open: true, gun: true, noRotor: true });
      drawTopGiraffe(c, 8, 0, 0, 0.36, 0, { neck: 26 }); skyRotor(c, -3, 0, 80, t * 20, 4, false); c.restore();
      const v = c.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,10,20,.4)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    } catch (e) {}
    c.restore();
  };
  const cs = chapterSelectorHTML;
  chapterSelectorHTML = function(){
    const h = cs.apply(this, arguments);
    return menuChapter() === SKY_CHAPTER ? h.replace('Straight to wave ' + SKY_FIRST_WAVE + '. No cards to start.', 'Into the air: a sky shooter, ten waves and two bosses.') : h;
  };
  const fl = filmList;
  filmList = function(){
    const L = fl.apply(this, arguments), d = Save.data || {};
    L.push({ kind: 'skyin', title: 'The Cargo Door', sub: 'Low over the sea at sundown, LAB-1 ahead, and dozens of drones coming out of it.', un: !!d.chapter18Complete });
    L.push({ kind: 'skyout', title: 'The White Bird Goes Down', sub: 'LAB-1 in the sea, the coast guard alongside, and two scientists caught.', un: !!d.chapter19Complete });
    return L;
  };
})();

/* ---- the Guide's page ---- */
(function(){
  const i = GUIDE_TOPICS.findIndex(function(t){ return t.id === 'isle'; });
  GUIDE_TOPICS.splice(i < 0 ? GUIDE_TOPICS.length : i + 1, 0, { id: 'sky', title: 'Chapter 17.5: The Air Chase', show: function(){ return !!(Save.data && Save.data.chapter18Complete); }, html: function(){
    const t = Input.hasTouch, k = function(a){ return '<b>' + keyName(keyOf(a)) + '</b>'; };
    return '<p><b>Ten waves</b> (436 to 445) in the air, after LAB-1, the scientists’ white helicopter. It opens when you finish Chapter 17. This one is a sky shooter: the town helicopter flies up the screen over the sea, and she fights from its cabin.</p><ul class="helplist">' +
      '<li><b>Steering.</b> ' + (t ? 'Hold a finger on the screen: the helicopter flies toward it (a little above your finger, so you can see her).' : 'WASD or the arrow keys, or hold the mouse button and it flies toward the pointer.') + '</li>' +
      '<li><b>Three guns.</b> The nose gun fires straight ahead, the two door guns straight out to the left and right. She is at one of them at a time, and it fires by itself. ' +
        (t ? 'The three round buttons move her to the left door, the nose or the right door.' : k('skyLeft') + ', ' + k('skyNose') + ' and ' + k('skyRight') + ' move her to the left door, the nose and the right door (change them on the Controls page).') +
        ' Moving takes a moment, with no shots while she does. The door guns hit a third harder.</li>' +
      '<li><b>The aiming line.</b> A dotted line shows where each gun fires, the one she is at brightest. ' + (t ? 'The small round button on the left' : k('skyAim')) + ' turns it on and off.</li>' +
      '<li><b>Your gear counts.</b> The hull is 100 plus your extra health, your damage reduction softens every hit, regeneration patches the hull, and your damage, haste and crits power the guns.</li>' +
      '<li><b>The drones.</b> Rotor Drones ram. Net Drones throw nets that slow you. Mine Drones blink and blow up when you get close, or when you shoot them, and hurt the drones round them too. Laser Drones show a thin red line first: get out of it. Carrier Drones let out three more when they go down.</li>' +
      '<li><b>The escorts.</b> Hired gunships come in from the sides and fire bursts: the door guns are for them. They break off after a while if they are not shot down. Wave 440 is the <b>Grey Escort</b>, two big ones at once.</li>' +
      '<li><b>The White Bird</b> (wave 445) fights three ways, worse as it is hurt: dropping drones, then side on with its gun, then smoking, weaving and diving at you.</li>' +
      '<li>After waves 437, 439, 441 and 443 you pick one of three upgrades for the helicopter. Shot down, you can start again from wave 436, or from wave 441 once the Grey Escort is down. <b>Esc</b> pauses.</li>' +
      '<li>Bring the White Bird down and you win the coat color <b>Sky Ace</b>, gems and gold, and the wreck of LAB-1 goes on show on the quay in the Harbor. Its minigame is <b>Sky Patrol</b>.</li></ul>';
  } });
})();

/* ---- achievements ---- */
ACH.push(
  { id: 'ch175', cat: 'run', name: 'Grounded', desc: 'Clear Chapter 17.5, the Air Chase: bring down the White Bird', goal: 1, gems: 60, val: function(){ return Save.data && Save.data.chapter19Complete ? 1 : 0; } },
  { id: 'skyclean', cat: 'run', name: 'Clean Skies', desc: 'Beat the White Bird without being hit', goal: 1, gems: 80, val: function(){ return Save.data && Save.data.skyClean ? 1 : 0; } },
  { id: 'skyesc', cat: 'run', name: 'Escort Duty', desc: 'Clear the Air Chase with every hired escort gunship shot down, none let get away', goal: 1, gems: 50, val: function(){ return Save.data && Save.data.skyEscorts ? 1 : 0; } }
);

/* ---------- Sky Patrol: the nose gun, a stream of drones, three hits and the helicopter has to go home ---------- */
registerMini({
  ch: SKY_CHAPTER, id: 'skypatrol', name: 'Sky Patrol', unit: 'drones', dur: 45, goal: 24,
  blurb: 'One more patrol over the sea before the helicopter goes back to the hangar.\nThe lab left a lot of drones behind.',
  hint: 'Steer with WASD or the arrow keys, or hold the mouse button to fly toward the pointer.\nThe nose gun fires by itself. Three hits and the patrol is over.',
  touchHint: 'Drag your finger: the helicopter flies toward it.\nThe nose gun fires by itself. Three hits and the patrol is over.',
  goalText: 'Goal: down 24 drones in 45 seconds',
  init: function(m, g){ m.p = { x: g.W / 2, y: g.H * 0.8 }; m.lives = 3; m.inv = 0; m.dr = []; m.sh = []; m.fire = 0; m.spawnT = 0.4; m.R = miniRng(175); },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt;
    p.x = clamp(p.x + st.x * 330 * s * dt, 40 * s, g.W - 40 * s); p.y = clamp(p.y + st.y * 330 * s * dt, g.H * 0.35, g.H * 0.92);
    m.fire -= dt; if (m.fire <= 0){ m.fire = 0.14; m.sh.push({ x: p.x - 6 * s, y: p.y - 50 * s }, { x: p.x + 6 * s, y: p.y - 50 * s }); }
    m.spawnT -= dt; if (m.spawnT <= 0){ m.spawnT = Math.max(0.3, 0.75 - m.time * 0.01); const k = m.R() < 0.75 ? 'hyena' : 'jackal'; m.dr.push({ k: k, x: g.W * (0.08 + m.R() * 0.84), y: -30 * s, hp: k === 'hyena' ? 2 : 1, ph: m.R() * 6, t: 0, vy: (110 + m.time * 2.6) * s * (k === 'jackal' ? 0.7 : 1) }); }
    for (let i = m.sh.length - 1; i >= 0; i--){ const b = m.sh[i]; b.y -= 900 * s * dt; if (b.y < -10){ m.sh.splice(i, 1); continue; }
      for (let j = 0; j < m.dr.length; j++){ const d = m.dr[j]; if (Math.hypot(b.x - d.x, b.y - d.y) < 22 * s){ d.hp--; m.sh.splice(i, 1); if (d.hp <= 0){ m.dr.splice(j, 1); m.score++; miniBurst(m, d.x, d.y, 10, '#FFC870', { speed: 160, r: 3, life: 0.5 }); SFX.pickupS && SFX.pickupS(); } break; } } }
    for (let i = m.dr.length - 1; i >= 0; i--){ const d = m.dr[i]; d.t += dt; d.y += d.vy * dt; if (d.k === 'hyena') d.x += Math.cos(d.t * 2.4 + d.ph) * 70 * s * dt;
      if (d.y > g.H + 30 * s){ m.dr.splice(i, 1); continue; }
      if (Math.hypot(d.x - p.x, d.y - p.y) < 40 * s){ m.dr.splice(i, 1); miniHurt(m, p.x, p.y - 40 * s, d.k === 'jackal' ? 'Mine!' : 'Rammed!'); } }
  }
});
function skyPatrolSea(c, w, h, s, rng){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2E5A7A'); g.addColorStop(1, '#1A3A56'); c.fillStyle = g; c.fillRect(0, 0, w, h);
}
MINI[SKY_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'skypatrol', skyPatrolSea, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  for (let i = 0; i < 50; i++){ const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * W, y = ((i * 53.3 + t * 240 * s * (0.8 + (i % 5) * 0.08)) % (H + 40)) - 20; ctx.strokeStyle = i % 4 ? 'rgba(230,246,255,.16)' : 'rgba(255,214,150,.35)'; ctx.lineWidth = (1 + i % 3) * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (16 + i % 7 * 6) * s, y); ctx.stroke(); }
  m.sh.forEach(function(b){ ctx.fillStyle = '#FFD27A'; ctx.fillRect(b.x - 1.6 * s, b.y - 8 * s, 3.2 * s, 14 * s); });
  m.dr.forEach(function(d){ const def = ETYPES_SKY[d.k]; ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(Math.PI / 2); SKY_DRAW[def.look](ctx, { r: def.r * s * 1.3, anim: t * 3 + d.ph }, def.color, def.dark, 0, false, def); ctx.restore(); });
  m.focus = { x: p.x, y: p.y };
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-Math.PI / 2); if (m.inv > 0 && Math.floor(t * 14) % 2) ctx.globalAlpha = 0.5;
  skyHeliTop(ctx, 46 * s, SKY_PAL.town, { open: true, gun: true, noRotor: true }); drawTopGiraffe(ctx, 6 * s, 0, 0, 0.27 * s, 0, { neck: 26 }); skyRotor(ctx, -2 * s, 0, 58 * s, t * 26, 4, false);
  ctx.restore();
};

/* ---- the wreck of LAB-1, on the quay in the Harbor, once the chase is won ---- */
TOWN_DIST.harbour.p.push({ k: 'skywreck', x: 1822 });
(function(){
  const tp = townProp;
  townProp = function(c, D, p, P, r){
    if (p.k !== 'skywreck') return tp.apply(this, arguments);
    if (!(Save.data && Save.data.chapter19Complete)) return;
    const x = p.x;
    c.save();
    tEll(c, 'rgba(0,0,0,.2)', x, TG + 4, 96, 9);
    tRect(c, '#6A4A32', x - 70, TG - 18, 34, 18); tRect(c, '#6A4A32', x + 30, TG - 18, 34, 18); tRect(c, '#5A3C28', x - 74, TG - 22, 42, 5); tRect(c, '#5A3C28', x + 26, TG - 22, 42, 5);     /* the wooden blocks it sits on */
    c.save(); c.translate(x - 6, TG - 46); c.rotate(-0.06); domeHeli(c, { x: 0, y: 0, s: 0.46, t: 0, spin: 0, pal: IL_LAB_HELI }); c.restore();
    tPoly(c, 'rgba(40,36,34,.45)', [x - 30, TG - 52, x - 10, TG - 64, x + 6, TG - 48, x - 18, TG - 40]);                                                                                  /* scorch on the engine cover */
    tRect(c, '#4A3A2C', x + 104, TG - 44, 4, 44);                                                                                                                                         /* its sign, on a post */
    tRound(c, '#3A2A1E', x + 72, TG - 94, 68, 52, 5); tRound(c, '#E8E0C8', x + 75, TG - 91, 62, 46, 4);
    c.fillStyle = '#2A2A2A'; c.font = 'bold 12px system-ui'; c.textAlign = 'center'; c.fillText('LAB-1', x + 106, TG - 75); c.font = '9px system-ui'; c.fillText('shot down', x + 106, TG - 62); c.fillText('at sea', x + 106, TG - 51);
    c.restore();
  };
})();
