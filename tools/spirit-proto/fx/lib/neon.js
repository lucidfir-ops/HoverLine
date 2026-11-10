/* Spirit realm prototype, effects library, part 1: neon lines, dark cores, palettes, pieces and the beat clock.
   Plain browser script for Three.js r128. Defines window.SPFX. Every object in objects.js is a function
   (THREE, opts) -> { group, update(t, beat) } built from these parts, so Prototype 61 can lift them as they are.

   Look: bold neon lines on a pure black void. A line is a screen-facing quad (2 triangles) whose width is in world
   units, clamped to a pixel range, so near edges are bold and far ones stay visible; one draw per object. Solids get a
   near-black core with glowing contour bands (as Prism's rock), drawn before the lines. Colours come from a palette
   uniform (4 stops), so a whole object, or the whole world, changes palette by changing four uniforms. */
(function (root) {
  const SPFX = root.SPFX = root.SPFX || {};
  const THREE = root.THREE;

  // ---------- palettes (4 stops, mirrored when a coordinate runs past 1) ----------
  const PAL = SPFX.PAL = {
    goldViolet: { name: 'gold + violet', stops: ['#4b1cff', '#a640ff', '#ff9f2e', '#ffe08a'] },
    cyanMagenta: { name: 'cyan + magenta', stops: ['#18e0ff', '#3d8bff', '#c13dff', '#ff3fc4'] },
    emberWhite: { name: 'ember + white', stops: ['#ff2a0a', '#ff6a1a', '#ffb070', '#fff4e6'] },
    jade: { name: 'jade + turquoise + gold', stops: ['#0fbf7a', '#2fe0b0', '#3fd0ff', '#ffb43a'] },
    iceViolet: { name: 'ice + violet', stops: ['#e8f6ff', '#8fd8ff', '#7a5cff', '#c050ff'] },
    rainbow: { name: 'rainbow (Prism)', stops: ['#ff3a5a', '#ffd23a', '#3aff9a', '#3a8aff'] },
  };
  const c3 = (h) => new THREE.Color(h);
  SPFX.palVec = (p) => (typeof p === 'string' ? PAL[p] : p).stops.map((s) => { const c = c3(s); return new THREE.Vector3(c.r, c.g, c.b) });
  SPFX.palName = (p) => (typeof p === 'string' ? PAL[p] : p).name;
  // shared uniforms: one palette for the world (objects may carry their own), the screen size, the void's fade
  const G = SPFX.G = {
    uRes: { value: new THREE.Vector2(640, 360) },
    uFog: { value: new THREE.Vector2(250, 2400) },
    uTime: { value: 0 },
  };
  SPFX.newPal = (p) => ({ value: SPFX.palVec(p) });
  SPFX.setPal = (u, p) => { const v = SPFX.palVec(p); for (let i = 0; i < 4; i++) u.value[i].copy(v[i]) };
  SPFX.worldPal = SPFX.newPal('goldViolet');

  // ---------- shader chunks ----------
  const PALF = `uniform vec3 uPal[4];uniform float uShift;
    vec3 pal(float x){x=x+uShift;x=abs(fract(x*0.5)*2.-1.);x*=3.;float i=floor(min(x,2.999));float f=x-i;
      vec3 a=i<0.5?uPal[0]:i<1.5?uPal[1]:uPal[2];vec3 b=i<0.5?uPal[1]:i<1.5?uPal[2]:uPal[3];return mix(a,b,smoothstep(0.,1.,f));}`;
  const PIECEV = `
    #ifdef PIECES
    attribute vec3 aHome;attribute vec3 aTarget;attribute vec3 aDir;attribute vec4 aAxis;
    uniform float uExplode,uMorph,uStag,uSpin;
    vec3 rotA(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}
    float stg(float x,float r){float e=clamp(x*(1.+uStag)-r*uStag,0.,1.);return e*e*(3.-2.*e);}
    vec3 piece(vec3 lp){float r=aAxis.w;float e=stg(uExplode,r),m=stg(uMorph,r);
      vec3 c=mix(aHome,aTarget,m);float ang=uSpin*(e*(1.5+r*2.5)+sin(3.14159*m)*(1.+r*2.));
      return c+aDir*e+rotA(lp,normalize(aAxis.xyz),ang);}
    #else
    vec3 piece(vec3 lp){return lp;}
    #endif
    vec4 toView(vec3 p){vec4 w=vec4(piece(p),1.);
      #ifdef USE_INSTANCING
      w=instanceMatrix*w;
      #endif
      return modelViewMatrix*w;}`;

  const LINE_VS = `attribute vec3 pa;attribute vec3 pb;attribute float side;attribute float endp;attribute float pc;attribute float pk;
    uniform vec2 uRes,uFog;uniform float uWidth,uMinPx,uMaxPx,uSwell;
    varying vec3 vCol;varying float vS;varying float vF;
    ${PALF}${PIECEV}
    void main(){vec4 a=toView(pa),b=toView(pb);float nz=-0.35;
      if(a.z>nz&&b.z>nz){gl_Position=vec4(0.,0.,-2.,1.);return;}
      if(a.z>nz)a=mix(a,b,(a.z-nz)/(a.z-b.z));if(b.z>nz)b=mix(b,a,(b.z-nz)/(b.z-a.z));
      vec4 ca=projectionMatrix*a,cb=projectionMatrix*b;vec2 sa=ca.xy/ca.w*uRes*0.5,sb=cb.xy/cb.w*uRes*0.5;
      vec2 d=sb-sa;float l=length(d);d=l>1e-4?d/l:vec2(1.,0.);vec2 n=vec2(-d.y,d.x);
      vec4 v=endp<0.5?a:b;vec4 c=endp<0.5?ca:cb;
      float sc=length(modelMatrix[0].xyz);
      #ifdef USE_INSTANCING
      sc*=length(instanceMatrix[0].xyz);
      #endif
      float px=clamp(uWidth*sc*uSwell*projectionMatrix[1][1]*uRes.y*0.5/max(-v.z,0.1),uMinPx,uMaxPx*uSwell);
      c.xy+=(n*side+d*(endp<0.5?-1.:1.))*px*0.5/uRes*2.*c.w;gl_Position=c;
      vS=side;vF=clamp((uFog.y+v.z)/(uFog.y-uFog.x),0.,1.);vCol=pal(pc)*pk;}`;
  const LINE_FS = `uniform float uGain;varying vec3 vCol;varying float vS;varying float vF;
    void main(){float e=1.-abs(vS);float a=smoothstep(0.,0.4,e);gl_FragColor=vec4(vCol*uGain*vF*a*(0.85+0.6*e*e),1.);}`;

  // a material for neon lines; o: width (world m), minPx, maxPx, gain, pieces (bool), pal (uniform), shift
  SPFX.lineMat = function (o = {}) {
    const u = { uRes: G.uRes, uFog: o.fog ? { value: new THREE.Vector2(o.fog[0], o.fog[1]) } : G.uFog, uPal: o.pal || SPFX.worldPal, uShift: { value: o.shift || 0 },
      uWidth: { value: o.width == null ? 0.12 : o.width }, uMinPx: { value: o.minPx || 1.9 }, uMaxPx: { value: o.maxPx || 7 },
      uSwell: { value: 1 }, uGain: { value: o.gain == null ? 1 : o.gain },
      uExplode: { value: 0 }, uMorph: { value: 0 }, uStag: { value: o.stag == null ? 0.6 : o.stag }, uSpin: { value: o.spin == null ? 1 : o.spin } };
    const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, defines: o.pieces ? { PIECES: 1 } : {} });
    return m;
  };

  const CORE_VS = `attribute float pc;uniform vec2 uFog;varying float vF;varying float vY;varying float vPc;
    ${PIECEV}
    void main(){vec4 v=toView(position);vY=position.y;vPc=pc;vF=clamp((uFog.y+v.z)/(uFog.y-uFog.x),0.,1.);gl_Position=projectionMatrix*v;}`;
  const CORE_FS = `uniform vec3 uCore;uniform float uCs,uCa,uCy,uOpacity,uGain;${PALF}varying float vF;varying float vY;varying float vPc;
    void main(){vec3 col=uCore;
      if(uCa>0.){float y=vY/uCs;float w=fwidth(y)*1.2;float f=abs(fract(y)-0.5);float band=1.-smoothstep(0.5-w*1.5,0.5-w*0.2,f);
        band=max(band,0.);col+=pal(vPc+vY*uCy)*band*uCa*uGain;}
      gl_FragColor=vec4(col*vF,uOpacity);}`;
  // dark core with contour bands: cs metres between bands (local y), ca strength (0 = plain), cy palette per metre
  SPFX.coreMat = function (o = {}) {
    const u = { uFog: o.fog ? { value: new THREE.Vector2(o.fog[0], o.fog[1]) } : G.uFog, uPal: o.pal || SPFX.worldPal, uShift: { value: o.shift || 0 }, uCore: { value: c3(o.core || '#06050b') },
      uCs: { value: o.cs || 2 }, uCa: { value: o.ca == null ? 0.55 : o.ca }, uCy: { value: o.cy == null ? 0.02 : o.cy }, uOpacity: { value: o.opacity == null ? 1 : o.opacity },
      uGain: { value: 1 }, uExplode: { value: 0 }, uMorph: { value: 0 }, uStag: { value: o.stag == null ? 0.6 : o.stag }, uSpin: { value: o.spin == null ? 1 : o.spin } };
    const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: CORE_VS, fragmentShader: CORE_FS, extensions: { derivatives: true },
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2, transparent: (o.opacity != null && o.opacity < 1), depthWrite: !(o.opacity != null && o.opacity < 1),
      side: o.side || THREE.FrontSide, defines: o.pieces ? { PIECES: 1 } : {} });
    return m;
  };
  // share the per-piece uniforms of a line and a core material, so one set drives both
  SPFX.linkPieces = (a, b) => { for (const k of ['uExplode', 'uMorph', 'uStag', 'uSpin']) b.uniforms[k] = a.uniforms[k] };

  // ---------- builders ----------
  const V = (p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2]));
  /* Line builder. seg(a, b, pc, pk, piece): pc palette coordinate (number or function of the point), pk brightness.
     piece: {home, target, dir, axis, r} for the piece effects (24, 25, 32); a and b are then relative to home. */
  SPFX.Lines = function () {
    const A = { pa: [], pb: [], side: [], endp: [], pc: [], pk: [], aHome: [], aTarget: [], aDir: [], aAxis: [] }, idx = []; let n = 0, pieces = false;
    const api = {
      seg(a, b, pc = 0, pk = 1, pi) { a = V(a); b = V(b); const ca = typeof pc === 'function' ? pc(a) : pc, cb = typeof pc === 'function' ? pc(b) : pc;
        for (let k = 0; k < 4; k++) { const e = k >> 1, s = k & 1 ? 1 : -1;
          A.pa.push(a.x, a.y, a.z); A.pb.push(b.x, b.y, b.z); A.side.push(s); A.endp.push(e); A.pc.push(e ? cb : ca); A.pk.push(pk);
          if (pi) { pieces = true; const h = pi.home, t = pi.target || pi.home, d = pi.dir || [0, 0, 0], x = pi.axis || [0, 1, 0];
            A.aHome.push(h[0], h[1], h[2]); A.aTarget.push(t[0], t[1], t[2]); A.aDir.push(d[0], d[1], d[2]); A.aAxis.push(x[0], x[1], x[2], pi.r || 0) }
          else { A.aHome.push(0, 0, 0); A.aTarget.push(0, 0, 0); A.aDir.push(0, 0, 0); A.aAxis.push(0, 1, 0, 0) } }
        idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); n += 4; return api },
      poly(pts, closed, pc = 0, pk = 1, pi) { for (let i = 0; i < pts.length - 1; i++) api.seg(pts[i], pts[i + 1], pc, pk, pi); if (closed && pts.length > 2) api.seg(pts[pts.length - 1], pts[0], pc, pk, pi); return api },
      edges(geom, pc = 0, pk = 1, pi, mtx) { const e = new THREE.EdgesGeometry(geom, 1), p = e.attributes.position; const a = new THREE.Vector3(), b = new THREE.Vector3();
        for (let i = 0; i < p.count; i += 2) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); if (mtx) { a.applyMatrix4(mtx); b.applyMatrix4(mtx) } api.seg(a.clone(), b.clone(), pc, pk, pi) } e.dispose(); return api },
      get count() { return n / 4 },
      geometry() { const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(A.pa, 3));
        g.setAttribute('pa', new THREE.Float32BufferAttribute(A.pa, 3)); g.setAttribute('pb', new THREE.Float32BufferAttribute(A.pb, 3));
        g.setAttribute('side', new THREE.Float32BufferAttribute(A.side, 1)); g.setAttribute('endp', new THREE.Float32BufferAttribute(A.endp, 1));
        g.setAttribute('pc', new THREE.Float32BufferAttribute(A.pc, 1)); g.setAttribute('pk', new THREE.Float32BufferAttribute(A.pk, 1));
        if (pieces) { g.setAttribute('aHome', new THREE.Float32BufferAttribute(A.aHome, 3)); g.setAttribute('aTarget', new THREE.Float32BufferAttribute(A.aTarget, 3));
          g.setAttribute('aDir', new THREE.Float32BufferAttribute(A.aDir, 3)); g.setAttribute('aAxis', new THREE.Float32BufferAttribute(A.aAxis, 4)) }
        g.setIndex(idx); return g },
      mesh(mat) { const m = new THREE.Mesh(api.geometry(), mat); m.frustumCulled = false; m.renderOrder = 2; return m },
    };
    return api;
  };
  /* Core builder: adds triangles of geometries (with optional matrix and piece data) into one mesh. */
  SPFX.Cores = function () {
    const P = [], PC = [], H = [], T = [], D = [], X = []; let pieces = false;
    const api = {
      add(geom, mtx, pc = 0, pi) { const g = geom.index ? geom.toNonIndexed() : geom, p = g.attributes.position, v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (mtx) v.applyMatrix4(mtx); P.push(v.x, v.y, v.z); PC.push(typeof pc === 'function' ? pc(v) : pc);
          if (pi) { pieces = true; const h = pi.home, t = pi.target || pi.home, d = pi.dir || [0, 0, 0], x = pi.axis || [0, 1, 0]; H.push(h[0], h[1], h[2]); T.push(t[0], t[1], t[2]); D.push(d[0], d[1], d[2]); X.push(x[0], x[1], x[2], pi.r || 0) }
          else { H.push(0, 0, 0); T.push(0, 0, 0); D.push(0, 0, 0); X.push(0, 1, 0, 0) } }
        return api },
      mesh(mat) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('pc', new THREE.Float32BufferAttribute(PC, 1));
        if (pieces) { g.setAttribute('aHome', new THREE.Float32BufferAttribute(H, 3)); g.setAttribute('aTarget', new THREE.Float32BufferAttribute(T, 3)); g.setAttribute('aDir', new THREE.Float32BufferAttribute(D, 3)); g.setAttribute('aAxis', new THREE.Float32BufferAttribute(X, 4)) }
        const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 1; return m },
      get tris() { return P.length / 9 },
    };
    return api;
  };
  /* A solid as one object: core + edges, sharing a palette. geom: a Three geometry. o: line and core options. */
  SPFX.solid = function (geom, o = {}) {
    const g = new THREE.Group(), lm = SPFX.lineMat(o), cm = SPFX.coreMat({ ...o, pal: lm.uniforms.uPal });
    const bb = new THREE.Box3().setFromBufferAttribute(geom.attributes.position), h = Math.max(0.001, bb.max.y - bb.min.y);
    const pcf = o.pcf || ((v) => (o.pc0 || 0) + (v.y - bb.min.y) / h * (o.pcSpan == null ? 1 : o.pcSpan));
    if (o.core !== false) g.add(SPFX.Cores().add(geom, null, pcf).mesh(cm));
    g.add(SPFX.Lines().edges(geom, pcf, o.pk || 1).mesh(lm));
    g.userData = { lm, cm }; return g;
  };

  // ---------- small maths ----------
  SPFX.rng = function (s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } };
  SPFX.ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) };
  SPFX.easeIO = (x) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 };
  SPFX.circle = (r, n, y = 0, a0 = 0) => Array.from({ length: n }, (_, i) => new THREE.Vector3(r * Math.cos(a0 + i * 2 * Math.PI / n), y, r * Math.sin(a0 + i * 2 * Math.PI / n)));
  SPFX.circleXY = (r, n, a0 = 0, cx = 0, cy = 0) => Array.from({ length: n }, (_, i) => new THREE.Vector3(cx + r * Math.cos(a0 + i * 2 * Math.PI / n), cy + r * Math.sin(a0 + i * 2 * Math.PI / n), 0));

  /* ---------- the beat clock (58) ----------
     140 bpm, 4/4, a drop every 8 bars (bar 0 of each 8 is the drop). beat(t) gives:
       b (beats, float), k (kick: 1 on each beat, decays in a quarter beat), bar, bb (beat in bar 0..3),
       bars (bar in the 8-bar phrase 0..7), drop (1 at the drop, decays over 2 bars), build (0..1 over the 2 bars before
       the drop), breath (a slow sine, one cycle per 2 bars), step (whole beats, for stepped motion), dropN (drops so far). */
  SPFX.Beat = function (bpm = 140, barsPerDrop = 8) {
    const spb = 60 / bpm;
    return function (t) {
      const b = t / spb, bi = Math.floor(b), ph = b - bi, bar = Math.floor(bi / 4), bars = ((bar % barsPerDrop) + barsPerDrop) % barsPerDrop;
      const dropN = Math.floor(bar / barsPerDrop), tDrop = (b - dropN * barsPerDrop * 4) * spb; // seconds since the last drop
      const toDrop = (barsPerDrop * 4 - (b - dropN * barsPerDrop * 4)) * spb;
      return { t, bpm, spb, b, step: bi, ph, k: Math.exp(-ph * 5.5), bar, bb: ((bi % 4) + 4) % 4, bars, dropN,
        drop: t >= 0 ? Math.exp(-tDrop / (spb * 4)) : 0, tDrop, toDrop,
        build: Math.max(0, 1 - toDrop / (spb * 8)), breath: Math.sin(2 * Math.PI * b / 8) };
    };
  };
})(window);
