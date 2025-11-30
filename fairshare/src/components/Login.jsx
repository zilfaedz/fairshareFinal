import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Toast from './Toast';

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
    <div className="auth-container">
      <Toast message={toastMessage} onClose={hideToast} />
      <div className="logo-container">
        <div className="logo-circle"></div>
        <h1 className="app-title">FairShare</h1>
      </div>
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        {errors.form && <div className="error-message global-error">{errors.form}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
                if (errors.form) setErrors({ ...errors, form: '' });
              }}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
                if (errors.form) setErrors({ ...errors, form: '' });
              }}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
