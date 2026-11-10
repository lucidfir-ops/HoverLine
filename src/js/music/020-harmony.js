//# music/020-harmony.js: chord qualities, diatonic sevenths and ninths, voicings
/* ---- harmony (Prototype 45): chord qualities, diatonic sevenths and ninths, and voicings ----
   Intervals above the root. A progression entry is [root, quality]; with only roots the chords are stacked in thirds
   from the template's mode (cq 3 = triads as before, 7 = sevenths, 9 = ninths). Pads, stabs and keys voice the
   upper tones (rootless for ninths and elevenths: the bass has the root) between their own low and high notes, each
   chord as close as it can get to the one before, and never below D3 so the sub stays alone and mono. */
const CQ={'':[0,4,7],m:[0,3,7],'5':[0,7,12],sus2:[0,2,7],sus4:[0,5,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],'6':[0,4,7,9],m6:[0,3,7,9],add9:[0,4,7,14],madd9:[0,3,7,14],
  '9':[0,4,7,10,14],m9:[0,3,7,10,14],maj9:[0,4,7,11,14],m11:[0,3,7,10,14,17],'11':[0,7,10,14,17],'maj7#11':[0,4,7,11,18],'7b9':[0,4,7,10,13],'7#9#5':[0,4,8,10,15],
  m7b5:[0,3,6,10],dim:[0,3,6],'7sus4':[0,5,7,10],'13':[0,4,10,14,21],'m(maj7)':[0,3,7,11]};
function tDia(deg,sc,n){const pc=((deg%12)+12)%12,i0=sc.indexOf(pc),L=sc.length;if(i0<0||L!==7)return null;const o=[];
  for(let k=0;k<n;k++){const j=i0+2*k,v=sc[j%L]+12*Math.floor(j/L)-pc;o.push(v)}return o}
/* Prototype 50: the octaves tried start on a C. Before, they started on lo, so every voiced chord came out transposed up
   by lo's place in the octave (a fifth for an instrument whose range starts on G): chords in the wrong key under the
   melody and the bass, the "chaotic piano" Eric heard. */
function tVoiceLead(root,ivs,key,lo,hi,prev,rootless){const pcs=[];const add=x=>{const p=((key+root+x)%12+12)%12;if(!pcs.includes(p))pcs.push(p)};
  const dropR=rootless&&ivs.length>=5,drop5=ivs.length>=6;ivs.forEach((x,i)=>{if(i===0&&dropR)return;if(drop5&&x===7)return;add(x)});
  if(pcs.length<3)add(0);const n=pcs.length,cands=[];
  for(let r=0;r<n;r++){const ord=[];for(let k=0;k<n;k++)ord.push(pcs[(r+k)%n]);for(let base=Math.floor(lo/12)*12-12;base<=hi;base+=12){let v=[],last=-99;for(const p of ord){let m=base+p;while(m<=last)m+=12;v.push(m);last=m}
      if(v[0]>=lo&&v[v.length-1]<=hi)cands.push(v);if(n>=4){const w=v.slice();w[n-2]-=12;w.sort((a,b)=>a-b);if(w[0]>=lo&&w[n-1]<=hi)cands.push(w)}}}
  if(!cands.length){const v=pcs.map(p=>{let m=lo+((p-lo)%12+12)%12;return m}).sort((a,b)=>a-b);return v}
  const mid=(lo+hi)/2,score=v=>{let s=0;if(prev&&prev.length){for(const m of v){let b=99;for(const q of prev)b=Math.min(b,Math.abs(m-q));s+=b}}else s=Math.abs((v[0]+v[v.length-1])/2-mid)*2;
    if(v[0]<55&&v.length>1&&v[1]-v[0]<5)s+=6;return s};
  let best=cands[0],bs=1e9;for(const v of cands){const x=score(v);if(x<bs){bs=x;best=v}}return best}
