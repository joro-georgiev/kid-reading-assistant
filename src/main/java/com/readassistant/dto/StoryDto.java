package com.readassistant.dto;

import java.util.List;

public class StoryDto {

    private Long id;
    private String title;
    private String content;
    private int difficulty;
    private String language;
    private String image;
    private List<String> words;

    public StoryDto() {
    }

    public StoryDto(Long id, String title, String content, int difficulty, String language, String image, List<String> words) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.difficulty = difficulty;
        this.language = language;
        this.image = image;
        this.words = words;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(int difficulty) {
        this.difficulty = difficulty;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getWords() {
        return words;
    }

    public void setWords(List<String> words) {
        this.words = words;
    }
}
