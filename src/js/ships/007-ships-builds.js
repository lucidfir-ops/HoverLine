//# ships/007-ships-builds.js: the 8 frames, their stats, builds (frame, paint, modules), shadows and merging (the models are in 007-ship-models)
/* ---------- ships & builds ----------
   A build spends a 15-point budget across five stats (1-5 each). Every stat drives one visible part of the ship,
   so the lab can show exactly what a change did. */
const STATS=[{k:'speed',name:'Speed',part:'Thrusters',more:'bigger',less:'smaller'},{k:'thrust',name:'Thrust',part:'Boosters',more:'bigger',less:'smaller'},
  {k:'handling',name:'Handling',part:'Wings & fins',more:'wider',less:'narrower'},{k:'shield',name:'Shield',part:'Armour',more:'thicker',less:'thinner'},
  {k:'ammo',name:'Ammo',part:'Ammo bars',more:'longer',less:'shorter'}];
const BUDGET=15,SMIN=1,SMAX=5;let BUD=BUDGET,buildKey='hoverline.build';
const WDEF={missile:{name:'Missile',cost:25,desc:'Homing missile. Fires backwards when nobody is ahead.'},
  cannon:{name:'Cannon',cost:5,desc:'Rapid straight bolts. Hold the button to keep firing.'},
  mines:{name:'Mines',cost:30,desc:'Drops three mines behind you.'},
  shock:{name:'Shockwave',cost:30,desc:'Damages and slows every frame within 40 m.'},
  turbo:{name:'Turbo',cost:25,desc:'A 2.4-second speed burst. While it runs your held boost rests and costs no shield.'},
  barrier:{name:'Barrier',cost:35,desc:'Blocks all damage for 3 seconds.'},
  phase:{name:'Phase',cost:20,desc:'For 1.5 seconds weapons pass straight through you, and so do other frames and smoke.'},
  decoy:{name:'Decoy',cost:15,desc:'Drops a flare. Homing missiles, the Swarm and the Hunter chasing you go for it instead.'},
  rockets:{name:'Rockets',cost:20,desc:'Three straight rockets in a spread. No homing: aim with your frame.'},
  swarm:{name:'Swarm',cost:35,desc:'Four small homing missiles, one for each of the nearest frames ahead.'},
  quake:{name:'Quake',cost:35,desc:'A wave that rolls up the track ahead with one gap in it, hitting every frame it catches and clearing mines.'},
  bouncer:{name:'Bouncer',cost:20,desc:'A heavy orb that bounces off the walls. It can come back and hit you.'},
  hunter:{name:'Hunter',cost:40,desc:'Hunts down the race leader, wherever they are. If you lead, it drops back and waits for second place.'},
  emp:{name:'EMP',cost:25,desc:'Every frame within 400 m ahead loses its modules and boost for 2 seconds and slows a little.'},
  smoke:{name:'Smoke',cost:15,desc:'Leaves a cloud behind you. Pilots who fly through it lose most of their view for a moment, and a little speed.'},
  autopilot:{name:'Autopilot',cost:30,desc:'The autopilot flies your frame for 4.5 seconds while you get your breath back. Your other module and boost still work.'},
  overdrive:{name:'Overdrive',cost:60,desc:'3 seconds untouchable and faster. Ram other frames to dent their shields and slow them.'},
  scoopS:{name:'Shield scoop',cost:0,passive:true,desc:'Not a weapon: green strips recharge your shield twice as fast. It takes a module slot, and you cannot fit it with the Ammo scoop.'},
  scoopA:{name:'Ammo scoop',cost:0,passive:true,desc:'Not a weapon: purple strips refill your ammo twice as fast. It takes a module slot, and you cannot fit it with the Shield scoop.'}};
