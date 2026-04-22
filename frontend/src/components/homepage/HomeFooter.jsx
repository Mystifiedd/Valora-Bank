import { Link } from 'react-router-dom';

export default function HomeFooter() {
  return (
    <footer className="Home-footer">
      <div className="Home-footer__inner">
        <div className="Home-footer__grid">
          {/* Brand column */}
          <div className="Home-footer__brand">
            <div className="Home-footer__logo">
              <img src="/logo.png" alt="Valora Bank" className="Home-footer__logo-img" />
              <span className="Home-footer__logo-text">Valora Bank</span>
            </div>
            <p className="Home-footer__brand-desc">
              Committed to helping you make the most of your money with innovative
              banking solutions and exceptional service.
            </p>
            <div className="Home-footer__social">
              {/* Facebook */}
              <a href="#" className="Home-footer__social-link" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="Home-footer__social-link" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="Home-footer__social-link" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="Home-footer__social-link" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="Home-footer__column">
            <h4>Products</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Checking</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Savings</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Credit Cards</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Mortgages</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Auto Loans</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Investing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="Home-footer__column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Help Center</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Financial Education</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Calculators</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Mobile App</a></li>
            </ul>
          </div>

          {/* About */}
          <div className="Home-footer__column">
            <h4>About Valora</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Careers</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Community</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Investor Relations</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="Home-footer__column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Terms of Use</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Security</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Accessibility</a></li>
              <li><a href="https://dcgf.gov.np/" target='_blank' >DCGF Coverage</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="Home-footer__bottom">
          <div className="Home-footer__legal">
            &copy; {new Date().getFullYear()} Valora Bank, Balkumari, Lalitpur, Bagmati. 'A' class institution of NRB.
            All rights reserved. Deposit products offered by Valora Bank, Balkumari, Lalitpur, Bagmati
            Investment products are: Not DCGF Insured &bull; Not Bank Guaranteed &bull; May Lose Value.
          </div>
          <div className="Home-footer__legal-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Security</a>
            <a href="https://maps.app.goo.gl/ScHxZ3jUAnMLtF3q6" target="_blank" rel="noopener noreferrer" >Site Map</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
