'use strict';
/* =============================================================================================================================
   44zzk-town-routines.js  --  THE HERD HAS A DAY. The street giraffes no longer stand where they were put for ever: each has a timetable
   (TOWN_ROUTINES) of slots { h1, h2, d, x, habit, act }: from hour h1 to h2 (a day is 24 game hours, 12 minutes of play) she is in district d,
   near x, doing habit (stroll, stand, sit, dance, fish, tinker, stargaze) because of act ("having lunch").
   Nights are spent at home (each one's own district, where the night lines and the night errands expect them).
   What it does:
     townSpawnNpcs (wrapper)  who is here when she walks in: the ones whose slot is this district, at their slot's x
     updateTown (wrapper)     every second, a giraffe whose slot has just changed walks to the edge and leaves ("Penny heads for the Square"),
                              and one whose new slot is here walks in from the side she came from
     townNpcStep (wrapper)    the walk itself, and the habit of the slot in place of the giraffe's usual one
   townNpcNow(id) says where a giraffe is right now ({ d, x, act, habit }); the tram map and the collection book use it.
   Only the ten street giraffes and Dot keep to this; the people who work indoors (and the campus) stay put.
   ============================================================================================================================= */
const TOWN_ROUTINES = {
  mayor:    [[6, 9, 'square', 1000, 'stroll', 'taking the morning air'], [9, 12, 'market', 1500, 'stand', 'inspecting the stalls'], [12, 16, 'park', 1750, 'stroll', 'a turn round the park'], [16, 22, 'square', 1000, 'stroll', 'doing the rounds']],
  tilly:    [[6, 10, 'square', 560, 'stand', 'minding the shop'], [10, 13, 'park', 900, 'sit', 'sketching on a bench'], [13, 22, 'square', 560, 'stand', 'minding the shop']],
  barnaby:  [[6, 9, 'market', 800, 'stroll', 'on his rounds'], [9, 12, 'square', 1500, 'stroll', 'looking for a good book'], [12, 15, 'park', 1300, 'sit', 'reading on a bench'], [15, 22, 'market', 800, 'stroll', 'on his rounds']],
  penny:    [[6, 11, 'market', 1260, 'stand', 'opening the café'], [11, 13, 'square', 1700, 'sit', 'having lunch'], [13, 22, 'market', 1260, 'stand', 'serving customers']],
  rio:      [[6, 10, 'park', 2000, 'stand', 'watching the pond'], [10, 14, 'harbour', 1400, 'sit', 'by the water'], [14, 22, 'park', 2000, 'stand', 'watching the pond']],
  gus:      [[6, 10, 'market', 1000, 'stroll', 'a morning jog'], [10, 17, 'park', 700, 'dance', 'dancing'], [17, 22, 'square', 700, 'dance', 'dancing under the lamps']],
  marina:   [[6, 16, 'harbour', 1010, 'fish', 'fishing off the pier'], [16, 19, 'market', 2000, 'stroll', 'selling the catch'], [19, 22, 'harbour', 1010, 'fish', 'an evening line']],
  skye:     [[6, 11, 'roofs', 1020, 'tinker', 'tinkering'], [11, 14, 'park', 2300, 'stroll', 'hunting for spare parts'], [14, 22, 'roofs', 1020, 'tinker', 'tinkering']],
  nova:     [[6, 18, 'launch', 1380, 'stargaze', 'watching for rockets'], [18, 22, 'roofs', 600, 'stargaze', 'waiting for the stars']]
};
function townNpcSlot(id, h){
  const R = TOWN_ROUTINES[id], d = TOWN_NPCS[id]; if (!R || !d) return null;
  h = ((h % 24) + 24) % 24;
  if (h >= 22 || h < 6) return { d: d.d, x: d.x, habit: d.habit, act: 'at home for the night', night: true };
  for (let i = 0; i < R.length; i++){
    const s = R[i]; if (h >= s[0] && h < s[1]){
      if (!townOpen(s[2])) break;                                                  /* a place that is shut: she stays home */
      return { d: s[2], x: s[3], habit: s[4], act: s[5], night: false, i: i };
    }
  }
  return { d: d.d, x: d.x, habit: d.habit, act: 'about town', night: false };
}
function townNpcNow(id){
  if (id === 'dot'){ const dt = typeof townDotSpot === 'function' ? townDotSpot() : null; return dt ? { d: dt.d, x: dt.x, habit: 'hide', act: 'hiding' } : null; }
  return townNpcSlot(id, townHour()) || (TOWN_NPCS[id] ? { d: TOWN_NPCS[id].d, x: TOWN_NPCS[id].x, habit: TOWN_NPCS[id].habit, act: '' } : null);
}
(function(){
  const ts = townSpawnNpcs, un = townNpcStep;
  const dress = function(n, slot){                                                  /* this slot's habit and range, on top of the giraffe's own look and lines */
    const base = TOWN_NPCS[n.id]; n.def = Object.create(base); n.def.habit = slot.habit; n.def.range = slot.habit === 'stroll' ? Math.max(60, base.range || 80) : base.range;
    n.home = slot.x; n.tx = slot.x; n.slot = slot.i === undefined ? -1 : slot.i; n.act = slot.act;
  };
  townSpawnNpcs = function(){
    ts();
    const here = Town.d, h = townHour();
    Town.npcs = Town.npcs.filter(function(n){
      const R = TOWN_ROUTINES[n.id]; if (!R) return true;
      const s = townNpcSlot(n.id, h); return s && s.d === here;
    });
    Object.keys(TOWN_ROUTINES).forEach(function(id){
      const s = townNpcSlot(id, h); if (!s || s.d !== here) return;
      let n = Town.npcs.filter(function(q){ return q.id === id; })[0];
      if (!n){ const def = TOWN_NPCS[id]; n = { id: id, def: def, x: s.x, home: s.x, dir: Math.random() < 0.5 ? 1 : -1, ph: 0, t: Math.random() * 9, tx: s.x, wait: Math.random() * 3, moving: false, reach: 0, seed: townHash(id) % 97 }; Town.npcs.push(n); }
      n.x = s.x; dress(n, s);
    });
  };
  townNpcStep = function(n, dt){
    if (n.walkTo !== undefined){                                                   /* walking in from, or out to, the edge */
      if (Town.talkNpc === n.id){ n.moving = false; return; }
      const dx = n.walkTo - n.x;
      if (Math.abs(dx) > 5){ n.dir = dx > 0 ? 1 : -1; n.x += n.dir * 44 * dt; n.moving = true; n.ph += dt * 6; n.bob = 0; n.sit = false; n.reach += (0 - n.reach) * Math.min(1, dt * 3); return; }
      n.moving = false; n.walkTo = undefined;
      if (n.leaving){ n.gone = true; return; }
    }
    return un(n, dt);
  };
  const ut = updateTown; let acc = 0;
  updateTown = function(dt, frozen){
    const r = ut.call(this, dt, frozen);
    if (!Town.on || G.state !== 'town') return r;
    acc += dt; if (acc < 1) return r; acc = 0;
    const D = TOWN_DIST[Town.d], h = townHour();
    if (D.indoor || D.cave) return r;
    /* the ones who have gone */
    Town.npcs = Town.npcs.filter(function(n){ return !n.gone; });
    Object.keys(TOWN_ROUTINES).forEach(function(id){
      const s = townNpcSlot(id, h); if (!s) return;
      const n = Town.npcs.filter(function(q){ return q.id === id; })[0], nm = TOWN_NPCS[id].name.split(' ')[0];
      if (n && !n.leaving && s.d !== Town.d){                                      /* her slot has moved on: off to the edge she will leave by */
        const toRight = TOWN_ORDER.indexOf(s.d) > TOWN_ORDER.indexOf(Town.d);
        n.leaving = true; n.walkTo = toRight ? D.w - 20 : 20; n.tx = n.walkTo;
        if (Math.abs(Town.x - n.x) < 600) townToast(nm + ' heads off, ' + s.act + '.', '#E8D8B0');
      } else if (n && !n.leaving && s.d === Town.d && n.slot !== (s.i === undefined ? -1 : s.i)){   /* same place, a new thing to do */
        dress(n, s); if (s.habit !== 'stroll') n.walkTo = s.x;
      } else if (!n && s.d === Town.d && !s.night){                                 /* she arrives, from the side she was on */
        const prevD = (function(){ const p = townNpcSlot(id, h - 1.5); return p ? p.d : Town.d; })();
        const fromLeft = TOWN_ORDER.indexOf(prevD) < TOWN_ORDER.indexOf(Town.d);
        const def = TOWN_NPCS[id], q = { id: id, def: def, x: fromLeft ? 20 : D.w - 20, home: s.x, dir: fromLeft ? 1 : -1, ph: 0, t: Math.random() * 9, tx: s.x, wait: 2, moving: true, reach: 0, seed: townHash(id) % 97 };
        dress(q, s); q.walkTo = s.x; Town.npcs.push(q);
      }
    });
    return r;
  };
})();
