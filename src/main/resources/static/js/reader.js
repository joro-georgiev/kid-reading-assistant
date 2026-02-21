// Reading page controller

(function () {
    const MAX_LOOK_AHEAD = 3;

    let story = null;
    let wordElements = [];
    let currentExpectedIndex = 0;
    let recognizer = null;

    // DOM elements
    const storyTitle = document.getElementById('story-title');
    const wordDisplay = document.getElementById('word-display');
    const micBtn = document.getElementById('mic-btn');
    const micLabel = document.getElementById('mic-label');
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

    // Handle a spoken word — real-time frontend matching
    function handleSpokenWord(spokenWord) {
        if (currentExpectedIndex >= story.words.length) return;

        const spokenNorm = normalize(spokenWord);
        if (!spokenNorm) return;

        // Look ahead up to MAX_LOOK_AHEAD words to find a match
        for (let ahead = 0; ahead <= MAX_LOOK_AHEAD && currentExpectedIndex + ahead < story.words.length; ahead++) {
            const expectedNorm = normalize(story.words[currentExpectedIndex + ahead]);
            if (isCloseEnough(expectedNorm, spokenNorm)) {
                // Mark skipped words as missed
                for (let skip = 0; skip < ahead; skip++) {
                    wordElements[currentExpectedIndex + skip].classList.remove('current');
                    wordElements[currentExpectedIndex + skip].classList.add('missed');
                }
                // Mark matched word as correct
                wordElements[currentExpectedIndex + ahead].classList.remove('current');
                wordElements[currentExpectedIndex + ahead].classList.add('correct');
                currentExpectedIndex = currentExpectedIndex + ahead + 1;
                highlightCurrent();

                // Update status
                const remaining = story.words.length - currentExpectedIndex;
                if (remaining > 0) {
                    statusBar.textContent = `${remaining} words to go!`;
                } else {
                    statusBar.textContent = 'You read all the words!';
                }
                return;
            }
        }
    }

    // Finish reading and get backend evaluation
    async function finishReading() {
        recognizer.stop();
        micBtn.classList.remove('listening');
        micLabel.textContent = 'Tap to start reading!';
        doneBtn.style.display = 'none';
        statusBar.textContent = 'Checking your reading...';

        try {
            const feedback = await API.evaluateReading(story.id, recognizer.getSpokenWords());

            // Update word highlights from backend results
            feedback.wordResults.forEach((result, i) => {
                if (i < wordElements.length) {
                    wordElements[i].className = 'word ' + (result.correct ? 'correct' : 'missed');
                }
            });

            resultScore.textContent = Math.round(feedback.score) + '%';
            resultMessage.textContent = feedback.message;
            resultStats.textContent = `${feedback.correctWords} out of ${feedback.totalWords} words`;

            readingArea.style.display = 'none';
            resultsPanel.style.display = 'block';
        } catch (err) {
            statusBar.textContent = 'Could not get results. Please try again.';
            doneBtn.style.display = 'block';
        }
    }

    // Initialize
    async function init() {
        const params = new URLSearchParams(window.location.search);
        const storyId = params.get('id');
        if (!storyId) {
            window.location.href = '/';
            return;
        }

        // Load story
        try {
            story = await API.getStory(storyId);
            storyTitle.textContent = story.title;
            renderWords(story.words);
            statusBar.textContent = `${story.words.length} words - you can do it!`;
        } catch (err) {
            storyTitle.textContent = 'Story not found';
            wordDisplay.textContent = 'Could not load the story. Go back and try another one!';
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
                micLabel.textContent = 'Listening... read aloud!';
                doneBtn.style.display = 'block';
            } else {
                micBtn.classList.remove('listening');
                micLabel.textContent = 'Tap to start reading!';
            }
        };

        // Mic button toggle
        micBtn.addEventListener('click', () => {
            if (recognizer.listening) {
                recognizer.stop();
            } else {
                currentExpectedIndex = 0;
                wordElements.forEach(el => el.className = 'word');
                highlightCurrent();
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
            wordElements.forEach(el => el.className = 'word');
            highlightCurrent();
            statusBar.textContent = `${story.words.length} words - you can do it!`;
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
