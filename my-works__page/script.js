document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const header = document.querySelector(".header");
  const topButton = document.getElementById("top");
  const stage = document.getElementById("worksStage");
  const prevButton = document.querySelector(".works__nav--prev");
  const nextButton = document.querySelector(".works__nav--next");
  const bar = document.getElementById("worksBar");
  const slider = document.getElementById("worksSlider");
  const count = document.getElementById("worksCount");
  const chips = document.querySelectorAll(".chip");

  /* ---------- Preloader + Header ---------- */
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
  };

  // Ждём применения переводов (i18n), чтобы не показать вспышку английского текста.
  // Страховочный лимит — 3 с.
  const waitForI18n = () =>
    Promise.race([
      window.i18nReady || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

  const scheduleHidePreloader = () => {
    waitForI18n().then(() => setTimeout(hidePreloader, 400));
  };

  if (document.readyState === "complete") {
    scheduleHidePreloader();
  } else {
    window.addEventListener("load", scheduleHidePreloader);
  }

  const handleScroll = () => {
    const scrollY = window.scrollY || 0;
    header?.classList.toggle("is-hidden", scrollY > 250);
    topButton?.classList.toggle("visible", scrollY > 300);
  };

  topButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ---------- Video Data ---------- */
  const works = [
    { file: "mers-sharq.mp4", category: "commercial" },
    { file: "Rolls Royce.mp4", category: "commercial" },
    { file: "Akmal Porsche911.mp4", category: "speed" },
    { file: "W211 Major.mp4", category: "commercial" },
    { file: "mers.mp4", category: "speed" },
    { file: "Motofest.mp4", category: "speed" },
    { file: "484 Final.mp4", category: "commercial" },
    { file: "BYD 003.mp4", category: "speed" },
  ];

  if (!stage) return;

  let cards = [];
  let total = 0;
  let current = 0;
  let moved = false;

  /* ---------- Build Cards for Filter ---------- */
  const build = (filter) => {
    stage.querySelectorAll("video").forEach((v) => v.pause());

    const list = works.filter((w) => filter === "all" || w.category === filter);

    stage.innerHTML = list
      .map(
        (w, i) => `
          <article class="card" data-index="${i}">
            <video src="${encodeURI(`../img/videos/${w.file}`)}#t=0.1" playsinline preload="metadata"></video>
            <span class="card__play" aria-hidden="true"></span>
          </article>`,
      )
      .join("");

    cards = [...stage.children];
    total = cards.length;
    current = 0;

    cards.forEach((card) => {
      const video = card.querySelector("video");
      if (video) video.volume = 0.8;

      card.addEventListener("click", () => {
        if (moved) return;
        const i = Number(card.dataset.index);
        if (i !== current) goTo(i);
      });
    });

    const single = total < 2;
    if (prevButton) prevButton.hidden = single;
    if (nextButton) nextButton.hidden = single;

    render();
  };

  const wrap = (d) => {
    const half = total / 2;
    return ((((d + half) % total) + total) % total) - half;
  };

  const render = () => {
    cards.forEach((card, i) => {
      const d = wrap(i - current);
      const abs = Math.abs(d);
      const active = d === 0;
      const video = card.querySelector("video");

      card.style.setProperty("--d", Math.max(-3, Math.min(3, d)));
      card.style.setProperty("--abs", Math.min(abs, 3));
      card.classList.toggle("is-active", active);
      card.classList.toggle("is-far", abs === 2);
      card.classList.toggle("is-hidden", abs > 2);
      card.setAttribute("aria-hidden", String(!active));

      if (video) {
        video.controls = active;
        if (!active) video.pause();
      }
    });

    if (slider) {
      slider.setAttribute("aria-valuemax", String(total));
      slider.setAttribute("aria-valuenow", String(current + 1));
    }
    if (bar) {
      bar.style.width = total ? `${((current + 1) / total) * 100}%` : "0%";
    }
    if (count) {
      count.textContent = total
        ? `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
        : "";
    }
  };

  const goTo = (index) => {
    if (!total) return;
    current = ((index % total) + total) % total;
    render();
  };

  /* ---------- Navigation Controls ---------- */
  prevButton?.addEventListener("click", () => goTo(current - 1));
  nextButton?.addEventListener("click", () => goTo(current + 1));

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "VIDEO") return;
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      build(chip.dataset.filter);
    });
  });

  /* ---------- Touch / Mouse Swipe Interactions ---------- */
  let wheelAcc = 0;
  let wheelLock = false;

  stage.addEventListener(
    "wheel",
    (e) => {
      const dx =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (!dx) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelAcc += dx;
      if (Math.abs(wheelAcc) > 50) {
        goTo(current + (wheelAcc > 0 ? 1 : -1));
        wheelAcc = 0;
        wheelLock = true;
        setTimeout(() => (wheelLock = false), 450);
      }
    },
    { passive: false },
  );

  let tracking = false;
  let startX = 0;
  let startY = 0;

  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    if (e.target.tagName === "VIDEO") {
      if (e.clientY > e.target.getBoundingClientRect().bottom - 64) return;
    }
    tracking = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  stage.addEventListener("pointermove", (e) => {
    if (tracking && Math.abs(e.clientX - startX) > 10) moved = true;
  });

  window.addEventListener("pointerup", (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      moved = true;
      goTo(current + (dx < 0 ? 1 : -1));
    }
    setTimeout(() => (moved = false), 60);
  });
  window.addEventListener("pointercancel", () => (tracking = false));

  // Progress Bar Scrubbing
  let scrubbing = false;
  const scrubTo = (e) => {
    if (!slider) return;
    const r = slider.getBoundingClientRect();
    const f = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
    goTo(Math.floor(f * total));
  };

  if (slider) {
    slider.addEventListener("pointerdown", (e) => {
      scrubbing = true;
      slider.setPointerCapture(e.pointerId);
      scrubTo(e);
    });
    slider.addEventListener("pointermove", (e) => scrubbing && scrubTo(e));
    slider.addEventListener("pointerup", () => (scrubbing = false));
    slider.addEventListener("pointercancel", () => (scrubbing = false));
  }

  build("all");

  /* 7. Contact Form Handling */
  const WORKER_URL = "https://v1nqx-contact.alikulovabdullo83.workers.dev/";

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  // Перевод строки из JS: window.translate определён в apply-translations.js.
  // Если i18n недоступен — используется английский fallback.
  const tr = (key, fallback) =>
    typeof window.translate === "function"
      ? window.translate(key, fallback)
      : fallback;

  // Статус хранится по ключу (data-i18n), поэтому при смене языка
  // уже показанное сообщение тоже переводится.
  const showStatus = (key, type, fallback = "") => {
    if (!formStatus) return;
    if (key) {
      formStatus.setAttribute("data-i18n", key);
      formStatus.textContent = tr(key, fallback);
    } else {
      formStatus.removeAttribute("data-i18n");
      formStatus.textContent = "";
    }
    formStatus.className = `form-status ${type}`;
  };

  const setLoading = (isLoading) => {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    const btnText = submitBtn.querySelector("span");
    if (btnText) {
      const key = isLoading ? "form.sending" : "form.submit";
      btnText.setAttribute("data-i18n", key);
      btnText.textContent = tr(key, isLoading ? "Sending..." : "Send Message");
    }
  };

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("userName")?.value.trim();
    const contact = document.getElementById("userContact")?.value.trim();
    const project = document.getElementById("projectType")?.value;
    const message = document.getElementById("userMessage")?.value.trim();

    if (!name || !contact || !message) {
      showStatus(
        "form.status.required",
        "error",
        "Please fill in all required fields.",
      );
      return;
    }

    setLoading(true);
    showStatus("", "");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact,
          project,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send");
      }

      showStatus(
        "form.status.success",
        "success",
        "Message sent successfully! I will get back to you soon.",
      );
      contactForm.reset();
      // reset() вернёт скрытое поле к значению по умолчанию — синхронизируем и подпись селекта
      document.querySelector("#customProjectType .custom-option")?.click();
    } catch (error) {
      console.error("Form submit error:", error);
      showStatus(
        "form.status.error",
        "error",
        "Failed to send. Please contact directly via Telegram or Instagram.",
      );
    } finally {
      setLoading(false);
    }
  });

  // 8. Custom Select Dropdown Logic
  const customSelect = document.getElementById("customProjectType");

  if (customSelect) {
    const trigger = customSelect.querySelector(".custom-select-trigger");
    const options = customSelect.querySelectorAll(".custom-option");
    const hiddenInput = customSelect.querySelector("input[type='hidden']");
    const selectedText = customSelect.querySelector(".selected-option");

    // Toggle dropdown
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = customSelect.classList.contains("is-open");

      // Close all other custom selects if present
      document
        .querySelectorAll(".custom-select-wrapper.is-open")
        .forEach((el) => {
          el.classList.remove("is-open");
          el.querySelector(".custom-select-trigger")?.setAttribute(
            "aria-expanded",
            "false",
          );
        });

      if (!isOpen) {
        customSelect.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    // Option selection
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value");
        const text = option.textContent.trim();

        // В форму уходит исходное (английское) значение data-value,
        // а на экране показывается переведённый текст пункта.
        hiddenInput.value = value;
        selectedText.textContent = text;
        const i18nKey = option.getAttribute("data-i18n");
        if (i18nKey) selectedText.setAttribute("data-i18n", i18nKey);

        options.forEach((opt) => opt.classList.remove("is-selected"));
        option.classList.add("is-selected");

        customSelect.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      });
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && customSelect.classList.contains("is-open")) {
        customSelect.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 9. Language Switcher (header + footer)
  const langSwitches = document.querySelectorAll("[data-lang-switch]");

  const closeLangSwitch = (sw) => {
    sw.classList.remove("is-open");
    sw.querySelector(".lang-switch__trigger")?.setAttribute(
      "aria-expanded",
      "false",
    );
  };

  const closeAllLangSwitches = (except) => {
    langSwitches.forEach((sw) => {
      if (sw !== except) closeLangSwitch(sw);
    });
  };

  const getCurrentLang = () => {
    const raw =
      window.i18next?.resolvedLanguage ||
      window.i18next?.language ||
      document.documentElement.lang ||
      "en";
    return String(raw).toLowerCase().split(/[-_]/)[0];
  };

  // Показывает текущий язык на кнопке и подсвечивает активный пункт.
  // Переключение самого языка выполняет i18n-setup.js по атрибуту data-set-lang.
  const syncLangSwitches = () => {
    const current = getCurrentLang();
    langSwitches.forEach((sw) => {
      sw.querySelectorAll(".lang-switch__option").forEach((opt) => {
        const isActive = opt.getAttribute("data-set-lang") === current;
        opt.classList.toggle("is-active", isActive);
        opt.setAttribute("aria-selected", String(isActive));
      });
      const code = sw.querySelector(".lang-switch__code");
      if (code) code.textContent = current.toUpperCase();
    });
  };

  langSwitches.forEach((sw) => {
    const trigger = sw.querySelector(".lang-switch__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !sw.classList.contains("is-open");
      closeAllLangSwitches(sw);
      // Закрываем и выпадающий список формы, чтобы меню не накладывались
      document
        .querySelectorAll(".custom-select-wrapper.is-open")
        .forEach((el) => el.classList.remove("is-open"));
      sw.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    sw.querySelectorAll(".lang-switch__option").forEach((opt) => {
      opt.addEventListener("click", () => {
        closeLangSwitch(sw);
        trigger.focus({ preventScroll: true });
      });
    });
  });

  document.addEventListener("click", (e) => {
    langSwitches.forEach((sw) => {
      if (!sw.contains(e.target)) closeLangSwitch(sw);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    langSwitches.forEach((sw) => {
      if (sw.classList.contains("is-open")) {
        closeLangSwitch(sw);
        sw.querySelector(".lang-switch__trigger")?.focus({
          preventScroll: true,
        });
      }
    });
  });

  // Шапка скрывается при прокрутке — вместе с ней закрываем её меню языка
  window.addEventListener(
    "scroll",
    () => {
      if (header?.classList.contains("is-hidden")) {
        langSwitches.forEach((sw) => {
          if (header.contains(sw)) closeLangSwitch(sw);
        });
      }
    },
    { passive: true },
  );

  document.addEventListener("i18n:ready", syncLangSwitches);
  document.addEventListener("i18n:languagechange", syncLangSwitches);
  window.i18nReady?.then(syncLangSwitches);
  syncLangSwitches();

  // 10. Mobile Navigation Menu
  const navToggle = document.getElementById("navToggle");

  const setMenu = (open) => {
    if (!header || !navToggle) return;
    header.classList.toggle("is-menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };

  navToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllLangSwitches();
    setMenu(!header.classList.contains("is-menu-open"));
  });

  document.querySelectorAll("#siteNav a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (header && !header.contains(e.target)) setMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenu(false);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (header?.classList.contains("is-hidden")) setMenu(false);
    },
    { passive: true },
  );

  // Меню языка и мобильное меню не должны быть открыты одновременно
  langSwitches.forEach((sw) => {
    sw.querySelector(".lang-switch__trigger")?.addEventListener("click", () =>
      setMenu(false),
    );
  });
});
