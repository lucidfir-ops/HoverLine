//# track/004s-portals.js: the Spirit realm's portal jump (Prototype 63): its road (a break in the centreline: the entrance on the main road, the exit beside and before it, a ramp, a jump over the main road, a catch road that turns and rejoins), the crossing helpers (sampleAt, cameras), the rings, discs, knots and signs, the view through the portal, the minimap's link
/* Prototype 63: Eric's portal jump ("on a straight ahead you drive straight into a portal, the portal exit is to the right
   of the portal entrance and some distance before it, and it exits straight into a ramp that creates a jump over the
   track and lands on the other side"), dossier items 49 (the exit facing across the road) and 50 (facing 45 degrees
   forward-left), designed in docs/spirit-p62/PORTALS.md. Spirit tracks only (codes ending -S).

   The road: the centreline has a break. Sample k (T.brk[k]) is the last before the entrance E; sample k+1 is the first
   after the exit X, somewhere else. Distance along the track (u) runs straight through: E and X are the same u (uE), so
   a racer's u, lap, place, lat, height and speed carry over and only its world position jumps. The break has no length
   in u. Everything that steps from sample to sample treats k as an end of road (tangents and curvature are one-sided,
   sampleAt never lerps across, the road and its walls are drawn in two runs), and a camera that crosses is carried by the
   portal's transform M (the entrance's frame to the exit's), so the picture is continuous.

   Geometry (in the entrance's frame: forward along the main road, right, up; all numbers per width in portalDims):
   - 49, across: the exit 62/56/51 m right (Wide/Standard/Narrow) and B = 27/24/21.5 m before E, 19 m over the main road,
     facing left. A 30 m ramp rises 2 m to the lip, W+6 m right of the main centreline (so the ramp is clear of the main
     road's keep-out), then a 130 m gap (the flight over the main road, 21 m over it), a 230 m catch road 4 m under the
     main road's level (half as wide again at first), a 110 degree turn back (radius 170 m) and a smooth join onto the
     main road's line 250-1300 m past E.
   - 50, diagonal: the same pieces, facing 45 degrees forward-left; the flight crosses the main centreline Bc = 64/56/50 m
     before E (so the flight and its keep-out pass clear of the entrance ring), and the turn back is 65 degrees.
   Why so close (the dossier had the exit 120 m back): a racer g seconds behind the leader at speed v is v*g metres back
   when the leader enters E; the leader crosses over the main road (B + ramp + lip offset) metres later, and the follower
   sees it ahead only while it is still short of the crossing line. So the follower sees the leader cross ahead when
   v*g > B + 30 + (W+6) + ~40 m (to see it in front, not overhead): at 150 m/s about 0.85 s on 49 (round 2's 120 m back
   needed 1.5-2.3 s). Moving the exit further back makes it worse, not better. A longer flight (the lip 25 m over the
   catch road: about 1.5 s at 94 m/s, 1.8 s at 150, as the long jump) keeps the leaders in the air for longer.
   - A launch pad on the ramp (the physics' jump floor, as speed and long jumps): anyone under the speed that clears the
     gap leaves the lip at it (94 m/s), so nobody falls short. */
const PORT_O={La:360,Bl:150,Lr:30,Hr:2,hX:19,hLand:-4,G:130,Lc:230,Ra:170,thP:110*Math.PI/180,thD:65*Math.PI/180,j0:250,j1:1300};
function portalDims(w){const m=SPC_O.margin,ringR=Math.hypot(w/2+m,(SPC_O.above+SPC_O.below)/2)+5,hc=(SPC_O.above-SPC_O.below)/2;
  return{ringR,hc,Lp:w+6,B:w/2+m+8,Bc:Math.ceil(ringR+12+(w/2+7)*Math.SQRT2)}}
/* a portal site (addFeatures): the variant (49 or 50) and side are drawn here; len is the approach, foot what it takes of
   the base line (the join comes back onto it up to 1.3 km past the entrance), cf the stretch that must be straight */
