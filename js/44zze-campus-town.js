'use strict';
/* =============================================================================================================================
   44zze-campus-town.js  --  LONGNECK UNIVERSITY: the place and the people. The rules are in 44zz-campus.js; the study sessions are
   in 44zzf; the painting is in 44zzg (outdoors), 44zzh (the rooms) and 44zzi (the slide pictures).

   THE CAMPUS is a district of its own (id 'campus', 4400 wide, not in TOWN_IDS, like Driftwood Cove). A gate in the Town Square leads to it once
   Chapter 1 is finished; the arch at its west end leads back. Along it, left to right: the Registrar's Hall (with the clock tower), the Lecture
   Theatre, the University Library, the Homework Hall, the Exam Hall and the Campus Cafe. Each is a door to a room (in_uhall, in_ulecture,
   in_ulibrary, in_uhw, in_uexam, in_ucafe).
   WHAT EACH ROOM DOES (the doors are 'u_' buildings; their act is handled below, then in 44zzf):
     Registrar's Hall   the desk (faculties and energy), the faculty board, the Hall of Degrees, the rank cabinet, the notebook
     Lecture Theatre    the seats and the timetable: sit in on a lecture
     Library            a shelf for each faculty, and the reading table: read a book
     Homework Hall      the study desks: do a set of homework
     Exam Hall          the proctor's desk and the exam desks: sit an exam for a degree
     Campus Cafe        the counter (drinks, snacks, study supplies; food from the satchel gives energy too)
   NINE PEOPLE live here (Quill, Prof. Longshanks, Ms. Stack, Tutor Chalk, Proctor Tick, Bean, Dr. Fern, Prof. Orbit and Pip), with errands.
   ============================================================================================================================= */
const UNI_CAMPUS_W = 4400;
TOWN_PAL.campus = { far: '#A9BCCD', mid: '#8FB08A', ground: '#6EA85A', path: '#C9BFA0', line: 'rgba(60,70,40,.18)', walls: ['#E2D3B0', '#D6C4A0'], roofs: ['#6A4A3A', '#4D6B58'] };
TOWN_ROOM.uhall    = { wall: '#E6DCC4', wains: '#5A3A2A', stripe: 'rgba(120,90,50,.1)', floor: '#8A6A48', beam: '#4A3424' };
TOWN_ROOM.ulecture = { wall: '#CFC3AE', wains: '#4A3220', stripe: null, floor: '#6A4A30', beam: '#33241A' };
TOWN_ROOM.ulibrary = { wall: '#D8C9A4', wains: '#4A2E1C', stripe: 'rgba(90,60,30,.1)', floor: '#5E402A', beam: '#33211A' };
TOWN_ROOM.uhw      = { wall: '#DDE6EC', wains: '#3A5A7A', stripe: 'rgba(60,100,140,.08)', floor: '#8A7A5A', beam: '#3A4A5A' };
TOWN_ROOM.uexam    = { wall: '#D8D8D2', wains: '#4A4A50', stripe: null, floor: '#7A7A72', beam: '#3A3A40' };
TOWN_ROOM.ucafe    = { wall: '#EAD6B0', wains: '#7A4A2A', stripe: 'rgba(150,100,60,.1)', floor: '#7A5436', beam: '#5A3A24' };

/* ---- the district ---- */
(function(){
  const S = TOWN_DIST.square;
  S.b.push({ id: 'cgate', kind: 'u_gate', x: 1960, w: 140, h: 190, label: 'The University', act: 'campus', gate: function(){ return townDoneCh(1); }, gateText: 'An iron gate, and a sign: LONGNECK UNIVERSITY. Opening after you finish Chapter 1.' });
  S.p = S.p.filter(function(p){ return !(p.k === 'lamp' && p.x === 1920) && !(p.k === 'tree' && p.x === 2060); });
  S.p.push({ k: 'lamp', x: 1846 }, { k: 'tree', x: 2330, s: 0.9 });
  const b = [
    { id: 'cexit', kind: 'u_arch', x: 150, w: 170, h: 200, label: 'Back to Town Square', act: 'campus-out' },
    { id: 'chall', kind: 'u_hall', x: 760, w: 440, h: 300, label: 'Registrar’s Hall', act: 'house', to: 'in_uhall' },
    { id: 'clec', kind: 'u_lecture', x: 1480, w: 360, h: 240, label: 'Lecture Theatre', act: 'house', to: 'in_ulecture' },
    { id: 'clib', kind: 'u_library', x: 2180, w: 400, h: 270, label: 'University Library', act: 'house', to: 'in_ulibrary' },
    { id: 'chw', kind: 'u_hw', x: 2880, w: 340, h: 230, label: 'Homework Hall', act: 'house', to: 'in_uhw' },
    { id: 'cexam', kind: 'u_exam', x: 3520, w: 380, h: 250, label: 'Exam Hall', act: 'house', to: 'in_uexam' },
    { id: 'ccafe', kind: 'u_cafe', x: 4120, w: 300, h: 200, label: 'Campus Café', act: 'house', to: 'in_ucafe' }
  ];
  const p = [{ k: 'tree', x: 330, s: 1.1 }, { k: 'lamp', x: 400 }, { k: 'u_hedge', x: 470 }, { k: 'u_notice', x: 1070 }, { k: 'lamp', x: 1130 }, { k: 'bench', x: 1010 }, { k: 'u_bikes', x: 1740 },
    { k: 'u_statue', x: 1800 }, { k: 'lamp', x: 1880 }, { k: 'tree', x: 1660 }, { k: 'u_hedge', x: 2420 }, { k: 'bench', x: 2480 }, { k: 'tree', x: 2520 }, { k: 'lamp', x: 2560 }, { k: 'u_fountain', x: 3200 },
    { k: 'bench', x: 3100 }, { k: 'u_banner', x: 3270, f: 'space' }, { k: 'tree', x: 3820 }, { k: 'lamp', x: 3860 }, { k: 'u_notice', x: 3880 }, { k: 'bush', x: 4300 }, { k: 'flowers', x: 1240 }, { k: 'flowers', x: 2740 }, { k: 'u_banner', x: 1230, f: 'giraffe' },
    { k: 'u_banner', x: 1920, f: 'bio' }, { k: 'u_banner', x: 2640, f: 'maths' }, { k: 'u_banner', x: 3390, f: 'phys' }];
  const L = [{ x: 400, y: 360, r: 110 }, { x: 760, y: 220, r: 220 }, { x: 1130, y: 360, r: 110 }, { x: 1480, y: 300, r: 180 }, { x: 1880, y: 360, r: 110 }, { x: 2180, y: 300, r: 200 }, { x: 2560, y: 360, r: 110 },
    { x: 2880, y: 300, r: 170 }, { x: 3520, y: 300, r: 190 }, { x: 3860, y: 360, r: 110 }, { x: 4120, y: 300, r: 160 }];
  TOWN_DIST.campus = { id: 'campus', name: 'Longneck University', w: UNI_CAMPUS_W, spawn: 300, theme: 'campus', left: null, right: null, open: function(){ return townDoneCh(1); }, need: 'Finish Chapter 1',
    b: b, p: p, L: L, npcs: ['fern', 'orbit', 'pip'], dig: [620, 2060, 3700] };
})();

