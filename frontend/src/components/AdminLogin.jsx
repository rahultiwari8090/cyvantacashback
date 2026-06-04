import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onAddNotification, setView }) {
  const [email, setEmail] = useState('admin@cyvanta.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (email === 'admin@cyvanta.com' && password === 'admin123') {
        if (rememberMe) {
          localStorage.setItem('remember_admin_email', email);
        } else {
          localStorage.removeItem('remember_admin_email');
        }
        onAddNotification('Admin authentication successful! Access granted.', 'success');
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. Please try again.');
        onAddNotification('Authentication failed: Incorrect email or password.', 'error');
      }
      setLoading(false);
    }, 1000);
  };

  const handleForgot = () => {
    onAddNotification('Password reset link has been dispatched to admin mailbox.', 'info');
  };

  return (
    <div className="admin-login-layout animate-fade">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">C</div>
          <h2>Admin Console</h2>
          <p>Sign in to manage Cyvanta rewards & catalog</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="admin-login-input-wrapper">
            <Mail size={18} />
            <input
              type="text"
              placeholder="Admin Email (admin@cyvanta.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="admin-login-input-wrapper">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Admin Password (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-6px', marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              Remember Me
            </label>
            <span className="admin-login-forgot-btn" onClick={handleForgot} style={{ fontSize: '12px', color: '#9ca3af', cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => setView('home')}
            style={{ color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
}
