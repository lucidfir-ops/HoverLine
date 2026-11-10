// usage: node render.js outdir scene...
const {chromium}=require('playwright');const path=require('path');
(async()=>{const out=process.argv[2];const names=process.argv.slice(3);const b=await chromium.launch();
 for(const n of names){const p=await b.newPage({viewport:{width:1600,height:900}});p.on('pageerror',e=>console.log('pageerror',e.message));
  const t=Date.now();await p.goto('file://'+path.resolve(__dirname,'index.html')+'?scene='+n);
  try{await p.waitForFunction('window.done||window.err',null,{timeout:180000})}catch(e){console.log('timeout',n)}
  const err=await p.evaluate('window.err');if(err){console.log(n,'ERR',err);}
  await p.screenshot({path:path.join(out,n+'.png')});console.log(n,Date.now()-t,'ms');await p.close();}
 await b.close()})();
