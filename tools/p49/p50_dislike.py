#!/usr/bin/env python3
"""Prototype 50: a soft thumbs down beside every Like (run from the repo root, once)."""
import sys
def ed(path, pairs):
    p = 'src/' + path; s = open(p, encoding='utf-8', newline='').read()
    for a, b in pairs:
        assert s.count(a) >= 1, (path, a[:80]); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='').write(s)
if 'disliked' in open('src/js/music/023-likes.js').read(): sys.exit('already applied')
ed('js/music/023-likes.js', [
 ("  liked(tp){return this.get().some(([t,w])=>t===tp&&w>=3)},\n  toggle(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w>=3);if(on)a=a.filter(([t,w])=>!(t===tp&&w>=3));else a.unshift([tp,3,this.now()]);",
  "  liked(tp){return this.get().some(([t,w])=>t===tp&&w>=3)},\n"
  "  /* Prototype 50: the thumbs down, a soft one: -2.5 for this template (a Like is +3, a quick skip -1), so it and its\n"
  "     close relatives come up less often but are never ruled out (the weights are clamped, and the newest 64 entries are\n"
  "     all that is kept). One unlucky arrangement shouldn't bury a template. Toggles; a Like clears it and back. */\n"
  "  disliked(tp){return this.get().some(([t,w])=>t===tp&&w===-2.5)},\n"
  "  dis(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w===-2.5);a=a.filter(([t,w])=>!(t===tp&&(w===-2.5||w>=3)));if(!on)a.unshift([tp,-2.5,this.now()]);store.set('hoverline.mlike',JSON.stringify(a.slice(0,64)));this.note(on?'undislike':'dislike',tp);return!on},\n"
  "  toggle(tp){let a=this.get();const on=a.some(([t,w])=>t===tp&&w>=3);if(on)a=a.filter(([t,w])=>!(t===tp&&w>=3));else{a=a.filter(([t,w])=>!(t===tp&&w===-2.5));a.unshift([tp,3,this.now()])}"),
])
ed('js/music/engine/049-step-template.js', [
 ("  liked(){return!!(this.T&&MLIKE.liked(this.T.id))},",
  "  liked(){return!!(this.T&&MLIKE.liked(this.T.id))},\n"
  "  dislike(){if(!this.T)return null;const on=MLIKE.dis(this.T.id);this.mlog('dislike',{code:this.code(),tpl:this.T.id,name:this.T.n,on});this.changed();return on},\n"
  "  disliked(){return!!(this.T&&MLIKE.disliked(this.T.id))},"),
])
ed('page.html', [
 ('aria-label="Like this tune">♥ Like</button><span class="sep"></span>', 'aria-label="Like this tune">♥ Like</button><button class="chip" id="dislikeTune" aria-pressed="false" aria-label="Less like this tune" title="Less like this: plays less often, never ruled out">👎</button><span class="sep"></span>'),
 ('id="likeTune2" aria-pressed="false">♥ Like this tune</button>', 'id="likeTune2" aria-pressed="false">♥ Like this tune</button><button class="chip" id="dislikeTune2" aria-pressed="false" title="Plays less often, never ruled out">👎 Less like this</button>'),
 ('<button class="chip" id="likeTune3" aria-pressed="false" aria-label="Like this tune">♥ Like</button>', '<button class="chip" id="likeTune3" aria-pressed="false" aria-label="Like this tune">♥ Like</button><button class="chip" id="dislikeTune3" aria-pressed="false" aria-label="Less like this tune">👎</button>'),
])
for f in ['js/loop/089-graphics-options.js', 'js/ui/061-track-editor.js']:
    ed(f, [("for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}",
            "for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}for(const id of['dislikeTune','dislikeTune2','dislikeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.disliked()))}")])
ed('js/ui/061-track-editor.js', [
 ("for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.onclick=",
  "for(const id of['dislikeTune','dislikeTune2','dislikeTune3']){const b=$(id);if(b)b.onclick=()=>{audio.init();const on=music.dislike();if(on==null){note('This works on the generated tunes',1600);return}syncMusic();note(on?'👎 Noted · it and tunes like it come up a bit less':'Thumbs down removed',1800);if(on&&!music.pinned)newSong()}}\n"
  "for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.onclick="),
])
ed('js/race/060-race-flow.js', [("$('likeTune3').hidden=!c||!!so;", "$('likeTune3').hidden=$('dislikeTune3').hidden=!c||!!so;")])
print('p50 dislike applied')
