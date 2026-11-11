//# core/003-graphics.js: graphics presets, post effects, sky and lighting per time of day
/* ---------- graphics ----------
   Standard draws straight to the screen (the light path, for low-end devices). Enhanced draws into a buffer and adds
   bloom on everything bright (the neon edges, pads, engine glows, shields), a vignette, and at speed a little radial
   blur with colour fringing. */
const GFX={mode:'options',w:0,h:0,fx:0,ok:true};
/* Graphics options, each on or off by itself (stored as hoverline.gfx2). A player who had chosen Enhanced starts with
   the effects that used to make it up. */
const GOPT=[
 ['bloom','Glow','Bright lights, pads, engines and shields glow.','medium'],
 ['blur','Speed blur','The screen blurs outwards at top speed and in a deep dive.','medium'],
 ['aberr','Colour fringing','Red and blue split apart at the screen edges at speed.','light'],
 ['vig','Vignette','Darker screen corners.','light'],
 ['grade','Colour grade','Richer, punchier colour.','light'],
 ['fxaa','Smooth edges','Softens jagged edges (anti-aliasing).','light'],
 ['grain','Film grain','A fine moving grain over the picture.','light'],
 ['scan','Scanlines','An old arcade screen look.','light'],
 ['jets','Boost jets','A pulsing jet with rings racing down it when you boost.','light'],
 ['debris','Debris','Explosions throw sparks and cubes that bounce along the road.','medium'],
 ['reflect','Reflections','Frames, the road and the sea reflect the world around them.','medium'],
 ['sky','Starry sky','Stars and an aurora above the city and the forest at night (Stratos, Ocean, Reef and Prism always have their own sky, and by day every setting has a daylight sky).','light'],
 ['haze','Atmosphere','A coloured haze that thickens with distance.','light'],
 ['motes','Floating particles','Dust, spray, fireflies or star dust drifting in the air.','light'],
 ['anim','Moving scenery','Falls pour, geysers burst, whitecaps roll and the city traffic flies.','medium'],
 ['pulse','Lights on the beat','Track edges pulse with the kick drum.','light'],
 ['lines','Ship edge lines','Thin lines of light along the edges of the ships (Prototype 51).','light']];
/* Performance presets (Prototype 39; they were looks): Ultra low has every option off, 20% resolution, Low detail and a
   30 fps cap; Lite every option off, 50% and a 45 fps cap; Default every option on at full resolution with no cap, and
   it is where a new player starts. Each also picks the music mode (perfApply). Clean and Arcade are gone: a look saved
   from them keeps its parts and shows as the player's own. Every part can still be switched on or off by itself. */
const STYLES={ultra:{n:'Ultra low',on:[],res:0.2,low:1,fcap:30},lite:{n:'Lite',on:[],res:0.5,fcap:45},all:{n:'Default',on:GOPT.map(o=>o[0])}};
const G2=(()=>{let o=null;try{o=JSON.parse(store.get('hoverline.style')||'null')}catch(e){}/* (Prototype 38: hoverline.style only exists once a look or part was chosen, or the game chose Ultra low) */
  if(!o||typeof o!=='object'){o={};for(const k of STYLES.all.on)o[k]=1}delete o.pools;return o})();
const g2=k=>!!G2[k],g2Save=()=>store.set('hoverline.style',JSON.stringify(G2));
/* Prototype 39: a player who never chose a look moves from Clean to Default, so the first-race check (ulCheck), which
   passed on Clean, runs once more */
if(store.get('hoverline.style')==null&&store.get('hoverline.autoUltra')==='ok'&&!store.get('hoverline.def39'))store.set('hoverline.autoUltra','');store.set('hoverline.def39','1');
/* anyone on the old Ultra low (half resolution) moves to the new one once */
if(RES.k===0.5&&RES.low&&GOPT.every(([g])=>!g2(g))&&!store.get('hoverline.ultra32')){RES.k=0.35;store.set('hoverline.res','0.35');renderer.setPixelRatio(resRatio())}store.set('hoverline.ultra32','1');
if(RES.k===0.35&&RES.low&&GOPT.every(([g])=>!g2(g))&&!store.get('hoverline.ultra34')){RES.k=0.25;store.set('hoverline.res','0.25');renderer.setPixelRatio(resRatio())}store.set('hoverline.ultra34','1');
/* Prototype 35: Ultra low draws at 20% and caps at 30 fps; anyone on it (or on their own look as light as it) moves once */
if(RES.low&&RES.k<=0.25&&GOPT.every(([g])=>!g2(g))&&!store.get('hoverline.ultra35')){if(RES.k===0.25){RES.k=0.2;store.set('hoverline.res','0.2');renderer.setPixelRatio(resRatio())}if(store.get('hoverline.fcap')==null){FCAP.v=30;store.set('hoverline.fcap','30')}}store.set('hoverline.ultra35','1');
const styleNow=()=>{for(const[k,st]of Object.entries(STYLES))if(GOPT.every(([g])=>g2(g)===st.on.includes(g))&&(st.res||1)===RES.k&&!!st.low===RES.low&&(st.fcap||0)===FCAP.v)return k;return null};
const resSave=()=>{store.set('hoverline.res',String(RES.k));store.set('hoverline.low',RES.low?'1':'0');cw=0};
/* A preset picks the music mode too: Songs on Ultra low (Pregen in a copy without the songs/ folder, and until that is
   known), Pregen on Lite, Generative on Default. It shows as picked only while the music matches as well (Ultra low takes
   Songs or Pregen); any change after it shows as the player's own setup. */
