//# music/017-sound-lab.js: the sound lab: drum and instrument sounds rendered once, plus the recordings built into the page (SL.SMP, SL.EXT, SL.VOX, SL.SFX in assets/)
/* ---------- the sound lab: rendered once, played many times ----------
   Drums and metal guitars are synthesised when the game loads (offline, faster than real time) and then played back as
   samples: far less work per hit than building each one live, so each can be much more detailed. Basses and the acid
   lead each run on one small custom synth voice (an AudioWorklet): analog-style saws, a ladder filter that saturates as
   it resonates, glide and drive. Anything not ready yet, or not supported by the browser, falls back to the live synth. */
const SL={};
SL.curve=(k,n=2048,bias=0)=>{const a=new Float32Array(n),nb=Math.tanh(bias),nk=Math.tanh(k+bias)-nb;for(let i=0;i<n;i++){const x=i/(n-1)*2-1;a[i]=(Math.tanh(k*x+bias)-nb)/nk}return a};
SL.noise=(oc,len,seed)=>{const r=rng(seed||7),b=oc.createBuffer(1,Math.max(1,Math.ceil(oc.sampleRate*len)),oc.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=r()*2-1;const s=oc.createBufferSource();s.buffer=b;return s};
/* Reverb impulse: a few early reflections, then noise whose brightness falls away as it decays (darker tail), different
   on each side; scaled to the same energy as a plain noise tail so send levels keep their meaning. */
SL.ir=(c,len,bright=0.55,early=true)=>{const sr=c.sampleRate,n=Math.floor(sr*len),b=c.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch),r=rng(91+ch*7);let lp=0,e=0,eRef=0;
    for(let i=0;i<n;i++){const t=i/n,k=0.03+bright*(1-t)*(1-t);lp+=((r()*2-1)-lp)*k;const env=Math.pow(1-t,2.8);d[i]=lp*env;e+=d[i]*d[i];eRef+=env*env/3}
    const g=Math.sqrt(eRef/Math.max(1e-9,e));for(let i=0;i<n;i++)d[i]*=g;
    if(early)for(const[ms,a]of[[7,0.5],[13,0.36],[19,0.3],[29,0.22],[37,0.18],[53,0.12]]){const j=Math.floor(sr*(ms+(ch?2.3:0))/1000);if(j<n)d[j]+=a*(ch?-1:1)}}
  return b};
/* Drum voices, each a small offline patch. Kicks: a pitch-dropping sine through 4x-oversampled saturation (so phone
   speakers, which cannot play 50 Hz, still hear the kick's harmonics) and a beater click. */
SL.kick=o=>oc=>{const T=0.002,os=oc.createOscillator(),g=oc.createGain(),sh=oc.createWaveShaper();
  os.frequency.setValueAtTime(o.f0,T);os.frequency.exponentialRampToValueAtTime(o.f1,T+o.t1);os.frequency.exponentialRampToValueAtTime(o.f2,T+o.dec);
  g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.0015);g.gain.setTargetAtTime(0,T+o.hold,o.dec/3.5);
  sh.curve=SL.curve(o.sat);sh.oversample='4x';os.connect(g);g.connect(sh);sh.connect(oc.destination);os.start(0);os.stop(o.len);
  const n=SL.noise(oc,0.03,11),hp=oc.createBiquadFilter(),ng=oc.createGain();hp.type='highpass';hp.frequency.value=2800;ng.gain.setValueAtTime(o.click,T);ng.gain.exponentialRampToValueAtTime(0.0001,T+0.012);n.connect(hp);hp.connect(ng);ng.connect(oc.destination);n.start(T);
  const b=oc.createOscillator(),bg=oc.createGain();b.frequency.value=1400;bg.gain.setValueAtTime(o.click*0.6,T);bg.gain.exponentialRampToValueAtTime(0.0001,T+0.008);b.connect(bg);bg.connect(oc.destination);b.start(T);b.stop(T+0.02)};
