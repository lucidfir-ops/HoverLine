//# music/012-blueprints.js: legacy: synth blueprints (old T codes)
/* ---------- blueprints from the synth reference guide ----------
   Ten genre lines with their tempo, role and sound recipe. A tune can be built around one: a lead line becomes the
   hook (still in call and response), a bass line replaces the bass pattern (following the chords), an arpeggio replaces
   the arp, and the dream piano adds a keys part. Lines are moved into the tune's key; p = semitones from the tonic
   (from the chord root for bass and arp lines), r = length of each note in 16ths. */
/* Bass recipes from the library, as options for the mono voice (dest: which drive stage the live fallback uses). */
const BASSP={
 reese:b=>({voices:3,spread:24,cut:500,env:900,envT:0.3,res:2,vol:0.075,sub:0.12,cal:0.71,dest:'dB'}),
 sub808:b=>({type:'sine',voices:1,cut:5000,pe:12,peT:0.05,vol:0.13,cal:0.6,dest:'dB'}),
 laser:b=>({voices:1,cut:2400,env:2000,envT:0.05,pe:24,peT:0.03,vol:0.07,cal:1.2,dest:'dB',len:0.7}),
 square:b=>({type:'square',voices:1,cut:900,env:1200,envT:0.1,res:2.2,vol:0.07,sub:0.1,cal:0.7,dest:'dB'}),
 fm:b=>({type:'fm',fm:4,fr:1,voices:1,cut:2600,env:1500,envT:0.12,vol:0.08,cal:0.84,dest:'dB'}),
 fold:b=>({type:'sine',fold:3,voices:1,cut:3000,vol:0.08,cal:0.74,dest:'dN'}),
 crush:b=>({voices:2,spread:15,crush:6,cut:2500,vol:0.06,cal:1.1,dest:'dN'}),
 ring:b=>({type:'square',ring:1.5,voices:1,cut:2000,env:2500,envT:0.06,vol:0.07,cal:1.12,dest:'dB',len:0.7}),
 shift:b=>({type:'fm',fm:4,fr:1,voices:1,cut:2600,env:1500,envT:0.12,vol:0.08,cal:0.84,dest:'dB',len:0.7}),
 comb:b=>({voices:3,spread:10,cut:260,env:600,envT:0.3,res:4,vol:0.08,cal:1.2,dest:'dB'}),
 talk:b=>({voices:2,spread:10,cut:300,env:2600,envT:0.12,k:3.3,vol:0.07,cal:1.3,dest:'dB'}),
 wobble:b=>({voices:3,spread:20,cut:350,wob:{rate:b/60*2,depth:900},res:2.5,vol:0.075,cal:1.35,dest:'dB'}),
 techstep:b=>({voices:1,cut:1800,env:1500,envT:0.1,sub:0.1,vol:0.06,cal:0.6,dest:'dN'}),
 hoover:b=>({voices:3,spread:45,cut:2000,env:800,envT:0.2,vib:{rate:7,depth:40},vol:0.06,cal:1.2,dest:'dB'})};
const BLUEPRINTS=[
 {n:'Aggressive lead riff',role:'lead',mode:'minor',bpm:174,patch:'clip',p:[0,3,0,5,0,3,2,-2,0],r:[2,1,1,2,2,2,2,2,2]},
 {n:'Euphoric dancefloor lead',role:'lead',mode:'minor',bpm:174,patch:'hsaw',p:[0,2,3,7,5,3,2,0],r:[4,2,2,6,2,4,4,8]},
 {n:'Neurofunk reese line',role:'bass',mode:'minor',bpm:172,patch:'neuro',p:[0,0,3,2,0,6,5],r:[3,1,4,2,2,2,2]},
 {n:'Liquid pluck melody',role:'lead',mode:'major',bpm:175,patch:'epiano',p:[0,4,7,9,7,4,0,2],r:[3,3,2,4,2,2,4,12]},
 {n:'Jump-up bass hook',role:'bass',mode:'minor',bpm:174,patch:'jump',p:[0,0,12,10,8,7,0],r:[2,1,3,2,2,2,4]},
 {n:'Driving 16th pluck sequence',role:'arp',mode:'minor',bpm:136,patch:'pluck16',p:[0,0,0,0,0,3,0,0,0,0,0,5,0,0,3,null],r:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
 {n:'Dream piano and pad hook',role:'keys',mode:'minor',bpm:134,patch:'dream',p:[0,-5,-4,-7,-5,-9,-7,-12],r:[4,4,4,4,4,4,4,4]},
 {n:'Stadium anthem theme',role:'lead',mode:'minor',bpm:140,patch:'stadium',p:[0,2,3,5,7,3,5,2],r:[6,2,4,4,6,2,4,4]},
 {n:'Euro-trance pluck',role:'lead',mode:'minor',bpm:137,patch:'euro',p:[3,2,-2,0,-5,-2,3,2],r:[2,2,2,2,2,2,2,2]},
 {n:'Fast arpeggiated theme',role:'arp',mode:'minor',bpm:138,patch:'arp12',p:[0,3,7,12,10,7,3,2,0,3,7,5],r:[1,1,1,1,1,1,1,1,1,1,1,1],cycle:true}];
