// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile burger menu
const burger = document.querySelector('.nav__burger');
const mobileNav = document.querySelector('.nav__mobile');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

// Close mobile nav on link click
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .testimonial, .process__step, .gallery__item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Form submission feedback
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', async (e) => {
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
  });
}
