/* The Eric pilot (Prototype 39): a simulated pilot that flies like Eric does in his Steam Deck race logs.
   makeEric(H, P) returns a function pin(r, ai, dt) -> inputs for a racer r with r.hum set (a person's physics, see gen.py).
   It is fitted from logs by fit_eric.js into eric_params.json (P). Its parts, in the order they run each physics step:

   1. Line.     Where across the road he wants to be: a fraction of the half width ("inside" positive) looked up from the
                curvature d m ahead (P.line[width]: |c| bins -> fraction). Eric runs wide in tight corners, so the table
                goes negative there. Splits and the run up to them use the AI's route line (and his long/short share).
                On a share of recharge-strip passes (P.strip.hp, P.strip.ammo) he lines up on the strip instead.
   2. Steering. The AI's own steering law towards that point (heading error plus the curvature under the ship; he aims
                over P.steer[width].look of the AI's look distance, so he corrects sideways errors harder), then a
                person's hands: a lag (tau s) and a wandering error (sigma, an Ornstein-Uhlenbeck drift with a 0.7 s memory),
                per width (P.steer[width]). These two are what set how often he touches the walls.
   3. Nose.     A situation (air, crest, corner, tight corner, uphill, downhill, straight) picks nose up / level / down
                with his odds for that situation and width (P.pitch), held for spells (P.pitchSpell s).
   4. Brake.    Rare taps in tight corners (P.brake: taps a second in a tight corner).
   5. Boost.    Held boost in spells (P.boostSpell s), with his odds by the curvature ahead and by shield left (P.boost).
   6. Modules.  While a slot can fire, it fires at random at his rate for that module, width and ammo in hand
                (P.fire[module].perS[width][ammo bin], shots a second; Turbo only with a straight ahead), times his rate in
                each place (P.firePlace) and cal.fire. A module he never carried uses the AI's choice of moment, thinned
                to P.fireOther. The HUD warns of incoming shots: Phase and Barrier also answer a share of those warnings
                (P.react, calibrated so he takes as much weapon damage as Eric; a mild reaction shows in his logs).
   7. Drifter.  In a corner he taps the brake to start a drift (P.drift.rate taps a second of corner, above P.drift.c),
                holds it for a time drawn from his drift lengths (log-normal P.drift.mu, P.drift.sd) and lets go.
   8. Orb.      Rides the wall on purpose: in a share of corners and straights (P.ride.corner, P.ride.straight), held
                for spells, it aims at the wall (the outside one in a corner) instead of the line.
   Everything random goes through rnd (pass a seeded one for repeatable runs). */
const sitOf=(air,knMin,c30,c50,gy12)=>{const c=Math.max(Math.abs(c30),Math.abs(c50));
  return air?'air':knMin<-0.0011?'crest':c>0.006?'tight':c>0.0035?'corner':gy12>0.03?'uphill':gy12<-0.03?'downhill':'straight'};
