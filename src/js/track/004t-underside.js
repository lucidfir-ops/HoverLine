//# track/004t-underside.js: the Spirit realm's underside (Prototype 63): a split whose second route peels off the road's edge, rolls over and runs on the underside of the same slab in anti-grav colours, then rolls back and rejoins: its shape (flipPlace, flipFinish), the frame a racer on it is drawn in (flipRoll, onSurf), what is drawn (flipRoad, flipPickups), and the realm's rule round it (flipKeep, flipWatch)
/* Prototype 63: Eric (Prototype 60): "can we sometimes have track glued to the bottom of track and you're riding it
   upside down? almost like a mobius strip. there could be a visual effect or track colour change to be the excuse for
   the anti gravity track section"; (Prototype 63) "put them only in the Spirit Realm".

   Built as a split (kind 'flip'), not as a Möbius twist of the main road. Why: a twist of the whole road is only a long
   barrel roll (the game has those: twists and corkscrews), everyone rides it and nobody sees the road from the other
   side. As a split, the road divides: the top route stays on the road as it is, the other peels off its edge, rolls over
   and runs along the underside of the same slab, so the two fields race on the two faces of one road, a few metres
   apart, upside down to each other. That is the "track glued to the bottom of track", and it is a choice.

   Geometry (in the base road's frame, right R and up U, unbanked as through every split; s the side it goes out on; W the
   road's width, wF = 0.32 W, cOut = W/2 + 3 + wF, Tk = 1.8 m, the road's own thickness). Over n samples, each half the
   mirror of the other:
   - A (80 m, the fork): the road's two halves part; the top route widens to the whole road while the other moves out
     to the side, 3 m clear of the road's edge, and narrows to 2 wF; both level, open to each other at first (you can
     still change your mind for about 30 m);
   - B (150 m, the roll): out there, 3 m off the edge, it rolls 180 degrees over and outwards about its own middle (so no
     part of it ever comes near the road, and the middle of it, where a frame rides, feels no lift), dropping by Tk;
   - C (90 m, the tuck): upside down, it slides in under the road and widens to the whole road's width: its surface is
     now the road's underside;
   - D (160-300 m): the two routes run on the two faces of the slab, Tk apart;
   - then C, B and A backwards: out, roll back up, in and join.
   The anti-grav look: on the underside route and the slab (its sides and underside) a neon field of cyan and violet
   lanes and bands flowing past, the edges and walls in the same colours, the road's own amber fading into them as the
   routes part. Calm visuals tones it down (dimmer, no flow, no kick).

   The racer: everything races use is in (u, lat, h over the surface), as on any split. On the underside route lat is
   measured in the route's own frame (c here, the centre as a frame riding it sees it move; cw is where its centre is
   across the base road), so steering, the walls, the AI's line, pads and strips all work as on any road. The route's
   roll (ph), and two terms for physics, are the only new things: the road's bends turn a frame by the curvature in its
   own frame (kx, so upside down a left bend is your right), and its crests and dips press a frame by the curvature along
   its own up (kv: a crest of the main road is a dip on its underside). Anti-grav: the hold that keeps a frame on the road
   pulls it onto the face it rides; a frame can't fall between the faces (h is over its own surface).
   The AI takes it as a split's long route (two boost pads and an ammo strip on the underside, nothing on top), by the
   same odds as any split. Spirit tracks only (codes ending -S), about one in five (FLIP_O.P, and where a gentle 0.9-1 km
   stretch is free: see flipPlace), or the editor's count. */
const FLIP_O={A:75,B:140,C:85,D0:130,D1:240,G:3,Tk:1.8,wF:0.32,P:0.55};
/* the two routes' tables (top T0 and under F), the first half drawn, the second its mirror; F.c is the physics centre:
   the centre's sideways move as seen in the route's own (rolled) frame, added up, so it ends where it began */
