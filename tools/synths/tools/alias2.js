// Aliasing = what a 48 kHz render adds over a 192 kHz render of the same note (below 20 kHz), as a share of all its
// energy. Noise, drift, vibrato and LFOs are switched off so both renders are the same sound.
const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');
function fft(re,im){const N=re.length;for(let i=1,j=0;i<N;i++){let b=N>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=N;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<N;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const p=i+j,q=p+len/2,xr=re[q]*cr-im[q]*ci,xi=re[q]*ci+im[q]*cr;re[q]=re[p]-xr;im[q]=im[p]-xi;re[p]+=xr;im[p]+=xi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
function spec(P,w,m,sr){const r=W.render(w,{poly:P.poly||1,mono:!P.poly,seed:3},[{t:0.01,d:1.2,f:mtof(m),v:1,sl:0,ac:0,bd:0,vs:1,mv:0,cm:0,pan:0,lr:0}],1.3,sr);
 const N=Math.round(0.68*sr/1024)*1024;let n2=1;while(n2<N)n2*=2;const re=new Float64Array(n2),im=new Float64Array(n2),o=Math.round(0.3*sr);for(let i=0;i<n2;i++)re[i]=r.L[o+i]*(0.5-0.5*Math.cos(2*Math.PI*i/n2));fft(re,im);
 const df=sr/n2,out=[];for(let b=0;b*df<20000;b++)out.push([b*df,(re[b]*re[b]+im[b]*im[b])/(n2*n2)]);return out}
const names=process.argv.slice(2);
for(const nm of names){const P=SYN.P[nm];const w=Object.assign({},P.w,{nz:0,nb:0,dr:0,vd:0,fl:0,ld:0,Fd:0,lp:1e7,hp:0.001},process.env.NOFB?{fb:0}:{});const res=[];
 for(const m of [P.r[0],Math.round((P.r[0]+P.r[1])/2),P.r[1]]){const a=spec(P,w,m,48000),b=spec(P,w,m,192000);
  // both spectra on the same 2.9 Hz grid: sum b into a's bins
  const df=a[1][0],B=new Float64Array(a.length);for(const[f,e]of b){const k=Math.round(f/df);if(k<B.length)B[k]+=e}
  // compare in 1/6-octave-free way: smooth both over 7 bins (detuned voices, leakage), then count the excess of a over b
  const sm=x=>x.map((_,i)=>{let s=0;for(let j=-3;j<=3;j++)s+=x[i+j]||0;return s});const A=sm(a.map(x=>x[1])),BB=sm(Array.from(B));
  let ex=0,tot=0;for(let i=0;i<A.length;i++){tot+=A[i];if(A[i]>BB[i]*2)ex+=A[i]-BB[i]}res.push(m+':'+(10*Math.log10(ex/tot+1e-12)).toFixed(0))}
 console.log(nm.padEnd(10),'aliased energy dB at',res.join('  '))}
