// Reading page controller

(function () {
    let story = null;
    let wordElements = [];
    let currentExpectedIndex = 0;
    let recognizer = null;
    let sessionPoints = 0;
    let audioCtx = null;

    function ensureAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    let activeOsc = null;
    let activeGain = null;

    function playPointSound() {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // Stop previous sound immediately
        if (activeOsc) {
            try { activeOsc.stop(); } catch (e) {}
            activeOsc = null;
        }

        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        activeOsc = osc;
        osc.onended = function () { activeOsc = null; };
    }

    function playCompleteSound() {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (activeOsc) {
            try { activeOsc.stop(); } catch (e) {}
            activeOsc = null;
        }

        var now = audioCtx.currentTime;
        var notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            var start = now + i * 0.12;
            gain.gain.setValueAtTime(0.5, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    // DOM elements
    const storyTitle = document.getElementById('story-title');
    const wordDisplay = document.getElementById('word-display');
    const micBtn = document.getElementById('mic-btn');

    const statusBar = document.getElementById('status-bar');
    const doneBtn = document.getElementById('done-btn');
    const readingArea = document.getElementById('reading-area');
    const resultsPanel = document.getElementById('results-panel');
    const resultScore = document.getElementById('result-score');
    const resultMessage = document.getElementById('result-message');
    const resultStats = document.getElementById('result-stats');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const speechWarning = document.getElementById('speech-warning');

    // Normalize a word for comparison (strip punctuation, lowercase)
    function normalize(word) {
        return word.replace(/[^\p{L}']/gu, '').toLowerCase();
    }

    // Levenshtein distance
    function levenshtein(a, b) {
        if (Math.abs(a.length - b.length) > 1) return Math.abs(a.length - b.length);
        const m = a.length, n = b.length;
        const prev = Array.from({ length: n + 1 }, (_, j) => j);
        const curr = new Array(n + 1);
        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
            }
            for (let j = 0; j <= n; j++) prev[j] = curr[j];
        }
        return prev[n];
    }

    function isCloseEnough(a, b) {
        return levenshtein(a, b) <= 1;
    }

    // Render story words
    function renderWords(words) {
        wordDisplay.innerHTML = '';
        wordElements = [];
        words.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            span.dataset.index = i;
            wordDisplay.appendChild(span);
            wordDisplay.appendChild(document.createTextNode(' '));
            wordElements.push(span);
        });
        highlightCurrent();
    }

    function highlightCurrent() {
        wordElements.forEach((el, i) => {
            if (i === currentExpectedIndex && !el.classList.contains('correct') && !el.classList.contains('missed')) {
                el.classList.add('current');
            } else {
                el.classList.remove('current');
            }
        });
    }

    // Handle a spoken word — wait on each word until it is read correctly
    function handleSpokenWord(spokenWord) {
        if (currentExpectedIndex >= story.words.length) return;

		console.log( spokenWord );
		
        const spokenNorm = normalize(spokenWord);
        if (!spokenNorm) return;

        const expectedNorm = normalize(story.words[currentExpectedIndex]);
        if (isCloseEnough(expectedNorm, spokenNorm)) {
            wordElements[currentExpectedIndex].classList.remove('current');
            wordElements[currentExpectedIndex].classList.add('correct');
            currentExpectedIndex++;
            sessionPoints++;
            updatePointsDisplay(addPoints(1));
            playPointSound();
            highlightCurrent();

            // Update status
            const remaining = story.words.length - currentExpectedIndex;
            if (remaining > 0) {
                statusBar.textContent = t('read.wordsToGo', { remaining: remaining });
            } else {
                statusBar.textContent = t('read.allWordsRead');
                playCompleteSound();
            }
        }
    }

    // Evaluate reading locally (port of backend WordComparisonService)
    function evaluateReading(expectedWords, spokenWords, language) {
        const MAX_LOOK_AHEAD = 3;
        const wordResults = [];
        let spokenIndex = 0;

        for (const expected of expectedWords) {
            const cleanExpected = normalize(expected);
            let matched = false;

            for (let ahead = 0; ahead <= MAX_LOOK_AHEAD && spokenIndex + ahead < spokenWords.length; ahead++) {
                const spoken = normalize(spokenWords[spokenIndex + ahead]);
                if (isCloseEnough(cleanExpected, spoken)) {
                    matched = true;
                    spokenIndex = spokenIndex + ahead + 1;
                    break;
                }
            }

            wordResults.push({ word: expected, correct: matched });
        }

        const totalWords = expectedWords.length;
        const correctWords = wordResults.filter(r => r.correct).length;
        const score = totalWords > 0 ? Math.round(correctWords / totalWords * 100) : 0;
        const message = generateMessage(score, language);

        return { totalWords, correctWords, score, message, wordResults };
    }

    function generateMessage(score, language) {
        if (language === 'bg') {
            if (score >= 90) return 'Страхотна работа! Ти си супер четец!';
            if (score >= 70) return 'Браво! Прочете толкова много думи правилно!';
            if (score >= 50) return 'Добър опит! Все по-добре ти се получава!';
            return 'Хубаво усилие! Продължавай да упражняваш и ще станеш страхотен четец!';
        }
        if (score >= 90) return 'Amazing job! You are a superstar reader!';
        if (score >= 70) return 'Great work! You read so many words correctly!';
        if (score >= 50) return 'Good try! You are getting better every time!';
        return 'Nice effort! Keep practicing and you will be a great reader!';
    }

    // Finish reading and evaluate locally
    function finishReading() {
        recognizer.stop();
        micBtn.classList.remove('listening');
        doneBtn.style.display = 'none';

        const feedback = evaluateReading(story.words, recognizer.getSpokenWords(), story.language);

        // Update word highlights from results
        feedback.wordResults.forEach((result, i) => {
            if (i < wordElements.length) {
                wordElements[i].className = 'word ' + (result.correct ? 'correct' : 'missed');
            }
        });

        resultScore.textContent = Math.round(feedback.score) + '%';
        resultMessage.textContent = feedback.message;
        resultStats.textContent = t('read.stats', { correct: feedback.correctWords, total: feedback.totalWords })
            + ' \u2014 ' + t('points.earned', { points: sessionPoints });

        readingArea.style.display = 'none';
        resultsPanel.style.display = 'block';
    }

    // Initialize
    async function init() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang') || getLang();
        const storyId = params.get('id');
        if (!storyId) {
            window.location.href = 'index.html';
            return;
        }

        // Load story
        try {
            story = await API.getStory(lang, storyId);
            storyTitle.textContent = story.title;
            if (story.image) {
                var storyImage = document.getElementById('story-image');
                storyImage.src = story.image;
                storyImage.alt = story.title;
                storyImage.style.display = '';
            }
            renderWords(story.words);
            statusBar.textContent = t('read.wordCount', { count: story.words.length });
        } catch (err) {
            storyTitle.textContent = t('read.storyNotFound');
            wordDisplay.textContent = t('read.storyLoadError');
            return;
        }

        // Init speech recognition with story language
        const speechLang = story.language === 'bg' ? 'bg-BG' : 'en-US';
        recognizer = new SpeechRecognizer(speechLang);
        if (!recognizer.supported) {
            speechWarning.style.display = 'block';
        }

        // Wire up speech callbacks
        recognizer.onWord = handleSpokenWord;
        recognizer.onStateChange = (listening) => {
            if (listening) {
                micBtn.classList.add('listening');
                doneBtn.style.display = 'block';
            } else {
                micBtn.classList.remove('listening');
            }
        };

        // Mic button toggle
        micBtn.addEventListener('click', () => {
            ensureAudioCtx();
            if (recognizer.listening) {
                recognizer.stop();
            } else {
                recognizer.start();
            }
        });

        // Done button
        doneBtn.addEventListener('click', finishReading);

        // Try again button
        tryAgainBtn.addEventListener('click', () => {
            resultsPanel.style.display = 'none';
            readingArea.style.display = 'block';
            currentExpectedIndex = 0;
            sessionPoints = 0;
            wordElements.forEach(el => el.className = 'word');
            highlightCurrent();
            statusBar.textContent = t('read.wordCount', { count: story.words.length });
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
