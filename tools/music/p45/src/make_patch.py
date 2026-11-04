#!/usr/bin/env python3
"""Builds /home/claude/p45/p45_music.py from the parts in this folder: spec.py's table (tpl_table.js), p45_data.js,
p45_methA.js, p45_methB.js, and the targeted edits below. The patch applies after p45_samples.py and p45_synths.py:
it replaces Prototype 43's music blocks around the parts the synth patch owns (SL.sitar and what follows it up to the
table, and tV/tSyn) and leaves them as they are."""
import os, subprocess, json
H = os.path.dirname(os.path.abspath(__file__))
subprocess.run(['python3', os.path.join(H, 'spec.py')], check=True, stdout=subprocess.DEVNULL)
rd = lambda f: open(os.path.join(H, f), encoding='utf-8').read()
TABLE, DATA, MA, MB = rd('tpl_table.js'), rd('p45_data.js'), rd('p45_methA.js'), rd('p45_methB.js')
BLK = []  # (start anchor, end anchor, new text): replaces [start, end)
R = []    # (anchor, replacement, count)
def blk(a, b, new): BLK.append((a, b, new))
def r(a, b, n=1): R.append((a, b, n))
blk('/* ---------- song templates (Prototype 43) ----------', '/* Sitar (no CC0 recording exists', DATA)
blk('const TPL=[', 'const SONGS={ok:null', TABLE)
blk('  /* ---- song templates (Prototype 43): building, the race sequence, the radio, the transitions ---- */', '  /* a melodic note on an instrument: a recording when loaded', MA)
blk('  /* where a melody sits: the instrument', '  play(t,sd){const s=this.pos%16;', MB)
# ---- the sidechain buses: the bass and the keys get their own (the old engine ducks them with the pads, as before)
r("this.pump=c.createGain();this.pump.connect(this.out);",
  "this.pump=c.createGain();this.pump.connect(this.out);this.pumpB=c.createGain();this.pumpB.connect(this.out);this.pumpK=c.createGain();this.pumpK.connect(this.out);this.gR=null;")
r("const to=k==='pad'||k==='amb'||k==='bass'||k==='arp'||k==='echo'?this.pump:k==='kick'||k==='snare'||k==='hat'?this.drum:this.out;",
  "const to=k==='bass'?this.pumpB:k==='keys'?this.pumpK:k==='pad'||k==='amb'||k==='arp'||k==='echo'?this.pump:k==='kick'||k==='snare'||k==='hat'?this.drum:this.out;")
r("kickFx(t,short){if(!short){const p=this.pump.gain,dip=1-0.72*Math.min(1,this.lvT.kick||0);p.cancelScheduledValues(t);p.setValueAtTime(dip,t);p.linearRampToValueAtTime(1,t+0.2);this.duckLead(t,1)}},",
  "kickFx(t,short){if(!short){const dip=1-0.72*Math.min(1,this.lvT.kick||0);for(const p of[this.pump.gain,this.pumpB.gain]){p.cancelScheduledValues(t);p.setValueAtTime(dip,t);p.linearRampToValueAtTime(1,t+0.2)}this.duckLead(t,1)}},")
# ---- a gabber-tone kick for happy hardcore and breakcore bursts (distorted, with a pitched sub tail)
r("nz:[0.2,SL.nzHit({seed:131}),0.22,null]};",
  "nz:[0.2,SL.nzHit({seed:131}),0.22,null],\n  /* Prototype 45: a gabber-tone kick (happy hardcore), hard-driven with a long pitched tail */\n  kg:[0.55,SL.kick({f0:420,f1:78,f2:52,t1:0.022,dec:0.5,hold:0.035,click:0.55,sat:7,len:0.55}),0.27,{s:'kd',g:0.45,syn:0.95,hp:180,f:0.95}]};")
# ---- the reverse crash ended on the crash's own attack (Eric: "nice but ends sharp"): its last 60 ms fade and darken
r("if(kit.cr){const x=kit.cr.getChannelData(0),L=Math.min(x.length,Math.round(sr*1.3)),b=c.createBuffer(1,L,sr),o=b.getChannelData(0);for(let i=0;i<L;i++)o[i]=x[L-1-i]*Math.pow(i/L,1.2);kit.rc=b}",
  "if(kit.cr){const x=kit.cr.getChannelData(0),L=Math.min(x.length,Math.round(sr*1.3)),b=c.createBuffer(1,L,sr),o=b.getChannelData(0);for(let i=0;i<L;i++)o[i]=x[L-1-i]*Math.pow(i/L,1.2);const fo=Math.round(sr*0.06);for(let i=0;i<fo;i++)o[L-1-i]*=Math.pow(i/fo,1.6);SL.biq(o,sr,'lp',6500,0.7);kit.rc=b}")
