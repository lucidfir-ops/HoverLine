//# ui/095-hud-prompts.js: the quiet HUD and the prompts
/* ---------- the quiet HUD and the prompts ----------
   Place, lap and shield, and ammo once modules are open (the rest is hidden by the qk classes). The module button and,
   with keys or a pad, one slot show the module the button will fire, glowing while it can. A prompt is a few words at
   the moment it matters, in the words of the device in use (as the tutorial names keys and pad buttons). */
const qkKey=a=>'<kbd>'+esc(keyName(bind.key[a][0]))+'</kbd>';
function qkSay(k){const key=lastDev==='key',pad=lastDev==='pad',inv=bind.padInvert;
  switch(k){
    case'steer':return key?'<kbd>←</kbd> <kbd>→</kbd> to steer':pad?'Left stick to steer':'Slide to steer';
    case'lean':return'Lean into the bends';
    case'pads':return'Blue pads · free speed';
    case'ammo':return'Purple strips fill your module';
    case'fire':return key?qkKey('w1')+' fires':pad?tutB('w1')+' fires':'Tap to fire';
    case'one':return key?'Missile or Cannon · '+qkKey('w1'):pad?'Missile or Cannon · '+tutB('w1'):'Missile or Cannon · one button';
    case'boost':return(key?'Hold '+qkKey('boost'):pad?'Hold '+tutB('boost'):'Hold boost')+' · costs shield';
    case'heal':return'Green strips heal your shield';
    case'split':return'Road splits · pick a side';
    case'down':return'Green V · nose down · '+(key?'<kbd>↑</kbd>':pad?'stick '+(inv?'down':'up'):'slide ▲');
    case'up':return'Grey Λ · nose up · '+(key?'<kbd>↓</kbd>':pad?'stick '+(inv?'up':'down'):'slide ▼');
    case'drift':return'Steer and hold '+(key?qkKey('brake'):pad?tutB('brake'):'Brake')+' · drift'}
  return''}
const QK_HI={steer:'steerSl',fire:'qkFire',one:'qkFire',boost:'bst',down:'pslide',up:'pslide',drift:'brk'};
/* each step's prompts: at a time after GO (t) or a distance into lap 1 (u, metres), worked out from the track itself */
function qkTips(n){const q=QK_T[n],out=[],at=(k,u)=>{if(u!=null&&isFinite(u))out.push({k,u:Math.max(0,u)})};
  const am=T.zones.filter(z=>z.kind==='ammo'&&!z.sp).sort((a,b)=>a.u0-b.u0),hp=T.zones.find(z=>z.kind==='hp'&&!z.sp),pd=T.pads.filter(p=>!p.sp).sort((a,b)=>a.u0-b.u0);
  if(n===1){out.push({k:'steer',t:0.6});at('lean',q.lean);if(pd[0])at('pads',pd[0].u0-140)}
  if(n===2){out.push({k:'ammo',t:0.4});if(am[0])at('fire',am[0].u1+30)}
  if(n===3){at('boost',q.straight);if(hp)at('heal',hp.u0-160)}
  if(n===4){out.push({k:'one',t:1.2});if(T.splits[0])at('split',T.splits[0].u0-520)}
  if(n===5){const mk=t=>T.marks.filter(m=>m.type===t).map(m=>m.lo*T.ds).sort((a,b)=>a-b)[0];at('down',mk('dive')-130);at('up',mk('up')-130);
    /* the brake is for drifting: the prompt comes before the longest bend (106 degrees, from 1198 m), after the strip */
    at('drift',1110)}
  return out.sort((a,b)=>(a.t!=null?a.t*90:a.u)-(b.t!=null?b.t*90:b.u))}
function qkTipShow(k){const el=$('qkTip');el.innerHTML=qkSay(k);el.hidden=false;void el.offsetWidth;el.classList.add('on');QK.tip=k;QK.tipT=2.8;tutHi(null);if(coarse&&QK_HI[k]&&$(QK_HI[k]))$(QK_HI[k]).classList.add('tutHi')}
function qkTipHide(){const el=$('qkTip');if(!el)return;el.classList.remove('on');QK.tip=null;try{tutHi(null)}catch(e){}clearTimeout(el._h);el._h=setTimeout(()=>{if(!QK.tip)el.hidden=true},400)}
function qkHud(dt){if(!QK.live)return;
  if(S.state==='race'&&QK.tip){QK.tipT-=dt;if(QK.tipT<=0)qkTipHide()}
  if(S.state==='race'&&!QK.tip&&QK.tips.length&&player.done===0){const t=QK.tips[0];if(t.t!=null?S.raceT>=t.t:player.utot>=t.u){QK.tips.shift();qkTipShow(t.k)}}
  if((QK.hud-=dt)>0||QK.lvl<2)return;QK.hud=0.1;
  if(QK.holdK<0)QK.slot=qkPick();const k=QK.holdK<0?QK.slot:QK.holdK,w=player.weapons[k],rdy=S.state==='race'&&canFire(player,k),emp=player.emp>0;
  const b=$('qkFire'),h=icon(w);if(b._h!==h){b._h=h;b.innerHTML=h;b.setAttribute('aria-label',WDEF[w].name)}b.classList.toggle('rdy',rdy);b.classList.toggle('emp',emp);
  const sl=$('qkSlot'),sh=`<kbd class="${lastDev==='pad'?padCls(bind.pad.w1):''}">${lastDev==='pad'?padFace(bind.pad.w1):esc(actLabel('w1'))}</kbd>${h}`;if(sl._h!==sh){sl._h=sh;sl.innerHTML=sh;sl.title=WDEF[w].name}sl.classList.toggle('rdy',rdy)}

