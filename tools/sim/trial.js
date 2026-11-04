// AI time trials: node trial.js OUT.jsonl N OFFSET   one AI alone (no field, no ghost) in every frame on balance.js tracks
// env GAME; DRIFT=0 turns the AI's drift off (each frame's style stays), AIX=0 the whole Prototype 45 AI (P44's);
// FRAMES=a,b limits the frames; CX=1 complex only. Each line: track, frame, finish time, laps, walls, drifts.
const fs=require('fs');const H=require('./hl.js')(process.env.GAME||'./game_new.js');
{const g=global.localStorage.getItem.bind(global.localStorage);global.localStorage.getItem=k=>/^hoverline\.ghost/.test(k)?null:g(k)}
const out=process.argv[2],N=+process.argv[3],OFF=+process.argv[4];const FR=(process.env.FRAMES||Object.keys(H.FRAMES).filter(k=>k!=='cube').join(',')).split(',');
if(H.AIX){if(process.env.AIX==='0')H.AIX.on=false;if(process.env.DRIFT==='0')for(const k in H.AIX.F)H.AIX.F[k].dr=0;if(process.env.AIXV)for(const kv of process.env.AIXV.split(';')){const[k,v]=kv.split('=');const[f,q]=k.split('.');H.AIX.F[f][q]=+v}}
const kinds=['W','S','N'],lens=['Q','M','L'],r2=x=>Math.round(x*100)/100;
(async()=>{for(let q=OFF;q<OFF+N;q++){const seed=(Math.imul(q+101,2654435761)>>>0)&0xffffff,wk=kinds[q%3],cx=process.env.CX==='1'?true:(Math.floor(q/3)%2)===1,lk=lens[Math.floor(q/6)%3];
  for(const fr of FR){const S=H.S;S.trial=true;S.train=null;S.car=null;H.loadTrack(seed,wk,cx,lk,null,{k:'U',d:null});
    const p=H.player,b0=H.getBuild();const st={speed:3,thrust:3,handling:3,shield:3,ammo:3};H.setBuild({...b0,frame:fr,stats:st,weapons:['missile','rockets']});
    p.isAI=false;H.setShip(p,{stats:st,weapons:['missile','rockets'],frame:fr},{body:0xcccccc,stripe:0xffb000});H.LOG.on=false;{let a=(Math.imul(q+1,0x9E3779B1)^(fr.charCodeAt(0)*7919+fr.length))>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}await H.startRace();H.S._pf=0;
    p.isAI=true;p.hum=false;p.skill=1;p.sty=null;const T=H.getT();globalThis.__wall={};
    let tt=0,dr=0,drT=0,was=0,brT=0;const t0=Date.now();
    while(tt<400&&p.finishT==null){H.step(1/60);tt+=1/60;const on=!!(p.dN&&p.drift);if(on&&!was)dr++;if(on)drT+=1/60;was=on;if(!on&&p.brk>0.05)brT+=1/60}
    fs.appendFileSync(out,JSON.stringify({q,code:H.code(),wk,cx,lk,L:Math.round(T.L),fr,ft:p.finishT!=null?r2(p.finishT):null,laps:(p.laps||[]).map(r2),walls:globalThis.__wall[p.name]||0,dr,drT:r2(drT),brT:r2(brT),ms:Date.now()-t0})+'\n');p.isAI=false}}
  process.exit(0)})();
