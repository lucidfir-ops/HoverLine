/* The synth voices of Prototype 45 (they run on the audio thread, in the same module as HLMono). One processor,
   'hl-syn', plays one instrument: its patch arrives once, then notes with their start time. Four engines:
   0 analog (up to 7 band-limited saws, square, triangle or a flute tone, noise, a state-variable filter, formants),
   1 FM (four sine operators in six DX-style algorithms), 2 acid (a 303-style voice: a saw or square into a
   zero-delay ladder with a high-pass in its feedback, accent and slide), 3 modal (tuned decaying partials, the
   hang). Mono instruments glide when a note is tied to the one before; between notes a voice costs nothing. */
function SYNW(){
const TAU=6.283185307179586,SR=sampleRate,NYQ=SR*0.45,TS=4096,SN=new Float32Array(TS+2);
for(let i=0;i<=TS+1;i++)SN[i]=Math.sin(i/TS*TAU);
const sn=p=>{p-=Math.floor(p);const x=p*TS,i=x|0;return SN[i]+(SN[i+1]-SN[i])*(x-i)};
const th=x=>x<-3?-1:x>3?1:x*(27+x*x)/(27+9*x*x);
const blep=(t,dt)=>{if(t<dt){t/=dt;return t+t-t*t-1}if(t>1-dt){t=(t-1)/dt;return t*t+t+t+1}return 0};
const tc=s=>s>0?1-Math.exp(-1/(s*SR)):1,CR=32,LN2=Math.LN2,LC4=Math.log2(261.63); /* CR: samples between control updates */           /* one-pole coefficient for a time constant in seconds */
const JP=[0,-0.11002313,0.10745242,-0.06288439,0.06216538,-0.01952356,0.01991221]; /* the JP-8000 voice offsets */
class Vc{constructor(){this.on=0;this.g=0;this.off=0;this.S=0;this.age=0;this.cr=0;this.v=1;this.vg=1;this.pl=0.7;this.pr=0.7;
  this.lf=7;this.lt=7;this.gk=1;this.bd=0;this.bk=1;this.pe=0;this.pk=0;this.vs=1;this.mv=1;this.cm=0;this.ac=0;this.inc=0;this.f=110;
  this.ae=0;this.as=0;this.ai=0;this.ak=0;this.rk=0;this.su=1;this.fe=0;this.fk=0;this.ns=0x2545F491;this.sp=0;this.vp=0;this.lp=0;this.mp=0;this.lr=0;
  this.hz=0;this.hc=0;this.hz2=0;this.hc2=0;this.rs=0;this.lz=0;this.lc=1;this.ya=0;this.yb=0;this.acs=0;this.ae2=0;this.n=0;this.t=0;
  this.ph=new Float64Array(8);this.dm=new Float64Array(8);this.d0=new Float64Array(8);this.dr=new Float64Array(8);this.gw=new Float64Array(8);
  this.z=new Float64Array(16);this.c=new Float64Array(24);this.oe=new Float64Array(4);this.os=new Int8Array(4);this.ol=new Float64Array(4);
  this.oi=new Float64Array(4);this.oa=new Float64Array(4);this.od=new Float64Array(4);this.orl=new Float64Array(4);this.mc=new Float64Array(8);this.my=new Float64Array(16)}}
/* a state-variable filter's coefficients (Zavalishin / Simper): c[o..o+2] for cutoff fc and damping k */
const svf=(c,o,fc,k)=>{fc=fc<20?20:fc>NYQ?NYQ:fc;const g=Math.tan(Math.PI*fc/SR),a1=1/(1+g*(g+k));c[o]=a1;c[o+1]=g*a1;c[o+2]=g*g*a1};
/* ---- engine 0: analog ---- */
function ctlVA(v,P){const k=CR/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.bd*=v.bk;v.pe*=v.pk;
  let ct=v.bd*100+v.pe;
  if(P.vd){const a=(v.age-P.vdl)/P.vdf;if(a>0){v.vp+=P.vr*k;if(v.vp>=1)v.vp-=1;ct+=P.vd*v.vs*(a>1?1:a)*sn(v.vp)}}
  const l2=v.lf+ct/1200,first=v.age<=k;v.f=Math.exp(l2*LN2);v.inc=v.f/SR;
  if(P.dr&&((v.n=(v.n+1)&3)===0||first)){for(let i=0;i<P.n;i++){v.ns^=v.ns<<13;v.ns^=v.ns>>>17;v.ns^=v.ns<<5;v.dr[i]=v.dr[i]*0.985+(v.ns/2147483648)*P.dr*v.mv*0.5;v.dm[i]=v.d0[i]*(1+v.dr[i]*0.000578)}}
  v.fe+=((v.g?P.fsu:0)-v.fe)*v.fk;
  let oc=P.fe*v.fe*(0.55+0.45*v.v)+v.cm;
  if(P.fl){v.lp+=v.lr*k;if(v.lp>=1)v.lp-=1;oc+=P.fl*v.mv*sn(v.lp)}
  svf(v.c,0,P.fc*Math.exp(LN2*(P.kt*(l2-LC4)+oc)),P.k);
  if(P.F&&(first||P.Fd&&(v.t^=1))){let m=0;if(P.Fd){v.mp+=v.lr*k*P.Fr;if(v.mp>=1)v.mp-=1;m=P.Fd*v.mv*(0.5-0.5*sn(v.mp+0.25))}
    for(let j=0;j<P.F.length;j++){const a=P.F[j],b=P.G?P.G[j]:a,kq=1/(a[1]+(b[1]-a[1])*m);svf(v.c,4+j*3,a[0]+(b[0]-a[0])*m,kq);v.c[13+j]=kq}}
  if(P.nz&&(first||Math.abs(v.lt-v.lf)>1e-3))svf(v.c,16,v.f*P.nh,1/P.nq);
  v.cr=CR}
function rVA(v,P,L,R,i0,i1,F0){const n=P.n,w=P.w,z=v.z,c=v.c,ph=v.ph,dm=v.dm,gw=v.gw,F=P.F,nf=F?F.length:0,ft=P.ft,dv=P.dv||0,dn=dv>1?1/th(dv):1,nz=P.nz/P.nq,nb=P.nb,chh=P.ch,sh=P.sh,sub=P.sub,so=0.5*P.so,fdry=P.fdry,h2=P.h2,h3=P.h3,mk=P.k;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;v.as=2}
    if(--v.cr<=0)ctlVA(v,P);
    let ae=v.ae;if(v.as===0){ae+=v.ai;if(ae>=1){ae=1;v.as=1}}else if(v.as===1)ae+=(v.su-ae)*v.ak;else{ae-=ae*v.rk;if(ae<3e-5){v.on=0;v.ae=0;return}}v.ae=ae;
    const inc=v.inc;let x=0;
    if(w===3){let p=ph[0]+inc;if(p>=1)p-=1;ph[0]=p;x=sn(p)+h2*sn(2*p)+h3*sn(3*p+0.25)}
    else for(let i=0;i<n;i++){const d=inc*dm[i];let p=ph[i]+d;if(p>=1)p-=1;ph[i]=p;
      x+=(w===0?2*p-1-blep(p,d):w===1?(p<0.5?1:-1)+blep(p,d)-blep(p>=0.5?p-0.5:p+0.5,d):4*(p<0.5?p:1-p)-1)*gw[i]}
    if(nz){v.ns^=v.ns<<13;v.ns^=v.ns>>>17;v.ns^=v.ns<<5;const r=v.ns/2147483648,ch=chh?1+chh*Math.exp(-v.age*40):1;
      const v3=r-z[15],v1=c[16]*z[14]+c[17]*v3,v2=z[15]+c[17]*z[14]+c[18]*v3;z[14]=2*v1-z[14];z[15]=2*v2-z[15];x+=(v1*nz+r*nb)*ch}
    if(sh){v.hz2+=(x-v.hz2)*v.hc2;x-=v.hz2}
    if(dv>1)x=th(x*dv)*dn;
    const v3=x-z[1],v1=c[0]*z[0]+c[1]*v3,v2=z[1]+c[1]*z[0]+c[2]*v3;z[0]=2*v1-z[0];z[1]=2*v2-z[1];let y=ft===1?v1*mk:v2;
    if(nf){let yf=0;for(let j=0;j<nf;j++){const o=4+j*3,q=2+j*2,u=x-z[q+1],b1=c[o]*z[q]+c[o+1]*u,b2=z[q+1]+c[o+1]*z[q]+c[o+2]*u;z[q]=2*b1-z[q];z[q+1]=2*b2-z[q+1];yf+=b1*c[13+j]*F[j][2]}y=y*fdry+yf}
    if(sub){v.sp+=inc*so;if(v.sp>=1)v.sp-=1;y+=sub*sn(v.sp)}
    if(P.hp){v.hz+=(y-v.hz)*v.hc;y-=v.hz}
    v.lz+=(y-v.lz)*v.lc;const o=v.lz*ae*v.vg;L[s]+=o*v.pl;R[s]+=o*v.pr}}
