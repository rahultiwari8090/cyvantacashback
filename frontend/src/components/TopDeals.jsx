import React from 'react';
import { Tag, Sparkles, Share2 } from 'lucide-react';

export default function TopDeals({ deals, onGrabDeal, onShareDeal }) {
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
          const discountPercent = Math.round((((deal.retailPrice || 0) - (deal.dealPrice || 0)) / (deal.retailPrice || 1)) * 100);

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
                    <span className="deal-retail-price">₹{(deal.retailPrice || 0).toFixed(2)}</span>
                  </div>

                  <div className="deal-discounted-row">
                    <span>Special Price:</span>
                    <span>₹{(deal.dealPrice || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    className="btn-card-primary"
                    onClick={() => onGrabDeal(deal)}
                    style={{ flex: 1 }}
                  >
                    Grab Deal
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShareDeal) {
                        onShareDeal(deal);
                      }
                    }}
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Share Deal"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
