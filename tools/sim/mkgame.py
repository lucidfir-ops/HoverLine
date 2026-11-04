# SRC=page OUT=game.js python3 mkgame.py : gen.py, then export AIX (Prototype 45) and the sim-only fast path (fastify.py)
import os,subprocess,sys
HERE=os.path.dirname(os.path.abspath(__file__))
subprocess.check_call([sys.executable,os.path.join(HERE,'gen.py')],env=os.environ)
f=os.environ['OUT'];js=open(f).read()
a="freshRacer,trimTurn,";assert js.count(a)==1
js=js.replace(a,"freshRacer,trimTurn,AIX:typeof AIX!=='undefined'?AIX:null,EMPT:typeof EMP_T!=='undefined'?EMP_T:4.5,")
open(f,'w').write(js)
if os.environ.get('FAST','1')=='1':subprocess.check_call([sys.executable,os.path.join(HERE,'fastify.py'),f])
print('mkgame ok',f)
