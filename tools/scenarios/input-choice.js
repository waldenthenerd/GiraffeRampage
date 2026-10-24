/* input-choice: the first start asks whether she plays with touch or keyboard and mouse (once), the answer drives every control tip and is kept; in "mouse" the touch
   handlers step aside, Settings has a row to change it, an old or odd value in a save is tidied, and erasing progress keeps the answer. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  try {
    /* start as a player who has not answered */
    Settings.inputMode = ''; Save.data.inputMode = ''; applyInputMode();
    out.auto = Input.hasTouch === inputAuto() && Input.forceMouse === false;
    G.splash = true; G.state = 'menu';
    GR.handleAction('splash-go');
    out.asks = G.subScreen === 'inputchoice' && /How are you playing/.test(OV.innerHTML) && /data-a="input-touch"/.test(OV.innerHTML) && /data-a="input-mouse"/.test(OV.innerHTML) && !G.splash;
    out.noMenuYet = !/Trophies/.test(OV.innerHTML);

    /* keyboard and mouse */
    GR.handleAction('input-mouse');
    out.mouse = Settings.inputMode === 'mouse' && Input.hasTouch === false && Input.forceMouse === true && Save.data.inputMode === 'mouse' && G.subScreen !== 'inputchoice' && /Trophies/.test(OV.innerHTML);
    out.keyTips = (function(){ Save.data.hintsSeen = {}; var el = document.getElementById('hint'); if (el) el.textContent = ''; Hint.hideT = 0; Hint.show('move'); return /movement keys/.test(document.getElementById('hint').textContent); })();
    var st = document.getElementById('stage') || CTX.canvas, rc = st.getBoundingClientRect();
    var t = new Touch({ identifier: 3, target: st, clientX: rc.left + 40, clientY: rc.top + 40 });
    var ev = new TouchEvent('touchstart', { changedTouches: [t], touches: [t], bubbles: true, cancelable: true }); st.dispatchEvent(ev);
    out.touchIgnored = Input.hasTouch === false && ev.defaultPrevented === false && Input.joyActive === false;
    TOUCH.classList.add('on'); applyInputMode(); out.buttonsHidden = !TOUCH.classList.contains('on');

    /* settings: the row is there and flips it */
    showSettings(); out.row = /How you play/.test(OV.innerHTML) && /Keyboard &amp; mouse|Keyboard & mouse/.test(OV.innerHTML);
    GR.handleAction('s-input'); out.toTouch = Settings.inputMode === 'touch' && Input.hasTouch === true && Input.forceMouse === false && Save.data.inputMode === 'touch';
    Hint.hideT = 0; Save.data.hintsSeen = {}; Hint.show('move'); out.touchTips = /Drag on the left/.test(document.getElementById('hint').textContent);
    var ev2 = new TouchEvent('touchstart', { changedTouches: [t], touches: [t], bubbles: true, cancelable: true }); st.dispatchEvent(ev2); out.touchWorks = ev2.defaultPrevented === true;
    GR.handleAction('s-input'); out.toMouse = Settings.inputMode === 'mouse' && Input.hasTouch === false;

    /* the choice is kept when asked once, and not asked again */
    G.splash = true; GR.handleAction('splash-go'); out.notAgain = G.subScreen !== 'inputchoice' && /Trophies/.test(OV.innerHTML);
    GR.handleAction('input-touch'); out.touchChoice = Settings.inputMode === 'touch';

    /* the Guide says it */
    out.guideBasics = /asked once whether you play with <b>touch<\/b> or <b>keyboard and mouse<\/b>/.test(guideTopicsHTML());

    /* odd values are tidied, and erasing progress keeps her answer */
    Save.data.inputMode = 'banana'; Settings.load(); out.tidyS = Settings.inputMode === '';
    Settings.inputMode = 'mouse'; Settings.save(); Save.reset(); out.keptErase = Save.data.inputMode === 'mouse';
    localStorage.setItem(SAVE_KEY, JSON.stringify({ gold: 5, inputMode: 7 })); Save.load(); out.tidyLoad = Save.data.inputMode === '' && Save.data.gold === 5;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ gold: 5 })); Save.load(); out.oldSave = Save.data.inputMode === '' && DEFAULT_SAVE.inputMode === '';
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['auto', 'asks', 'noMenuYet', 'mouse', 'keyTips', 'touchIgnored', 'buttonsHidden', 'row', 'toTouch', 'touchTips', 'touchWorks', 'toMouse', 'notAgain', 'touchChoice', 'guideBasics', 'tidyS', 'keptErase', 'tidyLoad', 'oldSave'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
