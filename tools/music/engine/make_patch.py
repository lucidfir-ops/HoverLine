#!/usr/bin/env python3
"""Builds /home/claude/p43/p43_music.py from the parts in this folder (spec.py's table, engine_data.js,
engine_methods.js) and the list of edits below."""
import os, subprocess
H = os.path.dirname(os.path.abspath(__file__))
subprocess.run(['python3', os.path.join(H, 'spec.py')], check=True, stdout=subprocess.DEVNULL)
TABLE = open(os.path.join(H, 'tpl_table.js')).read()
DATA = open(os.path.join(H, 'engine_data.js')).read()
METH = open(os.path.join(H, 'engine_methods.js')).read()
R = []  # (anchor, replacement, count)
def r(a, b, n=1): R.append((a, b, n))
# ---- the sound lab: four kicks and a crushed noise hit for the templates
r("SL.KIT={kd:", """/* a crushed noise hit (Prototype 43): band-passed noise through a stepped curve, short and dry, for industrial */
SL.nzHit=o=>oc=>{const T=0.002,n=SL.noise(oc,0.2,o.seed),bp=oc.createBiquadFilter(),ws=oc.createWaveShaper(),g=oc.createGain();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=0.9;
  const a=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/1023*2-1;a[i]=Math.round(Math.tanh(x*4)*12)/12}ws.curve=a;n.connect(bp);bp.connect(g);g.connect(ws);ws.connect(oc.destination);
  g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(1,T+0.001);g.gain.setTargetAtTime(0,T+0.01,0.03);n.start(0)};
SL.KIT={kd:""")
r("rw:[1.8,null,0.3,{s:'rw',g:1}],wh:[1.85,null,0.26,{s:'wh',g:1}]};",
  """rw:[1.8,null,0.3,{s:'rw',g:1}],wh:[1.85,null,0.26,{s:'wh',g:1}],
  /* Prototype 43: a 909-style techno kick, a distorted industrial kick, a long 808 boom and a house kick (over the club kick) */
  k9:[0.45,SL.kick({f0:240,f1:62,f2:48,t1:0.03,dec:0.32,hold:0.012,click:0.35,sat:2.6,len:0.45}),0.3,{s:'kd',g:0.5,syn:0.9,hp:150,f:0.95}],
  ki:[0.5,SL.kick({f0:300,f1:70,f2:44,t1:0.025,dec:0.42,hold:0.02,click:0.5,sat:5,len:0.5}),0.27,{s:'kh',g:0.6,syn:0.85,hp:110,f:0.95}],
  k8:[0.9,SL.kick({f0:115,f1:52,f2:44,t1:0.06,dec:0.8,hold:0.05,click:0.1,sat:1.6,len:0.9}),0.3,null],
  kh:[0.32,SL.kick({f0:210,f1:60,f2:50,t1:0.03,dec:0.22,hold:0.01,click:0.3,sat:2.2,len:0.32}),0.3,{s:'km',g:0.8,syn:0.6,hp:80,f:0.95}],
  nz:[0.2,SL.nzHit({seed:131}),0.22,null]};""")
r("hits, tabla, pads, glitches and two breakbeats (loop_amen, loop_breakbeat)", "hits, tabla, pads, glitches and a breakbeat (loop_breakbeat; loop_amen was taken out in Prototype 43, as its rights are doubtful: the amen layer is now re-played from the kit)")
import json as _j
AROV=_j.load(open(os.path.join(H,'arovane.json')))
r("\nSL.EXT2={", "\n/* Prototype 43: Arovane's beat_a, b, d and e (Sonic Pi, CC0, donated by Uwe Zahn): two bars of each at 130 bpm, for the\n   break sequencer to chop. Decoded only for the templates that use them. */\nSL.EXT2={"+",".join('"%s":"%s"'%(k,v) for k,v in AROV.items())+",")
# ---- data: the templates and their tables (after SL, before SONGS)
r("const SONGS={ok:null", DATA + TABLE + "const SONGS={ok:null")
# ---- the fatiguing metallic sounds (all tunes, old codes too): the ride, the splash, crashes, the mark tree, brushes
r("shimmer:{n:'shimmer',pre:['x_mark',0.3],drop:['x_gong',0.26,'t'],brk:['x_markd',0.26],", "shimmer:{n:'shimmer',pre:['x_mark',0.15],drop:['x_gong',0.22,'t'],")
r("const K2_FL={dnb:[8,10,9],brk:[10,8,10],", "const K2_FL={dnb:[10,10,9],brk:[10,9,10],")
r("amen:{n:'amen break',loop:'x_loop_amen'}", "amen:{n:'amen break (re-played)',loop:'x_amen_r'}")
r("if(ph==='groove'&&s===0&&(bi===0&&(full||sec==='a'||sec==='b'||sec==='sw')||bi>0&&bi%(this.rA>1?4:8)===0&&(full||sec==='b')))this.crash(t,bi===0&&full?0.26:0.17);",
  "if(ph==='groove'&&s===0&&(bi===0&&(full||sec==='a'||sec==='b'||sec==='sw')||bi>0&&bi%(this.rA>1?8:16)===0&&(full||sec==='b')))this.crash(t,bi===0&&full?0.24:0.15);")
