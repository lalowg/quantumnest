/* QUANTUMNEST — crystalline sculpture (Three.js)
   One instanced crystal field that re-forms into five "plates":
   qubit, superposition, entanglement, interference, error correction.
   Illustrative visualisation only — not a quantum simulation. */
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();

function fibSphere(count, r) {
  const pts = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = ga * i;
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r));
  }
  return pts;
}

function makeBuf(N) {
  return {
    p: Array.from({ length: N }, () => new THREE.Vector3()),
    q: Array.from({ length: N }, () => new THREE.Quaternion()),
    s: new Float32Array(N),
    g: new Float32Array(N),
  };
}

function hideFrom(b, start, N) {
  for (let i = start; i < N; i++) { b.p[i].set(0, 0, 0); b.q[i].identity(); b.s[i] = 0; b.g[i] = 0; }
}

/* ---------- Plate I · Qubit: a crystal Bloch sphere with a precessing state vector ---------- */
function plateQubit(N) {
  const V = 14, NP = V, SP = V + 1, start = V + 2;
  const shell = fibSphere(N - start, 1.55);
  const dir = new THREE.Vector3();
  return {
    anchors: [NP, V - 1, SP],
    layout(t, b) {
      const th = 0.95 + 0.14 * Math.sin(t * 0.5), ph = t * 0.42;
      dir.set(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      _q.setFromUnitVectors(UP, dir);
      for (let i = 0; i < V; i++) {
        const f = (i + 1) / V;
        b.p[i].copy(dir).multiplyScalar(f * 1.55);
        b.q[i].copy(_q);
        b.s[i] = i === V - 1 ? 0.17 : 0.045 + 0.03 * f;
        b.g[i] = i === V - 1 ? 1 : 0.12 * f;
      }
      b.p[NP].set(0, 1.8, 0); b.q[NP].identity(); b.s[NP] = 0.13; b.g[NP] = 0.05;
      b.p[SP].set(0, -1.8, 0); b.q[SP].identity(); b.s[SP] = 0.13; b.g[SP] = 0.05;
      for (let k = 0; k < shell.length; k++) {
        const i = start + k, n = shell[k];
        b.p[i].copy(n);
        b.q[i].setFromUnitVectors(UP, _v.copy(n).normalize());
        const eq = Math.abs(n.y) < 0.1;
        b.s[i] = (eq ? 0.058 : 0.034) + 0.012 * (0.5 + 0.5 * Math.sin(t * 1.3 + k * 1.7));
        b.g[i] = eq ? 0.35 : 0;
      }
    },
  };
}

/* ---------- Plate II · Superposition: two shells whose amplitudes trade places ---------- */
function plateSuperposition(N) {
  const nA = Math.floor(N * 0.46), nB = N - nA;
  const A = fibSphere(nA, 1), B = fibSphere(nB, 1);
  const tiltA = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.45, 0, 0.3));
  const tiltB = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, -0.35));
  const rot = new THREE.Quaternion();
  const below = new THREE.Vector3(0, -2.08, 0);
  return {
    anchors: [Math.floor(nA * 0.18), nA + Math.floor(nB * 0.5), below],
    layout(t, b) {
      const th = Math.PI / 4 + 0.55 * Math.sin(t * 0.6);
      const a2 = Math.cos(th) ** 2, b2 = Math.sin(th) ** 2;
      rot.setFromAxisAngle(UP, t * 0.35); _q2.copy(tiltA).multiply(rot);
      for (let k = 0; k < nA; k++) {
        const p = b.p[k].copy(A[k]).applyQuaternion(_q2);
        b.q[k].setFromUnitVectors(UP, _v.copy(p).normalize());
        p.multiplyScalar(1.12);
        b.s[k] = 0.024 + 0.085 * a2 * (0.85 + 0.15 * Math.sin(k * 2.3 + t));
        b.g[k] = 0.04;
      }
      rot.setFromAxisAngle(UP, -t * 0.28); _q2.copy(tiltB).multiply(rot);
      for (let k = 0; k < nB; k++) {
        const i = nA + k;
        const p = b.p[i].copy(B[k]).applyQuaternion(_q2);
        b.q[i].setFromUnitVectors(UP, _v.copy(p).normalize());
        p.multiplyScalar(1.72);
        b.s[i] = 0.022 + 0.07 * b2 * (0.85 + 0.15 * Math.sin(k * 1.9 - t));
        b.g[i] = 0.72;
      }
    },
  };
}

