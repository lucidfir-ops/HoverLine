/* Spirit realm prototype: the stage for the clips (not for the game). Loads a track in the game, keeps only the road
   and the racers, turns the world into a black void, moves the pack and the chase camera on a fixed clock, adds the
   screen effects (63 breathing, 64 drifting, 66 kaleidoscope) to the game's own composite shader, and draws a small
   overlay with the clip's name and a beat meter. Uses window.__cv (the hook in page.js). */
(function (root) {
  const SPFX = root.SPFX, THREE = root.THREE;
  const ST = SPFX.stage = { objs: [], beat: SPFX.Beat(140, 8) };
  const V3 = () => new THREE.Vector3();

  // ---------- the void ----------
  ST.init = function (o = {}) {
    const c = root.__cv; ST.c = c;
    c.tod = 'night'; c.loadTrack(o.seed || 1234, o.wk || 'W', false, 'M', null, { k: o.biome || 'U', d: null });
    const T = c.T, sc = c.scene; ST.T = T;
    // keep a track mesh only if every sampled vertex is within the road's reach of the centreline (road, edges, walls)
    // distance outside the road's box: across beyond the edges plus 3 m, or more than 6 m over / 3 m under the road
    const near = (v) => { let m = 1e9, bi = 0; for (let i = 0; i < T.N; i += 2) { const d = T.P[i].distanceToSquared(v); if (d < m) { m = d; bi = i } }
      const d = v.clone().sub(T.P[bi]), lat = Math.abs(d.dot(T.R[bi])), h = d.dot(T.U[bi]); return (lat > c.W * 0.5 + 3 || h > 6 || h < -3) ? 99 : 0 };
    const reach = 1, v = V3();
    const trackG = sc.children.filter((g) => g.isGroup && g.children.length > 40).pop();
    ST.hidden = [];
    sc.traverse((o) => { if (o === sc) return;
      if (o.isGridHelper || (T.env && o === T.env.sky)) { o.visible = false; ST.hidden.push(o); return }
      if (o.parent !== trackG) return;
      if (!(o.isMesh || o.isLine || o.isLineSegments || o.isPoints) || !o.geometry || !o.geometry.attributes.position) { if (o.isGroup) { o.visible = false; ST.hidden.push(o) } return }
      const p = o.geometry.attributes.position; o.updateMatrixWorld(true); let ok = true;
      for (let k = 0; k < 24 && ok; k++) { const i = Math.floor(k / 23 * (p.count - 1)); v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (near(v) > reach) ok = false }
      if (!ok || p.count < 40) { o.visible = false; ST.hidden.push(o) } });
    // other top-level scenery groups (biome extras) go too; ships and lights stay
    sc.children.forEach((g) => { if (g !== trackG && g.isGroup && g.children.length > 20 && !g.userData.spfx) { g.visible = false; ST.hidden.push(g) } });
    // sky domes and other huge things (anything over 1500 m across) go
    sc.traverse((o) => { if (!o.visible || !o.geometry || ST.hidden.includes(o)) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      const bs = o.geometry.boundingSphere; if (bs && bs.radius * o.scale.x > 1500 && o.parent !== trackG) { o.visible = false; ST.hidden.push(o) } });
    c.camera.children.forEach((o) => { o.visible = false; ST.hidden.push(o) }); // the night sky's aurora and stars ride on the camera
    ST.lights = []; sc.traverse((o) => { if (o.isLight) ST.lights.push(o) });
    sc.background = new THREE.Color(0x000000); if (sc.fog) { sc.fog.color.set(0x000000); sc.fog.near = 400; sc.fog.far = 2600 }
    c.camera.far = 9000; c.camera.near = 0.3; c.camera.updateProjectionMatrix();
    T.env && (T.env.update = () => {});
    ST.root = new THREE.Group(); ST.root.userData.spfx = 1; sc.add(ST.root);
    ST.objs = []; ST.u0 = o.u0 != null ? o.u0 : ST.straight(o.len || 900);
    return { L: T.L, u0: ST.u0, hidden: ST.hidden.length };
  };
  // the start of the straightest stretch of len metres
  ST.straight = function (len) {
    const T = ST.T, n = Math.round(len / T.ds); let best = 0, bu = 0;
    for (let i = 0; i < T.N; i += 4) { const a = T.Tg[i], b = T.Tg[(i + n) % T.N], m = T.Tg[(i + (n >> 1)) % T.N];
      const s = a.dot(b) + a.dot(m) - Math.abs(T.P[(i + n) % T.N].y - T.P[i].y) / len; if (s > best) { best = s; bu = i * T.ds } }
    return bu;
  };
  // a place by the road: u metres along, lat right, h up; returns position and the road's frame
  ST.at = function (u, lat = 0, h = 0) { const s = ST.c.sampleAt(u); const p = s.p.clone().addScaledVector(s.r, lat).addScaledVector(s.u, h); return { p, r: s.r.clone(), u: s.u.clone(), t: s.t.clone() } };
  // put an object into the world at a road place, its +Z along the road and +Y up
  ST.place = function (obj, u, lat, h, o = {}) { const a = ST.at(u, lat, h); obj.group.position.copy(a.p);
    if (o.level) { const t = a.t.clone(); t.y = 0; t.normalize(); obj.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0).cross(t).normalize(), new THREE.Vector3(0, 1, 0), t)) }
    else obj.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(a.r.clone().negate(), a.u, a.t));
    ST.add(obj); return obj };
  // far away: D metres ahead in a straight line from the road's frame at u (default the start), lat right, h up
  ST.placeFar = function (obj, D, lat, h, u) { const a = ST.at(u == null ? ST.u0 : u); const t = a.t.clone(); t.y = 0; t.normalize(); const r = new THREE.Vector3(0, 1, 0).cross(t).negate();
    obj.group.position.copy(a.p).addScaledVector(t, D).addScaledVector(r, lat).add(new THREE.Vector3(0, h, 0));
    obj.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(r.clone().negate(), new THREE.Vector3(0, 1, 0), t)); ST.add(obj); return obj };
  ST.add = function (obj) { if (!obj.group.parent) ST.root.add(obj.group); ST.objs.push(obj); return obj };
  ST.clear = function () { for (const o of ST.objs) { o.group.parent && o.group.parent.remove(o.group) } ST.objs = []; };

  // ---------- the pack ----------
  ST.PACK = [{ f: 'dart', du: 0, lat: 1.5 }, { f: 'blade', du: -6, lat: -3.5 }, { f: 'skiff', du: -11, lat: 5 }, { f: 'mono', du: -15, lat: -6.5 },
    { f: 'orb', du: -21, lat: 0.5 }, { f: 'roller', du: -27, lat: 6.5 }, { f: 'hauler', du: -33, lat: -3 }, { f: 'tether', du: -40, lat: 3 }];
  ST.pack = function (list, v) {
    const c = ST.c, S = c.S; list = list || ST.PACK; ST.v = v || 80;
    c.player.ship.visible = false; c.player.shadow.visible = false; c.player.off = true; c.racers.length = 0;
    const byFrame = {};
    for (let i = 1; i < c.roster.length; i++) { const r = c.roster[i], cf = c.ROSTER[i];
      if (!r.build || r.build.frame !== cf.b.frame) c.setShip(r, cf.b, cf.paint); byFrame[cf.b.frame] = r; r.ship.visible = false; r.shadow.visible = false; r.off = true }
    ST.list = list.map((q) => { const r = byFrame[q.f]; c.freshRacer(r, ST.u0, ST.u0, q.lat);
      Object.assign(r, { v: ST.v, boost: 0, selfBoost: false, steerS: 0, yaw: 0, pitch: 0, brk: 0, ammo: r.d.ammo, hp: r.d.hp, off: false, bias: q.lat * 0.1 });
      r.ship.visible = true; r.shadow.visible = true; c.racers.push(r); return { r, q } });
    S.state = 'race'; S.t = 3;
  };
  ST.lead = (t) => ST.u0 + (ST.v || 0) * t;

  // ---------- camera ----------
  // chase: back/up/side metres from the leader, looking ahead; or any function (t) -> {pos, look, up, fov}
  ST.cam = { back: 22, up: 6, side: 0, ahead: 50, lookUp: 2, fov: 70, roll: 0 };
  ST.setCam = function (t) {
    const c = ST.c, C = typeof ST.cam === 'function' ? ST.cam(t) : ST.cam, cam = c.camera;
    if (C.pos) { cam.position.copy(C.pos); cam.up.copy(C.up || new THREE.Vector3(0, 1, 0)); cam.lookAt(C.look) }
    else { const u = ST.lead(t) + (C.du || 0), a = ST.at(u - C.back, C.side, C.up), b = ST.at(u + C.ahead, C.lookSide || 0, C.lookUp);
      cam.position.copy(a.p); cam.up.copy(a.u); cam.lookAt(b.p) }
    if (C.roll) cam.rotateZ(C.roll);
    cam.fov = C.fov || 70; cam.aspect = ST.w / ST.h; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  };

  // ---------- screen effects in the game's composite (63, 64, 66) ----------
  ST.fx = { br: 0, dr: 0, k: 0, kRot: 0, flash: 0 };
  ST.patchComp = function () {
    const G = root.__cv.GFX; if (!G.comp || G.comp.userData.spfx) return; const m = G.comp;
    let fs = m.fragmentShader; const i = fs.indexOf('void main(){');
    const head = fs.slice(0, i), main = fs.slice(i + 'void main(){'.length).replace(/vUv/g, 'wv');
    fs = head + `uniform float uBr,uDr,uBt,uK,uKr,uFl;
      void main(){vec2 wv=vUv;{vec2 q=vUv-0.5;float asp=rs.x/rs.y;vec2 qa=q*vec2(asp,1.);float r=length(qa);
        float m=smoothstep(0.16,0.62,r);
        wv=0.5+q*(1.-uBr*m);
        wv+=uDr*m*vec2(sin(vUv.y*6.3+uBt*0.9)+0.6*sin(vUv.y*15.1-uBt*1.7+vUv.x*3.),cos(vUv.x*5.1-uBt*0.7)+0.6*cos(vUv.x*13.7+uBt*1.3-vUv.y*4.))*0.012;
        if(uK>0.001){float a=atan(qa.y,qa.x)+uKr;float s=6.28318/6.;a=mod(a,s);a=min(a,s-a);vec2 kq=vec2(cos(a),sin(a))*r;kq.x/=asp;
          wv=mix(wv,0.5+kq*(1.-0.25*uK),step(0.001,uK));}}
      ` + main.replace(/gl_FragColor=vec4\(max\(col,0\.\),1\.\);\}\s*$/, 'col+=vec3(uFl);gl_FragColor=vec4(max(col,0.),1.);}');
    m.fragmentShader = fs;
    Object.assign(m.uniforms, { uBr: { value: 0 }, uDr: { value: 0 }, uBt: { value: 0 }, uK: { value: 0 }, uKr: { value: 0 }, uFl: { value: 0 } });
    m.needsUpdate = true; m.userData.spfx = 1;
  };

  // ---------- overlay: caption and beat meter ----------
  ST.overlay = function () {
    let el = document.getElementById('fxo'); if (el) return el;
    el = document.createElement('div'); el.id = 'fxo';
    el.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;font:600 11px/1.25 "DejaVu Sans Mono",monospace;color:#f2efe6;z-index:99';
    el.innerHTML = '<div id="fxc" style="position:absolute;left:8px;top:6px;text-shadow:0 0 3px #000,0 0 6px #000"></div>' +
      '<div id="fxb" style="position:absolute;left:8px;bottom:7px;display:flex;gap:3px;align-items:center"></div>' +
      '<div id="fxd" style="position:absolute;left:0;right:0;top:40%;text-align:center;font-size:28px;letter-spacing:6px;color:#ffb000;opacity:0;text-shadow:0 0 10px #ffb000"></div>';
    document.body.append(el); return el;
  };
  ST.drawOverlay = function (cap, bt, show) {
    ST.overlay(); document.getElementById('fxc').innerHTML = cap || '';
    const B = document.getElementById('fxb');
    if (show === false) { B.innerHTML = ''; document.getElementById('fxd').style.opacity = 0; return }
    let h = '';
    for (let i = 0; i < 4; i++) { const on = i === bt.bb, a = on ? 0.35 + 0.65 * bt.k : 0.18; h += `<span style="width:9px;height:9px;border:1px solid #ffb000;background:rgba(255,176,0,${on ? a : 0})"></span>` }
    h += '<span style="width:8px"></span>';
    for (let i = 0; i < 8; i++) h += `<span style="width:5px;height:${i === bt.bars ? 9 : 5}px;background:${i === bt.bars ? '#3ff0ff' : 'rgba(63,240,255,.35)'}"></span>`;
    h += `<span style="margin-left:6px;color:#8b93a2">140 bpm · bar ${bt.bars + 1}/8${bt.toDrop < 3.5 ? ' · drop in ' + Math.ceil(bt.toDrop / bt.spb) : ''}</span>`;
    B.innerHTML = h;
    const D = document.getElementById('fxd'); D.textContent = 'DROP'; D.style.opacity = bt.tDrop < 0.9 && bt.dropN >= 0 && bt.t >= 0 ? Math.max(0, 1 - bt.tDrop / 0.9) : 0;
  };

  // ---------- one frame ----------
  ST.frame = function (t, dt, clip) {
    const c = ST.c, bt = ST.beat(t + (clip.beatOffset || 0)); ST.bt = bt;
    SPFX.G.uTime.value = t; SPFX.G.uRes.value.set(ST.w, ST.h);
    if (ST.list) for (const { r, q } of ST.list) { r.u = ST.lead(t) + q.du + (q.wob ? Math.sin(t * 0.7 + q.du) * q.wob : 0); r.utot = r.u; r.lat = q.lat + Math.sin(t * 0.6 + q.du * 0.3) * 0.8; r.steerS = Math.cos(t * 0.6 + q.du * 0.3) * 0.25; c.placeShip(r, c.S.t) }
    c.S.t += dt; c.VFX.update(dt); c.scene.background.set(0x000000); if (c.scene.fog) { c.scene.fog.color.set(0x000000); c.scene.fog.near = 400; c.scene.fog.far = 2600 }
    if (clip.update) clip.update(t, bt, dt);
    for (const o of ST.objs) if (o.update) o.update(t, bt, dt);
    ST.setCam(t);
    const U = c.GFX.comp.uniforms; U.uBr.value = ST.fx.br; U.uDr.value = ST.fx.dr; U.uBt.value = t; U.uK.value = ST.fx.k; U.uKr.value = ST.fx.kRot; U.uFl.value = ST.fx.flash;
    c.GFX.fx = clip.blur == null ? 0.25 : clip.blur; c.GFX.gl = 0;
    c.gfxRender(c.scene, c.camera);
    ST.drawOverlay(clip.caption ? clip.caption(t, bt) : '', bt, clip.meter);
  };
  ST.size = function (w, h) { ST.w = w; ST.h = h; const c = ST.c = root.__cv; c.fit(); c.renderer.setPixelRatio(1); c.renderer.setSize(w, h, false); c.camera.aspect = w / h; c.camera.updateProjectionMatrix() };

  // triangles and draw calls of an object (meshes; a neon line segment is 2 triangles)
  SPFX.cost = function (obj) { let tris = 0, draws = 0, inst = 0;
    obj.group.traverse((o) => { if (!o.isMesh) return; draws++; const g = o.geometry, n = g.index ? g.index.count / 3 : g.attributes.position.count / 3; const k = o.isInstancedMesh ? o.count : 1; tris += n * k; if (k > 1) inst++ });
    return { tris: Math.round(tris), draws, inst };
  };
})(window);
