/* monkey-hat: the Monkey Hat and its secret (in one run, bare-headed, defeat 20 monkeys: savanna baboons or jungle howler monkeys).
   Run: node tools/qa-cloud.mjs tools/scenarios/monkey-hat.js --wait 60000 [--shot x.png --params "view=run|ward|town|top"] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function W(ch, k){ return (ch - 1) * 25 + (k || 3); }                                             /* a wave in chapter ch */
function kill(n, ch){ for (var i = 0; i < n; i++){ var e = spawnEnemy('baboon', P.x + 200, P.y, W(ch)); if (e) GR_kill(e); } }
function GR_kill(e){ killEnemy(e); G.enemies = G.enemies.filter(function(x){ return x !== e; }); }
function clean(){ var m = miniData(); delete m.own.monkey; m.hat = ''; m.hatCol = 0; }
try {
  var it = ACC_BY_ID.monkey;
  out.item = !!it && it.kind === 'hat' && it.town === true && it.name === 'Monkey Hat' && ACC.townHats.indexOf(it) >= 0;
  out.lastSlot = ACC_ITEMS.indexOf(it) === 62 && ACC_ITEMS.length === 63;                      /* photo codes number accessories 1 to 63 */
  out.notOnWheel = ACC_SLICES.every(function(s){ return !s.item || s.item.id !== 'monkey'; }) && !(miniSlicesFor ? miniSlicesFor(1) : []).some(function(s){ return s.item && s.item.id === 'monkey'; });
  out.hint = /secret/i.test(TOWN_SPECIAL_SRC.monkey || '');

  /* 19 bare-headed savanna monkeys: not yet; the 20th: it moves in and is worn */
  clean(); GR.startRun(1); G.enemies.length = 0; P.invuln = 99;
  kill(19, 1); out.notYet = !accOwned('monkey') && MONKEY.n === 19;
  kill(1, 1); out.given = accOwned('monkey') && miniData().hat === 'monkey' && accEquipped('hat') && accEquipped('hat').id === 'monkey';
  out.said = G.texts ? G.texts.some(function(t){ return /monkey/i.test(t.txt || t.text || ''); }) : true;
  /* a new run starts the count again */
  clean(); kill(12, 1); GR.startRun(1); G.enemies.length = 0; out.resets = MONKEY.n === 0;
  /* with a hat on, monkeys do not count */
  clean(); miniData().own.beanie = 1; miniData().hat = 'beanie'; GR.startRun(1); G.enemies.length = 0;
  kill(30, 1); out.hatBlocks = !accOwned('monkey') && MONKEY.n === 0; miniData().hat = '';
  /* jungle howler monkeys count; the arctic's ermine (the same creature in a coat) does not */
  clean(); GR.startRun(5); G.enemies.length = 0; var e5 = spawnEnemy('baboon', P.x + 200, P.y, W(5)); out.howlerLook = !!e5 && e5.def.look === 'howler'; if (e5) GR_kill(e5);
  kill(19, 5); out.jungle = accOwned('monkey');
  clean(); GR.startRun(2); G.enemies.length = 0; kill(25, 2); out.ermineNo = !accOwned('monkey') && MONKEY.n === 0;
  /* other creatures do not count */
  clean(); GR.startRun(1); G.enemies.length = 0; for (var j = 0; j < 25; j++){ var h = spawnEnemy('hyena', P.x + 200, P.y, W(1)); if (h) GR_kill(h); } out.othersNo = MONKEY.n === 0;
  /* the photo code carries it */
  var base = { v: 1, bg: 2, pose: 0, flip: false, giraffe: { x: 400, y: 300, s: 1 }, items: [], look: { skin: 1, spots: 0, pattern: 0, gear: 0, hat: 'monkey', boots: '', hatColour: 0, bootColour: 0 } };
  out.photo = photoUnpack(photoPack(base)).look.hat === 'monkey';
  /* an outfit with it is kept only once she owns it */
  clean(); out.outfitLocked = outfitClean({ hat: 'monkey' }).hat === ''; miniData().own.monkey = 1; out.outfitOwned = outfitClean({ hat: 'monkey' }).hat === 'monkey';
  /* drawing it every way does not throw */
  var cv = document.createElement('canvas'); cv.width = cv.height = 120; var q = cv.getContext('2d');
  drawAccIcon(q, it, 60, 60, 2, 1.3); q.save(); q.translate(60, 60); drawHatOnHeadTop(q, 'monkey', 0.5); q.restore(); drawHatOnHeadSide(q, 'monkey', 2, 60, 80);
  var px = q.getImageData(0, 0, 120, 120).data, n = 0; for (var k = 3; k < px.length; k += 4) if (px[k] > 0) n++; out.drawn = n > 400;
  hideOverlay(); G.state = 'menu';
  out.pass = out.errs.length === 0 && ['item', 'lastSlot', 'notOnWheel', 'hint', 'notYet', 'given', 'resets', 'hatBlocks', 'howlerLook', 'jungle', 'ermineNo', 'othersNo', 'photo', 'outfitLocked', 'outfitOwned', 'drawn'].every(function(k){ return out[k] === true; });

  /* screenshots */
  var v = QA.params.view;
  if (v){ var m = miniData(); m.own.monkey = 1; m.hat = 'monkey'; }
  if (v === 'ward') showWardrobe();
  else if (v === 'run'){ GR.startRun(5); G.enemies.length = 0; P.invuln = 99; G.introFX = null; for (var f = 0; f < 90; f++) GR.step(1 / 60); kill(0, 5); }
  else if (v === 'town'){ GR.handleAction('town'); for (var f2 = 0; f2 < 40; f2++) GR.step(1 / 60); }
  else if (v === 'top'){ GR.startRun(1); G.enemies.length = 0; P.invuln = 99; G.introFX = null; for (var f3 = 0; f3 < 30; f3++) GR.step(1 / 60); G.cam && (G.zoom = 2); }
  else if (v === 'gearlist'){ GR.handleAction('town'); for (var f4 = 0; f4 < 10; f4++) GR.step(1 / 60); delete miniData().own.monkey; miniData().hat = ''; townShowGear(); var gl = document.querySelector('canvas[data-gear="monkey"]'); if (gl) gl.scrollIntoView({ block: 'center' }); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
QA.done(out);
