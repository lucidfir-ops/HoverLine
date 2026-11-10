// Tiny neon wireframe renderer for Spirit Realm concept art (not game code).
const W=1600,H=900;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=a=>Math.hypot(a[0],a[1],a[2]),norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rot(v,axis,ang){const k=norm(axis),c=Math.cos(ang),s=Math.sin(ang);return add(add(mul(v,c),mul(cross(k,v),s)),mul(k,dot(k,v)*(1-c)))}
const UP=[0,1,0];
function mkCam(pos,target,fov){const f=norm(sub(target,pos));const r=norm(cross(UP,f));const u=cross(f,r);return{pos,f,r,u,th:Math.tan(fov*Math.PI/360)}}

class Scene{
  constructor(cam,o={}){this.cam=cam;this.items=[];this.fog=o.fog||260;this.far=o.far||700;
    this.hueFn=o.hueFn||(y=>y*2+200);this.hstep=o.hstep||10;this.bg=o.bg||[258,55];this.K=(H/2/cam.th)*0.12;}
  tc(p){const c=this.cam,d=sub(p,c.pos);return[dot(d,c.r),dot(d,c.u),dot(d,c.f)]}
  pj(c){const k=(H/2)/(this.cam.th*c[2]);return[W/2+c[0]*k,H/2-c[1]*k]}
  hue(y){return((this.hueFn(y)%360)+360)%360}
  // immediate line
  L(a,b,o={}){
    if(o.h==null){const n=clamp(Math.ceil(Math.abs(a[1]-b[1])/this.hstep),1,14);
      if(n>1){for(let i=0;i<n;i++){const p=lerp(a,b,i/n),q=lerp(a,b,(i+1)/n);this.L(p,q,{...o,h:this.hue((p[1]+q[1])/2)})}return}
      o={...o,h:this.hue((a[1]+b[1])/2)}}
    let ca=this.tc(a),cb=this.tc(b);const nr=0.6;
    if(ca[2]<nr&&cb[2]<nr)return;
    if(ca[2]<nr)ca=lerp(ca,cb,(nr-ca[2])/(cb[2]-ca[2]));
    if(cb[2]<nr)cb=lerp(cb,ca,(nr-cb[2])/(ca[2]-cb[2]));
    const z=(ca[2]+cb[2])/2;if(z>this.far)return;
    const al=(o.a==null?1:o.a)*Math.exp(-z/this.fog);if(al<0.015)return;
    const pa=this.pj(ca),pb=this.pj(cb);
    if(Math.max(pa[0],pb[0])<-50||Math.min(pa[0],pb[0])>W+50||Math.max(pa[1],pb[1])<-50||Math.min(pa[1],pb[1])>H+50)return;
    const px=clamp((o.w||0.5)*this.K/z,0.55,16);
    const col=(al2)=>`hsla(${o.h},${o.s==null?100:o.s}%,${o.l==null?60:o.l}%,${al2})`;
    ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pb[0],pb[1]);
    if(px>1.4){ctx.lineWidth=px*3.4;ctx.strokeStyle=col(al*0.16);ctx.stroke();}
    ctx.lineWidth=px;ctx.strokeStyle=col(al);ctx.stroke();
  }
  line(a,b,o){const c=this.tc(a),d=this.tc(b);const z=(c[2]+d[2])/2;if(z<0.3||z>this.far)return;this.items.push({z,f:()=>this.L(a,b,o)})}
  poly(pts,fill,o={}){ // deferred filled polygon with optional edge
    let cs=pts.map(p=>this.tc(p));const nr=0.6;const out=[];
    for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length];
      if(a[2]>=nr)out.push(a);
      if((a[2]>=nr)!==(b[2]>=nr))out.push(lerp(a,b,(nr-a[2])/(b[2]-a[2])));}
    if(out.length<3)return;const z=out.reduce((s,c)=>s+c[2],0)/out.length;if(z>this.far)return;
    this.items.push({z:z+(o.bias||0),f:()=>{const q=out.map(c=>this.pj(c));ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(o.after)o.after();}});
  }
  dot(p,o={}){const c=this.tc(p);if(c[2]<0.6||c[2]>this.far)return;const al=(o.a==null?1:o.a)*Math.exp(-c[2]/this.fog);if(al<0.02)return;
    this.items.push({z:c[2],f:()=>{const q=this.pj(c);const r=clamp((o.r||1)*this.K*2/c[2],0.8,40);
      const h=o.h==null?this.hue(p[1]):o.h;
      for(const [m,aa] of [[4,0.1],[2,0.25],[1,1]]){ctx.beginPath();ctx.arc(q[0],q[1],r*m,0,7);ctx.fillStyle=`hsla(${h},${o.s==null?100:o.s}%,${m==1?(o.l||85):60}%,${al*aa})`;ctx.fill();}
      if(o.star){ctx.strokeStyle=`hsla(${h},100%,85%,${al*0.8})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-r*6,q[1]);ctx.lineTo(q[0]+r*6,q[1]);ctx.moveTo(q[0],q[1]-r*6);ctx.lineTo(q[0],q[1]+r*6);ctx.stroke();}
    }})}
  // convex solid from faces (arrays of world verts)
  solid(faces,center,o={}){
    const cs=o.cs||4,ew=o.ew==null?0.5:o.ew,ea=o.ea==null?0.9:o.ea;
    for(const fv of faces){
      const fc=fv.reduce((s,p)=>add(s,p),[0,0,0]).map(x=>x/fv.length);
      let n=norm(cross(sub(fv[1],fv[0]),sub(fv[2],fv[0])));if(dot(n,sub(fc,center))<0)n=mul(n,-1);
      if(dot(n,sub(this.cam.pos,fc))<=0)continue;
      const z=this.tc(fc)[2];if(z<0.5||z>this.far)continue;
      const lit=o.lit==null?1:o.lit;const l=3+4*Math.max(0,n[1])*lit+2*Math.abs(n[0])*0.3;
      const fill=`hsl(${o.fh||255},45%,${l}%)`;
      this.poly(fv,fill,{bias:o.bias||0,after:()=>{
        if(o.contour!==false){let y0=1e9,y1=-1e9;fv.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
          if(y1-y0>0.2&&(y1-y0)/cs<40)for(let lv=Math.ceil(y0/cs)*cs;lv<y1;lv+=cs){const pts=[];
            for(let i=0;i<fv.length;i++){const a=fv[i],b=fv[(i+1)%fv.length];if((a[1]-lv)*(b[1]-lv)<0)pts.push(lerp(a,b,(lv-a[1])/(b[1]-a[1])));}
            if(pts.length>=2)this.L(pts[0],pts[1],{h:this.hue(lv),a:(o.ca==null?0.55:o.ca),w:0.28});}}
        for(let i=0;i<fv.length;i++)this.L(fv[i],fv[(i+1)%fv.length],{a:ea,w:ew,l:o.el||62,h:o.eh});
        if(o.after2)o.after2(fv,n);
      }});
    }
  }
  box(c,a1,a2,a3,o){const ax=[a1,a2,a3];const faces=[];
    for(let i=0;i<3;i++)for(const s of[1,-1]){const j=(i+1)%3,k=(i+2)%3;const base=add(c,mul(ax[i],s));
      faces.push([add(add(base,ax[j]),ax[k]),add(sub(base,ax[j]),ax[k]),sub(sub(base,ax[j]),ax[k]),sub(add(base,ax[j]),ax[k])]);}
    this.solid(faces,c,o)}
  pyramid(cx,cy,cz,half,h,o){const b=[[cx-half,cy,cz-half],[cx+half,cy,cz-half],[cx+half,cy,cz+half],[cx-half,cy,cz+half]],ap=[cx,cy+h,cz];
    const faces=[];for(let i=0;i<4;i++)faces.push([b[i],b[(i+1)%4],ap]);this.solid(faces,[cx,cy+h*0.3,cz],o)}
  ziggurat(cx,cy,cz,half,n,sh,o={}){const inv=o.inv?-1:1;
    for(let k=0;k<n;k++){const sz=half*(1-k/(n+0.6));this.box([cx,cy+inv*(k+0.5)*sh,cz],[sz,0,0],[0,sh/2,0],[0,0,sz],o)}}
  render(bgFn){
    ctx.globalCompositeOperation='source-over';ctx.filter='none';
    if(bgFn)bgFn(); else this.background();
    this.items.sort((a,b)=>b.z-a.z);
    for(const it of this.items){ctx.globalCompositeOperation='source-over';it.f();}
    // bloom
    const off=document.createElement('canvas');off.width=W;off.height=H;off.getContext('2d').drawImage(cv,0,0);
    ctx.globalCompositeOperation='lighter';
    ctx.filter='blur(7px)';ctx.globalAlpha=0.75;ctx.drawImage(off,0,0);
    ctx.filter='blur(26px)';ctx.globalAlpha=0.8;ctx.drawImage(off,0,0);
    ctx.filter='none';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    const g=ctx.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,10,0.55)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  background(opts={}){
    const g=ctx.createLinearGradient(0,0,0,H);const b=this.bg[0];
    g.addColorStop(0,`hsl(${b},60%,3%)`);g.addColorStop(0.5,`hsl(${b+10},55%,8%)`);g.addColorStop(0.62,`hsl(${b+40},60%,13%)`);g.addColorStop(1,`hsl(${b},50%,3%)`);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const r=rng(7);for(let i=0;i<260;i++){ctx.fillStyle=`hsla(${r()*360},60%,${70+r()*30}%,${0.15+r()*0.6})`;const s=r()<0.1?2:1;ctx.fillRect(r()*W,r()*H*0.8,s,s);}
  }
}

// ---- track ----
function catmull(pts,ds=1){const dense=[];const n=pts.length;
  for(let i=0;i<n-1;i++){const p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,n-1)];
    for(let u=0;u<1;u+=0.02){const t=u,t2=t*t,t3=t2*t;dense.push([0,1,2].map(k=>0.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)))}}
  dense.push(pts[n-1]);const out=[dense[0]];let acc=0,next=ds;
  for(let i=1;i<dense.length;i++){const d=len(sub(dense[i],dense[i-1]));
    while(acc+d>=next){out.push(lerp(dense[i-1],dense[i],(next-acc)/d));next+=ds}acc+=d}
  return{ds,pts:out,len:out.length*ds,
    P(s){const f=clamp(s/ds,0,out.length-1.001),i=Math.floor(f);return lerp(out[i],out[i+1],f-i)},
    T(s){return norm(sub(this.P(s+1.5),this.P(s-1.5)))},
    R(s){return norm(cross(UP,this.T(s)))},
    U(s){const T=this.T(s);return cross(T,norm(cross(UP,T)))},
    dist(p){let m=1e9;for(let i=0;i<out.length;i+=2){const d=Math.hypot(p[0]-out[i][0],p[1]-out[i][1],p[2]-out[i][2]);if(d<m)m=d}return m}};
}
function drawTrack(S,tr,s0,s1,o={}){
  const w=o.w||5,step=2,fillH=o.fh||250;
  for(let s=s0;s<s1;s+=step){
    const p0=tr.P(s),p1=tr.P(s+step),R0=tr.R(s),R1=tr.R(s+step);
    const l0=sub(p0,mul(R0,w)),r0=add(p0,mul(R0,w)),l1=sub(p1,mul(R1,w)),r1=add(p1,mul(R1,w));
    const idx=Math.round(s/step);
    S.poly([l0,r0,r1,l1],`hsl(${fillH},45%,5%)`,{bias:-0.3,after:()=>{
      for(const f of[-0.78,-0.52,-0.26,0.26,0.52,0.78]){
        const h=((s*1.5+f*140+p0[1]*3+(o.hoff||0))%360+360)%360;
        const sh=0.25+0.75*Math.pow(Math.abs(Math.sin(s*0.065+f*6)),3);
        S.L(add(p0,mul(R0,w*f)),add(p1,mul(R1,w*f)),{h,l:62,a:0.8*sh+0.12,w:0.42});}
      S.L(l0,l1,{h:o.rail||185,l:72,a:1,w:0.75});S.L(r0,r1,{h:o.rail||185,l:72,a:1,w:0.75});
      if(idx%2==0)S.L(l0,r0,{h:(s*1.5+90)%360,a:0.28,w:0.3});
      if(idx%3==0)S.L(p0,add(p0,mul(tr.T(s),step*0.6)),{h:50,l:80,a:0.7,w:0.4});
    }});
  }
}
function craft(S,tr,s,o={}){
  const P=add(tr.P(s),mul(tr.U(s),1.1)),T=tr.T(s),R=tr.R(s),U=tr.U(s);
  const N=add(P,mul(T,3.2)),TL=add(sub(P,mul(T,2.4)),mul(R,-2.5)),TR=add(sub(P,mul(T,2.4)),mul(R,2.5)),TU=add(sub(P,mul(T,2.2)),mul(U,1.3)),TB=sub(P,mul(T,2.4));
  const hue=o.h||320;const fills=`hsl(${hue},40%,9%)`;
  for(const f of[[N,TL,TU],[N,TU,TR],[TL,TU,TR,TB]])S.poly(f,fills,{bias:-1,after:()=>{for(let i=0;i<f.length;i++)S.L(f[i],f[(i+1)%f.length],{h:hue,l:78,a:1,w:0.7})}});
  S.dot(sub(add(P,mul(R,1.0)),mul(T,2.3)),{h:190,r:0.5,l:90});S.dot(sub(sub(P,mul(R,1.0)),mul(T,2.3)),{h:190,r:0.5,l:90});
  for(const sgn of[-1,1])for(let i=0;i<6;i++){const a=sub(add(P,mul(R,sgn*1.0)),mul(T,2.4+i*1.2)),b=sub(add(P,mul(R,sgn*1.0)),mul(T,3.4+i*1.2));S.line(a,b,{h:190,a:0.7-i*0.1,w:0.5})}
}
function beams(S,tr,s0,s1,offs,o={}){
  for(const off of offs){const ph=(off*13)%7;
    for(let s=s0;s<s1;s+=1.5){const I=Math.pow(0.5+0.5*Math.sin((s*0.16)-ph),7);
      const a=add(add(tr.P(s),mul(tr.R(s),off)),mul(tr.U(s),o.h||1)),b=add(add(tr.P(s+1.5),mul(tr.R(s+1.5),off)),mul(tr.U(s+1.5),o.h||1));
      S.line(a,b,{h:((s*2+off*20)%360+360)%360,l:50+I*40,a:0.12+0.88*I,w:0.3+1.8*I});}}
}
function ringBlocks(S,tr,s,R,N,phase,o={}){
  const P=tr.P(s),T=tr.T(s),Rr=tr.R(s),Uu=tr.U(s);const hue=o.h==null?(s*3)%360:o.h;const rnd=rng(Math.floor(s*7+R));
  for(let i=0;i<N;i++){const th=phase+i*2*Math.PI/N;const rad=add(mul(Rr,Math.cos(th)),mul(Uu,Math.sin(th)));
    const tan=add(mul(Rr,-Math.sin(th)),mul(Uu,Math.cos(th)));const out=o.out?o.out(i):0;
    const c=add(add(P,mul(rad,R+out)),o.jit?mul(T,(rnd()-0.5)*o.jit):[0,0,0]);
    const hl=(o.size||1.1);
    S.box(c,mul(rad,hl),mul(T,hl*(o.dep||1.2)),mul(tan,R*Math.PI/N*0.82),{cs:o.cs||1.2,eh:(hue+i*8)%360,ew:o.ew||0.5,ca:0.7});}
}
function finish(name){window.done=name;document.title='done:'+name}