r("if(s===0&&this.fillAt===ab-1){this.crash(t);this.fillAt=-1}", "if(s===0&&this.fillAt===ab-1){this.crash(t,0.14);this.fillAt=-1}")
r("if(stg.ride&&s%4===0)this.ride(t,s%8===0?0.5:0.38)}", "if(stg.ride&&s%4===0)this.ride(t,s%8===0?0.36:0.26)}")
r("kickOff:n==='rw'||(n==='brk'&&!mb)||(n==='rise'&&(left===1||pre)),ride:!tr&&(n==='b'||(n==='drop'&&bl>999&&bi>=8)),",
  "kickOff:n==='rw'||n==='out'||(n==='brk'&&!mb)||(n==='rise'&&(left===1||pre)),ride:!tr&&!this.T&&this.st.rng%4===0&&(n==='b'||(n==='drop'&&bl>999&&bi>=8)),")
r("if(bi===0&&(n==='b'||n==='sw')&&!tr)this.fxS('s_sp',t,0.3);", "if(!this.T&&bi===0&&n==='sw'&&!tr&&this.st.rng%3===0)this.fxS('s_sp',t,0.22);")
r("else if(name==='boost'&&this.evo&&this.pos>=(this.boostNext||0)&&!(this.sec&&(this.sec[0]==='rise'||this.sec[0]==='rw'))){this.boostNext=this.pos+64;this.riser(t,0.9);this.crash(t+0.9,0.14)}",
  "else if(name==='boost'&&this.evo&&this.pos>=(this.boostNext||0)&&!(this.sec&&(this.sec[0]==='rise'||this.sec[0]==='rw'||this.sec[0]==='out'))){this.boostNext=this.pos+64;this.riser(t,0.9);if(!this.T&&this.pos>=(this.boostCr||0)){this.boostCr=this.pos+16*32;this.crash(t+0.9,0.12)}}")
# ---- the master: a trim per template (levels matched to the baseline)
r("this.out.connect(this.gapG);", "this.trimG=c.createGain();this.trimV=null;this.out.connect(this.trimG);this.trimG.connect(this.gapG);")
r("if(G.tex){if(s%2===0&&Math.random()<this.amb.dens*(ph==='ambient'?1:this.evo?0.5:0))this.sparkle(t,sd);", "if(G.tex){if(s%2===0&&Math.random()<this.amb.dens*(ph==='ambient'?1:this.evo&&!this.T?0.5:0))this.sparkle(t,sd);")
# ---- the re-played amen for the old percussion layer, once the kits exist
r("this.vbuf=Object.assign(this.vbuf||{},v);return this.kitP}).then(()=>this.renderKitX()).catch(()=>{});return this.extP},",
  "this.vbuf=Object.assign(this.vbuf||{},v);return this.kitP}).then(()=>this.renderKitX()).then(()=>{const k=this.kits&&this.kits[6]||this.kit0;return SL.brkRender(k,'amen',160).then(x=>{if(!x)return;const n=Math.round(16*x.sd*44100),b=new AudioBuffer({length:n,sampleRate:44100,numberOfChannels:1});b.getChannelData(0).set(x.b.getChannelData(0).subarray(0,n));this.vbuf.x_amen_r=b})}).catch(()=>{});return this.extP},")
