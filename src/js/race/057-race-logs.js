//# race/057-race-logs.js: race logs: what is recorded per race, export
/* ---------- race logs ----------
   Every race is recorded for tuning: settings, the field, four samples a second of your ship (position, speed, nose,
   dive, steering, brake, boost, shield, ammo, place, air), and events (shots, hits, wrecks, walls, lift-offs, falls,
   pads, routes, laps, tunes). The last 60 are kept in this browser (fewer if storage fills up); Controls and the results screen download them as
   JSON. Your profile (pace against the AI and your habits) feeds the rival AIs. */
const LOG={on:store.get('hoverline.logrec')!=='0',cur:null,src:null,by:null,wallT:0,lastSrc:null};
/* The device, so slow devices can be tuned for (Prototype 31): browser, cores, memory, graphics chip, screen. Each log adds
   how big the game drew, the look, a frame rate with every sample, and a frame-time summary (perf). */
const DEVICE=(()=>{const d={ua:String(navigator.userAgent||'').slice(0,220),cores:navigator.hardwareConcurrency||null,mem:navigator.deviceMemory||null,dpr:+(devicePixelRatio||1).toFixed(2),screen:[screen.width,screen.height],webgl2:!!renderer.capabilities.isWebGL2};
  try{const gl=renderer.getContext(),x=gl.getExtension('WEBGL_debug_renderer_info');d.gpu=String(x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)).slice(0,140)}catch(e){}return d})();
/* Weak machines start on Ultra low (Prototype 38). Not in test runs (share, bot or lb in the address). */
const AUTOUL=!(QS.has('share')||QS.has('bot')||QS.has('lb')),UL={f:0,t:0};
function goPerf(k,why){perfApply(k,why==='slow'||why==='lite');store.set('hoverline.autoUltra',why)}
function goUltra(why){goPerf('ultra',why)}
/* a switch made during a race changes the music once the race is over */
setInterval(()=>{if(!PERF.want||['race','countdown','paused','tut'].includes(S.state))return;const m=PERF.want;PERF.want=null;music.setMode(m);if(music.style!=='off')music.ensure();try{tuneUI()}catch(e){}},1000);
if(AUTOUL&&!store.get('hoverline.autoUltra')&&store.get('hoverline.style')==null&&store.get('hoverline.res')==null){const g=(DEVICE.gpu||'').toLowerCase();
  if(/llvmpipe|swiftshader|softpipe|basic render|software rasterizer|mesa offscreen/.test(g)){goUltra('soft');setTimeout(()=>note('This browser is drawing without the graphics card, so the game starts on Ultra low. Turning on hardware acceleration in the browser makes it much smoother.',8000),1800)}}
/* the first race on a setup nobody chose: from 4 to 24 s in, under 30 fps it switches to Ultra low, under 45 to Lite */
function ulCheck(raw){if(!AUTOUL||S.state!=='race'||FCAP.v||store.get('hoverline.autoUltra')||!(raw>0&&raw<0.5))return;if(S.raceT<4)return;UL.f++;UL.t+=raw;
  if(S.raceT>=24){const fps=UL.f/UL.t,k=fps<30?'ultra':fps<45?'lite':null;if(k&&styleNow()!=='ultra'&&store.get('hoverline.style')==null){goPerf(k,k==='ultra'?'slow':'lite');note(`The game ran at ${Math.round(fps)} fps here, so it switched to ${STYLES[k].n} · Options, Settings to change it`,6000)}else store.set('hoverline.autoUltra','ok')}}
