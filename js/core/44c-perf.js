'use strict';
/* A slow-device governor: if the game cannot keep up, it lowers the sharpness first and then the effects, and brings them back
   when there is room again. It never touches the player's own settings; "Adapt to slow devices" in Settings turns it off. */
/* ========================= 44c. PERFORMANCE GOVERNOR ========================= */
/* How it decides: it times how long each frame's update and draw take on this machine (not how long the screen waits between
   frames, so a 30 or 144 Hz screen does not confuse it). Over about a second and a half, an average above 20 ms means it
   cannot hold 50 frames a second, so it steps down one notch. An average under 9 ms for about ten seconds steps back up one.
   After going back up, if it has to come down again within half a minute it stays down for the rest of the visit. */
const PERF_STEPS = [
  { s: 1,    fx: 2 },      /* what the player chose */
  { s: 0.85, fx: 2 },
  { s: 0.7,  fx: 2 },
  { s: 0.7,  fx: 1 },
  { s: 0.55, fx: 1 },
  { s: 0.55, fx: 0 }
];
const Perf = {
  scale: 1, fx: 2, idx: 0, floorIdx: 0, ceil: 0,
  sum: 0, n: 0, calmWins: 0, sinceChange: 99, lastUpAt: -99, clock: 0, told: false,
  reset(){
    const was = this.idx;
    this.idx = 0; this.scale = 1; this.fx = 2; this.sum = 0; this.n = 0; this.calmWins = 0; this.ceil = 0;
    if (was !== 0) this.apply();
  },
  apply(){
    const st = PERF_STEPS[this.idx];
    this.scale = st.s; this.fx = st.fx;
    try { resize(); } catch (e) {}
    this.sinceChange = 0; this.sum = 0; this.n = 0; this.calmWins = 0;
  },
  /* called once per game frame with how many milliseconds that frame's work took */
  cost(ms, dt){
    this.clock += dt;
    this.sinceChange += dt;
    if (!(Settings.autoPerf !== false)){ if (this.idx !== 0) this.reset(); return; }
    const inMini = G.state === 'mini' && G.mini && G.mini.phase === 'play';          /* a minigame being played counts too */
    if ((G.state !== 'playing' && !inMini) || G.attract) return;                     /* only real play counts: menus and films are cheap or different */
    if (this.sinceChange < 1.5) return;                                              /* let a change settle (a resize can hitch one frame) */
    this.sum += ms; this.n++;
    if (this.n < 90) return;
    const avg = this.sum / this.n; this.sum = 0; this.n = 0;
    if (avg > 20 && this.idx < PERF_STEPS.length - 1){
      if (this.clock - this.lastUpAt < 30) this.ceil = this.idx;                  /* it came back and fell again: this level is as good as it gets here */
      this.idx++;
      this.apply();
      this.told = true;
      try { perfNotice(); } catch (e) {}
    } else if (avg < 9 && this.idx > 0 && this.idx > this.ceil){
      if (++this.calmWins >= 6){
        this.idx--; this.lastUpAt = this.clock;
        this.apply();
      }
    } else this.calmWins = 0;
  }
};

/* ---- the notice: when it lowers the detail, say so, and let the player undo it ---- */
/* A card at the bottom of the screen (it does not pause anything and its clicks stay out of the game). "Back to full quality" turns
   "Adapt to slow devices" off and restores everything; "Keep it" dismisses the card and no further notices appear this visit. */
