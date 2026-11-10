//# music/021-generators.js: generators: rhythms, contours, hooks, riffs and solos from the tune seed
/* ---- the generators: rhythms, contours, hooks, riffs and solos, all from the tune's seed ---- */
const euclid=(k,n,rot=0)=>{const a=[];for(let i=0;i<n;i++)a.push(Math.floor((i+rot)*k/n)!==Math.floor((i+rot-1)*k/n)?1:0);if(rot===0)a[0]=1;return a};
/* one bar (or two) of onsets with lengths: dense from 2 to 9 notes, legato or detached */
function tRhy(r,k,n,leg){const pick=a=>a[Math.floor(r()*a.length)],rot=r()<0.5?0:pick([0,1,2,3,5]);let on=euclid(k,n,rot);if(!on.some(x=>x))on[0]=1;
  const ix=[];on.forEach((x,i)=>{if(x)ix.push(i)});return ix.map((s,j)=>{const nx=j+1<ix.length?ix[j+1]:n,g=nx-s;return[s,leg?g:Math.max(1,Math.min(g,r()<0.5?g:Math.ceil(g/2)))]})}
/* scale-degree contours: arch, fall, rise, zigzag, pedal (a repeated note with neighbours), leap, wave */
function tCont(r,n,shape){const d=[];let x=0;const st=()=>r()<0.75?1:2;
  for(let i=0;i<n;i++){const f=i/Math.max(1,n-1);
    if(shape==='arch')x=Math.round(Math.sin(f*Math.PI)*(3+Math.floor(r()*3)));
    else if(shape==='fall')x=i?x-(r()<0.8?1:2):4+Math.floor(r()*3);
    else if(shape==='rise')x=i?x+(r()<0.8?1:2):0;
    else if(shape==='zig')x=i?x+(i%2?st():-st()+1):0;
    else if(shape==='pedal')x=i%3===2?(r()<0.5?2:-1):0;
    else if(shape==='leap')x=i%2?7:(i%4===2?2:0);
    else x=Math.round(Math.sin(f*Math.PI*2+0.5)*3);
    d.push(x)}return d}
const degP=(sc,d)=>{const n=sc.length,o=Math.floor(d/n);return sc[((d%n)+n)%n]+12*o};
/* the chord tones nearest p (in semitones above the tonic) */
const tNear=(p,tones)=>{let q=p,bd=99;for(const t of tones)for(const o of[-24,-12,0,12,24]){const x=t+o;if(Math.abs(x-p)<bd||(Math.abs(x-p)===bd&&x<q)){bd=Math.abs(x-p);q=x}}return q};
const tTones=(deg,hs)=>chordOf(deg,hs).map(x=>((x%12)+12)%12);
/* A hook in one of several forms. AABA, ABAC, AAAB, AB (a two-bar phrase and its answer), long (one held line over the
   phrase), even (Prototype 45: the line in plain quarter and half notes, a statement and its answer, the way a pianist
   would play it). With a line (from the documents) its pitches are kept in order and only the rhythm and the fit to
   the chords are new. tn(bar) gives the chord tones of a bar. Returns sixteenth events over 4 or 8 bars. */
