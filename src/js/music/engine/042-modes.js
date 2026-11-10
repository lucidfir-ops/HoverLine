//# music/engine/042-modes.js: music: Generative, Pregen (rendered ahead) and Songs modes
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- Music modes (Prototype 38): Generative (the live engine), Pregen and Songs ----
     Pregen renders the race tune before the race in an OfflineAudioContext (the audio is made on the browser's audio
     thread; the main thread only schedules the notes, a bar at a time where the browser can pause a render, otherwise
     in slices before it starts), then plays it as one looping recording, so no music is made during the race. What is
     rendered: a 4-bar build, then drop (16 bars), B section (16), breakdown (8) and build (8), looped at the drop, at
     32 kHz stereo (18 MB for drum & bass, 23 MB for trance). The filter still follows braking, place, hits, the
     countdown and pause; the kick lights still pulse; the final lap jumps to the end of the breakdown and builds into the
     drop with the sub drop under it. Lost: evolving changes, boost risers, overtake fills, the endless final drop,
     Shuffle in races. Not ready at GO: the live music plays and hands over at the next section. */
  mmode:store.get('hoverline.mmode')||'',
  modePick(){return this.mmode||(styleNow()==='ultra'?'pre':'gen')},
  modeEff(){const m=this.modePick();return m==='songs'&&!SONGS.ok?'gen':m},
  setMode(m){if(m!==this.modePick())this.mlog('mmode',{mode:m,was:this.modePick()});this.mmode=m;store.set('hoverline.mmode',m);const e=this.modeEff();if(e!=='pre'&&this.pgOn)this.pgStop();if(e!=='pre')this.pgLate=false;
    if(e!=='songs')this.soStop();else this.soStart();if(e==='pre')this.pgWant(true);this.changed()},
  pgNodes(){if(this.pgF||!this.ctx)return;const c=this.ctx;this.pgF=c.createBiquadFilter();this.pgF.type='lowpass';this.pgF.Q.value=0.6;this.pgF.frequency.value=Math.max(200,this.cutAt(c.currentTime));
    this.pgD=c.createGain();this.pgF.connect(this.pgD);this.pgD.connect(audio.musG&&audio.musG.context===c?audio.musG:audio.master)},
  pgWant(now){clearTimeout(this.pgTm);if(this.modeEff()!=='pre'||this.style==='off'||!this.ctx||!this.pgH())return;const c=codeOf(this.pgH());if(this.pg&&this.pg.code===c||this.pgBusy===c)return;
    this.pgTm=setTimeout(()=>this.pgRender(),now?0:1500)},
  async pgRender(){const H=this.pgH();if(!H||this.pgBusy)return;const code=codeOf(H);if(this.pg&&this.pg.code===code)return;this.pgBusy=code;if(!this.pgOn)this.pg=null;this.changed();const T0=performance.now();
    try{await this.readyP;if(this.extP)await this.extP;if(this.x2P)await this.x2P;const r=await this.pgMake(H);r.code=code;r.ms=Math.round(performance.now()-T0);this.pg=r}catch(e){this.pgErr=String(e&&e.stack||e)}
    this.pgBusy=null;this.changed();if(this.pgH()&&codeOf(this.pgH())!==code)this.pgWant(true)},
  async pgMake(H){const M=this,SR=32000,cp=v=>Array.isArray(v)?v.map(cp):v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,cp(x)])):v;
    const bp=H.hook?bpOf(H):null,bpm=H.tp?TPL[H.tp-1].b:bp&&!H.mx?bp.bpm:H.style?138:174,bd=240/bpm,sd=bd/16,N0=4,LB=48,nb=N0+LB+1,t1=0.02,len=Math.ceil((t1+nb*bd+0.05)*SR);
    /* a second engine for the offline render: the same tables, recordings and kits, its own graph and state */
    let main=0,slices=0;const tp=performance.now(),E=Object.create(M);for(const k of Object.keys(M)){const d=Object.getOwnPropertyDescriptor(M,k);if(!d||d.get||d.set||typeof d.value==='function')continue;E[k]=cp(d.value)}
    Object.assign(E,{ctx:null,timer:null,onChange:null,pg:null,pgOn:false,pgLate:false,soOn:false,pgF:null,kickQ:[],shuffle:false,pinned:true,irB:null,pgE:true});E.ensure=E.stop=E.pgWant=()=>{};
    const state=()=>{E.st=cp(H);E.base=cp(H);E.home=cp(H);E.gOff=0;E.r=rng((packState(E.st)^Math.imul(packHi(E.st),0x01000193)^0x9E3779B9)>>>0);E.build();E.useKit();
      Object.assign(E,{_final:false,finalPending:false,queue:[],revealAt:-1,themeChanged:false,cin:false,cutOv:null,rwDone:true,mood:'race',moodCut:18000,live:{steer:0,brake:0,boost:0,rank:0,speed:0.8},
        phase:'ambient',want:'pre',cinN:N0,pos:0,padUntil:0,lvT:{},fillAt:-1,edit:null,quoteUntil:0,glitch:0,buildT0:-1,movement:0,mi:0,sec:null,forceRw:false,dropFx:false,amb:{...cp(M.amb),left:99,omen:false}})};
    const graph=async c=>{const a=performance.now();E.ctx=null;E.init(c);main+=performance.now()-a;await E.readyP;if(E.bp&&(E.bp.patch==='arp12'||E.bp.patch==='dream'))E.ensureEchoes()};
    const bar=(j,base)=>{const a=performance.now();for(let s=0;s<16;s++){try{E.play(t1+(j-base)*bd+s*sd,sd)}catch(x){}E.pos++}main+=performance.now()-a;slices++};
    if(SL.pgSus==null){SL.pgSus=false;try{const z=new OfflineAudioContext(1,512,8000);z.suspend(256/8000).then(()=>{SL.pgSus=true;z.resume()}).catch(()=>{});await z.startRendering()}catch(e){SL.pgSus=false}}
    const sus=SL.pgSus;let buf,kicks=[];const tr=performance.now();
    if(sus){/* one render, paused at every bar line to schedule the bar after next */
      const oc=new OfflineAudioContext(2,len,SR);await graph(oc);const a=performance.now();state();if(E.tP)await E.tP;main+=performance.now()-a;bar(0,0);
      for(let b=0;b<nb-1;b++){const q=Math.max(1,Math.round((t1+b*bd)*SR/128))*128/SR;oc.suspend(q).then(async()=>{bar(b+1,0);await MX.sync(E);oc.resume()})}
      await MX.sync(E);buf=await oc.startRendering();kicks=E.kickQ}
    else{/* no pausing an offline render (Firefox): render two bars at a time, each after a warm-up bar replayed from the
         engine's state, so tails, faders and voices carry over; joined with a 10 ms crossfade before the bar line */
      buf=M.ctx.createBuffer(2,len,SR);const B=2,F=Math.round(0.01*SR),snapKeys=Object.keys(E).filter(k=>{const d=Object.getOwnPropertyDescriptor(E,k);return d&&!d.get&&!d.set&&typeof d.value!=='function'});
      let snap=null;const take=()=>{const o={};for(const k of snapKeys)o[k]=cp(E[k]);return o},put=o=>{for(const k of snapKeys)E[k]=cp(o[k])};
      for(let a=0;a<nb;a+=B){const b=Math.min(nb,a+B),w0=Math.max(0,a-1),c2=new OfflineAudioContext(2,Math.ceil((t1+(b-w0)*bd+(b===nb?0.05:0.01))*SR),SR);
        if(snap)put(snap);await graph(c2);if(!snap){const z=performance.now();state();if(E.tP)await E.tP;main+=performance.now()-z}E.kickQ=[];
        for(let j=w0;j<b;j++){if(j===b-1&&b<nb){const z=performance.now();snap=take();main+=performance.now()-z}bar(j,w0);await new Promise(r=>setTimeout(r,0))}
        await MX.sync(E);const ch=await c2.startRendering(),off=Math.round(w0*bd*SR),A=a?Math.round((t1+a*bd)*SR):0,Z=b===nb?len:Math.round((t1+b*bd)*SR);
        for(let c=0;c<2;c++){const d=buf.getChannelData(c),x=ch.getChannelData(c);for(let i=Math.max(0,A-(a?F:0));i<Z&&i-off<x.length;i++){const y=x[i-off];d[i]=i<A?d[i]+(y-d[i])*(i-(A-F))/F:y}}
        for(const k of E.kickQ){const T=k+w0*bd;if(T>=t1+a*bd-0.001)kicks.push(T)}await new Promise(r=>setTimeout(r,0))}}
    const render=Math.round(performance.now()-tr);
    /* seamless loop: the drop's first bar takes the audio that followed the loop's own build (its tails), easing back
       into the first pass over the bar's second half; the count-in's last 4 ms fade so it can join it cleanly */
    const loopS=t1+N0*bd,loopE=loopS+LB*bd,x0=Math.round(loopS*SR),x1=Math.round(loopE*SR),n1=Math.round(bd*SR),h=n1>>1,fo=Math.round(0.004*SR);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let j=0;j<n1;j++){const w=j<h?1:1-(j-h)/h;d[x0+j]=d[x1+j]*w+d[x0+j]*(1-w)}for(let j=1;j<=fo;j++)d[x0-j]*=j/fo}
    kicks=kicks.filter(k=>k<loopE-0.001).sort((a,b)=>a-b);
    return{buf,loopS,loopE,bd,N0,kicks,key:H.key,sr:SR,how:sus?'bar by bar':'2 bars at a time',main:Math.round(main),slices,render,mb:+(buf.length*8/1048576).toFixed(1)}},
  /* the count-in starts the recording N bars before its drop, so the drop lands on GO */
  pgCue(t0,N){if(this.modeEff()!=='pre'||!(this.mood==='count'||this.mood==='race'))return false;const P=this.pg;
    if(!P||!this.st||P.code!==codeOf(this.st)){if(this.pgOn)this.pgStop();this.pgLate=true;this.pgWant(true);return false}this.pgPlay(t0,P.loopS-N*P.bd);this.pgLate=false;return true},
  /* rendered after GO: take over from the live music where a section starts that the recording has */
  pgHand(t){const P=this.pg;if(!P||this.modeEff()!=='pre'||!this.st||P.code!==codeOf(this.pgH()||this.st)||this.phase!=='groove'||!this.sec||this._final||!(this.mood==='race'||this.mood==='results'||this.mood==='pause'))return false;
    const[n,bi,bl]=this.sec;if(bi+1<bl)return false;const nx=this.queue.length?this.queue[0]:this.mv[(this.mi+1)%this.mv.length],o={drop:0,b:16,brk:32,rise:40}[nx[0]];
    if(o==null||nx[0]==='drop'&&nx[1]!==16||nx[0]==='rise'&&nx[1]!==8)return false;this.pgPlay(t,P.loopS+o*P.bd);this.pgLate=false;return true},
  pgPlay(t,off){this.pgNodes();const c=this.ctx,P=this.pg;this.pgHalt(t);const s=c.createBufferSource(),g=c.createGain();s.buffer=P.buf;s.loop=true;s.loopStart=P.loopS;s.loopEnd=P.loopE;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+0.006);s.connect(g);g.connect(this.pgF);s.start(t,Math.max(0,off));this.pgS={s,g,t,off,P};this.pgOn=true;this.pgKT=0;
    const o=this.out.gain;o.cancelScheduledValues(t);o.setValueAtTime(o.value,t);o.linearRampToValueAtTime(0,t+0.06)},
  pgHalt(t){const S=this.pgS;if(!S)return;this.pgS=null;try{S.g.gain.cancelScheduledValues(t);S.g.gain.setTargetAtTime(0,t,0.008);S.s.stop(t+0.1)}catch(e){}},
  pgStop(){const c=this.ctx;if(!c)return;const t=c.currentTime+0.02;this.pgHalt(t);this.pgOn=false;const o=this.out.gain;o.cancelScheduledValues(t);o.setValueAtTime(0,t);o.linearRampToValueAtTime(0.3,t+0.15);
    this.nextT=c.currentTime+0.06;this.pos=Math.ceil(this.pos/16)*16},
  /* while the recording plays: the kick times for the track lights (the only work done on the music in a race) */
  pgTick(){const S=this.pgS,c=this.ctx;if(!S)return;const P=S.P,now=c.currentTime,from=Math.max(this.pgKT||0,now),to=now+0.3;if(to<=from)return;this.pgKT=to;
    const L=P.loopE-P.loopS,pos=T=>{let p=S.off+(T-S.t);if(p>=P.loopE)p=P.loopS+(p-P.loopS)%L;return p},a=pos(from),b=pos(to),q=typeof VFX!=='undefined'?VFX.kick:null;if(!q)return;
    const add=(lo,hi,base)=>{for(const k of P.kicks)if(k>=lo&&k<hi)q.push(base+(k-lo))};if(b>=a)add(a,b,from);else{add(a,P.loopE,from);add(P.loopS,b,from+(P.loopE-a))}},
  /* final lap: at the next 4-bar line in the drop or B section, jump to the breakdown's last 4 bars; the build then
     drops back into the loop's drop, with the sub drop under it */
  pgFinal(){const S=this.pgS,c=this.ctx;if(!S)return;const P=S.P,bd=P.bd,L=P.loopE-P.loopS,now=c.currentTime+0.15;let p=S.off+(now-S.t);if(p<P.loopS)return;p=(p-P.loopS)%L;const b=p/bd;
    if(b>=28)return;const bJ=Math.ceil(b/4+1e-6)*4;if(bJ>=32)return;const tJ=now+(bJ*bd-p);this.pgPlay(tJ,P.loopS+36*bd);
    const V=this.vbuf,sub=V&&V.x_bass_drop_c;if(sub&&!this.lite){let d=((P.key%12)+12)%12;if(d>6)d-=12;const s=c.createBufferSource(),g=c.createGain();s.buffer=sub;s.playbackRate.value=Math.pow(2,d/12);g.gain.value=0.16;s.connect(g);g.connect(this.pgF);s.start(tJ+12*bd)}},

  /* the Prototype 38 recordings a tune needs, decoded when it is chosen (most tunes need a handful) */
  x2Keys(){if(this.T)return this.tX2(this.T);const o=[],X=SL.EXT2;if(!X)return o;const add=k=>{if(X[k]&&!o.includes(k))o.push(k)};
    if(this.kit2&&KITX2[this.kit2])for(const p of Object.values(KITX2[this.kit2].p))add(Array.isArray(p)?p[0]:p);
    const I=this.keysI&&INSTX[this.keysI];if(I&&I.x2)for(const b of I.b)add('x_'+this.keysI+'_'+b);
    const PX=this.percX;if(PX&&PX.x2){if(PX.loop)add(PX.loop);else for(const e of PX.p)if(e)for(const[k]of e)add(k)}
    const T=this.texR;if(T){for(const f of['pre','pre2','drop','brk'])if(T[f])add(T[f][0]);for(const[k]of T.pad)add(k)}
    if(this.bhit)add(this.bhit[0]);return o},
  ensureX2(){if(this.lite||!this.ctx||!SL.EXT2||!this.st)return this.x2P;const V=this.vbuf||{},busy=this.x2Busy||(this.x2Busy=new Set()),miss=this.x2Keys().filter(k=>!V[k]&&!busy.has(k));
    if(!miss.length){if(this.kit2&&this.kits&&!this.kits[this.kit2]&&this.kit0&&V[(Object.values(KITX2[this.kit2].p).map(p=>Array.isArray(p)?p[0]:p))[0]])this.mkKit(this.kit2);return this.x2P}
    const c=this.ctx,src={};for(const k of miss){busy.add(k);src[k]=SL.EXT2[k]}
    return this.x2P=Promise.all([this.decodeVox(c,()=>true,src),this.kitP,this.x2P]).then(([v])=>{for(const[k,b]of Object.entries(v)){try{const x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));
        let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_lp')&&!TEXPK[k]){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}SL.tame(k,v)}
      this.vbuf=Object.assign(this.vbuf||{},v);if(this.kit2&&this.kits&&!this.kits[this.kit2]&&this.kit0)this.mkKit(this.kit2);this.useKit()}).catch(()=>{})},
  mkKit(id){const K=KITX2[id],V=this.vbuf;if(!K||!V||!this.kit0)return;const kit={...this.kit0};
    for(const[k,spec]of Object.entries(K.p)){const[name,ov]=Array.isArray(spec)?spec:[spec,{}],b=V[name];if(!b||!SL.KIT[k])continue;
      try{kit[k]=this.mixPiece(k,this.synX[k]||null,b.getChannelData(0),{g:1,syn:0.5,...(SL.KIT[k][3]||{}),...ov})}catch(e){}}this.kits[id]=kit},
  /* a texture: started at t (from off into the recording), optionally tuned to the key or swelling in */
  texS(k,t,v,o,off=0){const b=this.vbuf&&this.vbuf[k];if(!b||off>=b.duration)return;const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=b;
    if(o==='t'&&TEXRT[k]!=null){let d=((this.st.key-TEXRT[k])%12+12)%12;if(d>6)d-=12;src.playbackRate.value=Math.pow(2,d/12)}
    if(o==='s'){g.gain.setValueAtTime(v*0.2,t);g.gain.linearRampToValueAtTime(v,t+Math.max(0.05,b.duration-off-0.05))}else g.gain.value=v;
    src.connect(g);g.connect(this.fxIn);this.send(g,this.hall,0.25);src.start(t,off);src.onended=()=>{try{g.disconnect()}catch(e){}}},
  texBar(n,bi,bl,left,t,bd){const T=this.texR,V=this.vbuf;if(!T||!V||this.lite)return;
    if(n==='rise'){for(const f of['pre','pre2']){const e=T[f],b=e&&V[e[0]];if(!b)continue;const tD=t+left*bd,t0=tD-(TEXPK[e[0]]||b.duration);
        if(t0>=t&&t0<t+bd)this.texS(e[0],t0,e[1],e[2]);else if(bi===0&&t0<t)this.texS(e[0],t,e[1],e[2],t-t0)}}
    if(n==='brk'&&bi===0&&T.brk&&this.tWash())this.texS(T.brk[0],t,T.brk[1],T.brk[2])},

