package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.entity.Chore;
import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.ChoreRepository;
import com.example.mzp.fairshare1.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FairnessService {

    @Autowired
    private ChoreRepository choreRepository;

    @Autowired
    private GroupRepository groupRepository;

    /**
     * Calculate fairness scores for all members in a group
     * Formula: 100 + (completed * 10) - (pending * 20)
     * Higher score = more fair to assign to (they've done more work and/or have
     * fewer pending tasks)
     */
    public Map<Long, FairnessScore> calculateFairnessScores(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Chore> groupChores = choreRepository.findByGroupId(groupId);
        Map<Long, FairnessScore> scores = new HashMap<>();

        // Initialize scores for all members
        for (User member : group.getMembers()) {
            scores.put(member.getId(), new FairnessScore(member.getId(), member.getFullName(), 0, 0, 100));
        }

        // Count pending and completed chores for each member
        for (Chore chore : groupChores) {
            if (chore.getAssignedTo() != null) {
                Long userId = chore.getAssignedTo().getId();
                FairnessScore score = scores.get(userId);
                if (score != null) {
                    if ("completed".equalsIgnoreCase(chore.getStatus())) {
                        score.incrementCompleted();
                    } else {
                        score.incrementPending();
                    }
                }
            }
        }

        // Calculate final scores
        for (FairnessScore score : scores.values()) {
            score.calculateScore();
        }

        return scores;
    }

    /**
     * Select the member who should be assigned the next task based on fairness
     * Returns the user ID of the member with the highest fairness score
     */
    public Long selectFairestMember(Long groupId) {
        Map<Long, FairnessScore> scores = calculateFairnessScores(groupId);

        if (scores.isEmpty()) {
            return null;
        }

        // Find member with highest score
        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue((s1, s2) -> Integer.compare(s1.getScore(), s2.getScore())))
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /**
     * Inner class to hold fairness score data
     */
    public static class FairnessScore {
        private Long userId;
        private String fullName;
        private int pending;
        private int completed;
        private int score;

        public FairnessScore(Long userId, String fullName, int pending, int completed, int score) {
            this.userId = userId;
            this.fullName = fullName;
            this.pending = pending;
            this.completed = completed;
            this.score = score;
        }

        public void incrementPending() {
            this.pending++;
        }

        public void incrementCompleted() {
            this.completed++;
        }

        public void calculateScore() {
            this.score = 100 + (completed * 10) - (pending * 20);
        }

        // Getters
        public Long getUserId() {
            return userId;
        }

        public String getFullName() {
            return fullName;
        }

        public int getPending() {
            return pending;
        }

        public int getCompleted() {
            return completed;
        }

        public int getScore() {
            return score;
        }
    }
}
