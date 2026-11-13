//# track/004l-biome-prism-edges.js: Prism's joins, where its pieces meet: rock skirts round the lakes and pools, banks along the cavern rivers, and the gates at the cave mouths
/* Prototype 61 (the split of 004-track.js): the parts of the Prism builder (004k) where one piece of scenery meets another,
   which is where its clipping bugs have been, each a function of what it is given (pz) and nothing else.
   prismSkirts({group,PR,clearTri,scan,skirts,rivers,rockMat,glowAt,vn,floorAt}) hangs the skirts, builds the river banks and returns their two materials {skirtIn, skirtOut};
   prismGates({seed,N,ds,P,R,U,group,PR,mode,ins,Mh,bil,glowAt,hewIn,hewOut,vn,surfH,inRoad,clearTri}) builds the gates and the rubble at their feet and returns how many;
   prismColumns({...}) the rock columns in the middle of the spirals (Prototype 64). */
function prismSkirts(pz){const{group,PR,clearTri,scan,skirts,rivers,rockMat,glowAt,vn,floorAt}=pz;
    /* Prototype 60: a skirt of rock from the edge of each lake, pool and caldera lake down into the ground, a little
       outward, so that wherever the ground round it is lower than the liquid the edge meets rock, never air: from the side
       a lake used to show as a flat sheet floating over the slope (Eric's photos of the lava and water lakes). Where the
       ground is higher, the skirt is under it and unseen. Its top ring is the liquid's own edge. */
    PR.skirts=[];const skirt=(q)=>{const pos=[],ind=[],n=q.n;for(let k=0;k<n;k++){const a=k/n*TAU,c=Math.cos(a),s2=Math.sin(a),r0=q.rho(a),r1=r0+q.out;pos.push(q.x+c*r0,q.y,q.z+s2*r0,q.x+c*r1,q.y-q.dep,q.z+s2*r1)}
      for(let k=0;k<n;k++){const a=k*2,b=((k+1)%n)*2;for(const t of[[a,a+1,b],[b,a+1,b+1]]){const A=t.map(v=>v*3);if(clearTri(pos[A[0]],pos[A[0]+1],pos[A[0]+2],pos[A[1]],pos[A[1]+1],pos[A[1]+2],pos[A[2]],pos[A[2]+1],pos[A[2]+2]))ind.push(...t)}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);if(q.inside)for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,q.inside?skirtIn:skirtOut);group.add(m);PR.skirts.push(m)};
    const skirtIn=rockMat(true),skirtOut=rockMat(false);for(const q of skirts)skirt(q);
    /* Prototype 64: the cavern rivers get the lakes' treatment (Eric: "rivers of lava and water inside caves need the same
       raised ground border / inset that was used to good effect with the lakes, as currently they appear to be non
       constrained"). Prototype 61 only hung a bank under each edge, so from above the river was a sheet with nothing
       round it. Now a bank of rock runs all the way round it, one closed loop following its bends and round both of its
       ends (the sheet is round there too, 004k): its inner foot is under the liquid, it comes up through the surface 2 to
       3 m inside the sheet's edge (so the edge is inside the rock, never seen), stands 3 to 8 m over the liquid, and falls
       away outside into the cavern floor (at least 6 m under the liquid, 3 m under the floor). Under a road it is kept
       well down (3 m under the road at most), and a triangle that would still reach into the road's space is left out,
       as round the lakes. */
    PR.bankCut=0;for(const pts of rivers){const n=pts.length;if(n<2)continue;
      const Lp=[],side=(j,sd)=>{const q=pts[j];Lp.push({x:q.x+sd*q.rx*q.w,z:q.z+sd*q.rz*q.w,y:q.y,nx:sd*q.rx,nz:sd*q.rz})},
        cap=(j,e)=>{const q=pts[j],o=pts[j-e]||q;let fx=q.x-o.x,fz=q.z-o.z;const l=Math.hypot(fx,fz)||1;fx/=l;fz/=l;
          for(let k=1;k<8;k++){const t=k/8*Math.PI,a=Math.cos(t),b=Math.sin(t),nx=-e*a*q.rx+b*fx,nz=-e*a*q.rz+b*fz;Lp.push({x:q.x+nx*q.w,z:q.z+nz*q.w,y:q.y,nx,nz})}};
      const js=[];for(let j=0;j<n-1;j+=2)js.push(j);js.push(n-1);
      for(const j of js)side(j,-1);cap(n-1,1);for(let k=js.length-1;k>=0;k--)side(js[k],1);cap(0,-1);
      /* the bank's cross-section (out from the sheet's edge, up from the liquid), its crest wandering in height round the loop */
      const OF=[-7,-2.5,1.5,5,10,16],nP=OF.length,nL=Lp.length,pos=[],ind=[];let arc=0;
      Lp.forEach((q,k)=>{if(k)arc+=Math.hypot(q.x-Lp[k-1].x,q.z-Lp[k-1].z);const hc=3+5*vn(arc/38+rivers.indexOf(pts)*7.1,2.2);
        let lim=1e9;scan(q.x,q.z,W/2+2+OF[nP-1]+2,o=>{lim=Math.min(lim,o.y-3-q.y)});
        const fo=floorAt(q.x+q.nx*OF[nP-1],q.z+q.nz*OF[nP-1]),foot=Math.max(-60,Math.min(-6,fo-q.y-3));
        const H=[-2.5,0.6,0.85*hc,hc,0.55*hc,foot];
        for(let p=0;p<nP;p++){const jt=(p>0&&p<nP-1)?vn(k+101,p+7)-0.5:0,o=OF[p]+jt*1.6,h=p>0&&p<nP-1?Math.min(H[p]+jt*1.2,lim):H[p];
          pos.push(q.x+q.nx*o,q.y+h,q.z+q.nz*o)}});
      for(let k=0;k<nL;k++){const k2=(k+1)%nL;for(let p=0;p<nP-1;p++){const A=k*nP+p,B=k2*nP+p;for(const t of[[A,B,A+1],[A+1,B,B+1]]){const T3=t.map(v=>v*3);
        if(clearTri(pos[T3[0]],pos[T3[0]+1],pos[T3[0]+2],pos[T3[1]],pos[T3[1]+1],pos[T3[1]+2],pos[T3[2]],pos[T3[2]+1],pos[T3[2]+2]))ind.push(...t);else PR.bankCut++}}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,skirtIn);group.add(m);PR.skirts.push(m)}
    return{skirtIn,skirtOut}}
