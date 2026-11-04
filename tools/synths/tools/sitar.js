// Renders the P43 sitar (and the P45 guzheng and tanpura) in Node from the page's own code; writes .f32 mono files
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const grab=(start)=>{const i=html.indexOf(start);if(i<0)throw start;let j=html.indexOf('\nSL.',i+5),k=html.indexOf('\nconst ',i+5),c=html.indexOf('\n/*',i+5);if(c>=0&&(j<0||c<j))j=c;const e=Math.min(j<0?1e12:j,k<0?1e12:k);return html.slice(i,e)};
let code='';for(const k of ['SL.biq=','SL.hp1=','SL.sitar=']) code+=grab(k)+'\n';
const rng=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const SL={};new Function('SL','rng',code)(SL,rng);
for(const m of [43,55,67,79,87]){const x=SL.sitar(32000,m,0);fs.writeFileSync(out+'/sitar_'+m+'.f32',Buffer.from(x.buffer))}
console.log('ok')