function portalSite(s,r){s.pv=r()<0.5?'p':'d';s.sd=1;s.len=PORT_O.La;s.cf=PORT_O.La+40;s.foot=PORT_O.La+PORT_O.j1+60}
/* only where the base line runs straight and nearly level for the approach: under 0.1 slope, no bend tighter than
   220 m, and the straight line from its start to the entrance never more than 45 m off the base line */
function portalCheck(st,b){const{P,Cs,N,ds}=b,n=Math.round(PORT_O.La/ds),i0=st.i,why=k=>{st.skip=true;st.why=k};if(i0+n+Math.round(PORT_O.j1/ds)>=N)return why('end');
  const A=P[i0],B=P[i0+n],dx=B.x-A.x,dz=B.z-A.z,L0=Math.hypot(dx,dz)||1;if(Math.abs(B.y-A.y)/L0>0.1)return why('slope');
  let cm=0,dm=0;for(let j=0;j<=n;j+=2){const q=P[i0+j],t=j/n;cm=Math.max(cm,Math.abs(Cs[i0+j]));dm=Math.max(dm,Math.hypot(A.x+dx*t-q.x,A.z+dz*t-q.z))}
  if(cm>1/220)why('bend '+Math.round(1/cm));else if(dm>45)why('off '+Math.round(dm))}
/* the portal's road from base sample i (addFeatures' emit loop): the approach straightened onto the line from i to the
   entrance, the break, the exit road; it returns the base sample the join came back to. c: {P,U,N,ds,i,site,emit,marks,
   oP,RH,shiftAt,liftAt,upAt,joinScore,joinEmit,W} */
function portalEmit(c){const{P,N,ds,site:st,emit,marks,oP}=c,V=THREE.Vector3,Y=new V(0,1,0),O=PORT_O,D=portalDims(c.W),n=Math.round(O.La/ds),i=c.i,start=oP.length;
  const bp=[],bu=[];for(let j=0;j<=n;j++){const q=i+j;bp.push(P[q].clone().addScaledVector(c.RH(q),c.shiftAt()).addScaledVector(Y,c.liftAt()));bu.push(c.upAt(q))}
  const A=bp[0],E=bp[n].clone(),diag=st.pv==='d',zC=diag?D.Bc:D.B,kb=Math.max(0,n-Math.round((zC+(diag?D.Lp:0)+60)/ds));
  for(let j=0;j<=n;j++){const w=ss01(j*ds/O.Bl),ln=A.clone().lerp(E,j/n);if(j===kb)marks.push({kind:'pkind0',a:oP.length});emit(bp[j].clone().lerp(ln,w),bu[j].clone().lerp(Y,w).normalize())}
  const Fe=E.clone().sub(A).normalize(),Fh=new V(Fe.x,0,Fe.z).normalize(),Rt=new V().crossVectors(Fh,Y).normalize(),s=Fe.y/Math.max(0.2,Math.hypot(Fe.x,Fe.z)),sd=st.sd,
    dirD=diag?Rt.clone().multiplyScalar(-sd).add(Fh).normalize():Rt.clone().multiplyScalar(-sd),yC=E.y-s*zC,
    L0=E.clone().addScaledVector(Fh,diag?-zC-D.Lp:-zC).addScaledVector(Rt,sd*D.Lp),X=L0.clone().addScaledVector(dirD,-O.Lr),
    sl=2*O.Hr/O.Lr,hLip=O.hX+O.Hr,J={lipH:hLip-O.hLand,slope:sl,G:O.G,kind:'portal'};
  L0.y=X.y=0;const aE=oP.length-1;
  /* the exit road: ramp, gap (the hidden line under the flight), catch, the turn back towards the main line */
  const at=(t,y)=>L0.clone().addScaledVector(dirD,t).setY(yC+y);
  for(let t=-O.Lr;t<0;t+=ds)emit(at(t,O.hX+O.Hr*((t+O.Lr)/O.Lr)**2),Y.clone());
  marks.push({kind:'lip2',a:oP.length,d:J});for(let t=0;t<O.G;t+=ds)emit(at(t,O.hLand+jC(J,t/O.G)),Y.clone());
  marks.push({kind:'land2',a:oP.length,d:J});for(let t=O.G;t<O.G+O.Lc;t+=ds)emit(at(t,O.hLand),Y.clone());
  const Q0=at(O.G+O.Lc,O.hLand),nrm=Fh.clone().addScaledVector(dirD,-Fh.dot(dirD)).normalize(),th=diag?O.thD:O.thP,Cc=Q0.clone().addScaledVector(nrm,O.Ra),nA=Math.ceil(th*O.Ra/ds);
  for(let k=0;k<nA;k++){const f=th*k/nA;emit(Cc.clone().addScaledVector(nrm,-O.Ra*Math.cos(f)).addScaledVector(dirD,O.Ra*Math.sin(f)),Y.clone())}
  const q=Cc.clone().addScaledVector(nrm,-O.Ra*Math.cos(th)).addScaledVector(dirD,O.Ra*Math.sin(th)),hq=dirD.clone().multiplyScalar(Math.cos(th)).addScaledVector(nrm,Math.sin(th)).normalize();
  marks.push({kind:'pkind1',a:oP.length});
  const iE=i+n;let bj=c.joinScore(q,hq,iE+Math.round(O.j0/ds),Math.min(N-1,iE+Math.round(O.j1/ds)));if(bj<0)bj=Math.min(N-1,iE+Math.round(O.j1/ds));c.joinEmit(q,hq,bj);
  marks.push({kind:'pbrk',a:aE,d:{pv:st.pv,sd,E:E.clone(),Fe:Fe.clone(),X:X.clone().setY(yC+O.hX),Fx:dirD.clone(),yC,s,ringR:D.ringR,hc:D.hc,zC,Lp:D.Lp}});
  marks.push({kind:'portal',a:start,b:oP.length,data:{pv:st.pv,side:sd,Lc:O.Lc+0.6*th*O.Ra}});
  return bj}
