'use strict';
/* The main menu, tidied: a top strip (gold and gems on the left; Guide, Add-ons and Settings on the right), the buttons in named groups with a small picture each,
   chapter dots that say what they are and can be pressed, a "latest chapter" button, friendlier lines on a new save, and the world behind the menu in the chosen
   chapter's ground and weather. Everything here works on the menu the earlier files have already built (showMenu is wrapped last), so a button another file adds
   still turns up: one this file does not know simply stays in the column it was put in. */
const MENU_ICONS = { shop: '@t-coin', venus: '@t-x-sulfur', mars: '@t-x-rover', lab: '@t-flask-2', 'fusion-menu': '@t-x-fusion', 'town-enter': '@t-x-cottage', 'co-open': '@t-x-herd',
  bestiary: '@t-x-book', forage: '@t-apple', 'mini-menu': '@t-x-crosshair', gallery: '@t-eye', wardrobe: '@t-x-skin', 'ach-open': '@t-x-medal', help: '@t-x-help', addons: '@t-x-box', settings: '@t-x-cog' };
/* the groups, in order; `side` is the column on a wide screen ('' = whichever column is shorter) */
const MENU_GROUPS = [
  { id: 'shops', name: 'Shops and outposts', side: 'l', has: ['shop', 'venus', 'mars', 'lab', 'fusion-menu'] },
  { id: 'places', name: 'Places', side: 'l', has: ['town-enter', 'co-open'] },
  { id: 'play', name: 'Things to do', side: '', has: ['forage', 'mini-menu'] },
  { id: 'books', name: 'Collections', side: 'r', has: ['bestiary', 'gallery', 'wardrobe', 'ach-open'] }
];
const MENU_UTILS = ['help', 'addons', 'settings'];
/* what a button says while its count is still nothing (a new save is not a wall of zeros) */
const MENU_INVITES = { shop: 'Gold from your runs is spent here', lab: 'Mutations to discover', 'town-enter': 'Take a walk around town', bestiary: 'Fills in as you meet creatures and cards',
  'mini-menu': 'Hats and boots to win', wardrobe: 'New coats come with each chapter', 'ach-open': 'Trophies pay out gems' };

