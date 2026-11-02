# Builds sim/game.js from hoverline.html: exports internals, AI drives the player, counts weapon fire / wrecks / falls.
import os
HERE=os.path.dirname(os.path.abspath(__file__))
s=open(os.environ.get('SRC',os.path.join(HERE,'..','..','src','hoverline.html'))).read();k=s.rfind('<script>');l=s.rfind('</script>');js=s[k+8:l]
def rep(a,b):
    global js
    assert js.count(a)==1,a[:80];js=js.replace(a,b)
rep("loadTrack(seed);\ntuneUI();buildSummary();\nrequestAnimationFrame(frame);","globalThis.__hl={racers,S,startRace,step,loadTrack,getT:()=>T,ranking,shots,player,physics,aiInput,fire,leaderFor,parseCode,roster,ROSTER,FRAMES,setShip};")
rep("const i=(r===player&&player.finishT==null&&!auto&&!(player.autoT>0))?inp:aiInput(r,sdt);physics(r,i,sdt)","const i=aiInput(r,sdt);if(r===player&&globalThis.__forcePitch!=null)i.pitch=globalThis.__forcePitch;physics(r,i,sdt)")
js=js.replace("if(into>0.02){","if(into>0.02){(globalThis.__wall=globalThis.__wall||{})[r.name]=(globalThis.__wall[r.name]||0)+1;globalThis.__wallAt&&globalThis.__wallAt(r,into);",1)
rep("if(r.h<=HOVER&&!r.offT){const imp=-r.vh;r.air=false;","if(r.h<=HOVER&&!r.offT){const imp=-r.vh;(globalThis.__hop=globalThis.__hop||{})[r.name]=(globalThis.__hop[r.name]||0)+1;r.air=false;")
rep("return false;const w=r.weapons[slot],n0=shots.length;","return false;const w=r.weapons[slot],n0=shots.length;(globalThis.__fw=globalThis.__fw||{})[w]=(globalThis.__fw[w]||0)+1;")
rep("function wreck(r){","function wreck(r){(globalThis.__wr=globalThis.__wr||{})[r.name]=(globalThis.__wr[r.name]||0)+1;globalThis.__wrAt&&globalThis.__wrAt(r);")
rep("r.respawnU=j?j.u1+8:uu+6;","(globalThis.__fall=globalThis.__fall||{})[r.name]=(globalThis.__fall[r.name]||0)+1;r.respawnU=j?j.u1+8:uu+6;")
rep("r.respawnU=uu+6;r.wreck=1.4;r.boost=0;r.hp=","(globalThis.__clip=globalThis.__clip||{})[r.name]=(globalThis.__clip[r.name]||0)+1;r.respawnU=uu+6;r.wreck=1.4;r.boost=0;r.hp=")
rep("S.goAt=performance.now()+S.count*1000;S.lastBeep=3;","S.goAt=null;S.lastBeep=3;") # the sim steps faster than real time
open(os.environ.get('OUT',os.path.join(HERE,'game.js')),'w').write(js);print('ok',len(js))