function prismGates(pz){const{seed,N,ds,P,R,U,group,PR,mode,ins,Mh,bil,glowAt,hewIn,hewOut,vn,surfH,inRoad,clearTri}=pz;
    /* cave mouths: where the road goes into the mountain (or comes out), the mountain arches over it (the lift above) and a
       short ragged tunnel runs through to the cavern, which opens out round you as you come through */
    /* Prototype 61: the ways in and out are a gate now, not a ragged tunnel pressed under the mountain's surface. Four goes
       at the natural look left jagged slabs every time (W1AAE848-P): the mountain lifted over the road, the cavern's roof,
       the tunnel and the hole for the road all met there, each clipped against the others. The gate is one smooth
       thick-walled arch along the road, from 18 m outside the rock to 34 m inside the cavern: its inner face lies just
       inside the space the rock is kept out of (so no rock can show through it), its outer face is wide and tall enough to
       take in the lifted rock and the hole's edges, and it is closed at both ends. Nothing clips it, so it has no shards. */
    /* Prototype 64: hewn (Eric: "could we make them look a little rough hewn and natural, without returning to the
       previous broken and missing textures?"). Still one closed mesh that nothing clips and that loses no triangle, but
       every point is moved by seeded noise: the inner face only outward, away from the road (0.4 to 2.6 m on the walls, at
       most 1 m at the crown, so it stays inside the room the rock is kept out of and no rock shows through it), the outer
       face in or out (-1.5 to 4.5 m). The noise has a broad part (the cross-section changes along the gate, bulging and
       narrowing every 10 m or so) and a fine part (a 3 m grid of points each a little off, which with the facet shading
       of rockMat(...,true) reads as chiselled faces). The lip at each end is ragged: each point of the arch reaches 1 to 6
       m further out than its neighbours, and a middle ring between the inner and outer face juts out again, so the end is
       a broken edge of rock, closed all round. At the outside foot of each gate lie a few boulders and some rubble, each a
       closed stone of its own, half sunk in the mountainside, never in the road's space (a stone that would be goes whole). */
    let nMouth=0;PR.gates=[];PR.rubble=[];PR.gateL=[];if(mode==='mix'){const gIn=[],gOut=[],gP=[],rr=rng((seed^0x6a7e5)>>>0),SV=[],SI=[],
      prof=(hw,bot,spr,apx)=>{const q=[];for(let k=0;k<=3;k++)q.push([-hw,bot+(spr-bot)*k/3]);for(let k=1;k<16;k++){const a=Math.PI*k/16;q.push([-hw*Math.cos(a),spr+(apx-spr)*Math.sin(a)])}
        for(let k=3;k>=0;k--)q.push([hw,bot+(spr-bot)*k/3]);for(let k=1;k<4;k++)q.push([hw-2*hw*k/4,bot]);return q},
      pI=prof(W/2+0.8,-1.3,13,24),pO=prof(W/2+12,-9,13,38),nr=pI.length;
    /* each profile point's outward normal (the profile runs clockwise) and its distance round the profile (for the noise) */
    const nrm=pr=>pr.map((q,a)=>{const p0=pr[(a-1+nr)%nr],p1=pr[(a+1)%nr];let nx=0,ny=0;for(const[A,B]of[[p0,q],[q,p1]]){const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1;nx+=-dy/l;ny+=dx/l}const l=Math.hypot(nx,ny)||1;return[nx/l,ny/l]}),
      nI=nrm(pI),nO=nrm(pO),arc=[0];for(let a=1;a<nr;a++)arc.push(arc[a-1]+Math.hypot(pI[a][0]-pI[a-1][0],pI[a][1]-pI[a-1][1]));
    /* how far the inner face may go out: to 0.15 m inside the room the rock is kept out of (W/2+2 across, 26 m up), at most
       1.6 m; 0.6 m under the road */
    const capI=pI.map(([x,y],a)=>{const[nx,ny]=nI[a];if(y<=-1)return 0.6;let c=1.6;if(Math.abs(nx)>1e-3)c=Math.min(c,(W/2+1.85-Math.abs(x))/Math.abs(nx));if(ny>1e-3)c=Math.min(c,(25.85-y)/ny);return Math.max(0,c)});
    const mouth=(i0,dir)=>{let s0=Math.round(8/ds);for(let s=s0;s<Math.round(240/ds);s++){const q=P[((i0-s*dir)%N+N)%N];if(bil(Mh,q.x,q.z)>q.y+28)s0=s;else if(s>s0+Math.round(12/ds))break}
      const pad=Math.round(18/ds),iF=i0-(s0+pad)*dir,L=s0+pad+Math.round(34/ds),st=Math.max(1,Math.round(3/ds)),rows=[];for(let s=0;s<L;s+=st)rows.push(s);rows.push(L);
      const v0=gP.length/3,nR=rows.length,isIn=rows.map(s=>!!ins[((iF+s*dir)%N+N)%N]),K=nMouth*57+3,ix=s=>((iF+s*dir)%N+N)%N;
      /* (a point x across and y up in the frame the rock is kept out in: across level, up plumb, from the road's banked
         surface. In the road's own frame, on a banked bend the top of the high side's wall leaned out past the room kept
         clear of rock, and the mountain showed inside the tunnel as a black slab: 2-P at 8.1 km, banked 19 degrees) */
      const put=(s,x,y)=>{const i=ix(s),p=P[i],r=R[i],rl=Math.hypot(r.x,r.z)||1,b=clamp(x*r.y/rl,-W*0.4,W*0.4);gP.push(p.x+r.x/rl*x,p.y+y+b,p.z+r.z/rl*x)};
      /* the ragged lip: how many samples further out each point of each end reaches */
      const ext=[0,1].map(e=>pI.map((_,a)=>Math.round((1+5*vn(a+K+e*31,e*7+2))/ds)));
      const D2=[[],[]];/* the moved profile points of the end rows, for the lip's middle ring */
      for(const o of[0,1])for(let j=0;j<nR;j++)for(let a=0;a<nr;a++){const end=j===0?0:j===nR-1?1:-1,s=rows[j]+(end===0?-ext[0][a]:end===1?ext[1][a]:0),m=s*ds,c=arc[a];
        const[x,y]=(o?pO:pI)[a],[nx,ny]=(o?nO:nI)[a];
        const d=o?-1.5+6*(0.6*vn(m/13+K+40,c/9+3)+0.4*vn(m/3+K+80,c/2.7+5)):capI[a]*(0.15+0.6*vn(m/9+K,c/7)+0.25*vn(m/2.3+K+20,c/2.1+9));
        put(s,x+nx*d,y+ny*d);if(end>=0)(D2[end][a]=D2[end][a]||[])[o]=[x+nx*d,y+ny*d,s]}
      /* the lip's middle rings: halfway through the wall, jutting 0.5 to 3 m further out again */
      const vM=gP.length/3;for(const e of[0,1])for(let a=0;a<nr;a++){const[A,B]=D2[e][a],j2=vn(a+K+60,e*5+11)-0.5,mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,[nx,ny]=nO[a];
        put(A[2]+(e?1:-1)*Math.round((0.5+2.5*vn(a+K+90,e*3+1))/ds),mx+nx*j2*2.5,my+ny*j2*2.5)}
      const at=(o,j,a)=>v0+(o*nR+j)*nr+a%nr,mid=(e,a)=>vM+e*nr+a%nr,quad=(I,A,B,C,D)=>I.push(A,B,C,B,D,C);
      for(let j=0;j<nR-1;j++)for(let a=0;a<nr;a++){quad(gIn,at(0,j,a),at(0,j,a+1),at(0,j+1,a),at(0,j+1,a+1));quad(isIn[j]&&isIn[j+1]?gIn:gOut,at(1,j,a),at(1,j,a+1),at(1,j+1,a),at(1,j+1,a+1))}
      for(let a=0;a<nr;a++)for(const[e,j,I]of[[0,0,gOut],[1,nR-1,gIn]]){quad(I,at(0,j,a),at(0,j,a+1),mid(e,a),mid(e,a+1));quad(I,mid(e,a),mid(e,a+1),at(1,j,a),at(1,j,a+1))}
      /* boulders against the gate's outside walls and rubble in front of its outer lip, on the mountainside */
      for(let k=0,nb=0,ns=0;k<48&&(nb<4||ns<8);k++){const big=nb<4&&(ns>=8||k%3===0),rad=big?2.5+rr()*3.5:0.6+rr()*1.4,sd=rr()<0.5?-1:1,m=big?-8+rr()*24:-22+rr()*18,
          lat=big?W/2+12+rad*0.6+rr()*6:m<0?W/2+3+rad*1.4+rr()*16:W/2+13+rad*1.4+rr()*8,sy=0.55+rr()*0.3,ry=rr()*TAU,js=[];for(let q=0;q<12;q++)js.push(0.72+rr()*0.56);
        const i=ix(Math.round(m/ds)),p=P[i],r=R[i],rl=Math.hypot(r.x,r.z)||1,x=p.x+r.x/rl*lat*sd,z=p.z+r.z/rl*lat*sd;
        /* (on fairly level ground only: on a steep slope it would be half buried on one side and float on the other) */
        let lo=Infinity,hi=-Infinity;for(const[dx,dz]of[[rad,0],[-rad,0],[0,rad],[0,-rad]]){const h=surfH(x+dx*0.8,z+dz*0.8);lo=Math.min(lo,h);hi=Math.max(hi,h)}const g=surfH(x,z);
        if(!isFinite(g)||!isFinite(hi)||hi-lo>rad*sy*1.8||g<p.y-30||g>p.y+14)continue;
        if(hewnStone(SV,SI,x,g+rad*sy*0.25,z,rad,sy,ry,js,inRoad,clearTri)){if(big)nb++;else ns++}}
      PR.gateL.push({i:ix(0),dir,n:L});nMouth++};
    for(const c of (()=>{const L=[];for(let i=0;i<N;){if(!ins[i]){i++;continue}let n=0;while(i+n<N&&ins[i+n])n++;L.push([i,n]);i+=n}return L})()){
      if(!ins[(c[0]-1+N)%N])mouth(c[0],1);const e=(c[0]+c[1])%N;if(!ins[e])mouth(e,-1)}
    for(const[I,mat,glow]of[[gIn,hewIn,true],[gOut,hewOut,false]]){if(!I.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(gP,3));g.setIndex(I);g.computeVertexNormals();
      const gl=new Float32Array(gP.length);if(glow)for(let k=0;k<gP.length;k+=3)glowAt(gP[k],gP[k+1],gP[k+2],gl,k);g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,mat);group.add(m);PR.gates.push(m)}
    if(SI.length){const m=hewnMesh(SV,SI,hewOut,null);group.add(m);PR.rubble.push(m)}}
    return nMouth}
