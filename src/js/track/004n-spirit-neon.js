//# track/004n-spirit-neon.js: the Spirit realm's drawing kit: palettes, the clock and music uniforms every piece shares, neon line batches (instanced segments) and wire solids (instanced boxes and solids, edges drawn per pixel), with all their motion done in the vertex shader
/* Prototype 62: the Spirit realm (S) in the game, from the Prototype 61 mock-ups (tools/spirit-proto/lib: neon.js,
   world.js). Round 2 drew every piece as its own objects (about 540 draw calls for "everything at once"); here a piece
   is a few numbers in a batch: one draw per kind of thing for the whole lap. A batch's rows say where a piece is (centre,
   frame), how it is posed (offset and turn in that frame), how it moves (a mode, a rate, a phase and an amount) and how
   it breathes; the vertex shader moves it from the shared clock below, so the CPU does no work per piece per frame.
   Motion modes (SPM): 0 still; 1 turns at a steady rate (and bobs); 2 turns a notch on every beat; 3 turns a notch every
   bar (and slowly), swelling on the kick; 4 a stack's tier slides out, turns a quarter and slides back when its beat
   comes; 5 flies between two places along an arc, as a group's progress (uG) says; 7 a face hinges open and closed on the
   beat (unfolding solids); 8 is posed from the CPU (heads, riders, echoes, a colossus's head: uOP/uOQ slots).
   Nothing here touches the race: it reads the clock, the music and where racers are, never the race's random numbers. */
const SPM={still:0,spin:1,beat:2,bar:3,tier:4,fly:5,hinge:7,slot:8};
/* palettes, four stops each (mirrored past 1): 0 rainbow (Prism's), 1 gold + violet, 2 cyan + magenta, 3 ember + white,
   4 jade + turquoise + gold, 5 ice + violet; the colours the mock-ups were approved in */
const SPPAL=[['#ff3a5a','#ffd23a','#3aff9a','#3a8aff'],['#4b1cff','#a640ff','#ff9f2e','#ffe08a'],['#18e0ff','#3d8bff','#c13dff','#ff3fc4'],
  ['#ff2a0a','#ff6a1a','#ffb070','#fff4e6'],['#0fbf7a','#2fe0b0','#3fd0ff','#ffb43a'],['#e8f6ff','#8fd8ff','#7a5cff','#c050ff']];
/* the uniforms every Spirit material shares (one object each, so setting a value once sets it everywhere):
   uT time; uBeat the music's beats (float); uKick the last kick, decaying; uKA the ages of the last four kicks (s);
   uDrop a flare after a drop starts; uBuild 0..1 through a build; uBrk 1 in a breakdown; uBreath a slow in-out (2 bars);
   uCalm 1 with Calm visuals; uG group progress (pyramids shedding, arches assembling); uOP/uOQ the posed slots;
   uSF the sound form (4 bands x 12 moments, newest first); uLvl the music's level; uRes the drawing size in pixels */
const SPU={uT:{value:0},uBeat:{value:0},uKick:{value:0},uKA:{value:new THREE.Vector4(9,9,9,9)},uDrop:{value:0},uBuild:{value:0},uBrk:{value:0},uBreath:{value:0},uCalm:{value:0},
  uG:{value:Array.from({length:6},()=>new THREE.Vector4())},uOP:{value:Array.from({length:24},()=>new THREE.Vector4(0,-9999,0,0))},uOQ:{value:Array.from({length:24},()=>new THREE.Vector4(0,0,0,1))},
  uSF:{value:Array.from({length:12},()=>new THREE.Vector4())},uLvl:{value:0},uRes:{value:new THREE.Vector2(960,540)},uWorld:{value:1},
  uPal:{value:SPPAL.flatMap(p=>p.map(h=>{const c=new THREE.Color(h);return new THREE.Vector3(c.r,c.g,c.b)}))}};
