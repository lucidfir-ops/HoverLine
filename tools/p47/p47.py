#!/usr/bin/env python3
"""Prototype 47: Set orientation on Android, numbered pairing steps with codes and sound mixed per leg, a bundled QR reader,
a microphone meter, Test sound and pairing diagnostics, a wireframe machine-priest that calls the chirps, and named speed
classes (Glide, Surge, Rush, Redline) on the track page, Time trial and the multiplayer lobby.

Apply with  P=<html> python3 p47.py   (edits the page in place; refuses a second run). Written against Prototype 46's
src/hoverline.html (8bcfaba). BOARD_ERA, PUBV and the version strings are left for the merge. Races at Redline (the
default) are unchanged: tools/sim gives the same results as Prototype 46, race for race."""
import base64, hashlib, os, sys, zlib
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.environ.get('P') or (sys.argv[1] if len(sys.argv) > 1 else '')
if not P: sys.exit('usage: P=<html> python3 p47.py')
s = open(P, encoding='utf-8').read()
MARK = '/* ---------- Set orientation (Prototype 47)'
if MARK in s or 'id="jsqrJs"' in s: sys.exit('p47: already applied to ' + P)

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, 'anchor found %d times (wanted %d): %r' % (c, n, a[:100])
    s = s.replace(a, b)

def cut(a, z, b):
    """replace everything from the start of a to the end of z (each found once, z after a) with b"""
    global s
    assert s.count(a) == 1 and s.count(z) == 1, 'cut anchors %d/%d: %r / %r' % (s.count(a), s.count(z), a[:60], z[:60])
    i = s.index(a); k = s.index(z, i) + len(z)
    s = s[:i] + b + s[k:]

# jsQR 1.4.0 (Apache-2.0, Cosmo Wolfe, github.com/cozmo/jsQR), the npm package's dist/jsQR.js minified with terser 5.31.0
JSQR_ZB64 = open(os.path.join(HERE, 'vendor', 'jsqr', 'jsqr.zb64')).read().strip()
JSQR = zlib.decompress(base64.b64decode(JSQR_ZB64)).decode('utf-8')
assert hashlib.sha256(JSQR.encode('utf-8')).hexdigest() == '69f13da428d9c3a14ab1013309e26c3ce48bf6d5a5815155850cd3b575431aba', 'jsQR blob'
assert '</script' not in JSQR.lower() and '<!--' not in JSQR

# =====================================================================================================================
# CSS
cut('.chirpwave{position:relative;flex:none;width:84px;height:84px;--lv:0}',
    '.chirpwave{width:60px;height:60px}.chirpwave b{inset:22px}#chirpRow .btn.mode{min-height:62px;padding:10px 16px}}',
    r'''/* the caller (Prototype 47): a wireframe machine-priest in place of the rings; strokes in the canvas's colour */
.priest{flex:none;width:120px;height:103px;color:var(--ink);--glow:var(--cyan);--voice:var(--amber)}
.pmrow{display:flex;align-items:center;gap:8px;font:600 11px var(--display);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.pmeter{position:relative;flex:1 1 auto;max-width:170px;height:8px;border-radius:4px;background:rgba(255,255,255,.09);overflow:hidden}
.pmeter i{position:absolute;left:0;top:0;bottom:0;width:calc(var(--lv,0)*100%);background:var(--green);border-radius:4px}
.pmeter b{position:absolute;top:0;bottom:0;width:2px;left:calc(var(--pk,0)*100% - 1px);background:var(--ink);opacity:.75}
/* numbered steps: done ones ticked, the one to do now lit */
.steps{margin:0;padding:0;list-style:none;counter-reset:st;display:flex;flex-direction:column;gap:7px;max-width:58ch}
.steps li{counter-increment:st;position:relative;padding-left:31px;min-height:22px;font:500 14px/1.45 var(--display);color:var(--dim)}
.steps li::before{content:counter(st);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;border:1px solid var(--line);box-sizing:border-box;font:700 12px/20px var(--mono);text-align:center;color:var(--dim)}
.steps li b{color:var(--ink);font-weight:700}
.steps li.cur{color:var(--ink)}.steps li.cur::before{background:var(--amber);border-color:var(--amber);color:#111}
.steps li.done::before{content:'\2713';border-color:rgba(70,255,140,.6);color:var(--green)}
#chirpSteps .small,#lanSteps .small{display:block;margin-top:6px}
#lanBox.helper{border-top:1px solid var(--line);padding-top:12px}
#lanBox.helper #lanQR,#lanBox.helper #lanCam{width:min(230px,58vw)}
@media (max-height:480px){#chirpBox .small,#lanBox .small{display:block}.priest{width:84px;height:72px}#chirpRow .btn.mode{min-height:62px;padding:10px 16px}.steps li{font-size:13px}}''')
rep('#lanTxt{word-break:break-all;font-family:ui-monospace,monospace;user-select:all;opacity:.8}@media (max-height:480px){#lanBox .small,#mpConnHint{display:block}#lanTxt{font-size:11px}}',
    r'''#lanTxt{margin:0;font:700 15px/1.7 var(--mono);letter-spacing:.05em;word-spacing:.35em;color:var(--amber);max-width:25ch;user-select:all;-webkit-user-select:all;overflow-wrap:anywhere}
#lanIn{flex:1 1 13em;width:auto;min-width:9em;font-size:14px;letter-spacing:.05em}
@media (max-height:480px){#lanBox .small,#mpConnHint{display:block}#lanTxt{font-size:13px}}
/* speed class (Prototype 47): one compact pick that looks like a chip; the d-pad's left and right change it */
select.pick{font:600 13px var(--display);letter-spacing:.03em;color:var(--ink);background:rgba(255,255,255,.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23ffb000' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat right 12px center;border:1px solid var(--line);border-radius:999px;padding:8px 31px 8px 13px;-webkit-appearance:none;appearance:none;cursor:pointer;max-width:100%}
select.pick option{background:#10131a;color:var(--ink)}
select.pick:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
@media (pointer:coarse) and (orientation:portrait){select.pick{min-height:40px}}
/* Set orientation (Prototype 47) */
#orSet{justify-content:center;align-items:center;background:rgba(9,11,16,.92)}
#orSet .card{align-items:center;text-align:center;width:min(520px,100%)}
.orPick{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%}
button.btn.orOpt{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px;padding:18px 10px 14px;font-size:18px;min-height:150px}
.orOpt small{font:500 12px/1.35 var(--display);letter-spacing:.02em;text-transform:none;color:var(--dim)}
.orPh{display:block;position:relative;box-sizing:border-box;border:2px solid var(--amber);border-radius:8px}
.orPh.p{width:36px;height:62px}.orPh.l{width:62px;height:36px;margin:13px 0}
.orPh::after{content:'';position:absolute;background:var(--amber);border-radius:2px}
.orPh.p::after{width:12px;height:2px;left:50%;top:5px;transform:translateX(-50%)}.orPh.l::after{width:2px;height:12px;top:50%;left:5px;transform:translateY(-50%)}
@media (max-height:480px){button.btn.orOpt{min-height:112px;padding:12px 10px 10px}#orSet .logo{font-size:34px}#orSet .card{gap:9px}}''')

# =====================================================================================================================
# HTML
# the track page (Race and Time trial): the class pick under the scenery
rep('<button class="chip pool" data-tod="night">Night</button><button class="chip pool" data-tod="day">Day</button></div>\n    <div class="row"><button class="btn go" id="raceBtn">Start</button>',
    '<button class="chip pool" data-tod="night">Night</button><button class="chip pool" data-tod="day">Day</button></div>\n'
    '    <div class="row" id="clsRow"><span class="sub">Class</span><select class="pick" id="clsSel" aria-label="Speed class"></select><span class="small" id="clsNote"></span></div>\n'
    '    <div class="row"><button class="btn go" id="raceBtn">Start</button>')
# Multiplayer: the sound box (the caller, the meter, numbered steps), the code box moved up under it, Test sound
cut('    <div id="chirpBox" class="col" hidden>', '<button class="btn" id="chirpQR">Use QR codes</button></div>\n    </div>\n',
    '''    <div id="chirpBox" class="col" hidden>
      <div class="chirprow"><canvas id="chirpWave" class="priest" aria-hidden="true"></canvas>
        <div class="chirpcol"><div class="sub" id="chirpTitle"></div><div class="pmrow" id="chirpMeter" hidden><span>Mic</span><div class="pmeter"><i></i><b></b></div></div><p class="small warn" id="chirpMsg" aria-live="polite"></p></div></div>
      <div id="chirpSteps"></div>
      <div class="row"><button class="btn" id="chirpDone">Done</button><button class="btn" id="chirpCancel" data-back>Cancel</button><button class="btn" id="chirpQR">Use a code</button></div>
    </div>
    <div id="lanBox" class="col" hidden>
      <div class="sub" id="lanTitle"></div>
      <div id="lanSteps"></div>
      <div class="row lanrow"><canvas id="lanQR" width="330" height="330" hidden></canvas><video id="lanCam" playsinline muted hidden></video>
        <div class="col lancol"><p id="lanTxt" hidden></p>
          <div class="row"><button class="btn go" id="lanScan">Scan a code</button><button class="btn" id="lanCopy" hidden>Copy code</button><button class="btn" id="lanCancel">Cancel</button></div>
          <div class="code" id="lanInRow"><label for="lanIn">Code</label><input id="lanIn" spellcheck="false" autocomplete="off" autocapitalize="characters" placeholder="type a code" data-osk="code"><button class="btn kb" data-osk-for="lanIn" aria-label="On-screen keyboard">⌨</button><button class="btn" id="lanUse">Use</button></div>
          <p class="small warn" id="lanMsg" aria-live="polite"></p></div></div>
    </div>
''')
cut('    <div id="lanBox" class="col" hidden>\n      <div class="sub" id="lanTitle"></div>\n      <div class="row lanrow">',
    '<p class="small" id="lanTxt"></p><p class="small warn" id="lanMsg"></p></div></div>\n    </div>\n', '')
rep('<button class="chip" data-pair="sound" aria-pressed="true">Sound</button><button class="chip" data-pair="qr" aria-pressed="false">QR code</button></div>',
    '<button class="chip" data-pair="sound" aria-pressed="true">Sound</button><button class="chip" data-pair="qr" aria-pressed="false">Code only</button><span class="sep"></span><button class="chip" id="chirpTest">Test sound</button></div>')
# the room's class, in the host's laps row
rep('<span class="sep"></span><button class="chip" id="mpAI" aria-pressed="true">Fill with AI</button></div>',
    '<span class="sep"></span><button class="chip" id="mpAI" aria-pressed="true">Fill with AI</button><span class="sep"></span><span class="sub">Class</span><select class="pick" id="mpCls" aria-label="Speed class for this room"></select></div>')
# Settings: the orientation races hold (Android only)
rep('''    <div class="setnav"><button class="btn" id="gfxOpen">Graphics</button><button class="btn" id="logOpen">Race data</button></div>
    <div class="row"><button class="btn go" id="setDone" data-back>Done</button></div>''',
    '''    <div class="setnav"><button class="btn" id="gfxOpen">Graphics</button><button class="btn" id="logOpen">Race data</button></div>
    <div class="row" id="orRow" hidden><span class="sub">Races</span><div class="seg" role="group" aria-label="Orientation in races"><button data-orient="portrait" aria-pressed="false">Portrait</button><button data-orient="landscape" aria-pressed="false">Landscape</button></div></div>
    <div class="row"><button class="btn go" id="setDone" data-back>Done</button></div>''')
# the first screen on an Android phone or tablet with nothing chosen yet
rep('<div id="qkTap" class="overlay" hidden>', '''<div id="orSet" class="overlay" hidden>
  <div class="card">
    <div class="logo">HOVER<b>LINE</b></div>
    <div class="sub">Set orientation</div>
    <div class="orPick" role="group" aria-label="Orientation">
      <button class="btn orOpt" data-or="portrait"><i class="orPh p"></i>Portrait<small>Upright</small></button>
      <button class="btn orOpt" data-or="landscape"><i class="orPh l"></i>Landscape<small>Sideways</small></button>
    </div>
    <p class="small">Races hold the screen this way. You can change it in Options, Settings.</p>
  </div>
</div>
<div id="qkTap" class="overlay" hidden>''')
# jsQR, as text, run only when a scan starts in a browser that can't read QR codes itself
rep('  exports["ggwave_factory"] = ggwave_factory;\n</script>\n<script>\n(()=>{',
    '  exports["ggwave_factory"] = ggwave_factory;\n</script>\n'
    '<!-- jsQR 1.4.0 (Apache-2.0, Cosmo Wolfe, github.com/cozmo/jsQR): reads QR codes from the camera in browsers without a QR reader of their own. Run only when a scan starts. -->\n'
    '<script type="text/plain" id="jsqrJs">' + JSQR + '</script>\n<script>\n(()=>{')

