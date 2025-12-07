package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.Notification;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.GroupRepository;
import com.example.mzp.fairshare1.repositories.NotificationRepository;
import com.example.mzp.fairshare1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    public void sendInvite(Long groupId, String email, User sender) {
        User recipient = userRepository.findByEmail(email);
        if (recipient == null) {
            throw new RuntimeException("User with email " + email + " not found.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));

        // Check if user is already in the group
        if (group.getMembers().contains(recipient)) {
            throw new RuntimeException("User is already a member of this group.");
        }

        // Create notification
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setGroup(group);
        notification.setType(Notification.NotificationType.GROUP_INVITE);

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public List<Notification> getPendingNotifications(User user) {
        return notificationRepository.findByRecipientAndStatusOrderByCreatedAtDesc(user,
                Notification.NotificationStatus.PENDING);
    }

    public void respondToInvite(Long notificationId, boolean accept) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found."));

        if (notification.getStatus() != Notification.NotificationStatus.PENDING) {
            throw new RuntimeException("This invite has already been responded to.");
        }

        if (accept) {
            notification.setStatus(Notification.NotificationStatus.ACCEPTED);
            // Add user to group
            groupService.addMember(notification.getGroup().getId(), notification.getRecipient());
        } else {
            notification.setStatus(Notification.NotificationStatus.REJECTED);
        }

        notificationRepository.save(notification);
    }

    public void notifyChoreAssigned(com.example.mzp.fairshare1.entity.Chore chore) {
        if (chore.getAssignedTo() == null)
            return;

        Notification notification = new Notification();
        notification.setRecipient(chore.getAssignedTo());
        // For system notifications, we might not have a "sender", or checks if there is
        // one.
        // Assuming current user is creator or we make sender nullable/optional,
        // but for now let's set it to the creator? Or null if possible.
        // The Entity has nullable=false for sender. Let's make it nullable or assign a
        // system user?
        // Actually, for chore assignment, it's usually someone creating it. We need to
        // pass the creator.
        // Let's modify the signature to accept a sender.
    }

    // Changing approach: The prompt implies auto-notification on creation.
    // I need to update the methods to take the creator/sender.

    public void sendChoreNotification(com.example.mzp.fairshare1.entity.Chore chore, User creator) {
        if (chore.getAssignedTo() == null || chore.getAssignedTo().getId().equals(creator.getId())) {
            // Don't notify if assigned to self or unassigned
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(chore.getAssignedTo());
        notification.setSender(creator);
        notification.setGroup(chore.getGroup());
        notification.setType(Notification.NotificationType.CHORE_ASSIGNED);
        notificationRepository.save(notification);
    }

    public void sendExpenseNotification(com.example.mzp.fairshare1.entity.Expense expense, User creator) {
        // Notify all group members except the creator
        com.example.mzp.fairshare1.entity.Group group = expense.getGroup();
        for (User member : group.getMembers()) {
            if (!member.getId().equals(creator.getId())) {
                Notification notification = new Notification();
                notification.setRecipient(member);
                notification.setSender(creator);
                notification.setGroup(group);
                notification.setType(Notification.NotificationType.EXPENSE_ADDED);
                notificationRepository.save(notification);
            }
        }
    }

    public void markAllRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientAndStatusOrderByCreatedAtDesc(user,
                Notification.NotificationStatus.PENDING);
        for (Notification notification : notifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        // Also mark accepted/rejected ones as read if they aren't?
        // Actually, let's just mark ALL notifications for the user as read, regarding
        // of status, if they are unread.
        // But for efficiency, maybe just find all unread ones.
        // Since I haven't added findByRecipientAndIsReadFalse to repository, I'll
        // filter in memory or fetch all.
        // Let's use getUserNotifications and filter.
        List<Notification> all = getUserNotifications(user);
        for (Notification n : all) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}
