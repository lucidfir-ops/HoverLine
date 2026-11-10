// Prototype 60: build track codes and print their features (kind, where, flags), jumps, splits and any road faults.
// node probe60.js CODE [CODE...]    (GAME env: the build, default ./game.js)
const H=require(__dirname+'/hl.js')();
for(const code of process.argv.slice(2)){const c=H.parseCode(code);if(!c){console.log('bad code',code);continue}
  const t0=Date.now();H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);const T=H.getT(),ms=Date.now()-t0;
  console.log(H.codeStr(),'L',Math.round(T.L),'ms',ms,'dropped',JSON.stringify(T.dropped||{}));
  for(const f of T.feats)console.log('  feat',f.kind,Math.round(f.u0),Math.round(f.u1),Object.keys(f).filter(k=>!['kind','u0','u1'].includes(k)&&f[k]!=null&&typeof f[k]!=='object').map(k=>k+'='+(typeof f[k]==='number'?Math.round(f[k]*100)/100:f[k])).join(' '));
  for(const j of T.jumps)console.log('  jump',j.kind||'jump',Math.round(j.u0),'G',Math.round(j.G),'lipH',Math.round(j.lipH*10)/10,'slope',Math.round(j.slope*1000)/1000,j.sp?'in split '+j.sp.kind:'',j.hu?'hu '+j.hu.toFixed(1):'');
  for(const S of T.splits)console.log('  split',S.kind,Math.round(S.u0),Math.round(S.u1),'branches',S.b.length);
  for(const d of T.drops||[])console.log('  mag',Math.round(d.u0),Math.round(d.u1))}
process.exit(0);
