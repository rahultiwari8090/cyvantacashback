import React from 'react';
import { Search, ShoppingBag, Landmark, Info } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div id="how-it-works" style={{ width: '100%', marginBottom: '40px', scrollMarginTop: '100px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <Info className="section-icon" size={24} />
          <h3 className="section-title">How Cyvanta Works</h3>
        </div>
      </div>

      <div className="how-steps-container">
        {/* Step 1 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">1</span>
          <div className="how-step-icon-box">
            <Search size={28} />
          </div>
          <h4 className="how-step-title">1. Search & Generate Link</h4>
          <p className="how-step-desc">
            Search for your favorite store or product and generate a custom affiliate tracking link.
          </p>
        </div>

        {/* Step 2 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">2</span>
          <div className="how-step-icon-box">
            <ShoppingBag size={28} />
          </div>
          <h4 className="how-step-title">2. Share with Audience</h4>
          <p className="how-step-desc">
            Share your generated link on social media, with friends, or your audience.
          </p>
        </div>

        {/* Step 3 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">3</span>
          <div className="how-step-icon-box">
            <Landmark size={28} />
          </div>
          <h4 className="how-step-title">3. Earn Commissions</h4>
          <p className="how-step-desc">
            When someone clicks your link and makes a purchase, the retailer pays us, and we pay you a direct commission straight to your bank!
          </p>
        </div>
      </div>
    </div>
  );
}
