/* ============================================================
   FLIGHT MM2026 — interactions  (production build)
   Progressive enhancement:
     • Lenis  -> real smooth scroll (the "one continuous ride")
     • GSAP + ScrollTrigger -> drives Lenis + scroll choreography
     • Falls back gracefully to native scroll / IntersectionObserver
       and fully respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;
  const hasST   = hasGSAP && !!window.ScrollTrigger;
  const useLenis = !!window.Lenis && !reduce;
  const legs = Array.from(document.querySelectorAll('.leg'));

  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (hasGSAP && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

  /* ---- Lucide icons ---- */
  if (window.lucide) window.lucide.createIcons();

  /* ============================================================
     LENIS — smooth scroll backbone
     ============================================================ */
  let lenis = null;
  if (useLenis) {
    lenis = new Lenis({
      lerp: 0.1,            // continuous easing — lighter & smoother than fixed duration
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5, // native touch stays untouched on mobile
    });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ============================================================
     SCROLL REVEALS
     ============================================================ */
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in'));
  }

  /* ============================================================
     IMAGE SLOTS — hide placeholder once the real image loads
     ============================================================ */
  document.querySelectorAll('.image-slot > img').forEach((img) => {
    const fig = img.closest('.image-slot');
    if (!fig) return;
    const done = () => fig.classList.add('is-loaded');
    const fail = () => fig.classList.add('is-error');
    if (img.complete) { (img.naturalWidth ? done : fail)(); }
    else { img.addEventListener('load', done); img.addEventListener('error', fail); }
  });

  /* ============================================================
     PROGRESS RAIL — active leg + click-to-scroll  (no text TOC)
     ============================================================ */
  const railBtns = Array.from(document.querySelectorAll('.rail button, .rail-mobile button'));
  const desktopBtns = Array.from(document.querySelectorAll('.rail button'));
  const railPlane = document.querySelector('.rail-plane');
  const bpNow = document.querySelector('.bp-tab .leg-now');

  function moveRailPlane(idx) {
    if (!railPlane) return;
    const b = desktopBtns[idx];
    if (b) railPlane.style.top = (b.offsetTop + b.offsetHeight / 2) + 'px';
  }

  function setActive(idx) {
    railBtns.forEach((b) => b.setAttribute('aria-current', String(+b.dataset.leg === idx)));
    const leg = legs[idx];
    if (leg && bpNow) bpNow.textContent = leg.dataset.code || ('LEG ' + idx);
    moveRailPlane(idx);
  }
  railBtns.forEach((b) => {
    b.addEventListener('click', () => scrollToEl(legs[+b.dataset.leg]));
  });

  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(legs.indexOf(e.target)); });
  }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
  legs.forEach((l) => activeIO.observe(l));
  setActive(0);

  /* ============================================================
     COUNTERS — count up on reach  [data-anim="counter"]
     ============================================================ */
  document.querySelectorAll('[data-anim="counter"]').forEach((el) => {
    const target = +el.dataset.to;
    if (reduce) { el.textContent = target; return; }
    let started = false;
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true;
          const dur = 1400, t0 = performance.now();
          (function tick(now) {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target);
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
          co.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* ============================================================
     GAUGES — needle sweep on reach  [data-anim="gauge"]
     ============================================================ */
  document.querySelectorAll('[data-anim="gauge"]').forEach((g) => {
    const val = parseFloat(g.dataset.val) || 0;
    if (reduce) { g.style.setProperty('--val', val); return; }
    const go = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => g.style.setProperty('--val', val));
          go.unobserve(g);
        }
      });
    }, { threshold: 0.5 });
    go.observe(g);
  });
  // build gauge ticks
  document.querySelectorAll('.gauge .ticks').forEach((t) => {
    for (let i = 0; i <= 10; i++) {
      const tick = document.createElement('i');
      tick.style.setProperty('--a', (-90 + i * 18) + 'deg');
      t.appendChild(tick);
    }
  });

  /* ============================================================
     SPLIT-FLAP HERO — flip to MATHIEU MOENS  [data-anim="flap"]
     ============================================================ */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  document.querySelectorAll('.flap[data-final]').forEach((flap, i) => {
    const final = flap.dataset.final;
    if (reduce) { flap.textContent = final; return; }
    flap.textContent = GLYPHS[Math.floor(Math.random() * 26)];
    let frames = 0;
    const total = 8 + i * 2;          // stagger: later flaps flip longer
    const spin = setInterval(() => {
      frames++;
      if (frames >= total) {
        flap.textContent = final;
        flap.classList.add('amber');
        setTimeout(() => flap.classList.remove('amber'), 260);
        clearInterval(spin);
      } else {
        flap.textContent = GLYPHS[Math.floor(Math.random() * 26)];
      }
    }, 55);
  });

  /* ============================================================
     CONTAINER — lid opens on reach  [data-anim="container"]
     ============================================================ */
  document.querySelectorAll('[data-anim="container"]').forEach((c) => {
    if (reduce) { c.classList.add('open'); return; }
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setTimeout(() => c.classList.add('open'), 350); co.unobserve(c); }
      });
    }, { threshold: 0.45 });
    co.observe(c);
  });

  /* ============================================================
     STAMPS — "thunk" in on reach  [data-anim="stamp"]
     ============================================================ */
  document.querySelectorAll('[data-anim="stamp"]').forEach((s) => {
    if (reduce) { s.classList.add('in'); return; }
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { s.classList.add('in'); so.unobserve(s); }
      });
    }, { threshold: 0.4 });
    so.observe(s);
  });

  /* ============================================================
     GLOBE — activate arc draw + pin drop + slow spin on reach
     ============================================================ */
  document.querySelectorAll('[data-anim="globe"]').forEach((g) => {
    if (reduce) { g.classList.add('is-active'); return; }
    const go = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { g.classList.add('is-active'); go.unobserve(g); }
      });
    }, { threshold: 0.35 });
    go.observe(g);
  });

  /* ============================================================
     FLIP-BOARD — mechanical reveal on reach  [data-anim="flip"]
     ============================================================ */
  document.querySelectorAll('[data-anim="flip"]').forEach((f) => {
    if (reduce) { f.classList.add('flipped'); return; }
    const fo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { f.classList.add('flipped'); fo.unobserve(f); }
      });
    }, { threshold: 0.4 });
    fo.observe(f);
  });

  /* ============================================================
     OFMAN KERNKWADRANT — draw connecting arrows on reach
     ============================================================ */
  document.querySelectorAll('[data-anim="ofman"]').forEach((k) => {
    if (reduce) { k.classList.add('drawn'); return; }
    const ko = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { k.classList.add('drawn'); ko.unobserve(k); }
      });
    }, { threshold: 0.4 });
    ko.observe(k);
  });

  /* ============================================================
     WAYPOINTS — radar ping on reach  [data-anim="waypoint"]
     ============================================================ */
  document.querySelectorAll('[data-anim="waypoint"]').forEach((w, i) => {
    const wo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setTimeout(() => w.classList.add('is-reached'), i * 220); wo.unobserve(w); }
      });
    }, { threshold: 0.5 });
    wo.observe(w);
  });

  /* ============================================================
     FLIGHT PATH — weaving dashed path through all legs;
     the trail fills + a plane rides it, scrubbed to scroll.
     [data-anim="flightpath" / "plane"]
     ============================================================ */
  const wrap = document.querySelector('.flightpath-wrap');
  const svg = wrap && wrap.querySelector('svg');
  const linePath = svg && svg.querySelector('.fp-line:not(.trail)');
  const trailPath = svg && svg.querySelector('.fp-line.trail');
  const plane = svg && svg.querySelector('.fp-plane');

  function buildPath() {
    if (!svg) return 0;
    const W = window.innerWidth;
    const H = document.documentElement.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    wrap.style.height = H + 'px';

    const margin = Math.max(60, Math.min(W * 0.16, 220));
    const pts = legs.map((leg, i) => {
      const y = leg.offsetTop + leg.offsetHeight * 0.5;
      const x = (i % 2 === 0) ? margin : W - margin;
      return { x, y };
    });
    pts.unshift({ x: W * 0.5, y: 40 });

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i], p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    linePath.setAttribute('d', d);
    trailPath.setAttribute('d', d);
    const len = linePath.getTotalLength();
    trailPath.style.strokeDasharray = len;
    return len;
  }

  let pathLen = 0;
  function progress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  }
  function updatePlane() {
    if (!linePath || !plane || !pathLen) return;
    const prog = progress();
    const at = pathLen * prog;
    const pt = linePath.getPointAtLength(at);
    const ahead = linePath.getPointAtLength(Math.min(pathLen, at + 1));
    const ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
    plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`);
    if (trailPath) trailPath.style.strokeDashoffset = pathLen * (1 - prog);
  }

  /* ---- hero parallax layers ---- */
  const layers = document.querySelectorAll('[data-parallax]');
  function parallax() {
    if (reduce) return;
    const y = window.scrollY;
    layers.forEach((l) => {
      const sp = parseFloat(l.dataset.parallax) || 0.2;
      l.style.transform = `translateY(${y * sp}px)`;
    });
  }

  /* ---- hero boarding-pass tear-away stub (reverses on scroll up) ---- */
  const heroSection = document.querySelector('.hero');
  const tearStub = document.querySelector('[data-tear] .bp-stub');
  function tear() {
    if (reduce || !tearStub || !heroSection) return;
    const h = heroSection.offsetHeight || window.innerHeight;
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));
    // origin bottom-left: top-right corner peels first, bottom-left stays attached
    const rx = p * 40;   // top tilts back
    const ry = p * -58;  // right edge peels back
    const tx = p * 9;
    tearStub.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateX(${tx}px)`;
    tearStub.style.opacity = String(1 - p * 0.12);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updatePlane(); parallax(); tear(); ticking = false; });
  }

  function rebuild() {
    pathLen = buildPath() || 0;
    if (lenis) lenis.resize();   // recompute scroll limit after images/fonts settle
    updatePlane();
    moveRailPlane(desktopBtns.findIndex((b) => b.getAttribute('aria-current') === 'true') || 0);
    if (hasST) ScrollTrigger.refresh();
  }

  if (lenis) lenis.on('scroll', onScroll);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', rebuild);
  window.addEventListener('resize', () => { clearTimeout(window.__rt); window.__rt = setTimeout(rebuild, 180); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(rebuild, 60));
  rebuild();
  setTimeout(rebuild, 400);
})();
