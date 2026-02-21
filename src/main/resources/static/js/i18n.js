// Internationalization module — EN/BG language toggle

const TRANSLATIONS = {
    en: {
        'title.home': 'Reading Assistant - Pick a Story!',
        'title.read': 'Reading Assistant - Read Aloud!',
        'header.appName': 'Reading Assistant',
        'home.pickStory': 'Pick a Story to Read!',
        'home.loading': 'Loading stories...',
        'home.loadError': 'Could not load stories. Is the server running?',
        'difficulty.1': 'Easy',
        'difficulty.2': 'Medium',
        'difficulty.3': 'Challenge',
        'read.tapToStart': 'Tap to start reading!',
        'read.listening': 'Listening... read aloud!',
        'read.doneBtn': "I'm Done!",
        'read.greatReading': 'Great Reading!',
        'read.tryAgain': 'Try Again',
        'read.pickAnother': 'Pick Another Story',
        'read.wordsToGo': '{remaining} words to go!',
        'read.wordCount': '{count} words - you can do it!',
        'read.allWordsRead': 'You read all the words!',
        'read.checking': 'Checking your reading...',
        'read.stats': '{correct} out of {total} words',
        'read.resultError': 'Could not get results. Please try again.',
        'read.storyNotFound': 'Story not found',
        'read.storyLoadError': 'Could not load the story. Go back and try another one!',
        'read.storyLoading': 'Loading...',
        'read.micTitle': 'Start reading',
        'read.speechWarning': 'Your browser does not support speech recognition. Please use Google Chrome for the best experience.'
    },
    bg: {
        'title.home': 'Помощник за четене - Избери история!',
        'title.read': 'Помощник за четене - Чети на глас!',
        'header.appName': 'Помощник за четене',
        'home.pickStory': 'Избери история за четене!',
        'home.loading': 'Зареждане на истории...',
        'home.loadError': 'Не могат да се заредят историите. Сървърът работи ли?',
        'difficulty.1': 'Лесно',
        'difficulty.2': 'Средно',
        'difficulty.3': 'Предизвикателство',
        'read.tapToStart': 'Натисни, за да започнеш!',
        'read.listening': 'Слуша... чети на глас!',
        'read.doneBtn': 'Готово!',
        'read.greatReading': 'Страхотно четене!',
        'read.tryAgain': 'Опитай отново',
        'read.pickAnother': 'Избери друга история',
        'read.wordsToGo': 'Остават {remaining} думи!',
        'read.wordCount': '{count} думи - ти можеш!',
        'read.allWordsRead': 'Прочете всички думи!',
        'read.checking': 'Проверка на четенето...',
        'read.stats': '{correct} от {total} думи',
        'read.resultError': 'Неуспешно получаване на резултати. Опитай отново.',
        'read.storyNotFound': 'Историята не е намерена',
        'read.storyLoadError': 'Историята не може да се зареди. Върни се и опитай друга!',
        'read.storyLoading': 'Зареждане...',
        'read.micTitle': 'Започни четене',
        'read.speechWarning': 'Твоят браузър не поддържа разпознаване на реч. Моля, използвай Google Chrome.'
    }
};

function getLang() {
    return localStorage.getItem('readassistant-lang') || 'en';
}

function setLang(lang) {
    localStorage.setItem('readassistant-lang', lang);
}

function t(key, replacements) {
    const lang = getLang();
    let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(function (placeholder) {
            text = text.replace('{' + placeholder + '}', replacements[placeholder]);
        });
    }
    return text;
}

function initLangToggle() {
    var header = document.querySelector('.header');
    if (!header) return;

    var toggle = document.createElement('div');
    toggle.className = 'lang-toggle';

    var currentLang = getLang();
    ['en', 'bg'].forEach(function (lang) {
        var btn = document.createElement('button');
        btn.className = 'lang-toggle-btn' + (lang === currentLang ? ' active' : '');
        btn.textContent = lang.toUpperCase();
        btn.addEventListener('click', function () {
            if (getLang() !== lang) {
                setLang(lang);
                location.reload();
            }
        });
        toggle.appendChild(btn);
    });

    header.appendChild(toggle);
}

function localizeStaticElements() {
    // Localize elements with data-i18n attribute (text content)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = t(el.getAttribute('data-i18n'));
    });

    // Localize elements with data-i18n-title attribute (title attribute)
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
        el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });

    // Localize document title
    var htmlEl = document.documentElement;
    if (htmlEl.hasAttribute('data-i18n-title')) {
        document.title = t(htmlEl.getAttribute('data-i18n-title'));
    }

    // Set html lang attribute
    document.documentElement.lang = getLang();
}

document.addEventListener('DOMContentLoaded', function () {
    initLangToggle();
    localizeStaticElements();
});
