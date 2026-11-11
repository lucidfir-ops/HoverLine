//# input/050-input.js: input: keyboard, touch slider and nose, tilt, gamepads
/* ---------- input ----------
   Steer left/right, pitch the nose (down = streamlined and faster, up = more drag and grip), one brake, two weapon slots.
   Keyboard: arrows/WASD steer and pitch, Shift or B brakes, Space/J weapon 1, F/K weapon 2. Gamepad: left stick steers and pitches. */
const keys={};
const touch={steer:0,pitch:0,brake:0,boost:0,f1:0,f2:0};
/* Bindings. Steering and nose trim stay on the arrows/WASD and the left stick (the right stick also trims the nose);
   every other action has keys and one gamepad button, remappable in Controls. Gamepad defaults follow the Steam Deck /
   Xbox layout: A and B fire, RT boosts, LT brakes, LB changes the song, RB changes the view, Menu pauses. */
const ACTS=[['w1','Module 1'],['w2','Module 2'],['boost','Boost'],['brake','Brake · drift'],['song','Next song'],['view','Change view'],['pause','Pause']];
const PAD_DEF={w1:0,w2:1,boost:7,brake:6,song:4,view:5,pause:9};
const KEY_DEF={w1:['Space','KeyJ'],w2:['KeyF','KeyK'],boost:['KeyE','KeyL'],brake:['ShiftLeft','ShiftRight','KeyB'],song:['KeyN'],view:['KeyC'],pause:['Escape','KeyP']};
/* Button names follow the pad in use (Prototype 36), read from the id the browser gives it: Xbox (the default),
   PlayStation, Nintendo (named by place, so the bottom face button is B) and the Steam Deck (plain letters, L1/R1 and
   L2/R2). The face buttons get their own look on the HUD and in the Frame lab. */
const PAD_LAYOUTS={
  xbox:{n:['A','B','X','Y','LB','RB','LT','RT','View','Menu','L3','R3','D↑','D↓','D←','D→','Guide'],c:['pA','pB','pX','pY']},
  ps:{n:['✕','○','□','△','L1','R1','L2','R2','Create','Options','L3','R3','D↑','D↓','D←','D→','PS'],c:['psX','psO','psS','psT']},
  nin:{n:['B','A','Y','X','L','R','ZL','ZR','−','+','L3','R3','D↑','D↓','D←','D→','Home'],c:['pn','pn','pn','pn']},
  deck:{n:['A','B','X','Y','L1','R1','L2','R2','View','Menu','L3','R3','D↑','D↓','D←','D→','Steam'],c:['pd','pd','pd','pd']}};
/* Valve first (the Deck, or any pad through Steam Input, which presents itself as an Xbox 360 pad), then Xbox (its
   "Xbox Wireless Controller" would otherwise read as Sony's "Wireless Controller"), Sony, Nintendo; anything else is Xbox. */
