import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

const UserProfile = () => {
    const { user, updateUser } = useAppData();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profilePicture: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || user.fullName, // Handle both naming conventions
                email: user.email,
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Map name back to fullName if needed by backend, or keep as is if context handles it
        updateUser({
            ...formData,
            fullName: formData.name // Ensure backend gets 'fullName'
        });
        setIsEditing(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>User Profile</h1>
                {!isEditing && (
                    <button className="add-button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {formData.profilePicture ? (
                            <img src={formData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#ccc', borderRadius: '50%' }}></div>
                        )}
                    </div>
                    {!isEditing ? (
                        <div className="profile-info-display">
                            <h2>{user.name || user.fullName}</h2>
                            <p>{user.email}</p>
                        </div>
                    ) : (
                        <div className="profile-edit-form">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="modal-submit-button">Save Changes</button>
                                    <button
                                        type="button"
                                        className="action-button cancel"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: user.name || user.fullName,
                                                email: user.email,
                                                profilePicture: user.profilePicture || ''
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
