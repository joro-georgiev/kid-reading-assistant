package com.readassistant.controller;

import com.readassistant.dto.ReadingFeedback;
import com.readassistant.dto.ReadingSubmission;
import com.readassistant.dto.StoryDto;
import com.readassistant.model.ReadingSession;
import com.readassistant.repository.ReadingSessionRepository;
import com.readassistant.service.StoryService;
import com.readassistant.service.WordComparisonService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reading")
public class ReadingController {

    private final StoryService storyService;
    private final WordComparisonService wordComparisonService;
    private final ReadingSessionRepository readingSessionRepository;

    public ReadingController(StoryService storyService,
                             WordComparisonService wordComparisonService,
                             ReadingSessionRepository readingSessionRepository) {
        this.storyService = storyService;
        this.wordComparisonService = wordComparisonService;
        this.readingSessionRepository = readingSessionRepository;
    }

    @PostMapping("/evaluate")
    public ReadingFeedback evaluate(@RequestBody ReadingSubmission submission) {
        StoryDto story = storyService.getStory(submission.getStoryId());
        ReadingFeedback feedback = wordComparisonService.evaluate(
                story.getWords(), submission.getSpokenWords(), story.getLanguage()
        );

        readingSessionRepository.save(new ReadingSession(
                submission.getStoryId(),
                feedback.getTotalWords(),
                feedback.getCorrectWords(),
                feedback.getScore()
        ));

        return feedback;
    }
}