# =====================================================================================================================
# Set orientation
rep('''const OR={on:false};
function orSync(){const so=screen.orientation;if(!so||typeof so.lock!=='function')return;const want=coarse&&!!document.fullscreenElement&&!$('hudL').hidden;
  if(want&&!OR.on){OR.on=true;try{so.lock(so.type).catch(()=>{OR.on=false})}catch(e){OR.on=false}}
  else if(!want&&OR.on){OR.on=false;try{so.unlock()}catch(e){}}}''',
r'''const OR={on:false,next:null};
/* ---------- Set orientation (Prototype 47) ----------
   itch.io's phone player opens an HTML game full screen and locks the screen to the shape of its frame, which is
   landscape, before the game has loaded (in Chrome; Firefox shows it upright). The first race then held "the way the
   device was held", which was itch's landscape, and only the menus after it let go of the lock. So where a page can lock
   the screen (Android phones and tablets, once full screen) the player picks Portrait or Landscape once, on the first
   screen (before Tap to race on a fresh browser, over the title otherwise), and every race holds that way round; Settings
   changes it. Menus follow the device as before, and a framed page lets go of the lock the page around it set when it
   loads. Elsewhere (desktops, the Steam Deck, iPhones) nothing is asked and a race holds whichever way the device is held. */
const ANDROID=/Android/i.test(navigator.userAgent||'');
const orCan=()=>REAL&&ANDROID&&canFull&&!!(screen.orientation&&typeof screen.orientation.lock==='function');
let orPick=(v=>v==='portrait'||v==='landscape'?v:null)(store.get('hoverline.orient'));
const orAsk=()=>orCan()&&!orPick&&!BOT;
/* the lock a race takes: the chosen way round (as it stands now if it already is, so a phone held the other way up stays so) */
function orType(){const so=screen.orientation,t=so&&so.type||'';if(!orPick||!orCan())return t||'any';return t.startsWith(orPick)?t:orPick+'-primary'}
/* a race (and, with a way chosen, the quick race's Tap to race before it) holds the lock; anything else lets it go */
function orSync(){const so=screen.orientation;if(!so||typeof so.lock!=='function')return;const want=coarse&&!!document.fullscreenElement&&(!$('hudL').hidden||!!orPick&&!$('qkTap').hidden);
  if(want&&!OR.on){OR.on=true;const ty=orType();
    if(orPick&&orCan()&&TS.race&&TS.race!==orPick[0]){TS.race=orPick[0];tsUse(TS.race);if(!$('touch').hidden)touchLayout()}
    try{so.lock(ty).catch(()=>{OR.on=false;const o=orNow();if(TS.race&&TS.race!==o){TS.race=o;tsUse(o);if(!$('touch').hidden)touchLayout()}})}catch(e){OR.on=false}}
  else if(!want&&OR.on){OR.on=false;try{so.unlock()}catch(e){}}}
function orSetSync(){const r=$('orRow');if(r)r.hidden=!orCan();document.querySelectorAll('[data-orient]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orient===orPick)))}
function orShow(next){OR.next=next||null;orSetSync();$('orSet').hidden=false;navTo($('orSet'))}
/* the choice: saved; before the quick race it also goes full screen, so Tap to race already stands the chosen way */
function orChoose(o){orPick=o;store.set('hoverline.orient',o);orSetSync();const box=$('orSet');if(box.hidden)return;box.hidden=true;try{audio.sfx('ui_select')}catch(e){}
  const next=OR.next;OR.next=null;if(next)next();
  if(next&&coarse&&canFull){if(document.fullscreenElement)orSync();else goFull()}}
document.querySelectorAll('[data-or]').forEach(b=>b.onclick=()=>orChoose(b.dataset.or));
document.querySelectorAll('[data-orient]').forEach(b=>b.onclick=()=>{orPick=b.dataset.orient;store.set('hoverline.orient',orPick);orSetSync()});
orSetSync();
if(orCan()&&framed)try{screen.orientation.unlock()}catch(e){}''')
# the HUD coming up takes the chosen way's touch setup once the lock is (or is about to be) on
rep("if(on){TS.race=orNow();tsUse(TS.race)}else if(TS.race){TS.race=null;tsUse(orNow())}",
    "if(on){TS.race=orPick&&orCan()&&coarse&&document.fullscreenElement?orPick[0]:orNow();tsUse(TS.race)}else if(TS.race){TS.race=null;tsUse(orNow())}")
# the choice isn't "having played": a fresh browser still starts on the quick race
rep("const QK_AUTO=['def39','ultra32','ultra34','ultra35','bioR','code','mhist','padkind','autoUltra','quick']",
    "const QK_AUTO=['def39','ultra32','ultra34','ultra35','bioR','code','mhist','padkind','autoUltra','quick','orient']")
rep("function qkTapShow(){$('qkGo').textContent=", "function qkTapShow(){if(orAsk()){orShow(qkTapShow);return}$('qkGo').textContent=")
rep("['qkTap','qkEnd'].forEach(i=>$(i).hidden=true);", "['qkTap','qkEnd'].forEach(i=>$(i).hidden=true);try{orSync()}catch(e){}")
rep("qkBoot();\nloadTrack(seed);", "qkBoot();if(!QK.live&&orAsk())orShow(null);\nloadTrack(seed);")
rep("cam:camMode,or:TS.race||orNow(),mods:", "cam:camMode,or:TS.race||orNow(),orSet:orPick||undefined,mods:")

# =====================================================================================================================
# Speed classes
rep("const bestKey=()=>'hoverline.best.'+roadStr()+(S.car?'.car':'')+(S.train&&TRN.cube?'.cube':'');",
r'''/* Speed classes (Prototype 47): Glide 70%, Surge 80%, Rush 90% and Redline, full speed and the default. The class scales
   top speed (S.cls), and with it the AI's and the jumps' gravity, as the career always has. Race and Time trial share one
   pick on the track page; in a room the host picks and everyone races at it. Career tiers keep their names and show their
   class (Rookie is Glide, Club Surge, Pro Rush, Elite Redline); quick races run at Glide and training at Redline. Only
   Redline times go to the online board; best laps and ghosts are kept per class, Redline under the keys from before. */
const CLS=[{k:'glide',n:'Glide',f:0.7},{k:'surge',n:'Surge',f:0.8},{k:'rush',n:'Rush',f:0.9},{k:'redline',n:'Redline',f:1}];
const clsOf=k=>CLS.find(c=>c.k===k)||CLS[3];
const clsName=f=>{const c=CLS.find(c=>Math.abs(c.f-f)<1e-6);return c?c.n:Math.round(f*100)+'%'};
let clsFree=clsOf(store.get('hoverline.cls')).k;
/* the class this screen's races run at; null where the mode sets its own speed */
const clsCtx=()=>S.car||qkLive()||S.train?null:mp.on?mp.cls:clsFree;
const clsSfx=()=>{const k=clsCtx();return k&&k!=='redline'?'.'+k:''};
const bestKey=()=>'hoverline.best.'+roadStr()+(S.car?'.car':'')+(S.train&&TRN.cube?'.cube':'')+clsSfx();''')
rep("const ghostTag=()=>roadStr()+(S.train?'.'+LAPS+(TRN.cube?'c':''):'');", "const ghostTag=()=>roadStr()+(S.train?'.'+LAPS+(TRN.cube?'c':''):'')+clsSfx();")
rep("function updateMenuBest(){const b=getBest();$('menuBest').textContent=b!=null?'Best lap on this track · '+fmt(b):'No lap set on this track yet'}",
    "function updateMenuBest(){const b=getBest(),c=clsSfx()?' at '+clsOf(clsCtx()).n:'';$('menuBest').textContent=b!=null?'Best lap on this track'+c+' · '+fmt(b):'No lap set on this track'+c+' yet'}")
rep("S.cls=t?t.k:1;S.aiK=t?t.ai:1;", "S.cls=t?t.k:S.train?1:clsOf(clsFree).f;S.aiK=t?t.ai:1;")
rep("  else if(S.trial&&!mp.on)setTimeout(()=>note(gh&&gh.best?'Time trial · your best run is the ghost':'Time trial · set a time, and next run it becomes your ghost',2600),900);",
    "  else if(S.trial&&!mp.on)setTimeout(()=>note((S.cls<1?clsName(S.cls)+' · ':'')+(gh&&gh.best?'Time trial · your best run is the ghost':'Time trial · set a time, and next run it becomes your ghost'),2600),900);\n"
    "  else if(!S.car&&!QK.live&&S.cls<1)setTimeout(()=>note(clsName(S.cls)+' class · '+Math.round(S.cls*100)+'% speed',2200),900);")
rep("(T.lk!=='M'?' · '+T.LN.name:'')+(mp.on?' · Room '+mp.code:'');renderResults();",
    "(T.lk!=='M'?' · '+T.LN.name:'')+(!S.car&&!QK.live&&S.cls<1?' · '+clsName(S.cls):'')+(mp.on?' · Room '+mp.code:'');renderResults();")
rep("function lbSubmit(best){if(!LB||player.finishT==null||(BOT&&!QS.get('lb')))return;const el=$('resBoard'),name=lbName();",
    "function lbSubmit(best){if(!LB||player.finishT==null||(BOT&&!QS.get('lb')))return;\n"
    "  if(S.cls<1){const e=$('resBoard');e.hidden=false;e.textContent='Online board · Redline races only · this one was '+clsName(S.cls);return}\n"
    "  const el=$('resBoard'),name=lbName();")
rep("cls:S.cls,\n    track:{code:codeStr()", "cls:S.cls,clsName:clsName(S.cls),\n    track:{code:codeStr()")
rep("d.innerHTML=`<div class=\"sub\"><b>${T_.n}</b> · ${Math.round(T_.k*100)}% speed</div><div class=\"evs\"></div>`;",
    "d.innerHTML=`<div class=\"sub\"><b>${T_.n}</b> · ${clsName(T_.k)} · ${Math.round(T_.k*100)}% speed</div><div class=\"evs\"></div>`;")
rep("$('carAskT').textContent=`${t.n} · race ${(i&3)+1} of 4 · ${Math.round(t.k*100)}% speed`;",
    "$('carAskT').textContent=`${t.n} · ${clsName(t.k)} · race ${(i&3)+1} of 4 · ${Math.round(t.k*100)}% speed`;")
# the picks: on the track page, and the host's in the lobby
rep("const setMode=tr=>{S.trial=tr;S.car=null;",
r'''/* the class picks (Prototype 47): the track page's (Race and Time trial) and the room host's */
function clsFill(sel,k){if(!sel||!REAL)return;if(!sel.options.length)for(const c of CLS){const o=document.createElement('option');o.value=c.k;o.textContent=c.n+' · '+Math.round(c.f*100)+'%';sel.appendChild(o)}if(sel.value!==k)sel.value=k}
function clsSync(){clsFill($('clsSel'),clsFree);const n=$('clsNote');if(n)n.textContent=clsFree==='redline'?'':'Online board: Redline only';clsFill($('mpCls'),mp.cls)}
if(REAL){$('clsSel').onchange=e=>{clsFree=clsOf(e.target.value).k;store.set('hoverline.cls',clsFree);clsSync();updateMenuBest()};
  $('mpCls').onchange=e=>{mp.cls=clsOf(e.target.value).k;store.set('hoverline.mpcls',mp.cls);mpPushInfo()};clsSync()}
const setMode=tr=>{S.trial=tr;S.car=null;''')
rep("const mp={on:false,sess:null,laps:3,fill:true,",
    "const mp={on:false,sess:null,laps:3,fill:true,cls:(k=>['glide','surge','rush','redline'].includes(k)?k:'redline')(store.get('hoverline.mpcls')),")
rep("function mpTrackInfo(){return{seed,wk:wid,cx:cplx,lk:lenK,sp:spec?specStr(spec):null,bm:bioTok(),laps:mp.laps,fill:mp.fill}}",
    "function mpTrackInfo(){return{seed,wk:wid,cx:cplx,lk:lenK,sp:spec?specStr(spec):null,bm:bioTok(),laps:mp.laps,fill:mp.fill,cls:mp.cls}}")
rep("function mpApplyInfo(info){if(!info||info.seed==null)return;mp.laps=info.laps||3;mp.fill=info.fill!==false;",
    "function mpApplyInfo(info){if(!info||info.seed==null)return;mp.laps=info.laps||3;mp.fill=info.fill!==false;mp.cls=clsOf(info.cls).k;clsSync();")
rep("S.raceT=-3;S.shake=0;S.cls=S.aiK=1;lowWarn=false;", "S.raceT=-3;S.shake=0;S.aiK=1;mp.cls=clsOf(pl.cls).k;S.cls=clsOf(pl.cls).f;lowWarn=false;")
rep("${info.laps||3} lap${(info.laps||3)>1?'s':''}`:'';", "${info.laps||3} lap${(info.laps||3)>1?'s':''} · ${clsOf(info.cls).n}`:'';clsFill($('mpCls'),mp.cls);")
rep("function mpLeaveRoom(){lanStop();chirpStop();", "function mpLeaveRoom(){lanStop();chirpStop();mp.cls=clsOf(store.get('hoverline.mpcls')).k;clsSync();")
# pads and keys: left and right change a pick, A steps it on
rep("  if(cur.type==='range'&&(d==='l'||d==='r')){navRange(cur,d==='r'?1:-1);return}",
    "  if(cur.type==='range'&&(d==='l'||d==='r')){navRange(cur,d==='r'?1:-1);return}\n  if(cur.tagName==='SELECT'&&(d==='l'||d==='r')){navSel(cur,d==='r'?1:-1);return}")
