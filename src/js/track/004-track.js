//# track/004-track.js: the track's settings (lengths, biome looks by night and day, scenery dials) and buildTrack, which builds a track from its code in three steps (004a-004k)
/* ---------- track ---------- */
let T=null;
/* Multiplayer state (the room, its session and the network ids of the ships); see the multiplayer section. */
const mp={on:false,sess:null,laps:3,fill:true,cls:(k=>['glide','surge','rush','redline'].includes(k)?k:'redline')(store.get('hoverline.mpcls')),byKey:null,left:new Set(),go:null,auto:false,shotN:0,lastPose:0};
function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});scene.remove(g)}

const LENS={Q:{name:'Short',f:0.68,dn:-1},M:{name:'Medium',f:1,dn:0},L:{name:'Long',f:1.5,dn:2}};
/* Scenery settings, at night (BIOMES, the default) and by day (BIOMES_DAY): a player's Night/Day switch picks the table;
   it changes only the sky and light, never the road, so track codes and times don't care. bg and fog: the sky colour and
   fog distances; haze and mote: the Atmosphere and Floating particles colours; edge: the neon on structures; hemi and
   sun: the light (default: a dim night). */
const BIOMES={U:{k:'U',n:'Urban',bg:0x090b10,fog:[160,1100],haze:0x16213a,mote:0x9fd8ff,edge:0xffb000},
  O:{k:'O',n:'Ocean',bg:0x02060c,fog:[220,1700],haze:0x061a2a,mote:0x6ff6e6,edge:0x3ff0ff,hemi:[0x5a7fa8,0x02080c,0.7],sun:[0xa8c0ff,0.45]},
  F:{k:'F',n:'Forest',bg:0x050d08,fog:[150,1150],haze:0x0f2a1c,mote:0xc8ff8a,edge:0x46ff8c},
  N:{k:'N',n:'Stratos',bg:0x010207,fog:[500,2500],haze:0x0b1024,mote:0xd8e0ff,edge:0x3ff0ff},
  R:{k:'R',n:'Reef',bg:0x01101a,fog:[90,1000],haze:0x04263a,mote:0x7ff8ff,edge:0x3ff0ff,hemi:[0x2f7f9f,0x01070c,0.8],sun:[0x7fdcff,0.35]},
  P:{k:'P',n:'Prism',bg:0x05030a,fog:[200,1500],haze:0x150a24,mote:0xd8b0ff,edge:0x9f7bff,hemi:[0x6a5a9a,0x0a0610,0.75],sun:[0xd8c8ff,0.4]}};
const BIOMES_DAY={U:{k:'U',n:'Urban',day:true,bg:0x9cbad6,fog:[280,1900],haze:0xb4c8dc,mote:0xffffff,edge:0xffb000,hemi:[0xdde8f4,0x3a3c44,1.1],sun:[0xfff1d6,1.0],sky:['#3f78c0','#7fb0e2','#b0cfe8','#9cbad6','#7f95a8','#4f5c68']},
  O:{k:'O',n:'Ocean',day:true,bg:0xa9d6f2,fog:[320,2100],haze:0xbfe0f4,mote:0xffffff,edge:0xe8f4ff,hemi:[0xd8ecff,0x2a4a5c,1.15],sun:[0xfff4dc,1.1],sky:['#2a6fc9','#5ea6ea','#9ccdf0','#a9d6f2','#8cc0e2','#2d6f9c']},
  F:{k:'F',n:'Forest',day:true,bg:0xa8cfb8,fog:[240,1700],haze:0xbcdcc4,mote:0xf4ffd8,edge:0x46ff8c,hemi:[0xe4f2dc,0x24382a,1.05],sun:[0xfff4d6,0.95],sky:['#3a7cc0','#78b4dc','#b4dcd0','#a8cfb8','#6f9a7c','#2e4a36']},
  R:{k:'R',n:'Reef',day:true,bg:0x1f86a6,fog:[70,1100],haze:0x3aa6c4,mote:0xe8ffff,edge:0x3ff0ff,hemi:[0xc8f6ff,0x1e5a6a,1.05],sun:[0xeafcff,0.85]},
  N:{k:'N',n:'Stratos',day:true,bg:0x9ccff4,fog:[600,2800],haze:0xbfe2fa,mote:0xffffff,edge:0x3ff0ff,hemi:[0xe8f4ff,0x8fb8dc,1.15],sun:[0xfff6e0,1.0],sky:['#2a6fc9','#5ea6ea','#a4d4f6','#c4e4fa','#a4d4f6','#6aa8e0']},
  P:{k:'P',n:'Prism',day:true,bg:0xc8b8e0,fog:[300,1900],haze:0xd8cce8,mote:0xffffff,edge:0x9f7bff,hemi:[0xece4ff,0x3a3048,1.1],sun:[0xfff0e8,1.0],sky:['#5a62c8','#9a8ee0','#d4c4ec','#c8b8e0','#8a7aa8','#3a3050']}};
