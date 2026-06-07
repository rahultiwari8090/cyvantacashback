import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import StoreGrid from './components/StoreGrid';
import TopDeals from './components/TopDeals';
import CashbackCalculator from './components/CashbackCalculator';
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
import { apiTracking, apiWithdrawals, apiProducts } from './services/api';
import './index.css';
import './App.css';

// --- MOCK DATA ---
const STORES_DATA = [
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    cashbackRate: '10%',
    description: 'Shop groceries, home equipment, kitchen essentials, and electronics with special cash bonuses.',
    category: 'grocery',
    isPopular: true,
    coupons: [
      { id: 'a1', title: 'Up to 50% Off Kitchen Ware + 10% Cashback', description: 'No coupon code needed. Shop cooking pots, blenders, and cutleries.', expiry: '2026-06-30' },
      { id: 'a2', title: 'Flat ₹10 Off Groceries on Orders Above ₹80', description: 'Use voucher code at checkout to claim instant checkout reduction.', code: 'AMZGROC10', expiry: '2026-06-15' },
      { id: 'a3', title: 'Save 20% on Amazon Smart Alexa Speakers', description: 'Claim tracking and get 10% cash reward on all echo dot versions.', expiry: '2026-07-10' },
    ],
  },
  {
    id: 'myntra',
    name: 'Myntra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    cashbackRate: '12%',
    description: 'Explore trendy lifestyle collections, designer clothes, sports sneakers, and cosmetics.',
    category: 'fashion',
    isPopular: true,
    coupons: [
      { id: 'm1', title: 'Extra 15% Discount on Trendsetter Winter Jackets', description: 'Redeem at checkout. Applicable on all popular high fashion brands.', code: 'MYNTRAJACK', expiry: '2026-06-20' },
      { id: 'm2', title: 'Up to 60% Off Footwear & Shoes + 12% Rewards', description: 'Explore Adidas, Nike, Puma, and Woodland casual wear.', expiry: '2026-07-05' },
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=flipkart.com',
    cashbackRate: '8.5%',
    description: 'Leading platform for mobile electronics, large home appliances, books, and home decors.',
    category: 'electronics',
    isPopular: true,
    coupons: [
      { id: 'f1', title: 'Save ₹50 on Newly Launched Android Smartphones', description: 'Redeem code at checkouts. Applicable on all credit/debit bank cards.', code: 'FLIPMOBILE50', expiry: '2026-06-25' },
      { id: 'f2', title: '40% Off Laptops & Accessories + 8.5% Real Rewards', description: 'Shop HP, Dell, Asus, and Lenovo gaming laptops today.', expiry: '2026-06-12' },
    ],
  },
  {
    id: 'ajio',
    name: 'Ajio',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=ajio.com',
    cashbackRate: '15%',
    description: 'Sleek luxury fashion and handpicked streetwear brands from independent designers.',
    category: 'fashion',
    isPopular: true,
    coupons: [
      { id: 'aj1', title: 'Extra 25% Off on Purchases Over ₹120', description: 'Claim storewide discount on all independent designer clothing labels.', code: 'AJIOMAX25', expiry: '2026-06-30' },
      { id: 'aj2', title: 'Flat ₹20 Off Streetwear Hoodies and Cargo Pants', description: 'Redeem coupon for street apparel and winter outfits.', code: 'STREET20', expiry: '2026-07-20' },
    ],
  },
  {
    id: 'nykaa',
    name: 'Nykaa Beauty',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=nykaa.com',
    cashbackRate: '7%',
    description: 'Premium cosmetic brands, organic lipsticks, haircare, and skin treatment formulas.',
    category: 'health',
    isPopular: false,
    coupons: [
      { id: 'n1', title: 'Flat ₹5 Off Skin Hydration Creams', description: 'Applicable on Cetaphil, Nivea, and Neutrogena collections.', code: 'GLOWSKIN5', expiry: '2026-06-18' },
      { id: 'n2', title: 'Save 30% on Organic Hair Oils & Organic Cleansers', description: 'Get tracked and claim commission on all clean beauty goods.', expiry: '2026-06-30' },
    ],
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=makemytrip.com',
    cashbackRate: '9%',
    description: 'Book domestic flights, international vacations, hotels, and intercity cab packages.',
    category: 'travel',
    isPopular: false,
    coupons: [
      { id: 'mmt1', title: 'Extra ₹100 Off on International Flight Bookings', description: 'Redeem flight voucher at checkout. Minimal order requirements apply.', code: 'FLYGLOBAL', expiry: '2026-08-31' },
      { id: 'mmt2', title: 'Up to 30% Off Resorts and Luxury Hotel Stays', description: 'Activate deal and earn 9% cashback on all travel reservations.', expiry: '2026-07-15' },
    ],
  },
];

