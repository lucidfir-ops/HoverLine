//# net/081-test-sound.js: pairing: Test sound
/* ---- Test sound ---- */
async function chirpTest(){if(chirp.mode||!ChirpIO.can())return;audio.init();PDG.start('test','sound');chirp.role='test';chirp.mode='test';
  chirpUI('test','Testing sound…',stepsHtml(CH_TEST,0));chirpSay('');
  const why=await chirpOpen();if(chirp.mode!=='test')return;if(why)return chirpFail(why,'test');chirpDuck(true);
  await chirpWait(1500);if(chirp.mode!=='test')return;ch$('chirpSteps').innerHTML=stepsHtml(CH_TEST,1);
  let ok=false;for(const sp of['fastest','fast']){ok=await ChirpIO.selfTest(sp);if(ok||chirp.mode!=='test')break}
  if(chirp.mode!=='test')return;PDG.ev('test sound',{heard:ok});if(PDG.cur)PDG.cur.selfTest=ok;
  ch$('chirpTitle').textContent=ok?'Sound works on this device':'This device didn\'t hear its own call';
  ch$('chirpSteps').innerHTML=stepsHtml(CH_TEST,2)+`<p class="small">${ok?'Its speaker and microphone both work for pairing. The other device needs the same: test it too.':'Turn the volume up and try again. If the bar doesn\'t move when you talk, the microphone isn\'t reaching the game: check it is on and not muted in the device\'s sound settings. Codes always work.'}</p>`}
