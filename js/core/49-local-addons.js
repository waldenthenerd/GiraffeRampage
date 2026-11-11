'use strict';
/* Your own add-ons: .js files dropped in the top-level addons/ folder, loaded when the game runs on your own computer. */
/* ========================= 49. LOCAL ADD-ONS ========================= */
/* A player who runs the game from her own copy (served on localhost, e.g. `python3 -m http.server 8123` in the game's folder) can write an add-on
   and drop it into addons/: the game finds every .js file directly in that folder (not in its subfolders, so addons/examples/ is only there to
   copy from) and loads them one by one, in name order, once the game has started. How to write one is in README.md, "Building your own add-on".
   Finding the files: addons/addons.txt, if there is one (a file name on each line, # for a comment), says which to load and in what order;
   otherwise the folder's listing is read, which python's http.server, `npx serve` and most editors' live servers give. A copy opened by
   double-clicking index.html (file://) cannot look inside a folder, so it loads none, and the Add-ons page says how to serve it instead.
   Only on this computer: on any other address (the hosted website, a friend's server) nothing is looked for, so a website never runs files it
   was not built with. The website package does not contain the addons/ folder anyway.
   A local add-on registers like a shipped one (addonRegister) and keeps its switch in Save.data.addons by its id, so its on/off choice is kept
   between visits; it is marked "Local" on the Add-ons page with its file name. A file that fails to load, throws, or registers a bad or
   repeated id is listed on the Add-ons page with the reason, and the game goes on without it.
   addonWrap(id, name, fn) is the easy way to change the game from an add-on: it replaces the global function `name` with one that calls
   fn(base, ...args) while the add-on is on and the original otherwise. */
const LOCAL_ADDONS = { state: 'idle', files: [], errors: [], current: '', mode: '' };

/* is this the player's own computer? */
function localAddonsHere(){
  try {
    const l = window.location;
    if (l.protocol === 'file:') return 'file';
    if (!/^https?:$/.test(l.protocol)) return '';
    return /^(localhost|127(\.\d{1,3}){3}|\[::1\]|0\.0\.0\.0)$/i.test(l.hostname) ? 'local' : '';
  } catch (e) { return ''; }
}

