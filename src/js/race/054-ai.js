//# race/054-ai.js: the AI pilots: racing line, steering, weapons, mistakes
/* ---------- AI ---------- */
const modU=u=>((u%T.L)+T.L)%T.L;
function aiWants(r,w){
  if(w==='missile'){const t=targetAhead(r,200);return(t&&Math.abs(t.lat-r.lat)<5)||(!targetAhead(r,260)&&!!targetBehind(r,120))}
  if(w==='cannon'){const t=targetAhead(r,110);return!!t&&Math.abs(t.lat-r.lat)<2}
  if(w==='mines'){for(const o of racers){const d=wrapU(r.u-o.u);if(o!==r&&live(o)&&d>8&&d<90)return true}return false}
  if(w==='shock'){for(const o of racers)if(o!==r&&live(o)&&Math.abs(wrapU(o.u-r.u))<22)return true;return false}
  if(w==='turbo')return Math.abs(T.Cs[idxAt(r.u+60)])<0.003;
  if(w==='barrier'){if(threatsTo(r).some(h=>h.t<0.6&&!h.safe))return true;return r.hp<r.d.hp*0.35&&Math.random()<0.1}
  if(w==='phase')return threatsTo(r).some(h=>h.t<0.35&&!h.safe&&h.k!=='mine');
  if(w==='decoy')return threatsTo(r).some(h=>(h.k==='missile'||h.k==='swarm'||h.k==='hunter')&&h.t<1.2);
  const ahead=range=>racers.filter(o=>o!==r&&live(o)&&(d=>d>2&&d<range)(wrapU(o.u-r.u)));
  if(w==='rockets'){const t=targetAhead(r,150);return!!t&&Math.abs(t.lat-r.lat)<3.5}
  if(w==='swarm')return ahead(280).length>=2||!!targetAhead(r,150);
  if(w==='quake')return ahead(260).length>=2||(!!targetAhead(r,120)&&Math.random()<0.3);
  if(w==='bouncer'){const t=targetAhead(r,180);return!!t&&Math.abs(t.lat-r.lat)<6}
  if(w==='hunter'){const t=leaderFor(r);return!!t&&wrapU(t.u-r.u)>120&&t.utot>r.utot}
  if(w==='emp')return ahead(400).length>=2;
  if(w==='smoke'){for(const o of racers){const d=wrapU(r.u-o.u);if(o!==r&&live(o)&&d>10&&d<70)return true}return false}
  /* Prototype 50: the autopilot takes a pilot's hands off the stick, so the AI saves it for the twistiest road ahead (most of
     the next three seconds bending hard) or for scraping a wall on a low shield */
  if(w==='autopilot'){if(r.hp<r.d.hp*0.45&&S.raceT-(r.wallT??-9)<0.6)return true;let n=0,m=0;for(let x=Math.max(10,r.v*0.3);x<r.v*3;x+=8){m++;if(Math.abs(T.Cs[idxAt(r.u+x)])>0.0045)n++}return m>0&&n>m*0.5}
  if(w==='overdrive'){for(const s of shots)if((s.type==='missile'||s.type==='hunter')&&s.target===r&&Math.abs(wrapU(r.u-s.u))<80)return true;for(const o of racers)if(o!==r&&live(o)&&Math.abs(wrapU(o.u-r.u))<25)return true;return false}
  return false}
/* Autopilot (Prototype 36): the AI steers, brakes and trims the nose, but your modules and boost stay yours, so you can
   phase or fire while it flies (it used to take every input, and fired nothing). */
function apInput(r,inp,dt){const a=aiInput(r,dt);a.fire=inp.fire;a.hold=inp.hold;a.boost=!!(a.boost||inp.boost);return a}
/* AI lapses a second at an average corner (Prototype 38), tuned so the AI touches the walls about a quarter as often as
   people do. Since Prototype 50 only the AI without hands (quick races, the autopilot) has them. */
const AI_LAPSE=0.13;
/* ---------- Prototype 50: the AI pilots fly with a person's hands ----------
   Every AI pilot's steering goes through the model of a person that tools/sim fits to Eric's race logs (the Eric pilot):
   the stick follows what the AI wants a moment late (a lag of tau seconds) and wanders (an error that drifts off and comes
   back, sigma, with a 0.7 s memory), per track width; the wander is in how far the frame turns, not how far the stick
   moves (a person flying a quick-turning frame learns a lighter hand, as Eric's handling 5 races show). They fly by
   people's rules too: the person's brake (with the stick
   over, holding the brake drifts, so to slow in a corner they tap it, and a tap bites), the lane assist of their
   handling, the heading help people get on each width, and none of the AI's scripted lapses (the wander is their mistake
   now). The speed they lose to their hands is handed back in their skill (ROSTER), so their lap times stay where they
   were. Autopilot takes the hands off for its 4.5 s: an AI pilot carrying it uses it when the road ahead twists hard, or
   when it is scraping the walls on a low shield. Quick races keep the old AI. */
