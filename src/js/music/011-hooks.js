//# music/011-hooks.js: legacy: hooks drawn from a CC0 melody space (old T codes)
/* ---------- hooks from the All the Music space ----------
   All the Music (Damien Riehl and Noah Rubin) wrote out every 12-note melody on an 8-note scale, 8^12 = 68,719,476,736 of
   them, and dedicated them to the public domain (CC0). A new tune draws 500 of those from its seed, scores each for
   catchiness (mostly steps, a leap that turns back, a small range, a call that ends open and a response that comes
   home, shared openings, strong beats on chord tones) and builds its hook from the best. Notes 1-6 are the call and
   7-12 the response; in the arrangement the response is often played by a second instrument (call and response). */
const HOOK_RHY={
 dnb:[[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,2],[2,2],[4,4],[8,2],[10,3],[13,3]],[[0,4],[4,2],[6,2],[8,2],[10,4],[14,2]],[[0,3],[3,1],[4,4],[8,3],[11,1],[12,4]]],
 brk:[[[0,2],[2,1],[3,3],[6,2],[8,2],[10,6]],[[0,1],[1,2],[3,3],[8,1],[9,2],[11,5]],[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]]],
 metal:[[[0,2],[2,2],[4,4],[8,2],[10,2],[12,4]],[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,4],[4,4],[8,2],[10,2],[12,2],[14,2]]],
 trance:[[[0,2],[2,2],[4,2],[6,2],[8,4],[12,4]],[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,2],[3,2],[6,2],[8,2],[10,2],[12,4]],[[0,4],[4,2],[6,2],[8,4],[12,2],[14,2]]],
 psy:[[[0,1],[2,1],[3,1],[6,2],[8,2],[11,3]],[[0,2],[3,1],[4,2],[8,1],[10,2],[12,2]],[[0,1],[1,1],[3,2],[6,1],[8,3],[14,2]]]};
const HOOK_SPARSE={dnb:[[[0,6],[6,2],[8,8]],[[0,3],[3,5],[8,4],[12,4]],[[0,4],[4,4],[8,8]],[[0,2],[2,6],[8,6],[14,2]]],
  trance:[[[0,4],[4,4],[8,4],[12,4]],[[0,6],[6,6],[12,4]],[[0,3],[3,3],[6,10]],[[0,8],[8,4],[12,4]]]};HOOK_SPARSE.brk=HOOK_SPARSE.dnb;
function makeHook(r,scale,hscale,roots,fk,sparse){
  const cells=(sparse&&HOOK_SPARSE[fk])||HOOK_RHY[fk]||HOOK_RHY.dnb,pick=a=>a[Math.floor(r()*a.length)],A=pick(cells),B=r()<0.6?A:pick(cells);
  const tones=b=>chordOf(roots[b],hscale).map(x=>((x%12)+12)%12);
  const scaleOf=b=>{const t=tones(b);return t.includes(11)&&scale.includes(10)?scale.map(p=>p===10?11:p):scale};
  const pc=(d,sc)=>sc[d%7]+(d>=7?12:0);
  const STEP=[-2,-1,-1,1,1,2,0,3,-3,4,-4];
  const cand=()=>{const d=[Math.floor(r()*8)];for(let i=1;i<12;i++){const st=STEP[Math.floor(r()*STEP.length)];let v=d[i-1]+st;if(v<0||v>7)v=d[i-1]-st;d.push(Math.max(0,Math.min(7,v)))}return d};
  const score=d=>{let s=0;
    for(let i=1;i<12;i++){if(i===6)continue;const a=d[i]-d[i-1],A=Math.abs(a);s+=A===0?0.2:A<=2?1:A<=4?0:-2.5;
      if(A>=3&&i<11&&i!==5){const b=d[i+1]-d[i];if(Math.sign(b)===-Math.sign(a)&&Math.abs(b)<=2)s+=1.5}}
    const lo=Math.min(...d),hi=Math.max(...d);s+=hi-lo<=4?3:hi-lo<=5?1.5:hi-lo>6?-2.5:0;
    if([1,3,4,6].includes(d[5]))s+=2;if(d[11]===0||d[11]===7)s+=3;else if(d[11]===4)s+=1;if([0,2,4,7].includes(d[0]))s+=1;
    let k=0;while(k<4&&d[k]===d[6+k])k++;s+=[0,1.5,3,4,3][k];if(d.slice(0,6).join()===d.slice(6).join())s-=4;
    if(d[1]-d[0]===d[4]-d[3]&&d[2]-d[1]===d[5]-d[4])s+=2;
    if(d.filter(x=>x===hi).length===1&&d.indexOf(hi)>0)s+=1;
    for(const[bar,cell,off]of[[0,A,0],[1,B,6]])cell.forEach(([st],j)=>{if(st%8===0)s+=tones(bar).includes(pc(d[off+j],scaleOf(bar))%12)?1.5:-1.2});
    let run=1;for(let i=2;i<12;i++){if(d[i]!==d[i-1]&&Math.sign(d[i]-d[i-1])===Math.sign(d[i-1]-d[i-2])){if(++run>4)s-=0.8}else run=1}
    return s};
  let d=null,bs=-1e9;for(let n=0;n<500;n++){const c=cand(),sc=score(c);if(sc>bs){bs=sc;d=c}}
  const ev=[],open=d.slice(6);if(open[5]===0||open[5]===7)open[5]=open[4]>=4?4:2;
  const near=(p,b)=>{let q=p,bd=99;for(const t of tones(b))for(const o of[-12,0,12,24]){const x=t+o;if(Math.abs(x-p)<bd){bd=Math.abs(x-p);q=x}}return q};
  const put=(bar,cell,degs,v,hold)=>cell.forEach(([st,len],j)=>{let p=pc(degs[j],scaleOf(bar));if(bar===2&&st%8===0&&!tones(bar).includes(p%12))p=near(p,bar);
    ev.push({s:bar*16+st,p,d:j===cell.length-1&&hold?16-st:Math.min(len,16-st),v})});
  put(0,A,d.slice(0,6),0,false);put(1,B,open,1,false);put(2,A,d.slice(0,6),0,false);put(3,B,d.slice(6),1,true);
  return{ev:ev.sort((a,b)=>a.s-b.s),idx:d.reduce((a,x)=>a*8+x,0)}}
