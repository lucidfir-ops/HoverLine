/* ---------- song templates (Prototype 43, rebuilt in Prototype 45, thinned in Prototype 46) ----------
   Every new tune is one of the templates in TPL: a blueprint from Eric's documents (the agnostic racing guide, the
   production master guide's blueprints with their chord voicings and drum patterns, the classic blueprints, the MIDI
   guide) or his notes. A template pins its genre (and, for a fusion, a second genre for its melody or colour), tempo,
   drum language, bassline, key, mode, chords, what the melody may be, instruments, structure, sidechain and effects.
   The notes are still written live from the tune's seed, inside those rules. Codes are S + the template (two hex
   digits) + eight hex digits (seed, key offset, variant). Prototype 45: one generator for every genre (the player can
   switch genres off), likes that steer the radio, drums with round robins, velocity, ghost notes and micro-timing,
   sidechain ducking per genre, extended chords voiced with voice leading, and the library kits and synths when loaded.
   Prototype 46 (Eric: the synth drone, the shaker, notes at random, no space in the mix): a held pad under the drops
   only where Eric allowed it (pdd), percussion layers only where a template names them, no shaker lane, melodies
   written as repeated motifs (mg), the mix high-passed above the bass, and the tabla bols answered twice, loud. */
const SCX={minor:[0,2,3,5,7,8,10],harm:[0,2,3,5,7,8,11],dorian:[0,2,3,5,7,9,10],phryg:[0,1,3,5,7,8,10],phrdom:[0,1,4,5,7,8,10],major:[0,2,4,5,7,9,11],mixo:[0,2,4,5,7,9,10],
  yu:[0,3,5,7,10],gong:[0,2,4,7,9],bhairav:[0,1,4,5,7,8,11]};
const SCXH={minor:'harm',harm:'harm',dorian:'dorian',phryg:'phryg',phrdom:'phrdom',major:'major',mixo:'mixo',yu:'minor',gong:'major',bhairav:'bhairav'};
const TPL_FAM={phonk:'wave / drift phonk',glitch:'glitch-hop / neuro-funk',techno:'techno / industrial',house:'house / bass house',dub:'dubstep / tearout',euro:'eurobeat',dnb:'drum & bass',
  jungle:'jungle / breakcore',trance:'trance',psy:'psytrance',hardcore:'happy hardcore',metal:'metal',world:'world'};
/* the genres the player can switch off (Settings, Music); a template plays only when all its genres are on */
const GENRES=[['phonk','Phonk'],['glitch','Glitch-hop'],['techno','Techno'],['house','House'],['dub','Dubstep'],['trance','Trance'],['psy','Psytrance'],['euro','Eurobeat'],
  ['dnb','Drum & bass'],['jungle','Jungle & breakcore'],['hardcore','Happy hardcore'],['metal','Metal'],['world','World']].filter(g=>g[0]!=='dub');
/* Prototype 46: no more dubstep (Eric: "you'd need a dubstep plugin"); its templates are retired, so its switch is gone */
/* structures: the sections a tune moves through (the first drop lands on GO); about 90 s is heard before the next tune */
const TSTRUCT={std:[['drop',16],['b',16],['brk',8],['rise',8],['drop',16],['sw',8],['a',8],['brk',8],['rise',8]],
  solo:[['drop',16],['b',8],['solo',16],['rise',4],['drop',16],['a',8],['brk',8],['rise',8]],
  drum:[['drop',16],['drum',8],['b',16],['brk',8],['rise',4],['drop',16],['drum',8],['sw',8],['brk',8],['rise',4]],
  long:[['drop',16],['b',16],['brk',16],['rise',8],['drop',16],['a',8],['brk',8],['rise',8]],
  techno:[['drop',16],['b',16],['a',16],['brk',8],['rise',4],['drop',16],['sw',16],['brk',8],['rise',4]],
  psy:[['drop',16],['b',16],['a',16],['brk',8],['rise',8],['drop',16],['sw',8],['b',8],['brk',8],['rise',4]]};
/* a small integer hash in [0,1): micro-timing, velocity and round-robin choices without touching Math.random */
const hsh=(a,b)=>{let x=Math.imul((a|0)^0x9E3779B9,0x85EBCA6B)^Math.imul((b|0)+0x632BE5AB,0xC2B2AE35);x^=x>>>15;x=Math.imul(x,0x2C1B3C6D);x^=x>>>12;x=Math.imul(x,0x297A2D39);x^=x>>>15;return(x>>>0)/4294967296};
/* ---- drum languages (Prototype 45) ----
   One bar of sixteenths per lane ('.' rest, 1-9 tenths of full velocity, X full). K kick, S snare, C clap, G ghost
   snare, H closed hat, O open hat (gated short: never a constant), R ride, P rim, N crushed noise, T toms, Z shaker,
   U percussion accent (the template's: cowbell, claves, anvil...), Y crash. B plays the template's break through the
   slice sequencer (1 light edits, 2 heavier, 3 breakcore). Sections: main (drops and builds), b, a (and solo), sw
   (switch-up), drum (drums only); V lists bar-by-bar variations (bar 1, 2, 3, 4 of each four) merged over the
   section. mt: lanes pushed late (+) or early (-) by a fraction of a sixteenth (neurofunk and breakcore snares sit a
   little behind the grid, their ghosts a little ahead); hum: velocity spread and timing jitter (ms). The open hat
   that hissed on every offbeat of the trance, psytrance and eurobeat languages (Sonic Pi's hat_gump, in the tight and
   808 kits) is gone: offbeats are closed hats, and an open hat only marks the end of a phrase. */