const HANDS={on:true,mem:0.7,W:{tau:0.12,sigma:0.24},S:{tau:0.06,sigma:0.17},N:{tau:0.06,sigma:0.165},tap:0.12,gap:0.14};
const hands=r=>HANDS.on&&r.isAI&&!r.hum&&!r.proxy&&r!==player&&!QK.live&&!(r.autoT>0)&&r.finishT==null;
/* ---------- Prototype 58: rival levels ----------
   Normal is the AI as it was (Prototype 50), and the only level on the online board. Easy and Hard are the same pilots
   flying like Eric at his worst and at his best (tuned in tools/sim against the Eric pilot fitted to his Prototype 53-56
   logs: his sloppy self finishes mid-field against Easy, his clean self against Hard):
     sig, tau  the hands' wander (wall touches) and lag, against Normal's
     nose      the chance, a spell of 2-5 s at a time, that a pilot forgets the nose (flies it level, losing the corners'
               and slopes' grip and speed)
     strip     the chance a pilot rides past a recharge strip it would have taken
     react     the chance a pilot misses its moment for Phase, Barrier or Decoy; sharp: it watches for them every moment
               (Normal looks every half second or so)
     pace      top speed against Normal's, on top of each pilot's own skill (one number, or one per road width)
     band      how much of the old rubber band is left (the speed a pilot gains behind you, or loses ahead)
     sb        skill banding instead: a pilot behind you makes fewer mistakes, down to 55% of them 400 m back; ahead of
               you it flies as its level does, so a pilot who gets away stays away */
/* Prototype 59: Easy is now called Beginner and Hard Expert, and Tilt is a level below Beginner, the default for players
   who steer by tilt (tilt is much harder than a pad or thumbs). Its numbers are a first guess (Beginner's mistakes and a
   little more, 7% slower) until Eric's tilt logs can tune it the way Expert was tuned. */
const AIL={tilt:{n:'Tilt',sig:1.9,tau:1.45,nose:0.5,strip:0.6,react:0.6,pace:0.93,band:0.4,sb:1},
  easy:{n:'Beginner',sig:1.7,tau:1.35,nose:0.4,strip:0.5,react:0.5,pace:1,band:0.3,sb:1},
  normal:{n:'Normal',sig:1,tau:1,nose:0,strip:0,react:0,pace:1,band:1,sb:0},
  hard:{n:'Expert',sig:0.4,tau:0.75,nose:0,strip:0,react:0,sharp:1,pace:{W:1.15,S:1.09,N:1.10},band:0.3,sb:1}};
let ailFree=AIL[store.get('hoverline.ail')]?store.get('hoverline.ail'):null;/* null: not chosen, so Tilt for tilt players, else Normal */
const ailNow=()=>ailFree||(typeof coarse!=='undefined'&&coarse&&tiltWanted()?'tilt':'normal');
const ailOf=()=>AIL[S.ail]||AIL.normal,ailPace=()=>{const p=ailOf().pace;return typeof p==='number'?p:(p[T.wk]??1)};
const ailM=r=>{const L=ailOf();if(!L.sb||!r.isAI)return 1;const g=bandRef()-r.utot;return g>0?1-0.45*clamp(g/400,0,1):1};
function aiHands(r,o,dt){if(!hands(r)||r.wreck>0){r.hs=o.steer;r.hn=0;r.hT=0;return o}
  const P=HANDS[T.wk]||HANDS.S,L=ailOf(),mk=ailM(r);let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();
  r.hs=(r.hs??o.steer)+(o.steer-(r.hs??o.steer))*Math.min(1,dt/(P.tau*L.tau));
  r.hn=(r.hn||0)-(r.hn||0)*dt/HANDS.mem+P.sigma*L.sig*mk/Math.max(0.5,r.d.turn)*Math.sqrt(dt)*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  /* (P58) a spell with the nose forgotten (Easy) */
  if(L.nose>0){r.nfT=(r.nfT||0)-dt;if(r.nfT<=0){r.nfT=2+Math.random()*3;r.nf=Math.random()<L.nose*mk}if(r.nf&&!r.air)o.pitch=0}
  o.steer=clamp(r.hs+r.hn,-1,1);
  /* a person can't hold the brake with the stick over without drifting: outside its own drifts the AI taps instead */
  if(!r.aiDm&&o.brake>0.05&&Math.abs(o.steer)>DR.thr){r.hT=(r.hT||0)+dt;const k=r.hT%(HANDS.tap+HANDS.gap);o.brake=k<HANDS.tap?1:0}else r.hT=0;
  return o}
