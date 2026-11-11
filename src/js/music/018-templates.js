//# music/018-templates.js: THE CURRENT TUNE SOURCE: song templates (TPL), S codes, genres; every new tune is a template plus a seed
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
