/* ---------- synth instruments (Prototype 45) ----------
   Eric asked for our own instruments in place of DAW plugins. Every one is a name in SYN.P and plays with
   SYN.play(name, time, midi, dur, vel, opts) (or SYN.get(name).play(...)); a template can name one as its lead (tSyn
   routes it) and a bass patch can carry syn: (bassNote routes it). Three kinds:
   - live voices on the audio thread (the hl-syn worklet below): the acid, FM, analog leads and basses, erhu, bansuri
     and the hang. Cheap: one band-limited oscillator stack and a filter per note.
   - seamless loops rendered at load (supersaws and pads): the spectrum of 7 detuned saws (or a choir, or an analog
     pad) is laid out on an exact grid and turned into sound with one inverse FFT, so the loop repeats without a seam,
     has no aliasing at all and plays with one buffer source per note. 2 s at 32 kHz (pads 2.7 s at 24 kHz), one
     every 6 semitones (pads every 4).
   - plucked strings rendered at load (guzheng, tanpura), like the sitar.
   No unseeded randomness here: the engine's seeded rng() only (the race simulator seeds the global one). */
SL.WORKLET+='\n('+SYNW.toString()+')();';
/* inverse FFT in place (radix 2); the twiddles are kept for the size in use */
SL.ifft=(re,im)=>{const N=re.length;let T=SL._tw;if(!T||T.N!==N){T=SL._tw={N,c:new Float64Array(N/2),s:new Float64Array(N/2)};for(let i=0;i<N/2;i++){T.c[i]=Math.cos(2*Math.PI*i/N);T.s[i]=Math.sin(2*Math.PI*i/N)}}
  for(let i=1,j=0;i<N;i++){let b=N>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  for(let len=2;len<=N;len<<=1){const h=len>>1,st=N/len;for(let i=0;i<N;i+=len)for(let j=0;j<h;j++){const wr=T.c[j*st],wi=T.s[j*st],a=i+j,b=a+h,xr=re[b]*wr-im[b]*wi,xi=re[b]*wi+im[b]*wr;re[b]=re[a]-xr;im[b]=im[a]-xi;re[a]+=xr;im[a]+=xi}}};
/* A stereo loop from partials on the FFT grid: add(bin, amplitude, phase, left gain, right gain); the left channel is
   the real part and the right the imaginary part of one transform. Levelled to RMS 0.2. */
SL.specLoop=(N,sr,fill)=>{const re=SL._re&&SL._re.length===N?SL._re.fill(0):SL._re=new Float64Array(N),im=SL._im&&SL._im.length===N?SL._im.fill(0):SL._im=new Float64Array(N);
  const add=(b,A,ps,gl,gr)=>{if(b<=0||b>=N/2||!(A>0))return;const h=A/2,c=Math.cos(ps),s=Math.sin(ps),k=N-b;re[b]+=h*(gl*c-gr*s);im[b]+=h*(gl*s+gr*c);re[k]+=h*(gl*c+gr*s);im[k]+=h*(gr*c-gl*s)};
  fill(add,sr/N);SL.ifft(re,im);let e=0;for(let i=0;i<N;i++)e+=re[i]*re[i]+im[i]*im[i];const g=0.2/Math.sqrt(e/(2*N)||1);
  const b=new AudioBuffer({length:N,sampleRate:sr,numberOfChannels:2}),L=b.getChannelData(0),R=b.getChannelData(1);for(let i=0;i<N;i++){L[i]=re[i]*g;R[i]=im[i]*g}return b};
/* magnitude helpers: Butterworth low/high-pass of order 2n, a raised-cosine fade to nothing between f0 and f1 */
SL.mlp=(f,fc,n=1)=>1/Math.sqrt(1+Math.pow(f/fc,2*n*2));SL.mhp=(f,fc)=>{const x=Math.pow(f/fc,4);return Math.sqrt(x/(1+x))};
SL.mtap=(f,f0,f1)=>f<=f0?1:f>=f1?0:0.5+0.5*Math.cos(Math.PI*(f-f0)/(f1-f0));
/* the loop sets: supersaws (JP-8000 detune curve and mix law; the seven saws on alternate sides), the warm analog pad
   (three saws and a sub an octave down, 24 dB low-pass) and the choir (six singers on an "ah" leaning to "oh", each a
   little apart in pitch and formants, with breath) */
SL.LOOP=(set,midi)=>{const L=SYN.LS[set],r=rng(midi*977+set.length*131+7),f0=mtof(midi);let fr=0;
  if(L.k==='ss'){const N=65536,sr=32000,x=L.det,c=[10028.7312891634,-50818.8652045924,111363.4808729368,-138150.6761080548,106649.6679158292,-53046.9642751875,17019.951858008,-3425.0836591318,404.2703938388,-24.1878824391,0.6717417634,0.0030115596];
    let D=0;for(const k of c)D=D*x+k;const mc=-0.55366*L.mix+0.99785,ms=-0.73764*L.mix*L.mix+1.2841*L.mix+0.044372,O=[-0.11002313,-0.06288439,-0.01952356,0,0.01991221,0.06216538,0.10745242],PN=[-1,0.6,-0.35,0,0.35,-0.6,1];
    const b=SL.specLoop(N,sr,(add,df)=>{const b0=Math.round(f0/df),B=O.map(o=>Math.round(b0*(1+o*D)));for(let i=4;i<7;i++)B[i]=Math.max(B[i],B[i-1]+1);for(let i=2;i>=0;i--)B[i]=Math.min(B[i],B[i+1]-1);fr=b0*df;
      B.forEach((bi,i)=>{const A=i===3?mc:ms,ph=r()*2*Math.PI,p=PN[i]*L.wd,gl=Math.cos((p+1)*Math.PI/4),gr=Math.sin((p+1)*Math.PI/4);
        for(let k=1;k*bi*df<L.fmax;k++){const f=k*bi*df;add(k*bi,A/k*SL.mlp(f,L.lp)*SL.mhp(f,fr*0.8)*SL.mtap(f,L.fmax-2000,L.fmax),k*ph-Math.PI/2,gl,gr)}})});return{b,f:fr}}
  const N=65536,sr=24000;
  if(L.k==='warm'){const b=SL.specLoop(N,sr,(add,df)=>{const b0=Math.round(f0/df);fr=b0*df;const fc=1700*Math.pow(f0/261.63,0.35);
      [[-7,-0.65,1],[0,0,0.9],[7,0.65,1],[-1200,0,0.45]].forEach(([ct,p,A])=>{let bi=Math.round(b0*Math.pow(2,ct/1200));if(ct&&ct>-1000&&bi===b0)bi+=ct>0?1:-1;const ph=r()*2*Math.PI,gl=Math.cos((p+1)*Math.PI/4),gr=Math.sin((p+1)*Math.PI/4);
        for(let k=1;k*bi*df<6500;k++){const f=k*bi*df;add(k*bi,A/k*SL.mlp(f,fc,2)*SL.mtap(f,4200,6500)*(f<90?f/90:1),k*ph-Math.PI/2,gl,gr)}})});return{b,f:fr}}
  if(L.k==='choir'){const FA=[[800,80,1],[1150,90,0.63],[2800,120,0.1],[3500,130,0.016]],FO=[[450,70,1],[800,80,0.35],[2830,100,0.16],[3500,130,0.04]];
    const H=(f,s)=>{let a=0.012;for(let j=0;j<4;j++){const F=(FA[j][0]*0.45+FO[j][0]*0.55)*s,B=FA[j][1]*0.45+FO[j][1]*0.55,G=FA[j][2]*0.45+FO[j][2]*0.55;a+=G/Math.sqrt(1+Math.pow(2*(f-F)/B,2))}return a};
    const b=SL.specLoop(N,sr,(add,df)=>{const b0=Math.round(f0/df);fr=b0*df;
      [[-11,-0.8,0.97],[-6,0.45,1.03],[-2,-0.2,1],[2,0.2,0.98],[6,-0.45,1.02],[11,0.8,1.01]].forEach(([ct,p,fs],i)=>{let bi=Math.round(b0*Math.pow(2,ct/1200));if(bi===b0)bi+=ct>0?1:-1;const ph=r()*2*Math.PI,gl=Math.cos((p+1)*Math.PI/4),gr=Math.sin((p+1)*Math.PI/4);
        for(let k=1;k*bi*df<6000;k++){const f=k*bi*df;add(k*bi,H(f,fs)/k*SL.mtap(f,3800,6000)*(f<110?f/110:1),k*ph-Math.PI/2+r()*0.3,gl,gr)}});
      for(let bi=Math.round(250/df);bi*df<5200;bi++){const f=bi*df,A=0.0016*H(f,1)*SL.mtap(f,3500,5200);add(bi,A,r()*2*Math.PI,1,0);add(bi,A,r()*2*Math.PI,0,1)}});return{b,f:fr}}
  return null};
/* Guzheng: a steel string (Karplus-Strong with a slightly stretched, bright loop), plucked near its end by a
   fingerpick, on a soundboard with three broad resonances. One every 3 semitones; bends are played by the source. */
SL.ksTune=(sr,f,S,ad)=>{const w=2*Math.PI*f/sr,ph1=Math.atan2(-S*Math.sin(w),(1-S)+S*Math.cos(w)),pa=a=>Math.atan2(-Math.sin(w),a+Math.cos(w))-Math.atan2(-a*Math.sin(w),1+a*Math.cos(w));
  let t=sr/f+ph1/w+pa(ad)/w;const D=Math.floor(t-0.5),fr=t-D;return{D:Math.max(2,D),C:(1-fr)/(1+fr)}};
SL.guzheng=(sr,midi)=>{const f=mtof(midi),len=Math.max(1.6,Math.min(2.6,2.6-(midi-50)*0.025)),N=Math.ceil(sr*len),out=new Float32Array(N),r=rng(midi*53+11);
  const S=0.4,ad=-0.18,{D,C}=SL.ksTune(sr,f,S,ad),T60=Math.max(1.3,4.2-(midi-50)*0.07),rho=Math.pow(10,-3/(T60*f)),line=new Float64Array(D),pos=Math.max(1,Math.round(D*0.13));
  let lp=0;for(let i=0;i<D;i++){lp+=((r()*2-1)-lp)*0.62;line[i]=lp}for(let i=D-1;i>=pos;i--)line[i]-=line[i-pos]*0.9;
  let idx=0,x1=0,ax=0,ay=0,dx=0,dy=0;
  for(let n=0;n<N;n++){const a=line[idx],y=rho*((1-S)*a+S*x1);x1=a;const d=ad*y+dx-ad*dy;dx=y;dy=d;const ap=C*d+ax-C*ay;ax=d;ay=ap;line[idx]=ap;idx=idx+1<D?idx+1:0;out[n]=a}
  for(let n=0;n<Math.min(N,Math.round(sr*0.004));n++)out[n]+=0.08*(r()*2-1)*(1-n/(sr*0.004));
  for(let n=0,F=Math.round(sr*0.0008);n<F;n++)out[n]*=0.5-0.5*Math.cos(Math.PI*n/F);
  SL.hp1(out,sr,70);SL.biq(out,sr,'peak',230,1,5);SL.biq(out,sr,'peak',520,1.4,3);SL.biq(out,sr,'peak',1250,1.2,2);SL.biq(out,sr,'peak',4200,0.8,-3);SL.biq(out,sr,'lp',7000,0.7);SL.biq(out,sr,'lp',7800,0.6);
  let pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const g=0.9/(pk||1),fo=Math.floor(sr*0.06);for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1);
  const b=new AudioBuffer({length:N,sampleRate:sr,numberOfChannels:1});b.getChannelData(0).set(out);return{b,f}};