function logFrame(raw){ulCheck(raw);const L=LOG.cur;if(!L||S.state!=='race'||!(raw>0))return;L.fN++;L.fh[Math.min(100,Math.round(raw*1000))]++}
const r1=x=>Math.round(x*10)/10,r2=x=>Math.round(x*100)/100;
function logStart(){if(!LOG.on){LOG.cur=null;return}const fc={};for(const f of T.feats)fc[f.kind]=(fc[f.kind]||0)+1;
  LOG.cur={v:2,game:'Hoverline '+($('title').querySelector('.sub')||{}).textContent,id:Date.now().toString(36),when:new Date().toISOString(),mode:QK.live?'quick':SPL.race?'split':S.car?'career':S.train?'training':S.trial?'trial':mp.on?'room':'race',quick:QK.live?qkTag():undefined,cls:S.cls,clsName:clsName(S.cls),ail:S.ail,
    rn:RACE.n,/* Prototype 61: this race's number; the track code and this replay the race (?racen=, RACE.force) */
    track:{code:codeStr(),name:T.D.name,complex:!!T.cx,len:Math.round(T.L),laps:LAPS,feats:fc,splits:T.splits.length,fig8:!!T.fig8,marks:(T.marks||[]).length},
    ship:{frame:build.frame,stats:{...build.stats},weapons:[...build.weapons]},
    input:{dev:lastDev,pads:(()=>{try{return[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean).map(p=>String(p.id||'').slice(0,48))}catch(e){return[]}})(),pad:lastDev==='pad'?PAD.kind:null,padId:lastDev==='pad'?String(PAD.id||'').slice(0,64):null,touch:coarse,tilt:tilt.enabled&&tilt.ok,tiltPitch:tilt.pitchMode,steer:typeof steerMode!=='undefined'?steerMode:null,pitchSlider:typeof pitchSlider!=='undefined'?pitchSlider:null,padInvert:bind.padInvert,cam:camMode,or:TS.race||orNow(),orSet:orPick||undefined,mods:TL.last?TL.last.mode:null},
    music:{style:music.style,goff:(()=>{try{return JSON.parse(store.get('hoverline.mgoff')||'[]')}catch(e){return[]}})(),likes:MLIKE.on(),liked:[...new Set(MLIKE.get().filter(x=>x[1]>=3).map(x=>x[0]))],lib:music.libMode||undefined,trackRace:music.rRot,code:music.code(),tpl:music.T?music.T.id:undefined,tname:music.T?music.T.n:undefined,mode:music.modeEff(),evolving:music.evo,shuffle:music.shuffle,lite:music.lite,vol:audio.volM,sfx:audio.volS},gfx:Object.keys(G2).filter(k=>G2[k]).join(',')||'none',
    device:{...DEVICE,view:[cw,ch],draw:[canvas.width,canvas.height],res:RES.k,low:RES.low,fcap:FCAP.v,style:styleNow()||'own',sky:tod},
    field:racers.map(r=>({name:r.name,me:r===player||undefined,ai:!!r.isAI,ghost:!!r.isGhost,rival:!!r.rival,frame:r.build?r.build.frame:null,skill:r.skill?r2(r.skill):null,weapons:r.weapons?[...r.weapons]:[]})),
    cols:['t','u','lat','v','pitch','dive','steer','brake','boost','hp','ammo','place','air','h','fps','drift'],s:[],ev:[],fN:0,fT:0,fh:new Array(101).fill(0),
    acc:{boostT:0,selfBoostT:0,diveT:0,downT:0,upT:0,airT:0,crestAirT:0,scrapeT:0,emptyT:0,lowT:0,vSum:0,vN:0,vMax:0,shots:{},hitsOn:{},hitsBy:{},dmg:{},wall:0,wallDmg:0,wrecks:0,falls:0,offs:0,clips:0,pads:0,routes:{long:0,short:0},drifts:0,driftT:0,taps:0,tapT:0,driftDv:0,driftEnds:{}},
    nextS:0,brS:null}}
