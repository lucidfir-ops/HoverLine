/* ---------- song templates (Prototype 43) ----------
   Every new tune is built from one of the templates in TPL: a blueprint taken from an entry in Eric's documents (the
   agnostic racing guide's RACE 001-200, the classic blueprints' DnB and TR entries, the MIDI guide's tracks 01-10) or
   from his voice note. A template pins the sub-genre and tempo, the drum language, the bassline family, the key, mode
   and progression, what the melody is allowed to be (no hook at all, a riff, a hook on a given instrument, a solo, an
   arpeggio, vocal chops, chord stabs), the instruments, the structure and which effects may play; anything it does not
   list does not play, so the ride, the splash, the mark tree and the brush kit only appear where a style asks for them.
   The notes are still written live from the tune's seed, inside those rules. Codes are S + the template (two hex
   digits) + eight hex digits (seed, key offset, variant), so a log shows which template played. */
const SCX={minor:[0,2,3,5,7,8,10],harm:[0,2,3,5,7,8,11],dorian:[0,2,3,5,7,9,10],phryg:[0,1,3,5,7,8,10],phrdom:[0,1,4,5,7,8,10],major:[0,2,4,5,7,9,11],mixo:[0,2,4,5,7,9,10]};
const SCXH={minor:'harm',harm:'harm',dorian:'dorian',phryg:'phryg',phrdom:'phrdom',major:'major',mixo:'mixo'};
const TPL_FAM={phonk:'wave / drift phonk',glitch:'glitch-hop / neuro-funk',techno:'industrial techno',house:'bass house / tech house',dub:'dubstep / tearout',euro:'eurobeat / high-speed trance',dnb:'drum & bass',jungle:'jungle / breakcore',trance:'trance'};
/* structures: the sections a tune moves through (the first drop lands on GO); about 90 seconds of it is heard before
   the next tune takes over */
const TSTRUCT={std:[['drop',16],['b',16],['brk',8],['rise',8],['drop',16],['sw',8],['a',8],['brk',8],['rise',8]],
  solo:[['drop',16],['b',8],['solo',16],['rise',4],['drop',16],['a',8],['brk',8],['rise',8]],
  drum:[['drop',16],['drum',8],['b',16],['brk',8],['rise',4],['drop',16],['drum',8],['sw',8],['brk',8],['rise',4]],
  long:[['drop',16],['b',16],['brk',16],['rise',8],['drop',16],['a',8],['brk',8],['rise',8]],
  techno:[['drop',16],['b',16],['a',16],['brk',8],['rise',4],['drop',16],['sw',16],['brk',8],['rise',4]]};
/* drum languages: one bar of sixteenths per voice ('.' rest, 1-9 tenths, X full). K kick, S snare, C clap, G ghost
   snare, H closed hat, O open hat, R ride (only where the template allows it), P rim, N crushed noise hit, T toms.
   B plays the template's break through the slice sequencer (1 light edits, 2 heavier, 3 breakcore). */
