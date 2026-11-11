//# music/engine/039-per-bar.js: music: once per bar: sections, arrangement, layer faders
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- once per bar: phase changes, arrangement, layer faders ---- */
  onBar(t,sd){if(this.pgLate&&this.pgHand(t))return;const bd=sd*16;let fresh=false,lv=null,dur=bd;
    if(this.want){this.phase=this.want;this.want=null;this.pb=0;
      if(this.phase==='pre'||this.phase==='drop'){const N=this.phase==='pre'?this.cinN:0,fin=this.finalPending;this.finalPending=false;
        this.phase='groove';fresh=true;this.swT0=null;this.hb=32-N;this.gb=0;this.mi=0;this.buildT0=-1;this.revealAt=-1;this.padUntil=0;this.queue=[];
        if(N>0){this.sec=['rise',0,N];this.queue=[['drop',fin?1e9:16]]}else{this.sec=['drop',0,fin?1e9:16];this.dropFx=true}}
      else if(this.phase==='build'){this.leadMode='full';this.hb=0;this.buildT0=t;this.sec=null;this.queue=[];this.gb=0;this.revealAt=-1;this.padUntil=0}
      else{this.buildT0=-1;this.sec=null;this.queue=[];this.amb.left=0;this.fxReset(t)}}
    else{this.pb++;if(this.phase!=='ambient')this.hb++}
    if(this.phase==='build'){const B=this.plan(bd),b=this.pb;
      if(b>=B.end){this.phase='groove';this.buildT0=-1;this.mi=1;fresh=true;this.gb=0;
        if(this.finalPending){this.sec=['b',0,2];this.queue=[['drop',1e9]];this.finalPending=false}else this.sec=['b',0,8]}
      else{const T=b*bd,Te=T+bd;
        if(b===B.full+4&&this.evo&&!this.T)this.mutateNow();
        this.stage={hatDense:T>=7,kickV:T<11?0:.3+.7*rmp(T,11,20),bassFull:T>=18,snareFull:T>=20,fillBar:b===B.end-1};
        const g=b>=B.full?1:b>=B.g2?2:b>=B.g4?4:b>=B.g8?8:0;this.leadGrid=g;this.echo=false;this.leadEv=g?this.leadFor(g):null;
        lv={amb:1-rmp(Te,0,2.6),keys:rmp(Te,0,2.6)*(1-.55*rmp(Te,18,30)),pad:rmp(Te,0,2.6)*(1-.2*rmp(Te,20,34)),tex:1-rmp(Te,8,24),hat:T<2?0:.25+.65*rmp(Te,2,18),kick:T<5?0:.3+.65*rmp(Te,5,24),bass:T<9?0:.25+.7*rmp(Te,9,26),
            snare:T<13?0:.4+.55*rmp(Te,13,24),arp:T<21?0:.25+.15*rmp(Te,21,34),lead:g===0?0:g===8?.35:g===4?.45:g===2?.55:.7};
        if(b===B.full-2)this.riser(t,bd*2,0.16);if(b===B.full)this.crash(t,0.12);this.amb.omen=false}}
    if(this.phase==='groove'){
      if(!fresh){this.sec[1]++;if(this.sec[1]>=this.sec[2])this.nextSection()}this.gb++;if(this.T)try{this.tBolPlan(t)}catch(e){}if(this.T){const[n0,b0,l0]=this.sec;if(n0==='drop'&&b0===0&&this.swT0==null)this.swT0=t;try{this.swPlanAt(t,bd,n0,b0,l0)}catch(e){}if(n0==='out'&&b0===0)this.cutOv={t0:t,t1:t+l0*bd,f0:Math.min(18000,this.moodCut||18000),f1:1400};if(b0===0)this.tTrim(t,bd)}else if(this.trimV!==1&&this.trimG)this.tTrim(t,0.05)
      const[n,bi,bl]=this.sec,left=bl-bi,tr=this.trR;
      if(bi===0&&n!=='rise'&&n!=='rw'&&this.hb%4)this.hb+=4-this.hb%4; /* sections start on the first bar of the hook */
      if(n==='a'&&bi===0&&this.themeChanged){this.revealAt=this.hb;this.themeChanged=false}
      let rb=this.revealAt>=0?this.hb-this.revealAt:99;if(rb>=8&&this.revealAt>=0){this.revealAt=-1;rb=99}
      if(this.T){}else if(n==='brk'&&bi===0&&this.wantShuffle(t)){this.blendNew(t)}else if(n==='brk'&&bi===0&&this.wantRaceBlend()&&(this.brkN=(this.brkN||0)+1)%2===0)this.blendRace(t)
      /* Evolving varies the hook at section changes (and sometimes halfway through a groove); every drop brings the
         original back, so a race keeps one recognisable tune. */
      if(this.T){}else if(this.evo){if(rb===99&&bi===0){if(n==='drop'&&this.st.mut.some(m=>m))this.restoreTheme();else if((n==='b'||n==='brk'||n==='sw'||n==='a')&&this.r()<0.75)this.mutateNow()}
        else if(rb===99&&bi===8&&(n==='drop'||n==='b')&&this.r()<0.4)this.mutateNow()}
      else if(bi===0&&n==='brk'&&this.r()<0.8)this.mutateNow();else if(bi===0&&n==='drop'&&this.st.mut.some(m=>m))this.restoreTheme();
      const mode=this.leadMode=this.rxPlan(this.leadPlan(n,bi,bl),n),g=rb<2?1:rb<4?8:rb<6?4:rb<8?2:mode==='thin'?2:1;this.echo=rb<2;this.leadGrid=g;this.leadEv=mode==='off'?null:this.leadFor(g,this.echo);
      /* A build is a rise of 1-8 bars: groove without bass, then a snare roll over the last four bars (quarters, eighths,
         sixteenths, thirty-seconds) that climbs in level and pitch, a noise riser and a pitched uplift, a high-pass sweep,
         the kick out in the last bar, two sixteenths of silence and a reverse crash into the drop's impact. */
      const mb=n==='brk'&&this.fk==='metal'; /* metal's breakdown is the other kind: half-time, palm-muted chugs */
      const R=Math.min(4,bl),pre=n==='rise'&&bl<=2,roll=n==='rise'&&left<=R?(left===1?1:left===2?(bl<=2?2:1):left===3?2:4):0;
      this.stage={hatDense:n!=='brk'&&n!=='out'&&!(n==='rise'&&left>4),kickV:n==='rise'&&left>4?.7:1,bassFull:n!=='rise'&&n!=='out',snareFull:n!=='rise'||left>4,
        roll,rollBar:R-left,R,half:(n==='sw'&&!tr)||mb,noClap:n==='sw'&&tr,kick4:n==='rise'&&left<=4&&left>1&&!pre,
        kickOff:n==='rw'||n==='out'||(n==='brk'&&!mb)||(n==='rise'&&(left===1||pre)),ride:!tr&&!this.T&&this.st.rng%4===0&&(n==='b'||(n==='drop'&&bl>999&&bi>=8)),
        fillBar:(n==='drop'||n==='b'||n==='a'||n==='sw'||n==='solo'||n==='drum')&&(bi%8===7||left===1)&&!(n==='drop'&&left===1&&this.rwAt>t),gapEnd:n==='rise'&&left===1};
      this.fillK=this.stage.fillBar?(tr?'snare':((x)=>x<(this.fk==='metal'?0.3:0.5)?'snare':x<0.85?'toms':'flam')(Math.random())):null;
      if(n==='rise'){const x=(bi+1)/bl;
        lv=pre?{amb:0,pad:.95,keys:.45,tex:.25,hat:.3+.4*x,kick:0,snare:1,bass:0,lead:0,arp:.35+.3*x}
          :left>4?{amb:0,pad:1,keys:.5,tex:.3,hat:.55,kick:.7,snare:.8,bass:0,lead:.55,arp:.45}
          :{amb:0,pad:1,keys:.4,tex:.2,hat:.55+.1*(4-left),kick:left===1?0:.8,snare:1,bass:0,lead:left===1?.45:.65,arp:.55+.1*(4-left)};
        if(bi===0)this.cutOv={t0:t,t1:t+bl*bd,f0:pre?1600:1300,f1:18000};
        if(left===R)this.riser(t,R*bd-2*sd,(pre?0.2:0.24)*(this.T?0.6:1));
        const H=Math.min(2,R);if(left===H){this.uplift(t,H*bd-2*sd);const f=this.hp.frequency,tD=t+H*bd;f.cancelScheduledValues(t);f.setValueAtTime(10,t);f.linearRampToValueAtTime(pre?160:240,tD-2*sd);f.setValueAtTime(10,tD)}
        if(left===1){this.gapAt(t+14*sd,t+bd);if(!(this.cym&&this.vbuf&&this.vbuf.i_cy&&!this.lite&&R>=2))this.revCrash(t+bd);this.dropFx=true}}
      else lv=mb?{...LV.sw,pad:.7,tex:.4,hat:.6,lead:0,arp:0,keys:.5}:{...LV[n]};if(!this.evo)lv.arp*=0.7;
      if(n==='rw'){this.revCrash(t+bd);this.dropFx=true}
      /* the rewind (drum & bass and breakcore, at most once a tune): halfway through a drop's last bar the record is
         pulled back, a bar of silence, then the drop again from the top */
      if(n==='drop'&&left===1&&bl===16&&!this.swPl&&!this._final&&!this.rwDone&&(this.fk==='dnb'||this.fk==='brk')&&this.kit&&this.kit.rw&&(this.forceRw||Math.random()<0.3)){
        this.rwDone=true;const t0=t+8*sd;this.rwAt=t+bd;this.playS(this.kit.rw,t0,0.5,this.fxIn);this.gapAt(t0+0.03,t+2*bd,0.15);this.queue.unshift(['rw',1],['drop',16])}
      /* vocals are spice: a shout into the first drop, every third build after and the final lap; one sung
         call-and-response in every other main drop (never the b section); one line in every other breakdown;
         a single choir chord to open each breakdown */
      if(this.vocal&&this.vbuf){const key=this.st.key,ch=this.chordAt(this.hb,0),root=(key+ch.deg)%12;
        const vk=this.vks||(this.vks={});if(bi===0)vk[n]=(vk[n]||0)+1;const k=vk[n]||1;
        if(n==='rise'&&left===1&&(k%3===1||this._final))this.sing(this.st.rng%2?'c_herewego':'c_letsgo',t+(tr?6:4)*sd,key,0.55);
        if(n==='drop'&&bi===6&&k%2===1){const w=['c_hey','c_yeah','c_go','c_oh'][(this.st.rng+(k>>1))%4];this.sing(w,t+6*sd,root,0.58);this.sing(w,t+14*sd,(root+7)%12,0.46)}
        if(n==='brk'&&bi===1&&k%2===0)this.sing(k%4===0?'c_higher':'c_feel',t,key,0.4);
        if(n==='brk'&&bi===0){const tn=ch.tones.map(x=>60+((key+x)%12+12)%12);this.choir(t,tn)}}
      if(this.vbuf&&!this.lite&&this.phase==='groove'){const V=this.vbuf,key=this.st.key,ch=this.chordAt(this.hb,0),rp=((key+ch.deg)%12+12)%12,K=this.keysI;
        const voi=ch.tones.slice(0,3).map(x=>{let q=60+((key+x)%12+12)%12;if(q>66)q-=12;return q});
        if(n==='brk'&&K){for(const q of voi)this.instNote(K,q,t,bd*1.6,0.3);this.instNote(K,36+rp+(rp>5?0:12),t,bd*1.8,0.27);if(bi%2===1)for(const q of voi)this.instNote(K,q+12,t+10*sd,bd*0.7,0.16)}
        if(n==='b'&&this.stabs&&bi%2===0)for(const o of[6,14])for(const q of voi)this.instNote(K,q,t+o*sd,sd*1.5,0.26);
        if(n==='brk'&&bi===0&&this.harp&&V.i_hp_69){const sc=this.scale;for(let j=0;j<14;j++){const q=60+key+sc[j%7]+12*Math.floor(j/7)-12;this.instNote('hp',q,t+j*sd*0.5,sd*6,0.2+0.02*j)}}
        if(n==='rise'&&this.tymp&&V.i_tp&&left<=2){const tq=Math.abs(36+rp-43)<Math.abs(48+rp-43)?36+rp:48+rp,rate=Math.pow(2,(tq-43)/12);for(let j=0;j<(left===1?8:4);j++){const g=this.playS(V.i_tp,t+j*(left===1?2:4)*sd,(left===1?0.3:0.2)+0.04*j,this.bus.kick,0,rate);this.send(g,this.hall,0.3)}}
        if(n==='rise'&&this.cym&&V.i_cy&&left===2){const g=this.playS(V.i_cy,Math.max(t,t+2*bd-V.i_cy.duration),0.42,this.fxIn);this.send(g,this.rev,0.3)}}
      if(n==='drop'&&bi===0&&bl>999)this.fxS('s_cb',t,this.T?0.42:0.6,this.fxIn);if(this.texR)this.texBar(n,bi,bl,left,t,bd);
      if(!this.T&&bi===0&&n==='sw'&&!tr&&this.st.rng%3===0)this.fxS('s_sp',t,0.22);
      if(left===1&&this.kit&&this.kit.wh){const nx=this.queue.length?this.queue[0][0]:this.mv[(this.mi+1)%this.mv.length][0];if((nx==='out'||(nx==='brk'||nx==='sw')&&(!this.T||this.T.fx.includes('wh')))&&!(n==='drop'&&this.rwAt>t)){const g=this.playS(this.kit.wh,t+bd-0.9,0.7,this.out);this.send(g,this.rev,0.4)}}
      if(n==='drop'&&bi===0)dur=this.dropFx?0.02:sd*2}
    if(this.phase==='ambient'){this.ambBar(t,sd);lv={amb:1,tex:1};this.leadEv=null}
    else{lv.echo=0.6;lv.resp=(lv.lead||0)*1.05;if(this.fk==='metal'){lv.arp=(lv.arp||0)*0.25;lv.pad=(lv.pad||0)*0.55}else if(this.fk==='psy'){lv.pad=(lv.pad||0)*0.6;lv.arp=(lv.arp||0)*0.6}
      /* Echoes of the old themes are now rare: only in a breakdown, at most one every 32 bars, about one in three breakdowns. */
      if(this.evo&&this.mood!=='race'&&this.phase==='groove'&&this.sec&&this.sec[0]==='brk'&&this.sec[1]===2&&this.pos>=(this.quoteUntil||0)&&Math.random()<0.4)this.quote(t,sd,this.hb)}
    if(this.T&&lv&&this.sec&&this.sec[0]==='rise'){lv.snare=(lv.snare||0)*0.7;lv.pad=(lv.pad||0)*0.7;lv.hat=(lv.hat||0)*0.85}if(this.rA||this.rE)this.rxLv(lv);if(this.T&&lv&&this.phase==='groove'){const M=this.T.lvm;if(M)for(const k in M)if(lv[k]!=null)lv[k]*=M[k];const D=this.tBolDuck();if(D)for(const k in D)if(lv[k]!=null)lv[k]*=D[k]}if(this.hpF&&this.phase==='groove'&&this.sec&&this.sec[1]===0)this.hpSec(t,this.sec[0],bd);
    for(const k of LAYERS){const gn=this.bus[k].gain,p=this.lvT[k]||0,v=lv[k]||0;gn.setValueAtTime(p,t);gn.linearRampToValueAtTime(v,t+dur);this.lvT[k]=v;this.gate[k]=Math.max(p,v)>0.01}if(this.cymF){const gn=this.cymF.gain,p=this.cymP||0,v=this.lvT.hat||0;gn.setValueAtTime(p,t);gn.linearRampToValueAtTime(v,t+dur);this.cymP=v}
    this.applyCut(this.cutOv?dur:0.12)},
