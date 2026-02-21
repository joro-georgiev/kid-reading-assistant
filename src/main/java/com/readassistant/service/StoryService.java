package com.readassistant.service;

import com.readassistant.dto.StoryDto;
import com.readassistant.model.Story;
import com.readassistant.repository.StoryRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class StoryService {

    private final StoryRepository storyRepository;

    public StoryService(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }

    public List<StoryDto> getAllStories() {
        return storyRepository.findAllByOrderByDifficultyAscTitleAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public StoryDto getStory(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found: " + id));
        return toDto(story);
    }

    private StoryDto toDto(Story story) {
        List<String> words = splitIntoWords(story.getContent());
        return new StoryDto(
                story.getId(),
                story.getTitle(),
                story.getContent(),
                story.getDifficulty(),
                story.getLanguage(),
                words
        );
    }

    private List<String> splitIntoWords(String content) {
        return Arrays.stream(content.split("\\s+"))
                .filter(w -> !w.isBlank())
                .toList();
    }
}
