import React, { useState } from 'react';
import { Search, Filter, Eye, DollarSign } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect } from './AdminComponents';

export default function AdminConversions({ conversions, onAdjustConversion, onAddNotification }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedConv, setSelectedConv] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [adjustConv, setAdjustConv] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Adjustment fields
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState('credit'); // credit (add), debit (subtract)

  const filteredConversions = conversions.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.subId.toLowerCase().includes(query) ||
      c.clickId.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const openViewModal = (conv) => {
    setSelectedConv(conv);
    setIsViewModalOpen(true);
  };

  const openAdjustModal = (conv) => {
    setAdjustConv(conv);
    setAdjAmount(conv.commission.toString());
    setAdjType('credit');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!adjAmount || isNaN(adjAmount) || parseFloat(adjAmount) <= 0) {
      onAddNotification('Please enter a valid adjustments amount.', 'error');
      return;
    }

    const value = parseFloat(adjAmount);
    onAdjustConversion(adjustConv.id, value, adjType);
    setIsAdjustModalOpen(false);
  };

  const headers = ['Sub ID', 'Click ID', 'Commission Earned', 'Status', 'Log Date', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-bold)' }}>{item.subId}</td>
      <td style={{ fontFamily: 'monospace' }}>{item.clickId}</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>${item.commission.toFixed(2)}</td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>{item.date}</td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="admin-btn-icon"
            onClick={() => openViewModal(item)}
            title="View Conversion Specifics"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={14} />
          </button>
          <button
            className="admin-btn-icon edit"
            onClick={() => openAdjustModal(item)}
            title="Manual Cashback Adjustment"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <DollarSign size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="admin-conversions-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Conversion Management</h2>
          <p>Verify retailer conversions, commission payouts, and make manual credit adjustments</p>
        </div>
      </div>

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
            placeholder="Search SubID or ClickID..."
            className="admin-search-input"
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
            <span>Conversion Status:</span>
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Conversions</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <AdminTable
        headers={headers}
        items={filteredConversions}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No conversion transactions matching current filter."
      />

      {/* View Modal */}
      {selectedConv && (
        <AdminModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Conversion Ledger Information"
          footer={
            <button className="admin-btn admin-btn-primary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Affiliate Sub ID</span>
              <p style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', color: 'var(--text-bold)' }}>{selectedConv.subId}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Click ID Link</span>
                <p style={{ fontWeight: '500', color: 'var(--text-bold)', fontSize: '14px', marginTop: '2px', fontFamily: 'monospace' }}>
                  {selectedConv.clickId}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Retailer Commission</span>
                <p style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '15px', marginTop: '2px' }}>
                  ${selectedConv.commission.toFixed(2)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Logged User</span>
                <p style={{ fontWeight: '500', color: 'var(--text-bold)', fontSize: '14px', marginTop: '2px' }}>{selectedConv.userName}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Merchant Network</span>
                <p style={{ fontWeight: '500', color: 'var(--text-bold)', fontSize: '14px', marginTop: '2px' }}>{selectedConv.network}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Conversion Date</span>
                <p style={{ fontWeight: '500', color: 'var(--text-bold)', fontSize: '14px', marginTop: '2px' }}>{selectedConv.date}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: '600' }}>Affiliate Status</span>
                <p style={{ marginTop: '2px' }}>
                  <span className={`status-badge ${selectedConv.status}`}>{selectedConv.status}</span>
                </p>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Manual Cashback Adjustment Modal */}
      {adjustConv && (
        <AdminModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title="Manual Cashback Adjustment"
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSaveAdjustment}>
                Save Adjustment
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveAdjustment}>
            <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-bold)' }}>
                Adjusting cashback for SubID: <strong>{adjustConv.subId}</strong>
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text)', marginTop: '4px' }}>
                Current Commission: <strong>${adjustConv.commission.toFixed(2)}</strong>
              </p>
            </div>

            <AdminFormSelect
              label="Adjustment Action"
              id="adj-type"
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
              options={[
                { value: 'credit', label: 'Credit (Add to Wallet)' },
                { value: 'debit', label: 'Debit (Deduct from Wallet)' },
              ]}
            />

            <AdminFormInput
              label="Adjustment Amount ($)"
              id="adj-amount"
              type="number"
              step="0.01"
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
            />

            <p style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.8, marginTop: '8px' }}>
              * Executing this manual override will credit or debit the user wallet logs, overriding API feeds.
            </p>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