/* ---------- Plate III · Entanglement: two clusters with anti-correlated spins and a helix ---------- */
function plateEntanglement(N) {
  const K = Math.floor(N * 0.3), H = N - 2 * K;
  const S = fibSphere(K - 1, 0.66);
  const cA = new THREE.Vector3(-1.5, 0, 0), cB = new THREE.Vector3(1.5, 0, 0);
  const rotA = new THREE.Quaternion(), rotB = new THREE.Quaternion();
  const d = new THREE.Vector3();
  const axisX = new THREE.Vector3(1, 0, 0);
  return {
    anchors: [0, K, 2 * K + Math.floor(H / 2)],
    layout(t, b) {
      const a = t * 0.8;
      rotA.setFromAxisAngle(UP, a);
      rotB.setFromAxisAngle(UP, -a);
      d.set(Math.sin(t * 0.7) * 0.85, Math.cos(t * 0.7), 0.25).normalize();
      // spin crystals (anti-correlated)
      b.p[0].copy(cA); b.q[0].setFromUnitVectors(UP, d); b.s[0] = 0.17; b.g[0] = 0.95;
      b.p[K].copy(cB); b.q[K].setFromUnitVectors(UP, _v.copy(d).negate()); b.s[K] = 0.17; b.g[K] = 0.95;
      for (let k = 0; k < K - 1; k++) {
        const n = S[k];
        const iA = 1 + k, iB = K + 1 + k;
        b.p[iA].copy(n).applyQuaternion(rotA).add(cA);
        b.q[iA].setFromUnitVectors(UP, _v.copy(n).normalize()).premultiply(rotA);
        b.p[iB].copy(n).applyQuaternion(rotB).add(cB);
        b.q[iB].setFromUnitVectors(UP, _v.copy(n).normalize()).premultiply(rotB);
        const tw = 0.032 + 0.01 * Math.sin(t * 1.5 + k);
        b.s[iA] = tw; b.s[iB] = tw; b.g[iA] = 0.04; b.g[iB] = 0.04;
      }
      _q.setFromUnitVectors(UP, axisX);
      for (let j = 0; j < H; j++) {
        const i = 2 * K + j;
        const f = j / Math.max(1, H - 1), strand = j % 2;
        const ang = f * TAU * 2.2 + t * 1.2 + strand * Math.PI;
        b.p[i].set(-0.86 + 1.72 * f, 0.3 * Math.cos(ang), 0.3 * Math.sin(ang));
        b.q[i].copy(_q);
        const bell = Math.sin(Math.PI * f);
        b.s[i] = 0.026 + 0.022 * bell;
        b.g[i] = 0.55 * bell * bell;
      }
    },
  };
}

/* ---------- Plate IV · Interference: a field of crystals riding two overlapping waves ---------- */
function plateInterference(N) {
  const G = N >= 256 ? 15 : 11;
  const grid = G * G, S1 = grid, S2 = grid + 1;
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.62, 0, 0));
  const span = 3.7, k = 6.2;
  const s1 = new THREE.Vector3(-0.55, 0, -2.35), s2 = new THREE.Vector3(0.55, 0, -2.35);
  const gx0 = Math.floor(G / 2), gz0 = G - 3;
  return {
    anchors: [S1, S2, gz0 * G + gx0],
    layout(t, b) {
      for (let gz = 0; gz < G; gz++) {
        for (let gx = 0; gx < G; gx++) {
          const i = gz * G + gx;
          const x = -span / 2 + (span * gx) / (G - 1);
          const z = -span / 2 + (span * gz) / (G - 1) + 0.35;
          const r1 = Math.hypot(x - s1.x, z - s1.z), r2 = Math.hypot(x - s2.x, z - s2.z);
          const env = Math.abs(Math.cos((k * (r1 - r2)) / 2));
          const h = 0.5 * (Math.sin(k * r1 - t * 2.2) + Math.sin(k * r2 - t * 2.2));
          b.p[i].set(x, 0.42 * h, z).applyQuaternion(tilt);
          b.q[i].copy(tilt);
          b.s[i] = 0.018 + 0.075 * env * env;
          b.g[i] = Math.pow(env, 6) * 0.8;
        }
      }
      b.p[S1].copy(s1).applyQuaternion(tilt); b.q[S1].copy(tilt); b.s[S1] = 0.15; b.g[S1] = 1;
      b.p[S2].copy(s2).applyQuaternion(tilt); b.q[S2].copy(tilt); b.s[S2] = 0.15; b.g[S2] = 1;
      hideFrom(b, grid + 2, b.s.length);
    },
  };
}

