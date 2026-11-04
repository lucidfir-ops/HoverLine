const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
const grab=(start)=>{const i=html.indexOf(start);if(i<0)throw start;let j=html.indexOf('\nSL.',i+5),k=html.indexOf('\nconst ',i+5),c=html.indexOf('\n/*',i+5);if(c>=0&&(j<0||c<j))j=c;return html.slice(i,Math.min(j<0?1e12:j,k<0?1e12:k))};
const rng=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const mtof=m=>440*Math.pow(2,(m-69)/12);
class AB{constructor(o){this.length=o.length;this.sampleRate=o.sampleRate;this.d=[...Array(o.numberOfChannels)].map(()=>new Float32Array(o.length))}getChannelData(i){return this.d[i]}}
let code='';for(const k of ['SL.biq=','SL.hp1=','SL.sitar=']) code+=grab(k)+'\n';
const s=fs.readFileSync(__dirname+'/../src/syn.js','utf8');const ks=s.slice(s.indexOf('SL.ksTune='),s.indexOf('const SYN={'));
const SL={};new Function('SL','rng','mtof','AudioBuffer',code+ks)(SL,rng,mtof,AB);
// pitch by autocorrelation-free method: FFT peak with parabolic interpolation around the expected fundamental
function f0est(x,sr,f){const N=1<<16,re=new Float64Array(N),im=new Float64Array(N);const o=Math.round(0.08*sr);for(let i=0;i<N&&o+i<x.length;i++)re[i]=x[o+i]*(0.5-0.5*Math.cos(2*Math.PI*i/N));
  // DFT only near f (Goertzel scan)
  let best=0,bf=f;for(let c=-80;c<=80;c+=0.5){const fr=f*Math.pow(2,c/1200),w=2*Math.PI*fr/sr;let sr_=0,si=0;for(let i=0;i<N&&o+i<x.length;i+=1){sr_+=re[i]*Math.cos(w*i);si+=re[i]*Math.sin(w*i)}const e=sr_*sr_+si*si;if(e>best){best=e;bf=c}}return bf}
const sr=32000;const out=[];
for(const m of [55,67,79,86]){out.push('sitar '+m+': '+f0est(SL.sitar(sr,m,0),sr,mtof(m)).toFixed(1)+'c')}
for(const m of [50,62,74,86]){out.push('guzheng '+m+': '+f0est(SL.guzheng(sr,m).b.getChannelData(0),sr,mtof(m)).toFixed(1)+'c')}
console.log(out.join('  |  '));
