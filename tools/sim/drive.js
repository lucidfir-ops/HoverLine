/* A driver's hands for the drift (Prototype 43), shared by the Eric pilot and the trace tests.
   driftStick(H, r, cmd): the stick that asks the drift for the turn a normal steer of cmd would give. In a drift the stick
   sets the arc n (a share of what the frame can steer): level holds the base n0, into the turn goes linearly up to
   1+DR.turn, out of it linearly down to DR.kOut. A person learns that map; this inverts it, so a pilot that steers by
   feedback steers the drift the same way (a cmd of 1 into the turn asks for full steering, n=1). Outside a drift it
   returns cmd unchanged. */
function driftStick(H,r,cmd){const D=H.DR;if(!D||!(r.drift&&r.dN))return cmd;const d=r.drift,n=cmd*d,n0=r.dN0==null?0.5:r.dN0;
  /* a Prototype 41 build: the arc is the base curvature dK0 times 1+R*stick (R by frame) */
  if(D.tapMax==null){const P=H.drOf(r),kF=(1.85-0.55*(r.v/H.VMAX))*r.d.turn*H.trimTurn(r)/Math.max(r.v,1),g=n*kF/Math.max(1e-6,r.dK0);return Math.max(-1,Math.min(1,(g-1)/Math.max(0.02,P.R)))*d}
  const s=n>=n0?(n-n0)/Math.max(1e-6,1+D.turn-n0):(n-n0)/Math.max(1e-6,n0-D.kOut);return Math.max(-1,Math.min(1,s))*d}
/* the AI's steering law towards a lateral target (the one aiInput and the Eric pilot use) */
function steerTo(H,r,target,lookK=1,lim=1){const T=H.getT(),uu=H.modU(r.u),v=r.v,f=H.surf(uu,r.lat,r),look=Math.max(22,v*0.75),desired=-Math.atan2(target-r.lat,look*lookK);
  const turn=(1.85-0.55*(v/H.VMAX))*r.d.turn*(1+0.8*Math.max(0,r.pitch)-0.15*Math.max(0,-r.pitch));
  return Math.max(-lim,Math.min(lim,(3.2*(r.yaw-desired)-T.Cs[H.idxAt(r.u)]*v)/turn))}
/* the inside line the AI takes: towards the inside of the bend ahead */
function lineFor(H,r){const T=H.getT(),W=H.getW(),look=Math.max(22,r.v*0.75),c=T.Cs[H.idxAt(r.u+look*0.6)];
  return Math.max(-(W/2-2.8),Math.min(W/2-2.8,-Math.sign(c)*Math.min(1,Math.abs(c)*140)*W*0.3))}
module.exports={driftStick,steerTo,lineFor};
