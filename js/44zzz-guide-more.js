'use strict';
/* The Guide, for what came after it was written: fishing, Trophies, Play together, and how she plays (touch or keyboard and mouse). */
/* ========================= 44zzz. GUIDE TOPICS FOR THE NEWER PARTS ========================= */
/* Each is a topic in GUIDE_TOPICS (js/44r-guide.js), written from what the game actually does and spelling keys and buttons the way she plays (touch, keyboard or controller). */
(function(){
  const at = function(id){ return GUIDE_TOPICS.findIndex(function(t){ return t.id === id; }); };
  const place = function(topic, after){ const i = at(after); GUIDE_TOPICS.splice(i < 0 ? GUIDE_TOPICS.length : i + 1, 0, topic); };
  const pad = function(){ return !!Input.padUsed; };
  const reelKey = function(){ return Input.hasTouch ? 'the <b>Reel</b> button' : pad() ? '<b>A</b>' : 'the <b>Reel</b> button, <b>Space</b> or <b>Enter</b>'; };
  place({ id: 'fishing', title: 'Fishing', show: function(){ const t = Save.data && Save.data.town; return !!(t && ((t.vis && t.vis.harbour) || (t.fish && Object.keys(t.fish).length))); }, html: function(){
    return '<p>Fish from the end of the pier in the Harbour, or from your own boat at sea. There are <b>' + FISH.length + ' kinds</b>, kept in the <b>Fish book</b> with the biggest you have landed.</p><ul class="helplist">' +
      '<li><b>Cast</b> and wait for the float to dip. At sea, slow the boat to a stop and press <b>' + (Input.hasTouch ? 'the Cast button' : pad() ? 'A' : keyName(keyOf('cast'))) + '</b>.</li>' +
      '<li><b>Hook it:</b> when the marker is in the green, press Reel. Then it is a fight: <b>hold</b> ' + reelKey() + ' to wind in. The Line bar fills while you wind and while the fish pulls, and empties when you let go. <b>Let go before it reaches the red end</b> or the line snaps. Keep it out of the red and the catch pays a quarter more and leaves an extra scale.</li>' +
      '<li>Every kind fights in its own way: some dart, some make long runs, some dive, and the boot hardly fights at all.</li>' +
      '<li><b>Tackle is free.</b> A new rod, line and bait come with how many kinds you have caught (the Cane rod at 5, up to the Golden rod at all ' + FISH.length + '). Walk into the <b>Bait &amp; Tackle</b> shack to see them all and take the ones you want; the same buttons are in the fishing panel.</li>' +
      '<li>Every catch leaves <b>scales</b>. At the shack’s <b>gear bench</b> they raise a piece of your gear one level, like a duplicate from a crate.</li>' +
      '<li>Dawn, dusk, rain, storms and fog change how fast they bite and how big and rare they are. Each day <b>seven fishing spots</b> glimmer on the sea and show on the sea chart once you have charted them; the <b>hot spot</b> is the best of all.</li>' +
      '<li>Brine’s weekly order pays gems. Your four best catches hang on the wall at home. <b>Auto-recast</b> casts again for you after each catch.</li></ul>';
  } }, 'town');
  place({ id: 'trophies', title: 'Trophies', show: function(){ return true; }, html: function(){
    return '<p>The <b>Trophies</b> button on the main menu is a wall of goals the game keeps track of by itself: kills, runs, chapters, gear, the Bestiary, town finds, fishing and more.</p><ul class="helplist">' +
      '<li>A goal pays a few gems <b>once</b>, the moment it is done. A small banner tells you; several at once are gathered into one.</li>' +
      '<li>Nothing is counted in Play together.</li></ul>';
  } }, 'town');
  place({ id: 'together', title: 'Play together', show: function(){ return true; }, html: function(){
    return '<p><b>Play together</b> on the main menu puts two giraffes on one screen, just for fun. Nothing is kept: no gold, experience, scores or trophies.</p><ul class="helplist">' +
      '<li><b>Arena fight:</b> survive rounds of creatures from a chapter you have finished. A giraffe that is knocked down is revived when the other stands beside her.</li>' +
      '<li><b>Kick-about yard:</b> kick the ball into the other side’s goal; first to five wins.</li>' +
      '<li>Giraffe 1 uses ' + guideKey('up') + guideKey('left') + guideKey('down') + guideKey('right') + ' and <b>Space</b> (or the mouse button); giraffe 2 uses the <b>arrow keys</b> and <b>Enter</b>. With two controllers, the first plays giraffe 1 and the second giraffe 2; with one, it plays giraffe 2.</li></ul>';
  } }, 'ants');
  place({ id: 'wheels', title: 'Skateboards and bicycles', show: function(){ return typeof wheelsOwned === 'function' && wheelsOwned(); }, html: function(){
    return '<p>Buy a skateboard, a cruiser board, a bicycle or a racing bike at <b>Spoke &amp; Board</b>, at the far end of Willow Park.</p><ul class="helplist">' +
      '<li><b>Get on and off</b> with the Ride button' + (Input.hasTouch ? '' : ' or <b>' + keyName(keyOf('ride')) + '</b>') + '. Pick which one in the shop. Opening any panel, sitting down or getting in a car takes her off.</li>' +
      '<li>On wheels she is quicker, but speeds up and slows down slowly. Hold up to stretch her neck as usual. Unlike a car, a board or bike goes <b>indoors</b>.</li>' +
      '<li>Fast riding has a small chance of a <b>fall</b>, more indoors and when she turns right round at speed. She gets up on foot; nothing is lost.</li>' +
      '<li>The people inside have opinions about a giraffe on a bicycle in their bakery. Crazy is the kind word.</li></ul>';
  } }, 'town');
  place({ id: 'domes', title: 'Chapter 13.5: the Domes', show: function(){ return !!(Save.data && Save.data.chapter13Complete); }, html: function(){
    return '<p>A short chapter between Mars and the next place: <b>ten waves</b>, 326 to 335, with a boss on wave 330 and another on 335. It opens when you finish Chapter 13, and begins with the town helicopter flying out to a ring of mirrored domes.</p><ul class="helplist">' +
      '<li>It is hot outside and freezing inside. The creatures are Chapter 2\u2019s, changed by the glimmer, and they hit <b>about one and a third to two times</b> harder than the end of Chapter 13.</li>' +
      '<li>Finish wave 335 and the helicopter takes off, and you win the coat colour <b>Frost Mylar</b>. There is no minigame after it.</li>' +
      '<li>You can play it from the menu with its own card, and in Play together.</li></ul>';
  } }, 'chapters');
  place({ id: 'tower', title: 'Chapter 14: the Tower', show: function(){ return !!(Save.data && Save.data.chapter14Complete); }, html: function(){
    return '<p>The last place the trail goes: a glass tower in New York, <b>twenty-five floors</b> (waves 336 to 360), one wave on each, with a boss on every fifth floor. It opens when you finish Chapter 13.5.</p><ul class="helplist">' +
      '<li>Every floor is a different set of rooms joined by doorways. <b>The walls and the furniture cannot be broken</b>, and they stop every shot, yours and theirs. Creatures that cannot see you come round through the doors.</li>' +
      '<li>When a floor is clear the lift opens. Walk into it to go up. It saves your run, and the next floor starts when you step out.</li>' +
      '<li>Everything in the building is new: office machines and lab animals the glimmer has got into.</li>' +
      '<li>Finish wave 360 and you win the coat colour <b>Executive Navy</b>, the usual chapter rewards, and one more <b>Mutation Vial</b> for the lab. You can play it from the menu and in Play together.</li></ul>';
  } }, 'chapters');
  place({ id: 'intel', title: 'Intelligence', show: function(){ return typeof intel === 'function' && intel() > 0; }, html: function(){
    return '<p><b>Intelligence</b> is the average level across all the university faculties, shown as a percentage in the university journal. Yours is <b>' + intelPct() + '%</b>. It is a stat, not a setting: it grows only by studying.</p><ul class="helplist">' +
      '<li>Up to <b>60% fewer falls</b> off boards and bikes.</li>' +
      '<li>Fishing: a slightly <b>wider green zone</b>, a slightly <b>slower marker</b> and a slightly <b>gentler fight</b> (up to 15%, 12% and 10%).</li>' +
      '<li>Up to <b>30% less screen shake</b>, from every source.</li></ul>';
  } }, 'wheels');
  /* how she plays */
  const b = GUIDE_TOPICS[at('basics')];
  if (b){ const base = b.html; b.html = function(){ return base().replace(/<\/ul>\s*$/, '<li>The game asked once whether you play with <b>touch</b> or <b>keyboard and mouse</b>; the tips and buttons follow that. Change it any time in Settings, under <b>Controls</b>.</li></ul>'); }; }
})();
