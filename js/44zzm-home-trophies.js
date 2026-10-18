'use strict';
/* =============================================================================================================================
   44zzm-home-trophies.js  --  HER HOME SHOWS WHAT SHE HAS DONE. Three new displays on the walls of her home, each painted into the cached
   room (homePaintBase wrapper) and refreshed when what they show changes (the room's signature wrapper):
     DIPLOMAS    a framed one for every degree from the university (Bachelor, Master, Doctorate per faculty, in the faculty's colour; a
                 Doctorate has a gold seal), up to eight frames in two rows over the sofa side of the room
     BOOKSHELF   a shelf of spines, one for each book she has read in the library (in the book's own colour), up to 24, with a stack of
                 notebooks once she has written facts down
     TROPHIES    a cabinet with a cup for every gym rank she has reached (bronze up to gold), and a mounted fish, a crab and a shell for what
                 she has caught at sea
   Nothing here is a choice she has to make; it fills in by itself.
   ============================================================================================================================= */
(function(){
  const safe = function(f, d){ try { return f(); } catch (e) { return d; } };
  const degrees = function(){ return typeof UNI_FAC === 'undefined' ? [] : safe(function(){ const u = uniData(), out = []; UNI_FAC.forEach(function(F){ for (let i = 1; i <= (u.deg[F.id] | 0); i++) out.push({ f: F, step: i }); }); return out; }, []); };
  const booksRead = function(){ return typeof UNI_BOOKS === 'undefined' ? [] : safe(function(){ const u = uniData(); return UNI_BOOKS.filter(function(b){ return (u.read[b.id] | 0) > 0; }); }, []); };
  const gymTier = function(){ return typeof GYM_RANKS === 'undefined' ? 0 : safe(gymRankIndex, 0); };
  const seaBits = function(){ return safe(function(){ const t = townData(), s = (t.sea || {}); return { fish: Object.keys(fishLog()).length, crab: (s.crab | 0) > 0 || (t.n && (t.n.crabs | 0) > 0), shell: !!(t.n && (t.n.shells | 0) > 0) }; }, { fish: 0, crab: false, shell: false }); };
  window.homeTrophySig = function(){ const s = seaBits(); return 'd' + degrees().length + 'b' + booksRead().length + 'g' + gymTier() + 'f' + (s.fish ? 1 : 0) + (s.crab ? 1 : 0) + (s.shell ? 1 : 0) + 'n' + (typeof uniData === 'function' ? Object.keys(uniData().facts).length > 0 ? 1 : 0 : 0); };

  function frame(c, x, y, w, h, F, step){
    tRect(c, 'rgba(0,0,0,.25)', x + 2, y + 3, w, h); tRect(c, '#4A3220', x - 3, y - 3, w + 6, h + 6); tRect(c, '#E8C060', x - 1, y - 1, w + 2, h + 2); tRect(c, '#F6EEDA', x + 1, y + 1, w - 2, h - 2);
    tRect(c, F.col, x + 5, y + 6, w - 10, 7); ivText(c, ['', 'B', 'M', 'D'][step], x + w / 2, y + 12, 7, '#FFF');
    for (let k = 0; k < 3; k++) tRect(c, '#9A8F76', x + 6, y + 19 + k * 4.5, w - 12 - (k % 2) * 8, 1.4);
    if (step === 3){ tCircle(c, '#E8B830', x + w - 11, y + h - 9, 6); tPoly(c, '#B8342A', [x + w - 14, y + h - 5, x + w - 8, y + h - 5, x + w - 9, y + h + 1, x + w - 13, y + h + 1]); tCircle(c, '#FFE9A0', x + w - 11, y + h - 9, 3); }
    else tCircle(c, '#B8342A', x + w - 10, y + h - 9, 3.4);
    ivLine(c, '#2A2A30', 1.2, x + w / 2, y - 14, x + 6, y - 3); ivLine(c, '#2A2A30', 1.2, x + w / 2, y - 14, x + w - 6, y - 3);
  }
  function paintDiplomas(c){
    const d = degrees(); if (!d.length) return;
    d.slice(0, 8).forEach(function(q, i){ const col = i % 3, row = Math.floor(i / 3); frame(c, 742 + col * 50, 116 + row * 74, 40, 52, q.f, q.step); });
    if (d.length > 8) ivText(c, '+' + (d.length - 8), 872, 300, 12, '#5A3A1E');
  }
  function paintBooks(c){
    const b = booksRead(), nb = typeof uniData === 'function' ? safe(function(){ return Object.keys(uniData().facts).length; }, 0) : 0; if (!b.length && !nb) return;
    const SY = 312;
    tRect(c, '#5A3B22', 462, SY, 150, 7); tRect(c, '#3E2A18', 470, SY + 7, 6, 9); tRect(c, '#3E2A18', 598, SY + 7, 6, 9); tRect(c, 'rgba(255,255,255,.18)', 462, SY, 150, 1.5);
    let x = 468; const r = miniRng(91);
    b.slice(0, 24).forEach(function(bk, i){ const w = 5 + Math.floor(r() * 4), h = 22 + Math.floor(r() * 12); if (x + w > 584) return; tRect(c, bk.col, x, SY - h, w, h); tRect(c, 'rgba(255,255,255,.28)', x + 1, SY - h, 1.4, h); tRect(c, '#E8C060', x, SY - h * 0.55, w, 1.4); x += w + 1; });
    if (nb){ tRect(c, '#7A2438', 588, SY - 12, 22, 12); tRect(c, '#F4F1E8', 590, SY - 10, 18, 8); tRect(c, '#2F5F94', 588, SY - 20, 20, 8); }
  }
  function cup(c, x, y, col, big){
    const s = big ? 1.2 : 1;
    tRect(c, '#4A3220', x - 8 * s, y - 5, 16 * s, 5); tRect(c, col, x - 2 * s, y - 14, 4 * s, 9); tPoly(c, col, [x - 9 * s, y - 28, x + 9 * s, y - 28, x + 6 * s, y - 14, x - 6 * s, y - 14]);
    ivLine(c, col, 1.6, x - 9 * s, y - 25, x - 13 * s, y - 20); ivLine(c, col, 1.6, x + 9 * s, y - 25, x + 13 * s, y - 20); tRect(c, 'rgba(255,255,255,.4)', x - 5 * s, y - 26, 2, 10);
  }
  function paintTrophies(c){
    const t = gymTier(), s = seaBits(); if (!t && !s.fish && !s.crab && !s.shell) return;
    const X0 = 1128, Y = 84;                                                                                            /* a small cabinet high on the wall by the bed */
    tRect(c, '#5A3B22', X0, Y, 120, 66); tRect(c, '#CFE4F0', X0 + 4, Y + 4, 112, 58); tRect(c, 'rgba(255,255,255,.3)', X0 + 7, Y + 5, 14, 56); tRect(c, '#7A5230', X0 + 4, Y + 34, 112, 4);
    const cols = ['#CD8A4A', '#C9CDD9', '#E8C84A', '#4DB8FF', '#E85DFF'];
    for (let i = 0; i < Math.min(t, 5); i++){ const col = i % 3, row = i < 3 ? 0 : 1; cup(c, X0 + 24 + col * 36, row ? Y + 62 : Y + 34, cols[i], i >= 3); }
    if (s.fish){ tEll(c, '#6AA8C8', X0 + 100, Y + 18, 10, 5); tPoly(c, '#6AA8C8', [X0 + 108, Y + 18, X0 + 115, Y + 12, X0 + 115, Y + 24]); tCircle(c, '#111', X0 + 94, Y + 17, 1); }
    if (s.crab){ tEll(c, '#D5543A', X0 + 100, Y + 54, 9, 5); tCircle(c, '#D5543A', X0 + 90, Y + 49, 3); tCircle(c, '#D5543A', X0 + 110, Y + 49, 3); }
    if (s.shell){ tCircle(c, '#F2D2B0', X0 + 80, Y + 54, 6); }
    tRect(c, '#2B3A5A', X0 + 20, Y + 68, 80, 10); ivText(c, 'TROPHIES', X0 + 60, Y + 76, 7, '#F6E7B8');
  }
  const pb = homePaintBase;
  homePaintBase = function(c){ pb(c); try { paintDiplomas(c); paintBooks(c); paintTrophies(c); } catch (e) {} };
  /* refresh the cached room when a diploma, book or trophy appears */
  const wire = function(){
    const D = TOWN_DIST.in_myhome; if (!D || D._trophyWired) return; D._trophyWired = true;
    const sg = D.sig; D.sig = function(){ return (sg ? sg.apply(this, arguments) : '') + '|' + homeTrophySig(); };
  };
  wire();
})();
