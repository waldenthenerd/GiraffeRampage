'use strict';
/* Sharing and saving photos: the whole picture is packed into a few dozen bytes, written as Base64 for sharing, and kept in an album. */
/* ========================= 44p. PHOTO SHARING AND ALBUM ========================= */
/* THE CODE. A photo is described by this data (the "JSON form", which is what version 1 of the code carried as Base64 text):
     { "v":1, "bg":n, "pose":n, "flip":bool, "giraffe":{"x","y","s"},
       "look":{"skin","spots","pattern","gear","hat":"id","boots":"id","hatColour","bootColour"},
       "items":[{"type":"fx"|"creature","id","chapter","x","y","scale","flip","tilt"}] }
   Version 2 (what is made now) packs the same data into bits instead of text, then writes it as Base64:
     byte 0   = 3 (the format, 2 before it; JSON starts with "{", so they are told apart by this)
     byte 1   = a check value over the rest, so a damaged or cut-off code is caught
     then bit fields, no padding between them:
       bg 5 | pose 4 | flip 1 | giraffe x 10 | y 10 | size 8 (x100)
       look: skin 6 | spots 6 | pattern 4 | gear 6 | hat 6 | boots 6 | hat colour 6 | boot colour 6   (hat/boots: 0 none, else ACC_ITEMS index + 1; format 2 used 5 bits for each but pattern)
       item count 5, then per item: kind 1 (0 effect, 1 creature)
         effect:   index in PHOTO_FX 5
         creature: chapter - 1  4 | index in BESTIARY_ORDER 5
         x + 100 (11) | y + 100 (10) | size x50 (8) | flip 1 | tilt as 1/128 of a turn (7)
   Those lists (PHOTO_FX, BESTIARY_ORDER, ACC_ITEMS, the scenes) may only ever be added to at the end, or old codes would change meaning.
   Both versions are read. Her look travels with the photo and is shown as it was shared, even if it is not won on this save.
   Creatures are different: one that has not been discovered in the Bestiary is left out, and a popup says which chapters to finish.
   PHOTO.look holds a shared look (null = her own, live). The album (Save.data.album) keeps up to 48 codes with the time they were saved. */
PHOTO.look = null; PHOTO.code = ''; PHOTO.delAsk = -1;
const PHOTO_ALBUM_MAX = 48;
const PHOTO_THUMBS = {};                                                  /* code -> small canvas, kept for the visit */

function photoLookNow(){
  if (PHOTO.look) return PHOTO.look;
  const o = outfitNow();
  return { s: o.s, p: o.p, t: o.t, g: o.g, hat: o.hat, boot: o.boot, hc: o.hc, bc: o.bc };
}

/* ---- drawing with a shared look, or with any photo's state ---- */
(function(){
  const render = photoRender;
  photoRender = function(cv, ui){
    const L = PHOTO.look;
    if (!L) return render(cv, ui);
    const gc = giraffeColours, gp = giraffePattern, ae = accEquipped, ov = _accOv;
    const cols = wardColoursFor(L.s, L.p);
    giraffeColours = function(){ return cols; };
    giraffePattern = function(){ return L.t; };
    accEquipped = function(kind){ const id = kind === 'boot' ? L.boot : L.hat; return id && ACC_BY_ID[id] && ACC_BY_ID[id].kind === kind ? ACC_BY_ID[id] : null; };
    _accOv = { hat: L.hc && WARD[L.hc] ? WARD[L.hc].c : null, boot: L.bc && WARD[L.bc] ? WARD[L.bc].c : null };
    try { render(cv, ui); }
    finally { giraffeColours = gc; giraffePattern = gp; accEquipped = ae; _accOv = ov; }
  };
})();
const PHOTO_KEYS = ['bg', 'pose', 'flip', 'gx', 'gy', 'gs', 'moved', 'items', 'look', 'sel', 'filter', 'frame', 'tod', 'freeze'];
function photoRenderState(st, cv){                                         /* draw a decoded photo without disturbing the studio */
  const keep = {}; PHOTO_KEYS.forEach(function(k){ keep[k] = PHOTO[k]; });
  PHOTO.bg = st.bg; PHOTO.pose = st.pose; PHOTO.flip = st.flip; PHOTO.gx = st.gx; PHOTO.gy = st.gy; PHOTO.gs = st.gs; PHOTO.moved = true;
  PHOTO.items = st.items; PHOTO.look = st.look; PHOTO.sel = -2; PHOTO.filter = st.filter | 0; PHOTO.frame = st.frame | 0; PHOTO.tod = st.tod === undefined ? -1 : st.tod; PHOTO.freeze = !!st.freeze;
  try { photoRender(cv, false); } finally { PHOTO_KEYS.forEach(function(k){ PHOTO[k] = keep[k]; }); }
}

