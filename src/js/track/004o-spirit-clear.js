//# track/004o-spirit-clear.js: the Spirit realm's rule: nothing ever touches the road or stands between a chase camera and the road ahead (the keep-out and the sight lines every piece is placed against)
/* Prototype 62: Eric's rule from the round-1 mock-ups, ported from tools/spirit-proto/lib/clear.js. Built once per track:
   - the keep-out: in every road sample's own frame (main road and every split route), the road's half width plus 6 m
     each side, from 4 m under the road to 16 m over it (40 m over a jump, a drop and their landings, so a frame in the air
     is clear too).
   - the sight lines: from a chase camera (12 m behind a racer and 4.5 m up, on three lines across the road) every 16 m
     round the lap, to the road's two edges and middle, 1 m up, every 20 m up to 300 m ahead. Kept as segments in a
     coarse grid (the mock-ups marched them into 3 m cells; the segments themselves are exact and much quicker to build).
   spClear(ctx) returns {ok(x,y,z,r), okPts(list,r), keep(x,y,z,r), sight(x,y,z,r), stats}. A piece is checked as balls
   that hold it through its whole motion (a turning piece: one ball round its middle as big as its reach; a ring the road
   runs through: balls all round the ring). A piece that fails is moved or left out. The test tools/tests/spirit-clear.js
   samples every piece placed, through its motion, against the same two volumes rebuilt in the test. */
