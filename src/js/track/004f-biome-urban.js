//# track/004f-biome-urban.js: the Urban scenery (U): the city: towers on a street grid round the road, flying traffic, a tower in every spiral, falls, geysers, tunnels in buildings
/* Prototype 61: the Urban builder (SCENERY.U, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryUrban(ctx){
  const{seed,N,ds,P,R,U,Tg,spl,splits,minX,maxX,maxY,minZ,maxZ,cxT,czT,group,day,dens,er,IM,lines,lnA,lnB,winTex,near,KP,KG,CELL,kk,solid,free,claim,side,pylons,spireFrames,helixMiddles,falls,geysers,daySky,buildTunnels,floorY}=ctx;
const grid=new THREE.GridHelper(6000,150,0x1f2c38,0x131a22);grid.position.y=floorY;group.add(grid)
  pylons(()=>floorY);
  spireFrames();
  helixMiddles(({cx0,cz0,rt,top})=>{const h=top+60-floorY,g=new THREE.CylinderGeometry(rt*0.92,rt,h,10),mm=new THREE.MeshLambertMaterial({map:winTex.clone(),emissive:0xffffff});mm.map.needsUpdate=true;mm.map.repeat.set(Math.max(2,TAU*rt/16),Math.max(2,h/16));mm.emissiveMap=mm.map;
      const m=new THREE.Mesh(g,mm);m.position.set(cx0,floorY+h/2,cz0);group.add(m);const e=new THREE.LineSegments(new THREE.EdgesGeometry(g,20),lnA);e.position.copy(m.position);group.add(e)});
  falls();
  geysers();
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
  if(day)daySky();
  buildTunnels({grounded:true,shell:()=>({sideW:16+er()*14,roof:26+er()*40}),TC:[0x1a1e25,0x05060a,0xffb000],
    outM:avgH=>{const m=new THREE.MeshLambertMaterial({map:winTex.clone(),emissive:0xffffff,side:THREE.DoubleSide});m.map.needsUpdate=true;m.map.repeat.set(Math.max(1,avgH/14),1);m.emissiveMap=m.map;return m}});}