/* ---- the rooms ---- */
(function(){
  const door = function(list){ return [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }].concat(list); };
  const lamps = function(W, y){ const L = []; for (let x = 300; x < W; x += 360) L.push({ x: x, y: y || 70, r: 190 }); return L; };
  const room = function(id, name, theme, W, b, npcs){ townRoomDef(id, name, theme, W, 190, { b: door(b), p: [], L: lamps(W), npcs: npcs || [] }); TOWN_IN_IDS.push(id); TOWN_ROOM_PARENT[id] = 'campus'; };
  room('in_uhall', 'Registrar’s Hall', 'uhall', 2800, [
    { id: 'reg', kind: 'u_regdesk', x: 640, w: 340, h: 130, label: 'The Registrar’s desk', act: 'uni-registrar' },
    { id: 'fac', kind: 'u_facboard', x: 1200, w: 440, h: 270, label: 'The faculty board', act: 'uni-faculties' },
    { id: 'deg', kind: 'u_degrees', x: 1760, w: 360, h: 260, label: 'The Hall of Degrees', act: 'uni-degrees' },
    { id: 'rank', kind: 'u_trophy', x: 2200, w: 220, h: 240, label: 'The rank cabinet', act: 'uni-ranks' },
    { id: 'note', kind: 'u_notebook', x: 2520, w: 200, h: 150, label: 'Your notebook', act: 'uni-notebook' }], ['quill']);
  room('in_ulecture', 'Lecture Theatre', 'ulecture', 3000, [
    { id: 'tt', kind: 'u_timetable', x: 560, w: 220, h: 250, label: 'The timetable', act: 'uni-lec' },
    { id: 'stage', kind: 'u_stage', x: 1250, w: 560, h: 280, label: 'The lecture stage', act: 'uni-lec' },
    { id: 'seats', kind: 'u_seats', x: 2150, w: 720, h: 200, label: 'The seats', act: 'uni-lec' }], ['longshanks']);
  room('in_ulibrary', 'University Library', 'ulibrary', 3700, UNI_FAC.map(function(F, i){ return { id: 'sh_' + F.id, kind: 'u_shelf', x: 520 + i * 330, w: 260, h: 300, label: F.name + ' shelf', act: 'uni-shelf', m: F.id }; }).concat([
    { id: 'rt', kind: 'u_readtable', x: 3380, w: 340, h: 150, label: 'The reading table', act: 'uni-read' }]), ['stack']);
  room('in_uhw', 'Homework Hall', 'uhw', 2700, [
    { id: 'hw1', kind: 'u_hwdesk', x: 700, w: 280, h: 140, label: 'A study desk', act: 'uni-hw' },
    { id: 'hw2', kind: 'u_hwdesk', x: 1180, w: 280, h: 140, label: 'A study desk', act: 'uni-hw' },
    { id: 'hw3', kind: 'u_hwdesk', x: 1660, w: 280, h: 140, label: 'A study desk', act: 'uni-hw' },
    { id: 'hwb', kind: 'u_hwboard', x: 2220, w: 360, h: 250, label: 'The answers board', act: 'uni-hwboard' }], ['chalk']);
  room('in_uexam', 'Exam Hall', 'uexam', 3100, [
    { id: 'inv', kind: 'u_invig', x: 650, w: 320, h: 150, label: 'The proctor’s desk', act: 'uni-exam' },
    { id: 'ex1', kind: 'u_exdesk', x: 1250, w: 180, h: 120, label: 'An exam desk', act: 'uni-exam' },
    { id: 'ex2', kind: 'u_exdesk', x: 1580, w: 180, h: 120, label: 'An exam desk', act: 'uni-exam' },
    { id: 'ex3', kind: 'u_exdesk', x: 1910, w: 180, h: 120, label: 'An exam desk', act: 'uni-exam' },
    { id: 'res', kind: 'u_results', x: 2500, w: 380, h: 260, label: 'The results board', act: 'uni-degrees' }], ['tick']);
  room('in_ucafe', 'Campus Café', 'ucafe', 2400, [
    { id: 'cc', kind: 'u_cafebar', x: 900, w: 460, h: 130, label: 'The café counter', act: 'uni-cafe' },
    { id: 'ct1', kind: 'u_cafetable', x: 1500, w: 200, h: 100, label: 'A table', act: 'sit' },
    { id: 'ct2', kind: 'u_cafetable', x: 1800, w: 200, h: 100, label: 'A table', act: 'sit' }], ['bean']);
})();

