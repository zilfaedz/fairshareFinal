import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { Plus, Calendar, Clock, CheckCircle, Trash2, Edit2, X } from 'lucide-react';

const Chores = () => {
    const { chores, addChore, updateChore, deleteChore, toggleChoreStatus, currentGroup } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedChore, setSelectedChore] = useState(null);
    const [newChore, setNewChore] = useState({
        title: '',
        description: '',
        assignedToId: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewChore({ ...newChore, [name]: value });
    };

    const handleAddClick = () => {
        setSelectedChore(null);
        setNewChore({
            title: '',
            description: '',
            assignedToId: '',
            date: new Date().toISOString().split('T')[0],
            time: '12:00'
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleChoreClick = (chore) => {
        setSelectedChore(chore);
        // Parse dueDate back to date and time if possible, or just set date
        const [date, time] = (chore.dueDate || '').split(' ');
        setNewChore({
            ...chore,
            date: date || new Date().toISOString().split('T')[0],
            time: time || '12:00',
            assignedToId: chore.assignedTo ? chore.assignedTo.id : ''
        });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleCancelClick = () => {
        setIsModalOpen(false);
    };

    const handleCompleteClick = () => {
        toggleChoreStatus(selectedChore.id);
        setIsModalOpen(false);
    };

    const handleDeleteClick = () => {
        if (selectedChore) {
            deleteChore(selectedChore.id);
            setIsModalOpen(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        if (!newChore.title || !newChore.title.trim()) {
            alert("Please enter a chore title.");
            return;
        }
        if (!newChore.date) {
            alert("Please select a due date.");
            return;
        }

        const chorePayload = {
            ...newChore,
            dueDate: `${newChore.date} ${newChore.time}`,
            status: newChore.status || 'pending'
        };

        if (selectedChore) {
            updateChore({ ...chorePayload, id: selectedChore.id });
        } else {
            addChore(chorePayload);
        }
        setIsModalOpen(false);
    };

    const [activeTab, setActiveTab] = useState('upcoming');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filter = params.get('filter');
        if (filter && ['upcoming', 'completed', 'overdue'].includes(filter)) {
            setActiveTab(filter);
        }
    }, [location.search]);

    const filterChores = (chores) => {
        const today = new Date().toISOString().split('T')[0];
        return chores.filter(chore => {
            const choreDate = (chore.dueDate || '').split(' ')[0];
            if (activeTab === 'upcoming') {
                return choreDate >= today && chore.status !== 'completed';
            } else if (activeTab === 'completed') {
                return chore.status === 'completed';
            } else if (activeTab === 'overdue') {
                return choreDate < today && chore.status !== 'completed';
            }
            return true;
        });
    };

    const filteredChores = filterChores(chores);

    const groupedChores = filteredChores.reduce((acc, chore) => {
        const date = (chore.dueDate || '').split(' ')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(chore);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedChores).sort();

    const getDateLabel = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        if (dateStr === today) return 'Today';
        if (dateStr === tomorrow) return 'Tomorrow';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const groupMembers = currentGroup ? currentGroup.members : [];

    // Stats Calculations
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = chores.filter(c => {
        const d = (c.dueDate || '').split(' ')[0];
        return d >= today && c.status !== 'completed';
    }).length;
    const completedCount = chores.filter(c => c.status === 'completed').length;
    const overdueCount = chores.filter(c => {
        const d = (c.dueDate || '').split(' ')[0];
        return d < today && c.status !== 'completed';
    }).length;

    // Sort chores within groups by time
    Object.keys(groupedChores).forEach(date => {
        groupedChores[date].sort((a, b) => {
            const timeA = (a.dueDate || '').split(' ')[1] || '23:59';
            const timeB = (b.dueDate || '').split(' ')[1] || '23:59';
            return timeA.localeCompare(timeB);
        });
    });

    return (
        <div className="page-container">
            <div className="task-header">
                <div className="task-header-left">
                    <h1 className="task-title">Chores</h1>
                    <p className="task-subtitle">Manage household tasks</p>
                </div>
                <button className="btn-add-enhanced" onClick={handleAddClick}>
                    <Plus size={20} /> Add Chore
                </button>
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
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{completedCount}</span>
                        <span className="stat-label">Completed</span>
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

            <div className="chores-list">
                {sortedDates.length === 0 ? (
                    <div className="tasks-grid">
                        <div className="empty-state-enhanced">No {activeTab} tasks found.</div>
                    </div>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="task-section">
                            <h3 className="task-section-title">{getDateLabel(date)}</h3>
                            <div className="tasks-grid">
                                {groupedChores[date].map(chore => {
                                    const time = (chore.dueDate || '').split(' ')[1] || '';
                                    // Format time to 12h
                                    const formatTime = (t) => {
                                        if (!t) return '';
                                        const [h, m] = t.split(':');
                                        const hour = parseInt(h);
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        const hour12 = hour % 12 || 12;
                                        return `${hour12}:${m}${ampm}`;
                                    };

                                    return (
                                        <div key={chore.id} className="task-card">
                                            <div className="task-card-header">
                                                <h4 className="task-custom-title">{chore.title}</h4>
                                                {time && <span className="task-time">{formatTime(time)}</span>}
                                            </div>

                                            {chore.description && (
                                                <p className="task-description">{chore.description}</p>
                                            )}

                                            <div className="task-meta-row">
                                                <span>{chore.assignedTo ? (chore.assignedTo.fullName || chore.assignedTo.name) : 'Unassigned'}</span>
                                            </div>

                                            <div className="task-actions">
                                                <button className="btn-action-edit" onClick={(e) => { e.stopPropagation(); handleChoreClick(chore); }}>
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                {chore.status !== 'completed' && (
                                                    <button className="btn-action-complete" onClick={(e) => { e.stopPropagation(); toggleChoreStatus(chore.id); }}>
                                                        <CheckCircle size={14} /> Done
                                                    </button>
                                                )}
                                                <button className="btn-action-delete" onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Are you sure you want to delete this chore?')) {
                                                        deleteChore(chore.id);
                                                    }
                                                }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedChore ? (isEditMode ? 'Edit Chore' : 'Chore Details') : 'Add Chore'}</h2>
                            <button className="close-button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        {!isEditMode && selectedChore ? (
                            <div className="chore-details">
                                <div className="detail-row">
                                    <span className="label">Task:</span>
                                    <span className="value">{selectedChore.title}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Description:</span>
                                    <span className="value">{selectedChore.description || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Assignee:</span>
                                    <span className="value">{selectedChore.assignedTo ? (selectedChore.assignedTo.fullName || selectedChore.assignedTo.name) : '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Due Date:</span>
                                    <span className="value">{selectedChore.dueDate}</span>
                                </div>
                                <div className="modal-actions">
                                    {selectedChore.status !== 'completed' && (
                                        <button className="action-button completed" onClick={handleCompleteClick}>Completed</button>
                                    )}
                                    <button className="action-button edit" onClick={handleEditClick}>Edit</button>
                                    <button className="action-button delete" onClick={handleDeleteClick}>Delete</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Task Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newChore.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={newChore.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned Housemate</label>
                                    <select
                                        name="assignedToId"
                                        value={newChore.assignedToId}
                                        onChange={handleInputChange}
                                        className="form-select-enhanced"
                                    >
                                        <option value="">Select a housemate</option>
                                        {groupMembers.map(member => (
                                            <option key={member.id} value={member.id}>{member.fullName || member.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={newChore.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={newChore.time}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="modal-submit-button">Save</button>
                                    {selectedChore && (
                                        <button type="button" className="action-button cancel" onClick={() => setIsEditMode(false)}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chores;
