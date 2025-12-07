package com.example.mzp.fairshare1.controller;

import com.example.mzp.fairshare1.entity.Notification;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.UserRepository;
import com.example.mzp.fairshare1.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/invite")
    public ResponseEntity<?> sendInvite(@RequestBody Map<String, Object> payload) {
        try {
            Long groupId = Long.valueOf(payload.get("groupId").toString());
            String email = (String) payload.get("email");
            Long senderId = Long.valueOf(payload.get("senderId").toString());

            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found"));

            notificationService.sendInvite(groupId, email, sender);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<Notification> notifications = notificationService.getUserNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respondToInvite(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        try {
            Boolean accept = payload.get("accept");
            notificationService.respondToInvite(id, accept);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/mark-read/{userId}")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            notificationService.markAllRead(user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
