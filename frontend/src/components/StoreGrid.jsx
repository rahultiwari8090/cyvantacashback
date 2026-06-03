import React from 'react';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';

export default function StoreGrid({ stores, onStoreSelect }) {
  return (
    <div style={{ width: '100%', marginBottom: '40px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <ShieldCheck className="section-icon" size={24} />
          <h3 className="section-title">Popular Cashback Retailers</h3>
        </div>
      </div>

      <div className="stores-grid">
        {stores.map((store) => (
          <div key={store.id} className="store-card animate-fade">
            {store.isPopular && (
              <span className="store-popular-tag">
                <Star size={10} fill="currentColor" /> Popular
              </span>
            )}

            <div className="store-logo-box">
              <img src={store.logo} alt={store.name} className="store-logo-img" />
            </div>

            <div className="store-meta">
              <span className="store-cashback-badge">Up to {store.cashbackRate} Cashback</span>
              <p className="store-description">{store.description}</p>
            </div>

            <div className="store-card-actions">
              <button
                className="btn-card-primary"
                onClick={() => onStoreSelect(store.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Grab Deal <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
