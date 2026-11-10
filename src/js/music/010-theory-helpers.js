//# music/010-theory-helpers.js: music theory helpers: scales, chords, nearest tones
/* ---------- theory helpers ---------- */
function snap(p,scale){if(scale.length===12)return p;const pc=((p%12)+12)%12;let best=0,bd=99;
  for(const s of scale)for(const o of[-12,0,12]){const d=Math.abs(s+o-pc);if(d<bd||(d===bd&&s+o<pc)){bd=d;best=s+o}}return p+(best-pc)}
function degShift(p,k,scale){if(scale.length===12)return p+k*2;const pc=((p%12)+12)%12,oct=p-pc;let i=scale.indexOf(pc);
  if(i<0)return degShift(snap(p,scale),k,scale);const n=scale.length,j=i+k,o=Math.floor(j/n);return oct+o*12+scale[((j%n)+n)%n]}
function chordOf(deg,scale){const has=x=>scale.includes(((x%12)+12)%12);return[deg,deg+(has(deg+4)?4:3),deg+(has(deg+7)?7:has(deg+6)?6:7)]}
const toEvents=notes=>{const ev=[];let s=0;for(const[p,d]of notes){if(p!=null)ev.push({s,p,d});s+=d}return ev};
/* Mutations keep the phrase 64 sixteenths long and inside the theme's scale. slot = which of the three mutation slots is applying it. */
function mutate(ev,type,slot,scale,roots){
  switch(type){
    case 1:{const k=slot%2?-2:2;return ev.map(e=>({...e,p:degShift(e.p,k,scale)}))}
    case 2:{const p0=ev[0].p;return ev.map(e=>({...e,p:snap(2*p0-e.p,scale)}))}
    case 3:return ev.map(e=>({...e,s:64-e.s-e.d})).sort((a,b)=>a.s-b.s);
    case 4:return ev.map(e=>({...e,s:e.s+2})).filter(e=>e.s<64).map(e=>e.s+e.d>64?{...e,d:64-e.s}:e);
    case 5:{const out=[];for(const e of ev){if(e.d>=4)out.push({s:e.s,p:e.p,d:e.d-2},{s:e.s+e.d-2,p:degShift(e.p,1,scale),d:1},{s:e.s+e.d-1,p:e.p,d:1});else out.push(e)}return out}
    case 6:{const bar=ev.filter(e=>e.s<16),out=[];for(let k=0;k<4;k++){const t=roots[k]-roots[0];for(const e of bar)out.push({s:e.s+k*16,p:snap(e.p+t,scale),d:e.d})}return out}
    case 7:return ev.map(e=>(e.s>=16&&e.s<32)||e.s>=48?{...e,p:e.p+12}:e);
  }return ev}
/* The lead: a 4-bar motif written fresh for every tune. Call (bar 1), answer (bar 2), the call again over the third chord,
   and a cadence that lands on a chord tone and holds. Strong beats take chord tones, everything else walks the scale. */
function makeMotif(r,minor,roots,trance){
  const base=minor?SC.minor:SC.major,harm=minor?SC.harm:SC.major,cells=RHY[trance?'trance':'dnb'],pick=a=>a[Math.floor(r()*a.length)];
  const tones=b=>chordOf(roots[b],harm).map(x=>((x%12)+12)%12);
  const scaleOf=b=>{const t=tones(b);return minor&&t.includes(11)?base.map(p=>p===10?11:p):base};
  const LO=-3,HI=16;
  const near=(prev,pcs,second)=>{const c=[];for(const pc of pcs)for(const o of[-12,0,12,24]){const v=pc+o;if(v>=LO&&v<=HI)c.push(v)}
    c.sort((x,y)=>Math.abs(x-prev)-Math.abs(y-prev)||x-y);return c[second&&c.length>1?1:0]};
  const walk=(prev,sc,up)=>{let k=pick(up?[-1,1,1,2,1,-2]:[1,-1,-1,-2,-1,2]);let v=degShift(snap(prev,sc),k,sc);if(v<LO||v>HI)v=degShift(snap(prev,sc),-k,sc);return v};
  const A=pick(cells),B=r()<0.65?A:pick(cells),ev=[];
  // bar 1: the call
  let prev=near(r()<0.5?7:4,tones(0),false);const call=[];
  A.forEach(([s,d],i)=>{const strong=s===0||s===8;prev=strong?near(prev,tones(0),i>0&&r()<0.3):walk(prev,scaleOf(0),s<8);call.push([s,d,prev])});
  // bar 2: the answer keeps the call's opening, then turns towards bar 2's chord
  const ans=[];prev=call[0][2];
  B.forEach(([s,d],i)=>{if(s<8&&i<call.length&&B===A){prev=snap(call[i][2]+(r()<0.5?0:0),scaleOf(1));if(s===0)prev=near(prev,tones(1),false)}
    else prev=s===8||s===0?near(prev,tones(1),r()<0.3):walk(prev,scaleOf(1),r()<0.4);ans.push([s,d,prev])});
  // bar 3: the call again, nudged so its strong beats fit the third chord
  const third=call.map(([s,d,p])=>[s,d,s===0||s===8?near(p,tones(2),false):snap(p,scaleOf(2))]);
  // bar 4: the cadence — the call's first half, then a held note on a chord tone (the tonic or fifth if the chord has one)
  const cad=[];prev=third[0][2];for(const[s,d,p]of call)if(s<8)cad.push([s,Math.min(d,8-s),prev=s===0?near(p,tones(3),false):snap(p,scaleOf(3))]);
  const t4=tones(3),home=t4.filter(x=>x===0||x===7);const hold=r()<0.5?8:10;
  if(cad.length&&cad[cad.length-1][0]+cad[cad.length-1][1]>hold)cad[cad.length-1][1]=Math.max(1,hold-cad[cad.length-1][0]);
  cad.push([hold,16-hold,near(prev,home.length?home:t4,false)]);
  [call,ans,third,cad].forEach((bar,b)=>{for(const[s,d,p]of bar){const q=d>=4&&!tones(b).includes(((p%12)+12)%12)?near(p,tones(b),false):p;ev.push({s:b*16+s,p:q,d:Math.max(1,Math.min(d,16-s))})}});
  return ev.sort((x,y)=>x.s-y.s).filter((e,i,arr)=>i===0||e.s!==arr[i-1].s)}
