//# loop/089-graphics-options.js: graphics options applied at run time
/* ---------- graphics options at work ---------- */
const VFX={kick:[],pulse:0,env:null,envT:null,tick:0,
  init(){if(this.vox)return;const box=new THREE.BoxGeometry(1,1,1);
    const mk=(n,add)=>{const m=new THREE.InstancedMesh(box,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:!add}),n);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;const z=new THREE.Matrix4().makeScale(0,0,0),c=new THREE.Color();for(let i=0;i<n;i++){m.setMatrixAt(i,z);m.setColorAt(i,c)}m.visible=false;scene.add(m);return m};
    const pool=(n,add)=>({m:mk(n,add),n,p:new Float32Array(n*3),v:new Float32Array(n*3),q:new Float32Array(n*4),w:new Float32Array(n*3),life:new Float32Array(n),max:new Float32Array(n),sz:new Float32Array(n),pal:new Uint8Array(n),fl:new Float32Array(n),i:0,live:0});
    this.vox=pool(900,true);this.chunks=pool(300,false);this.sparks=pool(400,true);this.wisp=pool(600,true);
    this.PAL=[[0xfff6d0,0xffd040,0xff8a1f,0xe0401a,0x5a1406],[0xffffff,0xc8ffff,0x3ff0ff,0x1a8cff,0x0e2878],[0xffffff,0xffe08a,0xffb000,0xff6a1f,0x802010],[0x8a919c,0x5d636e,0x3a3f48,0xffb000,0x2a2e36],[0xe0b4ff,0xc77dff,0xa94dff,0x7a2ad6,0x34106a]].map(a=>a.map(h=>new THREE.Color(h)));
    /* the sky: a dome of stars and an aurora, drawn behind everything */
    const sc=document.createElement('canvas');sc.width=2048;sc.height=1024;const g=sc.getContext('2d'),rr=rng(4242);
    for(let k=0;k<1800;k++){const y=rr()*rr()*520,b=0.25+rr()*0.75;g.fillStyle=`rgba(${200+rr()*55|0},${210+rr()*45|0},255,${b})`;const sz=rr()<0.08?2:1;g.fillRect(rr()*2048,y,sz,sz)}
    for(const[col,y0,amp,fq]of[['70,255,170',330,38,3],['63,200,255',300,30,5],['190,90,255',360,26,4]])for(let x=0;x<2048;x+=2){const y=y0+Math.sin(x/2048*TAU*fq+fq)*amp+Math.sin(x/2048*TAU*fq*3.7)*amp*0.3,gr=g.createLinearGradient(0,y-90,0,y+10);
      gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(0.75,`rgba(${col},${0.10+0.06*Math.sin(x*0.01)})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x,y-90,2,100)}
    const st=new THREE.CanvasTexture(sc);this.sky=new THREE.Mesh(new THREE.SphereGeometry(2600,64,32),new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false,fog:false,side:THREE.BackSide}));this.sky.renderOrder=-10;this.sky.visible=false;scene.add(this.sky);
    /* floating motes */
    const n=600,pg=new THREE.BufferGeometry(),pp=new Float32Array(n*3);for(let k=0;k<n*3;k++)pp[k]=(Math.random()-0.5)*140;pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
    this.motes=new THREE.Points(pg,new THREE.PointsMaterial({color:0x9fd8ff,size:0.32,transparent:true,opacity:0.75,blending:THREE.AdditiveBlending,depthWrite:false}));this.motes.frustumCulled=false;this.motes.visible=false;scene.add(this.motes);this.moteCol=0x9fd8ff;
},
  emit(P,p,v,q,life,sz,pal,fl){const i=P.i;P.i=(P.i+1)%P.n;P.p[i*3]=p.x;P.p[i*3+1]=p.y;P.p[i*3+2]=p.z;P.v[i*3]=v.x;P.v[i*3+1]=v.y;P.v[i*3+2]=v.z;
    if(q){P.q[i*4]=q.x;P.q[i*4+1]=q.y;P.q[i*4+2]=q.z;P.q[i*4+3]=q.w}else{P.q[i*4]=P.q[i*4+1]=P.q[i*4+2]=0;P.q[i*4+3]=1}
    P.w[i*3]=(Math.random()-.5)*12;P.w[i*3+1]=(Math.random()-.5)*12;P.w[i*3+2]=(Math.random()-.5)*12;P.life[i]=P.max[i]=life;P.sz[i]=sz;P.pal[i]=pal;P.fl[i]=fl==null?-1e9:fl;P.live=Math.max(P.live,1)},
  step(P,dt,grav){if(!P.live)return;const M=_vm,q=_vq,e=_ve,pv=_vp,sc=_vs;let any=0;
    for(let i=0;i<P.n;i++){let L=P.life[i];if(L<=0)continue;L-=dt;P.life[i]=L;const o=i*3;
      if(L<=0){M.makeScale(0,0,0);P.m.setMatrixAt(i,M);continue}any=1;
      if(grav){P.v[o+1]-=grav*dt}P.p[o]+=P.v[o]*dt;P.p[o+1]+=P.v[o+1]*dt;P.p[o+2]+=P.v[o+2]*dt;
      if(P.p[o+1]<P.fl[i]){P.p[o+1]=P.fl[i];P.v[o+1]*=-0.38;P.v[o]*=0.75;P.v[o+2]*=0.75}
      const f=1-L/P.max[i],pal=this.PAL[P.pal[i]],k=Math.min(4,Math.floor(f*5));
      q.set(P.q[i*4],P.q[i*4+1],P.q[i*4+2],P.q[i*4+3]);if(grav){e.set(P.w[o]*(1-f),P.w[o+1]*(1-f),P.w[o+2]*(1-f));_vq2.setFromEuler(new THREE.Euler(e.x*f,e.y*f,e.z*f));q.multiply(_vq2)}
      const z=P.sz[i]*(grav?(f>0.75?(1-f)*4:1):Math.pow(1-f,0.7));sc.set(z,z,z);pv.set(P.p[o],P.p[o+1],P.p[o+2]);M.compose(pv,q,sc);P.m.setMatrixAt(i,M);P.m.setColorAt(i,pal[k])}
    P.m.instanceMatrix.needsUpdate=true;if(P.m.instanceColor)P.m.instanceColor.needsUpdate=true;P.live=any;P.m.visible=!!any},
  /* Purple cubes of every size off a frame knocked out of phase: some hang by it and drift up as wisps, the rest stream
     back as a trail. In every look (they are the hit's cue now), half as many with Low detail. */
  wisps(dt){for(const r of racers){if(!(r.spinD>0)||r.wreck>0||!r.ship||r.isGhost||r.off||Math.abs(wrapU(r.u-player.u))>180)continue;
      const k=Math.min(1,r.spinT/r.spinD),e=Math.pow(1-k,0.6);r._wa=(r._wa||0)+(r.glBig?150:100)*e*(RES.low?0.5:1)*dt;const n=Math.min(10,Math.floor(r._wa));r._wa-=n;if(!n)continue;
      const s=sampleAt(r.u),z=r.d.size||1;
      for(let q=0;q<n;q++){_vd.copy(r.ship.position).addScaledVector(s.r,(Math.random()-.5)*2.2*z).addScaledVector(s.u,Math.random()*0.9-0.2).addScaledVector(s.t,(0.6-Math.random()*2.4)*z);
        const f=Math.random()<0.55?0.55+Math.random()*0.4:0.15+Math.random()*0.35;_ve2.copy(s.t).multiplyScalar(r.v*f);rdir(_va);_ve2.addScaledVector(_va,1+Math.random()*3.5).addScaledVector(s.u,0.8+Math.random()*2.2);
        this.emit(this.wisp,_vd,_ve2,null,0.35+Math.random()*0.65,(0.05+0.34*Math.pow(Math.random(),2.2))*(r.glBig?1.25:1),4)}}},
  stepWisp(P,dt){if(!P.live)return;const M=_vm,q=_vq,pv=_vp,sc=_vs,dr=Math.max(0,1-1.6*dt);let any=0;
    for(let i=0;i<P.n;i++){let L=P.life[i];if(L<=0)continue;L-=dt;P.life[i]=L;const o=i*3;if(L<=0){M.makeScale(0,0,0);P.m.setMatrixAt(i,M);continue}any=1;
      P.v[o]*=dr;P.v[o+1]=P.v[o+1]*dr+1.6*dt;P.v[o+2]*=dr;P.p[o]+=P.v[o]*dt;P.p[o+1]+=P.v[o+1]*dt;P.p[o+2]+=P.v[o+2]*dt;
      const f=1-L/P.max[i],a=P.max[i]-L;q.setFromEuler(_gE.set(P.w[o]*a,P.w[o+1]*a,P.w[o+2]*a));
      pv.set(P.p[o],P.p[o+1],P.p[o+2]);const z=P.sz[i]*Math.min(1,f*8)*Math.pow(1-f,0.8)*clamp((pv.distanceTo(camera.position)-1.5)/3.5,0,1);/* thin out where they stream past the camera */
      sc.set(z,z,z);M.compose(pv,q,sc);P.m.setMatrixAt(i,M);P.m.setColorAt(i,this.PAL[4][Math.min(4,Math.floor(f*5))])}
    P.m.instanceMatrix.needsUpdate=true;if(P.m.instanceColor)P.m.instanceColor.needsUpdate=true;P.live=any;P.m.visible=!!any},
  debris(pos,big){if(!g2('debris'))return;this.init();const nC=big?14:5,nS=big?26:10,fl=pos.y-1.0;
    for(let k=0;k<nC;k++){_va.set(Math.random()-.5,Math.random()*0.8+0.2,Math.random()-.5).normalize().multiplyScalar((big?15:9)*(0.5+Math.random()));this.emit(this.chunks,_vb.copy(pos).addScaledVector(_va,0.03),_va,null,1.3+Math.random()*0.6,0.18+Math.random()*0.3,3,fl)}
    for(let k=0;k<nS;k++){_va.set(Math.random()-.5,Math.random()*0.9,Math.random()-.5).normalize().multiplyScalar((big?26:15)*(0.4+Math.random()));this.emit(this.sparks,pos,_va,null,0.35+Math.random()*0.35,0.07+Math.random()*0.08,2,fl)}},
  applyEnv(){const on=g2('reflect');if(on&&T&&this.envT!==T&&!NO_RENDER){this.init();if(this.envRT)this.envRT.dispose();this.envRT=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
      const cc=new THREE.CubeCamera(1,3000,this.envRT),b=T.bounds;let y=0;for(let i=0;i<T.N;i+=20)y+=T.P[i].y;y/=Math.ceil(T.N/20);cc.position.set((b.minX+b.maxX)/2,y+30,(b.minZ+b.maxZ)/2);
      const vis=racers.map(r=>r.ship&&r.ship.visible);racers.forEach(r=>{if(r.ship)r.ship.visible=false});try{cc.update(renderer,scene)}catch(e){}racers.forEach((r,i)=>{if(r.ship)r.ship.visible=vis[i]});this.envT=T}
    const env=on&&this.envRT?this.envRT.texture:null,set=(m,k)=>{if(m&&m.envMap!==env){m.envMap=env;m.combine=THREE.MixOperation;m.reflectivity=k;m.needsUpdate=true}};
    for(const r of racers)for(const m of(r.ship&&r.ship.userData.mats)||[])set(m,0.38);if(T&&T.mats){set(T.mats.roadM,0.16);set(T.mats.water,0.32)}},
  update(dt){const race=S.state==='race'||S.state==='done'||S.state==='countdown'||S.state==='paused';
    if(!this.vox)this.init();
    if(this.vox){const V=this.vox;
      if(race)for(const r of racers){if(!r.ship||!r.ship.visible||r.wreck>0||r.isGhost)continue;const ud=r.ship.userData;if(!ud.trails||!ud.trails.length)continue;
        r.ship.getWorldPosition(_va);if(!r._vp)r._vp=_va.clone();_vb.copy(_va).sub(r._vp).divideScalar(Math.max(dt,1e-3));r._vp.copy(_va);if(_vb.lengthSq()>160000)_vb.set(0,0,0);{const lim=Math.abs(r.v||0)*1.15+4,l2=_vb.lengthSq();if(l2>lim*lim)_vb.multiplyScalar(lim/Math.sqrt(l2))}
        const bo=r.boost>0||r.selfBoost,rate=(50+100*clamp(r.v/VMAX,0,1.3))*(bo?1.5:1);r._va=(r._va||0)+rate*dt;const n=Math.min(8,Math.floor(r._va));r._va-=n;if(!n)continue;
        _vq.copy(r.ship.getWorldQuaternion(_vq3));_vbk.set(0,0,1).applyQuaternion(_vq);const ex=16+r.v*0.12;
        for(const tr of ud.trails){tr.getWorldPosition(_vc);const w=tr.userData.w||0.3;
          for(let k=0;k<n;k++){const f=k/n;_vd.set(_vc.x-_vb.x*dt*f+(Math.random()-.5)*0.2*w,_vc.y-_vb.y*dt*f+(Math.random()-.5)*0.2*w,_vc.z-_vb.z*dt*f+(Math.random()-.5)*0.2*w);
            _ve2.copy(_vb).addScaledVector(_vbk,ex);_ve2.x+=(Math.random()-.5)*2.5;_ve2.y+=(Math.random()-.5)*2.5;_ve2.z+=(Math.random()-.5)*2.5;_vd.addScaledVector(_ve2,-(1-f)*dt);
            this.emit(V,_vd,_ve2,_vq,0.12+Math.random()*0.08,w*(0.5+Math.random()*0.3),bo?1:0)}}}
      if(race)this.wisps(dt);
      this.step(V,dt,0);this.step(this.chunks,dt,26);this.step(this.sparks,dt,20);this.stepWisp(this.wisp,dt)}
    if(this.sky){this.sky.visible=g2('sky')&&!(T&&T.env&&T.env.sky);if(this.sky.visible)this.sky.position.copy(camera.position)}
    if(this.motes){const on=g2('motes')&&race&&!SPL.race;this.motes.visible=on;if(on){const a=this.motes.geometry.attributes.position,A=a.array,c=camera.position,t=S.t;
      for(let k=0;k<A.length;k+=3){for(let d=0;d<3;d++){const h=d===1?35:70,cc=d===0?c.x:d===1?c.y:c.z;let x=A[k+d];if(x<cc-h)x+=2*h;else if(x>cc+h)x-=2*h;A[k+d]=x}A[k+1]+=Math.sin(t*0.7+k)*0.004}a.needsUpdate=true;this.motes.material.color.setHex(this.moteCol)}}
    /* atmosphere: a coloured haze */
    {const hz=g2('haze'),f=scene.fog,lk=(T&&T.look)||BIOMES.U;if(hz!==this.hz){this.hz=hz;if(hz){f.color.setHex(lk.haze);f.near=40;f.far=lk.k==='N'?1400:700;scene.background.setHex(lk.haze)}else{f.color.setHex(lk.bg);f.near=lk.fog[0];f.far=lk.fog[1];scene.background.setHex(lk.bg)}}}
    /* the beat on the track edges */
    {const ct=music.ctx?music.ctx.currentTime:0;while(this.kick.length&&this.kick[0]<=ct){(this.kt||(this.kt=[])).unshift(this.kick.shift());this.pulse=1}if(this.kt&&this.kt.length>8)this.kt.length=8;if(this.kick.length>64)this.kick.splice(0,this.kick.length-64);this.pulse*=Math.exp(-dt*7);
      const m=T&&T.mats;if(m){const p=g2('pulse')?this.pulse:0;if(p>0.005||this.lp>0.005){m.edgeM.color.setScalar(1+0.9*p);m.rail.color.setRGB(1+0.4*p,0.69*(1+0.6*p),0.25*p);m.glass.opacity=0.10+0.14*p}this.lp=p}}
    if(T&&T.env){T.env.update(S.t,g2('anim'));if(T.env.cave)T.env.cave(camera);if(T.env.sky)T.env.sky.position.copy(camera.position);this.moteCol=T.look.mote}
    if(++this.tick%30===0)this.applyEnv()}};
const _eu=new THREE.Euler(),_em=new THREE.Matrix4(),_eq=new THREE.Quaternion(),_es=new THREE.Vector3(),_ep=new THREE.Vector3(),_ec=new THREE.Color();
const _va=new THREE.Vector3(),_vb=new THREE.Vector3(),_vc=new THREE.Vector3(),_vd=new THREE.Vector3(),_ve2=new THREE.Vector3(),_vbk=new THREE.Vector3(),_vm=new THREE.Matrix4(),_vq=new THREE.Quaternion(),_vq2=new THREE.Quaternion(),_vq3=new THREE.Quaternion(),_ve=new THREE.Vector3(),_vp=new THREE.Vector3(),_vs=new THREE.Vector3(),_vcol=new THREE.Color();
function fpsTick(d){const ov=(g2('scan')?'s':'')+(g2('vig')?'v':'');if(ov!==FPS.ov){FPS.ov=ov;$('scrS').hidden=!g2('scan');$('scrV').hidden=!g2('vig');$('scrS').style.setProperty('--sl',(4/Math.min(devicePixelRatio||1,2)).toFixed(2)+'px')}
  if(!FPS.on||!(d>0))return;FPS.n++;FPS.acc+=d;if(FPS.acc>=0.5){$('fps').textContent=Math.round(FPS.n/FPS.acc)+' FPS';FPS.n=0;FPS.acc=0}}
function frame(now){
  /* (P60) a device in controller mode draws nothing: it is a gamepad now */
  if(PADC.on){lastT=now;requestAnimationFrame(frame);return}
  if(FCAP.v){const ms=1000/FCAP.v;if(now<FCAP.due-1.5){requestAnimationFrame(frame);return}FCAP.due=now-FCAP.due>ms*2?now+ms:FCAP.due+ms}
  const rawDt=(now-lastT)/1000,dt=Math.min(FCAP.v?Math.max(0.05,1.5/FCAP.v):0.05,rawDt);lastT=now;fit();fpsTick(rawDt);logFrame(rawDt);
  greenTex.offset.y-=dt*1.6;purpleTex.offset.y-=dt*1.6;
  if(S.state==='lab'||S.state==='tut'||S.state==='fsel'){S.t+=dt;if(S.state==='tut')tutFrame(dt);else if(S.state==='fsel')fsFrame(dt);else{readInput();labFrame(dt)}GFX.fx=0;GFX.gl=0;gfxRender(labScene,labCam)}
  else{if(S.state!=='paused')step(dt);else readInput();
    {const p=player,b=p.boost>0||p.selfBoost;GFX.fx=S.state==='race'&&p.wreck<=0?clamp(clamp((p.v/VMAX-0.95)*2.2,0,1)*(0.55+0.45*(p.dive||0))+(b?0.3:0),0,1):0;
      GFX.gl=S.state==='race'&&p.spinD>0&&p.wreck<=0?0.6*Math.pow(1-Math.min(1,p.spinT/p.spinD),1.5):0}
    VFX.update(dt);if(!NO_RENDER||window.__hlRender){if(SPL.race&&SPL.ln)splRender();else gfxRender(scene,camera)}}
  if(S.state==='menu'){pv3.acc+=dt;if(pv3.acc>=1/30){const cv=!$('menu').hidden?$('preview'):!$('career').hidden?$('carPreview'):!$('train').hidden?$('trPreview'):!$('mp').hidden?$('mpPreview'):!$('spl').hidden?$('splPreview'):!$('ed').hidden?$('edPreview'):null;if(cv)pv3Draw(cv,pv3.acc);pv3.acc=0}}
  requestAnimationFrame(frame)}


let lastRank=-1,splitSaid='',lapT0=3;
/* Tune codes: the current tune's state packed as D/T + 8 hex digits. Keep saves it locally; Load plays it back; the tune then evolves from there. */
function tuneUI(){try{mmSync()}catch(e){}try{for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}for(const id of['dislikeTune','dislikeTune2','dislikeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.disliked()))}}catch(e){}const c=music.code(),so=music.soOn&&music.soCur,pre=music.modeEff()==='pre'&&music.style!=='off'?music.pgBusy?' · pregen: rendering':music.pg&&music.pgH()&&music.pg.code===codeOf(music.pgH())?' · pregen: ready':'':'';$('tuneHud').textContent=so?'♪ '+so.t+' · '+so.a:c?'♪ '+KEYS[music.st.key]+' '+THEMES[music.st.theme].mode+' · '+c:'';$('tuneInfo').textContent=music.info();const ml=music.modeLabel();$('titleTune').textContent=so?'♪ '+so.t+' · '+so.a+' ('+so.l+')':c&&music.style!=='off'?(ml?ml+' · ':'♪ ')+c+' · '+music.info()+pre:'';
  if(document.activeElement!==$('tuneIn'))$('tuneIn').value=c;
  try{libUI()}catch(e){}}
music.onChange=tuneUI;
$('tuneLoad').onclick=()=>{audio.init();if(music.load($('tuneIn').value)){music.ensure();music.setMood(S.state==='menu'?'menu':'race');syncMusic();tuneUI();note('Tune loaded',1200)}else{note('Tune codes look like D3F9AC21E',2200);$('tuneIn').value=music.code()}};
$('tuneIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('tuneLoad').click()});
$('tuneNew').onclick=()=>{audio.init();music.newTune();music.ensure();music.setMood(S.state==='menu'?'menu':'race');tuneUI()};
const keepTune=()=>{const c=music.keep();if(c){note('Tune '+c+' kept · find it in Settings, Music, Library',2000);tuneUI()}};
for(const id of['tuneKeep','keepBtn3'])$(id).onclick=keepTune;