/* Prototype 64: a stone (a boulder, a piece of rubble): an icosahedron with each point pulled in or out (js, 12 numbers),
   squashed (sy) and turned (ry), added to SV/SI whole if every point is out of the road's space and every face clear of it */
const ICO=(()=>{const t=(1+Math.sqrt(5))/2,l=Math.hypot(1,t),v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(q=>q.map(c=>c/l));
  return{v,f:[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1]}})();
function hewnStone(SV,SI,x,y,z,rad,sy,ry,js,inRoad,clearTri){const c=Math.cos(ry),s=Math.sin(ry),Q=[];
  ICO.v.forEach((q,k)=>{const j=js[k]*rad,a=q[0]*j,b=q[1]*j*sy,d=q[2]*j;Q.push(x+a*c-d*s,y+b,z+a*s+d*c)});
  for(let k=0;k<Q.length;k+=3)if(inRoad(Q[k],Q[k+1],Q[k+2]))return false;
  for(let t=0;t<ICO.f.length;t+=3){const A=ICO.f[t]*3,B=ICO.f[t+1]*3,C=ICO.f[t+2]*3;if(!clearTri(Q[A],Q[A+1],Q[A+2],Q[B],Q[B+1],Q[B+2],Q[C],Q[C+1],Q[C+2]))return false}
  const b=SV.length/3;for(const v of Q)SV.push(v);for(const f of ICO.f)SI.push(b+f);return true}
