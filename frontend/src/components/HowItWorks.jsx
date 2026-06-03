import React from 'react';
import { Search, ShoppingBag, Landmark, Info } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div id="how-it-works" style={{ width: '100%', marginBottom: '40px', scrollMarginTop: '100px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <Info className="section-icon" size={24} />
          <h3 className="section-title">How Cyvanta Cashback Works</h3>
        </div>
      </div>

      <div className="how-steps-container">
        {/* Step 1 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">1</span>
          <div className="how-step-icon-box">
            <Search size={28} />
          </div>
          <h4 className="how-step-title">1. Search & Click Out</h4>
          <p className="how-step-desc">
            Search for your favorite store on our site and click "Grab Deal". We will instantly redirect you to their official shopping app or website.
          </p>
        </div>

        {/* Step 2 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">2</span>
          <div className="how-step-icon-box">
            <ShoppingBag size={28} />
          </div>
          <h4 className="how-step-title">2. Shop Normally</h4>
          <p className="how-step-desc">
            Place your order normally on the merchant site. Because you clicked out from us, the retailer pays Cyvanta a marketing commission for your order!
          </p>
        </div>

        {/* Step 3 */}
        <div className="how-step-card animate-fade">
          <span className="how-step-number">3</span>
          <div className="how-step-icon-box">
            <Landmark size={28} />
          </div>
          <h4 className="how-step-title">3. Get Real Cashback</h4>
          <p className="how-step-desc">
            We pass the majority of that commission back to you as "Cashback". Once the return period expires, you can transfer it straight to your Bank Account!
          </p>
        </div>
      </div>
    </div>
  );
}
