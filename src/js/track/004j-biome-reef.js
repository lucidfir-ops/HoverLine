//# track/004j-biome-reef.js: the Reef scenery (R): under the sea: rocks and coral, kelp, shoals of fish, jellyfish, bubble vents, sunlight from the surface by day
/* Prototype 61: the Reef builder (SCENERY.R, 004e), from what was its part of 004-track.js. ctx: see 004e. */
function sceneryReef(ctx){
  const{seed,minX,maxX,maxY,minZ,maxZ,cxT,czT,group,day,dens,er,lam,IM,lines,lnBio,near,free,claim,pylons,spireFrames,helixMiddles,falls,geysers,dome,buildTunnels,jel,kelp,fish,schools,floorY}=ctx;
const sb=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),day?lam(0x8c8066,0x0c0a06):lam(0x071216,0x010405));sb.rotation.x=-Math.PI/2;sb.position.set(cxT,floorY-0.2,czT);group.add(sb);
    /* by day the surface is overhead, bright where the sun comes through */
    if(day){const sf=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({color:0xaef0fa,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false}));sf.rotation.x=-Math.PI/2;sf.position.set(cxT,maxY+170,czT);group.add(sf)}
  pylons(()=>floorY);
  spireFrames();
  helixMiddles(({cx0,cz0,rt,top})=>{const h=top+50-floorY;return{x:cx0,y:floorY+h/2,z:cz0,sx:rt*0.6,sy:h,sz:rt*0.6,ry:er()*3,c:day?0x5a5646:0x101a1e}});
  falls();
  geysers();
  /* the reef (Prototype 31): rocks and coral on the sea bed, kelp that sways, shoals of fish swimming
       round, and jellyfish at every depth. By day the water is sunlit, with shafts of light from the surface; at night
       only the creatures and the coral glow. Nothing comes near the road. */
    const rock=[],coral=[],rays=[],nR=[14,26,40,60][dens];
    for(let t=0;t<1500&&rock.length<nR;t++){const x=minX-400+er()*(maxX-minX+800),z=minZ-400+er()*(maxZ-minZ+800),w=20+er()*60,d=20+er()*60,h=8+er()*40,R0=Math.hypot(w,d)/2;
      const nr=near(x,z,R0+W/2+40);if(nr&&nr.lo<floorY+h+40||!free(x,z,R0+8))continue;rock.push({x,y:floorY+h/2,z,sx:w,sy:h,sz:d,ry:er()*3,c:day?0x5a5646:0x101a1e});
      const nc=3+Math.floor(er()*6);for(let k=0;k<nc;k++){const a=er()*TAU,rr=R0*(0.3+er()*0.9),cx=x+Math.cos(a)*rr,cz=z+Math.sin(a)*rr,ch=4+er()*14,cw=2+er()*5,col=(day?[0xff6f61,0xffb347,0xff8fd0,0xb06cff,0x4fe0c0]:[0xff3fd0,0x3ff0ff,0xb05cff,0x46ff8c,0xffb000])[Math.floor(er()*5)];
        coral.push({x:cx,y:floorY+ch/2,z:cz,sx:cw,sy:ch,sz:cw,ry:er()*3,c:col});if(er()<0.6)coral.push({x:cx+(er()-.5)*cw*2,y:floorY+ch*0.8,z:cz+(er()-.5)*cw*2,sx:cw*1.6,sy:cw*0.6,sz:cw*1.6,ry:er()*3,c:col})}
      claim(x,z,R0)}
    IM(lam(0xffffff,day?0x080806:0x020506),rock);IM(day?lam(0xffffff,0x1a1010):new THREE.MeshBasicMaterial({color:0xffffff}),coral);if(!day)lines(rock.filter((o,k)=>k%2===0),lnBio);
    /* kelp: columns of blocks, swaying more towards the top, never up into a road */
    const nK=[30,60,100,150][dens];for(let t=0;t<3000&&kelp.length<nK*8;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+26)||!free(x,z,4))continue;
      const hN=near(x,z,60),room=(hN?hN.lo-22:maxY+100)-floorY;if(room<30)continue;const h=Math.min(room,40+er()*90),seg=h/8,ph=er()*TAU,w=0.5+er()*0.5,col=(day?[0x3f8f3a,0x5aa83f,0x2f7a4a]:[0x0e4a34,0x0b3a3a,0x1a5a2a])[Math.floor(er()*3)];
      for(let k=0;k<8;k++)kelp.push({x,z,y0:floorY,k,seg,ph,w,amp:(k/8)**1.5*h*0.09,sx:2.4-k*0.16,c:col})}
    /* shoals: fish circling a centre, each at its own spot in the shoal; well under (or over) any road they pass */
    const nSh=[3,5,8,12][dens];for(let q=0;q<nSh*4&&schools.length<nSh;q++){const cx=minX+er()*(maxX-minX),cz=minZ+er()*(maxZ-minZ),R0=50+er()*130,hN=near(cx,cz,R0+40);
      let y=hN?hN.lo-26-er()*20:floorY+20+er()*60;if(y<floorY+12){if(!hN)continue;y=hN.hi+26+er()*20}
      const n=22+Math.floor(er()*22),col=(day?[0xdfe8f0,0xffd84a,0x5ab0ff,0xff9a4a]:[0x5ff0ff,0xff5ad8,0xb98cff,0x46ff8c])[schools.length%4],si=schools.length;
      schools.push({cx,cz,y,R:R0,w:(0.1+er()*0.08)*(er()<0.5?-1:1),ph:er()*TAU});for(let k=0;k<n;k++)fish.push({si,off:er()*0.6,r:(er()-.5)*16,h:(er()-.5)*9,s:0.8+er()*0.5,c:col})}
    /* jellyfish at every depth (pale and few by day, neon at night) */
    const nJ=(day?[2,4,6,8]:[8,14,20,28])[dens];for(let t=0;t<1500&&jel.length<nJ*6;t++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600);if(near(x,z,W/2+34)||!free(x,z,8))continue;
      const y=floorY+14+er()*(maxY-floorY+60),c=day?[0xffd6ec,0xe8f4ff,0xd8c8ff][Math.floor(er()*3)]:[0xff5ad8,0x5ff0ff,0xb98cff,0x46ff8c][Math.floor(er()*4)],sz=4+er()*5,ph=er()*TAU,w=0.5+er()*0.5;
      jel.push({x,y,z,sx:sz,sy:sz*0.55,sz:sz,ry:er()*3,c,ph,w,dx:0,dz:0});for(let k=0;k<4;k++){const a=k*TAU/4+0.4;jel.push({x,y:y-sz*0.9,z,sx:0.25,sy:sz*1.3,sz:0.25,ry:0,c,ph,w,dx:Math.cos(a)*sz*0.3,dz:Math.sin(a)*sz*0.3,tent:1})}jel.push({x,y:y+sz*0.05,z,sx:sz*0.45,sy:sz*0.35,sz:sz*0.45,ry:0,c:0xffffff,ph,w,dx:0,dz:0})}
    /* shafts of sunlight from the surface */
    if(day){const nL=[8,14,20,28][dens];for(let k=0;k<nL;k++){const x=minX-300+er()*(maxX-minX+600),z=minZ-300+er()*(maxZ-minZ+600),top=maxY+170,L=top-floorY;rays.push({x,y:top-L/2,z,sx:6+er()*12,sy:L,sz:2+er()*3,ry:er()*3,c:0xffffff})}
      IM(new THREE.MeshBasicMaterial({color:0xd8fbff,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false}),rays)}
  const sc=document.createElement('canvas');sc.width=1024;sc.height=512;const g=sc.getContext('2d'),gr=g.createLinearGradient(0,0,0,512),rr=rng((seed^0x5EA)>>>0);
    for(const[f,c]of day?[[0,'#d4fbff'],[0.18,'#86dcee'],[0.42,'#33a4c4'],[0.5,'#1f86a6'],[0.62,'#145e7e'],[1,'#062238']]:[[0,'#0e3a4e'],[0.3,'#062330'],[0.5,'#01101a'],[1,'#000306']])gr.addColorStop(f,c);
    g.fillStyle=gr;g.fillRect(0,0,1024,512);
    if(day){const sx=0.407*1024,sg=g.createRadialGradient(sx,40,0,sx,40,150);sg.addColorStop(0,'rgba(255,255,240,.9)');sg.addColorStop(1,'rgba(255,255,240,0)');g.fillStyle=sg;g.fillRect(sx-160,0,320,200)}
    else for(let k=0;k<700;k++){g.fillStyle=['rgba(95,240,255,','rgba(255,90,216,','rgba(70,255,140,'][k%3]+(0.2+rr()*0.5)+')';g.fillRect(rr()*1024,rr()*512,1,1)}
    dome(sc)
  buildTunnels({TC:[0x0f2a33,0x03121a,0x3ff0ff]});
  ctx.gCol=[0xffffff,0x9ff6ff,0x3ff0ff];ctx.geyName='bubble vent';ctx.jelSoft=day;ctx.bubbles=true;}
