  /* ---- song templates (Prototype 43): building, the race sequence, the radio, the transitions ---- */
  get mv(){return this.T&&!this.pgE?TSTRUCT[this.T.st]||TSTRUCT.std:MOV},
  /* which templates the style switches allow: Drum & bass = the breakbeat side, Trance = the four-on-the-floor side */
  tSides(){const s=this.style;return s==='trance'?[1]:s==='both'?[0,1]:[0]},
  tState(id,seed,kv=0,vr=0){const T=TPL[(id-1+TPL.length)%TPL.length];seed=seed>>>0&0xFFFFF;return{tp:T.id,seed,kv:kv&15,vr:vr&15,style:T.side,mx:0,theme:0,key:(T.k+kv)%12,prog:1,groove:0,mut:[0,0,0],timbre:seed%8,rng:seed&127,flav:0,hook:0,resp:0,bp:0,lib:0,kx:0,kx2:0}},
  /* a random template tune: allowed side, not the family just heard (avoid), leaning to an energy when asked */
  tRandom(r,avoid,side,en){const S=side!=null?[side]:this.tSides(),L=TPL.filter(T=>S.includes(T.side)&&T.f!==avoid);const A=L.length?L:TPL;
    let T=A[Math.floor(r()*A.length)];if(en&&r()<0.5){const B=A.filter(x=>x.e===en);if(B.length)T=B[Math.floor(r()*B.length)]}return this.tState(T.id,Math.floor(r()*1048576))},
  /* tune k of this track's race sequence: everyone in a room hears the same sequence; alone, the least familiar of
     12 candidates, a little towards the race's feel */
  raceTune(k){let room=false;try{room=!!mp.on}catch(e){}const seed=this.tSeed||7,prev=k>0&&this.rPrevF||null;
    let side=null;if(this.style==='both'&&this.both==='turn'&&this.st&&this.st.tp)side=TPL[this.st.tp-1].side?0:1;
    const en=!room&&k>0&&this.rx?(this.rx.a>1?3:this.rx.e>0?1:0):0;
    return mFresh(i=>this.tRandom(rng((((seed^0x5EED)>>>0)+Math.imul(k*13+i+1,0x9E3779B1)>>>0)||1),prev,side,en||0),room?1:12)},
  tPrepAll(st){if(!st||!st.tp)return Promise.resolve();const T=TPL[st.tp-1],D=TDR[T.d],ps=[];
    if(D&&D.brk&&D.brk!=='arov'&&this.kit){const b=T.b,k=D.brk+'|'+b+'|'+(T.kit||0);if(!TCACHE.brk[k]&&!TCACHE.busy[k]){TCACHE.busy[k]=1;const kit=T.kit&&this.kits&&this.kits[T.kit]||this.kit0||this.kit;
      ps.push(SL.brkRender(kit,D.brk,b).then(x=>{if(x){const ks=Object.keys(TCACHE.brk);if(ks.length>=4)delete TCACHE.brk[ks[0]];TCACHE.brk[k]=x}delete TCACHE.busy[k]}).catch(()=>{delete TCACHE.busy[k]}))}}
    /* the sitar: every other semitone from G2 to D6 (played up to a semitone either way), for the tune's key only */
    if(!this.lite&&(T.li==='sitar'||T.l2==='sitar')){const key=(T.k+(st.kv||0))%12;if(TCACHE.sitK!==key){TCACHE.sit={};TCACHE.sitK=key}ps.push(new Promise(res=>{const ms=[];for(let m=43;m<=87;m+=2)if(!TCACHE.sit[m])ms.push(m);let i=0;
      const step=()=>{try{for(let j=0;j<3&&i<ms.length;j++,i++){const m=ms[i],d=SL.sitar(32000,m,key),b=new AudioBuffer({length:d.length,sampleRate:32000,numberOfChannels:1});b.getChannelData(0).set(d);if(TCACHE.sitK===key)TCACHE.sit[m]=b}}catch(e){return res()}if(i<ms.length)setTimeout(step,0);else res()};setTimeout(step,0)}))}
    return Promise.all(ps)},
  /* the recordings a template uses (the Prototype 38 ones are decoded when it is chosen) */
  tX2(T){const o=[],X=SL.EXT2;if(!X||!T)return o;const add=k=>{if(X[k]&&!o.includes(k))o.push(k)};
    for(const i of[T.li,T.l2,T.kz]){const S=i&&TSMP[i];if(S&&S[0].startsWith('x_'))for(const b of S[1])add(S[0]+b)}
    const P=TPD[T.pd];if(P&&P.smp)add(P.smp[0]);if(this.kit2&&KITX2[this.kit2])for(const p of Object.values(KITX2[this.kit2].p))add(Array.isArray(p)?p[0]:p);
    if(TDR[T.d]&&TDR[T.d].brk==='arov')add('x_lp_ar_'+'abde'[this.st.seed%4]);const PX=T.perc&&PERCX[T.perc];if(PX&&PX.x2){if(PX.loop)add(PX.loop);else for(const e of PX.p)if(e)for(const[k]of e)add(k)}return o},
  buildT(){const st=this.st,T=this.T=TPL[st.tp-1]||TPL[0],r=rng((Math.imul(st.seed+1,2654435761)^Math.imul(st.tp,40503)^0x51A7)>>>0||1),pick=a=>a[Math.floor(r()*a.length)];
    Object.assign(this,{theme:THEMES[0],fk:T.fx.includes('rw')?'dnb':'tpl',bp:null,minor:!(T.m==='major'||T.m==='mixo'),scale:SCX[T.m]||SC.minor,hscale:SCX[SCXH[T.m]]||SC.harm,prog:T.p,
      roots:T.p.length===8?[T.p[0],T.p[2],T.p[4],T.p[6]]:T.p,pw:T.d==='indus',trR:false,trM:T.side===1,respK:null,themeEv:[],motif:[],variant:[],hookIdx:null,lOct:0,anthem:false,vocal:false,
      kit2:T.kit===9||T.kit===10?T.kit:0,texR:null,percX:T.perc&&PERCX[T.perc]||null,bhit:null,bell:false,stabs:false,harp:T.fx.includes('harp'),tymp:false,cym:T.fx.includes('cym'),shk:false,clapS:false,
      leadCache:{},groove:GROOVES.dnb[0],bassPat:BASS.dnb[0],timbre:TIMBRES[st.timbre&7],arp:ARPS[0],leadPatch:null,leadDuck:0,bpBass:null,bpArp:null,bpKeys:null,psyTight:false,leadEv:null});
    const sm=i=>i&&TSMP[i]&&!['or','sx','sl','rc','ps'].includes(i)?i:null;this.keysI=null;this.sparkI=sm(T.kz)||sm(T.li);
    this.tD=TDR[T.d]||TDR.twostep;this.tKick=T.kick||this.tD.kick||'kd';this.swing=T.sw||0;
    const sc=this.scale,hs=this.hscale,roots=this.roots,line=T.line||null,BF=TBF[T.bs]||TBF.sub;this.tBF=BF;this.tBP=(TBP[BF[1]]||TBP.sub)(T.b);
    /* bass patterns: [step, length, semitones above the chord root, accent, slide] for a bar (two for long lines) */
    const BP={roll:[[[0,6,0],[6,2,12],[10,6,0]],[[0,4,0],[4,2,12],[6,2,0],[10,4,0],[14,2,12]],[[0,3,0],[3,1,12],[4,4,0],[8,3,0],[11,1,12],[12,4,0]],[[0,10,0],[10,2,0],[12,4,0]]],
      off:[[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,0]],[[2,2,0],[6,2,0],[10,2,0],[14,2,0]]],
      sub:[[[0,14,0]],[[0,8,0],[8,6,0]],[[0,6,0],[10,6,0]]],gal:[[[0,1,0],[2,1,12],[3,1,0],[4,1,0],[6,1,12],[7,1,0],[8,1,0],[10,1,12],[11,1,0],[12,1,0],[14,1,12],[15,1,0]],[[0,1,0],[1,1,0],[2,1,12],[4,1,0],[5,1,0],[6,1,12],[8,1,0],[9,1,0],[10,1,12],[12,1,0],[13,1,0],[14,1,12]]],
      oct:[[[0,1,0],[2,1,12],[4,1,0],[6,1,12],[8,1,0],[10,1,12],[12,1,0],[14,1,12]],[[0,2,0],[2,1,12],[4,2,0],[6,1,12],[8,2,0],[10,1,12],[12,1,0],[13,1,0],[14,1,12]]],
      kbbb:[[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,0]]],r4:[[[2,1,0],[3,1,0],[6,1,0],[7,1,0],[10,1,0],[11,1,0],[14,1,0],[15,1,12]]],
      sq16:[[[0,1,0],[1,1,0],[2,1,12],[3,1,0],[4,1,0],[5,1,0],[6,1,7],[7,1,0],[8,1,0],[9,1,0],[10,1,12],[11,1,0],[12,1,0],[13,1,0],[14,1,10],[15,1,0]]],hit:[[[0,8,0]]],
      house:[[[0,2,0],[3,1,0],[6,2,12],[10,2,0],[13,1,0]],[[2,1,0],[5,1,12],[8,2,0],[11,1,0],[14,2,0]],[[0,1,0],[2,1,0],[6,1,12],[8,1,0],[10,1,0],[14,1,12]]],
      slap:[[[0,1,0],[3,1,12],[5,1,0],[6,1,0],[10,1,0],[12,1,12],[15,1,0]],[[0,2,0],[4,1,12],[6,1,0],[9,1,0],[11,1,12],[13,1,0],[14,1,0]]],
      growl:[[[0,3,0],[4,2,0],[6,2,0],[10,4,0],[14,2,0]],[[0,2,0],[2,2,0],[8,4,0],[12,2,0],[14,2,12]]],riddim:[[[0,2,0],[3,1,0],[4,2,0],[8,2,0],[11,1,0],[12,2,0]]],
      wob:[[[0,4,0],[4,4,0],[8,4,0],[12,4,0]],[[0,6,0],[6,2,0],[8,8,0]]],s808:[[[0,6,0],[6,2,0],[10,6,0]],[[0,10,0],[10,2,12],[12,4,0]]],slide:[[[0,7,0],[7,3,12],[10,6,0]],[[0,4,0],[4,4,7],[8,8,0]]],
      organ:[[[0,2,0],[3,1,12],[4,2,0],[6,2,12],[8,2,0],[11,1,12],[12,2,0],[14,2,12]]],prog:[[[1,1,0],[2,1,0],[3,1,12],[5,1,0],[6,1,0],[7,1,12],[9,1,0],[10,1,0],[11,1,12],[13,1,0],[14,1,0],[15,1,12]]]};
    if(BF[0]==='line'&&line){const n=line.length,rl=libRhythm('bass',n,T.id,T.d==='half'),ev=[];let s=0;const b0=Math.min(...line);line.forEach((p,i)=>{ev.push([s,rl[i%rl.length],p-b0+(b0<-6?0:0)]);s+=rl[i%rl.length]});
      const span=s>16?32:16;this.tBass={A:ev.filter(e=>e[0]<span),span};this.tBassB=this.tBass}
    else if(BF[0]==='acid'){const g=tAcidGen(r,sc);this.tBass={A:g.A.map(e=>[e.s,e.d,e.p,e.ac,e.sl]),span:16};this.tBassB={A:g.B.map(e=>[e.s,e.d,e.p,e.ac,e.sl]),span:16}}
    else{const L=BP[BF[0]]||BP.sub,i=Math.floor(r()*L.length),j=L.length>1?(i+1+Math.floor(r()*(L.length-1)))%L.length:i;this.tBass={A:L[i],span:16};this.tBassB={A:L[j],span:16}}
    for(const B of[this.tBass,this.tBassB]){B.at=[];for(const e of B.A){(B.at[e[0]]||(B.at[e[0]]=[])).push(e)}}
    /* the melody */
    const reg=TREG[T.li]||[60,79];this.tReg=reg;this.tHook=this.tResp=this.tRiff=this.tChop=this.tStab=this.tComp=null;
    const at=(ev,L)=>{const a=new Array(L);for(const e of ev){(a[e.s]||(a[e.s]=[])).push(e)}return a};
    if(T.l==='hook'||T.l==='doc'||T.l==='call'){const form=T.form||pick(['AABA','ABAC','AAAB','AB']),dens=T.f==='euro'||T.f==='trance'?pick([5,6,7,8]):null;
      const ev=tHookGen(r,{sc,hs,roots,form,line:T.l==='doc'?line:null,dens}),L=form==='long'?128:64;this.tHook={ev,L,at:at(ev,L)};
      if(T.l==='call'){const ev2=tHookGen(r,{sc,hs,roots,form:'ABAC'}).filter(e=>e.s>=32);this.tResp={ev:ev2,L:64,at:at(ev2,64)}}}
    if(T.l==='riff'||T.l==='solo'){const g=tRiffGen(r,{sc,line,len:T.l==='solo'?32:pick([16,16,32])});this.tRiff={A:at(g.A,g.n),B:at(g.B,g.n),n:g.n,fol:T.f!=='techno'&&T.f!=='trance'}}
    if(T.l==='chops'){const W=['c_hey','c_oh','c_yeah','c_go'],R=pick([[0,6,10],[2,6,10,14],[0,3,8,11],[4,7,12],[0,10]]);this.tChop={R,w:[pick(W),pick(W)],sh:pick([0,1,2])}}
    if(T.l==='stabs'){const R={house:[[2,6,10,14],[0,3,6,10,13],[3,6,11,14]],techno:[[3,6,11],[0,3,10],[2,7,10]],euro:[[0,3,6,10,12,14],[2,6,10,14],[0,6,8,14]],dub:[[0,6,8,14],[0,3,8]]}[T.f]||[[0,6,10],[2,6,10,14]];this.tStab={R:pick(R),R2:pick(R)}}
    if(T.l==='keys'||T.kz)this.tComp={R:pick([[0,3,6,10,12],[2,6,10,14],[0,4,6,10,14],[0,3,8,11,14]])};
    this.tSoloAt=null;this.tSoloK=null;const rg=a=>a&&a.length?[Math.min(...a),Math.max(...a)]:[0,12];this.tHR=rg(this.tHook&&this.tHook.ev.map(e=>e.p));
    this.tRR=this.tRiff?rg([...this.tRiff.A,...this.tRiff.B].flat().filter(Boolean).map(e=>e.p)):[0,12];
    /* arpeggios: a pattern of chord-tone indices over a bar */
    const AP={up:[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3],down:[3,2,1,0,3,2,1,0,3,2,1,0,3,2,1,0],updown:[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3],up8:[0,-1,1,-1,2,-1,3,-1,2,-1,1,-1,0,-1,2,-1],
      gallop:[0,-1,1,2,0,-1,1,2,3,-1,2,1,0,-1,1,2],dotted:[0,-1,-1,1,-1,-1,2,-1,-1,3,-1,-1,2,-1,-1,1]};const ak=T.ar||(T.l==='arp'?'updown':null);this.tArpP=ak&&ak!=='line'?AP[ak]||AP.updown:null;this.tArpLine=ak==='line'&&line?line:null;
    this.tChord=T.l==='stabs'||T.l==='keys'||T.l==='pad';this.vks={};this.lOct=0;this.useKit();
    if(!this.lite&&this.ctx){this.ensureExt();this.ensureX2()}if(this.ctx)this.tP=this.tPrepAll(st);
    if(T.ar==='dotted'||T.ar==='line'||T.li==='arp12')this.ensureEchoes();
    if(this.dly&&this.dlyB!==this.bpm){const b=this.dlyB=this.bpm;this.dly.delayTime.value=60/b*0.75;this.dly2.delayTime.value=60/b*0.375;if(this.dly16){this.dly16.delayTime.value=60/b/4;this.dly8t.delayTime.value=60/b/3}}
    this.tTrim(null,0.05)},
  tTrim(t,dur){if(!this.trimG||!this.ctx)return;const T=this.T,n=this.sec&&this.sec[0],v=T?(T.g||1)*(n==='brk'||n==='out'?T.gb||1:1):1,g=this.trimG.gain;t=t==null?this.ctx.currentTime:t;
    if(this.trimV===v)return;g.cancelScheduledValues(t);g.setValueAtTime(this.trimV==null?v:this.trimV,t);g.linearRampToValueAtTime(v,t+dur);this.trimV=v},
  /* Every 90 s (races, results, the menu's race music) the next tune takes over at a phrase line: the old tune breaks
     down for two bars and the new one builds four into its drop, or, when the tempos are close, a one-bar fill drops
     straight into it. Count-ins, GO and the final lap are untouched (the final lap's build can be the new tune's). */
  swOK(){if(this!==music||!this.T||this.pinned||!this.shuffle||this.style==='off'||this.modeEff()!=='gen')return false;const m=this.mood;return m==='race'||m==='results'||m==='listen'},
  swNext(){if(this.mood==='listen'||this.mood==='menu')return this.freshTune();this.rPrevF=this.T?this.T.f:null;return this.raceTune((this.rSeq||0)+1)},
  swPlanAt(t,bd,n,bi,bl){if(!this.swOK()||this._final||this.swPl||this.swT0==null||this.want||this.queue.length)return;const left=bl-bi;let mode;
    if(({drop:1,b:1,a:1,sw:1,solo:1,drum:1})[n]){if(left===1&&n==='drop'&&this.rwAt>t)return;mode='g'}else if(n==='brk')mode='b';else return;
    if(!((bi+1)%4===0||left===1))return;if(t+bd*(mode==='b'?5:7)-this.swT0<90)return;
    /* a breakdown goes straight into the next tune's build; anywhere else the old tune breaks down for two bars first,
       or (tempos within 5%, half the time) a one-bar fill drops into it */
    const ns=this.swNext();if(!ns)return;const T2=TPL[ns.tp-1],close=Math.abs(T2.b-this.bpm)<=this.bpm*0.05,fill=mode==='g'&&close&&(ns.seed&1);
    this.sec[2]=bi+1;const dl=bl>999?1e9:16;this.queue=mode==='b'?[['rise',4,ns],['drop',dl]]:fill?[['rise',1,ns],['drop',dl]]:[['out',2],['rise',4,ns],['drop',dl]];this.swPl={ns,how:mode==='b'?'breakdown':fill?'fill':'breakdown'};const ps=[this.tPrepAll(ns)];
    /* the next tune's recordings are decoded while the old one breaks down (its break, sitar and kit are ready before its build) */
    if(!this.lite){const k2=this.kit2,s0=this.st;this.kit2=T2.kit===9||T2.kit===10?T2.kit:0;this.st=ns;const ks=this.tX2(T2),V=this.vbuf||{},miss=ks.filter(k=>!V[k]);this.kit2=k2;this.st=s0;
      if(miss.length){const src={};for(const k of miss)src[k]=SL.EXT2[k];ps.push(this.decodeVox(this.ctx,()=>true,src).then(v=>{this.vbuf=Object.assign(this.vbuf||{},v);if(T2.kit===9||T2.kit===10)this.mkKit(T2.kit)}).catch(()=>{}))}}
    this.swP=Promise.all(ps)},
  /* at the bar line before the new tune's first section: switch (the tempo changes here, in a breakdown or a fill) */
  swApply(){const Q=this.queue,S=this.sec;if(!this.swPl||!S||S[1]+1<S[2]||!Q.length||!Q[0][2])return false;const ns=Q[0][2],how=this.swPl.how,pc=this.code(),pl=this.played();Q[0]=[Q[0][0],Q[0][1]];
    this.swPl=null;const keepQ=Q.slice();this.setState(ns);this.queue=keepQ;this.mi=0;this.swT0=null;if(this.mood!=='listen')this.rSeq=(this.rSeq||0)+1;
    this.mlog('tune',{why:'change',how,code:this.code(),tpl:this.T.id,name:this.T.n,prev:pc||undefined,played:pl,seq:this.rSeq});return true},
  /* ---- one sixteenth of a template tune ---- */
  playT(t,sd,s){const T=this.T,G=this.gate,st=this.st,key=st.key,ph=this.phase,stg=this.stage||{},hb=this.hb||0,V=this.vbuf;
    const S=this.sec||['build',this.pb,0],sec=ph==='build'?'build':S[0],bi=S[1],bl=S[2],full=sec==='drop',tt=s%2?t+this.swing*sd:t,ch=this.chordAt(hb,s);
    if(ph==='groove'&&s===0&&bi===0&&full&&this.dropFx){this.dropFx=false;this.impact(t);if(T.f!=='techno'&&T.f!=='house')this.crash(t,0.2);this.tDropFx(t,bl,key)}
    if(s===0&&this.fillAt===Math.floor(this.pos/16)-1)this.fillAt=-1;
    if(this.glitch>0){this.glitch--;this.stutter(t,sd)}
    if(G.pad&&this.pos>=this.padUntil&&(s===0||(this.prog.length===8&&s===8)))this.tPad(t,sd,s,ch,sec,ph,key,hb);
    this.tDrums(tt,t,s,sd,sec,bi,bl,stg,ph);
    if(this.percX&&V&&!this.lite&&ph==='groove'&&(sec==='a'||sec==='b'||full||sec==='solo'))this.tPerc(tt,s,sd,sec,hb);
    if(G.bass&&(stg.bassFull||ph==='build'&&stg.bassFull)&&sec!=='brk'&&sec!=='out'&&sec!=='rise')this.tBassStep(tt,s,sd,ch,sec,bi,key,hb);
    this.tMel(tt,s,sd,ch,sec,bi,bl,stg,key,hb,ph)},
  tKickHit(t,v){try{(this.kickQ||VFX.kick).push(t)}catch(e){}const K=this.kit;if(!K)return;this.playS(K[this.tKick]||K.kd,t,v*0.95,this.bus.kick);this.kickFx(t,false)},
  tDrums(tt,t,s,sd,sec,bi,bl,stg,ph){const D=this.tD,G=this.gate,K=this.kit,T=this.T;if(!K)return;
    const P=sec==='build'||sec==='drop'||sec==='rise'?D.main:sec==='b'?D.b:sec==='a'||sec==='solo'?D.a:sec==='sw'?D.sw:sec==='drum'?D.drum:null;
    /* a build: its groove until the last bars, then the snare roll (and quarter kicks) into the drop */
    if(sec==='rise'&&stg.roll){if(G.kick&&!stg.kickOff&&stg.kick4&&s%4===0)this.tKickHit(t,s===0?1:0.85);
      if(G.snare){const last=stg.rollBar===stg.R-1,p=(stg.rollBar*16+s)/(stg.R*16);if(!(last&&s>=14)){if(last&&s>=8){this.tRoll(t,p);this.tRoll(t+sd/2,p+0.02)}else if(s%stg.roll===0)this.tRoll(t,p)}}
      if(G.hat&&stg.hatDense&&P&&P.H&&P.H[s])this.playS(s%4===0?K.h1:K.h2,tt,P.H[s]*0.6,this.bus.hat);return}
    if(!P){if(sec==='out'&&G.hat&&s%4===2)this.playS(K.h2,tt,0.12,this.bus.hat);return}
    const bk=P.B&&D.brk?this.tBrk():null,kv=ph==='build'?(stg.kickV||0):sec==='rise'?(stg.kickV||0.7):1;
    if(G.kick&&!stg.kickOff&&P.K&&P.K[s]&&(s===0||kv>0))this.tKickHit(t,P.K[s]*(s===0&&sec!=='rise'?1:kv)*(bk?0.7:1));
    if(bk&&G.snare)this.tBreak(tt,s,sd,sec,bi,P.B,stg,(P.lo?0.72:1)*(sec==='rise'?0.8:1));
    if(G.snare&&(stg.snareFull||ph!=='build'||s===12||s===8)){const sv=sec==='rise'?0.8:1;if(P.S&&P.S[s]){const g=this.playS((this.rr=!this.rr)?K.s1:K.s2||K.s1,tt,P.S[s]*0.95*sv,this.bus.snare);this.send(g,this.rev,0.22);if(P.S[s]>0.5)this.duckLead(tt,0.7)}
      if(P.C&&P.C[s]){const g=this.playS(K.cl,tt,P.C[s]*0.66*sv,this.bus.snare);this.send(g,this.rev,0.3)}
      if(P.G&&P.G[s])this.playS(K.sg||K.s2,tt,P.G[s],this.bus.snare);
      if(this.rA>1&&(P.S&&P.S[s]||P.C&&P.C[s])&&(sec==='drop'||sec==='b'))this.playS(K.cl,tt+0.004,0.18,this.bus.snare)}
    if(G.hat){const hd=ph!=='build'||stg.hatDense;if(P.H&&P.H[s]&&hd)this.playS((this.hr=!this.hr)?K.h1:K.h2,tt,P.H[s]*0.7,this.bus.hat);else if(this.rA&&s%2===1&&hd&&!(P.H&&P.H[s]))this.playS(K.h2,tt,0.14,this.bus.hat);
      if(P.O&&P.O[s])this.playS(K.ho,tt,P.O[s]*0.45,this.bus.hat);if(P.R&&P.R[s]&&T.fx.includes('ride')&&K.rd)this.playS(K.rd,tt,P.R[s]*0.5,this.bus.hat)}
    if(P.P&&P.P[s]&&K.sb)this.playS(K.sb,tt,P.P[s]*0.55,this.bus.snare);if(P.N&&P.N[s]&&K.nz)this.playS(K.nz,tt,P.N[s]*0.7,this.bus.snare);if(P.T&&P.T[s])this.tom(tt,P.T[s]>0.45?1:P.T[s]>0.35?2:3,P.T[s]);
    if(stg.fillBar&&s>=12&&!bk&&G.snare)this.tFill(tt,s,sd)},
  /* a build's snare roll, a little under the old one so the drop lands harder than the build */
  tRoll(t,p){const K=this.kit;if(!K)return;const g=this.playS(K.s1,t,(0.16+0.5*p*p)*0.85,this.bus.snare,0,1+0.3*p);this.send(g,this.rev,Math.round((0.12+0.4*p)*10)/10)},
  tFill(t,s,sd){const f=this.tD.fill,i=s-12,K=this.kit;
    if(f==='clap'){this.playS(K.cl,t,0.3+0.1*i,this.bus.snare);if(i>=2)this.playS(K.cl,t+sd/2,0.35+0.1*i,this.bus.snare)}
    else if(f==='hats'){for(let k=0;k<(i>=2?3:2);k++)this.playS(K.h1,t+k*sd/(i>=2?3:2),0.25+0.05*i,this.bus.hat)}
    else if(f==='stutter'){if(i===0&&this.T.fx.includes('scratch')&&this.vbuf&&this.vbuf.s_sc)this.fxS('s_sc',t,0.45,this.bus.snare);else{this.playS(K.s1,t,0.4+0.1*i,this.bus.snare);this.playS(K.s1,t+sd/2,0.3+0.1*i,this.bus.snare)}if(i===3)this.tKickHit(t,0.8)}
    else{this.playS(K.s1,t,0.35+0.17*i,this.bus.snare)}},
  /* the break: the buffer for this template's tempo, re-edited bar by bar */
  tBrk(){const T=this.T,D=this.tD;if(!D||!D.brk)return null;
    if(D.brk==='arov'){const L='abde'[this.st.seed%4],k='arov'+L,V=this.vbuf;if(TCACHE.brk[k])return TCACHE.brk[k];const b=V&&V['x_lp_ar_'+L];if(!b)return null;
      /* a recorded loop (Arovane, two bars at 130 bpm): chopped on its own grid and played at the tune's tempo */
      const x=b.getChannelData(0),rb=new AudioBuffer({length:b.length,sampleRate:b.sampleRate,numberOfChannels:1}),y=rb.getChannelData(0);for(let i=0;i<x.length;i++)y[i]=x[x.length-1-i];
      return TCACHE.brk[k]={b,rb,sd:b.duration/32,n:32,rec:true}}
    return TCACHE.brk[D.brk+'|'+T.b+'|'+(T.kit||0)]||null},
  tBreak(t,s,sd,sec,bi,mode,stg,lv){const B=this.tBrk();if(!B)return;const hb=this.hb||0;
    if(s===0||!this.tBq){const ed=Math.min(3,(this.T.ed||0)+mode-1),r=rng((Math.imul(this.st.seed+7,0x9E3779B1)^Math.imul(hb+1,2246822519)^(sec.length<<20))>>>0||1),base=(hb%4)*16,q=[];
      for(let i=0;i<16;i++)q.push({x:base+i,rt:1,rv:0,sub:0,on:1});
      const p=[0.12,0.3,0.5,0.85][ed],fillB=stg.fillBar||((hb%8)===7);
      const E={roll:()=>{const sub=ed>=2;for(let i=12;i<16;i++)Object.assign(q[i],{x:4,rt:1+0.06*(i-12),sub:sub?1:0})},rep:()=>{for(let i=8;i<12;i++)q[i].x=base+i-8},
        swap:()=>{const o=((hb+1)%4)*16;for(let i=0;i<8;i++)q[i].x=o+i},rev:()=>{q[12].rv=1;q[12].x=12;for(let i=13;i<16;i++)q[i].on=0},rush:()=>{q[14].x=0;q[15].x=0;q[15].rt=0.85},
        chop:()=>{const c=[8,9,10,8,9,10,8,9];for(let i=8;i<16;i++)q[i].x=base+c[i-8]},
        core:()=>{for(let i=0;i<16;i++){const x=r();if(x<0.3)q[i].sub=1;else if(x<0.45)q[i].rt=[0.5,0.75,1.5,2][Math.floor(r()*4)];else if(x<0.52)q[i].on=0;if(r()<0.35)q[i].x=Math.floor(r()*64)}}};
      const ks=ed>=3?['core','roll','chop','rev','rush']:['roll','rep','swap','rev','rush','chop'];
      if(fillB)E[ed>=3?'core':'roll']();else if(r()<p){E[ks[Math.floor(r()*ks.length)]]();if(ed>=2&&r()<p*0.6)E[ks[Math.floor(r()*ks.length)]]()}
      this.tBq=q}
    const e=this.tBq[s];if(!e||!e.on)return;const N=B.n||64,x=e.x%N,d=sd*(e.sub?0.5:1),v=(B.rec?0.3:0.62)*lv,B0=e.rv?B.rb:B.b,off=e.rv?(N-1-x)*B.sd:x*B.sd,rt=e.rt*(B.rec?B.sd/sd:1);
    this.slice(B0,t,Math.max(0,off),d*(e.sub?1:1.02),rt,v,this.bus.snare);if(e.sub)this.slice(B0,t+d,Math.max(0,off),d,rt*1.03,v*0.9,this.bus.snare)},
  tPerc(t,s,sd,sec,hb){const PX=this.percX,V=this.vbuf;if(PX.loop){const b=V[PX.loop];if(b&&s%8===0){const bd=sd*16,rate=b.duration/bd,half=b.duration/2,off=s===0?0:(hb%4===3?0:half);this.slice(b,t,off,bd/2,rate,0.24,this.bus.snare)}return}
    const e=PX.p[s];if(e)for(const[k,v]of e){const b=V[k];if(b){const g=this.playS(b,t,v*(sec==='drop'?0.55:0.45),this.bus.hat);this.send(g,this.rev,0.12)}}},
  tDropFx(t,bl,key){const T=this.T,V=this.vbuf;let d=((key)%12+12)%12;if(d>6)d-=12;
    if(T.fx.includes('subdrop')){if(V&&!this.lite&&V.x_bass_drop_c){const g=this.playS(V.x_bass_drop_c,t,0.42,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.1)}else this.saw(36+((key%12)+12)%12,t,0.7,{tag:'sub',type:'sine',vol:0.09,cut:300,from:48+((key%12)+12)%12,glide:0.6,a:0.005,rel:0.2,dest:this.bus.bass})}
    if(bl>999&&V&&!this.lite&&V.x_bass_drop_c&&!T.fx.includes('subdrop')){const g=this.playS(V.x_bass_drop_c,t,0.3,this.bus.bass,0,Math.pow(2,d/12));this.send(g,this.rev,0.1)}},
  tPad(t,sd,s,ch,sec,ph,key,hb){const T=this.T,P=TPD[T.pd],steps=this.chordRun(hb,s);this.padUntil=this.pos+steps;const brk=sec==='brk'||sec==='out'||sec==='rise'||sec==='solo';
    const Q=P||(brk?TPD.dark:null);if(!Q)return;const notes=new Set(ch.tones.map(tn=>48+key+((tn%12)+12)%12)),dur=sd*steps+0.8,V=this.vbuf;
    if(Q.smp&&V&&!this.lite&&V[Q.smp[0]]){const b=V[Q.smp[0]];for(const m of notes){let dd=((m-60-Q.smp[1])%12+12)%12;if(dd>6)dd-=12;const g=this.playS(b,t,(brk?0.13:0.1),this.bus.pad,Math.min(b.duration*Math.pow(2,-dd/12),dur),Math.pow(2,dd/12));this.send(g,this.rev,0.5)}return}
    const lvl=P?1:0.6;for(const m of notes)this.saw(m,t,dur,{tag:'pad',vol:Q.vol*(brk?1.15:1)*lvl,voices:Q.voices,spread:Q.spread,cut:Q.cut*(brk?1.3:1)*(this.rE?1+0.25*this.rE:1),a:ph==='build'?0.8:Q.a,rel:Q.rel,rev:Q.rev,vib:Q.vib,dest:this.bus.pad});
    if(T.fx.includes('drone')&&(sec==='solo'||sec==='brk'||sec==='out')&&s===0){const r0=36+((key%12)+12)%12;for(const m of[r0,r0+7,r0+12])this.saw(m,t,dur,{tag:'drone',voices:2,spread:6,cut:900,vol:0.02,a:0.8,rel:1,rev:0.5,dest:this.bus.pad})}},
  tBassStep(t,s,sd,ch,sec,bi,key,hb){const T=this.T,BF=this.tBF,B=(sec==='b'||sec==='sw')&&this.tBassB?this.tBassB:this.tBass;if(!B)return;const ls=B.span>16?(hb%2)*16+s:s,es=B.at[ls];if(!es)return;
    const half=sec==='sw'&&T.side===0&&T.d!=='half';
    for(const e of es){if(half&&ls%8!==0)continue;const o={...this.tBP,tag:'bass',a:0.003,rel:0.03};const root=36+((key+ch.deg)%12+12)%12+(o.o||0);let m=root+(e[2]||0);
      if(BF[0]==='line'&&m>root+14)m-=12;if(e[3]){o.env=(o.env||0)*1.6;o.vol*=1.25}if(e[4]||o.glide){o.from=this.lastBass;o.glide=o.glide||0.05}
      if(o.wob&&BF[0]==='growl'){const rates=[1,2,3,4,2,1.5];o.wob={rate:T.b/60*rates[(ls+hb)%rates.length],depth:o.wob.depth}}
      o.dest=o.d==='dN'?this.dN:o.d==='dB'?this.dB:this.bus.bass;const d=sd*(half?Math.max(e[1],4):e[1])*(o.len||0.9);this.bassNote(m,t,d,o);this.lastBass=m}},
  /* a melodic note on an instrument: a recording when loaded (and not Lite), otherwise its synth stand-in */
  tV(inst,m,t,dur,v,dest,sl){dest=dest||this.bus.lead;const V=this.vbuf;
    if(inst==='sitar'){const mr=Math.round(m),b0=mr-((mr-43)%2+2)%2,b=TCACHE.sitK===((this.st.key%12)+12)%12&&TCACHE.sit[b0],rt=Math.pow(2,(m-b0)/12);if(b&&!this.lite){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=b;
        if(sl){src.playbackRate.setValueAtTime(rt*Math.pow(2,sl/12),t);src.playbackRate.linearRampToValueAtTime(rt,t+Math.min(0.14,dur*0.45))}else src.playbackRate.value=rt;g.gain.setValueAtTime(v*0.5,t);g.gain.setValueAtTime(v*0.5,t+Math.min(b.duration,dur+0.6));g.gain.linearRampToValueAtTime(0,t+Math.min(b.duration,dur+0.6)+0.08);
        src.connect(g);g.connect(dest);this.send(g,this.rev,0.3);src.start(t);src.stop(t+Math.min(b.duration,dur+0.7));src.onended=()=>{try{g.disconnect()}catch(e){}};return g}inst=TFALL.sitar}
    const S=TSMP[inst];if(S){const b0=S[1].reduce((a,x)=>Math.abs(x-m)<Math.abs(a-m)?x:a,S[1][0]),buf=V&&!this.lite?V[S[0]+b0]:null;
      if(buf){const g=this.playS(buf,t,v*S[2],dest,Math.min(buf.duration,dur+0.35),Math.pow(2,(m-b0)/12));this.send(g,this.hall,S[3]);return g}inst=TFALL[inst]||'pluck'}
    return this.tSyn(inst,m,t,dur,v,dest)},
  /* the synth voices (the Prototype 25-38 lead patches, plus cowbell, screech, horn, eurobeat lead, square, hoover, acid) */
  tSyn(P,m,t,dur,v,dest){const prevL=this.lastLead;this.lastLead=m;const o=(x)=>({tag:'lead',dest,...x,vol:x.vol*v});
    switch(P){case'clip':return this.saw(m,t,dur*0.9,o({voices:2,spread:10,cut:6000,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipL}));
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
  tPitch(p,key,inst,R){const reg=TREG[inst]||this.tReg||[60,79],c=(reg[0]+reg[1])/2,mid=R?(R[0]+R[1])/2:p,off=Math.round((c-(60+key+mid))/12)*12;let m=60+key+p+off;while(m<reg[0]-7)m+=12;while(m>reg[1]+7)m-=12;return m},
  tMel(t,s,sd,ch,sec,bi,bl,stg,key,hb,ph){const T=this.T,G=this.gate,role=T.l,reg=this.tReg,brk=sec==='brk'||sec==='out',lift=this.rE>1;
    if(brk&&s===0&&G.keys)this.tBrkKeys(t,sd,ch,bi,sec,key);
    if(s===0&&ph==='groove'){const bd=sd*16;if(sec==='brk'&&bi===0){if(T.fx.includes('siren'))this.siren(t,bd*2,0);if(T.fx.includes('dsiren'))this.siren(t,bd,1)}
      if(sec==='drop'&&bi===7&&bl===16){if(T.fx.includes('siren'))this.siren(t,bd*2,0);if(T.fx.includes('dsiren'))this.siren(t+sd*8,bd*0.5,1)}}
    if(sec==='rise'&&this.T.fx.includes('shout')&&stg.gapEnd!==undefined&&bl-bi===1&&s===0&&this.vbuf)this.sing(this.st.seed%2?'c_herewego':'c_letsgo',t+4*sd,key,0.5);
    if(G.lead||G.resp||G.arp||G.keys){
      if(this.tHook&&(G.lead||G.resp)){const H=this.tHook,ls=(hb%(H.L/16))*16+s,es=H.at[ls];
        const mode=ph==='build'?(stg.bassFull?'thin':'off'):sec==='drop'?(bl>999&&bi>=4||lift&&bi>=4?'full':bi<4?'off':bi<8?'half':'full'):sec==='b'?(bi<8?'alt':'off'):sec==='a'?(T.kz?'keys':'half'):'off';
        if(es&&mode!=='off')for(const e of es){const inBar=e.s%64;if(mode==='half'&&inBar>=32)continue;if(mode==='thin'&&e.s%4!==0)continue;
          const inst=mode==='keys'?T.kz:mode==='alt'&&T.l2&&role!=='call'?T.l2:T.li,p=mode==='alt'&&!T.l2&&inBar>=48?snap(e.p+(e.p>4?-2:2),this.scale):e.p,m=this.tPitch(p,key,inst,this.tHR),d=sd*(mode==='thin'?Math.max(e.d,4):e.d);
          if(role==='call'&&inBar>=32)continue;this.tV(inst,m,t,d,mode==='thin'?0.6:mode==='keys'?0.8:1,mode==='keys'?this.xKeys():this.bus.lead)}
        if(this.tResp&&G.resp&&(sec==='drop'||sec==='b'||sec==='a')){const R=this.tResp,es2=R.at[(hb%4)*16+s];if(es2)for(const e of es2)this.tV(T.l2,this.tPitch(e.p,key,T.l2,this.tHR),t,sd*e.d,0.9,this.bus.resp)}}
      if(this.tRiff&&G.lead){const R=this.tRiff,useB=sec==='b'||sec==='sw'||(sec==='drop'&&hb%4===3),go=sec==='drop'&&!(bi<4&&T.f!=='techno')||sec==='b'||sec==='sw'||(sec==='rise'&&bl-bi>4)||ph==='build'&&stg.bassFull;
        if(go&&!(role==='solo'&&sec!=='drop')){const ls=R.n>16?(hb%2)*16+s:s,es=(useB?R.B:R.A)[ls];if(es)for(const e of es){let p=e.p;if(R.fol){p=snap(p+ch.deg,this.scale)}const m=this.tPitch(p,key,T.li,this.tRR);
          this.tV(T.li,m,t,sd*e.d,sec==='a'||sec==='rise'||ph==='build'?0.6:0.9,this.bus.lead,T.li==='sitar'&&e.d>=2&&(hb+ls)%3===0?-1:0)}}}
      if(role==='solo')this.tSoloStep(t,s,sd,sec,bi,bl,key,hb);
      if(this.tChop&&(G.lead||G.resp)&&this.vbuf&&!this.lite){const C=this.tChop;if((sec==='drop'&&bi>=4||sec==='b'&&bi<12)&&hb%2===0&&C.R.includes(s)){const w=C.w[(s>8?1:0)],tn=ch.tones,pc=((key+tn[(C.R.indexOf(s)+C.sh)%tn.length])%12+12)%12;this.sing(w,t,pc,0.36)}
        else if(brk&&bi%4===1&&s===0)this.sing(bi%8===1?'c_feel':'c_higher',t,key,0.36)}
      if(this.tStab&&G.lead){const R=sec==='b'?this.tStab.R2:this.tStab.R;if((sec==='drop'||sec==='b'||sec==='a'||sec==='sw')&&R.includes(s)&&!(sec==='a'&&s%4!==2)){const v=this.tVoice(ch,key,T.li);for(const m of v)this.tV(T.li,m,t,sd*(T.li==='pn'||T.li==='or'?2:1.2),0.55,this.bus.lead)}}
      if(this.tComp&&G.keys&&T.kz&&(sec==='drop'||sec==='b'||sec==='a'||sec==='solo')&&(role==='keys'||sec==='a'||sec==='solo')){const R=this.tComp.R;if(R.includes(s)){const v=this.tVoice(ch,key,T.kz);for(const m of v)this.tV(T.kz,m,t,sd*(s===0?3:1.5),0.5,this.xKeys())}
        if(role==='keys'&&sec==='drop'&&bi>=8&&hb%2===1&&(s===6||s===10||s===12)){const p=degP(this.scale,[4,3,2][[6,10,12].indexOf(s)]);this.tV(T.kz,this.tPitch(p+12,key,T.kz,[0,12])+12,t,sd*2,0.55,this.xKeys())}}
      if((this.tArpP||this.tArpLine)&&G.arp&&sec!=='sw'){const lead=role==='arp',inst=lead?T.li:T.ar==='gallop'?'square':'pluck';
        const slow=brk||sec==='a'&&!lead,step=slow?(s%4===0):true;if(step&&!(sec==='rise'&&bl-bi<=1)){let m=null;
          if(this.tArpLine){const L=this.tArpLine,e=L[this.pos%L.length],st0=MSTEP[((e%12)+12)%12]+7*Math.floor(e/12);m=this.tPitch(degShift(snap(ch.deg,this.scale),st0,this.scale)-12,key,inst,[-12,12])}
          else{const ix=this.tArpP[s];if(ix>=0){const tn=[...ch.tones.slice(0,3),ch.tones[0]+12];m=this.tPitch(tn[ix%4],key,inst,[0,14])}}
          if(m!=null)this.tV(inst,m,t,sd*(slow?3:1),lead?(slow?0.6:0.85):0.5,this.bus.arp)}}}
    if(ph==='groove'&&(sec==='drop'||sec==='b')){if(T.fx.includes('zap')&&s%4===3&&(hb+s)%5===0)this.zap(72+key,t,sd*2);
      if(T.fx.includes('stutter')&&hb%4===3&&s===12&&this.lastLead!=null&&(this.st.seed+hb)%3===0)this.stutter(t,sd);if(T.fx.includes('glitch')&&s===14&&hb%2===1&&this.vbuf)this.fxS(hb%4===1?'s_g1':'s_g3',t,0.3,this.bus.snare)}},
  /* a chord voiced for an instrument: three tones in its range (power chords for industrial) */
  tVoice(ch,key,inst){const reg=TREG[inst]||[55,72],lo=Math.max(reg[0],52),out=[];for(const tn of ch.tones.slice(0,3)){let m=48+key+tn;while(m<lo)m+=12;while(m>lo+14)m-=12;out.push(m)}return out},
  tBrkKeys(t,sd,ch,bi,sec,key){const T=this.T,K=T.kz||(T.li&&TSMP[T.li]&&T.l!=='riff'?T.li:null);if(!K)return;const bd=sd*16,v=this.tVoice(ch,key,K);
    if(bi%2===0||T.l==='keys'||T.l==='pad'){for(const m of v)this.tV(K,m,t,bd*1.6,0.62,this.xKeys());const rp=((key+ch.deg)%12+12)%12;this.tV(K,36+rp+(rp>5?0:12),t,bd*1.8,0.55,this.xKeys())}
    if(sec==='brk'&&bi===0){if(T.fx.includes('choir'))this.choir(t,ch.tones.map(x=>60+((key+x)%12+12)%12))}},
  /* the solo: written fresh at the start of each solo section and breakdown; licks in the B section */
  tSoloStep(t,s,sd,sec,bi,bl,key,hb){const T=this.T;if(!this.gate.lead)return;const want=sec==='solo'||sec==='brk'?sec:sec==='b'?'lick':null;if(!want)return;
    if(s===0&&(bi===0||this.tSoloK!==want)){const bars=Math.min(16,bl>999?8:Math.max(2,bl-bi)),reg=TREG[T.li]||[60,79],r=rng((Math.imul(this.st.seed+3,0x9E3779B1)^Math.imul(hb+11,0x85EBCA6B))>>>0||1);
      const ev=tSoloGen(r,{sc:this.scale,hs:this.hscale,roots:this.roots,key:((key%12)+12)%12,bars,lo:reg[0],hi:reg[1],slide:T.li==='sitar'||T.li==='sx'||T.li==='sl'||T.li==='glide',calm:want!=='solo'});
      this.tSoloAt=[];for(const e of ev)(this.tSoloAt[e.s]||(this.tSoloAt[e.s]=[])).push(e);this.tSoloH=hb;this.tSoloK=want}
    if(this.tSoloK!==want||!this.tSoloAt)return;const rb=hb-this.tSoloH;if(want==='lick'&&Math.floor(rb/2)%2===1)return;const es=this.tSoloAt[rb*16+s];if(!es)return;
    for(const e of es)this.tV(T.li,e.p,t,sd*e.d,(e.v||0.8)*(want==='brk'?0.8:1),this.bus.lead,e.sl||0)},
  /* sirens: 0 an air-raid wail rising and falling, 1 a dub siren (a square swept by a fast triangle, into the echo) */
  siren(t,dur,kind){const c=this.ctx;if(!c)return;const g=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.value=kind?1400:1100;bp.connect(g);g.connect(this.fxIn);this.send(g,this.rev,0.5);if(kind)this.send(g,this.dly,0.45);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind?0.05:0.045,t+(kind?0.05:dur*0.3));g.gain.setValueAtTime(kind?0.05:0.045,t+dur*0.7);g.gain.linearRampToValueAtTime(0,t+dur);
    const os=[];for(const dt of kind?[0]:[-8,8]){const o=c.createOscillator();o.type=kind?'square':'sawtooth';o.detune.value=dt;os.push(o);o.connect(bp)}
    if(kind){const l=c.createOscillator(),lg=c.createGain();l.type='triangle';l.frequency.value=6;lg.gain.value=180;l.connect(lg);lg.connect(os[0].frequency);os[0].frequency.setValueAtTime(500,t);os[0].frequency.linearRampToValueAtTime(900,t+dur);l.start(t);l.stop(t+dur+0.05)}
    else for(const o of os){o.frequency.setValueAtTime(260,t);o.frequency.linearRampToValueAtTime(820,t+dur*0.45);o.frequency.linearRampToValueAtTime(240,t+dur)}
    for(const o of os){o.start(t);o.stop(t+dur+0.05)}os[os.length-1].onended=()=>{try{g.disconnect()}catch(e){}}},
  tInfo(){const st=this.st,T=this.T;const R={none:'no lead',riff:'riff',hook:'hook',doc:"the guide's line as the hook",solo:'solo',arp:'arpeggios',chops:'vocal chops',stabs:'chord stabs',pad:'pads',keys:'keys',call:'call and response'}[T.l]||T.l;
    const I=x=>x?({pn:'grand piano',ep:'electric piano',up:'upright piano',hp:'harp',sitar:'sitar',sx:'tenor sax',sl:'saxello',cowbell:'808 cowbell',ka:'kalimba',vb:'vibraphone',mb:'marimba',st:'strumstick',cv:'clavisynth',or:'pipe organ',organ:'organ',screech:'screech',bell:'FM bell',brass:'brass',horn:'horn stabs',hsaw:'supersaw',stadium:'stadium supersaw',glide:'glide lead',clip:'clipped saw',pwm:'pulse lead',reso:'resonant stab',techstab:'drive stab',acidl:'acid',hoover:'hoover',square:'square lead',eurolead:'eurobeat lead',euro:'euro pluck',pluck:'pluck',pluck16:'16th pluck',prog:'progressive pluck',soft:'soft lead',arp12:'square-saw',xy:'xylophone',hm:'hand chimes'}[x]||x):'';
    return`${T.n} · ${T.sub} · ${KEYS[st.key]} ${{minor:'minor',harm:'harmonic minor',dorian:'dorian',phryg:'phrygian',phrdom:'phrygian dominant',major:'major',mixo:'mixolydian'}[T.m]} · ${Math.round(this.bpm)} bpm · ${R}${T.li&&T.l!=='none'&&T.l!=='chops'?' on '+I(T.li):''}${T.l2?' and '+I(T.l2):''}${T.kz&&T.kz!==T.li?' · '+I(T.kz)+' chords':''} · template ${T.id} of ${TPL.length}`},
