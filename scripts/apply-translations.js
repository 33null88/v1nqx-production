/**
 * apply-translations.js
 * ---------------------------------------------------------------------------
 * Применяет переводы i18next к DOM. Не зависит от других файлов проекта,
 * требует только глобальный `i18next` (подключается через CDN).
 *
 * Поддерживаемые атрибуты:
 *   data-i18n                — основной текст элемента
 *   data-i18n-placeholder    — placeholder
 *   data-i18n-title          — title
 *   data-i18n-alt            — alt
 *   data-i18n-aria-label     — aria-label
 *   data-i18n-content        — content (для <meta>)
 *
 * Публичный API (window):
 *   applyTranslations(root?)   — немедленно перевести root (по умолчанию весь документ)
 *   reapplyTranslations(root?) — то же, но с debounce (безопасно вызывать часто)
 *   translate(key, fallback?)  — получить перевод строки из JS-кода
 *
 * Особенности:
 *  - Исходный (английский) текст запоминается при первом проходе и используется
 *    как запасной вариант, если ключа нет или JSON не загрузился.
 *  - Вложенные элементы и их обработчики событий не затрагиваются: если у элемента
 *    есть дочерние теги, заменяется только его собственный текстовый узел.
 *  - Динамически добавленные элементы переводятся через MutationObserver (с debounce).
 */
