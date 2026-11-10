//# net/080-pilot.js: pairing: the pilot side
/* ---- pilot ---- */
async function chirpJoinTap(){if(chirp.pair==='qr'||!ChirpIO.can())return $('lanJoin').onclick();
  if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do same-room races (no WebRTC).';return}
  audio.init();mpEl.mpErr.textContent='';chirp.role='guest';chirp.mode='guest';chirp.heardAt=0;chirp.deaf=false;chirp.startAt=performance.now();PDG.start('guest','sound');
  chirpUI('guest','Listening for the host…',stepsHtml(CH_GUEST,0));chirpSay('');
  lan.mode='guest';lan.helper=true;lan.open=false;lanCamCheck();lanShow(false);chirpHelp();chirpCodeBtn();
  const why=await chirpOpen();if(chirp.mode!=='guest')return;if(why)return chirpFail(why,'guest');
  chirpDuck(true);chirp.startAt=performance.now()}
/* an invitation, heard (via 'sound') or scanned or typed (via 'code') */
async function chirpGuestRx(o,via){if(o.kind!==0)return;if(via!=='code')chirp.heardAt=performance.now();const g=chirp.g;
  if(g&&g.done)return;
  const same=!!g&&g.code===o.code&&g.o.tag===o.tag,tries=same?g.tries+1:0;
  if(same&&(g.sending||!g.bytes))return;
  // the same call again: the host missed the answer, or this phone held back for another: the same answer once more,
  // unless its connection has failed
  if(same){const c=g.pc&&g.pc.connectionState;if(c!=='failed'&&c!=='closed'){g.tries=tries;chirpAnswer(g,o.speed||'fastest');return}}
  // a new tag: the host took someone else, unless this phone's link is already coming up
  if(g){const c=g.pc&&g.pc.connectionState;if(!same&&g.sentAt&&(c==='connecting'||c==='connected')){if(chirp.old)chirpDrop(chirp.old);chirp.old=g}else chirpDrop(g)}
  const n=chirp.g={o,code:o.code,pc:null,ch:null,bytes:null,sending:false,done:false,sentAt:0,tries,via:via||'sound',cands:false,retry:0};
  ch$('chirpTitle').textContent=(via==='code'?'Room ':'Heard room ')+o.code+' · answering…';ch$('chirpSteps').innerHTML=stepsHtml(CH_GUEST,1);chirpSay('');
  PDG.ev('invitation '+(via==='code'?'by code':'heard'),{tag:o.tag});
  try{await chirpAnswerMake(n)}catch(e){if(chirp.g===n){chirpSay(String(e&&e.message||e));chirp.g=null}PDG.err('reply',e);return}
  if(chirp.g!==n||n.done)return;chirpHelp();if(PDG.cur)PDG.cur.codes.shown++;
  chirpAnswer(n,o.speed||'fastest');
  // taken by scan or typing: the host may not be heard here at all, so the answer goes out again every 9 s, four times
  if(n.via==='code')n.retry=setInterval(()=>{if(n.done||chirp.g!==n||chirp.mode!=='guest'){clearInterval(n.retry);return}
    if(!n.sending&&n.sentAt&&performance.now()-n.sentAt>9000&&n.tries<4){n.tries++;chirpAnswer(n,n.tries%2?'fast':'fastest')}},1000)}
async function chirpAnswerMake(n){const pc=n.pc=new RTCPeerConnection({iceServers:[]});PDG.rtc(pc,n.via);
  pc.ondatachannel=e=>{n.ch=e.channel;n.ch.onopen=()=>chirpOpened(n)};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&chirp.g===n&&chirp.mode==='guest')chirpSay(HOTSPOT)};
  // by sound the host's addresses are held back until the answer has played (chirpAnswer); by code they go in at once
  await pc.setRemoteDescription({type:'offer',sdp:LAN.toSdp({...n.o,cands:[]},'actpass')});await pc.setLocalDescription(await pc.createAnswer());
  if(n.via==='code')chirpCands(n);
  await new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,1500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})});
  const sdp=pc.localDescription.sdp,f=LAN.fromSdp(sdp);
  n.bytes=Chirp.pack({kind:1,speed:Chirp.PROTO[n.o.speed]?n.o.speed:'fastest',slot:n.o.slot,tag:n.o.tag,code:n.code,uf:f.uf,pw:f.pw,fp:f.fp,cands:Chirp.pickCands(sdp,1)})}
function chirpCands(n){if(n.cands||!n.pc)return;n.cands=true;n.o.cands.forEach((c,i)=>n.pc.addIceCandidate({candidate:`candidate:${i+1} 1 udp ${2122260223-i*256} ${c.a} ${c.port} typ host generation 0`,sdpMid:'0',sdpMLineIndex:0}).catch(()=>{}))}
async function chirpAnswer(n,speed){n.sending=true;
  try{// the call has only just ended (it is decoded on its end marker): wait for the room to go quiet, then a random
    // wait, and give way to any chirp that starts in it (another pilot answering first)
    const q0=performance.now();while(ChirpIO.busy()&&performance.now()-q0<3000)await chirpWait(50);
    // (a third try goes ahead regardless: in a loud room the noise itself can look like a chirp starting)
    const wait=350+chirpRnd()*(n.tries?2450:1650),t0=performance.now();
    while(performance.now()-t0<wait){await chirpWait(50);if(ChirpIO.startedAfter(t0)&&n.tries<2||chirp.g!==n||n.done||chirp.mode!=='guest')return}
    ch$('chirpTitle').textContent='Answering room '+n.code+'…';
    await ChirpIO.tx(n.bytes,speed);n.sentAt=performance.now();if(n.done||chirp.g!==n)return;ch$('chirpTitle').textContent='Connecting to room '+n.code+'…';chirpSay('');
    chirpCands(n)}
  finally{n.sending=false}}
function chirpOpened(n){if(n.done||chirp.mode!=='guest')return;n.done=true;clearInterval(n.retry);for(const g of[chirp.g,chirp.old])if(g&&g!==n&&!g.done)chirpDrop(g);chirp.g=chirp.old=null;
  if(LAN.L.host&&LAN.L.host.pc!==n.pc)try{LAN.L.host.pc.close()}catch(e){}
  LAN.L.host={pc:n.pc,ch:n.ch,code:n.code,open:Promise.resolve()};PDG.ev('connected',{via:n.via});PDG.end('joined');chirpStop();mpConnect(n.code,false)}
