package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.entity.Expense;
import com.example.mzp.fairshare1.entity.Group;
import com.example.mzp.fairshare1.entity.User;
import com.example.mzp.fairshare1.repositories.ExpenseRepository;
import com.example.mzp.fairshare1.repositories.GroupRepository;
import com.example.mzp.fairshare1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public Expense createExpense(Expense expense, Long groupId, Long paidById) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        expense.setGroup(group);

        if (paidById != null) {
            User user = userRepository.findById(paidById)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            expense.setPaidBy(user);
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    public List<Expense> getGroupExpensesForUser(Long groupId, Long userId) {
        return expenseRepository.findByGroupIdAndUserIdOrSplit(groupId, userId);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public Expense updateExpense(Long id, Expense updated) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (updated.getTitle() != null)
            existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null)
            existing.setDescription(updated.getDescription());
        if (updated.getAmount() != null)
            existing.setAmount(updated.getAmount());
        if (updated.getDate() != null)
            existing.setDate(updated.getDate());
        if (updated.getPaidBy() != null)
            existing.setPaidBy(updated.getPaidBy());
        if (updated.getIsSplit() != null)
            existing.setIsSplit(updated.getIsSplit());

        return expenseRepository.save(existing);
    }
}
