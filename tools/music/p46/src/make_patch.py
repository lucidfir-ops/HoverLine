#!/usr/bin/env python3
"""Builds /home/claude/p46/p46_music.py, the Prototype 46 music patch, from the parts in this folder: spec.py's table
(tpl_table.js), p46_data.js, p46_methA.js, p46_methB.js and the targeted edits below. It applies to the Prototype 45
page (src/hoverline.html at ab026c7): it replaces the four music blocks Prototype 45's patch wrote, edits the engine
around them (the mix's high-passes, the bols' faders, the per-template layer levels, the breakdown wash) and deletes
the recordings Eric called bad that nothing else needs."""
import os, subprocess, json
H = os.path.dirname(os.path.abspath(__file__))
subprocess.run(['python3', os.path.join(H, 'spec.py')], check=True, stdout=subprocess.DEVNULL)
rd = lambda f: open(os.path.join(H, f), encoding='utf-8').read()
TABLE, DATA, MA, MB = rd('tpl_table.js'), rd('p46_data.js'), rd('p46_methA.js'), rd('p46_methB.js')
BLK = []  # (start anchor, end anchor, new text): replaces [start, end)
R = []    # (anchor, replacement, count)
def blk(a, b, new): BLK.append((a, b, new))
def r(a, b, n=1): R.append((a, b, n))
blk('/* ---------- song templates (Prototype 43, rebuilt in Prototype 45) ----------', '/* Sitar (no CC0 recording exists', DATA)
blk('const TPL=[', 'const SONGS={ok:null', TABLE)
blk('  /* ---- song templates (Prototype 43, rebuilt in Prototype 45): choosing, building, the race sequence, the radio ---- */', '  /* a melodic note on an instrument: a recording when loaded', MA)
blk('  /* where a melody sits: the instrument', '  play(t,sd){const s=this.pos%16;', MB)
# ---- space in the mix (the atmospheric guide: high-pass everything but the bass at 180-250 Hz; keep reverb tails out of
#      the mud): the pad, keys, arpeggio and answer buses get a high-pass, opened in breakdowns where the bass is out; the
#      reverb and echo returns are high-passed too
r("this.bus={};for(const k of LAYERS){const g=c.createGain();g.gain.value=0;", "this.hpF={};this.hpV={};this.bus={};for(const k of LAYERS){const g=c.createGain();g.gain.value=0;")
r("if(k==='pad'||k==='arp'||k==='resp'||k==='amb'||k==='keys')this.wide(g,to);else if(k==='hat')",
  "if(k==='pad'||k==='arp'||k==='resp'||k==='amb'||k==='keys'){const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=MHP[k];h.Q.value=0.6;g.connect(h);this.wide(h,to);this.hpF[k]=h;this.hpV[k]=MHP[k]}else if(k==='hat')")
r("const rg=c.createGain();rg.gain.value=0.32;this.rev.connect(rg);rg.connect(this.out);",
  "const rg=c.createGain();rg.gain.value=0.32;{const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=240;h.Q.value=0.6;this.rev.connect(h);h.connect(rg)}rg.connect(this.out);")
r("this.dly.connect(dlp);dlp.connect(this.dlyFb);this.dlyFb.connect(this.dly);const dg=this.dg=c.createGain();dg.gain.value=this.evo?0.45:0.3;dlp.connect(dg);",
  "this.dly.connect(dlp);dlp.connect(this.dlyFb);this.dlyFb.connect(this.dly);const dhp=c.createBiquadFilter();dhp.type='highpass';dhp.frequency.value=260;dhp.Q.value=0.6;dlp.connect(dhp);const dg=this.dg=c.createGain();dg.gain.value=this.evo?0.45:0.3;dhp.connect(dg);")
r("dlp.connect(this.dly2);", "dhp.connect(this.dly2);")
r("const MOV=[['drop',16],", "/* Prototype 46: the high-pass on each non-bass bus (Hz), and in breakdowns, where the bass is out */\nconst MHP={pad:200,keys:180,arp:220,resp:180,amb:150},MHPB={pad:90,keys:70};\nconst MOV=[['drop',16],")
# ---- the bols start at the bar line, before the faders move; the faders follow the template's own levels and the bols
r("if(this.T){const[n0,b0,l0]=this.sec;if(n0==='drop'&&b0===0&&this.swT0==null)this.swT0=t;try{this.swPlanAt(t,bd,n0,b0,l0)}catch(e){}",
  "if(this.T)try{this.tBolPlan(t)}catch(e){}if(this.T){const[n0,b0,l0]=this.sec;if(n0==='drop'&&b0===0&&this.swT0==null)this.swT0=t;try{this.swPlanAt(t,bd,n0,b0,l0)}catch(e){}")