const SCOOPS=['scoopS','scoopA'],bothScoops=w=>SCOOPS.every(k=>w.includes(k));
/* Icons (Prototype 32): one line drawing per weapon and for boost, shield and ammo, drawn in the colour of whatever holds them. */
const SH='M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z';
const ICON={missile:'<path d="M4 10h11l5 2-5 2H4zM7 10L5 6M7 14l-2 4M1 12h1"/>',cannon:'<path d="M3 8h6M3 12h10M3 16h6M13 8h2M17 12h4M13 16h2"/>',
  mines:'<path d="M12 6l6 6-6 6-6-6zM12 2v3M12 19v3M2 12h3M19 12h3"/>',shock:'<circle cx="12" cy="12" r="2"/><path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9M4.5 4.5a10.5 10.5 0 0 0 0 15M19.5 4.5a10.5 10.5 0 0 1 0 15"/>',
  turbo:'<path d="M4 6l6 6-6 6M12 6l6 6-6 6"/>',barrier:'<path d="'+SH+'"/>',phase:'<circle cx="12" cy="12" r="7" stroke-dasharray="3 3"/><path d="M2 12h20M19 9l3 3-3 3"/>',
  decoy:'<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>',rockets:'<path d="M3 12L18 5M3 12h17M3 12l15 7"/>',
  swarm:'<circle cx="16" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="16" cy="19" r="2"/><path d="M3 5h10M4 12h12M3 19h10"/>',quake:'<path d="M2 15l4-6 4 8 4-10 4 8 4-4"/>',
  bouncer:'<circle cx="17" cy="7" r="3.5"/><path d="M3 8l5 11 5-9"/>',hunter:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
  emp:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',smoke:'<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.5-1 4.5 4.5 0 0 1 0 9z"/>',
  autopilot:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M3.5 12H10M14 12h6.5M12 14v6.5"/>',overdrive:'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  scoopS:'<path d="'+SH+'M12 9v6M9 12h6"/>',scoopA:'<path d="M5 7h14v13H5zM8 4h8M12 10v7M8.5 13.5h7"/>',
  boost:'<path d="M6 13l6-6 6 6M6 19l6-6 6 6"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',next:'<path d="M4 6l7 6-7 6zM12 6l7 6-7 6zM21 6v12"/>',shield:'<path d="'+SH+'"/>',ammo:'<path d="M5 9h3v10H5zM10.5 9h3v10h-3zM16 9h3v10h-3zM5 6.5a1.5 1.5 0 0 1 3 0M10.5 6.5a1.5 1.5 0 0 1 3 0M16 6.5a1.5 1.5 0 0 1 3 0"/>'};
const icon=k=>ICON[k]?'<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+ICON[k]+'</svg>':'';
document.querySelectorAll('[data-icon]').forEach(e=>e.insertAdjacentHTML('afterbegin',icon(e.dataset.icon)+' '));
document.querySelectorAll('.mi').forEach(e=>e.innerHTML=icon(e.dataset.i));
/* a cue on a HUD part: restart its CSS animation (deny, hit, lost, pulse) */
const cue=(id,c,ms=900)=>{const e=$(id);if(!e)return;e.classList.remove(c);void e.offsetWidth;e.classList.add(c);clearTimeout(e['_'+c]);e['_'+c]=setTimeout(()=>e.classList.remove(c),ms)};
const PAINTS=[{n:'Ivory',body:0xeeeae0,stripe:0xffb000,css:'#ffb000'},{n:'Ink',body:0x23272f,stripe:0xffb000,css:'#ffb000'},{n:'Signal',body:0xe8e4dc,stripe:0xff4a3d,css:'#ff6a5d'},
  {n:'Ice',body:0xdfe9f2,stripe:0x3ff0ff,css:'#3ff0ff'},{n:'Moss',body:0x2c3328,stripe:0x9fe04a,css:'#9fe04a'},{n:'Orchid',body:0xece4f4,stripe:0xb05cff,css:'#c08bff'},
  {n:'Ember',body:0x2a1d16,stripe:0xff8a1f,css:'#ff8a1f'},{n:'Rose',body:0xf2e6ea,stripe:0xff5fa8,css:'#ff5fa8'}];
/* Frames: the ship's base design. Each nudges the base numbers a few percent and has one quirk; the lab stats apply on top.
   size scales how wide a target it is (shots and collisions), mass decides who wins a shove, aero multiplies what nose-down
   streamlining is worth, glide scales gravity while airborne. */
