//# ui/062-fullscreen-controls.js: full screen and the Controls screen (touch, tilt and keys setup)
/* ---------- full screen and the Controls screen ----------
   On phones and tablets: a Full screen button in the menu, and Race / Multiplayer / Controls go full screen (landscape)
   on the first tap. Controls has four quick setups and the individual options, with a sketch of the layout; it opens
   from the menu, the pause menu and the multiplayer lobby, so the layout can be changed mid-race. */
const canFull=!!document.documentElement.requestFullscreen;
/* Prototype 40: full screen without forcing landscape (it used to lock every phone sideways). A race holds whichever way the
   phone is held when its HUD comes up, portrait or landscape, so turning the phone to steer by tilt can't turn the screen;
   menus let go of the lock. iPhones have neither full screen nor a lock for web pages, so there the page just follows the
   phone (iPads have full screen). */
function goFull(){if(!coarse||!canFull||document.fullscreenElement)return;document.documentElement.requestFullscreen().then(orSync).catch(()=>{})}
const OR={on:false,next:null};
/* Prototype 59: keep the screen awake through a race (where the browser allows it); let go in the menus */
const WAKE={l:null};function wakeScreen(on){try{if(on){if(!WAKE.l&&navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{WAKE.l=l;l.addEventListener('release',()=>{WAKE.l=null})}).catch(()=>{})}else if(WAKE.l){WAKE.l.release();WAKE.l=null}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.state!=="menu")wakeScreen(true)});
