//# music/022-melodies.js: melodies with intent: a phrase and its answer on chord tones (Prototype 46)
/* ---- melodies with intent (Prototype 46) ----
   Eric: "notes at random" (sitar, sax, bansuri, erhu, xylophone, some piano and pluck lines), and of Chrome Choir: the
   piano "feels a bit random but then it starts to feel cohesive" once it repeats. So a line is a motif repeated: one
   rhythm (a bar, kept in the second bar, which lands on a long note), chord tones on the strong beats (1 and 3), steps
   between them, at most one leap of a third and a step back after it. The phrase states it and answers it: A A' over
   four bars (A' is A moved onto the next chords, ending on the tonic), A A' A A'' over eight. */
const TMR={sparse:[[0,6,8],[0,4,8,12],[0,3,8,12],[0,6,8,12],[0,8,12]],med:[[0,3,6,8,12],[0,2,4,8,12],[0,4,6,8,12],[0,3,6,10,12],[0,2,6,8,12],[0,4,8,10,12]],
  busy:[[0,2,4,6,8,10,12],[0,3,6,8,10,12,14],[0,2,4,8,10,12,14],[0,3,6,8,11,12,14]]};
/* the scale degree (octaves counted) nearest to p semitones above the tonic */
const toDeg=(sc,p)=>{const n=sc.length;let best=0,bd=99;for(let d=-3*n;d<=4*n;d++){const x=Math.abs(degP(sc,d)-p);if(x<bd){bd=x;best=d}}return best};
/* the tone of T (pitch classes) nearest to p; a tie goes the way the line is moving */
const tNearD=(p,T,dir)=>{let q=p,bd=99;for(const t of T)for(const o of[-24,-12,0,12,24]){const x=t+o,d=Math.abs(x-p)+(dir&&x!==p&&Math.sign(x-p)!==dir?0.25:0);if(d<bd){bd=d;q=x}}return q};
function tMotifHook(r,o){const{sc,tn,bars}=o,pick=a=>a[Math.floor(r()*a.length)],ev=[];
  const cell=pick(TMR[o.dens||pick(['sparse','med','med','busy'])]),lastAt=r()<0.6?8:12,cell2=cell.filter(x=>x<lastAt).concat([lastAt]);
  /* the motif over the first two chords: [bar, step, pitch] */
  const M=[];let dir=r()<0.5?1:-1,cur=tNearD(degP(sc,pick([2,4])),tn(0,0),0),leap=0,used=false;const c0=cur;
  [cell,cell2].forEach((C,bar)=>{if(bar===1)dir=-dir;C.forEach((st,i)=>{let p=cur;
      if(bar||i){if(st%8===0)p=tNearD(cur+dir,tn(bar,st),dir);
        else{let d=toDeg(sc,cur);if(leap){d-=Math.sign(leap);leap=0}else if(!used&&r()<0.18){d+=2*dir;leap=2*dir;used=true}else d+=r()<0.82?dir:0;p=degP(sc,d)}}
      if(p>c0+9){p=degP(sc,toDeg(sc,p)-2);dir=-1}if(p<c0-8){p=degP(sc,toDeg(sc,p)+2);dir=1}
      if(bar===1&&i===C.length-1)p=tNearD(p,tn(1,st),0);M.push([bar,st,p]);cur=p})});
  /* a statement moved onto other chords: shifted along the scale so its first note is the nearest chord tone, its strong
     beats fitted again; the end lands on the tonic (home) or on a tone of the last chord (a question) */
  const put=(b0,home)=>{const d0=toDeg(sc,M[0][2]),k=toDeg(sc,tNearD(M[0][2],tn(b0,0),0))-d0;
    M.forEach(([bar,st,p],i)=>{let q=b0===0?p:degP(sc,toDeg(sc,p)+k);const b=b0+bar;if(b0&&st%8===0)q=tNearD(q,tn(b,st),0);
      const last=i===M.length-1;if(last&&home!=null)q=tNearD(q,home?[0]:tn(b,st).filter(x=>x!==0).length?tn(b,st).filter(x=>x!==0):tn(b,st),0);
      const nx=i+1<M.length?(M[i+1][0]*16+M[i+1][1]):32,d=last?Math.max(4,16-st):Math.max(1,nx-(bar*16+st));ev.push({s:b*16+st,d:Math.min(d,last?8:d),p:q,b})})};
  if(bars>=8){put(0,null);put(2,false);put(4,null);put(6,true)}else{put(0,null);put(2,true)}
  return ev.sort((a,b)=>a.s-b.s)}
/* a one-bar riff (and its answer bar, B): one rhythm, a shape over the scale from the chord's root (the player moves it
   with the chords), chord tones on 1 and 3, short notes. Shapes: a pedal on the root with neighbours (Eric's first sung
   example: one note pulsed, moving with the chords), a climb to the fifth and back, a broken chord (his second), a call */
