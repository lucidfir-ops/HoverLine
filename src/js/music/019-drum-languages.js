//# music/019-drum-languages.js: drum languages per genre: patterns, ghost notes, micro-timing
/* ---- drum languages (Prototype 45) ----
   One bar of sixteenths per lane ('.' rest, 1-9 tenths of full velocity, X full). K kick, S snare, C clap, G ghost
   snare, H closed hat, O open hat (gated short: never a constant), R ride, P rim, N crushed noise, T toms, Z shaker,
   U percussion accent (the template's: cowbell, claves, anvil...), Y crash. B plays the template's break through the
   slice sequencer (1 light edits, 2 heavier, 3 breakcore). Sections: main (drops and builds), b, a (and solo), sw
   (switch-up), drum (drums only); V lists bar-by-bar variations (bar 1, 2, 3, 4 of each four) merged over the
   section. mt: lanes pushed late (+) or early (-) by a fraction of a sixteenth (neurofunk and breakcore snares sit a
   little behind the grid, their ghosts a little ahead); hum: velocity spread and timing jitter (ms). The open hat
   that hissed on every offbeat of the trance, psytrance and eurobeat languages (Sonic Pi's hat_gump, deleted in Prototype 46, in the tight and
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
/* Prototype 45: more percussion layers, so the recordings that never played get a part: hand percussion (tambourine, triangle,
   guiro, frame drum, cowbell: house, liquid, world) and real hand claps (house, funk, hardcore). Prototype 62 took out the sci-fi blips,
   bells, glitches and robots (blips, blips2, robots, robots2) with their recordings: no template or older code ever named them */
{const P=s=>s.split(' ').map(t=>t==='-'?null:t.split('+').map(h=>{const[k,v]=h.split(':');return[(k.startsWith('i_')?'':'x_')+k,+v]}));
  Object.assign(PERCX,{hand:{n:'hand percussion',p:P('tms:.2 - gui:.18 - tri:.14 - tms:.18 frm:.2 - - gui:.16 - tri:.12 drum_cowbell:.1 tms:.18 -')},
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
