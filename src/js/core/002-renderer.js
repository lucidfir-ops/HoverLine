//# core/002-renderer.js: the three.js renderer, scene and camera
/* ---------- renderer ---------- */
const canvas=$('c');
/* Resolution and Low detail (Graphics options; the Ultra low look sets both, Prototype 31): k is the share of the screen's
   pixels the game draws (the browser scales the picture up), low drops the ship shadows and thins the scenery. Neither
   touches the race, so times set with them count like any other. */
const RES={k:clamp(+(store.get('hoverline.res')||1)||1,0.1,1),low:store.get('hoverline.low')==='1'};
/* Frame rate cap (Prototype 35): 0 is no cap (the screen's own rate, whatever it is); otherwise frames are drawn no
   faster than v a second, on the screen's own beat. Ultra low caps at 30. Prototype 36: the lowest cap is 20 (a step
   is held to 50 ms, so at 15 the race ran at three quarters speed), and a capped frame may run to 1.5 times the cap's
   interval: a 20 cap on a 90 Hz screen alternates 44 and 56 ms frames, and the 50 ms hold ran that race at 94%. */
const FCAPS=[20,24,30,36,40,45,50,60,72,75,90,100,120,144,165,180,240,360,0];
const FCAP={v:Math.max(0,+(store.get('hoverline.fcap')||0)||0),due:0};if(FCAP.v>0&&FCAP.v<20){FCAP.v=20;store.set('hoverline.fcap','20')}
const resRatio=()=>Math.min(devicePixelRatio||1,2)*RES.k;
const renderer=new THREE.WebGLRenderer({canvas,antialias:(devicePixelRatio||1)<1.5&&RES.k>=1&&!RES.low,powerPreference:'high-performance'});
renderer.setPixelRatio(resRatio());
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x090b10);
scene.fog=new THREE.Fog(0x090b10,160,1100);
const camera=new THREE.PerspectiveCamera(72,1,0.3,3000);
const hemi=new THREE.HemisphereLight(0x9fb4d0,0x15120c,0.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,0.7);sun.position.set(300,500,200);scene.add(sun);
/* A soft light that rides with the camera, on for complex tracks so ships stay lit upside down in loops. */
scene.add(camera);const headL=new THREE.DirectionalLight(0xfff1d6,0.5),headT=new THREE.Object3D();headL.position.set(0,6,3);headT.position.set(0,0,-25);camera.add(headL);camera.add(headT);headL.target=headT;headL.visible=false;
let cw=0,ch=0,fitDirty=true;const fitRO=typeof ResizeObserver!=='undefined';
addEventListener('resize',()=>{fitDirty=true});if(fitRO)try{new ResizeObserver(()=>{fitDirty=true}).observe(canvas)}catch(e){}
function fit(){if(fitRO&&!fitDirty&&cw)return;fitDirty=false;const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;if(w!==cw||h!==ch){cw=w;ch=h;renderer.setPixelRatio(resRatio());renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}