# ---- the recordings that were too sharp are tamed as they decode (SL.tame)
r("let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_loop')){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}}",
  "let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_loop')){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}SL.tame(k,v)}")
r("let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_lp')&&!TEXPK[k]){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}}",
  "let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.02)i0++;i0=Math.max(0,i0-Math.round(b.sampleRate*0.0005));if(i0>0&&!k.startsWith('x_lp')&&!TEXPK[k]){const nb=c.createBuffer(1,b.length-i0,b.sampleRate);nb.getChannelData(0).set(x.subarray(i0));v[k]=nb}}catch(e){}SL.tame(k,v)}")
r("this.decodeVox(c,k=>k[0]!=='v').then(v=>{this.vbuf=Object.assign(v,this.vbuf||{})})",
  "this.decodeVox(c,k=>k[0]!=='v').then(v=>{SL.tame('s_sp',v);this.vbuf=Object.assign(v,this.vbuf||{})})")
# ---- the snare Eric heard as "badly recorded" on 2 and 4 (Sonic Pi sn_dub, the gas kit's) leaves the kits
r("4:{n:'gas kit',p:{kd:['x_bd_gas',{syn:0.5}],kt:['x_bd_sone',{syn:0.5}],s1:'x_sn_dub',", "4:{n:'gas kit',p:{kd:['x_bd_gas',{syn:0.5}],kt:['x_bd_sone',{syn:0.5}],s1:'x_sn_generic',")
r("s1:'x_sn_generic',s2:'x_sn_dub',cl:'x_perc_snap2',h1:'x_hat_gnu'", "s1:'x_sn_generic',s2:'x_elec_snare',cl:'x_perc_snap2',h1:'x_hat_gnu'")
r("s1:'x_elec_filt_snare',s2:'x_sn_dub',cl:'x_perc_snap2',h1:'x_hat_snap'", "s1:'x_elec_filt_snare',s2:'x_sn_generic',cl:'x_perc_snap2',h1:'x_hat_snap'")
# ---- the mbira (nyunga nyunga) recordings are removed (a poor recording); old codes that drew it get another instrument
r("mz:{b:[60,72],n:'mbira',x2:1},", "")
r("const XI2_FL={dnb:['up','cv','sl','xy','mz','hm','kk'],brk:['cv','xy','up','mz','kk','hm','sl'],trance:['hm','xy','ps','cv','up','kk','mz'],psy:['mz','kk',",
  "const XI2_FL={dnb:['up','cv','sl','xy','kk','hm','kk'],brk:['cv','xy','up','kk','kk','hm','sl'],trance:['hm','xy','ps','cv','up','kk','hm'],psy:['kk','kk',")
# ---- the frequency-shift bass recipe plays as the FM bass now (Eric disliked the shift)
r("shift:b=>({voices:2,spread:8,ring:1.414,cut:2200,env:2000,envT:0.05,vol:0.07,cal:1.26,dest:'dN',len:0.7}),",
  "shift:b=>({type:'fm',fm:4,fr:1,voices:1,cut:2600,env:1500,envT:0.12,vol:0.08,cal:0.84,dest:'dB',len:0.7}),")
# ---- cymbals off the drum drive (the samples agent: the distorted crash came from cymbals through it): the ride gets its
#      own clean path, which follows the hat layer's fader
r("this.bus[k]=g;this.lvT[k]=0;this.gate[k]=false}", "this.bus[k]=g;this.lvT[k]=0;this.gate[k]=false}this.cymF=c.createGain();this.cymF.gain.value=0;this.cymF.connect(pan(0.22,this.out));this.cymP=0;")
r("for(const k of LAYERS){const gn=this.bus[k].gain,p=this.lvT[k]||0,v=lv[k]||0;gn.setValueAtTime(p,t);gn.linearRampToValueAtTime(v,t+dur);this.lvT[k]=v;this.gate[k]=Math.max(p,v)>0.01}",
  "for(const k of LAYERS){const gn=this.bus[k].gain,p=this.lvT[k]||0,v=lv[k]||0;gn.setValueAtTime(p,t);gn.linearRampToValueAtTime(v,t+dur);this.lvT[k]=v;this.gate[k]=Math.max(p,v)>0.01}if(this.cymF){const gn=this.cymF.gain,p=this.cymP||0,v=this.lvT.hat||0;gn.setValueAtTime(p,t);gn.linearRampToValueAtTime(v,t+dur);this.cymP=v}")
