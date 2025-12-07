package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupId(Long groupId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Expense e WHERE e.group.id = :groupId AND (e.isSplit = true OR e.paidBy.id = :userId)")
    List<Expense> findByGroupIdAndUserIdOrSplit(@org.springframework.data.param.Param("groupId") Long groupId,
            @org.springframework.data.param.Param("userId") Long userId);

    @Modifying
    @Transactional
    void deleteByGroupId(Long groupId);
}
