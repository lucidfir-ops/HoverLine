//# music/009-themes-grooves-timbres-codes.js: legacy music data (T codes, Prototype 21 to 42): theme phrases, scales, grooves, timbres and the T-code packing; new tunes use the templates (018)
/* ---------- music data: public-domain themes, harmony, grooves, timbres, tune codes ---------- */
const mtof=m=>440*Math.pow(2,(m-69)/12);
const SC={phryg:[0,1,3,5,7,8,10],minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],harm:[0,2,3,5,7,8,11],chrom:[0,1,2,3,4,5,6,7,8,9,10,11]};
const KEYS=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const run=(d,...ps)=>ps.map(p=>[p,d]);
/* Each theme is the opening phrase of a public-domain piece, arranged as 4 bars of [semitones from the tonic, length in 16ths]
   (null = rest). key = the piece's own tonic. scale = what mutations snap to; mode = what the harmony is built from. prog = the
   theme's own chord roots in semitones above the tonic (4 chords = one per bar, 8 chords = one per half bar), aligned to the 4-bar phrase.
   pw = harmonise with power chords (root + fifth), for themes whose chromatic lines clash with full triads. */
const THEMES=[
 {id:'bumblebee',short:'Bumblebee',name:'Flight of the Bumblebee',by:'Rimsky-Korsakov · 1900',key:9,scale:'chrom',mode:'minor',prog:[0,5,0,7],notes:[
   ...run(1,7,6,5,4,5,6,7,6,5,4,3,2,1,2,3,4),...run(1,5,4,3,2,3,4,5,4,3,2,1,0,-1,0,1,2),
   ...run(1,3,2,1,0,1,2,3,2,1,0,-1,-2,-3,-2,-1,0),...run(1,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19)]},
 {id:'mountain',short:'Mountain King',name:'In the Hall of the Mountain King',by:'Grieg · 1875',key:11,scale:'chrom',mode:'minor',prog:[0,0,0,7],pw:true,notes:[
   [0,2],[2,2],[3,2],[5,2],[7,2],[3,2],[7,4],[6,2],[2,2],[6,4],[5,2],[1,2],[5,4],
   [0,2],[2,2],[3,2],[5,2],[7,2],[3,2],[7,4],[12,2],[10,2],[7,2],[3,2],[7,2],[10,6]]},
 {id:'toccata',short:'Toccata',name:'Toccata in D minor',by:'J. S. Bach · c. 1704',key:2,scale:'harm',mode:'minor',prog:[0,0,7,7],notes:[
   [7,1],[5,1],[7,6],[5,1],[3,1],[2,1],[0,1],[-1,1],[0,3],[-5,1],[-7,1],[-5,6],[-7,1],[-9,1],[-10,1],[-12,1],[-13,1],[-12,3],
   ...run(2,20,17,14,11,8,5,2,-1),[-1,4],[2,2],[5,2],[8,2],[11,2],[12,4]]},
 {id:'canon',short:'Canon',name:'Canon in D',by:'Pachelbel · c. 1680',key:2,scale:'major',mode:'major',prog:[0,7,9,4,5,0,5,7],notes:[
   ...run(4,4,2,0,-1),...run(4,-3,-5,-3,-1),...run(4,0,-1,-3,-5),...run(4,-7,-8,-7,-10)]},
 {id:'diesirae',short:'Dies irae',name:'Dies irae',by:'plainchant · 13th c.',key:2,scale:'dorian',mode:'minor',prog:[0,10,0,0],notes:[
   ...run(4,3,2,3,0),...run(4,2,-2,0,0),...run(2,3,3,2,0,-2,0,2,3),...run(4,2,0,-2,0)]},
 {id:'ode',short:'Ode to Joy',name:'Ode to Joy',by:'Beethoven · 1824',key:2,scale:'major',mode:'major',prog:[0,0,7,7,0,0,7,7],notes:[
   ...run(4,4,4,5,7),...run(4,7,5,4,2),...run(4,0,0,2,4),[4,6],[2,2],[2,8]]},
 {id:'habanera',short:'Habanera',name:'Habanera (Carmen)',by:'Bizet · 1875',key:2,scale:'chrom',mode:'minor',prog:[0,0,0,7],pw:true,notes:[
   [0,3],[-1,1],[-2,2],[-3,2],[-4,3],[-5,1],[-5,2],[-5,2],[-5,3],[-7,1],[-9,2],[-10,2],[-12,3],[-10,1],[-9,2],[-7,2],
   [0,3],[-1,1],[-2,2],[-3,2],[-4,3],[-5,1],[-5,2],[-5,2],[-5,3],[-4,1],[-3,2],[-2,2],[-1,3],[0,1],[0,2],[null,2]]},
 {id:'zarathustra',short:'Zarathustra',name:'Also sprach Zarathustra',by:'R. Strauss · 1896',key:0,scale:'major',mode:'major',prog:[0,0,0,0],pw:true,notes:[
   [0,8],[7,8],[12,8],[16,2],[15,2],[null,4],[0,8],[7,8],[12,8],[15,2],[16,2],[null,4]]},
 {id:'elise',short:'Für Elise',name:'Für Elise',by:'Beethoven · 1810',key:9,scale:'harm',mode:'minor',prog:[0,7,0,7],notes:[[7,2],[6,2],[7,2],[6,2],[7,2],[2,2],[5,2],[3,2],[0,4],[-9,2],[-5,2],[0,2],[2,4],[-5,2],[-1,2],[2,2],[3,4]]},
 {id:'nacht',short:'Nachtmusik',name:'Eine kleine Nachtmusik',by:'Mozart · 1787',key:7,scale:'major',mode:'major',prog:[0,0,7,7],notes:[[0,4],[-5,2],[0,4],[-5,2],[0,2],[-5,2],[0,2],[4,2],[7,8],[5,4],[2,2],[5,4],[2,2],[5,2],[2,2],[-1,2],[2,2],[-5,8]]},
 {id:'turca',short:'Alla Turca',name:'Rondo alla Turca',by:'Mozart · 1783',key:9,scale:'harm',mode:'minor',prog:[0,0,7,0],notes:[[2,1],[0,1],[-1,1],[0,1],[3,4],[5,1],[3,1],[2,1],[3,1],[7,4],[8,1],[7,1],[6,1],[7,1],[14,1],[12,1],[11,1],[12,1],[14,1],[12,1],[11,1],[12,1],[15,4]]},
 {id:'sym40',short:'Symphony 40',name:'Symphony No. 40',by:'Mozart · 1788',key:7,scale:'minor',mode:'minor',prog:[0,0,7,7],notes:[[8,1],[7,1],[7,2],[8,1],[7,1],[7,2],[8,1],[7,1],[7,2],[15,6],[15,1],[14,1],[12,2],[12,1],[10,1],[8,2],[8,1],[7,1],[5,2],[5,4]]},
 {id:'fifth',short:'Fifth Symphony',name:'Symphony No. 5',by:'Beethoven · 1808',key:0,scale:'minor',mode:'minor',prog:[0,0,7,7],pw:true,notes:[[7,2],[7,2],[7,2],[3,10],[5,2],[5,2],[5,2],[2,14]]},
 {id:'valk',short:'Valkyries',name:'Ride of the Valkyries',by:'Wagner · 1870',key:11,scale:'minor',mode:'minor',prog:[0,0,3,3],pw:true,notes:[[-5,1],[0,2],[3,1],[0,6],[3,1],[7,2],[3,1],[7,6],[7,1],[10,2],[7,1],[3,6]]},
 {id:'caprice',short:'Caprice 24',name:'Caprice No. 24',by:'Paganini · 1817',key:9,scale:'harm',mode:'minor',prog:[0,7,0,7],notes:[[0,4],[0,1],[3,1],[2,1],[0,1],[7,8],[7,1],[11,1],[9,1],[7,1],[12,8]]},
 {id:'tell',short:'William Tell',name:'William Tell Overture',by:'Rossini · 1829',key:0,scale:'major',mode:'major',prog:[0,0,7,0],notes:[[7,1],[7,1],[7,2],[7,1],[7,1],[7,2],[7,1],[7,1],[12,2],[14,2],[16,2],[7,1],[7,1],[7,2],[7,1],[7,1],[12,2],[16,2],[14,2],[11,2],[7,4]]},
 {id:'korob',short:'Korobeiniki',name:'Korobeiniki',by:'Russian folk song · 1861',key:9,scale:'harm',mode:'minor',prog:[0,7,0,7],notes:[[7,4],[2,2],[3,2],[5,4],[3,2],[2,2],[0,4],[0,2],[3,2],[7,4],[5,2],[3,2],[2,6],[3,2],[5,4],[7,4],[3,4],[0,4],[0,8]]},
 {id:'green',short:'Greensleeves',name:'Greensleeves',by:'English folk · 16th c.',key:9,scale:'dorian',mode:'minor',prog:[0,10,8,7],notes:[[0,2],[3,4],[5,2],[7,3],[8,1],[7,2],[5,4],[2,2],[-2,3],[0,1],[2,2],[3,4],[0,2],[0,3],[-1,1],[0,2],[2,4],[-1,2],[-5,4]]},
 {id:'sailor',short:'Drunken Sailor',name:'Drunken Sailor',by:'sea shanty · 19th c.',key:2,scale:'dorian',mode:'minor',prog:[0,0,10,10],notes:[[7,2],[7,1],[7,1],[7,2],[7,1],[7,1],[7,2],[0,2],[3,2],[7,2],[5,2],[5,1],[5,1],[5,2],[5,1],[5,1],[5,2],[-2,2],[2,2],[5,2]]},
 {id:'entertainer',short:'The Entertainer',name:'The Entertainer',by:'Scott Joplin · 1902',key:0,scale:'major',mode:'major',prog:[0,0,7,0],notes:[[2,1],[3,1],[4,1],[12,2],[4,1],[12,2],[4,1],[12,6],[12,1],[14,1],[15,1],[16,1],[12,1],[14,1],[16,2],[11,1],[14,2],[12,6]]},
 {id:'largo',short:'New World',name:'Symphony From the New World, Largo',by:'Dvořák · 1893',key:1,scale:'major',mode:'major',prog:[0,5,0,7],notes:[[4,3],[7,1],[7,4],[4,3],[2,1],[0,4],[2,2],[4,2],[7,2],[4,2],[2,8]]},
 {id:'swan',short:'Swan Lake',name:'Swan Lake',by:'Tchaikovsky · 1876',key:11,scale:'harm',mode:'minor',prog:[0,8,5,7],notes:[[7,8],[0,2],[2,2],[3,2],[5,2],[7,6],[3,2],[7,6],[3,2],[7,6],[0,2],[3,2],[0,2],[-4,2],[0,2],[-5,8]]},
 {id:'fugue',short:'Little Fugue',name:'Fugue in G minor',by:'J. S. Bach · c. 1707',key:7,scale:'harm',mode:'minor',prog:[0,7,0,7],notes:[[0,4],[7,4],[3,6],[2,2],[0,2],[3,2],[2,2],[0,2],[-1,2],[2,2],[-5,4]]},
 {id:'scarb',short:'Scarborough Fair',name:'Scarborough Fair',by:'English folk',key:2,scale:'dorian',mode:'minor',prog:[0,10,0,0],notes:[[0,4],[0,2],[7,4],[7,2],[2,3],[3,1],[2,2],[0,8],[7,4],[10,2],[12,4],[10,2],[7,2],[9,2],[5,2],[7,8]]},
 {id:'jupiter',short:'Jupiter',name:'Jupiter (The Planets)',by:'Holst · 1918',key:3,scale:'major',mode:'major',prog:[0,5,7,0],notes:[[4,2],[7,2],[9,3],[12,1],[11,2],[9,2],[11,2],[12,2],[11,2],[9,2],[7,2],[9,4]]},
 {id:'funeral',short:'Funeral March',name:'Funeral March (Sonata No. 2)',by:'Chopin · 1839',key:10,scale:'minor',mode:'minor',prog:[0,0,8,7],pw:true,notes:[[0,4],[0,3],[0,1],[0,4],[3,3],[2,1],[2,3],[0,1],[0,3],[-1,1],[0,8]]}];
