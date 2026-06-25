import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect, ExportDataButton } from './AdminComponents';

export default function AdminCategories({ categories, onAddCategory, onDeleteCategory, onEditCategory }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null means adding

  // Form states
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [catStatus, setCatStatus] = useState('active');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditItem(null);
    setCatName('');
    setCatIcon('Smartphone');
    setCatStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setCatName(item.name);
    setCatIcon(item.icon);
    setCatStatus(item.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!catName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    if (editItem) {
      onEditCategory({
        ...editItem,
        name: catName,
        icon: catIcon,
        status: catStatus,
      });
    } else {
      onAddCategory({
        name: catName,
        icon: catIcon,
        status: catStatus,
      });
    }

    setIsModalOpen(false);
  };

  const headers = ['Category Name', 'Icon Symbol', 'Status', 'Created Date', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.name}</td>
      <td>
        <span style={{ backgroundColor: 'var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
          {item.icon}
        </span>
      </td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>{item.created}</td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="admin-btn-icon edit" onClick={() => openEditModal(item)} title="Edit Category">
            <Edit2 size={14} />
          </button>
          <button className="admin-btn-icon delete" onClick={() => onDeleteCategory(item.id)} title="Delete Category">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  const exportColumns = [
    { header: 'Category Name', dataKey: 'name' },
    { header: 'Icon Symbol', dataKey: 'icon' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Created Date', dataKey: 'created' }
  ];

  return (
    <div className="admin-categories-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Categories</h2>
          <p>Manage store categories and routing rules</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ExportDataButton data={categories} columns={exportColumns} filename="Categories" />
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <AdminTable
        headers={headers}
        items={categories}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No categories available."
      />

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              Save Category
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          {formError && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', fontWeight: '500' }}>
              {formError}
            </div>
          )}

          <AdminFormInput
            label="Category Name"
            id="cat-name"
            type="text"
            placeholder="e.g., Electronics, Fashion"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />

          <AdminFormSelect
            label="Icon Representation"
            id="cat-icon"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            options={[
              { value: 'Smartphone', label: 'Smartphone' },
              { value: 'Shirt', label: 'Shirt' },
              { value: 'ShoppingBag', label: 'Shopping Bag' },
              { value: 'Plane', label: 'Plane / Travel' },
              { value: 'Heart', label: 'Heart / Health' },
              { value: 'Coffee', label: 'Coffee / Food' },
            ]}
          />

          <AdminFormSelect
            label="Category Status"
            id="cat-status"
            value={catStatus}
            onChange={(e) => setCatStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </form>
      </AdminModal>
    </div>
  );
}
