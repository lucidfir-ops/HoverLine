//# ships/007-ship-models.js: the ship models (Prototype 51): the kit, flames and jets, one builder per frame, the training cube
/* Ship meshes (Prototype 51: redesigned with Eric, mock-ups in tools/p51/). A kit of shared helpers, then one builder per
   frame. The look: designed low-poly shapes, not boxes; flat shading; open six-sided nozzles with a thin inset rim and
   the engine glow set inside; canopies cut from the hull's own facets as flush glass; ammo as purple bars laid into hull
   panels (their length is the ammo stat, and they dim as ammo is spent); vertical fins end in rudders that swing with the
   steering, horizontal surfaces end in brake flaps that kick up (their lit bars, and the fins' lit edges, went in Prototype 57); a livery (panel seams, a
   race number, a hazard band) on the body colour; and thin light lines along the hull's edges (the 'Ship edge lines'
   graphics option). Every builder tags pieces by the stat they show (parts.speed etc.) so the lab can highlight what
   changed, and gives the race code engine trails and a shield bubble. Forward is -z. The race code moves the rudders,
   flaps, brake lights and ammo bars through shipCtl(). */
const SHIP_EDGE_M=new THREE.LineBasicMaterial({color:0x5ff6ff,transparent:true,opacity:0.6});
const BRAKE0=new THREE.Color(0x2a1210),BRAKE1=new THREE.Color(0xff5a2a),AMMO_ON=new THREE.Color(0xc070ff),AMMO_OFF=new THREE.Color(0x3a1a55);
const livCache=new Map();
/* the livery: the body colour with panel seams, a highlight line, a band in the second colour with hazard chevrons, and
   the pilot's race number */
function liveryTex(body,stripe,num){const k=body+'/'+stripe+'/'+num;let t=livCache.get(k);if(t)return t;
  const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),hex=n=>'#'+n.toString(16).padStart(6,'0');
  x.fillStyle=hex(body);x.fillRect(0,0,S,S);x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1.2;
  for(const[a,b,cc,d]of[[0,34,128,34],[0,92,128,92],[44,0,44,34],[88,34,88,92],[30,92,30,128],[100,92,100,128]]){x.beginPath();x.moveTo(a,b);x.lineTo(cc,d);x.stroke()}
  x.fillStyle='rgba(255,255,255,.10)';x.fillRect(0,35,128,3);x.fillStyle=hex(stripe);x.fillRect(0,56,128,14);
  x.fillStyle='rgba(0,0,0,.55)';for(let k=-2;k<12;k++){x.beginPath();x.moveTo(k*12,70);x.lineTo(k*12+7,70);x.lineTo(k*12+14,56);x.lineTo(k*12+7,56);x.fill()}
  if(num){x.font='bold 26px monospace';x.textAlign='center';x.fillStyle='rgba(255,255,255,.85)';x.fillText(num,64,26)}
  x.fillStyle='rgba(0,0,0,.35)';for(let k=0;k<6;k++)x.fillRect(10+k*4,112,2,2);
  t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;livCache.set(k,t);return t}