const TDR=(()=>{const D={
 four:{kick:'k9',fill:'snare',hum:[0.06,1.5],v:{clap:['clap_909']},
   main:{K:'X...X...X...X...',C:'....7.......7...',H:'2.5.2.5.2.5.2.5.',P:'......3.....3..2'},mainV:[0,0,0,{K:'X...X...X...X.6.',P:'......3...3.3.3.'}],
   b:{K:'X...X...X...X...',C:'....7.......7...',H:'2252225222522252',R:'..3...3...3...3.',P:'...3..3....3..3.'},bV:[0,0,0,{O:'..............4.'}],
   a:{K:'X...X...X...X...',H:'2.4.2.4.2.4.2.4.',P:'......3.......3.'},sw:{K:'X.......X.......',C:'....7.......7...',H:'2242224222422242',T:'..........4..3..'},
   drum:{K:'X...X...X...X...',C:'....7.......7...',H:'2252225222522252',T:'..........5.4.3.'}},
 indus:{kick:'ki',fill:'snare',hum:[0.05,1],v:{kick:['kick_dist'],clap:['clap_909']},
   main:{K:'X...X...X...X..6',C:'....9.......9...',H:'..5...5...5...5.',N:'.......4.......4',U:'...3.......3....'},
   b:{K:'X...X..5X...X...',C:'....9.......9...',H:'2.5.2.5.2.5.2.5.',N:'..3.......3.....',U:'.......4.......4'},a:{K:'X...X...X...X...',H:'..5...5...5...5.',N:'..............5.'},
   sw:{K:'X.....X...X.....',S:'........X.......',N:'...4.......4....',H:'..5...5...5...5.'},drum:{K:'X...X..6X...X.6.',C:'....9.......9...',N:'..4...4...4...4.',U:'...3...3...3...3'}},
 hard:{kick:'k9',fill:'clap',hum:[0.05,1],
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'2.5.2.5.2.5.2.5.',P:'...3......3.....'},mainV:[0,0,0,{K:'X...X...X...X.7.',C:'....X.......X..5'}],
   b:{K:'X...X...X...X...',C:'....X.......X...',H:'2252225222522252',R:'..4...4...4...4.',P:'...3......3.....'},a:{K:'X...X...X...X...',H:'2.4.2.4.2.4.2.4.'},
   sw:{K:'X...X...X...X...',S:'....X.......X...',H:'..4...4...4...4.'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'2252225222522252',T:'..........5.4.3.'}},
 minimal:{kick:'kh',fill:'clap',hum:[0.08,2],
   main:{K:'X...X...X...X...',P:'...5..5....5..5.',H:'..3...3...3...3.',Z:'1.2.1.2.1.2.1.2.'},mainV:[0,0,0,{O:'..............3.'}],
   b:{K:'X...X...X...X...',C:'....6.......6...',P:'...5..5....5..5.',H:'2323232323232323'},a:{K:'X...X...X...X...',H:'..3...3...3...3.'},
   sw:{P:'...5..5....5..5.',H:'2323232323232323',Z:'1212121212121212'},drum:{K:'X...X...X...X...',C:'....6.......6...',P:'...5..5....5..5.',H:'2323232323232323'}},
 ebm:{kick:'ki',fill:'snare',hum:[0.04,1],v:{kick:['kick_dist']},
   main:{K:'X...X...X...X...',S:'....X.......X...',H:'..3...3...3...3.',N:'..........4.....'},b:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',H:'.3.3.3.3.3.3.3.3'},
   a:{K:'X...X...X...X...',S:'....X.......X...'},sw:{K:'X.......X.......',S:'....X.......X...'},drum:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',H:'.3.3.3.3.3.3.3.3'}},
 house:{kick:'kh',fill:'clap',hum:[0.08,2],oLen:0.1,
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'..7...7...7...7.',Z:'2.3.2.3.2.3.2.3.'},mainV:[0,0,0,{C:'....X.......X..4',O:'..............5.'}],
   b:{K:'X...X...X...X...',C:'....X.......X...',H:'..7...7...7...7.',Z:'2323232323232323',P:'...4......4.....'},bV:[0,{O:'..............4.'},0,{O:'..............5.'}],
   a:{K:'X...X...X...X...',H:'..6...6...6...6.',Z:'2.2.2.2.2.2.2.2.'},sw:{C:'....X.......X...',H:'..6...6...6...6.',Z:'2323232323232323',P:'...4..4...4..4..'},
   drum:{K:'X...X...X...X...',C:'....X.......X...',H:'..7...7...7...7.',Z:'2323232323232323'}},
 bhouse:{kick:'kh',fill:'hatroll',hum:[0.06,1.5],
   main:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',G:'..............4.',H:'2252225222522252'},
   b:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6..5',H:'2252225222522252',P:'...4......4.....'},a:{K:'X...X...X...X...',H:'..5...5...5...5.'},
   sw:{K:'X.....X...X.....',S:'....X.......X...',H:'..5...5...5...5.'},drum:{K:'X...X...X...X...',S:'....X.......X...',H:'2252225222522252'}},
 /* trance: a long kick, a big clap in the reverb, closed offbeat hats and a whisper of shaker; the pump does the rest */
 trance:{kick:'kt',fill:'snare',hum:[0.06,1.5],crev:0.42,v:{kick:['kick_long'],ohh:['ohh_trance','ohh_dark']},
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'..6...6...6...6.',Z:'1.2.1.2.1.2.1.2.'},mainV:[0,0,0,{O:'..............4.'}],
   b:{K:'X...X...X...X...',C:'....X.......X...',H:'..6...6...6...6.',R:'5...4...5...4...',Z:'2121212121212121'},a:{K:'X...X...X...X...',H:'..5...5...5...5.'},
   sw:{K:'X...X...X...X...',C:'............X...',H:'..5...5...5...5.'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'..6...6...6...6.',T:'............5.4.'}},
 /* uplifting: clap and snare share the backbeat and swap round, so the clap never repeats unchanged for long */
 uplift:{kick:'kt',fill:'snare',hum:[0.06,1.5],crev:0.4,v:{kick:['kick_long']},
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'..6...6...6...6.',Z:'1212121212121212'},
   mainV:[0,{C:'....X.......X...',G:'..............3.'},{C:'............X...',S:'....7...........'},{C:'....X.......X...',S:'.............67X',O:'..............4.'}],
   b:{K:'X...X...X...X...',S:'....X.......X...',C:'............6...',H:'..6...6...6...6.',R:'4...3...4...3...'},bV:[0,0,{S:'....X.......X..5'},{S:'....X.......XX6X'}],
   a:{K:'X...X...X...X...',H:'..5...5...5...5.'},sw:{K:'X...X...X...X...',C:'............X...',H:'..5...5...5...5.'},
   drum:{K:'X...X...X...X...',C:'....X.......X...',H:'..6...6...6...6.',T:'............5.4.'}},
 prog:{kick:'kt',fill:'clap',hum:[0.07,2],v:{kick:['kick_long']},
   main:{K:'X...X...X...X...',H:'..4...4...4...4.',P:'.......4.......4',C:'............6...',Z:'1.2.1.2.1.2.1.2.'},
   b:{K:'X...X...X...X...',C:'....6.......6...',H:'..5...5...5...5.',P:'.......4.......4'},a:{K:'X...X...X...X...',H:'..4...4...4...4.'},
   sw:{K:'X.......X.......',P:'...4..4...4..4..',H:'..4...4...4...4.'},drum:{K:'X...X...X...X...',C:'....7.......7...',H:'..5...5...5...5.',P:'.......4.......4'}},
 /* psytrance: DUH-duh-duh-duh. The kick on every beat, the bass on the three sixteenths after it, ducked hard under
    the kick (see TSC); closed offbeat hats, a clap only now and then */
 psy:{kick:'kp',fill:'snare',hum:[0.04,1],v:{ohh:['ohh_psy','ohh_dark']},
   main:{K:'X...X...X...X...',H:'..4...4...4...4.',Z:'...2...2...2...2'},mainV:[0,0,0,{C:'............5...'}],
   b:{K:'X...X...X...X...',H:'..5...5...5...5.',C:'....5.......5...',Z:'.2.2.2.2.2.2.2.2'},a:{K:'X...X...X...X...',H:'..4...4...4...4.'},
   sw:{K:'X...X...X...X...',H:'2232223222322232'},drum:{K:'X...X...X...X...',H:'..5...5...5...5.',C:'....5.......5...',T:'..........4.3.3.'}},
 euro:{kick:'kt',fill:'snare',hum:[0.05,1.5],
   main:{K:'X...X...X...X...',S:'....X.......X...',H:'3534353435343534'},mainV:[0,0,0,{S:'....X.......X567'}],
   b:{K:'X...X...X...X...',S:'....X.......X...',C:'....7.......7...',H:'3534353435343534'},a:{K:'X...X...X...X...',H:'3.3.3.3.3.3.3.3.'},
   sw:{K:'X.......X.......',S:'....X.......X...'},drum:{K:'X...X...X...X...',S:'....X.......X.6.',H:'3534353435343534'}},
 euro2:{kick:'kt',fill:'snare',hum:[0.05,1.5],
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'3434343434343434'},mainV:[0,0,0,{C:'....X.......X...',S:'.............567'}],
   b:{K:'X...X...X...X...',C:'....X.......X...',S:'....8.......8...',H:'3434343434343434'},a:{K:'X...X...X...X...',H:'3.3.3.3.3.3.3.3.'},
   sw:{K:'X.......X.......',C:'....X.......X...'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'3434343434343434',T:'............5.4.'}},
 /* drift phonk: four-on-the-floor 808, clap on 2 and 4, hats with hard velocity changes and rolls into the next bar */
 dphonk:{kick:'k8',fill:'hats',hum:[0.08,2],v:{kick:['kick_long']},
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'6.4.6.4.6.4.6.4.'},mainV:[0,{H:'6.4.6.4.6.4.6646'},0,{H:'6.4.6.4.6.466464',C:'....X.......X.3.'}],
   b:{K:'X...X...X...X.6.',C:'...2X....2..X.2.',H:'6464646464646464'},a:{K:'X.......X.......',C:'....X.......X...',H:'6.4.6.4.6.4.6.4.'},
   sw:{K:'X......6..X.....',C:'........X.......',H:'6.4.6.4.6.4.6464'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'6464646464646464'}},
 /* phonk / trap: half-time snare, 808 kick with pickups, hats rolling in triplets at bar ends */
 phonk:{kick:'k8',fill:'hats',hum:[0.08,2],v:{kick:['kick_long']},
   main:{K:'X......6..X.....',C:'........X.......',H:'5.4.5.4.5.4.5454'},mainV:[0,{H:'5.4.5.4.54545.4.'},0,{K:'X..6......X..6..',H:'5.4.5.4.5.4.5555'}],
   b:{K:'X..6......X..6..',C:'........X.......',G:'.....2.........2',H:'5.4.5.4.54545.4.'},a:{K:'X.........X.....',C:'........X.......',H:'4...4...4...4...'},
   sw:{K:'X...X...X...X...',C:'....X.......X...',H:'5.4.5.4.5.4.5.4.'},drum:{K:'X..6..6...X..6..',C:'........X.......',H:'5454545454545454'}},
 glitch:{kick:'kd',fill:'stutter',hum:[0.08,2],
   main:{K:'X......6..X.....',S:'....X.......X...',G:'.......3.......3',H:'4.3.4.3.4.3.4.3.'},b:{K:'X..6...6..X.....',S:'....X.......X..5',G:'......3.........',H:'4343434343434343',Z:'2.3.2.3.2.3.2.3.'},
   a:{K:'X.......X.......',S:'....X.......X...',H:'4.3.4.3.4.3.4.3.'},sw:{K:'X...............',S:'........X.......',H:'4.4.4.4.4.4.4.4.'},drum:{K:'X..6...6..X..6..',S:'....X.......X..5',G:'.3.....3.3....3.',H:'4343434343434343'}},
 /* funk (RACE 037): kick on 1, the and of 2 and 4, rimshot and snare on 2 and 4, swung hats */
 funk:{kick:'kd',fill:'stutter',hum:[0.09,3],mt:{G:-0.04},
   main:{K:'X.....X.....X...',S:'....X.......X...',P:'.......3......3.',G:'..........2....2',H:'4.3.4.3.4.3.4.3.'},mainV:[0,0,0,{K:'X.....X.....X.6.',G:'..........2..3.3'}],
   b:{K:'X.....X.....X...',S:'....X.......X...',P:'.......3......3.',H:'4343434343434343',Z:'2.3.2.3.2.3.2.3.'},a:{K:'X.....X.........',S:'....X.......X...',H:'4.3.4.3.4.3.4.3.'},
   sw:{K:'X...............',S:'........X.......',H:'4.3.4.3.4.3.4.3.'},drum:{K:'X.....X.....X...',S:'....X.......X...',G:'.2.....2..2..2.2',H:'4343434343434343'}},
 /* jazz-funk (RACE 038): a syncopated sixteenth bounce, a short staccato snare, swung sixteenth hats */
 jfunk:{kick:'kd',fill:'snare',hum:[0.1,3],mt:{G:-0.03},
   main:{K:'X.....X..X......',S:'....X.......X...',G:'.......2......2.',H:'4242424242424242'},mainV:[0,{K:'X.....X...X.....'},0,{K:'X.....X..X...6..'}],
   b:{K:'X.....X..X......',S:'....X.......X...',G:'..2....2..2...2.',H:'4242424242424242',R:'4...3...4...3...'},a:{K:'X.......X.......',S:'....X.......X...',H:'4.2.4.2.4.2.4.2.'},
   sw:{K:'X...............',S:'........X.......',H:'4242424242424242'},drum:{K:'X.....X..X...6..',S:'....X.......X...',G:'.2.2...2..2..2.2',H:'4242424242424242'}},
 boombap:{kick:'kd',fill:'stutter',hum:[0.09,3],
   main:{K:'X......6..X.....',S:'....X.......X...',G:'...........3....',H:'4.3.4.3.4.3.4.3.'},b:{K:'X..6...6..X..6..',S:'....X.......X...',G:'...........3...3',H:'4343434343434343'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'4...4...4...4...'},sw:{K:'X...............',S:'........X.......',H:'4.3.4.3.4.3.4.3.'},drum:{K:'X..6...6..X..6..',S:'....X.......X..5',G:'.3.....3.3....3.',H:'4343434343434343'}},
 /* glitch-hop on a chopped Arovane break (RACE 036: kick on 1 and the and of 2, a fat snare, shaker) */
 glitchb:{kick:'kd',brk:'arov',fill:'stutter',hum:[0.08,2],
   main:{B:1,K:'X.....X.........',S:'....X.......X...',Z:'2.3.2.3.2.3.2.3.'},b:{B:2,K:'X..6..X...X.....',S:'....X.......X..5',Z:'2323232323232323'},a:{B:1,lo:1},
   sw:{K:'X...............',S:'........X.......',H:'4.4.4.4.4.4.4.4.'},drum:{B:3}},
 twostep:{kick:'kd',fill:'snare',hum:[0.07,2],mt:{S:0.02,G:-0.03},
   main:{K:'X.........X.....',S:'....X.......X...',G:'.......3.3....3.',H:'5.3.5.3.5.3.5.3.'},mainV:[0,0,0,{K:'X.........XX....'}],
   b:{K:'X.....X...X.....',S:'....X.......X...',G:'...3.....3.3...3',H:'5.3.5.3.5.3.5.3.',Z:'2.3.2.3.2.3.2.3.'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'5...5...5...5...'},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{K:'X.........XX....',S:'....X..3.3..X..3',G:'.3....3......3..',H:'5353535353535353'}},
 roller:{kick:'kd',fill:'snare',hum:[0.07,2],mt:{S:0.02,G:-0.03},
   main:{K:'X.........XX....',S:'....X.......X...',G:'......3........3',H:'4242424242424242'},mainV:[0,{K:'X.........X.....'},0,{K:'X.........XX..6.'}],
   b:{K:'X.....X...X.....',S:'....X.......X...',G:'...3......3....3',H:'4242424242424242'},a:{K:'X.........X.....',S:'....X.......X...',H:'4.2.4.2.4.2.4.2.'},
   sw:{K:'X.........X.....',S:'........X.......',H:'4242424242424242'},drum:{K:'X.........XX....',S:'....X..3.3..X..3',H:'4242424242424242'}},
 /* jump-up: plain, heavy drums under the bass; the snare doubled with a clap */
 jump:{kick:'kd',fill:'snare',hum:[0.05,1.5],v:{snare:['snare_fat']},
   main:{K:'X.........X.....',S:'....X.......X...',C:'....6.......6...',H:'5...5...5...5...'},mainV:[0,0,0,{K:'X.........X..6..',O:'..............4.'}],
   b:{K:'X......X..X.....',S:'....X.......X...',C:'....6.......6...',H:'5.3.5.3.5.3.5.3.'},a:{K:'X.........X.....',S:'....X.......X...',H:'5...5...5...5...'},
   sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{K:'X.........XX....',S:'....X.......X...',G:'.......3.3....3.',H:'5353535353535353'}},
 /* neurofunk (RACE 201): kick on 1 and the and of 2, a cracking snare a hair behind the grid, ghosts a hair ahead,
    break chops under clean hats in the B section */
 neuro:{kick:'kd',brk:'think',fill:'snare',hum:[0.06,1.5],mt:{S:0.05,G:-0.04},v:{snare:['snare_crack']},
   main:{K:'X.....X.........',S:'....X.......X...',G:'.......3.3....3.',H:'5353535353535353'},mainV:[0,{K:'X.....X...X.....'},0,{K:'X.....X...X..X..',G:'.......3.3..3.33'}],
   b:{B:1,lo:1,K:'X.....X...X.....',S:'....X.......X...',G:'...3...3.3.....3',H:'5.3.5.3.5.3.5.3.'},a:{K:'X.........X.....',S:'....X.......X...',H:'5.3.5.3.5.3.5.3.'},
   sw:{K:'X.....X.........',S:'........X.......',H:'5353535353535353'},drum:{B:2,K:'X.....X...X.....',S:'....X.......X...'}},
 liquid:{kick:'kd',fill:'snare',hum:[0.1,2.5],mt:{G:-0.02},
   main:{K:'X.........X.....',S:'....X.......X...',G:'.......2.......2',H:'4.24.24.24.24.2.',Z:'1.2.1.2.1.2.1.2.'},mainV:[0,0,0,{K:'X.........X..5..'}],
   b:{K:'X.....X...X.....',S:'....X.......X...',G:'...2...2.......2',H:'4.24.24.24.24.2.',R:'4...3...4...3...'},a:{K:'X.........X.....',S:'....X.......X...',H:'4...4...4...4...'},
   sw:{K:'X.........X.....',S:'........X.......',H:'4.24.24.24.24.2.'},drum:{K:'X.........X.....',S:'....X.......X...',G:'.2.....2.2....2.',H:'4.24.24.24.24.2.'}},
 /* half-time (dubstep and halftime drum & bass, RACE 135 and 137): kick on 1 and the and of 3, snare on 3 */
 half:{kick:'kd',fill:'snare',hum:[0.06,1.5],
   main:{K:'X.........X.....',S:'........X.......',H:'4.4.4.4.4.4.4.4.'},mainV:[0,0,0,{K:'X..5......X.....',H:'4.4.4.4.4.4.4444'}],
   b:{K:'X..5......X.....',S:'........X.....3.',H:'4.4.4.4.444.4.44'},a:{K:'X...............',S:'........X.......',H:'4...4...4...4...'},
   sw:{K:'X.........X.....',S:'....X.......X...',H:'5.3.5.3.5.3.5.3.'},drum:{K:'X..5......X..5..',S:'........X.....3.',H:'4444444444444444'}},
 amen:{kick:'kd',brk:'amen',fill:'brk',main:{B:1,K:'X.........X.....'},b:{B:1},a:{B:1,lo:1},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{B:2}},
 think:{kick:'kd',brk:'think',fill:'brk',main:{B:1,K:'X.........X.....'},b:{B:1},a:{B:1,lo:1},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{B:2}},
 /* a rolling jungle break of our own (no record behind it), ride on the quarters */
 jroll:{kick:'kd',brk:'jroll',fill:'brk',main:{B:1,K:'X.........X.....'},b:{B:1,R:'4...3...4...3...'},a:{B:1,lo:1},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{B:2}},
 brkcore:{kick:'kd',v:{snare:['snare_brk']},brk:'amen',fill:'brk',main:{B:2,K:'X.........X.....'},b:{B:2},a:{B:1},sw:{K:'X.X.X.X.X.X.X.X.',S:'....X.......X...'},drum:{B:3}},
 /* breakcore in odd groupings (RACE 202): the break re-cut in sevens and fives over the bar, gabber kick bursts */
 brkodd:{kick:'kg',v:{kick:['kick_dist'],snare:['snare_brk']},brk:'amen',fill:'brk',odd:1,main:{B:2,K:'X.........X.....'},mainV:[0,0,0,{K:'X.X.X.X.X.......'}],b:{B:3},a:{B:1},sw:{K:'X.X.X.X.X.X.X.X.',S:'....X.......X...'},drum:{B:3,K:'X...X...X...X...'}},
 /* happy hardcore (RACE 204): a distorted gabber-tone kick on every beat, the clap on 2 and 4 with offbeat accents,
    driving sixteenth hats */
 hcore:{kick:'kg',fill:'snare',hum:[0.04,1],crev:0.3,v:{kick:['kick_hhc','kick_dist']},
   main:{K:'X...X...X...X...',C:'....X.......X...',H:'2252225222522252'},mainV:[0,{C:'....X.......X.3.'},0,{C:'....X.....3.X.33',O:'..............4.'}],
   b:{K:'X...X...X...X...',C:'....X.......X...',S:'....6.......6...',H:'2252225222522252'},bV:[0,0,0,{S:'....6.......6567'}],
   a:{K:'X...X...X...X...',H:'..5...5...5...5.'},sw:{K:'X.......X.......',C:'....X.......X...',H:'2252225222522252'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'2252225222522252',T:'............6.5.'}},
 /* metal: double kick in eighths and then sixteenths, the backbeat, ride and crash on the phrase */
 metal:{kick:'km',fill:'toms',hum:[0.07,2.5],v:{kick:['kick_metal'],snare:['snare_metal']},
   main:{K:'9.7.9.7.9.7.9.7.',S:'....X.......X...',R:'5.4.5.4.5.4.5.4.'},mainV:[0,0,0,{K:'9.7.9.7.9.7.9797'}],
   b:{K:'9797979797979797',S:'....X.......X...',H:'5.4.5.4.5.4.5.4.'},a:{K:'X.....X...X.....',S:'....X.......X...',H:'5.4.5.4.5.4.5.4.'},
   sw:{K:'X.........X.....',S:'........X.......',R:'5.4.5.4.5.4.5.4.'},drum:{K:'9.9.9.9.9.9.9.9.',S:'....X.......X...',T:'..........6.5.4.'}},
 /* 80s chase (RACE 070): an acoustic kick on every beat, a huge gated snare on 2 and 4, two-handed sixteenth hats */
 /* Prototype 46, Hang Garden (Eric: "your breakcore drum programming played on the hang drum"): the hang plays the
    break (tHangBar); the kit keeps only a soft kick under it, and a closed hat in the B section */
 hangbrk:{kick:'kd',fill:'none',hum:[0.05,1.5],main:{K:'X.........X.....'},mainV:[0,0,0,{K:'X.........X..6..'}],b:{K:'X.........X.....',H:'..3...3...3...3.'},
   a:{K:'X...............'},sw:{K:'X.......X.......'},drum:{K:'X.........X.....'}},
 gated:{kick:'kt',fill:'toms',hum:[0.06,2],gate:1,
   main:{K:'X...X...X...X...',S:'....X.......X...',H:'4343434343434343'},mainV:[0,0,0,{S:'....X.......X.6.'}],
   b:{K:'X...X...X...X...',S:'....X.......X...',H:'4343434343434343',R:'..4...4...4...4.'},a:{K:'X.......X.......',S:'....X.......X...',H:'4.3.4.3.4.3.4.3.'},
   sw:{K:'X.......X.......',S:'....X.......X...',H:'4343434343434343'},drum:{K:'X...X...X...X...',S:'....X.......X...',H:'4343434343434343',T:'..........6.5.4.'}}};
  /* Prototype 46: no shaker lane anywhere (Eric: "never the shaker"); Mentasm keeps its hand percussion, quietly */
  for(const L of Object.values(D))for(const k of['main','b','a','sw','drum']){if(L[k])delete L[k].Z;const V=L[k+'V'];if(V)for(const x of V)if(x)delete x.Z}
  const pv=c=>c==='.'?0:c==='X'?1:(+c)/10,LN='KSCGHORPNTZUY',cv=P=>{if(!P)return P;const o={...P};for(const v of LN)if(typeof o[v]==='string')o[v]=[...o[v]].map(pv);return o};
  for(const L of Object.values(D))for(const k of['main','b','a','sw','drum']){if(!L[k])continue;const base=L[k];L[k]=cv(base);const V=L[k+'V'];
    L[k+'V']=[0,1,2,3].map(i=>V&&V[i]?cv({...base,...V[i]}):L[k])}return D})();
