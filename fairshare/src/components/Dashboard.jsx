import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const Dashboard = () => {
    const { chores, expenses, user, budget } = useAppData();
    const navigate = useNavigate();

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const tasksDueToday = chores.filter(chore => chore.date === today && chore.status !== 'completed').length;

    const currentMonth = new Date().getMonth();
    const monthlyExpense = expenses
        .filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    const budgetRemaining = budget - monthlyExpense;

    const tasksCompleted = chores.filter(chore => chore.status === 'completed').length;
    const tasksOverdue = chores.filter(chore => chore.date < today && chore.status !== 'completed').length;

    // Get upcoming chores
    const upcomingChores = chores
        .filter(chore => chore.date >= today && chore.status !== 'completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    const getDateLabel = (dateStr) => {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        if (dateStr === today) return 'Today';
        if (dateStr === tomorrow) return 'Tomorrow';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Hello, <strong>{user.fullName}!</strong></h1>
                    <p>You're holding up your end of the bargain. Check your Chore Queue to keep the balance.</p>
                </div>
                <div className="welcome-circle"></div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card personal-card">
                    <h3>Upcoming Chores</h3>
                    <p className="card-subtitle">Your next tasks to complete.</p>
                    <hr />
                    {upcomingChores.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No upcoming chores!</p>
                    ) : (
                        <div className="upcoming-chores-list">
                            {upcomingChores.map(chore => (
                                <div key={chore.id} style={{
                                    marginBottom: '10px',
                                    padding: '12px',
                                    backgroundColor: '#FFF0F5',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#4A2C2C', marginBottom: '2px' }}>{chore.task}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{getDateLabel(chore.date)}</div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4A2C2C' }}>{chore.time}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="card-button" style={{ marginTop: '15px' }} onClick={() => navigate('/chores')}>View All Chores</button>
                </div>

                <div className="dashboard-card stats-card">
                    <h3>Chores & Expenses</h3>
                    <p className="card-subtitle">Track and manage your upcoming tasks and spending.</p>
                    <hr />
                    <div className="stat-row">
                        <span>Tasks due today</span>
                        <span className="stat-badge">{tasksDueToday}</span>
                    </div>
                    <div className="stat-row">
                        <span>Monthly Expense</span>
                        <span className="stat-badge expense">${monthlyExpense.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                        <span>Budget Remaining</span>
                        <span className="stat-badge budget">${budgetRemaining.toFixed(2)}</span>
                    </div>
                    <div className="card-actions">
                        <button className="action-button" onClick={() => navigate('/expenses')}>Manage Expenses</button>
                        <button className="action-button" onClick={() => navigate('/chores')}>Manage Chores</button>
                    </div>
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <h4>Tasks Completed</h4>
                    <div className="summary-value-box">{tasksCompleted}</div>
                </div>
                <div className="summary-card">
                    <h4>Tasks Overdue</h4>
                    <div className="summary-value-box">{tasksOverdue}</div>
                </div>
                <div className="summary-card">
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
