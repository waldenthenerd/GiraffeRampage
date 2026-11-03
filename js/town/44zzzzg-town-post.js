'use strict';
/* ========================= 44zzzzg. THE CAFÉ MENU, THE POST OFFICE AND THE NEWSPAPER ========================= */
/* Three places that grow with the chapters she has finished (the town's rewards for finishing chapters):
     Penny's Café     the bar's menu: a dish for each chapter. One dish eaten between runs makes her "well fed" for the next run only (a small boost in
                      recalcStats through applyMutations; it is used up when the run starts). Eating another one replaces the first.
     Post Office      on Market Street (and the phone's Mail app): a letter from someone in town as each chapter is finished, most with a small gift,
                      taken when the letter is opened.
     Newsstand        the Longneck Gazette (and the phone's News app): a new paper every day, a headline from what she has done, the weather for the next
                      twelve minutes, columns that open with the chapters, and one task for the day that pays gems.
   State is in Save.data.gad (js/town/44zzzzc-gadgets.js): meal, ate{}, mail{read,got}, news{d,base,v,q,done}. */

/* ---- the café menu ---- */
const GAD_MEALS = [
  { id: 'tea', need: 0, cost: { coin: 1 }, name: 'Acacia tea', fx: 'a little quicker on her feet', f: function(s){ s.speedMul += 0.05; } },
  { id: 'bun', need: 1, cost: { coin: 1 }, name: 'Honey bun', fx: '+12 health', f: function(s){ s.maxHpAdd += 12; } },
  { id: 'cake', need: 2, cost: { coin: 2 }, name: 'Iceberg ice-cream cake', fx: '+8% experience', f: function(s){ s.xpMul += 0.08; } },
  { id: 'stew', need: 3, cost: { coin: 2 }, name: 'Swamp stew', fx: 'heals a little all the time', f: function(s){ s.regen += 0.7; } },
  { id: 'noodles', need: 4, cost: { coin: 2 }, name: 'Kelp noodles', fx: 'picks things up from further away', f: function(s){ s.pickupMul += 0.12; } },
  { id: 'salad', need: 5, cost: { coin: 3 }, name: 'Jungle fruit salad', fx: '+8% gold from the run', f: function(s){ s.goldMul += 0.08; } },
  { id: 'chilli', need: 6, cost: { coin: 3 }, name: 'Houston chilli', fx: '+8% kick damage', f: function(s){ s.kickDmgMul += 0.08; } },
  { id: 'pouch', need: 7, cost: { coin: 3 }, name: 'Astronaut pouch', fx: 'quicker, and heals a little', f: function(s){ s.speedMul += 0.06; s.regen += 0.4; } },
  { id: 'cheese', need: 8, cost: { coin: 4 }, name: 'Moon cheese', fx: '+15 health', f: function(s){ s.maxHpAdd += 15; } },
  { id: 'soda', need: 9, cost: { coin: 4 }, name: 'Venus citrus soda', fx: '+10% experience', f: function(s){ s.xpMul += 0.10; } },
  { id: 'sauce', need: 10, cost: { coin: 5 }, name: 'Inferno hot sauce', fx: '+10% damage from everything', f: function(s){ s.allDmgMul += 0.10; } },
  { id: 'honey', need: 11, cost: { coin: 5 }, name: 'Glimmer honey', fx: '+5% critical hits', f: function(s){ s.crit += 0.05; } },
  { id: 'burger', need: 12, cost: { gems: 60 }, name: 'The classified burger', fx: '+20 health and heals a little', f: function(s){ s.maxHpAdd += 20; s.regen += 0.5; } },
  { id: 'bar', need: 13, cost: { gems: 80 }, name: 'Mars protein bar', fx: '+12% kick damage', f: function(s){ s.kickDmgMul += 0.12; } },
  { id: 'pop', need: 14, cost: { gems: 90 }, name: 'Dome frost-pop', fx: 'takes 6% less damage', f: function(s){ s.dr += 0.06; } },
  { id: 'espresso', need: 15, cost: { gems: 100 }, name: 'Tower espresso', fx: 'a good deal quicker', f: function(s){ s.speedMul += 0.10; } },
  { id: 'rations', need: 16, cost: { gems: 110 }, name: 'Militia rations', fx: '+25 health', f: function(s){ s.maxHpAdd += 25; } },
  { id: 'fortpack', need: 17, cost: { gems: 120 }, name: 'Field pack from the Fort', fx: '+10% damage and takes 5% less', f: function(s){ s.allDmgMul += 0.10; s.dr += 0.05; } },
  { id: 'coconut', need: 18, cost: { gems: 130 }, name: 'Island coconut', fx: 'heals steadily, +8% experience', f: function(s){ s.regen += 1.2; s.xpMul += 0.08; } }
];
const GAD_MEAL_BY_ID = {}; GAD_MEALS.forEach(function(m){ GAD_MEAL_BY_ID[m.id] = m; });
function mealOpen(m){ return m.need === 0 || townDoneCh(m.need); }
function mealPrice(m){ return m.cost.coin ? { gold: m.cost.coin * townCoin(), gems: 0 } : { gold: 0, gems: m.cost.gems }; }
const GADRUN = { meal: '' };
function mealBuy(id){
  const m = GAD_MEAL_BY_ID[id]; if (!m || !mealOpen(m)) return false;
  const p = mealPrice(m), d = Save.data; if (goldInt(d.gold) < p.gold || (d.gems | 0) < p.gems) return false;
  d.gold = goldInt(d.gold) - p.gold; d.gems = (d.gems | 0) - p.gems; gadData().meal = m.id; Save.write(); return true;
}
function townShowMenu2(){
  const g = gadData(), gold = goldInt(Save.data.gold), gems = Save.data.gems | 0, cur = GAD_MEAL_BY_ID[g.meal];
  let h = '<div class="tp-title">PENNY’S MENU</div><div class="gd-purse">' + fmt(gold) + ' gold  ·  ' + fmt(gems) + ' gems</div>' +
    '<div class="mn-now">' + (cur ? 'Waiting for the next run: <b>' + cur.name + '</b> (' + cur.fx + ')' : 'Eat a dish now and she runs well fed: it lasts one run.') + '</div>';
  GAD_MEALS.forEach(function(m){
    const open = mealOpen(m), p = mealPrice(m), can = open && gold >= p.gold && gems >= p.gems, ate = g.ate[m.id] | 0;
    h += '<div class="mn-row' + (open ? '' : ' off') + (g.meal === m.id ? ' on' : '') + '"><span class="mn-n"><b>' + (open ? m.name : '? ? ?') + '</b><small>' + (open ? m.fx + (ate ? '  ·  eaten ' + ate + '×' : '') : 'Finish ' + gadChapterName(m.need) + ' to put it on the menu') + '</small></span>' +
      (open ? '<button class="chalk" data-a="town-meal-' + m.id + '"' + (can ? '' : ' disabled') + '>' + (g.meal === m.id ? 'Waiting' : 'Eat') + '<small>' + (p.gold ? fmt(p.gold) + ' gold' : p.gems + ' gems') + '</small></button>' : '<span class="mn-lock">—</span>') + '</div>';
  });
  h += '<div class="tnote">A new dish joins the menu for every chapter she finishes.</div>';
  townPanelT('menu2', h, { w: 600 });
}
GAD_ACT.order = function(){ townShowMenu2(); };
GAD_LABEL.order = 'Read the menu';
(function(){
  const am = applyMutations;
  applyMutations = function(s){ am.apply(this, arguments); const m = GAD_MEAL_BY_ID[GADRUN.meal]; if (m) m.f(s); };
  const sr = startRun;
  startRun = function(a, b, snap){
    const g = gadData(); GADRUN.meal = '';
    if (!snap && g.meal && GAD_MEAL_BY_ID[g.meal]){ GADRUN.meal = g.meal; g.ate[g.meal] = (g.ate[g.meal] | 0) + 1; g.meal = ''; Save.write(); }
    const r = sr.apply(this, arguments);
    if (GADRUN.meal){ try { addText(P.x, P.y - 78, 'Well fed: ' + GAD_MEAL_BY_ID[GADRUN.meal].name, '#FFE9A0', 16, true); } catch (e) {} }
    return r;
  };
  const h = handleTownAction;
  handleTownAction = function(a){
    const m = /^town-meal-(\w+)$/.exec(a);
    if (m){ if (mealBuy(m[1])){ SFX.level(); townToast('Well fed for the next run: ' + GAD_MEAL_BY_ID[m[1]].name + '.', '#BFFF9A'); } else SFX.deny(); townShowMenu2(); return true; }
    return h(a);
  };
})();

