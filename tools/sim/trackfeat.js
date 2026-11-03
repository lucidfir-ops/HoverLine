// Track shape around each 4 Hz sample of a race log, for fitting and analysing a pilot (fit_eric.js, eric/analyse.py).
// feats(H, log) rebuilds the log's track from its code and returns, per sample, the road there and ahead of it.
const AHEAD=[0,10,20,30,40,50,60,70,80,90,100,120,140,160,200];
function trackOf(H,code){const c=H.parseCode(code);if(!c)return null;H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm);return H.getT()}
function feats(H,L,opt={}){
  const T=opt.T||trackOf(H,L.track.code);if(!T)return null;const W=H.getW(),ci=Object.fromEntries(L.cols.map((k,i)=>[k,i]));
  const idx=u=>H.idxAt(u),out=[];
  for(const s of L.s){const ut=s[ci.u];if(ut==null)continue;const uu=H.modU(ut),lat=s[ci.lat];
    const f=H.surf(uu,lat,null),lo=f.lo,hi=f.hi,sp=!!f.sp,cen=sp?f.c:0;
    const cs=AHEAD.map(d=>+T.Cs[idx(uu+d)].toFixed(5));
    const gy=[0,12,30,60].map(d=>+T.Tg[idx(uu+d)].y.toFixed(4));
    const v=s[ci.v]||0;let knMin=0;for(let d=0;d<=Math.max(20,v*0.5);d+=4)knMin=Math.min(knMin,T.Kn[idx(uu+d)]);
    let jumpD=null;for(const j of T.jumps){const d=H.modU(j.u0-uu);if(d<400&&(jumpD==null||d<jumpD))jumpD=Math.round(d)}
    let zone=null;for(const z of T.zones)if(uu>=z.u0&&uu<=z.u1){zone=z.kind;break}
    out.push({uu:+uu.toFixed(1),W,lo:+lo.toFixed(2),hi:+hi.toFixed(2),sp,cen:+cen.toFixed(2),cs,k:+T.K[idx(uu)].toFixed(5),gy,kn:+T.Kn[idx(uu)].toFixed(5),knMin:+knMin.toFixed(5),jumpD,zone,wallH:+T.wallH[idx(uu)].toFixed(2),gap:!!T.gap[idx(uu)]})}
  return{AHEAD,W,L:T.L,N:T.N,f:out}}
/* the line seen in a set of logs: per width, the median share of the half width he is inside of (wall to centre, + inside)
   in bins of the curvature d m ahead (CE edges), main road only, on the road and over 40 m/s */
const CE=[0.001,0.002,0.003,0.004,0.005,0.0065,0.008,0.01,0.013,0.02];
function lineObs(H,logs,d=30){const di=AHEAD.indexOf(d),bins={W:CE.map(()=>[]),S:CE.map(()=>[]),N:CE.map(()=>[])};let last=null,T=null;
  for(const l of [...logs].sort((a,b)=>a.track.code<b.track.code?-1:1)){if(l.track.code!==last){T=trackOf(H,l.track.code);last=l.track.code}const F=feats(H,l,{T}),wk=l.track.code[0],ci=Object.fromEntries(l.cols.map((k,i)=>[k,i]));
    l.s.forEach((s,i)=>{const f=F.f[i];if(!f||s[ci.t]<=3||s[ci.v]<=40||s[ci.air]||f.sp)return;const c=f.cs[di],lim=(f.hi-f.lo)/2-1.35,mid=(f.hi+f.lo)/2,b=CE.findIndex(e=>Math.abs(c)<e);if(b>=0&&bins[wk])bins[wk][b].push(-Math.sign(c)*(s[ci.lat]-mid)/lim)})}
  const med=a=>{const b=[...a].sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2};
  const out={};for(const wk in bins)out[wk]=bins[wk].map(b=>b.length>=30?+med(b).toFixed(3):null);return out}
module.exports={feats,trackOf,AHEAD,CE,lineObs};
