'use strict';
/* Add-on: Speedrun Timer (id 'speedrun'). A split timer in the HUD and personal bests in the run report. */
/* ========================= 50d. ADD-ON: SPEEDRUN TIMER ========================= */
/* While it is on, a run shows a clock under the HUD's top row: the run's time, the time on this wave (against her best for that wave) and
   the time in this chapter (against her best for the chapter). The clock is G.runTime, so it stops while the game is paused, on a level-up
   pick or in a menu, as the game's own run time does.
   A wave's split runs from its start to the start of the next one (the gap between them counts); a chapter's from its first wave to the start
   of the next chapter, or to the chapter's end. A chapter's time counts as a best only if the run began at that chapter's first wave; a run
   resumed from the menu sets no bests at all, since its clock started part way.
   Bests are kept for each run speed (normal, fast, hyperspeed, ultrafast: G.runSpeedLevel 0 to 3), since they are not the same race. They live
   in their own localStorage key, never in the campaign save, so switching the add-on off or deleting it leaves the save as it was.
   The run report gets a "Speedrun" section: the total, the chapter, the wave splits with the difference to her best, and any new bests. */
addonRegister({ id: 'speedrun', name: 'Speedrun Timer', tag: 'extra',
  desc: 'A split timer in the HUD: the run, the wave and the chapter, against your best times. The run report lists every wave’s split and any new bests. Bests are kept for each run speed.',
  off: function(){ speedrunHide(); } });

const SR_KEY = 'giraffe_rampage_speedrun_v1';
const SR = { on: false, resumed: false, waveN: 0, waveT: 0, chap: 0, chapT: 0, chapClean: false, splits: [], chapters: [], newBests: [] };

