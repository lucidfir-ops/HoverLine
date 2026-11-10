//# music/engine/035-music-object.js: the music object opens here: mode, Lite, buses, reverb and delay (the next 14 files continue it)
const music={kr:true,lite:(()=>{const v=store.get('hoverline.alite');return v?v==='1':(navigator.deviceMemory||4)<=2})(),shuffle:store.get('hoverline.shuffle')!=='0',nextShuffle:0,kit:null,gtr:null,voicesOn:false,style:store.get('hoverline.music')||'dnb',both:store.get('hoverline.mboth')||'blend',evo:store.get('hoverline.mevo')!=='0',gOff:0,ctx:null,st:null,base:null,pos:0,nextT:0,timer:null,_final:false,finalPending:false,pinned:false,movement:0,
  phase:'ambient',want:null,pb:0,hb:0,gb:0,sec:null,mi:0,queue:[],lvT:{},gate:{},stage:{},padUntil:0,revealAt:-1,themeChanged:false,leadEv:null,leadGrid:0,echo:false,leadCache:{},
  amb:{deg:0,left:0,n:0,cc:0,dens:0.14,walk:3,mode:'spark',tim:0,tonic:false,omen:false},
  live:{steer:0,brake:0,boost:0,rank:0.5,speed:0},drift:1,lastDrift:1,glitch:0,fillAt:-1,mood:'menu',moodCut:5200,buildT0:-1,cutT:0,lastLead:null,onChange:null,
  get final(){return this._final},set final(v){this._final=!!v;if(v)this.finale()},
  init(oc){const c=oc||audio.ctx;if(!c||this.ctx)return;this.ctx=c;this.dly16=this.dly8t=null;
    this.out=c.createGain();this.out.gain.value=0.3;
    this.lp=c.createBiquadFilter();this.lp.type='lowpass';this.lp.frequency.value=this.moodCut;this.lp.Q.value=0.6;this.cutR=null;
    /* master: a touch of air, a glue compressor, a gentle soft clip and a fast limiter */
    const air=c.createBiquadFilter();air.type='highshelf';air.frequency.value=8500;air.gain.value=2.5;
    const comp=this.comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=8;comp.ratio.value=3;comp.attack.value=0.01;comp.release.value=0.2;
    const clip=c.createWaveShaper();{const n=2048,a=new Float32Array(n);for(let i=0;i<n;i++){const x=(i/(n-1)*2-1)*1.5;a[i]=Math.tanh(1.1*x)/1.1}clip.curve=a} /* unity gain for small signals, rounding only the peaks */const lim=c.createDynamicsCompressor();lim.threshold.value=-2.5;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=0.002;lim.release.value=0.06;
    this.gapG=c.createGain();this.hp=c.createBiquadFilter();this.hp.type='highpass';this.hp.frequency.value=10;this.hp.Q.value=0.7;this.fxIn=c.createGain();
    this.trimG=c.createGain();this.trimV=null;this.out.connect(this.trimG);this.trimG.connect(this.gapG);this.gapG.connect(this.lp);this.lp.connect(this.hp);this.hp.connect(air);this.fxIn.connect(air);air.connect(comp);comp.connect(clip);clip.connect(lim);lim.connect(oc?oc.destination:audio.musG&&audio.musG.context===c?audio.musG:audio.master);
    /* shared send levels: notes connect to one send per amount instead of each making its own */
    this.sends=new Map();
    /* wavetables: a 30% pulse for the square leads */
    {const N=48,re=new Float32Array(N),im=new Float32Array(N);for(let k=1;k<N;k++)re[k]=2/(k*Math.PI)*Math.sin(Math.PI*k*0.3);this.waves={pwm:c.createPeriodicWave(re,im)}}
    this.pump=c.createGain();this.pump.connect(this.out);this.pumpB=c.createGain();this.pumpB.connect(this.out);this.pumpK=c.createGain();this.pumpK.connect(this.out);this.gR=null;
    /* one reverb for everything (the hall sends feed it harder), with early reflections and a tail that darkens */
    this.rev=c.createConvolver();this.rev.buffer=oc&&this.irB&&this.irB.sampleRate===c.sampleRate?this.irB:SL.ir(c,this.lite?1.3:2.1,0.55,true);if(oc)this.irB=this.rev.buffer;const rg=c.createGain();rg.gain.value=0.32;{const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=240;h.Q.value=0.6;this.rev.connect(h);h.connect(rg)}rg.connect(this.out);
    this.dly=c.createDelay(2);this.dlyFb=c.createGain();this.dlyFb.gain.value=0.36;const dlp=c.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2600;
    this.dly.connect(dlp);dlp.connect(this.dlyFb);this.dlyFb.connect(this.dly);const dhp=c.createBiquadFilter();dhp.type='highpass';dhp.frequency.value=260;dhp.Q.value=0.6;dlp.connect(dhp);const dg=this.dg=c.createGain();dg.gain.value=this.evo?0.45:0.3;dhp.connect(dg);if(!this.evo)this.dlyFb.gain.value=0.3;
    /* stereo: the echo bounces left then right; pads, arps and answers are widened with a short offset between the sides */
    const pan=(x,to)=>{const n=c.createStereoPanner?c.createStereoPanner():c.createGain();if(n.pan)n.pan.value=x;n.connect(to);return n};
    dg.connect(pan(-0.7,this.out));this.dly2=c.createDelay(1);const d2g=c.createGain();d2g.gain.value=0.75;dhp.connect(this.dly2);this.dly2.connect(d2g);d2g.connect(pan(0.7,this.out));
    this.wide=(src,to)=>{if(this.lite)return src.connect(to);src.connect(pan(-0.75,to));const d=c.createDelay(0.05);d.delayTime.value=0.014;src.connect(d);d.connect(pan(0.75,to))};
    /* saturation stages: a curve, a gain into it and one out of it, optional tone filters */
    const curve=k=>{const n=1024,a=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;a[i]=Math.tanh(k*x)/Math.tanh(k)}return a};
    this.drive=(to,o)=>{const pre=c.createGain(),ws=c.createWaveShaper(),post=c.createGain();pre.gain.value=o.pre;ws.curve=curve(o.k);ws.oversample='2x';post.gain.value=o.post;pre.connect(ws);let last=ws;
      if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=0.7;last.connect(f);last=f}if(o.hp){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;last.connect(f);last=f}
      last.connect(post);post.connect(to);return pre};
    this.drum=this.drive(this.out,{pre:1.3,k:1.6,post:0.82});
    /* lead: a sidechain gain (ducked by kick and snare for patches that want it) and a 150 Hz high-pass to leave room for the sub */
    this.voxG=c.createGain();this.voxG.gain.value=0.9;this.voxG.connect(this.out);this.send(this.voxG,this.rev,0.35);this.send(this.voxG,this.dly,0.25);
    this.pumpL=c.createGain();const hpL=c.createBiquadFilter();hpL.type='highpass';hpL.frequency.value=150;this.pumpL.connect(hpL);hpL.connect(this.out);
    this.hall=c.createGain();this.hall.gain.value=1.35;this.hall.connect(this.rev);
    /* the 1/16 and 1/8-triplet echoes are only built when a tune needs them (an idle feedback loop still costs) */
    this.mkEcho=(fb,pn,lp)=>{const d=c.createDelay(1),f=c.createGain(),l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=lp;f.gain.value=fb;d.connect(l);l.connect(f);f.connect(d);l.connect(pan(pn,this.out));return d};
    const wl=c.sampleRate*3;this.wbuf=c.createBuffer(1,wl,c.sampleRate);const wd=this.wbuf.getChannelData(0);for(let i=0;i<wl;i++)wd[i]=Math.random()*2-1;
    this.hpF={};this.hpV={};this.bus={};for(const k of LAYERS){const g=c.createGain();g.gain.value=0;const to=k==='bass'?this.pumpB:k==='keys'?this.pumpK:k==='pad'||k==='amb'||k==='arp'||k==='echo'?this.pump:k==='kick'||k==='snare'||k==='hat'?this.drum:this.out;
      if(k==='pad'||k==='arp'||k==='resp'||k==='amb'||k==='keys'){const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=MHP[k];h.Q.value=0.6;g.connect(h);this.wide(h,to);this.hpF[k]=h;this.hpV[k]=MHP[k]}else if(k==='hat')g.connect(pan(0.22,to));else if(k==='lead')g.connect(this.pumpL);else g.connect(to);this.bus[k]=g;this.lvT[k]=0;this.gate[k]=false}this.cymF=c.createGain();this.cymF.gain.value=0;this.cymF.connect(pan(0.22,this.out));this.cymP=0;
    this.dB=this.drive(this.bus.bass,{pre:3,k:2,post:0.24});            // drum & bass: a little growl on the bass
    this.gtrB=this.drive(this.bus.bass,{pre:9,k:6,post:0.13,lp:3600,hp:90}); // metal: rhythm guitar
    this.gtrL=this.drive(this.bus.lead,{pre:7,k:5,post:0.078,lp:4600,hp:180}); // metal: lead guitar
    this.gtrR=this.drive(this.bus.resp,{pre:9,k:6,post:0.1,lp:3400,hp:90});  // metal: answering chugs
    this.dR=this.drive(this.bus.resp,{pre:3,k:2.5,post:0.2});               // reese answers
    this.clipL=this.drive(this.bus.lead,{pre:8,k:10,post:0.085});this.clipD=this.drive(this.bus.lead,{pre:8,k:10,post:0.052,lp:3800});            // hard-clipped saw lead
    this.dN=this.drive(this.bus.bass,{pre:5,k:4,post:0.16});                  // neuro reese
    if(this.st){const b=this.bpm;this.dly.delayTime.value=60/b*0.75;this.dly2.delayTime.value=60/b*0.375}this.dlyB=this.st?this.bpm:null;
    this.xhp=null;if(oc){this.readyP=this.loadVoices().catch(()=>{});return}this.extP=null;this.kits={};this.readyP=Promise.all([this.renderKit(),this.loadVoices(),this.renderGuitars(),this.decodeVox(c,k=>k[0]!=='v').then(v=>{SL.tame('s_sp',v);this.vbuf=Object.assign(v,this.vbuf||{})})]).then(()=>this.lite?null:this.ensureExt()).catch(()=>{})},
  /* the Prototype 34 samples, trimmed at their first onset like the drums; then the extra kits */
  ensureExt(){if(this.extP||!this.ctx||!SL.EXT)return this.extP;const c=this.ctx;
    this.extP=this.decodeVox(c,()=>true,SL.EXT).then(v=>{for(const[k,b]of Object.entries(v)){try{const x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));
        let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_loop')){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}SL.tame(k,v)}
      this.vbuf=Object.assign(this.vbuf||{},v);return this.kitP}).then(()=>this.renderKitX()).then(()=>{const k=this.kits&&this.kits[6]||this.kit0;return SL.brkRender(k,'amen',160).then(x=>{if(!x)return;const n=Math.round(16*x.sd*44100),b=new AudioBuffer({length:n,sampleRate:44100,numberOfChannels:1});b.getChannelData(0).set(x.b.getChannelData(0).subarray(0,n));this.vbuf.x_amen_r=b})}).catch(()=>{});return this.extP},
