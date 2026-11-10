//# music/engine/034-songs-mode.js: Songs mode: the recorded CC0 tracks in songs/
/* Songs (Prototype 38): they come as files beside the page in the itch.io zip and the Wi-Fi host pack (songs/), so a
   copy without them (the offline file, the Claude page) plays the generative music instead. */
(function(){try{if(location.protocol==='file:'){SONGS.ok=false;return}fetch('songs/songs.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{SONGS.ok=!!(j&&j.length);try{songsUI()}catch(e){}if(SONGS.ok)setTimeout(()=>{try{if(music.modeEff()==='songs'&&music.ctx&&music.style!=='off'&&!music.soOn)music.soStart()}catch(e){}},0)}).catch(()=>{SONGS.ok=false;try{songsUI()}catch(e){}})}catch(e){SONGS.ok=false}})();