/* ---- engine 1: FM, four operators; m[] lists which operator modulates which (algorithm), op 3 has feedback ---- */
const ALG=[[[3,2],[2,1],[1,0]],[[1,0],[3,2]],[[1,0],[3,2],[2,0]],[[3,0],[3,1],[3,2]],[],[[2,1],[1,0]]];
const CAR=[[0],[0,2],[0],[0,1,2],[0,1,2,3],[0,3]];
function ctlFM(v,P){const k=CR/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.bd*=v.bk;v.pe*=v.pk;let ct=v.bd*100+v.pe;
  if(P.vd){const a=(v.age-P.vdl)/(P.vdf||0.3);if(a>0){v.vp+=P.vr*k;if(v.vp>=1)v.vp-=1;ct+=P.vd*v.vs*(a>1?1:a)*sn(v.vp)}}
  v.f=Math.exp((v.lf+ct/1200)*LN2);const f=v.f/SR;for(let j=0;j<4;j++)v.oi[j]=f*P.r[j]*v.dm[j];
  v.mc[0]=1;if(P.ld){v.lp+=v.lr*k;if(v.lp>=1)v.lp-=1;v.mc[0]=1+P.ld*v.mv*sn(v.lp)}v.cr=CR}
function rFM(v,P,L,R,i0,i1,F0){const al=P.al,ph=v.ph,oe=v.oe,os=v.os,ol=v.ol,oa=v.oa,od=v.od,orl=v.orl,oi=v.oi,su=P.s,lo=P.lo|0,fb=v.c[0],car=CAR[al],nc=car.length;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;for(let j=0;j<4;j++)os[j]=2}
    if(--v.cr<=0){ctlFM(v,P);let live=0;for(let i=0;i<nc;i++)if(oe[car[i]]>2e-5||os[car[i]]===0)live=1;if(!live&&v.age>0.01){v.on=0;return}}
    for(let j=0;j<4;j++){let e=oe[j];const st=os[j];if(st===0){e+=oa[j];if(e>=1){e=1;os[j]=1}}else if(st===1)e+=(su[j]-e)*od[j];else e-=e*orl[j];oe[j]=e}
    for(let j=0;j<4;j++){let p=ph[j]+oi[j];if(p>=1)p-=1;ph[j]=p}
    const m=v.mc[0],l1=ol[1]*oe[1]*(lo===1?m:1),l2=ol[2]*oe[2]*(lo===2?m:1),l3=ol[3]*oe[3]*(lo===3?m:1);
    const r3=sn(ph[3]+fb*(v.ya+v.yb));v.yb=v.ya;v.ya=r3;const y3=r3*l3;let out;
    if(al===0){const y2=sn(ph[2]+y3)*l2,y1=sn(ph[1]+y2)*l1;out=sn(ph[0]+y1)*ol[0]*oe[0]}
    else if(al===1){out=sn(ph[0]+sn(ph[1])*l1)*ol[0]*oe[0]+sn(ph[2]+y3)*ol[2]*oe[2]}
    else if(al===2){const y2=sn(ph[2]+y3)*l2;out=sn(ph[0]+sn(ph[1])*l1+y2)*ol[0]*oe[0]}
    else if(al===3){out=sn(ph[0]+y3)*ol[0]*oe[0]+sn(ph[1]+y3*0.7)*ol[1]*oe[1]+sn(ph[2]+y3*0.5)*ol[2]*oe[2]}
    else if(al===4){out=sn(ph[0])*ol[0]*oe[0]+sn(ph[1])*ol[1]*oe[1]+sn(ph[2])*ol[2]*oe[2]+y3}
    else{const y2=sn(ph[2])*l2,y1=sn(ph[1]+y2)*l1;out=sn(ph[0]+y1)*ol[0]*oe[0]+y3}
    if(P.sub){v.sp+=oi[0]*(P.so||1);if(v.sp>=1)v.sp-=1;out+=P.sub*sn(v.sp)*oe[0]}
    v.hz+=(out-v.hz)*v.hc;out-=v.hz;v.lz+=(out-v.lz)*v.lc;const o=v.lz*v.vg;L[s]+=o*v.pl;R[s]+=o*v.pr}}
