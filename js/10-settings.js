'use strict';
/* Settings object (volumes, speed, layout, keys). */
/* ========================= 20. SETTINGS ========================= */
const Settings = {
  autoKick: true, aimMode: 'cursor', muted: false, showGear: true, hitFlash: 1, musicVol: 0.6, sfxVol: 1, ambVol: 1, levelGap: 5, autoPerf: true, autoBread: true, autoPause: true, touchLeft: false, touchScale: 0.5, fxLevel: 2, calmFlash: false, npcVoice: true, textScale: 0, keys: {}, speedMode: false,
  load(){
    const d = Save.data;
    this.autoKick = d.autoKick !== false;
    this.aimMode = d.aimMode === 'move' ? 'move' : 'cursor';
    this.muted = !!d.muted;
    this.showGear = d.showGear !== false;
    this.hitFlash = typeof d.hitFlash === 'number' ? clamp(d.hitFlash, 0, 1) : 1;
    this.musicVol = typeof d.musicVol === 'number' ? clamp(d.musicVol, 0, 1) : 0.6;
    this.sfxVol = typeof d.sfxVol === 'number' ? clamp(d.sfxVol, 0, 1) : 1;
    this.ambVol = typeof d.ambVol === 'number' ? clamp(d.ambVol, 0, 1) : 1;
    this.autoPerf = d.autoPerf !== false;
    this.autoBread = d.autoBread !== false;
    this.levelGap = typeof d.levelGap === 'number' && isFinite(d.levelGap) ? clamp(Math.round(d.levelGap), 0, 20) : 5;     /* seconds between earning a level and choosing the card */
    this.autoPause = d.autoPause !== false;
    this.keys = sanitizeKeys(d.keys);
    this.fxLevel = typeof d.fxLevel === 'number' ? clamp(Math.round(d.fxLevel), 0, 2) : ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 2);
    this.calmFlash = !!d.calmFlash;
    this.npcVoice = d.npcVoice !== false;
    this.textScale = (d.textScale === 1 || d.textScale === 2) ? d.textScale : 0;
    this.touchLeft = !!d.touchLeft;
    this.touchScale = typeof d.touchScale === 'number' ? clamp(d.touchScale, 0.5, 1) : 0.5;
    this.speedLevel = (d.speedLevel === 1 || d.speedLevel === 2 || d.speedLevel === 3) ? d.speedLevel : d.speedMode ? 1 : 0;
    this.speedMode = this.speedLevel > 0;
    SFX.setMuted(this.muted);
    try { SFX.setFx(this.sfxVol); applyTouchLayout(); applyTextScale(); } catch (e) {}
  },
  save(){
    Save.data.autoKick = this.autoKick;
    Save.data.aimMode = this.aimMode;
    Save.data.muted = this.muted;
    Save.data.showGear = this.showGear;
    Save.data.hitFlash = this.hitFlash;
    Save.data.musicVol = this.musicVol; Save.data.sfxVol = this.sfxVol; Save.data.ambVol = this.ambVol; Save.data.levelGap = this.levelGap; Save.data.autoPerf = this.autoPerf; Save.data.autoBread = this.autoBread; Save.data.autoPause = this.autoPause; Save.data.touchLeft = this.touchLeft; Save.data.fxLevel = this.fxLevel; Save.data.keys = this.keys; Save.data.touchScale = this.touchScale;
    Save.data.speedMode = this.speedMode; Save.data.speedLevel = this.speedLevel | 0;
    Save.data.calmFlash = this.calmFlash; Save.data.npcVoice = this.npcVoice; Save.data.textScale = this.textScale | 0;
    Save.write();
  }
};


