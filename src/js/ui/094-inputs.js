//# ui/094-inputs.js: input wiring for menus and races
/* ---------- inputs ----------
   Only what this step has opened: steering always; the module button from race 2 (one button that fires whatever is
   ready: the Missile when it would find a target, otherwise the Cannon from race 4); boost from race 3; the nose from
   race 5, until then the AI's own choice of pitch; never the brake, and never tilt. */
function qkPick(){if(QK.lvl<4)return 0;const m=canFire(player,0),c=canFire(player,1);return m&&aiWants(player,'missile')?0:c?1:m?0:player.ammo>=WDEF.cannon.cost?1:0}
function qkIn(i){const L=QK.lvl;if(L<5)i.brake=0;
  if(L<5)i.pitch=player.wreck>0||player.finishT!=null?0:aiInput(player,1/60).pitch;
  if(L<3)i.boost=false;
  if(L<2){i.fire=[false,false];i.hold=[false,false]}
  else{const pr=i.fire[0]||i.fire[1],hd=i.hold[0]||i.hold[1];if(pr||QK.holdK<0&&hd)QK.holdK=qkPick();const k=QK.holdK<0?QK.slot:QK.holdK;if(!hd&&!pr)QK.holdK=-1;
    i.fire=[pr&&k===0,pr&&k===1];i.hold=[hd&&k===0,hd&&k===1]}
  return i}
{const b=$('qkFire');const on=e=>{touch.f1=1;fireQ[0]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()},off=()=>{touch.f1=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,off);b.addEventListener('contextmenu',e=>e.preventDefault())}

