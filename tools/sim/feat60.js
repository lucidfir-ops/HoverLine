// Prototype 60: races through the track features (drops, speed jumps, long catch jumps, reversed spires and the rest).
// node feat60.js CODES|N [OFFSET]   GAME env picks the build (default ./game.js from gen.py).
//   CODES: a comma list of track codes; N: that many random codes of the new version (or OLD=1: old codes, for a before
//   and after on the same tracks). One of each frame races, stats 3, the field's AI as in balance.js 'frames'.
// Prints one JSON line a race and a summary: finishes, wrecks, falls, clips, the speed at every jump lip by frame, and
// for speed jumps which road each racer reached (up or down).
const fs=require('fs'),H=require(__dirname+'/hl.js')();
const arg=process.argv[2]||'20',off=+(process.argv[3]||0);
let rs=4242+off*7919;const rnd=()=>{rs=(Math.imul(rs,1103515245)+12345)&0x7fffffff;return rs/0x7fffffff};
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube');
const codes=/^[0-9]+$/.test(arg)?Array.from({length:+arg},(_,q)=>{const qq=q+off,s=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,w='WSN'[qq%3],cx=(qq>>1)%3!==0,l=['','Q','L'][Math.floor(qq/6)%3];
  const ver=process.env.OLD?'':'1';return w+(cx?'X':'')+l+ver+(process.env.OLD?s.toString(16).toUpperCase():s.toString(16).toUpperCase().padStart(6,'0'))+(process.env.BIO?'-'+process.env.BIO:'')}):arg.split(',');
const q=(a,p)=>{const b=[...a].sort((x,y)=>x-y);return b.length?Math.round(b[Math.min(b.length-1,Math.floor(p*b.length))]):null};
const tot={races:0,racers:0,fin:0,wr:0,falls:0,clips:0,offs:0,nofin:0,feats:{},lips:{},up:0,down:0,upBy:{},dnBy:{},catchFalls:0,dropFalls:0,errs:0};
for(let k=0;k<codes.length;k++){const code=codes[k];const c=H.parseCode(code);if(!c){console.log('bad code',code);continue}
  let tt=0;try{H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);H.startRace()}catch(e){console.log('build error',code,e&&e.stack);tot.errs++;continue}
  const T=H.getT();T.D.band=[0,0];const R=H.racers,paint={body:0xcccccc,stripe:0xffb000};
  R.forEach((r,i)=>{const fr=FR[(i+k)%FR.length];H.setShip(r,{stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:['missile','rockets'],frame:fr},paint);r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.tag={fr};r._a=false});
  globalThis.__fall={};globalThis.__clip={};globalThis.__wr={};globalThis.__off={};
  let fallU=[];globalThis.__fallAt=(r,u)=>fallU.push(Math.round(u));
  const p=H.player;p.isAI=true;p.skill=0.94;let fin1=null;const RL={code:H.codeStr?H.codeStr():code,L:Math.round(T.L),feats:T.feats.map(f=>f.kind+(f.rev?'R':'')).join(','),lips:[],sj:[]};
  for(const f of T.feats){const kk=f.kind+(f.rev?'R':'');tot.feats[kk]=(tot.feats[kk]||0)+1}
  while(tt<600){try{H.step(1/60)}catch(e){console.log('step error',code,e&&e.stack);tot.errs++;break}tt+=1/60;
    for(const r of R){const a=r.air&&r.air!==true?r.air:null;
      if(a&&r._a!==a){r._a=a;const kind=a.kind||'jump';(tot.lips[kind]=tot.lips[kind]||{});(tot.lips[kind][r.tag.fr]=tot.lips[kind][r.tag.fr]||[]).push(r.v);RL.lips.push(Math.round(r.v))}
      if(!a)r._a=null;
      /* speed jump: which road did it reach (the split's branch it is on just past the landing) */
      if(r.brS&&r.brS.kind==='stack'&&r._sj!==r.brS.u0&&r.wreck<=0&&!r.air){r._sj=r.brS.u0;const up=r.br===r.brS.upB;RL.sj.push(up?'U':'D');up?tot.up++:tot.down++;const m=up?tot.upBy:tot.dnBy;m[r.tag.fr]=(m[r.tag.fr]||0)+1}}
    if(fin1==null&&R.some(r=>r.finishT!=null))fin1=tt;if(R.every(r=>r.finishT!=null)||fin1!=null&&tt>fin1*1.5+10)break}
  p.isAI=false;const fin=R.filter(r=>r.finishT!=null).length,S=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
  tot.races++;tot.racers+=R.length;tot.fin+=fin;if(!fin)tot.nofin++;tot.wr+=S(globalThis.__wr);tot.falls+=S(globalThis.__fall);tot.clips+=S(globalThis.__clip);tot.offs+=S(globalThis.__off);
  Object.assign(RL,{fin,wr:S(globalThis.__wr),falls:S(globalThis.__fall),clips:S(globalThis.__clip),offs:S(globalThis.__off),fallU:fallU.slice(0,12),t:Math.round(tt),best:Math.min(...R.map(r=>r.finishT??1e9)).toFixed(1)});RL.lips=RL.lips.length;
  if(!process.env.QUIET)console.log(JSON.stringify(RL))}
const lip={};for(const kind in tot.lips){lip[kind]={};for(const fr in tot.lips[kind]){const a=tot.lips[kind][fr];lip[kind][fr]=[a.length,q(a,0.1),q(a,0.5),q(a,0.9),q(a,1)]}}
console.log(JSON.stringify({races:tot.races,finRate:+(tot.fin/tot.racers).toFixed(4),noFinish:tot.nofin,wrecksPerRace:+(tot.wr/tot.races).toFixed(2),fallsPerRace:+(tot.falls/tot.races).toFixed(2),clipsPerRace:+(tot.clips/tot.races).toFixed(2),offsPerRace:+(tot.offs/tot.races).toFixed(2),errs:tot.errs,feats:tot.feats,up:tot.up,down:tot.down,upBy:tot.upBy,dnBy:tot.dnBy}));
console.log('lip speeds [n,p10,p50,p90,max] by jump kind and frame:',JSON.stringify(lip));
process.exit(0);