/* the resampled break: k, the share of the step before E (aE), and the two frames and the transform E to X, M (with
   its turn Q) and back */
function portalFrames(d,uE,ds2,N2){const V=THREE.Vector3,Y=new V(0,1,0),k=Math.floor(uE/ds2+1e-9)%N2,o={k,aE:(uE-k*ds2)/ds2,uE,pv:d.pv,sd:d.sd,ringR:d.ringR,hc:d.hc,E:d.E,X:d.X,yC:d.yC,zC:d.zC,Lp:d.Lp};
  const fr=(p,f)=>{const r=new V().crossVectors(f,Y).normalize(),u=new V().crossVectors(r,f).normalize();return new THREE.Matrix4().makeBasis(r,u,f.clone().negate()).setPosition(p)};
  o.Fe=d.Fe.clone();o.Fx=d.Fx.clone();o.ME=fr(d.E,d.Fe);o.MX=fr(d.X,d.Fx);o.M=o.MX.clone().multiply(o.ME.clone().invert());o.Mi=o.M.clone().invert();
  o.Q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(o.M));return o}
/* does a sight line carried through portal o (a: the carried camera, b: beyond the exit) pass through the exit's opening?
   (a line that would pass outside the ring is not seen through the portal: past the entrance's rim it sees the world) */
function portalThrough(o,ax,ay,az,bx,by,bz){const F=o.Fx,c=o.Xc||(o.Xc=new THREE.Vector3(0,o.hc,0).applyMatrix4(o.MX)),da=(ax-c.x)*F.x+(ay-c.y)*F.y+(az-c.z)*F.z,db=(bx-c.x)*F.x+(by-c.y)*F.y+(bz-c.z)*F.z;
  if(da>0||db<0)return da<=0&&db<=0?false:true;const f=da/(da-db),x=ax+(bx-ax)*f-c.x,y=ay+(by-ay)*f-c.y,z=az+(bz-az)*f-c.z;return x*x+y*y+z*z<(o.ringR-0.6)**2}
