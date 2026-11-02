'use strict';
/* ========================= 44zzzzb. TWO THINGS IN REACH ========================= */
/* Where things stand close together (a door and the person in front of it, two machines, a table and the jukebox) only the nearest
   used to get a prompt. Now the next one in reach gets a second prompt beside it (or above it on a narrow screen): E, Enter, Space
   or A use the nearest (gold), Q or Y the second (blue), and on a phone each prompt is its own button (js/town/44w-town-engine.js
   draws them and reads the keys). The second is found by asking every townNearest (this wraps the last of them) once more with the
   first thing out of the way for a moment: a building or room object, a person, a walker, a glimmering dig spot or the fountain. */
/* take a thing out of the street for a moment; returns what puts it back */
function townHideChoice(o, D){
  if (o.k === 'b' && o.b){ const keep = D.b; D.b = keep.filter(function(b){ return b !== o.b; }); return function(){ D.b = keep; }; }
  if (o.k === 'npc'){ const keep = Town.npcs; Town.npcs = keep.filter(function(n){ return n.id !== o.id; }); return function(){ Town.npcs = keep; }; }
  if (o.k === 'walker' && o.w){ const h = o.w.hid; o.w.hid = 1; return function(){ o.w.hid = h; }; }
  if (o.k === 'dig'){ const got = townDaily().got; got.push(o.i); return function(){ const k = got.lastIndexOf(o.i); if (k >= 0) got.splice(k, 1); }; }
  if (o.k === 'wish'){ const keep = D.p; D.p = keep.filter(function(p){ return !(p.k === 'fountain' && p.x === o.x); }); return function(){ D.p = keep; }; }
  return null;
}
function townSameChoice(a, b){
  if (!a || !b || a.k !== b.k) return false;
  return a.k === 'b' ? a.b === b.b : a.k === 'npc' ? a.id === b.id : a.k === 'walker' ? a.w === b.w : a.k === 'dig' ? a.i === b.i : a.x === b.x;
}
(function(){
  const nr = townNearest;
  townNearest = function(D, inp){
    const o = nr.apply(this, arguments);
    Town.near2 = null; Town.near2For = o;
    if (!o) return o;
    const undo = townHideChoice(o, D); if (!undo) return o;
    let o2 = null;
    try { o2 = nr.apply(this, arguments); } catch (e) { o2 = null; } finally { undo(); }
    if (o2 && !(o2.k === 'b' && !o2.b) && !townSameChoice(o, o2)) Town.near2 = o2;
    return o;
  };
})();