/* ---- packing ---- */
function BitW(){ this.b = []; this.cur = 0; this.n = 0; }
BitW.prototype.w = function(v, bits){
  v = Math.max(0, Math.min(Math.pow(2, bits) - 1, Math.round(v)));
  for (let i = bits - 1; i >= 0; i--){
    this.cur = (this.cur << 1) | (Math.floor(v / Math.pow(2, i)) & 1);
    if (++this.n === 8){ this.b.push(this.cur); this.cur = 0; this.n = 0; }
  }
};
BitW.prototype.done = function(){ if (this.n){ this.b.push((this.cur << (8 - this.n)) & 255); this.cur = 0; this.n = 0; } return this.b; };
function BitR(bytes, from){ this.b = bytes; this.p = (from || 0) * 8; }
BitR.prototype.r = function(bits){
  if (this.p + bits > this.b.length * 8) throw new Error('short');
  let v = 0;
  for (let i = 0; i < bits; i++, this.p++) v = v * 2 + ((this.b[this.p >> 3] >> (7 - (this.p & 7))) & 1);
  return v;
};
function photoCheck(bytes, from){ let a = 7; for (let i = from; i < bytes.length; i++) a = (a * 31 + bytes[i]) & 255; return a; }
function photoIndexOf(list, id){ for (let i = 0; i < list.length; i++) if (list[i] === id) return i; return -1; }

