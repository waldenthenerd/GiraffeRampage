/* menu-pass: the tidied main menu (js/ui/44zzzzp-menu-pass.js): the top strip (gold, gems; Guide, Add-ons, Settings), the groups and pictures on the buttons,
   the chapter dots, the "latest chapter" button, the lines on a new save, where the notes go, and the world behind the menu.
   Run: node tools/qa-cloud.mjs tools/scenarios/menu-pass.js --wait 60000 [--w 1280 --h 720 --scale 1] [--touch --w 390 --h 844] [--shot x.png --params "view=new|full&ch=9&notes=1"] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); } function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
function steps(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); }
function rect(el){ return el.getBoundingClientRect(); }
function hit(a, b){ return a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1; }
function unlock(){ try { GR.handleAction('debug-unlockall'); } catch (e) {} Save.data.gold = 48200; Save.data.gems = 310; }
function shown(){ return $$('#overlay [data-a]').filter(function(b){ return b.offsetParent && !/^ch-go|^speed|^debug/.test(b.getAttribute('data-a')); }); }
function offScreen(){ return shown().concat($$('.menu2 .mrecord')).filter(function(b){ var r = rect(b); return r.bottom > innerHeight + 1 || r.top < 0 || r.right > innerWidth + 1 || r.left < 0; }).map(function(b){ return b.getAttribute('data-a') || 'record'; }); }
var wide = innerWidth >= 1000 && innerHeight >= 521;
try {
  var view = QA.params.view;
  if (view){                                                                           /* a picture: view=new or view=full, ch=<chapter>, notes=1 shows both notes */
    if (view === 'full') unlock();
    if (QA.params.ch) setMenuChapter(+QA.params.ch);
    showMenu(); steps(90); showMenu();
    if (QA.params.notes){ Ach.toast('★ First Steps', 'Finish a run  (+5 gems)'); var w = document.getElementById('wardToast') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'wardToast' })); w.textContent = 'New coat color and pattern: Rust and Dune ripples. Find them under Coat colors in the main menu.'; w.className = 'on'; }
    out.off = offScreen(); QA.done(out);
  } else {
    /* 1. a new save */
    Save.reset(); setMenuChapter(1); showMenu(); steps(5); showMenu();
    var before = ['shop', 'town-enter', 'co-open', 'bestiary', 'forage', 'wardrobe', 'ach-open', 'help', 'addons', 'settings', 'play', 'ch-prev', 'ch-next'];
    out.kept = before.every(function(a){ return $$('#overlay [data-a="' + a + '"]').length === 1; });
    out.strip = !!$('.menu2 .mtop') && $$('.mtop .mw').length === 2 && /0/.test($('.mw.gold b').textContent) && ['help', 'addons', 'settings'].every(function(a){ return !!$('.mtop .mutils [data-a="' + a + '"]'); });
    out.utilNames = $$('.mtop .mutil').every(function(b){ return (b.getAttribute('aria-label') || '').length > 3; });
    out.groups = $$('.menu2 .mgroup').length >= 3 && $$('.menu2 .mside .btn').every(function(b){ return !!b.closest('.mgroup'); });
    out.icons = $$('.menu2 .mside .btn[data-a], .mtop .mutil').every(function(b){ return !MENU_ICONS[b.getAttribute('data-a')] || !!b.querySelector('.mbi svg'); });
    var nl = $$('.mside.l .btn').length, nr = $$('.mside.r .btn').length; out.balancedNew = Math.abs(nl - nr) <= 2; out.cols = [nl, nr];
    out.noZeros = $$('.menu2 .mside .btn small').every(function(s){ return !/^0 (of|gold)\b/.test(s.textContent.trim()); });
    out.invite = /Gold from your runs/.test($('[data-a="shop"]').textContent) && /Trophies pay/.test($('[data-a="ach-open"]').textContent);
    out.noLatestNew = !$('[data-a="ch-latest"]');
    var dots = $$('.menu2 .chdots .chdot');
    out.dots = dots.length === TOTAL_CHAPTERS && dots.every(function(d, i){ return d.getAttribute('data-a') === 'ch-go-' + (i + 1) && /^Chapter /.test(d.title); }) && /\(locked\)/.test(dots[3].title) && !/locked|cleared/.test(dots[0].title);
    out.keyNew = /chapters, one at a time/.test($('.chkey').textContent);
    out.htmlSame = (chapterSelectorHTML().match(/class="chdot[ "]/g) || []).length === TOTAL_CHAPTERS;                /* the page other files build on is as it was */
    if (wide) out.fitsNew = offScreen().length === 0 ? true : offScreen();
    out.worldNew = G.biome === 'savanna';
    GR.handleAction('ch-go-4'); out.dotGoesLocked = menuChapter() === 4 && G.biome === 'savanna' && !!$('.chstart[disabled]');     /* a locked chapter can be looked at, and is not shown off behind the menu */
    /* 2. everything open */
    unlock(); setMenuChapter(1); showMenu(); steps(5); showMenu();
    out.wallet = /48\.2k/.test($('.mw.gold b').textContent) && /310/.test($('.mw.gems b').textContent);
    out.goldKept = /48\.2k gold banked/.test($('[data-a="shop"]').textContent);
    var d2 = $$('.menu2 .chdots .chdot'), nDone = d2.filter(function(d){ return d.classList.contains('done'); }).length, flags = 0; for (var c = 1; c <= TOTAL_CHAPTERS; c++) if (Save.data['chapter' + c + 'Complete'] && chapterUnlocked(c)) flags++;
    out.done = nDone === flags && nDone > 10 && /\(cleared\)/.test(d2[0].title) && new RegExp(nDone + ' of ' + TOTAL_CHAPTERS + ' chapters cleared').test($('.chkey').textContent);
    var far = menuLatestChapter(), lb = $('[data-a="ch-latest"]');
    out.latest = far === TOTAL_CHAPTERS && !!lb && lb.textContent.indexOf('Chapter ' + chapterLabel(far)) > 0;
    if (wide) out.fitsFull = offScreen().length === 0 ? true : offScreen();
    GR.handleAction('ch-go-9'); out.dotGoes = menuChapter() === 9 && $('.chdot.on').getAttribute('data-a') === 'ch-go-9' && G.biome === 'venus';
    if (wide){ var worst = []; [14, 16, 17, 18].forEach(function(n){ GR.handleAction('ch-go-' + n); var o = offScreen(); if (o.length) worst.push(n + ':' + o.join()); }); out.fitsLong = worst.length ? worst : true; }
    GR.handleAction('ch-go-' + TOTAL_CHAPTERS); out.latestHidden = !$('[data-a="ch-latest"]') && G.biome === 'ocean';                 /* on the latest chapter the Start button is it; the air chase is over the sea */
    GR.handleAction('ch-go-2'); steps(40); out.worldRuns = G.biome === 'snow' && G.attract === true && !P.dead && G.state === 'menu';
    /* 3. notes cover no control (and, on a computer, not the title) */
    Ach.queue = []; Ach.showing = false; Ach.toast('★ First Steps', 'Finish a run  (+5 gems)');
    var wt = document.getElementById('wardToast') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'wardToast' })); wt.textContent = 'New coat color and pattern: Rust and Dune ripples. Find them under Coat colors in the main menu.'; wt.className = 'on';
    var at = document.getElementById('achToast'); at.style.transition = wt.style.transition = 'none'; void at.offsetWidth;
    var ra = rect(at), rw = rect(wt), avoid = ['.chstart', '.speedslider', '.charrow', '.mtop'].concat(wide ? ['.marquee', '.mside .btn'] : []), bad = [];
    avoid.forEach(function(s){ $$('.menu2 ' + s).forEach(function(el){ if (el.offsetParent && rect(el).top < innerHeight && (hit(ra, rect(el)) || (innerWidth >= 600 || s !== '.speedslider') && hit(rw, rect(el)) && s !== '.mside .btn')) bad.push(s); }); });
    out.notesClear = bad.length ? bad : true; out.notesApart = !hit(ra, rw);
    at.classList.remove('on'); wt.className = '';
    /* 4. the latest chapter button starts it */
    setMenuChapter(1); showMenu(); GR.handleAction('ch-latest');
    out.latestStarts = menuChapter() === far && G.state !== 'menu';
    var need = ['kept', 'strip', 'utilNames', 'groups', 'icons', 'balancedNew', 'noZeros', 'invite', 'noLatestNew', 'dots', 'keyNew', 'htmlSame', 'worldNew', 'dotGoesLocked', 'wallet', 'goldKept', 'done', 'latest', 'dotGoes', 'latestHidden', 'worldRuns', 'notesClear', 'notesApart', 'latestStarts'].concat(wide ? ['fitsNew', 'fitsFull', 'fitsLong'] : []);
    out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
    out.failed = need.filter(function(k){ return out[k] !== true; });
    QA.done(out);
  }
} catch (e) { out.err = String(e && e.stack || e); out.pass = false; QA.done(out); }