const SPGL=`uniform float uT,uBeat,uKick,uDrop,uBuild,uBrk,uBreath,uCalm,uLvl,uWorld;uniform vec4 uKA;uniform vec4 uG[6];uniform vec3 uPal[24];uniform vec2 uRes;
  vec3 rotA(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}
  vec3 rotQ(vec4 q,vec3 v){vec3 t=2.*cross(q.xyz,v);return v+q.w*t+cross(q.xyz,t);}
  float sst(float x){x=clamp(x,0.,1.);return x*x*(3.-2.*x);}
  float gOf(float g){int i=int(g/4.);vec4 q=uG[i];float r=mod(g,4.);return r<0.5?q.x:r<1.5?q.y:r<2.5?q.z:q.w;}
  vec3 pal(float i,float x){x=abs(fract(x*0.5)*2.-1.)*3.;float k=floor(min(x,2.999));int b=int(i)*4+int(k);return mix(uPal[b],uPal[b+1],sst(x-k));}
  float breathK(float amt){return 1.+amt*(0.6*uBreath+0.4*uKick*(1.-uBrk))*(1.-uCalm);}
  float spAngle(vec4 m){if(m.x<0.5)return 0.;if(m.x<1.5)return m.y*uT+m.z;if(m.x<2.5)return m.z+m.y*(floor(uBeat)+sst(fract(uBeat)*3.));
    if(m.x<3.5)return m.z+m.y*(floor(uBeat*.25)+sst(fract(uBeat*.25)*4.))+m.w*uT;if(m.x>6.5&&m.x<7.5){float c=fract(uBeat/8.+m.z);return m.w*sst(c*4.)*(1.-sst(c*4.-2.2));}return 0.;}`;

/* ---------- neon lines: every segment an instance of one quad, as wide as a few pixels (round 2's line look) ---------- */
const SPLINE_V=SPGL+`attribute vec2 corner;attribute vec4 sA,sB,iC,iQ,iM,iX,iP;
  #ifdef KNOT
  attribute vec4 sA2,sB2;
  #endif
  uniform vec2 uFog;uniform float uWidth,uMinPx,uMaxPx,uGain;varying vec3 vCol;varying float vS;
  #ifdef SLOTS
  uniform vec4 uOP[24],uOQ[24];
  #endif
  vec3 place(vec3 p,out float vis){vis=1.;vec3 q=p-iP.xyz;
    #ifdef SLOTS
    if(iM.x>7.5){int s=int(iP.w);vis=uOP[s].w;q=iP.xyz+uOP[s].xyz+rotQ(uOQ[s],q);return iC.xyz+rotQ(iQ,q);}
    #endif
    q=rotA(q,iX.xyz,spAngle(iM))+iP.xyz;if(iM.x>0.5&&iM.x<1.5)q.y+=sin(uT*0.4+iM.z)*iM.w;
    return iC.xyz+rotQ(iQ,q*breathK(iC.w));}
  void main(){vec3 a0=sA.xyz,b0=sB.xyz;
    #ifdef KNOT
    float mk=sst(sin(uBeat*0.098+iM.z)*1.4+0.5);a0=mix(a0,sA2.xyz,mk);b0=mix(b0,sB2.xyz,mk);
    #endif
    float va,vb;vec4 a=viewMatrix*vec4(place(a0,va),1.),b=viewMatrix*vec4(place(b0,vb),1.);float nz=-0.35;
    if((a.z>nz&&b.z>nz)||va<0.002){gl_Position=vec4(0.,0.,-2.,1.);return;}
    if(a.z>nz)a=mix(a,b,(a.z-nz)/(a.z-b.z));if(b.z>nz)b=mix(b,a,(b.z-nz)/(b.z-a.z));
    vec4 ca=projectionMatrix*a,cb=projectionMatrix*b;vec2 sa=ca.xy/ca.w*uRes*0.5,sb=cb.xy/cb.w*uRes*0.5;
    vec2 d=sb-sa;float l=length(d);d=l>1e-4?d/l:vec2(1.,0.);vec2 n=vec2(-d.y,d.x);
    float e=corner.y;vec4 v=e<0.5?a:b;vec4 c=e<0.5?ca:cb;
    float px=clamp(uWidth*projectionMatrix[1][1]*uRes.y*0.5/max(-v.z,0.1),uMinPx,uMaxPx);
    c.xy+=(n*corner.x+d*(e<0.5?-1.:1.))*px*0.5/uRes*2.*c.w;gl_Position=c;
    float f=clamp((uFog.y+v.z)/(uFog.y-uFog.x),0.,1.);vS=corner.x;
    vCol=pal(iX.w,e<0.5?sA.w:sB.w)*sB.w*f*va*uGain*uWorld;}`;