# ---- memory and codes
r("const mFeat=st=>{", "const mFeat=st=>{if(st.tp){const T=TPL[st.tp-1]||{};return{tp:st.tp,tf:T.f,td:T.d,tl:T.l,tb:T.bs,k:st.key}}")
r("add(st){const a=this.get(),f=mFeat(st);", "add(st){const a=this.get(),f=mFeat(st);if(f.tp){try{const R=JSON.parse(store.get('hoverline.mtpl')||'[]');if(R[0]!==f.tp){R.unshift(f.tp);store.set('hoverline.mtpl',JSON.stringify(R.slice(0,48)))}}catch(e){}}")
r("function mPenalty(st,H){const f=mFeat(st);let p=0;",
  "function mPenalty(st,H){const f=mFeat(st);let p=0;if(f.tp){let R=[];try{R=JSON.parse(store.get('hoverline.mtpl')||'[]')}catch(e){}const j=Array.isArray(R)?R.indexOf(f.tp):-1;if(j>=0)p+=6*(1-j/48);"
  "H.forEach((h,i)=>{const w=Math.pow(0.82,i);if(!h.tp)return;if(h.tp===f.tp)p+=8*w;if(h.tf===f.tf)p+=2*w;if(h.td===f.td)p+=w;if(h.tl===f.tl)p+=0.6*w;if(h.tb===f.tb)p+=0.5*w;if(h.k===f.k)p+=0.3*w});return p}")
r("const codeOf=st=>{", "const codeOf=st=>{if(st.tp)return'S'+(st.tp&255).toString(16).toUpperCase().padStart(2,'0')+(((st.seed&0xFFFFF)|(st.kv&15)<<20|(st.vr&15)<<24)>>>0).toString(16).toUpperCase().padStart(8,'0');")
r("const parseTune=str=>{const m=/^([DTMN])", "const parseTune=str=>{{const q=/^S([0-9A-F]{2})([0-9A-F]{8})$/.exec((str||'').toUpperCase().replace(/[^S0-9A-F]/g,''));if(q){const id=parseInt(q[1],16),v=parseInt(q[2],16);return id>=1&&id<=TPL.length?music.tState(id,v&0xFFFFF,v>>>20&15,v>>>24&15):null}}const m=/^([DTMN])")
# ---- the engine
r("get bpm0(){", "get bpm0(){if(this.T)return this.T.b;")
r("fromTrack(seed){", "fromTrack(seed){if(!this.pinned){this.tSeed=seed;this.rSeq=0;this.rPrevF=null;const st=this.raceTune(0);this.raceHome={...st,mut:[...st.mut]};this.setState(st);return}")
r("newTune(){", "newTune(){const wasH=this.raceHome&&this.st&&codeOf(this.st)===codeOf(this.raceHome);")
r("mlog('tune',{why:'next',code:this.code(),prev:pc||undefined,played:pl})},",
  "mlog('tune',{why:'next',code:this.code(),tpl:this.T?this.T.id:undefined,prev:pc||undefined,played:pl});let room=false;try{room=!!mp.on}catch(e){}if(wasH&&!room&&this.mood!=='race'&&this.mood!=='count')this.raceHome={...this.st,mut:[...this.st.mut]}},")
r("freshTune(){", "freshTune(){return mFresh(()=>this.tRandom(rng((Math.random()*4294967296)>>>0),this.T?this.T.f:null),12);")
r("load(code){const st=parseTune(code);if(!st)return false;this.pinned=true;", "load(code){const st=parseTune(code);if(!st)return false;this.pinned=true;this.raceHome=null;")
r("info(){const st=this.st;if(!st)return'';", "info(){const st=this.st;if(!st)return'';if(this.T)return this.tInfo();")
r("setState(st,blend){this.st=st;", "setState(st,blend){this.swPl=null;this.st=st;")
r("build(){const st=this.st,", "build(){if(this.st&&this.st.tp)return this.buildT();this.T=null;const st=this.st,")
r("useKit(){if(!this.kit0)return;", "useKit(){if(!this.kit0)return;if(this.T){const k=this.T.kit;this.kit=k&&this.kits&&this.kits[k]||this.kit0;return}")
r("this.mi=(this.mi+1)%MOV.length;if(this.mi===6)this.evolve();this.sec=[MOV[this.mi][0],0,MOV[this.mi][1]]},",
  "const M=this.mv;this.mi=(this.mi+1)%M.length;if(this.mi===6&&!this.T)this.evolve();this.sec=[M[this.mi][0],0,M[this.mi][1]]},")
