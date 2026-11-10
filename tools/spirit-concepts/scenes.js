// ---------- shared ----------
function chase(tr,s0,o={}){const P=tr.P(s0);return mkCam(add(add(sub(P,mul(tr.T(s0),o.back||13)),mul(UP,o.up||5.5)),mul(tr.R(s0),o.side||0)),add(tr.P(s0+(o.ahead||45)),[0,o.look==null?2:o.look,0]),o.fov||72)}

// ---------- lattice ----------
function lattice(S,tr,o){
  const sp=o.sp||16,x0=o.x0||-170,x1=o.x1||170,y0=o.y0||-70,y1=o.y1||130,z0=o.z0||-30,z1=o.z1||560,clear=o.clear||10,yaw=o.yaw||0,
        aMul=o.a||1,w=o.w||0.5,hs=o.hs||0,seed=o.seed||1,rnd=rng(seed);
  const cx=0,cz=250,cy=Math.cos(yaw),sy=Math.sin(yaw);
  const wp=(x,y,z)=>{const dx=x-cx,dz=z-cz;return[cx+dx*cy+dz*sy+(o.ox||0),y+(o.oy||0),cz-dx*sy+dz*cy+(o.oz||0)]};
  const nx=Math.round((x1-x0)/sp),ny=Math.round((y1-y0)/sp),nz=Math.round((z1-z0)/sp);
  const grid=new Map(),key=(i,j,k)=>(i*200+j)*400+k;
  const cam=S.cam;
  for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++)for(let k=0;k<=nz;k++){
    const p=wp(x0+i*sp,y0+j*sp,z0+k*sp);const c=S.tc(p);
    if(c[2]<-sp||c[2]>S.far*0.9)continue;
    const d=tr.dist(p);if(d<clear)continue;grid.set(key(i,j,k),{p,d});}
  const edges=[];
  const E=(a,b,wt)=>{const mid=(a.p[1]+b.p[1])/2;const near=clamp((40-Math.min(a.d,b.d))/40,0,1);
    const h=(S.hue(mid)+hs)%360;S.line(a.p,b.p,{h,a:aMul*(0.5+0.7*near),w:wt*w,l:55+near*15});edges.push([a.p,b.p,h]);};
  for(const [kk,a] of grid){const k=kk%400,j=Math.floor(kk/400)%200,i=Math.floor(kk/80000);
    const beam=(i%4==0&&j%4==0)||(i%4==0&&k%4==0)||(j%4==0&&k%4==0);
    for(const [di,dj,dk] of[[1,0,0],[0,1,0],[0,0,1]]){const b=grid.get(key(i+di,j+dj,k+dk));if(b)E(a,b,beam?1.6:0.8);}
    // diagonals (tetra-octahedral): cell centre joins alternate corners
    if(((i+j+k)&1)==0){const cc=wp(x0+(i+0.5)*sp,y0+(j+0.5)*sp,z0+(k+0.5)*sp);
      const corners=[[0,0,0],[1,1,0],[1,0,1],[0,1,1]].map(d=>grid.get(key(i+d[0],j+d[1],k+d[2])));
      const dd=tr.dist(cc);if(dd>clear){const cn={p:cc,d:dd};for(const q of corners)if(q)E(cn,q,0.55);}}
    else if(rnd()<0.0){const cc=wp(x0+(i+0.5)*sp,y0+(j+0.5)*sp,z0+(k+0.5)*sp);const dd=tr.dist(cc);
      if(dd>clear){const cn={p:cc,d:dd};for(const d of[[1,0,0],[0,1,0],[0,0,1],[1,1,1]]){const q=grid.get(key(i+d[0],j+d[1],k+d[2]));if(q)E(cn,q,0.5);}}}
    if(rnd()<(o.nodeP||0.12))S.dot(a.p,{r:0.45,l:80,a:0.9,h:(S.hue(a.p[1])+hs)%360});
    if(rnd()<(o.hubP||0.006)){const r=sp*0.46,c=a.p;const v=[add(c,[r,0,0]),add(c,[-r,0,0]),add(c,[0,r,0]),add(c,[0,-r,0]),add(c,[0,0,r]),add(c,[0,0,-r])];
      const F=[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]].map(f=>f.map(q=>v[q]));S.solid(F,c,{cs:2.5,ew:0.7,ea:1});}
    else if(rnd()<(o.cubeP||0.012)){const r=sp*0.34;S.box(a.p,[r,0,0],[0,r,0],[0,0,r],{cs:2.5,ew:0.7,ea:1});}
  }
  // light packets travelling the struts
  for(let n=0;n<(o.packets||350);n++){const e=edges[Math.floor(rnd()*edges.length)];if(!e)break;const t=rnd();S.dot(lerp(e[0],e[1],t),{h:e[2],r:0.7,l:92,a:1,star:rnd()<0.2});}
  return edges.length;
}