/* ---- the post ---- */
const GAD_MAIL = [
  { id: 'm0', need: 0, from: 'The Mayor', subj: 'Welcome to the post office', body: 'Dear giraffe: the town now has a post office. It was a lot of work for a very small building. Letters will come to you here, and on your phone if you have one. Do come and read them.', gift: { gems: 5 } },
  { id: 'm1', need: 1, from: 'Granny Hoof', subj: 'A little something', body: 'I heard you kicked your way out of the savannah. I always said you had the legs for it. Here is a biscuit, in the form of a gift.', gift: { coin: 1 } },
  { id: 'm2', need: 2, from: 'Crumb', subj: 'Cold hands, warm bread', body: 'They say you crossed the ice. The bakery is warmer than that, and the oven has been keeping a loaf for you. Come by when your hooves thaw.', gift: { gems: 10 } },
  { id: 'm3', need: 3, from: 'Mim', subj: 'Postcard from the window box', body: 'I painted the swamp from your description. It looks a bit like soup. I hope that is right. The picture is on my wall now.', gift: { gems: 10 } },
  { id: 'm4', need: 4, from: 'Marina', subj: 'The harbour is yours', body: 'Past the reef and back? The harbour has been talking about nothing else. The fish at the quay are very impressed. They told me to say so.', gift: { coin: 2 } },
  { id: 'm5', need: 5, from: 'Gus', subj: 'About that jungle', body: 'You came back with leaves in your ears and a look I have only seen on explorers. I made a small badge. Do not read anything into the spelling.', gift: { gems: 15 } },
  { id: 'm6', need: 6, from: 'Torque', subj: 'Houston', body: 'Good job on the city. Do not tell the cars, but I was worried. If you ever need a lift, I know a mechanic with a very large garage.', gift: { coin: 2 } },
  { id: 'm7', need: 7, from: 'Skye', subj: 'From the rooftops', body: 'I saw your rocket from the signal shed. It was the loudest thing I have ever seen, and I have seen a lot of pigeons. Look up tonight: I left a light on for you.', gift: { gems: 20 } },
  { id: 'm8', need: 8, from: 'Rio', subj: 'The Moon', body: 'You stood on the Moon! I went to the telescope and waved. I cannot tell whether you waved back. I am going to say that you did.', gift: { gems: 20 } },
  { id: 'm9', need: 9, from: 'Dewey', subj: 'Library fine, waived', body: 'Your book on Venus is two thousand days overdue. I have decided that this is acceptable, given the circumstances. The fine is hereby waived, and enclosed is a small donation.', gift: { coin: 3 } },
  { id: 'm10', need: 10, from: 'Penny', subj: 'You are on the menu', body: 'The hot sauce on the bar is called “Inferno” because of you. It is very hot. Customers cry and come back. I am calling it a success.', gift: { gems: 25 } },
  { id: 'm11', need: 11, from: 'Tilly', subj: 'The glitter on the grass', body: 'The grass back home has been shining since you went away. Nobody knows why. I think it misses you. I picked you a blade. It is a bit sharp. Careful.', gift: { gems: 25 } },
  { id: 'm12', need: 12, from: 'Barnaby', subj: 'An unmarked envelope', body: 'This came for you with no stamp and no name on the front. Inside there is only a pass, and a note that says: THANKS, SORT OF. I do not know what it means. Neither do the pigeons.', gift: { coin: 4 } },
  { id: 'm13', need: 13, from: 'Volt', subj: 'Your phone, a little more', body: 'You were on Mars and your phone had full signal. I do not know how. I did not do anything. Enclosed: a small credit, and a promise that the screens in my shop are not watching you.', gift: { gems: 40 } },
  { id: 'm14', need: 14, from: 'The Mayor', subj: 'The domes', body: 'The town has had a lot of visitors asking about shiny domes. I told them you are the one to ask. They did not seem satisfied. They are in the café now, being served tea.', gift: { gems: 30 } },
  { id: 'm15', need: 15, from: 'Mim', subj: 'Twenty-five floors', body: 'I looked up at the glass tower from the park and counted the floors, and my neck hurt. Yours must hurt more. Here is a cushion, in the form of a gift.', gift: { coin: 5 } },
  { id: 'm16', need: 16, from: 'A militia corporal', subj: 'To the giraffe who held the line', body: 'We were few and very tired. We held because you did. The town is still here. Thank you from all of us, and from the sandbags, who are retiring.', gift: { gems: 60 } },
  { id: 'm17', need: 17, from: 'Granny Hoof', subj: 'I saw the news', body: 'The paper said you went over the wall. I told the whole street I knew you would, and nobody believed me. Enclosed is a large biscuit.', gift: { gems: 50 } },
  { id: 'm18', need: 18, from: 'An island postmark', subj: 'Someone left a note', body: 'There is a bottle washed up on the beach with a rolled note in it. It says: “She is not the first, and she is not alone. Keep going.” I have put the bottle in the window.', gift: { gems: 70 } }
];
const GAD_MAIL_BY_ID = {}; GAD_MAIL.forEach(function(l){ GAD_MAIL_BY_ID[l.id] = l; });
function mailOpenL(l){ return l.need === 0 || townDoneCh(l.need); }
function mailList(){ return GAD_MAIL.filter(mailOpenL); }
function mailUnread(){ const g = gadData(); return mailList().filter(function(l){ return !g.mail.read[l.id]; }).length; }
function mailShow(from){
  const g = gadData(), list = mailList().slice().reverse(), back = from === 'phone';
  let h = '<div class="tp-title">' + (back ? 'MAIL' : 'POST OFFICE') + '</div>' + (back ? '' : '<div class="ml-clerk">“Your box, madam giraffe. ' + (mailUnread() ? mailUnread() + ' new.' : 'Nothing new, but I have checked twice.') + '”</div>');
  h += '<div class="ml-list">';
  list.forEach(function(l){
    const unread = !g.mail.read[l.id];
    h += '<button class="ml-row' + (unread ? ' new' : '') + '" data-a="town-mail-' + l.id + (back ? '-p' : '') + '"><i>' + (unread ? '✉' : '✓') + '</i><span><b>' + l.subj + '</b><small>' + l.from + '</small></span></button>';
  });
  h += '</div><div class="tnote">' + GAD_MAIL.length + ' letters in all: ' + list.length + ' have come so far. More come as she finishes chapters.</div>' + (back ? '<div class="ph-home"><button class="tbtn" data-a="town-phone">Home</button></div>' : '');
  townPanelT(back ? 'phone' : 'mail', back ? '<div class="ph-bar"><span>Mail</span><span></span></div><div class="ph-screen">' + h + '</div>' : h, { w: back ? 420 : 560, back: back ? 'Put the phone away' : 'Back to town' });
}
function mailRead(id, phone){
  const l = GAD_MAIL_BY_ID[id], g = gadData(); if (!l || !mailOpenL(l)) return;
  const first = !g.mail.read[l.id]; g.mail.read[l.id] = 1;
  let gift = '';
  if (!g.mail.got[l.id] && l.gift){ g.mail.got[l.id] = 1; gift = townPay(l.gift); SFX.level(); }
  Save.write();
  const h = '<div class="ml-paper"><small>' + (first ? 'New letter' : 'Letter') + ' from</small><b>' + l.from + '</b><h3>' + l.subj + '</h3><p>' + l.body + '</p>' + (gift ? '<div class="ml-gift">In the envelope: ' + gift + '</div>' : '') + '</div>' +
    '<div class="tp-foot"><button class="tbtn" data-a="town-mailbox' + (phone ? '-p' : '') + '">Back to the letters</button></div>';
  townPanelT(phone ? 'phone' : 'mail', phone ? '<div class="ph-bar"><span>Mail</span><span></span></div><div class="ph-screen">' + h + '</div>' : h, { w: phone ? 420 : 560, back: phone ? 'Put the phone away' : 'Back to town' });
}
GAD_ACT.postoffice = function(){ mailShow('town'); };
GAD_LABEL.postoffice = function(){ return mailUnread() ? 'Collect the post (' + mailUnread() + ' new)' : 'Look in your post box'; };
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    let m = /^town-mail-(\w+?)(-p)?$/.exec(a);
    if (m && GAD_MAIL_BY_ID[m[1]]){ SFX.click(); mailRead(m[1], !!m[2]); return true; }
    if (a === 'town-mailbox' || a === 'town-mailbox-p'){ SFX.click(); mailShow(a === 'town-mailbox-p' ? 'phone' : 'town'); return true; }
    return h(a);
  };
})();

