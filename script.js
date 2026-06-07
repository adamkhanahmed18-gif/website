// Nav transparency → solid on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu
const burger = document.querySelector('.nav__burger');
const mobileNav = document.querySelector('.nav__mobile');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// Scroll-in animations
const fadeEls = document.querySelectorAll(
  '.service-card, .testimonial, .process__step, .gallery__item, .about__stat-bubble, .contact__card'
);
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
      }, entry.target.dataset.delay || 0);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fadeEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px) scale(0.98)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  el.dataset.delay = (i % 4) * 80;
  observer.observe(el);
});

// Form submission
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', (e) => {
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending… ✦';
    btn.disabled = true;
    btn.style.opacity = '0.8';
  });
}