/* ---- engine 2: acid. The ladder is solved without a unit delay in its loop (so it tunes and self-oscillates at the
   cutoff), with a soft clip on its input keeping self-oscillation bounded and a high-pass in the feedback path that
   keeps the low end full at high resonance, as on the TB-303. ---- */
function ctlAC(v,P){const k=8/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.f=Math.pow(2,v.lf);v.inc=v.f/SR;
  v.fe*=v.fk;v.ae2*=v.c[20];v.acs+=(v.ae2-v.acs)*(v.ae2>v.acs?v.c[21]:v.c[22]);
  const fc=P.fc*Math.pow(2,P.em*v.fe*(0.7+0.3*v.v)+P.am*v.acs+v.cm),fq=fc<25?25:fc>NYQ*0.85?NYQ*0.85:fc,g=Math.tan(Math.PI*fq/SR),G=g/(1+g),c=v.c;
  c[0]=G;c[1]=G*G;c[2]=c[1]*G;c[3]=c[2]*G;c[4]=1/(1+g);v.cr=8}
function rAC(v,P,L,R,i0,i1,F0){const z=v.z,c=v.c,sq=P.w===1,K=4.6*v.rs,A=c[6],Gh=c[5],dv=P.dv,pw=P.pw||0.5;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;v.as=2}
    if(--v.cr<=0)ctlAC(v,P);
    let ae=v.ae;if(v.as===0){ae+=v.ai;if(ae>=1){ae=1;v.as=1}}else if(v.as===1)ae+=(v.su-ae)*v.ak;else{ae-=ae*v.rk;if(ae<3e-5){v.on=0;v.ae=0;for(let i=0;i<6;i++)z[i]=0;return}}v.ae=ae;
    const d=v.inc;let p=v.ph[0]+d;if(p>=1)p-=1;v.ph[0]=p;
    let x=sq?(p<pw?1:-1)+blep(p,d)-blep(p>=pw?p-pw:p+1-pw,d):2*p-1-blep(p,d);x*=dv;
    const G=c[0],G4=c[3],S=c[4],s1=z[0]*S,s2=z[1]*S,s3=z[2]*S,s4=z[3]*S,sh=z[4];
    const Sg=c[2]*s1+c[1]*s2+G*s3+s4,kA=K*A,y4=(G4*(x+kA*sh)+Sg)/(1+kA*G4),u=th(x-kA*(y4-sh));
    let t=(u-z[0])*G,y=t+z[0];z[0]=y+t;t=(y-z[1])*G;y=t+z[1];z[1]=y+t;t=(y-z[2])*G;y=t+z[2];z[2]=y+t;t=(y-z[3])*G;y=t+z[3];z[3]=y+t;
    t=(y-z[4])*Gh;const lh=t+z[4];z[4]=lh+t;
    let o=y*(1+0.6*v.rs);v.hz+=(o-v.hz)*v.hc;o-=v.hz;o=th(o*1.6)*0.66;
    o*=ae*v.vg*(1+P.av*v.ae2);L[s]+=o*v.pl;R[s]+=o*v.pr}}