/* ---- the paper ---- */
const GAD_TASKS = [
  { id: 'dig', text: 'Dig up two glimmering spots', ok: function(g){ return townDaily().got.length >= 2; }, prog: function(g){ return Math.min(2, townDaily().got.length) + ' of 2'; } },
  { id: 'talk', text: 'Have a chat with three people', ok: function(g){ return gadTalkedToday() >= 3; }, prog: function(g){ return Math.min(3, gadTalkedToday()) + ' of 3'; } },
  { id: 'walk', text: 'Visit four different streets', ok: function(g){ return Object.keys(g.news.v || {}).length >= 4; }, prog: function(g){ return Math.min(4, Object.keys(g.news.v || {}).length) + ' of 4'; } },
  { id: 'gift', text: 'Give a gift to someone in the herd', ok: function(g){ return gadGiftedToday() >= 1; }, prog: function(g){ return Math.min(1, gadGiftedToday()) + ' of 1'; } },
  { id: 'run', text: 'Finish a run', ok: function(g){ return (Save.data.runs | 0) >= (g.news.base.runs | 0) + 1; }, prog: function(g){ return Math.min(1, Math.max(0, (Save.data.runs | 0) - (g.news.base.runs | 0))) + ' of 1'; } }
];
function gadTalkedToday(){ const t = townData(), d = townDayKey(); return Object.keys(t.talk).filter(function(k){ return t.talk[k] === d; }).length; }
function gadGiftedToday(){ const t = townData(), d = townDayKey(); return Object.keys(t.gift).filter(function(k){ return t.gift[k] === d; }).length; }
function newsEnsure(){                                 /* a new day: a new paper, a new task, the day's visits start again */
  const g = gadData(), key = townDayKey();
  if (g.news.d !== key){ g.news = { d: key, base: { runs: Save.data.runs | 0 }, v: {}, q: townHash(key + 'task') % GAD_TASKS.length, done: 0, got: g.news.got | 0, seen: 0 }; Save.write(); }
  return g.news;
}
function newsFresh(){ const g = gadData(); return g.news.d !== townDayKey() || !g.news.seen; }
function gadHeadlines(){
  const d = Save.data, key = townDayKey(), done = townChaptersDone(), pick = function(a, s){ return a[townHash(key + s) % a.length]; }, L = [];
  let last = 0; for (let c = 1; c <= 18; c++) if (townDoneCh(c)) last = c;
  if (last) L.push([pick(['LOCAL GIRAFFE CONQUERS ' + String(BESTIARY_CHAPTERS[last - 1] || '').toUpperCase(), 'TOWN TOASTS A CHAPTER WON: ' + String(BESTIARY_CHAPTERS[last - 1] || '').toUpperCase()], 'a'), 'Chapter ' + chapterLabel(last) + ' is done and the whole street heard about it by lunch.']);
  if ((d.runs | 0) > 0) L.push(['' + (d.runs | 0) + ' EXPEDITIONS, AND COUNTING', 'Experts disagree on whether she has a day off. She has been seen napping on a bench.']);
  if (scoreInt(d.totalKills) > 0) L.push([fmt(scoreInt(d.totalKills)) + ' CREATURES KICKED', 'Authorities call the number “a lot”. The creatures decline to comment.']);
  L.push([jbHeardCount() + ' RECORDS IN THE JUKEBOX', 'Penny says the café has never been so musical. Nobody has complained. Yet.']);
  L.push([townFoundTotal() + ' TOWN TREASURES FOUND', 'Hunters are still missing a few. “They are hiding,” says the Mayor.']);
  L.push([pick(['QUIET DAY IN LONGNECK', 'GIRAFFE SEEN LOOKING UP', 'MAYOR LOSES HAT, FINDS HAT'], 'q'), 'Nothing much happened, and the town is grateful for it.']);
  const r = []; const used = {};
  for (let i = 0; i < 3 && L.length; i++){ let k = townHash(key + 'h' + i) % L.length, n = 0; while (used[k] && n++ < L.length) k = (k + 1) % L.length; used[k] = 1; r.push(L[k]); }
  return r;
}
function gadWeather(){
  const w = Math.floor(Date.now() / 240000), name = { rain: 'Rain', storm: 'Storm', fog: 'Fog', clear: 'Clear' }, out = [];
  for (let i = 0; i < 3; i++){ const r = miniRng((w + i) * 7919 + 13)(); out.push(i === 0 && typeof Town.fixWeather === 'string' ? name[Town.fixWeather] || 'Clear' : name[r < 0.14 ? 'rain' : r < 0.2 ? 'storm' : r < 0.3 ? 'fog' : 'clear']); }
  return out;
}
const GAD_COLS = [
  { need: 0, title: 'MARKET PRICES', body: function(){ return 'A coin is worth <b>' + fmt(townCoin()) + ' gold</b> today. A loaf of bread: <b>' + fmt(typeof breadPrice === 'function' ? breadPrice() : 0) + '</b>. A dish at Penny’s: from <b>' + fmt(townCoin()) + '</b>.'; } },
  { need: 0, title: 'AT PENNY’S', body: function(){ const m = GAD_MEALS.filter(mealOpen); const s = m[townHash(townDayKey() + 'dish') % m.length]; return 'Today’s suggestion: <b>' + s.name + '</b>, ' + s.fx + '.'; } },
  { need: 4, title: 'HARBOUR NOTES', body: function(){ return 'The tide is out for the afternoon. Marina reports that the fish are “in a mood”. Bring a good rod.'; } },
  { need: 8, title: 'THE SPACEPORT PAGE', body: function(){ return 'Mission Control reports clear skies for the next window. The telescope is cleaned weekly, whether it needs it or not.'; } },
  { need: 9, title: 'SCIENCE NOTES', body: function(){ return 'Researchers find that sulphur smells of sulphur. A second study is under way to see if it is worse on Venus.'; } },
  { need: 13, title: 'FROM THE RED PLANET', body: function(){ return 'Dust storms, rocks and one very tall tourist. The Mars desk is short-staffed and has asked for volunteers.'; } },
  { need: 16, title: 'HOME GUARD', body: function(){ return 'The militia thanks everyone who brought tea. The sandbags have been given their own bench in the park.'; } },
  { need: 18, title: 'ISLAND DISPATCH', body: function(){ return 'A bottle was found on the beach. The message inside is being studied by three scholars and one gull.'; } }
];
function newsShow(from){
  const n = newsEnsure(), g = gadData(), back = from === 'phone', task = GAD_TASKS[n.q], ok = task.ok(g), wx = gadWeather();
  n.seen = 1; Save.write();
  const hl = gadHeadlines(), dateTxt = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  let h = '<div class="np-mast"><b>THE LONGNECK GAZETTE</b><small>' + dateTxt + '  ·  ' + (townChaptersDone() + ' chapters finished') + '</small></div>';
  h += '<div class="np-lead"><h2>' + hl[0][0] + '</h2><p>' + hl[0][1] + '</p></div>';
  if (hl[1]) h += '<div class="np-two"><div><h4>' + hl[1][0] + '</h4><p>' + hl[1][1] + '</p></div>' + (hl[2] ? '<div><h4>' + hl[2][0] + '</h4><p>' + hl[2][1] + '</p></div>' : '') + '</div>';
  h += '<div class="np-wx"><b>WEATHER</b> Now: ' + wx[0] + '  ·  in 4 minutes: ' + wx[1] + '  ·  in 8: ' + wx[2] + '</div>';
  h += '<div class="np-task"><b>TODAY’S TASK</b><span>' + task.text + '  <em>(' + task.prog(g) + ')</em></span>' +
    (n.done ? '<span class="np-done">Reward taken. Come back tomorrow.</span>' : ok ? '<button class="tbtn" data-a="town-news-claim' + (back ? '-p' : '') + '">Claim 20 gems</button>' : '') + '</div>';
  GAD_COLS.filter(function(c){ return c.need === 0 || townDoneCh(c.need); }).forEach(function(c){ h += '<div class="np-col"><h5>' + c.title + '</h5><p>' + c.body() + '</p></div>'; });
  const locked = GAD_COLS.filter(function(c){ return !(c.need === 0 || townDoneCh(c.need)); }).length;
  if (locked) h += '<div class="tnote">' + locked + ' more column' + (locked === 1 ? '' : 's') + ' will open as she finishes chapters.</div>';
  if (back) h = '<div class="ph-bar"><span>News</span><span></span></div><div class="ph-screen">' + h + '</div><div class="ph-home"><button class="tbtn" data-a="town-phone">Home</button></div>';
  townPanelT(back ? 'phone' : 'news', h, { w: back ? 420 : 620, back: back ? 'Put the phone away' : 'Back to town' });
}
GAD_ACT.news = function(){ newsShow('town'); };
GAD_LABEL.news = function(){ return newsFresh() ? 'Read today’s paper (new)' : 'Read the paper'; };
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    if (a === 'town-news-claim' || a === 'town-news-claim-p'){
      const n = newsEnsure(), g = gadData(), t = GAD_TASKS[n.q];
      if (!n.done && t.ok(g)){ n.done = 1; n.got = (n.got | 0) + 1; const msg = townPay({ gems: 20 }); SFX.level(); townToast('Task done: ' + msg + '.', '#BFFF9A'); Save.write(); } else SFX.deny();
      newsShow(a === 'town-news-claim-p' ? 'phone' : 'town'); return true;
    }
    return h(a);
  };
  const te = townEnter;                                  /* every street she walks into counts toward the day's walk */
  townEnter = function(id){ const n = newsEnsure(); if (TOWN_DIST[id] && !TOWN_DIST[id].indoor) n.v[id] = 1; return te.apply(this, arguments); };
})();

