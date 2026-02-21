package com.readassistant.dto;

import java.util.List;

public class ReadingSubmission {

    private Long storyId;
    private List<String> spokenWords;

    public ReadingSubmission() {
    }

    public Long getStoryId() {
        return storyId;
    }

    public void setStoryId(Long storyId) {
        this.storyId = storyId;
    }

    public List<String> getSpokenWords() {
        return spokenWords;
    }

    public void setSpokenWords(List<String> spokenWords) {
        this.spokenWords = spokenWords;
    }
}