rep("  if(cur.type==='range')return;if(cur.dataset&&cur.dataset.osk",
    "  if(cur.type==='range')return;if(cur.tagName==='SELECT'){navSel(cur,1);return}if(cur.dataset&&cur.dataset.osk")
rep("function navBack(){", "function navSel(e,k){const n=e.options.length;if(!n)return;e.selectedIndex=((e.selectedIndex+k)%n+n)%n;e.dispatchEvent(new Event('change',{bubbles:true}));audio.sfx('ui_move')}\nfunction navBack(){")

# =====================================================================================================================
# QR codes: alphanumeric mode for codes in capitals and digits (pairing codes become version 5 or 6, not 7 or 8)
rep('''  return function qr(text,forceMask){
    const bytes=[...new TextEncoder().encode(text)];let v=1;
    for(;v<=20;v++){if(4+(v<10?8:16)+bytes.length*8<=dataCodewords(v)*8)break}if(v>20)throw new Error('too long for a QR code');
    const bits=[],put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
    put(4,4);put(bytes.length,v<10?8:16);for(const b of bytes)put(b,8);''',
'''  /* Prototype 47: text of capitals, digits and a few marks goes in alphanumeric mode (two letters in 11 bits, not 16), so a
     pairing code is a version 5 or 6 symbol (37 or 41 modules a side) instead of 7 or 8: bigger squares, easier to scan */
  const AN='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  return function qr(text,forceMask){
    const an=/^[0-9A-Z $%*+\\-./:]+$/.test(text),bytes=an?null:[...new TextEncoder().encode(text)],nc=an?text.length:bytes.length;let v=1;
    const need=v=>4+(an?(v<10?9:11):(v<10?8:16))+(an?11*(nc>>1)+6*(nc&1):nc*8);
    for(;v<=20;v++){if(need(v)<=dataCodewords(v)*8)break}if(v>20)throw new Error('too long for a QR code');
    const bits=[],put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
    if(an){put(2,4);put(nc,v<10?9:11);for(let i=0;i+1<nc;i+=2)put(AN.indexOf(text[i])*45+AN.indexOf(text[i+1]),11);if(nc&1)put(AN.indexOf(text[nc-1]),6)}
    else{put(4,4);put(nc,v<10?8:16);for(const b of bytes)put(b,8)}''')

# =====================================================================================================================
# LAN: codes in the chirp's packed format (with its CRC), 8-bit tags, crypto for the session id
rep("function toSdp(o,setup){return['v=0','o=- '+(1e9+Math.floor(Math.random()*1e9))+' 2 IN IP4 127.0.0.1',",
    "function toSdp(o,setup){return['v=0','o=- '+(1e9+crypto.getRandomValues(new Uint32Array(1))[0]%1e9)+' 2 IN IP4 127.0.0.1',")
cut("  /* a code: HL, then base 32 of [version, kind (0 host, 1 reply), room (5 letters), tag (2 bytes), ufrag, password,",
    "o.cands.push({a,port:rd()<<8|rd()})}\n      return o}catch(e){return null}}\n",
r'''  /* a code (Prototype 47): HL, then base 32 of the same message a chirp carries (Chirp.pack: kind, room, tag, the ICE
     username and password, the DTLS fingerprint and one or two addresses, with a CRC-16), so a slip in typing is caught
     and the code is about a fifth shorter: 111 letters for a reply, 120 for an invitation with two addresses, shown in
     groups of five. "HL" may be left off when typing; O reads as 0, I and L as 1. Codes from Prototypes 31 to 46 (raw
     bytes, no check) still read. */
  function pack(o){return'HL'+b32(Chirp.pack({speed:'fastest',slot:0,...o}))}
  const codeOf=bytes=>'HL'+b32(bytes);
  const clean=text=>{const t=String(text||'').toUpperCase().replace(/[^0-9A-Z]/g,'');return t.startsWith('HL')?t:'HL'+t};
  function unpack(text){const B=unb32(clean(text).slice(2)),o=B.length>=40?Chirp.unpack(Uint8Array.from(B)):null;return o||unpackOld(B)}
  function unpackOld(B){let i=0;const rd=()=>{if(i>=B.length)throw 0;return B[i++]};
    try{if(rd()!==1)return null;const o={kind:rd(),code:'',cands:[]};for(let k=0;k<5;k++)o.code+=String.fromCharCode(rd());o.code=o.code.replace(/\?/g,'');o.tag=rd()<<8|rd();
      const str=()=>{const n=rd(),e=[];for(let k=0;k<n;k++)e.push(rd());return new TextDecoder().decode(new Uint8Array(e))};o.uf=str();o.pw=str();
      const fp=[];for(let k=0;k<32;k++)fp.push(rd().toString(16).toUpperCase().padStart(2,'0'));o.fp=fp.join(':');
      const nc=rd();for(let k=0;k<nc;k++){const ty=rd();let a;if(ty===16){let h='';for(let q=0;q<16;q++)h+=rd().toString(16).padStart(2,'0');a=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}.local`}else{const q=[];for(let z=0;z<4;z++)q.push(rd());a=q.join('.')}o.cands.push({a,port:rd()<<8|rd()})}
      return o}catch(e){return null}}
  /* one slip in typing (a wrong, missing or extra letter) is put right where exactly one such change gives a code that
     checks out and fits (fits: on the host, a reply for this room to an invitation still open). A CRC alone would let one
     in twenty wrong guesses through over the 7,000 tried; the room and the tag make that about one in a million. */
  function repair(text,fits){const t=clean(text).slice(2);if(t.length<80||t.length>150)return null;const seen=new Set(),hits=[];
    const test=(u,at)=>{if(hits.length>1||seen.has(u))return;seen.add(u);const B=unb32(u);if(B.length<40)return;const o=Chirp.unpack(Uint8Array.from(B));if(o&&fits(o))hits.push({o,at})};
    for(let i=0;i<t.length;i++){for(const c of B32)if(c!==t[i])test(t.slice(0,i)+c+t.slice(i+1),i);test(t.slice(0,i)+t.slice(i+1),i)}
    for(let i=0;i<=t.length;i++)for(const c of B32)test(t.slice(0,i)+c+t.slice(i),i);
    return hits.length===1?{o:hits[0].o,group:Math.floor((hits[0].at+2)/5)+1}:null}
  /* why a code didn't read, in a line */
  function why(text){const n=clean(text).length-2;return n<90?`That code is too short (${n} letters): it has about 110.`:n>140?'That is longer than a Hoverline code: check nothing else was pasted with it.':'That code has a slip in it somewhere: check it against the screen, five letters at a time.'}
''')
rep("async function offer(opt){const pc=new RTCPeerConnection({iceServers:[]}),ch=pc.createDataChannel('hl',{ordered:true}),tag=opt&&opt.tag!=null?opt.tag:crypto.getRandomValues(new Uint16Array(1))[0];let gid=null;",
    "async function offer(opt){const pc=new RTCPeerConnection({iceServers:[]}),ch=pc.createDataChannel('hl',{ordered:true}),tag=opt&&opt.tag!=null?opt.tag&255:(()=>{for(let k=0;k<32;k++){const t=crypto.getRandomValues(new Uint8Array(1))[0];if(!L.pending.has(t))return t}return 0})();let gid=null;")
rep("return opt&&opt.raw?{...o,kind:0,code:L.code,tag,sdp:pc.localDescription.sdp}:pack({...o,kind:0,code:L.code,tag})}",
    "const sdp=pc.localDescription.sdp;if(!(opt&&opt.raw))PDG.ev('invitation made',{tag,addresses:Chirp.pickCands(sdp,2).map(c=>PDG.addr(c.a))});\n"
    "    return opt&&opt.raw?{...o,kind:0,code:L.code,tag,sdp}:pack({...o,cands:Chirp.pickCands(sdp,2),kind:0,code:L.code,tag})}")
rep("async function accept(text){const o=typeof text==='string'?unpack(text):text;if(!o)throw new Error('That isn\\'t a Hoverline Wi-Fi code.');if(o.kind!==1)throw new Error('That is a host code: scan the reply on the pilot\\'s screen instead.');",
    "async function accept(text){const o=typeof text==='string'?unpack(text):text;if(!o)throw new Error(why(text));if(o.kind!==1)throw new Error('That is an invitation (a host\\'s code): scan or type the reply on the pilot\\'s screen.');")
rep("const p=L.pending.get(o.tag);if(!p)throw new Error('That reply is for an old code. Ask the pilot to scan the code on screen now.');",
    "const p=L.pending.get(o.tag);if(!p)throw new Error('That reply is for an old invitation. Ask the pilot to take the code on screen now.');")
rep("async function answer(text){const o=unpack(text);if(!o)throw new Error('That isn\\'t a Hoverline Wi-Fi code.');if(o.kind!==0)throw new Error('That is a reply code: scan the code on the host\\'s screen.');",
    "async function answer(text){const o=typeof text==='string'?unpack(text):text;if(!o)throw new Error(why(text));if(o.kind!==0)throw new Error('That is a reply code: scan or type the code on the host\\'s screen.');")
rep("L.host=g;return{reply:pack({...fromSdp(pc.localDescription.sdp),kind:1,code:o.code,tag:o.tag}),code:o.code,open:g.open}}",
    "L.host=g;const sdp=pc.localDescription.sdp;return{reply:pack({...fromSdp(sdp),cands:Chirp.pickCands(sdp,1),kind:1,code:o.code,tag:o.tag}),code:o.code,open:g.open,pc}}")
rep("return{L,offer,accept,answer,link,pack,unpack,fromSdp,toSdp,qr:QR,ok:typeof RTCPeerConnection!=='undefined'}})();",
    "return{L,offer,accept,answer,link,pack,unpack,why,repair,code:pack,codeOf,fromSdp,toSdp,qr:QR,ok:typeof RTCPeerConnection!=='undefined'}})();")
rep('''  lan:'For one Wi-Fi with no internet, from any copy of the game. The host creates a room and shows a code; each pilot taps Join a Wi-Fi room, scans it with the camera and shows a reply for the host to scan. A device without a camera can type the code instead. The host relays the race, so keep the host\\'s device in the room.',''',
    '''  lan:'No internet needed: everyone on one Wi-Fi, or one phone\\'s hotspot. The host invites, each pilot replies, then they connect directly. By code: the pilot scans or types the host\\'s code, then the host scans or types the pilot\\'s reply. The host relays the race, so keep the host\\'s device in the room.',''')
rep("    LAN.L.role='host';LAN.L.id=null;await lanCamProbe();mpConnect(HLNet.roomCode(),true);lanHostNext();return}",
    "    PDG.start('host','code');LAN.L.role='host';LAN.L.id=null;await lanCamProbe();mpConnect(HLNet.roomCode(chirpRnd),true);lanHostNext();return}")
rep("$('lanJoin').onclick=()=>{if(!LAN.ok){mpEl.mpErr.textContent='This browser can\\'t do Wi-Fi rooms (no WebRTC).';return}lan.mode='guest';lanUI('Join by QR code','Scan the code on the host\\'s screen, or type it in below.',null);lanShow(true)};",
    "$('lanJoin').onclick=()=>{if(!LAN.ok){mpEl.mpErr.textContent='This browser can\\'t do Wi-Fi rooms (no WebRTC).';return}PDG.start('guest','code');lan.mode='guest';lan.helper=false;lanCamCheck();\n"
    "  lanUI({title:'Join by code',steps:LAN_GUEST,cur:0,scan:'Scan the host\\'s code',input:'type the host\\'s code'});lanShow(true)};")

