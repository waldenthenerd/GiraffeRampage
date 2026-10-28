'use strict';
/* =============================================================================================================================
   44zzf-campus-study.js  --  LONGNECK UNIVERSITY: the four things to do (lecture, reading, homework, exam) and the question card.

   uniBeginAct(b) is called by uniAct (44zze) for the lecture seats, the library shelves and reading table, the homework desks and the
   exam desks. It opens a picker; the picker's buttons are "town-uq-..." actions, which uniStudyAction(a) handles.
     lecture  2 energy  four slides, then three questions out of the lecture's four. Pays most the first time (1.5x), then less each time.
     reading  1 energy  five pages, then two questions out of the book's three. A fact goes in the notebook the first time.
     homework 1 energy  six questions from the faculty bank at the faculty's tier. A flashcard takes two wrong answers off a multiple choice.
     exam     3 energy  ten questions, 30 seconds each, no answers shown until the end; 70% (7 of 10) passes and is a degree step.
   Everything she earns goes through uniAddXp (44zz). A session also counts for the errands (t.n.uniSessions, uniLec, uniBook, uniHw, uniPass).
   The slide pictures are drawn by UNI_PICS (44zzg).
   ============================================================================================================================= */
(function(){
  const HW_N = 6, EX_N = 10, EX_PASS = 7, EX_SECS = 30;
  let S = null;                                                                       /* the session in progress */

  const shuffle = function(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const esc = function(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  const tierNeed = function(t){ return t >= 3 ? 10 : t === 2 ? 5 : 0; };

  /* ---- choosing questions ---- */
  function pickFrom(pool, n, prefer){
    const u = uniData();
    return pool.map(function(q){ return { q: q, w: (u.seen[q.id] | 0) + Math.random() * 1.6 - (q.t === prefer ? 1 : 0) }; })
      .sort(function(a, b){ return a.w - b.w; }).slice(0, n).map(function(o){ return o.q; });
  }
  function homeworkQs(fid){ const tier = uniTier(fid); return pickFrom(UNI_Q.filter(function(q){ return q.f === fid && q.t <= tier; }), HW_N, tier); }
  function examQs(fid, step){
    const lo = step === 1 ? 1 : 2, hi = step === 1 ? 2 : 3, pref = step === 1 ? 2 : 3;
    return pickFrom(UNI_Q.filter(function(q){ return q.f === fid && q.t >= lo && q.t <= hi; }), EX_N, pref);
  }
  /* the play copy of a question: shuffled, with the right answer remembered */
  function prep(q){
    const p = { q: q, type: q.type, text: q.q, hide: {} };
    if (q.type === 'mc'){ p.ord = shuffle(q.o.map(function(_, i){ return i; })); }
    else if (q.type === 'ord'){ let s; for (let k = 0; k < 8; k++){ s = shuffle(q.o.map(function(_, i){ return i; })); if (s.join() !== s.slice().sort().join()) break; } p.ord = s; p.pick = []; }
    else if (q.type === 'match'){ p.ord = shuffle(q.p.map(function(_, i){ return i; })); p.sel = -1; p.pair = {}; }
    else if (q.type === 'est'){ p.val = Math.round((q.min + q.max) / 2); }
    return p;
  }

  /* ---- entry from the furniture ---- */
  window.uniBeginAct = function(b){
    switch (b.act){
      case 'uni-lec': pickLecture(); break;
      case 'uni-shelf': pickBook(b.m); break;
      case 'uni-read': pickBook(''); break;
      case 'uni-hw': pickFaculty('hw'); break;
      case 'uni-exam': pickFaculty('exam'); break;
    }
  };
  function energyLine(cost){ return '<div class="uq-en">' + uniEnergyBar() + '<span>This costs <b>' + cost + '</b> energy.</span></div>'; }
  function lockText(F){ const c = F.ch; return 'opens after Chapter ' + c; }

  function pickLecture(){
    let h = '<div class="tp-title">LECTURE HALL</div><p class="bp">Four slides, then three questions. Professor Longshanks pays best for a lecture you have not heard before.</p>' + energyLine(2) + '<div class="uqfacs">';
    UNI_FAC.forEach(function(F){
      const open = uniOpen(F), k = uniFac(F.id), u = uniData();
      h += '<div class="uqfac' + (open ? '' : ' lock') + '" style="--c:' + F.col + '"><b>' + F.name + '</b>';
      if (!open){ h += '<small>' + lockText(F) + '</small></div>'; return; }
      UNI_LECTURES.filter(function(L){ return L.f === F.id; }).sort(function(a, b){ return a.t - b.t; }).forEach(function(L){
        const ok = k.l >= tierNeed(L.t), n = u.lec[L.id] | 0;
        h += '<button class="uqrow" data-a="town-uq-lec-' + L.id + '"' + (ok ? '' : ' disabled') + '><span>' + esc(L.title) + '</span><small>' + (ok ? (n ? 'heard ' + n + 'x' : 'new') : 'level ' + tierNeed(L.t)) + '</small></button>';
      });
      h += '</div>';
    });
    townPanelT('uni', h + '</div>', { w: 960 });
  }
  function pickBook(fid){
    let h = '<div class="tp-title">' + (fid ? esc(UNI_BY_ID[fid].name.toUpperCase()) + ' SHELF' : 'THE READING TABLE') + '</div><p class="bp">Five pages, then two questions. Reading a book for the first time writes a fact in your notebook.</p>' + energyLine(1) + '<div class="uqfacs">';
    UNI_FAC.filter(function(F){ return !fid || F.id === fid; }).forEach(function(F){
      const open = uniOpen(F), k = uniFac(F.id), u = uniData();
      h += '<div class="uqfac' + (open ? '' : ' lock') + '" style="--c:' + F.col + '"><b>' + F.name + '</b>';
      if (!open){ h += '<small>' + lockText(F) + '</small></div>'; return; }
      UNI_BOOKS.filter(function(B){ return B.f === F.id; }).sort(function(a, b){ return a.t - b.t; }).forEach(function(B){
        const ok = k.l >= tierNeed(B.t), n = u.read[B.id] | 0;
        h += '<button class="uqrow" data-a="town-uq-book-' + B.id + '"' + (ok ? '' : ' disabled') + '><span>' + esc(B.title) + '<em>' + esc(B.author) + '</em></span><small>' + (ok ? (n ? 'read ' + n + 'x' : 'new') : 'level ' + tierNeed(B.t)) + '</small></button>';
      });
      h += '</div>';
    });
    townPanelT('uni', h + '</div>', { w: 960 });
  }
  function pickFaculty(kind){
    const u = uniData(), ex = kind === 'exam';
    let h = '<div class="tp-title">' + (ex ? 'THE EXAM HALL' : 'HOMEWORK DESKS') + '</div><p class="bp">' +
      (ex ? 'Ten questions, thirty seconds each, no answers until the end. Seven right is a pass and a step toward a degree. A retake costs energy again.' : 'Six questions from the faculty bank, at the faculty\'s level. You see the answer after each one.') + '</p>' +
      energyLine(ex ? 3 : 1) + '<div class="unicards">';
    UNI_FAC.forEach(function(F){
      const open = uniOpen(F), k = uniFac(F.id), d = u.deg[F.id] | 0;
      let note, can = open;
      if (!open) note = lockText(F);
      else if (ex){ if (d >= 3){ note = 'Doctorate earned'; can = false; } else if (k.l < 5 * (d + 1)){ note = UNI_DEG[d + 1] + ' needs level ' + 5 * (d + 1); can = false; } else note = 'Sit the ' + UNI_DEG[d + 1] + ' exam'; }
      else note = 'Level ' + k.l + ', tier ' + uniTier(F.id) + ' questions';
      h += '<button class="unicard uqpickf' + (can ? '' : ' lock') + '" style="--c:' + F.col + '" data-a="town-uq-' + kind + '-' + F.id + '"' + (can ? '' : ' disabled') + '><b>' + F.name + '</b><span>' + note + '</span></button>';
    });
    townPanelT('uni', h + '</div>', { w: 960 });
  }

  /* ---- starting a session ---- */
  function noEnergy(cost){
    if (uniEnergy() >= cost) return false;
    SFX.deny(); townToast('Not enough study energy. The café has tea.', '#FFB89A'); return true;
  }
  function begin(kind, fid, qs, extra){
    const cost = UNI_ACT[kind].cost;
    if (noEnergy(cost)) return;
    uniSpend(cost);
    S = Object.assign({ kind: kind, fid: fid, qs: qs.map(prep), i: 0, score: 0, log: [], answered: false, last: null, cost: cost }, extra || {});
    SFX.click();
  }
  function startLecture(id){
    const L = UNI_LEC_BY_ID[id]; if (!L || !uniOpen(UNI_BY_ID[L.f]) || uniFac(L.f).l < tierNeed(L.t)) return;
    begin('lec', L.f, shuffle(L.q).slice(0, 3), { lec: L, slide: 0, id: L.id });
    if (S) showSlide();
  }
  function startBook(id){
    const B = UNI_BOOK_BY_ID[id]; if (!B || !uniOpen(UNI_BY_ID[B.f]) || uniFac(B.f).l < tierNeed(B.t)) return;
    begin('read', B.f, shuffle(B.q).slice(0, 2), { book: B, slide: 0, id: B.id });
    if (S) showPage();
  }
  function startHw(fid){
    const F = UNI_BY_ID[fid]; if (!F || !uniOpen(F)) return;
    begin('hw', fid, homeworkQs(fid)); if (S) showQ();
  }
  function startExam(fid){
    const F = UNI_BY_ID[fid]; if (!F || !uniOpen(F)) return;
    const d = uniData().deg[fid] | 0; if (d >= 3 || uniFac(fid).l < 5 * (d + 1)) return;
    begin('exam', fid, examQs(fid, d + 1), { step: d + 1 }); if (S) showQ();
  }

  /* ---- the slides and the pages ---- */
  function showSlide(){
    const L = S.lec, F = UNI_BY_ID[S.fid], sl = L.slides[S.slide], last = S.slide === L.slides.length - 1;
    townPanelT('uni', '<div class="uq" style="--c:' + F.col + '"><div class="uq-head"><b>' + esc(L.title) + '</b><small>' + F.name + ' lecture · slide ' + (S.slide + 1) + ' of ' + L.slides.length + '</small></div>' +
      '<div class="uq-slide"><canvas id="uq-pic" width="520" height="300"></canvas><div class="uq-text"><h3>' + esc(sl.h) + '</h3><p>' + esc(sl.p) + '</p></div></div>' +
      '<div class="uq-nav"><button class="tbtn"' + (S.slide ? '' : ' disabled') + ' data-a="town-uq-prev">Back</button>' +
      '<span class="uq-dots">' + L.slides.map(function(_, i){ return '<i' + (i === S.slide ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' +
      '<button class="tbtn go" data-a="town-uq-next">' + (last ? 'Take the quiz' : 'Next slide') + '</button></div></div>', { w: 980, back: 'Leave' });
    paintPic(sl.pic, F);
  }
  /* the book: a real one. A cover, then leaves that turn. Leaf 0 is the cover (its back is the endpaper), leaf 1 carries pages 1 and 2,
     leaf 2 pages 3 and 4, leaf 3 page 5 and "The End". S.slide counts the leaves already turned (0 closed, 4 all turned). */
  function bookFace(B, F, leaf, back){
    if (leaf === 0 && !back) return '<div class="bk-cover" style="--b:' + B.col + '"><i class="bk-band"></i><b>' + esc(B.title) + '</b><span class="bk-orn">&#10086;</span><small>' + esc(B.author) + '</small><em>' + esc(F.name) + '</em></div>';
    if (leaf === 0) return '<div class="bk-page endpaper"><div class="bk-plate"><small>THIS BOOK BELONGS TO</small><b>The Longneck University Library</b><span class="bk-orn">&#10086;</span></div></div>';
    const n = back ? leaf * 2 : leaf * 2 - 1;                                           /* page number, 1 to 6 */
    if (n > B.pages.length) return '<div class="bk-page"><div class="bk-end"><span class="bk-orn">&#10086;</span><b>The End</b><small>' + esc(B.author) + '</small></div><small class="bk-pn">' + n + '</small></div>';
    return '<div class="bk-page' + (n === 1 ? ' first' : '') + '"><p>' + esc(B.pages[n - 1]) + '</p><small class="bk-pn">' + n + '</small></div>';
  }
  function showPage(){
    const B = S.book, F = UNI_BY_ID[S.fid], s = S.slide, dir = S.dir || ''; S.dir = '';
    const last = s === B.pages.length - 1, maxLeaf = 3;
    const left = function(k){ return k > 0 ? bookFace(B, F, k - 1, true) : ''; };               /* what lies on the left after k leaves are turned */
    const right = function(k){ return k <= maxLeaf ? bookFace(B, F, k, false) : '<div class="bk-page back-cover"></div>'; };
    let leafHtml = '', baseL = left(s), baseR = right(s);
    if (dir === 'fwd'){ leafHtml = '<div class="bk-leaf fwd"><div class="face front">' + right(s - 1) + '</div><div class="face back">' + left(s) + '</div></div>'; baseL = left(s - 1); }
    else if (dir === 'back'){ leafHtml = '<div class="bk-leaf back"><div class="face front">' + right(s) + '</div><div class="face back">' + left(s + 1) + '</div></div>'; baseR = right(s + 1); }
    const label = s === 0 ? 'the cover' : last ? 'page 5, the end' : 'pages ' + (s * 2 - 1) + ' and ' + (s * 2);
    townPanelT('uni', '<div class="uq" style="--c:' + F.col + '"><div class="uq-head"><b>' + esc(B.title) + '</b><small>' + esc(B.author) + ' · ' + label + '</small></div>' +
      '<div class="bk' + (s === 0 && dir !== 'back' ? ' closed' : '') + (dir === 'fwd' && s === 1 ? ' opening' : '') + (dir === 'back' && s === 0 ? ' closing' : '') + '" style="--b:' + B.col + '"><div class="bk-shell"><div class="bk-l">' + baseL + '</div><div class="bk-r">' + baseR + '</div>' + leafHtml + '</div></div>' +
      '<div class="uq-nav"><button class="tbtn"' + (s ? '' : ' disabled') + ' data-a="town-uq-prev">' + (s === 1 ? 'Close the book' : 'Turn back') + '</button>' +
      '<span class="uq-dots">' + B.pages.map(function(_, i){ return '<i' + (i === s ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' +
      '<button class="tbtn go" data-a="town-uq-next">' + (last ? 'Take the quiz' : s === 0 ? 'Open the book' : 'Turn the page') + '</button></div></div>', { w: 940, back: 'Leave' });
    if (dir) try { SFX.click(); } catch (e) {}
  }
  function paintPic(key, F){
    const cv = document.getElementById('uq-pic'); if (!cv) return;
    const c = cv.getContext('2d');
    try { if (typeof UNI_PICS !== 'undefined' && UNI_PICS[key]) UNI_PICS[key](c, cv.width, cv.height, F.col); else { c.fillStyle = F.col; c.globalAlpha = .25; c.fillRect(0, 0, cv.width, cv.height); } } catch (e) {}
  }

  /* ---- the question card ---- */
  function qHead(){
    const F = UNI_BY_ID[S.fid], name = S.kind === 'exam' ? UNI_DEG[S.step] + ' exam' : S.kind === 'hw' ? 'Homework' : 'Quiz';
    return '<div class="uq-head"><b>' + F.name + ': ' + name + '</b><small>Question ' + (S.i + 1) + ' of ' + S.qs.length + (S.kind === 'exam' ? '' : '  ·  ' + S.score + ' right') + '</small></div>' +
      '<div class="uq-prog">' + S.qs.map(function(_, i){ const r = S.log[i]; return '<i class="' + (i === S.i ? 'cur ' : '') + (r === undefined ? '' : S.kind === 'exam' ? 'done' : r ? 'ok' : 'no') + '"></i>'; }).join('') + '</div>';
  }
  function showQ(){
    const p = S.qs[S.i], F = UNI_BY_ID[S.fid], q = p.q, fb = S.answered ? S.last : null;
    let h = '<div class="uq" style="--c:' + F.col + '">' + qHead();
    if (S.kind === 'exam') h += '<div class="uq-time"><i id="uq-t"></i></div>';
    h += '<p class="uq-q">' + esc(p.text) + '</p><div class="uq-body">';
    const dis = fb ? ' disabled' : '';
    if (p.type === 'mc'){
      p.ord.forEach(function(oi, k){
        const cls = fb ? (oi === 0 ? ' right' : (fb.pick === k ? ' wrong' : '')) : '';
        if (p.hide[k] && !fb) h += '<button class="uq-opt gone" disabled>&nbsp;</button>';
        else h += '<button class="uq-opt' + cls + '" data-a="town-uq-a-' + k + '"' + dis + '><b>' + 'ABCD'[k] + '</b>' + esc(q.o[oi]) + '</button>';
      });
    } else if (p.type === 'tf'){
      [true, false].forEach(function(v){
        const cls = fb ? (v === q.a ? ' right' : (fb.pick === v ? ' wrong' : '')) : '';
        h += '<button class="uq-opt tf' + cls + '" data-a="town-uq-a-' + (v ? 't' : 'f') + '"' + dis + '>' + (v ? 'True' : 'False') + '</button>';
      });
    } else if (p.type === 'ord'){
      h += '<div class="uq-ord"><div class="uq-slots">';
      for (let k = 0; k < q.o.length; k++){ const oi = p.pick[k]; h += '<div class="uq-slot' + (oi === undefined ? '' : ' fill') + (fb ? (oi === k ? ' right' : ' wrong') : '') + '"><b>' + (k + 1) + '</b>' + (oi === undefined ? '' : esc(q.o[oi])) + '</div>'; }
      h += '</div><div class="uq-pool">';
      p.ord.forEach(function(oi){ const used = p.pick.indexOf(oi) >= 0; h += '<button class="uq-chip' + (used ? ' used' : '') + '" data-a="town-uq-o-' + oi + '"' + (used || fb ? ' disabled' : '') + '>' + esc(q.o[oi]) + '</button>'; });
      h += '</div>' + (fb ? '' : '<button class="tbtn" data-a="town-uq-oreset"' + (p.pick.length ? '' : ' disabled') + '>Start again</button>') + '</div>';
    } else if (p.type === 'match'){
      h += '<div class="uq-match"><div class="uq-ml">';
      q.p.forEach(function(pr, i){
        const j = p.pair[i], cls = fb ? (j === i ? ' right' : ' wrong') : p.sel === i ? ' sel' : '';
        h += '<button class="uq-m' + cls + '" data-a="town-uq-ml-' + i + '"' + (fb || j !== undefined ? ' disabled' : '') + '>' + esc(pr[0]) + (j !== undefined ? '<em>' + esc(q.p[j][1]) + '</em>' : '') + '</button>';
      });
      h += '</div><div class="uq-mr">';
      p.ord.forEach(function(j){ const used = Object.keys(p.pair).some(function(i){ return p.pair[i] === j; }); h += '<button class="uq-m r' + (used ? ' used' : '') + '" data-a="town-uq-mr-' + j + '"' + (used || fb ? ' disabled' : '') + '>' + esc(q.p[j][1]) + '</button>'; });
      h += '</div></div>' + (fb ? '' : '<button class="tbtn" data-a="town-uq-mreset"' + (Object.keys(p.pair).length ? '' : ' disabled') + '>Start again</button>');
    } else if (p.type === 'est'){
      const step = Math.max(1, (q.max - q.min) / 200);
      h += '<div class="uq-est"><div class="uq-val"><b id="uq-v">' + p.val + '</b> ' + esc(q.unit || '') + '</div><input id="uq-slider" type="range" min="' + q.min + '" max="' + q.max + '" step="' + step + '" value="' + p.val + '"' + dis +
        ' oninput="document.getElementById(\'uq-v\').textContent=Math.round(+this.value*100)/100"><div class="uq-rng"><span>' + q.min + '</span><span>' + q.max + '</span></div>' +
        (fb ? '<p class="uq-fb">You said ' + fb.pick + '. The answer is about ' + q.v + ' ' + esc(q.unit || '') + '.</p>' : '<button class="tbtn go" data-a="town-uq-est">Lock it in</button>') + '</div>';
    }
    h += '</div>';
    if (fb && S.kind !== 'exam'){
      h += '<div class="uq-fb ' + (fb.ok ? 'ok' : 'no') + '"><b>' + (fb.ok ? 'Right!' : 'Not quite.') + '</b> ' + esc(q.e || '') + '</div>';
    }
    h += '<div class="uq-nav">';
    if (S.kind === 'hw' && !fb){
      const fl = uniData().buff.flash | 0;
      h += '<button class="tbtn" data-a="town-uq-flash"' + (fl && p.type === 'mc' && !Object.keys(p.hide).length ? '' : ' disabled') + '>Flashcard (' + fl + ')</button>';
    } else h += '<span></span>';
    h += fb ? '<button class="tbtn go" data-a="town-uq-q-next">' + (S.i + 1 >= S.qs.length ? 'See how you did' : 'Next question') + '</button>' : '<span></span>';
    h += '</div></div>';
    townPanelT('uni', h, { w: 860, back: 'Leave' });
    if (S.kind === 'exam' && !fb) startTimer();
  }

  function startTimer(){
    clearTimeout(S.timer); const me = S, i = S.i, t0 = Date.now();
    const tick = function(){
      if (S !== me || me.i !== i || me.answered) return;
      const el = document.getElementById('uq-t'); if (!el){ return; }                  /* the panel was closed */
      const f = Math.max(0, 1 - (Date.now() - t0) / (EX_SECS * 1000));
      el.style.width = (f * 100) + '%'; el.className = f < 0.25 ? 'low' : '';
      if (f <= 0){ answer(false, '(no answer)'); return; }
      me.timer = setTimeout(tick, 150);
    };
    tick();
  }

  /* judging */
  function judge(p, pick){
    const q = p.q;
    switch (p.type){
      case 'mc': return p.ord[pick] === 0;
      case 'tf': return pick === q.a;
      case 'ord': return p.pick.length === q.o.length && p.pick.every(function(oi, k){ return oi === k; });
      case 'match': return q.p.every(function(_, i){ return p.pair[i] === i; });
      case 'est': return Math.abs(pick - q.v) <= q.tol;
    }
    return false;
  }
  function answer(ok, pick){
    if (!S || S.answered) return;
    clearTimeout(S.timer);
    const p = S.qs[S.i], u = uniData();
    S.answered = true; S.last = { ok: ok, pick: pick }; S.log[S.i] = ok ? 1 : 0; if (ok) S.score++;
    u.seen[p.q.id] = (u.seen[p.q.id] | 0) + 1;
    u.n.correct = (u.n.correct | 0) + (ok ? 1 : 0); u.n.wrong = (u.n.wrong | 0) + (ok ? 0 : 1);
    try { ok ? SFX.pickup && SFX.pickup() : SFX.deny(); } catch (e) {}
    if (S.kind === 'exam'){ S.wrong = S.wrong || []; if (!ok) S.wrong.push(p); nextQ(); return; }
    showQ();
  }
  function nextQ(){
    S.i++; S.answered = false; S.last = null;
    if (S.i >= S.qs.length){ finish(); return; }
    showQ();
  }

  /* ---- the end of a session ---- */
  function xpFor(){
    const u = uniData(), frac = S.score / S.qs.length, q = 0.4 + 0.6 * frac;
    if (S.kind === 'lec'){ const n = u.lec[S.id] | 0; return Math.round(30 * q * (n === 0 ? 1.5 : Math.max(0.35, 1 / (1 + 0.3 * n)))); }
    if (S.kind === 'read'){ const n = u.read[S.id] | 0; return Math.round(16 * q * (n === 0 ? 1.5 : Math.max(0.35, 1 / (1 + 0.3 * n)))); }
    if (S.kind === 'hw') return Math.round(3 + 3 * S.score);
    return Math.round(10 + 4 * S.score);
  }
  function finish(){
    const u = uniData(), t = townData(), F = UNI_BY_ID[S.fid], frac = S.score / S.qs.length, kind = S.kind;
    const out = { xp: 0, up: 0, ms: 0, fact: false, newDeg: 0, gems: 0, pass: false, first: false };
    const bumpN = function(k){ t.n[k] = (t.n[k] | 0) + 1; };
    bumpN('uniSessions'); u.n.sessions = (u.n.sessions | 0) + 1;
    if (kind === 'lec' || kind === 'read'){
      const bag = kind === 'lec' ? u.lec : u.read, id = S.id;
      out.first = !(bag[id] | 0);
      const r = uniAddXp(S.fid, xpFor());
      out.xp = r.xp; out.up = r.up; out.ms = r.milestone;
      if (frac >= 0.5){ bag[id] = (bag[id] | 0) + 1; if (!u.facts[id]){ u.facts[id] = 1; out.fact = true; } }
      if (kind === 'lec'){ bumpN('uniLec'); u.n.lectures = (u.n.lectures | 0) + 1; } else { bumpN('uniBook'); u.n.books = (u.n.books | 0) + 1; }
    } else if (kind === 'hw'){
      const r = uniAddXp(S.fid, xpFor()); out.xp = r.xp; out.up = r.up; out.ms = r.milestone;
      bumpN('uniHw'); u.n.hw = (u.n.hw | 0) + 1;
    } else {
      u.n.exams = (u.n.exams | 0) + 1;
      out.pass = S.score >= EX_PASS;
      const r = uniAddXp(S.fid, xpFor()); out.xp = r.xp; out.up = r.up; out.ms = r.milestone;
      if (out.pass){
        out.newDeg = S.step; u.deg[S.fid] = Math.max(u.deg[S.fid] | 0, S.step);
        out.gems = UNI_DEG_GEMS[S.step]; Save.data.gems = (Save.data.gems | 0) + out.gems;
        if (S.step === 3) u.badge[S.fid] = 1;
        bumpN('uniPass'); u.n.passed = (u.n.passed | 0) + 1;
        try { SFX.transform(); } catch (e) {}
      }
    }
    if (u.buff.xp > 0 && out.xp) u.buff.xp--;
    Save.write();
    S.out = out; showResult();
  }
  function showResult(){
    const o = S.out, F = UNI_BY_ID[S.fid], k = uniFac(S.fid), kind = S.kind, n = S.qs.length;
    const title = kind === 'exam' ? (o.pass ? 'YOU PASSED' : 'NOT THIS TIME') : kind === 'hw' ? 'HOMEWORK DONE' : kind === 'lec' ? 'LECTURE DONE' : 'BOOK FINISHED';
    let h = '<div class="uq uq-res" style="--c:' + F.col + '"><div class="tp-title">' + title + '</div><div class="uq-score"><b>' + S.score + '</b> / ' + n + '</div>';
    h += '<ul class="uq-gain"><li>+' + o.xp + ' ' + F.name + ' xp' + (o.first ? ' (first time bonus)' : '') + '</li>';
    if (o.up) h += '<li class="up">' + F.name + ' level ' + k.l + '!  ' + uniBonusText(F, k.l) + '</li>';
    if (o.ms) h += '<li class="up">A milestone: level ' + o.ms + ' gives a bigger bonus.</li>';
    if (o.fact) h += '<li>A new fact is in your notebook.</li>';
    if (o.pass) h += '<li class="up">' + UNI_DEG[o.newDeg] + ' degree in ' + F.name + '!  +' + o.gems + ' gems' + (o.newDeg === 3 ? '  and the faculty badge' : '') + '</li>';
    if (kind === 'exam' && !o.pass) h += '<li>You need ' + EX_PASS + ' right. Study some more and come back.</li>';
    h += '</ul>';
    if (kind === 'exam' && S.wrong && S.wrong.length){
      h += '<div class="uq-review"><h4>What to look at again</h4>' + S.wrong.map(function(p){ return '<p><b>' + esc(p.text) + '</b><br>' + esc(p.q.e || '') + '</p>'; }).join('') + '</div>';
    }
    const again = (kind === 'hw' || kind === 'exam') && uniEnergy() >= UNI_ACT[kind].cost && !(kind === 'exam' && (o.pass && S.step >= 3));
    h += uniEnergyBar() + '<div class="uq-nav"><button class="tbtn"' + (again ? '' : ' disabled') + ' data-a="town-uq-again">' + (kind === 'exam' ? 'Another go' : kind === 'hw' ? 'More homework' : 'Choose another') + '</button><button class="tbtn go" data-a="town-uq-done">Done</button></div></div>';
    townPanelT('uni', h, { w: 760 });
    try { if (!o.pass && kind === 'exam') SFX.deny(); } catch (e) {}
  }

  /* ---- buttons ---- */
  window.uniStudyAction = function(a){
    let m;
    if (a.indexOf('town-uq-') !== 0) return false;
    if ((m = /^town-uq-lec-(\w+)$/.exec(a))){ startLecture(m[1]); return true; }
    if ((m = /^town-uq-book-(\w+)$/.exec(a))){ startBook(m[1]); return true; }
    if ((m = /^town-uq-hw-(\w+)$/.exec(a))){ startHw(m[1]); return true; }
    if ((m = /^town-uq-exam-(\w+)$/.exec(a))){ startExam(m[1]); return true; }
    if (!S) return true;
    const p = S.qs[S.i];
    if (a === 'town-uq-prev'){ if (S.slide > 0){ S.slide--; S.dir = 'back'; (S.lec ? showSlide : showPage)(); } return true; }
    if (a === 'town-uq-next'){
      const len = S.lec ? S.lec.slides.length : S.book.pages.length;
      if (S.slide < len - 1){ S.slide++; S.dir = 'fwd'; (S.lec ? showSlide : showPage)(); } else { S.i = 0; S.answered = false; showQ(); }
      return true;
    }
    if (a === 'town-uq-q-next'){ if (S.answered) nextQ(); return true; }
    if (a === 'town-uq-done'){ townClosePanel(); S = null; return true; }
    if (a === 'town-uq-again'){
      const kind = S.kind, fid = S.fid; S = null;
      if (kind === 'exam') startExam(fid); else if (kind === 'hw') startHw(fid); else if (kind === 'lec') pickLecture(); else pickBook('');
      return true;
    }
    if (S.answered && S.kind !== 'exam') return true;
    if (a === 'town-uq-flash'){
      const u = uniData();
      if (p && p.type === 'mc' && (u.buff.flash | 0) > 0){
        u.buff.flash--; const wrong = p.ord.map(function(oi, k){ return oi === 0 ? -1 : k; }).filter(function(k){ return k >= 0; });
        shuffle(wrong).slice(0, 2).forEach(function(k){ p.hide[k] = 1; }); Save.write(); showQ();
      }
      return true;
    }
    if (!p) return true;
    if ((m = /^town-uq-a-(\w+)$/.exec(a))){
      if (p.type === 'mc'){ const k = +m[1]; answer(judge(p, k), k); }
      else if (p.type === 'tf'){ const v = m[1] === 't'; answer(judge(p, v), v); }
      return true;
    }
    if ((m = /^town-uq-o-(\d+)$/.exec(a)) && p.type === 'ord'){
      const oi = +m[1]; if (p.pick.indexOf(oi) < 0) p.pick.push(oi);
      if (p.pick.length === p.q.o.length) answer(judge(p, 0), 0); else showQ();
      return true;
    }
    if (a === 'town-uq-oreset' && p.type === 'ord'){ p.pick = []; showQ(); return true; }
    if ((m = /^town-uq-ml-(\d+)$/.exec(a)) && p.type === 'match'){ p.sel = +m[1]; showQ(); return true; }
    if ((m = /^town-uq-mr-(\d+)$/.exec(a)) && p.type === 'match'){
      if (+m[1] >= p.q.p.length) return true;
      if (p.sel < 0){ const free = p.q.p.findIndex(function(_, i){ return p.pair[i] === undefined; }); if (free < 0) return true; p.sel = free; }
      p.pair[p.sel] = +m[1]; p.sel = -1;
      if (Object.keys(p.pair).length === p.q.p.length) answer(judge(p, 0), 0); else showQ();
      return true;
    }
    if (a === 'town-uq-mreset' && p.type === 'match'){ p.pair = {}; p.sel = -1; showQ(); return true; }
    if (a === 'town-uq-est' && p.type === 'est'){
      const el = document.getElementById('uq-slider'), v = el ? Math.round(+el.value * 100) / 100 : p.val;
      answer(judge(p, v), v); return true;
    }
    return true;
  };

  /* leaving mid-session (the Back button, Escape) just ends it; the energy is gone, as at a real desk */
  const tc = townClosePanel;
  townClosePanel = function(){ if (S && S.timer) clearTimeout(S.timer); S = null; tc(); };
})();
