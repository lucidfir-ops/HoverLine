//# music/engine/047-template-tunes.js: music: building a template tune: kits, instruments, sections, parts
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
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
