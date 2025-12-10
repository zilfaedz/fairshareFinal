import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { CheckCircle, AlertCircle, Calendar, DollarSign, PieChart, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const { chores, expenses, user, budget, groups, showToast, currentGroup, fairnessScores } = useAppData();
    const navigate = useNavigate();
    const [hoveredMember, setHoveredMember] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: null, y: null });
    const [showTooltip, setShowTooltip] = useState(false);

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

    // Removed dashboard summary tiles for Completed/Overdue to avoid redundancy with Fairness Analytics

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
                    <h3>Fairness Analytics</h3>
                    <p className="card-subtitle">Member workload distribution</p>
                    <hr />
                    <div className="fairness-score-container">
                        {Object.keys(fairnessScores).length > 0 ? (
                            <div className="fairness-pie-chart">
                                {(() => {
                                    const members = Object.values(fairnessScores).sort((a, b) => b.score - a.score);
                                    const total = members.reduce((sum, m) => sum + Math.max(m.score, 0), 0) || 1;
                                    const colors = ['#4A2C2C', '#FADADD', '#D98E9E', '#6D4C4C'];

                                    let currentAngle = 0;
                                    const radius = 70;
                                    const centerX = 100;
                                    const centerY = 100;

                                    // Calculate overdue chores for tooltip
                                    const today = new Date().toISOString().split('T')[0];
                                    const getMemberStats = (memberId) => {
                                        const memberChores = chores.filter(c => c.assignedTo && c.assignedTo.id === memberId);
                                        const completed = memberChores.filter(c => c.status === 'completed').length;
                                        const pending = memberChores.filter(c => c.status !== 'completed').length;
                                        const overdue = memberChores.filter(c => {
                                            const choreDate = (c.dueDate || '').split(' ')[0];
                                            return choreDate < today && c.status !== 'completed';
                                        }).length;
                                        return { completed, pending, overdue };
                                    };

                                    const handleMouseMove = (e) => {
                                        const container = e.currentTarget.closest('.fairness-score-container');
                                        if (!container) return;
                                        const rect = container.getBoundingClientRect();
                                        const offsetX = e.clientX - rect.left;
                                        const offsetY = e.clientY - rect.top;
                                        setTooltipPos({ x: offsetX, y: offsetY });
                                    };

                                    return (
                                        <>
                                            <div style={{ position: 'relative' }} onMouseMove={handleMouseMove}>
                                                <svg viewBox="0 0 200 200" className="pie-chart-svg">
                                                    {members.map((member, index) => {
                                                        const percentage = (Math.max(member.score, 0) / total) * 100;
                                                        const angle = (percentage / 100) * 360;

                                                        const startAngle = currentAngle;
                                                        const endAngle = currentAngle + angle;
                                                        currentAngle = endAngle;

                                                        const startRad = (startAngle - 90) * Math.PI / 180;
                                                        const endRad = (endAngle - 90) * Math.PI / 180;

                                                        const x1 = centerX + radius * Math.cos(startRad);
                                                        const y1 = centerY + radius * Math.sin(startRad);
                                                        const x2 = centerX + radius * Math.cos(endRad);
                                                        const y2 = centerY + radius * Math.sin(endRad);

                                                        const largeArc = angle > 180 ? 1 : 0;

                                                        const pathData = [
                                                            `M ${centerX} ${centerY}`,
                                                            `L ${x1} ${y1}`,
                                                            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                                                            'Z'
                                                        ].join(' ');

                                                        return (
                                                            <path
                                                                key={member.userId}
                                                                d={pathData}
                                                                fill={colors[index % colors.length]}
                                                                stroke="#fff"
                                                                strokeWidth="2"
                                                                className="pie-slice"
                                                                onMouseEnter={(e) => { setHoveredMember(member); setShowTooltip(true); handleMouseMove(e); }}
                                                                onMouseLeave={() => { setHoveredMember(null); setShowTooltip(false); }}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                            <div className="pie-chart-legend">
                                                {members.map((member, index) => {
                                                    const percentage = ((Math.max(member.score, 0) / total) * 100).toFixed(1);
                                                    return (
                                                        <div
                                                            key={member.userId}
                                                            className="legend-item"
                                                        >
                                                            <div
                                                                className="legend-color"
                                                                style={{ backgroundColor: colors[index % colors.length] }}
                                                            ></div>
                                                            <span className="legend-name">{member.fullName}</span>
                                                            <span className="legend-value">{percentage}% ({member.score})</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {hoveredMember && showTooltip && tooltipPos.x !== null && tooltipPos.y !== null && (
                                                <div
                                                    className="pie-chart-tooltip"
                                                    style={{
                                                        left: Math.max(12, tooltipPos.x + 12),
                                                        top: Math.max(12, tooltipPos.y + 12),
                                                        transform: 'translate(0, 0)'
                                                    }}
                                                >
                                                    <div className="tooltip-header">{hoveredMember.fullName}</div>
                                                    <div className="tooltip-content">
                                                        <div className="tooltip-row">
                                                            <span className="tooltip-label">Completed:</span>
                                                            <span className="tooltip-value completed">{getMemberStats(hoveredMember.userId).completed}</span>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <span className="tooltip-label">Upcoming:</span>
                                                            <span className="tooltip-value upcoming">{getMemberStats(hoveredMember.userId).pending}</span>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <span className="tooltip-label">Overdue:</span>
                                                            <span className="tooltip-value overdue">{getMemberStats(hoveredMember.userId).overdue}</span>
                                                        </div>
                                                        <div className="tooltip-divider"></div>
                                                        <div className="tooltip-row">
                                                            <span className="tooltip-label">Fairness Score:</span>
                                                            <span className="tooltip-value score">{hoveredMember.score}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <PieChart size={48} color="#E69FB8" />
                                    <p style={{ marginTop: '10px', color: '#666' }}>No fairness data available</p>
                                </div>
                            </div>
                        )}
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
                        <button className="action-button" onClick={() => handleRestrictedNavigate('/chores')}>Manage Chores</button>
                        <button className="action-button" onClick={() => handleRestrictedNavigate('/expenses')}>Manage Expenses</button>
                    </div>
                </div>
                {/* Date card placed directly under the Chores & Expenses card (right column) */}
                <div className="summary-card interactive-card dashboard-date-card" onClick={() => navigate('/calendar')}>
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