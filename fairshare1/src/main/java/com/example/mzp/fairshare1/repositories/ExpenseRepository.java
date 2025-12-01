package com.example.mzp.fairshare1.repositories;

import com.example.mzp.fairshare1.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupId(Long groupId);
}
