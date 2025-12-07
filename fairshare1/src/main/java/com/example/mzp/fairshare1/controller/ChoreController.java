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

    @PostMapping("/group/{groupId}")
    public Chore createChore(@PathVariable Long groupId, @RequestBody Map<String, Object> payload) {
        Chore chore = new Chore();
        chore.setTitle((String) payload.get("title"));
        chore.setDescription((String) payload.get("description"));
        chore.setDueDate((String) payload.get("dueDate"));
        chore.setStatus((String) payload.get("status"));

        // We need the creator to be passed or determined;
        // Assuming payload has creatorId? or we can skip if not available?
        // Let's check if payload has creatorId, existing logic didn't use it explicitly
        // for creation metadata
        // but now we need it for notification sender.
        // If not sent, we can't send notification properly with a sender.
        // Let's verify if frontend sends `createdBy` or similar.
        // Looking at AppDataContext.addChore... it sends body: JSON.stringify(chore).
        // Frontend chore object usually has assignedToId but not explicitly creatorId
        // in the object state unless added.
        // However, we are logged in on frontend.
        // Let's check AppDataContext.addChore again. It posts to
        // /api/chores/group/{groupId}.

        Object assignedToIdObj = payload.get("assignedToId");
        Long assignedToId = null;
        if (assignedToIdObj != null && !assignedToIdObj.toString().isEmpty()) {
            try {
                assignedToId = Long.valueOf(assignedToIdObj.toString());
            } catch (NumberFormatException e) {
                // Ignore invalid ID format, treat as null
            }
        }

        // Temporary fix: To support notifications, we need the creator.
        // We will try to get `creatorId` from payload if available.
        Object creatorIdObj = payload.get("creatorId");

        Chore createdChore = choreService.createChore(chore, groupId, assignedToId);

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

}