// ---------- scene A: lattice sky ----------
function sceneLattice(){
  const tr=catmull([[0,0,-40],[0,2,20],[10,6,100],[34,16,170],[28,34,240],[-6,46,300],[-36,38,360],[-30,22,420],[-4,14,480],[0,14,600]],1);
  const S=new Scene(chase(tr,30,{back:14,up:5.5,ahead:55,fov:74}),{hueFn:y=>y*2.6+190,fog:230,far:520,hstep:30});
  lattice(S,tr,{sp:20,y0:-160,y1:150,seed:3,a:0.8,clear:12,nodeP:0.12,hubP:0.01,cubeP:0.012});
  lattice(S,tr,{sp:34,yaw:0.6435,y0:-160,y1:160,ox:10,oy:10,oz:8,seed:9,a:0.7,w:0.8,hs:140,clear:14,nodeP:0.05,hubP:0.006,cubeP:0.004,packets:150});
  for(let s=45;s<420;s+=36){const P=tr.P(s),R=tr.R(s),U=tr.U(s),Tn=tr.T(s),q=13,c=[add(add(P,mul(R,q)),mul(U,q)),add(sub(P,mul(R,q)),mul(U,q)),sub(sub(P,mul(R,q)),mul(U,q)),sub(add(P,mul(R,q)),mul(U,q))];
    for(let i=0;i<4;i++)S.line(c[i],c[(i+1)%4],{h:(s*4)%360,l:68,a:1,w:2.4});
    for(let i=0;i<4;i++)S.dot(c[i],{r:1.1,h:(s*4)%360,star:true});}
  beams(S,tr,10,300,[-7.6,7.6],{h:0.4});
  drawTrack(S,tr,8,230);craft(S,tr,38);
  S.render();
}

// ---------- scene B: stepped sky ----------
function sceneStepped(){
  const tr=catmull([[0,-5,-40],[0,-5,30],[0,-5,90],[6,0,130],[14,20,165],[14,32,200],[0,32,250],[-14,32,290],[-18,50,330],[-10,66,360],[0,66,420],[0,66,520]],1);
  const S=new Scene(chase(tr,28,{back:15,up:9,ahead:60,look:20,fov:80}),{hueFn:y=>y*2.4+200,fog:700,far:900,hstep:10});const ZO={cs:4,ew:1.1,ea:1,ca:0.95};
  const r=rng(11);
  // great inverted ziggurat overhead + stepped mountains below/beside
  S.ziggurat(10,175,330,150,9,18,{...ZO,inv:true});
  
  S.ziggurat(-120,-60,560,160,9,16,ZO);S.ziggurat(130,-70,600,170,9,18,ZO);S.ziggurat(0,-80,820,300,10,24,{...ZO,cs:5});
  for(let i=0;i<14;i++){const side=i%2?-1:1,x=side*(88+r()*40),z=60+i*34,y=-50+r()*90,h=36+r()*14;
    S.ziggurat(x,y,z,h,6,7,{...ZO,cs:3,inv:r()<0.3});}
  for(let i=0;i<10;i++){const side=r()<0.5?-1:1,x=side*(170+r()*90),z=80+r()*500,y=-20+r()*160,h=30+r()*40;S.ziggurat(x,y,z,h,5+Math.floor(r()*3),6,{...ZO,cs:3,inv:r()<0.5});}
  // stair-stepped bridges: slabs hung beside the route
  for(let k=0;k<9;k++){const z=70+k*45,y=k*6.5-4;S.box([k%2?-40:40,y,z],[16,2,14],[0,2,0],[0,0,14],{...ZO,cs:2});}
  // flights of floating steps along the route
  for(let s=100;s<330;s+=9){const P=tr.P(s);for(const sd of[-1,1])S.box(add(P,[sd*(9.5+((s/9)%3)*1.2),-3,0]),[2.2,0.6,0],[0,0.6,0],[0,0,3.5],{cs:1.5,ew:0.4,ca:0.8});}
  beams(S,tr,5,330,[-6.6,6.6],{h:0.4});
  drawTrack(S,tr,4,260);craft(S,tr,32);
  S.render();
}

