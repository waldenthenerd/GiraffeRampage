'use strict';
/* A close (X) button in the corner of every popup and menu panel. */
/* ========================= 44zm. CLOSE BUTTONS ========================= */
/* The X does what the panel's own "back" button does: it looks for that button (data-a with back/close/resume/done/cancel in it, or
   a label like "Back to ...", "Close", "Done") and clicks it, so every screen keeps its own rules (a pause menu resumes, a town panel
   goes back to town, a settings page goes to the menu). A panel with no such button gets no X, and neither do the title menu, the
   level-up cards, the death screen and the cutscenes, where there is nothing to close. The town's conversation card gets one too. */
(function(){
  const DA = /(^|-)(back|close|resume|done|cancel|exit|leave)(-|$)/i, TX = /^\s*(back|close|done|cancel|resume|continue|leave|keep exploring|ok|okay|exit)\b/i;
  function closer(panel){
    const bs = Array.prototype.slice.call(panel.querySelectorAll('button'));
    let best = null, bestScore = 0;
    bs.forEach(function(b){
      if (b.disabled || b.classList.contains('xclose')) return;
      const da = b.getAttribute('data-a') || '', tx = b.textContent || '';
      let s = 0;
      if (/^(town-close|resume|settings-back|gallery-back|mini-back|back|ward-book-back)$/.test(da)) s = 4;
      else if (DA.test(da)) s = 3;
      else if (TX.test(tx)) s = 2;
      if (s > bestScore){ best = b; bestScore = s; }
    });
    return best;
  }
  function allowed(){
    if (G.state === 'playing' || G.state === 'cutscene' || G.state === 'levelup' || G.state === 'dead') return false;
    if (G.state === 'menu' && !G.subScreen) return false;
    return true;
  }
  function decorate(){
    if (!OV || OV.className.indexOf('on') < 0) return;
    const ok = allowed();
    OV.querySelectorAll('.panel').forEach(function(p){
      const has = p.querySelector(':scope > .xclose');
      if (!ok){ if (has) has.remove(); return; }
      if (has) return;
      if (p.parentElement && p.parentElement.closest('.panel')) return;                    /* nested panels */
      if (!closer(p)) return;
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'xclose'; x.setAttribute('aria-label', 'Close'); x.title = 'Close'; x.textContent = '×';
      x.addEventListener('click', function(e){
        e.stopPropagation();
        const b = closer(p); if (b){ b.click(); }
      });
      p.insertBefore(x, p.firstChild);
    });
  }
  let pending = false;
  const sched = function(){ if (pending) return; pending = true; setTimeout(function(){ pending = false; try { decorate(); } catch (e) { console.warn('close-x', e); } }, 30); };
  new MutationObserver(sched).observe(OV, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
  /* the conversation card: X ends it */
  const dlg = document.getElementById('townDlg') || null;
  function dlgX(){
    const d = document.getElementById('townDlg'); if (!d || d.querySelector('.xclose')) return;
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'xclose'; x.setAttribute('aria-label', 'Close'); x.title = 'Close'; x.textContent = '×';
    x.addEventListener('click', function(e){ e.stopPropagation(); if (typeof townCloseDialog === 'function') townCloseDialog(); });
    d.appendChild(x);
  }
  if (typeof townSay === 'function'){
    const ts = townSay;
    townSay = function(){ const r = ts.apply(this, arguments); try { dlgX(); } catch (e) {} return r; };
  }
  window.closeXRefresh = function(){ decorate(); };
  sched();
})();
