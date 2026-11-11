/* speedrun: the Speedrun Timer add-on (js/addons/50d-addon-speedrun.js) and the "suggest an add-on" box on the Add-ons page.
   Run: node tools/qa-cloud.mjs tools/scenarios/speedrun.js --wait 60000 [--shot x.png --params "view=hud|report|page"] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function vis(){ var e = document.getElementById('srTimer'); return !!e && e.style.display === 'block'; }
function txt(){ var e = document.getElementById('srTimer'); return e ? e.textContent : ''; }
/* a run of chapter 1 whose waves last the given seconds; the first wave starts at runTime 0 */
function run(times, opts){
  opts = opts || {};
  GR.startRun(opts.ch || 1, opts.wave || 0, opts.snap || null); G.enemies.length = 0; P.invuln = 99;
  if (opts.speed !== undefined) G.runSpeedLevel = opts.speed;
  var first = G.wave; G.runTime = 0;
  for (var i = 0; i < times.length; i++){ G.runTime += times[i]; if (i < times.length - 1 || opts.next) startWave(first + i + 1); }
  updateHUD();
}
function bests(){ try { return JSON.parse(localStorage.getItem('giraffe_rampage_speedrun_v1') || '{}'); } catch (e) { return {}; } }
try {
  localStorage.removeItem('giraffe_rampage_speedrun_v1');
  out.registered = !!addonById('speedrun') && addonById('speedrun').tag === 'extra';
  /* off: no clock, no section, nothing stored */
  addonSet('speedrun', false); run([10, 10]); out.offNoClock = !vis(); gameOver(); out.offNoReport = !G.lastRun.report.speedrun && localStorage.getItem('giraffe_rampage_speedrun_v1') === null;
  hideOverlay(); G.state = 'menu';
  /* on: the clock shows the run, the wave and the chapter */
  out.switched = addonSet('speedrun', true) && addonOn('speedrun');
  run([20, 15, 7]);
  out.clock = vis() && /0:42\.0/.test(txt()) && /Wave 3/.test(txt()) && /Chapter 1/.test(txt());
  out.splits = SR.splits.length === 2 && Math.abs(SR.splits[0].sec - 20) < 1e-6 && Math.abs(SR.splits[1].sec - 15) < 1e-6;
  gameOver();
  var b = bests(); out.saved = b.s0 && b.s0.w && b.s0.w[1] === 20 && b.s0.w[2] === 15 && !b.s0.w[3] && !(b.s0.c && b.s0.c[1]);       /* the wave she died on and the unfinished chapter are not bests */
  var rep = G.lastRun.report.speedrun; out.report = !!rep && rep.splits.length === 3 && rep.splits[2].done === false && rep.chapters[0].done === false;
  var html = runReportHTML(G.lastRun, true); out.reportHTML = /Speedrun/.test(html) && /W1/.test(html) && /0:42\.0/.test(html) && /unfinished/.test(html);
  hideOverlay(); G.state = 'menu';
  /* a second run: wave 1 faster (a new best), wave 2 slower (+2.0 behind) */
  run([18, 17, 5]);
  out.deltaLive = /Wave 3/.test(txt());
  gameOver(); b = bests();
  out.newBest = b.s0.w[1] === 18 && b.s0.w[2] === 15;
  html = runReportHTML(G.lastRun, true); out.deltas = /\+2\.0/.test(html) && /best/.test(html) && /1 new best wave/.test(html);
  hideOverlay(); G.state = 'menu';
  /* the whole chapter, from its first wave: the chapter's time is a best */
  var t25 = []; for (var i = 0; i < 25; i++) t25.push(10); run(t25); chapterComplete(); b = bests();
  out.chapterBest = b.s0.c && b.s0.c[1] === 250 && b.s0.w[25] === 10;
  out.chapterLine = /Chapter 1: <b>4:10\.0<\/b> Your first time for it/.test(runReportHTML(G.lastRun, false));
  hideOverlay(); G.state = 'menu';
  /* started part way (at wave 3): the chapter's time is not a best */
  run([5, 5], { wave: 3 }); chapterComplete(); b = bests(); out.partWay = b.s0.c[1] === 250 && /started part way/.test(runReportHTML(G.lastRun, false));
  hideOverlay(); G.state = 'menu';
  /* another speed keeps its own bests */
  run([3, 3], { speed: 2 }); gameOver(); b = bests(); out.speeds = b.s2 && b.s2.w[1] === 3 && b.s0.w[1] === 10;
  hideOverlay(); G.state = 'menu';
  /* a resumed run sets no bests */
  var before = JSON.stringify(bests());
  GR.startRun(1); SR.resumed = true; G.runTime = 1; startWave(G.wave + 1); G.runTime = 2; startWave(G.wave + 1); gameOver();      /* what startRun(.., snap) sets */
  out.resumed = JSON.stringify(bests()) === before && /resumed/.test(runReportHTML(G.lastRun, true));
  hideOverlay(); G.state = 'menu';
  /* off again: the clock goes, the save is untouched */
  run([4, 4]); var was = vis(); addonSet('speedrun', false); updateHUD(); out.offAgain = was && !vis() && !Save.data.speedrun;
  gameOver(); hideOverlay(); G.state = 'menu';
  /* the Add-ons page: the suggestion box and its link */
  showAddons(); var a = document.querySelector('.addonsuggest a');
  out.suggest = !!a && a.getAttribute('href') === 'https://github.com/waldenthenerd/GiraffeRampage' && a.target === '_blank' && /suggest it on GitHub/i.test(document.querySelector('.addonsuggest').textContent);
  out.row = !!document.querySelector('[data-a="addon-t-speedrun"]');
  hideOverlay(); G.state = 'menu';
  out.pass = out.errs.length === 0 && ['registered', 'offNoClock', 'offNoReport', 'switched', 'clock', 'splits', 'saved', 'report', 'reportHTML', 'deltaLive', 'newBest', 'deltas', 'chapterBest', 'chapterLine', 'partWay', 'speeds', 'resumed', 'offAgain', 'suggest', 'row'].every(function(k){ return out[k] === true; });

  var v = QA.params.view;
  if (v === 'page') showAddons();
  else if (v === 'hud' || v === 'report'){
    localStorage.removeItem('giraffe_rampage_speedrun_v1'); addonSet('speedrun', true);
    run([21.4, 18.2, 24.9, 19.6, 22.1]); gameOver(); hideOverlay(); G.state = 'menu';
    GR.startRun(1); G.introFX = null; P.invuln = 99; G.runTime = 0;
    var tt = [19.8, 18.9, 26.3, 18.4]; for (var j = 0; j < tt.length; j++){ for (var f = 0; f < 6; f++) GR.step(1 / 60); G.runTime += tt[j] - 0.1; startWave(G.wave + 1); }
    G.runTime += 7.3; for (var f2 = 0; f2 < 30; f2++) GR.step(1 / 60); updateHUD();
    if (v === 'report'){ gameOver(); if (typeof showDeath === 'function') showDeath(); var rr = document.querySelector('.sr-splits'); if (rr && rr.scrollIntoView) rr.scrollIntoView({ block: 'center' }); }
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
QA.done(out);
