'use strict';
/* The photo studio, props: cars, planes and a few more things that can be put in a picture, like the effects. */
/* ========================= 44zl. PHOTO PROPS ========================= */
/* They are added to the END of PHOTO_FX (44n), as 44p requires: a photo code stores the index in 5 bits, so the list may hold 32 in all
   (15 effects + 17 props filled it; boats made the index 6 bits wide, photo code version 4, and version 2 and 3 codes still read). They are saved, copied, shared and put in the album exactly like effects, and old codes read the
   same as before. The cars and planes are drawn by the same painters the town and the flight use, so a new model shows up here too. */
(function(){
  const draw = PHOTO_FXDRAW, add = function(id, name, fn){ PHOTO_FX.push([id, name]); draw[id] = fn; };
  const car = function(kind, col){ return function(c){ c.save(); c.translate(0, 26); c.scale(1.05, 1.05); townCarSide(c, 0, 0, { kind: kind, col: col, t: 0, spin: 0 }); c.restore(); }; };
  const plane = function(kind, col){ return function(c){ c.save(); c.scale(0.95, 0.95); flyPlane(c, 0, 0, { kind: kind, col: col, rider: false, t: 0 }); c.restore(); }; };
  add('car_runabout', 'Car: Runabout', car('runabout', '#D5352B'));
  add('car_coupe', 'Car: Coupe', car('coupe', '#4DA0D8'));
  add('car_jeep', 'Car: Rally Jeep', car('jeep', '#6A8A3E'));
  add('car_hotrod', 'Car: Hot Rod', car('hotrod', '#F2C230'));
  add('plane_sparrow', 'Plane: Sparrow', plane('sparrow', '#D5352B'));
  add('plane_skylark', 'Plane: Skylark', plane('skylark', '#4DA0D8'));
  add('plane_aerobat', 'Plane: Aerobat', plane('aerobat', '#F2C230'));
  add('plane_hauler', 'Plane: Hauler', plane('hauler', '#6BBB45'));
  add('loaf', 'Bread', function(c){
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 26, 52, 8, 0, 0, TAU); c.fill();
    c.fillStyle = '#C98A44'; c.beginPath(); c.ellipse(0, 6, 54, 30, 0, 0, TAU); c.fill();
    c.fillStyle = '#E8B876'; c.beginPath(); c.ellipse(0, 0, 48, 22, 0, 0, TAU); c.fill();
    c.strokeStyle = '#A66A2C'; c.lineWidth = 5; c.lineCap = 'round';
    for (let k = -1; k <= 1; k++){ c.beginPath(); c.moveTo(k * 22 - 8, -12); c.lineTo(k * 22 + 8, 10); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-20, -12, 14, 5, -0.3, 0, TAU); c.fill();
  });
  add('balloon', 'Hot-air balloon', function(c){
    const cols = ['#D5352B', '#F2C230', '#4DA0D8', '#F2C230', '#D5352B'];
    c.save(); c.beginPath(); c.moveTo(0, 20); c.bezierCurveTo(-80, -10, -60, -110, 0, -110); c.bezierCurveTo(60, -110, 80, -10, 0, 20); c.closePath(); c.clip();
    cols.forEach(function(col, i){ c.fillStyle = col; c.fillRect(-80 + i * 32, -120, 32, 150); });
    const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(0.4, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = g; c.fillRect(-90, -120, 180, 150);
    c.restore();
    c.strokeStyle = '#3A2A1E'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, 12); c.lineTo(-16, 46); c.moveTo(26, 12); c.lineTo(16, 46); c.moveTo(-4, 20); c.lineTo(0, 46); c.stroke();
    c.fillStyle = '#8A5A32'; c.fillRect(-20, 46, 40, 22); c.fillStyle = '#5A3B22'; c.fillRect(-20, 46, 40, 4);
  });
  add('tree', 'Tree', function(c){
    c.fillStyle = '#4A2E12'; c.beginPath(); c.moveTo(-8, 60); c.lineTo(-5, -10); c.lineTo(5, -10); c.lineTo(8, 60); c.closePath(); c.fill();
    c.fillStyle = '#3E8A3A'; c.beginPath(); c.ellipse(0, -30, 62, 28, 0, 0, TAU); c.fill();
    c.fillStyle = '#4EAA4A'; c.beginPath(); c.ellipse(-8, -40, 44, 18, 0, 0, TAU); c.fill();
  });
  add('lamp', 'Street lamp', function(c){
    c.fillStyle = '#2A2A34'; c.fillRect(-4, -40, 8, 100); c.fillRect(-14, 56, 28, 8);
    c.fillStyle = '#3A3A44'; c.beginPath(); c.moveTo(-18, -40); c.lineTo(18, -40); c.lineTo(12, -64); c.lineTo(-12, -64); c.closePath(); c.fill();
    c.fillStyle = '#FFE9A8'; c.fillRect(-12, -40, 24, 10);
    const g = c.createRadialGradient(0, -34, 2, 0, -34, 60); g.addColorStop(0, 'rgba(255,230,150,.55)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(-60, -94, 120, 120);
  });
  add('bench', 'Bench', function(c){
    c.fillStyle = '#5A3B22'; c.fillRect(-44, 8, 8, 28); c.fillRect(36, 8, 8, 28);
    c.fillStyle = '#8A5A32'; c.fillRect(-50, 4, 100, 10); c.fillRect(-48, -24, 96, 8); c.fillRect(-48, -10, 96, 8);
    c.fillStyle = '#5A3B22'; c.fillRect(-46, -24, 6, 30); c.fillRect(40, -24, 6, 30);
  });
  add('rocket', 'Rocket', function(c){
    c.fillStyle = '#C9CDD9'; c.beginPath(); c.moveTo(0, -90); c.quadraticCurveTo(30, -50, 26, 40); c.lineTo(-26, 40); c.quadraticCurveTo(-30, -50, 0, -90); c.closePath(); c.fill();
    c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(0, -90); c.quadraticCurveTo(16, -70, 18, -56); c.lineTo(-18, -56); c.quadraticCurveTo(-16, -70, 0, -90); c.closePath(); c.fill();
    c.fillStyle = '#4DA0D8'; c.beginPath(); c.arc(0, -24, 13, 0, TAU); c.fill(); c.strokeStyle = '#6A6F78'; c.lineWidth = 4; c.stroke();
    c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(-26, 10); c.lineTo(-48, 52); c.lineTo(-26, 40); c.closePath(); c.fill(); c.beginPath(); c.moveTo(26, 10); c.lineTo(48, 52); c.lineTo(26, 40); c.closePath(); c.fill();
    c.fillStyle = '#FF9A3A'; c.beginPath(); c.moveTo(-14, 40); c.lineTo(0, 86); c.lineTo(14, 40); c.closePath(); c.fill(); c.fillStyle = '#FFE27A'; c.beginPath(); c.moveTo(-7, 40); c.lineTo(0, 66); c.lineTo(7, 40); c.closePath(); c.fill();
  });
  add('ufo', 'Flying saucer', function(c){
    c.fillStyle = 'rgba(150,255,200,.22)'; c.beginPath(); c.moveTo(-22, 14); c.lineTo(22, 14); c.lineTo(52, 80); c.lineTo(-52, 80); c.closePath(); c.fill();
    c.fillStyle = '#8FE8D0'; c.beginPath(); c.ellipse(0, -14, 24, 22, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#9AA0AC'; c.beginPath(); c.ellipse(0, 2, 66, 18, 0, 0, TAU); c.fill();
    c.fillStyle = '#C9CDD9'; c.beginPath(); c.ellipse(0, -2, 60, 12, 0, 0, TAU); c.fill();
    for (let i = -2; i <= 2; i++){ c.fillStyle = i % 2 ? '#FFD84D' : '#FF4D8D'; c.beginPath(); c.arc(i * 22, 6, 4, 0, TAU); c.fill(); }
  });
  add('chest', 'Treasure chest', function(c){
    c.fillStyle = '#6A4A28'; c.fillRect(-48, -6, 96, 46); c.fillStyle = '#8A5A32'; c.beginPath(); c.moveTo(-48, -6); c.quadraticCurveTo(0, -56, 48, -6); c.closePath(); c.fill();
    c.fillStyle = '#C9A24A'; c.fillRect(-48, -8, 96, 8); c.fillRect(-48, 28, 96, 6); c.fillRect(-6, -14, 12, 26);
    c.fillStyle = '#2A1E12'; c.fillRect(-3, 0, 6, 8);
    c.fillStyle = '#FFD84D'; c.beginPath(); c.arc(-24, -10, 5, 0, TAU); c.arc(-8, -16, 5, 0, TAU); c.arc(30, -12, 5, 0, TAU); c.fill();
  });
  add('present', 'Present', function(c){
    c.fillStyle = '#4DA0D8'; c.fillRect(-36, -8, 72, 54); c.fillStyle = '#6AB8E8'; c.fillRect(-40, -22, 80, 20);
    c.fillStyle = '#F2C230'; c.fillRect(-6, -22, 12, 68);
    c.strokeStyle = '#F2C230'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.ellipse(-12, -32, 14, 9, -0.5, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(12, -32, 14, 9, 0.5, 0, TAU); c.stroke();
  });
})();

/* ---- boats, in side view (version 4 photo codes carry a 6-bit effect index) ---- */
(function(){
  const add = function(id, name, fn){ PHOTO_FX.push([id, name]); PHOTO_FXDRAW[id] = fn; };
  const water = function(){};                                                    /* no waves under the boats: they sit in the picture's own ground */
  add('boat_skiff', 'Boat: Rowing Skiff', function(c){
    c.fillStyle = '#B8864E'; c.beginPath(); c.moveTo(-50, -2); c.quadraticCurveTo(-30, 22, 0, 22); c.quadraticCurveTo(34, 22, 56, -8); c.lineTo(-50, -2); c.fill();
    c.fillStyle = '#8A5A32'; c.fillRect(-48, -4, 100, 5); c.fillStyle = '#6A4A28'; c.fillRect(-14, -10, 4, 10); c.fillRect(10, -10, 4, 10);
    c.strokeStyle = '#6A4A28'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -8); c.lineTo(-30, 20); c.moveTo(12, -8); c.lineTo(30, 20); c.stroke();
    water(c, 70);
  });
  add('boat_launch', 'Boat: Motor Launch', function(c){
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(-60, -4); c.lineTo(-52, 22); c.quadraticCurveTo(0, 26, 50, 22); c.lineTo(72, -6); c.closePath(); c.fill();
    c.fillStyle = '#2F5F94'; c.fillRect(-58, 4, 120, 6);
    c.fillStyle = '#E8EAF0'; c.fillRect(-26, -34, 52, 30); c.fillStyle = '#9FD8F2'; c.fillRect(-20, -28, 14, 14); c.fillRect(0, -28, 14, 14); c.fillStyle = '#C9CDD9'; c.fillRect(-30, -38, 60, 6);
    c.fillStyle = '#D5352B'; c.fillRect(30, -34, 3, 30);
    water(c, 80);
  });
  add('boat_trawler', 'Boat: Fishing Trawler', function(c){
    c.fillStyle = '#C9503C'; c.beginPath(); c.moveTo(-70, -8); c.lineTo(-60, 24); c.quadraticCurveTo(0, 30, 62, 24); c.lineTo(84, -12); c.closePath(); c.fill();
    c.fillStyle = '#2A2A34'; c.fillRect(-66, 2, 140, 5);
    c.fillStyle = '#F4F1E8'; c.fillRect(-10, -46, 40, 38); c.fillStyle = '#9FD8F2'; c.fillRect(-4, -40, 12, 12); c.fillRect(14, -40, 10, 12); c.fillStyle = '#3A3A44'; c.fillRect(-14, -50, 48, 5);
    c.strokeStyle = '#3A3A44'; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, -8); c.lineTo(-40, -58); c.lineTo(-12, -48); c.stroke(); c.lineWidth = 1.4; c.beginPath(); c.moveTo(-40, -58); c.lineTo(-62, -8); c.stroke();
    water(c, 96);
  });
  add('boat_speed', 'Boat: Speedboat', function(c){
    c.fillStyle = '#4DA0D8'; c.beginPath(); c.moveTo(-56, -6); c.lineTo(-44, 18); c.quadraticCurveTo(10, 24, 60, 8); c.quadraticCurveTo(76, -4, 78, -14); c.lineTo(10, -10); c.closePath(); c.fill();
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(-50, 2); c.lineTo(70, -2); c.lineTo(66, 4); c.lineTo(-48, 10); c.closePath(); c.fill();
    c.fillStyle = '#9FD8F2'; c.beginPath(); c.moveTo(-14, -8); c.lineTo(0, -24); c.lineTo(14, -24); c.lineTo(22, -10); c.closePath(); c.fill();
    c.fillStyle = '#2A2A34'; c.fillRect(-62, -8, 8, 16);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-62, 16); c.quadraticCurveTo(-90, 14, -110, 20); c.stroke();
    water(c, 84);
  });
})();