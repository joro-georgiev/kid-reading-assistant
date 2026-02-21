package com.readassistant.repository;

import com.readassistant.model.ReadingSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadingSessionRepository extends JpaRepository<ReadingSession, Long> {
}
