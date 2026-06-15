/* ============================================================
   JPS PLASTERING — Immersive interactions
   - procedural plaster textures (SVG feTurbulence -> data URI)
   - plaster-dust particle field (canvas)
   - parallax "double scroll" + pinned horizontal services
   - counters, before/after, accordion, nav, form
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ----------------------------------------------------------
     PROCEDURAL PLASTER TEXTURES
     Build an SVG with feTurbulence + lighting, tinted, encode as
     a data URI, and drop it onto every [data-tex] element. This
     gives realistic, varied wall surfaces with zero image files.
  ---------------------------------------------------------- */
  function plasterTexture(opts = {}) {
    const {
      seed = (Math.random() * 100) | 0,
      base = 0.012,            // turbulence frequency (lower = broader swirls)
      oct  = 4,
      tint = '#b98e72',
      tint2 = '#1a1512',
      surface = 7              // lighting depth
    } = opts;
    const id = 's' + seed + ((Math.random() * 1e4) | 0);
    const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='640' height='800' viewBox='0 0 640 800'>
  <defs>
    <filter id='f${id}'>
      <feTurbulence type='fractalNoise' baseFrequency='${base} ${base * 1.4}'
        numOctaves='${oct}' seed='${seed}' stitchTiles='stitch' result='n'/>
      <feDiffuseLighting in='n' lighting-color='#ffffff' surfaceScale='${surface}' result='l'>
        <feDistantLight azimuth='235' elevation='55'/>
      </feDiffuseLighting>
      <feColorMatrix in='l' type='matrix'
        values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.34 0.5 0.16 0 0' result='a'/>
      <feComponentTransfer in='a' result='m'>
        <feFuncA type='gamma' amplitude='1' exponent='1.3' offset='0'/>
      </feComponentTransfer>
    </filter>
    <linearGradient id='g${id}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${tint}'/>
      <stop offset='1' stop-color='${tint2}'/>
    </linearGradient>
  </defs>
  <rect width='640' height='800' fill='url(#g${id})'/>
  <rect width='640' height='800' filter='url(#f${id})' opacity='0.9'/>
  <rect width='640' height='800' fill='${tint}' opacity='0.10'/>
</svg>`.trim();
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  const palettes = [
    { tint: '#c9a98e', tint2: '#1a1512' },   // wet plaster
    { tint: '#8a7f70', tint2: '#14110f' },   // set grey
    { tint: '#c9a24b', tint2: '#221c18' },   // brass render
    { tint: '#3c4a57', tint2: '#0e0c0b' },   // tooled steel
    { tint: '#b98e72', tint2: '#100d0b' },   // warm skim
    { tint: '#efe7d9', tint2: '#221c18' },   // fresh cream
  ];

  $$('[data-tex]').forEach((el, i) => {
    const p = palettes[i % palettes.length];
    const v = el.dataset.tex;
    const variant = v === 'fine' ? { base: 0.03, surface: 4 }
                  : v === 'coarse' ? { base: 0.006, surface: 11 }
                  : {};
    el.style.backgroundImage = plasterTexture({ ...p, ...variant });
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = `${(Math.random() * 100) | 0}% ${(Math.random() * 100) | 0}%`;
  });

  /* ----------------------------------------------------------
     PLASTER-DUST PARTICLE FIELD
  ---------------------------------------------------------- */
  const dust = $('#dust');
  if (dust && !reduce) {
    const ctx = dust.getContext('2d');
    let W, H, parts = [], dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = dust.width = innerWidth * dpr;
      H = dust.height = innerHeight * dpr;
      dust.style.width = innerWidth + 'px';
      dust.style.height = innerHeight + 'px';
      const n = Math.round((innerWidth * innerHeight) / 14000);
      parts = Array.from({ length: n }, () => spawn());
    }
    function spawn() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.8 + 0.3) * dpr,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() * 0.3 + 0.06) * dpr,
        a: Math.random() * 0.5 + 0.1,
        tw: Math.random() * Math.PI * 2
      };
    }
    let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx + mx * 0.4 * dpr;
        p.y += p.vy;
        p.tw += 0.02;
        if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
        if (p.x > W + 5) p.x = -5; if (p.x < -5) p.x = W + 5;
        const a = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231,200,120,${a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    size(); addEventListener('resize', size); draw();
  }

  /* ----------------------------------------------------------
     SCROLL PROGRESS + PARALLAX (double-scroll layers)
  ---------------------------------------------------------- */
  const bar = $('#progress');
  const parallax = $$('[data-speed]');
  let sy = scrollY, target = scrollY;

  function onFrame() {
    sy = lerp(sy, target, 0.12);
    if (Math.abs(sy - target) < 0.1) sy = target;

    // parallax layers move relative to viewport center -> two visible
    // scroll speeds at once (the "double scroll" feel)
    const vh = innerHeight;
    for (const el of parallax) {
      const speed = parseFloat(el.dataset.speed);
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(2)}px, 0)`;
    }
    if (!reduce) requestAnimationFrame(onFrame);
  }
  addEventListener('scroll', () => { target = scrollY; updateProgress(); }, { passive: true });

  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    if (bar) bar.style.width = (p * 100) + '%';
  }
  updateProgress();
  if (!reduce && parallax.length) requestAnimationFrame(onFrame);
  else parallax.forEach(el => el.style.transform = 'none');

  /* ----------------------------------------------------------
     REVEAL ON SCROLL
  ---------------------------------------------------------- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  $$('.reveal, .stat').forEach(el => io.observe(el));

  /* ----------------------------------------------------------
     COUNTERS
  ---------------------------------------------------------- */
  const cio = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.count), dur = 1600;
      const dec = (el.dataset.count.split('.')[1] || '').length;
      let t0;
      const tick = (t) => {
        t0 = t0 || t;
        const k = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (k < 1) requestAnimationFrame(tick);
        else el.textContent = to.toFixed(dec);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ----------------------------------------------------------
     PINNED HORIZONTAL SERVICES (scroll-driven translateX)
  ---------------------------------------------------------- */
  const pin = $('#pin');
  if (pin && innerWidth > 760) {
    const track = $('#pin-track', pin);
    const fill = $('#pin-fill', pin);
    const count = $('#pin-count', pin);
    const total = track ? track.children.length : 0;
    function pinScroll() {
      const rect = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - innerHeight;
      const prog = clamp(-rect.top / scrollable, 0, 1);
      const maxX = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 0.0;
      const shift = Math.max(0, track.scrollWidth - innerWidth + 64);
      track.style.transform = `translate3d(${-prog * shift}px,0,0)`;
      if (fill) fill.style.width = (prog * 100) + '%';
      if (count) count.textContent = String(Math.min(total, Math.floor(prog * total) + 1)).padStart(2, '0');
      requestAnimationFrame(pinScroll);
    }
    requestAnimationFrame(pinScroll);
  }

  /* ----------------------------------------------------------
     BEFORE / AFTER SLIDER
  ---------------------------------------------------------- */
  $$('.ba__frame').forEach(frame => {
    const after = $('.ba__after', frame);
    const handle = $('.ba__handle', frame);
    let dragging = false;
    const setPos = (clientX) => {
      const r = frame.getBoundingClientRect();
      const p = clamp((clientX - r.left) / r.width, 0, 1);
      after.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
      handle.style.left = (p * 100) + '%';
    };
    const start = () => dragging = true;
    const end = () => dragging = false;
    const move = (e) => { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX); };
    frame.addEventListener('mousedown', e => { start(); setPos(e.clientX); });
    frame.addEventListener('touchstart', e => { start(); setPos(e.touches[0].clientX); }, { passive: true });
    addEventListener('mousemove', move);
    addEventListener('touchmove', move, { passive: true });
    addEventListener('mouseup', end); addEventListener('touchend', end);
  });

  /* ----------------------------------------------------------
     NAV: scrolled state + mobile + active link
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     ACCORDION (FAQ)
  ---------------------------------------------------------- */
  $$('.acc__item').forEach(item => {
    const q = $('.acc__q', item), a = $('.acc__a', item);
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    });
  });

  /* ----------------------------------------------------------
     QUOTE FORM (front-end only)
  ---------------------------------------------------------- */
  const form = $('#quote-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = $('#form-ok', form);
      if (ok) ok.classList.add('show');
      form.reset();
      if (ok) ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ----------------------------------------------------------
     YEAR
  ---------------------------------------------------------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
