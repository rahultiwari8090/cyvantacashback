import React, { useState } from 'react';
import { AdminTable } from './AdminComponents';

export default function AdminActivityLogs({ activityLogs }) {
  const [currentPage, setCurrentPage] = useState(1);

  const headers = ['Time', 'Admin', 'Role', 'Action', 'Target', 'Details'];
  const renderRow = (log) => (
    <tr key={log.id} className="animate-fade">
      <td>{new Date(log.timestamp).toLocaleString()}</td>
      <td>{log.adminEmail || 'system'}</td>
      <td>{log.adminRole || 'SYSTEM'}</td>
      <td>{log.action}</td>
      <td>{log.target}</td>
      <td>{log.details}</td>
    </tr>
  );

  return (
    <div className="admin-activity-logs-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Activity Logs</h2>
          <p>Review admin actions and platform changes in chronological order.</p>
        </div>
      </div>
      <AdminTable
        headers={headers}
        items={activityLogs}
        currentPage={currentPage}
        itemsPerPage={8}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No activity logs available yet."
      />
    </div>
  );
}
