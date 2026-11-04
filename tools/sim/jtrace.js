// trace jump airs on one jump: node jtrace.js CODE JUMPK REPS  (PILOT=eric) -> prints steps for passes that escape
const fs=require('fs');const H=require('./hl.js')(process.env.GAME||'./game_new.js');
const [code,JK,REPS]=[process.argv[2],+process.argv[3],+process.argv[4]];const PILOT=process.env.PILOT||'ai';
if(PILOT==='eric'){const {makeEric}=require('./eric_pilot.js'),EP=JSON.parse(fs.readFileSync(__dirname+'/eric_params.json','utf8')),pin=makeEric(H,EP);
  globalThis.__pin=(r,i,dt)=>{r.hum=true;if(!r.sty)r.sty={boost:1,fire:1,dive:1,up:1,longP:EP.longP};return pin(r,i,dt)}}
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube');let shown=0;
(async()=>{for(let rep=0;rep<REPS&&shown<2;rep++){const c=H.parseCode(code);H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);await H.startRace();const T=H.getT(),R=H.racers,J=T.jumps[JK];
  R.forEach((r,i)=>{H.setShip(r,{stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:['missile','rockets'],frame:FR[(i+rep)%8]},{body:0xcccccc,stripe:0xffb000});r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.isAI=true;r.hum=PILOT!=='ai';r._tr=null});
  let tt=0;while(tt<300&&shown<2){H.step(1/60);tt+=1/60;for(const r of R){if(r.air===J){if(!r._tr)r._tr=[];const x=H.modU(H.modU(r.u)-J.u0),q=H.idxAt(r.u);r._tr.push([Math.round(x),+r.lat.toFixed(2),+(r.h-H.HOVER).toFixed(2),+(T.ctop[q]).toFixed(1),+T.wallH[q].toFixed(1),+(r.yaw).toFixed(3),Math.round(r.v),r.offT?1:0,r.jOut?1:0])}
      else if(r._tr){const esc=r._tr.some(s=>Math.abs(s[1])>H.getW()/2-0.4);if(esc){console.log(r.build.frame,'x lat h ctop wallH yaw v offT jOut');for(const s of r._tr)console.log(' ',s.join(' '));shown++}r._tr=null}}}}process.exit(0)})();
