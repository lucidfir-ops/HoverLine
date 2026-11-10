//# race/056-physics.js: the race state object S and lap counting
/* ---------- physics ---------- */
const S={state:'menu',shake:0,count:0,raceT:0,t:0,fly:0,car:null,train:null,cls:1,aiK:1};
let ammoWarnT=0;
function lapCheck(r){if(r.finishT!=null)return;const lap=Math.floor(r.utot/T.L);
  if(lap>r.done&&lap>=1){r.laps.push(S.raceT-r.lapStart);r.lapStart=S.raceT;r.done=lap;if(r===player)logEv('lap',{n:lap,t:r2(r.laps[r.laps.length-1]),place:rankOf(r)+1});
    if(lap>=LAPS){r.finishT=S.raceT;if(mp.on&&mp.sess&&!r.proxy&&r.key)mp.sess.send({t:'fin',k:r.key,T:r.finishT});if(r===player)finish()}
    else if(r===player){const fl=lap===LAPS-1;audio.sfx(fl?'final':'lap')||audio.blip(780,0.15);if(fl){music.final=true;audio.voice('final')}cue('lapBox','pulse');$('lapBox').classList.toggle('final',fl);
      const b=$('bestL');b.textContent='Lap '+fmt(r.laps[r.laps.length-1]);clearTimeout(b._t);b._t=setTimeout(()=>b.textContent='Best '+fmt(getBest()),4000)}}}
const HOVER=1.05,GRAV=32,HOLD=4.0,WLOCK=0; /* no weapons lock: everyone starts with empty weapon pods instead */
