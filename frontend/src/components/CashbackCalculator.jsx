import React, { useState } from 'react';
import { Calculator, Sparkles } from 'lucide-react';

export default function CashbackCalculator() {
  const [fashion, setFashion] = useState(100); // monthly spend
  const [electronics, setElectronics] = useState(150);
  const [grocery, setGrocery] = useState(200);
  const [travel, setTravel] = useState(250);

  // Cashback percentage rates modeled on average store affiliates
  const fashionRate = 0.12;     // 12% average
  const electronicsRate = 0.05; // 5% average
  const groceryRate = 0.04;     // 4% average
  const travelRate = 0.08;      // 8% average

  const monthlyCashback =
    fashion * fashionRate +
    electronics * electronicsRate +
    grocery * groceryRate +
    travel * travelRate;

  const yearlyCashback = monthlyCashback * 12;

  return (
    <div className="calc-wrapper animate-fade">
      <div className="calc-intro">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--secondary)',
            fontSize: '13px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '99px',
            marginBottom: '12px',
          }}
        >
          <Sparkles size={14} /> Interactive Savings Widget
        </span>
        <h2>How Much Can You Earn?</h2>
        <p style={{ color: 'var(--text)' }}>
          Select your estimated monthly spends below to see how much real cash you can secure back
          into your wallet with Cyvanta.
        </p>
      </div>

      <div className="calc-grid">
        <div className="calc-sliders">
          {/* Fashion Spend Slider */}
          <div className="calc-slider-card">
            <div className="slider-label-row">
              <span>Fashion & Lifestyle (12% Avg. Cashback)</span>
              <span>₹{fashion} / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={fashion}
              onChange={(e) => setFashion(Number(e.target.value))}
              className="calc-slider"
            />
          </div>

          {/* Electronics Spend Slider */}
          <div className="calc-slider-card">
            <div className="slider-label-row">
              <span>Electronics & Mobiles (5% Avg. Cashback)</span>
              <span>₹{electronics} / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={electronics}
              onChange={(e) => setElectronics(Number(e.target.value))}
              className="calc-slider"
            />
          </div>

          {/* Grocery/Food Spend Slider */}
          <div className="calc-slider-card">
            <div className="slider-label-row">
              <span>Food & Daily Groceries (4% Avg. Cashback)</span>
              <span>₹{grocery} / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={grocery}
              onChange={(e) => setGrocery(Number(e.target.value))}
              className="calc-slider"
            />
          </div>

          {/* Travel Spend Slider */}
          <div className="calc-slider-card">
            <div className="slider-label-row">
              <span>Travel & Flight Bookings (8% Avg. Cashback)</span>
              <span>₹{travel} / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={travel}
              onChange={(e) => setTravel(Number(e.target.value))}
              className="calc-slider"
            />
          </div>
        </div>

        {/* Real-time Math Output Card */}
        <div className="calc-results-card">
          <Calculator size={36} style={{ color: 'var(--primary)' }} />
          <div className="calc-result-title">Estimated Annual Payout</div>
          <div className="calc-result-amount">₹{yearlyCashback.toFixed(0)}</div>
          <p className="calc-result-subtext">
            Based on a total monthly spend of <strong>₹{fashion + electronics + grocery + travel}</strong>.
            This cashback is 100% real currency, withdrawable straight to your bank account or gift cards!
          </p>
        </div>
      </div>
    </div>
  );
}
