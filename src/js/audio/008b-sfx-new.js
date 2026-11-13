//# audio/008b-sfx-new.js: the new sound effects (Prototype 64), behind the "New sound effects" setting
/* Prototype 64: Eric: "the sound effects are beginning to be the noticeable weak point". The old effects are 0.04 to 1.25 s
   mono MP3 snippets (Kenney, rubberduck, Sonic Pi; see 017-sound-lab.js) with the same sound every time, played at one
   level, with synth blips where there is no recording. This is a second set, made when it plays from the Web Audio nodes
   (the sound design follows the music's synth patches: the FM bell and the hang's partials, the analog lead's detuned
   saws, the acid lead's resonant sweep) with the CC0 recordings already in the page kept as a body layer under the big
   hits (boom, wreck). It is off by default (hoverline.sfx2, Settings, Sound) and nothing of the old set is changed.
   - Every play differs a little: a small detune, filter and timing spread, and a choice between variants, from its own
     random numbers (never Math.random: the race simulator seeds that).
   - Pitched effects sit in the tune's key (the tonic and mode the music engine is playing, a pentatonic scale of them) and
     the pickups, the lap cue and the menu ticks wait up to 60 ms for the tune's next sixteenth (music.nextT, music.bpm).
   - Everything goes through one bus (a gentle compressor, a short room) and the big hits duck the music bus
     (audio.musD, a gain after the music volume) for a moment.
   - Phone budget: no per-frame work (the engine hum update is thinned to 20 a second in this mode), effects are built when
     they play from a handful of nodes, at most SFX2.CAP sources are alive at once and a repeat inside its gap is dropped. */
