//# music/engine/037-tune-state.js: music: tune state, codes, freshTune (picks a template), library mode
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- tunes: state, codes ---- */
  randomState(r,k){const trance=k&&typeof k==='object'?!!k.style:!!k,mx=k&&typeof k==='object'&&k.mx?1:0,theme=Math.floor(r()*THEMES.length),x=r();return{style:trance?1:0,mx,theme,key:THEMES[theme].key,prog:r()<0.1?0:1+Math.floor(r()*7),groove:Math.floor(r()*4),mut:[0,0,0],timbre:Math.floor(r()*8),rng:Math.floor(r()*128),
    flav:mx?(x<0.6?0:1):trance?(x<0.3?1:0):(x<0.7?0:x<0.85?2:1),hook:1,resp:r()<0.92?0:1+Math.floor(r()*3),bp:r()<0.5?1+Math.floor(r()*5):0,lib:0,kx:Math.floor(r()*8)|(r()<0.7?1+Math.floor(r()*7):0)<<3|(r()<0.5?64:0)}},
  /* Which kind of tune comes next: one style, or with both on a blend (either tempo), either style at random, or the
     other style from the one playing. A single style draws nothing from r, so its tunes are the same as before. */
  kind(r,room){const s=this.style;if(s==='trance')return true;if(s!=='both')return false;const b=this.both;
    if(b==='blend')return{style:r()<0.5?1:0,mx:1};const p=this.st;
    if(b==='turn'&&p&&!room)return{style:p.style?0:1,mx:0};return{style:r()<0.5?1:0,mx:0}},
  /* attach a library entry (in its own key) to a fresh state */
  withLib(st,r){if(r()<0.3){st.lib=pickLib(r,libSide(st),libFk(st),!!st.mx);if(st.lib){st.bp=0;const b=bpOf(st);if(b)st.key=b.tonic}}return this.withX(st,r)},
  withX(st,r){st.kx2=(r()<0.45?1+Math.floor(r()*3):0)|(r()<0.45?1+Math.floor(r()*7):0)<<2|(r()<0.5?1+Math.floor(r()*3):0)<<5|(r()<0.5?128:0);return st},
  fromTrack(seed){if(!this.pinned){this.tSeed=seed;this.rSeq=0;this.rPrevF=null;this.rRot=null;this.raceHome=null;this.tRotHome();/* Prototype 61: picking a track in a menu (Career, Play, a new seed) only readies that track's race tune; the music already
       playing in the menu carries on. cueRace takes raceHome when the race starts. */
      if(this.st&&this.timer&&(this.mood==='menu'||this.mood==='listen')){this.pgWant();return}const st={...this.raceHome,mut:[...this.raceHome.mut]};this.setState(st);return}this.tSeed=seed;if(this.pinned)return;let room=false;try{room=!!mp.on}catch(e){}
    this.setState(mFresh(i=>{const r=rng((((seed^0x5EED)>>>0)+Math.imul(i,0x9E3779B1)>>>0)||1);return this.withLib(this.randomState(r,this.kind(r,room)),r)},room?1:12))},
  newTune(){const wasH=this.raceHome&&this.st&&codeOf(this.st)===codeOf(this.raceHome);const pc=this.code(),pl=this.played();if(this.T&&pl!=null&&pl<20)MLIKE.add(this.T.id,-1);this.pinned=false;this.setState(this.freshTune());this.mlog('tune',{why:'next',code:this.code(),tpl:this.T?this.T.id:undefined,prev:pc||undefined,played:pl});let room=false;try{room=!!mp.on}catch(e){}if(wasH&&!room&&this.mood!=='race'&&this.mood!=='count')this.raceHome={...this.st,mut:[...this.st.mut]}},
  freshTune(){if(this.libMode==='lib'){const s=this.tLibPick(this.st?codeOf(this.st):null);if(s)return s}return this.tFresh(()=>this.tRandom(rng((Math.random()*4294967296)>>>0),this.T?this.T.f:null),12);return mFresh(()=>{const r=rng((Math.random()*4294967296)>>>0);return this.withLib(this.randomState(r,this.kind(r)),r)},12)},
  load(code){const st=parseTune(code);if(!st)return false;this.pinned=true;this.raceHome=null;if(st.mx){this.style='both';this.both='blend';store.set('hoverline.mboth','blend')}else if(this.style!=='both')this.style=st.style?'trance':'dnb';store.set('hoverline.music',this.style);this.setState(st);this.mlog('tune',{why:'load',code:this.code()});return true},
  code(){return this.st?codeOf(this.st):''},
  info(){const st=this.st;if(!st)return'';if(this.T)return this.tInfo();const th=THEMES[st.theme],muts=st.mut.filter(m=>m).map(m=>MUT_NAMES[m]),fk=flavOf(st);
    return`${st.mx?(st.style?'trance breaks':'trance & bass'):FLAVN[fk]} · ${KEYS[st.key]} ${fk==='psy'?'phrygian':this.minor?'minor':'major'} · ${fk==='metal'?'guitar':this.leadPatch?{clip:'clipped saw lead',hsaw:'supersaw lead',epiano:'electric piano',stadium:'stadium supersaw',euro:'pluck lead',pluck:'pluck lead',prog:'progressive pluck',fm:'FM lead',bell:'FM bell',vox:'vocal lead',soft:'soft triangle lead',brass:'brass lead',pwm:'pulse lead',organ:'pulse organ',snap:'snapping lead',dip:'dipping lead',octsine:'octave lead',warm:'warm saw lead',glide:'glide lead',techstab:'drive stab',reso:'resonant stab'}[this.leadPatch]||'synth lead':TIMBRES[st.timbre].n+' lead'}${this.respK?' · '+RESPN[this.respK]+' answers':''}${muts.length?' · '+muts.join(', '):''}${this.bp?' · blueprint: '+this.bp.n.toLowerCase():''}${this.hookIdx!=null?' · hook '+this.hookIdx.toLocaleString('en')+' of 68,719,476,736':''}${this.keysI?' · '+(INSTX[this.keysI]?INSTX[this.keysI].n:this.keysI==='pn'?'piano':'electric piano'):''}${this.kit2&&KITX2[this.kit2]?' · '+KITX2[this.kit2].n:(st.kx&7)&&KITX[st.kx&7]&&(fk!=='metal'||(st.kx&7)===6)?' · '+KITX[st.kx&7].n:''}${this.texR?' · '+this.texR.n:''}${this.percX?' · '+this.percX.n:''}${this.vocal?' · vocals':''}${this.evo?' · evolving':' · steady'}`},
  kept(){try{return JSON.parse(store.get('hoverline.tunes')||'[]')}catch(e){return[]}},
  keep(){const c=this.code();if(!c)return c;this.mlog('keep',{code:c,played:this.played()});let list=this.kept();if(!list.includes(c)){if(this.T)MLIKE.add(this.T.id,2);list.unshift(c);list=list.slice(0,100);store.set('hoverline.tunes',JSON.stringify(list))}return c},
  forget(c){store.set('hoverline.tunes',JSON.stringify(this.kept().filter(x=>x!==c)))},
  setState(st,blend){this.swPl=null;this.st=st;this.tLibSeen(st);if(!blend){MHIST.add(st);this.tuneAt=this.ctx?this.ctx.currentTime:null}this.rwDone=false;this.gOff=0;this.base={...st,mut:[...st.mut]};if(!blend)this.home={...st,mut:[...st.mut]};this.r=rng((packState(st)^Math.imul(packHi(st),0x01000193)^0x9E3779B9)>>>0);this.build();this.movement=0;this.revealAt=-1;this.themeChanged=false;
    if(this.phase==='ambient')this.amb.omen=true;if(this.pgOn&&this.pg&&this.pg.code!==codeOf(st)){this.pgStop();if(this.mood==='race')this.pgLate=true}if(!blend)this.pgWant();this.changed()},
  changed(){if(this.onChange)try{this.onChange()}catch(e){}},
  build(){if(this.st&&this.st.tp)return this.buildT();this.T=null;const st=this.st,trM=this.trM=st.style===1||!!st.mx,mf=st.mx?'trance':null,th=this.theme=THEMES[st.theme]||THEMES[0],fk=this.fk=flavOf(st),dark=fk==='metal'||fk==='psy',bp=this.bp=st.hook?bpOf(st):null,minor=this.minor=dark||(bp?bp.mode==='minor':th.mode!=='major');
    this.scale=fk==='psy'?SC.phryg:minor?SC.minor:SC.major;this.hscale=fk==='psy'?SC.phryg:minor?SC.harm:SC.major;
    this.prog=fk==='psy'?PROGS.phryg[Math.max(0,st.prog-1)%7]:st.prog?PROGS[minor?'minor':'major'][(st.prog-1)%7]:bp?PROGS[minor?'minor':'major'][0]:dark&&th.mode==='major'?PROGS.minor[0]:th.prog;const P=this.prog;this.roots=P.length===8?[P[0],P[2],P[4],P[6]]:P;
    this.pw=fk==='metal'||(!!th.pw&&!st.prog&&!dark);this.trR=st.style===1&&!st.mx;{const rf=mf||fk;this.respK=st.resp?RESP[rf][(st.resp-1)%RESP[rf].length]:null}
    this.themeEv=toEvents(th.notes);
    const mk=(st.rng*7919^st.theme<<8^st.groove<<12^st.prog<<16^st.style<<20^(st.mx?1:0)<<21^(st.hook?(st.flav+1)<<24:0)^(st.bp||0)<<27^0xA5F00D)>>>0;
    if(this.motifKey!==mk){this.motifKey=mk;if(bp&&bp.role==='lead'){this.motif=makeBpHook(bp,this.scale,this.hscale,this.roots);this.hookIdx=null}else if(st.hook){const h=makeHook(rng(mk),this.scale,this.hscale,this.roots,mf||fk,((mk>>>5)%100)<50);this.motif=h.ev;this.hookIdx=h.idx}else{this.motif=makeMotif(rng(mk),minor,this.roots,trM);this.hookIdx=null}}
    {const ps=(this.motif||[]).map(e=>e.p);this.lOct=ps.length?Math.round((64-(60+st.key+(Math.min(...ps)+Math.max(...ps))/2))/12)*12:0}
    this.anthem=bp&&bp.role==='lead'?st.rng%2===0:st.rng%5===0;
    this.vocal=(st.rng*7+st.key*3+st.groove)%4===0&&fk!=='metal';
    {const ih=(Math.imul(st.rng+1,2654435761)^(st.theme*97+st.groove*31+st.key*7))>>>0,ok=fk!=='metal'&&fk!=='psy';
      const kx=st.kx||0,kv=kx&7,ic=kx>>3&7,ck=ic?(XI_FL[mf||fk]||[])[(ic-1)%7]:null,cls=ok?[null,'pn','pn','ep',null,'pn',null,'ep'][ih%8]:null;
      /* a new instrument takes over where the piano or electric piano would play, and in half the psytrance tunes */
      this.keysI=ck&&(cls||fk==='psy'&&(ih>>>8)%2===0)?ck:cls;this.sparkI=ck&&INSTX[ck]&&!['or','sx','rc','cb'].includes(ck)?ck:null;
      const k2=st.kx2||0,kt2=k2&3,i2=k2>>2&7,tx2=k2>>5&3,ck2=i2?(XI2_FL[mf||fk]||[])[(i2-1)%7]:null,tl=TEX_FL[mf||fk]||[];this.kit2=kt2&&(K2_FL[fk]||[]).length?K2_FL[fk][(kt2-1)%3]:0;
      if(ck2&&(this.keysI||fk==='psy'&&(ih>>>8)%2===0)){this.keysI=ck2;this.sparkI=ck2!=='sl'&&ck2!=='ps'?ck2:null}this.texR=tx2&&tl.length?TEXR[tl[(tx2-1)%tl.length]]:null;
      {const pl=PERC_FL[fk]||[],p2=k2&128?PERC2_FL[fk]||[]:[];this.percX=kx&64&&p2.length?PERCX[p2[(kv+ic+i2)%p2.length]]:kx&64&&pl.length?PERCX[pl[kv%pl.length]]:null}
      this.bhit=this.kit2?BHITX2[(this.kit2+i2)%BHITX2.length]:kv&&fk!=='metal'?BHITX[(kv+ic)%BHITX.length]:null;this.bell=trM&&fk!=='psy'&&ic>0&&ic%3===0;if(!this.lite&&this.ctx){this.ensureExt();this.ensureX2()}this.stabs=!!this.keysI&&fk==='dnb'&&(ih>>>3)%2===0;
      this.harp=trM&&fk!=='psy'&&(ih>>>4)%2===0;this.tymp=fk!=='metal'&&(ih>>>5)%3===0;this.cym=(ih>>>6)%2===0;
      this.shk=fk!=='metal'&&(ih>>>7)%3===0;this.clapS=trM&&(ih>>>9)%5<3} /* a quarter of the tunes have vocal chops, shouts and a choir */ /* a lead through the whole drop in about a third of tunes */
    let ev=this.motif;st.mut.forEach((m,i)=>{if(m)ev=mutate(ev,m,i,this.scale,this.roots)});this.variant=ev;this.leadCache={};this.useKit();
    const gi=bp&&bp.half&&(fk==='dnb'||fk==='metal')?2:(st.groove+(this.gOff||0))%4;this.psyTight=!!bp&&bp.patch==='psyroll';this.groove=GROOVES[fk][gi];this.bassPat=BASS[fk][gi];this.timbre=TIMBRES[st.timbre];this.arp=ARPS[gi];
    /* blueprint parts: lead sound, bass and arp lines by step, keys line by step over two bars */
    this.leadPatch=bp&&bp.role==='lead'&&fk!=='metal'&&bp.patch!=='saw'?bp.patch:null;this.leadDuck=this.leadPatch==='hsaw'?0.55:0;
    this.bpBass=this.bpArp=this.bpKeys=null;if(bp&&bp.role!=='lead'&&bp.role!=='style'){const{line,len}=bpLine(bp),a=[];for(const e of line)a[e.s]=e;this.bpLen=len;if(bp.role==='bass')this.bpBass=a;else if(bp.role==='arp')this.bpArp=bp.cycle?line:a;else this.bpKeys=a}
    if(bp&&(bp.patch==='arp12'||bp.patch==='dream'))this.ensureEchoes();
    if(this.dly&&this.dlyB!==this.bpm){const b=this.dlyB=this.bpm;this.dly.delayTime.value=60/b*0.75;this.dly2.delayTime.value=60/b*0.375;if(this.dly16){this.dly16.delayTime.value=60/b/4;this.dly8t.delayTime.value=60/b/3}}},
  /* Thinned theme: keep only notes on a grid of g sixteenths and let each ring until the next, so the tune is hinted before it is played. */
  thin(ev,g){if(g<=1||!ev.length)return ev;const n=Math.min(ev.length,Math.max({8:4,4:6,2:8}[g]||4,Math.ceil(ev.length/g)));
    const w=e=>(e.s%64===0?6:e.s%16===0?5:e.s%8===0?4:e.s%4===0?3:e.s%2===0?2:1)+Math.min(2,e.d/4);
    const k=ev.map((e,i)=>({e,i,w:w(e)})).sort((a,b)=>b.w-a.w||a.i-b.i).slice(0,n).sort((a,b)=>a.e.s-b.e.s).map(x=>x.e);
    return k.map((e,i)=>({s:e.s,p:e.p,v:e.v,d:Math.min(16,(i+1<k.length?k[i+1].s:64)-e.s)}))},
  leadFor(g,old){if(old)return this.prevVariant||null;const key='g'+g;return this.leadCache[key]||(this.leadCache[key]=this.thin(this.variant,g))},
  mutateNow(){if(this.evo&&this.drift!==this.lastDrift){this.lastDrift=this.drift;this.r=rng((packState(this.st)^this.drift)>>>0)}
    /* Pick a mutation that actually changes the current variant (e.g. ornaments do nothing to a run of sixteenths). */
    const r=this.r,st=this.st,cur=JSON.stringify(this.variant),order=(this.evo&&!(this.bp&&this.bp.role==='lead')?[1,2,3,4,5,6,7]:[5,6,7,4]).sort(()=>r()-0.5);
    for(const m of order){if(st.mut.includes(m))continue;const old=st.mut;st.mut=[old[1],old[2],m];this.build();if(JSON.stringify(this.variant)!==cur){this.changed();return}st.mut=old}
    this.build()},
  restoreTheme(){this.st.mut=[0,0,0];this.build();this.changed()},
  evolve(){if(!this.evo||this.mood==='race'||this.mood==='results'){this.movement++;if(this.r()<0.6){this.gOff=(this.gOff+1+Math.floor(this.r()*3))%4;this.build()}return}
    const r=this.r,st={...this.st,mut:[...this.st.mut]};this.movement++;this.prevVariant=this.variant;this.prevKey=st.key;
    if(this.movement%2===0||r()<0.25){st.theme=(st.theme+1+Math.floor(r()*(THEMES.length-1)))%THEMES.length;st.prog=0;st.mut=[0,0,0];const th=THEMES[st.theme];st.key=r()<0.6?th.key:(th.key+(r()<0.5?5:7))%12;this.themeChanged=true}
    else{if(r()<0.5)st.key=(st.key+[5,7,2,10][Math.floor(r()*4)])%12;if(r()<0.4)st.prog=Math.floor(r()*8)}
    if(r()<0.6)st.groove=Math.floor(r()*4);if(r()<0.5)st.timbre=Math.floor(r()*8);st.rng=Math.floor(r()*128);
    if(st.hook){const nf=flavList(st).length;if(r()<0.3)st.flav=((st.flav||0)+1+Math.floor(r()*(nf-1)))%nf;if(r()<0.4)st.resp=r()<0.9?0:1+Math.floor(r()*3);if(r()<0.4)st.bp=r()<0.3?0:1+Math.floor(r()*5);if(r()<0.45){st.lib=r()<0.25?0:pickLib(r,libSide(st),libFk(st),!!st.mx);if(st.lib)st.bp=0}else if(st.lib&&!(LIBSUB[libFk(st)]||[]).includes(LIB[LIBS[libSide(st)][st.lib-1]][7]))st.lib=0}
    this.st=st;this.build();this.padUntil=0;this.changed()},
  slot(hb,s){return this.prog.length===8?(hb%4)*2+(s>=8?1:0):hb%4},
  chordAt(hb,s){const deg=this.prog[this.slot(hb,s)];return{deg,tones:this.pw?[deg,deg+7,deg+12]:chordOf(deg,this.hscale)}},
  chordRun(hb,s){const P=this.prog,n=P.length,i=this.slot(hb,s);let k=1;while(k<n&&P[(i+k)%n]===P[i])k++;return k*(n===8?8:16)},
  plan(bd){if(this._plan&&this._plan.bd===bd)return this._plan;const full=Math.max(8,Math.round(30/bd/4)*4);return this._plan={bd,full,g8:Math.max(4,full-12),g4:full-8,g2:full-4,end:full+8}},
  /* Final lap: finish the current 4-bar phrase, then a short breakdown and build into a drop that lasts to the line. */
  finale(){if(this.pgOn)return this.pgFinal();const ns=this.swPl?((this.queue.find(q=>q[2])||[])[2]||null):null;if(ns&&this.phase==='groove'&&this.sec&&this.sec[0]==='out'){this.queue=[['rise',4,ns],['drop',1e9]];this.swPl={ns,how:'final lap'};return}this.finale0();if(ns){const ri=this.queue.findIndex(q=>q[0]==='rise');if(ri>=0&&this.sec&&this.sec[0]!=='rise'){this.queue[ri]=['rise',this.queue[ri][1],ns];this.swPl={ns,how:'final lap'}}else this.swPl=null}else this.swPl=null},
  finale0(){if(this.phase==='groove'&&this.sec){const[n,bi,bl]=this.sec;if(n==='drop'&&bl>999)return;
      if(n==='rise'||n==='rw'){this.queue=[['drop',1e9]];return}
      this.sec[2]=Math.min(bl,bi+1+((4-(bi+1)%4)%4));this.queue=n==='brk'?[['rise',4],['drop',1e9]]:[['brk',4],['rise',4],['drop',1e9]]}
    else this.finalPending=true},
  /* How present the lead is: off, call (first and third bars of the hook only), thin (the hook as slow bells) or full. */
  leadPlan(n,bi,bl){const tr=this.trM,an=tr||this.anthem;
    if(n==='drop')return bl>999?(bi<4?'call':'full'):bi<8?(an?'call':'off'):(an?'full':'call');
    if(n==='b')return bi<8?'full':'call';if(n==='a')return'call';if(n==='brk')return tr?'full':this.fk==='metal'?'off':'thin';
    if(n==='rise')return bl<=2?'off':bi<bl/2?'thin':'full';return'off'},
  nextSection(){if(this.queue.length){const[n,l]=this.queue.shift();this.sec=[n,0,l];return}
    const M=this.mv;this.mi=(this.mi+1)%M.length;if(this.mi===6&&!this.T)this.evolve();this.sec=[M[this.mi][0],0,M[this.mi][1]]},
