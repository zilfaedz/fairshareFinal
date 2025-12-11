package com.example.mzp.fairshare1.services;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class FairnessServiceTest {

    @Test
    public void testScoreCalculation() {
        FairnessService.FairnessScore score = new FairnessService.FairnessScore(1L, "Test User", 0, 0, 100);

        // Initial state
        score.calculateScore();
        assertEquals(100, score.getScore(), "Initial score should be 100");

        // Case 1: Increased score should be capped at 100
        score.incrementCompleted(); // +10 points -> should be 110 theoretically
        score.calculateScore();
        assertEquals(100, score.getScore(), "Score should be capped at 100 even with completed tasks");

        // Case 2: Decrease score
        score.incrementPending(); // -20 points -> 110 - 20 = 90
        score.calculateScore();
        assertEquals(90, score.getScore(), "Score should decrease correctly");

        // Case 3: More pending
        score.incrementPending(); // -20 points -> 90 - 20 = 70
        score.calculateScore();
        assertEquals(70, score.getScore(), "Score should continue to decrease");
    }
}
