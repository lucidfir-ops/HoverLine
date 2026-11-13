//# track/004r-spirit-live.js: the Spirit realm each frame: the music it answers (kicks, bars, sections, the sound's spectrum), the lattice's response, pyramids shedding, arches timed to the leader, heads pacing the pack, colossi watching the leader, rare ghost riders, echoes of the leaders, Calm visuals
/* Prototype 62. All cosmetic: this reads the clock, the music and where the racers' frames are, and sets uniforms. It
   never touches physics, the AI or results, and draws no number from any race's random stream (its few random choices
   come from a hash of the race clock), so a race replays the same with the realm on (tools/tests/replay.js).
   The music, in every mode: Generative and Pregen give the kick times (VFX.kt, the same queue the track lights use) and
   the section (music.sec, or the Pregen loop's position, 48 bars: drop 16, B 16, breakdown 8, build 8); every mode,
   Songs included, goes through the music volume (audio.musG), where an AnalyserNode reads the spectrum for the sound
   form. Songs have no kick queue: their kicks are found in the bass band (an onset over the running level) and their
   breakdowns and drops from the level over the last few seconds against the last half minute. With the music off, or
   Lights on the beat off, the realm keeps a slow 140 bpm drift with no pulses.
   No effect flashes more than three times a second: kicks closer than 0.34 s to the last one shown are not shown. */