function flipShape(n,nA,nB,nC,W,s){const O=FLIP_O,Tk=O.Tk,wF=W*O.wF,cOut=W/2+O.G+wF,h2=n/2,kA=nA,kB=kA+nB,kC=kB+nC,
    mk=()=>({c:new Float32Array(n+1),w:new Float32Array(n+1),h:new Float32Array(n+1)}),T0=mk(),F=mk();F.cw=new Float32Array(n+1);F.ph=new Float32Array(n+1);
  for(let k=0;k<=h2;k++){const eA=ss01(k/nA);T0.c[k]=s*W/4*(eA-1);T0.w[k]=W/4*(1+eA);let cw,w,h=0,ph=0;
    if(k<=kA){w=W/4+(wF-W/4)*eA;cw=s*((W/2+O.G)*eA+w)}
    else if(k<=kB){const e=ss01((k-kA)/nB);w=wF;cw=s*cOut;h=-Tk*e;ph=Math.PI*e}
    else if(k<=kC){const e=ss01((k-kB)/nC);w=wF+(W/2-wF)*e;cw=s*cOut*(1-e);h=-Tk;ph=Math.PI}
    else{w=W/2;cw=0;h=-Tk;ph=Math.PI}
    F.cw[k]=cw;F.w[k]=w;F.h[k]=h;F.ph[k]=ph}
  F.c[0]=F.cw[0];for(let k=1;k<=h2;k++){const m=(F.ph[k]+F.ph[k-1])/2;F.c[k]=F.c[k-1]+(F.cw[k]-F.cw[k-1])*Math.cos(m)-s*(F.h[k]-F.h[k-1])*Math.sin(m)}
  for(let k=h2+1;k<=n;k++){const q=n-k;for(const B of[T0,F])for(const a of['c','w','h','cw','ph'])if(B[a])B[a][k]=B[a][q]}
  return{T0,F,cOut,wF,kA,kB,kC}}
/* a point of the under route at its sample k, l across it and d over it (its own frame), with the base frame r (right) and
   u (up) at its base sample; fills fr/fu with the route's frame there when given */
function flipPt(p,r,u,F,k,s,l,d,o,fr,fu){const a=s*F.ph[k],c=Math.cos(a),n=Math.sin(a);
  if(fr){fr.copy(r).multiplyScalar(c).addScaledVector(u,-n)}if(fu){fu.copy(u).multiplyScalar(c).addScaledVector(r,n)}
  return o.copy(p).addScaledVector(r,F.cw[k]+l*c+d*n).addScaledVector(u,F.h[k]-l*n+d*c)}
/* Placing it (roadShape, with the splits): on a gentle stretch (as any split: no bend tighter than 222 m over it and 90 m
   either side, nothing else there, ending before the last stretch's green strips), and only where every part of the
   under route and the space a frame rides in is clear of the rest of the track and of the other splits' routes */
