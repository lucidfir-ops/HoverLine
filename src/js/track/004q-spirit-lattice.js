//# track/004q-spirit-lattice.js: the Spirit realm's lattice, the backbone: neon struts in tiers, strong in sections that fade in, strengthen and fade out along the lap, answering the music (kick pulses, drop flare, breakdown dim, build tightening) with the sound's shape as colour across it
/* Prototype 62: round 2's lattice (tools/spirit-proto/lib/realm.js, SPR.lattice), which Eric liked best ("looks good";
   "the music response is good!"), kept as it was: a cubic grid of struts round the road, cleared 34 m round it and by the
   rule, in three tiers (beams, the grid, the diagonal truss) that appear as a section strengthens. Sections (2 or 3 a
   lap, 300 to 700 m strong) are four numbers each in a uniform; only the struts near a section are built, in chunks of
   320 m of road, each culled by itself. The music (004r sets the uniforms): a pulse runs out along the struts on every
   kick, the lattice is drawn in towards the road through a build, flares on the drop and dims in the breakdown.
   The sound form (new, Eric 2026-11: "keep the shape but let colours pulse across it"), on top of that and subtle: the
   music's spectrum in four bands, bass to treble, is laid up the lattice from its lowest struts to its highest, and each
   moment of it travels outward from the road (uSF holds the last 12 moments, newest first, each 45 m further out), so
   colour and a little brightness sweep through the geometry while the geometry stays put. With no music, a slow drift. */
const SPLAT_V=SPGL+`attribute vec2 corner;attribute vec4 lA,lB,lN,lM;uniform vec4 uSec[6];uniform vec4 uSF[12];uniform float uL,uTight,uBase,uSwellT,uSwellL,uSFk;uniform vec2 uFog;uniform float uWidth,uMinPx,uMaxPx;
  varying vec3 vCol;varying float vS;varying float vD;varying float vSt;
  float secS(float u){float s=uBase;for(int i=0;i<6;i++){vec4 q=uSec[i];if(q.w<=0.)continue;float d=abs(u-q.x);d=min(d,uL-d);s=max(s,q.w*(1.-smoothstep(q.y,q.y+q.z,d)));}return s;}
  void main(){float u=lA.w,tier=floor(lB.w/10.),pc=lB.w-tier*10.;float S=secS(u)*(1.-uSwellT*0.3*(0.5-0.5*sin(uT*0.55+u*0.0031)));
    float vis=smoothstep(tier*0.22+0.02,tier*0.22+0.15,S);if(vis<0.004){gl_Position=vec4(0.,0.,-2.,1.);return;}
    float gW=0.55+0.9*S,gK=vis*(0.1+0.75*S),pk=tier<0.5?1.15:tier<1.5?0.62:0.5;
    vec4 a=viewMatrix*vec4(mix(lA.xyz,lN.xyz,uTight),1.),b=viewMatrix*vec4(mix(lB.xyz,lM.xyz,uTight),1.);float nz=-0.35;
    if(a.z>nz&&b.z>nz){gl_Position=vec4(0.,0.,-2.,1.);return;}
    if(a.z>nz)a=mix(a,b,(a.z-nz)/(a.z-b.z));if(b.z>nz)b=mix(b,a,(b.z-nz)/(b.z-a.z));
    vec4 ca=projectionMatrix*a,cb=projectionMatrix*b;vec2 sa=ca.xy/ca.w*uRes*0.5,sb=cb.xy/cb.w*uRes*0.5;vec2 d=sb-sa;float l=length(d);d=l>1e-4?d/l:vec2(1.,0.);vec2 n=vec2(-d.y,d.x);
    float e=corner.y;vec4 v=e<0.5?a:b;vec4 c=e<0.5?ca:cb;
    float px=clamp(uWidth*gW*uSwellL*projectionMatrix[1][1]*uRes.y*0.5/max(-v.z,0.1),uMinPx,uMaxPx*uSwellL);
    c.xy+=(n*corner.x+d*(e<0.5?-1.:1.))*px*0.5/uRes*2.*c.w;gl_Position=c;
    vD=e<0.5?lN.w:lM.w;vS=corner.x;vSt=S;
    float hb=clamp(pc,0.,0.999)*3.,fi=clamp(vD/45.,0.,10.99);int bi=int(hb),mi=int(fi);vec4 sv=mix(uSF[mi],uSF[mi+1],fract(fi));
    float sf=bi==0?mix(sv.x,sv.y,fract(hb)):bi==1?mix(sv.y,sv.z,fract(hb)):mix(sv.z,sv.w,fract(hb));
    float f=clamp((uFog.y+v.z)/(uFog.y-uFog.x),0.,1.);
    vCol=pal(2.,pc+uSFk*0.2*(sf-0.35))*pk*gK*f*(1.+uSFk*0.28*(sf-0.3));}`;
