import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { apiUsers, BASE_URL } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onAddNotification, setView }) {
  const [authStep, setAuthStep] = useState('details');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingIdentifier, setPendingIdentifier] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminConfig, setAdminConfig] = useState(null);

  // Load admin config from backend on mount
  useEffect(() => {
    fetchAdminConfig();
    
    // Load saved identifier
    const savedIdentifier = localStorage.getItem('remember_admin_email');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Fetch admin configuration from backend
  const fetchAdminConfig = async () => {
    try {
      // GET /api/admin/config - Returns admin email hint
      const response = await fetch(`${BASE_URL}/admin/config`);
      const data = await response.json();
      setAdminConfig(data);
    } catch (error) {
      console.log('Admin config not available, using default');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (authStep === 'details') {
      if (!identifier || !password) {
        setError('Please fill in all fields.');
        return;
      }

      setLoading(true);

      apiUsers.adminLogin(identifier, password)
        .then((adminUser) => {
          if (rememberMe) {
            localStorage.setItem('remember_admin_email', identifier);
          } else {
            localStorage.removeItem('remember_admin_email');
          }

          localStorage.setItem('admin_session', JSON.stringify(adminUser));
          localStorage.setItem('is_admin', 'true');

          onAddNotification('Admin authentication successful! Access granted.', 'success');
          onLoginSuccess(adminUser);
          setLoading(false);
        })
        .catch((error) => {
          if (error.requireOtp) {
            setAuthStep('otp');
            setPendingIdentifier(identifier);
            setSuccessMessage(error.message || 'Please verify your email or phone to continue.');
            setLoading(false);
            return;
          }

          console.error('Admin login error:', error);
          setError(error.message || 'Invalid admin credentials. Please try again.');
          onAddNotification('Authentication failed: ' + (error.message || 'Incorrect identifier or password.'), 'error');
          setLoading(false);
        });
    } else {
      if (!otp || otp.length < 6) {
        setError('Please enter the 6-digit OTP.');
        return;
      }

      if (!pendingIdentifier) {
        setError('Missing identifier for OTP verification. Please restart login.');
        return;
      }

      setLoading(true);

      apiUsers.verifyOtp(pendingIdentifier, otp)
        .then((adminUser) => {
          localStorage.setItem('admin_session', JSON.stringify(adminUser));
          localStorage.setItem('is_admin', 'true');
          if (rememberMe) {
            localStorage.setItem('remember_admin_email', pendingIdentifier);
          }

          onAddNotification('Admin verified successfully! Access granted.', 'success');
          onLoginSuccess(adminUser);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Admin OTP verification error:', error);
          setError(error.message || 'OTP verification failed.');
          setLoading(false);
        });
    }
  };

  const handleForgot = () => {
    onAddNotification('Contact super admin for password reset.', 'info');
  };

  return (
    <div className="admin-login-layout animate-fade">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src="/logo.webp" alt="Lio Mart Logo" style={{ width: '48px', height: '48px', margin: '0 auto 12px', display: 'block', objectFit: 'contain' }} />
          <h2>LIO MART Admin</h2>
          <p>Sign in to manage LIO MART rewards & catalog</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {authStep === 'details' ? (
            <>
              <div className="admin-login-input-wrapper">
                <Mail size={18} />
                <input
                  type="text"
                  placeholder={adminConfig?.emailHint || "Admin Email or Mobile"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
            </>
          ) : (
            <>
              <div className="admin-login-input-wrapper">
                <Mail size={18} />
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email or mobile"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {authStep === 'details' ? (
            <>
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
            </>
          ) : (
            <>
              <button type="submit" className="admin-login-btn" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
              </button>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('details');
                    setOtp('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    apiUsers.resendOtp(pendingIdentifier)
                      .then((res) => setSuccessMessage(res.message || 'OTP resent successfully.'))
                      .catch((err) => setError(err.message || 'Failed to resend OTP.'));
                  }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </form>

        {/* Admin Credentials Hint from Backend */}
        {adminConfig && authStep === 'details' && (
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