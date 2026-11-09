'use strict';
/* ADD-ON "Challenge Workshop", part 2 of 3 (see js/addons/50a-addon-challenge-data.js): the challenge arena, a fixed-step game of its own with its
   own dialog, input, combat, objectives and painter. It never reads or writes the campaign. */

// Challenge combat owns its state and clock; it never writes the campaign save.
var GRChallengePlay = (function(){
  let current = null;
  const KITS = {
    balanced:{hp:100,speed:180,damage:24,range:110,cooldown:.55},
    swift:{hp:70,speed:235,damage:18,range:125,cooldown:.4},
    tank:{hp:160,speed:140,damage:36,range:100,cooldown:.75},
    striker:{hp:90,speed:170,damage:46,range:100,cooldown:.9},              /* slow, heavy kicks */
    ranger:{hp:80,speed:190,damage:15,range:175,cooldown:.5},               /* the longest reach */
    glass:{hp:45,speed:250,damage:30,range:115,cooldown:.34}                /* very fast and very fragile */
  };
  const FOES = {
    chaser:{hp:40,speed:65,r:15,damage:10,col:'#c65342'},
    runner:{hp:24,speed:110,r:11,damage:7,col:'#da9d3f'},
    brute:{hp:140,speed:35,r:23,damage:20,col:'#8d68a9'},
    spitter:{hp:35,speed:48,r:14,damage:8,col:'#65a474'},
    flyer:{hp:26,speed:92,r:13,damage:7,col:'#3b332b',fly:true},            /* flies over walls and hazards */
    charger:{hp:80,speed:42,r:19,damage:16,col:'#8a6e52',charge:true},     /* stops, stamps, then dashes in a straight line */
    splitter:{hp:60,speed:55,r:17,damage:8,col:'#66401f',split:3},          /* bursts into three grubs */
    badger:{hp:120,speed:72,r:15,damage:12,col:'#2a2622',regen:10},         /* heals itself when left alone for two seconds */
    grub:{hp:12,speed:100,r:8,damage:4,col:'#e6ce9c'}                       /* only from a splitter; not a recipe choice */
  };
  /* each kind is drawn as a creature from the game (js/art/35h-draw-enemy.js) when that is loaded; the arena's own simple drawing is the fallback */
  const LOOK={chaser:'hyena',runner:'cheetah',brute:'rhino',spitter:'baboon',flyer:'vulture',charger:'warthog',splitter:'termite',badger:'honeybadger',grub:'grub'};
  const sfx=(name)=>{try{if(typeof SFX!=='undefined'&&SFX[name]&&!(typeof Settings!=='undefined'&&Settings.muted))SFX[name]();}catch(e){}};
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
    swamp:['#69725a','#a5b184','#536b44'],volcanic:['#5a504a','#d98949','#62594a'],
    beach:['#e2cf9c','#f7ead0','#5c9a6c'],cave:['#4b4552','#7d7290','#5c7f70'],meadow:['#8aa95c','#d4e09a','#4d7a3a']
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
  /* ---- the arena's things, one at a time, in the biome's own materials. `t` is the playtest clock (0 in the editor, so the editor holds still);
     small variations come from a hash of the object's place, never from the fight's random numbers. ---- */
  const hsh=(n)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
  const hexA=(hex,a)=>{const n=parseInt(String(hex).slice(1,7),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+Math.max(0,a).toFixed(3)+')';};
  const HAZ_TINT={savanna:'#7a5430',arctic:'#4a7a94',moon:'#50e6be',forest:'#3e4a24',desert:'#b08250',swamp:'#5f8a30',volcanic:'#ff7a30',beach:'#3a6a7a',cave:'#9a6ae0',meadow:'#6a5a2a'};
  /* spikes rise for 1.2 seconds in every 2.4, each set at its own moment (from its place); they show a warning glint just before. The editor (t=0) shows them up. */
  const spikePhase=o=>hsh(o.x*.37+o.y*1.13+7)*2.4;
  const spikesUp=(o,t)=>!t||((t+spikePhase(o))%2.4)<1.2;
  const spikesWarn=(o,t)=>!!t&&((t+spikePhase(o))%2.4)>2.05;
  /* an organic outline inside the box x,y,w,h: `sq` is how square it is (2 is an ellipse, 8 nearly a rounded box) and `rough` how far each point may
     sink inward, so the shape never leaves the box the game collides with. The path is left open for the caller to fill, stroke or clip. */
  function blobPath(ctx,x,y,w,h,seed,sq,rough){
    const cx=x+w/2,cy=y+h/2,n=Math.max(20,Math.round((w+h)/9)),pts=[];
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a),px=Math.sign(c)*Math.pow(Math.abs(c),2/sq),py=Math.sign(s)*Math.pow(Math.abs(s),2/sq);
      const k=rough*(.35+.65*hsh(seed+i*1.7)),len=Math.hypot(px*w/2,py*h/2)||1,ix=px*w/2/len*k,iy=py*h/2/len*k;
      pts.push([cx+px*w/2-ix,cy+py*h/2-iy]);
    }
    ctx.beginPath();
    const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],m0=mid(pts[n-1],pts[0]);ctx.moveTo(m0[0],m0[1]);
    for(let i=0;i<n;i++){const p=pts[i],m=mid(p,pts[(i+1)%n]);ctx.quadraticCurveTo(p[0],p[1],m[0],m[1]);}
    ctx.closePath();
  }
  const WALL_LOOK={
    savanna:{base:'#7a6248',top:'#b09a72',seam:'#3a2b2099',edge:'#c8ae7e55'},
    arctic:{base:'#9fc6d6',top:'#f4fbff',seam:'#5f8fa4aa',edge:'#ffffffaa'},
    moon:{base:'#6c6e78',top:'#a9acb8',seam:'#2f3038cc',edge:'#c9ccd8aa'},
    forest:{base:'#6e4a2c',top:'#9a6e44',seam:'#3a2414cc',edge:'#c49a6a77'},
    desert:{base:'#c49a62',top:'#ead0a0',seam:'#8a6438aa',edge:'#fff0c877'},
    swamp:{base:'#4e5642',top:'#7a8462',seam:'#262c1ecc',edge:'#9ab07a77'},
    volcanic:{base:'#37302c',top:'#5a4e48',seam:'#1a1412',edge:'#d9894955'},
    beach:{base:'#c9ab7a',top:'#efdcb4',seam:'#8a6a44aa',edge:'#fff6dc88'},
    cave:{base:'#3e3846',top:'#5e566a',seam:'#1c1822cc',edge:'#a89ac066'},
    meadow:{base:'#5e7a3e',top:'#86a456',seam:'#2e4220cc',edge:'#c4dc8a66'}
  };
  function paintObject(ctx,level,o,env){
    const x=o.x,y=o.y,w=o.w,h=o.h,cx=x+w/2,cy=y+h/2,theme=env.theme,palette=env.palette,detail=env.detail,t=env.time||0,seed=x*.37+y*1.13;
    const ellipse=(ex,ey,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(ex,ey,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fill();};
    const line=(pts,color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();};
    if(o.kind==='wall'){
      const L=WALL_LOOK[theme]||WALL_LOOK.savanna,long=w>=h;
      const wr=Math.min(8,Math.min(w,h)*.22);
      ctx.fillStyle='#20140f3a';blobPath(ctx,x+5,y+8,w,h,seed,5,wr);ctx.fill();
      ctx.save();blobPath(ctx,x,y,w,h,seed,5,wr);ctx.clip();
      try{
      ctx.fillStyle=L.base;ctx.fillRect(x,y,w,h);
      if(theme==='forest'){                                                    /* a palisade: logs along the wall, bark lines and cut ends */
        const across=long?h:w,run=long?w:h,n=Math.max(1,Math.round(across/13)),ws=[];let tot=0;
        for(let i=0;i<n;i++){ws.push(.75+.5*hsh(seed+i*3));tot+=ws[i];}
        let a=0;
        for(let i=0;i<n;i++){const b=ws[i]/tot*across,mid=a+b/2,sag=(hsh(seed+i*5)-.5)*3;
          ctx.fillStyle=i%2?'#7a5232':'#6a462a';ctx.beginPath();
          if(long){ctx.moveTo(x,y+a);ctx.quadraticCurveTo(x+w/2,y+a+sag,x+w,y+a);ctx.lineTo(x+w,y+a+b-1);ctx.quadraticCurveTo(x+w/2,y+a+b-1+sag,x,y+a+b-1);}
          else{ctx.moveTo(x+a,y);ctx.quadraticCurveTo(x+a+sag,y+h/2,x+a,y+h);ctx.lineTo(x+a+b-1,y+h);ctx.quadraticCurveTo(x+a+b-1+sag,y+h/2,x+a+b-1,y);}
          ctx.closePath();ctx.fill();
          if(detail)for(let k=0;k<run/26;k++){const q=k*26+hsh(seed+i*7+k)*12,o2=(hsh(seed+i+k*3)-.5)*b*.4;ctx.strokeStyle='#4a2e1a88';ctx.lineWidth=1;ctx.beginPath();
            if(long){ctx.moveTo(x+q,y+mid+o2);ctx.quadraticCurveTo(x+q+5,y+mid+o2-2,x+q+10,y+mid+o2);}else{ctx.moveTo(x+mid+o2,y+q);ctx.quadraticCurveTo(x+mid+o2-2,y+q+5,x+mid+o2,y+q+10);}ctx.stroke();}
          if(detail&&hsh(seed+i*13)>.5){const kq=run*(.2+.6*hsh(seed+i*17));ellipse(long?x+kq:x+mid,long?y+mid:y+kq,b*.22,b*.16,'#4a2e1a');ellipse(long?x+kq:x+mid,long?y+mid:y+kq,b*.1,b*.07,'#8a6040');}
          if(long){ellipse(x+3,y+mid,3,b/2-1,'#b08458');ellipse(x+w-3,y+mid,3,b/2-1,'#b08458');}else{ellipse(x+mid,y+3,b/2-1,3,'#b08458');ellipse(x+mid,y+h-3,b/2-1,3,'#b08458');}
          a+=b;
        }
      }else if(theme==='moon'){                                                /* metal panels with rivets and a running light */
        ctx.fillStyle=L.top;ctx.fillRect(x,y,w,4);
        const run=long?w:h;ctx.strokeStyle=L.seam;ctx.lineWidth=2;
        for(let q=0,i=0;q<run;i++){const pw=26+hsh(seed+i*7)*26,bow=(hsh(seed+i*3)-.5)*8;
          if(i%2){ctx.fillStyle='#ffffff10';if(long)ctx.fillRect(x+q,y,pw,h);else ctx.fillRect(x,y+q,w,pw);}
          q+=pw;if(q>=run-6)break;
          ctx.beginPath();if(long){ctx.moveTo(x+q,y);ctx.quadraticCurveTo(x+q+bow,y+h/2,x+q,y+h);}else{ctx.moveTo(x,y+q);ctx.quadraticCurveTo(x+w/2,y+q+bow,x+w,y+q);}ctx.stroke();
          if(detail){for(const e2 of [.22,.78]){ellipse(long?x+q-4:x+w*e2,long?y+h*e2:y+q-4,1.6,1.6,'#d0d3dc');ellipse(long?x+q+4:x+w*e2,long?y+h*e2:y+q+4,1.6,1.6,'#d0d3dc');}}
        }
        const glow=.5+.5*Math.sin(t*3+seed);ctx.fillStyle='rgba(120,200,255,'+(.35+.4*glow).toFixed(3)+')';if(long)ctx.fillRect(x+6,cy-1,w-12,2);else ctx.fillRect(cx-1,y+6,2,h-12);
      }else if(theme==='volcanic'){                                            /* basalt columns with glowing seams that breathe */
        const run=long?w:h,across=long?h:w,cuts=[0];
        for(let q=0,i=0;q<run;i++){q+=12+hsh(seed+i*5)*16;cuts.push(Math.min(run,q));}
        for(let i=0;i<cuts.length-1;i++){ctx.fillStyle=['#3d3531','#332b28','#38302c'][i%3];if(long)ctx.fillRect(x+cuts[i],y,cuts[i+1]-cuts[i],h);else ctx.fillRect(x,y+cuts[i],w,cuts[i+1]-cuts[i]);
          const top=['#5a4e48','#4e443f'][i%2];ctx.fillStyle=top;if(long)ctx.fillRect(x+cuts[i]+1,y,cuts[i+1]-cuts[i]-2,3+hsh(seed+i)*3);else ctx.fillRect(x,y+cuts[i]+1,3+hsh(seed+i)*3,cuts[i+1]-cuts[i]-2);}
        const glow=.5+.5*Math.sin(t*2.2+seed);ctx.strokeStyle='rgba(255,'+Math.round(110+60*glow)+',40,'+(.45+.4*glow).toFixed(3)+')';ctx.lineWidth=1.6;
        for(let i=1;i<cuts.length-1;i++){const c0=cuts[i];ctx.beginPath();
          for(let k=0;k<=4;k++){const along2=across*k/4,off=(hsh(seed+i*7+k)-.5)*5;if(long){k?ctx.lineTo(x+c0+off,y+along2):ctx.moveTo(x+c0+off,y+along2);}else{k?ctx.lineTo(x+along2,y+c0+off):ctx.moveTo(x+along2,y+c0+off);}}
          ctx.stroke();}
        ctx.fillStyle=L.top;ctx.fillRect(x,y,w,3);
      }else{                                                                  /* stone, ice, adobe or mossy blocks */
        ctx.fillStyle=L.top;ctx.fillRect(x,y,w,5);
        ctx.strokeStyle=L.seam;ctx.lineWidth=theme==='arctic'?1.5:2;
        /* packed, uneven stones (ice chunks, adobe lumps, mossy rocks) in rough courses, each its own size and shade */
        const along=w>=h,L1=along?w:h,L2=along?h:w,course=Math.max(1,Math.round(L2/(theme==='desert'?15:19))),ch=L2/course,shades=[L.base,L.top+'66',L.seam.slice(0,7)+'33'];
        for(let r=0;r<course;r++){
          let u=-hsh(seed+r*9)*14;
          for(let k=0;u<L1&&k<60;k++){
            const sw=(theme==='arctic'?16:20)+hsh(seed+r*31+k*7)*16,a=u+sw/2,b=r*ch+ch/2,sx=along?x+a:x+b,sy=along?y+b:y+a,rx=(along?sw:ch)/2-1.2,ry=(along?ch:sw)/2-1.2;
            ctx.fillStyle=shades[Math.floor(hsh(seed+r*5+k*3)*3)];ctx.beginPath();ctx.ellipse(sx,sy,Math.max(2,rx),Math.max(2,ry),(hsh(seed+k+r)-.5)*.25,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle=L.seam;ctx.lineWidth=theme==='arctic'?1.2:1.6;ctx.stroke();
            if(detail&&hsh(seed+r*3+k*11)>.55){ctx.fillStyle=L.edge;ctx.beginPath();ctx.ellipse(sx-rx*.3,sy-ry*.35,Math.max(1,rx*.35),Math.max(1,ry*.22),0,0,Math.PI*2);ctx.fill();}
            u+=sw;
          }
        }
        if(theme==='arctic'&&detail)for(let s=10;s<w;s+=34){line([x+s,y+6,x+s+6,y+14,x+s+3,y+20],'#ffffffaa',1);}
        if(theme==='swamp'&&detail)for(let s=0;s<w;s+=14){const m=hsh(seed+s);if(m>.35)ellipse(x+s+7,y+2+m*3,7*m+3,3+m*2,'#6f8a44cc');}
        if(theme==='desert'&&detail){for(let s=6;s<w;s+=30)ellipse(x+s,y+h*.6,2,1.4,'#8a643866');ctx.fillStyle='#ead0a055';ctx.fillRect(x,y+h-4,w,4);}
        if(theme==='beach'&&detail)for(let s=8;s<w;s+=26){const m=hsh(seed+s*5);if(m>.4){ellipse(x+s,y+h*(.3+.4*m),3.2,2.4,m>.7?'#f4c6b0':'#fff4e0');ctx.strokeStyle='#b08a6a';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x+s,y+h*(.3+.4*m)+1,2.4,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}}
        if(theme==='meadow'){for(let s=0;s<w;s+=11){const m=hsh(seed+s);ellipse(x+s+5,y+3+m*2,7,4+m*2,m>.5?'#7a9a4a':'#6a8a40');}
          if(detail)for(let s=6;s<w;s+=17){const m=hsh(seed+s*3);if(m>.45)ellipse(x+s,y+4+m*3,2.2,2.2,['#f6f0f0','#f2d04a','#e88ab0'][Math.floor(m*7)%3]);}}
        if(theme==='cave'&&detail)for(let s=10;s<w;s+=24){const m=hsh(seed+s*7);if(m>.55){ellipse(x+s,y+h*.5,2.6,2.6,'rgba(150,230,210,'+(.35+.4*(t?.5+.5*Math.sin(t*2+s):.5)).toFixed(3)+')');}}
      }
      if(detail){ctx.strokeStyle=L.edge;ctx.lineWidth=1.2;blobPath(ctx,x+3,y+3,w-6,h-6,seed+5,5,wr*.6);ctx.stroke();}
      }finally{ctx.restore();}
      blobPath(ctx,x,y,w,h,seed,5,wr);ctx.strokeStyle='#241b1522';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#241b1566';ctx.lineWidth=1.4;ctx.stroke();
      const edgeIn=Math.min(wr,6);                                             /* how far the uneven outline may sit inside the box */
      if(theme==='arctic'){
        ctx.fillStyle='#ffffff';for(let s=wr;s<w-wr;s+=9)ellipse(x+s,y+edgeIn*.5+1,6+3*hsh(seed+s),3+1.5*hsh(seed+s*3),'#ffffff');
        for(let s=wr+6;s<w-wr-4;s+=22){const top=y+h-edgeIn*.6;ctx.fillStyle='#e8f6ff';ctx.beginPath();ctx.moveTo(x+s,top);ctx.lineTo(x+s+5,top);ctx.lineTo(x+s+2.5,top+5+4*hsh(seed+s));ctx.closePath();ctx.fill();}
      }
      if(theme==='swamp'&&detail)for(let s=wr;s<w-wr;s+=14){const m=hsh(seed+s);if(m>.7)line([x+s+4,y+h-edgeIn*.6,x+s+3,y+h+4+m*6],'#5c7a36',1.5);}
      if(theme==='savanna'&&detail)for(let s=wr;s<w-wr;s+=16){const m=hsh(seed+s*3);if(m>.4){const b0=y+h-edgeIn*.4;line([x+s,b0+2,x+s-2,b0-4-m*4,x+s+1,b0+2,x+s+3,b0-3-m*3],'#8a9a4ccc',1.2);}}
      if(theme==='cave')for(let s=wr+4;s<w-wr-4;s+=19){const m=hsh(seed+s*11);if(m>.35){const top=y+h-edgeIn*.6;ctx.fillStyle='#4a4254';ctx.beginPath();ctx.moveTo(x+s-3,top);ctx.lineTo(x+s+3,top);ctx.lineTo(x+s,top+5+m*7);ctx.closePath();ctx.fill();}}
    }else if(o.kind==='hazard'){
      const hr=Math.min(10,Math.min(w,h)*.16);
      ctx.save();blobPath(ctx,x,y,w,h,seed,3.2,hr);ctx.clip();
      try{
      if(theme==='volcanic'){
        ctx.fillStyle='#8a2a10';ctx.fillRect(x,y,w,h);
        for(let i=0;i<Math.max(4,w*h/1800);i++){const px=x+hsh(seed+i)*w,py=y+hsh(seed+i*3)*h,r=8+hsh(seed+i*5)*16,f=.5+.5*Math.sin(t*1.7+i);ellipse(px+Math.sin(t*.6+i)*4,py,r,r*.6,'rgba(255,'+Math.round(120+80*f)+',30,.85)');}
        for(let i=0;i<Math.max(3,w*h/2600);i++){const px=x+hsh(seed+i*11)*w,py=y+hsh(seed+i*13)*h;ellipse(px+Math.sin(t*.4+i*2)*6,py,10+hsh(i)*10,5,'#3a1a0ecc');}
      }else if(theme==='swamp'){
        ctx.fillStyle='#3e5a22';ctx.fillRect(x,y,w,h);ctx.fillStyle='#5f8a30';ctx.fillRect(x+3,y+3,w-6,h-6);ctx.fillStyle='#7aa84055';ctx.fillRect(x+8,y+8,w-16,h*.3);
        for(let i=0;i<Math.max(4,w*h/1400);i++){const ph=(t*.7+hsh(seed+i))%1,px=x+hsh(seed+i*7)*w,py=y+hsh(seed+i*9)*h;ctx.strokeStyle='rgba(210,255,140,'+(.8*(1-ph)).toFixed(3)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(px,py,2+ph*5,0,Math.PI*2);ctx.stroke();}
        if(detail)for(let i=0;i<w/30;i++)ellipse(x+12+i*30,y+h-8,6,2.5,'#2e4a18');
      }else if(theme==='arctic'){
        ctx.fillStyle='#2c5a74';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8cc6dc';
        for(let i=0;i<Math.max(5,w*h/1200);i++){const px=x+hsh(seed+i)*w,py=y+hsh(seed+i*3)*h;ctx.beginPath();ctx.moveTo(px,py-9);ctx.lineTo(px+12,py-2);ctx.lineTo(px+5,py+10);ctx.lineTo(px-9,py+4);ctx.closePath();ctx.fill();}
        line([x+4,y+h*.3,x+w*.4,y+h*.5,x+w*.7,y+h*.2,x+w-4,y+h*.6],'#e8f8ff',1.4);
        const tw=(t*1.5)%1;ellipse(x+w*tw,y+h*(.3+.4*hsh(Math.floor(t*1.5))),2,2,'#ffffff');
      }else if(theme==='desert'){
        ctx.fillStyle='#b08250';ctx.fillRect(x,y,w,h);
        for(let r=6;r<Math.max(w,h);r+=10){ctx.strokeStyle='rgba(120,80,40,'+(.5-r/Math.max(w,h)*.4).toFixed(3)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,r,r*h/w,t*.8,0,Math.PI*1.6);ctx.stroke();}
        if(detail)for(let i=0;i<w/40;i++){const px=x+16+i*40,py=y+h-10;ctx.strokeStyle='#5f8a4a';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-14);ctx.stroke();ctx.lineCap='butt';}
      }else if(theme==='moon'){
        ctx.fillStyle='#3a3a44';ctx.fillRect(x,y,w,h);
        const g=.5+.5*Math.sin(t*2+seed);ellipse(cx,cy,w*.42,h*.38,'rgba(80,230,190,'+(.25+.25*g).toFixed(3)+')');ellipse(cx,cy,w*.3,h*.26,'#1e2a2a');
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*.5;ellipse(cx+Math.cos(a)*w*.36,cy+Math.sin(a)*h*.3,2,2,'#9ffff0');}
      }else if(theme==='beach'){                                               /* a rock pool: wet stone, sea urchins and a little swell */
        ctx.fillStyle='#4a7a88';ctx.fillRect(x,y,w,h);ctx.fillStyle='#6aa4b0';ctx.fillRect(x+4,y+4,w-8,h-8);
        const sw=t?Math.sin(t*1.4+seed)*.5+.5:.5;ctx.strokeStyle='rgba(230,250,255,'+(.25+.3*sw).toFixed(3)+')';ctx.lineWidth=1.4;
        for(let r=0;r<3;r++){ctx.beginPath();ctx.ellipse(cx,cy,w*(.2+r*.12+sw*.03),h*(.16+r*.1+sw*.03),0,0,Math.PI*2);ctx.stroke();}
        for(let i=0;i<Math.max(3,w*h/1500);i++){const px=x+10+hsh(seed+i)*(w-20),py=y+10+hsh(seed+i*3)*(h-20),r=4+hsh(seed+i*5)*3;
          ctx.strokeStyle='#2a1a3a';ctx.lineWidth=1.2;for(let k=0;k<10;k++){const a=k/10*Math.PI*2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a)*r*1.9,py+Math.sin(a)*r*1.9);ctx.stroke();}ellipse(px,py,r,r,'#3a2050');ellipse(px-1,py-1,r*.4,r*.4,'#7a5aa0');}
      }else if(theme==='cave'){                                                /* a bed of glowing crystal shards */
        ctx.fillStyle='#2a2238';ctx.fillRect(x,y,w,h);
        for(let i=0;i<Math.max(5,w*h/1000);i++){const px=x+hsh(seed+i)*w,py=y+hsh(seed+i*3)*h,hh=8+hsh(seed+i*5)*12,g=t?.5+.5*Math.sin(t*2.4+i):.6;
          ctx.fillStyle='rgba(180,140,255,'+(.15*g).toFixed(3)+')';ctx.beginPath();ctx.arc(px,py,hh,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=i%2?'#b48cf0':'#d4b8ff';ctx.beginPath();ctx.moveTo(px-4,py+4);ctx.lineTo(px,py-hh);ctx.lineTo(px+4,py+4);ctx.closePath();ctx.fill();
          ctx.fillStyle='#f4ecff';ctx.beginPath();ctx.moveTo(px-1,py+2);ctx.lineTo(px,py-hh*.8);ctx.lineTo(px+1,py+2);ctx.closePath();ctx.fill();}
      }else if(theme==='meadow'){                                              /* a nettle patch with a bees' nest humming over it */
        ctx.fillStyle='#3e5e22';ctx.fillRect(x,y,w,h);
        for(let i=0;i<Math.max(8,w*h/450);i++){const px=x+hsh(seed+i)*w,py=y+8+hsh(seed+i*3)*h,a=(hsh(seed+i*5)-.5)*.8,l=14+hsh(seed+i*7)*8;
          ctx.fillStyle=['#6a9a3a','#7aac44','#5a8a32'][i%3];ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+Math.cos(a-1.2)*l*.6,py-l*.5,px+Math.sin(a)*3,py-l);ctx.quadraticCurveTo(px+Math.cos(a+1.2)*l*.6,py-l*.5,px,py);ctx.fill();
          ctx.strokeStyle='#c8e0a066';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.sin(a)*3,py-l*.9);ctx.stroke();}
        const nx=x+w*(.3+.4*hsh(seed+2)),ny=y+h*(.35+.3*hsh(seed+4));ellipse(nx,ny,9,11,'#c8a050');for(let k=-2;k<=2;k++){ctx.strokeStyle='#8a6a2a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(nx-8,ny+k*4);ctx.lineTo(nx+8,ny+k*4);ctx.stroke();}ellipse(nx,ny+5,2.4,2,'#2a1a0a');
        for(let k=0;k<5;k++){const a=t*(2+k*.4)+k*1.3,bx=nx+Math.cos(a)*(14+k*3),by=ny+Math.sin(a*1.3)*(10+k*2);ellipse(bx,by,2.4,1.8,'#f2c430');ctx.fillStyle='#2a1a0a';ctx.fillRect(bx-.5,by-1.8,1,3.6);ellipse(bx,by-2,1.8,1,'#ffffffaa');}
      }else if(theme==='forest'){
        ctx.fillStyle='#3e4a24';ctx.fillRect(x,y,w,h);
        for(let i=0;i<Math.max(4,w*h/1300);i++){const px=x+8+hsh(seed+i)*(w-16),py=y+8+hsh(seed+i*3)*(h-16),r=5+hsh(seed+i*7)*5;line([px,py+r,px,py+r+5],'#e8dcc0',2.4);ellipse(px,py+r*.4,r,r*.7,'#8a3a8a');ellipse(px-r*.3,py,1.4,1.4,'#f0d0f0');ellipse(px+r*.4,py+r*.2,1.2,1.2,'#f0d0f0');}
      }else{
        ctx.fillStyle='#7a5430';ctx.fillRect(x,y,w,h);
        for(let i=0;i<Math.max(5,w*h/900);i++){const px=x+hsh(seed+i)*w,py=y+hsh(seed+i*3)*h,a=hsh(seed+i*5)*6;line([px-8*Math.cos(a),py-8*Math.sin(a),px,py,px+9*Math.cos(a+.8),py+9*Math.sin(a+.8)],'#3a2412',1.6);
          for(let k=0;k<3;k++){const sx=px+Math.cos(a+k*2)*5,sy=py+Math.sin(a+k*2)*5;line([sx,sy,sx+Math.cos(a+k*2)*3,sy+Math.sin(a+k*2)*3],'#e8d8b0',1);}
          if(hsh(seed+i*9)>.6)ellipse(px+3,py-3,2,2,'#c83a2a');}
      }
      /* a soft edge: inside the patch the last few pixels fade toward the ground's own colour ... */
      const lum=hex=>{const n=parseInt(String(hex).slice(1,7),16);return ((n>>16&255)*.3+(n>>8&255)*.59+(n&255)*.11)/255;},gap=Math.abs(lum(palette[0])-lum(HAZ_TINT[theme]||'#7a5430'));
      const passes=gap>.35?6:4,al=.14+gap*.12;                                 /* the starker the patch against the ground, the wider and stronger the blend */
      for(let i=0;i<passes;i++){ctx.strokeStyle=hexA(palette[0],al);ctx.lineWidth=3+i*4;blobPath(ctx,x,y,w,h,seed,3.2,hr);ctx.stroke();}
      }finally{ctx.restore();}
      /* ... and outside it, a halo of the hazard's own colour bleeds a little into the ground, with a faint warm glow that breathes instead of a hard dashed line */
      const tint=HAZ_TINT[theme]||HAZ_TINT.savanna;
      for(let i=0;i<4;i++){ctx.strokeStyle=hexA(tint,.13-i*.025);ctx.lineWidth=2+i*3;blobPath(ctx,x,y,w,h,seed,3.2,hr);ctx.stroke();}
      const pulse=.18+.12*Math.sin(t*4);ctx.strokeStyle='rgba(240,150,90,'+pulse.toFixed(3)+')';ctx.lineWidth=1.5;blobPath(ctx,x+1,y+1,w-2,h-2,seed,3.2,hr);ctx.stroke();
    }else if(o.kind==='coin'){
      const r=Math.min(w,h)*.4,spin=t?Math.max(.18,Math.abs(Math.cos(t*3+seed))):1,bob=t?Math.sin(t*2.4+seed)*1.5:0;
      ellipse(cx+2,cy+r*.75,r*.9,r*.35,'#39261a44');
      ctx.save();ctx.translate(cx,cy+bob);ctx.scale(spin,1);
      ellipse(0,0,r,r,'#a56a21');ellipse(-1,-2,r*.87,r*.87,'#f2bd50');
      ctx.strokeStyle='#fff0a6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-1,-2,r*.62,-Math.PI,.1);ctx.stroke();
      ctx.fillStyle='#8d5b22';ctx.fillRect(-1,-r*.45,2,r*.9);
      if(detail){ctx.strokeStyle='#ae782e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*.91,.3,2.6);ctx.stroke();}
      ctx.restore();
      const tw=t?(t*1.3+hsh(seed))%2:0;if(tw<.35){const s=Math.sin(tw/.35*Math.PI)*4;line([cx+r*.5-s,cy-r*.5+bob,cx+r*.5+s,cy-r*.5+bob],'#fffbe0',1.4);line([cx+r*.5,cy-r*.5-s+bob,cx+r*.5,cy-r*.5+s+bob],'#fffbe0',1.4);}
    }else if(o.kind==='heal'){                                               /* a tied cloth pouch of medicine, two leaves tucked in its knot */
      const bob=t?Math.sin(t*2+seed)*2.5:0,g=t?.5+.5*Math.sin(t*3+seed):.5,py=cy+h*.1+bob,rx=w*.42,ry=h*.34;
      ellipse(cx+3,y+h*.94,w*.38,h*.12,'#38251b33');
      ellipse(cx,py,w*.62,h*.6,'rgba(255,120,110,'+(.08+.12*g).toFixed(3)+')');
      ctx.fillStyle='#eee1bd';ctx.beginPath();ctx.moveTo(cx-w*.12,y+h*.3+bob);ctx.quadraticCurveTo(cx-rx*1.15,py-ry*.3,cx-rx,py+ry*.2);ctx.quadraticCurveTo(cx-rx*.9,py+ry*1.05,cx,py+ry);ctx.quadraticCurveTo(cx+rx*.9,py+ry*1.05,cx+rx,py+ry*.2);ctx.quadraticCurveTo(cx+rx*1.15,py-ry*.3,cx+w*.12,y+h*.3+bob);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#8a5735';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#d9c79c';ctx.beginPath();ctx.ellipse(cx,y+h*.22+bob,w*.1,h*.07,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(const sd of [-1,1]){ctx.fillStyle=sd<0?'#6a9a48':'#7fae52';ctx.beginPath();ctx.ellipse(cx+sd*w*.13,y+h*.13+bob,w*.13,h*.055,sd*-.7,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#b24d36';const cw=w*.11,cl=w*.32;
      ctx.beginPath();ctx.ellipse(cx,py+ry*.15,cw,cl/2,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx,py+ry*.15,cl/2,cw,0,0,Math.PI*2);ctx.fill();
      if(detail){ctx.strokeStyle='#b8a28288';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-rx*.6,py-ry*.2);ctx.quadraticCurveTo(cx-rx*.75,py+ry*.4,cx-rx*.35,py+ry*.8);ctx.stroke();}
    }else if(o.kind==='exit'){                                               /* a ring of standing stones round a swirling way out */
      const rx=w/2,ry=h/2;
      ellipse(cx+3,cy+ry*.9,rx,ry*.25,'#20140f44');
      ellipse(cx,cy,rx,ry,'#3e3622');
      ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx*.74,ry*.74,0,0,Math.PI*2);ctx.clip();
      try{ctx.fillStyle='#16241c';ctx.fillRect(x,y,w,h);
        for(let i=0;i<3;i++){const a=t*(1.2+i*.4)+i*2.1;ctx.strokeStyle=['#7fe0a0','#f0d394','#c0ffd8'][i];ctx.lineWidth=2.4-i*.5;ctx.beginPath();ctx.ellipse(cx,cy,rx*(.62-i*.16),ry*(.62-i*.16),0,a,a+Math.PI*1.2);ctx.stroke();}
        ellipse(cx,cy,w*.1,h*.1,'#e8fff0');}finally{ctx.restore();}
      const n=Math.max(8,Math.round((w+h)/14));
      for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.2,sx=cx+Math.cos(a)*rx*.86,sy=cy+Math.sin(a)*ry*.86,sr=Math.min(w,h)*(.09+.03*hsh(seed+i));
        ellipse(sx+1,sy+2,sr,sr*.85,'#20140f55');ellipse(sx,sy,sr,sr*.85,i%2?'#a89070':'#bba27c');ellipse(sx-sr*.3,sy-sr*.3,sr*.4,sr*.3,'#d8c49c');}
      const p=t?(Math.sin(t*4)*.5+.5)*4:0;ctx.strokeStyle='#f0d394';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+w*.3+p,cy);ctx.lineTo(x+w*.7+p,cy);ctx.lineTo(x+w*.57+p,y+h*.36);ctx.moveTo(x+w*.7+p,cy);ctx.lineTo(x+w*.57+p,y+h*.64);ctx.stroke();
      if(detail){const lamp=t?.6+.4*Math.sin(t*5):.8;for(const sd of [-1,1]){const lx=cx+Math.cos(-Math.PI/2+sd*.55)*rx*.86,ly=cy+Math.sin(-Math.PI/2+sd*.55)*ry*.86;ellipse(lx,ly-6,4,4,'rgba(255,230,140,'+(lamp*.35).toFixed(3)+')');ellipse(lx,ly-6,2.2,2.2,'rgba(255,240,180,'+lamp.toFixed(3)+')');}}
    }else if(o.kind==='tree'){
      ellipse(cx+w*.14,y+h*.85,w*.47,h*.18,'#362b2033');
      if(detail)for(let i=0;i<5;i++){const a=hsh(seed+i)*Math.PI*2,d=w*(.3+.2*hsh(seed+i*3));ellipse(cx+Math.cos(a)*d,y+h*.88+Math.sin(a)*d*.25,2.4,1.4,theme==='arctic'?'#ffffffcc':theme==='volcanic'?'#5a4a40':palette[2]+'cc');}
      ctx.fillStyle='#795135';ctx.fillRect(cx-w*.055,y+h*.25,w*.11,h*.65);
      const sway=t?Math.sin(t*1.3+seed)*w*.025:0;
      ctx.save();ctx.translate(sway,0);
      try{
      if(theme==='desert'){
        ctx.strokeStyle=palette[2];ctx.lineWidth=Math.max(4,w*.14);ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(cx,y+h*.87);ctx.lineTo(cx,y+h*.16);ctx.moveTo(cx,y+h*.58);ctx.lineTo(x+w*.2,y+h*.58);ctx.lineTo(x+w*.2,y+h*.32);ctx.moveTo(cx,y+h*.43);ctx.lineTo(x+w*.8,y+h*.43);ctx.lineTo(x+w*.8,y+h*.24);ctx.stroke();ctx.lineCap='butt';
        ctx.strokeStyle=palette[1]+'88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-2,y+h*.78);ctx.lineTo(cx-2,y+h*.23);ctx.stroke();
        if(detail){ellipse(cx,y+h*.15,w*.05,h*.03,'#f08aa0');for(let k=0;k<6;k++)line([cx-2,y+h*(.3+k*.09),cx-6,y+h*(.29+k*.09)],'#e8f0d8aa',1);}
      }else if(theme==='beach'){                                               /* a leaning palm with coconuts */
        ctx.strokeStyle='#9a7448';ctx.lineWidth=Math.max(4,w*.09);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,y+h*.9);ctx.quadraticCurveTo(cx-w*.05,y+h*.5,cx+w*.12,y+h*.22);ctx.stroke();ctx.lineCap='butt';
        if(detail){ctx.strokeStyle='#7a5636';ctx.lineWidth=1;for(let k=0;k<6;k++){const u=.3+k*.1;ctx.beginPath();ctx.moveTo(cx-w*.05+u*w*.1,y+h*(.9-u*.65));ctx.lineTo(cx+w*.05+u*w*.1,y+h*(.88-u*.65));ctx.stroke();}}
        const tx=cx+w*.12,ty=y+h*.22;
        for(let k=0;k<6;k++){const a=-Math.PI*.95+k*Math.PI*.38,l=w*(.42+.08*hsh(seed+k));ctx.strokeStyle=k%2?palette[2]:'#4c8a5a';ctx.lineWidth=Math.max(3,w*.07);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+Math.cos(a)*l*.6,ty+Math.sin(a)*l*.6-h*.08,tx+Math.cos(a)*l,ty+Math.sin(a)*l*.6+h*.08);ctx.stroke();ctx.lineCap='butt';}
        for(const d of [[-4,4],[4,5],[0,8]])ellipse(tx+d[0]*w/60,ty+d[1]*h/90,w*.05,w*.05,'#6a4a2a');
      }else if(theme==='cave'){                                                /* a giant glowing mushroom */
        ctx.fillStyle='#d8d0c0';ctx.beginPath();ctx.moveTo(cx-w*.08,y+h*.9);ctx.quadraticCurveTo(cx-w*.12,y+h*.6,cx-w*.06,y+h*.4);ctx.lineTo(cx+w*.06,y+h*.4);ctx.quadraticCurveTo(cx+w*.12,y+h*.6,cx+w*.08,y+h*.9);ctx.closePath();ctx.fill();
        const g=t?.5+.5*Math.sin(t*1.6+seed):.6;ellipse(cx,y+h*.36,w*.55,h*.3,'rgba(120,230,210,'+(.08+.1*g).toFixed(3)+')');
        ctx.fillStyle='#5a9a8a';ctx.beginPath();ctx.ellipse(cx,y+h*.38,w*.46,h*.22,0,Math.PI,0);ctx.closePath();ctx.fill();
        ctx.fillStyle='#3a6a64';ctx.fillRect(cx-w*.46,y+h*.37,w*.92,h*.04);
        for(let k=0;k<5;k++)ellipse(cx+(k-2)*w*.17,y+h*(.28+(k%2)*.05),w*.035,w*.035,'rgba(200,255,240,'+(.6+.4*g).toFixed(3)+')');
      }else if(theme==='swamp'){
        for(let n=0;n<7;n++){
          const xx=x+w*(.14+n*.12),yy=y+h*(.15+(n%3)*.12);ctx.strokeStyle=palette[2];ctx.lineWidth=Math.max(2,w*.025);ctx.beginPath();ctx.moveTo(cx,y+h*.9);ctx.quadraticCurveTo(xx,y+h*.45,xx,yy);ctx.stroke();
          ctx.fillStyle='#775638';ctx.fillRect(xx-w*.025,yy,w*.05,h*.15);
        }
      }else if(theme==='forest'||theme==='arctic'){
        for(let n=2;n>=0;n--){const ty=y+h*(.2+n*.18),half=w*(.22+n*.12);ctx.fillStyle=n%2?palette[2]:palette[1];ctx.beginPath();ctx.moveTo(cx,ty-h*.2);ctx.lineTo(cx+half,ty+h*.22);ctx.lineTo(cx-half,ty+h*.22);ctx.closePath();ctx.fill();
          if(theme==='arctic'){ctx.fillStyle='#ffffffdd';ctx.beginPath();ctx.moveTo(cx,ty-h*.2);ctx.lineTo(cx+half*.5,ty);ctx.lineTo(cx-half*.5,ty+h*.02);ctx.closePath();ctx.fill();}}
        if(detail&&theme==='forest')for(let k=0;k<4;k++)ellipse(cx+(hsh(seed+k)-.5)*w*.5,y+h*(.3+hsh(seed+k*3)*.4),2,2,'#d84a3a');
      }else if(theme==='volcanic'){
        ctx.strokeStyle='#3d322b';ctx.lineWidth=Math.max(3,w*.05);ctx.beginPath();ctx.moveTo(cx,y+h*.9);ctx.lineTo(cx,y+h*.1);ctx.moveTo(cx,y+h*.6);ctx.lineTo(x+w*.2,y+h*.25);ctx.moveTo(cx,y+h*.5);ctx.lineTo(x+w*.8,y+h*.2);ctx.stroke();
        const e=t?.5+.5*Math.sin(t*3+seed):.7;ellipse(cx,y+h*.1,w*.04,h*.03,'rgba(255,150,60,'+e.toFixed(3)+')');ellipse(x+w*.2,y+h*.25,w*.03,h*.02,'rgba(255,150,60,'+(e*.8).toFixed(3)+')');
      }else{
        ctx.strokeStyle='#795135';ctx.lineWidth=Math.max(2,w*.045);ctx.beginPath();ctx.moveTo(cx,y+h*.7);ctx.lineTo(x+w*.2,y+h*.35);ctx.moveTo(cx,y+h*.6);ctx.lineTo(x+w*.8,y+h*.3);ctx.stroke();
        ellipse(cx,y+h*.3,w*.47,h*.22,palette[2]);ellipse(x+w*.27,y+h*.27,w*.25,h*.17,palette[2]);ellipse(x+w*.68,y+h*.2,w*.27,h*.15,palette[2]);
        if(detail){ellipse(cx-w*.1,y+h*.24,w*.2,h*.06,palette[1]+'66');for(let k=0;k<3;k++)ellipse(x+w*(.3+k*.2),y+h*(.33+(k%2)*.04),1.6,1.6,'#3a3a2a');}
        if(theme==='meadow')for(let k=0;k<9;k++)ellipse(x+w*(.12+.76*hsh(seed+k*3)),y+h*(.14+.26*hsh(seed+k*5)),w*.035,w*.035,k%3?'#f6d8e4':'#ffffff');   /* blossom */
      }
      if(detail){ctx.strokeStyle='#b18b5a77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-1,y+h*.8);ctx.lineTo(cx-1,y+h*.6);ctx.stroke();}
      }finally{ctx.restore();}
    }else if(o.kind==='rock'){
      ellipse(cx+4,y+h*.8,w*.47,h*.2,'#32251f33');
      if(detail)for(let i=0;i<4;i++)ellipse(x+w*hsh(seed+i),y+h*(.9+.08*hsh(seed+i*3)),2+2*hsh(seed+i*5),1.4+hsh(seed+i)*1.2,theme==='arctic'?'#c4d4d4':theme==='volcanic'?'#2a2422':'#7a7064');
      ctx.fillStyle=theme==='arctic'?'#a4b6b3':theme==='volcanic'?'#443b36':theme==='desert'||theme==='beach'?palette[1]:theme==='moon'?'#8a8690':theme==='cave'?'#5e566a':'#8c8174';ctx.beginPath();ctx.moveTo(x,y+h*.7);ctx.lineTo(x+w*.15,y+h*.2);ctx.lineTo(x+w*.6,y);ctx.lineTo(x+w*.93,y+h*.4);ctx.lineTo(x+w,y+h*.8);ctx.lineTo(x+w*.3,y+h);ctx.closePath();ctx.fill();
      ctx.fillStyle='#e4d2ae44';ctx.beginPath();ctx.moveTo(x+w*.15,y+h*.2);ctx.lineTo(x+w*.6,y);ctx.lineTo(x+w*.45,y+h*.6);ctx.lineTo(x,y+h*.7);ctx.closePath();ctx.fill();
      if(detail){ctx.strokeStyle='#3c302b66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+w*.6,y+h*.05);ctx.lineTo(x+w*.45,y+h*.6);ctx.lineTo(x+w*.9,y+h*.75);ctx.stroke();}
      if(theme==='volcanic'){const g=t?.6+.4*Math.sin(t*2+seed):.8;ctx.strokeStyle='rgba(217,137,73,'+g.toFixed(3)+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,y+h*.1);ctx.lineTo(x+w*.4,y+h*.5);ctx.lineTo(cx,y+h*.85);ctx.stroke();}
      else if(theme==='forest'||theme==='swamp'||theme==='meadow')ellipse(cx,y+h*.25,w*.25,h*.13,palette[2]+'aa');
      else if(theme==='beach'&&detail){ellipse(x+w*.3,y+h*.75,w*.08,h*.05,'#f0f4f0');ellipse(x+w*.7,y+h*.82,w*.06,h*.04,'#9ac0b0');}
      else if(theme==='cave'){const g=t?.5+.5*Math.sin(t*2+seed):.6;ellipse(x+w*.55,y+h*.35,w*.06,h*.08,'rgba(180,140,255,'+(.5+.4*g).toFixed(3)+')');}
      else if(theme==='arctic'){ctx.fillStyle='#ffffffee';ctx.beginPath();ctx.moveTo(x+w*.15,y+h*.2);ctx.lineTo(x+w*.6,y);ctx.lineTo(x+w*.93,y+h*.4);ctx.lineTo(x+w*.6,y+h*.22);ctx.closePath();ctx.fill();}
      else if(theme==='moon'&&detail){ctx.strokeStyle='#5a5660';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+w*.35,y+h*.55,w*.08,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x+w*.7,y+h*.5,w*.05,0,Math.PI*2);ctx.stroke();}
    }else if(o.kind==='banner'){
      ctx.fillStyle='#59402c';ctx.fillRect(x+w*.18,y,w*.07,h);ellipse(x+w*.215,y,w*.08,w*.08,'#f2b33d');
      const fx0=x+w*.25,fy0=y+h*.08,fw=w*.7,fh=h*.48,seg=6;
      ctx.fillStyle=palette[1];ctx.beginPath();ctx.moveTo(fx0,fy0);
      for(let i=1;i<=seg;i++){const u=i/seg,wv=t?Math.sin(t*5-u*4+seed)*u*3:Math.sin(u*3)*u*1.5;ctx.lineTo(fx0+fw*u,fy0+wv);}
      const wav=u=>t?Math.sin(t*5-u*4+seed)*u*3:Math.sin(u*3)*u*1.5;
      ctx.lineTo(fx0+fw*.84,fy0+fh*.5+wav(1));                                 /* a swallowtail notch at the free end */
      for(let i=seg;i>=0;i--){const u=i/seg;ctx.lineTo(fx0+fw*u,fy0+fh+wav(u));}
      ctx.closePath();ctx.fill();
      ctx.fillStyle='#efe6d4';ctx.beginPath();ctx.arc(x+w*.58,y+h*.3+(t?Math.sin(t*5-2+seed)*1.5:0),Math.min(w,h)*.12,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#f2b33d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*.12,y+h);ctx.lineTo(x+w*.4,y+h);ctx.stroke();
      if(detail){ctx.fillStyle='#c9b38a';ctx.fillRect(x+w*.15,y+h*.04,w*.13,h*.03);ctx.strokeStyle=palette[1];ctx.lineWidth=1;for(let k=0;k<4;k++)line([fx0+fw*(k+.5)/4,fy0+fh,fx0+fw*(k+.5)/4,fy0+fh+4],palette[1],1);}
    }else if(o.kind==='water'){                                              /* shallow water (slush on ice, a hot spring on the volcano): it slows walkers, never hurts */
      const col=theme==='arctic'?['#8ab8c8','#b8dce6']:theme==='volcanic'?['#5a7a8a','#8ab0b8']:theme==='swamp'?['#4a6a5a','#6a8a72']:theme==='moon'?['#4a5a7a','#7a8aa8']:['#4a8ab0','#7ab8d4'];
      ctx.save();blobPath(ctx,x,y,w,h,seed,3,Math.min(10,Math.min(w,h)*.16));ctx.clip();
      try{ctx.fillStyle=col[0];ctx.fillRect(x,y,w,h);ctx.fillStyle=col[1]+'99';ctx.fillRect(x,y,w,h*.35);
        for(let i=0;i<Math.max(3,w*h/1800);i++){const ph=t?(t*.6+hsh(seed+i))%1:hsh(seed+i),px=x+hsh(seed+i*7)*w,py=y+hsh(seed+i*9)*h;ctx.strokeStyle='rgba(240,250,255,'+(.5*(1-ph)).toFixed(3)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(px,py,3+ph*12,1.5+ph*5,0,0,Math.PI*2);ctx.stroke();}
        for(let i=0;i<w/24;i++){const sx=x+12+i*24+(t?Math.sin(t+i)*3:0);line([sx,y+h*.2+hsh(seed+i)*h*.5,sx+8,y+h*.2+hsh(seed+i)*h*.5],'#ffffff55',1.2);}
        if(detail&&theme!=='arctic'&&theme!=='volcanic')for(let i=0;i<2;i++){const lx=x+w*(.25+.5*hsh(seed+i*13)),ly=y+h*(.3+.4*hsh(seed+i*17));ellipse(lx,ly,7,5,'#5a9a4a');ctx.strokeStyle=col[0];ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+6,ly-2);ctx.stroke();}
        if(theme==='volcanic'&&t)for(let i=0;i<3;i++){const ph=(t*.4+i/3)%1;ellipse(x+w*(.3+i*.2),y+h*.5-ph*h*.6,6+ph*8,4+ph*5,'rgba(255,255,255,'+(.25*(1-ph)).toFixed(3)+')');}
        for(let i=0;i<4;i++){ctx.strokeStyle=hexA(palette[0],.22);ctx.lineWidth=2+i*3;blobPath(ctx,x,y,w,h,seed,3,Math.min(10,Math.min(w,h)*.16));ctx.stroke();}
      }finally{ctx.restore();}
      ctx.strokeStyle='#ffffff55';ctx.lineWidth=1.4;blobPath(ctx,x+1,y+1,w-2,h-2,seed,3,Math.min(10,Math.min(w,h)*.16));ctx.stroke();
    }else if(o.kind==='boost'){                                              /* a speed pad: chevrons that run toward the far side */
      const r=Math.min(10,Math.min(w,h)*.2),g=t?.5+.5*Math.sin(t*6+seed):.7,long=w>=h;
      ctx.fillStyle='#20140f44';ctx.beginPath();ctx.roundRect?ctx.roundRect(x+3,y+5,w-4,h-4,r):ctx.rect(x+3,y+5,w-4,h-4);ctx.fill();
      ctx.fillStyle='#3a3046';ctx.beginPath();ctx.roundRect?ctx.roundRect(x+2,y+2,w-4,h-4,r):ctx.rect(x+2,y+2,w-4,h-4);ctx.fill();
      ctx.strokeStyle='rgba(120,230,255,'+(.4+.4*g).toFixed(3)+')';ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.beginPath();ctx.rect(x+4,y+4,w-8,h-8);ctx.clip();
      try{const n=Math.max(2,Math.round((long?w:h)/26)),off=t?(t*60)%26:0;ctx.lineWidth=Math.max(3,Math.min(w,h)*.12);ctx.lineCap='round';
        for(let i=-1;i<n+1;i++){const u=i*26+off,a=Math.max(0,Math.min(1,1-Math.abs(u/((long?w:h))-.5)*1.6));ctx.strokeStyle='rgba(160,240,255,'+(.45+.55*a*g).toFixed(3)+')';ctx.beginPath();
          if(long){ctx.moveTo(x+u,y+h*.25);ctx.lineTo(x+u+h*.25,cy);ctx.lineTo(x+u,y+h*.75);}else{ctx.moveTo(x+w*.25,y+h-u);ctx.lineTo(cx,y+h-u-w*.25);ctx.lineTo(x+w*.75,y+h-u);}ctx.stroke();}
        ctx.lineCap='butt';}finally{ctx.restore();}
      if(detail)for(const c of [[x+6,y+6],[x+w-6,y+6],[x+6,y+h-6],[x+w-6,y+h-6]])ellipse(c[0],c[1],1.6,1.6,'#b8c0cc');
    }else if(o.kind==='crate'){                                              /* a timber crate she can kick apart; cracks show how worn it is */
      const dmg=o.dmg||0;
      ellipse(cx+4,y+h-2,w*.48,h*.12,'#20140f44');
      ctx.fillStyle='#a8743c';ctx.fillRect(x+2,y+2,w-4,h-4);ctx.fillStyle='#c08a4a';ctx.fillRect(x+2,y+2,w-4,6);
      ctx.strokeStyle='#5a3a1c';ctx.lineWidth=3;ctx.strokeRect(x+3,y+3,w-6,h-6);
      const bands=Math.max(1,Math.round(h/34));ctx.lineWidth=1.2;ctx.strokeStyle='#7a4e26aa';for(let i=1;i<=bands*2;i++){const yy=y+3+(h-6)*i/(bands*2+1);ctx.beginPath();ctx.moveTo(x+5,yy);ctx.lineTo(x+w-5,yy);ctx.stroke();}
      ctx.strokeStyle='#6a4420';ctx.lineWidth=Math.max(3,Math.min(w,h)*.1);ctx.beginPath();ctx.moveTo(x+6,y+6);ctx.lineTo(x+w-6,y+h-6);ctx.stroke();
      if(detail)for(const c of [[x+7,y+7],[x+w-7,y+7],[x+7,y+h-7],[x+w-7,y+h-7]])ellipse(c[0],c[1],2,2,'#3a2a1a');
      if(dmg>0){ctx.strokeStyle='#2a1a0e';ctx.lineWidth=1.6;const n=1+Math.floor(dmg*4);for(let i=0;i<n;i++){const sx=x+w*(.2+.6*hsh(seed+i*3)),sy=y+h*(.2+.6*hsh(seed+i*5));ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+8*(hsh(i)-.5)*2,sy+9);ctx.lineTo(sx+10*(hsh(i+3)-.5)*2,sy+16);ctx.stroke();}}
    }else if(o.kind==='spikes'){                                             /* a plate of spikes that rises and sinks; it hurts only while up */
      const up=spikesUp(o,t),warn=spikesWarn(o,t);
      ctx.fillStyle='#20140f33';ctx.fillRect(x+3,y+4,w-2,h-2);
      ctx.fillStyle='#4a4650';ctx.fillRect(x+1,y+1,w-2,h-2);ctx.strokeStyle='#2a2830';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,h-2);
      const step=14,lift=up?1:warn?.3:0;
      for(let yy=y+10;yy<y+h-4;yy+=step)for(let xx=x+9;xx<x+w-4;xx+=step){
        ellipse(xx,yy+2,3.4,2.2,'#24222a');
        if(lift>0){ctx.fillStyle='#c8ccd6';ctx.beginPath();ctx.moveTo(xx-3.4,yy+2);ctx.lineTo(xx,yy+2-10*lift);ctx.lineTo(xx+3.4,yy+2);ctx.closePath();ctx.fill();ctx.fillStyle='#f4f6fa';ctx.beginPath();ctx.moveTo(xx-1,yy+1);ctx.lineTo(xx,yy+2-9*lift);ctx.lineTo(xx+.6,yy+1);ctx.closePath();ctx.fill();}
      }
      if(warn){ctx.strokeStyle='rgba(255,210,120,.8)';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,w-4,h-4);}
    }else if(o.kind==='custom'){
      const asset=(level.customAssets||[]).find(a=>a.id===o.asset);if(asset)paintCustom(ctx,asset,x,y,w,h);
    }
  }
  /* the arena's rim: a darker band with tufts, stones or ice along the edges (part of the cached ground) */
  function paintRim(ctx,theme,palette,detail){
    ctx.fillStyle='#00000022';ctx.fillRect(0,0,960,6);ctx.fillRect(0,634,960,6);ctx.fillRect(0,0,6,640);ctx.fillRect(954,0,6,640);
    if(!detail)return;
    const col=theme==='arctic'?'#ffffffcc':theme==='volcanic'?'#2a2220':theme==='moon'?'#55525c':theme==='desert'?'#a8804e':theme==='beach'?'#f4ecd8':theme==='cave'?'#2a2430':palette[2];
    for(let i=0;i<64;i++){
      const side=i%4,u=hsh(i*3.7+theme.length),s=3+hsh(i*1.9)*4;
      const px=side===0?u*960:side===1?u*960:side===2?4:956,py=side===0?4:side===1?636:u*640;
      if(theme==='savanna'||theme==='forest'||theme==='swamp'||theme==='meadow'){ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px-3,py+2);ctx.lineTo(px-4,py-s);ctx.moveTo(px,py+2);ctx.lineTo(px,py-s-2);ctx.moveTo(px+3,py+2);ctx.lineTo(px+4,py-s);ctx.stroke();}
      else{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(px,py,s,s*.6,0,0,Math.PI*2);ctx.fill();}
    }
  }
  /* the edges a recipe's waves come in from (anywhere along them): a tinted strip, three chevrons and how many come that way; `glow` lights the
     edges the next wave uses */
  function paintEntrances(ctx,level,glow,t){
    const used={};let any=0;for(const wv of level.waves)for(const gr of wv.enemies)if(gr.kind!=='flyer'){if(gr.spawn==='random')any+=gr.count;else used[gr.spawn]=(used[gr.spawn]||0)+gr.count;}
    if(any)for(const dir of ['north','east','south','west'])used[dir]=used[dir]||0;   /* a random entrance may use any edge: each edge shows it as "?" */
    for(const dir of Object.keys(used)){
      const lit=glow&&glow[dir],a=lit?.6+.4*Math.sin(t*8):0,len=dir==='north'||dir==='south'?960:640;
      ctx.save();
      try{
        const ang={north:0,south:Math.PI,west:-Math.PI/2,east:Math.PI/2}[dir];
        if(dir==='south')ctx.translate(960,640);else if(dir==='west')ctx.translate(0,640);else if(dir==='east')ctx.translate(960,0);ctx.rotate(ang);
        ctx.fillStyle=lit?'rgba(242,179,61,'+(.18+.22*a).toFixed(3)+')':'rgba(242,179,61,.12)';ctx.fillRect(len*.05,0,len*.9,8);
        ctx.strokeStyle=lit?'rgba(255,230,150,'+(.6+.4*a).toFixed(3)+')':'#f2b33daa';ctx.lineWidth=3;
        for(const u of [.25,.5,.75]){const cx=len*u;ctx.beginPath();ctx.moveTo(cx-9,6);ctx.lineTo(cx,15+(lit?a*3:0));ctx.lineTo(cx+9,6);ctx.stroke();}
        ctx.translate(len*.5+34,14);ctx.rotate(-ang);ctx.fillStyle='#241b15cc';ctx.fillRect(-15,-8,30,16);ctx.fillStyle='#efe6d4';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(used[dir]?'×'+used[dir]+(any?'+?':''):'?',0,4);
      }finally{ctx.restore();}
    }
  }
  /* small life in a playtest, by biome and time of day: butterflies, fireflies, dust, bubbles, embers or glints. Time only, no random numbers. */
  function paintLife(ctx,theme,time,t){
    const night=time==='night',n=10;
    for(let i=0;i<n;i++){
      const a=hsh(i*5.3),b=hsh(i*2.1+9),sp=.5+hsh(i*7.7);
      if(theme==='volcanic'){const ph=(t*.25*sp+a)%1,x=b*960+Math.sin(t+i)*14,y=640-ph*660;ctx.fillStyle='rgba(255,'+Math.round(140+80*(1-ph))+',60,'+(1-ph).toFixed(3)+')';ctx.beginPath();ctx.arc(x,y,1.6+sp,0,Math.PI*2);ctx.fill();}
      else if(night&&theme!=='moon'){const x=(b*960+Math.sin(t*.5*sp+i)*40),y=(a*640+Math.cos(t*.4*sp+i*2)*30),on=.5+.5*Math.sin(t*3*sp+i*4);ctx.fillStyle='rgba(220,255,140,'+(.15*on).toFixed(3)+')';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(240,255,170,'+(.5+.5*on).toFixed(3)+')';ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();}
      else if(theme==='cave'){const ph=(t*.2*sp+a)%1,x=b*960+Math.sin(t*.7+i)*20,y=a*640-ph*30,on=.5+.5*Math.sin(t*2*sp+i);ctx.fillStyle='rgba(160,240,220,'+(.12*on).toFixed(3)+')';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(200,255,240,'+(.4+.5*on).toFixed(3)+')';ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill();}
      else if(theme==='beach'){if(i<3){const cx2=((b*960+Math.sin(t*.5+i)*80)%960),cy2=a*600+20,leg=Math.sin(t*12+i)*2;ctx.fillStyle='#d8603a';ctx.beginPath();ctx.ellipse(cx2,cy2,5,3.4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b8482a';ctx.lineWidth=1;for(const sd of [-1,1])for(const k of [0,1,2]){ctx.beginPath();ctx.moveTo(cx2+sd*4,cy2+k-1);ctx.lineTo(cx2+sd*8,cy2+k*2+leg*sd);ctx.stroke();}}
        else{const x=((b*960+t*40*sp)%1040)-40,y=a*640+Math.sin(t+i)*8;ctx.fillStyle='rgba(20,30,40,.12)';ctx.beginPath();ctx.ellipse(x,y,9,3,0,0,Math.PI*2);ctx.fill();}}
      else if(theme==='savanna'||theme==='forest'||theme==='meadow'){const x=((b*960+t*22*sp)%1000)-20,y=a*640+Math.sin(t*1.6*sp+i)*24,f=Math.abs(Math.sin(t*14+i));ctx.fillStyle=['#f2d36a','#f0a0c0','#ffffff','#a0c8f0'][i%4];ctx.beginPath();ctx.ellipse(x-2,y,3,1+2.4*f,-.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+2,y,3,1+2.4*f,.5,0,Math.PI*2);ctx.fill();}
      else if(theme==='desert'||theme==='moon'){const x=((b*960+t*30*sp)%1000)-20,y=a*640+Math.sin(t*.8+i)*10;ctx.fillStyle=theme==='moon'?'rgba(220,220,240,.35)':'rgba(255,240,200,.45)';ctx.beginPath();ctx.arc(x,y,1.2+sp,0,Math.PI*2);ctx.fill();}
      else if(theme==='swamp'){const ph=(t*.5*sp+a)%1,x=b*960,y=a*640;ctx.strokeStyle='rgba(210,240,180,'+(.6*(1-ph)).toFixed(3)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,2+ph*6,0,Math.PI*2);ctx.stroke();
        if(i<3){const dx=(b*960+t*60)%1000-20,dy=a*640+Math.sin(t*3+i)*20;ctx.strokeStyle='#5ad0d0';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(dx-6,dy);ctx.lineTo(dx+6,dy);ctx.stroke();ctx.fillStyle='#bff';ctx.beginPath();ctx.ellipse(dx,dy-2,4,1.6,0,0,Math.PI*2);ctx.fill();}}
      else if(theme==='arctic'){const on=Math.max(0,Math.sin(t*2*sp+i*3));ctx.fillStyle='rgba(255,255,255,'+on.toFixed(3)+')';const x=b*960,y=a*640,s=on*3;ctx.fillRect(x-s,y-.5,s*2,1);ctx.fillRect(x-.5,y-s,1,s*2);}
    }
  }
  /* a creature's picture for the workshop (the roster and the wave rows): the game's drawing when it is loaded, else a coloured disc */
  function portrait(ctx,kind,cx,cy,size,t){
    const f=FOES[kind];if(!f)return;const type=LOOK[kind],def=typeof ETYPES!=='undefined'?ETYPES[type]:null;
    if(typeof drawEnemy==='function'&&def){ctx.save();try{ctx.translate(cx,cy);const k=size/(def.r*2.7);ctx.scale(k,k);drawEnemy(ctx,{portrait:true,def,type,x:0,y:0,r:def.r,ang:0,flash:0,state:'idle',anim:(t||0)*6+1,hp:1,maxHp:1,big:false,kx:0,ky:0,stunT:0,burnT:0,slowT:0,slowMul:1});}catch(e){}finally{ctx.restore();}return;}
    ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(cx,cy,size*.35,0,Math.PI*2);ctx.fill();
  }
  const bgCache={key:null,canvas:null};
  function paintArena(ctx,level,options){
    options=options||{};
    const appearance=level.appearance||{},detail=appearance.detail===undefined?1:appearance.detail;
    const theme=level.arena.theme,time=Number(options.time)||0;
    const random=GRChallengeData.seeded((level.seed^0x51ac3f09)>>>0);
    const colors=getPalette(level),palette=[colors.ground,colors.accent,colors.foliage];
    const ellipse=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    ctx.save();
    try{
    const scatter=(16+detail*12)*4+(30+detail*95)*3,key=options.cache?[theme,palette.join(),detail,appearance.time,level.seed].join('|'):null;
    if(key&&bgCache.key===key&&bgCache.canvas){ctx.drawImage(bgCache.canvas,0,0);for(let n=0;n<scatter;n++)random();}
    else{
    const real=ctx;let off=null;
    if(key){try{off=document.createElement('canvas');off.width=960;off.height=640;ctx=off.getContext('2d');if(!ctx)throw 0;}catch(e){off=null;ctx=real;}}
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
      if(theme==='savanna'||theme==='forest'||theme==='swamp'||theme==='meadow'){
        ctx.strokeStyle=n%3?palette[2]+'99':palette[1]+'88';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-3,y+2);ctx.lineTo(x-5,y-s);ctx.moveTo(x,y+2);ctx.lineTo(x,y-s-2);ctx.moveTo(x+2,y+2);ctx.lineTo(x+5,y-s);ctx.stroke();
        if(theme==='forest'&&n%3===0){ctx.fillStyle=palette[1]+'55';ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-4);ctx.lineTo(x+5,y);ctx.lineTo(x,y+3);ctx.closePath();ctx.fill();}
        if(theme==='swamp'&&n%4===0){ctx.strokeStyle=palette[1]+'55';ctx.beginPath();ctx.ellipse(x,y,15,4,0,0,Math.PI*2);ctx.stroke();}
        if(detail&&theme==='savanna'&&n%11===0){for(let p=0;p<4;p++){const a=p*Math.PI/2;ellipse(x+Math.cos(a)*3,y+Math.sin(a)*3,2,2,'#e7c377');}ellipse(x,y,1.5,1.5,'#87572b');}
        if(detail&&theme==='forest'&&n%7===0){ctx.strokeStyle='#7c553b88';ctx.beginPath();ctx.moveTo(x-5,y+3);ctx.lineTo(x+5,y-3);ctx.moveTo(x,y);ctx.lineTo(x+1,y+5);ctx.stroke();}
        if(detail&&theme==='swamp'&&n%9===0){ellipse(x,y,8,3,palette[2]+'cc');ctx.strokeStyle=palette[0];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+7,y-2);ctx.stroke();}
        if(theme==='meadow'&&n%(detail?4:9)===0){const fc=['#ffffff','#f2d04a','#e88ab0','#a0b8f0'][n%4];for(let q=0;q<5;q++){const a=q/5*Math.PI*2;ellipse(x+Math.cos(a)*2.4,y-s+Math.sin(a)*2.4,1.8,1.8,fc);}ellipse(x,y-s,1.3,1.3,n%4===1?'#c08a2a':'#f2d04a');}
      }else if(theme==='arctic'){
        ellipse(x,y,s*2,s*.5,'#ffffff55');
        if(n%5===0){ctx.strokeStyle='#8daeb555';ctx.beginPath();ctx.moveTo(x-8,y-3);ctx.lineTo(x,y);ctx.lineTo(x+9,y-7);ctx.moveTo(x,y);ctx.lineTo(x+2,y+8);ctx.stroke();}
        if(detail&&n%13===0)for(let i=0;i<3;i++){ellipse(x+i*8,y+i*4,2.5,1.3,'#738f9a44');ellipse(x+i*8+3,y+i*4-4,2.5,1.3,'#738f9a44');}
      }else if(theme==='beach'){                                               /* wet-sand ripples, shells and bits of weed */
        ctx.strokeStyle=palette[1]+'aa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10,y);ctx.quadraticCurveTo(x,y-3,x+12,y);ctx.stroke();
        if(n%6===0){ellipse(x,y,2.4+s*.4,1.8+s*.3,n%12?'#fff6e8':'#f2c0b0');ctx.strokeStyle='#b8987a';ctx.beginPath();ctx.arc(x,y+1,2,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
        if(detail&&n%13===0){ctx.strokeStyle='#4a7a5a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-5,y);ctx.quadraticCurveTo(x,y-6,x+6,y-1);ctx.stroke();}
      }else if(theme==='cave'){                                                /* pebbles, puddles and glints of crystal in the floor */
        ellipse(x,y,s,s*.6,n%2?'#3a3442aa':palette[1]+'44');
        if(n%9===0){ctx.strokeStyle='#2a2430';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y-2);ctx.lineTo(x,y);ctx.lineTo(x+7,y-4);ctx.stroke();}
        if(detail&&n%11===0)ellipse(x,y,1.6,1.6,n%22?'#a0e8d8':'#c8a8ff');
        if(detail&&n%17===0)ellipse(x,y,12,4,'#2e2a3a66');
      }else if(theme==='desert'){
        ctx.strokeStyle=palette[1]+'77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,y);ctx.quadraticCurveTo(x,y-5,x+14,y);ctx.stroke();
        if(detail&&n%9===0){ellipse(x+5,y+4,3,1.7,'#7d5a3a55');ellipse(x+4,y+3,2,1,palette[1]+'99');}
      }else if(theme==='volcanic'){
        ctx.strokeStyle=n%5===0?palette[1]+'bb':'#30272277';ctx.lineWidth=n%5===0?2:1;ctx.beginPath();ctx.moveTo(x-6,y-s);ctx.lineTo(x,y);ctx.lineTo(x-2,y+s);ctx.lineTo(x+7,y+s+4);ctx.stroke();
        if(detail&&n%8===0){ellipse(x,y,4,2,'#302b29');ctx.strokeStyle='#b8a38a66';ctx.beginPath();ctx.moveTo(x-2,y-1);ctx.lineTo(x+1,y-2);ctx.stroke();}
      }else{ellipse(x,y,s,s*.6,n%2?palette[1]+'55':'#40394444');if(detail&&n%15===0){ctx.strokeStyle='#e8dbca55';ctx.beginPath();ctx.arc(x,y,8,.9,3.6);ctx.stroke();}}
    }
    if(appearance.time==='sunset'){ctx.fillStyle='#b45f242b';ctx.fillRect(0,0,960,640);}
    else if(appearance.time==='dawn'){const dg=ctx.createLinearGradient(0,0,0,640);dg.addColorStop(0,'#f0a0a038');dg.addColorStop(1,'#a0b8f022');ctx.fillStyle=dg;ctx.fillRect(0,0,960,640);}
    else if(appearance.time==='night'){ctx.fillStyle='#211b3d77';ctx.fillRect(0,0,960,640);}
    paintRim(ctx,theme,palette,detail);
    if(off){bgCache.key=key;bgCache.canvas=off;ctx=real;ctx.drawImage(off,0,0);}
    }
    paintEntrances(ctx,level,options.entrances,time);
    const env={theme,palette,detail,time,level};
    for(const o of level.objects)paintObject(ctx,level,o,env);
    if(options.live&&detail)paintLife(ctx,theme,appearance.time,time);
    if(appearance.weather==='drizzle'){
      ctx.strokeStyle=appearance.time==='night'?'#e4dbc244':'#f5f0de66';ctx.lineWidth=1;
      for(let n=0;n<40+detail*25;n++){const x=(random()*1000+time*35)%1000-20,y=(random()*700+time*210)%700-30;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+12);ctx.stroke();}
    }else if(appearance.weather==='snow'){
      for(let n=0;n<35+detail*25;n++){const x=(random()*1000+Math.sin(time*.7+n)*10)%1000,y=(random()*690+time*25)%690-25;ellipse(x,y,1+n%2,1+n%2,'#fff4db99');}
    }else if(appearance.weather==='storm'){                                   /* heavy slanted rain, and now and then the whole arena flashes white */
      ctx.strokeStyle=appearance.time==='night'?'#d8d8e855':'#e8eef866';ctx.lineWidth=1.3;
      for(let n=0;n<70+detail*35;n++){const x=(random()*1100+time*120)%1100-70,y=(random()*720+time*420)%720-40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-10,y+20);ctx.stroke();}
      ctx.fillStyle='#10142a22';ctx.fillRect(0,0,960,640);
      const beat=Math.floor(time/5.3),ph=time-beat*5.3;if(time&&hsh(beat+.5)>.45&&ph<.35){ctx.fillStyle='rgba(240,245,255,'+((ph<.08||ph>.16&&ph<.24)?.35:.08).toFixed(3)+')';ctx.fillRect(0,0,960,640);}
    }else if(appearance.weather==='fog'){                                     /* soft banks of mist drifting across */
      for(let n=0;n<10+detail*4;n++){const x=(random()*1300+time*(8+n%3*4))%1300-170,y=random()*640,rx=120+random()*90;ellipse(x,y,rx,rx*.35,appearance.time==='night'?'#8a90a01c':'#f4f2ea26');}
      ctx.fillStyle=appearance.time==='night'?'#7a80901a':'#e8e6de22';ctx.fillRect(0,0,960,640);
    }else if(appearance.weather==='wind'){                                    /* gusts: streaks and tumbling leaves or sand */
      ctx.strokeStyle='#fff8e855';ctx.lineWidth=1;
      for(let n=0;n<18+detail*8;n++){const x=(random()*1200+time*260)%1200-120,y=random()*640+Math.sin(time*2+n)*6;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+20,y-3,x+46,y);ctx.stroke();}
      const leaf=theme==='arctic'?'#ffffffcc':theme==='desert'||theme==='beach'?'#e8d4a0cc':theme==='volcanic'?'#5a4a40cc':theme==='moon'||theme==='cave'?'#a8a0b0aa':palette[2]+'cc';
      for(let n=0;n<14+detail*6;n++){const x=(random()*1100+time*190)%1100-70,y=(random()*640+Math.sin(time*3+n)*20);ctx.save();ctx.translate(x,y);ctx.rotate(time*6+n);ctx.fillStyle=leaf;ctx.beginPath();ctx.ellipse(0,0,3.4,1.6,0,0,Math.PI*2);ctx.fill();ctx.restore();}
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
    const M=level.modifiers,base=KITS[level.loadout],rng=GRChallengeData.seeded(level.seed);
    /* the kit with the recipe's own multipliers (an older recipe has none, so every one is 1) */
    const kit={hp:Math.round(base.hp*(M.playerHp||1)),speed:base.speed,damage:Math.round(base.damage*(M.playerDamage||1)),range:base.range,cooldown:base.cooldown};
    const hazDmg=M.hazardDamage===undefined?12:M.hazardDamage,healPct=(M.healAmount===undefined?25:M.healAmount)/100,foeDmg=M.enemyDamage||1,regen=M.regen||0;
    const walls=level.objects.filter(o=>GRChallengeData.isSolid(level,o)).map(o=>o.kind==='crate'?Object.assign({hp:60,max:60},o):o);
    const crates=walls.filter(o=>o.kind==='crate'),pools=level.objects.filter(o=>o.kind==='water'),pads=level.objects.filter(o=>o.kind==='boost'),spikes=level.objects.filter(o=>o.kind==='spikes');
    const home=GRChallengeData.startOf(level);
    const pickups=level.objects.filter(o=>o.kind==='coin'||o.kind==='heal').map(o=>Object.assign({taken:false},o));
    const coins=pickups.filter(o=>o.kind==='coin');
    const p={x:home.x,y:home.y,r:15,hp:kit.hp,inv:0,attack:0,angle:-Math.PI/2,boost:0};
    let enemies=[],shots=[],time=0,kills=0,collected=0,heals=0,wave=0,wait=level.waves[0].delay,fx=[],waveBannerUntil=0,extra=0,hitSound=0;
    let queue=[],lastSpawn=0,broken=0;                                         /* creatures still to come in this wave (a spaced-out group), and when the last wave began */
    const totalEnemies=level.waves.reduce((n,w)=>n+w.enemies.reduce((sum,g)=>sum+g.count,0),0);
    let paused=false,ended=false,result=null,raf=0,last=0,carry=0,attackFlash=0,frameLive=true;
    /* looks only: dust, sparks, puffs and the shake. They use Math.random, never the recipe's seeded numbers, and are not part of a snapshot. */
    let parts=[],shake=0,hurtFlash=0,dustT=0,hitAt=null;
    const NAMES={chaser:'hyena',runner:'cheetah',brute:'rhino',spitter:'baboon',flyer:'vulture',charger:'warthog',splitter:'termite',badger:'honey badger',grub:'grub'};
    function burst(x,y,n,color,speed,size,kind){
      for(let i=0;i<n;i++){if(parts.length>=260)parts.shift();const a=Math.random()*Math.PI*2,v=speed*(.35+Math.random()*.65);
        parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='plus'?40:0),life:kind==='ring'?.35:.45+Math.random()*.35,max:0,size:size*(.6+Math.random()*.6),color,kind:kind||'dot'});parts[parts.length-1].max=parts[parts.length-1].life;}
    }
    function ring(x,y,color,size){if(parts.length>=260)parts.shift();parts.push({x,y,vx:0,vy:0,life:.35,max:.35,size,color,kind:'ring'});}
    function waveWords(i){const w=level.waves[i];if(!w)return '';return w.enemies.map(g=>g.count+(g.elite?' elite ':' ')+NAMES[g.kind]+(g.count>1?'s':'')+(g.kind==='flyer'?' over the walls':g.spawn==='random'?' from any edge':' from the '+g.spawn)).join(' · ');}
    /* the next wave: one that waits for a clear counts down once the arena is empty; a timed one counts from when the last wave began */
    function nextTimed(){const n=level.waves[wave];return !!n&&wave>0&&n.after==='timer';}
    function nextIn(){const n=level.waves[wave];if(!n)return 0;return nextTimed()?n.delay-(time-lastSpawn):wait;}
    function waiting(){return wave<level.waves.length&&(nextTimed()||(!enemies.length&&!queue.length));}
    function glowDirs(){
      const i=waiting()?wave:time<waveBannerUntil?wave-1:-1,out={};
      if(i>=0&&level.waves[i])for(const g of level.waves[i].enemies){if(g.spawn==='random'){out.north=out.east=out.south=out.west=1;}else out[g.spawn]=1;}return out;
    }
    let target=null,keys=new Set(),pointer=null,pad={x:0,y:0,prev:[]};
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
    const OBJ_WORDS={clear:'Clear all waves',survive:'Survive '+level.objective.target+'s',collect:'Collect '+level.objective.target,exit:'Reach the exit',hunt:'Defeat '+level.objective.target};
    dlg.append(header,hint,hud,meters,canvas,actions,status);document.body.appendChild(dlg);
    function feedback(x,y,label,color){if(fx.length>=32)fx.shift();fx.push({x,y,label,color,life:.6});}
    function canStand(x,y,r){return x>=r&&x<=960-r&&y>=r&&y<=640-r&&!walls.some(o=>overlaps(x,y,r,o));}
    const inWater=b=>!b.fly&&pools.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h);   /* water slows anything that walks (her too) to half speed */
    function move(body,dx,dy){
      const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
      for(let i=0;i<n;i++){
        const x=clamp(body.x+dx/n,body.r,960-body.r),y=clamp(body.y+dy/n,body.r,640-body.r);
        if(canStand(x,body.y,body.r))body.x=x;
        if(canStand(body.x,y,body.r))body.y=y;
      }
    }
    /* finding the way round walls: a 24-pixel grid of the places a body of each size can stand, and, from the giraffe's square outwards, how many steps
       each square is from her. A walker that cannot see her steps to the neighbouring square nearer to her. Worked out again when she changes square. */
    const CELL=24,GW=40,GH=27,passBy={},flowBy={};
    function passFor(r){
      const k=Math.max(6,r-3);if(passBy[k])return passBy[k];
      const a=new Uint8Array(GW*GH);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)a[j*GW+i]=canStand(i*CELL+12,Math.min(j*CELL+12,640-k),k)?1:0;
      return passBy[k]=a;
    }
    function flowFor(r){
      const k=Math.max(6,r-3),pc=clamp(Math.floor(p.x/CELL),0,GW-1)+clamp(Math.floor(p.y/CELL),0,GH-1)*GW,f=flowBy[k];
      if(f&&f.from===pc)return f.dist;
      const pass=passFor(r),dist=new Int16Array(GW*GH).fill(-1),q=[pc];dist[pc]=0;
      for(let h=0;h<q.length;h++){
        const c=q[h],ci=c%GW,cj=(c-ci)/GW;
        for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){
          if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;
          const n=nj*GW+ni;if(dist[n]>=0||!pass[n])continue;
          if(di&&dj&&(!pass[cj*GW+ni]||!pass[nj*GW+ci]))continue;                 /* no cutting a wall's corner */
          dist[n]=dist[c]+1;q.push(n);
        }
      }
      flowBy[k]={from:pc,dist};return dist;
    }
    /* where a walker should head for: straight at her when nothing is in the way, else the next square on the way round */
    function heading(e){
      if(!blocks(e,p,walls))return {x:p.x,y:p.y};
      const dist=flowFor(e.r),ci=clamp(Math.floor(e.x/CELL),0,GW-1),cj=clamp(Math.floor(e.y/CELL),0,GH-1),here=dist[cj*GW+ci];
      let best=-1,bd=here>=0?here:1e9;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){
        const ni=ci+di,nj=cj+dj;if((!di&&!dj)||ni<0||nj<0||ni>=GW||nj>=GH)continue;
        const d=dist[nj*GW+ni];if(d>=0&&d<bd){bd=d;best=nj*GW+ni;}
      }
      return best<0?{x:p.x,y:p.y}:{x:(best%GW)*CELL+12,y:Math.floor(best/GW)*CELL+12};
    }
    /* creatures do not stand inside each other: each overlapping pair is pushed apart, half each, and never into a wall */
    function separate(){
      for(let i=0;i<enemies.length;i++){const a=enemies[i];
        for(let j=i+1;j<enemies.length;j++){const b=enemies[j];
          let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);const min=a.r+b.r;
          if(d>=min)continue;
          if(d<.01){dx=Math.cos(i*2.4+j);dy=Math.sin(i*2.4+j);d=1;}
          const push=Math.min(4,(min-d)/2),ux=dx/d*push,uy=dy/d*push;
          if(a.fly){a.x=clamp(a.x-ux,a.r,960-a.r);a.y=clamp(a.y-uy,a.r,640-a.r);}else move(a,-ux,-uy);
          if(b.fly){b.x=clamp(b.x+ux,b.r,960-b.r);b.y=clamp(b.y+uy,b.r,640-b.r);}else move(b,ux,uy);
        }
      }
    }
    /* an elite is a quarter bigger, has 2.2 times the health and hits 1.3 times as hard */
    function makeEnemy(kind,x,y,elite){
      const f=FOES[kind],hp=f.hp*level.modifiers.enemyHp*(elite?2.2:1);
      return {kind,x,y,elite:!!elite,r:Math.round(f.r*(elite?1.25:1)),hp,max:hp,fire:1+rng(),side:rng()<.5?-1:1,fly:!!f.fly,flash:0,ang:Math.atan2(p.y-y,p.x-x),seed:rng()*9,quiet:0,dash:0,windup:0,cool:1+rng()*2,dir:0};
    }
    /* a wave: every group's creatures queue up, all at once or one every `stagger` seconds, and come in from their edge (or a random open one) */
    function spawnWave(){
      const recipe=level.waves[wave]; wave++;waveBannerUntil=time+1.6;lastSpawn=time;
      for(const group of recipe.enemies)for(let n=0;n<group.count;n++)queue.push({kind:group.kind,spawn:group.spawn,elite:!!group.elite,at:time+n*(group.stagger||0)});
      queue.sort((a,b)=>a.at-b.at);
      sfx('wave');releaseQueue();
    }
    function releaseQueue(){
      while(queue.length&&queue[0].at<=time+1e-9){
        const q=queue.shift(),f=FOES[q.kind],r=Math.round(f.r*(q.elite?1.25:1)),sides=['north','east','south','west'];
        let x=480,y=320,found=false;const n=q.spawn==='random'?100+46*4:146;
        for(let tries=0;tries<n;tries++){
          const side=q.spawn!=='random'?q.spawn:tries<100?sides[Math.floor(rng()*4)]:sides[(tries-100)%4];
          const z=tries<100?.05+rng()*.9:.05+Math.floor((tries-100)/(q.spawn==='random'?4:1))*.02;   /* random spots first, then every spot the recipe check looks at */
          x=side==='west'?r+4:side==='east'?956-r:960*z;
          y=side==='north'?r+4:side==='south'?636-r:640*z;
          if(f.fly||canStand(x,y,r)){found=true;break;}
        }
        if(!found){ finish(false,'A spawn edge is blocked. Edit the walls and try again.');return; }
        enemies.push(makeEnemy(q.kind,x,y,q.elite));burst(x,y,5,q.elite?'#f2c94c':'#d8c8a0',70,4,'dust');
      }
    }
    /* a crate she kicks apart: it leaves the walls, and the ways round them are worked out again */
    function breakCrate(c){
      const i=walls.indexOf(c);if(i<0)return;walls.splice(i,1);c.gone=true;broken++;
      for(const k in passBy)delete passBy[k];for(const k in flowBy)delete flowBy[k];
      burst(c.x+c.w/2,c.y+c.h/2,16,'#a8743c',160,4,'dot');burst(c.x+c.w/2,c.y+c.h/2,6,'#e8dcc0',60,8,'dust');sfx('kill');shake=Math.min(9,shake+3);
    }
    function finish(won,reason){
      if(ended)return;
      ended=true;target=null;keys.clear();pauseBtn.disabled=true;
      result={won,time:Math.round(time*100)/100,kills,coins:collected,heals,health:p.hp,waves:wave,crates:broken,fingerprint:GRChallengeData.fingerprint(level)};
      result.medal=won?(p.hp/kit.hp>=.75?'gold':p.hp/kit.hp>=.4?'silver':'bronze'):null;
      sfx(won?'level':'over');
      status.textContent=(won?'Challenge cleared! ':'Try again! ')+(reason||'')+' '+result.time.toFixed(2)+'s · '+kills+' / '+(totalEnemies+extra)+' defeated · '+collected+' collected · '+heals+' heals used · '+Math.ceil(p.hp)+' health left. No campaign rewards.';
      if(options.onFinish)options.onFinish(Object.assign({},result));
    }
    function hurt(amount){ amount=Math.round(amount);if(amount<=0||p.inv>0||ended)return;p.hp=Math.max(0,p.hp-amount);p.inv=.55;feedback(p.x,p.y,'−'+amount,'#cd8b65');sfx('hurt');shake=Math.min(9,shake+4+amount*.15);hurtFlash=.45;burst(p.x,p.y,6,'#e0705a',110,3,'dot');if(!p.hp)finish(false,'Your giraffe ran out of health.'); }
    function step(dt){
      if(paused||ended)return;
      time+=dt;p.inv=Math.max(0,p.inv-dt);p.attack-=dt;attackFlash=Math.max(0,attackFlash-dt);for(const f of fx)f.life-=dt;fx=fx.filter(f=>f.life>0);
      let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
      let dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      if(!dx&&!dy&&(pad.x||pad.y)){dx=pad.x;dy=pad.y;}
      if(!dx&&!dy&&target){dx=target.x-p.x;dy=target.y-p.y;if(Math.hypot(dx,dy)<4){dx=0;dy=0;}}
      const len=Math.hypot(dx,dy);p.moving=!!len;
      shake=Math.max(0,shake-dt*30);hurtFlash=Math.max(0,hurtFlash-dt*1.4);
      for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=1-3*dt;q.vy*=1-3*dt;if(q.kind==='plus')q.vy-=30*dt;q.life-=dt;}
      if(parts.length&&parts[0].life<=0)parts=parts.filter(q=>q.life>0);
      if(len){dustT-=dt;if(dustT<=0){dustT=.11;burst(p.x-Math.cos(p.angle)*12,p.y-Math.sin(p.angle)*12,1,level.arena.theme==='arctic'?'#ffffff':'#d8c8a0',20,4,'dust');}}
      p.boost=Math.max(0,p.boost-dt);
      if(regen&&p.hp>0&&p.hp<kit.hp)p.hp=Math.min(kit.hp,p.hp+regen*dt);
      if(len){const ps=kit.speed*(level.modifiers.playerSpeed||1)*(p.boost>0?1.6:1)*(inWater(p)?.5:1);p.angle=Math.atan2(dy,dx);move(p,dx/len*ps*dt,dy/len*ps*dt);}
      for(const o of pads)if(overlaps(p.x,p.y,p.r,o)){if(p.boost<.2){sfx('whoosh');burst(p.x,p.y,6,'#a0f0ff',90,3,'spark');}p.boost=1.5;}
      if(p.boost>0&&len&&Math.random()<.5)burst(p.x-Math.cos(p.angle)*14,p.y-Math.sin(p.angle)*14,1,'#a0f0ff',30,3,'spark');
      if(queue.length)releaseQueue();
      if(!ended&&wave<level.waves.length){if(nextTimed()){if(time-lastSpawn>=level.waves[wave].delay)spawnWave();}else if(!enemies.length&&!queue.length){wait-=dt;if(wait<=0)spawnWave();}}
      if(ended)return;
      for(const e of enemies){
        const f=FOES[e.kind],vx=p.x-e.x,vy=p.y-e.y,d=Math.hypot(vx,vy)||1,sp=f.speed*level.modifiers.speed*(inWater(e)?.5:1);
        const ox=e.x,oy=e.y;e.flash=Math.max(0,e.flash-dt);e.quiet+=dt;e.cool-=dt;
        if(f.regen&&e.quiet>2&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+f.regen*dt);
        if(e.dash>0){                                                          /* a charger mid-dash keeps its line until it runs out or hits a wall */
          e.dash-=dt;move(e,Math.cos(e.dir)*sp*7*dt,Math.sin(e.dir)*sp*7*dt);if(Math.random()<.6)burst(e.x-Math.cos(e.dir)*e.r,e.y-Math.sin(e.dir)*e.r,1,'#c8b490',40,5,'dust');
          if(Math.hypot(e.x-ox,e.y-oy)<.5)e.dash=0;
        }else if(e.windup>0){
          e.windup-=dt;if(e.windup<=0){e.dash=.45;e.cool=2.6;sfx('whoosh');}
        }else if(f.charge&&e.cool<=0&&d<340&&!blocks(e,p,walls)){
          e.windup=.55;e.dir=Math.atan2(vy,vx);e.ang=e.dir;
        }else if(e.fly){                                                       /* over everything, straight at her */
          e.x=clamp(e.x+vx/d*sp*dt,e.r,960-e.r);e.y=clamp(e.y+vy/d*sp*dt,e.r,640-e.r);e.ang=Math.atan2(vy,vx);
        }else if(e.kind!=='spitter'||d>220||blocks(e,p,walls)){
          const h=heading(e),hx=h.x-e.x,hy=h.y-e.y,hd=Math.hypot(hx,hy)||1;
          move(e,hx/hd*sp*dt,hy/hd*sp*dt);
          if(Math.hypot(e.x-ox,e.y-oy)<.1)move(e,-hy/hd*sp*dt*e.side,hx/hd*sp*dt*e.side);
          if(Math.hypot(e.x-ox,e.y-oy)>.05)e.ang=Math.atan2(e.y-oy,e.x-ox);
        }else e.ang=Math.atan2(vy,vx);
        if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r)hurt(f.damage*foeDmg*(e.elite?1.3:1));
        e.fire-=dt;
        if(e.kind==='spitter'&&e.fire<=0&&d<450&&!blocks(e,p,walls)){
          e.fire=2;shots.push({x:e.x,y:e.y,dx:vx/d*150,dy:vy/d*150,life:4});sfx('spit');
        }
      }
      separate();
      if(p.attack<=0){
        const victim=enemies.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<kit.range+e.r&&(e.fly||!blocks(p,e,walls))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
        /* with no creature in reach she kicks the nearest crate */
        const box=victim?null:crates.filter(c=>!c.gone&&Math.hypot(p.x-clamp(p.x,c.x,c.x+c.w),p.y-clamp(p.y,c.y,c.y+c.h))<kit.range*.6).sort((a,b)=>Math.hypot(p.x-a.x-a.w/2,p.y-a.y-a.h/2)-Math.hypot(p.x-b.x-b.w/2,p.y-b.y-b.h/2))[0];
        if(box){const bx=clamp(p.x,box.x,box.x+box.w),by=clamp(p.y,box.y,box.y+box.h);box.hp-=kit.damage;p.angle=Math.atan2(by-p.y,bx-p.x);p.attack=kit.cooldown/(level.modifiers.attackRate||1);attackFlash=.13;sfx('kick');burst(bx,by,5,'#c08a4a',120,2.4,'spark');if(box.hp<=0)breakCrate(box);}
        if(victim){victim.hp-=kit.damage;victim.flash=.12;victim.quiet=0;p.angle=Math.atan2(victim.y-p.y,victim.x-p.x);p.attack=kit.cooldown/(level.modifiers.attackRate||1);attackFlash=.13;feedback(victim.x,victim.y,'−'+kit.damage,'#e1bd7d');if(time-hitSound>.08){hitSound=time;sfx('kick');}burst(victim.x,victim.y,5,'#fff2ab',150,2.2,'spark');ring(victim.x,victim.y,'#fff2ab',victim.r+6);hitAt={x:victim.x,y:victim.y};}
      }
      const before=enemies.length,born=[];
      for(const e of enemies)if(e.hp<=0){
        burst(e.x,e.y,12,FOES[e.kind].col,170,3.4,'dot');burst(e.x,e.y,5,'#e8dcc0',60,7,'dust');
        const sp=FOES[e.kind].split;
        if(sp)for(let n=0;n<sp;n++){const a=n/sp*Math.PI*2+e.seed,g=makeEnemy('grub',e.x,e.y);move(g,Math.cos(a)*14,Math.sin(a)*14);born.push(g);}
      }
      enemies=enemies.filter(e=>e.hp>0);kills+=before-enemies.length;
      if(before>enemies.length)sfx('kill');
      if(born.length){enemies=enemies.concat(born);extra+=born.length;burst(born[0].x,born[0].y,8,'#e6ce9c',120,3,'dot');}
      if(before&&!enemies.length&&wave<level.waves.length)wait=level.waves[wave].delay;
      for(const s of shots){
        const old={x:s.x,y:s.y};s.x+=s.dx*dt;s.y+=s.dy*dt;s.life-=dt;
        if(blocks(old,s,walls))s.life=0;
        if(s.life>0&&Math.hypot(s.x-p.x,s.y-p.y)<p.r+5){hurt(8*foeDmg);s.life=0;}
      }
      shots=shots.filter(s=>s.life>0);
      for(const o of level.objects)if(o.kind==='hazard'&&overlaps(p.x,p.y,p.r,o))hurt(hazDmg);
      for(const o of spikes)if(spikesUp(o,time)&&overlaps(p.x,p.y,p.r-3,o))hurt(Math.max(1,hazDmg)*1.5);
      for(const c of coins)if(!c.taken&&overlaps(p.x,p.y,p.r,c)){c.taken=true;collected++;feedback(c.x+c.w/2,c.y,'+1 coin','#e1bd7d');sfx('coin');burst(c.x+c.w/2,c.y+c.h/2,9,'#ffd860',130,2.4,'spark');ring(c.x+c.w/2,c.y+c.h/2,'#ffe9a0',22);}
      for(const c of pickups)if(c.kind==='heal'&&!c.taken&&!ended&&p.hp<kit.hp&&overlaps(p.x,p.y,p.r,c)){c.taken=true;heals++;const healed=Math.round(Math.min(kit.hp-p.hp,kit.hp*healPct));p.hp+=healed;feedback(c.x+c.w/2,c.y,'+'+healed+' health','#c2c58b');sfx('pickupS');burst(p.x,p.y,6,'#9fe08a',40,5,'plus');}
      const obj=level.objective;
      if(obj.type==='clear'&&wave===level.waves.length&&!enemies.length&&!queue.length)finish(true,'Every wave defeated.');
      else if(obj.type==='hunt'&&kills>=obj.target)finish(true,'Hunt target reached.');
      else if(obj.type==='survive'&&time>=obj.target)finish(true,'Survival target reached.');
      else if(obj.type==='collect'&&collected>=obj.target)finish(true,'Collection target reached.');
      else if(obj.type==='exit'&&level.objects.some(o=>o.kind==='exit'&&overlaps(p.x,p.y,p.r,o)))finish(true,'Exit reached.');
      if(!ended&&obj.limit&&obj.type!=='survive'&&time>=obj.limit)finish(false,'Time ran out.');
      if(!ended&&time>=300)finish(false,'Five-minute challenge limit reached.');
    }
    /* a creature from the game, scaled to this arena's body size, with the arena's own health bar */
    function eliteMark(e){if(!e.elite)return;const g=.5+.5*Math.sin(time*5+e.seed);ctx.strokeStyle='rgba(242,201,76,'+(.45+.4*g).toFixed(3)+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(e.x,e.y+e.r*.55,e.r*1.1,e.r*.5,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#f2c94c';ctx.beginPath();const cy=e.y-e.r-18;ctx.moveTo(e.x-7,cy+5);ctx.lineTo(e.x-7,cy-2);ctx.lineTo(e.x-3.5,cy+1);ctx.lineTo(e.x,cy-4);ctx.lineTo(e.x+3.5,cy+1);ctx.lineTo(e.x+7,cy-2);ctx.lineTo(e.x+7,cy+5);ctx.closePath();ctx.fill();}
    function drawCreature(e){
      const type=LOOK[e.kind],def=ETYPES[type];if(!def)return false;
      try{
        if(e.fly){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(e.x+8,e.y+16,e.r*.9,e.r*.45,0,0,Math.PI*2);ctx.fill();}
        ctx.save();ctx.translate(e.x,e.y-(e.fly?8+Math.sin(time*6+e.seed)*2:0));const k=e.r/def.r*1.15;ctx.scale(k,k);
        drawEnemy(ctx,{portrait:true,def,type,x:0,y:0,r:def.r,ang:e.ang,flash:e.flash,state:e.windup>0?'wind':'idle',anim:time*7+e.seed,hp:1,maxHp:1,big:false,kx:0,ky:0,stunT:0,burnT:0,slowT:0,slowMul:1});
        ctx.restore();
      }catch(err){ctx.restore();return false;}
      if(e.hp<e.max){ctx.fillStyle='#201e25';ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2,4);ctx.fillStyle='#f5c766';ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2*e.hp/e.max,4);}
      return true;
    }
    function draw(){
      ctx.save();
      if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
      paintArena(ctx,Object.assign({},level,{objects:level.objects.filter(o=>o.kind!=='coin'&&o.kind!=='heal'&&o.kind!=='crate').concat(crates.filter(c=>!c.gone).map(c=>Object.assign({},c,{dmg:1-c.hp/c.max})),pickups.filter(o=>!o.taken))}),{grid:false,time,cache:true,live:true,entrances:glowDirs()});
      for(const q of parts)if(q.kind==='dust'){const k=q.life/q.max;ctx.fillStyle=q.color;ctx.globalAlpha=.35*k;ctx.beginPath();ctx.arc(q.x,q.y,q.size*(1.6-k*.6),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
      const art=typeof drawEnemy==='function'&&typeof ETYPES!=='undefined';
      for(const e of enemies.filter(q=>!q.fly).concat(enemies.filter(q=>q.fly))){       /* flyers over the walkers */
        if(e.windup>0){ctx.strokeStyle='#fff2ab';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.dir)*160,e.y+Math.sin(e.dir)*160);ctx.stroke();ctx.setLineDash([]);}
        if(e.elite&&!e.fly)eliteMark(e);
        if(art&&drawCreature(e)){if(e.elite&&e.fly)eliteMark(e);continue;}
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
      for(const s of shots){                                                   /* a thrown seed with a short trail, spinning */
        const v=Math.hypot(s.dx,s.dy)||1;for(let k=3;k>=1;k--){ctx.fillStyle='rgba(217,245,131,'+(.18*(4-k)/3).toFixed(3)+')';ctx.beginPath();ctx.arc(s.x-s.dx/v*k*7,s.y-s.dy/v*k*7,5-k,0,Math.PI*2);ctx.fill();}
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate(time*12);ctx.fillStyle='#7a5a2a';ctx.beginPath();ctx.ellipse(0,0,6,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9f583';ctx.beginPath();ctx.ellipse(1,-1,3,2,0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      if(attackFlash){                                                        /* the kick: a swept wedge out to her reach */
        const k=attackFlash/.13,a0=p.angle-.6,a1=p.angle+.6;
        ctx.fillStyle='rgba(255,242,171,'+(.22*k).toFixed(3)+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,kit.range,a0,a1);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(255,242,171,'+(.9*k).toFixed(3)+')';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,kit.range,a0+.1,a1-.1);ctx.stroke();
        ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,kit.range*.75,a0+.25,a1-.25);ctx.stroke();
      }
      let drawn=false;
      if(typeof drawTopGiraffe==='function'){try{drawTopGiraffe(ctx,p.x,p.y,p.angle,.62,p.moving?time*12:0,{moving:!!p.moving,alpha:p.inv>0?.65:1});drawn=true;}catch(err){}}
      if(!drawn){
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
      }
      for(const q of parts){
        if(q.kind==='dust')continue;const k=Math.max(0,q.life/q.max);
        if(q.kind==='ring'){ctx.strokeStyle=q.color;ctx.globalAlpha=k;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,q.size*(1.6-k*.6),0,Math.PI*2);ctx.stroke();}
        else if(q.kind==='plus'){ctx.fillStyle=q.color;ctx.globalAlpha=k;ctx.fillRect(q.x-q.size/2,q.y-1.2,q.size,2.4);ctx.fillRect(q.x-1.2,q.y-q.size/2,2.4,q.size);}
        else if(q.kind==='spark'){ctx.strokeStyle=q.color;ctx.globalAlpha=k;ctx.lineWidth=q.size*.8;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*.05,q.y-q.vy*.05);ctx.stroke();}
        else{ctx.fillStyle=q.color;ctx.globalAlpha=k;ctx.beginPath();ctx.arc(q.x,q.y,q.size*k+.5,0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;
      }
      for(const f of fx){ctx.save();ctx.globalAlpha=f.life/.6;ctx.fillStyle=f.color;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(f.label,f.x,f.y-20-(.6-f.life)*25);ctx.restore();}
      ctx.restore();
      if(hurtFlash>0||p.hp/kit.hp<.3&&!ended){                                 /* red edges when hurt, and a slow pulse when health is low */
        const lowP=p.hp/kit.hp<.3&&!ended?(.5+.5*Math.sin(time*5))*.35:0,a=Math.max(hurtFlash,lowP);
        const g=ctx.createRadialGradient(480,320,240,480,320,600);g.addColorStop(0,'rgba(180,30,20,0)');g.addColorStop(1,'rgba(180,30,20,'+a.toFixed(3)+')');ctx.fillStyle=g;ctx.fillRect(0,0,960,640);
      }
      if(level.modifiers.darkness){
        const lr=level.modifiers.lightRadius||270,shade=ctx.createRadialGradient(p.x,p.y,Math.max(40,lr*.24),p.x,p.y,lr);shade.addColorStop(0,'#10152100');shade.addColorStop(1,'#101521ec');ctx.fillStyle=shade;ctx.fillRect(0,0,960,640);
      }
      const counting=waiting()&&(!enemies.length||nextIn()<=5);
      if(!paused&&!ended&&(time<waveBannerUntil||counting)){
        const title=counting?'Wave '+(wave+1)+' in '+Math.max(0,nextIn()).toFixed(1)+'s':'Wave '+wave+' / '+level.waves.length,sub=waveWords(counting?wave:wave-1);
        ctx.font='13px sans-serif';const m=ctx.measureText?ctx.measureText(sub):null,bw=Math.max(300,Math.min(900,(m&&m.width||440)+80));
        ctx.save();ctx.translate(480,14);ctx.fillStyle='#241b15e6';ctx.beginPath();ctx.moveTo(-bw/2,0);ctx.lineTo(bw/2,0);ctx.lineTo(bw/2-14,27);ctx.lineTo(bw/2,54);ctx.lineTo(-bw/2,54);ctx.lineTo(-bw/2+14,27);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#f2b33d';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f2b33d';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.fillText(title,0,23);
        ctx.fillStyle='#efe6d4';ctx.font='13px sans-serif';ctx.fillText(sub,0,43);ctx.restore();
      }
      if(paused||ended){
        ctx.fillStyle='#241b15bb';ctx.fillRect(0,0,960,640);
        ctx.save();ctx.translate(480,320);ctx.fillStyle='#2a1f18f2';ctx.fillRect(-230,-150,460,300);ctx.strokeStyle='#f2b33d';ctx.lineWidth=3;ctx.strokeRect(-230,-150,460,300);
        ctx.textAlign='center';ctx.fillStyle=ended&&!result.won?'#e8907a':'#f2b33d';ctx.font='bold 40px sans-serif';ctx.fillText(ended?(result.won?'CLEARED!':'TRY AGAIN'):'PAUSED',0,-92);
        if(ended){
          if(result.medal){const mc={gold:['#f2c94c','#a87a18'],silver:['#d8dde4','#7a828c'],bronze:['#d08a4a','#7a4a20']}[result.medal];
            ctx.fillStyle='#b24d36';ctx.beginPath();ctx.moveTo(-150,-70);ctx.lineTo(-138,-30);ctx.lineTo(-126,-70);ctx.fill();ctx.fillStyle='#3a6ab0';ctx.beginPath();ctx.moveTo(-138,-70);ctx.lineTo(-126,-30);ctx.lineTo(-114,-70);ctx.fill();
            ctx.fillStyle=mc[1];ctx.beginPath();ctx.arc(-132,-14,24,0,Math.PI*2);ctx.fill();ctx.fillStyle=mc[0];ctx.beginPath();ctx.arc(-132,-14,19,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=mc[1];ctx.font='bold 12px sans-serif';ctx.fillText(result.medal.toUpperCase(),-132,-10);ctx.fillStyle='#efe6d4';ctx.font='12px sans-serif';ctx.fillText(result.medal==='gold'?'health 75%+':result.medal==='silver'?'health 40%+':'cleared',-132,26);}
          const rows=[['Time',result.time.toFixed(1)+'s'],['Defeated',kills+' / '+(totalEnemies+extra)],['Coins',String(collected)],[crates.length?'Heals · crates':'Heals used',crates.length?heals+' · '+broken+' / '+crates.length:String(heals)],['Health left',Math.ceil(p.hp)+' / '+kit.hp]];
          ctx.font='16px sans-serif';rows.forEach((r,i)=>{ctx.textAlign='left';ctx.fillStyle='#c8b89a';ctx.fillText(r[0],-60,-40+i*26);ctx.textAlign='right';ctx.fillStyle='#efe6d4';ctx.fillText(r[1],180,-40+i*26);});
          ctx.textAlign='center';ctx.fillStyle='#c8b89a';ctx.font='14px sans-serif';ctx.fillText('Retry, or go back to the builder',0,126);
        }else{ctx.fillStyle='#efe6d4';ctx.font='18px sans-serif';ctx.fillText('Press Resume, Esc or Start when ready',0,-30);ctx.fillStyle='#c8b89a';ctx.font='15px sans-serif';ctx.fillText(waveWords(Math.min(wave,level.waves.length-1))?'Wave '+Math.max(1,wave)+': '+waveWords(Math.max(0,wave-1)):'',0,10);}
        ctx.restore();
      }
      const lim=level.objective.limit&&level.objective.type!=='survive'?level.objective.limit:0,objective=OBJ_WORDS[level.objective.type]+(lim?' within '+lim+'s ('+Math.max(0,lim-time).toFixed(0)+'s left)':'');
      hud.textContent='Health '+Math.ceil(p.hp)+' / '+kit.hp+' · '+time.toFixed(1)+'s · Wave '+Math.min(wave+(!enemies.length&&wave<level.waves.length?1:0),level.waves.length)+' / '+level.waves.length+' · '+kills+' defeated · '+collected+' collected — '+objective;
      hpMeter.bar.value=p.hp/kit.hp;hpMeter.text.textContent='Health '+Math.ceil(p.hp)+' / '+kit.hp;
      const goal=level.objective.type==='clear'?kills/(totalEnemies+extra):level.objective.type==='survive'?time/level.objective.target:level.objective.type==='collect'?collected/level.objective.target:level.objective.type==='hunt'?kills/level.objective.target:ended&&result.won?1:0;
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
    function snapshot(){return {time,paused,ended,result:result&&Object.assign({},result),player:Object.assign({},p),wave,kills,coins:collected,heals,queued:queue.length,crates:crates.filter(c=>!c.gone).map(c=>({x:c.x,y:c.y,hp:c.hp})),fx:fx.map(f=>Object.assign({},f)),pickups:pickups.map(o=>Object.assign({},o)),enemies:enemies.map(e=>Object.assign({},e)),shots:shots.map(s=>Object.assign({},s))};}
    /* a controller: the left stick or the D-pad moves her, Start or B pauses, A retries once it is over */
    function pollPad(){
      let gp=null;try{const all=navigator.getGamepads?navigator.getGamepads():[];for(const g of all)if(g&&g.connected){gp=g;break;}}catch(e){}
      if(!gp){pad.x=pad.y=0;return;}
      const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5)),edge=i=>b(i)&&!pad.prev[i],dz=v=>Math.abs(v)<.22?0:v;
      pad.x=dz(gp.axes[0]||0)||((b(15)?1:0)-(b(14)?1:0));pad.y=dz(gp.axes[1]||0)||((b(13)?1:0)-(b(12)?1:0));
      if(edge(9)||edge(1))setPause(!paused);
      if(ended&&edge(0))retryBtn.click();
      pad.prev=gp.buttons.map(x=>!!x.pressed);
    }
    function frame(now){
      if(!frameLive)return;
      pollPad();
      if(last&&!paused&&!ended){carry+=Math.min((now-last)/1000,.1);while(carry>=1/60){step(1/60);carry-=1/60;}}
      last=now;draw();raf=requestAnimationFrame(frame);
    }
    /* what the music should do (js/addons/50c wraps Music.refresh with this) */
    function mood(){return {theme:{savanna:'savanna',arctic:'frost',moon:'moon',forest:'jungle',desert:'savanna',swamp:'swamp',volcanic:'inferno',beach:'isle',cave:'burrow',meadow:'town'}[level.arena.theme]||'savanna',paused,ended,won:!!(result&&result.won),boss:enemies.some(e=>e.kind==='brute'||e.kind==='badger'||e.elite)};}
    current={stop,snapshot,advance,mood,destroy(){frameLive=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',keydown,true);document.removeEventListener('keyup',keyup,true);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);dlg.close();dlg.remove();if(previousFocus&&previousFocus.isConnected)previousFocus.focus();}};
    dlg.showModal();canvas.focus();draw();raf=requestAnimationFrame(frame);return current;
  }
  return {start,stop,paintArena,paintCustom,portrait,paintObject:(ctx,level,o,opts)=>{const lv=level||{arena:{theme:'savanna'}},c=getPalette(lv);paintObject(ctx,lv,o,Object.assign({theme:lv.arena.theme,palette:[c.ground,c.accent,c.foliage],detail:1,time:0,level:lv},opts||{}));},getPalette,getKit:id=>KITS[id]?Object.assign({},KITS[id]):null,getEnemy:id=>FOES[id]?Object.assign({},FOES[id]):null,snapshot:()=>current?current.snapshot():null,mood:()=>current?current.mood():null,advance:s=>current?current.advance(s):null};
})();
window.GRChallengePlay=GRChallengePlay;