/* recreated breaks (4 bars of sixteenths; K kick, S snare, H closed hat, O open hat, R ride): re-played from the kit,
   never sampled from the records. amen: the Winstons' pattern as usually transcribed; think: a funk break in the
   manner of Lyn Collins' "Think (About It)"; jroll: a rolling jungle break of our own */
const TBRK={amen:{K:['X.X.......XX....','X.X.......XX....','X.X.......X.....','..X9......X.....'],S:['....X..7.6..X..7','....X..7.6..X..7','....X..7.6....X.','.7..X..7.6....X.'],
    H:['6.5.6.5.6.5.6.5.','6.5.6.5.6.5.6.5.','6.5.6.5.6.5.6.5.','6.5.6.5.6.....5.'],O:['................','................','................','..........7.....']},
  think:{K:['X.....X.X.......','X.....X...X..X..','X.....X.X.......','X.....X...X.....'],S:['....X..4.4..X...','....X..4.4..X..6','....X..4.4..X...','....X..4.4.4X.66'],
    H:['5353535353535353','5353535353535353','5353535353535353','53535353535353..'],O:['..............6.','................','..............6.','................']},
  jroll:{K:['X.........X.....','X.....X...X.....','X.........X..6..','X.....X...X.....'],S:['....X..5..3.X..4','....X.3...5.X...','....X..5..3.X..4','.3..X.3..5..X.65'],
    H:['5.4.5.4.5.4.5.4.','5.4.5.4.5.4.5.4.','5.4.5.4.5.4.5.4.','5.4.5.4.5.4.5...'],O:['................','................','................','..............6.']}};
