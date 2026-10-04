/**
 * i18n-setup.js
 * ---------------------------------------------------------------------------
 * Инициализация i18next, определение языка устройства и переключение языков.
 *
 * Порядок подключения в index.html (в конце <body>):
 *   1) i18next (CDN)
 *   2) scripts/i18n-setup.js
 *   3) scripts/apply-translations.js
 *
 * Приоритет выбора языка:
 *   1. Язык, выбранный пользователем вручную (localStorage)
 *   2. navigator.languages / navigator.language — первый поддерживаемый
 *      (региональные коды en-US, ru-RU, uz-Latn-UZ приводятся к en / ru / uz)
 *   3. en (fallback)
 *
 * Публичный API (window):
 *   switchLanguage(lang)  — сменить язык без перезагрузки ('en' | 'ru' | 'uz')
 *   i18nReady             — Promise, который выполняется после первой отрисовки переводов
 *
 * Кнопки переключения можно делать без JS-кода:
 *   <button data-set-lang="ru">RU</button>
 */
(function () {
  "use strict";

  var SUPPORTED_LANGS = ["en", "ru", "uz"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "preferred-language";

  // document.currentScript доступен только во время синхронного выполнения скрипта,
  // поэтому путь к locales/ вычисляем сразу. Так файлы работают с любой страницы сайта
  // (в том числе из вложенных папок), а не только из корня.
  var currentScript = document.currentScript;
  var LOCALES_URL =
    currentScript && currentScript.src
      ? new URL("locales/", currentScript.src).href
      : "scripts/locales/";

  var resolveReady;
  window.i18nReady = new Promise(function (resolve) {
    resolveReady = resolve;
  });

  // ---------------------------------------------------------------------------
  // Определение языка
  // ---------------------------------------------------------------------------

  /** 'ru-RU' -> 'ru', 'uz_Latn_UZ' -> 'uz' */
  function baseLang(code) {
    return String(code || "")
      .toLowerCase()
      .split(/[-_]/)[0];
  }

  function readStoredLanguage() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGS.indexOf(stored) !== -1 ? stored : null;
    } catch (e) {
      return null; // localStorage может быть недоступен (приватный режим и т.п.)
    }
  }

  function storeLanguage(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* не критично */
    }
  }

  function detectLanguage() {
    var stored = readStoredLanguage();
    if (stored) return stored;

    var preferred =
      Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage];

    for (var i = 0; i < preferred.length; i++) {
      var lang = baseLang(preferred[i]);
      if (SUPPORTED_LANGS.indexOf(lang) !== -1) return lang;
    }
    return DEFAULT_LANG;
  }

  // ---------------------------------------------------------------------------
  // Загрузка ресурсов
  // ---------------------------------------------------------------------------

  /** Загружает locales/<lang>.json. При ошибке — пишет в консоль и возвращает null. */
  function loadLocale(lang) {
    return fetch(LOCALES_URL + lang + ".json")
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .catch(function (error) {
        console.error(
          "[i18n] Не удалось загрузить locales/" + lang + ".json:",
          error,
        );
        return null;
      });
  }

  function domReady() {
    if (document.readyState !== "loading") return Promise.resolve();
    return new Promise(function (resolve) {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Переключатели языка в интерфейсе (необязательные)
  // ---------------------------------------------------------------------------

  function updateSwitchers() {
    var current = window.i18next.resolvedLanguage || window.i18next.language;
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-set-lang") === current;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("is-active", active);
    });
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest && event.target.closest("[data-set-lang]");
    if (!btn) return;
    event.preventDefault();
    window.switchLanguage(btn.getAttribute("data-set-lang"));
  });

  // ---------------------------------------------------------------------------
  // Публичное API
  // ---------------------------------------------------------------------------

  /**
   * Меняет язык интерфейса без перезагрузки страницы и запоминает выбор.
   * @param {string} lang 'en' | 'ru' | 'uz' (допускаются коды вида 'ru-RU')
   */
  window.switchLanguage = function (lang) {
    var target = baseLang(lang);
    if (SUPPORTED_LANGS.indexOf(target) === -1) {
      console.warn(
        '[i18n] Язык "' +
          lang +
          '" не поддерживается. Доступно: ' +
          SUPPORTED_LANGS.join(", "),
      );
      return Promise.resolve();
    }
    return window.i18nReady.then(function () {
      if (
        typeof window.i18next === "undefined" ||
        !window.i18next.isInitialized
      )
        return;
      return window.i18next.changeLanguage(target).then(function () {
        storeLanguage(target);
        if (typeof window.applyTranslations === "function")
          window.applyTranslations();
        updateSwitchers();
        document.dispatchEvent(
          new CustomEvent("i18n:languagechange", {
            detail: { language: window.i18next.resolvedLanguage || target },
          }),
        );
      });
    });
  };

  // ---------------------------------------------------------------------------
  // Инициализация
  // ---------------------------------------------------------------------------

  function init() {
    if (typeof window.i18next === "undefined") {
      console.error(
        "[i18n] Библиотека i18next не загружена. Сайт останется на английском.",
      );
      resolveReady();
      return Promise.resolve();
    }

    var lang = detectLanguage();

    // Все три файла грузятся параллельно и кэшируются в памяти i18next —
    // последующие переключения языка происходят мгновенно, без запросов к сети.
    return Promise.all(SUPPORTED_LANGS.map(loadLocale))
      .then(function (files) {
        var resources = {};
        SUPPORTED_LANGS.forEach(function (code, i) {
          if (files[i]) resources[code] = { translation: files[i] };
        });

        return window.i18next.init({
          lng: lang,
          fallbackLng: DEFAULT_LANG,
          supportedLngs: SUPPORTED_LANGS,
          load: "languageOnly",
          resources: resources,
          returnNull: false,
          interpolation: { escapeValue: false }, // текст вставляется через textContent
        });
      })
      .then(domReady) // гарантирует, что apply-translations.js уже выполнен
      .then(function () {
        if (typeof window.applyTranslations === "function") {
          window.applyTranslations();
        } else {
          console.error("[i18n] apply-translations.js не подключён.");
        }
        updateSwitchers();
        document.dispatchEvent(
          new CustomEvent("i18n:ready", {
            detail: { language: window.i18next.resolvedLanguage || lang },
          }),
        );
      })
      .catch(function (error) {
        // Ошибка перевода не должна ломать сайт — останется исходный английский текст.
        console.error("[i18n] Ошибка инициализации:", error);
      })
      .then(resolveReady);
  }

  init();
})();
