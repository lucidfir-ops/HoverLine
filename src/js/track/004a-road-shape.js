//# track/004a-road-shape.js: the road's shape from a code: the centreline loop, its features (addFeatures, 004b), splits, pit lanes, cuts and the new jumps' routes, frames; trackFaults and the jump curves
/* Prototype 61 (the split of 004-track.js): the first step of buildTrack. Returns the road object rd: the centreline P,
   frames R U Tg, headings H, curvature (Cs over 60 m, Kg in the road, Kn over the crest), kind and gap per sample, feats,
   jumps, drops, splits (spl per sample), and what the next steps need (the rng r, gI0 where the green strips start). */
function roadShape(seed,wk,cx,lk,sp,bk){
  const D=DIFF[wk]||DIFF.S,LN=LENS[lk]||LENS.M;W=D.w;
  let r,L,N,ds,P,Tg,H,C,Cs,minR=0;
  /* About a quarter of tracks (or the editor's Figure 8) are a figure of eight: the circuit crosses itself once, the two
     passes 30-50 m apart in height, so one goes over the other on a bridge. */
  const r8=rng((seed^0xF18E8)>>>0),fig8=sp?sp.b===3:r8()<0.25,H8=15+r8()*10;
  /* The loop through the control points: even 2 m samples, tangents, headings and curvature (C), curvature averaged over
     60 m (Cs, which sets minR), and the sharpest spots: the most the heading turns in any 30 m (sharp) and the most the
     pitch changes in any 30 m (pitchy). */
  let pts=null,mxI=0,sharp=0,sharpI=0,pitchy=0,pitchyI=0,steep=0,steepI=0;
  const loopOf=()=>{const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal',0.5);
    L=curve.getLength();N=Math.round(L/2);ds=L/N;
    P=curve.getSpacedPoints(N);P.length=N;
    Tg=[];H=new Float32Array(N);C=new Float32Array(N);Cs=new Float32Array(N);
    for(let i=0;i<N;i++){const t=new THREE.Vector3().subVectors(P[(i+1)%N],P[(i-1+N)%N]).normalize();Tg.push(t);H[i]=Math.atan2(t.x,t.z)}
    for(let i=0;i<N;i++)C[i]=wrapA(H[(i+1)%N]-H[(i-1+N)%N])/(2*ds);
    const K=Math.max(1,Math.round(30/ds));let mx=0;
    for(let i=0;i<N;i++){let s=0;for(let k=-K;k<=K;k++)s+=C[(i+k+N)%N];Cs[i]=s/(2*K+1);if(Math.abs(Cs[i])>mx){mx=Math.abs(Cs[i]);mxI=i}}
    minR=1/Math.max(mx,1e-4);
    const k15=Math.max(1,Math.round(15/ds));sharp=pitchy=steep=0;
    for(let i=0;i<N;i++){let s=0;for(let k=-k15;k<k15;k++)s+=C[(i+k+N)%N];s=Math.abs(s)*ds;if(s>sharp){sharp=s;sharpI=i}
      const pv=Math.abs(Math.asin(Tg[(i+k15)%N].y)-Math.asin(Tg[(i-k15+N)%N].y));if(pv>pitchy){pitchy=pv;pitchyI=i}
      const st=Math.abs(Math.asin(Tg[i].y));if(st>steep){steep=st;steepI=i}}};
  for(let attempt=0;attempt<16;attempt++){
    r=rng(seed+attempt*7919);
    if(sp&&sp.train){pts=trainPts(sp.train,D);loopOf();break}
    if(sp&&sp.quick){pts=qkPts(sp.quick);loopOf();break}
    const n0=Math.max(6,D.n[0]-(cx?1:0)+LN.dn)+Math.floor(r()*(D.n[1]-D.n[0]+1)),n=!sp||sp.b===1||sp.b===3?n0:sp.b===0?Math.max(5,D.n[0]-2+LN.dn):D.n[1]+2+LN.dn;pts=[];
    const sx=0.8+r()*0.45,sz=0.8+r()*0.45;
    if(fig8){const n8=Math.round(n*1.7),base=(D.rad[0]+(0.35+0.4*r())*D.rad[1])*LN.f*1.3,p1=r()*TAU,p2=r()*TAU,a1=0.1+0.08*r(),a2=0.06*r();
      for(let i=0;i<n8;i++){const a=Math.PI/2+i/n8*TAU,rad=base*(1+a1*Math.sin(a+p1)+a2*Math.sin(2*a+p2));
        pts.push(new THREE.Vector3(Math.sin(a)*rad*sx,H8*Math.cos(a)+(r()-.5)*D.elev*(cx?0.4:0.6)*Math.abs(Math.sin(a)),Math.sin(a)*Math.cos(a)*rad*sz*1.4))}}
    else for(let i=0;i<n;i++){const a=i/n*TAU+(r()-.5)*0.35;const rad=(D.rad[0]+r()*D.rad[1])*LN.f;pts.push(new THREE.Vector3(Math.cos(a)*rad*sx,(r()-.5)*D.elev*(cx?0.8:1),Math.sin(a)*rad*sz))}
    loopOf();
    if(minR>=D.minR)break}
  /* No right angles (Prototype 31). Where the loop still bends tighter than the width allows (over 60 m, or in any 30 m),
     the control point nearest the tightest spot eases towards its neighbours, and where the pitch changes too sharply in
     any 30 m its height does the same; repeat until smooth. A loop that was already smooth is left exactly as it was. */
  for(let fix=0;fix<60;fix++){const hz=minR<D.minR*0.9&&!(sp&&sp.train==='P')||sharp>D.sharp,vt=pitchy>D.pitchy||steep>D.steep;if(!hz&&!vt)break;
    const m=pts.length,ease=(i,f)=>{const at=P[i],dd=q=>(q.x-at.x)**2+(q.z-at.z)**2;let c=0,cd=1e18;pts.forEach((q,k)=>{const d=dd(q);if(d<cd){cd=d;c=k}});
      const a=pts[(c-1+m)%m],b=pts[(c+1)%m];f(pts[c],a,b,dd(a)<dd(b)?a:b)};
    if(hz)ease(minR<D.minR*0.9&&D.minR*0.9/minR>sharp/D.sharp?mxI:sharpI,(q,a,b)=>{q.x+=((a.x+b.x)/2-q.x)*0.3;q.z+=((a.z+b.z)/2-q.z)*0.3});
    /* a sharp change of pitch eases the nearest height towards its neighbours; a slope that is simply too steep brings the
       two heights either side of it closer together */
    if(vt){if(pitchy/D.pitchy>=steep/D.steep)ease(pitchyI,(q,a,b)=>{q.y+=((a.y+b.y)/2-q.y)*0.4});
      else ease(steepI,(q,a,b,o)=>{const d=(o.y-q.y)*0.15;q.y+=d;o.y-=d})}
    loopOf()}
  let R=[],U=[];
  {const B=new Float32Array(N);for(let i=0;i<N;i++)B[i]=clamp(-Cs[i]*60,-0.5,0.5);
   for(let i=0;i<N;i++){const t=Tg[i],h=H[i];const right=new THREE.Vector3(-Math.cos(h),0,Math.sin(h));const back=t.clone().negate();const up=new THREE.Vector3().crossVectors(back,right).normalize();
    const b=B[i];R.push(right.clone().multiplyScalar(Math.cos(b)).addScaledVector(up,-Math.sin(b)));U.push(up.clone().multiplyScalar(Math.cos(b)).addScaledVector(right,Math.sin(b)))}}
  let Kg=C,kind=new Uint8Array(N),gap=new Uint8Array(N),feats=[],jumps=[],drops=[],brk=null,port=null;
  /* Simple tracks: about half get one or two big vertical sections (rolling sweeps, a long dive, or a steep climb to a
     plateau and back down), and nothing that turns you over. Complex tracks pick from the full set. */
  /* Complex tracks pick a theme (a subset of feature kinds) and pack it in nearly as tightly as a maxed-out custom track,
     so they differ from each other as well as from simple ones. */
  const avoid=fig8?[0.25,0.75].map(f=>[Math.floor(N*f-170/ds),Math.ceil(N*f+170/ds)]):[];
  const rs=rng((seed^0x5B117)>>>0),splitWant=sp?(sp.n.split||0):(rs()<(cx?0.62:0.5)?1:0)+(LN.f>1.2&&rs()<0.45?1:0),splitLen=[];
  for(let q=0;q<splitWant;q++){const Ls=(520+rs()*280)*clamp(LN.f,0.85,1.25),len=Math.round((Ls+240)/ds);splitLen.push(Ls);
    let bestI=-1,bestC=1e9;for(let t=0;t<40;t++){const i0=Math.floor(N*(0.14+rs()*0.6));if(i0+len>N*0.82)continue;if(avoid.some(([a,b])=>i0<b&&i0+len>a))continue;let c=0;for(let k=0;k<len;k+=3)c=Math.max(c,Math.abs(Cs[(i0+k)%N]));if(c<bestC){bestC=c;bestI=i0}}
    if(bestI>=0&&bestC<0.0045)avoid.push([bestI,bestI+len])}
  /* about 3 simple tracks in 10 also get a spire */
  let fopt=null;if(!cx){const r2=rng((seed^0x5E1DE)>>>0),nv=r2()<0.45?0:r2()<0.65?1:2,sp1=rng((seed^0x5917E)>>>0)()<0.3;if(nv||sp1)fopt={r:r2,pool:[['sweep',2],['dive',1.2],['climb',1.6]],count:nv,avoid};if(sp1)fopt.extra=['spire']}
  else{const rt=rng((seed^0x7E3A5)>>>0),th=TTHEMES[Math.floor(rt()*TTHEMES.length)];fopt={r,lf:LN.f,pool:th.pool,count:14,dense:true,theme:th.n,avoid}}
  /* Custom tracks (the editor): exactly the features asked for, as many as fit. */
  /* (Prototype 63: a portal only in the Spirit realm; elsewhere its count is ignored) */
  if(sp)fopt=FKG.some(k=>sp.n[k]>0&&(k!=='portal'||bk==='S'))?{r,lf:LN.f,want:bk==='S'||!sp.n.portal?sp.n:{...sp.n,portal:0},avoid}:null;
  /* Prototype 60: codes from Prototype 60 on (v1) may have the new pieces */
  const v1=seed>=TV1;if(fopt&&v1){fopt.v1=true;if(seed>=TV2)fopt.v2=true}
  /* and a complex one may have a drop, a speed jump or a long jump, each on its own draw (14%, 15%, 12%); the long ones
     often don't fit (short tracks, other pieces in the way), so about 10%, 7% and 4% of new complex tracks have one */
  if(v1&&cx&&!sp&&fopt){const rn=rng((seed^0x60D0)>>>0),ex=[];if(rn()<0.14)ex.push('drop');if(rn()<0.15)ex.push('sjump');if(rn()<0.12)ex.push('cjump');if(ex.length)fopt.extra=ex}
  /* Prototype 63: about one Spirit track in four gets a portal jump (004s), drawn on its own numbers so the rest of the
     track is built as it would be without one; where no straight is long enough it is left out */
  if(bk==='S'&&!sp&&rng((seed^0x9047A1)>>>0)()<0.8){if(!fopt)fopt={r:rng((seed^0x9047A2)>>>0),pool:[['sweep',1]],count:0,avoid};fopt.extra=[...(fopt.extra||[]),'portal']}
  let dropped={};
  if(fopt){let best=null;const ban={};
    /* Try up to six layouts and keep the first with no faults (see trackFaults). If none is clean, leave out one of each
       kind of feature the remaining faults sit in and try again, until the road is clean; never keep a road that passes
       through itself (Prototype 31; before, the least bad layout was kept). */
    for(let att=0;att<16;att++){const o={...fopt,dropped:undefined};if(att>=4&&!o.want){o.pool=(o.pool||[]).filter(([k])=>k!=='helix'&&k!=='spire');if(!o.pool.length)delete o.pool;o.extra=null;o.count=o.count?Math.max(2,Math.round(o.count*0.65)):0}
      if(att>=6){if(o.want){o.want={...o.want};for(const k in ban)o.want[k]=Math.max(0,(o.want[k]||0)-ban[k])}
        else{o.pool=(o.pool||FPOOL).filter(([k])=>!ban[k]);o.extra=(o.extra||[]).filter(k=>!ban[k]);if(!o.pool.length||att>=14){o.pool=[['sweep',1]];o.count=0}}}
      const f=addFeatures({P,R,U,Tg,Cs,N,ds},att?rng((seed^Math.imul(0x9E3779B1,att))>>>0):fopt.r,W,o),fl=trackFaults(f,W),c=fl.length;
      if(!best||c<best.c){best={f,c,o,fl}}if(!c)break;
      if(att>=5){const seen=new Set();for(const x of fl)for(const k of x.in)if(!seen.has(k)){seen.add(k);ban[k]=(ban[k]||0)+1}if(!seen.size&&att>=6&&att<13)att=13}}
    const f=best.f;if(best.o.want)for(const k of FKG){const cut=(fopt.want[k]||0)-(best.o.want[k]||0);if(cut>0)best.o.dropped[k]=(best.o.dropped[k]||0)+cut}
    Object.assign(fopt,{dropped:best.o.dropped});dropped=fopt.dropped||{};({P,R,U,Tg,H,N,ds,L,kind,gap,feats,jumps}=f);drops=f.drops||[];brk=f.brk||null;port=f.port||null;Kg=f.K;Cs=new Float32Array(N);
    const K=Math.max(1,Math.round(30/ds));for(let i=0;i<N;i++){let s=0;for(let k=-K;k<=K;k++)s+=Kg[(i+k+N)%N];Cs[i]=s/(2*K+1)}}
  /* ---- splits: the road divides into a long route and a short one, then joins again ----
     The long route swings 70-140 m out to one side over a hill and carries two boost pads, an ammo strip and a shield
     strip; the short route stays on the line, narrower, through a chicane, with nothing to pick up. A split only goes on
     a gentle stretch with no other feature, clear of the rest of the track, and the road there is unbanked so both
     routes stay level. Everyone keeps the same distance along the track (u), so laps, positions and weapons work as
     usual; the long route is longer because you have to swing out and back. */
  /* the green repair strips run from gI0 to the line; every split, pit lane and cut ends (its exit run included) before
     gI0, so no route's walls stand in the strips and the strips' repair stays on the road you can see (Prototype 33) */
  const gI0=sp&&sp.quick?qkG0(sp.quick,N,ds):Math.floor(N*(0.8+rng((seed^0x6EE7)>>>0)()*0.1));
  const splits=[],spl=new Uint8Array(N),Y0=new THREE.Vector3(0,1,0);let splitDrop=0;
  {const want=splitWant,rv=rng((seed^0x5C0DE)>>>0);
   const busy=new Uint8Array(N);for(let i=0;i<N;i++)if(kind[i]||gap[i])busy[i]=1;
   for(const f of feats)for(let k=Math.floor(f.u0/ds);k<=Math.ceil(f.u1/ds);k++)busy[((k%N)+N)%N]=1;
   for(let q=0;q<want;q++){const Ls=splitLen[q],n=Math.round(Ls/ds),m=Math.round(90/ds),A=45+rs()*45+W*1.1,HL=7+rs()*9,HS=rs()<0.5?-(3+rs()*4):0,Aw=(6+rs()*5)*0.55,kw=rs()<0.5?2:3,wL=W*0.42,wS=Math.max(5.6,W*0.32),cross=!sp&&rv()<0.3,pref=rv()<0.5?1:-1,HX=11+rv()*3;
     let placed=false;const starts=[];for(let i=Math.floor(N*0.12);i+n+m<Math.floor(N*0.83);i+=Math.max(1,Math.round(25/ds)))starts.push(i);
     for(let t=starts.length-1;t>0;t--){const j=Math.floor(rs()*(t+1));[starts[t],starts[j]]=[starts[j],starts[t]]}
     for(const i0 of starts){if(placed)break;if(i0+n+m>gI0)continue;let ok=true;
       let cmax=0;for(let k=i0-m;k<=i0+n+m&&ok;k++){const kk=((k%N)+N)%N;if(busy[kk]||spl[kk]||Math.abs(Cs[kk])>0.0045)ok=false;cmax=Math.max(cmax,Math.abs(Cs[kk]))}
       if(!ok||A>0.45/Math.max(cmax,1e-4))continue;
       /* the long route goes to either side (the other if that side is blocked); a crossover swings out one side, passes
          over the short route on a bridge and comes back in on the other side */
       for(const side of[pref,-pref]){const B=[0,1].map(()=>({c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)})),lb=side>0?1:0,Lb=B[lb],Sb=B[1-lb];
         for(let k=0;k<=n;k++){const x=k/n,e=ss01(x/0.18)*ss01((1-x)/0.18),S2=Math.sin(Math.PI*x)**2;
           if(cross){const f=Math.sin(TAU*x)*Math.sin(Math.PI*x)/0.7698,co=Math.cos(Math.PI*x);Lb.c[k]=side*(W/4*co+A*0.5*f);Lb.w[k]=W/4+(wL-W/4)*e;Lb.h[k]=HX*Math.pow(S2,0.8);
             Sb.c[k]=-side*W/4*co+0.5*Aw*Math.sin(TAU*kw*x)*e*e;Sb.w[k]=W/4+(wS-W/4)*e;Sb.h[k]=HS*S2*0.5;continue}
           Lb.c[k]=side*(W/4+A*S2);Lb.w[k]=W/4+(wL-W/4)*e;Lb.h[k]=HL*Math.pow(S2,1.3);
           Sb.c[k]=-side*(W/4+3*e)+Aw*Math.sin(TAU*kw*x)*e*e;Sb.w[k]=W/4+(wS-W/4)*e;Sb.h[k]=HS*S2}
         let sep=true;for(let k=0;k<=n&&sep;k++){const d=cross?Math.abs(Lb.c[k]-Sb.c[k]):side*(Lb.c[k]-Sb.c[k]);if(d-(Lb.w[k]+Sb.w[k])<-0.01&&!(cross&&Lb.h[k]-Sb.h[k]>8.5))sep=false}if(!sep)continue;
         let clearOK=true;const pts=[];
         for(let k=0;k<=n&&clearOK;k+=Math.max(1,Math.round(12/ds))){const i=(i0+k)%N,rh=new THREE.Vector3().crossVectors(Tg[i],Y0).normalize(),q2=P[i].clone().addScaledVector(rh,Lb.c[k]).addScaledVector(Y0,Lb.h[k]);pts.push(q2);
           for(let j=0;j<N;j+=3){const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<n/2+2*m)continue;if(P[j].distanceToSquared(q2)<(W/2+Lb.w[k]+22)**2){clearOK=false;break}}}
         if(!clearOK)continue;
         for(const b of B){b.dc=new Float32Array(n+1);b.sl=new Float32Array(n+1);b.kv=new Float32Array(n+1);
           for(let k=0;k<=n;k++){const a=Math.max(0,k-1),c=Math.min(n,k+1);b.dc[k]=(b.c[c]-b.c[a])/((c-a)*ds);b.sl[k]=(b.h[c]-b.h[a])/((c-a)*ds)}
           for(let k=0;k<=n;k++){const a=Math.max(0,k-1),c=Math.min(n,k+1);b.kv[k]=(b.sl[c]-b.sl[a])/((c-a)*ds)}}
         Lb.long=true;Sb.long=false;splits.push({kind:'split',cross,i0,n,u0:i0*ds,u1:(i0+n)*ds,side,longB:lb,b:B,pts});for(let k=0;k<=n;k++)spl[(i0+k)%N]=splits.length;placed=true;break}}
     if(!placed)splitDrop++}
   /* Route helpers for the two kinds below: the heading and slope tables, and a check that a route stays clear of the rest of the track. */
   const finishB=B=>{for(const b of B){b.dc=new Float32Array(b.c.length);b.sl=new Float32Array(b.c.length);b.kv=new Float32Array(b.c.length);const n=b.c.length-1;
     for(let k=0;k<=n;k++){const a=Math.max(0,k-1),c=Math.min(n,k+1);b.dc[k]=(b.c[c]-b.c[a])/((c-a)*ds);b.sl[k]=(b.h[c]-b.h[a])/((c-a)*ds)}
     for(let k=0;k<=n;k++){const a=Math.max(0,k-1),c=Math.min(n,k+1);b.kv[k]=(b.sl[c]-b.sl[a])/((c-a)*ds)}
     if(b.g)for(let k=0;k<=n;k++)b.dc[k]*=b.g[k]}};
   const routePts=(i0,n,m,Bx)=>{const pts=[];for(let k=0;k<=n;k+=Math.max(1,Math.round(12/ds))){const i=(i0+k)%N,rh=new THREE.Vector3().crossVectors(Tg[i],Y0).normalize(),q2=P[i].clone().addScaledVector(rh,Bx.c[k]).addScaledVector(Y0,Bx.h[k]);pts.push(q2);
       for(let j=0;j<N;j+=3){const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<n/2+2*m)continue;if(P[j].distanceToSquared(q2)<(W/2+Bx.w[k]+22)**2)return null}}return pts};
   const freeRun=(a,b)=>{for(let k=a;k<=b;k++){const kk=((k%N)+N)%N;if(busy[kk]||spl[kk])return false}return true};
   const mark=(S0)=>{splits.push(S0);for(let k=0;k<=S0.n;k++)spl[(S0.i0+k)%N]=splits.length};
   /* Pit lane: on some long tracks (and a few medium ones), about halfway round. A narrow lane peels off one edge, runs
      beside the road behind its own wall, and rejoins. It repairs and rearms fast, but it has a limiter. */
   {const pitP=sp?0:LN.f>1.2?0.45:LN.f>0.95?0.15:0,wantPit=rv()<pitP,pitSide=rv()<0.5?1:-1;
    if(wantPit){const Ls=540*clamp(LN.f,0.9,1.3),n=Math.round(Ls/ds),m=Math.round(90/ds),wp=3.3,Dp=2*wp+7,starts=[];
      for(let i=Math.floor(N*0.15);i+n+m<Math.floor(N*0.88);i+=Math.max(1,Math.round(20/ds)))starts.push(i);
      starts.sort((a,b)=>Math.abs(a+n/2-N/2)-Math.abs(b+n/2-N/2));
      let placed=false;for(const i0 of starts){if(placed)break;if(i0+n+m>gI0||!freeRun(i0-m,i0+n+m))continue;let ok=true;for(let k=i0-m;k<=i0+n+m;k++)if(Math.abs(Cs[((k%N)+N)%N])>0.0045){ok=false;break}if(!ok)continue;
        for(const side of[pitSide,-pitSide]){const B=[0,1].map(()=>({c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)})),pb=side>0?1:0,Pb=B[pb],Mb=B[1-pb];
          /* the lane starts as the road's outer 6.6 m (painted off, open to the road), holds there a while, then moves out */
          for(let k=0;k<=n;k++){const x=k/n,e=ss01((x-0.1)/0.2)*ss01((0.9-x)/0.2);Pb.c[k]=side*(W/2-wp+Dp*e);Pb.w[k]=wp;
            const inner=side*Pb.c[k]-wp,lo=side>0?-W/2:-Math.min(W/2,inner),hi=side>0?Math.min(W/2,inner):W/2;Mb.c[k]=(lo+hi)/2;Mb.w[k]=(hi-lo)/2}
          const pts=routePts(i0,n,m,Pb);if(!pts)continue;finishB(B);Pb.long=true;Mb.long=false;
          mark({kind:'pit',i0,n,u0:i0*ds,u1:(i0+n)*ds,side,longB:pb,b:B,pts});placed=true;break}}}}
   /* Cut: on some tracks a long, wide bend (70-125 degrees) has a narrow lane leaving its inside edge on a sharp turn,
      running deep inside the bend on a tighter line and coming back alongside to rejoin. No sign and no pickups; you have to be
      hugging the inside wall to get in. It is shorter because it runs inside, so the distance it covers counts for more (g),
      and one boost pad halfway along pays you back for braking into it. */
   {const wantCut=!sp&&rv()<0.5,cr=rv();
    if(wantCut){const wc0=3.0,lane=W/2-wc0,m=Math.round(70/ds),step=Math.max(1,Math.round(15/ds)),cands=[];
      for(let i0=Math.floor(N*0.08);i0<Math.floor(N*0.88);i0+=step){const sg=Math.sign(Cs[i0]);if(!sg)continue;let th=0,k=0;
        for(;i0+k<N*0.92;k++){const kk=(i0+k)%N,c=Cs[kk];if(Math.sign(c)!==sg||Math.abs(c)<1/450||Math.abs(c)>1/120||busy[kk]||spl[kk])break;th+=Math.abs(c)*ds;if(th>=2.2)break}
        if(th>=1.2&&k*ds>=220&&k*ds<=700)cands.push({i0,n:k})}
      const rhA=i=>new THREE.Vector3().crossVectors(Tg[i],Y0).normalize();
      let placed=false;for(let t=0;t<cands.length&&!placed;t++){const{i0,n}=cands[Math.floor((cr*7919+t*0.618)%1*cands.length)];if(i0+n+m>gI0||!freeRun(i0-m,i0+n+m))continue;
        for(const sd of[1,-1]){if(placed)break;
          for(const fD of[0.18,0.14,0.1]){const D=fD*n*ds,ke=Math.round(40/ds),ke2=Math.round(55/ds),B=[0,1].map(()=>({c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)})),cb=sd>0?1:0,Cb=B[cb],Mb=B[1-cb];Cb.g=new Float32Array(n+1);
            /* the lane starts as the inside 6 m of the road (painted off, open to it), holds 25 m, then turns away sharply;
               it comes back alongside and runs into the inside of the road again before the end */
            const kh=Math.round(25/ds);
            for(let k=0;k<=n;k++){const x=k/n,b=ss01((k-kh)/ke)*ss01((n-k)/ke2),bp=x<0.5?Math.sin(Math.PI*x):Math.sin(Math.PI*x)**2;Cb.c[k]=sd*(lane+D*bp*b);Cb.w[k]=wc0+1.0*b;
              const lo=sd>0?-W/2:Math.max(-W/2,Cb.c[k]+Cb.w[k]),hi=sd>0?Math.min(W/2,Cb.c[k]-Cb.w[k]):W/2;Mb.c[k]=(lo+hi)/2;Mb.w[k]=(hi-lo)/2}
            let gs=0;for(let k=0;k<=n;k++){const j=(i0+Math.min(n,k+1))%N,jj=(i0+Math.max(0,k-1))%N,c=Cb.c[k],a=P[jj].clone().addScaledVector(rhA(jj),c),b2=P[j].clone().addScaledVector(rhA(j),c);
              Cb.g[k]=(Math.min(n,k+1)-Math.max(0,k-1))*ds/Math.max(1e-3,a.distanceTo(b2));gs+=Cb.g[k]}
            if(gs/(n+1)<1.02)break;            /* the outside of the bend: try the other side */
            if(Cb.g.some(g=>g>1.55))continue;  /* too deep for this bend: try shallower */
            const pts=routePts(i0,n,m,Cb);if(!pts)continue;finishB(B);Cb.long=true;Cb.cut=true;Mb.long=false;
            mark({kind:'cut',i0,n,u0:i0*ds,u1:(i0+n)*ds,side:sd,longB:cb,b:B,pts});placed=true;break}}}}}
   /* Prototype 60: the splits that belong to the new jumps, each where its jump puts it (they are on the jump's own
      stretch, which the splits above keep clear of):
      - after a drop, sometimes (tail split) an ordinary split straight after the last landing;
      - trunk: from the landing before the last drop to 200 m past it, the trunk is the road itself, dropping again (a jump
        only for frames on it), while the side road (the long route, with its pickups) swings 50-90 m out and comes down
        gently to join it at the lower level;
      - stack: the speed jump's two roads, one over the other from the landing: the upper road (hu over the lower) holds its
        height, swings out to one side and comes down to join the lower one, which is wider at first to catch the rest;
      - catch: the long jump's landing, one road half as wide again as the track for 300 m, narrowing back.
      Each is checked clear of the rest of the track (routePts) and left out if it isn't: the jump then lands on the road. */
   for(const f of feats){if(f.kind!=='drop'&&f.kind!=='sjump'&&f.kind!=='cjump'&&f.kind!=='portal')continue;const js=jumps.filter(j=>j.kind===f.kind&&j.u0>=f.u0&&j.u0<=f.u1).sort((a,b)=>a.u0-b.u0);if(!js.length)continue;
     const rf=rng((seed^0x60E1^Math.round(f.u0))>>>0),m=Math.round(90/ds),B2=n=>[0,1].map(()=>({c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)})),inGI=(i0,n)=>i0+n+Math.round(20/ds)<gI0;
     if(f.kind==='drop'&&f.tail==='split'){const jl=js[js.length-1],i0=Math.round((jl.u1+15)/ds),n=Math.round(f.Ls/ds);if(!inGI(i0,n))continue;
       const A=45+rf()*45+W*1.1,HL=7+rf()*9,HS=rf()<0.5?-(3+rf()*4):0,Aw=(6+rf()*5)*0.55,kw=rf()<0.5?2:3,wL=W*0.42,wS=Math.max(5.6,W*0.32),pref=rf()<0.5?1:-1;
       for(const side of[pref,-pref]){const B=B2(n),lb=side>0?1:0,Lb=B[lb],Sb=B[1-lb];
         for(let k=0;k<=n;k++){const x=k/n,e=ss01(x/0.18)*ss01((1-x)/0.18),S2=Math.sin(Math.PI*x)**2;Lb.c[k]=side*(W/4+A*S2);Lb.w[k]=W/4+(wL-W/4)*e;Lb.h[k]=HL*Math.pow(S2,1.3);
           Sb.c[k]=-side*(W/4+3*e)+Aw*Math.sin(TAU*kw*x)*e*e;Sb.w[k]=W/4+(wS-W/4)*e;Sb.h[k]=HS*S2}
         const pts=routePts(i0,n,m,Lb);if(!pts)continue;finishB(B);Lb.long=true;Sb.long=false;mark({kind:'split',cross:false,i0,n,u0:i0*ds,u1:(i0+n)*ds,side,longB:lb,b:B,pts,feat:1});break}}
     else if(f.kind==='drop'&&f.tail==='trunk'&&js.length>=2){const jA=js[js.length-2],jB=js[js.length-1],i0=Math.round((jA.u1+15)/ds),n=Math.round((jB.u1+200)/ds)-i0;if(!inGI(i0,n))continue;
       const A=50+rf()*40+W*1.1,wL=W*0.42,pref=rf()<0.5?1:-1;
       for(const side of[pref,-pref]){const B=B2(n),lb=side>0?1:0,Lb=B[lb],Tb=B[1-lb];Tb.gp=new Uint8Array(n+1);
         for(let k=0;k<=n;k++){const x=k/n,e=ss01(x/0.18)*ss01((1-x)/0.18),S2=Math.sin(Math.PI*x)**2,u=(i0+k)*ds,yo=u<jB.u0?jB.lipH:u>=jB.u1?0:jC(jB,(u-jB.u0)/jB.G);
           Tb.c[k]=-side*W/4*(1-e);Tb.w[k]=W/4+W/4*e;Tb.h[k]=0;if(gap[(i0+k)%N])Tb.gp[k]=1;
           Lb.c[k]=side*(W/4+A*S2);Lb.w[k]=W/4+(wL-W/4)*e;Lb.h[k]=jB.lipH*(1-ss01(x))-yo}
         const pts=routePts(i0,n,m,Lb);if(!pts)continue;finishB(B);Lb.long=true;Tb.long=false;const S0={kind:'dsplit',i0,n,u0:i0*ds,u1:(i0+n)*ds,side,longB:lb,tb:1-lb,b:B,pts,feat:1};mark(S0);jB.sp=S0;jB.b=1-lb;break}}
     else if(f.kind==='sjump'){/* the upper road where a frame leaving the lip at 172 m/s gets to, over the gap as built (0.3 m lower for the step of a 60 Hz frame) */
       const j=js[0],i0=Math.round(j.u1/ds),n=Math.round(f.Ls/ds),Hu=flyY(172,j.G,j.lipH,j.slope,32)-0.3;if(!inGI(i0,n))continue;
       const A=W+14+rf()*20,Ad=6+rf()*6,pref=rf()<0.5?1:-1,bonus=f.bonus;
       for(const side of[pref,-pref]){const B=B2(n),ub=side>0?1:0,Ub=B[ub],Db=B[1-ub];
         for(let k=0;k<=n;k++){const x=k/n,a1=ss01((x-0.1)/0.22)*ss01((0.97-x)/0.22),q=ss01((x-0.6)/0.3);
           Ub.c[k]=side*(W/4*q+A*a1);Ub.w[k]=W/2-W/4*q;Ub.h[k]=Hu*(1-ss01((x-0.3)/0.45));
           Db.c[k]=-side*(W/4*q+Ad*a1);Db.w[k]=W*0.56-(W*0.56-W/4)*q;Db.h[k]=0}
         let sep=true;for(let k=0;k<=n&&sep;k++){const d=side*(Ub.c[k]-Db.c[k]);if(d-(Ub.w[k]+Db.w[k])<-0.01&&Ub.h[k]-Db.h[k]<8.5)sep=false}if(!sep)continue;
         const pts=routePts(i0,n,m,Ub);if(!pts)continue;finishB(B);const lb=bonus==='up'?ub:1-ub;Ub.long=lb===ub;Db.long=!Ub.long;
         const S0={kind:'stack',i0,n,u0:i0*ds,u1:(i0+n)*ds,side,longB:lb,upB:ub,lowB:1-ub,bonus,b:B,pts,feat:1};mark(S0);j.stk=S0;j.hu=Hu;break}}
     else if(f.kind==='cjump'||f.kind==='portal'){/* (Prototype 63: and a portal jump's catch road, the same shape) */const j=js[0],i0=Math.round(j.u1/ds),n=Math.round(f.Lc/ds);if(!inGI(i0,n))continue;
       const B=[{c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)}];for(let k=0;k<=n;k++){const x=k/n;B[0].w[k]=W/2*(1.55-0.55*ss01((x-0.5)/0.42))}
       finishB(B);B[0].long=false;const pts=[];for(let k=0;k<=n;k+=Math.max(1,Math.round(12/ds)))pts.push(P[(i0+k)%N].clone());mark({kind:'catch',i0,n,u0:i0*ds,u1:(i0+n)*ds,side:1,longB:0,b:B,pts,feat:1});j.ctch=1}}
   /* Prototype 63: the Spirit realm's underside (004t): a split whose second route rolls under the road; about one Spirit
      track in five (or the editor's count), drawn on its own numbers, so the rest of the track is built as without it */
   {const fw=bk==='S'?(sp?Math.min(1,sp.n.flip||0):rng((seed^0xF11B4)>>>0)()<FLIP_O.P?1:0):0;
    if(fw&&!flipPlace({seed,N,ds,P,Tg,Cs,busy,spl,splits,gI0,mark,finishB,W,want:fw})&&sp)dropped.flip=(dropped.flip||0)+1}
   for(const S0 of splits){if(S0.b.length!==2)continue;const[A0,A1]=S0.b,adj=new Uint8Array(S0.n+1);let any=0;
     for(let k=0;k<=S0.n;k++){const l=A0.c[k]<A1.c[k]?A0:A1,r2=l===A0?A1:A0,g=(r2.c[k]-r2.w[k])-(l.c[k]+l.w[k]);if(g<1.2&&g>-0.5&&Math.abs(A0.h[k]-A1.h[k])<1){adj[k]=1;any=1}}
     if(any)S0.adj=adj}
   for(const S0 of splits){const e0=S0.i0-Math.round(120/ds),e1=S0.i0+S0.n+Math.round(120/ds),ramp=Math.round(100/ds);
     for(let k=e0;k<=e1;k++){const i=((k%N)+N)%N,w=ss01(Math.min(k-e0,e1-k)/ramp),t=Tg[i],uf=Y0.clone().addScaledVector(t,-Y0.dot(t)).normalize();
       U[i]=U[i].clone().multiplyScalar(1-w).addScaledVector(uf,w).normalize();R[i]=new THREE.Vector3().crossVectors(t,U[i]).normalize()}
     if(fopt)for(let k=e0;k<=e1;k++){const i=((k%N)+N)%N,d=new THREE.Vector3().subVectors(Tg[(i+1)%N],Tg[(i-1+N)%N]).divideScalar(2*ds);Kg[i]=-d.dot(R[i])}
     if(!S0.feat||S0.kind==='split')feats.push({kind:'split',u0:S0.u0,u1:S0.u1});else if(S0.kind==='flip')feats.push({kind:'flip',u0:S0.u0,u1:S0.u1})}
   if(fopt&&splits.length){const K=Math.max(1,Math.round(30/ds));for(let i=0;i<N;i++){let a=0;for(let k=-K;k<=K;k++)a+=Kg[(i+k+N)%N];Cs[i]=a/(2*K+1)}}
   if(sp&&splitDrop)dropped.split=(dropped.split||0)+splitDrop}
  const Kn=new Float32Array(N);{const raw=new Float32Array(N),d=new THREE.Vector3();for(let i=0;i<N;i++){d.subVectors(Tg[(i+1)%N],Tg[(i-1+N)%N]).divideScalar(2*ds);raw[i]=d.dot(U[i])}
    if(port)for(const o of port){raw[o.k]=raw[(o.k-1+N)%N];raw[(o.k+1)%N]=raw[(o.k+2)%N]}
    for(let i=0;i<N;i++){let a=0;for(let k=-3;k<=3;k++)a+=raw[(i+k+N)%N];Kn[i]=a/7}}
  flipFinish(splits,Kg,Kn,N,ds);/* (Prototype 63: the underside's press and turn in its own frame) */
  let corners=0;{let inC=false;for(let i=0;i<N;i++){const c=Math.abs(Cs[i])>1/180&&!kind[i];if(c&&!inC)corners++;inC=c}}
  return{D,LN,L,N,ds,P,R,U,Tg,H,Cs,Kg,Kn,kind,gap,feats,jumps,drops,splits,spl,fig8,fopt,dropped,minR,corners,gI0,r,seed,wk,cx,lk,sp,brk,port}}
