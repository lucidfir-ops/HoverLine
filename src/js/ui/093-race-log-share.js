//# ui/093-race-log-share.js: sharing the finished race's log
/* ---------- the finished race's log: shared once the player has chosen what next ----------
   A quick race's log is kept back from the shared logs until the end screen is left (Next race, Rematch, Main menu or
   Career), the page is hidden or closed, or two minutes pass, so the shared copy says what the player did next
   (quick.next) and whether they turned "Start with a quick race" off (quick.toggle). */
function qkHold(L){QK.pend=L;clearTimeout(QK.hold);QK.hold=setTimeout(()=>qkFlush('idle'),120000)}
function qkFlush(why,beacon){const L=QK.pend;if(!L)return;QK.pend=null;clearTimeout(QK.hold);if(L.quick&&!L.quick.next)L.quick.next=why;
  if(logIndex().includes(L.id))store.set('hoverline.log.'+L.id,JSON.stringify(L));logShare(L,beacon)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')qkFlush('away',true)});
addEventListener('pagehide',()=>qkFlush('closed',true));
function qkToggle(v,where){QK.on=!!v;qkSave();qkChipSync();
  const L=QK.pend||(LOG.last&&LOG.last.quick?LOG.last:null);if(L&&L.quick){L.quick.toggle=QK.on;L.quick.toggleAt=where;if(L!==QK.pend&&logIndex().includes(L.id))store.set('hoverline.log.'+L.id,JSON.stringify(L))}}
function qkChipSync(){const v=String(!!qkOn());for(const id of['qkOnEnd','qkChip']){const b=$(id);if(b)b.setAttribute('aria-pressed',v)}}

