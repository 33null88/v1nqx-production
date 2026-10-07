document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const preloader = document.getElementById("preloader");
  const video1 = document.getElementById("bg-video-1");
  const video2 = document.getElementById("bg-video-2");
  const videoContact = document.getElementById("bg-video-contact");
  const globalVideoBg = document.getElementById("global-video-bg");

  const portfolioSection = document.getElementById("portfolio");
  const contactSection = document.getElementById("contact");
  const section3D = document.querySelector(".achievements-3d");
  const cards3D = document.querySelectorAll(".review-3d-card");

  const header = document.querySelector(".header");
  const topButton = document.getElementById("top");

  // 1. Hide Preloader
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
  };

  // Ждём применения переводов (i18n), чтобы после скрытия прелоадера
  // пользователь не увидел вспышку английского текста. Страховочный лимит — 3 с.
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

  // 2. Smart Background Video Loading
  // Видео грузятся по очереди, а не все сразу:
  //   1) первое — после загрузки страницы (не тормозит прелоадер)
  //   2) остальные — по очереди, когда предыдущее готово
  // Если нужное видео ещё не загружено, оно грузится приоритетно (см. setActiveVideo).
  const bgVideos = [video1, video2, videoContact].filter(Boolean);

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const saveBandwidth = Boolean(
    connection &&
    (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "")),
  );

  const tryPlay = (video) => {
    if (!video || !video.getAttribute("src")) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  const loadBgVideo = (video) => {
    if (!video || saveBandwidth || video.dataset.loading) return;
    const src = video.dataset.src;
    if (!src) return;
    video.dataset.loading = "1";
    video.preload = "auto";
    video.src = src;
    video.load();
    // Диагностика: если файл не найден (404) или формат не поддерживается
    // (например, H.265), пишем причину в консоль и берём первое видео вместо него
    video.addEventListener("error", () => {
      video.dataset.failed = "1";
      const code = video.error ? video.error.code : "?";
      console.warn(
        `[bg-video] не загрузилось: ${video.dataset.src} (код ${code}: ` +
          `${code === 4 ? "файл не найден или формат не поддерживается" : code === 3 ? "ошибка декодирования" : code === 2 ? "сетевая ошибка" : "прервано"})`,
      );
      setActiveVideo(requestedVideo);
    });
    // Повторяем play(), как только браузер реально получил данные
    video.addEventListener("loadeddata", () => tryPlay(video), { once: true });
    video.addEventListener(
      "canplay",
      () => {
        if (video.classList.contains("is-active")) tryPlay(video);
      },
      { once: true },
    );
    tryPlay(video);
  };

  // Ждём, пока видео будет готово к воспроизведению (или истечёт таймаут)
  const whenReady = (video, timeout = 8000) =>
    new Promise((resolve) => {
      if (!video || video.readyState >= 3) return resolve();
      const done = () => resolve();
      video.addEventListener("canplaythrough", done, { once: true });
      video.addEventListener("error", done, { once: true });
      setTimeout(done, timeout);
    });

  // Режим «один фон»: на телефонах грузим только первое видео и используем
  // его во всех секциях — это в 3 раза меньше трафика и нагрузки на GPU.
  // Чтобы на телефонах тоже были 3 видео — поставьте false.
  const SINGLE_VIDEO_ON_MOBILE = true;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const singleVideoMode =
    SINGLE_VIDEO_ON_MOBILE && window.matchMedia("(max-width: 768px)").matches;

  const startBgVideos = async () => {
    if (saveBandwidth || reducedMotion) return; // экономия: фон не грузим
    loadBgVideo(video1);
    if (singleVideoMode) return;
    await whenReady(video1);
    for (const vid of [video2, videoContact]) {
      loadBgVideo(vid);
      await whenReady(vid);
    }
  };

  if (document.readyState === "complete") {
    startBgVideos();
  } else {
    window.addEventListener("load", startBgVideos, { once: true });
  }

  // Если браузер заблокировал автозапуск — запускаем при первом касании/клике
  const resumeActiveVideo = () =>
    tryPlay(bgVideos.find((v) => v.classList.contains("is-active")));
  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((evt) =>
    window.addEventListener(evt, resumeActiveVideo, {
      once: true,
      passive: true,
    }),
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resumeActiveVideo();
  });

  // 3. UI Scroll Actions (Header & Top Button)
  const handleScrollUI = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      if (scrollY > 250) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }

    if (topButton) {
      if (scrollY > 300) {
        topButton.classList.add("visible");
      } else {
        topButton.classList.remove("visible");
      }
    }
  };

  if (topButton) {
    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Пока фон скрыт (is-dimmed над 3D-блоком) — не тратим ресурсы на видео
  const syncBgPlayback = () => {
    const active = bgVideos.find((v) => v.classList.contains("is-active"));
    if (globalVideoBg?.classList.contains("is-dimmed")) {
      active?.pause();
    } else {
      tryPlay(active);
    }
  };

  // Helper: Set active background video
  let requestedVideo = video1;
  const setActiveVideo = (wanted) => {
    requestedVideo = wanted;
    // Режим «один фон» или видео не загрузилось -> показываем первое видео
    const activeVideo =
      singleVideoMode || (wanted && wanted.dataset.failed) ? video1 : wanted;
    bgVideos.forEach((vid) => {
      const on = vid === activeVideo;
      vid.classList.toggle("is-active", on);
      if (on) {
        loadBgVideo(vid); // нужное видео грузим сразу, не дожидаясь очереди
        tryPlay(vid);
      } else {
        // Останавливаем после затухания, чтобы не грузить процессор
        setTimeout(() => {
          if (!vid.classList.contains("is-active")) vid.pause();
        }, 900);
      }
    });
  };

  // 4. Background Video Switcher
  let currentActiveVideo = video1;

  if (portfolioSection && video1 && video2) {
    const portfolioObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          currentActiveVideo = entry.isIntersecting ? video2 : video1;

          const contactRect = contactSection?.getBoundingClientRect();
          const isContactVisible =
            contactRect &&
            contactRect.top < window.innerHeight / 2 &&
            contactRect.bottom > 0;

          if (!isContactVisible) {
            setActiveVideo(currentActiveVideo);
          }
        });
      },
      { threshold: 0.3 },
    );

    portfolioObserver.observe(portfolioSection);
  }

  if (contactSection && videoContact) {
    const contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            globalVideoBg?.classList.remove("is-dimmed");
            setActiveVideo(videoContact);
            syncBgPlayback();
          } else {
            setActiveVideo(currentActiveVideo);
          }
        });
      },
      { threshold: 0.15 },
    );

    contactObserver.observe(contactSection);
  }

  // 5. Dim Video Background over 3D Achievements
  if (section3D && globalVideoBg) {
    const achievementsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const contactRect = contactSection?.getBoundingClientRect();
          const isContactVisible =
            contactRect &&
            contactRect.top < window.innerHeight &&
            contactRect.bottom > 0;

          if (entry.isIntersecting && !isContactVisible) {
            globalVideoBg.classList.add("is-dimmed");
          } else {
            globalVideoBg.classList.remove("is-dimmed");
          }
          syncBgPlayback();
        });
      },
      { threshold: 0.05 },
    );

    achievementsObserver.observe(section3D);
  }

  // 6. 3D Scroll Tunnel Animation
  const update3DScroll = () => {
    if (!section3D || cards3D.length === 0) return;

    const rect = section3D.getBoundingClientRect();
    const sectionHeight = section3D.offsetHeight - window.innerHeight;

    if (sectionHeight <= 0) return;

    let progress = -rect.top / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));

    const maxDepth = 6500;
    const currentCameraZ = progress * maxDepth;

    cards3D.forEach((card) => {
      const baseZ = parseFloat(card.getAttribute("data-z")) || 0;
      const relativeZ = baseZ + currentCameraZ;

      let opacity = 0;

      if (relativeZ > -2500 && relativeZ < 400) {
        opacity = (relativeZ + 2500) / 1200;
        if (relativeZ > 0) {
          opacity = 1 - relativeZ / 400;
        }
      }

      opacity = Math.max(0, Math.min(1, opacity));

      card.style.transform = `translate3d(0, 0, ${relativeZ}px)`;
      card.style.opacity = opacity.toFixed(3);

      if (opacity <= 0.01) {
        card.style.pointerEvents = "none";
        card.style.visibility = "hidden";
      } else {
        card.style.pointerEvents = "auto";
        card.style.visibility = "visible";
      }
    });
  };

  const onScroll = () => {
    handleScrollUI();
    update3DScroll();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
