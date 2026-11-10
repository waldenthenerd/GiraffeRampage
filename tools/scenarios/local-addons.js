/* local-addons: your own add-ons from the top-level addons/ folder (js/core/49-local-addons.js): where it looks, the listing and addons.txt readers,
   loading files in order, the example add-on and addonWrap (off is the original game, on is the add-on), a file that throws, one that registers nothing,
   a missing one, a repeated id, the "Local" tag and the note on the Add-ons page, and that nothing is looked for away from this computer.
   Run: node tools/qa-cloud.mjs tools/scenarios/local-addons.js --wait 60000 [--shot x.png --params "view=page|file"] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };
var out = { errs: [] }; window.addEventListener('error', function(e){ if (!/oops|fixtures|registered twice/.test(e.message + e.filename)) out.errs.push(e.message); });
function finish(){
  out.pass = out.errs.length === 0 && ['here', 'listing', 'listTxt', 'loaded', 'tagged', 'offIsOriginal', 'onCheers', 'thrown', 'noReg', 'missing', 'dupe', 'gameGoesOn', 'row', 'note', 'fileNote', 'offNote', 'wrapBad'].every(function(k){ return out[k] === true; });
  var v = QA.params.view;
  if (v === 'page'){ showAddons(); }
  else if (v === 'file'){ LOCAL_ADDONS.state = 'file'; showAddons(); }
  QA.done(out);
}
try {
  out.here = localAddonsHere() === 'local';                                        /* the test server is 127.0.0.1 */
  /* python's http.server listing: only plain .js files directly in the folder, in name order */
  var listing = '<ul><li><a href="examples/">examples/</a></li><li><a href="zeta.js">zeta.js</a></li><li><a href="README.md">README.md</a></li><li><a href="my%20idea.js">my idea.js</a></li><li><a href="/addons/alpha.js">alpha.js</a></li><li><a href="zeta.js">zeta.js</a></li><li><a href="../js/x.js">x</a></li></ul>';
  out.listing = JSON.stringify(localAddonsFromListing(listing)) === JSON.stringify(['alpha.js', 'my idea.js', 'zeta.js']);
  out.listTxt = JSON.stringify(localAddonsFromList('# mine\nb.js\n\n  a.js  # first\nsub/c.js\nnotes.txt\n')) === JSON.stringify(['b.js', 'a.js']);
  out.wrapBad = (function(){ try { addonWrap('x', 'noSuchFunctionHere', function(){}); return false; } catch (e) { return /no game function/.test(e.message); } })();
  var base0 = startWave;
  localAddonsLoad(['addons/examples/wave-cheer.js', 'tools/scenarios/fixtures/addon-throws.js', 'tools/scenarios/fixtures/addon-noreg.js', 'tools/scenarios/fixtures/missing.js', 'addons/examples/wave-cheer.js'], '/').then(function(L){
    try {
      var a = addonById('wavecheer');
      out.loaded = L.state === 'done' && !!a && L.files.length === 5 && L.files[0].ok === true && L.files[0].ids[0] === 'wavecheer';
      out.tagged = !!a && a.local === 'addons/examples/wave-cheer.js' && a.tag === 'silly';
      var errOf = function(f){ return L.errors.filter(function(e){ return e.file.indexOf(f) >= 0; }).map(function(e){ return e.why; }).join(' | '); };
      out.thrown = /oops/.test(errOf('addon-throws')) && !!addonById('brokenone');                /* it registered before it threw: it is listed, and the error is shown */
      out.noReg = window.__noRegLoaded === true && /did not call addonRegister/.test(errOf('addon-noreg'));
      out.missing = /could not be loaded/.test(errOf('missing.js'));
      out.dupe = /registered twice/.test(L.errors.map(function(e){ return e.why; }).join(' '));      /* the same file again: its id is taken */
      out.wrapped = startWave !== base0;
      /* off: the original game, no cheer; on: a cheer over her head */
      addonSet('wavecheer', false); GR.startRun(1); G.enemies.length = 0; G.texts.length = 0; startWave(2);
      out.offIsOriginal = !G.texts.some(function(t){ return /Bring it on|Next!|Is that all|Here we go|Ready!/.test(t.txt || t.text || ''); }) && G.wave === 2;
      addonSet('wavecheer', true); G.texts.length = 0; startWave(3);
      out.onCheers = G.wave === 3 && G.texts.some(function(t){ return /Here we go again/.test(t.txt || t.text || ''); });
      addonSet('wavecheer', false); addonSet('brokenone', false);
      out.gameGoesOn = G.state === 'playing' || G.state === 'levelup';
      hideOverlay(); G.state = 'menu';
      showAddons();
      var row = document.querySelector('[data-a="addon-t-wavecheer"]');
      out.row = !!row && /Local/.test(row.parentNode.textContent);
      var note = document.querySelector('.addonlocal');
      out.note = !!note && /wave-cheer\.js/.test(note.textContent) && /oops/.test(note.textContent) && /could not be loaded/.test(note.textContent);
      hideOverlay(); G.state = 'menu';
      var st = LOCAL_ADDONS.state; LOCAL_ADDONS.state = 'file'; out.fileNote = /python3 -m http\.server/.test(localAddonsNoteHTML());
      LOCAL_ADDONS.state = 'off'; out.offNote = localAddonsNoteHTML() === ''; LOCAL_ADDONS.state = st;
    } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
    finish();
  });
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); finish(); }
