/* ui-pass: the layout and usability pass. "Erase all progress" is only in Settings (not on the Trading post, not while paused) and asks twice; the Trading post
   header holds the title, the purses and the tabs; the Ants tab before the colony shows a progress bar toward 100,000,000; a new player's Gear tab shows the way to the
   first crate instead of an empty doll, and the doll once she owns a piece; the Bestiary shows only what is found plus one count line (a chapter with nothing found is one
   line, a card not yet taken is only counted); the run report puts the map beside the figures on a wide screen; the heads-up display is one line per figure on a phone.
   Run it on a desktop size and with --touch --w 390 --h 844. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function ov(){ return (document.getElementById('overlay') || {}).innerHTML || ''; }
  try {
    Save.reset(); Save.data.gold = 5000; Save.data.gems = 10;
    /* erase */
    GR.showShop('upgrades'); out.shopNoWipe = ov().indexOf('data-a="wipe"') < 0;
    showSettings(); out.settingsWipe = ov().indexOf('data-a="wipe"') > 0 && /Danger zone/.test(ov());
    GR.handleAction('wipe'); out.step1 = /data-a="wipe-ask"/.test(ov()) && ov().indexOf('wipe-yes') < 0;
    GR.handleAction('wipe-ask'); out.step2 = /data-a="wipe-yes"/.test(ov()) && /Last chance/.test(ov());
    GR.handleAction('wipe-no'); out.backToSettings = /Settings/.test(ov()) && G.subScreen === 'settings' && Save.data.gold === 5000;
    GR.handleAction('settings-back'); G.state = 'paused'; showSettings(); out.pausedNoWipe = ov().indexOf('data-a="wipe"') < 0; G.state = 'menu'; G.subScreen = '';
    showSettings(); GR.handleAction('wipe'); GR.handleAction('wipe-ask'); GR.handleAction('wipe-yes'); out.erased = Save.data.gold === 0 && G.state === 'menu';
    /* the Trading post header */
    Save.data.gold = 777; GR.showShop('upgrades'); var sh = document.querySelector('#overlay .shophead');
    out.shopHead = !!sh && !!sh.querySelector('h2.head') && !!sh.querySelector('.goldnum') && sh.querySelectorAll('.tab').length >= 4 && getComputedStyle(sh).position === 'sticky';
    /* ants */
    Save.data.best = 25000000; GR.showShop('ants'); var al = document.querySelector('#overlay .antlock');
    out.antsCard = !!al && /Your best run/.test(al.textContent) && /25%/.test(al.textContent) && parseFloat(al.querySelector('.upbar u').style.width) === 25;
    Save.data.best = 0;
    /* gear */
    Save.data.gems = 10; GR.showShop('gear'); out.gearFirst = !!document.querySelector('#overlay .antlock') && !document.getElementById('gearPreview') && /Find your first piece/.test(ov()) && !!document.querySelector('[data-crate="normal"]');
    grantGear(Object.keys(GEAR_INDEX)[0]); GR.showShop('gear'); out.gearDoll = !!document.getElementById('gearPreview') && !document.querySelector('#overlay .antlock');
    Save.data.gear = {}; /* bestiary */
    showBestiary('creatures'); out.bstFresh = !document.querySelector('.bst-entry') && document.querySelectorAll('.bst-none').length === BESTIARY_CHAPTERS.length && !/\?\?\?/.test(ov());
    var first = BESTIARY_ORDER.filter(function(k){ return bestiaryTable(1)[k]; })[0]; bestiaryData().creatures['1:' + first] = 3; showBestiary('creatures');
    out.bstFound = document.querySelectorAll('.bst-entry').length === 1 && !!document.querySelector('.bst-grid .bst-more') && document.querySelectorAll('.bst-none').length === BESTIARY_CHAPTERS.length - 1 && !/\?\?\?/.test(ov());
    showBestiary('cards'); out.bstCards = !document.querySelector('.bst-card') && /undiscovered/.test(ov()) && !/\?\?\?/.test(ov());
    /* the run report */
    G.lastRun = { time: 70, wave: 3, kills: 12, score: 5000, gold: 10, gems: 1, base: 10, bonus: 0, mult: 1, report: { dmg: { kick: 100 }, xp: 5, taken: 7, level: 2, killedBy: 'a hyena', cards: [], prevBest: 0, prevBestWave: 0, score: 5000, wave: 3 } };
    showDeath(); out.deathGrid = !!document.querySelector('.drgrid .drl .summary') && !!document.querySelector('.drgrid .drr #runMap') && !!document.querySelector('.row.stickyback [data-a="play"]');
    /* the heads-up display on a phone */
    GR.startRun(1); GR.G.introFX = null; HUD.classList.add('on'); var b = document.getElementById('hScore'), st = b && b.parentNode;
    out.hudPhone = innerWidth > 760 || (getComputedStyle(b).display === 'inline' && st.getBoundingClientRect().height < 34);
    out.hudDesk = innerWidth <= 760 || (getComputedStyle(b).display === 'block' && st.getBoundingClientRect().height > 30);
    var need = ['shopNoWipe', 'settingsWipe', 'step1', 'step2', 'backToSettings', 'pausedNoWipe', 'erased', 'shopHead', 'antsCard', 'gearFirst', 'gearDoll', 'bstFresh', 'bstFound', 'bstCards', 'deathGrid', 'hudPhone', 'hudDesk'];
    out.failed = need.filter(function(k){ return !out[k]; }); out.pass = out.failed.length === 0 && out.errs.length === 0;
  } catch (e) { out.err = String(e && e.stack || e); }
  QA.done(out);
})();