function tMotifRiff(r,o){const{sc}=o,pick=a=>a[Math.floor(r()*a.length)],L=sc.length,ct=L===7?[0,2,4,7]:[0,1,3,5];
  const RR=[[0,3,6,8,11,14],[0,2,3,6,8,10,11,14],[0,3,4,7,8,11,12,14],[0,2,4,6,8,10,12,14],[0,3,6,9,12,14],[0,4,6,8,12,14],[0,3,6,8,10,12]];
  const S7={pedal:[0,0,1,0,0,-1,0,1],climb:[0,1,2,4,2,1,0,1],arp:[0,2,4,7,4,2,0,2],call:[0,0,2,0,4,2,1,0]},S5={pedal:[0,0,1,0,0,-1,0,1],climb:[0,1,2,3,2,1,0,1],arp:[0,1,3,5,3,1,0,1],call:[0,0,1,0,3,1,0,0]};
  const S=L===7?S7:S5,shp=S[o.shape||pick(Object.keys(S))],cell=pick(RR);
  const A=cell.map((s,i)=>{let d=shp[i%shp.length];if(s%8===0)d=ct.reduce((a,x)=>Math.abs(x-d)<Math.abs(a-d)?x:a,0);const nx=i+1<cell.length?cell[i+1]:16;return{s,d:Math.max(1,Math.min(nx-s,2)),p:degP(sc,d),dg:d}});
  const B=A.map((e,i)=>{if(i===A.length-1){const dg=pick([ct[2],ct[3]]);return{...e,p:degP(sc,dg),dg}}if(i===A.length-2&&A.length>3){const dg=pick([ct[1],ct[2]-1]);return{...e,p:degP(sc,dg),dg}}return e});
  /* dg: the scale degree above the chord's root; the player moves the riff along the scale with the chords (fol), so a
     chord's triad stays a triad (moving it by semitones and snapping turned thirds into suspensions) */
  return{A,B,n:16,dg:true}}
/* the break: four bars rendered once per tempo from the kit's own hits (round robins where there are several), with a
   little room and grit */
SL.brkRender=async(kit,id,bpm)=>{const P=TBRK[id];if(!P||!kit)return null;const sr=44100,sd=60/bpm/4,len=Math.ceil(sr*(64*sd+0.6)),oc=new OfflineAudioContext(1,len,sr),r=rng(id.length*977+Math.round(bpm));
  const bus=oc.createGain(),ws=oc.createWaveShaper(),hp=oc.createBiquadFilter(),lp=oc.createBiquadFilter();ws.curve=SL.curve(1.3);hp.type='highpass';hp.frequency.value=35;lp.type='lowpass';lp.frequency.value=9000;
  bus.connect(ws);ws.connect(hp);hp.connect(lp);lp.connect(oc.destination);const cv=oc.createConvolver();cv.buffer=SL.ir(oc,0.45,0.55,true);const cg=oc.createGain();cg.gain.value=0.16;bus.connect(cv);cv.connect(cg);cg.connect(lp);
  const L=x=>Array.isArray(x)?x.filter(Boolean):x?[x]:[],RR={};const pickB=(k,a)=>{const l=L(a);if(!l.length)return null;let i=Math.floor(r()*l.length);if(l.length>1&&i===RR[k])i=(i+1)%l.length;RR[k]=i;return l[i]};
  const pv=c=>c==='.'?0:c==='X'?1:(+c)/10,hit=(b,t,v,rt)=>{if(!b)return;const s=oc.createBufferSource(),g=oc.createGain();s.buffer=b;s.playbackRate.value=rt||1+(r()-0.5)*0.02;g.gain.value=v*(0.92+0.16*r());s.connect(g);g.connect(bus);s.start(Math.max(0,t+(r()-0.5)*0.005))};
  for(let bar=0;bar<4;bar++)for(let i=0;i<16;i++){const t=(bar*16+i)*sd+(i%2?sd*0.04:0);
    const k=pv(P.K[bar][i]),s=pv(P.S[bar][i]),h=pv(P.H[bar][i]),o=pv(P.O[bar][i]);
    if(k)hit(pickB('k',kit.kd),t,0.9*k);if(s)hit(s<0.75?pickB('g',kit.s2||kit.s1):pickB('s',kit.s1),t,s<0.75?0.75*s:0.95*s);if(h)hit(pickB('h',i%4===0?kit.h1:kit.h2),t,0.55*h);if(o)hit(pickB('o',kit.ho),t,0.5*o)}
  const b=await oc.startRendering(),x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));const g=0.9/(pk||1);for(let i=0;i<x.length;i++)x[i]*=g;
  const rb=new AudioBuffer({length:b.length,sampleRate:sr,numberOfChannels:1}),y=rb.getChannelData(0),N=Math.round(64*sd*sr);for(let i=0;i<N;i++)y[i]=x[N-1-i];return{b,rb,sd}};
/* recordings that were too sharp or too bright, tamed once when they decode (for every tune, old codes too): the hat
   that hissed through the trance templates, the electro and tape kits' high end, the club and gas kits' brightest
   hats, the concert crash and the splash, the glass and bowed-vibraphone pads; [low-pass Hz, length s] */
const TAME={x_hat_raw:[8500],x_hat_yosh:[8500],x_hat_gem:[7000],x_hat_snap:[7500],x_hat_sci:[6500],x_hat_zap:[6500],x_hat_psych:[6500,0.15],x_elec_filt_snare:[6000],
  x_cc_cr:[5200],x_ride_via:[6000],x_ps_72:[3200],x_ps_84:[3200],s_sp:[4500],x_drum_splash_soft:[5000],x_ambi_glass_rub:[2400],x_pd_wg1:[2200],x_pd_bv4:[2400],x_pd_bv3:[2400],x_elec_cymbal:[6000]};
SL.tame=(k,v)=>{const T=TAME[k],b=v&&v[k];if(!T||!b||b.tamed)return;try{const sr=b.sampleRate,x=b.getChannelData(0).slice(),n=T[1]?Math.min(x.length,Math.round(sr*T[1])):x.length;
  SL.biq(x,sr,'lp',T[0],0.7);SL.biq(x,sr,'lp',T[0]*1.3,0.6);const fo=Math.min(n,Math.round(sr*0.04));for(let i=0;i<fo;i++)x[n-1-i]*=i/fo;
  const nb=new AudioBuffer({length:n,sampleRate:sr,numberOfChannels:1});nb.getChannelData(0).set(x.subarray(0,n));nb.tamed=1;v[k]=nb}catch(e){}};
