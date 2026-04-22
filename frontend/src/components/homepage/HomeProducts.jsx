export default function HomeProducts() {
  const products = [
    {
      title: 'Checking Accounts',
      desc: 'Everyday banking with no monthly fees, free ATM access, and built-in budgeting tools.',
      icon: 'checking',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      title: 'Savings Accounts',
      desc: 'Grow your money with competitive rates and automatic savings features. Start with as little as Rs. 10.',
      icon: 'savings',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
          <path d="M2 9.1C1.4 9.3 1 10.1 1 11c0 .9.4 1.7 1 1.9" />
          <circle cx="12.5" cy="11" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Credit Cards',
      desc: 'Earn rewards on every purHome. Choose from cash back, travel points, or low interest options.',
      icon: 'credit',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
          <line x1="5" y1="15" x2="10" y2="15" />
        </svg>
      ),
    },
    {
      title: 'Mortgages',
      desc: 'Find your dream home with competitive rates and flexible terms. Pre-qualify in minutes online.',
      icon: 'mortgage',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      title: 'Investing',
      desc: 'Build wealth with guided portfolios, self-directed trading, and expert financial advice.',
      icon: 'investing',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
    {
      title: 'Business Banking',
      desc: 'Dedicated solutions for businesses of all sizes including merchant services and payroll.',
      icon: 'business',
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ];

  return (
    <section className="Home-products" id="products">
      <div className="Home-products__inner">
        <div className="Home-section-header">
          <h2 className="Home-section-header__title">
            Banking Products &amp; Services
          </h2>
          <p className="Home-section-header__subtitle">
            Everything you need to manage, grow, and protect your money — in one place.
          </p>
        </div>
        <div className="Home-products__grid">
          {products.map((p) => (
            <a key={p.title} href="#" className="Home-product-card" onClick={(e) => e.preventDefault()}>
              <div className={`Home-product-card__icon Home-product-card__icon--${p.icon}`}>
                {p.svg}
              </div>
              <div className="Home-product-card__title">{p.title}</div>
              <div className="Home-product-card__desc">{p.desc}</div>
              <span className="Home-product-card__link">
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
