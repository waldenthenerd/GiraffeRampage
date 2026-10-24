/* town-layers: the draw order of a street (the tiers are written above townDynamicBehind in js/44w-town-engine.js). A street with things that move behind its props (D.behind: the
   harbour's sailboats) keeps a back picture (water and ground) and a front picture (every prop and building); the things behind are drawn between them. This proves it for every such
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
    /* the sailboats are drawn by the behind slot, and the old cut-out shapes are gone for good */
    var xhr = new XMLHttpRequest(), bad = [];
    ['js/44zc-town-life.js', 'js/44w-town-engine.js', 'js/44v-town-art.js', 'js/44zw-town-detail.js', 'js/44zb-town-interiors.js', 'js/44zzo-town-sound.js'].forEach(function(f){ xhr.open('GET', '/' + f, false); xhr.send(); if (/clip\('evenodd'\)|hide\.push/.test(xhr.responseText)) bad.push(f); });
    out.noClipHacks = bad.length === 0; out.clipHacks = bad;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['harbourBehind', 'solids', 'visibleElsewhere', 'eachChecked', 'singlePicture', 'noClipHacks'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