/* ---- people ---- */
Object.assign(TOWN_NPCS, {
  quill: { id: 'quill', name: 'Registrar Quill', d: 'in_uhall', x: 880, range: 60, habit: 'stand', fav: 'book', look: { coat: '#C9B8DC', spot: '#5A3A8A', pat: 4, hat: 'mortarboard', s: 1.05 }, gift: { gems: 60, coin: 8 },
    say: ['Welcome to Longneck University. Mind the energy meter. It refills at midnight.', 'Every faculty opens after a chapter. Study hard and the doors keep opening.', 'A degree is only a piece of paper. A good one, mind you.', 'Rank is the sum of all your levels. Everyone starts as a Fresher.'], night: ['The hall is quiet at night. I like it.'], rain: ['Rain on the windows. Perfect study weather.'] },
  longshanks: { id: 'longshanks', name: 'Prof. Longshanks', d: 'in_ulecture', x: 1000, range: 60, habit: 'stand', fav: 'flowers', look: { coat: '#E8B648', spot: '#8A5A24', pat: 1, hat: 'straw', s: 1.2 }, gift: { gems: 60, coin: 8 },
    say: ['Giraffe Studies is the best faculty. I may be biased. I am quite tall.', 'Seven neck bones! Each one a marvel!', 'Sit near the front. The slides are very tall.', 'Ask me anything about necks. Anything at all.'], night: ['Late lecture? I have notes.'], rain: ['No one skips a lecture in the rain.'] },
  stack: { id: 'stack', name: 'Ms. Stack', d: 'in_ulibrary', x: 1500, range: 70, habit: 'stand', fav: 'book', look: { coat: '#D8C9A0', spot: '#6A4A2A', pat: 6, hat: 'flowers', s: 1.0 }, gift: { gems: 60, coin: 8 },
    say: ['Shh. Well, giraffes are quiet already. Take a book.', 'There is a shelf for every faculty. The high ones are for the advanced readers.', 'Every book tells you one thing worth remembering. I check.', 'Please return the ladder. It is not a toy.'], night: ['The library after dark smells of old paper. Lovely.'], rain: ['Perfect reading weather.'] },
  chalk: { id: 'chalk', name: 'Tutor Chalk', d: 'in_uhw', x: 950, range: 60, habit: 'stand', fav: 'sweets', look: { coat: '#BFD8F2', spot: '#3A5A8A', pat: 12, hat: 'beanie', s: 1.05 }, gift: { gems: 60, coin: 8 },
    say: ['Homework is practice. Practice is how it sticks.', 'Stuck? A flashcard will remove two wrong answers.', 'Five questions, no clock. Take your time.', 'The trick to maths is to do some every day.'], night: ['Late homework is better than none.'], rain: ['Stay in and do some sums.'] },
  tick: { id: 'tick', name: 'Proctor Tick', d: 'in_uexam', x: 880, range: 50, habit: 'stand', fav: 'book', look: { coat: '#A8B8A0', spot: '#4A5A44', pat: 2, hat: 'cowboy', s: 1.1 }, gift: { gems: 60, coin: 8 },
    say: ['No talking in the exam hall. That includes me.', 'Seventy percent to pass. No hints, and the clock is real.', 'There are three degrees: Bachelor, Master and Doctorate.', 'Eyes on your own paper.'], night: ['Exams at night? Brave.'], rain: ['Rain never delayed an exam yet.'] },
  bean: { id: 'bean', name: 'Barista Bean', d: 'in_ucafe', x: 760, range: 60, habit: 'stand', fav: 'sweets', look: { coat: '#E0B890', spot: '#7A4A2A', pat: 11, hat: 'toque', s: 1.05 }, gift: { gems: 60, coin: 8 },
    say: ['Coffee, tea, cake. Energy comes in many shapes.', 'Fuel up before the big exam.', 'A cake is three energy. A coffee is two and a better mood.', 'The satchel? Bring me a fish and I will turn it into brain food.'], night: ['The espresso machine never sleeps.'], rain: ['Rainy days sell a lot of cake.'] },
  fern: { id: 'fern', name: 'Dr. Fern', d: 'campus', x: 1620, range: 90, habit: 'stand', fav: 'flowers', look: { coat: '#BDE0B0', spot: '#3E7A3A', pat: 4, hat: 'flowers', s: 1.08 }, gift: { gems: 60, coin: 8 },
    say: ['Biology is outside the window. Every leaf is a lesson.', 'Plants make food from sunshine. I am a little jealous.', 'Weather is just the Earth breathing.', 'I study cells. They study me. We get along.'], night: ['Night is when the moths come out. Fascinating.'], rain: ['Splendid rain! The soil will be happy.'] },
  orbit: { id: 'orbit', name: 'Prof. Orbit', d: 'campus', x: 3020, range: 100, habit: 'stand', fav: 'book', look: { coat: '#B8B8F0', spot: '#3A3A8A', pat: 1, hat: 'wizard', s: 1.1 }, gift: { gems: 60, coin: 8 },
    say: ['Physics, chemistry, space. The universe has rules, and they are lovely.', 'Light takes eight minutes to reach us. We are always looking at the past.', 'Everything is atoms. Even this lecture notice.', 'One day I want a telescope as tall as you.'], night: ['Look up! Tonight is a good night for stars.'], rain: ['Clouds block the stars, but not the thinking.'] },
  pip: { id: 'pip', name: 'Pip', d: 'campus', x: 2340, range: 80, habit: 'stand', fav: 'sweets', look: { coat: '#F2C4B0', spot: '#B04A32', pat: 5, hat: 'beanie', s: 0.86 }, gift: { gems: 60, coin: 8 },
    say: ['I am a first-year. I get lost a lot. It is fine, my neck is long.', 'The library has a shelf for every subject. I read them all. Okay, three.', 'Ask Bean for a coffee before an exam. It helps. Possibly.', 'Do you know the way to the Exam Hall? Never mind. It is the scary one.'], night: ['I should be asleep. I am not.'], rain: ['I forgot my umbrella. Again.'] }
});
['quill', 'longshanks', 'stack', 'chalk', 'tick', 'bean', 'fern', 'orbit', 'pip'].forEach(function(id){ TOWN_NPC_LIST.push(id); });
TOWN_ERRANDS.push(
  { id: 'un1', npc: 'quill', title: 'First day', offer: 'Take part in any study session: a lecture, a book, homework or an exam. Just one.', done: 'Welcome to the university, officially.', need: { k: 'uni', what: 'sessions', n: 1 }, r: { coin: 3 } },
  { id: 'un2', npc: 'quill', title: 'Fresher no more', offer: 'Reach the rank of Student. Your levels add up to eight.', done: 'A mortarboard suits you.', need: { k: 'uni', what: 'rank', n: 1 }, r: { gems: 30 } },
  { id: 'un3', npc: 'longshanks', title: 'Neck and neck', offer: 'Attend three lectures. Any faculty. Giraffe Studies is, of course, the best.', done: 'Three lectures. A scholar in the making.', need: { k: 'uni', what: 'lec', n: 3 }, r: { gems: 25 } },
  { id: 'un4', npc: 'stack', title: 'Bookworm', offer: 'Read five books in the library. Re-reading counts.', done: 'Five books. I am proud of you.', need: { k: 'uni', what: 'book', n: 5 }, r: { coin: 4 } },
  { id: 'un5', npc: 'chalk', title: 'Homework hero', offer: 'Finish five sets of homework. Every set counts, whatever the score.', done: 'Five sets! The habit is forming.', need: { k: 'uni', what: 'hw', n: 5 }, r: { coin: 4 } },
  { id: 'un6', npc: 'tick', title: 'Pass mark', offer: 'Pass an exam. Seventy percent or better.', done: 'Passed. I knew you could.', need: { k: 'uni', what: 'pass', n: 1 }, r: { gems: 40 } },
  { id: 'un7', npc: 'bean', title: 'Fuel', offer: 'Buy three things at the café counter. A tea counts.', done: 'Three orders. A regular!', need: { k: 'uni', what: 'cafe', n: 3 }, r: { coin: 3 } },
  { id: 'un8', npc: 'fern', title: 'Field work', offer: 'Take any faculty to level 5.', done: 'Level five! That is where it gets interesting.', need: { k: 'uni', what: 'level5', n: 1 }, r: { gems: 40 } },
  { id: 'un9', npc: 'orbit', title: 'Eyes on the sky', offer: 'Reach the rank of Scholar. Your levels add up to 24.', done: 'A scholar. You have earned the loafers.', need: { k: 'uni', what: 'rank', n: 2 }, r: { gems: 60 } },
  { id: 'un10', npc: 'pip', title: 'Study buddy', offer: 'Do ten study sessions altogether. I will try to keep up.', done: 'Ten sessions! You make me look lazy.', need: { k: 'uni', what: 'sessions', n: 10 }, r: { gems: 25 } }
);
TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
(function(){
  const tn = townNeed;
  townNeed = function(er){
    const n = er.need;
    if (n.k !== 'uni') return tn(er);
    const t = townData(), u = uniData(), c = function(v){ return { cur: Math.min(n.n, v | 0), max: n.n }; };
    switch (n.what){
      case 'sessions': return c(t.n.uniSessions);
      case 'lec': return c(t.n.uniLec);
      case 'book': return c(t.n.uniBook);
      case 'hw': return c(t.n.uniHw);
      case 'pass': return c(t.n.uniPass);
      case 'cafe': return c(t.n.uniCafe);
      case 'rank': return c(uniRankIndex());
      case 'level5': { let m = 0; UNI_FAC.forEach(function(F){ m = Math.max(m, uniFac(F.id).l); }); return { cur: m >= 5 ? 1 : 0, max: 1 }; }
    }
    return { cur: 0, max: n.n };
  };
})();
(function(){
  const tt = townNeedText;
  townNeedText = function(er){
    if (er.need.k !== 'uni') return tt(er);
    const nd = townNeed(er), lab = { sessions: 'Study sessions', lec: 'Lectures attended', book: 'Books read', hw: 'Homework sets', pass: 'Exams passed', cafe: 'Café orders', rank: 'University rank reached', level5: 'A faculty at level 5' }[er.need.what] || 'Progress';
    return lab + ': ' + nd.cur + ' of ' + nd.max;
  };
})();
TOWN_ITEMS.push(
  { id: 'cp_c1', d: 'campus', t: 'coin', x: 330, h: 0, note: 'under the first tree after the arch' },
  { id: 'cp_c2', d: 'campus', t: 'coin', x: 1800, h: 170, note: 'floating over the scholar’s statue' },
  { id: 'cp_c3', d: 'campus', t: 'coin', x: 3340, h: 0, note: 'by the Exam Hall banner' },
  { id: 'cp_g1', d: 'campus', t: 'gem', x: 2180, h: 285, note: 'over the library’s roof' },
  { id: 'cp_s1', d: 'campus', t: 'star', x: 1000, h: 280, note: 'by the clock tower of the Registrar’s Hall' }
);