const padKindOf=id=>{id=String(id||'').toLowerCase();return/28de|steam|valve/.test(id)?'deck':/045e|xbox|x-box|xinput/.test(id)?'xbox':/054c|playstation|dualshock|dualsense|wireless controller|ps[345]/.test(id)?'ps':/057e|nintendo|pro controller|joy-con|switch/.test(id)?'nin':'xbox'};
const PAD={kind:PAD_LAYOUTS[store.get('hoverline.padkind')]?store.get('hoverline.padkind'):'xbox',id:''};
const padName=i=>PAD_LAYOUTS[PAD.kind].n[i]||'?',padCls=i=>i>=0&&i<4?PAD_LAYOUTS[PAD.kind].c[i]:'';
/* a button's face for the HUD and the Frame lab: PlayStation's symbols drawn (as text they come out too small to read) */
const PS_SVG=['<path d="M3 3l6 6M9 3l-6 6"/>','<circle cx="6" cy="6" r="3.6"/>','<rect x="2.6" y="2.6" width="6.8" height="6.8"/>','<path d="M6 2.3L9.8 9H2.2Z"/>'];
const padFace=i=>PAD.kind==='ps'&&i>=0&&i<4?`<svg class="pg" viewBox="0 0 12 12" aria-label="${padName(i)}">${PS_SVG[i]}</svg>`:esc(padName(i));
const keyName=c=>c==null?'—':c==='Space'?'Space':c.startsWith('Key')?c.slice(3):c.startsWith('Digit')?c.slice(5):c.startsWith('Shift')?'Shift':c.startsWith('Arrow')?{ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'}[c]:c==='Escape'?'Esc':c.replace(/(Left|Right)$/,'');
const bind={pad:{...PAD_DEF},key:JSON.parse(JSON.stringify(KEY_DEF)),padInvert:store.get('hoverline.padinv')==='1'};
try{const p=JSON.parse(store.get('hoverline.pad')||'null');if(p)for(const[a]of ACTS)if(Number.isInteger(p[a]))bind.pad[a]=p[a];
  const k=JSON.parse(store.get('hoverline.keys')||'null');if(k)for(const[a]of ACTS)if(Array.isArray(k[a])&&k[a].length)bind.key[a]=k[a].filter(x=>typeof x==='string').slice(0,3)}catch(e){}
const saveBind=()=>{store.set('hoverline.pad',JSON.stringify(bind.pad));store.set('hoverline.keys',JSON.stringify(bind.key))};
const keyIs=(a,code)=>bind.key[a].includes(code);
const keyHeld=a=>bind.key[a].some(c=>keys[c]);
/* The last thing used decides which button names the HUD shows. */
let lastDev=coarse?'touch':'key';
const setDev=d=>{if(lastDev!==d){lastDev=d;hudT=0;if(S.state==='lab')try{labSlotTags()}catch(e){}try{touchSync()}catch(e){}}};
/* Prototype 61: the touch controls follow the device in use. A Steam Deck has a touch screen and a pad, so touch being
   on (coarse) only means they may show: they do while the last input was a touch, hide after a pad press or a key, and
   come back with the next touch, in races, the quick races and the control tutorial. (Split screen keeps its own rule:
   there the touch controls belong to whoever plays on this device.) */
const touchUI=()=>coarse&&lastDev==='touch';
function touchSync(){const on=touchUI(),T0=$('touch');if(!T0)return;$('slots').hidden=on;if(QK.live)qkClasses();
  if(tut.on){T0.hidden=!on;if(!tut.fin)tutText()}
  else if(!(SPL&&SPL.race)&&!$('hudL').hidden&&(S.state==='race'||S.state==='countdown'||S.state==='paused'||S.state==='done'))T0.hidden=!on;
  if(!T0.hidden)touchLayout();if(!$('qkTap').hidden)qkGoLabel()}
const actLabel=a=>lastDev==='pad'?padName(bind.pad[a]):keyName(bind.key[a][0]);
/* the pad last pressed names the buttons: a new kind of pad redraws every label that shows them */
function padSeen(p){if(p.id===PAD.id)return;PAD.id=p.id;const k=padKindOf(p.id);if(k===PAD.kind)return;PAD.kind=k;store.set('hoverline.padkind',k);hudT=0;padLabels()}
function padLabels(){try{labSlotTags();bindUI();ctrlHelpUI()}catch(e){}}
const tilt={ok:false,ang:0,neutral:0,pa:0,np:0,at:0,n:0,blocked:false,msg:'',enabled:store.get('hoverline.tilt')!=='0',flip:store.get('hoverline.flip')==='1',
  pitchMode:+(store.get('hoverline.tpitch')||0)}; // 0 tilt pitch on, 1 on and inverted, 2 off
let padPrev=[];const fireQ=[false,false];
addEventListener('keydown',e=>{if(rebind.on){rebindKey(e);return}if(e.code.startsWith('Arrow')||e.code==='Escape')setDev('key');if(navKey(e))return;if(e.repeat&&!e.code.startsWith('Arrow')){e.preventDefault();return}keys[e.code]=true;
  const inField=e.target.tagName==='INPUT'||e.target.tagName==='BUTTON';if(!inField)setDev('key');
  if(e.code==='Escape'&&!$('ed').hidden){closeEd(false);e.preventDefault();return}
  if(guide.on&&(e.code==='ArrowRight'||e.code==='ArrowLeft')){guideShow(guide.i+(e.code==='ArrowRight'?1:-1));e.preventDefault();return}
  if(keyIs('pause',e.code)&&!(inField&&e.code!=='Escape')){if(guide.on){closeGuide();e.preventDefault();return}if(!$('ctl').hidden)closeCtl();else if(S.state==='lab')closeLab();else togglePause('key '+e.code);e.preventDefault()}
  if(S.state==='race'&&keyIs('w1',e.code)&&!inField){fireQ[0]=true;e.preventDefault()}
  if(keyIs('song',e.code)&&!inField&&S.state!=='lab')newSong();
  if(keyIs('view',e.code)&&!inField&&(S.state==='race'||S.state==='countdown'||S.state==='done'))setCam(camMode+1,true);
  else if(S.state==='race'&&keyIs('w2',e.code)&&!inField){fireQ[1]=true;e.preventDefault()}
  else if((e.code==='Enter'||e.code==='Space')&&!inField&&!mp.on&&(!$('menu').hidden||!$('results').hidden)){startRace();e.preventDefault()}
  if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;clearTimeout(PZ.blur);PZ.blur=setTimeout(()=>{let f=false;try{f=document.hasFocus()}catch(e){}if(!f&&S.state==='race'&&!(mp.on&&mp.auto))togglePause('blur')},300)});

/* Tilt: roll (turning the device like a wheel) steers; pitch (tipping the top edge away / towards you) trims the nose.
   Both are measured against how the device was held when the race started. */
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;
  tilt.at=performance.now();tilt.n++;if(tilt.blocked){tilt.blocked=false;try{applyTouchUI()}catch(_){}}
  const ang=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);
  /* Prototype 49: if the screen turns after the tilt was centred (the lock turning it as a race starts, say), the old centre
     is meaningless: centre again once it has settled */
  if(tilt.lastO!==undefined&&tilt.lastO!==ang)tilt.reAt=performance.now()+450;tilt.lastO=ang;
  if(tilt.reAt&&performance.now()>tilt.reAt){tilt.reAt=0;tilt.recentre=true}
  let sx,sy;if(ang===90){sx=-a.y;sy=a.x}else if(ang===270||ang===-90){sx=a.y;sy=-a.x}else if(ang===180){sx=-a.x;sy=-a.y}else{sx=a.x;sy=a.y}
  const inPlane=Math.hypot(sx,sy);tilt.pa=Math.atan2(a.z||0,inPlane);
  if(inPlane<2.5)return;tilt.ok=true;tilt.ang=Math.atan2(sx,sy);if(tilt.recentre){tilt.recentre=false;tilt.neutral=tilt.ang;tilt.np=tilt.pa}}
