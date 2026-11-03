/* film-sheet: a contact sheet of one film (renderCutscene in js/films/17-film-venus.js draws any film at any time, a pure function of time).
   params: kind (sh1..sh6, sh9, moon, venus, home, a51, mars, mships, fusion, marshome; default moon), n (frames, default 12), cols (default 4),
   w (frame width, default 480), from / to (seconds; default the whole film). The sheet comes back as result.img (a PNG data URL) with the times;
   tools that save it: node tools/qa-cloud.mjs tools/scenarios/film-sheet.js --params "kind=a51" > out.json, then decode result.img.
   It also checks that every frame drew without an error and put something other than black on the screen.
   kind=all (in ci-check.sh): every film before Chapter 13.5, 16 frames each, no picture; it fails on an error or a black frame away from the fades. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go');
  if (QA.params.kind === 'all'){
    var kinds = ['sh1', 'sh2', 'sh3', 'sh4', 'sh5', 'sh6', 'sh9', 'moon', 'venus', 'home', 'a51', 'mars', 'mships', 'fusion', 'marshome'], cvA = document.createElement('canvas'); cvA.width = 640; cvA.height = 360; var ca = cvA.getContext('2d'), bad = [];
    kinds.forEach(function(k){ var sn = shChapterOf(k), m = MARS_FILMS[k], E = m ? m.end : sn ? shLen(sn) : k === 'a51' ? A51_T.END : k === 'home' ? HM_T.END : k === 'venus' ? CV_T.END : CS_T.END;
      G.state = 'cutscene'; G.cut = { t: 0, kind: k, cue: 0, done: false };
      for (var j = 1; j < 17; j++){ var tt = E * j / 17; G.cut.t = tt; ca.setTransform(1, 0, 0, 1, 0, 0); ca.globalAlpha = 1;
        try { renderCutscene(ca, tt, 640, 360, k); } catch (e){ bad.push(k + ' ' + tt.toFixed(1) + ': ' + e.message); continue; }
        var d = ca.getImageData(0, 0, 640, 360).data, lit = 0; for (var q = 0; q < d.length; q += 64) if (d[q] + d[q + 1] + d[q + 2] > 30) lit++;
        if (lit < 20 && j > 1 && j < 16) bad.push(k + ' ' + tt.toFixed(1) + ': black'); } });
    G.cut = null; G.state = 'menu';
    out.films = kinds.length; out.bad = bad; out.pass = out.errs.length === 0 && bad.length === 0; return QA.done(out);
  }
  var kind = QA.params.kind || 'moon', n = +(QA.params.n || 12), cols = +(QA.params.cols || 4), fw = +(QA.params.w || 480), fh = Math.round(fw * 9 / 16);
  var shn = shChapterOf(kind), mf = MARS_FILMS[kind];
  var end = mf ? mf.end : shn ? shLen(shn) : kind === 'a51' ? A51_T.END : kind === 'home' ? HM_T.END : kind === 'venus' ? CV_T.END : CS_T.END;
  var from = QA.params.from !== undefined ? +QA.params.from : 0, to = QA.params.to !== undefined ? +QA.params.to : end;
  var rows = Math.ceil(n / cols), sheet = document.createElement('canvas'); sheet.width = cols * fw; sheet.height = rows * (fh + 18);
  var sc = sheet.getContext('2d'); sc.fillStyle = '#111'; sc.fillRect(0, 0, sheet.width, sheet.height);
  var cv = document.createElement('canvas'), W = +(QA.params.rw || 1280), H = Math.round(W * 9 / 16); cv.width = W; cv.height = H; var c = cv.getContext('2d');
  G.state = 'cutscene'; G.cut = { t: 0, kind: kind, cue: 0, done: false };
  var times = [], blank = [];
  for (var i = 0; i < n; i++){
    var t = from + (to - from) * (n === 1 ? 0 : i / (n - 1)) * 0.999; times.push(+t.toFixed(2)); G.cut.t = t;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    try { renderCutscene(c, t, W, H, kind); } catch (e){ out.errs.push(t.toFixed(2) + ': ' + e.message); }
    var d = c.getImageData(0, 0, W, H).data, lit = 0; for (var q = 0; q < d.length; q += 64) if (d[q] + d[q + 1] + d[q + 2] > 30) lit++;
    if (lit < 20) blank.push(+t.toFixed(2));
    var x = (i % cols) * fw, y = Math.floor(i / cols) * (fh + 18);
    sc.drawImage(cv, x, y, fw, fh); sc.fillStyle = '#ddd'; sc.font = '12px sans-serif'; sc.fillText(kind + ' t=' + t.toFixed(1), x + 6, y + fh + 13);
  }
  G.cut = null; G.state = 'menu';
  out.kind = kind; out.end = end; out.times = times; out.blank = blank;
  if (!QA.params.noimg) out.img = sheet.toDataURL('image/png');
  out.pass = out.errs.length === 0;
  QA.done(out);
})();