# =====================================================================================================================
# The pairing screens: codes (the box under the sound box, or on its own)
cut("/* Wi-Fi, no internet: swapping codes (see LAN). The host's box shows the code for the next pilot and scans their replies;",
    "$('lanCancel').onclick=()=>{if(lan.mode==='host'){lanShow(false);return}lanStop();if(LAN.L.host)try{LAN.L.host.pc.close()}catch(e){}LAN.L.host=null};",
r'''/* ---------- Same room, no internet: the pairing screens (codes Prototype 31, sound 44, steps and mixing 47) ----------
   One device hosts and invites; each pilot's device answers with a reply; then the two connect directly over the Wi-Fi
   (or a phone's hotspot), with no server. Each leg is one message: the host's invitation (LAN.offer), then the pilot's
   reply (LAN.answer). By sound (below) the devices swap both by themselves. By code each is shown as a QR code and as
   text and the other device scans or types it: first the pilot takes the host's code, then the host takes the pilot's
   reply. The two mix a leg at a time: a pilot listening for the call can scan or type the invitation instead (its reply
   still goes out by sound, and shows as a code), and a host calling by sound can show its code and take a reply by scan
   or typing. lan.mode: 'host' or 'guest' while pairing; lan.helper: the code box belongs under the sound box (Use a code
   opens it: lan.open) rather than standing on its own. */
const lan={mode:null,stream:null,scanning:false,code:null,helper:false,open:false,noCam:false,ui:null};
function lanShow(on){const b=$('lanBox');b.hidden=!on;b.classList.toggle('helper',!!(on&&lan.helper));if(!on){lanCamOff();$('lanMsg').textContent=''}
  if(!lan.helper&&lan.mode==='guest')mpEl.mpOut.hidden=on||!!mp.sess}
function lanStop(){lanShow(false);lan.mode=null;lan.code=null;lan.helper=false;lan.open=false;lan.ui=null}
function stepsHtml(list,cur){return'<ol class="steps">'+list.map((t,i)=>`<li class="${i<cur?'done':i===cur?'cur':''}">${t}</li>`).join('')+'</ol>'}
const codeGroups=c=>String(c||'').replace(/(.{5})/g,'$1 ').trim();
function qrDraw(c,code){const M=LAN.qr(code),n=M.length+8,k=Math.max(2,Math.floor(c.width/n)),g=c.getContext('2d'),o=Math.floor((c.width-k*M.length)/2);g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#000';
  M.forEach((row,y)=>row.forEach((d,x)=>{if(d)g.fillRect(o+x*k,o+y*k,k,k)}))}
/* o: title; steps (a list, or a function giving one) with cur the step to do now, or a one-line note; code (the one this
   device shows); scan (the camera button's label, or none); input (the typing box's hint, or none) */
function lanUI(o){lan.ui=o;lan.code=o.code||null;$('lanTitle').textContent=o.title||'';const st=typeof o.steps==='function'?o.steps():o.steps;
  $('lanSteps').innerHTML=(st?stepsHtml(st,o.cur==null?-1:o.cur):'')+(o.note?`<p class="small">${o.note}</p>`:'');
  const host=lan.mode==='host',showQ=!!lan.code;
  $('lanTxt').hidden=!showQ;$('lanTxt').textContent=showQ?codeGroups(lan.code):'';$('lanCopy').hidden=!showQ;
  const b=$('lanScan');b.hidden=!o.scan||lan.noCam&&!lan.scanning;b.textContent=lan.scanning?'Stop the camera':o.scan||'';b.classList.toggle('go',!lan.helper);
  $('lanInRow').hidden=!o.input;$('lanIn').placeholder=o.input||'';
  const cn=$('lanCancel');cn.hidden=lan.helper;cn.textContent=host?'Done':'Cancel';
  const c=$('lanQR');c.hidden=!showQ||lan.scanning;if(showQ)try{qrDraw(c,lan.code)}catch(e){c.hidden=true}}
const lanRedraw=()=>{if(lan.ui)lanUI(lan.ui)};
const lanSay=t=>{$('lanMsg').textContent=t};
/* the steps by code, as the screens say them */
const LAN_HOST=()=>['<b>Invite</b> · each pilot taps <b>Join</b>, then scans this code or types it in.','<b>Reply</b> · the pilot\'s screen then shows a reply code.',
  `<b>Take the reply</b> · ${lan.noCam?'type it in below':'scan it here, or type it in'}. Then the next pilot.`];
const LAN_GUEST=()=>[`<b>Invitation</b> · ${lan.noCam?'type in':'scan, or type in,'} the code on the host's screen.`,'<b>Reply</b> · show the host the reply code that appears here.','<b>Join</b> · you\'re in the lobby as soon as the host has it.'];
/* no camera at all (a Steam Deck, most desktops): no Scan buttons, only typing. A browser that lists no devices before
   it is allowed to keeps the button and finds out on the tap. */
function lanCamCheck(){try{navigator.mediaDevices.enumerateDevices().then(ds=>{const none=ds.length>0&&!ds.some(d=>d.kind==='videoinput');if(none!==lan.noCam){lan.noCam=none;lanRedraw()}}).catch(()=>{})}catch(e){}}
async function lanCamProbe(){try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});st.getTracks().forEach(t=>t.stop())}catch(e){}}
function lanCamOff(){lan.scanning=false;if(lan.stream){lan.stream.getTracks().forEach(t=>t.stop());lan.stream=null}const v=$('lanCam');v.hidden=true;v.srcObject=null}
/* jsQR 1.4.0 (Apache-2.0, Cosmo Wolfe, github.com/cozmo/jsQR, about 130 KB) sits in the page as text (#jsqrJs) and runs
   only when a scan starts in a browser that can't read QR codes itself: Firefox (the Steam Deck, Firefox on Android),
   and Android browsers whose built-in reader is missing or fails (it needs Google's barcode service). */
let JSQR=null;
function jsqrLib(){if(JSQR)return JSQR;try{if(typeof window.jsQR!=='function'){const el=document.getElementById('jsqrJs');if(!el)return null;const s=document.createElement('script');s.textContent=el.textContent;document.head.appendChild(s);s.remove()}
  JSQR=typeof window.jsQR==='function'?window.jsQR:null}catch(e){JSQR=null}return JSQR}
/* the camera: the browser's own QR reader where it has one that works, else jsQR on frames drawn to a canvas (720 px at
   most); a built-in reader that throws three times, or sees nothing for 4 s, hands over to jsQR (or shares with it) */
async function lanScan(){if(lan.scanning){lanCamOff();lanRedraw();lanSay('');return}
  const C=PDG.cur&&PDG.cur.qr;if(C)C.scans++;const md=navigator.mediaDevices;
  if(!(md&&md.getUserMedia)){lan.noCam=true;lanRedraw();lanSay('This browser has no camera here: type the code in instead.');return}
  try{lan.stream=await md.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}})}
  catch(e){const n=e&&e.name;PDG.err('camera',e);if(PDG.cur)PDG.cur.camera=n||'error';
    if(n==='NotFoundError'||n==='OverconstrainedError'||n==='NotReadableError'&&!lan.stream){lan.noCam=n==='NotFoundError';lanRedraw();lanSay(n==='NotReadableError'?'The camera is busy in another app: type the code in instead.':'No camera on this device: type the code in instead.')}
    else lanSay('The camera isn\'t allowed here: allow it, or type the code in instead.');return}
  if(PDG.cur)PDG.cur.camera='allowed';
  const v=$('lanCam');v.srcObject=lan.stream;$('lanQR').hidden=true;v.hidden=false;try{await v.play()}catch(e){}lan.scanning=true;lanRedraw();lanSay('Point the camera at the code…');
  let nat=null;if(typeof window.BarcodeDetector==='function'){try{const f=BarcodeDetector.getSupportedFormats?await BarcodeDetector.getSupportedFormats():['qr_code'];if(f.includes('qr_code'))nat=new BarcodeDetector({formats:['qr_code']})}catch(e){nat=null}}
  if(C)C.reader=nat?'built in':'jsQR';let fails=0,k=0,cv=null,g=null;const t0=performance.now();
  const js=()=>{const J=jsqrLib();if(!J)return null;const w=v.videoWidth,h=v.videoHeight;if(!w||!h)return null;const z=Math.min(1,720/Math.max(w,h));
    if(!cv){cv=document.createElement('canvas');g=cv.getContext('2d',{willReadFrequently:true})}cv.width=Math.round(w*z);cv.height=Math.round(h*z);g.drawImage(v,0,0,cv.width,cv.height);
    const r=J(g.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'});return r&&r.data||null};
  while(lan.scanning){let txt=null,by=null;k++;
    if(nat)try{const r=await nat.detect(v);const h=r.find(x=>/^HL/i.test(x.rawValue||''));if(h){txt=h.rawValue;by='built in'}}catch(e){if(++fails>=3){nat=null;if(C){C.reader='jsQR (the built-in reader failed)';C.errors++}}}
    if(!txt&&lan.scanning&&(!nat||performance.now()-t0>4000&&k%2))try{const t=js();if(t&&/^HL/i.test(t)){txt=t;by='jsQR'}}catch(e){if(C)C.errors++}
    if(txt){if(C){C.found++;C.by=by}lanCamOff();lanSay('');lanUse(txt,'scanned');return}
    await new Promise(r=>setTimeout(r,nat?180:120))}}
/* a code scanned or typed: on the host a pilot's reply, on a pilot the host's invitation */
async function lanUse(text,how){text=String(text||'').trim();if(!text)return;$('lanIn').value='';const C=PDG.cur&&PDG.cur.codes;if(C&&how!=='scanned')C.typed++;else if(C)C.scanned++;
  let o=LAN.unpack(text),fix=null;
  if(!o&&how!=='scanned'){const host=lan.mode==='host';fix=LAN.repair(text,host?x=>x.kind===1&&x.code===LAN.L.code&&LAN.L.pending.has(x.tag):x=>x.kind===0);if(fix){o=fix.o;PDG.ev('code put right',{group:fix.group})}}
  if(!o){if(C)C.bad++;lanSay(LAN.why(text));PDG.ev('code did not read',{letters:text.replace(/[^0-9A-Z]/gi,'').length});return}
  try{if(lan.mode==='host'){if(o.kind!==1)throw new Error('That is an invitation (a host\'s code): scan or type the reply on the pilot\'s screen.');
      lanSay('Connecting the pilot…');const p=await LAN.accept(o);if(fix)lanSay(`One letter in group ${fix.group} was off, and has been put right. Connecting the pilot…`);PDG.ev('reply by code',{tag:o.tag,how:how||'typed'});PDG.rtc(p.pc,how||'typed');
      if(chirp.mode==='host'){if(chirp.offer&&chirp.offer.tag===o.tag){chirp.offer=null;chirp.fresh=true}chirpWatch(p.pc)}
      else if(!lan.helper&&lan.ui)lanUI({...lan.ui,cur:2});
      setTimeout(()=>{if(/Connecting the pilot…$/.test($('lanMsg').textContent))lanSay('Still connecting… check the pilot is on this Wi-Fi.')},8000)}
    else if(lan.mode==='guest'){if(o.kind!==0)throw new Error('That is a reply code: scan or type the code on the host\'s screen.');
      PDG.ev('invitation by code',{tag:o.tag,how:how||'typed'});
      if(chirp.mode==='guest'){lanSay(fix?`One letter in group ${fix.group} was off, and has been put right.`:'');chirpGuestRx(o,'code');return}
      lanSay('Making your reply…');const res=await LAN.answer(o);PDG.rtc(res.pc,'code');if(PDG.cur)PDG.cur.codes.shown++;
      lanUI({title:'Show this reply to the host',steps:LAN_GUEST,cur:1,code:res.reply});lanSay(fix?`One letter in group ${fix.group} was off, and has been put right.`:'');
      res.open.then(()=>{if(lan.mode!=='guest')return;lanStop();PDG.ev('connected');PDG.end('joined');mpConnect(res.code,false)},e=>lanSay(String(e.message||e)))}}
  catch(e){lanSay(String(e&&e.message||e));PDG.err('code',e)}}
async function lanHostNext(){lan.mode='host';lan.helper=false;lan.open=false;lanCamCheck();lanShow(true);
  const ui=c=>lanUI({title:'Invite pilots by code',steps:LAN_HOST,cur:0,code:c,scan:'Scan a reply',input:'type a pilot\'s reply'});ui(null);
  try{const c=await LAN.offer();if(lan.mode==='host'&&!lan.helper){ui(c);if(PDG.cur)PDG.cur.codes.shown++}}catch(e){lanSay('Could not make a code: '+(e&&e.message||e));PDG.err('invitation',e)}}
LAN.L.onChange=what=>{if(lan.mode!=='host'||lan.helper)return;if(what==='joined'){PDG.ev('pilot joined');lanSay('A pilot joined. Invite the next one, or press Done.');lanHostNext()}mpRender()};
$('lanScan').onclick=lanScan;$('lanUse').onclick=()=>lanUse($('lanIn').value);$('lanIn').addEventListener('keydown',e=>{if(e.key==='Enter')lanUse($('lanIn').value)});
$('lanCopy').onclick=async()=>{try{await navigator.clipboard.writeText(lan.code);lanSay('Copied.')}catch(e){lanSay('Select the code above and copy it.')}};
$('lanCancel').onclick=()=>{if(lan.mode==='host'){lanStop();PDG.end('host done');return}lanStop();PDG.end('cancelled');if(LAN.L.host)try{LAN.L.host.pc.close()}catch(e){}LAN.L.host=null};''')