let SP_CALM=(()=>{const v=store.get('hoverline.calm');return v==null?null:v==='1'})();
const spCalm=()=>SP_CALM==null?!g2('blur'):SP_CALM;
const SPMUS={sb:{t:0,slow:0,fast:0,k:'drop',since:0,age:0,song:null},an2:null,fd2:null,oq:[],sk2:{h:[],hi:0.1,lo:0,last:-9,on:[],tT:0},bq:[],pk:[0.3,0.3,0.3,0.3],an:null,src:null,fd:null,acc:[],last:-9,anchor:0,bpm:140,sec:'',dropT:-99,brk:0,build:0,tight:0,g0:0,band:[0,0,0,0],peak:[0.3,0.3,0.3,0.3],lvl:0,hist:[],histT:0,slow:0,fast:0,sk:{e:0,avg:0,t:-9},lastNow:0,
  /* the analyser on the music volume (made once, on the music's own context) */
  analyser(){try{const g=audio.musG,c=music.ctx;if(!g||!c||g.context!==c)return null;if(this.an&&this.src===g)return this.an;const a=c.createAnalyser();a.fftSize=512;a.smoothingTimeConstant=0.55;g.connect(a);
      const z=c.createGain();z.gain.value=0;a.connect(z);z.connect(c.destination);this.an=a;this.src=g;this.fd=new Uint8Array(a.frequencyBinCount);return a}catch(e){return null}},
  /* Prototype 63: Songs mode finds its kicks in a second analyser made for it: 2048 points (23 Hz a bin, so the bass is more than two bins) and no
     smoothing, on the music volume like the first */
  analyser2(){try{const g=audio.musG,c=music.ctx;if(!g||!c||g.context!==c)return null;if(this.an2)return this.an2;const a=c.createAnalyser();a.fftSize=2048;a.smoothingTimeConstant=0;g.connect(a);const z=c.createGain();z.gain.value=0;a.connect(z);z.connect(c.destination);this.an2=a;this.fd2=new Uint8Array(a.frequencyBinCount);return a}catch(e){return null}},
  /* a kick in the bass (30 to 110 Hz) of a song: a rise over the last 80 ms that is a good part of the range the bass has had lately (the
     level over the last 2 s against its lowest), at most one every 0.34 s. Tuned on the eight songs in songs/ (tools/tests/spirit-songs.js). */
  onset(x){const s=this.sk2,h=s.h,prev=h.length?h[h.length-1]:null;h.push(x);if(h.length>14)h.shift();const dt=prev?Math.max(1e-3,x.t-prev.t):0.016;
    s.hi=Math.max(x.e,s.hi*Math.exp(-dt/2));s.lo=Math.min(x.e,s.lo+(x.e-s.lo)*Math.min(1,dt/2));let j=h.length-1;while(j>0&&x.t-h[j].t<0.08)j--;
    const rise=x.e-h[j].e;if(prev&&rise>(s.hi-s.lo)*0.18+0.01&&rise>0.02&&x.e>=prev.e&&x.t-s.last>0.34){s.last=x.t;return rise}return 0},
  /* a song's breakdown and drop from its bass (30 to 110 Hz): the bass over the last 1.5 s against the last 20 s; a breakdown when it falls
     under half, the drop when it is back over 0.8, at least 4 s each way and none in the first 15 s of a song (the level over all bands
     hardly moved in the eight songs: tools/tests/spirit-songs.js, and chattered on one). A song's end, fading out, counts as a breakdown. */
  songSec(x){const s=this.sb;if(s.song!==music.soCur){s.song=music.soCur;s.slow=s.fast=s.t=s.since=s.age=0;s.k='drop'}
    const dt=s.t?Math.max(1e-3,Math.min(0.2,x.t-s.t)):0.016;s.t=x.t;s.slow+=(x.e-s.slow)*Math.min(1,dt/20);s.fast+=(x.e-s.fast)*Math.min(1,dt/1.5);s.since+=dt;s.age+=dt;if(s.age<15||s.since<4)return;
    if(s.k==='drop'&&s.fast<s.slow*0.5){s.k='brk';s.since=0}else if(s.k==='brk'&&s.fast>s.slow*0.8){s.k='drop';s.since=0;this.dropT=x.t}},
  /* the kick ages, bars and sections for this frame; now: the music's clock (s) */
  read(dt,on){const c=music.ctx,raw=c?c.currentTime:performance.now()/1000,now=c?musHeard():raw,playing=!!(c&&music.style!=='off'&&(music.st||music.pgOn||music.soOn)&&c.state==='running');this.now=now;
    /* the spectrum. Prototype 63: an analyser reads the sound where it is made, before the speaker's delay; each reading is kept
       with the context time it was taken and used when it is heard (musHeard), like the kicks and sections, so the picture and
       the sound line up in every mode */
    const a=playing?this.analyser():null;
    if(a){a.getByteFrequencyData(this.fd);const F=this.fd,n=F.length,hz=c.sampleRate/2/n,b=[[20,150],[150,600],[600,3000],[3000,12000]],bn=[];let tot=0;
      for(let k=0;k<4;k++){const i0=Math.max(0,Math.floor(b[k][0]/hz)),i1=Math.min(n-1,Math.ceil(b[k][1]/hz));let s=0;for(let i=i0;i<=i1;i++)s+=F[i];const v=s/((i1-i0+1)*255);tot+=v;
        this.peak[k]=Math.max(v,this.peak[k]*Math.exp(-dt/6),0.08);bn.push(Math.min(1,v/this.peak[k]))}
      this.bq.push({t:raw,b:bn,lvl:tot/4,pk:this.peak.slice()});if(this.bq.length>300)this.bq.shift()}
    else if(!playing)this.bq.length=0;
    let got=false;while(this.bq.length>1&&this.bq[1].t<=now)this.bq.shift();
    if(this.bq.length&&(this.bq[0].t<=now||this.bq.length===1)){const e=this.bq[0];for(let k=0;k<4;k++){this.band[k]=e.b[k];this.pk[k]=e.pk[k]}this.lvl=e.lvl;got=this.lvl>0.01}
    if(!got){const t=performance.now()/1000;for(let k=0;k<4;k++)this.band[k]=0.35+0.25*Math.sin(t*0.21+k*1.3)}
    this.live=got;
    /* the kicks: the engine's queue, or onsets in the bass for Songs */
    const K=[];const vk=(typeof VFX!=='undefined'&&VFX.kt)||[];for(const k of vk)if(k>this.lastNow-0.05&&k<=now)K.push(k);
    /* Songs: the bass of the element's sound as it leaves the graph, held back like everything else until heard, then onsets */
    if(playing&&music.soOn){const a2=this.analyser2();if(a2){a2.getByteFrequencyData(this.fd2);const hz=c.sampleRate/2/this.fd2.length,i0=Math.max(1,Math.floor(30/hz)),i1=Math.ceil(110/hz);let sm=0;for(let i=i0;i<=i1;i++)sm+=this.fd2[i];this.oq.push({t:raw,e:sm/((i1-i0+1)*255)});if(this.oq.length>300)this.oq.shift()}
      while(this.oq.length&&this.oq[0].t<=now){const x=this.oq.shift();this.songSec(x);if(this.onset(x))K.push(x.t)}}
    else{this.oq.length=0;this.sk2.h.length=0;this.sk2.on.length=0}
    this.lastNow=now;
    for(const k of K.sort((x,y)=>x-y))if(on&&k-this.last>=0.34){this.last=k;this.acc.unshift(k);if(this.acc.length>4)this.acc.length=4;
      /* the beat follows the kicks (Songs: the tempo from the middle of the last few gaps between them, 85 to 175 bpm) */
      const spb=60/this.bpm,bk=(k-this.anchor)/spb,er=bk-Math.round(bk);this.anchor+=er*spb*0.5;
      if(music.soOn&&this.acc.length>3){const iv=[0,1,2].map(i=>this.acc[i]-this.acc[i+1]).sort((a,b)=>a-b)[1];if(iv>0.34&&iv<0.7){const b0=(k-this.anchor)/spb;this.bpm+=(60/iv-this.bpm)*0.12;this.anchor=k-b0*60/this.bpm}}}
    /* (a tune faster than 180 bpm keeps the realm's beat at half time: the Platonic solids light one beat in two, so never more than 3 a second) */
    if(!music.soOn&&music.bpm)this.bpm=music.bpm>180?music.bpm/2:music.bpm;if(!on||!playing)this.acc.length=0;
    const spb=60/this.bpm,beat=(now-this.anchor)/spb;this.beat=beat;
    /* the section */
    let sec='',bi=0,bl=1;
    if(playing&&music.pgOn&&music.pgS){const S0=music.pgS,P0=S0.P,p=S0.off+(now-S0.t);if(p<P0.loopS){sec='rise';bl=Math.max(1,Math.round(P0.loopS/P0.bd));bi=p/P0.bd}
      else{const bar=((p-P0.loopS)%(P0.loopE-P0.loopS))/P0.bd;sec=bar<16?'drop':bar<32?'b':bar<40?'brk':'rise';bi=sec==='rise'?bar-40:bar%16;bl=sec==='rise'?8:16;if(sec==='drop'&&this.sec!=='drop')this.dropT=now-bar*P0.bd}}
    else if(playing&&music.soOn&&got){sec=this.sb.k}
    else if(playing){const e=music.secAt(now);if(e&&e.n){sec=e.n;bi=e.b+Math.max(0,Math.min(1,(now-e.t)/(spb*4)));bl=e.l||1;if(sec==='drop'&&this.sec!=='drop'&&e.b===0)this.dropT=e.t}}
    this.sec=sec;
    const brkT=on&&sec==='brk'?1:0;this.brk+=(brkT-this.brk)*Math.min(1,dt*2.5);
    this.build=on&&sec==='rise'?Math.min(1,bi/Math.max(1,bl)):0;
    this.drop=on?Math.exp(-(now-this.dropT)/(spb*4)):0;
    /* the shedding pyramids: shed after a drop, back in the breakdown; with no music, slowly to and fro */
    const g0T=!playing?((performance.now()/1000)%36<18?1:0):(sec==='brk'||sec==='rise')?0:1;this.g0+=(g0T-this.g0)*Math.min(1,dt*0.5);
    /* the sound form's moments: one every 1/15 s (1/5 s with Calm visuals), newest first */
    this.histT+=dt;const step=spCalm()?0.2:1/15;if(this.histT>=step||!this.hist.length){this.histT=0;this.hist.unshift(this.band.slice());if(this.hist.length>12)this.hist.length=12}
    else this.hist[0]=this.band.slice();
    return this}};