/* ---- doors, labels, actions ---- */
(function(){
  const tu = townUse, nr = townNearest, hta = handleTownAction;
  const LAB = { 'uni-registrar': 'Talk to the Registrar’s desk', 'uni-faculties': 'Read the faculty board', 'uni-degrees': 'See the Hall of Degrees', 'uni-ranks': 'Look in the rank cabinet', 'uni-notebook': 'Open your notebook',
    'uni-lec': 'Sit in on a lecture', 'uni-read': 'Choose a book to read', 'uni-hw': 'Do some homework', 'uni-hwboard': 'Look at the answers board', 'uni-exam': 'Sit an exam', 'uni-cafe': 'Visit the café counter', 'campus': 'Go through the gate', 'campus-out': 'Back to Town Square' };
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.gate && !b.gate()){ townSay({ name: b.label, text: b.gateText || 'It is closed.' }, []); SFX.deny(); return; }
      if (b.act === 'campus'){ townGo('campus', 300, 1); return; }
      if (b.act === 'campus-out'){ townGo('square', 2000, 1); return; }
      if (b.act && b.act.indexOf('uni-') === 0){ uniAct(b); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b' && o.b.act && LAB[o.b.act]){
      o.label = LAB[o.b.act];
      if (o.b.act === 'uni-shelf'){ const F = UNI_BY_ID[o.b.m]; o.label = uniOpen(F) ? 'Browse the ' + F.name + ' shelf' : F.name + ' shelf (opens after Chapter ' + F.ch + ')'; }
    }
    return o;
  };
  handleTownAction = function(a){
    let m;
    if (a === 'town-uni-reg'){ uniShowRegistrar(); return true; }
    if (a === 'town-uni-fac'){ uniShowFaculties(); return true; }
    if (a === 'town-uni-deg'){ uniShowDegrees(); return true; }
    if (a === 'town-uni-rank'){ uniShowRanks(); return true; }
    if (a === 'town-uni-note'){ uniShowNotebook(); return true; }
    if (a === 'town-uni-cafe'){ uniShowCafe(); return true; }
    if ((m = /^town-uni-buy-(\w+)$/.exec(a))){ uniBuy(m[1]); uniShowCafe(); return true; }
    if ((m = /^town-uni-eat-(\w+)$/.exec(a))){ uniEat(m[1]); uniShowCafe(); return true; }
    if ((m = /^town-uni-note-(\w+)$/.exec(a))){ uniShowNotebook(m[1]); return true; }
    if (typeof uniStudyAction === 'function'){ const r = uniStudyAction(a); if (r) return true; }
    return hta(a);
  };
})();
function uniAct(b){                                                                    /* what the room furniture does; the study sessions are in 44zzf */
  switch (b.act){
    case 'uni-registrar': uniShowRegistrar(); break;
    case 'uni-faculties': uniShowFaculties(); break;
    case 'uni-degrees': uniShowDegrees(); break;
    case 'uni-ranks': uniShowRanks(); break;
    case 'uni-notebook': uniShowNotebook(); break;
    case 'uni-cafe': uniShowCafe(); break;
    case 'uni-hwboard': townSay({ name: 'The answers board', text: 'Pinned answers to old homework. Tutor Chalk has written across the top: "Try first. Look second."' }, []); break;
    default: if (typeof uniBeginAct === 'function') uniBeginAct(b); else townSay({ name: b.label, text: 'The study desks are not ready yet.' }, []);
  }
}

