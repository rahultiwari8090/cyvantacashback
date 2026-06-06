import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';
import { apiUsers } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (activeTab === 'login') {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      // Call backend login API
      apiUsers.login(email, password)
        .then((userData) => {
          localStorage.setItem('user_session', JSON.stringify(userData));
          localStorage.setItem('is_admin', 'false');
          onLogin(userData);
          onClose();
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Login failed. Please try again.');
          setLoading(false);
        });
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      // Call backend register API
      apiUsers.register(name, email, password)
        .then((userData) => {
          localStorage.setItem('user_session', JSON.stringify(userData));
          localStorage.setItem('is_admin', 'false');
          onLogin(userData);
          onClose();
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Registration failed. Please try again.');
          setLoading(false);
        });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Log In
          </div>
          <div
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setError('');
            }}
          >
            Sign Up
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px',
            marginBottom: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '4px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'signup' && (
            <div className="form-group animate-fade">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.5,
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.5,
                }}
              />
              <input
                type="email"
                placeholder="Enter email address"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.5,
                }}
              />
              <input
                type="password"
                placeholder="Enter secure password"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (activeTab === 'login' ? 'Continue & Claim Cashback' : 'Join Now & Get ₹5.00 Bonus')}
          </button>

          <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', color: 'var(--text)' }}>
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