/* ---- engine 3: modal. Each partial is a two-pole resonator struck by a short raised-cosine pulse (soft hand, soft
   attack); two resonators a fraction of a hertz apart give the slow shimmer of a hammered steel note. ---- */
function rMD(v,P,L,R,i0,i1,F0){const c=v.c,y=v.my,nm=v.n,len=v.t;
  for(let s=i0;s<i1;s++){
        const a=v.age++;const x=a<len?0.5-0.5*Math.cos(TAU*a/len):0;let o=0;
    for(let j=0;j<nm;j++){const q=j*3,yn=c[q]*y[j*2]-c[q+1]*y[j*2+1]+c[q+2]*x;y[j*2+1]=y[j*2];y[j*2]=yn;o+=yn}
    if((a&255)===0&&a>len){let e=0;for(let j=0;j<nm;j++)e+=Math.abs(y[j*2])+Math.abs(y[j*2+1]);if(e<1e-5){v.on=0;return}}
    v.lz+=(o-v.lz)*v.lc;const w=v.lz*v.vg;L[s]+=w*v.pl;R[s]+=w*v.pr}}
const ENG=[rVA,rFM,rAC,rMD];
/* every number a patch may leave out */
const DEF={n:1,w:0,dt:0,mix:1,dr:0,fc:2000,kt:0,k:1.4,ft:0,fe:0,fd:0.3,fsu:0,fl:0,Fd:0,Fr:1,fdry:1,nz:0,nh:1,nq:2,nb:0,ch:0,dv:0,sub:0,so:1,sh:0,hp:20,lp:16000,
  a:0.002,d:0.3,s:1,r:0.05,vd:0,vr:5,vdl:0.2,vdf:0.3,gl:0,lg:0,pg:0,pe:0,pt:0.03,bt:0.05,out:0.3,vsn:0.5,h2:0,h3:0,lr:0,al:1,fb:0,ld:0,lo:1,pw:0.5,res:0.5,em:3,dc:0.3,dca:0.2,am:0,av:0,fh:120,st:0.004};
