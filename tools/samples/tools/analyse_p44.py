import sys,glob,os,json,numpy as np
sys.path.insert(0,os.path.dirname(__file__))
import audiolib as A
D=sys.argv[1];sr=44100
WIN={'k':0.1,'s':0.1,'c':0.1,'h':0.05,'o':0.15,'r':0.4,'t':0.15,'i':0.3}
rows=[]
for f in sorted(glob.glob(D+'/*.f32')):
    n=os.path.basename(f)[:-4];x=np.fromfile(f,'<f4').astype('float64')
    if len(x)<64:continue
    piece=n.split('_',1)[1]
    w=WIN.get(piece[0],0.1) if n.startswith('kit') else 0.1
    if piece in('ho',):w=0.15
    if piece in('cr','rd','rc','s_sp','x_cc_cr','x_ride_via','x_drum_splash_soft'):w=0.4
    b=A.bands(x[:int(sr*1.0)],sr)
    rows.append((n,A.peak(x),A.loud_short(x,sr,w),b['centroid'],b['b6_9'],b['gt10'],b['gt12'],b['gt16'],len(x)/sr))
print('%-26s %6s %7s %7s %6s %6s %6s %6s %5s'%('piece','peak','Lshort','centr','6-9k','>10k','>12k','>16k','sec'))
for r in rows:print('%-26s %6.3f %7.1f %7.0f %6.3f %6.3f %6.3f %6.3f %5.2f'%r)
