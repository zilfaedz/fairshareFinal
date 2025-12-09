import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Toast from './Toast';
import { Mail, Lock, Shield, ArrowLeft } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast, toastMessage, hideToast } = useAppData();

  // Get the redirect path from location state, or default to /dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      if (result.message === "This account doesn’t exist. Please Sign Up first.") {
        showToast(result.message);
        setErrors({ form: '' }); // Clear any existing form errors
      } else {
        setErrors({ form: result.message });
      }
    }
  };

  return (
    <div className="modern-auth-container">
      <Toast message={toastMessage} onClose={hideToast} />

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
            <p className="brand-tagline">Simplify your shared living experience.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-form-section">
        <div className="form-wrapper-modern">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="form-header">
            <h2 className="form-title-modern">Welcome back! 👋</h2>
            <p className="form-subtitle">Enter your credentials to continue your academic journey</p>
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

            <div className="form-options" style={{ justifyContent: 'flex-start' }}>
              <Link to="/forgot-password" className="link-primary">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-primary-full">
              <span className="btn-text">Sign In</span>
            </button>
          </form>

          <div className="form-footer" style={{marginTop: '20px'}}>
            <p>Don't have an account? <Link to="/register" className="link-primary-bold">Create account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;