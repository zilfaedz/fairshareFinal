package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}