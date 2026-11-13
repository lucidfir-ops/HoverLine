//# track/006-track-preview.js: the 3D track preview on the track page
/* ---------- 3D track preview ----------
   A slowly turning 3D sketch of the track in the menu and the lobby: the road as a ribbon (drawn twice as wide as it is,
   heights a little exaggerated) over its own shadow, with the energy strips, boost pads, start line and feature names.
   Drag it to turn it and tip it; it starts turning again on its own a few seconds later. */
const pv3={yaw:0.6,tilt:0.5,drag:null,idle:99,acc:0,data:null,fit:null};
function pv3Build(){const n=Math.min(420,T.N),step=T.N/n,pts=[],c=new THREE.Vector3();for(const p of T.P)c.add(p);c.divideScalar(T.N);
  let rad=1;const zc=new Array(n).fill(null),gp=new Uint8Array(n);
  for(let k=0;k<n;k++){const i=Math.floor(k*step),p=T.P[i],r=T.R[i],u=T.U[i];pts.push({x:p.x-c.x,y:(p.y-c.y)*1.8,z:p.z-c.z,rx:r.x,ry:r.y*1.8,rz:r.z,uy:u.y});rad=Math.max(rad,Math.hypot(p.x-c.x,p.z-c.z));
    const uu=i*T.ds;for(const z of T.zones)if(!z.laneF&&uu>=z.u0&&uu<=z.u1)zc[k]=z.kind==='hp'?'#46ff8c':'#be5aff';if(T.gap[i]||T.spl[i])gp[k]=1;
    /* (Prototype 63: no ribbon across a portal's break) */if(T.brk)for(let q=i;q<Math.floor((k+1)*step);q++)if(T.brk[q])gp[k]=1}
  /* split routes: their own ribbons, beside the main one */
  const br=[];for(const S0 of T.splits)for(const B of S0.b){const q=[];for(let k=0;k<=S0.n;k+=Math.max(1,Math.round(step))){const i=S0.i0+k,p=T.P[i],r=T.R[i],u=T.U[i],x=p.x+r.x*B.c[k]+u.x*B.h[k],y=p.y+r.y*B.c[k]+u.y*B.h[k],z=p.z+r.z*B.c[k]+u.z*B.h[k];
    q.push({x:x-c.x,y:(y-c.y)*1.8,z:z-c.z,rx:r.x,ry:r.y*1.8,rz:r.z,uy:u.y})}br.push(q)}
  const yMin=Math.min(...pts.map(q=>q.y))-rad*0.08,lab=T.feats.map(f=>{const p=sampleAt((f.u0+f.u1)/2).p;return{t:(f.kind==='helix'?'spiral':f.kind).toUpperCase(),x:p.x-c.x,y:(p.y-c.y)*1.8+T.D.w*2,z:p.z-c.z}});
  const pads=T.pads.map(q=>{const p=sampleAt((q.u0+q.u1)/2).p;return{x:p.x-c.x,y:(p.y-c.y)*1.8,z:p.z-c.z}});
  pv3.data={pts,zc,gp,rad,yMin,lab,pads,br,hw:Math.max(T.D.w,rad*0.022)};pv3.fit=null}