/* Flavours inside each side. Drum & bass: rollers (the original), breakcore (busy breaks and edits) and metal (distorted
   riffs, double kicks). Trance: classic and psytrance (rolling bass, acid lead, phrygian harmony). */
const FLAV={dnb:['dnb','brk','metal'],trance:['trance','psy']},FLAVN={dnb:'drum & bass',brk:'breakcore',metal:'metal',trance:'trance',psy:'psytrance'};
/* Blend (Prototype 35): a tune with both styles in it. The rhythm section is drum & bass (or breakcore) and the melody
   side is trance: trance hooks and library lines, the anthem lead plan, harp, bells, claps, plucks answering. st.style
   still picks the tempo: 174 (trance & bass) or 138 (breakbeat under trance, trance breaks). */
const MIXF=['dnb','brk'],flavList=st=>st.mx?MIXF:FLAV[st.style?'trance':'dnb'];
const flavOf=st=>{const L=flavList(st);return L[(st.flav||0)%L.length]};
const libSide=st=>st.style||st.mx?1:0,libFk=st=>st.mx?'trance':flavOf(st);
/* Call and response (Goldie's favourite): who answers the lead, by flavour. */
const RESP={dnb:['stab','reese','stab'],brk:['stab','reese','stab'],metal:['chug','vox','chug'],trance:['pluck','stab','pluck'],psy:['zap','pluck','zap']},RESPN={vox:'vocal',stab:'stab',reese:'reese bass',pluck:'pluck',zap:'zap',chug:'rhythm guitar'};
/* Alternate progressions by mode (index 0 of a tune's prog field means the theme's own harmony). */
const PROGS={phryg:[[0,0,1,0],[0,1,0,10],[0,8,1,0],[0,0,1,10],[0,3,1,0],[0,10,8,1],[0,1,3,1]],
             minor:[[0,8,3,10],[0,10,8,7],[0,5,8,7],[0,3,10,8],[0,8,10,5],[0,0,8,10],[0,7,8,3]],
             major:[[0,7,9,5],[9,5,0,7],[0,9,5,7],[0,2,5,7],[0,4,5,7],[0,5,7,5],[5,7,9,0]]};
