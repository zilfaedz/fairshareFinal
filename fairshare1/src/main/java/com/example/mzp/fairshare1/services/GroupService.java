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
        return groupRepository.findAll().stream()
                .filter(group -> group.getMembers().contains(user))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        choreRepository.deleteByGroupId(groupId);
        expenseRepository.deleteByGroupId(groupId);
        notificationRepository.deleteByGroupId(groupId);
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

    public Group updateMonthlyBudget(Long groupId, Double budget) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setMonthlyBudget(budget);
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
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 3; i++) {
            sb.append((char) ('A' + random.nextInt(26)));
        }

        for (int i = 0; i < 6; i++) {
            sb.append(random.nextInt(10));
        }

        return sb.toString();
    }
}
