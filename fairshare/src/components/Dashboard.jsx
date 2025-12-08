import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { CheckCircle, AlertCircle, Calendar, DollarSign, PieChart, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const { chores, expenses, user, budget, groups, showToast, currentGroup } = useAppData();
    const navigate = useNavigate();

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const tasksDueToday = chores.filter(chore => {
        const choreDate = (chore.dueDate || '').split(' ')[0];
        return choreDate === today && chore.status !== 'completed';
    }).length;

    const currentMonth = new Date().getMonth();

    // Calculate member count for splitting
    const memberCount = currentGroup && currentGroup.members ? (currentGroup.members.length || 1) : 1;

    const monthlyExpense = expenses
        .filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => {
            let amount = parseFloat(expense.amount || 0);
            if (expense.isSplit) {
                amount = amount / memberCount;
            }
            return sum + amount;
        }, 0);

    const budgetRemaining = budget - monthlyExpense;

    const tasksCompleted = chores.filter(chore => chore.status === 'completed').length;
    const tasksOverdue = chores.filter(chore => {
        const choreDate = (chore.dueDate || '').split(' ')[0];
        return choreDate < today && chore.status !== 'completed';
    }).length;

    const handleRestrictedNavigate = (path) => {
        if (groups && groups.length > 0) {
            navigate(path);
        } else {
            showToast("You must join a group to access this feature.");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Hello, <strong>{user.fullName}!</strong></h1>
                    <p>You're holding up your end of the bargain. Check your Chore Queue to keep the balance.</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card personal-card">
                    <h3>Fairness Score</h3>
                    <p className="card-subtitle">See how responsibilities are distributed.</p>
                    <hr />
                    <div className="fairness-score-container">
                        {/* Mocking fairness data for now based on available chores */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <PieChart size={48} color="#E69FB8" />
                                <p style={{ marginTop: '10px', color: '#666' }}>Analytics coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card stats-card">
                    <h3>Chores & Expenses</h3>
                    <p className="card-subtitle">Track and manage your upcoming tasks and spending.</p>
                    <hr />
                    <div className="stat-row">
                        <span><Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Tasks due today</span>
                        <span className="stat-badge">{tasksDueToday}</span>
                    </div>
                    <div className="stat-row">
                        <span><TrendingUp size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Monthly Expense</span>
                        <span className="stat-badge expense">₱{monthlyExpense.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                        <span><span style={{ marginRight: '8px', fontWeight: 700 }}>₱</span>Budget Remaining</span>
                        <span className="stat-badge budget">₱{budgetRemaining.toFixed(2)}</span>
                    </div>
                    <div className="card-actions">
                        <button className="action-button" onClick={() => handleRestrictedNavigate('/expenses')}>Manage Expenses</button>
                        <button className="action-button" onClick={() => handleRestrictedNavigate('/chores')}>Manage Chores</button>
                    </div>
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-card interactive-card" onClick={() => navigate('/chores?filter=completed')}>
                    <h4>Tasks Completed</h4>
                    <div className="summary-value-box">{tasksCompleted}</div>
                </div>
                <div className="summary-card interactive-card" onClick={() => navigate('/chores?filter=overdue')}>
                    <h4>Tasks Overdue</h4>
                    <div className="summary-value-box">{tasksOverdue}</div>
                </div>
                <div className="summary-card interactive-card" onClick={() => navigate('/calendar')}>
                    <h4>Date</h4>
                    <div className="summary-value-box date-box">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;