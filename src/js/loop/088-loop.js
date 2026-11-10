//# loop/088-loop.js: the main loop: each frame, the camera, the HUD
/* ---------- loop ---------- */
const V3=THREE.Vector3,qP=new THREE.Quaternion(),qT=new THREE.Quaternion(),qY=new THREE.Quaternion(),qR=new THREE.Quaternion(),qS=new THREE.Quaternion(),qJ=new THREE.Quaternion(),mtx=new THREE.Matrix4();
const AX_X=new V3(1,0,0),AX_Y=new V3(0,1,0),AX_Z=new V3(0,0,1),pos=new V3(),camT=new V3(),look=new V3(),right=new V3(),up=new V3(),back=new V3(),pf=new V3(),pUp=new V3(),pRight=new V3(),pT=new V3(),pPos=new V3();
let camInit=false,lastT=performance.now(),hudT=0;
/* Chase camera. It sits a fixed distance behind and above the ship in the ship's own frame: only its direction is smoothed,
   never its position, so it cannot fall behind at speed. Cockpit puts it on the nose (the ship itself is hidden). */
const CAMS=[{n:'Near',d:5.6,h:2.15,l:9},{n:'Standard',d:7.4,h:2.7,l:10},{n:'Far',d:11,h:3.9,l:12},{n:'Cockpit',fpv:true}];
let camMode=(()=>{const v=parseInt(store.get('hoverline.cam'),10);return v>=0&&v<CAMS.length?v:1})();
const camFwdS=new V3(0,0,-1),camUpS=new V3(0,1,0),finCam={t0:null,dir:1};
function setCam(i,say){camMode=((i%CAMS.length)+CAMS.length)%CAMS.length;store.set('hoverline.cam',String(camMode));camInit=false;
  document.querySelectorAll('[data-cam]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.cam===camMode)));if(say)note('Camera · '+CAMS[camMode].n,900)}
document.querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>setCam(+b.dataset.cam,false));
{const list=$('goptList');list.innerHTML='';
  for(const[k,name,desc,cost]of GOPT){const b=document.createElement('button');b.dataset.g=k;b.innerHTML=`<em>${cost}</em>${name}`;b.title=desc;b.setAttribute('aria-pressed',String(g2(k)));
    b.onclick=()=>{G2[k]=g2(k)?0:1;GFX.ok=true;g2Save();b.setAttribute('aria-pressed',String(g2(k)));if(k==='reflect')VFX.applyEnv();audio.blip(g2(k)?880:440,0.06,0.05);syncSty()};list.append(b)}
  const syncSty=()=>perfSync();/* the sliders here and in Settings */
  for(const id of['fcapR','fcapS']){const el=$(id);el.oninput=()=>{FCAP.v=FCAPS[clamp(+el.value|0,0,FCAPS.length-1)];store.set('hoverline.fcap',String(FCAP.v));FCAP.due=0;syncSty()};el.onchange=()=>audio.blip(660,0.06,0.05)}
  for(const id of['resR','resS']){const el=$(id);el.oninput=()=>{RES.k=clamp(Math.round(+el.value/5)*5/100,0.1,1);resSave();syncSty()};el.onchange=()=>audio.blip(660,0.06,0.05)}
  $('lowBtn').onclick=()=>{RES.low=!RES.low;resSave();syncSty();audio.blip(RES.low?880:440,0.06,0.05)};
  const sync=()=>{list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(g2(b.dataset.g))));syncSty()};
  const fpsSync=()=>{$('fpsBtn').setAttribute('aria-pressed',String(FPS.on));$('fps').hidden=!FPS.on};fpsSync();
  $('fpsBtn').onclick=()=>{FPS.on=!FPS.on;store.set('hoverline.fps',FPS.on?'1':'0');FPS.n=FPS.acc=0;$('fps').textContent='… FPS';fpsSync();audio.blip(FPS.on?880:440,0.06,0.05)};
  $('gfxOpen').onclick=()=>{$('set').hidden=true;$('gfxm').hidden=false;$('gfxm').scrollTop=0;sync();pvOpen();navTo($('gfxm'),$('gfxm').querySelector('[data-perf][aria-pressed=true]'))};
  $('gDone').onclick=()=>{$('gfxm').hidden=true;$('set').hidden=false;setSync();navTo($('set'),$('gfxOpen'))}}
/* The Graphics page's painted preview (Prototype 39). pvPaint(canvas,t,o), o={fx:{bloom,...},low,fps,res,boost,speed,boom,aa(null|true|false),t0}.
   A small night city road with a frame on it, drawn in 2D: nothing here touches the game's own settings or scene. */
