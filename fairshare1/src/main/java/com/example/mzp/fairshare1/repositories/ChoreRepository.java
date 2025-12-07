package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.entity.Chore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChoreRepository extends JpaRepository<Chore, Long> {
    List<Chore> findByGroupId(Long groupId);

    @Modifying
    @Transactional
    void deleteByGroupId(Long groupId);
}
