#!/usr/bin/env python3
"""Prototype 48: the menus hold the chosen orientation too (every screen, once full screen), Settings' Portrait | Landscape
and a small rotate button on the title apply at once (Android only); tilt steers alongside the slider in the quick races
on phones; the title's Open with tilt button is gone (Firefox never passes the motion sensor into itch's frame).
  P=<html> python3 p48.py   (refuses a second run)"""
import os, sys
P = os.environ['P']; s = open(P, encoding='utf-8').read()
if 'id="rotBtn"' in s: sys.exit('p48: already applied')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)

# --- title: the rotate button, no Open with tilt
ROT = ('<button class="btn" id="rotBtn" hidden aria-label="Rotate screen" title="Rotate screen"><svg viewBox="0 0 24 24" width="22" height="22" '
       'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
       '<rect x="8.5" y="6" width="7" height="12" rx="1.5"/><path d="M3.5 10A8.8 8.8 0 0 1 15 3.3"/><path d="M12.6 1.8L15 3.3 13.4 5.8"/><path d="M20.5 14A8.8 8.8 0 0 1 9 20.7"/><path d="M11.4 22.2L9 20.7 10.6 18.2"/></svg></button>')
rep('<button class="btn" id="lbBtn">Leaderboard</button><button class="btn" id="fsBtn" hidden>',
    '<button class="btn" id="lbBtn">Leaderboard</button>' + ROT + '<button class="btn" id="fsBtn" hidden>')
rep('#playBtn,#fsBtn{grid-column:1/-1}',
    '#playBtn,#fsBtn{grid-column:1/-1}\n  #title .card>.row:has(#rotBtn:not([hidden])){grid-template-columns:1fr 1fr auto}')
s = s.replace('</style>', '#rotBtn{padding-inline:14px;min-width:0;display:inline-flex;align-items:center;justify-content:center}#rotBtn svg{display:block}\n</style>', 1)

rep("  const a=$('ownTab');if(coarse&&framed&&tilt.blocked&&canOwnTab&&tiltWanted()){a.href=ownTabUrl();a.hidden=false;a.textContent=ownTabLabel();a.onclick=()=>{if(audio.ctx)audio.ctx.suspend()}}else a.hidden=true;syncFs();",
    "  /* Prototype 48: no Open with tilt on the title (Eric didn't want a second tab); the card on a tilt race still offers it */\n  $('ownTab').hidden=true;syncFs();")
rep("'Tilt is blocked in this page: Open with tilt on the title plays it in its own tab.'",
    "'Tilt is blocked in this browser inside itch.io (Firefox never passes the motion sensor into a page like this one; Chrome does).'")
rep('<p class="ask">This browser doesn\'t pass the motion sensor to the game inside this page.</p>',
    '<p class="ask">This browser doesn\'t pass the motion sensor to the game inside itch.io\'s page (Firefox never does; Chrome does).</p>')
rep('<div class="row"><a class="btn go" id="tiltOwn" target="_blank" rel="noopener">Open with tilt</a><button class="btn" id="tiltSl" data-back>Use the slider</button></div>',
    '<div class="row"><button class="btn go" id="tiltSl" data-back>Use the slider</button><a class="btn" id="tiltOwn" target="_blank" rel="noopener">Open with tilt</a></div>')
rep('#ownTab,#tiltOwn{background:var(--cyan);border-color:var(--cyan);color:#071114}', '#ownTab{background:var(--cyan);border-color:var(--cyan);color:#071114}')
rep("navTo(el,canOwnTab?a:$('tiltSl'))", "navTo(el,$('tiltSl'))")

# --- orientation: with a way chosen, every screen holds it while full screen; changes apply at once
rep("const want=coarse&&!!document.fullscreenElement&&(!$('hudL').hidden||!!orPick&&!$('qkTap').hidden);",
    "const want=coarse&&!!document.fullscreenElement&&(!$('hudL').hidden||!!orPick&&orCan());")
