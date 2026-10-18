'use strict';
/* Wave pace: shorter waves at the same difficulty, and the "call the next wave" button. */
/* ========================= 44s. WAVE PACE ========================= */
/* What makes a wave shorter (the numbers are in js/31-waves-update.js, the experience and drop compensation in killEnemy):
     1. Every wave has WAVE_COUNT_MUL (0.6) of its old enemies, arriving at the same rate. The spawn clock is 40% shorter, the
        number of enemies on the field at once is the same, so the pressure is the same.
     2. Each enemy that is left is worth KILL_VALUE (1 / 0.6) in experience, score and chance of a drop, so a wave pays what it
        always paid and the player is at the same level and card count at the same point of the chapter. Bosses are unchanged.
     3. When the field is empty the next arrival is brought forward (nothing was happening anyway).
     4. The ends of a wave are shorter: 0.8 s intro (was 1.6), 1 s clear (was 2.1), 6 s patience (was 11), and the herd starts closing
        in 1 s after the last spawn instead of 3.
     5. This file: when everything has spawned and a few enemies are left, a button (and the "Call the next wave" key, N) ends the
        wave now. Stragglers roll into the next wave and the wave pays its "survived" reward rather than "clear", exactly as when
        the patience runs out. It is not offered while a boss is alive, or on a chapter's last wave (the boss has to go down). */
function canCallNextWave(){
  return G.state === 'playing' && !G.attract && G.waveState === 'active' && !!G.spawnQueue && G.spawnQueue.length === 0 &&
    G.enemies.length > 0 && !G.bossAlive && !isChapterFinaleWave(G.wave) && G.waveOver > 0.4 && G.waveOver <= WAVE_PATIENCE_S;
}
function callNextWave(){
  if (!canCallNextWave()) return false;
  G.waveOver = WAVE_PATIENCE_S + 0.01;                      /* the wave resolves on the next update, the same way as when patience runs out */
  try { SFX.click(); addText(P.x, P.y - 58, 'Next wave called', '#F2B33D', 16, false); } catch (e) {}
  return true;
}
(function(){
  let btn = null, shown = false, lastLabel = '';
  function make(){
    btn = document.createElement('button');
    btn.id = 'nextWaveBtn'; btn.type = 'button';
    ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ btn.addEventListener(ev, function(e){ e.stopPropagation(); }); });
    btn.addEventListener('click', function(e){ e.stopPropagation(); callNextWave(); });
    document.body.appendChild(btn);
  }
  const tick = Feedback.tick;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    const on = canCallNextWave();
    if (on === shown && btn) { if (on && !Input.hasTouch){ const l = 'Call the next wave (' + keyName(keyOf('nextwave')) + ')'; if (l !== lastLabel){ btn.textContent = l; lastLabel = l; } } return; }
    if (!btn) make();
    shown = on;
    btn.textContent = lastLabel = Input.hasTouch ? 'Call the next wave' : 'Call the next wave (' + keyName(keyOf('nextwave')) + ')';
    btn.className = on ? 'on' : '';
  };
  window.addEventListener('keydown', function(e){
    if (e.repeat || e.code !== keyOf('nextwave') || G.rebinding) return;
    const a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return;
    if (callNextWave()) e.preventDefault();
  });
})();