/* Drum grooves: 16-step patterns. k kick, s snare, g ghost snare, c clap, oh open hat, h closed-hat density. */
const GROOVES={
 brk:[{k:[0,10],s:[4,12],g:[7,9,14,15],h:2,oh:[]},{k:[0,2,10,11],s:[4,12],g:[6,7,9,13,15],h:2,oh:[14]},{k:[0,6,10],s:[4,12],g:[3,9,11,15],h:2,oh:[]},{k:[0,1,10],s:[4,7,12],g:[13,14,15],h:2,oh:[6]}],
 metal:[{k:[0,2,4,6,8,10,12,14],s:[4,12],g:[],h:1,oh:[],dk:true},{k:[0,3,6,8,11,14],s:[4,12],g:[],h:1,oh:[]},{k:[0,6,10],s:[8],g:[],h:1,oh:[0,8]},{k:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],s:[4,12],g:[],h:0,oh:[],dk:true}],
 psy:[{k:[0,4,8,12],c:[12],oh:[2,6,10,14],h:2},{k:[0,4,8,12],c:[4,12],oh:[2,6,10,14],h:2},{k:[0,4,8,12],c:[12],oh:[2,10],h:2},{k:[0,4,8,12],c:[4,12],oh:[2,6,10,14],h:1}],
 dnb:[{k:[0,10],s:[4,12],g:[],h:1,oh:[]},{k:[0,6,10],s:[4,12],g:[7,13,15],h:2,oh:[]},{k:[0,11],s:[8],g:[14],h:1,oh:[6,14]},{k:[0,10,11],s:[4,12],g:[9],h:1,oh:[2,6,10,14]}],
 trance:[{k:[0,4,8,12],c:[4,12],oh:[2,6,10,14],h:0},{k:[0,4,8,12],c:[4,12],oh:[2,6,10,14],h:1},{k:[0,4,8,12],c:[12],oh:[2,6,10,14],h:1},{k:[0,4,8,12],c:[4,12],oh:[2,6,10,14],h:2}]};