/* sidechain ducking per genre (production guide: fast attack, 30-80 ms release keyed to the kick; house and trance pump
   pads and leads for a quarter note; psytrance ducks its bass all the way under the kick). [depth 0-1, release s or 'q'
   for a quarter-note pump] on the bass (b), pads and arps (p), lead (l) and keys (k) */
const TSC={psy:{b:[0.96,0.06],p:[0.5,0.13],l:[0.3,0.1],k:[0.35,0.12]},house:{b:[0.72,0.09],p:[0.72,'q'],l:[0.5,'q'],k:[0.55,'q']},trance:{b:[0.65,0.09],p:[0.6,'q'],l:[0.32,0.18],k:[0.4,'q']},
  phonk:{b:[0.75,0.12],p:[0.45,0.25],l:[0.25,0.12],k:[0.35,0.2]},euro:{b:[0.55,0.08],p:[0.45,'q'],l:[0.25,0.12],k:[0.35,'q']},hardcore:{b:[0.8,0.08],p:[0.6,'q'],l:[0.35,0.14],k:[0.45,'q']},
  techno:{b:[0.55,0.08],p:[0.35,0.14],l:[0.2,0.1],k:[0.3,0.12]},dub:{b:[0.6,0.1],p:[0.4,0.2],l:[0.2,0.12],k:[0.3,0.15]},dnb:{b:[0.45,0.08],p:[0.3,0.15],l:[0.25,0.1],k:[0.25,0.12]},
  jungle:{b:[0.35,0.08],p:[0.22,0.15],l:[0.15,0.1],k:[0.2,0.12]},glitch:{b:[0.4,0.09],p:[0.25,0.15],l:[0.15,0.1],k:[0.2,0.12]},metal:{b:[0.3,0.06],p:[0.2,0.1],l:[0.1,0.08],k:[0.15,0.1]}};
/* bassline families: [pattern, patch] */
const TBF={octave:['oct','gallop'],rumble:['kbbb','rumb'],offbeat:['off','offb'],sub:['sub','sub'],rolling:['roll','reese0'],gallop:['gal','gallop'],reese:['roll','reese'],sub808:['s808','b808'],growl:['growl','growl'],doctalk:['line','talk'],
  slap:['slap','slap'],docsquare:['line','square'],pluck:['house','pluck'],kbbb:['kbbb','psy'],crush808:['s808','crush'],docreese:['line','reese'],slide808:['slide','b808'],acid:['acid','acid'],
  rolling4:['r4','dark'],square:['sq16','square'],docpluck:['line','pluck'],docgrowl:['line','growl'],doc808:['line','b808'],subhit:['hit','sub'],rollprog:['prog','offb'],docslap:['line','slap'],
  doccrush:['line','crush'],talk:['house','talk'],docdark:['line','dark'],docfold:['line','fold'],docfm:['line','fm'],docring:['line','ring'],organ:['organ','organ'],riddim:['riddim','riddim'],
  docstab:['line','stab'],wobble:['wob','wob'],docneuro:['line','neuro'],docjump:['line','jump'],doctech:['line','tech'],docwob:['line','wob'],doclaser:['line','laser'],
  /* Prototype 45 */
  docreeseS:['line','reeseS'],psyk:['kbbbx','psyT'],hcoff:['hcoff','hcbass'],chug:['chug','chug'],funk:['funk','slap'],deep:['deep','deep'],reese7:['roll','reese7'],docreese7:['line','reese7'],
  tb303:['acid','tb303'],growlbass:['growl','growlbass'],docgrowlbass:['line','growlbass'],talkbass:['house','talkbass'],doctalkbass:['line','talkbass'],fmgrowl:['line','fmgrowl'],
  neuroS:['line','neuroS'],gallopS:['gal','gallopS'],sub808s:['s808','b808'],dub:['dub','sub'],wavesub:['wave','b808']};
/* bass patches for the mono voice; d: which drive stage (dB a little growl, dN heavy, '' clean); o: octave above C2 */
const TBP={offb:b=>({voices:2,spread:8,cut:700,env:1600,envT:0.08,res:1.5,vol:0.085,cal:1.1,len:0.85,o:12,d:''}),
  sub:b=>({type:'sine',voices:1,cut:3000,vol:0.12,cal:0.62,len:0.95,o:0,d:''}),
  rumb:b=>({voices:2,spread:6,cut:260,env:160,envT:0.05,res:1.2,vol:0.09,cal:0.75,len:0.9,o:0,d:'dB'}),
  reese0:b=>({voices:3,spread:22,cut:440,env:900,envT:0.3,res:2.5,sub:0.16,vol:0.075,cal:0.71,len:0.95,o:0,d:'dB'}),
  reese:b=>({voices:3,spread:24,cut:500,env:900,envT:0.3,res:2,vol:0.075,sub:0.12,cal:0.71,wob:{rate:0.3,depth:160},len:0.95,o:0,d:'dB'}),
  /* a smooth reese: no per-note filter envelope (that was the "wa wa" in Amen Roller), a slow drift instead */
  reeseS:b=>({voices:3,spread:20,cut:620,res:1.4,vol:0.075,sub:0.14,cal:0.7,wob:{rate:0.18,depth:90},len:0.97,o:0,d:'dB'}),
  gallop:b=>({voices:2,spread:10,cut:900,env:2200,envT:0.06,res:1.8,vol:0.08,cal:1.0,len:0.7,o:0,d:'dB'}),
  gallopS:b=>({voices:2,spread:10,cut:1100,env:1400,envT:0.05,res:1.3,vol:0.08,cal:0.95,len:0.62,o:0,d:''}),
  b808:b=>({type:'sine',voices:1,cut:5000,pe:7,peT:0.06,vol:0.13,cal:0.62,len:0.95,o:0,d:''}),
  crush:b=>({voices:2,spread:15,crush:6,cut:2500,vol:0.06,cal:1.0,len:0.8,o:0,d:'dN'}),
  growl:b=>({voices:3,spread:14,cut:420,env:1800,envT:0.1,res:2.6,vol:0.075,cal:1.15,wob:{rate:b/60*2,depth:1100},len:0.95,o:0,d:'dN'}),
  slap:b=>({type:'triangle',voices:2,spread:6,cut:350,env:3000,envT:0.07,k:2.4,vol:0.085,cal:1.0,len:0.6,o:12,d:'dB'}),
  square:b=>({type:'square',voices:1,cut:1200,env:1800,envT:0.06,res:1.8,vol:0.07,sub:0.08,cal:0.75,len:0.45,o:0,d:'dN'}),
  pluck:b=>({type:'fm',fm:3,fr:1,voices:1,cut:2200,env:2000,envT:0.08,vol:0.08,cal:0.9,pe:2,peT:0.03,len:0.5,o:0,d:'dB'}),
  psy:b=>({voices:1,cut:420,env:1700,envT:0.05,q:2.6,vol:0.34,cal:0.8,len:0.62,o:0,d:''}),
  /* psytrance, tighter: short notes so each sixteenth is its own "duh" */
  psyT:b=>({voices:1,cut:380,env:1900,envT:0.04,q:2.4,vol:0.34,cal:0.82,len:0.5,o:0,d:''}),
  acid:b=>({voices:1,cut:300,env:2600,envT:0.12,k:3.2,vol:0.09,cal:0.62,len:0.8,o:12,d:'dB',glide:0.06}),
  dark:b=>({voices:2,spread:12,cut:400,env:300,envT:0.2,res:1.5,vol:0.08,cal:0.8,len:0.9,o:0,d:'dB'}),
  talk:b=>({voices:2,spread:10,cut:300,env:2600,envT:0.12,k:3.3,vol:0.07,cal:1.3,len:0.85,o:0,d:'dB'}),
  fm:b=>({type:'fm',fm:4,fr:1,voices:1,cut:2600,env:1500,envT:0.12,vol:0.08,cal:0.84,len:0.85,o:0,d:'dB'}),
  fold:b=>({type:'sine',fold:3,voices:1,cut:3000,vol:0.08,cal:0.74,len:0.9,o:0,d:'dN'}),
  ring:b=>({type:'square',ring:1.5,voices:1,cut:2000,env:2500,envT:0.06,vol:0.07,cal:1.12,len:0.7,o:0,d:'dB'}),
  stab:b=>({voices:2,spread:12,cut:800,env:2400,envT:0.06,pe:5,peT:0.04,vol:0.08,cal:1.0,len:0.6,o:0,d:'dB'}),
  /* the neuro reese with its wobble cut back (Tritone Reese's "wubs" were too prominent) */
  neuro:b=>({voices:3,spread:30,cut:420,wob:{rate:b/60,depth:300},res:2.2,vol:0.075,cal:0.95,len:0.95,o:0,d:'dN'}),
  neuroS:b=>({voices:3,spread:26,cut:460,wob:{rate:b/60,depth:180},res:1.8,vol:0.075,cal:0.92,len:0.95,o:0,d:'dN'}),
  jump:b=>({voices:1,cut:700,env:1500,envT:0.07,res:1.6,glide:0.04,vol:0.1,cal:0.5,len:0.8,o:0,d:'dB'}),
  tech:b=>({voices:1,cut:1800,env:1500,envT:0.1,sub:0.1,vol:0.06,cal:0.6,len:0.9,o:0,d:'dN'}),
  wob:b=>({voices:3,spread:20,cut:350,wob:{rate:b/60,depth:700},res:2.3,vol:0.075,cal:1.25,len:0.95,o:0,d:'dB'}),
  laser:b=>({voices:1,cut:2400,env:2000,envT:0.05,pe:24,peT:0.03,vol:0.07,cal:1.2,len:0.7,o:0,d:'dB'}),
  organ:b=>({type:'square',voices:2,spread:5,cut:1800,env:600,envT:0.1,vol:0.06,cal:0.8,len:0.8,o:12,d:''}),
  riddim:b=>({type:'square',voices:2,spread:8,cut:600,env:2000,envT:0.05,res:2.8,wob:{rate:b/60*4,depth:500},vol:0.075,cal:1.1,len:0.5,o:0,d:'dN'}),
  /* happy hardcore's bouncing offbeat bass, deep house's round sub, metal's chug (a palm-muted guitar when one is ready) */
  hcbass:b=>({voices:2,spread:9,cut:900,env:1800,envT:0.06,res:1.4,vol:0.085,cal:1.05,len:0.55,o:12,d:''}),
  deep:b=>({type:'triangle',voices:1,cut:900,env:500,envT:0.1,sub:0.06,vol:0.1,cal:0.75,len:0.8,o:0,d:''}),
  chug:b=>({gtr:1,voices:2,spread:8,cut:1300,env:900,envT:0.04,vol:0.07,cal:0.9,len:0.5,o:0,d:'dN'})};
