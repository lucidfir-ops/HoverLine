//# ui/070-career-home.js: career home, frame select and guidance
/* ---------- career home, frame select and guidance (Prototype 39) ----------
   Career opens a small page: Load career (only when there is one) goes to the career page, New career to the frame
   select: one frame at a time on the Frame lab's stand, its name and a line on what makes it different, and all eight
   in a row along the bottom. The announcer's voice reads the line the first time you look at each frame (kept in
   hoverline.fheard); Repeat reads it again, and moving on or leaving stops it. Choosing a frame starts the career with
   it, every stat at 1, and the same voice asks "Do you require guidance?": Yes is the tutorial with that frame and one
   more step for its own trait, No goes straight to the career page. */
const FS_LINE={blade:"The Blade. The all-rounder: no strengths, no weaknesses. The best frame to learn the tracks in.",
  tether:"The Tether. Two huge engines on cables, and the fastest frame there is. It turns slowly and breaks easily, so don't hit anything.",
  skiff:"The Skiff. A hover bike: small, nimble and hard to hit, with the sharpest steering. It can't take much punishment.",
  hauler:"The Hauler. Heavy armour, the biggest magazine, and reactors that refill its shield and ammo as it races. It wins every shove.",
  dart:"The Dart. A delta wing. Dip the nose and it streamlines like nothing else, and it glides further off every jump.",
  orb:"The Orb. It rolls along the walls instead of grinding against them, so you can ride the edge of the road.",
  roller:"The Drifter. Hold the brake through a corner and it drifts, swinging its tail out and gaining speed the longer you hold it.",
  mono:"The Monowheel. One giant wheel that's hard to push around. It drops back fast over crests, and keeps more of its steering in the air."};
/* the lines above in the announcer's voice: the Kokoro model's bf_emma with a lighter PA treatment, mono MP3s */
//#include assets/cvox.js
const fsv={buf:null,p:null,src:null,k:null};
function fsvLoad(){if(fsv.p||!audio.ctx||!audio.ctx.decodeAudioData)return fsv.p;fsv.buf={};
  fsv.p=Promise.all(Object.entries(CVOX).map(([k,b64])=>new Promise(res=>{try{const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
    audio.ctx.decodeAudioData(u.buffer,b=>{fsv.buf[k]=b;res()},()=>res())}catch(e){res()}})));return fsv.p}
function fsvUI(){const r=$('fsRep');if(r)r.classList.toggle('on',!!fsv.src)}
function fsvStop(){fsv.k=null;if(fsv.src){const s=fsv.src;fsv.src=null;try{s.stop()}catch(e){}}fsvUI()}
/* say a line (k: a frame, or 'guide'); returns false when there is no sound to say it with */
function fsvSay(k){fsvStop();audio.init();if(!audio.ctx||!audio.on)return false;fsv.k=k;
  const go=()=>{if(fsv.k!==k||fsv.src)return;const b=fsv.buf&&fsv.buf[k];if(!b)return;const c=audio.ctx,s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=0.95;s.connect(g);g.connect(audio.master);
    s.onended=()=>{if(fsv.src===s){fsv.src=null;fsvUI()}};s.start();fsv.src=s;fsvUI()};
  if(fsv.buf&&fsv.buf[k])go();else{const p=fsvLoad();if(p)p.then(go)}return true}