const pvPaint=(()=>{const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c},cx=c=>c.getContext('2d');
  const r=rng(3939),BL=[];for(const s of[-1,1])for(let i=0;i<13;i++){const z=2.6+i*1.25+r()*0.9;BL.push({s,x:1.35+r()*0.5+(i%3)*0.35,w:0.55+r()*0.7,d:0.6+r()*1.2,y:1.6+r()*r()*6.5+(i>6?1.4:0),z})}BL.sort((a,b)=>b.z-a.z);
  const ST=[];for(let i=0;i<80;i++)ST.push([r(),r()*r()*0.4,0.35+r()*0.65]);const MO=[];for(let i=0;i<30;i++)MO.push([r(),r(),r()*2-1,0.7+r()*1.5]);
  const CAR=[];for(let i=0;i<8;i++)CAR.push({z:3.5+r()*7,y:1.1+r()*2.6,p:r(),v:(i%2?-1:1)*(0.09+r()*0.08)});
  const SP=[];for(let i=0;i<18;i++){const a=-Math.PI*(0.05+r()*0.9);SP.push([Math.cos(a),Math.sin(a),0.5+r()*0.7])}const CU=[];for(let i=0;i<10;i++)CU.push([r()*2-1,0.6+r()*1.3,0.6+r()*0.7]);
  let K={w:0,h:0};
  const noise=mk(96,96);{const g=cx(noise),d=g.createImageData(96,96);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)}
  function geo(w,h){const hy=h*0.42,U=Math.min(w,h*1.9)*0.6,Hc=(h-hy)/U;return{w,h,hy,U,Hc,vx:w/2,X:(x,z)=>w/2+x*U/z,Y:(y,z)=>hy+(Hc-y)*U/z}}
  /* the still parts, drawn once a size: the sky with and without stars, the city with and without Low detail */
  function sky(G,stars){const c=mk(G.w,G.h),g=cx(c),gr=g.createLinearGradient(0,0,0,G.hy);gr.addColorStop(0,'#03050a');gr.addColorStop(1,'#101727');g.fillStyle=gr;g.fillRect(0,0,G.w,G.hy+1);g.fillStyle='#06080c';g.fillRect(0,G.hy,G.w,G.h-G.hy);
    if(stars){for(const[x,y,b]of ST){g.fillStyle=`rgba(220,230,255,${b})`;const s=(b>0.9?2:1)*Math.max(1,G.w/360);g.fillRect(x*G.w,y*G.h,s,s)}
      for(const[col,y0,amp,fq]of[['70,255,170',0.2,0.05,1.3],['63,200,255',0.15,0.04,2.1],['190,90,255',0.25,0.035,1.7]])for(let x=0;x<G.w;x+=2){const y=(y0+Math.sin(x/G.w*6.283*fq+fq)*amp)*G.h,a=g.createLinearGradient(0,y-G.h*0.14,0,y+G.h*0.015);
        a.addColorStop(0,`rgba(${col},0)`);a.addColorStop(0.8,`rgba(${col},${0.13+0.06*Math.sin(x*0.05)})`);a.addColorStop(1,`rgba(${col},0)`);g.fillStyle=a;g.fillRect(x,y-G.h*0.14,2,G.h*0.16)}}
    return c}
  function city(G,low){const c=mk(G.w,G.h),g=cx(c),q=(pts,f)=>{g.fillStyle=f;g.beginPath();pts.forEach(([x,y,z],i)=>i?g.lineTo(G.X(x,z),G.Y(y,z)):g.moveTo(G.X(x,z),G.Y(y,z)));g.closePath();g.fill()};
    BL.forEach((b,i)=>{if(low&&i%2)return;const xi=b.s*b.x,xo=b.s*(b.x+b.w),z=b.z,z2=z+b.d;
      q([[xi,0,z],[xi,b.y,z],[xi,b.y,z2],[xi,0,z2]],'#121826');q([[xi,0,z],[xo,0,z],[xo,b.y,z],[xi,b.y,z]],'#0a0e16');
      g.fillStyle='rgba(255,176,0,.5)';g.fillRect(Math.min(G.X(xi,z),G.X(xo,z)),G.Y(b.y,z),Math.abs(G.X(xo,z)-G.X(xi,z)),Math.max(1,G.w/320));
      const rr=rng(i*77+5),nc=Math.max(2,Math.round(b.w*5)),nr=Math.max(2,Math.round(b.y*3.2));
      for(let a=0;a<nr;a++)for(let k=0;k<nc;k++){if(rr()>0.34)continue;const y0=b.y*(1-(a+0.3)/nr),y1=b.y*(1-(a+0.7)/nr),x0=xi+(xo-xi)*(k+0.25)/nc,x1=xi+(xo-xi)*(k+0.75)/nc;
        g.fillStyle=rr()<0.68?`rgba(255,176,0,${0.5+rr()*0.5})`:`rgba(63,240,255,${0.5+rr()*0.5})`;g.fillRect(Math.min(G.X(x0,z),G.X(x1,z)),G.Y(y0,z),Math.abs(G.X(x1,z)-G.X(x0,z)),G.Y(y1,z)-G.Y(y0,z))}});return c}
  function road(g,G,t,o){const{w,h,hy}=G,P=pts=>{g.beginPath();pts.forEach(([x,z],i)=>i?g.lineTo(G.X(x,z),G.Y(0,z)):g.moveTo(G.X(x,z),G.Y(0,z)));g.closePath();g.fill()};
    const gr=g.createLinearGradient(0,hy,0,h);gr.addColorStop(0,'#0e1219');gr.addColorStop(1,'#1b202a');g.fillStyle=gr;P([[-1,0.8],[1,0.8],[1,90],[-1,90]]);
    if(o.fx.reflect){/* the city's lights and the sky in the road */
      for(const b of BL){if(o.low&&BL.indexOf(b)%2||b.z>11)continue;const X=G.X(b.s*(b.x+0.1),b.z),y0=G.Y(0,b.z+0.6),y1=Math.min(h,G.Y(0,b.z*0.45)),a=g.createLinearGradient(0,y0,0,y1),c=b.z%2<1?'255,176,0':'63,240,255',wd=G.U*0.07/b.z;
        a.addColorStop(0,`rgba(${c},.0)`);a.addColorStop(0.25,`rgba(${c},.28)`);a.addColorStop(1,`rgba(${c},0)`);g.fillStyle=a;g.fillRect(X-wd/2,y0,wd,y1-y0)}
      const s=g.createLinearGradient(0,hy,0,G.Y(0,2.2));s.addColorStop(0,'rgba(110,140,200,.3)');s.addColorStop(1,'rgba(110,140,200,0)');g.fillStyle=s;P([[-1,2.2],[1,2.2],[1,90],[-1,90]])}
    const off=(t/1000*(o.speed?30:12))%3;g.fillStyle='rgba(230,236,245,.3)';
    for(const lx of[-0.34,0.34])for(let z=4-off;z<60;z+=3){const z0=Math.max(0.8,z),z1=z+1.3;if(z1<=0.8)continue;g.beginPath();g.moveTo(G.X(lx-0.018,z0),G.Y(0,z0));g.lineTo(G.X(lx+0.018,z0),G.Y(0,z0));g.lineTo(G.X(lx+0.018,z1),G.Y(0,z1));g.lineTo(G.X(lx-0.018,z1),G.Y(0,z1));g.fill()}
    /* the edges, pulsing on the beat with Lights on the beat */
    const ph=(t/1000*2.3)%1,k=o.fx.pulse?0.35+0.65*Math.exp(-ph*5):0.75;g.fillStyle=`rgb(${200+55*k|0},${110+90*k|0},${20*k|0})`;
    for(const s of[-1,1])P([[s,0.8],[s*1.07,0.8],[s*1.07,90],[s,90]])}
  function ship(g,G,t,o){const z=1.7,sx=G.vx,gy=G.Y(0,z),sw=0.7*G.U/z,y=gy-sw*0.13+Math.sin(t/420)*sw*0.01,E=[[-0.36,-0.09],[0.36,-0.09]];
    const P=pts=>{g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(sx+a*sw,y+b*sw):g.moveTo(sx+a*sw,y+b*sw));g.closePath();g.fill()};
    if(!o.low){g.fillStyle='rgba(0,0,0,.65)';g.beginPath();g.ellipse(sx,gy,sw*0.6,sw*0.07,0,0,7);g.fill()}
    /* the cube exhaust (always on) */
    for(const[ex,ey]of E)for(let i=0;i<10;i++){const p=((t/(o.boost?240:380))+i/10)%1,s=sw*(0.045-0.02*p)*(o.boost?1.3:1);
      g.fillStyle=`rgba(255,${200-140*p|0},${60-50*p|0},${(1-p)*0.9})`;g.fillRect(sx+ex*sw*(1+p*0.9)+Math.sin(i*7.1)*p*sw*0.1-s/2,y+ey*sw+p*sw*0.5-s/2,s,s)}
    if(o.boost&&o.fx.jets)for(const[ex,ey]of E){const x0=sx+ex*sw,y0=y+ey*sw,x1=sx+ex*sw*1.9,y1=G.h+sw*0.2,a=g.createLinearGradient(0,y0,0,y1);a.addColorStop(0,'rgba(230,255,255,.95)');a.addColorStop(0.4,'rgba(63,240,255,.55)');a.addColorStop(1,'rgba(63,240,255,0)');
      g.fillStyle=a;g.beginPath();g.moveTo(x0-sw*0.05,y0);g.lineTo(x0+sw*0.05,y0);g.lineTo(x1+sw*0.16,y1);g.lineTo(x1-sw*0.16,y1);g.fill();
      for(let j=0;j<3;j++){const p=((t/300)+j/3)%1,f=p*0.85,rx=sw*(0.06+f*0.15);g.strokeStyle=`rgba(210,255,255,${0.85*(1-p)})`;g.lineWidth=Math.max(1,sw*0.02);g.beginPath();g.ellipse(x0+(x1-x0)*f,y0+(y1-y0)*f,rx,rx*0.38,0,0,7);g.stroke()}}
    /* the frame from behind: twin pods, a body between them and a canopy */
    g.fillStyle='#1d2331';P([[-0.22,-0.05],[0.22,-0.05],[0.16,-0.2],[-0.16,-0.2]]);
    g.fillStyle='#3ff0ff';g.beginPath();g.ellipse(sx,y-sw*0.22,sw*0.1,sw*0.05,0,Math.PI,0);g.fill();
    for(const s of[-1,1]){g.fillStyle='#161b27';P([[s*0.2,0],[s*0.54,0],[s*0.5,-0.19],[s*0.24,-0.19]]);g.fillStyle='#ffb000';P([[s*0.5,-0.19],[s*0.24,-0.19],[s*0.25,-0.16],[s*0.49,-0.16]]);P([[s*0.54,0],[s*0.5,0],[s*0.47,-0.12],[s*0.51,-0.12]])}
    if(o.fx.reflect){const a=g.createLinearGradient(sx-sw*0.55,0,sx+sw*0.55,0);a.addColorStop(0,'rgba(150,190,255,0)');a.addColorStop(0.3,'rgba(150,190,255,.38)');a.addColorStop(0.5,'rgba(255,215,160,.12)');a.addColorStop(0.7,'rgba(150,190,255,.38)');a.addColorStop(1,'rgba(150,190,255,0)');g.fillStyle=a;
      for(const s of[-1,1])P([[s*0.21,-0.02],[s*0.53,-0.02],[s*0.5,-0.15],[s*0.24,-0.15]]);P([[-0.2,-0.06],[0.2,-0.06],[0.15,-0.19],[-0.15,-0.19]])}
    for(const[ex,ey]of E){const fl=0.85+0.15*Math.sin(t/37+ex*9),X=sx+ex*sw,Y=y+ey*sw;g.fillStyle='#07090d';g.beginPath();g.arc(X,Y,sw*0.072,0,7);g.fill();
      const a=g.createRadialGradient(X,Y,0,X,Y,sw*0.06);a.addColorStop(0,'#fff');a.addColorStop(0.35,o.boost?'#b8fbff':'#ffd060');a.addColorStop(1,o.boost?`rgba(63,240,255,${fl})`:`rgba(255,120,20,${fl})`);g.fillStyle=a;g.beginPath();g.arc(X,Y,sw*0.06,0,7);g.fill()}}
  function boom(g,G,t,o){const ph=((t-o.t0)%1200)/1200,zz=3.2,ex=G.X(0.5,zz),gy=G.Y(0,zz),ey=G.Y(0.18,zz),R=G.U*0.3/zz;
    if(ph<0.45){const a=g.createRadialGradient(ex,ey,0,ex,ey,R*(0.6+ph*2.6));a.addColorStop(0,`rgba(255,255,230,${Math.max(0,1-ph*2.3)})`);a.addColorStop(0.4,`rgba(255,150,40,${Math.max(0,0.85-ph*1.9)})`);a.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=a;g.fillRect(ex-R*3,ey-R*3,R*6,R*6)}
    if(!o.fx.debris)return;g.strokeStyle='rgba(255,215,110,.95)';g.lineWidth=Math.max(1,R*0.07);
    if(ph<0.6){g.globalAlpha=1-ph/0.6;for(const[dx,dy,v]of SP){const d=R*3.4*v*ph,l=R*0.5*(1-ph),dd=ph*ph*R*2.5;g.beginPath();g.moveTo(ex+dx*d,ey+dy*d+dd);g.lineTo(ex+dx*(d+l),ey+dy*(d+l)+dd);g.stroke()}g.globalAlpha=1}
    for(const[dx,vy,v]of CU){const x=ex+dx*R*2.8*v*ph;let yy=ey-(vy*R*3.2*ph-R*8*ph*ph);if(yy>gy)yy=gy-(yy-gy)*0.3;const s=R*0.2*v;g.fillStyle=`rgba(150,157,168,${1-ph*0.6})`;g.fillRect(x-s/2,yy-s/2,s,s)}}
  function traffic(g,G,t,o){CAR.forEach((c,i)=>{if(o.low&&i%2)return;const p=o.fx.anim?c.p+t/1000*c.v:c.p,x=-6+(((p%1)+1)%1)*12,X=G.X(x,c.z),Y=G.Y(c.y,c.z),s=Math.max(2,G.U*0.075/c.z),d=Math.sign(c.v);
    g.fillStyle='rgba(255,70,60,.9)';g.fillRect(X-d*s*2.2-s/2,Y-s*0.35,s,s*0.7);g.fillStyle='#e8f6ff';g.fillRect(X-s/2,Y-s*0.4,s*1.1,s*0.8)})}
  function motes(g,G,t){g.globalCompositeOperation='lighter';for(const[x0,y0,v,s]of MO){const x=((x0+t/1000*0.025*v)%1+1)%1*G.w,y=(((y0+t/1000*0.015)%1)+Math.sin(t/900+x0*20)*0.012)*G.h,rr=s*G.w/300;
    const a=g.createRadialGradient(x,y,0,x,y,rr*2);a.addColorStop(0,'rgba(190,230,255,.85)');a.addColorStop(1,'rgba(159,216,255,0)');g.fillStyle=a;g.fillRect(x-rr*2,y-rr*2,rr*4,rr*4)}g.globalCompositeOperation='source-over'}
  function haze(g,G){const a=g.createLinearGradient(0,0,0,G.h),m=G.hy/G.h;a.addColorStop(0,'rgba(26,38,68,.3)');a.addColorStop(m*0.75,'rgba(30,44,78,.55)');a.addColorStop(m,'rgba(38,54,94,.75)');a.addColorStop(Math.min(1,m+0.16),'rgba(30,44,78,.18)');a.addColorStop(1,'rgba(30,44,78,0)');g.fillStyle=a;g.fillRect(0,0,G.w,G.h)}
  function scene(g,G,t,o){g.drawImage(K['s'+(o.fx.sky?1:0)],0,0);g.drawImage(K['c'+(o.low?1:0)],0,0);traffic(g,G,t,o);road(g,G,t,o);if(o.fx.haze)haze(g,G);if(o.boom)boom(g,G,t,o);ship(g,G,t,o);if(o.fx.motes)motes(g,G,t)}
  return function(cv,t,o){const W=cv.width,H=cv.height;if(K.w!==W||K.h!==H){K={w:W,h:H};const G=geo(W,H);K.G=G;K.s0=sky(G,false);K.s1=sky(G,true);K.c0=city(G,false);K.c1=city(G,true)}
    const G=K.G,M=cx(cv),rs=o.aa!=null?0.34:clamp(o.res||1,0.1,1),sw=Math.max(8,Math.round(W*rs)),sh=Math.max(5,Math.round(H*rs));
    if(!K.A||K.A.width!==sw||K.A.height!==sh)K.A=mk(sw,sh);const A=K.A,a=cx(A);a.setTransform(sw/W,0,0,sh/H,0,0);scene(a,G,t,o);a.setTransform(1,0,0,1,0,0);
    M.globalCompositeOperation='source-over';M.globalAlpha=1;M.imageSmoothingEnabled=o.aa!==false;M.drawImage(A,0,0,W,H);M.imageSmoothingEnabled=true;
    const tmp=n=>{if(!K[n])K[n]=mk(W,H);const c=K[n],g=cx(c);g.globalCompositeOperation='copy';g.globalAlpha=1;g.drawImage(cv,0,0);g.globalCompositeOperation='source-over';return c};
    if(o.fx.bloom){let src=cv,lw=W,lh=H;for(const n of['b2','b4','b8']){lw=Math.max(2,lw>>1);lh=Math.max(2,lh>>1);if(!K[n])K[n]=mk(lw,lh);const g=cx(K[n]);g.globalCompositeOperation='copy';g.drawImage(src,0,0,lw,lh);src=K[n]}
      {const g=cx(K.b8);g.globalCompositeOperation='multiply';g.drawImage(K.b8,0,0)}
      M.globalCompositeOperation='lighter';M.globalAlpha=0.32;M.drawImage(K.b4,0,0,W,H);M.globalAlpha=0.9;M.drawImage(K.b8,-W*0.01,-H*0.01,W*1.02,H*1.02);M.globalAlpha=1;M.globalCompositeOperation='source-over'}
    if(o.fx.grade){const T=tmp('T');M.globalCompositeOperation='overlay';M.globalAlpha=0.5;M.drawImage(T,0,0);M.globalCompositeOperation='soft-light';M.globalAlpha=0.35;M.fillStyle='#ff9a30';M.fillRect(0,0,W,H);M.globalCompositeOperation='source-over';M.globalAlpha=1}
    if(o.speed&&o.fx.blur){const T=tmp('T');for(const[q,al]of[[0.04,0.36],[0.08,0.26],[0.12,0.18]]){M.globalAlpha=al;M.drawImage(T,-W*q/2,-H*q/2,W*(1+q),H*(1+q))}M.globalAlpha=1}
    if(o.speed&&o.fx.aberr){const R=tmp('R'),C=tmp('C'),rg=cx(R),cg=cx(C);rg.globalCompositeOperation='multiply';rg.fillStyle='#f00';rg.fillRect(0,0,W,H);cg.globalCompositeOperation='multiply';cg.fillStyle='#0ff';cg.fillRect(0,0,W,H);
      M.globalCompositeOperation='copy';M.drawImage(R,-W*0.016,-H*0.016,W*1.032,H*1.032);M.globalCompositeOperation='lighter';M.drawImage(C,W*0.006,H*0.006,W*0.988,H*0.988);M.globalCompositeOperation='source-over'}
    if(o.fx.grain){if(!K.gp)K.gp=M.createPattern(noise,'repeat');M.save();M.globalCompositeOperation='overlay';M.globalAlpha=0.32;M.translate(-Math.random()*96,-Math.random()*96);M.fillStyle=K.gp;M.fillRect(0,0,W+96,H+96);M.restore()}
    if(o.fx.vig){const v=M.createRadialGradient(W/2,H/2,Math.hypot(W,H)*0.2,W/2,H/2,Math.hypot(W,H)*0.6);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.75)');M.fillStyle=v;M.fillRect(0,0,W,H)}
    if(o.fx.scan){const s=Math.max(1,Math.round(W/240));M.fillStyle='rgba(0,0,0,.42)';for(let y=0;y<H;y+=s*3)M.fillRect(0,y,W,s)}
    if(o.fps){const f=Math.max(9,Math.round(W/30));M.font=`600 ${f}px ui-monospace,monospace`;const tx=(o.fpsN||60)+' FPS',tw=M.measureText(tx).width;M.fillStyle='rgba(10,12,18,.7)';M.fillRect(f*0.5,H-f*1.9,tw+f,f*1.5);M.fillStyle='#cfd8e3';M.fillText(tx,f,H-f*0.8)}}})();
