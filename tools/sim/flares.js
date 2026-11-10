// Prototype 60: how much of the homing fire do Flares block? node flares.js MODE N OFFSET [OUTFILE]
//   GAME env picks the game build (default ./game.js, from gen.py). Each racer carrying Flares ('decoy') counts, in r.fl, the
//   homing attacks that locked on it (lock), how many it answered (fire), how many it had no ammo for (dry), how many fizzled
//   on its flares (block) and how many hit it anyway (hit); the rest ran out or missed. The share blocked is block / lock.
//   MODE stress: 4 Flares carriers against 4 homing-heavy attackers (Missile, Swarm, Hunter in every pair): the worst case.
//   MODE field:  eight random pairs of the modules (as balance.js weapons mode), Flares in some of them: the usual case.
//   SECOND=cannon|turbo|scoopA picks the carriers' other module in stress mode (default cannon, the AI's biggest ammo user).
//   Blade, stats 3 (150 ammo), rubber banding off as in balance.js; the AI flies everyone.
const fs=require('fs');let src=fs.readFileSync(__dirname+'/run.js','utf8');
src=src.replace("__dirname+'/game.js'","process.env.GAME||(__dirname+'/game.js')").replace(/let report=\[\];[\s\S]*$/,`
const mode=process.argv[2]||'stress',N=+(process.argv[3]||20),off=+(process.argv[4]||0),outF=process.argv[5];
const WP=['missile','cannon','mines','shock','turbo','barrier','phase','reflector','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive'];
const SECOND=process.env.SECOND||'cannon',ATT=[['missile','hunter'],['swarm','hunter'],['missile','swarm'],['hunter','missile']];
let rs=555111+off*7919;const rnd=()=>{rs=(Math.imul(rs,1103515245)+12345)&0x7fffffff;return rs/0x7fffffff};
const kinds=['W','S','N'],lens=['Q','M','L'];
const tot={races:0,carriers:0,lock:0,fire:0,dry:0,block:0,hit:0,spent:0,wrecks:0,ammoLeft:0};
(async()=>{for(let q=0;q<N;q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,wk=kinds[qq%3],cx=(Math.floor(qq/3)%2)===1,lk=lens[Math.floor(qq/6)%3];
  H.loadTrack(seed,wk,cx,lk);H.startRace();await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
  H.getT().D.band=[0,0];const R=H.racers,paint={body:0xcccccc,stripe:0xffb000},st={speed:3,thrust:3,handling:3,shield:3,ammo:3};
  const ws=[...WP].sort(()=>rnd()-0.5);let wi=0;
  R.forEach((r,i)=>{let w;if(mode==='stress')w=i%2===0?['decoy',SECOND]:ATT[(i>>1)%4];else{w=[ws[wi%WP.length],ws[(wi+1)%WP.length]];wi+=2}
    H.setShip(r,{stats:st,weapons:w,frame:'blade'},paint);r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.fl=null});
  const p=H.player;p.isAI=true;p.skill=0.94;let tt=0,fin1=null;
  while(tt<520){H.step(1/60);tt+=1/60;if(fin1==null&&R.some(r=>r.finishT!=null))fin1=tt;if(R.every(r=>r.finishT!=null)||fin1!=null&&tt>fin1*1.5+10)break}
  p.isAI=false;tot.races++;
  for(const r of R)if(r.weapons.includes('decoy')){tot.carriers++;const f=r.fl||{};for(const k of['lock','fire','dry','block','hit','spent'])tot[k]+=f[k]||0;tot.ammoLeft+=r.ammo}
}
const pc=x=>(100*x).toFixed(1)+'%';
const out={mode,second:mode==='stress'?SECOND:undefined,flareK:H.FLARE_K,...tot,share_blocked:pc(tot.block/Math.max(1,tot.lock)),share_hit:pc(tot.hit/Math.max(1,tot.lock)),share_dry:pc(tot.dry/Math.max(1,tot.lock)),
  blocked_of_resolved:pc(tot.block/Math.max(1,tot.block+tot.hit)),locks_per_carrier_race:(tot.lock/Math.max(1,tot.carriers)).toFixed(2),ammo_per_block:(tot.spent/Math.max(1,tot.block)).toFixed(1)};
console.log(JSON.stringify(out));if(outF)fs.appendFileSync(outF,JSON.stringify(out)+'\\n');process.exit(0)})()`);eval(src);
