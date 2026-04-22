import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/format';
import RegisterCard from '../../components/auth/RegisterCard';
import HomeHeader from '../../components/homepage/HomeHeader';
import HomeFooter from '../../components/homepage/HomeFooter';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Home-homepage">
      <HomeHeader />

      <section className="Home-register-section">
        <div className="Home-register-section__inner">
          {/* Info column */}
          <div className="Home-register-section__info">
            <h1 className="Home-register-section__title">
              Start your banking journey today
            </h1>
            <p className="Home-register-section__desc">
              Open a free account in minutes. Enjoy secure transfers, real-time
              notifications and a dashboard built for modern banking.
            </p>
            <ul className="Home-register-section__benefits">
              <li>
                <span className="Home-register-section__benefits-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                No monthly maintenance fees
              </li>
              <li>
                <span className="Home-register-section__benefits-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                FDIC insured up to $250,000
              </li>
              <li>
                <span className="Home-register-section__benefits-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                Free instant transfers
              </li>
              <li>
                <span className="Home-register-section__benefits-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                24/7 customer support
              </li>
            </ul>
          </div>

          {/* Register card */}
          <div className="Home-register-section__card-wrap">
            <RegisterCard
              form={form}
              onChange={handleChange}
              error={error}
              loading={loading}
              onSubmit={handleSubmit}
              loginLink={<Link to="/login">Sign in</Link>}
            />
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
