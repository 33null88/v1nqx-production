/**
 * 🌍 ГАЙД ПО ДОБАВЛЕНИЮ НОВЫХ ЯЗЫКОВ
 * 
 * Этот файл содержит пошаговые инструкции для добавления
 * новых языков в систему локализации сайта v1nqx
 */

// ═══════════════════════════════════════════════════════════════════════════
// ПОШАГОВАЯ ИНСТРУКЦИЯ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ШАГ 1: ДОБАВИТЬ ПЕРЕВОДЫ В i18n.js
 * 
 * Откройте файл i18n.js и найдите объект translations
 * Добавьте новый язык в конец объекта (перед последней скобкой)
 */

// ПРИМЕР: Добавление португальского языка (pt)

const newLanguageTemplate = {
  pt: {
    // Навигация
    nav_home: 'Início',
    nav_about: 'Sobre',
    nav_portfolio: 'Portfólio',
    nav_contact: 'Contato',
    
    // Главная секция
    hero_subtitle: 'Designer de Movimento e SpeedRamper',
    hero_cta: 'Ver Meu Trabalho',
    
    // Портфолио
    portfolio_title: 'Portfólio',
    portfolio_desc: 'Uma seleção curada de meus projetos de motion design, speedramp e comerciais.',
    cat_all: 'Tudo',
    cat_motion: 'Speedramps',
    cat_commercial: 'Comercial',
    
    // О мне
    about_title: 'Sobre Mim',
    about_achievements: '🏆 Realizações',
    about_achievement1: '• #1 Editor em Samarcanda',
    about_achievement2: '• #9 Criador de Reels no Uzbequistão',
    about_achievement3: '• #4 Especialista em Speed Ramp',
    about_achievement4: '• Múltiplos Vencedores de Torneios Internacionais',
    about_experience: '💼 Experiência',
    about_exp1: '• Edição de Filmes e Séries',
    about_exp2: '• Criação de Conteúdo Automotivo',
    about_exp3: '• Motion Design e VFX',
    about_exp4: '• Fotografia Comercial',
    about_text: 'Designer de movimento profissional com anos de experiência em After Effects.',
    
    // Контакты
    contact_title: 'Vamos Trabalhar Juntos',
    contact_desc: 'Tem um projeto em mente? Vamos criar algo incrível juntos.',
    contact_phone: 'Encomendar Agora',
    
    // Подвал
    footer_rights: 'Todos os direitos reservados.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ШАГ 2: КОД ДЛЯ ДОБАВЛЕНИЯ В i18n.js
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Откройте i18n.js и найдите строку:
 * const translations = {
 * 
 * Добавьте весь код выше (нового языка) перед последней скобкой
 * 
 * ВАЖНО: Убедитесь, что все ключи совпадают с существующими языками!
 */

// ═══════════════════════════════════════════════════════════════════════════
// ШАГ 3: ОБНОВИТЬ СЕЛЕКТОР В HTML
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Откройте index.html и найдите:
 * <select id="languageSelect">
 * 
 * Добавьте новую опцию перед </select>:
 * <option value="pt">Português</option>
 */

const htmlUpdates = `
<!-- ДОБАВИТЬ ЭТУ СТРОКУ В index.html ДО </select> -->
<option value="pt">Português</option>
`;

// ═══════════════════════════════════════════════════════════════════════════
// ШАГ 4: ПРОВЕРКА (ОПЦИОНАЛЬНО)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Откройте браузер и введите в консоль (F12):
 * 
 * 1. Проверить, что язык добавлен:
 *    i18n.supportedLanguages
 *    // Должен вывести: ['en', 'ru', 'uz', 'es', 'de', 'fr', 'zh', 'pt']
 * 
 * 2. Установить новый язык:
 *    i18n.setLanguage('pt')
 * 
 * 3. Проверить перевод:
 *    i18n.t('nav_home')
 *    // Должен вывести: 'Início'
 */

// ═══════════════════════════════════════════════════════════════════════════
// СПИСОК ВСЕХ КЛЮЧЕЙ (КОПИРУЙТЕ И ПЕРЕВОДИТЕ)
// ═══════════════════════════════════════════════════════════════════════════

const allTranslationKeys = {
  // НАВИГАЦИЯ
  nav_home: 'Текст для главной страницы',
  nav_about: 'Текст для страницы "О мне"',
  nav_portfolio: 'Текст для портфолио',
  nav_contact: 'Текст для контактов',
  
  // ГЛАВНАЯ СЕКЦИЯ
  hero_subtitle: 'Подзаголовок на главной',
  hero_cta: 'Кнопка "Смотреть работы"',
  
  // ПОРТФОЛИО
  portfolio_title: 'Название секции портфолио',
  portfolio_desc: 'Описание портфолио',
  cat_all: 'Фильтр "Все"',
  cat_motion: 'Фильтр "SpeedRamps"',
  cat_commercial: 'Фильтр "Коммерческие"',
  
  // ОБО МНЕ
  about_title: 'Название секции "Обо мне"',
  about_achievements: 'Заголовок "Достижения"',
  about_achievement1: 'Первое достижение',
  about_achievement2: 'Второе достижение',
  about_achievement3: 'Третье достижение',
  about_achievement4: 'Четвертое достижение',
  about_experience: 'Заголовок "Опыт"',
  about_exp1: 'Первый пункт опыта',
  about_exp2: 'Второй пункт опыта',
  about_exp3: 'Третий пункт опыта',
  about_exp4: 'Четвертый пункт опыта',
  about_text: 'Основной текст описания',
  
  // КОНТАКТЫ
  contact_title: 'Заголовок контактов',
  contact_desc: 'Описание контактов',
  contact_phone: 'Кнопка заказа',
  
  // ПОДВАЛ
  footer_rights: 'Текст прав'
};

// ═══════════════════════════════════════════════════════════════════════════
// ПРИМЕРЫ ДРУГИХ ЯЗЫКОВ (КОПИРУЙТЕ КАК ШАБЛОН)
// ═══════════════════════════════════════════════════════════════════════════

const exampleLanguages = {
  
  /**
   * ПРИМЕР 1: ИТАЛЬЯНСКИЙ (it)
   */
  it: {
    nav_home: 'Home',
    nav_about: 'Chi Siamo',
    nav_portfolio: 'Portafoglio',
    nav_contact: 'Contatti',
    hero_subtitle: 'Motion Designer e SpeedRamper',
    hero_cta: 'Vedi il Mio Lavoro',
    portfolio_title: 'Portafoglio',
    portfolio_desc: 'Una selezione curata dei miei progetti di motion design, speedramp e commerciali.',
    cat_all: 'Tutti',
    cat_motion: 'Speedramps',
    cat_commercial: 'Commerciale',
    about_title: 'Su di Me',
    about_achievements: '🏆 Risultati',
    about_achievement1: '• #1 Editor a Samarcanda',
    about_achievement2: '• #9 Creatore di Reels in Uzbekistan',
    about_achievement3: '• #4 Specialista di Speed Ramp',
    about_achievement4: '• Vincitore di Molteplici Tornei Internazionali',
    about_experience: '💼 Esperienza',
    about_exp1: '• Montaggio di Film e Serie',
    about_exp2: '• Creazione di Contenuti Automobilistici',
    about_exp3: '• Motion Design e VFX',
    about_exp4: '• Fotografia Commerciale',
    about_text: 'Motion designer professionista con anni di esperienza in After Effects.',
    contact_title: 'Lavoriamo Insieme',
    contact_desc: 'Hai un progetto in mente? Creiamo qualcosa di incredibile insieme.',
    contact_phone: 'Ordina Ora',
    footer_rights: 'Tutti i diritti riservati.'
  },
  
  /**
   * ПРИМЕР 2: ТУРЕЦКИЙ (tr)
   */
  tr: {
    nav_home: 'Anasayfa',
    nav_about: 'Hakkımda',
    nav_portfolio: 'Portföy',
    nav_contact: 'İletişim',
    hero_subtitle: 'Motion Tasarımcı ve SpeedRamper',
    hero_cta: 'Çalışmalarımı Görün',
    portfolio_title: 'Portföy',
    portfolio_desc: 'Motion tasarım, speedramp ve ticari projelerimden seçili bir derleme.',
    cat_all: 'Tümü',
    cat_motion: 'Hızlı Rampalar',
    cat_commercial: 'Ticari',
    about_title: 'Hakkımda',
    about_achievements: '🏆 Başarılar',
    about_achievement1: '• Semerkand\'da #1 Editör',
    about_achievement2: '• Özbekistan\'da #9 Reels Yaratıcısı',
    about_achievement3: '• Speed Ramp Uzmanında #4',
    about_achievement4: '• Çok Sayıda Uluslararası Turnuva Kazananı',
    about_experience: '💼 Deneyim',
    about_exp1: '• Film ve Dizi Editörü',
    about_exp2: '• Otomotiv İçeriği Oluşturma',
    about_exp3: '• Motion Design ve VFX',
    about_exp4: '• Ticari Fotoğrafçılık',
    about_text: 'After Effects\'te yılların deneyimine sahip profesyonel motion tasarımcı.',
    contact_title: 'Birlikte Çalışalım',
    contact_desc: 'Aklınızda bir proje var mı? Birlikte harika bir şey yaratalalım.',
    contact_phone: 'Şimdi Sipariş Ver',
    footer_rights: 'Tüm hakları saklıdır.'
  },
  
  /**
   * ПРИМЕР 3: КОРЕЙСКИЙ (ko)
   */
  ko: {
    nav_home: '홈',
    nav_about: '소개',
    nav_portfolio: '포트폴리오',
    nav_contact: '연락처',
    hero_subtitle: '모션 디자이너 및 속도 램퍼',
    hero_cta: '작품 보기',
    portfolio_title: '포트폴리오',
    portfolio_desc: '나의 모션 디자인, 속도 램프 및 상업 프로젝트의 엄선된 선택.',
    cat_all: '모두',
    cat_motion: '속도 램프',
    cat_commercial: '상업용',
    about_title: '소개',
    about_achievements: '🏆 성과',
    about_achievement1: '• 사마르칸드 편집자 1위',
    about_achievement2: '• 우즈베키스탄 릴스 크리에이터 9위',
    about_achievement3: '• 속도 램프 전문가 4위',
    about_achievement4: '• 여러 국제 토너먼트 우승자',
    about_experience: '💼 경험',
    about_exp1: '• 영화 및 시리즈 편집',
    about_exp2: '• 자동차 콘텐츠 제작',
    about_exp3: '• 모션 디자인 및 VFX',
    about_exp4: '• 상업 사진',
    about_text: 'After Effects에서 수년간의 경험을 가진 전문 모션 디자이너.',
    contact_title: '함께 일해요',
    contact_desc: '프로젝트가 있으신가요? 함께 멋진 것을 만들어봅시다.',
    contact_phone: '지금 주문하세요',
    footer_rights: '모든 권리는 보유합니다.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ЧЕКЛИСТ ДЛЯ ДОБАВЛЕНИЯ НОВОГО ЯЗЫКА
// ═══════════════════════════════════════════════════════════════════════════

const addLanguageChecklist = `
✅ ЧЕКЛИСТ: КАК ДОБАВИТЬ НОВЫЙ ЯЗЫК

ШАГИ:
□ 1. Подготовить переводы всех 31 ключа
□ 2. Открыть файл i18n.js
□ 3. Найти объект translations
□ 4. Добавить новый язык в конец объекта
□ 5. Проверить синтаксис JavaScript (запятые, кавычки)
□ 6. Открыть index.html
□ 7. Найти <select id="languageSelect">
□ 8. Добавить новую <option value="XX">
□ 9. Сохранить оба файла
□ 10. Открыть сайт в браузере
□ 11. Проверить, что язык появился в селекторе
□ 12. Выбрать новый язык
□ 13. Проверить, что всё переведено корректно
□ 14. Перезагрузить страницу (проверить сохранение)

ПРОВЕРКА В КОНСОЛИ БРАУЗЕРА:
□ i18n.supportedLanguages  // Язык должен быть в списке
□ i18n.setLanguage('XX')   // Язык должен установиться
□ i18n.t('nav_home')       // Должен вернуться перевод

ОТЛАДКА:
□ Проверить консоль на ошибки (F12)
□ Проверить localStorage (Storage → LocalStorage)
□ Очистить кэш браузера если нужно
`;

console.log(addLanguageChecklist);

// ═══════════════════════════════════════════════════════════════════════════
// ЧАСТЫЕ ОШИБКИ И КАК ИХ ИЗБЕЖАТЬ
// ═══════════════════════════════════════════════════════════════════════════

const commonMistakes = {
  
  error1: {
    name: 'Неверный синтаксис JSON',
    wrong: `
      pt: {
        nav_home: 'Início'
        nav_about: 'Sobre'  // ❌ Забыта запятая
      }
    `,
    correct: `
      pt: {
        nav_home: 'Início',
        nav_about: 'Sobre'   // ✅ Запятая на месте
      }
    `,
    fix: 'Убедитесь, что между элементами есть запятые'
  },
  
  error2: {
    name: 'Неполные ключи',
    wrong: 'Забыли добавить какой-то ключ перевода',
    correct: 'Скопируйте все 31 ключ из другого языка',
    fix: 'Используйте шаблон из других языков как основу'
  },
  
  error3: {
    name: 'Неверный код языка',
    wrong: `<option value="Portuguese">Português</option>`,
    correct: `<option value="pt">Português</option>`,
    fix: 'Используйте двухбуквенные коды (ISO 639-1): pt, it, tr, ko и т.д.'
  },
  
  error4: {
    name: 'Забыли обновить селектор',
    wrong: 'Добавили язык в i18n.js, но не в HTML',
    correct: 'Добавьте <option> в оба места',
    fix: 'Всегда обновляйте i18n.js И index.html одновременно'
  },
  
  error5: {
    name: 'Неправильное кодирование символов',
    wrong: 'Использование неправильной кодировки при копировании',
    correct: 'UTF-8 кодировка без BOM',
    fix: 'Убедитесь, что файлы сохраняются в UTF-8'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ТЕСТИРОВАНИЕ НОВОГО ЯЗЫКА
// ═══════════════════════════════════════════════════════════════════════════

function testNewLanguage(langCode) {
  console.log(`\n📋 Тестирование языка: ${langCode}\n`);
  
  // Тест 1: Язык в списке
  console.log('✅ Тест 1: Проверка наличия языка');
  console.log('Результат:', i18n.supportedLanguages.includes(langCode));
  
  // Тест 2: Установка языка
  console.log('\n✅ Тест 2: Установка языка');
  const result = i18n.setLanguage(langCode);
  console.log('Результат:', result);
  
  // Тест 3: Получение переводов
  console.log('\n✅ Тест 3: Получение переводов');
  const testKeys = ['nav_home', 'nav_about', 'hero_cta', 'contact_title'];
  testKeys.forEach(key => {
    console.log(`  ${key}: "${i18n.t(key)}"`);
  });
  
  // Тест 4: Сохранение в localStorage
  console.log('\n✅ Тест 4: Сохранение в localStorage');
  console.log('Сохраненный язык:', localStorage.getItem('selectedLanguage'));
  
  // Тест 5: Обновление селектора
  console.log('\n✅ Тест 5: Значение селектора');
  const select = document.getElementById('languageSelect');
  console.log('Значение селектора:', select ? select.value : 'Селектор не найден');
}

// Использование:
// testNewLanguage('pt')  // Тестировать португальский

// ═══════════════════════════════════════════════════════════════════════════
// БЫСТРЫЙ ШАБЛОН ДЛЯ КОПИРОВАНИЯ
// ═══════════════════════════════════════════════════════════════════════════

const quickTemplate = `
// Быстрый шаблон для вставки в i18n.js
// Замените XX на двухбуквенный код языка (pt, it, tr, ko и т.д.)
// Замените все значения на корректные переводы

xx: {
  nav_home: '',
  nav_about: '',
  nav_portfolio: '',
  nav_contact: '',
  hero_subtitle: '',
  hero_cta: '',
  portfolio_title: '',
  portfolio_desc: '',
  cat_all: '',
  cat_motion: '',
  cat_commercial: '',
  about_title: '',
  about_achievements: '',
  about_achievement1: '',
  about_achievement2: '',
  about_achievement3: '',
  about_achievement4: '',
  about_experience: '',
  about_exp1: '',
  about_exp2: '',
  about_exp3: '',
  about_exp4: '',
  about_text: '',
  contact_title: '',
  contact_desc: '',
  contact_phone: '',
  footer_rights: ''
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// ПОЛЕЗНЫЕ ССЫЛКИ И РЕСУРСЫ
// ═══════════════════════════════════════════════════════════════════════════

const resources = {
  languageCodes: 'https://en.wikipedia.org/wiki/ISO_639-1',
  translationServices: [
    'Google Translate API',
    'DeepL API',
    'Microsoft Translator',
    'AWS Translate'
  ],
  tutorialWebsites: [
    'MDN Web Docs - Localization',
    'i18n-js documentation',
    'Mozilla Learning Resources'
  ]
};

console.log(`
═══════════════════════════════════════════════════════════════════════════
  ГАЙД ПО ДОБАВЛЕНИЮ НОВЫХ ЯЗЫКОВ - УСПЕШНО ЗАГРУЖЕН ✅
═══════════════════════════════════════════════════════════════════════════

Для добавления нового языка:
1. Скопируйте шаблон (quickTemplate выше)
2. Замените переводы на нужный язык
3. Добавьте в i18n.js (в объект translations)
4. Добавьте опцию в index.html (в <select>)
5. Протестируйте в браузере

Нужна помощь? Используйте примеры выше (exampleLanguages)
Быстрый старт? Используйте testNewLanguage('xx') в консоли браузера

═══════════════════════════════════════════════════════════════════════════
`);