// ---------- scene C: pyramids that break and reform ----------
function sceneBreak(){
  const tr=catmull([[0,0,-40],[0,0,40],[8,2,120],[24,6,190],[8,10,260],[-14,6,330],[0,0,420],[0,0,560]],1);
  const S=new Scene(chase(tr,14,{back:14,up:6,ahead:60,look:12,fov:74}),{hueFn:y=>y*3+175,fog:340,far:720,hstep:12});
  const rnd=rng(21);const n=9,pitch=8.5,cu=3.9;
  const mk=(bx,by,bz,inv)=>{const sl=[];for(let k=0;k<n;k++){const m=n-k;for(let a=0;a<m;a++)for(let b=0;b<m;b++)sl.push({k,a,b,m,p:[bx+(a-(m-1)/2)*pitch,by+(inv?-1:1)*(k+0.5)*pitch,bz+(b-(m-1)/2)*pitch]})}return sl};
  const cube=(p,ang=0,ax=[1,1,0.3],o={})=>{const e=[[cu,0,0],[0,cu,0],[0,0,cu]].map(v=>ang?rot(v,ax,ang):v);S.box(p,e[0],e[1],e[2],{cs:2.4,ew:0.55,ca:0.65,...o})};
  const pairs=[{A:[-78,-30,110],B:[82,-30,215],Bsolid:0.5},{A:[92,-30,330],B:[-84,-30,430],Bsolid:0.4}];
  for(const pr of pairs){
    const A=mk(...pr.A,false),B=mk(pr.B[0],pr.B[1],pr.B[2],false);
    const sx=Math.sign(pr.B[0]-pr.A[0]);
    // A: intact base, loosened cubes on the side facing B and the whole crown
    const leaving=[];
    for(const c of A){const cr=c.k>=n-3,edge=((c.a-(c.m-1)/2)*sx>c.m*0.18)&&rnd()<0.55;if(cr||edge||rnd()<0.04)leaving.push(c);else cube(c.p);}
    // B: bottom is built, crown missing
    const missing=[];
    for(const c of B){if(c.k<n-4||(c.k<n-2&&rnd()<0.55))cube(c.p);else missing.push(c);}
    // ghost of the finished form
    const gp=(pr.B[0]),gz=pr.B[2],hb=pitch*n*0.5;const g=[[gp-hb,pr.B[1],gz-hb],[gp+hb,pr.B[1],gz-hb],[gp+hb,pr.B[1],gz+hb],[gp-hb,pr.B[1],gz+hb]],ap=[gp,pr.B[1]+pitch*n,gz];
    for(let i=0;i<4;i++){S.line(g[i],ap,{h:50,l:75,a:0.35,w:0.35});}
    // cubes in transit
    const m2=missing.slice().sort(()=>rnd()-0.5);
    leaving.forEach((c,i)=>{const t=m2[i%m2.length];const u=Math.pow(rnd(),1.25)*0.92+0.04;
      const P0=c.p,P2=t.p,P1=add(lerp(P0,P2,0.5),[0,55+rnd()*40,(rnd()-0.5)*30]);
      const q=(u)=>add(add(mul(P0,(1-u)*(1-u)),mul(P1,2*u*(1-u))),mul(P2,u*u));
      const pos=q(u);const ang=Math.sin(Math.PI*u)*(rnd()*5+1)*(rnd()<0.5?-1:1)+(u>0.85?0:0);
      cube(pos,ang,[rnd(),rnd(),rnd()+0.2],{eh:(u*300+40)%360});
      for(let j=1;j<=7;j++){const a=q(Math.max(0,u-0.05*j)),b=q(Math.max(0,u-0.05*(j+0.45)));S.line(a,b,{h:(u*300+40)%360,l:75,a:0.85-j*0.11,w:0.5});}
      if(rnd()<0.18)for(let j=1;j<9;j++)S.dot(q(u+(1-u)*j/9),{h:(u*300+40)%360,r:0.28,a:0.55});});
  }
  // rotating rings of blocks around the route
  const ph=[0,0.4,0.9,0.2,0.7];let ri=0;
  for(let s=48;s<330;s+=34){ringBlocks(S,tr,s,13+((ri%3)*2.2),14+2*(ri%3),ph[ri%5]+s*0.02,{size:1.3,cs:1.3});ri++;}
  // a distant gate: concentric block rings
  const far=tr.P(540);for(const [R,N,pp] of[[48,22,0.1],[78,34,0.5],[112,46,0.9]]){ringBlocks(S,tr,540,R,N,pp,{size:3.6,dep:1.8,cs:4,ew:0.8,h:null,out:i=>Math.sin(i*1.3)*4});}
  beams(S,tr,4,330,[-7.2,7.2,-9.2,9.2],{h:0.4});
  drawTrack(S,tr,6,230);craft(S,tr,26);
  S.render();
}

