/* together: "Play together" (js/44zzt-together.js): two giraffes on one screen, for fun, with nothing kept.
   The menu button, the real save left exactly as it was (nothing written while playing, back untouched afterwards), the two giraffes moving and kicking on their own
   keys, hits dealt to the giraffe that was touched, a giraffe going down and being helped up, both down, rounds, the yard (a goal, a match), pause and leave. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };      /* the real save is compared byte for byte: a trophy earned on the menu would change it */
  function run(n, dt){ for (var i = 0; i < n; i++) GR.step(dt || 1 / 60); }
  function clearKeys(){ Input.keys = {}; Input.mdown = false; }
  try {
    /* the menu button is there for a keyboard and gone for a phone */
    Input.hasTouch = false; showMenu(); out.menuBtn = !!document.querySelector('[data-a="co-open"]');
    Input.hasTouch = true; showMenu(); out.menuBtnPhone = !document.querySelector('[data-a="co-open"]'); Input.hasTouch = false; showMenu();
    handleAction('co-open'); out.panel = G.subScreen === 'together' && /Arena fight/.test(OV.innerHTML) && /Kick-about/.test(OV.innerHTML);
    out.chaptersFresh = JSON.stringify(coChapters());
    Save.data.chapter1Complete = true; out.chaptersAfter1 = JSON.stringify(coChapters()); handleAction('co-ch-next'); out.picked = Co.pick; handleAction('co-ch-prev'); Save.data.chapter1Complete = false;

    /* the real save is not touched */
    Save.data.gold = 12345; Save.data.best = 999; Save.data.runs = 7; var real = Save.data, snap = JSON.stringify(real), stored = localStorage.getItem(SAVE_KEY);
    handleAction('co-arena');
    out.started = G.state === 'playing' && Co.on && Co.mode === 'arena' && Co.round === 1 && Co.pl.length === 2;
    out.freshSave = Save.data !== real && Save.data.gold === 0 && Save.data.best === 0;
    out.hudHidden = !HUD.classList.contains('on');
    out.noHint = !(Hint.hideT > 0);

    /* two giraffes, two sets of keys */
    var a0 = { x: Co.pl[0].x, y: Co.pl[0].y }, b0 = { x: Co.pl[1].x, y: Co.pl[1].y };
    clearKeys(); Input.keys['KeyD'] = true; Input.keys['ArrowUp'] = true; run(40);
    out.movesApart = Co.pl[0].x > a0.x + 40 && Math.abs(Co.pl[0].y - a0.y) < 5 && Co.pl[1].y < b0.y - 40 && Math.abs(Co.pl[1].x - b0.x) < 5;
    clearKeys(); run(30);
    out.shellMid = Math.abs(P.x - (Co.pl[0].x + Co.pl[1].x) / 2) < 1 && Math.abs(P.y - (Co.pl[0].y + Co.pl[1].y) / 2) < 1;

    /* a kick from giraffe 1 hurts a creature next to her; giraffe 2's health is not touched */
    G.enemies.length = 0; Co.queue = [];
    var g0 = Co.pl[0], g1 = Co.pl[1]; g1.x = g0.x + 300; g1.y = g0.y;
    var e = spawnEnemy('hyena', g0.x + 60, g0.y, G.wave); e.atkCd = 5; var hp0 = e.hp;
    Input.keys['Space'] = true; run(30); clearKeys();
    out.kick = e.dead || e.hp < hp0;
    out.kickOnlyForOne = g1.kickCd <= 0 && g1.kickAnim <= 0;

    /* a creature touching giraffe 2 hurts her and not giraffe 1 */
    G.enemies.length = 0; g0.invuln = 0; g1.invuln = 0; var h0 = g0.hp, h1 = g1.hp;
    var f = spawnEnemy('hyena', g1.x + 5, g1.y, G.wave); f.atkCd = 0; run(3);
    out.hitTheOneTouched = g1.hp < h1 && g0.hp === h0;
    /* and creatures walk toward the nearer giraffe */
    G.enemies.length = 0; var h = spawnEnemy('hyena', g1.x + 500, g1.y, G.wave); out.aggro = antAggroTarget(h) === g1;

    /* down, and helped up by standing next to her */
    g1.invuln = 0; g1.hp = 1; G.enemies.length = 0; var k = spawnEnemy('hyena', g1.x, g1.y, G.wave); k.atkCd = 0; k.dmg = 50; run(3);
    out.down = g1.down === true && g1.hp === 0; G.enemies.length = 0; Co.queue = []; Co.calm = -99;
    g0.x = g1.x + 40; g0.y = g1.y; run(60 * 2 + 20);
    out.helped = g1.down === false && g1.hp > 0;

    /* no experience, no pick-up, no level-up screen, and no gold */
    out.noLevelUp = G.state === 'playing' && G.pendingLevels === 0 && P.xp === 0;

    /* kills, and then the next round */
    G.enemies.length = 0; Co.queue = []; Co.calm = 0; run(60 * 3);
    out.nextRound = Co.round === 2;

    /* the save on the real side never moved, and nothing was written */
    out.saveUntouched = JSON.stringify(real) === snap && localStorage.getItem(SAVE_KEY) === stored;

    /* both down: the end screen, then go again */
    Co.pl.forEach(function(r){ r.invuln = 0; r.hp = 1; }); G.enemies.length = 0;
    Co.pl.forEach(function(r){ var m = spawnEnemy('hyena', r.x, r.y, G.wave); m.atkCd = 0; m.dmg = 80; }); run(4);
    out.bothDown = Co.over === true && G.state === 'paused' && /Both giraffes are down/.test(OV.innerHTML);
    handleAction('co-again'); out.again = Co.on && G.state === 'playing' && Co.round === 1 && !Co.pl[0].down && !Co.pl[1].down;

    /* pause and leave */
    showPause(); out.paused = G.state === 'paused' && /Leave to the menu/.test(OV.innerHTML);
    handleAction('co-quit'); out.left = !Co.on && G.state === 'menu' && Save.data === real && Save.data.gold === 12345 && JSON.stringify(real) === snap;

    /* the yard: the ball goes in a goal, and five make a match */
    handleAction('co-yard'); out.yard = Co.on && Co.mode === 'yard' && !!Co.ball && G.enemies.length === 0;
    var Y = Co.yard; Co.ball.x = Y.x1 - 60; Co.ball.y = Y.cy; Co.ball.vx = 700; Co.ball.vy = 0; run(40);
    out.goal = Co.score[0] === 1 && Co.score[1] === 0;
    run(60 * 2); out.reset = Math.abs(Co.ball.x - (Y.x0 + Y.x1) / 2) < 5;
    Co.score = [4, 0]; Co.ball.x = Y.x1 - 60; Co.ball.y = Y.cy; Co.ball.vx = 700; run(40); out.match = Co.score[0] === 5 && Co.winT > 0;
    run(60 * 5); out.newMatch = Co.score[0] === 0 && Co.score[1] === 0;
    /* a kick sends the ball away */
    var P1 = Co.pl[0]; P1.x = Co.ball.x - 70; P1.y = Co.ball.y; P1.face = 0; P1.aim = 0; Input.keys['Space'] = true; run(6); clearKeys();
    out.ballKicked = Math.abs(Co.ball.vx) > 100 || Co.ball.x > (Y.x0 + Y.x1) / 2 + 20;
    GR.render(); out.draws = true;
    handleAction('co-quit'); out.left2 = !Co.on && Save.data === real;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['menuBtn', 'menuBtnPhone', 'panel', 'started', 'freshSave', 'hudHidden', 'noHint', 'movesApart', 'shellMid', 'kick', 'kickOnlyForOne', 'hitTheOneTouched', 'aggro', 'down', 'helped', 'noLevelUp', 'nextRound', 'saveUntouched', 'bothDown', 'again', 'paused', 'left', 'yard', 'goal', 'reset', 'match', 'newMatch', 'ballKicked', 'draws', 'left2'];
  out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
  QA.done(out);
})();
