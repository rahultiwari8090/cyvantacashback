import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Play,
  Eye,
  RefreshCw,
  CheckCircle,
  Truck,
  Calendar,
  User,
  Clock,
  Package,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect } from './AdminComponents';

export default function AdminTracking({
  trackedOrders,
  onAddTrackedOrder,
  onUpdateTrackedOrderStatus,
  users,
  products,
  onAddNotification
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationOrder, setSimulationOrder] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationTimer, setSimulationTimer] = useState(null);
  const [simDaysLeft, setSimDaysLeft] = useState(10);

  // New Tracking Form Fields
  const [newUserId, setNewUserId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReturnDays, setNewReturnDays] = useState('10');

  // Calculate stats
  const totalTracked = trackedOrders.length;
  const activeDelivery = trackedOrders.filter(o => ['ordered', 'confirmed', 'shipped'].includes(o.status)).length;
  const activeReturn = trackedOrders.filter(o => o.status === 'return_active').length;
  const completedTrack = trackedOrders.filter(o => o.status === 'completed').length;
  const returnedTrack = trackedOrders.filter(o => o.status === 'returned').length;

  // Filter orders
  const filteredOrders = trackedOrders.filter((o) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(query) ||
      o.userName.toLowerCase().includes(query) ||
      o.productName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle open modals
  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleOpenAddModal = () => {
    if (users.length === 0) {
      onAddNotification('Please add some users to the system first.', 'error');
      return;
    }
    if (products.length === 0) {
      onAddNotification('Please add some products to the system first.', 'error');
      return;
    }
    setNewUserId(users[0]?.id || '');
    setNewProductId(products[0]?.id || '');
    setNewOrderDate(new Date().toISOString().split('T')[0]);
    setNewReturnDays('10');
    setIsAddModalOpen(true);
  };

  const handleCreateTracking = (e) => {
    e.preventDefault();
    if (!newUserId || !newProductId) {
      onAddNotification('Please select a user and a product.', 'error');
      return;
    }

    const selectedUser = users.find(u => u.id === newUserId);
    const selectedProd = products.find(p => p.id === newProductId);

    if (!selectedUser || !selectedProd) {
      onAddNotification('User or Product not found.', 'error');
      return;
    }

    const newTrackOrder = {
      userId: selectedUser.id,
      userName: selectedUser.name,
      productId: selectedProd.id,
      productName: selectedProd.name,
      platform: selectedProd.platform,
      price: selectedProd.price,
      cashbackAmount: parseFloat(((selectedProd.price * selectedProd.cashbackValue) / 100).toFixed(2)),
      orderDate: newOrderDate,
      returnWindowDays: parseInt(newReturnDays, 10),
      status: 'ordered',
    };

    onAddTrackedOrder(newTrackOrder);
    setIsAddModalOpen(false);
  };

  // Simulation Logic
  const startSimulation = (order) => {
    setSimulationOrder(order);
    setIsSimulating(true);
    setSimDaysLeft(order.returnWindowDays);
    
    // Find step based on current status
    const steps = ['ordered', 'confirmed', 'shipped', 'delivered', 'return_active', 'completed'];
    const currentStepIndex = steps.indexOf(order.status);
    setSimulationStep(currentStepIndex >= 0 ? currentStepIndex : 0);
  };

  const stopSimulation = () => {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      setSimulationTimer(null);
    }
    setIsSimulating(false);
    setSimulationOrder(null);
  };

  useEffect(() => {
    return () => {
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, [simulationTimer]);

  const advanceSimulationStep = () => {
    const steps = ['ordered', 'confirmed', 'shipped', 'delivered', 'return_active', 'completed'];
    const nextStepIdx = simulationStep + 1;
    
    if (nextStepIdx >= steps.length) {
      stopSimulation();
      return;
    }

    const nextStatus = steps[nextStepIdx];
    setSimulationStep(nextStepIdx);

    // Update tracking status in the parent component
    const datesUpdate = {};
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (nextStatus === 'confirmed') datesUpdate.confirmedDate = todayStr;
    if (nextStatus === 'shipped') datesUpdate.shippedDate = todayStr;
    if (nextStatus === 'delivered') {
      datesUpdate.deliveredDate = todayStr;
      // Calculate return expiry
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + simulationOrder.returnWindowDays);
      datesUpdate.returnExpiryDate = expiry.toISOString().split('T')[0];
    }
    if (nextStatus === 'return_active') {
      datesUpdate.returnExpiryDate = new Date(Date.now() + simulationOrder.returnWindowDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    onUpdateTrackedOrderStatus(simulationOrder.id, nextStatus, datesUpdate);
    
    // Update local order reference
    setSimulationOrder(prev => ({
      ...prev,
      status: nextStatus,
      ...datesUpdate
    }));

    onAddNotification(`Order ${simulationOrder.id} status updated to: ${nextStatus.toUpperCase().replace('_', ' ')}`, 'info');

    // If it goes to return active, start a countdown simulator
    if (nextStatus === 'return_active') {
      let days = simulationOrder.returnWindowDays;
      setSimDaysLeft(days);
      
      const interval = setInterval(() => {
        days -= 2; // Simulate time passing quickly
        if (days <= 0) {
          clearInterval(interval);
          setSimulationTimer(null);
          
          // Complete order
          onUpdateTrackedOrderStatus(simulationOrder.id, 'completed');
          setSimulationOrder(prev => ({ ...prev, status: 'completed' }));
          setSimulationStep(5);
          onAddNotification(`Return window expired for ${simulationOrder.id}. Cashback cleared and approved!`, 'success');
        } else {
          setSimDaysLeft(days);
        }
      }, 800);
      setSimulationTimer(interval);
    }
  };

  const simulateReturn = () => {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      setSimulationTimer(null);
    }
    onUpdateTrackedOrderStatus(simulationOrder.id, 'returned');
    setSimulationOrder(prev => ({ ...prev, status: 'returned' }));
    onAddNotification(`Customer requested return for ${simulationOrder.id}. Tracking updated to RETURNED & Cashback rejected.`, 'error');
  };

  // Calculate return details for table display
  const getReturnStatusInfo = (item) => {
    if (item.status === 'completed') {
      return { text: 'Return Policy Expired (Cleared)', class: 'completed-status' };
    }
    if (item.status === 'returned') {
      return { text: 'Returned & Refunded (Cancelled)', class: 'returned-status' };
    }
    if (item.status === 'return_active') {
      const today = new Date();
      const expiry = new Date(item.returnExpiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return { text: `${diffDays} Days Left (Ends ${item.returnExpiryDate})`, class: 'active-status' };
      } else {
        return { text: 'Expiry Pending Processing', class: 'pending-status' };
      }
    }
    return { text: 'Return Policy Pending Delivery', class: 'waiting-status' };
  };

  const headers = ['Order ID', 'Customer', 'Product & Store', 'Price/Cashback', 'Order Status', 'Return policy Status', 'Actions'];

  const renderRow = (item) => {
    const returnInfo = getReturnStatusInfo(item);
    return (
      <tr key={item.id} className="animate-fade">
        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-bold)' }}>{item.id}</td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.userName}</span>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>ID: {item.userId}</span>
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '220px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }} title={item.productName}>
              {item.productName}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>{item.platform}</span>
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600' }}>${item.price.toFixed(2)}</span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>+${item.cashbackAmount.toFixed(2)} CB</span>
          </div>
        </td>
        <td>
          <span className={`status-badge ${item.status === 'return_active' ? 'processing' : item.status}`}>
            {item.status.toUpperCase().replace('_', ' ')}
          </span>
        </td>
        <td>
          <span className={`tracking-return-info-badge ${returnInfo.class}`}>
            <Clock size={11} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>{returnInfo.text}</span>
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="admin-btn-icon"
              onClick={() => openViewModal(item)}
              title="View Tracking Timeline"
            >
              <Eye size={14} />
            </button>
            {['completed', 'returned'].includes(item.status) ? (
              <button
                className="admin-btn-icon"
                disabled
                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                title="Simulation Completed"
              >
                <Play size={14} />
              </button>
            ) : (
              <button
                className="admin-btn-icon edit"
                onClick={() => startSimulation(item)}
                title="Launch Lifecycle Simulator"
                style={{ color: '#f59e0b' }}
              >
                <Play size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="admin-tracking-tab animate-fade">
      {/* Page Title */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Product Purchase Tracking</h2>
          <p>Monitor customer sale conversions, shipment statuses, and return window clearances</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Tracked Sale
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Tracked Sales</h3>
            <div className="admin-kpi-value">{totalTracked}</div>
            <div className="admin-kpi-trend positive">
              <TrendingUp size={12} /> Live Sync Active
            </div>
          </div>
          <div className="admin-kpi-icon">
            <Package size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>In-Transit Delivery</h3>
            <div className="admin-kpi-value">{activeDelivery}</div>
            <p style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text)' }}>Awaiting delivery confirm</p>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#f59e0b' }}>
            <Truck size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Active Return Windows</h3>
            <div className="admin-kpi-value">{activeReturn}</div>
            <p style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text)' }}>Under return policy period</p>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#3b82f6' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Completed & Cleared</h3>
            <div className="admin-kpi-value">{completedTrack}</div>
            <p style={{ fontSize: '11px', marginTop: '6px', color: '#10b981', fontWeight: '600' }}>Cashback Unlocked</p>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div className="admin-search-input-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by Track ID, User or Product..."
            className="admin-search-input"
            style={{ width: '300px' }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
            <Filter size={14} />
            <span>Tracking Status:</span>
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Lifecycles</option>
            <option value="ordered">Order Placed</option>
            <option value="confirmed">Merchant Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="return_active">Return Policy Active</option>
            <option value="completed">Completed (Expired)</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        headers={headers}
        items={filteredOrders}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No product tracking records matching current filters."
      />

      {/* Add Tracking Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Put Product Sale on Track"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleCreateTracking}>
              Initialize Tracking
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTracking}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AdminFormSelect
              label="Select Customer"
              id="new-user"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
            />

            <AdminFormSelect
              label="Select Purchased Product"
              id="new-product"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              options={products.map(p => ({ value: p.id, label: `[${p.platform}] ${p.name} - $${p.price}` }))}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <AdminFormInput
                label="Date of Purchase"
                id="new-date"
                type="date"
                value={newOrderDate}
                onChange={(e) => setNewOrderDate(e.target.value)}
              />

              <AdminFormSelect
                label="Return Window Period"
                id="new-return-period"
                value={newReturnDays}
                onChange={(e) => setNewReturnDays(e.target.value)}
                options={[
                  { value: '5', label: '5 Days (Test/Fast Expiry)' },
                  { value: '7', label: '7 Days Return Policy' },
                  { value: '10', label: '10 Days Return Policy' },
                  { value: '15', label: '15 Days Return Policy' },
                  { value: '30', label: '30 Days Return Policy' },
                ]}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '12px', color: 'var(--text)' }}>
              <AlertCircle size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <p>Adding this sale registers a corresponding pending cashback item and begins tracking immediately. You can simulate the order lifecycle in the list action menu.</p>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Details View Modal */}
      {selectedOrder && (
        <AdminModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Tracking Lifecycle Details: ${selectedOrder.id}`}
          footer={
            <button className="admin-btn admin-btn-primary" onClick={() => setIsViewModalOpen(false)}>
              Close Timeline
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Meta details */}
            <div className="tracking-timeline-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Customer</span>
                <p style={{ fontWeight: '700', color: 'var(--text-bold)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <User size={14} /> {selectedOrder.userName}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Merchant / Platform</span>
                <p style={{ fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>
                  {selectedOrder.platform}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Purchased Product</span>
                <p style={{ fontWeight: '500', color: 'var(--text-bold)', marginTop: '2px', fontSize: '13px' }}>
                  {selectedOrder.productName}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Earnings Snapshot</span>
                <p style={{ fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
                  ${selectedOrder.cashbackAmount.toFixed(2)} Pending Cashback
                </p>
              </div>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div style={{ padding: '10px 0' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-bold)', fontWeight: '700' }}>Order Tracking Timeline</h4>
              
              <div className="vertical-tracking-stepper">
                {/* Step 1: Order Placed */}
                <div className={`step-item completed`}>
                  <div className="step-circle"><CheckCircle size={14} /></div>
                  <div className="step-content">
                    <h5>Order Placed</h5>
                    <p>Affiliate purchase click logged. Tracking ID assigned.</p>
                    <span className="step-time">{selectedOrder.orderDate}</span>
                  </div>
                </div>

                {/* Step 2: Confirmed */}
                <div className={`step-item ${['confirmed', 'shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'ordered' ? 'active' : ''}`}>
                  <div className="step-circle">
                    {['confirmed', 'shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <CheckCircle size={14} /> : <Package size={14} />}
                  </div>
                  <div className="step-content">
                    <h5>Merchant Confirmed</h5>
                    <p>Partner network validated the purchase. Commission pre-approved.</p>
                    {selectedOrder.confirmedDate && <span className="step-time">{selectedOrder.confirmedDate}</span>}
                  </div>
                </div>

                {/* Step 3: Shipped */}
                <div className={`step-item ${['shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'confirmed' ? 'active' : ''}`}>
                  <div className="step-circle">
                    {['shipped', 'delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <CheckCircle size={14} /> : <Truck size={14} />}
                  </div>
                  <div className="step-content">
                    <h5>Item Dispatched</h5>
                    <p>Merchant package shipped and tracking code synced.</p>
                    {selectedOrder.shippedDate && <span className="step-time">{selectedOrder.shippedDate}</span>}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className={`step-item ${['delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'shipped' ? 'active' : ''}`}>
                  <div className="step-circle">
                    {['delivered', 'return_active', 'completed'].includes(selectedOrder.status) ? <CheckCircle size={14} /> : <ShieldCheck size={14} />}
                  </div>
                  <div className="step-content">
                    <h5>Item Delivered</h5>
                    <p>Package received by buyer. Return window initialized.</p>
                    {selectedOrder.deliveredDate && <span className="step-time">{selectedOrder.deliveredDate}</span>}
                  </div>
                </div>

                {/* Step 5: Return Policy Period */}
                {selectedOrder.status === 'returned' ? (
                  <div className="step-item failed">
                    <div className="step-circle"><XCircle size={14} /></div>
                    <div className="step-content">
                      <h5>Returned & Refunded</h5>
                      <p>Customer returned the item within window. Cashback rejected.</p>
                    </div>
                  </div>
                ) : (
                  <div className={`step-item ${selectedOrder.status === 'completed' ? 'completed' : selectedOrder.status === 'return_active' ? 'active pulsate' : ''}`}>
                    <div className="step-circle">
                      {selectedOrder.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    </div>
                    <div className="step-content">
                      <h5>Return Policy Policy Active</h5>
                      <p>Subject to {selectedOrder.returnWindowDays}-day merchant return conditions.</p>
                      {selectedOrder.status === 'return_active' && (
                        <div style={{ display: 'inline-block', marginTop: '6px', padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: '700' }}>
                          Under review until {selectedOrder.returnExpiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Clearance / Completed */}
                {selectedOrder.status !== 'returned' && (
                  <div className={`step-item ${selectedOrder.status === 'completed' ? 'completed' : ''}`}>
                    <div className="step-circle">
                      {selectedOrder.status === 'completed' ? <CheckCircle size={14} /> : <ShieldCheck size={14} />}
                    </div>
                    <div className="step-content">
                      <h5>Cashback Unlocked</h5>
                      <p>Return window closed safely. Commission credited to user wallet.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Simulator Lifecycle Modal */}
      {isSimulating && simulationOrder && (
        <AdminModal
          isOpen={isSimulating}
          onClose={stopSimulation}
          title={`Order Tracker Simulator: ${simulationOrder.id}`}
          footer={
            <button className="admin-btn admin-btn-secondary" onClick={stopSimulation}>
              Exit Simulator
            </button>
          }
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '50%', marginBottom: '12px' }}>
              <RefreshCw size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-bold)' }}>Simulating Order Lifecycle</h3>
            <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px' }}>
              Review state shifts from placement to return window closing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', margin: '20px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text)' }}>Order Item:</span>
                <strong style={{ color: 'var(--text-bold)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{simulationOrder.productName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text)' }}>Merchant:</span>
                <strong style={{ color: 'var(--primary)' }}>{simulationOrder.platform}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text)' }}>Commission value:</span>
                <strong style={{ color: '#10b981' }}>+${simulationOrder.cashbackAmount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text)' }}>Active Status:</span>
                <span className={`status-badge ${simulationOrder.status === 'return_active' ? 'processing' : simulationOrder.status}`}>
                  {simulationOrder.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Stepper progress indicator */}
            <div className="horizontal-stepper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '30px 10px 40px' }}>
              {/* background bar */}
              <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '3px', backgroundColor: 'var(--border)', zIndex: 1 }} />
              {/* active progress fill */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: 0,
                width: `${simulationOrder.status === 'returned' ? 80 : (simulationStep / 5) * 100}%`,
                height: '3px',
                background: simulationOrder.status === 'returned' ? '#ef4444' : 'var(--gradient-primary)',
                transition: 'all 0.4s ease',
                zIndex: 2
              }} />

              {['ordered', 'confirmed', 'shipped', 'delivered', 'return_active', 'completed'].map((st, i) => {
                const isActive = simulationOrder.status !== 'returned' && st === simulationOrder.status;
                const isPassed = simulationOrder.status !== 'returned' && i < simulationStep;
                return (
                  <div key={st} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? '#10b981' : isActive ? 'var(--primary)' : 'var(--card-bg)',
                      border: `2px solid ${isPassed ? '#10b981' : isActive ? 'var(--primary)' : 'var(--border)'}`,
                      color: isPassed || isActive ? '#fff' : 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 10px rgba(255, 79, 47, 0.4)' : 'none'
                    }}>
                      {isPassed ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span style={{ position: 'absolute', top: '38px', fontSize: '9px', fontWeight: '700', whiteSpace: 'nowrap', color: isActive ? 'var(--text-bold)' : 'var(--text)', opacity: isActive ? 1 : 0.7 }}>
                      {st === 'return_active' ? 'Return Window' : st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Countdown / Special simulator UI */}
            {simulationOrder.status === 'return_active' && (
              <div className="animate-fade" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>Return Window Policy Simulator Running</h4>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', fontFamily: 'monospace' }}>{simDaysLeft}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>Days Remaining</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text)' }}>
                  Time is sped up (2 days per second) to simulate the cooling-off period.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                  <button
                    className="admin-btn"
                    style={{ backgroundColor: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '11px' }}
                    onClick={simulateReturn}
                  >
                    Simulate Return & Refund Request
                  </button>
                </div>
              </div>
            )}

            {simulationOrder.status === 'completed' && (
              <div className="animate-fade" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Order Completed Safely
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text)', marginTop: '6px' }}>
                  Return policy window has expired. Affiliate commission is fully validated and cashback of <strong>${simulationOrder.cashbackAmount.toFixed(2)}</strong> is cleared into the user's wallet!
                </p>
              </div>
            )}

            {simulationOrder.status === 'returned' && (
              <div className="animate-fade" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <XCircle size={16} /> Returned & Rejected
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text)', marginTop: '6px' }}>
                  The item was returned by the user. Commission is voided, and cashback status has been set to <strong>rejected</strong> in the conversion records.
                </p>
              </div>
            )}

            {/* Step trigger controls */}
            {!['completed', 'returned', 'return_active'].includes(simulationOrder.status) && (
              <button
                className="admin-btn admin-btn-primary"
                onClick={advanceSimulationStep}
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                Advance to Next Stage <ArrowRight size={14} />
              </button>
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
}
