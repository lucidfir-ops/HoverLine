//# ui/092-enter-race-leave.js: entering, racing and leaving a race
/* ---------- entering, racing and leaving ---------- */
const qkB=(c,on)=>{const b=document.body;if(b)b.classList.toggle(c,!!on)};
function qkClasses(){qkB('qk',QK.live);qkB('qkM',QK.live&&QK.lvl>=2);qkB('qkB',QK.live&&QK.lvl>=3);qkB('qkN',QK.live&&QK.lvl>=5);qkB('qkT',QK.live&&touchUI())}
/* step n of the ladder (or, once the ladder is done, track n with everything open) */
function qkSet(n){QK.cur=n;QK.post=!QK.rep&&QK.next>QK_N;QK.lvl=QK.post?QK_N:n;LAPS=2;S.car=null;S.trial=false;S.train=null;
  if(!QK.own){QK.own=build;build=qkBuild();applyBuild()}
  steerMode='slider';applySteerMode();psl.hidden=QK.lvl<5;qkClasses()}
function qkLoad(n){if(!(spec&&spec.quick===n&&T&&T.sp&&T.sp.quick===n))loadTrack(QK_T[n].seed,'W',false,'M',qkSpec(n),qkBio(n));qkField()}
/* five AI, not seven: Pell and Wisp (the back row) sit out */
function qkField(){if(!QK.live)return;/* the quick races' AI flies without hands (Prototype 50), at its old pace */for(let i=1;i<roster.length;i++)if(ROSTER[i].sk0)roster[i].skill=ROSTER[i].sk0;for(const nm of['Pell','Wisp']){const r=roster.find(x=>x.name===nm);if(!r)continue;r.off=true;if(r.ship)r.ship.visible=false;if(r.shadow)r.shadow.visible=false;const i=racers.indexOf(r);if(i>=0)racers.splice(i,1)}}
const qkTrack=()=>QK.next>QK_N?QK.rot+1:QK.next;
function qkWant(){if(!(typeof HTMLElement!=='undefined'&&$('qkTap') instanceof HTMLElement))return 0;/* not in the headless simulator */
  const q=QS.get('quick');if(q==='0'||QS.has('mp'))return 0;if(+q>=1&&+q<=QK_N){QK.next=Math.max(1,+q);QK.on=true;return +q}if(BOT)return 0;
  return qkOn()?qkTrack():0}
/* At load (before the first track is built): a quick race builds its own track instead of the title's. */
function qkBoot(){const n=qkWant();if(!n)return;QK.home={seed,wid,cplx,lenK,spec,bio};QK.live=true;qkSet(n);
  seed=QK_T[n].seed;wid='W';cplx=false;lenK='M';spec=qkSpec(n);bio=qkBio(n);$('title').hidden=true;qkTapShow();setTimeout(qkField,0)}
/* the ladder as five dots: races done filled, the one to race ringed (on the end screen the race just run counts as done) */
function qkDots(id,done){const el=$(id);if(!el)return;const d=done?QK.cur:QK.cur-1;el.innerHTML=QK.post?'':Array.from({length:QK_N},(_,i)=>`<i class="${i<d?'d':i===d?'c':''}"></i>`).join('');el.setAttribute('aria-label',QK.post?'':done?'Race '+QK.cur+' of '+QK_N+' done':'Race '+QK.cur+' of '+QK_N)}
/* Prototype 61: the button names the device in use (a pad's A, Enter, a tap or a click), and the corner chip is always
   there: Skip on First flight, Back on a replay from Training, Menu once the five are done */
function qkGoLabel(){const g=$('qkGo');if(g)g.textContent=lastDev==='pad'?'Press '+padName(0)+' to race':touchUI()?'Tap to race':lastDev==='key'&&NAV.ptr===false?'Press Enter to race':coarse?'Tap to race':'Click to race'}
function qkTapShow(){if(orAsk()){orShow(qkTapShow);return}qkGoLabel();qkDots('qkTapDots');const m=$('qkTapMenu');m.textContent=QK.rep?'Back':QK.post?'Menu':'Skip';m.hidden=false;$('qkTap').hidden=false}
function qkGo(){if($('qkTap').hidden)return;$('qkTap').hidden=true;audio.init();if(coarse)goFull();if(QK.on==null)QK.on=true;qkRace(QK.cur)}
/* a race of track n: the countdown starts straight away */
function qkRace(n){qkFlush('next');qkSet(n);qkLoad(n);QK.tries[n-1]=(QK.tries[n-1]||0)+1;qkSave();$('qkEnd').hidden=true;qkTipHide();startRace()}
/* after startRace: a missile's worth of ammo from race 2, the quiet HUD, the prompts for this step */
function qkGoRace(){qkB('qkRun',true);qkClasses();if(QK.lvl>=2)player.ammo=Math.min(player.d.ammo,WDEF.missile.cost+1);QK.slot=0;QK.holdK=-1;
  QK.tips=QK.post?[]:qkTips(QK.cur);QK.tip=null}
