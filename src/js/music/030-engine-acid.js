//# music/030-engine-acid.js: synth engine 2: acid (303-style ladder)
/* ---- engine 2: acid. The ladder is solved without a unit delay in its loop (so it tunes and self-oscillates at the
   cutoff), with a soft clip on its input keeping self-oscillation bounded and a high-pass in the feedback path that
   keeps the low end full at high resonance, as on the TB-303. ---- */
function ctlAC(v,P){const k=8/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.f=Math.pow(2,v.lf);v.inc=v.f/SR;
  v.fe*=v.fk;v.ae2*=v.c[20];v.acs+=(v.ae2-v.acs)*(v.ae2>v.acs?v.c[21]:v.c[22]);
  const fc=P.fc*Math.pow(2,P.em*v.fe*(0.7+0.3*v.v)+P.am*v.acs+v.cm),fq=fc<25?25:fc>NYQ*0.85?NYQ*0.85:fc,g=Math.tan(Math.PI*fq/SR),G=g/(1+g),c=v.c;
  c[0]=G;c[1]=G*G;c[2]=c[1]*G;c[3]=c[2]*G;c[4]=1/(1+g);v.cr=8}
function rAC(v,P,L,R,i0,i1,F0){const z=v.z,c=v.c,sq=P.w===1,K=4.6*v.rs,A=c[6],Gh=c[5],dv=P.dv,pw=P.pw||0.5;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;v.as=2}
    if(--v.cr<=0)ctlAC(v,P);
    let ae=v.ae;if(v.as===0){ae+=v.ai;if(ae>=1){ae=1;v.as=1}}else if(v.as===1)ae+=(v.su-ae)*v.ak;else{ae-=ae*v.rk;if(ae<3e-5){v.on=0;v.ae=0;for(let i=0;i<6;i++)z[i]=0;return}}v.ae=ae;
    const d=v.inc;let p=v.ph[0]+d;if(p>=1)p-=1;v.ph[0]=p;
    let x=sq?(p<pw?1:-1)+blep(p,d)-blep(p>=pw?p-pw:p+1-pw,d):2*p-1-blep(p,d);x*=dv;
    const G=c[0],G4=c[3],S=c[4],s1=z[0]*S,s2=z[1]*S,s3=z[2]*S,s4=z[3]*S,sh=z[4];
    const Sg=c[2]*s1+c[1]*s2+G*s3+s4,kA=K*A,y4=(G4*(x+kA*sh)+Sg)/(1+kA*G4),u=th(x-kA*(y4-sh));
    let t=(u-z[0])*G,y=t+z[0];z[0]=y+t;t=(y-z[1])*G;y=t+z[1];z[1]=y+t;t=(y-z[2])*G;y=t+z[2];z[2]=y+t;t=(y-z[3])*G;y=t+z[3];z[3]=y+t;
    t=(y-z[4])*Gh;const lh=t+z[4];z[4]=lh+t;
    let o=y*(1+0.6*v.rs);v.hz+=(o-v.hz)*v.hc;o-=v.hz;o=th(o*1.6)*0.66;
    o*=ae*v.vg*(1+P.av*v.ae2);L[s]+=o*v.pl;R[s]+=o*v.pr}}
