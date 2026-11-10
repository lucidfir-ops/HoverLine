//# music/engine/040-ambient.js: music: the beatless ambient menu music
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- ambient: a beatless chord walk with sparkles, wind and slow glimpses of the theme ---- */
  /* Menu shuffle: a fresh random tune every couple of minutes, never while racing or when you have loaded a code.
     In the ambient theme it changes on a chord change (the old chord's long release overlaps the new chord's slow
     attack, and the new melody arrives as distant bells); with race music on it changes at the start of a breakdown,
     so the next build and drop belong to the new tune. */
  wantShuffle(t){return this.shuffle&&!this.pinned&&this.style!=='off'&&(this.mood==='menu'||this.mood==='listen')&&this.nextShuffle>0&&t>=this.nextShuffle},
  /* Race shuffle: at each breakdown (about once a minute) the next tune of this track's sequence blends in, so the
     build and drop that follow belong to it. Seeded from the track, so everyone in a room hears the same tunes. */
  wantRaceBlend(){return this.shuffle&&!this.pinned&&this.style!=='off'&&(this.mood==='race'||this.mood==='results')},
  /* A race keeps its own tune. Every second breakdown (about every two minutes) it moves a step: first a new groove under a varied hook, then a
     sister tune (a new hook in the same key and style, with no answering voices or style influences), then home again. */
  blendRace(t){const k=this.raceK=(this.raceK||0)+1,H=this.home;if(!H)return;
    if(k%3===1){this.setState({...H,mut:[...H.mut]},true);this.gOff=1+(k>>1)%3;this.build();this.mutateNow()}
    else if(k%3===2){const r=rng((((this.tSeed||7)^0x5EED)+Math.imul(k,0x9E3779B1))>>>0||1),st=this.randomState(r,{style:H.style,mx:H.mx});
      Object.assign(st,{theme:H.theme,key:H.key,flav:H.flav,prog:H.prog,resp:0,lib:0,bp:0,kx:H.kx||0,kx2:H.kx2||0});this.setState(st,true)}
    else this.setState({...H,mut:[...H.mut]},true);this.mlog('tune',{why:['home','groove','sister'][k%3],code:this.code()})},
  blendNew(t){this.nextShuffle=t+90;this.setState(this.freshTune());this.amb.tonic=true},
  ambBar(t,sd){if(this.amb.left<=1&&this.wantShuffle(t))this.blendNew(t);
    const A=this.amb,bd=sd*16,key=this.st.key,minor=this.minor,sc=minor?SC.minor:SC.major;A.n++;
    if(A.n%16===1){A.dens=0.06+Math.random()*0.16;A.mode=Math.random()<0.35?'arp':'spark';A.tim=Math.floor(Math.random()*8)}
    if(--A.left<=0){const D=AMBDEG[minor?'minor':'major'];let deg;
      if(A.tonic||A.cc%4===3)deg=0;else{do deg=D[Math.floor(Math.random()*D.length)];while(deg===A.deg)}
      const bars=A.tonic?4:Math.random()<0.5?2:4;A.tonic=false;A.cc++;A.deg=deg;A.left=bars;
      const dur=bars*bd+1.8,TT=TIMBRES[A.tim],tn=chordOf(deg,sc),r0=36+((key+deg)%12+12)%12;
      for(const m of[r0+12,r0+19,r0+24+tn[1]-tn[0],r0+31])this.saw(m,t,dur,{tag:'apad',voices:2,spread:TT.ps,cut:Math.min(1600,TT.pc),a:1.6,rel:1.8,vol:0.026,rev:0.55,dest:this.bus.amb});
      this.saw(r0,t,dur,{tag:'sub',type:'sine',vol:0.05,cut:400,a:1.2,rel:1.6,dest:this.bus.amb});
      const V=this.vbuf;if(V&&!this.lite&&Math.random()<0.4){const PL=this.texR&&this.texR.pad.every(([k])=>V[k])?this.texR.pad:PADX,[pk,pr]=PL[(this.st.rng+A.cc)%PL.length],b=V[pk];if(b){let d=((r0-pr)%12+12)%12;if(d>6)d-=12;
        const g=this.playS(b,t,0.16,this.bus.amb,Math.min(b.duration*Math.pow(2,-d/12),dur),Math.pow(2,d/12));g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.16,t+0.6);this.send(g,this.rev,0.6)}}}
    if(A.n%4===2&&Math.random()<0.6)this.wind(t,bd*4);
    if(A.omen||(A.n%16===8&&Math.random()<0.5)){A.omen=false;this.omen(t,sd)}},
  sparkle(t,sd){const A=this.amb,P=PENT[this.minor?'minor':'major'];A.walk=Math.max(0,Math.min(9,A.walk+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)]));
    if(this.sparkI&&!this.lite&&Math.random()<0.55&&this.instNote(this.sparkI,64+this.st.key+P[A.walk%5]+12*Math.floor(A.walk/5),t,sd*4,0.2))return;
    this.saw(64+this.st.key+P[A.walk%5]+12*Math.floor(A.walk/5),t,sd*3,{tag:'spark',type:'triangle',vol:0.022,cut:5000,a:0.005,rel:0.2,dly:0.6,rev:0.6,dest:this.bus.tex})},
  wind(t,dur){const c=this.ctx,n=c.createBufferSource();n.buffer=this.wbuf;n.loop=true;n.start(t,Math.random()*2);n.stop(t+dur+0.05);n.onended=()=>{try{n.disconnect()}catch(e){}};
    const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=300+Math.random()*1400;f.Q.value=0.8;const g=c.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.05,t+dur/2);g.gain.linearRampToValueAtTime(0,t+dur);n.connect(f);f.connect(g);g.connect(this.bus.tex);this.send(g,this.rev,0.5)},
  /* The tune's own lead, thinned and played at half speed as distant bells: a preview of the race melody in the menu. */
  omen(t,sd){const ev=this.thin(this.variant,8).filter(e=>e.s<32),key=this.st.key;
    for(const e of ev)this.saw(72+key+e.p,t+e.s*2*sd,e.d*2*sd*0.9,{tag:'omen',type:'triangle',vol:0.022,cut:4000,a:0.01,rel:0.5,dly:0.5,rev:0.65,dest:this.bus.tex})},
  /* A faint echo of the theme: only the contour of 3 consecutive notes survives. Each note lands on a tone of the chord
     playing under it, lasts half a bar, in time, and sits low in the mix deep in the reverb. */
  quote(t,sd,hb){const ev=this.themeEv;if(!ev||ev.length<5)return;const r=Math.random,i0=Math.floor(r()*Math.max(1,ev.length-4)),frag=ev.slice(i0,i0+4);
    const key=this.st.key;let prev=null;
    frag.forEach((e,k)=>{const ch=this.chordAt(hb+(k>>1),(k&1)*8),tones=[];for(const tn of ch.tones)for(const o of[0,12])tones.push(((tn%12)+12)%12+o);
      const want=prev==null?tones[Math.floor(r()*3)]:prev+Math.sign(e.p-frag[k-1].p)*2;
      const p=tones.reduce((a,b)=>Math.abs(b-want)<Math.abs(a-want)?b:a);prev=p;
      this.saw(64+key+p,t+k*8*sd,8*sd*0.95,{tag:"echo",type:"sine",vol:0.016,cut:3000,a:0.12,rel:0.9,dly:0.6,rev:0.8,dest:this.bus.echo})});
    this.quoteUntil=this.pos+16*24},
  /* A short brass fanfare in the tune's key: ta-ta-ta-taaa and a held chord for a podium, a smaller figure otherwise.
     It plays on its own bus, past the mood filter, while the music ducks under it. */
  fanfare(place){const c=this.ctx;if(!c)return;const t=c.currentTime+0.06,key=this.st?this.st.key:0,root=53+((key+2)%12),win=place<=3;
    if(!this.fan){this.fan=c.createGain();this.fan.gain.value=1;this.fan.connect(this.comp)}
    const og=this.pgOn||this.soOn?this.pgD.gain:this.out.gain,o1=this.pgOn||this.soOn?1:0.3;og.cancelScheduledValues(t);og.setValueAtTime(og.value,t);og.linearRampToValueAtTime(o1/3,t+0.1);og.setValueAtTime(o1/3,t+3);og.linearRampToValueAtTime(o1,t+4.5);
    const b=0.13,brass=(m,t0,d,v)=>this.saw(m,t0,d,{voices:3,spread:9,type:'sawtooth',cut:1300,env:2600,envT:0.1,a:0.025,rel:Math.min(0.35,d*0.4),vol:v,rev:0.35,dest:this.fan});
    const timp=(t0,v)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(110,t0);o.frequency.exponentialRampToValueAtTime(48,t0+0.35);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+0.6);o.connect(g);g.connect(this.fan);o.start(t0);o.stop(t0+0.62)};
    if(win){const fig=[[0,0,1],[0,1,1],[0,2,1],[7,3,2],[4,5,1],[7,6,1],[12,7,7]];
      for(const[p,s0,l]of fig)brass(root+p,t+s0*b,l*b*0.92,0.05);
      for(const p of[0,4,7,12,16])brass(root+p-(p>12?12:0),t+7*b,1.9,0.034);brass(root-12,t+7*b,1.9,0.05);
      [0,3,5,7].forEach(k=>timp(t+k*b,0.35));timp(t+7*b,0.6);this.crashTo(t+7*b,0.2)}
    else{const fig=[[0,0,1],[3,1,1],[7,2,2],[5,4,1],[7,5,4]];for(const[p,s0,l]of fig)brass(root+p,t+s0*b*1.2,l*b*1.1,0.045);
      for(const p of[0,3,7])brass(root+p,t+5*b*1.2,1.3,0.028);timp(t,0.3);timp(t+5*b*1.2,0.4)}},
  crashTo(t,v){const c=this.ctx,n=this.nz(t,1.8),f=c.createBiquadFilter();f.type='highpass';f.frequency.value=4200;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+1.7);n.connect(f);f.connect(g);g.connect(this.fan)},