const TDR=(()=>{const D={
 four:{kick:'k9',fill:'clap',main:{K:'X...X...X...X...',C:'....8.......8...',O:'..6...6...6...6.',H:'.3.3.3.3.3.3.3.3'},b:{K:'X...X...X...X...',C:'....8.......8...',O:'..6...6...6...6.',H:'3333333333333333',P:'......4.......4.'},
   a:{K:'X...X...X...X...',O:'..5...5...5...5.',H:'.3.3.3.3.3.3.3.3'},sw:{K:'X..X..X...X..X..',C:'....8.......8...',H:'.3.3.3.3.3.3.3.3',P:'..4..4..........'},drum:{K:'X...X...X...X...',C:'....8.......8...',O:'..6...6...6...6.',H:'3333333333333333',T:'..........5.4.3.'}},
 indus:{kick:'ki',fill:'snare',main:{K:'X...X...X...X..6',C:'....9.......9...',H:'3.3.3.3.3.3.3.3.',N:'......5.......5.'},b:{K:'X...X..5X...X...',C:'....9.......9...',N:'..5...5...5...5.',H:'.3.3.3.3.3.3.3.3'},
   a:{K:'X...X...X...X...',H:'3.3.3.3.3.3.3.3.',N:'..............6.'},sw:{K:'X.....X...X.....',S:'........X.......',N:'...5.......5....',H:'3.3.3.3.3.3.3.3.'},drum:{K:'X...X..6X...X.6.',C:'....9.......9...',N:'..5...5...5...5.'}},
 house:{kick:'kh',fill:'clap',main:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3.4.3.4.3.4.3.4.'},b:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3434343434343434',P:'...5......5.....'},
   a:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'3.4.3.4.3.4.3.4.'},sw:{C:'....X.......X...',O:'..6...6...6...6.',H:'3434343434343434',P:'...5..5...5..5..'},drum:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3434343434343434'}},
 bhouse:{kick:'kh',fill:'snare',main:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',O:'..7...7...7...7.',H:'.3.3.3.3.3.3.3.3'},b:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6..5',O:'..7...7...7...7.',H:'3333333333333333'},
   a:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'.3.3.3.3.3.3.3.3'},sw:{K:'X.....X...X.....',S:'....X.......X...',H:'.3.3.3.3.3.3.3.3'},drum:{K:'X...X...X...X...',S:'....X.......X...',O:'..7...7...7...7.',H:'3333333333333333'}},
 trance:{kick:'kt',fill:'snare',main:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'2323232323232323'},b:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3333333333333333'},
   a:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'.2.2.2.2.2.2.2.2'},sw:{K:'X...X...X...X...',C:'............X...',O:'..6...6...6...6.'},drum:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3333333333333333'}},
 psy:{kick:'kp',fill:'snare',main:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'3232323232323232',C:'............7...'},b:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'3333333333333333',C:'....6.......7...'},
   a:{K:'X...X...X...X...',O:'..5...5...5...5.'},sw:{K:'X...X...X...X...',H:'3232323232323232'},drum:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'3333333333333333'}},
 euro:{kick:'kt',fill:'snare',main:{K:'X...X...X...X...',S:'....X.......X...',O:'..7...7...7...7.',H:'3.3.3.3.3.3.3.3.'},b:{K:'X...X...X...X...',S:'....X.......X...',C:'....7.......7...',O:'..7...7...7...7.',H:'3333333333333333'},
   a:{K:'X...X...X...X...',O:'..6...6...6...6.',H:'3.3.3.3.3.3.3.3.'},sw:{K:'X.......X.......',S:'....X.......X...',O:'..7...7...7...7.'},drum:{K:'X...X...X...X...',S:'....X.......X.6.',O:'..7...7...7...7.',H:'3333333333333333'}},
 dphonk:{kick:'k8',fill:'hats',main:{K:'X...X...X...X...',C:'....X.......X...',H:'4.4.4.4.4.4.4.4.',O:'..5...5...5...5.'},b:{K:'X...X...X...X.6.',C:'....X.......X...',H:'4444444444444444'},
   a:{K:'X.......X.......',C:'....X.......X...',H:'4.4.4.4.4.4.4.4.'},sw:{K:'X......6..X.....',C:'........X.......',H:'4.4.4.4.4.4.4444'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'4444444444444444'}},
 phonk:{kick:'k8',fill:'hats',main:{K:'X......6..X.....',C:'........X.......',H:'4.4.4.4.4.4.4444'},b:{K:'X..6......X..6..',C:'........X.......',H:'4.4.4.4.44444.4.',O:'..............5.'},
   a:{K:'X.........X.....',C:'........X.......',H:'4...4...4...4...'},sw:{K:'X...X...X...X...',C:'....X.......X...',H:'4.4.4.4.4.4.4.4.'},drum:{K:'X..6..6...X..6..',C:'........X.......',H:'4444444444444444'}},
 glitch:{kick:'kd',fill:'stutter',main:{K:'X......6..X.....',S:'....X.......X...',G:'.......3.......3',H:'4.3.4.3.4.3.4.3.'},b:{K:'X..6...6..X.....',S:'....X.......X..5',G:'......3.........',H:'4343434343434343'},
   a:{K:'X.......X.......',S:'....X.......X...',H:'4.3.4.3.4.3.4.3.'},sw:{K:'X...............',S:'........X.......',H:'4.4.4.4.4.4.4.4.'},drum:{K:'X..6...6..X..6..',S:'....X.......X..5',G:'.3.....3.3....3.',H:'4343434343434343'}},
 twostep:{kick:'kd',fill:'snare',main:{K:'X.........X.....',S:'....X.......X...',G:'.......3.3....3.',H:'5.3.5.3.5.3.5.3.'},b:{K:'X.....X...X.....',S:'....X.......X...',G:'...3.....3.3...3',H:'5.3.5.3.5.3.5.3.',O:'..............5.'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'5...5...5...5...'},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{K:'X.........XX....',S:'....X..3.3..X..3',G:'.3....3......3..',H:'5353535353535353'}},
 roller:{kick:'kd',fill:'snare',main:{K:'X.........XX....',S:'....X.......X...',G:'......3........3',H:'4242424242424242'},b:{K:'X.....X...X.....',S:'....X.......X...',G:'...3......3....3',H:'4242424242424242'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'4.2.4.2.4.2.4.2.'},sw:{K:'X.........X.....',S:'........X.......',H:'4242424242424242'},drum:{K:'X.........XX....',S:'....X..3.3..X..3',H:'4242424242424242'}},
 liquid:{kick:'kd',fill:'snare',main:{K:'X.........X.....',S:'....X.......X...',G:'.......2.......2',H:'4.24.24.24.24.2.'},b:{K:'X.....X...X.....',S:'....X.......X...',H:'4.24.24.24.24.2.',R:'4...3...4...3...'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'4...4...4...4...'},sw:{K:'X.........X.....',S:'........X.......',H:'4.24.24.24.24.2.'},drum:{K:'X.........X.....',S:'....X.......X...',H:'4.24.24.24.24.2.'}},
 half:{kick:'kd',fill:'snare',main:{K:'X.........X.....',S:'........X.......',H:'4.4.4.4.4.4.4.4.',O:'..............5.'},b:{K:'X..5......X.....',S:'........X.....3.',H:'4.4.4.4.444.4.44'},
   a:{K:'X...............',S:'........X.......',H:'4...4...4...4...'},sw:{K:'X.........X.....',S:'....X.......X...',H:'5.3.5.3.5.3.5.3.'},drum:{K:'X..5......X..5..',S:'........X.....3.',H:'4444444444444444'}},
 prog:{kick:'kt',fill:'clap',main:{K:'X...X...X...X...',O:'..5...5...5...5.',H:'3.2.3.2.3.2.3.2.',P:'.......4.......4',C:'............6...'},b:{K:'X...X...X...X...',C:'....6.......6...',O:'..5...5...5...5.',H:'3232323232323232',P:'.......4.......4'},
   a:{K:'X...X...X...X...',O:'..4...4...4...4.',H:'3.2.3.2.3.2.3.2.'},sw:{K:'X.......X.......',P:'...4..4...4..4..',H:'3.2.3.2.3.2.3.2.'},drum:{K:'X...X...X...X...',C:'....7.......7...',O:'..5...5...5...5.',H:'3232323232323232'}},
 hard:{kick:'ki',fill:'clap',main:{K:'X...X...X...X..7',C:'....X.......X...',H:'.4.4.4.4.4.4.4.4',O:'..7...7...7...7.',N:'.......5.......5'},b:{K:'X...X...X..7X...',C:'....X.......X...',H:'4343434343434343',N:'..5...5...5...5.'},
   a:{K:'X...X...X...X...',H:'.4.4.4.4.4.4.4.4'},sw:{K:'X...X...X...X...',S:'....X.......X...',H:'.3.3.3.3.3.3.3.3'},drum:{K:'X...X...X..7X...',C:'....X.......X...',H:'4343434343434343',N:'..5...5...5...5.'}},
 minimal:{kick:'kh',fill:'clap',main:{K:'X...X...X...X...',P:'...5..5....5..5.',H:'.2.2.2.2.2.2.2.2',O:'..4.......4.....'},b:{K:'X...X...X...X...',C:'....6.......6...',P:'...5..5....5..5.',H:'2323232323232323'},
   a:{K:'X...X...X...X...',H:'.2.2.2.2.2.2.2.2'},sw:{P:'...5..5....5..5.',H:'2323232323232323'},drum:{K:'X...X...X...X...',C:'....6.......6...',P:'...5..5....5..5.',H:'2323232323232323'}},
 uplift:{kick:'kt',fill:'snare',main:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'2222222222222222'},b:{K:'X...X...X...X...',C:'....X.......X...',S:'..............6X',O:'..7...7...7...7.',H:'3232323232323232'},
   a:{K:'X...X...X...X...',O:'..6...6...6...6.'},sw:{K:'X...X...X...X...',C:'............X...',O:'..6...6...6...6.'},drum:{K:'X...X...X...X...',C:'....X.......X...',O:'..7...7...7...7.',H:'3232323232323232',T:'............5.4.'}},
 ebm:{kick:'ki',fill:'snare',main:{K:'X...X...X...X...',S:'....X.......X...',H:'..3...3...3...3.',N:'..........4.....'},b:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',H:'.3.3.3.3.3.3.3.3'},
   a:{K:'X...X...X...X...',S:'....X.......X...'},sw:{K:'X.......X.......',S:'....X.......X...'},drum:{K:'X...X...X...X...',S:'....X.......X...',C:'....6.......6...',H:'.3.3.3.3.3.3.3.3'}},
 boombap:{kick:'kd',fill:'stutter',main:{K:'X......6..X.....',S:'....X.......X...',G:'...........3....',H:'4.3.4.3.4.3.4.3.'},b:{K:'X..6...6..X..6..',S:'....X.......X...',G:'...........3...3',H:'4343434343434343'},
   a:{K:'X.........X.....',S:'....X.......X...',H:'4...4...4...4...'},sw:{K:'X...............',S:'........X.......',H:'4.3.4.3.4.3.4.3.'},drum:{K:'X..6...6..X..6..',S:'....X.......X..5',G:'.3.....3.3....3.',H:'4343434343434343'}},
 euro2:{kick:'kt',fill:'snare',main:{K:'X...X...X...X...',C:'....X.......X...',H:'3434343434343434',O:'..6...6...6...6.'},b:{K:'X...X...X...X...',C:'....X.......X...',S:'....8.......8...',H:'3434343434343434',O:'..6...6...6...6.'},
   a:{K:'X...X...X...X...',H:'3.3.3.3.3.3.3.3.'},sw:{K:'X.......X.......',C:'....X.......X...'},drum:{K:'X...X...X...X...',C:'....X.......X...',H:'3434343434343434',T:'............5.4.'}},
 glitchb:{kick:'kd',brk:'arov',fill:'stutter',main:{B:1,K:'X......6..X.....',S:'....X.......X...'},b:{B:2,K:'X..6...6..X.....',S:'....X.......X..5'},a:{B:1,lo:1},sw:{K:'X...............',S:'........X.......',H:'4.4.4.4.4.4.4.4.'},drum:{B:3}},
 amen:{kick:'kd',brk:'amen',fill:'brk',main:{B:1,K:'X.........X.....'},b:{B:1},a:{B:1,lo:1},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{B:2}},
 think:{kick:'kd',brk:'think',fill:'brk',main:{B:1,K:'X.........X.....'},b:{B:1},a:{B:1,lo:1},sw:{K:'X.........X.....',S:'........X.......',H:'5.3.5.3.5.3.5.3.'},drum:{B:2}},
 brkcore:{kick:'kd',brk:'amen',fill:'brk',main:{B:2,K:'X.........X.....'},b:{B:2},a:{B:1},sw:{K:'X.X.X.X.X.X.X.X.',S:'....X.......X...'},drum:{B:3}}};
  const pv=c=>c==='.'?0:c==='X'?1:(+c)/10;for(const L of Object.values(D))for(const k of['main','b','a','sw','drum']){const P=L[k];if(!P)continue;for(const v of'KSCGHORPNT')if(typeof P[v]==='string')P[v]=[...P[v]].map(pv)}return D})();