function tHookGen(r,o){const{sc,hs,roots,form,line,dens}=o,tn=o.tn||(b=>tTones(roots[b%roots.length],hs)),pick=a=>a[Math.floor(r()*a.length)],bars=form==='long'?8:4,ev=[];
  const shapes=['arch','fall','rise','zig','pedal','wave','leap'];
  const motif=(k,len,leg)=>{const rh=tRhy(r,k,len,leg),c=tCont(r,rh.length,pick(shapes)),base=pick([0,2,4]);return rh.map(([s,d],i)=>({s,d,g:base+c[i]}))};
  const put=(m,bar,shift,end)=>{m.forEach((e,i)=>{let p=degP(sc,e.g+shift);ev.push({s:bar*16+e.s,d:e.d,p,b:bar})});if(end&&ev.length){const L=ev[ev.length-1];L.p=tNear(L.p,[0,7]);L.d=Math.max(L.d,Math.min(8,bar*16+16-L.s))}};
  if(form==='even'&&line&&line.length){/* a plain statement over two bars and its answer, coming home */
    const n=line.length,RH={8:[[4,4,4,4,4,4,4,4],[6,2,4,4,6,2,4,4],[4,4,4,4,6,2,4,4]],7:[[4,4,4,4,4,4,8],[6,2,4,4,4,4,8]],6:[[4,4,8,4,4,8],[4,4,4,4,8,8]],5:[[4,4,8,8,8],[8,4,4,8,8]]},
      R=pick(RH[Math.min(8,Math.max(5,n))]||RH[8]),L=line.slice(0,R.length);while(L.length<R.length)L.push(line[L.length%n]);
    /* the line keeps its own notes; only a bar's first note moves, and only when it clashes with the chord (a semitone off) */
    const clash=(p,T)=>{const pc=((p%12)+12)%12;return!T.includes(pc)&&T.some(x=>{const dd=((x-pc)%12+12)%12;return dd===1||dd===11})};
    for(let k=0;k<2;k++){let s=k*32;R.forEach((d,i)=>{let p=L[i];const b=Math.floor(s/16)%4;if(s%16===0&&clash(p,tn(b)))p=tNear(p,tn(b));if(k===1&&i===R.length-1)p=tNear(p,[0]);ev.push({s,d:Math.max(2,d-(d>=4?1:0)),p,b});s+=d})}}
  else if(line&&line.length){/* the documented line: its own pitches, a new rhythm each tune */
    const n=line.length,span=n>8?32:pick([16,32]),rh=n>8?tRhy(r,n,32,true):span===16?tRhy(r,Math.min(n,8),16,r()<0.5):tRhy(r,n,32,r()<0.6);
    const L=rh.map(([s,d],i)=>({s,d,p:line[i%n]}));const rep=span===16?4:2;
    for(let k=0;k<rep;k++)for(const e of L){let p=e.p;const s=k*span+e.s;if(k&&s%8===0&&e.d>=2){const b=Math.floor(s/16)%4;p=tNear(p,tn(b))}ev.push({s,d:e.d,p,b:Math.floor(s/16)})}
    const Z=ev[ev.length-1];if(Z){Z.p=tNear(Z.p,[0]);Z.d=Math.max(Z.d,bars*16-Z.s>12?4:bars*16-Z.s)}}
  else if(form==='long'){const rh=tRhy(r,pick([3,4,5]),32,true),c=tCont(r,rh.length*4,pick(['wave','arch','fall']));let i=0;for(let k=0;k<4;k++)for(const[s,d]of rh){const s0=k*32+s,b=Math.floor(s0/16),p=degP(sc,c[i++]+2);ev.push({s:s0,d,p:s%16===0?tNear(p,tn(b%4)):p,b})}}
  else{const k1=dens||pick([3,4,5,5,6,7]),A=motif(k1,16,r()<0.5),B=motif(Math.max(2,k1+pick([-2,-1,1,2])),16,r()<0.5),C=motif(pick([2,3,4]),16,true);
    const F={AABA:[[A,0],[A,pick([1,2,-1])],[B,0],[A,0]],ABAC:[[A,0],[B,0],[A,0],[C,0]],AAAB:[[A,0],[A,0],[A,pick([2,-2])],[B,0]],AB:[[A,0],[B,0],[A,0],[C,0]]}[form]||[[A,0],[B,0],[A,0],[C,0]];
    F.forEach(([m,sh],bar)=>put(m,bar,sh,bar===3))}
  /* strong beats lean onto the chord of their bar */
  if(form!=='even')for(const e of ev){if(e.s%16===0&&!(line&&e.s<32)){const b=Math.floor(e.s/16)%4;e.p=tNear(e.p,tn(b))}}
  return ev.sort((a,b)=>a.s-b.s)}
/* a one- or two-bar ostinato: from the line's first notes when there is one, otherwise root-heavy degrees */
function tRiffGen(r,o){const{sc,line,len}=o,pick=a=>a[Math.floor(r()*a.length)],n=len||16;
  const k=line&&line.length?Math.min(line.length,pick([3,4,5,6])):pick([3,4,5,6,7]),rh=tRhy(r,k,n,false);
  const pool=line&&line.length?line.slice(0,k):[0,0,0,12,7,degP(sc,2),10,0].map(x=>x===10?degP(sc,6):x);
  const A=rh.map(([s,d],i)=>({s,d:Math.min(d,2),p:line&&line.length?pool[i%pool.length]:i===0?0:pick(pool)}));
  const B=A.map((e,i)=>i===A.length-1?{...e,p:e.p===0?pick([7,12,degP(sc,2)]):0}:e);return{A,B,n}}
/* An improvised solo over the progression: two-bar phrases that grow from held notes (with slides) through licks to
   fast runs, each landing on a chord tone. p is absolute (MIDI); sl = slide up from that many semitones below. */
