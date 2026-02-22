// Web Speech API wrapper

class SpeechRecognizer {
    constructor(language = 'en-US') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.supported = false;
            return;
        }

        this.supported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = language;

        this.listening = false;
        this.onWord = null;       // callback(word) — called for each recognized word
        this.onStateChange = null; // callback(listening)
        this.allWords = [];

        this._setupEvents();
    }

    _setupEvents() {
        let lastProcessedIndex = 0;

        this.recognition.onresult = (event) => {
            const words = [];

            // Gather all final + interim results into a flat word list
            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) {
                    transcript.split(/\s+/).forEach(w => words.push(w));
                }
            }

            // Emit only new words since last time
            for (let i = lastProcessedIndex; i < words.length; i++) {
                const word = words[i];
                this.allWords.push(word);
                if (this.onWord) {
                    this.onWord(word);
                }
            }
            lastProcessedIndex = words.length;
        };

        this.recognition.onend = () => {
            if (this.listening) {
                this.listening = false;
                if (this.onStateChange) this.onStateChange(false);
            }
        };

        this.recognition.onerror = (event) => {
            // 'no-speech' and 'aborted' are expected during pauses
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn('Speech recognition error:', event.error);
            }
        };
    }

    start() {
        if (!this.supported) return;
        this.listening = true;
        try {
            this.recognition.start();
        } catch (e) {
            // Already started
        }
        if (this.onStateChange) this.onStateChange(true);
    }

    stop() {
        if (!this.supported) return;
        this.listening = false;
        try {
            this.recognition.stop();
        } catch (e) {
            // Already stopped
        }
        if (this.onStateChange) this.onStateChange(false);
    }

    getSpokenWords() {
        return [...this.allWords];
    }
}
