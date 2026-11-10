//# net/077-pairing-screens.js: same room, no internet: the pairing screens (codes, QR, steps)
/* ---------- Same room, no internet: the pairing screens (codes Prototype 31, sound 44, steps and mixing 47) ----------
   One device hosts and invites; each pilot's device answers with a reply; then the two connect directly over the Wi-Fi
   (or a phone's hotspot), with no server. Each leg is one message: the host's invitation (LAN.offer), then the pilot's
   reply (LAN.answer). By sound (below) the devices swap both by themselves. By code each is shown as a QR code and as
   text and the other device scans or types it: first the pilot takes the host's code, then the host takes the pilot's
   reply. The two mix a leg at a time: a pilot listening for the call can scan or type the invitation instead (its reply
   still goes out by sound, and shows as a code), and a host calling by sound can show its code and take a reply by scan
   or typing. lan.mode: 'host' or 'guest' while pairing; lan.helper: the code box belongs under the sound box (Use a code
   opens it: lan.open) rather than standing on its own. */
const lan={mode:null,stream:null,scanning:false,code:null,helper:false,open:false,noCam:false,ui:null};
function lanShow(on){const b=$('lanBox');b.hidden=!on;b.classList.toggle('helper',!!(on&&lan.helper));if(!on){lanCamOff();$('lanMsg').textContent=''}
  if(!lan.helper&&lan.mode==='guest')mpEl.mpOut.hidden=on||!!mp.sess}
function lanStop(){lanShow(false);lan.mode=null;lan.code=null;lan.helper=false;lan.open=false;lan.ui=null}
function stepsHtml(list,cur){return'<ol class="steps">'+list.map((t,i)=>`<li class="${i<cur?'done':i===cur?'cur':''}">${t}</li>`).join('')+'</ol>'}
const codeGroups=c=>String(c||'').replace(/(.{5})/g,'$1 ').trim();
function qrDraw(c,code){const M=LAN.qr(code),n=M.length+8,k=Math.max(2,Math.floor(c.width/n)),g=c.getContext('2d'),o=Math.floor((c.width-k*M.length)/2);g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#000';
  M.forEach((row,y)=>row.forEach((d,x)=>{if(d)g.fillRect(o+x*k,o+y*k,k,k)}))}
/* o: title; steps (a list, or a function giving one) with cur the step to do now, or a one-line note; code (the one this
   device shows); scan (the camera button's label, or none); input (the typing box's hint, or none) */
function lanUI(o){lan.ui=o;lan.code=o.code||null;$('lanTitle').textContent=o.title||'';const st=typeof o.steps==='function'?o.steps():o.steps;
  $('lanSteps').innerHTML=(st?stepsHtml(st,o.cur==null?-1:o.cur):'')+(o.note?`<p class="small">${o.note}</p>`:'');
  const host=lan.mode==='host',showQ=!!lan.code;
  $('lanTxt').hidden=!showQ;$('lanTxt').textContent=showQ?codeGroups(lan.code):'';$('lanCopy').hidden=!showQ;
  const b=$('lanScan');b.hidden=!o.scan||lan.noCam&&!lan.scanning;b.textContent=lan.scanning?'Stop the camera':o.scan||'';b.classList.toggle('go',!lan.helper);
  $('lanInRow').hidden=!o.input;$('lanIn').placeholder=o.input||'';
  const cn=$('lanCancel');cn.hidden=lan.helper;cn.textContent=host?'Done':'Cancel';
  const c=$('lanQR');c.hidden=!showQ||lan.scanning;if(showQ)try{qrDraw(c,lan.code)}catch(e){c.hidden=true}}
const lanRedraw=()=>{if(lan.ui)lanUI(lan.ui)};
const lanSay=t=>{$('lanMsg').textContent=t};
/* the steps by code, as the screens say them */
const LAN_HOST=()=>['<b>Invite</b> · each pilot taps <b>Join</b>, then scans this code or types it in.','<b>Reply</b> · the pilot\'s screen then shows a reply code.',
  `<b>Take the reply</b> · ${lan.noCam?'type it in below':'scan it here, or type it in'}. Then the next pilot.`];
const LAN_GUEST=()=>[`<b>Invitation</b> · ${lan.noCam?'type in':'scan, or type in,'} the code on the host's screen.`,'<b>Reply</b> · show the host the reply code that appears here.','<b>Join</b> · you\'re in the lobby as soon as the host has it.'];
/* no camera at all (a Steam Deck, most desktops): no Scan buttons, only typing. A browser that lists no devices before
   it is allowed to keeps the button and finds out on the tap. */
