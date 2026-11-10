//# ui/065-nose-guide.js: the nose guide
/* ---------- nose guide ----------
   One animated example per situation, drawn in 2D: side views for straights, crests, dips and jumps, a top-down view
   for corners. The ship in full colour does it right; a faded one shows what happens otherwise. */
const GUIDE=[
 {k:'uphill',tab:'Uphill',title:'Nose up going uphill',mark:'grip',
  body:'A climb drags you back, harder the steeper it is. Pull the nose up and you hold your speed; level or nose down and you lose it three times as fast (the HUD shows CLIMB DRAG). Grey Λ at the foot of a climb.'},
 {k:'downhill',tab:'Downhill',title:'Nose down going downhill',mark:'dive',
  body:'Push the nose down on a descent to streamline: up to a fifth more top speed on a steep descent (not in an Orb: round, it gains nothing). Nose up on the way down drags. Green V at the top of a descent.'},
 {k:'flat',tab:'Flat',title:'Level on the flat',mark:null,
  body:'On the flat there is nothing to gain from the nose, so hold it level. Nose up or nose down both cost a little speed there.'},
 {k:'corner',tab:'Corners',title:'Lift the nose for tight corners',mark:'grip',
  body:'Nose up also grips: steering nearly doubles, so you hold the inside line where a level frame runs wide into the wall. On the flat it costs a little speed, which a tight corner is worth. Grey Λ before the tight ones. For a long corner, hold the brake while you steer instead: you drift at once and shape the arc with the stick.'},
 {k:'crest',tab:'Crests',title:'Nose down over a crest',mark:'dive',
  body:'On twisty tracks the road can fall away under you at the top of a rise. Nose down holds you on it. Level or nose up and the frame floats off, losing thrust and half its steering until it lands.'},
 {k:'jump',tab:'Jumps',title:'Lift off a jump to float',mark:'grip',
  body:'In the air, nose up softens the fall so you carry further and land past the gap with room to spare. Nose down drops you sooner, and on a long gap that means falling short. The lip has grey chevrons.'},
 {k:'colours',tab:'Colours',title:'What the colours mean',mark:null,
  body:'Green lines: your nose matches the slope (the HUD shows CLIMBING, or STREAMLINE and how much faster you are). Grey shell: nose up, more grip. On the road, grey Λ means nose up (a climb, a tight corner or a jump) and green V means nose down (a descent).'}];
const GMARK={dive:['#46ff8c','M8 8 L32 26 L56 8','Green V · nose down'],grip:['#cdd6e0','M8 26 L32 8 L56 26','Grey Λ · nose up']};
const guide={i:0,t:0,on:false,raf:0,from:null,last:0,st:null};
function guideKeys(){const inv=bind.padInvert;
  if(lastDev==='pad')return`Nose down: left stick ${inv?'down':'up'} (the right stick works too) · nose up: stick ${inv?'up':'down'}.`;
  if(lastDev==='key')return'Nose down: ↑ or W · nose up: ↓ or S.';
  const tp=tilt.pitchMode<2?`tip the top of the screen ${tilt.pitchMode?'towards you':'away'}`:'',th=steerMode==='stick'?'push the stick up':steerMode==='btns'?'slide up on ◀ or ▶':pitchSlider?`slide the ${steerMode==='tilt'?'nose':'pitch'} slider up`:'';
  return tp||th?`Nose down: ${[tp,th].filter(Boolean).join(', or ')} · nose up: the other way.`:'Nose down: turn on the pitch slider in Controls.'}
function guideShow(i){guide.i=(i+GUIDE.length)%GUIDE.length;guide.t=0;guide.st=null;const g=GUIDE[guide.i];
  $('guideTitle').textContent=g.title;$('guideBody').textContent=g.body;$('guideKeys').textContent=guideKeys();
  const m=g.mark&&GMARK[g.mark];$('guideMark').innerHTML=m?`<svg viewBox="0 0 64 34" aria-hidden="true">${m[1]?`<path d="${m[1]}" fill="none" stroke="${m[0]}" stroke-width="6"/>`:`<rect x="6" y="7" width="52" height="7" fill="${m[0]}"/><rect x="6" y="20" width="52" height="7" fill="${m[0]}"/>`}</svg><span>${m[2]} on the road</span>`:'';
  document.querySelectorAll('#guideTabs .chip').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===guide.i)));$('guideNext').textContent=guide.i===GUIDE.length-1?'First ›':'Next ›'}