const fsHeard=()=>{try{const a=JSON.parse(store.get('hoverline.fheard')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
/* a career exists once a frame has been chosen for it, or (saves from before Prototype 39) once it has any progress */
const carExists=()=>!!(car.fr||car.cr||car.up||car.best.some(x=>x));
const BARE={speed:1,thrust:1,handling:1,shield:1,ammo:1};
function carHomeOpen(){fsvStop();if(car.free)carLeave();hidePages();$('carNew').hidden=true;const ex=carExists(),L=$('carLoad');
  L.hidden=!ex;L.classList.toggle('go',ex);$('carNewB').classList.toggle('go',!ex);
  if(ex){let fr=car.fr;try{const b=JSON.parse(store.get('hoverline.cbuild')||'null');if(b&&FRAMES[b.frame])fr=b.frame}catch(e){}
    const o=carOpen(),done=car.best.filter(x=>x&&x<=3).length;
    $('carLoadSub').textContent=frameOf(fr).name+' · '+(done>=CAR_N?'every race cleared':`next ${CAR_T[o>>2].n} ${(o&3)+1}`)+` · ${done} of ${CAR_N} cleared · ${car.cr.toLocaleString('en')} ¢`}
  $('carHome').hidden=false}
/* a new career: no credits, nothing cleared, the chosen frame with every stat at 1 and the first two modules */
function carNewStart(fr){if(car.free)carLeave();car.cr=0;car.up=0;car.best=car.best.map(()=>0);car.fr=fr;carSave();
  store.set('hoverline.cbuild',JSON.stringify({stats:{...BARE},frame:fr,weapons:CAR_W0.slice(0,2),paint:build.paint|0,liv:build.liv||null}));
  S.car=null;carEnter()}
$('carLoad').onclick=()=>{$('carHome').hidden=true;showPage('career');carEnter();carUI()};
$('carNewB').onclick=()=>{if(carExists())$('carNew').hidden=false;else fsOpen()};
$('carNewYes').onclick=fsOpen;$('carNewNo').onclick=()=>{$('carNew').hidden=true};
$('carHomeBack').onclick=()=>{$('carHome').hidden=true;showPage('play')};
/* the frame select page */
const fs={on:false,k:'blade',ship:null,yaw:0.6,hid:[],t:0,drag:null,thumbs:null};
function fsOpen(){audio.init();hidePages();$('carHome').hidden=true;$('carNew').hidden=true;fs.on=true;S.state='fsel';
  fs.hid=[labShip,labGhost].filter(o=>o&&o.visible);for(const o of fs.hid)o.visible=false;$('labTag').hidden=true;
  fsRow();$('fsel').hidden=false;fs.k=null;fsShow('blade');fsThumbs();fsvLoad()}
function fsLeave(){fsvStop();fs.on=false;$('fsel').hidden=true;if(fs.ship){labScene.remove(fs.ship);disposeObj(fs.ship);fs.ship=null}for(const o of fs.hid)o.visible=true;fs.hid=[];
  labCam.fov=38;labCam.clearViewOffset();labScene.fog.near=16;labScene.fog.far=42;S.state='menu';camInit=false}
function fsRow(){const R=$('fsRow');if(R.children.length)return;
  for(const k of FRAME_KEYS){const b=document.createElement('button');b.className='fsb';b.dataset.fk=k;b.setAttribute('aria-label',FRAMES[k].name);b.innerHTML=`<canvas width="160" height="96" aria-hidden="true"></canvas><span>${FRAMES[k].name}</span>`;
    /* a tap or click on another frame shows it, on the one shown chooses it; a pad or the keys show a frame as the focus
       reaches it, so A or Enter chooses */
    b.addEventListener('pointerdown',()=>{b._was=fs.k===k});b.addEventListener('focus',()=>{if(fs.on&&fs.k!==k)fsShow(k)});
    b.onclick=()=>{const was=b._was;b._was=null;if(fs.k!==k){fsShow(k);return}if(was===false)return;fsChoose()};R.append(b)}}
function fsShow(k){if(fs.k===k)return;fsvStop();fs.k=k;const F=FRAMES[k],d=derive(BARE,k);
  $('fsName').textContent=F.name;$('fsTag').textContent=F.tag;$('fsBlurb').textContent=FS_LINE[k];$('fsMods').textContent=frameMods(k);
  $('fsGo').textContent='Choose the '+F.name;$('fsRow').querySelectorAll('.fsb').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fk===k)));
  if(fs.ship){labScene.remove(fs.ship);disposeObj(fs.ship)}fs.ship=makeShip(paintOf(build),BARE,k);labScene.add(fs.ship);fs.t=0;fs.yaw=0.6;
  audio.sfx('ui_move');
  /* the line is read out the first time you look at a frame */
  const h=fsHeard();if(!h.includes(k)&&annOn&&fsvSay(k)){h.push(k);store.set('hoverline.fheard',JSON.stringify(h))}}
/* Prototype 61: a career started at the end of First flight goes straight on to the control tutorial with the frame just
   chosen (Eric: frame select, then the controls, then the career page); a new career from Career asks first, as before */
function fsChoose(){if(!fs.on)return;const k=fs.k;audio.sfx('ui_ok')||audio.chime(true);fsLeave();carNewStart(k);
  if(ffCar.on){ffCar.on=false;tutGo('career');return}fsGuide(k)}