// ---------- creature carvings (frame x -1..1, y 0..4.4) ----------
const circ=(cx,cy,r,n=24,a0=0)=>Array.from({length:n+1},(_,i)=>[cx+r*Math.cos(a0+i*2*Math.PI/n),cy+r*Math.sin(a0+i*2*Math.PI/n)]);
const mir=pl=>pl.map(p=>[-p[0],p[1]]);
function cSerpent(){
  const P=[],N=100,Lf=[],Rt=[],ch=[];const cx=t=>0.5*Math.sin(t*Math.PI*3.4)*(1-0.2*t),cy=t=>0.25+t*3.2;
  for(let i=0;i<=N;i++){const t=i/N*0.9;const dx=(cx(t+0.003)-cx(t-0.003))/(cy(t+0.003)-cy(t-0.003));const nl=Math.hypot(1,dx);
    const w=0.04+0.2*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.1+0.05)),0.7);const c=[cx(t),cy(t)];const n=[1/nl,-dx/nl];
    Lf.push([c[0]+n[0]*w,c[1]+n[1]*w]);Rt.push([c[0]-n[0]*w,c[1]-n[1]*w]);ch.push({c,n,w,tg:[dx/nl,1/nl]});}
  const out=[Lf,Rt,[Lf[0],Rt[0]]];
  for(let i=6;i<N-4;i+=4){const q=ch[i];out.push([Lf[i],[q.c[0]-q.tg[0]*0.13,q.c[1]-q.tg[1]*0.13],Rt[i]]);}
  const h=ch[N],hc=h.c,n=h.n,tg=h.tg,pt=(a,b)=>[hc[0]+n[0]*a+tg[0]*b,hc[1]+n[1]*a+tg[1]*b];
  out.push([Lf[N],pt(0.34,0.12),pt(0.22,0.5),pt(0,0.8),pt(-0.22,0.5),pt(-0.34,0.12),Rt[N]]);
  out.push([pt(0.2,0.45),pt(0.42,0.75),pt(0.36,1.05)],[pt(-0.2,0.45),pt(-0.42,0.75),pt(-0.36,1.05)]);
  out.push([pt(0.08,0.36),pt(0.16,0.44),pt(0.08,0.52),pt(0,0.44),pt(0.08,0.36)],[pt(-0.08,0.36),pt(-0.16,0.44),pt(-0.08,0.52),pt(0,0.44),pt(-0.08,0.36)]);
  out.push([pt(0,0.5),pt(0,0.78)]);
  return out;
}
function cFirebird(){
  const o=[];o.push(circ(0,3.7,0.26,20));
  o.push([[0,3.96],[0,4.4]],[[0.12,3.93],[0.34,4.25]],[[-0.12,3.93],[-0.34,4.25]],[[0.2,3.85],[0.52,4.0]],[[-0.2,3.85],[-0.52,4.0]]);
  o.push([[-0.07,3.5],[0,3.18],[0.07,3.5]]);
  o.push([[0,3.44],[0.36,3.0],[0.26,2.2],[0,1.75],[-0.26,2.2],[-0.36,3.0],[0,3.44]]);
  for(let j=0;j<6;j++){const ang=(34-j*13)*Math.PI/180,L=0.68-0.02*j+(j<2?0.0:0),sx=0.34,sy=3.02-j*0.1;const pts=[],pts2=[];
    for(let f=0;f<=10;f++){const t=f/10,a=ang-0.35*t*t,x=sx+L*t*Math.cos(a)*1.0+0,y=sy+L*t*Math.sin(a)*1.0;const wd=0.1*Math.sin(Math.PI*t)**0.8+0.01;
      pts.push([x+wd*Math.sin(a),y-wd*Math.cos(a)]);pts2.push([x-wd*Math.sin(a),y+wd*Math.cos(a)]);}
    const lf=pts.concat(pts2.reverse());o.push(lf);o.push(lf.map(p=>[-p[0],p[1]]));}
  [[-0.5,0.2],[0,0],[0.5,-0.2]].forEach(([dx,ph],k)=>{const c=[];for(let i=0;i<=30;i++){const t=i/30;c.push([dx*t+0.18*Math.sin(t*9+ph*5)*(0.4+t),1.75-t*1.55]);}o.push(c);
    const e=c[c.length-1];o.push(circ(e[0],e[1]-0.1,0.1,10));
    const c2=c.map((p,i)=>[p[0]+0.14*(dx>=0?1:-1)*(dx==0?1:1),p[1]]);o.push(c2.slice(0,26));});
  return o;
}
function cStag(){
  const o=[];const face=[[0,0.3],[0.38,1.2],[0.46,2.0],[0.3,2.5],[0,2.62]];o.push(face.concat(mir(face).reverse()));
  o.push([[0.44,1.95],[0.95,2.32],[0.34,2.45]],[[-0.44,1.95],[-0.95,2.32],[-0.34,2.45]]);
  for(const s of[1,-1]){o.push([[s*0.12,1.78],[s*0.28,1.9],[s*0.12,2.0]]);}
  o.push([[0,0.62],[0.1,0.82],[-0.1,0.82],[0,0.62]]);o.push([[0,2.62],[0,2.1]]);
  for(const sg of[1,-1]){
    const beam=[[0.2,2.6],[0.45,2.95],[0.62,3.45],[0.58,4.0],[0.42,4.35]].map(p=>[sg*p[0],p[1]]);o.push(beam);
    o.push([beam[1],[sg*0.9,3.2],[sg*0.98,3.6]]);o.push([beam[2],[sg*0.95,3.9],[sg*0.9,4.25]]);o.push([beam[3],[sg*0.78,4.35]]);o.push([beam[1],[sg*0.35,3.2]]);
    o.push([[sg*0.9,3.2],[sg*1.0,3.0]]);}
  o.push(circ(0,3.45,0.26,20));for(let i=0;i<8;i++){const a=i*Math.PI/4;o.push([[0.34*Math.cos(a),3.45+0.34*Math.sin(a)],[0.46*Math.cos(a),3.45+0.46*Math.sin(a)]]);}
  return o;
}
function cSunRing(){
  const o=[],cx=0,cy=2.5;o.push(circ(cx,cy,0.94,48),circ(cx,cy,0.7,48));
  const z=[];for(let i=0;i<=40;i++){const r=i%2?0.94:0.7,a=i*2*Math.PI/40+Math.PI/2*0;z.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}o.push(z);
  const st=[];for(let i=0;i<=8;i++){const a=(i*3%8)*2*Math.PI/8+Math.PI/8;st.push([cx+0.6*Math.cos(a),cy+0.6*Math.sin(a)]);}o.push(st);
  o.push(circ(cx,cy,0.14,12),circ(cx,cy,0.38,16));
  o.push([[-0.16,3.45],[0,3.82],[0.16,3.45]],[[0,3.82],[0,4.2]]);
  // stepped pyramid glyph below
  for(let k=0;k<4;k++){const hw=0.9-k*0.2,y=1.45-k*0.32;o.push([[-hw,y],[hw,y],[hw,y-0.3],[-hw,y-0.3],[-hw,y]]);}
  o.push([[-0.9,0.17],[0.9,0.17]]);
  return o;
}
const CREATURES=[cSerpent,cFirebird,cStag,cSunRing];
// map creature onto a face quad (BL,BR,TR,TL) and carve in neon
function carve(S,quad,pl,hue,o={}){const [BL,BR,TR,TL]=quad;const A=4.4;
  const map=(p)=>{const u=(p[0]+1)/2,v=p[1]/A;return add(add(BL,mul(sub(BR,BL),u)),mul(sub(TL,BL),v));};
  for(const line of pl)for(let i=0;i<line.length-1;i++){const a=map(line[i]),b=map(line[i+1]);
    S.line(a,b,{h:hue,l:68,a:1,w:o.w||0.95});}
}
function obelisk(S,cx,cy,cz,a0,a1,Hh,ch,side,creature,hue,o={}){
  const yaw=-side*(o.yaw==null?0.62:o.yaw),ca=Math.cos(yaw),sa=Math.sin(yaw);
  const RY=p=>[cx+(p[0]-cx)*ca+(p[2]-cz)*sa,p[1],cz-(p[0]-cx)*sa+(p[2]-cz)*ca];
  const B=[[cx-a0,cy,cz-a0],[cx+a0,cy,cz-a0],[cx+a0,cy,cz+a0],[cx-a0,cy,cz+a0]].map(RY),T=[[cx-a1,cy+Hh,cz-a1],[cx+a1,cy+Hh,cz-a1],[cx+a1,cy+Hh,cz+a1],[cx-a1,cy+Hh,cz+a1]].map(RY),ap=RY([cx,cy+Hh+ch,cz]);
  const faces=[];for(let i=0;i<4;i++){const j=(i+1)%4;faces.push([B[i],B[j],T[j],T[i]]);faces.push([T[i],T[j],ap]);}
  S.solid(faces,[cx,cy+Hh/2,cz],{cs:o.cs||2.5,ew:0.6,ea:1,lit:0.5});
  const xin=cx-side*a0,xinT=cx-side*a1,zs=side<0?1:-1;
  const fy0=0.17,fy1=0.8;
  const q=(f,u)=>{const x=xin+(xinT-xin)*f,w=a0+(a1-a0)*f;return RY([x-side*0.05,cy+Hh*f,cz+zs*(u*w*0.8)])};
  carve(S,[q(fy0,-1),q(fy0,1),q(fy1,1),q(fy1,-1)],CREATURES[creature%4](),hue,o);
  for(const f of[0.07,0.11,0.9]){S.line(q(f,-1.02),q(f,1.02),{h:hue,l:60,a:0.8,w:0.5});}
}

