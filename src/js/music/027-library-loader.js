//# music/027-library-loader.js: loads the sample library (SMP) and synths (SYN) when present
/* ---- the library (Prototype 45): SMP (sampled kits and instruments) and SYN (synths), both optional; everything
   falls back to the embedded kits and patches while they are missing or loading ---- */
const MX={smp(){try{return typeof SMP!=='undefined'&&SMP?SMP:null}catch(e){return null}},syn(){try{return typeof SYN!=='undefined'&&SYN?SYN:null}catch(e){return null}},
  /* a library synth by name (SYN), if there is one */
  hasSyn(n){const S=this.syn();try{return!!(S&&n&&S.P&&S.P[n])}catch(e){return false}},
  /* offline renders (Pregen): the library synths' worklet voices read their notes before the render runs on */
  sync(eng){const S=this.syn();try{return S&&S.sync?Promise.resolve(S.sync(eng)).catch(()=>{}):Promise.resolve()}catch(e){return Promise.resolve()}},
  /* the library kit a template asks for: the first of its preferences that the manifest has */
  kitOf(prefs){const S=this.smp();if(!S||S.fallback||!S.manifest)return null;for(const k of prefs||[])if(S.kit(k))return k;return null},
  /* a library instrument by our name: the first name the manifest has */
  INST:{hangS:['hang','hang_drum'],hangB:['hang','hang_drum'],didg:['didgeridoo'],gtr:['gtr_power','guitar_power'],gtrm:['gtr_mute','gtr_chug','guitar_mute'],gtrl:['gtr_dist','gtr_power'],ebass:['bass_finger','bass_pick'],slap:['bass_slap']},
  instOf(n){const S=this.smp();if(!S||S.fallback||!S.manifest)return null;for(const k of this.INST[n]||[n])if(S.inst(k))return k;return null}};
/* Sitar (no CC0 recording exists, so it is modelled): a plucked string (Karplus-Strong) whose loop folds back on itself
   above a threshold, the buzz of a jawari bridge; four sympathetic strings tuned to Sa, Pa and the octaves of the
   key ring along, fed from the main string. */
SL.sitar=(sr,midi,key)=>{const len=1.5,N=Math.ceil(sr*len),out=new Float32Array(N),r=rng(midi*31+7),f=440*Math.pow(2,(midi-69)/12);
  const mk=(fr,damp,br)=>{const P=sr/fr+0.5,D=Math.floor(P),fc=P-D,C=(1-fc)/(1+fc),L=Math.max(2,D),line=new Float32Array(L);return{line,L,C,damp,br,idx:0,ax:0,ay:0}};
  const S=mk(f,0.9975,0);let lp=0;for(let i=0;i<S.L;i++){lp+=((r()*2-1)-lp)*0.7;S.line[i]=lp*(i<S.L*0.5?1:0.6)}
  const sym=[0,7,12,19].map(iv=>{let m=48+((key%12)+12)%12+iv;while(m<midi-14)m+=12;return mk(440*Math.pow(2,(m-69)/12),0.9992,0)});
  const step=(o,inp)=>{const a=o.line[o.idx],b=o.line[o.idx+1<o.L?o.idx+1:0];let y=o.damp*0.5*(a+b)+inp;const ap=o.C*y+o.ax-o.C*o.ay;o.ax=y;o.ay=ap;o.line[o.idx]=ap;o.idx=o.idx+1<o.L?o.idx+1:0;return a};
  let env=1;const th=0.32;
  for(let n=0;n<N;n++){/* main string with the bridge: a one-sided fold above the threshold keeps adding bright partials */
    const a=S.line[S.idx],b=S.line[S.idx+1<S.L?S.idx+1:0];let y=S.damp*0.5*(a+b);if(y>th)y=th-(y-th)*0.45;const ap=S.C*y+S.ax-S.C*S.ay;S.ax=y;S.ay=ap;S.line[S.idx]=ap;S.idx=S.idx+1<S.L?S.idx+1:0;
    let s=a;for(const o of sym)s+=0.55*step(o,a*0.004);out[n]=s}
  SL.hp1(out,sr,120);SL.biq(out,sr,'peak',2600,1.2,4);SL.biq(out,sr,'lp',7000,0.7);let pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const g=0.9/(pk||1),fo=Math.floor(sr*0.05),fi=Math.round(sr*0.00075);
  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1)*(n<fi?0.5-0.5*Math.cos(Math.PI*n/fi):1);return out};
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
