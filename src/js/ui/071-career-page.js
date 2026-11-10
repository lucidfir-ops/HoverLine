//# ui/071-career-page.js: the career page
/* ---------- the career page (Prototype 39) ----------
   A race tile asks first ("Race Rookie 2?", Yes / No; with a pad A opens it, A again is Yes, B is No). Credits are a
   plain tracker that opens the Frame lab, where frame points are bought. */
function carAsk(i){carSel(i);const t=CAR_T[i>>2],pay=Math.round(CAR_PAY[0]*t.pay);
  $('carAskT').textContent=`${t.n} · ${clsName(t.k)} · race ${(i&3)+1} of 4 · ${Math.round(t.k*100)}% speed`;$('carAskN').textContent=`Race ${t.n} ${(i&3)+1}?`;
  $('carAskI').textContent=`Track ${(i>>2)+1}.${(i&3)+1} · ${T.D.name}${T.cx?' · complex':''} · ${T.LN.name.toLowerCase()} · ${LAPS} laps · a win pays ${pay.toLocaleString('en')} ¢`+(car.best[i]&&car.best[i]<=3?` · cleared (best ${ord(car.best[i])})`:' · top 3 clears it');
  $('carAsk').hidden=false}
$('carAskYes').onclick=()=>{$('carAsk').hidden=true;startRace()};$('carAskNo').onclick=()=>{$('carAsk').hidden=true;audio.sfx('ui_back')};
function carCredUI(){const c=$('carCred');if(!c)return;const up=car.up<CAR_UP.length?CAR_UP[car.up]:0,can=!!up&&car.cr>=up;c.classList.toggle('can',can);
  c.innerHTML=`<span>Credits <b>${car.cr.toLocaleString('en')} ¢</b></span><small>${up?`Next frame point ${up.toLocaleString('en')} ¢`+(can?' · buy it in the Frame lab':''):'Frame complete · all 15 points'}</small>`}
$('carCred').onclick=openLab;
/* the Frame lab's buy control for the career frame: amber only when you can afford the point, which goes straight onto
   your lowest stat (thrust first) */
function labBuyUI(){const b=$('labBuy');if(!b)return;const on=!!S.car&&car.up<CAR_UP.length;b.hidden=!on;if(!on)return;const up=CAR_UP[car.up],can=car.cr>=up;
  b.classList.toggle('go',can);b.setAttribute('aria-disabled',String(!can));
  b.innerHTML=`${can?'Buy a frame point':'Next frame point'} · ${up.toLocaleString('en')} ¢<small>${can?`It goes on your lowest stat · you have ${car.cr.toLocaleString('en')} ¢`:`You have ${car.cr.toLocaleString('en')} ¢ · races pay credits`}</small>`}
$('labBuy').onclick=()=>{const up=CAR_UP[car.up];if(!S.car||!up||car.cr<up){audio.deny();const b=$('labBuy');b.classList.remove('deny');void b.offsetWidth;b.classList.add('deny');return}
  car.cr-=up;car.up++;BUD=CAR_P0+car.up;carSave();let k=null;for(const x of CAR_ORD)if(build.stats[x]<SMAX&&(!k||build.stats[x]<build.stats[k]))k=x;
  if(k&&spent(build)<BUD)changeStat(k,1);else labUI();audio.chime(true);labBuyUI()};