const PERF={wait:0,want:null,last:null};
const perfMM=k=>k==='ultra'?(SONGS.ok?'songs':'pre'):k==='lite'?'pre':'gen';
const perfNow=()=>{const k=styleNow();if(!k)return null;const m=PERF.want||music.modePick();return(k==='ultra'?m==='songs'||m==='pre':m===perfMM(k))?k:null};
function perfApply(k,later){const st=STYLES[k],m0=music.modePick();for(const[g]of GOPT)G2[g]=st.on.includes(g)?1:0;RES.k=st.res||1;RES.low=!!st.low;FCAP.v=st.fcap||0;store.set('hoverline.fcap',String(FCAP.v));FCAP.due=0;
  resSave();g2Save();try{VFX.applyEnv()}catch(e){}const m=perfMM(k);PERF.wait=k==='ultra'&&SONGS.ok==null;
  if(later){PERF.want=m;if(!music.mmode)music.mmode=m0;return}PERF.want=null;/* (later: the race keeps its music) */music.setMode(m);if(music.style!=='off')music.ensure()}
/* Ultra low chosen before the songs/ folder answered: Songs once it does */
function perfSongs(){if(!PERF.wait||SONGS.ok==null)return;PERF.wait=0;if(!SONGS.ok)return;if(PERF.want==='pre')PERF.want='songs';else if(music.mmode==='pre'&&styleNow()==='ultra'){music.setMode('songs');music.ensure()}}
/* Scanlines and the vignette are drawn by the page over the picture, so on their own they cost nothing; any of the other
   screen effects needs the full-screen pass (on phones and tablets that pass skips multisampling, which is the slow part). */
const postOn=()=>g2('bloom')||g2('blur')||g2('aberr')||g2('grade')||g2('fxaa')||g2('grain');
const FPS={on:store.get('hoverline.fps')==='1',n:0,acc:0,ov:''};
(function(){const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',M=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:fs,depthTest:false,depthWrite:false});
  GFX.qs=new THREE.Scene();GFX.qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);GFX.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));GFX.quad.frustumCulled=false;GFX.qs.add(GFX.quad);
  GFX.bright=M('uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+0.35,l),1.);}',{t:{value:null},th:{value:0.76}});
  GFX.blur=M('uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 s=texture2D(t,vUv).rgb*0.227;s+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*0.316;s+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*0.070;gl_FragColor=vec4(s,1.);}',{t:{value:null},d:{value:new THREE.Vector2()}});
  GFX.copy=M('uniform sampler2D t;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(t,vUv).rgb,1.);}',{t:{value:null}});
  GFX.comp=M(`uniform sampler2D tB,tA,tC;uniform float bl,fx,ca,gli,vig,sat,grain,scan,aa,tm;uniform vec2 rs;varying vec2 vUv;
    float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
    void main(){vec2 c=vUv-0.5;vec3 col;
      if(fx>0.002){float k=fx*0.022;col=vec3(0.);for(int i=0;i<6;i++){float f=1.-k*float(i)/5.;col+=texture2D(tB,0.5+c*f).rgb;}col/=6.;}
      else col=texture2D(tB,vUv).rgb;
      if(gli>0.002){float b=floor(vUv.y*(14.+30.*fract(tm*2.3)));float h=fract(sin(b*91.7+floor(tm*30.)*13.1)*43758.5453);
        if(h<gli*0.45){float o=(fract(h*31.7)-0.5)*0.05*gli;vec2 u=vec2(vUv.x+o,vUv.y);col=vec3(texture2D(tB,u+vec2(0.006*gli,0.)).r,texture2D(tB,u).g,texture2D(tB,u-vec2(0.006*gli,0.)).b)+vec3(0.05,0.,0.08)*gli;}}
      if(aa>0.5){vec2 px=1./rs;vec3 n=texture2D(tB,vUv+vec2(0.,px.y)).rgb,s=texture2D(tB,vUv-vec2(0.,px.y)).rgb,e=texture2D(tB,vUv+vec2(px.x,0.)).rgb,w=texture2D(tB,vUv-vec2(px.x,0.)).rgb;
        float l0=lum(col),mx=max(l0,max(max(lum(n),lum(s)),max(lum(e),lum(w)))),mn=min(l0,min(min(lum(n),lum(s)),min(lum(e),lum(w))));col=mix(col,(n+s+e+w+col)/5.,smoothstep(0.05,0.3,mx-mn)*0.6);}
      if(ca>0.002){float a=ca*0.006;col.r=mix(col.r,texture2D(tB,0.5+c*(1.+a)).r,0.7);col.b=mix(col.b,texture2D(tB,0.5+c*(1.-a)).b,0.7);}
      col+=texture2D(tA,vUv).rgb*bl*0.85+texture2D(tC,vUv).rgb*bl*0.75;
      if(sat>1.001){float lu=lum(col);col=mix(vec3(lu),col,sat);col=(col-0.5)*1.06+0.5;}
      col=col/(1.+col*0.1);
      if(grain>0.){float g=fract(sin(dot(floor(vUv*rs)+tm*61.,vec2(12.9898,78.233)))*43758.5453);col+=(g-0.5)*0.07;}
      gl_FragColor=vec4(max(col,0.),1.);}`,{tB:{value:null},tA:{value:null},tC:{value:null},bl:{value:0.85},fx:{value:0},ca:{value:0},gli:{value:0},vig:{value:0.45},sat:{value:1},grain:{value:0},scan:{value:0},aa:{value:0},tm:{value:0},rs:{value:new THREE.Vector2(1,1)}})})();
