// Jump test: node jtest.js OUT.jsonl REPS CODE... (env GAME, PILOT=ai|eric|human, FR=frame for all)
// One line per jump pass: code, rep, racer frame, jump k, lip speed, max height, lateral range, where it crossed the edge,
// outcome (land / fall / gapfall / off / wreck / clip).
const fs=require('fs'),path=require('path');const H=require('./hl.js')(process.env.GAME||'./game_base.js');
const out=process.argv[2],REPS=+process.argv[3],codes=process.argv.slice(4);
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube'),PILOT=process.env.PILOT||'ai';
if(PILOT==='eric'){const {makeEric}=require('./eric_pilot.js'),EP=JSON.parse(fs.readFileSync(__dirname+'/eric_params.json','utf8')),pin=makeEric(H,EP);
  globalThis.__pin=(r,i,dt)=>{r.hum=true;if(!r.sty)r.sty={boost:1,fire:1,dive:1,up:1,longP:EP.longP};return pin(r,i,dt)}}
const r2=x=>Math.round(x*100)/100;const tot={pass:0,fall:0,gap:0,off:0,clip:0,wall:0};
(async()=>{for(const code of codes)for(let rep=0;rep<REPS;rep++){
  const c=H.parseCode(code);H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);await H.startRace();
  const T=H.getT(),R=H.racers,HOV=H.HOVER;
  R.forEach((r,i)=>{const fr=process.env.FR||FR[(i+rep)%8];H.setShip(r,{stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:['missile','rockets'],frame:fr},{body:0xcccccc,stripe:0xffb000});r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.isAI=true;r.hum=PILOT!=='ai';r._jt=null});
  const S=H.S;let tt=0,fin1=null;const lines=[];
  globalThis.__fallAt=(r,uu,jump,off)=>{if(r._jt){r._jt.out=off?'off':jump?'gapfall':'fall';r._jt.fu=Math.round(uu)}};
  globalThis.__clipAt=(r,uu)=>{if(r._jt)r._jt.out='clip'};
  globalThis.__wallAt=(r,into)=>{if(r._jt&&r.air&&r.air!==true){r._jt.wall=(r._jt.wall||0)+1;if(!r._jt.wh)r._jt.wh={x:Math.round(H.modU(r.u-r.air.u0)),h:r2(r.h-HOV),into:r2(into)}}};
  while(tt<520){H.step(1/60);tt+=1/60;if(fin1==null&&R.some(r=>r.finishT!=null))fin1=tt;
    for(const r of R){const j=r.air&&r.air!==true?r.air:null;
      if(j&&!r._jt){r._jt={k:T.jumps.indexOf(j),fr:r.build.frame,v:Math.round(r.v),hmax:0,lmin:r.lat,lmax:r.lat,esc:null,fence:!!j.fence,pitch:r2(r.pitch),steer:r2(r.steerS)}}
      if(r._jt){const J=r._jt;if(j){const x=H.modU(H.modU(r.u)-j.u0),f=H.surf(H.modU(r.u),r.lat,r);J.hmax=Math.max(J.hmax,r.h-HOV);J.lmin=Math.min(J.lmin,r.lat);J.lmax=Math.max(J.lmax,r.lat);J.xmax=Math.round(x);
          if(!J.esc&&(r.lat<f.lo+0.4||r.lat>f.hi-0.4))J.esc={x:Math.round(x),h:r2(r.h-HOV),lat:r2(r.lat),G:Math.round(j.G)}}
        if(!j){if(!J.out)J.out=r.wreck>0?'wreck':'land';lines.push({code,rep,...J,hmax:r2(J.hmax),lmin:r2(J.lmin),lmax:r2(J.lmax)});tot.pass++;if(J.out!=='land'&&J.out!=='wreck'){tot.fall++;tot[J.out==='gapfall'?'gap':J.out==='off'?'off':'clip']=(tot[J.out==='gapfall'?'gap':J.out==='off'?'off':'clip']||0)+1}r._jt=null}}}
    if(R.every(r=>r.finishT!=null)||fin1!=null&&tt>fin1*1.5+10)break}
  fs.appendFileSync(out,lines.map(l=>JSON.stringify(l)).join('\n')+(lines.length?'\n':''))}
  console.log(JSON.stringify(tot));process.exit(0)})();
