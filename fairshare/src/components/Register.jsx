import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { User, Mail, Lock, Shield, ArrowLeft } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { register } = useAppData();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email must contain @ and a valid domain';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const result = await register(fullName, email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ form: result.message });
        }
    };

    return (
        <div className="modern-auth-container">
            {/* Left Side: Visual Brand Experience */}
            <div className="auth-visual">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>

                <div className="visual-content">
                    <div className="brand-section">
                        <h1 className="brand-name">FairShare</h1>
                        <p className="brand-tagline">Join our community today.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="auth-form-section">
                <div className="form-wrapper-modern">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    <div className="form-header">
                        <h2 className="form-title-modern">Create Account</h2>
                        <p className="form-subtitle">Get started with your free account.</p>
                    </div>

                    {errors.form && (
                        <div className="messages-modern">
                            <div className="alert-modern error">
                                <div className="alert-icon"><Shield size={16} /></div>
                                <span>{errors.form}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="modern-form">
                        <div className="input-group-modern">
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                                    if (errors.form) setErrors({ ...errors, form: '' });
                                }}
                                placeholder=" "
                            />
                            <label htmlFor="fullName">Full Name</label>
                            <div className="input-icon-left">
                                <User size={20} />
                            </div>
                        </div>
                        {errors.fullName && <div className="error-message-inline">{errors.fullName}</div>}

                        <div className="input-group-modern">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                    if (errors.form) setErrors({ ...errors, form: '' });
                                }}
                                placeholder=" "
                            />
                            <label htmlFor="email">Email Address</label>
                            <div className="input-icon-left">
                                <Mail size={20} />
                            </div>
                        </div>
                        {errors.email && <div className="error-message-inline">{errors.email}</div>}

                        <div className="input-group-modern">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                    if (errors.form) setErrors({ ...errors, form: '' });
                                }}
                                placeholder=" "
                            />
                            <label htmlFor="password">Password</label>
                            <div className="input-icon-left">
                                <Lock size={20} />
                            </div>
                        </div>
                        {errors.password && <div className="error-message-inline">{errors.password}</div>}

                        <div className="input-group-modern">
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                    if (errors.form) setErrors({ ...errors, form: '' });
                                }}
                                placeholder=" "
                            />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-icon-left">
                                <Lock size={20} />
                            </div>
                        </div>
                        {errors.confirmPassword && <div className="error-message-inline">{errors.confirmPassword}</div>}

                        <div className="terms-modern">
                            <label className="checkbox-modern">
                                <input type="checkbox" required />
                                <div className="checkbox-custom"></div>
                                <span className="checkbox-label">
                                    I agree to the <Link to="/terms" className="link-primary">Terms of Service</Link> and <Link to="/privacy" className="link-primary">Privacy Policy</Link>
                                </span>
                            </label>
                        </div>

                        <button type="submit" className="btn-primary-full">
                            <span className="btn-text">Create Account</span>
                        </button>
                    </form>

                    <div className="form-footer" style={{marginTop: '20px'}}>
                        <p>Already have an account? <Link to="/login" className="link-primary-bold">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;