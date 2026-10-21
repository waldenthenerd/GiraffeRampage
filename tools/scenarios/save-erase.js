/* save-erase: "Erase all progress" really erases (and keeps only the settings), DEFAULT_SAVE is never written into, Save.load tidies odd values in an
   old or damaged save without touching good ones, and a cooldown time stamp from the future does not lock the foraging or the minigame. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go');
  try {
    var snap = JSON.stringify(DEFAULT_SAVE), NESTED = ['meta', 'gear', 'equipped', 'equippedTrinkets', 'combos', 'mastered', 'comboClaims', 'city', 'marsUp', 'mutations', 'squad', 'venusUp'];
    /* 1. a fresh save gets its own copies of the defaults, never DEFAULT_SAVE's */
    localStorage.removeItem(SAVE_KEY); Save.load();
    out.notShared = NESTED.every(function(k){ return Save.data[k] !== DEFAULT_SAVE[k]; });
    /* 2. play a little as a new player, then erase: nothing is kept, and DEFAULT_SAVE itself is untouched */
    var S = Save.data;
    S.gold = 5000; S.gems = 90; S.best = 123456; S.bestWave = 40; S.runs = 12; S.totalKills = 999; S.chaptersComplete = 3; S.chapter1Complete = true; S.chapter2Complete = true; S.cratesOpened = 4;
    S.combos.a = 1; S.mastered.a = 1; S.comboClaims.a = 1; S.city.bank = 3; S.marsUp.a = 2; S.mutations.a = 1; S.squad.a = 1; S.venusUp.a = 1; S.meta.hooves = 4; S.gear.x = 1; S.equippedTrinkets = ['t'];
    S.mutUses = 3; S.vials = 2; S.iron = 8; S.argon = 5; S.sulfur = 9; S.basalt = 4; S.spaceplane = 2; S.antsUnlocked = true; S.ants = { soldier: 5, distractor: 2, shooter: 1 }; S.food = 12; S.lastForageAt = 1; S.wheelKeys = 2;
    S.album = ['code1']; S.outfits = [{ n: 'x' }]; S.mini = { own: { hat1: 1 }, plays: 3 }; S.town = { found: { a: 1 } }; S.bestiary = { creatures: { hyena: 1 }, cards: {} };
    S.musicVol = 0.3; S.textScale = 2; S.hitFlash = 0.5; S.keys = { up: 'KeyI' }; S.muted = true; S.autoPerf = false; S.npcVoice = false;
    Save.reset(); var R = Save.data;
    out.defaultsUntouched = JSON.stringify(DEFAULT_SAVE) === snap;
    out.numbersZero = ['gold', 'gems', 'best', 'bestWave', 'runs', 'totalKills', 'chaptersComplete', 'cratesOpened', 'mutUses', 'vials', 'iron', 'argon', 'sulfur', 'basalt', 'spaceplane', 'food', 'lastForageAt', 'wheelKeys'].every(function(k){ return R[k] === 0; });
    out.flagsOff = R.chapter1Complete === false && R.chapter2Complete === false && R.antsUnlocked === false;
    out.listsEmpty = ['combos', 'mastered', 'comboClaims', 'city', 'marsUp', 'mutations', 'squad', 'venusUp', 'meta', 'gear'].every(function(k){ return Object.keys(R[k]).length === 0; }) && R.equippedTrinkets.length === 0;
    out.antsBestiaryFresh = R.ants.soldier === 0 && R.ants.distractor === 0 && R.ants.shooter === 0 && Object.keys(R.bestiary.creatures).length === 0;
    out.everythingElseGone = R.album === undefined && R.outfits === undefined && R.mini === undefined && R.town === undefined;
    out.settingsKept = R.musicVol === 0.3 && R.textScale === 2 && R.hitFlash === 0.5 && R.keys && R.keys.up === 'KeyI' && R.muted === true && R.autoPerf === false && R.npcVoice === false;
    out.resetNotShared = NESTED.every(function(k){ return R[k] !== DEFAULT_SAVE[k]; });
    /* ...and a second time, after playing again */
    R.combos.b = 1; R.city.c = 2; Save.reset();
    out.secondReset = Object.keys(Save.data.combos).length === 0 && Object.keys(Save.data.city).length === 0 && JSON.stringify(DEFAULT_SAVE) === snap;
    var back = Save.data; Save.load(); out.reloadEmpty = Save.data.gold === 0 && Object.keys(Save.data.combos).length === 0;       /* what was written is a clean save */
    /* the confirm says what it erases */
    confirmWipe(); var ov = document.getElementById('overlay').textContent;
    out.confirmText = /gold and gems/.test(ov) && /gear/.test(ov) && /photo album/.test(ov) && /outfits/.test(ov) && /Town/.test(ov) && /settings stay/i.test(ov);
    /* 3. an odd save is tidied, a good one is not changed */
    localStorage.setItem(SAVE_KEY, JSON.stringify({ gold: 10, best: -5, bestWave: '12', runs: -3, totalKills: 'x', chaptersComplete: 2.7, chapter1Complete: 1, chapter10Complete: 'yes', chapter3Complete: 0, cratesOpened: null, ants: { soldier: '4', distractor: -2, shooter: 1e12, engineer: 3.9, junk: 'z' } }));
    Save.load(); var L = Save.data;
    out.tidied = L.best === 0 && L.bestWave === 12 && L.runs === 0 && L.totalKills === 0 && L.chaptersComplete === 2 && L.chapter1Complete === true && L.chapter10Complete === true && L.chapter3Complete === false && L.cratesOpened === 0 &&
      L.ants.soldier === 4 && L.ants.distractor === 0 && L.ants.shooter === 1e6 && L.ants.engineer === 3 && L.ants.junk === 0;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ gold: 77, best: 5e9, bestWave: 130, runs: 40, totalKills: 12345, chaptersComplete: 6, chapter5Complete: true, cratesOpened: 17, ants: { soldier: 9, distractor: 4, shooter: 6 } }));
    Save.load(); L = Save.data;
    out.goodKept = L.gold === 77 && L.best === 5e9 && L.bestWave === 130 && L.runs === 40 && L.totalKills === 12345 && L.chaptersComplete === 6 && L.chapter5Complete === true && L.cratesOpened === 17 && L.ants.soldier === 9 && L.ants.distractor === 4 && L.ants.shooter === 6;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ants: [1, 2] })); Save.load(); out.antsArray = !Array.isArray(Save.data.ants) && Save.data.ants.soldier === 0;
    /* 4. a time stamp from the future (a clock that was ahead, a save from another device) does not lock foraging or the minigame */
    var now = Date.now(); Save.data.lastForageAt = now + 10 * 86400000; miniData().last = now + 10 * 86400000;
    out.futureForage = forageReadyIn() === 0 && miniReadyIn() === 0;
    Save.data.lastForageAt = now - 60000; miniData().last = now - 30000;
    out.pastForage = Math.abs(forageReadyIn() - (FORAGE_COOLDOWN_MS - 60000)) < 2000 && Math.abs(miniReadyIn() - (MINI_COOLDOWN_MS - 30000)) < 2000;
    Save.data.lastForageAt = now - FORAGE_COOLDOWN_MS - 1; out.pastDone = forageReadyIn() === 0;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  var need = ['notShared', 'defaultsUntouched', 'numbersZero', 'flagsOff', 'listsEmpty', 'antsBestiaryFresh', 'everythingElseGone', 'settingsKept', 'resetNotShared', 'secondReset', 'reloadEmpty', 'confirmText', 'tidied', 'goodKept', 'antsArray', 'futureForage', 'pastForage', 'pastDone'];
  out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
  QA.done(out);
})();
