// A second engine as Pregen makes it (Object.create(music), its own OfflineAudioContext, bar-by-bar suspends), the
// live music on a real AudioContext. Each SYN voice plays a note every quarter; counts notes heard and their delay.
const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async()=>{const S=window.__s,M=S.music,A=S.audio,SY=S.SYN;A.init();M.ensure&&M.ensure();for(let i=0;i<80&&!M.voicesOn;i++)await new Promise(r=>setTimeout(r,100));if(M.readyP)await M.readyP;
  const res={},SR=32000,bpm=140,bd=240/bpm,nb=6;
  for(const nm of ['rhodes','tb303','reese7','smooth','erhu','hang','anthem'])for(const mode of ['nosync','sync']){
    const E=Object.create(M);Object.assign(E,{ctx:null,timer:null,pgE:true});const oc=new OfflineAudioContext(2,Math.ceil(SR*(nb*bd+0.5)),SR);E.ctx=null;E.init(oc);await E.readyP;
    E.T={b:bpm,fx:[]};E.tO=0;for(const k in E.bus)E.bus[k].gain.value=1;try{E.rev.disconnect();E.dly.disconnect()}catch(e){}E.out.disconnect();E.out.connect(oc.destination);
    if(nm==='anthem')await SY.prep(['anthem'],0,E);
    const P=SY.P[nm],m=(P.r[0]+P.r[1])>>1,T=[];const bar=b=>{for(let q=0;q<4;q++){const t=0.05+b*bd+q*bd/4;T.push(t);SY.play(nm,t,m+(q%2)*3,bd/4*0.6,0.9,{eng:E})}};
    bar(0);if(mode==='sync')await SY.sync(E);
    for(let b=0;b<nb-1;b++){const q=Math.max(1,Math.round((0.05+b*bd)*SR/128))*128/SR;oc.suspend(q).then(async()=>{bar(b+1);if(mode==='sync')await SY.sync(E);oc.resume()})}
    const buf=await oc.startRendering(),x=buf.getChannelData(0);let heard=0,dl=[];
    for(const t of T){const i0=Math.round(t*SR);let on=-1,pk=0;for(let i=i0;i<i0+Math.round(0.1*SR)&&i<x.length;i++){const a=Math.abs(x[i]);if(a>pk)pk=a;if(on<0&&a>1e-3)on=i}if(on>=0){heard++;dl.push(Math.round((on-i0)/SR*1000))}}
    res[nm+' '+mode]=`${heard}/${T.length} notes heard, onset delay ms min ${Math.min(...dl)} max ${Math.max(...dl)}`}
  return res});
 for(const[k,v]of Object.entries(r))console.log(k.padEnd(16),v);await browser.close()})();