const DEALS_DATA = [
  {
    id: 'd1',
    title: 'boAt Rockerz 450 Bluetooth On-Ear Headphones with Mic',
    retailPrice: 59.99,
    dealPrice: 29.99,
    cashbackEarned: 3.00, // 10% of deal price
    category: 'electronics',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
  },
  {
    id: 'd2',
    title: 'Adidas UltraBoost 22 Performance Athletic Sports Shoes',
    retailPrice: 180.00,
    dealPrice: 110.00,
    cashbackEarned: 13.20, // 12% of deal price
    category: 'fashion',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
  },
  {
    id: 'd3',
    title: 'HP Pavilion 15.6" Touchscreen Laptop (Intel Core i5, 16GB RAM)',
    retailPrice: 799.99,
    dealPrice: 549.99,
    cashbackEarned: 46.75, // 8.5% of deal price
    category: 'electronics',
    storeLogo: 'https://www.google.com/s2/favicons?sz=256&domain=flipkart.com',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300',
  },
  {
    id: 'd4',
    title: 'Cetaphil Daily Facial Cleanser - Hydrating Skincare Gel',
    retailPrice: 19.99,
    dealPrice: 14.99,
    cashbackEarned: 1.05, // 7% of deal price
    category: 'health',
    storeLogo: 'https://www.google.com/s2/favicons?sz=256&domain=nykaa.com',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300',
  },
];

const STORES_LOGO_MAP = {
  'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'Myntra': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
  'Flipkart': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
  'Ajio': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Ajio_Logo.svg',
  'Nykaa Beauty': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nykaa_Logo.svg',
  'MakeMyTrip': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/MakeMyTrip_Logo.svg'
};

const mapProductsToDeals = (productsList) => {
  if (!productsList || productsList.length === 0) {
    return DEALS_DATA;
  }
  const activeProducts = productsList.filter(p => p.status === 'active');
  if (activeProducts.length === 0) {
    return DEALS_DATA;
  }
  return activeProducts.map(p => {
    const platform = p.platform || 'Amazon';
    const storeLogo = STORES_LOGO_MAP[platform] || STORES_LOGO_MAP['Amazon'];
    
    let category = 'electronics';
    const lowerName = p.name.toLowerCase();
    const lowerPlatform = platform.toLowerCase();
    
    if (lowerPlatform === 'myntra' || lowerPlatform === 'ajio' || lowerName.includes('shoes') || lowerName.includes('clothing') || lowerName.includes('boots') || lowerName.includes('wear')) {
      category = 'fashion';
    } else if (lowerPlatform === 'nykaa beauty' || lowerName.includes('cleanser') || lowerName.includes('cream') || lowerName.includes('facial') || lowerName.includes('beauty')) {
      category = 'health';
    } else if (lowerPlatform === 'makemytrip' || lowerName.includes('flight') || lowerName.includes('hotel') || lowerName.includes('trip')) {
      category = 'travel';
    } else if (lowerName.includes('headphones') || lowerName.includes('laptop') || lowerName.includes('phone') || lowerName.includes('tv') || lowerName.includes('speaker')) {
      category = 'electronics';
    } else if (lowerPlatform === 'amazon') {
      category = 'grocery';
    }
    
    const dealPrice = p.price;
    const retailPrice = parseFloat((dealPrice * 1.5).toFixed(2));
    const cashbackEarned = parseFloat(((dealPrice * p.cashbackValue) / 100).toFixed(2));
    
    return {
      id: p.id,
      title: p.name,
      retailPrice,
      dealPrice,
      cashbackEarned,
      category,
      storeLogo,
      image: p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
    };
  });
};

