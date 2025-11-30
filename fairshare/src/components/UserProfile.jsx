import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

const UserProfile = () => {
    const { user, updateUser } = useAppData();
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email
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

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUser(formData);
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
                    <div className="profile-avatar-large"></div>
                    {!isEditing ? (
                        <div className="profile-info-display">
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                    ) : (
                        <div className="profile-edit-form">
                            <form onSubmit={handleSubmit}>
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
                                            setFormData({ name: user.name, email: user.email });
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