function gfxSize(w,h){GFX.w=w;GFX.h=h;for(const k of['rt','b1','b2','b3','b4'])if(GFX[k])GFX[k].dispose();
  const opt={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false};
  GFX.rt=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget&&!touchCapable?new THREE.WebGLMultisampleRenderTarget(w,h,{format:THREE.RGBAFormat}):new THREE.WebGLRenderTarget(w,h,{format:THREE.RGBAFormat});
  const hw=Math.max(1,w>>1),hh=Math.max(1,h>>1),qw=Math.max(1,w>>2),qh=Math.max(1,h>>2);
  GFX.b1=new THREE.WebGLRenderTarget(hw,hh,opt);GFX.b2=new THREE.WebGLRenderTarget(hw,hh,opt);GFX.b3=new THREE.WebGLRenderTarget(qw,qh,opt);GFX.b4=new THREE.WebGLRenderTarget(qw,qh,opt)}
function gfxPass(mat,target){GFX.quad.material=mat;renderer.setRenderTarget(target);renderer.render(GFX.qs,GFX.qc)}
function gfxRender(sc,cam){const inf=renderer.info.render;if(!postOn()||!GFX.ok){renderer.render(sc,cam);GFX.calls=inf.calls;GFX.tris=inf.triangles;return}
  try{const dpr=renderer.getPixelRatio(),w=Math.max(2,Math.floor(cw*dpr)),h=Math.max(2,Math.floor(ch*dpr));if(w!==GFX.w||h!==GFX.h)gfxSize(w,h);
    renderer.setRenderTarget(GFX.rt);renderer.render(sc,cam);GFX.calls=inf.calls;GFX.tris=inf.triangles;const bloom=g2('bloom');
    if(bloom){GFX.bright.uniforms.t.value=GFX.rt.texture;gfxPass(GFX.bright,GFX.b1);
      const B=GFX.blur.uniforms;B.t.value=GFX.b1.texture;B.d.value.set(1/GFX.b1.width,0);gfxPass(GFX.blur,GFX.b2);B.t.value=GFX.b2.texture;B.d.value.set(0,1/GFX.b1.height);gfxPass(GFX.blur,GFX.b1);
      GFX.copy.uniforms.t.value=GFX.b1.texture;gfxPass(GFX.copy,GFX.b3);
      B.t.value=GFX.b3.texture;B.d.value.set(1.5/GFX.b3.width,0);gfxPass(GFX.blur,GFX.b4);B.t.value=GFX.b4.texture;B.d.value.set(0,1.5/GFX.b3.height);gfxPass(GFX.blur,GFX.b3)}
    const C=GFX.comp.uniforms;C.tB.value=GFX.rt.texture;C.tA.value=GFX.b1.texture;C.tC.value=GFX.b3.texture;C.bl.value=bloom?0.85:0;C.fx.value=g2('blur')?GFX.fx:0;C.ca.value=g2('aberr')?GFX.fx:0;C.gli.value=GFX.gl||0;
    C.vig.value=g2('vig')?0.45:0;C.sat.value=g2('grade')?1.18:1;C.grain.value=g2('grain')?1:0;C.scan.value=g2('scan')?1:0;C.aa.value=g2('fxaa')?1:0;C.tm.value=(performance.now()/1000)%100;C.rs.value.set(w,h);gfxPass(GFX.comp,null)}
  catch(e){GFX.ok=false;renderer.setRenderTarget(null);renderer.render(sc,cam)}}
