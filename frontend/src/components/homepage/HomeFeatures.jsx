export default function HomeFeatures() {
  const features = [
    {
      title: 'Mobile Banking',
      desc: 'Bank from anywhere with our award-winning mobile app.',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      title: 'Fraud Protection',
      desc: 'Real-time alerts and zero-liability fraud protection on all accounts.',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: '24/7 Support',
      desc: 'Get help any time with phone, chat, and in-branch support.',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: 'Free Transfers',
      desc: 'Send money instantly to anyone, anywhere — with no fees.',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="Home-features">
      <div className="Home-features__inner">
        <div className="Home-section-header">
          <h2 className="Home-section-header__title">Why Valora Bank?</h2>
          <p className="Home-section-header__subtitle">
            Trusted by millions for secure, reliable, and innovative banking.
          </p>
        </div>
        <div className="Home-features__grid">
          {features.map((f) => (
            <div key={f.title} className="Home-feature-item">
              <div className="Home-feature-item__icon">{f.svg}</div>
              <div className="Home-feature-item__title">{f.title}</div>
              <div className="Home-feature-item__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