function lanCamCheck(){try{navigator.mediaDevices.enumerateDevices().then(ds=>{const none=ds.length>0&&!ds.some(d=>d.kind==='videoinput');if(none!==lan.noCam){lan.noCam=none;lanRedraw()}}).catch(()=>{})}catch(e){}}
async function lanCamProbe(){try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});st.getTracks().forEach(t=>t.stop())}catch(e){}}
function lanCamOff(){lan.scanning=false;if(lan.stream){lan.stream.getTracks().forEach(t=>t.stop());lan.stream=null}const v=$('lanCam');v.hidden=true;v.srcObject=null}
/* jsQR 1.4.0 (Apache-2.0, Cosmo Wolfe, github.com/cozmo/jsQR, about 130 KB) sits in the page as text (#jsqrJs) and runs
   only when a scan starts in a browser that can't read QR codes itself: Firefox (the Steam Deck, Firefox on Android),
   and Android browsers whose built-in reader is missing or fails (it needs Google's barcode service). */
let JSQR=null;
function jsqrLib(){if(JSQR)return JSQR;try{if(typeof window.jsQR!=='function'){const el=document.getElementById('jsqrJs');if(!el)return null;const s=document.createElement('script');s.textContent=el.textContent;document.head.appendChild(s);s.remove()}
  JSQR=typeof window.jsQR==='function'?window.jsQR:null}catch(e){JSQR=null}return JSQR}
/* the camera: the browser's own QR reader where it has one that works, else jsQR on frames drawn to a canvas (720 px at
   most); a built-in reader that throws three times, or sees nothing for 4 s, hands over to jsQR (or shares with it) */
