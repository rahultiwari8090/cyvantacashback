import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import StoreGrid from './components/StoreGrid';
import TopDeals from './components/TopDeals';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import StoreDetail from './components/StoreDetail';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import Footer from './components/Footer';
import CheckoutModal from './components/CheckoutModal';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import MobileApp from './components/MobileApp';
import { apiTracking, apiWithdrawals, apiProducts, apiDeals, apiSharedLinks, apiSharedCommissions, apiStores, apiBanners, apiAffiliate } from './services/api';
import './index.css';
import './App.css';

const ShareLanding = ({ products, currentUser, openAuthModal }) => {
  const path = window.location.pathname.startsWith('/share/') 
    ? window.location.pathname.split('/share/')[1]
    : window.location.hash.replace('#/share/', '');
  
  const [landingData, setLandingData] = useState(null);
  const [landingSession, setLandingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const links = await apiSharedLinks.getAll();
        const match = links.find(l => l.id === path || l.shortUrl.endsWith(path));
        if (match) {
          setLandingData(match);
          // Store shareId so future checkouts are attributed to this referrer
          localStorage.setItem('shareId', match.id);
          // Record click instantly
          const clickData = await apiSharedLinks.incrementClicks(match.id);
          setLandingSession(clickData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (path) fetchShareData();
  }, [path]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Referral Details...</div>;
  if (!landingData) return <div style={{ padding: '40px', textAlign: 'center' }}>Referral Link Expired or Not Found.</div>;

  const mockProduct = products.find(p => p.name === landingData.productName) || {
    id: `prod-${landingData.id}`,
    name: landingData.productName,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'electronics',
    title: landingData.productName
  };

  const storeMock = {
    platform: landingData.store,
    dealPrice: 50.00,
    effectivePrice: 50.00,
    cashbackEarned: 5.0,
    cashbackPercent: 10,
    link: landingData.productUrl
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', minHeight: '60vh', backgroundColor: 'var(--bg)' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {/* Added Product Image Display */}
        <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <img src={mockProduct.image} alt={mockProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-bold)' }}>You've been invited!</h2>
        <p style={{ fontSize: '15px', color: 'var(--text)', margin: '0 0 24px 0', lineHeight: '1.6' }}>
          <strong>{landingData.userName}</strong> has shared an exclusive deal with you for <strong>{landingData.productName}</strong> from {landingData.store}.
        </p>
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '32px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--secondary)', fontSize: '16px' }}>Exclusive Affiliate Deal</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-bold)' }}>
            Click below to apply the deal. You will be redirected to the secure merchant site.
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
          onClick={() => {
            if (!currentUser) {
              openAuthModal();
              return;
            }
            
            const buyerId = currentUser.id;
            const shareId = landingData.id;
            const productId = mockProduct.id;
            
            // Log click to the Affiliate Network tracker
            // The backend will automatically simulate a purchase after 5s 
            // and create a pending SharedCommission for the referrer
            apiAffiliate.createClick(buyerId, shareId, productId).catch(e => console.error("Failed to log affiliate click", e));

            if (landingData && landingData.productUrl) {
              window.open(landingData.productUrl, '_blank');
            } else if (storeMock && storeMock.link) {
              window.open(storeMock.link, '_blank');
            } else {
              window.open('https://google.com', '_blank');
            }
          }}
        >
          Grab Deal Now
        </button>
      </div>
    </div>
  );
};
export default function App() {
  // Add Admitad ownership verification meta tag dynamically
  useEffect(() => {
    let meta = document.querySelector('meta[name="verify-admitad"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'verify-admitad';
      meta.content = 'fdcf363535';
      document.head.appendChild(meta);
    }
  }, []);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const session = sessionStorage.getItem('admin_session');
    return session === 'active';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('user_session');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse user session:', e);
      return null;
    }
  });

  const getInitialView = () => {
    const hash = window.location.hash;
    if (hash === '#/admin/login') {
      return 'admin-login';
    }
    if (hash.startsWith('#/admin')) {
      return sessionStorage.getItem('admin_session') === 'active' ? 'admin-panel' : 'admin-login';
    }
    if (hash === '#/dashboard') {
      return 'dashboard';
    }
    if (hash === '#/store') {
      return 'store';
    }
    if (hash.startsWith('#/share/')) {
      return 'share-landing';
    }

    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      return 'share-landing';
    }
    if (path === '/admin/login') {
      return 'admin-login';
    }
    if (path.startsWith('/admin')) {
      return sessionStorage.getItem('admin_session') === 'active' ? 'admin-panel' : 'admin-login';
    }
    if (path === '/dashboard') {
      return 'dashboard';
    }
    if (path === '/store') {
      return 'store';
    }
    return 'home';
  };

  const [currentView, setViewRaw] = useState(getInitialView);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [theme, setTheme] = useState('light');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Simulator and state sync variables
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealsData, setDealsData] = useState([]);
  const [storesData, setStoresData] = useState([]);
  const [bannersData, setBannersData] = useState([]);
  const [activeComparisonDeal, setActiveComparisonDeal] = useState(null);
  const [sharingDealId, setSharingDealId] = useState(null);
  
  // Checkout states
  const [checkoutDeal, setCheckoutDeal] = useState(null);
  const [checkoutStore, setCheckoutStore] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Details, 2: Success

  // Share Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedShareData, setGeneratedShareData] = useState(null);
  const [shareModalUrl, setShareModalUrl] = useState(null);
  const [shareModalTitle, setShareModalTitle] = useState(null);

  useEffect(() => {
    const syncAppStates = async () => {
      try {
        const [tracking, withdrawals, productsData, dbDeals, storesRes, activeBanners] = await Promise.all([
          apiTracking.getAll().catch(e => { console.warn('Tracking failed:', e); return []; }),
          apiWithdrawals.getAll().catch(e => { console.warn('Withdrawals failed:', e); return []; }),
          apiProducts.getAll().catch(e => { console.warn('Products failed:', e); return []; }),
          apiDeals.getAll().catch(e => { console.warn('Deals failed:', e); return []; }),
          apiStores.getAll().catch(e => { console.warn('Stores failed:', e); return []; }),
          apiBanners.getActive().catch(e => { console.warn('Banners failed:', e); return []; })
        ]);
        setTrackedOrders(tracking || []);
        setWithdrawRequests(withdrawals || []);
        setProducts(productsData || []);
        setDealsData(dbDeals || []);
        setStoresData(storesRes || []);
        setBannersData(activeBanners || []);
      } catch (err) {
        console.error('Failed to sync states:', err);
      }
    };
    syncAppStates();
  }, [currentView, isSimulatorMode]);

  const handleAppWithdrawalRequest = async (newReq) => {
    try {
      const added = await apiWithdrawals.create(newReq);
      setWithdrawRequests(prev => [added, ...prev]);
      
      // Update local wallet view for user
      if (currentUser) {
        setCurrentUser(prev => ({
          ...prev,
          wallet: {
            ...prev.wallet,
            confirmed: Math.max(0, prev.wallet.confirmed - newReq.amount),
            pending: prev.wallet.pending + newReq.amount
          }
        }));
      }
    } catch (err) {
      console.error('Failed to request app withdrawal:', err);
    }
  };

  // Sync routes when logged in
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      if (isAdminLoggedIn) {
        setViewRaw('admin-panel');
        if (path === '/admin/login' || path === '/admin') {
          window.history.pushState(null, '', '/admin/dashboard');
        }
      } else {
        setViewRaw('admin-login');
        if (path !== '/admin/login') {
          window.history.pushState(null, '', '/admin/login');
        }
      }
    }
  }, [isAdminLoggedIn]);

  // Sync navigation popstate
  useEffect(() => {
    const handlePopState = () => {
      setViewRaw(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminLoggedIn]);

  const setView = (viewName) => {
    setViewRaw(viewName);
    
    let newPath = '/';
    let newHash = '';
    if (viewName === 'admin-login') {
      newPath = '/admin/login';
      newHash = '#/admin/login';
    } else if (viewName === 'admin-panel') {
      newPath = '/admin/dashboard';
      newHash = '#/admin/dashboard';
    } else if (viewName === 'home') {
      newPath = '/';
      newHash = '';
    } else if (viewName === 'dashboard') {
      newPath = '/dashboard';
      newHash = '#/dashboard';
    } else if (viewName === 'store') {
      newPath = '/store';
      newHash = '#/store';
    }
    
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleStoreSelect = (id) => {
    setSelectedStoreId(id);
    setView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCtaRedirect = () => {
    // Smooth scroll down to popular stores
    const target = document.querySelector('.stores-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGrabProductDeal = (deal) => {
    if (!currentUser) {
      addNotification('Please login or sign up first to grab deals!', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveComparisonDeal(deal);
  };

  const handleShareDeal = async (deal) => {
    if (!currentUser) {
      addNotification('Please login to share deals.', 'error');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      // Create a tracked share for attribution (doesn't have to be the shared URL)
      const res = await apiAffiliate.createShare(currentUser.id, deal.id).catch(e => { console.warn('createShare failed', e); return null; });

      // Prefer the merchant/affiliate URL if available; fallback to created share landing
      const affiliateUrl = deal.affiliateUrl || deal.link || (deal.comparisons && deal.comparisons[0] && (deal.comparisons[0].link || deal.comparisons[0].affiliateUrl)) || (res && res.shareId ? `${window.location.origin}/?shareId=${res.shareId}` : window.location.href);

      // Save share id locally for attribution on later clicks
      if (res && res.shareId) localStorage.setItem('shareId', res.shareId);

      const title = deal.title || deal.name || 'Check this deal';
      const text = `${title} — Grab this deal now!`;

      // Use native share where available (opens Instagram/Facebook on mobile)
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url: affiliateUrl });
          addNotification('Shared via device share sheet.', 'success');
          return;
        } catch (e) {
          console.warn('navigator.share failed', e);
        }
      }

      // Open a small share modal with explicit options so user can pick network
      setShareModalUrl(affiliateUrl);
      setShareModalTitle(title);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      addNotification('Failed to generate share link.', 'error');
    }
  };

  const executeGrabDealTracked = async (dealItem, storeItem) => {
    if (!currentUser) {
      setActiveComparisonDeal(null);
      addNotification('Please login or sign up first to grab deals!', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveComparisonDeal(null);
    
    try {
      const shareId = localStorage.getItem('shareId');
      const buyerId = currentUser.id;
      await apiAffiliate.createClick(buyerId, shareId, dealItem.id);
      addNotification('Tracker activated! Redirecting...', 'info');
    } catch (e) {
      console.error('Tracking failed, proceeding anyway.', e);
    }
    
    const link = storeItem?.link || dealItem?.affiliateUrl || dealItem?.link;
    setTimeout(() => {
      if (link) {
        window.open(link, '_blank');
      } else {
        window.open('https://google.com', '_blank');
      }
    }, 1500);
  };

  const handleReferLink = async (deal, item) => {
    if (!currentUser) {
      addNotification('Please login to generate a referral link', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      const generated = await apiSharedLinks.create({
        userId: currentUser.id,
        userName: currentUser.name,
        productName: deal.title || deal.name,
        store: item.platform,
        productUrl: item.link || 'https://google.com',
        userSharePercent: 100
      });
      if (generated.shortUrl && generated.shortUrl.includes('cyvanta.cashback')) {
         generated.shortUrl = generated.shortUrl.replace('https://cyvanta.cashback', window.location.origin + '/#');
      }
      setGeneratedShareData(generated);
      setIsShareModalOpen(true);
    } catch (err) {
      addNotification('Failed to generate referral link.', 'error');
    }
  };

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    addNotification(`Logged in successfully as ${userProfile.name}! Welcome back.`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    localStorage.removeItem('admin_session');
    localStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_session');
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setView('home');
    addNotification('Logged out successfully. See you again!', 'info');
  };

  // Filter stores by category
  const filteredStores = activeCategory === 'all'
    ? storesData
    : storesData.filter((s) => s.category === activeCategory);

  const selectedStore = storesData.find((s) => s.id === selectedStoreId);

  // Format deals for display
  const dynamicDeals = React.useMemo(() => {
    let combinedDeals = [];
    
    const storesLogoMap = storesData.reduce((acc, store) => { acc[store.name] = store.logo; return acc; }, {});
    
    if (dealsData && dealsData.length > 0) {
      const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';

      const explicitDeals = dealsData.filter(d => d.status === 'active').map(d => {
        let lowestListedPrice = 0;
        let highestCashbackPercent = 0;
        
        if (d.comparisons && d.comparisons.length > 0) {
          lowestListedPrice = Math.min(...d.comparisons.map(c => c.listedPrice || 0));
          highestCashbackPercent = Math.max(...d.comparisons.map(c => c.cashbackPercent || 0));
        }
        
        const dealPrice = lowestListedPrice > 0 ? lowestListedPrice : 0;
        const retailPrice = dealPrice > 0 ? parseFloat((dealPrice * 1.5).toFixed(2)) : 0;
        const cashbackEarned = dealPrice > 0 ? parseFloat(((dealPrice * highestCashbackPercent) / 100).toFixed(2)) : 0;
        
        const baseDeal = {
          ...d,
          title: d.name,
          category: 'electronics', // Default category for deals
          storeLogo: storesLogoMap['Amazon'] || fallbackLogo,
          retailPrice,
          dealPrice,
          cashbackEarned,
        };
        if (!baseDeal.comparisons || baseDeal.comparisons.length === 0) {
            baseDeal.comparisons = [{
              platform: d.platform || 'Amazon',
              listedPrice: baseDeal.dealPrice,
              cashbackPercent: d.cashbackValue || 10,
              link: d.link || d.affiliateUrl || 'https://google.com'
            }];
        }
        return baseDeal;
      });
      combinedDeals = [...combinedDeals, ...explicitDeals];
    }

    if (products && products.length > 0) {
      const productDeals = products.filter(p => p.status === 'active').map(p => {
        const platform = p.platform || 'Amazon';
        const fallbackLogo = p.storeId && storesData.find(s => s.id === p.storeId)?.logo 
          ? storesData.find(s => s.id === p.storeId).logo 
          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
          
        const storeLogo = storesLogoMap[platform] || storesLogoMap['Amazon'] || fallbackLogo;
        
        let category = p.category;
        if (!category) {
            category = 'electronics';
            const lowerName = p.name ? p.name.toLowerCase() : '';
            const lowerPlatform = platform ? platform.toLowerCase() : '';
            
            if (lowerPlatform === 'myntra' || lowerPlatform === 'ajio' || lowerName.includes('shoes') || lowerName.includes('boots') || lowerName.includes('wear') || lowerName.includes('sneakers')) {
              category = 'fashion';
            } else if (lowerName.includes('clothing') || lowerName.includes('shirt') || lowerName.includes('pants')) {
              category = 'clothing';
            } else if (lowerPlatform === 'nykaa beauty' || lowerName.includes('cleanser') || lowerName.includes('cream') || lowerName.includes('facial') || lowerName.includes('beauty')) {
              category = 'beauty';
            } else if (lowerName.includes('vitamin') || lowerName.includes('supplement') || lowerName.includes('health') || lowerName.includes('medicine')) {
              category = 'health';
            } else if (lowerPlatform === 'makemytrip' || lowerName.includes('flight') || lowerName.includes('hotel') || lowerName.includes('trip')) {
              category = 'travel';
            } else if (lowerName.includes('headphones') || lowerName.includes('laptop') || lowerName.includes('phone') || lowerName.includes('tv') || lowerName.includes('speaker')) {
              category = 'electronics';
            } else if (lowerPlatform === 'amazon') {
              category = 'grocery';
            }
        }
        
        const dealPrice = p.price;
        const retailPrice = parseFloat((dealPrice * 1.5).toFixed(2));
        const cashbackEarned = parseFloat(((dealPrice * p.cashbackValue) / 100).toFixed(2));
        
        const baseDeal = {
          id: p.id,
          title: p.name,
          name: p.name,
          platform: platform,
          retailPrice,
          dealPrice,
          cashbackEarned,
          cashbackValue: p.cashbackValue,
          category,
          storeLogo,
          affiliateUrl: p.affiliateUrl,
          image: p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        };
        
        const sameNameProducts = products.filter(other => 
            other.status === 'active' && 
            other.name && p.name && 
            other.name?.toLowerCase() === p.name?.toLowerCase()
        );

        let dbComparisons = sameNameProducts.map(other => ({
             platform: other.platform || 'Amazon',
             listedPrice: other.price,
             cashbackPercent: other.cashbackValue || 10,
             link: other.affiliateUrl || 'https://google.com'
        }));

        if (dbComparisons.length === 0) {
           dbComparisons = [{
             platform: platform,
             listedPrice: dealPrice,
             cashbackPercent: p.cashbackValue || 10,
             link: p.affiliateUrl || 'https://google.com'
           }];
        }

        return {
          ...baseDeal,
          comparisons: dbComparisons
        };
      });
      combinedDeals = [...combinedDeals, ...productDeals];
    }

    return combinedDeals;
  }, [dealsData, products]);

  if (currentView === 'admin-login') {
    return (
      <div id="root">
        <Notification notifications={notifications} removeNotification={removeNotification} />
        <AdminLogin
          onLoginSuccess={(adminUser) => {
            sessionStorage.setItem('admin_session', 'active');
            localStorage.setItem('user_session', JSON.stringify(adminUser));
            setCurrentUser(adminUser);
            setIsAdminLoggedIn(true);
            setView('admin-panel');
          }}
          onAddNotification={addNotification}
          setView={setView}
        />
      </div>
    );
  }

  if (currentView === 'admin-panel') {
    return (
      <div id="root">
        <Notification notifications={notifications} removeNotification={removeNotification} />
        <AdminPanel
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          onAddNotification={addNotification}
        />
      </div>
    );
  }

  if (isSimulatorMode) {
    return (
      <div id="root">
        <Notification notifications={notifications} removeNotification={removeNotification} />
        
        <div className="simulator-layout-wrapper">
          <div className="simulator-toggle-header">
            <button className="simulator-toggle-btn" onClick={() => setIsSimulatorMode(false)}>
              💻 Desktop Web View
            </button>
            <button className="simulator-toggle-btn active">
              📱 User Mobile App View
            </button>
          </div>

          {/* Smartphone device shell */}
          <div className="smartphone-device-frame">
            <div className="smartphone-status-bar">
              <span>12:55 PM</span>
              <div className="status-bar-right">
                <span>5G</span>
                <div className="status-bar-battery"><div className="battery-fill"></div></div>
              </div>
            </div>
            
            <MobileApp
              currentUser={currentUser}
              trackedOrders={trackedOrders}
              withdrawRequests={withdrawRequests}
              onAddWithdrawalRequest={handleAppWithdrawalRequest}
              storesData={storesData}
              dealsData={dynamicDeals}
              onAddNotification={addNotification}
              openAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />

            <div className="smartphone-home-bar">
              <div className="home-bar-indicator"></div>
            </div>
          </div>
        </div>

        {/* Login / Registration overlay sheet */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }



  return (
    <div id="root">
      {/* Toast Alert Manager */}
      <Notification notifications={notifications} removeNotification={removeNotification} />

      {/* Floating Mode Switcher to Mobile App */}
      <div className="simulator-toggle-header" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, margin: 0 }}>
        <button className="simulator-toggle-btn" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsSimulatorMode(true)}>
          📱 Switch to Mobile App View
        </button>
      </div>

      {/* Header Sticky Component */}
      <Header
        currentView={currentView}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        openAuthModal={() => setIsAuthModalOpen(true)}
        storesData={storesData}
        onStoreSelect={handleStoreSelect}
      />

      <main className="main-container">
        {currentView === 'home' && (
          <>
            {/* Banner Slider */}
            <Hero
              banners={bannersData}
              onCtaClick={handleCtaRedirect}
              setView={setView}
              currentUser={currentUser}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />

            {/* Quick Categories Filter */}
            <CategoryGrid
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* Main Retailers Card Grid */}
            <StoreGrid
              stores={filteredStores}
              onStoreSelect={handleStoreSelect}
            />

            {/* Deals Grid */}
            <TopDeals
              deals={dynamicDeals.slice(0, 8)}
              onGrabDeal={handleGrabProductDeal}
              onShareDeal={handleShareDeal}
            />

            {/* Business Model Explanation */}
            <HowItWorks />

            {/* Customer Review Sliders */}
            <Testimonials />
          </>
        )}

        {currentView === 'store' && selectedStore && (
          <StoreDetail
            store={selectedStore}
            onBack={() => setView('home')}
            onAddNotification={addNotification}
            deals={dynamicDeals.filter(d => {
              return d.platform && selectedStore?.name && d.platform.toLowerCase() === selectedStore.name.toLowerCase();
            })}
            onGrabDeal={handleGrabProductDeal}
            currentUser={currentUser}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            onAddNotification={addNotification}
            setView={setView}
          />
        )}

        {currentView === 'share-landing' && (
          <ShareLanding 
            products={products}
            currentUser={currentUser}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Structured Footer */}
      <Footer setView={setView} />

      {/* Login / Registration overlay sheet */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Checkout Modal (Meesho/Flipkart Style) */}
      {checkoutDeal && checkoutStore && (
        <CheckoutModal
          deal={checkoutDeal}
          store={checkoutStore}
          onClose={() => { setCheckoutDeal(null); setCheckoutStore(null); setCheckoutStoreMeta(null); }}
          onPlaceOrder={finalizeCheckout}
        />
      )}

      {/* Price Comparison Modal */}
      {activeComparisonDeal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-bold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔍 Price & Deals Comparison
              </h3>
              <button
                onClick={() => setActiveComparisonDeal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontWeight: 'bold'
                }}
              >
                &times;
              </button>
            </div>

            {/* Product info banner */}
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--bg)',
              borderBottom: '1px solid var(--border)'
            }}>
              <img
                src={activeComparisonDeal.image}
                alt=""
                style={{
                  width: '70px',
                  height: '70px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid var(--border)'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: 'var(--text-bold)', lineHeight: '1.4' }}>
                  {activeComparisonDeal.title || activeComparisonDeal.name}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'capitalize' }}>
                  Category: <strong>{activeComparisonDeal.category}</strong>
                </span>
              </div>
            </div>

            {/* Platform Comparison List */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {(!activeComparisonDeal.comparisons || activeComparisonDeal.comparisons.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text)' }}>
                  No active comparisons available for this deal.
                </div>
              ) : [...activeComparisonDeal.comparisons]
                .map(comp => {
                  const dealPrice = comp.listedPrice || comp.dealPrice || 0;
                  const cashbackEarned = parseFloat(((dealPrice * (comp.cashbackPercent || 0)) / 100).toFixed(2));
                  return {
                    platform: comp.platform,
                    logo: storesData.find(s => s.name === comp.platform)?.logo || 'default-logo-url',
                    price: dealPrice,
                    cashbackPercent: comp.cashbackPercent || 0,
                    cashbackEarned,
                    link: comp.link
                  };
                })
                .sort((a, b) => a.price - b.price)
                .map((item, index) => {
                const isBestValue = index === 0;
                return (
                  <div
                    key={item.platform + index}
                    style={{
                      border: isBestValue ? '2px solid var(--secondary)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      backgroundColor: 'var(--card-bg)',
                      boxShadow: isBestValue ? '0 4px 12px rgba(16, 185, 129, 0.1)' : 'none'
                    }}
                  >
                    {isBestValue && (
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '16px',
                        backgroundColor: 'var(--secondary)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        🏆 Best Value Deal (Lowest Price)
                      </span>
                    )}

                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={item.logo}
                        alt={item.platform}
                        style={{
                          height: '24px',
                          width: 'auto',
                          maxWidth: '70px',
                          objectFit: 'contain'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text)', textDecoration: 'line-through' }}>
                          Listed Price: ₹{(item.price || 0).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '600' }}>
                          -{item.cashbackPercent}% Commission (-₹{item.cashbackEarned.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Right Price & CTA */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text)' }}>Deal Price:</span>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: isBestValue ? 'var(--secondary)' : 'var(--text-bold)' }}>
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => executeGrabDealTracked(activeComparisonDeal, item)}
                          style={{
                            backgroundColor: isBestValue ? 'var(--secondary)' : 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                          }}
                        >
                          Buy & Earn
                        </button>
                        <button
                          onClick={() => handleReferLink(activeComparisonDeal, item)}
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-bold)',
                            border: '1px solid var(--border)',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                          }}
                        >
                          Refer Link
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--bg)'
            }}>
              <button
                onClick={() => setActiveComparisonDeal(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-bold)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Share Modal Fallback */}
      {isShareModalOpen && shareModalUrl && (
        <div className="modal-overlay animate-fade">
          <div className="modal-content" style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-header">
              <h3>Share Deal</h3>
              <button className="modal-close" onClick={() => { setIsShareModalOpen(false); setShareModalUrl(null); setShareModalTitle(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ marginTop: 0 }}>{shareModalTitle}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '12px' }}>
                {/* WhatsApp */}
                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareModalTitle + ' ' + shareModalUrl)}`, '_blank')} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} aria-label="Share on WhatsApp">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </button>

                {/* Facebook */}
                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModalUrl)}`, '_blank')} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} aria-label="Share on Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </button>

                {/* Instagram (copy then open Instagram) */}
                <button onClick={() => { navigator.clipboard.writeText(shareModalUrl); window.open('https://instagram.com', '_blank'); addNotification('Link copied! Paste it in your Instagram story.', 'info'); }} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} aria-label="Share on Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </button>

                {/* Copy link */}
                <button onClick={async () => { try { await navigator.clipboard.writeText(shareModalUrl); addNotification('Link copied to clipboard!', 'success'); } catch (e) { addNotification('Unable to copy link.', 'error'); } }} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#374151', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} aria-label="Copy link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>{shareModalUrl}</div>
            </div>
            <div className="modal-footer" style={{ paddingTop: '12px' }}>
              <button className="btn-secondary" onClick={() => { setIsShareModalOpen(false); setShareModalUrl(null); setShareModalTitle(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Checkout Modal */}
      {isCheckoutModalOpen && checkoutDeal && checkoutItem && (
        <div className="modal-overlay animate-fade">
          <div className="modal-content checkout-modal" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>Secure Checkout</h3>
                <button className="modal-close" onClick={() => { setIsCheckoutModalOpen(false); setCheckoutStoreMeta(null); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {checkoutStep === 1 ? (
                <>
                  {/* Order Summary */}
                  <div className="checkout-summary-card" style={{ padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-bold)' }}>Order Summary</h4>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={checkoutDeal.image} alt="Product" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'white' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-bold)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{checkoutDeal.title || checkoutDeal.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text)', marginTop: '4px' }}>Sold by: {checkoutItem.platform}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-bold)' }}>₹{checkoutItem.dealPrice.toFixed(2)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: '600' }}>Includes ₹{checkoutItem.cashbackEarned.toFixed(2)} Commission</div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="checkout-section">
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-bold)' }}>Delivery Address</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input type="text" placeholder="Full Name" className="admin-form-input" style={{ gridColumn: '1 / -1' }} />
                      <input type="text" placeholder="Street Address" className="admin-form-input" style={{ gridColumn: '1 / -1' }} />
                      <input type="text" placeholder="City" className="admin-form-input" />
                      <input type="text" placeholder="Postal Code" className="admin-form-input" />
                      <input type="tel" placeholder="Phone Number" className="admin-form-input" style={{ gridColumn: '1 / -1' }} />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="checkout-section">
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-bold)' }}>Payment Method</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label className="checkout-payment-option" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--card-bg)' }}>
                        <input type="radio" name="paymentMethod" defaultChecked style={{ marginTop: '3px' }} />
                        <div className="payment-option-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-bold)' }}>Credit/Debit Card</span>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>Visa, MasterCard, RuPay</span>
                        </div>
                      </label>
                      <label className="checkout-payment-option" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--card-bg)' }}>
                        <input type="radio" name="paymentMethod" style={{ marginTop: '3px' }} />
                        <div className="payment-option-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-bold)' }}>UPI (GPay, PhonePe, Paytm)</span>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>Instant secure payment</span>
                        </div>
                      </label>
                      <label className="checkout-payment-option" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--card-bg)' }}>
                        <input type="radio" name="paymentMethod" style={{ marginTop: '3px' }} />
                        <div className="payment-option-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-bold)' }}>Cash on Delivery</span>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>Pay when you receive the product</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleUp 0.5s ease-out' }}>
                    <Check size={32} />
                  </div>
                  <h3 style={{ fontSize: '24px', color: 'var(--text-bold)', margin: 0 }}>Order Confirmed!</h3>
                  <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                    Your order for <strong>{checkoutDeal.title || checkoutDeal.name}</strong> has been successfully placed with {checkoutItem.platform}.
                  </p>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: '8px', color: 'var(--secondary)', fontSize: '14px', fontWeight: '600', marginTop: '8px' }}>
                    🎉 You will earn ₹{checkoutItem.cashbackEarned.toFixed(2)} cashback on this order!
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--card-bg)' }}>
              {checkoutStep === 1 ? (
                <>
                  <button className="btn-secondary" onClick={() => setIsCheckoutModalOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={async () => {
                    setCheckoutStep(2);
                    
                    const orderDateStr = new Date().toISOString().split('T')[0];
                    const returnExpiryDate = new Date();
                    returnExpiryDate.setDate(returnExpiryDate.getDate() + 7);
                    const returnExpiryDateStr = returnExpiryDate.toISOString().split('T')[0];
                    
                    // Generate mock device and IP
                    const devices = [
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)'
                    ];
                    const ips = ['192.168.1.1', '10.0.0.5', '172.16.0.4', '104.28.1.1'];
                    
                    // Parse selected payment method
                    const paymentRadios = document.getElementsByName('paymentMethod');
                    let selectedPayment = 'Credit/Debit Card';
                    for (const r of paymentRadios) {
                      if (r.checked) {
                        const labelText = r.nextElementSibling.querySelector('span').innerText;
                        selectedPayment = labelText.includes('UPI') ? 'UPI' : (labelText.includes('Cash') ? 'Cash on Delivery' : 'Credit/Debit Card');
                        break;
                      }
                    }

                    const newOrderPayload = {
                      userId: currentUser ? currentUser.id : 'u1',
                      userName: currentUser ? currentUser.name : 'Guest User',
                      productId: checkoutDeal.id || 'N/A',
                      productName: checkoutDeal.title || checkoutDeal.name,
                      platform: checkoutItem.platform,
                      price: checkoutItem.dealPrice,
                      cashbackAmount: checkoutItem.cashbackEarned,
                      status: 'pending',
                      orderDate: orderDateStr,
                      confirmedDate: orderDateStr,
                      returnExpiryDate: returnExpiryDateStr,
                      returnWindowDays: 7,
                      
                      // Detailed new tracking metrics
                      clickId: checkoutStoreMeta && checkoutStoreMeta.clickId ? checkoutStoreMeta.clickId : 'CLK-' + Math.floor(Math.random() * 100000000),
                      shareId: checkoutStoreMeta && checkoutStoreMeta.shareId ? checkoutStoreMeta.shareId : null,
                      productImage: checkoutDeal.image,
                      affiliateUrl: checkoutItem.link || 'N/A',
                      category: checkoutDeal.category || 'electronics',
                      cashbackPercent: checkoutItem.cashbackPercent,
                      paymentMethod: selectedPayment,
                      deviceName: devices[Math.floor(Math.random() * devices.length)],
                      ipAddress: ips[Math.floor(Math.random() * ips.length)]
                    };
                    
                    try {
                      const savedOrder = await apiTracking.create(newOrderPayload);
                      setTrackedOrders([savedOrder, ...trackedOrders]);
                      addNotification(`Order placed successfully! ₹${checkoutItem.cashbackEarned.toFixed(2)} cashback is pending.`, 'success');
                    } catch (err) {
                      addNotification('Failed to save order tracking metadata.', 'error');
                      console.error(err);
                    }
                  }}>
                    Confirm & Pay ₹{checkoutItem.dealPrice.toFixed(2)}
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setIsCheckoutModalOpen(false)}>Continue Shopping</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && generatedShareData && (
        <div className="modal-overlay animate-fade">
          <div className="modal-content share-modal" style={{ maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>Share Referral Link</h3>
              <button className="modal-close" onClick={() => setIsShareModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <p style={{ color: 'var(--text)', fontSize: '14px', margin: '0 0 16px 0' }}>
                  Share this link with your friends! When they purchase <strong>{generatedShareData.productName}</strong> via this link, both of you will earn cashback!
                </p>
                <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedShareData.shortUrl} 
                    style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: 'var(--text-bold)', fontSize: '14px', outline: 'none' }} 
                  />
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedShareData.shortUrl);
                      addNotification('Link copied to clipboard!', 'success');
                    }}
                    style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px' }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-bold)', textAlign: 'center' }}>Share directly via</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {/* WhatsApp */}
                  <button onClick={() => window.open(`https://wa.me/?text=Check out this deal: ${generatedShareData.shortUrl}`, '_blank')} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </button>
                  {/* Facebook */}
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${generatedShareData.shortUrl}`, '_blank')} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </button>
                  {/* Instagram (Copies and opens insta.com since no direct share URL exists) */}
                  <button onClick={() => { navigator.clipboard.writeText(generatedShareData.shortUrl); window.open('https://instagram.com', '_blank'); addNotification('Link copied! Paste it in your Instagram story.', 'info'); }} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </button>
                  {/* Snapchat */}
                  <button onClick={() => window.open(`https://snapchat.com/scan?attachmentUrl=${generatedShareData.shortUrl}`, '_blank')} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#FFFC00', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16c-1.2 0-2-.8-2-2a2 2 0 0 1 2-2h.5A6 6 0 0 1 10 5.4a6 6 0 0 1 5.5 6.6H16a2 2 0 0 1 2 2c0 1.2-.8 2-2 2h-.5c-.8 1-2.2 1.6-3.5 1.6s-2.7-.6-3.5-1.6H4z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
