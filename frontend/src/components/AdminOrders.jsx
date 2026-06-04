import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AdminTable } from './AdminComponents';

export default function AdminOrders({ orders }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      o.userName.toLowerCase().includes(query) ||
      o.productName.toLowerCase().includes(query) ||
      o.trackingId.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const headers = ['User Name', 'Product Name', 'Platform', 'Tracking ID', 'Status', 'Date Logged'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.userName}</td>
      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</td>
      <td>{item.platform}</td>
      <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{item.trackingId}</td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>{item.date}</td>
    </tr>
  );

  return (
    <div className="admin-orders-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Orders & Bookings</h2>
          <p>Verify tracking codes and affiliate reward commissions</p>
        </div>
      </div>

      {/* Filter Options */}
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
            placeholder="Search by User, Product or Tracking ID..."
            className="admin-search-input"
            style={{ width: '280px' }}
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
            <span>Filter Status:</span>
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Transactions</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <AdminTable
        headers={headers}
        items={filteredOrders}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No order records match current criteria."
      />
    </div>
  );
}
