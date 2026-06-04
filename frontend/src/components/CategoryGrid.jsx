import React from 'react';
import { Layers, Shirt, Smartphone, Heart, ShoppingCart, Plane } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Stores', icon: Layers },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'health', name: 'Health & Beauty', icon: Heart },
  { id: 'grocery', name: 'Food & Grocery', icon: ShoppingCart },
  { id: 'travel', name: 'Travel & Flights', icon: Plane },
];

export default function CategoryGrid({ activeCategory, onCategoryChange }) {
  return (
    <div style={{ width: '100%' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <Layers className="section-icon" size={24} />
          <h3 className="section-title">Shop by Category</h3>
        </div>
      </div>

      <div className="categories-container">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <div className="category-icon-box">
                <Icon size={22} />
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
