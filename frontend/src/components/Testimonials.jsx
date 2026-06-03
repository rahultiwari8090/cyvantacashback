import React from 'react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote: "I was skeptical at first, but in the last 6 months I've withdrawn over ₹340 straight into my bank account. It's literally free money for shopping I was already doing!",
    user: "Elena Rostova",
    earnings: "₹342.50",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
  {
    id: 2,
    quote: "The referral program is insane! I shared my link on my Instagram and now I get 10% of whatever my friends earn. Earning passive income has never been this simple.",
    user: "Rahul Sharma",
    earnings: "₹810.00",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: 3,
    quote: "Bought all my travel bookings and flight tickets through MakeMyTrip via Cyvanta Cashback. Stacking credit card points, store discounts, and affiliate cashback is the ultimate hack!",
    user: "Marcus Chen",
    earnings: "₹1,120.00",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
];

export default function Testimonials() {
  return (
    <div style={{ width: '100%', marginBottom: '40px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <MessageSquare className="section-icon" size={24} />
          <h3 className="section-title">Loved by Smart Shoppers</h3>
        </div>
      </div>

      <div className="testimonials-container">
        {TESTIMONIALS.map((t) => (
          <div key={t.id} className="testimonial-card animate-fade">
            <div className="stars-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" stroke="none" />
              ))}
            </div>

            <p className="testimonial-quote">"{t.quote}"</p>

            <div className="testimonial-user">
              <img src={t.avatar} alt={t.user} className="testimonial-avatar" />
              <div className="testimonial-user-info">
                <span className="testimonial-username">{t.user}</span>
                <span className="testimonial-user-tag">
                  <ShieldCheck size={12} fill="currentColor" stroke="white" />
                  Earning: {t.earnings} Confirmed
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