/* the photo as data (the JSON form) */
function photoData(){
  const L = photoLookNow(), r = function(v){ return Math.round(v * 10) / 10; };
  return {
    v: 1, bg: PHOTO.bg, pose: PHOTO.pose, flip: !!PHOTO.flip,
    grade: { filter: PHOTO.filter | 0, frame: PHOTO.frame | 0, tod: PHOTO.tod === undefined ? -1 : PHOTO.tod, freeze: !!PHOTO.freeze },
    giraffe: { x: r(PHOTO.gx), y: r(PHOTO.gy), s: Math.round(PHOTO.gs * 100) / 100 },
    look: { skin: L.s, spots: L.p, pattern: L.t, gear: L.g, hat: L.hat || '', boots: L.boot || '', hatColour: L.hc | 0, bootColour: L.bc | 0 },
    items: PHOTO.items.map(function(it){
      return { type: it.t === 'foe' ? 'creature' : 'fx', id: it.id, chapter: it.t === 'foe' ? it.ch : 0, x: r(it.x), y: r(it.y),
        scale: Math.round(it.s * 100) / 100, flip: !!it.f, tilt: Math.round((it.r || 0) * 100) / 100 };
    })
  };
}
const photoB64 = function(bytes){ let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s); };
function photoJsonCode(data){ return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }          /* what version 1 made */
function photoPack(d){
  const w = new BitW(), lk = d.look || {}, gi = d.giraffe || {};
  const accIdx = function(id){ const i = id ? photoIndexOf(ACC_ITEMS.map(function(a){ return a.id; }), id) : -1; return i < 0 ? 0 : i + 1; };
  w.w(d.bg, 5); w.w(d.pose, 4); w.w(d.flip ? 1 : 0, 1);
  w.w(gi.x, 10); w.w(gi.y, 10); w.w(gi.s * 100, 8);
  w.w(lk.skin, 6); w.w(lk.spots, 6); w.w(lk.pattern, 4); w.w(lk.gear, 6);
  w.w(accIdx(lk.hat), 6); w.w(accIdx(lk.boots), 6); w.w(lk.hatColour, 6); w.w(lk.bootColour, 6);
  const items = (d.items || []).slice(0, PHOTO_MAX);
  w.w(items.length, 5);
  const fxIds = PHOTO_FX.map(function(f){ return f[0]; });
  items.forEach(function(it){
    const foe = it.type === 'creature';
    w.w(foe ? 1 : 0, 1);
    if (foe){ w.w(it.chapter - 1, 4); w.w(photoIndexOf(BESTIARY_ORDER, it.id), 5); }
    else w.w(photoIndexOf(fxIds, it.id), 6);
    w.w(it.x + 100, 11); w.w(it.y + 100, 10); w.w(it.scale * 50, 8); w.w(it.flip ? 1 : 0, 1);
    w.w((((it.tilt % TAU) + TAU) % TAU) / TAU * 128, 7);
  });
  const gr = d.grade || {}, ext = (gr.filter | 0) || (gr.frame | 0) || (gr.tod >= 0) || gr.freeze, ver = ext ? 5 : 4;                /* version 5 only when a filter, frame, time of day or freeze is used: every older photo keeps its old code */
  if (ext){ w.w(gr.filter | 0, 3); w.w(gr.frame | 0, 4); w.w(gr.tod >= 0 ? Math.min(47, gr.tod) : 63, 6); w.w(gr.freeze ? 1 : 0, 1); }
  const body = w.done();
  return [ver, photoCheck(body, 0)].concat(body);
}
function photoUnpack(bytes){
  if (bytes.length < 4 || photoCheck(bytes, 2) !== bytes[1]) throw new Error('damaged');
  const r = new BitR(bytes, 2), d = { v: 1 };
  d.bg = r.r(5); d.pose = r.r(4); d.flip = !!r.r(1);
  d.giraffe = { x: r.r(10), y: r.r(10), s: r.r(8) / 100 };
  const cb = bytes[0] >= 3 ? 6 : 5;                                          /* version 2 used 5 bits for colours and accessories, version 3 uses 6 */
  const sk = r.r(cb), sp = r.r(cb), pa = r.r(4), ge = r.r(cb), ha = r.r(cb), bo = r.r(cb), hc = r.r(cb), bc = r.r(cb);
  d.look = { skin: sk, spots: sp, pattern: pa, gear: ge, hat: ha ? (ACC_ITEMS[ha - 1] || {}).id || '' : '', boots: bo ? (ACC_ITEMS[bo - 1] || {}).id || '' : '', hatColour: hc, bootColour: bc };
  const n = r.r(5); d.items = [];
  for (let i = 0; i < n; i++){
    const foe = r.r(1) === 1; let id, ch = 0;
    if (foe){ ch = r.r(4) + 1; id = BESTIARY_ORDER[r.r(5)]; } else id = (PHOTO_FX[r.r(bytes[0] >= 4 ? 6 : 5)] || [''])[0];
    const x = r.r(11) - 100, y = r.r(10) - 100, s = r.r(8) / 50, f = !!r.r(1), t = r.r(7) / 128 * TAU;
    d.items.push({ type: foe ? 'creature' : 'fx', id: id, chapter: ch, x: x, y: y, scale: s, flip: f, tilt: t });
  }
  if (bytes[0] >= 5){ const fl = r.r(3), fr = r.r(4), td = r.r(6), fz = r.r(1); d.grade = { filter: fl, frame: fr, tod: td === 63 ? -1 : td, freeze: !!fz }; }
  return d;
}
function photoToCode(){ return photoB64(photoPack(photoData())); }