function shipKit(g,parts,paint){const T=THREE;
  const K={g,parts,flaps:[],trails:[],jets:[],extra:{},ctl:{brake:[],steer:[],light:null},bars:[]};
  K.taper=(geo,fx,fy)=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getZ(i)<0){p.setX(i,p.getX(i)*fx);p.setY(i,p.getY(i)*fy)}geo.computeVertexNormals();return geo};
  /* plain flat-shaded colours; the body colour carries the paint's pattern, or else the livery */
  K.lam=c=>{if(paint.trim!=null&&c===ARMOUR)c=paint.trim;if(c===paint.body){if(paint.bits&&/[1-9a-f]/.test(paint.bits))return new T.MeshLambertMaterial({color:0xffffff,map:patTex(paint.body,paint.stripe,paint.bits),flatShading:true});
    return new T.MeshLambertMaterial({color:0xffffff,map:liveryTex(paint.body,paint.stripe,paint.num||'01'),flatShading:true})}return new T.MeshLambertMaterial({color:c,flatShading:true})};
  K.mB=K.lam(paint.body);K.mS=K.lam(paint.stripe);K.mD=K.lam(0x161a22);K.mA=K.lam(ARMOUR);K.mT=K.lam(0x2a2e36);
  K.glass=new T.MeshLambertMaterial({color:0x3a8aa6,emissive:0x0c3a4a,flatShading:true});
  K.lineM=new T.MeshBasicMaterial({color:0x3ff0ff});
  K.put=(geo,m,x,y,z,part,par)=>{const me=new T.Mesh(geo,m);me.position.set(x,y,z);(par||g).add(me);if(part)parts[part].push(me);return me};
  K.cylZ=(r1,r2,len,seg=12)=>{const c=new T.CylinderGeometry(r1,r2,len,seg);c.rotateX(Math.PI/2);return c};
  K.rod=(a,b,r,m,part)=>{const d=new T.Vector3().subVectors(b,a),L=d.length(),me=new T.Mesh(new T.CylinderGeometry(r,r,L,5),m);me.position.copy(a).addScaledVector(d,0.5);
    me.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(me);if(part)parts[part].push(me);return me};
  K.quiet=m=>{m.userData.noEdge=1;return m};
  /* lift o out of a still part into that part's parent, keeping where it is, so the part has no children and can merge */
  K.lift=(par,o)=>{par.updateMatrix();o.updateMatrix();o.matrix.premultiply(par.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);par.remove(o);par.parent.add(o);return o};
  K.wellM=new T.MeshBasicMaterial({color:0x2a1404,side:T.BackSide});K.nozM=new T.MeshLambertMaterial({color:0x2a2e36,flatShading:true,side:T.DoubleSide});
  K.glowM=new T.MeshBasicMaterial({color:0xffc040});
  K.trailM=new T.MeshBasicMaterial({map:FLAMES.fire[0],color:0xffffff,transparent:true,opacity:1,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  /* an engine's flame and boost jet at (x,y,z), facing back; disc=true also puts a glow disc there (the training cube) */
  K.trail=(x,y,z,w,part,disc=true)=>{if(disc)K.put(new T.CircleGeometry(w*0.6,12),K.glowM,x,y,z,part);const tg=new T.PlaneGeometry(w*1.35,1);tg.rotateX(-Math.PI/2);tg.translate(0,0,0.5);
    const tr=new T.Mesh(tg,K.trailM);tr.position.set(x,y,z+0.005);tr.userData.w=w;tr.visible=false;g.add(tr);K.trails.push(tr);
    /* Enhanced graphics: a boost jet — a pulsing cone of light with rings racing down it */
    const jg=new T.Group();jg.position.set(x,y,z+0.02);jg.visible=false;jg.add(new T.Mesh(JET.cyl,JET.mat));const rings=[];
    for(let k=0;k<3;k++){const m=new T.Mesh(JET.ring,JET.ringMat.clone());jg.add(m);rings.push(m)}jg.userData={w,rings};g.add(jg);K.jets.push(jg)};
  /* the old flat brake board (the training cube only) */
  K.flap=(x,y,z,w,len,m)=>{const pv=new T.Group();pv.position.set(x,y,z);const f=new T.Mesh(new T.BoxGeometry(w,0.05,len),m);f.position.z=-len/2;pv.add(f);g.add(pv);K.ctl.brake.push({o:pv,ax:'x',k:-0.9})};
  /* a thin fin from a 2D outline (x = back, y = up), bevelled, thinner toward the tip; the outline lies in the y-z plane */
  K.finGeo=(pts,thick)=>{const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);
    const geo=new T.ExtrudeGeometry(s,{depth:thick,bevelEnabled:true,bevelThickness:thick*0.4,bevelSize:thick*0.5,bevelSegments:1,steps:1});geo.translate(0,0,-thick/2);geo.rotateY(-Math.PI/2);
    const p=geo.attributes.position;let ym=0;for(const q of pts)ym=Math.max(ym,Math.abs(q[1]));for(let i=0;i<p.count;i++){const k=1-0.6*Math.abs(p.getY(i))/ym;p.setX(i,p.getX(i)*k)}geo.computeVertexNormals();return geo};
  /* a surface hinged on a fin: the outline starts at the hinge line x=0 and swings about the fin's span, out of its plane;
     kind 'steer' (a rudder) or 'brake' (a flap); k is the swing at full lock or full brake */
  K.hinge=(parent,outline,thick,mat,hz,kind,k)=>{const base=new T.Group(),pv=new T.Group();base.position.set(0,0,hz);parent.add(base);K.lift(parent,base);base.add(pv);pv.add(new T.Mesh(K.finGeo(outline,thick),mat));K.ctl[kind].push({o:pv,ax:'y',k});return pv};
  /* a lit strip from a to b in the parent's space */
  K.strip=(par,a,b,w,mat)=>{const m=K.quiet(new T.Mesh(new T.BoxGeometry(w,w,a.distanceTo(b)),mat));m.position.copy(a).lerp(b,0.5);par.add(m);m.lookAt(b);return m};
  /* a vertical fin with a rudder (steers) (Prototype 57: no lit bar along its leading edge any more) */
  K.finRudder=(x,y,z0,L,H,mat,o={})=>{const xr=L*(o.rf??0.66),sw=o.sweep??0.55,t=o.t??0.05;
    const f=K.put(K.finGeo([[0,0],[xr,0],[xr,H*0.92],[L*0.3+H*sw,H],[L*0.12,H*0.2]],t),mat,x,y,z0,'handling');if(o.rz)f.rotation.z=o.rz;
    const rl=L-xr+0.05;K.hinge(f,[[0,0],[rl,0],[rl*0.75,H*0.85],[0,H*0.92]],t*0.8,mat,xr+0.01,'steer',0.5);
    return f};
  /* a horizontal surface with a brake flap that kicks up; s is the side (Prototype 57: no brake-light bar on the flap any more) */
  K.brakeM=new T.MeshBasicMaterial({color:BRAKE0.clone()});K.ctl.light=K.brakeM;
  K.wingFlap=(x,y,z0,root,span,mat,s,o={})=>{const xr=root*(o.rf??0.7),tf=o.tipF??0.6,t=o.t??0.04;
    const w=K.put(K.finGeo([[0,0],[xr,0],[xr-(root-root*tf)*0.1,span],[root*(1-tf)*0.9,span]],t),o.fixMat||mat,x,y,z0,'handling');w.rotation.z=s*(-Math.PI/2-(o.droop??0.12));
    const fl=root-xr+0.02,fp=K.hinge(w,[[0,0],[fl,0],[fl*0.7,span*0.94],[0,span*0.94]],t*0.75,mat,xr+0.01,'brake',-s*1.0);
    return w};
  /* an open six-sided nozzle at z (exit radius re, length nL) with a thin inset rim and the engine glow set inside; its
     flame and boost jet come out of the exit */
  K.nozzle=(x,y,z,re,nL,part,par)=>{const nz=new T.CylinderGeometry(re,re*1.12,nL,6,1,true);nz.rotateX(Math.PI/2);
    K.put(nz,K.nozM,x,y,z+nL/2,part,par);
    const ri=re*0.775,ze=z+nL;K.quiet(K.put(new T.RingGeometry(ri,re,6),K.mD,x,y,ze+0.002,null,par)).rotation.z=Math.PI/2;
    K.quiet(K.put(K.cylZ(ri,ri,0.12,6),K.wellM,x,y,ze-0.06,null,par));
    K.quiet(K.put(new T.CircleGeometry(ri,6),K.glowM,x,y,ze-0.11,null,par)).rotation.z=Math.PI/2;
    if(!par)K.trail(x,y,ze,ri*1.5,part,false);return ze};
  /* a faceted nacelle: an n-sided tube with bands, a dark intake, and a nozzle */
  K.nacelle=(x,y,z0,r,len,o={})=>{const n=o.n??8;K.put(K.cylZ(r,r*0.9,len,n),o.mat||K.mS,x,y,z0+len/2,'speed').rotation.z=Math.PI/n;
    for(const bz of o.bands||[z0+len*0.62])K.put(K.cylZ(r*1.07,r*1.07,0.16,n),o.bandMat||K.mB,x,y,bz,'speed').rotation.z=Math.PI/n;
    K.put(new T.CircleGeometry(r*0.88,n),K.mD,x,y,z0-0.012).rotation.y=Math.PI;return K.nozzle(x,y,z0+len,r*0.85*0.9,o.nL??0.3,'thrust')};
  /* a faceted teardrop body (an n-sided lathe) along z, centred at c, length L, radius R, flattened by fy */
  K.pod=(x,y,c,L,R,fy,o={})=>{const prof=[],N=o.rings??8,sh=o.shape||(t=>Math.sin(Math.PI*Math.pow(t,0.75))*0.82+0.18*(1-t));
    for(let i=0;i<=N;i++){const t=i/N;prof.push(new T.Vector2(Math.max(0.02,sh(t)*R),(t-0.5)*L))}
    /* turned to put a flat facet on top before it is flattened, so the pod sits level (until Prototype 53 it was turned after, which tilted it) */
    const n=o.n??8,geo=new T.LatheGeometry(prof,n);geo.rotateX(Math.PI/2);geo.rotateZ(Math.PI/n);geo.scale(o.fx??1,fy,1);
    const m=K.put(geo,o.mat||K.mB,x,y,c,o.part,o.par);m.userData.L=L;return m};
  /* flush glass: the facets of mesh between zA and zB (fractions of its length L from the middle) that face up past ny,
     standing a hair proud, framed by a thin line */
  K.glassOn=(mesh,zA,zB,ny=0.75)=>{const gp=mesh.geometry.clone().toNonIndexed(),P=gp.attributes.position,keep=[],L=mesh.userData.L||1,va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3(),nr=new T.Vector3();
    for(let i=0;i<P.count;i+=3){va.fromBufferAttribute(P,i);vb.fromBufferAttribute(P,i+1);vc.fromBufferAttribute(P,i+2);nr.crossVectors(vb.clone().sub(va),vc.clone().sub(va)).normalize();
      const z0=Math.min(va.z,vb.z,vc.z),z1=Math.max(va.z,vb.z,vc.z);if(Math.abs(nr.y)>ny&&Math.max(va.y,vb.y,vc.y)>0&&z0>=zA*L-1e-3&&z1<=zB*L+1e-3)for(const v of[va,vb,vc])keep.push(v.x*1.012,v.y*1.012+0.002,v.z)}
    gp.dispose();const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(keep,3));cg.computeVertexNormals();
    const gl=K.quiet(new T.Mesh(cg,K.glass));gl.position.copy(mesh.position);mesh.parent.add(gl);const fr=new T.LineSegments(new T.EdgesGeometry(cg,89),SHIP_EDGE_M);fr.userData.edge=1;fr.position.copy(gl.position);mesh.parent.add(fr);return gl};
  /* ammo bars laid into a panel of mesh, nb a side from z0 every gap, found by casting toward the axis from angle ang
     (0 = straight down onto the top); a bar is as long as width (or width(z)) times the ammo stat's share, against the
     inner edge. They become one mesh in done(). */
  K.ammoBars=(mesh,ys,z0,gap,nb,ang,width,am)=>{const lenK=0.3+0.7*(clamp(am,1,5)-1)/4;g.updateMatrixWorld(true);const rc=new T.Raycaster();
    for(let k=0;k<nb;k++)for(const s of[-1,1]){const z=z0+k*gap,dir=new T.Vector3(-s*Math.sin(ang),-Math.cos(ang),0),o=new T.Vector3(mesh.position.x,ys,z).addScaledVector(dir,-3);
      rc.set(o,dir);const hit=rc.intersectObject(mesh)[0];if(!hit)continue;
      const n=hit.face.normal.clone().transformDirection(mesh.matrixWorld),fwd=new T.Vector3(0,0,1).addScaledVector(n,-n.z).normalize(),ac=new T.Vector3().crossVectors(fwd,n).normalize();
      const W=typeof width==='function'?width(z):width,box=new T.BoxGeometry(W*lenK,0.028,0.012),M=new T.Matrix4().makeBasis(ac,fwd,n),inward=ac.clone().multiplyScalar(ac.x*s>0?-1:1);
      M.setPosition(hit.point.clone().addScaledVector(n,0.006).addScaledVector(inward,W*(1-lenK)/2));box.applyMatrix4(M);K.bars.push({geo:box,k})}};
  /* finish: the shield bubble; the ammo bars as one vertex-coloured mesh; the edge lines of every still, solid part as one
     line mesh per group (spinning groups keep their own) */
  K.done=(sx,sy,sz,cz,mats)=>{const shM=new T.MeshBasicMaterial({color:0x3ff0ff,transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false});
    const bub=new T.Mesh(new T.SphereGeometry(1,16,12),shM);bub.scale.set(sx,sy,sz);bub.position.z=cz||0;bub.visible=false;g.add(bub);
    let ammo=null;if(K.bars.length){const pos=[],col=[],idx=[],nb=Math.max(...K.bars.map(b=>b.k))+1;
      for(const b of K.bars){const G=b.geo.index?b.geo:b.geo,P=G.attributes.position,o=pos.length/3;for(let i=0;i<P.count;i++){pos.push(P.getX(i),P.getY(i),P.getZ(i));col.push(AMMO_ON.r,AMMO_ON.g,AMMO_ON.b)}
        for(let i=0;i<G.index.count;i++)idx.push(G.index.getX(i)+o);G.dispose()}
      const MG=new T.BufferGeometry();MG.setAttribute('position',new T.Float32BufferAttribute(pos,3));MG.setAttribute('color',new T.Float32BufferAttribute(col,3));MG.setIndex(idx);
      const mesh=K.quiet(new T.Mesh(MG,new T.MeshBasicMaterial({vertexColors:true})));g.add(mesh);parts.ammo.push(mesh);
      const per=K.bars.map(b=>b.k),vpb=24;ammo={mesh,nb,per,vpb,lit:-1}}
    /* edge lines: one LineSegments per group of still parts */
    g.updateMatrixWorld(true);const nodes=[g,...((K.extra.spin||[]).map(q=>q.o))];
    for(const node of nodes){const segs=[],inv=new T.Matrix4().copy(node.matrixWorld).invert(),M=new T.Matrix4(),v=new T.Vector3();
      const walk=o=>{for(const c of o.children){if(c.isGroup&&c!==node&&(nodes.includes(c)||K.ctl.brake.some(q=>q.o===c)||K.ctl.steer.some(q=>q.o===c)||K.jets.includes(c)))continue;
        if(c.isMesh&&!c.userData.noEdge&&c!==bub&&c.material&&!c.material.transparent&&c.material.isMeshLambertMaterial&&c.visible){const E=new T.EdgesGeometry(c.geometry,28),P=E.attributes.position;M.multiplyMatrices(inv,c.matrixWorld);
          for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);segs.push(v.x,v.y,v.z)}E.dispose()}
        if(c.children.length)walk(c)}};walk(node);
      if(segs.length){const LG=new T.BufferGeometry();LG.setAttribute('position',new T.Float32BufferAttribute(segs,3));const ln=new T.LineSegments(LG,SHIP_EDGE_M);ln.userData.edge=1;node.add(ln)}}
    g.userData={flaps:K.flaps,trails:K.trails,jets:K.jets,trailM:K.trailM,glowM:K.glowM,shield:bub,parts,extra:K.extra,mats,ctl:K.ctl,ammo}};
  return K}
