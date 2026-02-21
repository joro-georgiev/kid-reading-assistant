package com.readassistant.init;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.readassistant.model.Story;
import com.readassistant.repository.StoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StoryRepository storyRepository;
    private final ObjectMapper objectMapper;

    public DataInitializer(StoryRepository storyRepository, ObjectMapper objectMapper) {
        this.storyRepository = storyRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        try (InputStream is = new ClassPathResource("stories.json").getInputStream()) {
            List<Story> stories = objectMapper.readValue(is, new TypeReference<>() {});
            storyRepository.saveAll(stories);
            log.info("Loaded {} stories from stories.json", stories.size());
        }
    }
}
