  /* ---- song templates (Prototype 43, rebuilt in Prototype 45, thinned in Prototype 46): choosing, building, the race
     sequence, the radio ---- */
  get mv(){return this.T&&!this.pgE?TSTRUCT[this.T.st]||TSTRUCT.std:MOV},
  /* Prototype 45: no more Drum & bass / Trance / Blend sides; kept for older callers */
  tSides(){return[0,1]},
  /* the genres switched on (Settings, Music), all by default */
  tGenOn(){if(this._gOn)return this._gOn;let off=[];try{off=JSON.parse(store.get('hoverline.mgoff')||'[]')}catch(e){}if(!Array.isArray(off))off=[];
    const on=GENRES.map(g=>g[0]).filter(g=>!off.includes(g));return this._gOn=on.length?on:GENRES.map(g=>g[0])},
  setGenre(g,on){let off=[];try{off=JSON.parse(store.get('hoverline.mgoff')||'[]')}catch(e){}if(!Array.isArray(off))off=[];off=off.filter(x=>x!==g);if(!on)off.push(g);
    if(off.length>=GENRES.length)return false;store.set('hoverline.mgoff',JSON.stringify(off));this._gOn=null;this.mlog('mgenre',{genre:g,on:!!on,off});
    /* the menu moves on at once if its tune is now off; a race keeps its tune and its sequence picks from the new list */
    if(this.T&&!this.tAllowed(this.T)&&!this.pinned&&(this.mood==='menu'||this.mood==='listen'))this.setState(this.freshTune());
    if(this.tSeed&&!this.pinned&&this.mood!=='race'&&this.mood!=='count'){const h=this.raceTune(0);this.raceHome={...h,mut:[...h.mut]}}this.changed();return true},
  tAllowed(T,on){on=on||this.tGenOn();return(T.gn||[T.f]).every(g=>on.includes(g))},
  /* the templates the radio and races choose from: in a room all of them (everyone must hear the same tunes) */
  tPool(room){const on=room?null:this.tGenOn();let L=TPL.filter(T=>!T.ret&&(!on||this.tAllowed(T,on)));
    /* nothing left (World alone is all fusions): any template with one of its genres on */
    if(!L.length&&on)L=TPL.filter(T=>!T.ret&&(T.gn||[T.f]).some(g=>on.includes(g)));if(!L.length)L=TPL.filter(T=>!T.ret);return L},
  tState(id,seed,kv=0,vr=0){const T=TPL[(id-1+TPL.length)%TPL.length];seed=seed>>>0&0xFFFFF;return{tp:T.id,seed,kv:kv&15,vr:vr&15,style:T.side,mx:0,theme:0,key:(T.k+kv)%12,prog:1,groove:0,mut:[0,0,0],timbre:seed%8,rng:seed&127,flav:0,hook:0,resp:0,bp:0,lib:0,kx:0,kx2:0}},
  /* a random template tune: from the genres that are on, not the family just heard (avoid), each family about as likely
     as any other (not each template), leaning to an energy when asked; with likes on (and alone), templates like the
     ones liked come up more often, skipped ones less */
  tRandom(r,avoid,en,room,flt){let L=this.tPool(room);if(flt)for(const f of flt){const F=L.filter(f);if(F.length){L=F;break}}
    const A0=L.filter(T=>T.f!==avoid),A=A0.length?A0:L,fc={};for(const T of A)fc[T.f]=(fc[T.f]||0)+1;
    const LK=room?[]:this.tLK(),w=A.map(T=>(LK.length?Math.max(0.35,Math.min(3,Math.exp(0.22*MLIKE.aff(T,LK)))):1)/Math.sqrt(fc[T.f]));
    let B=A,W=w;if(en&&r()<0.5){const ix=A.map((T,i)=>T.e===en?i:-1).filter(i=>i>=0);if(ix.length){B=ix.map(i=>A[i]);W=ix.map(i=>w[i])}}
    let x=r()*W.reduce((a,b)=>a+b,0),T=B[B.length-1];for(let i=0;i<B.length;i++){x-=W[i];if(x<=0){T=B[i];break}}return this.tState(T.id,Math.floor(r()*1048576))},
  /* the least familiar of n candidates (the listening memory), less a bonus for resembling what was liked */
  tFresh(mk,n,room){const H=MHIST.get(),LK=room?[]:this.tLK();let best=null,bp=1e9;
    for(let i=0;i<n;i++){const st=mk(i),T=TPL[st.tp-1],b=LK.length&&T?Math.min(3.5,0.9*Math.max(0,MLIKE.aff(T,LK))):0,p=mPenalty(st,H)-b+i*0.001;if(p<bp){bp=p;best=st}}return best},
  /* what the radio and the race tunes on your own lean towards: your likes and the Prototype 44 logs' keeps and skips
     (while "Influence the radio with your likes" is on), and the library (when the generator plays with its influence) */
  tLK(){const on=MLIKE.on(),L=this.libMode==='inf'?this.keptT().map(tp=>[tp,4]):[];return on?MLIKE.get().concat(L,MPRIOR):L},
  /* tune k of this track's race sequence: everyone in a room hears the same sequence; alone, the least familiar of
     12 candidates, a little towards the race's feel. n: the how-many-th race on this track on your own (rRot). Race 0
     opens with the track's own tune; later races open with another one: near the track's style first (its family, then
     its genres), then anything, and every eighth race the track's own tune again. The library mode plays the library. */
  raceTune(k,n){let room=false;try{room=!!mp.on}catch(e){}const seed=this.tSeed||7,prev=k>0&&this.rPrevF||null;n=room?0:n!=null?n:this.rRot||0;
    const en=!room&&k>0&&this.rx?(this.rx.a>1?3:this.rx.e>0?1:0):0;
    if(!room&&this.libMode==='lib'){const s=this.tLibPick(k>0&&this.st?codeOf(this.st):null);if(s)return s}
    const E0=!room&&n>0?MTRK.e(seed):null;if(k===0&&n>0&&n%8===0&&E0&&E0[3]){const s=parseTune(E0[3]);if(s)return s}
    if(k===0&&n>0&&n%8){const f0=E0&&E0[3]&&parseTune(E0[3]),T0=TPL[(f0&&f0.tp||this.raceTune(0,0).tp)-1]||TPL[0],x=(E0||[])[2]|0,G=T0.gn||[T0.f],ok=T=>T.id!==T0.id&&T.id!==x,gn=T=>(T.gn||[T.f]).some(g=>G.includes(g));
      const F=n<=2?[T=>ok(T)&&T.f===T0.f,T=>ok(T)&&gn(T),ok]:n<=4?[T=>ok(T)&&gn(T),ok]:[ok],s2=(((seed^0x0A11CE)>>>0)+Math.imul(n,0x2545F491))>>>0;
      return this.tFresh(i=>this.tRandom(rng(((s2+Math.imul(i+1,0x9E3779B1))>>>0)||1),n>4?T0.f:null,0,false,F),12,false)}
    const s1=n>0?(((seed^0x5EED)>>>0)+Math.imul(n,0x2545F491))>>>0:(seed^0x5EED)>>>0;
    return this.tFresh(i=>this.tRandom(rng(((s1+Math.imul(k*13+i+1,0x9E3779B1))>>>0)||1),prev,en||0,room),room?1:12,room)},
  /* the race on this track: its opening tune for this race (alone: which race on the track this is) */
  tRotHome(){let room=false;try{room=!!mp.on}catch(e){}if(this.pinned||!this.tSeed||this.pgE)return;const n=room?0:MTRK.n(this.tSeed);
    if(this.rRot!==n||!this.raceHome){this.rRot=n;const st=this.raceTune(0);this.raceHome={...st,mut:[...st.mut]}}},
  /* a race starts: count it, so the next race on this track moves on */
  tRotate(){let room=false;try{room=!!mp.on}catch(e){}if(this.pinned||!this.tSeed||this.pgE)return;this.tRotHome();
    if(this.raceHome)this.tLibSeen(this.raceHome);if(!room&&this.raceHome){const n=MTRK.bump(this.tSeed,this.raceHome.tp,codeOf(this.raceHome));this.mlog('mrot',{race:n,tpl:this.raceHome.tp,lib:this.libMode||undefined})}},
  /* ---- the library (the kept tunes): its templates, a row's details, the least familiar kept tune ---- */
  keptT(){const o=[];for(const c of this.kept()){const s=parseTune(c);if(s&&s.tp&&!o.includes(s.tp))o.push(s.tp)}return o},
  tuneMeta(c){const s=parseTune(c);if(!s)return{name:c,style:'',bpm:0,key:''};const T=s.tp?TPL[s.tp-1]:null,K=KEYS[s.key]+' '+(T?({phryg:'phrygian',harm:'harmonic minor',mixo:'mixolydian',phrdom:'phrygian dominant',yu:'yu (pentatonic)'})[T.m]||T.m:THEMES[s.theme].mode);
    if(T)return{name:T.n,style:T.sub+((T.gn||[]).length>1?' · '+(GENRES.find(x=>x[0]===T.gn[1])||[0,T.gn[1]])[1].toLowerCase()+' fusion':''),genres:(T.gn||[T.f]).map(g=>(GENRES.find(x=>x[0]===g)||[g,g])[1]),bpm:T.b,key:K,tp:T.id};
    const b=s.hook?bpOf(s):null;return{name:'Prototype 43 tune',style:s.mx?'drum & bass and trance':s.style?'trance':'drum & bass',bpm:b&&!s.mx?b.bpm:s.style?138:174,key:K}},
  /* the library in turn: the kept tune played longest ago (never played first, newest kept first) */
  tLibQ(){let Q=[];try{Q=JSON.parse(store.get('hoverline.mlibq')||'[]')}catch(e){}return Array.isArray(Q)?Q:[]},
  tLibPick(not){const L=this.kept().filter(c=>c!==not&&parseTune(c));if(!L.length)return null;const Q=this.tLibQ();let best=L[0],bi=-2;for(const c of L){const i=Q.indexOf(c),r=i<0?1e9:i;if(r>bi){bi=r;best=c}}return parseTune(best)},
  /* a library tune starts playing: it goes to the back of the queue */
  tLibSeen(st){if(this.pgE||this.libMode!=='lib'||!st)return;const c=codeOf(st);if(!this.kept().includes(c))return;try{store.set('hoverline.mlibq',JSON.stringify([c,...this.tLibQ().filter(x=>x!==c)].slice(0,100)))}catch(e){}},
  get libMode(){if(this._lm==null)this._lm=store.get('hoverline.mlib')||'';return this._lm},
  /* 'lib': play the library; 'inf': the generator, leaning hard towards the library; '': the radio */
  setLib(m){this._lm=m||'';store.set('hoverline.mlib',this._lm);this.pinned=false;MLIKE.note(m?'lib-'+m:'radio',0);
    if(m==='lib'){const s=this.tLibPick(null);if(s)this.setState(s)}else this.setState(this.freshTune());
    if(this.tSeed){this.rRot=null;this.raceHome=null;if(this.mood!=='race'&&this.mood!=='count')this.tRotHome()}this.changed()},
  /* back to the radio from a tune on repeat or a library mode */
  toRadio(){this.setLib('')},
  modeLabel(){if(this.soOn)return'';if(this.pinned&&this.st)return'Repeating '+this.tuneMeta(codeOf(this.st)).name;return this.libMode==='lib'?'Playing your library':this.libMode==='inf'?'Radio steered by your library':''},
  restore(c,i){let L=this.kept().filter(x=>x!==c);L.splice(Math.max(0,Math.min(L.length,i|0)),0,c);store.set('hoverline.tunes',JSON.stringify(L.slice(0,100)));MLIKE.note('restore',(parseTune(c)||{}).tp||0,c)},
  /* for the log export: the library, the likes and what was done with them */
  libLog(){let off=[];try{off=JSON.parse(store.get('hoverline.mgoff')||'[]')}catch(e){}
    return{library:this.kept().map(c=>({code:c,...this.tuneMeta(c)})),liked:[...new Set(MLIKE.get().filter(x=>x[1]>=3).map(x=>x[0]))].map(tp=>({tpl:tp,name:(TPL[tp-1]||{}).n})),
      likesSteer:MLIKE.on(),libMode:this.libMode||'radio',genresOff:off,likeEvents:MLIKE.get(),history:MLIKE.hist(),tracks:MTRK.get().slice(0,40)}},
  /* everything a tune needs before it plays: its break rendered at its tempo, the sitar in its key, the library kit
     and instruments (SMP), the library synths (SYN) */
  tPrepAll(st){if(!st||!st.tp)return Promise.resolve();const T=TPL[st.tp-1],D=TDR[T.d],ps=[],key=(T.k+(st.kv||0))%12;
    const S=MX.smp(),need=[],dk=this.lite?null:MX.kitOf(T.dk);if(S&&!S.fallback&&!this.lite){if(dk){need.push('kit:'+dk);for(const k of['hats','cym'])if(S.kit(k))need.push('kit:'+k)}for(const i of[T.li,T.l2,T.kz,T.ai,T.bg&&T.bg.i,T.hb&&'hangB'])if(i){const n=MX.instOf(i==='gtr'?'gtrl':i);if(n)need.push('inst:'+n)}
      if(T.bs==='chug'){for(const n of[MX.instOf('gtrm'),MX.instOf('gtr')])if(n)need.push('inst:'+n)}
      for(const f of['hang','didg'])if(T.fx.includes(f)){const n=MX.instOf(f==='hang'?'hangS':'didg');if(n)need.push('inst:'+n)}
      /* the didgeridoo's recordings, and the tabla kit for the bols of a tune with a tabla layer */
      if(T.fx.includes('didg')&&S.kit('didg'))need.push('kit:didg');{const PL=Array.isArray(T.perc)?T.perc:T.perc?[T.perc]:[];if(PL.some(p=>p==='tabla'||p==='tabla2')&&S.kit('tabla'))need.push('kit:tabla')}
      if(need.length)ps.push(S.need(need).catch(()=>{}))}
    if(D&&D.brk&&D.brk!=='arov'&&this.kit){const b=T.b,k=D.brk+'|'+b+'|'+(T.kit||0)+'|'+(dk||'');if(!TCACHE.brk[k]&&!TCACHE.busy[k]){TCACHE.busy[k]=1;
      ps.push(Promise.all(ps.slice()).then(()=>SL.brkRender(this.tBrkKit(T,dk),D.brk,b)).then(x=>{if(x){const ks=Object.keys(TCACHE.brk);if(ks.length>=4)delete TCACHE.brk[ks[0]];TCACHE.brk[k]=x}delete TCACHE.busy[k]}).catch(()=>{delete TCACHE.busy[k]}))}}
    /* the sitar: every other semitone from G2 to D6 (played up to a semitone either way), for the tune's key only */
    if(!this.lite&&(T.li==='sitar'||T.l2==='sitar')){if(TCACHE.sitK!==key){TCACHE.sit={};TCACHE.sitK=key}ps.push(new Promise(res=>{const ms=[];for(let m=43;m<=87;m+=2)if(!TCACHE.sit[m])ms.push(m);let i=0;
      const step=()=>{try{for(let j=0;j<3&&i<ms.length;j++,i++){const m=ms[i],d=SL.sitar(32000,m,key),b=new AudioBuffer({length:d.length,sampleRate:32000,numberOfChannels:1});b.getChannelData(0).set(d);if(TCACHE.sitK===key)TCACHE.sit[m]=b}}catch(e){return res()}if(i<ms.length)setTimeout(step,0);else res()};setTimeout(step,0)}))}
    const Y=MX.syn();if(Y&&Y.prep&&!this.lite){const ns=[];for(const i of[T.li,T.l2,T.kz,T.ai,T.bg&&T.bg.i])if(i&&MX.hasSyn(i))ns.push(i);const P=TPD[T.pd];if(P&&P.syn&&MX.hasSyn(P.syn))ns.push(P.syn);
      for(const b of[TBF[T.bs]&&TBF[T.bs][1]])if(b&&MX.hasSyn(b))ns.push(b);if(T.fx.includes('drone')&&MX.hasSyn('tanpura'))ns.push('tanpura');if((T.fx.includes('hang')||T.hb)&&MX.hasSyn('hang'))ns.push('hang');
      if(ns.length)try{ps.push(Promise.resolve(Y.prep(ns,key,this)).catch(()=>{}))}catch(e){}}
    return Promise.all(ps)},
  /* the kit pieces the break is re-played from: the library kit's round robins when loaded, the embedded kit otherwise */
  tBrkKit(T,dk){const K=T.kit&&this.kits&&this.kits[T.kit]||this.kit0||this.kit,S=MX.smp();if(!dk||!S||S.fallback)return K;
    const L=(v,n)=>{const o=[];for(let i=0;i<n;i++){const p=S.pick(dk,v,0.85,{strict:true,seq:'brk'+i});if(p&&p.buf&&!o.includes(p.buf))o.push(p.buf)}return o.length?o:null};
    return{kd:L('kick',4)||K.kd,s1:L('snare_brk',4)||L('snare',4)||K.s1,s2:L('ghost',3)||L('snare',3)||K.s2,h1:L('chh',4)||K.h1,h2:L('chh',4)||K.h2,ho:L('ohh',2)||K.ho}},
  /* the recordings a template uses (the Prototype 38 ones are decoded when it is chosen) */
  tX2(T){const o=[],X=SL.EXT2;if(!X||!T)return o;const add=k=>{if(X[k]&&!o.includes(k))o.push(k)};
    for(const i of[T.li,T.l2,T.kz,T.ai,T.bg&&T.bg.i]){const S=i&&TSMP[i];if(S&&S[0].startsWith('x_'))for(const b of S[1])add(S[0]+b);const f=SYNFB[i];if(f&&TSMP[f]&&!MX.hasSyn(i))for(const b of TSMP[f][1])add(TSMP[f][0]+b)}
    const P=TPD[T.pd];if(P&&P.smp)add(P.smp[0]);if(this.kit2&&KITX2[this.kit2])for(const p of Object.values(KITX2[this.kit2].p))add(Array.isArray(p)?p[0]:p);
    if(TDR[T.d]&&TDR[T.d].brk==='arov')add('x_lp_ar_'+'abde'[this.st.seed%4]);
    for(const PX of this.percL||[])if(PX&&PX.x2){if(PX.loop)add(PX.loop);else for(const e of PX.p)if(e)for(const[k]of e)add(k)}
    for(const k of['x_didg','x_gong','x_scresc','x_woosh','x_tb'])add(k);if(this.tUac)add(this.tUac);if(this.bhit)add(this.bhit[0]);
    const TX=this.texR;if(TX){for(const f of['pre','pre2','drop','brk'])if(TX[f])add(TX[f][0]);for(const[k]of TX.pad)add(k)}
    const BK=T.bk&&TSMP[T.bk];if(BK&&BK[0].startsWith('x_'))for(const b of BK[1])add(BK[0]+b);return o},
  buildT(){const st=this.st,T=this.T=TPL[st.tp-1]||TPL[0],r=rng((Math.imul(st.seed+1,2654435761)^Math.imul(st.tp,40503)^0x51A7)>>>0||1),pick=a=>a[Math.floor(r()*a.length)];
    Object.assign(this,{theme:THEMES[0],fk:T.fx.includes('rw')?'dnb':'tpl',bp:null,minor:!(T.m==='major'||T.m==='mixo'||T.m==='gong'),scale:SCX[T.m]||SC.minor,hscale:SCX[SCXH[T.m]]||SC.harm,prog:T.p,
      roots:T.p.length===8?[T.p[0],T.p[2],T.p[4],T.p[6]]:T.p,pw:T.d==='indus',trR:false,trM:T.side===1,respK:null,themeEv:[],motif:[],variant:[],hookIdx:null,lOct:0,anthem:false,vocal:false,
      kit2:T.kit>=8&&T.kit<=10?T.kit:0,texR:null,percX:null,bhit:null,bell:false,stabs:false,harp:T.fx.includes('harp'),tymp:T.fx.includes('tymp'),cym:T.fx.includes('cym'),shk:false,clapS:false,
      leadCache:{},groove:GROOVES.dnb[0],bassPat:BASS.dnb[0],timbre:TIMBRES[st.timbre&7],arp:ARPS[0],leadPatch:null,leadDuck:0,bpBass:null,bpArp:null,bpKeys:null,psyTight:false,leadEv:null,
      sirenN:0,tVk:{},dkSt:{},dkRR:{},dkLast:{},tDn:0,tBkI:-1,hgQ:null});
    const sm=i=>i&&TSMP[i]&&!['or','sx','sl','rc','ps'].includes(i)?i:null;this.keysI=null;this.sparkI=sm(T.kz)||sm(T.li)||sm(SYNFB[T.li]);
    this.tD=TDR[T.d]||TDR.twostep;this.tKick=T.kick||this.tD.kick||'kd';this.swing=T.sw||0;
    /* the sidechain: the family's, with the template's own changes */
    {const F=T.f==='world'?'dnb':T.f,B=TSC[F]||TSC.dnb,O=T.sc||{},S={...B,...O};this.tSC=[['pumpB',S.b],['pump',S.p],['pumpL',S.l],['pumpK',S.k]].filter(x=>x[1])}
    /* percussion layers: one or two from the template's list (or its family's), by the seed; the accent lane's sound */
    {const PL=Array.isArray(T.perc)?T.perc:T.perc?[T.perc]:[],a=PL.length?PL[st.seed%PL.length]:null,b=PL.length>1?PL[(st.seed>>4)%PL.length]:null;
      this.percL=[];for(const k of b&&b!==a?[a,b]:a?[a]:[])if(PERCX[k])this.percL.push(PERCX[k]);this.percX=this.percL[0]||null;this.tUac=TUAC[T.f]||'x_clv1';
      /* tabla bols: a tune with a tabla layer may get the call and answer, twice, in a breakdown (Prototype 46). Alone, at
         most one tune in three and most of those (fewer templates have tabla now, so the chance is higher: about once an
         hour of play, the rate Eric liked); in a room by the seed alone, so everyone hears the same */
      {const c=codeOf(st);if(c!==this.tbC){this.tbC=c;this.tuneN=(this.tuneN||0)+1;this.bolQ=null;this.bolDone=false;this.washN=0;this.dodoN=0}let room=false;try{room=!!mp.on}catch(e){}
        this.bolOK=!this.pgE&&!this.lite&&this.percL.some(X=>X.n==='tabla')&&(room?hsh(st.seed,0xB01)<0.5:this.tuneN-(this.bolAt==null?-9:this.bolAt)>=3&&hsh(st.seed,0xB01)<TBOLP);
        this.bolPh=Object.keys(BOLP)[Math.floor(hsh(st.seed,0xB02)*2)];if(this.bolOK&&this===music)VBOL.load(this.ctx);
        /* the rare "do do do" (tDodo): where the melody rests in the B section, by the seed */
        this.dodoOK=!this.pgE&&!this.lite&&['hook','doc','call','none','pad'].includes(T.l)&&!T.hb&&hsh(st.seed,0xD0D0)<TDODO;this.dodoI=T.kz&&T.kz!=='gtr'&&T.kz!=='hp'?T.kz:'pluck';this.dodoOn=false}
      /* a texture set (one in two templates of the families that have them) and the drop's tuned bass hit */
      const TX=T.tx||(!T.fx.includes('cym')&&!T.fx.includes('swell')&&T.id%2===1?(TTEX[T.f]||[])[(T.id>>1)%((TTEX[T.f]||[1]).length)]:null);this.texR=TX&&TEXR[TX]||null;
      this.bhit=T.fx.includes('subdrop')?null:TBH[T.f]||null}
    const sc=this.scale,hs=this.hscale,roots=this.roots,line=T.line||null,BF=TBF[T.bs]||TBF.sub;this.tBF=BF;this.tBP=this.tbpOf(BF[1],T.b);
    this.tChords();const tn=b=>{const c=this.tCh[(b%roots.length)*(this.prog.length===8?2:1)%this.prog.length];return c.pcs};this.tTn=tn;
    /* bass patterns: [step, length, semitones above the chord root, accent, slide] for a bar (two for long lines) */
    const BP={roll:[[[0,6,0],[6,2,12],[10,6,0]],[[0,4,0],[4,2,12],[6,2,0],[10,4,0],[14,2,12]],[[0,3,0],[3,1,12],[4,4,0],[8,3,0],[11,1,12],[12,4,0]],[[0,10,0],[10,2,0],[12,4,0]]],
      off:[[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,0]],[[2,2,0],[6,2,0],[10,2,0],[14,2,0]]],
      sub:[[[0,14,0]],[[0,8,0],[8,6,0]],[[0,6,0],[10,6,0]]],gal:[[[0,1,0],[2,1,12],[3,1,0],[4,1,0],[6,1,12],[7,1,0],[8,1,0],[10,1,12],[11,1,0],[12,1,0],[14,1,12],[15,1,0]],[[0,1,0],[1,1,0],[2,1,12],[4,1,0],[5,1,0],[6,1,12],[8,1,0],[9,1,0],[10,1,12],[12,1,0],[13,1,0],[14,1,12]]],
      oct:[[[0,1,0],[2,1,12],[4,1,0],[6,1,12],[8,1,0],[10,1,12],[12,1,0],[14,1,12]],[[0,2,0],[2,1,12],[4,2,0],[6,1,12],[8,2,0],[10,1,12],[12,1,0],[13,1,0],[14,1,12]]],
      kbbb:[[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,0]]],r4:[[[2,1,0],[3,1,0],[6,1,0],[7,1,0],[10,1,0],[11,1,0],[14,1,0],[15,1,12]]],
      /* psytrance: duh-duh-duh after every kick; the B section turns the last beat round (an octave, a step) */
      kbbbx:[[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,0]],[[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,12],[15,1,0]],
        [[1,1,0],[2,1,0],[3,1,0],[5,1,0],[6,1,0],[7,1,0],[9,1,0],[10,1,0],[11,1,0],[13,1,0],[14,1,0],[15,1,1]]],
      sq16:[[[0,1,0],[1,1,0],[2,1,12],[3,1,0],[4,1,0],[5,1,0],[6,1,7],[7,1,0],[8,1,0],[9,1,0],[10,1,12],[11,1,0],[12,1,0],[13,1,0],[14,1,10],[15,1,0]]],hit:[[[0,8,0]]],
      house:[[[0,2,0],[3,1,0],[6,2,12],[10,2,0],[13,1,0]],[[2,1,0],[5,1,12],[8,2,0],[11,1,0],[14,2,0]],[[0,1,0],[2,1,0],[6,1,12],[8,1,0],[10,1,0],[14,1,12]]],
      slap:[[[0,1,0],[3,1,12],[5,1,0],[6,1,0],[10,1,0],[12,1,12],[15,1,0]],[[0,2,0],[4,1,12],[6,1,0],[9,1,0],[11,1,12],[13,1,0],[14,1,0]]],
      growl:[[[0,3,0],[4,2,0],[6,2,0],[10,4,0],[14,2,0]],[[0,2,0],[2,2,0],[8,4,0],[12,2,0],[14,2,12]]],riddim:[[[0,2,0],[3,1,0],[4,2,0],[8,2,0],[11,1,0],[12,2,0]]],
      wob:[[[0,4,0],[4,4,0],[8,4,0],[12,4,0]],[[0,6,0],[6,2,0],[8,8,0]]],s808:[[[0,6,0],[6,2,0],[10,6,0]],[[0,10,0],[10,2,12],[12,4,0]]],slide:[[[0,7,0],[7,3,12],[10,6,0]],[[0,4,0],[4,4,7],[8,8,0]]],
      organ:[[[0,2,0],[3,1,12],[4,2,0],[6,2,12],[8,2,0],[11,1,12],[12,2,0],[14,2,12]]],prog:[[[1,1,0],[2,1,0],[3,1,12],[5,1,0],[6,1,0],[7,1,12],[9,1,0],[10,1,0],[11,1,12],[13,1,0],[14,1,0],[15,1,12]]],
      /* Prototype 45: happy hardcore's bounce, funk slap, deep house, dubstep's sub, wave phonk's sliding 808 */
      hcoff:[[[2,2,0],[6,2,12],[10,2,0],[14,2,12]],[[2,1,0],[3,1,12],[6,1,0],[7,1,12],[10,1,0],[11,1,12],[14,1,0],[15,1,12]]],
      funk:[[[0,1,0,1],[2,1,12],[3,1,0],[6,1,0],[7,1,10],[10,1,0,1],[12,1,12],[14,1,7],[15,1,0]],[[0,2,0,1],[3,1,0],[4,1,12],[6,1,0],[8,1,7],[10,1,0],[11,1,12],[13,1,10],[14,1,0]]],
      deep:[[[0,3,0],[3,1,12],[6,2,0],[10,3,0],[14,1,7]],[[0,2,0],[6,2,0],[8,1,12],[10,2,0],[14,2,0]]],dub:[[[0,6,0],[10,6,0]],[[0,4,0],[6,2,0],[10,6,0]]],
      wave:[[[0,10,0],[10,2,12,0,1],[12,4,0,0,1]],[[0,6,0],[6,2,0],[8,8,0]]]};
    if(BF[0]==='line'&&line){const n=line.length,rl=libRhythm('bass',n,T.id,T.d==='half'),ev=[];let s=0;const b0=Math.min(...line);line.forEach((p,i)=>{ev.push([s,rl[i%rl.length],p-b0+(b0<-6?0:0)]);s+=rl[i%rl.length]});
      const span=s>16?32:16;this.tBass={A:ev.filter(e=>e[0]<span),span};this.tBassB=this.tBass}
    else if(BF[0]==='acid'){const g=tAcidGen(r,sc);this.tBass={A:g.A.map(e=>[e.s,e.d,e.p,e.ac,e.sl]),span:16};this.tBassB={A:g.B.map(e=>[e.s,e.d,e.p,e.ac,e.sl]),span:16}}
    else if(BF[0]==='chug'){const g=tChugGen(r,sc);this.tBass={A:g.A.map(e=>[e[0],e[1],e[2],e[3],0,e[3]]),span:16};this.tBassB={A:g.B.map(e=>[e[0],e[1],e[2],e[3],0,e[3]]),span:16}}
    else{const L=BP[BF[0]]||BP.sub,i=Math.floor(r()*L.length),j=L.length>1?(i+1+Math.floor(r()*(L.length-1)))%L.length:i;this.tBass={A:L[i],span:16};this.tBassB={A:L[j],span:16}}
    for(const B of[this.tBass,this.tBassB]){B.at=[];for(const e of B.A){(B.at[e[0]]||(B.at[e[0]]=[])).push(e)}}
    /* the melody */
    const reg=TREG[T.li]||TREGF[T.li]||[60,79];this.tReg=reg;this.tHook=this.tResp=this.tRiff=this.tChop=this.tStab=this.tComp=null;
    const at=(ev,L)=>{const a=new Array(L);for(const e of ev){(a[e.s]||(a[e.s]=[])).push(e)}return a};
    /* chord tones at a bar and step (two chords a bar in the eight-chord progressions) */
    const tn2=(b,s)=>{const c=this.tCh[this.prog.length===8?((b%4)*2+(s>=8?1:0))%8:(b%roots.length)%this.prog.length];return c.pcs};
    if(T.mg&&(T.l==='hook'||T.l==='doc'||T.l==='call')){const bars=T.form==='long'?8:4,ev=tMotifHook(r,{sc,tn:tn2,bars,dens:T.md});this.tHook={ev,L:bars*16,at:at(ev,bars*16)}}
    else if(T.l==='hook'||T.l==='doc'||T.l==='call'){const form=T.form||pick(['AABA','ABAC','AAAB','AB']),dens=T.f==='euro'||T.f==='trance'||T.f==='hardcore'?pick([5,6,7,8]):null;
      const ev=tHookGen(r,{sc,hs,roots,form,line:T.l==='doc'||form==='even'?line:null,dens,tn}),L=form==='long'?128:64;this.tHook={ev,L,at:at(ev,L)};
      if(T.l==='call'){const ev2=tHookGen(r,{sc,hs,roots,form:'ABAC',tn}).filter(e=>e.s>=32);this.tResp={ev:ev2,L:64,at:at(ev2,64)}}}
    if(T.mg&&(T.l==='riff'||T.l==='solo')){const g=tMotifRiff(r,{sc,shape:T.rs});this.tRiff={A:at(g.A,g.n),B:at(g.B,g.n),n:g.n,fol:T.f!=='techno'&&T.f!=='trance',dg:true}}
    else if(T.l==='riff'||T.l==='solo'){const g=tRiffGen(r,{sc,line,len:T.l==='solo'?32:pick([16,16,32])});this.tRiff={A:at(g.A,g.n),B:at(g.B,g.n),n:g.n,fol:T.f!=='techno'&&T.f!=='trance'}}
    if(T.l==='chops'){const W=['c_hey','c_oh','c_yeah','c_go'],R=pick([[0,6,10],[2,6,10,14],[0,3,8,11],[4,7,12],[0,10]]);this.tChop={R,w:[pick(W),pick(W)],sh:pick([0,1,2])}}
    if(T.l==='stabs'){const R={house:[[2,6,10,14],[0,3,6,10,13],[3,6,11,14]],techno:[[3,6,11],[0,3,10],[2,7,10]],euro:[[0,3,6,10,12,14],[2,6,10,14],[0,6,8,14]],dub:[[0,6,8,14],[0,3,8]]}[T.f]||[[0,6,10],[2,6,10,14]];this.tStab={R:pick(R),R2:pick(R)}}
    /* keys comping: a rhythm (T.kr names one; otherwise one of four) of chord stabs voiced for the instrument */
    if(T.l==='keys'||T.kz){const KR={whole:[[0]],half:[[0,8]],house:[[2,6,10,14],[3,6,10,14]],funk:[[2,5,7,10,14],[0,3,6,9,12,14],[2,4,7,10,13]],hc:[[0,3,6,8,11,14],[0,3,6,10,12,14]],
        hc2:[[0,3,6,10,12,14],[0,2,6,8,10,14]],chug8:[[0,2,4,6,8,10,12,14]]};const L=KR[T.kr]||[[0,3,6,10,12],[2,6,10,14],[0,4,6,10,14],[0,3,8,11,14]];this.tComp={R:pick(L),R2:pick(L),k:T.kr||''}}
    this.tSoloAt=null;this.tSoloK=null;const rg=a=>a&&a.length?[Math.min(...a),Math.max(...a)]:[0,12];this.tHR=rg(this.tHook&&this.tHook.ev.map(e=>e.p));
    this.tRR=this.tRiff?rg([...this.tRiff.A,...this.tRiff.B].flat().filter(Boolean).map(e=>e.p)):[0,12];
    /* arpeggios: a pattern of chord-tone indices over a bar */
    const AP={up:[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3],down:[3,2,1,0,3,2,1,0,3,2,1,0,3,2,1,0],updown:[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3],up8:[0,-1,1,-1,2,-1,3,-1,2,-1,1,-1,0,-1,2,-1],
      gallop:[0,-1,1,2,0,-1,1,2,3,-1,2,1,0,-1,1,2],dotted:[0,-1,-1,1,-1,-1,2,-1,-1,3,-1,-1,2,-1,-1,1]};const ak=T.ar||(T.l==='arp'?'updown':null);this.tArpP=ak&&ak!=='line'?AP[ak]||AP.updown:null;this.tArpLine=ak==='line'&&line?line:null;
    this.tChord=T.l==='stabs'||T.l==='keys'||T.l==='pad';this.vks={};this.lOct=0;this.useKit();this.tDkInit();
    if(!this.lite&&this.ctx){this.ensureExt();this.ensureX2()}if(this.ctx)this.tP=this.tPrepAll(st);
    if(T.ar==='dotted'||T.ar==='line'||T.li==='arp12')this.ensureEchoes();
    if(this.dly&&this.dlyB!==this.bpm){const b=this.dlyB=this.bpm;this.dly.delayTime.value=60/b*0.75;this.dly2.delayTime.value=60/b*0.375;if(this.dly16){this.dly16.delayTime.value=60/b/4;this.dly8t.delayTime.value=60/b/3}}
    this.tTrim(null,0.05)},
  /* a bass patch: the library synth's when SYN has it, its stand-in otherwise */
  tbpOf(n,b){let f=TBP[n];if(!f&&TBPF[n])f=TBP[TBPF[n]];if(!f)f=TBP.sub;const o=typeof f==='function'?f(b):{...f};if(o.syn&&!MX.hasSyn(o.syn)){const g=TBP[TBPF[n]]||TBP.sub;return g(b)}return o},
  /* the chords of the progression: quality, the tones (semitones above the tonic, root first), pitch classes for melodies
     to land on, and the pad voicing, each chord led from the one before */
  tChords(){const T=this.T,P=this.prog,n=P.length,key=((this.st.key%12)+12)%12,cq=T.cq||3,mn=this.minor;this.tCh=[];let prev=null;
    for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){const deg=P[i],pq=T.pq&&T.pq[T.pq.length===n?i:i>>1];let ivs=null,q='';
      if(pq&&pq[0]===deg&&CQ[pq[1]]){q=pq[1];ivs=CQ[q]}else if(this.pw){q='5';ivs=CQ['5']}else if(cq>3){const s7=(deg%12===7&&mn)?SC.harm:this.scale.length===7?this.scale:mn?SC.minor:SC.major;ivs=tDia(deg,s7,cq>=9?5:4)}
      if(!ivs){const c=chordOf(deg,this.hscale);ivs=[0,c[1]-deg,c[2]-deg]}
      const tones=ivs.map(x=>deg+x),pcs=[...new Set(ivs.filter(x=>x<12||x===14).map(x=>((deg+x)%12+12)%12))],v=tVoiceLead(deg,ivs,key,50,76,prev,true);prev=v;
      this.tCh[i]={deg,q,ivs,tones,pcs,v}}},
  tChordAt(hb,s){return this.tCh[this.slot(hb,s)]||this.chordAt(hb,s)},
  tTrim(t,dur){if(!this.trimG||!this.ctx)return;const T=this.T,n=this.sec&&this.sec[0],v=T?(T.g||1)*(n==='brk'||n==='out'?T.gb||1:1):1,g=this.trimG.gain;t=t==null?this.ctx.currentTime:t;
    if(this.trimV===v)return;g.cancelScheduledValues(t);g.setValueAtTime(this.trimV==null?v:this.trimV,t);g.linearRampToValueAtTime(v,t+dur);this.trimV=v},
  /* Every 90 s (races, results, the menu's race music) the next tune takes over at a phrase line: the old tune breaks
     down for two bars and the new one builds four into its drop, or, when the tempos are close, a one-bar fill drops
     straight into it. Count-ins, GO and the final lap are untouched (the final lap's build can be the new tune's). */
  swOK(){if(this!==music||!this.T||this.pinned||!this.shuffle||this.style==='off'||this.modeEff()!=='gen')return false;const m=this.mood;return m==='race'||m==='results'||m==='listen'},
  swNext(){if(this.mood==='listen'||this.mood==='menu')return this.freshTune();this.rPrevF=this.T?this.T.f:null;return this.raceTune((this.rSeq||0)+1)},
  swPlanAt(t,bd,n,bi,bl){if(!this.swOK()||this._final||this.swPl||this.swT0==null||this.want||this.queue.length||this.bolQ)return;const left=bl-bi;let mode;
    if(({drop:1,b:1,a:1,sw:1,solo:1,drum:1})[n]){if(left===1&&n==='drop'&&this.rwAt>t)return;mode='g'}else if(n==='brk')mode='b';else return;
    if(!((bi+1)%4===0||left===1))return;if(t+bd*(mode==='b'?5:7)-this.swT0<90)return;
    const ns=this.swNext();if(!ns)return;const T2=TPL[ns.tp-1],close=Math.abs(T2.b-this.bpm)<=this.bpm*0.05,fill=mode==='g'&&close&&(ns.seed&1);
    this.sec[2]=bi+1;const dl=bl>999?1e9:16;this.queue=mode==='b'?[['rise',4,ns],['drop',dl]]:fill?[['rise',1,ns],['drop',dl]]:[['out',2],['rise',4,ns],['drop',dl]];this.swPl={ns,how:mode==='b'?'breakdown':fill?'fill':'breakdown'};const ps=[this.tPrepAll(ns)];
    /* the next tune's recordings are decoded while the old one breaks down (its break, sitar, kit and synths are ready before its build) */
    if(!this.lite){const k2=this.kit2,s0=this.st,pl=this.percL;this.kit2=T2.kit>=8&&T2.kit<=10?T2.kit:0;this.st=ns;this.percL=[];const ks=this.tX2(T2),V=this.vbuf||{},miss=ks.filter(k=>!V[k]);this.kit2=k2;this.st=s0;this.percL=pl;
      if(miss.length){const src={};for(const k of miss)src[k]=SL.EXT2[k];ps.push(this.decodeVox(this.ctx,()=>true,src).then(v=>{for(const k of Object.keys(v))SL.tame(k,v);this.vbuf=Object.assign(this.vbuf||{},v);if(T2.kit>=8&&T2.kit<=10)this.mkKit(T2.kit)}).catch(()=>{}))}}
    this.swP=Promise.all(ps)},
  /* at the bar line before the new tune's first section: switch (the tempo changes here, in a breakdown or a fill) */
  swApply(){const Q=this.queue,S=this.sec;if(!this.swPl||!S||S[1]+1<S[2]||!Q.length||!Q[0][2])return false;const ns=Q[0][2],how=this.swPl.how,pc=this.code(),pl=this.played();Q[0]=[Q[0][0],Q[0][1]];
    this.swPl=null;const keepQ=Q.slice();this.setState(ns);this.queue=keepQ;this.mi=0;this.swT0=null;if(this.mood!=='listen')this.rSeq=(this.rSeq||0)+1;
    this.mlog('tune',{why:'change',how,code:this.code(),tpl:this.T.id,name:this.T.n,prev:pc||undefined,played:pl,seq:this.rSeq});return true},
  /* ---- one sixteenth of a template tune ---- */
  playT(t,sd,s){const T=this.T,G=this.gate,st=this.st,key=st.key,ph=this.phase,stg=this.stage||{},hb=this.hb||0,V=this.vbuf;
    const S=this.sec||['build',this.pb,0],sec=ph==='build'?'build':S[0],bi=S[1],bl=S[2],full=sec==='drop',tt=s%2?t+this.swing*sd:t,ch=this.tChordAt(hb,s);
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
