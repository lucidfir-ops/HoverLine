//# track/004i-biome-stratos.js: the Stratos scenery (N): high above everything: floating slabs, stars above and below by night, clouds above and below by day
/* Prototype 61: the Stratos builder (SCENERY.N, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryStratos(ctx){
  const{minX,maxX,minY,maxY,minZ,maxZ,day,dens,er,lam,IM,lines,lnA,near,free,claim,spireFrames,helixMiddles,falls,geysers,daySky,starSky,buildTunnels}=ctx;
  spireFrames(null,f=>f.bot-90);
  helixMiddles();
  falls({hang:true});
  geysers({hang:true,vent:(x,z,base)=>({x,y:base-3,z,sx:28,sy:6,sz:28,ry:er()*3,c:0x101218})});
  const slabs=[];
  /* Stratos: floating slabs so speed reads (the stars all the way round are drawn with the sky, below) */
    const nS=[10,22,36,56][dens];for(let t=0;t<1500&&slabs.length<nS;t++){const x=minX-500+er()*(maxX-minX+1000),z=minZ-500+er()*(maxZ-minZ+1000),w=6+er()*18,dd=6+er()*18,h=40+er()*150,y=minY-260+er()*(maxY-minY+420),R0=Math.hypot(w,dd)/2;
      const nr=near(x,z,R0+W/2+60);if(nr&&nr.hi>y-h/2-45&&nr.lo<y+h/2+45)continue;if(!free(x,z,R0+10))continue;slabs.push({x,y,z,sx:w,sy:h,sz:dd,ry:er()*3,c:0xffffff});claim(x,z,R0)}
    IM(day?lam(0x3a4352,0x0a0d12):lam(0x0b0d14,0x020306),slabs);lines(slabs.filter((o,k)=>k%3===0),lnA);lines(slabs.filter((o,k)=>k%3===1),new THREE.LineBasicMaterial({color:0x3ff0ff}));lines(slabs.filter((o,k)=>k%3===2),new THREE.LineBasicMaterial({color:0xb05cff}))
  if(day)daySky({below:true});else starSky();
  buildTunnels({TC:[0x0c0e16,0x020308,0x3ff0ff]});
  ctx.gCol=[0xffffff,0x9ff6ff,0x3ff0ff];}