async function lanScan(){if(lan.scanning){lanCamOff();lanRedraw();lanSay('');return}
  const C=PDG.cur&&PDG.cur.qr;if(C)C.scans++;const md=navigator.mediaDevices;
  if(!(md&&md.getUserMedia)){lan.noCam=true;lanRedraw();lanSay('This browser has no camera here: type the code in instead.');return}
  try{lan.stream=await md.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}})}
  catch(e){const n=e&&e.name;PDG.err('camera',e);if(PDG.cur)PDG.cur.camera=n||'error';
    if(n==='NotFoundError'||n==='OverconstrainedError'||n==='NotReadableError'&&!lan.stream){lan.noCam=n==='NotFoundError';lanRedraw();lanSay(n==='NotReadableError'?'The camera is busy in another app: type the code in instead.':'No camera on this device: type the code in instead.')}
    else lanSay('The camera isn\'t allowed here: allow it, or type the code in instead.');return}
  if(PDG.cur)PDG.cur.camera='allowed';
  const v=$('lanCam');v.srcObject=lan.stream;$('lanQR').hidden=true;v.hidden=false;try{await v.play()}catch(e){}lan.scanning=true;lanRedraw();lanSay('Point the camera at the code…');
  let nat=null;if(typeof window.BarcodeDetector==='function'){try{const f=BarcodeDetector.getSupportedFormats?await BarcodeDetector.getSupportedFormats():['qr_code'];if(f.includes('qr_code'))nat=new BarcodeDetector({formats:['qr_code']})}catch(e){nat=null}}
  if(C)C.reader=nat?'built in':'jsQR';let fails=0,k=0,cv=null,g=null;const t0=performance.now();
  const js=()=>{const J=jsqrLib();if(!J)return null;const w=v.videoWidth,h=v.videoHeight;if(!w||!h)return null;const z=Math.min(1,720/Math.max(w,h));
    if(!cv){cv=document.createElement('canvas');g=cv.getContext('2d',{willReadFrequently:true})}cv.width=Math.round(w*z);cv.height=Math.round(h*z);g.drawImage(v,0,0,cv.width,cv.height);
    const r=J(g.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'});return r&&r.data||null};
  while(lan.scanning){let txt=null,by=null;k++;
    if(nat)try{const r=await nat.detect(v);const h=r.find(x=>/^HL/i.test(x.rawValue||''));if(h){txt=h.rawValue;by='built in'}}catch(e){if(++fails>=3){nat=null;if(C){C.reader='jsQR (the built-in reader failed)';C.errors++}}}
    if(!txt&&lan.scanning&&(!nat||performance.now()-t0>4000&&k%2))try{const t=js();if(t&&/^HL/i.test(t)){txt=t;by='jsQR'}}catch(e){if(C)C.errors++}
    if(txt){if(C){C.found++;C.by=by}lanCamOff();lanSay('');lanUse(txt,'scanned');return}
    await new Promise(r=>setTimeout(r,nat?180:120))}}
/* a code scanned or typed: on the host a pilot's reply, on a pilot the host's invitation */
async function lanUse(text,how){text=String(text||'').trim();if(!text)return;$('lanIn').value='';const C=PDG.cur&&PDG.cur.codes;if(C&&how!=='scanned')C.typed++;else if(C)C.scanned++;
  let o=LAN.unpack(text),fix=null;
  if(!o&&how!=='scanned'){const host=lan.mode==='host';fix=LAN.repair(text,host?x=>x.kind===1&&x.code===LAN.L.code&&LAN.L.pending.has(x.tag):x=>x.kind===0);if(fix){o=fix.o;PDG.ev('code put right',{group:fix.group})}}
  if(!o){if(C)C.bad++;lanSay(LAN.why(text));PDG.ev('code did not read',{letters:text.replace(/[^0-9A-Z]/gi,'').length});return}
  try{if(lan.mode==='host'){if(o.kind!==1)throw new Error('That is an invitation (a host\'s code): scan or type the reply on the pilot\'s screen.');
      lanSay('Connecting the pilot…');const p=await LAN.accept(o);if(fix)lanSay(`One letter in group ${fix.group} was off, and has been put right. Connecting the pilot…`);PDG.ev('reply by code',{tag:o.tag,how:how||'typed'});PDG.rtc(p.pc,how||'typed');
      if(chirp.mode==='host'){if(chirp.offer&&chirp.offer.tag===o.tag){chirp.offer=null;chirp.fresh=true}chirpWatch(p.pc)}
      else if(!lan.helper&&lan.ui)lanUI({...lan.ui,cur:2});
      setTimeout(()=>{if(/Connecting the pilot…$/.test($('lanMsg').textContent))lanSay('Still connecting… check the pilot is on this Wi-Fi.')},8000)}
    else if(lan.mode==='guest'){if(o.kind!==0)throw new Error('That is a reply code: scan or type the code on the host\'s screen.');
      PDG.ev('invitation by code',{tag:o.tag,how:how||'typed'});
      if(chirp.mode==='guest'){lanSay(fix?`One letter in group ${fix.group} was off, and has been put right.`:'');chirpGuestRx(o,'code');return}
      lanSay('Making your reply…');const res=await LAN.answer(o);PDG.rtc(res.pc,'code');if(PDG.cur)PDG.cur.codes.shown++;
      lanUI({title:'Show this reply to the host',steps:LAN_GUEST,cur:1,code:res.reply});lanSay(fix?`One letter in group ${fix.group} was off, and has been put right.`:'');
      res.open.then(()=>{if(lan.mode!=='guest')return;lanStop();PDG.ev('connected');PDG.end('joined');mpConnect(res.code,false)},e=>lanSay(String(e.message||e)))}}
  catch(e){lanSay(String(e&&e.message||e));PDG.err('code',e)}}
async function lanHostNext(){lan.mode='host';lan.helper=false;lan.open=false;lanCamCheck();lanShow(true);
  const ui=c=>lanUI({title:'Invite pilots by code',steps:LAN_HOST,cur:0,code:c,scan:'Scan a reply',input:'type a pilot\'s reply'});ui(null);
  try{const c=await LAN.offer();if(lan.mode==='host'&&!lan.helper){ui(c);if(PDG.cur)PDG.cur.codes.shown++}}catch(e){lanSay('Could not make a code: '+(e&&e.message||e));PDG.err('invitation',e)}}
LAN.L.onChange=what=>{if(lan.mode!=='host'||lan.helper)return;if(what==='joined'){PDG.ev('pilot joined');lanSay('A pilot joined. Invite the next one, or press Done.');lanHostNext()}mpRender()};
$('lanScan').onclick=lanScan;$('lanUse').onclick=()=>lanUse($('lanIn').value);$('lanIn').addEventListener('keydown',e=>{if(e.key==='Enter')lanUse($('lanIn').value)});
$('lanCopy').onclick=async()=>{try{await navigator.clipboard.writeText(lan.code);lanSay('Copied.')}catch(e){lanSay('Select the code above and copy it.')}};
$('lanCancel').onclick=()=>{if(lan.mode==='host'){lanStop();PDG.end('host done');return}lanStop();PDG.end('cancelled');if(LAN.L.host)try{LAN.L.host.pc.close()}catch(e){}LAN.L.host=null};