/* Prototype 64: one mesh of hewn rock from points and faces, with the cavern light baked into it when glowAt is given */
function hewnMesh(V,I,mat,glowAt){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(V,3));g.setIndex(I);g.computeVertexNormals();
  const gl=new Float32Array(V.length);if(glowAt)for(let k=0;k<V.length;k+=3)glowAt(V[k],V[k+1],V[k+2],gl,k);g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));return new THREE.Mesh(g,mat)}
/* Prototype 64: the middle of every spiral (helix) on Prism: a column of rock where the night biomes stand a black
   monolith (it stood in the caverns from far under the floor to far over the roof: Eric's "giant black cube"). In a
   cavern it runs from under the floor to over the roof, wider at both ends, and is kept under the mountain's outside;
   outside it is a pinnacle from under the ground to 25 to 40 m over the top of the spiral. Ten points a ring, rings every
   13 m or so, each point a little in or out and each ring a little off the line, closed at both ends, in the hewn rock.
   It is as wide as the spiral leaves room for (at most 0.55 of the room, 38 m); any point in the road's space and it is
   made narrower, up to three times, or left out. pz: {hx (helixMiddles' list), PR, group, zoneAt, F, C, ground, surfH,
   inRoad, clearTri, glowAt, hewIn, hewOut, vn}; returns how many it built. */
