'use strict';
/* Coat colours and patterns: every chapter finished gives one colour and one spot pattern, and the giraffe's skin, spots,
   spot pattern and gear accent can each be chosen from what she has earned. */
/* ========================= 44e. WARDROBE ========================= */
/* Save.data.skinCol, spotCol, patCol and gearCol each hold 0 (her own) or a chapter number 1-13; chapter N's colour and pattern are
   available once Save.data.chapterNComplete is set. drawPlayer() (33-giraffe-art.js) paints with giraffeColours(), giraffePattern()
   and giraffeAccent(); the films' giraffe (csGiraffe, the forage minigame, the pod) uses giraffeCustom() and giraffePattern(). */
const WARD = [null,
  { name: 'Sunbaked Gold', c: '#E9B648' }, { name: 'Frostfur', c: '#DDE9F4' }, { name: 'Bogmoss', c: '#8F9B4B' }, { name: 'Abyss', c: '#3E8FB8' },
  { name: 'Emerald', c: '#6FBF4F' }, { name: 'Neon Dusk', c: '#C768AE' }, { name: 'Starlight', c: '#7A92EA' }, { name: 'Moonstone', c: '#C9CDD9' },
  { name: 'Sulfur', c: '#E6D23A' }, { name: 'Ember', c: '#E4602B' }, { name: 'Glimmer', c: '#B27EF2' }, { name: 'Signal', c: '#55E39B' },
  { name: 'Rust', c: '#C9603B' }
];
const WARD_PATTERNS = ['Classic blotches', 'Savanna patches', 'Snow flecks', 'Bog stripes', 'Ocean rings', 'Jungle rosettes', 'City dots', 'Starfield',
  'Craters', 'Venus diamonds', 'Flames', 'Glimmer sparkles', 'Hex grid', 'Dune ripples'];
const WARD_CLASSIC = { name: 'Her own', coat: '#D6A44F', spot: '#8A5A24', dark: '#A8762F' };

/* Thirteen more colours, one for each minigame, earned by getting all three stars in it (js/44k-minigame-rewards.js). They are
   numbers 14 to 26 in skinCol, spotCol and gearCol (patterns stay 0 to 13): colour 13 + n belongs to the minigame after chapter n. */
const WARD_STAR = [
  ['Waterhole Teal', '#2FB5A0'], ['Berry Wine', '#A32A55'], ['Lotus Pink', '#F59AC2'], ['Shell Coral', '#FF7F6B'], ['Mango', '#FFA62B'], ['Skyline Cyan', '#2FD8F2'],
  ['Nebula Violet', '#6A3FE0'], ['Moon Cheese', '#F5E6A0'], ['Acid Green', '#8CFF2E'], ['Magma Red', '#D81E2B'], ['Crystal Aqua', '#8AF1FF'], ['Data Blue', '#2F6BFF'],
  ['Worm Purple', '#7A3C8F']
];
WARD_STAR.forEach(function(w){ WARD.push({ name: w[0], c: w[1] }); });
/* Five more, hidden around Longneck Town (js/44u-town-data.js, the items with a swatch): numbers 27 to 31, the last the 5 bits of a photo code
   can carry. The third entry is the town item that unlocks the colour. */
const WARD_TOWN = [['Brickwork', '#B5543C', 'pk_sw'], ['Sea Glass', '#7FD1C0', 'hb_sw'], ['Slate Roof', '#5C6B80', 'rf_sw'], ['Midnight Navy', '#26307A', 'ln_sw'], ['Glowcap', '#9BFF7A', 'bw_sw'],
  ['Gold Leaf', '#D4AF37', 'gift_barnaby'], ['Honey Glaze', '#E8A838', 'gift_penny'], ['Paint Blush', '#E86AA0', 'gift_mim'], ['Confetti', '#FF6AD5', 'gift_dot']];       /* 32 to 35: a best friend's own colour (townGrantGift in 44zb) */
