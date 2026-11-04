// Inharmonic (aliased) energy of held notes: for each note, the share of energy (below 20 kHz) that is not within the
// spread of a harmonic. node alias.js [names]
const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');
function fft(re,im){const N=re.length;for(let i=1,j=0;i<N;i++){let b=N>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=N;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<N;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const p=i+j,q=p+len/2,xr=re[q]*cr-im[q]*ci,xi=re[q]*ci+im[q]*cr;re[q]=re[p]-xr;im[q]=im[p]-xi;re[p]+=xr;im[p]+=xi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
const sr=48000,names=process.argv.slice(2);
for(const nm of names){const P=SYN.P[nm];const w=Object.assign({},P.w);delete w.nz;delete w.nb;delete w.dr;delete w.vd;delete w.fl;delete w.ld;delete w.Fd;
  const out=[];for(const m of [P.r[0],Math.round((P.r[0]+P.r[1])/2),P.r[1]]){const f=mtof(m);
    const r=W.render(w,{poly:P.poly||1,mono:!P.poly,seed:3},[{t:0.01,d:1.4,f,v:1,sl:0,ac:0,bd:0,vs:1,mv:0,cm:0,pan:0,lr:0}],1.5,sr);
    const N=32768,re=new Float64Array(N),im=new Float64Array(N),o=Math.round(0.4*sr);for(let i=0;i<N;i++){re[i]=r.L[o+i]*(0.5-0.5*Math.cos(2*Math.PI*i/N))}fft(re,im);
    const df=sr/N,dtm=w.e===1?Math.max(...w.dt.map(Math.abs)):(w.n>1?(w.dt||0):0),sp=Math.pow(2,dtm/1200)-1;let h=0,x=0;
    for(let b=1;b<N/2;b++){const fb=b*df;if(fb>20000)break;const e=re[b]*re[b]+im[b]*im[b],k=Math.max(1,Math.round(fb/f)),near=Math.abs(fb-k*f)<=k*f*sp+4*df;if(near)h+=e;else x+=e}
    out.push(m+':'+(10*Math.log10(x/(h+x)+1e-15)).toFixed(0))}
  console.log(nm.padEnd(10),'inharmonic dB at',out.join('  '))}
