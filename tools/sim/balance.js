// Balance study. node balance.js MODE N OFFSET OUTFILE   (GAME env picks the game build, default ./game.js; VARIANT env tweaks frames, e.g. "orb.wallK=0.25;tether.hp=0.78")
// MODE frames: equal stats and weapons, frames rotate through the grid.
// MODE stats:  blade, fixed weapons, every racer a random legal build (15 points, 1-5 each).
// MODE weapons: blade, stats 3s, every racer a random pair of the 17 active items.
// MODE full:   random frame, random build and random pair for everyone.
// MODE hauler: one fighter Hauler (ammo 5) against equal blades, to see how a fighting build races.
const fs=require('fs');let src=fs.readFileSync(__dirname+'/run.js','utf8');
src=src.replace("__dirname+'/game.js'","process.env.GAME||(__dirname+'/game.js')").replace(/let report=\[\];[\s\S]*$/,`
const mode=process.argv[2]||'full',N=+(process.argv[3]||50),off=+(process.argv[4]||0),outF=process.argv[5]||'/dev/stdout';
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube'),WP=['missile','cannon','mines','shock','turbo','barrier','phase','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive'];
const ST=['speed','thrust','handling','shield','ammo'];
if(process.env.VARIANT){for(const kv of process.env.VARIANT.split(';')){const[k,v]=kv.split('=');const[f,p]=k.split('.');const F=H.FRAMES[f];if(p in F.m)F.m[p]=+v;else F[p]=+v}}
let rs=987654+off*7919;const rnd=()=>{rs=(Math.imul(rs,1103515245)+12345)&0x7fffffff;return rs/0x7fffffff};
const build=()=>{let st;for(;;){st={};let left=15;for(const k of ST)st[k]=1;left-=5;const order=[...ST];while(left>0){const k=order[Math.floor(rnd()*5)];if(st[k]<5){st[k]++;left--}}return st}};
const out=[];const kinds=['W','S','N'],lens=['Q','M','L'];
(async()=>{for(let q=0;q<N;q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,wk=kinds[qq%3],cx=(Math.floor(qq/3)%2)===1,lk=lens[Math.floor(qq/6)%3];
  H.loadTrack(seed,wk,cx,lk);H.startRace();await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
  const T=H.getT();T.D.band=[0,0];let tw=0;for(let i=0;i<T.N;i++)tw+=Math.abs(T.Cs[i])*T.ds;
  const R=H.racers,paint={body:0xcccccc,stripe:0xffb000};const ws=[...WP].sort(()=>rnd()-0.5);let wi=0;
  R.forEach((r,i)=>{let fr='blade',st={speed:3,thrust:3,handling:3,shield:3,ammo:3},w=['missile','rockets'];
    if(mode==='frames')fr=FR[(i+qq)%FR.length];
    if(mode==='stats')st=build();
    if(mode==='weapons'){w=[ws[wi%17],ws[(wi+1)%17]];wi+=2}
    if(mode==='full'){fr=FR[Math.floor(rnd()*FR.length)];st=build();const a=Math.floor(rnd()*17);let b=Math.floor(rnd()*16);if(b>=a)b++;w=[WP[a],WP[b]]}
    if(mode==='hauler'&&i===((qq*3)%8)){fr='hauler';st={speed:2,thrust:3,handling:3,shield:3,ammo:4};w=['missile','rockets']}
    H.setShip(r,{stats:st,weapons:w,frame:fr},paint);r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.tag={fr,st,w}});
  const p=H.player;p.isAI=true;p.skill=0.94;let t=0;
  let fin1=null;while(t<520){H.step(1/60);t+=1/60;if(fin1==null&&H.racers.some(r=>r.finishT!=null))fin1=t;if(H.racers.every(r=>r.finishT!=null)||fin1!=null&&t>fin1*1.5+10)break}
  p.isAI=false;const order=[...H.racers].sort((a,b)=>(a.finishT??1e9)-(b.finishT??1e9)||b.utot-a.utot);const fts=order.filter(r=>r.finishT!=null).map(r=>r.finishT).sort((a,b)=>a-b),med=fts[Math.floor(fts.length/2)]||1;
  const lines=[];order.forEach((r,k)=>lines.push(JSON.stringify({race:qq,mode,wk,cx,lk,L:Math.round(T.L),tw:+tw.toFixed(2),feats:T.feats.length,splits:T.splits.length,fr:r.tag.fr,st:r.tag.st,w:r.tag.w,place:k+1,ft:r.finishT!=null?+r.finishT.toFixed(2):null,fte:r.finishT!=null?+r.finishT.toFixed(2):+(t+(3*T.L-r.utot)/Math.max(r.v,60)).toFixed(2),rel:r.finishT!=null?+(r.finishT/med).toFixed(4):null,wr:r.stat?r.stat.wrecks:null,dmg:r.stat?Math.round(r.stat.dmg):null,given:r.stat?r.stat.given:null})));fs.appendFileSync(outF,lines.join('\\n')+'\\n')}
  process.exit(0)})()`);eval(src);