/* 36 to 41: found out at sea, in the air and in the two villages (js/44zs-explore-rewards.js) */
WARD_TOWN.push(['Jet Stream', '#8ED0F0', 'fl_sw'], ['Seafoam', '#6FD8B8', 'sea_sw1'], ['Coral Reef', '#F0707A', 'sea_sw2'], ['Cornfield', '#E8C44A', 'fm_sw1'], ['Harvest Orange', '#E8862A', 'fm_sw2'], ['Shell Pink', '#F4C4D0', 'is_sw1'], ['Gold Medal', '#E8B830', 'gym_gold']);
WARD_TOWN.forEach(function(w){ WARD.push({ name: w[0], c: w[1] }); });
const WARD_MAX = 47;                                    /* 43 to 45: the university ranks Graduate, Professor and Chancellor (js/44zz-campus.js); 46: Frost Mylar, for finishing Chapter 13.5; 47: Executive Navy, for finishing Chapter 14 */
function wardStarOf(n){ const s = Save.data && Save.data.mini && Save.data.mini.stars; return s ? (s[n - 13] | 0) : 0; }
function wardUnlocked(n){
  if (n === 0) return true;
  if (n === 47) return !!(Save.data && Save.data.chapter15Complete);                                                            /* Executive Navy: Chapter 14, the Tower */
  if (n === 46) return !!(Save.data && Save.data.chapter14Complete);                                                            /* Frost Mylar: Chapter 13.5 */
  if (n >= 27 && n <= WARD_MAX){ const t = Save.data && Save.data.town; return !!(t && t.found && t.found[WARD_TOWN[n - 27][2]]); }      /* found in the town */
  if (n >= 14 && n <= 26) return wardStarOf(n) >= 3;
  return n >= 1 && n <= 13 && !!(Save.data && Save.data['chapter' + n + 'Complete']);
}
function wardCount(){ let k = 0; for (let n = 1; n <= 13; n++) if (wardUnlocked(n)) k++; return k; }
function wardChoice(key){ const n = (Save.data && Save.data[key]) | 0; return n >= 1 && n <= (key === 'patCol' ? 13 : WARD_MAX) && wardUnlocked(n) ? n : 0; }
function wardShade(hex, k){ const c = colRGB(hex); return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')'; }
let _wardKey = '', _wardVal = WARD_CLASSIC;
function wardColoursFor(s, p){
  if (!s && !p) return WARD_CLASSIC;
  const coat = s ? WARD[s].c : WARD_CLASSIC.coat;
  let spot = p ? WARD[p].c : WARD_CLASSIC.spot;
  if (s && p && s === p) spot = wardShade(coat, 0.6);                 /* the same colour for both: the spots are a deeper shade of it */
  return { coat: coat, spot: spot, dark: s ? wardShade(coat, 0.78) : WARD_CLASSIC.dark };
}
function giraffeColours(){
  const s = wardChoice('skinCol'), p = wardChoice('spotCol'), key = s + ',' + p;
  if (key !== _wardKey){ _wardKey = key; _wardVal = wardColoursFor(s, p); }
  return _wardVal;
}
function giraffeCustom(){ const c = giraffeColours(); return c === WARD_CLASSIC ? null : c; }       /* the films keep their own colours unless she has changed hers */
function giraffePattern(){ return wardChoice('patCol'); }
function giraffeAccent(){ const n = wardChoice('gearCol'); return n ? WARD[n].c : null; }

/* One spot, drawn in the shape of the chosen pattern. pat 0 is the classic ellipse; the size and place come from the caller, so
   every giraffe drawing in the game can use it. Uses the current fill colour (and the same colour for outlines). */
