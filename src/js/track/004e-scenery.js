//# track/004e-scenery.js: the scenery's shared part: the context each biome's builder gets, what biomes share (pylons, spire frames, spiral middles, falls, geysers, sky, tunnels, the road-space test), the table of builders, and the moving parts
/* ---------- scenery ----------
   One setting for the whole track: Urban (neon-edged blocks over a grid), Ocean (a flat sea, sandy islands, whitecaps),
   Forest (giant cyber trees the road weaves between), Prism (a mountain range with caverns) or Stratos (high above everything: stars above and below at night,
   clouds below by day, a few floating slabs; called Night sky before Prototype 31). Dials
   set how much scenery there is, and how many falls (water or lava pouring out of a rare block), geysers and tunnels.
   Nothing is built within a wide margin of any part of the road.

   Prototype 61 (the split of 004-track.js): each biome has a builder of its own, in the parts after this one, listed in
   SCENERY by its letter. buildScenery(rd,bm) makes the context (sceneryCtx), runs the biome's builder with it, then makes
   the moving parts (falls, geysers, whitecaps, jellyfish, kelp, fish, mantas) from what the builder left in the context,
   and the line that describes the scenery (T.bmInfo). A builder only adds to the scene and the context; nothing it does
   reaches another biome. To add a biome: see docs/ARCHITECTURE.md, "Adding a biome".

   The context (ctx), what a builder gets:
   - the road (read only): seed, N, ds; per sample P, R, U, Tg (centreline and frame), kind, gap, spl (feature, jump gap,
     split), mag, ctop (mag-lock, catch fence top), Kn, Kg (curvature); splits, feats, jumps; signI, gantI (where the split
     signs and gantries stand); the bounds minX maxX minY maxY minZ maxZ and their centre cxT, czT. (W is global.)
   - drawing: group (the track's group: add to it in the order things have always been added), add(geometry, material),
     strip(latA, hA, latB, hB, o) (a strip along the road in its frame, o.from/o.to samples), basis(i), dark (material)
   - the setting: bk (its letter), LK (its look, BIOMES or BIOMES_DAY), day, dial, dens, nFall, nGey, nTun (the dials,
     after low detail); floorY (the ground: 70 m under the lowest road; a builder may set another first thing)
   - er: the scenery's random numbers. One stream for the builder and the shared parts it calls, so a builder calls them
     in the order it always has, and only ever adds new draws after all the old ones (or uses an rng of its own, as the
     city and Prism do): every number drawn later would move otherwise, and with it every later tree, island or geyser
   - building blocks: lam(colour, emissive) (a Lambert material), BOX, IM(material, boxes) (one instanced mesh of boxes
     {x,y,z,sx,sy,sz,ry,c}), lines(boxes, material) (their edges); lnA, lnB, lnBio (amber, blue-grey and the biome's edge
     colour); winTex (the city's windows), lightTex (a tunnel's ceiling lights)
   - room: near(x,z,R) (the nearest road point within R sideways: {d,q,hi,lo}, hi and lo the highest and lowest road there;
     from the grid KP, KG, CELL, kk); solid, free(x,z,r), claim(x,z,r) (round footprints taken); side(i,sd,d) (the point d m
     to one side of sample i)
   - shared parts, each called by the builders that have it: pylons(ground, width, material, step), spireFrames(colours,
     base), helixMiddles(fn) (fn gets each spiral's middle {cx0,cz0,rt,rc,top} and may return a box; default a monolith),
     falls(o), geysers(o), dome(canvas), daySky(o), starSky(o), buildTunnels(o), roadSpace(flag) (the road-space test:
     {scan, tilt, inRoad, clearTri}), pl(n, word) ("2 lakes")
   - what a builder leaves: fallsL, geys (falls and geysers, which the moving parts animate), caps, jel, kelp, fish,
     schools, mantas (moving creatures and whitecaps), tunnels, tun; and it may set water (T.mats.water), sky (the dome),
     prism (T.prism), inside(x,y,z) (the haze turns dark where it's true), clock (uniforms set to the time each frame),
     info (more for bmInfo), geyName (bmInfo's word for a geyser), gCol (geyser particle colours), plainFx (unlit falls
     and geysers), jelSoft (see-through jellyfish), bubbles (geysers rise as bubbles) */
