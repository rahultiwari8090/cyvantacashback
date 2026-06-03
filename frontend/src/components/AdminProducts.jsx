import React, { useState } from 'react';
import { Plus, Trash2, Search, Filter, Edit2 } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect, AdminFormSwitch } from './AdminComponents';

export default function AdminProducts({ products, categories = [], onAddProduct, onToggleStatus, onDeleteProduct, onEditProduct }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null means adding
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodPlatform, setProdPlatform] = useState('Amazon');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCashbackValue, setProdCashbackValue] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodActive, setProdActive] = useState(true);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditItem(null);
    setProdName('');
    setProdPlatform('Amazon');
    setProdPrice('');
    setProdCashbackValue('');
    setProdImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300');
    setProdActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setProdName(item.name);
    setProdPlatform(item.platform);
    setProdPrice(item.price.toString());
    setProdCashbackValue(item.cashbackValue.toString());
    setProdImage(item.image);
    setProdActive(item.status === 'active');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!prodName.trim() || !prodPrice || !prodCashbackValue) {
      setFormError('Please fill in Name, Price, and Cashback Value.');
      return;
    }

    const payload = {
      name: prodName,
      platform: prodPlatform,
      price: parseFloat(prodPrice),
      cashbackValue: parseFloat(prodCashbackValue),
      image: prodImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      status: prodActive ? 'active' : 'inactive',
    };

    if (editItem) {
      onEditProduct({ ...editItem, ...payload });
    } else {
      onAddProduct(payload);
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || p.platform.toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const headers = ['Image', 'Product Name', 'Platform', 'Price', 'Cashback', 'Status', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
          }}
        />
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.name}
      </td>
      <td>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.platform}</span>
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>${item.price.toFixed(2)}</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '600' }}>
        {item.cashbackValue}%
      </td>
      <td>
        <label className="admin-switch">
          <input
            type="checkbox"
            checked={item.status === 'active'}
            onChange={() => onToggleStatus(item.id)}
          />
          <span className="admin-slider"></span>
        </label>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="admin-btn-icon edit" onClick={() => openEditModal(item)} title="Edit Product">
            <Edit2 size={14} />
          </button>
          <button className="admin-btn-icon delete" onClick={() => onDeleteProduct(item.id)} title="Delete Product">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="admin-products-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Product Management</h2>
          <p>Add, edit, and delete store products and configure cashbacks</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add Product
        </button>
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
            placeholder="Search products..."
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
            <span>Platform:</span>
          </div>

          <select
            className="admin-filter-select"
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Platforms</option>
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
        items={filteredProducts}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No products match the criteria."
      />

      {/* Add / Edit Product Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editItem ? 'Save Changes' : 'Add Product'}
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
            label="Product Name *"
            id="prod-name"
            type="text"
            placeholder="e.g., Apple iPhone 14 Pro Max"
            value={prodName}
            onChange={(e) => setProdName(e.target.value)}
          />

          <AdminFormSelect
            label="Merchant Platform"
            id="prod-platform"
            value={prodPlatform}
            onChange={(e) => setProdPlatform(e.target.value)}
            options={[
              { value: 'Amazon', label: 'Amazon' },
              { value: 'Flipkart', label: 'Flipkart' },
              { value: 'Myntra', label: 'Myntra' },
              { value: 'Ajio', label: 'Ajio' },
              { value: 'Nykaa Beauty', label: 'Nykaa Beauty' },
              { value: 'MakeMyTrip', label: 'MakeMyTrip' },
            ]}
          />

          <div className="admin-form-row">
            <AdminFormInput
              label="Price ($) *"
              id="prod-price"
              type="number"
              step="0.01"
              placeholder="29.99"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
            />

            <AdminFormInput
              label="Cashback Value (%) *"
              id="prod-cb-value"
              type="number"
              step="0.1"
              placeholder="10.0"
              value={prodCashbackValue}
              onChange={(e) => setProdCashbackValue(e.target.value)}
            />
          </div>

          <AdminFormInput
            label="Image URL"
            id="prod-img"
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={prodImage}
            onChange={(e) => setProdImage(e.target.value)}
          />

          <AdminFormSwitch
            label="Active / Display on feeds"
            id="prod-active"
            checked={prodActive}
            onChange={(e) => setProdActive(e.target.checked)}
          />
        </form>
      </AdminModal>
    </div>
  );
}
