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

  const lead = document.getElementById("centerLead");
  const leadForm = document.getElementById("centerLeadForm");
  const leadThanks = document.getElementById("centerLeadThanks");
  const serviceLead = document.getElementById("centerServiceLead");
  const serviceLeadForm = document.getElementById("centerServiceLeadForm");
  const serviceLeadThanks = document.getElementById("centerServiceLeadThanks");
  const serviceLeadSelect = document.getElementById("centerServiceLeadSelect");
  const leadMotionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncLeadOpenClass() {
    const open =
      (lead && !lead.hidden) ||
      (serviceLead && !serviceLead.hidden) ||
      (document.getElementById("ptBookLead") && !document.getElementById("ptBookLead").hidden);
    document.documentElement.classList.toggle("center-lead-open", open);
  }

  function syncFloatFields(root) {
    root?.querySelectorAll(".center-lead__field").forEach((field) => {
      const control = field.querySelector("input, textarea, select");
      if (!control) return;
      const filled =
        control.tagName === "SELECT"
          ? Boolean(control.value)
          : Boolean(String(control.value || "").trim());
      field.classList.toggle("is-filled", filled);
    });
  }

  function openLeadOverlay(overlay, focusEl) {
    if (!overlay) return;
    overlay.hidden = false;
    syncLeadOpenClass();
    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      syncLeadOpenClass();
      focusEl?.focus();
    });
  }

  function closeLeadOverlay(overlay, afterClose) {
    if (!overlay || overlay.hidden) return;
    const finish = () => {
      overlay.hidden = true;
      overlay.classList.remove("is-open");
      afterClose?.();
      syncLeadOpenClass();
    };
    if (!overlay.classList.contains("is-open")) {
      finish();
      return;
    }
    overlay.classList.remove("is-open");
    syncLeadOpenClass();
    if (!leadMotionOk) {
      finish();
      return;
    }
    let done = false;
    const onEnd = (e) => {
      if (e.target !== overlay || done) return;
      done = true;
      overlay.removeEventListener("transitionend", onEnd);
      finish();
    };
    overlay.addEventListener("transitionend", onEnd);
    window.setTimeout(() => {
      if (done) return;
      done = true;
      overlay.removeEventListener("transitionend", onEnd);
      finish();
    }, 360);
  }

  function closePtBookImmediate() {
    const overlay = document.getElementById("ptBookLead");
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    const form = document.getElementById("ptBookLeadForm");
    const thanks = document.getElementById("ptBookLeadThanks");
    if (form) form.hidden = false;
    if (thanks) thanks.hidden = true;
    form?.reset();
    syncFloatFields(form);
    syncLeadOpenClass();
  }

  function openLead() {
    if (!lead) return;
    closeServiceLead(true);
    closePtBookImmediate();
    if (leadForm) leadForm.hidden = false;
    if (leadThanks) leadThanks.hidden = true;
    leadForm?.reset();
    syncFloatFields(leadForm);
    openLeadOverlay(lead, lead.querySelector('input[name="name"]'));
  }
  function closeLead(immediate) {
    if (!lead || lead.hidden) return;
    const reset = () => {
      if (leadForm) leadForm.hidden = false;
      if (leadThanks) leadThanks.hidden = true;
      leadForm?.reset();
      syncFloatFields(leadForm);
    };
    if (immediate) {
      lead.classList.remove("is-open");
      lead.hidden = true;
      reset();
      syncLeadOpenClass();
      return;
    }
    closeLeadOverlay(lead, reset);
  }

  function openServiceLead(service) {
    if (!serviceLead) return;
    closeLead(true);
    closePtBookImmediate();
    if (serviceLeadForm) serviceLeadForm.hidden = false;
    if (serviceLeadThanks) serviceLeadThanks.hidden = true;
    serviceLeadForm?.reset();
    if (serviceLeadSelect && service) {
      serviceLeadSelect.value = service;
    }
    syncFloatFields(serviceLeadForm);
    openLeadOverlay(serviceLead, serviceLead.querySelector('input[name="name"]'));
  }
  function closeServiceLead(immediate) {
    if (!serviceLead || serviceLead.hidden) return;
    const reset = () => {
      if (serviceLeadForm) serviceLeadForm.hidden = false;
      if (serviceLeadThanks) serviceLeadThanks.hidden = true;
      serviceLeadForm?.reset();
      syncFloatFields(serviceLeadForm);
    };
    if (immediate) {
      serviceLead.classList.remove("is-open");
      serviceLead.hidden = true;
      reset();
      syncLeadOpenClass();
      return;
    }
    closeLeadOverlay(serviceLead, reset);
  }

  document.querySelectorAll("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", openLead);
  });
  document.querySelectorAll("[data-close-lead]").forEach((el) => {
    el.addEventListener("click", () => closeLead());
  });
  document.querySelectorAll("[data-open-service-lead]").forEach((el) => {
    el.addEventListener("click", () => {
      openServiceLead(el.getAttribute("data-service") || "");
    });
  });
  document.querySelectorAll("[data-close-service-lead]").forEach((el) => {
    el.addEventListener("click", () => closeServiceLead());
  });
  [leadForm, serviceLeadForm].forEach((form) => {
    form?.addEventListener("input", () => syncFloatFields(form));
    form?.addEventListener("change", () => syncFloatFields(form));
  });
  leadForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (leadForm) leadForm.hidden = true;
    if (leadThanks) leadThanks.hidden = false;
  });
  serviceLeadForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (serviceLeadForm) serviceLeadForm.hidden = true;
    if (serviceLeadThanks) serviceLeadThanks.hidden = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeLead();
    closeServiceLead();
  });
  syncFloatFields(leadForm);
  syncFloatFields(serviceLeadForm);

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
      const link = e.target.closest("a");
      if (link) {
        e.stopPropagation();
        return;
      }
      if (dragged) return;
      const open = card.classList.toggle("is-flipped");
      if (open) closeOtherFlips(card);
    });
    card.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const open = card.classList.toggle("is-flipped");
        if (open) closeOtherFlips(card);
      }
    });
  });

  const mobileFade = window.matchMedia("(max-width: 767px)");
  document.querySelectorAll("[data-photo-switch]").forEach((switcher) => {
    const slides = [...switcher.querySelectorAll("img")];
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
  });

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

  const ptBook = document.getElementById("ptBookLead");
  const ptBookForm = document.getElementById("ptBookLeadForm");
  const ptBookThanks = document.getElementById("ptBookLeadThanks");

  function openPtBook() {
    if (!ptBook) return;
    closeLead(true);
    closeServiceLead(true);
    if (ptBookForm) ptBookForm.hidden = false;
    if (ptBookThanks) ptBookThanks.hidden = true;
    ptBookForm?.reset();
    syncFloatFields(ptBookForm);
    openLeadOverlay(ptBook, ptBook.querySelector('input[name="name"]'));
  }
  function closePtBook(immediate) {
    if (!ptBook || ptBook.hidden) return;
    const reset = () => {
      if (ptBookForm) ptBookForm.hidden = false;
      if (ptBookThanks) ptBookThanks.hidden = true;
      ptBookForm?.reset();
      syncFloatFields(ptBookForm);
    };
    if (immediate) {
      ptBook.classList.remove("is-open");
      ptBook.hidden = true;
      reset();
      syncLeadOpenClass();
      return;
    }
    closeLeadOverlay(ptBook, reset);
  }
  document.querySelectorAll("[data-open-pt-book]").forEach((el) => {
    el.addEventListener("click", openPtBook);
  });
  document.querySelectorAll("[data-close-pt-book]").forEach((el) => {
    el.addEventListener("click", () => closePtBook());
  });
  ptBookForm?.addEventListener("input", () => syncFloatFields(ptBookForm));
  ptBookForm?.addEventListener("change", () => syncFloatFields(ptBookForm));
  ptBookForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (ptBookForm) ptBookForm.hidden = true;
    if (ptBookThanks) ptBookThanks.hidden = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePtBook();
  });
  syncFloatFields(ptBookForm);

  document.querySelectorAll("[data-pt-accordion]").forEach((group) => {
    const items = [...group.querySelectorAll(".pt-accordion__item")];
    const media = group.closest(".pt-split")?.querySelector("[data-pt-philosophy-media]");
    function setOpen(item, open) {
      const trigger = item.querySelector(".pt-accordion__trigger");
      item.classList.toggle("is-open", open);
      trigger?.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && media) {
        const key = trigger?.getAttribute("data-pt-photo-key");
        media.querySelectorAll("img").forEach((img) => {
          img.classList.toggle("is-active", img.getAttribute("data-pt-photo") === key);
        });
      }
    }
    items.forEach((item) => {
      item.querySelector(".pt-accordion__trigger")?.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => setOpen(other, other === item && willOpen));
      });
    });
  });

  /* Exclusive open for service-page FAQ / therapist details */
  document.querySelectorAll(".center-faq").forEach((group) => {
    const items = [...group.querySelectorAll("details")];
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  });

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