function makeTex(draw,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
const roadTex=makeTex((g,w,h)=>{g.fillStyle='#14171d';g.fillRect(0,0,w,h);const r=rng(7);
  for(let i=0;i<1600;i++){const v=18+(r()*20|0);g.fillStyle=`rgb(${v},${v+2},${v+6})`;g.fillRect(r()*w,r()*h,2,2)}
  g.fillStyle='rgba(255,255,255,.10)';for(const x of[w/3,2*w/3])for(let y=0;y<h;y+=64)g.fillRect(x-1,y,2,30);
  g.fillStyle='rgba(255,176,0,.30)';g.fillRect(5,0,3,h);g.fillRect(w-8,0,3,h);},128,256);
const padTex=makeTex((g,w,h)=>{g.fillStyle='rgba(63,240,255,.12)';g.fillRect(0,0,w,h);g.strokeStyle='#3ff0ff';g.lineWidth=12;g.lineJoin='miter';
  for(let k=0;k<3;k++){const y=h*0.16+k*h*0.28;g.beginPath();g.moveTo(14,y+34);g.lineTo(w/2,y);g.lineTo(w-14,y+34);g.stroke()}},128,256);
/* Energy strips: chevrons that scroll along the strip. Green recharges shield, purple refills ammo. */
const stripTex=rgb=>makeTex((g,w,h)=>{g.fillStyle=`rgba(${rgb},.14)`;g.fillRect(0,0,w,h);g.fillStyle=`rgba(${rgb},.85)`;
  for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(10,y+26);g.lineTo(w/2,y+10);g.lineTo(w-10,y+26);g.lineTo(w-10,y+31);g.lineTo(w/2,y+15);g.lineTo(10,y+31);g.closePath();g.fill()}
  g.fillStyle=`rgba(${rgb},1)`;g.fillRect(0,0,4,h);g.fillRect(w-4,0,4,h)},64,128);
const greenTex=stripTex('70,255,140'),purpleTex=stripTex('190,90,255'),magTex=stripTex('63,240,255');
/* Trim markings (one per texture; forward is the top of the canvas): a green V says dive (the nose down, an arrow
   pointing down the screen), amber bars say level out, a grey Λ says lift the nose. Jump lips use the grey Λ too. */
const markTex=kind=>makeTex((g,w,h)=>{g.lineJoin='miter';g.lineCap='butt';
  if(kind==='level'){g.fillStyle='rgba(255,176,0,.92)';g.fillRect(6,h*0.12,w-12,h*0.26);g.fillRect(6,h*0.62,w-12,h*0.26);return}
  g.strokeStyle=kind==='dive'?'rgba(70,255,140,.92)':'rgba(205,214,224,.92)';g.lineWidth=h*0.26;g.beginPath();
  if(kind==='dive'){g.moveTo(14,h*0.1);g.lineTo(w/2,h*0.86);g.lineTo(w-14,h*0.1)}else{g.moveTo(14,h*0.9);g.lineTo(w/2,h*0.14);g.lineTo(w-14,h*0.9)}g.stroke()},256,128);
const diveTex=markTex('dive'),gripTex=markTex('grip');
const jumpTex=makeTex((g,w,h)=>{g.fillStyle='rgba(205,214,224,.12)';g.fillRect(0,0,w,h);g.strokeStyle='#cdd6e0';g.lineWidth=10;
  for(let k=0;k<3;k++){const y=h*0.2+k*h*0.27;g.beginPath();g.moveTo(12,y+30);g.lineTo(w/2,y);g.lineTo(w-12,y+30);g.stroke()}},128,256);
const checkTex=makeTex((g,w,h)=>{for(let x=0;x<16;x++)for(let y=0;y<3;y++){g.fillStyle=(x+y)%2?'#f2efe6':'#111';g.fillRect(x*10,y*10,10,10)}},160,30);

