/* ============================================================
   GHAFOORS IMMIGRATION — COMPLETE JAVASCRIPT
   ============================================================ */

'use strict';

/* ============================================================
   1. STICKY NAV WITH SCROLL DETECTION
   ============================================================ */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   2. MOBILE HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (isOpen) toggleMenu();
    });
  });

  // Close on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) toggleMenu();
  });
})();

/* ============================================================
   3. DROPDOWN MENUS
   ============================================================ */
(function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(function(dropdown) {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    // Desktop: hover already handled via CSS
    // Mobile tap support
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        dropdowns.forEach(function(d) { d.classList.remove('open'); });
        if (!isOpen) dropdown.classList.add('open');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(function(d) { d.classList.remove('open'); });
    }
  });
})();

/* ============================================================
   4. INTERSECTION OBSERVER SCROLL ANIMATIONS
   ============================================================ */
(function initScrollAnimations() {
  var animatedEls = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  animatedEls.forEach(function(el) {
    observer.observe(el);
  });

  // Fallback: ensure nothing stays hidden if observer misses elements (e.g. fast scroll)
  setTimeout(function() {
    animatedEls.forEach(function(el) {
      el.classList.add('visible');
    });
  }, 3500);
})();

/* ============================================================
   5. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = el.getAttribute('data-count');
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isDecimal = target.includes('.');
    const numTarget = parseFloat(target);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = easedProgress * numTarget;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });
})();

/* ============================================================
   6. FAQ ACCORDION
   ============================================================ */
