import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'Limited Time Bonanza',
    title: 'Earn Real Cashback. <span>Withdraw to Bank.</span>',
    desc: 'Shop at Amazon, Ajio, Flipkart & 500+ stores via Cyvanta and get paid real cash on top of store discounts!',
    cta: 'Browse Top Offers',
    storeName: 'Myntra Fashion',
    cashbackRate: '12%',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
  },
  {
    id: 2,
    tag: 'Electronics Mega Deal',
    title: 'Up to <span>8% Cashback</span> on Gadgets & Tech',
    desc: 'Upgrade your phone, laptop, or home devices. Get guaranteed cashback rates and active merchant coupons.',
    cta: 'Shop Electronics Now',
    storeName: 'Flipkart Electronics',
    cashbackRate: '8.5%',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=flipkart.com',
  },
  {
    id: 3,
    tag: 'Referral Bonanza',
    title: 'Refer Friends. <span>Get 10% Forever!</span>',
    desc: 'Share your personal referral link with friends. Earn a flat 10% of the cashback they earn, for life!',
    cta: 'Invite Friends Now',
    storeName: 'Ajio Deals',
    cashbackRate: '15%',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=ajio.com',
  },
];

export default function Hero({ onCtaClick, setView, currentUser, openAuthModal }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  const handleCta = () => {
    if (activeSlide === 2) {
      if (currentUser) {
        setView('dashboard');
      } else {
        openAuthModal();
      }
    } else {
      onCtaClick();
    }
  };

  return (
    <div className="hero-wrapper">
      <div className="hero-slide" key={slide.id}>
        <div className="hero-content">
          <span className="hero-tag">
            <Sparkles size={14} />
            {slide.tag}
          </span>
          <h2 className="hero-title" dangerouslySetInnerHTML={{ __html: slide.title }} />
          <p className="hero-desc">{slide.desc}</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={handleCta}>
              {slide.cta} <ArrowRight size={16} style={{ marginLeft: '6px', display: 'inline' }} />
            </button>
          </div>
        </div>

        <div className="hero-graphics">
          <div className="hero-image-card">
            <img src={slide.logo} alt={slide.storeName} className="hero-card-logo" />
            <div className="hero-card-deal">
              <span className="hero-card-rate">{slide.cashbackRate}</span>
              <span className="hero-card-desc" style={{ display: 'block' }}>Real Cashback</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.7 }}>
              *Payout via Direct Bank Transfer
            </span>
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {HERO_SLIDES.map((_, index) => (
          <div
            key={index}
            className={`hero-dot ${index === activeSlide ? 'active' : ''}`}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
