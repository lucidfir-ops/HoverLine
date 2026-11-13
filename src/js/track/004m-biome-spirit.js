//# track/004m-biome-spirit.js: the Spirit realm's scenery (S): a black void of neon wireframe round the road: the lattice in sections, stacks, pyramids, block rings, gyroscopes, knots, unfolding solids, shoals, arches, sacred geometry, bestiary blocks, the stepped sky, pieces of the other realms, rooms, serpents, heads, colossi
/* Prototype 62: Eric approved this look over two rounds of in-engine clips (docs/spirit-proto, "it's epic"). Everything
   at once at round 2's density, with his rule kept in code: nothing ever touches the road or stands between a chase
   camera and the road ahead (004o, spClear; every piece is checked through its whole motion and moved or left out).
   Drawn in batches (004n): one draw per kind of thing, so the realm costs tens of draw calls, not hundreds.
   Detail: Default (q 2) everything; Lite (q 1: Moving scenery or Glow off) fewer pieces, no hanging bodies in the rooms,
   no shoal-built shapes, a lighter lattice; Ultra low (q 0, Low detail) a thin realm: the lattice's beams, solids, a few
   blocks. The Scenery dial scales how many pieces there are. All numbers come from the scenery's own random stream, so a
   track code always builds the same realm. What moves each frame is in 004r (spLive); nothing touches the race. */