/* returns { ok:true, state, left:[creatures she cannot use] } or { ok:false, why } */
function photoFromCode(text){
  let data;
  try {
    let s = String(text || '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!s) return { ok: false, why: 'Paste a photo code first.' };
    while (s.length % 4) s += '=';
    const bin = atob(s), bytes = [];
    for (let i = 0; i < bin.length; i++) bytes.push(bin.charCodeAt(i));
    data = (bytes[0] >= 2 && bytes[0] <= 5) ? photoUnpack(bytes) : JSON.parse(decodeURIComponent(escape(bin)));
  } catch (e) { return { ok: false, why: 'That does not look like a photo code. Check that the whole code was copied.' }; }
  if (!data || typeof data !== 'object' || data.v !== 1) return { ok: false, why: 'This photo code is from a different version of the game.' };
  const num = function(v, lo, hi, d){ v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  const int = function(v, lo, hi){ v = Math.round(+v); return isFinite(v) && v >= lo && v <= hi ? v : 0; };
  const st = { items: [], left: [] }, gi = data.giraffe || {}, lk = data.look || {};
  st.bg = int(data.bg, 0, PHOTO_BG.length - 1);
  st.pose = int(data.pose, 0, PHOTO_POSE.length - 1);
  st.flip = !!data.flip;
  { const g = data.grade || {}; st.filter = int(g.filter, 0, 4); st.frame = int(g.frame, 0, 7); st.tod = isFinite(+g.tod) && +g.tod >= 0 ? Math.min(47, Math.round(+g.tod)) : -1; st.freeze = !!g.freeze; }
  st.gx = num(gi.x, 0, 960, 480); st.gy = num(gi.y, 140, 540, 453.6); st.gs = num(gi.s, 0.5, 1.7, 1);
  const hat = typeof lk.hat === 'string' && ACC_BY_ID[lk.hat] && ACC_BY_ID[lk.hat].kind === 'hat' ? lk.hat : '';
  const boot = typeof lk.boots === 'string' && ACC_BY_ID[lk.boots] && ACC_BY_ID[lk.boots].kind === 'boot' ? lk.boots : '';
  st.look = { s: int(lk.skin, 0, WARD_MAX), p: int(lk.spots, 0, WARD_MAX), t: int(lk.pattern, 0, 13), g: int(lk.gear, 0, WARD_MAX), hat: hat, boot: boot,
    hc: int(lk.hatColour, 0, WARD_MAX), bc: int(lk.bootColour, 0, WARD_MAX) };
  const list = Array.isArray(data.items) ? data.items.slice(0, PHOTO_MAX) : [];
  list.forEach(function(o){
    if (!o || typeof o !== 'object') return;
    const base = { x: num(o.x, -100, 1060, 480), y: num(o.y, -100, 640, 270), s: num(o.scale, 0.2, 4, 1), f: !!o.flip, r: num(o.tilt, -7, 7, 0) };
    if (o.type === 'fx'){
      if (typeof o.id === 'string' && PHOTO_FXDRAW[o.id]) st.items.push({ t: 'fx', id: o.id, ch: 0, x: base.x, y: base.y, s: base.s, f: base.f, r: base.r });
    } else if (o.type === 'creature'){
      const ch = int(o.chapter, 1, BESTIARY_CHAPTERS.length), tab = ch ? bestiaryTable(ch) : null;
      if (!ch || typeof o.id !== 'string' || !tab || !tab[o.id] || BESTIARY_ORDER.indexOf(o.id) < 0) return;
      if (photoFoeUnlocked(ch, o.id)) st.items.push({ t: 'foe', id: o.id, ch: ch, x: base.x, y: base.y, s: base.s, f: base.f, r: base.r });
      else st.left.push({ ch: ch, id: o.id });
    }
  });
  return { ok: true, state: st, left: st.left, data: data };
}
/* how much shorter the packed code is than the plain JSON one */
function photoSizeNote(code, data){
  const j = photoJsonCode(data).length, n = code.length, pct = Math.round((1 - n / j) * 100);
  return 'Code length: ' + n + ' characters. The plain JSON form of this photo would be ' + j + ' (' + pct + '% shorter, ' + (j / n).toFixed(1) + ' times smaller).';
}

/* ---- the popup for creatures she cannot use yet ---- */
function photoPopup(html){
  let d = document.getElementById('photoPop');
  if (d) d.remove();
  d = document.createElement('div'); d.id = 'photoPop';
  d.innerHTML = '<div class="photopop-card">' + html + '<div style="margin-top:12px;text-align:center"><button class="btn sm" data-pp="ok">OK</button></div></div>';
  ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ d.addEventListener(ev, function(e){ e.stopPropagation(); }); });
  d.addEventListener('click', function(e){ e.stopPropagation(); if (e.target.closest && e.target.closest('[data-pp="ok"]') || e.target === d) d.remove(); });
  document.body.appendChild(d);
}
function photoLockedPopup(left){
  const byCh = {}; left.forEach(function(c){ byCh[c.ch] = (byCh[c.ch] | 0) + 1; });
  const chs = Object.keys(byCh).map(Number).sort(function(a, b){ return a - b; });
  const unfinished = chs.filter(function(ch){ return !(Save.data && Save.data['chapter' + ch + 'Complete']); });
  const finished = chs.filter(function(ch){ return unfinished.indexOf(ch) < 0; });
  const nm = function(ch){ return 'Chapter ' + ch + ' (' + BESTIARY_CHAPTERS[ch - 1] + ')'; };
  let h = '<h3 style="margin:0 0 6px">Some creatures are still locked</h3>' +
    '<p style="margin:0 0 6px">This photo has ' + left.length + ' creature' + (left.length === 1 ? '' : 's') + ' you have not discovered yet, so ' + (left.length === 1 ? 'it was' : 'they were') + ' left out.</p>';
  if (unfinished.length) h += '<p style="margin:0 0 6px">To use ' + (left.length === 1 ? 'it' : 'them') + ', finish <b>' + unfinished.length + ' more chapter' + (unfinished.length === 1 ? '' : 's') + '</b> and defeat the creatures there: ' + unfinished.map(nm).join(', ') + '.</p>';
  if (finished.length) h += '<p style="margin:0 0 6px">' + (unfinished.length ? 'And defeat' : 'You have finished the chapter, so just defeat') + ' the missing creatures in ' + finished.map(nm).join(', ') + ' during a run.</p>';
  h += '<p style="margin:0;opacity:.8;font-size:13px">Her colours, hat and boots from the photo are shown as they were shared.</p>';
  photoPopup(h);
}

