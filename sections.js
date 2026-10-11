/* QUANTUMNEST — Plates III–VI: nest scrollytelling, history track,
   applications index, viewing request form (demo, nothing is sent). */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

export function initSections({ reduced, mqMobile }) {
  initNest(reduced, mqMobile);
  initTrack(reduced);
  initIndex();
  initForm();
}

/* ---------------- Plate III · nest ---------------- */
function initNest(reduced, mqMobile) {
  const stages = $$('#stages .stage');
  const svg = $('#nest-svg');
  if (!stages.length || !svg) return;
  const tempEl = $('#nest-temp'), unitEl = $('#nest-unit'), labelEl = $('#nest-label'), needle = $('#nest-needle');
  const LMAX = Math.log10(300), LMIN = Math.log10(0.01);
  let shownLog = LMAX, tween = 0, active = -1;

  const fmt = (v) => {
    if (v >= 10) return [String(Math.round(v)), 'K'];
    if (v >= 1) return [v.toFixed(1), 'K'];
    return [String(Math.round(v * 1000)), 'mK'];
  };
  const paint = (lg) => {
    const [n, u] = fmt(10 ** lg);
    tempEl.textContent = n; unitEl.textContent = u;
    needle.style.left = `${((LMAX - lg) / (LMAX - LMIN)) * 100}%`;
  };

  function activate(k) {
    if (k === active) return;
    active = k;
    stages.forEach((s, i) => s.classList.toggle('is-active', i === k));
    $$('.nest-stage', svg).forEach((g) => {
      const s = +g.dataset.stage;
      g.classList.toggle('is-active', s === k || (k === 5 && s === 6));
    });
    labelEl.textContent = stages[k].querySelector('h3').textContent;
    const target = Math.log10(+stages[k].dataset.temp);
    cancelAnimationFrame(tween);
    if (reduced) { shownLog = target; paint(target); return; }
    const from = shownLog, t0 = performance.now(), dur = 1100;
    const step = (now) => {
      const u = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - u, 4);
      shownLog = from + (target - from) * e;
      paint(shownLog);
      if (u < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  }

  let obs;
  const build = () => {
    obs?.disconnect();
    const margin = mqMobile.matches ? '-62% 0px -24% 0px' : '-45% 0px -45% 0px';
    obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) activate(stages.indexOf(en.target)); });
    }, { rootMargin: margin });
    stages.forEach((s) => obs.observe(s));
  };
  build();
  mqMobile.addEventListener('change', build);
  activate(0);
}

/* ---------------- Plate IV · history track ---------------- */
function initTrack(reduced) {
  const track = $('#track');
  if (!track) return;
  const viewport = $('#track-viewport'), list = $('#track-list'), bar = $('#track-bar');
  const prev = $('#track-prev'), next = $('#track-next');
  const mqWide = window.matchMedia('(min-width: 961px)');
  let pinned = false, dist = 0;

  const gut = () => parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
  const entryW = () => (list.firstElementChild ? list.firstElementChild.getBoundingClientRect().width : 300);

  function layout() {
    pinned = mqWide.matches && !reduced;
    track.classList.toggle('is-pinned', pinned);
    list.style.transform = '';
    if (pinned) {
      dist = Math.max(0, list.scrollWidth - (viewport.clientWidth - gut() * 2));
      track.style.height = `${window.innerHeight + dist}px`;
    } else {
      track.style.height = '';
      dist = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }
    update();
  }

  function progress() {
    if (pinned) {
      const top = track.getBoundingClientRect().top;
      return dist ? Math.min(1, Math.max(0, -top / dist)) : 0;
    }
    return dist ? viewport.scrollLeft / dist : 0;
  }

  function update() {
    const p = progress();
    if (pinned) list.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
    bar.style.transform = `scaleX(${p.toFixed(3)})`;
    prev.disabled = p <= 0.001;
    next.disabled = p >= 0.999;
  }

  function go(dir) {
    const step = entryW() * dir;
    if (pinned) {
      const top = window.scrollY + track.getBoundingClientRect().top;
      const target = Math.min(top + dist, Math.max(top, window.scrollY + step));
      window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
    } else {
      viewport.scrollBy({ left: step, behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  viewport.addEventListener('scroll', onScroll, { passive: true });
  let rs = 0;
  window.addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(layout, 150); });
  mqWide.addEventListener('change', layout);
  document.fonts?.ready.then(layout);
  layout();
}

/* ---------------- Plate V · applications index ---------------- */
function initIndex() {
  $$('.index__btn').forEach((btn) => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
  });
}

/* ---------------- Plate VI · viewing form ---------------- */
function initForm() {
  const form = $('#viewing-form');
  if (!form) return;
  const month = $('#f-month');
  const now = new Date();
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    month.add(new Option(label, label));
  }
  const notes = $('#f-notes'), count = $('#c-notes');
  notes.addEventListener('input', () => { count.textContent = `${notes.value.length} / 600`; });

  const done = $('#form-done'), doneTitle = $('#form-done-title');
  const fields = {
    name: { el: $('#f-name'), err: $('#e-name'), check: (v) => (v.trim().length < 2 ? 'Please enter your name.' : '') },
    email: { el: $('#f-email'), err: $('#e-email'), check: (v) => (!v.trim() ? 'Please enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'That email address looks incomplete.' : '') },
    month: { el: month, err: $('#e-month'), check: (v) => (!v ? 'Please choose a month.' : '') },
  };
  const visitErr = $('#e-visit');
  const radios = $$('input[name="visit"]', form);

  function validateField(f) {
    const msg = f.check(f.el.value);
    f.err.textContent = msg;
    f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.values(fields).forEach((f) => {
    f.el.addEventListener('blur', () => { if (f.el.value) validateField(f); });
    f.el.addEventListener('input', () => { if (f.el.getAttribute('aria-invalid') === 'true') validateField(f); });
    f.el.addEventListener('change', () => { if (f.el.getAttribute('aria-invalid') === 'true') validateField(f); });
  });
  radios.forEach((r) => r.addEventListener('change', () => { visitErr.textContent = ''; }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    Object.values(fields).forEach((f) => { if (!validateField(f) && !firstBad) firstBad = f.el; });
    const visit = radios.find((r) => r.checked);
    if (!visit) {
      visitErr.textContent = 'Please choose the kind of visit.';
      if (!firstBad) firstBad = radios[0];
    } else visitErr.textContent = '';
    // keep DOM order for focus: name, email, visit, month
    const order = [fields.name.el, fields.email.el, radios[0], month];
    const bad = order.find((el) => (el === radios[0] ? !visit : el.getAttribute('aria-invalid') === 'true'));
    if (bad || firstBad) { (bad || firstBad).focus(); return; }
    const first = fields.name.el.value.trim().split(/\s+/)[0];
    doneTitle.textContent = `Request noted, ${first}.`;
    done.hidden = false;
    done.focus();
  });

  $('#form-reset').addEventListener('click', () => {
    form.reset();
    count.textContent = '0 / 600';
    Object.values(fields).forEach((f) => { f.err.textContent = ''; f.el.removeAttribute('aria-invalid'); });
    done.hidden = true;
    fields.name.el.focus();
  });
}