/* Tanpura: four strings (Pa, Sa, Sa, low Sa) plucked in turn, each with a jawari bridge whose buzz follows the
   string down (so the shimmer lasts the whole note); the tails wrap round, so the 5.2 s cycle loops seamlessly. */
SL.tanpura=(sr,pc)=>{const Lc=Math.round(sr*5.2),out=new Float32Array(Lc),r=rng(pc*131+5),sa=48+pc;
  [[sa-5,0,0],[sa,1.3,1.5],[sa,2.6,-1.5],[sa-12,3.9,0]].forEach(([m,t0,ct],j)=>{const f=mtof(m)*Math.pow(2,ct/1200),{D,C}=SL.ksTune(sr,f,0.5,0),line=new Float64Array(D),T60=7.5,rho=Math.pow(10,-3/(T60*f));
    let lp=0;for(let i=0;i<D;i++){lp+=((r()*2-1)-lp)*0.55;line[i]=lp}let idx=0,ax=0,ay=0,env=0.6;const st=Math.round(t0*sr),M=Math.round(Lc*2.6),amp=j===3?1.15:j===0?0.9:0.8,F=Math.round(sr*0.002);
    for(let n=0;n<M;n++){const a=line[idx],b=line[idx+1<D?idx+1:0];let y=rho*0.5*(a+b);env=Math.max(Math.abs(a),env*0.99985);const th=0.5*env;if(y>th)y=th-(y-th)*0.5;
      const ap=C*y+ax-C*ay;ax=y;ay=ap;line[idx]=ap;idx=idx+1<D?idx+1:0;out[(st+n)%Lc]+=a*amp*(n<F?0.5-0.5*Math.cos(Math.PI*n/F):1)}});
  SL.hp1(out,sr,55);SL.hp1(out,sr,55);SL.biq(out,sr,'peak',2300,1,2.5);SL.biq(out,sr,'lp',6200,0.7);SL.biq(out,sr,'lp',7500,0.7);
  let e=0;for(let n=0;n<Lc;n++)e+=out[n]*out[n];const g=0.2/Math.sqrt(e/Lc||1);for(let n=0;n<Lc;n++)out[n]*=g;
  const b=new AudioBuffer({length:Lc,sampleRate:sr,numberOfChannels:1});b.getChannelData(0).set(out);return{b,f:mtof(sa)}};