/* the portal whose entrance a move from u0 to u1 (forward, under half a lap) passes, or null */
function portalCross(u0,u1){const P=T&&T.port;if(!P)return null;const L=T.L,m=x=>((x%L)+L)%L,du=m(u1-u0);if(!(du>0)||du>L/2)return null;
  for(const p of P){const d=m(p.uE-u0);if(d>0&&d<=du)return p}return null}
/* sampleAt across a break: the near side's sample, carried on along its own tangent (never a blend of the two places) */
function portalSample(o,i,j,a){const{P,R,U,Tg,H,ds}=T,pt=T.portK[i],s=a<pt.aE?i:j,d=a<pt.aE?a*ds:-(1-a)*ds;
  o.p.copy(P[s]).addScaledVector(Tg[s],d);o.r.copy(R[s]);o.u.copy(U[s]);o.t.copy(Tg[s]);o.h=H[s];return o}
/* ---- what is drawn (roadBuild): at each end a neon ring round the road (as wide as the realm's keep-out, so nothing of
   it is ever over the road); the entrance's disc shows the view through it (portalView) or, with that off, a slow swirl;
   the exit's disc is a faint swirl seen only from the front (no view back: "we can't turn around"); two signs before ---- */
const PORT_V=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const PORT_F=`uniform sampler2D tV;uniform float uOn,uT,uX;uniform vec2 uRes;varying vec2 vUv;
  void main(){vec2 c=vUv-0.5;float r=length(c)*2.,a=atan(c.y,c.x),rim=smoothstep(0.8,1.,r);
    float sw=0.5+0.5*sin(a*5.+r*13.-uT*2.4+sin(a*3.-uT)*0.8),sw2=0.5+0.5*sin(-a*3.+r*7.+uT*1.7);
    vec3 glow=mix(vec3(0.04,0.01,0.1),vec3(0.42,0.2,1.),sw*(1.-r*0.6)*0.75)+vec3(0.1,0.5,0.9)*sw2*sw*0.25*(1.-r);
    vec3 col=uOn>0.5?texture2D(tV,gl_FragCoord.xy/uRes).rgb:glow;col+=vec3(0.55,0.32,1.)*rim*(uOn>0.5?0.9:0.6);
    if(uX>0.5){gl_FragColor=vec4(glow*(0.35+0.65*r)+vec3(0.55,0.32,1.)*rim*0.6,1.);return;}
    gl_FragColor=vec4(col,1.);}`;
