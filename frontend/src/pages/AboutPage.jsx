import HomeHeader from '../components/homepage/HomeHeader';
import HomeFooter from '../components/homepage/HomeFooter';

export default function AboutPage() {
  return (
    <div className="Home-homepage">
      <HomeHeader />

      {/* Hero banner */}
      <section className="Home-about-hero">
        <div className="Home-about-hero__inner">
          <h1 className="Home-about-hero__title">About Valora Bank</h1>
          <p className="Home-about-hero__subtitle">
            Building trust through innovation since 2026.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="Home-about">
        <div className="Home-about__inner">

          {/* Mission */}
          <section className="Home-about__section">
            <h2>Our Mission</h2>
            <p>
              At Valora Bank, our mission is to empower individuals and businesses with accessible,
              secure, and innovative financial services. We believe that banking should be simple,
              transparent, and available to everyone — regardless of background or financial status.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </section>

          {/* Story */}
          <section className="Home-about__section">
            <h2>Our Story</h2>
            <p>
              Founded in 2026 in Balkumari, Lalitpur, Valora Bank was born as a college project from a vision to modernise banking in Nepal. What started as a small community-focused institution has grown into a  trusted name serving thousands of customers across the country with branches in Lalitpur, Pokhara, Bhaktapur, Biratnagar, and Bharatpur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
              voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
              illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
              consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
              quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
            </p>
          </section>

          {/* Values */}
          <section className="Home-about__section">
            <h2>Our Values</h2>
            <div className="Home-about__values-grid">
              <div className="Home-about__value-card">
                <h3>Integrity</h3>
                <p>We operate with complete transparency and uphold the highest ethical standards in every transaction and interaction.</p>
              </div>
              <div className="Home-about__value-card">
                <h3>Innovation</h3>
                <p>We continuously invest in technology to deliver seamless digital banking experiences that keep pace with the future.</p>
              </div>
              <div className="Home-about__value-card">
                <h3>Customer First</h3>
                <p>Every decision we make is guided by the needs and aspirations of our customers and the communities we serve.</p>
              </div>
              <div className="Home-about__value-card">
                <h3>Security</h3>
                <p>We safeguard your assets and data with industry-leading encryption, fraud detection, and regulatory compliance.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="Home-about__section Home-about__contact">
            <h2>Contact Us</h2>
            <p>
              Have questions or need assistance? Our support team is here to help.
            </p>
            <div className="Home-about__contact-details">
              <div className="Home-about__contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <strong>Email Us</strong>
                  <a href="mailto:support@valora.com">support@valora.com</a>
                </div>
              </div>
              <div className="Home-about__contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div>
                  <strong>Call Us</strong>
                  <span>+977 01-5555555</span>
                </div>
              </div>
              <div className="Home-about__contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <strong>Visit Us</strong>
                  <span>Balkumari, Lalitpur, Bagmati, Nepal</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