/* Snares: two pitched shell modes, bright noise with a presence lift, a separate crack, light saturation and a small room. */
SL.snare=o=>oc=>{const T=0.002,mix=oc.createGain(),sh=oc.createWaveShaper();sh.curve=SL.curve(1.4);mix.connect(sh);sh.connect(oc.destination);
  for(const[f,a,d]of[[o.body,0.55,0.09],[o.body*1.68,0.28,0.06]]){const os=oc.createOscillator(),g=oc.createGain();os.type='triangle';os.frequency.setValueAtTime(f*1.25,T);os.frequency.exponentialRampToValueAtTime(f,T+0.03);g.gain.setValueAtTime(a,T);g.gain.exponentialRampToValueAtTime(0.0001,T+d*2.5);os.connect(g);g.connect(mix);os.start(T);os.stop(T+0.4)}
  const n=SL.noise(oc,o.len,o.seed),h=oc.createBiquadFilter(),pk=oc.createBiquadFilter(),ng=oc.createGain();h.type='highpass';h.frequency.value=o.hp;pk.type='peaking';pk.frequency.value=5000;pk.gain.value=o.bright;pk.Q.value=0.9;
  ng.gain.setValueAtTime(0.7,T);ng.gain.setTargetAtTime(0,T+0.01,o.dec/3);n.connect(h);h.connect(pk);pk.connect(ng);ng.connect(mix);n.start(T);
  const s2=SL.noise(oc,0.05,o.seed+5),bp=oc.createBiquadFilter(),sg=oc.createGain();bp.type='bandpass';bp.frequency.value=3600;bp.Q.value=1.2;sg.gain.setValueAtTime(o.crack,T);sg.gain.exponentialRampToValueAtTime(0.0001,T+0.018);s2.connect(bp);bp.connect(sg);sg.connect(mix);s2.start(T);
  if(o.room){const cv=oc.createConvolver();cv.buffer=SL.ir(oc,0.3,0.6,true);const rg=oc.createGain();rg.gain.value=o.room;mix.connect(cv);cv.connect(rg);rg.connect(oc.destination)}};
SL.clap=o=>oc=>{const T=0.002,bp=oc.createBiquadFilter(),g=oc.createGain();bp.type='bandpass';bp.frequency.value=1250;bp.Q.value=1.1;bp.connect(oc.destination);
  const n=SL.noise(oc,o.len,o.seed);n.connect(g);g.connect(bp);g.gain.setValueAtTime(0,0);
  for(const d of[0,0.009,0.019,0.03]){g.gain.setValueAtTime(1,T+d);g.gain.exponentialRampToValueAtTime(0.05,T+d+0.008)}g.gain.setValueAtTime(0.9,T+0.04);g.gain.setTargetAtTime(0,T+0.045,0.06);n.start(0);
  const cv=oc.createConvolver();cv.buffer=SL.ir(oc,0.4,0.5,true);const rg=oc.createGain();rg.gain.value=0.35;bp.connect(cv);cv.connect(rg);rg.connect(oc.destination)};
/* Hats and cymbals: six detuned square waves at inharmonic ratios (the 808 recipe) plus a little noise, band-passed. */
SL.metal=o=>oc=>{const T=0.002,mix=oc.createGain(),bp=oc.createBiquadFilter(),hp=oc.createBiquadFilter(),g=oc.createGain();bp.type='bandpass';bp.frequency.value=o.bp;bp.Q.value=0.7;hp.type='highpass';hp.frequency.value=o.hp;
  for(const f of[205.3,304.4,369.6,522.7,540,800]){const os=oc.createOscillator();os.type='square';os.frequency.value=f*o.m;os.connect(mix);os.start(0);os.stop(o.len)}
  mix.gain.value=0.25;const n=SL.noise(oc,o.len,o.seed),ng=oc.createGain();ng.gain.value=o.nz;n.connect(ng);ng.connect(bp);n.start(0);
  mix.connect(bp);bp.connect(hp);hp.connect(g);g.connect(oc.destination);g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.001);g.gain.setTargetAtTime(0,T+0.002,o.dec/4)};
/* Toms and the impact's sub boom, for when the samples are missing (and as layers under them). */
SL.tom=o=>oc=>{const T=0.002,os=oc.createOscillator(),g=oc.createGain();os.type='sine';os.frequency.setValueAtTime(o.f*1.6,T);os.frequency.exponentialRampToValueAtTime(o.f,T+0.05);
  g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.002);g.gain.setTargetAtTime(0,T+0.01,o.dec/3);os.connect(g);g.connect(oc.destination);os.start(0);os.stop(o.len);
  const n=SL.noise(oc,0.04,o.f|0),bp=oc.createBiquadFilter(),ng=oc.createGain();bp.type='bandpass';bp.frequency.value=o.f*6;ng.gain.setValueAtTime(0.4,T);ng.gain.exponentialRampToValueAtTime(0.001,T+0.03);n.connect(bp);bp.connect(ng);ng.connect(oc.destination);n.start(T)};
