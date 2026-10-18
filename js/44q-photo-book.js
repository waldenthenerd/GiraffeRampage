'use strict';
/* The photo album as a book: a red cover with patches and "My Adventures" in black marker; open it and the photos are taped onto pages
   that can be flipped. Clicking a photo opens it in the studio for editing. */
/* ========================= 44q. THE ALBUM BOOK ========================= */
/* Everything is HTML and CSS (see the .book rules in polish.css); the photos are small canvases painted from the saved codes in
   Save.data.album (44p-photo-share.js). Four photos to a page, eight to a spread, six spreads for the full 48. BOOK.open is whether
   the cover is open, BOOK.s the spread on show. A page turn is a "leaf" laid over half the book that rotates in 3D: the leaf's front
   is the page being turned away, its back is the page arriving, and under it the book already shows the new far page. */
const BOOK = { open: false, s: 0, busy: false };
const BOOK_TH = {};                                                        /* code -> 320 x 180 canvas, kept for the visit */
const BOOK_PER_PAGE = 4;

function bookSpreads(){ return Math.max(1, Math.ceil(photoAlbum().length / (BOOK_PER_PAGE * 2))); }
function bookPageHTML(s, side){
  const a = photoAlbum();
  let h = '';
  for (let k = 0; k < BOOK_PER_PAGE; k++){
    const idx = s * BOOK_PER_PAGE * 2 + side * BOOK_PER_PAGE + k, e = a[idx];
    const rot = ((idx * 37 + 11) % 9) - 4, t1 = ((idx * 13) % 7) - 3, t2 = ((idx * 29) % 7) - 3;
    if (e) h += '<button class="polaroid" style="--r:' + rot + 'deg" data-a="ward-photo-albopen-' + idx + '" title="Open this photo to edit it">' +
      '<canvas width="320" height="180" data-bk="' + idx + '"></canvas>' +
      '<i class="tape tl" style="--t:' + (-32 + t1) + 'deg"></i><i class="tape tr" style="--t:' + (30 + t2) + 'deg"></i></button>';
    else h += '<div class="slot"><span>' + (idx + 1) + '</span></div>';
  }
  return h + '<span class="pgno">' + (s * 2 + side + 1) + '</span>';
}
function bookCoverHTML(){
  return '<div class="cover">' +
    '<div class="cstitch"></div>' +
    '<svg class="patch p1" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="#F2C230"/><circle cx="40" cy="40" r="33" fill="none" stroke="#FFF6D0" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<g fill="#8A5A24"><ellipse cx="28" cy="30" rx="8" ry="6"/><ellipse cx="50" cy="26" rx="6" ry="5"/><ellipse cx="46" cy="48" rx="9" ry="7"/><ellipse cx="26" cy="52" rx="6" ry="5"/><ellipse cx="58" cy="44" rx="4" ry="3.4"/></g></svg>' +
    '<svg class="patch p2" viewBox="0 0 80 80"><rect x="4" y="4" width="72" height="72" rx="10" fill="#2F5FBF"/><rect x="8" y="8" width="64" height="64" rx="7" fill="none" stroke="#DCE8FF" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<polygon points="40,14 47,32 66,33 51,45 56,64 40,53 24,64 29,45 14,33 33,32" fill="#FFE27A"/></svg>' +
    '<svg class="patch p3" viewBox="0 0 80 80"><path d="M40 70 C8 46 10 14 30 14 C36 14 40 18 40 22 C40 18 44 14 50 14 C70 14 72 46 40 70Z" fill="#3FA860"/>' +
      '<path d="M40 63 C14 44 16 20 30 20 C35 20 40 24 40 28 C40 24 45 20 50 20 C64 20 66 44 40 63Z" fill="none" stroke="#DFFFE0" stroke-width="2" stroke-dasharray="5 4"/></svg>' +
    '<svg class="patch p4" viewBox="0 0 90 70"><path d="M6 6 L84 35 L6 64Z" fill="#E8572A"/><path d="M14 17 L68 35 L14 53Z" fill="none" stroke="#FFE3D0" stroke-width="2" stroke-dasharray="5 4"/></svg>' +
    '<svg class="patch p5" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="#F4F0E6"/><circle cx="40" cy="40" r="30" fill="none" stroke="#B8B0A0" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<g fill="#6A4426"><ellipse cx="40" cy="48" rx="13" ry="10"/><circle cx="24" cy="34" r="6"/><circle cx="36" cy="25" r="6"/><circle cx="48" cy="25" r="6"/><circle cx="58" cy="34" r="6"/></g></svg>' +
    '<div class="clabel"><span>My Adventures</span><i class="tape tl" style="--t:-34deg"></i><i class="tape tr" style="--t:28deg"></i></div>' +
  '</div>';
}
function bookHTML(mode, s, flipDir){
  /* mode 'closed' | 'open' | 'opening' | 'closing' | 'next' | 'prev' */
  const L = function(i){ return '<div class="bpage bl">' + bookPageHTML(i, 0) + '</div>'; };
  const Rr = function(i){ return '<div class="bpage br">' + bookPageHTML(i, 1) + '</div>'; };
  let inner = '', cls = 'bookwrap';
  if (mode === 'open') inner = L(s) + Rr(s) + '<div class="bspine"></div>';
  else if (mode === 'closed'){
    cls += ' closed';
    inner = Rr(0) + '<div class="leaf cov"><div class="face front">' + bookCoverHTML() + '</div><div class="face back"><div class="bpage inl">' + bookPageHTML(0, 0) + '</div></div></div>';
  } else if (mode === 'opening' || mode === 'closing'){
    cls += mode === 'opening' ? ' closed' : '';
    inner = '<div class="bpage bl under"></div>' + Rr(0) + '<div class="bspine"></div>' +
      '<div class="leaf cov"><div class="face front">' + bookCoverHTML() + '</div><div class="face back"><div class="bpage inl">' + bookPageHTML(0, 0) + '</div></div></div>';
  } else if (mode === 'next'){
    inner = L(s) + Rr(s + 1) + '<div class="bspine"></div>' +
      '<div class="leaf right"><div class="face front"><div class="bpage plain">' + bookPageHTML(s, 1) + '</div></div><div class="face back"><div class="bpage plain">' + bookPageHTML(s + 1, 0) + '</div></div></div>';
  } else if (mode === 'prev'){
    inner = L(s - 1) + Rr(s) + '<div class="bspine"></div>' +
      '<div class="leaf left"><div class="face front"><div class="bpage plain">' + bookPageHTML(s, 0) + '</div></div><div class="face back"><div class="bpage plain">' + bookPageHTML(s - 1, 1) + '</div></div></div>';
  }
  return '<div class="' + cls + '" id="bookwrap"><div class="book">' + inner + '</div></div>';
}
function bookControls(){
  const n = bookSpreads();
  if (!BOOK.open) return '<button class="btn sm" data-a="ward-book-open">Open the album</button><button class="btn sm ghost" data-a="ward-book-back">Back to the photo studio</button>';
  return '<button class="btn sm ghost" data-a="ward-book-prev"' + (BOOK.busy ? ' disabled' : '') + '>' + (BOOK.s === 0 ? 'Close the book' : 'Previous page') + '</button>' +
    '<span class="sub" style="margin:0 6px">Pages ' + (BOOK.s * 2 + 1) + ' and ' + (BOOK.s * 2 + 2) + ' of ' + n * 2 + '</span>' +
    '<button class="btn sm" data-a="ward-book-next"' + (BOOK.busy || BOOK.s >= n - 1 ? ' disabled' : '') + '>Next page</button>' +
    '<button class="btn sm ghost" data-a="ward-book-back">Back to the photo studio</button>';
}
function bookPaint(){
  const cvs = Array.prototype.slice.call(document.querySelectorAll('canvas[data-bk]')), a = photoAlbum();
  let k = 0;
  const step = function(){
    for (let n = 0; n < 4 && k < cvs.length; n++, k++){
      const cv = cvs[k]; if (!cv.isConnected) continue;
      const e = a[+cv.getAttribute('data-bk')]; if (!e) continue;
      let th = BOOK_TH[e.c];
      if (!th){
        const r = photoFromCode(e.c); if (!r.ok) continue;
        const big = document.createElement('canvas'); big.width = 960; big.height = 540;
        try { photoRenderState(r.state, big); } catch (err) { continue; }
        th = document.createElement('canvas'); th.width = 320; th.height = 180; th.getContext('2d').drawImage(big, 0, 0, 320, 180);
        BOOK_TH[e.c] = th;
      }
      cv.getContext('2d').drawImage(th, 0, 0);
    }
    if (k < cvs.length) setTimeout(step, 0);
  };
  step();
}
function bookRender(mode, s, controlsAfter){
  const holder = document.getElementById('bookhold'); if (!holder) return null;
  holder.innerHTML = bookHTML(mode, s);
  const c = document.getElementById('bookctl'); if (c) c.innerHTML = bookControls();
  bookPaint();
  return document.getElementById('bookwrap');
}
function showBook(){
  G.state = 'help'; G.attract = true; G.subScreen = 'photobook';
  BOOK.busy = false;
  const n = photoAlbum().length;
  setOverlay(
    '<div class="panel slab wide" style="max-width:980px">' +
      '<h2 class="head">Photo album</h2>' +
      '<p class="sub" style="margin:0 0 4px">' + n + ' of ' + PHOTO_ALBUM_MAX + ' photos. ' + (BOOK.open ? 'Click a photo to open it and edit it.' : 'Open the book to look through your photos.') + '</p>' +
      '<div id="bookhold"></div>' +
      '<div class="row" id="bookctl" style="margin-top:10px"></div>' +
    '</div>');
  bookRender(BOOK.open ? 'open' : 'closed', BOOK.s);
}
/* run a turn: lay out the starting frame, let the browser draw it, then switch on the animation, and settle on the end state */
function bookAnimate(mode, s, endFn){
  BOOK.busy = true;
  const wrap = bookRender(mode, s);
  const c = document.getElementById('bookctl'); if (c) c.innerHTML = bookControls();
  const leaf = wrap && wrap.querySelector('.leaf');
  if (!leaf){ BOOK.busy = false; endFn(); return; }
  if (mode === 'closing') leaf.classList.add('turned');                      /* starts open, folds shut */
  setTimeout(function(){
    if (mode === 'closing'){ leaf.classList.remove('turned'); wrap.classList.add('closed'); }
    else { leaf.classList.add('turned'); wrap.classList.remove('closed'); }
  }, 40);
  setTimeout(function(){ BOOK.busy = false; endFn(); }, 820);
}
(function(){
  const prev = handleExtraAction;
  handleExtraAction = function(a){
    if (a === 'ward-album'){ SFX.click(); showBook(); return true; }
    if (a === 'ward-book-back'){ SFX.click(); showPhoto(); return true; }
    if (a === 'ward-book-open' && !BOOK.open && !BOOK.busy){
      SFX.click(); bookAnimate('opening', 0, function(){ BOOK.open = true; BOOK.s = 0; if (G.subScreen === 'photobook') showBook(); });
      return true;
    }
    if (a === 'ward-book-next' && BOOK.open && !BOOK.busy){
      if (BOOK.s >= bookSpreads() - 1){ SFX.deny(); return true; }
      SFX.click(); bookAnimate('next', BOOK.s, function(){ BOOK.s++; if (G.subScreen === 'photobook') showBook(); });
      return true;
    }
    if (a === 'ward-book-prev' && BOOK.open && !BOOK.busy){
      SFX.click();
      if (BOOK.s === 0) bookAnimate('closing', 0, function(){ BOOK.open = false; if (G.subScreen === 'photobook') showBook(); });
      else bookAnimate('prev', BOOK.s, function(){ BOOK.s--; if (G.subScreen === 'photobook') showBook(); });
      return true;
    }
    if (a === 'ward-book-open' || a === 'ward-book-next' || a === 'ward-book-prev') return true;      /* a turn is under way */
    return prev(a);
  };
})();