function portalRoad(c){const{group,ds,N,standOK,signI}=c,V=THREE.Vector3,list=[];
  const torus=(rad,tube,col)=>new THREE.Mesh(new THREE.TorusGeometry(rad,tube,10,120),new THREE.MeshBasicMaterial({color:col}));
  for(const o of c.port){const f={o,R:o.ringR};
    for(const end of['E','X']){const M=end==='E'?o.ME:o.MX,g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(M).multiply(new THREE.Matrix4().makeTranslation(0,o.hc,0));
      g.add(torus(o.ringR,0.85,0xa060ff),torus(o.ringR-1.3,0.3,0x40e8ff),torus(o.ringR+1.4,0.22,0xff70d0));
      const disc=new THREE.Mesh(new THREE.CircleGeometry(o.ringR-0.6,72),new THREE.ShaderMaterial({uniforms:{tV:{value:null},uOn:{value:0},uX:{value:end==='X'?1:0},uRes:{value:new THREE.Vector2(1,1)},uT:SPU.uT},vertexShader:PORT_V,fragmentShader:PORT_F,
        transparent:end==='X',blending:end==='X'?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:end==='E'}));
      /* the entrance's disc faces the oncoming road (its back, -z in its frame, is away from it); the exit's faces the way out */
      if(end==='X')disc.rotation.y=Math.PI;disc.renderOrder=end==='X'?3:0;g.add(disc);g.updateMatrixWorld(true);group.add(g);f[end]=g;f[end+'d']=disc;
      f[end+'c']=new V(0,o.hc,0).applyMatrix4(M)}
    list.push(f);
    /* signs about 300 m and 150 m before the entrance, where a gantry could stand */
    for(const ahead of[300,150]){const SW=W+3.1,SH=SW*340/1024,top=7.2+SH;let at=-1,dd=0;
      for(let d=0;d<=60&&at<0;d+=10)for(const s2 of[1,-1]){const dist=ahead+s2*d,i=((o.k-Math.round(dist/ds))%N+N)%N;if(standOK(i,SW,top,0.26,0.88)){at=i;dd=Math.round((o.uE-i*ds)/10)*10;break}}
      if(at<0)continue;signI.push(at);
      const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0xffb000});for(const sd of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(0.7,top,0.7),m);pl.position.set(sd*(W/2+1.2),top/2,0);g.add(pl)}
      const cv=document.createElement('canvas');cv.width=1024;cv.height=340;const cg=cv.getContext('2d');cg.fillStyle='#0b0e14';cg.fillRect(0,0,1024,340);cg.strokeStyle='#ffb000';cg.lineWidth=8;cg.strokeRect(4,4,1016,332);
      cg.fillStyle='#ffb000';cg.fillRect(4,4,1016,62);cg.fillStyle='#0b0e14';cg.textBaseline='middle';cg.textAlign='center';cg.font="700 44px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillText('PORTAL JUMP · '+dd+' M',512,37);
      cg.textAlign='left';cg.fillStyle='#c79bff';cg.font="700 96px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillText('PORTAL ▲',34,150);
      cg.font="700 40px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillStyle='#f2efe6';cg.fillText(o.pv==='d'?'OUT ON THE RIGHT, BEHIND YOU,':'OUT ON THE RIGHT, BEHIND YOU,',34,230);cg.fillText(o.pv==='d'?'AND JUMP ACROSS ON THE DIAGONAL':'AND JUMP RIGHT ACROSS THIS ROAD',34,282);
      cg.textAlign='right';cg.fillStyle='#8b93a2';cg.font="700 34px 'Chakra Petch','Arial Narrow',sans-serif";cg.fillText('SHOTS GO',990,150);cg.fillText('THROUGH TOO',990,192);
      const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;const pan=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),new THREE.MeshBasicMaterial({map:tx}));pan.position.set(0,7.2+SH/2,0);g.add(pan);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(SW,0.22,0.3),new THREE.MeshBasicMaterial({color:0xc79bff}));bar.position.set(0,7.05,0);g.add(bar);
      g.position.copy(c.P[at]);g.quaternion.copy(c.basis(at));group.add(g)}}
  return{list}}
/* ---- the view through the entrance (Prototype 63; round 2's clips 06 and 07): while an entrance is in view, in front of
   the camera and within 300 m, the scene is drawn once more into a smaller picture from a virtual camera, the main camera
   carried through the portal (M: the entrance's frame to the exit's), and the entrance's disc shows that picture where it
   is on screen (gl_FragCoord over the picture's size), so it lines up with the world round it and the crossing is
   seamless. Default: at half the screen's width and height (a quarter of its pixels); Lite (Glow or Moving scenery off):
   at a third; Ultra low (Low detail) and split screen: off (the disc shows its swirl). The nearest entrance only. Its
   cost is about the scene's own draw calls again while it shows (PVW keeps the numbers). Nothing here draws a random
   number or touches the race. */