const SPLAT_F=`uniform vec4 uKA;uniform float uPV,uPK,uGainL,uSwellL,uWorld;varying vec3 vCol;varying float vS;varying float vD;varying float vSt;
  void main(){float e=1.-abs(vS),a=smoothstep(0.,0.4,e);vec3 col=vCol*uGainL*(1.+(uSwellL-1.)*0.6)*a*(0.85+0.6*e*e);
    float pu=0.;for(int i=0;i<4;i++){float k=uKA[i];float x=(vD-uPV*k)/16.;pu+=exp(-x*x)*exp(-k*1.4);}
    col*=1.+uPK*pu*2.6;col+=vec3(0.5,0.45,0.6)*uPK*pu*0.25*vSt*a;gl_FragColor=vec4(col*uWorld,1.);}`;
/* sections [{u, half, fade, peak}]; q detail: 2 every tier, 1 no diagonal truss and a wider grid, 0 the beams only */
function spLattice(ctx,clr,r,q){const{N,ds,P,U}=ctx,L=N*ds,V3=THREE.Vector3,O=SPC_O;
  const sp=[45,36,30][q],ext=240,clear=34,tight=0.26,chunk=320,y0=-150,y1=300;
  const nS=q===0?1+(r()<0.5?1:0):2+(r()<0.5?1:0),secs=[];const u00=r()*L;
  for(let k=0;k<nS;k++)secs.push({u:(u00+k*L/nS+(r()-0.5)*L/(nS*3)+L)%L,half:150+r()*200,fade:120+r()*80,peak:0.85+r()*0.15});
  const chunks=new Map(),Lof=u=>{const c=Math.floor(((u%L)+L)%L/chunk);let C=chunks.get(c);if(!C)chunks.set(c,C={lA:[],lB:[],lN:[],lM:[],mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]});return C};
  let segs=0,cut=0,nodesN=0;
  for(const s of secs){const reach=s.half+s.fade+60,R=[];for(let du=-reach-60;du<=reach+60;du+=6){const u=((s.u+du)%L+L)%L,i=Math.floor(u/ds)%N;if(ctx.gap[i])continue;R.push({u:s.u+du,p:P[i],an:P[i].clone().addScaledVector(U[i],6)})}
    if(!R.length)continue;const mn=new V3(1e9,1e9,1e9),mx=new V3(-1e9,-1e9,-1e9);for(const q0 of R){mn.min(q0.p);mx.max(q0.p)}mn.x-=ext;mn.z-=ext;mx.x+=ext;mx.z+=ext;mn.y+=y0;mx.y+=y1;
    /* the road points in a 2D grid, for the nearest one to each node */
    const RG=new Map(),rk=(a,b)=>a*65536+b,RC=60;for(const q0 of R){const k=rk(Math.floor(q0.p.x/RC),Math.floor(q0.p.z/RC));let A=RG.get(k);if(!A)RG.set(k,A=[]);A.push(q0)}
    const nearest=p=>{let b=null,d=1e18;const cx=Math.floor(p.x/RC),cz=Math.floor(p.z/RC);for(let a=-4;a<=4;a++)for(let c=-4;c<=4;c++){const A=RG.get(rk(cx+a,cz+c));if(A)for(const q0 of A){const dd=q0.p.distanceToSquared(p);if(dd<d){d=dd;b=q0}}}return{q:b,d:Math.sqrt(d)}};
    const I0=Math.floor(mn.x/sp),I1=Math.ceil(mx.x/sp),J0=Math.floor(mn.y/sp),J1=Math.ceil(mx.y/sp),K0=Math.floor(mn.z/sp),K1=Math.ceil(mx.z/sp),H=mx.y-mn.y,node=new Map(),key=(i,j,k)=>((i-I0)*1024+(j-J0))*1024+(k-K0);
    const okP=(p,an)=>clr.ok(p.x,p.y,p.z,1.2)&&clr.ok(p.x+(an.x-p.x)*tight,p.y+(an.y-p.y)*tight,p.z+(an.z-p.z)*tight,1.2);
    /* column by column: the road points within reach of it, then the nearest of them to each node up the column */
    for(let i=I0;i<=I1;i++)for(let k=K0;k<=K1;k++){const x=i*sp,z=k*sp,cx=Math.floor(x/RC),cz=Math.floor(z/RC),C=[];for(let a=-4;a<=4;a++)for(let c=-4;c<=4;c++){const A=RG.get(rk(cx+a,cz+c));if(A)for(const q0 of A){const h2=(q0.p.x-x)**2+(q0.p.z-z)**2;if(h2<ext*ext)C.push(q0,h2)}}
      if(!C.length)continue;for(let j=J0;j<=J1;j++){const y=j*sp;let b=null,d=1e18;for(let m=0;m<C.length;m+=2){const dd=C[m+1]+(C[m].p.y-y)**2;if(dd<d){d=dd;b=C[m]}}d=Math.sqrt(d);
        if(!b||d<clear||d>ext||Math.abs(b.u-s.u)>reach)continue;const p=new V3(x,y,z);if(!okP(p,b.an)){cut++;continue}node.set(key(i,j,k),{p,d,u:b.u,an:b.an});nodesN++}}
    const seg=(a,b,tier)=>{const mid=a.p.clone().lerp(b.p,0.5),amid=a.an.clone().lerp(b.an,0.5);if(!okP(mid,amid)){cut++;return}
      const u=(a.u+b.u)/2,C=Lof(u),pc=Math.min(0.999,0.08+(mid.y-mn.y)/H*0.75+(((u%900)+900)%900)/900*0.15);
      C.lA.push(a.p.x,a.p.y,a.p.z,((u%L)+L)%L);C.lB.push(b.p.x,b.p.y,b.p.z,tier*10+pc);C.lN.push(a.an.x,a.an.y,a.an.z,a.d);C.lM.push(b.an.x,b.an.y,b.an.z,b.d);
      for(const p of[a.p,b.p]){C.mn[0]=Math.min(C.mn[0],p.x);C.mn[1]=Math.min(C.mn[1],p.y);C.mn[2]=Math.min(C.mn[2],p.z);C.mx[0]=Math.max(C.mx[0],p.x);C.mx[1]=Math.max(C.mx[1],p.y);C.mx[2]=Math.max(C.mx[2],p.z)}segs++};
    const major=(x,y)=>((x%3)+3)%3===0&&((y%3)+3)%3===0;
    for(const[kk,a]of node){const k=kk%1024+K0,j=Math.floor(kk/1024)%1024+J0,i=Math.floor(kk/1048576)+I0;
      for(const[di,dj,dk]of[[1,0,0],[0,1,0],[0,0,1]]){const b=node.get(key(i+di,j+dj,k+dk));if(!b)continue;const beam=di?major(j,k):dj?major(i,k):major(i,j),dd=Math.max(a.d,b.d);
        if(beam)seg(a,b,0);else if(q&&(dd<170||r()<0.3))seg(a,b,1)}
      if(q===2&&((i+j+k)&1)===0&&a.d<130&&r()<0.7){const cc=new V3((i+0.5)*sp,(j+0.5)*sp,(k+0.5)*sp),nr=nearest(cc);
        if(nr.q&&nr.d>=clear){const c={p:cc,d:nr.d,u:nr.q.u,an:nr.q.an};for(const dd of[[0,0,0],[1,1,0],[1,0,1],[0,1,1]]){const b=node.get(key(i+dd[0],j+dd[1],k+dd[2]));if(b)seg(c,b,2)}}}}}
  /* one material for every chunk; its uniforms are the lattice's controls (004r) */
  const sec=secs.slice(0,6).map(s=>new THREE.Vector4(s.u,s.half,s.fade,s.peak));while(sec.length<6)sec.push(new THREE.Vector4(0,0,1,0));
  const LU={uSec:{value:sec},uL:{value:L},uTight:{value:0},uBase:{value:0},uSwellT:{value:1},uSwellL:{value:1},uSFk:{value:0},uPV:{value:260},uPK:{value:0},uGainL:{value:1},uFog:{value:new THREE.Vector2(180,1500)},uWidth:{value:0.34},uMinPx:{value:1.2},uMaxPx:{value:6}};
  const mat=new THREE.ShaderMaterial({uniforms:Object.assign({},SPU,LU),vertexShader:SPLAT_V,fragmentShader:SPLAT_F,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const meshes=[];for(const[,C]of chunks){const n=C.lA.length/4;if(!n)continue;const g=new THREE.InstancedBufferGeometry();g.setAttribute('corner',new THREE.Float32BufferAttribute([-1,0,1,0,-1,1,1,1],2));g.setIndex([0,1,2,1,3,2]);
    for(const k of['lA','lB','lN','lM'])g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(C[k]),4));g.instanceCount=n;
    const c=new V3((C.mn[0]+C.mx[0])/2,(C.mn[1]+C.mx[1])/2,(C.mn[2]+C.mx[2])/2);g.boundingSphere=new THREE.Sphere(c,Math.hypot(C.mx[0]-C.mn[0],C.mx[1]-C.mn[1],C.mx[2]-C.mn[2])/2+40);
    const m=new THREE.Mesh(g,mat);m.frustumCulled=true;m.renderOrder=2;meshes.push(m)}
  clr.stats.cut+=cut;return{meshes,mat,U:LU,secs,segs,nodes:nodesN,cut,tight}}
