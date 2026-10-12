(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Tablet (768+) keeps pin-driven horizontal scroll; phone stacks */
  var desktopMQ = window.matchMedia("(min-width: 768px)");
  /* TBFYBL text-only layout ≤1024 — skip parallax that fights collapsed photo stages */
  var tbMobileMQ = window.matchMedia("(max-width: 1024px)");
  /* Proven slider: ≤1366 (mobile ≤767 uses carousel via !desktopMQ) */
  var tbCarouselMQ = window.matchMedia("(max-width: 1366px)");

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function sectionProgress(section) {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function getHeaderOffset() {
    var page = document.querySelector(".page-refined");
    if (!page) return 118;
    var raw = getComputedStyle(page).getPropertyValue("--pp-header-offset");
    return parseFloat(raw) || 118;
  }

  function getCoachStickyGap() {
    var page = document.querySelector(".page-refined");
    if (!page) return 48;
    var raw = getComputedStyle(page).getPropertyValue("--pp-coach-sticky-gap");
    return parseFloat(raw) || 48;
  }

  function getCoachStickyTop() {
    return getHeaderOffset() + getCoachStickyGap();
  }

  function pinnedSectionProgress(section, headerOffset) {
    var rect = section.getBoundingClientRect();
    var scrollDistance = section.offsetHeight - (window.innerHeight - headerOffset);
    if (scrollDistance <= 0) return 0;
    return clamp((headerOffset - rect.top) / scrollDistance, 0, 1);
  }

  function hiwSectionProgress(section) {
    return pinnedTrackProgress(section, ".h-scroll__pin");
  }

  function pinnedTrackProgress(section, pinSelector) {
    var headerOffset = getHeaderOffset();
    var pin = section.querySelector(pinSelector);
    var pinHeight = pin ? pin.offsetHeight : window.innerHeight - headerOffset;
    var rect = section.getBoundingClientRect();
    var scrollDistance = section.offsetHeight - pinHeight - headerOffset;
    if (scrollDistance <= 0) return 0;
    return clamp((headerOffset - rect.top) / scrollDistance, 0, 1);
  }

  /* Copyright year */
  var yearEl = document.getElementById("copyright-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Reveal */
  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    qsa(".reveal, .story-quote").forEach(function (el) {
      /* Stat pills sequence separately (one block at a time) */
      if (el.classList.contains("stat-pill")) return;
      /* Wipe motion owns these testimonials */
      if (el.hasAttribute("data-rs-motion")) return;
      revealObserver.observe(el);
    });
  } else {
    qsa(".reveal, .story-quote").forEach(function (el) {
      if (el.classList.contains("stat-pill")) return;
      if (el.hasAttribute("data-rs-motion")) return;
      el.classList.add("is-visible");
    });
  }

  /* Sticky CTA: after hero exits (Tri: after HIW exits); hide at final pricing CTA
     (or [data-sticky-hide] when present — e.g. gallery after Off Season final CTA) */
  var stickyCta = document.querySelector(".sticky-cta");
  var heroSection = document.querySelector("[data-pp-block='hero']");
  var hiw = document.querySelector("[data-pp-block='how-it-works']");
  var stickyAfterHiw =
    (document.body.classList.contains("page-tri-squad-overlap") ||
      document.body.classList.contains("page-run-squad-vertical")) &&
    !document.body.classList.contains("page-strength-squad");
  var finalCtaSection =
    document.querySelector("[data-sticky-hide]") ||
    document.querySelector("[data-pp-block='pricing']") ||
    document.getElementById("performance-stats");

  function updateStickyCta() {
    if (!stickyCta) return;
    var show = false;
    var gate = stickyAfterHiw && hiw ? hiw : heroSection;
    if (gate) {
      show = gate.getBoundingClientRect().bottom < 0;
    }
    if (finalCtaSection) {
      var ctaRect = finalCtaSection.getBoundingClientRect();
      if (ctaRect.top <= window.innerHeight * 0.9) show = false;
    }
    stickyCta.classList.toggle("is-visible", show);
    stickyCta.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function viewportOffset(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight;
    var center = rect.top + rect.height * 0.5;
    var norm = Math.max(rect.height * 0.55, vh * 0.45);
    return clamp((center - vh * 0.5) / norm, -1, 1);
  }

  /* HIW — sticky photo column; crossfade second → third photo at halfway */
  var hiwPhotos = hiw ? qsa(".h-scroll__photo", hiw) : [];

  function updateHiw() {
    if (!hiw || hiwPhotos.length < 2) return;
    if (!desktopMQ.matches) return;
    var progress = sectionProgress(hiw);
    var index = 0;
    if (!reducedMotion) {
      var steps = hiwPhotos.length;
      index = Math.min(steps - 1, Math.floor(progress * steps));
      if (progress >= 1) index = steps - 1;
    }
    hiwPhotos.forEach(function (photo, i) {
      photo.classList.toggle("is-active", i === index);
    });
  }

  /* Coaches horizontal scroll — pinned section drives film position */
  var coachesSection = document.querySelector("[data-pp-block='coaches']");
  var coachTrack = coachesSection && coachesSection.querySelector(".coach-film__track");

  /* Full-width photo rows — overlay headings on value-rows media */
  var valueRowParallaxPhotos = [];
  qsa(".page-refined .value-rows__overlay-title").forEach(function (title) {
    var media = title.closest(".value-rows__media");
    if (!media) return;
    var visual = media.querySelector("img, video");
    if (visual) valueRowParallaxPhotos.push(visual);
  });

  function resetValueRowsParallax() {
    valueRowParallaxPhotos.forEach(function (el) {
      el.style.transform = "";
    });
  }

  function updateValueRowsParallax() {
    if (!valueRowParallaxPhotos.length) return;
    if (reducedMotion) {
      resetValueRowsParallax();
      return;
    }
    valueRowParallaxPhotos.forEach(function (el) {
      var media = el.closest(".value-rows__media");
      if (!media) return;
      var speed = parseFloat(el.getAttribute("data-vr-speed")) || 0.32;
      var y = viewportOffset(media) * -72 * speed;
      el.style.transform = "translate3d(0," + y + "px,0) scale(1.12)";
    });
  }

  function coachSectionProgress(section) {
    var stickyTop = getCoachStickyTop();
    var pin = section.querySelector(".coach-scroll__pin");
    var pinHeight = pin ? pin.offsetHeight : 0;
    var rect = section.getBoundingClientRect();
    var scrollDistance = section.offsetHeight - pinHeight - stickyTop;
    if (scrollDistance <= 0) return 0;
    return clamp((stickyTop - rect.top) / scrollDistance, 0, 1);
  }

  function syncCoachScrollHeight() {
    if (coachesSection) coachesSection.style.height = "";
  }

  function updateCoaches() {
    if (!coachesSection || !coachTrack) return;
    coachTrack.style.transform = "";
    if (reducedMotion || !desktopMQ.matches) {
      qsa("[data-v-parallax='photo']", coachesSection).forEach(function (el) {
        el.style.transform = "";
      });
      return;
    }
    qsa("[data-v-parallax='photo']", coachesSection).forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-v-speed")) || 0.2;
      var y = viewportOffset(el) * -48 * speed;
      el.style.transform = "translate3d(0," + y + "px,0)";
    });
  }

  /* Training Built — horizontal scroll + layered parallax */
  var tbScroll = document.querySelector("[data-pp-block='training-built']");
  var tbTrack = tbScroll && tbScroll.querySelector(".tb-scroll__track");
  var tbMeter = tbScroll && tbScroll.querySelector(".tb-scroll__meter-fill");

  function tbSectionProgress(section) {
    return pinnedTrackProgress(section, ".tb-scroll__pin");
  }

  function syncTbScrollHeight() {
    if (tbScroll) tbScroll.style.height = "";
  }

  function updateTbScroll() {
    if (!tbScroll) return;
    if (tbTrack) tbTrack.style.transform = "";
    if (tbMeter) tbMeter.style.width = "0%";
    if (reducedMotion || !desktopMQ.matches || tbMobileMQ.matches) {
      resetTbParallax();
      return;
    }
    updateTbParallax();
  }

  function resetTbParallax() {
    if (!tbScroll) return;
    qsa('[data-tb-parallax="copy"], [data-tb-parallax="photo"]', tbScroll).forEach(function (el) {
      el.style.transform = "";
    });
  }

  function updateTbParallax() {
    if (!tbScroll) return;
    var panels = qsa(".tb-panel", tbScroll);

    panels.forEach(function (panel) {
      var offset = viewportOffset(panel);
      var isBusy = panel.classList.contains("tb-panel--busy");
      var isDuo = panel.classList.contains("tb-panel--duo");
      var isResults = panel.classList.contains("tb-panel--results");
      var isOrbit = panel.classList.contains("tb-panel--coaches");

      var copy = panel.querySelector('[data-tb-parallax="copy"]');
      if (copy) {
        if (isResults || isDuo) {
          copy.style.transform = "";
        } else {
          var copySpeed = parseFloat(copy.getAttribute("data-tb-speed")) || 0.85;
          var copyY = offset * -64 * copySpeed;
          if (isBusy) copyY = offset * -28 * copySpeed;
          if (isOrbit) {
            copy.style.transform = "";
          } else {
            copy.style.transform = "translate3d(0," + copyY + "px,0)";
          }
        }
      }

      if (isOrbit) {
        qsa('[data-tb-parallax="photo"], .tb-photo--coach', panel).forEach(function (photo) {
          photo.style.transform = "";
        });
        return;
      }

      if (isResults) {
        qsa('[data-tb-parallax="photo"]', panel).forEach(function (photo) {
          photo.style.transform = "";
        });
        return;
      }

      if (isDuo) {
        qsa(".tb-panel__photos--results [data-tb-parallax='photo'], .tb-panel__photos--results .tb-photo", panel).forEach(function (photo) {
          photo.style.transform = "";
        });
        /* Built photos — vertical-only parallax, different speeds per photo */
        var busyStage = panel.querySelector(".tb-panel__photos--busy");
        var stageOffset = busyStage ? viewportOffset(busyStage) : offset;
        qsa(".tb-panel__photos--busy [data-tb-parallax='photo']", panel).forEach(function (photo) {
          var speed = parseFloat(photo.getAttribute("data-tb-speed")) || 1;
          var photoY = stageOffset * 110 * speed;
          photo.style.transform = "translate3d(0," + photoY + "px,0)";
        });
        /* Proven constellation — layered vertical parallax */
        var provenStage = panel.querySelector(".tb-proven-stage");
        if (provenStage && desktopMQ.matches && !tbMobileMQ.matches) {
          var provenOffset = viewportOffset(provenStage);
          qsa(".tb-proven-stage [data-tb-parallax='photo']", panel).forEach(function (photo) {
            var pSpeed = parseFloat(photo.getAttribute("data-tb-speed")) || 1;
            var provenY = provenOffset * 96 * pSpeed;
            var hangX = photo.getAttribute("data-tb-hang-x");
            if (hangX) {
              photo.style.transform = "translate3d(" + hangX + "," + provenY + "px,0)";
            } else {
              photo.style.transform = "translate3d(0," + provenY + "px,0)";
            }
          });
        }
        return;
      }

      qsa('[data-tb-parallax="photo"]', panel).forEach(function (photo) {
        var speed = parseFloat(photo.getAttribute("data-tb-speed")) || 1;
        var photoY = offset * 88 * speed;
        if (isBusy) photoY = offset * 170 * speed;
        photo.style.transform = "translate3d(0," + photoY + "px,0)";
      });
    });
  }

  function onScroll() {
    updateStickyCta();
    updateHiw();
    updateCoaches();
    updateValueRowsParallax();
    updateTbScroll();
  }

  var tbSliderTimers = [];
  var tbCarouselTimer = null;
  var tbProvenTimer = null;

  function clearTbMobileSliders() {
    tbSliderTimers.forEach(function (id) {
      clearInterval(id);
    });
    tbSliderTimers = [];
    if (!tbScroll) return;
    qsa("[data-tb-slider]", tbScroll).forEach(function (root) {
      if (root.hasAttribute("data-tb-proven-slider")) return;
      var track = root.querySelector(".tb-slider__track");
      if (track) track.style.transform = "";
      var dots = root.querySelector(".tb-slider__dots");
      if (dots) dots.parentNode.removeChild(dots);
    });
    clearTbProvenSlider();
  }

  function useTbPhotoCarousel() {
    if (reducedMotion) return false;
    if (!desktopMQ.matches) return true;
    return (
      document.body.classList.contains("page-tri-squad-vertical") &&
      tbCarouselMQ.matches
    );
  }

  function clearTbPhotoCarousel() {
    if (tbCarouselTimer) {
      clearInterval(tbCarouselTimer);
      tbCarouselTimer = null;
    }
    var root = document.querySelector("[data-tb-carousel]");
    if (!root) return;
    var track = root.querySelector(".tb-photo-carousel__track");
    if (!track) return;
    track.classList.remove("is-marquee");
    track.style.animationDuration = "";
    track.style.transform = "";
    qsa(".tb-photo-carousel__slide--clone", track).forEach(function (el) {
      el.parentNode.removeChild(el);
    });
  }

  function clearTbProvenSlider() {
    if (tbProvenTimer) {
      clearInterval(tbProvenTimer);
      tbProvenTimer = null;
    }
    var root = document.querySelector("[data-tb-proven-slider]");
    if (!root) return;
    var track = root.querySelector(".tb-slider__track");
    if (!track) return;
    track.classList.remove("is-marquee");
    track.style.animationDuration = "";
    track.style.transform = "";
    qsa(".tb-photo--clone", track).forEach(function (el) {
      el.parentNode.removeChild(el);
    });
  }

  function initTbPhotoCarousel() {
    clearTbPhotoCarousel();
    if (!useTbPhotoCarousel()) return;
    var root = document.querySelector("[data-tb-carousel]");
    if (!root) return;
    var track = root.querySelector(".tb-photo-carousel__track");
    if (!track) return;
    if (qsa(".tb-photo-carousel__slide", track).length < 2) return;

    function overflows() {
      return track.scrollWidth > root.clientWidth + 2;
    }

    function startMarquee() {
      if (!useTbPhotoCarousel()) return;
      qsa(".tb-photo-carousel__slide--clone", track).forEach(function (el) {
        el.parentNode.removeChild(el);
      });
      track.classList.remove("is-marquee");
      track.style.animationDuration = "";
      track.style.transform = "";

      var originals = qsa(".tb-photo-carousel__slide", track);
      if (originals.length < 2 || !overflows()) return;

      originals.forEach(function (slide) {
        var clone = slide.cloneNode(true);
        clone.classList.add("tb-photo-carousel__slide--clone");
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      var duration = Math.max(18, track.scrollWidth / 2 / 45);
      track.style.animationDuration = duration + "s";
      track.classList.add("is-marquee");
    }

    function whenImagesReady(fn) {
      var imgs = qsa("img", track);
      var pending = 0;
      function done() {
        pending -= 1;
        if (pending <= 0) fn();
      }
      imgs.forEach(function (img) {
        if (img.complete) return;
        pending += 1;
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
      if (pending <= 0) fn();
    }

    whenImagesReady(startMarquee);
  }

  function initTbProvenSlider() {
    clearTbProvenSlider();
    /* Desktop/tablet Proven is static constellation; no marquee */
  }

  function initTbMobileSliders() {
    clearTbMobileSliders();
    initTbPhotoCarousel();
    initTbProvenSlider();
  }

  var coachFadeTimer = null;
  var coachFadeObserver = null;
  var coachFadeReady = false;

  function stopCoachFade() {
    if (coachFadeTimer) {
      clearInterval(coachFadeTimer);
      coachFadeTimer = null;
    }
  }

  function initCoachFade() {
    var stage = document.querySelector("[data-coach-fade]");
    if (!stage) return;
    /* Hidden in TBFYBL text stack at ≤1024; only run on wider layouts */
    if (!desktopMQ.matches || tbMobileMQ.matches) {
      stopCoachFade();
      if (coachFadeObserver) {
        coachFadeObserver.disconnect();
        coachFadeObserver = null;
      }
      coachFadeReady = false;
      return;
    }
    if (coachFadeReady) return;
    coachFadeReady = true;
    var slides = qsa(".tb-photo--coach", stage);
    if (!slides.length) return;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === 0);
      slide.style.transform = "";
    });
    if (reducedMotion || slides.length < 2) return;

    var index = 0;
    function nextSlide() {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
    }

    if ("IntersectionObserver" in window) {
      coachFadeObserver = new IntersectionObserver(
        function (entries) {
          var visible = entries.some(function (entry) {
            return entry.isIntersecting;
          });
          if (visible && !coachFadeTimer) {
            coachFadeTimer = setInterval(nextSlide, 3200);
          } else if (!visible) {
            stopCoachFade();
          }
        },
        { threshold: 0.35 }
      );
      coachFadeObserver.observe(stage);
    } else {
      coachFadeTimer = setInterval(nextSlide, 3200);
    }
  }

  function onLayoutChange() {
    syncCoachScrollHeight();
    syncTbScrollHeight();
    initTbMobileSliders();
    initCoachFade();
    resetValueRowsParallax();
    onScroll();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onLayoutChange);
  if (typeof tbCarouselMQ.addEventListener === "function") {
    tbCarouselMQ.addEventListener("change", onLayoutChange);
  } else if (typeof tbCarouselMQ.addListener === "function") {
    tbCarouselMQ.addListener(onLayoutChange);
  }
  if (typeof tbMobileMQ.addEventListener === "function") {
    tbMobileMQ.addEventListener("change", onLayoutChange);
  } else if (typeof tbMobileMQ.addListener === "function") {
    tbMobileMQ.addListener(onLayoutChange);
  }
  onLayoutChange();

  if (coachesSection && coachTrack && "ResizeObserver" in window) {
    var coachLayoutObserver = new ResizeObserver(onLayoutChange);
    coachLayoutObserver.observe(coachTrack);
    var coachFilmEl = coachesSection.querySelector(".coach-film");
    if (coachFilmEl) coachLayoutObserver.observe(coachFilmEl);
  }
  if (tbScroll && tbTrack && "ResizeObserver" in window) {
    var tbLayoutObserver = new ResizeObserver(onLayoutChange);
    tbLayoutObserver.observe(tbTrack);
  }

  /* Coach section: wheel/drag on mobile only (desktop uses scroll-driven pin) */
  /* Coach film: no horizontal wheel on the vertical page */
  if (false && coachesSection && coachTrack && !reducedMotion) {
    coachesSection.addEventListener(
      "wheel",
      function (e) {
        if (desktopMQ.matches) return;

        var rect = coachesSection.getBoundingClientRect();
        var inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
        if (!inView) return;

        var max = coachTrack.scrollWidth - coachTrack.clientWidth;
        if (max <= 0) return;

        var atStart = coachTrack.scrollLeft <= 1;
        var atEnd = coachTrack.scrollLeft >= max - 1;
        var down = e.deltaY > 0;
        var up = e.deltaY < 0;
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

        if ((down && !atEnd) || (up && !atStart)) {
          e.preventDefault();
          coachTrack.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    var dragging = false;
    var startX = 0;
    var scrollLeft = 0;
    coachTrack.addEventListener("mousedown", function (e) {
      if (desktopMQ.matches) return;
      dragging = true;
      startX = e.pageX - coachTrack.offsetLeft;
      scrollLeft = coachTrack.scrollLeft;
      coachTrack.classList.add("is-dragging");
    });
    window.addEventListener("mouseup", function () {
      dragging = false;
      if (coachTrack) coachTrack.classList.remove("is-dragging");
    });
    coachTrack.addEventListener("mousemove", function (e) {
      if (!dragging || desktopMQ.matches) return;
      e.preventDefault();
      var x = e.pageX - coachTrack.offsetLeft;
      coachTrack.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  }

  /* Mobile nav */
  var menuBtn = document.getElementById("menuButton");
  var menuPPF = document.getElementById("menuPPF");
  var menuOverlay = document.getElementById("menuOverlay");
  function closeMenu() {
    if (menuPPF) menuPPF.classList.remove("open");
    if (menuOverlay) menuOverlay.classList.remove("open");
  }
  if (menuBtn && menuPPF) {
    menuBtn.addEventListener("click", function () {
      menuPPF.classList.add("open");
      if (menuOverlay) menuOverlay.classList.add("open");
    });
  }
  if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);

  /* Stat pills: appear one block at a time; count finishes before next appears */
  (function initSequentialStats() {
    var roots = qsa(".results-closing__stats");
    qsa(".stats-section__grid").forEach(function (grid) {
      if (!grid.closest(".results-closing__stats")) roots.push(grid);
    });
    if (!roots.length) return;

    function formatCount(value, suffix) {
      var formatted =
        value >= 1000 ? value.toLocaleString("en-US") : String(value);
      return formatted + (suffix || "");
    }

    function isMillionSuffix(suffix) {
      return /^M\+?$/i.test(String(suffix || "").trim());
    }

    function parseStatTarget(el) {
      var base = parseInt(el.getAttribute("data-count-to"), 10);
      var suffix = el.getAttribute("data-count-suffix") || "";
      if (isNaN(base)) return null;
      if (isMillionSuffix(suffix)) {
        return {
          base: base,
          suffix: suffix,
          full: base * 1000000,
          abbreviated: String(base) + suffix,
          million: true,
        };
      }
      return {
        base: base,
        suffix: suffix,
        full: base,
        abbreviated: formatCount(base, suffix),
        million: false,
      };
    }

    function wait(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    function countUpTo(el, from, to, duration, suffixDuring) {
      return new Promise(function (resolve) {
        var start = performance.now();
        var range = to - from;
        el.textContent = formatCount(from, suffixDuring || "");
        function frame(now) {
          var t = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = formatCount(Math.round(from + range * eased), suffixDuring || "");
          if (t < 1) requestAnimationFrame(frame);
          else {
            el.textContent = formatCount(to, suffixDuring || "");
            resolve();
          }
        }
        requestAnimationFrame(frame);
      });
    }

    function fitNumWidth(el) {
      el.style.minWidth = "";
      el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + "px";
    }

    function clearNumWidth(el) {
      el.style.minWidth = "";
    }

    function contractToAbbrev(el, abbrev) {
      return new Promise(function (resolve) {
        el.classList.add("is-contracting");
        window.setTimeout(function () {
          el.textContent = abbrev;
          el.classList.remove("is-contracting");
          el.classList.add("is-abbreviated");
          clearNumWidth(el);
          window.setTimeout(resolve, 160);
        }, 140);
      });
    }

    function animateStat(pill, num) {
      var meta = parseStatTarget(num);
      if (!meta) return wait(200);

      pill.classList.add("is-counting");
      pill.classList.remove("is-settled", "is-label-visible");
      clearNumWidth(num);
      num.style.transition = "";
      num.style.transform = "";

      function settle() {
        var from = num.getBoundingClientRect();
        pill.classList.remove("is-counting");
        pill.classList.add("is-settled", "is-label-visible");
        fitNumWidth(num);
        var to = num.getBoundingClientRect();
        var dx = from.left + from.width * 0.5 - (to.left + to.width * 0.5);
        num.style.transition = "none";
        num.style.transform = "translate3d(" + dx + "px,0,0)";
        void num.offsetWidth;
        num.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
        num.style.transform = "translate3d(0,0,0)";
        return wait(560).then(function () {
          num.style.transition = "";
          num.style.transform = "";
        });
      }

      if (meta.million) {
        pill.classList.add("stat-pill--million");
        return countUpTo(num, 1, meta.full, 700, "")
          .then(function () {
            return wait(60);
          })
          .then(function () {
            return contractToAbbrev(num, meta.abbreviated);
          })
          .then(settle);
      }

      return countUpTo(num, 0, meta.full, 420, meta.suffix).then(settle);
    }

    function runSequence(pills) {
      var chain = Promise.resolve();
      pills.forEach(function (pill) {
        chain = chain.then(function () {
          pill.classList.add("is-visible");
          var num = pill.querySelector(".stat-pill__num[data-count-to]");
          return wait(80)
            .then(function () {
              if (num) return animateStat(pill, num);
              pill.classList.add("is-settled", "is-label-visible");
              return wait(200);
            })
            .then(function () {
              return wait(60);
            });
        });
      });
      return chain;
    }

    roots.forEach(function (root) {
      var pills = qsa(".stat-pill.reveal", root);
      if (!pills.length) return;

      var nums = qsa(".stat-pill__num[data-count-to]", root);
      /* Desktop: reserve full millions during count-up. Mobile: size to the
         abbreviated value so 7,000,000 doesn't starve the labels. */
      nums.forEach(function (el) {
        var meta = parseStatTarget(el);
        if (!meta) return;
        var pill = el.closest(".stat-pill");
        if (pill) {
          pill.classList.add("is-counting");
          pill.classList.remove("is-settled", "is-label-visible");
        }
        clearNumWidth(el);
        el.textContent = meta.million ? "1" : formatCount(0, meta.suffix);
        if (meta.million && pill) {
          pill.classList.add("stat-pill--million");
        }
      });
      qsa(".stat-pill__num:not([data-count-to])", root).forEach(function (el) {
        var pill = el.closest(".stat-pill");
        if (pill) {
          pill.classList.add("is-counting");
          pill.classList.remove("is-settled", "is-label-visible");
        }
        clearNumWidth(el);
      });

      if (reducedMotion || !("IntersectionObserver" in window)) {
        pills.forEach(function (pill) {
          pill.classList.add("is-visible", "is-settled", "is-label-visible");
          pill.classList.remove("stat-pill--million", "is-counting");
        });
        nums.forEach(function (el) {
          var meta = parseStatTarget(el);
          if (meta) el.textContent = meta.abbreviated;
          fitNumWidth(el);
        });
        return;
      }

      var started = false;
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || started) return;
            started = true;
            observer.disconnect();
            runSequence(pills);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
      );
      observer.observe(root);
    });
  })();

  /* Testimonial click-through + swipe (mobile carousel) */
  qsa("[data-quote-carousel]").forEach(function (root) {
    var slides = qsa(":scope > .story-quote", root);
    var prev = root.querySelector("[data-quote-prev]");
    var next = root.querySelector("[data-quote-next]");
    var dotsWrap = root.querySelector("[data-quote-dots]");
    if (!slides.length) return;
    var index = 0;
    var reducedQuotes = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(n, opts) {
      var animate = !reducedQuotes && (!opts || opts.animate !== false);
      index = (n + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.remove("is-animating");
        slide.classList.toggle("is-active", active);
        /* Keep all is-visible for desktop stacked layout; mobile uses display:none */
        slide.classList.add("is-visible");
        if (active) {
          slide.classList.add("is-inview");
          if (animate) {
            void slide.offsetWidth;
            slide.classList.add("is-animating");
          }
        }
      });
      qsa("[data-quote-dot]", root).forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("data-quote-dot", "");
        dot.setAttribute("aria-label", "Testimonial " + (i + 1));
        dot.addEventListener("click", function () {
          show(i);
        });
        dotsWrap.appendChild(dot);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    slides.forEach(function (slide) {
      var photo = slide.querySelector(".story-quote__photo");
      if (!photo) return;
      photo.style.cursor = "pointer";
      photo.addEventListener("click", function () {
        show(index + 1);
      });
    });

    /* Mobile swipe — horizontal only; leave vertical scroll alone */
    var touchStartX = 0;
    var touchStartY = 0;
    var touchTracking = false;
    var touchAxis = null;
    root.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches.length) return;
        touchTracking = true;
        touchAxis = null;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchmove",
      function (e) {
        if (!touchTracking || touchAxis || !e.touches || !e.touches.length) return;
        var dx = e.touches[0].clientX - touchStartX;
        var dy = e.touches[0].clientY - touchStartY;
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
        touchAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      function (e) {
        if (!touchTracking) return;
        touchTracking = false;
        if (touchAxis !== "x") {
          touchAxis = null;
          return;
        }
        touchAxis = null;
        var t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        var dx = t.clientX - touchStartX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) show(index + 1);
        else show(index - 1);
      },
      { passive: true }
    );
    root.addEventListener(
      "touchcancel",
      function () {
        touchTracking = false;
        touchAxis = null;
      },
      { passive: true }
    );

    show(0, { animate: false });
  });

  qsa(".offseason-waitlist").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.add("is-sent");
      form.innerHTML =
        '<p class="offseason-waitlist__thanks">Thanks — we\'ll reach out when your season wraps up.</p>';
    });
  });

  /* FAQ accordion — exclusive open + smooth height transitions */
  qsa(".faq-list").forEach(function (list) {
    var items = qsa("details.faq-item", list);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getPanel(item) {
      return item.querySelector(".faq-item__panel");
    }

    function closeItem(item) {
      var panel = getPanel(item);
      if (!panel || !item.open) return;
      if (reduced) {
        item.open = false;
        panel.style.height = "0px";
        return;
      }
      panel.style.height = panel.scrollHeight + "px";
      panel.offsetHeight; /* force reflow */
      panel.style.height = "0px";
      function onEnd(e) {
        if (e.propertyName !== "height") return;
        panel.removeEventListener("transitionend", onEnd);
        item.open = false;
      }
      panel.addEventListener("transitionend", onEnd);
    }

    function openItem(item) {
      var panel = getPanel(item);
      if (!panel) return;
      item.open = true;
      if (reduced) {
        panel.style.height = "auto";
        return;
      }
      panel.style.height = "0px";
      panel.offsetHeight;
      panel.style.height = panel.scrollHeight + "px";
      function onEnd(e) {
        if (e.propertyName !== "height") return;
        panel.removeEventListener("transitionend", onEnd);
        if (item.open) panel.style.height = "auto";
      }
      panel.addEventListener("transitionend", onEnd);
    }

    items.forEach(function (item) {
      var summary = item.querySelector("summary");
      if (!summary) return;

      var panel = document.createElement("div");
      panel.className = "faq-item__panel";
      while (summary.nextSibling) {
        panel.appendChild(summary.nextSibling);
      }
      item.appendChild(panel);

      if (item.open) {
        panel.style.height = "auto";
      } else {
        panel.style.height = "0px";
      }

      summary.addEventListener("click", function (e) {
        e.preventDefault();
        if (item.open) {
          closeItem(item);
          return;
        }
        items.forEach(function (other) {
          if (other !== item) closeItem(other);
        });
        openItem(item);
      });
    });
  });

  window.PPFStudyMeta = {
    version: "refined-mockup",
    blocks: qsa("[data-pp-block]").map(function (node) {
      return {
        block: node.getAttribute("data-pp-block"),
        pattern: node.getAttribute("data-pp-pattern") || "none",
      };
    }),
  };
})();