/* Contiguous index runs that are not jump gaps (the last run wraps past the start line). */
/* What a road must never have (Prototype 31): two parts of the lap passing through each other or nearly touching (closer than
   a road width side by side and under 9.5 m apart in height at the edges, spirals and spires included), a kink (the direction turning more
   than 30 degrees in 12 m or 55 in 30 m), or a slope steeper than 42 degrees. Loops, corkscrews and twists keep their own
   shape, and so does a spire's drop. Each fault lists the features it sits in, so they can be left out. */
function trackFaults(f,W){const{P,R,Tg,feats,N,ds,gap}=f,own=feats.filter(x=>x.kind==='loop'||x.kind==='corkscrew'||x.kind==='twist'),out=[],seen=new Set();
  const inF=u=>feats.filter(x=>u>=x.u0-60&&u<=x.u1+60).map(x=>x.src||x.kind);
  const mine=(a,b)=>own.some(x=>{const x0=x.u0-60,x1=x.u1+(x.kind==='loop'?160:60);return a>=x0&&a<=x1&&b>=x0&&b<=x1});
  const add=(k,u,u2)=>{const key=k+Math.round(u/40)+':'+Math.round((u2||0)/40);if(seen.has(key))return;seen.add(key);out.push({k,u,in:u2==null?inF(u):[...inF(u),...inF(u2)]})};
  const g=new Map(),cs=24,key=(x,z)=>(x*73856093)^(z*19349663),w2=(W+4)**2,sep=Math.ceil(80/ds);
  for(let i=0;i<N;i+=2){if(gap[i])continue;const p=P[i],k=key(Math.floor(p.x/cs),Math.floor(p.z/cs));let a=g.get(k);if(!a)g.set(k,a=[]);a.push(i)}
  for(let i=0;i<N;i+=2){if(gap[i])continue;const p=P[i],cx=Math.floor(p.x/cs),cz=Math.floor(p.z/cs);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=g.get(key(cx+dx,cz+dz));if(!a)continue;
      for(const j of a){const dj=j-i;if(dj<sep||N-dj<sep)continue;const q=P[j],ex=p.x-q.x,ez=p.z-q.z;if(ex*ex+ez*ez<w2&&Math.abs(p.y-q.y)-(Math.abs(R[i].y)+Math.abs(R[j].y))*W/2<9.5&&!mine(i*ds,j*ds))add('clash',i*ds,j*ds)}}}
  const skip=new Uint8Array(N);for(const x of own)for(let k=Math.floor((x.u0+10)/ds);k<=Math.ceil((x.u1-10)/ds);k++)skip[((k%N)+N)%N]=1;
  for(const d of f.drops||[])for(let k=Math.floor(d.u0/ds)-2;k<=Math.ceil(d.u1/ds)+2;k++)skip[((k%N)+N)%N]=1;
  /* (Prototype 63: a portal's break turns the road at once: no kink to find there) */
  for(const o of f.port||[])for(let k=o.k-Math.ceil(32/ds);k<=o.k+Math.ceil(32/ds);k++)skip[((k%N)+N)%N]=1;
  const k6=Math.max(1,Math.round(6/ds)),k15=Math.max(1,Math.round(15/ds)),ang=(a,b)=>Math.acos(clamp(a.dot(b),-1,1));
  for(let i=0;i<N;i++){if(skip[i]||gap[i]||gap[(i+k15)%N]||gap[(i-k15+N)%N])continue;
    if(ang(Tg[(i-k6+N)%N],Tg[(i+k6)%N])>0.52||ang(Tg[(i-k15+N)%N],Tg[(i+k15)%N])>0.96)add('kink',i*ds);
    else if(Math.abs(Tg[i].y)>0.67)add('steep',i*ds)}
  return out}
