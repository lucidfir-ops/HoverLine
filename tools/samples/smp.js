/* ---------- SMP: the recorded sample library (Prototype 45) ----------
   The drums and instruments live in samples/ beside the page: manifest.json (manifest.js for file://) and packs of FLAC
   recordings (name.bin, or name.js where fetch can't reach: a page opened from file://). A tune asks for what it plays
   with SMP.need([...kits, instruments or packs]); packs download once, sounds decode when needed and stay cached.
   pick(kit, voice, vel) picks a velocity layer and a round robin that never repeats the last one. With no samples/
   folder (the single-file offline copy) or no FLAC decoder, SMP.fallback is true and pick() hands back the embedded
   Prototype 44 kit pieces, so the music plays as before. SMP never calls Math.random (the race simulator seeds it). */
const SMP=(()=>{
  const BASE=(()=>{try{const q=new URLSearchParams(location.search).get('samples');if(q==='0')return null;if(q&&/^[\w./-]+\/$/.test(q)&&!/\.\./.test(q))return q}catch(e){}return'samples/'})();
  const FILE=(()=>{try{return location.protocol==='file:'}catch(e){return false}})();
  let man=null,initP=null,probeP=null,why='',bytes=0,pinA=new Set(),pinB=new Set(),manQ=null,dctx0=null;
  const packs={},bufs={},decP={},bad={},use={},rr={},res={},kv={},waitPk={},queue=[];let active=0;
  /* our own small PRNG (mulberry32) for round robins */
  let seed=0x2545F491;const rnd=()=>{seed=seed+0x6D2B79F5|0;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  const now=()=>{try{return performance.now()}catch(e){return 0}};
  const capMB=(()=>{let m=4;try{m=navigator.deviceMemory||4}catch(e){}return m<=2?40:m<=4?80:160})();
  /* scripts that register data: samples/manifest.js and samples/<pack>.js call these */
  try{window.HLSMP_MAN=j=>{manQ=j};window.HLSMP_PACK=(n,b)=>{const w=waitPk[n];if(w){delete waitPk[n];w(b64u8(b))}}}catch(e){}
  const b64u8=s=>{try{if(typeof s!=='string')return null;const d=atob(s),u=new Uint8Array(d.length);for(let i=0;i<d.length;i++)u[i]=d.charCodeAt(i);return u}catch(e){return null}};
  const script=src=>new Promise(r=>{try{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>{s.remove();r(true)};s.onerror=()=>{s.remove();r(false)};document.head.appendChild(s)}catch(e){r(false)}});
  /* the manifest: fetch the JSON over http(s); from file:// (or if that fails) the script that registers it */
  /* which form the folder holds decides how packs load: manifest.json -> <pack>.bin; only manifest.js -> <pack>.js */
  let mode='bin';
  function loadMan(){const viaScript=()=>script(BASE+'manifest.js').then(()=>{const j=manQ;manQ=null;if(j)mode='script';return j});
    if(FILE)return viaScript();
    const viaText=()=>fetch(BASE+'manifest.js',{cache:'no-cache'}).then(r=>r.ok?r.text():null).then(t=>{if(!t)return null;const j=JSON.parse(t.slice(t.indexOf('(')+1,t.lastIndexOf(')')));mode='js';return j}).catch(()=>null);
    let blocked=0;return fetch(BASE+'manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json().catch(()=>null):null,()=>{blocked++;return null}).then(j=>j?(mode='bin',j):viaText()).then(j=>j||(blocked?viaScript():null))}
  function index(m){for(const[k,K]of Object.entries(m.kits||{})){const V=kv[k]={};for(const[v,ids]of Object.entries(K.voices||{})){const L=[];
      for(const id of ids){const s=m.sounds[id];if(!s)continue;const[a,b]=s.vel||[0,1];let l=L.find(x=>x.a===a&&x.b===b);if(!l)L.push(l={a,b,ids:[]});l.ids.push(id)}
      L.sort((x,y)=>x.a-y.a);V[v]=L}}}
  function init(){if(initP)return initP;
    initP=(BASE?loadMan():Promise.resolve(null)).then(m=>{if(!m||m.v!==1||!m.sounds||!m.packs){why=BASE?'no samples/ folder':'turned off (?samples=0)';SMP.fallback=true;SMP.state='fallback';return false}
      man=m;index(m);SMP.manifest=m;SMP.state='ready';SMP.fallback=false;return true}).catch(()=>{why='manifest error';SMP.fallback=true;SMP.state='fallback';return false});
    return initP}
  /* decoding happens on the game's AudioContext once it exists (no resampling at play), or a small offline one */
  function dctx(){if(SMP.ctx)return SMP.ctx;try{if(typeof audio!=='undefined'&&audio.ctx)return audio.ctx}catch(e){}
    if(!dctx0){try{const O=window.OfflineAudioContext||window.webkitOfflineAudioContext;dctx0=new O(1,1,44100)}catch(e){dctx0=null}}return dctx0}
  const decode=(c,ab)=>new Promise(r=>{let d=false;const ok=b=>{if(!d){d=true;r(b||null)}},no=()=>{if(!d){d=true;r(null)}};try{const p=c.decodeAudioData(ab,ok,no);if(p&&p.then)p.then(ok,no)}catch(e){no()}});
  /* can this browser decode FLAC? (a 20 ms FLAC of silence) */
  const PROBE='ZkxhQ4AAACISABIAAAD7AAD7CsRA8AAAA3JQHZs6lfejne4Y1S4UgXj7//h5CAADcQ5GAAAAAAAAAADmocEcAfgzjzAB/zySHkPIeSSSSZMzn///mZkmZkkychyZJJJkkzkmSZJkyTkzfMznP5MmfJmZyTMMkySSSSTkmTyZJOTJnz/Jp5/PmeZOTmSYZMkySTJMk5Jzk5Mmcyc8+Z5mk5PmZ+TkkycknknJJzM8nOTkzMnOTMnMnJMyTJznzOTmc8zyZM5yWeTk4ZJkkmQ5JyEyZJCcknzzOc/k+ebJycnyeScmSSckySGSSZJJmTkkkzMymeeT8n5zmk5zmTJJJkzMknMkMwmSTJJknMk//ZKZ5JM5OTJkzknMzMyZJpJ/+f/gOYE=';
  function probe(){if(probeP)return probeP;const c=dctx();if(!c||!c.decodeAudioData)return probeP=Promise.resolve(false);
    return probeP=decode(c,b64u8(PROBE).buffer).then(b=>{const ok=!!(b&&b.length>100);if(!ok){why='this browser cannot decode FLAC';SMP.fallback=true;SMP.state='fallback'}return ok})}
  function ready(){return init().then(ok=>ok?probe():false)}
  /* packs: name.bin by fetch; name.js as text where only that exists; name.js as a script from file:// */
  function loadPack(n){const P=packs[n]||(packs[n]={p:null,u8:null});if(P.p)return P.p;const I=man&&man.packs[n];if(!I)return Promise.resolve(null);
    const js=BASE+I.file.replace(/\.bin$/,'.js');
    const viaScript=()=>new Promise(r=>{waitPk[n]=r;script(js).then(ok=>{if(waitPk[n]){delete waitPk[n];r(null)}})});
    const viaText=()=>fetch(js).then(r=>r.ok?r.text():null).then(t=>{if(!t)return null;const a=t.indexOf('"',t.indexOf(',')),b=t.lastIndexOf('"');return a>0&&b>a?b64u8(t.slice(a+1,b)):null}).catch(()=>null);
    const viaBin=()=>fetch(BASE+I.file+(I.h?'?v='+I.h:'')).then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Uint8Array(ab):null).catch(()=>null);
    const get=FILE||mode==='script'?viaScript():mode==='js'?viaText().then(u=>u||viaScript()):viaBin().then(u=>u||viaText()).then(u=>u||viaScript());
    return P.p=get.then(u=>{if(u&&I.bytes&&u.length!==I.bytes)u=null;P.u8=u;if(!u)P.p=null;return u})}
  /* a few decodes at a time, so a big kit doesn't stall the page */
  function pump(){while(active<3&&queue.length){const j=queue.shift();active++;j().then(()=>{active--;pump()},()=>{active--;pump()})}}
  function dec(id){if(bufs[id])return Promise.resolve(bufs[id]);if(decP[id])return decP[id];if(bad[id]||!man)return Promise.resolve(null);const s=man.sounds[id];if(!s)return Promise.resolve(null);
    return decP[id]=new Promise(done=>{queue.push(()=>loadPack(s.pack).then(u=>{const c=dctx();if(!u||!c)return null;return decode(c,u.slice(s.at[0],s.at[0]+s.at[1]).buffer)}).then(b=>{
        delete decP[id];if(b){bufs[id]=b;bytes+=b.length*b.numberOfChannels*4;use[id]=now();trimCache()}else bad[id]=1;done(b)},()=>{delete decP[id];done(null)}));pump()})}
  /* the decoded cache stays under a memory cap: least recently used sounds that no recent need() asked for go first.
     A sound still playing is held by its source node, so dropping it from the cache never cuts it off. */
  function trimCache(){const capB=SMP.capMB*1048576;if(bytes<=capB)return;const t=now(),c=Object.keys(bufs).filter(id=>!pinA.has(id)&&!pinB.has(id)&&t-(use[id]||0)>SMP.idleMs).sort((a,b)=>(use[a]||0)-(use[b]||0));
    for(const id of c){if(bytes<=capB*0.85)break;drop(id)}}
  function drop(id){const b=bufs[id];if(!b)return;bytes-=b.length*b.numberOfChannels*4;delete bufs[id];delete res[id]}
  /* names: 'kit:x', 'inst:x', 'pack:x', or a bare name (pack, then kit, then instrument) */
  function idsOf(list){const o=new Set();if(!man)return o;for(const raw of[].concat(list||[])){if(!raw)continue;const m=/^(kit|inst|pack):(.+)$/.exec(raw),t=m?m[1]:null,n=m?m[2]:raw;
      if((!t||t==='pack')&&man.packs[n]){for(const[id,s]of Object.entries(man.sounds))if(s.pack===n)o.add(id);if(t||!man.kits[n])continue}
      if((!t||t==='kit')&&man.kits[n]){for(const ids of Object.values(man.kits[n].voices))for(const id of ids)o.add(id);continue}
      if((!t||t==='inst')&&man.instruments&&man.instruments[n])for(const z of man.instruments[n].zones)o.add(z.id)}
    return o}
  function need(list){return ready().then(ok=>{if(!ok)return{ok:false,fallback:true,why};const ids=[...idsOf(list)];pinB=pinA;pinA=new Set(ids);
      return Promise.all(ids.map(dec)).then(r=>{const failed=ids.filter((id,i)=>!r[i]);return{ok:!failed.length,n:ids.length,failed}})})}
  function out(id){let r=res[id];if(r)return r;const s=man.sounds[id];return res[id]={id,buf:bufs[id],gain:s.gain,on:s.on||0,hit:s.hit!=null?s.hit:s.on||0,root:s.root,len:s.len,fb:false}}
  function choose(key,ids){const n=ids.length;if(n===1)return ids[0];const last=rr[key];let i=Math.floor(rnd()*n);if(ids[i]===last)i=(i+1+Math.floor(rnd()*(n-1)))%n;return rr[key]=ids[i]}
  /* fallback: the embedded kit pieces (already at the reference levels, so gain 1) */
  const FBV={kick:['kd'],kick2:['kd'],kick_metal:['km'],kick_trance:['kt'],kick_short:['ks'],kick_long:['k8'],kick_dist:['ki'],kick_house:['kh'],kick_psy:['kp'],
    snare:['s1','s2'],snare_metal:['sm'],snare_brk:['sb'],ghost:['sg'],rim:['sb'],clap:['cl'],snap:['cl'],chh:['h1','h2'],phh:['h2'],ohh:['ho'],pedal:['h2'],
    ride:['rd'],rbell:['rd'],crash:['cr'],china:['cr'],splash:['cr'],tomL:['t3'],tomM:['t2'],tomH:['t1'],tomF:['t3']};
  /* library kits -> the Prototype 44 kit (music.kits) that stands in for it */
  const FBK={tight:5,psy:5,'808':1,house:2,electro:3,gas:4,breaks:6,funk:6,rock:6,tape:7,jazz:8,concert:9};const fbr={};
  function fbPick(kit,voice){let K=null;try{const v=SMP.fbKit[kit]!=null?SMP.fbKit[kit]:FBK[kit];K=v&&music.kits&&music.kits[v]||music.kit0}catch(e){}if(!K)return null;
    const L=(SMP.fbVoice[voice]||SMP.fbVoice[voice.split('_')[0]]||[]).filter(p=>K[p]);if(!L.length)return null;const p=L.length>1?choose('fb|'+kit+'|'+voice,L):L[0];const b=K[p];
    let r=fbr[p];if(!r||r.buf!==b)r=fbr[p]={id:'p44:'+p,buf:b,gain:1,on:0,hit:0,len:b.duration,fb:true};return r}
  function pick(kit,voice,vel,o){if(vel==null)vel=0.8;if(!man||SMP.fallback)return fbPick(kit,voice);const L=kv[kit]&&kv[kit][voice];if(!L||!L.length)return null;
    let l=L.find(x=>vel>=x.a&&vel<=x.b);if(!l){let bd=9;for(const x of L){const d=vel<x.a?x.a-vel:vel-x.b;if(d<bd){bd=d;l=x}}}
    let ids=l.ids.filter(id=>bufs[id]);
    if(!ids.length){for(const x of L)for(const id of x.ids)dec(id);for(const x of L){ids=x.ids.filter(id=>bufs[id]);if(ids.length)break}if(!ids.length)return o&&o.strict?null:fbPick(kit,voice)}
    const id=choose(kit+'|'+voice+'|'+l.a+'|'+(o&&o.seq||''),ids);use[id]=now();return out(id)}
  /* an instrument note: the zone covering midi (nearest otherwise), its round robins and the playback rate */
  function zone(inst,midi,vel,o){if(!man||SMP.fallback||!man.instruments)return null;const I=man.instruments[inst];if(!I)return null;if(vel==null)vel=0.8;
    let Z=I.zones.filter(z=>midi>=z.lo&&midi<=z.hi);if(!Z.length){let bd=1e9;for(const z of I.zones){const d=Math.min(Math.abs(midi-z.lo),Math.abs(midi-z.hi));if(d<bd){bd=d;Z=[z]}else if(d===bd)Z.push(z)}}
    const V=Z.filter(z=>!z.vel||vel>=z.vel[0]&&vel<=z.vel[1]);if(V.length)Z=V;
    const ready=Z.filter(z=>bufs[z.id]);if(!ready.length){for(const z of Z)dec(z.id);return null}
    const zz=ready.length===1?ready[0]:(()=>{const id=choose(inst+'|'+midi+'|'+(o&&o.seq||''),ready.map(z=>z.id));return ready.find(z=>z.id===id)})();
    use[zz.id]=now();const r=out(zz.id);return{...r,rate:Math.pow(2,(midi-zz.root)/12),root:zz.root}}
  function release(list){const ids=list?idsOf(list):new Set(Object.keys(bufs).filter(id=>!pinA.has(id)&&!pinB.has(id)));for(const id of ids)drop(id)}
  function sizeOf(list){if(!man)return 0;const p=new Set();for(const id of idsOf(list))p.add(man.sounds[id].pack);let n=0;for(const k of p)if(!(packs[k]&&packs[k].u8))n+=man.packs[k].bytes;return n}
  const SMP={state:'idle',fallback:false,manifest:null,ctx:null,fbKit:{},fbVoice:FBV,capMB,idleMs:45000,
    init,ready,need,pick,zone,release,sizeOf,
    buf(id){const b=bufs[id];if(b){use[id]=now();return b}if(man&&man.sounds[id])dec(id);return null},
    has(id){return!!bufs[id]},known(id){return!!(man&&man.sounds[id])},info(id){return man&&man.sounds[id]||null},
    kit(n){return man&&man.kits[n]||null},inst(n){return man&&man.instruments&&man.instruments[n]||null},
    kits(f){if(!man)return[];return Object.keys(man.kits).filter(k=>{const K=man.kits[k];return!f||K.family===f||(K.genres||[]).includes(f)})},
    get why(){return why},stats(){return{state:SMP.state,fallback:SMP.fallback,why,mode,packs:Object.keys(packs).filter(k=>packs[k].u8).length,decoded:Object.keys(bufs).length,mb:Math.round(bytes/1048576*10)/10,cap:SMP.capMB}}};
  return SMP})();
