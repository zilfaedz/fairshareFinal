import React, { useState, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { User, Users, LogOut, Trash2, Copy, Camera, X, UserPlus, Crown } from 'lucide-react';

const Settings = () => {
    const {
        user,
        updateUser,
        updateGroup,
        groups,
        createGroup,
        joinGroup,
        deleteGroup,
        leaveGroup,
        transferOwnership,

        removeGroupMember,
        sendInvite
    } = useAppData();

    const [activeTab, setActiveTab] = useState('account');
    const [joinCode, setJoinCode] = useState('');
    const [newGroupName, setNewGroupName] = useState('');


    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const fileInputRef = useRef(null);

    const [isEditingAccountInfo, setIsEditingAccountInfo] = useState(false);
    const [accountEditFormData, setAccountEditFormData] = useState({
        email: user?.email || '',
        newPassword: '',
        currentPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const { showToast } = useAppData();

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
                if (isEditingBasicInfo) {
                    setEditFormData((prev) => ({ ...prev, profilePicture: reader.result }));
                } else {
                    updateUser({ profilePicture: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        if (isEditingBasicInfo) {
            setEditFormData((prev) => ({ ...prev, profilePicture: "" }));
        } else {
            updateUser({ profilePicture: "" });
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleEditAccountInfo = () => {
        setAccountEditFormData({
            newPassword: '',
            currentPassword: ''
        });
        setPasswordError('');
        setIsEditingAccountInfo(true);
    };

    const handleSaveAccountInfo = () => {
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

        const updatedData = {};

        if (accountEditFormData.email && accountEditFormData.email !== user.email) {
            updatedData.email = accountEditFormData.email;
        }

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



    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Code copied to clipboard!");
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editedGroupName, setEditedGroupName] = useState('');

    const handleEditGroup = (group) => {
        setEditingGroupId(group.id);
        setEditedGroupName(group.name);
    };

    const handleSaveGroup = async (groupId) => {
        if (editedGroupName.trim()) {
            const result = await updateGroup(groupId, editedGroupName);
            if (result.success) {
                setEditingGroupId(null);
            }
        }
    };

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'delete' or 'transfer'
        group: null,
        member: null
    });

    const handleCancelEditGroup = () => {
        setEditingGroupId(null);
        setEditedGroupName('');
    };

    const handleDeleteGroupAttempt = (group) => {
        if (group.owner && group.owner.id !== user.id) {
            showToast("Only the group owner can delete this group.");
            return;
        }
        setModalConfig({
            isOpen: true,
            type: 'delete',
            group: group,
            member: null
        });
    };

    const handleMemberClick = (group, member) => {
        if (!group.owner || group.owner.id !== user.id) return; // Only owner can transfer
        if (member.id === user.id) return; // Can't transfer to self

        setModalConfig({
            isOpen: true,
            type: 'transfer',
            group: group,
            member: member
        });
    };

    const handleLeaveGroupAttempt = (group) => {
        if (group.owner && group.owner.id === user.id) {
            showToast("You must transfer ownership before leaving the group.");
            return;
        }
        setModalConfig({
            isOpen: true,
            type: 'leave',
            group: group,
            member: null
        });
    };

    const handleCloseModal = () => {
        setModalConfig({ isOpen: false, type: null, group: null, member: null });
    };

    const handleConfirmAction = () => {
        const { type, group, member } = modalConfig;
        if (type === 'delete' && group) {
            deleteGroup(group.id);
        } else if (type === 'transfer' && group && member) {
            transferOwnership(group.id, member.id);
        } else if (type === 'leave' && group) {
            leaveGroup(group.id);
        } else if (type === 'removeMember' && group && member) {
            removeGroupMember(group.id, member.id);
        }
        handleCloseModal();
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
                    {(!groups || groups.length === 0) && (
                        <>
                            <div className="settings-card pink-bg">
                                <div className="card-header-icon">
                                    <Users size={24} className="icon" />
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
                                <div className="card-header-icon">
                                    <UserPlus size={24} className="icon" />
                                    <h3>Create New Group</h3>
                                </div>
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
                        </>
                    )}

                    <h2 className="section-title">My Groups</h2>
                    {groups && groups.length > 0 ? (
                        groups.map((group) => {
                            console.log("Group render:", group); // Debug logging
                            return (
                                <div key={group.id} className="settings-card pink-bg group-card">
                                    <div className="group-header">
                                        <div style={{ flex: 1 }}>
                                            {editingGroupId === group.id ? (
                                                <input
                                                    type="text"
                                                    value={editedGroupName}
                                                    onChange={(e) => setEditedGroupName(e.target.value)}
                                                    className="settings-input"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3>{group.name}</h3>
                                            )}
                                            <p className="member-count">{group.members ? group.members.length : 0} members</p>
                                        </div>
                                        <div className="group-actions-top">
                                            <div className="invite-section" style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                                                <input
                                                    type="email"
                                                    placeholder="Invite by email"
                                                    className="settings-input compact"
                                                    style={{ width: '200px', margin: 0 }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const email = e.target.value;
                                                            if (email && email.trim()) {
                                                                sendInvite(group.id, email);
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button className="settings-button primary small" onClick={(e) => {
                                                    const input = e.currentTarget.previousSibling;
                                                    const email = input.value;
                                                    if (email && email.trim()) {
                                                        sendInvite(group.id, email);
                                                        input.value = '';
                                                    }
                                                }}>Invite</button>
                                            </div>
                                            <span className="room-code">{group.code}</span>
                                            <button className="icon-button copy-button" onClick={() => copyToClipboard(group.code)}>
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="members-list">
                                        {group.members && group.members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="member-item"
                                                onClick={() => handleMemberClick(group, member)}
                                                style={{ cursor: (group.owner && group.owner.id === user.id && member.id !== user.id) ? 'pointer' : 'default' }}
                                                title={(group.owner && group.owner.id === user.id && member.id !== user.id) ? "Click to transfer ownership" : ""}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {member.fullName || member.name}
                                                    {group.owner && group.owner.id === member.id && <Crown size={14} color="#FFD700" fill="#FFD700" />}
                                                </span>
                                                {/* Only show delete button if current user is owner AND ensuring they don't delete themselves here (leave group instead) */}
                                                {group.owner && group.owner.id === user.id && member.id !== user.id && (
                                                    <button
                                                        className="icon-button delete-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setModalConfig({
                                                                isOpen: true,
                                                                type: 'removeMember',
                                                                group: group,
                                                                member: member
                                                            });
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>


                                    <div className="group-footer-actions">
                                        {editingGroupId === group.id ? (
                                            <>
                                                <button className="settings-button white" onClick={handleCancelEditGroup}>Cancel</button>
                                                <button className="settings-button primary" onClick={() => handleSaveGroup(group.id)}>Save</button>
                                            </>
                                        ) : (
                                            <button className="settings-button white" onClick={() => handleEditGroup(group)}>Edit Name</button>
                                        )}
                                        <button
                                            className="settings-button secondary"
                                            onClick={() => handleDeleteGroupAttempt(group)}
                                            style={group.owner && group.owner.id !== user.id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        >Delete Group</button>
                                        <button
                                            className="settings-button danger"
                                            onClick={() => handleLeaveGroupAttempt(group)}
                                        >Leave Group</button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-groups-message">You are not part of any groups yet.</p>
                    )}
                </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
                <div className="settings-content">
                    {/* Profile Picture Card on top */}
                    <div className="settings-card pink-bg profile-compact">
                        <h3>Profile Picture</h3>
                        <div className="profile-picture-section">
                            <div className="profile-label">Profile Picture</div>
                            <div className="profile-picture-controls">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {(isEditingBasicInfo ? editFormData.profilePicture : user.profilePicture) ? (
                                    <img
                                        src={isEditingBasicInfo ? editFormData.profilePicture : user.profilePicture}
                                        alt="Profile"
                                        className="profile-picture-circle compact"
                                    />
                                ) : (
                                    <div className="profile-picture-circle compact"></div>
                                )}
                                <div className="profile-picture-actions">
                                    <span className="upload-text" onClick={triggerFileUpload} style={{ cursor: 'pointer', opacity: 1 }}>Upload profile picture</span>
                                    <span className="remove-text" onClick={handleRemoveProfilePicture} style={{ cursor: 'pointer', opacity: 1 }}>Remove</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two-column grid: Basic info left, Account info right */}
                    <div className="settings-content settings-grid-two">
                        {/* Basic Info */}
                        <div className="settings-card pink-bg">
                            <h3>Basic info</h3>
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
                                            value={editFormData.birthdate || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, birthdate: e.target.value })}
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Gender</span>
                                        <select
                                            className="settings-input"
                                            value={editFormData.gender || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
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
                                        <span className="info-value">{user.birthdate ? new Date(user.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Set birthday'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Gender</span>
                                        <span className="info-value">{user.gender || 'Set gender'}</span>
                                    </div>
                                    <hr className="divider" />
                                    <button className="settings-button white full-width" onClick={handleEditBasicInfo}>Edit</button>
                                </>
                            )}
                        </div>

                        <div className="settings-card pink-bg">
                            <h3>Account info</h3>
                            {isEditingAccountInfo ? (
                                <div className="edit-form-grid">
                                    <div className="info-row">
                                        <span className="info-label">Email</span>
                                        <input
                                            type="email"
                                            className="settings-input"
                                            placeholder="Enter email"
                                            value={accountEditFormData.email || ''}
                                            onChange={(e) => {
                                                setAccountEditFormData({ ...accountEditFormData, email: e.target.value });
                                            }}
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
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{user.email}</span>
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
                </div>
            )}
            {/* Modal */}
            {modalConfig.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                {modalConfig.type === 'delete' ? 'Delete Group' :
                                    modalConfig.type === 'leave' ? 'Leave Group' :
                                        modalConfig.type === 'removeMember' ? 'Remove Member' : 'Transfer Ownership'}
                            </h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ margin: '20px 0', fontSize: '15px' }}>
                            {modalConfig.type === 'delete' ? (
                                <p>Are you sure you want to delete "<b>{modalConfig.group?.name}</b>"? This cannot be undone.</p>
                            ) : modalConfig.type === 'leave' ? (
                                <p>Are you sure you want to leave "<b>{modalConfig.group?.name}</b>"?</p>
                            ) : modalConfig.type === 'removeMember' ? (
                                <p>Are you sure you want to remove <b>{modalConfig.member?.fullName || modalConfig.member?.name}</b> from "<b>{modalConfig.group?.name}</b>"?</p>
                            ) : (
                                <p>Do you want to transfer ownership of "<b>{modalConfig.group?.name}</b>" to <b>{modalConfig.member?.fullName || modalConfig.member?.name}</b>?</p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className={`action-button ${['delete', 'leave', 'removeMember'].includes(modalConfig.type) ? 'delete' : ''}`}
                                style={!['delete', 'leave', 'removeMember'].includes(modalConfig.type) ? { backgroundColor: 'var(--primary-pink)', color: 'white' } : { backgroundColor: '#d93025', color: 'white' }}
                                onClick={handleConfirmAction}
                            >
                                {modalConfig.type === 'delete' ? 'Delete' :
                                    modalConfig.type === 'leave' ? 'Leave' :
                                        modalConfig.type === 'removeMember' ? 'Remove' : 'Transfer'}
                            </button>
                            <button className="action-button cancel" onClick={handleCloseModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