/* ---- the energy and the shop ---- */
const UNI_SHOP = [
  { id: 'tea', name: 'Tea', desc: 'A hot cup. +1 energy.', coin: 0.6, en: 1, group: 'food' },
  { id: 'bun', name: 'Currant bun', desc: 'A bun, still warm. +1 energy.', coin: 0.7, en: 1, group: 'food' },
  { id: 'toast', name: 'Toast and jam', desc: '+1 energy.', coin: 0.7, en: 1, group: 'food' },
  { id: 'soup', name: 'Soup', desc: 'A big bowl. +2 energy.', coin: 1.2, en: 2, group: 'food' },
  { id: 'juice', name: 'Fresh juice', desc: '+2 energy.', coin: 1.1, en: 2, group: 'food' },
  { id: 'cake', name: 'Chocolate cake', desc: 'A big slice. +3 energy.', coin: 2, en: 3, group: 'food' },
  { id: 'coffee', name: 'Coffee', desc: '+2 energy, and your next session gives 25% more xp.', coin: 1.5, en: 2, buff: 'xp', group: 'drink' },
  { id: 'energy', name: 'Energy drink', desc: '+4 energy. Fizzy, loud and a little alarming.', gems: 25, en: 4, group: 'drink' },
  { id: 'brain', name: 'Brain juice', desc: '+8 energy. Bean will not tell you what is in it.', gems: 55, en: 8, group: 'drink' },
  { id: 'highlighter', name: 'Highlighter pack', desc: 'The next three sessions give 25% more xp.', coin: 2.5, buff: 'xp3', group: 'supplies' },
  { id: 'flash', name: 'Flashcards', desc: 'Three uses: each removes two wrong answers in homework.', coin: 1.5, buff: 'flash', group: 'supplies' },
  { id: 'lamp', name: 'Study lamp', desc: 'A permanent +1 to your daily energy. Up to five.', gems: 250, lamp: 1, group: 'supplies' }
];
const UNI_SHOP_BY_ID = {}; UNI_SHOP.forEach(function(s){ UNI_SHOP_BY_ID[s.id] = s; });
function uniPrice(s){
  const u = uniData(), k = s.group === 'supplies' ? 1 : 1 + 0.08 * Math.min(12, u.bought);
  return s.gems ? { gems: Math.round(s.gems * k) } : { gold: Math.round(s.coin * townCoin() * k) };
}
function uniCanBuy(s){
  const p = uniPrice(s), u = uniData();
  if (s.lamp && u.lamps >= UNI_LAMP_MAX) return false;
  return p.gems ? (Save.data.gems | 0) >= p.gems : (Save.data.gold | 0) >= p.gold;
}
function uniBuy(id){
  const s = UNI_SHOP_BY_ID[id]; if (!s) return false;
  const u = uniData(), p = uniPrice(s);
  if (!uniCanBuy(s)){ SFX.deny(); townToast(s.lamp && u.lamps >= UNI_LAMP_MAX ? 'You already have every lamp.' : 'Not enough ' + (p.gems ? 'gems' : 'gold') + '.', '#FFB89A'); return false; }
  if (s.en && uniEnergy() >= uniEnergyMax() * 2){ SFX.deny(); townToast('You are too wired to drink anything else.', '#FFB89A'); return false; }
  if (p.gems) Save.data.gems -= p.gems; else Save.data.gold -= p.gold;
  if (s.en){ uniGainEnergy(s.en); if (s.group !== 'supplies') u.bought++; }
  if (s.buff === 'xp') u.buff.xp = Math.max(1, u.buff.xp | 0);
  if (s.buff === 'xp3') u.buff.xp = (u.buff.xp | 0) + 3;
  if (s.buff === 'flash') u.buff.flash = (u.buff.flash | 0) + 3;
  if (s.lamp) u.lamps++;
  const t = townData(); t.n.uniCafe = (t.n.uniCafe | 0) + 1; Save.write(); SFX.buy();
  townToast(s.name + (s.en ? '  +' + s.en + ' energy' : s.lamp ? '  +1 daily energy' : ''), '#BFFF9A');
  return true;
}
function uniEat(kind){                                                                  /* food from the satchel: bread from the bakery, fish and crab from Driftwood Cove */
  const t = townData(), u = uniData();
  if (uniEnergy() >= uniEnergyMax() * 2){ SFX.deny(); townToast('You are too wired to eat anything else.', '#FFB89A'); return false; }
  if (kind === 'bread'){ if (breadStock() < 1){ SFX.deny(); return false; } t.n.loaves = breadStock() - 1; uniGainEnergy(1); townToast('A loaf, eaten slowly.  +1 energy', '#BFFF9A'); }
  else if (kind === 'fish'){ const d = seaData(); if (d.fish < 1){ SFX.deny(); return false; } d.fish--; uniGainEnergy(2); townToast('Brain food!  +2 energy', '#BFFF9A'); }
  else if (kind === 'crab'){ const d = seaData(); if (d.crab < 1){ SFX.deny(); return false; } d.crab--; uniGainEnergy(1); u.buff.xp = Math.max(1, u.buff.xp | 0); townToast('Crab on the inside.  +1 energy, and 25% more xp on your next session', '#BFFF9A'); }
  else return false;
  Save.write(); SFX.coin(); return true;
}
function uniEnergyBar(){
  const e = uniEnergy(), m = uniEnergyMax(), pips = [];
  for (let i = 0; i < Math.max(m, e); i++) pips.push('<i class="' + (i < e ? (i >= m ? 'on over' : 'on') : '') + '"></i>');
  return '<div class="unien"><span>STUDY ENERGY</span><b>' + e + ' / ' + m + '</b><div class="en-pips">' + pips.join('') + '</div><div class="en-sub">Refills to ' + m + ' at midnight. Lecture 2 · Reading 1 · Homework 1 · Exam 3.</div></div>';
}
function uniRankBar(){
  const r = uniRankIndex(), n = uniTotal(), cur = UNI_RANKS[r], nxt = UNI_RANKS[r + 1];
  const pct = nxt ? clamp((n - cur.at) / (nxt.at - cur.at), 0, 1) : 1;
  return '<div class="unirank"><div><span>RANK</span><b>' + cur.n + '</b></div><div class="ur-bar"><i style="width:' + Math.round(pct * 100) + '%"></i></div><div class="ur-sub">' + n + ' levels studied  ·  IQ ' + uniIQ() +
    (nxt ? '  ·  next: <em>' + nxt.n + '</em> at ' + nxt.at : '  ·  the top') + '</div></div>';
}