function pv3Draw(cv,dt){const d=pv3.data;if(!d||!cv)return;const dpr=Math.min(devicePixelRatio||1,2),w=Math.round((cv.clientWidth||260)*dpr),h=Math.round((cv.clientHeight||190)*dpr);
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  pv3.idle+=dt;if(pv3.drag==null&&pv3.idle>3)pv3.yaw+=dt*0.3;
  const g=cv.getContext('2d'),cy=Math.cos(pv3.yaw),sy=Math.sin(pv3.yaw),ct=Math.cos(pv3.tilt),st=Math.sin(pv3.tilt),D=d.rad*2.4;
  const raw=(x,y,z)=>{const X=x*cy-z*sy,Z0=x*sy+z*cy,Y=y*ct-Z0*st,Z=y*st+Z0*ct,f=D/(D+Z);return[X*f,-Y*f,Z]};
  // fit the sketch to the box at this angle (eased, so it breathes rather than jumps while turning)
  {let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let k=0;k<d.pts.length;k+=3){const q=d.pts[k];for(const yy of[q.y,d.yMin]){const a=raw(q.x,yy,q.z);x0=Math.min(x0,a[0]);x1=Math.max(x1,a[0]);y0=Math.min(y0,a[1]);y1=Math.max(y1,a[1])}}
    const pad=d.hw*3,tgt=[Math.min((w*0.92)/(x1-x0+pad*2),(h*0.86)/(y1-y0+pad*2)),(x0+x1)/2,(y0+y1)/2];
    if(!pv3.fit||dt===0)pv3.fit=tgt;else{const e=Math.min(1,dt*3);for(let i=0;i<3;i++)pv3.fit[i]+=(tgt[i]-pv3.fit[i])*e}}
  const[sc,mx,my]=pv3.fit;
  const pr=(x,y,z)=>{const a=raw(x,y,z);return[w/2+(a[0]-mx)*sc,h/2+(a[1]-my)*sc,a[2]]};
  g.clearRect(0,0,w,h);
  // shadow of the course on the ground, so heights read
  g.beginPath();d.pts.forEach((q,k)=>{const a=pr(q.x,d.yMin,q.z);k?g.lineTo(a[0],a[1]):g.moveTo(a[0],a[1])});g.closePath();g.strokeStyle='rgba(255,176,0,.10)';g.lineWidth=5*dpr;g.stroke();
  // posts from the road down to its shadow, so climbs and drops read as height
  g.strokeStyle='rgba(255,176,0,.16)';g.lineWidth=1*dpr;g.beginPath();for(let k=0;k<d.pts.length;k+=10){const q=d.pts[k];if(q.y-d.yMin<d.rad*0.04)continue;const a=pr(q.x,q.y,q.z),b=pr(q.x,d.yMin,q.z);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])}g.stroke();
  const quads=[],n=d.pts.length,hw=d.hw;
  for(let k=0;k<n;k++){if(d.gp[k])continue;const a=d.pts[k],b=d.pts[(k+1)%n];
    const A=pr(a.x-a.rx*hw,a.y-a.ry*hw,a.z-a.rz*hw),B=pr(a.x+a.rx*hw,a.y+a.ry*hw,a.z+a.rz*hw),C=pr(b.x+b.rx*hw,b.y+b.ry*hw,b.z+b.rz*hw),E=pr(b.x-b.rx*hw,b.y-b.ry*hw,b.z-b.rz*hw);
    quads.push({A,B,C,E,z:(A[2]+B[2]+C[2]+E[2])/4,k,up:a.uy})}
  for(const q of d.br||[])for(let k=0;k+1<q.length;k++){const a=q[k],b=q[k+1],h2=hw*0.55;
    const A=pr(a.x-a.rx*h2,a.y-a.ry*h2,a.z-a.rz*h2),B=pr(a.x+a.rx*h2,a.y+a.ry*h2,a.z+a.rz*h2),C=pr(b.x+b.rx*h2,b.y+b.ry*h2,b.z+b.rz*h2),E=pr(b.x-b.rx*h2,b.y-b.ry*h2,b.z-b.rz*h2);
    quads.push({A,B,C,E,z:(A[2]+B[2]+C[2]+E[2])/4,k:-1,up:a.uy})}
  quads.sort((p,q)=>q.z-p.z);
  for(const q of quads){g.beginPath();g.moveTo(q.A[0],q.A[1]);g.lineTo(q.B[0],q.B[1]);g.lineTo(q.C[0],q.C[1]);g.lineTo(q.E[0],q.E[1]);g.closePath();
    const zc=q.k>=0?d.zc[q.k]:null;if(zc){g.fillStyle=zc}else{const l=Math.round(30+22*Math.max(0,q.up));g.fillStyle=`rgb(${l},${l+3},${l+9})`}g.fill();
    g.strokeStyle='rgba(255,176,0,.9)';g.lineWidth=1.1*dpr;g.beginPath();g.moveTo(q.A[0],q.A[1]);g.lineTo(q.E[0],q.E[1]);g.moveTo(q.B[0],q.B[1]);g.lineTo(q.C[0],q.C[1]);g.stroke()}
  for(const p of d.pads){const a=pr(p.x,p.y,p.z);g.fillStyle='#3ff0ff';g.beginPath();g.arc(a[0],a[1],3*dpr,0,TAU);g.fill()}
  {const a=d.pts[0],L=pr(a.x-a.rx*hw*1.6,a.y-a.ry*hw*1.6,a.z-a.rz*hw*1.6),R=pr(a.x+a.rx*hw*1.6,a.y+a.ry*hw*1.6,a.z+a.rz*hw*1.6);g.strokeStyle='#f2efe6';g.lineWidth=3*dpr;g.beginPath();g.moveTo(L[0],L[1]);g.lineTo(R[0],R[1]);g.stroke()}
  g.font=`700 ${10*dpr}px 'Chakra Petch',system-ui,sans-serif`;g.textAlign='center';
  // feature names, nearest first, skipping any that would overlap one already drawn
  const boxes=[];for(const{l,a}of d.lab.map(l=>({l,a:pr(l.x,l.y,l.z)})).sort((p,q)=>p.a[2]-q.a[2])){const tw=g.measureText(l.t).width+8*dpr,bx=[a[0]-tw/2,a[1]-11*dpr,tw,14*dpr];
    if(boxes.some(b=>bx[0]<b[0]+b[2]&&b[0]<bx[0]+bx[2]&&bx[1]<b[1]+b[3]&&b[1]<bx[1]+bx[3]))continue;boxes.push(bx);
    g.fillStyle='rgba(9,11,16,.7)';g.fillRect(bx[0],bx[1],bx[2],bx[3]);g.fillStyle='#f2efe6';g.fillText(l.t,a[0],a[1])}}
