package com.readassistant.dto;

import java.util.List;

public class ReadingFeedback {

    private int totalWords;
    private int correctWords;
    private double score;
    private String message;
    private List<WordResult> wordResults;

    public ReadingFeedback() {
    }

    public ReadingFeedback(int totalWords, int correctWords, double score,
                           String message, List<WordResult> wordResults) {
        this.totalWords = totalWords;
        this.correctWords = correctWords;
        this.score = score;
        this.message = message;
        this.wordResults = wordResults;
    }

    public int getTotalWords() {
        return totalWords;
    }

    public void setTotalWords(int totalWords) {
        this.totalWords = totalWords;
    }

    public int getCorrectWords() {
        return correctWords;
    }

    public void setCorrectWords(int correctWords) {
        this.correctWords = correctWords;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<WordResult> getWordResults() {
        return wordResults;
    }

    public void setWordResults(List<WordResult> wordResults) {
        this.wordResults = wordResults;
    }

    public static class WordResult {
        private String expected;
        private boolean correct;

        public WordResult() {
        }

        public WordResult(String expected, boolean correct) {
            this.expected = expected;
            this.correct = correct;
        }

        public String getExpected() {
            return expected;
        }

        public void setExpected(String expected) {
            this.expected = expected;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }
    }
}
