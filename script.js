/* JPS Plastering — site behaviour */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- intro veil (first visit this session only) ---------- */
  var intro = document.querySelector(".intro");
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem("jps-intro") === "1"; } catch (e) {}
    if (seen || prefersReduced) {
      intro.remove();
      document.body.classList.add("is-ready");
    } else {
      try { sessionStorage.setItem("jps-intro", "1"); } catch (e) {}
      setTimeout(function () {
        intro.classList.add("is-done");
        document.body.classList.add("is-ready");
        setTimeout(function () { intro.remove(); }, 1100);
      }, 2900);
    }
  } else {
    document.body.classList.add("is-ready");
  }

  /* ---------- page transition veil ---------- */
  var veil = document.querySelector(".veil");
  if (veil && !prefersReduced) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank") return;
      if (/^(https?:|mailto:|tel:)/.test(href)) return;
      if (href.indexOf("#") !== -1 && href.split("#")[0] === location.pathname.split("/").pop()) return;
      e.preventDefault();
      veil.classList.add("is-on");
      setTimeout(function () { location.href = href; }, 420);
    });
    window.addEventListener("pageshow", function () { veil.classList.remove("is-on"); });
  }

  /* ---------- nav: scrolled state + hide on scroll down ---------- */
  var nav = document.querySelector(".nav");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 40);
      if (y > 360 && y > lastY && !document.body.classList.contains("menu-open")) {
        nav.classList.add("is-hidden");
      } else {
        nav.classList.remove("is-hidden");
      }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector(".nav__burger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        burger.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealed = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !prefersReduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = (String(el.getAttribute("data-count")).split(".")[1] || "").length;
        var t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1600, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- horizontal scroller: drag ---------- */
  document.querySelectorAll(".scroller").forEach(function (sc) {
    var isDown = false, startX = 0, startLeft = 0, moved = false;
    sc.addEventListener("pointerdown", function (e) {
      isDown = true; moved = false;
      startX = e.clientX; startLeft = sc.scrollLeft;
      sc.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      sc.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      isDown = false;
      sc.classList.remove("is-dragging");
    });
    sc.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  /* ---------- gallery: filters + lightbox ---------- */
  var grid = document.querySelector(".masonry");
  if (grid) {
    var items = Array.prototype.slice.call(grid.querySelectorAll(".g-item"));
    document.querySelectorAll(".filters button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelector(".filters .is-active").classList.remove("is-active");
        btn.classList.add("is-active");
        var f = btn.getAttribute("data-filter");
        items.forEach(function (it) {
          it.classList.toggle("is-hidden", f !== "all" && it.getAttribute("data-cat") !== f);
        });
      });
    });

    var lb = document.querySelector(".lightbox");
    if (lb) {
      var lbImg = lb.querySelector("img");
      var lbCap = lb.querySelector(".lb-cap");
      var cur = 0;
      function visible() { return items.filter(function (i) { return !i.classList.contains("is-hidden"); }); }
      function openAt(item) {
        var vis = visible();
        cur = vis.indexOf(item);
        show(vis);
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
      }
      function show(vis) {
        var img = vis[cur].querySelector("img");
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = vis[cur].getAttribute("data-cap") || img.alt;
      }
      function step(d) {
        var vis = visible();
        cur = (cur + d + vis.length) % vis.length;
        show(vis);
      }
      function close() {
        lb.classList.remove("is-open");
        document.body.style.overflow = "";
      }
      items.forEach(function (it) { it.addEventListener("click", function () { openAt(it); }); });
      lb.querySelector(".lb-close").addEventListener("click", close);
      lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
      lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      document.querySelectorAll(".faq__item.is-open").forEach(function (o) {
        o.classList.remove("is-open");
        o.querySelector(".faq__a").style.maxHeight = null;
        o.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- services subnav active state ---------- */
  var subnavLinks = document.querySelectorAll(".subnav a");
  if (subnavLinks.length && "IntersectionObserver" in window) {
    var secs = document.querySelectorAll(".svc-detail[id]");
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subnavLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    secs.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
