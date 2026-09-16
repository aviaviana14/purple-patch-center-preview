(() => {
  const menuBtn = document.getElementById("centerMenuButton");
  const menuClose = document.getElementById("centerMenuClose");
  const menuPanel = document.getElementById("centerMenuPanel");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openMenu() {
    if (!menuPanel || !menuBtn) return;
    menuPanel.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("center-menu-open");
    menuClose?.focus();
  }

  function closeMenu() {
    if (!menuPanel || !menuBtn) return;
    if (menuPanel.hidden) return;
    menuPanel.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("center-menu-open");
  }

  menuBtn?.addEventListener("click", () => {
    if (menuPanel?.hidden) openMenu();
    else closeMenu();
  });
  menuClose?.addEventListener("click", closeMenu);
  menuPanel?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });

  const flips = [...document.querySelectorAll(".class-flip")];
  function closeOtherFlips(keep) {
    flips.forEach((card) => {
      if (card !== keep) card.classList.remove("is-flipped");
    });
  }
  flips.forEach((card) => {
    let pointerX = 0;
    let pointerY = 0;
    let dragged = false;
    card.addEventListener("pointerdown", (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      dragged = false;
    });
    card.addEventListener("pointermove", (e) => {
      if (Math.abs(e.clientX - pointerX) > 8 || Math.abs(e.clientY - pointerY) > 8) {
        dragged = true;
      }
    });
    card.addEventListener("click", (e) => {
      if (e.target.closest("a") || dragged) return;
      const open = card.classList.toggle("is-flipped");
      if (open) closeOtherFlips(card);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const open = card.classList.toggle("is-flipped");
        if (open) closeOtherFlips(card);
      }
    });
  });

  const switcher = document.querySelector("[data-photo-switch]");
  if (switcher) {
    const slides = [...switcher.querySelectorAll("img")];
    const mobileFade = window.matchMedia("(max-width: 767px)");
    let index = 0;
    let timer = null;
    const show = (i) => {
      slides.forEach((img, n) => img.classList.toggle("is-active", n === i));
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const start = () => {
      stop();
      if (reduced || slides.length < 2 || !mobileFade.matches) {
        show(0);
        return;
      }
      timer = setInterval(() => {
        index = (index + 1) % slides.length;
        show(index);
      }, 4200);
    };
    mobileFade.addEventListener("change", start);
    start();
  }

  const mobileSlider = window.matchMedia("(max-width: 767px)");
  function syncNextLevelSpeed() {
    const track = document.querySelector(".page-performance-center .tb-photo-carousel__track");
    const localRun = document.querySelector(".page-performance-center .center-masonry__marquee-run");
    if (!track) return;
    if (reduced || !mobileSlider.matches) {
      track.style.removeProperty("--nl-marquee-duration");
      return;
    }
    const localSet = localRun ? localRun.scrollWidth / 2 : 0;
    const nextSet = track.scrollWidth / 2;
    if (localSet < 8 || nextSet < 8) return;
    const duration = Math.max(8, (nextSet / localSet) * 70);
    track.style.setProperty("--nl-marquee-duration", `${duration.toFixed(2)}s`);
  }
  function whenImagesReady(root, fn) {
    const imgs = root ? [...root.querySelectorAll("img")] : [];
    let pending = imgs.filter((img) => !img.complete).length;
    if (!pending) {
      fn();
      return;
    }
    const done = () => {
      pending -= 1;
      if (pending <= 0) fn();
    };
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }
  whenImagesReady(document.querySelector(".tb-photo-carousel"), () => {
    whenImagesReady(document.querySelector(".center-masonry__marquee"), syncNextLevelSpeed);
  });
  mobileSlider.addEventListener("change", syncNextLevelSpeed);
  window.addEventListener("resize", syncNextLevelSpeed);

  if (reduced) return;

  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (!parallaxEls.length) return;

  function updateParallax() {
    parallaxEls.forEach((el) => {
      const host = el.parentElement;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      const max = Math.max(0, (el.offsetHeight - host.offsetHeight) / 2);
      const raw = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      const y = Math.max(-max, Math.min(max, raw));
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  }

  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
  updateParallax();
})();