/* ---- the album ---- */
function photoAlbum(){
  if (!Array.isArray(Save.data.album)) Save.data.album = [];
  const a = Save.data.album;
  for (let i = a.length - 1; i >= 0; i--) if (!a[i] || typeof a[i].c !== 'string') a.splice(i, 1);
  if (a.length > PHOTO_ALBUM_MAX) a.length = PHOTO_ALBUM_MAX;
  return a;
}
function photoAlbumHTML(){
  const a = photoAlbum();
  let packed = 0, plain = 0;
  a.forEach(function(e){ const r = photoFromCode(e.c); packed += e.c.length; if (r.ok) plain += photoJsonCode(r.data).length; });
  let h = '<div class="sub" style="margin:2px 0 6px">' + a.length + ' of ' + PHOTO_ALBUM_MAX + ' photos saved. ' +
    '<button class="pchip" data-a="ward-photo-albsave"' + (a.length >= PHOTO_ALBUM_MAX ? ' disabled' : '') + '>Save this photo to the album</button></div>';
  if (a.length) h += '<div class="sub" style="margin:0 0 6px;font-size:12px">The album keeps ' + packed + ' characters of data. As plain JSON it would be ' + plain + ' (' + Math.round((1 - packed / Math.max(1, plain)) * 100) + '% shorter).</div>';
  else h += '<div class="sub">Nothing here yet. Set up a photo and press the button above to keep it.</div>';
  h += '<div class="albgrid">';
  a.forEach(function(e, i){
    const when = new Date(e.t || 0).toLocaleDateString();
    h += '<div class="alb"><canvas width="160" height="90" data-alb="' + i + '"></canvas><div class="albwhen">' + (e.t ? when : '') + '</div>' +
      (PHOTO.delAsk === i
        ? '<div class="albbtn"><button class="pchip" data-a="ward-photo-albdelyes-' + i + '">Delete it</button><button class="pchip" data-a="ward-photo-albkeep">Keep</button></div>'
        : '<div class="albbtn"><button class="pchip" data-a="ward-photo-albopen-' + i + '">Open</button><button class="pchip" data-a="ward-photo-albdel-' + i + '">Delete</button></div>') + '</div>';
  });
  return h + '</div>';
}
function photoAlbumPaint(){
  const cvs = Array.prototype.slice.call(document.querySelectorAll('canvas[data-alb]')), a = photoAlbum();
  let k = 0;
  const step = function(){
    for (let n = 0; n < 3 && k < cvs.length; n++, k++){
      const cv = cvs[k]; if (!cv.isConnected) return;
      const e = a[+cv.getAttribute('data-alb')]; if (!e) continue;
      let th = PHOTO_THUMBS[e.c];
      if (!th){
        const r = photoFromCode(e.c); if (!r.ok) continue;
        const big = document.createElement('canvas'); big.width = 960; big.height = 540;
        try { photoRenderState(r.state, big); } catch (err) { continue; }
        th = document.createElement('canvas'); th.width = 160; th.height = 90; th.getContext('2d').drawImage(big, 0, 0, 160, 90);
        PHOTO_THUMBS[e.c] = th;
      }
      cv.getContext('2d').drawImage(th, 0, 0);
    }
    if (k < cvs.length) setTimeout(step, 0);
  };
  step();
}
function photoApply(res, srcText){
  const s = res.state;
  PHOTO.bg = s.bg; PHOTO.pose = s.pose; PHOTO.flip = s.flip; PHOTO.gx = s.gx; PHOTO.gy = s.gy; PHOTO.gs = s.gs; PHOTO.moved = true;
  PHOTO.items = s.items; PHOTO.sel = -2; PHOTO.look = s.look; PHOTO.code = srcText; PHOTO.filter = s.filter | 0; PHOTO.frame = s.frame | 0; PHOTO.tod = s.tod === undefined ? -1 : s.tod; PHOTO.freeze = !!s.freeze;
}

