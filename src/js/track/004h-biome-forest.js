//# track/004h-biome-forest.js: the Forest scenery (F): giant cyber trees the road weaves between (one in every spiral), falls, geysers, tunnels
/* Prototype 61: the Forest builder (SCENERY.F, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryForest(ctx){
  const{N,ds,spl,minX,maxX,minY,minZ,maxZ,cxT,czT,group,day,dens,er,lam,IM,lines,near,free,claim,side,pylons,spireFrames,helixMiddles,falls,geysers,daySky,buildTunnels,floorY}=ctx;
const gm=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),lam(0x0a130c,0x020604));gm.rotation.x=-Math.PI/2;gm.position.set(cxT,floorY-0.3,czT);group.add(gm);const grid=new THREE.GridHelper(6000,120,0x1f5a32,0x0e2a17);grid.position.y=floorY;group.add(grid)
  pylons(()=>floorY);
  spireFrames([0x1c140e,0x070403]);
  /* forest trees: a tall square trunk with neon bands and a canopy of huge cubes, always well above any road under it */
  const trunks=[],plinths=[],bands=[],canopy=[];
  const tree=(x,z,tw,top)=>{const ry=er()*1.6;trunks.push({x,y:(floorY+top)/2,z,sx:tw,sy:top-floorY,sz:tw,ry});plinths.push({x,y:floorY+10,z,sx:tw*1.8,sy:20,sz:tw*1.8,ry});
    for(let y=floorY+45;y<top-30;y+=45)bands.push({x,y,z,sx:tw+0.7,sy:0.7,sz:tw+0.7,ry});
    const n=4+Math.floor(er()*4),cr=tw*1.4+26;for(let k=0;k<n;k++){const sz=44+er()*66,a=er()*TAU,rr=k?er()*cr:0;canopy.push({x:x+Math.cos(a)*rr,y:top-12+er()*46,z:z+Math.sin(a)*rr,sx:sz,sy:sz*(0.55+er()*0.3),sz,ry:er()*1.6})}};
  const treeTop=(x,z,reach)=>{const h=near(x,z,reach+120);return Math.max(floorY+300+er()*230,(h?h.hi:minY)+125)};
  helixMiddles(({cx0,cz0,rt,rc,top})=>{tree(cx0,cz0,Math.min(44,rt*0.5,rc/1.3),Math.max(top+170,floorY+320));});
  falls();
  geysers({ventC:0x1c2a1e});
  const step=[230,165,120,85][dens]/ds;let sd=1;
    for(let i=Math.floor(er()*step);i<N;i+=Math.max(6,Math.round(step*(0.7+er()*0.6)))){if(spl[i])continue;sd=er()<0.75?-sd:sd;const tw=16+er()*18,d=W/2+28+tw*0.71+er()*70,[x,z]=side(i,sd,d);
      if(near(x,z,W/2+24+tw*0.71)||!free(x,z,tw*0.8+26))continue;tree(x,z,tw,treeTop(x,z,tw*1.4+86));claim(x,z,tw*0.8)}
    const far=[12,26,42,64][dens];for(let a=0,n=0;a<900&&n<far;a++){const x=minX-500+er()*(maxX-minX+1000),z=minZ-500+er()*(maxZ-minZ+1000),tw=20+er()*26;if(near(x,z,W/2+90+tw)||!free(x,z,tw+40))continue;tree(x,z,tw,treeTop(x,z,tw*1.4+86));claim(x,z,tw);n++}
  if(day)daySky();
  if(trunks.length){IM(lam(0x1c140e,0x070403),trunks);IM(lam(0x16110c,0x050302),plinths);IM(new THREE.MeshBasicMaterial({color:0x46ff8c}),bands);IM(lam(0x12401f,0x04160a),canopy);lines(canopy,new THREE.LineBasicMaterial({color:0x2fd06a}));lines(trunks,new THREE.LineBasicMaterial({color:0x46ff8c}))}
  buildTunnels({grounded:true,shell:()=>({sideW:6,roof:8}),TC:[0x22180f,0x070402,0x46ff8c]});}