// ---------- scene D: stone ring + obelisks ----------
function ground(S,tr,g,zr,xr,sp=8){
  for(let x=xr[0];x<=xr[1];x+=sp){let prev=null;for(let z=zr[0];z<=zr[1];z+=sp){const p=[x,g(x,z),z];if(prev)S.line(prev,p,{a:0.55,w:0.32,l:52});prev=p}}
  for(let z=zr[0];z<=zr[1];z+=sp){let prev=null;for(let x=xr[0];x<=xr[1];x+=sp){const p=[x,g(x,z),z];if(prev)S.line(prev,p,{a:0.55,w:0.32,l:52});prev=p}}
}
function stoneRing(S,cx,cz,R,N,hh,gaps){
  const rnd=rng(5),tops=[];
  for(let i=0;i<N;i++){const th=i*2*Math.PI/N;const rad=[Math.cos(th),0,Math.sin(th)],tan=[-Math.sin(th),0,Math.cos(th)];
    const h=hh+(rnd()-0.5)*1.6;tops.push(add([cx+rad[0]*R,h*2,cz+rad[2]*R],[0,0,0]));
    if(gaps.includes(i))continue;
    S.box([cx+rad[0]*R,h,cz+rad[2]*R],mul(rad,3),[0,h,0],mul(tan,5.2),{cs:2.5,ew:0.8,ea:1,ca:0.8});}
  for(let i=0;i<N;i++){const j=(i+1)%N;if(gaps.includes(i)||gaps.includes(j))continue;
    const a=tops[i],b=tops[j],mid=lerp(a,b,0.5),d=sub(b,a),L=len(d)/2+1.5,t=norm(d),rad=norm([mid[0]-cx,0,mid[2]-cz]);
    S.box(add(mid,[0,2.4,0]),mul(t,L),[0,2.4,0],mul(rad,3),{cs:2,ew:0.8,ea:1,ca:0.8});}
}
function sceneRing(close){
  const tr=catmull([[0,3,-60],[0,3,60],[7,3,150],[2,3,240],[0,3,300],[0,3,360],[-6,3,440],[0,3,560]],1);
  const g=(x,z)=>{const m=clamp((Math.abs(x-tr.P(clamp(z,0,tr.len))[0])-9)/30,0,1);const d=Math.hypot(x,z-360);const flat=clamp((d-80)/40,0,1);
    return (9*Math.sin(x/27)*Math.cos(z/23)+16*Math.sin(x/61+z/57)+14)*m*flat};
  const S=new Scene(close?mkCam([ -1,7,6],[-17,14,60],68):mkCam([-118,62,150],[4,16,350],64),{hueFn:y=>y*11+190,fog:520,far:760,hstep:6,bg:[262,55]});
  ground(S,tr,g,[-80,760],[-300,300],9);
  stoneRing(S,0,360,84,16,24,[4,12]);stoneRing(S,0,360,38,9,10,[]);
  // pillars of light above the great stones
  for(let i=0;i<16;i++){if(i==4||i==12)continue;const th=i*2*Math.PI/16,x=84*Math.cos(th),z=360+84*Math.sin(th);
    for(let y=36;y<220;y+=8)S.line([x,y,z],[x,y+8,z],{a:Math.max(0,0.7-(y-36)/260),w:0.6+0.9*Math.max(0,1-(y-36)/160),l:70});}
  // avenue of carved obelisks
  const zs=close?[30,56,82,108]:[40,68,96,124,152,180,208,236];
  zs.forEach((z,i)=>{for(const sd of[-1,1]){const xx=sd*(close?19:26)+tr.P(z)[0];
    obelisk(S,xx,0,z,6.2,4.6,close?34:30,6,sd,(i*2+(sd>0?1:0)),(i*55+(sd>0?160:20))%360,{w:1.1});}});
  // great pyramids on the horizon
  S.pyramid(0,0,820,210,250,{cs:7,ew:1,ea:1});S.pyramid(-290,0,720,120,140,{cs:6,ew:1,ea:1});S.pyramid(280,0,700,130,150,{cs:6,ew:1,ea:1});
  // ring of floating blocks over the circle
  const rnd=rng(2);for(let i=0;i<28;i++){const th=i*2*Math.PI/28+0.2,R=100;S.box([R*Math.cos(th),90+8*Math.sin(i*1.7),360+R*Math.sin(th)],[3,0,0],[0,3,0],[0,0,3],{cs:2,ew:0.6});}
  // sky spirit-light ribbons
  for(let k=0;k<6;k++){let prev=null;for(let t=-1.2;t<=1.2;t+=0.04){const p=[t*520,150+k*26+30*Math.sin(t*5+k),880];if(prev)S.line(prev,p,{h:(k*55+t*60+200)%360,a:0.4,w:2});prev=p}}
  beams(S,tr,0,close?200:380,[-6.4,6.4],{h:0.4});
  drawTrack(S,tr,0,close?200:380);if(!close)craft(S,tr,170);
  S.render();
}