/* Prototype 63: the lattice's brightness controls from the music (M: drop 0..1, build 0..1, brk 0..1). Round 2's flare was 1.6 on the drop; with the
   soft cap on each strut's brightness in 004q it is 1.1, which keeps the colour (Eric: the lattice glowed white at the drop on his phone).
   Calm visuals keep it under 0.5. */
function spLatDrive(M,calm,kick){const flare=M.drop*(calm?0.45:1.1);return{gain:(1+flare+0.3*M.build)*(1-0.75*M.brk),pk:(1-0.7*M.brk)*(calm?0.4:1),swell:1+(0.25*M.drop+0.08*kick*(1-M.brk))*(calm?0.3:1)}}
/* the realm's frame: sp is ctx.spirit (004m); t the race clock; anim Moving scenery */
function spLive(sp,t,anim){const dt=Math.min(0.1,Math.max(0,t-(sp.t0==null?t:sp.t0)));sp.t0=t;
  const on=g2('pulse'),calm=spCalm(),M=SPMUS.read(dt||1/60,on),U0=SPU;
  if(anim){U0.uT.value=t;U0.uBeat.value=M.beat}
  try{renderer.getDrawingBufferSize(_spV2);U0.uRes.value.copy(_spV2)}catch(e){}
  const kA=U0.uKA.value,now=M.now;for(let k=0;k<4;k++)kA.setComponent(k,M.acc[k]!=null?Math.max(0,now-M.acc[k]):9);
  U0.uKick.value=M.acc.length?Math.exp(-(now-M.acc[0])/(60/M.bpm)*5.5):0;U0.uDrop.value=M.drop;U0.uBuild.value=M.build;U0.uBrk.value=M.brk;U0.uBreath.value=anim?Math.sin(2*Math.PI*M.beat/8):0;U0.uCalm.value=calm?1:0;
  U0.uWorld.value=(1-0.3*M.brk)*(1+0.12*M.drop*(calm?0.3:1));
  for(let k=0;k<12;k++){const h=M.hist[Math.min(k,M.hist.length-1)]||[0,0,0,0];U0.uSF.value[k].set(h[0],h[1],h[2],h[3])}
  /* the lattice: round 2's response, as Eric approved it (flare 1.6 on the drop; Calm keeps it under 0.5) */
  const LU=sp.lat.U,tgt=M.build>0?sp.lat.tight*M.build*M.build*(3-2*M.build):0,LD=spLatDrive(M,calm,U0.uKick.value);M.tight=tgt<M.tight?M.tight+(tgt-M.tight)*0.35:tgt;
  LU.uTight.value=anim?M.tight:0;LU.uPK.value=LD.pk;LU.uGainL.value=LD.gain;LU.uSwellL.value=LD.swell;
  LU.uSwellT.value=calm||!anim?0:1;LU.uSFk.value=M.live?(calm?0.5:1):0.45;
  /* groups: 0 the pyramids, 1.. the arches */
  const G=U0.uG.value,setG=(g,v)=>G[g>>2].setComponent(g&3,v);setG(0,M.g0);
  const mine=!!(T&&T.env&&T.env.spirit===sp),race=mine&&(S.state==='race'||S.state==='countdown'||S.state==='done'||S.state==='paused'),rs=race?racers.filter(r=>r.ship&&!r.isGhost&&!r.off&&r.utot!=null):[];
  let lead=null,last=null;for(const r of rs){if(!lead||r.utot>lead.utot)lead=r;if(!last||r.utot<last.utot)last=r}
  const L=sp.L,wu=d=>{d=((d%L)+L)%L;return d>L/2?d-L:d};
  for(const a of sp.arches){let p=1;if(lead){const dl=wu(a.u-lead.u),dz=wu(a.u-last.u);p=dl>0?ssp((400-dl)/260):dz>-20?1:1-ssp((-dz-20)/60)}setG(a.g,p)}
  /* the posed slots */
  const OP=U0.uOP.value,OQ=U0.uOQ.value;for(let s=0;s<SP_SLOTS;s++)OP[s].w=0;
  const lp=lead?sampleAt(lead.u,_spS):null;
  /* each head: the nearest clear place, outward from its own, 12 m at a time; out at once, back in slowly; the place shown
     is checked again, and the head is hidden for that frame if it is not clear. Prototype 63 (Eric: "the faces that follow
     you should always face you"): the heads pace the local player (in split screen the leading local pilot) and each turns
     its face to the camera it is drawn for (the nearest local pilot's, in split screen) */
  const locals=rs.filter(r=>SPL.race?r.lp:r===player).sort((a,b)=>b.utot-a.utot),fo=locals[0]||lead;
  sp.heads.forEach((h,k)=>{if(!fo)return;const f=sampleAt(fo.u+h.du,_spS2),sx=-f.t.z,sz=f.t.x,sl=Math.hypot(sx,sz)||1,y=f.p.y+h.up,r0=h.s*0.6,at=d=>[f.p.x+sx/sl*h.sd*d,f.p.z+sz/sl*h.sd*d];
    h.push=h.push||0;let want=-1;for(let tr=0;tr<8&&want<0;tr++){const q=at(h.d+tr*12);if(sp.clr.ok(q[0],y,q[1],r0))want=tr*12}
    if(want<0){h.push=96;return}h.push=want>h.push?want:h.push+(want-h.push)*0.05;const q=at(h.d+h.push),by=y+Math.sin(t*0.7+k)*h.s*0.05;
    OP[k].set(q[0],by,q[1],sp.clr.ok(q[0],by,q[1],r0)?1:0);
    let tg=null,bd=1e18;if(locals.length<2)tg=camera.position;else for(const r of locals){const c=r.lp&&r.lp.cam?r.lp.cam.position:r.ship.position,d=(c.x-q[0])**2+(c.z-q[1])**2;if(d<bd){bd=d;tg=c}}
    _spM.lookAt(_spA.set(q[0],by,q[1]),_spB.copy(tg||fo.ship.position),_spUp);_spQ.setFromRotationMatrix(_spM).multiply(_spFlip);OQ[k].set(_spQ.x,_spQ.y,_spQ.z,_spQ.w)});
  for(const c of sp.colossi){const s=c.slot,tx=lead?lead.ship.position:mine?camera.position:_spA.set(0,0,0),dx=tx.x-c.c[0],dz=tx.z-c.c[2];let yaw=Math.atan2(dx,dz)-c.yaw;yaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));yaw=Math.max(-1.2,Math.min(1.2,yaw));
    c.y=c.y==null?yaw:c.y+(yaw-c.y)*Math.min(1,dt*0.8);OP[s].set(0,0,0,1);_spQ.setFromAxisAngle(_spUp,c.y);OQ[s].set(_spQ.x,_spQ.y,_spQ.z,_spQ.w)}
  /* Prototype 63: rare ghost riders and echoes, drawn as the frames the racers fly (spGhost*, below). Each frame type has
     one merged line mesh with images of its own; an image is posed by two uniforms and is faint (Eric: fainter, and the
     mesh of the frame they follow). */
  sp.ghosts=sp.ghosts||new Map();for(const G of sp.ghosts.values()){G.used=0;G.rused=0;for(const v of G.OP)v.w=0}
  /* rare ghost riders: now and then (one half minute of a race in five), a few neon riders fly beside the pack for 4 s, each
     as the frame of one of the racers */
  if(sp.riders&&lead&&S.state==='race'){const slot=Math.floor(S.raceT/30);if(slot!==sp.rideSlot){sp.rideSlot=slot;if(spHash(slot*7919+sp.seed)<0.2&&S.raceT>8)sp.ride={t0:S.raceT,n:3+Math.floor(spHash(slot*31+5)*3)}}
    const R0=sp.ride;if(R0&&S.raceT-R0.t0<4.5){const e=S.raceT-R0.t0,fade=Math.min(1,e*2,(4.5-e)*2);for(let k=0;k<Math.min(R0.n,sp.riders);k++){const sd=k%2?1:-1,f=sampleAt(lead.u-25+k*14,_spS2),sx=-f.t.z,sz=f.t.x,sl=Math.hypot(sx,sz)||1,lat=W/2+SPC_O.margin+5+(k>>1)*5;
      const x=f.p.x+sx/sl*sd*lat,y=f.p.y+3+k%3,z=f.p.z+sz/sl*sd*lat;if(!sp.clr.ok(x,y,z,3))continue;const fl=0.75+0.25*Math.sin(e*TAU*2+k);
      _spM.lookAt(_spA.set(0,0,0),_spB.copy(f.t),f.u);_spQ.setFromRotationMatrix(_spM);spGhostPose(sp,rs[k%rs.length],true,x,y,z,_spQ,fade*fl*0.8)}}}
  /* echoes of the leaders: on the two short stretches, three faint after-images of each of the first three racers; as one
     leaves a stretch, the third joins the second, the second the first and the first the frame (0.12 s each) */
  if(sp.echo&&race&&sp.echoes.length){const top=rs.slice().sort((a,b)=>b.utot-a.utot).slice(0,3),H=sp.hist||(sp.hist=new Map()),tt=S.raceT||t;
    top.forEach((r,k)=>{let h=H.get(r);if(!h)H.set(r,h={p:[],ex:-9,in:false});h.p.unshift({t:tt,x:r.ship.position.x,y:r.ship.position.y,z:r.ship.position.z,q:r.ship.quaternion.clone()});if(h.p.length>40)h.p.length=40;
      const inS=sp.echoes.some(e=>{const d=wu(r.u-e.u0);return d>=0&&d<=e.u1-e.u0});if(h.in&&!inS)h.ex=tt;h.in=inS;const e=tt-h.ex;if(!inS&&e>0.36)return;
      const d1=e<0.24?0.13:Math.max(0,0.13-(e-0.24)/0.12*0.13),d2=e<0.12?0.26:e<0.24?0.26-(e-0.12)/0.12*0.13:d1,d3=e<0.12?0.39-e/0.12*0.13:d2,dl=inS?[0.13,0.26,0.39]:[d1,d2,d3];
      for(let j=0;j<3;j++){const want=tt-dl[j];let pz=h.p[h.p.length-1];for(const p of h.p)if(p.t<=want){pz=p;break}
        spGhostPose(sp,r,false,pz.x,pz.y,pz.z,pz.q,(inS?1:Math.max(0,1-e/0.36))*(0.9-j*0.2))}})}
  for(const G of sp.ghosts.values())G.mesh.visible=G.used+G.rused>0}
