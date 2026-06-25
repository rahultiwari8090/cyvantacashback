import React, { useState, useEffect } from 'react';
import { Wallet, Link, History, Gift, Copy, Check, ShieldCheck, ArrowUpRight, Share2, Percent, Trash2, Play, ExternalLink, Plus, BookOpen } from 'lucide-react';
import { apiSharedLinks, apiSharedCommissions, apiSettings } from '../services/api';
import UserLedger from './UserLedger';

const DUMMY_CLICKS = [];

export default function Dashboard({ currentUser, onAddNotification, setView }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // --- SHARED COMMISSION STATES ---
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sharedCommissions, setSharedCommissions] = useState([]);
  const [loadingShared, setLoadingShared] = useState(true);
  const [globalShareRate, setGlobalShareRate] = useState(5.0);
  const [newLinkProduct, setNewLinkProduct] = useState('');
  const [newLinkStore, setNewLinkStore] = useState('Amazon');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [generatedShortUrl, setGeneratedShortUrl] = useState('');
  const [copiedSharedId, setCopiedSharedId] = useState(null);

  // Fetch shared links and commissions
  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        setLoadingShared(true);
        const [links, comms, settings] = await Promise.all([
          apiSharedLinks.getByUser(currentUser.id),
          apiSharedCommissions.getByUser(currentUser.id),
          apiSettings.get()
        ]);
        setSharedLinks(links || []);
        setSharedCommissions(comms || []);
        setGlobalShareRate(settings?.sharedCommissionPercent || 5.0);
      } catch (err) {
        console.error('Failed to load shared link data:', err);
      } finally {
        setLoadingShared(false);
      }
    };
    if (currentUser) {
      fetchSharedData();
    }
  }, [currentUser]);

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    if (!newLinkProduct.trim() || !newLinkUrl.trim()) {
      onAddNotification('Please fill out Product Name and Product URL.', 'error');
      return;
    }
    if (!newLinkUrl.startsWith('http://') && !newLinkUrl.startsWith('https://')) {
      onAddNotification('Product URL must start with http:// or https://', 'error');
      return;
    }

    try {
      const newLink = await apiSharedLinks.create({
        userId: currentUser.id,
        userName: currentUser.name,
        productName: newLinkProduct,
        store: newLinkStore,
        productUrl: newLinkUrl,
        userSharePercent: 100
      });
      const defaultShortUrl = `${window.location.origin}/#/share/${newLink.id}`;
      const correctShortUrl = newLink.shortUrl
        ? newLink.shortUrl.includes('cyvanta.cashback')
          ? newLink.shortUrl.replace('https://cyvanta.cashback', window.location.origin + '/#')
          : newLink.shortUrl
        : defaultShortUrl;
      const savedLink = { ...newLink, shortUrl: correctShortUrl };
      setSharedLinks(prev => [savedLink, ...prev]);
      setGeneratedShortUrl(correctShortUrl);
      setNewLinkProduct('');
      setNewLinkUrl('');
      onAddNotification('Shared link generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to generate shared link.', 'error');
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await apiSharedLinks.delete(id);
      setSharedLinks(prev => prev.filter(l => l.id !== id));
      onAddNotification('Shared link deleted.', 'info');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to delete shared link.', 'error');
    }
  };

  const handleSimulateClick = async (id) => {
    try {
      onAddNotification('Simulating user click & potential purchase...', 'info');
      const updated = await apiSharedLinks.incrementClicks(id);
      
      // Update link list
      setSharedLinks(prev => prev.map(l => l.id === id ? { ...l, clicksCount: updated.clicksCount, conversionsCount: updated.conversionsCount } : l));
      
      // Re-fetch commissions & sync
      const comms = await apiSharedCommissions.getByUser(currentUser.id);
      setSharedCommissions(comms);
      
      onAddNotification('Simulation completed! Conversions and clicks updated.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Simulation error.', 'error');
    }
  };

  const handleCopySharedLink = (linkUrl, linkId) => {
    const correctLink = linkUrl.includes('cyvanta.cashback') ? linkUrl.replace('https://cyvanta.cashback', window.location.origin + '/#') : linkUrl;
    navigator.clipboard.writeText(correctLink);
    setCopiedSharedId(linkId);
    onAddNotification('Shared link copied to clipboard!', 'success');
    setTimeout(() => setCopiedSharedId(null), 2000);
  };

  const refLink = `${window.location.origin}/join?ref=${currentUser.name.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    onAddNotification('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWithdraw = () => {
    const userWallet = currentUser?.wallet || { confirmed: 0, pending: 0, referral: 0 };
    if (userWallet.confirmed <= 0) {
      onAddNotification('Insufficient confirmed commission to withdraw! Minimum is ₹10.', 'error');
      return;
    }
    setWithdrawing(true);
    onAddNotification(`Processing withdrawal request of ₹${userWallet.confirmed.toFixed(2)}...`, 'info');

    setTimeout(() => {
      onAddNotification(`Success! ₹${userWallet.confirmed.toFixed(2)} transferred to your linked Bank Account.`, 'success');
      if (currentUser && currentUser.wallet) {
        currentUser.wallet.confirmed = 0.0; // reset
      }
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
            <Wallet size={18} /> Commission Wallet
          </div>
          <div
            className={`dashboard-menu-item ${activeTab === 'share-earn' ? 'active' : ''}`}
            onClick={() => setActiveTab('share-earn')}
          >
            <Share2 size={18} /> Share & Earn
          </div>
          <div
            className={`dashboard-menu-item ${activeTab === 'refer' ? 'active' : ''}`}
            onClick={() => setActiveTab('refer')}
          >
            <Link size={18} /> Refer & Earn 10%
          </div>
          <div
            className={`dashboard-menu-item ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <BookOpen size={18} /> My Ledger
          </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px', color: 'var(--text)' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Help & Support</span>
          Email: support@cyvanta.com
        </div>
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
                <span className="wallet-stat-label">Confirmed Commission</span>
                <span className="wallet-stat-val">₹{(currentUser?.wallet?.confirmed || 0).toFixed(2)}</span>
              </div>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Pending Rewards</span>
                <span className="wallet-stat-val">₹{(currentUser?.wallet?.pending || 0).toFixed(2)}</span>
              </div>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Referral Earnings</span>
                <span className="wallet-stat-val">₹{(currentUser?.wallet?.referral || 0).toFixed(2)}</span>
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
                  When your friends register via your unique referral link and share deals, you receive a flat
                  10% lifetime referral bonus on all commissions they earn!
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
        
        {activeTab === 'share-earn' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-page-header" style={{ marginBottom: 0, paddingBottom: 0 }}>
              <h2 className="section-title" style={{ margin: 0 }}>Share & Earn Dashboard</h2>
              <p style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>
                Generate custom product tracking links, share them, and earn commissions on successful purchases.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div className="wallet-stat" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="wallet-stat-label" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>Total Shared Clicks</span>
                <span className="wallet-stat-val" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-bold)' }}>
                  {sharedLinks.reduce((sum, l) => sum + l.clicksCount, 0)}
                </span>
              </div>
              <div className="wallet-stat" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="wallet-stat-label" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>Total Conversions</span>
                <span className="wallet-stat-val" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-bold)' }}>
                  {sharedLinks.reduce((sum, l) => sum + l.conversionsCount, 0)}
                </span>
              </div>
              <div className="wallet-stat" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="wallet-stat-label" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>Pending Commission</span>
                <span className="wallet-stat-val" style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                  ₹{sharedCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="wallet-stat" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="wallet-stat-label" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>Approved Earnings</span>
                <span className="wallet-stat-val" style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  ₹{sharedCommissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="wallet-stat" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="wallet-stat-label" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>My Commission Rate</span>
                <span className="wallet-stat-val" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentUser.sharedCommissionRate !== null && currentUser.sharedCommissionRate !== undefined
                    ? `${currentUser.sharedCommissionRate}%`
                    : `${globalShareRate}% (Default)`}
                </span>
              </div>
            </div>

            {/* Link Generation Form */}
            <div className="referral-card" style={{ gridTemplateColumns: '1fr', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
              <h3 className="referral-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-bold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} style={{ color: 'var(--primary)' }} /> Generate Shareable Commission Link
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '16px' }}>
                Paste any product URL from our partner stores below to generate a tracking link.
              </p>

              <form onSubmit={handleGenerateLink} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bold)' }}>Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Noise Cancelling Earphones"
                    value={newLinkProduct}
                    onChange={e => setNewLinkProduct(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bold)' }}>Select Store</label>
                  <select
                    value={newLinkStore}
                    onChange={e => setNewLinkStore(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Ajio">Ajio</option>
                    <option value="Nykaa Beauty">Nykaa Beauty</option>
                    <option value="MakeMyTrip">MakeMyTrip</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bold)' }}>Product URL</label>
                  <input
                    type="url"
                    placeholder="https://amazon.in/dp/product-id..."
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                >
                  <Plus size={18} /> Generate Short Link
                </button>
              </form>

              {generatedShortUrl && (
                <div className="animate-fade" style={{ marginTop: '20px', padding: '16px', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb), 0.15)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Your Generated Tracking Link</span>
                  <div className="referral-link-box" style={{ marginTop: 0 }}>
                    <input type="text" readOnly value={generatedShortUrl} className="referral-link-input" style={{ backgroundColor: 'var(--card-bg)' }} />
                    <button
                      className="btn-primary"
                      onClick={() => handleCopySharedLink(generatedShortUrl, 'gen')}
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {copiedSharedId === 'gen' ? <Check size={16} /> : <Copy size={16} />}
                      {copiedSharedId === 'gen' ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text)', marginTop: '8px' }}>
                    Copy this link and share it. When someone clicks it and orders, their purchase commission will show up below.
                  </p>
                </div>
              )}
            </div>

            {/* Generated Links List */}
            <div className="history-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)', marginBottom: '12px' }}>My Active Shared Links</h3>
              {sharedLinks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text)' }}>
                  No active shared links. Generate one above to get started!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product Name</th>
                        <th>Store</th>
                        <th>Deep Link</th>
                        <th>Clicks</th>
                        <th>Conversions</th>
                        <th>My Earnings</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sharedLinks.map(link => {
                        const displayLink = link.shortUrl
                          ? (link.shortUrl.includes('cyvanta.cashback') ? link.shortUrl.replace('https://cyvanta.cashback', window.location.origin + '/#') : link.shortUrl)
                          : `${window.location.origin}/#/share/${link.id}`;
                        return (
                          <tr key={link.id}>
                            <td>{link.date}</td>
                            <td style={{ fontWeight: 600, color: 'var(--text-bold)' }}>{link.productName}</td>
                            <td>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-bold)', fontWeight: 600 }}>
                                {link.store}
                              </span>
                            </td>
                            <td style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <a href={displayLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                {displayLink}
                              </a>
                            </td>
                            <td style={{ fontWeight: 600 }}>{link.clicksCount}</td>
                            <td style={{ fontWeight: 600 }}>{link.conversionsCount}</td>
                            <td style={{ fontWeight: 700, color: '#10b981' }}>₹{link.totalEarnings.toFixed(2)}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  onClick={() => handleCopySharedLink(displayLink, link.id)}
                                  title="Copy Short Link"
                                  style={{ padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  {copiedSharedId === link.id ? <Check size={13} /> : <Copy size={13} />}
                                </button>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  onClick={() => handleSimulateClick(link.id)}
                                  title="Simulate Visitor Click & Order"
                                  style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                                >
                                  <Play size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-withdraw"
                                  onClick={() => handleDeleteLink(link.id)}
                                  title="Delete Link"
                                  style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Commissions conversions history */}
            <div className="history-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)', marginBottom: '12px' }}>Shared Link Commissions Log</h3>
              {sharedCommissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text)' }}>
                  No conversions tracked yet. Use the purple play button (simulate tool) above to test a sale simulation!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Transaction Date</th>
                        <th>Product / Store</th>
                        <th>Order Amount</th>
                        <th>Rate Used</th>
                        <th>Earned Commission</th>
                        <th>Admin Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sharedCommissions.map(comm => (
                        <tr key={comm.id}>
                          <td>{comm.date}</td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-bold)' }}>{comm.productName}</div>
                              <span style={{ fontSize: '10px', color: 'var(--text)' }}>{comm.store}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>₹{comm.purchaseAmount.toFixed(2)}</td>
                          <td style={{ fontWeight: 500 }}>{comm.commissionRate}%</td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 700, color: comm.status === 'approved' ? '#10b981' : 'var(--text-bold)' }}>
                                ₹{comm.userCommissionAmount !== undefined ? comm.userCommissionAmount.toFixed(2) : comm.commissionAmount.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`history-status ${comm.status.toLowerCase()}`}>
                              {comm.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <UserLedger currentUser={currentUser} onAddNotification={onAddNotification} />
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

      </div>
    </div>
  );
}