const SPLINE_F=`varying vec3 vCol;varying float vS;void main(){float e=1.-abs(vS);gl_FragColor=vec4(vCol*smoothstep(0.,0.4,e)*(0.85+0.6*e*e),1.);}`;
function spLineMat(o={}){
  return new THREE.ShaderMaterial({uniforms:Object.assign({},SPU,{uFog:{value:new THREE.Vector2(...(o.fog||[500,2400]))},uWidth:{value:o.width||0.14},uMinPx:{value:o.minPx||1.5},uMaxPx:{value:o.maxPx||6},uGain:{value:o.gain||1}}),
    vertexShader:SPLINE_V,fragmentShader:SPLINE_F,defines:o.knot?{KNOT:1}:{},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
const SP_Q0=[0,0,0,1],SP_X0=[0,1,0];
/* a batch of segments: obj(o) says what the next segments belong to: c centre, q frame (quaternion as [x,y,z,w]), br
   breath, m [mode, rate, phase, amount], ax the axis it turns about (in its frame), piv the point it turns about, pal,
   slot (mode 8). seg(a, b, pc, pk): two points in that frame, the palette place of each end and the brightness. */
function spLines(){const A={sA:[],sB:[],iC:[],iQ:[],iM:[],iX:[],iP:[],sA2:[],sB2:[]};let o=null,n=0;const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  const api={obj(x){o=Object.assign({c:[0,0,0],q:SP_Q0,br:0,m:[0,0,0,0],ax:SP_X0,piv:[0,0,0],pal:0,slot:0,ext:0},x);const e=o.ext||0;for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],o.c[k]-e);mx[k]=Math.max(mx[k],o.c[k]+e)}return api},
    seg(a,b,pc=0,pk=1,a2,b2){A.sA.push(a[0],a[1],a[2],pc);A.sB.push(b[0],b[1],b[2],pk);A.iC.push(o.c[0],o.c[1],o.c[2],o.br);A.iQ.push(...o.q);A.iM.push(...o.m);A.iX.push(o.ax[0],o.ax[1],o.ax[2],o.pal);A.iP.push(o.piv[0],o.piv[1],o.piv[2],o.slot);
      if(a2){A.sA2.push(a2[0],a2[1],a2[2],0);A.sB2.push(b2[0],b2[1],b2[2],0)}
      if(!o.ext)for(const p of[a,b])for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],p[k]+o.c[k]);mx[k]=Math.max(mx[k],p[k]+o.c[k])}n++;return api},
    poly(P,closed,pc=0,pk=1){const pcf=typeof pc==='function'?pc:()=>pc;for(let i=0;i<P.length-1;i++)api.seg(P[i],P[i+1],pcf(P[i]),pk);if(closed&&P.length>2)api.seg(P[P.length-1],P[0],pcf(P[P.length-1]),pk);return api},
    get n(){return n},
    /* one mesh; cull: frustum-cull it by the box of what is in it (a whole-lap batch is never culled) */
    mesh(mat,cull){if(!n)return null;const g=new THREE.InstancedBufferGeometry();g.setAttribute('corner',new THREE.Float32BufferAttribute([-1,0,1,0,-1,1,1,1],2));g.setIndex([0,1,2,1,3,2]);
      for(const k of['sA','sB','iC','iQ','iM','iX','iP','sA2','sB2'])if(A[k].length)g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(A[k]),4));
      g.instanceCount=n;const m=new THREE.Mesh(g,mat);m.renderOrder=2;
      const c=new THREE.Vector3((mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2);g.boundingSphere=new THREE.Sphere(c,Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2])/2+30);g.boundingBox=new THREE.Box3(new THREE.Vector3(...mn),new THREE.Vector3(...mx));
      m.frustumCulled=!!cull;return m}};
  return api}

