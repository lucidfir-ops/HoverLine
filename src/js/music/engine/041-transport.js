//# music/engine/041-transport.js: music: transport, scheduling 0.3 s ahead, race hooks (GO, finish, pause)
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- transport & race hooks ---- */
  ensure(){if(!audio.ctx)return;this.init();if(this.style!=='off'&&this.modeEff()==='songs'&&!this.soOn)this.soStart();if(audio.eg)audio.eg.gain.value=this.style==='off'?0.05:0.028;if(this.style==='off'){this.stop();return}
    if(!this.st)this.newTune();if(!this.timer){this.nextT=this.ctx.currentTime+0.08;this.pos=Math.ceil(this.pos/16)*16;this.timer=setInterval(()=>this.tick(),25)}},
  stop(){clearInterval(this.timer);this.timer=null;if(this.pgOn)this.pgStop();this.soStop()},
  /* Steady: the hook is stated, varied gently and brought back; no echoes of the old themes, and your driving only
     moves the filter and the hats. With Shuffle on, a new tune takes over at each breakdown, in either mode.
     Evolving: the original behaviour, where the tune mutates every few bars and reacts to boosts, hits and steering. */
  setEvo(b){this.evo=!!b;store.set('hoverline.mevo',b?'1':'0');if(this.dg){const t=this.ctx.currentTime;this.dg.gain.setTargetAtTime(b?0.45:0.3,t,0.1);this.dlyFb.gain.setTargetAtTime(b?0.36:0.3,t,0.1)}this.changed()},
  setStyle(s){if(s!==this.style)this.mlog('mstyle',{style:s,was:this.style});this.style=s;store.set('hoverline.music',s);if(s!=='off'&&this.st&&this.st.tp){if(!this.tSides().includes((TPL[this.st.tp-1]||{}).side))this.setState(this.freshTune());if(this.tSeed&&!this.pinned){const h=this.raceTune(0);this.raceHome={...h,mut:[...h.mut]}}}else if(s!=='off'&&this.st){const st=this.st,sy=s==='both'?st.style:s==='trance'?1:0,mx=s==='both'&&this.both==='blend'?1:0;
    if(sy!==st.style||mx!==(st.mx||0)){const side=libSide(st);st.style=sy;st.mx=mx;st.flav=(st.flav||0)%flavList(st).length;if(libSide(st)!==side)st.lib=0;
      if(this.base)Object.assign(this.base,{style:st.style,mx:st.mx,flav:st.flav,lib:st.lib});this.build();this.changed()}}this.ensure()},
  setBoth(b){if(b!==this.both)this.mlog('mstyle',{both:b,was:this.both});this.both=b;store.set('hoverline.mboth',b);if(this.style==='both')this.setStyle('both')},
  setMood(m){if(m==='results'&&this.mood!=='results')this.resT0=this.ctx?this.ctx.currentTime:null;this.mood=m;if(m==='menu'){this.tRotHome();this.pgWant()}if((m==='menu'||m==='listen')&&this.ctx){const now=this.ctx.currentTime;if(!(this.nextShuffle>now))this.nextShuffle=now+90}this.moodCut={menu:5200,count:3200,race:18000,pause:600,results:7500,listen:18000}[m]||18000;this.cutT=0;this.applyCut(m==='race'?0.25:0.4)},
  applyCut(tc=0.1){if(!this.ctx)return;const L=this.live;let f=this.moodCut*(1-(this.evo?0.92:0.4)*L.brake)*(this.mood==='race'?0.7+0.3*(1-L.rank):1);
    const O=this.cutOv,now=this.ctx.currentTime;if(O&&now>=O.t1)this.cutOv=null;else if(O&&this.mood!=='pause')f=O.f0*Math.pow(O.f1/O.f0,rmp(now+tc,O.t0,O.t1))*(1-0.4*L.brake);
    if(this.buildT0>=0)f=Math.min(f,2200*Math.pow(18000/2200,rmp(this.ctx.currentTime-this.buildT0,0,28)));
    f=Math.max(200,isFinite(f)?f:this.moodCut||18000);if(this.cutT&&Math.abs(f-this.cutT)<this.cutT*0.03)return;this.cutT=f;this.setCut(f,tc)},
  /* Linear ramps only on the master filter: steep exponential/target sweeps can destabilise a biquad. */
  /* The filter remembers its own last ramp, so a new ramp starts where the old one really is (reading the param's
     value lags in some browsers and means nothing before an offline render starts). */
  cutAt(now){const c=this.cutR;if(!c)return this.lp.frequency.value||this.moodCut;return now>=c.t1?c.f1:now<=c.t0?c.f0:c.f0+(c.f1-c.f0)*(now-c.t0)/(c.t1-c.t0)},
  setCut(f,time){const p=this.lp.frequency,now=this.ctx.currentTime,v=Math.max(50,this.cutAt(now));p.cancelScheduledValues(now);p.setValueAtTime(v,now);p.linearRampToValueAtTime(f,now+time);this.cutR={t0:now,t1:now+time,f0:v,f1:f};if(this.pgF){const q=this.pgF.frequency;q.cancelScheduledValues(now);q.setValueAtTime(v,now);q.linearRampToValueAtTime(f,now+time)}},
  cueRace(){this.rxReset();if(!this.st)return;this.tRotate();this.pgWant(true);
    this.gOff=0;this.raceK=0;this.rSeq=0;this.rPrevF=null;this.swT0=null;this.swPl=null;const h=!this.pinned&&this.raceHome||this.home||this.base;if(h){this.base={...h,mut:[...h.mut]};this.st={...h,mut:[...h.mut]};this.r=rng((packState(this.st)^Math.imul(packHi(this.st),0x01000193)^0x9E3779B9)>>>0);this.build();this.movement=0;this.changed()}
    this._final=false;this.finalPending=false;this.queue=[];this.revealAt=-1;this.themeChanged=false;this.amb.tonic=true;this.amb.left=0;this.cin=false;this.cutOv=null;this.rwDone=false;
    if(this.phase!=='ambient')this.want='ambient';if(this.style!=='off'&&!this.timer)this.ensure()},
  /* Count-in: the race music builds through the countdown and drops on GO. sec: seconds to GO. Without exact the
     countdown is fitted to whole bars and the seconds to GO are returned (the game counts down that long); with exact
     (a shared start in a room) as many whole bars as fit lead up to it. */
  countIn(sec,exact){if(!this.ctx||this.style==='off'||!this.st||!this.timer)return sec;
    const c=this.ctx,bd=60/this.bpm*4,lat=c.outputLatency||c.baseLatency||0,now=c.currentTime;let N,t0;
    if(exact){const tG=now+sec-lat;N=Math.max(0,Math.min(4,Math.floor((tG-now-0.05)/bd)));t0=tG-N*bd}
    else{N=Math.max(1,Math.min(4,Math.round(sec/bd)));t0=now+0.06;sec=t0+N*bd+lat-now}
    if(t0<now+0.02)return sec;
    this.swPl=null;this.swT0=null;this.nextT=t0;this.pos=Math.ceil(this.pos/16)*16;this.fxReset(t0);this.want=N?'pre':'drop';this.cinN=N;this.cin=true;this.cutOv=null;this.aheadUntil=t0+N*bd+3;this.pgCue(t0,N);this.soCue(t0+N*bd);return sec},
  go(){if(this.cin){this.cin=false;return}if(this.ctx&&this.timer)this.countIn(60/this.bpm*4)},
  /* Race music in the menu: carry on from wherever the groove is (a finished race left it in an endless drop), or
     start the build from the top if the ambient theme is playing. */
  listen(){if(!this.ctx||this.style==='off')return;if(this.pgOn)this.pgStop();this._final=false;this.finalPending=false;this.queue=[];this.swPl=null;
    if(this.want==='ambient'||(this.phase==='ambient'&&this.want!=='build'&&this.want!=='pre'&&this.want!=='drop')){if(this.timer)this.countIn(60/this.bpm*16);else this.go()}else if(this.sec&&this.sec[2]>999)this.sec[2]=this.sec[1]+4;
    this.setMood('listen')},
  toAmbient(){if(this.pgOn)this.pgStop();this.pgLate=false;this._final=false;this.finalPending=false;this.queue=[];this.swPl=null;this.buildT0=-1;this.cin=false;this.cutOv=null;if(this.phase!=='ambient'||this.want)this.want='ambient'},
  sense(l){Object.assign(this.live,l);this.rxSense();this.applyCut(0.12);if(this.dlyFb&&!!l.boost!==this.fbBoost){this.fbBoost=!!l.boost;const g=this.dlyFb.gain,now=this.ctx.currentTime;g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(this.evo?(l.boost?0.58:0.36):(l.boost?0.4:0.3),now+0.15)}},
  event(name){this.rxEv(name);const h={hit:0x51f15e,boost:0xb005,overtake:0x0ff,fire:0xf12e,brake:0xb2a4e}[name]||7;this.drift=(Math.imul(this.drift,1103515245)+h+this.pos)>>>0;
    if(this.ctx&&name==='hit'&&this.pgF&&(this.pgOn||this.soOn)){const f=this.pgF.frequency,t=this.ctx.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(Math.max(50,this.cutAt(t)),t);f.linearRampToValueAtTime(1100,t+0.05);f.linearRampToValueAtTime(this.moodCut,t+0.45)}
    if(!this.ctx||this.style==='off'||this.phase==='ambient'||this.pgOn||this.soOn)return;const t=this.ctx.currentTime;
    if(name==='hit'&&!this.evo){const f=this.lp.frequency;f.cancelScheduledValues(t);f.setValueAtTime(Math.max(50,this.cutAt(t)),t);f.linearRampToValueAtTime(1100,t+0.05);f.linearRampToValueAtTime(this.moodCut,t+0.45);this.cutR={t0:t+0.05,t1:t+0.45,f0:1100,f1:this.moodCut};this.cutT=this.moodCut}
    else if(name==='hit'){this.glitch=8;const f=this.lp.frequency;f.cancelScheduledValues(t);f.setValueAtTime(Math.max(50,this.cutAt(t)),t);f.linearRampToValueAtTime(260,t+0.1);f.setValueAtTime(260,t+0.5);f.linearRampToValueAtTime(this.moodCut,t+0.9);this.cutR={t0:t+0.5,t1:t+0.9,f0:260,f1:this.moodCut};this.cutT=this.moodCut;this.noiseHit(0.4,500,0.5)}
    else if(name==='boost'&&this.evo&&this.pos>=(this.boostNext||0)&&!(this.sec&&(this.sec[0]==='rise'||this.sec[0]==='rw'||this.sec[0]==='out'))){this.boostNext=this.pos+64;this.riser(t,0.9);if(!this.T&&this.pos>=(this.boostCr||0)){this.boostCr=this.pos+16*32;this.crash(t+0.9,0.12)}}
    else if(name==='overtake'&&this.sec&&['drop','b','a'].includes(this.sec[0])&&this.pos>=(this.fillNext||0)){this.fillAt=Math.floor(this.pos/16)+1;this.fillNext=this.pos+16*8}},
  /* Schedule 0.3 s ahead. If the page stalled (busy frame, background tab), skip the missed notes but keep counting bars,
     so the arrangement stays locked to the clock instead of drifting late. */
  tick(){const c=this.ctx;if(!this.st)return;if(this.soOn)return this.soTick();if(this.pgOn)return this.pgTick();let sd=60/this.bpm/4;const now=c.currentTime;
    if(this.nextT<now-0.05){let n=0;while(this.nextT<now-0.02&&n<128){if(this.pos%16===0){sd=this.barSd(sd);try{this.onBar(this.nextT,sd)}catch(e){}}this.nextT+=sd;this.advance();n++}if(this.nextT<now)this.nextT=now+0.02}
    const ahead=now<(this.aheadUntil||0)?0.6:0.4; /* further ahead through a count-in: the first race frames can stall */
    while(this.nextT<now+ahead){if(this.pos%16===0)sd=this.barSd(sd);try{this.play(this.nextT,sd)}catch(e){}this.nextT+=sd;this.advance()}},
  advance(){this.pos++},
  /* Songs: one <audio> element streams the files (nothing is decoded into memory) through the music volume and the same
     filter as Pregen. A song plays from the top at each GO and carries on through the results and the menus; at its
     end the next one starts. The live engine makes no music while a song plays. */
  soStart(next){if(!SONGS.ok||!this.ctx||this.style==='off'||this.modeEff()!=='songs')return;const c=this.ctx;
    if(!this.soEl){const el=this.soEl=new Audio();el.preload='auto';el.addEventListener('ended',()=>this.soStart('end'));el.addEventListener('error',()=>{if(this.soOn&&(this.soErr=(this.soErr||0)+1)<SONGS.list.length)this.soStart('error')});
      try{this.pgNodes();this.soNode=c.createMediaElementSource(el);this.soG=c.createGain();this.soG.gain.value=SONGS.gain;this.soNode.connect(this.soG);this.soG.connect(this.pgF)}catch(e){this.soNode=null;el.volume=Math.min(1,SONGS.gain)}
      document.addEventListener('visibilitychange',()=>{if(!this.soEl||!this.soOn)return;if(document.hidden)this.soEl.pause();else this.soEl.play().catch(()=>{})})}
    const el=this.soEl,n=SONGS.list.length;let i=+(store.get('hoverline.song')||0)%n;if(next||!this.soCur){const pv=this.soCur,pl=pv&&this.soOn?Math.round(el.currentTime*10)/10:undefined;if(this.soCur)i=(i+1)%n;store.set('hoverline.song',String(i));this.soCur=SONGS.list[i];el.src='songs/'+this.soCur.f;this.mlog('song',{f:this.soCur.f,why:next===true?'skip':next||'start',prev:pv?pv.f:undefined,played:pl})}
    if(this.soG){const g=this.soG.gain,t=c.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(SONGS.gain,t)}
    el.play().then(()=>{this.soErr=0}).catch(()=>{});this.soOn=true;const o=this.out.gain,t=c.currentTime;o.cancelScheduledValues(t);o.setValueAtTime(o.value,t);o.linearRampToValueAtTime(0,t+0.3);this.changed()},
  soStop(){if(!this.soOn)return;this.soOn=false;try{this.soEl.pause()}catch(e){}const c=this.ctx;if(c){const o=this.out.gain,t=c.currentTime;o.cancelScheduledValues(t);o.setValueAtTime(0,t);o.linearRampToValueAtTime(0.3,t+0.2);this.nextT=t+0.06;this.pos=Math.ceil(this.pos/16)*16}this.changed()},
  /* GO starts the next song: the one playing fades over the countdown */
  soCue(tGo){if(this.modeEff()!=='songs'||!SONGS.ok||!(this.mood==='count'||this.mood==='race'))return;if(!this.soOn)this.soStart();if(!this.soG||!this.soOn)return;const c=this.ctx,g=this.soG.gain,t=c.currentTime;
    g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(0,Math.max(t+0.3,tGo-0.4));clearTimeout(this.soTm);this.soTm=setTimeout(()=>{if(this.soOn&&this.modeEff()==='songs')this.soStart('go')},Math.max(0,(tGo-t)*1000-30))},
  soTick(){},

