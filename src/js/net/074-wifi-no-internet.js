//# net/074-wifi-no-internet.js: Wi-Fi with no internet: the local host pack
/* ---------- Wi-Fi with no internet (Prototype 31) ----------
   Phones, tablets and computers on one Wi-Fi race each other directly over WebRTC data channels, with no server at all,
   so it works from itch.io, the offline file, anywhere. With no server the two ends swap their connection details by
   hand, once each way: the host shows a code (a QR code, or text), a pilot scans it and shows a reply code, the host scans
   that, and they are connected. The host relays everything (a star), so the host must stay in the room.
   A code carries the room, a tag naming the host's offer, the ICE username and password, the DTLS fingerprint and the
   device's local addresses; everything else in the session description is the same for every connection, so it is
   rebuilt from a template at the other end. */
/* QR codes (byte mode, error correction level M, versions 1-20), after Project Nayuki's QR Code generator (MIT).
   qr(text) gives a square array of rows of booleans (true = dark), without the quiet zone. */
const QR=(()=>{
  const ECC=[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26],BLK=[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16];
  const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z};
  const divisor=n=>{const r=new Array(n).fill(0);r[n-1]=1;let root=1;for(let i=0;i<n;i++){for(let j=0;j<n;j++){r[j]=mul(r[j],root);if(j+1<n)r[j]^=r[j+1]}root=mul(root,2)}return r};
  const remainder=(data,div)=>{const r=div.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>r[i]^=mul(c,f))}return r};
  const rawModules=v=>{let r=(16*v+128)*v+64;if(v>=2){const na=Math.floor(v/7)+2;r-=(25*na-10)*na-55;if(v>=7)r-=36}return r};
  const dataCodewords=v=>Math.floor(rawModules(v)/8)-ECC[v]*BLK[v];
  const alignPos=v=>{if(v===1)return[];const na=Math.floor(v/7)+2,size=v*4+17,step=Math.floor((v*8+na*3+5)/(na*4-4))*2,r=[6];for(let p=size-7;r.length<na;p-=step)r.splice(1,0,p);return r};
  /* Prototype 47: text of capitals, digits and a few marks goes in alphanumeric mode (two letters in 11 bits, not 16), so a
     pairing code is a version 5 or 6 symbol (37 or 41 modules a side) instead of 7 or 8: bigger squares, easier to scan */
  const AN='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  return function qr(text,forceMask){
    const an=/^[0-9A-Z $%*+\-./:]+$/.test(text),bytes=an?null:[...new TextEncoder().encode(text)],nc=an?text.length:bytes.length;let v=1;
    const need=v=>4+(an?(v<10?9:11):(v<10?8:16))+(an?11*(nc>>1)+6*(nc&1):nc*8);
    for(;v<=20;v++){if(need(v)<=dataCodewords(v)*8)break}if(v>20)throw new Error('too long for a QR code');
    const bits=[],put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
    if(an){put(2,4);put(nc,v<10?9:11);for(let i=0;i+1<nc;i+=2)put(AN.indexOf(text[i])*45+AN.indexOf(text[i+1]),11);if(nc&1)put(AN.indexOf(text[nc-1]),6)}
    else{put(4,4);put(nc,v<10?8:16);for(const b of bytes)put(b,8)}
    const cap=dataCodewords(v)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
    const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let k=0;k<8;k++)b=(b<<1)|bits[i+k];data.push(b)}
    /* error correction blocks, interleaved */
    const nb=BLK[v],el=ECC[v],raw=Math.floor(rawModules(v)/8),nShort=nb-raw%nb,shortLen=Math.floor(raw/nb),div=divisor(el),blocks=[];
    for(let i=0,k=0;i<nb;i++){const d=data.slice(k,k+shortLen-el+(i<nShort?0:1));k+=d.length;const e=remainder(d,div);if(i<nShort)d.push(0);blocks.push(d.concat(e))}
    const cw=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-el||j>=nShort)cw.push(b[i])});
    /* the modules: function patterns first */
    const size=v*4+17,M=[],F=[];for(let y=0;y<size;y++){M.push(new Array(size).fill(false));F.push(new Array(size).fill(false))}
    const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
    for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
    for(const[cx,cy]of[[3,3],[size-4,3],[3,size-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy,d=Math.max(Math.abs(dx),Math.abs(dy));if(x>=0&&x<size&&y>=0&&y<size)set(x,y,d!==2&&d!==4)}
    const ap=alignPos(v),na=ap.length;for(let i=0;i<na;i++)for(let j=0;j<na;j++){if(i===0&&j===0||i===0&&j===na-1||i===na-1&&j===0)continue;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(ap[i]+dx,ap[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
    const format=mask=>{const d=(0<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412,g=i=>((b>>>i)&1)===1;
      for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
      for(let i=0;i<8;i++)set(size-1-i,8,g(i));for(let i=8;i<15;i++)set(8,size-15+i,g(i));set(8,size-8,true)};
    format(0);
    if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;for(let i=0;i<18;i++){const d=((b>>>i)&1)===1,a=size-11+i%3,c=Math.floor(i/3);set(a,c,d);set(c,a,d)}}
    /* the data, in the zigzag */
    let i=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;
      if(!F[y][x]&&i<cw.length*8){M[y][x]=((cw[i>>>3]>>>(7-(i&7)))&1)===1;i++}}}
    /* the mask with the lowest penalty (runs, blocks and balance) */
    const inv=(m,x,y)=>[(x+y)%2,y%2,x%3,(x+y)%3,(Math.floor(x/3)+Math.floor(y/2))%2,x*y%2+x*y%3,(x*y%2+x*y%3)%2,((x+y)%2+x*y%3)%2][m]===0;
    const apply=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!F[y][x]&&inv(m,x,y))M[y][x]=!M[y][x]};
    const penalty=()=>{let p=0,dark=0;for(let a=0;a<2;a++)for(let y=0;y<size;y++){let run=1;for(let x=1;x<=size;x++){const c=x<size&&(a?M[x][y]:M[y][x])===(a?M[x-1][y]:M[y][x-1]);if(c)run++;else{if(run>=5)p+=run-2;run=1}}}
      for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
      for(const row of M)for(const c of row)if(c)dark++;return p+10*Math.floor(Math.abs(dark*20-size*size*10)/(size*size))};
    let best=forceMask,bp=1e9;if(best==null)for(let m=0;m<8;m++){apply(m);format(m);const pp=penalty();if(pp<bp){bp=pp;best=m}apply(m)}
    apply(best);format(best);return M}})();

