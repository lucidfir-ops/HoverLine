//# music/engine/048-library-kept.js: music: the library of kept tunes, its picks and details
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
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
     straight into it. Count-ins, GO and the final lap are untouched (the final lap's build can be the new tune's).
     After a race the endless final drop plays through a minute of the results (or the Frame lab opened from them), then
     the next tune comes (before Prototype 50 it played on for ever). */
  swOK(){if(this!==music||!this.T||this.pinned||!this.shuffle||this.style==='off'||this.modeEff()!=='gen')return false;const m=this.mood;return m==='race'||m==='results'||m==='listen'},
  swNext(){if(this.mood==='listen'||this.mood==='menu')return this.freshTune();this.rPrevF=this.T?this.T.f:null;return this.raceTune((this.rSeq||0)+1)},
  swPlanAt(t,bd,n,bi,bl){if(!this.swOK()||(this._final&&!(this.mood==='results'&&this.resT0!=null&&t-this.resT0>=60))||this.swPl||this.swT0==null||this.want||this.queue.length||this.bolQ)return;const left=bl-bi;let mode;
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
    this.swPl=null;if(this.mood==='results')this._final=false;const keepQ=Q.slice();this.setState(ns);this.queue=keepQ;this.mi=0;this.swT0=null;if(this.mood!=='listen')this.rSeq=(this.rSeq||0)+1;
    this.mlog('tune',{why:'change',how,code:this.code(),tpl:this.T.id,name:this.T.n,prev:pc||undefined,played:pl,seq:this.rSeq});return true},
