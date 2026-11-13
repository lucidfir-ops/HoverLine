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
/* the builders by biome letter: a new biome is a new file with its builder and a line here */
const SCENERY={U:sceneryUrban,O:sceneryOcean,F:sceneryForest,N:sceneryStratos,R:sceneryReef,P:sceneryPrism,S:scenerySpirit};
function sceneryCtx(rd,bm){const{seed,N,P,Tg,ds,R,U,gap,kind,feats,Kg,jumps,drops,splits,spl,Kn,group,strip,add,dark,mag,ctop,basis,signI,gantI,minY,minX,maxX,minZ,maxZ,maxY}=rd;
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
  /* (made for every biome, as before the split, so three.js makes its objects in the same order whatever the biome) */
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
  const ctx={port:rd.port||null,seed,N,ds,P,R,U,Tg,kind,gap,spl,splits,feats,jumps,drops,mag,ctop,Kn,Kg,signI,gantI,minX,maxX,minY,maxY,minZ,maxZ,cxT,czT,group,add,strip,basis,dark,bk,LK,day,dial,dens,nFall,nGey,nTun,er,lam,BOX,IM,lines,lnA,lnB,lnBio,winTex,lightTex,near,KP,KG,CELL,kk,solid,free,claim,side,pylons,spireFrames,helixMiddles,falls,geysers,dome,daySky,starSky,buildTunnels,roadSpace,pl,fallsL,geys,caps,jel,kelp,fish,schools,mantas,tunnels,tun,floorY:minY-70,water:null,sky:null,prism:null,inside:null,clock:[],info:[]};
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
  /* Prototype 62: a biome's own moving parts (the Spirit realm's, 004r) */
  env.spirit=ctx.spirit||null;env.update=(t,anim)=>{if(ctx.tick)ctx.tick(t,anim);if(anim){for(const u of ctx.clock)u.value=t}if(!anim&&env.last>=0)return;env.last=t;env.n++;const M4=_em,Q=_eq,Sv=_es,Pv=_ep;
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
