/* ============================================================
   Cocoa & Crumb by Ray - "Grab Them All!" 30 second mini game
   GSAP 3.15 (core, Draggable, InertiaPlugin) - vendored locally

   Cookies shoot up from the bottom in arcs (a little slower than the
   homepage, so they are actually catchable), you grab one mid-flight and
   drag it into the bag before it falls back down.
   ============================================================ */
(function () {
  "use strict";

  gsap.registerPlugin(Draggable, InertiaPlugin);

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DURATION = 30;   // seconds on the clock
  var ON_FIELD = 7;    // cookies in the air at once
  var COOKIES = [
    "media/cookies/chocolate_chip-256.webp",
    "media/cookies/red_velvet-256.webp",
    "media/cookies/orea_white_chocolate-256.webp",
    "media/cookies/frosted_lemon-256.webp",
    "media/cookies/coconut_chocolate-256.webp",
    "media/cookies/chocolatechip-256.webp"
  ];

  var field     = document.getElementById("field");
  var bag       = document.getElementById("bag");
  var bagHint   = document.getElementById("bagHint");
  var timeEl    = document.getElementById("timeValue");
  var scoreEl   = document.getElementById("scoreValue");
  var stopBtn   = document.getElementById("stopBtn");
  var overEl    = document.getElementById("over");
  var overScore = document.getElementById("overScore");
  var overVerdict = document.getElementById("overVerdict");
  var againBtn  = document.getElementById("againBtn");
  var srStatus  = document.getElementById("srStatus");

  var score = 0;
  var remaining = DURATION;
  var running = false;
  var startedAt = 0;
  var live = [];

  /* ---------------- helpers ---------------- */

  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function narrow() { return window.innerWidth < 640; }

  // Launch from anywhere across the width, but not from directly behind the
  // bag - a cookie rising there is hidden for the first part of its arc.
  function launchX(size) {
    var w = field.clientWidth;
    var bagW = bag.offsetWidth || 240;
    var x, tries = 0;
    do {
      x = 10 + Math.random() * Math.max(30, w - size - 20);
      tries++;
      if (Math.abs(x + size / 2 - w / 2) > bagW * 0.42) break;
    } while (tries < 30);
    return x;
  }

  // How high this cookie may fly. Only cookies whose column actually crosses the
  // HUD need to clear it - everything else just has to clear the title, which
  // lets most of the field fly a lot higher.
  function ceilingY(x, size) {
    var title = document.querySelector(".game-title").getBoundingClientRect();
    var hud = document.querySelector(".hud").getBoundingClientRect();
    var ceil = title.bottom + 12;
    if (x < hud.right && x + size > hud.left) ceil = Math.max(ceil, hud.bottom + 12);
    return ceil;
  }

  function killFlight(el) {
    if (el._flight) { el._flight.kill(); el._flight = null; }
  }

  /* ---------------- flight ---------------- */

  // One full arc: up from below the bottom edge, hang, then fall back down.
  // Slower than the homepage burst so there is time to grab one.
  function flight(el, delay) {
    if (!running || el._collected) return;
    killFlight(el);

    var h = field.clientHeight;
    var size = el.offsetWidth || 90;
    var x0 = launchX(size);
    var top = ceilingY(x0, size);

    var startY = h + 30;
    // Peak high up the field - they should really shoot, not just bob into view.
    var peakY = top + Math.random() * Math.max(80, h * 0.24);
    var endY = h + 50;

    var dir = Math.random() < 0.5 ? -1 : 1;
    var drift = dir * (10 + Math.random() * (narrow() ? 50 : 130));
    var spin = dir * (60 + Math.random() * 200);

    // Same speed as the homepage burst (3-4.9s per arc) - the slower version
    // made the game too easy.
    var dur = 3 + Math.random() * 1.9;
    gsap.set(el, { x: x0, y: startY, rotation: -12 + Math.random() * 24, opacity: 1, scale: 1 });

    el._flight = gsap.timeline({
      delay: delay || 0,
      onComplete: function () { flight(el, Math.random() * 0.7); }
    })
      .to(el, { y: peakY, duration: dur * 0.46, ease: "power2.out" }, 0)
      .to(el, { y: endY, duration: dur * 0.54, ease: "power2.in" }, dur * 0.46)
      .to(el, { x: x0 + drift, duration: dur, ease: "none" }, 0)
      .to(el, { rotation: "+=" + spin, duration: dur, ease: "none" }, 0);
  }

  // Dropped somewhere that isn't the bag: let it fall away, then it comes back up.
  function fallAway(el) {
    if (!running || el._collected) return;
    killFlight(el);
    var h = field.clientHeight;
    el._flight = gsap.timeline({
      onComplete: function () { flight(el, Math.random() * 0.6); }
    }).to(el, {
      y: h + 60,
      rotation: "+=" + (Math.random() < 0.5 ? -140 : 140),
      duration: 0.9,
      ease: "power2.in"
    });
  }

  /* ---------------- cookies ---------------- */

  function makeCookie(src, delay) {
    var el = document.createElement("img");
    var size = narrow() ? (54 + Math.random() * 28) : (78 + Math.random() * 46);
    el.className = "cookie";
    el.src = src;
    el.alt = "";
    el.draggable = false;
    el.style.setProperty("--size", size.toFixed(0) + "px");
    gsap.set(el, { x: -999, y: -999 });
    field.appendChild(el);
    live.push(el);

    flight(el, delay);

    Draggable.create(el, {
      type: "x,y",
      bounds: field,
      inertia: true,
      allowContextMenu: true,
      onPress: function () {
        killFlight(el);                       // caught it - stop the arc
        gsap.to(el, { scale: 1.15, duration: 0.18, ease: "power2.out" });
        gsap.set(el, { zIndex: 15 });
      },
      onRelease: function () {
        gsap.to(el, { scale: 1, duration: 0.22, ease: "power2.out" });
      },
      onDragEnd: function () {
        if (!running) return;
        if (this.hitTest(bag, "38%")) collect(el);
        else if (!this.tween) fallAway(el);   // no inertia throw in progress
      },
      onThrowComplete: function () {
        if (!running || el._collected) return;
        if (this.hitTest(bag, "38%")) collect(el);
        else fallAway(el);
      }
    });

    return el;
  }

  function collect(el) {
    if (el._collected) return;
    el._collected = true;
    killFlight(el);

    var d = Draggable.get(el);
    if (d) d.disable();

    var i = live.indexOf(el);
    if (i > -1) live.splice(i, 1);

    score++;
    scoreEl.innerHTML = score + "<span>cookies</span>";
    gsap.fromTo(scoreEl, { scale: 1.28 }, { scale: 1, duration: 0.45, ease: "elastic.out(1,0.45)" });
    srStatus.textContent = score + " cookies collected.";

    var fr = field.getBoundingClientRect();
    var br = bag.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    var toX = (br.left - fr.left) + br.width / 2 - er.width / 2;
    var toY = (br.top - fr.top) + br.height * 0.18;

    gsap.set(el, { zIndex: 2 });   // drop in behind the bag front
    gsap.timeline({
      onComplete: function () {
        el.remove();
        if (running) spawn(1, 0);
      }
    })
      .to(el, { x: toX, y: toY, rotation: "+=180", duration: 0.42, ease: "power2.in" }, 0)
      .to(el, { scale: 0.25, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.16);

    gsap.fromTo(bag,
      { scaleX: 1.1, scaleY: 0.9 },
      { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1,0.4)",
        transformOrigin: "50% 100%", overwrite: true });

    popPlusOne(toX + er.width / 2, toY);
  }

  function popPlusOne(x, y) {
    var p = document.createElement("span");
    p.className = "pop";
    p.textContent = "+1";
    field.appendChild(p);
    gsap.set(p, { x: x, y: y, opacity: 1, scale: 0.6 });
    gsap.to(p, {
      y: y - 70, opacity: 0, scale: 1.25, duration: 0.85, ease: "power2.out",
      onComplete: function () { p.remove(); }
    });
  }

  function spawn(n, baseDelay) {
    for (var i = 0; i < n; i++) {
      makeCookie(COOKIES[Math.floor(Math.random() * COOKIES.length)],
                 (baseDelay || 0) + i * 0.35 + Math.random() * 0.4);
    }
  }

  /* ---------------- clock ---------------- */

  function tick() {
    if (!running) return;
    remaining = DURATION - (gsap.ticker.time - startedAt);
    timeEl.textContent = fmt(remaining);
    if (remaining <= 10) timeEl.classList.add("hud__value--danger");
    else timeEl.classList.remove("hud__value--danger");
    if (remaining <= 0) endGame();
  }

  function verdict(n) {
    if (n === 0) return "Not a single crumb!";
    if (n < 5)   return "A modest nibble.";
    if (n < 10)  return "Nice grabbing!";
    if (n < 18)  return "Lucky you!";
    return "Absolute cookie monster!";
  }

  function endGame() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
    timeEl.textContent = "00:00";

    live.forEach(function (el) {
      var d = Draggable.get(el);
      if (d) d.disable();
      killFlight(el);
      gsap.to(el, { opacity: 0.25, duration: 0.4 });
    });

    overScore.textContent = score;
    overVerdict.textContent = verdict(score);
    overEl.hidden = false;
    srStatus.textContent = "Time is up. Final score: " + score + " cookies.";

    gsap.from(overEl.querySelector(".over__inner"), { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" });
    gsap.from(overScore, { scale: 0.4, duration: 0.8, ease: "elastic.out(1,0.5)", delay: 0.12 });
  }

  function reset() {
    live.slice().forEach(function (el) {
      var d = Draggable.get(el);
      if (d) d.kill();
      killFlight(el);
      el.remove();
    });
    live = [];
    field.querySelectorAll(".cookie,.pop").forEach(function (n) { n.remove(); });

    score = 0;
    scoreEl.innerHTML = "0<span>cookies</span>";
    remaining = DURATION;
    timeEl.textContent = fmt(DURATION);
    timeEl.classList.remove("hud__value--danger");
    overEl.hidden = true;

    start();
  }

  function start() {
    running = true;
    startedAt = gsap.ticker.time;
    spawn(ON_FIELD, 0.2);
    gsap.ticker.add(tick);
    srStatus.textContent = "Game started. Grab the cookies and drag them into the bag.";

    if (!REDUCED) {
      gsap.fromTo(bag, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.6)" });
      gsap.fromTo(bagHint, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5 });
      gsap.to(bagHint, { opacity: 0, duration: 0.5, delay: 5 });
    }
  }

  /* ---------------- controls ---------------- */

  // "Stop" leaves the game immediately, straight back to the homepage.
  stopBtn.addEventListener("click", function () {
    running = false;
    gsap.ticker.remove(tick);
    window.location.href = "index.html";
  });

  againBtn.addEventListener("click", reset);

  window.addEventListener("resize", function () {
    live.forEach(function (el) {
      var d = Draggable.get(el);
      if (d) d.update(true);
    });
  });

  start();
})();
