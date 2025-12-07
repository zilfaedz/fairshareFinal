package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.entity.Notification;
import com.example.mzp.fairshare1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndStatusOrderByCreatedAtDesc(User recipient,
            Notification.NotificationStatus status);
}
