//# track/004d-road-query.js: where the road is at a distance along it (sampleAt, idxAt) and the surface under a racer (surf: the main road or a split's route)
const sm={p:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3(),t:new THREE.Vector3(),h:0};
function sampleAt(u,o=sm){const{L,N,ds,P,R,U,Tg,H}=T;const f=(((u%L)+L)%L)/ds;const i=Math.floor(f)%N,j=(i+1)%N,a=f-Math.floor(f);
  if(T.brk&&T.brk[i])return portalSample(o,i,j,a);/* (Prototype 63: never between a portal's entrance and exit) */
  o.p.lerpVectors(P[i],P[j],a);o.r.lerpVectors(R[i],R[j],a).normalize();o.u.lerpVectors(U[i],U[j],a).normalize();o.t.lerpVectors(Tg[i],Tg[j],a).normalize();o.h=H[i]+wrapA(H[j]-H[i])*a;return o}
const idxAt=u=>Math.floor((((u%T.L)+T.L)%T.L)/T.ds)%T.N;
/* Where the road is at distance u and lateral position lat. Outside a split: the main road (height 0, walls at ±W/2).
   Inside: the route you are on (a racer keeps the route it chose at the fork; anything else takes the nearer one). */
const SF={h:0,sl:0,kv:0,yb:0,lo:0,hi:0,c:0,sp:null,b:-1};
function surf(u,lat,r,ro){const k=T.spl[idxAt(u)];SF.h=SF.sl=SF.kv=SF.yb=SF.c=0;SF.g=1;SF.lo=-W/2;SF.hi=W/2;SF.sp=null;SF.b=-1;
  if(!k){if(r&&r.brS){r.brS=null;r.br=null}return SF}
  const SP=T.splits[k-1],uu=((u%T.L)+T.L)%T.L,f=clamp((uu-SP.u0)/T.ds,0,SP.n),j=Math.min(SP.n-1,Math.floor(f)),a=f-j,near=()=>{let bi=0,bd=1e9;SP.b.forEach((B,i)=>{const c=B.c[j]+(B.c[j+1]-B.c[j])*a,w=B.w[j]+(B.w[j+1]-B.w[j])*a,d=Math.abs(lat-c)-w;if(d<bd){bd=d;bi=i}});return bi};
  const ad=!!(SP.adj&&(SP.adj[j]||SP.adj[j+1]));
  let b;if(SP.kind==='stack'){b=r&&(r.isGhost||r.proxy)?(r.stkUp?SP.upB:SP.lowB):r&&ro?(r.brS===SP&&r.br!=null?r.br:SP.lowB):r?(r.stkS===SP?r.stkB:SP.lowB):near();if(r&&!ro){r.brS=SP;r.br=b}}
  else if(r&&ro)b=r.brS===SP&&r.br!=null?r.br:near();else if(r){if(r.brS!==SP){r.brS=SP;r.br=near()}else if(ad&&r.u!=null&&Math.abs(wrapU(u-r.u))<4)r.br=near();b=r.br}else b=near();
  const B=SP.b[b],L=A=>A[j]+(A[j+1]-A[j])*a,c=L(B.c),w=L(B.w);SF.h=L(B.h);SF.sl=L(B.sl);SF.kv=L(B.kv);SF.yb=-Math.atan(L(B.dc));SF.lo=c-w;SF.hi=c+w;SF.c=c;SF.sp=SP;SF.b=b;if(B.g)SF.g=L(B.g);
  if(ad&&SP.b.length===2){const O=SP.b[1-b],oc=L(O.c),ow=L(O.w);SF.lo=Math.min(SF.lo,oc-ow);SF.hi=Math.max(SF.hi,oc+ow)}return SF}
const clampLat=(u,lat,m,o)=>{const f=surf(u,lat,o);return clamp(lat,f.lo+m,f.hi-m)};
const wrapU=d=>{const L=T.L;d=((d%L)+L)%L;return d>L/2?d-L:d};

