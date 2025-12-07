import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, DollarSign, Calendar, Check, X, FileText, Clock, Edit2, Trash2 } from 'lucide-react';

const Expenses = () => {
    const { expenses, addExpense, markExpensePaid, budget, updateBudget, currentGroup, user } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [tempBudget, setTempBudget] = useState('');
    const [expenseToConfirm, setExpenseToConfirm] = useState(null);
    const [newExpense, setNewExpense] = useState({
        title: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        split: false
    });

    // Calculate unique members
    const roommates = currentGroup ? currentGroup.members : [];
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

        // Client-side validation
        if (!newExpense.title || !newExpense.title.trim()) {
            alert("Please enter an expense title.");
            return;
        }
        if (!newExpense.amount || isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }
        if (!newExpense.date) {
            alert("Please select a date.");
            return;
        }

        addExpense(newExpense);
        setIsModalOpen(false);
        setNewExpense({
            title: '',
            description: '',
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

    // Stats Calculations
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = expenses.filter(e => e.date >= today && e.status !== 'paid').length;
    const paidCount = expenses.filter(e => e.status === 'paid').length;
    const overdueCount = expenses.filter(e => e.date < today && e.status !== 'paid').length;

    return (
        <div className="page-container">
            <div className="task-header">
                <div className="task-header-left">
                    <h1 className="task-title">Expenses</h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>Monthly Budget: <strong style={{ color: '#4A2C2C' }}>₱{budget}</strong></p>
                </div>
                <div className="header-actions">
                    <button className="btn-add-enhanced" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Add Expense
                    </button>
                    <button className="btn-add-enhanced" style={{ background: 'white', color: '#4A2C2C', border: '2px solid #e5e7eb' }} onClick={handleBudgetClick}>
                        <DollarSign size={20} /> Set Budget
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div
                    className={`stat-card ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    <div className="stat-icon blue">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{upcomingCount}</span>
                        <span className="stat-label">Upcoming</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <div className="stat-icon green">
                        <Check size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{paidCount}</span>
                        <span className="stat-label">Paid</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overdue')}
                >
                    <div className="stat-icon red">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{overdueCount}</span>
                        <span className="stat-label">Overdue</span>
                    </div>
                </div>
            </div>

            <div className="chores-list"> {/* keeping container name or change to generic? Keeping for safety if App.css targets it, but I removed its styles. */}
                {filteredExpenses.length > 0 && (
                    <h3 className="task-section-title">{activeTab === 'upcoming' ? 'Due this month' : activeTab === 'overdue' ? 'Overdue' : 'Paid'} </h3>
                )}

                {filteredExpenses.length === 0 ? (
                    <div className="tasks-grid">
                        <div className="empty-state-enhanced">No {activeTab} expenses.</div>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {filteredExpenses.map(expense => (
                            <div key={expense.id} className="task-card">
                                <div className="task-card-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 className="task-custom-title">{expense.title}</h4>
                                        {/* Show your share if split, otherwise show total amount */}
                                        {expense.split && user ? (
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A2C2C' }}>
                                                ₱{(parseFloat(expense.amount) / (roommates.length || 1)).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A2C2C' }}>₱{parseFloat(expense.amount).toFixed(2)}</span>
                                        )}
                                    </div>
                                    <span className="task-time">{new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                                </div>

                                {expense.description && (
                                    <p className="task-description">{expense.description}</p>
                                )}

                                <div className="task-meta-row" style={{ flexDirection: 'column', gap: '5px' }}>
                                    {expense.split && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 600 }}>Total</span>
                                                <span style={{ fontWeight: '600', color: '#4A2C2C' }}>₱{parseFloat(expense.amount).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                <span style={{ color: '#666' }}>{`Split between ${memberCount} members`}</span>
                                                <span style={{ color: '#666' }}>₱{(parseFloat(expense.amount) / (memberCount || 1)).toFixed(2)} each</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                                {roommates.map(member => {
                                                    const share = (parseFloat(expense.amount) / (memberCount || 1)).toFixed(2);
                                                    const isYou = user && member && user.id === member.id;
                                                    return (
                                                        <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: isYou ? '#0b6623' : '#333', fontWeight: isYou ? 700 : 500 }}>
                                                            <span>{isYou ? `${member.fullName || member.name} (You)` : (member.fullName || member.name)}</span>
                                                            <span>₱{share}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="task-actions">
                                    <button
                                        className={`btn-action-complete ${expense.status === 'paid' ? '' : ''}`}
                                        style={{ flex: 1, backgroundColor: expense.status === 'paid' ? '#e5e7eb' : '#E6F4EA', color: expense.status === 'paid' ? '#666' : '#137333' }}
                                        onClick={() => handleStatusClick(expense)}
                                        disabled={expense.status === 'paid'}
                                    >
                                        {expense.status === 'paid' ? <><Check size={16} /> Paid</> : 'Mark as Paid'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Expense</h2>
                            <button className="close-button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
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
                                <label>Description (Optional)</label>
                                <div className="input-wrapper">
                                    <FileText size={16} className="input-icon" style={{ position: 'absolute', top: '12px', left: '10px', color: '#888' }} />
                                    <input
                                        type="text"
                                        name="description"
                                        value={newExpense.description}
                                        onChange={handleInputChange}
                                        style={{ paddingLeft: '35px' }}
                                        placeholder="Add details..."
                                    />
                                </div>
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
                            {newExpense.split && (
                                <div className="form-group" style={{ marginTop: 8 }}>
                                    <label style={{ marginBottom: 6 }}>Split preview</label>
                                    <div style={{ padding: '8px 12px', border: '1px solid #eee', borderRadius: 6, background: '#fafafa' }}>
                                        {(!newExpense.amount || isNaN(parseFloat(newExpense.amount))) ? (
                                            <div style={{ color: '#666' }}>Enter an amount to see per-member share</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                                    <span>Each member</span>
                                                    <span>₱{(parseFloat(newExpense.amount) / (memberCount || 1)).toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                                                    {roommates.map(member => {
                                                        const share = (parseFloat(newExpense.amount) / (memberCount || 1)).toFixed(2);
                                                        const isYou = user && member && user.id === member.id;
                                                        return (
                                                            <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', color: isYou ? '#0b6623' : '#333' }}>
                                                                <span style={{ fontWeight: isYou ? 700 : 500 }}>{isYou ? `${member.fullName || member.name} (You)` : (member.fullName || member.name)}</span>
                                                                <span style={{ fontWeight: 600 }}>₱{share}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                            <button className="close-button" onClick={() => setIsConfirmModalOpen(false)}><X size={20} /></button>
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
                            <button className="close-button" onClick={() => setIsBudgetModalOpen(false)}><X size={20} /></button>
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