//# music/engine/043-instrument-voices.js: music: playing an instrument note, sends, noise hits, vocal chops
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- instruments ---- */
  nz(t,dur){const s=this.ctx.createBufferSource();s.buffer=audio.noise;s.loop=true;s.start(t,Math.random()*0.4);s.stop(t+dur+0.05);s.onended=()=>{try{s.disconnect()}catch(e){}};return s},
  send(node,bus,amt){if(amt<=0||!bus)return;let m=this.sends.get(bus);if(!m)this.sends.set(bus,m=new Map());const key=Math.round(amt*1000);let g=m.get(key);if(!g){g=this.ctx.createGain();g.gain.value=amt;g.connect(bus);m.set(key,g)}node.connect(g)},
  /* Kick: a fast pitch drop and a noise click; short ones (metal, edits) are tighter and skip the sidechain pump. */
  kick(t,v=1,short=false){try{(this.kickQ||VFX.kick).push(t)}catch(e){}if(this.kit){const K=this.kit,mt=this.fk==='metal'&&K.km;this.playS(short?(mt?K.km:K.ks):this.fk==='psy'?K.kp:this.trR?K.kt:mt?K.km:K.kd,t,v*0.95,this.bus.kick);this.kickFx(t,short);return}
    const c=this.ctx,o=c.createOscillator(),g=c.createGain(),dec=short?0.17:0.42;
    o.frequency.setValueAtTime(short?220:195,t);o.frequency.exponentialRampToValueAtTime(short?62:46,t+(short?0.035:0.06));
    g.gain.setValueAtTime(v*0.95,t);g.gain.exponentialRampToValueAtTime(0.001,t+dec);o.connect(g);g.connect(this.bus.kick);o.start(t);o.stop(t+dec+0.02);
    const n=this.nz(t,0.03),hp=c.createBiquadFilter(),ng=c.createGain();hp.type='highpass';hp.frequency.value=2600;ng.gain.setValueAtTime((short?0.3:0.2)*v,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.014);n.connect(hp);hp.connect(ng);ng.connect(this.bus.kick);
    this.kickFx(t,short)},
  kickFx(t,short){if(!short){const dip=1-0.72*Math.min(1,this.lvT.kick||0);for(const p of[this.pump.gain,this.pumpB.gain]){p.cancelScheduledValues(t);p.setValueAtTime(dip,t);p.linearRampToValueAtTime(1,t+0.2)}this.duckLead(t,1)}},
  duckLead(t,k){if(!this.leadDuck)return;const q=this.pumpL.gain;q.cancelScheduledValues(t);q.setValueAtTime(1-this.leadDuck*k*Math.min(1,this.lvT.kick||0),t);q.linearRampToValueAtTime(1,t+0.17)},
  /* Snare: bright noise with a presence lift, a short pitched body and a little room. */
  snare(t,v=1){if(this.kit){const K=this.kit,ghost=v<0.35,b=ghost?K.sg:this.fk==='metal'&&K.sm?K.sm:(this.rr=!this.rr)?K.s1:this.fk==='brk'&&K.sb?K.sb:K.s2,g=this.playS(b,t,Math.min(1.1,ghost?v*1.6:v)*0.95,this.bus.snare);if(!ghost)this.send(g,this.rev,0.22);if(v>0.5)this.duckLead(t,0.7);return}
    const c=this.ctx,n=this.nz(t,0.28),hp=c.createBiquadFilter(),pk=c.createBiquadFilter(),g=c.createGain();hp.type='highpass';hp.frequency.value=1100;pk.type='peaking';pk.frequency.value=4800;pk.gain.value=5;pk.Q.value=1;
    g.gain.setValueAtTime(0.5*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);n.connect(hp);hp.connect(pk);pk.connect(g);g.connect(this.bus.snare);this.send(g,this.rev,0.28);
    const o=c.createOscillator(),og=c.createGain();o.type='triangle';o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(175,t+0.06);og.gain.setValueAtTime(0.42*v,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.1);o.connect(og);og.connect(this.bus.snare);o.start(t);o.stop(t+0.12);if(v>0.5)this.duckLead(t,0.7)},
  clap(t,v=0.6){if(this.kit){const g=this.playS(this.kit.cl,t,v*1.1,this.bus.snare);this.send(g,this.rev,0.3);return}const c=this.ctx;for(const[d,dec]of[[0,0.03],[0.011,0.03],[0.022,0.2]]){const n=this.nz(t+d,dec+0.02),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1300;f.Q.value=1.2;const g=c.createGain();g.gain.setValueAtTime(v*0.5,t+d);g.gain.exponentialRampToValueAtTime(0.001,t+d+dec);n.connect(f);f.connect(g);g.connect(this.bus.snare);if(dec>0.1)this.send(g,this.rev,0.35)}},
  hat(t,v=0.15,open=false){if(this.kit){this.playS(open?this.kit.ho:(this.hr=!this.hr)?this.kit.h1:this.kit.h2,t,v*1.9,this.bus.hat);return}const c=this.ctx,n=this.nz(t,open?0.3:0.06),f=c.createBiquadFilter();f.type='highpass';f.frequency.value=7200;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+(open?0.22:0.04));n.connect(f);f.connect(g);g.connect(this.bus.hat)},
  crash(t,v=0.22){if(this.kit){const g=this.playS(this.kit.cr,t,v*1.6,this.out);this.send(g,this.rev,0.4);return}const c=this.ctx,n=this.nz(t,1.8),f=c.createBiquadFilter();f.type='highpass';f.frequency.value=4200;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+1.7);n.connect(f);f.connect(g);g.connect(this.out);this.send(g,this.rev,0.4)},
  /* a vocal sample tuned to pitch class pc (the chops are sung at A3; the choir at C#4), kept within half an octave */
  /* an 808 cowbell: two square waves a fifth-and-a-bit apart, band-passed, a short decay, a lot of reverb */
  cowbell(m,t,dur,v){const c=this.ctx,f=mtof(m),bp=c.createBiquadFilter(),g=c.createGain(),d=Math.min(0.45,Math.max(0.12,dur));bp.type='bandpass';bp.frequency.value=f*1.25;bp.Q.value=1.6;
    for(const k of[1,1.4836]){const o=c.createOscillator();o.type='square';o.frequency.value=f*k;o.connect(bp);o.start(t);o.stop(t+d+0.05)}
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*0.32,t+0.002);g.gain.exponentialRampToValueAtTime(0.0008,t+d);bp.connect(g);g.connect(this.xKeys());this.send(g,this.rev,0.45);return g},
  /* the sampled instruments go through a high-pass, leaving the sub bass its own lane */
  xKeys(){if(!this.xhp){this.xhp=this.ctx.createBiquadFilter();this.xhp.type='highpass';this.xhp.frequency.value=160;this.xhp.Q.value=0.6;this.xhp.connect(this.bus.keys)}return this.xhp},
  instNote(kind,m,t,dur,v){const V=this.vbuf;if(!V)return null;const XI=INSTX[kind];if(XI&&XI.oct)m+=XI.oct;if(XI&&XI.synth)return this.cowbell(m,t,dur,v);const bases=kind==='pn'?[36,42,48,54,60,66,72]:kind==='hp'?[48,69]:XI?XI.b:[48,60,72];let b=bases[0];for(const x of bases)if(Math.abs(x-m)<Math.abs(b-m))b=x;
    const buf=V[(XI?'x_':'i_')+kind+'_'+b];if(!buf)return null;const g=this.playS(buf,t,v,XI?this.xKeys():this.bus.keys,Math.min(buf.duration,dur+0.35),Math.pow(2,(m-b)/12));this.send(g,this.hall,kind==='ep'?0.22:XI&&XI.send!=null?XI.send:0.35);if(kind==='ep'&&this.dly8t)this.send(g,this.dly8t,0.18);return g},
  sing(name,t,pc,v=0.5,base=9){const b=this.vbuf&&this.vbuf[name];if(!b)return;let d=((pc-base)%12+12)%12;if(d>6)d-=12;this.playS(b,t,v,this.voxG,0,Math.pow(2,d/12))},
  choir(t,tones,v=0.22){const b=this.vbuf&&this.vbuf.s_ch;if(!b)return;for(const m of tones){const g=this.playS(b,t,v,this.voxG,0,Math.pow(2,(m-61)/12));this.send(g,this.rev,0.6)}},
  fxS(name,t,v,dest){const b=this.vbuf&&this.vbuf[name];if(b)return this.playS(b,t,v,dest||this.out)},
  ride(t,v=0.4){if(this.kit&&this.kit.rd)this.playS(this.kit.rd,t,v,this.bus.hat)},
  tom(t,i,v=0.6){const b=this.kit&&this.kit['t'+i];if(b){const g=this.playS(b,t,v,this.bus.snare);this.send(g,this.rev,0.2)}else this.snare(t,v*0.8)},
  /* one hit of a build's snare roll: p is how far through the roll (0-1); level, pitch and reverb climb with it */
  rollHit(t,p){if(!this.kit)return this.snare(t,0.3+0.6*p);const K=this.kit,b=this.trR?K.s2:this.fk==='metal'&&K.sm?K.sm:K.s1;
    const g=this.playS(b,t,(0.22+0.78*p*p)*0.85,this.bus.snare,0,1+0.3*p);this.send(g,this.rev,Math.round((0.12+0.4*p)*10)/10)},
  /* the last beat of a phrase */
  fillHit(t,s,k,sd){const i=s-12;if(k==='flam'&&(this.fk==='brk'||this.fk==='dnb')&&this.vbuf&&this.vbuf.s_sc&&this.st.rng%3===0){if(i===0||i===2)this.fxS('s_sc',t,0.5,this.bus.snare);if(i===3)this.kick(t,0.9);return}if(k==='toms'){this.tom(t,[1,1,2,3][i],0.5+0.1*i);if(this.fk==='metal')this.kick(t,0.8,true)}
    else if(k==='flam'){if(i===0)this.snare(t,0.7);else if(i===2){this.snare(t,0.5);this.snare(t+sd*0.5,0.9)}else if(i===3)this.kick(t,0.9,this.fk==='metal')}
    else if(this.trR)this.clap(t,0.3+0.1*i);else this.snare(t,0.35+0.17*i)},
  /* a pitched sweep up, under the noise riser */
  uplift(t,dur){const c=this.ctx,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(1300,t+dur);
    f.type='bandpass';f.Q.value=2.5;f.frequency.setValueAtTime(500,t);f.frequency.exponentialRampToValueAtTime(4500,t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.03,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+0.02);
    o.connect(f);f.connect(g);g.connect(this.out);this.send(g,this.rev,0.4);o.start(t);o.stop(t+dur+0.05)},
  /* silence from t0 to t1 (everything but the effects input), a fade of fd seconds going in */
  gapAt(t0,t1,fd=0.008){const g=this.gapG.gain;g.cancelScheduledValues(t0);g.setValueAtTime(1,t0);g.linearRampToValueAtTime(0,t0+fd);g.setValueAtTime(0,t1-0.003);g.linearRampToValueAtTime(1,t1+0.002)},
  revCrash(tD){const b=this.kit&&this.kit.rc;if(!b)return;const t0=tD-b.duration;if(t0>this.ctx.currentTime+0.01)this.playS(b,t0,this.T?0.38:0.55,this.fxIn)},
  impact(t){if(this.kit&&this.kit.im)this.playS(this.kit.im,t,0.85,this.fxIn)},
  fxReset(t){if(!this.gapG)return;const g=this.gapG.gain,f=this.hp.frequency;g.cancelScheduledValues(t);g.setValueAtTime(1,t);f.cancelScheduledValues(t);f.setValueAtTime(10,t);this.cutOv=null},
  riser(t,dur,vol=0.3){const c=this.ctx,n=this.nz(t,dur),f=c.createBiquadFilter();f.type='bandpass';f.Q.value=2.5;f.frequency.setValueAtTime(250,t);f.frequency.linearRampToValueAtTime(8000,t+dur);
    const g=c.createGain();g.gain.setValueAtTime(0.001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur);g.gain.setValueAtTime(0,t+dur+0.01);n.connect(f);f.connect(g);g.connect(this.out);this.send(g,this.rev,0.3)},
  noiseHit(vol,freq,dur){if(!this.ctx||vol<0.01)return;const c=this.ctx,t=c.currentTime,s=this.nz(t,dur),g=c.createGain(),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;g.gain.setValueAtTime(Math.min(0.7,vol),t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.connect(f);f.connect(g);g.connect(this.out)},
  saw(m,t,dur,o){const c=this.ctx,vol=o.vol||0.05,a=o.a||0.004,rel=Math.min(o.rel||0.06,dur*0.5),voices=this.lite?Math.min(2,o.voices||1):o.voices||1,spread=o.spread||12,dest=o.dest||this.bus.pad;
    const flt=c.createBiquadFilter();flt.type='lowpass';flt.Q.value=o.q||Math.min(3,o.res||0.8);const fl2=o.lp24?c.createBiquadFilter():null;if(fl2){fl2.type='lowpass';fl2.Q.value=0.7}
    /* filter envelopes run at block rate (every 128 samples): per-sample coefficient updates are the costliest thing a note does */
    if(this.kr)for(const F of fl2?[flt,fl2]:[flt]){try{F.frequency.automationRate='k-rate';F.Q.automationRate='k-rate'}catch(e){}}
    for(const F of fl2?[flt,fl2]:[flt]){if(o.env){F.frequency.setValueAtTime(o.cut+o.env,t);F.frequency.linearRampToValueAtTime(o.cut,t+Math.min(dur,o.envT||0.2))}else F.frequency.setValueAtTime(o.cut||2000,t)}
    if(o.wob){const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=o.wob.rate;lg.gain.value=o.wob.depth;lf.connect(lg);lg.connect(flt.frequency);lf.start(t);lf.stop(t+dur+0.05)}
    const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.setValueAtTime(vol,t+Math.max(a,dur-rel));g.gain.linearRampToValueAtTime(0,t+dur);
    if(fl2){flt.connect(fl2);fl2.connect(g)}else flt.connect(g);g.connect(dest);if(o.rev)this.send(g,this.rev,o.rev);if(o.dly)this.send(g,this.dly,o.dly);if(o.d16&&this.dly16)this.send(g,this.dly16,o.d16);if(o.hall)this.send(g,this.hall,o.hall);if(o.d8t&&this.dly8t)this.send(g,this.dly8t,o.d8t);
    let lg=null;if(o.vib&&!this.lite){const lf=c.createOscillator();lg=c.createGain();lf.frequency.value=o.vib.rate;lg.gain.value=o.vib.depth;lf.connect(lg);lf.start(t);lf.stop(t+dur+0.05)}
    const f=mtof(m),pw=o.type==='square'&&o.tag==='lead'&&this.waves,wt=o.type==='fm'?'sine':o.type||'sawtooth';for(let k=0;k<voices;k++){const x=c.createOscillator();if(pw)x.setPeriodicWave(this.waves.pwm);else x.type=wt;if(lg)lg.connect(x.detune);
      if(o.from!=null&&o.glide){x.frequency.setValueAtTime(mtof(o.from),t);x.frequency.exponentialRampToValueAtTime(f,t+o.glide)}else if(o.pe){x.frequency.setValueAtTime(f*Math.pow(2,o.pe/12),t);x.frequency.exponentialRampToValueAtTime(f,t+(o.peT||0.02))}else x.frequency.value=f;x.detune.value=(voices>1?(k/(voices-1)-0.5)*2*spread:(o.det||0))+(this.lite?0:(Math.random()-0.5)*5);x.connect(flt);x.start(t);x.stop(t+dur+0.05);if(k===voices-1)x.onended=()=>{try{flt.disconnect();if(fl2)fl2.disconnect();g.disconnect()}catch(e){}}}
    if(o.sub){const x=c.createOscillator(),sg=c.createGain();x.type='sine';x.frequency.value=f/2;sg.gain.setValueAtTime(0,t);sg.gain.linearRampToValueAtTime(o.sub,t+0.01);sg.gain.setValueAtTime(o.sub,t+dur-0.03);sg.gain.linearRampToValueAtTime(0,t+dur);x.connect(sg);sg.connect(dest);x.start(t);x.stop(t+dur+0.05)}},
  stutter(t,sd){const m=this.lastLead;if(m!=null)for(let k=0;k<2;k++)this.saw(m,t+k*sd/2,sd*0.3,{tag:'stutter',type:'square',vol:0.03,cut:1800,dest:this.bus.lead});
    const c=this.ctx,n=this.nz(t,0.05),g=c.createGain();g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.04);n.connect(g);g.connect(this.out)},
