/* gold-bank: a bank past 2,147,483,647 gold stays positive. `x | 0` wraps past that into a negative number, so the town's pay-outs, the boat shop and the
   other price checks are run with 3 billion gold, and every script is read to make sure no gold is read or written through `| 0` again (goldInt, js/core/01-core.js). */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go');
  try {
    var BIG = 3e9, d = Save.data;
    d.gold = BIG; townPay({ gold: 50 }, 0, 0);
    out.pay = d.gold === BIG + 50;
    d.gold = BIG; out.goldInt = goldInt(BIG) === BIG && goldInt(-5) === 0 && goldInt('x') === 0 && goldInt(12.9) === 12;
    var b = BOATS[3]; d.gold = BIG; seaData().own = {}; seaData().sel = '';
    out.boat = boatBuy(b.id) === true && d.gold === BIG - b.price && seaData().sel === b.id;
    d.gold = BIG; out.hud = (function(){ try { townDrawHud(CTX, G.W, G.H); return true; } catch (e) { out.errs.push('hud ' + e.message); return false; } })();
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  var srcs = Array.prototype.map.call(document.scripts, function(s){ return s.getAttribute('src'); }).filter(function(s){ return s && /^js\//.test(s) && !/45b-dev-panel/.test(s); });
  /* synchronous requests: the runner polls with animation frames, which the harness stops, so a scenario has to finish in one go */
  out.wrapSites = srcs.filter(function(u){ var x = new XMLHttpRequest(); x.open('GET', u, false); x.send(); return /(?:Save\.data|\bd)\.gold\s*\|\s*0/.test(x.responseText); });
  out.noWrap = out.wrapSites.length === 0;
  out.pass = out.errs.length === 0 && out.pay && out.goldInt && out.boat && out.hud && out.noWrap;
  QA.done(out);
})();