r("barSd(sd){const t0=this.tO;try{this.rxBar()}catch(e){}return this.tO!==t0?60/this.bpm/4:sd},",
  "barSd(sd){const t0=this.tO,b0=this.bpm;let sw=false;try{sw=this.swApply()}catch(e){}try{this.rxBar()}catch(e){}return this.tO!==t0||sw&&this.bpm!==b0?60/this.bpm/4:sd},")
r("const b0=this.bpm0,dn=b0>=150,K=dn?4:3;", "const b0=this.bpm0,dn=b0>=150,K=this.T?2:dn?4:3;")
r("R.tT=Math.min(Math.max(b0,dn?180:145),Math.max(Math.min(b0,dn?168:130),b0+R.tT))-b0;", "R.tT=this.T?Math.max(-2,Math.min(2,R.tT)):Math.min(Math.max(b0,dn?180:145),Math.max(Math.min(b0,dn?168:130),b0+R.tT))-b0;")
r("else n=(this.queue.length?this.queue[0]:MOV[(this.mi+1)%MOV.length])[0]}", "else n=(this.queue.length?this.queue[0]:this.mv[(this.mi+1)%this.mv.length])[0]}")
r("x2Keys(){const o=[],X=SL.EXT2;if(!X)return o;", "x2Keys(){if(this.T)return this.tX2(this.T);const o=[],X=SL.EXT2;if(!X)return o;")
r("finale(){if(this.pgOn)return this.pgFinal();",
  "finale(){if(this.pgOn)return this.pgFinal();const ns=this.swPl?((this.queue.find(q=>q[2])||[])[2]||null):null;"
  "if(ns&&this.phase==='groove'&&this.sec&&this.sec[0]==='out'){this.queue=[['rise',4,ns],['drop',1e9]];this.swPl={ns,how:'final lap'};return}this.finale0();"
  "if(ns){const ri=this.queue.findIndex(q=>q[0]==='rise');if(ri>=0&&this.sec&&this.sec[0]!=='rise'){this.queue[ri]=['rise',this.queue[ri][1],ns];this.swPl={ns,how:'final lap'}}else this.swPl=null}else this.swPl=null},\n  finale0(){")
r("this.gOff=0;this.raceK=0;const h=this.home||this.base;", "this.gOff=0;this.raceK=0;this.rSeq=0;this.rPrevF=null;this.swT0=null;this.swPl=null;const h=!this.pinned&&this.raceHome||this.home||this.base;")
r("this.nextT=t0;this.pos=Math.ceil(this.pos/16)*16;this.fxReset(t0);this.want=N?'pre':'drop';", "this.swPl=null;this.swT0=null;this.nextT=t0;this.pos=Math.ceil(this.pos/16)*16;this.fxReset(t0);this.want=N?'pre':'drop';")
r("listen(){if(!this.ctx||this.style==='off')return;if(this.pgOn)this.pgStop();this._final=false;this.finalPending=false;this.queue=[];",
  "listen(){if(!this.ctx||this.style==='off')return;if(this.pgOn)this.pgStop();this._final=false;this.finalPending=false;this.queue=[];this.swPl=null;")
r("toAmbient(){if(this.pgOn)this.pgStop();this.pgLate=false;this._final=false;this.finalPending=false;this.queue=[];",
  "toAmbient(){if(this.pgOn)this.pgStop();this.pgLate=false;this._final=false;this.finalPending=false;this.queue=[];this.swPl=null;")
