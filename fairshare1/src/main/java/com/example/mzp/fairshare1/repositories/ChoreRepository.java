package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.models.Chore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChoreRepository extends JpaRepository<Chore, Long> {
    List<Chore> findByGroupId(Long groupId);
}