const SPC_O={margin:6,below:4,above:16,jumpAbove:40,sight:300,camBack:12,camUp:4.5,camStep:16,tgtStep:20};
function spClear(ctx){const{N,ds,P,R,U,Tg,splits,jumps,feats}=ctx,O=SPC_O,hw=W/2,drops=ctx.drops||[];
  /* where frames leave the road: every jump (its gap and 80 m after), every drop and every spire's fall */
  const air=new Uint8Array(N),mark=(u0,u1)=>{for(let u=u0;u<=u1;u+=ds){air[(((Math.round(u/ds))%N)+N)%N]=1}};
  for(const j of jumps||[])mark(j.u0-30,j.u1+80);for(const d of drops)if(d.u0!=null)mark(d.u0-30,(d.u1!=null?d.u1:d.u0)+80);
  for(const f of feats||[])if(f.kind==='drop'||f.kind==='sjump'||f.kind==='cjump')mark(f.u0-30,f.u1+80);
  /* the samples: {p, r, up, t, hw, above}, in a 3D grid of CELL metres */
  const CELL=24,G=new Map(),key=(a,b,c)=>((a+4096)*8192+(b+4096))*8192+(c+4096),S=[];
  const addS=(p,r,up,t,h,above)=>{const s={x:p.x,y:p.y,z:p.z,r,up,t,hw:h,ab:above};S.push(s);const k=key(Math.floor(p.x/CELL),Math.floor(p.y/CELL),Math.floor(p.z/CELL));let L=G.get(k);if(!L)G.set(k,L=[]);L.push(s)};
  for(let i=0;i<N;i++){if(ctx.gap&&ctx.gap[i]&&!air[i])continue;addS(P[i],R[i],U[i],Tg[i],hw,air[i]?O.jumpAbove:O.above)}
  const _p=new THREE.Vector3();
  for(const S0 of splits)for(const B of S0.b)for(let k=0;k<=S0.n;k++){const i=(S0.i0+k)%N;_p.copy(P[i]).addScaledVector(R[i],B.c[k]).addScaledVector(U[i],B.h[k]);addS(_p,R[i],U[i],Tg[i],B.w[k],air[i]?O.jumpAbove:O.above)}
  const reachH=Math.max(...S.map(s=>s.hw))+O.margin+ds;
  /* is a ball (x,y,z, radius r) in the keep-out? */
  const keep=(x,y,z,r)=>{const rr=reachH+r,ra=O.jumpAbove+r,c0=Math.floor((x-rr)/CELL),c1=Math.floor((x+rr)/CELL),d0=Math.floor((y-ra)/CELL),d1=Math.floor((y+ra)/CELL),e0=Math.floor((z-rr)/CELL),e1=Math.floor((z+rr)/CELL);
    for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++)for(let c=e0;c<=e1;c++){const L=G.get(key(a,b,c));if(!L)continue;
      for(const s of L){const dx=x-s.x,dy=y-s.y,dz=z-s.z;if(Math.abs(dx*s.t.x+dy*s.t.y+dz*s.t.z)>ds*0.75+r)continue;if(Math.abs(dx*s.r.x+dy*s.r.y+dz*s.r.z)>s.hw+O.margin+r)continue;
        const h=dx*s.up.x+dy*s.up.y+dz*s.up.z;if(h>-O.below-r&&h<s.ab+r)return true}}return false};
  /* the sight lines, as segments in a coarse grid (cells of SG metres; a segment goes in every cell its box touches) */
  const SG=40,SL=[],SM=new Map(),skey=(a,b,c)=>((a+2048)*4096+(b+2048))*4096+(c+2048);
  const step=Math.max(1,Math.round(O.camStep/ds)),tst=Math.max(1,Math.round(O.tgtStep/ds)),nT=Math.round(O.sight/O.tgtStep),back=Math.round(O.camBack/ds);
  const ptAt=(i,l,h,o)=>{o.x=P[i].x+R[i].x*l+U[i].x*h;o.y=P[i].y+R[i].y*l+U[i].y*h;o.z=P[i].z+R[i].z*l+U[i].z*h;return o};
  const ca={x:0,y:0,z:0},tb={x:0,y:0,z:0};
  for(let i=0;i<N;i+=step){if(ctx.gap&&ctx.gap[i])continue;const ic=(i-back+N)%N;
    for(const cl of[-hw*0.6,0,hw*0.6]){ptAt(ic,cl,O.camUp+1,ca);
      for(let k=1;k<=nT;k++){const it=(i+k*tst)%N;if(ctx.gap&&ctx.gap[it])continue;for(const tl of[-hw,0,hw]){ptAt(it,tl,1,tb);
        const sg=[ca.x,ca.y,ca.z,tb.x,tb.y,tb.z],n=SL.push(sg)-1;
        const a0=Math.floor(Math.min(sg[0],sg[3])/SG),a1=Math.floor(Math.max(sg[0],sg[3])/SG),b0=Math.floor(Math.min(sg[1],sg[4])/SG),b1=Math.floor(Math.max(sg[1],sg[4])/SG),c0=Math.floor(Math.min(sg[2],sg[5])/SG),c1=Math.floor(Math.max(sg[2],sg[5])/SG);
        /* long rays cross many cells: put them only in the cells the line passes near (every half cell along it) */
        const len=Math.hypot(sg[3]-sg[0],sg[4]-sg[1],sg[5]-sg[2]),nn=Math.max(1,Math.ceil(len/(SG*0.5)));const seen=new Set();
        if((a1-a0+1)*(b1-b0+1)*(c1-c0+1)<=8){for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)for(let c=c0;c<=c1;c++)seen.add(skey(a,b,c))}
        else for(let q=0;q<=nn;q++){const f=q/nn,x=sg[0]+(sg[3]-sg[0])*f,y=sg[1]+(sg[4]-sg[1])*f,z=sg[2]+(sg[5]-sg[2])*f;for(const dx of[-1,0,1])for(const dz of[-1,0,1])seen.add(skey(Math.floor((x+dx*SG*0.3)/SG),Math.floor(y/SG),Math.floor((z+dz*SG*0.3)/SG)))}
        for(const kk of seen){let L=SM.get(kk);if(!L)SM.set(kk,L=[]);L.push(n)}}}}}
  /* does a ball touch a sight line? (a little margin for the other camera views) */
  const sight=(x,y,z,r)=>{r+=1.5;const a0=Math.floor((x-r)/SG),a1=Math.floor((x+r)/SG),b0=Math.floor((y-r)/SG),b1=Math.floor((y+r)/SG),c0=Math.floor((z-r)/SG),c1=Math.floor((z+r)/SG);
    for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)for(let c=c0;c<=c1;c++){const L=SM.get(skey(a,b,c));if(!L)continue;
      for(const n of L){const s=SL[n],ux=s[3]-s[0],uy=s[4]-s[1],uz=s[5]-s[2],l2=ux*ux+uy*uy+uz*uz,f=Math.max(0,Math.min(1,((x-s[0])*ux+(y-s[1])*uy+(z-s[2])*uz)/l2)),dx=s[0]+ux*f-x,dy=s[1]+uy*f-y,dz=s[2]+uz*f-z;
        if(dx*dx+dy*dy+dz*dz<r*r)return true}}return false};
  /* quick: is a ball far from every road sample (then it can't be in the way of anything) */
  const far=(x,y,z,r)=>{const rr=r+reachH+O.jumpAbove+90,c0=Math.floor((x-rr)/CELL),c1=Math.floor((x+rr)/CELL),d0=Math.floor((y-rr)/CELL),d1=Math.floor((y+rr)/CELL),e0=Math.floor((z-rr)/CELL),e1=Math.floor((z+rr)/CELL);
    if((c1-c0+1)*(d1-d0+1)*(e1-e0+1)>4000)return false;
    for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++)for(let c=e0;c<=e1;c++)if(G.has(key(a,b,c)))return false;return true};
  const stats={tried:0,placed:0,moved:0,dropped:0,cut:0};
  const ok=(x,y,z,r)=>far(x,y,z,r)||(!keep(x,y,z,r)&&!sight(x,y,z,r));
  const okPts=(L,r)=>L.every(p=>ok(p[0],p[1],p[2],p[3]!=null?p[3]:r));
  return{ok,okPts,keep,sight,far,stats,S,SL,O}}
