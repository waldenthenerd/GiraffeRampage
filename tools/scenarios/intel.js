/* intel: the Intelligence stat (intel() in js/campus/44zz-campus.js), the average faculty level. A raw read, fewer falls, less shake, a kinder fishing bar, the journal line and the Guide topic. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function setAll(l){ var u = uniData(); UNI_FAC.forEach(function(F){ u.fac[F.id] = { l: l, xp: 0 }; }); }
  function shakeFor(){ G.shake = 0; addShake(10); return G.shake; }
  try {
    Save.data = JSON.parse(JSON.stringify(DEFAULT_SAVE)); Save.data.town = { n: {}, fish: {}, fishBook: {}, vis: {}, found: {}, bond: {}, err: {}, talk: {}, gift: {}, night: {}, done: {}, daily: { d: '', dig: [], got: [], dot: 0, n: 0 }, tips: {}, last: 'square' };
    out.freshZero = intel() === 0 && Save.data.town.uni === undefined;                     /* asking never writes to a fresh save */
    var base = shakeFor(); out.baseShake = Math.abs(base - 10) < 1e-9;
    setAll(UNI_MAX); out.maxOne = Math.abs(intel() - 1) < 1e-9 && intelPct() === 100;
    uniData().fac[UNI_FAC[0].id] = { l: 0, xp: 0 }; out.average = Math.abs(intel() - (UNI_FAC.length - 1) / UNI_FAC.length) < 1e-9;
    setAll(UNI_MAX); out.lessShake = Math.abs(shakeFor() - 7) < 1e-9;
    setAll(0); setAll(7); out.half = Math.abs(intel() - 7 / UNI_MAX) < 1e-9;
    Save.data.town.uni.fac[UNI_FAC[1].id] = 'junk'; out.junkSafe = intel() < 7 / UNI_MAX && intel() >= 0;
    Save.data.town.uni = 'junk'; out.junkUni = intel() === 0;
    /* fewer falls: the fall chance is scaled in wheelsRideStep */
    var src = String(wheelsRideStep); out.fallScaled = /intel\(\)/.test(src);
    out.fishScaled = /intel\(\)/.test(String(fishTick || '')) || /intel\(\)/.test(String(fightTick));
    setAll(UNI_MAX); out.guide = /Intelligence/.test(guideTopicsHTML()) && /100%/.test(guideTopicsHTML());
    setAll(0); Save.data.town.uni = undefined; Save.data.town = Save.data.town; out.guideHidden = !/<b>Intelligence<\/b> is the average/.test(guideTopicsHTML());
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['freshZero', 'baseShake', 'maxOne', 'average', 'lessShake', 'half', 'junkSafe', 'junkUni', 'fallScaled', 'fishScaled', 'guide', 'guideHidden'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
