# Builds sim/game.js from hoverline.html: exports internals, AI drives the player, counts weapon fire / wrecks / falls.
import os
HERE=os.path.dirname(os.path.abspath(__file__))
s=open(os.environ.get('SRC',os.path.join(HERE,'..','..','src','hoverline.html'))).read();k=s.rfind('<script>');l=s.rfind('</script>');js=s[k+8:l]
def rep(a,b):
    global js
    assert js.count(a)==1,a[:80];js=js.replace(a,b)
rep("loadTrack(seed);\ntuneUI();buildSummary();\nrequestAnimationFrame(frame);","globalThis.__hl={racers,S,startRace,step,loadTrack,getT:()=>T,ranking,shots,player,physics,aiInput,fire,leaderFor,parseCode,roster,ROSTER,FRAMES,setShip,getW:()=>W,VMAX,surf,wrapU,code:()=>{try{return roadStr()}catch(e){return null}}};")
rep("const i=(r===player&&player.finishT==null&&!auto)?(player.autoT>0?apInput(r,inp,sdt):inp):aiInput(r,sdt);physics(r,i,sdt)","let i=aiInput(r,sdt);if(globalThis.__pin)i=globalThis.__pin(r,i,sdt);if(r===player&&globalThis.__forcePitch!=null)i.pitch=globalThis.__forcePitch;physics(r,i,sdt)")
js=js.replace("if(into>0.02){","if(into>0.02){(globalThis.__wall=globalThis.__wall||{})[r.name]=(globalThis.__wall[r.name]||0)+1;globalThis.__wallAt&&globalThis.__wallAt(r,into);",1)
rep("if(r.h<=HOVER&&!r.offT){const imp=-r.vh;r.air=false;","if(r.h<=HOVER&&!r.offT){const imp=-r.vh;(globalThis.__hop=globalThis.__hop||{})[r.name]=(globalThis.__hop[r.name]||0)+1;r.air=false;")
rep("return false;const w=r.weapons[slot],n0=shots.length;","return false;const w=r.weapons[slot],n0=shots.length;(globalThis.__fw=globalThis.__fw||{})[w]=(globalThis.__fw[w]||0)+1;")
rep("function wreck(r){","function wreck(r){(globalThis.__wr=globalThis.__wr||{})[r.name]=(globalThis.__wr[r.name]||0)+1;globalThis.__wrAt&&globalThis.__wrAt(r);")
rep("r.respawnU=j?j.u1+8:uu+6;","(globalThis.__fall=globalThis.__fall||{})[r.name]=(globalThis.__fall[r.name]||0)+1;globalThis.__fallAt&&globalThis.__fallAt(r,uu,!!j,!!off);r.respawnU=j?j.u1+8:uu+6;")
rep("r.respawnU=uu+6;r.wreck=1.4;r.boost=0;r.hp=","(globalThis.__clip=globalThis.__clip||{})[r.name]=(globalThis.__clip[r.name]||0)+1;globalThis.__clipAt&&globalThis.__clipAt(r,uu);r.respawnU=uu+6;r.wreck=1.4;r.boost=0;r.hp=")
rep("S.goAt=performance.now()+S.count*1000;S.lastBeep=3;","S.goAt=null;S.lastBeep=3;") # the sim steps faster than real time
# Prototype 39: more internals for drivers that set up a race the way the game does (eric.js: the build, the logs, career)
rep("code:()=>{try{return roadStr()}catch(e){return null}}};","code:()=>{try{return roadStr()}catch(e){return null}},codeStr:()=>{try{return codeStr()}catch(e){return null}},setBuild:b=>{build=b},getBuild:()=>build,LOG,logEnd,DIFF,idxAt,modU,sampleAt,canFire,aiWants,WDEF,store,HOVER,setField,car:typeof car!=='undefined'?car:null,carCode:typeof carCode!=='undefined'?carCode:null,CAR_T:typeof CAR_T!=='undefined'?CAR_T:null,freshRacer,trimTurn,DR:typeof DR!=='undefined'?DR:null,drOf:typeof drOf!=='undefined'?drOf:null,drKF:typeof drKF!=='undefined'?drKF:null,derive};")
# r.hum: a racer the AI code drives (r.isAI stays true, so aiInput still offers it shots) but with a person's physics:
# no AI skill or width factor on its top speed, no rubber band, the person's yaw assist for the width, the person's drift
# rules (tap the brake to start one; holding it ends it), and none of the AI's own lapses.
rep("let vm=D.vmax*(r.isAI?","let vm=D.vmax*(r.isAI&&!r.hum?")
rep("if(r.isAI&&!auto){const gap=bandRef()","if(r.isAI&&!r.hum&&!auto){const gap=bandRef()")
rep("r.yaw-=(r.yaw-yb0)*(r.isAI?0.2:T.D.assist)","r.yaw-=(r.yaw-yb0)*(r.isAI&&!r.hum?0.2:T.D.assist)")
rep("else if(bOn&&!r.isAI){r.dHold","else if(bOn&&!(r.isAI&&!r.hum)){r.dHold")
rep("else if(r.isAI&&bOn&&!r.air&&Math.abs(st0)>0.8","else if(r.isAI&&!r.hum&&bOn&&!r.air&&Math.abs(st0)>0.8")
rep("if(r.isAI&&!(r.autoT>0)){if(r.lapT>0)","if(r.isAI&&!r.hum&&!(r.autoT>0)){if(r.lapT>0)")
# The Drifter's drift as frame fields, so VARIANT can try another one: dTurn (extra turn at full drift), dIn and dOut (how
# fast the drift builds and fades a second); unset, each keeps the source's own number (Prototype 38: 0.6, 4 and 3;
# Prototype 39: 0.25, 2 and 2.5). VARIANT="roller.dTurn=0.25;roller.dIn=2;roller.dOut=2.5" is the P39 drift on a P38 build.
import re
for pat,mk in [(r"r\.driftK=clamp\(\(r\.driftK\|\|0\)\+\(r\.drift\?([0-9.]+):-([0-9.]+)\)\*dt,0,1\)\}",lambda m:"r.driftK=clamp((r.driftK||0)+(r.drift?(FRAMES.roller.dIn??%s):-(FRAMES.roller.dOut??%s))*dt,0,1)}"%(m.group(1),m.group(2))),
               (r"\*\(r\.drift\?1\+([0-9.]+)\*\(r\.driftK\|\|0\):1\)",lambda m:"*(r.drift?1+(FRAMES.roller.dTurn??%s)*(r.driftK||0):1)"%m.group(1))]:
    if len(re.findall(pat,js))==1: js=re.sub(pat,mk,js)
    else: print('note: drift line not found, the drift VARIANT fields do nothing on this source:',pat[:40])
open(os.environ.get('OUT',os.path.join(HERE,'game.js')),'w').write(js);print('ok',len(js))
