'use strict';
/* The Bait & Tackle shack, with an inside: three stations where she can see every rod, line and bait, and take the ones she has earned. */
/* ========================= 44zzw. THE TACKLE SHOP ========================= */
/* The shack on the Harbour street gets a door into a room (in_tackle, under the Harbour like the other rooms): a rod rack, a wall of line reels and a bait
   tank. Each station opens a page that lists every piece of that kind, what it does, and whether she can take it: "Take it" puts it on (the same save
   as the buttons in the fishing panel: town.tackle), "In use" marks the one she has, and a locked piece says how many more kinds of fish it needs.
   Nothing is bought: tackle is free and unlocked by the number of kinds caught (js/44zzv-fishing.js).
   The gear bench is the fourth station: the fish scales every catch leaves (town.scales; 1, 2, 5 or 12 by rarity) pay for gear levels. A piece she owns
   goes up one level (the same level a duplicate from a crate gives, up to 5) for BENCH_COST[level - 1] scales: the way to level gear that fishing, not luck, decides. */
const BENCH_COST = [10, 22, 40, 65];
TOWN_ROOM.tackle = { wall: '#DCE4E0', wains: '#4A6A5A', stripe: 'rgba(60,110,90,.1)', floor: '#8A7048', beam: '#4A3A28' };
const TK_STATIONS = {
  rod:  { act: 'tk-rod', list: FISH_RODS, title: 'THE ROD RACK', blurb: 'A longer, springier rod makes the sweet spot on the reeling bar bigger, so a bite is easier to land.',
    says: ['The one everybody starts with.', 'The sweet spot is 15% bigger.', 'The sweet spot is 40% bigger. It hangs behind the counter with a little rope round it.'] },
  line: { act: 'tk-line', list: FISH_LINES, title: 'THE LINE WALL', blurb: 'Stronger line gives her longer to reel a fish in before it gets away.',
    says: ['Thin and quick. Gives you 5.5 seconds.', 'Braided: gives you 7.5 seconds.', 'A deep-sea reel: 10 seconds, but it winds a little slower.'] },
  bait: { act: 'tk-bait', list: FISH_BAITS, title: 'THE BAIT TANK', blurb: 'Better bait brings in the uncommon, rare and legendary fish more often. It never runs out.',
    says: ['Just a hook. You get what you get.', 'More uncommon, rare and legendary fish.', 'Glows in the dark water: far more rare and legendary fish.'] }
};
function tackleHTML(kind){
  const S = TK_STATIONS[kind], k = fishTackle(), kinds = fishKinds(), cur = k.k[kind] | 0;
  const rows = S.list.map(function(it, i){
    const open = fishUnlocked(S.list, i), on = i === cur;
    const btn = on ? '<button class="chalk" disabled>In use</button>' : open ? '<button class="chalk" data-a="tk-take-' + kind + '-' + i + '">Take it</button>' : '<button class="chalk" disabled>' + (it.need - kinds) + ' more kind' + (it.need - kinds === 1 ? '' : 's') + '</button>';
    return '<div class="tkrow' + (on ? ' on' : open ? '' : ' lock') + '"><b>' + it.n + '</b><span>' + (open || on ? S.says[i] : 'Needs ' + it.need + ' kinds of fish caught. You have ' + kinds + '.') + '</span>' + btn + '</div>';
  }).join('');
  return '<div class="tp-title">' + S.title + '</div><p class="bp">' + S.blurb + '</p><div class="tkrows">' + rows + '</div><p class="tnote">' + kinds + ' of ' + FISH.length + ' kinds caught · everything here is free</p>';
}
function benchPieces(){
  const out = []; Object.keys(GEAR_INDEX).forEach(function(id){ if (gearOwned(id) && GEAR_INDEX[id].name !== 'Bare Hooves') out.push(id); });
  return out.sort(function(a, b){ return gearLevel(a) - gearLevel(b) || (GEAR_INDEX[a].name < GEAR_INDEX[b].name ? -1 : 1); });
}
function benchHTML(){
  const have = fishScaleN(), ids = benchPieces();
  const rows = ids.map(function(id){
    const p = GEAR_INDEX[id], lv = gearLevel(id);
    if (lv >= GEAR_LV_MAX) return '<div class="tkrow on"><b>' + p.name + '</b><span>' + SLOT_LABEL[p.slot] + ' · level ' + lv + ' of ' + GEAR_LV_MAX + ': as good as it gets</span><button class="chalk" disabled>Done</button></div>';
    const cost = BENCH_COST[lv - 1], ok = have >= cost;
    return '<div class="tkrow' + (ok ? '' : ' lock') + '"><b>' + p.name + '</b><span>' + SLOT_LABEL[p.slot] + ' · level ' + lv + ' to ' + (lv + 1) + '</span><button class="chalk" data-a="tk-up-' + id.replace(':', '~') + '"' + (ok ? '' : ' disabled') + '>' + cost + ' scales</button></div>';
  }).join('');
  return '<div class="tp-title">THE GEAR BENCH</div><p class="bp">Every fish leaves scales (1 for a common one, up to 12 for a legendary). Here they raise a piece of your gear one level, the same as a duplicate from a crate.</p>' +
    '<div class="spec"><div><span>Scales</span><b>' + fmt(have) + '</b></div></div>' +
    '<div class="tkrows tkscroll">' + (rows || '<div class="tkrow lock"><b>No gear yet</b><span>Open crates to find capes, weapons and armor, then come back.</span></div>') + '</div>';
}
function townShowBench(){ townPanelT('fish', benchHTML(), { w: 560, back: 'Back to the shop' }); }
function benchUp(id){
  const p = GEAR_INDEX[id]; if (!p || !gearOwned(id)) return false;
  const lv = gearLevel(id), cost = BENCH_COST[lv - 1];
  if (lv >= GEAR_LV_MAX || !(cost > 0) || fishScaleN() < cost){ SFX.deny(); return false; }
  townData().scales = fishScaleN() - cost; gearLevelUp(id); SFX.buy(); SFX.level();
  townShowBench(); townToast(p.name + ' is now level ' + (lv + 1) + '.', '#BFFF9A'); return true;
}
function townShowTackle(kind){ townPanelT('fish', tackleHTML(kind), { w: 560, back: 'Back to the shop' }); }
function tackleTake(kind, i){
  const S = TK_STATIONS[kind]; if (!S || !(i >= 0 && i < S.list.length) || !fishUnlocked(S.list, i)){ SFX.deny(); return; }
  fishTackle().k[kind] = i; Save.write(); SFX.buy(); townShowTackle(kind); townToast(S.list[i].n + ' is on.', '#BFFF9A');
}
(function(){
  const door = [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }];
  townRoomDef('in_tackle', 'Bait & Tackle', 'tackle', 1300, 190, { b: door.concat([
      { id: 'rods', kind: 'tk_rods', x: 440, w: 210, h: 250, label: 'The rod rack', act: 'tk-rod' },
      { id: 'lines', kind: 'tk_lines', x: 720, w: 190, h: 230, label: 'The line wall', act: 'tk-line' },
      { id: 'tank', kind: 'tk_tank', x: 970, w: 200, h: 120, label: 'The bait tank', act: 'tk-bait' },
      { id: 'bench', kind: 'tk_bench', x: 1170, w: 190, h: 130, label: 'The gear bench', act: 'tk-bench' }]),
    p: [{ k: 'fr_barrels', x: 270 }], L: [{ x: 440, y: 80, r: 160 }, { x: 720, y: 80, r: 150 }, { x: 970, y: 80, r: 150 }, { x: 1170, y: 80, r: 150 }], npcs: [] });
  TOWN_IN_IDS.push('in_tackle'); TOWN_ROOM_PARENT.in_tackle = 'harbour';
  const b = TOWN_DIST.harbour.b.find(function(x){ return x.id === 'shack'; }); if (b){ b.to = 'in_tackle'; b.act = 'house'; }
  const labels = { 'tk-rod': 'Look at the rods', 'tk-line': 'Look at the lines', 'tk-bait': 'Look at the bait', 'tk-bench': 'Use the gear bench' };
  const tu = townUse, nr = townNearest, bx = townBuildingX, ha = handleAction;
  townUse = function(o){
    if (o.k === 'b'){ const m = /^tk-(rod|line|bait)$/.exec(o.b.act); if (m){ SFX.click(); townShowTackle(m[1]); return; } if (o.b.act === 'tk-bench'){ SFX.click(); townShowBench(); return; } }
    tu(o);
  };
  townNearest = function(D, inp){ const o = nr(D, inp); if (o && o.k === 'b' && labels[o.b.act]) o.label = labels[o.b.act]; return o; };
  townBuildingX = function(c, D, b, P, r){
    const f = TK_KINDS[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('tk-') === 0){
      const m = /^tk-take-(rod|line|bait)-(\d+)$/.exec(a);
      if (m){ tackleTake(m[1], +m[2]); return; }
      const u = /^tk-up-(.+)$/.exec(a); if (u){ benchUp(u[1].replace('~', ':')); return; }
    }
    return ha.apply(this, arguments);
  };
})();

