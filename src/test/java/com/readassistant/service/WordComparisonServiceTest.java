package com.readassistant.service;

import com.readassistant.dto.ReadingFeedback;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WordComparisonServiceTest {

    private WordComparisonService service;

    @BeforeEach
    void setUp() {
        service = new WordComparisonService();
    }

    // --- Levenshtein distance ---

    @Test
    void identicalWords_distanceZero() {
        assertEquals(0, service.levenshteinDistance("cat", "cat"));
    }

    @Test
    void oneSubstitution_distanceOne() {
        assertEquals(1, service.levenshteinDistance("cat", "bat"));
    }

    @Test
    void oneInsertion_distanceOne() {
        assertEquals(1, service.levenshteinDistance("cat", "cats"));
    }

    @Test
    void oneDeletion_distanceOne() {
        assertEquals(1, service.levenshteinDistance("cats", "cat"));
    }

    @Test
    void twoEdits_distanceTwo() {
        assertEquals(3, service.levenshteinDistance("cat", "dog"));
    }

    @Test
    void emptyStrings() {
        assertEquals(0, service.levenshteinDistance("", ""));
        assertEquals(3, service.levenshteinDistance("abc", ""));
        assertEquals(3, service.levenshteinDistance("", "abc"));
    }

    // --- isCloseEnough ---

    @Test
    void exactMatch_isCloseEnough() {
        assertTrue(service.isCloseEnough("hello", "hello"));
    }

    @Test
    void oneOff_isCloseEnough() {
        assertTrue(service.isCloseEnough("hello", "helo"));
    }

    @Test
    void twoOff_notCloseEnough() {
        assertFalse(service.isCloseEnough("hello", "hlo"));
    }

    // --- normalize ---

    @Test
    void normalize_stripsPunctuation() {
        assertEquals("hello", service.normalize("hello!"));
        assertEquals("it's", service.normalize("it's"));
        assertEquals("end", service.normalize("end."));
    }

    @Test
    void normalize_lowercases() {
        assertEquals("hello", service.normalize("HELLO"));
    }

    // --- evaluate ---

    @Test
    void perfectReading_allCorrect() {
        List<String> expected = Arrays.asList("I", "have", "a", "cat.");
        List<String> spoken = Arrays.asList("I", "have", "a", "cat");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");

        assertEquals(4, feedback.getTotalWords());
        assertEquals(4, feedback.getCorrectWords());
        assertEquals(100.0, feedback.getScore());
        assertTrue(feedback.getWordResults().stream().allMatch(ReadingFeedback.WordResult::isCorrect));
    }

    @Test
    void skippedWord_matchesWithLookAhead() {
        List<String> expected = Arrays.asList("I", "have", "a", "cat.");
        List<String> spoken = Arrays.asList("I", "a", "cat");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");

        assertTrue(feedback.getWordResults().get(0).isCorrect());   // "I" matched
        assertFalse(feedback.getWordResults().get(1).isCorrect());  // "have" skipped
        assertTrue(feedback.getWordResults().get(2).isCorrect());   // "a" matched
        assertTrue(feedback.getWordResults().get(3).isCorrect());   // "cat" matched
    }

    @Test
    void noSpokenWords_allMissed() {
        List<String> expected = Arrays.asList("I", "have", "a", "cat.");
        List<String> spoken = Collections.emptyList();

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");

        assertEquals(0, feedback.getCorrectWords());
        assertEquals(0.0, feedback.getScore());
        assertTrue(feedback.getWordResults().stream().noneMatch(ReadingFeedback.WordResult::isCorrect));
    }

    @Test
    void closeEnoughPronunciation_countsAsCorrect() {
        List<String> expected = Arrays.asList("The", "little", "bird");
        List<String> spoken = Arrays.asList("the", "litle", "brd");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");

        assertTrue(feedback.getWordResults().get(0).isCorrect());   // "The"/"the" — exact
        assertTrue(feedback.getWordResults().get(1).isCorrect());   // "little"/"litle" — dist 1
        assertTrue(feedback.getWordResults().get(2).isCorrect());    // "bird"/"brd" — dist 1
    }

    @Test
    void encouragingMessage_highScore() {
        List<String> expected = Arrays.asList("I", "see");
        List<String> spoken = Arrays.asList("I", "see");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");
        assertTrue(feedback.getMessage().contains("superstar"));
    }

    @Test
    void encouragingMessage_lowScore() {
        List<String> expected = Arrays.asList("I", "see", "the", "cat");
        List<String> spoken = Collections.emptyList();

        ReadingFeedback feedback = service.evaluate(expected, spoken, "en");
        assertTrue(feedback.getMessage().contains("practicing"));
    }

    // --- Bulgarian support ---

    @Test
    void normalize_preservesCyrillic() {
        assertEquals("котка", service.normalize("Котка!"));
    }

    @Test
    void levenshtein_cyrillicWords() {
        assertEquals(0, service.levenshteinDistance("котка", "котка"));
        assertEquals(1, service.levenshteinDistance("котка", "козка"));
    }

    @Test
    void evaluate_bulgarianWords() {
        List<String> expected = Arrays.asList("Аз", "имам", "котка.");
        List<String> spoken = Arrays.asList("аз", "имам", "котка");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "bg");

        assertEquals(3, feedback.getTotalWords());
        assertEquals(3, feedback.getCorrectWords());
        assertEquals(100.0, feedback.getScore());
    }

    @Test
    void bulgarianFeedbackMessage_highScore() {
        List<String> expected = Arrays.asList("Аз", "имам");
        List<String> spoken = Arrays.asList("аз", "имам");

        ReadingFeedback feedback = service.evaluate(expected, spoken, "bg");
        assertTrue(feedback.getMessage().contains("супер четец"));
    }

    @Test
    void bulgarianFeedbackMessage_lowScore() {
        List<String> expected = Arrays.asList("Аз", "имам", "котка", "тя");
        List<String> spoken = Collections.emptyList();

        ReadingFeedback feedback = service.evaluate(expected, spoken, "bg");
        assertTrue(feedback.getMessage().contains("упражняваш"));
    }
}
