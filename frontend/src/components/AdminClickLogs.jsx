import React, { useState } from 'react';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { AdminTable } from './AdminComponents';

export default function AdminClickLogs({ clickLogs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');

  const filteredLogs = clickLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      log.userName.toLowerCase().includes(query) ||
      log.productName.toLowerCase().includes(query) ||
      log.clickId.toLowerCase().includes(query);
    const matchesNetwork = networkFilter === 'all' || log.network.toLowerCase() === networkFilter.toLowerCase();
    return matchesSearch && matchesNetwork;
  });

  const headers = ['Click ID', 'User Name', 'Product Name', 'Target Network', 'Click Date'];

  const renderRow = (item, idx) => (
    <tr key={item.clickId} className="animate-fade">
      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-bold)' }}>{item.clickId}</td>
      <td style={{ fontWeight: '600' }}>{item.userName}</td>
      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</td>
      <td>
        <span style={{ backgroundColor: 'var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
          {item.network}
        </span>
      </td>
      <td>{item.date}</td>
    </tr>
  );

  return (
    <div className="admin-click-logs-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Click Tracking Logs</h2>
          <p>Read-only audits of outbound clicks redirecting to merchant platforms</p>
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
            placeholder="Search Click ID, User or Product..."
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
            <span>Outbound Network:</span>
          </div>

          <select
            className="admin-filter-select"
            value={networkFilter}
            onChange={(e) => {
              setNetworkFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Networks</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
            <option value="Myntra">Myntra</option>
            <option value="Ajio">Ajio</option>
            <option value="Nykaa Beauty">Nykaa Beauty</option>
            <option value="MakeMyTrip">MakeMyTrip</option>
          </select>
        </div>
      </div>

      <AdminTable
        headers={headers}
        items={filteredLogs}
        currentPage={currentPage}
        itemsPerPage={10} // Higher listing since it is click logs
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No click log entries found matching criteria."
      />
    </div>
  );
}
