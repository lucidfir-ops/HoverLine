// node gentest.js N : builds N random track codes (every width, layout, length, editor counts, scenery) and reports throws
const H=require('./hl.js')(process.env.GAME||'./game_new.js');const N=+process.argv[2];let a=0x5eed1234;const rnd=()=>{a=(Math.imul(a,1103515245)+12345)&0x7fffffff;return a/0x7fffffff};
const W='WSN',L=['','Q','L'],B='UOFNR';let bad=0,jumps=0,fenced=0,ms=0,maxMs=0,feats={};const t00=Date.now();
for(let i=0;i<N;i++){const seed=1+Math.floor(rnd()*0xfffffe),w=W[i%3],cx=i%4!==0,l=L[Math.floor(i/3)%3];let code=w+(cx?'X':'')+l+seed.toString(16).toUpperCase();
  if(i%5===4){const n=[Math.floor(rnd()*3),Math.floor(rnd()*3),Math.floor(rnd()*2),Math.floor(rnd()*2),Math.floor(rnd()*5),Math.floor(rnd()*3),Math.floor(rnd()*3),Math.floor(rnd()*3),Math.floor(rnd()*2),Math.floor(rnd()*3),Math.floor(rnd()*2)];code=w+seed.toString(16).toUpperCase()+'-'+n.join('')}
  if(i%7===3)code+='-'+B[i%5];
  try{const c=H.parseCode(code);if(!c)throw new Error('parse '+code);const t0=Date.now();H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);const dt=Date.now()-t0;ms+=dt;maxMs=Math.max(maxMs,dt);const T=H.getT();
    for(const f of T.feats)feats[f.kind]=(feats[f.kind]||0)+1;jumps+=T.jumps.length;
    if(T.ctop){for(const j of T.jumps)if(T.ctop[H.idxAt(j.u0+j.G/2)]>0)fenced++;for(let k=0;k<T.N;k++)if(!Number.isFinite(T.ctop[k])||T.ctop[k]<0||T.ctop[k]>12)throw new Error('ctop '+k+' '+T.ctop[k])}}
  catch(e){bad++;console.log('THROW',code,String(e&&e.stack||e).split('\n').slice(0,3).join(' | '))}}
console.log(JSON.stringify({N,bad,jumps,fenced,avgMs:Math.round(ms/N),maxMs,wallS:Math.round((Date.now()-t00)/1000),feats}));process.exit(0);
