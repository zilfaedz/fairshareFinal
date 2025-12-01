package com.example.mzp.fairshare1.controller;

import com.example.mzp.fairshare1.models.User;
import com.example.mzp.fairshare1.repositories.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody User loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail());
        if (user == null) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body("This account doesn’t exist. Please Sign Up first.");
        }
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
        }
        return org.springframework.http.ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        System.out.println("Updating user: " + id);
        System.out.println("Received details: " + userDetails);

        if (userDetails.getFullName() != null)
            user.setFullName(userDetails.getFullName());
        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());
        if (userDetails.getProfilePicture() != null)
            user.setProfilePicture(userDetails.getProfilePicture());
        if (userDetails.getBirthdate() != null)
            user.setBirthdate(userDetails.getBirthdate());
        if (userDetails.getGender() != null)
            user.setGender(userDetails.getGender());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }

        User savedUser = userRepository.save(user);
        System.out.println("Saved user: " + savedUser);
        return savedUser;
    }
}