function logEv(type,o){const L=LOG.cur;if(!L||L.ev.length>4000)return;L.ev.push({t:r2(S.raceT),e:type,...(o||{})})}
function logTick(dt){const L=LOG.cur;if(!L||S.state!=='race')return;const p=player,A=L.acc;
  if(p.boost>0)A.boostT+=dt;if(p.selfBoost)A.selfBoostT+=dt;if((p.dive||0)>0.3)A.diveT+=dt;if(p.pitch<-0.3)A.downT+=dt;if(p.pitch>0.3)A.upT+=dt;if(p.air)A.airT+=dt;if(p.air===true)A.crestAirT+=dt;
  if(S.raceT>=WLOCK&&p.weapons.every(w=>WDEF[w].passive||p.ammo<WDEF[w].cost))A.emptyT+=dt;if(p.hp<p.d.hp*0.25)A.lowT+=dt;A.vSum+=p.v;A.vN++;A.vMax=Math.max(A.vMax,p.v);
  /* Prototype 38: the Drifter's drifts, start (speed, steer) and end (how long, speed), so the logs show how people use it */
  if(p.drift&&!L.dr){L.dr={t:S.raceT,v:p.v,nw:!!p.dN};logEv('drift',{v:Math.round(p.v),steer:r2(p.steerS||0),...drLogS(p)})}else if(!p.drift&&L.dr){const d=S.raceT-L.dr.t;A.drifts++;A.driftT+=d;logEv('driftEnd',{d:r2(d),v:Math.round(p.v),dv:Math.round(p.v-L.dr.v),...(L.dr.nw?drLogE(p,A):{})});L.dr=null}
  if(p.brS!==L.brS){L.brS=p.brS;if(p.brS&&p.brS.b&&p.br!=null){const lg=!!p.brS.b[p.br].long;A.routes[lg?'long':'short']++;logEv('route',{long:lg})}}
  if(S.raceT>=L.nextS){L.nextS=S.raceT+0.25;const now=performance.now(),fps=L.fT?Math.round(L.fN*1000/Math.max(1,now-L.fT)):null;L.fT=now;L.fN=0;L.s.push([r2(S.raceT),Math.round(p.utot),r1(p.lat),Math.round(p.v),r2(p.pitch),r2(p.dive||0),r2(p.steerS),r2(p.brk),p.boost>0||p.selfBoost?1:0,Math.round(p.hp),Math.round(p.ammo),rankOf(p)+1,p.air?(p.air===true?1:2):0,r1(p.air?p.h:HOVER),fps,p.drift||0])}}
function logEnd(how){const L=LOG.cur;if(!L)return;LOG.cur=null;const p=player,A=L.acc,rk=ranking();
  L.result={how,place:rk.indexOf(p)+1,finishT:p.finishT,laps:p.laps.map(r2),raceT:r2(S.raceT),
    field:rk.map((r,i)=>({name:r.name,place:i+1,finishT:r.finishT!=null?r2(r.finishT):null,laps:(r.laps||[]).map(r2),wrecks:r.stat?r.stat.wrecks:null,dmgTaken:r.stat?Math.round(r.stat.dmg):null,hitsGiven:r.stat?r.stat.given:null,boostT:r.stat?r1(r.stat.boostT):null,rival:!!r.rival}))};
  L.summary={boostT:r1(A.boostT),selfBoostT:r1(A.selfBoostT),diveT:r1(A.diveT),noseDownT:r1(A.downT),noseUpT:r1(A.upT),airT:r1(A.airT),crestAirT:r1(A.crestAirT),scrapeT:r1(A.scrapeT),drifts:A.drifts,driftT:r1(A.driftT),taps:A.taps||0,tapT:r1(A.tapT||0),driftDv:Math.round(A.driftDv||0),driftEnds:A.driftEnds||{},
    noAmmoT:r1(A.emptyT),lowShieldT:r1(A.lowT),avgSpeed:A.vN?Math.round(A.vSum/A.vN):0,maxSpeed:Math.round(A.vMax),shots:A.shots,hitsOn:A.hitsOn,hitsBy:A.hitsBy,dmgTaken:Object.fromEntries(Object.entries(A.dmg).map(([k,v])=>[k,r1(v)])),
    wallHits:A.wall,wallDmg:r1(A.wallDmg),wrecks:A.wrecks,falls:A.falls,offs:A.offs,clips:A.clips,pads:A.pads,routes:A.routes};
  /* frame times: the average frame rate, the rate the slowest 5% and 1% of frames ran at, and frames over 50 ms */
  {const h=L.fh,n=h.reduce((a,b)=>a+b,0),pct=q=>{let c=0;for(let k=100;k>=0;k--){c+=h[k];if(c>=n*q)return Math.round(1000/Math.max(1,k))}return null};let tot=0;h.forEach((c,k)=>tot+=c*Math.max(1,k));
    L.perf={frames:n,fps:n?Math.round(n*1000/tot):null,fps5:n?pct(0.05):null,fps1:n?pct(0.01):null,slow:h.slice(51).reduce((a,b)=>a+b,0),calls:GFX.calls||null,tris:GFX.tris||null,hist:h.map((c,k)=>c?k+':'+c:'').filter(Boolean).join(' ')}}
  delete L.acc;delete L.nextS;delete L.brS;delete L.fN;delete L.fT;delete L.fh;
  if(L.s.length<8&&how!=='finish')return; /* nothing worth keeping */
  logSave(L);if(L.quick&&how==='finish')qkHold(L);else logShare(L);if(how==='finish'&&L.mode==='race')profileAdd(L);LOG.last=L}
