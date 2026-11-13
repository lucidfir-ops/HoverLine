//# race/055-frame-styles.js: each frame's own AI style (Prototype 45)
/* ---------- each frame its own way (Prototype 45) ----------
   The AI races each frame to its trait. dr: where it starts a drift (the corner's arc as a share of what the frame can
   steer at that speed; the Drifter drifts nearly every corner, the frames that gain little from a drift only drift to
   save a brake); ln: how far it cuts to the inside of a bend; av: how wide a berth it gives traffic ahead; sh: heavy
   frames shove lighter ones aside instead of steering round them; bk: how far past full steering it goes before
   braking (the Orb lets the outside wall turn it, since a wall costs it 15%); bh: the shield it keeps before holding
   boost; fi: how often it looks for a shot; dv: how hard it dives downhill; ja: its nose in the air over a jump.
   Nothing here draws a random number, and every input goes through the same physics a person's does. */
const AIX={on:true,F:{
  blade: {dr:0.75,ln:1,   av:1,   bk:1,   bh:0.6, fi:1,   dv:1,  ja:0.5}, /* the all-rounder: the textbook line */
  tether:{dr:1.02,ln:1,   av:1.4, bk:0.95,bh:0.65,fi:1,   dv:1,  ja:0.5}, /* fastest but wide, slow to turn and fragile: clear of traffic, a brake a moment early, more shield kept before boosting, a drift only to save a brake */
  skiff: {dr:0.72,ln:1.2, av:0.55,bk:1,   bh:0.6, fi:0.8, dv:1,  ja:0.5}, /* narrow and grippy: cuts to the inside, threads gaps, picks its shots from a small magazine */
  hauler:{dr:0.95,ln:1,   av:1,   bk:1,   bh:0.45,fi:1.3, dv:1,  ja:0.5,sh:1}, /* heavy and armoured: shoves through, boosts on its armour, fires on its own ammo */
  dart:  {dr:0.95,ln:1,   av:1,   bk:1,   bh:0.6, fi:1,   dv:1.6,ja:0.2}, /* the glider: dives hard downhill and flies the jumps nose level */
  orb:   {dr:1.2, ln:0.75,av:1,   bk:1.3, bh:0.6, fi:1,   dv:1,  ja:0.5}, /* rolls along walls: carries its speed into corners and lets the outside wall turn it */
  roller:{dr:0.45,ln:1,   av:0.8, bk:1,   bh:0.6, fi:1,   dv:1,  ja:0.5,sh:1}, /* the Drifter: drifts every corner it can, and shoves */
  mono:  {dr:0.72,ln:1,   av:0.8, bk:1,   bh:0.6, fi:1,   dv:1,  ja:0.5,sh:1}}, /* the heavy wheel: shoves, and drifts like the Blade */
  P44:{dr:0,ln:1,av:1,bk:1,bh:0.6,fi:1,dv:1,ja:0.5}};
const aiF=r=>AIX.on&&r.isAI&&!r.hum&&r.build?AIX.F[r.build.frame]||AIX.F.blade:AIX.P44;
/* The AI's drift (Prototype 45). It drifts by a person's rules (drStep: the brake held while steering, the arc on the
   stick, the frame's own speed build) and nothing more: isMan lets an AI racer use them while r.aiDm is set, from the
   press until the drift's extra speed has faded. It starts one when the road bends past its frame's dr 0.3 s and 0.7 s
   ahead, the same way, on the ground and clear of splits, gaps, jumps, crests and spire drops, and the corner in the
   next 1.3 s needs at most 1.38 of full steering (a drift tops out at 1.45; tighter, it brakes first, as before). In
   the drift its own steering law asks for the arc, and it holds the stick that gives that arc (the drift's stick map,
   inverted the way a person learns it); it lifts the nose only when the arc runs past full steering. It lets go when
   the corner opens (under 0.3 and 0.35 of full steering ahead) or needs more than a drift can give, after at least
   0.25 s (a shorter press would be a tap). Wanting a brake while the extra speed fades hands it back to the AI's brake. */