function prismColumns(pz){const{hx,PR,group,zoneAt,F,C,ground,surfH,inRoad,clearTri,glowAt,hewIn,hewOut,vn}=pz;
  PR.cols=[];const VI=[[],[]],II=[[],[]];let nC=0;
  hx.forEach(({cx0:x,cz0:z,rt,top},h)=>{const inC=zoneAt(x,z)?1:0,K=h*13+5;
    for(let tr=0,rad=Math.min(rt*0.42,38);tr<4;tr++,rad*=0.8){let yb=1e9,yt=-1e9;
      for(let a=0;a<8;a++){const px=x+Math.cos(a/8*TAU)*rad*1.3,pz2=z+Math.sin(a/8*TAU)*rad*1.3;if(inC){yb=Math.min(yb,F(px,pz2));yt=Math.max(yt,C(px,pz2))}else yb=Math.min(yb,ground(px,pz2))}
      yb-=8;yt=inC?yt+8:top+25+15*vn(K,3);const rs=10,nh=clamp(Math.round((yt-yb)/13),6,40),Q=[];
      for(let k=0;k<=nh;k++){const t=k/nh,y=yb+(yt-yb)*t,pr=inC?0.6+0.4*Math.abs(2*t-1)**1.6:1.05-0.65*t**1.1,ox=rad*0.24*(vn(t*3+K,1.5)-0.5),oz=rad*0.24*(vn(t*3+K,7.5)-0.5);
        for(let q=0;q<rs;q++){const an=(q+0.5*(k%2))/rs*TAU,j=rad*pr*(0.8+0.4*vn(k+K*7,q+3));Q.push(x+ox+Math.cos(an)*j,y+(vn(k+K,q+40)-0.5)*4,z+oz+Math.sin(an)*j)}}
      Q.push(x,yb-2,z,x,inC?yt+2:yt+rad*0.25,z);
      if(inC)for(let k=0;k<Q.length;k+=3)Q[k+1]=Math.min(Q[k+1],surfH(Q[k],Q[k+2])-2);
      const I=[],nv=Q.length/3,b0=nv-2,b1=nv-1;for(let k=0;k<nh;k++)for(let q=0;q<rs;q++){const A=k*rs+q,B=k*rs+(q+1)%rs,Cc=A+rs,D=B+rs;I.push(A,Cc,B,B,Cc,D)}
      for(let q=0;q<rs;q++){I.push(b0,q,(q+1)%rs);I.push(b1,nh*rs+(q+1)%rs,nh*rs+q)}
      let ok=true;for(let k=0;k<Q.length&&ok;k+=3)if(inRoad(Q[k],Q[k+1],Q[k+2]))ok=false;
      for(let t=0;t<I.length&&ok;t+=3){const A=I[t]*3,B=I[t+1]*3,Cc=I[t+2]*3;ok=clearTri(Q[A],Q[A+1],Q[A+2],Q[B],Q[B+1],Q[B+2],Q[Cc],Q[Cc+1],Q[Cc+2])}
      if(!ok)continue;const V=VI[inC],b=V.length/3;for(const v of Q)V.push(v);for(const v of I)II[inC].push(b+v);nC++;break}});
  for(const c of[0,1]){if(!II[c].length)continue;const m=hewnMesh(VI[c],II[c],c?hewIn:hewOut,c?glowAt:null);group.add(m);(c?PR.meshes:PR.cols).push(m)}
  return nC}
