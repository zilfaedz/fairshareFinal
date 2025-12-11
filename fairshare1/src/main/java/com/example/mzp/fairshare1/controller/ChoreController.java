package com.example.mzp.fairshare1.controller;

import com.example.mzp.fairshare1.entity.Chore;
import com.example.mzp.fairshare1.services.ChoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chores")
@CrossOrigin("*")
public class ChoreController {

    @Autowired
    private ChoreService choreService;

    @Autowired
    private com.example.mzp.fairshare1.services.NotificationService notificationService;

    @Autowired
    private com.example.mzp.fairshare1.repositories.UserRepository userRepository;

    @Autowired
    private com.example.mzp.fairshare1.services.FairnessService fairnessService;

    @PostMapping("/group/{groupId}")
    public Chore createChore(@PathVariable Long groupId, @RequestBody Map<String, Object> payload) {
        Chore chore = new Chore();
        chore.setTitle((String) payload.get("title"));
        chore.setDescription((String) payload.get("description"));
        chore.setDueDate((String) payload.get("dueDate"));
        chore.setStatus((String) payload.get("status"));


        Object assignedToIdObj = payload.get("assignedToId");
        Long assignedToId = null;
        if (assignedToIdObj != null && !assignedToIdObj.toString().isEmpty()) {
            try {
                assignedToId = Long.valueOf(assignedToIdObj.toString());
            } catch (NumberFormatException e) {
            }
        }

        boolean useFairAssignment = Boolean.TRUE.equals(payload.get("useFairAssignment"));

        Object creatorIdObj = payload.get("creatorId");

        Chore createdChore = choreService.createChore(chore, groupId, assignedToId, useFairAssignment);

        if (creatorIdObj != null) {
            Long creatorId = Long.valueOf(creatorIdObj.toString());
            userRepository.findById(creatorId).ifPresent(creator -> {
                notificationService.sendChoreNotification(createdChore, creator);
            });
        }

        return createdChore;
    }

    @GetMapping("/group/{groupId}")
    public List<Chore> getGroupChores(@PathVariable Long groupId) {
        return choreService.getGroupChores(groupId);
    }

    @PutMapping("/{id}")
    public Chore updateChore(@PathVariable Long id, @RequestBody Chore chore) {
        return choreService.updateChore(id, chore);
    }

    @DeleteMapping("/{id}")
    public void deleteChore(@PathVariable Long id) {
        choreService.deleteChore(id);
    }

    @GetMapping("/group/{groupId}/fairness-scores")
    public Map<Long, com.example.mzp.fairshare1.services.FairnessService.FairnessScore> getFairnessScores(
            @PathVariable Long groupId) {
        return fairnessService.calculateFairnessScores(groupId);
    }

}
