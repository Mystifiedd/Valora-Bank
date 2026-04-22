import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to an error-tracking service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.replace('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: 'var(--space-3)' }}>Something went wrong</h1>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-5)' }}>
              An unexpected error occurred. Please try refreshing the page or
              returning to the home screen.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre
                style={{ textAlign: 'left', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', marginBottom: 'var(--space-5)', fontSize: '0.875rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button className="button button-primary" onClick={this.handleReload}>
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