/* The preview's words and what it shows: the option under the pointer or the pad's focus switches on and off every
   1.2 s, a preset shows its whole look, the resolution slider its sharpness, the cap its smoothness, and with nothing
   chosen it shows the setup as it is. It paints only while the Graphics screen is open and never changes a setting. */
const PVS={k:null,t0:0,raf:0,last:0},PVT={sky:'Stars and an aurora over the night tracks.',motes:'Dust, spray, fireflies or star dust in the air.',anim:'Falls pour, geysers burst, whitecaps roll and traffic flies.',
  low:'Less scenery and city traffic, no falls or geysers, no frame shadows (the scenery from the next track).',fps:'The frame rate in the bottom corner.',res:'Lower resolution = higher fps: fewer pixels drawn, a softer picture.',fcap:'Holds the frame rate steady on a device that can’t keep up, and saves battery.',
  ultra:'Every effect off, 20% resolution, Low detail, a 30 fps cap and Songs (Pregen where there are no songs).',lite:'Every effect off, 50% resolution, a 45 fps cap and Pregen music.',all:'Every effect on, full resolution, no cap and Generative music.'};
function pvWords(){const k=PVS.k||'',g=k.slice(2),o=k.startsWith('g:')?GOPT.find(x=>x[0]===g):null;
  $('gPvT').textContent=o?PVT[g]||o[2]:k.startsWith('p:')?PVT[g]:PVT[k]||(coarse?'Tap an option to switch it and see it here.':'Point at an option to see it here.')}