const FRAMES={
 blade:{name:'Blade',tag:'all-rounder',desc:'The all-rounder: twin engine pods and wide wings. No strengths, no weaknesses.',m:{vmax:1,accel:1,turn:1,hp:1,ammo:1},size:1,mass:1,aero:1,glide:1,drift:0.5},
 tether:{name:'Tether',tag:'twin engines',desc:'Two huge engines tow a little cockpit on cables. The highest top speed, but wide, slow to turn and fragile. It drifts as well as any frame, but a drift builds it no speed.',m:{vmax:1.04,accel:1.02,turn:0.88,hp:0.74,ammo:1},size:1.15,mass:0.95,aero:1,glide:1,drift:0},
 skiff:{name:'Skiff',tag:'hover bike',desc:'A hover bike. Small and nimble: the hardest frame to hit, with the best grip and a quick pick-up, and it rides another frame\'s slipstream best. Light armour, small magazine.',m:{vmax:0.985,accel:1.04,turn:1.12,hp:0.76,ammo:0.85},size:0.64,vis:0.88,slip:1.5,mass:0.75,aero:1,glide:1,drift:0.5},
 hauler:{name:'Hauler',tag:'heavy',desc:'Heavy engines and a lot of armour. It shrugs off hits, carries the most ammo and wins every shove, and its own reactors top up ammo and shield as it races. The widest target.',m:{vmax:0.995,accel:1.0,turn:0.94,hp:1.3,ammo:1.2},size:1.2,mass:1.6,aero:1,glide:1,aRegen0:0.5,hRegen:0.25,drift:0.25},
 dart:{name:'Dart',tag:'delta wing',desc:'A delta wing built for the air. Nose-down streamlining is worth half as much again, and it glides further off jumps and crests. Thin armour.',m:{vmax:1.01,accel:0.97,turn:1.02,hp:0.95,ammo:0.95},size:1.05,mass:0.9,aero:1.5,glide:0.82,drift:0.25},
 orb:{name:'Orb',tag:'sphere',desc:'A ball with engines bolted on. It rolls along the walls instead of grinding against them: a wall costs it only 15% of the speed and shield it costs other frames, so it can ride the edge of the road. Round, so nose-down streamlining does nothing for it, and it is a big target.',m:{vmax:0.985,accel:1.02,turn:0.98,hp:1.1,ammo:1},size:1.15,mass:1.2,aero:0,glide:1,wallK:0.15,drift:0.25,roll:true},
 roller:{name:'Drifter',tag:'hover car',desc:'A low hover car on four flat anti-grav discs. Built to drift: every frame drifts (hold the brake while you steer), but a drift builds the Drifter more speed than any other frame, the longer you hold it the more. Landings cost nothing and it stays planted over crests. Heavy, so it wins shoves.',m:{vmax:0.99,accel:1.0,turn:1.04,hp:1.1,ammo:1},size:1.1,mass:1.35,aero:0.9,glide:1,soft:true,plant:1.35,drift:0.8},
 mono:{name:'Monowheel',tag:'giant wheel',desc:'One huge spinning ring with the cockpit slung inside it, rolling on the road. Heavy: hard to shove. It drops back to the road fast over crests and keeps more of its steering in the air. Narrow from behind, but tall.',m:{vmax:1.0,accel:1.04,turn:1.0,hp:0.95,ammo:1.0},size:0.85,mass:1.3,aero:0.95,glide:1.15,jumpG:1,roll:true,airTurn:0.7,drift:0.5}};
const FRAME_KEYS=Object.keys(FRAMES);
/* The Training cube (Prototype 34): a stock ship for practice only, the average of the eight frames (top speed, pick-up,
   turning, shield, ammo, size, weight, streamlining and glide) with none of their special traits, flown with every stat
   at 3. It isn't in the Ship lab and the AI never fly it. */
FRAMES.cube=(()=>{const F=FRAME_KEYS.map(k=>FRAMES[k]),av=f=>F.reduce((a,x)=>a+f(x),0)/F.length,m={};for(const k of['vmax','accel','turn','hp','ammo'])m[k]=av(x=>x.m[k]);
  return{name:'Training cube',tag:'stock',desc:'A plain cube for practice: the average of every frame, every stat at 3, no special traits.',m,size:av(x=>x.size),mass:av(x=>x.mass),aero:av(x=>x.aero),glide:av(x=>x.glide),drift:av(x=>x.drift)}})();