# ---- Pregen: the library synths' worklet voices get their notes before each stretch of the offline render
r("oc.suspend(q).then(()=>{bar(b+1,0);oc.resume()})}\n      buf=await oc.startRendering();kicks=E.kickQ}",
  "oc.suspend(q).then(async()=>{bar(b+1,0);await MX.sync(E);oc.resume()})}\n      await MX.sync(E);buf=await oc.startRendering();kicks=E.kickQ}")
r("bar(j,w0);await new Promise(r=>setTimeout(r,0))}\n        const ch=await c2.startRendering(),",
  "bar(j,w0);await new Promise(r=>setTimeout(r,0))}\n        await MX.sync(E);const ch=await c2.startRendering(),")
# ---- the radio: likes, the genre list, the memory with a like bonus
r("freshTune(){return mFresh(()=>this.tRandom(rng((Math.random()*4294967296)>>>0),this.T?this.T.f:null),12);",
  "freshTune(){if(this.libMode==='lib'){const s=this.tLibPick(this.st?codeOf(this.st):null);if(s)return s}return this.tFresh(()=>this.tRandom(rng((Math.random()*4294967296)>>>0),this.T?this.T.f:null),12);")
r("newTune(){const wasH=this.raceHome&&this.st&&codeOf(this.st)===codeOf(this.raceHome);const pc=this.code(),pl=this.played();",
  "newTune(){const wasH=this.raceHome&&this.st&&codeOf(this.st)===codeOf(this.raceHome);const pc=this.code(),pl=this.played();if(this.T&&pl!=null&&pl<20)MLIKE.add(this.T.id,-1);")
r("let list=this.kept();if(!list.includes(c)){list.unshift(c);", "let list=this.kept();if(!list.includes(c)){if(this.T)MLIKE.add(this.T.id,2);list.unshift(c);")
r("music:{style:music.style,both:music.style==='both'?music.both:undefined,code:music.code(),",
  "music:{style:music.style,goff:(()=>{try{return JSON.parse(store.get('hoverline.mgoff')||'[]')}catch(e){return[]}})(),likes:MLIKE.on(),liked:[...new Set(MLIKE.get().filter(x=>x[1]>=3).map(x=>x[0]))],lib:music.libMode||undefined,trackRace:music.rRot,code:music.code(),")
# ---- a track raced again moves on to another tune (alone); the race counts as it starts; the menu gets the next one ready
r("cueRace(){this.rxReset();if(!this.st)return;this.pgWant(true);", "cueRace(){this.rxReset();if(!this.st)return;this.tRotate();this.pgWant(true);")
r("setMood(m){this.mood=m;if(m==='menu')this.pgWant();", "setMood(m){this.mood=m;if(m==='menu'){this.tRotHome();this.pgWant()}")
r("fromTrack(seed){if(!this.pinned){this.tSeed=seed;this.rSeq=0;this.rPrevF=null;const st=this.raceTune(0);this.raceHome={...st,mut:[...st.mut]};this.setState(st);return}",
  "fromTrack(seed){if(!this.pinned){this.tSeed=seed;this.rSeq=0;this.rPrevF=null;this.rRot=null;this.raceHome=null;this.tRotHome();const st={...this.raceHome,mut:[...this.raceHome.mut]};this.setState(st);return}")