/* ---- the painting: each station stands on the floor ---- */
const TK_KINDS = {
  tk_rods: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#5A3B22', x0, TG - h, W, h); tRect(c, '#7A5A32', x0 + 6, TG - h + 8, W - 12, h - 16); tRect(c, '#4A3018', x0, TG - 10, W, 10);
    tRect(c, '#3E2A18', x0 + 6, TG - 70, W - 12, 8); tRect(c, '#3E2A18', x0 + 6, TG - h + 38, W - 12, 8);
    const cols = ['#C9CDD9', '#E8C24A', '#8AB84A', '#D5352B', '#4DA0D8', '#B8864E'];
    for (let i = 0; i < 6; i++){
      const bx = x0 + 22 + i * ((W - 44) / 5), top = TG - h + 14 + (i % 2) * 10;
      ivLine(c, cols[i], 3, bx, TG - 28, bx + 6, top);
      tCircle(c, '#3A3A44', bx + 1, TG - 46, 6); tCircle(c, '#9AA0AA', bx + 1, TG - 46, 3);
      tRound(c, '#2A2A30', bx - 4, TG - 34, 10, 22, 3);
    }
  },
  tk_lines: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#5A3B22', x0, TG - h, W, h); tRect(c, '#C9A27A', x0 + 8, TG - h + 8, W - 16, h - 16); tRect(c, '#4A3018', x0, TG - 10, W, 10);
    for (let r = 0; r < 3; r++){
      const y = TG - h + 30 + r * 66; tRect(c, '#6A4A28', x0 + 8, y + 40, W - 16, 6);
      for (let k = 0; k < 3; k++){
        const sx = x0 + 34 + k * ((W - 68) / 2), col = ['#E8E8F0', '#E8C24A', '#4DA0D8', '#8AB84A', '#D5352B', '#B8864E'][(r * 3 + k) % 6];
        tRound(c, '#3A3A44', sx - 14, y, 28, 40, 4); tRound(c, col, sx - 10, y + 5, 20, 30, 3); tRect(c, 'rgba(255,255,255,.3)', sx - 8, y + 8, 4, 22); tCircle(c, '#9AA0AA', sx, y + 20, 3);
      }
    }
  },
  tk_tank: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, h = b.h;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#4A6A5A', x0, TG - 72, W, 72); tRect(c, 'rgba(0,0,0,.16)', x0 + 10, TG - 60, W - 20, 48); tRect(c, '#2F4A3E', x0, TG - 10, W, 10);
    tRect(c, '#C9CDD9', x0 - 6, TG - 80, W + 12, 10);
    tRect(c, '#2A5A7A', x0 + 8, TG - h - 10, W - 16, h - 60); tRect(c, '#3E86B0', x0 + 8, TG - h + 6, W - 16, h - 76);
    tRect(c, 'rgba(255,255,255,.35)', x0 + 14, TG - h + 8, 6, h - 80); tRect(c, '#C9CDD9', x0 + 4, TG - h - 14, W - 8, 6);
    for (let i = 0; i < 6; i++){ const sx = x0 + 28 + i * 28, sy = TG - 100 - (i % 3) * 8; tEll(c, '#F2A08A', sx, sy, 9, 4); tPoly(c, '#F2A08A', [sx + 8, sy, sx + 15, sy - 4, sx + 15, sy + 4]); tCircle(c, '#2A2A30', sx - 5, sy - 1, 1); }
    tCircle(c, 'rgba(255,255,255,.45)', x0 + W - 30, TG - 112, 3); tCircle(c, 'rgba(255,255,255,.45)', x0 + W - 24, TG - 128, 2);
  }
};
TK_KINDS.tk_bench = function(c, D, b){
  const x0 = b.x - b.w / 2, W = b.w;
  ivShadow(c, b.x, W + 20);
  tRect(c, '#6A4A28', x0 + 8, TG - 70, 10, 70); tRect(c, '#6A4A28', x0 + W - 18, TG - 70, 10, 70); tRect(c, '#4A3018', x0 + 8, TG - 36, W - 16, 6);
  tRound(c, '#A8794A', x0, TG - 84, W, 16, 4); tRect(c, 'rgba(255,255,255,.18)', x0 + 4, TG - 82, W - 8, 3);
  tRect(c, '#9AA0AA', x0 + 20, TG - 96, 30, 12); tRect(c, '#6A6F78', x0 + 24, TG - 112, 6, 16); tRect(c, '#C9CDD9', x0 + 20, TG - 116, 22, 5);
  tRound(c, '#E8E8F0', x0 + 70, TG - 98, 36, 14, 6); tEll(c, '#9FD8F2', x0 + 130, TG - 92, 14, 8); tEll(c, '#C9E8D0', x0 + 150, TG - 90, 10, 6); tEll(c, '#F2C4A0', x0 + 140, TG - 98, 8, 5);
};
IV_ROOMS.tackle = function(c, D, K){
  /* a net on the beam with floats, a big fish on a board, a life ring on a hook, and a tide clock */
  ivLine(c, '#4A3018', 3, 150, 34, 330, 34);
  c.strokeStyle = '#B8A070'; c.lineWidth = 1.4; for (let i = 0; i <= 9; i++){ c.beginPath(); c.moveTo(150 + i * 20, 34); c.quadraticCurveTo(150 + i * 20, 90, 160 + i * 18, 150); c.stroke(); } for (let j = 0; j < 4; j++){ c.beginPath(); c.moveTo(152, 56 + j * 22); c.quadraticCurveTo(240, 76 + j * 22, 326, 56 + j * 22); c.stroke(); }
  tCircle(c, '#D5352B', 164, 154, 7); tCircle(c, '#F4F1E8', 240, 160, 7); tCircle(c, '#D5352B', 316, 154, 7);
  ivBoard(c, 585, 62, 165, 70, '#A8734A', '#5A3B22'); tEll(c, '#9FB8D0', 660, 98, 52, 16); tPoly(c, '#7A9AB8', [708, 98, 736, 82, 736, 114]); tCircle(c, '#FFFFFF', 630, 94, 4.5); tCircle(c, '#2A2A30', 630, 94, 2.2); ivText(c, 'BIGGEST CATCH', 667, 124, 9, '#F4E3C0');
  ivLine(c, '#2A2A30', 2, 900, 34, 900, 60); tCircle(c, '#D5352B', 900, 100, 38); tCircle(c, '#F4F1E8', 900, 100, 26); tCircle(c, '#D5352B', 900, 100, 14); tCircle(c, '#F4F1E8', 900, 100, 6);
  ivLine(c, '#6A6F78', 3, 1040, 44, 1040, 130); tCircle(c, '#F4F1E8', 1040, 140, 24); ivLine(c, '#2A2A30', 2.4, 1040, 140, 1040, 124); ivLine(c, '#2A2A30', 2.4, 1040, 140, 1052, 146);
};