/* Shared race data: with Share race data on, each saved race log also goes to the leaderboard server (POST /log) so the
   game can be balanced from everyone's races, not just the developer's. Names of other humans in a room are replaced. */
LOG.share=store.get('hoverline.share')!=='0';
function logShareable(L){const o=JSON.parse(JSON.stringify(L)),map=new Map();let k=0;
  const hasMe=(o.field||[]).some(f=>f.me);(o.field||[]).forEach((f,i)=>{if(!f.ai&&!f.ghost&&!map.has(f.name))map.set(f.name,(hasMe?f.me:i===0)?'You':'Pilot '+(++k))});
  const nm=n=>map.has(n)?map.get(n):n;for(const f of o.field||[])f.name=nm(f.name);if(o.result)for(const f of o.result.field||[])f.name=nm(f.name);for(const e of o.ev||[])if(e.to)e.to=nm(e.to);return o}
function logShare(L,bc){if(!LOG.share||!LB||QS.get('share')==='0')return;try{const body=JSON.stringify({v:62,log:logShareable(L)});if(body.length>400000)return;
  if(bc&&navigator.sendBeacon&&navigator.sendBeacon(LB+'/log',new Blob([body],{type:'text/plain'})))return; /* a page being closed: a beacon still gets there */
  fetch(LB+'/log',{method:'POST',headers:{'Content-Type':'application/json'},body}).then(r=>{LOG.sent=(LOG.sent||0)+(r.ok?1:0)}).catch(()=>{})}catch(e){}}
function logIndex(){try{return JSON.parse(store.get('hoverline.logs')||'[]')}catch(e){return[]}}
function logSave(L){let idx=logIndex();idx.push(L.id);while(idx.length>60){store.del?store.del('hoverline.log.'+idx[0]):store.set('hoverline.log.'+idx[0],'');idx.shift()}
  const txt=JSON.stringify(L);for(let k=0;k<6;k++){store.set('hoverline.log.'+L.id,txt);if((store.get('hoverline.log.'+L.id)||'').length===txt.length)break;const old=idx.shift();if(!old||old===L.id){idx.push(L.id);break}store.set('hoverline.log.'+old,'')} /* full storage: drop the oldest */
  store.set('hoverline.logs',JSON.stringify(idx));logUI()}
function logAll(){const out=[];for(const id of logIndex()){try{const L=JSON.parse(store.get('hoverline.log.'+id)||'null');if(L)out.push(L)}catch(e){}}return out}
/* Inside the Claude viewer a page can't download directly: the viewer's downloads capability asks you to confirm the save. Elsewhere (itch, Wi-Fi host) a plain download link works. */
let dlCap=null;const inViewer=!!(window.claude&&window.claude.use);try{if(inViewer)window.claude.use('downloads').then(d=>{dlCap=d}).catch(()=>{})}catch(e){}
function logDownload(obj,name){const txt=JSON.stringify(obj);
  if(dlCap){dlCap.save({filename:name,data:txt}).then(()=>note('Saved '+name,1800)).catch(e=>{const c=e&&e.code;if(c==='declined')return;if(c==='rate_limited')return note('A save is already waiting for you',1800);note('Download unavailable here · use Copy all logs',2400)});return}
  if(inViewer)return note('Download unavailable here · use Copy all logs',2400);
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);note('Saved '+name,1800)}catch(e){note('Download blocked here · use Copy all logs',2400)}}
function logStamp(){const d=new Date(),z=n=>String(n).padStart(2,'0');return d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())}
function logUI(){{const c=$('shareChip');if(c)c.setAttribute('aria-pressed',String(!!LOG.share))}const n=logIndex().length,pf=profileGet();const el=$('logInfo');if(el)el.textContent=(n?n+' race'+(n>1?'s':'')+' recorded in this browser':'No races recorded yet')+(pf&&pf.n?` · profile from ${pf.n} race${pf.n>1?'s':''}: pace ${pf.pace<1?Math.round((1-pf.pace)*100)+'% quicker':Math.round((pf.pace-1)*100)+'% slower'} than the average AI`:'')+'. Download them to send for tuning.';
  const c=$('logChip');if(c)c.setAttribute('aria-pressed',String(LOG.on))}