/* ---------- Plate V · Error correction: a surface-code lattice that catches and repairs a flip ---------- */
function plateCorrection(N) {
  const D = 5, sp = 0.62, DATA = D * D, ANC = 16;
  const ringStart = DATA + ANC, ringN = Math.min(N - ringStart, 96);
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.82, 0, 0));
  const ancQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 4, Math.PI / 2));
  const flip = new THREE.Quaternion();
  const axisX = new THREE.Vector3(1, 0, 0);
  const state = { err: 12 };
  return {
    anchors: [0, DATA + 6, () => state.err],
    layout(t, b) {
      const P = 3.6, cyc = Math.floor(t / P), u = t / P - cyc;
      const e = Math.floor(hash(cyc + 3) * DATA) % DATA;
      state.err = e;
      const er = Math.floor(e / D), ec = e % D;
      const flipAmt = smooth(0, 0.25, u) * (1 - smooth(0.62, 0.88, u));
      const synd = smooth(0.22, 0.42, u) * (1 - smooth(0.7, 0.95, u));
      for (let r = 0; r < D; r++) {
        for (let c = 0; c < D; c++) {
          const i = r * D + c;
          b.p[i].set((c - 2) * sp, 0, (r - 2) * sp).applyQuaternion(tilt);
          if (i === e) {
            flip.setFromAxisAngle(axisX, Math.PI * flipAmt);
            b.q[i].copy(tilt).multiply(flip);
            b.g[i] = flipAmt;
            b.s[i] = 0.11 + 0.03 * flipAmt;
          } else {
            b.q[i].copy(tilt); b.g[i] = 0; b.s[i] = 0.105;
          }
        }
      }
      for (let ai = 0; ai < 4; ai++) {
        for (let aj = 0; aj < 4; aj++) {
          const i = DATA + ai * 4 + aj;
          b.p[i].set((aj - 1.5) * sp, 0, (ai - 1.5) * sp).applyQuaternion(tilt);
          b.q[i].copy(tilt).multiply(ancQ);
          const adj = (ai === er || ai === er - 1) && (aj === ec || aj === ec - 1);
          b.g[i] = 0.12 + (adj ? 0.88 * synd : 0);
          b.s[i] = 0.05 + (adj ? 0.02 * synd : 0);
        }
      }
      for (let j = 0; j < ringN; j++) {
        const i = ringStart + j;
        const a = (j / ringN) * TAU + t * 0.15;
        _v.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
        b.p[i].copy(_v).applyQuaternion(tilt);
        _v2.set(-Math.sin(a), 0, Math.cos(a));
        b.q[i].setFromUnitVectors(UP, _v2).premultiply(tilt);
        b.s[i] = 0.03 + 0.008 * Math.sin(j * 1.3 + t * 2);
        b.g[i] = 0.18;
      }
      hideFrom(b, ringStart + ringN, b.s.length);
    },
  };
}

