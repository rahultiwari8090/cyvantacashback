import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Platform, SafeAreaView } from 'react-native';
import MobileApp from './components/MobileApp';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import StoreDetail from './components/StoreDetail';
import { apiTracking, apiWithdrawals, apiProducts } from './services/api';

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
  },
  {
    id: 'myntra',
    name: 'Myntra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    cashbackRate: '12%',
    description: 'Explore trendy lifestyle collections, designer clothes, sports sneakers, and cosmetics.',
    category: 'fashion',
    isPopular: true,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
    cashbackRate: '8.5%',
    description: 'Leading platform for mobile electronics, large home appliances, books, and home decors.',
    category: 'electronics',
    isPopular: true,
  },
  {
    id: 'ajio',
    name: 'Ajio',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Ajio_Logo.svg',
    cashbackRate: '15%',
    description: 'Sleek luxury fashion and handpicked streetwear brands from independent designers.',
    category: 'fashion',
    isPopular: true,
  },
  {
    id: 'nykaa',
    name: 'Nykaa Beauty',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nykaa_Logo.svg',
    cashbackRate: '7%',
    description: 'Premium cosmetic brands, organic lipsticks, haircare, and skin treatment formulas.',
    category: 'health',
    isPopular: false,
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/MakeMyTrip_Logo.svg',
    cashbackRate: '9%',
    description: 'Book domestic flights, international vacations, hotels, and intercity cab packages.',
    category: 'travel',
    isPopular: false,
  },
];

const DEALS_DATA = [
  {
    id: 'd1',
    title: 'boAt Rockerz 450 Bluetooth On-Ear Headphones with Mic',
    retailPrice: 59.99,
    dealPrice: 29.99,
    cashbackEarned: 3.00,
    category: 'electronics',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
  },
  {
    id: 'd2',
    title: 'Adidas UltraBoost 22 Performance Athletic Sports Shoes',
    retailPrice: 180.00,
    dealPrice: 110.00,
    cashbackEarned: 13.20,
    category: 'fashion',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
  },
  {
    id: 'd3',
    title: 'HP Pavilion 15.6" Touchscreen Laptop (Intel Core i5, 16GB RAM)',
    retailPrice: 799.99,
    dealPrice: 549.99,
    cashbackEarned: 46.75,
    category: 'electronics',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300',
  },
  {
    id: 'd4',
    title: 'Cetaphil Daily Facial Cleanser - Hydrating Skincare Gel',
    retailPrice: 19.99,
    dealPrice: 14.99,
    cashbackEarned: 1.05,
    category: 'health',
    storeLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nykaa_Logo.svg',
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load initial tracked orders, withdrawal requests, and products
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
      console.error('Failed to sync states on native:', err);
    }
  };

  useEffect(() => {
    syncAppStates();
  }, [currentUser, currentView]);

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
      syncAppStates();
    } catch (err) {
      console.error('Failed to request app withdrawal:', err);
    }
  };

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    addNotification(`Logged in successfully as ${userProfile.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addNotification('Logged out successfully.', 'info');
  };

  const selectedStore = STORES_DATA.find((s) => s.id === selectedStoreId);

  // Map and cache dynamic product deals
  const dynamicDeals = React.useMemo(() => mapProductsToDeals(products), [products]);

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' ? styles.containerDark : styles.containerLight]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#090d16' : '#ffffff'} 
      />
      <Notification 
        notifications={notifications} 
        removeNotification={removeNotification} 
        theme={theme}
      />
      
      {currentView === 'home' && (
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
          theme={theme}
          toggleTheme={toggleTheme}
          onStoreSelect={(id) => {
            setSelectedStoreId(id);
            setCurrentView('store');
          }}
        />
      )}

      {currentView === 'store' && selectedStore && (
        <StoreDetail
          store={selectedStore}
          onBack={() => setCurrentView('home')}
          onAddNotification={addNotification}
          theme={theme}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#090d16',
  },
});