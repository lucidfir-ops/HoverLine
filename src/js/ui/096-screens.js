//# ui/096-screens.js: the screens and the title page
/* ---------- the screens ---------- */
$('qkTap').addEventListener('click',e=>{if(e.target.closest('#qkTapMenu'))return;if(coarse&&REAL)askMotion();qkGo()});
addEventListener('keydown',e=>{if(!$('qkTap').hidden&&(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter')&&!e.repeat){e.preventDefault();qkGo()}});
$('qkTapMenu').onclick=()=>{qkLeave();showPage('title')};
$('qkNext').onclick=()=>{if(!QK.post&&QK.cur===QK_N){qkMenu('career');return}qkRace(QK.post?QK.cur%QK_N+1:Math.min(QK_N,QK.cur+1))};
$('qkAgain').onclick=()=>{qkFlush('rematch');qkRace(QK.cur)};
$('qkMenu').onclick=()=>qkMenu('menu');
$('qrView').onclick=()=>{if(typeof betterView==='function')betterView()};
$('qkOnEnd').onclick=()=>qkToggle(!qkOn(),'end');
$('qkChip').onclick=()=>qkToggle(!qkOn(),'settings');
qkChipSync();

qkBoot();if(!QK.live&&orAsk())orShow(null);
loadTrack(seed);
tuneUI();buildSummary();
requestAnimationFrame(frame);
})();
