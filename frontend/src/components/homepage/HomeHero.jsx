import { Link } from 'react-router-dom';

export default function HomeHero({ children }) {
  return (
    <section className="Home-hero">
      <div className="Home-hero__inner">
        {/* Left Content */}
        <div className="Home-hero__content">
          <div className="Home-hero">
          </div>
          <h1 className="Home-hero__title">
            Your money deserves<br />
            <span>better banking.</span>
          </h1>
          <p className="Home-hero__subtitle">
            Manage your finances with confidence. Access accounts, transfer funds
            and track spending — all from one powerful, secure dashboard.
          </p>
          <div className="Home-hero__cta-group">
            <Link to="/register" className="Home-hero__cta Home-hero__cta--primary">
              Open an Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#products" className="Home-hero__cta Home-hero__cta--secondary" onClick={(e) => e.preventDefault()}>
              Explore Products
            </a>
          </div>
          <div className="Home-hero__stats">
            <div className="Home-hero__stat">
              <div className="Home-hero__stat-value">5M+</div>
              <div className="Home-hero__stat-label">Active Customers</div>
            </div>
            <div className="Home-hero__stat">
              <div className="Home-hero__stat-value">99.9%</div>
              <div className="Home-hero__stat-label">Uptime Guarantee</div>
            </div>
            <div className="Home-hero__stat">
              <div className="Home-hero__stat-value">Rs. 0</div>
              <div className="Home-hero__stat-label">Monthly Fees</div>
            </div>
          </div>
        </div>

        {/* Right - Login Card */}
        <div className="Home-hero__login">
          {children}
        </div>
      </div>
    </section>
  );
}
