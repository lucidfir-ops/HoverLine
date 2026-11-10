//# music/engine/036-sound-lab-voices.js: music: loading and rendering the sound lab's voices
//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.
  /* ---- the sound lab at work ---- */
  /* the CC0 recordings: base64 MP3 → samples, with the decoder's leading silence trimmed off at the first onset */
  async decodeVox(c,keep,src=SL.VOX){const out={};if(!src||!c.decodeAudioData)return out;await Promise.all(Object.entries(src).filter(([k])=>keep(k)).map(async([k,b64])=>{try{const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
      out[k]=await new Promise((res,rej)=>{const p=c.decodeAudioData(u.buffer,res,rej);if(p&&p.then)p.then(res,rej)})}catch(e){}}));return out},
  async decodeSamples(){const c=this.ctx,out={};if(!SL.SMP||!c.decodeAudioData)return out;
    await Promise.all(Object.entries(SL.SMP).map(async([k,b64])=>{try{const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
      const buf=await new Promise((res,rej)=>{const p=c.decodeAudioData(u.buffer,res,rej);if(p&&p.then)p.then(res,rej)});
      const x=buf.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));if(!pk)return;
      let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;out[k]=x.slice(Math.max(0,i0-Math.round(buf.sampleRate*0.0005)))}catch(e){}}));
    return out},
  renderKit(){return this.kitP=this.renderKit0()},
  async renderKit0(){const c=this.ctx,sr=c.sampleRate,kit={},smp=await this.decodeSamples().catch(()=>({}));this.smpN=Object.keys(smp).length;this.synX={};
    const peak=x=>{let p=0;for(let i=0;i<x.length;i++)p=Math.max(p,Math.abs(x[i]));return p||1};
    for(const[k,[len,build,lvl,lay]]of Object.entries(SL.KIT)){const sb=lay&&smp[lay.s];if(!build&&!sb)continue;
      try{const n=Math.ceil(sr*Math.max(len,sb?sb.length/sr:0)),d=new Float32Array(n);
        /* layered pieces keep the loudness (RMS over the first w ms) the synth version had at its peak level, times f,
           so the mix balance carries over; the peak is capped */
        const W=Math.round(sr*(lay&&lay.w||120)/1000),rms=x=>{let a=0;const m=Math.min(W,x.length);for(let i=0;i<m;i++)a+=x[i]*x[i];return Math.sqrt(a/m)||1e-9};let target=0;
        if(build){const oc=new OfflineAudioContext(1,Math.ceil(sr*len),sr);build(oc);const x=(await oc.startRendering()).getChannelData(0),px=peak(x),g=(sb?lay.syn:1)/px;target=rms(x)/px*lvl*(lay&&lay.f||1);this.synX[k]=x;for(let i=0;i<x.length&&i<n;i++)d[i]=x[i]*g}
        if(sb){const y=sb.slice();if(lay.hp){SL.hp1(y,sr,lay.hp);SL.hp1(y,sr,lay.hp)}const g=(lay.g||1)/peak(y);for(let i=0;i<y.length;i++)d[i]+=y[i]*g}
        let g=lvl/peak(d);if(sb&&target)g=Math.min(target/rms(d),0.5/peak(d));const b=c.createBuffer(1,n,sr),o=b.getChannelData(0);for(let i=0;i<n;i++)o[i]=d[i]*g;kit[k]=b}catch(e){if(build)return}}
    /* reverse crash: the crash's first 1.3 s backwards, swelling into the hit it ends on */
    if(kit.cr){const x=kit.cr.getChannelData(0),L=Math.min(x.length,Math.round(sr*1.3)),b=c.createBuffer(1,L,sr),o=b.getChannelData(0);for(let i=0;i<L;i++)o[i]=x[L-1-i]*Math.pow(i/L,1.2);const fo=Math.round(sr*0.06);for(let i=0;i<fo;i++)o[L-1-i]*=Math.pow(i/fo,1.6);SL.biq(o,sr,'lp',6500,0.7);kit.rc=b}
    this.kit0=this.kit=kit;this.kits={};this.useKit()},
  /* a kit piece from its synth layer and another recording, mixed as renderKit mixes the originals */
  mixPiece(k,x,sb,lay){const c=this.ctx,sr=c.sampleRate,[len,,lvl]=SL.KIT[k],peak=a=>{let p=0;for(let i=0;i<a.length;i++)p=Math.max(p,Math.abs(a[i]));return p||1};
    const n=Math.ceil(sr*Math.max(len,sb.length/sr)),d=new Float32Array(n),W=Math.round(sr*(lay.w||120)/1000),rms=a=>{let q=0;const m=Math.min(W,a.length);for(let i=0;i<m;i++)q+=a[i]*a[i];return Math.sqrt(q/m)||1e-9};let target=0;
    if(x){const px=peak(x),g=lay.syn/px;target=rms(x)/px*lvl*(lay.f||1);for(let i=0;i<x.length&&i<n;i++)d[i]=x[i]*g}
    const y=sb.slice();if(lay.hp){SL.hp1(y,sr,lay.hp);SL.hp1(y,sr,lay.hp)}const gy=(lay.g||1)/peak(y);for(let i=0;i<y.length;i++)d[i]+=y[i]*gy;
    let g=lvl/peak(d);if(target)g=Math.min(target/rms(d),0.5/peak(d));const b=c.createBuffer(1,n,sr),o=b.getChannelData(0);for(let i=0;i<n;i++)o[i]=d[i]*g;return b},
  renderKitX(){const V=this.vbuf;if(!V||!this.kit0)return;
    for(const[v,K]of Object.entries(KITX)){const kit={...this.kit0};for(const[k,spec]of Object.entries(K.p)){const[name,ov]=Array.isArray(spec)?spec:[spec,{}],b=V[name];if(!b||!SL.KIT[k])continue;
        try{kit[k]=this.mixPiece(k,this.synX[k]||null,b.getChannelData(0),{g:1,syn:0.5,...(SL.KIT[k][3]||{}),...ov})}catch(e){}}this.kits[v]=kit}
    this.useKit()},
  useKit(){if(!this.kit0)return;if(this.T){const k=this.T.kit;this.kit=k&&this.kits&&this.kits[k]||this.kit0;return}const v=this.st?(this.st.kx||0)&7:0;this.kit=this.kit2&&this.kits&&this.kits[this.kit2]||(v&&this.fk!=='metal'||v===6)&&this.kits&&this.kits[v]||this.kit0},
  /* a slice of a recording (breakbeats) */
  slice(buf,t,off,dur,rate,v,dest){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=buf;src.playbackRate.value=rate;g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+Math.max(0.005,dur-0.012));g.gain.linearRampToValueAtTime(0,t+dur);
    src.connect(g);g.connect(dest);src.start(t,off,dur*rate+0.02);src.stop(t+dur+0.03);src.onended=()=>{try{g.disconnect()}catch(e){}};return g},
  renderGuitars(){const c=this.ctx,sr=c.sampleRate,g={o:[],m:[]};
    return new Promise(res=>{let pc=0;const step=()=>{try{const midi=40+((pc-4+12)%12);for(const mute of[false,true]){const d=SL.gtr(sr,midi,mute),b=c.createBuffer(1,d.length,sr);b.copyToChannel?b.copyToChannel(d,0):b.getChannelData(0).set(d);g[mute?'m':'o'][pc]=b}}catch(e){return res()}
      if(++pc<12)setTimeout(step,0);else{this.gtr=g;res()}};setTimeout(step,0)})},
  async loadVoices(){const c=this.ctx;if(!c.audioWorklet||typeof AudioWorkletNode==='undefined')return;
    try{const url=URL.createObjectURL(new Blob([SL.WORKLET],{type:'application/javascript'}));await c.audioWorklet.addModule(url);
      const mk=dest=>{const n=new AudioWorkletNode(c,'hl-mono',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1]});n.connect(dest);return n};
      this.vB=mk(this.bus.bass);this.vA=mk(this.bus.lead);this.vP=mk(this.bus.arp);this.send(this.vA,this.dly,0.35);this.send(this.vA,this.rev,0.2);this.send(this.vP,this.dly,0.22);this.voicesOn=true}catch(e){this.voicesOn=false}},
  /* one note on a mono voice; o uses the same names as saw() */
  mono(V,m,t,dur,o){V.port.postMessage({t,d:dur,f:mtof(m),v:o.vol*(o.cal||1),vo:Math.max(1,Math.min(3,this.lite?Math.min(2,o.voices||1):o.voices||1)),dt:o.spread||0,w:{square:1,triangle:2,sine:3,fm:4}[o.type]||0,pe:o.pe||0,pt:o.peT||0.03,fold:o.fold||0,ring:o.ring||0,crush:o.crush||0,fm:o.fm||0,fr:o.fr||1,vr:o.vib?o.vib.rate:0,vd:o.vib?o.vib.depth:0,sub:o.sub||0,cut:o.cut||800,env:o.env||0,et:(o.envT||0.2)/2.5,
    k:o.k!=null?o.k:Math.max(0,Math.min(3.4,((o.q||o.res||0.8)-0.7)*0.75)),dr:o.dr||1,gl:o.glide&&o.from!=null?o.glide:0,wr:o.wob?o.wob.rate:0,wd:o.wob?o.wob.depth:0,a:o.a||0.003,r:o.rel||0.03})},
  /* bass notes: the mono voice when it is running (drive stages map to its own drive), the live synth otherwise */
  bassNote(m,t,dur,o){if(o.syn&&SYN.P[o.syn])return SYN.play(o.syn,t,m,dur,o.vol>1.1?1:0.85,{dest:this.bus.bass,accent:o.vol>1.1?1:0,slide:o.from!=null,rx:this.rA||0,eng:this});if(this.rA)o=this.rxBass(o);if(this.voicesOn&&this.vB){const dr=(o.dest===this.dN?4:o.dest===this.dB?2.2:1)*(o.rxD||1);this.mono(this.vB,m,t,dur,{...o,dr,cal:o.cal||0.65,cut:(o.cut||800)*2.2,env:(o.env||0)*1.5,sub:(o.sub||0)*0.5});return}this.saw(m,t,dur,o)},
  /* a rendered sample: an optional length (faded out at the end) and playback rate */
  playS(buf,t,v,dest,dur=0,rate=1){const c=this.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=buf;if(rate!==1)src.playbackRate.value=rate;g.gain.value=v;src.connect(g);g.connect(dest);src.start(t);
    if(dur){g.gain.setValueAtTime(v,t+Math.max(0.005,dur-0.015));g.gain.linearRampToValueAtTime(0,t+dur);src.stop(t+dur+0.02)}src.onended=()=>{try{g.disconnect()}catch(e){}};return g},
  ensureEchoes(){if(this.dly16||!this.mkEcho)return;this.dly16=this.mkEcho(0.55,0.4,3500);this.dly8t=this.mkEcho(0.35,-0.4,2800);const b=this.bpm;this.dly16.delayTime.value=60/b/4;this.dly8t.delayTime.value=60/b/3},
  get bpm0(){if(this.T)return this.T.b;return this.bp&&!(this.st&&this.st.mx)?this.bp.bpm:this.st&&this.st.style?138:174},get bpm(){return this.bpm0+this.tO},