/* ---------- wire solids: boxes, octahedra, tetrahedra, icosahedra; dark faces, bright edges worked out per pixel, colour by
   height (world.js's look). Each row: centre and frame, an offset and turn in the frame, a size, a motion, a glyph. ---------- */
const SPWIRE_V=SPGL+`attribute vec3 bary;attribute vec4 iC,iQ,iO,iB,iS,iM,iX,iF,iI;varying vec2 vUv;varying vec3 vB;varying vec3 vCol;varying float vF;varying float vPx;varying float vSide;varying float vGl;varying float vK;
  uniform vec2 uFog;uniform float uGain;
  void main(){vec3 v=position*iS.xyz;float md=iM.x;
    if(md>3.5&&md<4.5){float st=floor(uBeat),f=fract(uBeat),on=1.-step(0.5,abs(mod(st,iM.y)-iM.z));v=rotA(v,vec3(0.,1.,0.),on*sst(f*2.5-0.6)*1.5708*sign(iM.w));v.x+=on*(sst(f*3.)-sst(f*3.-2.))*iM.w;}
    vec3 b=rotQ(iB,v);
    if(md>4.5&&md<5.5){float k=sst((gOf(iI.y)*1.6-iF.w)/1.1),j=1.-k;vec3 mid=(iO.xyz+iF.xyz)*0.5+vec3(0.,iI.z,0.);b=rotA(b,iX.xyz,sin(3.14159*k)*iM.y)+iO.xyz*j*j+mid*2.*k*j+iF.xyz*k*k;}
    else{b+=iO.xyz;b=rotA(b,iX.xyz,spAngle(iM));if(md>2.5&&md<3.5)b*=1.+0.05*uKick*(1.-uCalm);if(md>0.5&&md<1.5)b.y+=sin(uT*0.4+iM.z)*iM.w;}
    vec3 w=iC.xyz+rotQ(iQ,b*breathK(iC.w));vec4 mv=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mv;
    float dist=-mv.z;vPx=1.15*clamp(60./max(dist,1.),1.,2.2);vF=1.-smoothstep(uFog.x,uFog.y,dist);
    vUv=uv;vB=bary;vSide=1.-abs(normal.y);float fc=normal.x>0.5?0.:normal.z>0.5?1.:normal.x<-0.5?2.:3.;vGl=iX.w<0.?-1.:mod(iX.w+fc,4.);vK=iI.x*uGain*uWorld;vCol=pal(iO.w,w.y/iI.w+iS.w);}`;
const SPWIRE_F=`uniform vec3 uFill;uniform sampler2D uAtlas;varying vec2 vUv;varying vec3 vB;varying vec3 vCol;varying float vF;varying float vPx;varying float vSide;varying float vGl;varying float vK;
  float aaL(float d,float px){return 1.-smoothstep(px-0.6,px+0.6,d);}
  void main(){float e=0.;
    #ifdef TRI
    vec3 fw=max(fwidth(vB),vec3(1e-5));vec3 q=vB/fw;e=aaL(min(min(q.x,q.y),q.z),vPx*0.8);
    #else
    vec2 d=min(vUv,1.-vUv);vec2 fw=max(fwidth(vUv),vec2(1e-5));vec2 q=d/fw;e=aaL(min(q.x,q.y),vPx);
    #endif
    float g=0.;
    #ifdef GLYPH
    if(vGl>=0.&&vSide>0.5){vec2 p=vec2((vUv.x-0.12)/0.76,(vUv.y-0.07)/0.86);if(p.x>0.&&p.x<1.&&p.y>0.&&p.y<1.)g=texture2D(uAtlas,vec2((vGl+p.x)/4.,p.y)).r;}
    #endif
    gl_FragColor=vec4(uFill*vF+(vCol*e+mix(vCol,vec3(1.),0.35)*g*1.6)*vK*vF,1.);}`;
let SP_ATLAS=null;
function spWireMat(o={}){const d={};if(o.tri)d.TRI=1;if(o.glyph)d.GLYPH=1;
  const m=new THREE.ShaderMaterial({uniforms:Object.assign({},SPU,{uFog:{value:new THREE.Vector2(...(o.fog||[500,2400]))},uGain:{value:o.gain||1},uFill:{value:new THREE.Color(o.fill==null?0x07050d:o.fill)},uAtlas:{value:o.glyph?spAtlas():null}}),
    vertexShader:SPWIRE_V,fragmentShader:SPWIRE_F,defines:d});m.extensions={derivatives:true};return m}