r("blendNew(t){this.nextShuffle=t+150;", "blendNew(t){this.nextShuffle=t+90;")
r("if(!(this.nextShuffle>now))this.nextShuffle=now+150}", "if(!(this.nextShuffle>now))this.nextShuffle=now+90}")
r("setStyle(s){if(s!==this.style)this.mlog('mstyle',{style:s,was:this.style});this.style=s;store.set('hoverline.music',s);if(s!=='off'&&this.st){",
  "setStyle(s){if(s!==this.style)this.mlog('mstyle',{style:s,was:this.style});this.style=s;store.set('hoverline.music',s);"
  "if(s!=='off'&&this.st&&this.st.tp){if(!this.tSides().includes((TPL[this.st.tp-1]||{}).side))this.setState(this.freshTune());if(this.tSeed&&!this.pinned){const h=this.raceTune(0);this.raceHome={...h,mut:[...h.mut]}}}else if(s!=='off'&&this.st){")
r("if(ph==='ambient')return;", "if(ph==='ambient')return;if(this.T)return this.playT(t,sd,s);")
r("  play(t,sd){const s=this.pos%16;if(s===0)this.onBar(t,sd);if(this.pgOn||this.soOn)return;",
  "  pgH(){return!this.pinned&&this.raceHome||this.home},\n" + METH + "  play(t,sd){const s=this.pos%16;if(s===0)this.onBar(t,sd);if(this.pgOn||this.soOn)return;")
# ---- onBar: plan the tune change, the breakdown's filter, and keep the old evolving rules to old tunes
r("if(!fresh){this.sec[1]++;if(this.sec[1]>=this.sec[2])this.nextSection()}this.gb++;",
  "if(!fresh){this.sec[1]++;if(this.sec[1]>=this.sec[2])this.nextSection()}this.gb++;if(this.T){const[n0,b0,l0]=this.sec;if(n0==='drop'&&b0===0&&this.swT0==null)this.swT0=t;try{this.swPlanAt(t,bd,n0,b0,l0)}catch(e){}if(n0==='out'&&b0===0)this.cutOv={t0:t,t1:t+l0*bd,f0:Math.min(18000,this.moodCut||18000),f1:1400};if(b0===0)this.tTrim(t,bd)}else if(this.trimV!==1&&this.trimG)this.tTrim(t,0.05)")
r("if(n==='brk'&&bi===0&&this.wantShuffle(t)){this.blendNew(t)}else if(n==='brk'&&bi===0&&this.wantRaceBlend()&&(this.brkN=(this.brkN||0)+1)%2===0)this.blendRace(t)",
  "if(this.T){}else if(n==='brk'&&bi===0&&this.wantShuffle(t)){this.blendNew(t)}else if(n==='brk'&&bi===0&&this.wantRaceBlend()&&(this.brkN=(this.brkN||0)+1)%2===0)this.blendRace(t)")
r("if(this.evo){if(rb===99&&bi===0){", "if(this.T){}else if(this.evo){if(rb===99&&bi===0){")
r("this.stage={hatDense:n!=='brk'&&!(n==='rise'&&left>4),kickV:n==='rise'&&left>4?.7:1,bassFull:n!=='rise',snareFull:n!=='rise'||left>4,",
  "this.stage={hatDense:n!=='brk'&&n!=='out'&&!(n==='rise'&&left>4),kickV:n==='rise'&&left>4?.7:1,bassFull:n!=='rise'&&n!=='out',snareFull:n!=='rise'||left>4,")
r("fillBar:(n==='drop'||n==='b'||n==='a'||n==='sw')&&(bi%8===7||left===1)", "fillBar:(n==='drop'||n==='b'||n==='a'||n==='sw'||n==='solo'||n==='drum')&&(bi%8===7||left===1)")
r("if(n==='drop'&&left===1&&bl===16&&!this._final&&!this.rwDone&&", "if(n==='drop'&&left===1&&bl===16&&!this.swPl&&!this._final&&!this.rwDone&&")
r("if(left===1&&this.kit&&this.kit.wh){const nx=this.queue.length?this.queue[0][0]:MOV[(this.mi+1)%MOV.length][0];if((nx==='brk'||nx==='sw')&&!(n==='drop'&&this.rwAt>t)){",
  "if(left===1&&this.kit&&this.kit.wh){const nx=this.queue.length?this.queue[0][0]:this.mv[(this.mi+1)%this.mv.length][0];if((nx==='out'||(nx==='brk'||nx==='sw')&&(!this.T||this.T.fx.includes('wh')))&&!(n==='drop'&&this.rwAt>t)){")