const qkTag=()=>({step:QK.cur,of:QK_N,lvl:QK.lvl,ladder:!QK.post,try:QK.tries[QK.cur-1]||1,run:QK.runs+1});
function qkFinish(){S.state='done';setTimeout(()=>logEnd('finish'),1600);
  const place=rankOf(player)+1,c=$('count');c.hidden=false;c.classList.add('go');c.textContent=place===1?'WIN':ord(place);
  if(place===1)setTimeout(()=>audio.voice('win'),300);else if(place<=3)setTimeout(()=>audio.voice('podium'),300);setTimeout(()=>{if(S.state==='done')c.hidden=true},1600);
  music.setMood('results');qkTipHide();QK.place=place;QK.runs++;const n=QK.cur;
  if(QK.post)QK.rot=n%QK_N;else{QK.best[n-1]=QK.best[n-1]?Math.min(QK.best[n-1],place):place;if(QK.next<=n)QK.next=n+1}qkSave();
  setTimeout(()=>{if(S.state==='done'&&QK.live)qkEndShow()},1700)}
function qkEndShow(){setHud(false);qkB('qkRun',false);const ready=!QK.post&&QK.cur===QK_N;
  $('qkEndPos').innerHTML=(QK.place===1?'1st':ord(QK.place))+`<small>${fmt(player.finishT)}</small>`;qkDots('qkEndDots',true);
  $('qkEndMsg').hidden=!ready;document.querySelector('#qkEnd .qkBtns').classList.toggle('ready',ready);$('qkEndPos').hidden=ready;$('qkAgain').hidden=ready;
  /* Prototype 61: the end of First flight offers a new career (frame select, control tutorial, career page) when there is
     none yet; a replay from Training goes back there. "Start with a quick race" only matters after the five, so it shows then. */
  $('qkNext').textContent=ready?(!carExists()?'Start new career':QK.rep?'Done':'Career'):'Next race';$('qkMenu').textContent=QK.rep?'Back to training':'Main menu';
  $('qkOnEnd').parentElement.hidden=!QK.post;$('qkEndSub').hidden=!(ready&&!carExists());
  const bv=$('qrView');bv.hidden=!(typeof betterViewWanted==='function'&&betterViewWanted());
  qkChipSync();$('qkEnd').hidden=false}
/* leave the quick race for the menus: your frame, steering, laps and title track come back */
function qkLeave(){if(!QK.live)return;QK.live=false;QK.rep=false;qkTipHide();qkB('qkRun',false);qkClasses();LAPS=3;['qkTap','qkEnd'].forEach(i=>$(i).hidden=true);try{orSync()}catch(e){}
  if(QK.own){build=QK.own;QK.own=null;applyBuild()}
  tsUse(TS.race||orNow());
  const h=QK.home,c=parseCode(store.get('hoverline.code'));QK.home=null;
  if(c)loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp||null,c.bm);else if(h)loadTrack(h.seed,h.wid,h.cplx,h.lenK,h.spec||null,h.bio);else newTrack();
  S.state='menu';camInit=false}
/* Prototype 61: leaving before race 5 is done skips First flight: it stops starting by itself and a note says where to
   replay it. From the Tap to race screen (tap) nothing has raced, so the menu music is left as it is. */
const FF_NOTE='First flight skipped. Replay it any time from Training › First flight.';
function qkMenu(why,tap){const grad=!QK.post&&QK.cur===QK_N&&player.finishT!=null&&S.state==='done',rep=QK.rep,skip=!rep&&!QK.post&&!grad;
  qkFlush(why);if(LOG.cur){if(LOG.cur.quick)LOG.cur.quick.next=why;logEnd(player.finishT!=null?'finish':'quit')}
  S.state='menu';setHud(false);['pause','results','count','opts','set','ctl','mus','gfxm'].forEach(i=>$(i).hidden=true);qkLeave();
  if(grad&&qkOn())qkToggle(false,'ladder');if(skip&&QK.on!==false)qkToggle(false,'skip');
  if(why==='career'){if(carExists())carHomeOpen();else ffCareer()}else if(rep)showPage('trmenu');else showPage('title');
  if(!tap)menuMusic();if(skip)note(FF_NOTE,5000)}
/* the end of First flight: a new career's frame select, then the control tutorial with that frame, then the career page */
function ffCareer(){ffCar.on=true;fsOpen()}
const ffCar={on:false};
/* Prototype 61: Training › First flight replays the five from the menus (from the next one, while the five aren't done)
   in the Blade, on the slider, off every board; the career, your builds, bests and settings stay as they are */
function qkReplay(){if(QK.live||S.state!=='menu')return;if(typeof car!=='undefined'&&car.free)carLeave();if(TRN.on)trLeave();
  QK.rep=true;QK.home={seed,wid,cplx,lenK,spec,bio};QK.live=true;const n=QK.next<=QK_N?QK.next:1;qkSet(n);qkLoad(n);hidePages();$('title').hidden=true;qkTapShow()}

