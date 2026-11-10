//# music/028-engine-analog.js: synth engine 0: analog
/* ---- engine 0: analog ---- */
function ctlVA(v,P){const k=CR/SR;v.age+=k;v.lf+=(v.lt-v.lf)*v.gk;v.bd*=v.bk;v.pe*=v.pk;
  let ct=v.bd*100+v.pe;
  if(P.vd){const a=(v.age-P.vdl)/P.vdf;if(a>0){v.vp+=P.vr*k;if(v.vp>=1)v.vp-=1;ct+=P.vd*v.vs*(a>1?1:a)*sn(v.vp)}}
  const l2=v.lf+ct/1200,first=v.age<=k;v.f=Math.exp(l2*LN2);v.inc=v.f/SR;
  if(P.dr&&((v.n=(v.n+1)&3)===0||first)){for(let i=0;i<P.n;i++){v.ns^=v.ns<<13;v.ns^=v.ns>>>17;v.ns^=v.ns<<5;v.dr[i]=v.dr[i]*0.985+(v.ns/2147483648)*P.dr*v.mv*0.5;v.dm[i]=v.d0[i]*(1+v.dr[i]*0.000578)}}
  v.fe+=((v.g?P.fsu:0)-v.fe)*v.fk;
  let oc=P.fe*v.fe*(0.55+0.45*v.v)+v.cm;
  if(P.fl){v.lp+=v.lr*k;if(v.lp>=1)v.lp-=1;oc+=P.fl*v.mv*sn(v.lp)}
  svf(v.c,0,P.fc*Math.exp(LN2*(P.kt*(l2-LC4)+oc)),P.k);
  if(P.F&&(first||P.Fd&&(v.t^=1))){let m=0;if(P.Fd){v.mp+=v.lr*k*P.Fr;if(v.mp>=1)v.mp-=1;m=P.Fd*v.mv*(0.5-0.5*sn(v.mp+0.25))}
    for(let j=0;j<P.F.length;j++){const a=P.F[j],b=P.G?P.G[j]:a,kq=1/(a[1]+(b[1]-a[1])*m);svf(v.c,4+j*3,a[0]+(b[0]-a[0])*m,kq);v.c[13+j]=kq}}
  if(P.nz&&(first||Math.abs(v.lt-v.lf)>1e-3))svf(v.c,16,v.f*P.nh,1/P.nq);
  v.cr=CR}
function rVA(v,P,L,R,i0,i1,F0){const n=P.n,w=P.w,z=v.z,c=v.c,ph=v.ph,dm=v.dm,gw=v.gw,F=P.F,nf=F?F.length:0,ft=P.ft,dv=P.dv||0,dn=dv>1?1/th(dv):1,nz=P.nz/P.nq,nb=P.nb,chh=P.ch,sh=P.sh,sub=P.sub,so=0.5*P.so,fdry=P.fdry,h2=P.h2,h3=P.h3,mk=P.k;
  for(let s=i0;s<i1;s++){
    if(v.g&&F0+s>=v.off){v.g=0;v.as=2}
    if(--v.cr<=0)ctlVA(v,P);
    let ae=v.ae;if(v.as===0){ae+=v.ai;if(ae>=1){ae=1;v.as=1}}else if(v.as===1)ae+=(v.su-ae)*v.ak;else{ae-=ae*v.rk;if(ae<3e-5){v.on=0;v.ae=0;return}}v.ae=ae;
    const inc=v.inc;let x=0;
    if(w===3){let p=ph[0]+inc;if(p>=1)p-=1;ph[0]=p;x=sn(p)+h2*sn(2*p)+h3*sn(3*p+0.25)}
    else for(let i=0;i<n;i++){const d=inc*dm[i];let p=ph[i]+d;if(p>=1)p-=1;ph[i]=p;
      x+=(w===0?2*p-1-blep(p,d):w===1?(p<0.5?1:-1)+blep(p,d)-blep(p>=0.5?p-0.5:p+0.5,d):4*(p<0.5?p:1-p)-1)*gw[i]}
    if(nz){v.ns^=v.ns<<13;v.ns^=v.ns>>>17;v.ns^=v.ns<<5;const r=v.ns/2147483648,ch=chh?1+chh*Math.exp(-v.age*40):1;
      const v3=r-z[15],v1=c[16]*z[14]+c[17]*v3,v2=z[15]+c[17]*z[14]+c[18]*v3;z[14]=2*v1-z[14];z[15]=2*v2-z[15];x+=(v1*nz+r*nb)*ch}
    if(sh){v.hz2+=(x-v.hz2)*v.hc2;x-=v.hz2}
    if(dv>1)x=th(x*dv)*dn;
    const v3=x-z[1],v1=c[0]*z[0]+c[1]*v3,v2=z[1]+c[1]*z[0]+c[2]*v3;z[0]=2*v1-z[0];z[1]=2*v2-z[1];let y=ft===1?v1*mk:v2;
    if(nf){let yf=0;for(let j=0;j<nf;j++){const o=4+j*3,q=2+j*2,u=x-z[q+1],b1=c[o]*z[q]+c[o+1]*u,b2=z[q+1]+c[o+1]*z[q]+c[o+2]*u;z[q]=2*b1-z[q];z[q+1]=2*b2-z[q+1];yf+=b1*c[13+j]*F[j][2]}y=y*fdry+yf}
    if(sub){v.sp+=inc*so;if(v.sp>=1)v.sp-=1;y+=sub*sn(v.sp)}
    if(P.hp){v.hz+=(y-v.hz)*v.hc;y-=v.hz}
    v.lz+=(y-v.lz)*v.lc;const o=v.lz*ae*v.vg;L[s]+=o*v.pl;R[s]+=o*v.pr}}