function openGuide(from){guide.from=from;$(from).hidden=true;$('guide').hidden=false;guide.on=true;
  const tabs=$('guideTabs');if(!tabs.children.length)GUIDE.forEach((g,k)=>{const b=document.createElement('button');b.className='chip';b.setAttribute('role','tab');b.textContent=g.tab;b.onclick=()=>guideShow(k);tabs.append(b)});
  guideShow(guide.i);guide.last=performance.now();cancelAnimationFrame(guide.raf);guide.raf=requestAnimationFrame(guideFrame)}
function closeGuide(){guide.on=false;cancelAnimationFrame(guide.raf);$('guide').hidden=true;const f=guide.from;guide.from=null;if(f)$(f).hidden=false}
function guideFrame(now){if(!guide.on)return;const dt=Math.min(0.05,(now-guide.last)/1000);guide.last=now;guide.t+=dt;
  const cv=$('guideCv'),dpr=Math.min(2,devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;if(w>0&&h>0){if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
    const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);try{guideDraw(c,w,h,GUIDE[guide.i].k,dt)}catch(e){}}
  guide.raf=requestAnimationFrame(guideFrame)}
const GC={bg:'#07090d',road:'#1c2129',edge:'#ffb000',green:'#46ff8c',grey:'#cdd6e0',red:'#ff4a3d',ink:'#f2efe6',dim:'#8a93a3',cyan:'#3ff0ff'};
/* the player's colours for the ship drawings */
const gPaint=()=>{const p=paintOf(build),hx=n=>'#'+n.toString(16).padStart(6,'0');return{body:hx(p.body),stripe:hx(p.stripe)}};
function gLabel(c,x,y,txt,col,al='left'){c.font="600 13px 'Chakra Petch','Arial Narrow',sans-serif";c.textAlign=al;c.fillStyle=col;c.fillText(txt,x,y)}
/* a ship from the side: nose to the right, rotated by a (radians, clockwise = nose down); fx: lines (0-1), shell grey|red, sparks */
function gShipSide(c,x,y,a,S,o={}){const P=gPaint();c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=o.ghost?0.35:1;
  if(o.lines){const n=Math.round(4+12*o.lines);c.strokeStyle=GC.green;c.lineWidth=1.6;for(let k=0;k<n;k++){const ph=(k*0.618+guide.t*(1.6+k%3*0.4))%1,yy=(((k*37)%17)/17-0.5)*S*0.9,len=S*(0.5+1.4*o.lines);
    c.globalAlpha=(o.ghost?0.35:1)*(0.25+0.55*o.lines)*(1-ph);c.beginPath();c.moveTo(S*0.6-ph*S*2.6,yy);c.lineTo(S*0.6-ph*S*2.6-len,yy);c.stroke()}c.globalAlpha=o.ghost?0.35:1}
  c.fillStyle=GC.cyan;c.globalAlpha*=0.8;c.beginPath();c.ellipse(-S*0.55,0,S*0.12,S*0.07,0,0,TAU);c.fill();c.globalAlpha=o.ghost?0.35:1;
  c.fillStyle=P.body;c.beginPath();c.moveTo(S*0.62,S*0.05);c.lineTo(S*0.18,-S*0.13);c.lineTo(-S*0.3,-S*0.17);c.lineTo(-S*0.52,-S*0.09);c.lineTo(-S*0.52,S*0.07);c.lineTo(S*0.25,S*0.1);c.closePath();c.fill();
  c.fillStyle=P.stripe;c.beginPath();c.moveTo(S*0.45,S*0.02);c.lineTo(S*0.1,-S*0.08);c.lineTo(-S*0.42,-S*0.09);c.lineTo(-S*0.42,-S*0.03);c.lineTo(S*0.1,-S*0.01);c.closePath();c.fill();
  c.fillStyle=P.stripe;c.beginPath();c.moveTo(-S*0.3,-S*0.16);c.lineTo(-S*0.5,-S*0.34);c.lineTo(-S*0.52,-S*0.09);c.closePath();c.fill();
  if(o.shell){const col=o.shell==='red'?GC.red:GC.grey;c.strokeStyle=col;c.fillStyle=col;c.globalAlpha=(o.ghost?0.5:1)*(o.shell==='red'?0.55:0.4)*(0.85+0.15*Math.sin(guide.t*30));c.lineWidth=2;
    c.beginPath();c.arc(S*0.42,0,S*0.32,-1.1,1.1);c.stroke();c.globalAlpha*=0.3;c.beginPath();c.arc(S*0.42,0,S*0.32,-1.1,1.1);c.lineTo(S*0.42,0);c.fill()}
  c.restore();
  if(o.sparks){c.save();c.fillStyle='#ffd27a';for(let k=0;k<9;k++){const ph=(guide.t*3.3+k*0.137)%1,ax=x+Math.cos(a)*S*0.6,ay=y+Math.sin(a)*S*0.6+S*0.1;c.globalAlpha=1-ph;c.fillRect(ax-ph*S*1.2-k%3*4,ay+ph*S*0.25*(k%2?1:-0.4),3,2)}c.restore()}}