function wardSpot(ctx, pat, x, y, rx, ry, rot){
  if (!pat){ ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); return; }
  const col = ctx.fillStyle, r = Math.max(rx, ry);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.strokeStyle = col; ctx.lineCap = 'round';
  switch (pat){
    case 1:  ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.2, ry * 0.95, 0, 0, TAU); ctx.ellipse(rx * 0.7, -ry * 0.5, rx * 0.5, ry * 0.45, 0, 0, TAU); ctx.fill(); break;     /* patches */
    case 2:  ctx.beginPath(); for (let k = 0; k < 4; k++){ const a = k * 1.7 + 0.4; ctx.moveTo(Math.cos(a) * rx * 0.7 + r * 0.3, Math.sin(a) * ry * 0.7); ctx.arc(Math.cos(a) * rx * 0.7, Math.sin(a) * ry * 0.7, r * 0.3, 0, TAU); } ctx.fill(); break;   /* flecks */
    case 3:  ctx.fillRect(-rx, -ry * 0.75, rx * 2, ry * 0.5); ctx.fillRect(-rx * 0.8, ry * 0.15, rx * 1.6, ry * 0.5); break;                                            /* stripes */
    case 4:  ctx.lineWidth = Math.max(1, ry * 0.4); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.8, ry * 0.7, 0, 0, TAU); ctx.stroke(); break;                           /* rings */
    case 5:  ctx.lineWidth = Math.max(1, ry * 0.32); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.9, ry * 0.8, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, TAU); ctx.fill(); break;   /* rosettes */
    case 6:  ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, TAU); ctx.fill(); break;                                                                                       /* dots */
    case 7:  ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k * Math.PI / 4, rr = k % 2 ? r * 0.3 : r * 0.95; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); break;   /* stars */
    case 8:  ctx.lineWidth = Math.max(1, ry * 0.3); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.85, ry * 0.75, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.1, r * 0.3, 0, TAU); ctx.fill(); break;   /* craters */
    case 9:  ctx.beginPath(); ctx.moveTo(0, -ry); ctx.lineTo(rx, 0); ctx.lineTo(0, ry); ctx.lineTo(-rx, 0); ctx.closePath(); ctx.fill(); break;                       /* diamonds */
    case 10: ctx.beginPath(); ctx.moveTo(0, -ry * 1.15); ctx.quadraticCurveTo(rx * 0.95, -ry * 0.1, rx * 0.5, ry * 0.7); ctx.quadraticCurveTo(0, ry * 1.1, -rx * 0.5, ry * 0.7); ctx.quadraticCurveTo(-rx * 0.95, -ry * 0.1, 0, -ry * 1.15); ctx.fill(); break;   /* flames */
    case 11: ctx.lineWidth = Math.max(1, r * 0.28); ctx.beginPath(); ctx.moveTo(-rx, 0); ctx.lineTo(rx, 0); ctx.moveTo(0, -ry); ctx.lineTo(0, ry); ctx.stroke(); break;   /* sparkles */
    case 12: ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * Math.PI / 3; ctx.lineTo(Math.cos(a) * rx * 0.95, Math.sin(a) * ry * 0.95); } ctx.closePath(); ctx.fill(); break;   /* hexes */
    default: ctx.lineWidth = Math.max(1, ry * 0.3); ctx.beginPath(); ctx.arc(-rx * 0.2, 0, r * 0.45, -1.2, 1.2); ctx.stroke(); ctx.beginPath(); ctx.arc(rx * 0.25, 0, r * 0.8, -1.2, 1.2); ctx.stroke();   /* ripples */
  }
  ctx.restore();
}

