/* The phone pass (css/phone.css, the chapter title in js/36-atmosphere.js). Run as a phone: node tools/qa-cloud.mjs tools/scenarios/phone-pass.js --touch --w 390 --h 844 --wait 90000 [--shot x.png --params "screen=upgrades|bestiary|settings|wardrobe|photo|fusion|wheel|ants"]; add --h 390 --w 844 for the landscape checks (they are skipped in portrait). */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function px(sel, prop){ var el = document.querySelector(sel); return el ? parseFloat(getComputedStyle(el)[prop]) : NaN; }
function all(sel){ return [].slice.call(document.querySelectorAll(sel)); }
function noSideScroll(){ return document.documentElement.scrollWidth <= innerWidth + 1; }
try {
  var screen = (QA.params && QA.params.screen) || '', land = innerWidth > innerHeight;
  out.coarse = matchMedia('(pointer:coarse)').matches; out.vw = innerWidth;
  ['debug-unlockall', 'debug-venus', 'debug-mars', 'debug-city', 'debug-lab', 'debug-ants', 'debug-combos', 'debug-mini-own', 'debug-bestiary'].forEach(function(a){ try { GR.handleAction(a); } catch (e) {} });
  Save.data.gold = 5e7; Save.data.gems = 9000; Save.data.food = 30; Save.data.wheelKeys = 3; Save.data.spottedKeys = 12; Save.data.antsUnlocked = true; Save.data.ants = { soldier: 5, distractor: 3, shooter: 6 };
  var screens = { settings: function(){ showSettings(); }, upgrades: function(){ showShop('upgrades'); }, gear: function(){ showShop('gear'); }, ants: function(){ showShop('ants'); }, wheel: function(){ showShop('wheel'); },
    bestiary: function(){ showBestiary(); }, fusion: function(){ showFusionMachine(); }, wardrobe: function(){ showWardrobe(); }, photo: function(){ showPhoto(); }, menu: function(){ showMenu(); } };
  out.noSideScroll = Object.keys(screens).every(function(k){ screens[k](); return noSideScroll(); });
  /* finger-sized controls (needs --touch) */
  screens.settings(); out.sliders = all('input[type=range]').length > 0 && all('input[type=range]').every(function(e){ return e.getBoundingClientRect().height >= 34; });
  screens.wardrobe(); out.swatches = all('.swatch:not(.pat)').filter(function(e){ return !e.closest('.dots'); }).every(function(e){ return e.getBoundingClientRect().width >= 38; });
  screens.photo(); out.chips = all('.pchip').length > 5 && all('.pchip').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  screens.upgrades(); out.upChips = all('.upchip').length > 3 && all('.upchip').every(function(e){ return e.getBoundingClientRect().height >= 38; }) && all('.upbtns .btn').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  screens.gear(); out.gview = all('.gview-b').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  /* nothing under 11px in the places that had it */
  function floor11(sel){ var l = all(sel); return l.length === 0 || l.every(function(e){ return parseFloat(getComputedStyle(e).fontSize) >= 10.99; }); }
  screens.gear(); out.gearText = floor11('.gsn small, .gtr small, .gp small');
  screens.ants(); out.antsText = floor11('.afbtns .btn small, .arbtns .btn small, .afforage .btn small, .afs small');
  screens.wheel(); out.wheelText = floor11('.wbtns .btn small, .upbtns .btn small, .uptop .btn small');
  startRun(1); for (var i = 0; i < 20; i++) GR.step(1 / 60); out.hudText = floor11('.bar span');
  /* upgrades (rebuilt in 41e): the Buy, Buy 5 and Max buttons of a row share one line */
  screens.upgrades(); var ub = all('.upbtns')[0], ubs = ub ? [].slice.call(ub.querySelectorAll('.btn')) : [];
  out.buyRow = ubs.length >= 2 && ubs.every(function(b){ return Math.abs(b.getBoundingClientRect().top - ubs[0].getBoundingClientRect().top) < 3; });
  /* fusion rows are unchanged: the Choose button stays beside the name */
  screens.fusion(); var row = document.querySelector('.shoprow'), nm = row && row.querySelector('.nm'), ch = row && row.querySelector('.btn');
  out.fusionRow = !!ch && !!nm && Math.abs(ch.getBoundingClientRect().top - nm.getBoundingClientRect().top) < 40;
  /* bestiary: three to a row on a phone */
  screens.bestiary(); var gc = getComputedStyle(document.querySelector('.bst-grid')).gridTemplateColumns.split(' ').length; out.bestiary3 = innerWidth > 520 || gc === 3;
  /* the chapter title never runs off a narrow screen: a long name shrinks, a long line splits in two */
  var cv = document.createElement('canvas'); cv.width = innerWidth; cv.height = innerHeight; var c = cv.getContext('2d'), widest = 0, drawn = 0, ft = c.fillText.bind(c), st = c.strokeText.bind(c);
  c.fillText = function(t, x, y){ drawn++; widest = Math.max(widest, c.measureText(t).width); return ft(t, x, y); };
  var keepFX = G.introFX, keepW = G.W, keepH = G.H; G.W = innerWidth; G.H = innerHeight;
  G.introFX = { t: 2, dur: 4, ch: 12, name: 'The Underground Giraffe City', desc: 'Something has been digging under the savanna for a very long time and it is finally ready to show you.', accent: '#F2B33D' };
  drawIntroFX(c); out.titleFits = drawn >= 3 && widest <= innerWidth - 8; out.titleW = Math.round(widest); G.introFX = keepFX; G.W = keepW; G.H = keepH;
  /* landscape: the wheel cards are one line each and the wheel is on the first screen */
  if (land){ screens.wheel(); var cd = document.querySelector('.wpick .wcard'); out.landCards = cd.getBoundingClientRect().height < 60; out.landWheel = document.querySelector('.wwheel').getBoundingClientRect().top < innerHeight * 0.8; }
  if (screen && screens[screen]){ G.state = 'shop'; screens[screen](); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['noSideScroll', 'sliders', 'swatches', 'chips', 'upChips', 'gview', 'gearText', 'antsText', 'wheelText', 'hudText', 'buyRow', 'fusionRow', 'bestiary3', 'titleFits'];
if (innerWidth > innerHeight) need = need.concat(['landCards', 'landWheel']);
out.pass = out.errs.length === 0 && out.coarse === true && need.every(function(k){ return out[k] === true; });
QA.done(out);