const FPOOL=[['sweep',3.5],['loop',2],['jump',2],['twist',1.4],['corkscrew',1.4],['dive',1.5],['climb',1.4],['helix',0.8]];
const TTHEMES=[
  {n:'Stunt',pool:[['loop',3],['jump',3],['twist',2],['corkscrew',2]]},
  {n:'Coaster',pool:[['sweep',1.5],['dive',1.5],['climb',1.5],['corkscrew',2],['loop',1.2],['helix',1.6],['spire',1.2]]},
  {n:'Air',pool:[['jump',3],['sweep',1.6],['climb',1.2],['loop',1],['dive',1]]},
  {n:'Roll',pool:[['twist',3],['corkscrew',3],['helix',1.4],['loop',1.2],['jump',1]]},
  {n:'Mixed',pool:[['sweep',1.2],['loop',2],['jump',2],['twist',1.4],['corkscrew',1.4],['dive',1],['climb',1],['helix',1],['spire',0.8]]}];
function runsOf(gap,N){const gs=[];let i=0;while(i<N){if(gap[i]){let j=i;while(j<N&&gap[j])j++;gs.push([i,j]);i=j}else i++}
  if(!gs.length)return[[0,N]];const out=[];for(let k=0;k<gs.length;k++){const a=gs[k][1],b=k+1<gs.length?gs[k+1][0]:gs[0][0]+N;if(b>a)out.push([a,b])}return out}