(function () {
  "use strict";

  var TEXT_ATTR = "data-i18n";
  var ATTR_MAP = {
    "data-i18n-placeholder": "placeholder",
    "data-i18n-title": "title",
    "data-i18n-alt": "alt",
    "data-i18n-aria-label": "aria-label",
    "data-i18n-content": "content",
  };
  var SELECTOR = ["[" + TEXT_ATTR + "]"]
    .concat(
      Object.keys(ATTR_MAP).map(function (a) {
        return "[" + a + "]";
      }),
    )
    .join(",");

  var DEBOUNCE_MS = 50;

  /** el -> { text: string, attrs: { [attrName]: string } } — исходные значения из HTML */
  var originals = new WeakMap();
  /** Ключи, о которых уже предупредили (чтобы не засорять консоль) */
  var warned = new Set();

  var observer = null;
  var pendingNodes = new Set();
  var pendingTimer = null;
  var reapplyTimer = null;

  // ---------------------------------------------------------------------------
  // Поиск перевода
  // ---------------------------------------------------------------------------

  function isReady() {
    return (
      typeof window.i18next !== "undefined" && window.i18next.isInitialized
    );
  }

  function warnMissing(key) {
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
      '[i18n] Перевод не найден для ключа "' +
        key +
        '", используется исходный текст.',
    );
  }

  /**
   * Возвращает перевод или fallback (исходный текст со страницы).
   * @param {string} key
   * @param {string|null} fallback
   */
  function lookup(key, fallback) {
    if (isReady() && window.i18next.exists(key)) {
      return window.i18next.t(key);
    }
    if (isReady()) warnMissing(key);
    return fallback;
  }

  // ---------------------------------------------------------------------------
  // Работа с текстом элемента
  // ---------------------------------------------------------------------------

  /** Первый непустой собственный текстовый узел элемента (дочерние теги игнорируются). */
  function findOwnTextNode(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim() !== "") return n;
    }
    return null;
  }

  function normalize(str) {
    return str.replace(/\s+/g, " ").trim();
  }

  function readText(el) {
    if (el.children.length === 0) return normalize(el.textContent);
    var node = findOwnTextNode(el);
    return node ? normalize(node.nodeValue) : "";
  }

  function writeText(el, value) {
    // Простой элемент без вложенных тегов.
    if (el.children.length === 0) {
      if (el.textContent !== value) el.textContent = value;
      return;
    }
    // Смешанный контент: меняем только собственный текстовый узел,
    // сохраняя окружающие пробелы и все дочерние элементы (и их слушатели).
    var node = findOwnTextNode(el);
    if (node) {
      var m = node.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/);
      var next = m[1] + value + m[2];
      if (node.nodeValue !== next) node.nodeValue = next;
    } else {
      el.insertBefore(document.createTextNode(value + " "), el.firstChild);
    }
  }

  // ---------------------------------------------------------------------------
  // Перевод одного элемента / поддерева
  // ---------------------------------------------------------------------------

  function translateElement(el) {
    var rec = originals.get(el);
    if (!rec) {
      rec = { text: null, attrs: {} };
      originals.set(el, rec);
    }

    // 1) Текст
    var textKey = el.getAttribute(TEXT_ATTR);
    if (textKey) {
      if (rec.text === null) rec.text = readText(el);
      var text = lookup(textKey, rec.text);
      if (text) writeText(el, text);
    }

    // 2) Атрибуты
    Object.keys(ATTR_MAP).forEach(function (i18nAttr) {
      var key = el.getAttribute(i18nAttr);
      if (!key) return;
      var target = ATTR_MAP[i18nAttr];
      if (!(i18nAttr in rec.attrs))
        rec.attrs[i18nAttr] = el.getAttribute(target);
      var value = lookup(key, rec.attrs[i18nAttr]);
      if (
        value !== null &&
        value !== undefined &&
        el.getAttribute(target) !== value
      ) {
        el.setAttribute(target, value);
      }
    });
  }

  function translateTree(root) {
    if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
    var list = [];
    if (root.nodeType === 1 && root.matches(SELECTOR)) list.push(root);
    list.push.apply(list, root.querySelectorAll(SELECTOR));
    list.forEach(translateElement);
  }

  // ---------------------------------------------------------------------------
  // MutationObserver для динамически добавленных элементов
  // ---------------------------------------------------------------------------

  function startObserver() {
    if (!("MutationObserver" in window) || !document.documentElement) return;
    if (!observer) {
      observer = new MutationObserver(onMutations);
    }
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  /** Выполняет fn, не реагируя на собственные изменения DOM (защита от цикла). */
  function runSilently(fn) {
    if (observer) observer.disconnect();
    try {
      fn();
    } finally {
      startObserver();
    }
  }

  function onMutations(mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) pendingNodes.add(node);
      });
    });
    if (pendingNodes.size === 0) return;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(flushPending, DEBOUNCE_MS);
  }

  function flushPending() {
    var nodes = Array.from(pendingNodes);
    pendingNodes.clear();
    if (!isReady()) return;
    runSilently(function () {
      nodes.forEach(function (node) {
        if (node.isConnected) translateTree(node);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Публичный API
  // ---------------------------------------------------------------------------

  /**
   * Переводит весь документ (или переданное поддерево).
   * Также обновляет атрибут lang у <html>.
   */
  function applyTranslations(root) {
    runSilently(function () {
      translateTree(root || document.documentElement);
      if (isReady() && !root) {
        var lang = window.i18next.resolvedLanguage || window.i18next.language;
        if (lang) document.documentElement.setAttribute("lang", lang);
      }
    });
  }

  /** Версия applyTranslations с debounce — безопасна для частых вызовов. */
  function reapplyTranslations(root) {
    clearTimeout(reapplyTimer);
    reapplyTimer = setTimeout(function () {
      applyTranslations(root);
    }, DEBOUNCE_MS);
  }

  /**
   * Перевод строки из JS-кода (сообщения форм, уведомления и т.п.).
   * Если i18next недоступен или ключа нет — вернёт fallback (или сам ключ).
   */
  function translate(key, fallback) {
    if (isReady() && window.i18next.exists(key)) return window.i18next.t(key);
    return fallback !== undefined ? fallback : key;
  }

  window.applyTranslations = applyTranslations;
  window.reapplyTranslations = reapplyTranslations;
  window.translate = translate;

  // Наблюдатель включается после первой инициализации i18next.
  document.addEventListener("i18n:ready", startObserver);
})();