/* ---- painting: the Post Office and the Newsstand on Market Street ---- */
(function(){
  const pb = townBuilding;
  townBuilding = function(c, D, b, P, r){
    if (b.kind !== 'postoffice' && b.kind !== 'newsstand') return pb(c, D, b, P, r);
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
    c.save();
    if (b.kind === 'postoffice'){
      tRect(c, '#C9503C', x0, top, W, h); for (let yy = top + 6; yy < TG; yy += 12) tRect(c, 'rgba(0,0,0,.1)', x0, yy, W, 1.5);
      tRect(c, '#F4F1E8', x0 - 6, top - 12, W + 12, 16); tPoly(c, '#8A2E22', [x0 - 6, top - 12, x, top - 46, x0 + W + 6, top - 12]);
      tRound(c, '#F4F1E8', x - 26, top - 36, 52, 20, 5); tRect(c, '#C9503C', x - 18, top - 30, 36, 8);
      tWin(c, D, x0 + 24, top + 50, 70, 60, '#BFE0F4'); tDoor(c, x0 + W - 62, 54, 98, '#3A2A1E');
      tRound(c, '#2A3A8A', x0 + 108, TG - 92, 42, 92, 10); tRect(c, '#0E1650', x0 + 112, TG - 86, 34, 8); tCircle(c, '#E8C96A', x0 + 129, TG - 54, 4);   /* the postbox, standing on the ground */
      tSign(c, b.label, x, top + 130, 170, '#8A2E22', '#FFF2D0');
    } else {
      tRect(c, '#4A3A2C', x0, TG - 84, W, 84); tRect(c, '#6A5238', x0, TG - 84, W, 8); tRect(c, 'rgba(0,0,0,.15)', x0 + 6, TG - 70, W - 12, 60);
      tRect(c, '#5A4630', x0 + 4, top, 6, h - 84); tRect(c, '#5A4630', x0 + W - 10, top, 6, h - 84);
      for (let i = 0; i < 6; i++) tRect(c, i % 2 ? '#FFD84D' : '#F4F1E8', x0 - 4 + i * ((W + 8) / 6), top - 4, (W + 8) / 6, 22);
      for (let i = 0; i < 4; i++){ tRect(c, '#F4F1E8', x0 + 14 + i * 28, TG - 66, 22, 30); tRect(c, '#2A2A30', x0 + 17 + i * 28, TG - 62, 16, 4); tRect(c, 'rgba(0,0,0,.35)', x0 + 17 + i * 28, TG - 54, 16, 2); tRect(c, 'rgba(0,0,0,.25)', x0 + 17 + i * 28, TG - 48, 12, 2); }
      tSign(c, 'GAZETTE', x, top + 36, 96, '#2A2A30', '#F4F1E8');
    }
    c.restore();
  };
})();
