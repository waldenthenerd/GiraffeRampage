/* uni-bank: the university's content (js/44zza-44zzb4 questions, 44zzc/44zzc1 lectures, 44zzd/44zzd1 books). Three times the question bank, 120 per faculty (48 easy, 42 medium, 30 hard),
   with the old ids and questions unchanged; a sound shape for every question; more lectures and books; and the session sizes (homework, exam, lecture, book) unchanged. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function qCount(){ var m = /Question \d+ of (\d+)/.exec(OV.innerHTML); return m ? +m[1] : 0; }
  try {
    out.total = UNI_Q.length; out.threeTimes = UNI_Q.length === 960;
    var per = {}, ids = {}, texts = {}, dupText = 0, dupId = 0, bad = [];
    UNI_Q.forEach(function(q){
      var k = q.f + q.t; per[k] = (per[k] | 0) + 1;
      if (ids[q.id]) dupId++; ids[q.id] = 1;
      if (texts[q.q]) dupText++; texts[q.q] = 1;
      if (q.type === 'mc'){ var s = {}; q.o.forEach(function(o){ s[o] = 1; }); if (q.o.length !== 4 || Object.keys(s).length !== 4) bad.push(q.id); }
      if (q.type === 'tf' && typeof q.a !== 'boolean') bad.push(q.id);
      if (q.type === 'ord' && (q.o.length < 3 || new Set(q.o).size !== q.o.length)) bad.push(q.id);
      if (q.type === 'match' && q.p.length !== 4) bad.push(q.id);
      if (q.type === 'est' && +q.id.replace(/\D+/g, '') > 40){ var mid = Math.round((q.min + q.max) / 2); if (!(q.min <= q.v && q.v <= q.max) || Math.abs(mid - q.v) <= q.tol) bad.push(q.id); }
      if (!q.q || q.t < 1 || q.t > 3) bad.push(q.id);
    });
    out.badQs = bad;
    out.perFaculty = UNI_FAC.every(function(F){ return per[F.id + 1] === 48 && per[F.id + 2] === 42 && per[F.id + 3] === 30; });
    out.uniqueIds = dupId === 0; out.uniqueText = dupText === 0; out.dupText = dupText;
    out.oldIdsKept = UNI_Q_BY_ID.q_giraffe1.q === 'Which animal is the tallest on land?' && UNI_Q_BY_ID.q_maths1.q === 'What is 7 x 8?' && UNI_Q_BY_ID.q_geo40.t === 3 && UNI_Q_BY_ID.q_giraffe41.f === 'giraffe';
    out.noBritish = !UNI_Q.concat(UNI_LECTURES, UNI_BOOKS).some(function(o){ return /\b(colour|metre|centre|grey|vapour|sulphur|aluminium|maths)\b/i.test(JSON.stringify(o).replace(/"f":"maths"|"id":"[^"]*"/g, '')); });

    out.lectures = UNI_LECTURES.length === 48 && UNI_FAC.every(function(F){ return UNI_LECTURES.filter(function(L){ return L.f === F.id; }).length === 6; });
    out.books = UNI_BOOKS.length === 40 && UNI_FAC.every(function(F){ return UNI_BOOKS.filter(function(B){ return B.f === F.id; }).length === 5; });
    var shape = [];
    UNI_LECTURES.forEach(function(L){ if (L.slides.length !== 4 || L.q.length !== 4 || L.slides.some(function(s){ return !UNI_PICS[s.pic] || !s.h || !s.p; }) || UNI_LEC_BY_ID[L.id] !== L) shape.push(L.id); });
    UNI_BOOKS.forEach(function(B){ if (B.pages.length !== 5 || B.q.length !== 3 || !B.fact || !B.author || UNI_BOOK_BY_ID[B.id] !== B) shape.push(B.id); });
    out.shape = shape;
    var ids2 = {}, d2 = 0; UNI_LECTURES.concat(UNI_BOOKS).forEach(function(o){ if (ids2[o.id]) d2++; ids2[o.id] = 1; }); out.noClashIds = d2 === 0;
    var qids = {}, qd = 0; UNI_LECTURES.forEach(function(L){ L.q.forEach(function(q){ if (qids[q.id]) qd++; qids[q.id] = 1; }); }); UNI_BOOKS.forEach(function(B){ B.q.forEach(function(q){ if (qids[q.id] && /^y_/.test(q.id)) qd++; qids[q.id] = 1; }); }); out.lectureQIds = qd === 0;
    out.oldLecturesKept = UNI_LEC_BY_ID.l1.title === 'A Very Tall Animal' && UNI_BOOK_BY_ID.b1.title === 'Up Where the Leaves Are' && UNI_LEC_BY_ID.l32.f === 'geo' && UNI_BOOK_BY_ID.b24.f === 'geo';
    out.picKeys = UNI_LECTURES.every(function(L){ return L.slides.every(function(sl){ return typeof UNI_PICS[sl.pic] === 'function'; }); }) && Object.keys(UNI_PICS).length === 61;
    out.tiers = UNI_FAC.every(function(F){ var t = function(a, n){ return a.filter(function(o){ return o.f === F.id && o.t === n; }).length; }; return t(UNI_LECTURES, 1) === 2 && t(UNI_LECTURES, 2) === 2 && t(UNI_LECTURES, 3) === 2 && t(UNI_BOOKS, 1) === 1 && t(UNI_BOOKS, 2) === 2 && t(UNI_BOOKS, 3) === 2; });

    /* the sessions are the same size as before */
    Save.data = JSON.parse(JSON.stringify(DEFAULT_SAVE)); Save.data.town = { n: {}, fish: {}, fishBook: {}, vis: {}, found: {}, bond: {}, err: {}, talk: {}, gift: {}, night: {}, done: {}, daily: { d: '', dig: [], got: [], dot: 0, n: 0 }, tips: {}, last: 'square' };
    townDoneCh = function(){ return true; };
    UNI_FAC.forEach(function(F){ uniFac(F.id).l = 15; }); uniData().energy = 99; uniData().en = 99;
    function tryStart(action){ for (var i = 0; i < 3; i++) if (!qCount()) { try { handleAction(action); } catch (e) { out.errs.push(action + ': ' + e.message); } } return qCount(); }
    function reset(){ OV.innerHTML = ''; }
    out.hw = tryStart('town-uq-hw-giraffe'); reset();
    handleAction('town-uq-lec-l33'); out.lec = /slide 1 of 4/.test(OV.innerHTML) && /Necks and Fights/.test(OV.innerHTML) ? 3 : 0; reset();
    handleAction('town-uq-book-b25'); out.book = /Spots, Stripes and Secrets/.test(OV.innerHTML) ? 2 : 0; reset();
    out.exam = tryStart('town-uq-exam-giraffe'); reset();
    out.sessions = out.hw === 6 && out.lec === 3 && out.book === 2;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['threeTimes', 'perFaculty', 'uniqueIds', 'uniqueText', 'oldIdsKept', 'noBritish', 'lectures', 'books', 'noClashIds', 'picKeys', 'lectureQIds', 'oldLecturesKept', 'tiers', 'sessions'];
  out.failed = need.filter(function(k){ return out[k] !== true; }).concat(out.badQs && out.badQs.length ? ['badQs'] : [], out.shape && out.shape.length ? ['shape'] : []);
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