/* ---- the frame ghosts (Prototype 63) ----
   The line drawing of a frame is taken once from a ship the game built (its edge lines, in the ship's own space: the very mesh
   that frame is flown as), simplified (short edges dropped, at most 150 of the longest kept) and cached by frame. Each frame
   type that is in the race then gets one mesh: that drawing repeated for 13 images (9 echoes and 4 ghost riders), all drawn as
   one batch; an image is placed by its slot's two uniforms, so after-images cost nothing on the CPU but two vectors. */
const SPGH_E=9,SPGH_R=4,SPF=new Map();
function spFrameSegs(ship,key){let C=SPF.get(key);if(C)return C;const T=THREE,sc=ship.scale.x||1,all=[];
  ship.updateMatrixWorld(true);const inv=new T.Matrix4().copy(ship.matrixWorld).invert(),M=new T.Matrix4(),v=new T.Vector3(),w=new T.Vector3();
  ship.traverse(o=>{if(!(o.isLineSegments&&o.userData.edge))return;const P=o.geometry.attributes.position;M.multiplyMatrices(inv,o.matrixWorld);
    for(let i=0;i+1<P.count;i+=2){v.fromBufferAttribute(P,i).applyMatrix4(M).multiplyScalar(sc);w.fromBufferAttribute(P,i+1).applyMatrix4(M).multiplyScalar(sc);
      const l=v.distanceTo(w);if(l>=0.22)all.push({l,a:[v.x,v.y,v.z],b:[w.x,w.y,w.z]})}});
  all.sort((p,q)=>q.l-p.l);C=all.slice(0,150).map(e=>[e.a,e.b,Math.min(1,Math.max(0,0.25+(e.a[1]+e.b[1])*0.3))]);
  if(!C.length)C=SPS.rider();SPF.set(key,C);return C}