/* Bass patterns: [step, length in 16ths, octave up?]. */
const roll=(oct)=>{const a=[];for(let i=0;i<16;i++)if(i%4)a.push([i,1,oct&&i%4===2?1:0]);return a};
const BASS={
 psy:null,
 metal:[[[0,1,0],[1,1,0],[2,1,0],[3,1,0],[6,2,1],[8,1,0],[9,1,0],[10,1,0],[11,1,0],[14,2,1]],[[0,2,0],[2,1,0],[3,1,0],[4,2,0],[6,1,0],[7,1,0],[8,2,0],[10,1,0],[11,1,0],[12,2,0],[14,1,0],[15,1,0]],
   [[0,3,0],[3,3,0],[6,2,1],[8,3,0],[11,3,0],[14,2,1]],[[0,1,0],[1,1,0],[2,1,0],[3,1,0],[4,1,0],[5,1,0],[6,1,0],[7,1,0],[8,1,0],[9,1,0],[10,1,0],[11,1,0],[12,1,0],[13,1,0],[14,1,0],[15,1,0]]],
 dnb:[[[0,6,0],[6,2,1],[10,6,0]],[[0,4,0],[4,2,1],[6,2,0],[10,4,0],[14,2,1]],[[0,3,0],[3,1,1],[4,4,0],[8,3,0],[11,1,1],[12,4,0]],[[0,2,0],[2,1,0],[3,1,1],[6,2,0],[8,2,0],[10,2,1],[12,2,0],[14,2,0]]],
 trance:[roll(0),roll(0),[[2,2,0],[6,2,0],[10,2,0],[14,2,0]],roll(1)]};