/* Each frame: rudders follow the steering, flaps and brake light the brake, and the ammo bars light up to the share of
   ammo left (am, 0..1; null leaves them). Called by the race loop, the tutorial and the lab. */
function shipCtl(ud,brk,steer,am){SHIP_EDGE_M.visible=g2('lines');const c=ud.ctl;if(c){for(const q of c.brake)q.o.rotation[q.ax]=q.k*brk;for(const q of c.steer)q.o.rotation.y=steer*q.k;if(c.light){c.light.visible=!RES.low;c.light.color.copy(BRAKE0).lerp(BRAKE1,clamp(brk,0,1))}}
  const A=ud.ammo;if(A&&am!=null){const lit=Math.round(A.nb*clamp(am,0,1));if(lit!==A.lit){A.lit=lit;const C=A.mesh.geometry.attributes.color;
    for(let b=0;b<A.per.length;b++){const on=A.per[b]<lit,cc=on?AMMO_ON:AMMO_OFF;for(let i=b*A.vpb;i<(b+1)*A.vpb;i++)C.setXYZ(i,cc.r,cc.g,cc.b)}C.needsUpdate=true}}}
/* Pixel flames: six frames per palette, 12×40 pixels, nearest-filtered. Row 0 is at the engine: a hot white-yellow core that
   narrows and cools down the plume, then breaks into sputtering blobs at the tip. */