const ss01=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
/* Height of the (invisible) centreline over a jump gap: leaves the 1.2 m lip at the ramp's 0.1 slope, lands flat at road level. */
const gapC=(t,G)=>t<=0?1.2:t>=1?0:1.2*(2*t*t*t-3*t*t+1)+0.1*G*(t*t*t-2*t*t+t);
/* Prototype 60: the same for the new jumps (drops, speed jumps, long jumps), whose lip stands J.lipH over the landing and
   leaves at J.slope; jCd is its slope (rise per metre). */
const jC=(J,t)=>t<=0?J.lipH:t>=1?0:J.lipH*(2*t*t*t-3*t*t+1)+J.slope*J.G*(t*t*t-2*t*t+t);
const jCd=(J,t)=>t<=0||t>=1?0:(J.lipH*(6*t*t-6*t)+J.slope*J.G*(3*t*t-4*t+1))/J.G;
/* the road length a metre over the ground covers there, so a frame crosses a new jump's gap at its own speed over the ground */
const jArc=(J,u)=>{const x=((u-J.u0)%T.L+T.L)%T.L;if(x>=J.G)return 1;const d=jCd(J,x/J.G);return Math.sqrt(1+d*d)};
/* Prototype 60: how high a frame leaving a lip lipH up at slope s and speed v is when it has flown G metres, falling at g
   with the air's drag (10% of the speed a second: 5%, and 5% more with the nose half up): sizes the speed jump's upper road. */
const flyY=(v,G,lipH,s,g)=>{let x=0,y=lipH,vy=v*s,vx=v;const dt=1/240;while(x<G){vy-=g*dt;y+=vy*dt;x+=vx*dt;vx-=vx*0.1*dt}return y};