function pvSet(k){if(k===PVS.k)return;PVS.k=k;PVS.t0=performance.now();pvWords()}
function pvOpts(t){const k=PVS.k||'',fx={},on=Math.floor((t-PVS.t0)/1200)%2===0,oo=on?'On':'Off';for(const[g]of GOPT)fx[g]=g2(g);
  const o={fx,low:RES.low,fps:FPS.on,res:RES.k,t0:PVS.t0};let lab='Now';
  if(k.startsWith('p:')){const st=STYLES[k.slice(2)];for(const[g]of GOPT)fx[g]=st.on.includes(g);o.low=!!st.low;o.res=st.res||1;lab=st.n}
  else if(k.startsWith('g:')){const g=k.slice(2);fx[g]=on;o.res=1;lab=oo;if(g==='blur'||g==='aberr')o.speed=o.boost=true;if(g==='jets')o.boost=true;if(g==='debris')o.boom=true;if(g==='fxaa')o.aa=on}
  else if(k==='low'){o.low=on;o.res=1;lab=oo}else if(k==='fps'){o.fps=on;lab=oo}
  else if(k==='res')lab=Math.round(RES.k*100)+'%';else if(k==='fcap'){lab=FCAP.v?FCAP.v+' fps':'No cap';o.speed=true}
  return[o,lab]}
function pvLoop(t){if($('gfxm').hidden){PVS.raf=0;return}PVS.raf=requestAnimationFrame(pvLoop);const fast=PVS.k==='fcap';if(!fast&&t-PVS.last<32)return;PVS.last=t;
  const cv=$('gPvC'),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const W=Math.min(Math.round(w*Math.min(devicePixelRatio||1,2)),600),H=Math.round(W*h/w);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const[o,lab]=pvOpts(t),L=$('gPvL');if(L.textContent!==lab){L.textContent=lab;L.classList.toggle('on',lab==='On')}
  try{pvPaint(cv,fast&&FCAP.v?Math.floor(t*FCAP.v/1000)*1000/FCAP.v:t,o)}catch(e){PVS.err=String(e&&e.message||e)}}