function spGhostSet(sp,r){const key=(r.build&&r.build.frame)||'blade';let G=sp.ghosts.get(key);if(G)return G;
  const M=SPGH_E+SPGH_R,segs=spFrameSegs(r.ship,key),Lb=spLines();
  for(let m=0;m<M;m++){Lb.obj({m:[8,0,0,0],slot:m,pal:m<SPGH_E?5:2,ext:1e4});for(const[a,b,pc]of segs)Lb.seg(a,b,pc,m<SPGH_E?0.2:0.4)}
  const mat=spLineMat({fog:[1200,3000],width:0.22,maxPx:6}),OP=Array.from({length:M},()=>new THREE.Vector4(0,-9999,0,0)),OQ=Array.from({length:M},()=>new THREE.Vector4(0,0,0,1));
  mat.defines.SLOTS=1;mat.defines.SLOTN=M;mat.uniforms.uOP={value:OP};mat.uniforms.uOQ={value:OQ};
  const mesh=Lb.mesh(mat,false);mesh.visible=false;sp.group.add(mesh);G={key,mesh,OP,OQ,used:0,rused:0,segs:segs.length};sp.ghosts.set(key,G);return G}
/* pose one image of racer r's frame (rider: a ghost rider, else an echo) at x,y,z facing q, shown at strength a */
function spGhostPose(sp,r,rider,x,y,z,q,a){if(!r||!r.ship)return;const G=spGhostSet(sp,r),m=rider?SPGH_E+G.rused:G.used;if(rider?G.rused>=SPGH_R:G.used>=SPGH_E)return;if(rider)G.rused++;else G.used++;
  G.OP[m].set(x,y,z,a);G.OQ[m].set(q.x,q.y,q.z,q.w)}