function tSoloGen(r,o){const{sc,hs,roots,key,bars,lo,hi,slide,calm}=o,tn=o.tn||(b=>tTones(roots[b%roots.length],hs)),pick=a=>a[Math.floor(r()*a.length)],ev=[],n=Math.max(1,Math.floor(bars/2));
  const mid=Math.round((lo+hi)/2),toM=d=>{let p=key+degP(sc,d)+48;while(p<lo)p+=12;while(p>hi)p-=12;return p};let cur=pick([0,2,4]);
  const land=(s)=>tn(Math.floor(s/16)%4);
  for(let j=0;j<n;j++){const x=calm?Math.min(0.5,j/Math.max(1,n-1)):j/Math.max(1,n-1),s0=j*32,ty=x<0.25?pick(['long','call']):x<0.7?pick(['lick','rep','call','lick']):pick(['run','lick','run']);
    cur+=pick([-2,-1,0,1,2])+(x>0.6?1:0);cur=Math.max(-3,Math.min(10,cur));
    if(ty==='long'){const k=pick([2,3]);let s=s0+pick([0,2]);for(let i=0;i<k&&s<s0+28;i++){const d=pick([6,8,10]);ev.push({s,d:Math.min(d,s0+30-s),p:toM(cur),sl:slide&&r()<0.5?pick([-2,-1]):0,v:0.85});cur+=pick([-1,1,2,-2]);s+=d}}
    else if(ty==='call'){let s=s0;const k=pick([3,4]);for(let i=0;i<k;i++){const d=pick([2,2,3,4]);ev.push({s,d,p:toM(cur),sl:slide&&i===0&&r()<0.4?-1:0,v:0.8});cur+=pick([1,-1,2]);s+=d}
      ev.push({s:s0+16+pick([0,2,4]),d:6,p:toM(cur),sl:slide?-1:0,v:0.75})}
    else if(ty==='lick'){let s=s0;const k=pick([6,7,8,9]);for(let i=0;i<k&&s<s0+26;i++){const d=pick([1,2,2,2,3]);ev.push({s,d,p:toM(cur),sl:0,v:0.72+0.2*r()});cur+=pick([1,-1,1,-1,2,-2,3]);s+=d}
      ev.push({s:Math.min(s,s0+26),d:4,p:toM(cur),sl:slide?-1:0,v:0.85})}
    else if(ty==='rep'){const p=toM(cur);for(let s=s0;s<s0+24;s+=pick([1,2])){ev.push({s,d:1,p:r()<0.25?toM(cur+1):p,sl:0,v:0.6+0.25*r()})}ev.push({s:s0+24,d:6,p,sl:0,v:0.85})}
    else{const up=r()<0.6,k=pick([7,8,10]);for(let i=0;i<k;i++)ev.push({s:s0+i,d:1,p:toM(cur+(up?i:-i)),sl:0,v:0.65+0.02*i});cur+=up?k:-k;ev.push({s:s0+k,d:pick([6,8]),p:toM(cur),sl:slide?-1:0,v:0.9})}}
  /* phrase ends land on a chord tone */
  for(let i=0;i<ev.length;i++){const e=ev[i],nx=ev[i+1];if(!nx||nx.s-e.s-e.d>=2||e.d>=6){const t=land(e.s),q=e.p-key-48,pc=((q%12)+12)%12;if(!t.includes(pc)){const z=tNear(pc,t);e.p+=z-pc}}}
  return ev.filter(e=>e.s<bars*16).sort((a,b)=>a.s-b.s)}
/* acid line: one bar, root-heavy, with accents and slides */
function tAcidGen(r,sc){const pick=a=>a[Math.floor(r()*a.length)],A=[];const pool=[0,0,0,12,0,7,degP(sc,2),degP(sc,6)-12,degP(sc,3),12];
  for(let s=0;s<16;s++){if(s===0||r()<0.68)A.push({s,d:1,p:s===0?0:pick(pool),ac:r()<0.28?1:0,sl:r()<0.2?1:0})}
  const B=A.map(e=>r()<0.25?{...e,p:pick(pool)}:e);return{A,B}}
/* metal riffs (Prototype 45): palm-muted chugs on the root in sixteenths and eighths, with power-chord stabs on the
   accents; [step, length, semitones above the root, 1 = open power chord] */
function tChugGen(r,sc){const pick=a=>a[Math.floor(r()*a.length)],R=[[0,1,0],[1,1,0],[2,1,0],[3,1,0]],A=[];const acc=pick([[0,3,6,10,12],[0,6,8,12,14],[0,3,8,11,14],[0,4,7,10,14]]);
  for(let s=0;s<16;s++){const a=acc.includes(s);if(a)A.push([s,s===0?2:pick([1,2]),s===0?0:pick([0,0,degP(sc,1),degP(sc,4)-12,degP(sc,5)-12]),1]);else if(r()<0.62)A.push([s,1,0,0])}
  const B=A.map(e=>e[3]&&e[0]>8&&r()<0.5?[e[0],e[1],pick([1,6,degP(sc,6)-12]),1]:e);return{A,B,R}}
