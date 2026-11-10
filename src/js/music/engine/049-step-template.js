//# music/engine/049-step-template.js: music: one sixteenth of a template tune: drums, bass, chords, keys, lead, answers, fills (where most arrangement decisions are)
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- one sixteenth of a template tune ---- */
  playT(t,sd,s){const T=this.T,G=this.gate,st=this.st,key=st.key,ph=this.phase,stg=this.stage||{},hb=this.hb||0,V=this.vbuf;
    const S=this.sec||['build',this.pb,0],sec=ph==='build'?'build':S[0],bi=S[1],bl=S[2],full=sec==='drop',tt=s%2?t+this.swing*sd:t,ch=this.tChordAt(hb,s);
    /* Prototype 50, fx 'stop' (Stop and Slam, from Eric's System of a Down notes): the last bar of every eight in a drop or
       B section cuts dead halfway, six sixteenths of silence, then the slam back in */
    if(T.fx.includes('stop')&&ph==='groove'&&(sec==='drop'||sec==='b')&&bi%8===7&&s>=8&&s<14)return;
    if(ph==='groove'&&s===0&&bi===0&&full)this.tDn=(this.tDn||0)+1;
    if(ph==='groove'&&s===0&&bi===0&&full&&this.dropFx){this.dropFx=false;this.impact(t);if(T.f!=='techno'&&T.f!=='house'&&T.f!=='psy')this.tCrash(t,0.2);this.tDropFx(t,bl,key)}
    if(s===0&&this.fillAt===Math.floor(this.pos/16)-1)this.fillAt=-1;
    if(s===0&&ph==='groove')this.tTexBar(t,sd,sec,bi,bl,key,ch);
    if(this.glitch>0){this.glitch--;this.stutter(t,sd)}
    if(G.pad&&this.pos>=this.padUntil&&(s===0||(this.prog.length===8&&s===8)))this.tPad(t,sd,s,ch,sec,ph,key,hb);
    this.tDrums(tt,t,s,sd,sec,bi,bl,stg,ph);
    if(this.percL.length&&V&&!this.lite&&ph==='groove')this.tPerc(tt,s,sd,sec,hb,bi);
    if(G.bass&&(stg.bassFull||ph==='build'&&stg.bassFull)&&sec!=='brk'&&sec!=='out'&&sec!=='rise')this.tBassStep(tt,s,sd,ch,sec,bi,key,hb);
    this.tMel(tt,s,sd,ch,sec,bi,bl,stg,key,hb,ph)},
  tKickHit(t,v){try{(this.kickQ||VFX.kick).push(t)}catch(e){}const g=this.tDk('kick',t,v);if(g!==null)this.tDuck(t,v)},
  /* Sidechain (Prototype 45): every main kick ducks the bass, pads, lead and keys by the template's depth, with a
     2 ms attack and an exponential release (a quarter note for house and trance pumping). The value each duck starts
     from is worked out from the last one, so ducks overlap smoothly (no cancel-and-hold, which Firefox lacks). */
  tDuck(t,v){const S=this.tSC;if(!S||!S.length||!this.ctx||v<0.45)return;const k=Math.min(1,this.lvT.kick||0)*Math.min(1,v);if(k<0.05)return;const beat=60/this.bpm;
    for(const[nm,[d,rl]]of S){const node=this[nm];if(!node)continue;const g=node.gain,st=this.dkSt[nm]||(this.dkSt[nm]={t:-9,d:0,tau:1});
      const cur=t>st.t?1-st.d*Math.exp(-(t-st.t)/st.tau):1-st.d,dd=Math.max(0,Math.min(0.97,d*k)),tau=Math.max(0.006,(rl==='q'?beat*0.85:rl)/3),ta=t+0.002;
      if(dd<0.02)continue;g.cancelScheduledValues(t);g.setValueAtTime(Math.max(0.02,cur),t);g.linearRampToValueAtTime(1-dd,ta);g.setTargetAtTime(1,ta,tau);st.t=ta;st.d=dd;st.tau=tau}},
  /* the drums' sounds: the library kit (SMP) when it is loaded, else the embedded kit, with round robins either way
     (the embedded pieces alternate where a kit has two, and every hit is nudged a little in pitch and level) */
  tDkInit(){const K=this.kit||{},V=this.vbuf||{},T=this.T,L=(...a)=>a.filter(Boolean),kick=K[this.tKick]||K.kd;
    this.dkK=this.lite?null:MX.kitOf(T.dk);const S=MX.smp(),D=this.tD,KV=D.v||{},kv=T.kv?[T.kv]:[];
    /* each lane's library voices, best first: the template's or language's variant, the plain voice, then the shared
       hat and cymbal kits (their dark variants first: Eric found the bright ones sharp) */
    this.dkC={};if(this.dkK&&S&&!S.fallback){const own=(...v)=>v.filter(Boolean).map(x=>[this.dkK,x]),sh=(k,...v)=>S.kit(k)?v.map(x=>[k,x]):[];
      Object.assign(this.dkC,{kick:own(...kv,...(KV.kick||[]),'kick'),snare:own(...(KV.snare||[]),'snare'),ghost:[...own('ghost'),...own(...(KV.snare||[]),'snare')],clap:own(...(KV.clap||[]),'clap','snap'),
        rim:[...own('rim'),...own('perc_clave')],chh:[...own(...(KV.chh||[]),'chh'),...sh('hats','chh_dark','chh')],ohh:[...sh('hats',...(KV.ohh||['ohh_dark'])),...own('ohh')],ride:[...sh('cym','ride_dark'),...own('ride')],
        crash:[...sh('cym','crash_dark'),...own('crash')],shaker:[...own('shaker'),...sh('hats','shaker')],perc:[],tomH:own('tomH'),tomM:own('tomM','tomH'),tomL:own('tomL','tomM')})}
    this.dkF={kick:L(kick),snare:L(K.s1,K.s2),ghost:L(K.sg||K.s2),clap:L(K.cl),rim:L(K.sb),noise:L(K.nz),tomH:L(K.t1),tomM:L(K.t2),tomL:L(K.t3),chh:L(K.h1,K.h2),ohh:L(K.ho),ride:L(K.rd),
      crash:L(K.cr),shaker:L(V.i_sh1,V.i_sh2),perc:L(V[this.tUac])}},
  /* lane -> library voice, a level per voice (the Prototype 43 balance), the bus and reverb send */
  DKV:{kick:[0.95,'kick',0],snare:[0.95,'snare',0.22],ghost:[1,'snare',0],clap:[0.66,'snare',0.3],rim:[0.55,'snare',0.1],noise:[0.7,'snare',0],tomH:[1,'snare',0.2],tomM:[1,'snare',0.2],tomL:[1,'snare',0.2],
    chh:[0.7,'hat',0],ohh:[0.45,'hat',0.05],ride:[0.5,'cym',0.08],crash:[0.7,'out',0.4],shaker:[0.4,'hat',0.05],perc:[0.42,'hat',0.12]},
  tDk(pc,t,v){if(!(v>0))return null;const D=this.DKV[pc]||[0.6,'snare',0],cy=D[1]==='cym'&&this.cymF,bus=D[1]==='out'?this.out:cy?this.cymF:this.bus[D[1]==='cym'?'hat':D[1]],c=this.ctx;if(!bus||!c)return null;
    let buf=null,gain=1,on=0,rate=1;const S=this.dkK&&MX.smp();
    if(S&&!S.fallback){const C=this.dkC&&this.dkC[pc];if(C)for(const[k,vn]of C){const p=S.pick(k,vn,Math.min(1,v*(pc==='ghost'?0.6:1)),{strict:true});if(p&&p.buf){buf=p.buf;gain=p.gain;on=p.hit!=null?p.hit:p.on||0;break}}}
    if(!buf){const F=this.dkF&&this.dkF[pc];if(!F||!F.length)return pc==='ghost'?this.tDk('snare',t,v*0.5):null;
      const n=this.dkRR[pc]=(this.dkRR[pc]||0)+1,i=F.length>1?(n+Math.floor(hsh(this.pos,n)*(F.length-1)))%F.length:0;buf=F[i];rate=1+(hsh(n,this.pos+7)-0.5)*0.024}
    const lv=D[0]*v*(cy?1.75:1)*(1+(hsh(this.pos,pc.length*31+(this.dkRR[pc]||0))-0.5)*0.12),src=c.createBufferSource(),g=c.createGain();src.buffer=buf;if(rate!==1)src.playbackRate.value=rate;g.gain.value=lv*gain;
    src.connect(g);g.connect(bus);const t0=Math.max(c.currentTime,t-on);src.start(t0);
    if(pc==='ohh'){const L=this.tD.oLen||0.2;g.gain.setValueAtTime(lv*gain,t+L);g.gain.linearRampToValueAtTime(0,t+L+0.05);src.stop(t+L+0.07)}
    src.onended=()=>{try{g.disconnect()}catch(e){}};if(D[2])this.send(g,this.rev,pc==='clap'?this.tD.crev||D[2]:D[2]);
    if(this.tD.gate&&pc==='snare')this.send(g,this.gRev(),0.5);return g},
  /* an 80s gated reverb: a burst of dense noise that stops dead, as the impulse */
  gRev(){if(this.gR)return this.gR;const c=this.ctx,sr=c.sampleRate,n=Math.round(sr*0.24),b=c.createBuffer(2,n,sr),r=rng(4711);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){lp+=((r()*2-1)-lp)*0.35;d[i]=lp*(i<n-200?1:(n-i)/200)*0.25}}
    const cv=this.gR=c.createConvolver();cv.buffer=b;const g=c.createGain();g.gain.value=0.5;cv.connect(g);g.connect(this.out);return cv},
  tCrash(t,v){if(this.dkK&&this.tDk('crash',t,v*2.3)!==null)return;this.crash(t,v*0.85)},
  /* the drum pattern for a section, with its bar-by-bar variation */
  tSecP(sec,bi){const D=this.tD,k=sec==='build'||sec==='drop'||sec==='rise'?'main':sec==='b'?'b':sec==='a'||sec==='solo'?'a':sec==='sw'?'sw':sec==='drum'?'drum':null;if(!k||!D[k])return null;const V=D[k+'V'];return V?V[bi%4]:D[k]},
  tDrums(tt,t,s,sd,sec,bi,bl,stg,ph){const D=this.tD,G=this.gate,T=this.T;if(!this.kit)return;const P=this.tSecP(sec,bi),mt=D.mt||{},hm=D.hum||[0.05,1.5];
    const at=(L,base,v)=>{const j=(hsh(this.pos,L.charCodeAt(0))-0.5)*2*hm[1]/1000;return[base+(mt[L]||0)*sd+j,v*(1+(hsh(this.pos+97,L.charCodeAt(0))-0.5)*2*hm[0])]};
    /* a build: its groove until the last bars, then the snare roll (and quarter kicks) into the drop */
    if(sec==='rise'&&stg.roll){if(G.kick&&!stg.kickOff&&stg.kick4&&s%4===0)this.tKickHit(t,s===0?1:0.85);
      if(G.snare){const last=stg.rollBar===stg.R-1,p=(stg.rollBar*16+s)/(stg.R*16);if(!(last&&s>=14)){if(last&&s>=8){this.tRoll(t,p);this.tRoll(t+sd/2,p+0.02)}else if(s%stg.roll===0)this.tRoll(t,p)}}
      if(G.hat&&stg.hatDense&&P&&P.H&&P.H[s])this.tDk('chh',tt,P.H[s]*0.85);return}
    if(!P){if(sec==='out'&&G.hat&&s%4===2)this.tDk('chh',tt,0.17);return}
    const bk=P.B&&D.brk?this.tBrk():null,kv=ph==='build'?(stg.kickV||0):sec==='rise'?(stg.kickV||0.7):1;
    if(G.kick&&!stg.kickOff&&P.K&&P.K[s]&&(s===0||kv>0)){const[a,v]=at('K',t,P.K[s]*(s===0&&sec!=='rise'?1:kv)*(bk?0.7:1));this.tKickHit(a,Math.min(1,v))}
    if(bk&&G.snare)this.tBreak(tt,s,sd,sec,bi,P.B,stg,(P.lo?0.72:1)*(sec==='rise'?0.8:1));
    if(G.snare&&(stg.snareFull||ph!=='build'||s===12||s===8)){const sv=sec==='rise'?0.8:1;
      if(P.S&&P.S[s]){const[a,v]=at('S',tt,P.S[s]*sv);this.tDk(v<0.45?'ghost':'snare',a,v)}
      if(P.C&&P.C[s]){const[a,v]=at('C',tt,P.C[s]*sv);this.tDk('clap',a,v)}
      if(P.G&&P.G[s]){const[a,v]=at('G',tt,P.G[s]);this.tDk('ghost',a,v)}
      if(this.rA>1&&(P.S&&P.S[s]||P.C&&P.C[s])&&(sec==='drop'||sec==='b'))this.tDk('clap',tt+0.004,0.3)}
    if(G.hat){const hd=ph!=='build'||stg.hatDense;if(P.H&&P.H[s]&&hd){const[a,v]=at('H',tt,P.H[s]);this.tDk('chh',a,v)}else if(this.rA&&s%2===1&&hd&&!(P.H&&P.H[s]))this.tDk('chh',tt,0.2);
      if(P.O&&P.O[s]){const[a,v]=at('O',tt,P.O[s]);this.tDk('ohh',a,v)}if(P.R&&P.R[s]){const[a,v]=at('R',tt,P.R[s]);this.tDk('ride',a,v)}
      if(P.Z&&P.Z[s]&&hd){const[a,v]=at('Z',tt,P.Z[s]);this.tDk('shaker',a,v)}if(P.U&&P.U[s]){const[a,v]=at('U',tt,P.U[s]);this.tDk('perc',a,v)}}
    if(G.snare){if(P.P&&P.P[s]){const[a,v]=at('P',tt,P.P[s]);this.tDk('rim',a,v)}if(P.N&&P.N[s]&&!this.tClean)this.tDk('noise',tt,P.N[s]);if(P.T&&P.T[s])this.tDk(P.T[s]>0.45?'tomH':P.T[s]>0.35?'tomM':'tomL',tt,P.T[s])}
    if(stg.fillBar&&s>=12&&!bk&&G.snare)this.tFill(tt,s,sd)},
  /* a build's snare roll, a little under the old one so the drop lands harder than the build */
  tRoll(t,p){const g=this.tDk('snare',t,(0.18+0.55*p*p)*0.85);if(g&&this.rev)this.send(g,this.rev,Math.round((0.12+0.4*p)*10)/10)},
  tFill(t,s,sd){const f=this.tD.fill,i=s-12;if(f==='none')return;
    if(f==='clap'){this.tDk('clap',t,0.45+0.15*i);if(i>=2)this.tDk('clap',t+sd/2,0.5+0.15*i)}
    else if(f==='hats'){for(let k=0;k<(i>=2?3:2);k++)this.tDk('chh',t+k*sd/(i>=2?3:2),0.35+0.07*i)}
    else if(f==='hatroll'){if(i>=2)for(let k=0;k<2;k++)this.tDk('chh',t+k*sd/2,0.3+0.1*i+0.05*k)}
    else if(f==='toms'){this.tDk(['tomH','tomH','tomM','tomL'][i],t,0.55+0.1*i);if(i===3)this.tKickHit(t,0.85)}
    else if(f==='stutter'){if(i===0&&this.T.fx.includes('scratch')&&this.vbuf&&this.vbuf.s_sc)this.fxS('s_sc',t,0.45,this.bus.snare);else{this.tDk('snare',t,0.42+0.1*i);this.tDk('ghost',t+sd/2,0.3+0.1*i)}if(i===3)this.tKickHit(t,0.8)}
    else{this.tDk('snare',t,0.37+0.17*i)}},
  /* the break: the buffer for this template's tempo, re-edited bar by bar */
  tBrk(){const T=this.T,D=this.tD;if(!D||!D.brk)return null;
    if(D.brk==='arov'){const L='abde'[this.st.seed%4],k='arov'+L,V=this.vbuf;if(TCACHE.brk[k])return TCACHE.brk[k];const b=V&&V['x_lp_ar_'+L];if(!b)return null;
      /* a recorded loop (Arovane, two bars at 130 bpm): chopped on its own grid and played at the tune's tempo */
      const x=b.getChannelData(0),rb=new AudioBuffer({length:b.length,sampleRate:b.sampleRate,numberOfChannels:1}),y=rb.getChannelData(0);for(let i=0;i<x.length;i++)y[i]=x[x.length-1-i];
      return TCACHE.brk[k]={b,rb,sd:b.duration/32,n:32,rec:true}}
    return TCACHE.brk[D.brk+'|'+T.b+'|'+(T.kit||0)+'|'+(this.dkK||'')]||TCACHE.brk[D.brk+'|'+T.b+'|'+(T.kit||0)+'|']||null},
  tBreak(t,s,sd,sec,bi,mode,stg,lv){const B=this.tBrk();if(!B)return;const hb=this.hb||0;
    if(s===0||!this.tBq){const ed=Math.min(3,(this.T.ed||0)+mode-1),r=rng((Math.imul(this.st.seed+7,0x9E3779B1)^Math.imul(hb+1,2246822519)^(sec.length<<20))>>>0||1),base=(hb%4)*16,q=[];
      for(let i=0;i<16;i++)q.push({x:base+i,rt:1,rv:0,sub:0,on:1});
      const p=[0.12,0.3,0.5,0.85][ed],fillB=stg.fillBar||((hb%8)===7);
      const E={roll:()=>{const sub=ed>=2;for(let i=12;i<16;i++)Object.assign(q[i],{x:4,rt:1+0.06*(i-12),sub:sub?1:0})},rep:()=>{for(let i=8;i<12;i++)q[i].x=base+i-8},
        swap:()=>{const o=((hb+1)%4)*16;for(let i=0;i<8;i++)q[i].x=o+i},rev:()=>{q[12].rv=1;q[12].x=12;for(let i=13;i<16;i++)q[i].on=0},rush:()=>{q[14].x=0;q[15].x=0;q[15].rt=0.85},
        chop:()=>{const c=[8,9,10,8,9,10,8,9];for(let i=8;i<16;i++)q[i].x=base+c[i-8]},
        core:()=>{for(let i=0;i<16;i++){const x=r();if(x<0.3)q[i].sub=1;else if(x<0.45)q[i].rt=[0.5,0.75,1.5,2][Math.floor(r()*4)];else if(x<0.52)q[i].on=0;if(r()<0.35)q[i].x=Math.floor(r()*64)}},
        /* odd groupings (RACE 202): the bar re-cut in a cycle of seven or five sixteenths, the snare pitched up in its rolls */
        odd:()=>{const n=r()<0.5?7:5,o=Math.floor(r()*4)*16;for(let i=0;i<16;i++){q[i].x=o+(i%n);if(i>=12&&r()<0.5){q[i].sub=1;q[i].rt=1.5}}}};
      const ks=ed>=3?['core','roll','chop','rev','rush']:['roll','rep','swap','rev','rush','chop'];if(this.tD.odd)ks.push('odd','odd');
      if(fillB)E[ed>=3?'core':'roll']();else if(r()<p){E[ks[Math.floor(r()*ks.length)]]();if(ed>=2&&r()<p*0.6)E[ks[Math.floor(r()*ks.length)]]()}
      this.tBq=q}
    const e=this.tBq[s];if(!e||!e.on)return;const N=B.n||64,x=e.x%N,d=sd*(e.sub?0.5:1),v=(B.rec?0.3:0.62)*lv,B0=e.rv?B.rb:B.b,off=e.rv?(N-1-x)*B.sd:x*B.sd,rt=e.rt*(B.rec?B.sd/sd:1);
    const mt=(this.tD.mt&&this.tD.mt.B||0)*sd;this.slice(B0,t+mt,Math.max(0,off),d*(e.sub?1:1.02),rt,v,this.bus.snare);if(e.sub)this.slice(B0,t+d+mt,Math.max(0,off),d,rt*1.03,v*0.9,this.bus.snare)},
  /* percussion layers: the first layer in the A and solo sections, the second layer (when there is one) in the B and
     switch-up sections; in drops only where the template says (Prototype 46: pw 'all' through the drop, 'p45' in its
     second half, as Prototype 45 played the templates Eric asked to keep) */
  tPerc(t,s,sd,sec,hb,bi){const L=this.percL,V=this.vbuf;let PX=null;
    if(sec==='drop'){if(this.T.pw==='all'||this.T.pw==='p45'&&bi>=8)PX=L[0]}else if(sec==='b'||sec==='sw')PX=L[1]||L[0];else if(sec==='a'||sec==='solo'||sec==='drum')PX=L[0];if(!PX)return;
    const pv=this.T.pv||1;if(PX.loop){const b=V[PX.loop];if(b&&s%8===0){const bd=sd*16,rate=b.duration/bd,half=b.duration/2,off=s===0?0:(hb%4===3?0:half);this.slice(b,t,off,bd/2,rate,0.22*pv,this.bus.snare)}return}
    const e=PX.p[s];if(e)for(const[k,v]of e){const b=V[k];if(b){const g=this.playS(b,t+(hsh(this.pos,k.length)-0.5)*0.004,v*pv*(sec==='drop'?0.5:0.45)*(1+(hsh(this.pos,7)-0.5)*0.15),this.bus.hat,0,1+(hsh(this.pos,k.charCodeAt(2))-0.5)*0.02);this.send(g,this.rev,0.12)}}},
  tDropFx(t,bl,key){const T=this.T,V=this.vbuf;let d=((key)%12+12)%12;if(d>6)d-=12;
    if(T.fx.includes('subdrop')){if(V&&!this.lite&&V.x_bass_drop_c){const g=this.playS(V.x_bass_drop_c,t,0.42,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.1)}else this.saw(36+((key%12)+12)%12,t,0.7,{tag:'sub',type:'sine',vol:0.09,cut:300,from:48+((key%12)+12)%12,glide:0.6,a:0.005,rel:0.2,dest:this.bus.bass})}
    if(bl>999&&V&&!this.lite&&V.x_bass_drop_c&&!T.fx.includes('subdrop')){const g=this.playS(V.x_bass_drop_c,t,0.3,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.1)}
    if(T.fx.includes('gong')&&V&&V.x_gong&&!this.lite)this.texS('x_gong',t,0.22,'t');
    if(V&&!this.lite){if(this.bhit&&V[this.bhit[0]]){let e=((key-this.bhit[1])%12+12)%12;if(e>6)e-=12;const g=this.playS(V[this.bhit[0]],t,0.36,this.bus.bass,0,Math.pow(2,e/12));this.send(g,this.rev,0.12)}
      if(this.texR&&this.texR.drop&&V[this.texR.drop[0]])this.texS(this.texR.drop[0],t,this.texR.drop[1]*0.85,this.texR.drop[2]);
      if(T.fx.includes('bell')&&V.x_tb){const g=this.playS(V.x_tb,t,0.26,this.fxIn,0,Math.pow(2,d/12));this.send(g,this.hall,0.5)}}},
  /* Prototype 46: the pad was the "synth drone" Eric heard under nearly every drop. It holds under drops, B and A sections
     only in the templates he let keep it (pdd); elsewhere it plays in breakdowns, builds and solos, and not even there
     when the breakdown has keys to carry the chords */
  tPad(t,sd,s,ch,sec,ph,key,hb){const T=this.T,P=TPD[T.pd],steps=this.chordRun(hb,s);this.padUntil=this.pos+steps;const brk=sec==='brk'||sec==='out'||sec==='rise'||sec==='solo';
    if(!T.pdd&&(!brk||(sec==='brk'||sec==='out')&&this.tBkK()))return;const pv=brk?1:T.pdv||1;
    const Q=P||(brk?TPD[T.pdb||TPDB[T.f]||'dark']:null);if(!Q)return;const notes=ch.v?ch.v.slice():[...new Set(ch.tones.map(tn=>48+key+((tn%12)+12)%12))],dur=sd*steps+0.8,V=this.vbuf;
    /* in a breakdown the pad also holds the root, low but above the sub (the bass is out) */
    if(brk&&ch.v){const rp=((key+ch.deg)%12+12)%12;notes.push(48+rp)}
    const Y=MX.syn();if(Q.syn&&Y&&MX.hasSyn(Q.syn)&&!this.lite){try{Y.chord(Q.syn,t,notes,dur,(brk?0.8:0.68)*pv,{dest:this.bus.pad,eng:this});return}catch(e){}}
    if(Q.smp&&V&&!this.lite&&V[Q.smp[0]]){const b=V[Q.smp[0]];for(const m of notes){let dd=((m-60-Q.smp[1])%12+12)%12;if(dd>6)dd-=12;const g=this.playS(b,t,(brk?0.13:0.1)*pv*(notes.length>3?0.8:1),this.bus.pad,Math.min(b.duration*Math.pow(2,-dd/12),dur),Math.pow(2,dd/12));this.send(g,this.rev,0.5)}return}
    const lvl=pv*(P?1:0.6)*(notes.length>3?Math.sqrt(3/notes.length):1);for(const m of notes)this.saw(m,t,dur,{tag:'pad',vol:Q.vol*(brk?1.15:1)*lvl,voices:Q.voices,spread:Q.spread,cut:Q.cut*(brk?1.3:1)*(this.rE?1+0.25*this.rE:1),a:ph==='build'?0.8:Q.a,rel:Q.rel,rev:Q.rev,vib:Q.vib,dest:this.bus.pad})},
  /* the high-passes follow the section (Prototype 46): open in breakdowns, where the bass is out and the keys' left hand
     carries the low end */
  hpSec(t,n,bd){const open=n==='brk'||n==='out';for(const k of['pad','keys']){const h=this.hpF[k];if(!h)continue;const v=open?MHPB[k]:MHP[k],p=this.hpV[k];if(v===p)continue;
    h.frequency.setValueAtTime(p,t);h.frequency.linearRampToValueAtTime(v,t+bd*0.5);this.hpV[k]=v}},
  /* the instrument that plays a breakdown's chords (tBrkKeys), if any */
  tBkK(){const T=this.T;if(!T)return null;const K=T.kz||(T.li&&!TWIND.includes(T.li)&&(TSMP[T.li]||MX.hasSyn(T.li)&&['rhodes','fmbell'].includes(T.li))&&T.l!=='riff'?T.li:null);return K&&K!=='gtr'?K:null},
  /* a breakdown's wash (Eric liked it: "don't suddenly overdo it", "hopefully i don't start to hear it every track"): the
     first breakdown of a tune only, in half the tunes whose template has one (every tune of the three he heard it in) */
  tWash(){if(!this.T)return true;if(this.washN)return false;this.washN=1;const ok=!!this.T.wash||hsh(this.st.seed,0x3A5)<0.5;if(ok)this.mlog('wash',{tpl:this.T.id});return ok},
  tBassStep(t,s,sd,ch,sec,bi,key,hb){const T=this.T,BF=this.tBF,B=(sec==='b'||sec==='sw')&&this.tBassB?this.tBassB:this.tBass;if(!B)return;const ls=B.span>16?(hb%2)*16+s:s,es=B.at[ls];if(!es)return;
    const half=sec==='sw'&&T.side===0&&T.d!=='half';
    for(const e of es){if(half&&ls%8!==0)continue;const o={...this.tBP,tag:'bass',a:0.003,rel:0.03};const root=36+((key+ch.deg)%12+12)%12+(o.o||0);let m=root+(e[2]||0);
      if(BF[0]==='line'&&m>root+14)m-=12;if(e[3]){o.env=(o.env||0)*1.6;o.vol*=1.25}if(e[4]||o.glide){o.from=this.lastBass;o.glide=o.glide||0.05}
      if(o.wob&&BF[0]==='growl'){const rates=[1,1,2,1,1.5,1];o.wob={rate:T.b/60*rates[(ls+hb)%rates.length],depth:o.wob.depth}}
      const d=sd*(half?Math.max(e[1],4):e[1])*(o.len||0.9);
      /* metal's chugs: a palm-muted guitar on the root, an open power chord on the accents (library guitar or ours) */
      if(o.gtr){if(this.tGtr(m,t,d,e[5]?1:0,e[3]?1:0.85))continue}
      o.dest=o.d==='dN'?this.dN:o.d==='dB'?this.dB:this.bus.bass;this.bassNote(m,t,d,o);this.lastBass=m}},
  /* a melodic note on an instrument: a recording when loaded (and not Lite), otherwise its synth stand-in */
  tV(inst,m,t,dur,v,dest,sl){dest=dest||this.bus.lead;const V=this.vbuf;
    if(inst==='sitar'){const mr=Math.round(m),b0=mr-((mr-43)%2+2)%2,b=TCACHE.sitK===((this.st.key%12)+12)%12&&TCACHE.sit[b0],rt=Math.pow(2,(m-b0)/12);if(b&&!this.lite){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=b;
        if(sl){src.playbackRate.setValueAtTime(rt*Math.pow(2,sl/12),t);src.playbackRate.linearRampToValueAtTime(rt,t+Math.min(0.14,dur*0.45))}else src.playbackRate.value=rt;g.gain.setValueAtTime(v*0.5,t);g.gain.setValueAtTime(v*0.5,t+Math.min(b.duration,dur+0.6));g.gain.linearRampToValueAtTime(0,t+Math.min(b.duration,dur+0.6)+0.08);
        src.connect(g);g.connect(dest);this.send(g,this.rev,0.3);src.start(t);src.stop(t+Math.min(b.duration,dur+0.7));src.onended=()=>{try{g.disconnect()}catch(e){}};return g}inst=TFALL.sitar}
    const S=TSMP[inst];if(S){const b0=S[1].reduce((a,x)=>Math.abs(x-m)<Math.abs(a-m)?x:a,S[1][0]),buf=V&&!this.lite?V[S[0]+b0]:null;
      if(buf){const g=this.playS(buf,t,v*S[2],dest,Math.min(buf.duration,dur+0.35),Math.pow(2,(m-b0)/12));this.send(g,this.hall,S[3]);return g}inst=TFALL[inst]||'pluck'}
    return this.tSyn(inst,m,t,dur,v,dest,sl)},
  /* the synth voices (the Prototype 25-38 lead patches, plus cowbell, screech, horn, eurobeat lead, square, hoover, acid) */
  tSyn(P,m,t,dur,v,dest,sl){const prevL=this.lastLead;this.lastLead=m;if(SYN.P[P])return SYN.play(P,t,m,dur,v,{dest,from:prevL,bend:sl||0,eng:this});const o=(x)=>({tag:'lead',dest,...x,vol:x.vol*v});
    switch(P){case'clip':return this.saw(m,t,dur*0.9,o({voices:2,spread:10,cut:3600,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipD}));
    case'hsaw':return this.saw(m,t,dur*0.95,o({voices:7,spread:28,cut:5200,env:1500,envT:0.12,a:0.006,rel:0.1,vol:0.04,dly:0.3,rev:0.35}));
    case'stadium':return this.saw(m,t,dur*1.05+0.05,o({voices:6,spread:22,cut:4200,a:0.05,rel:0.3,vol:0.045,from:prevL,glide:0.06,dly:0.45,rev:0.55}));
    case'euro':return this.saw(m,t,Math.min(dur,this.sd2())*0.95,o({voices:2,spread:10,cut:900,env:2600,envT:0.13,q:3.5,lp24:true,a:0.002,rel:0.04,vol:0.07,dly:0.35,rev:0.3}));
    case'pluck':return this.saw(m,t,Math.min(dur,0.3),o({voices:2,spread:8,cut:600,env:3800,envT:0.12,q:1.6,a:0.002,rel:0.05,vol:0.065,dly:0.3,rev:0.25}));
    case'prog':return this.saw(m,t,Math.min(dur,0.35),o({voices:2,spread:10,cut:500,env:1200,envT:0.18,a:0.003,rel:0.08,vol:0.065,dly:0.45,rev:0.35}));
    case'fm':return this.fmNote(m,t,dur*0.95,{ratio:2,index:3,dec:0.35,vol:0.045*v,dest});
    case'bell':return this.fmNote(m,t,Math.max(0.5,dur),{ratio:3.5,index:4,dec:0.9,vol:0.031*v,rev:0.45,dest});
    case'fmpiano':return this.fmNote(m,t,Math.max(0.4,dur),{ratio:1,index:2.2,dec:0.6,vol:0.05*v,rev:0.35,dest});
    case'soft':return this.saw(m,t,dur*0.95,o({type:'triangle',voices:2,spread:6,cut:3200,vib:{rate:5.5,depth:12},a:0.01,rel:0.1,vol:0.058,dly:0.35,rev:0.35}));
    case'brass':return this.saw(m,t,dur*0.95,o({voices:3,spread:12,cut:1500,env:1200,envT:0.25,a:0.05,rel:0.15,vol:0.065,rev:0.3}));
    case'pwm':return this.saw(m,t,dur*0.95,o({type:'square',voices:2,spread:8,cut:3500,a:0.004,rel:0.06,vol:0.05,dly:0.3}));
    case'organ':this.saw(m+12,t,dur*0.95,o({type:'square',voices:1,cut:3000,vol:0.02}));return this.saw(m,t,dur*0.95,o({type:'square',voices:2,spread:8,cut:3500,a:0.004,rel:0.06,vol:0.04,dly:0.3}));
    case'glide':if(this.voicesOn&&this.vA)return this.mono(this.vA,m,t,dur*0.98,{vol:0.06*v,cal:1.65,voices:2,spread:10,cut:2600,env:1500,envT:0.12,k:0.4,glide:0.025,from:prevL,a:0.004,rel:0.06});
      return this.saw(m,t,dur,o({voices:4,spread:20,cut:3800,from:prevL,glide:0.025,a:0.01,rel:0.1,vol:0.045,dly:0.4,rev:0.4}));
    case'techstab':return this.saw(m,t,Math.min(dur,this.sd2())*0.9,o({voices:1,cut:600,env:3000,envT:0.08,q:6,a:0.002,rel:0.03,vol:0.02,dly:0.3,dest:this.clipL}));
    case'reso':return this.saw(m,t,dur*0.95,o({voices:2,spread:8,cut:900,env:2500,envT:0.2,q:5,lp24:true,a:0.003,rel:0.06,vol:0.04,dly:0.35}));
    case'cowbell':{const c=this.ctx,f=mtof(m),bp=c.createBiquadFilter(),g=c.createGain(),d=Math.min(0.45,Math.max(0.12,dur));bp.type='bandpass';bp.frequency.value=f*1.25;bp.Q.value=1.6;
      for(const k of[1,1.4836]){const x=c.createOscillator();x.type='square';x.frequency.value=f*k;x.connect(bp);x.start(t);x.stop(t+d+0.05)}
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*0.3,t+0.002);g.gain.exponentialRampToValueAtTime(0.0008,t+d);bp.connect(g);g.connect(dest);this.send(g,this.rev,0.45);return g}
    case'screech':{const c=this.ctx,f=mtof(m),bp=c.createBiquadFilter(),g=c.createGain(),x=c.createOscillator(),md=c.createOscillator(),mg=c.createGain();bp.type='bandpass';bp.Q.value=4;bp.frequency.setValueAtTime(900,t);bp.frequency.linearRampToValueAtTime(2600,t+Math.min(0.25,dur));
      x.type='sawtooth';x.frequency.value=f;md.frequency.value=f*1.5;mg.gain.value=f*1.6;md.connect(mg);mg.connect(x.frequency);x.connect(bp);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.09*v,t+0.01);g.gain.setValueAtTime(0.09*v,t+Math.max(0.02,dur-0.04));g.gain.linearRampToValueAtTime(0,t+dur);
      bp.connect(g);g.connect(this.clipL);x.start(t);md.start(t);x.stop(t+dur+0.05);md.stop(t+dur+0.05);x.onended=()=>{try{g.disconnect();mg.disconnect()}catch(e){}};return g}
    case'horn':return this.saw(m,t,Math.min(dur,0.22),o({voices:3,spread:14,cut:900,env:3400,envT:0.09,pe:3,peT:0.03,a:0.003,rel:0.06,vol:0.05,dly:0.2,dest:this.clipL}));
    case'eurolead':return this.saw(m,t,dur*0.95,o({voices:3,spread:12,cut:4600,env:1800,envT:0.1,a:0.004,rel:0.08,vol:0.05,dly:0.3,rev:0.3}));
    case'square':return this.saw(m,t,Math.min(dur,this.sd2()*2)*0.9,o({type:'square',voices:1,cut:4200,a:0.002,rel:0.03,vol:0.045,dly:0.25}));
    case'hoover':return this.saw(m,t,dur*0.95,o({voices:3,spread:45,cut:2200,env:900,envT:0.2,vib:{rate:7,depth:40},from:m+12,glide:0.05,a:0.005,rel:0.1,vol:0.05,rev:0.3}));
    case'acidl':if(this.voicesOn&&this.vA)return this.mono(this.vA,m,t,Math.min(dur,this.sd2())*0.9,{vol:0.09*v,cal:0.47,voices:1,cut:360,env:4200,envT:0.11,k:3.3,dr:2.4,glide:0,a:0.002,rel:0.03});
      return this.saw(m,t,Math.min(dur,this.sd2())*0.9,o({voices:1,cut:380,env:4200,envT:0.11,q:9,a:0.002,rel:0.03,dly:0.35,rev:0.2,vol:0.09}));
    case'pluck16':if(this.voicesOn&&this.vP)return this.mono(this.vP,m,t,dur*0.9,{vol:0.045*v,cal:0.85,voices:1,cut:420,env:5000,envT:0.12,k:1,a:0.002,rel:0.03});
      return this.saw(m,t,dur*0.9,o({voices:1,cut:280,env:3600,envT:0.12,q:1.8,a:0.002,rel:0.03,vol:0.045,dly:0.18}));
    case'arp12':this.saw(m,t,dur*0.85,o({type:'square',voices:1,cut:3200,env:1200,envT:0.05,a:0.002,rel:0.03,vol:0.02,d16:0.4}));return this.saw(m,t,dur*0.85,o({voices:1,cut:3200,env:1200,envT:0.05,a:0.002,rel:0.03,vol:0.02}));
    default:return this.saw(m,t,dur*0.95,o({voices:2,spread:10,cut:2600,env:1200,envT:0.12,a:0.004,rel:0.08,vol:0.05,dly:0.3,rev:0.3}))}},
  sd2(){return 60/this.bpm/2},
  /* where a melody sits: the instrument's range, centred on the line */
  tPitch(p,key,inst,R){const reg=TREG[inst]||TREGF[inst]||this.tReg||[60,79],c=(reg[0]+reg[1])/2,mid=R?(R[0]+R[1])/2:p,off=Math.round((c-(60+key+mid))/12)*12;let m=60+key+p+off;while(m<reg[0]-7)m+=12;while(m>reg[1]+7)m-=12;return m},
  tMel(t,s,sd,ch,sec,bi,bl,stg,key,hb,ph){const T=this.T,G=this.gate,role=T.l,reg=this.tReg,brk=sec==='brk'||sec==='out',lift=this.rE>1;
    if(brk&&(s===0||s===8&&this.prog.length===8)&&G.keys)this.tBrkKeys(t,sd,ch,bi,sec,key,s);
    /* Prototype 46: Hang Garden's hang breakbeat, a quiet background part, the rare "do do do" */
    if(T.hb&&G.lead)this.tHangStep(t,s,sd,ch,sec,bi,bl,key,hb);if(T.bg&&G.keys)this.tBg(t,s,sd,ch,sec,bi,key,hb);this.tDodo(t,s,sd,ch,sec,bi,key,hb);
    /* sirens: Siren Grid's are its signature; anywhere else one wail a tune, in its first breakdown */
    if(s===0&&ph==='groove'){const bd=sd*16,many=T.fx.includes('sirens');if(sec==='brk'&&bi===0){if((many||T.fx.includes('siren')&&!this.sirenN)){this.sirenN++;this.siren(t,bd*2,0)}if(T.fx.includes('dsiren'))this.siren(t,bd,1)}
      if(sec==='drop'&&bi===7&&bl===16){if(many)this.siren(t,bd*2,0);if(T.fx.includes('dsiren'))this.siren(t+sd*8,bd*0.5,1)}}
    if(sec==='rise'&&this.T.fx.includes('shout')&&stg.gapEnd!==undefined&&bl-bi===1&&s===0&&this.vbuf)this.sing(['c_herewego','c_letsgo',T.f==='hardcore'||T.f==='euro'?'c_faster':'c_letsgo'][(this.st.seed+hb)%3],t+4*sd,key,0.5);
    if(G.lead||G.resp||G.arp||G.keys){
      if(this.tHook&&(G.lead||G.resp)){const H=this.tHook,ls=(hb%(H.L/16))*16+s,es=H.at[ls];
        let mode=ph==='build'?(stg.bassFull?'thin':'off'):sec==='drop'?(bl>999&&bi>=4||lift&&bi>=4?'full':bi<4?'off':bi<8?'half':'full'):sec==='b'?(bi<8?'alt':'off'):sec==='a'?(T.kz&&TSMP[T.kz]?'keys':'half'):'off';
        /* a late lead (Midnight Wave: "came in later, quieter") waits out the first drop */
        if(T.late&&(this.tDn||0)<=1&&(sec==='drop'||ph==='build'))mode='off';
        if(es&&mode!=='off')for(const e of es){const inBar=e.s%64;if(mode==='half'&&inBar>=32)continue;if(mode==='thin'&&e.s%4!==0)continue;
          const inst=mode==='keys'?T.kz:mode==='alt'&&T.l2&&role!=='call'?T.l2:T.li,p=mode==='alt'&&!T.l2&&!T.mg&&inBar>=48?snap(e.p+(e.p>4?-2:2),this.scale):e.p,m=this.tPitch(p,key,inst,this.tHR),d=sd*(mode==='thin'?Math.max(e.d,4):e.d);
          if(role==='call'&&inBar>=32)continue;this.tVx(inst,m,t,d,mode==='thin'?0.6:mode==='keys'?0.8:1,mode==='keys'?this.xKeys():this.bus.lead)}
        if(this.tResp&&G.resp&&(sec==='drop'||sec==='b'||sec==='a')){const R=this.tResp,es2=R.at[(hb%4)*16+s];if(es2)for(const e of es2)this.tVx(T.l2,this.tPitch(e.p,key,T.l2,this.tHR),t,sd*e.d,0.9,this.bus.resp)}}
      if(this.tRiff&&G.lead){const R=this.tRiff,useB=sec==='b'||sec==='sw'||(sec==='drop'&&hb%4===3),go=sec==='drop'&&!(bi<4&&T.f!=='techno')||sec==='b'||sec==='sw'||(sec==='rise'&&bl-bi>4)||ph==='build'&&stg.bassFull;
        if(go&&!(role==='solo'&&sec!=='drop')){const ls=R.n>16?(hb%2)*16+s:s,es=(useB?R.B:R.A)[ls];if(es)for(const e of es){let p=e.p;if(R.fol){p=R.dg&&e.dg!=null?degP(this.scale,toDeg(this.scale,ch.deg)+e.dg):snap(p+ch.deg,this.scale)}const m=this.tPitch(p,key,T.li,this.tRR);
          this.tVx(T.li,m,t,sd*e.d,sec==='a'||sec==='rise'||ph==='build'?0.6:0.9,this.bus.lead,T.li==='sitar'&&e.d>=2&&(hb+ls)%3===0?-1:0)}}}
      if(role==='solo')this.tSoloStep(t,s,sd,sec,bi,bl,key,hb);
      if(this.tChop&&(G.lead||G.resp)&&this.vbuf&&!this.lite){const C=this.tChop;if((sec==='drop'&&bi>=4||sec==='b'&&bi<12)&&hb%2===0&&C.R.includes(s)){const w=C.w[(s>8?1:0)],tn=ch.tones,pc=((key+tn[(C.R.indexOf(s)+C.sh)%tn.length])%12+12)%12;this.sing(w,t,pc,0.36)}
        else if(brk&&bi%4===1&&s===0)this.sing(bi%8===1?'c_feel':'c_higher',t,key,0.36)}
      if(this.tStab&&G.lead){const R=sec==='b'?this.tStab.R2:this.tStab.R;if((sec==='drop'||sec==='b'||sec==='a'||sec==='sw')&&R.includes(s)&&!(sec==='a'&&s%4!==2)){const v=this.tVoice(ch,key,T.li);for(const m of v)this.tVx(T.li,m,t,sd*(T.li==='pn'||T.li==='or'?2:1.2),0.55*(v.length>3?0.85:1),this.bus.lead)}}
      /* keys comping: in the A and solo sections, and through drops and B sections for templates whose keys carry the tune */
      if(this.tComp&&G.keys&&T.kz&&(sec==='drop'||sec==='b'||sec==='a'||sec==='solo'||sec==='sw'&&T.kc)&&(role==='keys'||T.kc||sec==='a'||sec==='solo')){const C=this.tComp,R=sec==='b'?C.R2:C.R;
        if(R.includes(s)){const v=this.tVoice(ch,key,T.kz),long=C.k==='whole'||C.k==='half',d=long?(C.k==='whole'?14:7):C.k==='chug8'?1.6:(s===0?3:1.5);
          for(const m of v)this.tVx(T.kz,m,t,sd*d,(long?0.42:0.5)*(v.length>3?0.85:1),this.xKeys());
          if(long&&s===0){const rp=((key+ch.deg)%12+12)%12;this.tVx(T.kz,48+rp-(rp>7?12:0),t,sd*d,0.4,this.xKeys())}}
        if(role==='keys'&&sec==='drop'&&bi>=8&&hb%2===1&&(s===6||s===10||s===12)){const p=degP(this.scale,[4,3,2][[6,10,12].indexOf(s)]);this.tVx(T.kz,this.tPitch(p+12,key,T.kz,[0,12])+12,t,sd*2,0.55,this.xKeys())}}
      if((this.tArpP||this.tArpLine)&&G.arp&&sec!=='sw'){const lead=role==='arp',inst=lead?T.li:T.ai||(T.ar==='gallop'?'square':'pluck');
        /* an accompanying arpeggio on an instrument (guzheng, supersaw pluck) moves in eighths and rests under a drop's
           first half, so it never chatters under the melody (Prototype 46: and through the drop when there is a melody;
           any arpeggio that is not the lead rests in a drop's first half) */
        const acc=!lead&&!!T.ai,slow=brk||sec==='a'&&!lead,step=slow?(s%4===0):acc?(s%2===0&&!(sec==='drop'&&(bi<8||this.tHook||this.tRiff))):lead?!(T.arr&&sec==='drop'&&bi<8):!(sec==='drop'&&bi<8);if(step&&!(sec==='rise'&&bl-bi<=1)){let m=null;
          if(this.tArpLine){const L=this.tArpLine,e=L[this.pos%L.length],st0=MSTEP[((e%12)+12)%12]+7*Math.floor(e/12);m=this.tPitch(degShift(snap(ch.deg,this.scale),st0,this.scale)-12,key,inst,[-12,12])}
          else{const ix=this.tArpP[s];if(ix>=0){const tn=[...ch.tones.slice(0,3),ch.tones[0]+12];m=this.tPitch(tn[ix%4],key,inst,[0,14])}}
          if(m!=null)this.tVx(inst,m,t,sd*(slow?3:acc?2:1),lead?(slow?0.6:0.85):acc?0.45:0.5,this.bus.arp)}}}
    if(ph==='groove'&&(sec==='drop'||sec==='b')){if(T.fx.includes('zap')&&s%4===3&&(hb+s)%5===0)this.zap(72+key,t,sd*2);
      if(T.fx.includes('stutter')&&hb%4===3&&s===12&&this.lastLead!=null&&(this.st.seed+hb)%3===0)this.stutter(t,sd);if(T.fx.includes('glitch')&&s===14&&hb%2===1&&this.vbuf)this.fxS(hb%4===1?'s_g1':'s_g3',t,0.3,this.bus.snare)}},
  /* a quiet background part (Prototype 46), where Eric asked for something else in place of the drone, kept in the
     background (Iron Lung), or found for it (Melancholy Chaos): a pulse (the chord's top tone repeated in 3-3-2, his
     first sung example), a broken chord (low, high, middle, high in quarters: his second), or a slow counter-melody */
  tBg(t,s,sd,ch,sec,bi,key,hb){const B=this.T.bg;if(!(sec==='drop'||sec==='b'||sec==='a'||sec==='sw'))return;
    const v=(ch.v||[]).slice().sort((a,b)=>a-b);if(!v.length)return;const lo=B.lo||55,fit=m=>{while(m<lo)m+=12;while(m>lo+15)m-=12;return m},dest=this.xKeys(),lv=B.v||0.4;
    if(B.k==='pulse'){if(![0,3,6,8,11,14].includes(s))return;this.tVx(B.i,fit(v[v.length-1]),t,sd*1.6,lv*(s%8===0?1:0.75),dest);return}
    if(B.k==='broken'){if(s%4)return;const hi=v[Math.min(2,v.length-1)],n=[v[0],hi,v[1],hi][s/4|0];this.tVx(B.i,fit(n),t,sd*4,lv*(s===0?1:0.8),dest);return}
    /* a counter-melody in half notes: the chord tone nearest the last one, a step away where it can be (a guide-tone
       line: the second voice the atmospheric guide asks for, moving slowly against the hook) */
    if(B.k==='counter'){if(s%8)return;const pcs=new Set(ch.pcs.map(x=>((key+x)%12+12)%12)),p=this.bgP;let best=null,bs=1e9;
      for(let m=lo;m<=lo+12;m++){if(!pcs.has(m%12))continue;const sc=p==null?Math.abs(m-(lo+5)):Math.abs(m-p)+(m===p?1.5:0);if(sc<bs){bs=sc;best=m}}
      if(best!=null){this.tVx(B.i,best,t,sd*7.5,lv*(s?0.85:1),dest);this.bgP=best}}},
  /* the "do do do" (Eric: "we can have do do do as a special treat but only rarely", "might work if it was quieter and an
     instrument"): one chord tone pulsed in eighths, moving with the chords, on the template's keys or a pluck, quietly, in
     the second half of the first B section, where the melody rests; in one tune in twenty of those that may have it (well
     under once an hour of play) */
  tDodo(t,s,sd,ch,sec,bi,key,hb){if(sec!=='b'||bi<8){this.dodoOn=false;return}if(!this.dodoOK||s%2)return;
    if(s===0&&bi===8&&!this.dodoN){this.dodoN=1;this.dodoOn=true;this.mlog('dodo',{tpl:this.T.id})}if(!this.dodoOn)return;
    const v=(ch.v||[]).slice().sort((a,b)=>a-b);if(!v.length)return;let m=v[v.length-1];while(m<64)m+=12;while(m>76)m-=12;this.tVx(this.dodoI,m,t,sd*1.5,0.4*(s%8===0?1:0.8),this.xKeys())},
  /* Hang Garden (Prototype 46; Eric: "your breakcore drum programming played on the hang drum... that would be mental and
     might even be good"): the amen played on the hang. Its kicks are the hang's low note (the chord's root), its snares
     the high note (the fifth, the octave on the backbeat), its ghost snares a soft middle note (the third); each bar may
     be re-cut like a breakcore break: a 32nd roll climbing the scale into the next bar, a stutter of the bar's first
     beat, a rush. More edits in the B section, fewer in the A section */
  tHangStep(t,s,sd,ch,sec,bi,bl,key,hb){if(!(sec==='drop'||sec==='b'||sec==='sw'||sec==='a'||sec==='drum'))return;const P=TBRK.amen,bar=hb%4;
    if(s===0){const r=rng((Math.imul(this.st.seed+5,0x9E3779B1)^Math.imul(hb+3,0x85EBCA6B))>>>0||1),p=sec==='b'||sec==='drum'?0.75:sec==='a'?0.15:0.45;
      this.hgQ={e:r()<p?['roll','stut','rush','roll'][Math.floor(r()*4)]:null,up:r()<0.5}}
    const Q=this.hgQ||{},rp=((key+ch.deg)%12+12)%12,lo=48+rp+(rp>7?-12:0),PC=new Set(ch.pcs.map(x=>((key+x)%12+12)%12)),SC=new Set(this.scale.map(x=>(key+x)%12));
    const near=(m,set)=>{for(let o=0;o<12;o++){if(set.has(((m+o)%12+12)%12))return m+o;if(set.has(((m-o)%12+12)%12))return m-o}return m};
    const hi=near(lo+7,PC),mid=near(lo+3,PC),top=lo+12,dest=this.bus.lead,pv=c=>c==='.'?0:c==='X'?1:(+c)/10;
    if(Q.e==='roll'&&s>=12){for(let j=0;j<2;j++){const i=(s-12)*2+j;let m=top;if(Q.up){m=hi;for(let k=0;k<i;k++)m=near(m+1,SC)}this.tVx('hangB',m,t+j*sd/2,sd,0.32+0.06*i,dest)}return}
    if(Q.e==='rush'&&s>=14){this.tVx('hangB',mid,t,sd/2,0.45,dest);this.tVx('hangB',mid,t+sd/2,sd/2,0.5,dest);return}
    const k=Q.e==='stut'&&s>=8&&s<12?s-8:s,K=pv(P.K[bar][k]),S=pv(P.S[bar][k]);
    if(K)this.tVx('hangB',lo,t,sd*2,0.85*K,dest);
    if(S){if(S>=0.75)this.tVx('hangB',s%8===4?top:hi,t,sd*2,0.8*S,dest);else if(sec!=='a')this.tVx('hangB',mid,t,sd,0.55*S,dest)}},
  /* a chord voiced for an instrument: up to four tones in its range, each chord led smoothly from the last (power
     chords for industrial and metal) */
  tVoice(ch,key,inst){const reg=TREG[inst]||TREGF[inst]||[55,72],lo=Math.max(reg[0],inst==='gtr'?40:52),hi=lo+(inst==='gtr'?14:16);
    if(inst==='gtr'||ch.q==='5'){const rp=((key+ch.deg)%12+12)%12;let m=lo+((rp-lo)%12+12)%12;return[m,m+7]}
    if(!ch.ivs){const out=[];for(const tn of ch.tones.slice(0,3)){let m=48+key+tn;while(m<lo)m+=12;while(m>lo+14)m-=12;out.push(m)}return out}
    const C=this.tVk[inst]||(this.tVk[inst]={}),i=this.tCh.indexOf(ch);if(i>=0&&C[i])return C[i];
    const prev=C.last||null,v=tVoiceLead(ch.deg,ch.ivs,key,lo,hi,prev,ch.ivs.length>=5).slice(-4);C.last=v;if(i>=0)C[i]=v;return v},
  /* a breakdown's keys (Prototype 46): each chord struck when it arrives and held until the next one, the root below. In
     Prototype 45 a chord was struck every other bar and held 1.6 bars over the chord after it, which Eric heard in Rhodes
     Swing, Yah-Yah Funk and Velvet 120 as "headbutting the instrument at random" */
  tBrkKeys(t,sd,ch,bi,sec,key,s){const T=this.T,K=this.tBkK();if(!K)return;if(this.pos<(this.tBkU||0)&&!(bi===0&&!s))return;
    const run=this.chordRun(this.hb||0,s||0),d=sd*run+0.25;this.tBkU=this.pos+run;const v=this.tVoice(ch,key,K);
    for(const m of v)this.tVx(K,m,t,d,0.62*(v.length>3?0.85:1),this.xKeys());const rp=((key+ch.deg)%12+12)%12;this.tVx(K,36+rp+(rp>5?0:12),t,d,0.55,this.xKeys());
    if(sec==='brk'&&bi===0&&!s){if(T.fx.includes('choir'))this.choir(t,ch.tones.slice(0,3).map(x=>60+((key+x)%12+12)%12))}},
  /* the solo: written fresh at the start of each solo section and breakdown; licks in the B section */
  tSoloStep(t,s,sd,sec,bi,bl,key,hb){const T=this.T;if(!this.gate.lead)return;const want=sec==='solo'||sec==='brk'?sec:sec==='b'?'lick':null;if(!want)return;
    if(s===0&&(bi===0||this.tSoloK!==want)){const bars=Math.min(16,bl>999?8:Math.max(2,bl-bi)),reg=TREG[T.li]||TREGF[T.li]||[60,79],r=rng((Math.imul(this.st.seed+3,0x9E3779B1)^Math.imul(hb+11,0x85EBCA6B))>>>0||1);
      const ev=tSoloGen(r,{sc:this.scale,hs:this.hscale,roots:this.roots,key:((key%12)+12)%12,bars,lo:reg[0],hi:reg[1],slide:['sitar','sx','sl','glide','erhu','bansuri','guzheng'].includes(T.li),calm:want!=='solo',tn:this.tTn});
      this.tSoloAt=[];for(const e of ev)(this.tSoloAt[e.s]||(this.tSoloAt[e.s]=[])).push(e);this.tSoloH=hb;this.tSoloK=want}
    if(this.tSoloK!==want||!this.tSoloAt)return;const rb=hb-this.tSoloH;if(want==='lick'&&Math.floor(rb/2)%2===1)return;const es=this.tSoloAt[rb*16+s];if(!es)return;
    for(const e of es)this.tVx(T.li,e.p,t,sd*e.d,(e.v||0.8)*(want==='brk'?0.8:1),this.bus.lead,e.sl||0)},
  /* sirens: 0 an air-raid wail rising and falling, 1 a dub siren (a square swept by a fast triangle, into the echo) */
  siren(t,dur,kind){const c=this.ctx;if(!c)return;const g=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.value=kind?1400:1100;bp.connect(g);g.connect(this.fxIn);this.send(g,this.rev,0.5);if(kind)this.send(g,this.dly,0.45);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind?0.05:0.045,t+(kind?0.05:dur*0.3));g.gain.setValueAtTime(kind?0.05:0.045,t+dur*0.7);g.gain.linearRampToValueAtTime(0,t+dur);
    const os=[];for(const dt of kind?[0]:[-8,8]){const o=c.createOscillator();o.type=kind?'square':'sawtooth';o.detune.value=dt;os.push(o);o.connect(bp)}
    if(kind){const l=c.createOscillator(),lg=c.createGain();l.type='triangle';l.frequency.value=6;lg.gain.value=180;l.connect(lg);lg.connect(os[0].frequency);os[0].frequency.setValueAtTime(500,t);os[0].frequency.linearRampToValueAtTime(900,t+dur);l.start(t);l.stop(t+dur+0.05)}
    else for(const o of os){o.frequency.setValueAtTime(260,t);o.frequency.linearRampToValueAtTime(820,t+dur*0.45);o.frequency.linearRampToValueAtTime(240,t+dur)}
    for(const o of os){o.start(t);o.stop(t+dur+0.05)}os[os.length-1].onended=()=>{try{g.disconnect()}catch(e){}}},
  /* an instrument note, Prototype 45: the library's recorded instruments (hang, didgeridoo, guitar, bass), the library
     synths (through tV, which hands SYN names on), and when either is missing the nearest embedded sound */
  tVx(inst,m,t,dur,v,dest,sl){if(!inst||!this.ctx)return null;dest=dest||this.bus.lead;
    if(inst==='hangS'||inst==='hangB'||inst==='didg'||inst==='gtr'){const g=this.tSmpI(inst,m,t,dur,v,dest);if(g)return g;if(inst==='hangS'||inst==='hangB')inst='hang';else if(inst==='gtr')return this.tGtr(m,t,dur,1,v,dest);else return this.tDidg(m,t,dur,v,dest)}
    if(SYNFB[inst]!==undefined&&!MX.hasSyn(inst)){const f=SYNFB[inst];if(!f)return null;inst=f}
    if(inst==='cstab')return this.saw(m,t,Math.min(dur,0.26),{tag:'lead',voices:2,spread:9,cut:700,env:2600,envT:0.09,q:3.2,a:0.002,rel:0.05,vol:0.03*v,dly:0.16,rev:0.22,dest});
    if(inst==='riffsaw')return this.saw(m,t,dur*0.9,{tag:'lead',voices:3,spread:16,cut:1400,env:1300,envT:0.08,a:0.003,rel:0.05,vol:0.042*v,dly:0.18,dest:this.dB||dest});
    if(inst==='chip')inst='square';
    return this.tV(inst,m,t,dur,v,dest,sl)},
  /* a recorded library instrument (SMP.zone); null when it is not loaded */
  tSmpI(inst,m,t,dur,v,dest){const S=MX.smp(),n=MX.instOf(inst==='gtr'?'gtrl':inst);if(!S||!n||this.lite)return null;const z=S.zone(n,Math.round(m),Math.min(1,v));if(!z||!z.buf)return null;
    const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=z.buf;src.playbackRate.value=z.rate*Math.pow(2,(m-Math.round(m))/12);const lv=(inst==='didg'?0.5:inst==='gtr'?0.42:0.55)*v*z.gain,L=Math.min(z.buf.duration/z.rate,dur+(inst==='hangS'?1.6:inst==='hangB'?0.3:0.25));
    g.gain.setValueAtTime(lv,t);g.gain.setValueAtTime(lv,t+Math.max(0.01,L-0.06));g.gain.linearRampToValueAtTime(0,t+L);src.connect(g);g.connect(dest);src.start(Math.max(c.currentTime,t-(z.on||0)));src.stop(t+L+0.02);
    this.send(g,inst==='hangS'?this.hall:this.rev,inst==='hangS'?0.35:inst==='hangB'?0.1:0.18);src.onended=()=>{try{g.disconnect()}catch(e){}};return g},
  /* guitar: the library's when loaded (palm mute or power chord), else the plucked-string renders (power chords and
     palm mutes for every pitch class, Prototype 31's metal guitar) */
  tGtr(m,t,dur,open,v,dest){dest=dest||this.bus.bass;const S=MX.smp(),n=MX.instOf(open?'gtr':'gtrm')||MX.instOf('gtr');
    if(S&&n&&!this.lite){const z=S.zone(n,Math.round(m),open?0.9:0.6);if(z&&z.buf){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=z.buf;src.playbackRate.value=z.rate;const lv=(open?0.3:0.34)*(v||0.85)*z.gain,L=Math.min(z.buf.duration/z.rate,dur*(open?1:0.95)+0.02);
      g.gain.setValueAtTime(lv,t);g.gain.setValueAtTime(lv,t+Math.max(0.01,L-0.03));g.gain.linearRampToValueAtTime(0,t+L);src.connect(g);g.connect(dest);src.start(Math.max(c.currentTime,t-(z.on||0)));src.stop(t+L+0.02);src.onended=()=>{try{g.disconnect()}catch(e){}};return g}}
    if(!this.gtr)return null;const pc=((Math.round(m)%12)+12)%12,base=40+((pc-4+12)%12),rt=Math.pow(2,(Math.round(m)-base)/12),b=(open?this.gtr.o:this.gtr.m)[pc];if(!b)return null;
    return this.playS(b,t,(open?0.22:0.27)*(v||0.85),dest,Math.min(b.duration/rt,dur*(open?1:0.9)),rt)},
  /* the didgeridoo: the VCSL recording (it drones at about D2), tuned to the note and gated */
  tDidg(m,t,dur,v,dest){if(this.lite)return null;const S=MX.smp();if(S&&!S.fallback&&S.kit('didg')){const p=S.pick('didg',dur>1.2?'drone':'short',Math.min(1,v),{strict:true});
      if(p&&p.buf&&!p.fb){let d=m-(p.root||37.9);while(d>6)d-=12;while(d<-6)d+=12;const rt=Math.pow(2,d/12),L=Math.min(p.buf.duration/rt-(p.on||0),dur+0.15),c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=p.buf;src.playbackRate.value=rt;
        const lv=0.34*v*p.gain;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lv,t+0.04);g.gain.setValueAtTime(lv,t+Math.max(0.05,L-0.3));g.gain.linearRampToValueAtTime(0,t+L);src.connect(g);g.connect(dest||this.bus.pad);
        src.start(Math.max(c.currentTime,t-(p.on||0)/rt));src.stop(t+L+0.05);src.onended=()=>{try{g.disconnect()}catch(e){}};this.send(g,this.rev,0.25);return g}}
    const b=this.vbuf&&this.vbuf.x_didg;if(!b)return null;let d=m-36.8;while(d>6)d-=12;while(d<-6)d+=12;const rt=Math.pow(2,d/12),L=Math.min(b.duration/rt,dur+0.15);
    const g=this.playS(b,t,0.34*v,dest||this.bus.pad,L,rt);this.send(g,this.rev,0.25);return g},
  /* section textures (Prototype 45): the whoosh into breakdowns and solos (Eric: "cool sound, use that more"), the
     VCSL cymbal swell into drops, the didgeridoo and the hang drum in breakdowns, a tanpura under drone templates */
  tTexBar(t,sd,sec,bi,bl,key,ch){const T=this.T,V=this.vbuf,bd=sd*16;if(!V||this.lite)return;const left=bl-bi;
    if(sec==='rise'&&T.fx.includes('swell')&&left===2&&V.x_scresc){const L=Math.min(V.x_scresc.duration,TEXPK.x_scresc||3);this.texS('x_scresc',Math.max(t,t+2*bd-L),0.3)}
    if((sec==='solo'||sec==='drum')&&bi===0&&V.x_woosh)this.texS('x_woosh',t,0.3);
    /* a breakdown instrument (hand chimes, glockenspiel, harpsichord, xylophone, balafon...) climbs the chord every two bars */
    if(sec==='brk'&&T.bk&&bi%2===0){const v=(ch.v||[]).slice().sort((a,b)=>a-b),R=TREG[T.bk]||[60,84];if(v.length){const up=v.map(m=>{while(m<R[0])m+=12;while(m>R[1])m-=12;return m}).sort((a,b)=>a-b),seq=[...up,up[0]+12,up[1]+12];
      seq.forEach((m,i)=>this.tVx(T.bk,m,t+i*2*sd,sd*6,0.38+0.03*i,this.xKeys()))}}
    if(sec==='brk'&&bi===0&&T.fx.includes('didg')){const r0=36+((key+ch.deg)%12+12)%12;this.tVx('didg',r0,t,bd*Math.min(bl,4),0.8,this.bus.pad)}
    if(sec==='brk'&&T.fx.includes('hang')&&bi%2===0){const v=(ch.pcs||[0,3,7]).map(p=>{let m=57+((p-57)%12+12)%12;return m}).sort((a,b)=>a-b);[0,3,6,8,11].forEach((o,i)=>this.tVx('hangS',v[i%v.length]+(i>=3?12:0),t+o*sd,sd*4,0.55,this.bus.keys))}
    if(T.fx.includes('drone')&&(sec==='solo'||sec==='brk'||sec==='out')&&bi%4===0){const sa=36+((key%12)+12)%12,Y=MX.syn();
      if(Y&&MX.hasSyn('tanpura')){try{Y.play('tanpura',t,sa,bd*Math.min(4,bl-bi)+0.5,0.7,{dest:this.bus.pad,eng:this})}catch(e){}}
      else for(const m of[sa,sa+7,sa+12])this.saw(m,t,bd*Math.min(4,bl-bi)+0.5,{tag:'drone',voices:2,spread:6,cut:900,vol:0.02,a:0.8,rel:1,rev:0.5,dest:this.bus.pad})}this.tBolBar(t,sd,sec,bi,bl)},
  /* tabla bols (Prototype 46): a breakdown of a tune that has them grows to twelve bars. From its third bar: the call
     (the bols spoken when the recordings exist, otherwise the tabla lightly) for two bars, the tabla's answer for two, a
     bar's breath, then a second, different call and answer (a tihai, whose last Dha lands on the downbeat after). Through
     each answer the other parts all but stop (Eric: "almost a drum solo kinda thing with very little other noise"), and
     the tabla plays on its own bus: in Prototype 45 it went through the hat fader, at a fifth in breakdowns, and was
     far too quiet. tBolPlan runs at the bar line (onBar), before the faders move; tBolBar schedules each bar's strokes */
  tBolPlan(t){const S=this.sec;if(!S||this.bolQ||!this.bolOK||this.bolDone||S[0]!=='brk'||S[1]!==0||S[2]<8||this._final||this.phase!=='groove')return;
    const p1=this.bolPh||'theka',p2=p1==='tihai'?'kaida':'tihai',A=BOLP[p1].split(' '),B=BOLP[p2].split(' ');S[2]=Math.max(S[2],12);
    this.bolQ={b0:S[2]-10,P:[A,B],voc:[VBOL.ok(A),VBOL.ok(B)]};this.bolDone=true;this.bolAt=this.tuneN;this.mlog('bols',{phrases:[p1,p2],voice:this.bolQ.voc[0],tpl:this.T.id})},
  /* where the bols are in this bar: [round, part, bar of the part] */
  tBolAt(){const q=this.bolQ,S=this.sec;if(!q||!S||S[0]!=='brk')return null;const j=S[1]-q.b0;
    return j<0?null:j<2?[0,'call',j]:j<4?[0,'ans',j-2]:j===4?[0,'gap',0]:j<7?[1,'call',j-5]:j<9?[1,'ans',j-7]:j===9?[1,'tail',0]:null},
  /* the faders while the bols play (multiplied into the section's levels) */
  tBolDuck(){const a=this.tBolAt();if(!a)return null;const k=a[1];
    return k==='ans'?{amb:0,pad:0.1,tex:0,kick:0,snare:0,hat:0,bass:0,lead:0,arp:0,keys:0.08,resp:0,echo:0.15}:k==='tail'?{pad:0.6,keys:0.6,tex:0.5,arp:0.4}:{pad:0.45,keys:0.4,tex:0.3,arp:0.2,resp:0.3,hat:0.5}},
  tBolBar(t,sd,sec,bi,bl){const q=this.bolQ;if(!q)return;const a=this.tBolAt();if(!a){if(!this.sec||this.sec[0]!=='brk'||this.sec[1]-q.b0>9)this.bolQ=null;return}
    const[rd,k,j]=a,ph=q.P[rd],sam=ph[32]&&ph[32]!=='-'?ph[32]:null;
    if(k==='gap'||k==='tail'){if(sam&&k==='tail'||k==='gap'&&q.P[0][32]&&q.P[0][32]!=='-')this.tBol(k==='tail'?sam:q.P[0][32],t,sd,0);return}
    for(let s=0;s<16;s++){const g=j*16+s,c=ph[g];if(!c||c==='-')continue;this.tBol(c,t+s*sd,sd,k==='ans'?0:q.voc[rd]?2:1)}
    if(k==='ans'&&j===0&&sam)this.tBol(sam,t,sd,q.voc[rd]?2:1)},
  /* the bols' own bus (built once per audio context) */
  tBolBus(){if(!this.bolB||this.bolBc!==this.ctx){const g=this.ctx.createGain();g.gain.value=TBOLG;g.connect(this.out);this.bolB=g;this.bolBc=this.ctx}return this.bolB},
  /* one bol: spoken (2), the tabla's light call (1: the right hand only), or the full stroke(s) (0) */
  tBol(b,t,sd,mode){const V=this.vbuf,S=BOLS[b];if(!S||!V)return;
    if(mode===2){const B=VBOL.B[b];if(B){const g=this.playS(B,t,0.42*B.vg,this.bus.lead,Math.min(B.duration,sd*3));this.send(g,this.rev,0.15)}return}
    const k=this.bolK=(this.bolK||0)+1,SM=MX.smp(),lib=SM&&!SM.fallback&&SM.kit('tabla')?SM:null,dest=this.tBolBus();
    S.forEach(([vn,alt],i)=>{if(mode===1&&i>0)return;const L0=/^(ghe|dhe)/.test(vn)?0.36:/^(te|ke|re)/.test(vn)?0.24:0.32,lv=L0*(mode===1?0.5:0.8)*(1+(hsh(k,7)-0.5)*0.12);
      if(lib){const p=lib.pick('tabla',vn,mode===1?0.5:0.85,{strict:true,seq:'bol'+i});if(p&&p.buf&&!p.fb){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=p.buf;g.gain.value=lv*p.gain;src.connect(g);g.connect(dest);
        src.start(Math.max(c.currentTime,t+(hsh(this.pos+k,i)-0.5)*0.004-(p.hit!=null?p.hit:p.on||0)));src.onended=()=>{try{g.disconnect()}catch(e){}};this.send(g,this.rev,mode===1?0.25:0.12);return}}
      const av=alt.filter(n=>V['x_tabla_'+n]);if(!av.length)return;const g=this.playS(V['x_tabla_'+av[k%av.length]],t+(hsh(this.pos+k,i)-0.5)*0.004,lv,dest,0,1);this.send(g,this.rev,mode===1?0.25:0.12)})},
  /* Like (Prototype 45): marks the template; with "Likes steer the radio" on, similar templates come up more often */
  like(){if(!this.T)return null;const on=MLIKE.toggle(this.T.id);this.mlog('like',{code:this.code(),tpl:this.T.id,name:this.T.n,on});this.changed();return on},
  liked(){return!!(this.T&&MLIKE.liked(this.T.id))},
  dislike(){if(!this.T)return null;const on=MLIKE.dis(this.T.id);this.mlog('dislike',{code:this.code(),tpl:this.T.id,name:this.T.n,on});this.changed();return on},
  disliked(){return!!(this.T&&MLIKE.disliked(this.T.id))},
  tInfo(){const st=this.st,T=this.T;const R={none:'no lead',riff:'riff',hook:'hook',doc:"the guide's line as the hook",solo:'solo',arp:'arpeggios',chops:'vocal chops',stabs:'chord stabs',pad:'pads',keys:'keys',call:'call and response'}[T.l]||T.l;
    const I=x=>x?({pn:'grand piano',ep:'electric piano',up:'upright piano',hp:'harp',sitar:'sitar',sx:'tenor sax',sl:'saxello',cowbell:'808 cowbell',ka:'kalimba',vb:'vibraphone',mb:'marimba',st:'strumstick',cv:'clavisynth',or:'pipe organ',organ:'organ',screech:'screech',bell:'FM bell',brass:'brass',horn:'horn stabs',hsaw:'supersaw',stadium:'stadium supersaw',glide:'glide lead',clip:'clipped saw',pwm:'pulse lead',reso:'resonant stab',techstab:'drive stab',acidl:'acid',hoover:'hoover',square:'square lead',eurolead:'eurobeat lead',euro:'euro pluck',pluck:'pluck',pluck16:'16th pluck',prog:'progressive pluck',soft:'soft lead',arp12:'square-saw',xy:'xylophone',hm:'hand chimes',
      anthem:'supersaw',eurobrass:'eurobeat brass',hardcore:'hardcore supersaw',sawpluck:'supersaw pluck',smooth:'smooth lead',tb303:'303',rhodes:'rhodes',fmbell:'FM bell',fmbrass:'FM brass',fmstab:'FM stab',guzheng:'guzheng',erhu:'erhu',bansuri:'bansuri',hangS:'hang drum',hangB:'hang drum',didg:'didgeridoo',gtr:'guitar',chip:'chiptune square',cstab:'clean stab',riffsaw:'saw riff'}[x]||x):'';
    const gn=(T.gn||[T.f]).map(g=>(GENRES.find(x=>x[0]===g)||[0,g])[1]).join(' + ');
    return`${T.n} · ${T.sub} · ${KEYS[st.key]} ${{minor:'minor',harm:'harmonic minor',dorian:'dorian',phryg:'phrygian',phrdom:'phrygian dominant',major:'major',mixo:'mixolydian',yu:'minor pentatonic',gong:'major pentatonic',bhairav:'bhairav'}[T.m]} · ${Math.round(this.bpm)} bpm · ${R}${T.li&&T.l!=='none'&&T.l!=='chops'?' on '+I(T.li):''}${T.l2?' and '+I(T.l2):''}${T.kz&&T.kz!==T.li?' · '+I(T.kz)+' chords':''} · ${gn} · template ${T.id} of ${TPL.length}${T.ret?' (retired)':''}`},
  play(t,sd){const s=this.pos%16;if(s===0)this.onBar(t,sd);if(this.pgOn||this.soOn)return;
    const G=this.gate,st=this.st,ph=this.phase,key=st.key,fk=this.fk,tr=this.trR,tm=this.trM,psy=fk==='psy',metal=fk==='metal',brk=fk==='brk';
    if(G.tex){if(s%2===0&&Math.random()<this.amb.dens*(ph==='ambient'?1:this.evo&&!this.T?0.5:0))this.sparkle(t,sd);
      if(ph==='ambient'&&this.amb.mode==='arp'&&s%4===0){const A=this.amb,tn=chordOf(A.deg,this.minor?SC.minor:SC.major),i=Math.floor(this.pos/4)%4;
        this.saw(60+((key+A.deg)%12)+[0,tn[1]-tn[0],7,12][i],t,sd*3,{tag:'aarp',type:'triangle',vol:0.018,cut:3000,a:0.01,rel:0.15,dly:0.55,rev:0.4,dest:this.bus.tex})}}
    if(ph==='ambient')return;if(this.T)return this.playT(t,sd,s);
    if(this.vbuf&&!this.lite&&ph==='groove'&&this.sec&&(this.sec[0]==='a'||this.sec[0]==='b'||this.sec[0]==='drop')){const V=this.vbuf;
      if(this.shk&&V.i_sh1&&(tr||s%2===0))this.playS((s>>1)%2?V.i_sh2:V.i_sh1,t,(s%4===2?0.16:0.1),this.bus.hat);
      if(this.clapS&&V.i_cl1&&(s===4||s===12)){const g=this.playS(s===4?V.i_cl1:V.i_cl2,t,0.3,this.bus.snare);this.send(g,this.rev,0.22)}
      const PX=this.percX;if(PX){if(PX.loop){const b=V[PX.loop];if(b&&s%8===0){const bd=sd*16,rate=b.duration/bd,hb=this.hb||0,half=b.duration/2;
          /* the break stretched to the bar; every fourth bar its first half twice, and now and then the second half first */
          const off=s===0?(hb%8===7&&Math.random()<0.5?half:0):(hb%4===3?0:half);this.slice(b,t,off,bd/2,rate,0.26,this.bus.snare)}}
        else{const e=PX.p[s];if(e)for(const[k,v]of e){const b=V[k];if(b){const g=this.playS(b,t,v*(this.sec[0]==='drop'?0.6:0.48),this.bus.hat);this.send(g,this.rev,0.12)}}}}}
    const T=this.timbre,Gr=this.groove,L=this.live,hb=this.hb,stg=this.stage,ab=Math.floor(this.pos/16);
    const[sec,bi,bl]=this.sec||['build',this.pb,0],full=sec==='drop',busy=ph==='groove'&&(full||sec==='b');
    if(ph==='groove'&&s===0&&(bi===0&&(full||sec==='a'||sec==='b'||sec==='sw')||bi>0&&bi%(this.rA>1?8:16)===0&&(full||sec==='b')))this.crash(t,bi===0&&full?0.24:0.15);
    if(ph==='groove'&&s===0&&bi===0&&full&&this.dropFx){this.dropFx=false;this.impact(t);
      /* a bass hit in the key under the drop, and in some trance tunes a tubular bell */
      const V=this.vbuf;if(V&&!this.lite){if(this.bhit&&V[this.bhit[0]]){let d=((key-this.bhit[1])%12+12)%12;if(d>6)d-=12;const g=this.playS(V[this.bhit[0]],t,0.42,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.15)}
        if(bl>999&&V.x_bass_drop_c){let d=((key-0)%12+12)%12;if(d>6)d-=12;const g=this.playS(V.x_bass_drop_c,t,0.5,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.1)}
        if(this.texR&&this.texR.drop)this.texS(this.texR.drop[0],t,this.texR.drop[1],this.texR.drop[2]);
        if(this.bell&&V.x_tb){let d=((key-0)%12+12)%12;if(d>6)d-=12;const g=this.playS(V.x_tb,t,0.3,this.fxIn,0,Math.pow(2,d/12));this.send(g,this.hall,0.5)}}}
    if(metal&&full&&s===0&&bi%2===1)this.crash(t,0.1);
    if(s===0&&this.fillAt===ab-1){this.crash(t,0.14);this.fillAt=-1}
    if(this.glitch>0){this.glitch--;this.stutter(t,sd)}
    /* breakcore edits: at the end of every other bar in the busy sections, a snare roll in 32nds, a kick stutter or a lead stutter */
    if(s===0)this.edit=null;if(brk&&busy&&s===12&&hb%2===1){const x=Math.random();this.edit=x<0.45?'roll':x<0.7?'kick':x<0.9?'stut':null}
    if(this.edit==='stut'&&(s===12||s===14)){this.stutter(t,sd);if(s===12)this.fxS(this.pos%32<16?'s_g1':'s_g3',t,0.35,this.bus.snare)}
    const ch=this.chordAt(hb,s);
    if(G.pad&&this.pos>=this.padUntil&&(s===0||(this.prog.length===8&&s===8))){const steps=this.chordRun(hb,s),notes=new Set(ch.tones.map(tn=>48+key+((tn%12)+12)%12));
      if(L.rank>0.65&&!this.pw)notes.add(48+key+((ch.deg+10)%12));this.padUntil=this.pos+steps;
      if(ph==='build'&&(this.lvT.bass||0)<0.5)this.saw(36+((key+ch.deg)%12+12)%12,t,sd*steps+0.8,{tag:'sub',type:'sine',vol:0.05,cut:400,a:0.6,rel:0.8,dest:this.bus.pad});
      for(const m of notes)this.saw(m,t,sd*steps+0.8,{tag:'pad',vol:sec==='brk'?0.036:0.03,voices:T.pv,spread:T.ps,cut:(sec==='brk'?T.pc*1.5:T.pc)*(this.rE?1+0.25*this.rE:1),a:ph==='build'?0.8:0.35,rel:0.5,rev:T.rev+0.15,dest:this.bus.pad})}
    if(G.kick&&!stg.kickOff&&(s===0||stg.kickV>0)){
      if(stg.kick4){if(s%4===0)this.kick(t,s===0?1:0.85,metal)}
      else if(stg.half){if(s===0||s===10)this.kick(t,1,metal)}
      else{const on=Gr.k.includes(s)&&!(Gr.dk&&!full&&s%2===1),ek=this.edit==='kick'&&s>=12;
        if(on||ek)this.kick(t,s===0?1:ek?0.75:stg.kickV*(Gr.dk&&s%2===1?0.8:1),metal||ek)}}
    if(G.snare){
      if(stg.roll){const last=stg.rollBar===stg.R-1,p=(stg.rollBar*16+s)/(stg.R*16);
        if(!(last&&s>=14)){if(last&&s>=8){this.rollHit(t,p);this.rollHit(t+sd/2,p+0.02)}else if(s%stg.roll===0)this.rollHit(t,p)}}
      else if(stg.half){if(s===8)this.snare(t);else if(s===14||s===3)this.snare(t,0.2)}
      else if(tr){if(!stg.noClap&&Gr.c.includes(s)&&(stg.snareFull||s===12))this.clap(t,psy?0.45:0.6)}
      else{if(Gr.s.includes(s)&&(stg.snareFull||s===12||s===8))this.snare(t);if((full||brk||this.rA&&sec!=='rise')&&Gr.g.includes(s))this.snare(t,brk?0.22:0.2)}
      if(this.edit==='roll'&&s>=12){const v=0.25+0.12*(s-12);this.snare(t,v);this.snare(t+sd/2,v+0.06)}
      else if(this.fillAt===ab){if(s>=8)this.snare(t,0.3+(s-8)*0.08)}else if(stg.fillBar&&s>=12)this.fillHit(t,s,this.fillK||'snare',sd)}
    if(this.rA&&ph==='groove')this.rxHits(t,s,sec,stg,Gr,tr,metal,ch,key,sd,hb);
    if(G.hat){const hv=(0.6+0.6*L.speed)*(tr?1.5:1),oh=Gr.oh.includes(s)||(this.evo&&L.boost&&s%2===0);
      if(!stg.hatDense){if(s%4===2)this.hat(t,0.12*hv,tr)}
      else if(tr){if(oh)this.hat(t,0.16*hv,true);else if((Gr.h>=1||this.rA)&&s%2===1)this.hat(t,0.06*hv);if((Gr.h>=2||this.rA)&&s%2===0&&!oh)this.hat(t,0.08*hv)}
      else{if(oh&&!stg.ride)this.hat(t,0.15*hv,true);else if(s%2===0)this.hat(t,(s%4===2?0.17:0.09)*hv);else if(Gr.h>=2||full||this.rA)this.hat(t,0.05*hv)}
      if(stg.ride&&s%4===0)this.ride(t,s%8===0?0.36:0.26)}
    if(G.bass&&this.bpBass){const ls=this.bpLen>16?(hb%2)*16+s:s,e=this.bpBass[ls];if(e&&(stg.bassFull||ls%8===0)){const m=36+((key+ch.deg)%12+12)%12+e.p,BP=BASSP[this.bp.patch];
        if(BP){const o={tag:'bass',a:0.003,rel:0.03,...BP(this.bpm)};if(tr)o.cal*=0.5;o.dest=o.dest==='dN'?this.dN:this.dB;if(o.glide){o.from=this.lastBass}this.bassNote(m,t,sd*e.d*(o.len||0.9),o)}
        else if(this.bp.patch==='neuro')this.bassNote(m,t,sd*e.d*0.95,{cal:0.95,tag:'neuro',voices:3,spread:30,cut:420,wob:{rate:this.bpm/60*2,depth:650},res:2.5,a:0.004,rel:0.03,vol:0.075,sub:e.p===0?0.14:0,dest:this.dN});
        else{this.bassNote(m,t,sd*e.d*0.8,{cal:0.5,tag:'jump',voices:1,cut:700,env:1500,envT:0.07,res:1.6,from:this.lastBass,glide:0.04,a:0.002,rel:0.02,vol:0.1,sub:e.p<12?0.14:0,dest:this.dB})}
        this.lastBass=m}}
    else if(G.bass){const bm=36+((key+ch.deg)%12+12)%12,cut=T.bc*(0.55+0.45*(this.lvT.bass||0));
      for(const[bs,blen,bo]of this.bassPat)if(bs===s&&(stg.bassFull||bs===0||bs===8)){
        if(psy)this.bassNote(bm+bo*12,t,sd*(this.psyTight?0.5:0.62),{cal:0.8,tag:'bass',vol:0.34,voices:1,cut:Math.min(cut,420),env:1700,envT:0.05,q:2.6,rel:0.02,dest:this.bus.bass});
        else if(tr)this.bassNote(bm+12+bo*12,t,sd*blen*0.85,{cal:1.1,tag:'bass',vol:0.085,voices:2,spread:8,cut,env:1600,envT:0.08,res:T.br*0.6,dest:this.bus.bass});
        else if(metal){const pm=blen<2;if(this.gtr)this.playS((pm?this.gtr.m:this.gtr.o)[((key+ch.deg)%12+12)%12],t,(pm?0.27:0.22)*(1+0.08*this.rA),this.bus.bass,sd*blen*(pm?0.9:0.98));else for(const q of[bm+12,bm+19])this.saw(q+bo*12,t,sd*blen*(pm?0.7:0.95),{tag:'gtr',voices:2,spread:9,cut:pm?900:2600,env:pm?500:900,envT:0.05,a:0.002,rel:0.02,vol:0.05,dest:this.gtrB});
          if(bs%4===0)this.saw(bm,t,sd*Math.max(2,blen),{tag:'bass',type:'sine',vol:0.08,cut:300,a:0.004,rel:0.05,dest:this.bus.bass})}
        else this.bassNote(bm+bo*12,t,sd*blen*0.95,{cal:0.71,tag:'bass',vol:0.075,voices:brk?2:3,spread:brk?18:22,cut,env:900,envT:0.3,res:T.br,sub:bo?0:0.16,rel:0.03,dest:this.dB})}}
    if(G.lead&&this.leadEv&&!(stg.gapEnd&&s>=14)){const ls=(hb%4)*16+s,ghost=this.leadGrid>1,echo=this.echo,k0=echo?this.prevKey:key,cr=!!this.respK&&!ghost&&!echo,P=ghost||echo?null:this.leadPatch,gate=tm&&!psy&&!(P==='stadium'||P==='epiano'||P==='euro'||P==='glide'||P==='pluck'||P==='prog'||P==='bell'||P==='fm'||P==='techstab');
      for(const e of this.leadEv)if(e.s===ls||(!ghost&&gate&&e.d>=4&&ls>e.s&&ls<e.s+e.d&&(ls-e.s)%2===0)){if(this.leadMode==='call'&&e.v===1)continue;const m=60+k0+e.p+(this.lOct||0);
        if(cr&&e.v===1){if(e.s===ls)this.respNote(m,t,sd*e.d*0.95,sd);continue}
        if(this.keysI&&sec==='a'&&this.vbuf&&!this.lite&&!ghost&&this.instNote(this.keysI,m,t,sd*e.d,0.46))continue;
        const prevL=this.lastLead;this.lastLead=m;
        if(P==='clip')this.saw(m,t,sd*e.d*0.9,{tag:'lead',voices:2,spread:10,cut:3600,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipD});
        else if(P==='hsaw')this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:7,spread:28,cut:5200,env:1500,envT:0.12,a:0.006,rel:0.1,vol:0.04,dly:0.3,rev:0.35,dest:this.bus.lead});
        else if(P==='epiano')this.ep(m,t,sd*e.d,0.75+Math.random()*0.35);
        else if(P==='stadium')this.saw(m,t,sd*e.d*1.05+0.05,{tag:'lead',voices:6,spread:22,cut:4200,a:0.05,rel:0.3,vol:0.045,from:prevL,glide:0.06,dly:0.45,rev:0.55,dest:this.bus.lead});
        else if(P==='euro')this.saw(m,t,sd*Math.min(e.d,2)*0.95,{tag:'lead',voices:2,spread:10,cut:900,env:2600,envT:0.13,q:3.5,lp24:true,a:0.002,rel:0.04,vol:0.07,dly:0.35,rev:0.3,dest:this.bus.lead});
        else if(P==='pluck')this.saw(m,t,sd*Math.min(e.d,3)*0.95,{tag:'lead',voices:2,spread:8,cut:600,env:3800,envT:0.12,q:1.6,a:0.002,rel:0.05,vol:0.065,dly:0.3,rev:0.25,dest:this.bus.lead});
        else if(P==='prog')this.saw(m,t,sd*Math.min(e.d,4)*0.95,{tag:'lead',voices:2,spread:10,cut:500,env:1200,envT:0.18,a:0.003,rel:0.08,vol:0.065,dly:0.45,rev:0.35,dest:this.bus.lead});
        else if(P==='fm')this.fmNote(m,t,sd*e.d*0.95,{ratio:2,index:3,dec:0.35,vol:0.045,dest:this.bus.lead});
        else if(P==='bell')this.fmNote(m+12,t,Math.max(0.6,sd*e.d),{ratio:3.5,index:4,dec:0.9,vol:0.031,rev:0.45,dest:this.bus.lead});
        else if(P==='vox')this.vox(m,t,sd*e.d*0.95,this.bus.lead);
        else if(P==='soft')this.saw(m,t,sd*e.d*0.95,{tag:'lead',type:'triangle',voices:2,spread:6,cut:3200,vib:{rate:5.5,depth:12},a:0.01,rel:0.1,vol:0.058,dly:0.35,rev:0.35,dest:this.bus.lead});
        else if(P==='brass')this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:3,spread:12,cut:1500,env:1200,envT:0.25,a:0.05,rel:0.15,vol:0.065,rev:0.3,dest:this.bus.lead});
        else if(P==='pwm'||P==='organ'){this.saw(m,t,sd*e.d*0.95,{tag:'lead',type:'square',voices:2,spread:8,cut:3500,a:0.004,rel:0.06,vol:P==='organ'?0.04:0.05,dly:0.3,dest:this.bus.lead});if(P==='organ')this.saw(m+12,t,sd*e.d*0.95,{tag:'lead',type:'square',voices:1,cut:3000,vol:0.02,dest:this.bus.lead})}
        else if(P==='snap'||P==='dip')this.saw(m,t,sd*e.d*0.92,{tag:'lead',voices:2,spread:10,cut:3800,env:1500,envT:0.08,pe:P==='snap'?7:-2,peT:P==='snap'?0.015:0.07,a:0.002,rel:0.05,vol:P==='snap'?0.06:0.055,dly:0.3,dest:this.bus.lead});
        else if(P==='octsine'){this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:3,spread:14,cut:4000,vol:0.038,dly:0.3,rev:0.3,dest:this.bus.lead});this.saw(m+12,t,sd*e.d*0.95,{tag:'lead',type:'sine',voices:1,cut:8000,vol:0.026,dest:this.bus.lead})}
        else if(P==='warm')this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:4,spread:30,cut:2400,env:800,envT:0.2,a:0.006,rel:0.1,vol:0.045,dly:0.3,rev:0.3,dest:this.bus.lead});
        else if(P==='glide'){if(this.voicesOn&&this.vA)this.mono(this.vA,m,t,sd*e.d*0.98,{vol:0.06,cal:1.65,voices:2,spread:10,cut:2600,env:1500,envT:0.12,k:0.4,glide:0.025,from:prevL,a:0.004,rel:0.06});
          else this.saw(m,t,sd*e.d,{tag:'lead',voices:4,spread:20,cut:3800,from:prevL,glide:0.025,a:0.01,rel:0.1,vol:0.045,dly:0.4,rev:0.4,dest:this.bus.lead})}
        else if(P==='techstab')this.saw(m,t,sd*Math.min(e.d,2)*0.9,{tag:'lead',voices:1,cut:600,env:3000,envT:0.08,q:6,a:0.002,rel:0.03,vol:0.02,dly:0.25,dest:this.clipL});
        else if(P==='reso')this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:2,spread:8,cut:900,env:2500,envT:0.2,q:5,lp24:true,a:0.003,rel:0.06,vol:0.04,dly:0.3,dest:this.bus.lead});
        else if(ghost)this.saw(m,t,sd*e.d*0.95,{tag:'lead',type:'triangle',voices:1,cut:3200,a:0.02,rel:Math.min(0.6,sd*e.d*0.4),dly:0.55,rev:0.55,vol:0.05,dest:this.bus.lead});
        else if(metal)this.saw(m,t,sd*e.d*0.95,{tag:'lead',voices:2,spread:8,cut:5000,a:0.004,rel:0.06,dly:0.25,rev:0.25,vol:0.06,dest:this.gtrL});
        else if(psy){if(this.voicesOn&&this.vA)this.mono(this.vA,m,t,sd*Math.min(e.d,2)*0.9,{vol:0.09,cal:0.47,voices:1,cut:360,env:4200,envT:0.11,k:3.3,dr:2.4,glide:e.d>=2&&Math.random()<0.3?0.05:0,from:prevL,a:0.002,rel:0.03});
          else this.saw(m,t,sd*Math.min(e.d,2)*0.9,{tag:'lead',voices:1,cut:380,env:4200,envT:0.11,q:9,a:0.002,rel:0.03,dly:0.35,rev:0.2,vol:0.09,dest:this.bus.lead})}
        else this.saw(m,t,tm?sd*1.7:sd*e.d*0.95,{tag:'lead',type:T.lead,voices:T.lv,spread:T.ls,cut:T.lc*(0.75+0.35*(1-L.rank))*(ph==='build'?0.8:1)*(tm?1.35:1),env:T.le,envT:0.12,a:tm?0.01:0.004,rel:tm?0.05:0.08,
          dly:echo?0.7:T.dly*(this.evo?1:0.7),rev:sec==='brk'?T.rev+0.25:T.rev,vol:(echo?0.03:0.055)*(this.evo?1+0.3*L.steer:1),dest:this.bus.lead})}}
    if(G.arp&&this.bpArp){const e=this.bp.cycle?this.bpArp[this.pos%this.bpArp.length]:this.bpArp[s];if(e){const st0=MSTEP[((e.p%12)+12)%12]+7*Math.floor(e.p/12),n=48+key+degShift(snap(ch.deg,this.scale),st0,this.scale);
        if(this.bp.patch==='pluck16'){const po={tag:'arp',voices:1,cut:280,env:3600,envT:0.12,q:1.8,a:0.002,rel:0.03,vol:0.045,dly:0.18,dest:this.bus.arp};if(this.voicesOn&&this.vP)this.mono(this.vP,n,t,sd*0.9,{...po,cal:0.85,cut:420,env:5000});else this.saw(n,t,sd*0.9,po)}
        else{this.saw(n,t,sd*0.85,{tag:'arp',type:'square',voices:1,cut:3200,env:1200,envT:0.05,a:0.002,rel:0.03,vol:0.02,d16:0.4,dest:this.bus.arp});this.saw(n,t,sd*0.85,{tag:'arp',voices:1,cut:3200,env:1200,envT:0.05,a:0.002,rel:0.03,vol:0.02,dest:this.bus.arp})}}}
    else if(G.arp){const dense=(this.evo&&L.steer>0.35)||(full&&bi>=8)||this.rE>0&&busy;if(dense||s%2===0){const tones=[...ch.tones.slice(0,3),ch.tones[0]+12],n=60+key+tones[this.arp[s]%4]+(tm?(full&&bi>=8?12:0):-12);
      const ao={tag:'arp',type:tm?'sawtooth':'triangle',vol:tm?0.03:0.028,voices:tm?3:1,spread:16,cut:tm?2400:4000,env:tm?2600:0,envT:0.06,dly:0.22,dest:this.bus.arp};
      if(this.voicesOn&&this.vP)this.mono(this.vP,n,t,sd*0.8,{...ao,cal:tm?1.15:0.75,k:0.3,cut:ao.cut*1.6,env:ao.env*1.4});else this.saw(n,t,sd*0.8,ao)}}
    if(G.keys&&this.bpKeys){const e=this.bpKeys[(hb%2)*16+s];if(e){const m=60+key+(this.scale.length===7?snap(e.p,this.scale):e.p),K=this.bp.patch,v=0.8+Math.random()*0.25;
      if(K==='ep')this.ep(m,t,sd*e.d,v*1.3,this.bus.keys);else if(K==='pad')this.saw(m-12,t,sd*e.d*2+0.5,{tag:'pad',voices:3,spread:14,cut:1400,a:0.8,rel:1.2,vol:0.03,hall:0.5,dest:this.bus.keys});else this.piano(m,t,sd*e.d,v)}}
  }};