const ssp=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const spHash=n=>{let h=(n|0)^0x9E3779B9;h=Math.imul(h^h>>>16,0x85EBCA6B);h=Math.imul(h^h>>>13,0xC2B2AE35);return((h^h>>>16)>>>0)/4294967296};
const _spV2=new THREE.Vector2(),_spS={p:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3(),t:new THREE.Vector3(),h:0},_spS2={p:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3(),t:new THREE.Vector3(),h:0},
  _spM=new THREE.Matrix4(),_spQ=new THREE.Quaternion(),_spA=new THREE.Vector3(),_spB=new THREE.Vector3(),_spUp=new THREE.Vector3(0,1,0),_spFlip=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);
/* Prototype 62: the Calm visuals chip on the Graphics page (dossier 71). Until it is pressed it follows Speed blur (on
   while blur is off); once pressed it is the player's own choice, kept as hoverline.calm. */
{const b=$('calmBtn'),sync=()=>{if(b)b.setAttribute('aria-pressed',String(spCalm()))};
  if(b)b.onclick=()=>{SP_CALM=!spCalm();store.set('hoverline.calm',SP_CALM?'1':'0');sync();try{audio.blip(SP_CALM?880:440,0.06,0.05)}catch(e){}};
  const g=$('gfxOpen');if(g)g.addEventListener('click',sync);sync()}
