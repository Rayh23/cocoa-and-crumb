/* ============================================================
   Cocoa & Crumb by Ray - homepage motion
   GSAP 3.15 (core, ScrollTrigger, SplitText) - vendored locally
   ============================================================ */
(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var smoother = null;

  var COOKIES = [
    "media/cookies/chocolate_chip-256.webp",
    "media/cookies/red_velvet-256.webp",
    "media/cookies/orea_white_chocolate-256.webp",
    "media/cookies/frosted_lemon-256.webp",
    "media/cookies/coconut_chocolate-256.webp",
    "media/cookies/chocolatechip-256.webp"
  ];

  /* ---------------------------------------------------------
     0. Smooth scrolling
     --------------------------------------------------------- */
  function smoothScroll() {
    // Never hijack the scrollbar for someone who asked for less motion.
    if (REDUCED) return;
    // Touch keeps its native scroll: momentum scrolling is already good there,
    // and lerping it fights the platform (ScrollSmoother's own default too).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!document.getElementById("smooth-wrapper")) return;

    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,          // seconds to "catch up" - past ~1.5 it reads as lag
      effects: true,      // enables data-speed / data-lag attributes
      smoothTouch: 0,
      normalizeScroll: true
    });

    // ScrollSmoother owns the scroll position, so native anchor jumps and
    // CSS scroll-behavior no longer apply - route in-page links through it.
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (!id || id === "#" || !document.querySelector(id)) return;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        smoother.scrollTo(id, true, "top top");
      });
    });
  }

  /* ---------------------------------------------------------
     0b. Direction-aware header
     --------------------------------------------------------- */
  function directionalNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    // Reduced motion keeps the header permanently visible rather than sliding.
    if (REDUCED) return;

    // A "from" tween parked at progress 1, i.e. sitting in its visible state.
    // play() brings it down, reverse() tucks it away.
    var slide = gsap.from(nav, {
      yPercent: -100,
      paused: true,
      duration: 0.4,
      ease: "power2.out"
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: function (self) {
        if (self.direction === -1) {
          slide.play();               // scrolling up - bring it back
        } else if (self.scroll() > 220) {
          slide.reverse();            // scrolling down, past the hero - hide it
        }
        // the bar and its underline only exist once the page has moved
        nav.classList.toggle("nav--stuck", self.scroll() > 40);
      }
    });
  }

  /* ---------------------------------------------------------
     1. Hero headline
     --------------------------------------------------------- */
  function heroText() {
    var words = document.querySelectorAll(".hero-word");
    if (!words.length) return;

    if (REDUCED) {
      gsap.set(words, { y: 0, opacity: 1 });
      gsap.set("[data-fade]", { opacity: 1, y: 0 });
      return;
    }

    var tl = gsap.timeline();

    tl.from(words, {
      yPercent: 118,
      rotate: 5,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.09
    });

    // the signature lands last, like it is being written on
    tl.from(".hero__by", {
      opacity: 0,
      y: 14,
      rotation: -20,
      scale: 0.8,
      duration: 0.7,
      ease: "back.out(1.7)",
      transformOrigin: "left bottom"
    }, "-=0.5");

    tl.from(".hero__inner [data-fade]", {
      y: 26,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.12
    }, "-=0.55");

    return tl;
  }

  /* ---------------------------------------------------------
     2. Cookies launch out of the bag
     --------------------------------------------------------- */
  function heroLaunch() {
    var stage = document.getElementById("heroStage");
    if (!stage || REDUCED) return;

    // Fewer, smaller cookies on narrow screens - at full size and count they
    // swamp the headline on a phone.
    var vw = window.innerWidth;
    var small = vw < 640, mid = vw < 1024;
    var COUNT = small ? 7 : (mid ? 11 : 16);
    var sizeMin = small ? 34 : (mid ? 46 : 54);
    var sizeVar = small ? 24 : (mid ? 40 : 56);

    var pool = [];

    for (var i = 0; i < COUNT; i++) {
      var img = document.createElement("img");
      img.className = "fly";
      img.src = COOKIES[i % COOKIES.length];
      img.alt = "";
      img.style.setProperty("--fly-size", (sizeMin + Math.random() * sizeVar).toFixed(0) + "px");
      stage.appendChild(img);
      pool.push(img);
    }

    // one cookie's flight: shoots up past the bottom edge, arcs, tumbles back down
    function launch(el, delay) {
      var h = stage.offsetHeight || 700;
      var dir = Math.random() < 0.5 ? -1 : 1;
      var driftX = dir * (30 + Math.random() * 190);
      var peakY = -(h * (0.5 + Math.random() * 0.5));
      var spin = dir * (160 + Math.random() * 520);
      var dur = 3 + Math.random() * 1.9;

      gsap.set(el, {
        left: (6 + Math.random() * 88).toFixed(2) + "%",
        x: 0, y: 0, rotation: 0, opacity: 0, scale: 0.9
      });

      var tl = gsap.timeline({
        delay: delay,
        onComplete: function () { launch(el, Math.random() * 3.4); }
      });

      tl.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0);

      // vertical: fast up, hangs at the peak, accelerates back down
      tl.to(el, { y: peakY, duration: dur * 0.45, ease: "power2.out" }, 0)
        .to(el, { y: 80, duration: dur * 0.55, ease: "power2.in" }, dur * 0.45);

      // linear horizontal drift = a natural parabola
      tl.to(el, { x: driftX, duration: dur, ease: "none" }, 0);
      tl.to(el, { rotation: spin, duration: dur, ease: "none" }, 0);
      tl.to(el, { opacity: 0, duration: 0.55, ease: "power1.in" }, dur - 0.55);
    }

    // opening burst is dense, then it settles into a steady drift
    pool.forEach(function (el, i) {
      launch(el, 0.35 + i * 0.13 + Math.random() * 0.25);
    });
  }

  /* ---------------------------------------------------------
     3. Rotating game badge
     --------------------------------------------------------- */
  function badge() {
    var blob = document.getElementById("badgeBlob");
    var el = document.getElementById("gameBadge");
    if (!blob || !el) return;

    if (!REDUCED) {
      gsap.to(blob, { rotation: 360, duration: 14, ease: "none", repeat: -1 });
    }

    el.addEventListener("mouseenter", function () {
      gsap.to(el, { scale: 1.09, duration: 0.35, ease: "back.out(2.5)" });
    });
    el.addEventListener("mouseleave", function () {
      gsap.to(el, { scale: 1, duration: 0.35, ease: "power2.out" });
    });

    // pop in once the hero has settled
    gsap.from(el, { scale: 0, rotation: -90, duration: 0.9, ease: "back.out(1.8)", delay: 1.3 });
  }

  /* ---------------------------------------------------------
     4. Flavours - cookie shoots out of its blob on hover
     --------------------------------------------------------- */
  function flavours() {
    document.querySelectorAll("[data-flavour]").forEach(function (card, idx) {
      var stage = card.querySelector(".flavour__stage");
      var cookie = card.querySelector(".flavour__cookie");
      var blob = card.querySelector(".flavour__blob");
      var ring = card.querySelector(".flavour__ring");
      if (!stage || !cookie) return;

      // the blob's shape morph lives in CSS (@keyframes blobMorph) - see style.css
      // The name ring only sways: a full rotation would turn the flavour name
      // upside-down for half of every cycle.
      if (!REDUCED) {
        gsap.to(ring, {
          rotation: 7, duration: 6 + idx * 0.6, ease: "sine.inOut",
          yoyo: true, repeat: -1, transformOrigin: "50% 50%",
          startAt: { rotation: -7 }
        });
      }

      if (REDUCED) {
        gsap.set(card, { opacity: 1, y: 0 });
        return;
      }

      // scroll reveal
      gsap.from(card, {
        y: 48, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      });

      var hoverTl = gsap.timeline({ paused: true });
      hoverTl
        .to(cookie, { y: -46, scale: 1.16, rotation: 9, duration: 0.55, ease: "back.out(2.2)" }, 0)
        .to(blob, { scale: 1.07, duration: 0.55, ease: "power2.out" }, 0)
        .to(ring, { scale: 1.05, duration: 0.55, ease: "power2.out" }, 0);

      stage.addEventListener("mouseenter", function () { hoverTl.play(); });
      stage.addEventListener("mouseleave", function () { hoverTl.reverse(); });

      // keyboard parity
      card.setAttribute("tabindex", "0");
      card.addEventListener("focus", function () { hoverTl.play(); });
      card.addEventListener("blur", function () { hoverTl.reverse(); });
    });
  }

  /* ---------------------------------------------------------
     5. Magnetic order buttons
     The button leans toward the cursor while it is nearby, then springs
     back when the cursor leaves its field. Order CTAs only.
     --------------------------------------------------------- */
  function magnetic() {
    if (REDUCED) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      var PULL = 0.34;   // fraction of the cursor's offset the button travels
      var FIELD = 80;    // how far outside the button the magnetism reaches

      // quickTo reuses one tween per axis instead of allocating on every move
      var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
      var inField = false;

      window.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;

        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        // elliptical field so wide buttons keep a sensible reach
        var within = Math.abs(dx) < r.width / 2 + FIELD &&
                     Math.abs(dy) < r.height / 2 + FIELD;

        if (within) {
          inField = true;
          xTo(dx * PULL);
          yTo(dy * PULL);
        } else if (inField) {
          // left the field: one springy tug back, then stop tracking
          inField = false;
          gsap.to(btn, {
            x: 0, y: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.4)",
            overwrite: true
          });
        }
      }, { passive: true });

      // keyboard and touch users never trigger the field, so make sure a
      // focused button is never left offset
      btn.addEventListener("blur", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power3.out", overwrite: true });
      });
    });
  }

  /* ---------------------------------------------------------
     6. Chocolate chip cursor follower
     --------------------------------------------------------- */
  function cursorCookie() {
    if (REDUCED) return;
    // only where there is a real cursor to follow
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var el = document.createElement("img");
    el.className = "cursor-cookie";
    el.src = "media/cookies/chocolate_chip-256.webp";
    el.alt = "";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.5 });

    // quickTo reuses one tween per property instead of spawning a new tween on
    // every pointermove - the difference matters at ~120 events/second.
    var xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    var yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    var rTo = gsap.quickTo(el, "rotation", { duration: 1.1, ease: "power2" });

    var lastX = null, spin = 0, shown = false;

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      xTo(e.clientX);
      yTo(e.clientY);

      // tilt with horizontal travel so it reads like the cookie is rolling
      if (lastX !== null) {
        spin += (e.clientX - lastX) * 0.55;
        rTo(spin);
      }
      lastX = e.clientX;

      if (!shown) {
        shown = true;
        gsap.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
      }
    }, { passive: true });

    // hide it when the pointer leaves the window entirely
    document.addEventListener("mouseleave", function () {
      shown = false;
      gsap.to(el, { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.in" });
    });

    // a little bigger over anything clickable
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest("a, button, .flavour__stage")) {
        gsap.to(el, { scale: 1.7, duration: 0.3, ease: "back.out(2)" });
      }
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest("a, button, .flavour__stage")) {
        gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
      }
    });
  }

  /* ---------------------------------------------------------
     7. Generic scroll reveals
     --------------------------------------------------------- */
  function reveals() {
    var items = document.querySelectorAll("[data-fade]:not(.hero__inner [data-fade])");
    items.forEach(function (el) {
      if (REDUCED) { gsap.set(el, { opacity: 1, y: 0 }); return; }
      gsap.from(el, {
        y: 30, opacity: 0, duration: 0.75, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });
  }

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */
  function init() {
    smoothScroll();
    directionalNav();
    heroText();
    heroLaunch();
    badge();
    flavours();
    magnetic();
    cursorCookie();
    reveals();
    ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