/* the library synth basses (SYN) fall back to these patches when it is missing */
const TBPF={tb303:'acid',reese7:'reeseS',growlbass:'growl',talkbass:'talk',fmgrowl:'neuroS'};
/* sampled instruments for template parts: key prefix, the notes recorded, a level, a reverb send; ranges for each
   melodic instrument (synths included); what plays when the recordings are not loaded (Lite). The mbira (nyunga
   nyunga) recordings are gone: a poor recording */
const TSMP={pn:['i_pn_',[36,42,48,54,60,66,72],0.4,0.3],ep:['i_ep_',[48,60,72],0.46,0.25],hp:['i_hp_',[48,69],0.36,0.4],mb:['x_mb_',[48,65,79],0.4,0.25],vb:['x_vb_',[60,74,88],0.38,0.3],
  gl:['x_gl_',[79,91],0.3,0.3],ka:['x_ka_',[55,67],0.4,0.25],hc:['x_hc_',[61,73,84],0.34,0.25],or:['x_or_',[60,72],0.32,0.2],sx:['x_sx_',[60,72],0.4,0.2],dt:['x_dt_',[62,73],0.4,0.25],
  st:['x_st_',[64,76],0.42,0.25],bf:['x_bf_',[61,72],0.4,0.25],rc:['x_rc_',[72,84],0.34,0.25],xy:['x_xy_',[72,79,84,96],0.34,0.25],hm:['x_hm_',[72,84,96],0.3,0.3],up:['x_up_',[48,60,72,84],0.42,0.3],
  cv:['x_cv_',[48,60,72,84],0.4,0.2],sl:['x_sl_',[62,74,82],0.4,0.2],ps:['x_ps_',[72,84],0.32,0.3],kk:['x_kk_',[61,73],0.42,0.25]};
const TREG={pn:[60,79],ep:[57,76],hp:[55,79],mb:[57,79],vb:[60,81],gl:[76,91],ka:[60,79],hc:[60,79],or:[55,74],sx:[50,72],dt:[60,79],st:[60,76],bf:[60,76],rc:[72,86],xy:[72,91],hm:[72,88],up:[57,79],
  cv:[55,76],sl:[62,81],ps:[72,86],kk:[60,76],sitar:[55,79],cowbell:[72,84],screech:[62,79],bell:[72,86],techstab:[50,67],reso:[52,67],acidl:[50,67],hoover:[50,67],clip:[50,69],pwm:[55,72],
  square:[64,81],eurolead:[64,84],brass:[60,79],glide:[62,81],stadium:[62,81],hsaw:[60,79],pluck:[60,79],pluck16:[59,74],arp12:[55,74],euro:[60,79],prog:[55,72],soft:[60,79],horn:[57,72],organ:[55,74],
  /* Prototype 45: the library instruments and our own new patches (SYN adds its synths' ranges after this) */
  gtr:[40,64],didg:[33,45],riffsaw:[45,64],chip:[64,84],cstab:[52,72],hangS:[50,74],hangB:[48,76]};
/* ranges for the library synths' stand-ins, used only when SYN is missing */
const TREGF={anthem:[62,84],eurobrass:[60,81],hardcore:[64,86],sawpluck:[60,79],smooth:[57,76],tb303:[45,64],rhodes:[52,76],fmbell:[67,88],fmbrass:[55,74],fmstab:[52,72],guzheng:[55,84],erhu:[57,81],
  bansuri:[62,86],hang:[50,74],tanpura:[36,55]};
const TFALL={pn:'fmpiano',ep:'fmpiano',up:'fmpiano',hp:'pluck',mb:'bell',vb:'bell',gl:'bell',ka:'bell',xy:'bell',hm:'bell',hc:'pluck',st:'pluck',dt:'pluck',bf:'bell',kk:'bell',cv:'pluck',
  or:'organ',sx:'soft',sl:'soft',rc:'soft',ps:'soft',sitar:'pluck'};
/* what each library synth (SYN) becomes when SYN is not loaded: the nearest embedded patch or recording */
const SYNFB={anthem:'hsaw',eurobrass:'eurolead',hardcore:'hsaw',sawpluck:'pluck',smooth:'soft',tb303:'acidl',rhodes:'ep',fmbell:'bell',fmbrass:'horn',fmstab:'reso',guzheng:'dt',erhu:'soft',
  bansuri:'rc',hang:'ka',tanpura:null,warmpad:null,choirpad:null,sawpad:null};
const TCACHE={brk:{},sit:{},busy:{}};
/* pad presets; syn: a library pad (SYN.chord) when loaded */
const TPD={saw:{voices:3,spread:14,cut:1800,vol:0.03,a:0.35,rel:0.5,rev:0.45},wave:{voices:3,spread:18,cut:1500,vol:0.03,a:0.5,rel:0.8,rev:0.6,vib:{rate:0.7,depth:14}},
  dark:{voices:2,spread:8,cut:700,vol:0.034,a:0.6,rel:0.8,rev:0.55},bright:{voices:5,spread:24,cut:3000,vol:0.022,a:0.3,rel:0.6,rev:0.5},silk:{voices:3,spread:12,cut:1400,vol:0.03,a:0.8,rel:1.2,rev:0.6},
  choir:{voices:2,spread:10,cut:1100,vol:0.03,a:0.6,rel:1,rev:0.6,smp:['x_pd_choir',0]},none:null,
  warm:{voices:3,spread:12,cut:1300,vol:0.03,a:0.7,rel:1.1,rev:0.6,syn:'warmpad'},choirS:{voices:2,spread:10,cut:1100,vol:0.03,a:0.6,rel:1,rev:0.6,syn:'choirpad',smp:['x_pd_choir',0]},
  sawS:{voices:3,spread:16,cut:1900,vol:0.028,a:0.3,rel:0.6,rev:0.5,syn:'sawpad'},
  /* strings: a slow, bowed-sounding saw ensemble with vibrato (RACE 202's orchestral harmonies) */
  str:{voices:4,spread:16,cut:2200,vol:0.026,a:0.45,rel:0.9,rev:0.65,vib:{rate:5.2,depth:9}}};
/* Prototype 46: the pad a breakdown falls back on when the template has none, by family (one dark pad had gone into
   two in five breakdowns) */
const TPDB={phonk:'wave',glitch:'warm',techno:'dark',house:'warm',trance:'saw',euro:'bright',dnb:'silk',jungle:'str',psy:'dark',hardcore:'sawS',metal:'str',world:'warm'};
/* percussion layers: Prototype 45 gave every template one from its family (Eric heard them all as "the shaker");
   Prototype 46 plays a percussion layer only where a template names one (perc), eleven templates in all */
/* Prototype 45: more percussion layers, so the recordings that never played get a part: sci-fi blips (techno, glitch),
   glitches and robots (neurofunk, glitch-hop), hand percussion (tambourine, triangle, guiro, frame drum, cowbell: house,
   liquid, world) and real hand claps (house, funk, hardcore) */
{const P=s=>s.split(' ').map(t=>t==='-'?null:t.split('+').map(h=>{const[k,v]=h.split(':');return[(k.startsWith('i_')?'':'x_')+k,+v]}));
  Object.assign(PERCX,{blips:{n:'electronic blips',p:P('elec_ping:.16 - - elec_plip:.12 - - elec_twip:.14 - elec_beep:.1 - - elec_blip2:.12 - elec_bong:.12 - elec_chime:.1')},
    blips2:{n:'electronic bells',p:P('elec_bell:.12 - - - elec_triangle:.1 - - elec_twang:.12 - - elec_ping:.12 - elec_plip:.1 - - -')},
    robots:{n:'glitches and robots',p:P('- - glitch_perc2:.14 - - tbd_perc_hat:.2 - glitch_perc5:.12 - - glitch_robot1:.1 - tbd_voctone:.1 - - vinyl_backspin:.08')},
    robots2:{n:'robot voices',p:P('glitch_robot2:.1 - - - - - - - - - glitch_perc2:.12 - - tbd_perc_hat:.18 - glitch_perc5:.1')},
    hand:{n:'hand percussion',p:P('tms:.2 - gui:.18 - tri:.14 - tms:.18 frm:.2 - - gui:.16 - tri:.12 drum_cowbell:.1 tms:.18 -')},
    hand2:{n:'tambourine and frame drum',p:P('frm:.24 - tms:.14 - - - tms:.14 - frm:.2 - tms:.14 - - tabla_tas1:.14 tms:.14 -')},
    claps:{n:'hand claps',p:P('- - - - i_cl1:.24 - - - - - i_cl2:.14 - i_cl1:.24 - - i_cl2:.12')}})}
TEXR.shimmer.brk=['x_markd',0.16];TEXR.space={n:'space',pre:['x_woosh',0.32],drop:['x_cine',0.36],brk:['x_ambi_lunar_land',0.22],pad:[['x_tbd_pad_1',7],['x_tbd_pad_3',2]]};
/* the percussion accent lane (U) per family */
/* textures for templates (Prototype 45, TEXR): one moment at each section change, never on templates that already swell a
   cymbal into the drop; tuned bass hits on the first beat of a drop, by family */
const TTEX={dnb:['cinema','dust'],jungle:['dust','cinema'],psy:['tribal','shimmer'],world:['tribal'],techno:['iron','cinema'],dub:['epic','space'],phonk:['dust','space'],glitch:['dust','space'],metal:['iron'],hardcore:['epic']};
const TBH={dnb:['x_bass_dnb_f',5],jungle:['x_bass_woodsy_c',0],dub:['x_bass_hard_c',0],trance:['x_bass_trance_c',0],techno:['x_bass_hit_c',0],phonk:['x_bass_voxy_hit_c',0],glitch:['x_bass_voxy_c',0],
  metal:['x_bass_thick_c',0],hardcore:['x_bass_hard_c',0],euro:['x_bass_trance_c',0],house:['x_bass_thick_c',0],psy:['x_bass_hit_c',0],world:['x_bass_woodsy_c',0]};
const TUAC={techno:'x_anv1',phonk:'x_cw2',glitch:'x_clv1',house:'x_cow',metal:'x_brk1',world:'x_clv2',psy:'x_clv2',dnb:'x_clv1',jungle:'x_clv1',dub:'x_brk2',trance:'x_clv2',euro:'x_cow',hardcore:'x_cw2'};
/* ---- harmony (Prototype 45): chord qualities, diatonic sevenths and ninths, and voicings ----
   Intervals above the root. A progression entry is [root, quality]; with only roots the chords are stacked in thirds
   from the template's mode (cq 3 = triads as before, 7 = sevenths, 9 = ninths). Pads, stabs and keys voice the
   upper tones (rootless for ninths and elevenths: the bass has the root) between their own low and high notes, each
   chord as close as it can get to the one before, and never below D3 so the sub stays alone and mono. */
