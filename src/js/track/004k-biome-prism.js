//# track/004k-biome-prism.js: the Prism scenery (P): a mountain range with caverns: height fields, cave mouths (gates), lakes, rivers, pools, calderas, falls, stalactites, glow worms, columns
/* Prototype 61: the Prism builder (SCENERY.P, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryPrism(ctx){
  const{seed,N,ds,P,R,U,kind,gap,spl,minX,maxX,minY,maxY,minZ,maxZ,group,LK,day,dens,nFall,nGey,lam,pylons,spireFrames,helixMiddles,daySky,starSky,roadSpace,pl,fallsL,geys}=ctx;
  spireFrames();
  helixMiddles();
  if(day)daySky();else starSky();
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
  ctx.info.push(PR.mode?{out:'all outside',in:'all inside the mountain',mix:'in and out of the mountain'}[PR.mode]:'',PR.caves&&PR.mode==='mix'?pl(PR.caves,'cavern'):'',PR.lakes&&PR.lakes.length?pl(PR.lakes.length,'lake'):'',PR.rivers?pl(PR.rivers,'river'):'',PR.cal?pl(PR.cal,'caldera'):'');}