(function initAccordion() {
  document.querySelectorAll('.accordion').forEach(function(accordion) {
    const items = accordion.querySelectorAll('.accordion-item');

    items.forEach(function(item) {
      const header = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');
      if (!header || !body) return;

      header.addEventListener('click', function() {
        const isOpen = item.classList.contains('open');

        // Close all items in this accordion
        items.forEach(function(otherItem) {
          otherItem.classList.remove('open');
          const otherBody = otherItem.querySelector('.accordion-body');
          if (otherBody) otherBody.style.maxHeight = '0';
        });

        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  });
})();

/* ============================================================
   7. SERVICES MARQUEE (auto-scroll via CSS — just pausing on hover handled via CSS)
   ============================================================ */
// Marquee is CSS-driven. The JS below ensures it works by duplicating content if needed.
(function initMarquee() {
  const tracks = document.querySelectorAll('.marquee-track');
  tracks.forEach(function(track) {
    // Duplicate content if not already done
    if (!track.dataset.duplicated) {
      const original = track.innerHTML;
      track.innerHTML = original + original;
      track.dataset.duplicated = 'true';
    }
  });
})();

/* ============================================================
   8. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim());
  }

  function showError(group, msg) {
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error-msg');
    if (errEl) errEl.textContent = msg;
    const input = group.querySelector('.form-input, .form-select, .form-textarea');
    if (input) input.classList.add('error');
  }

  function clearError(group) {
    group.classList.remove('has-error');
    const input = group.querySelector('.form-input, .form-select, .form-textarea');
    if (input) input.classList.remove('error');
  }

  // Clear error on input
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(input) {
    input.addEventListener('input', function() {
      const group = input.closest('.form-group');
      if (group) clearError(group);
    });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    // Validate first name
    const firstNameGroup = form.querySelector('[data-field="first-name"]');
    if (firstNameGroup) {
      const val = firstNameGroup.querySelector('.form-input').value.trim();
      if (!val) {
        showError(firstNameGroup, 'First name is required.');
        valid = false;
      } else {
        clearError(firstNameGroup);
      }
    }

    // Validate last name
    const lastNameGroup = form.querySelector('[data-field="last-name"]');
    if (lastNameGroup) {
      const val = lastNameGroup.querySelector('.form-input').value.trim();
      if (!val) {
        showError(lastNameGroup, 'Last name is required.');
        valid = false;
      } else {
        clearError(lastNameGroup);
      }
    }

    // Validate email
    const emailGroup = form.querySelector('[data-field="email"]');
    if (emailGroup) {
      const val = emailGroup.querySelector('.form-input').value.trim();
      if (!val) {
        showError(emailGroup, 'Email address is required.');
        valid = false;
      } else if (!validateEmail(val)) {
        showError(emailGroup, 'Please enter a valid email address.');
        valid = false;
      } else {
        clearError(emailGroup);
      }
    }

    // Validate phone (optional but if filled, check format)
    const phoneGroup = form.querySelector('[data-field="phone"]');
    if (phoneGroup) {
      const val = phoneGroup.querySelector('.form-input').value.trim();
      if (val && !validatePhone(val)) {
        showError(phoneGroup, 'Please enter a valid phone number.');
        valid = false;
      } else {
        clearError(phoneGroup);
      }
    }

    // Validate visa type
    const visaGroup = form.querySelector('[data-field="visa-type"]');
    if (visaGroup) {
      const val = visaGroup.querySelector('.form-select').value;
      if (!val) {
        showError(visaGroup, 'Please select a visa type.');
        valid = false;
      } else {
        clearError(visaGroup);
      }
    }

    // Validate message
    const messageGroup = form.querySelector('[data-field="message"]');
    if (messageGroup) {
      const val = messageGroup.querySelector('.form-textarea').value.trim();
      if (!val || val.length < 10) {
        showError(messageGroup, 'Please provide a brief message (at least 10 characters).');
        valid = false;
      } else {
        clearError(messageGroup);
      }
    }

    // Validate checkbox
    const checkboxGroup = form.querySelector('[data-field="privacy"]');
    if (checkboxGroup) {
      const checked = checkboxGroup.querySelector('input[type="checkbox"]').checked;
      if (!checked) {
        showError(checkboxGroup, 'Please agree to the privacy policy to proceed.');
        valid = false;
      } else {
        clearError(checkboxGroup);
      }
    }

    if (valid) {
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          form.style.display = 'none';
          if (successMsg) {
            successMsg.classList.add('visible');
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
          }
          alert('There was a problem sending your message. Please try again or call us on 033 0133 3687.');
        }
      })
      .catch(function() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
        }
        alert('There was a problem sending your message. Please try again or call us on 033 0133 3687.');
      });
    }
  });
})();

/* ============================================================
   9. FLOATING WHATSAPP BUTTON
   ============================================================ */
// WhatsApp button is rendered in HTML — JS just ensures it shows after short delay
(function initWhatsApp() {
  const btn = document.querySelector('.whatsapp-float');
  if (!btn) return;
  btn.style.opacity = '0';
  btn.style.transform = 'translateY(20px)';
  setTimeout(function() {
    btn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    btn.style.opacity = '1';
    btn.style.transform = 'translateY(0)';
  }, 1500);
})();

/* ============================================================
   10. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   11. ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
(function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href === './' + currentPath || href === '/' + currentPath)) {
      link.classList.add('active');
    }
  });
})();

/* ============================================================
   12. COOKIE CONSENT BANNER
   ============================================================ */
(function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const accepted = localStorage.getItem('ghafoors_cookies_accepted');
  if (accepted) {
    banner.classList.add('hidden');
    return;
  }

  const acceptBtn = banner.querySelector('[data-cookie="accept"]');
  const declineBtn = banner.querySelector('[data-cookie="decline"]');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('ghafoors_cookies_accepted', 'true');
      banner.classList.add('hidden');
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      localStorage.setItem('ghafoors_cookies_accepted', 'false');
      banner.classList.add('hidden');
    });
  }
})();

/* ============================================================
   13. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();

/* ============================================================
   14. BLOG FILTER BUTTONS
   ============================================================ */
(function initBlogFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const cards = document.querySelectorAll('.blog-card[data-category]');

      cards.forEach(function(card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ============================================================
   15. PAGE LOAD — trigger hero animations
   ============================================================ */
(function initPageLoad() {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.4s ease';

  window.addEventListener('load', function() {
    document.documentElement.style.opacity = '1';
  });

  // Fallback
  setTimeout(function() {
    document.documentElement.style.opacity = '1';
  }, 300);
})();