function scenerySpirit(ctx){
  const{seed,N,ds,P,R,U,Tg,kind,gap,spl,feats,minY,maxY,cxT,czT,group,dens}=ctx,V3=THREE.Vector3;
  const r=rng((seed^0x5A17)>>>0),q=RES.low?0:(g2('anim')&&g2('bloom'))?2:1,L=N*ds,km=L/1000,dm=[0.4,0.7,1,1.3][dens]||1;
  const cnt=(perKm,qs)=>Math.round(perKm*km*dm*(qs||[0.3,0.6,1])[q]);
  const ms={t:Date.now()},lap=k=>{const n=Date.now();ms[k]=n-ms.t;ms.t=n};
  const clr=spClear(ctx),st=clr.stats,why={};lap('rule');
  const ix=i=>((i%N)+N)%N,R2=(a,b)=>a+(b-a)*r(),sgn=()=>r()<0.5?-1:1,pick=a=>a[Math.floor(r()*a.length)];
  const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_x=new V3(),_y=new V3(),_z=new V3();
  const qB=(x,y)=>{_x.copy(x).normalize();_y.copy(y).normalize();_z.crossVectors(_x,_y).normalize();_y.crossVectors(_z,_x);_m.makeBasis(_x,_y,_z);_q.setFromRotationMatrix(_m);return[_q.x,_q.y,_q.z,_q.w]};
  const rq=()=>{_q.setFromEuler(new THREE.Euler(r()*TAU,r()*TAU,r()*TAU));return[_q.x,_q.y,_q.z,_q.w]},rax=()=>{const v=new V3(r()-0.5,r()-0.5,r()-0.5).normalize();return[v.x,v.y,v.z]};
  const flat=i=>{const t=Tg[ix(i)],l=Math.hypot(t.x,t.z)||1;return new V3(t.x/l,0,t.z/l)},side=i=>{const f=flat(i);return new V3(-f.z,0,f.x)};
  const at=(i,lat,h)=>{i=ix(i);const s=side(i);return[P[i].x+s.x*lat,P[i].y+h,P[i].z+s.z*lat]};
  const qLevel=i=>qB(side(i),new V3(0,1,0)),qRoad=i=>qB(R[ix(i)],U[ix(i)]),UP=new V3(0,1,0);
  const roadOK=i=>{i=ix(i);return!gap[i]&&!spl[i]};
  /* straights: 50 m either way within 2.5 degrees, level and plain, for the things the road runs through */
  const straight=(i,h=50)=>{const n=Math.round(h/ds),t0=Tg[ix(i)];for(let k=-n;k<=n;k+=2){const j=ix(i+k);if(kind[j]||gap[j]||spl[j]||U[j].y<0.97||Tg[j].dot(t0)<0.999)return false}return true};
  const STR=[];for(let i=0;i<N;i+=Math.max(1,Math.round(12/ds)))if(straight(i))STR.push(i);
  /* put(name, tries, gen): gen(k) gives a candidate {b: balls [[x,y,z,r]...], add()}; the first clear one is added */
  const put=(name,tries,gen)=>{st.tried++;for(let k=0;k<tries;k++){const c=gen(k);if(!c)continue;if(clr.okPts(c.b)){c.add();st.placed++;if(k)st.moved++;return true}}st.dropped++;why[name]=(why[name]||0)+1;return false};
  /* the batches */
  const W2={box:spWires('box'),glyph:spWires('box'),oct:spWires('oct'),tet:spWires('tet'),ico:spWires('ico'),dod:spWires('dod')},solids=['oct','tet','ico','dod'];
  const REG=600,regs=[],LB=i=>{const k=Math.floor(ix(i)*ds/REG);return regs[k]||(regs[k]=spLines())},farL=spLines(),knotL=spLines(),live=spLines(),sh=spShoals();
  const addSegs=(Lb,o,segs,pk=1,pc0=0,pcK=1)=>{Lb.obj(o);for(const[a,b,pc]of segs)Lb.seg(a,b,pc0+pc*pcK,pk);return Lb};
  const nearCount={};const tally=k=>{nearCount[k]=(nearCount[k]||0)+1};

  /* ---- floating solids near the road and in the sky (round 2: SW.solids twice) ---- */
  const solidAt=(kind0,nMax,o)=>{for(let n=0;n<nMax;n++){const s0=o.s0+(o.s1-o.s0)*Math.pow(r(),1.6),ys=r()<0.3?R2(0.5,1.8):1,shp=r()<0.6?'box':pick(solids),bob=s0*0.08,rad=s0*0.75*Math.max(1,ys)+bob+(shp==='box'?s0*0.12:0);
    put(kind0,4,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(o.d0,o.d1),R2(o.h0,o.h1));
      return{b:[[...c,rad]],add:()=>{W2[shp].add({c,s:[s0,s0*ys,s0],bq:rq(),m:[1,(r()-0.5)*o.spin,r()*TAU,bob],ax:rax(),pal:Math.floor(r()*6),pc:r(),k:0.75+r()*0.5,per:o.per});tally(kind0)}}})}};
  solidAt('floating solids',cnt(60,[0.35,0.6,1]),{s0:3,s1:20,d0:40,d1:380,h0:-110,h1:240,spin:0.5,per:60});
  solidAt('sky solids',cnt(40,[0.2,0.5,1]),{s0:14,s1:55,d0:60,d1:700,h0:90,h1:560,spin:0.2,per:160});

  /* ---- bestiary blocks: one creature on every side, turning an eighth on each beat (round 1: carved blocks) ---- */
  for(let n=0,nn=cnt(4,[0.4,0.7,1]);n<nn;n++){const s0=R2(9,16),hk=1.55,rad=Math.hypot(s0,s0*hk)*0.6+1;
    put('bestiary blocks',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(36,140),R2(-10,55));
      return{b:[[...c,rad]],add:()=>W2.glyph.add({c,s:[s0,s0*hk,s0],m:[2,TAU/8*sgn(),r()*TAU,0],ax:[0,1,0],gl:Math.floor(r()*4),pal:pick([1,3,4]),pc:r(),k:1.05,br:0.03,per:40})}})}

  /* ---- stepped stacks: a tier slides out and turns a quarter on its beat; medium carved pairs near, huge ones far ---- */
  const stack=(name,o)=>{const nT=o.tiers,nS=o.stacks,sz=o.size,th=sz*0.42;
    put(name,8,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(o.d0,o.d1),R2(o.h0,o.h1)),qq=qLevel(i),hgt=nT*th,rad=Math.hypot((nS-1)/2*1.25*sz+0.8*sz,0.71*sz,hgt/2)*1.03;
      const mid=new V3(...c).addScaledVector(UP,hgt/2);return{b:[[mid.x,mid.y,mid.z,rad]],add:()=>{for(let s=0;s<nS;s++){const ox=(s-(nS-1)/2)*sz*1.25,nt=nT-(s%2);
        for(let t=0;t<nt;t++){const w=sz*(1-t*0.09);(o.carve?W2.glyph:W2.box).add({c,q:qq,off:[ox,(t+0.5)*th,0],s:[w,th*0.92,w],m:[4,nt,(t+s)%nt,sz*0.3*(t%2?1:-1)],gl:o.carve?(t+s)%4:-1,pal:o.pal,pc:t/nt,k:1,per:o.per||60,br:0.02})}}}}})};
  for(let n=0,nn=cnt(1.2,[0,0.6,1]);n<nn;n++)stack('stacks',{tiers:5,stacks:2,size:R2(10,15),d0:48,d1:90,h0:-8,h1:4,carve:true,pal:4});
  for(let n=0,nn=Math.max(q?1:0,cnt(0.4,[0.5,0.7,1]));n<nn;n++)stack('stacks (huge)',{tiers:6,stacks:3,size:R2(80,130),d0:420,d1:700,h0:-160,h1:-70,pal:3,per:400});

  /* ---- block pyramids that shed their crowns across the road onto an unfinished twin, and take them back (group 0) ---- */
  for(let n=0,nn=cnt(0.5,[0.4,0.6,1]);n<nn;n++){const nt=R2(6,8)|0,pitch=R2(8,10),cu=pitch*0.92,d=R2(95,140),du=R2(110,170)/ds|0;
    put('pyramids',6,k=>{const i=Math.floor(r()*N),j=ix(i+du);if(!roadOK(i)||!roadOK(j))return null;const sd=sgn(),y=R2(-50,-25),A=new V3(...at(i,sd*d,y)),B=new V3(...at(j,-sd*d,y)),fa=flat(i),fb=flat(j),sa=side(i),sb=side(j);
      const cubes=(C,f,s0)=>{const o=[];for(let t=0;t<nt;t++){const m=nt-t;for(let a=0;a<m;a++)for(let b=0;b<m;b++)o.push({t,p:C.clone().addScaledVector(s0,(a-(m-1)/2)*pitch).addScaledVector(f,(b-(m-1)/2)*pitch).addScaledVector(UP,(t+0.5)*pitch)})}return o};
      const LA=cubes(A,fa,sa),LB=cubes(B,fb,sb),crA=LA.filter(c=>c.t>=nt-3),crB=LB.filter(c=>c.t>=nt-3),balls=[];
      for(const[C,s]of[[A,1],[B,1]])for(let t=0;t<nt;t++){const m=nt-t,p=C.clone().addScaledVector(UP,(t+0.5)*pitch);balls.push([p.x,p.y,p.z,Math.sqrt(0.5*m*m+0.25)*pitch*1.02])}
      /* each crown block's arc over the road: raised until it is clear (or the pyramid sheds nothing) */
      const fly=[];let shed=q>0;if(shed)for(let c=0;c<crA.length&&shed;c++){const a=crA[c].p,b=crB[c%crB.length].p;let lift=R2(70,110),okA=false;
        for(let tr=0;tr<10&&!okA;tr++,lift+=18){const mid=a.clone().lerp(b,0.5).addScaledVector(UP,lift);okA=true;for(let s=1;s<16&&okA;s++){const u=s/16,iu=1-u,p=a.clone().multiplyScalar(iu*iu).addScaledVector(mid,2*u*iu).addScaledVector(b,u*u);if(!clr.ok(p.x,p.y,p.z,cu))okA=false}}
        if(okA)fly.push({a,b,lift:lift-18});else shed=false}
      return{b:balls,add:()=>{const crS=new Set(crA),crBS=new Set(crB),pal=pick([0,1,3,4]);
        for(const c of LA)if(!shed||!crS.has(c))W2.box.add({c:[c.p.x,c.p.y,c.p.z],s:[cu,cu,cu],q:qLevel(i),pal,pc:c.t/nt,per:80});
        for(const c of LB)if(!crBS.has(c))W2.box.add({c:[c.p.x,c.p.y,c.p.z],s:[cu,cu,cu],q:qLevel(j),pal,pc:c.t/nt,per:80});
        if(shed)fly.forEach(f=>W2.box.add({c:[0,0,0],off:[f.a.x,f.a.y,f.a.z],fly:[f.b.x,f.b.y,f.b.z,r()*0.5],lift:f.lift,g:0,s:[cu,cu,cu],m:[5,R2(2,6)*sgn(),0,0],ax:rax(),pal,pc:0.8,per:80}))}}})}

  /* ---- the stepped sky: inverted ziggurats hanging beside the road and far off ---- */
  const zig=(name,o)=>{const n=R2(o.n0,o.n1)|0,sh=R2(o.sh0,o.sh1),half=R2(o.w0,o.w1),inv=r()<o.inv;
    put(name,6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,o.mid?0:sgn()*R2(o.d0,o.d1),R2(o.h0,o.h1)),qq=qLevel(i),dir=inv?-1:1,cy=c[1]+dir*n*sh/2;
      return{b:[[c[0],cy,c[2],Math.hypot(half,half,n*sh/2)*1.02]],add:()=>{const pal=pick([1,2,5]),pc=r();for(let t=0;t<n;t++){const w=half*2*(1-t/(n+0.6));W2.box.add({c,q:qq,off:[0,dir*(t+0.5)*sh,0],s:[w,sh*0.94,w],pal,pc:pc+t*0.05,per:300,k:0.9,br:0.015})}}}})};
  for(let n=0,nn=cnt(2.5,[0.3,0.6,1]);n<nn;n++)zig('stepped sky',{n0:5,n1:8,sh0:7,sh1:11,w0:28,w1:55,d0:110,d1:300,h0:-60,h1:60,inv:0.4});
  for(let n=0,nn=cnt(1,[0,0.5,1]);n<nn;n++)zig('stepped sky (far)',{n0:6,n1:10,sh0:12,sh1:20,w0:60,w1:120,d0:300,d1:520,h0:-120,h1:60,inv:0.5});
  if(q===2)zig('stepped sky (over the road)',{n0:6,n1:8,sh0:12,sh1:16,w0:110,w1:140,mid:1,h0:230,h1:290,inv:1.1});

  /* ---- block rings round the road on straights: a notch each bar, swelling on the kick (group of boxes per ring) ---- */
  const ringR=Math.hypot(W/2+SPC_O.margin,(SPC_O.above+SPC_O.below)/2)+5,hc=(SPC_O.above-SPC_O.below)/2;
  if(q&&STR.length)for(let n=0,nn=cnt(1.4,[0,0.6,1]);n<nn;n++){const nb=14+2*(n%3),Rr=ringR+(n%3)*2.2,bs=2.6;
    put('block rings',5,k=>{const i=pick(STR),qq=qRoad(i),c=new V3().copy(P[i]).addScaledVector(U[i],hc),balls=[];
      for(let a=0;a<48;a++){const th=a*TAU/48,p=c.clone().addScaledVector(R[i],Math.cos(th)*Rr).addScaledVector(U[i],Math.sin(th)*Rr);balls.push([p.x,p.y,p.z,bs*1.8])}
      return{b:balls,add:()=>{const pal=pick([0,1,2,4]),ph=r()*TAU;for(let b=0;b<nb;b++){const th=ph+b*TAU/nb;_q.setFromAxisAngle(new V3(0,0,1),th);
        W2.box.add({c:[c.x,c.y,c.z],q:qq,off:[Math.cos(th)*Rr,Math.sin(th)*Rr,0],bq:[_q.x,_q.y,_q.z,_q.w],s:[bs,Rr*TAU/nb*0.7,bs*1.4],m:[3,TAU/nb/2*(n%2?1:-1),0,0.12*(n%2?1:-1)],ax:[0,0,1],pal,pc:b/nb,per:30})}}}})}

  /* ---- gyroscopes beside the road (a notch on each beat), one huge one far off, and a gate the road runs through ---- */
  const gyro=(Lb,c,qq,size,nR,mode,pal)=>{for(let k=0;k<nR;k++){const rad=size*(1-k*0.13),n=new V3(...rax()),a=new V3(...rax()).cross(n).normalize(),pts=[],u0=new V3().crossVectors(n,a).normalize();
      for(let s=0;s<40;s++){const t=s*TAU/40;pts.push([Math.cos(t)*rad*a.x+Math.sin(t)*rad*u0.x,Math.cos(t)*rad*a.y+Math.sin(t)*rad*u0.y,Math.cos(t)*rad*a.z+Math.sin(t)*rad*u0.z])}
      Lb.obj({c,q:qq,m:mode==='beat'?[2,TAU/24*(k%2?1:-1),r()*TAU,0]:[1,(0.05+k*0.04)*(k%2?1:-1),r()*TAU,0],ax:[a.x,a.y,a.z],pal,br:0.04,ext:size});SPS.loop(pts,k/nR).forEach(([p0,p1,pc])=>Lb.seg(p0,p1,pc,1))}
    Lb.obj({c,q:qq,m:[1,0.6,0,0],ax:[0,1,0],pal,ext:size});SPS.solid(2,size*0.16).forEach(([p0,p1,pc])=>Lb.seg(p0,p1,pc,1.2))};
  for(let n=0,nn=cnt(1.5,[0.3,0.6,1]);n<nn;n++){const size=R2(10,24);put('gyroscopes',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(45,110),R2(14,50));return{b:[[...c,size*1.08]],add:()=>gyro(LB(i),c,SP_Q0,size,4+(n%2),'beat',pick([1,2,3,4,5]))}})}
  if(q)put('gyroscopes (huge)',8,k=>{const i=Math.floor(r()*N),c=at(i,sgn()*R2(700,950),R2(330,420));return{b:[[...c,260]],add:()=>gyro(farL,c,SP_Q0,240,6,'spin',5)}});
  if(q&&STR.length&&r()<0.75)put('gyroscope gate',6,k=>{const i=pick(STR),qq=qRoad(i),c=new V3().copy(P[i]).addScaledVector(U[i],hc),balls=[],r0=ringR+2;
    for(let a=0;a<48;a++){const th=a*TAU/48;for(const rr of[r0,r0+4.5,r0+9,r0+14]){const p=c.clone().addScaledVector(R[i],Math.cos(th)*rr).addScaledVector(U[i],Math.sin(th)*rr);balls.push([p.x,p.y,p.z,2.5])}}
    return{b:balls,add:()=>{const Lb=LB(i),pal=pick([1,2,5]);for(let k2=0;k2<4;k2++){Lb.obj({c:[c.x,c.y,c.z],q:qq,m:k2%2?[2,TAU/32,0,0]:[1,0.25*(k2-1.5),0,0],ax:[0,0,1],pal,br:0.03,ext:r0+16});
      SPS.tickRing(r0+k2*4.5,48,1.2,true).forEach(([a,b,pc])=>Lb.seg(a,b,pc,1.1))}st.gate=Math.round(ix(i)*ds)}}});

  /* ---- knots that untie and tie again as another knot (KNOT: two shapes, one morph) ---- */
  const knotAt=(Lb,c,size,pal,fast)=>{const A=SPS.knot(2,3,size*0.6,size*0.28,fast?120:180,3,size*0.05),B=SPS.knot(3,5,size*0.55,size*0.25,fast?120:180,3,size*0.05);
    Lb.obj({c,m:[1,0.15*sgn(),r()*TAU,0],ax:rax(),pal,br:0.04,ext:size});A.forEach((S,s)=>{for(let i=0;i<S.length-1;i++)Lb.seg(S[i],S[i+1],i/S.length,1,B[s][i],B[s][i+1])})};
  /* Prototype 63: no longer free in the sky (Eric: "a little out of place"): the knots frame the portals instead (004s) */
  if(q&&ctx.port)spPortalKnots(ctx,knotL,clr,r,st,why);

  /* ---- unfolding solids: a cube opens into its cross and folds back, a tetrahedron into its star (faces hinge on the beat) ---- */
  if(q)for(let n=0,nn=cnt(1.5,[0,0.6,1]);n<nn;n++){const s=R2(8,14),cube=n%2===0;
    put('unfolding solids',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(40,80),R2(14,34));return{b:[[...c,s*(cube?2.3:2)]],add:()=>{const Lb=LB(i),pal=pick([0,1,2,3,4,5]),ph=r(),qq=rq(),h=s/2;
      if(cube){const sq=(pts,piv,ax,amp,pc)=>{Lb.obj({c,q:qq,m:[7,0,ph,amp],ax,piv,pal,ext:s*2});SPS.loop(pts).forEach(([a,b])=>Lb.seg(a,b,pc,1.1));Lb.seg(pts[0],pts[2],pc,0.5)};
        sq([[-h,-h,-h],[h,-h,-h],[h,-h,h],[-h,-h,h]],[0,0,0],[1,0,0],0,0);
        sq([[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]],[0,-h,h],[1,0,0],Math.PI/2,0.3);sq([[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h]],[0,-h,-h],[1,0,0],-Math.PI/2,0.5);
        sq([[h,-h,-h],[h,-h,h],[h,h,h],[h,h,-h]],[h,-h,0],[0,0,1],-Math.PI/2,0.7);sq([[-h,-h,-h],[-h,-h,h],[-h,h,h],[-h,h,-h]],[-h,-h,0],[0,0,1],Math.PI/2,0.9);
        sq([[-h,h,-h],[h,h,-h],[h,h,h],[-h,h,h]],[0,-h,-h],[1,0,0],-Math.PI/2,1)}
      else{const T3=[0,1,2].map(k2=>[Math.cos(k2*TAU/3)*s*0.6,-h*0.6,Math.sin(k2*TAU/3)*s*0.6]),top=[0,s*0.6,0];Lb.obj({c,q:qq,pal,ext:s*2});SPS.loop(T3).forEach(([a,b])=>Lb.seg(a,b,0,1.1));
        for(let k2=0;k2<3;k2++){const a=T3[k2],b=T3[(k2+1)%3],ax=new V3(b[0]-a[0],0,b[2]-a[2]).normalize();Lb.obj({c,q:qq,m:[7,0,ph,-1.9],ax:[ax.x,ax.y,ax.z],piv:a,pal,ext:s*2});Lb.seg(a,top,0.5+k2*0.15,1.1).seg(b,top,0.5+k2*0.15,1.1).seg(a,b,0.4,0.6)}}}}})}

  /* ---- sacred geometry: the five solids in a turning ring, the flower of life, star tetrahedra, nested solids far off ---- */
  if(q)for(let n=0,nn=cnt(1.2,[0,0.6,1]);n<nn;n++){const kd=n%3;
    put('sacred geometry',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const size=kd===0?4:kd===1?34:3.5,c=at(i,sgn()*(kd===1?R2(70,110):R2(30,60)),kd===1?R2(35,60):R2(8,26)),rad=kd===0?size*4.2:kd===1?size*0.65:size*1.5;
      return{b:[[...c,rad]],add:()=>{const Lb=LB(i),pal=pick([1,2,3,5]);
        if(kd===0){for(let s=0;s<5;s++){const a=s*TAU/5;Lb.obj({c,m:[1,0.3,0,0],ax:[0,1,0],pal,br:0.05,ext:rad});SPS.solid(s,size*0.8,[Math.cos(a)*size*3,0,Math.sin(a)*size*3]).forEach(([p0,p1,pc])=>Lb.seg(p0,p1,s/5,1.2))}}
        else if(kd===1){const dir=new V3(...c).sub(P[i]).setY(0).normalize(),qq=qB(new V3(-dir.z,0,dir.x),UP);Lb.obj({c,q:qq,m:[1,0.08*sgn(),0,0],ax:[0,0,1],pal,br:0.03,ext:rad});SPS.flower(size).forEach(([p0,p1,pc])=>Lb.seg(p0,p1,pc,0.9))}
        else for(const sg of[1,-1]){Lb.obj({c,m:[1,0.4*sg,0,0],ax:[0,1,0],pal,br:0.05,ext:rad});SPS.edges(new THREE.TetrahedronGeometry(size,0),sg).forEach(([p0,p1,pc])=>Lb.seg(p0,p1,pc,1.2))}}}})}
  if(q===2)put('sacred geometry (huge)',6,k=>{const i=Math.floor(r()*N),c=at(i,sgn()*R2(650,850),R2(380,460));return{b:[[...c,260]],add:()=>{for(let s=4;s>=0;s--){farL.obj({c,m:[1,0.05*(s%2?1:-1)*(1+s*0.3),0,0],ax:rax(),pal:1,ext:260});SPS.solid(s,60+s*40).forEach(([p0,p1,pc])=>farL.seg(p0,p1,s/5+pc*0.2,1))}}}});

  /* ---- pieces of the other realms drifting past (Prism rock, an Urban block, a Reef coral head, a Forest crown) ---- */
  if(q)for(let n=0,nn=cnt(1,[0,0.6,1]);n<nn;n++){const kd=n%4,s=R2(14,24);put('other realms',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(60,120),R2(10,40));
    return{b:[[...c,s*1.45]],add:()=>addSegs(LB(i),{c,m:[1,0.1*sgn(),r()*TAU,s*0.05],ax:[0,1,0],pal:[0,3,4,4][kd],br:0.03,ext:s*1.3},SPS.realm(kd,s,r),1.1)}})}

  /* ---- free shoals wheeling beside the road: they bunch on the kick and scatter on the drop ---- */
  if(q)for(let n=0,nn=cnt(0.8,[0,0.6,1]);n<nn;n++){const rad=R2(26,40),nf=q===2?140:70,fz=R2(1,1.6);
    put('shoals',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(110,150),R2(40,70));return{b:[[...c,rad+8]],add:()=>{const pal=pick([1,2,4,5]),w=R2(0.2,0.4)*sgn();
      for(let f=0;f<nf;f++){const a=r()*TAU,rr=rad*(0.6+0.4*r()),h=(r()-0.5)*rad*0.4,d=new V3(r()-0.5,r()-0.5,r()-0.5).normalize();sh.fish([c[0]+Math.cos(a)*rr,c[1]+h,c[2]+Math.sin(a)*rr,r()*TAU],[d.x,d.y,d.z,fz],[c[0],c[1],c[2],w],[pal,4,r(),0])}}}})}

  /* ---- shapes made of shoals ("all, occasionally": Default only, one or two a track) ---- */
  const shoalForm=(segs,c,qq,o)=>{let tot=0;for(const[a,b]of segs)tot+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const per=tot/o.n,Q=new THREE.Quaternion(qq[0],qq[1],qq[2],qq[3]),pa=new V3(),pb=new V3();
    for(const[a,b]of segs){const l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);for(let f=r()*per;f<l;f+=per){const t=f/l;pa.set(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t).applyQuaternion(Q);
      const d=pa.clone().normalize();sh.fish([c[0]+pa.x,c[1]+pa.y,c[2]+pa.z,r()*TAU],[d.x,d.y,d.z,o.fish*(0.7+0.6*r())],[0,0,0,0],[o.pal,o.amp,r()*0.2,0])}}};
  if(q===2){const forms=['pyramid','ring','arch','colossus'].filter(()=>r()<0.45);if(!forms.length)forms.push(pick(['pyramid','ring','arch']));
    for(const f of forms.slice(0,2)){
      if(f==='pyramid'){const sz=70;put('shoal pyramid',6,k=>{const i=Math.floor(r()*N);if(!roadOK(i))return null;const c=at(i,sgn()*R2(150,220),-30);return{b:[[c[0],c[1]+sz*0.4,c[2],sz*0.85]],add:()=>{const segs=[];for(let t=0;t<6;t++){const w=sz*(1-t/6)/2,y=t*sz*0.15;SPS.loop([[-w,y,-w],[w,y,-w],[w,y,w],[-w,y,w]],0,segs)}for(const[x,z]of[[-1,-1],[1,-1],[1,1],[-1,1]])segs.push([[x*sz/2,0,z*sz/2],[0,sz*0.9,0],0]);shoalForm(segs,c,qLevel(i),{n:1000,fish:1.4,amp:8,pal:1})}}})}
      else if(f==='ring'&&STR.length){put('shoal ring',6,k=>{const i=pick(STR),Rr=ringR+6,c=new V3().copy(P[i]).addScaledVector(U[i],hc),balls=[];for(let a=0;a<40;a++){const th=a*TAU/40,p=c.clone().addScaledVector(R[i],Math.cos(th)*Rr).addScaledVector(U[i],Math.sin(th)*Rr);balls.push([p.x,p.y,p.z,6])}
        return{b:balls,add:()=>shoalForm(SPS.loop(SPS.ring(Rr,48,'xy')),[c.x,c.y,c.z],qRoad(i),{n:700,fish:0.9,amp:2,pal:2})}})}
      else if(f==='arch'&&STR.length){put('shoal arch',6,k=>{const i=pick(STR),span=ringR+6,c=new V3().copy(P[i]),balls=[];for(let a=0;a<=24;a++){const th=a*Math.PI/24,p=c.clone().addScaledVector(R[i],Math.cos(th)*span).addScaledVector(U[i],Math.sin(th)*span*1.3);balls.push([p.x,p.y,p.z,6])}
        return{b:balls,add:()=>{const segs=[];for(const w of[0,3])segs.push(...SPS.path(Array.from({length:25},(_,a)=>{const th=a*Math.PI/24;return[Math.cos(th)*(span+w),Math.sin(th)*(span+w)*1.3,0]})));shoalForm(segs,[c.x,c.y,c.z],qRoad(i),{n:900,fish:0.9,amp:2.5,pal:4})}}})}
      else if(f==='colossus'){const H=1100;put('shoal colossus',8,k=>{const a=r()*TAU,d=R2(1500,1900),c=[cxT+Math.cos(a)*d,minY-260,czT+Math.sin(a)*d];return{b:[[c[0],c[1]+H*0.3,c[2],H*0.4]],add:()=>{const cl=SPS.colossus(H);shoalForm(cl.body.concat(cl.head.map(([a2,b2,pc])=>[[a2[0]+cl.neck[0],a2[1]+cl.neck[1],a2[2]+cl.neck[2]],[b2[0]+cl.neck[0],b2[1]+cl.neck[1],b2[2]+cl.neck[2]],pc])),c,qB(new V3(Math.cos(a+Math.PI/2),0,Math.sin(a+Math.PI/2)),UP),{n:2200,fish:6,amp:30,pal:3})}}})}}}

  /* ---- rooms the road passes through: the lattice hall, following the road's frames round bends; its inner wall and
     beams open wherever they would hide the road ahead (cut segment by segment by the rule) ---- */
  const rooms=[];if(q){const nRoom=Math.max(1,cnt(0.18,[0,1,1]));for(let n=0;n<nRoom;n++){const len=R2(320,520),n0=Math.round(len/ds);let i0=-1;
    for(let t=0;t<30&&i0<0;t++){const i=Math.floor(r()*N);let okR=true;for(let k=0;k<=n0&&okR;k+=4){const j=ix(i+k);if(gap[j]||spl[j]||kind[j]||U[j].y<0.9)okR=false}if(okR&&!rooms.some(o=>Math.abs(wrapI(o.i0-i))<n0*2))i0=i}
    if(i0<0){why.rooms=(why.rooms||0)+1;continue}rooms.push({i0,n0});
    const Lb=LB(i0),pal=pick([2,5]),wx=W/2+SPC_O.margin+3,top=SPC_O.above+4,bot=-SPC_O.below-4,stp=Math.max(1,Math.round(10/ds)),cols=[-wx,-wx/2,0,wx/2,wx],rows=[bot,top*0.5,top];
    Lb.obj({pal,ext:0});let prev=null;let cut=0;
    const pt=(j,x,y)=>{const p=P[j],rr=R[j],uu=U[j];return[p.x+rr.x*x+uu.x*y,p.y+rr.y*x+uu.y*y,p.z+rr.z*x+uu.z*y]};
    const segOK=(a,b)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const n=Math.max(2,Math.ceil(l/2));for(let q=0;q<=n;q++){const f=q/n,p=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];if(!clr.ok(p[0],p[1],p[2],1.2))return false}return l>0};
    const S=(a,b,pc,pk)=>{if(segOK(a,b))Lb.seg(a,b,pc,pk);else cut++};
    for(let k=0;k<=n0;k+=stp){const j=ix(i0+k),f=k/n0,fade=Math.min(1,f*6,(1-f)*6);
      const ring=[pt(j,-wx,bot),pt(j,-wx,top),pt(j,wx,top),pt(j,wx,bot)];for(let e=0;e<3;e++)S(ring[e],ring[e+1],0.2+e*0.15,0.9*fade);S(ring[3],ring[0],0.1,0.5*fade);
      if(prev){for(const x of cols){S(prev.t[x],pt(j,x,top),0.6,0.7*fade);S(prev.b[x],pt(j,x,bot),0.05,0.5*fade)}for(const y of rows){S(prev.l[y],pt(j,-wx,y),0.4,0.7*fade);S(prev.r[y],pt(j,wx,y),0.4,0.7*fade)}
        if((k/stp)%2===0){S(prev.l[bot],pt(j,-wx,top),0.5,0.45*fade);S(prev.r[top],pt(j,wx,bot),0.5,0.45*fade);S(prev.t[-wx],pt(j,wx,top),0.7,0.4*fade)}}
      prev={t:{},b:{},l:{},r:{}};for(const x of cols){prev.t[x]=pt(j,x,top);prev.b[x]=pt(j,x,bot)}for(const y of rows){prev.l[y]=pt(j,-wx,y);prev.r[y]=pt(j,wx,y)}}
    st.cut+=cut;
    /* hanging lattice bodies (Default only): nested solids hung from above the ceiling, clear of everything */
    if(q===2)for(let b=0;b<4;b++){const j=ix(i0+Math.round((b+0.5)/4*n0)),s=R2(5,8),c=pt(j,R2(-wx,wx)*0.6,top+s*1.6+4);
      if(clr.ok(c[0],c[1],c[2],s*1.4)){Lb.obj({c,m:[1,0.25*sgn(),0,0],ax:[0,1,0],pal,br:0.04,ext:s*2});SPS.solid(4,s).forEach(([a,b2,pc])=>Lb.seg(a,b2,pc,1.2));SPS.solid(1,s*0.5).forEach(([a,b2,pc])=>Lb.seg(a,b2,pc,0.9))}}}}

  /* ---- the segmented serpent under each spiral: one coil under its lowest turn, the neck and head rising outside ---- */
  if(q)for(const f of feats){if(f.kind!=='helix'&&f.kind!=='dhelix')continue;const a2=Math.floor(f.u0/ds),b2=Math.ceil(f.u1/ds);let cx0=0,cz0=0,n=0,lo=1e9;for(let k=a2;k<=b2;k++){const p=P[ix(k)];cx0+=p.x;cz0+=p.z;n++;lo=Math.min(lo,p.y)}if(!n)continue;cx0/=n;cz0/=n;
    let rr=0;for(let k=a2;k<=b2;k+=4){const p=P[ix(k)];rr+=Math.hypot(p.x-cx0,p.z-cz0)}rr/=Math.ceil((b2-a2+1)/4);const y0=lo-SPC_O.below-16,segs=[],nb=Math.round(TAU*rr/7);
    for(let s=0;s<nb;s++){const th=s/nb*TAU*0.92,wv=Math.sin(s*0.35)*2.5,x=cx0+Math.cos(th)*(rr+wv),z=cz0+Math.sin(th)*(rr+wv),w=(W*0.9)*(0.5+0.5*Math.sin(Math.PI*Math.min(1,s/nb*1.15+0.05)));segs.push({x,y:y0+Math.sin(s*0.21)*1.5,z,w,th})}
    const last=segs[segs.length-1];for(let s=1;s<=10;s++){const th=last.th+s*0.03,R0=rr+s*4+20;segs.push({x:cx0+Math.cos(th)*R0,y:y0+s*s*0.9,z:cz0+Math.sin(th)*R0,w:W*0.5,th})}
    if(segs.every(s=>clr.ok(s.x,s.y,s.z,0.5*Math.hypot(0.9*s.w,3.2,6.2)+0.3)))segs.forEach((s,k)=>{_q.setFromAxisAngle(UP,-s.th);W2.box.add({c:[s.x,s.y,s.z],bq:[_q.x,_q.y,_q.z,_q.w],s:[s.w*0.9,3.2,6.2],pal:4,pc:k/segs.length,per:20,br:0.02,k:k>=segs.length-10?1.3:1})});else why.serpent=(why.serpent||0)+1}

  /* ---- arches that assemble ahead of the leader and burst after the last racer (groups 1..; 004r drives them) ---- */
  const arches=[];if(q&&STR.length)for(let n=0,nn=Math.min(4,1+(q===2?1:0)+(km>6?1:0));n<nn;n++){const span=ringR+2,rise=1.25,nb=19,bs=3.2;
    put('arches',8,k=>{const i=pick(STR);if(arches.some(a=>Math.abs(wrapI(a.i-i))*ds<300))return null;const c=new V3().copy(P[i]),balls=[],rad=a=>new V3().addScaledVector(R[i],Math.cos(a)).addScaledVector(U[i],Math.sin(a)*rise).normalize();
      for(let b=0;b<nb;b++){const a=b/(nb-1)*Math.PI,home=c.clone().addScaledVector(R[i],Math.cos(a)*span).addScaledVector(U[i],Math.sin(a)*span*rise),d=rad(a);for(let f=0;f<=36;f++){const p=home.clone().addScaledVector(d,f/36*225).addScaledVector(Tg[i],f/36*40);balls.push([p.x,p.y,p.z,bs*1.2])}}
      return{b:balls,add:()=>{const g=1+arches.length,pal=pick([1,4]);arches.push({i,u:ix(i)*ds,g});for(let b=0;b<nb;b++){const a=b/(nb-1)*Math.PI,home=c.clone().addScaledVector(R[i],Math.cos(a)*span).addScaledVector(U[i],Math.sin(a)*span*rise),d=rad(a),from=home.clone().addScaledVector(d,225).addScaledVector(Tg[i],40);
        _m.lookAt(new V3(),d,Tg[i]);_q.setFromRotationMatrix(_m);W2.glyph.add({c:[0,0,0],off:[from.x,from.y,from.z],fly:[home.x,home.y,home.z,b%2?0.25:0.05],g,s:[bs,bs*1.1,bs*1.6],bq:[_q.x,_q.y,_q.z,_q.w],m:[5,3*sgn(),0,0],ax:rax(),gl:b===(nb>>1)?3:-1,pal,pc:b/nb,per:25,k:1.1})}}}})}

  /* ---- colossi, 1.3 to 1.9 km tall, sunk to the waist in the void's floor; their heads follow the leader (slots 4..6) ---- */
  const floorY=minY-300,colossi=[];for(let n=0,nn=q===2?3:q===1?2:1;n<nn;n++){const H=R2(1300,1900);
    put('colossi',10,k=>{const a=r()*TAU,d=R2(1700,2300),c=[cxT+Math.cos(a)*d,floorY,czT+Math.sin(a)*d];if(colossi.some(o=>Math.hypot(o.c[0]-c[0],o.c[2]-c[2])<900))return null;
      return{b:[[c[0],c[1]+H*0.35,c[2],H*0.45]],add:()=>{const cl=SPS.colossus(H),yaw=Math.atan2(cxT-c[0],czT-c[2]),qq=[0,Math.sin(yaw/2),0,Math.cos(yaw/2)],slot=4+colossi.length;
        addSegs(live,{c,q:qq,pal:[5,1,3][n%3],br:0.01,ext:H},cl.body,1,0,1);live.obj({c,q:qq,m:[8,0,0,0],piv:cl.neck,slot,pal:[5,1,3][n%3],ext:H});cl.head.forEach(([a2,b2,pc])=>live.seg([a2[0]+cl.neck[0],a2[1]+cl.neck[1],a2[2]+cl.neck[2]],[b2[0]+cl.neck[0],b2[1]+cl.neck[1],b2[2]+cl.neck[2]],pc,1.2));
        colossi.push({c,H,yaw,slot,neck:cl.neck})}}})}
  /* ---- wireframe heads pacing the pack (slots 0..3) and rare neon ghost riders (slots 7..12); posed by 004r ---- */
  const HEADS=[{sd:-1,d:34,up:10,s:8,du:20},{sd:1,d:48,up:16,s:12,du:55},{sd:-1,d:130,up:50,s:34,du:170},{sd:1,d:170,up:80,s:46,du:280}].slice(0,q===2?4:q===1?2:0);
  HEADS.forEach((h,k)=>{live.obj({m:[8,0,0,0],slot:k,pal:[5,2,1,3][k],ext:1e4});SPS.head().forEach(([a,b,pc])=>live.seg([a[0]*h.s,a[1]*h.s-h.s/2,a[2]*h.s],[b[0]*h.s,b[1]*h.s-h.s/2,b[2]*h.s],pc,1))});
  const RIDE=q?6:0;for(let k=0;k<RIDE;k++){live.obj({m:[8,0,0,0],slot:7+k,pal:2,ext:1e4});SPS.rider().forEach(([a,b,pc])=>live.seg(a,b,pc,0.9))}
  /* echoes: three after-images of each of the first three racers (slots 13..15 and the CPU's own; see 004r) */
  const ECHO=q?3:0;for(let k=0;k<ECHO*3&&13+k<24;k++){live.obj({m:[8,0,0,0],slot:13+k,pal:5,ext:1e4});SPS.rider().forEach(([a,b,pc])=>live.seg(a,b,pc,0.35))}
  /* the echo stretches: two short ones (120 m) on plain road, far apart */
  const echoes=[];if(q)for(let t=0;t<40&&echoes.length<2;t++){const i=Math.floor(r()*N),n0=Math.round(120/ds);let okE=true;for(let k=0;k<=n0;k+=3)if(gap[ix(i+k)]||kind[ix(i+k)])okE=false;if(okE&&!echoes.some(e=>Math.abs(wrapI(e.i0-i))*ds<L/4))echoes.push({i0:i,u0:i*ds,u1:i*ds+120})}

  /* ---- the void: stars all round (the sky, which follows the camera), and the floor of light under the colossi ---- */
  const sky=new THREE.Group(),ns=[400,900,1500][q],sp=new Float32Array(ns*3),ss=new Float32Array(ns);for(let k=0;k<ns;k++){const th=r()*TAU,ph=Math.acos(2*r()-1),Rs=2200+r()*500;sp[k*3]=Rs*Math.sin(ph)*Math.cos(th);sp[k*3+1]=Rs*Math.cos(ph);sp[k*3+2]=Rs*Math.sin(ph)*Math.sin(th);ss[k]=1+r()*r()*2.5}
  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));g.setAttribute('aS',new THREE.BufferAttribute(ss,1));
    const m=new THREE.Points(g,new THREE.ShaderMaterial({uniforms:{uK:{value:1}},vertexShader:`attribute float aS;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aS;gl_Position=projectionMatrix*mv;}`,fragmentShader:`void main(){vec2 q=gl_PointCoord-0.5;float r=1.-smoothstep(0.1,0.5,length(q));gl_FragColor=vec4(vec3(0.8,0.75,1.)*r*0.7,1.);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    m.frustumCulled=false;m.renderOrder=-10;sky.add(m)}
  group.add(sky);ctx.sky=sky;
  let floor=null;if(q&&colossi.length){const g=new THREE.PlaneGeometry(12000,12000,1,1);g.rotateX(-Math.PI/2);const cs=colossi.map(o=>new THREE.Vector3(o.c[0],o.c[2],0.14*colossi[0].H/1300));while(cs.length<3)cs.push(new THREE.Vector3(1e7,1e7,0));
    floor=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:Object.assign({},SPU,{uC:{value:cs}}),vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader:`uniform float uT,uKick,uCalm,uWorld;uniform vec3 uC[3];varying vec3 vW;void main(){float g=0.;for(int i=0;i<3;i++){float d=distance(vW.xz,uC[i].xy);float w=mod(d-uT*40.,260.);g+=(exp(-w*w/600.)*0.5+0.15*exp(-d/160.))*exp(-d/1600.);}
        float dc=distance(vW.xz,cameraPosition.xz);g*=1.-smoothstep(1500.,3200.,dc);gl_FragColor=vec4(vec3(0.45,0.3,1.)*g*0.35*(1.+0.4*uKick*(1.-uCalm))*uWorld,1.);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    floor.position.set(cxT,floorY,czT);floor.renderOrder=0;floor.frustumCulled=false;group.add(floor)}

  lap('pieces');
  /* ---- the lattice, the backbone (004q) ---- */
  const lat=spLattice(ctx,clr,r,q);lap('lattice');
  /* ---- into the scene: wire solids (one draw a shape), lines by region (culled), far lines, knots, the live slots, shoals ---- */
  const meshes=[];const addM=m=>{if(m){group.add(m);meshes.push(m)}return m};
  const fogN=[500,2400],fogF=[900,3000];
  addM(W2.box.mesh(spWireMat({fog:fogN})));addM(W2.glyph.mesh(spWireMat({glyph:true,fog:fogN})));for(const s of solids)addM(W2[s].mesh(spWireMat({tri:true,fog:fogN})));
  const lmat=spLineMat({fog:fogN,width:0.16});regs.forEach(Lb=>Lb&&addM(Lb.mesh(lmat,true)));addM(farL.mesh(spLineMat({fog:fogF,width:0.5,maxPx:5}),false));addM(knotL.mesh(spLineMat({fog:fogN,width:0.16,knot:true}),false));
  const liveMat=spLineMat({fog:[1200,3000],width:0.22,maxPx:6});liveMat.defines.SLOTS=1;addM(live.mesh(liveMat,false));addM(sh.mesh());
  for(const m of lat.meshes)addM(m);
  /* what the moving parts need (004r), and the line that describes the track */
  lap('meshes');delete ms.t;ctx.spirit={ms,L,seed,q,clr,arches,colossi,heads:HEADS,riders:RIDE,echo:ECHO,echoes,rooms,lat,floor,meshes,stats:st,why,counts:{box:W2.box.n,glyph:W2.glyph.n,solids:solids.reduce((a,s)=>a+W2[s].n,0),lines:regs.reduce((a,L0)=>a+(L0?L0.n:0),0)+farL.n,knots:knotL.n,live:live.n,fish:sh.n,lattice:lat.segs}};
  ctx.tick=(t,anim)=>spLive(ctx.spirit,t,anim);
  ctx.info.push('the Spirit realm'+(rooms.length?' · '+ctx.pl(rooms.length,'room'):'')+(arches.length?' · '+arches.length+(arches.length>1?' arches':' arch'):''));
  function wrapI(d){d=((d%N)+N)%N;return d>N/2?d-N:d}}
