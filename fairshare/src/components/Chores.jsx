import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

const Chores = () => {
    const { chores, addChore, updateChore, deleteChore, toggleChoreStatus, groups } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedChore, setSelectedChore] = useState(null);
    const [newChore, setNewChore] = useState({
        task: '',
        area: '',
        assignee: '',
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
            task: '',
            area: '',
            assignee: '',
            date: new Date().toISOString().split('T')[0],
            time: '12:00'
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleChoreClick = (chore) => {
        setSelectedChore(chore);
        setNewChore(chore);
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
        if (selectedChore) {
            updateChore({ ...newChore, id: selectedChore.id });
        } else {
            addChore(newChore);
        }
        setIsModalOpen(false);
    };

    const [activeTab, setActiveTab] = useState('upcoming');

    const filterChores = (chores) => {
        const today = new Date().toISOString().split('T')[0];
        return chores.filter(chore => {
            if (activeTab === 'upcoming') {
                return chore.date >= today && chore.status !== 'completed';
            } else if (activeTab === 'completed') {
                return chore.status === 'completed';
            } else if (activeTab === 'overdue') {
                return chore.date < today && chore.status !== 'completed';
            }
            return true;
        });
    };

    const filteredChores = filterChores(chores);

    const groupedChores = filteredChores.reduce((acc, chore) => {
        const date = chore.date;
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

    // Get all unique members from all groups
    const roommates = Array.from(new Set(
        groups.flatMap(group => group.members.map(member => member.name))
    )).sort();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Chores</h1>
                <div className="header-actions">
                    <button className="add-button" onClick={handleAddClick}>
                        + Add Chore
                    </button>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Chores
                </button>
                <button
                    className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed Chores
                </button>
                <button
                    className={`tab-button ${activeTab === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overdue')}
                >
                    Overdue Chores
                </button>
            </div>

            <div className="chores-list">
                {sortedDates.length === 0 ? (
                    <p className="empty-state">No {activeTab} chores.</p>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="date-group">
                            <h3 className="date-label">{getDateLabel(date)} ⌄</h3>
                            {groupedChores[date].map(chore => (
                                <div key={chore.id} className={`chore-item ${chore.status}`} onClick={() => handleChoreClick(chore)}>
                                    <div className="chore-info">
                                        <span className="chore-name">{chore.task}</span>
                                        {chore.area && <span className="chore-area">({chore.area})</span>}
                                    </div>
                                    <span className="chore-time">{chore.time}</span>
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
                            <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        {!isEditMode && selectedChore ? (
                            <div className="chore-details">
                                <div className="detail-row">
                                    <span className="label">Task:</span>
                                    <span className="value">{selectedChore.task}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Area:</span>
                                    <span className="value">{selectedChore.area || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Assignee:</span>
                                    <span className="value">{selectedChore.assignee || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Date:</span>
                                    <span className="value">{new Date(selectedChore.date).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Time:</span>
                                    <span className="value">{selectedChore.time || '-'}</span>
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
                                    <label>Task</label>
                                    <input
                                        type="text"
                                        name="task"
                                        value={newChore.task}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Area</label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={newChore.area}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Assigned Housemate</label>
                                    <select
                                        name="assignee"
                                        value={newChore.assignee}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="">Select a housemate</option>
                                        {roommates.map(name => (
                                            <option key={name} value={name}>{name}</option>
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