SL.boom=o=>oc=>{const T=0.002,os=oc.createOscillator(),g=oc.createGain(),sh=oc.createWaveShaper();os.type='sine';os.frequency.setValueAtTime(90,T);os.frequency.exponentialRampToValueAtTime(42,T+0.25);os.frequency.exponentialRampToValueAtTime(30,T+o.len);
  g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.004);g.gain.setTargetAtTime(0,T+0.05,o.dec/3);sh.curve=SL.curve(1.8);os.connect(g);g.connect(sh);sh.connect(oc.destination);os.start(0);os.stop(o.len);
  const n=SL.noise(oc,0.5,97),lp=oc.createBiquadFilter(),ng=oc.createGain();lp.type='lowpass';lp.frequency.value=1800;ng.gain.setValueAtTime(0.5,T);ng.gain.exponentialRampToValueAtTime(0.001,T+0.4);n.connect(lp);lp.connect(ng);ng.connect(oc.destination);n.start(T)};
/* The kit: [length, synth layer, peak level, sample layer]. A sample layer names one of the CC0 recordings in SL.SMP,
   with its gain, the synth layer's gain under it (syn) and an optional high-pass (hp) so a recorded kick keeps its
   punch while the tuned synth sub carries the low end. Pieces with no synth layer only exist when the sample decodes. */
/* a crushed noise hit (Prototype 43): band-passed noise through a stepped curve, short and dry, for industrial */
SL.nzHit=o=>oc=>{const T=0.002,n=SL.noise(oc,0.2,o.seed),bp=oc.createBiquadFilter(),ws=oc.createWaveShaper(),g=oc.createGain();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=0.9;
  const a=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/1023*2-1;a[i]=Math.round(Math.tanh(x*4)*12)/12}ws.curve=a;n.connect(bp);bp.connect(g);g.connect(ws);ws.connect(oc.destination);
  g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.001);g.gain.setTargetAtTime(0,T+0.01,0.03);n.start(0)};