/* ---- the bests: { s0: { w: { wave: seconds }, c: { chapter: seconds } }, s1: ..., s2: ..., s3: ... } ---- */
function speedrunLoad(){
  try { const t = localStorage.getItem(SR_KEY); if (!t || t.length > 200000) return {}; const d = JSON.parse(t); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
  catch (e) { return {}; }
}
function speedrunSave(d){ try { localStorage.setItem(SR_KEY, JSON.stringify(d)); } catch (e) {} }
function speedrunTable(d, kind){
  const k = 's' + clamp(G.runSpeedLevel | 0, 0, 3);
  if (!d[k] || typeof d[k] !== 'object') d[k] = {};
  if (!d[k][kind] || typeof d[k][kind] !== 'object') d[k][kind] = {};
  return d[k][kind];
}
function speedrunBest(kind, n){ const v = speedrunTable(speedrunLoad(), kind)[n]; return typeof v === 'number' && isFinite(v) && v > 0 ? v : 0; }
/* a time that may be a best: kept when it beats the old one; returns the old best (0 if there was none) */
function speedrunOffer(kind, n, sec){
  if (SR.resumed || !(sec > 0)) return 0;
  const d = speedrunLoad(), tb = speedrunTable(d, kind), old = typeof tb[n] === 'number' && tb[n] > 0 ? tb[n] : 0;
  if (!old || sec < old){ tb[n] = Math.round(sec * 1000) / 1000; speedrunSave(d); SR.newBests.push({ kind: kind, n: n, sec: sec, old: old }); }
  return old;
}

/* ---- the clock as text: 1:23.4, or 1:02:03.4 past an hour ---- */
function speedrunFmt(sec){
  sec = Math.max(0, sec || 0);
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  const ss = (s < 10 ? '0' : '') + s.toFixed(1);
  return (h ? h + ':' + (m < 10 ? '0' : '') + m : m) + ':' + ss;
}
function speedrunDelta(sec, best){
  if (!best) return { txt: '', cls: '' };
  const d = sec - best;
  return { txt: (d < 0 ? '−' : '+') + Math.abs(d).toFixed(1), cls: d < 0 ? 'ahead' : 'behind' };
}

/* ---- the splits ---- */
function speedrunCloseWave(done){
  if (!SR.waveN) return;
  const sec = G.runTime - SR.waveT, best = speedrunBest('w', SR.waveN);
  const old = done ? speedrunOffer('w', SR.waveN, sec) : 0;
  SR.splits.push({ wave: SR.waveN, sec: sec, best: done ? old || best : best, done: done });
  SR.waveN = 0;
}
function speedrunCloseChapter(done){
  if (!SR.chap) return;
  const sec = G.runTime - SR.chapT, clean = SR.chapClean, best = speedrunBest('c', SR.chap);
  const old = done && clean ? speedrunOffer('c', SR.chap, sec) : 0;
  SR.chapters.push({ ch: SR.chap, sec: sec, best: old || best, done: done, clean: clean });
  SR.chap = 0;
}
function speedrunActive(){ return addonOn('speedrun') && SR.on && !G.attract; }

{
  const baseStart = startRun;
  startRun = function(startChapter, waveOverride, snap){
    SR.on = true; SR.resumed = !!snap; SR.waveN = 0; SR.chap = 0; SR.splits = []; SR.chapters = []; SR.newBests = [];     /* before: startRun starts the first wave itself */
    const r = baseStart.apply(this, arguments);
    if (G.attract) SR.on = false;
    return r;
  };
  const baseWave = startWave;
  startWave = function(n){
    const was = G.wave | 0;
    const r = baseWave.apply(this, arguments);
    if (!addonOn('speedrun') || !SR.on || G.attract) return r;
    if (SR.waveN && SR.waveN !== n) speedrunCloseWave(true);
    const ch = chapterOf(n);
    if (SR.chap && SR.chap !== ch) speedrunCloseChapter(true);
    if (!SR.waveN){ SR.waveN = n; SR.waveT = G.runTime; }
    if (!SR.chap){ SR.chap = ch; SR.chapT = G.runTime; SR.chapClean = !SR.resumed && chapterWaveOf(n) === 1 && (was === 0 || chapterOf(was) !== ch); }
    return r;
  };
  /* the run ends: a death leaves the wave and the chapter unfinished; a chapter's end finishes both */
  const baseOver = gameOver;
  gameOver = function(){
    if (speedrunActive() && G.state !== 'dead' && G.state !== 'victory'){ speedrunCloseWave(false); speedrunCloseChapter(false); }
    return baseOver.apply(this, arguments);
  };
  const baseDone = chapterComplete;
  chapterComplete = function(){
    if (speedrunActive() && G.state !== 'dead' && G.state !== 'victory'){ speedrunCloseWave(true); speedrunCloseChapter(true); }
    return baseDone.apply(this, arguments);
  };
  const baseReport = runReport;
  runReport = function(){
    const r = baseReport.apply(this, arguments);
    if (r && speedrunActive()) r.speedrun = { total: G.runTime, speed: G.runSpeedLevel | 0, resumed: SR.resumed, splits: SR.splits.slice(), chapters: SR.chapters.slice(), newBests: SR.newBests.slice() };
    return r;
  };
  const baseReportHTML = runReportHTML;
  runReportHTML = function(r){
    const out = baseReportHTML.apply(this, arguments);
    const s = r && r.report && r.report.speedrun;
    if (!out || !s) return out;
    const at = out.lastIndexOf('</div>');
    return out.slice(0, at) + speedrunReportHTML(s) + out.slice(at);
  };
  const baseHUD = updateHUD;
  updateHUD = function(){ const r = baseHUD.apply(this, arguments); speedrunHUD(); return r; };
}

/* ---- the run report's section ---- */
const SR_SPEEDS = ['normal speed', 'fast', 'hyperspeed', 'ultrafast'];
function speedrunReportHTML(s){
  let h = '<div class="rr-sub">Speedrun</div><div class="rr-line">Total <b>' + speedrunFmt(s.total) + '</b> at ' + (SR_SPEEDS[s.speed] || 'normal speed') + '.' +
    (s.resumed ? ' This run was resumed, so it sets no best times.' : '') + '</div>';
  s.chapters.forEach(function(c){
    const nb = s.newBests.some(function(b){ return b.kind === 'c' && b.n === c.ch; }), d = speedrunDelta(c.sec, c.best);
    h += '<div class="rr-line' + (nb ? ' good' : '') + '">Chapter ' + chapterLabel(c.ch) + ': <b>' + speedrunFmt(c.sec) + '</b>' +
      (!c.done ? ' (not finished)' : !c.clean ? ' (started part way, not a best)' : nb ? (c.best ? ' New best! The old one was ' + speedrunFmt(c.best) + '.' : ' Your first time for it.') : c.best ? ' Best ' + speedrunFmt(c.best) + ' (' + d.txt + ').' : '') + '</div>';
  });
  if (s.splits.length){
    h += '<div class="sr-splits">';
    s.splits.forEach(function(w){
      const nb = s.newBests.some(function(b){ return b.kind === 'w' && b.n === w.wave; }), d = w.done ? speedrunDelta(w.sec, w.best) : { txt: 'unfinished', cls: '' };
      h += '<span class="sr-split' + (nb ? ' pb' : '') + '"><i>W' + w.wave + '</i>' + speedrunFmt(w.sec) + (nb ? '<em class="ahead">best</em>' : d.txt ? '<em class="' + d.cls + '">' + d.txt + '</em>' : '') + '</span>';
    });
    h += '</div>';
  }
  const n = s.newBests.filter(function(b){ return b.kind === 'w'; }).length;
  if (n) h += '<div class="rr-line good">' + n + (n === 1 ? ' new best wave.' : ' new best waves.') + '</div>';
  return h;
}

/* ---- the HUD clock: built the first time it is needed, hidden when the add-on is off or there is no run ---- */
let _srEl = null, _srLast = '';
function speedrunEl(){
  if (_srEl) return _srEl;
  const hud = document.getElementById('hud'); if (!hud) return null;
  if (!document.getElementById('srStyle')){
    const st = document.createElement('style'); st.id = 'srStyle';
    st.textContent = '#srTimer{position:absolute;left:12px;top:66px;z-index:3;pointer-events:none;padding:5px 9px 6px;border:1px solid rgba(127,216,255,.45);border-radius:6px;' +
      'background:rgba(20,16,14,.72);font:600 12px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#E8DCC8;min-width:150px;box-shadow:0 2px 10px rgba(0,0,0,.3)}' +
      '#srTimer b{display:block;font-size:19px;color:#FFF3D6;letter-spacing:.5px}#srTimer .r{display:flex;justify-content:space-between;gap:10px}#srTimer .r span:first-child{color:#B8A890}' +
      '#srTimer em,.sr-split em{font-style:normal;margin-left:6px}.ahead{color:#9BE04A}.behind{color:#FF8A6A}' +
      '.sr-splits{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 2px}.sr-split{font:600 11.5px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:2px 6px;border:1px solid rgba(255,255,255,.12);border-radius:4px;color:#E8DCC8}' +
      '.sr-split i{font-style:normal;color:#B8A890;margin-right:5px}.sr-split.pb{border-color:rgba(155,224,74,.6)}' +
      '@media (max-width:700px),(max-height:500px){#srTimer{left:8px;top:72px;min-width:0;padding:3px 7px;font-size:10.5px}#srTimer b{font-size:15px}}' +
      '@media (max-width:500px){#srTimer{top:90px}}';                              /* a phone held upright: the health bars wrap under the top row */
    document.head.appendChild(st);
  }
  _srEl = document.createElement('div'); _srEl.id = 'srTimer'; _srEl.style.display = 'none';
  hud.appendChild(_srEl);
  return _srEl;
}
function speedrunHide(){ if (_srEl){ _srEl.style.display = 'none'; _srLast = ''; } }
function speedrunHUD(){
  const show = addonOn('speedrun') && SR.on && !G.attract && ['playing', 'paused', 'levelup', 'transform', 'dead', 'victory'].indexOf(G.state) >= 0;
  if (!show){ speedrunHide(); return; }
  const e = speedrunEl(); if (!e) return;
  const live = G.state !== 'dead' && G.state !== 'victory';
  let wTxt = '', cTxt = '';
  if (live && SR.waveN){ const sec = G.runTime - SR.waveT, d = speedrunDelta(sec, speedrunBestCached('w', SR.waveN)); wTxt = '<div class="r"><span>Wave ' + SR.waveN + '</span><span>' + speedrunFmt(sec) + (d.txt ? '<em class="' + d.cls + '">' + d.txt + '</em>' : '') + '</span></div>'; }
  else if (SR.splits.length){ const w = SR.splits[SR.splits.length - 1]; wTxt = '<div class="r"><span>Wave ' + w.wave + '</span><span>' + speedrunFmt(w.sec) + '</span></div>'; }
  if (live && SR.chap){ const sec = G.runTime - SR.chapT, d = SR.chapClean ? speedrunDelta(sec, speedrunBestCached('c', SR.chap)) : { txt: '' }; cTxt = '<div class="r"><span>Chapter ' + chapterLabel(SR.chap) + '</span><span>' + speedrunFmt(sec) + (d.txt ? '<em class="' + d.cls + '">' + d.txt + '</em>' : '') + '</span></div>'; }
  else if (SR.chapters.length){ const c = SR.chapters[SR.chapters.length - 1]; cTxt = '<div class="r"><span>Chapter ' + chapterLabel(c.ch) + '</span><span>' + speedrunFmt(c.sec) + '</span></div>'; }
  const html = '<b>' + speedrunFmt(G.runTime) + '</b>' + wTxt + cTxt;
  if (html !== _srLast){ _srLast = html; e.innerHTML = html; }
  if (e.style.display !== 'block') e.style.display = 'block';
}
/* the HUD asks every frame, so the bests are read from storage once per wave or chapter, not per frame */
const _srCache = {};
function speedrunBestCached(kind, n){
  const k = kind + n + ':' + (G.runSpeedLevel | 0) + ':' + SR.newBests.length;
  if (!(k in _srCache)) _srCache[k] = speedrunBest(kind, n);
  return _srCache[k];
}