const CQ={'':[0,4,7],m:[0,3,7],'5':[0,7,12],sus2:[0,2,7],sus4:[0,5,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],'6':[0,4,7,9],m6:[0,3,7,9],add9:[0,4,7,14],madd9:[0,3,7,14],
  '9':[0,4,7,10,14],m9:[0,3,7,10,14],maj9:[0,4,7,11,14],m11:[0,3,7,10,14,17],'11':[0,7,10,14,17],'maj7#11':[0,4,7,11,18],'7b9':[0,4,7,10,13],'7#9#5':[0,4,8,10,15],
  m7b5:[0,3,6,10],dim:[0,3,6],'7sus4':[0,5,7,10],'13':[0,4,10,14,21],'m(maj7)':[0,3,7,11]};
function tDia(deg,sc,n){const pc=((deg%12)+12)%12,i0=sc.indexOf(pc),L=sc.length;if(i0<0||L!==7)return null;const o=[];
  for(let k=0;k<n;k++){const j=i0+2*k,v=sc[j%L]+12*Math.floor(j/L)-pc;o.push(v)}return o}
function tVoiceLead(root,ivs,key,lo,hi,prev,rootless){const pcs=[];const add=x=>{const p=((key+root+x)%12+12)%12;if(!pcs.includes(p))pcs.push(p)};
  const dropR=rootless&&ivs.length>=5,drop5=ivs.length>=6;ivs.forEach((x,i)=>{if(i===0&&dropR)return;if(drop5&&x===7)return;add(x)});
  if(pcs.length<3)add(0);const n=pcs.length,cands=[];
  for(let r=0;r<n;r++){const ord=[];for(let k=0;k<n;k++)ord.push(pcs[(r+k)%n]);for(let base=lo-12;base<=hi;base+=12){let v=[],last=-99;for(const p of ord){let m=base+p;while(m<=last)m+=12;v.push(m);last=m}
      if(v[0]>=lo&&v[v.length-1]<=hi)cands.push(v);if(n>=4){const w=v.slice();w[n-2]-=12;w.sort((a,b)=>a-b);if(w[0]>=lo&&w[n-1]<=hi)cands.push(w)}}}
  if(!cands.length){const v=pcs.map(p=>{let m=lo+((p-lo)%12+12)%12;return m}).sort((a,b)=>a-b);return v}
  const mid=(lo+hi)/2,score=v=>{let s=0;if(prev&&prev.length){for(const m of v){let b=99;for(const q of prev)b=Math.min(b,Math.abs(m-q));s+=b}}else s=Math.abs((v[0]+v[v.length-1])/2-mid)*2;
    if(v[0]<55&&v.length>1&&v[1]-v[0]<5)s+=6;return s};
  let best=cands[0],bs=1e9;for(const v of cands){const x=score(v);if(x<bs){bs=x;best=v}}return best}
/* ---- the generators: rhythms, contours, hooks, riffs and solos, all from the tune's seed ---- */
const euclid=(k,n,rot=0)=>{const a=[];for(let i=0;i<n;i++)a.push(Math.floor((i+rot)*k/n)!==Math.floor((i+rot-1)*k/n)?1:0);if(rot===0)a[0]=1;return a};
/* one bar (or two) of onsets with lengths: dense from 2 to 9 notes, legato or detached */
function tRhy(r,k,n,leg){const pick=a=>a[Math.floor(r()*a.length)],rot=r()<0.5?0:pick([0,1,2,3,5]);let on=euclid(k,n,rot);if(!on.some(x=>x))on[0]=1;
  const ix=[];on.forEach((x,i)=>{if(x)ix.push(i)});return ix.map((s,j)=>{const nx=j+1<ix.length?ix[j+1]:n,g=nx-s;return[s,leg?g:Math.max(1,Math.min(g,r()<0.5?g:Math.ceil(g/2)))]})}
/* scale-degree contours: arch, fall, rise, zigzag, pedal (a repeated note with neighbours), leap, wave */
function tCont(r,n,shape){const d=[];let x=0;const st=()=>r()<0.75?1:2;
  for(let i=0;i<n;i++){const f=i/Math.max(1,n-1);
    if(shape==='arch')x=Math.round(Math.sin(f*Math.PI)*(3+Math.floor(r()*3)));
    else if(shape==='fall')x=i?x-(r()<0.8?1:2):4+Math.floor(r()*3);
    else if(shape==='rise')x=i?x+(r()<0.8?1:2):0;
    else if(shape==='zig')x=i?x+(i%2?st():-st()+1):0;
    else if(shape==='pedal')x=i%3===2?(r()<0.5?2:-1):0;
    else if(shape==='leap')x=i%2?7:(i%4===2?2:0);
    else x=Math.round(Math.sin(f*Math.PI*2+0.5)*3);
    d.push(x)}return d}
const degP=(sc,d)=>{const n=sc.length,o=Math.floor(d/n);return sc[((d%n)+n)%n]+12*o};
/* the chord tones nearest p (in semitones above the tonic) */
const tNear=(p,tones)=>{let q=p,bd=99;for(const t of tones)for(const o of[-24,-12,0,12,24]){const x=t+o;if(Math.abs(x-p)<bd||(Math.abs(x-p)===bd&&x<q)){bd=Math.abs(x-p);q=x}}return q};
const tTones=(deg,hs)=>chordOf(deg,hs).map(x=>((x%12)+12)%12);
/* A hook in one of several forms. AABA, ABAC, AAAB, AB (a two-bar phrase and its answer), long (one held line over the
   phrase), even (Prototype 45: the line in plain quarter and half notes, a statement and its answer, the way a pianist
   would play it). With a line (from the documents) its pitches are kept in order and only the rhythm and the fit to
   the chords are new. tn(bar) gives the chord tones of a bar. Returns sixteenth events over 4 or 8 bars. */
function tHookGen(r,o){const{sc,hs,roots,form,line,dens}=o,tn=o.tn||(b=>tTones(roots[b%roots.length],hs)),pick=a=>a[Math.floor(r()*a.length)],bars=form==='long'?8:4,ev=[];
  const shapes=['arch','fall','rise','zig','pedal','wave','leap'];
  const motif=(k,len,leg)=>{const rh=tRhy(r,k,len,leg),c=tCont(r,rh.length,pick(shapes)),base=pick([0,2,4]);return rh.map(([s,d],i)=>({s,d,g:base+c[i]}))};
  const put=(m,bar,shift,end)=>{m.forEach((e,i)=>{let p=degP(sc,e.g+shift);ev.push({s:bar*16+e.s,d:e.d,p,b:bar})});if(end&&ev.length){const L=ev[ev.length-1];L.p=tNear(L.p,[0,7]);L.d=Math.max(L.d,Math.min(8,bar*16+16-L.s))}};
  if(form==='even'&&line&&line.length){/* a plain statement over two bars and its answer, coming home */
    const n=line.length,RH={8:[[4,4,4,4,4,4,4,4],[6,2,4,4,6,2,4,4],[4,4,4,4,6,2,4,4]],7:[[4,4,4,4,4,4,8],[6,2,4,4,4,4,8]],6:[[4,4,8,4,4,8],[4,4,4,4,8,8]],5:[[4,4,8,8,8],[8,4,4,8,8]]},
      R=pick(RH[Math.min(8,Math.max(5,n))]||RH[8]),L=line.slice(0,R.length);while(L.length<R.length)L.push(line[L.length%n]);
    /* the line keeps its own notes; only a bar's first note moves, and only when it clashes with the chord (a semitone off) */
    const clash=(p,T)=>{const pc=((p%12)+12)%12;return!T.includes(pc)&&T.some(x=>{const dd=((x-pc)%12+12)%12;return dd===1||dd===11})};
    for(let k=0;k<2;k++){let s=k*32;R.forEach((d,i)=>{let p=L[i];const b=Math.floor(s/16)%4;if(s%16===0&&clash(p,tn(b)))p=tNear(p,tn(b));if(k===1&&i===R.length-1)p=tNear(p,[0]);ev.push({s,d:Math.max(2,d-(d>=4?1:0)),p,b});s+=d})}}
  else if(line&&line.length){/* the documented line: its own pitches, a new rhythm each tune */
    const n=line.length,span=n>8?32:pick([16,32]),rh=n>8?tRhy(r,n,32,true):span===16?tRhy(r,Math.min(n,8),16,r()<0.5):tRhy(r,n,32,r()<0.6);
    const L=rh.map(([s,d],i)=>({s,d,p:line[i%n]}));const rep=span===16?4:2;
    for(let k=0;k<rep;k++)for(const e of L){let p=e.p;const s=k*span+e.s;if(k&&s%8===0&&e.d>=2){const b=Math.floor(s/16)%4;p=tNear(p,tn(b))}ev.push({s,d:e.d,p,b:Math.floor(s/16)})}
    const Z=ev[ev.length-1];if(Z){Z.p=tNear(Z.p,[0]);Z.d=Math.max(Z.d,bars*16-Z.s>12?4:bars*16-Z.s)}}
  else if(form==='long'){const rh=tRhy(r,pick([3,4,5]),32,true),c=tCont(r,rh.length*4,pick(['wave','arch','fall']));let i=0;for(let k=0;k<4;k++)for(const[s,d]of rh){const s0=k*32+s,b=Math.floor(s0/16),p=degP(sc,c[i++]+2);ev.push({s:s0,d,p:s%16===0?tNear(p,tn(b%4)):p,b})}}
  else{const k1=dens||pick([3,4,5,5,6,7]),A=motif(k1,16,r()<0.5),B=motif(Math.max(2,k1+pick([-2,-1,1,2])),16,r()<0.5),C=motif(pick([2,3,4]),16,true);
    const F={AABA:[[A,0],[A,pick([1,2,-1])],[B,0],[A,0]],ABAC:[[A,0],[B,0],[A,0],[C,0]],AAAB:[[A,0],[A,0],[A,pick([2,-2])],[B,0]],AB:[[A,0],[B,0],[A,0],[C,0]]}[form]||[[A,0],[B,0],[A,0],[C,0]];
    F.forEach(([m,sh],bar)=>put(m,bar,sh,bar===3))}
  /* strong beats lean onto the chord of their bar */
  if(form!=='even')for(const e of ev){if(e.s%16===0&&!(line&&e.s<32)){const b=Math.floor(e.s/16)%4;e.p=tNear(e.p,tn(b))}}
  return ev.sort((a,b)=>a.s-b.s)}
/* a one- or two-bar ostinato: from the line's first notes when there is one, otherwise root-heavy degrees */
function tRiffGen(r,o){const{sc,line,len}=o,pick=a=>a[Math.floor(r()*a.length)],n=len||16;
  const k=line&&line.length?Math.min(line.length,pick([3,4,5,6])):pick([3,4,5,6,7]),rh=tRhy(r,k,n,false);
  const pool=line&&line.length?line.slice(0,k):[0,0,0,12,7,degP(sc,2),10,0].map(x=>x===10?degP(sc,6):x);
  const A=rh.map(([s,d],i)=>({s,d:Math.min(d,2),p:line&&line.length?pool[i%pool.length]:i===0?0:pick(pool)}));
  const B=A.map((e,i)=>i===A.length-1?{...e,p:e.p===0?pick([7,12,degP(sc,2)]):0}:e);return{A,B,n}}
