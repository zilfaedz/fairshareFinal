package com.example.mzp.fairshare1.services;

import com.example.mzp.fairshare1.models.Expense;
import com.example.mzp.fairshare1.models.Group;
import com.example.mzp.fairshare1.models.User;
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

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}
