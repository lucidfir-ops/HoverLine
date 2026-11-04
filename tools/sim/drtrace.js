// trace one AI time trial's drifts and wall hits: node drtrace.js Q FRAME (env GAME, CX)
const H=require('./hl.js')(process.env.GAME||'./game_v3.js');
{const g=global.localStorage.getItem.bind(global.localStorage);global.localStorage.getItem=k=>/^hoverline\.ghost/.test(k)?null:g(k)}
const q=+process.argv[2],fr=process.argv[3],kinds=['W','S','N'],lens=['Q','M','L'];
(async()=>{const seed=(Math.imul(q+101,2654435761)>>>0)&0xffffff,wk=kinds[q%3],cx=(Math.floor(q/3)%2)===1,lk=lens[Math.floor(q/6)%3];
  const S=H.S;S.trial=true;H.loadTrack(seed,wk,cx,lk,null,{k:'U',d:null});const p=H.player,b0=H.getBuild(),st={speed:3,thrust:3,handling:3,shield:3,ammo:3};
  H.setBuild({...b0,frame:fr,stats:st,weapons:['missile','rockets']});p.isAI=false;H.setShip(p,{stats:st,weapons:['missile','rockets'],frame:fr},{body:0xcccccc,stripe:0xffb000});H.LOG.on=false;
  {let a=(Math.imul(q+1,0x9E3779B1)^(fr.charCodeAt(0)*7919+fr.length))>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  await H.startRace();p.isAI=true;p.hum=false;p.skill=1;p.sty=null;const T=H.getT(),W=H.getW();
  globalThis.__wallAt=(r,into)=>{if(r===p)console.log('  wall t',S.raceT.toFixed(2),'u',Math.round(H.modU(p.u)),'lat',p.lat.toFixed(2),'into',into.toFixed(3),'v',Math.round(p.v),'drift',p.dN&&p.drift?1:0,'n',(p.dKn||0).toFixed(2),'n0',(p.dN0||0).toFixed(2),'steerS',p.steerS.toFixed(2))};
  let tt=0,was=0;while(tt<300&&p.finishT==null){H.step(1/60);tt+=1/60;const on=!!(p.dN&&p.drift);if(on!==was)console.log(on?'DRIFT':'end  ','t',S.raceT.toFixed(2),'u',Math.round(H.modU(p.u)),'lat',p.lat.toFixed(2),'v',Math.round(p.v),'Cs*1000',(T.Cs[H.idxAt(p.u)]*1000).toFixed(1),on?'':'how '+p.dEnd);was=on}
  console.log('finish',p.finishT,'W',W);process.exit(0)})();
