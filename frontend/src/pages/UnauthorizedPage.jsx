import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="status-page">
      <h1 className="status-page__code text-danger">403</h1>
      <p className="status-page__message">You do not have permission to access this page.</p>
      <Link to="/" className="button button-primary">Go Home</Link>
    </div>
  );
}
