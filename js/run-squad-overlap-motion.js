(function () {
  if (
    !document.body.classList.contains("page-run-squad-overlap") &&
    !document.body.classList.contains("page-tri-squad-overlap")
  ) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function revealAll() {
    qsa("[data-rs-motion]").forEach(function (el) {
      el.classList.add("is-inview");
    });
  }

  function initScrollMotion() {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    document.documentElement.classList.add("rs-motion");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.18 }
    );

    qsa("[data-rs-motion]").forEach(function (el) {
      /* Mobile quote carousel owns its enter animation */
      if (
        window.matchMedia("(max-width: 767px)").matches &&
        el.closest &&
        el.closest("[data-quote-carousel]")
      ) {
        return;
      }
      observer.observe(el);
    });
  }

  initScrollMotion();
})();