/* the file names a folder listing links to: plain .js files directly in the folder */
function localAddonsFromListing(html){
  const out = [], seen = {}, re = /href\s*=\s*["']([^"'?#]+)["']/gi;
  let m;
  while ((m = re.exec(html))){
    let f = m[1]; try { f = decodeURIComponent(f); } catch (e) {}
    f = f.replace(/^\.\//, '').replace(/^.*\/addons\//, '');
    if (!/^[^\/\\]+\.js$/i.test(f) || seen[f]) continue;
    seen[f] = 1; out.push(f);
  }
  return out.sort();
}
/* addons/addons.txt: a file name on each line; blank lines and # comments are skipped */
function localAddonsFromList(txt){
  return String(txt).split(/\r?\n/).map(function(s){ return s.replace(/#.*/, '').trim(); }).filter(function(s){ return /^[^\/\\]+\.js$/i.test(s); });
}

function localAddonsFind(){
  const get = function(u){ return fetch(u, { cache: 'no-store' }).then(function(r){ if (!r.ok) throw new Error(r.status); return r.text(); }); };
  return get('addons/addons.txt').then(function(t){ LOCAL_ADDONS.mode = 'list'; return localAddonsFromList(t); })
    .catch(function(){ return get('addons/').then(function(h){ LOCAL_ADDONS.mode = 'listing'; return localAddonsFromListing(h); }); })
    .catch(function(){ LOCAL_ADDONS.mode = 'none'; return []; });
}

/* load the files one at a time, so each one's add-ons can be told apart, and errors are pinned to the file that made them */
function localAddonsLoad(files, base){
  base = base === undefined ? 'addons/' : base;
  LOCAL_ADDONS.state = 'loading';
  let chain = Promise.resolve();
  files.forEach(function(f){
    chain = chain.then(function(){ return localAddonsLoadOne(base + f, f); });
  });
  return chain.then(function(){
    LOCAL_ADDONS.state = 'done'; LOCAL_ADDONS.current = '';
    try { addonsSync(); if (G.state === 'menu' || G.subScreen === 'addons') refreshScreen(); } catch (e) {}
    return LOCAL_ADDONS;
  });
}
function localAddonsLoadOne(url, name){
  return new Promise(function(done){
    const before = ADDONS.length;
    let thrown = null;
    const onErr = function(ev){ if (ev && ev.filename && ev.filename.indexOf(url) >= 0){ if (LOCAL_ADDONS.stopped !== name) thrown = ev.message || 'it threw an error'; ev.preventDefault && ev.preventDefault(); } };
    window.addEventListener('error', onErr);
    LOCAL_ADDONS.current = name; LOCAL_ADDONS.stopped = '';
    const s = document.createElement('script');
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();          /* always the file as it is now, not a cached copy */
    const finish = function(failed){
      window.removeEventListener('error', onErr);
      const made = ADDONS.slice(before);
      made.forEach(function(a){ a.local = name; });
      if (failed) LOCAL_ADDONS.errors.push({ file: name, why: 'could not be loaded (is it in the addons folder?)' });
      else if (LOCAL_ADDONS.stopped === name){}                                   /* already listed by addonRegister */
      else if (thrown) LOCAL_ADDONS.errors.push({ file: name, why: thrown });
      else if (!made.length) LOCAL_ADDONS.errors.push({ file: name, why: 'loaded, but it did not call addonRegister, so there is nothing to switch on' });
      LOCAL_ADDONS.files.push({ file: name, ids: made.map(function(a){ return a.id; }), ok: !failed && !thrown && LOCAL_ADDONS.stopped !== name && made.length > 0 });
      done();
    };
    s.onload = function(){ finish(false); };
    s.onerror = function(){ finish(true); };
    document.head.appendChild(s);
  });
}

/* the easy wrapper for add-on authors: addonWrap('myidea', 'startWave', function(base, n){ const r = base(n); ...; return r; }) */
function addonWrap(id, name, fn){
  const base = window[name];
  if (typeof base !== 'function') throw new Error('addonWrap: there is no game function called "' + name + '"');
  const wrapped = function(){
    if (!addonOn(id)) return base.apply(this, arguments);
    const self = this, args = Array.prototype.slice.call(arguments);
    return fn.apply(this, [function(){ return base.apply(self, arguments.length ? arguments : args); }].concat(args));
  };
  window[name] = wrapped;
  return wrapped;
}

/* a local file's addonRegister marks its add-ons; a bad or repeated id is reported, not fatal */
{
  const baseReg = addonRegister;
  addonRegister = function(def){
    if (!LOCAL_ADDONS.current) return baseReg.apply(this, arguments);
    try { const a = baseReg.apply(this, arguments); a.local = LOCAL_ADDONS.current; return a; }
    catch (e) { LOCAL_ADDONS.errors.push({ file: LOCAL_ADDONS.current, why: e.message }); LOCAL_ADDONS.stopped = LOCAL_ADDONS.current; throw e; }     /* stop the file: the rest of it is for an add-on that is not there */
  };
}

/* start once the page (and the game) has loaded */
function localAddonsStart(){
  const here = localAddonsHere();
  if (here !== 'local'){ LOCAL_ADDONS.state = here === 'file' ? 'file' : 'off'; return Promise.resolve(LOCAL_ADDONS); }
  return localAddonsFind().then(function(files){ return localAddonsLoad(files); });
}
if (document.readyState === 'complete') setTimeout(localAddonsStart, 0);
else window.addEventListener('load', function(){ setTimeout(localAddonsStart, 0); });

/* the Add-ons page's note about your own add-ons: which files were loaded, which failed and why, or how to load them at all */
function localAddonsNoteHTML(){
  const L = LOCAL_ADDONS, esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  if (L.state === 'file') return '<div class="addonlocal">Your own add-ons: this copy was opened as a file, so it cannot look in the <code>addons</code> folder. Serve the game’s folder instead (for example <code>python3 -m http.server 8123</code>, then open <code>localhost:8123</code>). See “Building your own add-on” in README.md.</div>';
  if (L.state === 'off' || L.state === 'idle') return '';
  if (L.state === 'loading') return '<div class="addonlocal">Looking in the <code>addons</code> folder…</div>';
  const ok = L.files.filter(function(f){ return f.ok; });
  let h = '<div class="addonlocal">';
  if (!L.files.length && !L.errors.length) h += 'Your own add-ons: drop a <code>.js</code> file into the <code>addons</code> folder and reload the page. See “Building your own add-on” in README.md.';
  else h += 'From your <code>addons</code> folder: <b>' + (ok.length ? ok.map(function(f){ return esc(f.file); }).join(', ') : 'nothing loaded yet') + '</b>.';
  L.errors.forEach(function(e){ h += '<br><span class="bad">' + esc(e.file) + ': ' + esc(e.why) + '</span>'; });
  return h + '</div>';
}
