// node jcodes.js N OFF -> N track codes with jumps (complex, widths and lengths in turn), from the balance.js seed formula
const H=require('./hl.js')(process.env.GAME||'./game_base.js');const N=+process.argv[2],OFF=+(process.argv[3]||0);const out=[];
const kinds=['W','S','N'],lens=['Q','M','L'];
for(let q=OFF;out.length<N&&q<OFF+20000;q++){const seed=(Math.imul(q+101,2654435761)>>>0)&0xffffff;H.loadTrack(seed,kinds[q%3],true,lens[Math.floor(q/3)%3]);const T=H.getT();if(T.jumps.length)out.push(H.code()+':'+T.jumps.length)}
console.log(out.join(' '));
