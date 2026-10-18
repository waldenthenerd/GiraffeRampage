/* Gear page (plan Tasks 6, 7). Params: state=empty|one|set|sets|kick|compare. Run with --shot to see the page. */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
var st = QA.params.state || 'one';
function txt(sel){ var n = document.querySelector(sel); return n ? n.textContent : null; }
try {
  Save.data.gear = {}; Save.data.gearLv = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gems = 500; Save.data.gold = 1000;
  if (st !== 'empty'){
    grantGear('stoneplate:cape'); grantGear('herdhide:cape'); grantGear('herdhide:armor'); grantGear('herdhide:weapon'); grantGear('frostbite:weapon'); grantGear('sunforged:armor'); grantGear('starborn:cape'); grantGear('glacierguard:weapon');
    Save.data.gearLv['starborn:cape'] = 3; Save.data.gearLv['sunforged:armor'] = 1;
  }
  if (st === 'one') equipGear('stoneplate:cape');
  if (st === 'set' || st === 'kick'){ equipGear('herdhide:cape'); equipGear('herdhide:armor'); equipGear('herdhide:weapon'); }
  if (st === 'compare'){ equipGear('herdhide:cape'); equipGear('herdhide:armor'); equipGear('herdhide:weapon'); }
  recalcStats();
  gearPage.view = st === 'sets' ? 'sets' : 'doll'; gearPage.slot = st === 'compare' ? 'weapon' : 'cape'; gearPage.selected = null; gearPage.hover = null;
  showShop('gear');
  var cv = document.getElementById('gearPreview');
  out.hasPreview = st === 'sets' ? !cv : !!cv;
  if (st !== 'sets'){
    out.slotBtns = document.querySelectorAll('[data-a^="gear-slot-"]').length;
    var hb = [].slice.call(OV.querySelectorAll('button')).filter(function(b){ return /\bhats?\b|\bboots?\b/i.test(b.textContent); });
    out.hatBtns = hb.length; out.hatIsWardrobe = hb.length === 1 && hb[0].getAttribute('data-a') === 'wardrobe';
    out.noSearch = !document.getElementById('gearSearch');
    var f0 = gearPreview.frames; gearPreviewDraw(cv, performance.now()); out.drew = gearPreview.frames === f0 + 1;
    var d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, n = 0; for (var i = 3; i < d.length; i += 4) if (d[i] > 40) n++; out.pixels = n;
    out.pRestored = (P.capeSet === (gearEquipped('cape') ? GEAR_INDEX[gearEquipped('cape')].setId : null)) && P.x !== 0 + 0.5;
    if (st === 'kick'){ gearPreview.kickT = 0.075; gearPreviewDraw(cv, performance.now() + 40); }
    /* tap a piece: selected, not equipped */
    var tile = OV.querySelector('[data-a="gear-pick-herdhide:cape"]');
    if (tile && st === 'one'){ var before = gearEquipped('cape'); tile.click(); out.selected = gearPage.selected === 'herdhide:cape'; out.notEquipped = gearEquipped('cape') === before; gearPreviewDraw(cv, performance.now() + 80); }
    out.capeAfterTryon = P.capeSet;
  } else { out.noSearch = !!document.getElementById('gearSearch'); out.tiles = document.querySelectorAll('.gtile').length; }
  out.locks = document.querySelectorAll('.gp.locked,.gtile.locked').length;
  out.hScroll = document.documentElement.scrollWidth <= window.innerWidth + 1;
  out.pageText = (txt('.gslots') || '').slice(0, 80);
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.hasPreview && !out.errs.length && (st === 'sets' ? out.tiles === 48 && out.noSearch : (out.slotBtns === 3 && out.hatIsWardrobe && out.noSearch && out.drew && out.pixels > 800)));
QA.done(out);