const SITS=['air','crest','tight','corner','uphill','downhill','straight'];
const lerpTab=(xs,ys,x)=>{if(x<=xs[0])return ys[0];for(let i=1;i<xs.length;i++)if(x<=xs[i]){const a=(x-xs[i-1])/(xs[i]-xs[i-1]);return ys[i-1]+(ys[i]-ys[i-1])*a}return ys[ys.length-1]};
function makeEric(H,P,rnd=Math.random){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const expo=m=>-Math.log(1-rnd())*m;
  return function pin(r,ai,dt){
    if(r.finishT!=null||r.wreck>0)return ai;
    const T=H.getT(),W=H.getW(),S=H.S,wk=T.wk||'S',idx=H.idxAt,uu=H.modU(r.u),v=r.v,fr=r.build?r.build.frame:'blade';
    const E=r._e||(r._e={s:0,n:0,pe:0,pt:0,ps:null,bo:false,bt:0,ft:[null,null],th:[false,false],brT:0,dr:null,drT:0,ride:null,rideT:0,sit:null,bias:gauss()*(P.biasSd||0)});
    const st=P.steer[wk]||P.steer.S,line=P.line[wk]||P.line.S;
    const cAt=d=>T.Cs[idx(uu+d)];
    const c30=cAt(30),c50=cAt(50);
    let knMin=0;for(let d=0;d<=Math.max(20,v*0.5);d+=4)knMin=Math.min(knMin,T.Kn[idx(uu+d)]);
    const sit=sitOf(r.air,knMin,c30,c50,T.Tg[idx(uu+12)].y);
    /* 1. the line */
    const f=H.surf(uu,r.lat,r),lo=f.lo,hi=f.hi,lim=(hi-lo)/2-1.35,mid=(hi+lo)/2;
    let nearSplit=!!f.sp;if(!nearSplit)for(const SP of T.splits){const d=H.modU(SP.u0-uu);if(d<260||(uu>=SP.u0&&uu<=SP.u1)){nearSplit=true;break}}
    const cl=cAt(line.d),xin=lerpTab(line.c,line.x,Math.abs(cl));
    let target=mid-Math.sign(cl)*xin*lim+E.bias*lim;
    /* recharge strips: on a share of passes (P.strip, whatever the bars say) he lines up on the strip like the AI does */
    if(P.strip&&!nearSplit)for(const z of T.zones){if(z.laneF||z.sp)continue;const ahead=H.modU(z.u0-uu),inside=uu>=z.u0&&uu<=z.u1;if(!inside&&ahead>80)continue;
      if(E.zone!==z){E.zone=z;E.zSeek=rnd()<(P.strip[z.kind]||0);E.zSide=z.side||(r.lat>=0?1:-1)}
      if(E.zSeek)target=z.lane!=null?z.lane:E.zSide*(z.edge+W/2-0.55)/2;break}
    /* 8. the Orb rides the wall */
    const rideP=P.ride&&r.d.wallK<0.5?P.ride:null;
    if(rideP&&!nearSplit){E.rideT-=dt;const inC=sit==='corner'||sit==='tight';
      if(E.rideT<=0||E.rideC!==inC){E.rideC=inC;E.rideT=rideP.spell*(0.5+rnd());E.ride=rnd()<(inC?rideP.corner:rideP.straight)?(inC?Math.sign(c30):(r.lat>=mid?1:-1)):null}
      if(E.ride)target=mid+E.ride*(lim+0.6)}
    target=clamp(target,lo+0.4,hi-0.4);
    /* 2. steering: the AI's law towards the target, then lag and wander */
    const look=Math.max(22,v*0.75),desired=f.sp?null:-Math.atan2(target-r.lat,look*(st.look||1));
    const turn=(1.85-0.55*(v/H.VMAX))*r.d.turn*(1+0.8*Math.max(0,r.pitch)-0.15*Math.max(0,-r.pitch));
    let cmd=nearSplit||desired==null?ai.steer:(3.2*(r.yaw-desired)-T.Cs[idx(r.u)]*v)/turn;
    cmd=clamp(cmd,-1,1);
    E.s+=(cmd-E.s)*Math.min(1,dt/st.tau);E.n+=-E.n*dt/0.7+st.sigma*Math.sqrt(dt)*gauss();
    let steer=clamp(E.s+E.n,-1,1);
    /* 3. the nose */
    E.pt-=dt;if(sit!==E.sit||E.pt<=0){E.sit=sit;E.pt=P.pitchSpell*(0.5+rnd());const pp=(P.pitch[wk]||P.pitch.S)[sit]||{up:0,down:0},x=rnd();E.pe=x<pp.up?1:x<pp.up+pp.down?-1:0}
    let pitch=E.pe,brake=0;
    /* 4. brake taps */
    if(E.brT>0){E.brT-=dt;brake=1}else if(sit==='tight'&&!r.d.aiDrift&&rnd()<dt*(P.brake[wk]||0)){E.brT=0.25;brake=1}
    /* 5. held boost */
    E.bt-=dt;if(E.bt<=0){E.bt=P.boostSpell*(0.5+rnd());const B=P.boost,cb=Math.max(Math.abs(cAt(50)),Math.abs(cAt(100))),ci=B.cEdges.findIndex(e=>cb<e),hf=r.hp/r.d.hp,hi2=B.hEdges.findIndex(e=>hf<e);
      const pc=(B.c[wk]||B.c.S)[ci<0?B.cEdges.length:ci],ph=B.h[hi2<0?B.hEdges.length:hi2];E.bo=rnd()<clamp(pc*ph,0,1)}
    const boost=E.bo&&!r.air;
    /* 6. modules */
    const fire=[false,false],hold=[false,false],place=Math.max(1,Math.min(8,(r._place||4)));
    for(let k=0;k<2;k++){const w=r.weapons[k];if(!w||!H.WDEF[w]||H.WDEF[w].passive)continue;const F=P.fire[w];
      if(!F){/* never flown: the AI picks the moment, thinned to his overall rate */const want=w==='cannon'?ai.hold[k]:ai.fire[k];if(want&&rnd()<P.fireOther*(P.firePlace[place-1]||1))(w==='cannon'?hold:fire)[k]=true;continue}
      if(!H.canFire(r,k))continue;
      if(w==='turbo'&&Math.max(Math.abs(cAt(40)),Math.abs(cAt(80)))>P.turboC)continue;
      /* the threat warning: a share of the shots the HUD warns about get an answer from Phase or Barrier (once each) */
      if((w==='phase'||w==='barrier')&&P.react){const th=H.aiWants(r,w);if(th&&!E.th[k]&&rnd()<P.react){fire[k]=true;E.th[k]=th;continue}E.th[k]=th}
      const af=r.ammo/r.d.ammo,bi=F.ammoEdges.findIndex(e=>af<e),lam=(F.perS[wk]||F.perS.S)[bi<0?F.ammoEdges.length:bi]*((P.cal&&P.cal.fire)||1)*(P.firePlace[place-1]||1);
      if(rnd()<1-Math.exp(-lam*dt))(w==='cannon'?hold:fire)[k]=true}
    /* 7. the Drifter's drift */
    if(r.d.aiDrift&&P.drift){const D=P.drift,want=-Math.sign(c30)||1;
      if(r.drift){E.drT-=dt;if(Math.sign(steer)!==r.drift||Math.abs(steer)<0.3)steer=r.drift*Math.max(0.3,Math.abs(steer));if(E.drT<=0){steer=0;E.dr=null}brake=0}
      else if(E.dr){E.dr.t-=dt;steer=want*Math.max(0.5,Math.abs(steer));brake=E.dr.t>0.05?1:0;if(E.dr.t<=0)E.dr=null}
      else if(!r.air&&v>40&&Math.max(Math.abs(c30),Math.abs(cAt(0)))>D.c&&rnd()<dt*D.rate){E.dr={t:0.1};E.drT=Math.exp(D.mu+D.sd*gauss());steer=want*Math.max(0.5,Math.abs(steer));brake=0}}
    return{steer,brake,pitch,boost,fire,hold}}}
module.exports={makeEric,sitOf,SITS,lerpTab};
