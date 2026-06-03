import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export default function TopDeals({ deals, onGrabDeal }) {
  return (
    <div style={{ width: '100%', marginBottom: '40px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <Tag className="section-icon" size={24} />
          <h3 className="section-title">Top Deals of the Day</h3>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> Updated hourly
        </span>
      </div>

      <div className="deals-grid">
        {deals.map((deal) => {
          // Calculations
          const discountPercent = Math.round(((deal.retailPrice - deal.dealPrice) / deal.retailPrice) * 100);
          const finalEffectivePrice = (deal.dealPrice - deal.cashbackEarned).toFixed(2);

          return (
            <div key={deal.id} className="deal-card animate-fade" style={{ position: 'relative' }}>
              <span className="deal-badge">{discountPercent}% OFF</span>

              <div className="deal-image-box">
                <img src={deal.image} alt={deal.title} className="deal-image" />
              </div>

              <div className="deal-info">
                <div className="deal-store-row">
                  <img src={deal.storeLogo} alt="Store Logo" className="deal-store-logo" />
                  <span className="deal-category">{deal.category}</span>
                </div>

                <h4 className="deal-title">{deal.title}</h4>

                <div className="deal-price-section">
                  <div className="deal-retail-row">
                    <span>Retail Price:</span>
                    <span className="deal-retail-price">₹{deal.retailPrice.toFixed(2)}</span>
                  </div>

                  <div className="deal-discounted-row">
                    <span>Special Price:</span>
                    <span>₹{deal.dealPrice.toFixed(2)}</span>
                  </div>

                  <div className="deal-cashback-row">
                    <span>Cyvanta Cashback:</span>
                    <span>-₹{deal.cashbackEarned.toFixed(2)}</span>
                  </div>

                  <div className="deal-effective-row">
                    <span>Final Effective Price:</span>
                    <span>₹{finalEffectivePrice}</span>
                  </div>
                </div>

                <button
                  className="btn-card-primary"
                  onClick={() => onGrabDeal(deal)}
                  style={{ marginTop: '4px' }}
                >
                  Grab Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