/* the shapes: a unit box (edges from its uv) and the solids (edges from a barycentric attribute) */
function spBary(g){g=g.index?g.toNonIndexed():g;const n=g.attributes.position.count,b=new Float32Array(n*3);for(let i=0;i<n;i++)b[i*3+(i%3)]=1;g.setAttribute('bary',new THREE.BufferAttribute(b,3));
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2),2));g.computeVertexNormals();return g}
const SPGEO={box:()=>{const g=new THREE.BoxGeometry(1,1,1);g.setAttribute('bary',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*3),3));return g},
  oct:()=>spBary(new THREE.OctahedronGeometry(0.7,0)),tet:()=>spBary(new THREE.TetrahedronGeometry(0.75,0)),ico:()=>spBary(new THREE.IcosahedronGeometry(0.65,0)),dod:()=>spBary(new THREE.DodecahedronGeometry(0.65,0))};
/* a batch of wire solids of one shape. add(o): c centre, q frame, off offset in the frame, bq its turn in the frame, s size
   [x,y,z], pal and pc (palette and where on it), per (metres of height per palette cycle), m motion, ax axis, br breath,
   fly [x,y,z, delay] (mode 5's other place, in the frame), g group, lift (mode 5's arc), k brightness, gl glyph (0..3) */
function spWires(shape){const A={iC:[],iQ:[],iO:[],iB:[],iS:[],iM:[],iX:[],iF:[],iI:[]};let n=0;
  const api={add(o){const c=o.c,s=o.s,off=o.off||[0,0,0],fl=o.fly||[0,0,0,0];A.iC.push(c[0],c[1],c[2],o.br||0);A.iQ.push(...(o.q||SP_Q0));A.iO.push(off[0],off[1],off[2],o.pal||0);A.iB.push(...(o.bq||SP_Q0));
      A.iS.push(s[0],s[1],s[2],o.pc||0);A.iM.push(...(o.m||[0,0,0,0]));const ax=o.ax||SP_X0;A.iX.push(ax[0],ax[1],ax[2],o.gl==null?-1:o.gl);A.iF.push(...fl);A.iI.push(o.k==null?1:o.k,o.g||0,o.lift||0,o.per||140);n++;return api},
    get n(){return n},
    mesh(mat){if(!n)return null;const b=SPGEO[shape](),g=new THREE.InstancedBufferGeometry();for(const k of['position','normal','uv','bary'])g.setAttribute(k,b.attributes[k]);if(b.index)g.setIndex(b.index);
      for(const k in A)g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(A[k]),4));g.instanceCount=n;const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=1;return m}};
  return api}
/* the bestiary (round 1's carvings): four creatures drawn in line, one per side of a block. Drawn from scratch in
   geometric outline: no copied artwork, no deity, no crest figure, no glyphs (docs/SPIRIT-REALM-DOSSIER.md, J). */
