package com.example.mzp.fairshare1.controller;

import com.example.mzp.fairshare1.entity.Expense;
import com.example.mzp.fairshare1.services.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private com.example.mzp.fairshare1.services.NotificationService notificationService;

    @Autowired
    private com.example.mzp.fairshare1.repositories.UserRepository userRepository;

    @PostMapping("/group/{groupId}")
    public Expense createExpense(@PathVariable Long groupId, @RequestBody Map<String, Object> payload) {
        Expense expense = new Expense();
        expense.setTitle((String) payload.get("title"));
        expense.setDescription((String) payload.get("description"));

        Object amountObj = payload.get("amount");
        if (amountObj instanceof Integer) {
            expense.setAmount(((Integer) amountObj).doubleValue());
        } else if (amountObj instanceof Double) {
            expense.setAmount((Double) amountObj);
        } else if (amountObj instanceof String && !((String) amountObj).isEmpty()) {
            expense.setAmount(Double.parseDouble((String) amountObj));
        }

        expense.setDate((String) payload.get("date"));

        Object paidByIdObj = payload.get("paidById");
        Long paidById = null;
        if (paidByIdObj != null && !paidByIdObj.toString().isEmpty()) {
            try {
                paidById = Long.valueOf(paidByIdObj.toString());
            } catch (NumberFormatException e) {
                // Ignore
            }
        }

        Expense createdExpense = expenseService.createExpense(expense, groupId, paidById);

        if (paidById != null) {
            userRepository.findById(paidById).ifPresent(creator -> {
                notificationService.sendExpenseNotification(createdExpense, creator);
            });
        }

        return createdExpense;
    }

    @GetMapping("/group/{groupId}")
    public List<Expense> getGroupExpenses(@PathVariable Long groupId) {
        return expenseService.getGroupExpenses(groupId);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }
}