# ---- the library holds up to 100 tunes (it was 12)
r("setState(st,blend){this.swPl=null;this.st=st;", "setState(st,blend){this.swPl=null;this.st=st;this.tLibSeen(st);")
r("note('Tune '+c+' kept · find it in Settings, Music',2000)", "note('Tune '+c+' kept · find it in Settings, Music, Library',2000)")
r("list=list.slice(0,12);store.set('hoverline.tunes'", "list=list.slice(0,100);store.set('hoverline.tunes'")
# ---- the log export carries the library, the likes and their history
r("logDownload({game:all[0].game,exported:new Date().toISOString(),profile:profileGet(),logs:all}", "logDownload({game:all[0].game,exported:new Date().toISOString(),profile:profileGet(),music:music.libLog(),logs:all}")
r("JSON.stringify({profile:profileGet(),logs:all})", "JSON.stringify({profile:profileGet(),music:music.libLog(),logs:all})", 2)
# ---- the music player: Like in the title's player; genres and the likes switch in Settings, Music
r('<div class="player" role="group" aria-label="Music"><div class="row"><button class="chip" data-music="dnb" aria-pressed="false">Drum &amp; bass</button><button class="chip" data-music="trance" aria-pressed="false">Trance</button><span class="sep"></span>',
  '<div class="player" role="group" aria-label="Music"><div class="row"><button class="chip" id="likeTune" aria-pressed="false" aria-label="Like this tune">♥ Like</button><span class="sep"></span>')
r('<button class="chip" id="nextTune" data-icon="next" aria-label="Next tune">Next</button>', '<button class="chip" id="nextTune" data-icon="next" aria-label="Next tune">Next</button><button class="chip" id="radioBack" hidden>Back to radio</button>')
r('<div class="sub">The style, how the race music behaves, and tunes you have kept · every tune has a code you can share</div>',
  '<div id="musMain">\n    <div class="sub">The genres, how the race music behaves, and your library of kept tunes · every tune has a code you can share</div>')
r('<div class="row" id="tuneList"></div>',
  '<div class="row" id="radioRow" hidden><span class="small" id="radioLbl"></span><button class="chip" id="radioBack2">Back to radio</button></div>\n'
  '    <div class="row"><button class="btn" id="libOpen">Library ›</button><span class="small" id="libSum"></span></div>')
r('<div class="row"><button class="btn go" id="musDone" data-back>Done</button></div>',
  '<div class="row"><button class="btn go" id="musDone" data-back>Done</button></div>\n    </div>\n'
  '    <div id="musLib" hidden>\n'
  '    <div class="sub">Library · the tunes you kept</div>\n'
  '    <div class="row"><button class="btn go" id="libPlay" aria-pressed="false">▶ Play library</button><button class="btn" id="libGen" aria-pressed="false">▶ Play generator with library influence</button></div>\n'
  '    <div class="row" id="libRadio" hidden><span class="small" id="libLbl"></span><button class="chip" id="radioBack3">Back to radio</button></div>\n'
  '    <div class="libw"><table class="lib" id="libTable"></table></div>\n'
  '    <div class="row" id="libUndo" hidden><span class="small" id="libUndoT"></span><button class="btn" id="libUndoB">Undo</button></div>\n'
  '    <p class="small">Tap a name to play that tune on repeat; Back to radio ends it. Play library plays the kept tunes one after another, in the menu and in races on your own. The generator with library influence makes new tunes like them. Remove sits at the far end of each row, and Undo brings a removed tune back.</p>\n'
  '    <div class="row"><button class="btn go" id="libBack" data-back>‹ Music</button></div>\n'
  '    </div>')
r('</style>', '/* Prototype 45: the music library page */\n.lib{width:100%;border-collapse:collapse;font-family:inherit;font-size:13px;margin:4px 0}.lib th{font-weight:600;opacity:.65;text-align:left;padding:4px 6px;font-size:12px}\n'
  '.lib td{padding:0 6px;border-top:1px solid rgba(255,255,255,.08);vertical-align:middle}.lib tr.on td{background:rgba(255,176,0,.10)}\n'
  '.lib .lp{background:none;border:0;color:inherit;font:inherit;font-weight:600;cursor:pointer;padding:9px 0;text-align:left;min-height:34px}.lib .lp:hover{color:#ffb000}\n'
  '.lib .n{white-space:nowrap;text-align:right}.lib .rmc{text-align:right;width:1%;padding-left:22px}\n'
  '.lib .lrm{background:none;border:0;color:inherit;font:inherit;font-size:12px;opacity:.55;cursor:pointer;padding:9px 2px;text-decoration:underline}.lib .lrm:hover{opacity:1}\n'
  '.lib td.st{opacity:.8;font-size:12px}.libw{max-height:48vh;overflow-y:auto;overflow-x:hidden}@media (max-width:560px){.lib .k{display:none}.lib{font-size:12px}}\n</style>')