/* recreated breaks (4 bars of sixteenths; K kick, S snare, H closed hat, O open hat): re-played from the CC0 kit hits,
   never sampled from the records. amen: the Winstons' pattern as it is usually transcribed; think: a funk break in
   the manner of Lyn Collins' "Think (About It)" (read as the "Reason" break of Eric's voice note) */
const TBRK={amen:{K:['X.X.......XX....','X.X.......XX....','X.X.......X.....','..X9......X.....'],S:['....X..7.6..X..7','....X..7.6..X..7','....X..7.6....X.','.7..X..7.6....X.'],
    H:['6.5.6.5.6.5.6.5.','6.5.6.5.6.5.6.5.','6.5.6.5.6.5.6.5.','6.5.6.5.6.....5.'],O:['................','................','................','..........7.....']},
  think:{K:['X.....X.X.......','X.....X...X..X..','X.....X.X.......','X.....X...X.....'],S:['....X..4.4..X...','....X..4.4..X..6','....X..4.4..X...','....X..4.4.4X.66'],
    H:['5353535353535353','5353535353535353','5353535353535353','53535353535353..'],O:['..............6.','................','..............6.','................']}};
/* bassline families: [pattern, patch] */
const TBF={octave:['oct','gallop'],rumble:['kbbb','rumb'],offbeat:['off','offb'],sub:['sub','sub'],rolling:['roll','reese0'],gallop:['gal','gallop'],reese:['roll','reese'],sub808:['s808','b808'],growl:['growl','growl'],doctalk:['line','talk'],
  slap:['slap','slap'],docsquare:['line','square'],pluck:['house','pluck'],kbbb:['kbbb','psy'],crush808:['s808','crush'],docreese:['line','reese'],slide808:['slide','b808'],acid:['acid','acid'],
  rolling4:['r4','dark'],square:['sq16','square'],docpluck:['line','pluck'],docgrowl:['line','growl'],doc808:['line','b808'],subhit:['hit','sub'],rollprog:['prog','offb'],docslap:['line','slap'],
  doccrush:['line','crush'],talk:['house','talk'],docdark:['line','dark'],docfold:['line','fold'],docfm:['line','fm'],docring:['line','ring'],organ:['organ','organ'],riddim:['riddim','riddim'],
  docstab:['line','stab'],wobble:['wob','wob'],docneuro:['line','neuro'],docjump:['line','jump'],doctech:['line','tech'],docwob:['line','wob'],doclaser:['line','laser']};
