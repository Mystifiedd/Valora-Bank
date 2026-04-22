import { useState } from 'react';

export default function RegisterCard({
  form,
  onChange,
  error,
  loading,
  onSubmit,
  loginLink
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-card register-card">
      <div className="login-card__head">
        <div className="login-card__logo">
          <img src="/logo.png" alt="Valora Bank" height="52" />
        </div>
        <h2 className="login-card__title">Create account</h2>
        <p className="login-card__subtitle">
          Join Valora Bank — it only takes a minute
        </p>
      </div>

      {error && <div className="login-alert">{error}</div>}

      <form onSubmit={onSubmit} noValidate>
        {/* Name row */}
        <div className="register-card__row">
          <div className="login-field">
            <label className="login-field__label" htmlFor="reg-first">
              First name
            </label>
            <input
              id="reg-first"
              type="text"
              className="login-field__input"
              placeholder="First name"
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="login-field">
            <label className="login-field__label" htmlFor="reg-last">
              Last name
            </label>
            <input
              id="reg-last"
              type="text"
              className="login-field__input"
              placeholder="Last name"
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="login-field">
          <label className="login-field__label" htmlFor="reg-email">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            className="login-field__input"
            placeholder="you@example.com"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
        </div>

        {/* Phone */}
        <div className="login-field">
          <label className="login-field__label" htmlFor="reg-phone">
            Phone number
          </label>
          <input
            id="reg-phone"
            type="tel"
            className="login-field__input"
            placeholder="98XXXXXXXX"
            name="phone"
            value={form.phone}
            onChange={onChange}
            autoComplete="tel"
            required
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label className="login-field__label" htmlFor="reg-password">
            Password
          </label>
          <div className="login-field__password-wrap">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className="login-field__input"
              placeholder="Min. 8 characters"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="login-field__eye-btn"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="login-card__footer">
        Already have an account?{' '}
        {loginLink}
      </div>

      {/* Security badges */}
      <div className="login-card__security">
        <span className="login-card__security-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          256-bit SSL
        </span>
        <span className="login-card__security-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <a href="https://www.nrb.org.np/" target="_blank" 
            rel="noopener noreferrer">NRB </a> Certified
        </span>
        <span className="login-card__security-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <a href = "https://dcgf.gov.np/" target = "_blank" rel = "noopener noreferrer">DCGF </a> Protected

        </span>
      </div>
    </div>
  );
}
