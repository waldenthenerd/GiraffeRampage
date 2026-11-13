'use strict';
/* The Monkey Hat: a little monkey that rides on her head, found only by a secret. */
/* ========================= 44zzzzi. THE MONKEY HAT ========================= */
/* THE SECRET: in one run, with no hat on, defeat 20 monkeys (the savanna's baboons, or the jungle's howler monkeys; the other chapters dress
   the same creature as something else, an ermine or a drone, and those do not count). When the twentieth falls, a monkey climbs onto her
   bare head and stays: "Ooh ooh!". Nothing in the game says how; the Gear page of the town journal only hints at it. On the way the monkeys chatter
   (at the 10th, a small "ooh?"; at the 15th, a louder one and a line that they are eyeing her bare head), so a player who stumbles on it can tell
   something is building; once she owns the hat, or with a hat on, they say nothing.
   It is a town-style hat (town: true keeps it off the minigame wheel) so it shows in the wardrobe, the collection's "Only in Longneck Town"
   section and the journal like the others. It takes the LAST place photo codes can number (6 bits, ACC_ITEMS index 63): nothing may be
   added to ACC_ITEMS after it without a new photo code version. Owning it is miniData().own.monkey, like every other hat, so no new save field. */
const MONKEY_HAT_GOAL = 20;
const MONKEY = { n: 0 };                                            /* monkeys defeated bare-headed this run */
const MONKEY_CHATTER = [10, 15];                                    /* the counts at which the monkeys chatter, a hint that something is building */
(function(){
  const h = { id: 'monkey', name: 'Monkey Hat', c: '#7A4A26', kind: 'hat', rare: false, p: 0, town: true, secret: true };
  if (ACC_ITEMS.length >= 63) return;                               /* the photo codes cannot number any more */
  ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID.monkey = h;
  TOWN_SPECIAL_SRC.monkey = 'A secret. Some monkeys are looking for a bare head to live on.';

  const FUR = '#7A4A26', DARK = '#4E2C14', FACE = '#E8C49A', PINK = '#D99A86';
  /* side view: she sits on the crown of the head, facing the way the giraffe faces (+x), hugging it, her tail curled off the back */
  TOWN_HAT_SIDE.monkey = function(c, t){
    t = t || 0;
    const sw = Math.sin(t * 2.6), bob = Math.abs(Math.sin(t * 1.7)) * 0.8, blink = (t % 3.4) < 0.12;
    c.rotate(0.3); c.scale(0.8, 0.8);                               /* the head tips hats back; she sits up straight, and no taller than a top hat */
    /* the tail, curling up behind her */
    c.strokeStyle = DARK; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6, -3); c.bezierCurveTo(-14, -2, -17, -10 + sw, -13, -14 + sw); c.quadraticCurveTo(-9.5, -16 + sw, -10.5, -12 + sw * 0.6); c.stroke();
    c.translate(0, -bob);
    /* the legs and feet hanging over the brow */
    c.fillStyle = FUR; c.beginPath(); c.ellipse(4, -1.2, 5, 2.4, 0.3, 0, TAU); c.fill();
    c.fillStyle = FACE; c.beginPath(); c.ellipse(8.4, 0.6, 2, 1.4, 0.3, 0, TAU); c.fill();
    /* the body */
    c.fillStyle = FUR; c.beginPath(); c.ellipse(-1, -6.5, 6.4, 6.2, 0, 0, TAU); c.fill();
    c.fillStyle = FACE; c.beginPath(); c.ellipse(1.6, -5.4, 3.2, 4, 0.1, 0, TAU); c.fill();
    /* the arm round the front, holding on */
    c.strokeStyle = FUR; c.lineWidth = 2.6; c.beginPath(); c.moveTo(1, -9); c.quadraticCurveTo(6, -7, 6.4, -2.6); c.stroke();
    c.fillStyle = FACE; c.beginPath(); c.arc(6.6, -2.2, 1.3, 0, TAU); c.fill();
    /* the head */
    c.fillStyle = FUR; c.beginPath(); c.arc(1, -15.5, 5.6, 0, TAU); c.fill();
    c.beginPath(); c.arc(-3.8, -16.4, 2.5, 0, TAU); c.fill();                                   /* the far ear peeks out behind */
    c.fillStyle = PINK; c.beginPath(); c.arc(-4, -16.4, 1.3, 0, TAU); c.fill();
    c.fillStyle = FACE; c.beginPath(); c.ellipse(3.4, -14.8, 3.6, 3.4, 0, 0, TAU); c.fill();       /* the face */
    c.beginPath(); c.ellipse(5.6, -13, 2.4, 1.8, 0, 0, TAU); c.fill();                           /* the muzzle */
    c.fillStyle = '#1E140C';
    if (blink) c.fillRect(2.6, -16.2, 2.4, 0.7); else { c.beginPath(); c.arc(3.8, -16, 0.95, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(4.1, -16.3, 0.35, 0, TAU); c.fill(); }
    c.fillStyle = '#1E140C'; c.beginPath(); c.arc(7.2, -13.6, 0.45, 0, TAU); c.fill();           /* a nostril */
    c.strokeStyle = '#6A3A22'; c.lineWidth = 0.7; c.beginPath(); c.arc(5.6, -12.6, 1.4, 0.3, 1.9); c.stroke();     /* a smile */
    c.fillStyle = DARK; c.beginPath(); c.moveTo(-1, -20.6); c.quadraticCurveTo(1.4, -23.4, 2.2, -20.8); c.quadraticCurveTo(3.4, -22.6, 4, -20.4); c.closePath(); c.fill();     /* a tuft */
  };
  /* top-down: her back and head, nose toward +x, the tail curling round to one side */
  TOWN_HAT_TOP.monkey = function(c, t){
    const sw = Math.sin((t || 0) * 2.6) * 1.2;
    c.strokeStyle = DARK; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6, 0); c.bezierCurveTo(-12, 2 + sw, -12, 9 + sw, -6, 9 + sw); c.stroke();
    c.fillStyle = FUR; c.beginPath(); c.ellipse(-1.5, 0, 6.2, 5.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(-1, -6, 2.4, 1.6, 0.4, 0, TAU); c.ellipse(-1, 6, 2.4, 1.6, -0.4, 0, TAU); c.fill();     /* arms */
    c.beginPath(); c.arc(5, 0, 4.4, 0, TAU); c.fill();
    c.fillStyle = PINK; c.beginPath(); c.arc(4, -4.6, 1.6, 0, TAU); c.arc(4, 4.6, 1.6, 0, TAU); c.fill();           /* ears */
    c.fillStyle = FACE; c.beginPath(); c.ellipse(7.6, 0, 2, 2.6, 0, 0, TAU); c.fill();
  };

  /* the counting: a wrapper on killEnemy, so it sees every kill however it happens */
  const isMonkey = function(e){ return e && e.type === 'baboon' && e.def && (!e.def.look || e.def.look === 'howler'); };
  const sr = startRun;
  startRun = function(){ MONKEY.n = 0; return sr.apply(this, arguments); };
  const ke = killEnemy;
  killEnemy = function(e){
    const counts = e && !e.dead && isMonkey(e);
    const r = ke.apply(this, arguments);
    if (counts && !G.attract && !accOwned('monkey') && !accEquipped('hat')){
      MONKEY.n++;
      if (MONKEY.n >= MONKEY_HAT_GOAL) monkeyHatGive();
      else if (MONKEY_CHATTER.indexOf(MONKEY.n) >= 0) monkeyChatter(MONKEY.n);
    }
    return r;
  };
})();
/* the monkeys notice her bare head: a small "ooh?" over her at the 10th, a louder chatter and a hint at the 15th, with a short monkey sound.
   Text and sound only, no flash; the sound goes through SFX.tone, so mute and the effects volume apply. */