r("revCrash(tD){const b=this.kit&&this.kit.rc;if(!b)return;const t0=tD-b.duration;if(t0>this.ctx.currentTime+0.01)this.playS(b,t0,0.55,this.fxIn)},", "revCrash(tD){const b=this.kit&&this.kit.rc;if(!b)return;const t0=tD-b.duration;if(t0>this.ctx.currentTime+0.01)this.playS(b,t0,this.T?0.38:0.55,this.fxIn)},")
r("if(n==='drop'&&bi===0&&bl>999)this.fxS('s_cb',t,0.6,this.fxIn);", "if(n==='drop'&&bi===0&&bl>999)this.fxS('s_cb',t,this.T?0.42:0.6,this.fxIn);")
r("if(this.rA||this.rE)this.rxLv(lv);", "if(this.T&&lv&&this.sec&&this.sec[0]==='rise'){lv.snare=(lv.snare||0)*0.7;lv.pad=(lv.pad||0)*0.7;lv.hat=(lv.hat||0)*0.85}if(this.rA||this.rE)this.rxLv(lv);")
r("if(left===R)this.riser(t,R*bd-2*sd,pre?0.2:0.24);", "if(left===R)this.riser(t,R*bd-2*sd,(pre?0.2:0.24)*(this.T?0.6:1));")
r("if(b===B.full+4&&this.evo)this.mutateNow();", "if(b===B.full+4&&this.evo&&!this.T)this.mutateNow();")
r("this.phase='groove';fresh=true;this.hb=32-N;", "this.phase='groove';fresh=true;this.swT0=null;this.hb=32-N;")
r("rw:{pad:0,tex:0,kick:0,snare:0,hat:0,bass:0,lead:0,arp:0,keys:0}};",
  "rw:{pad:0,tex:0,kick:0,snare:0,hat:0,bass:0,lead:0,arp:0,keys:0}};\n/* Prototype 43 sections: a solo (lighter drums under a solo instrument), drums only, and the two bars an old tune breaks down for before the next one builds */\n"
  "LV.solo={pad:.6,tex:.1,kick:.85,snare:.8,hat:.8,bass:.85,lead:.85,arp:.25,keys:.5};LV.drum={pad:0,tex:0,kick:1,snare:1,hat:1,bass:.3,lead:0,arp:0,keys:0};LV.out={pad:.95,tex:.3,kick:0,snare:0,hat:.35,bass:0,lead:.4,arp:.3,keys:.75};")
# ---- Pregen: one tune per race (the track's first), in the standard sections; template tempos
r("const bp=H.hook?bpOf(H):null,bpm=bp&&!H.mx?bp.bpm:H.style?138:174,", "const bp=H.hook?bpOf(H):null,bpm=H.tp?TPL[H.tp-1].b:bp&&!H.mx?bp.bpm:H.style?138:174,")
r("Object.assign(E,{ctx:null,timer:null,onChange:null,pg:null,pgOn:false,pgLate:false,soOn:false,pgF:null,kickQ:[],shuffle:false,pinned:true,irB:null});",
  "Object.assign(E,{ctx:null,timer:null,onChange:null,pg:null,pgOn:false,pgLate:false,soOn:false,pgF:null,kickQ:[],shuffle:false,pinned:true,irB:null,pgE:true});")
r("const oc=new OfflineAudioContext(2,len,SR);await graph(oc);const a=performance.now();state();main+=performance.now()-a;bar(0,0);",
  "const oc=new OfflineAudioContext(2,len,SR);await graph(oc);const a=performance.now();state();if(E.tP)await E.tP;main+=performance.now()-a;bar(0,0);")
r("if(snap)put(snap);await graph(c2);if(!snap){const z=performance.now();state();main+=performance.now()-z}",
  "if(snap)put(snap);await graph(c2);if(!snap){const z=performance.now();state();if(E.tP)await E.tP;main+=performance.now()-z}")
