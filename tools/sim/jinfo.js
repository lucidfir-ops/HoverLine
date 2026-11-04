// Jump info for track codes: node jinfo.js CODE...
const load=require('./hl.js');const H=load(process.env.GAME||'./game_base.js');
for(const code of process.argv.slice(2)){const c=H.parseCode(code);H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);const T=H.getT(),W=H.getW();
  console.log(code,'L',Math.round(T.L),'W',W,'ds',T.ds,'jumps',T.jumps.length);
  for(const j of T.jumps){const cs=[];for(let d=-60;d<=j.G+200;d+=20)cs.push((T.Cs[H.idxAt(j.u0+d)]*1000).toFixed(1));
    console.log(' u0',j.u0.toFixed(0),'u1',j.u1.toFixed(0),'G',j.G.toFixed(1),'fence',j.fence,'wallH',T.wallH[H.idxAt(j.u1+10)].toFixed(2),'Cs*1000 from -60 by 20:',cs.join(' '))}}
