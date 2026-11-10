// Probe: one object in front of the camera, plain render and through the composite (for debugging the line shader).
const path = require('path');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/objects2.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
const out = process.argv[2], what = process.argv[3] || 'gyro';
(async () => {
  const b = await launch(); const p = await openPage(b, 640, 360, LIB); if (process.env.DBG) await p.evaluate(([d, v]) => { window.DBG = d; window.VS = v }, [+process.env.DBG, process.env.VS || '']);
  const r = await p.evaluate((what) => { const SP = window.SPFX, ST = SP.stage; ST.size(640, 360); ST.c.renderer.debug.checkShaderErrors = true; ST.patchComp(); ST.init({ seed: 1234 }); ST.size(640, 360);
    const o = ST.place(SP.obj[what](THREE, { size: 10, pal: 'cyanMagenta' }), ST.u0 + 40, 0, 10);
    ST.cam = { back: 0, up: 8, ahead: 40, lookUp: 10, fov: 70 };
    if (window.DBG) o.group.traverse((x) => { if (x.isMesh && x.material.uniforms && x.material.uniforms.uWidth) { x.material.fragmentShader = 'void main(){gl_FragColor=vec4(1.,0.,0.,1.);}'; if (window.DBG === 3) x.material.vertexShader = x.material.vertexShader.replace(/uRes/g, 'vec2(640.,360.)').replace('uniform vec2 vec2(640.,360.),uFog', 'uniform vec2 uFog'); if (window.DBG === 4) x.material.vertexShader = x.material.vertexShader.replace('float px=clamp(', 'float px=3.;float pxx=clamp('); if (window.DBG === 5) x.material.vertexShader = x.material.vertexShader.replace('vec4 a=toView(pa),b=toView(pb);', 'vec4 a=modelViewMatrix*vec4(pa,1.),b=modelViewMatrix*vec4(pb,1.);'); if (window.DBG === 6) x.material.vertexShader = x.material.vertexShader.replace('if(a.z>nz&&b.z>nz){gl_Position=vec4(0.,0.,-2.,1.);return;}', ''); if (window.DBG === 7) x.material.vertexShader = x.material.vertexShader.replace('gl_Position=c;', 'gl_Position=projectionMatrix*modelViewMatrix*vec4(pa,1.);'); if (window.DBG === 8) x.material.vertexShader = x.material.vertexShader.replace(/c\.xy\+=[^;]*;/, ''); if (window.VS) x.material.vertexShader = x.material.vertexShader.replace(/void main\(\)\{[^]*$/, window.VS); if (window.DBG === 2) x.material.vertexShader = 'attribute vec3 pa;attribute float side;attribute float endp;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(pa,1.);gl_Position.xy+=vec2(side,endp)*0.02*gl_Position.w;}'; x.material.blending = THREE.NormalBlending; x.material.depthTest = false; x.material.needsUpdate = true } });
    ST.frame(1, 0.05, { update() {} });
    const m = []; o.group.traverse((x) => { if (x.isMesh) m.push([x.material.type, x.geometry.index && x.geometry.index.count, x.visible, x.material.uniforms && x.material.uniforms.uWidth && x.material.uniforms.uWidth.value]) });
    const pr = ST.c.renderer.info.programs.map((q) => q.diagnostics ? JSON.stringify(q.diagnostics).slice(0, 800) : null).filter(Boolean); const gl = ST.c.renderer.getContext(); return { m: m.length, info: ST.c.renderer.info.render, pr, err: gl.getError() } }, what);
  console.log(JSON.stringify(r));
  await p.screenshot({ path: out + '/probe-' + what + '.png' });
  await b.close();
})();