/* ---------- Orbit hairlines: per-plate targets ---------- */
const E = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
const ORBIT_TARGETS = [
  // qubit: Bloch-sphere wireframe
  [
    { pos: [0, 0, 0], q: E(Math.PI / 2, 0, 0), s: 0.74, o: 0.55 },
    { pos: [0, 0, 0], q: E(0, 0, 0), s: 0.68, o: 0.4 },
    { pos: [0, 0, 0], q: E(0, Math.PI / 2, 0), s: 0.8, o: 0.4 },
  ],
  // superposition: two rings tilted like the shells
  [
    { pos: [0, 0, 0], q: E(0.45 + Math.PI / 2, 0, 0.3), s: 0.52, o: 0.45 },
    { pos: [0, 0, 0], q: E(-0.5 + Math.PI / 2, 0, -0.35), s: 0.82, o: 0.5 },
    { pos: [0, 0, 0], q: E(0.2, 0.9, 0), s: 1.12, o: 0.18 },
  ],
  // entanglement: one orbit around each cluster, a long one around both
  [
    { pos: [-1.5, 0, 0], q: E(Math.PI / 2 - 0.3, 0, 0.2), s: 0.38, o: 0.55 },
    { pos: [1.5, 0, 0], q: E(Math.PI / 2 + 0.3, 0, -0.2), s: 0.38, o: 0.55 },
    { pos: [0, 0, 0], q: E(Math.PI / 2, 0, 0), s: 1.06, o: 0.22 },
  ],
  // interference: wavefront rings lying in the field plane
  [
    { pos: [-0.55, 1.37, -1.91], q: E(0.62 + Math.PI / 2, 0, 0), s: 0.36, o: 0.45 },
    { pos: [0.55, 1.37, -1.91], q: E(0.62 + Math.PI / 2, 0, 0), s: 0.62, o: 0.35 },
    { pos: [0, -0.2, 0.29], q: E(0.62 + Math.PI / 2, 0, 0), s: 1.0, o: 0.2 },
  ],
  // error correction: the logical ring plus two quiet meridians
  [
    { pos: [0, 0, 0], q: E(0.82 + Math.PI / 2, 0, 0), s: 1.0, o: 0.55 },
    { pos: [0, 0, 0], q: E(0.82, 0, 0), s: 0.84, o: 0.16 },
    { pos: [0, 0, 0], q: E(0.82, Math.PI / 2, 0), s: 0.84, o: 0.16 },
  ],
];

const VERT = /* glsl */`
attribute float aGlow;
varying vec3 vN;
varying vec3 vV;
varying float vGlow;
void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 mv = modelViewMatrix * p;
  vN = normalize(normalMatrix * n);
  vV = normalize(-mv.xyz);
  vGlow = aGlow;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */`