function flipPlace(c){const{seed,N,ds,P,Tg,Cs,busy,spl,splits,gI0,mark,finishB,W}=c,O=FLIP_O;if(!c.want)return 0;
  const rf=rng((seed^0xF11B5)>>>0),nA=Math.round(O.A/ds),nB=Math.round(O.B/ds),nC=Math.round(O.C/ds),nD=2*Math.round((O.D0+rf()*(O.D1-O.D0))/ds/2),n=2*(nA+nB+nC)+nD,m=Math.round(60/ds),pref=rf()<0.5?1:-1;
  const starts=[];for(let i=Math.floor(N*0.1);i+n+m<Math.floor(N*0.85);i+=Math.max(1,Math.round(25/ds)))starts.push(i);
  for(let t=starts.length-1;t>0;t--){const j=Math.floor(rf()*(t+1));[starts[t],starts[j]]=[starts[j],starts[t]]}
  const V=THREE.Vector3,Y0=new V(0,1,0),rh=new V(),uf=new V(),q=new V(),fr=new V(),fu=new V(),own=[];for(const S1 of splits)for(const p of S1.pts)own.push(p);
  for(const i0 of starts){if(i0+n+m>gI0)continue;let okS=true;for(let k=i0-m;k<=i0+n+m&&okS;k++){const kk=((k%N)+N)%N;if(busy[kk]||spl[kk]||Math.abs(Cs[kk])>0.007)okS=false}if(!okS)continue;
    /* and gentler over the rolls (no bend tighter than 222 m): on its side a frame feels the bend as a crest or a dip */
    for(let k=nA;k<=nA+nB&&okS;k++)if(Math.abs(Cs[(i0+k)%N])>0.0045||Math.abs(Cs[(i0+n-k)%N])>0.0045)okS=false;if(!okS)continue;
    /* the side the road bends towards over the rolls, if it bends: on its side there, the bend presses a frame onto the
       face instead of lifting it off */
    let kS=0;for(let k=nA;k<=nA+nB;k++)kS+=Cs[(i0+k)%N]+Cs[(i0+n-k)%N];kS/=2*(nB+1);const s0=Math.abs(kS)>0.0008?-Math.sign(kS):pref;
    for(const s of[s0,-s0]){const sh=flipShape(n,nA,nB,nC,W,s),F=sh.F,pts=[];let clear=true;
      for(let k=0;k<=n&&clear;k+=Math.max(1,Math.round(6/ds))){const i=(i0+k)%N;rh.crossVectors(Tg[i],Y0).normalize();uf.copy(Y0).addScaledVector(Tg[i],-Tg[i].y).normalize();
        if(k%Math.max(1,Math.round(12/ds))===0)pts.push(flipPt(P[i],rh,uf,F,k,s,0,0,new V()));
        for(const l of[-F.w[k],0,F.w[k]])for(const d of[0,4]){flipPt(P[i],rh,uf,F,k,s,l,d,q);
          for(let j=0;j<N&&clear;j+=3){const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<n/2+2*m)continue;if(P[j].distanceToSquared(q)<(W/2+14)**2)clear=false}
          for(const p of own)if(p.distanceToSquared(q)<(W/2+16)**2){clear=false;break}if(!clear)break}}
      if(!clear)continue;
      const B=[sh.T0,F],fb=s>0?1:0;if(fb===0)B.reverse();finishB(B);
      /* the under route's slope in its own frame (sl) and its roll's rate (dph, for drawing a frame across it) */
      F.sl=new Float32Array(n+1);F.dph=new Float32Array(n+1);for(let k=0;k<=n;k++){const a=Math.max(0,k-1),b=Math.min(n,k+1),du=(b-a)*ds,p=F.ph[k];
        F.sl[k]=(s*(F.cw[b]-F.cw[a])*Math.sin(p)+(F.h[b]-F.h[a])*Math.cos(p))/du;F.dph[k]=(F.ph[b]-F.ph[a])/du}
      F.long=true;sh.T0.long=false;
      for(let k=0;k<=n;k+=Math.max(1,Math.round(12/ds))){const i=(i0+k)%N;rh.crossVectors(Tg[i],Y0).normalize();q.copy(P[i]).addScaledVector(rh,sh.T0.c[k]);pts.push(q.clone())}
      mark({kind:'flip',i0,n,u0:i0*ds,u1:(i0+n)*ds,side:s,longB:fb,fB:fb,tB:1-fb,b:B,pts,feat:1,nA,nB,nC,nD,kA:sh.kA,kB:sh.kB,kC:sh.kC,cOut:sh.cOut,wF:sh.wF,Tk:O.Tk});return 1}}
  return 0}
/* After the road's curvature is known (roadShape's end): kv, the press along the route's own up on top of the base road's
   Kn (the base's crest is a dip upside down), and kx, the turn in the route's own frame on top of the base road's K (a
   bend is the other way round upside down; on its side a crest turns you); both 0 on the top route and off the roll */
function flipFinish(splits,K,Kn,N,ds){for(const S0 of splits){if(S0.kind!=='flip')continue;const F=S0.b[S0.fB],n=S0.n,s=S0.side;F.kv=new Float32Array(n+1);F.kx=new Float32Array(n+1);
  for(let k=0;k<=n;k++){const i=(S0.i0+k)%N,a=Math.max(0,k-1),b=Math.min(n,k+1),p=F.ph[k],cs=Math.cos(p),sn=Math.sin(p);
    F.kv[k]=(F.sl[b]-F.sl[a])/((b-a)*ds)+Kn[i]*(cs-1)-s*K[i]*sn;F.kx[k]=K[i]*(cs-1)+s*Kn[i]*sn}}}