let _perfToast = null, _perfToastT = 0, _perfQuiet = false;
function perfNotice(){
  if (_perfQuiet) return;
  if (!_perfToast){
    const d = document.createElement('div');
    d.id = 'perfToast';
    ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function(ev){ d.addEventListener(ev, function(e){ e.stopPropagation(); }); });
    d.addEventListener('click', function(e){
      const b = e.target.closest && e.target.closest('button'); if (!b) return;
      const a = b.getAttribute('data-p');
      if (a === 'keep'){ _perfQuiet = true; d.className = ''; _perfToastT = 0; }
      else if (a === 'revert'){
        Settings.autoPerf = false; Settings.save(); Perf.reset(); _perfQuiet = true;
        d.innerHTML = '<span>Full quality is back. "Adapt to slow devices" is now off; you can turn it on again in Settings.</span><button data-p="keep">OK</button>';
        _perfToastT = 6;
      }
    });
    document.body.appendChild(d); _perfToast = d;
  }
  const st = PERF_STEPS[Perf.idx], fxName = ['Low', 'Medium', 'High'][st.fx];
  _perfToast.innerHTML = '<span><b>The game was running slowly,</b> so it lowered the detail to keep things smooth: sharpness ' + Math.round(st.s * 100) + '%, effects ' + fxName +
    '. It will bring it back by itself if there is room again.</span><button data-p="revert">Back to full quality</button><button data-p="keep">Keep it</button>';
  _perfToast.className = 'on'; _perfToastT = 14;
}
(function(){
  const tick = Feedback.tick;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    if (_perfToastT > 0){ _perfToastT -= dt; if (_perfToastT <= 0 && _perfToast) _perfToast.className = ''; }
  };
})();

/* ---- the statistics panel: press \ to show or hide it ---- */
/* Frame rate and how long the game's own work takes, split into update and draw, what is on the field, what the slow-device
   governor is doing, and the audio. Numbers cover the last second (long frames, the last ten). Nothing here runs unless it is
   showing, except the timing, which costs a couple of clock reads a frame. */