/* bass patches for the mono voice; d: which drive stage (dB a little growl, dN heavy, '' clean); o: octave above C2 */
const TBP={offb:b=>({voices:2,spread:8,cut:700,env:1600,envT:0.08,res:1.5,vol:0.085,cal:1.1,len:0.85,o:12,d:''}),
  sub:b=>({type:'sine',voices:1,cut:3000,vol:0.12,cal:0.62,len:0.95,o:0,d:''}),
  rumb:b=>({voices:2,spread:6,cut:260,env:160,envT:0.05,res:1.2,vol:0.09,cal:0.75,len:0.9,o:0,d:'dB'}),
  reese0:b=>({voices:3,spread:22,cut:440,env:900,envT:0.3,res:2.5,sub:0.16,vol:0.075,cal:0.71,len:0.95,o:0,d:'dB'}),
  reese:b=>({voices:3,spread:24,cut:500,env:900,envT:0.3,res:2,vol:0.075,sub:0.12,cal:0.71,wob:{rate:0.3,depth:160},len:0.95,o:0,d:'dB'}),
  gallop:b=>({voices:2,spread:10,cut:900,env:2200,envT:0.06,res:1.8,vol:0.08,cal:1.0,len:0.7,o:0,d:'dB'}),
  b808:b=>({type:'sine',voices:1,cut:5000,pe:7,peT:0.06,vol:0.13,cal:0.62,len:0.95,o:0,d:''}),
  crush:b=>({voices:2,spread:15,crush:6,cut:2500,vol:0.06,cal:1.0,len:0.8,o:0,d:'dN'}),
  growl:b=>({voices:3,spread:14,cut:420,env:1800,envT:0.1,res:2.6,vol:0.075,cal:1.15,wob:{rate:b/60*2,depth:1100},len:0.95,o:0,d:'dN'}),
  slap:b=>({type:'triangle',voices:2,spread:6,cut:350,env:3000,envT:0.07,k:2.4,vol:0.085,cal:1.0,len:0.6,o:12,d:'dB'}),
  square:b=>({type:'square',voices:1,cut:1200,env:1800,envT:0.06,res:1.8,vol:0.07,sub:0.08,cal:0.75,len:0.45,o:0,d:'dN'}),
  pluck:b=>({type:'fm',fm:3,fr:1,voices:1,cut:2200,env:2000,envT:0.08,vol:0.08,cal:0.9,pe:2,peT:0.03,len:0.5,o:0,d:'dB'}),
  psy:b=>({voices:1,cut:420,env:1700,envT:0.05,q:2.6,vol:0.34,cal:0.8,len:0.62,o:0,d:''}),
  acid:b=>({voices:1,cut:300,env:2600,envT:0.12,k:3.2,vol:0.09,cal:0.62,len:0.8,o:12,d:'dB',glide:0.06}),
  dark:b=>({voices:2,spread:12,cut:400,env:300,envT:0.2,res:1.5,vol:0.08,cal:0.8,len:0.9,o:0,d:'dB'}),
  talk:b=>({voices:2,spread:10,cut:300,env:2600,envT:0.12,k:3.3,vol:0.07,cal:1.3,len:0.85,o:0,d:'dB'}),
  fm:b=>({type:'fm',fm:4,fr:1,voices:1,cut:2600,env:1500,envT:0.12,vol:0.08,cal:0.84,len:0.85,o:0,d:'dB'}),
  fold:b=>({type:'sine',fold:3,voices:1,cut:3000,vol:0.08,cal:0.74,len:0.9,o:0,d:'dN'}),
  ring:b=>({type:'square',ring:1.5,voices:1,cut:2000,env:2500,envT:0.06,vol:0.07,cal:1.12,len:0.7,o:0,d:'dB'}),
  stab:b=>({voices:2,spread:12,cut:800,env:2400,envT:0.06,pe:5,peT:0.04,vol:0.08,cal:1.0,len:0.6,o:0,d:'dB'}),
  neuro:b=>({voices:3,spread:30,cut:420,wob:{rate:b/60*2,depth:650},res:2.5,vol:0.075,cal:0.95,len:0.95,o:0,d:'dN'}),
  jump:b=>({voices:1,cut:700,env:1500,envT:0.07,res:1.6,glide:0.04,vol:0.1,cal:0.5,len:0.8,o:0,d:'dB'}),
  tech:b=>({voices:1,cut:1800,env:1500,envT:0.1,sub:0.1,vol:0.06,cal:0.6,len:0.9,o:0,d:'dN'}),
  wob:b=>({voices:3,spread:20,cut:350,wob:{rate:b/60*2,depth:900},res:2.5,vol:0.075,cal:1.3,len:0.95,o:0,d:'dB'}),
  laser:b=>({voices:1,cut:2400,env:2000,envT:0.05,pe:24,peT:0.03,vol:0.07,cal:1.2,len:0.7,o:0,d:'dB'}),
  organ:b=>({type:'square',voices:2,spread:5,cut:1800,env:600,envT:0.1,vol:0.06,cal:0.8,len:0.8,o:12,d:''}),
  riddim:b=>({type:'square',voices:2,spread:8,cut:600,env:2000,envT:0.05,res:2.8,wob:{rate:b/60*4,depth:500},vol:0.075,cal:1.1,len:0.5,o:0,d:'dN'})};
