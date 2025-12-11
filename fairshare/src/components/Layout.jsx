import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { LayoutDashboard, CheckSquare, DollarSign, Settings as SettingsIcon, LogOut, Menu, Bell } from 'lucide-react';
import Toast from './Toast';
import Notifications from './Notifications';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, groups, toastMessage, showToast, hideToast, logout, notifications, markNotificationsRead, pendingCount } = useAppData();
    const [showNotifications, setShowNotifications] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const notificationRef = useRef(null);

    const isActive = (path) => location.pathname === path;
    const hasGroup = groups && groups.length > 0;
    const currentGroup = hasGroup ? groups[0] : null;

    useEffect(() => {
        if (!hasGroup && (location.pathname === '/chores' || location.pathname === '/expenses')) {
            navigate('/dashboard');
        }
    }, [hasGroup, location.pathname, navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRestrictedClick = (e, path) => {
        if (!hasGroup) {
            e.preventDefault();
            showToast("You must join a group to access this feature.");
        }
    };

    return (
        <div className="layout-container">
            <Toast message={toastMessage} onClose={hideToast} />
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="user-profile-card" onClick={() => setCollapsed(!collapsed)} style={{cursor: 'pointer'}}>
                        <div className="user-avatar-large">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="User" />
                            ) : (
                                <div className="avatar-placeholder"></div>
                            )}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.fullName}</span>
                            <span className="user-level">{currentGroup ? currentGroup.name : 'No Group'}</span>
                        </div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <div className="nav-section">
                        <span className="nav-section-label">Main</span>
                        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                            <div className="nav-item-content">
                                <LayoutDashboard size={20} className="nav-icon" />
                                <span className="nav-label">Dashboard</span>
                            </div>
                            <span className="nav-indicator"></span>
                        </Link>
                    </div>

                    <div className="nav-section">
                        <span className="nav-section-label">Features</span>
                        <Link
                            to="/chores"
                            className={`nav-item ${isActive('/chores') ? 'active' : ''} ${!hasGroup ? 'disabled' : ''}`}
                            onClick={(e) => handleRestrictedClick(e, '/chores')}
                        >
                            <div className="nav-item-content">
                                <CheckSquare size={20} className="nav-icon" />
                                <span className="nav-label">Chores</span>
                            </div>
                            <span className="nav-indicator"></span>
                        </Link>

                        <Link
                            to="/expenses"
                            className={`nav-item ${isActive('/expenses') ? 'active' : ''} ${!hasGroup ? 'disabled' : ''}`}
                            onClick={(e) => handleRestrictedClick(e, '/expenses')}
                        >
                            <div className="nav-item-content">
                                <DollarSign size={20} className="nav-icon" />
                                <span className="nav-label">Expenses</span>
                            </div>
                            <span className="nav-indicator"></span>
                        </Link>
                    </div>

                    <div className="nav-section">
                        <span className="nav-section-label">Account</span>
                        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                            <div className="nav-item-content">
                                <SettingsIcon size={20} className="nav-icon" />
                                <span className="nav-label">Settings</span>
                            </div>
                            <span className="nav-indicator"></span>
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    {/* Quick stats removed as requested */}

                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <header className="topbar">
                    <div className="topbar-left">
                        <img src={require('../img/logo.png')} alt="FairShare" className="topbar-logo" />
                        <h1 className="topbar-title">FairShare</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="notification-wrapper" ref={notificationRef}>
                            <button className="notification-button" onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications && typeof markNotificationsRead === 'function') {
                                    markNotificationsRead();
                                }
                            }}>
                                <Bell size={24} />
                                {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
                            </button>
                            {showNotifications && (
                                <div className="notifications-dropdown">
                                    <Notifications onClose={() => setShowNotifications(false)} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;