# =====================================================================================================================
# Pairing diagnostics, and the microphone and speaker (ChirpIO) with the meter, the envelope for the caller, Test sound
cut("/* Pairing by sound, the microphone and speaker (ChirpIO). One ggwave receiver listens to the microphone, resampled to",
    "    async reopen(){mic();return open()},get test(){return TEST}}})();",
r'''/* Pairing diagnostics (Prototype 47), for the race-log export (Options, Settings, Race data, Download all logs or Copy all
   logs), which carries them even with no race recorded: one record a pairing (Host a room, Join, Test sound, or by code),
   the last 8 kept in this browser (hoverline.pairlog). Each has the browser and what it offers (microphone, camera, QR
   reading, WebRTC), the microphone's answer and how long it took, its settings and label, the sample rates of the
   game's audio and of the microphone and which context took it, frames heard, the loudest input (peak and RMS) and the
   room's floor, in-band bursts (chirps detected), chirps decoded and the ones whose check passed, Test sound's result,
   the camera's answer and which QR reader read what, codes shown, scanned, typed and refused, the connections' states,
   errors, and how it ended. Addresses are kept to their first two numbers. Nothing here is sent anywhere. */
const PDG=(()=>{const K='hoverline.pairlog';let cur=null,saveT=0;
  const all=()=>{try{const a=JSON.parse(store.get(K)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
  const t=()=>cur?Math.round((performance.now()-cur.t0)/100)/10:0;
  function save(){clearTimeout(saveT);saveT=0;if(!cur)return;const a=all().filter(x=>x.id!==cur.id);a.push(cur);while(a.length>8)a.shift();store.set(K,JSON.stringify(a))}
  const later=()=>{if(!saveT)saveT=setTimeout(save,1500)};
  function start(role,how){if(cur&&cur.role===role){cur.how+=' then '+how;ev('switched to '+how);return cur}if(cur)end('replaced');
    const n=navigator,md=n.mediaDevices;
    cur={id:Date.now().toString(36)+Math.floor(performance.now()%1000),when:new Date().toISOString(),version:PUBV,role,how,
      browser:{ua:String(n.userAgent||'').slice(0,220),secure:window.isSecureContext!==false,framed,touch:coarse,view:[innerWidth,innerHeight]},
      has:{mic:!!(md&&md.getUserMedia),webrtc:typeof RTCPeerConnection!=='undefined',wasm:typeof WebAssembly==='object',audio:!!(window.AudioContext||window.webkitAudioContext),barcodeDetector:typeof window.BarcodeDetector==='function'},
      mic:null,sound:{sent:0,frames:0,peak:0,rms:0,floorDb:null,bursts:0,decoded:0,ok:0,bad:0,self:0},camera:null,qr:{scans:0,reader:null,found:0,by:null,errors:0},
      codes:{shown:0,scanned:0,typed:0,bad:0},rtc:[],events:[],errors:[],t0:performance.now()};
    try{md.enumerateDevices().then(ds=>{if(!cur)return;cur.has.mics=ds.filter(d=>d.kind==='audioinput').length;cur.has.cameras=ds.filter(d=>d.kind==='videoinput').length;later()}).catch(()=>{})}catch(e){}
    for(const nm of['microphone','camera'])try{n.permissions.query({name:nm}).then(p=>{if(cur){(cur.permission||(cur.permission={}))[nm]=p.state;later()}}).catch(()=>{})}catch(e){}
    try{BarcodeDetector.getSupportedFormats().then(f=>{if(cur){cur.has.barcodeQR=f.includes('qr_code');later()}}).catch(()=>{})}catch(e){}
    later();return cur}
  function ev(e,o){if(!cur)return;if(cur.events.length<150)cur.events.push({t:t(),e,...(o||{})});later()}
  function err(where,e){if(!cur)return;if(cur.errors.length<30)cur.errors.push({t:t(),where,name:e&&e.name||undefined,msg:String(e&&e.message||e).slice(0,200)});later()}
  /* a connection's states, as they change */
  function rtc(pc,via){if(!cur||!pc||cur.rtc.length>=12)return;const r={via,t:t(),states:[]};cur.rtc.push(r);
    const on=()=>{if(r.states.length<24)r.states.push(t()+' '+pc.connectionState+'/'+pc.iceConnectionState);later()};pc.addEventListener('connectionstatechange',on);pc.addEventListener('iceconnectionstatechange',on)}
  function end(how){if(!cur)return null;const d=cur;d.outcome=how;d.secs=t();const st=mp.sess&&mp.sess.state;if(st)d.roster=st.roster.length;delete d.t0;cur=d;save();cur=null;return d}
  const addr=a=>/\.local$/i.test(a)?'mDNS name':String(a).split('.').slice(0,2).join('.')+'.x.x';
  return{start,ev,err,rtc,end,addr,save:later,all(){save();return all()},get cur(){return cur}}})();
/* Pairing by sound, the microphone and speaker (ChirpIO). One ggwave receiver listens to the microphone, resampled to
   48 kHz in whole frames, and hands every message that passes Chirp's CRC to onRx. tx plays a message straight to the
   speaker, past the game's sound settings, so it plays with the game's sound off too. busy() says another phone is
   chirping right now (the chirp's band well over the room's floor for a moment), and startedAfter(t) that one began
   after time t, so nobody talks over anyone.
   ggwave (MIT, Georgi Gerganov, github.com/ggerganov/ggwave, version 0.4.0: about 150 KB with its WebAssembly) sits in the
   page as text (#ggwaveJs) and only runs when pairing starts. The receiver listens for the audible protocols and
   ultrasound fast (which a host only calls with when the page is opened with ?chirp=ultra, for trying it on real phones).
   Prototype 47: meter() is the microphone's level for the meter and the caller's eyes; txLevel() the loudness of the
   chirp playing now (its envelope, taken from the samples), for the caller's jaw; selfTest(speed) plays a short call of
   its own and says whether this device heard it. Every frame, decode and chirp also counts in the pairing record (PDG).
   Test hooks: ?nbtest=1 with window.nbAirTx swaps the sound for the tests' simulated room (window.__nbAir.rx/busy; a
   Test sound call comes back to the device itself unless window.__nbDeaf, and window.__nbLevel stands in for the
   meter); ?nbtap=1 keeps the last chirp played (ChirpIO.last, 48 kHz) so a test can turn it into a WAV. */
const ChirpIO=(()=>{
  const TEST=/[?&]nbtest=1/.test(location.search)&&typeof window.nbAirTx==='function',TAP=/[?&]nbtap=1/.test(location.search),VOL=60;
  let G=null,inst=null,loading=null;
  const io={ctx:null,stream:null,src:null,proc:null,sink:null,onRx:null,onSelf:null,test:null,txUntil:0,txAt:0,env:null,busyT:-1e9,busyOn:-1e9,blipT:-1e9,hot:0,floor:0.003,lv:0,ml:0,mp:0,mpT:0,last:null};
  const can=()=>TEST||!!(window.isSecureContext!==false&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&typeof WebAssembly==='object'&&(window.AudioContext||window.webkitAudioContext)&&document.getElementById('ggwaveJs'));
  function lib(){if(G)return Promise.resolve(G);if(loading)return loading;
    loading=(async()=>{const txt=document.getElementById('ggwaveJs').textContent,m=txt.match(/data:application\/octet-stream;base64,([A-Za-z0-9+/=]+)/);
      const bin=Uint8Array.from(atob(m[1]),c=>c.charCodeAt(0));
      if(typeof window.ggwave_factory!=='function'){const s=document.createElement('script');s.textContent=txt;document.head.appendChild(s);s.remove()}
      const g=await window.ggwave_factory({print(){},printErr(){},wasmBinary:bin});
      for(const k of Object.keys(g.ProtocolId))if(/^GGWAVE_PROTOCOL_/.test(k))try{g.rxToggleProtocol(g.ProtocolId[k],/AUDIBLE|ULTRASOUND_FAST$/.test(k)?1:0)}catch(e){}
      const p=g.getDefaultParameters();p.sampleRateInp=48000;p.sampleRateOut=48000;p.sampleFormatInp=g.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;p.sampleFormatOut=g.SampleFormat.GGWAVE_SAMPLE_FORMAT_F32;
      inst=g.init(p);G=g;return g})();
    loading.catch(e=>{loading=null;PDG.err('ggwave',e)});return loading}
  /* the chirp's band (about 1.6 to 7 kHz), for busy() */
  const bq=(()=>{const w=2*Math.PI*3600/48000,al=Math.sin(w)/(2*0.75),a0=1+al;return{b0:al/a0,b2:-al/a0,a1:-2*Math.cos(w)/a0,a2:(1-al)/a0,x1:0,x2:0,y1:0,y2:0}})();
  /* Test sound's own call: HLT and three random bytes (every pairing message starts with the bits 10, never an H) */
  const SELF=[72,76,84];
  /* the meter: the whole band, -66 to -12 dB full scale, with a peak that holds 1.5 s */
  const dbLv=r=>r>1e-7?clamp((20*Math.log10(r)+66)/54,0,1):0;
  function frame(f){const D=PDG.cur&&PDG.cur.sound,now=performance.now();
    let w=0,pk=0;for(let i=0;i<f.length;i++){const x=f[i];w+=x*x;const a=x<0?-x:x;if(a>pk)pk=a}w=Math.sqrt(w/f.length);
    const m=dbLv(w);io.ml=Math.max(m,io.ml*0.9);if(m>=io.mp||now-io.mpT>1500){io.mp=m;io.mpT=now}
    if(D){D.frames++;if(pk>D.peak)D.peak=+pk.toFixed(4);if(w>D.rms)D.rms=+w.toFixed(5)}
    if(G){const r=G.decode(inst,new Int8Array(f.buffer,f.byteOffset,f.length*4));if(r&&r.length){const u=new Uint8Array(r);if(D)D.decoded++;
      if(u[0]===SELF[0]&&u[1]===SELF[1]&&u[2]===SELF[2]){if(D)D.self++;const tt=io.test;if(tt&&u.length===tt.length&&tt.every((x,i)=>u[i]===x)&&io.onSelf)io.onSelf()}
      else{const o=Chirp.unpack(u);if(o){if(D)D.ok++;if(io.onRx)try{io.onRx(o)}catch(e){console.error(e)}}else if(D)D.bad++}}}
    let s=0;const q=bq;for(let i=0;i<f.length;i++){const x=f[i],y=q.b0*x+q.b2*q.x2-q.a1*q.y1-q.a2*q.y2;q.x2=q.x1;q.x1=x;q.y2=q.y1;q.y1=y;s+=y*y}
    const rms=Math.sqrt(s/f.length),mine=now<io.txUntil;
    if(!mine)io.floor=rms<io.floor?Math.max(rms,2e-4):io.floor*1.003;
    // a chirp is in-band sound with no gaps: 3 frames (64 ms) of it in a quiet room; once short bursts (talk, beats) have
    // been heard in the last 10 s, 12 frames (a quarter of a second), so noise doesn't look like another phone answering
    if(!mine&&rms>Math.max(io.floor*6,0.002))io.hot++;else{if(io.hot>=3&&io.hot<12)io.blipT=now;io.hot=0}
    const need=now-io.blipT<10000?12:3;if(io.hot>=need)io.busyT=now;if(io.hot===need){io.busyOn=now;if(D)D.bursts++}
    io.lv=Math.max(rms>io.floor?Math.min(1,Math.log(rms/io.floor)/4):0,io.lv*0.8);if(D&&D.frames%47===1)D.floorDb=Math.round(20*Math.log10(io.floor))}
  /* the microphone, with the phone's call processing off (it would cancel or squash the chirps). Resolves to null, or why not. */
  async function open(){if(TEST){if(PDG.cur)PDG.cur.mic={result:'test room'};return null}if(io.stream)return null;if(!can())return'unsupported';
    const AC=window.AudioContext||window.webkitAudioContext,ctx=io.ctx=audio.ctx||io.ctx||new AC();try{ctx.resume()}catch(e){}
    const lp=lib();lp.catch(()=>{});let st;const t0=performance.now(),M={};if(PDG.cur)PDG.cur.mic=M;
    try{st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1}})}
    catch(e){const n=e&&e.name;M.result=n||'error';M.msg=String(e&&e.message||'').slice(0,160);M.ms=Math.round(performance.now()-t0);PDG.save();
      return n==='NotAllowedError'||n==='SecurityError'||n==='PermissionDeniedError'?'denied':n==='NotFoundError'||n==='OverconstrainedError'||n==='NotReadableError'?'nomic':'denied'}
    M.result='allowed';M.ms=Math.round(performance.now()-t0);
    try{await lp}catch(e){st.getTracks().forEach(t=>t.stop());M.lib=String(e&&e.message||e).slice(0,120);return'lib'}
    try{ctx.resume()}catch(e){}
    const tr=st.getAudioTracks()[0],se=(tr&&tr.getSettings&&tr.getSettings())||{};
    M.track={label:String(tr&&tr.label||'').slice(0,60),sampleRate:se.sampleRate,channels:se.channelCount,echoCancellation:se.echoCancellation,autoGainControl:se.autoGainControl,noiseSuppression:se.noiseSuppression,muted:tr?tr.muted:undefined};
    M.gameRate=ctx.sampleRate;M.gameState=ctx.state;
    // Firefox can't connect a microphone to a context at another sample rate: then the receiver gets a context of its
    // own, at the microphone's rate where the browser says it, else at its default, else at the usual rates in turn
    let rx=ctx;io.stream=st;M.took='the game\'s audio';
    try{io.src=ctx.createMediaStreamSource(st)}catch(e){M.shared=String(e&&e.name||e);io.src=null;
      for(const r of[se.sampleRate,0,48000,44100,32000,16000,96000]){if(r===undefined||r===null)continue;let c=null;
        try{c=r?new AC({sampleRate:r}):new AC();io.src=c.createMediaStreamSource(st);rx=io.rxCtx=c;M.took='its own context'+(r?' at '+r+' Hz':'');break}catch(e2){if(c)try{c.close()}catch(_){}}}
      if(!io.src){M.took='none';close();PDG.save();return'unsupported'}
      try{rx.resume()}catch(e){}}
    M.rate=rx.sampleRate;
    io.proc=rx.createScriptProcessor(2048,1,1);io.sink=rx.createGain();io.sink.gain.value=0;
    const rs=Chirp.resampler(rx.sampleRate,frame);io.proc.onaudioprocess=e=>rs(e.inputBuffer.getChannelData(0));
    io.src.connect(io.proc);io.proc.connect(io.sink);io.sink.connect(rx.destination);io.floor=0.003;io.busyT=-1e9;io.ml=io.mp=0;
    // no audio arriving 1.5 s on (a context the browser keeps suspended): ask it again, and note it in the record
    setTimeout(()=>{const D=PDG.cur&&PDG.cur.sound;if(io.proc&&D&&!D.frames){M.noFrames=rx.state;PDG.ev('no microphone frames',{state:rx.state});try{rx.resume()}catch(e){}}},1500);
    PDG.save();return null}
  function close(){if(io.play){try{io.play.stop()}catch(e){}io.play=null;io.txUntil=0}mic()}
  function mic(){if(io.proc){io.proc.onaudioprocess=null;try{io.src.disconnect();io.proc.disconnect();io.sink.disconnect()}catch(e){}}
    if(io.stream)io.stream.getTracks().forEach(t=>t.stop());if(io.rxCtx)try{io.rxCtx.close()}catch(e){}io.stream=io.src=io.proc=io.sink=io.rxCtx=null;io.lv=io.ml=io.mp=0}
  const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  /* the loudness of a chirp through its length (120 a second, the loudest 1), for the caller's jaw */
  const envOf=s=>{const W=400,n=Math.ceil(s.length/W),e=new Float32Array(n);let mx=1e-6;for(let i=0;i<n;i++){let a=0;const z=Math.min(s.length,(i+1)*W);for(let j=i*W;j<z;j++)a+=s[j]*s[j];e[i]=Math.sqrt(a/W);if(e[i]>mx)mx=e[i]}for(let i=0;i<n;i++)e[i]/=mx;return e};
  const envTest=d=>{const n=Math.ceil(d*120),e=new Float32Array(n);for(let i=0;i<n;i++){const t=i/120;e[i]=t<0.26?0.6*Math.exp(-t/0.12):t>d-0.12?0.15:0.78+0.22*Math.sin(i*1.3)*Math.sin(i*0.21)}return e};
  /* play one message; resolves when it has finished playing */
  async function tx(bytes,speed){speed=Chirp.PROTO[speed]?speed:'fast';const D=PDG.cur&&PDG.cur.sound;if(D)D.sent++;
    if(TEST){const d=Chirp.seconds(bytes.length,speed);io.env=envTest(d);io.txAt=performance.now();io.txUntil=io.txAt+d*1000;
      if(bytes===io.test){if(!window.__nbDeaf)setTimeout(()=>{if(D)D.self++;if(io.onSelf)io.onSelf()},d*1000-100)}else window.nbAirTx(hex(bytes),speed,d);
      await new Promise(r=>setTimeout(r,d*1000));return}
    const g=await lib(),ctx=io.ctx||audio.ctx;if(!ctx)return;
    const s=Chirp.shape(new Float32Array(new Int8Array(g.encode(inst,bytes,g.ProtocolId[Chirp.PROTO[speed].id],VOL)).buffer));if(TAP)io.last=s;io.env=envOf(s);
    try{ctx.resume()}catch(e){}
    const b=ctx.createBuffer(1,s.length,48000);b.getChannelData(0).set(s);const src=ctx.createBufferSource(),gn=ctx.createGain();gn.gain.value=0.9;
    src.buffer=b;src.connect(gn);gn.connect(ctx.destination);const d=s.length/48000;io.txUntil=performance.now()+(d+0.15)*1000;src.start();io.play=src;
    io.txAt=performance.now()+((ctx.outputLatency||ctx.baseLatency||0)*1000);
    await new Promise(r=>{src.onended=r;setTimeout(r,(d+0.4)*1000)});if(io.play===src)io.play=null}
  /* Test sound: a short call of its own, then up to 1.2 s to hear it */
  async function selfTest(speed){const msg=Uint8Array.from([...SELF,...crypto.getRandomValues(new Uint8Array(3))]);let heard=false;io.test=msg;io.onSelf=()=>{heard=true};
    try{await tx(msg,speed);const t0=performance.now();while(!heard&&performance.now()-t0<1200)await new Promise(r=>setTimeout(r,60))}finally{io.onSelf=null;io.test=null}return heard}
  if(TEST)window.__nbAir={rx(h){const b=new Uint8Array(h.length/2);for(let i=0;i<b.length;i++)b[i]=parseInt(h.substr(i*2,2),16);const o=Chirp.unpack(b);if(o&&io.onRx)io.onRx(o)},busy(ms){io.busyOn=performance.now();io.busyT=io.busyOn+ms-200}};
  return{can,open,close,tx,lib,selfTest,get last(){return io.last},set onRx(f){io.onRx=f},
    busy:()=>performance.now()-io.busyT<200&&performance.now()>io.txUntil,startedAfter:t=>io.busyOn>t,sending:()=>performance.now()<io.txUntil,level:()=>io.lv,
    isOpen:()=>TEST||!!io.stream,
    meter:()=>TEST?{lv:+window.__nbLevel||0,pk:+window.__nbLevel||0}:{lv:io.ml,pk:io.mp},
    txLevel(){const now=performance.now();if(!io.env||now>io.txUntil)return 0;const i=Math.floor((now-io.txAt)/1000*120);return i<0?0:Math.pow(io.env[Math.min(io.env.length-1,i)]||0,0.7)},
    async reopen(){mic();return open()},get test(){return TEST}}})();''')

