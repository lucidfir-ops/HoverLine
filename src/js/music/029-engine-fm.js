//# music/029-engine-fm.js: synth engine 1: four-operator FM
/* ---- engine 1: FM, four operators; m[] lists which operator modulates which (algorithm), op 3 has feedback ---- */
const ALG=[[[3,2],[2,1],[1,0]],[[1,0],[3,2]],[[1,0],[3,2],[2,0]],[[3,0],[3,1],[3,2]],[],[[2,1],[1,0]]];
const CAR=[[0],[0,2],[0],[0,1,2],[0,1,2,3],[0,3]];
function ctlFM(v,P){const k=CR/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.bd*=v.bk;v.pe*=v.pk;let ct=v.bd*100+v.pe;
  if(P.vd){const a=(v.age-P.vdl)/(P.vdf||0.3);if(a>0){v.vp+=P.vr*k;if(v.vp>=1)v.vp-=1;ct+=P.vd*v.vs*(a>1?1:a)*sn(v.vp)}}
  v.f=Math.exp((v.lf+ct/1200)*LN2);const f=v.f/SR;for(let j=0;j<4;j++)v.oi[j]=f*P.r[j]*v.dm[j];
  v.mc[0]=1;if(P.ld){v.lp+=v.lr*k;if(v.lp>=1)v.lp-=1;v.mc[0]=1+P.ld*v.mv*sn(v.lp)}v.cr=CR}
function rFM(v,P,L,R,i0,i1,F0){const al=P.al,ph=v.ph,oe=v.oe,os=v.os,ol=v.ol,oa=v.oa,od=v.od,orl=v.orl,oi=v.oi,su=P.s,lo=P.lo|0,fb=v.c[0],car=CAR[al],nc=car.length;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;for(let j=0;j<4;j++)os[j]=2}
    if(--v.cr<=0){ctlFM(v,P);let live=0;for(let i=0;i<nc;i++)if(oe[car[i]]>2e-5||os[car[i]]===0)live=1;if(!live&&v.age>0.01){v.on=0;return}}
    for(let j=0;j<4;j++){let e=oe[j];const st=os[j];if(st===0){e+=oa[j];if(e>=1){e=1;os[j]=1}}else if(st===1)e+=(su[j]-e)*od[j];else e-=e*orl[j];oe[j]=e}
    for(let j=0;j<4;j++){let p=ph[j]+oi[j];if(p>=1)p-=1;ph[j]=p}
    const m=v.mc[0],l1=ol[1]*oe[1]*(lo===1?m:1),l2=ol[2]*oe[2]*(lo===2?m:1),l3=ol[3]*oe[3]*(lo===3?m:1);
    const r3=sn(ph[3]+fb*(v.ya+v.yb));v.yb=v.ya;v.ya=r3;const y3=r3*l3;let out;
    if(al===0){const y2=sn(ph[2]+y3)*l2,y1=sn(ph[1]+y2)*l1;out=sn(ph[0]+y1)*ol[0]*oe[0]}
    else if(al===1){out=sn(ph[0]+sn(ph[1])*l1)*ol[0]*oe[0]+sn(ph[2]+y3)*ol[2]*oe[2]}
    else if(al===2){const y2=sn(ph[2]+y3)*l2;out=sn(ph[0]+sn(ph[1])*l1+y2)*ol[0]*oe[0]}
    else if(al===3){out=sn(ph[0]+y3)*ol[0]*oe[0]+sn(ph[1]+y3*0.7)*ol[1]*oe[1]+sn(ph[2]+y3*0.5)*ol[2]*oe[2]}
    else if(al===4){out=sn(ph[0])*ol[0]*oe[0]+sn(ph[1])*ol[1]*oe[1]+sn(ph[2])*ol[2]*oe[2]+y3}
    else{const y2=sn(ph[2])*l2,y1=sn(ph[1]+y2)*l1;out=sn(ph[0]+y1)*ol[0]*oe[0]+y3}
    if(P.sub){v.sp+=oi[0]*(P.so||1);if(v.sp>=1)v.sp-=1;out+=P.sub*sn(v.sp)*oe[0]}
    v.hz+=(out-v.hz)*v.hc;out-=v.hz;v.lz+=(out-v.lz)*v.lc;const o=v.lz*v.vg;L[s]+=o*v.pl;R[s]+=o*v.pr}}