function spCreatures(){const TW=Math.PI*2,circ=(cx,cy,r,n=24)=>Array.from({length:n+1},(_,i)=>[cx+r*Math.cos(i*TW/n),cy+r*Math.sin(i*TW/n)]),mir=pl=>pl.map(p=>[-p[0],p[1]]);
  const serpent=()=>{const N=100,Lf=[],Rt=[],ch=[],cx=t=>0.5*Math.sin(t*Math.PI*3.4)*(1-0.2*t),cy=t=>0.25+t*3.2;
    for(let i=0;i<=N;i++){const t=i/N*0.9,dx=(cx(t+0.003)-cx(t-0.003))/(cy(t+0.003)-cy(t-0.003)),nl=Math.hypot(1,dx),w=0.04+0.2*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.1+0.05)),0.7),c=[cx(t),cy(t)],nn=[1/nl,-dx/nl];
      Lf.push([c[0]+nn[0]*w,c[1]+nn[1]*w]);Rt.push([c[0]-nn[0]*w,c[1]-nn[1]*w]);ch.push({c,n:nn,tg:[dx/nl,1/nl]})}
    const o=[Lf,Rt,[Lf[0],Rt[0]]];for(let i=6;i<N-4;i+=4){const q=ch[i];o.push([Lf[i],[q.c[0]-q.tg[0]*0.13,q.c[1]-q.tg[1]*0.13],Rt[i]])}
    const h=ch[N],pt=(a,b)=>[h.c[0]+h.n[0]*a+h.tg[0]*b,h.c[1]+h.n[1]*a+h.tg[1]*b];
    o.push([Lf[N],pt(0.34,0.12),pt(0.22,0.5),pt(0,0.8),pt(-0.22,0.5),pt(-0.34,0.12),Rt[N]],[pt(0.2,0.45),pt(0.42,0.75),pt(0.36,1.05)],[pt(-0.2,0.45),pt(-0.42,0.75),pt(-0.36,1.05)],[pt(0,0.5),pt(0,0.78)]);return o};
  const firebird=()=>{const o=[circ(0,3.7,0.26,20),[[0,3.96],[0,4.4]],[[0.12,3.93],[0.34,4.25]],[[-0.12,3.93],[-0.34,4.25]],[[-0.07,3.5],[0,3.18],[0.07,3.5]],[[0,3.44],[0.36,3],[0.26,2.2],[0,1.75],[-0.26,2.2],[-0.36,3],[0,3.44]]];
    for(let j=0;j<6;j++){const ang=(34-j*13)*Math.PI/180,L=0.68-0.02*j,sy=3.02-j*0.1,p1=[],p2=[];for(let f=0;f<=10;f++){const t=f/10,a=ang-0.35*t*t,x=0.34+L*t*Math.cos(a),y=sy+L*t*Math.sin(a),wd=0.1*Math.sin(Math.PI*t)**0.8+0.01;p1.push([x+wd*Math.sin(a),y-wd*Math.cos(a)]);p2.push([x-wd*Math.sin(a),y+wd*Math.cos(a)])}
      const lf=p1.concat(p2.reverse());o.push(lf,mir(lf))}
    for(const[dx,ph]of[[-0.5,0.2],[0,0],[0.5,-0.2]]){const c=[];for(let i=0;i<=30;i++){const t=i/30;c.push([dx*t+0.18*Math.sin(t*9+ph*5)*(0.4+t),1.75-t*1.55])}o.push(c);const e=c[c.length-1];o.push(circ(e[0],e[1]-0.1,0.1,10))}return o};
  const stag=()=>{const face=[[0,0.3],[0.38,1.2],[0.46,2],[0.3,2.5],[0,2.62]],o=[face.concat(mir(face).reverse()),[[0.44,1.95],[0.95,2.32],[0.34,2.45]],[[-0.44,1.95],[-0.95,2.32],[-0.34,2.45]],[[0,0.62],[0.1,0.82],[-0.1,0.82],[0,0.62]],[[0,2.62],[0,2.1]]];
    for(const s of[1,-1])o.push([[s*0.12,1.78],[s*0.28,1.9],[s*0.12,2]]);
    for(const sg of[1,-1]){const bm=[[0.2,2.6],[0.45,2.95],[0.62,3.45],[0.58,4],[0.42,4.35]].map(p=>[sg*p[0],p[1]]);o.push(bm,[bm[1],[sg*0.9,3.2],[sg*0.98,3.6]],[bm[2],[sg*0.95,3.9],[sg*0.9,4.25]],[bm[3],[sg*0.78,4.35]],[bm[1],[sg*0.35,3.2]])}
    o.push(circ(0,3.45,0.26,20));for(let i=0;i<8;i++){const a=i*Math.PI/4;o.push([[0.34*Math.cos(a),3.45+0.34*Math.sin(a)],[0.46*Math.cos(a),3.45+0.46*Math.sin(a)]])}return o};
  const sunRing=()=>{const o=[circ(0,2.5,0.94,48),circ(0,2.5,0.7,48)],z=[],st=[];for(let i=0;i<=40;i++){const r=i%2?0.94:0.7,a=i*TW/40;z.push([r*Math.cos(a),2.5+r*Math.sin(a)])}
    for(let i=0;i<=8;i++){const a=(i*3%8)*TW/8+Math.PI/8;st.push([0.6*Math.cos(a),2.5+0.6*Math.sin(a)])}o.push(z,st,circ(0,2.5,0.14,12),circ(0,2.5,0.38,16),[[-0.16,3.45],[0,3.82],[0.16,3.45]],[[0,3.82],[0,4.2]]);
    for(let k=0;k<4;k++){const hw=0.9-k*0.2,y=1.45-k*0.32;o.push([[-hw,y],[hw,y],[hw,y-0.3],[-hw,y-0.3],[-hw,y]])}o.push([[-0.9,0.17],[0.9,0.17]]);return o};
  return[serpent,firebird,stag,sunRing]}