const SFX2={
  on:store.get('hoverline.sfx2')==='1',
  CAP:56,live:[],last:{},cnt:{},forceKey:null,
  /* the gap before the same effect may play again (s), the most of it at once, its level (1 = the old effect's own loudness,
     set with tools/sfx/render.js --calibrate), whether it sits in the room, and whether it may wait for the beat */
  gap:{ui_move:0.04,ui_ok:0.06,ui_back:0.06,ui_select:0.06,wall:0.13,hit_s:0.05,hit_l:0.08,land:0.1,boom:0.05,cannon:0.05,count:0.2,pad:0.15,boost:0.3,flares:0.1,reflect:0.1,blip:0.03,noise:0.1,chime:0.1},
  mx:{boom:4,hit_s:3,hit_l:3,wall:2,cannon:4,blip:4,wreck:2},
  lvl:{ui_move:1,ui_ok:1,ui_back:1,ui_select:1,count:1,go:1,lap:1,final:1,boost:1,pad:1,jump:1,jump_drop:1,jump_sjump:1,jump_cjump:1,jump_portal:1,land:1,land_drop:1,deny:1,low:1,
    shield_full:1,ammo_full:1,hit_s:1,hit_l:1,wall:1,boom:1,wreck:1,missile:1,cannon:1,mines:1,shock:1,turbo:1,barrier:1,rockets:1,swarm:1,quake:1,bouncer:1,hunter:1,phase:1,
    reflector:1,emp:1,smoke:1,autopilot:1,overdrive:1,flares:1,reflect:1,emp_hit:1,portal:1,roll_in:1,roll_out:1,blip:1,noise:1},
  rev:{go:0.5,final:0.8,lap:0.4,ui_ok:0.25,shield_full:0.5,ammo_full:0.35,boom:0.4,wreck:0.6,quake:0.5,shock:0.4,barrier:0.4,phase:0.5,reflector:0.4,reflect:0.4,portal:0.7,jump_portal:0.6,jump_cjump:0.3,
    roll_in:0.4,roll_out:0.3,hunter:0.3,overdrive:0.2,flares:0.3,land_drop:0.3,emp:0.2},
  beat:{ui_ok:1,ui_back:1,ui_select:1,lap:1,final:1,shield_full:1,ammo_full:1,chime:1},
  /* the music ducks under these: [depth at full level (0 to 1), hold s, release s] */
  duck:{boom:[0.5,0.1,0.35],wreck:[0.6,0.35,0.6],quake:[0.4,0.3,0.5],shock:[0.4,0.15,0.4],land_drop:[0.35,0.1,0.35],jump_sjump:[0.25,0.15,0.3],overdrive:[0.2,0.2,0.4],final:[0.3,0.4,0.6],go:[0.25,0.15,0.4],
    emp_hit:[0.35,0.2,0.4],portal:[0.35,0.2,0.5],hit_l:[0.2,0.05,0.25]},
  /* its own random numbers */
  _s:(crypto.getRandomValues(new Uint32Array(1))[0]||1)>>>0,
  rnd(){let s=this._s;s^=s<<13;s^=s>>>17;s^=s<<5;this._s=s>>>0;return(s>>>0)/4294967296},
  setOn(b){this.on=!!b;store.set('hoverline.sfx2',b?'1':'0')},
  /* the tune: tonic (0 to 11), minor, bpm and whether the music grid (nextT) can be used */
  key(){if(this.forceKey)return this.forceKey;const m=typeof music!=='undefined'?music:null,K={tonic:9,minor:true,bpm:0,grid:false};
    if(m&&m.st&&m.style!=='off'&&m.timer&&m.ctx===audio.ctx&&!(m.modeEff&&m.modeEff()==='songs'&&m.soOn)){K.tonic=((m.st.key%12)+12)%12;K.minor=m.minor!==false;K.bpm=m.bpm||0;K.grid=isFinite(m.nextT)&&m.bpm>0&&(!m.modeEff||m.modeEff()==='gen')}
    return K},
  /* the next sixteenth of the tune, if it is less than `wait` seconds away (else now) */
  snap(t,K,wait){if(!K.grid||!(wait>0))return t;const m=music,sd=60/m.bpm/4,k=Math.ceil((t-m.nextT)/sd-1e-6),g=m.nextT+k*sd;return g-t<=wait?Math.max(t,g):t},
  PENT:{minor:[0,3,5,7,10],major:[0,2,4,7,9]},
  /* midi of scale degree d (0 = the tonic, 5 = its octave) with the tonic's octave o (5: C4 to B4) */
  midi(K,d,o=5){const P=this.PENT[K.minor?'minor':'major'];return 12*o+K.tonic+P[((d%5)+5)%5]+12*Math.floor(d/5)},
  /* the nearest note of the key to a frequency */
  snapF(f,K){K=K||this.key();const P=this.PENT[K.minor?'minor':'major'],m=69+12*Math.log2(f/440);let best=m,bd=9;
    for(let o=-1;o<=1;o++)for(const p of P){const c=12*(Math.round((m-K.tonic)/12)+o)+K.tonic+p;if(Math.abs(c-m)<bd){bd=Math.abs(c-m);best=c}}return mtof(best)},
  /* ---- the bus (once per context): in -> compressor -> out -> audio.master; a short room, fed per effect ---- */
  bus(c){let B=this.B;if(B&&B.c===c)return B;B=this.B={c};const g=()=>c.createGain();
    B.in=g();B.hp=c.createBiquadFilter();B.hp.type='highpass';B.hp.frequency.value=28;B.cp=c.createDynamicsCompressor();
    B.cp.threshold.value=-16;B.cp.knee.value=10;B.cp.ratio.value=3.2;B.cp.attack.value=0.003;B.cp.release.value=0.14;B.out=g();B.out.gain.value=1;
    B.in.connect(B.hp);B.hp.connect(B.cp);B.cp.connect(B.out);B.out.connect(audio.master);
    B.rvIn=g();B.rv=c.createConvolver();B.rv.buffer=SL.ir(c,0.8,0.5,true);B.rvOut=g();B.rvOut.gain.value=0.5;B.rvIn.connect(B.rv);B.rv.connect(B.rvOut);B.rvOut.connect(B.cp);
    /* white, and brown (rumble) noise, 2 s each, from the effects' own random numbers */
    const mk=f=>{const b=c.createBuffer(1,Math.floor(c.sampleRate*2),c.sampleRate),d=b.getChannelData(0);f(d);return b};
    B.white=mk(d=>{for(let i=0;i<d.length;i++)d[i]=this.rnd()*2-1});
    B.brown=mk(d=>{let y=0;for(let i=0;i<d.length;i++){y=(y+0.02*(this.rnd()*2-1))/1.02;d[i]=y*3.5}});
    B.sat=c.createWaveShaper();B.sat.curve=SL.curve(2.2);B.sat.oversample='2x';return B},
  /* ---- the music bus ducks: depth 0 to 1 (1 = silent) for `hold` s, then comes back over `rel` s ---- */
  duckV(t){const s=this.dk;if(!s)return 1;if(t<s.th)return s.d+(s.v0-s.d)*Math.exp(-(t-s.t0)/0.012);const vh=s.d+(s.v0-s.d)*Math.exp(-(s.th-s.t0)/0.012);return 1-(1-vh)*Math.exp(-(t-s.th)/(s.rel/3))},
  doDuck(depth,hold,rel){const a=audio,g=a.musD;if(!g||!a.ctx||typeof music==='undefined'||music.style==='off')return;const c=a.ctx,t=c.currentTime,v=this.duckV(t),s=this.dk,d0=1-clamp(depth,0,0.8),
      d=s&&t<s.th?Math.min(d0,s.d):d0,th=Math.max(t+hold,s&&t<s.th?s.th:0),r=Math.max(rel,s&&t<s.th?s.rel:0);
    g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(d,t,0.012);g.gain.setTargetAtTime(1,th,r/3);this.dk={t0:t,v0:v,d,th,rel:r}},
  /* ---- play an effect. Returns true when it handled the call (even if it was dropped for a repeat or a full bus) ---- */
  play(k,vol=1,rate=1){const a=audio,c=a.ctx,F=this.fx[k];if(!c||!F||!a.on||!(vol>=0.01))return false;
    const now=c.currentTime;if(now-(this.last[k]??-9)<(this.gap[k]??0.03))return true;
    const L=this.live;let n=0;for(let i=L.length-1;i>=0;i--){if(L[i].end<now)L.splice(i,1);else n+=L[i].n}
    if(n>this.CAP)return true;const mx=this.mx[k];if(mx){let q=0;for(const o of L)if(o.k===k)q++;if(q>=mx)return true}
    this.last[k]=now;const K=this.key(),B=this.bus(c),t=this.beat[k]?this.snap(now+0.005,K,0.06):now+0.005,pg=c.createGain();
    pg.gain.value=Math.min(1.5,vol)*(this.lvl[k]??1);pg.connect(B.in);const rv=this.rev[k];if(rv){const w=c.createGain();w.gain.value=rv;pg.connect(w);w.connect(B.rvIn)}
    const V=new SfxV(this,c,B,pg,t,K,rate,vol),dur=F(V)||0.3;L.push({end:t+dur+0.1,n:V.n,k});
    const dk=this.duck[k];if(dk&&vol>=0.3)this.doDuck(dk[0]*Math.min(1,vol),dk[1],dk[2]);return true},
  /* a plain tone (what audio.blip asks for, in the key; the old one is the same call without the new set) */
  blip(fr,dur,vol,type,to){const a=audio,c=a.ctx;if(!c||!a.on||c.currentTime-(this.last.blip??-9)<0.03)return;const K=this.key(),B=this.bus(c),t=c.currentTime+0.005;this.last.blip=t-0.005;
    const V=new SfxV(this,c,B,B.in,t,K,1,1),f0=this.snapF(fr,K),f1=to?this.snapF(to,K):0,ty=type==='square'||type==='sawtooth'?'triangle':type;
    V.osc(ty,f0,f1,Math.max(0.05,dur)*1.1,Math.min(0.5,vol*2.2),{a:0.004,lp:[Math.min(9000,f0*5),Math.max(300,f0*1.5)]});V.osc('sine',f0*2,f1?f1*2:0,Math.max(0.05,dur),Math.min(0.2,vol*0.8),{a:0.004});
    this.live.push({end:t+dur+0.2,n:V.n,k:'blip'})},
  /* a noise burst (the drift grip, the smoke's ink): band-limited, softer than the old burst */
  noise(vol,freq,dur){const a=audio,c=a.ctx;if(!c||!a.on||vol<0.01||c.currentTime-(this.last.noise??-9)<0.1)return;this.last.noise=c.currentTime;const B=this.bus(c),V=new SfxV(this,c,B,B.in,c.currentTime+0.005,this.key(),1,1);
    V.nz(Math.max(0.1,dur*0.9),Math.min(0.7,vol*2.2),{f:[freq*0.6,freq*1.5],q:0.9,a:0.02});V.osc('sine',90,60,0.12,Math.min(0.3,vol),{a:0.004});this.live.push({end:c.currentTime+dur+0.2,n:V.n,k:'noise'})},
  /* ---- the engine hum, new: a softer second voice, a third detuned a little, a turbine whine and a thin wind, all
     on the old hum's gain (audio.eg) so it still fades in every menu. Thinned to 20 updates a second. ---- */
  engine(v,boost,fly,fr){const a=audio,c=a.ctx,t=c.currentTime;let E=this.E;if(this.on&&(!E||E.c!==c)){E=this.E={c,t:-1};
      const f=c.createBiquadFilter(),g=c.createGain(),o3=c.createOscillator(),o4=c.createOscillator(),wn=c.createBufferSource(),wf=c.createBiquadFilter(),wg=c.createGain(),tg=c.createGain();
      o3.type='sawtooth';o4.type='sine';f.type='lowpass';f.frequency.value=500;g.gain.value=0;tg.gain.value=0;wn.buffer=this.bus(c).brown;wn.loop=true;wf.type='bandpass';wf.Q.value=0.8;wf.frequency.value=500;wg.gain.value=0;
      o3.connect(f);f.connect(g);g.connect(a.eg);o4.connect(tg);tg.connect(a.eg);wn.connect(wf);wf.connect(wg);wg.connect(a.eg);o3.start();o4.start();wn.start();Object.assign(E,{f,g,o3,o4,tg,wf,wg})}
    if(!E)return;if(!this.on){if(E.g.gain.value>0||E.on){E.g.gain.setTargetAtTime(0,t,0.1);E.tg.gain.setTargetAtTime(0,t,0.1);E.wg.gain.setTargetAtTime(0,t,0.1);a.o2.type='square';E.on=false}return}
    if(t-E.t<0.05)return;E.t=t;if(!E.on){E.on=true;a.o2.type='triangle'}const s=clamp(v/190,0,1.2);
    E.o3.frequency.setTargetAtTime(fr*1.004,t,0.05);E.f.frequency.setTargetAtTime(220+v*8+boost*700,t,0.08);E.g.gain.setTargetAtTime(fly?0.7:0,t,0.12);
    E.o4.frequency.setTargetAtTime(fr*5.5+boost*60,t,0.06);E.tg.gain.setTargetAtTime(fly?0.02+0.1*s*s+0.1*boost:0,t,0.1);
    E.wf.frequency.setTargetAtTime(380+v*16+boost*500,t,0.1);E.wg.gain.setTargetAtTime(fly?0.15+1.2*s*s*(1+boost):0,t,0.12)}
};
/* One playing effect: the helpers the effect functions use. t is when it starts; every helper takes `at` (s after that). */
class SfxV{
  constructor(S,c,B,dst,t,K,rate,vol){this.S=S;this.c=c;this.B=B;this.d=dst;this.t=t;this.K=K;this.rate=rate;this.vol=vol;this.n=0}
  r(a,b){return a+(b-a)*this.S.rnd()}
  /* x spread by +-p (0.05 = 5%) */
  j(x,p){return x*(1+(this.S.rnd()*2-1)*p)}
  pick(a){return a[Math.floor(this.S.rnd()*a.length)]}
  /* the key: midi of scale degree d in octave o; its frequency, spread by a few cents */
  n(d,o=5){return this.S.midi(this.K,d,o)}
  f(m,cents=4){return mtof(m)*Math.pow(2,(this.S.rnd()*2-1)*cents/1200)*this.rate}
  out(x,pan){if(pan&&this.c.createStereoPanner){const p=this.c.createStereoPanner();p.pan.value=pan;x.connect(p);p.connect(this.d)}else x.connect(this.d)}
  /* an oscillator: type, f0 -> f1 (0 = stay) over `sw` (default the whole length), length dur, peak g.
     o: at, a (attack s), lp [f0,f1] (a low-pass sweep) with q, hp, det (cents), pan, fm [ratio, index], hold (s at the peak) */
  osc(type,f0,f1,dur,g,o={}){const c=this.c,t=this.t+(o.at||0),n=c.createOscillator(),e=c.createGain(),dt=o.det?Math.pow(2,o.det/1200):1,sw=o.sw||dur;this.n++;
    n.type=type;n.frequency.setValueAtTime(f0*dt,t);if(f1&&f1!==f0)n.frequency.exponentialRampToValueAtTime(Math.max(20,f1*dt),t+sw);
    const a=o.a||0.003;e.gain.setValueAtTime(0.0001,t);e.gain.linearRampToValueAtTime(Math.max(0.0002,g),t+a);if(o.hold)e.gain.setValueAtTime(Math.max(0.0002,g),t+a+o.hold);e.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    let x=n;if(o.fm){const m=c.createOscillator(),mg=c.createGain();this.n++;m.type='sine';m.frequency.setValueAtTime(f0*dt*o.fm[0],t);if(f1&&f1!==f0)m.frequency.exponentialRampToValueAtTime(Math.max(20,f1*dt*o.fm[0]),t+sw);
      mg.gain.setValueAtTime(f0*dt*o.fm[0]*o.fm[1],t);mg.gain.exponentialRampToValueAtTime(Math.max(1,f0*dt*o.fm[0]*0.02),t+dur*0.6);m.connect(mg);mg.connect(n.frequency);m.start(t);m.stop(t+dur+0.05)}
    if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.Q.value=o.q||0.7;f.frequency.setValueAtTime(o.lp[0],t);f.frequency.exponentialRampToValueAtTime(Math.max(60,o.lp[1]),t+(o.lps||dur));x.connect(f);x=f}
    if(o.hp){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;x.connect(f);x=f}
    x.connect(e);this.out(e,o.pan);n.start(t);n.stop(t+dur+0.05);return e}
  /* a noise burst: length dur, peak g. o: at, a, f [f0,f1] (the filter sweep), q, type ('bandpass', 'lowpass', 'highpass'), brown (a rumble), pan, hold */
  nz(dur,g,o={}){const c=this.c,t=this.t+(o.at||0),s=c.createBufferSource(),e=c.createGain(),f=c.createBiquadFilter();this.n++;s.buffer=o.brown?this.B.brown:this.B.white;s.loop=true;
    f.type=o.type||'bandpass';f.Q.value=o.q||0.8;const f0=o.f?o.f[0]:2000,f1=o.f?o.f[1]:f0;f.frequency.setValueAtTime(Math.max(40,f0),t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+(o.sw||dur));
    const a=o.a||0.003;e.gain.setValueAtTime(0.0001,t);e.gain.linearRampToValueAtTime(Math.max(0.0002,g),t+a);if(o.hold)e.gain.setValueAtTime(Math.max(0.0002,g),t+a+o.hold);e.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(e);this.out(e,o.pan);s.start(t,this.S.rnd()*1.5);s.stop(t+dur+0.05);return e}
  /* a kick-like thump: a sine falling f0 -> f1, with a click */
  sub(f0,f1,dur,g,o={}){const e=this.osc('sine',f0,f1,dur,g,{a:0.002,sw:dur*0.6,...o});if(!o.noclick)this.nz(0.012,g*0.25,{at:o.at,f:[3000,3000],q:0.5,type:'highpass',a:0.001});return e}
  /* a bell on a note (midi): FM with inharmonic partials as the music's fmbell and hang patches have them */
  bell(m,dur,g,o={}){const f=this.f(m,3),at=o.at||0;this.osc('sine',f,0,dur,g,{at,a:0.002,fm:[3.5,o.idx||1.6]});this.osc('sine',f*2.756,0,dur*0.55,g*0.32,{at,a:0.001});this.osc('sine',f*5.4,0,dur*0.28,g*0.14,{at,a:0.001})}
  /* a short pluck on a note: a triangle through a closing low-pass, and a sine an octave up */
  pl(m,dur,g,o={}){const f=this.f(m,3),at=o.at||0;this.osc('triangle',f,0,dur,g,{at,a:0.002,lp:[f*7,f*1.3],q:1,det:o.det});this.osc('sine',f*2,0,dur*0.6,g*0.3,{at,a:0.002})}
  /* a recording from SL.SFX (decoded in audio.fx) as a layer; rate, low-pass/high-pass, offset */
  smp(key,o={}){const c=this.c,b=audio.fx&&audio.fx[key];if(!b)return;const t=this.t+(o.at||0),s=c.createBufferSource(),e=c.createGain();let x=s;this.n++;s.buffer=b;s.playbackRate.value=(o.rate||1)*this.rate;e.gain.value=o.g||0.5;
    if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;x.connect(f);x=f}if(o.hp){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;x.connect(f);x=f}x.connect(e);this.out(e,o.pan);s.start(t,o.off||0)}
  /* sparse crackle: n tiny noise ticks over `span` s (debris, sparks, electricity) */
  crackle(n,span,g,o={}){for(let i=0;i<n;i++)this.nz(this.r(0.008,0.03),g*this.r(0.4,1),{at:(o.at||0)+this.S.rnd()*span,f:[this.r(o.f0||2500,o.f1||7000),this.r(o.f0||2500,o.f1||7000)],q:this.r(1,3),a:0.001,pan:this.r(-0.5,0.5)})}
}
SFX2.fx={
  /* ---- menus ---- */
  ui_move(V){const f=V.f(V.n(V.pick([0,2,3,5]),7),6);V.osc('sine',f,0,0.07,0.5,{a:0.002});V.osc('triangle',f*2,0,0.04,0.12,{a:0.001});V.nz(0.01,0.08,{f:[5000,5000],type:'highpass',a:0.001});return 0.1},
  ui_ok(V){V.pl(V.n(0,6),0.2,0.5);V.pl(V.n(3,6),0.26,0.5,{at:0.075});V.bell(V.n(5,7),0.3,0.08,{at:0.075});return 0.4},
  ui_back(V){V.pl(V.n(3,6),0.16,0.4);V.pl(V.n(0,6),0.24,0.36,{at:0.07});return 0.34},
  ui_select(V){return SFX2.fx.ui_ok(V)},
  /* ---- the race: countdown, go, laps ---- */
  count(V){const f=V.f(V.n(0,6),3);V.osc('sine',f,0,0.22,0.7,{a:0.004});V.osc('triangle',f*2,0,0.12,0.18,{a:0.002});V.nz(0.012,0.12,{f:[4000,4000],type:'highpass',a:0.001});return 0.26},
  go(V){const r=V.n(0,6);for(const d of[0,3,5]){const f=V.f(V.n(d,6),5);V.osc('sawtooth',f,0,0.55,0.16,{a:0.006,lp:[f*9,f*1.6],q:0.8,det:V.r(-6,6)});V.osc('sine',f,0,0.5,0.3,{a:0.004})}
    V.bell(V.n(5,7),0.6,0.2);V.nz(0.3,0.3,{f:[500,6000],q:0.7,a:0.12,sw:0.25});V.sub(V.f(V.n(0,3),0),V.f(V.n(0,2),0),0.4,0.8);return 0.7},
  lap(V){const nn=[0,3,5];nn.forEach((d,i)=>{V.pl(V.n(d,6),0.28,0.5,{at:i*0.065});V.bell(V.n(d,7),0.35,0.07,{at:i*0.065})});V.nz(0.2,0.1,{f:[2000,8000],q:0.8,a:0.06,at:0.12});return 0.5},
  final(V){const nn=[0,3,5,8];nn.forEach((d,i)=>{V.pl(V.n(d,6),0.4,0.5,{at:i*0.07});V.bell(V.n(d,7),0.55,0.1,{at:i*0.07})});for(const d of[0,3,5]){const f=V.f(V.n(d,6),4);V.osc('sawtooth',f,0,0.8,0.1,{at:0.28,a:0.01,lp:[f*8,f*1.4],det:V.r(-7,7)})}
    V.nz(0.5,0.22,{f:[600,9000],q:0.7,a:0.22,sw:0.45});V.sub(V.f(V.n(0,3),0),V.f(V.n(0,2),0),0.5,0.7,{at:0.28});return 1.0},
  /* ---- movement ---- */
  boost(V){const j=V.j(1,0.05);V.osc('sawtooth',90*j,430*j,0.55,0.34,{a:0.03,lp:[300,2600],q:2.5,det:V.r(-8,8)});V.osc('square',45*j,215*j,0.5,0.18,{a:0.04,lp:[260,1200]});V.nz(0.5,0.3,{f:[500,3600],q:0.7,a:0.06,sw:0.45});V.sub(110,48,0.2,0.6);return 0.6},
  pad(V){const f=V.f(V.n(0,5),4);V.osc('sawtooth',f,f*2.9,0.34,0.3,{a:0.004,lp:[900,5200],q:7,sw:0.3});V.osc('square',f*1.5,f*4.4,0.3,0.1,{a:0.004,lp:[700,4000],sw:0.28});V.nz(0.3,0.25,{f:[1200,6000],q:1,a:0.01,sw:0.25});V.nz(0.012,0.18,{f:[5000,5000],type:'highpass',a:0.001});return 0.36},
  jump(V){V.sub(V.j(85,0.06),V.j(180,0.06),0.3,0.7,{noclick:true});V.nz(0.26,0.22,{f:[600,5000],q:0.8,a:0.05,sw:0.24});V.osc('sine',300,720,0.28,0.18,{a:0.02});return 0.34},
  /* a drop: the road falls away */
  jump_drop(V){V.nz(0.7,0.3,{f:[3200,260],q:0.7,a:0.05,sw:0.65});V.osc('sine',V.j(520,0.04),110,0.6,0.32,{a:0.01});V.osc('triangle',V.j(260,0.04),70,0.55,0.18,{a:0.02,lp:[1800,200]});return 0.75},
  /* a speed jump: a hard launch up to the next road */
  jump_sjump(V){V.sub(100,45,0.25,0.8);V.osc('sawtooth',110,900,0.6,0.28,{a:0.02,lp:[400,4500],q:3,det:V.r(-6,6)});V.osc('sawtooth',113,920,0.6,0.2,{a:0.02,lp:[400,4500],q:3});V.nz(0.55,0.32,{f:[700,5500],q:0.8,a:0.05,sw:0.5});return 0.7},
  /* a long jump: a long glide, the whoosh opening out and an echo of it */
  jump_cjump(V){V.sub(90,42,0.3,0.7);V.osc('sawtooth',130,720,0.9,0.22,{a:0.05,lp:[350,3200],q:2,sw:0.85,det:V.r(-6,6)});V.nz(0.9,0.28,{f:[400,4200],q:0.6,a:0.12,sw:0.85});V.osc('sine',V.f(V.n(0,5),0),V.f(V.n(5,5),0),0.9,0.12,{a:0.2,sw:0.85});V.nz(0.5,0.1,{at:0.32,f:[800,5000],q:0.8,a:0.1,sw:0.45});return 1.0},
  jump_portal(V){V.sub(90,50,0.2,0.5);V.osc('sine',V.f(V.n(0,5),0),V.f(V.n(5,6),0),0.5,0.3,{a:0.02,fm:[2,2]});V.nz(0.5,0.2,{f:[800,7000],q:1,a:0.06,sw:0.45});for(let i=0;i<3;i++)V.bell(V.n([0,3,5][i],7),0.4,0.07,{at:0.08+i*0.07});return 0.7},
  land(V){const k=clamp(V.vol,0.1,1.5);V.sub(V.j(88,0.06),V.j(36,0.06),0.2+0.1*k,0.8*Math.min(1,0.4+k),{});V.nz(0.14,0.3,{f:[1400,260],q:0.7,a:0.002,sw:0.12});V.nz(0.05,0.12,{f:[3500,3500],type:'highpass',a:0.001});return 0.35},
  land_drop(V){V.sub(70,28,0.45,0.9);V.nz(0.35,0.4,{f:[1800,200],q:0.6,a:0.002,sw:0.3});V.nz(0.5,0.3,{brown:true,type:'lowpass',f:[500,90],a:0.004});V.crackle(5,0.25,0.12,{f0:1500,f1:4500});V.smp('boom',{g:0.3,rate:V.r(0.8,0.95),lp:1500});return 0.6},
  /* ---- warnings and pickups ---- */
  deny(V){V.osc('sawtooth',V.j(250,0.03),175,0.12,0.3,{a:0.004,lp:[1100,500]});V.osc('sawtooth',V.j(190,0.03),130,0.16,0.3,{at:0.1,a:0.004,lp:[900,400]});return 0.3},
  low(V){for(const at of[0,0.16]){V.osc('sine',1046,0,0.11,0.45,{at,a:0.004});V.osc('triangle',2093,0,0.08,0.12,{at,a:0.003})}return 0.3},
  shield_full(V){V.bell(V.n(3,5),0.5,0.4);V.bell(V.n(5,6),0.7,0.45,{at:0.09});V.osc('sine',V.f(V.n(0,4),0),0,0.6,0.15,{a:0.05,at:0.09});return 0.8},
  ammo_full(V){V.pl(V.n(5,6),0.2,0.5);V.pl(V.n(7,6),0.22,0.5,{at:0.06});V.pl(V.n(10,6),0.28,0.45,{at:0.12});V.nz(0.02,0.1,{f:[6000,6000],type:'highpass',at:0.12,a:0.001});return 0.45},
  /* ---- hits ---- */
  hit_s(V){const f=V.j(1,0.12);V.nz(0.08,0.55,{f:[1900*f,650*f],q:0.9,a:0.001});V.sub(210*f,100*f,0.07,0.5,{noclick:true});V.nz(0.02,0.25,{f:[4500,4500],type:'highpass',a:0.001});return 0.12},
  hit_l(V){const f=V.j(1,0.1);V.nz(0.22,0.6,{f:[1300*f,260*f],q:0.7,a:0.001});V.sub(135*f,52*f,0.26,0.8,{noclick:true});for(const r of[1,1.52,2.13])V.osc('sine',640*r*f,0,0.18,0.1,{a:0.001});V.crackle(3,0.08,0.15,{f0:2000,f1:6000});return 0.3},
  wall(V){const k=clamp(V.vol,0.15,1.2),f=V.r(1100,2600);V.nz(V.r(0.15,0.24),0.5*Math.min(1,0.4+k),{f:[f,f*V.r(0.5,0.8)],q:V.r(1,2.2),a:0.004});V.osc('sawtooth',V.r(260,520),V.r(170,300),0.16,0.1*k,{a:0.004,lp:[1800,600],q:2});V.crackle(3,0.14,0.2*k,{f0:3000,f1:8000});return 0.25},
  boom(V){const v=V.vol,big=v>=0.6,mid=v>=0.3;
    if(big){V.sub(V.j(75,0.08),V.j(28,0.08),0.7,1);V.nz(0.8,0.5,{f:[V.r(3600,4800),150],q:0.6,a:0.002,sw:0.7});V.nz(0.7,0.45,{brown:true,type:'lowpass',f:[700,80],a:0.004});V.crackle(7,0.5,0.14,{f0:1200,f1:5000});V.smp('boom',{g:0.45,rate:V.r(0.85,1.1),lp:3000});return 0.9}
    if(mid){V.sub(V.j(95,0.08),V.j(38,0.08),0.4,0.9);V.nz(0.4,0.45,{f:[V.r(2800,3800),200],q:0.7,a:0.002,sw:0.35});V.nz(0.35,0.3,{brown:true,type:'lowpass',f:[600,100],a:0.003});V.crackle(3,0.25,0.1);V.smp('boom',{g:0.22,rate:V.r(1.1,1.35),lp:2500});return 0.55}
    V.sub(V.j(130,0.08),V.j(55,0.08),0.22,0.8);V.nz(0.22,0.4,{f:[V.r(2500,3400),300],q:0.8,a:0.002,sw:0.2});V.crackle(2,0.12,0.1);return 0.3},
  wreck(V){const v=clamp(V.vol,0.2,1);V.sub(V.j(68,0.06),24,0.9,1);V.nz(1.0,0.5*v,{f:[4200,110],q:0.6,a:0.002,sw:0.9});V.nz(1.1,0.5*v,{brown:true,type:'lowpass',f:[800,60],a:0.004});V.smp('wreck',{g:0.55*v,rate:V.r(0.85,1.05),lp:3500});V.smp('boom',{g:0.4*v,rate:V.r(0.75,0.95),lp:2200,at:0.06});
    V.crackle(12,0.9,0.18*v,{f0:900,f1:5500});for(const r of[1,1.5,2.4])V.osc('sine',V.j(520,0.15)*r,0,0.3,0.05*v,{at:V.r(0,0.12),a:0.001});return 1.2},
  /* ---- modules (what firing one sounds like) ---- */
  missile(V){const j=V.j(1,0.06);V.nz(0.12,0.55,{f:[400,2400*j],q:0.8,a:0.004,sw:0.1});V.sub(150*j,70,0.14,0.7);V.nz(0.6,0.4,{f:[1800*j,500],q:0.7,a:0.03,hold:0.08,sw:0.55});V.osc('sawtooth',130*j,210*j,0.5,0.1,{a:0.03,lp:[900,500]});V.nz(0.5,0.18,{brown:true,type:'lowpass',f:[500,160],a:0.02});return 0.7},
  cannon(V){const j=V.j(1,0.07);V.osc('square',1900*j,260*j,0.1,0.35,{a:0.001,lp:[7000,900],hp:150});V.osc('sine',620*j,150,0.12,0.4,{a:0.001});V.nz(0.04,0.45,{f:[5000,2500],q:0.7,a:0.001});V.sub(130*j,60,0.1,0.6,{noclick:true});return 0.16},
  mines(V){for(let i=0;i<3;i++){const f=V.j(1,0.08),at=i*0.085;V.osc('sine',640*f,380*f,0.12,0.4,{at,a:0.002,fm:[1.41,1.2]});V.nz(0.025,0.28,{at,f:[3000,3000],type:'highpass',a:0.001});V.sub(150*f,80,0.09,0.3,{at,noclick:true})}return 0.4},
  shock(V){V.sub(V.j(120,0.05),36,0.8,1);V.nz(0.8,0.3,{f:[2500,120],q:0.8,a:0.01,sw:0.7});V.osc('sine',90,400,0.5,0.15,{a:0.02,fm:[2,1.5]});V.nz(0.6,0.2,{brown:true,type:'lowpass',f:[400,80],a:0.01});return 0.9},
  turbo(V){V.sub(100,45,0.25,0.7);V.osc('sawtooth',70,360,0.75,0.4,{a:0.04,lp:[250,2200],q:3,det:V.r(-8,8)});V.osc('sawtooth',72,364,0.75,0.3,{a:0.04,lp:[250,2200],q:3});V.nz(0.7,0.35,{f:[400,3200],q:0.6,a:0.08,sw:0.65});return 0.8},
  barrier(V){const f=V.n(0,5);V.osc('triangle',V.f(f,0)*0.5,V.f(f,0),0.7,0.3,{a:0.05,lp:[400,3000],det:-5});V.osc('triangle',V.f(f,0)*0.5,V.f(f,0),0.7,0.3,{a:0.05,lp:[400,3000],det:5});V.bell(V.n(3,6),0.6,0.2,{at:0.12});V.bell(V.n(0,7),0.6,0.12,{at:0.2});V.sub(100,60,0.15,0.4);return 0.8},
  rockets(V){for(let i=0;i<3;i++){const at=i*0.06,j=V.j(1,0.07);V.nz(0.3,0.38,{at,f:[500,2600*j],q:0.8,a:0.003,sw:0.1});V.nz(0.4,0.22,{at,f:[1500*j,450],q:0.7,a:0.03,sw:0.38});V.sub(170*j,80,0.1,0.35,{at,noclick:true})}return 0.6},
  swarm(V){for(let i=0;i<4;i++){const at=i*0.05,f=V.f(V.n([0,2,3,5][i],6),8);V.osc('sine',f,f*1.6,0.12,0.25,{at,a:0.002});V.nz(0.22,0.2,{at,f:[1800,5200],q:1.2,a:0.01,sw:0.2})}V.nz(0.4,0.14,{at:0.1,f:[2200,700],q:0.7,a:0.05});return 0.55},
  quake(V){V.sub(V.j(60,0.05),26,1.1,1);V.nz(1.2,0.55,{brown:true,type:'lowpass',f:[500,70],a:0.01});V.nz(0.5,0.3,{f:[1600,200],q:0.7,a:0.002,sw:0.45});V.crackle(5,0.7,0.2,{f0:600,f1:2500});V.smp('quake',{g:0.25,rate:V.r(0.85,1),lp:1200});return 1.2},
  bouncer(V){const f=V.j(1,0.06);V.osc('sine',280*f,820*f,0.28,0.45,{a:0.004,fm:[1,1.4],sw:0.12});V.osc('triangle',1100*f,0,0.2,0.1,{a:0.002,at:0.04});V.nz(0.02,0.22,{f:[4000,4000],type:'highpass',a:0.001});return 0.3},
  hunter(V){V.osc('sawtooth',90,520,0.7,0.28,{a:0.06,lp:[260,2400],q:3,sw:0.65,det:V.r(-7,7)});V.nz(0.5,0.28,{f:[700,3000],q:0.8,a:0.1,hold:0.1,sw:0.45});V.bell(V.n(7,6),0.5,0.12,{at:0.36});V.sub(90,50,0.2,0.5);return 0.8},
  phase(V){V.osc('sine',V.j(1300,0.05),240,0.5,0.4,{a:0.01,fm:[1.5,0.7],sw:0.45});V.nz(0.45,0.3,{type:'highpass',f:[1500,5200],q:0.7,a:0.28,sw:0.3});V.osc('sine',V.j(650,0.05),120,0.5,0.2,{a:0.02,at:0.04,sw:0.45});return 0.6},
  reflector(V){V.bell(V.n(5,8),0.5,0.4);V.bell(V.n(7,8),0.45,0.3,{at:0.05});V.osc('sine',900,2800,0.18,0.25,{a:0.004,sw:0.16});V.nz(0.3,0.15,{type:'highpass',f:[3000,8000],q:0.8,a:0.02});return 0.6},
  emp(V){V.osc('square',1250,85,0.5,0.3,{a:0.003,lp:[4000,300],q:2});V.osc('sawtooth',V.j(620,0.04),55,0.5,0.2,{a:0.003,lp:[2500,200]});V.nz(0.4,0.3,{f:[3000,600],q:1.2,a:0.002});V.crackle(8,0.4,0.25,{f0:2000,f1:7000});V.sub(100,40,0.2,0.5);return 0.6},
  smoke(V){V.nz(0.5,0.5,{type:'highpass',f:[2500,5500],q:0.6,a:0.01,sw:0.45});V.nz(0.45,0.25,{f:[900,300],q:0.8,a:0.02});V.sub(110,60,0.12,0.4,{noclick:true});return 0.55},
  autopilot(V){V.pl(V.n(3,6),0.14,0.4);V.pl(V.n(5,6),0.2,0.4,{at:0.1});V.osc('sine',230,260,0.25,0.12,{a:0.05,lp:[500,400]});V.osc('sine',3000,3000,0.06,0.06,{at:0.2});return 0.35},
  overdrive(V){const f=V.n(0,5);for(const det of[-9,0,9])V.osc('sawtooth',V.f(f-12,0),V.f(f+12,0),0.55,0.14,{a:0.03,lp:[300,4200],q:2.5,det});V.nz(0.5,0.3,{f:[500,5200],q:0.7,a:0.06,sw:0.45});V.sub(90,45,0.2,0.6);V.bell(V.n(5,7),0.4,0.14,{at:0.2});return 0.6},
  flares(V){V.crackle(10,0.3,0.4,{f0:3500,f1:9000});for(let i=0;i<5;i++)V.osc('sine',V.f(V.n(V.pick([2,3,4,5,7]),8),10),0,0.1,0.14,{at:V.r(0,0.22),a:0.001});V.nz(0.35,0.3,{type:'highpass',f:[3000,7000],q:0.7,a:0.01});V.sub(260,150,0.05,0.2,{noclick:true});return 0.4},
  /* the reflector's turn: a bright bell zing */
  reflect(V){V.osc('sine',1200,3200,0.12,0.3,{a:0.003,sw:0.1});V.bell(V.n(V.pick([5,7]),8),0.4,0.35,{at:0.03});V.nz(0.08,0.25,{f:[5000,5000],type:'highpass',a:0.001});return 0.5},
  /* an EMP hits you */
  emp_hit(V){V.osc('square',160,52,0.45,0.35,{a:0.002,lp:[2500,200],q:1.5});V.osc('sawtooth',320,60,0.4,0.15,{a:0.002,lp:[2000,200]});V.crackle(9,0.35,0.28,{f0:1500,f1:6000});V.sub(100,40,0.25,0.7);return 0.5},
  /* ---- the Spirit realm's road: portal jump, underside ---- */
  portal(V){/* in: the pull and a swallowed whoosh; 90 ms later out: a bright pop and a shimmer */
    V.osc('sine',900,90,0.14,0.4,{a:0.004,fm:[2,2]});V.nz(0.16,0.35,{f:[5000,500],q:0.8,a:0.01,sw:0.14});V.sub(100,45,0.15,0.6,{noclick:true});
    const o=0.09;V.nz(0.14,0.5,{at:o,type:'highpass',f:[2000,7000],q:0.6,a:0.002,sw:0.1});V.osc('sine',V.f(V.n(0,6),0),V.f(V.n(5,6),0),0.5,0.3,{at:o,a:0.005,fm:[2,1.6]});
    for(let i=0;i<4;i++)V.bell(V.n([0,3,5,7][i],7),0.55,0.1,{at:o+0.02+i*0.05});V.nz(0.6,0.25,{at:o,f:[7000,1200],q:0.8,a:0.02,sw:0.55});V.sub(80,40,0.3,0.5,{at:o});return 0.8},
  /* the underside's roll: a turning whoosh, down into the roll and back out of it */
  roll_in(V){V.osc('sine',V.f(V.n(0,5),0),V.f(V.n(3,6),0),0.55,0.22,{a:0.06,fm:[1.5,1.2],sw:0.5});V.nz(0.55,0.34,{f:[600,3800],q:1.4,a:0.12,sw:0.5});V.osc('sawtooth',180,420,0.5,0.12,{a:0.1,lp:[400,1800]});V.sub(90,50,0.15,0.4,{at:0.38});return 0.6},
  roll_out(V){V.osc('sine',V.f(V.n(3,6),0),V.f(V.n(0,5),0),0.55,0.22,{a:0.04,fm:[1.5,1.2],sw:0.5});V.nz(0.5,0.32,{f:[3800,600],q:1.4,a:0.08,sw:0.45});V.sub(90,50,0.15,0.5,{at:0.45});return 0.6}
};