r("if(this.T&&lv&&this.sec&&this.sec[0]==='rise'){lv.snare=(lv.snare||0)*0.7;lv.pad=(lv.pad||0)*0.7;lv.hat=(lv.hat||0)*0.85}if(this.rA||this.rE)this.rxLv(lv);",
  "if(this.T&&lv&&this.sec&&this.sec[0]==='rise'){lv.snare=(lv.snare||0)*0.7;lv.pad=(lv.pad||0)*0.7;lv.hat=(lv.hat||0)*0.85}if(this.rA||this.rE)this.rxLv(lv);"
  "if(this.T&&lv&&this.phase==='groove'){const M=this.T.lvm;if(M)for(const k in M)if(lv[k]!=null)lv[k]*=M[k];const D=this.tBolDuck();if(D)for(const k in D)if(lv[k]!=null)lv[k]*=D[k]}"
  "if(this.hpF&&this.phase==='groove'&&this.sec&&this.sec[1]===0)this.hpSec(t,this.sec[0],bd);")
# ---- the breakdown's wash: rarer (tWash)
r("if(n==='brk'&&bi===0&&T.brk)this.texS(T.brk[0],t,T.brk[1],T.brk[2])},", "if(n==='brk'&&bi===0&&T.brk&&this.tWash())this.texS(T.brk[0],t,T.brk[1],T.brk[2])},")
# ---- the recordings Eric called bad, gone where nothing else needs them: the "tsshh" open hat (hat_gump: "a bad sample,
#      can we fully delete"), the clock-tick percussion (Lightspeed: "the clock noises... are bad"), the robot squeal
#      (Tape Haze: "the high end squeal deeeee"), the frame drum and tambourine layer and the shakers Eric heard as "the
#      shaker"; old codes that drew those layers play without them
r("ho:'x_hat_gump'", "ho:'x_hat_cats'", 2)
r("(Sonic Pi's hat_gump, in the tight and", "(Sonic Pi's hat_gump, deleted in Prototype 46, in the tight and")
r("elec:{n:'electronic percussion',p:P('elec_tick:.3 - tbd_perc_tap_1:.25 elec_blip:.18 elec_tick:.3 - tbd_perc_tap_2:.25 - elec_tick:.3 elec_pop:.2 tbd_perc_tap_1:.25 - elec_tick:.3 glitch_perc4:.15 tbd_perc_blip:.2 elec_wood:.2')},\n", "")
r("wood:{n:'claves and slit drum',x2:1,p:P('sl2:.45 - clv1:.25 lsk:.2 sl1:.35 - clv2:.22 lsk:.2 sl2:.4 lsh:.18 clv1:.25 lsk:.2 sl1:.35 clv2:.2 - lsk:.22')},",
  "wood:{n:'claves and slit drum',x2:1,p:P('sl2:.45 - clv1:.25 - sl1:.35 - clv2:.22 - sl2:.4 - clv1:.25 - sl1:.35 clv2:.2 - -')},")
r("    frame:{n:'frame drum',x2:1,p:P('frs:.45 - tm2s:.2 frm2:.3 tm2:.3 - frm2:.25 tm2s:.2 frs:.4 - tm2s:.2 frm2:.3 tm2:.32 frm2:.22 tm2s:.2 -')},\n", "")
r("glitch:{n:'glitches',x2:1,p:P('elec_flip:.25 - mh_r1:.15 elec_blup:.18 glitch_perc1:.2 - elec_cymbal:.15 mh_r2:.12 mh_r5:.15 elec_flip:.22 elec_fuzz_tom:.15 glitch_perc3:.18 elec_blup:.15 mh_r3:.12 mh_r7:.15 -')},",
  "glitch:{n:'glitches',x2:1,p:P('elec_flip:.25 - - elec_blup:.18 glitch_perc1:.2 - elec_cymbal:.15 - - elec_flip:.22 elec_fuzz_tom:.15 glitch_perc3:.18 elec_blup:.15 - - -')},")