const frameOf=k=>FRAMES[k==='saucer'?'mono':k]||FRAMES.blade;
/* Ammo regeneration a second by the ammo stat (Prototype 34), times the frame's ammo factor. */
const AREGEN=[0,0.1,0.3,1,2.2];
const derive=(st,fr)=>{const F=frameOf(fr),m=F.m;return{vmax:VMAX*(1+0.03*(st.speed-3))*m.vmax,accel:0.5*(1+0.2*(st.thrust-3))*m.accel,turn:(1+0.18*(st.handling-3))*m.turn,aRegen:AREGEN[clamp(st.ammo|0,1,5)-1]*m.ammo+(F.aRegen0||0),hRegen:F.hRegen||0,drift:F.drift||0,aiDrift:F===FRAMES.roller,
  hp:Math.round((60+20*st.shield)*m.hp),ammo:Math.round((60+30*st.ammo)*m.ammo),wpow:(1+0.07*(3-st.speed))*(m.vmax<1?1.08:1),chg:1+0.1*(3-st.speed)+(m.vmax<1?0.1:0),size:F.size,slip:F.slip??1,mass:F.mass,aero:F.aero??1,glide:F.glide,jumpG:F.jumpG||0,roll:!!F.roll,wallK:F.wallK||1,soft:!!F.soft,plant:F.plant||1,airTurn:F.airTurn||0.5}};
const drWord=a=>a>=0.75?'big drift boost':a>=0.45?'drift boost':a>=0.2?'small drift boost':'no drift boost';
const frameMods=fr=>{const F=frameOf(fr),m=F.m,out=[],pc=(x,l)=>{if(Math.abs(x-1)>0.001)out.push(`${l} ${x>1?'+':'−'}${Math.round(Math.abs(x-1)*100)}%`)};
  pc(m.vmax,'top speed');pc(m.accel,'pick-up');pc(m.turn,'turning');pc(m.hp,'shield');pc(m.ammo,'ammo');
  if(F.size<1)out.push('smaller target');if((F.slip||1)>1)out.push('slipstream +'+Math.round((F.slip-1)*100)+'%');if(F.size>1.1)out.push('wider target');if(F.mass>1.2)out.push('wins shoves');if(F.aero>1.2)out.push('streamline +50%');if(F.aero===0)out.push('no streamlining');else if(F.aero<0.8)out.push('streamline −40%');if(F.glide<1)out.push('longer glides');
  if(F.wallK)out.push('rolls along walls');if(F.aRegen0)out.push(`makes ammo ${F.aRegen0}/s and shield ${F.hRegen}/s`);if(F.soft)out.push('soft landings');if(F.plant>1)out.push('stays planted');if(F.airTurn)out.push('more steering in the air');
  return(out.length?out.join(' · '):'balanced')+' · '+drWord(F.drift||0)};
/* What each stat means in race terms, for the lab readout. */
const statLine=(k,st)=>{const d=derive(st,build.frame);return k==='speed'?['top speed',Math.round(d.vmax*3.6)+' km/h · damage '+(d.wpow>=1?'+':'−')+Math.round(Math.abs(d.wpow-1)*100)+'%']:k==='thrust'?['0–400 km/h',(-Math.log(1-111.1/d.vmax)/d.accel).toFixed(1)+' s']:
  k==='handling'?['turn rate',Math.round(d.turn*100)+'% · wall assist '+['off','light','medium','strong','full'][clamp(st.handling,1,5)-1]]:k==='shield'?['shield',d.hp+'']:['ammo',d.ammo+(d.aRegen?' · +'+d.aRegen.toFixed(1)+'/s':'')]};
