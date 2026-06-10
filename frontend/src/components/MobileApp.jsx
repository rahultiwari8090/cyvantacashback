import React, { useState } from 'react';
import {
  Home,
  ShoppingBag,
  Clock,
  Wallet,
  Search,
  ArrowRight,
  TrendingUp,
  Gift,
  Copy,
  Check,
  CheckCircle,
  Truck,
  ShieldCheck,
  Play,
  User,
  LogOut,
  Send,
  AlertCircle
} from 'lucide-react';

const STORES_INFO = [
  { platform: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', cashbackPercent: 10.0 },
  { platform: 'Flipkart', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg', cashbackPercent: 8.5 },
  { platform: 'Myntra', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png', cashbackPercent: 12.0 },
  { platform: 'Ajio', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Ajio_Logo.svg', cashbackPercent: 15.0 },
  { platform: 'Nykaa Beauty', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nykaa_Logo.svg', cashbackPercent: 7.0 },
  { platform: 'MakeMyTrip', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/MakeMyTrip_Logo.svg', cashbackPercent: 9.0 }
];

const generatePriceComparisons = (deal) => {
  if (!deal) return [];
  
  let platforms = ['Amazon', 'Flipkart'];
  if (deal.category === 'fashion') {
    platforms = ['Myntra', 'Ajio', 'Flipkart', 'Amazon'];
  } else if (deal.category === 'health') {
    platforms = ['Nykaa Beauty', 'Amazon', 'Flipkart'];
  } else if (deal.category === 'travel') {
    platforms = ['MakeMyTrip', 'Amazon'];
  } else {
    platforms = ['Amazon', 'Flipkart', 'Myntra', 'Ajio'];
  }

  return platforms.map(platformName => {
    const store = STORES_INFO.find(s => s.platform === platformName) || STORES_INFO[0];
    
    let dealPrice = deal.dealPrice;
    if (platformName !== deal.platform) {
      const hash = platformName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const percentDiff = ((hash % 21) - 10) / 100; // -10% to +10%
      dealPrice = parseFloat((deal.dealPrice * (1 + percentDiff)).toFixed(2));
    }
    
    const cashbackValue = store.cashbackPercent;
    const cashbackEarned = parseFloat(((dealPrice * cashbackValue) / 100).toFixed(2));
    const effectivePrice = parseFloat((dealPrice - cashbackEarned).toFixed(2));
    
    return {
      platform: platformName,
      logo: store.logo,
      dealPrice,
      cashbackPercent: cashbackValue,
      cashbackEarned,
      effectivePrice,
      isOriginal: platformName === deal.platform
    };
  }).sort((a, b) => a.effectivePrice - b.effectivePrice);
};

export default function MobileApp({
  currentUser,
  trackedOrders = [],
  withdrawRequests = [],
  onAddWithdrawalRequest,
  storesData = [],
  dealsData = [],
  onAddNotification,
  openAuthModal,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Withdrawal Form States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Selected Order for tracking modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [comparisonDeal, setComparisonDeal] = useState(null);

  // Get current user's wallet info (or fallback if guest/admin)
  const isGuest = !currentUser;
  const user = currentUser ? { ...currentUser, wallet: currentUser.wallet || { confirmed: 0.00, pending: 0.00, referral: 0.00 } } : {
    name: 'Guest User',
    wallet: { confirmed: 0.00, pending: 0.00, referral: 0.00 }
  };

  const refLink = `${window.location.origin}/join?ref=${user.name.toLowerCase().replace(' ', '')}`;

  // Filter tracked orders for the logged-in user
  const userTrackedOrders = trackedOrders.filter(o => o.userName === user.name);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    onAddNotification('Referral link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGrabDeal = (deal) => {
    setComparisonDeal(deal);
  };

  const executeSimulatorGrabDeal = (dealItem, storeItem) => {
    setComparisonDeal(null);
    onAddNotification(`Activating cashback tracker on ${storeItem.platform} for ${dealItem.title || dealItem.name}...`, 'success');
    setTimeout(() => {
      onAddNotification(`Redirected to merchant! Shop completed.`, 'info');
      const link = storeItem?.link || dealItem?.affiliateUrl || dealItem?.link;
      if (link) {
        window.open(link, '_blank');
      } else {
        window.open('https://google.com', '_blank');
      }
    }, 1500);
  };

  const handleStoreClick = (store) => {
    onAddNotification(`Redirecting to ${store.name}... Tracking ID is active!`, 'success');
  };

  const handleRequestWithdrawal = (e) => {
    e.preventDefault();
    if (isGuest) {
      onAddNotification('Please Login / Sign Up to request withdrawals.', 'error');
      openAuthModal();
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      onAddNotification('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    if (amount < 10) {
      onAddNotification('Minimum withdrawal amount is ₹10.00', 'error');
      return;
    }

    if (amount > user.wallet.confirmed) {
      onAddNotification('Insufficient confirmed cashback balance.', 'error');
      return;
    }

    if (!upiId.trim().includes('@')) {
      onAddNotification('Please enter a valid UPI ID (e.g. name@bank).', 'error');
      return;
    }

    setWithdrawLoading(true);
    onAddNotification('Submitting withdrawal request to Admin...', 'info');

    setTimeout(() => {
      const newRequest = {
        userName: user.name,
        coins: Math.round(amount * 100), // 100 coins = ₹1
        amount: amount,
        upiId: upiId,
        date: new Date().toISOString().split('T')[0],
      };
      
      onAddWithdrawalRequest(newRequest);
      
      // Update local wallet view
      user.wallet.confirmed = Math.max(0, user.wallet.confirmed - amount);
      user.wallet.pending += amount; // shift to pending processing

      setWithdrawAmount('');
      setUpiId('');
      setWithdrawLoading(false);
      onAddNotification('Withdrawal requested successfully! Awaiting Admin approval.', 'success');
    }, 1800);
  };

  // Get return status description for user UI
  const getUserReturnInfo = (item) => {
    if (item.status === 'completed') return { text: 'Clearance Approved (Unlocked)', color: '#10b981' };
    if (item.status === 'returned') return { text: 'Refunded (Cashback Cancelled)', color: '#ef4444' };
    if (item.status === 'return_active') {
      const today = new Date();
      const expiry = new Date(item.returnExpiryDate);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return { 
        text: diff > 0 ? `${diff} Days until Cashback Unlocks` : 'Awaiting clearance review', 
        color: '#3b82f6' 
      };
    }
    return { text: 'In-Transit / Awaiting delivery confirmation', color: '#f59e0b' };
  };

  return (
    <div className="mobile-app-container">
      {/* Top Application Header */}
      <div className="mobile-app-header">
        <div className="app-branding">
          <div className="app-logo-bullet">C</div>
          <span>Cyvanta Mobile</span>
        </div>
        
        {isGuest ? (
          <button className="app-login-btn" onClick={openAuthModal}>Login</button>
        ) : (
          <div className="app-user-profile">
            <span className="app-user-initial">{user.name[0]}</span>
            <button className="app-logout-icon" onClick={onLogout} title="Logout App">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Screen Content Frame */}
      <div className="mobile-app-screen-content">
        {comparisonDeal ? (
          <div className="mobile-screen-tab-panel animate-fade" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <button 
                onClick={() => setComparisonDeal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  padding: 0
                }}
              >
                &larr; Back
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-bold)' }}>Price Comparison</span>
            </div>

            {/* Product card info */}
            <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <img 
                src={comparisonDeal.image} 
                alt="" 
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--text-bold)', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {comparisonDeal.title || comparisonDeal.name}
                </h4>
                <span style={{ fontSize: '9px', color: 'var(--text)', textTransform: 'capitalize', marginTop: '2px' }}>
                  Category: <strong>{comparisonDeal.category}</strong>
                </span>
              </div>
            </div>

            {/* Platform Comparison List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingBottom: '20px' }}>
              {generatePriceComparisons(comparisonDeal).map((item, index) => {
                const isBestValue = index === 0;
                return (
                  <div
                    key={item.platform}
                    style={{
                      border: isBestValue ? '1.5px solid #10b981' : '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      backgroundColor: 'var(--card-bg)'
                    }}
                  >
                    {isBestValue && (
                      <span style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '8px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        fontSize: '6px',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        🏆 Best Value
                      </span>
                    )}

                    {/* Left side info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-bold)' }}>{item.platform}</span>
                      <span style={{ fontSize: '8px', color: 'var(--text)', textDecoration: 'line-through' }}>
                        ₹{item.dealPrice.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '9px', color: '#10b981', fontWeight: '600' }}>
                        -{item.cashbackPercent}% CB (-₹{item.cashbackEarned.toFixed(2)})
                      </span>
                    </div>

                    {/* Right side Price & CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '8px', color: 'var(--text)' }}>Net Price:</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: isBestValue ? '#10b981' : 'var(--text-bold)' }}>
                          ₹{item.effectivePrice.toFixed(2)}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => executeSimulatorGrabDeal(comparisonDeal, item)}
                        style={{
                          backgroundColor: '#ff4f2f',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '9px',
                          cursor: 'pointer'
                        }}
                      >
                        Shop
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: HOME SCREEN */}
            {activeTab === 'home' && (
          <div className="mobile-screen-tab-panel animate-fade">
            {/* Wallet Quick Summary */}
            <div className="app-quick-wallet">
              <div className="quick-wallet-header">
                <span>Total Cashback Balance</span>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="quick-wallet-balance">
                ₹{(user.wallet.confirmed + user.wallet.pending).toFixed(2)}
              </div>
              <div className="quick-wallet-breakdown">
                <span>Confirmed: <strong>₹{user.wallet.confirmed.toFixed(2)}</strong></span>
                <span>Pending: <strong>₹{user.wallet.pending.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Quick Promo Banner */}
            <div className="app-promo-card">
              <div className="promo-details">
                <h4>Invite Friends & Earn</h4>
                <p>Get flat 10% of all their cashback rates for life!</p>
                <button className="app-mini-btn" onClick={() => setActiveTab('wallet')}>Share Link</button>
              </div>
              <div className="promo-gift-icon">
                <Gift size={48} />
              </div>
            </div>

            {/* Hot Deals */}
            <div className="app-section-header">
              <h3>Top Cashback Deals</h3>
              <span onClick={() => setActiveTab('stores')}>See All</span>
            </div>

            <div className="app-deals-scroll">
              {dealsData.slice(0, 3).map(deal => (
                <div key={deal.id} className="app-deal-item" onClick={() => handleGrabDeal(deal)}>
                  <img src={deal.image} alt={deal.title} />
                  <div className="app-deal-info">
                    <h4>{deal.title}</h4>
                    <div className="app-deal-prices">
                      <span className="deal-price-val">₹{deal.dealPrice.toFixed(2)}</span>
                      <span className="deal-price-cb">+₹{deal.cashbackEarned.toFixed(2)} Cashback</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works simple text */}
            <div className="app-how-it-works-card">
              <h3>How to Earn Cashback:</h3>
              <ol>
                <li>Click <strong>Shop & Earn</strong> inside any store.</li>
                <li>Purchase product on the merchant site.</li>
                <li>Your sale is tracked (viewable in the **Track** tab).</li>
                <li>Once return policy expires, cashback is transferred to your wallet!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: STORES GRID */}
        {activeTab === 'stores' && (
          <div className="mobile-screen-tab-panel animate-fade">
            <div className="app-search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search Myntra, Flipkart, Amazon..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <h3 style={{ margin: '14px 0 8px', fontSize: '15px', color: 'var(--text-bold)', fontWeight: '700' }}>Cashback Partners</h3>
            <div className="app-stores-list">
              {storesData
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(store => (
                  <div key={store.id} className="app-store-row" onClick={() => handleStoreClick(store)}>
                    <img src={store.logo} alt={store.name} />
                    <div className="app-store-row-info">
                      <h4>{store.name}</h4>
                      <p>Up to {store.cashbackRate} Cashback</p>
                    </div>
                    <button className="app-store-go-btn">
                      Shop <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT TRACKING TIMELINE */}
        {activeTab === 'track' && (
          <div className="mobile-screen-tab-panel animate-fade">
            <div className="app-tab-title-header">
              <h3>Track My Cashback</h3>
              <p>Verify delivery progress and return policy cooldowns</p>
            </div>

            {isGuest ? (
              <div className="app-empty-state-card">
                <AlertCircle size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <h4>Login Required</h4>
                <p>Please login to view active product cashback tracking cycles.</p>
                <button className="app-login-btn" style={{ margin: '12px auto 0' }} onClick={openAuthModal}>Login / Sign Up</button>
              </div>
            ) : userTrackedOrders.length === 0 ? (
              <div className="app-empty-state-card">
                <Clock size={32} style={{ color: 'var(--text)', opacity: 0.5, marginBottom: '8px' }} />
                <h4>No Tracked Purchases Yet</h4>
                <p>Click on any deal or store to shop. When merchant registers your click-purchase, it will appear here instantly.</p>
                <button className="app-mini-btn" style={{ margin: '12px auto 0' }} onClick={() => setActiveTab('stores')}>Browse Stores</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userTrackedOrders.map(item => {
                  const statusInfo = getUserReturnInfo(item);
                  return (
                    <div 
                      key={item.id} 
                      className={`app-track-card ${item.status}`}
                      onClick={() => setSelectedOrder(item)}
                    >
                      <div className="app-track-card-header">
                        <span className="app-track-id">{item.id}</span>
                        <span className="app-track-platform">{item.platform}</span>
                      </div>
                      
                      <h4 className="app-track-product-name">{item.productName}</h4>
                      
                      <div className="app-track-values">
                        <span>Price: <strong>₹{item.price.toFixed(2)}</strong></span>
                        <span className="app-track-cb-val">+₹{item.cashbackAmount.toFixed(2)} CB</span>
                      </div>

                      <div className="app-track-status-progress">
                        <span className="app-status-text">
                          Status: <strong>{item.status.toUpperCase().replace('_', ' ')}</strong>
                        </span>
                        <span style={{ fontSize: '11px', color: statusInfo.color, fontWeight: '700' }}>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                        Click to view timeline stepper &rarr;
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WALLET & CASHBACK WITHDRAWALS */}
        {activeTab === 'wallet' && (
          <div className="mobile-screen-tab-panel animate-fade">
            {/* Wallet balance display */}
            <div className="app-wallet-details-card">
              <h4>My Cashback Wallet</h4>
              
              <div className="app-wallet-balance-row">
                <div className="wallet-bal-box">
                  <span className="wallet-bal-lbl">CONFIRMED</span>
                  <span className="wallet-bal-num" style={{ color: '#10b981' }}>
                    ₹{user.wallet.confirmed.toFixed(2)}
                  </span>
                </div>
                <div className="wallet-bal-box">
                  <span className="wallet-bal-lbl">PENDING</span>
                  <span className="wallet-bal-num" style={{ color: '#f59e0b' }}>
                    ₹{user.wallet.pending.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="wallet-disclaimer">* Only confirmed cashback (after return policy window closure) is withdrawable. Minimum threshold is ₹10.00.</p>
            </div>

            {/* Request Withdrawal Form */}
            <div className="app-withdrawal-form-card">
              <h3>Request Bank Transfer</h3>
              <form onSubmit={handleRequestWithdrawal}>
                <div className="app-input-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Enter amount (min ₹10)" 
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>

                <div className="app-input-group">
                  <label>Linked UPI Address / Account</label>
                  <input 
                    type="text" 
                    placeholder="e.g. username@paytm" 
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="app-withdraw-submit-btn"
                  disabled={withdrawLoading || user.wallet.confirmed < 10}
                  style={{
                    opacity: (user.wallet.confirmed < 10) ? 0.6 : 1,
                    cursor: (user.wallet.confirmed < 10) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {withdrawLoading ? 'Sending request to Admin...' : 'Request Instant Payout'}
                </button>
              </form>
            </div>

            {/* Invite link share */}
            <div className="app-invite-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Gift size={16} style={{ color: 'var(--primary)' }} />
                <h3>Your Referral Code</h3>
              </div>
              <p>Share this link to claim lifetime 10% commission on referrals.</p>
              <div className="app-referral-copy-box">
                <input type="text" readOnly value={refLink} />
                <button onClick={handleCopyLink}>
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>

      {/* App Mobile Stepper Details Modal */}
      {selectedOrder && (
        <div className="mobile-app-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="mobile-app-modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="mobile-app-modal-header">
              <h4>Order Track Status</h4>
              <button className="app-modal-close" onClick={() => setSelectedOrder(null)}>x</button>
            </div>
            
            <div className="mobile-app-modal-body">
              <div className="app-modal-meta-box">
                <span className="meta-lbl">Product:</span>
                <strong className="meta-val">{selectedOrder.productName}</strong>
                
                <span className="meta-lbl">Retailer:</span>
                <strong className="meta-val" style={{ color: 'var(--primary)' }}>{selectedOrder.platform}</strong>

                <span className="meta-lbl">Cashback Earned:</span>
                <strong className="meta-val" style={{ color: '#10b981' }}>+₹{selectedOrder.cashbackAmount.toFixed(2)}</strong>
              </div>

              {/* Vertical Mobile Stepper */}
              <div className="mobile-app-stepper">
                
                {/* Step 1 */}
                <div className="mobile-app-step-item completed">
                  <div className="mobile-app-step-circle"><Check size={10} /></div>
                  <div className="mobile-app-step-details">
                    <h5>Order Placed</h5>
                    <p>Tracked ID linked on click-out.</p>
                    <span className="step-time">{selectedOrder.orderDate}</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`mobile-app-step-item ${['confirmed', 'shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'ordered' ? 'active' : ''}`}>
                  <div className="mobile-app-step-circle">
                    {['confirmed', 'shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <Check size={10} /> : ''}
                  </div>
                  <div className="mobile-app-step-details">
                    <h5>Merchant Confirmed</h5>
                    <p>Sale validated by partner store.</p>
                    {selectedOrder.confirmedDate && <span className="step-time">{selectedOrder.confirmedDate}</span>}
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`mobile-app-step-item ${['shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'confirmed' ? 'active' : ''}`}>
                  <div className="mobile-app-step-circle">
                    {['shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <Check size={10} /> : ''}
                  </div>
                  <div className="mobile-app-step-details">
                    <h5>Package Dispatched</h5>
                    <p>Product shipped by merchant retailer.</p>
                    {selectedOrder.shippedDate && <span className="step-time">{selectedOrder.shippedDate}</span>}
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`mobile-app-step-item ${['delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'shipped' ? 'active' : ''}`}>
                  <div className="mobile-app-step-circle">
                    {['delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <Check size={10} /> : ''}
                  </div>
                  <div className="mobile-app-step-details">
                    <h5>Order Delivered</h5>
                    <p>Return policy window started.</p>
                    {selectedOrder.deliveredDate && <span className="step-time">{selectedOrder.deliveredDate}</span>}
                  </div>
                </div>

                {/* Step 5 */}
                {selectedOrder.status === 'returned' ? (
                  <div className="mobile-app-step-item failed">
                    <div className="mobile-app-step-circle">x</div>
                    <div className="mobile-app-step-details">
                      <h5>Returned & Refunded</h5>
                      <p>Refund claimed. Cashback cancelled.</p>
                    </div>
                  </div>
                ) : (
                  <div className={`mobile-app-step-item ${selectedOrder.status === 'completed' ? 'completed' : selectedOrder.status === 'return_active' ? 'active' : ''}`}>
                    <div className="mobile-app-step-circle">
                      {selectedOrder.status === 'completed' ? <Check size={10} /> : ''}
                    </div>
                    <div className="mobile-app-step-details">
                      <h5>Return Cooldown Period</h5>
                      <p>{selectedOrder.returnWindowDays}-day return conditions active.</p>
                      {selectedOrder.status === 'return_active' && (
                        <span className="app-countdown-badge">
                          Under review until {selectedOrder.returnExpiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6 */}
                {selectedOrder.status !== 'returned' && (
                  <div className={`mobile-app-step-item ${selectedOrder.status === 'completed' ? 'completed' : ''}`}>
                    <div className="mobile-app-step-circle">
                      {selectedOrder.status === 'completed' ? <Check size={10} /> : ''}
                    </div>
                    <div className="mobile-app-step-details">
                      <h5>Cashback Unlocked</h5>
                      <p>Clearance passed. Coins withdrawable.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button className="app-modal-btn" onClick={() => setSelectedOrder(null)}>Close Timeline</button>
          </div>
        </div>
      )}

      {/* Bottom Tab Menu */}
      <nav className="mobile-app-nav">
        <div 
          className={`app-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </div>

        <div 
          className={`app-nav-item ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <ShoppingBag size={18} />
          <span>Stores</span>
        </div>

        <div 
          className={`app-nav-item ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
        >
          <Clock size={18} />
          <span>Track</span>
        </div>

        <div 
          className={`app-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <Wallet size={18} />
          <span>Wallet</span>
        </div>
      </nav>
    </div>
  );
}
