import React from 'react';
import { ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react';

// Reusable Modal Component
export function AdminModal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Reusable Table Component (with loading skeleton, empty state, pagination)
export function AdminTable({
  headers,
  items = [],
  loading = false,
  emptyMessage = "No records found",
  currentPage = 1,
  itemsPerPage = 5,
  onPageChange,
  renderRow,
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="admin-table-card">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={headers.length}>
                    <div className="admin-skeleton-line" style={{ width: `${Math.random() * 50 + 40}%` }} />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={headers.length}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              // Rows
              paginatedItems.map((item, index) => renderRow(item, startIndex + index))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && items.length > 0 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, items.length)}</strong> of <strong>{items.length}</strong> entries
          </div>
          <div className="admin-pagination-buttons">
            <button
              className="admin-btn-icon"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="admin-btn-icon"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Form Inputs
export function AdminFormInput({ label, id, error, ...props }) {
  return (
    <div className="admin-form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className="admin-form-input" {...props} />
      {error && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500' }}>{error}</span>}
    </div>
  );
}

export function AdminFormSelect({ label, id, options = [], error, ...props }) {
  return (
    <div className="admin-form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className="admin-form-select" {...props}>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500' }}>{error}</span>}
    </div>
  );
}

export function AdminFormSwitch({ label, id, checked, onChange }) {
  return (
    <div className="admin-switch-container" style={{ margin: '12px 0 20px' }}>
      <label className="admin-switch">
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <span className="admin-slider"></span>
      </label>
      {label && <span className="admin-switch-label" htmlFor={id}>{label}</span>}
    </div>
  );
}

// Empty State Screen
export function EmptyState({ message }) {
  return (
    <div className="admin-empty-state">
      <Inbox size={48} style={{ opacity: 0.3, color: 'var(--text)' }} />
      <div className="admin-empty-state-title">{message}</div>
      <p style={{ fontSize: '13px', opacity: 0.7 }}>Try adjusting your filters or search terms.</p>
    </div>
  );
}

// Loading Skeleton
export function SkeletonLoader({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', padding: '16px' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="admin-skeleton-row" style={{ padding: 0, border: 'none' }}>
          <div className="admin-skeleton-line" style={{ width: '30%', height: '18px' }} />
          <div className="admin-skeleton-line" style={{ width: '80%', height: '14px' }} />
          <div className="admin-skeleton-line" style={{ width: '60%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
