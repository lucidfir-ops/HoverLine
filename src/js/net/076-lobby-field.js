//# net/076-lobby-field.js: the lobby, the field and remote ships
/* ---------- multiplayer: lobby, field, remote ships ----------
   One device per pilot, up to 8 pilots per room; AI that the host simulates tops the field up to 8 ships.
   Authority: every device simulates its own ship and is the only one that damages it. The host simulates the AI.
   Everyone else's ship is a "proxy" drawn from their latest pose (8-10 a second), carried forward along the track
   at its own speed so it doesn't stutter. Weapons fire as events: every device spawns the same shots; a shot that
   hits a ship only does damage on the device that owns that ship, which then tells the others it exploded. */
const MAXP=8;
/* a split-screen room (Prototype 60) takes the screen and 8 controllers: 8 phones on one phone is allowed */
const mpMax=()=>mp.split==='screen'?MAXP+1:MAXP;
const mpEl={};for(const id of['mp','mpOut','mpIn','mpName','mpCode','mpCreate','mpJoin','mpBack','mpRoom','mpStatus','mpList','mpTrack','mpHostRow','mpStart','mpReady','mpLab','mpLeave','mpHint','mpConnRow','mpNew','mpAI','mpErr'])mpEl[id]=$(id);
mpEl.mpName.value=(store.get('hoverline.name')||('Pilot '+(10+Math.floor(Math.random()*90)))).slice(0,12);
const mpProfile=()=>({n:mpEl.mpName.value.trim().slice(0,12)||'Pilot',pt:build.paint,lv:build.liv||null,st:{...build.stats},w:[...build.weapons],fr:build.frame});
const mpSt={lobby:'not ready',lab:'in frame lab',loading:'loading',race:'racing',results:'on results'};
let mpConn=store.get('hoverline.conn')==='lan'?'lan':'internet';
function mpOpen(){S.state='menu';S.car=null;hidePages();page='play';mpEl.mp.hidden=false;mpView();drawPreview('mpPreview','mpStats');mpSyncConn();
  if(!mpOpen.probed){mpOpen.probed=true;HLNet.relayAvailable().then(ok=>{if(ok){document.querySelector('[data-conn="wifi"]').hidden=false;mpConn='wifi';mpSyncConn()}})}}
const CONN_HINT={internet:'The host creates a room and reads out its code; everyone else types it in on their own phone, tablet, Steam Deck or computer. Works across any networks over the internet, and on one Wi-Fi. Public room needs no code: anyone who picks it races together.',
  lan:'No internet needed: everyone on one Wi-Fi, or one phone\'s hotspot. The host invites, each pilot replies, then they connect directly. By code: the pilot scans or types the host\'s code, then the host scans or types the pilot\'s reply. The host relays the race, so keep the host\'s device in the room.',
  wifi:'This page comes from the Wi-Fi host pack: the host creates a room and reads out its code; everyone on this Wi-Fi opens the same address and types it in.'};
function mpSyncConn(){document.querySelectorAll('[data-conn]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.conn===mpConn)));const lan=mpConn==='lan';
  $('lanJoin').hidden=!lan;$('mpCodeRow').hidden=lan;$('mpPub').hidden=mpConn!=='internet';$('mpConnHint').textContent=CONN_HINT[mpConn]+(lan&&!LAN.ok?' This browser has no WebRTC, so it can\'t use it.':'');chirpSync()}
document.querySelectorAll('[data-conn]').forEach(b=>b.onclick=()=>{mpConn=b.dataset.conn;if(mpConn!=='wifi')store.set('hoverline.conn',mpConn);mpSyncConn()});
function mpView(){const inRoom=!!mp.sess;mpEl.mpOut.hidden=inRoom;mpEl.mpIn.hidden=!inRoom;if(inRoom)mpRender()}
/* Prototype 60: ail, the host's rivals level, so every pilot in the room races (and goes on the board at) the level the host's AI
   flies; a host from before sends none, which is Default */
function mpTrackInfo(){return{seed,wk:wid,cx:cplx,lk:lenK,sp:spec?specStr(spec):null,bm:bioTok(),laps:mp.laps,fill:mp.fill,cls:mp.cls,ail:ailNow(),...(mp.split==='screen'?{split:1}:{})}}
/* Public rooms (Prototype 38): Public room joins the first public room of this version that has space, or opens it if nobody
   is there (whoever is first is the host, and the next pilot takes over if they leave). Random codes never contain a 1. */
const PUBV=62,pubCode=k=>'P'+PUBV+'PUB'+k,PUBN=6;
function mpConnect(code,host,pub){mp.pub=pub||0;
  audio.init();store.set('hoverline.name',mpEl.mpName.value.trim().slice(0,12));mpEl.mpErr.textContent='';
  const q=new URLSearchParams(location.search).get('mp'),carrier=q==='local'?'local':mpConn==='wifi'?'relay':mpConn==='lan'?'lan':'net';
  mp.on=true;mp.code=code;mp.left=new Set();mp.go=null;
  mp.sess=createSession({code,host,max:mpMax(),profile:mpProfile(),info:host?mpTrackInfo():{},carrier,openLink:HLNet.openLink,claimMs:pub?3500:0,
    onChange:mpRender,onInfo:mpApplyInfo,onStart:mpStart,onGo:mpGo,onLeave:mpPeerLeft,onHost:mpBecameHost,
    onFull:()=>{if(mp.pub&&mp.pub<PUBN){const k=mp.pub+1;mp.sess.close();mp.sess=null;mpConnect(pubCode(k),false,k);return}mpEl.mpErr.textContent=mp.pub?'Every public room is full right now.':'That room is full ('+MAXP+' pilots).'},
    onError:t=>{mpEl.mpErr.textContent=t+(carrier==='lan'?' Leave the room and join again.':' Tap Reconnect to try again.');if(S.state==='race'||S.state==='countdown'||S.state==='mpwait')note('Connection trouble · pause and tap Reconnect',2600)},onMessage:mpMessage});
  mpView()}
mpEl.mpCreate.onclick=async()=>{if(mpConn==='lan'){if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do Wi-Fi rooms (no WebRTC).';return}
    /* with the camera allowed, the browser shares this device's real Wi-Fi address in the codes (otherwise a private name
       that some networks can't look up), and the host needs the camera to scan replies anyway */
    PDG.start('host','code');LAN.L.role='host';LAN.L.id=null;await lanCamProbe();mpConnect(HLNet.roomCode(chirpRnd),true);lanHostNext();return}
  mpConnect(HLNet.roomCode(),true)};
$('lanJoin').onclick=()=>{if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do Wi-Fi rooms (no WebRTC).';return}PDG.start('guest','code');lan.mode='guest';lan.helper=false;lanCamCheck();
  lanUI({title:'Join by code',steps:LAN_GUEST,cur:0,scan:'Scan the host\'s code',input:'type the host\'s code'});lanShow(true)};
$('mpPub').onclick=()=>{if(mpConn!=='internet'){mpEl.mpErr.textContent='Public rooms are online only: pick Internet.';return}mpConnect(pubCode(1),false,1)};
mpEl.mpJoin.onclick=()=>{const c=HLNet.normaliseCode(mpEl.mpCode.value);if(c.length<4){mpEl.mpErr.textContent='Room codes have 5 letters and numbers.';return}mpConnect(c,false)};
mpEl.mpCode.addEventListener('keydown',e=>{if(e.key==='Enter')mpEl.mpJoin.click()});
mpEl.mpBack.onclick=()=>{chirpStop();mpEl.mp.hidden=true;toMenu()};
mpEl.mpLeave.onclick=()=>mpLeaveRoom();