const defaultBuild=()=>({stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:['missile','cannon'],paint:0,frame:'blade'});
const spent=b=>STATS.reduce((a,s)=>a+b.stats[s.k],0);
function loadBuild(){try{const b=JSON.parse(store.get('hoverline.build')||'null');if(b&&b.stats&&Array.isArray(b.weapons)){const d=defaultBuild();
  for(const s of STATS){const v=b.stats[s.k];d.stats[s.k]=Number.isInteger(v)?clamp(v,SMIN,SMAX):3}
  if(spent(d)<=BUDGET){const w=b.weapons.filter(x=>WDEF[x]).slice(0,2);d.weapons=w.length===2&&w[0]!==w[1]&&!bothScoops(w)?w:defaultBuild().weapons;d.paint=clamp(b.paint|0,0,PAINTS.length-1);d.frame=b.frame==='saucer'?'mono':FRAMES[b.frame]?b.frame:'blade';d.liv=b.liv&&/^L[0-9a-f]{19}([0-9a-f]{16})?$/i.test(b.liv)?b.liv:null;return d}}}catch(e){}return defaultBuild()}
/* Liveries: main, second and trim colours and a pattern drawn on the main colour in the second. The code is L, the three
   colours as hex, the pattern number, and for a pattern you drew its 8x8 cells as 16 hex digits (a byte a row). */
const PALETTE=[0xeeeae0,0xc8ccd4,0x8a919c,0x3c414c,0x23272f,0x0b0d12,0xffb000,0xff8a1f,0xff4a3d,0xff5fa8,0xb05cff,0x6f9bff,0x3ff0ff,0x46ff8c,0x9fe04a,0xffd24a];
const PATS=[['Solid','0000000000000000'],['Stripe','000000ffff000000'],['Twin','4242424242424242'],['Chevron','c3663c1800000000'],['Check','cccc3333cccc3333'],['Split','f0f0f0f0f0f0f0f0'],['Dots','0044000000110000'],['Draw','']];
const hx6=n=>(n>>>0).toString(16).padStart(6,'0').slice(-6);
function parseLiv(c){const m=/^L([0-9a-f]{6})([0-9a-f]{6})([0-9a-f]{6})([0-7])([0-9a-f]{16})?$/i.exec(c||'');if(!m)return null;
  let body=parseInt(m[1],16);const stripe=parseInt(m[2],16),trim=parseInt(m[3],16),pat=+m[4],bits=(pat===7?m[5]:PATS[pat][1])||'0000000000000000';if(body===ARMOUR)body^=1;
  return{n:'Custom',body,stripe,trim,pat,bits:bits.toLowerCase(),own:pat===7?bits.toLowerCase():null,css:'#'+hx6(stripe)}}
const livStr=o=>'L'+hx6(o.body)+hx6(o.stripe)+hx6(o.trim)+o.pat+(o.pat===7?o.own||o.bits||'0000000000000000':'');
const paintOf=b=>(b&&b.liv&&parseLiv(b.liv))||PAINTS[(b&&b.paint)|0]||PAINTS[0];
const patCache=new Map();
function patTex(body,stripe,bits){const k=body+'/'+stripe+'/'+bits;let t=patCache.get(k);if(t)return t;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  g.fillStyle='#'+hx6(body);g.fillRect(0,0,64,64);g.fillStyle='#'+hx6(stripe);for(let r=0;r<8;r++){const v=parseInt(bits.substr(r*2,2),16);for(let q=0;q<8;q++)if(v&(128>>q))g.fillRect(q*8,r*8,8,8)}
  t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;patCache.set(k,t);return t}
let build=loadBuild();
const saveBuild=()=>store.set(buildKey,JSON.stringify(build));

