package com.example.mzp.fairshare1.controller;

import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.UserRepository;
import com.example.mzp.fairshare1.services.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Long userId = Long.valueOf(payload.get("userId").toString());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupService.createGroup(name, user);
        return ResponseEntity.ok(group);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Long userId = Long.valueOf(payload.get("userId").toString());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Group group = groupService.joinGroup(code, user);
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Group> groups = groupService.getUserGroups(user);
        return ResponseEntity.ok(groups);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/removeMember")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        Long requesterId = payload.get("requesterId"); // Current user performing the action

        if (requesterId == null) {
            // Fallback for backward compatibility or assume it's the user themselves if not
            // provided (though safer to require it)
            // For now, let's enforce it or default to userId if we want 'leave' to still
            // work without update but 'kick' needs it.
            // Best to require it.
            return ResponseEntity.badRequest().body("requesterId is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            groupService.removeMember(groupId, user, requesterId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(@PathVariable Long groupId, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        try {
            Group group = groupService.updateGroup(groupId, name);
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{groupId}/budget")
    public ResponseEntity<?> updateMonthlyBudget(@PathVariable Long groupId, @RequestBody Map<String, Object> payload) {
        Object budgetObj = payload.get("budget");
        if (budgetObj == null) {
            return ResponseEntity.badRequest().body("Missing 'budget' in payload");
        }
        Double budget;
        try {
            budget = Double.valueOf(budgetObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid budget value");
        }
        try {
            Group updated = groupService.updateMonthlyBudget(groupId, budget);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/transfer-ownership")
    public ResponseEntity<?> transferOwnership(@PathVariable Long groupId, @RequestBody Map<String, Long> payload) {
        Long newOwnerId = payload.get("newOwnerId");
        Long requesterId = payload.get("requesterId");

        User newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new RuntimeException("New owner not found"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        try {
            Group group = groupService.transferOwnership(groupId, newOwner, requester);
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
