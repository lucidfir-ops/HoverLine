//# track/004p-spirit-shapes.js: the Spirit realm's shapes as lists of line segments: rings, gyroscopes, knots, the five solids, the flower of life, nested solids, unfolding faces, heads, a colossus, a frame's outline, pieces of the other realms
/* Prototype 62: the line drawings of tools/spirit-proto/lib (objects.js, objects2.js, pieces.js), rewritten as plain
   segment lists ([[ax,ay,az],[bx,by,bz],pc] in the piece's own frame, metres) so a placer can drop them into a batch.
   pc is where on the palette each segment sits (most go by height). Nothing here is random unless given r. */
const SPS=(()=>{const TW=Math.PI*2,V=(x,y,z)=>[x,y,z];
  const ring=(rad,n,plane='xz',y=0,a0=0)=>Array.from({length:n},(_,i)=>{const a=a0+i*TW/n,c=Math.cos(a)*rad,s=Math.sin(a)*rad;return plane==='xz'?V(c,y,s):plane==='xy'?V(c,s,y):V(y,c,s)});
  const loop=(pts,pc=0,out=[])=>{for(let i=0;i<pts.length;i++)out.push([pts[i],pts[(i+1)%pts.length],pc]);return out};
  const path=(pts,pc=0,out=[])=>{for(let i=0;i<pts.length-1;i++)out.push([pts[i],pts[i+1],pc]);return out};
  /* the edges of a three.js solid, scaled */
  const edges=(geo,s=1,off=[0,0,0])=>{const e=new THREE.EdgesGeometry(geo,1),p=e.attributes.position,o=[];for(let i=0;i<p.count;i+=2){const a=[p.getX(i)*s+off[0],p.getY(i)*s+off[1],p.getZ(i)*s+off[2]],b=[p.getX(i+1)*s+off[0],p.getY(i+1)*s+off[1],p.getZ(i+1)*s+off[2]];o.push([a,b,0.5+(a[1]+b[1])/(4*s)])}e.dispose();geo.dispose();return o};
  const solid=(k,s,off)=>edges(k===0?new THREE.TetrahedronGeometry(1,0):k===1?new THREE.BoxGeometry(1.3,1.3,1.3):k===2?new THREE.OctahedronGeometry(1,0):k===3?new THREE.DodecahedronGeometry(1,0):new THREE.IcosahedronGeometry(1,0),s,off);
  /* a ring with ticks across it every few degrees (so its turn can be seen), in the plane normal to z */
  const tickRing=(rad,n,w,gap)=>{const o=[];for(let i=0;i<n;i++){const a=i*TW/n,b=(i+1-(gap&&i%4===3?0.6:0))*TW/n;o.push([V(Math.cos(a)*rad,Math.sin(a)*rad,0),V(Math.cos(b)*rad,Math.sin(b)*rad,0),i/n]);
    if(i%3===0)o.push([V(Math.cos(a)*(rad-w),Math.sin(a)*(rad-w),0),V(Math.cos(a)*(rad+w),Math.sin(a)*(rad+w),0),i/n])}return o};
  /* a torus knot (p,q) as nS strands round its line */
  const knot=(p,q,R0,r0,n,nS,th)=>{const at=t=>{const c=Math.cos(q*t);return[(R0+r0*c)*Math.cos(p*t),r0*Math.sin(q*t),(R0+r0*c)*Math.sin(p*t)]},S=[];
    for(let s=0;s<nS;s++){const pts=[];for(let i=0;i<=n;i++){const t=i/n*TW,a=at(t),b=at(t+0.01),tg=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...tg),u=[0,1,0],nx=[tg[1]*u[2]-tg[2]*u[1],tg[2]*u[0]-tg[0]*u[2],tg[0]*u[1]-tg[1]*u[0]],nl=Math.hypot(...nx)||1,
      ang=s*TW/nS+t*3,ny=[(nx[1]*tg[2]-nx[2]*tg[1])/nl/l,(nx[2]*tg[0]-nx[0]*tg[2])/nl/l,(nx[0]*tg[1]-nx[1]*tg[0])/nl/l],c=Math.cos(ang)*th,sn=Math.sin(ang)*th;
      pts.push([a[0]+nx[0]/nl*c+ny[0]*sn,a[1]+nx[1]/nl*c+ny[1]*sn,a[2]+nx[2]/nl*c+ny[2]*sn])}S.push(pts)}return S};
  /* the flower of life (19 circles) and Metatron's lines, in the xy plane */
  const flower=s=>{const o=[],rr=s/5,C=[[0,0]];for(let k=0;k<6;k++){const a=k*TW/6;C.push([Math.cos(a)*rr,Math.sin(a)*rr]);C.push([Math.cos(a)*rr*2,Math.sin(a)*rr*2]);C.push([Math.cos(a+TW/12)*rr*Math.sqrt(3),Math.sin(a+TW/12)*rr*Math.sqrt(3)])}
    for(const[cx,cy]of C)loop(ring(rr,28,'xy').map(p=>V(p[0]+cx,p[1]+cy,0)),Math.hypot(cx,cy)/s,o);loop(ring(rr*3,64,'xy'),0.9,o);
    const M=C.filter((c,i)=>i===0||i%3!==0).slice(0,13);for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j+=2)o.push([V(M[i][0],M[i][1],0.3),V(M[j][0],M[j][1],0.3),0.6]);return o};
  /* a head: rings of a head's profile (brow, nose, chin on +z) and meridians; height 1. Its face is a separate list (headFace, below) so
     it can be drawn in a colour of its own */
  const hprof=y=>{const t=y;return 0.36*Math.sqrt(Math.max(0,1-Math.pow((t-0.55)/0.52,2)))*(t<0.25?0.75+t:1)},hface=(a,y)=>{const fz=Math.max(0,Math.cos(a));let f=0;
      if(y>0.6&&y<0.72)f=0.06;else if(y>0.4&&y<0.6)f=0.11*Math.exp(-Math.pow((y-0.48)/0.05,2))*Math.pow(fz,6);else if(y<0.2&&y>0.05)f=0.05;return f*fz*fz};
  const hP=(a,y)=>{const r=hprof(y)+hface(a,y);return V(Math.sin(a)*r*0.9,y,Math.cos(a)*r)};
  const head=()=>{const o=[],nr=11,nm=12;
    for(let k=1;k<nr;k++){const y=0.04+k/nr*0.98,pts=[];for(let i=0;i<32;i++)pts.push(hP(i*TW/32,y));loop(pts,y,o)}
    for(let m=0;m<nm;m++){const a=m*TW/nm,pts=[];for(let k=0;k<=20;k++)pts.push(hP(a,0.04+k/20*0.98));path(pts,0.5,o)}return o};
  /* Prototype 63 (Eric: "a deeply contrasting colour should be used so you can see their features"): the face as bold lines laid
     just off the head's skin: two almond eyes with an iris ring, brows, the nose and a mouth with its corners */
  const headFace=()=>{const o=[],on=(x,y,lift=0.02)=>{let lo=-1.3,hi=1.3;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(hP(m,y)[0]<x)lo=m;else hi=m}const p=hP((lo+hi)/2,y);return V(p[0],p[1],p[2]+lift)};
    const poly=(pts,closed,pc)=>{const q=pts.map(p=>on(p[0],p[1]));for(let i=0;i<q.length-1;i++)o.push([q[i],q[i+1],pc]);if(closed)o.push([q[q.length-1],q[0],pc])};
    for(const sx of[-1,1]){const ex=sx*0.13,ey=0.625,alm=[];for(let i=0;i<10;i++){const t=i*TW/10;alm.push([ex+Math.cos(t)*0.075,ey+Math.sin(t)*0.034])}poly(alm,true,0.1);
      const ir=[];for(let i=0;i<8;i++){const t=i*TW/8;ir.push([ex+Math.cos(t)*0.026,ey+Math.sin(t)*0.026])}poly(ir,true,0.9);
      poly([[sx*0.05,0.69],[sx*0.12,0.715],[sx*0.21,0.7]],false,0.5);poly([[sx*0.06,0.675],[sx*0.12,0.695],[sx*0.2,0.68]],false,0.5)}
    poly([[0,0.66],[0,0.55],[-0.04,0.48],[0,0.455],[0.04,0.48],[0,0.55]],false,0.4);
    poly([[-0.14,0.31],[-0.07,0.285],[0,0.28],[0.07,0.285],[0.14,0.31],[0.07,0.265],[0,0.255],[-0.07,0.265],[-0.14,0.31]],false,0.7);
    poly([[-0.1,0.2],[0,0.19],[0.1,0.2]],false,0.3);return o};
  /* a colossus from the waist up (the floor is at y = 0): rings of the torso, shoulders, arms hanging into the floor; its head
     (a ring head with a face) separately, about the neck at headAt */
  const colossus=H=>{const o=[],sides=10,R0=H*0.09,R1=H*0.16,top=H*0.5,rings=10;const rs=[];
    for(let i=0;i<=rings;i++){const f=i/rings,y=f*top,r=(R0+(R1-R0)*Math.pow(f,1.4))*(1-0.15*Math.sin(f*Math.PI));const R=ring(r,sides,'xz',y,i*0.12);rs.push(R);loop(R,f*0.7,o)}
    for(let s=0;s<sides;s++)for(let i=0;i<rings;i++)o.push([rs[i][s],rs[i+1][s],i/rings*0.7]);
    for(const sx of[-1,1]){const sh=[sx*R1*1.05,top*0.94,0],el=[sx*R1*1.5,top*0.45,H*0.05],wr=[sx*R1*1.6,-H*0.05,H*0.02];path([sh,el,wr],0.5,o);path([[sh[0],sh[1],sh[2]+R0*0.4],[el[0],el[1],el[2]+R0*0.4],[wr[0],wr[1]+H*0.02,wr[2]+R0*0.4]],0.55,o)}
    const hd=[],hR=H*0.075,hy=top+H*0.04;for(let k=0;k<5;k++){const y=hy+k/4*hR*2.2,r=hR*Math.sin(Math.PI*(0.15+0.7*k/4));loop(ring(r,14,'xz',y-hy),0.8+k*0.05,hd)}
    for(let s=0;s<14;s+=2){const a=s*TW/14,pts=[];for(let k=0;k<=8;k++){const y=k/8*hR*2.2,r=hR*Math.sin(Math.PI*(0.15+0.7*k/8));pts.push(V(Math.cos(a)*r,y,Math.sin(a)*r))}path(pts,0.85,hd)}
    loop(ring(hR*1.45,24,'xy').map(p=>V(p[0],p[1]+hR*1.1,-hR*0.3)),1,hd);for(const sx of[-1,1])loop(ring(hR*0.16,8,'xy').map(p=>V(p[0]+sx*hR*0.35,p[1]+hR*1.15,hR*0.85)),1,hd);
    return{body:o,head:hd,neck:[0,hy,0]}};
  /* a frame's outline (for ghost riders and echoes): a wedge with fins, about 4 m long, nose on +z */
  const rider=()=>{const o=[],P=[V(0,0.3,2.2),V(0.9,0.2,-1.4),V(-0.9,0.2,-1.4),V(0,0.9,-1.2)];for(const[a,b]of[[0,1],[0,2],[1,2],[0,3],[1,3],[2,3]])o.push([P[a],P[b],0.6]);
    for(const sx of[-1,1]){o.push([V(sx*0.9,0.2,-1.4),V(sx*1.5,0.1,-1.8),0.8],[V(sx*1.5,0.1,-1.8),V(sx*0.7,0.3,0),0.8],[V(sx*0.5,0.5,-1.3),V(sx*0.5,0.5,-2.6),0.3])}return o};
  /* pieces of the other realms, each on a torn-off base: Prism's contour rock, an Urban block, a Reef coral head, a Forest
     crown (a few metres to tens; r draws their shape) */
  const realm=(kind,s,r)=>{const o=[];
    if(kind===0){const n=7,rs=[];for(let k=0;k<=n;k++){const y=-0.3*s+k/n*1.2*s,w=s*0.55*(1-k/n)*(0.8+0.4*r());rs.push(ring(Math.max(w,0.4),9,'xz',y,r()).map(p=>V(p[0]*(0.8+0.4*r()),p[1],p[2]*(0.8+0.4*r()))))}
      rs.forEach((R,k)=>loop(R,k/n,o));for(let i=0;i<9;i+=2)path(rs.map(R=>R[i]),0.5,o)}
    else if(kind===1){const w=s*0.5,h=s*1.4;o.push(...edges(new THREE.BoxGeometry(w*2,h,w*2),1,[0,h/2-0.3*s,0]));for(let y=-0.3*s+3;y<h-0.3*s;y+=3)for(const[sx,sz]of[[1,0],[0,1],[-1,0],[0,-1]]){const a=V(sx?sx*w*1.01:-w,y,sz?sz*w*1.01:-w),b=V(sx?sx*w*1.01:w,y,sz?sz*w*1.01:w);o.push([a,b,(y+0.3*s)/h])}}
    else if(kind===2){const br=(p,d,l,dp)=>{const q=V(p[0]+d[0]*l,p[1]+d[1]*l,p[2]+d[2]*l);o.push([p,q,dp/4]);if(dp<4)for(let k=0;k<2;k++){const nd=[d[0]+(r()-0.5)*1.2,d[1]+0.3,d[2]+(r()-0.5)*1.2],nl=Math.hypot(...nd);br(q,nd.map(x=>x/nl),l*0.7,dp+1)}};
      for(let k=0;k<3;k++){const a=k*TW/3;br(V(0,-0.3*s,0),[Math.cos(a)*0.4,0.9,Math.sin(a)*0.4],s*0.45,0)}loop(ring(s*0.5,12,'xz',-0.3*s),0,o)}
    else{path([V(0,-0.3*s,0),V(0,s*0.5,0)],0.2,o);for(let k=0;k<3;k++){const y=s*(0.45+k*0.25),rr=s*(0.6-k*0.15);loop(ring(rr,16,'xz',y),0.4+k*0.2,o)}for(let k=0;k<8;k++){const a=k*TW/8;o.push([V(Math.cos(a)*s*0.6,s*0.45,Math.sin(a)*s*0.6),V(0,s*1.2,0),0.9])}}
    loop(ring(s*0.5,8,'xz',-0.3*s).map((p,i)=>V(p[0],p[1]-(i%2?s*0.15:0),p[2])),0.1,o);return o};
  return{V,ring,loop,path,edges,solid,tickRing,knot,flower,head,colossus,rider,realm,headFace}})();
