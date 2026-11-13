//# track/005-maps.js: the minimap
/* ---------- maps ---------- */
function mapper(c,pad){const b=T.bounds,w=c.width,h=c.height;const s=Math.min((w-2*pad)/(b.maxX-b.minX),(h-2*pad)/(b.maxZ-b.minZ));
  const ox=(w-(b.maxX-b.minX)*s)/2,oz=(h-(b.maxZ-b.minZ)*s)/2;return(x,z)=>[ox+(x-b.minX)*s,oz+(z-b.minZ)*s]}
/* The course on a 2D map: the main road (with breaks where a split runs beside it) and both routes of every split. */
function drawPath(g,m,lw,color){g.beginPath();let pen=false;
  for(let i=0;i<=T.N;i+=2){const k=i%T.N;if(T.spl[k]&&T.spl[(k+2)%T.N]){pen=false;continue}const p=T.P[k],q=m(p.x,p.z);pen?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);pen=true;
    /* Prototype 63: a portal: the road ends at the entrance and starts again at the exit (joined by a dashed line, below) */
    if(T.brk&&(T.brk[k]||T.brk[(k+1)%T.N])){const o=T.portK[T.brk[k]?k:(k+1)%T.N],e=m(o.E.x,o.E.z);g.lineTo(e[0],e[1]);pen=false;if(T.brk[k])i--}}
  if(!T.splits.length)g.closePath();
  for(const S0 of T.splits)for(const B of S0.b){for(let k=0;k<=S0.n;k+=2){const i=S0.i0+k,p=T.P[i],rr=T.R[i],q=m(p.x+rr.x*B.c[k],p.z+rr.z*B.c[k]);k?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}}
  g.lineWidth=lw;g.strokeStyle=color;g.lineJoin='round';g.stroke();
  if(T.port){g.save();g.setLineDash([lw*1.6,lw*1.6]);g.beginPath();for(const o of T.port){const a=m(o.E.x,o.E.z),b=m(o.X.x,o.X.z);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])}g.lineWidth=Math.max(1,lw*0.6);g.stroke();g.restore()}}
function drawZone(g,m,z,lw){g.beginPath();for(let u=z.u0;u<=z.u1+0.1;u+=6){const uu=Math.min(u,z.u1),S0=sampleAt(uu),lt=z.laneF?z.laneF(uu):0,q=m(S0.p.x+S0.r.x*lt,S0.p.z+S0.r.z*lt);u===z.u0?g.moveTo(q[0],q[1]):g.lineTo(q[0],q[1])}
  g.strokeStyle=z.kind==='hp'?'#46ff8c':'#be5aff';g.lineWidth=lw;g.lineCap='round';g.stroke()}
