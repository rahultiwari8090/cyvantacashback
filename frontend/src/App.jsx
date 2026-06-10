import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Platform, SafeAreaView } from 'react-native';
import MobileApp from './components/MobileApp';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import StoreDetail from './components/StoreDetail';
import { apiTracking, apiWithdrawals, apiProducts, apiUsers, apiStores, apiDeals } from './services/api';

const mapProductsToDeals = (productsList, dbDealsList, storesData) => {
  let combinedDeals = [];
  const storesLogoMap = storesData?.reduce((acc, store) => { acc[store.name] = store.logo; return acc; }, {}) || {};
  const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';

  if (dbDealsList && dbDealsList.length > 0) {
    const explicitDeals = dbDealsList.filter(d => d.status === 'active').map(d => {
      let lowestListedPrice = 0;
      let highestCashbackPercent = 0;
      if (d.comparisons && d.comparisons.length > 0) {
        lowestListedPrice = Math.min(...d.comparisons.map(c => c.listedPrice || 0));
        highestCashbackPercent = Math.max(...d.comparisons.map(c => c.cashbackPercent || 0));
      }
      const dealPrice = lowestListedPrice > 0 ? lowestListedPrice : 0;
      const retailPrice = dealPrice > 0 ? parseFloat((dealPrice * 1.5).toFixed(2)) : 0;
      const cashbackEarned = dealPrice > 0 ? parseFloat(((dealPrice * highestCashbackPercent) / 100).toFixed(2)) : 0;
      return {
        ...d,
        title: d.name,
        category: 'electronics',
        storeLogo: storesLogoMap['Amazon'] || fallbackLogo,
        retailPrice,
        dealPrice,
        cashbackEarned,
      };
    });
    combinedDeals = [...combinedDeals, ...explicitDeals];
  }

  if (productsList && productsList.length > 0) {
    const activeProducts = productsList.filter(p => p.status === 'active');
    const productDeals = activeProducts.map(p => {
      const platform = p.platform || 'Amazon';
      const storeLogo = storesLogoMap[platform] || fallbackLogo;
      
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
    combinedDeals = [...combinedDeals, ...productDeals];
  }
  return combinedDeals;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [storesData, setStoresData] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load initial tracked orders, withdrawal requests, and products
  const syncAppStates = async () => {
    try {
      const [tracking, withdrawals, productsData, dbDeals, storesRes] = await Promise.all([
        apiTracking.getAll(),
        apiWithdrawals.getAll(),
        apiProducts.getAll(),
        apiDeals.getAll(),
        apiStores.getAll()
      ]);
      setTrackedOrders(tracking || []);
      setWithdrawRequests(withdrawals || []);
      setProducts(productsData || []);
      setDeals(dbDeals || []);
      setStoresData(storesRes || []);
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

  const handleLogin = async (userProfile) => {
    try {
      await apiUsers.login(userProfile);
      setCurrentUser(userProfile);
      addNotification(`Logged in successfully as ${userProfile.name}!`, 'success');
    } catch (e) {
      console.error(e);
      addNotification('Failed to login to server.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addNotification('Logged out successfully.', 'info');
  };

  const selectedStore = storesData.find((s) => s.id === selectedStoreId);

  // Map and cache dynamic product deals
  const dynamicDeals = React.useMemo(() => mapProductsToDeals(products, deals, storesData), [products, deals, storesData]);

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
          storesData={storesData}
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