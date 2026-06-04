import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users as UsersIcon,
  ShoppingBag,
  Gift,
  Wallet,
  MousePointer,
  CheckSquare,
  Share2,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  Truck,
} from 'lucide-react';
import '../Admin.css';

// Subcomponents to import
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminCashback from './AdminCashback';
import AdminWithdrawals from './AdminWithdrawals';
import AdminClickLogs from './AdminClickLogs';
import AdminConversions from './AdminConversions';
import AdminReferrals from './AdminReferrals';
import AdminSettings from './AdminSettings';
import AdminTracking from './AdminTracking';
import AdminSharedCommissions from './AdminSharedCommissions';
import {
  apiUsers,
  apiProducts,
  apiTracking,
  apiCashback,
  apiWithdrawals,
  apiAnalytics,
  apiFinance,
  apiSettings,
  apiSharedLinks,
  apiSharedCommissions
} from '../services/api';

export default function AdminPanel({ onLogout, theme, toggleTheme, onAddNotification }) {
  const getInitialTab = () => {
    const hash = window.location.hash;
    if (hash === '#/admin/users') return 'users';
    if (hash === '#/admin/products') return 'products';
    if (hash === '#/admin/cashback') return 'cashback';
    if (hash === '#/admin/withdrawals') return 'withdrawals';
    if (hash === '#/admin/click-logs') return 'click-logs';
    if (hash === '#/admin/conversions') return 'conversions';
    if (hash === '#/admin/referrals') return 'referrals';
    if (hash === '#/admin/settings') return 'settings';
    if (hash === '#/admin/tracking') return 'tracking';
    if (hash === '#/admin/shared-commissions') return 'shared-commissions';

    const path = window.location.pathname;
    if (path === '/admin/users') return 'users';
    if (path === '/admin/products') return 'products';
    if (path === '/admin/cashback') return 'cashback';
    if (path === '/admin/withdrawals') return 'withdrawals';
    if (path === '/admin/click-logs') return 'click-logs';
    if (path === '/admin/conversions') return 'conversions';
    if (path === '/admin/referrals') return 'referrals';
    if (path === '/admin/settings') return 'settings';
    if (path === '/admin/tracking') return 'tracking';
    if (path === '/admin/shared-commissions') return 'shared-commissions';
    return 'dashboard';
  };

  const [activeTab, setActiveTabRaw] = useState(getInitialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const setActiveTab = (tabId) => {
    setActiveTabRaw(tabId);
    const newHash = `#/admin/${tabId}`;
    const newPath = `/admin/${tabId}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  React.useEffect(() => {
    const handleAdminPopState = () => {
      setActiveTabRaw(getInitialTab());
    };
    window.addEventListener('popstate', handleAdminPopState);
    return () => window.removeEventListener('popstate', handleAdminPopState);
  }, []);

  // --- GLOBAL CONSTANTS STATE ---
  const [globalSettings, setGlobalSettings] = useState({
    cashbackPercent: 8.0,
    holdDays: 30,
    minimumWithdrawal: 10.00,
  });

  // --- DATABASE STATE ---
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cashbackList, setCashbackList] = useState([]);
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sharedCommissions, setSharedCommissions] = useState([]);
  const [finance, setFinance] = useState({
    totalRevenue: 0.00,
    totalCashbackPaid: 0.00,
    totalWithdrawPaid: 0.00,
    pendingWithdrawals: 0.00,
    transactions: [],
  });

  // --- FETCH DATA FROM SPRING BOOT / MOCK ON MOUNT ---
  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [
          usersData,
          productsData,
          cashbackData,
          trackingData,
          withdrawData,
          clicksData,
          conversionsData,
          financeData,
          settingsData,
          sharedLinksData,
          sharedCommissionsData
        ] = await Promise.all([
          apiUsers.getAll(),
          apiProducts.getAll(),
          apiCashback.getAll(),
          apiTracking.getAll(),
          apiWithdrawals.getAll(),
          apiAnalytics.getClickLogs(),
          apiAnalytics.getConversions(),
          apiFinance.getData(),
          apiSettings.get(),
          apiSharedLinks.getAll(),
          apiSharedCommissions.getAll()
        ]);

        setUsers(usersData);
        setProducts(productsData);
        setCashbackList(cashbackData);
        setTrackedOrders(trackingData);
        setWithdrawRequests(withdrawData);
        setClickLogs(clicksData);
        setConversions(conversionsData);
        setFinance(financeData);
        setGlobalSettings(settingsData);
        setSharedLinks(sharedLinksData);
        setSharedCommissions(sharedCommissionsData);
      } catch (err) {
        console.error('Failed to load Spring Boot dashboard APIs:', err);
        onAddNotification('Failed to sync data with backend.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // --- AUTOMATIC EXPIRED RETURN WINDOWS CHECKER ---
  React.useEffect(() => {
    if (trackedOrders.length === 0) return;

    const checkExpirations = () => {
      const today = new Date();
      trackedOrders.forEach(o => {
        if (o.status === 'return_active' && o.returnExpiryDate) {
          const expiryDate = new Date(o.returnExpiryDate);
          if (expiryDate <= today) {
            console.log(`[Auto-Expiry] Return window for order ${o.id} expired. Completing tracking.`);
            updateTrackedOrderStatus(o.id, 'completed');
            onAddNotification(`Return window for order ${o.id} has expired. Cashback approved!`, 'success');
          }
        }
      });
    };

    checkExpirations();

    const interval = setInterval(checkExpirations, 10000);
    return () => clearInterval(interval);
  }, [trackedOrders]);

  const mockAdminEmail = "admin@cyvanta.com";

  // Sidebar menu configuration mapping
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'tracking', label: 'Product Tracking', icon: Truck },
    { id: 'cashback', label: 'Cashback', icon: Gift },
    { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
    { id: 'click-logs', label: 'Click Logs', icon: MousePointer },
    { id: 'conversions', label: 'Conversions', icon: CheckSquare },
    { id: 'shared-commissions', label: 'Shared Commissions', icon: Share2 },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Helper actions
  const addProduct = async (prod) => {
    try {
      const newProd = await apiProducts.create(prod);
      setProducts((prev) => [...prev, newProd]);
      onAddNotification('Product added successfully.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to add product.', 'error');
    }
  };

  const addProductBulk = async (productsList) => {
    try {
      const added = await apiProducts.createBulk(productsList);
      setProducts((prev) => [...prev, ...added]);
      onAddNotification(`Successfully imported ${added.length} products.`, 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to import products in bulk.', 'error');
    }
  };

  const editProduct = async (editedProd) => {
    try {
      const updatedProd = await apiProducts.update(editedProd);
      setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
      onAddNotification('Product details modified successfully.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to update product details.', 'error');
    }
  };

  const toggleProductStatus = async (id) => {
    try {
      const current = products.find(p => p.id === id);
      if (!current) return;
      const nextStatus = current.status === 'active' ? 'inactive' : 'active';
      const updatedProd = await apiProducts.update({ ...current, status: nextStatus });
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProd : p)));
      onAddNotification(`Product status changed to ${nextStatus}.`, 'info');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to update product status.', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiProducts.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      onAddNotification('Product deleted successfully.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to delete product.', 'error');
    }
  };

  const approveCashback = async (id, amount) => {
    try {
      await apiCashback.approve(id, amount);
      setCashbackList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
      );
      setFinance((prev) => ({
        ...prev,
        totalCashbackPaid: prev.totalCashbackPaid + amount,
      }));
      onAddNotification('Cashback claim approved.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to approve cashback.', 'error');
    }
  };

  const rejectCashback = async (id) => {
    try {
      await apiCashback.reject(id);
      setCashbackList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
      );
      onAddNotification('Cashback claim rejected.', 'error');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to reject cashback.', 'error');
    }
  };

  const approveWithdrawal = async (id, amount) => {
    try {
      await apiWithdrawals.approve(id, amount);
      setWithdrawRequests((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w))
      );
      // Re-fetch finance logs to stay fully in sync
      const financeData = await apiFinance.getData();
      setFinance(financeData);
      onAddNotification('Withdrawal payout settled.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to approve withdrawal.', 'error');
    }
  };

  const rejectWithdrawal = async (id) => {
    try {
      const request = withdrawRequests.find(w => w.id === id);
      const amount = request ? request.amount : 0;
      await apiWithdrawals.reject(id, amount);
      setWithdrawRequests((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w))
      );
      // Re-fetch finance logs to stay fully in sync
      const financeData = await apiFinance.getData();
      setFinance(financeData);
      onAddNotification('Withdrawal payout rejected and coins returned.', 'error');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to reject withdrawal.', 'error');
    }
  };

  const adjustConversion = async (id, amount, type) => {
    try {
      await apiAnalytics.adjustConversion(id, amount, type);
      setConversions((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const nextStatus = type === 'credit' ? 'approved' : 'rejected';
            return { ...c, commission: amount, status: nextStatus };
          }
          return c;
        })
      );
      // Re-fetch finance logs to stay fully in sync
      const financeData = await apiFinance.getData();
      setFinance(financeData);
      onAddNotification(type === 'credit' ? `Manual Credit: ₹${amount} added successfully.` : `Manual Debit: ₹${amount} deducted successfully.`, type === 'credit' ? 'success' : 'info');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to adjust conversion.', 'error');
    }
  };

  const addTrackedOrder = async (newTrackOrder) => {
    try {
      const addedOrder = await apiTracking.create(newTrackOrder);
      setTrackedOrders(prev => [addedOrder, ...prev]);

      // Re-fetch cashback and conversions since they sync with new tracking
      const [cashbackData, conversionsData] = await Promise.all([
        apiCashback.getAll(),
        apiAnalytics.getConversions()
      ]);
      setCashbackList(cashbackData);
      setConversions(conversionsData);

      onAddNotification(`Started tracking product: ${newTrackOrder.productName}`, 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to initialize tracking.', 'error');
    }
  };

  const updateTrackedOrderStatus = async (trackId, newStatus, datesUpdate = {}) => {
    try {
      const updatedOrder = await apiTracking.updateStatus(trackId, newStatus, datesUpdate);
      setTrackedOrders(prev => prev.map(o => o.id === trackId ? updatedOrder : o));

      // Re-fetch synced state elements
      const [cashbackData, financeData] = await Promise.all([
        apiCashback.getAll(),
        apiFinance.getData()
      ]);
      setCashbackList(cashbackData);
      setFinance(financeData);
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to update tracking status.', 'error');
    }
  };

  const updateGlobalSettings = async (newSettings) => {
    try {
      const settings = await apiSettings.update(newSettings);
      setGlobalSettings(settings);
      onAddNotification('Platform configurations updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to update platform settings.', 'error');
    }
  };

  const approveSharedCommission = async (id, amount) => {
    try {
      const updated = await apiSharedCommissions.updateStatus(id, 'approved', amount);
      setSharedCommissions((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      
      const links = await apiSharedLinks.getAll();
      setSharedLinks(links);

      const [usersData, financeData] = await Promise.all([
        apiUsers.getAll(),
        apiFinance.getData()
      ]);
      setUsers(usersData);
      setFinance(financeData);
      onAddNotification('Shared link commission claim approved.', 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to approve shared commission.', 'error');
    }
  };

  const rejectSharedCommission = async (id) => {
    try {
      const current = sharedCommissions.find(c => c.id === id);
      const amount = current ? current.commissionAmount : 0;
      const updated = await apiSharedCommissions.updateStatus(id, 'rejected', amount);
      setSharedCommissions((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );

      const usersData = await apiUsers.getAll();
      setUsers(usersData);
      onAddNotification('Shared link commission claim rejected.', 'error');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to reject shared commission.', 'error');
    }
  };

  const adjustSharedCommission = async (id, amount, currentStatus) => {
    try {
      const updated = await apiSharedCommissions.updateStatus(id, currentStatus, amount);
      setSharedCommissions((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );

      const links = await apiSharedLinks.getAll();
      setSharedLinks(links);

      const [usersData, financeData] = await Promise.all([
        apiUsers.getAll(),
        apiFinance.getData()
      ]);
      setUsers(usersData);
      setFinance(financeData);
      onAddNotification(`Fixed commission payout adjusted to ₹${amount}.`, 'success');
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to adjust shared commission.', 'error');
    }
  };

  // Render active route panel
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            users={users}
            products={products}
            orders={cashbackList}
            withdrawRequests={withdrawRequests}
            finance={finance}
            cashbackList={cashbackList}
            clickLogsCount={clickLogs.length}
            conversionsCount={conversions.length}
          />
        );
      case 'users':
        return (
          <AdminUsers
            users={users}
            setUsers={setUsers}
            onAddNotification={onAddNotification}
          />
        );
      case 'products':
        return (
          <AdminProducts
            products={products}
            onAddProduct={addProduct}
            onAddProductBulk={addProductBulk}
            onEditProduct={editProduct}
            onToggleStatus={toggleProductStatus}
            onDeleteProduct={deleteProduct}
          />
        );
      case 'tracking':
        return (
          <AdminTracking
            trackedOrders={trackedOrders}
            onAddTrackedOrder={addTrackedOrder}
            onUpdateTrackedOrderStatus={updateTrackedOrderStatus}
            users={users}
            products={products}
            onAddNotification={onAddNotification}
          />
        );
      case 'cashback':
        return (
          <AdminCashback
            cashbackList={cashbackList}
            onApprove={approveCashback}
            onReject={rejectCashback}
            globalSettings={globalSettings}
            onUpdateSettings={updateGlobalSettings}
          />
        );
      case 'withdrawals':
        return (
          <AdminWithdrawals
            withdrawRequests={withdrawRequests}
            onApprove={approveWithdrawal}
            onReject={rejectWithdrawal}
          />
        );
      case 'click-logs':
        return <AdminClickLogs clickLogs={clickLogs} />;
      case 'conversions':
        return (
          <AdminConversions
            conversions={conversions}
            onAdjustConversion={adjustConversion}
            onAddNotification={onAddNotification}
          />
        );
      case 'referrals':
        return <AdminReferrals users={users} />;
      case 'shared-commissions':
        return (
          <AdminSharedCommissions
            sharedLinks={sharedLinks}
            sharedCommissions={sharedCommissions}
            onApproveCommission={approveSharedCommission}
            onRejectCommission={rejectSharedCommission}
            onAdjustCommission={adjustSharedCommission}
            onAddNotification={onAddNotification}
          />
        );
      case 'settings':
        return (
          <AdminSettings
            globalSettings={globalSettings}
            onSaveSettings={updateGlobalSettings}
          />
        );
      default:
        return (
          <AdminDashboard
            users={users}
            products={products}
            orders={cashbackList}
            withdrawRequests={withdrawRequests}
            finance={finance}
          />
        );
    }
  };

  const handleMobileNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <div className="admin-layout animate-fade">
      {/* Sidebar Component */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-logo" onClick={() => setActiveTab('dashboard')}>
          <div className="logo-icon">C</div>
          <h2>
            Cyvanta<span>Admin</span>
          </h2>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`admin-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleMobileNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-link" onClick={() => {
            window.history.pushState(null, '', '/');
            onLogout();
          }} style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            <span>Logout Panel</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`admin-main-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div className="admin-navbar-left">
            <button
              className="admin-toggle-sidebar-btn"
              onClick={() => {
                setIsSidebarCollapsed(!isSidebarCollapsed);
                setIsMobileOpen(!isMobileOpen);
              }}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="admin-navbar-right">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              style={{ border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--card-bg)' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Notification Badge */}
            <div style={{ position: 'relative' }}>
              <button
                className="admin-btn-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={16} />
                {withdrawRequests.filter((w) => w.status === 'pending').length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                )}
              </button>

              {showNotifications && (
                <div
                  className="animate-fade"
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-sm)',
                    width: '280px',
                    zIndex: 200,
                    padding: '12px',
                  }}
                >
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-bold)' }}>Pending Notifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {withdrawRequests.filter((w) => w.status === 'pending').map((w) => (
                      <div
                        key={w.id}
                        style={{ fontSize: '12px', padding: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          setActiveTab('withdrawals');
                          setShowNotifications(false);
                        }}
                      >
                        Withdraw request of <strong>₹{w.amount}</strong> from {w.userName} is pending.
                      </div>
                    ))}
                    {withdrawRequests.filter((w) => w.status === 'pending').length === 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text)', textAlign: 'center', padding: '12px' }}>
                        No pending alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="admin-profile-badge">
              <div className="admin-avatar">AD</div>
              <div className="admin-profile-info">
                <span className="admin-profile-name">Administrator</span>
                <span className="admin-profile-email">{mockAdminEmail}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                window.history.pushState(null, '', '/');
                onLogout();
              }}
              className="admin-btn-icon"
              title="Logout"
              style={{ color: '#ef4444', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content Render Panel */}
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
}