const FLAMES=(()=>{const mk=(pal,seed)=>{const out=[];for(let f=0;f<6;f++){const W=12,H=40,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),r=rng(seed+f*977);
      let gapRun=0;for(let y=0;y<H;y++){const t=y/H,wob=(r()-.5)*1.2,hw=(W/2)*(1-t*0.72)*(0.85+0.3*r());
        if(t>0.5){if(gapRun>0){gapRun--;continue}if(r()<0.22+0.5*(t-0.5)){gapRun=1+(r()*3|0);continue}}
        for(let x=0;x<W;x++){const d=Math.abs(x-(W-1)/2+wob);let h=(1-d/hw)*Math.pow(1-t,0.55)+(r()-.5)*0.28;if(t>0.5)h*=0.85;
          const k=h>0.78?0:h>0.58?1:h>0.4?2:h>0.22?3:h>0.1?4:-1;if(k>=0){g.fillStyle=pal[k];g.fillRect(x,y,1,1)}}}
      for(let n=0;n<3;n++){const y=Math.floor(H*(0.82+r()*0.17)),x=Math.floor(W/2+(r()-.5)*W*0.5);g.fillStyle=pal[2+(r()*3|0)];g.fillRect(x,y,1,1)}
      const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;out.push(tx)}return out};
  return{fire:mk(['#fff6d0','#ffd040','#ff8a1f','#e0401a','#6a1606'],11),boost:mk(['#ffffff','#c8ffff','#3ff0ff','#1a8cff','#0e2878'],23)}})();