r("function openMus(el){musFrom=el||null;$('set').hidden=true;$('mus').hidden=false;", "function openMus(el){musFrom=el||null;$('set').hidden=true;$('mus').hidden=false;$('musMain').hidden=false;$('musLib').hidden=true;")
r('<div class="row" role="group" aria-label="Music"><button class="chip" data-music="dnb" aria-pressed="false">Drum &amp; bass</button><button class="chip" data-music="trance" aria-pressed="false">Trance</button><button class="chip" data-music="off" aria-pressed="false">Off</button>',
  '<div class="row" role="group" aria-label="Music"><button class="chip" data-music="off" aria-pressed="false">Off</button>')
blk('<div id="bothRow" hidden>', '    <div class="code"><label for="tuneIn">Tune</label>',
    '<div class="sub">Genres</div><div class="row" role="group" aria-label="Genres" id="genreRow"></div>\n'
    '    <p class="small">Each tune is a template from one genre, or a fusion of two (one genre\'s rhythm, another\'s melody or colour). A tune plays only when its genres are on. In a room everyone hears the same tunes, so there all genres play.</p>\n'
    '    <div class="row"><button class="chip" id="likeTune2" aria-pressed="false">♥ Like this tune</button><button class="chip" id="likeChip" aria-pressed="true">Influence the radio with your likes</button></div>\n'
    '    <p class="small">Like (and Keep) make tunes like that one come up more often in the menu and in races on your own; skipping a tune in its first 20 seconds counts a little against it. Nothing repeats too soon: the listening memory still comes first.</p>\n')