function wardrobeButtonHTML(){
  return '<button class="btn ghost" data-a="wardrobe">Coat colours<small>' + wardCount() + ' of 13 colours and patterns unlocked</small></button>';
}
function wardSwatches(kind, cur){
  let h = '<div class="swatches">';                                       /* one list: her own, the chapter colours, then the minigame colours */
  const last = kind === 'pat' ? 13 : WARD_MAX;
  for (let n = 0; n <= last; n++){
    const un = wardUnlocked(n), on = n === cur, col = n ? WARD[n].c : WARD_CLASSIC.coat;
    const chap = typeof BESTIARY_CHAPTERS !== 'undefined' ? BESTIARY_CHAPTERS[n - 1] : '';
    const mg = n > 13 && n <= 26 && typeof MINI !== 'undefined' && MINI[n - 13] ? MINI[n - 13].name : '';
    const nm = kind === 'pat' ? WARD_PATTERNS[n] : n ? WARD[n].name : (kind === 'gear' ? 'Her gear’s own colours' : 'Her own colours');
    const label = nm + (n === 47 ? ' (Chapter 14, The Tower)' : n === 46 ? ' (Chapter 13.5, The Domes)' : n > 31 ? ' (a best friend\u2019s gift)' : n > 26 ? ' (hidden in Longneck Town)' : n > 13 ? ' (three stars in ' + mg + ')' : n ? ' (Chapter ' + n + ', ' + chap + ')' : '');
    const style = kind === 'pat' ? '' : ' style="background:' + (n ? col : 'linear-gradient(135deg,' + (kind === 'gear' ? '#9A6A38 55%,#C9CDD9 55%' : WARD_CLASSIC.coat + ' 55%,' + WARD_CLASSIC.spot + ' 55%') + ')') + '"';
    h += '<button class="swatch' + (kind === 'pat' ? ' pat' : '') + (on ? ' on' : '') + (un ? '' : ' locked') + '" data-a="ward-' + kind + '-' + n + '"' + (un ? '' : ' disabled') + style +
      ' title="' + (un ? label : n === 47 ? 'Finish Chapter 14 to unlock' : n === 46 ? 'Finish Chapter 13.5 to unlock' : n > 31 ? 'A gift from a best friend in Longneck Town' : n > 26 ? 'Find this colour hidden in Longneck Town' : n > 13 ? 'Get three stars in ' + mg + ' to unlock' : 'Finish Chapter ' + n + ' to unlock') + '" aria-label="' + label + '">' + (kind === 'pat' ? '<canvas width="30" height="30" data-pat="' + n + '"></canvas>' : '') + '</button>';
  }
  return h + '</div>';
}
function showWardrobe(){
  G.state = 'help'; G.attract = true; G.subScreen = 'wardrobe';
  const s = wardChoice('skinCol'), p = wardChoice('spotCol'), t = wardChoice('patCol'), g = wardChoice('gearCol');
  const head = function(txt, name){ return '<div class="sub" style="margin:12px 0 4px;font-weight:700;color:var(--sun)">' + txt + ': ' + name + '</div>'; };
  setOverlay(
    '<div class="panel slab wide" style="max-width:540px">' +
      '<h2 class="head">Coat colours</h2>' +
      '<p class="sub">Every chapter you finish gives a colour and a spot pattern, and three stars in a minigame gives its own colour. Mix them as you like.</p>' +
      '<canvas id="wardPrev" width="320" height="180" style="display:block;margin:6px auto 10px;max-width:100%;border-radius:10px;background:rgba(20,16,14,.55)"></canvas>' +
      (typeof tipOnce === 'function' ? tipOnce('ward', 'Outfits save a whole look. Each hat and boot you own can be recoloured with any colour you have unlocked, and the Photo button takes a picture of her.') : '') +
      outfitsHTML() +
      head('Skin', s ? WARD[s].name : 'Her own colours') + wardSwatches('skin', s) +
      head('Spots', p ? WARD[p].name : 'Her own colours') + wardSwatches('spot', p) +
      head('Pattern', WARD_PATTERNS[t]) + wardSwatches('pat', t) +
      head('Gear accent', g ? WARD[g].name : 'Her gear’s own colours') + '<div class="sub" style="margin:0 0 4px;font-size:12px">Recolours her cape and armour.</div>' + wardSwatches('gear', g) +
      (typeof accRowsHTML === 'function' ? '<div class="sub" style="margin:14px 0 0;font-size:12px">Hats and boots are won from the minigames after each chapter.</div>' + accRowsHTML() : '') +
      '<div class="row" style="margin-top:18px"><button class="btn sm ghost" data-a="ward-reset">Back to her own</button><button class="btn sm ghost" data-a="ward-photo">Photo</button><button class="btn sm ghost" data-a="ward-album">Album</button><button class="btn sm" data-a="ward-back">Back</button></div>' +
    '</div>');
  paintWardPreview();
}
function paintWardPreview(){
  const cl = giraffeColours(), pat = giraffePattern(), acc = giraffeAccent();
  const cv = document.getElementById('wardPrev');
  if (cv){
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    c.save(); c.translate(W * 0.4, H * 0.76); c.scale(1.9, 1.9);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 14, 28, 8, 0, 0, TAU); c.fill();
    c.fillStyle = cl.dark;
    [[-13, -11], [-13, 11], [12, -10], [12, 10]].forEach(function(l){ c.beginPath(); c.ellipse(l[0], l[1] + 8, 6.2, 4.6, 0, 0, TAU); c.fill(); });
    c.strokeStyle = cl.dark; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, 2); c.quadraticCurveTo(-32, 4, -36, 12); c.stroke();
    c.fillStyle = cl.coat; c.beginPath(); c.ellipse(0, 0, 24, 15, 0, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.ellipse(0, 0, 24, 15, 0, 0, TAU); c.clip(); c.fillStyle = cl.spot;
    if (typeof SPOTS !== 'undefined') for (let i = 0; i < SPOTS.length; i++){ const sp = SPOTS[i]; wardSpot(c, pat, sp.x, sp.y * 0.9, sp.r, sp.r * 0.82, i * 0.7); }
    c.restore();
    c.fillStyle = cl.coat; c.beginPath(); c.moveTo(10, -6); c.lineTo(20, -50); c.lineTo(30, -48); c.lineTo(20, 2); c.closePath(); c.fill();
    c.fillStyle = cl.spot; [[18, -10], [20, -22], [23, -34], [26, -44]].forEach(function(s2, i){ wardSpot(c, pat, s2[0], s2[1], 3.4 - i * 0.3, 2.8 - i * 0.2, 0.3); });
    if (acc){                                                                                    /* her cape in the gear accent */
      c.fillStyle = acc; c.globalAlpha = 0.92; c.beginPath(); c.moveTo(12, -8); c.quadraticCurveTo(-8, -6, -22, 8); c.quadraticCurveTo(-4, 6, 18, 0); c.closePath(); c.fill(); c.globalAlpha = 1;
    }
    c.fillStyle = cl.coat; c.beginPath(); c.ellipse(34, -52, 12, 7.2, -0.25, 0, TAU); c.fill();
    c.fillStyle = cl.dark; c.beginPath(); c.ellipse(42, -50, 5.4, 4.4, -0.25, 0, TAU); c.fill();
    c.strokeStyle = cl.dark; c.lineWidth = 2.4; c.beginPath(); c.moveTo(30, -58); c.lineTo(28, -66); c.moveTo(35, -58); c.lineTo(36, -66); c.stroke();
    c.fillStyle = '#4A2E12'; c.beginPath(); c.arc(28, -67, 2.2, 0, TAU); c.arc(36, -67, 2.2, 0, TAU); c.fill();
    c.fillStyle = '#FFF'; c.beginPath(); c.arc(36, -54, 2.2, 0, TAU); c.fill(); c.fillStyle = '#20140C'; c.beginPath(); c.arc(37, -54, 1.2, 0, TAU); c.fill();
    if (typeof accEquipped === 'function'){                                                      /* the hat and boots she has won (js/44f-minigames.js) */
      const hat = accEquipped('hat'), boot = accEquipped('boot');
      if (boot) [[-13, 19], [12, 18]].forEach(function(l){ c.save(); c.translate(l[0], l[1]); drawBootTop(c, boot.id, 0, false); c.restore(); });      /* only the near pair shows; the far legs are behind the body */
      if (hat) drawHatOnHeadSide(c, hat.id, 0, 34, -52);
    }
    c.restore();
  }
  if (typeof paintAccIcons === 'function') paintAccIcons();
  const sv = Save.data.outfits || [], oc = document.querySelectorAll('canvas[data-outfit]');
  for (let i = 0; i < oc.length; i++){ const o = sv[+oc[i].getAttribute('data-outfit')]; if (o) paintGiraffePortrait(oc[i], outfitClean(o) || o, 0.9); }
  /* each pattern button shows its own shape in the spot colour she has now */
  const pcs = document.querySelectorAll('canvas[data-pat]');
  for (let i = 0; i < pcs.length; i++){
    const q = pcs[i].getContext('2d'), n = +pcs[i].getAttribute('data-pat');
    q.clearRect(0, 0, 30, 30); q.fillStyle = cl.coat; q.beginPath(); q.arc(15, 15, 14, 0, TAU); q.fill();
    q.fillStyle = cl.spot; wardSpot(q, n, 15, 15, 8, 6.5, 0.3);
  }
}
function handleWardAction(a){
  if (typeof handleAccAction === 'function' && handleAccAction(a)) return;                    /* hats and boots (js/44f-minigames.js) */
  if (a === 'wardrobe'){ SFX.click(); showWardrobe(); return; }
  if (a === 'ward-back'){ SFX.click(); showMenu(); return; }
  if (a === 'ward-reset'){ Save.data.skinCol = 0; Save.data.spotCol = 0; Save.data.patCol = 0; Save.data.gearCol = 0; Save.write(); SFX.click(); showWardrobe(); return; }
  const om = /^ward-outfit-(save|wear|clear)-(\d)$/.exec(a);
  if (om){
    const i = +om[2], list = outfitList();
    if (i >= OUTFIT_SLOTS) return;
    if (om[1] === 'save'){ list[i] = outfitNow(); SFX.buy(); }
    else if (om[1] === 'clear'){ list[i] = null; SFX.click(); }
    else {
      const o = outfitClean(list[i]);
      if (!o) SFX.deny();
      else {
        Save.data.skinCol = o.s; Save.data.spotCol = o.p; Save.data.patCol = o.t; Save.data.gearCol = o.g;
        accWear('hat', o.hat); accWear('boot', o.boot);
        const mdw = miniData(); mdw.hatCol = o.hc | 0; mdw.bootCol = o.bc | 0;
        SFX.pick();
      }
    }
    Save.write(); showWardrobe(); return;
  }
  const m = /^ward-(skin|spot|pat|gear)-(\d+)$/.exec(a);
  if (m){
    const n = +m[2], key = { skin: 'skinCol', spot: 'spotCol', pat: 'patCol', gear: 'gearCol' }[m[1]];
    if (wardUnlocked(n) && (m[1] !== 'pat' || n <= 13)){ Save.data[key] = n; Save.write(); SFX.pick(); } else SFX.deny();
    showWardrobe();
  }
}

