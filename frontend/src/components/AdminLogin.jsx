import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { apiUsers } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onAddNotification, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminConfig, setAdminConfig] = useState(null);

  // Load admin config from backend on mount
  useEffect(() => {
    fetchAdminConfig();
    
    // Load saved email
    const savedEmail = localStorage.getItem('remember_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Fetch admin configuration from backend
  const fetchAdminConfig = async () => {
    try {
      // GET /api/admin/config - Returns admin email hint
      const response = await fetch('http://localhost:8080/api/admin/config');
      const data = await response.json();
      setAdminConfig(data);
    } catch (error) {
      console.log('Admin config not available, using default');
    }
  };

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

    // Call backend API for admin login
    apiUsers.adminLogin(email, password)
      .then((adminUser) => {
        if (rememberMe) {
          localStorage.setItem('remember_admin_email', email);
        } else {
          localStorage.removeItem('remember_admin_email');
        }
        
        // Store admin session
        localStorage.setItem('admin_session', JSON.stringify(adminUser));
        localStorage.setItem('is_admin', 'true');
        
        onAddNotification('Admin authentication successful! Access granted.', 'success');
        onLoginSuccess(adminUser);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Admin login error:', error);
        setError(error.message || 'Invalid admin credentials. Please try again.');
        onAddNotification('Authentication failed: ' + (error.message || 'Incorrect email or password.'), 'error');
        setLoading(false);
      });
  };

  const handleForgot = () => {
    onAddNotification('Contact super admin for password reset.', 'info');
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
              placeholder={adminConfig?.emailHint || "Admin Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="admin-login-input-wrapper">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
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

        {/* Admin Credentials Hint from Backend */}
        {adminConfig && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: '#1f2937', 
            borderRadius: '8px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>Admin Credentials:</p>
            <p style={{ margin: '0' }}>Email: <code style={{ color: '#60a5fa' }}>{adminConfig.adminEmail}</code></p>
            <p style={{ margin: '4px 0 0 0' }}>Password: <code style={{ color: '#60a5fa' }}>{adminConfig.adminPassword}</code></p>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
              (Credentials stored securely in backend MongoDB)
            </p>
          </div>
        )}

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