const fix=P=>{if(!P)return null;for(const k in DEF)if(P[k]===undefined||P[k]===null)P[k]=DEF[k];return P};
class HLSyn extends AudioWorkletProcessor{
  constructor(o){super();const p=o&&o.processorOptions||{};this.mono=!!p.mono;this.np=Math.max(1,p.poly||1);this.V=[];for(let i=0;i<(this.mono?1:this.np+2);i++)this.V.push(new Vc());
    this.q=[];this.P=fix(p.patch||null);this.last=null;this.rs=(p.seed|0)||0x9E3779B9;this.age=0;
    this.port.onmessage=e=>{const m=e.data;if(m.patch){this.P=fix(m.patch);return}if(m.clear){this.q.length=0;for(const v of this.V)v.on=0;return}if(m.ping!=null){this.port.postMessage({pong:m.ping});return}this.add(m)}}
  rnd(){let x=this.rs;x^=x<<13;x^=x>>>17;x^=x<<5;this.rs=x;return(x>>>0)/4294967296}
  add(m){m.S=Math.round(m.t*SR);m.E=m.S+Math.max(16,Math.round(m.d*SR));
    /* a tied note: hold the note before it through to this one, so it glides instead of starting again */
    const L=this.last;if(m.sl&&L&&L.E<m.S+64&&m.S-L.E<0.4*SR&&m.S>L.S){L.E=m.S+64;for(const v of this.V)if(v.on&&v.m===L)v.off=L.E}
    this.last=m;let i=this.q.length;this.q.push(m);while(i>0&&this.q[i-1].S>m.S){this.q[i]=this.q[i-1];i--}this.q[i]=m}
  start(m,F){const P=this.P;if(!P)return;let v,leg=false;
    if(this.mono){v=this.V[0];leg=v.on&&v.g&&v.off>F&&(m.sl||P.lg)}
    else{for(const x of this.V)if(!x.on){v=x;break}
      if(!v){let b=null;for(const x of this.V){if(!b||(!x.g&&b.g)||(x.g===b.g&&x.S<b.S))b=x}v=b}
      let busy=0;for(const x of this.V)if(x.on&&x.g)busy++;
      if(busy>=this.np){let o=null;for(const x of this.V)if(x.on&&x.g&&x!==v&&(!o||x.S<o.S))o=x;if(o){o.g=0;o.as=2;o.rk=tc(0.004);for(let j=0;j<4;j++){o.os[j]=2;o.orl[j]=tc(0.004)}}}}
    const was=v.on;v.m=m;v.off=m.E;v.v=m.v;v.vs=m.vs!=null?m.vs:1;v.mv=m.mv!=null?m.mv:1;v.cm=m.cm||0;v.lr=m.lr||P.lr||0;
    const lt=Math.log2(m.f),gl=m.gl!=null?m.gl:P.gl||0;
    if(leg){v.lt=lt;v.gk=gl>0?1-Math.exp(-(P.e===2?8:CR)/(gl*SR/3)):1;v.g=1;v.vg=P.out*(1-P.vsn+P.vsn*Math.pow(m.v,1.3));
      if(P.e===2&&m.ac){v.ae2=1}return}
    v.on=1;v.g=1;v.S=m.S;v.age=0;v.cr=0;v.lt=lt;
    const cs=P.e===2?8:CR;if(was&&gl>0&&(m.gl!=null||P.pg)){v.gk=1-Math.exp(-cs/(gl*SR/3))}else{v.lf=lt;v.gk=1}
    v.bd=m.bd||0;v.bk=Math.exp(-CR/(P.bt*SR));v.pe=P.pe;v.pk=Math.exp(-CR/(P.pt*SR));
    const pan=m.pan||0;v.pl=Math.cos((pan+1)*Math.PI/4);v.pr=Math.sin((pan+1)*Math.PI/4);
    const vel=Math.pow(m.v,1.3);v.vg=P.out*(1-P.vsn+P.vsn*vel);
    v.lc=tc(1/(TAU*(P.lp||16000)));v.hc=1-Math.exp(-TAU*(P.hp||20)/SR);v.hc2=1-Math.exp(-TAU*(P.sh||20)/SR);v.rs=m.res!=null?Math.max(0,Math.min(1.05,m.res)):P.res;
    if(P.e===1){/* FM: operator levels from velocity and key, an alias guard on every modulator */
      const f=m.f,oct=Math.log2(f/261.63);for(let j=0;j<4;j++){v.dm[j]=Math.pow(2,(P.dt[j]||0)/1200);
        let l=P.lv[j]*(1-P.vs[j]+P.vs[j]*vel)*Math.pow(2,(P.ks[j]||0)*Math.max(0,oct)/6);if(f*P.r[j]>NYQ)l=0;v.ol[j]=l;
        v.oa[j]=1/Math.max(1,P.a[j]*SR);v.od[j]=tc(P.d[j]/3);v.orl[j]=tc(P.rl[j]/3);if(!was){v.oe[j]=0;v.ph[j]=0}v.os[j]=0}
      for(const[a,b]of ALG[P.al]){const fm=f*P.r[a],fcr=f*P.r[b],mx=Math.max(0,(NYQ-fcr)/fm-1)*TAU;if(v.ol[a]>mx)v.ol[a]=mx}
      for(const j of new Set(ALG[P.al].map(x=>x[0])))v.ol[j]/=TAU;v.c[0]=P.fb/TAU/2*Math.min(1,Math.sqrt(250/(f*P.r[3]))); /* feedback eases off up the keyboard (it is what aliases) */if(!was){v.ya=v.yb=0;v.hz=0;v.lz=0;v.sp=0}v.mc[0]=1;return}
    if(P.e===3){/* modal: two-pole resonators */
      const f=m.f,M=P.m,len=Math.max(8,Math.round(SR*(P.st||0.004)*(1.25-0.5*vel)));let n=0;for(const[r,a,t60,dh]of M){for(const sgn of dh?[-1,1]:[0]){const fr=f*r+sgn*dh;if(fr>NYQ)continue;const w=TAU*fr/SR,rr=Math.exp(-6.91/(t60*SR*(1-0.3*Math.min(1,Math.max(0,Math.log2(f/220)/3))))),q=n*3;
        const amp=a*(r>1.5?0.55+0.45*vel:1)*(dh?0.5:1);v.c[q]=2*rr*Math.cos(w);v.c[q+1]=rr*rr;v.c[q+2]=amp*Math.sin(w)*4/len;n++;if(n>=7)break}if(n>=7)break}
      v.n=n;for(let j=0;j<16;j++)v.my[j]=0;v.t=len;v.lz=0;return}
    /* analog and acid: amp envelope from where the voice already is (no click on a retrigger) */
    v.ai=(1-v.ae)/Math.max(1,(P.a||0.002)*SR);v.as=0;v.ak=tc(P.d/3);v.su=P.s;v.rk=tc(P.r/3);
    if(P.e===2){v.fe=1;v.fk=Math.exp(-8/(((m.ac?P.dca:P.dc)||0.3)*SR/3));if(m.ac)v.ae2=1;v.c[20]=Math.exp(-8/(0.2*SR/3));v.c[21]=1-Math.exp(-8/(0.03*SR));v.c[22]=1-Math.exp(-8/(0.35*SR));
      const gh=Math.tan(Math.PI*(P.fh||120)/SR);v.c[5]=gh/(1+gh);v.c[6]=1-v.c[5];if(!was){for(let i=0;i<6;i++)v.z[i]=0;v.ph[0]=this.rnd();v.acs=0;v.hz=0}return}
    v.fe=1;v.fk=tc(P.fd/3/CR);
    if(!was){const n=P.n||1;let tot=0;for(let i=0;i<n;i++){const off=n>1?JP[i]/0.11*(P.dt||0):0;v.d0[i]=Math.pow(2,off/1200);v.dm[i]=v.d0[i];v.dr[i]=0;v.ph[i]=this.rnd();v.gw[i]=i===0?1:P.mix;tot+=v.gw[i]*v.gw[i]}
      const nrm=1/Math.sqrt(tot);for(let i=0;i<n;i++)v.gw[i]*=nrm;for(let i=0;i<16;i++)v.z[i]=0;v.hz=0;v.hz2=0;v.lz=0;v.sp=0;v.ns=(this.rnd()*2147483647|0)||7;v.vp=0;v.lp=this.rnd();v.mp=0}}
  process(I,O){const o=O[0],L=o[0],R=o[1]||o[0],n=L.length;L.fill(0);if(R!==L)R.fill(0);
    if(!this.P)return true;const F0=currentFrame,F1=F0+n;let i=0;
    while(this.q.length&&this.q[0].S<F1){const m=this.q.shift();if(m.S<F0-0.12*SR)continue; /* far too late (a stalled thread): skipped, not bunched */
      const k=Math.max(i,Math.min(n,m.S-F0));if(k>i){this.run(L,R,F0,i,k);i=k}this.start(m,F0+i)}
    if(i<n)this.run(L,R,F0,i,n);return true}
  run(L,R,F0,i0,i1){const P=this.P,E=ENG[P.e];for(const v of this.V)if(v.on)E(v,P,L,R,i0,i1,F0)}}
registerProcessor('hl-syn',HLSyn)}