/* ---- the panels ---- */
function uniFacCard(F){
  const k = uniFac(F.id), open = uniOpen(F), max = k.l >= UNI_MAX, need = uniNeed(k.l), nextMs = k.l < 5 ? 5 : k.l < 10 ? 10 : k.l < 15 ? 15 : 0, d = uniData().deg[F.id] | 0;
  let h = '<div class="unicard' + (open ? '' : ' lock') + '" style="--c:' + F.col + '"><div class="uc-head"><b>' + F.name + '</b><i>' + (open ? 'Lv ' + k.l + (max ? ' MAX' : '') : 'Chapter ' + F.ch) + '</i></div>';
  if (!open){ h += '<div class="uc-gate">Opens after Chapter ' + F.ch + '</div><div class="uc-blurb">' + F.blurb + '</div></div>'; return h; }
  h += '<div class="uc-bar"><i style="width:' + (max ? 100 : Math.round(clamp(k.xp / need, 0, 1) * 100)) + '%"></i></div><div class="uc-now">' + (k.l ? uniBonusText(F, k.l) : 'no bonus yet') + '  <small>(' + F.lbl + ')</small></div>' +
    '<div class="uc-deg">' + [1, 2, 3].map(function(i){ return '<em class="' + (d >= i ? 'got' : '') + '">' + UNI_DEG[i] + '</em>'; }).join('') + '</div>' +
    (max ? '' : '<div class="uc-next">' + (need - Math.floor(k.xp)) + ' xp to level ' + (k.l + 1) + (nextMs ? '  ·  big bonus at ' + nextMs : '') + '</div>') + '</div>';
  return h;
}
function uniShowRegistrar(){
  let h = '<div class="tp-title">LONGNECK UNIVERSITY</div><p class="bp">Registrar Quill: "Welcome. Four things to do, one meter to watch. <b>Energy refills at midnight.</b> Each faculty opens after a chapter, and every level of study makes your giraffe a little smarter in a run."</p>' +
    uniEnergyBar() + uniRankBar() + '<div class="unicards">';
  UNI_FAC.forEach(function(F){ h += uniFacCard(F); });
  h += '</div><div class="unilinks"><button class="tbtn" data-a="town-uni-deg">Degrees</button><button class="tbtn" data-a="town-uni-rank">Ranks</button><button class="tbtn" data-a="town-uni-note">Notebook</button><button class="tbtn" data-a="town-uni-cafe">Café</button></div>';
  townPanelT('uni', h, { w: 1000 });
}
function uniShowFaculties(){
  let h = '<div class="tp-title">THE FACULTIES</div><p class="bp">Eight faculties. A faculty opens after its chapter. The level of a faculty sets how hard its questions are: tier 1 below level 5, tier 2 below 10, tier 3 after that.</p><div class="unicards">';
  UNI_FAC.forEach(function(F){ h += uniFacCard(F); });
  h += '</div><div class="unilinks"><button class="tbtn" data-a="town-uni-reg">Back to the desk</button></div>';
  townPanelT('uni', h, { w: 1000 });
}
function uniShowDegrees(){
  const u = uniData();
  let h = '<div class="tp-title">HALL OF DEGREES</div><p class="bp">Pass an exam in the Exam Hall for a degree step. <b>Bachelor</b> needs the faculty at level 5, <b>Master</b> at level 10 and <b>Doctorate</b> at level 15. A Doctorate earns the faculty badge.</p><div class="unidegs">';
  UNI_FAC.forEach(function(F){
    const k = uniFac(F.id), d = u.deg[F.id] | 0, open = uniOpen(F);
    h += '<div class="unideg' + (open ? '' : ' lock') + '" style="--c:' + F.col + '"><b>' + F.name + '</b><div class="ud-steps">' + [1, 2, 3].map(function(i){
      const got = d >= i, can = open && !got && d === i - 1 && k.l >= 5 * i;
      return '<span class="' + (got ? 'got' : can ? 'can' : '') + '">' + UNI_DEG[i] + '<small>' + (got ? 'earned' : 'level ' + 5 * i) + '</small></span>'; }).join('') + '</div>' + (u.badge[F.id] ? '<div class="ud-badge">FACULTY BADGE</div>' : '') + '</div>';
  });
  h += '</div><div class="unilinks"><button class="tbtn" data-a="town-uni-reg">Back to the desk</button></div>';
  townPanelT('uni', h, { w: 940 });
}
function uniShowRanks(){
  const r = uniRankIndex();
  let h = '<div class="tp-title">THE RANK CABINET</div>' + uniRankBar() + '<div class="uniranks">';
  UNI_RANKS.forEach(function(k, i){
    const got = i <= r, rw = k.acc ? (ACC_BY_ID[k.acc] ? ACC_BY_ID[k.acc].name : k.acc) : k.swatch ? 'the coat colour ' + WARD[UNI_SWATCH[k.swatch]].name : 'nothing yet';
    h += '<div class="unirk' + (got ? ' got' : '') + '"><b>' + k.n + '</b><span>at ' + k.at + ' levels</span><em>' + k.perk + '</em><small>' + (i ? 'Reward: ' + rw : '') + '</small></div>';
  });
  h += '</div><div class="unilinks"><button class="tbtn" data-a="town-uni-reg">Back to the desk</button></div>';
  townPanelT('uni', h, { w: 820 });
}
function uniFactText(id){
  const bk = UNI_BOOK_BY_ID[id]; if (bk) return { f: bk.f, title: bk.title, txt: bk.fact, kind: 'Book' };
  const lc = UNI_LEC_BY_ID[id]; if (lc) return { f: lc.f, title: lc.title, txt: lc.slides[lc.slides.length - 1].p, kind: 'Lecture' };
  return null;
}
function uniShowNotebook(fid){
  const u = uniData(), ids = Object.keys(u.facts).filter(function(id){ return uniFactText(id); });
  let h = '<div class="tp-title">YOUR NOTEBOOK</div><p class="bp">One thing is written down the first time you read a book or attend a lecture. ' + ids.length + ' so far, out of ' + (UNI_BOOKS.length + UNI_LECTURES.length) + '.</p>';
  h += '<div class="uninotetabs">' + UNI_FAC.map(function(F){ return '<button class="tbtn' + (fid === F.id ? ' on' : '') + '" style="--c:' + F.col + '" data-a="town-uni-note-' + F.id + '">' + F.short + '</button>'; }).join('') + '</div>';
  const list = ids.map(uniFactText).filter(function(o){ return !fid || o.f === fid; });
  h += '<div class="uninotes">' + (list.length ? list.map(function(o){ return '<div class="unin" style="--c:' + UNI_BY_ID[o.f].col + '"><b>' + o.title + '</b><small>' + o.kind + '</small><p>' + o.txt + '</p></div>'; }).join('') : '<p class="tnote">Nothing here yet. Read a book or attend a lecture.</p>') + '</div>';
  h += '<div class="unilinks"><button class="tbtn" data-a="town-uni-reg">Back to the desk</button></div>';
  townPanelT('uni', h, { w: 820 });
}
function uniShowCafe(){
  const gold = Save.data.gold | 0, gems = Save.data.gems | 0, t = townData(), sea = seaData();
  let h = '<div class="tp-title">CAMPUS CAFÉ</div><p class="bp">Barista Bean: "What can I get you? Everything costs a little more the more you have today."</p>' + uniEnergyBar() + '<div class="unishop">';
  [['food', 'Food'], ['drink', 'Drinks'], ['supplies', 'Study supplies']].forEach(function(g){
    h += '<h4>' + g[1] + '</h4><div class="uniitems">';
    UNI_SHOP.filter(function(s){ return s.group === g[0]; }).forEach(function(s){
      const p = uniPrice(s), can = uniCanBuy(s);
      h += '<div class="uniitem"><b>' + s.name + '</b><span>' + s.desc + '</span><button class="gcbtn" data-a="town-uni-buy-' + s.id + '"' + (can ? '' : ' disabled') + '>' + (p.gems ? p.gems + ' gems' : fmt(p.gold) + ' gold') + '</button></div>';
    });
    h += '</div>';
  });
  h += '<h4>From your satchel</h4><div class="uniitems">' +
    '<div class="uniitem"><b>A loaf of bread</b><span>You have ' + breadStock() + '. +1 energy.</span><button class="gcbtn" data-a="town-uni-eat-bread"' + (breadStock() ? '' : ' disabled') + '>Eat one</button></div>' +
    '<div class="uniitem"><b>A fish</b><span>You have ' + sea.fish + '. +2 energy.</span><button class="gcbtn" data-a="town-uni-eat-fish"' + (sea.fish ? '' : ' disabled') + '>Eat one</button></div>' +
    '<div class="uniitem"><b>A crab</b><span>You have ' + sea.crab + '. +1 energy and 25% more xp next session.</span><button class="gcbtn" data-a="town-uni-eat-crab"' + (sea.crab ? '' : ' disabled') + '>Eat one</button></div></div>';
  h += '</div><div class="stock">' + fmt(gold) + ' gold  ·  ' + gems + ' gems' + (uniData().buff.xp ? '  ·  xp boost ready' : '') + (uniData().buff.flash ? '  ·  ' + uniData().buff.flash + ' flashcards' : '') + '</div>';
  townPanelT('uni', h, { w: 940 });
}