blk("const BOTHN={blend:", "/* Menu music: the ambient theme by default;",
    "/* Prototype 45: genres instead of Drum & bass / Trance / Blend. Every genre is on by default; a template plays only when\n"
    "   all its genres are on (at least one stays on). Off turns the music off. Like marks the tune's template. */\n"
    "const syncMusic=()=>{const st=music.style;document.querySelectorAll('[data-music]').forEach(b=>b.setAttribute('aria-pressed',String(st==='off')));\n"
    "  const on=music.tGenOn(),row=$('genreRow');if(row){if(!row.children.length)for(const[g,n]of GENRES){const b=document.createElement('button');b.className='chip';b.dataset.genre=g;b.textContent=n;\n"
    "      b.onclick=()=>{audio.init();const now=music.tGenOn().includes(g);if(!music.setGenre(g,!now))note('At least one genre stays on',1600);syncMusic();try{tuneUI()}catch(e){}};row.append(b)}\n"
    "    for(const b of row.children)b.setAttribute('aria-pressed',String(on.includes(b.dataset.genre)))}\n"
    "  const lc=$('likeChip');if(lc)lc.setAttribute('aria-pressed',String(MLIKE.on()));for(const id of['likeTune','likeTune2']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}};\n"
    "document.querySelectorAll('[data-music]').forEach(b=>b.onclick=()=>{audio.init();music.setStyle(music.style==='off'?'both':'off');music.setMood(S.state==='menu'?'menu':'race');syncMusic()});\n"
    "{const lc=$('likeChip');if(lc)lc.onclick=()=>{store.set('hoverline.mlikeon',MLIKE.on()?'0':'1');syncMusic();note(MLIKE.on()?'Your likes steer the radio · tunes like the ones you like come up more often':'Your likes no longer steer the radio',2400)}}\n"
    "for(const id of['likeTune','likeTune2']){const b=$(id);if(b)b.onclick=()=>{audio.init();const on=music.like();if(on==null){note('Like works on the generated tunes',1600);return}syncMusic();note(on?'♥ Liked · more like this on the radio':'Like removed',1600)}}\n"
    "syncMusic();\n"
    + "/* ---- the library page (Prototype 45): the kept tunes as a table. Play library plays them one after another; the\n   generator with library influence makes new tunes like them; a name plays that tune on repeat until Back to radio.\n   Remove sits at the far end of its row, away from the names, and Undo brings the tune back. ---- */\nlet libU=null;\nfunction libShow(on){$('musMain').hidden=!!on;$('musLib').hidden=!on;$('mus').scrollTop=0;if(on)libUI();try{navTo($('mus'),on?$('libPlay'):$('libOpen'))}catch(e){}}\nfunction libUI(){const L=music.kept(),c=music.code(),T=$('libTable'),sum=$('libSum');if(sum)sum.textContent=L.length?L.length+(L.length>1?' tunes':' tune'):'empty · Keep a tune and it appears here';\n  const ml=music.modeLabel();for(const[r,l]of[['radioRow','radioLbl'],['libRadio','libLbl']]){const R=$(r);if(R){R.hidden=!ml;$(l).textContent=ml}}{const rb=$('radioBack');if(rb)rb.hidden=!ml}\n  if(!T||$('musLib').hidden)return;T.innerHTML='';const lp=$('libPlay'),lg=$('libGen');lp.disabled=lg.disabled=!L.length;lp.setAttribute('aria-pressed',String(music.libMode==='lib'));lg.setAttribute('aria-pressed',String(music.libMode==='inf'));\n  if(!L.length){const tr=document.createElement('tr'),td=document.createElement('td');td.textContent='No tunes yet. Press Keep in Settings, Music, or ♪ Keep this tune after a race, and the tune appears here.';tr.append(td);T.append(tr);return}\n  {const h=document.createElement('tr');for(const[t,cl]of[['Tune'],['Style'],['Tempo','n'],['Key','k'],['']]){const th=document.createElement('th');th.textContent=t;if(cl)th.className=cl;h.append(th)}T.append(h)}\n  const cell=(x,cl)=>{const d=document.createElement('td');if(cl)d.className=cl;if(typeof x==='string')d.textContent=x;else d.append(x);return d};\n  for(const k of L){const m=music.tuneMeta(k),tr=document.createElement('tr'),on=k===c&&music.pinned;if(on)tr.className='on';\n    const pb=document.createElement('button');pb.className='lp';pb.textContent=(on?'♪ ':'▶ ')+m.name;pb.setAttribute('aria-label','Play '+m.name+' on repeat');\n    pb.onclick=()=>{audio.init();if(music.style==='off'){music.setStyle('both');syncMusic()}music.load(k);music.ensure();if(S.state==='menu'&&!menuListen)document.querySelector('.listen').click();else music.setMood(S.state==='menu'?'menu':'race');syncMusic();tuneUI();note('Repeating '+m.name+' · Back to radio ends it',2200)};\n    const x=document.createElement('button');x.className='lrm';x.textContent='Remove';x.setAttribute('aria-label','Remove '+m.name+' from the library');\n    x.onclick=()=>{const i=music.kept().indexOf(k);music.forget(k);MLIKE.note('remove',m.tp||0,k);libU={k,i,n:m.name};$('libUndoT').textContent='Removed '+m.name;$('libUndo').hidden=false;\n      clearTimeout(libShow.t);libShow.t=setTimeout(()=>{$('libUndo').hidden=true;libU=null},15000);tuneUI();try{navTo($('mus'),$('libUndoB'))}catch(e){}};\n    pb.title=k;tr.append(cell(pb),cell(m.style,'st'),cell(m.bpm?m.bpm+' bpm':'','n'),cell(m.key,'k'),cell(x,'rmc'));T.append(tr)}}\n$('libOpen').onclick=()=>libShow(true);$('libBack').onclick=()=>libShow(false);\n$('libUndoB').onclick=()=>{if(!libU)return;music.restore(libU.k,libU.i);note(libU.n+' is back in the library',1600);libU=null;$('libUndo').hidden=true;tuneUI()};\n{const go=m=>{audio.init();if(music.style==='off'){music.setStyle('both');syncMusic()}music.ensure();music.setLib(m);if(S.state==='menu'&&!menuListen)document.querySelector('.listen').click();tuneUI();\n    note(m==='lib'?'Playing your library · Back to radio ends it':'The generator leans on your library · Back to radio ends it',2400)};\n  $('libPlay').onclick=()=>go('lib');$('libGen').onclick=()=>go('inf')}\nfor(const id of['radioBack','radioBack2','radioBack3']){const b=$(id);if(b)b.onclick=()=>{audio.init();music.toRadio();music.ensure();syncMusic();tuneUI();note('Back to the radio',1400)}}\n")
