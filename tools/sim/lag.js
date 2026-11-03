// How late a pilot steers: the delay (s) at which the steering in a set of race logs best matches the steering the road
// needs there (curvature x speed / turn rate), from the 4 Hz samples, the peak found between samples with a parabola.
// Positive means the steering comes after the road asks for it. Used by eric.js calibrate and the analysis.
const {trackOf}=require('./trackfeat.js');const cache={};
module.exports=function lagOf(H,logs){const sums={};
  for(const l of logs){if(!l||!l.s||!l.track)continue;let C=cache[l.track.code];
    if(!C){const T=trackOf(H,l.track.code);C=cache[l.track.code]={Cs:Float32Array.from(T.Cs),spl:Uint8Array.from(T.spl),L:T.L,ds:T.ds,N:T.N}}
    const ci=Object.fromEntries(l.cols.map((k,i)=>[k,i])),F=H.FRAMES[l.ship.frame]||H.FRAMES.blade,Dt=(1+0.18*(l.ship.stats.handling-3))*F.m.turn;
    const n=l.s.length,st=new Float64Array(n),ff=new Float64Array(n),ok=new Uint8Array(n);
    l.s.forEach((s,i)=>{const u=s[ci.u],v=s[ci.v],p=s[ci.pitch]||0;if(u==null)return;const k=Math.floor((((u%C.L)+C.L)%C.L)/C.ds)%C.N;
      const turn=(1.85-0.55*v/H.VMAX)*Dt*(1+0.8*Math.max(0,p)-0.15*Math.max(0,-p));st[i]=s[ci.steer];ff[i]=-C.Cs[k]*v/turn;ok[i]=s[ci.t]>3&&v>40&&!s[ci.air]&&!C.spl[k]?1:0});
    for(let sh=-4;sh<=4;sh++){const a=sums[sh]||(sums[sh]={n:0,x:0,y:0,xx:0,yy:0,xy:0});for(let i=0;i<n;i++){const j=i+sh;if(j<0||j>=n||!ok[i]||!ok[j])continue;const x=st[i],y=ff[j];a.n++;a.x+=x;a.y+=y;a.xx+=x*x;a.yy+=y*y;a.xy+=x*y}}}
  const cor=a=>{if(!a||a.n<50)return null;const cx=a.xx/a.n-(a.x/a.n)**2,cy=a.yy/a.n-(a.y/a.n)**2;return(a.xy/a.n-a.x*a.y/a.n/a.n)/Math.sqrt(cx*cy)};
  const r=[];for(let sh=-4;sh<=4;sh++)r.push(cor(sums[sh]));if(r.some(x=>x==null))return null;
  let k=0;for(let i=1;i<r.length;i++)if(r[i]>r[k])k=i;let off=0;if(k>0&&k<r.length-1){const d=r[k-1]-2*r[k]+r[k+1];if(d<0)off=0.5*(r[k-1]-r[k+1])/d}
  return +(-((k-4)+off)*0.25).toFixed(3)};
