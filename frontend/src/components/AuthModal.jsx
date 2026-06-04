import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
      if (!email || !password) return;
      onLogin({
        name: email.split('@')[0],
        email: email,
        wallet: { confirmed: 250.0, pending: 120.0, referral: 75.0 },
      });
    } else {
      if (!name || !email || !password) return;
      onLogin({
        name: name,
        email: email,
        wallet: { confirmed: 0.0, pending: 50.0, referral: 0.0 }, // New signup bonus!
      });
    }
    onClose();
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
            onClick={() => setActiveTab('login')}
          >
            Log In
          </div>
          <div
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </div>
        </div>

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
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit">
            {activeTab === 'login' ? 'Continue & Claim Cashback' : 'Join Now & Get ₹5.00 Bonus'}
          </button>

          <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', color: 'var(--text)' }}>
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
