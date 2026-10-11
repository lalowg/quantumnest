/* QUANTUMNEST — main: header, plate explorer, annotations, reveals.
   The sculpture (Three.js) and the bench load as separate modules. */
import { initBench } from './bench.js';
import { initSections } from './sections.js';

const doc = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mqMobile = window.matchMedia('(max-width: 960px)');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
window.qnReady = true;

/* ---------------- plate data ---------------- */
const curve = (fn, x0, x1, n) => {
  let d = '';
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${fn(x).toFixed(1)} `; }
  return d;
};

const PLATES = [
  {
    title: 'A bit that can point <em>anywhere</em>',
    body: 'A classical bit is a switch: 0 or 1. A qubit is described by a direction. Its poles are the familiar 0 and 1; every other point on the sphere is a blend of the two, with a phase that says how the blend is turned.',
    cap: 'Fig. 1 — The Bloch sphere. Every pure qubit state is a point on its surface.',
    callouts: [['|0⟩', 'The north pole: the classical zero.'], ['|ψ⟩', 'The state vector. Any point on the sphere is a valid state.'], ['|1⟩', 'The south pole: the classical one.']],
    fb: [[300, 90], [511, 196], [300, 470]],
    fig: () => `
      <circle class="dr" pathLength="1" cx="78" cy="75" r="56" stroke="#9FB8FF" stroke-width=".9"/>
      <ellipse class="dr" pathLength="1" cx="78" cy="75" rx="56" ry="15" stroke="#9FB8FF" stroke-width=".7" style="--d:.2s"/>
      <path class="dr" pathLength="1" d="M78 14 V136" stroke="#EAF2FF" stroke-width=".6" stroke-dasharray="1" style="--d:.35s"/>
      <path class="dr" pathLength="1" d="M78 75 L112 38" stroke="#C8A96A" stroke-width="1.4" style="--d:.7s"/>
      <path class="dr" pathLength="1" d="M78 52 A23 23 0 0 1 94 58" stroke="#C8A96A" stroke-width=".7" style="--d:1s"/>
      <g class="fade" style="--d:1.1s"><circle cx="112" cy="38" r="3.5" fill="#C8A96A"/><circle cx="78" cy="19" r="2" fill="#EAF2FF"/><circle cx="78" cy="131" r="2" fill="#EAF2FF"/>
      <text x="84" y="14" class="t-serif">|0⟩</text><text x="84" y="146" class="t-serif">|1⟩</text><text x="117" y="34" class="t-serif" style="fill:#C8A96A">|ψ⟩</text><text x="88" y="53">θ</text>
      <text x="150" y="62">two angles,</text><text x="150" y="75">θ and φ,</text><text x="150" y="88" class="t-gold">fix the state</text></g>`,
  },
  {
    title: 'Both, <em>until asked</em>',
    body: 'Before it is measured, a qubit carries two amplitudes at once, one for 0 and one for 1. A measurement returns a single answer, with odds set by the squares of those amplitudes. Watch the two shells swell and shrink as the weighting shifts.',
    cap: 'Fig. 2 — Two amplitudes, one outcome per measurement.',
    callouts: [['α|0⟩', 'The inner, icy shell. Its crystals grow with the amplitude for 0.'], ['β|1⟩', 'The outer, gilded shell: the amplitude for 1.'], ['|α|² + |β|² = 1', 'The odds of the two outcomes always add up to one.']],
    fb: [[392, 290], [511, 196], [300, 548]],
    fig: () => `
      <path class="dr" pathLength="1" d="M14 124 H130" stroke="#EAF2FF" stroke-width=".7"/>
      <path class="dr" pathLength="1" d="M36 124 V52 H62 V124" stroke="#9FB8FF" stroke-width="1" style="--d:.2s"/>
      <path class="dr" pathLength="1" d="M82 124 V84 H108 V124" stroke="#C8A96A" stroke-width="1" style="--d:.4s"/>
      <path class="dr" pathLength="1" d="M140 88 H176 M170 82 L176 88 L170 94" stroke="#EAF2FF" stroke-width=".8" style="--d:.8s"/>
      <path class="dr" pathLength="1" d="M190 124 V52 H216 V124 M184 124 H222" stroke="#9FB8FF" stroke-width="1" style="--d:1.1s"/>
      <g class="fade" style="--d:1s"><text x="35" y="140">|α|² .64</text><text x="80" y="140" class="t-gold">|β|² .36</text>
      <text x="142" y="78">measure</text><text x="186" y="140">one: 0</text><text x="14" y="30" class="t-serif">α|0⟩ + β|1⟩</text></g>`,
  },
  {
    title: 'Two, <em>described as one</em>',
    body: 'Entangled qubits share a single description. Measure one and you learn something about the other, however far apart they are, yet no message travels between them. In this sculpture the two spins always point in opposite directions.',
    cap: 'Fig. 3 — A singlet pair: when measured the same way, outcomes always disagree.',
    callouts: [['Qubit A', 'On its own, its spin is completely uncertain.'], ['Qubit B', 'Always opposite to A when both are measured the same way.'], ['The link', 'Lives in the joint state, not in a signal passing between them.']],
    fb: [[208, 290], [392, 290], [300, 330]],
    fig: () => `
      <circle class="dr" pathLength="1" cx="44" cy="66" r="24" stroke="#9FB8FF" stroke-width=".9"/>
      <circle class="dr" pathLength="1" cx="196" cy="66" r="24" stroke="#9FB8FF" stroke-width=".9" style="--d:.15s"/>
      <path class="dr" pathLength="1" d="M44 80 V50 M38 57 L44 50 L50 57" stroke="#EAF2FF" stroke-width="1.1" style="--d:.5s"/>
      <path class="dr" pathLength="1" d="M196 52 V82 M190 75 L196 82 L202 75" stroke="#EAF2FF" stroke-width="1.1" style="--d:.6s"/>
      <path class="dr" pathLength="1" d="${curve((x) => 66 + 9 * Math.sin((x - 68) / 8), 68, 172, 52)}" stroke="#C8A96A" stroke-width="1" style="--d:.8s"/>
      <g class="fade" style="--d:1.1s"><text x="38" y="106">A</text><text x="190" y="106">B</text>
      <text x="58" y="134" class="t-serif">( |01⟩ − |10⟩ ) / √2</text></g>`,
  },
  {
    title: 'Amplitudes add, <em>and cancel</em>',
    body: 'Amplitudes behave like waves. Where two paths arrive in step they reinforce; where they arrive out of step they cancel. Quantum algorithms are choreographies of interference, steering amplitude toward right answers and away from wrong ones.',
    cap: 'Fig. 4 — Two sources, one pattern of ridges and calms.',
    callouts: [['Source one', 'Every crystal rides the sum of both waves.'], ['Source two', 'The same wave, starting a short distance away.'], ['A ridge', 'Both waves arrive in step here, so the crystals swell and turn gold.']],
    fb: [[164, 200], [436, 200], [300, 330]],
    fig: () => {
      const arcs = [];
      [52, 98].forEach((cy, j) => [16, 32, 48, 64].forEach((r, k) => arcs.push(`<path class="dr" pathLength="1" d="M${26 + r * 0.5} ${cy - r * 0.86} A${r} ${r} 0 0 1 ${26 + r * 0.5} ${cy + r * 0.86}" stroke="#9FB8FF" stroke-width=".7" opacity="${0.9 - k * 0.15}" style="--d:${(0.1 + k * 0.12 + j * 0.05).toFixed(2)}s"/>`)));
      const I = (y) => 212 - 22 * Math.pow(Math.cos((y - 75) / 7.5), 2) * Math.exp(-Math.pow((y - 75) / 60, 2));
      return `${arcs.join('')}
      <path class="dr" pathLength="1" d="M214 10 V140" stroke="#EAF2FF" stroke-width=".8" style="--d:.6s"/>
      <path class="dr" pathLength="1" d="${curve(I, 12, 138, 120).replace(/([ML])([\d.]+) ([\d.]+)/g, '$1$3 $2')}" stroke="#C8A96A" stroke-width="1" style="--d:.9s"/>
      <g class="fade" style="--d:1.1s"><circle cx="26" cy="52" r="3" fill="#C8A96A"/><circle cx="26" cy="98" r="3" fill="#C8A96A"/><text x="208" y="148" text-anchor="end">screen</text></g>`;
    },
  },
  {
    title: 'Many fragile qubits, <em>one sturdy one</em>',
    body: 'Physical qubits are disturbed by heat, stray fields and their own control signals. Error correction spreads one logical qubit across a lattice of many. Measure qubits check their neighbours, flag a flip, and the lattice is repaired without ever reading the stored information.',
    cap: 'Fig. 5 — A simplified surface-code patch: one flip trips the alarms around it.',
    callouts: [['Data qubits', 'Together they hold a single logical qubit.'], ['Measure qubits', 'They compare neighbours and never read the data itself.'], ['An error', 'A flipped qubit, flagged by its neighbours and then corrected.']],
    fb: [[300, 90], [392, 290], [300, 330]],
    fig: () => {
      let g = '';
      for (let i = 0; i < 5; i++) g += `M20 ${20 + i * 26} H124 M${20 + i * 26} 20 V124 `;
      let dots = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) dots += `<circle cx="${20 + c * 26}" cy="${20 + r * 26}" r="${r === 2 && c === 2 ? 4.5 : 3}" fill="${r === 2 && c === 2 ? '#C8A96A' : '#EAF2FF'}"/>`;
      return `<path class="dr" pathLength="1" d="${g}" stroke="#9FB8FF" stroke-width=".6"/>
      <g class="fade" style="--d:.7s">${dots}
      <rect x="50" y="50" width="18" height="18" transform="rotate(45 59 59)" fill="none" stroke="#C8A96A" stroke-width=".9"/><rect x="76" y="50" width="18" height="18" transform="rotate(45 85 59)" fill="none" stroke="#C8A96A" stroke-width=".9"/>
      <rect x="50" y="76" width="18" height="18" transform="rotate(45 59 85)" fill="none" stroke="#C8A96A" stroke-width=".9"/><rect x="76" y="76" width="18" height="18" transform="rotate(45 85 85)" fill="none" stroke="#C8A96A" stroke-width=".9"/>
      <text x="142" y="56">● data</text><text x="142" y="72" class="t-gold">◇ alarm</text><text x="142" y="96" class="t-serif">many → one</text></g>`;
    },
  },
];

/* ---------------- header & menu ---------------- */
const header = $('#site-header');
const menuBtn = $('.menu-btn');
const nav = $('#site-nav');
const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  header.classList.toggle('is-menu', open);
  if (open) nav.querySelector('a')?.focus();
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a') && mqMobile.matches) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
});
mqMobile.addEventListener('change', () => setMenu(false));

// current section in nav
const navLinks = $$('#site-nav a');
const secObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) secObs.observe(s); });

/* ---------------- explorer ---------------- */
const hero = $('#plate-i');
const stage = $('#stage');
const explorer = $('.explorer');
const tabs = $$('.ptab');
const rail = $('.explorer__rail');
const miniFig = $('#mini-fig');
const miniCap = $('#mini-cap');
const titleEl = $('#plate-title');
const bodyEl = $('#plate-body');
const panel = $('#plate-panel');
const callouts = $('#callouts');
const annot = $('#annot');
const pauseBtn = $('#ctl-pause');
let current = 0;
let sculpture = null;
let labelPts = [];
let annotMode = '';

function placeRail() {
  const t = tabs[current];
  const w = Math.max(24, t.offsetWidth - 22);
  rail.style.width = `${w}px`;
  rail.style.transform = `translateX(${t.offsetLeft}px)`;
}

function renderCallouts(i) {
  callouts.innerHTML = PLATES[i].callouts.map(([b, t], k) =>
    `<li style="--d:${(0.15 + k * 0.14).toFixed(2)}s"><span class="callouts__key">${'abc'[k]}</span><p><b>${b}</b> ${t}</p></li>`).join('');
}

function buildAnnot() {
  const mobile = mqMobile.matches;
  annotMode = mobile ? 'm' : 'd';
  annot.innerHTML = [0, 1, 2].map((k) => `<g style="--d:${(0.1 + k * 0.16).toFixed(2)}s">
    ${mobile ? '' : `<path class="lead" pathLength="1" d="M0 0"/>`}
    <circle class="pin" r="${mobile ? 9 : 4.5}"/>${mobile ? `<text class="pin-key">${'abc'[k]}</text>` : '<circle class="pin-dot" r="1.6"/>'}
  </g>`).join('');
}

function measureLabels() {
  const sr = stage.getBoundingClientRect();
  labelPts = $$('li', callouts).map((li) => {
    const r = li.getBoundingClientRect();
    return { x: r.left - sr.left - 14, y: r.top - sr.top + 25 };
  });
}

function drawAnnot(anchors) {
  if (!anchors) return;
  const groups = annot.children;
  for (let k = 0; k < groups.length; k++) {
    const g = groups[k], a = anchors[k];
    if (!a) continue;
    g.style.visibility = a.ok ? 'visible' : 'hidden';
    const pin = g.querySelector('.pin');
    const x = a.x.toFixed(1), y = a.y.toFixed(1);
    pin.setAttribute('cx', x); pin.setAttribute('cy', y);
    const dot = g.querySelector('.pin-dot');
    if (dot) { dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
    const key = g.querySelector('.pin-key');
    if (key) { key.setAttribute('x', x); key.setAttribute('y', y); }
    const lead = g.querySelector('.lead');
    const L = labelPts[k];
    if (lead && L) {
      const ex = L.x - 48;
      lead.setAttribute('d', `M${x} ${y} L${ex.toFixed(1)} ${L.y.toFixed(1)} H${L.x.toFixed(1)}`);
    }
  }
}

// static anchors for the SVG fallback (no WebGL)
function fallbackAnchors() {
  const fb = $('#fallback');
  const sr = stage.getBoundingClientRect();
  const r = fb.getBoundingClientRect();
  const s = r.width / 600;
  return PLATES[current].fb.map(([x, y]) => ({ x: r.left - sr.left + x * s, y: r.top - sr.top + y * s, ok: true }));
}

function redrawAnnotations(restart = false) {
  if ((mqMobile.matches ? 'm' : 'd') !== annotMode) buildAnnot();
  measureLabels();
  if (restart) {
    annot.classList.remove('is-drawn'); callouts.classList.remove('is-drawn');
    void annot.getBoundingClientRect();
    setTimeout(() => { annot.classList.add('is-drawn'); callouts.classList.add('is-drawn'); }, reduced ? 0 : 520);
  }
  if (sculpture) sculpture.refresh(); else drawAnnot(fallbackAnchors());
}

function drawMini(i) {
  miniFig.classList.remove('is-drawn');
  miniFig.innerHTML = PLATES[i].fig();
  void miniFig.getBoundingClientRect();
  requestAnimationFrame(() => miniFig.classList.add('is-drawn'));
}

function select(i, focus = false) {
  i = (i + PLATES.length) % PLATES.length;
  if (focus) tabs[i].focus();
  if (i === current) return;
  current = i;
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
  panel.setAttribute('aria-labelledby', `ptab-${i}`);
  hero.dataset.concept = String(i);
  placeRail();
  if (mqMobile.matches) tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  sculpture?.setConcept(i);
  explorer.classList.add('is-swapping');
  callouts.classList.remove('is-drawn'); annot.classList.remove('is-drawn');
  setTimeout(() => {
    const p = PLATES[i];
    titleEl.innerHTML = p.title;
    bodyEl.textContent = p.body;
    miniCap.textContent = p.cap;
    renderCallouts(i);
    drawMini(i);
    explorer.classList.remove('is-swapping');
    redrawAnnotations(true);
  }, reduced ? 0 : 280);
}

tabs.forEach((t, k) => {
  t.addEventListener('click', () => select(k));
  t.addEventListener('keydown', (e) => {
    const map = { ArrowRight: current + 1, ArrowLeft: current - 1, ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: PLATES.length - 1 };
    if (e.key in map) { e.preventDefault(); select(map[e.key], true); }
  });
});
$('#ctl-prev').addEventListener('click', () => select(current - 1));
$('#ctl-next').addEventListener('click', () => select(current + 1));
$('#ctl-turn-l').addEventListener('click', () => sculpture?.nudge(-1));
$('#ctl-turn-r').addEventListener('click', () => sculpture?.nudge(1));
let paused = reduced;
function syncPause() {
  pauseBtn.setAttribute('aria-pressed', String(paused));
  pauseBtn.setAttribute('aria-label', paused ? 'Resume the turning' : 'Pause the turning');
  pauseBtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
}
pauseBtn.addEventListener('click', () => { paused = !paused; syncPause(); sculpture?.setPaused(paused); });
syncPause();

// first paint of the explorer
renderCallouts(0);
buildAnnot();
drawMini(0);
placeRail();
requestAnimationFrame(() => redrawAnnotations(true));

let rsT = 0;
window.addEventListener('resize', () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => { placeRail(); redrawAnnotations(false); }, 120);
});
document.fonts?.ready.then(() => { placeRail(); redrawAnnotations(false); });

/* ---------------- WebGL sculpture ---------------- */
function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}
function useFallback() {
  sculpture = null;
  hero.classList.remove('is-gl');
  $('#drag-hint').textContent = 'Use the plate tabs to explore';
  ['#ctl-turn-l', '#ctl-turn-r', '#ctl-pause'].forEach((s) => { $(s).hidden = true; });
  redrawAnnotations(false);
}
if (webglOK()) {
  import('./sculpture.js').then(({ createSculpture }) => {
    sculpture = createSculpture($('#sculpture'), {
      reduced,
      small: window.matchMedia('(max-width: 760px), (pointer: coarse)').matches,
      paused,
      start: current,
      onFrame: drawAnnot,
      onLost: useFallback,
    });
    hero.classList.add('is-gl');
    if (reduced) $('#drag-hint').textContent = 'Drag, or use the turn buttons';
    redrawAnnotations(false);
  }).catch(useFallback);
} else {
  useFallback();
}

/* ---------------- reveals ---------------- */
const revealTargets = $$('.plate, .observe, .nest-svg, .entry');
if ('IntersectionObserver' in window) {
  const rev = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); rev.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  revealTargets.forEach((el) => rev.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'));
}

// the persistent label steps aside for the footer's own disclaimer
const chip = $('.illus-chip');
if (chip) new IntersectionObserver(([e]) => chip.classList.toggle('is-hidden', e.isIntersecting)).observe($('#footer'));

initBench({ reduced });
initSections({ reduced, mqMobile });