/* ---- the journal gets a Study tab: rank, IQ, every faculty, degrees and badges, and the notebook count ---- */
function uniShowJournalTab(){
  const u = uniData(), r = uniRankIndex(), tabs = [['errands', 'Errands'], ['finds', 'Finds'], ['friends', 'Friends'], ['tracks', 'Tracks'], ['gear', 'Gear'], ['study', 'Study']];
  let th = '<div class="jtabs">'; tabs.forEach(function(x){ th += '<button class="jtab' + (x[0] === 'study' ? ' on' : '') + '" data-a="town-jt-' + x[0] + '">' + x[1] + '</button>'; }); th += '</div>';
  const bar = function(a, m){ return '<span class="ink-bar"><i style="width:' + Math.round(100 * Math.min(1, a / Math.max(1, m))) + '%"></i></span>'; };
  let b = '<p class="jh">' + UNI_RANKS[r].n + ' · IQ ' + uniIQ() + '</p><p class="jt">' + uniTotal() + ' levels studied. Study energy ' + uniEnergy() + ' of ' + uniEnergyMax() + ' today. ' + Object.keys(u.facts).length + ' of ' + (UNI_BOOKS.length + UNI_LECTURES.length) + ' notebook entries.</p>';
  if (!townDoneCh(1)) b += '<p class="jt">The university opens once you have finished Chapter 1. Look for the iron gate in the Town Square.</p>';
  UNI_FAC.forEach(function(F){
    const k = uniFac(F.id), open = uniOpen(F), d = u.deg[F.id] | 0;
    b += '<div class="je' + (open ? '' : ' locked') + '"><b>' + F.name + '</b> <span class="jw">' + (open ? 'level ' + k.l + (d ? ' · ' + UNI_DEG[d] + (u.badge[F.id] ? ' · badge' : '') : '') : 'opens after Chapter ' + F.ch) + '</span>' + (open ? bar(k.l, UNI_MAX) : '') + '</div>';
  });
  townPanelT('journal', th + '<div class="jpage">' + b + '</div>', { w: 640 });
}
(function(){
  const tj = townShowJournal, tg = typeof townShowGear === 'function' ? townShowGear : null, h = handleTownAction;
  const addTab = function(){ const tabs = document.querySelector('.tp-journal .jtabs'); if (!tabs || tabs.querySelector('[data-a="town-jt-study"]')) return; const b = document.createElement('button'); b.className = 'jtab'; b.setAttribute('data-a', 'town-jt-study'); b.textContent = 'Study'; tabs.appendChild(b); };
  townShowJournal = function(tab){ if (tab === 'study'){ uniShowJournalTab(); return; } tj.apply(this, arguments); addTab(); };
  if (tg) townShowGear = function(){ tg.apply(this, arguments); addTab(); };
  handleTownAction = function(a){ if (a === 'town-jt-study'){ SFX.click(); uniShowJournalTab(); return true; } return h(a); };
})();

/* ---- the guide ---- */
(function(){
  const t = typeof GUIDE_TOPICS !== 'undefined' && GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>Longneck University</b>, through the iron gate in the Town Square (it opens after Chapter 1). There is no pass: you have <b>study energy</b> that refills at midnight. Spend it on a <b>lecture</b> (2), a <b>book</b> (1), <b>homework</b> (1) or an <b>exam</b> (3), all answered with trivia about giraffes, science, space and history. Each of eight faculties levels up (levels 5, 10 and 15 give bigger bonuses) and gives a permanent bonus in a run: more xp, dodging, drop luck, free rerolls, gold, faster cards, boss damage and pickup range. Passing an exam earns a degree; total levels raise your rank, which gives a smarter giraffe in a run (a chance of a fourth card at a level-up, and Eureka, a free card level). The Campus Café sells energy for gold or gems, and fish, crab and bread from your satchel work too.</li></ul>'); }; }
})();
