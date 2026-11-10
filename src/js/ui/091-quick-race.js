//# ui/091-quick-race.js: the quick races (first-time players)
/* ---------- quick race (Prototype 40) ----------
   A new player's first minutes: "Tap to race" over the first track, then five short races that open the game a part at a
   time. Each is 2 laps of a hand-built Wide track (about a minute) against 5 AI at the career's Rookie pace and easing:
   1 steering only (boost pads on the road, no module fire from anyone), 2 one module button and purple strips, 3 the boost
   button and green strips, 4 a split and a second module on the same button, 5 the nose and the brake for drifting (Prototype 51; until then the AI's own choice
   of pitch flies it). You always move on, and the end screen also has Rematch. Phones steer with the slider, and by tilt too
   where the sensor reaches the page (Prototype 48; tablets use the slider only). Quick
   races stay off the boards, best laps, ghosts, the career and the profile, and don't touch hoverline.code or lastmode;
   their logs say mode 'quick' and the step. Everything here runs only while QK.live: with it off the game is as before.
   Who gets it: anyone with "Start with a quick race" on (hoverline.quick), and a browser with nothing saved (qkFresh). */
const QK_N=5,QK_T=[null,
 {"seed":10096641,"bio":["U",[2,1,0,1]],"segs":[[95.515],[50.633,145.0,60.0],[30.0],[-50.77,150.0,60.0],[30.0],[107.246,140.0,60.0],[68.715],[100.749,140.0,60.0],[111.303],[-53.422,150.0,60.0],[57.79],[111.58,138.0,60.0],[203.171],[93.983,145.0,60.0],[35.515]],"y":[],"pads":[[868.9,0,3,34],[1971.8,[-4,0,4],3,34]],"am":[],"hp":null,"split":0,"lean":255.8},
 {"seed":10100738,"bio":["U",[3,0,1,0]],"segs":[[188.386],[-89.25,140.0,60.0],[30.0],[-59.825,150.0,60.0],[30.0],[32.732,170.0,60.0],[30.0],[-115.837,140.0,60.0],[51.331],[-29.775,280.0,70.0],[133.265],[-98.045,140.0,60.0],[118.386]],"y":[],"pads":[[1984.8,0,2,36]],"am":[[50,170,0],[1553.4,1666.7,"L"]],"hp":null,"split":0},
 {"seed":10104835,"bio":["U",[2,1,0,2]],"segs":[[184.618],[98.002,140.0,60.0],[30.0],[-23.918,150.0,60.0],[30.0],[120.359,140.0,60.0],[438.797],[86.548,140.0,60.0],[114.842],[79.01,140.0,60.0],[184.618]],"y":[],"pads":[[484.1,0,1,36]],"am":[[50,170,0],[1883.9,2035.7,"R"]],"hp":[1473.2,1649.6],"split":0,"straight":1020.8},
 {"seed":10108930,"bio":["F",[2,0,0,0]],"segs":[[127.879],[98.655,140.0,60.0],[30.0],[-32.335,150.0,60.0],[30.0],[99.368,140.0,60.0],[54.329],[117.878,330.0,80.0],[68.216],[76.434,140.0,60.0],[87.879]],"y":[],"pads":[],"am":[[50,170,0],[603.6,785.0,"L"]],"hp":[1854.9,2126.1],"split":1},
 {"seed":10113029,"bio":["U",[3,2,0,0]],"segs":[[113.831],[-90.157,140.0,60.0],[309.86],[-101.708,140.0,60.0],[30.0],[23.468,160.0,60.0],[30.0],[-106.564,140.0,60.0],[310.565],[-85.039,140.0,60.0],[93.831]],"y":[[394.1,704.0,-30],[1518.4,1829.0,30]],"pads":[[1012.5,0,2,36]],"am":[[50,170,0],[1080.2,1198.0,"R"]],"hp":[1882.5,2162.5],"split":0}];
