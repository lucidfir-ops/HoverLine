// Render the P44 kits in Chromium and dump every piece as raw float32 (for loudness references and spectra).
//   node dump_p44_kits.js PAGE.html OUTDIR
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const three=fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js','utf8');
const [,,PAGE,OUT]=process.argv;fs.mkdirSync(OUT,{recursive:true});
const HOOK='window.__t={music,audio,SL,KITX,KITX2};';
const body=fs.readFileSync(PAGE,'utf8').replace('requestAnimationFrame(frame);\n})();','requestAnimationFrame(frame);'+HOOK+'\n})();');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required']});
  const p=await (await b.newContext()).newPage();p.on('pageerror',e=>console.log('pageerror',e.message));
  await p.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://127.0.0.1:8099/'))return r.fulfill({contentType:'text/html; charset=utf-8',body});if(u.includes('three'))return r.fulfill({contentType:'application/javascript',body:three});return r.abort()});
  await p.goto('http://127.0.0.1:8099/?quick=0&share=0&lb=http://127.0.0.1:9&render=0');
  for(let k=0;k<60&&!(await p.evaluate(()=>!!window.__t));k++)await wait(500);
  const info=await p.evaluate(async()=>{const {music,audio}=__t;audio.init();music.lite=false;music.init();await music.readyP;await music.ensureExt();
    for(const id of [8,9,10]){music.kit2=id;music.st=music.st||{};}
    // decode the P38 kits' recordings and build them
    const V=music.vbuf;const need=[];for(const K of Object.values(__t.KITX2))for(const p of Object.values(K.p))need.push(Array.isArray(p)?p[0]:p);
    const src={};for(const k of need)if(__t.SL.EXT2[k])src[k]=__t.SL.EXT2[k];const v=await music.decodeVox(music.ctx,()=>true,src);Object.assign(music.vbuf,v);
    for(const id of [8,9,10])music.mkKit(id);
    return {sr:music.ctx.sampleRate,kits:Object.keys(music.kits),k0:Object.keys(music.kit0)}});
  console.log(JSON.stringify(info));
  const kits=['0',...info.kits];
  for(const kid of (process.env.RAWONLY?[]:kits)){const data=await p.evaluate(kid=>{const {music}=__t;const K=kid==='0'?music.kit0:music.kits[kid];const o={};
      const enc=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
      for(const[k,b]of Object.entries(K)){if(!b||!b.getChannelData)continue;o[k]=enc(b.getChannelData(0))}return o},kid);
    for(const[k,s]of Object.entries(data))fs.writeFileSync(`${OUT}/kit${kid}_${k}.f32`,Buffer.from(s,'base64'));
  }
  // also the raw embedded recordings of hats/cymbals (decoded, unmixed)
  const raw=await p.evaluate(async()=>{const {music,SL}=__t;const keys=['h1','h2','ho','cr','rd','s1','s2','kd','cl'];const src={};const more=['x_cgl','x_cgo','x_bgh','x_cgs','x_tabla_na','x_tabla_dhec','x_db1','x_cj1','x_mb_65','x_vb_74','x_ka_67','x_hc_61','x_cow','x_clv1','x_tmb'];for(const k of more)if(SL.EXT[k])src[k]=SL.EXT[k];for(const k of['x_frs','x_didg','x_up_60','x_mz_60','x_pd_wg1','x_pd_bv4','x_cc_kd','x_cc_s1','x_hat_metal'])if(SL.EXT2[k])src[k]=SL.EXT2[k];for(const k of['i_pn_60','i_tp','i_sh1','i_cl1','i_cy'])if(SL.VOX[k])src[k]=SL.VOX[k];for(const k of keys)src[k]=SL.SMP[k];
      const ext=['x_hat_gump','x_hat_cats','x_hat_noiz','x_hat_snap','x_hat_gem','x_hat_sci','x_hat_zap','x_hat_psych','x_hat_hier','x_hat_star','x_sn_dub','x_elec_mid_snare'];for(const k of ext)src[k]=SL.EXT[k];
      for(const k of['x_cc_cr','x_hat_len','x_hat_mess','x_hat_metal','x_ride_via','x_drum_splash_soft'])if(SL.EXT2[k])src[k]=SL.EXT2[k];
      src.s_sp=SL.VOX.s_sp;
      const v=await music.decodeVox(music.ctx,()=>true,src);const enc=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
      const o={};for(const[k,b]of Object.entries(v))o[k]=enc(b.getChannelData(0));return o});
  for(const[k,s]of Object.entries(raw))fs.writeFileSync(`${OUT}/raw_${k}.f32`,Buffer.from(s,'base64'));
  fs.writeFileSync(OUT+'/info.json',JSON.stringify(info));await b.close()})();
