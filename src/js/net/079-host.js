//# net/079-host.js: pairing: the host side
/* ---- host ---- */
async function chirpHostTap(){if(chirp.pair==='qr'||!ChirpIO.can())return mpEl.mpCreate.onclick();
  if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do same-room races (no WebRTC).';return}
  audio.init();mpEl.mpErr.textContent='';chirp.role='host';PDG.start('host','sound');const id=chirp.loop;
  chirpUI('host','Opening the microphone…',stepsHtml(CH_HOST,-1));
  // the microphone first: with it allowed, the browser shares this device's real Wi-Fi address in the invitations
  const why=await chirpOpen();if(chirp.loop!==id||mp.sess)return;if(why)return chirpFail(why,'host');
  LAN.L.role='host';LAN.L.id=null;mpConnect(HLNet.roomCode(chirpRnd),true);chirpHost()}
async function chirpResume(){audio.init();PDG.start('host','sound');chirp.role='host';const id=chirp.loop;chirpUI('host','Opening the microphone…',stepsHtml(CH_HOST,-1));
  const why=await chirpOpen();if(chirp.loop!==id)return;
  if(why){chirpUI('host','Adding pilots by sound','');chirpSay(why==='denied'?'The microphone is blocked: use codes.':'Sound pairing can\'t start here: use codes.');return}chirpHost()}
function chirpHost(){if(lan.mode&&!lan.helper)lanStop();chirp.role='host';chirp.mode='host';chirp.offer=null;chirp.fresh=false;chirpDuck(true);
  chirpUI('host','Inviting pilots',stepsHtml(CH_HOST,0));chirpHostSay(mp.sess&&mp.sess.state);chirpSay('');
  lan.mode='host';lan.helper=true;lan.open=false;lanCamCheck();lanShow(false);chirpHelp();chirpCodeBtn();chirpHostLoop()}
async function chirpHostLoop(){const id=++chirp.loop,lobby=()=>{const st=mp.sess&&mp.sess.state;return!st||st.phase==='connecting'||st.isHost&&st.phase==='lobby'},
    live=()=>{if(chirp.mode!=='host'||chirp.loop!==id)return false;if(lobby())return true;chirpStop();return false};
  while(live()){const st=mp.sess&&mp.sess.state;
    if(!st||st.phase==='connecting'){await chirpWait(300);continue}
    if(st.roster.length>=mpMax()){chirpStop();note('The room is full',1800);return}
    if(!chirp.offer){chirp.tag=(chirp.tag<0?Math.floor(chirpRnd()*256):chirp.tag+1)&255;
      try{const o=await LAN.offer({raw:true,tag:chirp.tag});if(!live())return;chirp.offer={...o,slot:Math.min(7,st.roster.length),cands:Chirp.pickCands(o.sdp,2)};
        PDG.ev('invitation made',{tag:chirp.tag,addresses:chirp.offer.cands.map(c=>PDG.addr(c.a))});chirpHelp()}
      catch(e){chirpSay('Could not make a call: '+(e&&e.message||e));PDG.err('invitation',e);await chirpWait(2000);continue}}
    for(let k=0;k<20&&ChirpIO.busy()&&live();k++)await chirpWait(200);if(!live())return;
    const speed=ULTRA?'ultra':chirp.cycle++%2?'fast':'fastest',bytes=Chirp.pack({...chirp.offer,kind:0,speed});chirp.fresh=false;
    await ChirpIO.tx(bytes,speed);if(!live())return;
    // the listening window: a pilot's wait (up to 2.8 s, and making its answer) and its answer at the same speed
    const t0=performance.now(),win=(3.4+Chirp.seconds(bytes.length,speed)+0.8)*1000;
    while(live()&&!chirp.fresh){const t=performance.now()-t0;if(t>win&&!(ChirpIO.busy()&&t<win+4000))break;await chirpWait(120)}}}
/* an answer heard: any invitation still open takes it; an answer to the one being called has the next call made at once */
async function chirpHostRx(o){if(o.kind!==1||o.code!==LAN.L.code||!LAN.L.pending.has(o.tag))return;PDG.ev('reply heard',{tag:o.tag});
  const f=chirp.offer;if(f&&o.tag===f.tag){chirp.offer=null;chirp.fresh=true}
  try{const p=await LAN.accept(o);PDG.rtc(p.pc,'sound');chirpWatch(p.pc)}catch(e){PDG.err('reply',e)}}
function chirpWatch(pc){chirp.wait=pc;chirpSay('A pilot is connecting…');
  const bad=()=>{if(chirp.wait===pc&&chirp.mode==='host'&&pc.connectionState!=='connected')chirpSay(HOTSPOT)};
  pc.addEventListener('connectionstatechange',()=>{if(pc.connectionState==='failed')bad()});setTimeout(bad,12000)}
function chirpHostSay(st){if(chirp.mode!=='host'||!st)return;const n=st.roster.length-1;ch$('chirpSteps').innerHTML=stepsHtml(CH_HOST,0)+(n>0?`<p class="small">${n} pilot${n>1?'s':''} joined.</p>`:'')}