$('fsGo').onclick=fsChoose;$('fsRep').onclick=()=>fsvSay(fs.k);
/* the arrow keys always move along the row, wherever the focus is (on the row itself the menu focus does it) */
addEventListener('keydown',e=>{if(S.state!=='fsel'||!(e.code==='ArrowLeft'||e.code==='ArrowRight')||$('fsel').hidden)return;const a=document.activeElement;if(a&&a.classList&&a.classList.contains('fsb'))return;
  e.preventDefault();e.stopPropagation();setDev('key');const i=FRAME_KEYS.indexOf(fs.k),k=FRAME_KEYS[(i+(e.code==='ArrowRight'?1:-1)+FRAME_KEYS.length)%FRAME_KEYS.length];fsShow(k);
  const b=$('fsRow').querySelector(`[data-fk="${k}"]`);if(b)navFocus(b)},true);$('fsBack').onclick=()=>{fsLeave();ffCar.on=false;carHomeOpen()};
/* the guidance question, in the same voice */
function fsGuide(k){const n=frameOf(k).name,x=TUT_FX[k];hidePages();
  $('tutAskP').textContent=`Six quick steps on the controls with your ${n}`+(x?`, then one on what the ${n} does best. About 40 seconds.`:', about half a minute.');
  $('tutAsk').hidden=false;if(annOn)fsvSay('guide')}
$('tutYes').addEventListener('click',fsvStop);$('tutNo').addEventListener('click',fsvStop);
/* small pictures of the eight frames for the row, drawn once each time the page opens (your paint may have changed) */
function fsThumbs(){try{const W=320,H=192,rt=new THREE.WebGLRenderTarget(W,H),cam=new THREE.PerspectiveCamera(30,W/H,0.1,100),px=new Uint8Array(W*H*4),prev=renderer.getRenderTarget();
    cam.position.set(3.3,1.9,4.7);cam.lookAt(0,-0.05,0);const vis=labScene.children.filter(o=>o.visible&&!o.isLight);for(const o of vis)o.visible=false;
    const c2=document.createElement('canvas');c2.width=W;c2.height=H;const g2=c2.getContext('2d'),id=g2.createImageData(W,H);
    for(const b of $('fsRow').children){const s=makeShip(paintOf(build),BARE,b.dataset.fk);s.rotation.y=0.55;labScene.add(s);renderer.setRenderTarget(rt);renderer.render(labScene,cam);renderer.readRenderTargetPixels(rt,0,0,W,H,px);labScene.remove(s);disposeObj(s);
      for(let y=0;y<H;y++)id.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4);g2.putImageData(id,0,0);const cv=b.querySelector('canvas'),g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.drawImage(c2,0,0,cv.width,cv.height)}
    renderer.setRenderTarget(prev);rt.dispose();for(const o of vis)o.visible=true;if(fs.ship)fs.ship.visible=true}catch(e){}}
/* the frame turns on the stand in the space the card and the row leave free; drag to turn it yourself */
function fsFrame(dt){readInput();fs.t+=dt;const sh=fs.ship,asp=cw/Math.max(1,ch);if(!sh)return;
  if(fs.drag==null)fs.yaw+=dt*0.4;const k=Math.min(1,fs.t/0.35),e=1-Math.pow(1-k,3);sh.rotation.y=fs.yaw-(1-e)*1.2;sh.scale.setScalar(0.82+0.18*e);sh.position.y=0.05*Math.sin(S.t*2.2);
  const ud=sh.userData;if(ud.extra&&ud.extra.spin)for(const q of ud.extra.spin)q.o.rotation[q.ax]+=(q.k*25+(q.w||0))*dt;
  const card=$('fsel').querySelector('.card').getBoundingClientRect(),row=$('fsRow').getBoundingClientRect();
  let x0=0,y0=0;const x1=cw,y1=Math.max(60,row.top);if(asp>=1)x0=Math.min(cw*0.6,card.right);else y0=Math.min(ch*0.6,card.bottom);
  const fw=Math.max(60,x1-x0),fh=Math.max(60,y1-y0),fov=asp<1?44:36,R=3.4,d=R*(ch/2)/(Math.tan(fov*Math.PI/360)*0.42*Math.min(fw,fh*1.4));labScene.fog.near=Math.max(16,d+3);labScene.fog.far=labScene.fog.near+26;
  labCam.aspect=asp;labCam.fov=fov;labCam.position.set(0,0.3*d+0.4,d);labCam.lookAt(0,-0.4,0);labCam.setViewOffset(cw,ch,cw/2-(x0+x1)/2,ch/2-(y0+y1)/2,cw,ch);labCam.updateProjectionMatrix()}
canvas.addEventListener('pointerdown',e=>{if(S.state!=='fsel')return;fs.drag=e.clientX;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(S.state!=='fsel'||fs.drag==null)return;fs.yaw+=(e.clientX-fs.drag)*0.012;fs.drag=e.clientX});
{const up=()=>{fs.drag=null};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up)}