SL.KIT={kd:[0.5,SL.kick({f0:185,f1:52,f2:46,t1:0.07,dec:0.38,hold:0.02,click:0.2,sat:2.2,len:0.5}),0.27,{s:'kd',g:0.7,syn:0.8,hp:120,f:0.95}],
  ks:[0.27,SL.kick({f0:230,f1:66,f2:60,t1:0.035,dec:0.15,hold:0.005,click:0.3,sat:2.6,len:0.2}),0.32,{s:'kh',g:0.7,syn:0.75,hp:90,f:0.95}],
  km:[0.45,SL.kick({f0:150,f1:60,f2:52,t1:0.04,dec:0.2,hold:0.01,click:0.1,sat:1.6,len:0.3}),0.3,{s:'km',g:1,syn:0.45,f:0.95}],
  kt:[0.5,SL.kick({f0:160,f1:50,f2:46,t1:0.05,dec:0.34,hold:0.02,click:0.2,sat:2,len:0.55}),0.22,{s:'kt',g:0.7,syn:0.85,hp:100,f:0.95}],
  kp:[0.28,SL.kick({f0:200,f1:58,f2:55,t1:0.04,dec:0.22,hold:0.01,click:0.3,sat:2.4,len:0.28}),0.3,{s:'kd',g:0.55,syn:0.85,hp:150,f:0.95}],
  s1:[0.5,SL.snare({body:190,hp:900,bright:5,dec:0.22,crack:0.8,room:0.25,seed:21,len:0.5}),0.27,{s:'s1',g:1,syn:0.4}],
  s2:[0.5,SL.snare({body:196,hp:950,bright:4.5,dec:0.2,crack:0.75,room:0.25,seed:37,len:0.5}),0.27,{s:'s2',g:1,syn:0.4}],
  sm:[0.5,SL.snare({body:185,hp:800,bright:3,dec:0.2,crack:0.6,room:0.3,seed:41,len:0.5}),0.28,{s:'sm',g:1,syn:0.25}],
  sb:[0.3,SL.snare({body:210,hp:1100,bright:5,dec:0.12,crack:0.9,room:0.1,seed:43,len:0.3}),0.27,{s:'sb',g:1,syn:0.35}],
  sg:[0.25,SL.snare({body:200,hp:1400,bright:1,dec:0.1,crack:0.3,room:0,seed:53,len:0.25}),0.15,{s:'sg',g:1,syn:0.4}],
  cl:[0.45,SL.clap({seed:61,len:0.45}),0.3,{s:'cl',g:0.75,syn:0.75}],
  h1:[0.14,SL.metal({m:1,bp:10000,hp:7000,dec:0.045,nz:0.35,seed:71,len:0.09}),0.27,{s:'h1',g:1,syn:0.3,w:60,f:0.9}],
  h2:[0.16,SL.metal({m:1.06,bp:10500,hp:7200,dec:0.04,nz:0.4,seed:73,len:0.09}),0.27,{s:'h2',g:1,syn:0.3,w:60,f:0.9}],
  ho:[0.7,SL.metal({m:1.02,bp:9500,hp:6800,dec:0.32,nz:0.4,seed:79,len:0.4}),0.27,{s:'ho',g:1,syn:0.25,w:300,f:0.9}],
  cr:[2.2,SL.metal({m:1.31,bp:7000,hp:4500,dec:1.6,nz:0.7,seed:83,len:2.2}),0.3,{s:'cr',g:1,syn:0.3,w:600}],
  rd:[1.4,SL.metal({m:1.62,bp:8500,hp:5200,dec:0.9,nz:0.2,seed:89,len:1.4}),0.24,{s:'rd',g:1,syn:0.15,w:600}],
  t1:[0.5,SL.tom({f:190,dec:0.3,len:0.5}),0.3,{s:'t1',g:1,syn:0.3}],
  t2:[0.5,SL.tom({f:140,dec:0.34,len:0.5}),0.3,{s:'t2',g:1,syn:0.3}],
  t3:[0.6,SL.tom({f:100,dec:0.4,len:0.6}),0.3,{s:'t3',g:1,syn:0.3}],
  im:[1.6,SL.boom({dec:1.1,len:1.6}),0.42,{s:'im',g:0.75,syn:0.9,w:600}],
  rw:[1.8,null,0.3,{s:'rw',g:1}],wh:[1.85,null,0.26,{s:'wh',g:1}],
  /* Prototype 43: a 909-style techno kick, a distorted industrial kick, a long 808 boom and a house kick (over the club kick) */
  k9:[0.45,SL.kick({f0:240,f1:62,f2:48,t1:0.03,dec:0.32,hold:0.012,click:0.35,sat:2.6,len:0.45}),0.3,{s:'kd',g:0.5,syn:0.9,hp:150,f:0.95}],
  ki:[0.5,SL.kick({f0:300,f1:70,f2:44,t1:0.025,dec:0.42,hold:0.02,click:0.5,sat:5,len:0.5}),0.27,{s:'kh',g:0.6,syn:0.85,hp:110,f:0.95}],
  k8:[0.9,SL.kick({f0:115,f1:52,f2:44,t1:0.06,dec:0.8,hold:0.05,click:0.1,sat:1.6,len:0.9}),0.3,null],
  kh:[0.32,SL.kick({f0:210,f1:60,f2:50,t1:0.03,dec:0.22,hold:0.01,click:0.3,sat:2.2,len:0.32}),0.3,{s:'km',g:0.8,syn:0.6,hp:80,f:0.95}],
  nz:[0.2,SL.nzHit({seed:131}),0.22,null],
  /* Prototype 45: a gabber-tone kick (happy hardcore), hard-driven with a long pitched tail */
  kg:[0.55,SL.kick({f0:420,f1:78,f2:52,t1:0.022,dec:0.5,hold:0.035,click:0.55,sat:7,len:0.55}),0.27,{s:'kd',g:0.45,syn:0.95,hp:180,f:0.95}]};
