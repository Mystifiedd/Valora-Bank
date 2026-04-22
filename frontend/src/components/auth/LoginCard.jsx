import { useState } from 'react';

export default function LoginCard({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  registerLink
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="login-card login-card--compact">
      <div className="login-card__head">
        <h2 className="login-card__title">Sign in</h2>
        <p className="login-card__subtitle">
          Access your account
        </p>
      </div>

      {error && <div className="login-alert">{error}</div>}

      <form onSubmit={onSubmit} noValidate>
        {/* Email */}
        <div className="login-field">
          <label className="login-field__label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            className="login-field__input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label className="login-field__label" htmlFor="login-password">
            Password
          </label>
          <div className="login-field__password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="login-field__input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        {/* Remember / Forgot */}
        <div className="login-extras">
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <a href="#forgot" className="login-forgot" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Register */}
      <div className="login-card__footer">
        Don&apos;t have an account?{' '}
        {registerLink}
      </div>
    </div>
  );
}
