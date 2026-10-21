/* The Upgrades tab (js/41e-upgrades-page.js). Run: node tools/qa-cloud.mjs tools/scenarios/upgrades-page.js --wait 60000 [--shot x.png --w 390 --h 844 --scale 2 --touch --params "view=combat|body|ants|all|afford|confirm|maxed|summary|locked"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); } function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
try {
  var view = (QA.params && QA.params.view) || 'none';
  var fresh = function(gold){ Save.data.meta = {}; Save.data.gold = gold; Save.data.antsUnlocked = false; Save.data.chapter3Complete = false; Save.data.best = 12345678; upgPage.group = 'combat'; upgPage.afford = false; upgPage.confirm = null; upgPage.snap = null; showShop('upgrades'); };
  /* 1. every upgrade is in exactly one group; costs and effects are the game's */
  var ids = UPG_GROUPS.reduce(function(a, g){ return a.concat(g.ids); }, []);
  out.groups = ids.length === META.length && META.every(function(m){ return ids.indexOf(m.id) >= 0; }) && ids.length === new Set(ids).size;
  fresh(5000);
  out.chips = $$('.upchip').length === UPG_GROUPS.length + 2 && $$('.upchip.on')[0].textContent.indexOf('Combat') === 0;
  out.oneGroup = $$('.uprow').length === 4 && $$('.uprow').every(function(r){ return ['hooves', 'instinct', 'reach', 'thunder'].indexOf(r.dataset.up) >= 0; });
  GR.handleAction('upg-g-body'); out.body = $$('.uprow').length === 6 && upgPage.group === 'body';
  GR.handleAction('upg-g-all'); out.all = $$('.uprow').length === META.length;
  GR.handleAction('upg-g-bogus'); out.bogusGroup = upgPage.group === 'all';
  /* 2. the Affordable filter, the dot on chips with something to buy */
  GR.handleAction('upg-g-combat'); fresh(0); out.noDot = $$('.updot').length === 0;
  fresh(200); out.dot = $$('.updot').length >= 1; GR.handleAction('upg-aff'); out.afford = upgPage.afford && $$('.uprow').every(function(r){ return r.classList.contains('can'); }) && $$('.uprow').length >= 1;
  fresh(0); GR.handleAction('upg-aff'); out.affordNone = /Nothing in here is affordable/.test($('.uplist').textContent);
  /* 3. rows: ring, now / next, three buttons; hold-to-buy kept (data-buy) */
  fresh(100000); var row = $('.uprow[data-up="hooves"]'), btns = row.querySelectorAll('.btn');
  out.row = !!row.querySelector('.uring') && /Not bought yet/.test(row.textContent) && /Next: Weapon damage \+6%/.test(row.textContent) && btns.length === 3 && !!row.querySelector('[data-buy="hooves"]') && /Buy 5/.test(btns[1].textContent);
  var gold0 = Save.data.gold; GR.handleAction('upg-buy-hooves-5');
  var c5 = 0; for (var i = 0; i < 5; i++) c5 += Math.round(150 * Math.pow(1.8, i));
  out.buy5 = metaLevel('hooves') === 5 && gold0 - Save.data.gold === c5;
  var g1 = Save.data.gold; GR.handleAction('upg-buy-hooves-5'); out.noOvershoot = metaLevel('hooves') === 5 && Save.data.gold === g1;
  Save.data.gold = 3; GR.handleAction('upg-buy-hooves-1'); out.poor = metaLevel('hooves') === 5 && Save.data.gold === 3;
  out.oldBuy = (function(){ Save.data.gold = 1e6; buyUpgrade('hooves'); return metaLevel('hooves') === 6; })();
  /* 4. the pop after a purchase, and the MAXED badge and chime when it tops out */
  fresh(1e7); var tones = 0, realTone = SFX.tone; SFX.tone = function(){ tones++; return realTone.apply(this, arguments); };
  buyUpgrade('hooves'); out.pop = !!$('.uprow[data-up="hooves"].pop');
  upgBuyMany('hooves', 7); showShop('upgrades'); GR.handleAction('upg-g-combat');
  var before = tones; Save.data.meta.hooves = 8; showShop('upgrades'); buyUpgrade('hooves'); out.maxed = !!$('.uprow[data-up="hooves"].ismax') && !!$('.upbadge') && /MAXED/.test($('.uprow[data-up="hooves"]').textContent) && !$('.uprow[data-up="hooves"] [data-buy]') && tones - before >= 4;
  SFX.tone = realTone; showShop('gear'); out.snapReset = upgPage.snap === null;
  /* 5. locked silhouettes with the goal, and the ant progress bar */
  fresh(1e6); GR.handleAction('upg-g-sea'); var sea = $('.uprow[data-up="swimlegs"]'); out.seaLocked = sea.classList.contains('locked') && /Finish Chapter 3/.test(sea.textContent) && !sea.querySelector('[data-buy]');
  GR.handleAction('upg-g-ants'); var ant = $('.uprow[data-up="antcap"]'); out.antLocked = ant.classList.contains('locked') && /100,000,000/.test(ant.textContent) && !!ant.querySelector('.upbar');
  var w = parseFloat(ant.querySelector('.upbar u').style.width); out.antBar = Math.abs(w - 12345678 / ANT_UNLOCK_SCORE * 100) < 0.2;
  Save.data.chapter3Complete = true; Save.data.antsUnlocked = true; showShop('upgrades'); out.unlocks = $$('.uprow.locked').every(function(r){ return ['engspeed', 'engturhp', 'engrange'].indexOf(r.dataset.up) >= 0; }) && !!$('.uprow[data-up="antcap"] [data-buy]');
  GR.handleAction('upg-buy-antcap-1'); out.antBuy = metaLevel('antcap') === 1;
  /* 6. Buy all I can: asks first, shows the list, buys cheapest-first, spends exactly what it said */
  fresh(100000); var plan = upgPlanAll(); out.plan = plan.n > 3 && plan.spent <= 100000;
  GR.handleAction('upg-all'); out.confirm = !!$('.upconfirm') && Object.keys(plan.add).every(function(id){ return $('.upconfirm').textContent.indexOf(METAMAP[id].name) >= 0; }) && Save.data.gold === 100000 && Object.keys(Save.data.meta).length === 0;
  GR.handleAction('upg-all-no'); out.cancel = !$('.upconfirm') && Save.data.gold === 100000;
  GR.handleAction('upg-all'); GR.handleAction('upg-all-yes');
  var spent = 100000 - Save.data.gold, levels = 0; Object.keys(Save.data.meta).forEach(function(k){ levels += Save.data.meta[k]; });
  out.buyAll = spent === plan.spent && levels === plan.n && /Bought/.test($('.upnote').textContent) && !$('.upconfirm');
  var left = upgPlanAll(); out.exhausted = left.n === 0;                                       /* nothing more could be bought */
  fresh(0); out.noPlan = $('[data-a="upg-all"]').disabled === true;
  /* locked ones are never in the plan */
  fresh(1e9); var big = upgPlanAll(); out.lockedSkipped = !big.add.swimlegs && !big.add.antcap && !!big.add.hooves;
  /* 7. the bonus summary: real stats, and special text for upgrades with no stat */
  fresh(0); out.sumEmpty = /Nothing bought yet/.test($('.upsum').textContent);
  Save.data.meta = { hooves: 3, hide: 2, deck: 2, antcap: 1 }; Save.data.antsUnlocked = true; Save.data.gold = 0; upgPage.sumSig = ''; showShop('upgrades');
  var sum = $('.upsum').textContent; out.sumStats = new RegExp('4 of ' + META.length + ' upgrades · 8 levels').test(sum) && /Max health/.test(sum) && /Weapon damage|Kick damage/.test(sum);
  out.sumSpecial = !!$('.upsum .tchip.sp') && /Rare and epic cards appear 14% more often/.test(sum) && /Each ant type can hold 2 more/.test(sum);
  var st0 = JSON.stringify(P.stats); upgStats({}); out.pure = JSON.stringify(P.stats) === st0 && metaLevel('hooves') === 3;
  /* 8. an old save with no meta object */
  Save.data.meta = undefined; var okNoMeta = true; try { upgPage.sumSig = ''; showShop('upgrades'); } catch (e) { okNoMeta = false; } out.noMeta = okNoMeta; Save.data.meta = {};
  /* pictures */
  if (view !== 'none'){
    G.state = 'shop'; shopTab = 'upgrades'; Save.data.chapter3Complete = view !== 'locked'; Save.data.antsUnlocked = view !== 'locked';
    Save.data.meta = { hooves: 9, hide: 4, strides: 2, prospect: 5, learner: 1, deck: 2, antcap: 1, antdmg: 3, instinct: 2 }; Save.data.gold = view === 'confirm' ? 60000 : 2400; Save.data.best = 12345678;
    upgPage.group = ({ combat: 'combat', body: 'body', ants: 'ants', all: 'all', summary: 'combat', locked: 'ants', maxed: 'combat', confirm: 'combat', afford: 'all' })[view] || 'combat'; upgPage.afford = view === 'afford'; upgPage.snap = null; upgPage.sumSig = '';
    showShop('upgrades'); if (view === 'confirm'){ GR.handleAction('upg-all'); }
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['groups', 'chips', 'oneGroup', 'body', 'all', 'bogusGroup', 'noDot', 'dot', 'afford', 'affordNone', 'row', 'buy5', 'noOvershoot', 'poor', 'oldBuy', 'pop', 'maxed', 'snapReset', 'seaLocked', 'antLocked', 'antBar', 'unlocks', 'antBuy', 'plan', 'confirm', 'cancel', 'buyAll', 'exhausted', 'noPlan', 'lockedSkipped', 'sumEmpty', 'sumStats', 'sumSpecial', 'pure', 'noMeta'];
out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
QA.done(out);
