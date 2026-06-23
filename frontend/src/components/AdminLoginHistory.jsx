import React, { useState } from 'react';
import { AdminTable } from './AdminComponents';

export default function AdminLoginHistory({ loginHistory }) {
  const [currentPage, setCurrentPage] = useState(1);

  const headers = ['Time', 'Admin Email', 'Role', 'Success', 'IP Address', 'User Agent'];
  const renderRow = (entry) => (
    <tr key={entry.id} className="animate-fade">
      <td>{new Date(entry.timestamp).toLocaleString()}</td>
      <td>{entry.email || 'unknown'}</td>
      <td>{entry.role || 'N/A'}</td>
      <td>{entry.success ? 'Yes' : 'No'}</td>
      <td>{entry.ipAddress || 'N/A'}</td>
      <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.userAgent || 'N/A'}</td>
    </tr>
  );

  return (
    <div className="admin-login-history-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Admin Login History</h2>
          <p>Track admin access attempts and audit failed or successful sign-ins.</p>
        </div>
      </div>
      <AdminTable
        headers={headers}
        items={loginHistory}
        currentPage={currentPage}
        itemsPerPage={8}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No admin login records available yet."
      />
    </div>
  );
}