// ---------- bestiary sheet ----------
function sceneBestiary(){
  const S=new Scene(mkCam([0,2.2,-9.5],[0,2.2,0],54),{hueFn:y=>y*30+200,fog:900,far:900,hstep:5});
  const names=[0,1,2,3],hues=[170,35,300,95];
  names.forEach((n,i)=>{const cx=(i-1.5)*2.6;const f=(x,y)=>[cx+x*1.12,y*0.99+0.0,0];
    const quad=[[cx-1.12,0,0],[cx+1.12,0,0],[cx+1.12,4.4*0.99,0],[cx-1.12,4.4*0.99,0]];
    S.poly([[cx-1.25,-0.15,0.05],[cx+1.25,-0.15,0.05],[cx+1.25,4.55,0.05],[cx-1.25,4.55,0.05]],'hsl(255,40%,4%)',{after:()=>{const c=[[cx-1.25,-0.15,0.05],[cx+1.25,-0.15,0.05],[cx+1.25,4.55,0.05],[cx-1.25,4.55,0.05]];for(let k=0;k<4;k++)S.L(c[k],c[(k+1)%4],{h:hues[i],a:0.55,w:0.9});}});
    carve(S,quad,CREATURES[n](),hues[i],{w:0.3});});
  S.render();
}

// ---------- scene E: the webway ----------
function sceneWeb(){
  const tr=catmull([[0,0,-60],[0,0,40],[18,10,130],[0,24,220],[-26,30,300],[-10,16,380],[20,8,460],[0,0,560],[0,0,700]],1);
  const S=new Scene(chase(tr,14,{back:15,up:6,ahead:60,look:6,fov:76}),{hueFn:y=>y*2+190,fog:700,far:800,hstep:60,bg:[250,60]});
  const r=rng(33);const hubs=[];
  const away=(p,m)=>tr.dist(p)>m;
  while(hubs.length<40){const p=[(r()-0.5)*340,(r()-0.5)*150+34,40+r()*300];if(away(p,30))hubs.push(p)}
  // neurons: branching dendrites
  const branch=(p,dir,L,d,h)=>{const q=add(p,mul(dir,L));S.line(p,q,{h,l:66,a:0.6+0.1*d,w:0.35+0.22*d});
    if(d>0){for(const s of[-1,1]){const nd=norm(add(dir,[(r()-0.5)*1.1+s*0.5*(r()),(r()-0.5)*1.1,(r()-0.5)*1.1]));branch(q,nd,L*0.76,d-1,h)}}else S.dot(q,{r:0.5,h,a:1,l:88})};
  hubs.forEach((p,i)=>{const h=[165,200,300][i%3];const k=5+Math.floor(r()*3);for(let j=0;j<k;j++)branch(p,norm([r()-0.5,r()-0.5,r()-0.5]),34+r()*12,4,h);
    S.dot(p,{r:3.2,h,l:92,star:true});for(const c of[circ(0,0,4,16),circ(0,0,7,16)])for(let q=0;q<c.length-1;q++)S.line(add(p,[c[q][0],0,c[q][1]]),add(p,[c[q+1][0],0,c[q+1][1]]),{h,a:0.5,w:0.4});});
  // city layers: ring roads, radials and grids on stacked planes
  for(let L=0;L<4;L++){const y=-40+L*52,cx=(r()-0.5)*260,cz=70+L*95+r()*40,hue=38+L*6;
    if(Math.hypot(cx,cz-250)<0)continue;
    const nodes=[];for(const R of[20,45,75,110]){const N=Math.round(R/4.5);for(let i=0;i<N;i++){const a=i*2*Math.PI/N,b=(i+1)*2*Math.PI/N;S.line([cx+R*Math.cos(a),y,cz+R*Math.sin(a)],[cx+R*Math.cos(b),y,cz+R*Math.sin(b)],{h:hue,l:64,a:0.85,w:0.45})}}
    for(let i=0;i<14;i++){const a=i*2*Math.PI/14+r()*0.1;const p=[cx+8*Math.cos(a),y,cz+8*Math.sin(a)],q=[cx+130*Math.cos(a),y,cz+130*Math.sin(a)];S.line(p,q,{h:hue,l:64,a:0.75,w:0.4})}
    for(let i=0;i<22;i++){const x=cx-140+r()*280,z=cz-140+r()*280,dx=r()<0.5;const a=[x,y,z],b=[x+(dx?(10+r()*50):0),y,z+(dx?0:(10+r()*50))];S.line(a,b,{h:hue-8,l:62,a:0.6,w:0.35})}
    for(let i=0;i<30;i++){const R=[20,45,75,110][Math.floor(r()*4)],a=r()*6.28;const p=[cx+R*Math.cos(a),y,cz+R*Math.sin(a)];S.dot(p,{r:0.7,h:hue,l:85,a:1});
      if(r()<0.35){const h=hubs[Math.floor(r()*hubs.length)];S.line(p,h,{h:200,a:0.12,w:0.2})}}}
  // constellations: nearest-neighbour star graph
  const stars=Array.from({length:170},()=>[(r()-0.5)*440,(r()-0.5)*200+50,40+r()*420]).filter(p=>away(p,30));
  stars.forEach((p,i)=>{const ds=stars.map((q,j)=>[len(sub(p,q)),j]).filter(d=>d[1]!=i).sort((a,b)=>a[0]-b[0]).slice(0,2);
    for(const [d,j] of ds)if(d<95&&j>i)S.line(p,stars[j],{h:262,s:60,l:85,a:0.7,w:0.3});S.dot(p,{r:0.42+r()*0.5,h:250+r()*60,s:50,l:92,a:0.95,star:r()<0.3})});
  // side routes leaving the main track for hubs
  for(const [s,hi] of[[90,1],[210,4],[330,7],[430,10]]){const P=tr.P(s);const h=hubs[hi*1%hubs.length];const side=Math.sign(h[0]-P[0])||1;
    const br=catmull([add(P,mul(tr.T(s),-8)),P,add(P,add(mul(tr.T(s),40),[side*14,4,0])),lerp(P,h,0.5),sub(h,[0,2,0])].map(p=>p),1);
    drawTrack(S,br,0,Math.min(br.len-2,260),{w:3,hoff:90*hi,rail:300,fh:260});}
  // light packets everywhere
  beams(S,tr,4,380,[-6.6,6.6],{h:0.4});
  drawTrack(S,tr,6,300);craft(S,tr,36);
  S.render();
}

