//# net/087-name-tags.js: name tags over other pilots
/* ---- name tags over the other pilots ---- */
const tagBox=$('tags'),tagV=new THREE.Vector3();
function mpTags(clear){const pool=mpTags.pool||(mpTags.pool=new Map());
  if(!clear&&(!$('results').hidden||!$('pause').hidden)){for(const d of pool.values())d.hidden=true;return}
  if(clear){for(const d of pool.values())d.remove();pool.clear();return}
  for(const r of racers){if(!r.remote)continue;let d=pool.get(r.key);if(!d){d=document.createElement('div');d.className='tag';tagBox.append(d);pool.set(r.key,d)}
    d.textContent=r.name;d.style.borderColor=r.css;
    tagV.copy(r.ship.position).addScaledVector(camera.up,2.2).project(camera);
    const dist=r.ship.position.distanceTo(camera.position),show=!r.left&&r.wreck<=0&&tagV.z<1&&dist<420&&Math.abs(tagV.x)<1.1&&Math.abs(tagV.y)<1.1;
    d.hidden=!show;if(show){d.style.left=((tagV.x+1)/2*cw)+'px';d.style.top=((1-tagV.y)/2*ch)+'px';d.style.opacity=String(clamp(1.4-dist/300,0.35,1))}}}

