import React, { useState, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';

const Settings = () => {
    const {
        user,
        updateUser,
        groups,
        createGroup,
        joinGroup,
        deleteGroup,
        leaveGroup,
        addGroupMember,
        removeGroupMember,
    } = useAppData();

    const [activeTab, setActiveTab] = useState('account');
    const [joinCode, setJoinCode] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [newMemberName, setNewMemberName] = useState('');
    const [activeGroupId, setActiveGroupId] = useState(null);

    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const fileInputRef = useRef(null);

    const [isEditingAccountInfo, setIsEditingAccountInfo] = useState(false);
    const [accountEditFormData, setAccountEditFormData] = useState({
        username: '',
        newPassword: '',
        currentPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const handleEditBasicInfo = () => {
        setEditFormData({ ...user });
        setIsEditingBasicInfo(true);
    };

    const handleSaveBasicInfo = () => {
        updateUser(editFormData);
        setIsEditingBasicInfo(false);
    };

    const handleCancelBasicInfo = () => {
        setIsEditingBasicInfo(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData((prev) => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        setEditFormData((prev) => ({ ...prev, profilePicture: null }));
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleEditAccountInfo = () => {
        setAccountEditFormData({
            username: user.username,
            newPassword: '',
            currentPassword: ''
        });
        setPasswordError('');
        setIsEditingAccountInfo(true);
    };

    const handleSaveAccountInfo = () => {
        // Validate current password if trying to change password
        if (accountEditFormData.newPassword) {
            if (!accountEditFormData.currentPassword) {
                setPasswordError('Please enter your current password to change it');
                return;
            }
            if (accountEditFormData.currentPassword !== user.password) {
                setPasswordError('Current password is incorrect');
                return;
            }
        }

        // Update user with new username and/or password
        const updatedData = {
            username: accountEditFormData.username
        };

        // Only update password if a new one was provided
        if (accountEditFormData.newPassword) {
            updatedData.password = accountEditFormData.newPassword;
        }

        updateUser(updatedData);
        setIsEditingAccountInfo(false);
        setPasswordError('');
    };

    const handleCancelAccountInfo = () => {
        setIsEditingAccountInfo(false);
        setPasswordError('');
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            createGroup(newGroupName);
            setNewGroupName('');
        }
    };

    const handleJoinGroup = (e) => {
        e.preventDefault();
        if (joinCode.trim()) {
            joinGroup(joinCode);
            setJoinCode('');
        }
    };

    const handleAddMember = (groupId) => {
        if (newMemberName.trim()) {
            addGroupMember(groupId, newMemberName);
            setNewMemberName('');
            setActiveGroupId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Settings</h1>
            </div>

            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account Settings
                </button>
                <button
                    className={`settings-tab ${activeTab === 'group' ? 'active' : ''}`}
                    onClick={() => setActiveTab('group')}
                >
                    Group Management
                </button>
            </div>

            {activeTab === 'group' && (
                <div className="settings-content">
                    <div className="settings-card pink-bg">
                        <div className="card-header-icon">
                            <span className="icon">👥</span>
                            <h3>Join Existing Group</h3>
                        </div>
                        <p className="card-description">Enter a room code to join an existing group</p>
                        <form onSubmit={handleJoinGroup} className="settings-form-row">
                            <input
                                type="text"
                                placeholder="Enter room code (e.g., ROOM123)"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="settings-input"
                            />
                            <button type="submit" className="settings-button primary">Join Group</button>
                        </form>
                    </div>

                    <div className="settings-card pink-bg">
                        <h3>Create New Group</h3>
                        <p className="card-description">Group Name</p>
                        <form onSubmit={handleCreateGroup} className="settings-form-row">
                            <input
                                type="text"
                                placeholder="e.g., Apartment 4B"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="settings-input"
                            />
                            <button type="submit" className="settings-button primary">Create Group</button>
                        </form>
                    </div>

                    <h2 className="section-title">My Groups</h2>
                    {groups && groups.length > 0 ? (
                        groups.map((group) => (
                            <div key={group.id} className="settings-card pink-bg group-card">
                                <div className="group-header">
                                    <div>
                                        <h3>{group.name}</h3>
                                        <p className="member-count">{group.members.length} members</p>
                                    </div>
                                    <div className="group-actions-top">
                                        <span className="room-code">{group.code}</span>
                                        <button className="icon-button copy-button">❐</button>
                                    </div>
                                </div>

                                <div className="members-list">
                                    {group.members.map((member) => (
                                        <div key={member.id} className="member-item">
                                            <span>{member.name}</span>
                                            <button
                                                className="icon-button delete-button"
                                                onClick={() => removeGroupMember(group.id, member.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="add-member-section">
                                    <p className="card-description">Add Member</p>
                                    <div className="settings-form-row">
                                        <input
                                            type="text"
                                            placeholder="Enter Member Name"
                                            value={activeGroupId === group.id ? newMemberName : ''}
                                            onChange={(e) => {
                                                setActiveGroupId(group.id);
                                                setNewMemberName(e.target.value);
                                            }}
                                            className="settings-input"
                                        />
                                        <button
                                            className="settings-button primary"
                                            onClick={() => handleAddMember(group.id)}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>

                                <div className="group-footer-actions">
                                    <button className="settings-button white" onClick={() => alert('Save functionality to be implemented')}>Save</button>
                                    <button className="settings-button secondary" onClick={() => deleteGroup(group.id)}>Delete Group</button>
                                    <button className="settings-button danger" onClick={() => leaveGroup(group.id)}>Leave Group</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-groups-message">You are not part of any groups yet.</p>
                    )}
                </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
                <div className="settings-content">
                    {/* Basic Info */}
                    <div className="settings-card pink-bg">
                        <h3>Basic info</h3>
                        <div className="profile-picture-section">
                            <div className="profile-label">Profile Picture</div>
                            <div className="profile-picture-controls">
                                {isEditingBasicInfo ? (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        {editFormData.profilePicture ? (
                                            <img src={editFormData.profilePicture} alt="Profile" className="profile-picture-circle large" />
                                        ) : (
                                            <div className="profile-picture-circle large"></div>
                                        )}
                                        <div className="profile-picture-actions">
                                            <span className="upload-text" onClick={triggerFileUpload}>Upload profile picture</span>
                                            <span className="remove-text" onClick={handleRemoveProfilePicture}>Remove</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="Profile" className="profile-picture-circle large" />
                                        ) : (
                                            <div className="profile-picture-circle large"></div>
                                        )}
                                        <div className="profile-picture-actions">
                                            <span className="upload-text" style={{ opacity: 0.5, cursor: 'default' }}>Upload profile picture</span>
                                            <span className="remove-text" style={{ opacity: 0.5, cursor: 'default' }}>Remove</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <hr className="divider" />
                        {isEditingBasicInfo ? (
                            <div className="edit-form-grid">
                                <div className="info-row">
                                    <span className="info-label">Name</span>
                                    <input
                                        type="text"
                                        className="settings-input"
                                        value={editFormData.fullName || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date of Birth</span>
                                    <input
                                        type="date"
                                        className="settings-input"
                                        value={editFormData.dateOfBirth || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Gender</span>
                                    <select
                                        className="settings-input"
                                        value={editFormData.gender || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <input
                                        type="email"
                                        className="settings-input"
                                        value={editFormData.email || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    />
                                </div>
                                <hr className="divider" />
                                <div className="form-actions">
                                    <button className="settings-button white" onClick={handleCancelBasicInfo}>Cancel</button>
                                    <button className="settings-button primary" onClick={handleSaveBasicInfo}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Name</span>
                                    <span className="info-value">{user.fullName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date of Birth</span>
                                    <span className="info-value">{new Date(user.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Gender</span>
                                    <span className="info-value">{user.gender}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{user.email}</span>
                                </div>
                                <hr className="divider" />
                                <button className="settings-button white full-width" onClick={handleEditBasicInfo}>Edit</button>
                            </>
                        )}
                    </div>

                    {/* Account Info */}
                    <div className="settings-card pink-bg">
                        <h3>Account info</h3>
                        {isEditingAccountInfo ? (
                            <div className="edit-form-grid">
                                <div className="info-row">
                                    <span className="info-label">Username</span>
                                    <input
                                        type="text"
                                        className="settings-input"
                                        value={accountEditFormData.username || ''}
                                        onChange={(e) => setAccountEditFormData({ ...accountEditFormData, username: e.target.value })}
                                    />
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Current Password</span>
                                    <input
                                        type="password"
                                        className="settings-input"
                                        placeholder="Enter current password to change password"
                                        value={accountEditFormData.currentPassword || ''}
                                        onChange={(e) => {
                                            setAccountEditFormData({ ...accountEditFormData, currentPassword: e.target.value });
                                            setPasswordError('');
                                        }}
                                    />
                                </div>
                                <div className="info-row">
                                    <span className="info-label">New Password</span>
                                    <input
                                        type="password"
                                        className="settings-input"
                                        placeholder="Leave empty to keep current password"
                                        value={accountEditFormData.newPassword || ''}
                                        onChange={(e) => {
                                            setAccountEditFormData({ ...accountEditFormData, newPassword: e.target.value });
                                            setPasswordError('');
                                        }}
                                    />
                                </div>
                                {passwordError && (
                                    <div className="error-message" style={{ color: 'red', marginTop: '-10px', marginBottom: '10px' }}>
                                        {passwordError}
                                    </div>
                                )}
                                <hr className="divider" />
                                <div className="form-actions">
                                    <button className="settings-button white" onClick={handleCancelAccountInfo}>Cancel</button>
                                    <button className="settings-button primary" onClick={handleSaveAccountInfo}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Username</span>
                                    <span className="info-value">{user.username}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Password</span>
                                    <span className="info-value">••••••••••</span>
                                </div>
                                <hr className="divider" />
                                <button className="settings-button white full-width" onClick={handleEditAccountInfo}>Edit</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