/* CC0 drum recordings from the Sonic Pi sample pack (all from freesound.org, placed in the public domain under
   Creative Commons 0): bd_tek, bd_klub, drum_heavy_kick, drum_bass_hard, sn_dolf, sn_zome, drum_snare_hard,
   elec_hi_snare, drum_snare_soft, perc_snap, hat_zild, drum_cymbal_closed/open/hard, ride_tri, drum_tom_hi/mid/lo_hard,
   perc_impact1, vinyl_rewind and ambi_swoosh. Trimmed, faded, normalised and stored as small mono MP3s. */
//#include assets/sl-smp.js
/* Voices and more CC0 recordings. v_: the announcer, made with the open Kokoro text-to-speech model (Apache-2.0) and
   a PA-system treatment; c_: sung chops from the same model, pitch-flattened to A3; s_: Sonic Pi samples (CC0):
   ambi_choir (sung at C#4), ambi_glass_hum, drum_splash_hard, vinyl_scratch, glitch_perc1/3, misc_cineboom. */
//#include assets/sl-vox.js
/* More CC0 recordings for the music (Prototype 34). From the Versilian Community Sample Library (VCSL, CC0): marimba,
   vibraphone, glockenspiel, kalimba, harpsichord, pipe organ, tenor sax, dan tranh, strumstick, balafon, alto recorder,
   a tubular bell, bongos, congas, cajon, darbuka, tambourine, cowbell, agogo, woodblock, triangle, guiro, cabasa, frame
   drum, hi-hat and snare. From the Sonic Pi pack (CC0, freesound.org): kicks, snares, hats, electronic percussion, bass
   hits, tabla, pads, glitches and a breakbeat (loop_breakbeat; loop_amen was taken out in Prototype 43, as its rights are doubtful: the amen layer is now re-played from the kit). Pitched ones are measured and tuned to the
   semitone; the key's number is the MIDI note it sounds at. Trimmed, faded, level-matched, small mono MP3s. */
//#include assets/sl-ext.js
/* More CC0 recordings (Prototype 38), decoded only for the tunes that use them (and never with Lite audio). VCSL:
   xylophone, hand chimes, upright piano, TX81Z clavisynth, saxello, bowed psaltery, nyunga nyunga and Kenyan kalimba,
   wine glass and bowed vibraphone pads, brush, concert and old drums, claves, slit drum, large shaker, frame drum,
   tambourine, brake drums, anvil, finger cymbal, cowbells, a gong, mark tree, timpani and snare rolls, a cymbal swell,
   a bass drum crescendo, ocean drum, didgeridoo. Sonic Pi: kicks, hats, cymbals, toms, tabla, bass hits, pads, a
   choir, glitches, robots, a cinematic boom, a woosh, a vinyl scratch, and five percussion loops (loop_safari,
   loop_tabla, loop_mika, loop_compus and Arovane's beat_c) cut to one bar and stretched to 155 bpm. Pitched ones
   measured and tuned to the semitone like the Prototype 34 set. */
/* Prototype 43: Arovane's beat_a, b, d and e (Sonic Pi, CC0, donated by Uwe Zahn): two bars of each at 130 bpm, for the
   break sequencer to chop. Decoded only for the templates that use them. */
//#include assets/sl-ext2.js
/* Sound effects (Prototype 32), all CC0: Kenney's Interface Sounds, Digital Audio, Sci-Fi Sounds and Impact Sounds (kenney.nl);
   rubberduck's CC0 packs on OpenGameArt.org (50 CC0 Sci-Fi SFX, 50 CC0 retro / synth SFX, 25 CC0 bang / firework SFX,
   100 CC0 SFX #2, 75 CC0 breaking / falling / hit sfx); and the Sonic Pi pack (elec_beep, elec_blup, perc_swoosh,
   glitch_perc2). Trimmed, some layered, normalised and stored as small mono MP3s like the drums. */
//#include assets/sl-sfx.js
/* Guitars for metal: plucked strings (Karplus-Strong: a burst of noise circulating in a tuned, damped delay line) for
   root, fifth and octave, strummed a few ms apart, then an amp (asymmetric clipping) and a speaker cabinet (high-pass,
   two low-passes and a mid scoop). Open and palm-muted versions for every root from E2 to D#3. */
