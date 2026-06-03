import React, { useState } from 'react';
import { Wallet, Link, History, Gift, Copy, Check, ShieldCheck, ArrowUpRight } from 'lucide-react';

const DUMMY_CLICKS = [
  { id: 1, date: '2026-05-28', store: 'Myntra Fashion', action: 'Outbound Redirect', status: 'Confirmed', amount: '$14.20' },
  { id: 2, date: '2026-05-29', store: 'Flipkart Mobiles', action: 'Outbound Redirect', status: 'Pending', amount: '$35.00' },
  { id: 3, date: '2026-05-30', store: 'Amazon Deals', action: 'Outbound Redirect', status: 'Pending', amount: '$4.12' },
  { id: 4, date: '2026-05-31', store: 'Ajio Fashion', action: 'Outbound Redirect', status: 'Confirmed', amount: '$12.50' },
];

export default function Dashboard({ currentUser, onAddNotification, setView }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const refLink = `https://cyvanta.cashback/join?ref=${currentUser.name.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    onAddNotification('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWithdraw = () => {
    if (currentUser.wallet.confirmed <= 0) {
      onAddNotification('Insufficient confirmed cashback to withdraw! Minimum is $10.', 'error');
      return;
    }
    setWithdrawing(true);
    onAddNotification(`Processing withdrawal request of $${currentUser.wallet.confirmed.toFixed(2)}...`, 'info');

    setTimeout(() => {
      onAddNotification(`Success! $${currentUser.wallet.confirmed.toFixed(2)} transferred to your linked Bank Account.`, 'success');
      currentUser.wallet.confirmed = 0.0; // reset
      setWithdrawing(false);
    }, 2500);
  };

  return (
    <div className="dashboard-grid animate-fade">
      {/* Sidebar navigation */}
      <div className="dashboard-sidebar">
        <div className="dashboard-menu">
          <div
            className={`dashboard-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Wallet size={18} /> Account Overview
          </div>
          <div
            className={`dashboard-menu-item ${activeTab === 'refer' ? 'active' : ''}`}
            onClick={() => setActiveTab('refer')}
          >
            <Link size={18} /> Refer & Earn 10%
          </div>
          <div
            className={`dashboard-menu-item ${activeTab === 'clicks' ? 'active' : ''}`}
            onClick={() => setActiveTab('clicks')}
          >
            <History size={18} /> Click & Shopping History
          </div>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px', color: 'var(--text)' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Help & Support</span>
          Email: support@cyvanta.com
        </div>
      </div>

      {/* Main Contents */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 className="section-title">My Wallet Overview</h2>

            {/* Wallet values banner */}
            <div className="wallet-banner">
              <div className="wallet-stat">
                <span className="wallet-stat-label">Confirmed Cashback</span>
                <span className="wallet-stat-val">${currentUser.wallet.confirmed.toFixed(2)}</span>
              </div>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Pending Rewards</span>
                <span className="wallet-stat-val">${currentUser.wallet.pending.toFixed(2)}</span>
              </div>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Referral Earnings</span>
                <span className="wallet-stat-val">${currentUser.wallet.referral.toFixed(2)}</span>
              </div>

              <button
                className="btn-withdraw"
                onClick={handleWithdraw}
                disabled={withdrawing}
                style={{ gridColumn: 'span 3', width: '220px', alignSelf: 'center', marginTop: '8px' }}
              >
                {withdrawing ? 'Processing...' : 'Transfer to Bank / PayPal'}
              </button>
            </div>

            {/* Referral Info Card */}
            <div className="referral-card">
              <div className="referral-info">
                <h3 className="referral-title">Invite friends, get 10% of their earnings for life!</h3>
                <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                  When your friends register via your unique referral link and shop, you receive a flat
                  10% lifetime referral bonus on all cashback they earn!
                </p>
                <div className="referral-link-box">
                  <input type="text" readOnly value={refLink} className="referral-link-input" />
                  <button
                    className="btn-primary"
                    onClick={handleCopyLink}
                    style={{
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Gift size={80} style={{ color: 'var(--primary)', opacity: 0.8 }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'refer' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 className="section-title">Refer & Earn Program</h2>
            <div className="referral-card" style={{ gridTemplateColumns: '1fr' }}>
              <h3 className="referral-title" style={{ color: 'var(--primary)', fontSize: '24px' }}>
                Flat 10% Lifetime Commission
              </h3>
              <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.6 }}>
                Share your personalized referral code with your audience, friends, or family. As soon
                as they register, their profiles are permanently tagged under your account. Whenever
                they claim cashback on any deal, 10% of their cashback rate is automatically credited
                into your referral balance!
              </p>

              <div className="referral-link-box" style={{ maxWidth: '600px', marginTop: '16px' }}>
                <input type="text" readOnly value={refLink} className="referral-link-input" style={{ fontSize: '15px', padding: '12px' }} />
                <button
                  className="btn-primary"
                  onClick={handleCopyLink}
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                  {copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clicks' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="section-title">Click & Shopping History</h2>
            <div className="history-card">
              <h3>Tracked Store Sessions</h3>
              <p style={{ fontSize: '13px', color: 'var(--text)' }}>
                Below are all the shopping sessions you started by clicking out from Cyvanta. Shopping
                tracking statuses updates automatically every few hours.
              </p>

              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Session Date</th>
                      <th>Merchant Retailer</th>
                      <th>Recorded Action</th>
                      <th>Cashback Status</th>
                      <th>Estimated Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUMMY_CLICKS.map((c) => (
                      <tr key={c.id}>
                        <td>{c.date}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-bold)' }}>{c.store}</td>
                        <td>{c.action}</td>
                        <td>
                          <span className={`history-status ${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: c.status === 'Confirmed' ? 'var(--secondary)' : 'var(--text-bold)' }}>
                          {c.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