/* a frame's rolled axes: right r and up u turned by the signed roll a (side times ph) about the road's forward */
const _flA=new THREE.Vector3(),_flB=new THREE.Vector3();
function flipRoll(r,u,a){const c=Math.cos(a),n=Math.sin(a);_flA.copy(r).multiplyScalar(c).addScaledVector(u,-n);_flB.copy(u).multiplyScalar(c).addScaledVector(r,n);r.copy(_flA);u.copy(_flB)}
/* a point on the surface surf() last found (SF): lat across (the physics' own), d over it, with s from sampleAt; on the
   under route it also turns s.r and s.u into the route's frame, so anything oriented by them sits on its face */
function onSurf(s,lat,d,o){if(!SF.ph)return o.copy(s.p).addScaledVector(s.r,lat).addScaledVector(s.u,SF.h+d);
  o.copy(s.p).addScaledVector(s.r,SF.cw).addScaledVector(s.u,SF.h);flipRoll(s.r,s.u,SF.ph*SF.fs);return o.addScaledVector(s.r,lat-SF.c).addScaledVector(s.u,d)}
/* on the under route (as a ghost's and a remote ship's flag) */
const onUnder=r=>!!(r.brS&&r.brS.kind==='flip'&&r.br===r.brS.fB&&T.spl[idxAt(r.u)]);
/* how far round a frame is rolled, signed (for the cameras, which turn with it) */
function rollOf(r){if(!r||!r.brS||r.brS.kind!=='flip'||r.br!==r.brS.fB||!T.spl[idxAt(r.u)])return 0;const f=surf(modU(r.u),r.lat,{brS:r.brS,br:r.br,u:r.u},true);return f.ph*f.fs}

