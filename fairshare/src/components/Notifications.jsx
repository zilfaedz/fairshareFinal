import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Check, X, Bell } from 'lucide-react';
import './Notifications.css';

const Notifications = ({ onClose }) => {
    const { notifications, respondToInvite } = useAppData();

    if (!notifications || notifications.length === 0) {
        return (
            <div className="notifications-panel empty">
                <p>No new notifications</p>
            </div>
        );
    }

    const handleAccept = async (id) => {
        await respondToInvite(id, true);
    };

    const handleReject = async (id) => {
        await respondToInvite(id, false);
    };

    return (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h3>Notifications</h3>
            </div>
            <div className="notifications-list">
                {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                        <div key={notification.id} className="notification-item">
                            {notification.type === 'GROUP_INVITE' && (
                                <div className="notification-content">
                                    <p>
                                        <strong>{notification.sender.fullName}</strong> invited you to join <strong>{notification.group.name}</strong>
                                    </p>
                                    {notification.status === 'PENDING' ? (
                                        <div className="notification-actions">
                                            <button className="btn-accept" onClick={() => handleAccept(notification.id)}>
                                                <Check size={16} /> Accept
                                            </button>
                                            <button className="btn-reject" onClick={() => handleReject(notification.id)}>
                                                <X size={16} /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <p className={`status-text ${notification.status.toLowerCase()}`}>
                                            Invite {notification.status.toLowerCase()}
                                        </p>
                                    )}
                                </div>
                            )}
                            {notification.type === 'CHORE_ASSIGNED' && (
                                <div className="notification-content">
                                    <p>
                                        <strong>{notification.sender.fullName}</strong> assigned you a new chore in <strong>{notification.group.name}</strong>
                                    </p>
                                    <p className="notification-detail">Check your chore list for details.</p>
                                </div>
                            )}
                            {notification.type === 'EXPENSE_ADDED' && (
                                <div className="notification-content">
                                    <p>
                                        <strong>{notification.sender.fullName}</strong> added a new expense in <strong>{notification.group.name}</strong>
                                    </p>
                                    <p className="notification-detail">Check expenses for details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