/* ---- a note when a new colour and pattern are earned ---- */
let _wardToast = null, _wardToastT = 0;
(function(){
  const tick = Feedback.tick;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    if (!Save.data) return;
    if (_wardToastT > 0){ _wardToastT -= dt; if (_wardToastT <= 0 && _wardToast) _wardToast.className = ''; }
    if (!Save.data.wardSeen){                                      /* first time here: what is already earned is not news */
      Save.data.wardSeen = {}; for (let n = 1; n <= 13; n++) if (wardUnlocked(n)) Save.data.wardSeen[n] = 1;
      return;
    }
    if (G.splash || G.state === 'cutscene') return;
    for (let n = 1; n <= 13; n++){
      if (!wardUnlocked(n) || Save.data.wardSeen[n]) continue;
      Save.data.wardSeen[n] = 1; Save.write();
      if (!_wardToast){ _wardToast = document.createElement('div'); _wardToast.id = 'wardToast'; document.body.appendChild(_wardToast); }
      _wardToast.textContent = 'New coat colour and pattern: ' + WARD[n].name + ' and ' + WARD_PATTERNS[n] + '. Find them under Coat colours in the main menu.';
      _wardToast.className = 'on'; _wardToastT = 6.5;
      try { SFX.level(); } catch (e) {}
      break;
    }
  };
})();

