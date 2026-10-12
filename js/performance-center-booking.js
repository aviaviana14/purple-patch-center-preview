(() => {
  const root = document.getElementById("center-booking");
  if (!root) return;

  const intents = {
    tour: "Tour the Center",
    class: "Try a class",
    coach: "Talk to a coach",
    service: "Explore a service",
  };
  const slots = [
    { time: "6:30 AM", kind: "Circuit" },
    { time: "7:45 AM", kind: "Bike" },
    { time: "9:15 AM", kind: "Strength" },
    { time: "12:00 PM", kind: "Tour" },
    { time: "5:30 PM", kind: "Bike" },
    { time: "6:45 PM", kind: "Strength" },
  ];

  const state = {
    step: 1,
    intent: null,
    day: 0,
    slot: null,
  };

  const stepNodes = [...root.querySelectorAll("[data-booking-step]")];
  const stepLabel = root.querySelector("[data-booking-step-label]");
  const progress = root.querySelector("[data-booking-progress]");
  const daysEl = root.querySelector("[data-booking-days]");
  const summaryEl = root.querySelector("[data-booking-summary]");
  const confirmEl = root.querySelector("[data-booking-confirm]");
  const nextBtn = root.querySelector("[data-booking-next]");
  const submitBtn = root.querySelector("[data-booking-submit]");
  const nameInput = root.querySelector('input[name="name"]');
  const emailInput = root.querySelector('input[name="email"]');

  function dayList() {
    const base = new Date();
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      out.push({
        dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        num: d.getDate(),
      });
    }
    return out;
  }

  function renderDays() {
    if (!daysEl) return;
    const days = dayList();
    daysEl.innerHTML = days
      .map(
        (d, i) =>
          `<button type="button" class="center-booking__day${i === state.day ? " is-active" : ""}" data-day="${i}"><span>${d.dow}</span><strong>${d.num}</strong></button>`
      )
      .join("");
  }

  function summary() {
    const days = dayList();
    const day = days[state.day];
    const dayLabel = day ? `${day.dow} ${day.num}` : "";
    const intentTitle = intents[state.intent] || "Visit";
    const chosen = state.slot != null ? slots[state.slot] : null;
    return (
      intentTitle +
      " · " +
      dayLabel +
      (chosen ? ` · ${chosen.time} (${chosen.kind})` : "")
    );
  }

  function confirmLine() {
    const days = dayList();
    const day = days[state.day];
    const dayLabel = day ? `${day.dow} ${day.num}` : "";
    const intentTitle = (intents[state.intent] || "Visit").toLowerCase();
    const chosen = state.slot != null ? slots[state.slot] : null;
    return (
      `You’re booked for ${intentTitle} on ${dayLabel}` +
      (chosen ? ` at ${chosen.time}` : "") +
      " at 268 Alabama Street."
    );
  }

  function render() {
    stepNodes.forEach((el) => {
      el.hidden = Number(el.getAttribute("data-booking-step")) !== state.step;
    });
    if (stepLabel) {
      stepLabel.textContent =
        state.step === 4 ? "Confirmed" : `Step ${state.step} of 3`;
    }
    if (progress) {
      progress.style.width = `${(Math.min(state.step, 3) / 3) * 100}%`;
    }
    root.querySelectorAll("[data-slot]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        Number(btn.getAttribute("data-slot")) === state.slot
      );
    });
    root.querySelectorAll("[data-day]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        Number(btn.getAttribute("data-day")) === state.day
      );
    });
    if (nextBtn) nextBtn.disabled = state.slot == null;
    if (submitBtn) {
      submitBtn.disabled = !(
        nameInput?.value.trim() && emailInput?.value.trim()
      );
    }
    if (summaryEl) summaryEl.textContent = summary();
    if (confirmEl) confirmEl.textContent = confirmLine();
  }

  function openBooking(intent) {
    state.step = intent ? 2 : 1;
    state.intent = intent || null;
    state.slot = null;
    renderDays();
    root.hidden = false;
    document.documentElement.classList.add("center-booking-open");
    render();
  }

  function closeBooking() {
    root.hidden = true;
    document.documentElement.classList.remove("center-booking-open");
    state.step = 1;
    state.intent = null;
    state.slot = null;
    render();
  }

  document.querySelectorAll("[data-open-booking]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openBooking(el.getAttribute("data-booking-intent") || null);
    });
  });
  root.querySelectorAll("[data-close-booking]").forEach((el) => {
    el.addEventListener("click", closeBooking);
  });
  root.querySelectorAll("[data-intent]").forEach((el) => {
    el.addEventListener("click", () => {
      state.intent = el.getAttribute("data-intent");
      state.step = 2;
      renderDays();
      render();
    });
  });
  daysEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn) return;
    state.day = Number(btn.getAttribute("data-day"));
    render();
  });
  root.querySelectorAll("[data-slot]").forEach((el) => {
    el.addEventListener("click", () => {
      state.slot = Number(el.getAttribute("data-slot"));
      render();
    });
  });
  root.querySelectorAll("[data-booking-back]").forEach((el) => {
    el.addEventListener("click", () => {
      state.step = Math.max(1, state.step - 1);
      render();
    });
  });
  nextBtn?.addEventListener("click", () => {
    if (state.slot == null) return;
    state.step = 3;
    render();
  });
  submitBtn?.addEventListener("click", () => {
    if (!(nameInput?.value.trim() && emailInput?.value.trim())) return;
    state.step = 4;
    render();
  });
  [nameInput, emailInput].forEach((input) => {
    input?.addEventListener("input", render);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !root.hidden) closeBooking();
  });

  renderDays();
  render();
})();
