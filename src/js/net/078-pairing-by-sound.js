//# net/078-pairing-by-sound.js: pairing by sound (ggwave chirps), the mic meter
/* ---------- Same room, no internet: pairing by sound (Prototype 44) ----------
   Phones in one room pair with no server and no internet: the host's phone chirps its connection offer (ggwave, data over
   sound), a pilot's phone hears it, makes its answer and chirps that back, and the two connect directly over the Wi-Fi by
   WebRTC, the same link as the QR codes (LAN, above). Chirp is the part with no audio or page in it: the message format, the
   checks and the resampling, so the tests can run it in Node. ChirpIO (below) is the microphone and speaker, and the
   chirp... functions the screens.
   A message (bits, most significant first): magic 10 · kind (0 offer, 1 answer) · speed (2: the chirp it went out as,
   audible fastest, fast or normal, or ultrasound fast; the answer uses the same) · slot (3) · tag (8, which offer) ·
   room (5 letters of 5 bits) · how the ICE username and password are spelled (2: base 64 letters 6 bits each, hex 4 bits,
   or bytes) · their lengths (6, 7) · the letters · the DTLS fingerprint (32 bytes) · up to 3 addresses (count 2, then each:
   type 1 (IPv4 or an mDNS name, a UUID of 16 bytes), the address, the port 16), zero bits to a byte, then a CRC-16.
   A Chrome offer with one address is 69 bytes; ggwave carries up to 140 in one chirp. */