# =====================================================================================================================
# The pairing screens: by sound, with the caller, the meter, the numbered steps, codes per leg and Test sound
cut("/* Pairing by sound, the screens.\n",
    "document.addEventListener('visibilitychange',()=>{if(!document.hidden&&chirp.mode&&audio.ctx)try{audio.ctx.resume()}catch(e){}});",
r'''/* Pairing by sound, the screens.
   Host: Host a room opens the room (the same Wi-Fi room as the codes) and keeps calling: it chirps an invitation for the
   next pilot, then listens long enough for a pilot to wait its turn and answer. The calls alternate between ggwave's
   fastest audible protocol (about 3 s) and its fast one (about 5 s, which carries through echoey rooms); the answer comes
   back at the speed it was called at. Each call carries a slot and a tag; when an answer for a tag it still holds arrives
   the host connects that pilot, and an answer to the current call has it call with a new tag at once. It stops when a race
   starts or the room is full; Add pilots starts it again. Under the sound box the host can show the invitation as a code
   and take a reply by scan or typing (Prototype 47), for a pilot who can't hear it or isn't heard.
   Pilot: Join listens. On hearing a call it makes its answer, waits a random 0.35 to 2 s (holding back if another phone
   starts chirping first) and chirps it, and shows the same reply as a code. If the host calls again with the same tag, the
   answer was lost: it plays the same answer again (a fresh one only if its connection has failed, Prototype 47). A new
   tag means the host took another pilot: it answers that one. The host's addresses go into its connection only after its
   answer has played, so the checks start as the host hears it. An invitation scanned or typed instead (Prototype 47) is
   answered by sound at once, then every 9 s up to four times, with the host's addresses in at once as a code's are. Once
   the link to the host is open it joins the room's lobby. Neither side can read anything but its own kind of message, so
   a phone ignores its own chirps.
   Test sound (Prototype 47): this device plays a short call of its own and listens for it, with the meter running. */
const ULTRA=/[?&]chirp=ultra/.test(location.search);
const HOTSPOT='Heard, but can\'t connect. Check the devices are on the same Wi-Fi. Some Wi-Fi keeps devices apart: try a phone\'s hotspot.';
const chirp={role:null,mode:null,pair:store.get('hoverline.pair')==='qr'?'qr':'sound',loop:0,offer:null,tag:-1,cycle:0,fresh:false,
  g:null,old:null,heardAt:0,startAt:0,tick:null,ducked:false,musV:1,wait:null,raf:0};
const ch$=id=>document.getElementById(id),chirpWait=ms=>new Promise(r=>setTimeout(r,ms));
/* pairing's own random numbers, so it never draws from Math.random (the race simulator seeds that) */
const chirpRnd=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
ChirpIO.onRx=o=>{if(chirp.mode==='host')chirpHostRx(o);else if(chirp.mode==='guest')chirpGuestRx(o,'sound')};
/* the music dips under the pairing (the game's music volume node, restored after) */
function chirpDuck(on){if(chirp.ducked===on||!audio.musG||!audio.ctx)return;chirp.ducked=on;const g=audio.musG.gain,t=audio.ctx.currentTime;
  if(on)chirp.musV=g.value;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.setTargetAtTime(on?chirp.musV*0.12:chirp.musV,t,on?0.12:0.35)}
function chirpSay(t){ch$('chirpMsg').textContent=t||''}
/* the steps by sound, as the screens say them */
const CH_HOST=['<b>Invite</b> · this device calls the invitation out loud. Pilots tap <b>Join</b> and hold their device near it.','<b>Reply</b> · each pilot\'s device answers the same way.','<b>Lobby</b> · pilots appear below as they connect. Press Done when everyone is in.'];
const CH_GUEST=['<b>Invitation</b> · hold this device near the host\'s while it calls.','<b>Reply</b> · this device answers out loud, and shows its reply as a code too.','<b>Lobby</b> · you\'re in as soon as the host has your reply.'];
const CH_TEST=['<b>Listen</b> · the bar shows what this device\'s microphone hears. Talk or clap: it should move.','<b>Call</b> · it plays a short call and listens for it. Volume up.'];
function chirpUI(kind,title,steps){const box=ch$('chirpBox');box.hidden=!kind;box.dataset.kind=kind||'';
  ch$('chirpDone').hidden=!(kind==='host'&&mp.sess||kind==='test');ch$('chirpCancel').hidden=kind==='test'||kind==='host'&&!!mp.sess;
  const q=ch$('chirpQR');q.hidden=kind==='test'||kind==='fail'&&chirp.role==='test';q.classList.toggle('go',kind==='fail');chirpCodeBtn();
  mpEl.mpOut.hidden=kind==='guest'||kind==='fail'||kind==='test'||!!mp.sess;
  if(title!=null)ch$('chirpTitle').textContent=title;if(steps!=null)ch$('chirpSteps').innerHTML=steps;
  clearInterval(chirp.tick);chirp.tick=kind?setInterval(chirpTick,120):null;if(kind){chirpTick();priestRun()}}
function chirpTick(){ch$('chirpMeter').hidden=!(chirp.mode&&ChirpIO.isOpen());
  if(chirp.mode!=='guest')return;const now=performance.now(),g=chirp.g;
  // an answer the host hasn't taken 3 s after it played: the reply shows as a code too
  if(g&&g.sentAt&&!g.done&&now-g.sentAt>3000)chirpCodeOpen(true);
  if(g&&g.sentAt&&!g.done&&now-g.sentAt>12000&&!g.hinted){g.hinted=true;chirpSay('Not connected yet. The host can scan or type the reply below. If it already has, check both are on the same Wi-Fi: some Wi-Fi keeps devices apart, so try a phone\'s hotspot.')}
  else if(!chirp.heardAt&&!g&&now-chirp.startAt>20000&&!chirp.deaf){chirp.deaf=true;chirpCodeOpen(true);chirpSay('Can\'t hear the host? Turn both devices\' volume up and hold them close, or take the host\'s code below.')}}
/* the third button: on the sound screens Use a code (opens the code box under it) or Hide the code; after a failure, Use
   codes; before a room is open, Codes only */
function chirpCodeBtn(){const k=ch$('chirpBox').dataset.kind;ch$('chirpQR').textContent=k==='fail'?'Use codes':lan.helper?(lan.open?'Hide the code':'Use a code'):'Codes only'}
function chirpCodeOpen(on){if(!lan.helper||lan.open===on)return;lan.open=on;lanShow(on);chirpCodeBtn();PDG.ev(on?'code box opened':'code box closed');if(on)try{$('lanBox').scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}
/* The caller (Prototype 47): a hooded machine-priest drawn in the game's line style while pairing by sound, our own
   design: a tall faceted cowl over a plain face plate, two lens eyes, a hinged grille jaw, a collar and a small pendant.
   Calling, the jaw opens with the chirp's own loudness (ChirpIO.txLevel), the head shakes with it and lines of voice leave
   the mouth; listening, the mouth rests and the eyes glow with what the microphone hears. Strokes take the canvas's CSS
   colour (and --glow, --voice), so it reads on a dark panel or a light one. A 140 by 120 drawing, scaled to the canvas. */
const PRIEST={hood:[[32,118],[37,86],[45,54],[57,26],[70,8],[83,24],[95,52],[103,84],[108,118]],cav:[[50,99],[50,60],[57,38],[70,27],[83,38],[90,60],[90,99]],
  folds:[[70,8,70,27],[57,26,57,38],[83,24,83,38],[45,54,50,60],[95,52,90,60],[37,86,50,99],[103,84,90,99]]};
function priestDraw(cv,s){const g=cv&&cv.getContext&&cv.getContext('2d');if(!g)return;const dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||120,H=cv.clientHeight||103;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  const cs=getComputedStyle(cv),ink=cs.color||'#f2efe6',glow=cs.getPropertyValue('--glow').trim()||'#3ff0ff',voice=cs.getPropertyValue('--voice').trim()||'#ffb000';
  // the face sits in the hood's shadow, so on a light panel (dark strokes) it is drawn light
  const rgb=(ink.match(/\d+(\.\d+)?/g)||[242,239,230]).map(Number),face=(0.3*rgb[0]+0.59*rgb[1]+0.11*rgb[2])<128?'#e6e2d6':ink;
  const k=Math.min(cv.width/140,cv.height/120),jaw=clamp(s.jaw||0,0,1),sh=s.still?0:Math.sin(s.t*53)*jaw*1.1,bob=s.still||s.tx?0:Math.sin(s.t*1.7)*0.9,o=jaw*17,up=jaw*4;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(k,0,0,k,(cv.width-140*k)/2+sh*k,(cv.height-120*k)/2+bob*k);
  g.lineJoin='round';g.lineCap='round';g.strokeStyle=ink;g.lineWidth=1.7;g.globalAlpha=1;
  const path=(p,close)=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath()};
  // the face in shadow, the cowl, its folds
  path(PRIEST.cav,true);g.fillStyle='rgba(4,6,10,.84)';g.fill();path(PRIEST.hood);g.stroke();path(PRIEST.cav);g.stroke();
  g.globalAlpha=0.5;g.beginPath();for(const[a,b,c,d]of PRIEST.folds){g.moveTo(a,b);g.lineTo(c,d)}g.stroke();g.globalAlpha=1;
  // the face plate (brow, nose ridge, cheek line), lifting a little as the jaw drops
  g.strokeStyle=face;const U=y=>y-up;g.beginPath();g.moveTo(56,U(49));g.lineTo(84,U(49));g.moveTo(70,U(49));g.lineTo(70,U(63));g.moveTo(55,U(66));g.lineTo(60,U(70));g.lineTo(80,U(70));g.lineTo(85,U(66));g.stroke();
  // the mouth, open as far as the call is loud, lit from inside, and the hinged jaw with its grille
  const m0=U(70.5),m1=70.5+o;
  if(m1-m0>1.2){path([[58,m0],[82,m0],[80,m1],[60,m1]],true);g.fillStyle='rgba(0,0,0,.94)';g.fill();
    g.save();g.globalAlpha=Math.min(1,jaw*1.25)*0.55;g.fillStyle=voice;g.shadowColor=voice;g.shadowBlur=8*k*jaw;path([[62,m0+2],[78,m0+2],[76.5,m1-2],[63.5,m1-2]],true);g.fill();g.restore()}
  path([[56,U(68)],[59,80+o],[70,85+o],[81,80+o],[84,U(68)]]);g.stroke();
  g.globalAlpha=0.75;g.beginPath();for(const x of[64,70,76]){g.moveTo(x,m0-0.5);g.lineTo(x,m0+2.5);g.moveTo(x,m1+3.5);g.lineTo(x,m1+7.5)}g.stroke();g.globalAlpha=1;g.strokeStyle=ink;
  // the eyes: two lenses that glow
  const e=clamp(s.eyes==null?0.3:s.eyes,0,1);g.save();g.fillStyle=glow;g.shadowColor=glow;g.shadowBlur=(1+9*e)*k;g.globalAlpha=0.25+0.75*e;
  for(const x of[62,78]){g.beginPath();g.arc(x,U(57),2.6+0.8*e,0,TAU);g.fill()}g.restore();
  // collar and pendant
  path([[42,105],[56,101],[84,101],[98,105]]);g.stroke();path([[70,107],[73.5,111.5],[70,116],[66.5,111.5]],true);g.stroke();
  // the voice
  if(s.tx&&jaw>0.04){g.strokeStyle=voice;g.lineWidth=2.1;for(let i=0;i<3;i++){const ph=(s.t*1.8+i/3)%1,r=40+ph*24;g.globalAlpha=Math.min(1,jaw*1.15)*(1-ph);
    for(const a0 of[0,Math.PI]){g.beginPath();g.arc(70,(m0+m1)/2,r,a0-0.4,a0+0.4);g.stroke()}}g.globalAlpha=1}}
/* the caller and the meter move with every frame while the box shows */
function priestRun(){if(chirp.raf)return;let still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  const step=t=>{const box=ch$('chirpBox');if(box.hidden){chirp.raf=0;return}chirp.raf=requestAnimationFrame(step);
    const m=ChirpIO.meter(),tx=ChirpIO.sending();
    priestDraw(ch$('chirpWave'),{t:t/1000,still,tx,jaw:tx?ChirpIO.txLevel():0,eyes:!chirp.mode?0.08:tx?1:0.18+0.82*m.lv});
    const mb=ch$('chirpMeter');if(!mb.hidden){mb.style.setProperty('--lv',m.lv.toFixed(3));mb.style.setProperty('--pk',m.pk.toFixed(3))}};
  chirp.raf=requestAnimationFrame(step)}
/* the microphone, saying so if the browser is still asking after 2.5 s (a prompt by the address bar is easy to miss) */
async function chirpOpen(){const tm=setTimeout(()=>{if(!ChirpIO.isOpen())chirpSay('Allow the microphone: the browser is asking (at the top of the screen, or by the address bar).')},2500);
  const why=await ChirpIO.open();clearTimeout(tm);if(!why&&/^Allow the microphone/.test(ch$('chirpMsg').textContent))chirpSay('');return why}
function chirpFail(why,role){chirp.mode=null;ChirpIO.close();chirpDuck(false);chirp.role=role;if(lan.helper)lanStop();PDG.ev('no sound',{why});
  chirpUI('fail',why==='denied'?'The microphone is blocked':why==='nomic'?'No microphone found':'Sound pairing can\'t start here',
    `<p class="small">${why==='denied'?'Allow it and try again, or use codes: one device shows a code, the other scans or types it.':'Use codes instead: one device shows a code, the other scans or types it.'}</p>`);chirpSay('')}
/* stop listening and calling, and put the screen back (keep: the pairing record carries on, as when switching to codes) */
function chirpStop(keep){chirp.mode=null;chirp.loop++;chirp.offer=null;chirp.wait=null;ChirpIO.close();chirpDuck(false);
  for(const g of[chirp.g,chirp.old])if(g&&!g.done)chirpDrop(g);chirp.g=chirp.old=null;
  if(lan.helper)lanStop();
  const box=ch$('chirpBox');if(!box.hidden){box.hidden=true;clearInterval(chirp.tick);chirp.tick=null;mpEl.mpOut.hidden=!!mp.sess}chirpSay('');
  const st=mp.sess&&mp.sess.state;$('lanAdd').hidden=!(st&&st.isHost&&st.link&&st.link.carrier==='lan');
  if(!keep&&!lan.mode)PDG.end(st&&st.isHost?'host stopped':'stopped')}
function chirpDrop(g){g.done=true;clearInterval(g.retry);try{g.pc&&g.pc.close()}catch(e){}}
/* the code box under the sound box (Use a code): the host's invitation and a place for replies; a pilot's place for the
   host's code, then its own reply (and the camera, if it was looking, stops) */
function chirpHelp(){if(!lan.helper)return;
  if(lan.mode==='host'){const f=chirp.offer;let c=null;try{c=f?LAN.code({...f,kind:0}):null}catch(e){}
    lanUI({title:'By code',note:'A pilot who can\'t hear the call scans or types this code. A reply you didn\'t hear: scan it or type it here.',code:c,scan:'Scan a reply',input:'type a pilot\'s reply'})}
  else if(lan.mode==='guest'){const g=chirp.g;
    if(g&&g.bytes){if(lan.scanning)lanCamOff();lanUI({title:'Your reply, as a code',note:'The host hasn\'t taken it by sound yet: it can scan or type it.',code:LAN.codeOf(g.bytes)})}
    else lanUI({title:'By code',note:'Can\'t hear the host? Scan or type the code on the host\'s screen.',scan:'Scan the host\'s code',input:'type the host\'s code'})}}
/* ---- host ---- */
async function chirpHostTap(){if(chirp.pair==='qr'||!ChirpIO.can())return mpEl.mpCreate.onclick();
  if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do same-room races (no WebRTC).';return}
  audio.init();mpEl.mpErr.textContent='';chirp.role='host';PDG.start('host','sound');const id=chirp.loop;
  chirpUI('host','Opening the microphone…',stepsHtml(CH_HOST,-1));
  // the microphone first: with it allowed, the browser shares this device's real Wi-Fi address in the invitations
  const why=await chirpOpen();if(chirp.loop!==id||mp.sess)return;if(why)return chirpFail(why,'host');
  LAN.L.role='host';LAN.L.id=null;mpConnect(HLNet.roomCode(chirpRnd),true);chirpHost()}
async function chirpResume(){audio.init();PDG.start('host','sound');chirp.role='host';const id=chirp.loop;chirpUI('host','Opening the microphone…',stepsHtml(CH_HOST,-1));
  const why=await chirpOpen();if(chirp.loop!==id)return;
  if(why){chirpUI('host','Adding pilots by sound','');chirpSay(why==='denied'?'The microphone is blocked: use codes.':'Sound pairing can\'t start here: use codes.');return}chirpHost()}
function chirpHost(){if(lan.mode&&!lan.helper)lanStop();chirp.role='host';chirp.mode='host';chirp.offer=null;chirp.fresh=false;chirpDuck(true);
  chirpUI('host','Inviting pilots',stepsHtml(CH_HOST,0));chirpHostSay(mp.sess&&mp.sess.state);chirpSay('');
  lan.mode='host';lan.helper=true;lan.open=false;lanCamCheck();lanShow(false);chirpHelp();chirpCodeBtn();chirpHostLoop()}
async function chirpHostLoop(){const id=++chirp.loop,lobby=()=>{const st=mp.sess&&mp.sess.state;return!st||st.phase==='connecting'||st.isHost&&st.phase==='lobby'},
    live=()=>{if(chirp.mode!=='host'||chirp.loop!==id)return false;if(lobby())return true;chirpStop();return false};
  while(live()){const st=mp.sess&&mp.sess.state;
    if(!st||st.phase==='connecting'){await chirpWait(300);continue}
    if(st.roster.length>=MAXP){chirpStop();note('The room is full',1800);return}
    if(!chirp.offer){chirp.tag=(chirp.tag<0?Math.floor(chirpRnd()*256):chirp.tag+1)&255;
      try{const o=await LAN.offer({raw:true,tag:chirp.tag});if(!live())return;chirp.offer={...o,slot:Math.min(7,st.roster.length),cands:Chirp.pickCands(o.sdp,2)};
        PDG.ev('invitation made',{tag:chirp.tag,addresses:chirp.offer.cands.map(c=>PDG.addr(c.a))});chirpHelp()}
      catch(e){chirpSay('Could not make a call: '+(e&&e.message||e));PDG.err('invitation',e);await chirpWait(2000);continue}}
    for(let k=0;k<20&&ChirpIO.busy()&&live();k++)await chirpWait(200);if(!live())return;
    const speed=ULTRA?'ultra':chirp.cycle++%2?'fast':'fastest',bytes=Chirp.pack({...chirp.offer,kind:0,speed});chirp.fresh=false;
    await ChirpIO.tx(bytes,speed);if(!live())return;
    // the listening window: a pilot's wait (up to 2.8 s, and making its answer) and its answer at the same speed
    const t0=performance.now(),win=(3.4+Chirp.seconds(bytes.length,speed)+0.8)*1000;
    while(live()&&!chirp.fresh){const t=performance.now()-t0;if(t>win&&!(ChirpIO.busy()&&t<win+4000))break;await chirpWait(120)}}}
/* an answer heard: any invitation still open takes it; an answer to the one being called has the next call made at once */
async function chirpHostRx(o){if(o.kind!==1||o.code!==LAN.L.code||!LAN.L.pending.has(o.tag))return;PDG.ev('reply heard',{tag:o.tag});
  const f=chirp.offer;if(f&&o.tag===f.tag){chirp.offer=null;chirp.fresh=true}
  try{const p=await LAN.accept(o);PDG.rtc(p.pc,'sound');chirpWatch(p.pc)}catch(e){PDG.err('reply',e)}}
function chirpWatch(pc){chirp.wait=pc;chirpSay('A pilot is connecting…');
  const bad=()=>{if(chirp.wait===pc&&chirp.mode==='host'&&pc.connectionState!=='connected')chirpSay(HOTSPOT)};
  pc.addEventListener('connectionstatechange',()=>{if(pc.connectionState==='failed')bad()});setTimeout(bad,12000)}
function chirpHostSay(st){if(chirp.mode!=='host'||!st)return;const n=st.roster.length-1;ch$('chirpSteps').innerHTML=stepsHtml(CH_HOST,0)+(n>0?`<p class="small">${n} pilot${n>1?'s':''} joined.</p>`:'')}
/* ---- pilot ---- */
async function chirpJoinTap(){if(chirp.pair==='qr'||!ChirpIO.can())return $('lanJoin').onclick();
  if(!LAN.ok){mpEl.mpErr.textContent='This browser can\'t do same-room races (no WebRTC).';return}
  audio.init();mpEl.mpErr.textContent='';chirp.role='guest';chirp.mode='guest';chirp.heardAt=0;chirp.deaf=false;chirp.startAt=performance.now();PDG.start('guest','sound');
  chirpUI('guest','Listening for the host…',stepsHtml(CH_GUEST,0));chirpSay('');
  lan.mode='guest';lan.helper=true;lan.open=false;lanCamCheck();lanShow(false);chirpHelp();chirpCodeBtn();
  const why=await chirpOpen();if(chirp.mode!=='guest')return;if(why)return chirpFail(why,'guest');
  chirpDuck(true);chirp.startAt=performance.now()}
/* an invitation, heard (via 'sound') or scanned or typed (via 'code') */
async function chirpGuestRx(o,via){if(o.kind!==0)return;if(via!=='code')chirp.heardAt=performance.now();const g=chirp.g;
  if(g&&g.done)return;
  const same=!!g&&g.code===o.code&&g.o.tag===o.tag,tries=same?g.tries+1:0;
  if(same&&(g.sending||!g.bytes))return;
  // the same call again: the host missed the answer, or this phone held back for another: the same answer once more,
  // unless its connection has failed
  if(same){const c=g.pc&&g.pc.connectionState;if(c!=='failed'&&c!=='closed'){g.tries=tries;chirpAnswer(g,o.speed||'fastest');return}}
  // a new tag: the host took someone else, unless this phone's link is already coming up
  if(g){const c=g.pc&&g.pc.connectionState;if(!same&&g.sentAt&&(c==='connecting'||c==='connected')){if(chirp.old)chirpDrop(chirp.old);chirp.old=g}else chirpDrop(g)}
  const n=chirp.g={o,code:o.code,pc:null,ch:null,bytes:null,sending:false,done:false,sentAt:0,tries,via:via||'sound',cands:false,retry:0};
  ch$('chirpTitle').textContent=(via==='code'?'Room ':'Heard room ')+o.code+' · answering…';ch$('chirpSteps').innerHTML=stepsHtml(CH_GUEST,1);chirpSay('');
  PDG.ev('invitation '+(via==='code'?'by code':'heard'),{tag:o.tag});
  try{await chirpAnswerMake(n)}catch(e){if(chirp.g===n){chirpSay(String(e&&e.message||e));chirp.g=null}PDG.err('reply',e);return}
  if(chirp.g!==n||n.done)return;chirpHelp();if(PDG.cur)PDG.cur.codes.shown++;
  chirpAnswer(n,o.speed||'fastest');
  // taken by scan or typing: the host may not be heard here at all, so the answer goes out again every 9 s, four times
  if(n.via==='code')n.retry=setInterval(()=>{if(n.done||chirp.g!==n||chirp.mode!=='guest'){clearInterval(n.retry);return}
    if(!n.sending&&n.sentAt&&performance.now()-n.sentAt>9000&&n.tries<4){n.tries++;chirpAnswer(n,n.tries%2?'fast':'fastest')}},1000)}
async function chirpAnswerMake(n){const pc=n.pc=new RTCPeerConnection({iceServers:[]});PDG.rtc(pc,n.via);
  pc.ondatachannel=e=>{n.ch=e.channel;n.ch.onopen=()=>chirpOpened(n)};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&chirp.g===n&&chirp.mode==='guest')chirpSay(HOTSPOT)};
  // by sound the host's addresses are held back until the answer has played (chirpAnswer); by code they go in at once
  await pc.setRemoteDescription({type:'offer',sdp:LAN.toSdp({...n.o,cands:[]},'actpass')});await pc.setLocalDescription(await pc.createAnswer());
  if(n.via==='code')chirpCands(n);
  await new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,1500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})});
  const sdp=pc.localDescription.sdp,f=LAN.fromSdp(sdp);
  n.bytes=Chirp.pack({kind:1,speed:Chirp.PROTO[n.o.speed]?n.o.speed:'fastest',slot:n.o.slot,tag:n.o.tag,code:n.code,uf:f.uf,pw:f.pw,fp:f.fp,cands:Chirp.pickCands(sdp,1)})}
function chirpCands(n){if(n.cands||!n.pc)return;n.cands=true;n.o.cands.forEach((c,i)=>n.pc.addIceCandidate({candidate:`candidate:${i+1} 1 udp ${2122260223-i*256} ${c.a} ${c.port} typ host generation 0`,sdpMid:'0',sdpMLineIndex:0}).catch(()=>{}))}
async function chirpAnswer(n,speed){n.sending=true;
  try{// the call has only just ended (it is decoded on its end marker): wait for the room to go quiet, then a random
    // wait, and give way to any chirp that starts in it (another pilot answering first)
    const q0=performance.now();while(ChirpIO.busy()&&performance.now()-q0<3000)await chirpWait(50);
    // (a third try goes ahead regardless: in a loud room the noise itself can look like a chirp starting)
    const wait=350+chirpRnd()*(n.tries?2450:1650),t0=performance.now();
    while(performance.now()-t0<wait){await chirpWait(50);if(ChirpIO.startedAfter(t0)&&n.tries<2||chirp.g!==n||n.done||chirp.mode!=='guest')return}
    ch$('chirpTitle').textContent='Answering room '+n.code+'…';
    await ChirpIO.tx(n.bytes,speed);n.sentAt=performance.now();if(n.done||chirp.g!==n)return;ch$('chirpTitle').textContent='Connecting to room '+n.code+'…';chirpSay('');
    chirpCands(n)}
  finally{n.sending=false}}
function chirpOpened(n){if(n.done||chirp.mode!=='guest')return;n.done=true;clearInterval(n.retry);for(const g of[chirp.g,chirp.old])if(g&&g!==n&&!g.done)chirpDrop(g);chirp.g=chirp.old=null;
  if(LAN.L.host&&LAN.L.host.pc!==n.pc)try{LAN.L.host.pc.close()}catch(e){}
  LAN.L.host={pc:n.pc,ch:n.ch,code:n.code,open:Promise.resolve()};PDG.ev('connected',{via:n.via});PDG.end('joined');chirpStop();mpConnect(n.code,false)}
/* ---- Test sound ---- */
async function chirpTest(){if(chirp.mode||!ChirpIO.can())return;audio.init();PDG.start('test','sound');chirp.role='test';chirp.mode='test';
  chirpUI('test','Testing sound…',stepsHtml(CH_TEST,0));chirpSay('');
  const why=await chirpOpen();if(chirp.mode!=='test')return;if(why)return chirpFail(why,'test');chirpDuck(true);
  await chirpWait(1500);if(chirp.mode!=='test')return;ch$('chirpSteps').innerHTML=stepsHtml(CH_TEST,1);
  let ok=false;for(const sp of['fastest','fast']){ok=await ChirpIO.selfTest(sp);if(ok||chirp.mode!=='test')break}
  if(chirp.mode!=='test')return;PDG.ev('test sound',{heard:ok});if(PDG.cur)PDG.cur.selfTest=ok;
  ch$('chirpTitle').textContent=ok?'Sound works on this device':'This device didn\'t hear its own call';
  ch$('chirpSteps').innerHTML=stepsHtml(CH_TEST,2)+`<p class="small">${ok?'Its speaker and microphone both work for pairing. The other device needs the same: test it too.':'Turn the volume up and try again. If the bar doesn\'t move when you talk, the microphone isn\'t reaching the game: check it is on and not muted in the device\'s sound settings. Codes always work.'}</p>`}
/* ---- the Multiplayer screen ---- */
function chirpSync(){const on=mpConn==='lan',can=ChirpIO.can(),pair=can?chirp.pair:'qr';
  ch$('chirpRow').hidden=!on;ch$('chirpPairRow').hidden=!on||!can;mpEl.mpCreate.parentElement.hidden=on;$('lanJoin').hidden=true;
  document.querySelectorAll('[data-pair]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pair===pair)));ch$('chirpTest').hidden=pair!=='sound';
  ch$('chirpHostSub').textContent=pair==='qr'?'Show a code, then take each reply':'Your device invites the others';ch$('chirpJoinSub').textContent=pair==='qr'?'Scan or type the host\'s code':'Hold your device near the host\'s';
  if(on)$('mpConnHint').textContent='No internet needed: everyone on one Wi-Fi, or one phone\'s hotspot. The host invites, each pilot replies, then they connect directly.'+
    (pair==='qr'?' By code: the pilot scans or types the host\'s code, then the host scans or types the pilot\'s reply.':' By sound the devices do both by themselves (volume up), and a code on screen works for either step.')+
    (!can?' This page can\'t use the microphone, so it pairs by code.':'')+(!LAN.ok?' This browser has no WebRTC, so it can\'t join.':'')}
/* called from the lobby's render: stop calling once a race starts or this device isn't the host any more */
function chirpLobby(st,carrier){if(chirp.mode==='host'&&(carrier!=='lan'||!st.isHost||st.phase==='loading'||st.phase==='race'))chirpStop();
  const lanRoom=carrier==='lan';mpEl.mpRoom.hidden=lanRoom;mpEl.mpRoom.previousElementSibling.hidden=lanRoom;   // nobody types a code in this room
  if(chirp.mode==='host'){$('lanAdd').hidden=true;chirpHostSay(st)}}
document.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{chirp.pair=b.dataset.pair;store.set('hoverline.pair',chirp.pair);chirpSync()});
ch$('chirpHostBtn').onclick=chirpHostTap;ch$('chirpJoinBtn').onclick=chirpJoinTap;ch$('chirpTest').onclick=chirpTest;
ch$('chirpDone').onclick=()=>chirpStop();
ch$('chirpCancel').onclick=()=>{const was=chirp.role;chirpStop();if(was==='host'&&!mp.sess)mpView()};
ch$('chirpQR').onclick=()=>{if(lan.helper&&chirp.mode){chirpCodeOpen(!lan.open);return}
  const role=chirp.role,inRoom=!!(mp.sess&&mp.sess.state.isHost);chirpStop(true);PDG.ev('codes only');
  if(role==='host'){if(inRoom)lanHostNext();else mpEl.mpCreate.onclick()}else if(role==='guest')$('lanJoin').onclick();else PDG.end('stopped')};
$('lanAdd').onclick=()=>{if(chirp.pair==='sound'&&ChirpIO.can())chirpResume();else{PDG.start('host','code');lanHostNext()}};
{const f=LAN.L.onChange;LAN.L.onChange=what=>{f(what);if(chirp.mode==='host'){if(what==='joined'){chirp.wait=null;chirpSay('A pilot joined.');PDG.ev('pilot joined')}mpRender()}}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&chirp.mode&&audio.ctx)try{audio.ctx.resume()}catch(e){}});''')

# =====================================================================================================================
# the race-log export carries the pairing records, even with no race recorded
rep("$('logAll').onclick=()=>{const all=logAll();if(!all.length){note('No race logs yet',1600);return}logDownload({game:all[0].game,exported:new Date().toISOString(),profile:profileGet(),music:music.libLog(),logs:all},'hoverline-logs-'+logStamp()+'.json')};",
    "$('logAll').onclick=()=>{const all=logAll(),pairing=PDG.all();if(!all.length&&!pairing.length){note('No race logs yet',1600);return}logDownload({game:all.length?all[0].game:'Hoverline '+(($('title').querySelector('.sub')||{}).textContent||''),exported:new Date().toISOString(),profile:profileGet(),music:music.libLog(),pairing,logs:all},'hoverline-logs-'+logStamp()+'.json')};")
rep("{profile:profileGet(),music:music.libLog(),logs:all}", "{profile:profileGet(),music:music.libLog(),pairing:PDG.all(),logs:all}", 2)

open(P, 'w', encoding='utf-8').write(s)
print('p47: applied to', P, '(%d bytes)' % len(s))
