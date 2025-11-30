import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppData();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="logo-circle-small"></div>
                        <h2 className="app-title-small">FairShare</h2>
                    </Link>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <span className="nav-icon"></span> Dashboard
                    </Link>
                    <Link to="/chores" className={`nav-item ${isActive('/chores') ? 'active' : ''}`}>
                        <span className="nav-icon"></span> Chores
                    </Link>
                    <Link to="/expenses" className={`nav-item ${isActive('/expenses') ? 'active' : ''}`}>
                        <span className="nav-icon"></span> Expenses
                    </Link>

                    <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                        <span className="nav-icon"></span> Settings
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <span className="nav-icon">↪️</span> Logout
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="topbar">
                    <button className="menu-button">☰</button>
                    <div className="topbar-right">
                        <Link to="/settings" className="user-profile" style={{ textDecoration: 'none' }}>
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="User" className="user-avatar" />
                            ) : (
                                <div className="user-avatar"></div>
                            )}
                            <span className="user-name">{user.fullName}</span>
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