const SCENERY={U:sceneryAll,O:sceneryAll,F:sceneryAll,N:sceneryAll,R:sceneryAll,P:sceneryAll};
function sceneryCtx(rd,bm){const{seed,N,P,Tg,ds,R,U,gap,kind,feats,Kg,jumps,splits,spl,Kn,group,strip,add,dark,mag,ctop,basis,signI,gantI,minY,minX,maxX,minZ,maxZ,maxY}=rd;
  const bk=bm&&BIOMES[bm.k]?bm.k:'U',dial=bm&&bm.d?bm.d.slice():bioDefaults(seed,bk),[dens0,nFall0,nGey0,nTun]=dial,nFall=RES.low?0:nFall0,nGey=RES.low?0:nGey0,dens=RES.low?Math.min(1,dens0):dens0,LK=lookOf(bk),day=!!LK.day;
  const er=rng((seed^0xE7A1)>>>0),cxT=(minX+maxX)/2,czT=(minZ+maxZ)/2;
  const lnA=new THREE.LineBasicMaterial({color:0xffb000}),lnB=new THREE.LineBasicMaterial({color:0x2b3d52}),lnBio=new THREE.LineBasicMaterial({color:LK.edge});
  const lam=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0}),BOX=new THREE.BoxGeometry(1,1,1);
  const IM=(mat,list)=>{if(!list.length)return null;const m=new THREE.InstancedMesh(BOX,mat,list.length),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Sv=new THREE.Vector3(),Pv=new THREE.Vector3(),C=new THREE.Color();
    list.forEach((o,k)=>{Q.setFromAxisAngle(AX_Y,o.ry||0);Pv.set(o.x,o.y,o.z);Sv.set(o.sx,o.sy,o.sz);M4.compose(Pv,Q,Sv);m.setMatrixAt(k,M4);m.setColorAt(k,C.setHex(o.c==null?0xffffff:o.c))});
    m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;group.add(m);return m};
  /* the twelve edges of every box in a list, merged into one line set */
  const EDG=[[-1,-1,-1,1,-1,-1],[1,-1,-1,1,-1,1],[1,-1,1,-1,-1,1],[-1,-1,1,-1,-1,-1],[-1,1,-1,1,1,-1],[1,1,-1,1,1,1],[1,1,1,-1,1,1],[-1,1,1,-1,1,-1],[-1,-1,-1,-1,1,-1],[1,-1,-1,1,1,-1],[1,-1,1,1,1,1],[-1,-1,1,-1,1,1]];
  const lines=(list,mat)=>{if(!list.length)return;const A=[];for(const o of list){const c=Math.cos(o.ry||0),sn=Math.sin(o.ry||0);for(const e of EDG)for(const q of[0,3]){const lx=e[q]*o.sx/2,ly=e[q+1]*o.sy/2,lz=e[q+2]*o.sz/2;A.push(o.x+lx*c+lz*sn,o.y+ly,o.z-lx*sn+lz*c)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(A),3));group.add(new THREE.LineSegments(g,mat))};
  /* the road on a coarse grid: near(x,z,R) is the closest piece of road within R (sideways), with the highest and lowest road there */
  const KP=[],KG=new Map(),CELL=64,kk=(a,b)=>a*65537+b;
  const kAdd=q=>{const key=kk(Math.floor(q.x/CELL),Math.floor(q.z/CELL));let a=KG.get(key);if(!a)KG.set(key,a=[]);a.push(KP.length);KP.push(q)};
  for(let i=0;i<N;i+=3)kAdd(P[i]);for(const S0 of splits)for(const q of S0.pts)kAdd(q);
  const near=(x,z,R)=>{let bd=R*R,b=null,hi=-1e9,lo=1e9;const c0=Math.floor((x-R)/CELL),c1=Math.floor((x+R)/CELL),d0=Math.floor((z-R)/CELL),d1=Math.floor((z+R)/CELL);
    for(let a=c0;a<=c1;a++)for(let c=d0;c<=d1;c++){const Lc=KG.get(kk(a,c));if(Lc)for(const k of Lc){const q=KP[k],dx=q.x-x,dz=q.z-z,d=dx*dx+dz*dz;if(d<R*R){hi=Math.max(hi,q.y);lo=Math.min(lo,q.y)}if(d<bd){bd=d;b=q}}}return b?{d:Math.sqrt(bd),q:b,hi,lo}:null};
  const solid=[],free=(x,z,rad)=>solid.every(o=>(o.x-x)**2+(o.z-z)**2>(o.r+rad)**2),claim=(x,z,rad)=>solid.push({x,z,r:rad});
  /* a point d metres out to one side of sample i */
  const side=(i,sd,d)=>{const t=Tg[i],l=Math.hypot(t.x,t.z)||1;return[P[i].x-t.z/l*sd*d,P[i].z+t.x/l*sd*d]};
  const winTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),wr=rng((seed^0x3131)>>>0);g.fillStyle='#07090d';g.fillRect(0,0,128,128);
    for(let y=6;y<128;y+=12)for(let x=6;x<128;x+=10){const v=wr();if(v<0.42){g.fillStyle=v<0.05?'#c98a00':v<0.1?'#2bb8c4':v<0.2?'#26354a':'#141c28';g.fillRect(x,y,6,7)}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
  const lightTex=(()=>{const c=document.createElement('canvas');c.width=16;c.height=64;const g=c.getContext('2d');g.fillStyle='#05070a';g.fillRect(0,0,16,64);g.fillStyle='#ffe2a0';g.fillRect(2,0,12,10);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
  /* what the builders leave for the moving parts, T and bmInfo */
  const fallsL=[],geys=[],caps=[],jel=[],kelp=[],fish=[],schools=[],mantas=[],tunnels=[],tun=new Uint8Array(N),pl=(n,w)=>n+' '+w+(n===1?'':'s');
  /* the pylons that hold the road up (none in Stratos; Prism builds its columns once its ground is known) */
  const pylons=(gnd,wid,mat,step)=>{const st=Math.round((step||110)/ds);const pyM=mat||lam(0x12151b);
    /* a pylon never stands on another piece of road: not the main line (outside splits and gaps, where it isn't drawn) and
       not either route of any split, so a crossover's legs can't stand in the road it passes over. (Before Prototype 33
       only the long routes were checked, so a crossover's legs could stand in its own short route.) */
    const rQ=[];for(const S0 of splits)for(const B of S0.b)for(let k=0;k<=S0.n;k+=Math.max(1,Math.round(6/ds))){const i=(S0.i0+k)%N;rQ.push({p:P[i].clone().addScaledVector(R[i],B.c[k]).addScaledVector(U[i],B.h[k]),r2:(B.w[k]+6)**2})}
    const under=(p,i)=>{for(let j=0;j<N;j+=3){if(spl[j]||gap[j])continue;const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<60/ds)continue;const q=P[j];if(q.y<p.y-3&&(q.x-p.x)**2+(q.z-p.z)**2<(W/2+6)**2)return true}
      for(const S0 of splits)for(const q of S0.pts)if(q.y<p.y-3&&(q.x-p.x)**2+(q.z-p.z)**2<(W/2+9)**2)return true;
      for(const{p:q,r2}of rQ)if(q.y<p.y-3&&(q.x-p.x)**2+(q.z-p.z)**2<r2)return true;return false};
    /* all the pylons are one instanced mesh: one draw call instead of one each */
    const pyl=[];
    const wd=wid||2.2,col=(p,i)=>{if(under(p,i))return;const g=gnd(p.x,p.z),h=p.y-1.8-g;if(h>3)pyl.push({x:p.x,y:g+h/2,z:p.z,sx:wd,sy:h,sz:wd})};
    for(let i=0;i<N;i+=st){if(kind[i]||gap[i]||spl[i]||U[i].y<0.85)continue;col(P[i],i)}
    for(const S0 of splits)for(const B of S0.b)for(let k=Math.round(st/2);k<S0.n;k+=st){const i=S0.i0+k;col(P[i].clone().addScaledVector(R[i],B.c[k]).addScaledVector(U[i],B.h[k]),i)}
    IM(pyM,pyl)};
  /* spires: an open frame round the drop, four pillars and beams, with gaps where the road goes in at the top and out at the bottom */
  const spireFrames=(col,bot)=>{const floorY=ctx.floorY,frames=[];
  for(const f of feats){if(f.kind!=='spire'||!f.ax)continue;const[ax,az]=f.ax,[fx,fz]=f.fh,rx=fz,rz=-fx,a=W/2+9,base=bot?bot(f):floorY,topY=f.top+18,ry=Math.atan2(fx,fz);
    for(const sx of[-1,1])for(const sz of[-1,1])frames.push({x:ax+fx*sz*a+rx*sx*a,y:(base+topY)/2,z:az+fz*sz*a+rz*sx*a,sx:4,sy:topY-base,sz:4,ry});
    for(let y=base+26;y<topY-4;y+=22){const backBad=y>f.top-f.v1-14&&y<f.top+14,frontBad=y>f.bot-8&&y<f.bot+f.v2+14;
      for(const sx of[-1,1])frames.push({x:ax+rx*sx*a,y,z:az+rz*sx*a,sx:2.4,sy:2.4,sz:2*a,ry});
      if(!backBad)frames.push({x:ax-fx*a,y,z:az-fz*a,sx:2*a,sy:2.4,sz:2.4,ry});if(!frontBad)frames.push({x:ax+fx*a,y,z:az+fz*a,sx:2*a,sy:2.4,sz:2.4,ry})}
    claim(ax,az,a+8);claim(f.c[0],f.c[1],f.Rs+W)}
  if(frames.length){IM(lam(...(col||[0x23272f,0x08090c])),frames);lines(frames,lnBio)}};
  /* the middle of every spiral: a tower in the city, a tree in the forest, an island and lighthouse at sea, a monolith in the night */
  const monolith=({cx0,cz0,rt,top})=>{const h=top+90-(minY-200);return{x:cx0,y:minY-200+h/2,z:cz0,sx:rt*0.7,sy:h,sz:rt*0.7,ry:er()*3,c:0x0d0f16}};
  const helixMiddles=(fn=monolith)=>{const helixB=[];
  for(const f of feats){if(f.kind!=='helix')continue;const a2=Math.floor(f.u0/ds),b2=Math.ceil(f.u1/ds);let cxs=0,czs=0,n=0,top=-1e9;for(let k=a2;k<=b2;k++){const q=P[((k%N)+N)%N];cxs+=q.x;czs+=q.z;n++;top=Math.max(top,q.y)}if(!n)continue;
    const cx0=cxs/n,cz0=czs/n;let rr=0;for(let k=a2;k<=b2;k+=4){const q=P[((k%N)+N)%N];rr+=Math.hypot(q.x-cx0,q.z-cz0)}rr/=Math.ceil((b2-a2+1)/4);const rt0=rr-W/2-9;if(rt0<12)continue;claim(cx0,cz0,rr+W);
    /* the middle piece keeps 6 m clear of every other part of the track that passes through the spiral's middle, above or
       below it (Prototype 33: before, the lap could come back through a city tower or a monolith); rc is the room there */
    let rc=1e9;for(let k=0;k<N;k+=2){if(gap[k]||spl[k])continue;const q=P[k];rc=Math.min(rc,Math.hypot(q.x-cx0,q.z-cz0)-W/2-6)}
    for(const S0 of splits)for(const B of S0.b)for(let k=0;k<=S0.n;k+=2){const i=(S0.i0+k)%N,q=P[i].clone().addScaledVector(R[i],B.c[k]);rc=Math.min(rc,Math.hypot(q.x-cx0,q.z-cz0)-B.w[k]-6)}
    const rt=Math.min(rt0,rc);if(rt<12)continue;
    const o=fn({cx0,cz0,rt,rc,top});if(o)helixB.push(o)}
  if(helixB.length){IM(lam(0xffffff,0x0a0b10),helixB);lines(helixB,lnBio)}};
  /* falls: water or lava pouring out of a rare block, from an opening near the top into a pool at its foot */
  const falls=(opt={})=>{const floorY=ctx.floorY,hang=!!opt.hang;
  const blocks=[],opens=[],poolsL=[],splash=[];
  for(let t=0;t<700&&fallsL.length<nFall;t++){const i=Math.floor(er()*N);if(spl[i]||kind[i])continue;const sd=er()<0.5?-1:1,d=W/2+100+er()*130,[x,z]=side(i,sd,d),w=46+er()*30,dp=34+er()*22,R0=Math.hypot(w,dp)/2;
    if(near(x,z,R0+W/2+45)||!free(x,z,R0+35))continue;const hiN=near(x,z,420),top=Math.max((hiN?hiN.hi:P[i].y)+60+er()*60,floorY+160),dir=Math.atan2(P[i].x-x,P[i].z-z),lava=er()<0.5,fw=12+er()*8;
    const base=hang?top-170-er()*60:floorY;blocks.push({x,y:(base+top)/2,z,sx:w,sy:top-base,sz:dp,ry:dir});
    const ox=Math.sin(dir),oz=Math.cos(dir),fx=x+ox*(dp/2),fz=z+oz*(dp/2),oy=top-20;
    opens.push({x:fx+ox*0.5,y:oy+6,z:fz+oz*0.5,sx:fw+5,sy:13,sz:1.2,ry:dir,c:lava?0xff7a2a:0x9fe4ff});
    fallsL.push({x:fx+ox*2.5,z:fz+oz*2.5,top:oy,bot:hang?base-80:floorY,w:fw,dir,lava});
    if(!hang){const px=fx+ox*17,pz=fz+oz*17;poolsL.push({x:px,y:floorY+0.3,z:pz,sx:fw+26,sy:0.6,sz:30,ry:dir,c:lava?0xff5a12:opt.poolC||0x2f8fd8});
      for(let k=0;k<10;k++)splash.push({x:px+(er()-.5)*(fw+22),y:floorY+0.6+er()*1.6,z:pz+(er()-.5)*24,sx:2+er()*3,sy:1+er()*2,sz:2+er()*3,ry:er()*3,c:lava?[0x1a0c08,0xff3a10,0xffb000][k%3]:[0xe0f6ff,0x7fd0ff,0xffffff][k%3]});claim(px,pz,22)}
    claim(x,z,R0+20)}
  if(blocks.length){IM(lam(0x1c2027,0x05060a),blocks);lines(blocks,lnBio);IM(new THREE.MeshBasicMaterial({color:0xffffff}),opens);IM(new THREE.MeshBasicMaterial({color:0xffffff}),poolsL);IM(lam(0xffffff,0x101418),splash)}};
  /* geysers: a vent beside the road that bursts every few seconds */
  const geysers=(opt={})=>{const floorY=ctx.floorY,hang=!!opt.hang;
  const vents=[];
  for(let t=0;t<700&&geys.length<nGey;t++){const i=Math.floor(er()*N);if(spl[i])continue;const sd=er()<0.5?-1:1,[x,z]=side(i,sd,W/2+60+er()*120);if(near(x,z,W/2+45)||!free(x,z,18))continue;
    const hiN=near(x,z,300),base=hang?(hiN?hiN.lo:P[i].y)-70-er()*40:floorY,h=Math.max(70,(hiN?hiN.hi:P[i].y)-base+25)+er()*45;
    geys.push({x,z,base,h,per:7+er()*5,ph:er()*12});
    vents.push(opt.vent?opt.vent(x,z,base):{x,y:floorY+1.5,z,sx:14,sy:3,sz:14,ry:er()*3,c:opt.ventC||0x23272f});claim(x,z,16)}
  if(vents.length){IM(lam(0xffffff,opt.ventE||0x050608),vents);if(!opt.flat)lines(vents,lnBio)}};
  /* the sky. By day: a blue dome with the sun where the light comes from, and clouds built from white blocks above the
     track (and below it too in the open sky). At night: stars and an aurora, all the way round in the night sky, above
     a dark horizon at sea; the city and forest keep the optional Starry sky effect. */
  const dome=sc=>{const skyM=new THREE.Mesh(new THREE.SphereGeometry(2600,64,32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),depthWrite:false,fog:false,side:THREE.BackSide}));skyM.renderOrder=-10;group.add(skyM);ctx.sky=skyM};
  const daySky=(opt={})=>{const sc=document.createElement('canvas');sc.width=1024;sc.height=512;const g=sc.getContext('2d'),gr=g.createLinearGradient(0,0,0,512),c6=LK.sky;
    gr.addColorStop(0,c6[0]);gr.addColorStop(0.3,c6[1]);gr.addColorStop(0.47,c6[2]);gr.addColorStop(0.5,c6[3]);gr.addColorStop(0.53,c6[4]);gr.addColorStop(1,c6[5]);g.fillStyle=gr;g.fillRect(0,0,1024,512);
    const sx=0.407*1024,sy=0.2*512,sg=g.createRadialGradient(sx,sy,0,sx,sy,120);sg.addColorStop(0,'rgba(255,252,236,1)');sg.addColorStop(0.08,'rgba(255,248,220,.95)');sg.addColorStop(0.3,'rgba(255,240,200,.28)');sg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=sg;g.fillRect(sx-130,sy-130,260,260);dome(sc);
    const cr=rng((seed^0xC10D)>>>0),cl=[],nCl=[8,12,16,20][dens];
    for(let k=0;k<nCl*(opt.below?2:1);k++){const below=opt.below&&k>=nCl,x=minX-600+cr()*(maxX-minX+1200),z=minZ-600+cr()*(maxZ-minZ+1200),y=below?minY-200-cr()*200:maxY+230+cr()*200,w=70+cr()*90,d=40+cr()*50,ry=cr()*3;
      cl.push({x,y,z,sx:w,sy:12+cr()*8,sz:d,ry,c:0xffffff});const nb=3+Math.floor(cr()*4);
      for(let b=0;b<nb;b++){const bw=w*(0.25+cr()*0.35),bd=d*(0.4+cr()*0.4),ox=(cr()-.5)*w*0.6,oz=(cr()-.5)*d*0.5,ca=Math.cos(ry),sa=Math.sin(ry);cl.push({x:x+ox*ca+oz*sa,y:y+10+cr()*12,z:z-ox*sa+oz*ca,sx:bw,sy:12+cr()*14,sz:bd,ry,c:0xffffff})}}
    IM(lam(0xffffff,0x7d8a96),cl)};
  const starSky=(opt={})=>{const sea=!!opt.sea,sc=document.createElement('canvas');sc.width=2048;sc.height=1024;const g=sc.getContext('2d'),rr=rng((seed^0x57A2)>>>0);g.fillStyle='#010207';g.fillRect(0,0,2048,1024);
    for(let k=0;k<3600;k++){const b=0.25+rr()*0.75;g.fillStyle=`rgba(${200+rr()*55|0},${205+rr()*50|0},255,${b})`;const sz=rr()<0.07?2:1;g.fillRect(rr()*2048,sea?rr()*rr()*520:rr()*1024,sz,sz)}
    for(const[col,y0,amp,fq,al]of[['70,255,170',300,38,3,1],['63,200,255',270,30,5,1],['190,90,255',330,26,4,1],...(sea?[]:[['70,255,170',724,30,3,0.4],['190,90,255',694,22,4,0.4]])])for(let x=0;x<2048;x+=2){const y=y0+Math.sin(x/2048*TAU*fq+fq)*amp+Math.sin(x/2048*TAU*fq*3.7)*amp*0.3,up=y0<512,gr=g.createLinearGradient(0,up?y-90:y+90,0,up?y+10:y-10);
      gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(0.75,`rgba(${col},${(0.10+0.06*Math.sin(x*0.01))*al})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x,up?y-90:y-10,2,100)}
    if(sea){const hz=g.createLinearGradient(0,470,0,540);hz.addColorStop(0,'rgba(10,40,60,0)');hz.addColorStop(0.6,'rgba(10,40,60,.55)');hz.addColorStop(1,'rgba(2,6,12,1)');g.fillStyle=hz;g.fillRect(0,470,2048,70);g.fillStyle='#02060c';g.fillRect(0,540,2048,484)}
    dome(sc)};
  /* ---------- tunnels ----------
     Long covered stretches (280-600 m) built from the road's own frame, so the walls, ceiling, roof and portals follow
     every bend and rise and can never cut across the road. Only on gentle stretches with nothing else on them, and only
     where no other part of the track passes anywhere near the shell. In the city the shell is a building that runs down
     to the ground; elsewhere it is a tube. */
  const buildTunnels=(opt)=>{if(!nTun)return;const floorY=ctx.floorY,bad=new Uint8Array(N),mk=(c,a,b)=>{for(let d=a;d<=b;d++)bad[((c+d)%N+N)%N]=1};
    for(let i=0;i<N;i++)if(kind[i]||gap[i]||spl[i]||mag[i]||ctop[i]>0||U[i].y<0.9||Math.abs(Kn[i])>0.003||Math.abs(Kg[i])>1/150)bad[i]=1;
    for(const g of gantI)mk(g,-Math.round(12/ds),Math.round(12/ds));
    for(const i of signI)mk(i,-6,6);
    for(const j of jumps)mk(Math.round(j.u0/ds),-Math.round(50/ds),Math.round((j.u1-j.u0+30)/ds));
    const grounded=!!opt.grounded,{sideW,roof}=opt.shell?opt.shell():{sideW:3.5,roof:3.5},Ht=9.5,lw=W/2+1.4,ow=lw+sideW;
    for(let q=0;q<nTun;q++){const want=Math.round((280+er()*320)/ds),minL=Math.round(220/ds);let best=null;
      for(let t=0;t<70&&!(best&&best.n>=want);t++){const i0=Math.floor(er()*N);if(bad[i0]||tun[i0])continue;let n=0;while(n<want&&!bad[(i0+n)%N]&&!tun[(i0+n)%N])n++;if(n<minL||(best&&n<=best.n))continue;
        let ok=true;const own0=i0-Math.round(80/ds),ownL=n+Math.round(160/ds);
        for(let k=0;k<n&&ok;k+=3){const a=P[(i0+k)%N];for(let j=0;j<N;j+=3){if(((j-own0)%N+N)%N<=ownL)continue;const b=P[j],dx=a.x-b.x,dz=a.z-b.z;if(dx*dx+dz*dz<(ow+W/2+16)**2&&(grounded?b.y<a.y+Ht+roof+26:Math.abs(a.y-b.y)<Ht+roof+26)){ok=false;break}}}
        if(ok)best={i0,n}}
      if(!best)continue;tunnels.push(best);for(let k=0;k<best.n;k++)tun[(best.i0+k)%N]=1;mk(best.i0,-Math.round(300/ds),best.n+Math.round(300/ds))}
    const TC=opt.TC;
    const innerM=new THREE.MeshLambertMaterial({color:TC[0],emissive:TC[1],side:THREE.DoubleSide}),ribM=new THREE.MeshBasicMaterial({color:TC[2],side:THREE.DoubleSide}),edgeL=new THREE.LineBasicMaterial({color:TC[2]});
    const ceilM=new THREE.MeshBasicMaterial({map:lightTex.clone(),side:THREE.DoubleSide});ceilM.map.needsUpdate=true;ceilM.map.repeat.set(1,1/12);
    for(const tn of tunnels){const i0=tn.i0,i1=tn.i0+tn.n,o={from:i0,to:i1},base=grounded?i=>floorY-P[i%N].y:-6;
      let avgH=0;for(let k=i0;k<=i1;k+=4)avgH+=Ht+roof-(grounded?floorY-P[k%N].y:-6);avgH/=Math.ceil((tn.n+1)/4);
      const outM=opt.outM?opt.outM(avgH):new THREE.MeshLambertMaterial({color:TC[0],emissive:TC[1],side:THREE.DoubleSide});
      add(strip(-lw,0,-lw,Ht,o),innerM);add(strip(lw,0,lw,Ht,o),innerM);add(strip(-lw,0,-W/2,0,o),dark);add(strip(W/2,0,lw,0,o),dark);
      add(strip(-lw,Ht,lw,Ht,{...o,uv:1}),ceilM);
      add(strip(-ow,base,-ow,Ht+roof,{...o,uv:1/14}),outM);add(strip(ow,base,ow,Ht+roof,{...o,uv:1/14}),outM);add(strip(-ow,Ht+roof,ow,Ht+roof,o),innerM);
      if(!grounded)add(strip(-ow,-6,ow,-6,o),innerM);
      for(const sd of[-1,1])add(strip(sd*(ow+0.05),Ht+roof-0.7,sd*(ow+0.05),Ht+roof+0.05,o),ribM);
      /* the two portals: the end of the shell, with a neon outline round the opening */
      const pq=[],pl=[],V3o=(i,l,h)=>{const k=((i%N)+N)%N,p=P[k],rr=R[k],uu=U[k];return[p.x+rr.x*l+uu.x*h,p.y+rr.y*l+uu.y*h,p.z+rr.z*l+uu.z*h]};
      const quad=(i,l0,l1,h0,h1)=>pq.push(...V3o(i,l0,h0),...V3o(i,l1,h0),...V3o(i,l1,h1),...V3o(i,l0,h0),...V3o(i,l1,h1),...V3o(i,l0,h1));
      for(const i of[i0,i1]){const b=grounded?floorY-P[((i%N)+N)%N].y:-6;quad(i,-ow,-lw,b,Ht+roof);quad(i,lw,ow,b,Ht+roof);quad(i,-lw,lw,Ht,Ht+roof);quad(i,-lw,lw,b,-1.8);
        for(const[a1,b1]of[[[-lw,0],[-lw,Ht]],[[-lw,Ht],[lw,Ht]],[[lw,Ht],[lw,0]],[[-ow,Ht+roof],[ow,Ht+roof]]])pl.push(...V3o(i,a1[0],a1[1]),...V3o(i,b1[0],b1[1]))}
      const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pq,3));pg.computeVertexNormals();group.add(new THREE.Mesh(pg,innerM));
      const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pl,3));group.add(new THREE.LineSegments(lg,edgeL));
      /* glowing ribs inside every 16 m */
      const ribs=[],M4=new THREE.Matrix4(),Sv=new THREE.Vector3(),Pv=new THREE.Vector3();
      for(let i=i0+4;i<i1-2;i+=Math.round(16/ds)){const k=i%N,qb=basis(k);for(const[l,h,sx,sy]of[[-lw+0.25,Ht/2,0.35,Ht],[lw-0.25,Ht/2,0.35,Ht],[0,Ht-0.22,2*lw,0.35]]){Pv.copy(P[k]).addScaledVector(R[k],l).addScaledVector(U[k],h);M4.compose(Pv,qb,Sv.set(sx,sy,0.7));ribs.push(M4.clone())}}
      if(ribs.length){const rm=new THREE.InstancedMesh(BOX,ribM,ribs.length);ribs.forEach((m,k)=>rm.setMatrixAt(k,m));group.add(rm)}}};
  /* the road-space test (Prototype 61: Prism's, shared): the road as points on a grid (every sample of the main road and
     of every split route, a wide route's edges too), each with flag[i] (Prism: inside the mountain); scan(x,z,R,fn) visits
     those within R sideways, inRoad(x,y,z) is a point in the space the road needs, clearTri(...) a triangle clear of it */
  const roadSpace=(flag)=>{
    const SP=[],SG=new Map(),SC=48,sk=(a,b)=>a*65537+b;
    const sAdd=(x,y,z,i)=>{const o={x,y,z,i,n:flag?flag[i]:0};const key=sk(Math.floor(x/SC),Math.floor(z/SC));let a=SG.get(key);if(!a)SG.set(key,a=[]);a.push(o);SP.push(o)};
    for(let i=0;i<N;i++)sAdd(P[i].x,P[i].y,P[i].z,i);
    /* Prototype 60: every route of a split (and pit lane and cut) at every sample, where its road is drawn (the route's
       line and height in the main road's frame, as the road strips are built). It used the route's points every 12 m,
       which left the rock between them in the road: rock poked through split routes (NX130F38-P at 2.3 km, NXL7D6FF6-
       33224444222-P3443 at 3.7, 4.3, 6.6 and 6.8 km) */
    for(const S0 of splits)for(const B of S0.b){const n=B.c.length-1;for(let k=0;k<=n;k++){const i=(S0.i0+k)%N,p=P[i],r=R[i],u=U[i],c=B.c[k],hh=B.h[k];sAdd(p.x+r.x*c+u.x*hh,p.y+r.y*c+u.y*hh,p.z+r.z*c+u.z*hh,i);
      /* Prototype 60: a route wider than the road (the long jump's catch road) adds its edges, so the rock keeps clear of all of it */
      const xw=B.w[k]-W/2;if(xw>0.5)for(const e of[-xw,xw])sAdd(p.x+r.x*(c+e)+u.x*hh,p.y+r.y*(c+e)+u.y*hh,p.z+r.z*(c+e)+u.z*hh,i)}}
    const scan=(x,z,R,fn)=>{const c0=Math.floor((x-R)/SC),c1=Math.floor((x+R)/SC),d0=Math.floor((z-R)/SC),d1=Math.floor((z+R)/SC);
      for(let a=c0;a<=c1;a++)for(let c=d0;c<=d1;c++){const Lc=SG.get(sk(a,c));if(Lc)for(const o of Lc){const d2=(o.x-x)**2+(o.z-z)**2;if(d2<R*R)fn(o,d2)}}};
    /* is (x,y,z) inside the space the road needs: over the road and less than 26 m above it */
    /* (P54) measured from the road's own surface there, which on a banked bend is lower on one side than at the centre */
    const tilt=(o,x,z)=>{const r=R[o.i],rh=Math.hypot(r.x,r.z)||1;return clamp(((x-o.x)*r.x+(z-o.z)*r.z)/rh*r.y/rh,-W*0.4,W*0.4)};
    const inRoad=(x,y,z)=>{let hit=false;scan(x,z,W/2+2,o=>{if(hit)return;const b=o.y+tilt(o,x,z);if(y>b-1&&y<b+26)hit=true});return hit};
    /* does a triangle keep clear of the space the road needs? */
    const clearTri=(ax,ay,az,bx,by,bz,cx,cy,cz)=>{
        for(const[u,v]of[[0,0],[1,0],[0,1],[1/3,1/3],[0.5,0],[0,0.5],[0.5,0.5]]){const w0=1-u-v;if(inRoad(ax*w0+bx*u+cx*v,ay*w0+by*u+cy*v,az*w0+bz*u+cz*v))return false}
        /* and straight above or below the road's centre and edges, within the triangle */
        if(Math.max(ay,by,cy)>minY-2&&Math.min(ay,by,cy)<maxY+27){const mx=(ax+bx+cx)/3,mz=(az+bz+cz)/3,rr=Math.max(Math.hypot(ax-mx,az-mz),Math.hypot(bx-mx,bz-mz),Math.hypot(cx-mx,cz-mz))+W/2+1,den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);let hit=false;
          if(Math.abs(den)>1e-6)scan(mx,mz,rr,o=>{if(hit)return;const r=R[o.i],rl=Math.hypot(r.x,r.z)||1;for(const l of[-W/2,-W/4,0,W/4,W/2]){const px=o.x+r.x/rl*l,pz=o.z+r.z/rl*l,u=((bz-cz)*(px-cx)+(cx-bx)*(pz-cz))/den,v=((cz-az)*(px-cx)+(ax-cx)*(pz-cz))/den,w=1-u-v;
            if(u<-0.01||v<-0.01||w<-0.01)continue;const hy=ay*u+by*v+cy*w,b0=o.y+tilt(o,px,pz);if(hy>b0-1&&hy<b0+26){hit=true;return}}});if(hit)return false;
          /* a steep face beside the road: look all over it, every few metres of height */
          const hr=Math.max(ay,by,cy)-Math.min(ay,by,cy);if(hr>10){let nr=false;scan(mx,mz,rr,()=>{nr=true});if(nr){const n=Math.min(48,Math.ceil(hr/6)+4);
            for(let a2=0;a2<=n;a2++)for(let b2=0;b2<=n-a2;b2++){const u=a2/n,v=b2/n,w=1-u-v;if(inRoad(ax*u+bx*v+cx*w,ay*u+by*v+cy*w,az*u+bz*v+cz*w))return false}}}}
        return true};
    return{scan,tilt,inRoad,clearTri}};
  const ctx={seed,N,ds,P,R,U,Tg,kind,gap,spl,splits,feats,jumps,mag,ctop,Kn,Kg,signI,gantI,minX,maxX,minY,maxY,minZ,maxZ,cxT,czT,group,add,strip,basis,dark,bk,LK,day,dial,dens,nFall,nGey,nTun,er,lam,BOX,IM,lines,lnA,lnB,lnBio,winTex,lightTex,near,KP,KG,CELL,kk,solid,free,claim,side,pylons,spireFrames,helixMiddles,falls,geysers,dome,daySky,starSky,buildTunnels,roadSpace,pl,fallsL,geys,caps,jel,kelp,fish,schools,mantas,tunnels,tun,floorY:minY-70,water:null,sky:null,prism:null,inside:null,clock:[],info:[]};
  return ctx}
function buildScenery(rd,bm){const ctx=sceneryCtx(rd,bm);SCENERY[ctx.bk](ctx);
  const{bk,LK,day,er,floorY,ds,lam,BOX,group,fallsL,geys,caps,jel,kelp,fish,schools,mantas,tunnels,tun,pl}=ctx;
  /* moving parts: falling cubes, geyser bursts and whitecaps, moved each frame while Moving scenery is on */
  const fallItems=[],lavaItems=[],gItems=[];
  for(const f of fallsL){const n=f.n||(f.lava?100:120),H=f.top-f.bot,ca=Math.cos(f.dir),sa=Math.sin(f.dir);for(let k=0;k<n;k++){const lx=(er()-.5)*f.w,ox=er()*3;
    (f.lava?lavaItems:fallItems).push({x:f.x+lx*ca+ox*sa,z:f.z-lx*sa+ox*ca,top:f.top,H,ph:er()*H,spd:f.lava?12+er()*8:32+er()*22,sz:f.lava?1.6+er()*2.4:1.2+er()*2.2,c:f.lava?[0xff6a1f,0xff3a10,0xffb000,0x1a0c08][k%4]:[0x3fa9ff,0x7fd0ff,0xe0f6ff,0x2f8fd8][k%4]})}}
  for(const g of geys)for(let k=0;k<96;k++)gItems.push({g,tau:er()*2.6,v0:Math.sqrt(2*24*g.h)*(0.8+er()*0.2),a:er()*TAU,sp:0.6+er()*2.6,sz:2+er()*2.6,c:g.lava?[0xff3a10,0xff8a20,0xffd060][k%3]:(ctx.gCol||[0xffffff,0xe8eef6,0xc8d8e8])[k%3]});
  const mkAnim=(items,mat)=>{if(!items.length)return null;const m=new THREE.InstancedMesh(BOX,mat,items.length);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);const C=new THREE.Color();items.forEach((o,k)=>m.setColorAt(k,C.setHex(o.c||0xffffff)));m.frustumCulled=false;group.add(m);return m};
  const env={k:bk,bub:!!ctx.bubbles,floorY,last:-1,falls:mkAnim(fallItems,ctx.plainFx?new THREE.MeshBasicMaterial({color:0xffffff}):lam(0xffffff,0x0a2a48)),fallItems,lava:mkAnim(lavaItems,new THREE.MeshBasicMaterial({color:0xffffff})),lavaItems,
    gey:mkAnim(gItems,ctx.plainFx?new THREE.MeshBasicMaterial({color:0xffffff}):lam(0xffffff,0x3a4650)),gItems,caps:mkAnim(caps,new THREE.MeshBasicMaterial({color:day?0xe8f6ff:0x6ff6e6})),capItems:caps,capY:floorY+0.14,sky:ctx.sky,n:0,
    jel:mkAnim(jel,new THREE.MeshBasicMaterial(ctx.jelSoft?{color:0xffffff,transparent:true,opacity:0.5,depthWrite:false}:{color:0xffffff,fog:false})),jelItems:jel,
    kelp:mkAnim(kelp,day?lam(0xffffff,0x0a1a0a):lam(0xffffff,0x041810)),kelpItems:kelp,fish:mkAnim(fish,day?lam(0xffffff,0x202428):new THREE.MeshBasicMaterial({color:0xffffff})),fishItems:fish,schools,manta:mkAnim(mantas.flatMap(m=>[{m,part:0,c:0x0b2a3a},{m,part:1,c:0x5ff0ff},{m,part:2,c:0x5ff0ff}]),new THREE.MeshBasicMaterial({color:0xffffff,fog:false})),mantas};
  /* in Prism's caverns the haze turns dark (by day too), and back again outside */
  if(ctx.inside){env.ik=0;env.fb=new THREE.Color();const dk=new THREE.Color(0x06040b);env.cave=(cam)=>{const c=cam.position,tg=ctx.inside(c.x,c.y,c.z)?1:0;if(env.ik<0.002&&!tg){env.fb.copy(scene.fog.color);env.ik=0;return}
    if(env.ik<0.002)env.fb.copy(scene.fog.color);env.ik+=(tg-env.ik)*0.08;if(!tg&&env.ik<0.002)env.ik=0;scene.fog.color.copy(env.fb).lerp(dk,env.ik);scene.background.copy(scene.fog.color)}}
  env.update=(t,anim)=>{if(anim){for(const u of ctx.clock)u.value=t}if(!anim&&env.last>=0)return;env.last=t;env.n++;const M4=_em,Q=_eq,Sv=_es,Pv=_ep;
    const fl=(m,items)=>{if(!m)return;items.forEach((o,k)=>{const y=o.top-((anim?t*o.spd:0)+o.ph)%o.H;Pv.set(o.x,y,o.z);Q.identity();Sv.set(o.sz,o.sz*1.4,o.sz);M4.compose(Pv,Q,Sv);m.setMatrixAt(k,M4)});m.instanceMatrix.needsUpdate=true};
    fl(env.falls,env.fallItems);fl(env.lava,env.lavaItems);
    if(env.gey){env.gItems.forEach((o,k)=>{const g=o.g,fT=2*o.v0/24;let s=((t+g.ph)%g.per)-o.tau;if(!anim)s=fT*(0.2+0.6*((k*0.618)%1));Q.identity();
      if(s>0&&s<fT){const rr=o.sp*s,z=o.sz*(1-0.55*s/fT);Pv.set(g.x+Math.cos(o.a)*rr+(env.bub?Math.sin(s*5+o.a)*1.2:0),env.bub?g.base+o.v0*0.4*s+5*s*s:g.base+o.v0*s-12*s*s,g.z+Math.sin(o.a)*rr);Sv.set(z,z,z)}else{Pv.set(g.x,g.base-60,g.z);Sv.set(0,0,0)}M4.compose(Pv,Q,Sv);env.gey.setMatrixAt(k,M4)});env.gey.instanceMatrix.needsUpdate=true}
    if(env.jel){env.jelItems.forEach((o,k)=>{const b=anim?Math.sin(t*o.w+o.ph):0,p=anim?Math.sin(t*o.w*2.2+o.ph):0;Q.setFromAxisAngle(AX_Y,o.ry);
      Pv.set(o.x+o.dx*(1+0.25*p),o.y+b*1.6,o.z+o.dz*(1+0.25*p));Sv.set(o.sx*(o.tent?1:1+0.12*p),o.sy*(o.tent?1-0.15*p:1-0.12*p),o.sz*(o.tent?1:1+0.12*p));M4.compose(Pv,Q,Sv);env.jel.setMatrixAt(k,M4)});env.jel.instanceMatrix.needsUpdate=true}
    if(env.manta){env.mantas.forEach((m,k)=>{const a=m.ph+(anim?t*m.w:0),x=m.cx+Math.cos(a)*m.R,z=m.cz+Math.sin(a)*m.R,hd=Math.atan2(-Math.sin(a)*Math.sign(m.w),Math.cos(a)*Math.sign(m.w)),fl=anim?Math.sin(t*1.4+m.ph)*0.12:0;
      /* a dark diamond body, a glowing wingspan that flaps, and a glowing line nose to tail */
      for(let q=0;q<3;q++){Q.setFromEuler(_eu.set(0,q===0?hd+Math.PI/4:hd,q===1?fl:0));Pv.set(x,m.y+(q?0.3:0),z);if(q===0)Sv.set(m.s*0.7,0.5,m.s*0.7);else if(q===1)Sv.set(m.s,0.2,0.35);else Sv.set(0.35,0.2,m.s*0.9);M4.compose(Pv,Q,Sv);env.manta.setMatrixAt(k*3+q,M4)}});env.manta.instanceMatrix.needsUpdate=true}
    if(env.kelp){env.kelpItems.forEach((o,k)=>{const sw=Math.sin((anim?t*o.w:0)+o.ph+o.k*0.45);Q.setFromAxisAngle(AX_Z,sw*0.12*o.k/8);Pv.set(o.x+sw*o.amp,o.y0+(o.k+0.5)*o.seg,o.z);Sv.set(o.sx,o.seg*1.08,0.7);M4.compose(Pv,Q,Sv);env.kelp.setMatrixAt(k,M4)});env.kelp.instanceMatrix.needsUpdate=true}
    if(env.fish){env.fishItems.forEach((o,k)=>{const sh=env.schools[o.si],sg=Math.sign(sh.w),a=sh.ph+(anim?t*sh.w:0)-o.off*sg,rr=sh.R+o.r,wig=anim?Math.sin(t*9+k)*0.15:0;
      Q.setFromAxisAngle(AX_Y,Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg)+wig);Pv.set(sh.cx+Math.cos(a)*rr,sh.y+o.h+(anim?Math.sin(t*1.7+o.off*9)*0.8:0),sh.cz+Math.sin(a)*rr);Sv.set(0.5*o.s,0.6*o.s,2.2*o.s);M4.compose(Pv,Q,Sv);env.fish.setMatrixAt(k,M4)});env.fish.instanceMatrix.needsUpdate=true}
    if(env.caps&&(!anim||env.n%2===0)){env.capItems.forEach((o,k)=>{const f=anim?((t+o.ph)%o.per)/o.per:0.5,c=Math.sin(Math.PI*f)**2;Q.setFromAxisAngle(AX_Y,o.ry);Pv.set(o.x,env.capY,o.z);Sv.set(o.sx*(0.15+0.85*c),0.12,o.sz*(0.4+0.6*c));M4.compose(Pv,Q,Sv);env.caps.setMatrixAt(k,M4)});env.caps.instanceMatrix.needsUpdate=true}};
  env.update(0,false);
  const nLava=fallsL.filter(f=>f.lava).length,nWater=fallsL.length-nLava,tKm=tunnels.reduce((a,t)=>a+t.n*ds,0)/1000;
  const bmInfo=[LK.n,nWater?pl(nWater,'waterfall'):'',nLava?pl(nLava,'lava fall'):'',geys.length?pl(geys.length,ctx.geyName||'geyser'):'',tunnels.length?pl(tunnels.length,'tunnel')+' ('+tKm.toFixed(1)+' km)':'',...ctx.info].filter(Boolean).join(' · ');
  return{LK,bk,dial:ctx.dial,floorY,water:ctx.water,tun,prism:ctx.prism,env,bmInfo}}
/* the biomes not yet split out (Prototype 61, while the split is under way) */
function sceneryAll(ctx){const bk=ctx.bk;
  if(bk==='O'){
  ctx.floorY=ctx.minY-24;
  }
  const{seed,N,ds,P,R,U,Tg,kind,gap,spl,splits,minX,maxX,minY,maxY,minZ,maxZ,cxT,czT,group,LK,day,dens,nFall,nGey,er,lam,IM,lines,lnA,lnB,lnBio,winTex,near,KP,KG,CELL,kk,solid,free,claim,side,pylons,spireFrames,helixMiddles,falls,geysers,dome,daySky,starSky,buildTunnels,roadSpace,pl,fallsL,geys,caps,jel,kelp,fish,schools,mantas,floorY}=ctx;
  if(bk==='U'){
const grid=new THREE.GridHelper(6000,150,0x1f2c38,0x131a22);grid.position.y=floorY;group.add(grid)
  }else if(bk==='O'){
  const water=new THREE.Mesh(new THREE.PlaneGeometry(16000,16000),day?lam(0x0f4f78,0x052036):Object.assign(lam(0x04121e,0x010710),{transparent:true,opacity:0.6}));water.rotation.x=-Math.PI/2;water.position.set(cxT,floorY,czT);group.add(water);ctx.water=water;
  }else if(bk==='F'){
const gm=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),lam(0x0a130c,0x020604));gm.rotation.x=-Math.PI/2;gm.position.set(cxT,floorY-0.3,czT);group.add(gm);const grid=new THREE.GridHelper(6000,120,0x1f5a32,0x0e2a17);grid.position.y=floorY;group.add(grid)
  }else if(bk==='R'){
const sb=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),day?lam(0x8c8066,0x0c0a06):lam(0x071216,0x010405));sb.rotation.x=-Math.PI/2;sb.position.set(cxT,floorY-0.2,czT);group.add(sb);
    /* by day the surface is overhead, bright where the sun comes through */
    if(day){const sf=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({color:0xaef0fa,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false}));sf.rotation.x=-Math.PI/2;sf.position.set(cxT,maxY+170,czT);group.add(sf)}
  }
  if(bk==='U'){
  pylons(()=>floorY);
  }else if(bk==='O'){
  pylons(()=>floorY,null,lam(0x18232c));
  }else if(bk==='F'){
  pylons(()=>floorY);
  }else if(bk==='R'){
  pylons(()=>floorY);
  }
  if(bk==='U'){
  spireFrames();
  }else if(bk==='O'){
  spireFrames([0xd9dde2,0x1a2026]);
  }else if(bk==='F'){
  spireFrames([0x1c140e,0x070403]);
  }else if(bk==='N'){
  spireFrames(null,f=>f.bot-90);
  }else if(bk==='R'){
  spireFrames();
  }else if(bk==='P'){
  spireFrames();
  }
  /* forest trees: a tall square trunk with neon bands and a canopy of huge cubes, always well above any road under it */
  const trunks=[],plinths=[],bands=[],canopy=[];
  const tree=(x,z,tw,top)=>{const ry=er()*1.6;trunks.push({x,y:(floorY+top)/2,z,sx:tw,sy:top-floorY,sz:tw,ry});plinths.push({x,y:floorY+10,z,sx:tw*1.8,sy:20,sz:tw*1.8,ry});
    for(let y=floorY+45;y<top-30;y+=45)bands.push({x,y,z,sx:tw+0.7,sy:0.7,sz:tw+0.7,ry});
    const n=4+Math.floor(er()*4),cr=tw*1.4+26;for(let k=0;k<n;k++){const sz=44+er()*66,a=er()*TAU,rr=k?er()*cr:0;canopy.push({x:x+Math.cos(a)*rr,y:top-12+er()*46,z:z+Math.sin(a)*rr,sx:sz,sy:sz*(0.55+er()*0.3),sz,ry:er()*1.6})}};
  const treeTop=(x,z,reach)=>{const h=near(x,z,reach+120);return Math.max(floorY+300+er()*230,(h?h.hi:minY)+125)};
  if(bk==='U'){
  helixMiddles(({cx0,cz0,rt,top})=>{const h=top+60-floorY,g=new THREE.CylinderGeometry(rt*0.92,rt,h,10),mm=new THREE.MeshLambertMaterial({map:winTex.clone(),emissive:0xffffff});mm.map.needsUpdate=true;mm.map.repeat.set(Math.max(2,TAU*rt/16),Math.max(2,h/16));mm.emissiveMap=mm.map;
      const m=new THREE.Mesh(g,mm);m.position.set(cx0,floorY+h/2,cz0);group.add(m);const e=new THREE.LineSegments(new THREE.EdgesGeometry(g,20),lnA);e.position.copy(m.position);group.add(e)});
  }else if(bk==='O'){
  helixMiddles(({cx0,cz0,rt,top})=>{const g=new THREE.CylinderGeometry(rt*0.85,rt*0.95,5,24),m=new THREE.Mesh(g,lam(0xd6c28a,0x1a160c));m.position.set(cx0,floorY+2.5,cz0);group.add(m);
      return{x:cx0,y:floorY+5+(top+40-floorY)/2,z:cz0,sx:10,sy:top+40-floorY,sz:10,c:0xe4e0d6}});
  }else if(bk==='F'){
  helixMiddles(({cx0,cz0,rt,rc,top})=>{tree(cx0,cz0,Math.min(44,rt*0.5,rc/1.3),Math.max(top+170,floorY+320));});
  }else if(bk==='N'){
  helixMiddles();
  }else if(bk==='R'){
  helixMiddles(({cx0,cz0,rt,top})=>{const h=top+50-floorY;return{x:cx0,y:floorY+h/2,z:cz0,sx:rt*0.6,sy:h,sz:rt*0.6,ry:er()*3,c:day?0x5a5646:0x101a1e}});
  }else if(bk==='P'){
  helixMiddles();
  }
  if(bk==='U'){
  falls();
  }else if(bk==='O'){
  falls({poolC:0xe8f8ff});
  }else if(bk==='F'){
  falls();
  }else if(bk==='N'){
  falls({hang:true});
  }else if(bk==='R'){
  falls();
  }
  if(bk==='U'){
  geysers();
  }else if(bk==='O'){
  geysers({vent:(x,z)=>({x,y:floorY+0.1,z,sx:18,sy:0.2,sz:18,ry:er()*3,c:0xe8f8ff}),ventE:0x5a6a70,flat:true});
  }else if(bk==='F'){
  geysers({ventC:0x1c2a1e});
  }else if(bk==='N'){
  geysers({hang:true,vent:(x,z,base)=>({x,y:base-3,z,sx:28,sy:6,sz:28,ry:er()*3,c:0x101218})});
  }else if(bk==='R'){
  geysers();
  }
  if(bk==='U'){
  const cityB=[],trafU={value:0};ctx.clock.push(trafU);
  const sol0=solid.length,want=[40,90,140,200][dens];
    for(let a=0;a<2400&&cityB.length<want;a++){const x=minX-350+er()*(maxX-minX+700),z=minZ-350+er()*(maxZ-minZ+700),big=er()<0.07,w=big?50+er()*50:12+er()*40,d=big?50+er()*50:12+er()*40,R0=Math.hypot(w,d)/2;
      if(near(x,z,R0+W/2+50)||!free(x,z,R0+6))continue;const h=big?260+er()*220:40+er()*er()*280;cityB.push({x,y:floorY+h/2,z,sx:w,sy:h,sz:d,amber:er()<0.15});claim(x,z,R0)}
    /* Prototype 38: a denser city on a street grid, and flying traffic in the style of The Fifth Element. The streets run
       along the world axes, GX by GZ m apart. Traffic flies along them in stacked layers, two lanes a layer (one each way);
       the layers sit every 10 m, the avenues (along z) and the cross streets (along x) taking alternate ones, so crossing
       lanes always pass 10 m or more over each other. Some lanes are jams that crawl in stop-and-go waves, some flow and
       some are fast. A lane keeps W/2+56 m sideways from every road at any height (the main road with its loops, spirals
       and jump flight paths, and both routes of every split, pit lane and cut), so it is never under or over the road.
       Where the road within 250 m lies on more than one side of it (inside a bend, between two parts of the lap), it flies
       28 m above the highest road there or 24 m below the lowest, so it never crosses a view along the road. Each
       stretch of lane ends inside a building (a dock tower where nothing else stands), so vehicles fly in at one end and
       come out of the other. The vehicles are one instanced mesh moved on the GPU: one draw call, and nothing per frame but
       the clock. Towers fill the blocks between the streets, a few very tall, and every tower has lit windows. It has its
       own random numbers, so nothing built after it moves. Low detail keeps the lighter scenery count, 60% of the lanes and
       40% of the vehicles. */
    {const ur=rng((seed^0x5F17C)>>>0),GX=96+16*Math.floor(ur()*3),GZ=128+16*Math.floor(ur()*3),gx0=ur()*GX,gz0=ur()*GZ,X0=minX-420,X1=maxX+420,Z0=minZ-420,Z1=maxZ+420,
      STEP=8,CH=6.5,LAT=3.8,MINRUN=180,E=12,YS=[],sol=solid.slice(0,sol0),OG=new Map(),acc=[],
      solHit=(x,z,r)=>sol.some(o=>(o.x-x)**2+(o.z-z)**2<(o.r+r)**2),
      obAdd=o=>{for(let a=Math.floor((o.x-o.sx/2-10)/64);a<=Math.floor((o.x+o.sx/2+10)/64);a++)for(let c=Math.floor((o.z-o.sz/2-10)/64);c<=Math.floor((o.z+o.sz/2+10)/64);c++){const k=kk(a,c);let Lc=OG.get(k);if(!Lc)OG.set(k,Lc=[]);Lc.push(o)}},
      /* near() has every split's long route; the city adds both routes of every split, pit lane and cut, so nothing
         here comes near a short route either: nr() is near() over all of them */
      KQ=new Map(),
      nr=(x,z,R)=>{let b=near(x,z,R),d=b?b.d*b.d:1e9,hi=b?b.hi:-1e9,lo=b?b.lo:1e9;for(let a=Math.floor((x-R)/CELL);a<=Math.floor((x+R)/CELL);a++)for(let c=Math.floor((z-R)/CELL);c<=Math.floor((z+R)/CELL);c++){const Lc=KQ.get(kk(a,c));if(Lc)for(const q of Lc){const dd=(q.x-x)**2+(q.z-z)**2;if(dd<R*R){d=Math.min(d,dd);hi=Math.max(hi,q.y);lo=Math.min(lo,q.y)}}}return d<1e9?{d:Math.sqrt(d),hi,lo}:null},
      /* the top of the highest tower a vehicle at (x,z) on a lane along x (ax 0) or z (ax 1) would be inside or against */
      topAt=(ax,x,z,Lc)=>{let t=-1e9;if(Lc)for(const o of Lc){const dx=Math.abs(x-o.x)-o.sx/2,dz=Math.abs(z-o.z)-o.sz/2;if((ax?dz:dx)<9&&(ax?dx:dz)<CH)t=Math.max(t,o.y+o.sy/2)}return t},TW=[];
      for(const S0 of splits)for(const B of S0.b)for(let k=0;k<=S0.n;k+=3){const i=(S0.i0+k)%N,q=P[i].clone().addScaledVector(R[i],B.c[k]).addScaledVector(U[i],B.h[k]),key=kk(Math.floor(q.x/CELL),Math.floor(q.z/CELL));let Lc=KQ.get(key);if(!Lc)KQ.set(key,Lc=[]);Lc.push(q)}
      /* the Prototype 37 towers move into the blocks, clear of the streets (or go, if the road leaves no room there); a few
         metres' random inset keeps neighbours off each other's wall planes */
      {const keep=[],fit=(c,w,g0,G)=>{const i=Math.floor((c-g0)/G),l=g0+i*G+10+ur()*4,h=g0+(i+1)*G-10-ur()*4;w=Math.min(w,h-l);return[Math.min(Math.max(c,l+w/2),h-w/2),w]};
        cityB.forEach((o,k)=>{const[x,sx]=fit(o.x,o.sx,gx0,GX),[z,sz]=fit(o.z,o.sz,gz0,GZ),R0=Math.hypot(sx,sz)/2;if(nr(x,z,R0+W/2+50)){solid[sol0+k]={x:1e9,z:1e9,r:0};return}
          Object.assign(o,{x,z,sx,sz});solid[sol0+k]={x,z,r:R0};keep.push(o)});cityB.length=0;cityB.push(...keep)}
      for(const o of cityB)obAdd(o);for(let y=floorY+20;y<=maxY+130;y+=10)YS.push(y);
      /* the cells within 256 m of any road, so that samples far from it skip the search */
      const NB=new Set(),NS=new Set(),nbAdd=q=>{const a=Math.floor(q.x/CELL),c=Math.floor(q.z/CELL),k=kk(a,c);if(NS.has(k))return;NS.add(k);for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)NB.add(kk(a+i,c+j))};
      for(const q of KP)nbAdd(q);for(const Lc of KQ.values())for(const q of Lc)nbAdd(q);
      /* a coarser copy of the road (a point every 12 m) on 128 m cells for the wide search: the nearest road, the highest and
         lowest within 250 m, and whether it all lies inside a 120 degree wedge as seen from here (then no view along the
         road, from one road point to another, passes through this point) */
      const CG=new Map(),cgAdd=q=>{const k=kk(Math.floor(q.x/128),Math.floor(q.z/128));let Lc=CG.get(k);if(!Lc)CG.set(k,Lc=[]);Lc.push(q)};
      for(let j=0;j<KP.length;j+=2)cgAdd(KP[j]);for(const Lc of KQ.values())for(let j=0;j<Lc.length;j+=2)cgAdd(Lc[j]);
      /* atan2 to a hundredth of a radian, a few times quicker */
      const at2=(y,x)=>{const ax=Math.abs(x),ay=Math.abs(y),a=Math.min(ax,ay)/(Math.max(ax,ay)||1),q=a*a;let r=((-0.0464964749*q+0.15931422)*q-0.327622764)*q*a+a;if(ay>ax)r=1.57079637-r;if(x<0)r=3.14159274-r;return y<0?-r:r};
      const probe=(x,z)=>{const B=new Uint8Array(36);let d=1e9,hi=-1e9,lo=1e9;for(let a=Math.floor((x-250)/128);a<=Math.floor((x+250)/128);a++)for(let c=Math.floor((z-250)/128);c<=Math.floor((z+250)/128);c++){const Lc=CG.get(kk(a,c));if(Lc)for(const q of Lc){const dx=q.x-x,dz=q.z-z,dd=dx*dx+dz*dz;if(dd<62500){d=Math.min(d,dd);hi=Math.max(hi,q.y);lo=Math.min(lo,q.y);B[Math.floor((at2(dz,dx)+Math.PI)/TAU*36)%36]=1}}}
        if(d>=1e9)return null;let run=0,best=0;for(let i=0;i<72;i++){if(B[i%36])run=0;else best=Math.max(best,++run)}return{d:Math.sqrt(d),hi,lo,wg:best>=24}};
      /* every street: for each sample along it, the road within 250 m (highest and lowest, and whether it lies in a wedge),
         whether any is within 220 m, whether it is clear sideways, and the highest Prototype 37 tower in the way. The wide
         search runs every 16 m; the samples between take the stricter of their two neighbours. */
      const SL=[];for(const ax of[0,1]){const G=ax?GX:GZ,g0=ax?gx0:gz0,A0=ax?X0:Z0,A1=ax?X1:Z1,S0=ax?Z0:X0,n=Math.floor(((ax?Z1:X1)-S0)/STEP)+1;
        for(let c=g0+Math.ceil((A0-g0)/G)*G;c<=A1;c+=G){const clr=new Uint8Array(n),cl=new Uint8Array(n),wg=new Uint8Array(n),hi=new Float32Array(n),lo=new Float32Array(n),ob=new Float32Array(n);
          const qd=new Float32Array(n);for(let k=0;k<n;k+=2){const sv=S0+k*STEP,x=ax?c:sv,z=ax?sv:c,q=NB.has(kk(Math.floor(x/CELL),Math.floor(z/CELL)))?probe(x,z):null;qd[k]=q?q.d:1e9;hi[k]=q?q.hi:-1e9;lo[k]=q?q.lo:1e9;cl[k]=q&&q.d<220?1:0;wg[k]=q?q.wg:1}
          for(let k=1;k<n;k+=2){const j=k+1<n?k+1:k-1;qd[k]=Math.min(qd[k-1],qd[j])-STEP;hi[k]=Math.max(hi[k-1],hi[j]);lo[k]=Math.min(lo[k-1],lo[j]);cl[k]=cl[k-1]|cl[j];wg[k]=wg[k-1]&wg[j]}
          for(let k=0;k<n;k++){const sv=S0+k*STEP,x=ax?c:sv,z=ax?sv:c;clr[k]=(qd[k]>=W/2+62||!nr(x,z,W/2+56))&&!solHit(x,z,CH+6)?1:0;if(!clr[k])wg[k]=1;ob[k]=topAt(ax,x,z,OG.get(kk(Math.floor(x/64),Math.floor(z/64))))}
          SL.push({ax,c,S0,n,clr,cl,wg,hi,lo,ob,used:0})}}
      const okAt=(L,k,y)=>L.clr[k]&&(L.wg[k]||y>L.hi[k]+28||y<L.lo[k]-24)&&L.ob[k]<y-5&&(!TW.length||topAt(L.ax,L.ax?L.c:L.S0+k*STEP,L.ax?L.S0+k*STEP:L.c,TW)<y-5);
      const runs=(L,y,k0,k1)=>{const out=[];let a=-1;for(let k=k0;k<=k1+1;k++){const ok=k<=k1&&okAt(L,k,y);if(ok&&a<0)a=k;else if(!ok&&a>=0){if((k-1-a)*STEP>=MINRUN)out.push([a,k-1]);a=-1}}return out};
      /* a dock tower just past one end of a run: clear of the road and the other scenery like any tower, never standing in
         another lane, and stopping short under a lane that passes over it */
      const tower=(L,y,sE,dir)=>{const tw=18+ur()*12,td=18+ur()*10,sc=sE+dir*(3+td/2),x=L.ax?L.c:sc,z=L.ax?sc:L.c,sx=L.ax?tw:td,sz=L.ax?td:tw,R0=Math.hypot(sx,sz)/2;
        if(nr(x,z,R0+W/2+50)||solHit(x,z,R0+6))return null;let top=y+14+ur()*ur()*240;
        for(const A of acc){if(x+sx/2<(A.ax?A.c-CH:A.s0)||x-sx/2>(A.ax?A.c+CH:A.s1)||z+sz/2<(A.ax?A.s0:A.c-CH)||z-sz/2>(A.ax?A.s1:A.c+CH))continue;if(A.y<y+16)return null;top=Math.min(top,A.y-7)}
        return{x,y:(floorY+top)/2,z,sx,sy:top-floorY,sz,amber:ur()<0.15}};
      /* the lanes most worth flying first: the most of them near the road, and as near its height as they may fly; at most
         four layers a street */
      const cand=[];for(const L of SL)YS.forEach((y,i)=>{if(i%2!==L.ax)return;for(const[a,b]of runs(L,y,0,L.n-1)){let sc=0;for(let k=a;k<=b;k++)sc+=L.cl[k]?1/(1+Math.max(0,L.wg[k]?Math.abs(y-(L.hi[k]+L.lo[k])/2)-(L.hi[k]-L.lo[k])/2-6:y>L.hi[k]?y-L.hi[k]-28:L.lo[k]-24-y)/35):0.05;cand.push({L,y,a,b,sc:sc*(0.6+0.8*ur())})}});
      cand.sort((p,q)=>q.sc-p.sc);
      const nPair=Math.round([6,11,18,24][dens]*(RES.low?0.6:1)),budget=Math.round([350,700,1200,1600][dens]*(RES.low?0.4:1)),Mi=[],Ci=[],MV=[],PH=[],cB=new THREE.Color(),
        BODY=day?[0xa8862e,0xa8862e,0xaeb1b4,0xaeb1b4,0x737c85,0x737c85,0x30353c,0x30353c,0x783a33,0x33646b]:[0x2a2f38,0x232830,0x30343c,0x2b2724,0x3a3226];
      /* one lane of vehicles: s runs from 0 to Lt along it; jams move in a stop-and-go wave that travels back down the lane */
      const lane=(ax,cl,s0,s1,y,dir,ty)=>{const Lt=s1-s0,dx=ax?0:dir,dz=ax?dir:0,px=ax?cl:dir>0?s0:s1,pz=ax?(dir>0?s0:s1):cl,v=ty===0?1.5+ur()*2.5:ty===1?9+ur()*7:24+ur()*16,
          A=ty===0?6+ur()*3:0,kq=A?2*Math.PI*Math.max(1,Math.round(Lt*0.28/A/(2*Math.PI)))/Lt:0,w=A?v/A*(0.85+ur()*0.15):0;let e=ur()*6,n=0;
        for(;;){const t=ur(),big=ty<2&&t<0.07,mid=!big&&t<(ty<2?0.25:0.1),len=big?14+ur()*2:mid?9+ur()*2:6+ur()*1.6,h=big?3.6+ur()*0.4:mid?2.8+ur()*0.4:1.8+ur()*0.4,wd=big?4:mid?3.4:2.9+ur()*0.3,
            gap=ty===0?2.4+ur()*2.6+0.5*len:ty===1?14+ur()*24:40+ur()*55;if(e+len+gap>Lt)break;const sc=e+len/2;e+=len+gap;n++;
          Mi.push(dx*len,0,dz*len,0,0,h,0,0,-dz*wd,0,dx*wd,0,px,y,pz,1);cB.setHex(BODY[Math.floor(ur()*BODY.length)]);Ci.push(cB.r,cB.g,cB.b);MV.push(dx,dz,Lt,v);PH.push(sc,A,kq,w)}
        return n};
      let nV=0,nP=0;for(const C of cand){if(nV>=budget||nP>=nPair)break;const L=C.L;if(L.used>=4)continue;
        for(const[a0,b0]of runs(L,C.y,C.a,C.b)){if(nP>=nPair)break;
          /* a jam is at most 600 m long and a flowing lane 1300 m, over the stretch nearest the road */
          const t1=ur(),ty1=t1<0.45?0:t1<0.8?1:2,ty2=ur()<0.5?ty1:Math.floor(ur()*3),tm=Math.min(ty1,ty2),mx=Math.round((tm===0?600:tm===1?1300:5000)/STEP);let a=a0,b=b0,tA=null,tB=null;
          if(b-a>mx){let best=-1,sm=0;for(let k=a0;k<=a0+mx;k++)sm+=L.cl[k];for(let k=a0;;k++){if(sm>best){best=sm;a=k}if(k+mx+1>b0)break;sm+=L.cl[k+mx+1]-L.cl[k]}b=a+mx}
          while((b-a)*STEP>=MINRUN&&!(tB=tower(L,C.y,L.S0+b*STEP,1)))b--;
          while(tB&&(b-a)*STEP>=MINRUN&&!(tA=tower(L,C.y,L.S0+a*STEP,-1)))a++;
          if(!tA||!tB||(b-a)*STEP<MINRUN)continue;const s0=L.S0+a*STEP-3-E,s1=L.S0+b*STEP+3+E;acc.push({ax:L.ax,c:L.c,s0,s1,y:C.y});L.used++;nP++;
          for(const t of[tA,tB]){cityB.push(t);TW.push(t);claim(t.x,t.z,Math.hypot(t.sx,t.sz)/2)}
          for(const dir of[1,-1])nV+=lane(L.ax,L.c+dir*LAT*(L.ax?-1:1),s0,s1,C.y,dir,dir>0?ty1:ty2)}}
      if(nV){/* the vehicle: a body, a cabin and a light bar at each end (white in front, red behind, dimmer by day; the
           lights ignore the lighting), 28 triangles */
        const PB=[],NB=[],GB=[],IB=[];for(const[bx,by,bz,x,y]of[[1,1,1,0,0],[0.46,0.55,0.82,-0.06,0.77]]){
          const g=new THREE.BoxGeometry(bx,by,bz),p=g.attributes.position.array,o=PB.length/3;for(let k=0;k<p.length;k+=3){PB.push(p[k]+x,p[k+1]+y,p[k+2]);GB.push(0,0,0)}NB.push(...g.attributes.normal.array);for(const q of g.index.array)IB.push(q+o);g.dispose()}
        for(const sd of[1,-1]){const o=PB.length/3,c=sd>0?(day?[0.86,0.85,0.8]:[0.98,0.9,0.74]):(day?[0.72,0.22,0.22]:[0.95,0.13,0.17]);for(const[yy,zz]of[[-0.22,-0.44],[-0.22,0.44],[0.14,0.44],[0.14,-0.44]]){PB.push(sd*0.506,yy,zz*sd);NB.push(sd,0,0);GB.push(...c)}IB.push(o,o+2,o+1,o,o+3,o+2)}
        const vg=new THREE.BufferGeometry();vg.setAttribute('position',new THREE.Float32BufferAttribute(PB,3));vg.setAttribute('normal',new THREE.Float32BufferAttribute(NB,3));vg.setAttribute('aGl',new THREE.Float32BufferAttribute(GB,3));vg.setIndex(IB);
        vg.setAttribute('aMv',new THREE.InstancedBufferAttribute(new Float32Array(MV),4));vg.setAttribute('aPh',new THREE.InstancedBufferAttribute(new Float32Array(PH),4));
        const vm=new THREE.MeshLambertMaterial({color:0xffffff});vm.onBeforeCompile=sh=>{sh.uniforms.uT=trafU;
          sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aGl;attribute vec4 aMv;attribute vec4 aPh;uniform float uT;varying vec3 vGl;').replace('#include <project_vertex>',
            'vGl=aGl;float sT=mod(aPh.x+aMv.w*uT+aPh.y*sin(aPh.z*aPh.x+aPh.w*uT),aMv.z);vec4 mvPosition=instanceMatrix*vec4(transformed*clamp(min(sT,aMv.z-sT)*0.25,0.,1.),1.);mvPosition.xyz+=vec3(aMv.x*sT,0.3*sin(uT*1.6+aPh.x),aMv.y*sT);mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;');
          sh.fragmentShader=sh.fragmentShader.replace('void main() {','varying vec3 vGl;\nvoid main() {').replace('#include <tonemapping_fragment>','if(vGl.r+vGl.g+vGl.b>0.)gl_FragColor.rgb=vGl;\n#include <tonemapping_fragment>')};
        const tm=new THREE.InstancedMesh(vg,vm,nV);tm.instanceMatrix.array.set(Mi);tm.instanceColor=new THREE.BufferAttribute(new Float32Array(Ci),3);tm.frustumCulled=false;group.add(tm)}
      /* Prototype 60: a bigger, more city-like Urban. Eric: "way more buildings, aligned in a more typical city design".
         Before, only 200 lots (at the default density) were dropped into random blocks, so most of the grid stood empty.
         Now, in this order (every footprint is an oriented rectangle, tested against everything placed before it):
         1. rows of buildings facing the road: where the road runs straight (the heading changes under 6 degrees over the
            building and a little either side) two rows a side, their long faces parallel to it, a street between them;
         2. the few very tall stepped towers, in the blocks nearest the downtown centre;
         3. every other block of the grid, nearest the road first, filled with a grid of lots on the street axes (every 4th
            street along z and 5th along x is an avenue, twice as wide). Heights fall from the downtown centre outwards:
            it is a random point near the middle of the map, tall and stepped there, low (24 to 55 m) out at the edges.
         Nothing stands within W/2+48 m of any road point (the main road with loops and jump flights, both routes of every
         split, pit lane and cut) measured from the nearest face (so a tunnel shell, 17 to 31 m out, never meets one), nor
         in a flight lane of the traffic, nor in a dock tower, a spiral's tower or any other claimed feature. It is all
         inside the one instanced mesh, so the draw calls don't grow (12 triangles a building). Own random numbers (ur)
         as before; the road and every other biome are untouched. Budgets are lighter at low detail (density 1). */
      const NG=new Map(),MC=W/2+48,
        hit=(a,b,m)=>{/* do two oriented rectangles come within m of each other? (separating axes) */
          for(const o of[a,b]){const r=o.ry||0,c=Math.cos(r),s=Math.sin(r);for(const[ux,uz]of[[c,-s],[s,c]]){let ra=0,rb=0;
            for(const q of[a,b]){const r2=q.ry||0,c2=Math.cos(r2),s2=Math.sin(r2),e=Math.abs(c2*ux-s2*uz)*q.sx/2+Math.abs(s2*ux+c2*uz)*q.sz/2;if(q===a)ra=e;else rb=e}
            if(Math.abs((b.x-a.x)*ux+(b.z-a.z)*uz)>ra+rb+m)return false}}return true},
        cellsOf=(o,f)=>{const br=Math.hypot(o.sx,o.sz)/2+6;for(let a=Math.floor((o.x-br)/64);a<=Math.floor((o.x+br)/64);a++)for(let c=Math.floor((o.z-br)/64);c<=Math.floor((o.z+br)/64);c++)if(f(kk(a,c)))return true;return false},
        hitAny=o=>cellsOf(o,k=>{for(const Lc of[OG.get(k),NG.get(k)])if(Lc)for(const q of Lc)if(hit(o,q,3))return true;return false})||TW.some(q=>hit(o,q,3)),
        reg=o=>cellsOf(o,k=>{let Lc=NG.get(k);if(!Lc)NG.set(k,Lc=[]);Lc.push(o);return false}),
        /* clear of the road: the nearest face of the rectangle is at least MC from every road point */
        roadOK=o=>{const c=Math.cos(o.ry||0),s=Math.sin(o.ry||0),R=Math.hypot(o.sx,o.sz)/2+MC,bad=q=>{const dx=q.x-o.x,dz=q.z-o.z;if(dx*dx+dz*dz>R*R)return false;
            const lx=dx*c-dz*s,lz=dx*s+dz*c,ex=Math.max(Math.abs(lx)-o.sx/2,0),ez=Math.max(Math.abs(lz)-o.sz/2,0);return ex*ex+ez*ez<MC*MC};
          for(let a=Math.floor((o.x-R)/CELL);a<=Math.floor((o.x+R)/CELL);a++)for(let b=Math.floor((o.z-R)/CELL);b<=Math.floor((o.z+R)/CELL);b++){
            const Lc=KG.get(kk(a,b));if(Lc)for(const k of Lc)if(bad(KP[k]))return false;const Lq=KQ.get(kk(a,b));if(Lq)for(const q of Lq)if(bad(q))return false}return true},
        /* not in a flight lane of the traffic (a building lower than the lane's layer may stand under it) */
        laneOK=(o,top)=>{const br=Math.hypot(o.sx,o.sz)/2,hw=CH+2;for(const A of acc){if(top<A.y-9)continue;
            if(o.x+br<(A.ax?A.c-hw:A.s0)||o.x-br>(A.ax?A.c+hw:A.s1)||o.z+br<(A.ax?A.s0:A.c-hw)||o.z-br>(A.ax?A.s1:A.c+hw))continue;return false}return true},
        ccx=cxT+(ur()-0.5)*0.4*(maxX-minX),ccz=czT+(ur()-0.5)*0.4*(maxZ-minZ),Rd=Math.max(450,0.3*Math.max(maxX-minX,maxZ-minZ)),
        dtf=(x,z)=>1/(1+((x-ccx)**2+(z-ccz)**2)/(Rd*Rd)),
        /* height above the floor: 24-55 m at the edges, up to 450 m at the downtown centre */
        hgt=(x,z)=>24+ur()*30+Math.pow(dtf(x,z),1.5)*(70+ur()*ur()*380),
        box=(x,z,w,d,b,t,amber,ry)=>cityB.push({x,y:(b+t)/2,z,sx:w,sy:t-b,sz:d,ry,amber}),
        /* one building of a footprint: low ones a plain block, tall ones usually a podium with a narrower shaft, the
           tallest an amber crown. Fails (false) if it meets the road, a lane or another building. */
        put=(x,z,w,d,ry,H)=>{const o={x,z,sx:w,sz:d,ry};if(!roadOK(o)||solHit(x,z,Math.hypot(w,d)/2+4)||hitAny(o)||!laneOK(o,floorY+H))return false;
          if(H>150&&ur()<0.6){const hb=floorY+H*(0.3+ur()*0.25),s=0.55+ur()*0.15;box(x,z,w,d,floorY,hb,false,ry);box(x,z,w*s,d*s,hb,floorY+H,H>260,ry)}else box(x,z,w,d,floorY,floorY+H,ur()<0.15,ry);
          reg(o);claim(x,z,Math.hypot(w,d)*0.35);return true};
      const hd=new Float32Array(N),dh=(a,b)=>{const d=Math.abs(hd[a]-hd[b]);return d>Math.PI?TAU-d:d};
      for(let i=0;i<N;i++)hd[i]=Math.atan2(Tg[i].x,Tg[i].z);
      /* 1. rows facing the road */
      const nRow=[0,500,1100,1500][dens]*(RES.low?0.5:1);let rowN=0;
      for(const sd of[-1,1])for(let row=0;row<2;row++){const dep=24+ur()*10;let i=Math.floor(ur()*20);
        while(i<N&&rowN<nRow){const len=22+ur()*18,k=Math.max(1,Math.round((len/2+20)/ds)),a0=(i-k+N)%N,a1=(i+k)%N;
          if(dh(a0,i)>0.05||dh(i,a1)>0.05||dh(a0,a1)>0.1||spl[i]){i+=Math.round(12/ds);continue}
          const t=Tg[i],tl=Math.hypot(t.x,t.z)||1,off=W/2+48+dep/2+row*(dep+16),[x,z]=side(i,sd,off);
          if(ur()<0.1||!put(x,z,dep,len,Math.atan2(t.x/tl,t.z/tl),hgt(x,z))){i+=Math.round((len/2+3)/ds);continue}rowN++;i+=Math.round((len+4+ur()*9)/ds)}}
      /* the blocks of the grid, nearest the road first; the grid streets are the axes */
      const cells=[];for(let x=gx0+Math.floor((X0-gx0)/GX)*GX;x<X1;x+=GX)for(let z=gz0+Math.floor((Z0-gz0)/GZ)*GZ;z<Z1;z+=GZ){const q=near(x+GX/2,z+GZ/2,700);cells.push({x,z,ix:Math.round((x-gx0)/GX),iz:Math.round((z-gz0)/GZ),d:(q?q.d:700+Math.hypot(x-cxT,z-czT)*0.1)*(0.85+ur()*0.3),f:dtf(x+GX/2,z+GZ/2)})}
      const used=new Set();let nT=[1,2,4,6][dens];
      /* 2. the stepped towers, in the blocks nearest downtown */
      for(const c of cells.slice().sort((p,q)=>q.f-p.f)){if(nT<=0)break;
        const bw=GX-20,bd=GZ-20,w=bw*(0.55+ur()*0.25),d=Math.min(bd*0.7,w*(1+ur()*0.4)),x=c.x+GX/2,z=c.z+GZ/2,o={x,z,sx:w,sz:d};
        if(!roadOK({...o,sx:w+100,sz:d+100})||solHit(x,z,Math.hypot(w,d)*0.3)||hitAny(o)||!laneOK(o,1e9))continue;
        const h1=floorY+140+ur()*80,h2=h1+120+ur()*120,h3=h2+80+ur()*150;box(x,z,w,d,floorY,h1,false);box(x,z,w*0.72,d*0.72,h1,h2,false);box(x,z,w*0.48,d*0.48,h2,h3,true);box(x,z,3,3,h3,h3+30+ur()*30,true);reg(o);claim(x,z,Math.hypot(w,d)*0.4);used.add(c);nT--}
      /* 3. a grid of lots in every other block */
      let nF=[100,350,700,1000][dens];const av=(i,n)=>((i%n)+n)%n===0;
      for(const c of cells.sort((p,q)=>p.d-q.d)){if(nF<=0)break;if(used.has(c))continue;
        const x0=c.x+(av(c.ix,4)?24:10),x1=c.x+GX-(av(c.ix+1,4)?24:10),z0=c.z+(av(c.iz,5)?24:10),z1=c.z+GZ-(av(c.iz+1,5)?24:10);
        /* in the downtown a block is often one tower on a podium, nearly the whole block */
        if(c.f>0.3&&ur()<0.5){const w=(x1-x0)*(0.8+ur()*0.15),d=(z1-z0)*(0.8+ur()*0.15);if(put((x0+x1)/2,(z0+z1)/2,w,d,0,hgt((x0+x1)/2,(z0+z1)/2)*1.15+60))nF--;continue}
        const nx=Math.max(1,Math.round((x1-x0)/34)),nz=Math.max(1,Math.round((z1-z0)/34)),lw=(x1-x0)/nx,ld=(z1-z0)/nz;
        for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){if(ur()<0.1)continue;const w=(lw-5)*(0.8+ur()*0.2),d=(ld-5)*(0.8+ur()*0.2),x=x0+(a+0.5)*lw+(ur()-0.5)*(lw-5-w),z=z0+(b+0.5)*ld+(ur()-0.5)*(ld-5-d);
          if(put(x,z,w,d,0,hgt(x,z)))nF--}}
      }
    /* every tower's own tone, and lit windows: a texture of 16 floors (some lit end to end) laid on each face by its size,
       a floor every 3 m, never on the roofs; bright at night, faint by day */
    for(const o of cityB)o.c=(day?[0x1c2129,0x262b33,0x30353d,0x3a3f46]:[0x0b0e14,0x0d1118,0x0a0c12,0x10131a])[Math.floor(Math.abs(o.x*7.1+o.z*3.7))%4];
    const cwT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),wr=rng((seed^0x3132)>>>0);g.fillStyle='#06080c';g.fillRect(0,0,128,128);
      for(let y=0;y<16;y++){const lit=wr()<0.16,warm=wr()<0.9;for(let x=0;x<16;x++){const v=wr(),col=lit&&v<0.6?(warm?'#d99a3a':'#5aa4b8'):v<0.035?'#e0a040':v<0.05?'#3fb8c8':v<0.16?'#182231':v<0.3?'#0e141d':null;if(col){g.fillStyle=col;g.fillRect(x*8+1,y*8+2,6,4)}}}
      const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
    const winM=new THREE.MeshLambertMaterial({color:0xffffff,emissive:day?0x2e2e2e:0xffffff,emissiveMap:cwT});winM.addEventListener('dispose',()=>cwT.dispose());
    winM.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWall;').replace('#include <uv_vertex>','#include <uv_vertex>\nvWall=1.-step(0.5,abs(normal.y));\n#ifdef USE_INSTANCING\n{vec3 iS=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));vUv=uv*(abs(normal.x)>0.5?iS.zy:iS.xy)/48.+fract(instanceMatrix[3].xz*vec2(0.0173,0.0119)+normal.xz*0.37);}\n#endif');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWall;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=vWall;')};
    if(cityB.length){IM(winM,cityB);lines(cityB.filter(o=>o.amber),lnA);lines(cityB.filter(o=>!o.amber),lnB)}
  }else if(bk==='O'){
  const isl=[],shoal=[],lights=[],lamps=[];
  const nI=[3,6,10,16][dens];
    for(let t=0;t<900&&shoal.length<nI;t++){const x=minX-450+er()*(maxX-minX+900),z=minZ-450+er()*(maxZ-minZ+900),w=50+er()*170,d=w*(0.5+er()*0.6),ry=er()*3,R0=Math.hypot(w,d)/2;if(!free(x,z,R0+30))continue;
      isl.push({x,y:floorY+1.6,z,sx:w,sy:3.2,sz:d,ry,c:0xd6c28a});if(w>80)isl.push({x:x+(er()-.5)*w*0.2,y:floorY+4.4,z:z+(er()-.5)*d*0.2,sx:w*0.55,sy:2.6,sz:d*0.5,ry,c:0xc8b27a});if(w>150)isl.push({x,y:floorY+6.8,z,sx:w*0.22,sy:2.4,sz:d*0.2,ry,c:0xbfa66c});
      shoal.push({x,y:floorY+0.06,z,sx:w+36,sy:0.12,sz:d+36,ry,c:day?0x1d8fa0:0x0a5560});
      if(w>130&&er()<0.6){const lx=x+(er()-.5)*w*0.3,lz=z+(er()-.5)*d*0.3;if(!near(lx,lz,W/2+40)){lights.push({x:lx,y:floorY+23,z:lz,sx:6,sy:40,sz:6,c:0xe4e0d6});lamps.push({x:lx,y:floorY+44.5,z:lz,sx:7,sy:3,sz:7,c:0xffb000})}}
      claim(x,z,R0)}
    IM(lam(0xffffff,0x1a160c),isl);IM(new THREE.MeshBasicMaterial({color:0xffffff}),shoal);IM(lam(0xffffff,0x202020),lights);IM(new THREE.MeshBasicMaterial({color:0xffffff}),lamps);lines(lights,lnA);
    /* whitecaps: short white bars that swell and fade, all lined up with the wind */
    const nC=[800,1300,1800,2300][dens],wa=er()*TAU;for(let t=0;t<nC*3&&caps.length<nC;t++){const x=minX-800+er()*(maxX-minX+1600),z=minZ-800+er()*(maxZ-minZ+1600);if(!free(x,z,6))continue;caps.push({x,z,sx:5+er()*12,sz:0.9+er()*1.2,ry:wa+(er()-.5)*0.5,ph:er()*10,per:3+er()*3.5})}
    /* at night, things that glow under the sea: jellyfish that drift and pulse, and a few manta rays gliding in slow circles */
    if(!day){const nJ=[6,10,14,20][dens];for(let t=0;t<900&&jel.length<nJ*6;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+30)||!free(x,z,8))continue;
        const y=floorY-2-er()*4,c=[0xff5ad8,0x5ff0ff,0xb98cff][Math.floor(er()*3)],sz=4+er()*4,ph=er()*TAU,w=0.5+er()*0.5;
        jel.push({x,y,z,sx:sz,sy:sz*0.55,sz:sz,ry:er()*3,c,ph,w,dx:0,dz:0});for(let k=0;k<4;k++){const a=k*TAU/4+0.4;jel.push({x,y:y-sz*0.9,z,sx:0.25,sy:sz*1.3,sz:0.25,ry:0,c,ph,w,dx:Math.cos(a)*sz*0.3,dz:Math.sin(a)*sz*0.3,tent:1})}jel.push({x,y:y+sz*0.05,z,sx:sz*0.45,sy:sz*0.35,sz:sz*0.45,ry:0,c:0xffffff,ph,w,dx:0,dz:0})}
      for(let k=0;k<[1,2,3,4][dens];k++){const cx=minX+er()*(maxX-minX),cz=minZ+er()*(maxZ-minZ),R0=60+er()*120;mantas.push({cx,cz,R:R0,y:floorY-3-er()*3,ph:er()*TAU,w:(0.05+er()*0.05)*(er()<0.5?-1:1),s:10+er()*8})}}
  }else if(bk==='F'){
  const step=[230,165,120,85][dens]/ds;let sd=1;
    for(let i=Math.floor(er()*step);i<N;i+=Math.max(6,Math.round(step*(0.7+er()*0.6)))){if(spl[i])continue;sd=er()<0.75?-sd:sd;const tw=16+er()*18,d=W/2+28+tw*0.71+er()*70,[x,z]=side(i,sd,d);
      if(near(x,z,W/2+24+tw*0.71)||!free(x,z,tw*0.8+26))continue;tree(x,z,tw,treeTop(x,z,tw*1.4+86));claim(x,z,tw*0.8)}
    const far=[12,26,42,64][dens];for(let a=0,n=0;a<900&&n<far;a++){const x=minX-500+er()*(maxX-minX+1000),z=minZ-500+er()*(maxZ-minZ+1000),tw=20+er()*26;if(near(x,z,W/2+90+tw)||!free(x,z,tw+40))continue;tree(x,z,tw,treeTop(x,z,tw*1.4+86));claim(x,z,tw);n++}
  }else if(bk==='N'){
  const slabs=[];
  /* Stratos: floating slabs so speed reads (the stars all the way round are drawn with the sky, below) */
    const nS=[10,22,36,56][dens];for(let t=0;t<1500&&slabs.length<nS;t++){const x=minX-500+er()*(maxX-minX+1000),z=minZ-500+er()*(maxZ-minZ+1000),w=6+er()*18,dd=6+er()*18,h=40+er()*150,y=minY-260+er()*(maxY-minY+420),R0=Math.hypot(w,dd)/2;
      const nr=near(x,z,R0+W/2+60);if(nr&&nr.hi>y-h/2-45&&nr.lo<y+h/2+45)continue;if(!free(x,z,R0+10))continue;slabs.push({x,y,z,sx:w,sy:h,sz:dd,ry:er()*3,c:0xffffff});claim(x,z,R0)}
    IM(day?lam(0x3a4352,0x0a0d12):lam(0x0b0d14,0x020306),slabs);lines(slabs.filter((o,k)=>k%3===0),lnA);lines(slabs.filter((o,k)=>k%3===1),new THREE.LineBasicMaterial({color:0x3ff0ff}));lines(slabs.filter((o,k)=>k%3===2),new THREE.LineBasicMaterial({color:0xb05cff}))
  }else if(bk==='R'){
  /* the reef (Prototype 31): rocks and coral on the sea bed, kelp that sways, shoals of fish swimming
       round, and jellyfish at every depth. By day the water is sunlit, with shafts of light from the surface; at night
       only the creatures and the coral glow. Nothing comes near the road. */
    const rock=[],coral=[],rays=[],nR=[14,26,40,60][dens];
    for(let t=0;t<1500&&rock.length<nR;t++){const x=minX-400+er()*(maxX-minX+800),z=minZ-400+er()*(maxZ-minZ+800),w=20+er()*60,d=20+er()*60,h=8+er()*40,R0=Math.hypot(w,d)/2;
      const nr=near(x,z,R0+W/2+40);if(nr&&nr.lo<floorY+h+40||!free(x,z,R0+8))continue;rock.push({x,y:floorY+h/2,z,sx:w,sy:h,sz:d,ry:er()*3,c:day?0x5a5646:0x101a1e});
      const nc=3+Math.floor(er()*6);for(let k=0;k<nc;k++){const a=er()*TAU,rr=R0*(0.3+er()*0.9),cx=x+Math.cos(a)*rr,cz=z+Math.sin(a)*rr,ch=4+er()*14,cw=2+er()*5,col=(day?[0xff6f61,0xffb347,0xff8fd0,0xb06cff,0x4fe0c0]:[0xff3fd0,0x3ff0ff,0xb05cff,0x46ff8c,0xffb000])[Math.floor(er()*5)];
        coral.push({x:cx,y:floorY+ch/2,z:cz,sx:cw,sy:ch,sz:cw,ry:er()*3,c:col});if(er()<0.6)coral.push({x:cx+(er()-.5)*cw*2,y:floorY+ch*0.8,z:cz+(er()-.5)*cw*2,sx:cw*1.6,sy:cw*0.6,sz:cw*1.6,ry:er()*3,c:col})}
      claim(x,z,R0)}
    IM(lam(0xffffff,day?0x080806:0x020506),rock);IM(day?lam(0xffffff,0x1a1010):new THREE.MeshBasicMaterial({color:0xffffff}),coral);if(!day)lines(rock.filter((o,k)=>k%2===0),lnBio);
    /* kelp: columns of blocks, swaying more towards the top, never up into a road */
    const nK=[30,60,100,150][dens];for(let t=0;t<3000&&kelp.length<nK*8;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+26)||!free(x,z,4))continue;
      const hN=near(x,z,60),room=(hN?hN.lo-22:maxY+100)-floorY;if(room<30)continue;const h=Math.min(room,40+er()*90),seg=h/8,ph=er()*TAU,w=0.5+er()*0.5,col=(day?[0x3f8f3a,0x5aa83f,0x2f7a4a]:[0x0e4a34,0x0b3a3a,0x1a5a2a])[Math.floor(er()*3)];
      for(let k=0;k<8;k++)kelp.push({x,z,y0:floorY,k,seg,ph,w,amp:(k/8)**1.5*h*0.09,sx:2.4-k*0.16,c:col})}
    /* shoals: fish circling a centre, each at its own spot in the shoal; well under (or over) any road they pass */
    const nSh=[3,5,8,12][dens];for(let q=0;q<nSh*4&&schools.length<nSh;q++){const cx=minX+er()*(maxX-minX),cz=minZ+er()*(maxZ-minZ),R0=50+er()*130,hN=near(cx,cz,R0+40);
      let y=hN?hN.lo-26-er()*20:floorY+20+er()*60;if(y<floorY+12){if(!hN)continue;y=hN.hi+26+er()*20}
      const n=22+Math.floor(er()*22),col=(day?[0xdfe8f0,0xffd84a,0x5ab0ff,0xff9a4a]:[0x5ff0ff,0xff5ad8,0xb98cff,0x46ff8c])[schools.length%4],si=schools.length;
      schools.push({cx,cz,y,R:R0,w:(0.1+er()*0.08)*(er()<0.5?-1:1),ph:er()*TAU});for(let k=0;k<n;k++)fish.push({si,off:er()*0.6,r:(er()-.5)*16,h:(er()-.5)*9,s:0.8+er()*0.5,c:col})}
    /* jellyfish at every depth (pale and few by day, neon at night) */
    const nJ=(day?[2,4,6,8]:[8,14,20,28])[dens];for(let t=0;t<1500&&jel.length<nJ*6;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+34)||!free(x,z,8))continue;
      const y=floorY+14+er()*(maxY-floorY+60),c=day?[0xffd6ec,0xe8f4ff,0xd8c8ff][Math.floor(er()*3)]:[0xff5ad8,0x5ff0ff,0xb98cff,0x46ff8c][Math.floor(er()*4)],sz=4+er()*5,ph=er()*TAU,w=0.5+er()*0.5;
      jel.push({x,y,z,sx:sz,sy:sz*0.55,sz:sz,ry:er()*3,c,ph,w,dx:0,dz:0});for(let k=0;k<4;k++){const a=k*TAU/4+0.4;jel.push({x,y:y-sz*0.9,z,sx:0.25,sy:sz*1.3,sz:0.25,ry:0,c,ph,w,dx:Math.cos(a)*sz*0.3,dz:Math.sin(a)*sz*0.3,tent:1})}jel.push({x,y:y+sz*0.05,z,sx:sz*0.45,sy:sz*0.35,sz:sz*0.45,ry:0,c:0xffffff,ph,w,dx:0,dz:0})}
    /* shafts of sunlight from the surface */
    if(day){const nL=[8,14,20,28][dens];for(let k=0;k<nL;k++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600),top=maxY+170,L=top-floorY;rays.push({x,y:top-L/2,z,sx:6+er()*12,sy:L,sz:2+er()*3,ry:er()*3,c:0xffffff})}
      IM(new THREE.MeshBasicMaterial({color:0xd8fbff,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false}),rays)}
  }
  if(bk==='U'){
  if(day)daySky();
  }else if(bk==='O'){
  if(day)daySky();else starSky({sea:true});
  }else if(bk==='F'){
  if(day)daySky();
  }else if(bk==='N'){
  if(day)daySky({below:true});else starSky();
  }else if(bk==='R'){
  const sc=document.createElement('canvas');sc.width=1024;sc.height=512;const g=sc.getContext('2d'),gr=g.createLinearGradient(0,0,0,512),rr=rng((seed^0x5EA)>>>0);
    for(const[f,c]of day?[[0,'#d4fbff'],[0.18,'#86dcee'],[0.42,'#33a4c4'],[0.5,'#1f86a6'],[0.62,'#145e7e'],[1,'#062238']]:[[0,'#0e3a4e'],[0.3,'#062330'],[0.5,'#01101a'],[1,'#000306']])gr.addColorStop(f,c);
    g.fillStyle=gr;g.fillRect(0,0,1024,512);
    if(day){const sx=0.407*1024,sg=g.createRadialGradient(sx,40,0,sx,40,150);sg.addColorStop(0,'rgba(255,255,240,.9)');sg.addColorStop(1,'rgba(255,255,240,0)');g.fillStyle=sg;g.fillRect(sx-160,0,320,200)}
    else for(let k=0;k<700;k++){g.fillStyle=['rgba(95,240,255,','rgba(255,90,216,','rgba(70,255,140,'][k%3]+(0.2+rr()*0.5)+')';g.fillRect(rr()*1024,rr()*512,1,1)}
    dome(sc)
  }else if(bk==='P'){
  if(day)daySky();else starSky();
  }
  if(bk==='F'){
  if(trunks.length){IM(lam(0x1c140e,0x070403),trunks);IM(lam(0x16110c,0x050302),plinths);IM(new THREE.MeshBasicMaterial({color:0x46ff8c}),bands);IM(lam(0x12401f,0x04160a),canopy);lines(canopy,new THREE.LineBasicMaterial({color:0x2fd06a}));lines(trunks,new THREE.LineBasicMaterial({color:0x46ff8c}))}
  }
  if(bk==='U'){
  buildTunnels({grounded:true,shell:()=>({sideW:16+er()*14,roof:26+er()*40}),TC:[0x1a1e25,0x05060a,0xffb000],
    outM:avgH=>{const m=new THREE.MeshLambertMaterial({map:winTex.clone(),emissive:0xffffff,side:THREE.DoubleSide});m.map.needsUpdate=true;m.map.repeat.set(Math.max(1,avgH/14),1);m.emissiveMap=m.map;return m}});
  }else if(bk==='O'){
  buildTunnels({TC:[0xd9dde2,0x1a2026,0x9fe8ff]});
  }else if(bk==='F'){
  buildTunnels({grounded:true,shell:()=>({sideW:6,roof:8}),TC:[0x22180f,0x070402,0x46ff8c]});
  }else if(bk==='N'){
  buildTunnels({TC:[0x0c0e16,0x020308,0x3ff0ff]});
  }else if(bk==='R'){
  buildTunnels({TC:[0x0f2a33,0x03121a,0x3ff0ff]});
  }
  if(bk==='P'){
  /* ---------- Prism (Prototype 51, reworked in 52) ----------
     A mountain range of dark textured rock with a faint shimmer of oil-on-water colours (strongest where you see a slope
     edge-on), and caverns inside it. Each map is all outside, all inside the mountain, or (most often) in and out of it.
     Outside, the road is cut into the mountainside: a ledge with the slope rising on one side and falling away on the other,
     along a crest, or down a cutting, and columns hold it up wherever the ground drops away. Inside, it runs through huge
     caverns, up to a few hundred metres wide and high, held up on columns over the cavern floor, past stalactites and
     stalagmites tens of metres long; the caverns are dark but for glow worms on the roof, pools of lava and of glowing water,
     and the lava falls and waterfalls that pour into them from the roof, and their light is baked into the rock round them.
     Calderas on the outer peaks hold lava lakes with lava geysers. Three height fields on one grid: the mountain's outside
     (M), and in the caverns their floor (F) and roof (C); where the road goes in, the triangles that would cross it are left
     out, which makes the cave mouths. */
  const prismM=[],PR={};
    PR.meshes=[];const pr=rng((seed^0x9815)>>>0),hs=[];for(let k=0;k<512;k++)hs.push(pr());
    const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,h=(a,b)=>hs[((a*73856093)^(b*19349663))>>>0&511],u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
      return h(xi,zi)*(1-u)*(1-v)+h(xi+1,zi)*u*(1-v)+h(xi,zi+1)*(1-u)*v+h(xi+1,zi+1)*u*v};
    const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
    /* ridged noise: sharp crests, broad valleys */
    const ridge=(x,z)=>{let s=0,a=1,f=1/620,n=0;for(let o=0;o<4;o++){const r=1-Math.abs(2*vn(x*f+o*17.3,z*f-o*9.1)-1);s+=a*r*r;n+=a;a*=0.5;f*=2.1}return s/n};
    const base=minY-120,top=maxY+300,H0=(x,z)=>base+(top-base)*Math.pow(ridge(x,z),1.35);
    /* the plan: about one map in five all outside, one in five all inside, the rest in and out */
    const mr=pr(),mode=mr<0.2?'out':mr<0.4?'in':'mix',ins=new Uint8Array(N);
    if(mode==='in')ins.fill(1);
    else if(mode==='mix'){const f=new Float32Array(N);for(let i=0;i<N;i++)f[i]=vn(i*ds/420,7.7)*0.7+vn(i*ds/150,3.3)*0.3;
      const so=Array.from(f).sort((a,b)=>a-b),thr=so[Math.floor(N*0.58)];for(let i=0;i<N;i++)ins[i]=f[i]>thr?1:0;
      /* no stretch outside shorter than 140 m, none inside shorter than 260 m */
      const tidy=(v,minL)=>{let s=-1;for(let i=0;i<N;i++)if(ins[i]!==v){s=i;break}if(s<0)return;
        for(let k=0;k<N;){const i=(s+k)%N;if(ins[i]!==v){k++;continue}let n=0;while(n<N-k&&ins[(i+n)%N]===v)n++;if(n*ds<minL)for(let j=0;j<n;j++)ins[(i+j)%N]=1-v;k+=n}};
      tidy(0,140);tidy(1,260);
      /* Prototype 60: no way in or out of the mountain on a feature (a jump, loop, twist, corkscrew, helix or spire) or a
         split, nor within 60 m of one. The cave mouth's tunnel follows the centreline and the cavern can't close round a
         road that flies, rolls or stacks there, so those ways in were open to the sky (NX130F38-P's way out on a jump and
         in a loop, NXD8C77A-P's way in on a spire), and on a split the tunnel stood between the two routes, in both of
         them (NX130F38-P, SLC32957-P, NXL1FDB51-...-P3443). Each such stretch now lies wholly on the side most of it was
         on; tidying again only merges stretches, so it never adds a way in. */
      const bz=new Uint8Array(N),mg=Math.round(60/ds);for(let i=0;i<N;i++)if(kind[i]||gap[i]||spl[i])for(let k=-mg;k<=mg;k++)bz[((i+k)%N+N)%N]=1;
      let s0=-1;for(let i=0;i<N;i++)if(!bz[i]){s0=i;break}
      if(s0<0){let c=0;for(let i=0;i<N;i++)c+=ins[i];ins.fill(c*2>=N?1:0)}
      else for(let k=0;k<N;){const i=(s0+k)%N;if(!bz[i]){k++;continue}let n=0,c=0;while(k+n<N&&bz[(s0+k+n)%N]){c+=ins[(s0+k+n)%N];n++}const v=c*2>=n?1:0;for(let j=0;j<n;j++)ins[(s0+k+j)%N]=v;k+=n}
      /* Prototype 60: and no stretch inside where it crosses over or under a stretch outside (within W+40 m across, and
         more than 300 m away round the lap): a cavern can't be both round the one and open over the other, so the
         cavern was faded out there and the road "inside" ran through open air, holes to the sky all round it
         (WXQD87244-33224444222-P at 2.7 km, SXLB8350A-P at 6.6 km). It's outside there, from 60 m before to 60 m
         after (and over the whole of any feature it touches), so it crosses on columns in the open. */
      {const H=new Map(),HC=40,hk=(a,b)=>a*65537+b;for(let i=0;i<N;i+=2){const k=hk(Math.floor(P[i].x/HC),Math.floor(P[i].z/HC));let L=H.get(k);if(!L)H.set(k,L=[]);L.push(i)}
       const cr=new Uint8Array(N),far=Math.round(300/ds),RC=W+40;
       for(let i=0;i<N;i++){if(!ins[i])continue;const p=P[i],a0=Math.floor((p.x-RC)/HC),a1=Math.floor((p.x+RC)/HC),b0=Math.floor((p.z-RC)/HC),b1=Math.floor((p.z+RC)/HC);let hit=false;
         for(let a=a0;a<=a1&&!hit;a++)for(let b=b0;b<=b1&&!hit;b++){const L=H.get(hk(a,b));if(L)for(const j of L){if(ins[j])continue;const dj=Math.abs(j-i),dd=Math.min(dj,N-dj);if(dd>far&&(P[j].x-p.x)**2+(P[j].z-p.z)**2<RC*RC){hit=true;break}}}
         if(hit)cr[i]=1}
       const cz=new Uint8Array(N);for(let i=0;i<N;i++)if(cr[i])for(let k=-mg;k<=mg;k++)cz[((i+k)%N+N)%N]=1;
       if(s0>=0)for(let k=0;k<N;){const i=(s0+k)%N;if(!bz[i]){k++;continue}let n=0,c=0;while(k+n<N&&bz[(s0+k+n)%N]){c+=cz[(s0+k+n)%N];n++}if(c)for(let j=0;j<n;j++)cz[(s0+k+j)%N]=1;k+=n}
       for(let i=0;i<N;i++)if(cz[i])ins[i]=0}
      tidy(0,140);tidy(1,260)}
    const{scan,tilt,inRoad,clearTri}=roadSpace(ins);
    /* the slope across the road, stretch by stretch: a ledge (the mountain up on one side), a crest, or a cutting */
    const prof=i=>{const v=vn(i*ds/520,11.1);return v<0.32?-1:v<0.64?1:v<0.82?2:3};
    const Mg=780,x0=minX-Mg,x1=maxX+Mg,z0=minZ-Mg,z1=maxZ+Mg,cs=Math.max(RES.low?26:16,Math.max(x1-x0,z1-z0)/(RES.low?110:180)),nx=Math.ceil((x1-x0)/cs)+1,nz=Math.ceil((z1-z0)/cs)+1,NV=nx*nz;
    const Mh=new Float32Array(NV),Fh=new Float32Array(NV),Ch=new Float32Array(NV),Wz=new Float32Array(NV),Lo=new Float32Array(NV).fill(1e9);
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=x0+i*cs,z=z0+j*cs;
      let bd=1e18,bo=null,od=1e18,oo=null,hiI=-1e9,loI=1e9,loO=1e9,di=1e18;
      scan(x,z,330,(o,d2)=>{if(d2<bd){bd=d2;bo=o}if(o.n){hiI=Math.max(hiI,o.y);loI=Math.min(loI,o.y);if(d2<di)di=d2}else{if(d2<od){od=d2;oo=o}if(d2<(W/2+8)**2)loO=Math.min(loO,o.y)}});
      /* outside: the natural mountain, pulled near the road into the shape of its stretch */
      let h=H0(x,z)+(vn(x/45,z/45)-0.5)*14;
      if(oo){const d=Math.sqrt(od),r=R[oo.i],rl=Math.hypot(r.x,r.z)||1,l=((x-oo.x)*r.x+(z-oo.z)*r.z)/rl,pf=prof(oo.i),sl=0.8+0.7*vn(oo.i*ds/300,2.2),l0=W/2+5;
        const dr=12+34*vn(oo.i*ds/260,5.5),T=pf===2?oo.y-dr-0.75*Math.abs(l):pf===3?oo.y-4+0.95*Math.max(0,Math.abs(l)-l0):pf*l>l0?oo.y+sl*(pf*l-l0):oo.y-dr*Math.min(1,(l0-pf*l)/l0)-sl*1.3*Math.max(0,-pf*l);
        h+= (T+(vn(x/60+3,z/60)-0.5)*16-h)*(1-sm(150,480,d))}
      if(loO<1e9){Lo[k]=loO-3-(gap[oo?oo.i:0]?50:0);h=Math.min(h,Lo[k])}
      /* the caverns: round the road inside, within a radius that wanders from 150 to 260 m */
      /* (P55) by the distance to the road inside, faded out as an outside stretch of road comes near (it used to stop dead
         halfway between the two, in a sheer flat wall from roof to floor) */
      let w=0;if(di<1e18){const Rz=150+110*vn(x/300+9,z/300);w=(1-sm(Rz*0.55,Rz,Math.sqrt(di)))*(od<1e18?sm(W/2+14,W/2+80,Math.sqrt(od)):1);
        /* Prototype 60: but never less than a narrow cavern round the road inside itself, unless the outside road is right
           there (at a cave mouth): where an outside stretch ran within 80 m, the fade took the cavern away altogether and
           the road "inside" ran in an open cutting under the sky, with nothing between it and the outside (holes to the
           sky in Eric's photos of NX130F38-P, SXLB8350A-P, WXQD87244-...-P) */
        if(od<1e18)w=Math.max(w,0.6*(1-sm(W/2+22,W/2+48,Math.sqrt(di)))*sm(W/2+10,W/2+34,Math.sqrt(od)));
        if(w<0.02)w=0}
      if(w>0){const F=loI-14-95*vn(x/190,z/190+4)-12*vn(x/35,z/35),Ct=hiI+45+175*vn(x/240+5,z/240)+16*vn(x/40+1,z/40);Fh[k]=F;Ch[k]=F+(Ct-F)*sm(0,1,w);h=Math.max(h,Ch[k]+30+20*vn(x/80,z/80+2))}
      Mh[k]=h;Wz[k]=w}
    /* smooth the outside twice (where the road twists, as round a spire, the shaping left needles), then cut the road's
       shelf and raise the caverns' cover again */
    for(let it=0;it<2;it++){const A=Mh.slice();for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;Mh[k]=(A[k]*4+A[k-1]+A[k+1]+A[k-nx]+A[k+nx])/8}
      for(let k=0;k<NV;k++){if(Lo[k]<1e9)Mh[k]=Math.min(Mh[k],Lo[k]);if(Wz[k]>0)Mh[k]=Math.max(Mh[k],Ch[k]+30)}}
    const bil=(A,x,z)=>{const fi=clamp((x-x0)/cs,0,nx-1.001),fj=clamp((z-z0)/cs,0,nz-1.001),i=Math.floor(fi),j=Math.floor(fj),u=fi-i,v=fj-j,k=j*nx+i;return A[k]*(1-u)*(1-v)+A[k+1]*u*(1-v)+A[k+nx]*(1-u)*v+A[k+nx+1]*u*v};
    const zoneAt=(x,z)=>{const i=Math.round(clamp((x-x0)/cs,0,nx-1)),j=Math.round(clamp((z-z0)/cs,0,nz-1));return Wz[j*nx+i]>0};
    PR.inside=(x,y,z)=>zoneAt(x,z)&&y<bil(Ch,x,z)-1&&y>bil(Fh,x,z);PR.h=(x,z)=>bil(Mh,x,z);PR.f=(x,z)=>bil(Fh,x,z);PR.c=(x,z)=>bil(Ch,x,z);PR.ground=(x,z)=>zoneAt(x,z)?bil(Fh,x,z):bil(Mh,x,z);PR.mode=mode;PR.ins=ins;
    const zv=[];for(let k=0;k<NV;k++)if(Wz[k]>0.75)zv.push(k);const vx=k=>x0+(k%nx)*cs,vz=k=>z0+Math.floor(k/nx)*cs;
    const em=[];/* lights baked into the cavern rock: {x,y,z,r,c:[r,g,b]} */
    const skirts=[];/* Prototype 60: rock skirts hung from the edges of lakes and pools, built with the rock (skirt(), below) */
    /* lakes and rivers: a flowing glow of lava or of water */
    const liquid=(water)=>{const m=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uT:{value:0},uW:{value:water?1:0}},
      vertexShader:`varying vec3 vW;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
      fragmentShader:`uniform float uT;uniform float uW;varying vec3 vW;float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1,0)),u.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),u.x),u.y);}
void main(){vec2 q=vW.xz+vec2(uT*(uW>0.5?3.0:1.2),uT*0.7);float n=vn(q/16.0)*0.6+vn(q/4.5)*0.4;vec3 a=uW>0.5?vec3(0.04,0.3,0.8):vec3(1.0,0.22,0.03),b=uW>0.5?vec3(0.45,0.85,1.0):vec3(1.0,0.75,0.2);gl_FragColor=vec4(mix(a,b,smoothstep(0.55,0.85,n)),1.0);}`});prismM.push(m);return m};
    /* rivers under the road through the caverns, of lava or of glowing water, each in a bed of its own */
    const rivers=[],segs=[];
    if(mode==='in')for(let u=200;u+700<N*ds;u+=1600)segs.push([Math.round(u/ds),Math.round(700/ds)]);
    else if(mode==='mix'){let i=0;while(i<N){if(!ins[i]){i++;continue}let n=0;while(i+n<N&&ins[i+n])n++;if(n*ds>420)segs.push([i+Math.round(90/ds),Math.min(n-Math.round(180/ds),Math.round(700/ds))]);i+=n}}
    segs.forEach(([i0,n],k)=>{const water=k%2===1,pts=[],st=Math.max(1,Math.round(6/ds));let yPrev=null;
      for(let s=0;s<=n;s+=st){const i=(i0+s)%N,p=P[i],r=R[i],rl=Math.hypot(r.x,r.z)||1;let y=Math.min(bil(Fh,p.x,p.z)+4,p.y-22);if(yPrev!=null)y=yPrev+clamp(y-yPrev,-1.5,1.5);yPrev=y;pts.push({x:p.x,z:p.z,y,rx:r.x/rl,rz:r.z/rl,w:44*(0.8+0.4*Math.sin(s*ds*0.012+k))})}
      /* (P54) never above any road over it (where the road dives faster than the river can follow, or another stretch
         crosses it lower down): cap it well under every road over its width, then ease it down to the caps both ways */
      for(const q of pts)scan(q.x,q.z,q.w+W/2+4,o=>{q.y=Math.min(q.y,o.y-14)});
      for(let j=1;j<pts.length;j++)pts[j].y=Math.min(pts[j].y,pts[j-1].y+1.5);for(let j=pts.length-2;j>=0;j--)pts[j].y=Math.min(pts[j].y,pts[j+1].y+1.5);
      /* the bed: the floor under and beside it set just below it */

      const pos=[],ind=[];pts.forEach((q,j)=>{pos.push(q.x-q.rx*q.w,q.y,q.z-q.rz*q.w,q.x+q.rx*q.w,q.y,q.z+q.rz*q.w);if(j)ind.push((j-1)*2,j*2,(j-1)*2+1,(j-1)*2+1,j*2,j*2+1)});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);group.add(new THREE.Mesh(g,liquid(water)));
      pts.forEach((q,j)=>{if(j%7===0)em.push({x:q.x,y:q.y+6,z:q.z,r:75,c:water?[0.04,0.16,0.34]:[0.55,0.16,0.03]})});rivers.push(pts)});
    const beds=()=>{for(const pts of rivers)for(const q of pts)for(let k2=0;k2<NV;k2++){if(Wz[k2]<=0)continue;const d=Math.hypot(vx(k2)-q.x,vz(k2)-q.z);if(d<q.w+cs*1.2)Fh[k2]=Math.min(Fh[k2],q.y-5)}};
    /* pools on the cavern floor, of lava or of glowing water; most have a fall pouring into them from the roof */
    const pools=[],nPool=zv.length?Math.max(2+nFall,Math.round(zv.length*cs*cs/(330*330)))+(dens>=2?1:0):0;
    const vAt=(x,z)=>Math.round(clamp((z-z0)/cs,0,nz-1))*nx+Math.round(clamp((x-x0)/cs,0,nx-1));
    const tryPool=(x,z)=>{const k=vAt(x,z),r=26+pr()*34;if(Wz[k]<0.75||Ch[k]-Fh[k]<90||pools.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+r+160)||rivers.some(L=>L.some(q=>Math.hypot(q.x-x,q.z-z)<q.w+r*1.8+20)))return;
      let ok=true;scan(x,z,r+8,(o)=>{if(o.y<Fh[k]+20)ok=false});if(ok)pools.push({x,z,r,lv:Fh[k]+1,lava:pools.length%2===0})};
    /* one every 400 m or so along the road inside, so no stretch of cavern is pitch dark; then a few anywhere */
    for(let i=0;i<N;i+=Math.round(400/ds)){if(!ins[i])continue;for(let t=0;t<8;t++){const n0=pools.length,a=pr()*TAU,d=50+pr()*150;tryPool(P[i].x+Math.cos(a)*d,P[i].z+Math.sin(a)*d);if(pools.length>n0)break}}
    for(let t=0;t<900&&pools.length<nPool;t++){const k=zv[Math.floor(pr()*zv.length)];tryPool(vx(k),vz(k))}
    for(const p of pools){for(let k=0;k<NV;k++){if(Wz[k]<=0)continue;const d=Math.hypot(vx(k)-p.x,vz(k)-p.z);if(d<p.r)Fh[k]=Math.min(Fh[k],p.lv-3);else if(d<p.r*1.7)Fh[k]=Math.max(Fh[k],p.lv+1+(d-p.r)*0.2)}
      const m=new THREE.Mesh(new THREE.CylinderGeometry(p.r,p.r,0.6,24),new THREE.MeshBasicMaterial({color:p.lava?0xff5212:0x2a9be8}));m.position.set(p.x,p.lv,p.z);group.add(m);skirts.push({x:p.x,z:p.z,y:p.lv+0.28,rho:()=>p.r,n:24,dep:24,out:8,inside:true});
      const m2=new THREE.Mesh(new THREE.CylinderGeometry(p.r*0.55,p.r*0.55,0.6,18),new THREE.MeshBasicMaterial({color:p.lava?0xffa030:0x7fd8ff}));m2.position.set(p.x+p.r*0.15,p.lv+0.15,p.z-p.r*0.1);group.add(m2);
      em.push({x:p.x,y:p.lv+8,z:p.z,r:p.r*3.5,c:p.lava?[0.8,0.24,0.04]:[0.05,0.2,0.42]});
      const roof=bil(Ch,p.x,p.z);let fx=0,fz=0,fw=10+pr()*10,fok=false;
      /* a fall never pours through the road: somewhere over the pool clear of it */
      for(let t=0;t<14&&!fok;t++){const a=pr()*TAU,rr=pr()*p.r*0.7;fx=p.x+Math.cos(a)*rr;fz=p.z+Math.sin(a)*rr;fok=true;scan(fx,fz,W/2+fw+8,()=>{fok=false})}
      if(fok&&fallsL.length<nFall*2+2&&roof-p.lv>60){
        fallsL.push({x:fx,z:fz,top:bil(Ch,fx,fz)-2,bot:p.lv,w:fw,dir:pr()*TAU,lava:p.lava,n:Math.round(clamp((roof-p.lv)*0.9,110,240))});
        for(const q of[0.2,0.5,0.8])em.push({x:fx,y:p.lv+(roof-p.lv)*q,z:fz,r:110,c:p.lava?[0.6,0.2,0.03]:[0.08,0.2,0.36]})}
      /* Prototype 61: a cavern geyser stays under the mountain's outside too (the roof field can stand above it near the cavern's edge, and the jet came out through the slope: Eric saw one on W1AAE848-P) */
      if(p.lava&&geys.length<nGey+2&&pr()<0.7){const gh=Math.min(110,roof-p.lv-20,bil(Mh,p.x,p.z)-p.lv-14);if(gh>=25)geys.push({x:p.x,z:p.z,base:p.lv,h:gh,per:6+pr()*5,ph:pr()*12,lava:1})}}
    beds();
    /* lakes in the valleys under the road outside, of lava or of water, where it stands highest above the ground; a rim is
       raised round each (never into the road) so the lake never shows an edge */
    const lakes=[];if(mode!=='in'){const L=[];for(let i=0;i<N;i+=Math.round(40/ds)){if(ins[i]||gap[i]||kind[i])continue;const p=P[i],g=bil(Mh,p.x,p.z);if(p.y-g>32&&!zoneAt(p.x,p.z))L.push([p.y-g,i])}
      L.sort((a,b)=>b[0]-a[0]);for(const[d,i]of L){if(lakes.length>=(dens>=2?3:2))break;const p=P[i];if(lakes.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<700))continue;
        const lv=bil(Mh,p.x,p.z)+6,R0=170+pr()*90;let bad=false;for(let k=0;k<NV&&!bad;k++)if(Wz[k]>0&&Math.hypot(vx(k)-p.x,vz(k)-p.z)<Math.max(R0*1.25,R0*1.18+2.5*cs))bad=true;
        /* (P54) and no other stretch of road (or a split route) may pass lower than well above it anywhere over it */
        /* (Prototype 60: over its rim too, which is wider now, below) */
        scan(p.x,p.z,Math.max(R0*1.4,R0*1.18+3*cs)+W/2+4,o=>{if(o.y<lv+14)bad=true});if(bad)continue;
        lakes.push({x:p.x,z:p.z,lv,r:R0,lava:lakes.length%2===0})}
      /* Prototype 60: the lake's sheet reached 4 to 32% past the bed, into a rim only a third of its radius wide, and the
         ground is a grid of 16 to 26 m cells: where the valley fell away outside the rim, a cell under the sheet's edge
         sloped down from the rim and the edge stood out of the slope, a flat sheet floating over the valley when seen from
         the side. Now the sheet's edge lies at least one and a half cells inside a rim that stands 3 to 9 m over the lake
         all the way round it, so every cell the edge crosses is rim and the edge is under the rock; outside, the rim falls
         away as a bank, and a skirt of rock hangs from the edge (skirt(), below) in case anything still leaves it open. */
      for(const q of lakes){const RR=q.r*1.18+3*cs;q.rho=a=>q.r+1.5*cs+q.r*(0.09+0.06*Math.sin(a*3+q.r)+0.03*Math.sin(a*7));
        for(let k=0;k<NV;k++){const d=Math.hypot(vx(k)-q.x,vz(k)-q.z);if(d<q.r)Mh[k]=Math.min(Mh[k],q.lv-1.5+(vn(vx(k)/30,vz(k)/30)>0.82?4:0));else if(d<RR)Mh[k]=Math.max(Mh[k],q.lv+3+6*vn(vx(k)/45+2,vz(k)/45));else if(d<RR+90)Mh[k]=Math.max(Mh[k],q.lv+3-(d-RR)*0.8);Mh[k]=Math.min(Mh[k],Lo[k]);if(Wz[k]>0)Mh[k]=Math.max(Mh[k],Ch[k]+30)}
        const g=new THREE.CircleGeometry(1,56);g.rotateX(-Math.PI/2);const A=g.attributes.position;for(let k=1;k<A.count;k++){const a=Math.atan2(A.getZ(k),A.getX(k)),sc=q.rho(a);A.setX(k,A.getX(k)*sc);A.setZ(k,A.getZ(k)*sc)}
        const m=new THREE.Mesh(g,liquid(!q.lava));m.position.set(q.x,q.lv,q.z);group.add(m);skirts.push({x:q.x,z:q.z,y:q.lv,rho:q.rho,n:56,dep:60,out:30,inside:false})}}
    /* calderas: craters on outer peaks well away from the road and the caverns, with lava lakes and lava geysers */
    const cal=[];if(mode!=='in')for(let t=0;t<500&&cal.length<(dens>=2?3:2);t++){const x=x0+pr()*(x1-x0),z=z0+pr()*(z1-z0),h=bil(Mh,x,z);if(h<base+(top-base)*0.5||zoneAt(x,z)||lakes.some(q=>Math.hypot(q.x-x,q.z-z)<q.r*1.4+300))continue;
      let nr=false;scan(x,z,380,()=>{nr=true});if(nr||cal.some(c=>(c.x-x)**2+(c.z-z)**2<500**2))continue;cal.push({x,z,r:70+pr()*40,h})}
    for(const c of cal)for(let k=0;k<NV;k++){if(Wz[k]>0)continue;const d=Math.hypot(vx(k)-c.x,vz(k)-c.z);if(d<c.r)Mh[k]=c.h-40+46*(d/c.r)**3;else if(d<c.r*2)Mh[k]=Math.max(Mh[k],c.h+6-(d-c.r)*0.9)}
    for(const c of cal){const m=new THREE.Mesh(new THREE.CylinderGeometry(c.r*0.54,c.r*0.54,0.6,20),new THREE.MeshBasicMaterial({color:0xff5a12}));m.position.set(c.x,c.h-36,c.z);group.add(m);skirts.push({x:c.x,z:c.z,y:c.h-35.72,rho:()=>c.r*0.54,n:20,dep:16,out:5,inside:false});
      /* Prototype 61: only a crater on a summit throws geysers. One dug into a mountain's shoulder, with ground 100 m or more over
         its lake just beyond the rim, keeps its lake but no jets: from the road below, the jet stood on the slope with no
         crater in sight (Eric, W1AAE848-P: "one random lava geyser on the outside slope of a mountain") */
      let hiG=-1e9;for(let a=0;a<16;a++)hiG=Math.max(hiG,bil(Mh,c.x+Math.cos(a/16*TAU)*c.r*1.3,c.z+Math.sin(a/16*TAU)*c.r*1.3));const jets=hiG-(c.h-36)<100;
      for(let k=0;k<2;k++){const a=pr()*TAU,rr=pr()*c.r*0.4,g={x:c.x+Math.cos(a)*rr,z:c.z+Math.sin(a)*rr,base:c.h-40,h:90+pr()*80,per:5+pr()*5,ph:pr()*12,lava:1};if(jets)geys.push(g)}}
    /* falls down the outer cliffs, water or lava */
    if(mode!=='in')for(let t=0;t<1500&&fallsL.filter(f=>f.out).length<nFall;t++){const x=x0+pr()*(x1-x0),z=z0+pr()*(z1-z0);if(zoneAt(x,z))continue;let nr=false;scan(x,z,W/2+110,()=>{nr=true});if(nr)continue;const b0=bil(Mh,x,z);
      let best=null;for(let a=0;a<8;a++){const dx=Math.cos(a/8*TAU),dz=Math.sin(a/8*TAU),h2=bil(Mh,x+dx*24,z+dz*24);if(!best||h2>best.h2)best={h2,dx,dz}}
      if(best.h2-b0<55||cal.some(c=>Math.hypot(x-c.x,z-c.z)<c.r*2.2)||fallsL.some(f=>Math.hypot(x-f.x,z-f.z)<350))continue;const lava=pr()<0.45,fw=12+pr()*10,dir=Math.atan2(-best.dx,-best.dz);
      fallsL.push({x,z,top:best.h2-6,bot:b0,w:fw,dir,lava,out:1});const m=new THREE.Mesh(new THREE.CylinderGeometry(fw*0.9,fw*0.9,0.6,16),new THREE.MeshBasicMaterial({color:lava?0xff5a12:0x2f8fd8}));m.position.set(x-best.dx*8,b0+0.4,z-best.dz*8);group.add(m);skirts.push({x:x-best.dx*8,z:z-best.dz*8,y:b0+0.68,rho:()=>fw*0.9,n:16,dep:24,out:8,inside:false})}
    /* stalactites from the roof, stalagmites from the floor (never in the road's way), and a few pillars where they meet */
    let nSpk=0;const SV=[],SI=[],spike=(x,yb,z,len,rad,dir,shape)=>{const rs=7,hs2=6,b=SV.length/3,tw=pr()*TAU,lean=[(pr()-0.5)*0.25*len,(pr()-0.5)*0.25*len];
      for(let a=0;a<=hs2;a++){const t=a/hs2,rr=rad*(shape?(0.55+0.45*Math.abs(2*t-1)**1.5):Math.pow(1-t,1.15))*(a===hs2&&!shape?0:1);
        for(let q=0;q<rs;q++){const an=tw+q/rs*TAU,j=0.75+0.5*hs[(b+a*7+q*13)&511];SV.push(x+Math.cos(an)*rr*j+lean[0]*t*t,yb+dir*len*t,z+Math.sin(an)*rr*j+lean[1]*t*t)}}
      /* (P54) one that leans into the road's space is left out (checked along its axis and round every ring) */
      for(let a=0;a<=hs2;a++){const t=a/hs2;if(inRoad(x+lean[0]*t*t,yb+dir*len*t,z+lean[1]*t*t)){SV.length=b*3;return}for(let q=0;q<rs;q++){const k=(b+a*rs+q)*3;if(inRoad(SV[k],SV[k+1],SV[k+2])){SV.length=b*3;return}}}
      nSpk++;for(let a=0;a<hs2;a++)for(let q=0;q<rs;q++){const A=b+a*rs+q,B=b+a*rs+(q+1)%rs,C=A+rs,D=B+rs;SI.push(A,C,B,B,C,D)}};
    const nSp=Math.round(zv.length*cs*cs/(95*95)*(0.55+0.25*dens));
    for(let t=0;t<nSp*4&&nSpk<nSp;t++){const k=zv[Math.floor(pr()*zv.length)],x=vx(k)+(pr()-0.5)*cs,z=vz(k)+(pr()-0.5)*cs,Cv=bil(Ch,x,z),Fv=bil(Fh,x,z),gp=Cv-Fv;if(gp<70)continue;
      let dr=1e9,hiR=-1e9;scan(x,z,W/2+60,(o,d2)=>{dr=Math.min(dr,Math.sqrt(d2));hiR=Math.max(hiR,o.y)});const roll=pr();
      if(roll<0.5){let L=gp*(0.18+0.34*pr());const rad=L*(0.12+0.07*pr());if(dr<W/2+rad+10&&Cv-L<hiR+24)L=Cv-(hiR+24);if(L<18)continue;spike(x,Cv+4,z,L+4,rad,-1,0)}
      else if(roll<0.9){const L=gp*(0.14+0.34*pr()),rad=L*(0.15+0.07*pr());if(dr<W/2+rad+8||pools.some(p=>Math.hypot(p.x-x,p.z-z)<p.r*1.6+rad))continue;spike(x,Fv-4,z,L+4,rad,1,0)}
      else{const rad=12+pr()*18;if(dr<W/2+rad*1.1+10||gp>260)continue;spike(x,Fv-4,z,gp+8,rad,1,1)}}
    /* glow worms: clusters spread over the roof */
    const worms=[],wcol=[];const nCl=Math.round(zv.length*cs*cs/(200*200))*(RES.low?1:2)+(zv.length?3:0);
    for(let c=0;c<nCl;c++){const k=zv[Math.floor(pr()*zv.length)],cx=vx(k),cz=vz(k),cr=50+pr()*90,n=RES.low?80:220;let ok=0;
      for(let w=0;w<n;w++){const a=pr()*TAU,rr=Math.sqrt(pr())*cr,x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;if(!zoneAt(x,z))continue;const y=bil(Ch,x,z)-1.2;if(y-bil(Fh,x,z)<50)continue;worms.push(x,y,z);const g2=0.5+pr()*0.5,b2=pr()<0.15;wcol.push(b2?0.85*g2:0.3*g2,g2,b2?g2:0.8*g2);ok++}
      if(ok)em.push({x:cx,y:bil(Ch,cx,cz)-20,z:cz,r:cr*2,c:[0.04,0.13,0.12]})}
    if(worms.length){const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(worms,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(wcol,3));
      group.add(new THREE.Points(wg,new THREE.PointsMaterial({size:5,vertexColors:true,sizeAttenuation:true,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        map:(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(0.35,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})()})))}
    /* the rock: one material for the outside (lit, with the shimmer) and one for inside (dark but for the baked light) */
    const S3=new THREE.Vector3(-0.42,0.78,-0.46).normalize(),cl=h=>new THREE.Color(h);
    const rockMat=(inside)=>{const m=new THREE.ShaderMaterial({side:THREE.DoubleSide,fog:true,extensions:{derivatives:true},uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uIn:{value:inside?1:0},uSun:{value:S3},
        uSunC:{value:cl(LK.sun[0]).multiplyScalar(LK.sun[1])},uSky:{value:cl(LK.hemi[0]).multiplyScalar(LK.hemi[2]*(day?0.55:0.8))},uGnd:{value:cl(LK.hemi[1]).multiplyScalar(LK.hemi[2]*(day?0.55:0.8))}}]),
      vertexShader:`attribute vec3 aGlow;varying vec3 vW;varying vec3 vN;varying vec3 vV;varying vec3 vG;
#include <fog_pars_vertex>
void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vV=cameraPosition-wp.xyz;vG=aGlow;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uT;uniform float uIn;uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uSky;uniform vec3 uGnd;varying vec3 vW;varying vec3 vN;varying vec3 vV;varying vec3 vG;
#include <fog_pars_fragment>
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1,0)),u.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),u.x),u.y);}
void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 v=normalize(vV);
  float d1=vn(vW.xz/23.0+vec2(vW.y/31.0,0.0)),d2=vn(vW.xz/6.0+vec2(0.0,vW.y/7.0)),d3=vn(vW.xz/2.2-vec2(vW.y/2.5,0.0)),st=0.5+0.5*sin(vW.y*0.32+d1*5.0);
  float steep=1.0-abs(n.y);
  vec3 alb=mix(vec3(0.10,0.095,0.13),vec3(0.30,0.27,0.34),clamp(d1*0.5+d2*0.25+st*0.35*steep,0.0,1.0))*(0.8+0.25*d2+0.15*d3);
  float fr=pow(1.0-max(dot(n,v),0.0),2.0);
  float film=vn(vW.xz/150.0+vec2(uT*0.012,0.0))*1.5+fr*0.8+d2*0.3+vW.y/480.0;
  vec3 ir=0.5+0.5*cos(6.2832*(film+vec3(0.0,0.33,0.67)));
  vec3 c;
  /* contours: a glowing line every 10 m of height and a stronger one every 50 m, in colours that run through the rainbow with height */
  float y1=vW.y/10.0,f1=fract(y1),w1=fwidth(y1),ln=1.0-smoothstep(0.0,w1*1.6,min(f1,1.0-f1));
  float y2=vW.y/50.0,f2=fract(y2),w2=fwidth(y2),ln2=1.0-smoothstep(0.0,w2*2.4,min(f2,1.0-f2));
  vec3 col=0.5+0.5*cos(6.2832*(vW.y/260.0+vn(vW.xz/400.0)*0.6+uT*0.01+vec3(0.0,0.33,0.67)));
  if(uIn<0.5){float dif=max(dot(n,uSun),0.0);c=alb*0.12*(uSunC*dif+mix(uGnd,uSky,n.y*0.5+0.5))*4.0+col*(ln*0.9+ln2*0.6)+col*0.05*fr;}
  else{vec3 g=vG/(0.55+vG)*0.95;c=alb*(vec3(0.03,0.028,0.05)+g*1.9)+g*0.05+col*ln*0.35;}
  gl_FragColor=vec4(c,1.0);
  /* the haze: inside the mountain it is dark (seen from outside too, through a cave mouth, even by day) */
#ifdef USE_FOG
  float fogF=smoothstep(fogNear,fogFar,fogDepth);gl_FragColor.rgb=mix(gl_FragColor.rgb,uIn>0.5?fogColor*0.05:fogColor,fogF);
#endif
}`});prismM.push(m);return m};
    /* the road's own lights glow faintly on the rock round it, so the cavern's shape shows all the way along */
    for(let i=0;i<N;i+=Math.round(45/ds))if(ins[i])em.push({x:P[i].x,y:P[i].y+4,z:P[i].z,r:55,c:[0.07,0.05,0.02]});
    /* bake the cavern lights into the rock round them */
    const glowAt=(x,y,z,out,o)=>{let r=0,g=0,b=0;for(const e of em){const d2=(e.x-x)**2+(e.y-y)**2+(e.z-z)**2;if(d2>16*e.r*e.r)continue;const k=1/(1+2.2*d2/(e.r*e.r));r+=e.c[0]*k;g+=e.c[1]*k;b+=e.c[2]*k}out[o]=r;out[o+1]=g;out[o+2]=b};
    /* a field as one mesh: cells where use(k) for any corner, without the triangles that would cross the road */
    /* (P54) where the road's space would cut through the rock, the cells round it are made again finer, a few metres a
       triangle, and the points of those that fall in the road's space are moved out of it: down under the road (or for the
       roof of a cavern, up over it), or for the mountain where the road is going into it, up over the road as the start of
       the tunnel. Only the few small triangles still crossing it are left out, so the rock has no holes but the road's own
       way through. sgn: -1 down, 1 up, 0 by the road (down beside the road outside, up over it where it goes in) */
    let liftR=W/2+2,liftD=0;const RAMP=12;const lift1=(x,y,z,sgn)=>{let lo=1e9,hi=-1e9,nIn=0,nOut=0,up=-1e9,dn=1e9;liftD=0;
      /* (P55) and tapered: beyond the road's own band the rock is moved less and less over RAMP metres, so the lift makes a
         rounded arch or bank, never a sheer step (which stood as a flat slab beside the road) */
      scan(x,z,liftR+RAMP,o=>{const d=Math.hypot(o.x-x,o.z-z),b=o.y+tilt(o,x,z);if(d<liftR&&y>b-1&&y<b+26){lo=Math.min(lo,b);hi=Math.max(hi,b);if(o.n)nIn++;else nOut++}
        const f=d<liftR?1:sm(liftR+RAMP,liftR,d),dir=sgn||(o.n?1:-1);if(f<=0)return;
        /* (Prototype 60: the mountain itself arches 31 m over a road going in, not 26.5, so the tunnel's roof fits under
           it; pressed under a 26.5 m arch, the tunnel's roof was in the road's space and left out) */
        const top=sgn?26.5:31;if(dir>0&&y>b-30&&y<top+b)up=Math.max(up,y+(b+top-y)*f);if(dir<0&&y>b-1.6&&y<b+30)dn=Math.min(dn,y-(y-(b-1.6))*f)});
      if(lo<1e9){const s=sgn||(nIn&&!nOut?1:nOut&&!nIn?-1:0);liftD=s;return s<0?lo-1.6:s>0?hi+(sgn?26.5:31):y}
      if(up>-1e9&&dn<1e9)return y;if(up>-1e9){liftD=1;return up}if(dn<1e9){liftD=-1;return dn}return y};
    /* Prototype 60: and again, the same way, until the point is clear of every road: where roads are stacked (a spire,
       a helix, a crossover, a lap passing over another) a point lifted over one stretch could land in the road's space
       of the one above it, and was left out there, leaving holes over the spires (NXD8C77A-P, NXL1FDB51-...-P3443) */
    const lift=(x,y,z,sgn)=>{let y1=lift1(x,y,z,sgn);const d=liftD;if(!d)return y1;for(let k=0;k<6;k++){const y2=lift1(x,y1,z,d);if(Math.abs(y2-y1)<1e-3)break;y1=d>0?Math.max(y1,y2):Math.min(y1,y2)}return y1};
    let cutA=0;
    const unshard=(idx)=>{for(let it=0;it<2;it++){const E=new Map(),ek=(a,b)=>a<b?a*4194304+b:b*4194304+a;for(let t=0;t<idx.length;t+=3)for(let e=0;e<3;e++){const k=ek(idx[t+e],idx[t+(e+1)%3]);E.set(k,(E.get(k)||0)+1)}
        const K=[];for(let t=0;t<idx.length;t+=3){let sh=0;for(let e=0;e<3;e++)if(E.get(ek(idx[t+e],idx[t+(e+1)%3]))>1)sh++;if(sh>0)K.push(idx[t],idx[t+1],idx[t+2])}idx.length=0;for(const q of K)idx.push(q)}};
    const field=(A,use,flip,inside,sgn,cap)=>{const P3=[];for(let k=0;k<NV;k++)P3.push(vx(k),cap?cap(vx(k),A[k],vz(k)):A[k],vz(k));
      const idx=[],tri=(a,b,c)=>{const ok=clearTri(P3[a*3],P3[a*3+1],P3[a*3+2],P3[b*3],P3[b*3+1],P3[b*3+2],P3[c*3],P3[c*3+1],P3[c*3+2]);
        if(!ok){const ux=P3[b*3]-P3[a*3],uz=P3[b*3+2]-P3[a*3+2],vx2=P3[c*3]-P3[a*3],vz2=P3[c*3+2]-P3[a*3+2];cutA+=Math.abs(ux*vz2-uz*vx2)/2;return}if(flip)idx.push(a,c,b);else idx.push(a,b,c)};
      const cl=(a,b,c)=>clearTri(P3[a*3],P3[a*3+1],P3[a*3+2],P3[b*3],P3[b*3+1],P3[b*3+2],P3[c*3],P3[c*3+1],P3[c*3+2]);
      /* which cells cross the road's space, and the cells round them */
      const NC=(nx-1)*(nz-1),usedC=new Uint8Array(NC),bad=new Uint8Array(NC);
      for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1,q=j*(nx-1)+i;if(!(use(a)||use(b)||use(c)||use(d)))continue;usedC[q]=1;if(!cl(a,c,b)||!cl(b,c,d))bad[q]=1}
      const fine=new Uint8Array(NC);for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(!bad[j*(nx-1)+i])continue;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i2=i+di,j2=j+dj;if(i2>=0&&j2>=0&&i2<nx-1&&j2<nz-1&&usedC[j2*(nx-1)+i2])fine[j2*(nx-1)+i2]=1}}
      const n=clamp(Math.ceil(cs/(RES.low?6:4)),2,8),VK=new Map();liftR=W/2+2.5+cs/n;
      /* Prototype 60: a corner shared by a finer cell and a coarse one is moved with the finer cell (over the road or under
         it, up to 26 m), which tilted the coarse cell beside it; tilted into the road's space it was left out whole, a
         hole 16 to 26 m across beside the road, mostly round the cave mouths. Such a coarse cell is made finer too, until
         no coarse cell has a moved corner. */
      {const mvY=new Float32Array(NV).fill(NaN),mv=k=>{if(isNaN(mvY[k]))mvY[k]=lift(vx(k),A[k],vz(k),sgn);return Math.abs(mvY[k]-A[k])>0.01};
        for(let pass=0,ch=1;ch&&pass<6;pass++){ch=0;const fc=new Uint8Array(NV);for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++)if(fine[j*(nx-1)+i]){const a=j*nx+i;fc[a]=fc[a+1]=fc[a+nx]=fc[a+nx+1]=1}
          for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const q=j*(nx-1)+i;if(fine[q]||!usedC[q])continue;const a=j*nx+i;for(const c of[a,a+1,a+nx,a+nx+1])if(fc[c]&&mv(c)){fine[q]=1;ch=1;break}}}}
      /* a point of the finer grid, shared by the cells either side (corners are the field's own points, never moved) */
      const fv=(i,j,a,b)=>{const gi=i*n+a,gj=j*n+b,key=gj*((nx-1)*n+1)+gi;let v=VK.get(key);if(v!==undefined)return v;
        const u=a/n,w=b/n,k=j*nx+i,h=A[k]*(1-u)*(1-w)+A[k+1]*u*(1-w)+A[k+nx]*(1-u)*w+A[k+nx+1]*u*w,x=x0+(i+u)*cs,z=z0+(j+w)*cs;
        if(gi%n===0&&gj%n===0){v=(gj/n)*nx+gi/n;const y=lift(x,A[v],z,sgn);P3[v*3+1]=cap?cap(x,y,z):y}else{v=P3.length/3;const y=lift(x,h,z,sgn);P3.push(x,cap?cap(x,y,z):y,z)}VK.set(key,v);return v};
      /* every point is placed first (a corner shared with a finer cell may move), then every triangle is checked */
      const TL=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const q=j*(nx-1)+i;if(!usedC[q])continue;const a=j*nx+i;
        if(!fine[q]){TL.push(a,a+nx,a+1,a+1,a+nx,a+nx+1);continue}
        for(let b=0;b<n;b++)for(let a2=0;a2<n;a2++){const A0=fv(i,j,a2,b),B0=fv(i,j,a2+1,b),C0=fv(i,j,a2,b+1),D0=fv(i,j,a2+1,b+1);TL.push(A0,C0,B0,B0,C0,D0)}}
      for(let t=0;t<TL.length;t+=3)tri(TL[t],TL[t+1],TL[t+2]);
      /* lone triangles (none of their three sides shared with another) are what's left of rock cut for the road: drop them,
         twice over, so no shards float by the road */
      unshard(idx);
      const pos=new Float32Array(P3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
      const NV2=pos.length/3,gl=new Float32Array(NV2*3);if(inside)for(let k=0;k<NV2;k++){if(k<NV&&!(Wz[k]>0))continue;glowAt(pos[k*3],pos[k*3+1],pos[k*3+2],gl,k*3)}g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));
      const m=new THREE.Mesh(g,rockMat(inside));m.frustumCulled=false;group.add(m);PR.meshes.push(m);return m};
    /* Prototype 60: a skirt of rock from the edge of each lake, pool and caldera lake down into the ground, a little
       outward, so that wherever the ground round it is lower than the liquid the edge meets rock, never air: from the side
       a lake used to show as a flat sheet floating over the slope (Eric's photos of the lava and water lakes). Where the
       ground is higher, the skirt is under it and unseen. Its top ring is the liquid's own edge. */
    PR.skirts=[];const skirt=(q)=>{const pos=[],ind=[],n=q.n;for(let k=0;k<n;k++){const a=k/n*TAU,c=Math.cos(a),s2=Math.sin(a),r0=q.rho(a),r1=r0+q.out;pos.push(q.x+c*r0,q.y,q.z+s2*r0,q.x+c*r1,q.y-q.dep,q.z+s2*r1)}
      for(let k=0;k<n;k++){const a=k*2,b=((k+1)%n)*2;for(const t of[[a,a+1,b],[b,a+1,b+1]]){const A=t.map(v=>v*3);if(clearTri(pos[A[0]],pos[A[0]+1],pos[A[0]+2],pos[A[1]],pos[A[1]+1],pos[A[1]+2],pos[A[2]],pos[A[2]+1],pos[A[2]+2]))ind.push(...t)}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);if(q.inside)for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,q.inside?skirtIn:skirtOut);group.add(m);PR.skirts.push(m)};
    const skirtIn=rockMat(true),skirtOut=rockMat(false);for(const q of skirts)skirt(q);
    /* Prototype 61: the rivers under the road get the lakes' fix: their sheet lay about 5 m over its bed with its edges in
       the air (Eric, after Prototype 60: "it might need to be applied to the rivers below the tracks as well"). A bank of
       rock now hangs from each edge, 10 m out and 18 m down into the floor, and across both ends */
    for(const pts of rivers){const pos=[],ind=[],n=pts.length;if(n<2)continue;
      pts.forEach((q,j)=>{for(const sd of[-1,1])pos.push(q.x+sd*q.rx*q.w,q.y+0.05,q.z+sd*q.rz*q.w,q.x+sd*q.rx*(q.w+10),q.y-18,q.z+sd*q.rz*(q.w+10));
        if(j){const a=(j-1)*4,b=j*4;ind.push(a,b,a+1,a+1,b,b+1,a+2,b+2,a+3,a+3,b+2,b+3)}});
      for(const[j,e]of[[0,-1],[n-1,1]]){const q=pts[j],o=pts[j-e]||q,dx=q.x-o.x,dz=q.z-o.z,l=Math.hypot(dx,dz)||1,b=pos.length/3;
        for(const sd of[-1,1])pos.push(q.x+sd*q.rx*q.w,q.y+0.05,q.z+sd*q.rz*q.w,q.x+sd*q.rx*(q.w+10)+dx/l*10,q.y-18,q.z+sd*q.rz*(q.w+10)+dz/l*10);ind.push(b,b+2,b+1,b+1,b+2,b+3)}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,skirtIn);group.add(m);PR.skirts.push(m)}
    /* (P54) the caverns' roof and floor meet the outside of the mountain round their edge (they were left at height 0 there,
       which tore holes round the ways in) */
    for(let k=0;k<NV;k++)if(!(Wz[k]>0)){Fh[k]=Mh[k];Ch[k]=Mh[k]}
    /* (P54) the outside of the mountain as built (with its finer cells), as a height at any x, z (Infinity where it has a
       hole, the road's way through): everything of the caverns (floor, roof, stalactites, tunnels, the faces round the
       mouths) is kept under it, so nothing of the inside ever shows outside, as slabs or spikes in the sky */
    let surfH=()=>Infinity;
    if(mode!=='in'){const mm=field(Mh,()=>true,false,false,0),g=mm.geometry,Q=g.attributes.position.array,I=g.index.array,SB=new Map(),bc=cs,bk2=(a,b)=>a*65537+b;
      for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3,xa=Math.min(Q[a],Q[b],Q[c]),xb=Math.max(Q[a],Q[b],Q[c]),za=Math.min(Q[a+2],Q[b+2],Q[c+2]),zb=Math.max(Q[a+2],Q[b+2],Q[c+2]);
        for(let i=Math.floor(xa/bc);i<=Math.floor(xb/bc);i++)for(let j=Math.floor(za/bc);j<=Math.floor(zb/bc);j++){const k=bk2(i,j);let L=SB.get(k);if(!L)SB.set(k,L=[]);L.push(t)}}
      surfH=(x,z)=>{const L=SB.get(bk2(Math.floor(x/bc),Math.floor(z/bc)));if(!L)return Infinity;for(const t of L){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3,den=(Q[b+2]-Q[c+2])*(Q[a]-Q[c])+(Q[c]-Q[b])*(Q[a+2]-Q[c+2]);if(Math.abs(den)<1e-9)continue;
        const u=((Q[b+2]-Q[c+2])*(x-Q[c])+(Q[c]-Q[b])*(z-Q[c+2]))/den,v=((Q[c+2]-Q[a+2])*(x-Q[c])+(Q[a]-Q[c])*(z-Q[c+2]))/den,w=1-u-v;if(u>=-1e-3&&v>=-1e-3&&w>=-1e-3)return Q[a+1]*u+Q[b+1]*v+Q[c+1]*w}return Infinity}}/* (a little slack: the mesh keeps its points in single precision, so a point on its own corner can miss by a hair) */
    PR.surfH=(x,z)=>surfH(x,z);const under=(d)=>(x,y,z)=>Math.min(y,surfH(x,z)-d);
    if(zv.length){field(Fh,k=>Wz[k]>0,false,true,-1,under(3));field(Ch,k=>Wz[k]>0,true,true,1,under(2))}
    if(SI.length){for(let k=0;k<SV.length;k+=3)SV[k+1]=Math.min(SV[k+1],surfH(SV[k],SV[k+2])-2);
      /* one pressed down into the road's space goes whole (a part left would float as a shard) */
      {const K=[],per=6*7*6;for(let s0=0;s0<SI.length;s0+=per){let ok=true;for(let t=s0;t<s0+per&&ok;t+=3){const a=SI[t]*3,b=SI[t+1]*3,c=SI[t+2]*3;ok=clearTri(SV[a],SV[a+1],SV[a+2],SV[b],SV[b+1],SV[b+2],SV[c],SV[c+1],SV[c+2])}if(ok)for(let t=s0;t<s0+per;t++)K.push(SI[t]);else nSpk--}SI.length=0;for(const q of K)SI.push(q)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(SV,3));g.setIndex(SI);g.computeVertexNormals();
      const gl=new Float32Array(SV.length);for(let k=0;k<SV.length;k+=3)glowAt(SV[k],SV[k+1],SV[k+2],gl,k);g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,rockMat(true));group.add(m);PR.meshes.push(m)}
    /* cave mouths: where the road goes into the mountain (or comes out), the mountain arches over it (the lift above) and a
       short ragged tunnel runs through to the cavern, which opens out round you as you come through */
    /* Prototype 61: the ways in and out are a gate now, not a ragged tunnel pressed under the mountain's surface. Four goes
       at the natural look left jagged slabs every time (W1AAE848-P): the mountain lifted over the road, the cavern's roof,
       the tunnel and the hole for the road all met there, each clipped against the others. The gate is one smooth
       thick-walled arch along the road, from 18 m outside the rock to 34 m inside the cavern: its inner face lies just
       inside the space the rock is kept out of (so no rock can show through it), its outer face is wide and tall enough to
       take in the lifted rock and the hole's edges, and it is closed at both ends. Nothing clips it, so it has no shards. */
    let nMouth=0;if(mode==='mix'){const gIn=[],gOut=[],gP=[],
      prof=(hw,bot,spr,apx)=>{const q=[];for(let k=0;k<=3;k++)q.push([-hw,bot+(spr-bot)*k/3]);for(let k=1;k<16;k++){const a=Math.PI*k/16;q.push([-hw*Math.cos(a),spr+(apx-spr)*Math.sin(a)])}
        for(let k=3;k>=0;k--)q.push([hw,bot+(spr-bot)*k/3]);for(let k=1;k<4;k++)q.push([hw-2*hw*k/4,bot]);return q},
      pI=prof(W/2+1.3,-1.3,13,24.6),pO=prof(W/2+12,-9,13,38),nr=pI.length;
      const mouth=(i0,dir)=>{let s0=Math.round(8/ds);for(let s=s0;s<Math.round(240/ds);s++){const q=P[((i0-s*dir)%N+N)%N];if(bil(Mh,q.x,q.z)>q.y+28)s0=s;else if(s>s0+Math.round(12/ds))break}
        const pad=Math.round(18/ds),iF=i0-(s0+pad)*dir,L=s0+pad+Math.round(34/ds),st=Math.max(1,Math.round(4/ds)),rows=[];for(let s=0;s<L;s+=st)rows.push(s);rows.push(L);
        const v0=gP.length/3,nR=rows.length,isIn=rows.map(s=>!!ins[((iF+s*dir)%N+N)%N]);
        for(const pr of[pI,pO])for(const s of rows){const i=((iF+s*dir)%N+N)%N,p=P[i],r=R[i],u=U[i];for(const[x,y]of pr)gP.push(p.x+r.x*x+u.x*y,p.y+r.y*x+u.y*y,p.z+r.z*x+u.z*y)}
        const at=(o,j,a)=>v0+(o*nR+j)*nr+a%nr,quad=(I,A,B,C,D)=>I.push(A,B,C,B,D,C);
        for(let j=0;j<nR-1;j++)for(let a=0;a<nr;a++){quad(gIn,at(0,j,a),at(0,j,a+1),at(0,j+1,a),at(0,j+1,a+1));quad(isIn[j]&&isIn[j+1]?gIn:gOut,at(1,j,a),at(1,j,a+1),at(1,j+1,a),at(1,j+1,a+1))}
        for(let a=0;a<nr;a++){quad(gOut,at(0,0,a),at(0,0,a+1),at(1,0,a),at(1,0,a+1));quad(gIn,at(0,nR-1,a),at(0,nR-1,a+1),at(1,nR-1,a),at(1,nR-1,a+1))}
        nMouth++};
      for(const c of (()=>{const L=[];for(let i=0;i<N;){if(!ins[i]){i++;continue}let n=0;while(i+n<N&&ins[i+n])n++;L.push([i,n]);i+=n}return L})()){
        if(!ins[(c[0]-1+N)%N])mouth(c[0],1);const e=(c[0]+c[1])%N;if(!ins[e])mouth(e,-1)}
      PR.gates=[];for(const[I,mat,glow]of[[gIn,skirtIn,true],[gOut,skirtOut,false]]){if(!I.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(gP,3));g.setIndex(I);g.computeVertexNormals();
        const gl=new Float32Array(gP.length);if(glow)for(let k=0;k<gP.length;k+=3)glowAt(gP[k],gP[k+1],gP[k+2],gl,k);g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,mat);group.add(m);PR.gates.push(m)}}
    /* columns under the road, down to the mountainside or the cavern floor */
    pylons(PR.ground,3.4,lam(0x4a4558,0x0c0a12),60);
    const caves=[];for(let i=0;i<N;){if(!ins[i]){i++;continue}let n=0;while(i+n<N&&ins[i+n])n++;caves.push({i0:i,n});i+=n}
    PR.caveL=caves;PR.caves=mode==='in'?1:caves.length;PR.cal=cal.length;PR.calL=cal;PR.fallL=fallsL;PR.geyL=geys;PR.pools=pools;PR.spikes=nSpk;PR.lakes=lakes;PR.rivers=rivers.length;PR.mouths=nMouth;PR.cut=Math.round(cutA)
  /* (the materials whose shimmer moves: their time is set each frame) */
  for(const m of prismM)ctx.clock.push(m.uniforms.uT);
  ctx.prism=PR;ctx.inside=PR.inside;ctx.plainFx=true;ctx.gCol=[0xb8b0cc,0x9a8cb8,0xd8d0e8];
  ctx.info.push(PR.mode?{out:'all outside',in:'all inside the mountain',mix:'in and out of the mountain'}[PR.mode]:'',PR.caves&&PR.mode==='mix'?pl(PR.caves,'cavern'):'',PR.lakes&&PR.lakes.length?pl(PR.lakes.length,'lake'):'',PR.rivers?pl(PR.rivers,'river'):'',PR.cal?pl(PR.cal,'caldera'):'');
  }
  if(bk==='O'){
  ctx.gCol=[0xffffff,0xd8f4ff,0x9fdcff];
  }else if(bk==='N'){
  ctx.gCol=[0xffffff,0x9ff6ff,0x3ff0ff];
  }else if(bk==='R'){
  ctx.gCol=[0xffffff,0x9ff6ff,0x3ff0ff];ctx.geyName='bubble vent';ctx.jelSoft=day;ctx.bubbles=true;
  }}
