//# input/051-local-pilots.js: local pilots for split screen: who plays with what, and each one's own input
/* ---------- local pilots (Prototype 60) ----------
   Split screen puts up to 8 pilots on this one screen. Each pilot is bound to one source: 'dev' (this device's keyboard,
   touch and tilt), 'pad' (one gamepad, by its index) or 'ctl' (a phone or other device in controller mode, by its id in
   the room). readInput() merges everything into one input, which is right for one pilot and wrong for eight, so here each
   source is read on its own. Pilot 1 always flies `player`; pilots 2 to 8 take AI places (095-split-screen.js). With no
   split-screen race on (SPL.race false) nothing here runs in a race, so single-player races are unchanged.
   See docs/SPLITSCREEN.md. */
const SPL={pilots:[],race:false,open:false,fill:store.get('hoverline.splfill')!=='0',laps:3,lay:(()=>{try{return JSON.parse(store.get('hoverline.spllay')||'{}')||{}}catch(e){return{}}})(),
  views:[],spare:[],mpWas:false,doneAt:0};
const SPL_MAX=8;
/* the pad's name for its card: "8BitDo Micro gamepad (Vendor: 2dc8 ...)" reads as "8BitDo Micro gamepad" */
const padLabel=id=>String(id||'Gamepad').replace(/\s*\((?:STANDARD GAMEPAD|Vendor|vendor)[^)]*\)\s*/g,' ').replace(/^[0-9a-f]{4}-[0-9a-f]{4}-/i,'').replace(/\s+/g,' ').trim().slice(0,28)||'Gamepad';
/* Small pads (8BitDo Micro and Zero 2, and anything else with a d-pad and a few buttons) get the small mapping by default:
   a pad the browser maps as standard with both sticks and 16 buttons or more gets the full one (Controls' bindings). */
const padSmall=p=>!(p&&p.mapping==='standard'&&p.buttons.length>=16&&p.axes.length>=4);
/* a d-pad reported as a hat on axis 9 (D-input pads on Linux and Firefox): -1 up, then clockwise in steps of 2/7;
   anything beyond ±1 is centred */
function padHat(p){if(!p||p.mapping==='standard'||p.axes.length<10)return[0,0];const v=p.axes[9];if(!(Math.abs(v)<=1.05))return[0,0];
  const k=Math.round((v+1)/2*7)&7;return[[0,1,1,1,0,-1,-1,-1][k],[-1,-1,0,1,1,1,0,-1][k]]}
const padBtn=(p,i)=>{const x=p&&p.buttons[i];return x?Math.max(x.value||0,x.pressed?1:0):0};
/* The one-button module (small pads' B, a phone's Module): whichever module can fire now, slot 1 first (the quick
   race's rule, for any racer); held, it stays on the slot it picked so the Cannon keeps firing. */
function splPick(r){const a=canFire(r,0),b=canFire(r,1);return a?0:b?1:r.weapons[0]&&WDEF[r.weapons[0]]&&!WDEF[r.weapons[0]].passive?0:1}
function splOne(P,pressed,held,inp){const r=P.r;if(!r)return;if(pressed||P.one<0&&held)P.one=splPick(r);const k=P.one<0?0:P.one;if(!held&&!pressed)P.one=-1;
  if(pressed)inp.fire[k]=true;if(held)inp.hold[k]=true}
/* one pad, one pilot */
function splPadIn(P){const gp=navigator.getGamepads?navigator.getGamepads():[],p=gp[P.pad];const o={steer:0,brake:0,pitch:0,boost:false,fire:[false,false],hold:[false,false]};
  if(!p||!p.connected){P.prev=[];return o}
  const prev=P.prev||[],b=i=>padBtn(p,i),pr=i=>b(i)>0.5,edge=i=>pr(i)&&!prev[i],h=padHat(p),ax=p.axes[0]||0,ay=p.axes[1]||0;
  let steer=dead(ax,0.15)+h[0],pitch=(Math.abs(ay)>Math.abs(ax)*0.55?dead(ay,0.2):0)+h[1];
  if(pr(14))steer-=1;if(pr(15))steer+=1;if(pr(12))pitch-=1;if(pr(13))pitch+=1;
  if(P.small){o.boost=pr(0)||pr(5)||b(7)>0.3;o.brake=Math.max(pr(2)||pr(4)?1:0,b(6)>0.08?b(6):0);
    splOne(P,edge(1),pr(1),o);if(edge(3))o.fire[1]=true;if(pr(3))o.hold[1]=true}
  else{const inv=bind.padInvert?-1:1,ry=p.axes[3]||0;pitch=inv*pitch+inv*dead(ry,0.2);const B=a=>b(bind.pad[a]);
    o.brake=B('brake')>0.08?B('brake'):0;o.boost=B('boost')>0.3;o.hold=[B('w1')>0.5,B('w2')>0.5];o.fire=[edge(bind.pad.w1),edge(bind.pad.w2)]}
  /* the view button (full mapping) or the select/minus button (small) changes this pilot's camera */
  if(edge(P.small?8:bind.pad.view))P.cm=(P.cm+1)%CAMS.length;
  if(p.buttons.some((x,i)=>x.pressed&&!prev[i]))P.lit=performance.now();
  P.prev=p.buttons.map(x=>x.pressed);o.steer=clamp(steer,-1,1);o.pitch=clamp(pitch,-1,1);return o}
/* a phone or other device in controller mode: its last state (095-pad-controller.js), presses counted so none is lost */
function splCtlIn(P){const c=P.ci||{},o={steer:clamp((c.s||0)/100,-1,1),pitch:clamp((c.p||0)/100,-1,1),brake:c.b&1?1:0,boost:!!(c.b&2),fire:[false,false],hold:[false,false]};
  const f=c.f||[0,0];P.fc=P.fc||[f[0],f[1],f[2]||0];
  splOne(P,(f[2]||0)>P.fc[2],!!(c.b&16),o);
  for(let k=0;k<2;k++){if(f[k]>P.fc[k])o.fire[k]=true;if(c.b&(4<<k))o.hold[k]=true}P.fc=[f[0],f[1],f[2]||0];
  if(c.v!=null&&c.v!==P.cv){if(P.cv!=null)P.cm=(P.cm+1)%CAMS.length;P.cv=c.v}
  if(performance.now()-(c.at||0)>1500){o.steer=o.pitch=o.brake=0;o.boost=false}/* gone quiet: coast straight rather than hold the last turn */
  return o}
/* Each frame of a split-screen race: readInput (without the pads, which pause, change the song and work the menus)
   gives the 'dev' pilot's input; every other pilot reads its own source. Returns pilot 1's input (player's). */
function splInputs(){const dv=readInput(true);let first=null;
  for(const P of SPL.pilots){P.inp=P.src==='dev'?dv:P.src==='pad'?splPadIn(P):splCtlIn(P);if(P.r===player)first=P.inp}
  return first||{steer:0,brake:0,pitch:0,boost:false,fire:[false,false],hold:[false,false]}}
function splFireClear(){for(const P of SPL.pilots)if(P.inp)P.inp.fire=[false,false]}
