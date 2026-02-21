package com.readassistant.controller;

import com.readassistant.dto.StoryDto;
import com.readassistant.service.StoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping
    public List<StoryDto> getAllStories() {
        return storyService.getAllStories();
    }

    @GetMapping("/{id}")
    public StoryDto getStory( @PathVariable Long id ) {
        return storyService.getStory(id);
    }
}
