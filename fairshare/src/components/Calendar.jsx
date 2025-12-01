import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
    const { chores, expenses } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Previous month's padding days
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day other-month"></div>);
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            // Filter events for this day
            const dayChores = chores.filter(chore => chore.date === dateStr);
            const dayExpenses = expenses.filter(expense => expense.date === dateStr);

            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    <span className="day-number">{day}</span>
                    <div className="calendar-events">
                        {dayChores.map(chore => {
                            let statusClass = 'chore';
                            if (chore.status === 'completed') statusClass += ' completed';
                            else if (chore.date < new Date().toISOString().split('T')[0]) statusClass += ' overdue';

                            return (
                                <div key={`chore-${chore.id}`} className={`event-item ${statusClass}`} title={chore.title}>
                                    {chore.status === 'completed' ? <CheckCircle size={10} /> :
                                        chore.date < new Date().toISOString().split('T')[0] ? <AlertCircle size={10} /> :
                                            <Clock size={10} />}
                                    {chore.title}
                                </div>
                            );
                        })}
                        {dayExpenses.map(expense => (
                            <div key={`expense-${expense.id}`} className="event-item expense" title={`${expense.description}: $${expense.amount}`}>
                                <DollarSign size={10} />
                                {expense.description}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="month-nav">
                    <button onClick={prevMonth} className="nav-btn">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextMonth} className="nav-btn">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                ))}
                {renderCalendarDays()}
            </div>

            <div className="legend">
                <div className="legend-item">
                    <span className="dot" style={{ backgroundColor: '#1565c0' }}></span> Upcoming Chore
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ backgroundColor: '#2e7d32' }}></span> Completed
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ backgroundColor: '#c62828' }}></span> Overdue
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ backgroundColor: '#ef6c00' }}></span> Expense
                </div>
            </div>
        </div>
    );
};

export default Calendar;
