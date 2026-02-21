package com.readassistant.repository;

import com.readassistant.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByDifficultyAscTitleAsc();
}