/* sampled instruments for template parts: key prefix, the notes recorded, a level, a reverb send; ranges for each
   melodic instrument (synths included); what plays when the recordings are not loaded (Lite) */
const TSMP={pn:['i_pn_',[36,42,48,54,60,66,72],0.4,0.3],ep:['i_ep_',[48,60,72],0.46,0.25],hp:['i_hp_',[48,69],0.36,0.4],mb:['x_mb_',[48,65,79],0.4,0.25],vb:['x_vb_',[60,74,88],0.38,0.3],
  gl:['x_gl_',[79,91],0.3,0.3],ka:['x_ka_',[55,67],0.4,0.25],hc:['x_hc_',[61,73,84],0.34,0.25],or:['x_or_',[60,72],0.32,0.2],sx:['x_sx_',[60,72],0.4,0.2],dt:['x_dt_',[62,73],0.4,0.25],
  st:['x_st_',[64,76],0.42,0.25],bf:['x_bf_',[61,72],0.4,0.25],rc:['x_rc_',[72,84],0.34,0.25],xy:['x_xy_',[72,79,84,96],0.34,0.25],hm:['x_hm_',[72,84,96],0.3,0.3],up:['x_up_',[48,60,72,84],0.42,0.3],
  cv:['x_cv_',[48,60,72,84],0.4,0.2],sl:['x_sl_',[62,74,82],0.4,0.2],ps:['x_ps_',[72,84],0.32,0.3],mz:['x_mz_',[60,72],0.42,0.25],kk:['x_kk_',[61,73],0.42,0.25]};