/* ---- what is drawn (roadBuild): both routes' faces, edges, walls; the slab's sides and underside; the field ---- */
const FLIP_V=`attribute vec3 aF;varying vec3 vF;varying vec2 vUv;varying vec3 vW;void main(){vF=aF;vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
/* aF: x the field's amount (0 at the fork, 1 once parted), y its strength, z 0 a face (lanes and bands across, uv.x
   across it) or 1 a side (a glow from the face, uv.x down it) */
const FLIP_F=`uniform float uT,uCalm,uKick;varying vec3 vF;varying vec2 vUv;varying vec3 vW;
  void main(){float f=vF.x*vF.y;if(f<0.003)discard;float a=vUv.x,m=vUv.y,sp=1.-0.85*uCalm,g;
    vec3 c1=vec3(0.25,0.94,1.),c2=vec3(0.78,0.36,1.),col=mix(c1,c2,0.5+0.5*sin(m*0.031-uT*0.7*sp));
    float b=fract(m/11.-uT*1.4*sp);
    if(vF.z<0.5){float ln=0.;for(int i=1;i<4;i++)ln+=smoothstep(0.016,0.,abs(a-float(i)*0.25));
      float cr=smoothstep(0.09,0.,abs(b-0.5))*0.8,ed=smoothstep(0.08,0.,a)+smoothstep(0.92,1.,a);g=0.08+ln*0.5+cr*0.55+ed*0.4;}
    else{g=(0.25+0.75*smoothstep(0.,1.,1.-a))*(0.45+0.55*smoothstep(0.2,0.,abs(b-0.5)));col=mix(col,c1,0.4);}
    g*=f*(1.+0.4*uKick*(1.-uCalm))*(1.-0.55*uCalm)*(1.-smoothstep(600.,2400.,distance(vW,cameraPosition)));
    gl_FragColor=vec4(col*g,1.);}`;
function flipRoad(c){const{group,add,strip,splits,N,ds,edgeCol,roadM,edgeM,pads,zones,padM,pM,sw,eIn,padLen}=c,out=[];
  for(const S0 of splits){if(S0.kind!=='flip')continue;const k0=S0.i0,n=S0.n,s=S0.side,F=S0.b[S0.fB],T0=S0.b[S0.tB],Tk=S0.Tk,A=S0.adj,
      ix=i=>Math.max(0,Math.min(n,i-k0)),o={from:k0,to:k0+n+1};
    /* the field's amount along it: in over the second half of the fork and the first of the roll, out the same way */
    const fA=k=>{const q=Math.min(k,n-k);return ss01((q-S0.nA*0.35)/(S0.nA*0.65+S0.nB*0.25))};
    const mat=(st)=>new THREE.ShaderMaterial({uniforms:{uT:SPU.uT,uCalm:SPU.uCalm,uKick:SPU.uKick},vertexShader:FLIP_V,fragmentShader:FLIP_F,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,fog:false});
    const fieldM=mat(),glassF=new THREE.MeshBasicMaterial({color:0x8a6cff,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}),railF=new THREE.MeshBasicMaterial({color:0x3ff0ff,side:THREE.DoubleSide});
    const uM=roadM.clone();uM.side=THREE.DoubleSide;uM.emissive=new THREE.Color(0x5a5a5a);uM.emissiveMap=roadM.map;
    const darkF=new THREE.MeshLambertMaterial({color:0x0e1015,side:THREE.DoubleSide});
    /* a strip with the field's attribute: k -> [amount, strength, kind] */
    const fStrip=(la,ha,lb,hb,oo,fn)=>{const g=strip(la,ha,lb,hb,{...oo,uv:1,col:i=>fn(ix(i))});g.setAttribute('aF',g.getAttribute('color'));g.deleteAttribute('color');return add(g,fieldM)};
    /* the edges' colours: the road's amber stripes into cyan and violet ones as the field comes in */
    const eCol=i=>{const f=fA(ix(i)),a=edgeCol(i),b=Math.floor(i*ds/5)%2?[0.25,0.94,1]:[0.62,0.3,1];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]};
    const runsF=(pred)=>{const r=[];let a=-1;for(let k=0;k<=n+1;k++){const p=k<=n&&pred(Math.min(n,k));if(p&&a<0)a=k;if(!p&&a>=0){if(k-1>a)r.push({from:k0+a,to:k0+k-1});a=-1}}return r};
    const open=(k,B,O,right)=>!!(A&&A[k]&&((O.c[k]>B.c[k])===right));
    /* ---- the top route: the road as it is (its face, edges, walls), the slab's sides down to Tk and its underside ---- */
    {const B=T0,cc=i=>B.c[ix(i)],w=i=>B.w[ix(i)],L=d=>i=>cc(i)-w(i)+d,Rr=d=>i=>cc(i)+w(i)+d;
      add(strip(L(0),0,Rr(0),0,{...o,uv:1/24}),roadM);
      add(strip(L(-0.15),0.04,L(0.45),0.04,{...o,col:eCol}),edgeM);add(strip(Rr(-0.45),0.04,Rr(0.15),0.04,{...o,col:eCol}),edgeM);
      fStrip(L(0),0.03,Rr(0),0.03,o,k=>[fA(k),0.35,0]);
      for(const right of[false,true]){const E=right?Rr:L;for(const fld of[false,true])for(const oo of runsF(k=>!open(k,B,F,right)&&(fA(k)>=0.5)===fld)){add(strip(E(0),0,E(0),1.5,oo),fld?glassF:c.glass);add(strip(E(0),1.5,E(0),1.68,oo),fld?railF:c.rail)}}
      for(const E of[L,Rr]){add(strip(E(0),0,E(0),-Tk,o),darkF);fStrip(E(0),-0.02,E(0),-Tk+0.02,o,k=>[fA(k),0.8,1])}
      /* the underside: its face is the under route's surface where that route runs beneath it */
      add(strip(L(0),-Tk,Rr(0),-Tk,{...o,uv:1/24}),uM);fStrip(L(0),-Tk-0.03,Rr(0),-Tk-0.03,o,k=>[fA(k),1,0])}
    /* where the two routes touch at the fork and the join, the road between them */
    if(A){const la=i=>{const k=ix(i),l=T0.c[k]<F.c[k]?T0:F;return l.c[k]+l.w[k]},lb=i=>{const k=ix(i),r2=T0.c[k]<F.c[k]?F:T0;return Math.max(la(i),r2.c[k]-r2.w[k])};
      for(const oo of runsF(k=>!!A[k]))add(strip(la,0,lb,0,{...oo,uv:1/24}),roadM)}
    /* ---- the under route, in its own frame: (l across, d over) to the base frame's (lat, h) ---- */
    {const cs=k=>Math.cos(s*F.ph[k]),sn=k=>Math.sin(s*F.ph[k]),LA=(lf,df)=>i=>{const k=ix(i);return F.cw[k]+lf(k)*cs(k)+df(k)*sn(k)},HA=(lf,df)=>i=>{const k=ix(i);return F.h[k]-lf(k)*sn(k)+df(k)*cs(k)};
      const C=v=>()=>v,w=k=>F.w[k],nw=k=>-F.w[k],inv=k=>F.ph[k]>Math.PI-1e-3;
      /* its face: upside down under the road, only the part outside the road's edge (inside, the underside is its face);
         lo the outer edge (away from the road), hi the inner or where it meets the road's edge */
      const lo=k=>-s*F.w[k],hi=k=>inv(k)?s*Math.min(F.w[k],s*F.cw[k]-W/2):s*F.w[k],has=k=>s*(hi(k)-lo(k))>0.02;
      const back=k=>-(0.25+(Tk-0.25)*(1-fA(k)));
      for(const oo of runsF(has)){add(strip(LA(lo,C(0)),HA(lo,C(0)),LA(hi,C(0)),HA(hi,C(0)),{...oo,uv:1/24}),uM);
        add(strip(LA(lo,back),HA(lo,back),LA(hi,back),HA(hi,back),oo),darkF);
        add(strip(LA(lo,C(0)),HA(lo,C(0)),LA(lo,back),HA(lo,back),oo),darkF);
        fStrip(LA(lo,C(0.03)),HA(lo,C(0.03)),LA(hi,C(0.03)),HA(hi,C(0.03)),oo,k=>[fA(k),1,0]);
        fStrip(LA(lo,k=>back(k)-0.03),HA(lo,k=>back(k)-0.03),LA(hi,k=>back(k)-0.03),HA(hi,k=>back(k)-0.03),oo,k=>[fA(k),0.7,0])}
      /* its inner side while it is out beside the road */
      for(const oo of runsF(k=>!inv(k)||s*F.cw[k]-F.w[k]>W/2))add(strip(LA(hi,C(0)),HA(hi,C(0)),LA(hi,back),HA(hi,back),oo),darkF);
      /* its edges, all the way (under the road they run along the underside's two edges) */
      const ed=(a,b)=>add(strip(LA(a,C(0.04)),HA(a,C(0.04)),LA(b,C(0.04)),HA(b,C(0.04)),{...o,col:eCol}),edgeM);
      ed(k=>nw(k)-0.15,k=>nw(k)+0.45);ed(k=>w(k)-0.45,k=>w(k)+0.15);
      /* its walls, standing on its own face (hanging under the road there), open where it touches the top route */
      for(const right of[false,true]){const E=right?w:nw;for(const fld of[false,true])for(const oo of runsF(k=>!open(k,F,T0,right)&&(fA(k)>=0.5)===fld)){
        add(strip(LA(E,C(0)),HA(E,C(0)),LA(E,C(1.5)),HA(E,C(1.5)),oo),fld?glassF:c.glass);add(strip(LA(E,C(1.5)),HA(E,C(1.5)),LA(E,C(1.68)),HA(E,C(1.68)),oo),fld?railF:c.rail)}}
      /* ---- its pickups, in the hold under the road: two boost pads and an ammo strip (the reason to go under) ---- */
      const at=(u,Ar)=>{const f=clamp((u-S0.u0)/ds,0,n),j=Math.min(n-1,Math.floor(f)),q=f-j;return Ar[j]+(Ar[j+1]-Ar[j])*q},kD=S0.kC,nD=S0.nD;
      for(const fx of[0.12,0.55]){const a=k0+kD+Math.round(nD*fx),b=a+padLen;add(strip(LA(C(-2.4),C(0.03)),HA(C(-2.4),C(0.03)),LA(C(2.4),C(0.03)),HA(C(2.4),C(0.03)),{from:a,to:b,uv:1/12}),padM);
        pads.push({u0:a*ds,u1:b*ds,lat:0,latF:u=>at(u,F.c),sp:S0,b:S0.fB})}
      {const a=k0+kD+Math.round(nD*0.25),b=k0+kD+Math.round(nD*0.85),hw=sw/2,off=k=>s*(F.w[k]-hw-0.8);
        add(strip(LA(k=>off(k)-hw,C(0.035)),HA(k=>off(k)-hw,C(0.035)),LA(k=>off(k)+hw,C(0.035)),HA(k=>off(k)+hw,C(0.035)),{from:a,to:b,uv:1/6}),pM);
        zones.push({kind:'ammo',u0:a*ds,u1:b*ds,side:0,edge:eIn,lane:null,hw,laneF:u=>at(u,F.c)+s*(at(u,F.w)-hw-0.8),sp:S0,b:S0.fB,
          /* (for the map: where across the base road the lane is) */wF:u=>{const p=at(u,F.ph);return at(u,F.cw)+s*(at(u,F.w)-hw-0.8)*Math.cos(p)}})}}
    out.push(S0)}
  return out}

/* ---- the Spirit realm's rule round it (004o): the under route's keep-out in its own frame (its face and the space a
   frame rides in: 16 m over it is under the road there), and the sight lines from chase cameras riding it (12 m behind,
   4.5 m over it in its frame, three lines across) every 16 m, to its edges and middle 1 m over it every 20 m up to 300 m
   ahead (past the join, the road's), and from the road's cameras in the 300 m before the fork to it. ---- */
function flipKeep(ctx,addS,air,O){const{N,ds,P,R,U,splits}=ctx,V=THREE.Vector3;
  for(const S0 of splits){if(S0.kind!=='flip')continue;const F=S0.b[S0.fB];
    for(let k=0;k<=S0.n;k++){const i=(S0.i0+k)%N,fr=new V(),fu=new V(),p=flipPt(P[i],R[i],U[i],F,k,S0.side,0,0,new V(),fr,fu);addS(p,fr,fu,ctx.Tg[i],F.w[k],air[i]?O.jumpAbove:O.above)}}}
function flipWatch(ctx,O){const{N,ds,P,R,U,splits}=ctx,out=[],V=THREE.Vector3,q=new V(),hw=W/2;
  const st=Math.max(1,Math.round(O.camStep/ds)),tt=Math.max(1,Math.round(O.tgtStep/ds)),nT=Math.round(O.sight/O.tgtStep),back=Math.round(O.camBack/ds);
  for(const S0 of splits){if(S0.kind!=='flip')continue;const F=S0.b[S0.fB],n=S0.n,s=S0.side;
    /* a point at offset k of the route (before it: the road; past it: the road), l across, d over */
    const pt=(k,l,d)=>{const i=((S0.i0+k)%N+N)%N;if(k<0||k>n){q.copy(P[i]).addScaledVector(R[i],l).addScaledVector(U[i],d);return[q.x,q.y,q.z]}flipPt(P[i],R[i],U[i],F,k,s,l,d,q);return[q.x,q.y,q.z]};
    const wAt=k=>k<0||k>n?hw:F.w[k];
    for(let k=-Math.round(300/ds);k<=n;k+=st){const kc=k-back;for(const f of[-0.6,0,0.6]){const a=pt(kc,f*wAt(kc),O.camUp+1);
      for(let j=1;j<=nT;j++){const kt=k+j*tt;if(kt<0)continue;if(k<0&&kt>n)break;for(const g of[-1,0,1]){const b=pt(kt,g*wAt(kt),1);out.push([...a,...b])}}}}}
  return out}