uniform vec3 uIce;
uniform vec3 uFrost;
uniform vec3 uGold;
uniform vec3 uDeep;
uniform float uPulse;
uniform float uTime;
varying vec3 vN;
varying vec3 vV;
varying float vGlow;
void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndv = abs(dot(n, vV));
  float fres = pow(1.0 - ndv, 2.2);
  vec3 L = normalize(vec3(0.45, 0.85, 0.6));
  float facet = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vV), 0.0), 26.0);
  float ir = dot(n, vec3(0.3, 0.5, 0.8));
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (ir * 0.65 + vec3(0.0, 0.1, 0.2) + uTime * 0.02));
  vec3 base = mix(uDeep, uIce, 0.2 + 0.6 * facet);
  vec3 col = base * 0.5 + uIce * fres * 1.15 + uFrost * spec * 0.95 + irid * fres * (0.16 + uPulse * 0.5);
  col = mix(col, uGold * (0.55 + fres * 1.1 + spec), clamp(vGlow, 0.0, 1.0) * 0.85);
  float a = 0.3 + 0.62 * fres + spec * 0.5;
  gl_FragColor = vec4(col, a);
}`;

export function createSculpture(canvas, opts = {}) {
  const reduced = !!opts.reduced;
  const small = !!opts.small;
  const onFrame = opts.onFrame || (() => {});
  const onLost = opts.onLost || (() => {});

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 0.2, 10);

  const root = new THREE.Group();
  scene.add(root);
  const spin = new THREE.Group();
  root.add(spin);

  const N = small ? 144 : 256;
  const geo = new THREE.OctahedronGeometry(1, 0);
  const glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
  glow.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aGlow', glow);

  const uniforms = {
    uIce: { value: new THREE.Color('#9FB8FF') },
    uFrost: { value: new THREE.Color('#EAF2FF') },
    uGold: { value: new THREE.Color('#C8A96A') },
    uDeep: { value: new THREE.Color('#122050') },
    uPulse: { value: 0 },
    uTime: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  spin.add(mesh);

  // gold hairline orbits
  const gold = new THREE.Color('#C8A96A');
  const orbits = [2.25, 2.4, 2.05].map((r, k) => {
    const pts = new THREE.EllipseCurve(0, 0, r, k === 1 ? r * 0.94 : r).getPoints(200).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.4, depthWrite: false }));
    line.userData.r = r;
    spin.add(line);
    return line;
  });
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), new THREE.MeshBasicMaterial({ color: 0xEAF2FF }));
  orbits[0].add(bead);

  // plinth — stays still while the sculpture turns
  const plinth = new THREE.Group();
  const ringPts = new THREE.EllipseCurve(0, 0, 1.35, 1.35).getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y));
  plinth.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts),
    new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.32 })));
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU, l = i % 6 === 0 ? 0.16 : 0.07;
    ticks.push(new THREE.Vector3(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35), new THREE.Vector3(Math.cos(a) * (1.35 + l), 0, Math.sin(a) * (1.35 + l)));
  }
  plinth.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks),
    new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.28 })));
  plinth.position.y = -2.5;
  root.add(plinth);

  // dust of distant points
  const starN = small ? 220 : 420;
  const sp = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) {
    const r = 12 + hash(i) * 14, th = hash(i + 9) * TAU, ph = Math.acos(2 * hash(i + 17) - 1);
    sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.cos(ph); sp[i * 3 + 2] = -Math.abs(r * Math.sin(ph) * Math.sin(th));
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xEAF2FF, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(stars);

  const plates = [plateQubit(N), plateSuperposition(N), plateEntanglement(N), plateInterference(N), plateCorrection(N)];
  const A = makeBuf(N), B = makeBuf(N);
  const curP = Array.from({ length: N }, () => new THREE.Vector3());

  let cur = opts.start || 0, prev = cur, morphStart = -100;
  const MORPH = reduced ? 0 : 1.7;
  let clockT = reduced ? 2.4 : 0;
  let paused = !!opts.paused;
  let yaw = 0.35, yawVel = 0, pitch = 0.08, pitchTarget = 0.08;
  let dragging = false, lastX = 0, lastY = 0, lastMoveT = 0;
  let inView = true, pageVisible = !document.hidden, raf = 0, last = performance.now(), activeUntil = 0;
  let W = 1, Hh = 1;
  let lost = false;

  function snapOrbits() {
    const tg = ORBIT_TARGETS[cur];
    orbits.forEach((o, k) => { o.position.fromArray(tg[k].pos); o.quaternion.copy(tg[k].q); o.scale.setScalar(tg[k].s); o.material.opacity = tg[k].o; });
  }
  snapOrbits();

  function compose(t) {
    plates[cur].layout(t, B);
    const sinceMorph = t - morphStart;
    const morphing = MORPH > 0 && sinceMorph < MORPH + 0.6;
    if (morphing) plates[prev].layout(t, A);
    for (let i = 0; i < N; i++) {
      let s, g;
      const p = curP[i];
      if (morphing) {
        const d = hash(i * 3.1) * 0.55;
        const u = easeIO(clamp01((sinceMorph - d) / 1.1));
        p.lerpVectors(A.p[i], B.p[i], u);
        const bloom = Math.sin(Math.PI * u);
        p.multiplyScalar(1 + 0.22 * bloom);
        _q.slerpQuaternions(A.q[i], B.q[i], u);
        s = A.s[i] + (B.s[i] - A.s[i]) * u;
        g = A.g[i] + (B.g[i] - A.g[i]) * u + 0.25 * bloom;
      } else {
        p.copy(B.p[i]); _q.copy(B.q[i]); s = B.s[i]; g = B.g[i];
      }
      _m.compose(p, _q, _s.set(s, s * 1.9, s));
      mesh.setMatrixAt(i, _m);
      glow.array[i] = g;
    }
    mesh.instanceMatrix.needsUpdate = true;
    glow.needsUpdate = true;
    uniforms.uPulse.value = morphing ? Math.sin(Math.PI * clamp01(sinceMorph / MORPH)) : 0;
  }

  function updateOrbits(dt, t) {
    const tg = ORBIT_TARGETS[cur];
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.6);
    orbits.forEach((o, j) => {
      _v.fromArray(tg[j].pos);
      o.position.lerp(_v, k);
      o.quaternion.slerp(tg[j].q, k);
      const s = o.scale.x + (tg[j].s - o.scale.x) * k;
      o.scale.setScalar(s);
      o.material.opacity += (tg[j].o - o.material.opacity) * k;
    });
    const r = orbits[0].userData.r, a = t * 0.9;
    bead.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
  }

  const anchorOut = [{ x: 0, y: 0, ok: false }, { x: 0, y: 0, ok: false }, { x: 0, y: 0, ok: false }];
  function projectAnchors() {
    spin.updateMatrixWorld();
    const list = plates[cur].anchors;
    for (let k = 0; k < 3; k++) {
      let a = list[k];
      if (typeof a === 'function') a = a();
      if (typeof a === 'number') _v.copy(curP[a]); else _v.copy(a);
      _v.applyMatrix4(spin.matrixWorld).project(camera);
      anchorOut[k].x = (_v.x * 0.5 + 0.5) * W;
      anchorOut[k].y = (1 - (_v.y * 0.5 + 0.5)) * Hh;
      anchorOut[k].ok = _v.z < 1;
    }
    return anchorOut;
  }

  function render(dt) {
    if (!reduced) clockT += dt;
    uniforms.uTime.value = clockT;
    if (!dragging) {
      if (!reduced && !paused) yaw += 0.13 * dt;
      yaw += yawVel * dt;
      yawVel *= Math.exp(-dt * 3.2);
      if (Math.abs(yawVel) < 0.001) yawVel = 0;
      pitchTarget *= Math.exp(-dt * 0.6);
    }
    pitch += (pitchTarget - pitch) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
    spin.rotation.set(pitch, yaw, 0);
    stars.rotation.y = yaw * 0.08;
    compose(clockT);
    updateOrbits(dt, clockT);
    renderer.render(scene, camera);
    onFrame(projectAnchors());
  }

  function loop(now) {
    raf = 0;
    if (lost) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    render(dt);
    const needMore = reduced ? (now < activeUntil || dragging || yawVel !== 0) : (inView && pageVisible);
    if (needMore) raf = requestAnimationFrame(loop);
  }
  function kick(ms = 700) {
    activeUntil = Math.max(activeUntil, performance.now() + ms);
    if (!raf && !lost) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function resize() {
    W = Math.max(1, canvas.clientWidth);
    Hh = Math.max(1, canvas.clientHeight);
    renderer.setSize(W, Hh, false);
    camera.aspect = W / Hh;
    const R = 2.55;
    const wide = W / Hh > 1.2;
    // on wide screens the sculpture sits between the header and the plate rail
    const topInset = wide ? 96 : 0, bottomInset = wide ? 250 : 0;
    const rpx = wide ? Math.min(W * 0.235, (Hh - topInset - bottomInset) * 0.56) : Math.min(W, Hh) * 0.46;
    const halfH = (R * (Hh / 2)) / Math.max(60, rpx);
    camera.position.z = halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.y = wide ? 0.15 : 0.1;
    if (wide) camera.setViewOffset(W, Hh, 0, (bottomInset - topInset) / 2, W, Hh);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    kick(100);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // pointer: drag to turn (horizontal) and tilt (vertical, mouse/pen only)
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; lastMoveT = performance.now();
    yawVel = 0;
    canvas.setPointerCapture?.(e.pointerId);
    canvas.classList.add('is-dragging');
    kick(400);
  }
  function onMove(e) {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    const dt = Math.max(0.008, (now - lastMoveT) / 1000);
    yaw += dx * 0.008;
    yawVel = (dx * 0.008) / dt * 0.6;
    if (e.pointerType !== 'touch') pitchTarget = Math.max(-0.55, Math.min(0.55, pitchTarget + dy * 0.004));
    lastX = e.clientX; lastY = e.clientY; lastMoveT = now;
    kick(400);
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    canvas.classList.remove('is-dragging');
    if (performance.now() - lastMoveT > 90) yawVel = 0;
    kick(1500);
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) kick(200);
  }, { threshold: 0 });
  io.observe(canvas);
  const onVis = () => { pageVisible = !document.hidden; if (pageVisible) kick(200); };
  document.addEventListener('visibilitychange', onVis);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    onLost();
  });

  kick(800);

  return {
    count: N,
    setConcept(i) {
      if (i === cur) return;
      prev = cur; cur = i; morphStart = clockT;
      if (reduced) snapOrbits();
      kick(MORPH * 1000 + 900);
    },
    setPaused(v) { paused = !!v; kick(300); },
    nudge(dir) {
      if (reduced) { yaw += dir * 0.52; kick(300); }
      else { yawVel += dir * 2.4; kick(1200); }
    },
    refresh() { kick(200); },
    dispose() {
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
    },
  };
}
