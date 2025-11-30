import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

const Expenses = () => {
    const { expenses, addExpense, markExpensePaid, budget, updateBudget, groups } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [tempBudget, setTempBudget] = useState('');
    const [expenseToConfirm, setExpenseToConfirm] = useState(null);
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        split: false
    });

    // Calculate unique members
    const roommates = Array.from(new Set(
        groups.flatMap(group => group.members.map(member => member.name))
    ));
    const memberCount = roommates.length > 0 ? roommates.length : 1;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewExpense({
            ...newExpense,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addExpense(newExpense);
        setIsModalOpen(false);
        setNewExpense({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            split: false
        });
    };

    const handleStatusClick = (expense) => {
        if (expense.status === 'paid') return;
        setExpenseToConfirm(expense);
        setIsConfirmModalOpen(true);
    };

    const confirmPayment = () => {
        if (expenseToConfirm) {
            markExpensePaid(expenseToConfirm.id);
            setIsConfirmModalOpen(false);
            setExpenseToConfirm(null);
        }
    };

    const handleBudgetClick = () => {
        setTempBudget(budget);
        setIsBudgetModalOpen(true);
    };

    const handleSaveBudget = (e) => {
        e.preventDefault();
        if (tempBudget !== '' && !isNaN(tempBudget)) {
            updateBudget(parseFloat(tempBudget));
            setIsBudgetModalOpen(false);
        }
    };

    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

    const [activeTab, setActiveTab] = useState('upcoming');

    const filterExpenses = (expenses) => {
        const today = new Date().toISOString().split('T')[0];
        return expenses.filter(expense => {
            if (activeTab === 'upcoming') {
                return expense.date >= today && expense.status !== 'paid';
            } else if (activeTab === 'completed') {
                return expense.status === 'paid';
            } else if (activeTab === 'overdue') {
                return expense.date < today && expense.status !== 'paid';
            }
            return true;
        });
    };

    const filteredExpenses = filterExpenses(expenses);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p style={{ margin: 0, color: '#666' }}>Monthly Budget: <strong>₱{budget}</strong></p>
                </div>
                <div className="header-actions">
                    <button className="add-button" onClick={() => setIsModalOpen(true)}>
                        + Add Expense
                    </button>
                    <button className="add-button" style={{ backgroundColor: '#FADADD', color: '#4A2C2C' }} onClick={handleBudgetClick}>
                        Set Budget
                    </button>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Expenses
                </button>
                <button
                    className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed Expenses
                </button>
                <button
                    className={`tab-button ${activeTab === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overdue')}
                >
                    Overdue Expenses
                </button>
            </div>

            <div className="expenses-list">
                <h3 className="date-label">{activeTab === 'upcoming' ? 'Due this month' : activeTab === 'overdue' ? 'Overdue' : 'Paid'} </h3>
                {filteredExpenses.length === 0 ? (
                    <p className="empty-state">No {activeTab} expenses.</p>
                ) : (
                    filteredExpenses.map(expense => (
                        <div key={expense.id} className="expense-card">
                            <div className="expense-details">
                                <h4>{expense.title}</h4>
                                <div className="expense-row">
                                    <span className="label">Total Amount</span>
                                    <span className="value">${parseFloat(expense.amount).toFixed(2)}</span>
                                </div>
                                <div className="expense-row">
                                    <span className="label">Due Date</span>
                                    <span className="value">{new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                                </div>
                                {expense.split && (
                                    <div className="expense-row">
                                        <span className="label">Your Share (1/{memberCount})</span>
                                        <span className="value">${(parseFloat(expense.amount) / memberCount).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                className={`status-button ${expense.status === 'paid' ? 'paid' : 'unpaid'}`}
                                onClick={() => handleStatusClick(expense)}
                                disabled={expense.status === 'paid'}
                            >
                                {expense.status === 'paid' ? 'Paid' : 'Not Paid'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Expense</h2>
                            <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Expense Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newExpense.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-symbol">₱</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newExpense.amount}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <div className="date-input-wrapper">
                                    <span className="calendar-icon">📅</span>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newExpense.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group toggle-group">
                                <label>Split expense</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        name="split"
                                        checked={newExpense.split}
                                        onChange={handleInputChange}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <button type="submit" className="modal-submit-button">Save</button>
                        </form>
                    </div>
                </div>
            )}

            {isConfirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Confirm Payment</h2>
                            <button className="close-button" onClick={() => setIsConfirmModalOpen(false)}>×</button>
                        </div>
                        <p>Are you sure you want to mark this expense as paid?</p>
                        <div className="modal-actions">
                            <button className="action-button completed" onClick={confirmPayment}>Yes</button>
                            <button className="action-button cancel" onClick={() => setIsConfirmModalOpen(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {isBudgetModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Set Monthly Budget</h2>
                            <button className="close-button" onClick={() => setIsBudgetModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveBudget}>
                            <div className="form-group">
                                <label>Budget Amount</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-symbol">₱</span>
                                    <input
                                        type="number"
                                        value={tempBudget}
                                        onChange={(e) => setTempBudget(e.target.value)}
                                        required
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="modal-submit-button">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