r("function tuneUI(){try{mmSync()}catch(e){}", "function tuneUI(){try{mmSync()}catch(e){}try{for(const id of['likeTune','likeTune2']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}}catch(e){}")
r("$('titleTune').textContent=so?'♪ '+so.t+' · '+so.a+' ('+so.l+')':c&&music.style!=='off'?'♪ '+c+' · '+music.info()+pre:'';",
  "const ml=music.modeLabel();$('titleTune').textContent=so?'♪ '+so.t+' · '+so.a+' ('+so.l+')':c&&music.style!=='off'?(ml?ml+' · ':'♪ ')+c+' · '+music.info()+pre:'';")
r("""  const list=$('tuneList');list.innerHTML='';\n  for(const k of music.kept()){const b=document.createElement('button');b.className='chip';b.textContent='♪ '+k;b.setAttribute('aria-pressed',String(k===c));\n    b.onclick=()=>{audio.init();music.load(k);music.ensure();music.setMood(S.state==='menu'?'menu':'race');syncMusic();tuneUI();note('Tune '+k+' loaded',1500)};\n    const x=document.createElement('button');x.className='chip';x.textContent='×';x.setAttribute('aria-label','Forget tune '+k);x.onclick=()=>{music.forget(k);tuneUI()};list.append(b,x)}}""",
  "  try{libUI()}catch(e){}}")
MARK = '/* ---------- song templates (Prototype 43, rebuilt in Prototype 45) ----------'
assert MARK in DATA
def lit(x): return repr(x)
out = ['#!/usr/bin/env python3',
 '# Prototype 45 (music): one generator for every genre. Built by /home/claude/p45/music/src/make_patch.py; apply after',
 '# p45_samples.py and p45_synths.py:  P=<html> python3 p45_music.py',
 '# - templates revised from Eric\'s notes, new ones (happy hardcore, psytrance and world, metal, wave phonk, the production',
 '#   guide\'s blueprints, fusions), retired ones still play by code;',
 '# - a genre list instead of Drum & bass / Trance / Blend, Like and "Influence the radio with your likes";',
 '# - drums through the library kits (round robins, velocity layers) with ghost notes and micro-timing, new drum languages',
 '#   (real trance, psytrance DUH-duh-duh-duh, techno, house, jump-up, neuro, liquid, metal, happy hardcore, odd breakcore);',
 '# - sidechain ducking per genre, extended chords voiced with voice leading, the library synths and instruments;',
 '# - the tsshh open hat, the wa screech, the tooty lead, the meow glide, the mbira and the frequency-shift bass gone.',
 '# Music only: races are unchanged (no Math.random at load or in the race path).',
 'import os', "P=os.environ.get('P')", "assert P,'set P=<html>'", "s=open(P,encoding='utf-8').read()",
 'def rep(a,b,n=1):', '    global s', '    c=s.count(a)', "    assert c==n,'anchor found %d times (wanted %d): %r'%(c,n,a[:100])", '    s=s.replace(a,b)',
 'def blk(a,b,new):', '    global s', "    assert s.count(a)==1,'block start %d: %r'%(s.count(a),a[:80])", "    i=s.find(a);j=s.find(b,i+len(a))", "    assert j>i and s.count(b)==1,'block end: %r'%b[:80]", '    s=s[:i]+new+s[j:]',
 "assert %s not in s,'p45_music.py has already been applied to '+P" % lit(MARK),
 "assert 'SYN' in s and 'const SMP=' in s,'apply p45_samples.py and p45_synths.py first'" if os.environ.get('STRICT') else "pass",
 "for k in ['x_mz_60','x_mz_72','x_sn_dub']:", "    i=s.find('\"'+k+'\":\"')", "    if i>0:", "        j=s.find('\"',i+len(k)+4)", "        assert j>i", "        e=s[j+1:j+2]", "        s=s[:i]+s[j+2:] if e==',' else s[:i]+s[j+1:]"]
for a, b, new in BLK: out.append('blk(%s,%s,%s)' % (lit(a), lit(b), lit(new)))
for a, b, n in R: out.append('rep(%s,%s%s)' % (lit(a), lit(b), '' if n == 1 else ',%d' % n))
out += ["open(P,'w',encoding='utf-8').write(s)", "print('p45_music: applied to',P)"]
open('/home/claude/p45/p45_music.py', 'w').write('\n'.join(out) + '\n')
print('wrote /home/claude/p45/p45_music.py', sum(len(x) for x in out) // 1024, 'KB,', len(BLK), 'blocks,', len(R), 'edits')
