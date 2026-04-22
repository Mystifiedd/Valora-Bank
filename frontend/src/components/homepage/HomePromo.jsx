export default function HomePromo() {
  return (
    <section className="Home-promo">
      <div className="Home-promo__inner">
        <div className="Home-promo__card">
          <div className="Home-promo__content">
            <span className="Home-promo__label">Limited Time Offer</span>
            <h2 className="Home-promo__title">
              Valora Sapphire Preferred® Card
            </h2>
            <p className="Home-promo__desc">
              Earn 75,000 bonus points after you spend Rs. 40,000 on purHomes in
              the first 3 months. That's over Rs. 9,000 when redeemed for travel.
            </p>
            <a
              href="#apply"
              className="Home-promo__cta"
              onClick={(e) => e.preventDefault()}
            >
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
          <div className="Home-promo__visual">
            <div className="Home-promo__card-img-b">
              <span className="Home-promo__card-logo">VALORA</span>
              <div className="Home-promo__card-chip" />
              <div>
                <div className="Home-promo__card-number">•••• •••• •••• 4821</div>
                <div className="Home-promo__card-name">Aadarsh K. Chaudhary</div>
              </div>
            </div>
          </div>
          <div className="Home-promo__visual">
            <div className="Home-promo__card-img">
              <span className="Home-promo__card-logo">VALORA</span>
              <div className="Home-promo__card-chip" />
              <div>
                <div className="Home-promo__card-number">•••• •••• •••• 1251</div>
                <div className="Home-promo__card-name">Aadarsh K. Chaudhary</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
