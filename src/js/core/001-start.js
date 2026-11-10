//# core/001-start.js: boot: helpers ($, store, rng), constants, the state object S, query flags (bot, share, lb, render)

(()=>{
const $=id=>document.getElementById(id);
const TAU=Math.PI*2, VMAX=150; let W=20, LAPS=3;
const QS=new URLSearchParams(location.search),BOT=QS.get('bot')==='1',NO_RENDER=QS.get('render')==='0';
/* Online leaderboard. Paste the address of your deployed worker here (see the leaderboard kit); empty = off. */
const LB_URL='https://hoverline-board.lucidfir.workers.dev';const LB=(QS.get('lb')||LB_URL).replace(/\/+$/,'');
/* Board era: times only compare with times from the same era. Raise it to the new prototype number whenever a change
   makes old times unfair (a track code builds a different road, or handling/speed changes); the boards then start fresh. */
const BOARD_ERA=58;
const DIFF={
  W:{name:'Wide',w:26,n:[8,10],rad:[480,260],elev:50,minR:125,sharp:0.5,pitchy:0.42,steep:0.3,ai:0.92,assist:1.8,wall:0.22,band:[0.12,0.22],dmg:0.6},
  S:{name:'Standard',w:20,n:[9,12],rad:[400,380],elev:100,minR:75,sharp:0.66,pitchy:0.42,steep:0.38,ai:0.96,assist:1.0,wall:0.35,band:[0.08,0.15],dmg:0.85},
  N:{name:'Narrow',w:15,n:[11,15],rad:[340,480],elev:150,minR:40,sharp:0.76,pitchy:0.42,steep:0.45,ai:1.0,assist:0.5,wall:0.45,band:[0.06,0.09],dmg:1}};
/* minR: the tightest bend averaged over 60 m; sharp: the most the heading may turn in any 30 m, and pitchy the most the
   pitch may change in any 30 m (radians); steep: the steepest slope of the base loop (features add their own). */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmt=t=>{if(t==null||!isFinite(t))return'—';const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2)};
const ord=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* Touch detection: many Android tablets (and Chrome's desktop-site mode) don't report pointer:coarse, so check every signal and allow a manual override. */
const touchSaved=store.get('hoverline.touch');
const touchCapable=matchMedia('(pointer: coarse)').matches||matchMedia('(any-pointer: coarse)').matches||(navigator.maxTouchPoints||0)>0||'ontouchstart' in window;
let coarse=touchSaved==='1'?true:touchSaved==='0'?false:touchCapable;

