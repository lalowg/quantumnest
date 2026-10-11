/* QUANTUMNEST — Plate II: the interference bench (canvas 2D).
   Arrivals are sampled from the textbook double-slit intensity
   I(x) = sinc²(β) · cos²(γ + φ/2). Illustrative, not a physics simulation. */

const BINS = 150;
const MAX_HITS = 20000;

export function initBench({ reduced }) {
  const canvas = document.getElementById('bench-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('instrument');
  const bench = section.querySelector('.bench');
  const el = (id) => document.getElementById(id);
  const rSep = el('r-sep'), rLam = el('r-lam'), rPh = el('r-phase');
  const oSep = el('o-sep'), oLam = el('o-lam'), oPh = el('o-phase');
  const det = el('detector'), pred = el('prediction');
  const hitsEl = el('bench-hits'), visEl = el('bench-vis'), spEl = el('bench-spacing');
  const note = el('bench-note'), empty = el('bench-empty');
  const btnOne = el('fire-one'), btnMany = el('fire-many'), btnStream = el('fire-stream'), btnClear = el('fire-clear');

  const state = { sep: 5, lam: 0.7, phase: 0, detector: false, prediction: true };
  const hx = new Float32Array(MAX_HITS), hy = new Float32Array(MAX_HITS);
  const bins = new Float32Array(BINS);
  let hits = 0, streaming = false, inView = false, raf = 0;
  const flashes = [];
  let W = 1, H = 1, dpr = 1;
  const dots = document.createElement('canvas');
  const dctx = dots.getContext('2d');

  const I = (x) => {
    const beta = (Math.PI * 1.3 * x) / state.lam;
    const env = Math.abs(beta) < 1e-6 ? 1 : (Math.sin(beta) / beta) ** 2;
    if (state.detector) return env;
    const gamma = (Math.PI * state.sep * 0.55 * x) / state.lam + (state.phase * Math.PI) / 360;
    return env * Math.cos(gamma) ** 2;
  };

  const screenTop = () => H * 0.06, screenH = () => H * 0.5, tallyTop = () => H * 0.64, tallyH = () => H * 0.3;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    dots.width = canvas.width; dots.height = canvas.height;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.clearRect(0, 0, W, H);
    for (let i = 0; i < hits; i++) plotDot(hx[i], hy[i]);
    draw();
  }

  function plotDot(x, yf) {
    const px = ((x + 1) / 2) * W, py = screenTop() + yf * screenH();
    dctx.fillStyle = 'rgba(234, 242, 255, 0.72)';
    dctx.fillRect(px - 0.6, py - 0.6, 1.3, 1.3);
  }

  function sample() {
    for (let n = 0; n < 4000; n++) {
      const x = Math.random() * 2 - 1;
      if (Math.random() < I(x)) return x;
    }
    return 0;
  }

  function fire(n) {
    const room = Math.min(n, MAX_HITS - hits);
    for (let k = 0; k < room; k++) {
      const x = sample();
      const yf = Math.min(1, Math.max(0, 0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.42));
      hx[hits] = x; hy[hits] = yf; hits++;
      const b = Math.min(BINS - 1, Math.floor(((x + 1) / 2) * BINS));
      bins[b]++;
      plotDot(x, yf);
      if (!reduced && n <= 12) flashes.push({ x, yf, t: 0 });
    }
    if (hits >= MAX_HITS && streaming) { setStream(false); note.textContent = 'The screen is full. Clear it to keep firing.'; }
    hitsEl.textContent = hits.toLocaleString('en-GB');
    empty.classList.toggle('is-hidden', hits > 0);
    kick();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // screen band: engraved verticals
    ctx.strokeStyle = 'rgba(159, 184, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 20; i++) { const x = Math.round((W * i) / 20) + 0.5; ctx.moveTo(x, screenTop()); ctx.lineTo(x, screenTop() + screenH()); }
    ctx.stroke();
    ctx.drawImage(dots, 0, 0, W, H);
    // newest arrivals flare
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const px = ((f.x + 1) / 2) * W, py = screenTop() + f.yf * screenH();
      const a = 1 - f.t;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 10);
      g.addColorStop(0, `rgba(227, 204, 152, ${0.9 * a})`);
      g.addColorStop(1, 'rgba(227, 204, 152, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(px - 10, py - 10, 20, 20);
    }
    // divider
    const tt = tallyTop(), th = tallyH(), base = tt + th;
    ctx.strokeStyle = 'rgba(200, 169, 106, 0.4)';
    ctx.beginPath(); ctx.moveTo(0, Math.round(tt - H * 0.04) + 0.5); ctx.lineTo(W, Math.round(tt - H * 0.04) + 0.5); ctx.stroke();
    // tally hairlines
    let max = 0;
    for (let i = 0; i < BINS; i++) if (bins[i] > max) max = bins[i];
    const bw = W / BINS;
    ctx.strokeStyle = 'rgba(159, 184, 255, 0.85)';
    ctx.beginPath();
    if (max > 0) {
      for (let i = 0; i < BINS; i++) {
        if (!bins[i]) continue;
        const x = Math.round(i * bw + bw / 2) + 0.5;
        ctx.moveTo(x, base); ctx.lineTo(x, base - (bins[i] / max) * th * 0.92);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(234, 242, 255, 0.35)';
    ctx.beginPath(); ctx.moveTo(0, base + 0.5); ctx.lineTo(W, base + 0.5); ctx.stroke();
    // prediction
    if (state.prediction) {
      // normalise to the bin peak (or the curve peak while empty)
      let peak = 0;
      const n = 300, vals = new Float32Array(n + 1);
      for (let i = 0; i <= n; i++) { vals[i] = I(-1 + (2 * i) / n); if (vals[i] > peak) peak = vals[i]; }
      ctx.strokeStyle = 'rgba(200, 169, 106, 0.95)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * W, y = base - (vals[i] / (peak || 1)) * th * 0.92;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    // axis ticks
    ctx.fillStyle = 'rgba(234, 242, 255, 0.4)';
    for (let i = 0; i <= 10; i++) { const x = Math.round((W * i) / 10); ctx.fillRect(Math.min(W - 1, x), base + 3, 1, i % 5 ? 3 : 6); }
  }

  function frame() {
    raf = 0;
    if (streaming && inView && !document.hidden) fire(reduced ? 40 : 7);
    for (let i = flashes.length - 1; i >= 0; i--) { flashes[i].t += 0.045; if (flashes[i].t >= 1) flashes.splice(i, 1); }
    draw();
    if ((streaming && inView && !document.hidden) || flashes.length) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function clear(msg) {
    hits = 0; bins.fill(0); flashes.length = 0;
    dctx.clearRect(0, 0, W, H);
    hitsEl.textContent = '0';
    empty.classList.remove('is-hidden');
    if (msg) note.textContent = msg;
    draw();
  }

  function readouts() {
    oSep.textContent = state.sep.toFixed(1);
    oLam.textContent = state.lam.toFixed(2);
    oPh.textContent = `${Math.round(state.phase)}°`;
    [rSep, rLam, rPh].forEach((r) => { r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`); });
    if (state.detector) { visEl.textContent = 'Gone'; spEl.textContent = '—'; }
    else {
      visEl.textContent = 'Expected';
      const dx = state.lam / (state.sep * 0.55);
      spEl.textContent = `${((dx / 2) * 100).toFixed(1)}%`;
    }
    bench.classList.toggle('is-detecting', state.detector);
  }

  function setStream(on) {
    streaming = on;
    btnStream.setAttribute('aria-pressed', String(on));
    btnStream.querySelector('.stream-label').textContent = on ? 'Pause stream' : 'Start stream';
    if (on) { note.textContent = ''; kick(); }
  }

  const onParam = () => {
    state.sep = +rSep.value; state.lam = +rLam.value; state.phase = +rPh.value;
    readouts();
    if (hits) clear('Screen cleared for the new settings.'); else draw();
  };
  [rSep, rLam, rPh].forEach((r) => r.addEventListener('input', onParam));
  det.addEventListener('click', () => {
    state.detector = !state.detector;
    det.setAttribute('aria-checked', String(state.detector));
    readouts();
    clear(state.detector ? 'Detector on: each particle is tagged with its slit, so the stripes cannot form.' : 'Detector off: the paths are indistinguishable again.');
  });
  pred.addEventListener('click', () => {
    state.prediction = !state.prediction;
    pred.setAttribute('aria-checked', String(state.prediction));
    draw();
  });
  btnOne.addEventListener('click', () => { fire(1); note.textContent = hits === 1 ? 'One dot. On its own it tells you almost nothing.' : note.textContent; });
  btnMany.addEventListener('click', () => { fire(500); if (hits >= 500 && hits < 1100) note.textContent = state.detector ? 'Two soft humps, no stripes.' : 'The stripes are emerging.'; });
  btnStream.addEventListener('click', () => setStream(!streaming));
  btnClear.addEventListener('click', () => clear('Screen cleared.'));

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; if (inView && streaming) kick(); }, { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && streaming) kick(); });
  readouts();
  resize();
}
