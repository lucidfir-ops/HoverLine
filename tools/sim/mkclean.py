# Prototype 64: mkclean.py PILOT.json OUT.json: the pilot's clean self, made the Prototype 58 way (the recipe that made
# eric_p59_clean.json): wander x0.4, nose up 45% of the way to always in corners and climbs, down 31% more on descents,
# every shield strip and 95% of ammo strips, every incoming shot answered.
import json,sys
p=json.load(open(sys.argv[1]))
for wk in p['steer']:p['steer'][wk]['sigma']=round(p['steer'][wk]['sigma']*0.4,4)
for wk in p['pitch']:
    for s in('tight','corner','uphill'):
        c=p['pitch'][wk][s];c['up']=round(c['up']+0.45*(1-c['up']),5)
    c=p['pitch'][wk]['downhill'];c['down']=round(c['down']+0.31*(1-c['down']),5)
p['strip']={'hp':1.0,'ammo':0.95};p['react']=1.0
json.dump(p,open(sys.argv[2],'w'),indent=1)