const JET=(()=>{const cyl=new THREE.CylinderGeometry(1,0.32,1,18,1,true);cyl.rotateX(-Math.PI/2);cyl.translate(0,0,0.5);
  const gc=document.createElement('canvas');gc.width=4;gc.height=64;const gg=gc.getContext('2d'),gr=gg.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(220,255,255,1)');gr.addColorStop(0.35,'rgba(63,240,255,.7)');gr.addColorStop(1,'rgba(20,90,255,0)');gg.fillStyle=gr;gg.fillRect(0,0,4,64);
  const map=new THREE.CanvasTexture(gc);
  return{cyl,ring:new THREE.RingGeometry(0.66,1,24),mat:new THREE.MeshBasicMaterial({map,color:0xffffff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
    ringMat:new THREE.MeshBasicMaterial({color:0xe8ffff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}})();
const SHIPB={
 /* A dart hull pinched to a nose, glass cut from its top, two nacelles on a swept wing whose tips brake, a rudder tail fin. */
 blade(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.9+0.05*sh;
  const hull=K.pod(0,0.12,-0.35,4.0,0.52*hb,0.62,{shape:t=>Math.pow(Math.sin(Math.PI*Math.pow(t,0.62)),0.8)*0.9+0.1*t,fx:1.25});K.glassOn(hull,-0.3,-0.12);
  for(const s of[-1,1]){const c=put(K.finGeo([[0,0],[0.8+0.25*sh,0],[0.7+0.25*sh,0.1+0.03*sh],[0.15,0.13+0.03*sh]],0.035+0.012*sh),K.mA,s*0.5*hb,0.05,-1.2,'shield');c.rotation.z=s*-1.2}
  const podX=1.0+0.04*sp,r=0.2+0.02*sp,len=2.0+0.2*sp;
  for(const s of[-1,1])K.nacelle(s*podX,0.02,-0.9,r,len,{nL:0.22+0.06*th});
  const span=0.55+0.1*hd;
  for(const s of[-1,1]){put(new T.BoxGeometry(podX-0.3,0.06,0.9),K.mD,s*(0.3+(podX-0.3)/2),0.0,0.25,'handling');K.wingFlap(s*(podX+r*0.9),0.02,-0.1,1.15,span,K.mS,s,{fixMat:K.mB,droop:0.05})}
  K.finRudder(0,0.38,0.55,1.0,0.42+0.1*hd,K.mS);
  K.ammoBars(hull,0.12,0.05,0.044,8,0.85,0.2,st.ammo);
  K.done(Math.max(2,podX+span+0.4),1.05,2.9,0,[K.mB,K.mS,K.mA])},
 /* Twin engines out front joined by an energy arc, towing a faceted pilot pod on cables. */
 tether(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.88+0.06*sh;
  const er=0.3+0.035*sp,el=2.2+0.22*sp,ex=1.0+0.04*sp,ey=0.16,z0=-3.4,zr=z0+el;
  for(const s of[-1,1]){const x=s*ex;put(K.cylZ(er,er*0.9,el,14),K.mB,x,ey,z0+el/2,'speed');for(const bz of[z0+0.12,z0+el*0.62])put(K.cylZ(er*1.09,er*1.09,0.2,14),K.mS,x,ey,bz,'speed');
    put(new T.CircleGeometry(er*0.9,14),K.mD,x,ey,z0-0.015).rotation.y=Math.PI;
    const nL=0.22+0.08*th,nz=new T.CylinderGeometry(er*0.72,er*(0.8+0.05*th),nL,6,1,true);nz.rotateX(Math.PI/2);put(nz,K.nozM,x,ey,zr+nL/2,'thrust');
    const re=er*0.72,ri=re*0.775,ze=zr+nL;K.quiet(put(new T.RingGeometry(ri,re,6),K.mD,x,ey,ze+0.002)).rotation.z=Math.PI/2;
    K.quiet(put(K.cylZ(ri,ri,0.12,6),K.wellM,x,ey,ze-0.06));K.quiet(put(new T.CircleGeometry(ri,6),K.glowM,x,ey,ze-0.11)).rotation.z=Math.PI/2;K.trail(x,ey,ze,er*1.15,'speed',false);
    const fh=0.28+0.1*hd,fl=0.6+0.09*hd;K.finRudder(x,ey+er*0.9,z0+el*0.5,fl,fh,K.mS,{rf:0.66});
    K.wingFlap(s*(ex+er*0.85),ey-0.02,z0+el*0.32,0.75,0.32+0.1*hd,K.mS,s,{fixMat:K.mB,droop:0.25,rf:0.7,tipF:0.45})}
  const aw=2*(ex-er)-0.05,arcM=new T.MeshBasicMaterial({color:paint.stripe,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  put(new T.PlaneGeometry(aw,0.2),arcM,0,ey,z0+el*0.3);K.extra.arc=arcM;put(new T.PlaneGeometry(aw,0.07),arcM,0,ey,z0+el*0.62);
  // the pilot's pod: a faceted teardrop with a flush canopy, low swept armour, a tail fin rising out of its hull, ammo bars
  const ze=zr+0.22+0.08*th,cz=ze+1.35,pl=1.9,pod=K.pod(0,0.12,cz,pl,0.4*hb,0.72);K.glassOn(pod,-0.375,-0.125);
  for(const s of[-1,1]){const c=put(K.finGeo([[0,0],[0.5+0.12*sh,0],[0.42+0.12*sh,0.1+0.03*sh],[0.12,0.13+0.03*sh]],0.035+0.012*sh),K.mA,s*0.3*hb,0.02,cz-0.05,'shield');c.rotation.z=s*-1.15;
    K.strip(g0(K),new T.Vector3(s*0.31*hb,0.17,cz-0.6),new T.Vector3(s*0.29*hb,0.17,cz+0.2),0.016,K.lineM)}
  {K.g.updateMatrixWorld(true);const rc=new T.Raycaster(),zs=cz+0.2,L=0.62,H=0.36,surf=z=>{rc.set(new T.Vector3(0,3,z),new T.Vector3(0,-1,0));const h=rc.intersectObject(pod)[0];return h?h.point.y:0.12};
    const y0=surf(zs),base=[];for(let i=0;i<=6;i++){const x=L*i/6;base.push([x,surf(zs+x)-y0-0.015])}
    const xr=L*0.7,bi=base.filter(q=>q[0]<=xr+1e-6),yr=bi[bi.length-1][1],tf=put(K.finGeo([...bi,[xr,yr+H*0.88],[L*0.62,base[6][1]+H*0.95],[L*0.2,base[0][1]+0.05]],0.04),K.mS,0,y0,zs,'handling');
    const rb=base.filter(q=>q[0]>=xr-1e-6).map(q=>[q[0]-xr,q[1]-yr]),pv=K.hinge(tf,[...rb,[L*1.02-xr,base[6][1]-yr+H*0.9],[0,H*0.88]],0.035,K.mS,xr+0.005,'steer',0.5);pv.position.y=yr}
  K.ammoBars(pod,0.12,cz+0.15,0.044,8,0.85,z=>{const tt=(z-cz)/pl+0.5,rr=(Math.sin(Math.PI*Math.pow(tt,0.75))*0.82+0.18*(1-tt))*0.4*hb;return 2*rr*Math.sin(Math.PI/8)*0.86*0.78},st.ammo);
  const mC=K.lam(0x161a22);for(const s of[-1,1]){K.rod(new T.Vector3(s*(ex-er*0.5),ey,zr-0.15),new T.Vector3(s*0.2,0.12,cz-0.8),0.028,mC);K.rod(new T.Vector3(s*(ex-er*0.2),ey+er*0.5,z0+el*0.5),new T.Vector3(s*0.16,0.22,cz-0.75),0.02,mC)}
  K.done(ex+er+0.55,1.1,(cz+1-z0)/2+0.3,(z0+cz+1)/2,[K.mB,K.mS,K.mA])},
 /* A hover bike: a faceted tank body, a pilot's pod on top, one big engine, fork vanes that steer (drawn at 0.88 size, P58). */
 skiff(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.9+0.05*sh;
  const body=K.pod(0,0.14,-0.35,3.2,0.36*hb,0.85,{shape:t=>Math.pow(Math.sin(Math.PI*Math.pow(t,0.7)),0.7)*0.9+0.1});
  /* (P58) a pilot's pod on the tank, with a flush canopy, like the other frames (it had a rider: a torso and a helmet) */
  const pod=K.pod(0,0.4,-0.15,1.35,0.25*hb,0.72,{shape:t=>Math.pow(Math.sin(Math.PI*Math.pow(t,0.65)),0.75)});K.glassOn(pod,-0.4,-0.08);
  for(const s of[-1,1]){const c=put(K.finGeo([[0,0],[0.75+0.2*sh,0],[0.62+0.2*sh,0.16+0.04*sh],[0.12,0.2+0.04*sh]],0.035+0.012*sh),K.mA,s*0.3*hb,0.06,-1.25,'shield');c.rotation.z=s*-0.7}
  const r=0.24+0.035*sp,len=0.9+0.14*sp;K.nacelle(0,0.12,0.65,r,len,{mat:K.mS,bandMat:K.mD,nL:0.25});
  const br=0.07+0.02*th;for(const s of[-1,1]){put(K.cylZ(br,br,0.5,6),K.mT,s*(r+0.12),0.0,0.95,'thrust');K.nozzle(s*(r+0.12),0.0,1.2,br*0.95,0.12,'thrust')}
  for(const s of[-1,1])K.finRudder(s*0.25,-0.02,-1.7,0.55+0.06*hd,0.22+0.06*hd,K.mS,{rz:s*2.7,noLight:true});
  K.finRudder(0,0.12+r*0.9,0.95,0.75,0.28+0.07*hd,K.mB);
  for(const s of[-1,1])K.wingFlap(s*r*0.95,0.12,0.9,0.6,0.28+0.05*hd,K.mS,s,{fixMat:K.mB,droop:-0.1});
  K.ammoBars(body,0.14,-1.2,0.044,8,0.95,0.16,st.ammo);
  K.done(0.95,1.15,2.6,0.1,[K.mB,K.mS,K.mA])},
 /* A heavy: a chamfered slab, four nacelles in two stacks, twin rudder fins, a rear wing that brakes, an ammo deck on the roof. */
 hauler(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.95+0.06*sh;
  const bw=1.45*hb,bh=0.62*hb,c=0.16,prof=new T.Shape();prof.moveTo(-bw/2+c,-bh/2);prof.lineTo(bw/2-c,-bh/2);prof.lineTo(bw/2,-bh/2+c);prof.lineTo(bw/2,bh/2-c*1.4);prof.lineTo(bw/2-c*1.6,bh/2);prof.lineTo(-bw/2+c*1.6,bh/2);prof.lineTo(-bw/2,bh/2-c*1.4);prof.lineTo(-bw/2,-bh/2+c);prof.closePath();
  const geo=new T.ExtrudeGeometry(prof,{depth:3.6,bevelEnabled:false});geo.translate(0,0,-2.0);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z<-1.0){const k=1-0.32*(-1.0-z);p.setX(i,p.getX(i)*k);p.setY(i,p.getY(i)*(0.85+0.15*k)-(1-k)*0.12)}}geo.computeVertexNormals();
  const hull=put(geo,K.mB,0,0.22,0);hull.userData.L=1;K.glassOn(hull,-1.75,-1.25,0.3);
  put(new T.BoxGeometry(bw*0.8,0.18+0.05*sh,0.1+0.06*sh),K.mA,0,0.0,-2.12,'shield');
  for(const s of[-1,1]){const k=put(K.finGeo([[0,0],[1.4+0.3*sh,0],[1.3+0.3*sh,0.18+0.04*sh],[0.1,0.22+0.04*sh]],0.04+0.015*sh),K.mA,s*(bw/2+0.02),-0.02,-1.2,'shield');k.rotation.z=s*-0.4}
  const r=0.17+0.015*sp,ex=bw/2+0.26,len=1.9+0.18*sp;for(const s of[-1,1])for(const yy of[0.5,0.06])K.nacelle(s*ex,yy,-0.4,r,len,{nL:0.2+0.05*th,bandMat:K.mD});
  for(const s of[-1,1])put(new T.BoxGeometry(0.2,0.62,1.2),K.mD,s*(bw/2+0.1),0.28,0.6);
  for(const s of[-1,1])K.wingFlap(s*0.05,0.8,1.0,0.75,ex+0.25+0.06*hd,K.mS,s,{fixMat:K.mB,droop:0});
  for(const s of[-1,1])K.finRudder(s*0.45,0.22+bh/2,0.75,0.95,0.34+0.09*hd,K.mS);
  // the ammo deck: bars across the roof in a sunken panel; as long as the ammo stat, dimming from the back
  put(new T.BoxGeometry(bw*0.55,0.02,1.0),K.mD,0,0.22+bh/2+0.005,-0.5);const lenK=0.3+0.7*(clamp(st.ammo,1,5)-1)/4;
  for(let k=0;k<10;k++){const box=new T.BoxGeometry(bw*0.5*lenK,0.012,0.05);box.translate(0,0.22+bh/2+0.018,-0.95+k*0.1);K.bars.push({geo:box,k})}
  K.done(ex+0.75,1.3,3.1,0,[K.mB,K.mS,K.mA])},
 /* A bevelled delta with the engines buried in the tail, wingtip rudders and brake flaps on the trailing edge. */
 dart(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.88+0.05*sh;
  const span=1.5+0.12*hd,tail=1.35,nose=2.7,shp=new T.Shape();shp.moveTo(0,nose);shp.lineTo(span,-tail);shp.lineTo(span*0.62,-tail+0.12);shp.lineTo(span*0.3,-tail+0.32);shp.lineTo(-span*0.3,-tail+0.32);shp.lineTo(-span*0.62,-tail+0.12);shp.lineTo(-span,-tail);shp.closePath();
  const wg=new T.ExtrudeGeometry(shp,{depth:0.06,bevelEnabled:true,bevelThickness:0.03,bevelSize:0.05,bevelSegments:1});wg.rotateX(-Math.PI/2);put(wg,K.mB,0,-0.04,0,'handling');
  const body=K.pod(0,0.12,-0.5,4.0,0.34*hb,0.62,{shape:t=>Math.pow(Math.sin(Math.PI*Math.pow(t,0.6)),0.7)*0.9+0.1*t,fx:1.2});K.glassOn(body,-0.32,-0.12);
  for(const s of[-1,1]){const c=put(K.finGeo([[0,0],[0.8+0.25*sh,0],[0.7+0.25*sh,0.09+0.03*sh],[0.15,0.12+0.03*sh]],0.035+0.01*sh),K.mA,s*0.36*hb,0.05,-1.5,'shield');c.rotation.z=s*-1.25}
  const r=0.15+0.02*sp;for(const s of[-1,1]){put(K.cylZ(r*1.05,r*1.05,1.0,8),K.mS,s*0.42,0.06,0.7,'speed').rotation.z=Math.PI/8;K.nozzle(s*0.42,0.06,1.2,r*0.9,0.18+0.05*th,'thrust')}
  for(const s of[-1,1])K.wingFlap(s*span*0.3,0.0,0.85,0.55,span*0.42,K.mS,s,{fixMat:K.mD,droop:0});
  for(const s of[-1,1])K.finRudder(s*span*0.95,0.0,0.5,0.75,0.25+0.09*hd,K.mS);
  K.ammoBars(body,0.12,-0.05,0.044,8,0.85,0.15,st.ammo);
  K.done(span+0.35,1.0,3.0,0,[K.mB,K.mS,K.mA])},
 /* A clean faceted ball that rolls with the speed (its band widens with shield), engines on a cradle cupping its back, and
    a tiny pilot pod riding just behind it on two energy tethers with the canopy, ammo bars, rudder and brake winglets. */
 orb(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,R=0.92,cy=0.42;
  const roll=new T.Group();roll.position.set(0,cy,0);K.g.add(roll);put(new T.IcosahedronGeometry(R,1),K.mB,0,0,0,null,roll);
  const bw=0.12+0.05*sh;for(let k=0;k<12;k++){const a=k/12*Math.PI*2,m=put(new T.BoxGeometry(bw,0.06,2*Math.PI*R/12*0.98),k%2?K.mS:K.mA,0,Math.cos(a)*R*0.99,Math.sin(a)*R*0.99,null,roll);m.rotation.x=a}
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.5,sd=k%2?1:-1,d=new T.Vector3(sd*0.55,Math.sin(a)*0.75,Math.cos(a)*0.75).normalize().multiplyScalar(R*0.985),m=K.quiet(put(new T.CircleGeometry(0.12,6),K.mS,d.x,d.y,d.z,null,roll));m.lookAt(d.clone().multiplyScalar(2).add(roll.position))}
  K.extra.spin=[{o:roll,ax:'x',k:-1/R}];
  const cr=new T.SphereGeometry(R*1.07,8,5,Math.PI*0.3,Math.PI*0.4,Math.PI*0.42,Math.PI*0.4);put(cr,new T.MeshLambertMaterial({color:0x161a22,flatShading:true,side:T.DoubleSide}),0,cy,0);
  const r=0.17+0.03*sp,len=0.6+0.12*sp;for(const s of[-1,1]){put(new T.BoxGeometry(0.34,0.08,0.22),K.mD,s*0.5,cy-0.1,R*0.86);K.nacelle(s*0.62,cy-0.12,R*0.7,r,len,{nL:0.18,bandMat:K.mD})}
  const pz=R+0.38,py=cy+R*0.98,pl=1.05,pod=K.pod(0,py,pz,pl,0.24,0.8);K.glassOn(pod,-0.36,-0.1);
  K.finRudder(0,py+0.12,pz+0.05,0.42,0.2+0.06*hd,K.mS,{t:0.035});
  for(const s of[-1,1])K.wingFlap(s*0.2,py-0.02,pz-0.05,0.4,0.16+0.07*hd,K.mS,s,{fixMat:K.mB,droop:0.15,t:0.03});
  const br=0.05+0.02*th;K.nozzle(0,py,pz+pl/2-0.08,br,0.08+0.02*th,'thrust');
  K.ammoBars(pod,py,pz-0.02,0.034,7,0.85,0.1,st.ammo);
  const tm=new T.MeshBasicMaterial({color:paint.stripe,transparent:true,opacity:0.7,blending:T.AdditiveBlending,depthWrite:false});K.extra.arc=tm;
  for(const s of[-1,1]){const a=new T.Vector3(s*0.2,cy+R*0.3,R*1.02),b=new T.Vector3(s*0.12,py-0.1,pz-0.2),d=b.clone().sub(a),Ln=d.length(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());
    const beam=K.quiet(put(new T.CylinderGeometry(0.025,0.025,Ln,5,1,true),tm,0,0,0));beam.position.copy(a).addScaledVector(d,0.5);beam.quaternion.copy(q);
    const core=K.quiet(put(new T.CylinderGeometry(0.008,0.008,Ln,4),K.lineM,0,0,0));core.position.copy(beam.position);core.quaternion.copy(q)}
  K.done(R+0.6,R+0.7,R+1.1,0.4,[K.mB,K.mS,K.mA])},
 /* A hover car: a faceted low body with flush glass on four spinning pads that shine a field of light down to the road;
    its rear wing brakes and the wing's endplates steer. */
 roller(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,hb=0.95+0.05*sh,bw=1.3*hb;
  const shp=new T.Shape();shp.moveTo(-1.9,0.18);shp.lineTo(1.75,0.18);shp.lineTo(2.08,0.3);shp.lineTo(1.2,0.5);shp.lineTo(0.55,0.64);shp.lineTo(-0.2,0.8);shp.lineTo(-0.95,0.76);shp.lineTo(-1.6,0.66);shp.lineTo(-1.98,0.48);shp.closePath();
  const bg=new T.ExtrudeGeometry(shp,{depth:bw-0.24,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.1,bevelSegments:1});bg.translate(0,0,-(bw-0.24)/2);bg.rotateY(Math.PI/2);bg.computeVertexNormals();
  const body=put(bg,K.mB,0,0,0);body.userData.L=1;K.glassOn(body,-0.6,0.35,0.55);
  const dr=0.42,dx=bw/2+0.08,fieldM=new T.MeshBasicMaterial({color:0x3ff0ff,transparent:true,opacity:0.24,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});K.extra.spin=[];K.extra.field=fieldM;
  for(const z of[-1.25,1.2])for(const s of[-1,1]){const dg=new T.Group();dg.position.set(s*dx,0.2,z);K.g.add(dg);put(new T.CylinderGeometry(dr,dr*0.92,0.11,8),K.mD,0,0,0,null,dg);
    const rim=K.quiet(put(new T.TorusGeometry(dr*0.96,0.028,4,8),K.lineM,0,0,0,null,dg));rim.rotation.x=Math.PI/2;
    for(let k=0;k<3;k++){const v=put(new T.BoxGeometry(dr*1.6,0.02,0.06),K.mT,0,0.065,0,null,dg);v.rotation.y=k*Math.PI/3}K.extra.spin.push({o:dg,ax:'y',k:0.06*s,w:3*s});
    K.quiet(put(new T.CircleGeometry(dr*0.82,8),K.glowM,s*dx,0.14,z)).rotation.x=Math.PI/2;K.quiet(put(new T.CylinderGeometry(dr*0.9,dr*0.6,0.26,8,1,true),fieldM,s*dx,0.02,z));
    K.quiet(put(new T.TorusGeometry(dr*0.8,0.02,4,8),fieldM,s*dx,-0.06,z)).rotation.x=Math.PI/2}
  put(new T.BoxGeometry(bw*0.8,0.1+0.04*sh,0.08+0.05*sh),K.mA,0,0.24,-2.1,'shield');
  for(const s of[-1,1]){const k=put(K.finGeo([[0,0],[1.2+0.3*sh,0],[1.1+0.3*sh,0.12+0.03*sh],[0.1,0.15+0.03*sh]],0.04+0.012*sh),K.mA,s*(bw/2+0.04),0.22,-0.6,'shield');k.rotation.z=s*-0.2}
  for(const s of[-1,1]){const er=0.1+0.02*sp;put(K.cylZ(er,er,0.3,6),K.mT,s*0.4,0.32,1.95,'speed');K.nozzle(s*0.4,0.32,2.08,er*0.95,0.12,'thrust')}
  const sw=bw*0.5+0.08*(hd-1),wy=0.98+0.05*hd;for(const s of[-1,1]){const t2=put(new T.BoxGeometry(0.05,wy-0.6,0.22),K.mD,s*0.32,(wy+0.6)/2,1.55);t2.rotation.x=0.25}
  for(const s of[-1,1])K.wingFlap(s*0.02,wy,1.3,0.55,sw,K.mS,s,{fixMat:K.mB,droop:-0.03});
  for(const s of[-1,1])K.finRudder(s*(sw+0.03),wy-0.12,1.25,0.65,0.32,K.mS,{rf:0.62,sweep:0.25});
  K.ammoBars(body,0.5,0.75,0.05,8,0.6,0.24,st.ammo);
  K.done(bw/2+0.75,1.0,2.7,0,[K.mB,K.mS,K.mA])},
 /* A monowheel: a big ring that rolls with the speed, glowing tread round it, a faceted pod with a flush canopy slung on
    the axle, engines on the axle ends with rudders and brake flaps. */
 mono(K,st,paint){const{put}=K,T=THREE,sp=st.speed,th=st.thrust,hd=st.handling,sh=st.shield,R=1.02,tube=0.16,cy=0.15;
  const ring=new T.Group();ring.position.set(0,cy,0);K.g.add(ring);put(new T.TorusGeometry(R,tube,6,24),K.mB,0,0,0,null,ring).rotation.y=Math.PI/2;
  put(new T.TorusGeometry(R-tube*0.9,0.035,4,24),K.mS,0,0,0,null,ring).rotation.y=Math.PI/2;
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2,m=put(new T.BoxGeometry(tube*2.2,0.05,0.2),k%2?K.mD:K.glowM,0,Math.cos(a)*(R+tube*0.9),Math.sin(a)*(R+tube*0.9),null,ring);m.rotation.x=a;if(!(k%2))K.quiet(m)}
  K.extra.spin=[{o:ring,ax:'x',k:-1/(R+tube)}];
  const pod=K.pod(0,cy-0.15,0.05,1.3,0.42*(0.9+0.05*sh),0.8);K.glassOn(pod,-0.42,-0.1);
  put(K.cylZ(0.1,0.1,tube*2.6+0.5,6),K.mT,0,cy,0).rotation.y=Math.PI/2;
  const r=0.15+0.028*sp,len=0.7+0.12*sp,ex=tube+0.38;for(const s of[-1,1]){put(new T.BoxGeometry(ex-0.05,0.07,0.2),K.mD,s*ex/2,cy,0);K.nacelle(s*ex,cy-0.05,-0.2,r,len,{nL:0.16,bandMat:K.mD})}
  const br=0.07+0.03*th;put(K.cylZ(br,br,0.3,6),K.mT,0,cy-0.45,0.45,'thrust');K.nozzle(0,cy-0.45,0.6,br*0.95,0.1,'thrust');
  for(const s of[-1,1]){const c=put(K.finGeo([[0,0],[0.5+0.12*sh,0],[0.42+0.12*sh,0.1+0.03*sh],[0.1,0.13+0.03*sh]],0.035+0.01*sh),K.mA,s*0.32,cy-0.25,-0.15,'shield');c.rotation.z=s*-1.1}
  for(const s of[-1,1])K.finRudder(s*ex,cy-0.05+r*0.9,-0.05,0.55,0.2+0.07*hd,K.mS);
  for(const s of[-1,1])K.wingFlap(s*(ex+r*0.9),cy-0.05,0.0,0.5,0.2+0.06*hd,K.mS,s,{fixMat:K.mB,droop:0.1});
  K.ammoBars(pod,cy-0.15,0.1,0.044,6,0.85,0.16,st.ammo);
  K.done(ex+0.6,cy+R*0.85,R+0.7,0,[K.mB,K.mS,K.mA])}};
function g0(K){return K.g}
SHIPB.saucer=SHIPB.mono; /* old builds and ghosts */
/* The Training cube: a light grey box with dark corner posts, cyan top edges, a window in the front face, crash-test
   discs on the sides and two plain engines. Always the same colours: it's the stock practice ship. */
SHIPB.cube=(K,st,paint)=>{const{put,lam,cylZ}=K,mB=lam(0xd6dae2),mS=lam(0x3ff0ff),mD=lam(0x1a1e26),mY=lam(0xffd24a),mK=lam(0x14161a),w=1.25,h=0.95,l=1.5,cy=0.22;
  put(new THREE.BoxGeometry(w,h,l),mB,0,cy,0);
  for(const x of[-1,1])for(const z of[-1,1])put(new THREE.BoxGeometry(0.08,h+0.02,0.08),mD,x*w/2,cy,z*l/2);
  for(const x of[-1,1])put(new THREE.BoxGeometry(0.07,0.07,l+0.02),mS,x*w/2,cy+h/2,0);
  put(new THREE.BoxGeometry(w*0.72,0.3,0.04),new THREE.MeshLambertMaterial({color:0x10141c,emissive:0x0a2a33}),0,cy+0.16,-l/2-0.015);
  for(const x of[-1,1])for(let q=0;q<4;q++){const d=put(new THREE.CircleGeometry(0.27,12,q*Math.PI/2,Math.PI/2),q%2?mK:mY,x*(w/2+0.006),cy+0.02,0.12);d.rotation.y=x*Math.PI/2}
  for(const x of[-1,1]){put(cylZ(0.17,0.2,0.45,12),mD,x*0.36,cy-0.2,l/2+0.225,'speed');K.trail(x*0.36,cy-0.2,l/2+0.46,0.3,'speed')}
  for(const x of[-1,1])K.flap(x*0.32,cy+h/2+0.01,l/2,0.42,0.36,mB);
  K.done(1.35,1.05,1.45,0.1,[mB,mS,mD])};
