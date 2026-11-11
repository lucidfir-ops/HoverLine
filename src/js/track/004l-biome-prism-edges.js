//# track/004l-biome-prism-edges.js: Prism's joins, where its pieces meet: rock skirts round the lakes and pools, banks along the cavern rivers, and the gates at the cave mouths
/* Prototype 61 (the split of 004-track.js): the parts of the Prism builder (004k) where one piece of scenery meets another,
   which is where its clipping bugs have been, each a function of what it is given (pz) and nothing else.
   prismSkirts({group,PR,clearTri,skirts,rivers,rockMat,glowAt}) hangs the skirts and banks and returns their two materials {skirtIn, skirtOut};
   prismGates({N,ds,P,R,U,group,PR,mode,ins,Mh,bil,glowAt,skirtIn,skirtOut}) builds the gates and returns how many. */
function prismSkirts(pz){const{group,PR,clearTri,skirts,rivers,rockMat,glowAt}=pz;
    /* Prototype 60: a skirt of rock from the edge of each lake, pool and caldera lake down into the ground, a little
       outward, so that wherever the ground round it is lower than the liquid the edge meets rock, never air: from the side
       a lake used to show as a flat sheet floating over the slope (Eric's photos of the lava and water lakes). Where the
       ground is higher, the skirt is under it and unseen. Its top ring is the liquid's own edge. */
    PR.skirts=[];const skirt=(q)=>{const pos=[],ind=[],n=q.n;for(let k=0;k<n;k++){const a=k/n*TAU,c=Math.cos(a),s2=Math.sin(a),r0=q.rho(a),r1=r0+q.out;pos.push(q.x+c*r0,q.y,q.z+s2*r0,q.x+c*r1,q.y-q.dep,q.z+s2*r1)}
      for(let k=0;k<n;k++){const a=k*2,b=((k+1)%n)*2;for(const t of[[a,a+1,b],[b,a+1,b+1]]){const A=t.map(v=>v*3);if(clearTri(pos[A[0]],pos[A[0]+1],pos[A[0]+2],pos[A[1]],pos[A[1]+1],pos[A[1]+2],pos[A[2]],pos[A[2]+1],pos[A[2]+2]))ind.push(...t)}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);if(q.inside)for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,q.inside?skirtIn:skirtOut);group.add(m);PR.skirts.push(m)};
    const skirtIn=rockMat(true),skirtOut=rockMat(false);for(const q of skirts)skirt(q);
    /* Prototype 61: the rivers under the road get the lakes' fix: their sheet lay about 5 m over its bed with its edges in
       the air (Eric, after Prototype 60: "it might need to be applied to the rivers below the tracks as well"). A bank of
       rock now hangs from each edge, 10 m out and 18 m down into the floor, and across both ends */
    for(const pts of rivers){const pos=[],ind=[],n=pts.length;if(n<2)continue;
      pts.forEach((q,j)=>{for(const sd of[-1,1])pos.push(q.x+sd*q.rx*q.w,q.y+0.05,q.z+sd*q.rz*q.w,q.x+sd*q.rx*(q.w+10),q.y-18,q.z+sd*q.rz*(q.w+10));
        if(j){const a=(j-1)*4,b=j*4;ind.push(a,b,a+1,a+1,b,b+1,a+2,b+2,a+3,a+3,b+2,b+3)}});
      for(const[j,e]of[[0,-1],[n-1,1]]){const q=pts[j],o=pts[j-e]||q,dx=q.x-o.x,dz=q.z-o.z,l=Math.hypot(dx,dz)||1,b=pos.length/3;
        for(const sd of[-1,1])pos.push(q.x+sd*q.rx*q.w,q.y+0.05,q.z+sd*q.rz*q.w,q.x+sd*q.rx*(q.w+10)+dx/l*10,q.y-18,q.z+sd*q.rz*(q.w+10)+dz/l*10);ind.push(b,b+2,b+1,b+1,b+2,b+3)}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ind);g.computeVertexNormals();const gl=new Float32Array(pos.length);for(let k=0;k<pos.length;k+=3)glowAt(pos[k],pos[k+1],pos[k+2],gl,k);
      g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,skirtIn);group.add(m);PR.skirts.push(m)}
    return{skirtIn,skirtOut}}