function menuLatestChapter(){ let n = 1; for (let i = 1; i <= TOTAL_CHAPTERS; i++) if (chapterUnlocked(i)) n = i; return n; }
function menuChapterDone(ch){ return !!(Save.data && Save.data['chapter' + ch + 'Complete']); }
function menuWalletHTML(){
  const d = Save.data || {};
  return '<div class="mwallet" title="Gold is banked from your runs; gems come from trophies, bosses and minigames">' +
    '<span class="mw gold">' + ico('@t-coin') + '<b>' + fmt(d.gold || 0) + '</b><small>gold</small></span>' +
    '<span class="mw gems">' + ico('@t-x-gem', '#8FE3FF') + '<b>' + fmt(d.gems || 0) + '</b><small>gems</small></span></div>';
}
/* the top strip, the groups and the pictures */
function menuTidy(root){
  const panel = root.querySelector('.panel.menu2'); if (!panel || panel.querySelector('.mtop')) return;
  const L = panel.querySelector('.mside.l'), R = panel.querySelector('.mside.r'), wrap = panel.querySelector('.chwrap'); if (!L || !R || !wrap) return;
  const btn = function(a){ return panel.querySelector('.mside [data-a="' + a + '"]'); };
  panel.querySelectorAll('.mside .btn[data-a]').forEach(function(b){
    const a = b.getAttribute('data-a'), ic = MENU_ICONS[a], sm = b.querySelector('small');
    if (sm && MENU_INVITES[a] && /^0 (of|gold)\b/.test(sm.textContent.trim())) sm.textContent = MENU_INVITES[a];
    if (ic && !b.querySelector('.mbi')){ b.classList.add('hasic'); b.insertAdjacentHTML('afterbegin', '<span class="mbi">' + ico(ic) + '</span>'); }
  });
  /* the strip */
  const top = document.createElement('div'); top.className = 'mtop'; top.innerHTML = menuWalletHTML() + '<div class="mutils"></div>';
  panel.insertBefore(top, panel.firstChild);
  MENU_UTILS.forEach(function(a){ const b = btn(a); if (b){ b.classList.add('mutil'); b.setAttribute('aria-label', b.firstChild && b.childNodes[1] ? b.childNodes[1].textContent : a); b.title = b.getAttribute('aria-label'); top.lastChild.appendChild(b); } });
  /* a saved run to pick up sits above the chapter picture */
  const cont = panel.querySelector(':scope > [data-a="continue"]'); if (cont){ cont.classList.add('mcont'); wrap.insertBefore(cont, wrap.firstChild); }
  /* the groups */
  const made = [];
  MENU_GROUPS.forEach(function(g){
    const bs = g.has.map(btn).filter(Boolean); if (!bs.length) return;
    const box = document.createElement('div'); box.className = 'mgroup mg-' + g.id; box.innerHTML = '<div class="mghead">' + g.name + '</div>';
    bs.forEach(function(b){ box.appendChild(b); }); made.push({ g: g, box: box, n: bs.length });
  });
  const count = function(col){ return col.querySelectorAll('.btn').length; };
  made.forEach(function(m){ if (m.g.side) (m.g.side === 'l' ? L : R).appendChild(m.box); });
  made.forEach(function(m){ if (!m.g.side) (count(L) <= count(R) ? L : R).appendChild(m.box); });
  /* anything left over (a button from a file this one does not know) goes under the groups, in a group of its own */
  [L, R].forEach(function(col){
    const rest = [].slice.call(col.children).filter(function(c){ return !c.classList.contains('mgroup'); }); if (!rest.length) return;
    const box = document.createElement('div'); box.className = 'mgroup mg-more'; box.innerHTML = '<div class="mghead">More</div>'; rest.forEach(function(b){ box.appendChild(b); }); col.appendChild(box);
  });
}
/* the dots under the chapter's name: cleared, open or locked, each with its name, and a press goes to that chapter */
function menuDots(root){
  const dots = root.querySelectorAll('.menu2 .chdots .chdot');
  for (let i = 0; i < dots.length; i++){
    const ch = i + 1, d = dots[i], info = CHAPTER_INFO[i], open = chapterUnlocked(ch), done = open && menuChapterDone(ch);
    if (done) d.classList.add('done');
    d.setAttribute('data-a', 'ch-go-' + ch); d.setAttribute('role', 'button');
    d.title = 'Chapter ' + chapterLabel(ch) + (info ? ' · ' + info.name : '') + (done ? ' (cleared)' : open ? '' : ' (locked)');
    d.setAttribute('aria-label', d.title);
  }
  const key = root.querySelector('.menu2 .chdots');
  if (key && !root.querySelector('.menu2 .chkey')){
    let nd = 0, no = 0; for (let c = 1; c <= TOTAL_CHAPTERS; c++){ if (chapterUnlocked(c)){ no++; if (menuChapterDone(c)) nd++; } }
    key.insertAdjacentHTML('afterend', '<p class="chkey">' + (nd ? nd + ' of ' + TOTAL_CHAPTERS + ' chapters cleared' : no > 1 ? no + ' of ' + TOTAL_CHAPTERS + ' chapters open' : TOTAL_CHAPTERS + ' chapters, one at a time') + '</p>');
  }
}
/* one press to the furthest chapter she has reached (only shown when the picture is on another one) */
function menuLatestButton(root){
  const go = root.querySelector('.menu2 .chgo'); if (!go || root.querySelector('[data-a="ch-latest"]')) return;
  const far = menuLatestChapter(); if (far <= 1 || far === menuChapter()) return;
  const info = CHAPTER_INFO[far - 1];
  go.insertAdjacentHTML('afterend', '<button class="btn ghost mlatest" data-a="ch-latest">' + ico('@t-run') + ' Latest chapter<small>Start Chapter ' + chapterLabel(far) + (info ? ' · ' + info.name : '') + ', the furthest you have reached</small></button>');
}
/* ---- the world behind the menu: the chosen chapter's ground and weather, with her walking about in it ---- */
const MENU_WORLD_PLAIN = { savanna: 1, snow: 1, swamp: 1, ocean: 1, jungle: 1, city: 1, space: 1, moon: 1, venus: 1, area51: 1, mars: 1, dome: 1, tower: 1, siege: 1, fort: 1, isle: 1 };
function menuWorldBiome(){
  const ch = menuChapter(), info = CHAPTER_INFO[ch - 1];
  if (!info || !chapterUnlocked(ch)) return 'savanna';                    /* a locked chapter is not shown off behind the menu */
  return MENU_WORLD_PLAIN[info.biome] ? info.biome : info.biome === 'sky' ? 'ocean' : 'savanna';
}
function menuWorldSync(){
  if (!G.attract || G.state !== 'menu' || G.splash) return;
  const want = menuWorldBiome(); if (G.biome === want) return;
  G.biome = want; G.buildings = []; G.rocket = null;
  G.enemies.length = 0;
  try { buildDecor(); if (typeof SCEN !== 'undefined') SCEN.ch = 0; } catch (e) {}
}
(function(){
  const sm = showMenu;
  showMenu = function(){
    const r = sm.apply(this, arguments);
    if (G.state === 'menu' && typeof OV !== 'undefined' && OV.querySelector('.menu2')){
      try { menuTidy(OV); menuDots(OV); menuLatestButton(OV); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
      try { menuWorldSync(); } catch (e2) {}
    }
    return r;
  };
  const ha = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('ch-go-') === 0){
      const n = +a.slice(6); if (n >= 1 && n <= TOTAL_CHAPTERS && n !== menuChapter()){ SFX.click(); setMenuChapter(n); showMenu(); }
      return;
    }
    if (a === 'ch-latest'){ const far = menuLatestChapter(); setMenuChapter(far); return ha.call(this, far === 1 ? 'play' : 'play' + far); }
    return ha.apply(this, arguments);
  };
})();