/* the profile: an average of your recent races (pace = your mean lap / the median AI's mean lap) */
function profileGet(){try{return JSON.parse(store.get('hoverline.profile')||'null')}catch(e){return null}}
function profileAdd(L){const me=L.result.field.find(f=>f.name===player.name&&!f.rival)||null,mean=a=>a&&a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const myLap=mean(L.result.laps),ai=L.result.field.filter(f=>f!==me&&L.field.find(x=>x.name===f.name&&x.ai&&!x.rival)).map(f=>mean(f.laps)).filter(x=>x).sort((a,b)=>a-b);if(!myLap||ai.length<3)return;
  const T0=Math.max(1,L.result.raceT),S2=L.summary,shots=Object.values(S2.shots).reduce((a,b)=>a+b,0),rt=S2.routes.long+S2.routes.short;
  const cur={pace:myLap/ai[ai.length>>1],boost:S2.boostT/T0,fire:shots/(T0/60),dive:S2.diveT/T0,up:S2.noseUpT/T0,longP:rt?S2.routes.long/rt:null,wall:S2.wallHits/(T0/60)};
  const pf=profileGet()||{n:0},k=pf.n?0.35:1;for(const key of Object.keys(cur)){const v=cur[key];if(v==null)continue;pf[key]=pf[key]==null?v:pf[key]*(1-k)+v*k}pf.n=(pf.n||0)+1;store.set('hoverline.profile',JSON.stringify(pf))}
$('logBtn').onclick=()=>{const L=LOG.last;if(!L){note('No race log yet · turn on Record races in Controls',2000);return}logDownload({game:L.game,profile:profileGet(),logs:[L]},'hoverline-race-'+logStamp()+'.json')};
$('logAll').onclick=()=>{const all=logAll(),pairing=PDG.all();if(!all.length&&!pairing.length){note('No race logs yet',1600);return}logDownload({game:all.length?all[0].game:'Hoverline '+(($('title').querySelector('.sub')||{}).textContent||''),exported:new Date().toISOString(),profile:profileGet(),music:music.libLog(),pairing,logs:all},'hoverline-logs-'+logStamp()+'.json')};
$('logCopy').onclick=async()=>{const all=logAll();try{await navigator.clipboard.writeText(JSON.stringify({profile:profileGet(),music:music.libLog(),pairing:PDG.all(),logs:all}));note('Copied '+all.length+' logs',1600)}catch(e){/* the viewer frame may block the clipboard API: fall back to a hidden textarea */const ta=document.createElement('textarea');ta.value=JSON.stringify({profile:profileGet(),music:music.libLog(),pairing:PDG.all(),logs:all});ta.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();note(ok?'Copied '+all.length+' logs':'Copy blocked here',1600)}};
$('logClear').onclick=()=>{for(const id of logIndex())store.set('hoverline.log.'+id,'');store.set('hoverline.logs','[]');store.set('hoverline.profile','');LOG.last=null;logUI();note('Race logs and profile cleared',1600)};
$('logChip').onclick=()=>{LOG.on=!LOG.on;store.set('hoverline.logrec',LOG.on?'1':'0');logUI()};
$('shareChip').onclick=()=>{LOG.share=!LOG.share;store.set('hoverline.share',LOG.share?'1':'0');logUI()};
/* Landing on the road can shake you and cost a little shield, but never wreck you. */
const landHit=(r,a)=>{if(r.d.soft||a<=0||r.hp<=1)return;LOG.src='landing';damage(r,Math.min(a,(r.hp-1)/(r===player?T.D.dmg:1)),null,0,true);LOG.src=null};
