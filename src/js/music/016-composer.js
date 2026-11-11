//# music/016-composer.js: the evolving composer: the ambient menu music and layer-by-layer builds
/* ---------- evolving composer: ambient menu, layer-by-layer build, mutating groove ----------
   Every instrument plays into its own layer fader (pad, tex, kick, snare, hat, bass, lead, arp). Faders move with linear ramps
   that last one bar, so layers fade in and out bar by bar instead of switching on. Phases:
   ambient (menu, countdown): beatless chord walk, sparkles, wind, slow hints of the theme.
   build (from GO): hats, kick, bass, snare enter one by one; the tune's own lead motif arrives as sparse bell fragments that
     thicken until it is stated in full at ~28-30 s, then starts mutating.
   The public-domain themes are no longer the lead: they only surface now and then as slow, distant echoes (a few notes,
   stretched, fitted to the current chord and scale) to keep the texture changing.
   groove: sections b → drop → brk → rise → a → b ... with a mutation chance every 4-bar phrase; each 48-bar cycle evolves the tune. */
/* Prototype 46: the high-pass on each non-bass bus (Hz), and in breakdowns, where the bass is out */
const MHP={pad:200,keys:180,arp:220,resp:180,amb:150},MHPB={pad:90,keys:70};
const MOV=[['drop',16],['b',16],['brk',8],['rise',8],['drop',16],['sw',8],['a',8],['brk',8],['rise',8]],LAYERS=['amb','pad','tex','kick','snare','hat','bass','lead','arp','echo','resp','keys'];
const rmp=(x,a,b)=>Math.max(0,Math.min(1,(x-a)/(b-a)));
const PENT={minor:[0,3,5,7,10],major:[0,2,4,7,9]},AMBDEG={minor:[0,3,5,7,8,10],major:[0,2,4,5,7,9]};
const LV={a:{pad:.8,tex:0,kick:.9,snare:.9,hat:.85,bass:.9,lead:.55,arp:.35,keys:.6},b:{pad:.8,tex:0,kick:1,snare:1,hat:.9,bass:1,lead:.7,arp:.6,keys:.35},
  drop:{pad:.65,tex:0,kick:1,snare:1,hat:1,bass:1,lead:.75,arp:.8,keys:.3},sw:{pad:.55,tex:.2,kick:1,snare:1,hat:.85,bass:1,lead:0,arp:.55,keys:.4},
  brk:{pad:1.1,tex:.6,kick:0,snare:0,hat:.2,bass:0,lead:.6,arp:.3,keys:1},rw:{pad:0,tex:0,kick:0,snare:0,hat:0,bass:0,lead:0,arp:0,keys:0}};
/* Prototype 43 sections: a solo (lighter drums under a solo instrument), drums only, and the two bars an old tune breaks down for before the next one builds */
LV.solo={pad:.6,tex:.1,kick:.85,snare:.8,hat:.8,bass:.85,lead:.85,arp:.25,keys:.5};LV.drum={pad:0,tex:0,kick:1,snare:1,hat:1,bass:.3,lead:0,arp:0,keys:0};LV.out={pad:.95,tex:.3,kick:0,snare:0,hat:.35,bass:0,lead:.4,arp:.3,keys:.75};