let tod=store.get('hoverline.tod')==='day'?'day':'night';const lookOf=k=>(tod==='day'?BIOMES_DAY:BIOMES)[k]||BIOMES.U;
/* Night and Day can both be ticked (Prototype 31): then every new track picks one of them. */
let todOn=(()=>{const v=(store.get('hoverline.tods')||tod).split(',').filter(x=>x==='night'||x==='day');return v.length?v:[tod]})();
/* The scenery dials (name, what it means, most): how much scenery, falls, geysers, tunnels. */
const BDIAL=[['Scenery','towers, trees, islands or slabs · 0 to 3',3],['Falls','water or lava from a block',4],['Geysers','bursts of water or steam',4],['Tunnels','long ones, built round the road',3]];
/* What a generated track gets: the city has one or two falls, usually a tunnel or two and sometimes a geyser; the sea a
   geyser or two, the reef a bubble vent or two; the forest and Stratos just their own scenery. */
function bioDefaults(seed,k){const r=rng((seed^0xB10D)>>>0),a=r(),b=r(),c=r();return k==='U'?[2,a<0.5?1:2,b<0.35?1:0,c<0.5?1:2]:k==='P'?[2,a<0.5?2:3,b<0.5?2:3,0]:k==='O'||k==='R'?[2,0,a<0.5?1:2,0]:[2,0,0,0]}
/* feature kinds built into the road shape (splits are added afterwards, beside it) */
const FKG=['sweep','climb','dive','jump','loop','twist','corkscrew','helix','spire','vspire','dhelix','drop','sjump','cjump'];
/* Prototype 60: bit 24 of a seed marks a code made from Prototype 60 on (seven hex digits, starting with 1). */
const TV1=0x1000000;
const KB=k=>k==='vspire'?'spire':k==='dhelix'?'helix':k;
/* Prototype 61: a track is built in three steps, each in its own part: the road's shape (roadShape, 004a, with addFeatures
   in 004b), the road as drawn and everything races use on it (roadBuild, 004c), then the scenery (buildScenery, 004e,
   with one builder per biome after it). Each takes what it needs from the road object rd. */
function buildTrack(seed,wk,cx,lk,sp,bm){
  if(T)disposeGroup(T.group);
  const rd=roadShape(seed,wk,cx,lk,sp);Object.assign(rd,roadBuild(rd));
  const{D,LN,L,N,ds,P,R,U,Tg,H,Cs,Kg,Kn,kind,gap,feats,jumps,drops,splits,spl,fig8,fopt,dropped,minR,corners,group,roadM,edgeM,glass,rail,mag,wallH,ctop,pads,zones,marks,minY}=rd;let{minX,maxX,minZ,maxZ}=rd;
  const{LK,bk,dial,floorY,water,tun,prism,env,bmInfo}=buildScenery(rd,bm);
  headL.visible=!!cx;hemi.color.setHex(LK.hemi?LK.hemi[0]:0x9fb4d0);hemi.groundColor.setHex(LK.hemi?LK.hemi[1]:0x15120c);hemi.intensity=LK.hemi?LK.hemi[2]:0.85;sun.color.setHex(LK.sun?LK.sun[0]:0xfff1d6);sun.intensity=LK.sun?LK.sun[1]:0.7;
  for(const S0 of splits)for(const q of S0.pts){minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minZ=Math.min(minZ,q.z);maxZ=Math.max(maxZ,q.z)}
  /* Prototype 60: which new jump's gap each sample is in (its index + 1), for drawing a frame over it level (placeShip) */
  const jg=new Uint16Array(N);jumps.forEach((j,n)=>{if(j.kind)for(let k=Math.ceil(j.u0/ds);k<=Math.floor(j.u1/ds);k++)jg[k%N]=n+1});
  T={jg,env,tun,prism,look:LK,bm:{k:bk,d:dial},bmD:dial,bmInfo,drops,mats:{edgeM,rail,glass,roadM,water:water&&water.material},seed,wk,cx,lk:lk||'M',sp:sp||null,dropped,LN,D,L,N,ds,P,R,U,Tg,H,K:Kg,Kn,Cs,kind,gap,feats,jumps,pads,zones,marks,wallH,ctop,mag,group,floorY,splits,spl,fig8,theme:fopt&&fopt.theme||null,bounds:{minX,maxX,minZ,maxZ},stats:{minR,corners,climb:P.reduce((m,p)=>Math.max(m,p.y),-1e9)-minY}};
  try{VFX.hz=null}catch(e){}
}
