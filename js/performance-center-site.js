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
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
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
    let index = 0;
    const advance = () => {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
    };
    if (!reduced && slides.length > 1) {
      setInterval(advance, 4200);
    }
  }

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