/* ---- the buttons on the photo screen ---- */
(function(){
  const show = showPhoto;
  showPhoto = function(){
    show();
    const msg = document.getElementById('photoMsg'); if (!msg) return;
    msg.insertAdjacentHTML('beforebegin',
      '<div class="photoshare">' +
        '<div class="sub" style="margin:0 0 4px">Share: press <b>Get code</b> and send the code to a friend, or paste a friend’s code below and press <b>Open</b>. They can move everything and share it again.</div>' +
        '<textarea id="photoCode" rows="2" spellcheck="false" placeholder="Photo code" aria-label="Photo code"></textarea>' +
        '<div class="sub" id="photoStats" style="margin:2px 0;font-size:12px;min-height:16px"></div>' +
        '<div class="pchips"><button class="pchip" data-a="ward-photo-getcode">Get code</button><button class="pchip" data-a="ward-photo-opencode">Open</button>' +
          (PHOTO.look ? '<button class="pchip" data-a="ward-photo-ownlook">Use my own colours and outfit</button>' : '') + '</div>' +
        (PHOTO.look ? '<div class="sub" style="margin:2px 0;font-size:12px">Showing the outfit from the shared photo.</div>' : '') +
      '</div>');
    const ta = document.getElementById('photoCode');
    if (ta){ ta.value = PHOTO.code || ''; ta.addEventListener('input', function(){ PHOTO.code = ta.value; }); ['keydown', 'keyup'].forEach(function(ev){ ta.addEventListener(ev, function(e){ e.stopPropagation(); }); }); }
    if (PHOTO.tab === 'album') photoAlbumPaint();
  };
  const prev = handleExtraAction;
  handleExtraAction = function(a){
    if (a === 'ward-photo-getcode'){
      const data = photoData(), code = photoB64(photoPack(data)); PHOTO.code = code;
      const ta = document.getElementById('photoCode'); if (ta){ ta.value = code; ta.focus(); ta.select(); }
      const st = document.getElementById('photoStats'); if (st) st.textContent = photoSizeNote(code, data);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function(){ photoMsg('Code copied. Send it to a friend.'); }, function(){ photoMsg('The code is in the box. Select it and copy it.'); });
        else photoMsg('The code is in the box. Select it and copy it.');
      } catch (e) { photoMsg('The code is in the box. Select it and copy it.'); }
      SFX.click(); return true;
    }
    if (a === 'ward-photo-opencode'){
      const ta = document.getElementById('photoCode'), src = ta ? ta.value : PHOTO.code, res = photoFromCode(src);
      if (!res.ok){ SFX.deny(); photoMsg(res.why); return true; }
      photoApply(res, src); SFX.pick(); showPhoto();
      const st = document.getElementById('photoStats'); if (st) st.textContent = photoSizeNote(src.replace(/\s+/g, ''), res.data);
      if (res.left.length) photoLockedPopup(res.left);
      else photoMsg('Photo opened. Move anything you like, then share your version.');
      return true;
    }
    if (a === 'ward-photo-ownlook'){ PHOTO.look = null; SFX.click(); showPhoto(); return true; }
    if (a === 'ward-photo-albsave'){
      const al = photoAlbum();
      if (al.length >= PHOTO_ALBUM_MAX){ SFX.deny(); photoMsg('The album is full (' + PHOTO_ALBUM_MAX + '). Delete a photo to make room.'); return true; }
      al.push({ c: photoToCode(), t: Date.now() }); Save.write(); SFX.buy(); PHOTO.tab = 'album'; PHOTO.delAsk = -1; showPhoto();
      photoMsg('Saved to the album (' + al.length + ' of ' + PHOTO_ALBUM_MAX + ').');
      return true;
    }
    let m = /^ward-photo-albopen-(\d+)$/.exec(a);
    if (m){
      const e = photoAlbum()[+m[1]], res = e ? photoFromCode(e.c) : null;
      if (!res || !res.ok){ SFX.deny(); photoMsg('That photo could not be opened.'); return true; }
      photoApply(res, e.c); PHOTO.tab = 'scene'; SFX.pick(); showPhoto();
      if (res.left.length) photoLockedPopup(res.left); else photoMsg('Opened from the album.');
      return true;
    }
    m = /^ward-photo-albdel-(\d+)$/.exec(a);
    if (m){ PHOTO.delAsk = +m[1]; SFX.click(); showPhoto(); return true; }
    if (a === 'ward-photo-albkeep'){ PHOTO.delAsk = -1; SFX.click(); showPhoto(); return true; }
    m = /^ward-photo-albdelyes-(\d+)$/.exec(a);
    if (m){ const al = photoAlbum(); al.splice(+m[1], 1); Save.write(); PHOTO.delAsk = -1; SFX.click(); showPhoto(); photoMsg('Deleted.'); return true; }
    return prev(a);
  };
})();