function gShipTop(c,x,y,a,S,o={}){const P=gPaint();c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=o.ghost?0.4:1;
  c.fillStyle=P.body;c.beginPath();c.moveTo(S*0.55,0);c.lineTo(-S*0.15,-S*0.26);c.lineTo(-S*0.45,-S*0.22);c.lineTo(-S*0.38,0);c.lineTo(-S*0.45,S*0.22);c.lineTo(-S*0.15,S*0.26);c.closePath();c.fill();
  c.fillStyle=P.stripe;c.fillRect(-S*0.35,-S*0.04,S*0.75,S*0.08);
  if(o.shell){c.strokeStyle=GC.grey;c.globalAlpha=0.45;c.lineWidth=2;c.beginPath();c.arc(S*0.3,0,S*0.38,-1.2,1.2);c.stroke()}
  c.restore()}
/* side-view track: h(x) height, gap [g0,g1] with no road */
const GROAD={
  straight:{h:()=>0,len:9.5},uphill:{h:x=>0.24*x,len:6.2},downhill:{h:x=>-0.24*x,len:6.2},flat:{h:()=>0,len:6.2},
  crest:{h:x=>9*Math.exp(-((((x%320)-170)/38)**2)),len:6.2},
  dip:{h:x=>-9*Math.exp(-((((x%320)-170)/38)**2)),len:6.2},
  jump:{h:x=>{const u=x%320;return u>130&&u<150?(u-130)*0.075:u>=150&&u<174?-40:0},gap:[150,174],len:6.2}};
function gSim(sh,dt,R,g){const isGap=x=>R.gap&&(x%320)>=R.gap[0]&&(x%320)<R.gap[1],hv=1.3,hx=x=>R.h(x),d=x=>(hx(x+0.5)-hx(x-0.5)),dd=x=>hx(x+2)-2*hx(x)+hx(x-2);
  sh.x+=sh.v*dt;const u=sh.x%320,r=hx(sh.x);
  if(sh.fall){sh.vy-=40*dt;sh.y+=sh.vy*dt;return}
  if(R.gap&&!sh.air&&u>=R.gap[0]&&u<R.gap[1]){sh.air=true;sh.vy=0.075*sh.v;sh.y=1.5+hv}
  if(!sh.air){const need=dd(sh.x)/4*sh.v*sh.v;if(!R.gap&&need<-g){sh.air=true;sh.vy=d(sh.x)*sh.v;sh.y=r+hv}else{sh.y=r+hv;sh.scr=need>20}}
  else{sh.vy-=g*dt;sh.y+=sh.vy*dt;sh.scr=false;const rr=hx(sh.x);if(R.gap&&u>=R.gap[0]&&u<R.gap[1]&&sh.y<0.4)sh.fall=true;else if(!isGap(sh.x)&&sh.y<=rr+hv){sh.y=rr+hv;sh.air=false;sh.vy=0}}}
