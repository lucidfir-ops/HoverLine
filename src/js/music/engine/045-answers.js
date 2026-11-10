//# music/engine/045-answers.js: music: the answering voices (call and response)
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- the answering voices (call and response) ---- */
  respNote(m,t,dur,sd){const k=this.respK,B=this.bus.resp;
    if(k==='vox')return this.vox(m,t,Math.max(dur,sd*2));
    if(k==='stab'){for(const q of[m,m-5,m-12])this.saw(q,t,Math.min(dur,sd*2.5),{tag:'stab',voices:2,spread:14,cut:1500,env:3200,envT:0.07,a:0.003,rel:0.1,vol:0.04,rev:0.4,dly:0.35,dest:B});return}
    if(k==='reese')return this.saw(m-24,t,dur,{tag:'reese',voices:3,spread:26,cut:700,env:1100,envT:0.25,res:2,a:0.01,rel:0.08,vol:0.06,dest:this.dR});
    if(k==='pluck')return this.saw(m,t,Math.min(dur,0.3),{tag:'pluck',voices:1,cut:320,env:4200,envT:0.12,q:2,a:0.002,rel:0.12,vol:0.055,dly:0.5,rev:0.3,dest:B});
    if(k==='zap')return this.zap(m+12,t,dur);
    if(k==='chug'){if(this.gtr)return this.playS(this.gtr.m[((m%12)+12)%12],t,0.24,B,Math.min(dur,sd*1.6));for(const q of[m-12,m-5])this.saw(q,t,Math.min(dur,sd*1.6),{tag:'chug',voices:2,spread:8,cut:1300,env:900,envT:0.04,a:0.002,rel:0.02,vol:0.045,dest:this.gtrR})}},
  /* A sung "ah/oh/oo/eh": two detuned saws through two vowel formants, with vibrato that grows in. */
  vox(m,t,dur,dest){const c=this.ctx,V=[[730,1090],[570,840],[300,870],[660,1700]][Math.floor(this.pos/16)%4],g=c.createGain(),vol=0.22;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.04);g.gain.setValueAtTime(vol,t+Math.max(0.05,dur-0.1));g.gain.linearRampToValueAtTime(0,t+dur);
    g.connect(dest||this.bus.resp);this.send(g,this.rev,0.5);this.send(g,this.dly,0.2);
    const f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g2=c.createGain();f1.type='bandpass';f2.type='bandpass';f1.frequency.value=V[0];f2.frequency.value=V[1];f1.Q.value=5;f2.Q.value=7;g2.gain.value=0.55;f1.connect(g);f2.connect(g2);g2.connect(g);
    const f=mtof(m),lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5.3;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*0.012,t+Math.min(0.3,dur));lfo.connect(lg);lfo.start(t);lfo.stop(t+dur+0.05);
    for(let k=0;k<2;k++){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=k?8:-8;lg.connect(o.frequency);o.connect(f1);o.connect(f2);o.start(t);o.stop(t+dur+0.05);if(k)o.onended=()=>{try{g.disconnect();lg.disconnect()}catch(e){}}}},
  /* Electric piano (liquid): a sine carrier with a sine modulator whose depth falls away; velocity varies note to note. */
  ep(m,t,dur,v,dest){const c=this.ctx,f=mtof(m),car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain(),dec=Math.min(1.6,0.35+dur*1.2);
    mod.frequency.value=f;mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*0.15,t+0.25);mod.connect(mg);mg.connect(car.frequency);car.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.1*v,t+0.003);g.gain.exponentialRampToValueAtTime(0.001,t+dec);car.connect(g);g.connect(dest||this.bus.lead);this.send(g,this.rev,0.4);this.send(g,this.dly,0.2);
    car.start(t);mod.start(t);car.stop(t+dec+0.05);mod.stop(t+dec+0.05);car.onended=()=>{try{g.disconnect();mg.disconnect()}catch(e){}}},
  /* FM lead or bell: a sine carrier, a sine modulator at a ratio, the brightness falling away after the attack. */
  fmNote(m,t,dur,o){const c=this.ctx,f=mtof(m),car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain(),dec=Math.max(dur,o.dec*1.5);
    mod.frequency.value=f*o.ratio;mg.gain.setValueAtTime(f*o.index,t);mg.gain.exponentialRampToValueAtTime(f*o.index*0.15,t+o.dec);mod.connect(mg);mg.connect(car.frequency);car.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(o.vol,t+0.003);g.gain.setTargetAtTime(0,t+Math.min(dur,o.dec),o.dec/2);car.connect(g);g.connect(o.dest);if(o.rev)this.send(g,this.rev,o.rev);this.send(g,this.dly,0.25);
    car.start(t);mod.start(t);car.stop(t+dec+0.4);mod.stop(t+dec+0.4);car.onended=()=>{try{g.disconnect();mg.disconnect()}catch(e){}}},
  /* Dream piano: a few partials with a closing filter, layered with a soft pad, into a 3 s hall and a 1/8-triplet echo. */
  piano(m,t,dur,v){const c=this.ctx,f=mtof(m),g=c.createGain(),lp=c.createBiquadFilter(),dec=Math.min(2.4,0.7+dur*1.4);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.085*v,t+0.004);g.gain.exponentialRampToValueAtTime(0.001,t+dec);
    lp.type='lowpass';lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(1100,t+dec);lp.connect(g);g.connect(this.bus.keys);this.send(g,this.hall,0.55);if(this.dly8t)this.send(g,this.dly8t,0.25);
    for(const[h,a,ty]of[[1,1,'triangle'],[2,0.32,'sine'],[3,0.11,'sine'],[1.003,0.45,'sine']]){const o=c.createOscillator(),og=c.createGain();o.type=ty;o.frequency.value=f*h;og.gain.value=a;o.connect(og);og.connect(lp);o.start(t);o.stop(t+dec+0.05)}
    this.saw(m-12,t,Math.max(dur,0.8),{tag:'dpad',voices:2,spread:10,cut:900,a:0.3,rel:0.6,vol:0.016,hall:0.5,dest:this.bus.keys})},
  /* Psytrance zap: a square that dives an octave and a half while its filter closes. */
  zap(m,t,dur){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),f=mtof(m),d=Math.min(0.28,Math.max(0.12,dur));o.type='square';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f/3,t+d);
    lp.type='lowpass';lp.frequency.setValueAtTime(5000,t);lp.frequency.exponentialRampToValueAtTime(600,t+d);g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);
    o.connect(lp);lp.connect(g);g.connect(this.bus.resp);this.send(g,this.dly,0.4);o.start(t);o.stop(t+d+0.02)},
