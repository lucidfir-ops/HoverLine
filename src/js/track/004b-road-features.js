//# track/004b-road-features.js: addFeatures, the 3D features put into the base loop (loops, jumps, twists, corkscrews, helices, spires, drops, speed and long jumps)
/* Complex tracks: insert 3D features into the base loop, then resample to even spacing and rebuild the frames.
   Each output sample carries a position and a designed "up"; the tangent comes from the positions, so loops,
   corkscrews and rolls get exact frames. K is the curvature within the road surface, which steers the physics. */
function addFeatures(b,r,W,opt={}){
  const{P,R,U,Tg,Cs,N,ds}=b;const V=THREE.Vector3;
  const jumpG=45+0.6*W,lr=24,rc=10+0.15*W;
  /* Rises and drops move the road straight up and down (world up, not the banked or tilted "up"), so banking in a corner
     can't kink the road sideways and a lift on a slope can't push it back along itself. */
  const Y1=new V(0,1,0),RH=i=>new V().crossVectors(Tg[i],Y1).normalize();
  /* Not every track gets everything: 2-5 features drawn from a weighted pool. Sweeps (long rolling rises and drops) are the
     most common, because their crests are where nose-down vs nose-up matters most. */
  const POOL=opt.pool||FPOOL,tw=POOL.reduce((a,p)=>a+p[1],0);
  const pickW=()=>{let t=r()*tw;for(const[k,w]of POOL)if((t-=w)<0)return k;return'sweep'};
  /* Prototype 60: the new jumps, as a height profile over the base line (prof: segments of length L, height f(x) over the
     line, gap on the ones the road leaves out), so each lands back on the line at its foot.
     drop: the road climbs gently (a tenth at most), runs level, ends, and a road 10-17 m lower carries on 40-55 m further
       on. About one in five is two or three drops in a row; three in ten split right after the last drop; and some (trunk)
       split between the last two drops, the trunk dropping again while the side road winds round to join it lower down.
     sjump: a speed jump. A long run-up, a ramp up 9 m to a 0.15 lip, a 148 m gap, then two roads: the upper one 20 m up,
       where a frame leaving the lip at 172 m/s arrives (at full speed: the top frames boosting; from about 160 it scrapes up onto
       it; the nose doesn't float you on this jump, so it is speed that counts), and the lower one under it, which catches the rest from 81 m/s up. Which holds the bonus (two boost pads and an
       ammo strip) is a coin toss.
     cjump: a long jump. The road climbs 30-45 m, a 3 m ramp throws you over a 130-170 m gap (as built: the straightened road is a little shorter) to a road far below that is
       half as wide again as the track for its first 300 m, so a frame from 85 m/s up lands on it; at racing speed it flies
       250-480 m, 2-2.5 s in the air. */
  const jumpProf=(s,kd)=>{const seg=[],flat=(L,y)=>seg.push({L,y1:y,f:()=>y}),rise=(L,y0,y1)=>seg.push({L,y1,f:x=>y0+(y1-y0)*(1-Math.cos(Math.PI*x/L))/2}),
      ramp=(L,y0,Hr)=>seg.push({L,y1:y0+Hr,f:x=>y0+Hr*(x/L)**2}),gapS=(G,y0,y1,slope,jk)=>{const J={lipH:y0-y1,slope,G,kind:jk};seg.push({L:G,y1,gap:J,f:x=>y1+jC(J,x/G)})};
    if(kd==='drop'){const nd0=opt.want?(r()<0.3?2:1):r()<0.22?(r()<0.45?3:2):1,tail=r()<0.3?'split':r()<0.35?'trunk':null,nd=tail==='trunk'?Math.max(2,nd0):nd0,Dh=10+r()*7,H=nd*Dh;
      s.nd=nd;s.tail=tail;s.Ls=tail==='split'?520+r()*160:0;rise(Math.max(240,H*10),0,H);flat(50,H);
      for(let k=0;k<nd;k++){const y0=H-k*Dh,y1=y0-Dh;gapS(40+r()*15,y0,y1,0,'drop');if(k<nd-1)flat(tail==='trunk'&&k===nd-2?330:130+r()*40,y1)}
      flat(tail==='split'?s.Ls+90:tail==='trunk'?230:320,0)}
    else if(kd==='sjump'){const Hl=9,sl=0.15,G=148;s.hu=flyY(172,G,Hl,sl,32);s.Ls=560+r()*120;s.bonus=r()<0.5?'up':'down';
      flat(640+r()*160,0);ramp(2*Hl/sl,0,Hl);gapS(G,Hl,0,sl,'sjump');flat(s.Ls+80,0)}
    else{const sl=0.12,Hr=3,G=140+r()*30,Hp=Math.max(22,Math.ceil(32*G*G/(2*85*85)-sl*G)-Hr+2);s.Lc=560;
      rise(Math.max(300,Hp*10),0,Hp);flat(40,Hp);ramp(2*Hr/sl,Hp,Hr);gapS(G,Hp+Hr,0,sl,'cjump');flat(s.Lc+60,0)}
    s.prof=seg;s.len=seg.reduce((a,q)=>a+q.L,0)};
  /* Prototype 60: a rising spire (vspire) is a spire run backwards and a down spiral (dhelix) a spiral that falls; each is
     built as its base kind (KB) with a flag, rev or a negative Hh. */
  const mkSite=k0=>{const kd=KB(k0),s={kind:k0};
    if(kd==='sweep'){s.lam=460+r()*140;s.n=2+Math.floor(r()*2);s.sg=[1];for(let k=1;k<s.n;k++)s.sg.push(r()<0.5?-1:1);s.amp=s.sg.map(()=>(20+r()*10)*(0.85+0.3*r()));s.len=s.n*s.lam}
    else if(kd==='dive'){s.D=40+r()*20;s.len=600+r()*200}
    else if(kd==='climb'){s.Hh=45+r()*40;s.Lr=Math.max(150+r()*60,s.Hh*2.6);s.Lp=120+r()*200;s.sg=1;s.len=2*s.Lr+s.Lp}
    else if(kd==='helix'){s.Rh=175+r()*55;s.Hh=17+r()*9;s.dir=r()<0.5?-1:1;s.len=0}
    /* spire: out to one side, one and a half turns up round a ring, a half turn in to the middle, then over the edge and
       straight down the middle, pulling out underneath the ring and back onto the line */
    else if(kd==='spire'){s.Rs=clamp(104+W*1.4,120,145);s.Hs=122+r()*22;s.dpt=34;s.dir=r()<0.5?-1:1;s.Lc=2.45*s.Rs;s.len=0}
    else if(kd==='drop'||kd==='sjump'||kd==='cjump')jumpProf(s,kd);
    /* Prototype 63: the Spirit realm's portal jump (004s) */
    else if(kd==='portal')portalSite(s,r);
    else s.len={loop:0,twist:200,corkscrew:240,jump:lr+jumpG+12}[kd];
    if(kd==='sweep'&&opt.dense&&s.n>1){s.n=1;s.sg=[1];s.amp=[s.amp[0]];s.len=s.lam}
    if(kd!=='portal')s.foot=(kd==='loop'?260:kd==='helix'?520:kd==='spire'?s.Lc+s.Rs+170:s.len)+40;if(s.prof)s.foot=s.len+60;
    if(k0==='vspire')s.rev=1;if(k0==='dhelix')s.Hh=-s.Hh;
    /* on a new code, a spire rises up the middle and spirals down half the time, and a spiral falls instead of rising (a fifth of the draws; the falling ones fit more often, so about half the spirals on new tracks fall) */
    if(opt.v1&&!opt.want&&k0==='spire'&&r()<0.5)s.rev=1;if(opt.v1&&!opt.want&&k0==='helix'&&r()<0.2)s.Hh=-s.Hh;
    if(k0!==kd)s.src=k0;
    return s};
  const mkFoot=kd=>({sweep:1100,dive:740,climb:640,loop:300,twist:240,corkscrew:280,jump:140,helix:560,spire:700,vspire:700,dhelix:560,drop:900,sjump:1700,cjump:1300,portal:1720})[kd]||200;
  /* The spire's road, from O heading F: ease out to the side and onto the ring, one and a half turns up round it, a half
     turn in to the middle at the top, over the edge, straight down the middle and out underneath the ring. pts and ups
     are the samples; d0 is where the drop (the mag-lock) starts; q the end, heading Fh. (Prototype 60: a function, so the
     rising spire can run it backwards; the spire itself is built exactly as before.) */
  const spireGeo=(O,F,site,sl0,u0s)=>{const pts=[],ups=[],emit=(p,u)=>{pts.push(p);ups.push(u)};
        const{Rs,Hs,dpt,dir,Lc}=site,Y=new V(0,1,0),Fh=new V(F.x,0,F.z).normalize(),Lv=new V().crossVectors(Fh,Y).normalize().multiplyScalar(dir),C0=O.clone().addScaledVector(Fh,Lc),rho=Rs/2,top=O.y+Hs,bk=0.28;
        const tilt=(p,c,b)=>{const inw=c.clone().sub(p);inw.y=0;inw.normalize();return Y.clone().multiplyScalar(Math.cos(b)).addScaledVector(inw,Math.sin(b)).normalize()};
        /* ease out to the side and onto the ring */
        const nS=Math.ceil(Lc/ds);for(let k=0;k<nS;k++){const x=k/nS;emit(O.clone().addScaledVector(Fh,Lc*x).addScaledVector(Lv,Rs*ss01(x)).addScaledVector(Y,sl0*Lc*x*(1-x)*(1-x)),u0s?u0s.clone().lerp(Y,ss01(Math.min(1,Lc*x/60))).normalize():Y.clone())}
        /* one and a half turns up, banked in */
        const TH=3*Math.PI,nR=Math.ceil(TH*Rs/ds);
        for(let k=0;k<nR;k++){const x=k/nR,th=TH*x,p=C0.clone().addScaledVector(Fh,Rs*Math.sin(th)).addScaledVector(Lv,Rs*Math.cos(th));p.y=O.y+Hs*ss01(x);emit(p,tilt(p,C0,bk*ss01(Math.min(1,x*8))))}
        /* a half turn in to the middle at the top */
        const Tc=C0.clone().addScaledVector(Lv,-Rs/2),nT=Math.ceil(Math.PI*rho/ds);
        for(let k=0;k<nT;k++){const x=k/nT,ph=Math.PI*x,p=Tc.clone().addScaledVector(Lv,-rho*Math.cos(ph)).addScaledVector(Fh,-rho*Math.sin(ph));p.y=top;emit(p,tilt(p,Tc,(bk+(1.0-bk)*ss01(Math.min(1,x*5)))*ss01(Math.min(1,(1-x)*6.5))))}
        /* over the edge, straight down the middle, and out underneath the ring (both bends ease in and out) */
        const Lp=80,nP=Math.ceil(Lp/ds),Lq=110,nQ=Math.ceil(Lq/ds);let h1=0,v1=0,v2=0;
        for(let k=0;k<nP;k++){const a=Math.PI/2*ss01(k/nP);h1+=Math.cos(a)*Lp/nP;v1+=Math.sin(a)*Lp/nP}
        for(let k=0;k<nQ;k++){const a=Math.PI/2*ss01(k/nQ);v2+=Math.cos(a)*Lq/nQ}
        const Ls=Math.max(8,0.42*Rs-h1),q=C0.clone();q.y=top;
        for(let s2=0;s2<Ls;s2+=ds){emit(q.clone(),Y.clone());q.addScaledVector(Fh,ds)}
        const d0=pts.length;
        for(let k=0;k<nP;k++){const a=Math.PI/2*ss01(k/nP);emit(q.clone(),Y.clone().multiplyScalar(Math.cos(a)).addScaledVector(Fh,Math.sin(a)));q.addScaledVector(Fh,Math.cos(a)*Lp/nP).addScaledVector(Y,-Math.sin(a)*Lp/nP)}
        const ax=q.clone(),bot=O.y-dpt;
        while(q.y-ds>bot+v2){emit(q.clone(),Fh.clone());q.y-=ds}
        const d1=pts.length;
        for(let k=0;k<nQ;k++){const a=Math.PI/2*ss01(k/nQ);emit(q.clone(),Fh.clone().multiplyScalar(Math.cos(a)).addScaledVector(Y,Math.sin(a)));q.addScaledVector(Y,-Math.cos(a)*Lq/nQ).addScaledVector(Fh,Math.sin(a)*Lq/nQ)}
        return{pts,ups,d0,d1,q,Fh,data:{c:[C0.x,C0.z],ax:[ax.x,ax.z],fh:[Fh.x,Fh.z],top,bot,Rs,v1,v2}}};
  /* Prototype 60: the rising spire from O heading F: a spire's road built heading the other way and laid end first at O,
     so it comes in underneath the ring, goes up the middle and spirals down round the ring, ending on the line about
     460 m on, 34 m up. Its first 60 m bend from the road's own slope (sl0) and bank (u0s) into the spire's. nMag: the
     samples from the foot to 20 m past the top edge, the mag-lock. */
  const revSpire=(O,F,site,sl0,u0s)=>{const Fb=F.clone().negate(),g=spireGeo(O,Fb,site,0,null),sh=O.clone().sub(g.q),M=g.pts.length,pts=[],ups=[],Lb=60;let sa=0,prev=O;
    for(let k=0;k<M;k++){const j=M-1-k,p=g.pts[j].clone().add(sh);sa+=p.distanceTo(prev);prev=p;
      if(sa<Lb)p.y+=sl0*sa*(1-sa/Lb)*(1-sa/Lb);const u=g.ups[j].clone();pts.push(p);ups.push(u0s&&sa<60?u0s.clone().lerp(u,ss01(sa/60)).normalize():u)}
    const Fh=new V(F.x,0,F.z).normalize(),q=pts[M-1].clone().addScaledVector(Fh,ds),D=g.data,mv=(a)=>[a[0]+sh.x,a[1]+sh.z];
    return{pts,ups,q,Fh,nMag:Math.min(M,M-g.d0+Math.round(20/ds)),data:{c:mv(D.c),ax:mv(D.ax),fh:D.fh,top:D.top+sh.y,bot:D.bot+sh.y,Rs:D.Rs,v1:D.v1,v2:D.v2,rev:1}}};
  const avoidN=(opt.avoid||[]).reduce((a,[x,y])=>a+(y-x),0)*ds;
  const usable=(0.82-0.08)*N*ds-avoidN,count=opt.count!=null?opt.count:2+Math.floor(r()*((opt.lf||1)>1.2?5:4)),sites=[],cap=opt.dense?{sweep:1,dive:1,loop:3,jump:3,twist:3,corkscrew:3,climb:1,helix:1,spire:1}:{sweep:2,dive:1,loop:2,jump:2,twist:2,corkscrew:2,climb:1,helix:1,spire:1};let used=0;
  if(opt.want){/* the editor's counts: shorten the long features first, then drop from whichever kind there is most of */
    for(const k of FKG)for(let c=0;c<(opt.want[k]||0);c++)sites.push(mkSite(k));
    const room=usable*0.86,tot=()=>sites.reduce((a,x)=>a+x.foot,0);
    for(const x of sites){if(tot()<=room)break;if(x.kind==='sweep'&&x.n>1){x.n=1;x.sg=[1];x.amp=[x.amp[0]];x.len=x.lam;x.foot=x.len+40}}
    for(const x of sites){if(tot()<=room)break;if(x.kind==='dive'){x.len=520;x.foot=560}else if(x.kind==='climb'){x.Lr=Math.min(x.Lr,Math.max(130,x.Hh*2.6));x.Lp=Math.min(x.Lp,100);x.len=2*x.Lr+x.Lp;x.foot=x.len+40}}
    const dropped={};while(sites.length&&tot()>room){const cnt={};for(const x of sites)cnt[x.kind]=(cnt[x.kind]||0)+1;
      const big=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]||mkFoot(b)-mkFoot(a))[0],j=sites.map(x=>x.kind).lastIndexOf(big);sites.splice(j,1);dropped[big]=(dropped[big]||0)+1}
    opt.dropped=dropped;used=tot()}
  else{if(opt.extra)for(const k of opt.extra){const st=mkSite(k);if(used+st.foot<=usable*0.85){sites.push(st);used+=st.foot}}
   const tgt=count+sites.length;for(let t=0;t<80&&sites.length<tgt;t++){const kd=pickW();if(sites.filter(x=>x.kind===kd).length>=cap[kd])continue;const st=mkSite(kd);if(used+st.foot>usable*(opt.dense?0.9:0.8))continue;sites.push(st);used+=st.foot}}
  for(let i=sites.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[sites[i],sites[j]]=[sites[j],sites[i]]}
  {const free=usable-used,wts=sites.map(()=>0.3+r()),ws=wts.reduce((a,b)=>a+b,0)||1;let cur=0.08*N*ds;
   for(let k=0;k<sites.length;k++){const st=sites[k],gap=free*wts[k]/ws,straight=st.kind!=='sweep'&&st.kind!=='dive'&&st.kind!=='climb';let best=cur+gap*r(),bs=1e9;
     if(straight)for(let t=0;t<24;t++){const at=cur+gap*r(),i0=Math.floor(at/ds);let m=0;for(let j=0;j<Math.ceil((st.cf||st.foot)/ds);j+=3)m=Math.max(m,Math.abs(Cs[(i0+j)%N]));if(m<bs){bs=m;best=at}}
     st.i=Math.floor(best/ds);
     /* keep clear of the figure-eight crossing: push the feature past it */
     for(const[a,b]of opt.avoid||[]){const e=st.i+Math.ceil(st.foot/ds);if(e>a&&st.i<b)st.i=b+1}
     cur=Math.max(cur+gap+st.foot,(st.i)*ds+st.foot)}}
  /* a spiral swings a full circle out to one side: try the other side if the first would run into the track */
  for(const st of sites)if(KB(st.kind)==='helix'){const O=P[st.i%N],F=Tg[st.i%N],Fh=new V(F.x,0,F.z).normalize(),Rx=new V().crossVectors(Fh,new V(0,1,0)).normalize();
    const hits=d=>{const C0=O.clone().addScaledVector(Rx,d*st.Rh);for(let k=0;k<24;k++){const th=TAU*k/24,q=C0.clone().addScaledVector(Rx,-d*st.Rh*Math.cos(th)).addScaledVector(Fh,st.Rh*Math.sin(th));
      for(let j=0;j<N;j+=4){const dj=Math.abs(j-st.i),dw=Math.min(dj,N-dj)*ds;if(dw<st.Rh*3.4)continue;const p=P[j];if((p.x-q.x)**2+(p.z-q.z)**2<(W+40)**2&&Math.abs(p.y-q.y-st.Hh*k/24)<28)return true}}return false};
    if(hits(st.dir)){st.dir=-st.dir;if(hits(st.dir))st.skip=true}}
  /* a spire needs its whole ring, the half turn at the top, the drop and the run out clear of every other part of the track */
  /* a rising spire checks the samples of its own road (it stands further along than a spire would) */
  for(const st of sites)if(KB(st.kind)==='spire'&&st.rev){const O=P[st.i%N],F=Tg[st.i%N],loN=Math.round(80/ds),hiN=Math.round((st.Lc+st.Rs+260)/ds);
    const hits=d=>{const g=revSpire(O,F,{...st,dir:d},0,null);for(let k=0;k<g.pts.length;k+=4){const q=g.pts[k];
      for(let j=0;j<N;j+=4){const dj=((j-st.i)%N+N)%N;if(dj<=hiN||dj>=N-loN)continue;const p=P[j];if((p.x-q.x)**2+(p.z-q.z)**2<(W+40)**2&&Math.abs(p.y-q.y)<38)return true}}return false};
    if(hits(st.dir)){st.dir=-st.dir;if(hits(st.dir))st.skip=true}}
  for(const st of sites)if(st.kind==='spire'&&!st.rev){const O=P[st.i%N],F=Tg[st.i%N],Fh=new V(F.x,0,F.z).normalize(),Rx=new V().crossVectors(Fh,new V(0,1,0)).normalize(),loN=Math.round(80/ds),hiN=Math.round((st.Lc+st.Rs+260)/ds);
    const hits=d=>{const Lv=Rx.clone().multiplyScalar(d),C0=O.clone().addScaledVector(Fh,st.Lc),pts=[];
      for(let k=0;k<=40;k++){const th=3*Math.PI*k/40,h=st.Hs*ss01(k/40);pts.push([C0.clone().addScaledVector(Fh,st.Rs*Math.sin(th)).addScaledVector(Lv,st.Rs*Math.cos(th)),h,h])}
      for(let k=0;k<=10;k++)pts.push([O.clone().addScaledVector(Fh,st.Lc*k/10).addScaledVector(Lv,st.Rs*ss01(k/10)),0,0]);
      for(let k=0;k<=6;k++){const ph=Math.PI*k/6;pts.push([C0.clone().addScaledVector(Lv,-st.Rs/2-st.Rs/2*Math.cos(ph)).addScaledVector(Fh,-st.Rs/2*Math.sin(ph)),st.Hs,st.Hs])}
      pts.push([C0.clone().addScaledVector(Fh,st.Rs*0.42),-st.dpt,st.Hs]);for(let k=1;k<=4;k++)pts.push([C0.clone().addScaledVector(Fh,st.Rs*(0.42+k*0.2)),-st.dpt,-st.dpt]);
      for(const[q,h0,h1]of pts)for(let j=0;j<N;j+=4){const dj=((j-st.i)%N+N)%N;if(dj<=hiN||dj>=N-loN)continue;const p=P[j];if((p.x-q.x)**2+(p.z-q.z)**2<(W+40)**2&&p.y>O.y+h0-38&&p.y<O.y+h1+38)return true}return false};
    if(hits(st.dir)){st.dir=-st.dir;if(hits(st.dir))st.skip=true}}
  /* Prototype 63: a portal needs a straight, nearly level approach (portalCheck) */
  for(const st of sites)if(st.kind==='portal')portalCheck(st,b);
  {const dropped=opt.dropped||{};for(let k=sites.length-1;k>=0;k--){const st=sites[k];if(st.skip||st.i+Math.ceil(st.foot/ds)>(st.prof||st.kind==='portal'?0.78:0.88)*N){dropped[st.kind]=(dropped[st.kind]||0)+1;sites.splice(k,1)}}if(opt.want)opt.dropped=dropped}
  sites.sort((a,b)=>a.i-b.i);
  const oP=[],oU=[],marks=[];let blend=null,blendH=null;
  const shiftAt=()=>{if(!blend)return 0;const len=Math.max(170,Math.abs(blend.dx)*5),v=blend.dx*(1-ss01(blend.d/len));blend.d+=ds;if(blend.d>len)blend=null;return v};
  /* after a spiral the road is still up at the spiral's height and comes back down over the next 460 m */
  const liftAt=()=>{if(!blendH)return 0;const v=blendH.dh*(1-ss01(blendH.d/blendH.len));blendH.d+=ds;if(blendH.d>blendH.len)blendH=null;return v};
  const lift=dh=>({dh,d:0,len:Math.max(460,Math.abs(dh)*7)});
  /* Prototype 43: the road's bank never snaps. A spire or a spiral starts from the up of the road it leaves (lastU), and
     after a loop or a spiral the road's own bank comes back over UPB m (upB) instead of in one sample: on a banked stretch
     the edges used to step by up to 3 m there. A joint that already matched (under 0.01 rad) is built exactly as before. */
  const UPB=60,lastU=i=>oU.length?oU[oU.length-1]:U[i];let upB=null;
  /* the bank of an up vector about the heading F (radians), and the up of that bank alone (no pitch: the road's own
     slope comes back when the up is squared to the road), or null when the bank is under 0.01 rad */
  const bankOf=(u,F)=>{const rh=new V().crossVectors(F,Y1).normalize();return Math.asin(clamp(u.dot(rh),-1,1))};
  const bankUp=(u,F)=>{const b=bankOf(u,F);if(Math.abs(b)<0.01)return null;const rh=new V().crossVectors(F,Y1).normalize();return Y1.clone().multiplyScalar(Math.cos(b)).addScaledVector(rh,Math.sin(b))};
  const upAt=i=>{const u=U[i].clone();if(!upB)return u;const w=1-ss01(upB.d/UPB),q=upB.u;upB.d+=ds;if(upB.d>=UPB)upB=null;return w>0?u.lerp(q,w).normalize():u};
  const upEnd=i=>{const q=oU[oU.length-1],t=Tg[i%N];upB=q&&Math.abs(bankOf(q,t)-bankOf(U[i%N],t))>0.01?{u:q.clone(),d:0}:null};
  const emit=(p,u)=>{oP.push(p);oU.push(u)};
  /* back onto the base line by a smooth curve (Prototype 31): pick the point on the line ahead that the run-out can
     reach with the least turning and a gentle slope, and join it, matching direction at both ends. The base samples
     the set piece covered are skipped. (Shifting the old line sideways onto the run-out could fold the road back on
     itself, or throw it up and down on a banked bend.) q is where the set piece ends, heading Fh; it returns the base
     sample joined. */
  /* (Prototype 63: split in three, so the portal's road can join from anywhere: the curve, its score over a range of base
     samples, and its samples; a spire joins exactly as before) */
  const herm=(A0,Fh,E,m1,ch,x)=>{const x2=x*x,x3=x2*x;return A0.clone().multiplyScalar(2*x3-3*x2+1).addScaledVector(Fh,ch*(x3-2*x2+x)).addScaledVector(E,3*x2-2*x3).addScaledVector(m1,ch*(x3-x2))};
  /* score a join by how sharply it would bend (the most it turns per metre anywhere along it) and how steep it is */
  const joinScore=(q,Fh,j0,j1)=>{let bj=-1,bc=1e9;const A0=q.clone();
        for(let j=j0;j<=j1;j+=2){const ch=P[j].distanceTo(q);if(ch<90)continue;
          let prev=herm(A0,Fh,P[j],Tg[j],ch,0),pd=null,kmax=0,smax=0;for(let k=1;k<=16;k++){const p=herm(A0,Fh,P[j],Tg[j],ch,k/16),d=p.clone().sub(prev),l=d.length();d.divideScalar(l);
            if(pd)kmax=Math.max(kmax,Math.acos(clamp(d.dot(pd),-1,1))/l);smax=Math.max(smax,Math.abs(d.y));pd=d;prev=p}
          const c=kmax*120+Math.max(0,smax-0.3)*6+ch/5000;if(c<bc){bc=c;bj=j}}
        return bj};
  const joinEmit=(q,Fh,bj)=>{const Y=new V(0,1,0),A0=q.clone(),E=P[bj],ch=Math.max(60,E.distanceTo(q)),nC=Math.ceil(ch*1.15/ds);
          for(let k=0;k<nC;k++){const x=k/nC;emit(herm(A0,Fh,E,Tg[bj],ch,x),Y.clone().lerp(U[bj],ss01(x)).normalize())}};
  const joinBack=(q,Fh,O,i,site)=>{
        const adv=Math.max(1,Math.round(q.clone().sub(O).dot(Fh)/ds));
        let bj=joinScore(q,Fh,i+Math.round(adv*0.5),Math.min(N-1,i+Math.round((site.foot+260)/ds)));
        if(bj<0)bj=Math.min(N-1,i+adv);
        joinEmit(q,Fh,bj);
        return bj};
  let si=0,i=0;
  while(i<N){const site=sites[si];
    if(site&&i>=site.i){si++;const kd=KB(site.kind),F=Tg[i].clone(),Up=U[i].clone(),Rt=R[i].clone(),start=oP.length;
      /* start from where the road actually is: still shifted sideways by an earlier loop, or still up after a spiral; s0 is
         the road's slope here (rise per metre), which a spiral or spire starts and ends with so the pitch never snaps */
      const s0=blend?blend.dx*(1-ss01(blend.d/Math.max(170,Math.abs(blend.dx)*5))):0,h0=blendH?blendH.dh*(1-ss01(blendH.d/blendH.len)):0,O=P[i].clone().addScaledVector(RH(i),s0).addScaledVector(Y1,h0),sl0=F.y/Math.max(0.2,Math.hypot(F.x,F.z));
      /* an eased loop (Prototype 31): the bend builds from gentle at the foot to tightest at the top and eases off again,
         the way a coaster loop does, so the road sweeps up into it instead of turning at once. The exit lands about 90 m
         further on, beside the entry, and the road blends back onto the line from there. */
      if(kd==='loop'){const Rl=30+0.3*W,dx=W+4,S=1.15*TAU*Rl,n=Math.ceil(S/ds),a=0.15,c=TAU/(S*(a+(1-a)/2)),d=S/n;let th=0,X=0,Yv=0;
        for(let k=0;k<n;k++){emit(O.clone().addScaledVector(F,X).addScaledVector(Up,Yv).addScaledVector(Rt,dx*ss01(k/n)),Up.clone().multiplyScalar(Math.cos(th)).addScaledVector(F,-Math.sin(th)));
          const kk=c*(a+(1-a)*(1-Math.cos(TAU*(k+0.5)/n))/2);th+=kk*d/2;X+=Math.cos(th)*d;Yv+=Math.sin(th)*d;th+=kk*d/2}
        const end=O.clone().addScaledVector(F,X).addScaledVector(Up,Yv).addScaledVector(Rt,dx);let j=i,jd=1e18;
        for(let k=i;k<Math.min(N-1,i+Math.ceil(2*X/ds));k++){const e=P[k].distanceToSquared(end);if(e<jd){jd=e;j=k}}
        const dl=end.clone().sub(P[j]);dl.addScaledVector(Tg[j],-dl.dot(Tg[j]));i=j;blend={dx:dl.dot(RH(j)),d:0};blendH=Math.abs(dl.y)>0.05?lift(dl.y):null;upEnd(j);
        marks.push({kind:kd,a:start,b:oP.length})}
      else if(kd==='helix'){const u0h=bankUp(lastU(i),F),{Rh,Hh,dir}=site,n=Math.ceil(TAU*Rh/ds),Y=new V(0,1,0),Fh=new V(F.x,0,F.z).normalize(),Rx=new V().crossVectors(Fh,Y).normalize(),C0=O.clone().addScaledVector(Rx,dir*Rh),bk=0.3;
        for(let k=0;k<n;k++){const th=TAU*k/n,p=C0.clone().addScaledVector(Rx,-dir*Rh*Math.cos(th)).addScaledVector(Fh,Rh*Math.sin(th));const x=k/n;p.y=O.y+Hh*ss01(x)+sl0*TAU*Rh*x*(2*x-1)*(x-1);
          const inw=C0.clone().sub(p);inw.y=0;inw.normalize();const hu=Y.clone().multiplyScalar(Math.cos(bk*ss01(Math.min(1,k/n*6))*ss01(Math.min(1,(n-k)/n*6)))).addScaledVector(inw,Math.sin(bk*ss01(Math.min(1,k/n*6))*ss01(Math.min(1,(n-k)/n*6)))).normalize();
          emit(p,u0h?u0h.clone().lerp(hu,ss01(Math.min(1,k/n*6))).normalize():hu)}
        blendH=lift(h0+Hh);upEnd(i);marks.push({kind:kd,a:start,b:oP.length,data:Hh<0?{down:1,src:site.src}:null})}
      else if(kd==='spire'&&!site.rev){const g=spireGeo(O,F,site,sl0,bankUp(lastU(i),F)),Fh=g.Fh,q=g.q;
        const D0=oP.length+g.d0;for(let k=0;k<g.pts.length;k++)emit(g.pts[k],g.ups[k]);
        marks.push({kind:'sdrop',a:D0,b:oP.length});
        marks.push({kind:kd,a:start,b:oP.length,data:g.data});
        /* back onto the base line by a smooth curve (Prototype 31): pick the point on the line ahead that the run-out can
           reach with the least turning and a gentle slope, and join it, matching direction at both ends. The base samples
           the set piece covered are skipped. (Shifting the old line sideways onto the run-out could fold the road back on
           itself, or throw it up and down on a banked bend.) */
        i=joinBack(q,Fh,O,i,site);blend=null;blendH=null;upB=null}
      /* Prototype 60: the rising spire, the spire's road run backwards: in underneath the ring, up straight up the middle
         (mag-lock from the foot to past the top edge), the half turn at the top, one and a half turns down round the ring
         and out to the side, then back onto the line like a spire. It starts on the road's own slope and bank. */
      else if(kd==='spire'){const g=revSpire(O,F,site,sl0,bankUp(lastU(i),F));
        for(let k=0;k<g.pts.length;k++)emit(g.pts[k],g.ups[k]);
        marks.push({kind:'sdrop',a:start,b:start+g.nMag});
        marks.push({kind:kd,a:start,b:oP.length,data:{...g.data,src:site.src}});
        i=joinBack(g.q,g.Fh,O,i,site);blend=null;blendH=null;upB=null}
      /* Prototype 63: the portal jump (004s): the approach, the break, the exit road, and back onto the line like a spire */
      else if(kd==='portal'){i=portalEmit({P,U,N,ds,i,site,emit,marks,oP,RH,shiftAt,liftAt,upAt,joinScore,joinEmit,W});blend=null;blendH=null;upB=null}
      else{const n=Math.ceil(site.len/ds);
        /* on a sloping stretch a rise or drop is made smaller, so together they stay under about 35 degrees */
        if(kd==='climb'||kd==='dive'||kd==='sweep'){let sb=0;for(let k=0;k<n;k+=2){const t=Tg[Math.min(N-1,i+k)];sb=Math.max(sb,Math.abs(t.y)/Math.max(0.2,Math.hypot(t.x,t.z)))}const room=Math.max(0.12,0.7-sb);
          if(kd==='climb')site.Hh=Math.min(site.Hh,room*2*site.Lr/Math.PI);else if(kd==='dive')site.D=Math.min(site.D,room*site.len/Math.PI);else site.amp=site.amp.map(a=>Math.min(a,room*site.lam/Math.PI))}
        /* Prototype 60: a new jump runs straight: from its ramp (40-100 m before the lip) to 150-220 m past the landing the
           road follows the straight line between those two points, unbanked, blending in and out over 150 m, so a frame flying the
           gap (and the 100-480 m it flies past it) isn't carried into the fence by a bend under it */
        if(site.prof&&!site.sw){const sw=new Float32Array(n),sx=new Float32Array(n),sz=new Float32Array(n),wins=[],Bl=150,ix=xm=>Math.min(N-1,i+Math.max(0,Math.round(xm/ds)));let acc=0;
          for(const q of site.prof){if(q.gap){const k=q.gap.kind,w0=[acc-(k==='drop'?40:k==='sjump'?100:70),acc+q.L+(k==='drop'?150:220)],pw=wins[wins.length-1];if(pw&&w0[0]-pw[1]<2*Bl)pw[1]=w0[1];else wins.push(w0)}acc+=q.L}
          /* (drops in a row share one straight line: two lines blending into each other between them would kink the road;
             and the blend ends inside the piece, or the road would step where it ends) */
          for(const w of wins){w[0]=Math.max(w[0],Bl);w[1]=Math.min(w[1],n*ds-Bl-2)}
          for(const[xa,xb]of wins){const A=P[ix(xa)],B=P[ix(xb)],dx=B.x-A.x,dz=B.z-A.z,L0=Math.hypot(dx,dz)||1,ux=dx/L0,uz=dz/L0;
            /* on a tight bend the line would move the road too far (into the rest of the track): then it goes only part of
               the way, at most 20 m from the line, which still takes most of the bend out */
            let mx=0;for(let j=0;j<n;j+=4){const xm=j*ds;if(xm<xa||xm>xb)continue;const q=P[ix(xm)],t=(xm-xa)/(xb-xa);mx=Math.max(mx,Math.hypot(A.x+dx*t-q.x,A.z+dz*t-q.z))}const kS=Math.min(1,20/Math.max(1e-3,mx));
            for(let j=0;j<n;j++){const xm=j*ds;if(xm<xa-Bl||xm>xb+Bl)continue;let w,tx,tz;
              if(xm<xa){w=ss01((xm-xa+Bl)/Bl);tx=A.x+ux*(xm-xa);tz=A.z+uz*(xm-xa)}else if(xm>xb){w=ss01((xb+Bl-xm)/Bl);tx=B.x+ux*(xm-xb);tz=B.z+uz*(xm-xb)}else{const t=(xm-xa)/(xb-xa);w=1;tx=A.x+dx*t;tz=A.z+dz*t}
              if(w>sw[j]){const q=P[ix(xm)];sw[j]=w;sx[j]=(tx-q.x)*kS;sz[j]=(tz-q.z)*kS}}}
          site.sw=sw;site.sx=sx;site.sz=sz}
        for(let j=0;j<n&&i<N;j++,i++){const x=j/n,xm=j*ds,s=shiftAt(),p=P[i].clone().addScaledVector(RH(i),s).addScaledVector(Y1,liftAt()),u=upAt(i);
          if(kd==='twist'){const ph=TAU*ss01(x);emit(p,u.clone().multiplyScalar(Math.cos(ph)).addScaledVector(R[i],Math.sin(ph)))}
          else if(kd==='corkscrew'){const ph=TAU*ss01(x);emit(p.addScaledVector(U[i],rc*(1-Math.cos(ph))).addScaledVector(R[i],-rc*Math.sin(ph)),u.clone().multiplyScalar(Math.cos(ph)).addScaledVector(R[i],Math.sin(ph)))}
          else if(kd==='dive'){emit(p.addScaledVector(Y1,-site.D*(1-Math.cos(TAU*x))/2),u)}
          else if(kd==='climb'){const{Hh,Lr,Lp}=site,y=(site.sg||1)*xm<Lr?Hh*(1-Math.cos(Math.PI*xm/Lr))/2:xm<Lr+Lp?Hh:Hh*(1+Math.cos(Math.PI*Math.min(1,(xm-Lr-Lp)/Lr)))/2;emit(p.addScaledVector(Y1,y),u)}
          else if(kd==='sweep'){const k=Math.min(site.n-1,Math.floor(xm/site.lam)),xx=xm/site.lam-k;emit(p.addScaledVector(Y1,site.sg[k]*site.amp[k]*(1-Math.cos(TAU*xx))/2),u)}
          else if(site.prof){if(site.sw[j]>0){p.x+=site.sx[j]*site.sw[j];p.z+=site.sz[j]*site.sw[j];u.lerp(Y1,site.sw[j]).normalize()}let x=xm,sg=null;for(const q of site.prof){if(x<q.L){sg=q;break}x-=q.L}const y=sg?sg.f(x):site.prof[site.prof.length-1].y1;emit(p.addScaledVector(Y1,y),u);
            /* the lip is the first sample of a gap, the landing the first after it */
            const gp=!!(sg&&sg.gap);if(gp&&!site._g)marks.push({kind:'lip2',a:oP.length-1,d:sg.gap});if(!gp&&site._g)marks.push({kind:'land2',a:oP.length-1,d:site._g});site._g=gp?sg.gap:null}
          else{emit(p.addScaledVector(Y1,xm<lr?1.2*(xm/lr)**2:gapC((xm-lr)/jumpG,jumpG)),u);if(Math.abs(xm-lr)<ds/2)marks.push({kind:'lip',a:oP.length-1});if(Math.abs(xm-lr-jumpG)<ds/2)marks.push({kind:'land',a:oP.length-1})}}
        marks.push({kind:kd,a:start,b:oP.length,data:site.prof?{nd:site.nd,tail:site.tail,Ls:site.Ls,hu:site.hu,bonus:site.bonus,Lc:site.Lc}:null});continue}}
    const s=shiftAt();emit(P[i].clone().addScaledVector(RH(i),s).addScaledVector(Y1,liftAt()),upAt(i));i++}
  // even resampling of the closed polyline
  /* (Prototype 63: a portal's break, from the entrance to the exit, has no length: u runs straight through it) */
  const brkA=new Set();for(const m of marks)if(m.kind==='pbrk')brkA.add(m.a);
  const M=oP.length,cum=new Float64Array(M+1);for(let k=1;k<=M;k++)cum[k]=cum[k-1]+(brkA.size&&brkA.has(k-1)?0:oP[k%M].distanceTo(oP[k-1]));
  const L=cum[M],N2=Math.round(L/2),ds2=L/N2,P2=[],U2=[],map=new Float64Array(M);for(let k=0;k<M;k++)map[k]=cum[k];
  let seg=0;for(let k=0;k<N2;k++){const s=k*ds2;while(seg<M-1&&cum[seg+1]<s)seg++;const a=(s-cum[seg])/Math.max(1e-9,cum[seg+1]-cum[seg]);
    P2.push(new V().lerpVectors(oP[seg],oP[(seg+1)%M],a));U2.push(new V().lerpVectors(oU[seg],oU[(seg+1)%M],a).normalize())}
  const T2=[],R2=[],H2=new Float32Array(N2),K2=new Float32Array(N2),kind=new Uint8Array(N2),gap=new Uint8Array(N2);
  /* the break's sample (the last before the entrance) and the portal's frames; its tangents and curvature are one-sided */
  let brk=null;const port=[];if(brkA.size){brk=new Uint8Array(N2);for(const m of marks)if(m.kind==='pbrk'){const o=portalFrames(m.d,map[m.a],ds2,N2);brk[o.k]=1;port.push(o)}}
  for(let k=0;k<N2;k++){const t=brk&&brk[k]?new V().subVectors(P2[k],P2[(k-1+N2)%N2]).normalize():brk&&brk[(k-1+N2)%N2]?new V().subVectors(P2[(k+1)%N2],P2[k]).normalize():new V().subVectors(P2[(k+1)%N2],P2[(k-1+N2)%N2]).normalize();T2.push(t);const u=U2[k];u.addScaledVector(t,-u.dot(t)).normalize();R2.push(new V().crossVectors(t,u));H2[k]=Math.atan2(t.x,t.z)}
  for(let k=0;k<N2;k++){const d=new V().subVectors(T2[(k+1)%N2],T2[(k-1+N2)%N2]).divideScalar(2*ds2);K2[k]=-d.dot(R2[k])}
  if(brk)for(const o of port){const k=o.k;K2[k]=K2[(k-1+N2)%N2];K2[(k+1)%N2]=K2[(k+2)%N2]}
  const feats=[],jumps=[],drops=[];let lip=null,lip2=null,pk0=null;const NEWJ={drop:1,sjump:1,cjump:1,portal:1};
  for(const m of marks){const u0=map[m.a];
    if(m.kind==='lip2'){lip2=u0;continue}
    /* Prototype 63: a portal's stretch for the things that keep off features (from 60 m before the jump's line to the turn) */
    if(m.kind==='pbrk')continue;if(m.kind==='pkind0'){pk0=u0;continue}if(m.kind==='pkind1'){for(let k=Math.floor(pk0/ds2);k<=Math.ceil(u0/ds2);k++)kind[k%N2]=1;continue}
    if(m.kind==='land2'){const d=m.d;jumps.push({u0:lip2,u1:u0,G:u0-lip2,slope:d.slope,lipH:d.lipH,kind:d.kind});for(let k=Math.ceil(lip2/ds2);k<=Math.floor(u0/ds2);k++)gap[k%N2]=1;
      for(let k=Math.floor((lip2-30)/ds2);k<=Math.ceil((u0+30)/ds2);k++)kind[((k%N2)+N2)%N2]=1;continue}
    if(NEWJ[m.kind]){const u1=m.b<M?map[m.b]:L;feats.push({kind:m.kind,u0,u1,...(m.data||{})});continue}
    if(m.kind==='lip')lip=u0;else if(m.kind==='sdrop')drops.push({u0,u1:m.b<M?map[m.b]:L});else if(m.kind==='land'){jumps.push({u0:lip,u1:u0,G:u0-lip,slope:2*1.2/24,lipH:1.2});for(let k=Math.ceil(lip/ds2);k<=Math.floor(u0/ds2);k++)gap[k%N2]=1}
    else{const u1=m.b<M?map[m.b]:L;feats.push({kind:m.kind,u0,u1,...(m.data||{})});if(m.kind!=='sweep'&&m.kind!=='dive'&&m.kind!=='climb')for(let k=Math.floor(u0/ds2);k<=Math.ceil(u1/ds2);k++)kind[k%N2]=1}}
  return{P:P2,U:U2,R:R2,Tg:T2,H:H2,K:K2,N:N2,ds:ds2,L,kind,gap,feats,jumps,drops,brk,port:brk?port:null}}
