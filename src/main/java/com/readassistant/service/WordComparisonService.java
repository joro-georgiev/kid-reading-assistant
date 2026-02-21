package com.readassistant.service;

import com.readassistant.dto.ReadingFeedback;
import com.readassistant.dto.ReadingFeedback.WordResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WordComparisonService {

    private static final int MAX_LOOK_AHEAD = 3;

    public ReadingFeedback evaluate(List<String> expectedWords, List<String> spokenWords, String language) {
        List<WordResult> results = new ArrayList<>();
        int spokenIndex = 0;

        for (String expected : expectedWords) {
            String cleanExpected = normalize(expected);
            boolean matched = false;

            // Try to match current spoken word, or look ahead up to MAX_LOOK_AHEAD
            for (int ahead = 0; ahead <= MAX_LOOK_AHEAD && spokenIndex + ahead < spokenWords.size(); ahead++) {
                String spoken = normalize(spokenWords.get(spokenIndex + ahead));
                if (isCloseEnough(cleanExpected, spoken)) {
                    matched = true;
                    spokenIndex = spokenIndex + ahead + 1;
                    break;
                }
            }

            results.add(new WordResult(expected, matched));
        }

        int totalWords = expectedWords.size();
        int correctWords = (int) results.stream().filter(WordResult::isCorrect).count();
        double score = totalWords > 0 ? Math.round((double) correctWords / totalWords * 100.0) : 0;
        String message = generateMessage(score, language);

        return new ReadingFeedback(totalWords, correctWords, score, message, results);
    }

    /**
     * Two words match if their Levenshtein distance is <= 1.
     */
    public boolean isCloseEnough(String a, String b) {
        return levenshteinDistance(a, b) <= 1;
    }

    /**
     * Standard Levenshtein distance.
     */
    public int levenshteinDistance(String a, String b) {
        int lenA = a.length();
        int lenB = b.length();

        // Quick exit for large length differences
        if (Math.abs(lenA - lenB) > 1) {
            return Math.abs(lenA - lenB);
        }

        int[] prev = new int[lenB + 1];
        int[] curr = new int[lenB + 1];

        for (int j = 0; j <= lenB; j++) {
            prev[j] = j;
        }

        for (int i = 1; i <= lenA; i++) {
            curr[0] = i;
            for (int j = 1; j <= lenB; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(
                        Math.min(curr[j - 1] + 1, prev[j] + 1),
                        prev[j - 1] + cost
                );
            }
            int[] temp = prev;
            prev = curr;
            curr = temp;
        }

        return prev[lenB];
    }

    /**
     * Strip punctuation and lowercase for comparison.
     */
    public String normalize(String word) {
        return word.replaceAll("[^\\p{L}']", "").toLowerCase();
    }

    private String generateMessage(double score, String language) {
        if ("bg".equals(language)) {
            if (score >= 90) {
                return "Страхотна работа! Ти си супер четец!";
            } else if (score >= 70) {
                return "Браво! Прочете толкова много думи правилно!";
            } else if (score >= 50) {
                return "Добър опит! Все по-добре ти се получава!";
            } else {
                return "Хубаво усилие! Продължавай да упражняваш и ще станеш страхотен четец!";
            }
        }
        if (score >= 90) {
            return "Amazing job! You are a superstar reader!";
        } else if (score >= 70) {
            return "Great work! You read so many words correctly!";
        } else if (score >= 50) {
            return "Good try! You are getting better every time!";
        } else {
            return "Nice effort! Keep practicing and you will be a great reader!";
        }
    }
}
