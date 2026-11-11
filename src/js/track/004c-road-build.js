//# track/004c-road-build.js: the road as drawn and raced: road, edges, walls, catch fences, split routes, boost pads, strips, signs, trim marks, gantries
/* Prototype 61: the second step of buildTrack: draws the road from rd (roadShape) into a new group and places what races
   use on it (pads, zones, marks, wall heights, catch fences, mag-lock). Returns them, the drawing helpers (strip, add,
   basis, the road's materials) and the road's bounds, for the scenery and T. */
function roadBuild(rd){const{seed,wk,cx,sp,LN,L,N,ds,P,R,U,Tg,Cs,Kn,kind,gap,spl,splits,feats,jumps,drops,gI0,r}=rd;
  const group=new THREE.Group();scene.add(group);
  function strip(latA,hA,latB,hB,o={}){
    const from=o.from||0,to=o.to==null?N:o.to,rows=to-from+1,uvS=o.uv||0;
    const pos=new Float32Array(rows*6),uv=new Float32Array(rows*4),col=o.col?new Float32Array(rows*6):null;
    for(let j=0;j<rows;j++){const i=from+j,k=i%N,p=P[k],rr=R[k],uu=U[k];
      for(let s=0;s<2;s++){const la=s?latB:latA,ha=s?hB:hA,lat=typeof la==='function'?la(i):la,h=typeof ha==='function'?ha(i):ha,q=(j*2+s)*3;
        pos[q]=p.x+rr.x*lat+uu.x*h;pos[q+1]=p.y+rr.y*lat+uu.y*h;pos[q+2]=p.z+rr.z*lat+uu.z*h;
        uv[(j*2+s)*2]=s;uv[(j*2+s)*2+1]=j*ds*uvS;
        if(col){const c=o.col(i);col[q]=c[0];col[q+1]=c[1];col[q+2]=c[2]}}}
    const idx=[];for(let j=0;j<rows-1;j++){const a=j*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(col)g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g}
  const add=(g,m)=>{const me=new THREE.Mesh(g,m);group.add(me);return me};
  // road, edges, walls and underside, drawn in runs that stop at jump gaps
  /* Complex tracks spend time upside down, away from the sun, so their road also glows faintly on its own. */
  const roadM=new THREE.MeshLambertMaterial(cx?{map:roadTex,emissive:0x5a5a5a,emissiveMap:roadTex,side:THREE.DoubleSide}:{map:roadTex});
  const edgeCol=i=>Math.floor(i*ds/5)%2?[1,.69,0]:[.35,.22,.02];
  const edgeM=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  const glass=new THREE.MeshBasicMaterial({color:0xffb000,transparent:true,opacity:.10,side:THREE.DoubleSide,depthWrite:false});
  const rail=new THREE.MeshBasicMaterial({color:0xffb000,side:THREE.DoubleSide});
  const dark=new THREE.MeshLambertMaterial({color:0x0e1015,side:THREE.DoubleSide});
  const skip=new Uint8Array(N);for(let i=0;i<N;i++)skip[i]=gap[i]||spl[i]?1:0;
  /* mag-lock: the drop down the middle of a spire, from just before the edge to the bottom of the pull-out */
  const mag=new Uint8Array(N);for(const d of drops){const a=Math.floor((d.u0-30)/ds),b=Math.ceil((d.u1+10)/ds);for(let k=a;k<=b;k++)mag[((k%N)+N)%N]=1}
  {const mM=new THREE.MeshBasicMaterial({map:magTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});let k=0;
    while(k<N){if(!mag[k]){k++;continue}let e=k;while(e<N&&mag[e])e++;for(const sd of[-1,1])add(strip(sd*(W/2-1.0),0.04,sd*(W/2-0.25),0.04,{from:k,to:e,uv:1/6}),mM);k=e}}
  const wallH=new Float32Array(N).fill(1.5);if(cx){const hot=new Uint8Array(N);for(let i=0;i<N;i++)if(Kn[i]<-0.0013&&!gap[i])hot[i]=1;
    /* group the crest samples into stretches; a stretch with a bend within 120 m gets tall walls, the rest only by chance */
    const wr0=rng((seed^0x3A11)>>>0),R0=Math.round(30/ds),R1=Math.round(60/ds),bendN=Math.round(120/ds);let i=0;
    while(i<N){if(!hot[i]){i++;continue}let j=i;while(j<N&&hot[j])j++;let bend=0;for(let d=-bendN;d<j-i+bendN;d++)bend=Math.max(bend,Math.abs(Cs[((i+d)%N+N)%N]));
      if(bend>0.006||wr0()<0.3)for(let q=i;q<j;q++)for(let d=-R1;d<=R1;d++){const k=((q+d)%N+N)%N,a=Math.abs(d),f=a<=R0?1:1-(a-R0)/(R1-R0);wallH[k]=Math.max(wallH[k],1.5+3.0*f*f*(3-2*f))}
      i=j}
    /* and every tight bend gets a tall wall, crest or not */
    for(let i=0;i<N;i++)if(Math.abs(Cs[i])>1/110&&!gap[i])wallH[i]=Math.max(wallH[i],3.2)}
  /* ---------- catch fences (Prototype 45) ----------
     Every jump has a tall fence each side, from its ramp over the gap and along the landing, so a frame the road bends
     away from in the air glances off it back onto the road instead of flying off the side. Eric fell off the far side
     of jumps that land on tight bends (NXQCA752C-R at 1.2 km, NXQC86160 at 0.3 km): leaving the lip at 145-160 m/s a
     frame flies 100-150 m, and it was 3-5 m up, over the old 2.9 m gap rails, when the road turned out from under it.
     The fence's top traces the flight of a frame leaving the lip at 1.2 times top speed, 2 m clear of it, so it reads as
     the jump's arc drawn in light. It runs until that frame is down (about 210 m from the lip) and eases into the road's
     own wall; it carries on over a jump that follows, ends just short of any other feature, split or spire drop, and
     stays 3 m under any road passing overhead. ctop is its top over the road (over the gap, over the centreline), 0
     where there is none; in a jump's air, physics holds a frame below it in, the way a wall holds one below its top. */
  const ctop=new Float32Array(N);
  {const ve=VMAX*1.2,cg=0.5*GRAV/(ve*ve),mg=2,xE=(0.1+Math.sqrt(0.01+4.8*cg))/(2*cg),rp=Math.round(24/ds),tl=Math.round(30/ds),wi=i=>((i%N)+N)%N,v=new THREE.Vector3(),
     env=(x,G)=>Math.max(0,1.2+0.1*x-cg*x*x-(x<G?gapC(x/G,G):0))+mg;
   const jf=feats.filter(f=>f.kind==='jump'),LL=N*ds,inJ=u=>jf.some(f=>(((u-f.u0+4)%LL)+LL)%LL<=f.u1-f.u0+8);
   /* Prototype 60: a new jump's fence traces a frame leaving its own lip at 1.45 times top speed (boosted frames reach 1.4
      times): its height and slope, down to the landing; none inside a split, whose walls hold a frame in at any height */
   const inJ2=u=>jumps.some(q=>q.kind&&u>=q.u0-32&&u<=q.u1+32),ve2=VMAX*1.45,cg2=0.5*GRAV/(ve2*ve2),env2=(x,j)=>Math.max(0,j.lipH+j.slope*x-cg2*x*x-(x<j.G?jC(j,x/j.G):0))+mg,xE2=j=>(j.slope+Math.sqrt(j.slope*j.slope+4*cg2*j.lipH))/(2*cg2);
   for(const j of jumps){if(j.sp)continue;const a=Math.round(j.u0/ds),fj=jf.find(f=>j.u0>=f.u0-2&&j.u0<=f.u1+2),xEj=j.kind?xE2(j):xE,envj=j.kind?x=>env2(x,j):x=>env(x,j.G);let e=a+Math.round(xEj/ds)+tl,fo=tl;
     /* it carries on over a jump that follows (that jump's own fence takes over) and stops short of anything else */
     for(let k=Math.ceil(Math.max(j.u0+j.G+14,fj?fj.u1+4:0)/ds);k<e;k++){const q=wi(k);if(spl[q]||mag[q]||(kind[q]||gap[q])&&!inJ(q*ds)&&!(j.kind&&inJ2(q*ds))){e=k-Math.round(4/ds);fo=Math.round(12/ds);break}}
     for(let k=a-rp;k<=e;k++){const q=wi(k),w=wallH[q];
       let t=k<a?w+(Math.max(w,envj(0))-w)*ss01((k-a+rp)/rp):w+(Math.max(w,envj(Math.min((k-a)*ds,xEj)))-w)*ss01((e-k)/fo);
       for(let o=0;o<N;o+=2){const dj=Math.min(Math.abs(o-q),N-Math.abs(o-q));if(dj<30/ds||gap[o])continue;v.subVectors(P[o],P[q]);if(v.lengthSq()>(W+t+6)**2)continue;
         const h=v.dot(U[q]);if(h>0&&h<t+3&&Math.abs(v.dot(R[q]))<W/2+3&&Math.abs(v.dot(Tg[q]))<4)t=Math.max(w,Math.min(t,h-3))}
       ctop[q]=Math.max(ctop[q],t)}}}
  const wh=i=>wallH[((i%N)+N)%N],wr=i=>wh(i)+0.18;
  for(const[a,b]of runsOf(skip,N)){const o={from:a,to:b};
    add(strip(-W/2,0,W/2,0,{...o,uv:1/24}),roadM);
    add(strip(-W/2-0.15,0.04,-W/2+0.45,0.04,{...o,col:edgeCol}),edgeM);add(strip(W/2-0.45,0.04,W/2+0.15,0.04,{...o,col:edgeCol}),edgeM);
    add(strip(-W/2,0,-W/2,wh,o),glass);add(strip(W/2,0,W/2,wh,o),glass);
    add(strip(-W/2,wh,-W/2,wr,o),rail);add(strip(W/2,wh,W/2,wr,o),rail);
    add(strip(-W/2,0,-W/2,-1.8,o),dark);add(strip(W/2,0,W/2,-1.8,o),dark);add(strip(-W/2,-1.8,W/2,-1.8,o),dark)}
  /* both routes of each split: road, edges, glass walls, rails and the underside, all following the route's line and height */
  const kRuns=(M,pred)=>{const out=[];let a=-1;for(let k=0;k<=M;k++){const p=pred(k);if(p&&a<0)a=k;if((!p||k===M)&&a>=0){const b=p?k:k-1;if(b>a)out.push([a,b]);a=-1}}return out};
  for(const S0 of splits){const k0=S0.i0,n=S0.n,A=S0.adj,ix=i=>Math.max(0,Math.min(n,i-k0)),o={from:k0,to:k0+n+1};
    S0.b.forEach((B,bi)=>{const O=S0.b[1-bi],c=i=>B.c[ix(i)],w=i=>B.w[ix(i)],h=i=>B.h[ix(i)],L=d=>i=>c(i)-w(i)+d,Rr=d=>i=>c(i)+w(i)+d,H=d=>i=>h(i)+d;
      /* Prototype 60: a route with a gap of its own (the trunk's drop) is drawn in runs either side of it */
      const gpq=k=>!!(B.gp&&B.gp[Math.min(n,k)]),oR=B.gp?kRuns(n+1,k=>!gpq(k)).map(([a,b2])=>({from:k0+a,to:k0+b2})):[o];
      for(const o of oR){add(strip(L(0),h,Rr(0),h,{...o,uv:1/24}),roadM);
      add(strip(L(-0.15),H(0.04),L(0.45),H(0.04),{...o,col:edgeCol}),edgeM);add(strip(Rr(-0.45),H(0.04),Rr(0.15),H(0.04),{...o,col:edgeCol}),edgeM)}
      const open=(k,right)=>{const q=Math.min(n,k);return!!(A&&O&&A[q]&&((O.c[q]>B.c[q])===right))};
      for(const right of[false,true]){const E=right?Rr:L;for(const[a,b2]of kRuns(n+1,k=>!open(k,right)&&!gpq(k))){const oo={from:k0+a,to:k0+b2};add(strip(E(0),h,E(0),H(1.5),oo),glass);add(strip(E(0),H(1.5),E(0),H(1.68),oo),rail)}}
      for(const o of oR){add(strip(L(0),h,L(0),H(-1.8),o),dark);add(strip(Rr(0),h,Rr(0),H(-1.8),o),dark);add(strip(L(0),H(-1.8),Rr(0),H(-1.8),o),dark)}});
    if(A&&S0.b.length===2){const[b0,b1]=S0.b,lr=i=>{const q=ix(i);return b0.c[q]<b1.c[q]?[b0,b1,q]:[b1,b0,q]};
      const la=i=>{const[l,,q]=lr(i);return l.c[q]+l.w[q]},lb=i=>{const[,r2,q]=lr(i);return Math.max(la(i),r2.c[q]-r2.w[q])},ha=i=>{const[l,,q]=lr(i);return l.h[q]},hb=i=>{const[,r2,q]=lr(i);return r2.h[q]};
      for(const[a,b2]of kRuns(n,k=>!!A[k]))add(strip(la,ha,lb,hb,{from:k0+a,to:k0+b2,uv:1/24}),roadM)}}
  add(strip(-W/2,0.02,W/2,0.02,{from:0,to:Math.ceil(3/ds),uv:1/3}),new THREE.MeshBasicMaterial({map:checkTex}));
  const clear=(i0,n)=>{for(let j=0;j<=n;j++){const k=(i0+j)%N;if(kind[k]||gap[k]||spl[k])return false}return true};
  const findGentle=f=>{let i0=Math.floor(N*f);for(let t=0;t<260&&(Math.abs(Cs[i0%N])>0.003||!clear(i0,Math.round(14/ds)));t++)i0+=3;return i0%N};
  const basis=(i)=>{const m=new THREE.Matrix4().makeBasis(R[i],U[i],Tg[i].clone().negate());return new THREE.Quaternion().setFromRotationMatrix(m)};
  const pads=[],padM=new THREE.MeshBasicMaterial({map:padTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const padLen=Math.round(12/ds);
  if(sp&&sp.quick)for(const[u,c,k,g]of QK_T[sp.quick].pads||[])for(let j=0;j<(k||1);j++){const i0=Math.round((u+j*(g||40))/ds),cc=Array.isArray(c)?c[j]:c;if(i0+padLen>=N)continue;
    add(strip(cc-2.4,0.03,cc+2.4,0.03,{from:i0,to:i0+padLen,uv:1/12}),padM);pads.push({u0:i0*ds,u1:(i0+padLen)*ds,lat:cc})}
  else for(const f of[0.11,0.31,0.53,0.71]){const i0=findGentle(f);if(i0+padLen>=N)continue;
    const c=(r()-.5)*W*0.3;add(strip(c-2.4,0.03,c+2.4,0.03,{from:i0,to:i0+padLen,uv:1/12}),padM);pads.push({u0:i0*ds,u1:(i0+padLen)*ds,lat:c})}
  // energy strips: green along both edges for the last stretch of every lap; purple at random spots, some on an edge and some in a lane in the middle of the road
  const zones=[],sw=1.3+W*0.16,eIn=W/2-0.55-sw,eOut=W/2-0.55,sMat=tex=>new THREE.MeshBasicMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const gM=sMat(greenTex),pM=sMat(purpleTex),gi0=gI0,gi1=N-Math.ceil(28/ds);
  const edgeStrip=(side,i0,i1,m)=>add(strip(side<0?-eOut:eIn,0.035,side<0?-eIn:eOut,0.035,{from:i0,to:i1,uv:1/6}),m);
  /* a quick track places its own: green along both edges (hp), purple in a lane (a number, its centre) or on an edge (L or R) */
  if(sp&&sp.quick){const q=QK_T[sp.quick],I=u=>clamp(Math.round(u/ds),0,N-1);
    if(q.hp){const a=I(q.hp[0]),b=I(q.hp[1]);edgeStrip(-1,a,b,gM);edgeStrip(1,a,b,gM);zones.push({kind:'hp',u0:a*ds,u1:b*ds,side:0,edge:eIn})}
    for(const[u0,u1,c]of q.am||[]){const a=I(u0),b=I(u1);if(typeof c==='number'){const hw=sw/2;add(strip(c-hw,0.035,c+hw,0.035,{from:a,to:b,uv:1/6}),pM);zones.push({kind:'ammo',u0:a*ds,u1:b*ds,side:0,edge:eIn,lane:c,hw})}
      else{const side=c==='L'?-1:1;edgeStrip(side,a,b,pM);zones.push({kind:'ammo',u0:a*ds,u1:b*ds,side,edge:eIn})}}}
  else{edgeStrip(-1,gi0,gi1,gM);edgeStrip(1,gi0,gi1,gM);zones.push({kind:'hp',u0:gi0*ds,u1:gi1*ds,side:0,edge:eIn});
  const nEdge=Math.max(2,Math.round(({W:4,S:4,N:3}[wk]||4)*LN.f)),nLane=Math.max(1,Math.round(3*LN.f)),gapF=0.075/LN.f,used=[];
  for(let k=0;k<nEdge+nLane;k++){let f,i0,len,tries=0;const lane=k>=nEdge;
    do{f=k===0?0.06+r()*0.06:0.05+r()*0.74;i0=Math.floor(N*f);len=Math.round((68+r()*52)/ds);tries++}while(tries<80&&(used.some(x=>Math.abs(x-f)<gapF)||!clear(i0,len)));
    used.push(f);const i1=Math.min(i0+len,gi0-5),side=r()<0.5?-1:1;if(i1<=i0+4||!clear(i0,i1-i0))continue;
    if(lane){const c=(r()-.5)*W*0.4,hw=sw/2;add(strip(c-hw,0.035,c+hw,0.035,{from:i0,to:i1,uv:1/6}),pM);zones.push({kind:'ammo',u0:i0*ds,u1:i1*ds,side:0,edge:eIn,lane:c,hw})}
    else{edgeStrip(side,i0,i1,pM);zones.push({kind:'ammo',u0:i0*ds,u1:i1*ds,side,edge:eIn})}}}
  /* the long route's pickups: two boost pads, an ammo strip on the outside and a shield strip on the inside */
  for(const S0 of splits){const B=S0.b[S0.longB],k0=S0.i0,at=(u,A)=>{const f=clamp((u-S0.u0)/ds,0,S0.n),j=Math.min(S0.n-1,Math.floor(f)),q=f-j;return A[j]+(A[j+1]-A[j])*q};
    if(S0.kind==='cut'){for(const fx of[0.2,0.55]){const a=k0+Math.round(S0.n*fx),b=a+padLen;add(strip(i=>B.c[i-k0]-2.4,i=>B.h[i-k0]+0.03,i=>B.c[i-k0]+2.4,i=>B.h[i-k0]+0.03,{from:a,to:b,uv:1/12}),padM);pads.push({u0:a*ds,u1:b*ds,lat:0,latF:u=>at(u,B.c),sp:S0,b:S0.longB})}continue}
    /* Prototype 60: the long jump's catch road has none; a speed jump's bonus road two boost pads and an ammo strip once the roads part */
    if(S0.kind==='catch')continue;
    if(S0.kind==='stack'){for(const fx of[0.4,0.6]){const a=k0+Math.round(S0.n*fx),b=a+padLen;add(strip(i=>B.c[i-k0]-2.4,i=>B.h[i-k0]+0.03,i=>B.c[i-k0]+2.4,i=>B.h[i-k0]+0.03,{from:a,to:b,uv:1/12}),padM);pads.push({u0:a*ds,u1:b*ds,lat:0,latF:u=>at(u,B.c),sp:S0,b:S0.longB})}
      {const a=k0+Math.round(S0.n*0.66),b=k0+Math.round(S0.n*0.84),hw=sw/2,sd=S0.longB===S0.upB?1:-1,off=i=>B.c[i-k0]+sd*S0.side*(B.w[i-k0]-hw-0.8);
        add(strip(i=>off(i)-hw,i=>B.h[i-k0]+0.035,i=>off(i)+hw,i=>B.h[i-k0]+0.035,{from:a,to:b,uv:1/6}),pM);
        zones.push({kind:'ammo',u0:a*ds,u1:b*ds,side:0,edge:eIn,lane:null,hw,laneF:u=>at(u,B.c)+sd*S0.side*(at(u,B.w)-hw-0.8),sp:S0,b:S0.longB})}continue}
    if(S0.kind==='pit'){const hw=B.w[0]-0.7;for(const[f0,f1,kz,mm]of[[0.2,0.49,'hp',gM],[0.51,0.8,'ammo',pM]]){const a=k0+Math.round(S0.n*f0),b=k0+Math.round(S0.n*f1);
        add(strip(i=>B.c[i-k0]-hw,i=>B.h[i-k0]+0.035,i=>B.c[i-k0]+hw,i=>B.h[i-k0]+0.035,{from:a,to:b,uv:1/6}),mm);zones.push({kind:kz,u0:a*ds,u1:b*ds,side:0,edge:eIn,lane:null,hw,laneF:u=>at(u,B.c),sp:S0,b:S0.longB,rate:2.5})}continue}
    for(const fx of[0.3,0.68]){const a=k0+Math.round(S0.n*fx),b=a+padLen;add(strip(i=>B.c[i-k0]-2.4,i=>B.h[i-k0]+0.03,i=>B.c[i-k0]+2.4,i=>B.h[i-k0]+0.03,{from:a,to:b,uv:1/12}),padM);pads.push({u0:a*ds,u1:b*ds,lat:0,latF:u=>at(u,B.c),sp:S0,b:S0.longB})}
    const lane=(f0,f1,sd,kz,m)=>{const a=k0+Math.round(S0.n*f0),b=k0+Math.round(S0.n*f1),hw=sw/2,off=i=>B.c[i-k0]+sd*S0.side*(B.w[i-k0]-hw-0.8);
      add(strip(i=>off(i)-hw,i=>B.h[i-k0]+0.035,i=>off(i)+hw,i=>B.h[i-k0]+0.035,{from:a,to:b,uv:1/6}),m);
      zones.push({kind:kz,u0:a*ds,u1:b*ds,side:0,edge:eIn,lane:null,hw,laneF:u=>at(u,B.c)+sd*S0.side*(at(u,B.w)-hw-0.8),sp:S0,b:S0.longB})};
    lane(0.36,0.56,1,'ammo',pM);lane(0.6,0.8,-1,'hp',gM)}
  /* split signs over the road: what each side holds, and how far to go */
  /* Where an overhead sign or gantry may stand (Prototype 33): plain road, with no loop, twist, corkscrew, helix, spire,
     jump or split within 8 m either side (inside a split the main road isn't drawn), off the start grid, banked at most bk
     (|right.y|) and with up.y at least uy, and no other road through it. */
  const standOK=(i,SW,top,bk,uy)=>{const u=i*ds;if(u>L-60||u<20)return false;const fp=Math.max(1,Math.round(8/ds)),v=new THREE.Vector3(),q=new THREE.Vector3();
    for(let k=i-fp;k<=i+fp;k++){const kk=((k%N)+N)%N;if(spl[kk]||gap[kk]||kind[kk]||ctop[kk]>0||Math.abs(R[kk].y)>bk||U[kk].y<uy)return false}
    const hit=p=>{v.subVectors(p,P[i]);const la=v.dot(R[i]),h=v.dot(U[i]),al=v.dot(Tg[i]);return Math.abs(la)<SW/2+1.5&&h>-0.5&&h<top+2&&Math.abs(al)<5};
    for(let j=0;j<N;j+=2){const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<30/ds||gap[j]||spl[j])continue;if(P[j].distanceToSquared(P[i])>(SW+top+W)**2)continue;for(const la of[-W/2,0,W/2])if(hit(q.copy(P[j]).addScaledVector(R[j],la)))return false}
    for(const S1 of splits)for(const p of S1.pts)if(hit(p))return false;
    return true};
  /* Each split sign stands where standOK allows, banked at most about 15 degrees and sloped at most about 28. It moves
     nearer or further to find such a spot (500 m: 350-700, 250 m: 150-340, 80 m: 60-110; the panel gives the real
     distance) and is left out if there is none. Before, about 1 track in 5 had a sign upside down in a loop, on its side
     in a corkscrew or standing in another split's routes. */
  const signI=[],signAt=(S0,ahead,SW,top,off=0)=>{const[d0,d1]={500:[350,700],250:[150,340],80:[60,110]}[ahead],dd=[];for(let d=d0;d<=d1;d+=10)dd.push(d);dd.sort((a,b)=>Math.abs(a-ahead)-Math.abs(b-ahead));
    for(const d of dd){const i=((S0.i0-Math.round((d+off)/ds))%N+N)%N;if(standOK(i,SW,top,0.26,0.88)){signI.push(i);return{i,d}}}
    return null};
  for(const S0 of splits)for(const ahead of[500,250,80]){if(S0.kind==='cut'||S0.kind==='catch'||S0.kind==='dsplit')break;
    /* Prototype 60: a speed jump gets the signs too, about 500 and 250 m before its lip, saying which road holds the bonus */
    if(S0.kind==='stack'&&ahead===80)break;const stk=S0.kind==='stack';const SW=W+3.1,SH=SW*340/1024,top=7.2+SH,at=signAt(S0,ahead,SW,top,stk?150:0);if(!at)continue;
    const pit=S0.kind==='pit',i=at.i,g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0xffb000});
    for(const sd of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(0.7,top,0.7),m);pl.position.set(sd*(W/2+1.2),top/2,0);g.add(pl)}
    const cv=document.createElement('canvas');cv.width=1024;cv.height=340;const cg=cv.getContext('2d');cg.fillStyle='#0b0e14';cg.fillRect(0,0,1024,340);cg.strokeStyle='#ffb000';cg.lineWidth=8;cg.strokeRect(4,4,1016,332);
    cg.fillStyle='#ffb000';cg.fillRect(4,4,1016,62);cg.fillStyle='#0b0e14';cg.textBaseline='middle';cg.textAlign='center';cg.font="700 44px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillText((stk?'SPEED JUMP · ':pit?'PIT LANE · ':S0.cross?'CROSSOVER · ':'ROAD SPLITS · ')+at.d+' M',512,37);
    cg.beginPath();cg.moveTo(512,92);cg.lineTo(512,316);cg.strokeStyle='#ffb000';cg.lineWidth=4;cg.stroke();
    const lL=S0.side<0,side=(x,long,arrow)=>{cg.textAlign=x<512?'left':'right';const x0=x<512?34:990;
      cg.fillStyle=long?'#46ff8c':'#ffb000';cg.font="700 96px 'Chakra Petch','Arial Narrow',sans-serif";const nm=pit?(long?'PIT':'RACE'):(long?'LONG':'SHORT');cg.fillText(arrow&&x<512?'◀ '+nm:nm+' ▶',x0,150);
      cg.font="700 40px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillStyle='#f2efe6';
      if(pit){if(long){cg.fillText('FULL REPAIR',x0,230);cg.fillText('AMMO · LIMITER',x0,282)}else cg.fillText('KEEP RACING',x0,230)}
      else if(long){cg.fillText('2 BOOST PADS',x0,230);cg.fillText('AMMO · SHIELD',x0,282)}else{cg.fillText('TIGHT LINE',x0,230);cg.fillText('NO PICKUPS',x0,282)}};
    if(stk){const half=(x,up)=>{cg.textAlign=x<512?'left':'right';const x0=x<512?34:990,bon=(S0.bonus==='up')===up;cg.fillStyle=bon?'#46ff8c':'#ffb000';cg.font="700 96px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillText(up?'▲ UPPER':'LOWER ▼',x0,150);
        cg.font="700 40px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillStyle='#f2efe6';cg.fillText(up?'172 M/S AT THE LIP':'EVERYONE ELSE',x0,230);cg.fillText(bon?'2 BOOST PADS · AMMO':'NO PICKUPS',x0,282)};half(0,true);half(1024,false)}
    else{side(0,lL,true);side(1024,!lL,true)}
    const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;const pan=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),new THREE.MeshBasicMaterial({map:tx}));pan.position.set(0,7.2+SH/2,0);g.add(pan);
    /* a light bar under the sign so it reads from far off */
    const bar=new THREE.Mesh(new THREE.BoxGeometry(SW,0.22,0.3),new THREE.MeshBasicMaterial({color:0xffd27a}));bar.position.set(0,7.05,0);g.add(bar);
    g.position.copy(P[i]);g.quaternion.copy(basis(i));group.add(g)}
  // jump ramps: amber chevrons on the lip, a white line where the road ends
  const jM=new THREE.MeshBasicMaterial({map:jumpTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  /* catch fences (ctop, above), in the walls' style: amber glass (fainter than the wall's, it is taller) leaning out a
     little (a shallow U), the wall's amber rail along its top, dark posts every 12 m and at the lip and the landing; over the gap the glass reaches down to a
     rail at the road's line */
  {const railM=rail,fG=new THREE.MeshBasicMaterial({color:0xffb000,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false}),postM=new THREE.MeshLambertMaterial({color:0x2a2e36});
   const fl=0.12,w0=W/2+0.05,c=i=>ctop[i%N],bot=i=>gap[i%N]?-0.3:wallH[i%N]+0.18,runs=[],posts=[],pE=Math.round(12/ds);
   let k0=0;while(k0<N&&ctop[k0]>0)k0++;
   for(let k=k0;k<k0+N;k++){if(!(ctop[k%N]>0))continue;let e=k;while(e<k0+N&&ctop[e%N]>0)e++;runs.push([k,e-1]);k=e}
   for(const[a,b]of runs){
     for(const sd of[-1,1]){const L=h=>sd*(w0+fl*h);
       add(strip(i=>L(bot(i)),bot,i=>L(c(i)),c,{from:a,to:b}),fG);add(strip(i=>L(c(i)),c,i=>L(c(i)+0.2),i=>c(i)+0.2,{from:a,to:b}),railM)}
     for(let k=a;k<=b;k++){const q=k%N;if(gap[q]){let e=k;while(e<=b&&gap[e%N])e++;for(const sd of[-1,1]){const L=h=>sd*(w0+fl*h);add(strip(L(-0.3),-0.3,L(-0.1),-0.1,{from:k-1,to:e}),railM)}k=e-1;continue}
       if((k-a)%pE===0||gap[(q+1)%N]||gap[(q+N-1)%N])posts.push(q)}}
   if(posts.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,1,0.22),postM,posts.length*2),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),A=new THREE.Vector3(),B=new THREE.Vector3(),D=new THREE.Vector3(),Sc=new THREE.Vector3();let n=0;
     for(const q of posts)for(const sd of[-1,1]){const t=ctop[q]+0.2;A.copy(P[q]).addScaledVector(R[q],sd*w0);B.copy(A).addScaledVector(R[q],sd*fl*t).addScaledVector(U[q],t);D.subVectors(B,A);const ln=D.length();
       Q.setFromUnitVectors(Y,D.divideScalar(ln));A.add(B).multiplyScalar(0.5);M.compose(A,Q,Sc.set(1,ln,1));im.setMatrixAt(n++,M)}
     im.frustumCulled=false;group.add(im)}}
  for(const j of jumps){const i1=Math.round(j.u0/ds),i0=Math.max(0,i1-Math.round(18/ds));add(strip(-W/2+0.6,0.045,W/2-0.6,0.045,{from:i0,to:i1,uv:1/9}),jM);
    const lip=Math.max(0,i1-1);add(strip(-W/2,0.06,W/2,0.06,{from:lip,to:i1}),new THREE.MeshBasicMaterial({color:0xf2efe6}))}
  /* Trim markings, painted ahead of what's coming so there's time to set the nose: amber bars before dips,
     compressions and loops (level out, or the nose scrapes), grey Λ before tight corners (lift it for grip), green V at
     the start of long straights and before crests (dive: faster, and it keeps you on the road over the top). Three
     chevrons a group; level beats grip beats dive where they would crowd each other. */
  const marks=[];{const wrap=i=>((i%N)+N)%N,m2i=m=>Math.round(m/ds),hw=Math.min(W*0.26,eIn-0.3),len=m2i(9);
    const blocked=i=>{const k=wrap(i),u=k*ds;if(gap[k]||spl[k]||u<14||u>N*ds-10)return true;for(const f of feats)if(f.kind==='spire'&&u>f.u0-30&&u<f.u1+30)return true;
      for(const p of pads)if(u>p.u0-6&&u<p.u1+6)return true;for(const j of jumps)if(u>j.u0-24&&u<j.u1+6)return true;
      for(const z of zones)if(z.lane!=null&&!z.laneF&&u>z.u0-4&&u<z.u1+4)return true;return false};
    const runs=(test,minGap)=>{const out=[];let last=-1e9,inZ=false;for(let i=0;i<N;i++){const t=test(i);if(t&&!inZ&&i-last>m2i(minGap))out.push(i);if(t)last=i;inZ=t}return out};
    const cand=[],slopeRuns=sg=>{const out=[];let i0=-1;for(let i=0;i<=N;i++){const on=i<N&&sg*Tg[i].y>0.07&&!kind[i];if(on&&i0<0)i0=i;if(!on&&i0>=0){if((i-i0)*ds>=60)out.push(i0);i0=-1}}return out};
    for(const i of slopeRuns(1))cand.push({type:'up',pri:3,at:[-26,0,26].map(d=>i+m2i(d))});
    for(const i of slopeRuns(-1))cand.push({type:'dive',pri:3,at:[-26,0,26].map(d=>i+m2i(d))});
    for(const i of runs(i=>Math.abs(Cs[i])>0.0085&&!kind[i],40))cand.push({type:'grip',pri:2,at:[-90,-62,-34].map(d=>i+m2i(d))});
    cand.sort((a,b)=>b.pri-a.pri);
    for(const c of cand){const lo=Math.min(...c.at),hi=Math.max(...c.at)+len;if(c.at.some(i=>blocked(i)||blocked(i+len)))continue;
      if(marks.some(m=>lo<m.hi+m2i(40)&&hi>m.lo-m2i(40)))continue;marks.push({...c,lo,hi})}
    const paint=(type,tex)=>{const pos=[],uv=[],idx=[];
      for(const mk of marks)if(mk.type===type)for(const i0 of mk.at){const b=pos.length/3;
        for(let j=0;j<=len;j++){const k=wrap(i0+j),p=P[k],rr=R[k],uu=U[k];for(const sd of[0,1]){const la=sd?hw:-hw;pos.push(p.x+rr.x*la+uu.x*0.05,p.y+rr.y*la+uu.y*0.05,p.z+rr.z*la+uu.z*0.05);uv.push(sd,j/len)}}
        for(let j=0;j<len;j++){const a=b+j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
      if(!idx.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
      add(g,new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}))};
    paint('dive',diveTex);paint('up',gripTex);paint('grip',gripTex)}

  /* Gantries: the white one on the start line, then one about every fifth of the lap, at the first spot from there where
     standOK allows (banked no more than the road's own bends), or failing that a little before it, 30 m clear of the split
     signs; none if there is no such spot. Before, the search gave up after 800 m, so on a long helix or spire the gantry
     stood in it, sometimes nearly on its side (Prototype 33). */
  const gantI=[0],gOK=i=>standOK(i,W+3.1,8.6,0.5,0.85)&&signI.every(q=>Math.min(Math.abs(q-i),N-Math.abs(q-i))>30/ds);
  for(let k=1;k<5;k++){const i0=Math.floor(N*k/5);let i=-1;for(let d=0;d<Math.floor(N/5)&&i<0;d++)if(gOK(i0+d))i=i0+d;for(let d=1;d<Math.floor(N/10)&&i<0;d++)if(gOK(i0-d))i=i0-d;if(i>=0)gantI.push(i)}
  for(let k=0;k<gantI.length;k++){const i=gantI[k],g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:k?0xffb000:0xf2efe6});
    for(const s of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(0.7,8,0.7),m);pl.position.set(s*(W/2+1.2),4,0);g.add(pl)}
    const beam=new THREE.Mesh(new THREE.BoxGeometry(W+3.1,k?0.6:1.4,0.7),m);beam.position.set(0,8,0);g.add(beam);
    g.position.copy(P[i]);g.quaternion.copy(basis(i));group.add(g)}

  let minY=1e9,maxY=-1e9,minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;for(const p of P){minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z)}
  return{group,strip,add,basis,dark,roadM,edgeM,glass,rail,mag,wallH,ctop,pads,zones,marks,signI,gantI,minX,maxX,minY,maxY,minZ,maxZ}}