const LAN=(()=>{
  const B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const b32=bytes=>{let o='',v=0,n=0;for(const b of bytes){v=(v<<8|b)&0xFFFF;n+=8;while(n>=5){o+=B32[(v>>>(n-5))&31];n-=5}}if(n)o+=B32[(v<<(5-n))&31];return o};
  const unb32=t=>{const o=[];let v=0,n=0;for(const c of t.toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1')){const k=B32.indexOf(c);if(k<0)continue;v=(v<<5|k)&0xFFFF;n+=5;if(n>=8){o.push((v>>>(n-8))&255);n-=8}}return o};
  const uuidRe=/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\.local$/i;
  /* the parts of a session description that differ between connections */
  function fromSdp(sdp){const g=re=>(sdp.match(re)||[])[1]||'',o={uf:g(/a=ice-ufrag:(\S+)/),pw:g(/a=ice-pwd:(\S+)/),fp:g(/a=fingerprint:sha-256 (\S+)/i),cands:[]};
    for(const m of sdp.matchAll(/a=candidate:\S+ 1 udp \d+ (\S+) (\d+) typ host/gi)){const a=m[1],port=+m[2];if(/^\d+\.\d+\.\d+\.\d+$/.test(a)||uuidRe.test(a))if(!o.cands.some(c=>c.a===a))o.cands.push({a,port})}
    o.cands.sort((x,y)=>(uuidRe.test(x.a)?1:0)-(uuidRe.test(y.a)?1:0));o.cands=o.cands.slice(0,2);return o}
  function toSdp(o,setup){return['v=0','o=- '+(1e9+crypto.getRandomValues(new Uint32Array(1))[0]%1e9)+' 2 IN IP4 127.0.0.1','s=-','t=0 0','a=group:BUNDLE 0','a=msid-semantic: WMS','m=application 9 UDP/DTLS/SCTP webrtc-datachannel','c=IN IP4 0.0.0.0',
    ...o.cands.map((c,i)=>`a=candidate:${i+1} 1 udp ${2122260223-i*256} ${c.a} ${c.port} typ host generation 0`),'a=ice-ufrag:'+o.uf,'a=ice-pwd:'+o.pw,'a=ice-options:trickle','a=fingerprint:sha-256 '+o.fp,
    'a=setup:'+setup,'a=mid:0','a=sctp-port:5000','a=max-message-size:262144',''].join('\r\n')}
  /* a code (Prototype 47): HL, then base 32 of the same message a chirp carries (Chirp.pack: kind, room, tag, the ICE
     username and password, the DTLS fingerprint and one or two addresses, with a CRC-16), so a slip in typing is caught
     and the code is about a fifth shorter: 111 letters for a reply, 120 for an invitation with two addresses, shown in
     groups of five. "HL" may be left off when typing; O reads as 0, I and L as 1. Codes from Prototypes 31 to 46 (raw
     bytes, no check) still read. */
  function pack(o){return'HL'+b32(Chirp.pack({speed:'fastest',slot:0,...o}))}
  const codeOf=bytes=>'HL'+b32(bytes);
  const clean=text=>{const t=String(text||'').toUpperCase().replace(/[^0-9A-Z]/g,'');return t.startsWith('HL')?t:'HL'+t};
  function unpack(text){const B=unb32(clean(text).slice(2)),o=B.length>=40?Chirp.unpack(Uint8Array.from(B)):null;return o||unpackOld(B)}
  function unpackOld(B){let i=0;const rd=()=>{if(i>=B.length)throw 0;return B[i++]};
    try{if(rd()!==1)return null;const o={kind:rd(),code:'',cands:[]};for(let k=0;k<5;k++)o.code+=String.fromCharCode(rd());o.code=o.code.replace(/\?/g,'');o.tag=rd()<<8|rd();
      const str=()=>{const n=rd(),e=[];for(let k=0;k<n;k++)e.push(rd());return new TextDecoder().decode(new Uint8Array(e))};o.uf=str();o.pw=str();
      const fp=[];for(let k=0;k<32;k++)fp.push(rd().toString(16).toUpperCase().padStart(2,'0'));o.fp=fp.join(':');
      const nc=rd();for(let k=0;k<nc;k++){const ty=rd();let a;if(ty===16){let h='';for(let q=0;q<16;q++)h+=rd().toString(16).padStart(2,'0');a=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}.local`}else{const q=[];for(let z=0;z<4;z++)q.push(rd());a=q.join('.')}o.cands.push({a,port:rd()<<8|rd()})}
      return o}catch(e){return null}}
  /* one slip in typing (a wrong, missing or extra letter) is put right where exactly one such change gives a code that
     checks out and fits (fits: on the host, a reply for this room to an invitation still open). A CRC alone would let one
     in twenty wrong guesses through over the 7,000 tried; the room and the tag make that about one in a million. */
  function repair(text,fits){const t=clean(text).slice(2);if(t.length<80||t.length>150)return null;const seen=new Set(),hits=[];
    const test=(u,at)=>{if(hits.length>1||seen.has(u))return;seen.add(u);const B=unb32(u);if(B.length<40)return;const o=Chirp.unpack(Uint8Array.from(B));if(o&&fits(o))hits.push({o,at})};
    for(let i=0;i<t.length;i++){for(const c of B32)if(c!==t[i])test(t.slice(0,i)+c+t.slice(i+1),i);test(t.slice(0,i)+t.slice(i+1),i)}
    for(let i=0;i<=t.length;i++)for(const c of B32)test(t.slice(0,i)+c+t.slice(i),i);
    return hits.length===1?{o:hits[0].o,group:Math.floor((hits[0].at+2)/5)+1}:null}
  /* why a code didn't read, in a line */
  function why(text){const n=clean(text).length-2;return n<90?`That code is too short (${n} letters): it has about 110.`:n>140?'That is longer than a Hoverline code: check nothing else was pasted with it.':'That code has a slip in it somewhere: check it against the screen, five letters at a time.'}
  const gather=pc=>new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,3000);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})});
  const newId=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>(n%36).toString(36)).join('');
  const L={role:null,code:null,id:null,handlers:null,guests:new Map(),pending:new Map(),host:null,onChange:null};
  const send=(ch,d)=>{if(ch&&ch.readyState==='open')try{ch.send(JSON.stringify(d))}catch(e){}};
  const bcast=(d,except)=>{for(const[id,ch]of L.guests)if(id!==except)send(ch,d)};
  /* host: a fresh offer for the next pilot (a few stay valid, so a pilot who scanned an older one can still be added) */
  async function offer(opt){const pc=new RTCPeerConnection({iceServers:[]}),ch=pc.createDataChannel('hl',{ordered:true}),tag=opt&&opt.tag!=null?opt.tag&255:(()=>{for(let k=0;k<32;k++){const t=crypto.getRandomValues(new Uint8Array(1))[0];if(!L.pending.has(t))return t}return 0})();let gid=null;
    ch.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(x){return}
      if(d.t==='_hi'&&!gid){gid=String(d.id).slice(0,16);L.guests.set(gid,ch);send(ch,{t:'_hello',host:L.id,peers:[...L.guests.keys()].filter(x=>x!==gid)});bcast({t:'_join',id:gid},gid);L.handlers&&L.handlers.onPeer&&L.handlers.onPeer(gid);L.onChange&&L.onChange('joined')}
      else if(d.t==='_m'&&gid){L.handlers&&L.handlers.onMessage&&L.handlers.onMessage(d.m,gid);bcast({t:'_m',m:d.m,from:gid},gid)}};
    const gone=()=>{if(!gid||L.guests.get(gid)!==ch)return;L.guests.delete(gid);bcast({t:'_leave',id:gid});L.handlers&&L.handlers.onLeave&&L.handlers.onLeave(gid);L.onChange&&L.onChange('left')};
    ch.onclose=gone;pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'||pc.connectionState==='closed')gone()};
    await pc.setLocalDescription(await pc.createOffer());await gather(pc);
    const o=fromSdp(pc.localDescription.sdp);L.pending.set(tag,{pc});for(const[k,p]of L.pending)if(L.pending.size>4&&k!==tag){try{p.pc.close()}catch(e){}L.pending.delete(k)}
    const sdp=pc.localDescription.sdp;if(!(opt&&opt.raw))PDG.ev('invitation made',{tag,addresses:Chirp.pickCands(sdp,2).map(c=>PDG.addr(c.a))});
    return opt&&opt.raw?{...o,kind:0,code:L.code,tag,sdp}:pack({...o,cands:Chirp.pickCands(sdp,2),kind:0,code:L.code,tag})}
  async function accept(text){const o=typeof text==='string'?unpack(text):text;if(!o)throw new Error(why(text));if(o.kind!==1)throw new Error('That is an invitation (a host\'s code): scan or type the reply on the pilot\'s screen.');
    if(o.code!==L.code)throw new Error('That reply is for room '+o.code+'.');const p=L.pending.get(o.tag);if(!p)throw new Error('That reply is for an old invitation. Ask the pilot to take the code on screen now.');
    L.pending.delete(o.tag);await p.pc.setRemoteDescription({type:'answer',sdp:toSdp(o,'active')});return p}
  /* pilot: answer the host's code; open resolves once the link to the host is up */
  async function answer(text){const o=typeof text==='string'?unpack(text):text;if(!o)throw new Error(why(text));if(o.kind!==0)throw new Error('That is a reply code: scan or type the code on the host\'s screen.');
    if(L.host)try{L.host.pc.close()}catch(e){}
    const pc=new RTCPeerConnection({iceServers:[]}),g={pc,ch:null,code:o.code};
    g.open=new Promise((res,rej)=>{pc.ondatachannel=e=>{g.ch=e.channel;g.ch.onopen=()=>res(g)};pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')rej(new Error('The connection to the host failed. Check both are on the same Wi-Fi, then scan again.'))}});
    await pc.setRemoteDescription({type:'offer',sdp:toSdp(o,'actpass')});await pc.setLocalDescription(await pc.createAnswer());await gather(pc);
    L.host=g;const sdp=pc.localDescription.sdp;return{reply:pack({...fromSdp(sdp),cands:Chirp.pickCands(sdp,1),kind:1,code:o.code,tag:o.tag}),code:o.code,open:g.open,pc}}
  /* the room link the session uses (the same shape as the other carriers) */
  function link(code,handlers){L.code=code;L.handlers=handlers;
    if(L.role==='host'){L.id=L.id||newId();setTimeout(()=>handlers.onOpen&&handlers.onOpen(),0);
      return{carrier:'lan',id:L.id,get paths(){return{pilots:L.guests.size}},send:m=>bcast({t:'_m',m,from:L.id}),
        close(){for(const ch of L.guests.values())try{ch.close()}catch(e){}for(const p of L.pending.values())try{p.pc.close()}catch(e){}L.guests.clear();L.pending.clear();L.handlers=null;L.role=null;L.id=null}}}
    const g=L.host,id=newId(),peers=new Set();if(!g||!g.ch||g.ch.readyState!=='open'){setTimeout(()=>handlers.onError&&handlers.onError('Not connected to a Wi-Fi host.'),0);return{carrier:'lan',id,send(){},close(){}}}
    g.ch.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(x){return}
      if(d.t==='_hello'){peers.add(d.host);for(const q of d.peers||[])peers.add(q);handlers.onOpen&&handlers.onOpen();for(const q of peers)handlers.onPeer&&handlers.onPeer(q)}
      else if(d.t==='_join'){peers.add(d.id);handlers.onPeer&&handlers.onPeer(d.id)}else if(d.t==='_leave'){peers.delete(d.id);handlers.onLeave&&handlers.onLeave(d.id)}
      else if(d.t==='_m')handlers.onMessage&&handlers.onMessage(d.m,d.from)};
    let closed=false;g.ch.onclose=()=>{if(closed)return;for(const q of peers)handlers.onLeave&&handlers.onLeave(q);peers.clear();handlers.onError&&handlers.onError('The Wi-Fi link to the host closed.')};
    send(g.ch,{t:'_hi',id});
    return{carrier:'lan',id,send:m=>send(g.ch,{t:'_m',m}),close(){closed=true;try{g.ch.close();g.pc.close()}catch(e){}if(L.host===g)L.host=null}}}
  return{L,offer,accept,answer,link,pack,unpack,why,repair,code:pack,codeOf,fromSdp,toSdp,qr:QR,ok:typeof RTCPeerConnection!=='undefined'}})();

