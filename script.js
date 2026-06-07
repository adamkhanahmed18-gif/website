/* ============================================================
   ARTISAN CAKERY — Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Cinematic video intro (home page only) ---- */
  const introEl = document.getElementById('intro-sequence');
  if (introEl) {
    const scenes    = Array.from(introEl.querySelectorAll('.intro-scene'));
    const brand     = introEl.querySelector('#intro-brand');
    const capEl     = introEl.querySelector('#intro-caption');
    const bar       = document.getElementById('intro-bar');
    const SCENE_DUR = 2800;
    const BRAND_DUR = 2100;
    const TOTAL     = scenes.length * SCENE_DUR + BRAND_DUR;

    bar.style.transition = `width ${TOTAL}ms linear`;
    requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '100%'));

    let ended = false;

    function endIntro() {
      if (ended) return;
      ended = true;
      if (capEl) capEl.classList.remove('is-visible');
      introEl.classList.add('is-done');
      document.body.classList.remove('intro-active');
      setTimeout(() => {
        introEl.remove();
        const veil = document.querySelector('.page-veil');
        if (veil) requestAnimationFrame(() => setTimeout(() => veil.classList.add('lift'), 100));
      }, 960);
    }

    function showScene(idx) {
      if (ended) return;
      if (idx >= scenes.length) {
        if (capEl) capEl.classList.remove('is-visible');
        if (brand) brand.classList.add('is-visible');
        setTimeout(endIntro, BRAND_DUR);
        return;
      }
      const scene = scenes[idx];
      const vid   = scene.querySelector('video');
      if (idx > 0) {
        scenes[idx - 1].classList.remove('is-active');
        scenes[idx - 1].classList.add('is-leaving');
      }
      scene.classList.add('is-active');
      if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
      if (capEl) {
        capEl.classList.remove('is-visible');
        capEl.textContent = scene.dataset.caption || '';
        setTimeout(() => capEl.classList.add('is-visible'), 480);
      }
      setTimeout(() => showScene(idx + 1), SCENE_DUR);
    }

    showScene(0);
    introEl.addEventListener('click', endIntro, { once: true });

  } else {
    /* ---- Page transition veil: lift on load (non-home pages) ---- */
    const veil = document.querySelector('.page-veil');
    if (veil) requestAnimationFrame(() => setTimeout(() => veil.classList.add('lift'), 250));
  }

  /* ---- Animate links to other pages (drop veil before navigating) ---- */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const isInternal = href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !link.target;
    if (isInternal) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (veil) {
          veil.classList.remove('lift');
          veil.classList.add('drop');
          setTimeout(() => { window.location.href = href; }, 600);
        } else {
          window.location.href = href;
        }
      });
    }
  });

  /* ---- Nav: solid on scroll (home only) ---- */
  const nav = document.getElementById('nav');
  if (nav && !nav.classList.contains('nav--solid')) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.nav__burger');
  const mobileNav = document.querySelector('.nav__mobile');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));

  /* ---- Parallax backgrounds ---- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = 0.25;
        el.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }

  /* ---- Gallery filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.masonry__item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const cats = (item.dataset.category || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        item.classList.toggle('hide', !show);
      });
    });
  });

  /* ---- Lightbox ---- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-caption');
    const visibleItems = () => Array.from(items).filter(i => !i.classList.contains('hide'));
    let current = 0;

    const show = (i) => {
      const list = visibleItems();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      const fig = list[current];
      lbImg.src = fig.querySelector('img').src;
      const cap = fig.querySelector('figcaption');
      lbCap.textContent = cap ? cap.textContent : '';
    };

    items.forEach(item => {
      item.addEventListener('click', () => {
        const list = visibleItems();
        show(list.indexOf(item));
        lightbox.classList.add('open');
      });
    });

    const close = () => lightbox.classList.remove('open');
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__next').addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
    lightbox.querySelector('.lightbox__prev').addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq__item').forEach(item => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- Form submit feedback ---- */
  const form = document.querySelector('.contact__form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending… ✦';
      btn.disabled = true;
      btn.style.opacity = '0.8';
    });
  }


  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll('.count-up');
  if (counters.length) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || el.textContent, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => {
      el.dataset.target = parseInt(el.textContent, 10);
      el.textContent = '0';
      countObs.observe(el);
    });
  }

  /* ---- Testimonials carousel auto-scroll ---- */
  const track = document.querySelector('.carousel__track');
  if (track) {
    let pos = 0;
    const speed = 0.6;
    let paused = false;
    track.addEventListener('mouseenter', () => paused = true);
    track.addEventListener('mouseleave', () => paused = false);
    (function scroll() {
      if (!paused) {
        pos += speed;
        const half = track.scrollWidth / 2;
        if (pos >= half) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      requestAnimationFrame(scroll);
    })();
  }

});