const PVW={rt:null,cam:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),sp:new THREE.Sphere(),v:new THREE.Vector3(),v2:new THREE.Vector3(),sz:new THREE.Vector2(),m:new THREE.Matrix4(),n:0,calls:0,tris:0,ms:0,on:null,scale:0};
function portalView(cam){const fx=T&&T.portFx;if(!fx)return;for(const f of fx.list){f.Ed.material.uniforms.uOn.value=0}PVW.on=null;
  if(RES.low||SPL.race&&SPL.ln||!g2||S.state==='lab'||S.state==='tut'||S.state==='fsel')return;
  cam.updateMatrixWorld();PVW.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);PVW.fr.setFromProjectionMatrix(PVW.pm);let best=null,bd=300;
  for(const f of fx.list){const d=cam.position.distanceTo(f.Ec);if(d>=bd)continue;if(PVW.v.copy(cam.position).sub(f.Ec).dot(f.o.Fe)>0.5)continue;/* behind it: no view */
    PVW.sp.set(f.Ec,f.R);if(PVW.fr.intersectsSphere(PVW.sp)){bd=d;best=f}}
  if(!best)return;const t0=performance.now(),lite=!(g2('bloom')&&g2('anim')),k=lite?1/3:0.5;renderer.getDrawingBufferSize(PVW.sz);const w=Math.max(16,Math.round(PVW.sz.x*k)),h=Math.max(16,Math.round(PVW.sz.y*k));
  if(!PVW.rt){PVW.rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat})}else if(PVW.rt.width!==w||PVW.rt.height!==h)PVW.rt.setSize(w,h);
  if(!PVW.cam)PVW.cam=new THREE.PerspectiveCamera();const vc=PVW.cam;vc.fov=cam.fov;vc.aspect=cam.aspect;vc.far=cam.far;
  PVW.m.multiplyMatrices(best.o.M,cam.matrixWorld);PVW.m.decompose(vc.position,vc.quaternion,vc.scale);vc.updateMatrixWorld(true);
  /* the near plane at the exit's disc, so nothing behind the exit shows in the picture */
  let nz=1e9;for(let a=0;a<8;a++){const th=a*Math.PI/4;PVW.v.set(Math.cos(th)*best.R,best.o.hc+Math.sin(th)*best.R,0).applyMatrix4(best.o.MX).applyMatrix4(vc.matrixWorldInverse);nz=Math.min(nz,-PVW.v.z)}
  vc.near=clamp(nz-1,0.3,200);vc.updateProjectionMatrix();
  const sky=T.env&&T.env.sky,sk0=sky&&sky.position.clone(),vsk=VFX.sky&&VFX.sky.visible,inf=renderer.info.render;
  best.Ed.visible=false;best.Xd.visible=false;if(sky)sky.position.copy(vc.position);if(vsk)VFX.sky.position.copy(vc.position);
  const prev=renderer.getRenderTarget();try{renderer.setRenderTarget(PVW.rt);renderer.render(scene,vc)}finally{renderer.setRenderTarget(prev);best.Ed.visible=true;best.Xd.visible=true;if(sky)sky.position.copy(sk0);if(vsk)VFX.sky.position.copy(cam.position)}
  PVW.calls=inf.calls;PVW.tris=inf.triangles;PVW.n++;PVW.ms=performance.now()-t0;PVW.on=best;PVW.scale=k;
  const U=best.Ed.material.uniforms;U.tV.value=PVW.rt.texture;U.uOn.value=1;U.uRes.value.copy(PVW.sz)}
/* ---- the Spirit realm's rule round a portal (004o): the lines along which the jump is watched. From chase cameras (12 m
   behind a racer, on three lines across the road) every 16 m over the 400 m before the entrance, to the ramp (from 20 m past
   the exit's ring), the lip and the flight every 10 m up to 80 m past the main road (40 m on the diagonal, which heads on
   towards the entrance's ring), at the road and 8 m over it; and from chase cameras on the ramp and
   in the flight back to the main road every 20 m over its 300 m before the jump's line. Segments [ax,ay,az,bx,by,bz]. ---- */