SL.biq=(x,sr,type,f,q,db=0)=>{const w=2*Math.PI*f/sr,cs=Math.cos(w),sn=Math.sin(w),al=sn/(2*q),A=Math.pow(10,db/40);let b0,b1,b2,a0,a1,a2;
  if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=b0;a0=1+al;a1=-2*cs;a2=1-al}else{b0=1+al*A;b1=-2*cs;b2=1-al*A;a0=1+al/A;a1=-2*cs;a2=1-al/A}
  b0/=a0;b1/=a0;b2/=a0;a1/=a0;a2/=a0;let x1=0,x2=0,y1=0,y2=0;for(let n=0;n<x.length;n++){const xn=x[n],y=b0*xn+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=xn;y2=y1;y1=y;x[n]=y}};
SL.hp1=(x,sr,f)=>{const a=Math.exp(-2*Math.PI*f/sr);let px=0,py=0;for(let n=0;n<x.length;n++){const y=a*(py+x[n]-px);px=x[n];py=y;x[n]=y}};
SL.gtr=(sr,midi,mute)=>{const len=mute?0.3:1.15,N=Math.ceil(sr*len),out=new Float32Array(N),r=rng(midi*13+(mute?7:1));
  [0,7,12].forEach((iv,j)=>{const f=440*Math.pow(2,(midi+iv-69)/12)*(1+(r()-0.5)*0.003),P=sr/f-0.5,D=Math.floor(P),fr=P-D,C=(1-fr)/(1+fr),L=D,line=new Float32Array(L);
    let lp=0;const br=mute?0.3:0.55;for(let i=0;i<L;i++){lp+=((r()*2-1)-lp)*br;line[i]=lp}
    const damp=mute?0.986:0.9986,st=Math.floor(sr*0.005*j),amp=j?0.75:1;let idx=0,ax=0,ay=0;
    for(let n=st;n<N;n++){const a=line[idx],b=line[idx+1<L?idx+1:0],y=damp*0.5*(a+b),ap=C*y+ax-C*ay;ax=y;ay=ap;line[idx]=ap;idx=idx+1<L?idx+1:0;out[n]+=a*amp}});
  if(mute)for(let n=0;n<N;n++)out[n]*=Math.exp(-n/(sr*0.07));
  let pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const pre=(mute?9:12)/(pk||1),bi=Math.tanh(0.15);
  for(let n=0;n<N;n++)out[n]=Math.tanh(out[n]*pre+0.15)-bi;
  SL.hp1(out,sr,90);SL.biq(out,sr,'lp',4300,0.85);SL.biq(out,sr,'lp',5200,0.6);SL.biq(out,sr,'peak',700,1,-3);
  pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const g=0.9/(pk||1),fo=Math.floor(sr*0.02);
  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1);return out};
/* The mono voice (runs on the audio thread). Notes arrive as messages with their start time; between notes it costs
   almost nothing. Per sample: up to three band-limited (PolyBLEP) saws or a square, a sub sine, a four-stage ladder
   low-pass with saturation in its feedback, filter and amp envelopes, optional filter wobble, glide and drive. */
