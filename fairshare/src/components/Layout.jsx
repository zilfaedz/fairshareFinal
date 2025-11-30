import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { LayoutDashboard, CheckSquare, DollarSign, Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import Toast from './Toast';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, groups, toastMessage, showToast, hideToast } = useAppData();

    const isActive = (path) => location.pathname === path;
    const hasGroup = groups && groups.length > 0;

    // Protect direct URL access
    useEffect(() => {
        if (!hasGroup && (location.pathname === '/chores' || location.pathname === '/expenses')) {
            navigate('/dashboard');
        }
    }, [hasGroup, location.pathname, navigate]);

    const handleLogout = () => {
        navigate('/');
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
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="logo-circle-small"></div>
                        <h2 className="app-title-small">FairShare</h2>
                    </Link>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} className="nav-icon" /> Dashboard
                    </Link>

                    <Link
                        to="/chores"
                        className={`nav-item ${isActive('/chores') ? 'active' : ''}`}
                        onClick={(e) => handleRestrictedClick(e, '/chores')}
                        style={{ opacity: hasGroup ? 1 : 0.6, cursor: hasGroup ? 'pointer' : 'not-allowed' }}
                    >
                        <CheckSquare size={20} className="nav-icon" /> Chores
                    </Link>
                    <Link
                        to="/expenses"
                        className={`nav-item ${isActive('/expenses') ? 'active' : ''}`}
                        onClick={(e) => handleRestrictedClick(e, '/expenses')}
                        style={{ opacity: hasGroup ? 1 : 0.6, cursor: hasGroup ? 'pointer' : 'not-allowed' }}
                    >
                        <DollarSign size={20} className="nav-icon" /> Expenses
                    </Link>

                    <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                        <SettingsIcon size={20} className="nav-icon" /> Settings
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={20} className="nav-icon" /> Logout
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="topbar">
                    <button className="menu-button"><Menu size={24} /></button>
                    <div className="topbar-right">
                        <Link to="/settings" className="user-profile" style={{ textDecoration: 'none' }}>
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="User" className="user-avatar" />
                            ) : (
                                <div className="user-avatar"></div>
                            )}
                            <span className="user-name">{user.name}</span>
                        </Link>
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
