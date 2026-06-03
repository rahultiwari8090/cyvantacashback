import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, ShoppingBag, User, Wallet, LogOut, ChevronDown } from 'lucide-react';

export default function Header({
  currentView,
  setView,
  theme,
  toggleTheme,
  currentUser,
  onLogout,
  openAuthModal,
  storesData,
  onStoreSelect,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Filter stores based on search query
  const suggestions = searchQuery.trim()
    ? storesData.filter((store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (store) => {
    onStoreSelect(store.id);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="header-wrapper">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section" onClick={() => setView('home')}>
          <div className="logo-icon">C</div>
          <h1 className="logo-text">
            Cyvanta<span>Cashback</span>
          </h1>
        </div>

        {/* Search bar */}
        <div className="search-bar-container" ref={searchRef}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search for Flipkart, Myntra, Amazon & 500+ stores..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((store) => (
                <div
                  key={store.id}
                  className="suggestion-item animate-fade"
                  onClick={() => handleSuggestionClick(store)}
                >
                  <img src={store.logo} alt={store.name} className="suggestion-img" />
                  <span className="suggestion-text">{store.name}</span>
                  <span className="suggestion-tag">Up to {store.cashbackRate} Cashback</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setView('home')}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              if (currentUser) {
                setView('dashboard');
              } else {
                openAuthModal();
              }
            }}
          >
            My Wallet
          </button>
          <a href="#how-it-works" className="nav-link" onClick={() => setView('home')}>
            How it Works
          </a>
          <button
            className={`nav-link ${currentView === 'admin-login' ? 'active' : ''}`}
            onClick={() => setView('admin-login')}
            style={{ fontWeight: '700', color: 'var(--primary)' }}
          >
            Admin Panel
          </button>
        </nav>

        {/* Actions (theme toggle, login, user dashboard badge) */}
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {currentUser ? (
            <div className="user-profile-badge" onClick={() => setView('dashboard')}>
              <div className="user-avatar">{currentUser.name[0].toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">Hey, {currentUser.name}</span>
                <span className="user-wallet">${currentUser.wallet.confirmed.toFixed(2)}</span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text)', opacity: 0.5 }} />
            </div>
          ) : (
            <button className="btn-primary" onClick={openAuthModal}>
              Login / Sign Up
            </button>
          )}

          {currentUser && (
            <button
              onClick={onLogout}
              className="theme-toggle-btn"
              title="Logout"
              style={{ border: 'none', color: '#ef4444' }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
