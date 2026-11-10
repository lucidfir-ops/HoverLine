// Prototype 60: every frame's top speed by its Speed stat (m/s at Redline), and with held boost (x1.22) and a pad (x1.32).
const H=require(__dirname+'/hl.js')();
const out={};for(const fr of Object.keys(H.FRAMES).filter(k=>k!=='cube')){out[fr]=[];
  for(let s=1;s<=5;s++){const r=H.racers[1];H.setShip(r,{stats:{speed:s,thrust:3,handling:3,shield:3,ammo:3},weapons:['missile','rockets'],frame:fr},{body:0xcccccc,stripe:0xffb000});
    out[fr].push([s,Math.round(r.d.vmax),Math.round(r.d.vmax*1.22),Math.round(r.d.vmax*1.32)])}}
for(const fr in out)console.log(fr.padEnd(7),out[fr].map(x=>x.join('/')).join('  '));
process.exit(0);