const Stats = {
  on: false, el: null, lastT: 0, t0: 0, n: 0, sumAll: 0, sumUp: 0, sumDr: 0, maxAll: 0, maxGap: 0, minGap: 1e9, sumGap: 0,
  upMs: 0, drMs: 0, longs: [], out: null, shownAt: 0,
  frame(now, gap, all){
    this.n++; this.sumAll += all; this.sumUp += this.upMs; this.sumDr += this.drMs;
    if (all > this.maxAll) this.maxAll = all;
    if (gap > 0){ this.sumGap += gap; if (gap > this.maxGap) this.maxGap = gap; if (gap < this.minGap) this.minGap = gap; if (gap > 33) this.longs.push(now); }
    this.upMs = 0; this.drMs = 0;
    if (now - this.t0 >= 1000){
      const n = Math.max(1, this.n), secs = (now - this.t0) / 1000;
      this.out = { fps: this.n / secs, gap: this.sumGap / n, maxGap: this.maxGap, all: this.sumAll / n, up: this.sumUp / n, dr: this.sumDr / n, maxAll: this.maxAll };
      this.t0 = now; this.n = 0; this.sumAll = 0; this.sumUp = 0; this.sumDr = 0; this.maxAll = 0; this.maxGap = 0; this.minGap = 1e9; this.sumGap = 0;
    }
    while (this.longs.length && now - this.longs[0] > 10000) this.longs.shift();
    if (this.on && now - this.shownAt > 250){ this.shownAt = now; this.draw(); }
  },
  toggle(){
    this.on = !this.on;
    if (this.on && !this.el){
      const d = document.createElement('div');
      d.id = 'statsPanel';
      d.style.cssText = 'position:fixed;left:8px;top:84px;z-index:70;pointer-events:none;padding:7px 10px;border-radius:6px;' +
        'background:rgba(12,9,8,.8);color:#EFE6D4;font:12px/1.45 ui-monospace,Consolas,Menlo,monospace;white-space:pre;border:1px solid rgba(242,179,61,.45)';
      document.body.appendChild(d); this.el = d;
    }
    if (this.el) this.el.style.display = this.on ? 'block' : 'none';
    if (this.on){ this.t0 = performance.now(); this.n = 0; this.out = null; this.draw(); }
  },
  draw(){
    if (!this.el) return;
    const o = this.out, col = function(v, good, ok){ return v >= good ? '#9BE04A' : v >= ok ? '#F2B33D' : '#FF7A6A'; };
    const f = function(v, d){ return (+v).toFixed(d === undefined ? 1 : d); };
    const L = [];
    if (o){
      L.push('<b style="color:' + col(o.fps, 55, 40) + '">' + f(o.fps, 0) + ' FPS</b>   frame ' + f(o.gap) + ' ms (worst ' + f(o.maxGap, 0) + ')');
      L.push('work ' + f(o.all) + ' ms = update ' + f(o.up) + ' + draw ' + f(o.dr) + '  (worst ' + f(o.maxAll) + ')');
      const used = o.all / 16.7 * 100;
      L.push('budget used at 60 fps: <span style="color:' + col(100 - used, 40, 10) + '">' + f(used, 0) + '%</span>   long frames (10 s): ' + this.longs.length);
    } else L.push('measuring...');
    const cap = function(a, m){ return a.length + (m ? '/' + m : ''); };
    L.push('enemies ' + cap(G.enemies, MAX_ENEMIES) + '  shots ' + G.eproj.length + '+' + G.projectiles.length + '  pickups ' + G.pickups.length);
    L.push('particles ' + cap(G.particles, MAX_PARTICLES) + '  texts ' + cap(G.texts, MAX_TEXTS) + '  cards ' + P.cards.filter(function(c){ return !c.hidden; }).length);
    if (typeof EnemySprite !== 'undefined'){ const q = EnemySprite.stats, tot = q.drawn + q.live; L.push('creature pictures ' + (tot ? Math.round(q.drawn / tot * 100) : 0) + '% cached (' + EnemySprite.megapixels().toFixed(1) + ' Mpx)  waiting ' + q.liveBy.wait); }
    L.push('canvas ' + (stage ? stage.width + 'x' + stage.height : '?') + '  sharpness ' + Math.round(Perf.scale * 100) + '%  dpr ' + f(G.dpr, 2));
    L.push('effects ' + ['Low', 'Medium', 'High'][fxLevelNow()] + (fxLevelNow() < fxLevelSetting() ? ' (chosen ' + ['Low', 'Medium', 'High'][fxLevelSetting()] + ')' : '') +
      '   governor step ' + Perf.idx + '/' + (PERF_STEPS.length - 1) + (Settings.autoPerf === false ? ' (off)' : '') + '  ' + G.state);
    L.push('audio ' + (SFX.ctx ? SFX.ctx.state : 'none') + '  voices ' + SFX.voices + (SFX.ctx && SFX.ctx.baseLatency ? '  latency ' + f(SFX.ctx.baseLatency * 1000, 0) + ' ms' : ''));
    try { if (performance.memory) L.push('memory ' + f(performance.memory.usedJSHeapSize / 1048576, 0) + ' MB of ' + f(performance.memory.jsHeapSizeLimit / 1048576, 0)); } catch (e) {}
    L.push('<span style="opacity:.6">\\ hides this</span>');
    this.el.innerHTML = L.join('\n');
  }
};
window.addEventListener('keydown', function(e){
  if (e.code !== 'Backslash' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = document.activeElement;
  if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT') && a.type !== 'range') return;
  if (G.rebinding) return;                                           /* a key is being chosen in Settings: it is not for us */
  e.preventDefault();
  Stats.toggle();
});

/* time every frame's update and draw (js/core/44-loop-boot.js step, update, render) without touching the loop itself */
(function(){
  const inner = step, upd = update, rnd = render;
  update = function(dt){ const t = performance.now(); try { return upd(dt); } finally { Stats.upMs += performance.now() - t; } };
  render = function(){ const t = performance.now(); try { return rnd.apply(this, arguments); } finally { Stats.drMs += performance.now() - t; } };
  step = function(dt){
    const t0 = performance.now(), gap = Stats.lastT ? t0 - Stats.lastT : 0;
    Stats.lastT = t0;
    inner(dt);
    const t1 = performance.now();
    Perf.cost(t1 - t0, dt);
    Stats.frame(t1, gap, t1 - t0);
  };
})();
