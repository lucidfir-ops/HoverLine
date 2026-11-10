//# music/031-engine-modal.js: synth engine 3: modal (struck resonators: bells, mallets, guzheng)
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
