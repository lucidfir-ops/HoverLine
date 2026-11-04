# Sim-only speed-up: skips the HUD, camera and screen effects in step() when globalThis.__fast is set. Races stay
# deterministic under seedrand.js (the skipped parts only draw Math.random for camera shake and effects).
import sys
f=sys.argv[1];js=open(f).read()
def rep(a,b):
    global js
    assert js.count(a)==1,a[:60];js=js.replace(a,b)
rep("  if(S.state!=='menu'){\n    $('spd').textContent","  if(S.state!=='menu'&&!globalThis.__fast){\n    $('spd').textContent")
rep("trimStep(dt);inkStep(dt);drFxStep(dt);empFxStep(dt);","if(!globalThis.__fast){trimStep(dt);inkStep(dt);drFxStep(dt);empFxStep(dt);}")
rep("  // camera\n  if(S.state==='menu'){","  // camera\n  if(globalThis.__fast){}else if(S.state==='menu'){")
rep("  for(const r of racers){placeShip(r,S.t);if(r.isGhost||RES.low)r.shadow.visible=false}","  if(!globalThis.__fast||(S._pf=(S._pf|0)+1)%6===0)for(const r of racers){placeShip(r,S.t);if(r.isGhost||RES.low)r.shadow.visible=false}")
open(f,'w').write(js);print('fast ok')
