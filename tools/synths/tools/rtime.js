// main-thread cost of the rendered instruments (CPU ms per piece) and their memory, against the P43 sitar
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
const grab=(start)=>{const i=html.indexOf(start);let j=html.indexOf('\nSL.',i+5),k=html.indexOf('\nconst ',i+5),c=html.indexOf('\n/*',i+5);if(c>=0&&(j<0||c<j))j=c;return html.slice(i,Math.min(j<0?1e12:j,k<0?1e12:k))};
const rng=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const mtof=m=>440*Math.pow(2,(m-69)/12);
class AB{constructor(o){this.length=o.length;this.sampleRate=o.sampleRate;this.numberOfChannels=o.numberOfChannels;this.d=[...Array(o.numberOfChannels)].map(()=>new Float32Array(o.length))}getChannelData(i){return this.d[i]}get duration(){return this.length/this.sampleRate}}
const s=fs.readFileSync(__dirname+'/../src/syn.js','utf8');const code=grab('SL.biq=')+'\n'+grab('SL.hp1=')+'\n'+grab('SL.sitar=')+'\n'+s.replace("SL.WORKLET+='\\n('+SYNW.toString()+')();';",'').replace(/for\(const\[k,P\]of Object\.entries\(SYN\.P\)\)[\s\S]*$/,'')+';return SYN';
const SL={WORKLET:''};const SYN=new Function('SL','rng','mtof','AudioBuffer','music',code)(SL,rng,mtof,AB,{});
const T=(f)=>{const a=process.cpuUsage();const x=f();const u=process.cpuUsage(a);return[(u.user+u.system)/1000,x]};
const out=[];const row=(nm,n,ms,bytes)=>out.push(`${nm.padEnd(22)} pieces ${String(n).padStart(2)}  ${(ms/n).toFixed(0).padStart(5)} ms each  ${ms.toFixed(0).padStart(6)} ms all  ${(bytes/1048576).toFixed(2)} MB`);
let ms=0,by=0;for(let m=43;m<=87;m+=2){const[t,x]=T(()=>SL.sitar(32000,m,0));ms+=t;by+=x.length*4}row('sitar (P43, per key)',23,ms,by);
for(const set of ['ssA','ssB','warm','choir']){ms=0;by=0;const bs=SYN.LS[set].bs;for(const b of bs){const[t,x]=T(()=>SL.LOOP(set,b));ms+=t;by+=x.b.length*x.b.numberOfChannels*4}row('loop set '+set,bs.length,ms,by)}
ms=0;by=0;for(const b of SYN.LS.gz.bs){const[t,x]=T(()=>SL.guzheng(32000,b));ms+=t;by+=x.b.length*4}row('guzheng',SYN.LS.gz.bs.length,ms,by);
{const[t,x]=T(()=>SL.tanpura(32000,2));row('tanpura (per key)',1,t,x.b.length*4)}
console.log(out.join('\n'));
