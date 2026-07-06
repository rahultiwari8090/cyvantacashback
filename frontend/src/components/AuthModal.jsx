import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { apiUsers } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [authStep, setAuthStep] = useState('details'); // 'details' or 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetState = (tab) => {
    setActiveTab(tab);
    setAuthStep('details');
    setError('');
    setSuccessMessage('');
    setOtp('');
    setIdentifier('');
    setPassword('');
    setName('');
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setSuccessMessage('Connecting... If the free server is asleep, this may take up to 2 minutes. Please wait.');

    if (activeTab === 'login') {
      if (!identifier || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      apiUsers.login(identifier, password)
        .then((res) => {
          if (res.requireOtp) {
            setAuthStep('otp');
            setSuccessMessage(res.message || 'Please verify your email or phone.');
            setLoading(false);
            return;
          }
          localStorage.setItem('user_session', JSON.stringify(res));
          localStorage.setItem('is_admin', 'false');
          onLogin(res);
          onClose();
          setLoading(false);
        })
        .catch((err) => {
          if (err.requireOtp || err.message?.toLowerCase().includes('verify')) {
            setAuthStep('otp');
            setSuccessMessage('Please verify your email or phone.');
            // Auto resend OTP so they get a fresh one
            apiUsers.resendOtp(identifier)
              .then((res) => {
                setSuccessMessage(res.message || 'Please verify your email or phone.');
              })
              .catch(console.error);
          } else {
            const msg = (err.message === 'Failed to fetch' || err.name === 'TypeError')
              ? 'Unable to reach server. The free server is starting up — please try again in a minute or two.'
              : (err.message || 'Login failed. Please try again.');
            setError(msg);
            setSuccessMessage('');
          }
          setLoading(false);
        });
    } else {
      if (!name || !identifier || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      apiUsers.register(name, identifier, password)
        .then((res) => {
          if (res.requireOtp) {
            setAuthStep('otp');
            setSuccessMessage(res.message || 'OTP sent to your email or phone.');
            setLoading(false);
            return;
          }
          localStorage.setItem('user_session', JSON.stringify(res));
          localStorage.setItem('is_admin', 'false');
          onLogin(res);
          onClose();
          setLoading(false);
        })
        .catch((err) => {
          if (err.requireOtp) {
            setAuthStep('otp');
            setSuccessMessage(err.message || 'OTP sent to your email or phone.');
          } else {
            const msg = (err.message === 'Failed to fetch' || err.name === 'TypeError')
              ? 'Unable to reach server. The free server is starting up — please try again in a minute or two.'
              : (err.message || 'Registration failed. Please try again.');
            setError(msg);
            setSuccessMessage('');
          }
          setLoading(false);
        });
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP from your SMS');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    apiUsers.verifyOtp(identifier, otp)
      .then((userData) => {
        localStorage.setItem('user_session', JSON.stringify(userData));
        localStorage.setItem('is_admin', 'false');
        onLogin(userData);
        onClose();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Invalid OTP code.');
        setLoading(false);
      });
  };

  const handleResendOtp = () => {
    setError('');
    setSuccessMessage('');
    apiUsers.resendOtp(identifier)
      .then((res) => setSuccessMessage(res.message || 'OTP resent successfully.'))
      .catch((err) => setError(err.message || 'Failed to resend OTP.'));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {authStep === 'details' && (
          <div className="auth-tabs">
            <div
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => resetState('login')}
            >
              Log In
            </div>
            <div
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => resetState('signup')}
            >
              Sign Up
            </div>
          </div>
        )}

        {authStep === 'otp' && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px' }}>Verify Account</h2>
            <p style={{ fontSize: '13px', color: 'var(--text)' }}>OTP sent to <strong>{identifier}</strong></p>
          </div>
        )}

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

        {successMessage && (
          <div style={{
            padding: '10px',
            marginBottom: '12px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '4px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {authStep === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="auth-form">
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
              <label>Email or Mobile Number</label>
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
                  type="text"
                  placeholder="Enter email or mobile number"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%' }}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}></span>
                  Connecting...
                </span>
              ) : (activeTab === 'login' ? 'Continue & Claim Cashback' : 'Join Now & Get ₹5.00 Bonus')}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', color: 'var(--text)' }}>
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form animate-fade">
            <div className="form-group">
              <label>6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck
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
                  placeholder="Enter OTP code"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%', letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading || otp.length < 4}
              style={{ opacity: (loading || otp.length < 4) ? 0.5 : 1, cursor: (loading || otp.length < 4) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={handleResendOtp}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Didn't receive it? Resend Code
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setAuthStep('details')}
                style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '13px', cursor: 'pointer' }}
              >
                &larr; Back to {activeTab === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