const shadowGeo=new THREE.CircleGeometry(1.7,18);shadowGeo.rotateX(-Math.PI/2);
const shadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.5,depthWrite:false});
const ARMOUR=0x3b404b;
const fpRT=new THREE.WebGLRenderTarget(96,96),fpCam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,60),fpScene=new THREE.Scene(),fpMat=new THREE.MeshBasicMaterial({color:0xffffff}),fpBuf=new Uint8Array(96*96*4);
function footprint(ship){try{const N=96,par=ship.parent,p0=ship.position.clone(),q0=ship.quaternion.clone(),hid=[];
    ship.position.set(0,0,0);ship.quaternion.identity();ship.updateMatrixWorld(true);
    ship.traverse(o=>{if(o.isMesh&&(o.material.blending===THREE.AdditiveBlending||o.material.transparent)&&o.visible){hid.push(o);o.visible=false}});
    const box=new THREE.Box3().setFromObject(ship),cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2,hx=(box.max.x-box.min.x)/2*1.18+0.15,hz=(box.max.z-box.min.z)/2*1.18+0.15;
    fpCam.left=-hx;fpCam.right=hx;fpCam.top=hz;fpCam.bottom=-hz;fpCam.position.set(cx,30,cz);fpCam.up.set(0,0,-1);fpCam.lookAt(cx,0,cz);fpCam.updateProjectionMatrix();
    if(par)par.remove(ship);fpScene.add(ship);fpScene.overrideMaterial=fpMat;const prevT=renderer.getRenderTarget(),cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha();
    renderer.setRenderTarget(fpRT);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(fpScene,fpCam);renderer.readRenderTargetPixels(fpRT,0,0,N,N,fpBuf);renderer.setRenderTarget(prevT);renderer.setClearColor(cc,ca);
    fpScene.remove(ship);fpScene.overrideMaterial=null;if(par)par.add(ship);ship.position.copy(p0);ship.quaternion.copy(q0);for(const o of hid)o.visible=true;
    let a=new Float32Array(N*N);for(let i=0;i<N*N;i++)a[i]=fpBuf[i*4]>40?1:0;
    for(let pass=0;pass<3;pass++){const b=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=0,n=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<N&&Y<N){t+=a[Y*N+X];n++}}b[y*N+x]=t/n}a=b}
    const cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),im=g.createImageData(N,N);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const o=((N-1-y)*N+x)*4;im.data[o]=im.data[o+1]=im.data[o+2]=0;im.data[o+3]=Math.round(255*Math.min(1,a[y*N+x]*1.15))}g.putImageData(im,0,0);
    const geo=new THREE.PlaneGeometry(hx*2,hz*2);geo.rotateX(-Math.PI/2);geo.translate(cx,0,cz);return{geo,tex:new THREE.CanvasTexture(cv)}}catch(e){return null}}
function fitShadow(r){if(!r.shadow||!r.shadow.isMesh||!r.ship)return;const f=footprint(r.ship);if(!f)return;
  if(r.shadow.geometry!==shadowGeo)r.shadow.geometry.dispose();if(r.shadow.material!==shadowMat){r.shadow.material.map&&r.shadow.material.map.dispose();r.shadow.material.dispose()}
  r.shadow.geometry=f.geo;r.shadow.material=new THREE.MeshBasicMaterial({map:f.tex,transparent:true,opacity:0.6,depthWrite:false,color:0x000000})}
function makeShip(paint,st,fr){const g=new THREE.Group(),parts={speed:[],thrust:[],handling:[],shield:[],ammo:[]},K=shipKit(g,parts,paint);
  (SHIPB[fr]||SHIPB.blade)(K,st,paint);
  /* (P58) a frame drawn smaller than the kit's scale (the Skiff): its parts go into one scaled group */
  const vs=FRAMES[fr]&&FRAMES[fr].vis;if(vs&&vs!==1){const inner=new THREE.Group();inner.scale.setScalar(vs);for(const c of[...g.children])inner.add(c);g.add(inner)}
  return g}
function disposeObj(o){o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material)(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>m.dispose())})}

/* skill (Prototype 50): the pace of each AI pilot flying with hands (race/054-ai.js), set in tools/sim so that the Eric pilot
   finishes where he did against the Prototype 49 AI (each pilot keeping its place in the order); sk0 is the pace they had
   before hands, kept for the AI that flies without them (quick races) */
