/* town-layers: the draw order of a street (the tiers are written above townDynamicBehind in js/town/44w-town-engine.js). A street with things that move behind its props (D.behind: the
   harbor's sailboats) keeps a back picture (water and ground) and a front picture (every prop and building); the things behind are drawn between them. This proves it for every such
   street: a loud marker is painted in the "behind" slot over the whole street, and wherever a prop or building is solid, none of it may show. It also checks that streets without such
   things pay for no second picture, and that nobody fakes depth with clip shapes again. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  try {
    var behind = TOWN_IDS.filter(function(id){ return TOWN_DIST[id].behind; });
    out.harbourBehind = behind.indexOf('harbour') >= 0;
    var marker = townDynamicBehind, solidTotal = 0, solidHidden = 0, shown = 0, seen = {};
    townDynamicBehind = function(ctx, D){ ctx.save(); ctx.fillStyle = '#FF00FF'; ctx.fillRect(-1e5, -1e5, 2e5, 2e5); ctx.restore(); };
    behind.forEach(function(id){
      TOWN_DIST[id].open = function(){ return true; }; Town.fixHour = 12; Town.fixWeather = 'clear';
      var D = TOWN_DIST[id]; townGo(id, Math.min(D.w - 700, 1500), 1); for (var i = 0; i < 30; i++) GR.step(1 / 60); Town.rainK = 0; GR.render();
      var L = Town.layers; if (!L || !L.field.back){ out.errs.push(id + ' has no back picture'); return; }
      var V = townView(), cam = Town.camX, RR = L.field.cv.width / D.w, fc = L.field.cv.getContext('2d').getImageData(0, 0, L.field.cv.width, L.field.cv.height).data;
      var cv = CTX.canvas, sd = CTX.getImageData(0, 0, cv.width, cv.height).data, dpr = G.dpr || 1, top = G.H - 600 * V.sc - Town.lift;
      for (var y = 0; y < 600; y += 11) for (var x = cam + 12; x < cam + V.vw - 12; x += 13){
        var fi = ((Math.floor(y * RR) * L.field.cv.width) + Math.floor(x * RR)) * 4, sx = Math.floor((x - cam) * V.sc * dpr), sy = Math.floor((top + y * V.sc) * dpr);
        if (sx < 0 || sy < 0 || sx >= cv.width || sy >= cv.height) continue;
        var si = (sy * cv.width + sx) * 4, mag = sd[si] > 200 && sd[si + 1] < 90 && sd[si + 2] > 200;
        if (fc[fi + 3] === 255){ solidTotal++; if (!mag) solidHidden++; seen[id] = 1; } else if (mag) shown++;
      }
    });
    townDynamicBehind = marker;
    out.solids = solidTotal > 200 && solidHidden === solidTotal;
    out.visibleElsewhere = shown > 200;                                      /* the marker really was drawn, and shows wherever nothing stands in front */
    out.eachChecked = behind.every(function(id){ return seen[id]; });
    out.solidsDetail = solidHidden + '/' + solidTotal;
    /* streets with nothing behind their props keep a single picture */
    TOWN_DIST.square.open = function(){ return true; }; townGo('square', 1200, 1); GR.step(1 / 60); GR.render();
    out.singlePicture = !Town.layers.field.back && !TOWN_DIST.square.behind;
    /* her home: the window she can dress has no second window hidden under it, and all three windows show the night and the rain */
    var HD = TOWN_DIST.in_myhome, rc = document.createElement('canvas'); rc.width = HD.w; rc.height = 600; var rg = rc.getContext('2d'); townPaintRoom(rg, HD, HD.w, 600, 1);
    function px(x, y){ var d = rg.getImageData(x, y, 1, 1).data; return d[0] + ',' + d[1] + ',' + d[2]; }
    var under = rg.getImageData(225, 80, 1, 1).data;                                                     /* just above the dressed window's frame: wall, not the glass of a second window */
    out.homeOneWindowUnder = under[2] < under[0] && px(610, 100) === '191,227,246' && px(940, 100) === '191,227,246';
    /* the wall socket is behind the sofa when there is one, and on show when there is not */
    function socketPx(){ var c2 = document.createElement('canvas'); c2.width = HD.w; c2.height = 600; var g2 = c2.getContext('2d'); townPaintRoom(g2, HD, HD.w, 600, 1); var d2 = g2.getImageData(255, TG - 60, 1, 1).data; return d2[0] + ',' + d2[1] + ',' + d2[2]; }
    var keepSofa = homeData().set.sofa; homeData().set.sofa = 0; var bare = socketPx(); homeData().set.sofa = 1; var covered = socketPx(); homeData().set.sofa = keepSofa;
    out.socketBehindSofa = bare === '237,230,210' && covered !== bare && /^\d+,\d+,\d+$/.test(covered);
    function sky(hour, wx){ Town.fixHour = hour; Town.fixWeather = wx; var cc = document.createElement('canvas'); cc.width = 200; cc.height = 200; var g = cc.getContext('2d'); homeSkyWindow(g, 1, 10, 10, 78, 118); var d = g.getImageData(0, 0, 200, 200).data, n = 0; for (var i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; }
    out.homeSkyDay = sky(13, 'clear') === 0; out.homeSkyNight = sky(22, 'clear') > 5000; out.homeSkyRain = sky(13, 'rain') > 5000;
    Town.fixHour = 12; Town.fixWeather = 'clear';
    /* the sailboats are drawn by the behind slot, and the old cut-out shapes are gone for good */
    var xhr = new XMLHttpRequest(), bad = [];
    ['js/town/44zc-town-life.js', 'js/town/44w-town-engine.js', 'js/town/44v-town-art.js', 'js/town/44zw-town-detail.js', 'js/town/44zb-town-interiors.js', 'js/audio/44zzo-town-sound.js'].forEach(function(f){ xhr.open('GET', '/' + f, false); xhr.send(); if (/clip\('evenodd'\)|hide\.push/.test(xhr.responseText)) bad.push(f); });
    out.noClipHacks = bad.length === 0; out.clipHacks = bad;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['socketBehindSofa', 'homeOneWindowUnder', 'homeSkyDay', 'homeSkyNight', 'homeSkyRain', 'harbourBehind', 'solids', 'visibleElsewhere', 'eachChecked', 'singlePicture', 'noClipHacks'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