/* An improvised solo over the progression: two-bar phrases that grow from held notes (with slides) through licks to
   fast runs, each landing on a chord tone. p is absolute (MIDI); sl = slide up from that many semitones below. */
function tSoloGen(r,o){const{sc,hs,roots,key,bars,lo,hi,slide,calm}=o,tn=o.tn||(b=>tTones(roots[b%roots.length],hs)),pick=a=>a[Math.floor(r()*a.length)],ev=[],n=Math.max(1,Math.floor(bars/2));
  const mid=Math.round((lo+hi)/2),toM=d=>{let p=key+degP(sc,d)+48;while(p<lo)p+=12;while(p>hi)p-=12;return p};let cur=pick([0,2,4]);
  const land=(s)=>tn(Math.floor(s/16)%4);
  for(let j=0;j<n;j++){const x=calm?Math.min(0.5,j/Math.max(1,n-1)):j/Math.max(1,n-1),s0=j*32,ty=x<0.25?pick(['long','call']):x<0.7?pick(['lick','rep','call','lick']):pick(['run','lick','run']);
    cur+=pick([-2,-1,0,1,2])+(x>0.6?1:0);cur=Math.max(-3,Math.min(10,cur));
    if(ty==='long'){const k=pick([2,3]);let s=s0+pick([0,2]);for(let i=0;i<k&&s<s0+28;i++){const d=pick([6,8,10]);ev.push({s,d:Math.min(d,s0+30-s),p:toM(cur),sl:slide&&r()<0.5?pick([-2,-1]):0,v:0.85});cur+=pick([-1,1,2,-2]);s+=d}}
    else if(ty==='call'){let s=s0;const k=pick([3,4]);for(let i=0;i<k;i++){const d=pick([2,2,3,4]);ev.push({s,d,p:toM(cur),sl:slide&&i===0&&r()<0.4?-1:0,v:0.8});cur+=pick([1,-1,2]);s+=d}
      ev.push({s:s0+16+pick([0,2,4]),d:6,p:toM(cur),sl:slide?-1:0,v:0.75})}
    else if(ty==='lick'){let s=s0;const k=pick([6,7,8,9]);for(let i=0;i<k&&s<s0+26;i++){const d=pick([1,2,2,2,3]);ev.push({s,d,p:toM(cur),sl:0,v:0.72+0.2*r()});cur+=pick([1,-1,1,-1,2,-2,3]);s+=d}
      ev.push({s:Math.min(s,s0+26),d:4,p:toM(cur),sl:slide?-1:0,v:0.85})}
    else if(ty==='rep'){const p=toM(cur);for(let s=s0;s<s0+24;s+=pick([1,2])){ev.push({s,d:1,p:r()<0.25?toM(cur+1):p,sl:0,v:0.6+0.25*r()})}ev.push({s:s0+24,d:6,p,sl:0,v:0.85})}
    else{const up=r()<0.6,k=pick([7,8,10]);for(let i=0;i<k;i++)ev.push({s:s0+i,d:1,p:toM(cur+(up?i:-i)),sl:0,v:0.65+0.02*i});cur+=up?k:-k;ev.push({s:s0+k,d:pick([6,8]),p:toM(cur),sl:slide?-1:0,v:0.9})}}
  /* phrase ends land on a chord tone */
  for(let i=0;i<ev.length;i++){const e=ev[i],nx=ev[i+1];if(!nx||nx.s-e.s-e.d>=2||e.d>=6){const t=land(e.s),q=e.p-key-48,pc=((q%12)+12)%12;if(!t.includes(pc)){const z=tNear(pc,t);e.p+=z-pc}}}
  return ev.filter(e=>e.s<bars*16).sort((a,b)=>a.s-b.s)}
/* acid line: one bar, root-heavy, with accents and slides */
function tAcidGen(r,sc){const pick=a=>a[Math.floor(r()*a.length)],A=[];const pool=[0,0,0,12,0,7,degP(sc,2),degP(sc,6)-12,degP(sc,3),12];
  for(let s=0;s<16;s++){if(s===0||r()<0.68)A.push({s,d:1,p:s===0?0:pick(pool),ac:r()<0.28?1:0,sl:r()<0.2?1:0})}
  const B=A.map(e=>r()<0.25?{...e,p:pick(pool)}:e);return{A,B}}
/* metal riffs (Prototype 45): palm-muted chugs on the root in sixteenths and eighths, with power-chord stabs on the
   accents; [step, length, semitones above the root, 1 = open power chord] */
function tChugGen(r,sc){const pick=a=>a[Math.floor(r()*a.length)],R=[[0,1,0],[1,1,0],[2,1,0],[3,1,0]],A=[];const acc=pick([[0,3,6,10,12],[0,6,8,12,14],[0,3,8,11,14],[0,4,7,10,14]]);
  for(let s=0;s<16;s++){const a=acc.includes(s);if(a)A.push([s,s===0?2:pick([1,2]),s===0?0:pick([0,0,degP(sc,1),degP(sc,4)-12,degP(sc,5)-12]),1]);else if(r()<0.62)A.push([s,1,0,0])}
  const B=A.map(e=>e[3]&&e[0]>8&&r()<0.5?[e[0],e[1],pick([1,6,degP(sc,6)-12]),1]:e);return{A,B,R}}
/* ---- melodies with intent (Prototype 46) ----
   Eric: "notes at random" (sitar, sax, bansuri, erhu, xylophone, some piano and pluck lines), and of Chrome Choir: the
   piano "feels a bit random but then it starts to feel cohesive" once it repeats. So a line is a motif repeated: one
   rhythm (a bar, kept in the second bar, which lands on a long note), chord tones on the strong beats (1 and 3), steps
   between them, at most one leap of a third and a step back after it. The phrase states it and answers it: A A' over
   four bars (A' is A moved onto the next chords, ending on the tonic), A A' A A'' over eight. */
const TMR={sparse:[[0,6,8],[0,4,8,12],[0,3,8,12],[0,6,8,12],[0,8,12]],med:[[0,3,6,8,12],[0,2,4,8,12],[0,4,6,8,12],[0,3,6,10,12],[0,2,6,8,12],[0,4,8,10,12]],
  busy:[[0,2,4,6,8,10,12],[0,3,6,8,10,12,14],[0,2,4,8,10,12,14],[0,3,6,8,11,12,14]]};
/* the scale degree (octaves counted) nearest to p semitones above the tonic */
const toDeg=(sc,p)=>{const n=sc.length;let best=0,bd=99;for(let d=-3*n;d<=4*n;d++){const x=Math.abs(degP(sc,d)-p);if(x<bd){bd=x;best=d}}return best};
/* the tone of T (pitch classes) nearest to p; a tie goes the way the line is moving */
const tNearD=(p,T,dir)=>{let q=p,bd=99;for(const t of T)for(const o of[-24,-12,0,12,24]){const x=t+o,d=Math.abs(x-p)+(dir&&x!==p&&Math.sign(x-p)!==dir?0.25:0);if(d<bd){bd=d;q=x}}return q};
function tMotifHook(r,o){const{sc,tn,bars}=o,pick=a=>a[Math.floor(r()*a.length)],ev=[];
  const cell=pick(TMR[o.dens||pick(['sparse','med','med','busy'])]),lastAt=r()<0.6?8:12,cell2=cell.filter(x=>x<lastAt).concat([lastAt]);
  /* the motif over the first two chords: [bar, step, pitch] */
  const M=[];let dir=r()<0.5?1:-1,cur=tNearD(degP(sc,pick([2,4])),tn(0,0),0),leap=0,used=false;const c0=cur;
  [cell,cell2].forEach((C,bar)=>{if(bar===1)dir=-dir;C.forEach((st,i)=>{let p=cur;
      if(bar||i){if(st%8===0)p=tNearD(cur+dir,tn(bar,st),dir);
        else{let d=toDeg(sc,cur);if(leap){d-=Math.sign(leap);leap=0}else if(!used&&r()<0.18){d+=2*dir;leap=2*dir;used=true}else d+=r()<0.82?dir:0;p=degP(sc,d)}}
      if(p>c0+9){p=degP(sc,toDeg(sc,p)-2);dir=-1}if(p<c0-8){p=degP(sc,toDeg(sc,p)+2);dir=1}
      if(bar===1&&i===C.length-1)p=tNearD(p,tn(1,st),0);M.push([bar,st,p]);cur=p})});
  /* a statement moved onto other chords: shifted along the scale so its first note is the nearest chord tone, its strong
     beats fitted again; the end lands on the tonic (home) or on a tone of the last chord (a question) */
  const put=(b0,home)=>{const d0=toDeg(sc,M[0][2]),k=toDeg(sc,tNearD(M[0][2],tn(b0,0),0))-d0;
    M.forEach(([bar,st,p],i)=>{let q=b0===0?p:degP(sc,toDeg(sc,p)+k);const b=b0+bar;if(b0&&st%8===0)q=tNearD(q,tn(b,st),0);
      const last=i===M.length-1;if(last&&home!=null)q=tNearD(q,home?[0]:tn(b,st).filter(x=>x!==0).length?tn(b,st).filter(x=>x!==0):tn(b,st),0);
      const nx=i+1<M.length?(M[i+1][0]*16+M[i+1][1]):32,d=last?Math.max(4,16-st):Math.max(1,nx-(bar*16+st));ev.push({s:b*16+st,d:Math.min(d,last?8:d),p:q,b})})};
  if(bars>=8){put(0,null);put(2,false);put(4,null);put(6,true)}else{put(0,null);put(2,true)}
  return ev.sort((a,b)=>a.s-b.s)}
/* a one-bar riff (and its answer bar, B): one rhythm, a shape over the scale from the chord's root (the player moves it
   with the chords), chord tones on 1 and 3, short notes. Shapes: a pedal on the root with neighbours (Eric's first sung
   example: one note pulsed, moving with the chords), a climb to the fifth and back, a broken chord (his second), a call */
