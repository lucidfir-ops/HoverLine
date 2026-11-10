//# music/026-tabla-bols.js: spoken tabla bols with the tabla answering (about once an hour)
/* ---- tabla bols (Prototype 45): now and then (at most once every few tunes, in a tune with a tabla layer) a
   breakdown has a call and answer. The call is spoken bols when the recordings exist (samples/vox-bols/<bol>.flac,
   one per bol), otherwise the tabla plays the phrase lightly, right hand only; the answer is the tabla playing exactly
   that phrase. A bol is its strokes (right hand first, then the left): each the library tabla kit's voice (ghe, ke,
   te, na, tun, tas, re, dhe) and the embedded recordings that stand in for it. Dha = Na + Ghe, Dhin = Tun + Ghe... ---- */
const BOLS={dha:[['na',['na','na_o']],['ghe',['ghe1','ghe2']]],dhin:[['tun',['tun1','tun2']],['ghe',['ghe4','ghe3']]],dhe:[['dhe',['dhec']]],ta:[['tas',['tas1','na_s']]],na:[['na',['na','na_o']]],
  tin:[['tun',['tun2','tun1']]],tun:[['tun',['tun1','tun2']]],te:[['te',['te1','te2']]],ti:[['te',['te1','te_m']]],re:[['re',['re']]],ra:[['re',['re']]],ki:[['ke',['ke1','ke2']]],ke:[['ke',['ke1','ke2']]],
  ka:[['ke',['ke1','ke2']]],ghe:[['ghe',['ghe1','ghe3']]],ge:[['ghe',['ghe4','ghe2']]]};
/* the phrases, one token per sixteenth over two bars ('-' rests); a tihai's 33rd token is its sam, the downbeat after */
const BOLP={theka:'dha - dhin - dhin - dha - dha - dhin - dhin - dha - dha - tin - tin - ta - ta - dhin - dhin - dha -',
  kaida:'dha - dha - te - te - dha - dha - tin - na - ta - ta - te - te - dha - dha - dhin - na -',
  tihai:'- - - - - - - - dha - ti ra ki ta dha - - dha - ti ra ki ta dha - - dha - ti ra ki ta dha'};
/* Prototype 46: how often a tune with a tabla layer has the bols (alone, at most one tune in three), the bols bus level
   (the answer as loud as the drums in a drop), and how often a tune has the "do do do" */
const TBOLP=0.6,TBOLG=2.2,TDODO=0.05;
/* wind and bowed instruments never play a breakdown's chords (Prototype 45 had the tenor sax play four-note chords) */
const TWIND=['sx','sl','rc','ps','erhu','bansuri','didg','hangS','hangB'];
/* the spoken bols: looked for once, beside the sample library (only when the library is reachable and FLAC decodes) */
const VBOL={st:0,B:{},base(){try{const q=new URLSearchParams(location.search).get('samples');if(q==='0')return null;if(q&&/^[\w./-]+\/$/.test(q)&&!/\.\./.test(q))return q+'vox-bols/'}catch(e){}return'samples/vox-bols/'},
  load(ctx){if(this.st||!ctx)return;const S=MX.smp();if(!S||S.fallback)return;const B=this.base();if(!B){this.st=-1;return}this.st=1;
    const one=n=>fetch(B+n+'.flac').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>ctx.decodeAudioData(a)).then(b=>{const x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));b.vg=0.5/(pk||1);this.B[n]=b});
    one('dha').then(()=>Promise.all(Object.keys(BOLS).filter(n=>n!=='dha').map(n=>one(n).catch(()=>{})))).then(()=>{this.st=2},()=>{this.st=-1})},
  ok(ph){return this.st===2&&ph.every(t=>t==='-'||this.B[t])}};