const SYN={
  /* the loop sets and where their base notes sit (each plays up to half the spacing either way) */
  LS:{ssA:{k:'ss',det:0.6,mix:0.75,wd:0.85,lp:8000,fmax:12500,bs:[45,51,57,63,69,75,81,87]},ssB:{k:'ss',det:0.42,mix:0.62,wd:0.75,lp:6500,fmax:11500,bs:[45,51,57,63,69,75,81,87]},
    warm:{k:'warm',bs:[44,48,52,56,60,64,68,72,76]},choir:{k:'choir',bs:[44,48,52,56,60,64,68,72,76]},gz:{k:'ks',bs:[50,53,56,59,62,65,68,71,74,77,80,83,86]}},
  /* the instruments. e: 0 analog, 1 FM, 2 acid, 3 modal (worklet), loop, ks, drone; role picks the default bus;
     r: the playing range (also put in TREG); poly 0 = mono; w: the worklet patch; fb: what plays without it */
  P:{
    anthem:{e:'loop',set:'ssA',role:'lead',r:[60,86],a:0.006,d:0.5,s:0.9,r2:0.22,lp:6200,q:0.6,g:0.2112,rev:0.35,dly:0.28,gl:0.045,fb:'hsaw'},
    eurobrass:{e:'loop',set:'ssB',role:'lead',r:[58,84],a:0.008,d:0.35,s:0.85,r2:0.14,fe:[700,4200,2300,0.025,0.3],q:1.1,pe:-25,pt:0.035,g:0.2253,rev:0.25,dly:0.3,fb:'eurolead'},
    hardcore:{e:'loop',set:'ssA',role:'lead',r:[60,88],a:0.003,d:0.3,s:0.9,r2:0.1,lp:6500,q:0.5,oct:0.32,g:0.2221,rev:0.3,dly:0.25,fb:'hsaw'},
    sawpluck:{e:'loop',set:'ssA',role:'lead',r:[57,84],a:0.002,d:0.24,s:0,r2:0.08,fe:[5200,5200,650,0.001,0.27],q:1.5,g:0.5675,rev:0.3,dly:0.35,fb:'pluck'},
    sawpad:{e:'loop',set:'ssB',role:'pad',r:[45,79],a:0.45,d:1,s:1,r2:0.9,lp:2600,q:0.5,g:0.0873,rev:0.5,fb:'pad'},
    warmpad:{e:'loop',set:'warm',role:'pad',r:[43,78],a:0.5,d:1,s:1,r2:1,g:0.09125,rev:0.5,fb:'pad'},
    choirpad:{e:'loop',set:'choir',role:'pad',r:[43,78],a:0.7,d:1,s:1,r2:1.2,g:0.0912,rev:0.55,fb:'pad'},
    guzheng:{e:'ks',set:'gz',role:'lead',r:[55,86],ring:0.9,g:0.3399,rev:0.35,dly:0.15,fb:'pluck'},
    tanpura:{e:'drone',role:'drone',r:[36,59],g:0.163,rev:0.3,fb:'drone'},
    smooth:{e:0,role:'lead',r:[57,86],rev:0.3,dly:0.3,fb:'glide',w:{e:0,n:3,w:0,dt:9,mix:0.8,dr:1.5,fc:1150,kt:0.6,k:1.3,fe:0.9,fd:0.35,fsu:0.35,dv:1.4,a:0.012,d:0.6,s:0.85,r:0.14,vd:11,vr:5.3,vdl:0.28,vdf:0.4,gl:0.07,hp:120,lp:9000,out:0.09597,vsn:0.35}},
    tb303:{e:2,role:'bass',r:[31,67],rev:0.12,dly:0.2,fb:'acidl',w:{e:2,w:0,fc:300,res:0.7,em:3.6,dc:0.42,dca:0.2,am:1.4,av:0.45,fh:110,dv:1.6,a:0.002,d:1.2,s:0.75,r:0.012,gl:0.065,hp:30,lp:14000,out:0.1436,vsn:0.25}},
    tb303sq:{e:2,role:'bass',r:[31,67],rev:0.12,dly:0.2,fb:'acidl',w:{e:2,w:1,pw:0.46,fc:280,res:0.665,em:3.4,dc:0.42,dca:0.2,am:1.4,av:0.45,fh:110,dv:1.4,a:0.002,d:1.2,s:0.75,r:0.012,gl:0.065,hp:30,lp:12000,out:0.1028,vsn:0.25}},
    reese7:{e:0,role:'bass',r:[24,52],mv:0.3,sync:0.25,fb:'bass',w:{e:0,n:7,w:0,dt:24,mix:0.85,dr:5,fc:520,kt:0.35,k:1.1,fe:0.6,fd:0.4,fsu:0.4,fl:0.45,dv:1.8,sub:0.55,so:2,sh:110,lp:12000,a:0.006,d:1,s:1,r:0.08,gl:0.05,out:0.1611,vsn:0.2}},
    growlbass:{e:0,role:'bass',r:[24,52],mv:0.5,sync:0.5,fb:'bass',w:{e:0,n:3,w:0,dt:12,mix:0.9,dr:2,fc:900,kt:0.3,k:1.4,fe:0.5,fd:0.25,fsu:0.5,dv:2.6,F:[[420,6,1],[820,7,0.7],[2400,8,0.25]],G:[[350,6,1],[680,7,0.7],[2300,8,0.2]],Fd:1,fdry:0.35,sub:0.6,so:2,sh:110,lp:9000,a:0.005,d:1,s:1,r:0.08,gl:0.05,out:0.1871,vsn:0.2}},
    talkbass:{e:1,role:'bass',r:[28,55],fb:'bass',w:{e:1,al:5,r:[1,1,3,1],dt:[0,0,0,0],lv:[1,3,1.4,0.5],vs:[0.3,0.7,0.6,0],a:[0.001,0.001,0.001,0.002],d:[0.35,0.11,0.18,0.3],s:[0.35,0.15,0,0],rl:[0.05,0.05,0.05,0.05],ks:[0,-2,-2,0],fb:0,hp:25,lp:6000,gl:0.04,out:0.1649,vsn:0.3}},
    fmgrowl:{e:1,role:'bass',r:[24,50],mv:0.5,sync:0.5,fb:'bass',w:{e:1,al:2,r:[1,1,2,3],dt:[0,0,0,0],lv:[1,2.2,1.4,0.8],vs:[0.2,0.4,0.4,0.3],a:[0.003,0.003,0.004,0.004],d:[0.6,0.5,0.6,0.5],s:[0.85,0.8,0.7,0.6],rl:[0.06,0.06,0.06,0.06],ks:[0,-2,-2,-2],fb:0.8,ld:0.4,lo:1,sub:0.5,so:1,hp:25,lp:7000,gl:0.05,out:0.1668,vsn:0.2}},
    rhodes:{e:1,role:'keys',r:[48,84],poly:8,rev:0.3,dly:0.15,fb:'fmpiano',w:{e:1,al:1,r:[1,1,1,14],dt:[0,0,6,0],lv:[1,1.5,0.5,1.8],vs:[0.5,0.85,0.5,1],a:[0.001,0.001,0.001,0.0005],d:[2.6,1.4,1.8,0.14],s:[0,0.1,0,0],rl:[0.35,0.3,0.35,0.1],ks:[-1,-1.5,-1,-4],fb:0,hp:40,lp:9000,out:0.0728,vsn:0.6}},
    fmbell:{e:1,role:'keys',r:[60,96],poly:8,rev:0.45,dly:0.25,fb:'bell',w:{e:1,al:1,r:[1,3.5,2,5.19],dt:[0,0,4,0],lv:[1,2.4,0.35,1.2],vs:[0.4,0.8,0.4,0.8],a:[0.001,0.001,0.001,0.001],d:[3.5,2.5,1.2,0.6],s:[0,0,0,0],rl:[0.8,0.8,0.6,0.5],ks:[-1,-2,-1,-3],fb:0,hp:60,lp:10000,out:0.05397,vsn:0.5}},
    fmbrass:{e:1,role:'lead',r:[50,79],poly:6,rev:0.25,dly:0.2,fb:'brass',w:{e:1,al:1,r:[1,1,1,1],dt:[0,0,7,0],lv:[1,2.6,0.7,2.2],vs:[0.4,0.6,0.4,0.6],a:[0.012,0.04,0.014,0.05],d:[0.4,0.3,0.4,0.3],s:[0.8,0.75,0.8,0.7],rl:[0.12,0.12,0.12,0.12],ks:[0,-2,0,-2],fb:0.8,pe:-30,pt:0.04,hp:60,lp:8000,out:0.09271,vsn:0.4}},
    fmstab:{e:1,role:'lead',r:[48,79],poly:6,rev:0.35,dly:0.25,fb:'techstab',w:{e:1,al:3,r:[1,2,3.17,1.41],dt:[0,-8,0,0],lv:[0.6,0.4,0.25,3.2],vs:[0.3,0.4,0.5,0.7],a:[0.001,0.001,0.001,0.001],d:[0.3,0.22,0.15,0.25],s:[0,0,0,0.05],rl:[0.06,0.06,0.06,0.06],ks:[0,-1,-2,-3],fb:0.6,hp:80,lp:9000,out:0.3,vsn:0.4}},
    erhu:{e:0,role:'lead',r:[62,88],rev:0.35,dly:0.2,fb:'soft',w:{e:0,n:1,w:0,mix:1,fc:5200,kt:0,k:1.4,F:[[900,3,1],[1700,4,0.7],[3100,5,0.45]],fdry:0.25,nz:0.12,nh:3,nq:0.8,dv:1.2,sh:300,hp:200,lp:7500,a:0.07,d:0.5,s:0.9,r:0.12,vd:28,vr:6,vdl:0.15,vdf:0.3,gl:0.11,lg:1,pe:-18,pt:0.05,bt:0.06,out:0.1265,vsn:0.4}},
    bansuri:{e:0,role:'lead',r:[60,88],rev:0.4,dly:0.2,fb:'soft',w:{e:0,n:1,w:3,h2:0.22,h3:0.07,mix:1,fc:3800,kt:0.3,k:1.6,nz:0.5,nh:1,nq:5,nb:0.035,ch:2.5,hp:180,lp:6500,a:0.05,d:0.4,s:0.92,r:0.16,vd:16,vr:5,vdl:0.3,vdf:0.4,gl:0.09,lg:1,pe:-22,pt:0.06,bt:0.07,out:0.08168,vsn:0.35}},
    hang:{e:3,role:'keys',r:[50,77],poly:8,rev:0.4,dly:0.15,fb:'bell',w:{e:3,m:[[1,1,3.2,0.22],[2,0.42,2.4,0.35],[3,0.2,1.5,0],[4.07,0.05,0.8,0]],st:0.005,lp:9000,hp:40,out:0.1194,vsn:0.5}}},
  B:{},busy:{},q:[],sets:[],nodes:new WeakMap(),r:rng(0x5e45),
  /* Every call takes the engine it plays for in opts.eng (default: music). Pregen's engine (Object.create(music)) has
     its own OfflineAudioContext, buses and sends; its voices are made on that context and never cross to another. */
  get(name,eng){const P=this.P[name];if(!P)return null;const M=eng||music;if(P.set&&!M.lite)this.prep([name],null,M);this.warm(name,M);const O=o=>Object.assign({eng:M},o||{});
    return{name,role:P.role,range:P.r,play:(t,m,d,v,o)=>this.play(name,t,m,d,v,O(o)),chord:(t,ms,d,v,o)=>this.chord(name,t,ms,d,v,O(o)),prep:k=>this.prep([name],k,M),ready:k=>this.ready(name,k,M)}},
  names(){return Object.keys(this.P)},
  /* Offline renders: a worklet only reads its messages while the render is paused (or before it starts), so after
     scheduling, await SYN.sync(eng) before startRendering() and before each resume(). Resolves when every voice of
     that engine's context has its notes (or after 250 ms). */
  sync(eng){const M=eng||music,C=M.out&&M.out.context,per=C&&this.nodes.get(C),ps=[];if(per)for(const a of per.values())for(const n of Object.values(a))ps.push(new Promise(res=>{const id=this.pid=(this.pid||0)+1,
      f=e=>{if(e.data&&e.data.pong===id){n.port.removeEventListener('message',f);res()}};n.port.addEventListener('message',f);n.port.start();n.port.postMessage({ping:id});setTimeout(res,250)}));return Promise.all(ps)},
  ready(name,key,eng){const P=this.P[name],M=eng||music;if(!P)return false;if(P.set)return this.LS[P.set].bs.every(b=>this.B[P.set+':'+b]);if(P.e==='drone')return key==null||!!this.B['tp:'+(((key%12)+12)%12)];return!!M.voicesOn},
  /* make an instrument's voice ahead of its first note (on its usual bus), so that note isn't late */
  warm(name,eng){const P=this.P[name],M=eng||music;if(P&&typeof P.e==='number'&&M.voicesOn&&M.bus&&M.out)this.node(name,P,this.dest(P,M),M)},
  /* render what these instruments need, a piece at a time between frames (the buffers serve every context); resolves
     when all are ready */
  prep(names,key,eng){const M=eng||music;for(const n of[].concat(names||[]))this.warm(n,M);if(M.lite)return Promise.resolve();const ps=[];for(const n of[].concat(names||[])){const P=this.P[n];if(!P)continue;
      if(P.set)for(const b of this.LS[P.set].bs)ps.push(this.job(P.set,b));if(P.e==='drone'&&key!=null)ps.push(this.job('tp',((key%12)+12)%12))}return Promise.all(ps)},
  job(set,b){const k=set+':'+b;if(this.B[k])return Promise.resolve(this.B[k]);if(this.busy[k])return this.busy[k];
    return this.busy[k]=new Promise(res=>{this.q.push(()=>{let x=null;try{x=set==='tp'?SL.tanpura(32000,b):set==='gz'?SL.guzheng(32000,b):SL.LOOP(set,b)}catch(e){}
      if(x){this.B[k]=x;this.keep(set)}delete this.busy[k];res(x)});this.pump()})},
  pump(){if(this.pumping)return;this.pumping=true;const step=()=>{const f=this.q.shift();if(!f){this.pumping=false;return}f();setTimeout(step,0)};setTimeout(step,0)},
  /* at most three loop sets (4 to 5 MB each) and two tanpura keys (0.7 MB each) stay in memory */
  keep(set){const g=set==='tp'?'tp':set;if(g==='tp'||g==='gz')return;this.sets=this.sets.filter(s=>s!==g);this.sets.push(g);
    while(this.sets.length>3){const o=this.sets.shift();for(const k of Object.keys(this.B))if(k.startsWith(o+':'))delete this.B[k]}
    const tp=Object.keys(this.B).filter(k=>k.startsWith('tp:'));while(tp.length>2)delete this.B[tp.shift()]},
  dest(P,M){const B=M.bus;return P.role==='bass'?B.bass:P.role==='pad'||P.role==='drone'?B.pad:P.role==='keys'?(M.xKeys?M.xKeys():B.keys):B.lead},
  /* one worklet node per context, destination and instrument, made when first needed on that context */
  node(name,P,dest,M){const c=M.out.context;if(!c||dest.context!==c)return null;let per=this.nodes.get(c);if(!per)this.nodes.set(c,per=new Map());let a=per.get(dest);if(!a)per.set(dest,a={});if(a[name])return a[name];
    let n;try{n=new AudioWorkletNode(c,'hl-syn',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{poly:P.poly||1,mono:!P.poly,seed:(name.length*7919+name.charCodeAt(0)*31)|0,patch:P.w}})}catch(e){return null}
    n.connect(dest);if(P.rev&&M.rev)M.send(n,M.rev,P.rev);if(P.dly&&M.dly)M.send(n,M.dly,P.dly);return a[name]=n},
  play(name,t,m,dur,vel=0.9,o={}){o=o||{};const P=this.P[name],M=o.eng||music;if(!P||!M.ctx||!M.out||!M.bus)return null;
    let dest=o.dest||this.dest(P,M);if(!dest||dest.context!==M.out.context)dest=this.dest(P,M); /* never across contexts */
    if(P.e==='loop')return this.loopNote(P,t,m,dur,vel,o,dest,M);if(P.e==='ks')return this.ksNote(P,t,m,dur,vel,o,dest,M);if(P.e==='drone')return this.drone(P,t,m,dur,vel,o,dest,M);
    const N=M.voicesOn&&this.node(name,P,dest,M);if(!N)return this.fall(P,t,m,dur,vel,o,dest,M);
    const rx=o.rx>1?0.38:o.rx?0.26:0;
    N.port.postMessage({t,d:dur,f:mtof(m),v:Math.max(0.05,Math.min(1.2,vel)),sl:o.slide?1:0,ac:o.accent?+o.accent:0,gl:o.glide,bd:o.bend||0,vs:o.vib!=null?o.vib:1,mv:o.move!=null?o.move:P.mv!=null?P.mv:1,
      cm:(o.cut?Math.log2(o.cut):0)+rx,pan:o.pan||0,lr:P.sync?M.bpm/240*P.sync:0,res:o.res});return null},
  chord(name,t,ms,dur,vel,o){const out=[];for(const m of ms)out.push(this.play(name,t,m,dur,vel/Math.sqrt(Math.max(1,ms.length/2)),o));return out},
  /* an amp envelope on a gain: attack, decay to sustain, release; the value is carried exactly across each change
     (no jumps), and the time the note is silent is returned */
  env(g,t,dur,a,d,s,r,pk){a=Math.max(0.002,a);r=Math.max(0.012,r);g.setValueAtTime(0,t);const ta=t+a,te=t+Math.max(dur,0.004);let v;
    if(te<=ta){g.linearRampToValueAtTime(v=pk*(te-t)/a,te)}else{g.linearRampToValueAtTime(pk,ta);if(s<1){const tau=Math.max(0.005,d/3);g.setTargetAtTime(pk*s,ta,tau);v=pk*s+(pk-pk*s)*Math.exp(-(te-ta)/tau)}else v=pk;g.setValueAtTime(v,te)}
    g.setTargetAtTime(0,te,r/4);g.setValueAtTime(v*Math.exp(-4),te+r);g.linearRampToValueAtTime(0,te+r+0.02);return te+r+0.02},
  near(set,m){let k=null,bd=99;for(const b of this.LS[set].bs){const d=Math.abs(b-m);if(d<bd){bd=d;k=b}}return k},
  loopNote(P,t,m,dur,vel,o,dest,M){const c=M.ctx,k=this.near(P.set,m),B=!M.lite&&this.B[P.set+':'+k];if(!B){if(!M.lite)this.prep([this.nameOf(P)],null,M);return this.fall(P,t,m,dur,vel,o,dest,M)}
    const g=c.createGain(),srcs=[],gl=o.glide||P.gl||0.05;let flt=null,head=g;
    if(P.lp||P.fe){flt=c.createBiquadFilter();flt.type='lowpass';flt.Q.value=P.q||0.7;if(M.kr){try{flt.frequency.automationRate='k-rate';flt.Q.automationRate='k-rate'}catch(e){}}
      const cm=(o.cut||1)*(0.75+0.25*vel);if(P.fe){const[f0,f1,f2,ta,td]=P.fe;flt.frequency.setValueAtTime(f0*cm,t);flt.frequency.linearRampToValueAtTime(f1*cm,t+ta);flt.frequency.setTargetAtTime(f2*cm,t+ta,td/3)}else flt.frequency.value=P.lp*cm;flt.connect(g);head=flt}
    const mk=(mm,lv)=>{const kk=this.near(P.set,mm),BB=this.B[P.set+':'+kk]||B,s=c.createBufferSource(),sg=c.createGain(),rt=mtof(mm)/BB.f;s.buffer=BB.b;s.loop=true;sg.gain.value=lv;
      let r0=rt;if(o.slide&&o.from!=null)r0=mtof(o.from+(mm-m))/BB.f;else if(o.bend)r0=rt*Math.pow(2,o.bend/12);else if(P.pe)r0=rt*Math.pow(2,P.pe/1200);
      if(r0!==rt){s.playbackRate.setValueAtTime(r0,t);s.playbackRate.exponentialRampToValueAtTime(rt,t+(o.slide||o.bend?gl:P.pt||0.03))}else s.playbackRate.value=rt;s.connect(sg);sg.connect(head);srcs.push(s);
      s.start(t,this.r()*BB.b.duration)};
    mk(m,1);if(P.oct)mk(m+12,P.oct);g.connect(dest);if(P.rev&&M.rev)M.send(g,M.rev,o.rev!=null?o.rev:P.rev);if(P.dly&&M.dly)M.send(g,M.dly,o.dly!=null?o.dly:P.dly);
    const te=this.env(g.gain,t,dur,P.a,P.d,P.s,P.r2,P.g*vel);for(const s of srcs)s.stop(te+0.01);srcs[0].onended=()=>{try{g.disconnect();if(flt)flt.disconnect()}catch(e){}};return g},
  ksNote(P,t,m,dur,vel,o,dest,M){const c=M.ctx,k=this.near(P.set,m),B=!M.lite&&this.B[P.set+':'+k];if(!B){if(!M.lite)this.prep([this.nameOf(P)],null,M);return this.fall(P,t,m,dur,vel,o,dest,M)}
    const s=c.createBufferSource(),g=c.createGain(),rt=mtof(m)/B.f,pr=s.playbackRate;s.buffer=B.b;
    if(o.bend){pr.setValueAtTime(rt*Math.pow(2,o.bend/12),t);pr.setTargetAtTime(rt,t+0.02,0.04)}else pr.setValueAtTime(rt,t);
    if(o.press){const tp=t+Math.min(0.25,Math.max(0.08,dur*0.4));pr.setValueAtTime(rt,tp);pr.linearRampToValueAtTime(rt*Math.pow(2,o.press/12),tp+0.12)}
    let lf=null;if(o.vib&&dur>0.3){lf=c.createOscillator();const lg=c.createGain();lf.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(18*o.vib,t+Math.min(dur,0.6));lf.connect(lg);lg.connect(s.detune);lf.start(t);lf.stop(t+dur+P.ring)}
    const end=Math.min(B.b.duration/rt,dur+P.ring),pk=P.g*vel;g.gain.setValueAtTime(pk,t);g.gain.setValueAtTime(pk,t+end);g.gain.linearRampToValueAtTime(0,t+end+0.15);
    s.connect(g);g.connect(dest);if(P.rev&&M.rev)M.send(g,M.rev,P.rev);if(P.dly&&M.dly)M.send(g,M.dly,P.dly);s.start(t);s.stop(t+end+0.16);s.onended=()=>{try{g.disconnect()}catch(e){}};return g},
  /* the tanpura's cycle in the key of midi (its pitch class: the drone sits at Sa = C3 to B3, played at the rate it
     was rendered, as a real tanpura has one register), held for dur with soft ends */
  drone(P,t,m,dur,vel,o,dest,M){const c=M.ctx,pc=((Math.round(m)%12)+12)%12,B=!M.lite&&this.B['tp:'+pc];
    if(!B){if(!M.lite)this.job('tp',pc);const r0=36+pc;for(const q of[r0,r0+7,r0+12])M.saw(q,t,dur,{tag:'drone',voices:2,spread:6,cut:900,vol:0.02*vel,a:0.8,rel:1,rev:0.5,dest});return null}
    const s=c.createBufferSource(),g=c.createGain();s.buffer=B.b;s.loop=true;
    const pk=P.g*vel,fi=Math.min(0.6,dur/4);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+fi);g.gain.setValueAtTime(pk,t+Math.max(fi,dur-1.2));g.gain.linearRampToValueAtTime(0,t+dur);
    s.connect(g);g.connect(dest);if(P.rev&&M.rev)M.send(g,M.rev,P.rev);s.start(t,o.offset||0);s.stop(t+dur+0.02);s.onended=()=>{try{g.disconnect()}catch(e){}};return g},
  nameOf(P){for(const k in this.P)if(this.P[k]===P)return k;return''},
  /* without the worklet or before a set is rendered: the nearest older voice, on the same engine */
  fall(P,t,m,dur,vel,o,dest,M){
    if(P.fb==='pad')return M.saw(m,t,dur,{tag:'pad',vol:0.03*vel,voices:3,spread:14,cut:1600,a:P.a||0.4,rel:0.8,rev:0.45,dest});
    if(P.fb==='bass')return M.saw(m,t,dur,{tag:'bass',voices:2,spread:12,cut:600,env:900,envT:0.2,res:1.5,vol:0.075*vel,sub:0.08,a:0.004,rel:0.04,dest});
    if(P.fb==='acidl'&&P.role==='bass')return M.saw(m,t,Math.min(dur,0.25),{tag:'bass',voices:1,cut:380,env:4200,envT:0.11,q:9,a:0.002,rel:0.03,vol:0.09*vel,dest});
    return M.tSyn(P.fb,m,t,dur,vel,dest)}};
/* the instruments' ranges for tPitch, and bass patches for the bassline families (bassNote plays syn:) */
for(const[k,P]of Object.entries(SYN.P))if(!TREG[k])TREG[k]=P.r;
Object.assign(TBP,{tb303:b=>({syn:'tb303',o:12,len:0.85,vol:1}),tb303sq:b=>({syn:'tb303sq',o:12,len:0.85,vol:1}),reese7:b=>({syn:'reese7',o:0,len:0.95,vol:1}),growlbass:b=>({syn:'growlbass',o:0,len:0.92,vol:1}),
  talkbass:b=>({syn:'talkbass',o:0,len:0.6,vol:1}),fmgrowl:b=>({syn:'fmgrowl',o:0,len:0.92,vol:1})});
