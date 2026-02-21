package com.readassistant.dto;

import java.util.List;

public record ReadingSubmission( Long storyId, List<String> spokenWords ) {
}