const ROSTER=[
  {name:'You'},
  {name:'Kestrel',paint:{num:'07',body:0x2a2f3a,stripe:0x3ff0ff},css:'#3ff0ff',skill:1.028,sk0:0.97,b:{stats:{speed:5,thrust:3,handling:2,shield:2,ammo:3},weapons:['rockets','hunter'],frame:'tether'}},
  {name:'Vanta',paint:{num:'13',body:0x1b1b1f,stripe:0xff4a3d},css:'#ff4a3d',skill:1.018,sk0:0.955,b:{stats:{speed:3,thrust:4,handling:4,shield:2,ammo:2},weapons:['cannon','mines'],frame:'skiff'}},
  {name:'Halyard',paint:{num:'21',body:0xdfe7ef,stripe:0x2f6bff},css:'#6f9bff',skill:1.02,sk0:0.94,b:{stats:{speed:3,thrust:2,handling:3,shield:5,ammo:2},weapons:['swarm','barrier'],frame:'hauler'}},
  {name:'Nimbus',paint:{num:'09',body:0xe9e4f2,stripe:0xb05cff},css:'#c08bff',skill:1.003,sk0:0.925,b:{stats:{speed:3,thrust:2,handling:3,shield:2,ammo:5},weapons:['bouncer','emp'],frame:'dart'}},
  {name:'Rook',paint:{num:'66',body:0x2c3328,stripe:0x7fe04a},css:'#7fe04a',skill:0.964,sk0:0.91,b:{stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:['quake','smoke'],frame:'roller'}},
  {name:'Pell',paint:{num:'03',body:0xf2ede0,stripe:0xffd24a},css:'#ffd24a',skill:0.935,sk0:0.935,b:{stats:{speed:3,thrust:3,handling:3,shield:4,ammo:2},weapons:['missile','decoy'],frame:'orb'}},
  {name:'Wisp',paint:{num:'44',body:0x232733,stripe:0xff5fa8},css:'#ff5fa8',skill:0.967,sk0:0.92,b:{stats:{speed:4,thrust:3,handling:3,shield:2,ammo:3},weapons:['rockets','phase'],frame:'mono'}},
  /* Prototype 50: the eighth pilot, so every frame has its own; the pilot of your frame sits the race out */
  {name:'Sable',paint:{num:'88',body:0x2b2622,stripe:0xff8a1f},css:'#ff8a1f',skill:1.001,sk0:0.945,b:{stats:{speed:4,thrust:3,handling:3,shield:2,ammo:3},weapons:['turbo','autopilot'],frame:'blade'}}];
function setShip(r,b,paint){if(r.ship){scene.remove(r.ship);disposeObj(r.ship)}r.build=b;r.d=derive(b.stats,b.frame);r.weapons=[...b.weapons];r.scoop=r.weapons.includes('scoopS')?'hp':r.weapons.includes('scoopA')?'ammo':null;r.ship=makeShip(paint,b.stats,b.frame);fitShadow(r);mergeShip(r.ship);scene.add(r.ship)}
/* A racing ship is about 40 small meshes; drawn one by one, eight ships were over half of every frame's draw calls. Every
   part that never moves on its own is merged with the others of the same material into one mesh (Prototype 31): it looks
   exactly the same and costs a handful of draw calls. Moving parts (flaps, jets, flames, spinners, the shield) stay apart.
   The ship lab's ship isn't merged, because it lights up single parts. */
