package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private com.example.mzp.fairshare1.repositories.UserRepository userRepository;

    @Autowired
    private com.example.mzp.fairshare1.repositories.ChoreRepository choreRepository;

    @Autowired
    private com.example.mzp.fairshare1.repositories.ExpenseRepository expenseRepository;

    @Autowired
    private com.example.mzp.fairshare1.repositories.NotificationRepository notificationRepository;

    public Group createGroup(String name, User creator) {
        String code = generateUniqueCode();
        Group group = new Group(name, code);
        group.addMember(creator);
        return groupRepository.save(group);
    }

    public Group joinGroup(String code, User user) {
        Group group = groupRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Group not found with code: " + code));
        group.addMember(user);
        return groupRepository.save(group);
    }

    public Group addMember(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.addMember(user);
        return groupRepository.save(group);
    }

    public List<Group> getUserGroups(User user) {
        // In a real app, we might want a custom query in repository for performance
        // But for now, filtering all groups is okay for small scale or we rely on the
        // ManyToMany mapping
        // Actually, since it's ManyToMany, we can't easily query from the Group side
        // without a custom query
        // Let's use a simple approach: find all groups where members contains user
        return groupRepository.findAll().stream()
                .filter(group -> group.getMembers().contains(user))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        // First, delete all chores associated with this group
        choreRepository.deleteByGroupId(groupId);

        // Delete all expenses associated with this group
        expenseRepository.deleteByGroupId(groupId);

        // Delete notifications associated with this group (to avoid FK constraint)
        notificationRepository.deleteByGroupId(groupId);

        // Now we can safely delete the group
        groupRepository.deleteById(groupId);
    }

    public void removeMember(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.removeMember(user);
        groupRepository.save(group);
    }

    public Group updateGroup(Long groupId, String name) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setName(name);
        return groupRepository.save(group);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (groupRepository.findByCode(code).isPresent());
        return code;
    }

    private String generateCode() {
        // 3 letters + 6 numbers
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        // 3 uppercase letters
        for (int i = 0; i < 3; i++) {
            sb.append((char) ('A' + random.nextInt(26)));
        }

        // 6 numbers
        for (int i = 0; i < 6; i++) {
            sb.append(random.nextInt(10));
        }

        return sb.toString();
    }
}
