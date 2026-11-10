//# audio/008-audio.js: sound effects, the announcer and the audio context
/* ---------- audio ---------- */
/* announcer: the Kokoro speech model's British voice, on or off */
let annOn=store.get('hoverline.ann')!=='0';
/* recordings shared between effects ([recording, playback rate]), and each effect's level at full volume: set so every
   recording is as loud (peak 30 ms RMS) as the synth sound it replaced; hit, wall, land and boom scale with the hit */
const SFX_USE={rockets:['missile',1.3],hunter:['missile',0.8],turbo:['boost',0.8]},SFX_GAP={wall:0.15,hit_s:0.06,hit_l:0.06,land:0.1};
const SFX_GAIN={missile:0.17,cannon:0.14,mines:0.27,shock:0.38,turbo:0.23,barrier:0.099,rockets:0.14,swarm:0.12,quake:0.34,bouncer:0.22,hunter:0.17,phase:0.32,decoy:0.2,emp:0.3,smoke:0.11,autopilot:0.084,overdrive:0.22,boost:0.14,pad:0.16,jump:0.16,lap:0.2,final:0.15,count:0.36,go:0.43,boom:0.85,wreck:0.61,hit_s:0.36,hit_l:0.36,wall:0.42,land:0.29,deny:0.13,low:0.13,shield_full:0.087,ammo_full:0.059,ui_ok:0.065,ui_move:0.15,ui_back:0.043};
const audio={ctx:null,on:store.get('hoverline.sound')!=='0',
  init(){if(this.ctx){if(!document.hidden&&this.ctx.resume)this.ctx.resume();return}try{const AC=window.AudioContext||window.webkitAudioContext;const c=this.ctx=new AC();
    this.main=c.createGain();this.main.gain.value=this.on?0.5:0;this.main.connect(c.destination);this.master=c.createGain();this.master.connect(this.main);this.musG=c.createGain();this.musG.connect(this.main);this.applyVol();
    const o1=c.createOscillator(),o2=c.createOscillator();o1.type='sawtooth';o2.type='square';const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=c.createGain();g.gain.value=0.05;
    o1.connect(f);o2.connect(f);f.connect(g);g.connect(this.master);o1.start();o2.start();Object.assign(this,{o1,o2,f,eg:g});
    const nb=c.createBuffer(1,c.sampleRate*0.6,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noise=nb;setTimeout(()=>{this.voice('');this.loadFx()},0)}catch(e){this.ctx=null}},
  engine(v,boost){if(!this.ctx)return;const t=this.ctx.currentTime,fr=38+v*0.85;this.o1.frequency.setTargetAtTime(fr,t,0.05);this.o2.frequency.setTargetAtTime(fr*0.502,t,0.05);this.f.frequency.setTargetAtTime(260+v*11+boost*900,t,0.08)},
  /* announcer lines, decoded on first use */
  voice(k){if(!this.ctx||!this.on||!annOn)return false;if(!this.vb){this.vb={};music.decodeVox.call(music,this.ctx,x=>x[0]==='v').then(v=>{this.vb=v});return false}
    const b=this.vb['v_'+k];if(!b)return false;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=b;g.gain.value=0.9;s.connect(g);g.connect(this.master);s.start();return true},
  blip(fr,dur,vol=0.18,type='square',to){if(!this.ctx)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(fr,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.02)},
  noiseHit(vol,freq,dur){if(!this.ctx||vol<0.01)return;const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;s.buffer=this.noise;g.gain.setValueAtTime(Math.min(0.7,vol),t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+dur+0.05)},
  hit(k){if(!this.sfx(k>0.45?'hit_l':'hit_s',0.15+k*0.6))this.noiseHit(0.15+k*0.6,900,0.25)},
  boom(vol){if(!this.sfx('boom',vol)){this.noiseHit(vol,180,0.55);this.blip(120,0.4,vol*0.4,'square',40)}},
  /* Sound effects (Prototype 32): CC0 recordings in SL.SFX, decoded once the sound starts; each falls back to its old synth
     sound until then (or if a file is missing). SFX_USE plays one recording for another at a different speed. */
  loadFx(){if(this.fx||!this.ctx)return;this.fx={};if(SL.SFX)music.decodeVox.call(music,this.ctx,()=>true,SL.SFX).then(v=>{this.fx=v})},
  sfx(k,vol=1,rate=1){if(!this.ctx||!this.fx||vol<0.01)return false;const u=SFX_USE[k],b=this.fx[u?u[0]:k];if(!b)return false;
    const c=this.ctx,t=c.currentTime;if(t-(this.fxT[k]||-1)<(SFX_GAP[k]||0.03))return true;this.fxT[k]=t;
    const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.playbackRate.value=rate*(u?u[1]:1);g.gain.value=Math.min(1,vol*(SFX_GAIN[k]||0.2));s.connect(g);g.connect(this.master);s.start();return true},
  fxT:{},land(k){if(!this.sfx('land',0.15+k*0.6))this.hit(k)},
  /* the "no": boost refused for want of shield, a weapon without the ammo for it */
  deny(){if(!this.sfx('deny')){this.blip(230,0.09,0.09,'square',200);setTimeout(()=>this.blip(150,0.16,0.09,'square',120),90)}},
  /* Strip charging: a soft tone that climbs as the bar fills (shield: warm, slow shimmer; ammo: brighter, faster ratchet). */
  charge(kind,frac){if(!this.ctx)return;const c=this.ctx,t=c.currentTime;
    if(!this.ch){if(!kind)return;const o=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain();
      f.type='lowpass';f.frequency.value=1800;g.gain.value=0;lg.gain.value=0;o2.type='sine';lfo.frequency.value=10;lfo.connect(lg);lg.connect(g.gain);o.connect(f);o2.connect(f);f.connect(g);g.connect(this.master);o.start();o2.start();lfo.start();this.ch={o,o2,f,g,lg,lfo,kind:null}}
    const C=this.ch;
    if(!kind){if(C.kind){C.kind=null;C.g.gain.cancelScheduledValues(t);C.g.gain.setTargetAtTime(0,t,0.04);C.lg.gain.setTargetAtTime(0,t,0.04)}return}
    const hp=kind==='hp',fr=(hp?196:294)*Math.pow(2,1.6*clamp(frac,0,1));C.o.frequency.setTargetAtTime(fr,t,0.06);C.o2.frequency.setTargetAtTime(fr*(hp?1.5:2.005),t,0.06);
    if(C.kind!==kind){C.kind=kind;C.o.type=hp?'triangle':'square';C.lfo.frequency.setValueAtTime(hp?9:17,t);C.f.frequency.setValueAtTime(hp?1600:1250,t);
      C.g.gain.cancelScheduledValues(t);C.g.gain.setTargetAtTime(hp?0.04:0.03,t,0.05);C.lg.gain.setTargetAtTime(hp?0.018:0.024,t,0.05)}},
  chime(hi){if(this.sfx(hi?'ammo_full':'shield_full'))return;this.blip(hi?1318:1046,0.14,0.07,'triangle');setTimeout(()=>this.blip(hi?1976:1568,0.3,0.07,'triangle'),90)},
  setOn(b){this.on=b;store.set('hoverline.sound',b?'1':'0');if(this.main)this.main.gain.value=b?0.5:0},
  /* volume sliders run 0–100; 80 is the old level, 100 is about 1.5× louder */
  volM:+(store.get('hoverline.volM')??80),volS:+(store.get('hoverline.volS')??80),
  applyVol(){const g=v=>Math.pow(v/80,2);if(this.musG)this.musG.gain.value=g(this.volM);if(this.master&&this.main)this.master.gain.value=g(this.volS)}};

