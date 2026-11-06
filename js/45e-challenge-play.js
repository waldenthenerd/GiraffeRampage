'use strict';

// Challenge combat owns its state and clock; it never writes the campaign save.
var GRChallengePlay = (function(){
  let current = null;
  const KITS = {
    balanced:{hp:100,speed:180,damage:24,range:110,cooldown:.55},
    swift:{hp:70,speed:235,damage:18,range:125,cooldown:.4},
    tank:{hp:160,speed:140,damage:36,range:100,cooldown:.75}
  };
  const FOES = {
    chaser:{hp:40,speed:65,r:15,damage:10,col:'#c65342'},
    runner:{hp:24,speed:110,r:11,damage:7,col:'#da9d3f'},
    brute:{hp:140,speed:35,r:23,damage:20,col:'#8d68a9'},
    spitter:{hp:35,speed:48,r:14,damage:8,col:'#65a474'}
  };
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  function overlaps(x,y,r,o){
    return Math.hypot(x-clamp(x,o.x,o.x+o.w),y-clamp(y,o.y,o.y+o.h)) < r;
  }
  function blocks(a,b,walls){
    return walls.some(o=>{
      let lo=0,hi=1;
      for(const k of ['x','y']){
        const d=b[k]-a[k],min=o[k],max=min+o[k==='x'?'w':'h'];
        if(Math.abs(d)<.0001){ if(a[k]>=min&&a[k]<=max) continue; return false; }
        const t1=(min-a[k])/d,t2=(max-a[k])/d;
        lo=Math.max(lo,Math.min(t1,t2)); hi=Math.min(hi,Math.max(t1,t2));
        if(lo>hi) return false;
      }
      return true;
    });
  }
  const BIOME_COLORS={
    savanna:['#a89958','#c9b979','#6a7944'],arctic:['#d9e3db','#f7f2df','#90aaa0'],moon:['#77737a','#aaa2a1','#8b7f78'],
    forest:['#6b7750','#b0ae72','#425e3d'],desert:['#cda56d','#efd398','#658354'],
    swamp:['#69725a','#a5b184','#536b44'],volcanic:['#5a504a','#d98949','#62594a']
  };
  const COLOR_STYLES={autumn:['#ad8350','#e3b463','#a85d39'],pastel:['#c5c5ad','#e7d9b9','#9bb5a1'],dusk:['#76677b','#cda58b','#6a687b']};
  function getPalette(level){
    const appearance=level.appearance||{},c=appearance.colors;
    const colors=appearance.palette==='custom'&&c?[c.ground,c.accent,c.foliage]:COLOR_STYLES[appearance.palette]||BIOME_COLORS[level.arena.theme]||BIOME_COLORS.savanna;
    return {ground:colors[0],accent:colors[1],foliage:colors[2]};
  }
  function paintCustom(ctx,asset,x,y,w,h){
    if(!asset||!Array.isArray(asset.parts)||![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return;
    ctx.save();
    try{
      ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.translate(x,y);ctx.scale(w/100,h/100);
      for(const part of asset.parts){
        if(!part||![part.x,part.y,part.w,part.h].every(Number.isFinite)||part.w<=0||part.h<=0||!['rect','ellipse','triangle'].includes(part.shape))continue;
        ctx.save();
        try{
          ctx.translate(part.x+part.w/2,part.y+part.h/2);ctx.rotate((Number.isFinite(part.rotation)?part.rotation:0)*Math.PI/180);ctx.fillStyle=/^#[0-9a-f]{6}$/i.test(part.color)?part.color:'#c98a3c';
          ctx.globalAlpha=(Number.isFinite(ctx.globalAlpha)?ctx.globalAlpha:1)*(Number.isFinite(part.opacity)?clamp(part.opacity,0,1):1);
          ctx.strokeStyle=/^#[0-9a-f]{6}$/i.test(part.stroke)?part.stroke:'#3a2b20';ctx.lineWidth=Number.isFinite(part.strokeWidth)?clamp(part.strokeWidth,0,6):0;
          if(part.shape==='rect')ctx.fillRect(-part.w/2,-part.h/2,part.w,part.h);
          else if(part.shape==='ellipse'){ctx.beginPath();ctx.ellipse(0,0,part.w/2,part.h/2,0,0,Math.PI*2);ctx.fill();}
          else if(part.shape==='triangle'){ctx.beginPath();ctx.moveTo(0,-part.h/2);ctx.lineTo(part.w/2,part.h/2);ctx.lineTo(-part.w/2,part.h/2);ctx.closePath();ctx.fill();}
          if(Number.isFinite(part.strokeWidth)&&part.strokeWidth>0){if(part.shape==='rect')ctx.strokeRect(-part.w/2,-part.h/2,part.w,part.h);else ctx.stroke();}
        }finally{ctx.restore();}
      }
    }finally{ctx.restore();}
    if(asset.solid){
      ctx.save();
      try{ctx.strokeStyle='#241b15';ctx.lineWidth=4;ctx.strokeRect(x+1,y+1,w-2,h-2);
        ctx.strokeStyle='#efe6d4';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(x+1,y+1,w-2,h-2);
      }finally{ctx.restore();}
    }
  }
  // The editor and playtest share this pure painter; visual randomness has its
  // own seed and cannot consume the combat generator or change a recipe.
  function paintArena(ctx,level,options){
    options=options||{};
    const appearance=level.appearance||{},detail=appearance.detail===undefined?1:appearance.detail;
    const theme=level.arena.theme,time=Number(options.time)||0;
    const random=GRChallengeData.seeded((level.seed^0x51ac3f09)>>>0);
    const colors=getPalette(level),palette=[colors.ground,colors.accent,colors.foliage];
    const ellipse=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    ctx.save();
    try{
    ctx.fillStyle=palette[0];ctx.fillRect(0,0,960,640);
    const light=ctx.createLinearGradient(0,0,960,640);light.addColorStop(0,palette[1]+'77');light.addColorStop(1,palette[2]+'66');ctx.fillStyle=light;ctx.fillRect(0,0,960,640);
    for(let n=0;n<16+detail*12;n++){
      const x=random()*960,y=random()*640,rx=25+random()*75,ry=12+random()*26;
      if(theme==='moon'){
        ellipse(x+3,y+4,rx,ry,'#35333c22');ellipse(x,y,rx,ry,'#d2c8bd22');ellipse(x+3,y+2,rx*.74,ry*.7,'#39364222');
      }else ellipse(x,y,rx,ry,n%2?palette[1]+'22':palette[2]+'22');
    }
    for(let n=0;n<30+detail*95;n++){
      const x=random()*960,y=random()*640,s=2+random()*4;
      if(theme==='savanna'||theme==='forest'||theme==='swamp'){
        ctx.strokeStyle=n%3?palette[2]+'99':palette[1]+'88';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-3,y+2);ctx.lineTo(x-5,y-s);ctx.moveTo(x,y+2);ctx.lineTo(x,y-s-2);ctx.moveTo(x+2,y+2);ctx.lineTo(x+5,y-s);ctx.stroke();
        if(theme==='forest'&&n%3===0){ctx.fillStyle=palette[1]+'55';ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-4);ctx.lineTo(x+5,y);ctx.lineTo(x,y+3);ctx.closePath();ctx.fill();}
        if(theme==='swamp'&&n%4===0){ctx.strokeStyle=palette[1]+'55';ctx.beginPath();ctx.ellipse(x,y,15,4,0,0,Math.PI*2);ctx.stroke();}
        if(detail&&theme==='savanna'&&n%11===0){for(let p=0;p<4;p++){const a=p*Math.PI/2;ellipse(x+Math.cos(a)*3,y+Math.sin(a)*3,2,2,'#e7c377');}ellipse(x,y,1.5,1.5,'#87572b');}
        if(detail&&theme==='forest'&&n%7===0){ctx.strokeStyle='#7c553b88';ctx.beginPath();ctx.moveTo(x-5,y+3);ctx.lineTo(x+5,y-3);ctx.moveTo(x,y);ctx.lineTo(x+1,y+5);ctx.stroke();}
        if(detail&&theme==='swamp'&&n%9===0){ellipse(x,y,8,3,palette[2]+'cc');ctx.strokeStyle=palette[0];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+7,y-2);ctx.stroke();}
      }else if(theme==='arctic'){
        ellipse(x,y,s*2,s*.5,'#ffffff55');
        if(n%5===0){ctx.strokeStyle='#8daeb555';ctx.beginPath();ctx.moveTo(x-8,y-3);ctx.lineTo(x,y);ctx.lineTo(x+9,y-7);ctx.moveTo(x,y);ctx.lineTo(x+2,y+8);ctx.stroke();}
        if(detail&&n%13===0)for(let i=0;i<3;i++){ellipse(x+i*8,y+i*4,2.5,1.3,'#738f9a44');ellipse(x+i*8+3,y+i*4-4,2.5,1.3,'#738f9a44');}
      }else if(theme==='desert'){
        ctx.strokeStyle=palette[1]+'77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,y);ctx.quadraticCurveTo(x,y-5,x+14,y);ctx.stroke();
        if(detail&&n%9===0){ellipse(x+5,y+4,3,1.7,'#7d5a3a55');ellipse(x+4,y+3,2,1,palette[1]+'99');}
      }else if(theme==='volcanic'){
        ctx.strokeStyle=n%5===0?palette[1]+'bb':'#30272277';ctx.lineWidth=n%5===0?2:1;ctx.beginPath();ctx.moveTo(x-6,y-s);ctx.lineTo(x,y);ctx.lineTo(x-2,y+s);ctx.lineTo(x+7,y+s+4);ctx.stroke();
        if(detail&&n%8===0){ellipse(x,y,4,2,'#302b29');ctx.strokeStyle='#b8a38a66';ctx.beginPath();ctx.moveTo(x-2,y-1);ctx.lineTo(x+1,y-2);ctx.stroke();}
      }else{ellipse(x,y,s,s*.6,n%2?palette[1]+'55':'#40394444');if(detail&&n%15===0){ctx.strokeStyle='#e8dbca55';ctx.beginPath();ctx.arc(x,y,8,.9,3.6);ctx.stroke();}}
    }
    if(appearance.time==='sunset'){ctx.fillStyle='#b45f242b';ctx.fillRect(0,0,960,640);}
    else if(appearance.time==='night'){ctx.fillStyle='#211b3d77';ctx.fillRect(0,0,960,640);}
    for(const o of level.objects){
      const x=o.x,y=o.y,w=o.w,h=o.h,cx=x+w/2,cy=y+h/2;
      if(o.kind==='wall'){
        ctx.fillStyle='#20140f33';ctx.fillRect(x+5,y+8,w,h);
        ctx.fillStyle='#635444';ctx.fillRect(x,y,w,h);ctx.fillStyle='#9d8866';ctx.fillRect(x,y,w,5);
        ctx.strokeStyle='#3a2b2099';ctx.lineWidth=2;
        for(let row=0;row<h;row+=20){ctx.beginPath();ctx.moveTo(x,y+row);ctx.lineTo(x+w,y+row);ctx.stroke();
          for(let col=(row%40?0:20);col<w;col+=40){ctx.beginPath();ctx.moveTo(x+col,y+row);ctx.lineTo(x+col,y+Math.min(h,row+20));ctx.stroke();}}
        ctx.strokeRect(x+.5,y+.5,w-1,h-1);
        if(detail){ctx.strokeStyle='#c8ae7e55';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+3,y+h-3);ctx.lineTo(x+3,y+5);ctx.lineTo(x+w-3,y+5);ctx.stroke();}
      }else if(o.kind==='hazard'){
        ctx.fillStyle='#733c24';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#df854e';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,w-4,h-4);
        for(let xx=8;xx<w;xx+=16)for(let yy=8;yy<h;yy+=16){ctx.fillStyle='#edaa55';ctx.beginPath();ctx.moveTo(x+xx-4,y+yy+4);ctx.lineTo(x+xx,y+yy-4);ctx.lineTo(x+xx+4,y+yy+4);ctx.fill();}
      }else if(o.kind==='coin'){
        const r=Math.min(w,h)*.4;ellipse(cx+2,cy+r*.65,r,r*.4,'#39261a44');
        ellipse(cx,cy,r,r,'#a56a21');ellipse(cx-1,cy-2,r*.87,r*.87,'#f2bd50');
        ctx.strokeStyle='#fff0a6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx-1,cy-2,r*.62,-Math.PI,.1);ctx.stroke();
        ctx.fillStyle='#8d5b22';ctx.fillRect(cx-1,cy-r*.45,2,r*.9);
        if(detail){ctx.strokeStyle='#ae782e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r*.91,.3,2.6);ctx.stroke();ellipse(cx-r*.4,cy-r*.4,1.4,1.4,'#fff3bf');}
      }else if(o.kind==='heal'){
        ellipse(cx+3,cy+h*.38,w*.4,h*.18,'#38251b33');
        ctx.fillStyle='#eee1bd';ctx.fillRect(x+2,y+2,w-4,h-4);ctx.strokeStyle='#8a5735';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,w-4,h-4);
        ctx.fillStyle='#b24d36';ctx.fillRect(cx-w*.1,y+h*.22,w*.2,h*.56);ctx.fillRect(x+w*.22,cy-h*.1,w*.56,h*.2);
        if(detail){ctx.strokeStyle='#b8a282';ctx.lineWidth=1;ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.fillStyle='#7d5536';ctx.fillRect(cx-w*.15,y+h*.04,w*.3,2);}
      }else if(o.kind==='exit'){
        ctx.fillStyle='#4e442b';ctx.fillRect(x,y,w,h);ctx.fillStyle='#d3a852';ctx.fillRect(x,y,w,4);ctx.fillRect(x,y,4,h);ctx.fillRect(x+w-4,y,4,h);
        ctx.strokeStyle='#f0d394';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+w*.25,cy);ctx.lineTo(x+w*.75,cy);ctx.lineTo(x+w*.6,y+h*.3);ctx.moveTo(x+w*.75,cy);ctx.lineTo(x+w*.6,y+h*.7);ctx.stroke();
        if(detail){ctx.fillStyle='#ecd390';for(const side of [0,1]){ctx.fillRect(x+side*(w-4),y+h*.2,4,3);ctx.fillRect(x+side*(w-4),y+h*.8,4,3);}ctx.strokeStyle='#d3a85288';ctx.lineWidth=1;ctx.strokeRect(x+6,y+6,w-12,h-12);}
      }else if(o.kind==='tree'){
        ellipse(cx+w*.14,y+h*.85,w*.47,h*.18,'#362b2033');ctx.fillStyle='#795135';ctx.fillRect(cx-w*.055,y+h*.25,w*.11,h*.65);
        if(theme==='desert'){
          ctx.strokeStyle=palette[2];ctx.lineWidth=Math.max(4,w*.14);ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(cx,y+h*.87);ctx.lineTo(cx,y+h*.16);ctx.moveTo(cx,y+h*.58);ctx.lineTo(x+w*.2,y+h*.58);ctx.lineTo(x+w*.2,y+h*.32);ctx.moveTo(cx,y+h*.43);ctx.lineTo(x+w*.8,y+h*.43);ctx.lineTo(x+w*.8,y+h*.24);ctx.stroke();ctx.lineCap='butt';
          ctx.strokeStyle=palette[1]+'88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-2,y+h*.78);ctx.lineTo(cx-2,y+h*.23);ctx.stroke();
        }else if(theme==='swamp'){
          for(let n=0;n<7;n++){
            const xx=x+w*(.14+n*.12),yy=y+h*(.15+(n%3)*.12);ctx.strokeStyle=palette[2];ctx.lineWidth=Math.max(2,w*.025);ctx.beginPath();ctx.moveTo(cx,y+h*.9);ctx.quadraticCurveTo(xx,y+h*.45,xx,yy);ctx.stroke();
            ctx.fillStyle='#775638';ctx.fillRect(xx-w*.025,yy,w*.05,h*.15);
          }
        }else if(theme==='forest'||theme==='arctic'){
          for(let n=2;n>=0;n--){const cy=y+h*(.2+n*.18),half=w*(.22+n*.12);ctx.fillStyle=n%2?palette[2]:palette[1];ctx.beginPath();ctx.moveTo(cx,cy-h*.2);ctx.lineTo(cx+half,cy+h*.22);ctx.lineTo(cx-half,cy+h*.22);ctx.closePath();ctx.fill();}
        }else if(theme==='volcanic'){
          ctx.strokeStyle='#3d322b';ctx.lineWidth=Math.max(3,w*.05);ctx.beginPath();ctx.moveTo(cx,y+h*.9);ctx.lineTo(cx,y+h*.1);ctx.moveTo(cx,y+h*.6);ctx.lineTo(x+w*.2,y+h*.25);ctx.moveTo(cx,y+h*.5);ctx.lineTo(x+w*.8,y+h*.2);ctx.stroke();
          ellipse(cx,y+h*.1,w*.04,h*.03,palette[1]);
        }else{
        ctx.strokeStyle='#795135';ctx.lineWidth=Math.max(2,w*.045);ctx.beginPath();ctx.moveTo(cx,y+h*.7);ctx.lineTo(x+w*.2,y+h*.35);ctx.moveTo(cx,y+h*.6);ctx.lineTo(x+w*.8,y+h*.3);ctx.stroke();
        ellipse(cx,y+h*.3,w*.47,h*.22,palette[2]);ellipse(x+w*.27,y+h*.27,w*.25,h*.17,palette[2]);ellipse(x+w*.68,y+h*.2,w*.27,h*.15,palette[2]);
        }
        if(detail){ctx.strokeStyle='#b18b5a77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-1,y+h*.8);ctx.lineTo(cx-1,y+h*.6);ctx.stroke();for(let n=0;n<4;n++)ellipse(x+w*(.25+n*.15),y+h*(.28+(n%2)*.08),w*.035,h*.012,palette[1]+'88');}
      }else if(o.kind==='rock'){
        ellipse(cx+4,y+h*.8,w*.47,h*.2,'#32251f33');
        ctx.fillStyle=theme==='arctic'?'#a4b6b3':theme==='volcanic'?'#443b36':theme==='desert'?palette[1]:'#8c8174';ctx.beginPath();ctx.moveTo(x,y+h*.7);ctx.lineTo(x+w*.15,y+h*.2);ctx.lineTo(x+w*.6,y);ctx.lineTo(x+w*.93,y+h*.4);ctx.lineTo(x+w,y+h*.8);ctx.lineTo(x+w*.3,y+h);ctx.closePath();ctx.fill();
        ctx.fillStyle='#e4d2ae44';ctx.beginPath();ctx.moveTo(x+w*.15,y+h*.2);ctx.lineTo(x+w*.6,y);ctx.lineTo(x+w*.45,y+h*.6);ctx.lineTo(x,y+h*.7);ctx.closePath();ctx.fill();
        if(detail){ctx.strokeStyle='#3c302b66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+w*.6,y+h*.05);ctx.lineTo(x+w*.45,y+h*.6);ctx.lineTo(x+w*.9,y+h*.75);ctx.stroke();}
        if(theme==='volcanic'){ctx.strokeStyle=palette[1];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,y+h*.1);ctx.lineTo(x+w*.4,y+h*.5);ctx.lineTo(cx,y+h*.85);ctx.stroke();}
        else if(theme==='forest'||theme==='swamp')ellipse(cx,y+h*.25,w*.25,h*.13,palette[2]+'aa');
      }else if(o.kind==='banner'){
        ctx.fillStyle='#59402c';ctx.fillRect(x+w*.18,y,w*.07,h);ctx.fillStyle=palette[1];ctx.fillRect(x+w*.25,y+h*.08,w*.7,h*.48);
        ctx.fillStyle='#efe6d4';ctx.beginPath();ctx.arc(x+w*.58,y+h*.3,Math.min(w,h)*.12,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#f2b33d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*.12,y+h);ctx.lineTo(x+w*.4,y+h);ctx.stroke();
        if(detail){ctx.strokeStyle='#efe6d499';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.strokeRect(x+w*.29,y+h*.12,w*.62,h*.4);ctx.setLineDash([]);ctx.fillStyle='#c9b38a';ctx.fillRect(x+w*.15,y+h*.04,w*.13,h*.03);}
      }else if(o.kind==='custom'){
        const asset=(level.customAssets||[]).find(a=>a.id===o.asset);if(asset)paintCustom(ctx,asset,x,y,w,h);
      }
    }
    if(appearance.weather==='drizzle'){
      ctx.strokeStyle=appearance.time==='night'?'#e4dbc244':'#f5f0de66';ctx.lineWidth=1;
      for(let n=0;n<40+detail*25;n++){const x=(random()*1000+time*35)%1000-20,y=(random()*700+time*210)%700-30;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+12);ctx.stroke();}
    }else if(appearance.weather==='snow'){
      for(let n=0;n<35+detail*25;n++){const x=(random()*1000+Math.sin(time*.7+n)*10)%1000,y=(random()*690+time*25)%690-25;ellipse(x,y,1+n%2,1+n%2,'#fff4db99');}
    }
    if(options.grid){
      ctx.strokeStyle='#3a2b2026';ctx.lineWidth=1;ctx.beginPath();
      for(let x=0;x<960;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,640);}for(let y=0;y<640;y+=40){ctx.moveTo(0,y);ctx.lineTo(960,y);}ctx.stroke();
    }
    }finally{ctx.restore();}
  }
  function stop(){ if(current){ current.destroy(); current=null; } }
  function start(raw,options){
    const level=GRChallengeData.validate(raw);
    stop();
    options=options||{};
    const kit=KITS[level.loadout],rng=GRChallengeData.seeded(level.seed);
    const walls=level.objects.filter(o=>GRChallengeData.isSolid(level,o));
    const pickups=level.objects.filter(o=>o.kind==='coin'||o.kind==='heal').map(o=>Object.assign({taken:false},o));
    const coins=pickups.filter(o=>o.kind==='coin');
    const p={x:480,y:320,r:15,hp:kit.hp,inv:0,attack:0,angle:-Math.PI/2};
    let enemies=[],shots=[],time=0,kills=0,collected=0,heals=0,wave=0,wait=level.waves[0].delay,fx=[],waveBannerUntil=0;
    const totalEnemies=level.waves.reduce((n,w)=>n+w.enemies.reduce((sum,g)=>sum+g.count,0),0);
    let paused=false,ended=false,result=null,raf=0,last=0,carry=0,attackFlash=0,frameLive=true;
    let target=null,keys=new Set(),pointer=null;
    const previousFocus=document.activeElement;
    const dlg=document.createElement('dialog');
    dlg.id='challengePlay'; dlg.className='slab'; dlg.setAttribute('aria-label','Play challenge');
    dlg.style.cssText='box-sizing:border-box;max-width:1100px;width:calc(100% - 16px);max-height:calc(100dvh - 16px);padding:16px;color:var(--bone);font:inherit;overflow:auto';
    const header=document.createElement('h2'); header.textContent=level.title;
    header.className='head';
    const hint=document.createElement('p');
    hint.textContent='Move: WASD / arrows, or hold the arena to move toward your finger. Attacks are automatic. Esc pauses.';
    hint.style.cssText='font-size:13px;line-height:1.5;margin:4px 0 8px;color:var(--dust)';
    const hud=document.createElement('p'); hud.setAttribute('aria-live','off');
    hud.style.cssText='font-size:14px;margin:6px 0;min-height:40px;line-height:1.5;color:var(--bone)';
    const meters=document.createElement('section');meters.style.cssText='display:flex;gap:12px;flex-wrap:wrap;margin:4px 0 8px';
    function meter(label){const box=document.createElement('label');box.style.cssText='flex:1;min-width:120px;font-size:12px;color:var(--dust)';const text=document.createElement('span');text.textContent=label;const bar=document.createElement('progress');bar.setAttribute('aria-label',label);bar.max=1;bar.value=0;bar.style.cssText='display:block;width:100%;height:8px;margin-top:4px;accent-color:var(--sun)';box.append(text,bar);meters.appendChild(box);return {bar,text};}
    const hpMeter=meter('Health'),goalMeter=meter('Objective');
    const canvas=document.createElement('canvas'); canvas.width=960;canvas.height=640;
    canvas.tabIndex=0; canvas.setAttribute('aria-label','Challenge arena. Use arrow keys or WASD to move.');
    canvas.style.cssText='display:block;width:100%;max-height:calc(100dvh - 300px);aspect-ratio:3/2;object-fit:contain;touch-action:none;background:var(--night);border:1px solid var(--bark2);border-radius:4px;outline-offset:2px';
    const ctx=canvas.getContext('2d');
    const actions=document.createElement('div'); actions.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px';
    function button(label,fn,ghost){
      const b=document.createElement('button');b.type='button';b.textContent=label;
      b.className='btn sm'+(ghost?' ghost':'');
      b.style.cssText='min-height:44px;margin:0';
      b.addEventListener('click',fn);actions.appendChild(b);return b;
    }
    const pauseBtn=button('Pause',()=>setPause(!paused));
    const retryBtn=button('Retry',()=>{ const opts=options;start(level,opts); });
    button('Back to builder',()=>{ stop();if(options.onQuit)options.onQuit(); },true);
    const status=document.createElement('p');status.setAttribute('role','status');
    status.style.cssText='margin:8px 0 0;color:var(--sun);font-size:14px;line-height:1.5';
    status.textContent='Fixed '+level.loadout+' kit · No campaign rewards or save changes.';
    dlg.append(header,hint,hud,meters,canvas,actions,status);document.body.appendChild(dlg);
    function feedback(x,y,label,color){if(fx.length>=32)fx.shift();fx.push({x,y,label,color,life:.6});}
    function canStand(x,y,r){return x>=r&&x<=960-r&&y>=r&&y<=640-r&&!walls.some(o=>overlaps(x,y,r,o));}
    function move(body,dx,dy){
      const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
      for(let i=0;i<n;i++){
        const x=clamp(body.x+dx/n,body.r,960-body.r),y=clamp(body.y+dy/n,body.r,640-body.r);
        if(canStand(x,body.y,body.r))body.x=x;
        if(canStand(body.x,y,body.r))body.y=y;
      }
    }
    function spawnWave(){
      const recipe=level.waves[wave]; wave++;waveBannerUntil=time+1.6;
      for(const group of recipe.enemies){
        const f=FOES[group.kind];
        for(let n=0;n<group.count;n++){
          let x=480,y=320,found=false;
          for(let tries=0;tries<100;tries++){
            const z=.05+rng()*.9;
            x=group.spawn==='west'?f.r+4:group.spawn==='east'?956-f.r:960*z;
            y=group.spawn==='north'?f.r+4:group.spawn==='south'?636-f.r:640*z;
            if(canStand(x,y,f.r)){found=true;break;}
          }
          if(!found){ finish(false,'A spawn edge is blocked. Edit the walls and try again.');return; }
          enemies.push({kind:group.kind,x,y,r:f.r,hp:f.hp*level.modifiers.enemyHp,max:f.hp*level.modifiers.enemyHp,fire:1+rng(),side:rng()<.5?-1:1});
        }
      }
    }
    function finish(won,reason){
      if(ended)return;
      ended=true;target=null;keys.clear();pauseBtn.disabled=true;
      result={won,time:Math.round(time*100)/100,kills,coins:collected,heals,health:p.hp,waves:wave,fingerprint:GRChallengeData.fingerprint(level)};
      status.textContent=(won?'Challenge cleared! ':'Try again! ')+(reason||'')+' '+result.time.toFixed(2)+'s · '+kills+' / '+totalEnemies+' defeated · '+collected+' collected · '+heals+' heals used · '+Math.ceil(p.hp)+' health left. No campaign rewards.';
      if(options.onFinish)options.onFinish(Object.assign({},result));
    }
    function hurt(amount){ if(p.inv>0||ended)return;p.hp=Math.max(0,p.hp-amount);p.inv=.55;feedback(p.x,p.y,'−'+amount,'#cd8b65');if(!p.hp)finish(false,'Your giraffe ran out of health.'); }
    function step(dt){
      if(paused||ended)return;
      time+=dt;p.inv=Math.max(0,p.inv-dt);p.attack-=dt;attackFlash=Math.max(0,attackFlash-dt);for(const f of fx)f.life-=dt;fx=fx.filter(f=>f.life>0);
      let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
      let dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      if(!dx&&!dy&&target){dx=target.x-p.x;dy=target.y-p.y;if(Math.hypot(dx,dy)<4){dx=0;dy=0;}}
      const len=Math.hypot(dx,dy);
      if(len){p.angle=Math.atan2(dy,dx);move(p,dx/len*kit.speed*(level.modifiers.playerSpeed||1)*dt,dy/len*kit.speed*(level.modifiers.playerSpeed||1)*dt);}
      if(!enemies.length&&wave<level.waves.length){wait-=dt;if(wait<=0)spawnWave();}
      if(ended)return;
      for(const e of enemies){
        const f=FOES[e.kind],vx=p.x-e.x,vy=p.y-e.y,d=Math.hypot(vx,vy)||1;
        const ox=e.x,oy=e.y;
        if(e.kind!=='spitter'||d>220||blocks(e,p,walls)){
          move(e,vx/d*f.speed*level.modifiers.speed*dt,vy/d*f.speed*level.modifiers.speed*dt);
          if(Math.hypot(e.x-ox,e.y-oy)<.1)move(e,-vy/d*f.speed*level.modifiers.speed*dt*e.side,vx/d*f.speed*level.modifiers.speed*dt*e.side);
        }
        if(d<e.r+p.r)hurt(f.damage);
        e.fire-=dt;
        if(e.kind==='spitter'&&e.fire<=0&&d<450&&!blocks(e,p,walls)){
          e.fire=2;shots.push({x:e.x,y:e.y,dx:vx/d*150,dy:vy/d*150,life:4});
        }
      }
      if(p.attack<=0){
        const victim=enemies.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<kit.range+e.r&&!blocks(p,e,walls)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
        if(victim){victim.hp-=kit.damage;p.angle=Math.atan2(victim.y-p.y,victim.x-p.x);p.attack=kit.cooldown/(level.modifiers.attackRate||1);attackFlash=.13;feedback(victim.x,victim.y,'−'+kit.damage,'#e1bd7d');}
      }
      const before=enemies.length;enemies=enemies.filter(e=>e.hp>0);kills+=before-enemies.length;
      if(before&&!enemies.length&&wave<level.waves.length)wait=level.waves[wave].delay;
      for(const s of shots){
        const old={x:s.x,y:s.y};s.x+=s.dx*dt;s.y+=s.dy*dt;s.life-=dt;
        if(blocks(old,s,walls))s.life=0;
        if(s.life>0&&Math.hypot(s.x-p.x,s.y-p.y)<p.r+5){hurt(8);s.life=0;}
      }
      shots=shots.filter(s=>s.life>0);
      for(const o of level.objects)if(o.kind==='hazard'&&overlaps(p.x,p.y,p.r,o))hurt(12);
      for(const c of coins)if(!c.taken&&overlaps(p.x,p.y,p.r,c)){c.taken=true;collected++;feedback(c.x+c.w/2,c.y,'+1 coin','#e1bd7d');}
      for(const c of pickups)if(c.kind==='heal'&&!c.taken&&!ended&&p.hp<kit.hp&&overlaps(p.x,p.y,p.r,c)){c.taken=true;heals++;const healed=Math.min(kit.hp-p.hp,kit.hp*.25);p.hp+=healed;feedback(c.x+c.w/2,c.y,'+'+healed+' health','#c2c58b');}
      const obj=level.objective;
      if(obj.type==='clear'&&wave===level.waves.length&&!enemies.length)finish(true,'Every wave defeated.');
      else if(obj.type==='survive'&&time>=obj.target)finish(true,'Survival target reached.');
      else if(obj.type==='collect'&&collected>=obj.target)finish(true,'Collection target reached.');
      else if(obj.type==='exit'&&level.objects.some(o=>o.kind==='exit'&&overlaps(p.x,p.y,p.r,o)))finish(true,'Exit reached.');
      if(!ended&&time>=300)finish(false,'Five-minute challenge limit reached.');
    }
    function draw(){
      paintArena(ctx,Object.assign({},level,{objects:level.objects.filter(o=>o.kind!=='coin'&&o.kind!=='heal').concat(pickups.filter(o=>!o.taken))}),{grid:false,time});
      for(const e of enemies){
        const f=FOES[e.kind];ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(e.x,e.y+9,e.r+2,e.r*.6,0,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(p.y-e.y,p.x-e.x)+Math.PI/2);
        const stride=Math.sin(time*(e.kind==='runner'?18:10)+e.x*.03)*3;
        ctx.strokeStyle='#4a3021';ctx.lineWidth=e.kind==='brute'?5:3;
        for(const side of [-1,1])for(const front of [-1,1]){ctx.beginPath();ctx.moveTo(side*e.r*.5,front*e.r*.4);ctx.lineTo(side*e.r*.9,front*e.r*.7+stride*front);ctx.stroke();}
        ctx.fillStyle=f.col;ctx.strokeStyle='#4e3228';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,2,e.r*.8,e.r,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.ellipse(0,-e.r*.8,e.r*.65,e.r*.52,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#e1b879';
        if(e.kind==='brute'){for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*e.r*.4,-e.r);ctx.lineTo(s*e.r*.85,-e.r*1.5);ctx.lineTo(s*e.r*.65,-e.r*.7);ctx.fill();}}
        else{for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*e.r*.6,-e.r*.9,e.r*.24,e.r*.4,s*.5,0,Math.PI*2);ctx.fill();}}
        ctx.fillStyle='#f1e4c4';ctx.beginPath();ctx.ellipse(0,-e.r*.9,e.r*.38,e.r*.22,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#201810';ctx.fillRect(-e.r*.35,-e.r*1.05,3,3);ctx.fillRect(e.r*.2,-e.r*1.05,3,3);
        if(e.kind==='runner'){ctx.strokeStyle='#6d4529';ctx.lineWidth=2;for(const yy of [-2,4,10]){ctx.beginPath();ctx.moveTo(-e.r*.5,yy);ctx.lineTo(e.r*.5,yy);ctx.stroke();}}
        else if(e.kind==='spitter'){ctx.fillStyle='#bdd17c';ctx.beginPath();ctx.arc(0,-e.r*1.2,4,0,Math.PI*2);ctx.fill();}
        ctx.restore();
        if(e.hp<e.max){ctx.fillStyle='#201e25';ctx.fillRect(e.x-e.r,e.y-e.r-8,e.r*2,4);ctx.fillStyle='#f5c766';ctx.fillRect(e.x-e.r,e.y-e.r-8,e.r*2*e.hp/e.max,4);}
      }
      for(const s of shots){ctx.fillStyle='#d9f583';ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fill();}
      if(attackFlash){ctx.strokeStyle='#fff2ab';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,kit.range,p.angle-.55,p.angle+.55);ctx.stroke();}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle+Math.PI/2);ctx.globalAlpha=p.inv>0?.65:1;
      const stride=Math.sin(time*12)*4;
      ctx.strokeStyle='#805232';ctx.lineWidth=5;
      for(const side of [-1,1])for(const front of [-1,1]){ctx.beginPath();ctx.moveTo(side*8,front*11);ctx.lineTo(side*15,front*18+stride*side*front);ctx.stroke();ctx.fillStyle='#3b291d';ctx.fillRect(side*15-2,front*18+stride*side*front-2,5,5);}
      ctx.strokeStyle='#865637';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,19);ctx.quadraticCurveTo(8,28,Math.sin(time*4)*7,33);ctx.stroke();
      ctx.fillStyle='#efc26b';ctx.strokeStyle='#69452d';ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(0,3,13,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillRect(-5,-31,10,28);ctx.strokeRect(-5,-31,10,28);
      ctx.beginPath();ctx.ellipse(0,-32,11,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*11,-32,5,3,side*.6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(side*5,-37);ctx.lineTo(side*6,-43);ctx.stroke();ctx.fillStyle='#69452d';ctx.beginPath();ctx.arc(side*6,-43,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#efc26b';}
      ctx.fillStyle='#9c693e';for(const spot of [[-6,1],[5,8],[-3,17],[2,-18]]){ctx.beginPath();ctx.arc(spot[0],spot[1],3,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#222';ctx.fillRect(-7,-36,3,3);ctx.fillRect(4,-36,3,3);ctx.restore();
      for(const f of fx){ctx.save();ctx.globalAlpha=f.life/.6;ctx.fillStyle=f.color;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(f.label,f.x,f.y-20-(.6-f.life)*25);ctx.restore();}
      if(level.modifiers.darkness){
        const shade=ctx.createRadialGradient(p.x,p.y,65,p.x,p.y,270);shade.addColorStop(0,'#10152100');shade.addColorStop(1,'#101521ec');ctx.fillStyle=shade;ctx.fillRect(0,0,960,640);
      }
      if(!paused&&!ended&&(time<waveBannerUntil||(!enemies.length&&wave<level.waves.length))){ctx.fillStyle='#241b15cc';ctx.fillRect(340,12,280,40);ctx.fillStyle='#efe6d4';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText(!enemies.length&&wave<level.waves.length?'Next wave in '+Math.max(0,wait).toFixed(1)+'s':'Wave '+wave+' / '+level.waves.length,480,39);}
      if(paused||ended){ctx.fillStyle='#241b15bb';ctx.fillRect(0,0,960,640);ctx.fillStyle='#efe6d4';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText(ended?(result.won?'CLEARED!':'TRY AGAIN'):'PAUSED',480,310);ctx.font='20px sans-serif';ctx.fillText(ended?'Retry or return to the builder':'Press Resume when ready',480,350);}
      const objective=level.objective.type==='survive'?'Survive '+level.objective.target+'s':level.objective.type==='collect'?'Collect '+level.objective.target:level.objective.type==='exit'?'Reach the exit':'Clear all waves';
      hud.textContent='Health '+Math.ceil(p.hp)+' / '+kit.hp+' · '+time.toFixed(1)+'s · Wave '+Math.min(wave+(!enemies.length&&wave<level.waves.length?1:0),level.waves.length)+' / '+level.waves.length+' · '+kills+' defeated · '+collected+' collected — '+objective;
      hpMeter.bar.value=p.hp/kit.hp;hpMeter.text.textContent='Health '+Math.ceil(p.hp)+' / '+kit.hp;
      const goal=level.objective.type==='clear'?kills/totalEnemies:level.objective.type==='survive'?time/level.objective.target:level.objective.type==='collect'?collected/level.objective.target:ended&&result.won?1:0;
      goalMeter.bar.value=clamp(goal,0,1);goalMeter.text.textContent=objective+' · '+Math.floor(clamp(goal,0,1)*100)+'%';
    }
    function setPause(value){if(ended)return;paused=value;keys.clear();target=null;pauseBtn.textContent=paused?'Resume':'Pause';last=0;draw();}
    function keydown(e){
      const k=e.key.toLowerCase();
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','escape'].includes(k)){
        e.preventDefault();e.stopImmediatePropagation();
        if(k==='escape'){if(!e.repeat)setPause(!paused);}else keys.add(k);
      }
    }
    function keyup(e){const k=e.key.toLowerCase();if(keys.has(k)){keys.delete(k);e.preventDefault();e.stopImmediatePropagation();}}
    function point(e){
      const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/960,r.height/640);
      return{x:clamp((e.clientX-r.left-(r.width-960*scale)/2)/scale,0,960),y:clamp((e.clientY-r.top-(r.height-640*scale)/2)/scale,0,640)};
    }
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(pointer!==null)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);target=point(e);canvas.focus();});
    canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer)target=point(e);});
    function release(e){if(e.pointerId===pointer){pointer=null;target=null;}}
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    const blur=()=>setPause(true),visibility=()=>{if(document.hidden)setPause(true);};
    dlg.addEventListener('cancel',e=>{e.preventDefault();setPause(!paused);});
    document.addEventListener('keydown',keydown,true);document.addEventListener('keyup',keyup,true);
    window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    function advance(seconds){
      seconds=clamp(Number(seconds)||0,0,300);for(let n=0;n<Math.round(seconds*60);n++)step(1/60);draw();return snapshot();
    }
    function snapshot(){return {time,paused,ended,result:result&&Object.assign({},result),player:Object.assign({},p),wave,kills,coins:collected,heals,fx:fx.map(f=>Object.assign({},f)),pickups:pickups.map(o=>Object.assign({},o)),enemies:enemies.map(e=>Object.assign({},e)),shots:shots.map(s=>Object.assign({},s))};}
    function frame(now){
      if(!frameLive)return;
      if(last&&!paused&&!ended){carry+=Math.min((now-last)/1000,.1);while(carry>=1/60){step(1/60);carry-=1/60;}}
      last=now;draw();raf=requestAnimationFrame(frame);
    }
    current={stop,snapshot,advance,destroy(){frameLive=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',keydown,true);document.removeEventListener('keyup',keyup,true);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);dlg.close();dlg.remove();if(previousFocus&&previousFocus.isConnected)previousFocus.focus();}};
    dlg.showModal();canvas.focus();draw();raf=requestAnimationFrame(frame);return current;
  }
  return {start,stop,paintArena,paintCustom,getPalette,getKit:id=>KITS[id]?Object.assign({},KITS[id]):null,getEnemy:id=>FOES[id]?Object.assign({},FOES[id]):null,snapshot:()=>current?current.snapshot():null,advance:s=>current?current.advance(s):null};
})();
window.GRChallengePlay=GRChallengePlay;
