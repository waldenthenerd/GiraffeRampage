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
  out.prevErr = gearPreview.err || null; out.hScroll = document.documentElement.scrollWidth <= window.innerWidth + 1;
  out.pageText = (txt('.gslots') || '').slice(0, 80);

  if (st === 'compare'){
    var rc0 = 0, rs = recalcStats; recalcStats = function(){ rc0++; return rs.apply(this, arguments); };
    grantGear('thornweave:armor'); grantGear('stoneplate:armor'); grantGear('leviathan:cape'); grantGear('twinsoul:weapon');
    /* completes a set: cape + armor worn, hooves not equipped -> pointing at it completes Herdhide */
    unequipSlot('weapon'); rc0 = 0; gearPage.slot = 'weapon'; showShop('gear');
    gearPage.hover = 'herdhide:weapon'; gearSyncSelection();
    var cs = document.querySelector('.gcset'); out.completes = !!(cs && cs.className.indexOf('done') >= 0 && /Completes/.test(cs.textContent));
    out.noRecalcOnTryon = rc0 === 0; gearPage.hover = null; gearSyncSelection();
    /* green and red */
    equipGear('sunforged:armor'); gearPage.slot = 'armor'; showShop('gear'); gearPage.hover = 'herdhide:armor'; gearSyncSelection();
    out.red = document.querySelectorAll('.grow.down').length;
    equipGear('herdhide:armor'); gearPage.hover = 'sunforged:armor'; gearSyncSelection(); out.green = document.querySelectorAll('.grow.up').length;
    out.fmtLess = gearFmtVal('dr', 0.06) === '\u22126%' && gearFmtVal('dr', 0) === '0%' && gearFmtVal('oceanDr', 0.04) === '\u22124%' && gearFmtVal('crit', 0.05) === '5%';
    var dr = document.querySelector('.grow span'); out.firstRow = dr ? dr.textContent : null;
    gearPage.hover = null; gearPage.selected = 'sunforged:armor'; gearSyncSelection(); out.sideHasEquip = !!document.querySelector('#gearSide [data-equip="sunforged:armor"]');
    /* the try-on does not persist */
    var eqBefore = JSON.stringify(Save.data.equipped); showShop('gear'); out.persist = JSON.stringify(Save.data.equipped) === eqBefore;
    /* rapid clicks: 20 alternating equip / take off through the real buttons, then stats match a fresh recalc */
    for (var i = 0; i < 20; i++){
      gearPage.selected = 'sunforged:armor'; gearSyncSelection();
      var b = document.querySelector('#gearSide [data-equip="sunforged:armor"]'); if (b) b.click(); else { var t = document.querySelector('[data-unequip="armor"]'); if (t) t.click(); }
    }
    var snap = JSON.stringify(P.stats); recalcStats(); out.rapid = snap === JSON.stringify(P.stats) && (gearEquipped('armor') === 'sunforged:armor' || gearEquipped('armor') === null);
    recalcStats = rs;
    gearPage.selected = null; gearPage.slot = QA.params.slot || 'weapon'; if (!QA.params.hover) unequipSlot('weapon'); showShop('gear'); gearPage.hover = QA.params.hover || 'herdhide:weapon'; gearSyncSelection();
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.hasPreview && !out.errs.length && (st !== 'compare' || (out.completes && out.noRecalcOnTryon && out.red > 0 && out.green > 0 && out.sideHasEquip && out.persist && out.rapid && out.fmtLess)) && (st === 'sets' ? out.tiles === 48 && out.noSearch : (out.slotBtns === 3 && out.hatIsWardrobe && out.noSearch && out.drew && out.pixels > 800)));
QA.done(out);