rep("function orSetSync(){const r=$('orRow');if(r)r.hidden=!orCan();",
    "/* Prototype 48: apply a new choice now: lock again if full screen, else go full screen (a tap), which locks */\n"
    "function orApply(){if(!coarse||!orCan())return;if(document.fullscreenElement){OR.on=false;orSync()}else goFull()}\n"
    "function orSetSync(){const r=$('orRow');if(r)r.hidden=!orCan();const rb=$('rotBtn');if(rb){rb.hidden=!(orCan()&&coarse);rb.setAttribute('aria-label',orPick==='portrait'?'Rotate to landscape':'Rotate to portrait');rb.title=rb.getAttribute('aria-label')}")
rep("document.querySelectorAll('[data-orient]').forEach(b=>b.onclick=()=>{orPick=b.dataset.orient;store.set('hoverline.orient',orPick);orSetSync()});",
    "document.querySelectorAll('[data-orient]').forEach(b=>b.onclick=()=>{orPick=b.dataset.orient;store.set('hoverline.orient',orPick);orSetSync();orApply()});\n"
    "$('rotBtn').onclick=()=>{orPick=(orPick?orPick[0]:orNow())==='p'?'landscape':'portrait';store.set('hoverline.orient',orPick);orSetSync();try{audio.sfx('ui_select')}catch(e){}orApply()};")

# --- quick races: on phones tilt steers too (roll only), alongside the slider, where the sensor reaches the page
rep("const ANDROID=/Android/i.test(navigator.userAgent||'');",
    "const ANDROID=/Android/i.test(navigator.userAgent||'');\n"
    "/* Prototype 48: a phone (not a tablet): tilt steers in the quick races alongside the slider */\n"
    "const qkTilt=()=>coarse&&Math.min(screen.width||0,screen.height||0)<600&&!tilt.blocked;")
rep("  if(tilt.enabled&&tilt.ok&&!QK.live){let d=wrapA(tilt.ang-tilt.neutral)*180/Math.PI;d=Math.abs(d)<1.5?0:d-Math.sign(d)*1.5;steer+=(tilt.flip?1:-1)*d/24;\n    if(tilt.pitchMode<2){",
    "  if(tilt.ok&&(QK.live?qkTilt():tilt.enabled)){let d=wrapA(tilt.ang-tilt.neutral)*180/Math.PI;d=Math.abs(d)<1.5?0:d-Math.sign(d)*1.5;steer+=(tilt.flip?1:-1)*d/24;\n    if(!QK.live&&tilt.pitchMode<2){")
rep("  $('bestL').textContent='Best '+fmt(getBest());$('posT').textContent=racers.length;\n  if(coarse&&!QK.live)setTimeout(",
    "  $('bestL').textContent='Best '+fmt(getBest());$('posT').textContent=racers.length;\n"
    "  /* Prototype 48: the quick race's tilt is measured from how the phone is held as the countdown starts, and again at GO */\n"
    "  if(QK.live&&qkTilt()){const z=()=>{if(QK.live&&tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa}};setTimeout(z,350);setTimeout(z,Math.max(400,S.count*1000-40))}\n"
    "  if(coarse&&!QK.live)setTimeout(")
rep("$('qkTap').addEventListener('click',e=>{if(e.target.closest('#qkTapMenu'))return;qkGo()});",
    "$('qkTap').addEventListener('click',e=>{if(e.target.closest('#qkTapMenu'))return;if(coarse&&REAL)askMotion();qkGo()});")
rep("of pitch flies it). You always move on, and the end screen also has Rematch. Phones steer with the slider only. Quick",
    "of pitch flies it). You always move on, and the end screen also has Rematch. Phones steer with the slider, and by tilt too\n   where the sensor reaches the page (Prototype 48; tablets use the slider only). Quick")
rep("if(orCan()&&framed)try{screen.orientation.unlock()}catch(e){}",
    "if(orCan()&&framed)try{screen.orientation.unlock()}catch(e){}\n"
    "/* Prototype 48: with a way chosen, the first touch on this visit goes full screen, which locks it (once a visit, so leaving\n"
    "   full screen on purpose sticks) */\n"
    "addEventListener('pointerup',function f(){removeEventListener('pointerup',f,true);if(orPick&&orCan()&&coarse&&!document.fullscreenElement&&$('orSet').hidden)goFull()},true);")
open(P, 'w', encoding='utf-8').write(s); print('p48 applied')