// ---------- scene F: full vision ----------
function sceneHub(){
  const tr=catmull([[0,0,-40],[0,1,40],[14,4,120],[34,14,190],[16,28,260],[-18,32,330],[-30,22,400],[-6,10,470],[0,6,620]],1);
  const S=new Scene(chase(tr,18,{back:14,up:5.8,ahead:60,look:10,fov:76}),{hueFn:y=>y*2.7+185,fog:300,far:640,hstep:20});
  lattice(S,tr,{sp:30,seed:4,a:0.36,clear:22,nodeP:0.08,hubP:0.003,cubeP:0.002,x0:-230,x1:230,y0:-160,y1:160,z0:-20,z1:600,packets:200});
  lattice(S,tr,{sp:46,yaw:0.7,ox:9,oy:10,oz:6,seed:12,a:0.4,w:0.9,hs:150,clear:22,nodeP:0.05,hubP:0.003,cubeP:0.0,packets:80,x0:-280,x1:280,y0:-160,y1:160,z0:-60,z1:640});
  const rnd=rng(44);const n=8,pitch=8.4,cu=3.8;
  const cube=(p,ang=0,ax=[1,1,0.3],o={})=>{const e=[[cu,0,0],[0,cu,0],[0,0,cu]].map(v=>ang?rot(v,ax,ang):v);S.box(p,e[0],e[1],e[2],{cs:2.4,ew:1.0,ea:1,ca:0.85,...o})};
  const mk=(bx,by,bz)=>{const sl=[];for(let k=0;k<n;k++){const m=n-k;for(let a=0;a<m;a++)for(let b=0;b<m;b++)sl.push({k,a,b,m,p:[bx+(a-(m-1)/2)*pitch,by+(k+0.5)*pitch,bz+(b-(m-1)/2)*pitch]})}return sl};
  // two block pyramids trade cubes across the route
  const A=mk(-62,-30,140),B=mk(74,-30,225);const out=[],miss=[];
  for(const c of A){if(c.k>=n-3||(((c.a)>c.m*0.5)&&rnd()<0.5))out.push(c);else cube(c.p)}
  for(const c of B){if(c.k<n-4)cube(c.p);else miss.push(c)}
  out.forEach((c,i)=>{const t=miss[i%miss.length];const u=Math.pow(rnd(),1.2)*0.9+0.05;const P0=c.p,P2=t.p,P1=add(lerp(P0,P2,0.5),[0,60,(rnd()-0.5)*20]);
    const q=u=>add(add(mul(P0,(1-u)*(1-u)),mul(P1,2*u*(1-u))),mul(P2,u*u));cube(q(u),Math.sin(Math.PI*u)*(rnd()*4+1),[rnd(),rnd(),rnd()+0.2],{eh:(u*300+40)%360});
    for(let j=1;j<=6;j++)S.line(q(Math.max(0,u-0.05*j)),q(Math.max(0,u-0.05*(j+0.4))),{h:(u*300+40)%360,l:75,a:0.8-j*0.12,w:0.5})});
  // stepped crowns hanging in the lattice
  S.ziggurat(60,70,380,50,6,7,{inv:true,cs:3});S.ziggurat(-70,60,330,40,5,6,{inv:true,cs:3});S.ziggurat(-90,-10,430,50,6,8,{cs:3});S.ziggurat(95,-10,420,45,6,8,{cs:3});
  // a standing ring of stones in the sky, the route threading it
    let ri=0;for(let s=40;s<340;s+=30){ringBlocks(S,tr,s,12+(ri%3)*2,14+(ri%3)*2,s*0.025+ri,{size:1.2,cs:1.2});ri++}
  for(const [R,N,pp] of[[44,20,0.1],[72,30,0.5],[104,42,0.9]])ringBlocks(S,tr,560,R,N,pp,{size:3.4,dep:1.8,cs:4,ew:0.8,out:i=>Math.sin(i*1.3)*4});
  beams(S,tr,4,340,[-7.2,7.2,-9.4,9.4],{h:0.4});
  drawTrack(S,tr,6,250);craft(S,tr,30);
  S.render();
}
const SCENES={lattice:sceneLattice,stepped:sceneStepped,break:sceneBreak,ring:()=>sceneRing(false),obelisks:()=>sceneRing(true),bestiary:sceneBestiary,web:sceneWeb,hub:sceneHub};