DEL = ['x_hat_gump', 'x_elec_tick', 'x_tbd_perc_tap_1', 'x_tbd_perc_tap_2', 'x_elec_blip', 'x_glitch_perc4', 'x_tbd_perc_blip', 'x_elec_wood',
       'x_mh_r1', 'x_mh_r2', 'x_mh_r3', 'x_mh_r5', 'x_mh_r7', 'x_frs', 'x_tm2s', 'x_frm2', 'x_tm2', 'x_lsk', 'x_lsh', 'x_trm', 'x_perc_swash']
MARK = '/* ---------- song templates (Prototype 43, rebuilt in Prototype 45, thinned in Prototype 46) ----------'
assert MARK in DATA
def lit(x): return repr(x)
out = ['#!/usr/bin/env python3',
 '# Prototype 46 (music only; races unchanged). Built by /home/claude/p46/music/src/make_patch.py. Applies to the Prototype',
 '# 45 page:  P=<html> python3 p46_music.py',
 '# - the synth drone: a held pad under the drops only in the templates Eric allowed it (Hard Pressure, Modal Friction,',
 '#   Tape Haze, Tabla Psy and a few he liked with theirs), and not in breakdowns that have keys;',
 '# - the shaker: no shaker lane, a percussion layer only where a template names one (eleven templates);',
 '# - melodies written as repeated motifs (chord tones on the strong beats, steps between, a question and its answer),',
 '#   breakdown chords held to the next chord, a quiet background part where Eric asked for one;',
 '# - space: the pad, keys, arpeggio and answer buses and the reverb and echo returns high-passed above the bass;',
 '# - the tabla bols twice, the answer loud with everything else nearly silent; Hang Garden plays breakcore on the hang;',
 '# - dubstep and the templates Eric buried retired; the recordings he called bad deleted.',
 '# No Math.random at load or in the race path.',
 'import os', "P=os.environ.get('P')", "assert P,'set P=<html>'", "s=open(P,encoding='utf-8').read()",
 'def rep(a,b,n=1):', '    global s', '    c=s.count(a)', "    assert c==n,'anchor found %d times (wanted %d): %r'%(c,n,a[:100])", '    s=s.replace(a,b)',
 'def blk(a,b,new):', '    global s', "    assert s.count(a)==1,'block start %d: %r'%(s.count(a),a[:80])", "    i=s.find(a);j=s.find(b,i+len(a))", "    assert j>i and s.count(b)==1,'block end: %r'%b[:80]", '    s=s[:i]+new+s[j:]',
 "assert %s not in s,'p46_music.py has already been applied to '+P" % lit(MARK),
 "assert '/* ---------- song templates (Prototype 43, rebuilt in Prototype 45) ----------' in s,'not a Prototype 45 page'",
 "for k in %s:" % lit(DEL), "    i=s.find('\"'+k+'\":\"')", "    assert i>0,'sample data missing: '+k", "    j=s.find('\"',i+len(k)+4)", "    assert j>i", "    e=s[j+1:j+2]", "    s=s[:i]+s[j+2:] if e==',' else s[:i]+s[j+1:]"]
for a, b, new in BLK: out.append('blk(%s,%s,%s)' % (lit(a), lit(b), lit(new)))
for a, b, n in R: out.append('rep(%s,%s%s)' % (lit(a), lit(b), '' if n == 1 else ',%d' % n))
out += ["for k in %s:" % lit(DEL), "    assert ('\"'+k+'\":\"') not in s and (\"'\"+k+\"'\") not in s and (' '+k[2:]+':.') not in s and (\"('\"+k[2:]+':.') not in s,'still referenced: '+k",
        "open(P,'w',encoding='utf-8').write(s)", "print('p46_music: applied to',P)"]
open('/home/claude/p46/p46_music.py', 'w').write('\n'.join(out) + '\n')
print('wrote /home/claude/p46/p46_music.py', sum(len(x) for x in out) // 1024, 'KB,', len(BLK), 'blocks,', len(R), 'edits,', len(DEL), 'recordings deleted')
