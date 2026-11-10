// Prototype 60: one race on a code; prints every racer's speed, boost, height and road every 0.25 s between two
// distances along the lap (first lap).   node trace60.js CODE U0 U1 [racer index or all]
const H=require(__dirname+'/hl.js')();
const [code,U0,U1,who]=process.argv.slice(2);const c=H.parseCode(code);H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);H.startRace();
const T=H.getT();T.D.band=[0,0];const R=H.racers,FR=Object.keys(H.FRAMES).filter(k=>k!=='cube');
R.forEach((r,i)=>{H.setShip(r,{stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:(process.env.WP||'missile,rockets').split(','),frame:FR[i%FR.length]},{body:0xcccccc,stripe:0xffb000});r.skill=0.94;r.hp=r.d.hp;r.ammo=0});
const p=H.player;p.isAI=true;let t=0,n=0;const lap=r=>Math.floor((r.utot+14)/T.L);
while(t<400){H.step(1/60);t+=1/60;n++;if(n%15)continue;
  for(const [i,r] of R.entries()){if(who!=null&&who!=='all'&&+who!==i)continue;const u=H.modU(r.u);if(lap(r)!==0||u<+U0||u>+U1)continue;
    console.log([t.toFixed(2),i,r.tag||r.d&&FR[i%FR.length],'u',Math.round(u),'v',Math.round(r.v),'b',r.selfBoost?1:r.boost>0?2:0,'hp',Math.round(r.hp),'air',r.air?(r.air===true?'T':r.air.kind||'j'):0,'h',r.h.toFixed(1),'hb',(r.hb||0).toFixed(1),'br',r.brS?r.brS.kind+r.br:'-','stk',r.stkS?r.stkB:'-','wr',r.wreck>0?1:0,'pit',r.pitch.toFixed(2),'brk',r.brk.toFixed(2),'lat',r.lat.toFixed(1),'ty',T.Tg[H.idxAt(u)].y.toFixed(3),'K',(T.K[H.idxAt(u)]*1000).toFixed(2),'Kn',(T.Kn[H.idxAt(u)]*1000).toFixed(2),'stun',(r.stun||0).toFixed(2)].join(' '))}
  if(R.every(r=>lap(r)>0))break}
process.exit(0);