function prismGates(pz){const{N,ds,P,R,U,group,PR,mode,ins,Mh,bil,glowAt,skirtIn,skirtOut}=pz;
    /* cave mouths: where the road goes into the mountain (or comes out), the mountain arches over it (the lift above) and a
       short ragged tunnel runs through to the cavern, which opens out round you as you come through */
    /* Prototype 61: the ways in and out are a gate now, not a ragged tunnel pressed under the mountain's surface. Four goes
       at the natural look left jagged slabs every time (W1AAE848-P): the mountain lifted over the road, the cavern's roof,
       the tunnel and the hole for the road all met there, each clipped against the others. The gate is one smooth
       thick-walled arch along the road, from 18 m outside the rock to 34 m inside the cavern: its inner face lies just
       inside the space the rock is kept out of (so no rock can show through it), its outer face is wide and tall enough to
       take in the lifted rock and the hole's edges, and it is closed at both ends. Nothing clips it, so it has no shards. */
    let nMouth=0;if(mode==='mix'){const gIn=[],gOut=[],gP=[],
      prof=(hw,bot,spr,apx)=>{const q=[];for(let k=0;k<=3;k++)q.push([-hw,bot+(spr-bot)*k/3]);for(let k=1;k<16;k++){const a=Math.PI*k/16;q.push([-hw*Math.cos(a),spr+(apx-spr)*Math.sin(a)])}
        for(let k=3;k>=0;k--)q.push([hw,bot+(spr-bot)*k/3]);for(let k=1;k<4;k++)q.push([hw-2*hw*k/4,bot]);return q},
      pI=prof(W/2+1.3,-1.3,13,24.6),pO=prof(W/2+12,-9,13,38),nr=pI.length;
      const mouth=(i0,dir)=>{let s0=Math.round(8/ds);for(let s=s0;s<Math.round(240/ds);s++){const q=P[((i0-s*dir)%N+N)%N];if(bil(Mh,q.x,q.z)>q.y+28)s0=s;else if(s>s0+Math.round(12/ds))break}
        const pad=Math.round(18/ds),iF=i0-(s0+pad)*dir,L=s0+pad+Math.round(34/ds),st=Math.max(1,Math.round(4/ds)),rows=[];for(let s=0;s<L;s+=st)rows.push(s);rows.push(L);
        const v0=gP.length/3,nR=rows.length,isIn=rows.map(s=>!!ins[((iF+s*dir)%N+N)%N]);
        for(const pr of[pI,pO])for(const s of rows){const i=((iF+s*dir)%N+N)%N,p=P[i],r=R[i],u=U[i];for(const[x,y]of pr)gP.push(p.x+r.x*x+u.x*y,p.y+r.y*x+u.y*y,p.z+r.z*x+u.z*y)}
        const at=(o,j,a)=>v0+(o*nR+j)*nr+a%nr,quad=(I,A,B,C,D)=>I.push(A,B,C,B,D,C);
        for(let j=0;j<nR-1;j++)for(let a=0;a<nr;a++){quad(gIn,at(0,j,a),at(0,j,a+1),at(0,j+1,a),at(0,j+1,a+1));quad(isIn[j]&&isIn[j+1]?gIn:gOut,at(1,j,a),at(1,j,a+1),at(1,j+1,a),at(1,j+1,a+1))}
        for(let a=0;a<nr;a++){quad(gOut,at(0,0,a),at(0,0,a+1),at(1,0,a),at(1,0,a+1));quad(gIn,at(0,nR-1,a),at(0,nR-1,a+1),at(1,nR-1,a),at(1,nR-1,a+1))}
        nMouth++};
      for(const c of (()=>{const L=[];for(let i=0;i<N;){if(!ins[i]){i++;continue}let n=0;while(i+n<N&&ins[i+n])n++;L.push([i,n]);i+=n}return L})()){
        if(!ins[(c[0]-1+N)%N])mouth(c[0],1);const e=(c[0]+c[1])%N;if(!ins[e])mouth(e,-1)}
      PR.gates=[];for(const[I,mat,glow]of[[gIn,skirtIn,true],[gOut,skirtOut,false]]){if(!I.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(gP,3));g.setIndex(I);g.computeVertexNormals();
        const gl=new Float32Array(gP.length);if(glow)for(let k=0;k<gP.length;k+=3)glowAt(gP[k],gP[k+1],gP[k+2],gl,k);g.setAttribute('aGlow',new THREE.BufferAttribute(gl,3));const m=new THREE.Mesh(g,mat);group.add(m);PR.gates.push(m)}}
    return nMouth}