for(const id of['preview','mpPreview','edPreview']){const cv=$(id);
  cv.addEventListener('pointerdown',e=>{pv3.drag=[e.clientX,e.clientY];try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  cv.addEventListener('pointermove',e=>{if(!pv3.drag)return;pv3.yaw-=(e.clientX-pv3.drag[0])*0.01;pv3.tilt=clamp(pv3.tilt+(e.clientY-pv3.drag[1])*0.006,0.15,1.45);pv3.drag=[e.clientX,e.clientY];pv3.idle=0});
  const up=()=>{pv3.drag=null;pv3.idle=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
/* Called whenever the track changes: rebuilds the 3D sketch and the stats line under it. */
function drawPreview(cid='preview',sid='stats'){pv3Build();pv3Draw($(cid),0);
  const st=T.stats;$('lenLbl').textContent='';
  const fc={};for(const f of T.feats){const k=f.rev?'vspire':f.down?'dhelix':f.kind;fc[k]=(fc[k]||0)+1}const FN={vspire:['rising spire','rising spires'],dhelix:['down spiral','down spirals'],drop:['drop','drops'],sjump:['speed jump','speed jumps'],cjump:['long jump','long jumps'],loop:['loop','loops'],corkscrew:['corkscrew','corkscrews'],twist:['twist','twists'],jump:['jump','jumps'],dive:['dive','dives'],sweep:['sweep','sweeps'],climb:['climb','climbs'],helix:['spiral','spirals'],split:['split','splits'],spire:['spire','spires'],flip:['underside','undersides']};
  const fl=Object.entries(fc).map(([k,n])=>`${n} ${(FN[k]||[k,k])[n>1?1:0]}`).join(' · ');
  $(sid).innerHTML=`<b>${T.D.name}</b> · ${T.cx?'Complex'+(T.theme?' ('+T.theme+')':''):'Simple'}${T.fig8?' · Figure 8':''} · ${T.LN.name} · ${W} m wide · ${(T.L/1000).toFixed(2)} km<br>${fl?fl+' · ':''}${st.corners} corner${st.corners===1?'':'s'} · ${Math.round(st.climb)} m climb<br>${T.bmInfo||''}`}
let miniBase=null,miniMap=null;
function buildMini(){const c=$('mini'),dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round((c.clientWidth||110)*dpr);c.height=Math.round((c.clientHeight||110)*dpr);
  miniBase=document.createElement('canvas');miniBase.width=c.width;miniBase.height=c.height;const g=miniBase.getContext('2d');miniMap=mapper(c,8*dpr);
  drawPath(g,miniMap,5*dpr,'rgba(0,0,0,.55)');drawPath(g,miniMap,2*dpr,'rgba(255,176,0,.75)');for(const z of T.zones)drawZone(g,miniMap,z,3.5*dpr)}
function drawMini(){const c=$('mini');if(!miniBase||c.width!==miniBase.width)buildMini();const g=c.getContext('2d'),dpr=c.width/(c.clientWidth||110);
  g.clearRect(0,0,c.width,c.height);g.drawImage(miniBase,0,0);
  for(const r of racers){const S0=sampleAt(r.u),q=miniMap(S0.p.x+S0.r.x*r.lat,S0.p.z+S0.r.z*r.lat);g.fillStyle=r.css;g.strokeStyle=r.css;g.lineWidth=1.5*dpr;g.beginPath();g.arc(q[0],q[1],(r===player?4.5:3)*dpr,0,TAU);if(r.isGhost)g.stroke();else g.fill();
    if(r===player){g.strokeStyle='#000';g.lineWidth=1.5*dpr;g.stroke()}}}