/* ---- a small portrait of her in her colours, for the death screen ---- */
function paintGiraffePortrait(cv, o, sc){
  if (!cv || !cv.getContext) return;
  const cur = o || outfitNow(), cl = wardColoursFor(cur.s, cur.p), pat = cur.t, acc = cur.g ? WARD[cur.g].c : null, W = cv.width, H = cv.height;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, W, H);
  c.save(); c.translate(W * 0.42, H * 0.8); c.scale(sc || 0.95, sc || 0.95);
  c.fillStyle = cl.dark; [[-13, -11], [-13, 11], [12, -10], [12, 10]].forEach(function(l){ c.beginPath(); c.ellipse(l[0], l[1] + 8, 6.2, 4.6, 0, 0, TAU); c.fill(); });
  c.fillStyle = cl.coat; c.beginPath(); c.ellipse(0, 0, 24, 15, 0, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 0, 24, 15, 0, 0, TAU); c.clip(); c.fillStyle = cl.spot;
  if (typeof SPOTS !== 'undefined') for (let i = 0; i < SPOTS.length; i++){ const sp = SPOTS[i]; wardSpot(c, pat, sp.x, sp.y * 0.9, sp.r, sp.r * 0.82, i * 0.7); }
  c.restore();
  c.fillStyle = cl.coat; c.beginPath(); c.moveTo(10, -6); c.lineTo(20, -50); c.lineTo(30, -48); c.lineTo(20, 2); c.closePath(); c.fill();
  if (acc){ c.fillStyle = acc; c.beginPath(); c.moveTo(12, -8); c.quadraticCurveTo(-8, -6, -22, 8); c.quadraticCurveTo(-4, 6, 18, 0); c.closePath(); c.fill(); }
  c.fillStyle = cl.coat; c.beginPath(); c.ellipse(34, -52, 12, 7.2, -0.25, 0, TAU); c.fill();
  c.fillStyle = cl.dark; c.beginPath(); c.ellipse(42, -50, 5.4, 4.4, -0.25, 0, TAU); c.fill();
  c.fillStyle = '#20140C'; c.beginPath(); c.arc(37, -54, 1.6, 0, TAU); c.fill();
  _accOv = { hat: cur.hc && WARD[cur.hc] ? WARD[cur.hc].c : null, boot: cur.bc && WARD[cur.bc] ? WARD[cur.bc].c : null };      /* this outfit's own hat and boot colours */
  try {
    if (typeof BOOT_PAL !== 'undefined' && cur.boot && BOOT_PAL[cur.boot]) [[-13, 19], [12, 18]].forEach(function(l){ c.save(); c.translate(l[0], l[1]); drawBootTop(c, cur.boot, 0, false); c.restore(); });
    if (typeof ACC_BY_ID !== 'undefined' && cur.hat && ACC_BY_ID[cur.hat]) drawHatOnHeadSide(c, cur.hat, 0, 34, -52);
  } finally { _accOv = null; }
  c.restore();
}