r("if(this.modeEff()!=='pre'||this.style==='off'||!this.ctx||!this.home)return;const c=codeOf(this.home);", "if(this.modeEff()!=='pre'||this.style==='off'||!this.ctx||!this.pgH())return;const c=codeOf(this.pgH());")
r("async pgRender(){const H=this.home;", "async pgRender(){const H=this.pgH();")
r("this.pgBusy=null;this.changed();if(this.home&&codeOf(this.home)!==code)this.pgWant(true)},", "this.pgBusy=null;this.changed();if(this.pgH()&&codeOf(this.pgH())!==code)this.pgWant(true)},")
r("P.code!==codeOf(this.home||this.st)", "P.code!==codeOf(this.pgH()||this.st)")
r("const nx=this.queue.length?this.queue[0]:MOV[(this.mi+1)%MOV.length],o={drop:0,b:16,brk:32,rise:40}[nx[0]];", "const nx=this.queue.length?this.queue[0]:this.mv[(this.mi+1)%this.mv.length],o={drop:0,b:16,brk:32,rise:40}[nx[0]];")
r("music.pg&&music.home&&music.pg.code===codeOf(music.home)", "music.pg&&music.pgH()&&music.pg.code===codeOf(music.pgH())")
# ---- race logs: which template the race started on
r("music:{style:music.style,both:music.style==='both'?music.both:undefined,code:music.code(),", "music:{style:music.style,both:music.style==='both'?music.both:undefined,code:music.code(),tpl:music.T?music.T.id:undefined,tname:music.T?music.T.n:undefined,")

README_OLD = "loop_amen and loop_breakbeat."
README_NEW = ("loop_breakbeat (loop_amen was taken out in Prototype 43: it appears to be sampled from the Winstons' \"Amen, Brother\", so its CC0 tag can't be relied on).\n"
 "- Breaks, sitar and sirens (Prototype 43): the amen and the Think-style funk break are re-played from the CC0 drum hits above (the patterns, never the records); the sitar is synthesised in the browser (a plucked string with a buzzing bridge and sympathetic strings); sirens, the industrial kicks and the crushed noise hits are synthesised too.\n- More breaks (Prototype 43): Arovane's beat_a, beat_b, beat_d and beat_e from the Sonic Pi sample pack (CC0, donated by Uwe Zahn), two bars of each, chopped by the break sequencer.")

def lit(x): return repr(x)
out = ['# Prototype 43 (music): song templates. 106 blueprints from Eric\'s documents (the agnostic racing guide, the 200',
 '# classic blueprints, the MIDI guide) and his voice note pin each new tune\'s sub-genre, tempo, drum language, bassline, key,',
 '# progression, what the melody may be (often no hook at all), instruments, structure and effects; the notes are still',
 '# written live. In a race the tune changes every 90 s at a phrase line (a breakdown into the next tune\'s build, or a',
 '# fill), in the same sequence for everyone in a room; the menu\'s music moves on every 90 s like a radio. The ride, the',
 '# splash, crashes, the mark tree and the brush kit are much rarer. The amen is re-played from CC0 hits (the Sonic Pi',
 '# loop_amen recording is removed), the sitar is modelled, sirens and new kicks are synthesised. Music only: races are',
 '# unchanged. P=path to hoverline.html (R=path to README.md, optional: adds the credits).',
 'import os', "P=os.environ.get('P','/home/claude/hoverline/src/hoverline.html')", "s=open(P,encoding='utf-8').read()",
 'def rep(a,b,n=1):', '    global s', '    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)',
 "assert 'const TPL=[' not in s,'already applied'",
 "i=s.find('\"x_loop_amen\":\"');assert i>0,'amen data';j=s.find('\"',i+15);rep(s[i:j+2],'')"]
for a, b, n in R: out.append('rep(%s,%s%s)' % (lit(a), lit(b), '' if n == 1 else ',%d' % n))
out += ["open(P,'w',encoding='utf-8').write(s)",
 "RM=os.environ.get('R')",
 "if RM:",
 "    m=open(RM,encoding='utf-8').read()",
 "    if 'Prototype 43' not in m:",
 "        assert m.count(%s)==1,'README anchor'" % lit(README_OLD),
 "        open(RM,'w',encoding='utf-8').write(m.replace(%s,%s))" % (lit(README_OLD), lit(README_NEW)),
 "print('p43_music ok')"]
open('/home/claude/p43/p43_music.py', 'w').write('\n'.join(out) + '\n')
print('wrote /home/claude/p43/p43_music.py', sum(len(x) for x in out) // 1024, 'KB,', len(R), 'edits')