const TREG={pn:[60,79],ep:[57,76],hp:[55,79],mb:[57,79],vb:[60,81],gl:[76,91],ka:[60,79],hc:[60,79],or:[55,74],sx:[50,72],dt:[60,79],st:[60,76],bf:[60,76],rc:[72,86],xy:[72,91],hm:[72,88],up:[57,79],
  cv:[55,76],sl:[62,81],ps:[72,86],mz:[60,76],kk:[60,76],sitar:[55,79],cowbell:[72,84],screech:[62,79],bell:[72,86],techstab:[50,67],reso:[52,67],acidl:[50,67],hoover:[50,67],clip:[50,69],pwm:[55,72],
  square:[64,81],eurolead:[64,84],brass:[60,79],glide:[62,81],stadium:[62,81],hsaw:[60,79],pluck:[60,79],pluck16:[59,74],arp12:[55,74],euro:[60,79],prog:[55,72],soft:[60,79],horn:[57,72],organ:[55,74]};
const TFALL={pn:'fmpiano',ep:'fmpiano',up:'fmpiano',hp:'pluck',mb:'bell',vb:'bell',gl:'bell',ka:'bell',xy:'bell',hm:'bell',hc:'pluck',st:'pluck',dt:'pluck',bf:'bell',mz:'bell',kk:'bell',cv:'pluck',
  or:'organ',sx:'soft',sl:'soft',rc:'soft',ps:'soft',sitar:'pluck'};
const TCACHE={brk:{},sit:{},busy:{}};
/* pad presets */
const TPD={saw:{voices:3,spread:14,cut:1800,vol:0.03,a:0.35,rel:0.5,rev:0.45},wave:{voices:3,spread:18,cut:1500,vol:0.03,a:0.5,rel:0.8,rev:0.6,vib:{rate:0.7,depth:14}},
  dark:{voices:2,spread:8,cut:700,vol:0.034,a:0.6,rel:0.8,rev:0.55},bright:{voices:5,spread:24,cut:3000,vol:0.022,a:0.3,rel:0.6,rev:0.5},silk:{voices:3,spread:12,cut:1400,vol:0.03,a:0.8,rel:1.2,rev:0.6},
  choir:{voices:2,spread:10,cut:1100,vol:0.03,a:0.6,rel:1,rev:0.6,smp:['x_pd_choir',0]},none:null};
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
   phrase); notes per bar, rhythm and contour all vary. With a line (from the documents) its pitches are kept in order
   and only the rhythm and the fit to the chords are new. Returns sixteenth events over 4 or 8 bars. */