function aiDrift(r,o,raw,F){
  if(!F.dr||!r.isAI||r.hum||QK.live||r.finishT!=null||r.autoT>0||r===player&&(BOT||mp.auto)){r.aiDm=0;return o}
  const v=r.v,kF=drKF(r),ah=f=>T.Cs[idxAt(r.u+Math.max(12,v*f))],cA=ah(0.3),cB=ah(0.7);
  if(r.dN&&r.drift){const d=r.drift,n=raw*d;
    if(r.dT<0.25||!((-d*cA/kF<0.3&&-d*cB/kF<0.35)||n>1.62||r.dT>8)){const n0=r.dN0==null?0.5:r.dN0,sk=n>=n0?(n-n0)/Math.max(1e-6,1+DR.turn-n0):(n-n0)/Math.max(1e-6,n0-DR.kOut);
      o.steer=clamp(sk,-1,1)*d;o.brake=1;o.boost=false;if(o.pitch>=0)o.pitch=clamp((n-0.85)*2.5,0,0.7);return o}
    o.brake=0;return o}
  if(r.aiDm){if(o.brake>0.05||!(r.dB>1e-3))r.aiDm=0;else o.brake=0}
  if(r.air||r.stun>0||r.spinD>0||v<DR.von+8||!cA||Math.sign(cA)!==Math.sign(cB)||r.brS)return o;
  const d=-Math.sign(cA);if(Math.min(-d*cA,-d*cB)/kF<F.dr)return o;
  for(let f=0.1;f<=1.31;f+=0.15)if(-d*ah(f)/kF>1.38)return o;
  const uu=modU(r.u);for(let x=0;x<=Math.max(40,v*1.1);x+=6){const i=idxAt(r.u+x);if(T.spl[i]||T.gap[i]||T.mag&&T.mag[i]||x<v*0.6&&T.Kn[i]<-0.0011)return o}
  for(const S0 of T.splits)if(modU(S0.u0-uu)<220)return o;for(const j of T.jumps)if(modU(j.u0-uu)<v*1.2)return o;
  r.aiDm=1;o.brake=1;o.steer=d*clamp(Math.abs(raw),0.4,1);o.boost=false;return o}
/* Prototype 60: AI_STRIP: a held boost costs 8% of the shield a second (physics, 058) and tops the speed up by 22%; a green
   strip refills 24 a second (times the build's and the strip's rate). Boosting on a strip nets less shield a metre than
   riding it (rate - cost over a 1.22 times faster pass). aiStripBoost says whether the AI boosts now on the strip it is
   on: yes when, boosting from here to the strip's end, it gets at least fullB of the shield it needs (so about full); no while
   that would leave it clearly short but riding it plain would fill it (it boosts later, for the last part); and where no way
   fills it, yes if it would still leave with at least keep of its shield. curv: how tight a bend ahead it boosts through on
   a strip (0.004 before; the strip pays for the boost). Tuned in tools/sim/stripbench.js: boost share of strip time stays at
   75%, shield on leaving up 2 to 4 points, leaving full up 8 to 10 points. */
const AI_STRIP={boostV:1.22,full:0.97,fullB:0.7,keep:0.35,curv:0.008};
function aiStripBoost(r,uu){
  let z=null;for(const q of T.zones)if(q.kind==='hp'&&uu>=q.u0&&uu<=q.u1){z=q;break}
  if(!z)return true;
  const D=r.d,rate=24*(r.scoop==='hp'?2:1)*(D.chg||1)*(z.rate||1),cost=D.hp*0.08,rem=Math.max(0,z.u1-uu),v=Math.max(20,r.v),need=D.hp-r.hp;
  const gBoost=(rate-cost)*rem/(v*AI_STRIP.boostV),gPlain=rate*rem/v;
  if(gBoost>=need*AI_STRIP.fullB)return true;
  if(gPlain>=need*AI_STRIP.full)return false;
  return r.hp+gBoost>=D.hp*AI_STRIP.keep}
/* Prototype 60: an AI pilot in smoke (r.ink > 0, the view-loss effect the cloud gives for 2.4 s after the last puff) flies
   erratically: it loses its line (the target jumps across the road every half second), its steering swings hard (and its
   hands' wander is tripled, 054), it taps the brake and it leaves the boost alone. All of it is drawn from the race clock
   and the pilot's own bias, not Math.random, so a race with the same hits repeats (Prototype 61: by the race clock, S.raceT, not the page's, S.t, so it repeats on a page that has been open a while too). */
