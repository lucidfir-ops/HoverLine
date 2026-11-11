//# track/004g-biome-ocean.js: the Ocean scenery (O): the sea: a flat sea 24 m under the road, sandy islands, lighthouses, whitecaps, and by night jellyfish and mantas
/* Prototype 61: the Ocean builder (SCENERY.O, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryOcean(ctx){
  ctx.floorY=ctx.minY-24;
  const{minX,maxX,minZ,maxZ,cxT,czT,group,day,dens,er,lam,IM,lines,lnA,near,free,claim,pylons,spireFrames,helixMiddles,falls,geysers,daySky,starSky,buildTunnels,caps,jel,mantas,floorY}=ctx;
  const water=new THREE.Mesh(new THREE.PlaneGeometry(16000,16000),day?lam(0x0f4f78,0x052036):Object.assign(lam(0x04121e,0x010710),{transparent:true,opacity:0.6}));water.rotation.x=-Math.PI/2;water.position.set(cxT,floorY,czT);group.add(water);ctx.water=water;
  pylons(()=>floorY,null,lam(0x18232c));
  spireFrames([0xd9dde2,0x1a2026]);
  helixMiddles(({cx0,cz0,rt,top})=>{const g=new THREE.CylinderGeometry(rt*0.85,rt*0.95,5,24),m=new THREE.Mesh(g,lam(0xd6c28a,0x1a160c));m.position.set(cx0,floorY+2.5,cz0);group.add(m);
      return{x:cx0,y:floorY+5+(top+40-floorY)/2,z:cz0,sx:10,sy:top+40-floorY,sz:10,c:0xe4e0d6}});
  falls({poolC:0xe8f8ff});
  geysers({vent:(x,z)=>({x,y:floorY+0.1,z,sx:18,sy:0.2,sz:18,ry:er()*3,c:0xe8f8ff}),ventE:0x5a6a70,flat:true});
  const isl=[],shoal=[],lights=[],lamps=[];
  const nI=[3,6,10,16][dens];
    for(let t=0;t<900&&shoal.length<nI;t++){const x=minX-450+er()*(maxX-minX+900),z=minZ-450+er()*(maxZ-minZ+900),w=50+er()*170,d=w*(0.5+er()*0.6),ry=er()*3,R0=Math.hypot(w,d)/2;if(!free(x,z,R0+30))continue;
      isl.push({x,y:floorY+1.6,z,sx:w,sy:3.2,sz:d,ry,c:0xd6c28a});if(w>80)isl.push({x:x+(er()-.5)*w*0.2,y:floorY+4.4,z:z+(er()-.5)*d*0.2,sx:w*0.55,sy:2.6,sz:d*0.5,ry,c:0xc8b27a});if(w>150)isl.push({x,y:floorY+6.8,z,sx:w*0.22,sy:2.4,sz:d*0.2,ry,c:0xbfa66c});
      shoal.push({x,y:floorY+0.06,z,sx:w+36,sy:0.12,sz:d+36,ry,c:day?0x1d8fa0:0x0a5560});
      if(w>130&&er()<0.6){const lx=x+(er()-.5)*w*0.3,lz=z+(er()-.5)*d*0.3;if(!near(lx,lz,W/2+40)){lights.push({x:lx,y:floorY+23,z:lz,sx:6,sy:40,sz:6,c:0xe4e0d6});lamps.push({x:lx,y:floorY+44.5,z:lz,sx:7,sy:3,sz:7,c:0xffb000})}}
      claim(x,z,R0)}
    IM(lam(0xffffff,0x1a160c),isl);IM(new THREE.MeshBasicMaterial({color:0xffffff}),shoal);IM(lam(0xffffff,0x202020),lights);IM(new THREE.MeshBasicMaterial({color:0xffffff}),lamps);lines(lights,lnA);
    /* whitecaps: short white bars that swell and fade, all lined up with the wind */
    const nC=[800,1300,1800,2300][dens],wa=er()*TAU;for(let t=0;t<nC*3&&caps.length<nC;t++){const x=minX-800+er()*(maxX-minX+1600),z=minZ-800+er()*(maxZ-minZ+1600);if(!free(x,z,6))continue;caps.push({x,z,sx:5+er()*12,sz:0.9+er()*1.2,ry:wa+(er()-.5)*0.5,ph:er()*10,per:3+er()*3.5})}
    /* at night, things that glow under the sea: jellyfish that drift and pulse, and a few manta rays gliding in slow circles */
    if(!day){const nJ=[6,10,14,20][dens];for(let t=0;t<900&&jel.length<nJ*6;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+30)||!free(x,z,8))continue;
        const y=floorY-2-er()*4,c=[0xff5ad8,0x5ff0ff,0xb98cff][Math.floor(er()*3)],sz=4+er()*4,ph=er()*TAU,w=0.5+er()*0.5;
        jel.push({x,y,z,sx:sz,sy:sz*0.55,sz:sz,ry:er()*3,c,ph,w,dx:0,dz:0});for(let k=0;k<4;k++){const a=k*TAU/4+0.4;jel.push({x,y:y-sz*0.9,z,sx:0.25,sy:sz*1.3,sz:0.25,ry:0,c,ph,w,dx:Math.cos(a)*sz*0.3,dz:Math.sin(a)*sz*0.3,tent:1})}jel.push({x,y:y+sz*0.05,z,sx:sz*0.45,sy:sz*0.35,sz:sz*0.45,ry:0,c:0xffffff,ph,w,dx:0,dz:0})}
      for(let k=0;k<[1,2,3,4][dens];k++){const cx=minX+er()*(maxX-minX),cz=minZ+er()*(maxZ-minZ),R0=60+er()*120;mantas.push({cx,cz,R:R0,y:floorY-3-er()*3,ph:er()*TAU,w:(0.05+er()*0.05)*(er()<0.5?-1:1),s:10+er()*8})}}
  if(day)daySky();else starSky({sea:true});
  buildTunnels({TC:[0xd9dde2,0x1a2026,0x9fe8ff]});
  ctx.gCol=[0xffffff,0xd8f4ff,0x9fdcff];}