function guideDraw(c,w,h,k,dt){c.fillStyle=GC.bg;c.fillRect(0,0,w,h);
  if(k==='corner')return gCorner(c,w,h);if(k==='colours')return gColours(c,w,h);
  const R=GROAD[k],T=R.len,G=guide;if(G.t>T||!G.st){G.t=G.t>T?0:G.t;const v=55,x0=k==='straight'?0:60;
    G.st={a:{x:x0,y:1.3,vy:0,air:false,v,dive:0},b:{x:x0+(k==='uphill'||k==='downhill'?20:k==='flat'?8:-30),y:1.3,vy:0,air:false,v}}}
  const st=G.st,t=G.t,A=st.a,B=st.b;
  /* who does what: A is right, B (faded) is the other way */
  const trimA={uphill:-1,downhill:1,flat:0,crest:1,jump:-1}[k]||0,trimB={uphill:0,downhill:0,flat:1,crest:0,jump:1}[k]||0;
  const gOf=tr=>30*(tr>0?1.6:tr<0?0.55:1);
  if(k==='uphill'||k==='downhill'){A.v=66;if(B)B.v=55}else if(k==='flat'){A.v=55;if(B)B.v=52.8}
  gSim(A,dt,R,gOf(trimA));if(B)gSim(B,dt,R,gOf(trimB));
  const sc=w/(w<520?92:125),camX=A.x-(w<520?34:46),base=h*(k==='crest'?0.66:k==='dip'?0.5:0.6),camY=k==='uphill'||k==='downhill'?A.y:0,X=x=>(x-camX)*sc,Y=y=>base-(y-camY)*sc,isGap=x=>R.gap&&(x%320)>=R.gap[0]&&(x%320)<R.gap[1];
  /* city in the distance */
  c.strokeStyle='rgba(255,176,0,.16)';c.lineWidth=1;for(let i=-2;i<14;i++){const px=((i*97-camX*sc*0.3)%(w+200)+w+200)%(w+200)-100,bh=(40+((i*53)%7)*18)*sc/6;c.strokeRect(px,base-bh-30*sc/6,48*sc/6,bh)}
  /* road */
  c.beginPath();let first=true;for(let px=0;px<=w;px+=3){const x=camX+px/sc,y=R.h(x);if(isGap(x)){first=true;continue}if(first){c.moveTo(px,Y(y));first=false}else c.lineTo(px,Y(y))}
  c.strokeStyle=GC.edge;c.lineWidth=3;c.stroke();
  {const gr=c.createLinearGradient(0,base-10*sc,0,h);gr.addColorStop(0,'#161a21');gr.addColorStop(1,'#0a0c10');c.fillStyle=gr;for(let px=0;px<=w;px+=3){const x=camX+px/sc,y=R.h(x);if(isGap(x))continue;c.fillRect(px,Y(y)+2,3,h)}}
  /* markings painted on the road ahead of the feature, with the sign above */
  const mk=GROAD[k],MK={uphill:['grip',[[20,76],[180,236]]],downhill:['dive',[[20,76],[180,236]]],crest:['dive',[[86,140]]],jump:['grip',[[128,150]]]}[k];
  if(MK){const col=GMARK[MK[0]][0];for(const[a0,a1]of MK[1])for(let rep=-1;rep<=2;rep++){const o=Math.floor(A.x/320)*320+rep*320;
    for(let x=a0;x<a1;x+=14){const px=X(o+x);if(px<-40||px>w+40)continue;c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.moveTo(px,Y(mk.h(o+x))+1);c.lineTo(px+8*sc/6*2,Y(mk.h(o+x+5))+1);c.stroke()}
    const mx=X(o+(a0+a1)/2);if(mx>-20&&mx<w+20){const my=Y(mk.h(o+(a0+a1)/2))-34;c.strokeStyle=col;c.lineWidth=3;c.beginPath();
      if(MK[0]==='dive'){c.moveTo(mx-10,my-6);c.lineTo(mx,my+6);c.lineTo(mx+10,my-6)}else if(MK[0]==='grip'){c.moveTo(mx-10,my+6);c.lineTo(mx,my-6);c.lineTo(mx+10,my+6)}else{c.moveTo(mx-11,my-4);c.lineTo(mx+11,my-4);c.moveTo(mx-11,my+4);c.lineTo(mx+11,my+4)}c.stroke()}}}
  /* ships */
  const S=Math.max(48,Math.min(120,Math.min(w,h*1.8)*0.15)),ang=(sh,tr)=>{const d=(R.h(sh.x+1)-R.h(sh.x-1))/2;return(sh.air?-Math.atan(sh.vy/sh.v)*0.8:-Math.atan(d))+tr*0.16};
  if(B&&!(B.fall&&B.y<-30)){gShipSide(c,X(B.x),Y(B.y)-S*0.12,ang(B,trimB),S,{ghost:true,shell:trimB<0&&!B.air?'grey':null})}
  gShipSide(c,X(A.x),Y(A.y)-S*0.12,ang(A,trimA),S,{lines:(k==='uphill'||k==='downhill')&&!A.air?0.8:k==='crest'&&!A.air?0.4:0,shell:trimA<0&&!A.air?'grey':null});
  /* callouts */
  const tx=Math.max(14,w*0.03),ty=26;gLabel(c,tx,ty,{uphill:'NOSE UP GOING UPHILL',downhill:'NOSE DOWN GOING DOWNHILL',flat:'LEVEL ON THE FLAT',crest:'NOSE DOWN OVER THE CREST',jump:'NOSE UP IN THE AIR'}[k],GC.ink);
  if(B){const lb={uphill:'level: loses speed on the climb',downhill:'level: no streamlining, slower',flat:'nose down: a little drag',crest:B.air?'level: floats off, half the steering':'level',jump:B.fall?'nose down: falls short':'nose down'}[k];gLabel(c,tx,ty+20,'faded frame · '+lb,B.fall||B.air?GC.red:GC.dim)}
  if(k==='uphill'||k==='downhill')gLabel(c,tx,ty+40,'a steep slope · up to +20% top speed',GC.green);
}
/* corners, from above: the full-colour ship lifts its nose and keeps the inside line; the faded one stays level and runs wide */
function gCorner(c,w,h){const G=guide,T=6.4;if(G.t>T)G.t=0;const t=G.t,u=Math.min(w,h*1.6),Rr=u*0.32,Wd=u*0.2,cx=w*0.5-Rr*0.6,cy=h*0.62,L=Math.max(w,h);
  const path=s=>{const arc=Math.PI/2*Rr;if(s<0)return{x:cx,y:cy-s,a:-Math.PI/2,nx:-1,ny:0};if(s<arc){const a=Math.PI+s/Rr;return{x:cx+Rr+Rr*Math.cos(a),y:cy+Rr*Math.sin(a),a:a+Math.PI/2,nx:Math.cos(a),ny:Math.sin(a)}}const e=s-arc;return{x:cx+Rr+e,y:cy-Rr,a:0,nx:0,ny:-1}};
  c.lineCap='butt';const road=(lw,col)=>{c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(cx,cy+L);c.lineTo(cx,cy);c.arc(cx+Rr,cy,Rr,Math.PI,Math.PI*1.5);c.lineTo(cx+Rr+L,cy-Rr);c.stroke()};
  road(Wd+6,GC.edge);road(Wd,GC.road);
  c.strokeStyle=GC.grey;c.lineWidth=4;for(let k=0;k<3;k++){const y=cy+Wd*0.6+k*Wd*0.55;c.beginPath();c.moveTo(cx-Wd*0.3,y+Wd*0.14);c.lineTo(cx,y-Wd*0.1);c.lineTo(cx+Wd*0.3,y+Wd*0.14);c.stroke()}
  const v=u*0.42,s0=-u*0.55,arc=Math.PI/2*Rr,S=Math.max(40,u*0.13);
  const sA=s0+v*t*0.93,pA=path(sA),inA=-Wd*0.27;gShipTop(c,pA.x+pA.nx*inA,pA.y+pA.ny*inA,pA.a,S,{shell:sA>-Wd*1.6&&sA<arc+Wd*0.4});
  let sB=s0+v*t,offB=-Wd*0.27,hit=false;if(sB>0){const f=Math.min(1,sB/(arc*0.55));offB=-Wd*0.27+f*Wd*0.67;if(f>=1){hit=true;const over=sB-arc*0.55;sB=arc*0.55+over*0.45}}
  const pB=path(sB);gShipTop(c,pB.x+pB.nx*offB,pB.y+pB.ny*offB,pB.a+(sB>0&&sB<arc?0.25:0),S,{ghost:true});
  if(hit&&(t*10|0)%3){c.fillStyle='rgba(255,74,61,.6)';c.beginPath();c.arc(pB.x+pB.nx*Wd*0.5,pB.y+pB.ny*Wd*0.5,S*0.35,0,TAU);c.fill()}
  const tx=Math.max(14,w*0.03);gLabel(c,tx,26,'NOSE UP THROUGH THE TIGHT CORNER',GC.ink);gLabel(c,tx,46,'full colour: nose up · grey shell · more steering',GC.grey);gLabel(c,tx,66,'faded: level · runs wide'+(hit?' · into the wall':''),hit?GC.red:GC.dim)}