function spAtlas(){if(SP_ATLAS)return SP_ATLAS;const tw=128,th=256,c=document.createElement('canvas');c.width=tw*4;c.height=th;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);
  spCreatures().forEach((fn,k)=>{const pl=fn(),X=x=>k*tw+tw/2+x*tw*0.46,Y=y=>th-(y/4.4)*th*0.98-2;
    for(const[w,s]of[[7,'rgba(255,255,255,0.18)'],[3.5,'rgba(255,255,255,0.45)'],[1.6,'#fff']]){g.lineWidth=w;g.strokeStyle=s;g.lineJoin=g.lineCap='round';for(const L of pl){g.beginPath();L.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke()}}});
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearMipmapLinearFilter;return SP_ATLAS=t}

/* ---------- shoals: a flock of small bright solids. A free shoal wheels round its centre; a shoal-built shape keeps its
   fish on the shape's lines, loosening and re-forming every 2 bars, puffing on the kick and scattering on the drop ---------- */
const SPSHOAL_V=SPGL+`attribute vec4 fH,fD,fC,fK;uniform vec2 uFog;varying vec3 vCol;
  void main(){vec3 h=fH.xyz;if(fC.w!=0.)h=fC.xyz+rotA(h-fC.xyz,vec3(0.,1.,0.),uT*fC.w);
    float loose=(0.12+0.88*sst(sin(uBeat*0.3927+fH.w)*1.5-0.4))*(1.-0.8*uCalm),amp=fK.y;
    vec3 wob=vec3(sin(uT*1.3+fH.w*7.),sin(uT*1.1+fH.w*5.)*0.6,cos(uT*1.2+fH.w*3.))*amp*loose;
    vec3 c=h+wob+fD.xyz*amp*(0.25*uKick*(1.-uBrk)+1.6*uDrop)*(1.-uCalm*0.7);
    vec3 p=rotA(position*fD.w,normalize(vec3(fH.w,1.,0.3)),uT*1.7+fH.w*9.);vec4 mv=viewMatrix*vec4(c+p,1.);gl_Position=projectionMatrix*mv;
    vCol=mix(pal(fK.x,fK.z+c.y/140.),vec3(1.),0.2)*(1.-smoothstep(uFog.x,uFog.y,-mv.z))*0.9*uWorld;}`;
function spShoals(){const A={fH:[],fD:[],fC:[],fK:[]};let n=0;
  const api={fish(h,d,c,k){A.fH.push(...h);A.fD.push(...d);A.fC.push(...c);A.fK.push(...k);n++;return api},get n(){return n},
    mesh(fog){if(!n)return null;const b=new THREE.OctahedronGeometry(1,0),g=new THREE.InstancedBufferGeometry();g.setAttribute('position',b.attributes.position);g.setAttribute('normal',b.attributes.normal);if(b.index)g.setIndex(b.index);
      for(const k in A)g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(A[k]),4));g.instanceCount=n;
      const m=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:Object.assign({},SPU,{uFog:{value:new THREE.Vector2(...(fog||[500,2600]))}}),vertexShader:SPSHOAL_V,fragmentShader:`varying vec3 vCol;void main(){gl_FragColor=vec4(vCol,1.);}`}));
      m.frustumCulled=false;m.renderOrder=1;return m}};
  return api}