/* ---- outfits: up to six saved looks (colours, pattern, accent, hat and boots) ---- */
const OUTFIT_SLOTS = 6;
function outfitNow(){
  const md = typeof miniData === 'function' ? miniData() : {};
  return { s: wardChoice('skinCol'), p: wardChoice('spotCol'), t: wardChoice('patCol'), g: wardChoice('gearCol'), hat: md.hat || '', boot: md.boot || '',
    hc: md.hatCol | 0, bc: md.bootCol | 0 };
}
function outfitClean(o){                                   /* only what she has actually earned or won is kept */
  if (!o || typeof o !== 'object') return null;
  const n = function(v, top){ v = v | 0; return v >= 1 && v <= (top || WARD_MAX) && wardUnlocked(v) ? v : 0; };
  const ok = function(id, kind){ return typeof id === 'string' && ACC_BY_ID[id] && ACC_BY_ID[id].kind === kind && accOwned(id) ? id : ''; };
  return { s: n(o.s), p: n(o.p), t: n(o.t, 13), g: n(o.g), hat: ok(o.hat, 'hat'), boot: ok(o.boot, 'boot'), hc: n(o.hc), bc: n(o.bc) };
}
function outfitList(){
  let a = Save.data.outfits;
  if (!Array.isArray(a)) a = Save.data.outfits = [];
  while (a.length < OUTFIT_SLOTS) a.push(null);
  a.length = OUTFIT_SLOTS;
  return a;
}
function outfitsHTML(){
  const a = outfitList();
  let h = '<div class="sub" style="margin:10px 0 4px;font-weight:700;color:var(--sun)">Outfits <span style="font-weight:400;font-size:12px">(colours, pattern, accent, hat and boots)</span></div><div class="outfits">';
  for (let i = 0; i < OUTFIT_SLOTS; i++){
    const o = a[i];
    h += '<div class="outfit' + (o ? ' full' : '') + '"><canvas width="96" height="84" data-outfit="' + i + '"></canvas><div class="ofn">' + (o ? 'Outfit ' + (i + 1) : 'Empty slot') + '</div><div class="ofb">' +
      (o ? '<button class="btn sm" data-a="ward-outfit-wear-' + i + '">Wear</button><button class="btn sm ghost" data-a="ward-outfit-save-' + i + '" title="Replace with what she is wearing now">Save</button><button class="btn sm ghost" data-a="ward-outfit-clear-' + i + '" title="Empty this slot" aria-label="Empty this slot">&times;</button>'
        : '<button class="btn sm" data-a="ward-outfit-save-' + i + '">Save current</button>') + '</div></div>';
  }
  return h + '</div>';
}