/* the three effects side by side */
function gColours(c,w,h){const S=Math.max(36,Math.min(80,w*0.1)),y=h*0.5,cols=[[w*0.3,'GREEN LINES','nose matches the slope · faster',{lines:0.5+0.5*Math.abs(Math.sin(guide.t*0.6))},0.16],[w*0.7,'GREY SHELL','nose up · more grip',{shell:'grey'},-0.16]];
  c.strokeStyle=GC.edge;c.lineWidth=3;c.beginPath();c.moveTo(0,y+S*0.25);c.lineTo(w,y+S*0.25);c.stroke();
  for(const[x,t1,t2,o,a]of cols){gShipSide(c,x,y,a,S,o);gLabel(c,x,y+S*0.25+28,t1,o.shell==='red'?GC.red:o.shell?GC.grey:GC.green,'center');gLabel(c,x,y+S*0.25+46,t2,GC.dim,'center')}
  const mk=[['dive','green V · nose down'],['grip','grey Λ · nose up']],yy=h*0.18;mk.forEach(([m,txt],i)=>{const x=w*(0.3+0.4*i),col=GMARK[m][0];c.strokeStyle=col;c.fillStyle=col;c.lineWidth=5;c.beginPath();
    if(m==='dive'){c.moveTo(x-18,yy-8);c.lineTo(x,yy+8);c.lineTo(x+18,yy-8);c.stroke()}else if(m==='grip'){c.moveTo(x-18,yy+8);c.lineTo(x,yy-8);c.lineTo(x+18,yy+8);c.stroke()}else{c.fillRect(x-18,yy-9,36,6);c.fillRect(x-18,yy+3,36,6)}gLabel(c,x,yy+30,txt,GC.dim,'center')})}
$('guideBtn').onclick=()=>openGuide('opts');$('guideDone').onclick=closeGuide;
$('guideNext').onclick=()=>guideShow(guide.i+1);$('guidePrev').onclick=()=>guideShow(guide.i-1);
$('ctlBtn').onclick=()=>openCtl('opts');$('setBtn').onclick=()=>openSet('opts');$('musDone').onclick=closeMus;$('setDone').onclick=closeSet;$('ctlDone').onclick=closeCtl;
