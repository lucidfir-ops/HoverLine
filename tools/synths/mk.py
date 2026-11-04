#!/usr/bin/env python3
"""Builds /home/claude/p45/p45_synths.py (self-contained) from src/worklet.js and src/syn.js."""
import os
D = os.path.dirname(os.path.abspath(__file__))
W = open(os.path.join(D, 'src/worklet.js')).read().rstrip() + '\n'
S = open(os.path.join(D, 'src/syn.js')).read().rstrip() + '\n'
for x in (W, S): assert "'''" not in x and not x.endswith('\\\n')
T = r'''#!/usr/bin/env python3
"""Prototype 45: synth instruments (supersaws, a 303, 4-operator FM, clean leads and basses, pads, guzheng, erhu,
bansuri, tanpura, hang). Apply with  P=<html> python3 p45_synths.py  (edits the file in place; refuses a second run).
Touches only synth code: the worklet module (a second processor, hl-syn, appended to SL.WORKLET), the new SYN table
(after SL.sitar), one line each in tSyn, tV's call to it and bassNote, the clipped-saw patch (quieter and darker) and
the metal lead's output level. Built from synths/src by synths/mk.py."""
import os, sys
P = os.environ.get('P') or (sys.argv[1] if len(sys.argv) > 1 else '')
if not P: sys.exit('usage: P=<html> python3 p45_synths.py')
s = open(P, encoding='utf-8').read()
MARK = '/* ---------- synth instruments (Prototype 45)'
if MARK in s: sys.exit('p45_synths: already applied to ' + P)
def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, 'anchor found %d times (wanted %d): %r' % (c, n, a[:90])
    s = s.replace(a, b)
WORKLET = r\'\'\'%W%\'\'\'
SYNJS = r\'\'\'%S%\'\'\'
# 1. the worklet processor and the SYN table, right after the sitar (synth code nobody else edits)
A = "SL.hp1(out,sr,120);SL.biq(out,sr,'peak',2600,1.2,4);SL.biq(out,sr,'lp',7000,0.7);let pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const g=0.9/(pk||1),fo=Math.floor(sr*0.05);\n  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1);return out};\n"
# (the sitar's notes also started with a step from silence, up to a sixth of its peak: a click on every note; they now
#  fade in over 0.75 ms, see 5. below)
A2 = A.replace("const g=0.9/(pk||1),fo=Math.floor(sr*0.05);\n  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1);return out};",
    "const g=0.9/(pk||1),fo=Math.floor(sr*0.05),fi=Math.round(sr*0.00075);\n  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1)*(n<fi?0.5-0.5*Math.cos(Math.PI*n/fi):1);return out};")
assert A2 != A
rep(A, A2 + WORKLET + SYNJS)
# 2. a template naming a SYN instrument plays it (tV passes its slide-in on as a bend)
rep("tSyn(P,m,t,dur,v,dest){const prevL=this.lastLead;this.lastLead=m;",
    "tSyn(P,m,t,dur,v,dest,sl){const prevL=this.lastLead;this.lastLead=m;if(SYN.P[P])return SYN.play(P,t,m,dur,v,{dest,from:prevL,bend:sl||0,eng:this});")
rep("return this.tSyn(inst,m,t,dur,v,dest)},", "return this.tSyn(inst,m,t,dur,v,dest,sl)},")
# 3. a bass patch with syn: plays that instrument (tBassStep's accent raises vol to 1.25; its slide sets from)
rep("bassNote(m,t,dur,o){if(this.rA)o=this.rxBass(o);",
    "bassNote(m,t,dur,o){if(o.syn&&SYN.P[o.syn])return SYN.play(o.syn,t,m,dur,o.vol>1.1?1:0.85,{dest:this.bus.bass,accent:o.vol>1.1?1:0,slide:o.from!=null,rx:this.rA||0,eng:this});if(this.rA)o=this.rxBass(o);")
# 4. Eric: "if you're going to use clip lower its volume" (and the same for the metal lead): the clipped saw keeps its
#    character but plays darker (filtered before and after the clipper) and about 4 dB quieter; the metal lead 3 dB
rep("this.clipL=this.drive(this.bus.lead,{pre:8,k:10,post:0.085});",
    "this.clipL=this.drive(this.bus.lead,{pre:8,k:10,post:0.085});this.clipD=this.drive(this.bus.lead,{pre:8,k:10,post:%CPOST%,lp:%CLP%});")
rep("case'clip':return this.saw(m,t,dur*0.9,o({voices:2,spread:10,cut:6000,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipL}));",
    "case'clip':return this.saw(m,t,dur*0.9,o({voices:2,spread:10,cut:%CCUT%,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipD}));")
rep("if(P==='clip')this.saw(m,t,sd*e.d*0.9,{tag:'lead',voices:2,spread:10,cut:6000,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipL});",
    "if(P==='clip')this.saw(m,t,sd*e.d*0.9,{tag:'lead',voices:2,spread:10,cut:%CCUT%,pe:12,peT:0.018,a:0.002,rel:0.04,vol:0.06,dly:0.25,dest:this.clipD});")
# 5. the Prototype 43 sitar played sharp (10 cents at G3, 43 at G5, 65 at D6): its string loop reads the sample after the
#    oldest, so the loop was a sample shorter than meant. One sample longer tunes it exactly; nothing else changes.
rep("const mk=(fr,damp,br)=>{const P=sr/fr-0.5,", "const mk=(fr,damp,br)=>{const P=sr/fr+0.5,")
rep("this.gtrL=this.drive(this.bus.lead,{pre:7,k:5,post:0.11,lp:5200,hp:180});",
    "this.gtrL=this.drive(this.bus.lead,{pre:7,k:5,post:%GTRP%,lp:4600,hp:180});")
open(P, 'w', encoding='utf-8').write(s)
print('p45_synths: applied to', P)
'''
CFG = dict(CLP='3800', CCUT='3600', GTRP='0.078', CPOST='0.052')
cfgf = os.path.join(D, 'cfg.txt')
if os.path.exists(cfgf):
    for ln in open(cfgf):
        if '=' in ln: k, v = ln.strip().split('=', 1); CFG[k] = v
out = T.replace("\\'\\'\\'", "'''").replace('%W%', W).replace('%S%', S)
for k, v in CFG.items(): out = out.replace('%' + k + '%', v)
open('/home/claude/p45/p45_synths.py', 'w').write(out)
print('wrote /home/claude/p45/p45_synths.py', len(out))