function tiltCentre(){if(tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa;return true}return false}
addEventListener('devicemotion',onMotion);
/* Prototype 42: tilt works inside itch's frame (itch passes the motion sensors to HTML5 games), so nothing sends a player
   to another tab for being framed. Picking a tilt setup, or starting a race or the tutorial with tilt, asks for the sensor
   where the browser wants a tap for it (iPhones) and listens for a reading for 1.5 s, counting the time the page has been
   listening already (since it loaded, came back into view or got the permission). A reading: tilt just works where it is.
   None: a framed page offers its own tab (tiltNo); anywhere else steering falls back to the slider. tilt.at and tilt.n
   are the last reading's time and the count; tilt.blocked says this framed page got none; tilt.msg is a note to show. */
const TP={t0:performance.now()};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)TP.t0=performance.now()});
/* iPhones and iPads send no reading at all until a tap grants the sensor; elsewhere readings start with the listener (Chrome
   has requestPermission too now, but it answers without asking and readings don't wait for it) */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent||'')||(/Mac/.test(navigator.platform||'')&&(navigator.maxTouchPoints||0)>1);
const tiltLive=()=>tilt.at>0&&performance.now()-tilt.at<1000;
const tiltWanted=()=>tilt.enabled||tilt.pitchMode<2;
async function askMotion(){try{if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){const r=await DeviceMotionEvent.requestPermission();if(IOS&&r==='granted'&&!askMotion.ok){askMotion.ok=true;TP.t0=performance.now()}return r}}catch(e){return'error'}return''}
function tiltProbe(ms){return new Promise(res=>{if(tiltLive())return res(true);const n0=tilt.n,end=TP.t0+ms,tick=()=>{if(tilt.n>n0)res(true);else if(performance.now()>=end)res(false);else setTimeout(tick,50)};tick()})}
const dead=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);


