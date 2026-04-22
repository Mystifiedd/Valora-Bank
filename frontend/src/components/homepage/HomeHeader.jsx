import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Checking', href: '#checking' },
    { label: 'Savings', href: '#savings' },
    { label: 'Credit Cards', href: '#credit-cards' },
    { label: 'Mortgages', href: '#mortgages' },
    { label: 'Investing', href: '#investing' },
    { label: 'Auto Loans', href: '#auto' },
  ];

  return (
    <header className={`Home-header${mobileOpen ? ' Home-header--mobile-open' : ''}`}>
      <div className="Home-header__inner">
        {/* Logo */}
        <Link to="/" className="Home-header__logo">
          <img src="/logo.png" alt="Valora Bank" className="Home-header__logo-img" />
          <span className="Home-header__logo-text">Valora Bank</span>
        </Link>

        {/* Navigation Links */}
        <ul className="Home-header__nav">
          {navLinks.map((link) => (
            <li key={link.label} className="Home-header__nav-item">
              <a href={link.href} className="Home-header__nav-link" onClick={(e) => e.preventDefault()}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="Home-header__actions">
          <Link to="/login" className="Home-header__btn Home-header__btn--outline">
            Sign In
          </Link>
          <Link to="/register" className="Home-header__btn Home-header__btn--primary">
            Open Account
          </Link>
          {/* Mobile Hamburger */}
          <button
            className="Home-header__mobile-toggle"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Utility Bar */}
      <div className="Home-utility-bar">
        <div className="Home-utility-bar__inner">
          <Link to="/about" className="Home-utility-bar__link" >Customer Service</Link>
          <a href="https://maps.app.goo.gl/ScHxZ3jUAnMLtF3q6" target="_blank" rel="noopener noreferrer" className="Home-utility-bar__link" >ATM &amp; Branch Locator</a>
        </div>
      </div>
    </header>
  );
}
