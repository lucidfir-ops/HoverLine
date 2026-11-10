//# music/023-likes.js: likes and keeps steer the radio toward similar templates; skips count against
/* ---- likes (Prototype 45): Like (and Keep) raise similar templates, a skip in the first 20 s counts a little against;
   kept per template in this browser, the newest 64 events */
const MLIKE={get(){try{const a=JSON.parse(store.get('hoverline.mlike')||'[]');return Array.isArray(a)?a.filter(x=>Array.isArray(x)&&x.length>=2):[]}catch(e){return[]}},
  now(){return Math.floor(Date.now()/1000)},
  add(tp,w,why){if(!tp)return;const a=this.get();a.unshift([tp,w,this.now()]);store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(why||(w<0?'skip':'keep'),tp)},
  liked(tp){return this.get().some(([t,w])=>t===tp&&w>=3)},
  /* Prototype 50: the thumbs down, a soft one: -2.5 for this template (a Like is +3, a quick skip -1), so it and its
     close relatives come up less often but are never ruled out (the weights are clamped, and the newest 64 entries are
     all that is kept). One unlucky arrangement shouldn't bury a template. Toggles; a Like clears it and back. */
  disliked(tp){return this.get().some(([t,w])=>t===tp&&w===-2.5)},
  dis(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w===-2.5);a=a.filter(([t,w])=>!(t===tp&&(w===-2.5||w>=3)));if(!on)a.unshift([tp,-2.5,this.now()]);store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(on?'undislike':'dislike',tp);return!on},
  toggle(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w>=3);if(on)a=a.filter(([t,w])=>!(t===tp&&w>=3));else{a=a.filter(([t,w])=>!(t===tp&&w===-2.5));a.unshift([tp,3,this.now()])}store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(on?'unlike':'like',tp);return!on},
  on(){return store.get('hoverline.mlikeon')!=='0'},
  /* what was liked, unliked, kept, skipped or removed from the library, and when: for the log export */
  hist(){try{const a=JSON.parse(store.get('hoverline.mlikelog')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}},
  note(what,tp,x){try{const a=this.hist();a.unshift(x?[this.now(),what,tp,x]:[this.now(),what,tp]);store.set('hoverline.mlikelog',JSON.stringify(a.slice(0,200)))}catch(e){}},
  aff(T,A){let s=0;for(const[tp,w]of A){const L=TPL[tp-1];if(!L)continue;let m=tp===T.id?1:0;if(L.f===T.f)m+=0.45;if(L.d===T.d)m+=0.25;if((L.gn||[]).some(g=>(T.gn||[]).includes(g)))m+=0.2;if(L.l===T.l)m+=0.1;s+=w*Math.min(1.2,m)}return s}};
