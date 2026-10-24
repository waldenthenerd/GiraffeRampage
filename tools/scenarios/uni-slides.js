/* uni-slides: every lecture slide (48 lectures, 192 slides) is opened in the real panel and checked for layout: the picture and the text do not overlap, nothing goes off the screen and the page does not scroll sideways.
   Run it on a desktop size and on a phone (--touch --w 390 --h 844). It also draws every picture in UNI_PICS and checks that each one puts ink on the canvas. */
(function(){ var out={errs:[],bad:[],n:0}; try { GR.handleAction('splash-go'); Ach.check=function(){return [];}; townDoneCh=function(){return true;};
 UNI_FAC.forEach(function(F){ uniFac(F.id).l = 15; }); uniSpend = function(){ return true; }; uniEnergy = function(){ return 99; }; townGo('campus',600,1); for(var i=0;i<5;i++) GR.step(1/30);
 var only=QA.params.only; UNI_LECTURES.forEach(function(L){
  if (only && only!==L.id) return;
  handleAction('town-uq-lec-'+L.id);
  for (var s=0;s<L.slides.length;s++){
    out.n++; var sl=document.querySelector('.uq-slide'), cv=document.getElementById('uq-pic'); if(!sl||!cv){ out.bad.push(L.id+':'+s+' no slide'); break; }
    var a=cv.getBoundingClientRect(), t=document.querySelector('.uq-text').getBoundingClientRect(), pn=sl.closest('.tpanel,.tp,[class*=panel]')||document.body, pr=pn.getBoundingClientRect();
    if (a.width<10||a.height<10) out.bad.push(L.id+':'+s+' tiny canvas');
    if (a.right>t.left+1 && a.bottom>t.top+1 && !(a.bottom<=t.top+1)) out.bad.push(L.id+':'+s+' canvas overlaps text');
    if (document.documentElement.scrollWidth>document.documentElement.clientWidth+1) out.bad.push(L.id+':'+s+' page scrolls sideways');
    if (a.right>innerWidth+1||t.right>innerWidth+1||a.left<-1) out.bad.push(L.id+':'+s+' off screen');
    if (only && QA.params.shot) { out.rect=[a.left,a.top,a.width,a.height]; }
    if (only && s===+QA.params.slide) break;
    handleAction('town-uq-next');
  } });
 Object.keys(UNI_PICS).forEach(function(k){ var cv = document.createElement('canvas'); cv.width = 520; cv.height = 300; var c = cv.getContext('2d'); try { UNI_PICS[k](c, 520, 300, '#C9772E'); } catch (e) { out.bad.push('pic ' + k + ': ' + e.message); return; } var d = c.getImageData(0, 0, 520, 300).data, ink = 0; for (var q = 3; q < d.length; q += 4 * 97) if (d[q] > 0) ink++; if (ink < 500) out.bad.push('pic ' + k + ' is empty'); out.pics = (out.pics | 0) + 1; });
 out.pass=out.bad.length===0 && out.pics === 61; } catch(e){ out.errs.push(e.message+' '+(e.stack||'').split('\n')[1]); } QA.done(out); })();