BASS.psy=[roll(0),[[1,1,0],[2,1,0],[3,1,1],[5,1,0],[6,1,0],[7,1,1],[9,1,0],[10,1,0],[11,1,1],[13,1,0],[14,1,0],[15,1,1]],[[2,1,0],[3,1,0],[6,1,0],[7,1,0],[10,1,0],[11,1,0],[14,1,0],[15,1,0]],roll(1)];BASS.brk=BASS.dnb;
const ARPS=[[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3],[0,2,1,3,0,2,1,3,0,2,1,3,0,2,1,3],[3,2,1,0,1,2,3,2,1,0,1,2,3,2,1,0],[0,0,1,2,0,0,2,3,0,0,1,2,3,2,1,0]];
/* Timbre presets: lead wave/voices/spread/cutoff/envelope, pad voices/spread/cutoff, bass cutoff/resonance, delay and reverb sends. */
const TIMBRES=[
 {n:'glass',lead:'sawtooth',lv:3,ls:14,lc:2600,le:2200,pv:3,ps:14,pc:1800,bc:420,br:2.5,dly:0.42,rev:0.3},
 {n:'hollow',lead:'square',lv:1,ls:0,lc:1300,le:3200,pv:2,ps:10,pc:1200,bc:360,br:3.5,dly:0.5,rev:0.25},
 {n:'supersaw',lead:'sawtooth',lv:6,ls:26,lc:4000,le:1500,pv:5,ps:24,pc:2600,bc:480,br:2,dly:0.3,rev:0.45},
 {n:'wire',lead:'triangle',lv:2,ls:7,lc:5000,le:0,pv:3,ps:8,pc:900,bc:300,br:4,dly:0.55,rev:0.2},
 {n:'brass',lead:'sawtooth',lv:2,ls:9,lc:1800,le:2600,pv:4,ps:12,pc:1500,bc:520,br:1.5,dly:0.25,rev:0.35},
 {n:'pulse',lead:'square',lv:3,ls:18,lc:2200,le:1800,pv:3,ps:20,pc:2200,bc:400,br:3,dly:0.45,rev:0.3},
 {n:'dark',lead:'sawtooth',lv:2,ls:5,lc:900,le:1400,pv:2,ps:6,pc:700,bc:260,br:5,dly:0.6,rev:0.5},
 {n:'bright',lead:'triangle',lv:4,ls:16,lc:6000,le:0,pv:4,ps:18,pc:3200,bc:600,br:1.2,dly:0.35,rev:0.4}];
const MUT_NAMES=['','transposed','inverted','reversed','syncopated','ornamented','sequenced','octave-shifted'];
/* Lead rhythm cells, one bar each: [step, length in 16ths]. D&B leads ride syncopated, longer notes over the breakbeat;
   trance leads are 16th/8th riffs (the 3-3-2 "tresillo" is the classic gated-trance figure). */
const RHY={
 dnb:[[[0,3],[3,3],[6,4],[10,2],[12,4]],[[0,2],[2,2],[4,4],[8,2],[10,3],[13,3]],[[0,6],[6,2],[8,6],[14,2]],[[0,3],[3,5],[8,3],[11,3],[14,2]],[[0,4],[6,2],[8,2],[10,6]],[[0,2],[3,3],[6,2],[8,4],[12,2],[14,2]]],
 trance:[[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,2],[2,1],[3,1],[4,2],[6,2],[8,2],[10,1],[11,1],[12,2],[14,2]],[[0,2],[2,2],[4,2],[6,2],[8,2],[10,2],[12,2],[14,2]],[[0,4],[4,2],[6,2],[8,4],[12,4]],[[0,3],[3,3],[6,4],[10,3],[13,3]]]};

