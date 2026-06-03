import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput } from './AdminComponents';

export default function AdminDeals({ deals, onAddDeal, onDeleteDeal }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [dealName, setDealName] = useState('');
  const [dealImg, setDealImg] = useState('');
  const [dealOffer, setDealOffer] = useState('');
  const [dealUrl, setDealUrl] = useState('');
  const [dealCashback, setDealCashback] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setDealName('');
    setDealImg('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300');
    setDealOffer('');
    setDealUrl('');
    setDealCashback('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!dealName.trim() || !dealOffer.trim() || !dealCashback.trim()) {
      setFormError('Please fill in Deal Name, Offer Text, and Cashback value.');
      return;
    }

    onAddDeal({
      name: dealName,
      image: dealImg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      offerText: dealOffer,
      link: dealUrl || 'https://google.com',
      cashback: dealCashback,
    });

    setIsModalOpen(false);
  };

  const headers = ['Banner Image', 'Deal Name', 'Offer Text', 'Cashback', 'Status', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '70px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300';
          }}
        />
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.name}</td>
      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.offerText}</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '600' }}>{item.cashback}</td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>
        <button className="admin-btn-icon delete" onClick={() => onDeleteDeal(item.id)} title="Delete Banner Deal">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="admin-deals-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Deals & Banners</h2>
          <p>Configure homepage featured banners and promo codes</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add Featured Deal
        </button>
      </div>

      <AdminTable
        headers={headers}
        items={deals}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No deals or banners configured."
      />

      {/* Add Deal Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Featured Banner Deal"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              Save Deal
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
            label="Deal / Banner Name *"
            id="deal-name"
            type="text"
            placeholder="e.g., Amazon Electronics Flash Deal"
            value={dealName}
            onChange={(e) => setDealName(e.target.value)}
          />

          <AdminFormInput
            label="Offer Text *"
            id="deal-offer"
            type="text"
            placeholder="e.g., Up to 50% Off Kitchen Ware + 10% Cashback"
            value={dealOffer}
            onChange={(e) => setDealOffer(e.target.value)}
          />

          <div className="admin-form-row">
            <AdminFormInput
              label="Cashback Reward (e.g., 10% or $5.00) *"
              id="deal-cashback"
              type="text"
              placeholder="e.g., 10%"
              value={dealCashback}
              onChange={(e) => setDealCashback(e.target.value)}
            />

            <AdminFormInput
              label="Affiliate Target Link"
              id="deal-url"
              type="url"
              placeholder="https://amazon.to/abcde"
              value={dealUrl}
              onChange={(e) => setDealUrl(e.target.value)}
            />
          </div>

          <AdminFormInput
            label="Banner / Product Image URL"
            id="deal-img"
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={dealImg}
            onChange={(e) => setDealImg(e.target.value)}
          />
        </form>
      </AdminModal>
    </div>
  );
}
