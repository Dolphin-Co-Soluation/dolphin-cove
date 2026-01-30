import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Code, Waves } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logo from '../../assets/Dolphin-cove.png';
import './Auth.css';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isFreelancer: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.displayName || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      showError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      showError('Password must be at least 6 characters');
      return;
    }

    const success = await register({
      displayName: formData.displayName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      isFreelancer: formData.isFreelancer,
    });

    if (success) {
      showSuccess('Account created successfully! Welcome aboard 🐬');
      navigate('/home');
    } else {
      setError('Registration failed. Please try again.');
      showError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
        <div className="bubbles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="bubble" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}></div>
          ))}
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card register-card">
          {/* Logo & Header */}
          <div className="auth-header">
            <img src={logo} alt="Dolphin Cove" className="auth-logo" />
            <h1>Join the Pod!</h1>
            <p>Start your journey in the freelance ocean</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="displayName">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    placeholder="Enter your full name"
                    value={formData.displayName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon at-symbol">@</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Freelancer Toggle */}
            <div className="freelancer-toggle">
              <div className="toggle-content">
                <Code size={20} className="toggle-icon" />
                <div className="toggle-text">
                  <h4>I'm a Freelancer</h4>
                  <p>Enable this to showcase your skills and receive job offers</p>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  name="isFreelancer"
                  checked={formData.isFreelancer}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <Waves size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Dive in 🌊</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
