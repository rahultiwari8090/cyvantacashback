import React, { useEffect, useState } from 'react';
import { Save, FileText, Image, Globe } from 'lucide-react';

export default function AdminSEO({ globalSettings, onSaveSettings }) {
  const [seoTitle, setSeoTitle] = useState(globalSettings.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(globalSettings.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(globalSettings.seoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(globalSettings.seoImageUrl || '');

  useEffect(() => {
    setSeoTitle(globalSettings.seoTitle || '');
    setSeoDescription(globalSettings.seoDescription || '');
    setSeoKeywords(globalSettings.seoKeywords || '');
    setOgImageUrl(globalSettings.seoImageUrl || '');
  }, [globalSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...globalSettings,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImageUrl: ogImageUrl,
    });
  };

  return (
    <div className="admin-settings-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>SEO & Meta Settings</h2>
          <p>Configure the public site title, description, keywords and Open Graph preview image.</p>
        </div>
      </div>

      <div className="admin-table-card animate-fade" style={{ padding: '32px', maxWidth: '750px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <Globe size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: 'var(--text)' }}>
              These SEO values are used for the public storefront meta tags and social preview information.
            </p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="seo-title">Site Meta Title</label>
            <input
              id="seo-title"
              className="admin-form-input"
              type="text"
              placeholder="Best online cashback deals and affiliate offers"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="seo-description">Meta Description</label>
            <textarea
              id="seo-description"
              className="admin-form-input"
              placeholder="Drive traffic with the best cashback deals, affiliate offers, and personalized coupons for Amazon, Flipkart, and more."
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="seo-keywords">Meta Keywords</label>
            <input
              id="seo-keywords"
              className="admin-form-input"
              type="text"
              placeholder="cashback, affiliate, deals, coupons, Amazon, Flipkart"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="seo-image">Open Graph Image URL</label>
            <input
              id="seo-image"
              className="admin-form-input"
              type="url"
              placeholder="https://example.com/og-image.png"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
            <Save size={16} />
            Save SEO Settings
          </button>
        </form>
      </div>
    </div>
  );
}
