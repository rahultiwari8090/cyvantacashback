import React, { useState } from 'react';
import { ArrowLeft, Clock, Copy, Check, Info, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import TopDeals from './TopDeals';

export default function StoreDetail({ store, onBack, onAddNotification, deals, onGrabDeal, currentUser, openAuthModal }) {
  const [copiedCouponId, setCopiedCouponId] = useState(null);
  const [activatingDealId, setActivatingDealId] = useState(null);

  const handleCopyCode = (coupon) => {
    if (!currentUser) {
      onAddNotification('Please login or sign up first to use this coupon!', 'info');
      openAuthModal();
      return;
    }
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code);
      setCopiedCouponId(coupon.id);
      onAddNotification(`Coupon "${coupon.code}" copied to clipboard!`, 'success');
      
      // Simulate opening affiliate link after a short delay
      setTimeout(() => {
        setCopiedCouponId(null);
        onAddNotification(`Opening secure tracking link to ${store.name}...`, 'info');
      }, 1500);
    }
  };

  const handleActivateDeal = (coupon) => {
    if (!currentUser) {
      onAddNotification('Please login or sign up first to activate this deal!', 'info');
      openAuthModal();
      return;
    }
    setActivatingDealId(coupon.id);
    onAddNotification(`Activating Tracker...`, 'success');
    
    setTimeout(() => {
      setActivatingDealId(null);
      onAddNotification(`Redirecting you safely to ${store.name} checkout...`, 'info');
    }, 2000);
  };

  return (
    <div className="animate-fade" style={{ width: '100%' }}>
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          marginBottom: '24px',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to All Stores
      </button>

      {/* Store Detailed Banner */}
      <div className="store-detail-header">
        <div className="store-detail-logo-wrapper">
          <img src={store.logo} alt={store.name} className="store-detail-logo" />
        </div>
        <div className="store-detail-info">
          <div className="store-detail-title-row">
            <h2 className="store-detail-name">{store.name} Coupons & Deals</h2>
            <span className="store-detail-tag">Up to {store.cashbackRate} Commission</span>
          </div>
          <p className="store-detail-desc">{store.description}</p>
          <div className="store-detail-meta-pills">
            <span className="store-detail-pill">
              <Clock size={14} /> Tracking: 24 - 48 Hours
            </span>
            <span className="store-detail-pill">
              <Sparkles size={14} style={{ color: 'var(--secondary)' }} /> Payout: Confirmed in 60 days
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Coupons left, Sidebar right */}
      <div className="store-detail-grid">
        <div className="coupons-list">
          <h3
            className="section-title"
            style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}
          >
            Active Coupons & Promotional Codes ({store.coupons ? store.coupons.length : 0})
          </h3>

          {store.coupons && store.coupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card animate-fade">
              <div className="coupon-details">
                <span className={`coupon-type-badge ${coupon.code ? 'code' : 'deal'}`}>
                  {coupon.code ? 'Coupon Code' : 'Verified Deal'}
                </span>
                <h4 className="coupon-title">{coupon.title}</h4>
                <p className="coupon-desc">{coupon.description}</p>
                <div className="coupon-exp-row">
                  <span>Expires: {coupon.expiry}</span>
                  <span>•</span>
                  <span>Used 432 times today</span>
                </div>
              </div>

              <div className="coupon-action-box">
                {coupon.code ? (
                  <button
                    className={`coupon-code-button ${copiedCouponId === coupon.id ? 'copied' : ''}`}
                    onClick={() => handleCopyCode(coupon)}
                  >
                    {copiedCouponId === coupon.id ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> {coupon.code}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => handleActivateDeal(coupon)}
                    style={{
                      padding: '8px 18px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {activatingDealId === coupon.id ? 'Tracking Active...' : 'Activate Deal'}
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="store-sidebar-card">
            <h3>How tracking works?</h3>
            <ul className="sidebar-terms-list">
              <li>Always start your session by clicking out from Cyvanta.</li>
              <li>Only add items to your cart <strong>after</strong> clicking out.</li>
              <li>Do not use external browser coupon plug-ins or extensions.</li>
              <li>Ensure your browser has cookies enabled and AdBlock turned off.</li>
              <li>Complete the transaction in a single session within 2 hours.</li>
            </ul>
          </div>

          <div
            className="store-sidebar-card"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <ShieldAlert size={20} /> Important Terms
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
              Commissions are not paid on bulk purchases, wholesale transactions, or cancelled/returned orders.
              Tracking may take up to 48 hours to confirm with the merchant.
            </p>
          </div>
        </div>
      </div>
      
      {/* Related Products/Deals */}
      {deals && deals.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 className="section-title" style={{ fontSize: '22px', marginBottom: '16px', paddingLeft: '16px' }}>
            Top Products on {store.name}
          </h3>
          <TopDeals deals={deals} onGrabDeal={onGrabDeal} />
        </div>
      )}
    </div>
  );
}