function monkeyChatter(n){
  const big = n >= MONKEY_CHATTER[MONKEY_CHATTER.length - 1];
  try { if (typeof gagSay === 'function'){
    gagSay(P.x + 16, P.y - 72, big ? 'Ooh ooh? Ah?' : 'ooh?', '#FFD98A', big ? 2.2 : 1.8);
    if (big) gagSay(P.x, P.y - 52, 'The monkeys are eyeing her bare head.', '#FFF6D8', 2.6);
  } } catch (err) {}
  try { if (SFX.ctx){
    const b = SFX.abilityGain;
    SFX.tone('triangle', 480, 760, 0.09, 0.13, 0, 0, b);           /* "ooh" */
    SFX.tone('triangle', 620, 940, 0.08, 0.11, 0.12, 0, b);
    if (big) SFX.tone('triangle', 980, 640, 0.11, 0.12, 0.25, 0, b);  /* "ah" */
  } } catch (err) {}
}
/* the monkey moves in: she owns it and wears it at once (her head is bare, so miniAward puts it on) */
function monkeyHatGive(){
  if (accOwned('monkey') || !ACC_BY_ID.monkey) return;
  miniAward({ item: ACC_BY_ID.monkey });
  Save.write();
  try { if (typeof gagSay === 'function'){ gagSay(P.x, P.y - 80, 'Ooh ooh! Ah ah!', '#FFD98A', 2.4); gagSay(P.x, P.y - 58, 'A monkey has moved onto her head.', '#FFF6D8', 3); } } catch (err) {}
  try { if (typeof SFX !== 'undefined' && SFX.pick) SFX.pick(); } catch (err) {}
  try { burstParticles(P.x, P.y - 50, 14, '#FFD98A', 160, 3, { glow: true }); } catch (err) {}
}