const SMOKE_AI={win:0.5,line:0.36,swing:1.1,tapWin:0.32,tapP:0.4,tapOn:0.16,wander:3};
const aiSmoked=r=>r.ink>0&&r.isAI&&r!==player;/* a person is never flown by this: they just lose their view */
const smokeH=(r,k,w)=>rng((Math.imul(Math.floor(S.raceT/w)+1,2654435761)^Math.imul((r.bias*1e4)|0,40503)^k)>>>0)();
function aiInput(r,dt){
  const none={steer:0,brake:0,pitch:0,fire:[false,false],hold:[false,false]};if(r.wreck>0)return none;
  const look=Math.max(22,r.v*0.75),F=aiF(r);
  const c=T.Cs[idxAt(r.u+look*0.6)];
  let target=clamp(-Math.sign(c)*Math.min(1,Math.abs(c)*140)*W*0.3*F.ln,-(W/2-2.8),W/2-2.8)+r.bias*W/16;
  /* drive over a recharge strip when it is close: green always (boosting on it is free), purple when short of ammo */
  const uu=modU(r.u);
  /* splits: choose a route before the fork, line up on its half of the road, then follow its line */
  let bnd=null,ybA=null,rBrk=0,rUp=0,lane=false;const SPin=T.splits.find(S=>uu>=S.u0&&uu<=S.u1);for(const SP of SPin?[SPin]:T.splits){const d=modU(SP.u0-uu);if(d<260||(uu>=SP.u0&&uu<=SP.u1)){if(r.brPick?.SP!==SP){const needs=r.hp<r.d.hp*0.7||r.ammo<r.d.ammo*0.45,heavy=(r.d.mass||1)>=1.2||(r.build&&r.build.stats.handling<=2),nimble=(r.build&&r.build.stats.handling>=4)||(r.d.size||1)<0.8;
      {const p0=clamp(0.5+(needs?0.3:0)+(heavy?0.2:0)-(nimble?0.35:0),0.1,0.9),alt=B=>SP.b.indexOf(B);let b;
       if(SP.kind==='pit')b=rand(r)<(r.hp<r.d.hp*0.55||(r.ammo<r.d.ammo*0.25&&r.hp<r.d.hp*0.85)?0.85:0.06)?SP.longB:1-SP.longB;
       else if(SP.kind==='cut')b=rand(r)<0.2?SP.longB:1-SP.longB;
       else if(SP.kind==='stack'||SP.kind==='catch')b=SP.lowB||0;/* Prototype 60: the jump picks the road (below) */
       else{const long=rand(r)<(r.sty&&r.sty.longP!=null?0.3*p0+0.7*r.sty.longP:p0);b=alt(SP.b.find(B=>B.long===long))}
       r.brPick={SP,b,long:SP.b[b].long}}}
    const want=SP.kind==='stack'&&r.stkS===SP?r.stkB:r.brPick.b,B0=SP.b[want];
    if(uu<SP.u0||uu>SP.u1){target=B0.c[0]+clamp(r.bias,-1,1)*Math.min(W/16,Math.max(0,B0.w[0]-1.8));lane=SP.kind!=='split'&&modU(SP.u0-uu)<220;if(B0.cut){ybA=0;if(modU(SP.u0-uu)<Math.max(40,r.v*0.5))rUp=1;if(modU(SP.u0-uu)<Math.max(50,r.v*0.6)&&r.v>r.d.vmax*0.7)rBrk=0.6}}
    else{const kq=Math.max(0,Math.min(SP.n,Math.round((uu-SP.u0)/T.ds))),fn=surf(uu,r.lat,r),Bn=SP.b[fn.b];
      if(SP.adj&&SP.adj[kq]&&fn.b!==want){target=B0.c[Math.min(SP.n,kq+Math.round(12/T.ds))];bnd=[fn.lo,fn.hi];ybA=0}
      else if(Bn&&Bn.cut){/* a cut bends hard in track terms: follow its heading and hold its line */
        target=fn.c+clamp(target*0.15,-(fn.hi-fn.lo)/2+2.6,(fn.hi-fn.lo)/2-2.6);bnd=[fn.lo,fn.hi];ybA=surf(uu+Math.max(8,r.v*(uu-SP.u0<60?0.25:0.12)),r.lat,r).yb;
        if(Bn&&Bn.cut&&(uu-SP.u0<40||SP.u1-uu<70))rUp=1}
      else{const fa=surf(uu+look,r.lat,r);target=fa.c+clamp(target*0.25,-(fa.hi-fa.lo)/2+2.6,(fa.hi-fa.lo)/2-2.6);bnd=[fa.lo,fa.hi]}}break}}
  const Lv=ailOf(),hn=hands(r);
  for(const z of T.zones){const ahead=modU(z.u0-uu),inside=uu>=z.u0&&uu<=z.u1;if(lane||(!inside&&ahead>80))continue;
    /* (P58) a strip ridden past (Easy): decided once a lap for each strip */
    if(Lv.strip>0&&hn){if(!r.zs||r.zs.size>300)r.zs=new Map();const key=z.u0+'|'+r.done;let sk=r.zs.get(key);if(sk==null){sk=rand(r)<Lv.strip*ailM(r);r.zs.set(key,sk)}if(sk)continue}
    if(z.kind==='hp'||r.ammo<r.d.ammo*0.6){if(z.laneF){if(surf(uu,r.lat,r).sp&&SF.b===T.splits[T.spl[idxAt(z.u0)]-1]?.longB)target=z.laneF(Math.max(uu+look*0.5,z.u0));continue}const side=z.side||(r.lat>=0?1:-1);target=z.lane!=null?z.lane:side*(z.edge+W/2-0.55)/2}}
  for(const s of shots){if(s.type!=='mine')continue;const d=wrapU(s.u-r.u);if(d>0&&d<45&&Math.abs(s.lat-target)<2.4)target+=s.lat>target?-4:4}
  for(const s of shots){if(s.type!=='quake'||s.owner===r||s.hits.has(r))continue;const d=wrapU(r.u-s.u);if(d>0&&d<(s.v-r.v)*2.2*(0.5+0.5*r.skill))target=s.gap}
  for(const o of racers){if(o===r||o.isGhost||F.sh&&o.d&&(o.d.mass||1)<(r.d.mass||1))continue;const d=wrapU(o.u-r.u);if(d>0&&d<14*Math.max(1,F.av)&&Math.abs(o.lat-target)<2.2*F.av&&o.v<r.v)target+=o.lat>r.lat?-3:3}
  if(aiSmoked(r))target+=(smokeH(r,1,SMOKE_AI.win)*2-1)*W*SMOKE_AI.line;/* (P60) smoke: the line is lost */
  target=bnd?clamp(target,bnd[0]+1.6,bnd[1]-1.6):surf(uu,r.lat,r).sp?clamp(target,SF.lo+1.6,SF.hi-1.6):clamp(target,-W/2+1.6,W/2-1.6);
  if(r.isAI&&!(r.autoT>0)&&!hands(r)){if(r.lapT>0)r.lapT-=dt;else if(rand(r)<dt*AI_LAPSE*(r.mk||1)*(0.35+Math.min(1.6,Math.abs(c)*220))){r.lapT=0.35+rand(r)*0.65;r.lapK=rand(r)<0.55?0:1;r.lapS=0.4+rand(r)*0.45;r.lapD=-Math.sign(c)||1}
    if(r.lapT>0&&r.lapK===1)target=clamp(target-r.lapD*W*0.32*r.lapS,-W/2+0.6,W/2-0.6)}
  const desired=ybA!=null?ybA-Math.atan2(target-r.lat,20):-Math.atan2(target-r.lat,look);
  let C=T.Cs[idxAt(r.u)];if(r.brS&&r.brS.kind==='cut'&&r.br===r.brS.longB&&T.spl[idxAt(r.u)]){const y1=surf(uu+4,r.lat,r).yb,y0=surf(uu-4,r.lat,r).yb,g=surf(uu,r.lat,r).g;C=(T.K[idxAt(r.u)]+(y1-y0)/8)*g}
  else if(r.brS&&r.brS.kind==='flip'&&r.br===r.brS.fB&&T.spl[idxAt(r.u)])C+=surf(uu,r.lat,r).kx;/* (Prototype 63: on the underside the road's bends turn the other way round) */
  const turn=(1.85-0.55*(r.v/VMAX))*r.d.turn*trimTurn(r);
  let steer=(3.2*(r.yaw-desired)-C*r.v)/turn;if(aiSmoked(r))steer+=(Math.sin(S.raceT*9+r.bias*3)+0.5*Math.sin(S.raceT*5.3+r.bias*7))*SMOKE_AI.swing;if(r.lapT>0&&r.lapK===0)steer*=1-r.lapS;
  // brake when the corner needs more turn than the ship has
  const smkTap=aiSmoked(r)&&smokeH(r,2,SMOKE_AI.tapWin)<SMOKE_AI.tapP&&S.raceT%SMOKE_AI.tapWin<SMOKE_AI.tapOn?1:0;/* (P60) smoke: brake taps */
  const brake=Math.max(rBrk,smkTap,Math.abs(steer)>F.bk?clamp((Math.abs(steer)-F.bk)*1.6,0,1):0);
  const fireW=[false,false],holdW=[false,false];/* passive slots (scoops) never fire */
  if((r.isAI||BOT&&r===player)&&r.finishT==null)for(let k=0;k<2;k++){const w=r.weapons[k];if(!canFire(r,k)||r.isAI&&(S.car||QK.live)&&S.aiF<1&&(S.raceT/5+r.skill*37)%1>S.aiF)continue;
    if(w==='cannon'){holdW[k]=aiWants(r,w);continue}
    /* (P58) Phase, Barrier and Decoy (P60: now the Reflector; Flares fire themselves): Hard watches for its moment every frame; Easy misses some */
    const dfn=hn&&(w==='phase'||w==='barrier'||w==='reflector');if(dfn&&Lv.sharp){if(aiWants(r,w))fireW[k]=true;continue}
    r.aiT[k]-=dt;if(r.aiT[k]>0)continue;r.aiT[k]=(w==='reflector'?0.12+rand(r)*0.3:0.45+rand(r)*1.25)/((r.sty?r.sty.fire:1)*F.fi);if(aiWants(r,w)&&!(dfn&&Lv.react>0&&rand(r)<Lv.react*ailM(r)))fireW[k]=true}
  const kc=T.Kn[idxAt(r.u+r.v*0.35)];
  const slA=T.Tg[idxAt(r.u+12)].y,pitch=rUp?1:r.air&&r.air!==true?F.ja:r.air===true||kc<-0.0011?-1:brake>0.05?0.7:Math.abs(T.Cs[idxAt(r.u+look*0.6)])>0.009?0.5*(r.sty?r.sty.up:1):slA>0.03?clamp(slA/0.08,0,1)*(r.sty?clamp(r.sty.up,0.4,1.2):1):slA<-0.03&&r.d.aero>0?-clamp(-slA*F.dv/0.08,0,1)*(r.sty?clamp(r.sty.dive,0.4,1.2):1):0;
  /* Held boost costs shield, so the AI saves it for straights while its shield is healthy; on a green strip the strip pays
     for it, so it boosts there whatever its shield (above the cut-out) unless the corner ahead is tight. */
  /* Prototype 60: before a speed jump the AI decides once a lap whether to go for the upper road (more often when the
     bonus is up there) and, if so, holds boost from 1 km out while its shield allows; it can still come up short */
  let sjB=false;if(r.isAI&&r.finishT==null&&!r.air){for(const j of T.jumps){if(!j.stk)continue;const d=modU(j.u0-uu);if(d>1000)continue;
    const key=j.u0+'|'+r.done;if(r.sjK!==key){r.sjK=key;r.sjGo=rand(r)<(j.stk.bonus==='up'?0.85:0.45)}if(r.sjGo&&r.hp>r.d.hp*0.15)sjB=true;break}}
  /* going for it, it races at a person's top speed (no AI pace factor) on the run-up */
  r.sjRun=sjB;
  /* Prototype 60: on a strip it boosts at every level (the levels' mistakes decide whether it takes a strip, not whether it
     boosts on one), but boosting costs more speed-time on the strip than it pays: it is on the strip 18% less long, and
     the strip refills less per second boosting than not. So it boosts for the part of the strip where it still reaches
     full (the shield it needs, aiStripBoost), and when the strip is too short to fill it anyway, as long as it leaves
     healthy. */
  const onGreen=r.charging==='hp',boost=sjB&&brake<0.3&&!aiSmoked(r)||r.isAI&&r.finishT==null&&!aiSmoked(r)&&brake<0.05&&!r.air&&(onGreen?r.hp>r.d.hp*0.15&&Math.abs(T.Cs[idxAt(r.u+look)])<AI_STRIP.curv&&aiStripBoost(r,uu):
    r.hp>r.d.hp*(r.sty?clamp(0.9-0.45*r.sty.boost,0.25,0.95):F.bh)&&Math.abs(T.Cs[idxAt(r.u+look)])<0.0015&&Math.abs(T.Cs[idxAt(r.u+look*1.8)])<0.0015);
  return aiHands(r,aiDrift(r,{steer:clamp(steer,-1,1),brake,pitch,boost,fire:fireW,hold:holdW},steer,F),dt)}