function mergeShip(g){const ud=g.userData,keep=new Set([ud.shield,ud.ammo&&ud.ammo.mesh,...(ud.trails||[]),...((ud.extra&&ud.extra.spin)||[]).map(q=>q.o),...(ud.jets||[]).flatMap(j=>j.userData.rings||[])]);
  /* parts group by how their material looks (most parts make their own copy of the same colour); a material that animates
     (engine glow, flames, arcs, fields) or that reflections use keeps its own group */
  const live=new Set([ud.glowM,ud.trailM,ud.extra&&ud.extra.arc,ud.extra&&ud.extra.field].filter(Boolean)),refl=new Set(ud.mats||[]);
  const vcOK=m=>!live.has(m)&&!refl.has(m)&&!m.map&&!m.vertexColors&&(m.type==='MeshLambertMaterial'||m.type==='MeshBasicMaterial');
  /* plain colours can share one mesh, the colour going into the vertices */
  const sig=m=>live.has(m)?m.uuid:[m.type,vcOK(m)?'vc':m.color&&m.color.getHex(),m.emissive&&m.emissive.getHex(),m.map&&m.map.uuid,m.transparent,m.opacity,m.side,m.blending,m.depthWrite,m.vertexColors,m.flatShading,refl.has(m)].join('|');
  /* every group in the ship merges its own still parts (a spinning wheel's parts merge with each other and spin as one) */
  const nm=new THREE.Matrix3(),v=new THREE.Vector3(),nodes=[];g.traverse(o=>{if(o.children.length>1)nodes.push(o)});
  for(const node of nodes){const by=new Map();
  for(const o of node.children){if(!o.isMesh||keep.has(o)||!o.visible||o.children.length||Array.isArray(o.material)||!o.geometry.attributes.position)continue;const k=sig(o.material);let a=by.get(k);if(!a)by.set(k,a=[]);a.push(o)}
  for(const list of by.values()){if(list.length<2)continue;let mat=list[0].material;let nv=0,ni=0;for(const o of list){const G=o.geometry;nv+=G.attributes.position.count;ni+=G.index?G.index.count:G.attributes.position.count}
    const vc=vcOK(mat)&&list.some(o=>!o.material.color.equals(mat.color)),col=vc?new Float32Array(nv*3):null;
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=new(nv>65535?Uint32Array:Uint16Array)(ni);let o0=0,i0=0;
    for(const o of list){o.updateMatrix();const m=o.matrix,G=o.geometry,P=G.attributes.position,Nn=G.attributes.normal,U=G.attributes.uv,flip=m.determinant()<0;nm.getNormalMatrix(m);
      for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(m);pos[(o0+k)*3]=v.x;pos[(o0+k)*3+1]=v.y;pos[(o0+k)*3+2]=v.z;
        if(Nn){v.fromBufferAttribute(Nn,k).applyMatrix3(nm).normalize();nor[(o0+k)*3]=v.x;nor[(o0+k)*3+1]=v.y;nor[(o0+k)*3+2]=v.z}if(U){uv[(o0+k)*2]=U.getX(k);uv[(o0+k)*2+1]=U.getY(k)}
        if(col){const c=o.material.color;col[(o0+k)*3]=c.r;col[(o0+k)*3+1]=c.g;col[(o0+k)*3+2]=c.b}}
      const n=G.index?G.index.count:P.count,at=k=>(G.index?G.index.getX(k):k)+o0;for(let k=0;k<n;k+=3){idx[i0++]=at(k);idx[i0++]=at(flip?k+2:k+1);idx[i0++]=at(flip?k+1:k+2)}
      o0+=P.count;node.remove(o);G.dispose();if(o.material!==mat&&!vc)o.material.dispose()}
    if(vc){const m0=mat;mat=m0.clone();mat.color.set(0xffffff);mat.vertexColors=true;for(const o of list)o.material.dispose()}
    const MG=new THREE.BufferGeometry();MG.setAttribute('position',new THREE.BufferAttribute(pos,3));MG.setAttribute('normal',new THREE.BufferAttribute(nor,3));MG.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(col)MG.setAttribute('color',new THREE.BufferAttribute(col,3));MG.setIndex(new THREE.BufferAttribute(idx,1));
    node.add(new THREE.Mesh(MG,mat))}}}
function makeRacer(c,isAI=true){const shadow=new THREE.Mesh(shadowGeo,shadowMat);scene.add(shadow);
  const r={name:c.name,css:c.css||paintOf(build).css,isAI,skill:c.skill||1,ship:null,shadow,u:0,utot:0,lat:0,yaw:0,v:0,steerS:0,brk:0,boost:0,stun:0,spin:0,
    hp:100,ammo:100,cd:[0,0],aiT:[0,0],wreck:0,inv:0,barrier:0,charging:null,pitch:0,air:false,h:1.05,hb:1.05,vh:0,respawnU:null,laps:[],lapStart:0,done:0,finishT:null,bias:0};
  setShip(r,c.b||build,c.paint||paintOf(build));return r}
const roster=ROSTER.map((c,i)=>makeRacer(c,i>0));
/* Extra ship objects, made only when a multiplayer room has more pilots than the single-player field. */
const extras=[];
const player=roster[0];
/* The field for the current race: the roster, with up to two rivals swapped for your ghosts (see ghosts below). */
const racers=roster.slice();
function applyBuild(){const pt=paintOf(build);setShip(player,build,pt);player.css=pt.css;miniBase=null}

