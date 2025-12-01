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

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Chores</h1>
                <div className="header-actions">
                    <button className="add-button" onClick={handleAddClick}>
                        <Plus size={16} style={{ marginRight: '5px' }} /> Add Chore
                    </button>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
                <button
                    className={`tab-button ${activeTab === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overdue')}
                >
                    Overdue
                </button>
            </div>

            <div className="chores-list">
                {sortedDates.length === 0 ? (
                    <p className="empty-state">No {activeTab} tasks.</p>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="date-group">
                            <h3 className="date-label">{getDateLabel(date)} ⌄</h3>
                            {groupedChores[date].map(chore => (
                                <div key={chore.id} className={`chore-item ${chore.status}`} onClick={() => handleChoreClick(chore)}>
                                    <div className="chore-info">
                                        <span className="chore-name">{chore.title}</span>
                                        {chore.description && <span className="chore-area">({chore.description})</span>}
                                    </div>
                                    <span className="chore-time">{(chore.dueDate || '').split(' ')[1] || ''}</span>
                                </div>
                            ))}
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
                                    <button className="action-button delete" onClick={handleDeleteClick} style={{ backgroundColor: '#ff4444', color: 'white', marginLeft: '10px' }}>Delete</button>
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
                                    <label>Assigned Housemate</label>
                                    <select
                                        name="assignedToId"
                                        value={newChore.assignedToId}
                                        onChange={handleInputChange}
                                        className="form-select"
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
