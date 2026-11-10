//# music/engine/038-reactive.js: music: reactive race music (follows speed, position, laps)
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- Reactive race music (Prototype 39): Generative mode only; Pregen and Songs play as they were ----
     Three slow readings of the race, taken ten times a second (rxSense from the game, or rxFeed from a test):
     sp    the player's speed over the frame's own top speed, averaged over about 15 s (the first 8 s after GO skipped);
     c     combat: +1 for each hit taken or given, +0.2 for each of your shots, +0.15 for each shot of someone else's
           the first time it comes within 60 m of you (at most 0.45 a second), fading with a 5 s time constant; calm
           counts the seconds since the last hit taken or given or shot coming near;
     gap   seconds ahead of second place (-1 when not leading); lead counts the seconds spent 2.5 s ahead and calm.
     At each bar line (rxBar, called by the scheduler before the bar's sixteenths are timed) they move three levels:
     - tempo: up to 4 bpm either way at drum & bass tempos (kept within 168-180) or 3 at trance tempos (130-145), half a
       bpm a bar at most. Held inside a build and a rewind (both are timed to their drop), at the tune's own tempo for
       the count-in (so a shared GO still lands), easing back to it in the results and the menus. No nudge at all
       between 0.76 and 0.90 of top speed, where about half of all race time is spent; full nudge at 0.97 and 0.56.
     - aggression 0-2 (c over 2, then 4; back below 1 and 2.5): up one level at a 2-bar line, down one level
       every 4 bars. 1: the bass driven harder and brighter, the groove's ghost snares outside the drop, 16th hats,
       claps doubling the backbeat (a snare under the claps in trance), slightly fuller kick and snare, pads a little
       lower. 2: more drive, louder claps, a crash every 4 bars, palm-muted guitar chugs on the bass notes of drum &
       bass and breakcore tunes (blends too, in drops and B sections), double kicks in metal.
     - lift 0-2, the trancey reward (never with aggression): 1 when 2.5 s (about 300 m) ahead with no combat for 8 s
       (held 4 s), 2 when 5 s ahead, calm for 15 s and 15 s into the lead: pads and arp up and opened, 16th arps
       through drops and B sections; at 2 the lead plays the whole hook. Up at a 4-bar line, down at the next bar line.
     Calibrated on the developer's race logs (Prototypes 37 and 38) and on simulated races (tools/sim, PILOT=human):
     aggression is on for about 5% of a typical logged race (20% of the busiest) and 40-60% of a pack fight; races are
     close (the logged wins were by under 1.5 s at the line), so lift is a rare reward for a real break.
     All three are zero in a neutral race (speed in the band, no combat, not well ahead), and then a tune code plays
     exactly as before. The levels only change the mix and how the tune's own parts play; they draw nothing from the
     random numbers, so the rest of the tune is the same whatever they did. Pregen's offline engine (Object.create of
     this one) always reads them as zero. */
  get tO(){const R=this.rx;return R&&this===music?R.t:0},get rA(){const R=this.rx;return R&&this===music?R.a:0},get rE(){const R=this.rx;return R&&this===music?R.e:0},
  rxReset(){this.rx={t:0,a:0,e:0,sp:0.83,c:0,calm:99,gap:-1,lead:0,rt:0,given:null,pt:0,tT:0,aT:0,eT:0,down:0,lg:'',seen:new WeakSet()}},
  rxEv(n){const R=this.rx;if(!R||this!==music||this.mood!=='race')return;if(n==='hit'){R.c+=1;R.calm=0}else if(n==='fire')R.c+=0.2},
  rxSense(){const R=this.rx;if(!R||this!==music||this.mood!=='race')return;const now=performance.now()/1000,dt=R.pt?Math.min(0.5,now-R.pt):0;R.pt=now;if(!(dt>0))return;
    let sp=this.live.speed||0,giv=0,near=0,gap=-1;
    try{const p=player,vm=p.d&&p.d.vmax||VMAX;sp=Math.min(1,Math.max(0,p.v/vm));
      if(p.stat){if(R.given==null)R.given=p.stat.given;giv=Math.max(0,p.stat.given-R.given);R.given=p.stat.given}
      for(const x of shots)if(x.owner!==p&&x.u!=null&&!R.seen.has(x)&&Math.abs(wrapU(x.u-p.u))<60){R.seen.add(x);near++}
      let best=null;for(const o of racers){if(o===p||o.isGhost||o.left)continue;if(o.finishT!=null){best=Infinity;break}if(best==null||o.utot>best)best=o.utot}
      if(best!=null&&isFinite(best)&&p.finishT==null&&p.utot>best)gap=(p.utot-best)/Math.max(60,R.sp*vm)}catch(e){}
    this.rxFeed(dt,{sp,hit:giv,near,gap})},
  rxFeed(dt,o){const R=this.rx;if(!R)return;R.rt+=dt;if(R.rt>8)R.sp+=(o.sp-R.sp)*(1-Math.exp(-dt/15));
    R.c=R.c*Math.exp(-dt/5)+(o.hit||0)+Math.min(0.45*dt,(o.near||0)*0.15);if(o.hit||o.near)R.calm=0;else R.calm+=dt;
    R.gap=o.gap==null?-1:o.gap;R.lead=R.gap>=2.5&&R.calm>=8?R.lead+dt:0},
  /* one step at a bar line; n is the bar about to start (null between phases: count-in, menu build) */
  rxBar(){const R=this.rx;if(!R||this!==music||this.mood==='pause')return;
    if(this.phase==='ambient'||!this.st){if(R.t||R.a||R.e){R.t=R.a=R.e=0;this.dlyTempo()}R.tT=R.aT=R.eT=0;return}
    let n=null,bi=0;if(this.phase==='groove'&&this.sec&&!this.want){const[sn,sb,sl]=this.sec;if(sb+1<sl){n=sn;bi=sb+1}else n=(this.queue.length?this.queue[0]:this.mv[(this.mi+1)%this.mv.length])[0]}
    const b0=this.bpm0,dn=b0>=150,K=this.T?2:dn?4:3;
    if(this.mood==='race'&&this.style!=='off'&&this.modeEff()==='gen'){const sp=R.sp,x=sp>0.9?K*Math.min(1,(sp-0.9)/0.07):sp<0.76?-K*Math.min(1,(0.76-sp)/0.2):0;
      R.tT=x===0?0:Math.abs(x-R.tT)>=0.5||Math.sign(x)!==Math.sign(R.tT)?Math.round(x*2)/2:R.tT;
      R.tT=this.T?Math.max(-2,Math.min(2,R.tT)):Math.min(Math.max(b0,dn?180:145),Math.max(Math.min(b0,dn?168:130),b0+R.tT))-b0;
      const c=R.c,a=R.aT;R.aT=c>=4||c>=2.5&&a===2?2:c>=2||c>=1&&a>=1?1:0;
      const e=R.eT,ok2=R.gap>=5&&R.calm>=15&&R.lead>=15||e===2&&R.gap>=3.5&&R.calm>=15,ok1=R.gap>=2.5&&R.calm>=8&&R.lead>=4||e>=1&&R.gap>=1.5&&R.calm>=8;
      R.eT=R.aT?0:ok2?2:ok1?1:0}
    else R.tT=R.aT=R.eT=0;
    const w0=R.t,w1=R.a,w2=R.e;if(R.down>0)R.down--;
    if(n&&n!=='rw'&&!(n==='rise'&&bi>0)&&R.t!==R.tT){R.t+=Math.max(-0.5,Math.min(0.5,R.tT-R.t));this.dlyTempo()}
    if(R.aT&&R.e)R.e=0;
    if(n&&R.aT>R.a&&!R.e&&bi%2===0){R.a++;R.down=4}else if(n&&R.aT<R.a&&R.down<=0&&bi%4===0){R.a--;R.down=4}
    if(n&&R.eT>R.e&&!R.a&&bi%4===0)R.e++;else if(R.eT<R.e)R.e--;
    if(R.t!==w0||R.a!==w1||R.e!==w2){const k=Math.round(this.bpm)+'|'+R.a+'|'+R.e;if(k!==R.lg){R.lg=k;this.mlog('mus',{bpm:Math.round(this.bpm*10)/10,agg:R.a,lift:R.e,c:Math.round(R.c*10)/10,gap:Math.round(R.gap*10)/10,sp:Math.round(R.sp*100)/100})}}},
  barSd(sd){const t0=this.tO,b0=this.bpm;let sw=false;try{sw=this.swApply()}catch(e){}try{this.rxBar()}catch(e){}return this.tO!==t0||sw&&this.bpm!==b0?60/this.bpm/4:sd},
  /* the echoes glide to the new tempo over a bar */
  dlyTempo(){if(!this.dly||!this.ctx)return;const b=this.bpm,ob=this.dlyB||b,t=this.ctx.currentTime,d=240/b;this.dlyB=b;
    const go=(p,k)=>{p.cancelScheduledValues(t);p.setValueAtTime(k/ob,t);p.linearRampToValueAtTime(k/b,t+d)};
    go(this.dly.delayTime,45);go(this.dly2.delayTime,22.5);if(this.dly16){go(this.dly16.delayTime,15);go(this.dly8t.delayTime,20)}},
  rxLv(lv){const a=this.rA,e=this.rE,n=this.sec&&this.sec[0];if(this.phase!=='groove'||!n||n==='rw'||!lv)return;
    if(a){lv.pad=(lv.pad||0)*(a>1?0.75:0.88);if(n!=='rise'){lv.kick=(lv.kick||0)*(1+0.04*a);lv.snare=(lv.snare||0)*(1+0.05*a);lv.hat=Math.min(1.15,(lv.hat||0)*(1+0.07*a)+(n==='brk'?0.1*a:0))}}
    if(e){lv.pad=Math.min(1.3,(lv.pad||0)*(e>1?1.4:1.25));lv.arp=Math.min(1,(lv.arp||0)*(e>1?1.5:1.3));lv.keys=Math.min(1.1,(lv.keys||0)*1.15)}},
  rxPlan(m,n){return this.rE>1&&(n==='drop'||n==='b'||n==='a')?(m==='call'?'full':m==='off'&&n==='drop'?'call':m):m},
  rxBass(o){const k=this.rA>1;return{...o,cut:(o.cut||800)*(k?1.3:1.2),env:(o.env||0)*(k?1.2:1.12),cal:(o.cal||0.65)*(k?0.9:0.94),rxD:k?1.9:1.55}},
  /* aggression's extra hits: claps doubling the backbeat (a snare under trance claps); at 2 metal's double kick and
     palm-muted guitar chugs on the bass notes */
  rxHits(t,s,sec,stg,Gr,tr,metal,ch,key,sd,hb){if(!(sec==='drop'||sec==='b'||sec==='a'||sec==='sw')||stg.half||stg.roll)return;const a2=this.rA>1;
    if(tr){if(!stg.noClap&&Gr.c&&Gr.c.includes(s)&&this.kit&&this.kit.s2&&this.gate.snare)this.playS(this.kit.s2,t,a2?0.4:0.3,this.bus.snare);return}
    if(Gr.s&&Gr.s.includes(s)&&this.gate.snare)this.clap(t,a2?0.3:0.22);if(!a2)return;
    if(metal){if(s%2===0&&!Gr.k.includes(s)&&!stg.kickOff&&this.gate.kick&&(sec==='drop'||sec==='b'))this.kick(t,0.7,true);return}
    if(this.gtr&&this.gate.bass&&stg.bassFull&&(sec==='drop'||sec==='b')){let d=0;
      if(this.bpBass){const e=this.bpBass[this.bpLen>16?(hb%2)*16+s:s];if(e)d=e.d}else for(const[bs,bl]of this.bassPat)if(bs===s)d=bl;
      if(d){const pc=((key+ch.deg)%12+12)%12;this.playS(this.gtr.m[pc],t,0.13,this.bus.bass,sd*Math.min(2,d)*0.9)}}},
  /* race-log notes (the log keeps them only while a race is being logged) */
  mlog(e,o){try{if(this===music&&LOG.cur)logEv(e,o)}catch(x){}},
  played(){return this.ctx?Math.round((this.ctx.currentTime-(this.tuneAt||0))*10)/10:null},
