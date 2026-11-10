//# music/025-track-plays.js: how often each track was raced, so the music moves on
/* ---- how often each track was raced on your own (Prototype 45), so a track raced again moves on to another tune:
   [track, races started, the template its last race opened with, the code of its first race's tune], the 120 most
   recent tracks ---- */
const MTRK={get(){try{const a=JSON.parse(store.get('hoverline.mtrk')||'[]');return Array.isArray(a)?a.filter(x=>Array.isArray(x)&&x.length>=2):[]}catch(e){return[]}},
  k(seed){return(seed>>>0).toString(36)},
  e(seed){const k=this.k(seed);return this.get().find(x=>x[0]===k)||null},
  n(seed){const e=this.e(seed);return e?e[1]|0:0},
  bump(seed,tp,code){const k=this.k(seed),a=this.get(),i=a.findIndex(x=>x[0]===k),n=i>=0?(a[i][1]|0)+1:1,first=i>=0&&a[i][3]||code||'';if(i>=0)a.splice(i,1);a.unshift([k,n,tp|0,first]);try{store.set('hoverline.mtrk',JSON.stringify(a.slice(0,120)))}catch(e){}return n}};