SL.WORKLET=`
const th=x=>x<-3?-1:x>3?1:x*(27+x*x)/(27+9*x*x);
const blep=(t,dt)=>{if(t<dt){t/=dt;return t+t-t*t-1}if(t>1-dt){t=(t-1)/dt;return t*t+t+t+1}return 0};
class HLMono extends AudioWorkletProcessor{
  constructor(){super();this.q=[];this.on=false;this.amp=0;this.f=0;this.ft=110;this.glc=1;this.fe=0;this.ph=new Float64Array(3);this.sp=0;this.lp=0;this.pe=0;this.pdk=0;this.vp=0;this.mp=0;this.rp=0;this.cc=0;this.chv=0;this.s=new Float64Array(4);this.p=null;this.offT=0;this.dm=new Float64Array(3);this.vn=1;
    this.port.onmessage=e=>{const m=e.data;if(m.clear){this.q.length=0;this.on=false;return}let i=this.q.length;this.q.push(m);while(i>0&&this.q[i-1].t>m.t){this.q[i]=this.q[i-1];i--}this.q[i]=m}}
  note(m){const leg=this.on&&m.gl>0&&this.f>0;this.p=m;this.ft=m.f;if(!leg)this.f=m.f;this.glc=m.gl>0?1-Math.exp(-1/(m.gl*sampleRate)):1;this.on=true;this.offT=m.t+m.d;if(!leg)this.fe=1;
    const sp=m.dt/1200;if(m.vo===2){this.dm[0]=Math.pow(2,-sp/2);this.dm[1]=Math.pow(2,sp/2)}else{this.dm[0]=m.vo===1?1:Math.pow(2,-sp);this.dm[1]=1;this.dm[2]=Math.pow(2,sp)}
    this.vn=1/Math.sqrt(m.vo);this.ac=1-Math.exp(-1/(Math.max(0.0005,m.a)*sampleRate));this.rc=1-Math.exp(-1/(Math.max(0.002,m.r)*sampleRate));this.fd=Math.exp(-1/(Math.max(0.004,m.et)*sampleRate));this.dn=m.dr>1?1/th(m.dr):1;this.pe=m.pe?1:0;this.pdk=Math.exp(-1/(Math.max(0.003,m.pt||0.03)*sampleRate));if(!leg)this.mp=0}
  process(ins,outs){const o=outs[0][0];if(!o)return true;const n=o.length,dt=1/sampleRate,nyq=sampleRate*0.42;
    if(!this.q.length&&!this.on&&this.amp<1e-5){o.fill(0);this.amp=0;return true}
    let t=currentTime;const s=this.s,ph=this.ph,dm=this.dm;
    for(let i=0;i<n;i++,t+=dt){
      while(this.q.length&&this.q[0].t<=t)this.note(this.q.shift());
      const P=this.p;if(!P){o[i]=0;continue}
      if(this.on&&t>=this.offT)this.on=false;
      this.f+=(this.ft-this.f)*this.glc;let fq=this.f;
      if(this.pe){fq*=Math.pow(2,P.pe*this.pe/12);this.pe*=this.pdk;if(this.pe<1e-4)this.pe=0}
      if(P.vd){this.vp+=P.vr*dt;if(this.vp>=1)this.vp-=1;fq*=1+P.vd*0.000578*Math.sin(6.283185*this.vp)}
      const inc=fq*dt;let x=0;
      if(P.w===4){let p=ph[0]+inc;if(p>=1)p-=1;ph[0]=p;this.mp+=inc*P.fr;if(this.mp>=1)this.mp-=1;x=Math.sin(6.283185*p+P.fm*(0.25+0.75*this.fe)*Math.sin(6.283185*this.mp))}
      else{for(let v=0;v<P.vo;v++){const di=inc*dm[v];let p=ph[v]+di;if(p>=1)p-=1;ph[v]=p;
        if(P.w===3)x+=Math.sin(6.283185*p);else if(P.w===2)x+=4*(p<0.5?p:1-p)-1;else if(P.w)x+=(p<0.5?1:-1)+blep(p,di)-blep(p>=0.5?p-0.5:p+0.5,di);else x+=2*p-1-blep(p,di)}
        x*=this.vn}
      if(P.fold)x=Math.sin(1.5708*P.fold*x);
      if(P.ring){this.rp+=inc*P.ring;if(this.rp>=1)this.rp-=1;x*=Math.sin(6.283185*this.rp)}
      if(P.crush){if(--this.cc<=0){this.chv=Math.round(x*12)/12;this.cc=P.crush}x=this.chv}
      this.amp+=this.on?(1-this.amp)*this.ac:-this.amp*this.rc;this.fe*=this.fd;
      let fc=P.cut+P.env*this.fe;if(P.wd){this.lp+=P.wr*dt;if(this.lp>=1)this.lp-=1;fc+=P.wd*Math.sin(6.283185*this.lp)}
      fc=fc<30?30:fc>nyq?nyq:fc;const w=6.283185*fc*dt,g=w/(1+w),k=P.k;
      const u=th(x-k*s[3]);s[0]+=g*(u-s[0]);s[1]+=g*(s[0]-s[1]);s[2]+=g*(s[1]-s[2]);s[3]+=g*(s[2]-s[3]);
      let y=s[3]*(1+k*0.45);if(P.dr>1)y=th(y*P.dr)*this.dn;y*=P.v;
      if(P.sub){this.sp+=inc*0.5;if(this.sp>=1)this.sp-=1;y+=P.sub*Math.sin(6.283185*this.sp)}
      o[i]=y*this.amp}
    return true}}
registerProcessor('hl-mono',HLMono);`;

