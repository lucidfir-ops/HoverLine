  /* where a melody sits: the instrument's range, centred on the line */
  tPitch(p,key,inst,R){const reg=TREG[inst]||TREGF[inst]||this.tReg||[60,79],c=(reg[0]+reg[1])/2,mid=R?(R[0]+R[1])/2:p,off=Math.round((c-(60+key+mid))/12)*12;let m=60+key+p+off;while(m<reg[0]-7)m+=12;while(m>reg[1]+7)m-=12;return m},
  tMel(t,s,sd,ch,sec,bi,bl,stg,key,hb,ph){const T=this.T,G=this.gate,role=T.l,reg=this.tReg,brk=sec==='brk'||sec==='out',lift=this.rE>1;
    if(brk&&s===0&&G.keys)this.tBrkKeys(t,sd,ch,bi,sec,key);
    /* sirens: Siren Grid's are its signature; anywhere else one wail a tune, in its first breakdown */
    if(s===0&&ph==='groove'){const bd=sd*16,many=T.fx.includes('sirens');if(sec==='brk'&&bi===0){if((many||T.fx.includes('siren')&&!this.sirenN)){this.sirenN++;this.siren(t,bd*2,0)}if(T.fx.includes('dsiren'))this.siren(t,bd,1)}
      if(sec==='drop'&&bi===7&&bl===16){if(many)this.siren(t,bd*2,0);if(T.fx.includes('dsiren'))this.siren(t+sd*8,bd*0.5,1)}}
    if(sec==='rise'&&this.T.fx.includes('shout')&&stg.gapEnd!==undefined&&bl-bi===1&&s===0&&this.vbuf)this.sing(['c_herewego','c_letsgo',T.f==='hardcore'||T.f==='euro'?'c_faster':'c_letsgo'][(this.st.seed+hb)%3],t+4*sd,key,0.5);
    if(G.lead||G.resp||G.arp||G.keys){
      if(this.tHook&&(G.lead||G.resp)){const H=this.tHook,ls=(hb%(H.L/16))*16+s,es=H.at[ls];
        const mode=ph==='build'?(stg.bassFull?'thin':'off'):sec==='drop'?(bl>999&&bi>=4||lift&&bi>=4?'full':bi<4?'off':bi<8?'half':'full'):sec==='b'?(bi<8?'alt':'off'):sec==='a'?(T.kz&&TSMP[T.kz]?'keys':'half'):'off';
        if(es&&mode!=='off')for(const e of es){const inBar=e.s%64;if(mode==='half'&&inBar>=32)continue;if(mode==='thin'&&e.s%4!==0)continue;
          const inst=mode==='keys'?T.kz:mode==='alt'&&T.l2&&role!=='call'?T.l2:T.li,p=mode==='alt'&&!T.l2&&inBar>=48?snap(e.p+(e.p>4?-2:2),this.scale):e.p,m=this.tPitch(p,key,inst,this.tHR),d=sd*(mode==='thin'?Math.max(e.d,4):e.d);
          if(role==='call'&&inBar>=32)continue;this.tVx(inst,m,t,d,mode==='thin'?0.6:mode==='keys'?0.8:1,mode==='keys'?this.xKeys():this.bus.lead)}
        if(this.tResp&&G.resp&&(sec==='drop'||sec==='b'||sec==='a')){const R=this.tResp,es2=R.at[(hb%4)*16+s];if(es2)for(const e of es2)this.tVx(T.l2,this.tPitch(e.p,key,T.l2,this.tHR),t,sd*e.d,0.9,this.bus.resp)}}
      if(this.tRiff&&G.lead){const R=this.tRiff,useB=sec==='b'||sec==='sw'||(sec==='drop'&&hb%4===3),go=sec==='drop'&&!(bi<4&&T.f!=='techno')||sec==='b'||sec==='sw'||(sec==='rise'&&bl-bi>4)||ph==='build'&&stg.bassFull;
        if(go&&!(role==='solo'&&sec!=='drop')){const ls=R.n>16?(hb%2)*16+s:s,es=(useB?R.B:R.A)[ls];if(es)for(const e of es){let p=e.p;if(R.fol){p=snap(p+ch.deg,this.scale)}const m=this.tPitch(p,key,T.li,this.tRR);
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
           first half, so it never chatters under the melody */
        const acc=!lead&&!!T.ai,slow=brk||sec==='a'&&!lead,step=slow?(s%4===0):acc?(s%2===0&&!(sec==='drop'&&bi<8)):true;if(step&&!(sec==='rise'&&bl-bi<=1)){let m=null;
          if(this.tArpLine){const L=this.tArpLine,e=L[this.pos%L.length],st0=MSTEP[((e%12)+12)%12]+7*Math.floor(e/12);m=this.tPitch(degShift(snap(ch.deg,this.scale),st0,this.scale)-12,key,inst,[-12,12])}
          else{const ix=this.tArpP[s];if(ix>=0){const tn=[...ch.tones.slice(0,3),ch.tones[0]+12];m=this.tPitch(tn[ix%4],key,inst,[0,14])}}
          if(m!=null)this.tVx(inst,m,t,sd*(slow?3:acc?2:1),lead?(slow?0.6:0.85):acc?0.45:0.5,this.bus.arp)}}}
    if(ph==='groove'&&(sec==='drop'||sec==='b')){if(T.fx.includes('zap')&&s%4===3&&(hb+s)%5===0)this.zap(72+key,t,sd*2);
      if(T.fx.includes('stutter')&&hb%4===3&&s===12&&this.lastLead!=null&&(this.st.seed+hb)%3===0)this.stutter(t,sd);if(T.fx.includes('glitch')&&s===14&&hb%2===1&&this.vbuf)this.fxS(hb%4===1?'s_g1':'s_g3',t,0.3,this.bus.snare)}},
  /* a chord voiced for an instrument: up to four tones in its range, each chord led smoothly from the last (power
     chords for industrial and metal) */
  tVoice(ch,key,inst){const reg=TREG[inst]||TREGF[inst]||[55,72],lo=Math.max(reg[0],inst==='gtr'?40:52),hi=lo+(inst==='gtr'?14:16);
    if(inst==='gtr'||ch.q==='5'){const rp=((key+ch.deg)%12+12)%12;let m=lo+((rp-lo)%12+12)%12;return[m,m+7]}
    if(!ch.ivs){const out=[];for(const tn of ch.tones.slice(0,3)){let m=48+key+tn;while(m<lo)m+=12;while(m>lo+14)m-=12;out.push(m)}return out}
    const C=this.tVk[inst]||(this.tVk[inst]={}),i=this.tCh.indexOf(ch);if(i>=0&&C[i])return C[i];
    const prev=C.last||null,v=tVoiceLead(ch.deg,ch.ivs,key,lo,hi,prev,ch.ivs.length>=5).slice(-4);C.last=v;if(i>=0)C[i]=v;return v},
  tBrkKeys(t,sd,ch,bi,sec,key){const T=this.T,K=T.kz||(T.li&&(TSMP[T.li]||MX.hasSyn(T.li)&&['rhodes','fmbell'].includes(T.li))&&T.l!=='riff'?T.li:null);if(!K||K==='gtr')return;const bd=sd*16,v=this.tVoice(ch,key,K);
    if(bi%2===0||T.l==='keys'||T.l==='pad'){for(const m of v)this.tVx(K,m,t,bd*1.6,0.62*(v.length>3?0.85:1),this.xKeys());const rp=((key+ch.deg)%12+12)%12;this.tVx(K,36+rp+(rp>5?0:12),t,bd*1.8,0.55,this.xKeys())}
    if(sec==='brk'&&bi===0){if(T.fx.includes('choir'))this.choir(t,ch.tones.slice(0,3).map(x=>60+((key+x)%12+12)%12))}},
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
    if(inst==='hangS'||inst==='didg'||inst==='gtr'){const g=this.tSmpI(inst,m,t,dur,v,dest);if(g)return g;if(inst==='hangS')inst='hang';else if(inst==='gtr')return this.tGtr(m,t,dur,1,v,dest);else return this.tDidg(m,t,dur,v,dest)}
    if(SYNFB[inst]!==undefined&&!MX.hasSyn(inst)){const f=SYNFB[inst];if(!f)return null;inst=f}
    if(inst==='cstab')return this.saw(m,t,Math.min(dur,0.26),{tag:'lead',voices:2,spread:9,cut:700,env:2600,envT:0.09,q:3.2,a:0.002,rel:0.05,vol:0.03*v,dly:0.16,rev:0.22,dest});
    if(inst==='riffsaw')return this.saw(m,t,dur*0.9,{tag:'lead',voices:3,spread:16,cut:1400,env:1300,envT:0.08,a:0.003,rel:0.05,vol:0.042*v,dly:0.18,dest:this.dB||dest});
    if(inst==='chip')inst='square';
    return this.tV(inst,m,t,dur,v,dest,sl)},
  /* a recorded library instrument (SMP.zone); null when it is not loaded */
  tSmpI(inst,m,t,dur,v,dest){const S=MX.smp(),n=MX.instOf(inst==='gtr'?'gtrl':inst);if(!S||!n||this.lite)return null;const z=S.zone(n,Math.round(m),Math.min(1,v));if(!z||!z.buf)return null;
    const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=z.buf;src.playbackRate.value=z.rate*Math.pow(2,(m-Math.round(m))/12);const lv=(inst==='didg'?0.5:inst==='gtr'?0.42:0.55)*v*z.gain,L=Math.min(z.buf.duration/z.rate,dur+(inst==='hangS'?1.6:0.25));
    g.gain.setValueAtTime(lv,t);g.gain.setValueAtTime(lv,t+Math.max(0.01,L-0.06));g.gain.linearRampToValueAtTime(0,t+L);src.connect(g);g.connect(dest);src.start(Math.max(c.currentTime,t-(z.on||0)));src.stop(t+L+0.02);
    this.send(g,inst==='hangS'?this.hall:this.rev,inst==='hangS'?0.35:0.18);src.onended=()=>{try{g.disconnect()}catch(e){}};return g},
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
  /* tabla bols: the last four bars of a breakdown, a call (the bols spoken when the recordings exist, otherwise the
     tabla lightly, right hand only) for two bars, then the tabla answers with exactly that phrase. A tihai's last Dha
     lands on the downbeat after (the call's on the answer's first beat, the answer's on the next section's) */
  tBolBar(t,sd,sec,bi,bl){if(!this.bolQ&&this.bolOK&&!this.bolDone&&sec==='brk'&&bl>=6&&bi===bl-4){const ph=BOLP[this.bolPh||'theka'].split(' ');
      this.bolQ={j:0,ph,voc:VBOL.ok(ph)};this.bolDone=true;this.bolAt=this.tuneN;this.mlog('bols',{phrase:this.bolPh,voice:this.bolQ.voc,tpl:this.T.id})}
    const q=this.bolQ;if(!q)return;if(q.p!=null&&this.pos!==q.p){this.bolQ=null;return}q.p=this.pos+16;const j=q.j++;
    for(let s=0;s<16;s++){const g=j*16+s,a=g-32,c=g<=32?q.ph[g]:null,w=a>=0?q.ph[a]:null;if(c&&c!=='-')this.tBol(c,t+s*sd,sd,q.voc?2:1);if(w&&w!=='-')this.tBol(w,t+s*sd,sd,0)}
    if(j>=4)this.bolQ=null},
  /* one bol: spoken (2), the tabla's light call (1: the right hand only), or the full stroke(s) (0) */
  tBol(b,t,sd,mode){const V=this.vbuf,S=BOLS[b];if(!S||!V)return;
    if(mode===2){const B=VBOL.B[b];if(B){const g=this.playS(B,t,0.42*B.vg,this.bus.lead,Math.min(B.duration,sd*3));this.send(g,this.rev,0.15)}return}
    const k=this.bolK=(this.bolK||0)+1,SM=MX.smp(),lib=SM&&!SM.fallback&&SM.kit('tabla')?SM:null;
    S.forEach(([vn,alt],i)=>{if(mode===1&&i>0)return;const L0=/^(ghe|dhe)/.test(vn)?0.36:/^(te|ke|re)/.test(vn)?0.24:0.32,lv=L0*(mode===1?0.5:0.8)*(1+(hsh(k,7)-0.5)*0.12);
      if(lib){const p=lib.pick('tabla',vn,mode===1?0.5:0.85,{strict:true,seq:'bol'+i});if(p&&p.buf&&!p.fb){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=p.buf;g.gain.value=lv*p.gain;src.connect(g);g.connect(this.bus.hat);
        src.start(Math.max(c.currentTime,t+(hsh(this.pos+k,i)-0.5)*0.004-(p.hit!=null?p.hit:p.on||0)));src.onended=()=>{try{g.disconnect()}catch(e){}};this.send(g,this.rev,mode===1?0.25:0.12);return}}
      const av=alt.filter(n=>V['x_tabla_'+n]);if(!av.length)return;const g=this.playS(V['x_tabla_'+av[k%av.length]],t+(hsh(this.pos+k,i)-0.5)*0.004,lv,this.bus.hat,0,1);this.send(g,this.rev,mode===1?0.25:0.12)})},
  /* Like (Prototype 45): marks the template; with "Likes steer the radio" on, similar templates come up more often */
  like(){if(!this.T)return null;const on=MLIKE.toggle(this.T.id);this.mlog('like',{code:this.code(),tpl:this.T.id,name:this.T.n,on});this.changed();return on},
  liked(){return!!(this.T&&MLIKE.liked(this.T.id))},
  tInfo(){const st=this.st,T=this.T;const R={none:'no lead',riff:'riff',hook:'hook',doc:"the guide's line as the hook",solo:'solo',arp:'arpeggios',chops:'vocal chops',stabs:'chord stabs',pad:'pads',keys:'keys',call:'call and response'}[T.l]||T.l;
    const I=x=>x?({pn:'grand piano',ep:'electric piano',up:'upright piano',hp:'harp',sitar:'sitar',sx:'tenor sax',sl:'saxello',cowbell:'808 cowbell',ka:'kalimba',vb:'vibraphone',mb:'marimba',st:'strumstick',cv:'clavisynth',or:'pipe organ',organ:'organ',screech:'screech',bell:'FM bell',brass:'brass',horn:'horn stabs',hsaw:'supersaw',stadium:'stadium supersaw',glide:'glide lead',clip:'clipped saw',pwm:'pulse lead',reso:'resonant stab',techstab:'drive stab',acidl:'acid',hoover:'hoover',square:'square lead',eurolead:'eurobeat lead',euro:'euro pluck',pluck:'pluck',pluck16:'16th pluck',prog:'progressive pluck',soft:'soft lead',arp12:'square-saw',xy:'xylophone',hm:'hand chimes',
      anthem:'supersaw',eurobrass:'eurobeat brass',hardcore:'hardcore supersaw',sawpluck:'supersaw pluck',smooth:'smooth lead',tb303:'303',rhodes:'rhodes',fmbell:'FM bell',fmbrass:'FM brass',fmstab:'FM stab',guzheng:'guzheng',erhu:'erhu',bansuri:'bansuri',hangS:'hang drum',didg:'didgeridoo',gtr:'guitar',chip:'chiptune square',cstab:'clean stab',riffsaw:'saw riff'}[x]||x):'';
    const gn=(T.gn||[T.f]).map(g=>(GENRES.find(x=>x[0]===g)||[0,g])[1]).join(' + ');
    return`${T.n} · ${T.sub} · ${KEYS[st.key]} ${{minor:'minor',harm:'harmonic minor',dorian:'dorian',phryg:'phrygian',phrdom:'phrygian dominant',major:'major',mixo:'mixolydian',yu:'minor pentatonic',gong:'major pentatonic',bhairav:'bhairav'}[T.m]} · ${Math.round(this.bpm)} bpm · ${R}${T.li&&T.l!=='none'&&T.l!=='chops'?' on '+I(T.li):''}${T.l2?' and '+I(T.l2):''}${T.kz&&T.kz!==T.li?' · '+I(T.kz)+' chords':''} · ${gn} · template ${T.id} of ${TPL.length}${T.ret?' (retired)':''}`},