const QK=(()=>{let o=null;try{o=JSON.parse(store.get('hoverline.quick')||'null')}catch(e){}o=o&&typeof o==='object'?o:null;const arr=a=>Array.isArray(a)?a.slice(0,QK_N).map(x=>x|0):[];
  return{live:false,on:o?o.on!==false:null,next:o?clamp((o.next|0)||1,1,QK_N+1):1,rot:o?clamp(o.rot|0,0,QK_N-1):0,best:o?arr(o.best):[],tries:o?arr(o.tries):[],runs:o?o.runs|0:0,
    cur:1,lvl:1,post:false,home:null,own:null,pend:null,tips:[],tip:null,tipT:0,slot:0,holdK:-1,place:0,hold:null,hud:0}})();
const qkSave=()=>store.set('hoverline.quick',JSON.stringify({v:40,on:QK.on!==false,next:QK.next,rot:QK.rot,best:QK.best,tries:QK.tries,runs:QK.runs}));
/* "Nothing saved": no hoverline.* key except the ones the game writes by itself on a first visit, before anyone touches
   anything: def39, ultra32, ultra34, ultra35 and bioR (one-off moves of old settings), cam while it is the default view,
   code (the track the title flies over), mhist (the music's memory of recent tunes), padkind (a pad was seen), autoUltra,
   and quick itself; and, where the software-drawing check picked Ultra low on its own (autoUltra 'soft'), the style, res,
   low, fcap and mmode it wrote. Anything else (a volume, a control or music setting, a log, a best lap, a ghost, a career,
   the tutorial seen, a name) means someone has played here. Storage that can't be read counts as nothing saved. */
const QK_AUTO=['def39','ultra32','ultra34','ultra35','bioR','code','mhist','padkind','autoUltra','quick','orient'],QK_SOFT=['style','res','low','fcap','mmode'];
function qkFresh(){try{const ls=localStorage,soft=ls.getItem('hoverline.autoUltra')==='soft';
    for(let i=0;i<ls.length;i++){const k=ls.key(i);if(!k||!k.startsWith('hoverline.'))continue;const s=k.slice(10);
      if(QK_AUTO.includes(s)||s==='cam'&&ls.getItem(k)==='1'||soft&&QK_SOFT.includes(s))continue;return false}}catch(e){}return true}
const qkOn=()=>QK.on==null?qkFresh():QK.on;
/* the quick frame: a Blade with every stat at 3, Missile and Cannon (the career's first two modules), in your own paint */
const qkBuild=()=>({...defaultBuild(),paint:(QK.own||build).paint|0,liv:(QK.own||build).liv||null});
const qkSpec=n=>{const o={};for(const k of FK)o[k]=0;if(QK_T[n].split)o.split=1;return{b:1,n:o,quick:n}};
const qkBio=n=>({k:QK_T[n].bio[0],d:QK_T[n].bio[1].slice()});
/* the centre line: straights and bends eased in and out (sin² curvature ramps), a point every 20 m; heights are cosine
   ramps along the lap. Built from tools in the design notes; the bend lists close the lap to a few centimetres. */
function qkPts(n){const q=QK_T[n],pts=[],K=[];let s=0;
  for(const g of q.segs){if(g.length===1){K.push([s,s+g[0],null]);s+=g[0];continue}
    const k=Math.sign(g[0])/g[1],e=g[2],Lh=Math.abs(g[0])*Math.PI/180*g[1]-e,L=Lh+2*e;K.push([s,s+L,t=>t<e?k*Math.sin(Math.PI/2*t/e)**2:t>e+Lh?k*Math.sin(Math.PI/2*(L-t)/e)**2:k]);s+=L}
  const DS=0.5,m=Math.round(s/DS),hy=u=>{let h=0;for(const[a,b,d]of q.y||[])h+=d*(0.5-0.5*Math.cos(Math.PI*clamp((u-a)/(b-a),0,1)));return h};
  let x=0,z=0,th=0,j=0;for(let i=0;i<m;i++){if(i%40===0)pts.push(new THREE.Vector3(x,hy(i*DS),z));const u=(i+0.5)*DS;while(j<K.length-1&&u>K[j][1])j++;
    const f=K[j][2],k=f?f(u-K[j][0]):0,tm=th+k*DS/2;x+=Math.cos(tm)*DS;z+=Math.sin(tm)*DS;th+=k*DS}
  return pts}
/* the last of the green strips decides where splits must end (gI0 in buildTrack) */
const qkG0=(n,N,ds)=>{const h=QK_T[n].hp;return Math.floor((h?h[0]:N*ds-60)/ds)};