function portalWatch(ctx,O){const out=[],PT=ctx.port||[];if(!PT.length)return out;const{N,ds,P,R,U}=ctx,hw=W/2,V=THREE.Vector3,pt=(i,l,h)=>{i=((i%N)+N)%N;return new V().copy(P[i]).addScaledVector(R[i],l).addScaledVector(U[i],h)};
  for(const o of PT){const k=o.k,back=Math.round(O.camBack/ds),nLip=Math.round(PORT_O.Lr/ds),nOver=Math.round((o.Lp*(o.pv==='d'?Math.SQRT2:1)+(o.pv==='d'?40:80))/ds),zJ=o.zC+(o.pv==='d'?o.Lp:0);
    const tg=[];for(let q=Math.round(20/ds);q<=nLip+nOver;q+=Math.max(1,Math.round(10/ds)))for(const h of[1,8])tg.push(pt(k+q,0,h));
    for(let d=Math.round(400/ds);d>=Math.round(zJ/ds);d-=Math.max(1,Math.round(O.camStep/ds)))for(const cl of[-hw*0.6,0,hw*0.6]){const c=pt(k-d-back,cl,O.camUp+1);for(const t of tg)out.push([c.x,c.y,c.z,t.x,t.y,t.z])}
    const mt=[];for(let d=Math.round(zJ/ds);d<=Math.round((zJ+300)/ds);d+=Math.max(1,Math.round(20/ds)))for(const l of[-hw,0,hw])mt.push(pt(k-d,l,1));
    for(let q=back+1;q<=nLip+nOver;q+=Math.max(1,Math.round(O.camStep/ds))){const c=pt(k+q-back,0,O.camUp+1);for(const t of mt)out.push([c.x,c.y,c.z,t.x,t.y,t.z])}}
  return out}
/* ---- the knots (Eric, 2026-11-12: "the celtic knots could be repurposed for the portals as shifting interweaving
   decoration around the portal"): at each end two torus-knot bands wound round the ring, outside the opening, turning
   slowly opposite ways; each loosens and re-ties as another knot (the knot batch's morph: (2,15) to (2,21), the strands
   staying inside their band, so nothing ever crosses into the opening). Lite and Default; every point checked by the rule
   at four turns of its spin (put in the knot batch, so tools/tests/spirit-clear.js checks them through their motion). ---- */
function spPortalKnots(ctx,Lb,clr,r,st,why){const V=THREE.Vector3,Y=new V(0,1,0);let n=0;
  for(const o of ctx.port||[])for(const end of['E','X']){const M=end==='E'?o.ME:o.MX,F=(end==='E'?o.Fe:o.Fx).clone().normalize(),c=new V(0,o.hc,0).applyMatrix4(M),
      x=new V().crossVectors(F,Y).normalize(),z=new V().crossVectors(x,F).normalize(),q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,F,z));
    for(let b=0;b<2;b++){st.tried++;const R0=o.ringR+4.6+b*3.4,r0=1.5,th=0.55,nP=Math.round(R0*9),A=SPS.knot(2,15+b*2,R0,r0,nP,3,th),B=SPS.knot(2,21+b*2,R0,r0*1.35,nP,3,th*0.8),pts=[];
      for(const S of[A,B])for(const L of S)for(let i=0;i<L.length;i+=3)for(let a=0;a<4;a++){const p=new V(...L[i]).applyAxisAngle(Y,a*Math.PI/8).applyQuaternion(q).add(c);pts.push([p.x,p.y,p.z,0.9])}
      if(!clr.okPts(pts)){st.dropped++;why['portal knots']=(why['portal knots']||0)+1;continue}
      Lb.obj({c:[c.x,c.y,c.z],q:[q.x,q.y,q.z,q.w],m:[1,(b?-1:1)*(0.08+0.04*r()),r()*TAU,0],ax:[0,1,0],pal:[5,2,1,4][(n++)%4],br:0.015,ext:R0+4});
      A.forEach((S,s)=>{for(let i=0;i<S.length-1;i++)Lb.seg(S[i],S[i+1],i/S.length,1,B[s][i],B[s][i+1])});st.placed++}}}
