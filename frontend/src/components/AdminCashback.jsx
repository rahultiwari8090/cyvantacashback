import React, { useState } from 'react';
import { Search, Filter, Check, X, Settings } from 'lucide-react';
import { AdminTable, AdminFormInput } from './AdminComponents';

export default function AdminCashback({ cashbackList, onApprove, onReject, globalSettings, onUpdateSettings }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form settings local states
  const [cbPercent, setCbPercent] = useState(globalSettings.cashbackPercent.toString());
  const [holdDays, setHoldDays] = useState(globalSettings.holdDays.toString());

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!cbPercent || !holdDays) return;
    onUpdateSettings({
      cashbackPercent: parseFloat(cbPercent),
      holdDays: parseInt(holdDays, 10),
    });
  };

  const filteredList = cashbackList.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.userName.toLowerCase().includes(query) ||
      c.productName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const headers = ['User', 'Product Name', 'Cashback Amount', 'Status', 'Claim Date', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.userName}</td>
      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>${item.amount.toFixed(2)}</td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>{item.date}</td>
      <td>
        {item.status === 'pending' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="admin-btn-icon edit"
              onClick={() => onApprove(item.id, item.amount)}
              title="Approve Cashback"
              style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Check size={14} />
            </button>
            <button
              className="admin-btn-icon delete"
              onClick={() => onReject(item.id)}
              title="Reject Cashback"
              style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.5 }}>Processed</span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="admin-cashback-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Cashback Management</h2>
          <p>Verify user shopping claims, approve reward percentages, and set holds</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '24px' }}>
        {/* Table panel */}
        <div>
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
                placeholder="Search User or Product..."
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
                <span>Status:</span>
              </div>

              <select
                className="admin-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Claims</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <AdminTable
            headers={headers}
            items={filteredList}
            currentPage={currentPage}
            itemsPerPage={5}
            onPageChange={setCurrentPage}
            renderRow={renderRow}
            emptyMessage="No cashback claims match filters."
          />
        </div>

        {/* Local Cashback parameters cards */}
        <div className="admin-table-card animate-fade" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', color: 'var(--text-bold)' }}>
            <Settings size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--heading)' }}>Quick Parameters</h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <AdminFormInput
              label="Standard Cashback (%)"
              id="cb-percent"
              type="number"
              step="0.1"
              value={cbPercent}
              onChange={(e) => setCbPercent(e.target.value)}
            />

            <AdminFormInput
              label="Hold Period Days"
              id="hold-days"
              type="number"
              value={holdDays}
              onChange={(e) => setHoldDays(e.target.value)}
            />

            <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Save Variables
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
