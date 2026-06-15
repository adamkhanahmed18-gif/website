/* ============================================================
   JPS PLASTERING — Interactions (calm, user in control)
   - procedural plaster textures (placeholders until real photos)
   - gentle reveal on scroll, counters, before/after, nav, FAQ, form
   No scroll-hijacking, no parallax engine, no particle field.
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---- procedural plaster textures (stand-ins for photos) ---- */
  function plasterTexture(opts = {}) {
    const { seed = (Math.random() * 100) | 0, base = 0.012, oct = 4,
            tint = '#b98e72', tint2 = '#1a1512', surface = 7 } = opts;
    const id = 's' + seed + ((Math.random() * 1e4) | 0);
    const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='640' height='800' viewBox='0 0 640 800'>
  <defs>
    <filter id='f${id}'>
      <feTurbulence type='fractalNoise' baseFrequency='${base} ${base * 1.4}' numOctaves='${oct}' seed='${seed}' stitchTiles='stitch' result='n'/>
      <feDiffuseLighting in='n' lighting-color='#ffffff' surfaceScale='${surface}' result='l'>
        <feDistantLight azimuth='235' elevation='55'/>
      </feDiffuseLighting>
      <feColorMatrix in='l' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.34 0.5 0.16 0 0' result='a'/>
      <feComponentTransfer in='a' result='m'><feFuncA type='gamma' amplitude='1' exponent='1.3' offset='0'/></feComponentTransfer>
    </filter>
    <linearGradient id='g${id}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${tint}'/><stop offset='1' stop-color='${tint2}'/>
    </linearGradient>
  </defs>
  <rect width='640' height='800' fill='url(#g${id})'/>
  <rect width='640' height='800' filter='url(#f${id})' opacity='0.85'/>
  <rect width='640' height='800' fill='${tint}' opacity='0.08'/>
</svg>`.trim();
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  const palettes = [
    { tint: '#c9a98e', tint2: '#1a1512' }, { tint: '#8a7f70', tint2: '#14110f' },
    { tint: '#a99a86', tint2: '#221c18' }, { tint: '#3c4a57', tint2: '#0e0c0b' },
    { tint: '#b98e72', tint2: '#100d0b' }, { tint: '#cdbfa9', tint2: '#221c18' },
  ];
  $$('[data-tex]').forEach((el, i) => {
    const p = palettes[i % palettes.length];
    const v = el.dataset.tex;
    const variant = v === 'fine' ? { base: 0.03, surface: 4 } : v === 'coarse' ? { base: 0.006, surface: 11 } : {};
    el.style.backgroundImage = plasterTexture({ ...p, ...variant });
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = `${(Math.random() * 100) | 0}% ${(Math.random() * 100) | 0}%`;
  });

  /* ---- reveal on scroll (gentle) ---- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal, .stat').forEach(el => io.observe(el));

  /* ---- counters ---- */
  const cio = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.count), dur = 1400;
      const dec = (el.dataset.count.split('.')[1] || '').length;
      let t0;
      const tick = (t) => {
        t0 = t0 || t;
        const k = clamp((t - t0) / dur, 0, 1);
        el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec);
        if (k < 1) requestAnimationFrame(tick); else el.textContent = to.toFixed(dec);
      };
      if (reduce) el.textContent = to.toFixed(dec); else requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---- before / after slider ---- */
  $$('.ba__frame').forEach(frame => {
    const after = $('.ba__after', frame), handle = $('.ba__handle', frame);
    let dragging = false;
    const setPos = (clientX) => {
      const r = frame.getBoundingClientRect();
      const p = clamp((clientX - r.left) / r.width, 0, 1);
      after.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
      handle.style.left = (p * 100) + '%';
    };
    const move = (e) => { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX); };
    frame.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
    frame.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    addEventListener('mousemove', move);
    addEventListener('touchmove', move, { passive: true });
    addEventListener('mouseup', () => dragging = false);
    addEventListener('touchend', () => dragging = false);
  });

  /* ---- nav: solid on scroll + mobile menu ---- */
  const nav = $('#nav');
  const setNav = () => nav && nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', setNav, { passive: true }); setNav();

  const burger = $('#burger'), mobile = $('#mobile-nav');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mobile.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mobile).forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open'); mobile.classList.remove('open'); document.body.style.overflow = '';
    }));
  }

  /* ---- FAQ accordion ---- */
  $$('.acc__item').forEach(item => {
    const q = $('.acc__q', item), a = $('.acc__a', item);
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    });
  });

  /* ---- quote form (front-end only) ---- */
  const form = $('#quote-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = $('#form-ok', form);
    if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    form.reset();
  });

  /* ---- year ---- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