function tMotifRiff(r,o){const{sc}=o,pick=a=>a[Math.floor(r()*a.length)],L=sc.length,ct=L===7?[0,2,4,7]:[0,1,3,5];
  const RR=[[0,3,6,8,11,14],[0,2,3,6,8,10,11,14],[0,3,4,7,8,11,12,14],[0,2,4,6,8,10,12,14],[0,3,6,9,12,14],[0,4,6,8,12,14],[0,3,6,8,10,12]];
  const S7={pedal:[0,0,1,0,0,-1,0,1],climb:[0,1,2,4,2,1,0,1],arp:[0,2,4,7,4,2,0,2],call:[0,0,2,0,4,2,1,0]},S5={pedal:[0,0,1,0,0,-1,0,1],climb:[0,1,2,3,2,1,0,1],arp:[0,1,3,5,3,1,0,1],call:[0,0,1,0,3,1,0,0]};
  const S=L===7?S7:S5,shp=S[o.shape||pick(Object.keys(S))],cell=pick(RR);
  const A=cell.map((s,i)=>{let d=shp[i%shp.length];if(s%8===0)d=ct.reduce((a,x)=>Math.abs(x-d)<Math.abs(a-d)?x:a,0);const nx=i+1<cell.length?cell[i+1]:16;return{s,d:Math.max(1,Math.min(nx-s,2)),p:degP(sc,d),dg:d}});
  const B=A.map((e,i)=>{if(i===A.length-1){const dg=pick([ct[2],ct[3]]);return{...e,p:degP(sc,dg),dg}}if(i===A.length-2&&A.length>3){const dg=pick([ct[1],ct[2]-1]);return{...e,p:degP(sc,dg),dg}}return e});
  /* dg: the scale degree above the chord's root; the player moves the riff along the scale with the chords (fol), so a
     chord's triad stays a triad (moving it by semitones and snapping turned thirds into suspensions) */
  return{A,B,n:16,dg:true}}
/* the break: four bars rendered once per tempo from the kit's own hits (round robins where there are several), with a
   little room and grit */
SL.brkRender=async(kit,id,bpm)=>{const P=TBRK[id];if(!P||!kit)return null;const sr=44100,sd=60/bpm/4,len=Math.ceil(sr*(64*sd+0.6)),oc=new OfflineAudioContext(1,len,sr),r=rng(id.length*977+Math.round(bpm));
  const bus=oc.createGain(),ws=oc.createWaveShaper(),hp=oc.createBiquadFilter(),lp=oc.createBiquadFilter();ws.curve=SL.curve(1.3);hp.type='highpass';hp.frequency.value=35;lp.type='lowpass';lp.frequency.value=9000;
  bus.connect(ws);ws.connect(hp);hp.connect(lp);lp.connect(oc.destination);const cv=oc.createConvolver();cv.buffer=SL.ir(oc,0.45,0.55,true);const cg=oc.createGain();cg.gain.value=0.16;bus.connect(cv);cv.connect(cg);cg.connect(lp);
  const L=x=>Array.isArray(x)?x.filter(Boolean):x?[x]:[],RR={};const pickB=(k,a)=>{const l=L(a);if(!l.length)return null;let i=Math.floor(r()*l.length);if(l.length>1&&i===RR[k])i=(i+1)%l.length;RR[k]=i;return l[i]};
  const pv=c=>c==='.'?0:c==='X'?1:(+c)/10,hit=(b,t,v,rt)=>{if(!b)return;const s=oc.createBufferSource(),g=oc.createGain();s.buffer=b;s.playbackRate.value=rt||1+(r()-0.5)*0.02;g.gain.value=v*(0.92+0.16*r());s.connect(g);g.connect(bus);s.start(Math.max(0,t+(r()-0.5)*0.005))};
  for(let bar=0;bar<4;bar++)for(let i=0;i<16;i++){const t=(bar*16+i)*sd+(i%2?sd*0.04:0);
    const k=pv(P.K[bar][i]),s=pv(P.S[bar][i]),h=pv(P.H[bar][i]),o=pv(P.O[bar][i]);
    if(k)hit(pickB('k',kit.kd),t,0.9*k);if(s)hit(s<0.75?pickB('g',kit.s2||kit.s1):pickB('s',kit.s1),t,s<0.75?0.75*s:0.95*s);if(h)hit(pickB('h',i%4===0?kit.h1:kit.h2),t,0.55*h);if(o)hit(pickB('o',kit.ho),t,0.5*o)}
  const b=await oc.startRendering(),x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));const g=0.9/(pk||1);for(let i=0;i<x.length;i++)x[i]*=g;
  const rb=new AudioBuffer({length:b.length,sampleRate:sr,numberOfChannels:1}),y=rb.getChannelData(0),N=Math.round(64*sd*sr);for(let i=0;i<N;i++)y[i]=x[N-1-i];return{b,rb,sd}};
/* recordings that were too sharp or too bright, tamed once when they decode (for every tune, old codes too): the hat
   that hissed through the trance templates, the electro and tape kits' high end, the club and gas kits' brightest
   hats, the concert crash and the splash, the glass and bowed-vibraphone pads; [low-pass Hz, length s] */
const TAME={x_hat_raw:[8500],x_hat_yosh:[8500],x_hat_gem:[7000],x_hat_snap:[7500],x_hat_sci:[6500],x_hat_zap:[6500],x_hat_psych:[6500,0.15],x_elec_filt_snare:[6000],
  x_cc_cr:[5200],x_ride_via:[6000],x_ps_72:[3200],x_ps_84:[3200],s_sp:[4500],x_drum_splash_soft:[5000],x_ambi_glass_rub:[2400],x_pd_wg1:[2200],x_pd_bv4:[2400],x_pd_bv3:[2400],x_elec_cymbal:[6000]};
SL.tame=(k,v)=>{const T=TAME[k],b=v&&v[k];if(!T||!b||b.tamed)return;try{const sr=b.sampleRate,x=b.getChannelData(0).slice(),n=T[1]?Math.min(x.length,Math.round(sr*T[1])):x.length;
  SL.biq(x,sr,'lp',T[0],0.7);SL.biq(x,sr,'lp',T[0]*1.3,0.6);const fo=Math.min(n,Math.round(sr*0.04));for(let i=0;i<fo;i++)x[n-1-i]*=i/fo;
  const nb=new AudioBuffer({length:n,sampleRate:sr,numberOfChannels:1});nb.getChannelData(0).set(x.subarray(0,n));nb.tamed=1;v[k]=nb}catch(e){}};
/* ---- likes (Prototype 45): Like (and Keep) raise similar templates, a skip in the first 20 s counts a little against;
   kept per template in this browser, the newest 64 events */
const MLIKE={get(){try{const a=JSON.parse(store.get('hoverline.mlike')||'[]');return Array.isArray(a)?a.filter(x=>Array.isArray(x)&&x.length>=2):[]}catch(e){return[]}},
  now(){return Math.floor(Date.now()/1000)},
  add(tp,w,why){if(!tp)return;const a=this.get();a.unshift([tp,w,this.now()]);store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(why||(w<0?'skip':'keep'),tp)},
  liked(tp){return this.get().some(([t,w])=>t===tp&&w>=3)},
  toggle(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w>=3);if(on)a=a.filter(([t,w])=>!(t===tp&&w>=3));else a.unshift([tp,3,this.now()]);store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(on?'unlike':'like',tp);return!on},
  on(){return store.get('hoverline.mlikeon')!=='0'},
  /* what was liked, unliked, kept, skipped or removed from the library, and when: for the log export */
  hist(){try{const a=JSON.parse(store.get('hoverline.mlikelog')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}},
  note(what,tp,x){try{const a=this.hist();a.unshift(x?[this.now(),what,tp,x]:[this.now(),what,tp]);store.set('hoverline.mlikelog',JSON.stringify(a.slice(0,200)))}catch(e){}},
  aff(T,A){let s=0;for(const[tp,w]of A){const L=TPL[tp-1];if(!L)continue;let m=tp===T.id?1:0;if(L.f===T.f)m+=0.45;if(L.d===T.d)m+=0.25;if((L.gn||[]).some(g=>(T.gn||[]).includes(g)))m+=0.2;if(L.l===T.l)m+=0.1;s+=w*Math.min(1.2,m)}return s}};
/* ---- what Eric's Prototype 44 race logs said (keeps and skips), as a gentle starting lean for the radio and the race
   tunes on your own: kept +1.5, skipped in the first 20 s -1, skipped later -0.5. They spread to similar templates
   (family, drums, genres) like likes do; nothing is banned. In a room nothing leans. ---- */
const MPRIOR=[[105,1.5],[63,1.5],[103,1.5],[96,1.5],[75,1.5],[73,1.5],[97,1.5],[89,1.5],[24,1.5],[86,1.5],[40,1.5],
  [77,-1],[47,-1],[39,-1],[12,-1],[18,-1],[25,-1],[101,-1],[21,-1],[50,-1],[37,-0.5],[55,-0.5],[90,-0.5],[104,-0.5],[69,-0.5]];
/* ---- how often each track was raced on your own (Prototype 45), so a track raced again moves on to another tune:
   [track, races started, the template its last race opened with, the code of its first race's tune], the 120 most
   recent tracks ---- */
const MTRK={get(){try{const a=JSON.parse(store.get('hoverline.mtrk')||'[]');return Array.isArray(a)?a.filter(x=>Array.isArray(x)&&x.length>=2):[]}catch(e){return[]}},
  k(seed){return(seed>>>0).toString(36)},
  e(seed){const k=this.k(seed);return this.get().find(x=>x[0]===k)||null},
  n(seed){const e=this.e(seed);return e?e[1]|0:0},
  bump(seed,tp,code){const k=this.k(seed),a=this.get(),i=a.findIndex(x=>x[0]===k),n=i>=0?(a[i][1]|0)+1:1,first=i>=0&&a[i][3]||code||'';if(i>=0)a.splice(i,1);a.unshift([k,n,tp|0,first]);try{store.set('hoverline.mtrk',JSON.stringify(a.slice(0,120)))}catch(e){}return n}};
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
/* ---- the library (Prototype 45): SMP (sampled kits and instruments) and SYN (synths), both optional; everything
   falls back to the embedded kits and patches while they are missing or loading ---- */
const MX={smp(){try{return typeof SMP!=='undefined'&&SMP?SMP:null}catch(e){return null}},syn(){try{return typeof SYN!=='undefined'&&SYN?SYN:null}catch(e){return null}},
  /* a library synth by name (SYN), if there is one */
  hasSyn(n){const S=this.syn();try{return!!(S&&n&&S.P&&S.P[n])}catch(e){return false}},
  /* offline renders (Pregen): the library synths' worklet voices read their notes before the render runs on */
  sync(eng){const S=this.syn();try{return S&&S.sync?Promise.resolve(S.sync(eng)).catch(()=>{}):Promise.resolve()}catch(e){return Promise.resolve()}},
  /* the library kit a template asks for: the first of its preferences that the manifest has */
  kitOf(prefs){const S=this.smp();if(!S||S.fallback||!S.manifest)return null;for(const k of prefs||[])if(S.kit(k))return k;return null},
  /* a library instrument by our name: the first name the manifest has */
  INST:{hangS:['hang','hang_drum'],hangB:['hang','hang_drum'],didg:['didgeridoo'],gtr:['gtr_power','guitar_power'],gtrm:['gtr_mute','gtr_chug','guitar_mute'],gtrl:['gtr_dist','gtr_power'],ebass:['bass_finger','bass_pick'],slap:['bass_slap']},
  instOf(n){const S=this.smp();if(!S||S.fallback||!S.manifest)return null;for(const k of this.INST[n]||[n])if(S.inst(k))return k;return null}};
