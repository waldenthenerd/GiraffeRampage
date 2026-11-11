// An example add-on: copy this file up one level, into addons/, reload the game, and switch "Wave Cheer" on in Add-ons.
// Every new wave, she shouts something over her head. See "Building your own add-on" in README.md.
(function(){                             // keeps this file's names (WAVE_CHEERS) from clashing with the game's or another add-on's
  addonRegister({
    id: 'wavecheer',                     // 1 to 24 lowercase letters or digits, unique
    name: 'Wave Cheer',
    desc: 'She cheers at the start of every wave.',
    tag: 'silly'                         // 'experimental', 'extra' or 'silly'
  });

  const WAVE_CHEERS = ['Bring it on!', 'Next!', 'Is that all?', 'Here we go again!', 'Ready!'];

  // addonWrap(id, functionName, fn): while the add-on is on, the game calls fn instead, with the original function first.
  // While it is off, the game runs exactly as before.
  addonWrap('wavecheer', 'startWave', function(base, n){
    const result = base(n);              // let the game start the wave as usual
    addText(P.x, P.y - 70, WAVE_CHEERS[n % WAVE_CHEERS.length], '#FFE27A', 18, true);
    return result;
  });
})();