const Chirp=(()=>{
  const MAGIC=2,SPEEDS=['fastest','fast','normal','ultra'],ROOM='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',HEX='0123456789abcdef';
  const uuidRe=/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\.local$/i;
  const crc16=b=>{let c=0xFFFF;for(const x of b){c^=x<<8;for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c};
  function writer(){const out=[];let acc=0,n=0;
    const put=(v,bits)=>{for(let i=bits-1;i>=0;i--){acc=(acc<<1)|((v>>>i)&1);if(++n===8){out.push(acc);acc=0;n=0}}};
    return{put,bytes:b=>{for(const x of b)put(x,8)},done(){if(n)put(0,8-n);const c=crc16(out);out.push(c>>8,c&255);return Uint8Array.from(out)}}}
  function reader(b){let i=0;return{get(bits){let v=0;for(let k=0;k<bits;k++){const j=i>>3;if(j>=b.length)throw new Error('short');v=(v<<1)|((b[j]>>(7-(i&7)))&1);i++}return v>>>0},
    bytes(n){const o=[];for(let k=0;k<n;k++)o.push(this.get(8));return o}}}
  /* the host addresses worth sending, best first: home-network IPv4 (192.168, then 10 and 172.16-31), other IPv4, then mDNS
     names; never loopback, link-local or a phone network's shared range (100.64/10) unless nothing else */
  function pickCands(sdp,max){const out=[];
    for(const m of String(sdp).matchAll(/a=candidate:\S+ 1 udp (\d+) (\S+) (\d+) typ host/gi)){const pri=+m[1],a=m[2],port=+m[3];let rank;
      if(/^\d+\.\d+\.\d+\.\d+$/.test(a)){const q=a.split('.').map(Number);if(q[0]===127||q[0]===0||q[0]===169&&q[1]===254)continue;
        rank=q[0]===192&&q[1]===168?0:q[0]===10||q[0]===172&&q[1]>=16&&q[1]<32?1:q[0]===100&&q[1]>=64&&q[1]<128?3:2}
      else if(uuidRe.test(a))rank=2.5;else continue;
      if(!out.some(c=>c.a===a))out.push({a,port,rank,pri})}
    out.sort((x,y)=>x.rank-y.rank||y.pri-x.pri);return out.slice(0,max).map(c=>({a:c.a,port:c.port}))}
  const credForm=s=>/^[0-9a-f]*$/.test(s)?1:/^[A-Za-z0-9+/]*$/.test(s)?0:2;
  /* o: {kind, speed, slot, tag, code, uf, pw, fp ("AB:CD:..."), cands [{a, port}]} -> bytes */
  function pack(o){const w=writer();w.put(MAGIC,2);w.put(o.kind&1,1);w.put(Math.max(0,SPEEDS.indexOf(o.speed)),2);w.put(o.slot&7,3);w.put(o.tag&255,8);
    const code=String(o.code||'').toUpperCase().padEnd(5,'A').slice(0,5);for(const c of code){const k=ROOM.indexOf(c);w.put(k<0?0:k,5)}
    const uf=String(o.uf),pw=String(o.pw);if(uf.length>63||pw.length>127)throw new Error('This browser gave unusually long connection details.');
    const f1=credForm(uf),f2=credForm(pw),form=f1===f2?f1:f1===2||f2===2?2:0;w.put(form,2);w.put(uf.length,6);w.put(pw.length,7);
    for(const ch of uf+pw){if(form===0)w.put(B64.indexOf(ch),6);else if(form===1)w.put(HEX.indexOf(ch),4);else w.put(ch.charCodeAt(0)&255,8)}
    const fp=String(o.fp).split(':').map(h=>parseInt(h,16));if(fp.length!==32||fp.some(x=>!(x>=0&&x<256)))throw new Error('This browser gave an unusual connection fingerprint.');w.bytes(fp);
    const cs=(o.cands||[]).slice(0,3);w.put(cs.length,2);
    for(const c of cs){const u=uuidRe.exec(c.a);if(u){w.put(1,1);const hx=u.slice(1).join('');for(let i=0;i<32;i+=2)w.put(parseInt(hx.substr(i,2),16),8)}else{w.put(0,1);w.bytes(c.a.split('.').map(Number))}w.put(c.port&0xFFFF,16)}
    return w.done()}
  /* bytes -> o, or null if it isn't one of ours or was damaged on the way */
  function unpack(b){b=b instanceof Uint8Array?b:Uint8Array.from(b||[]);if(b.length<40)return null;
    const c=crc16(b.subarray(0,b.length-2));if(c!==(b[b.length-2]<<8|b[b.length-1]))return null;
    try{const r=reader(b.subarray(0,b.length-2));if(r.get(2)!==MAGIC)return null;
      const o={kind:r.get(1),speed:SPEEDS[r.get(2)],slot:r.get(3),tag:r.get(8),code:'',cands:[]};if(!o.speed)return null;for(let k=0;k<5;k++)o.code+=ROOM[r.get(5)];
      const form=r.get(2),nu=r.get(6),np=r.get(7);if(form>2)return null;let s='';
      for(let k=0;k<nu+np;k++)s+=form===0?B64[r.get(6)]:form===1?HEX[r.get(4)]:String.fromCharCode(r.get(8));
      o.uf=s.slice(0,nu);o.pw=s.slice(nu);o.fp=r.bytes(32).map(x=>x.toString(16).toUpperCase().padStart(2,'0')).join(':');
      const n=r.get(2);for(let k=0;k<n;k++){let a;if(r.get(1)){const h=r.bytes(16).map(x=>x.toString(16).padStart(2,'0')).join('');a=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}.local`}
        else a=r.bytes(4).join('.');o.cands.push({a,port:r.get(16)})}
      return o}catch(e){return null}}
  /* streaming linear resampler from the device's rate to ggwave's 48 kHz, in whole 1024-sample frames (ggwave's own
     resampler drops audio unless it is handed exactly the right chunk sizes) */
  function resampler(rate,onFrame,frame=1024){const step=rate/48000,buf=new Float32Array(frame);let pos=0,prev=0,fill=0;
    return chunk=>{let i=pos;const n=chunk.length;
      while(i<n){const k=Math.floor(i),f=i-k,a=k<0?prev:chunk[k],b=k+1<n?chunk[k+1]:null;if(b===null)break;
        buf[fill++]=a+(b-a)*f;if(fill===frame){onFrame(buf);fill=0}i+=step}
      pos=i-n;prev=chunk[n-1]}}
  /* the sound that is played: a soft two-note bell (below the data's band, 1.9 to 6.4 kHz) and the data with short fades */
  function shape(data,rate=48000){const lead=Math.round(0.26*rate),tail=Math.round(0.12*rate),out=new Float32Array(lead+data.length+tail);
    const bell=(f,t0,amp,dec)=>{const s0=Math.round(t0*rate);for(let i=0;s0+i<out.length;i++){const t=i/rate,e=Math.min(1,t/0.004)*Math.exp(-t/dec);if(e<1e-4&&t>0.05)break;
      out[s0+i]+=amp*e*(Math.sin(2*Math.PI*f*t)+0.18*Math.sin(2*Math.PI*f*2*t))}};
    bell(880,0,0.16,0.18);bell(1318.5,0.09,0.13,0.22);
    const fade=Math.round(0.008*rate);for(let i=0;i<data.length;i++){const g=Math.min(1,i/fade,(data.length-1-i)/fade);out[lead+i]+=data[i]*g}
    return out}
  /* how long a chirp of n bytes lasts (s), for the listening windows: start and end markers (16 frames of 1024 samples
     each), the length, then three bytes (with ggwave's error correction) a symbol, plus the bell and the fades */
  const PROTO={fastest:{id:'GGWAVE_PROTOCOL_AUDIBLE_FASTEST',frames:3},fast:{id:'GGWAVE_PROTOCOL_AUDIBLE_FAST',frames:6},normal:{id:'GGWAVE_PROTOCOL_AUDIBLE_NORMAL',frames:9},
    ultra:{id:'GGWAVE_PROTOCOL_ULTRASOUND_FAST',frames:6}};
  const ecc=n=>n<4?2:Math.max(4,2*Math.floor(n/5));
  const seconds=(n,p)=>{const P=PROTO[p]||PROTO.fast,sym=Math.ceil((n+ecc(n))/3);return(2*16+(sym+1)*P.frames)*1024/48000+0.38};
  return{pack,unpack,pickCands,crc16,resampler,shape,seconds,PROTO,SPEEDS,ROOM,uuidRe}})();
/* Pairing diagnostics (Prototype 47), for the race-log export (Options, Settings, Race data, Download all logs or Copy all
   logs), which carries them even with no race recorded: one record a pairing (Host a room, Join, Test sound, or by code),
   the last 8 kept in this browser (hoverline.pairlog). Each has the browser and what it offers (microphone, camera, QR
   reading, WebRTC), the microphone's answer and how long it took, its settings and label, the sample rates of the
   game's audio and of the microphone and which context took it, frames heard, the loudest input (peak and RMS) and the
   room's floor, in-band bursts (chirps detected), chirps decoded and the ones whose check passed, Test sound's result,
   the camera's answer and which QR reader read what, codes shown, scanned, typed and refused, the connections' states,
   errors, and how it ended. Addresses are kept to their first two numbers. Nothing here is sent anywhere. */
const PDG=(()=>{const K='hoverline.pairlog';let cur=null,saveT=0;
  const all=()=>{try{const a=JSON.parse(store.get(K)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
  const t=()=>cur?Math.round((performance.now()-cur.t0)/100)/10:0;
  function save(){clearTimeout(saveT);saveT=0;if(!cur)return;const a=all().filter(x=>x.id!==cur.id);a.push(cur);while(a.length>8)a.shift();store.set(K,JSON.stringify(a))}
  const later=()=>{if(!saveT)saveT=setTimeout(save,1500)};
  function start(role,how){if(cur&&cur.role===role){cur.how+=' then '+how;ev('switched to '+how);return cur}if(cur)end('replaced');
    const n=navigator,md=n.mediaDevices;
    cur={id:Date.now().toString(36)+Math.floor(performance.now()%1000),when:new Date().toISOString(),version:PUBV,role,how,
      browser:{ua:String(n.userAgent||'').slice(0,220),secure:window.isSecureContext!==false,framed,touch:coarse,view:[innerWidth,innerHeight]},
      has:{mic:!!(md&&md.getUserMedia),webrtc:typeof RTCPeerConnection!=='undefined',wasm:typeof WebAssembly==='object',audio:!!(window.AudioContext||window.webkitAudioContext),barcodeDetector:typeof window.BarcodeDetector==='function'},
      mic:null,sound:{sent:0,frames:0,peak:0,rms:0,floorDb:null,bursts:0,decoded:0,ok:0,bad:0,self:0},camera:null,qr:{scans:0,reader:null,found:0,by:null,errors:0},
      codes:{shown:0,scanned:0,typed:0,bad:0},rtc:[],events:[],errors:[],t0:performance.now()};
    try{md.enumerateDevices().then(ds=>{if(!cur)return;cur.has.mics=ds.filter(d=>d.kind==='audioinput').length;cur.has.cameras=ds.filter(d=>d.kind==='videoinput').length;later()}).catch(()=>{})}catch(e){}
    for(const nm of['microphone','camera'])try{n.permissions.query({name:nm}).then(p=>{if(cur){(cur.permission||(cur.permission={}))[nm]=p.state;later()}}).catch(()=>{})}catch(e){}
    try{BarcodeDetector.getSupportedFormats().then(f=>{if(cur){cur.has.barcodeQR=f.includes('qr_code');later()}}).catch(()=>{})}catch(e){}
    later();return cur}
  function ev(e,o){if(!cur)return;if(cur.events.length<150)cur.events.push({t:t(),e,...(o||{})});later()}
  function err(where,e){if(!cur)return;if(cur.errors.length<30)cur.errors.push({t:t(),where,name:e&&e.name||undefined,msg:String(e&&e.message||e).slice(0,200)});later()}
  /* a connection's states, as they change */
  function rtc(pc,via){if(!cur||!pc||cur.rtc.length>=12)return;const r={via,t:t(),states:[]};cur.rtc.push(r);
    const on=()=>{if(r.states.length<24)r.states.push(t()+' '+pc.connectionState+'/'+pc.iceConnectionState);later()};pc.addEventListener('connectionstatechange',on);pc.addEventListener('iceconnectionstatechange',on)}
  function end(how){if(!cur)return null;const d=cur;d.outcome=how;d.secs=t();const st=mp.sess&&mp.sess.state;if(st)d.roster=st.roster.length;delete d.t0;cur=d;save();cur=null;return d}
  const addr=a=>/\.local$/i.test(a)?'mDNS name':String(a).split('.').slice(0,2).join('.')+'.x.x';
  return{start,ev,err,rtc,end,addr,save:later,all(){save();return all()},get cur(){return cur}}})();
/* Pairing by sound, the microphone and speaker (ChirpIO). One ggwave receiver listens to the microphone, resampled to
   48 kHz in whole frames, and hands every message that passes Chirp's CRC to onRx. tx plays a message straight to the
   speaker, past the game's sound settings, so it plays with the game's sound off too. busy() says another phone is
   chirping right now (the chirp's band well over the room's floor for a moment), and startedAfter(t) that one began
   after time t, so nobody talks over anyone.
   ggwave (MIT, Georgi Gerganov, github.com/ggerganov/ggwave, version 0.4.0: about 150 KB with its WebAssembly) sits in the
   page as text (#ggwaveJs) and only runs when pairing starts. The receiver listens for the audible protocols and
   ultrasound fast (which a host only calls with when the page is opened with ?chirp=ultra, for trying it on real phones).
   Prototype 47: meter() is the microphone's level for the meter and the caller's eyes; txLevel() the loudness of the
   chirp playing now (its envelope, taken from the samples), for the caller's jaw; selfTest(speed) plays a short call of
   its own and says whether this device heard it. Every frame, decode and chirp also counts in the pairing record (PDG).
   Test hooks: ?nbtest=1 with window.nbAirTx swaps the sound for the tests' simulated room (window.__nbAir.rx/busy; a
   Test sound call comes back to the device itself unless window.__nbDeaf, and window.__nbLevel stands in for the
   meter); ?nbtap=1 keeps the last chirp played (ChirpIO.last, 48 kHz) so a test can turn it into a WAV. */
const ChirpIO=(()=>{
  const TEST=/[?&]nbtest=1/.test(location.search)&&typeof window.nbAirTx==='function',TAP=/[?&]nbtap=1/.test(location.search),VOL=60;
  let G=null,inst=null,loading=null;
  const io={ctx:null,stream:null,src:null,proc:null,sink:null,onRx:null,onSelf:null,test:null,txUntil:0,txAt:0,env:null,busyT:-1e9,busyOn:-1e9,blipT:-1e9,hot:0,floor:0.003,lv:0,ml:0,mp:0,mpT:0,last:null};
  const can=()=>TEST||!!(window.isSecureContext!==false&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&typeof WebAssembly==='object'&&(window.AudioContext||window.webkitAudioContext)&&document.getElementById('ggwaveJs'));
  function lib(){if(G)return Promise.resolve(G);if(loading)return loading;
    loading=(async()=>{const txt=document.getElementById('ggwaveJs').textContent,m=txt.match(/data:application\/octet-stream;base64,([A-Za-z0-9+/=]+)/);
      const bin=Uint8Array.from(atob(m[1]),c=>c.charCodeAt(0));
      if(typeof window.ggwave_factory!=='function'){const s=document.createElement('script');s.textContent=txt;document.head.appendChild(s);s.remove()}
      const g=await window.ggwave_factory({print(){},printErr(){},wasmBinary:bin});
      for(const k of Object.keys(g.ProtocolId))if(/^GGWAVE_PROTOCOL_/.test(k))try{g.rxToggleProtocol(g.ProtocolId[k],/AUDIBLE|ULTRASOUND_FAST$/.test(k)?1:0)}catch(e){}
      const p=g.getDefaultParameters();p.sampleRateInp=48000;p.sampleRateOut=48000;p.sampleFormatInp=g.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;p.sampleFormatOut=g.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;
      inst=g.init(p);G=g;return g})();
    loading.catch(e=>{loading=null;PDG.err('ggwave',e)});return loading}
  /* the chirp's band (about 1.6 to 7 kHz), for busy() */
  const bq=(()=>{const w=2*Math.PI*3600/48000,al=Math.sin(w)/(2*0.75),a0=1+al;return{b0:al/a0,b2:-al/a0,a1:-2*Math.cos(w)/a0,a2:(1-al)/a0,x1:0,x2:0,y1:0,y2:0}})();
  /* Test sound's own call: HLT and three random bytes (every pairing message starts with the bits 10, never an H) */
  const SELF=[72,76,84];
  /* the meter: the whole band, -66 to -12 dB full scale, with a peak that holds 1.5 s */
  const dbLv=r=>r>1e-7?clamp((20*Math.log10(r)+66)/54,0,1):0;
  function frame(f){const D=PDG.cur&&PDG.cur.sound,now=performance.now();
    let w=0,pk=0;for(let i=0;i<f.length;i++){const x=f[i];w+=x*x;const a=x<0?-x:x;if(a>pk)pk=a}w=Math.sqrt(w/f.length);
    const m=dbLv(w);io.ml=Math.max(m,io.ml*0.9);if(m>=io.mp||now-io.mpT>1500){io.mp=m;io.mpT=now}
    if(D){D.frames++;if(pk>D.peak)D.peak=+pk.toFixed(4);if(w>D.rms)D.rms=+w.toFixed(5)}
    if(G){const r=G.decode(inst,new Int8Array(f.buffer,f.byteOffset,f.length*4));if(r&&r.length){const u=new Uint8Array(r);if(D)D.decoded++;
      if(u[0]===SELF[0]&&u[1]===SELF[1]&&u[2]===SELF[2]){if(D)D.self++;const tt=io.test;if(tt&&u.length===tt.length&&tt.every((x,i)=>u[i]===x)&&io.onSelf)io.onSelf()}
      else{const o=Chirp.unpack(u);if(o){if(D)D.ok++;if(io.onRx)try{io.onRx(o)}catch(e){console.error(e)}}else if(D)D.bad++}}}
    let s=0;const q=bq;for(let i=0;i<f.length;i++){const x=f[i],y=q.b0*x+q.b2*q.x2-q.a1*q.y1-q.a2*q.y2;q.x2=q.x1;q.x1=x;q.y2=q.y1;q.y1=y;s+=y*y}
    const rms=Math.sqrt(s/f.length),mine=now<io.txUntil;
    if(!mine)io.floor=rms<io.floor?Math.max(rms,2e-4):io.floor*1.003;
    // a chirp is in-band sound with no gaps: 3 frames (64 ms) of it in a quiet room; once short bursts (talk, beats) have
    // been heard in the last 10 s, 12 frames (a quarter of a second), so noise doesn't look like another phone answering
    if(!mine&&rms>Math.max(io.floor*6,0.002))io.hot++;else{if(io.hot>=3&&io.hot<12)io.blipT=now;io.hot=0}
    const need=now-io.blipT<10000?12:3;if(io.hot>=need)io.busyT=now;if(io.hot===need){io.busyOn=now;if(D)D.bursts++}
    io.lv=Math.max(rms>io.floor?Math.min(1,Math.log(rms/io.floor)/4):0,io.lv*0.8);if(D&&D.frames%47===1)D.floorDb=Math.round(20*Math.log10(io.floor))}
  /* the microphone, with the phone's call processing off (it would cancel or squash the chirps). Resolves to null, or why not. */
  async function open(){if(TEST){if(PDG.cur)PDG.cur.mic={result:'test room'};return null}if(io.stream)return null;if(!can())return'unsupported';
    const AC=window.AudioContext||window.webkitAudioContext,ctx=io.ctx=audio.ctx||io.ctx||new AC();try{ctx.resume()}catch(e){}
    const lp=lib();lp.catch(()=>{});let st;const t0=performance.now(),M={};if(PDG.cur)PDG.cur.mic=M;
    try{st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1}})}
    catch(e){const n=e&&e.name;M.result=n||'error';M.msg=String(e&&e.message||'').slice(0,160);M.ms=Math.round(performance.now()-t0);PDG.save();
      return n==='NotAllowedError'||n==='SecurityError'||n==='PermissionDeniedError'?'denied':n==='NotFoundError'||n==='OverconstrainedError'||n==='NotReadableError'?'nomic':'denied'}
    M.result='allowed';M.ms=Math.round(performance.now()-t0);
    try{await lp}catch(e){st.getTracks().forEach(t=>t.stop());M.lib=String(e&&e.message||e).slice(0,120);return'lib'}
    try{ctx.resume()}catch(e){}
    const tr=st.getAudioTracks()[0],se=(tr&&tr.getSettings&&tr.getSettings())||{};
    M.track={label:String(tr&&tr.label||'').slice(0,60),sampleRate:se.sampleRate,channels:se.channelCount,echoCancellation:se.echoCancellation,autoGainControl:se.autoGainControl,noiseSuppression:se.noiseSuppression,muted:tr?tr.muted:undefined};
    M.gameRate=ctx.sampleRate;M.gameState=ctx.state;
    // Firefox can't connect a microphone to a context at another sample rate: then the receiver gets a context of its
    // own, at the microphone's rate where the browser says it, else at its default, else at the usual rates in turn
    let rx=ctx;io.stream=st;M.took='the game\'s audio';
    try{io.src=ctx.createMediaStreamSource(st)}catch(e){M.shared=String(e&&e.name||e);io.src=null;
      for(const r of[se.sampleRate,0,48000,44100,32000,16000,96000]){if(r===undefined||r===null)continue;let c=null;
        try{c=r?new AC({sampleRate:r}):new AC();io.src=c.createMediaStreamSource(st);rx=io.rxCtx=c;M.took='its own context'+(r?' at '+r+' Hz':'');break}catch(e2){if(c)try{c.close()}catch(_){}}}
      if(!io.src){M.took='none';close();PDG.save();return'unsupported'}
      try{rx.resume()}catch(e){}}
    M.rate=rx.sampleRate;
    io.proc=rx.createScriptProcessor(2048,1,1);io.sink=rx.createGain();io.sink.gain.value=0;
    const rs=Chirp.resampler(rx.sampleRate,frame);io.proc.onaudioprocess=e=>rs(e.inputBuffer.getChannelData(0));
    io.src.connect(io.proc);io.proc.connect(io.sink);io.sink.connect(rx.destination);io.floor=0.003;io.busyT=-1e9;io.ml=io.mp=0;
    // no audio arriving 1.5 s on (a context the browser keeps suspended): ask it again, and note it in the record
    setTimeout(()=>{const D=PDG.cur&&PDG.cur.sound;if(io.proc&&D&&!D.frames){M.noFrames=rx.state;PDG.ev('no microphone frames',{state:rx.state});try{rx.resume()}catch(e){}}},1500);
    PDG.save();return null}
  function close(){if(io.play){try{io.play.stop()}catch(e){}io.play=null;io.txUntil=0}mic()}
  function mic(){if(io.proc){io.proc.onaudioprocess=null;try{io.src.disconnect();io.proc.disconnect();io.sink.disconnect()}catch(e){}}
    if(io.stream)io.stream.getTracks().forEach(t=>t.stop());if(io.rxCtx)try{io.rxCtx.close()}catch(e){}io.stream=io.src=io.proc=io.sink=io.rxCtx=null;io.lv=io.ml=io.mp=0}
  const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  /* the loudness of a chirp through its length (120 a second, the loudest 1), for the caller's jaw */
  const envOf=s=>{const W=400,n=Math.ceil(s.length/W),e=new Float32Array(n);let mx=1e-6;for(let i=0;i<n;i++){let a=0;const z=Math.min(s.length,(i+1)*W);for(let j=i*W;j<z;j++)a+=s[j]*s[j];e[i]=Math.sqrt(a/W);if(e[i]>mx)mx=e[i]}for(let i=0;i<n;i++)e[i]/=mx;return e};
  const envTest=d=>{const n=Math.ceil(d*120),e=new Float32Array(n);for(let i=0;i<n;i++){const t=i/120;e[i]=t<0.26?0.6*Math.exp(-t/0.12):t>d-0.12?0.15:0.78+0.22*Math.sin(i*1.3)*Math.sin(i*0.21)}return e};
  /* play one message; resolves when it has finished playing */
  async function tx(bytes,speed){speed=Chirp.PROTO[speed]?speed:'fast';const D=PDG.cur&&PDG.cur.sound;if(D)D.sent++;
    if(TEST){const d=Chirp.seconds(bytes.length,speed);io.env=envTest(d);io.txAt=performance.now();io.txUntil=io.txAt+d*1000;
      if(bytes===io.test){if(!window.__nbDeaf)setTimeout(()=>{if(D)D.self++;if(io.onSelf)io.onSelf()},d*1000-100)}else window.nbAirTx(hex(bytes),speed,d);
      await new Promise(r=>setTimeout(r,d*1000));return}
    const g=await lib(),ctx=io.ctx||audio.ctx;if(!ctx)return;
    const s=Chirp.shape(new Float32Array(new Int8Array(g.encode(inst,bytes,g.ProtocolId[Chirp.PROTO[speed].id],VOL)).buffer));if(TAP)io.last=s;io.env=envOf(s);
    try{ctx.resume()}catch(e){}
    const b=ctx.createBuffer(1,s.length,48000);b.getChannelData(0).set(s);const src=ctx.createBufferSource(),gn=ctx.createGain();gn.gain.value=0.9;
    src.buffer=b;src.connect(gn);gn.connect(ctx.destination);const d=s.length/48000;io.txUntil=performance.now()+(d+0.15)*1000;src.start();io.play=src;
    io.txAt=performance.now()+((ctx.outputLatency||ctx.baseLatency||0)*1000);
    await new Promise(r=>{src.onended=r;setTimeout(r,(d+0.4)*1000)});if(io.play===src)io.play=null}
  /* Test sound: a short call of its own, then up to 1.2 s to hear it */
  async function selfTest(speed){const msg=Uint8Array.from([...SELF,...crypto.getRandomValues(new Uint8Array(3))]);let heard=false;io.test=msg;io.onSelf=()=>{heard=true};
    try{await tx(msg,speed);const t0=performance.now();while(!heard&&performance.now()-t0<1200)await new Promise(r=>setTimeout(r,60))}finally{io.onSelf=null;io.test=null}return heard}
  if(TEST)window.__nbAir={rx(h){const b=new Uint8Array(h.length/2);for(let i=0;i<b.length;i++)b[i]=parseInt(h.substr(i*2,2),16);const o=Chirp.unpack(b);if(o&&io.onRx)io.onRx(o)},busy(ms){io.busyOn=performance.now();io.busyT=io.busyOn+ms-200}};
  return{can,open,close,tx,lib,selfTest,get last(){return io.last},set onRx(f){io.onRx=f},
    busy:()=>performance.now()-io.busyT<200&&performance.now()>io.txUntil,startedAfter:t=>io.busyOn>t,sending:()=>performance.now()<io.txUntil,level:()=>io.lv,
    isOpen:()=>TEST||!!io.stream,
    meter:()=>TEST?{lv:+window.__nbLevel||0,pk:+window.__nbLevel||0}:{lv:io.ml,pk:io.mp},
    txLevel(){const now=performance.now();if(!io.env||now>io.txUntil)return 0;const i=Math.floor((now-io.txAt)/1000*120);return i<0?0:Math.pow(io.env[Math.min(io.env.length-1,i)]||0,0.7)},
    async reopen(){mic();return open()},get test(){return TEST}}})();

/* Pairing by sound, the screens.
   Host: Host a room opens the room (the same Wi-Fi room as the codes) and keeps calling: it chirps an invitation for the
   next pilot, then listens long enough for a pilot to wait its turn and answer. The calls alternate between ggwave's
   fastest audible protocol (about 3 s) and its fast one (about 5 s, which carries through echoey rooms); the answer comes
   back at the speed it was called at. Each call carries a slot and a tag; when an answer for a tag it still holds arrives
   the host connects that pilot, and an answer to the current call has it call with a new tag at once. It stops when a race
   starts or the room is full; Add pilots starts it again. Under the sound box the host can show the invitation as a code
   and take a reply by scan or typing (Prototype 47), for a pilot who can't hear it or isn't heard.
   Pilot: Join listens. On hearing a call it makes its answer, waits a random 0.35 to 2 s (holding back if another phone
   starts chirping first) and chirps it, and shows the same reply as a code. If the host calls again with the same tag, the
   answer was lost: it plays the same answer again (a fresh one only if its connection has failed, Prototype 47). A new
   tag means the host took another pilot: it answers that one. The host's addresses go into its connection only after its
   answer has played, so the checks start as the host hears it. An invitation scanned or typed instead (Prototype 47) is
   answered by sound at once, then every 9 s up to four times, with the host's addresses in at once as a code's are. Once
   the link to the host is open it joins the room's lobby. Neither side can read anything but its own kind of message, so
   a phone ignores its own chirps.
   Test sound (Prototype 47): this device plays a short call of its own and listens for it, with the meter running. */
const ULTRA=/[?&]chirp=ultra/.test(location.search);
const HOTSPOT='Heard, but can\'t connect. Check the devices are on the same Wi-Fi. Some Wi-Fi keeps devices apart: try a phone\'s hotspot.';
const chirp={role:null,mode:null,pair:store.get('hoverline.pair')==='qr'?'qr':'sound',loop:0,offer:null,tag:-1,cycle:0,fresh:false,
  g:null,old:null,heardAt:0,startAt:0,tick:null,ducked:false,musV:1,wait:null,raf:0};
const ch$=id=>document.getElementById(id),chirpWait=ms=>new Promise(r=>setTimeout(r,ms));
/* pairing's own random numbers, so it never draws from Math.random (the race simulator seeds that) */
const chirpRnd=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
ChirpIO.onRx=o=>{if(chirp.mode==='host')chirpHostRx(o);else if(chirp.mode==='guest')chirpGuestRx(o,'sound')};
/* the music dips under the pairing (the game's music volume node, restored after) */
function chirpDuck(on){if(chirp.ducked===on||!audio.musG||!audio.ctx)return;chirp.ducked=on;const g=audio.musG.gain,t=audio.ctx.currentTime;
  if(on)chirp.musV=g.value;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.setTargetAtTime(on?chirp.musV*0.12:chirp.musV,t,on?0.12:0.35)}
function chirpSay(t){ch$('chirpMsg').textContent=t||''}
/* the steps by sound, as the screens say them */
const CH_HOST=['<b>Invite</b> · this device calls the invitation out loud. Pilots tap <b>Join</b> and hold their device near it.','<b>Reply</b> · each pilot\'s device answers the same way.','<b>Lobby</b> · pilots appear below as they connect. Press Done when everyone is in.'];
const CH_GUEST=['<b>Invitation</b> · hold this device near the host\'s while it calls.','<b>Reply</b> · this device answers out loud, and shows its reply as a code too.','<b>Lobby</b> · you\'re in as soon as the host has your reply.'];
const CH_TEST=['<b>Listen</b> · the bar shows what this device\'s microphone hears. Talk or clap: it should move.','<b>Call</b> · it plays a short call and listens for it. Volume up.'];
function chirpUI(kind,title,steps){const box=ch$('chirpBox');box.hidden=!kind;box.dataset.kind=kind||'';
  ch$('chirpDone').hidden=!(kind==='host'&&mp.sess||kind==='test');ch$('chirpCancel').hidden=kind==='test'||kind==='host'&&!!mp.sess;
  const q=ch$('chirpQR');q.hidden=kind==='test'||kind==='fail'&&chirp.role==='test';q.classList.toggle('go',kind==='fail');chirpCodeBtn();
  mpEl.mpOut.hidden=kind==='guest'||kind==='fail'||kind==='test'||!!mp.sess;
  if(title!=null)ch$('chirpTitle').textContent=title;if(steps!=null)ch$('chirpSteps').innerHTML=steps;
  clearInterval(chirp.tick);chirp.tick=kind?setInterval(chirpTick,120):null;if(kind){chirpTick();priestRun()}}
function chirpTick(){ch$('chirpMeter').hidden=!(chirp.mode&&ChirpIO.isOpen());
  if(chirp.mode!=='guest')return;const now=performance.now(),g=chirp.g;
  // an answer the host hasn't taken 3 s after it played: the reply shows as a code too
  if(g&&g.sentAt&&!g.done&&now-g.sentAt>3000)chirpCodeOpen(true);
  if(g&&g.sentAt&&!g.done&&now-g.sentAt>12000&&!g.hinted){g.hinted=true;chirpSay('Not connected yet. The host can scan or type the reply below. If it already has, check both are on the same Wi-Fi: some Wi-Fi keeps devices apart, so try a phone\'s hotspot.')}
  else if(!chirp.heardAt&&!g&&now-chirp.startAt>20000&&!chirp.deaf){chirp.deaf=true;chirpCodeOpen(true);chirpSay('Can\'t hear the host? Turn both devices\' volume up and hold them close, or take the host\'s code below.')}}
/* the third button: on the sound screens Use a code (opens the code box under it) or Hide the code; after a failure, Use
   codes; before a room is open, Codes only */
function chirpCodeBtn(){const k=ch$('chirpBox').dataset.kind;ch$('chirpQR').textContent=k==='fail'?'Use codes':lan.helper?(lan.open?'Hide the code':'Use a code'):'Codes only'}
function chirpCodeOpen(on){if(!lan.helper||lan.open===on)return;lan.open=on;lanShow(on);chirpCodeBtn();PDG.ev(on?'code box opened':'code box closed');if(on)try{$('lanBox').scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}
/* The caller (Prototype 47): a hooded machine-priest drawn in the game's line style while pairing by sound, our own
   design: a tall faceted cowl over a plain face plate, two lens eyes, a hinged grille jaw, a collar and a small pendant.
   Calling, the jaw opens with the chirp's own loudness (ChirpIO.txLevel), the head shakes with it and lines of voice leave
   the mouth; listening, the mouth rests and the eyes glow with what the microphone hears. Strokes take the canvas's CSS
   colour (and --glow, --voice), so it reads on a dark panel or a light one. A 140 by 120 drawing, scaled to the canvas. */
const PRIEST={hood:[[32,118],[37,86],[45,54],[57,26],[70,8],[83,24],[95,52],[103,84],[108,118]],cav:[[50,99],[50,60],[57,38],[70,27],[83,38],[90,60],[90,99]],
  folds:[[70,8,70,27],[57,26,57,38],[83,24,83,38],[45,54,50,60],[95,52,90,60],[37,86,50,99],[103,84,90,99]]};
function priestDraw(cv,s){const g=cv&&cv.getContext&&cv.getContext('2d');if(!g)return;const dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||120,H=cv.clientHeight||103;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  const cs=getComputedStyle(cv),ink=cs.color||'#f2efe6',glow=cs.getPropertyValue('--glow').trim()||'#3ff0ff',voice=cs.getPropertyValue('--voice').trim()||'#ffb000';
  // the face sits in the hood's shadow, so on a light panel (dark strokes) it is drawn light
  const rgb=(ink.match(/\d+(\.\d+)?/g)||[242,239,230]).map(Number),face=(0.3*rgb[0]+0.59*rgb[1]+0.11*rgb[2])<128?'#e6e2d6':ink;
  const k=Math.min(cv.width/140,cv.height/120),jaw=clamp(s.jaw||0,0,1),sh=s.still?0:Math.sin(s.t*53)*jaw*1.1,bob=s.still||s.tx?0:Math.sin(s.t*1.7)*0.9,o=jaw*17,up=jaw*4;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(k,0,0,k,(cv.width-140*k)/2+sh*k,(cv.height-120*k)/2+bob*k);
  g.lineJoin='round';g.lineCap='round';g.strokeStyle=ink;g.lineWidth=1.7;g.globalAlpha=1;
  const path=(p,close)=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath()};
  // the face in shadow, the cowl, its folds
  path(PRIEST.cav,true);g.fillStyle='rgba(4,6,10,.84)';g.fill();path(PRIEST.hood);g.stroke();path(PRIEST.cav);g.stroke();
  g.globalAlpha=0.5;g.beginPath();for(const[a,b,c,d]of PRIEST.folds){g.moveTo(a,b);g.lineTo(c,d)}g.stroke();g.globalAlpha=1;
  // the face plate (brow, nose ridge, cheek line), lifting a little as the jaw drops
  g.strokeStyle=face;const U=y=>y-up;g.beginPath();g.moveTo(56,U(49));g.lineTo(84,U(49));g.moveTo(70,U(49));g.lineTo(70,U(63));g.moveTo(55,U(66));g.lineTo(60,U(70));g.lineTo(80,U(70));g.lineTo(85,U(66));g.stroke();
  // the mouth, open as far as the call is loud, lit from inside, and the hinged jaw with its grille
  const m0=U(70.5),m1=70.5+o;
  if(m1-m0>1.2){path([[58,m0],[82,m0],[80,m1],[60,m1]],true);g.fillStyle='rgba(0,0,0,.94)';g.fill();
    g.save();g.globalAlpha=Math.min(1,jaw*1.25)*0.55;g.fillStyle=voice;g.shadowColor=voice;g.shadowBlur=8*k*jaw;path([[62,m0+2],[78,m0+2],[76.5,m1-2],[63.5,m1-2]],true);g.fill();g.restore()}
  path([[56,U(68)],[59,80+o],[70,85+o],[81,80+o],[84,U(68)]]);g.stroke();
  g.globalAlpha=0.75;g.beginPath();for(const x of[64,70,76]){g.moveTo(x,m0-0.5);g.lineTo(x,m0+2.5);g.moveTo(x,m1+3.5);g.lineTo(x,m1+7.5)}g.stroke();g.globalAlpha=1;g.strokeStyle=ink;
  // the eyes: two lenses that glow
  const e=clamp(s.eyes==null?0.3:s.eyes,0,1);g.save();g.fillStyle=glow;g.shadowColor=glow;g.shadowBlur=(1+9*e)*k;g.globalAlpha=0.25+0.75*e;
  for(const x of[62,78]){g.beginPath();g.arc(x,U(57),2.6+0.8*e,0,TAU);g.fill()}g.restore();
  // collar and pendant
  path([[42,105],[56,101],[84,101],[98,105]]);g.stroke();path([[70,107],[73.5,111.5],[70,116],[66.5,111.5]],true);g.stroke();
  // the voice
  if(s.tx&&jaw>0.04){g.strokeStyle=voice;g.lineWidth=2.1;for(let i=0;i<3;i++){const ph=(s.t*1.8+i/3)%1,r=40+ph*24;g.globalAlpha=Math.min(1,jaw*1.15)*(1-ph);
    for(const a0 of[0,Math.PI]){g.beginPath();g.arc(70,(m0+m1)/2,r,a0-0.4,a0+0.4);g.stroke()}}g.globalAlpha=1}}
/* the caller and the meter move with every frame while the box shows */
function priestRun(){if(chirp.raf)return;let still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  const step=t=>{const box=ch$('chirpBox');if(box.hidden){chirp.raf=0;return}chirp.raf=requestAnimationFrame(step);
    const m=ChirpIO.meter(),tx=ChirpIO.sending();
    priestDraw(ch$('chirpWave'),{t:t/1000,still,tx,jaw:tx?ChirpIO.txLevel():0,eyes:!chirp.mode?0.08:tx?1:0.18+0.82*m.lv});
    const mb=ch$('chirpMeter');if(!mb.hidden){mb.style.setProperty('--lv',m.lv.toFixed(3));mb.style.setProperty('--pk',m.pk.toFixed(3))}};
  chirp.raf=requestAnimationFrame(step)}
/* the microphone, saying so if the browser is still asking after 2.5 s (a prompt by the address bar is easy to miss) */
async function chirpOpen(){const tm=setTimeout(()=>{if(!ChirpIO.isOpen())chirpSay('Allow the microphone: the browser is asking (at the top of the screen, or by the address bar).')},2500);
  const why=await ChirpIO.open();clearTimeout(tm);if(!why&&/^Allow the microphone/.test(ch$('chirpMsg').textContent))chirpSay('');return why}
function chirpFail(why,role){chirp.mode=null;ChirpIO.close();chirpDuck(false);chirp.role=role;if(lan.helper)lanStop();PDG.ev('no sound',{why});
  chirpUI('fail',why==='denied'?'The microphone is blocked':why==='nomic'?'No microphone found':'Sound pairing can\'t start here',
    `<p class="small">${why==='denied'?'Allow it and try again, or use codes: one device shows a code, the other scans or types it.':'Use codes instead: one device shows a code, the other scans or types it.'}</p>`);chirpSay('')}
/* stop listening and calling, and put the screen back (keep: the pairing record carries on, as when switching to codes) */
function chirpStop(keep){chirp.mode=null;chirp.loop++;chirp.offer=null;chirp.wait=null;ChirpIO.close();chirpDuck(false);
  for(const g of[chirp.g,chirp.old])if(g&&!g.done)chirpDrop(g);chirp.g=chirp.old=null;
  if(lan.helper)lanStop();
  const box=ch$('chirpBox');if(!box.hidden){box.hidden=true;clearInterval(chirp.tick);chirp.tick=null;mpEl.mpOut.hidden=!!mp.sess}chirpSay('');
  const st=mp.sess&&mp.sess.state;$('lanAdd').hidden=!(st&&st.isHost&&st.link&&st.link.carrier==='lan');
  if(!keep&&!lan.mode)PDG.end(st&&st.isHost?'host stopped':'stopped')}
function chirpDrop(g){g.done=true;clearInterval(g.retry);try{g.pc&&g.pc.close()}catch(e){}}
/* the code box under the sound box (Use a code): the host's invitation and a place for replies; a pilot's place for the
   host's code, then its own reply (and the camera, if it was looking, stops) */
function chirpHelp(){if(!lan.helper)return;
  if(lan.mode==='host'){const f=chirp.offer;let c=null;try{c=f?LAN.code({...f,kind:0}):null}catch(e){}
    lanUI({title:'By code',note:'A pilot who can\'t hear the call scans or types this code. A reply you didn\'t hear: scan it or type it here.',code:c,scan:'Scan a reply',input:'type a pilot\'s reply'})}
  else if(lan.mode==='guest'){const g=chirp.g;
    if(g&&g.bytes){if(lan.scanning)lanCamOff();lanUI({title:'Your reply, as a code',note:'The host hasn\'t taken it by sound yet: it can scan or type it.',code:LAN.codeOf(g.bytes)})}
    else lanUI({title:'By code',note:'Can\'t hear the host? Scan or type the code on the host\'s screen.',scan:'Scan the host\'s code',input:'type the host\'s code'})}}