function tHookGen(r,o){const{sc,hs,roots,form,line,dens}=o,pick=a=>a[Math.floor(r()*a.length)],bars=form==='long'?8:4,ev=[];
  const shapes=['arch','fall','rise','zig','pedal','wave','leap'];
  const motif=(k,len,leg)=>{const rh=tRhy(r,k,len,leg),c=tCont(r,rh.length,pick(shapes)),base=pick([0,2,4]);return rh.map(([s,d],i)=>({s,d,g:base+c[i]}))};
  const put=(m,bar,shift,end)=>{m.forEach((e,i)=>{let p=degP(sc,e.g+shift);ev.push({s:bar*16+e.s,d:e.d,p,b:bar})});if(end&&ev.length){const L=ev[ev.length-1];L.p=tNear(L.p,[0,7]);L.d=Math.max(L.d,Math.min(8,bar*16+16-L.s))}};
  if(line&&line.length){/* the documented line: its own pitches, a new rhythm each tune */
    const n=line.length,span=n>8?32:pick([16,32]),rh=n>8?tRhy(r,n,32,true):span===16?tRhy(r,Math.min(n,8),16,r()<0.5):tRhy(r,n,32,r()<0.6);
    const L=rh.map(([s,d],i)=>({s,d,p:line[i%n]}));const rep=span===16?4:2;
    for(let k=0;k<rep;k++)for(const e of L){let p=e.p;const s=k*span+e.s;if(k&&s%8===0&&e.d>=2){const b=Math.floor(s/16)%4;p=tNear(p,tTones(roots[b],hs))}ev.push({s,d:e.d,p,b:Math.floor(s/16)})}
    const Z=ev[ev.length-1];if(Z){Z.p=tNear(Z.p,[0]);Z.d=Math.max(Z.d,bars*16-Z.s>12?4:bars*16-Z.s)}}
  else if(form==='long'){const rh=tRhy(r,pick([3,4,5]),32,true),c=tCont(r,rh.length*4,pick(['wave','arch','fall']));let i=0;for(let k=0;k<4;k++)for(const[s,d]of rh){const s0=k*32+s,b=Math.floor(s0/16),p=degP(sc,c[i++]+2);ev.push({s:s0,d,p:s%16===0?tNear(p,tTones(roots[b%4],hs)):p,b})}}
  else{const k1=dens||pick([3,4,5,5,6,7]),A=motif(k1,16,r()<0.5),B=motif(Math.max(2,k1+pick([-2,-1,1,2])),16,r()<0.5),C=motif(pick([2,3,4]),16,true);
    const F={AABA:[[A,0],[A,pick([1,2,-1])],[B,0],[A,0]],ABAC:[[A,0],[B,0],[A,0],[C,0]],AAAB:[[A,0],[A,0],[A,pick([2,-2])],[B,0]],AB:[[A,0],[B,0],[A,0],[C,0]]}[form]||[[A,0],[B,0],[A,0],[C,0]];
    F.forEach(([m,sh],bar)=>put(m,bar,sh,bar===3))}
  /* strong beats lean onto the chord of their bar */
  for(const e of ev){if(e.s%16===0&&!(line&&e.s<32)){const b=Math.floor(e.s/16)%4;e.p=tNear(e.p,tTones(roots[b],hs))}}
  return ev.sort((a,b)=>a.s-b.s)}
/* a one- or two-bar ostinato: from the line's first notes when there is one, otherwise root-heavy degrees */
function tRiffGen(r,o){const{sc,line,len}=o,pick=a=>a[Math.floor(r()*a.length)],n=len||16;
  const k=line&&line.length?Math.min(line.length,pick([3,4,5,6])):pick([3,4,5,6,7]),rh=tRhy(r,k,n,false);
  const pool=line&&line.length?line.slice(0,k):[0,0,0,12,7,degP(sc,2),10,0].map(x=>x===10?degP(sc,6):x);
  const A=rh.map(([s,d],i)=>({s,d:Math.min(d,2),p:line&&line.length?pool[i%pool.length]:i===0?0:pick(pool)}));
  const B=A.map((e,i)=>i===A.length-1?{...e,p:e.p===0?pick([7,12,degP(sc,2)]):0}:e);return{A,B,n}}
/* An improvised solo over the progression: two-bar phrases that grow from held notes (with slides) through licks to
   fast runs, each landing on a chord tone. p is absolute (MIDI); sl = slide up from that many semitones below. */
