// Configuration & State
const defaultConfig = {
    hero_title: 'v1nqx',
    hero_subtitle: 'Motion Designer & SpeedRamper',
};

let config = { ...defaultConfig };
let currentCategory = 'all';
let deleteConfirmId = null;

// Initialization
async function init() {
    // SDK Initialization
    if (window.elementSdk) {
        await window.elementSdk.init({
            defaultConfig,
            onConfigChange,
            mapToCapabilities,
            mapToEditPanelValues
        });
        config = window.elementSdk.config || defaultConfig;
    }

    // Language System
    setupLanguageSelector();

    // Initial Translations
    i18n.updateAllTranslations();
    setupEventListeners();

    // Render 
    handleScroll();

    // Portfolio Slider
    setupPortfolioNavButtons();
    renderPortfolio();

    // About Slideshow
    initAboutSlideshow();
}

// Language Selector Setup
function setupLanguageSelector() {
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    const chevron = document.getElementById('langChevron');
    const options = document.querySelectorAll('.lang-option');
    const currentLangText = document.getElementById('currentLangText');

    if (!btn || !menu) return;

    const langNames = {
        en: 'English',
        ru: 'Русский',
        uz: "O'zbek",
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        zh: '中文',
    };
    currentLangText.textContent = langNames[i18n.currentLang] || 'English';

    const toggleMenu = (show) => {
        if (show) {
            menu.classList.remove('opacity-0', 'invisible', 'scale-95');
            chevron.classList.add('rotate-180');
        } else {
            menu.classList.add('opacity-0', 'invisible', 'scale-95');
            chevron.classList.remove('rotate-180');
        }
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('invisible');
        toggleMenu(isHidden);
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.value;

            i18n.setLanguage(lang);

            currentLangText.textContent = option.textContent;

            toggleMenu(false);
        });
    });
    document.addEventListener('click', () => toggleMenu(false));
}

// Utility Functions
function t(key) {
    return i18n.t(key);
}

function showToast(messageKey) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = t(messageKey);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Event Listeners
function setupEventListeners() {
    // Category filter
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderPortfolio();
        });
    });

    // Scroll
    window.addEventListener('scroll', handleScroll);

    // Nav links
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Handle Scroll for Section Visibility
function handleScroll() {
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Update active nav link
    handleActiveSection();
}

// Scroll
window.addEventListener('scroll', handleScroll);

// Nav links
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Element SDK Handler
async function onConfigChange(newConfig) {
    config = { ...defaultConfig, ...newConfig };

    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');

    if (heroTitle) {
        heroTitle.textContent = config.hero_title || defaultConfig.hero_title;
        heroTitle.setAttribute('data-text', config.hero_title || defaultConfig.hero_title);
    }

    if (heroSubtitle) {
        heroSubtitle.textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
    }
}

function mapToCapabilities(cfg) {
    return {
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
    };
}

function mapToEditPanelValues(cfg) {
    return new Map([
        ['hero_title', cfg.hero_title || defaultConfig.hero_title],
        ['hero_subtitle', cfg.hero_subtitle || defaultConfig.hero_subtitle]
    ]);
}

// Active Section Highlighting
const sections = document.querySelectorAll('section');
const navLinks = {
    hero: document.getElementById('nav-home'),
    about: document.getElementById('nav-about'),
    portfolio: document.getElementById('nav-portfolio'),
    contact: document.getElementById('nav-contact'),
};

function setActiveLink(id) {
    Object.values(navLinks).forEach(link => link.classList.remove('active'));
    navLinks[id]?.classList.add('active');
}

function handleActiveSection() {
    let current = '';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 &&
            rect.bottom >= window.innerHeight * 0.4) {
            current = section.id;
        }
    });

    if (current) setActiveLink(current);
}

window.addEventListener('scroll', handleActiveSection);
window.addEventListener('load', handleActiveSection);

// Portfolio Logic (Fixed & Infinite)
function renderPortfolio() {
    const track = document.getElementById('portfolioTrack');
    const container = document.getElementById('portfolioContainer');
    const cards = Array.from(track.querySelectorAll('.card'));

    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const isVisible = (currentCategory === 'all' || cat === currentCategory);
        card.style.display = isVisible ? 'block' : 'none';
    });

    if (container) {
        container.scrollLeft = 0;
    }
    if (window.refreshPortfolioButtons) {
        window.refreshPortfolioButtons();
    }
}

function setupPortfolioNavButtons() {
    const container = document.getElementById('portfolioContainer');
    const track = document.getElementById('portfolioTrack');
    const prevBtn = document.querySelector('.portfolio-prev');
    const nextBtn = document.querySelector('.portfolio-next');

    if (!container || !track || !prevBtn || !nextBtn) return;

    function getStep() {
        const firstCard = track.querySelector('.card');
        if (!firstCard) return Math.round(container.clientWidth * 0.8);
        const cardW = firstCard.getBoundingClientRect().width;
        const gapStr = getComputedStyle(track).gap || getComputedStyle(track).columnGap || '24px';
        const gap = parseInt(gapStr, 10) || 24;
        return Math.round(cardW + gap);
    }

    function isInfinite() {
        const cs = getComputedStyle(track);
        return cs.animationName && cs.animationName !== 'none';
    }

    isInfinite();

    function updateButtons() {
        if (container.scrollWidth <= container.clientWidth + 2) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        } else {
            prevBtn.style.display = '';
            nextBtn.style.display = '';
        }

        if (isInfinite()) {
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            return;
        }

        const maxScroll = container.scrollWidth - container.clientWidth;
        const pos = Math.round(container.scrollLeft);

        prevBtn.disabled = pos <= 2;
        nextBtn.disabled = pos >= (maxScroll - 2);
    }

    updateButtons();

    // smooth scroll by step
    function scrollByStep(direction = 1) {
        const step = getStep();
        container.scrollBy({
            left: step * direction,
            behavior: 'smooth'
        });
    }

    // click handlers
    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));

    // update buttons on scroll / resize / initial
    container.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', () => {
        // small timeout to let layout settle
        setTimeout(updateButtons, 60);
    });

    // keyboard support when container focused
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByStep(-1); }
    });

    // show/hide on load
    setTimeout(updateButtons, 50);
}

// Carousel Logic for About Section
function initAboutSlideshow() {
    const slides = document.querySelectorAll('#about .about-slide');

    if (slides.length <= 1) return;

    let currentSlide = 0;

    function nextSlide() {
        slides.forEach(s => s.classList.remove('active'));

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 5000);
}

// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hide');
        }, 2900);
    }
});

// Start
init();