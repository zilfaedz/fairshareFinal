package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByCode(String code);
}