function tSoloGen(r,o){const{sc,hs,roots,key,bars,lo,hi,slide,calm}=o,pick=a=>a[Math.floor(r()*a.length)],ev=[],n=Math.max(1,Math.floor(bars/2));
  const mid=Math.round((lo+hi)/2),toM=d=>{let p=key+degP(sc,d)+48;while(p<lo)p+=12;while(p>hi)p-=12;return p};let cur=pick([0,2,4]);
  const land=(s)=>{const b=Math.floor(s/16)%roots.length,t=tTones(roots[b%4],hs);return t};
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
/* the break: four bars rendered once per tempo from the kit's own hits, with a little room and grit */
SL.brkRender=async(kit,id,bpm)=>{const P=TBRK[id];if(!P||!kit)return null;const sr=44100,sd=60/bpm/4,len=Math.ceil(sr*(64*sd+0.6)),oc=new OfflineAudioContext(1,len,sr),r=rng(id.length*977+Math.round(bpm));
  const bus=oc.createGain(),ws=oc.createWaveShaper(),hp=oc.createBiquadFilter(),lp=oc.createBiquadFilter();ws.curve=SL.curve(1.3);hp.type='highpass';hp.frequency.value=35;lp.type='lowpass';lp.frequency.value=9000;
  bus.connect(ws);ws.connect(hp);hp.connect(lp);lp.connect(oc.destination);const cv=oc.createConvolver();cv.buffer=SL.ir(oc,0.45,0.55,true);const cg=oc.createGain();cg.gain.value=0.16;bus.connect(cv);cv.connect(cg);cg.connect(lp);
  const pv=c=>c==='.'?0:c==='X'?1:(+c)/10,hit=(b,t,v)=>{if(!b)return;const s=oc.createBufferSource(),g=oc.createGain();s.buffer=b;g.gain.value=v*(0.92+0.16*r());s.connect(g);g.connect(bus);s.start(Math.max(0,t+(r()-0.5)*0.005))};
  for(let bar=0;bar<4;bar++)for(let i=0;i<16;i++){const t=(bar*16+i)*sd+(i%2?sd*0.04:0);
    const k=pv(P.K[bar][i]),s=pv(P.S[bar][i]),h=pv(P.H[bar][i]),o=pv(P.O[bar][i]);
    if(k)hit(kit.kd,t,0.9*k);if(s)hit(s<0.75?kit.s2||kit.s1:kit.s1,t,s<0.75?0.75*s:0.95*s);if(h)hit(i%4===0?kit.h1:kit.h2,t,0.55*h);if(o)hit(kit.ho,t,0.5*o)}
  const b=await oc.startRendering(),x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));const g=0.9/(pk||1);for(let i=0;i<x.length;i++)x[i]*=g;
  const rb=new AudioBuffer({length:b.length,sampleRate:sr,numberOfChannels:1}),y=rb.getChannelData(0),N=Math.round(64*sd*sr);for(let i=0;i<N;i++)y[i]=x[N-1-i];return{b,rb,sd}};
/* Sitar (no CC0 recording exists, so it is modelled): a plucked string (Karplus-Strong) whose loop folds back on itself
   above a threshold, the buzz of a jawari bridge; four sympathetic strings tuned to Sa, Pa and the octaves of the
   key ring along, fed from the main string. */
SL.sitar=(sr,midi,key)=>{const len=1.5,N=Math.ceil(sr*len),out=new Float32Array(N),r=rng(midi*31+7),f=440*Math.pow(2,(midi-69)/12);
  const mk=(fr,damp,br)=>{const P=sr/fr-0.5,D=Math.floor(P),fc=P-D,C=(1-fc)/(1+fc),L=Math.max(2,D),line=new Float32Array(L);return{line,L,C,damp,br,idx:0,ax:0,ay:0}};
  const S=mk(f,0.9975,0);let lp=0;for(let i=0;i<S.L;i++){lp+=((r()*2-1)-lp)*0.7;S.line[i]=lp*(i<S.L*0.5?1:0.6)}
  const sym=[0,7,12,19].map(iv=>{let m=48+((key%12)+12)%12+iv;while(m<midi-14)m+=12;return mk(440*Math.pow(2,(m-69)/12),0.9992,0)});
  const step=(o,inp)=>{const a=o.line[o.idx],b=o.line[o.idx+1<o.L?o.idx+1:0];let y=o.damp*0.5*(a+b)+inp;const ap=o.C*y+o.ax-o.C*o.ay;o.ax=y;o.ay=ap;o.line[o.idx]=ap;o.idx=o.idx+1<o.L?o.idx+1:0;return a};
  let env=1;const th=0.32;
  for(let n=0;n<N;n++){/* main string with the bridge: a one-sided fold above the threshold keeps adding bright partials */
    const a=S.line[S.idx],b=S.line[S.idx+1<S.L?S.idx+1:0];let y=S.damp*0.5*(a+b);if(y>th)y=th-(y-th)*0.45;const ap=S.C*y+S.ax-S.C*S.ay;S.ax=y;S.ay=ap;S.line[S.idx]=ap;S.idx=S.idx+1<S.L?S.idx+1:0;
    let s=a;for(const o of sym)s+=0.55*step(o,a*0.004);out[n]=s}
  SL.hp1(out,sr,120);SL.biq(out,sr,'peak',2600,1.2,4);SL.biq(out,sr,'lp',7000,0.7);let pk=0;for(let n=0;n<N;n++)pk=Math.max(pk,Math.abs(out[n]));const g=0.9/(pk||1),fo=Math.floor(sr*0.05);
  for(let n=0;n<N;n++)out[n]*=g*(n>N-fo?(N-n)/fo:1);return out};