function pvOpen(){PVS.k=null;pvWords();if(!PVS.raf)PVS.raf=requestAnimationFrame(pvLoop)}
{const host=$('gfxm'),pick=e=>{const b=e.target&&e.target.closest?e.target.closest('[data-g],[data-perf],#lowBtn,#fpsBtn,#resR,#fcapR'):null;return b&&host.contains(b)?b:null},
    key=b=>b.dataset.g?'g:'+b.dataset.g:b.dataset.perf?'p:'+b.dataset.perf:{lowBtn:'low',fpsBtn:'fps',resR:'res',fcapR:'fcap'}[b.id],on=e=>{const b=pick(e);if(b)pvSet(key(b))};
  host.addEventListener('focusin',on);host.addEventListener('pointerdown',on);host.addEventListener('input',on);host.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')on(e)})}
setCam(camMode,false);

const _gq=new THREE.Quaternion(),_gE=new THREE.Euler(),_qCam=new THREE.Quaternion();
function placeShip(r,t){
  const s=sampleAt(r.u);
  back.copy(s.t).negate();right.crossVectors(s.u,back).normalize();up.crossVectors(back,right);
  mtx.makeBasis(right,up,back);qT.setFromRotationMatrix(mtx);
  qY.setFromAxisAngle(AX_Y,r.yaw-(r.dVa!=null?r.dVa:r.driftK?(r.drift||Math.sign(r.steerS))*(r.dAng||0.42)*r.driftK:0));qS.setFromAxisAngle(AX_Y,r.spin);qR.setFromAxisAngle(AX_Z,-r.steerS*0.45+(r.rollA||0));
  const sfp=surf(r.u,r.lat,r,!(r.isGhost||r.proxy)),gh=sfp.h,gsl=Math.atan(sfp.sl);
  pos.copy(s.p).addScaledVector(s.r,r.lat).addScaledVector(up,gh+(r.air?r.h:HOVER+(r.d&&r.d.roll?0:Math.sin(t*5+r.lat)*0.06))+(r.hopY||0));if(r.isGhost)r.vh=0;
  qP.setFromAxisAngle(AX_X,r.pitch*0.25+gsl+(r.air?clamp(r.vh/Math.max(30,r.v),-0.5,0.5)*0.6:0));
  r.ship.position.copy(pos);r.ship.quaternion.copy(qT).multiply(qY).multiply(qS).multiply(qP).multiply(qR);
  /* knocked out of phase: 30 times a second the frame may blink out, or tear sideways and stretch; it shakes all the
     while. The envelope swells in the first twentieth of the stun and fades to the end. */
  let gv=true;const sc=r.ship.scale;
  if(r.spinD>0&&r.wreck<=0){const k=Math.min(1,r.spinT/r.spinD),e=Math.min(1,k/0.05)*Math.pow(1-k,0.7)*(r.glBig?1:0.8),sl=Math.floor(t*30),gs=r.glSeed||0,h=n=>{const x=Math.sin((sl+gs)*12.9898+n*78.233)*43758.5453;return x-Math.floor(x)};
    gv=h(1)>(r.glBig?0.45:0.34)*e;
    if(h(2)<0.6*e){sc.set(1+(h(3)-0.25)*0.9*e,Math.max(0.35,1-h(4)*0.55*e),1+(h(5)-0.5)*0.8*e);r.ship.position.addScaledVector(right,(h(6)-0.5)*1.3*e)}else sc.set(1,1,1);
    r.ship.position.addScaledVector(right,(Math.random()-0.5)*0.32*e).addScaledVector(up,(Math.random()-0.5)*0.24*e);
    _gq.setFromAxisAngle(AX_Y,(Math.random()-0.5)*0.24*e);r.ship.quaternion.multiply(_gq);_gq.setFromAxisAngle(AX_Z,(Math.random()-0.5)*0.22*e);r.ship.quaternion.multiply(_gq)}
  else if(sc.x!==1||sc.y!==1||sc.z!==1)sc.set(1,1,1);
  const fpvMe=r===player&&!SPL.race&&CAMS[camMode].fpv&&S.state!=='menu'&&S.state!=='lab'&&S.state!=='done';r.ship.visible=gv&&r.wreck<=0&&!fpvMe&&!(r.inv>0&&Math.floor(t*12)%2===0)&&!(r.phase>0&&Math.floor(t*30)%3===0);phaseLook(r,t);r.shadow.visible=gv&&r.wreck<=0&&!fpvMe&&!T.gap[idxAt(r.u)];
  r.shadow.position.copy(s.p).addScaledVector(s.r,r.lat).addScaledVector(up,gh+0.06);r.shadow.quaternion.copy(qT).multiply(qY);
  const ud=r.ship.userData;shipCtl(ud,r.brk,r.steerS,S.state==='menu'||S.state==='lab'?1:r.ammo/(r.d.ammo||100));
  if(ud.extra&&ud.extra.spin){const dt=clamp(t-(r._lt??t),0,0.1);r._lt=t;for(const q of ud.extra.spin)q.o.rotation[q.ax]+=(q.k*r.v+(q.w||0))*dt}/* the flicker is a hash of the time, not Math.random, so drawing never moves the game's random numbers (Prototype 51) */
  if(ud.extra&&(ud.extra.arc||ud.extra.field)){const fl=(Math.sin(t*127.1+(r.bias||0)*311.7)*43758.5453)%1,fz=Math.abs(fl);if(ud.extra.arc)ud.extra.arc.opacity=0.35+0.45*fz*(0.5+r.v/VMAX);if(ud.extra.field)ud.extra.field.opacity=0.16+0.1*fz+(r.air?0.1:0)}
  const bo=!!(r.boost>0||r.selfBoost),tl=0.6+r.v/VMAX*4.5+(r.selfBoost?3:r.boost*4);ud.trailM.map=(bo?FLAMES.boost:FLAMES.fire)[(Math.floor(t*16+(r.bias||0)*7+(r.u||0)*0.01)%6+6)%6];ud.glowM.color.setHex(bo?0xb8fbff:0xffc040);
  if(ud.jets){const on=!!(bo&&g2('jets')&&r.wreck<=0);if(on)qJ.copy(qP).multiply(qR).invert();for(const j of ud.jets){j.visible=on;if(!on)continue;const w=j.userData.w*0.9*(1+0.16*Math.sin(t*38+(r.bias||0)*3)),len=Math.min(4.8,tl*0.34);j.scale.set(w,w,len);j.quaternion.copy(qJ);
    j.userData.rings.forEach((m,k)=>{const ph=(t*2.8+k/3)%1;m.position.z=ph;m.scale.setScalar(1-0.66*ph);m.material.opacity=0.85*(1-ph)})}}
  const bub=ud.shield,col=r.spinD>0&&r.wreck<=0&&Math.floor(t*30)%3===0?0xbe5aff:r.od>0?0xffd24a:r.emp>0&&Math.floor(t*14)%2?0x6fb8ff:r.barrier>0?0x3ff0ff:r.charging==='hp'?0x46ff8c:r.charging==='ammo'?0xbe5aff:0;bub.visible=!!col&&r.wreck<=0;
  if(col){bub.material.color.setHex(col);bub.material.opacity=(r.barrier>0?0.2:0.12)+Math.sin(t*20)*0.05+(r.barrier>0&&r.barrier<1?Math.sin(t*40)*0.1:0)}
  if(r===player){pf.set(0,0,-1).applyQuaternion(qT.clone().multiply(_qCam.setFromAxisAngle(AX_Y,r.yaw))).addScaledVector(up,sfp.sl).normalize();pUp.copy(up);pRight.copy(right);pT.copy(s.t);pPos.copy(pos)}
  /* Prototype 60: every local pilot's pose, for its own chase camera in split screen */
  if(r.lp){const c=r.lp;c.pf.set(0,0,-1).applyQuaternion(qT.clone().multiply(_qCam.setFromAxisAngle(AX_Y,r.yaw))).addScaledVector(up,sfp.sl).normalize();c.pUp.copy(up);c.pRight.copy(right);c.pT.copy(s.t);c.pPos.copy(pos)}
}

/* Nose trim, shown around your own craft: faint green speed lines stream past when nose-down streamlining is making
   you faster; a faint red heat shell glows ahead of the nose when nose-up drag (or the nose scraping) is slowing you.
   In another ship's slipstream the same lines run pale blue (Prototype 32: the lines say it, no words). */
const trimFx=(()=>{const g=new THREE.Group(),lineM=new THREE.MeshBasicMaterial({color:0x5dff9a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),lg=new THREE.BoxGeometry(0.025,0.025,1.7),lines=[];
  for(let i=0;i<26;i++){const m=new THREE.Mesh(lg,lineM),a=((i*7)%26)/26*TAU+Math.random()*0.3;m.userData={a,r:1.15+Math.random()*0.7,z:Math.random()*9-5,sp:0.75+Math.random()*0.5};g.add(m);lines.push(m)}
  const shellM=new THREE.MeshBasicMaterial({color:0xaab4be,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const shell=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,TAU,0,Math.PI*0.4),shellM);shell.rotation.x=-Math.PI/2;g.add(shell);g.visible=false;scene.add(g);
  const sparkM=new THREE.MeshBasicMaterial({color:0xffc861,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),sg=new THREE.BoxGeometry(0.05,0.05,0.35),sparks=[];
  for(let i=0;i<22;i++){const m=new THREE.Mesh(sg,sparkM);m.visible=false;m.userData={life:0,vx:0,vy:0,vz:0};g.add(m);sparks.push(m)}
  return{g,lines,lineM,shell,shellM,sparks,sparkM,kG:0,kR:0}})();
/* Phase (Prototype 49): the frame goes see-through and flickers, and every fourth frame or so it shows as an outline
   (wireframe), instead of a bubble round it. Its own materials are cloned once per mesh and swapped in while it lasts;
   additive glows and the exhaust keep theirs. */
let phaseN=1;
function phaseLook(r,t){const on=r.phase>0&&r.wreck<=0;if(!on&&!r._ph)return;r._ph=on;const ud=r.ship.userData;
  const op=0.42+0.14*Math.sin(t*23+(r.bias||0)*5),wf=Math.floor(t*30)%4===0;
  r.ship.traverse(m=>{if(!m.isMesh||!m.material)return;const u=m.userData;
    if(!on){if(u.phO){m.material=u.phO;u.phO=null}return}
    if(!u.phM){const src=m.material,arr=Array.isArray(src)?src:[src];if(arr.some(x=>x.blending!==THREE.NormalBlending||x===ud.trailM||x===ud.glowM)){u.phSkip=true}else{/* three makes each new material's id from Math.random, which the races share: lend it a private sequence while cloning,
      so Phase looks change nothing about a race */const R0=Math.random;Math.random=()=>((phaseN=(phaseN*1103515245+12345)>>>0)/4294967296);try{u.phM=Array.isArray(src)?src.map(x=>x.clone()):src.clone()}finally{Math.random=R0};for(const x of[].concat(u.phM)){x.transparent=true;x.depthWrite=false}}}
    if(u.phSkip)return;if(!u.phO)u.phO=m.material;m.material=u.phM;for(const x of[].concat(u.phM)){x.opacity=op;x.wireframe=wf}})}
function trimStep(dt){const r=player,F=trimFx,on=(S.state==='race'||S.state==='countdown')&&r.wreck<=0&&r.ship.visible;
  const pd=Math.max(0,-r.pitch),pu=Math.max(0,r.pitch),ground=!r.air;
  const scr=false,tbB=r.trimB||0,wantG=on&&ground&&(tbB>0.01||r.trimUp&&(r.slopeG||0)>0.2&&r.climb<1.6)?clamp(Math.max(tbB/0.15,r.trimUp?r.slopeG*(3-r.climb)/2:0),0,1)*clamp(r.v/70,0,1):0,wantR=on&&ground&&pu>0.12?pu*clamp(r.v/60,0,1):0;
  /* sparks */let live=0;for(const m of F.sparks){const u=m.userData;if(u.life>0){u.life-=dt;m.position.x+=u.vx*dt;m.position.y+=u.vy*dt;m.position.z+=u.vz*dt;u.vy-=9*dt;m.visible=u.life>0;live++}else if(on&&scr&&Math.random()<dt*40){u.life=0.25+Math.random()*0.25;u.vx=(Math.random()-0.5)*6;u.vy=1+Math.random()*3;u.vz=8+Math.random()*10;m.position.set((Math.random()-0.5)*0.8,0.05,-1.5*(r.d.size||1));m.visible=true;live++}else m.visible=false}
  if(scr!==F.scr){F.scr=scr;F.shellM.color.setHex(scr?0xff4a1a:0xaab4be)}const dv=r.dive||0,nL=Math.round(7+19*dv);
  const wantS=on&&ground&&S.state==='race'?clamp(((r.draft||0)-0.3)/0.5,0,1):0;F.kS=(F.kS||0)+(wantS-(F.kS||0))*Math.min(1,dt*5);
  F.kG+=(wantG-F.kG)*Math.min(1,dt*6);F.kR+=(wantR-F.kR)*Math.min(1,dt*7);F.g.visible=F.kG>0.01||F.kR>0.01||F.kS>0.01||live>0;if(!F.g.visible)return;
  F.g.position.copy(r.ship.position);F.g.quaternion.copy(r.ship.quaternion);const sz=r.d.size||1;F.g.scale.setScalar(sz);
  const sl=F.kS>F.kG*(0.3+0.45*dv)/0.5,nV=sl?Math.max(nL,16):nL;if(sl!==F.sl){F.sl=sl;F.lineM.color.setHex(sl?0xa8e8ff:0x5dff9a)}
  F.lineM.opacity=Math.max((0.3+0.45*dv)*F.kG,0.5*F.kS);const v=r.v;
  F.lines.forEach((m,i)=>{m.visible=i<nV;if(!m.visible)return;const u=m.userData;u.z+=v*u.sp*0.32*dt;if(u.z>4)u.z-=9;m.position.set(Math.cos(u.a)*u.r*(1.15-0.2*dv),0.45+Math.sin(u.a)*u.r*(0.55-0.1*dv),u.z);m.scale.z=0.6+v/VMAX*1.4+dv*2.2})
  F.shell.visible=false;/* Prototype 49: no nose-up shell */F.shell.position.set(0,0.35,-1.9-0.3*sz);F.shell.scale.set(1.25,0.95,0.8+0.5*clamp(v/VMAX,0,1));F.shellM.opacity=(scr?0.2:0.13)*F.kR*(0.8+0.2*Math.sin(S.t*31)+0.1*Math.sin(S.t*53))}
function step(dt){
  S.t+=dt;
  const racing=S.state==='race';
  const inp=QK.live?qkIn(readInput()):SPL.race?splInputs():readInput();
  if(mp.on&&mp.sess&&mp.goHost!=null&&!mp.sess.state.isHost&&mp.sess.state.hostId===mp.sess.state.goHost)mp.go=mp.goHost-mp.sess.state.offset;
  if(S.state==='mpwait'){const c=$('count');c.hidden=false;c.textContent='…';c.classList.remove('go')}
  if(S.state==='countdown'){
    if(mp.on&&mp.go!=null)S.count=(mp.go-performance.now())/1000;else S.count=S.goAt?(S.goAt-performance.now())/1000:S.count-dt;const n=Math.ceil(S.count);
    if(n<S.lastBeep){S.lastBeep=n;const said=audio.voice(['go','one','two','three'][n]||'');if(!said){if(n>0)audio.sfx('count')||audio.blip(440,0.12);else audio.sfx('go')||audio.blip(880,0.35)}else if(n===0)audio.blip(880,0.2,0.08)}
    const c=$('count');c.hidden=false;
    if(S.count>0){c.textContent=Math.min(3,n);c.classList.remove('go')}else{c.textContent='GO';c.classList.add('go');S.state='race';S.wl=99;setTimeout(()=>{if(S.state==='race'&&S.raceT<WLOCK-4)note('Modules online after '+WLOCK+' s',1800)},900);music.go();music.setMood('race');S.raceT=mp.on&&mp.go!=null?(performance.now()-mp.go)/1000:0;setTimeout(()=>{if(c.textContent==='GO')c.hidden=true},700)}
  }
  if(racing||S.state==='done'){
    /* In a room the race clock is the shared one (time since the agreed GO), and physics catches up in small steps
       when frames are slow, so every device's lap times mean the same thing. */
    let pdt=dt;if(mp.on&&mp.go!=null){const rt=(performance.now()-mp.go)/1000;pdt=clamp(rt-S.raceT,0,0.25);S.raceT=Math.max(S.raceT,rt)}else S.raceT+=dt;
    const nSub=Math.max(1,Math.ceil(pdt/0.034)),sdt=pdt/nSub,auto=BOT||mp.auto;
    for(let k=0;k<nSub;k++){
      for(const r of racers){if(r.isGhost){ghostStep(r,sdt);continue}if(r.proxy){proxyStep(r,sdt);continue}const i=(r===player&&player.finishT==null&&!auto)?(player.autoT>0?apInput(r,inp,sdt):inp):r.lp&&r!==player&&r.finishT==null&&!r.lp.gone?(r.autoT>0?apInput(r,r.lp.inp,sdt):r.lp.inp):aiInput(r,sdt);physics(r,i,sdt)}
      logTick(sdt);
      collide();updateShots(sdt);inp.fire=[false,false];if(SPL.race)splFireClear()}
    if(!mp.on&&player.finishT==null)while(S.raceT>=rec.k*0.1){recSample();rec.k++}
    if(racing){const left=WLOCK-S.raceT,n=Math.ceil(left);
      if(left>0&&n<=3&&n!==S.wl){S.wl=n;note('Modules online in '+n,950);audio.blip(660,0.1,0.07,'triangle')}
      else if(left<=0&&S.wl!==0){S.wl=0;if(WLOCK>0){note('Modules online',1300);audio.chime(true)}}}
  }
  if(mp.on&&mp.bg&&S.state==='menu'&&mp.go!=null){const rt=(performance.now()-mp.go)/1000,pdt=clamp(rt-S.raceT,0,0.25);S.raceT=Math.max(S.raceT,rt);
    const n=Math.max(1,Math.ceil(pdt/0.034));for(let k=0;k<n;k++){for(const r of racers)if(r.isAI&&!r.proxy)physics(r,aiInput(r,pdt/n),pdt/n);else if(r.proxy)proxyStep(r,pdt/n);updateShots(pdt/n)}
    if(!racers.some(r=>r.remote&&!r.left&&r.finishT==null)){mp.bg=false;mp.go=null;clearShots()}else mpTick()}
  if(mp.on&&mp.sess&&(S.state==='race'||S.state==='done'||S.state==='countdown'||S.state==='mpwait'||S.state==='paused'))mpTick();
  S.shake=Math.max(0,S.shake-dt*2.5);
  {const ear=SPL.race?splLead():player;audio.engine(S.state==='menu'?20:S.state==='countdown'?40+Math.sin(S.t*9)*10:ear.v,ear.boost)}
  {const ck=player.charging||(S.t-(player.chgEnd??-9)<0.3?player.chgKind:null);audio.charge(S.state==='race'&&player.wreck<=0?ck:null,ck==='hp'?player.hp/player.d.hp:player.ammo/player.d.ammo)}
  for(const r of racers){placeShip(r,S.t);if(r.isGhost||RES.low)r.shadow.visible=false}
  trimStep(dt);inkStep(dt);drFxStep(dt);empFxStep(dt);
  if(S.state==='done'){finCam.vel=(finCam.vel||new V3()).copy(pT).multiplyScalar(player.v)}else if(finCam.vel)finCam.vel.set(0,0,0);
  if(S.state!=='paused')updateFx(dt);

  // camera
  if(S.state==='menu'){
    S.fly+=dt*55;const s=sampleAt(S.fly),a=sampleAt(S.fly+45);
    camT.copy(s.p).addScaledVector(s.u,16).addScaledVector(s.r,Math.sin(S.t*0.3)*10);
    camera.position.lerp(camT,camInit?1-Math.exp(-dt*2.5):1);camera.up.lerp(s.u,camInit?1-Math.exp(-dt*3):1).normalize();camera.lookAt(look.copy(a.p).addScaledVector(a.u,2));camera.fov=62;
  }else{
    const C=CAMS[S.state==='done'&&CAMS[camMode].fpv?1:camMode],tgtF=pf.clone().lerp(pT,C.fpv?0.15:0.35).normalize();
    if(!camInit){camFwdS.copy(tgtF);camUpS.copy(pUp)}else{camFwdS.lerp(tgtF,1-Math.exp(-dt*(C.fpv?14:8))).normalize();camUpS.lerp(pUp,1-Math.exp(-dt*10)).normalize()}
    const vk=player.v/VMAX,boo=player.boost>0||!!player.selfBoost,pk=camera.aspect<1?clamp((1-camera.aspect)/0.54,0,1):0;/* 0 on a landscape screen, 1 on a tall phone held upright (Prototype 40) */
    if(S.state==='done'&&finCam.t0!=null){/* finish: swing round to the front of the ship and look back at it */
      const k=clamp((S.t-finCam.t0)/2.2,0,1),e=k*k*(3-2*k),a=Math.PI*e*0.85+(S.t-finCam.t0)*0.12,side=new V3().crossVectors(camFwdS,camUpS).normalize();
      const d=7.4-1.2*e,off=new V3().copy(camFwdS).multiplyScalar(-Math.cos(a)*d).addScaledVector(side,Math.sin(a)*d*finCam.dir).addScaledVector(camUpS,2.7-0.6*e);
      camera.position.copy(pPos).add(off);camera.up.copy(camUpS);camera.lookAt(look.copy(pPos).addScaledVector(camUpS,0.6));camera.fov+=(62-camera.fov)*Math.min(1,dt*3)}
    else if(C.fpv){camera.position.copy(pPos).addScaledVector(pUp,0.62).addScaledVector(pf,0.7);
      if(S.shake>0)camera.position.addScaledVector(pRight,(Math.random()-.5)*S.shake*0.3).addScaledVector(pUp,(Math.random()-.5)*S.shake*0.25);
      camera.up.copy(camUpS);camera.lookAt(look.copy(camera.position).addScaledVector(camFwdS,40).addScaledVector(camUpS,-0.6));
      camera.fov+=((76+16*vk+(boo?6:0)+12*pk)-camera.fov)*Math.min(1,dt*4)}
    else{const d=(C.d+0.9*vk+(boo?0.5:0))*(1+0.3*pk);
      camera.position.copy(pPos).addScaledVector(camFwdS,-d).addScaledVector(camUpS,C.h*(1+0.2*pk));
      if(S.shake>0)camera.position.addScaledVector(pRight,(Math.random()-.5)*S.shake*0.8).addScaledVector(pUp,(Math.random()-.5)*S.shake*0.5);
      camera.up.copy(camUpS);
      camera.lookAt(look.copy(pPos).addScaledVector(camFwdS,C.l).addScaledVector(camUpS,0.8));
      camera.fov+=((68+18*vk+(boo?7:0)+14*pk)-camera.fov)*Math.min(1,dt*4)}
  }
  camInit=true;camera.updateProjectionMatrix();
  if(SPL.race&&S.state!=='menu')splStep(dt);
  if(mp.on&&S.state!=='menu')mpTags();

  if(S.state!=='menu'){
    $('spd').textContent=Math.round(player.v*3.6);$('spd').classList.toggle('boost',player.boost>0||!!player.selfBoost);
    $('spdBar').style.width=clamp(player.v/(VMAX*1.32),0,1)*100+'%';
    {const th=$('trimHint');let hk='';if(T.marks&&!T.cx&&S.state==='race'){for(const m of T.marks){const d=wrapU(m.lo*T.ds-player.u);if(d>-(m.hi-m.lo)*T.ds&&d<170){hk=m.type;break}}}
      if(th._k!==hk){th._k=hk;th.className=hk==='up'?'grip':hk;th.textContent={dive:'DOWNHILL · NOSE DOWN ▼',up:'UPHILL · NOSE UP ▲',grip:'CORNER · NOSE UP ▲','':''}[hk]}}
    {const tr=$('trim'),p=player.pitch,tb=player.trimB||0,tq=player.trimP||0,k=player.emp>0?'emp':player.od>0?'od':player.autoT>0?'ap'+Math.ceil(player.autoT*10):player.air?'air':player.trimUp&&(player.slopeG||0)>0.2?(player.climb>1.6?'cd':'cu'):tb>0.01?(player.trimUp?'tu':'td')+Math.round(tb*100):tq>0.008?(p>0?'tpu':'tpd')+Math.round(tq*100):p>0.15?'up':'';if(tr._k!==k){tr._k=k;const dn=k.startsWith('td'),ap=k.startsWith('ap'),n=+k.replace(/^\D+/,'')||0;tr.className=dn?'dn':ap?'ap':k.startsWith('tu')||k==='cu'?'up':k.startsWith('tp')||k==='cd'?'scr':k;
        if(ap){const sec=+k.slice(2)/10;tr.textContent='AUTOPILOT · '+sec.toFixed(1)+' s';if(sec<=3&&Math.abs(sec-Math.round(sec))<0.05&&sec>0)audio.blip(sec>1?620:880,0.12,0.09,'triangle')}else tr.textContent={emp:'',od:'OVERDRIVE',ap:'AUTOPILOT',air:'',up:'▲ GRIP',cu:'▲ CLIMBING',cd:'▲ NOSE UP · CLIMB DRAG','':''}[k]??(k.startsWith('tu')?'▲ TRACTION +'+n+'%':k.startsWith('td')?'▼ STREAMLINE +'+n+'%':(k.startsWith('tpu')?'▲':'▼')+' DRAG −'+n+'%')}}
    threatHud();
    $('lapN').textContent=Math.min(LAPS,player.done+1);if(lapT0!==LAPS){lapT0=LAPS;$('lapT').textContent='/'+LAPS}$('time').textContent=fmt(player.finishT??Math.max(0,S.raceT));
    hudT-=dt;if(hudT<=0){hudT=0.1;const rk=rankOf(player);$('posN').textContent=rk+1;drawMini();
      if(S.state==='race'&&lastRank>=0&&rk<lastRank)music.event('overtake');lastRank=rk;
      music.sense({steer:Math.abs(player.steerS),brake:player.brk,boost:player.boost>0||player.selfBoost?1:0,rank:racers.length>1?rk/(racers.length-1):0,speed:clamp(player.v/VMAX,0,1)});
      const hpF=player.hp/player.d.hp,amF=player.ammo/player.d.ammo;$('hpBar').style.width=(hpF*100).toFixed(1)+'%';$('amBar').style.width=(amF*100).toFixed(1)+'%';
      $('hpM').classList.toggle('low',hpF<0.25&&player.wreck<=0);$('hpM').classList.toggle('chg',player.charging==='hp');$('amM').classList.toggle('chg',player.charging==='ammo');
      if(hpF<0.25&&!lowWarn&&player.wreck<=0&&S.state==='race'){lowWarn=true;if(!audio.sfx('low')){audio.blip(980,0.1,0.1,'square');setTimeout(()=>audio.blip(980,0.1,0.1,'square'),160)}}else if(hpF>0.35)lowWarn=false;
      const emp=player.emp>0;$('amM').classList.toggle('empty',S.state==='race'&&player.wreck<=0&&player.ammo<minCost(player));$('bst').classList.toggle('emp',emp);
      for(let k=0;k<2;k++){const w=player.weapons[k],d=WDEF[w],dir=w==='missile'?(targetAhead(player,260)?' ▲':targetBehind(player,200)?' ▼':''):'';
        const rdy=player.ammo>=d.cost&&player.wreck<=0&&!emp,b=$('w'+(k+1)),sub=d.passive?'passive':S.raceT<WLOCK?Math.ceil(WLOCK-S.raceT)+' s':d.cost+dir;const bh=`${icon(w)}<small>${sub}</small>`;if(b._h!==bh){b._h=bh;b.innerHTML=bh;b.setAttribute('aria-label',d.name)}b.classList.toggle('rdy',rdy&&!d.passive&&S.raceT>=WLOCK);b.classList.toggle('emp',emp&&!d.passive);
        const act=k?'w2':'w1',kb=actLabel(act),locked=S.raceT<WLOCK&&S.state!=='menu',sl=$('s'+(k+1));
        const sh=`<kbd class="${lastDev==='pad'?padCls(bind.pad[act]):''}">${lastDev==='pad'?padFace(bind.pad[act]):esc(kb)}</kbd>${icon(w)}<small>${sub}</small>`;if(sl._h!==sh){sl._h=sh;sl.innerHTML=sh;sl.title=d.name}sl.classList.toggle('rdy',rdy&&!locked&&!d.passive);sl.classList.toggle('emp',emp&&!d.passive);sl.classList.toggle('hold',S.t-slotLast[k]<0.25&&w==='cannon')}}
  }
  if(QK.live)qkHud(dt);
}
function flash(color,side){const f=$('flash');f.style.background=side===0?`radial-gradient(ellipse at center,transparent 45%,${color} 100%)`:`linear-gradient(${side>0?'270deg':'90deg'},${color},transparent 35%)`;f.style.transition='none';f.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .35s';f.style.opacity=0}))}

