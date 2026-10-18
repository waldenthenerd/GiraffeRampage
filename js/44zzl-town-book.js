'use strict';
/* =============================================================================================================================
   44zzl-town-book.js  --  THE COLLECTION BOOK and the BETTER TRAM MAP.

   THE COLLECTION BOOK (townShowBook; a "Book" tab in the journal, and a button on the town menu): one page for everything she can collect or
   finish. A table with a row for every district that has things to find (coins, stars, gems, hats, boots, colours, tracks, each "found of
   all"), then a card with a bar for each of: hats and boots, coat colours, photos in the album, errands, friends, creatures met, minigame
   stars, the gym (levels trained), and the university (levels, degrees and notebook entries). A district whose row is complete is marked.
   THE MAP (townShowMap wrapper): each stop on the tram line shows who is there right now (townNpcNow, from 44zzk), which of them has an errand
   waiting, and how many things are still to find; below it is "Who is where" for every giraffe with what each is doing, and the places
   off the tram line (the Runway, the farm, the isle, the university) with their finds.
   ============================================================================================================================= */
(function(){
  const TYPES = [['coin', 'Coins'], ['star', 'Stars'], ['gem', 'Gems'], ['hat', 'Hats'], ['boot', 'Boots'], ['swatch', 'Colours'], ['track', 'Tracks']];
  const OFF_TRAM = ['runway', 'farm', 'isle', 'campus'];
  const safe = function(f, d){ try { return f(); } catch (e) { return d; } };
  const bar = function(a, m){ return '<span class="cb-bar"><i style="width:' + Math.round(100 * Math.min(1, a / Math.max(1, m))) + '%"></i></span>'; };
  const firstName = function(id){ const w = TOWN_NPCS[id].name.split(' '); return /\.$/.test(w[0]) && w[1] ? w[0] + ' ' + w[1] : w[0]; };

  function districtRows(){
    const ids = TOWN_IDS.concat(OFF_TRAM).filter(function(id, i, a){ return a.indexOf(id) === i && TOWN_DIST[id] && townItemsIn(id).length; });
    return ids.map(function(id){
      const D = TOWN_DIST[id], items = townItemsIn(id), open = safe(function(){ return D.open(); }, true), cells = {};
      TYPES.forEach(function(t){ const all = items.filter(function(it){ return it.t === t[0]; }); cells[t[0]] = { all: all.length, got: all.filter(function(it){ return townFound(it.id); }).length }; });
      const got = items.filter(function(it){ return townFound(it.id); }).length;
      return { id: id, name: D.name, open: open, cells: cells, got: got, all: items.length };
    });
  }
  function cards(){
    const c = [], md = safe(function(){ return miniData(); }, null);
    c.push(['Hats and boots', safe(accOwnedCount, 0), safe(function(){ return ACC_ITEMS.length; }, 0), 'worn on her head and feet']);
    c.push(['Coat colours', safe(function(){ return WARD_TOWN.filter(function(w){ return townFound(w[2]); }).length; }, 0), safe(function(){ return WARD_TOWN.length; }, 0), 'found around town and earned']);
    c.push(['Photos', safe(function(){ return photoAlbum().length; }, 0), safe(function(){ return PHOTO_ALBUM_MAX; }, 0), 'in the album']);
    c.push(['Errands', safe(function(){ return TOWN_ERRANDS.filter(function(e){ return townErrState(e.id) === 2; }).length; }, 0), TOWN_ERRANDS.length, 'finished for the herd']);
    c.push(['Friends', safe(function(){ return TOWN_NPC_LIST.filter(function(i){ return townBondLevel(i) >= 3; }).length; }, 0), TOWN_NPC_LIST.length, 'best friends (gifts raise it)']);
    c.push(['Creatures met', safe(function(){ const n = bestiaryCounts(); return n.creatures; }, 0), safe(function(){ return BESTIARY_TOTAL_CREATURES; }, 0), 'in the bestiary']);
    c.push(['Minigame stars', safe(miniStarTotal, 0), 39, 'from the chapter minigames']);
    if (typeof GYM_SKILLS !== 'undefined') c.push(['The gym', safe(gymTotal, 0), GYM_SKILLS.length * GYM_MAX, 'levels trained · ' + safe(function(){ return GYM_RANKS[gymRankIndex()].n; }, '')]);
    if (typeof UNI_FAC !== 'undefined'){
      c.push(['The university', safe(uniTotal, 0), UNI_FAC.length * UNI_MAX, 'levels studied · ' + safe(function(){ return UNI_RANKS[uniRankIndex()].n; }, '')]);
      c.push(['Degrees', safe(function(){ let n = 0; UNI_FAC.forEach(function(F){ n += uniData().deg[F.id] | 0; }); return n; }, 0), UNI_FAC.length * 3, 'Bachelor, Master, Doctorate']);
      c.push(['Notebook', safe(function(){ return Object.keys(uniData().facts).length; }, 0), UNI_BOOKS.length + UNI_LECTURES.length, 'facts from books and lectures']);
    }
    return c;
  }
  function tabs(on){
    const list = [['errands', 'Errands'], ['finds', 'Finds'], ['friends', 'Friends'], ['tracks', 'Tracks'], ['gear', 'Gear'], ['study', 'Study'], ['book', 'Book']];
    return '<div class="jtabs">' + list.map(function(x){ return '<button class="jtab' + (x[0] === on ? ' on' : '') + '" data-a="town-jt-' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  window.townShowBook = function(){
    const rows = districtRows(), cs = cards();
    let got = 0, all = 0; rows.forEach(function(r){ got += r.got; all += r.all; }); cs.forEach(function(k){ got += k[1]; all += k[2]; });
    let h = tabs('book') + '<div class="jpage cbpage"><p class="jh">The collection: ' + got + ' of ' + all + '</p>' + bar(got, all);
    h += '<table class="cbtab"><thead><tr><th>Place</th>' + TYPES.map(function(t){ return '<th>' + t[1] + '</th>'; }).join('') + '<th>All</th></tr></thead><tbody>';
    rows.forEach(function(r){
      h += '<tr class="' + (r.open ? '' : 'off ') + (r.got === r.all ? 'done' : '') + '"><td>' + r.name + '</td>' + TYPES.map(function(t){
        const c = r.cells[t[0]]; return '<td' + (c.all && c.got === c.all ? ' class="ok"' : '') + '>' + (c.all ? c.got + '/' + c.all : '·') + '</td>'; }).join('') + '<td>' + (r.open ? (r.got === r.all ? '&#10003;' : r.got + '/' + r.all) : 'closed') + '</td></tr>';
    });
    h += '</tbody></table><div class="cbcards">';
    cs.forEach(function(k){ h += '<div class="cbc' + (k[1] >= k[2] && k[2] ? ' done' : '') + '"><b>' + k[0] + '</b><span>' + k[1] + ' / ' + k[2] + '</span>' + bar(k[1], k[2]) + '<small>' + k[3] + '</small></div>'; });
    h += '</div></div>';
    townPanelT('journal', h, { w: 760 });
  };

  /* ---- the journal: a Book tab on every page of it ---- */
  const addTab = function(){
    const t = document.querySelector('.tp-journal .jtabs'); if (!t || t.querySelector('[data-a="town-jt-book"]')) return;
    const b = document.createElement('button'); b.className = 'jtab'; b.setAttribute('data-a', 'town-jt-book'); b.textContent = 'Book'; t.appendChild(b);
  };
  const tj = townShowJournal, tg = typeof townShowGear === 'function' ? townShowGear : null, tm = townShowMenu, hta = handleTownAction;
  townShowJournal = function(tab){ if (tab === 'book'){ townShowBook(); return; } tj.apply(this, arguments); addTab(); };
  if (tg) townShowGear = function(){ tg.apply(this, arguments); addTab(); };
  townShowMenu = function(){ tm.apply(this, arguments); const p = document.querySelector('.tp-menu .planks'), j = p && p.querySelector('[data-a="town-journal"]'); if (j && !p.querySelector('[data-a="town-book"]')){ const b = document.createElement('button'); b.className = 'plank'; b.setAttribute('data-a', 'town-book'); b.textContent = 'Collection'; j.after(b); } };
  handleTownAction = function(a){
    if (a === 'town-jt-book' || a === 'town-book'){ SFX.click(); townShowBook(); return true; }
    return hta(a);
  };

  /* ---- the tram map ---- */
  const sm = townShowMap;
  townShowMap = function(){
    sm.apply(this, arguments);
    const panel = document.querySelector('.tp-map'); if (!panel) return;
    const here = {}, errand = {};
    TOWN_NPC_LIST.forEach(function(id){
      const n = safe(function(){ return townNpcNow(id); }, null); if (!n) return;
      (here[n.d] = here[n.d] || []).push(id);
      const e = safe(function(){ return townErrandFor(id); }, null);
      if (e && townErrandAvailable(e) && townErrState(e.id) < 2) errand[id] = townErrState(e.id) === 1 ? 'doing' : 'new';
    });
    panel.querySelectorAll('.stn').forEach(function(btn){
      const m = /town-go-(\w+)/.exec(btn.getAttribute('data-a') || ''); if (!m) return; const id = m[1];
      const ids = here[id] || [], left = safe(function(){ return townItemsIn(id).length - townFoundIn(id); }, 0);
      const bd = document.createElement('span'); bd.className = 'sbd';
      bd.innerHTML = ids.map(function(g){ return '<i class="gd' + (errand[g] === 'new' ? ' ask' : errand[g] === 'doing' ? ' busy' : '') + '" title="' + TOWN_NPCS[g].name + (errand[g] === 'new' ? ' has an errand' : '') + '" style="background:' + TOWN_NPCS[g].look.coat + '"></i>'; }).join('') + (left > 0 && TOWN_DIST[id].open() ? '<em title="things still to find">&#9733;' + left + '</em>' : '');
      (btn.querySelector('.ss') || btn).appendChild(bd);
    });
    let h = '<div class="mapx"><h4>Who is where right now</h4><div class="whos">', shown = 0;
    TOWN_NPC_LIST.slice().sort(function(a, b){ const ia = TOWN_DIST[(townNpcNow(a) || {}).d] && TOWN_DIST[(townNpcNow(a) || {}).d].indoor ? 1 : 0, ib = TOWN_DIST[(townNpcNow(b) || {}).d] && TOWN_DIST[(townNpcNow(b) || {}).d].indoor ? 1 : 0; return ia - ib; }).forEach(function(id){
      const n = safe(function(){ return townNpcNow(id); }, null); if (!n) return;
      if (TOWN_DIST[n.d] && TOWN_DIST[n.d].indoor && !shown++) h += '</div><h4>Indoors</h4><div class="whos">';
      const D = TOWN_DIST[n.d], open = D && D.open(), hat = errand[id];
      h += '<div class="who"><i class="gd" style="background:' + TOWN_NPCS[id].look.coat + '"></i><b>' + firstName(id) + '</b><span>' + (D ? D.name : 'somewhere') + (n.act ? ' · ' + n.act : '') + '</span>' + (hat ? '<em class="' + hat + '">' + (hat === 'new' ? 'errand' : 'on it') + '</em>' : '') +
        (open && n.d !== Town.d && D && !D.indoor ? '<button class="btn sm" data-a="town-go-' + n.d + '">Go</button>' : '') + '</div>';
    });
    h += '</div>';
    const off = OFF_TRAM.filter(function(id){ return TOWN_ORDER.indexOf(id) < 0 && TOWN_DIST[id] && townItemsIn(id).length; });
    if (off.length){
      h += '<h4>Off the tram line</h4><div class="whos">';
      off.forEach(function(id){ const D = TOWN_DIST[id], open = safe(function(){ return D.open(); }, false), all = townItemsIn(id).length, got = townFoundIn(id);
        h += '<div class="who"><b>' + D.name + '</b><span>' + (open ? got + ' of ' + all + ' found' : 'opens after: ' + D.need) + '</span></div>'; });
      h += '</div>';
    }
    h += '<p class="tnote">The coloured dots are giraffes; a ringed one has an errand for you.</p></div>';
    const foot = panel.querySelector('.tp-foot'); const div = document.createElement('div'); div.innerHTML = h; panel.insertBefore(div.firstChild, foot);
  };
})();