const STORES_INFO = [
  { platform: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', cashbackPercent: 10.0 },
  { platform: 'Flipkart', logo: 'https://www.google.com/s2/favicons?sz=256&domain=flipkart.com', cashbackPercent: 8.5 },
  { platform: 'Myntra', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png', cashbackPercent: 12.0 },
  { platform: 'Ajio', logo: 'https://www.google.com/s2/favicons?sz=256&domain=ajio.com', cashbackPercent: 15.0 },
  { platform: 'Nykaa Beauty', logo: 'https://www.google.com/s2/favicons?sz=256&domain=nykaa.com', cashbackPercent: 7.0 },
  { platform: 'MakeMyTrip', logo: 'https://www.google.com/s2/favicons?sz=256&domain=makemytrip.com', cashbackPercent: 9.0 }
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
    return storedUser ? JSON.parse(storedUser) : null;
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

    const path = window.location.pathname;
    if (path === '/admin/login') {
      return 'admin-login';
    }
    if (path.startsWith('/admin')) {
      return sessionStorage.getItem('admin_session') === 'active' ? 'admin-panel' : 'admin-login';
    }
    if (path === '/dashboard') {
      return 'dashboard';
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
  const [activeComparisonDeal, setActiveComparisonDeal] = useState(null);
  const [sharingDealId, setSharingDealId] = useState(null);
  
  // Checkout states
  const [checkoutDeal, setCheckoutDeal] = useState(null);
  const [checkoutStore, setCheckoutStore] = useState(null);

  // Load initial tracked orders, withdrawal requests, and products to sync between views
  useEffect(() => {
    const syncAppStates = async () => {
      try {
        const [tracking, withdrawals, productsData] = await Promise.all([
          apiTracking.getAll(),
          apiWithdrawals.getAll(),
          apiProducts.getAll()
        ]);
        setTrackedOrders(tracking);
        setWithdrawRequests(withdrawals);
        setProducts(productsData);
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
    setActiveComparisonDeal(deal);
  };

  const executeGrabDealTracked = (dealItem, storeItem) => {
    setActiveComparisonDeal(null);
    setSharingDealId(null);
    
    // Instead of redirecting immediately, open native checkout modal
    setCheckoutDeal(dealItem);
    setCheckoutStore(storeItem);
  };

  const finalizeCheckout = async (dealItem, storeItem) => {
    setCheckoutDeal(null);
    setCheckoutStore(null);
    
    // Create actual tracking entry in the database
    if (currentUser) {
      try {
        const newTracking = await apiTracking.create({
          userName: currentUser.name,
          platform: storeItem.platform,
          productName: dealItem.title || dealItem.name,
          price: storeItem.dealPrice,
          cashbackAmount: storeItem.cashbackEarned,
          status: 'ordered',
          orderDate: new Date().toISOString().split('T')[0],
          returnWindowDays: 7
        });
        setTrackedOrders(prev => [newTracking, ...prev]);
        addNotification(`Order placed successfully! ₹${storeItem.cashbackEarned.toFixed(2)} cashback is tracking.`, 'success');
      } catch (err) {
        console.error('Failed to register tracking:', err);
      }
    } else {
      addNotification('Note: You bought as a Guest. Login next time to earn cashback!', 'info');
    }
  };

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    addNotification(`Logged in successfully as ${userProfile.name}! Welcome back.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    addNotification('Logged out successfully. See you again!', 'info');
  };

  // Filter stores by category
  const filteredStores = activeCategory === 'all'
    ? STORES_DATA
    : STORES_DATA.filter((s) => s.category === activeCategory);

  const selectedStore = STORES_DATA.find((s) => s.id === selectedStoreId);

  // Map and cache dynamic product deals
  const dynamicDeals = React.useMemo(() => mapProductsToDeals(products), [products]);

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
          onLogout={() => {
            sessionStorage.removeItem('admin_session');
            setIsAdminLoggedIn(false);
            setView('home');
            addNotification('Logged out from admin panel.', 'info');
          }}
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
              storesData={STORES_DATA}
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
        storesData={STORES_DATA}
        onStoreSelect={handleStoreSelect}
      />

      <main className="main-container">
        {currentView === 'home' && (
          <>
            {/* Banner Slider */}
            <Hero
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
              deals={dynamicDeals}
              onGrabDeal={handleGrabProductDeal}
            />

            {/* Interactive Calculator Slider */}
            <CashbackCalculator />

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
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            onAddNotification={addNotification}
            setView={setView}
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
          onClose={() => { setCheckoutDeal(null); setCheckoutStore(null); }}
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
                🔍 Price & Cashback Comparison
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
              {generatePriceComparisons(activeComparisonDeal).map((item, index) => {
                const isBestValue = index === 0;
                return (
                  <div
                    key={item.platform}
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
                          Listed Price: ₹{item.dealPrice.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '600' }}>
                          -{item.cashbackPercent}% Cashback (-₹{item.cashbackEarned.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Right Price & CTA */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text)' }}>Effective Price:</span>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: isBestValue ? 'var(--secondary)' : 'var(--text-bold)' }}>
                          ₹{item.effectivePrice.toFixed(2)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
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
                            width: '100px'
                          }}
                        >
                          Buy & Earn
                        </button>
                        
                        <button
                          onClick={() => setSharingDealId(sharingDealId === item.platform ? null : item.platform)}
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-bold)',
                            border: '1px solid var(--border)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100px',
                            gap: '4px'
                          }}
                        >
                          🔗 Refer / Share
                        </button>

                        {/* Custom Social Share Popover */}
                        {sharingDealId === item.platform && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '10px',
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            padding: '16px',
                            zIndex: 10,
                            width: '220px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            animation: 'fadeIn 0.2s ease',
                            transformOrigin: 'top right'
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', letterSpacing: '0.5px' }}>SHARE DEAL VIA</span>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                              {/* WhatsApp */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <button onClick={() => addNotification('Opening WhatsApp...', 'info')} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </button>
                                <span style={{ fontSize: '9px', color: 'var(--text-bold)', fontWeight: '600' }}>WhatsApp</span>
                              </div>

                              {/* Facebook */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <button onClick={() => addNotification('Opening Facebook...', 'info')} style={{ background: '#1877F2', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(24, 119, 242, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </button>
                                <span style={{ fontSize: '9px', color: 'var(--text-bold)', fontWeight: '600' }}>Facebook</span>
                              </div>

                              {/* Telegram */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <button onClick={() => addNotification('Opening Telegram...', 'info')} style={{ background: '#0088cc', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 136, 204, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                </button>
                                <span style={{ fontSize: '9px', color: 'var(--text-bold)', fontWeight: '600' }}>Telegram</span>
                              </div>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`Get ₹${item.cashbackEarned.toFixed(2)} cashback on ${item.platform} via Cyvanta! Link: https://cyvanta.cashback/deal/${activeComparisonDeal.id}`);
                                setSharingDealId(null);
                                addNotification('Deal link copied to clipboard!', 'success');
                              }}
                              style={{
                                background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-bold)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background='var(--border)'} 
                              onMouseOut={e => e.currentTarget.style.background='var(--bg)'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              Copy Referral Link
                            </button>
                          </div>
                        )}
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
    </div>
  );
}
