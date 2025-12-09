package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.entity.Chore;
import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.ChoreRepository;
import com.example.mzp.fairshare1.repositories.GroupRepository;
import com.example.mzp.fairshare1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChoreService {

    @Autowired
    private ChoreRepository choreRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FairnessService fairnessService;

    public Chore createChore(Chore chore, Long groupId, Long assignedToId, boolean useFairAssignment) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        chore.setGroup(group);

        // Use fair assignment if requested and no specific user is assigned
        if (useFairAssignment && (assignedToId == null || assignedToId == 0)) {
            Long fairestMemberId = fairnessService.selectFairestMember(groupId);
            if (fairestMemberId != null) {
                assignedToId = fairestMemberId;
            }
        }

        if (assignedToId != null) {
            User user = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            chore.setAssignedTo(user);
        }

        return choreRepository.save(chore);
    }

    public List<Chore> getGroupChores(Long groupId) {
        return choreRepository.findByGroupId(groupId);
    }

    public Chore updateChore(Long id, Chore choreDetails) {
        Chore chore = choreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chore not found"));

        chore.setTitle(choreDetails.getTitle());
        chore.setDescription(choreDetails.getDescription());
        chore.setDueDate(choreDetails.getDueDate());
        chore.setStatus(choreDetails.getStatus());

        if (choreDetails.getAssignedTo() != null) {
            chore.setAssignedTo(choreDetails.getAssignedTo());
        }

        return choreRepository.save(chore);
    }

    public void deleteChore(Long id) {
        choreRepository.deleteById(id);
    }

}
