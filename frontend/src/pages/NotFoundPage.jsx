import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="status-page">
      <h1 className="status-page__code">404</h1>
      <p className="status-page__message">Page not found.</p>
      <Link to="/" className="button button-primary">Go Home</Link>
    </div>
  );
}
