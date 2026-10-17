import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="center-state">
      <h1>404</h1>
      <p className="muted">We couldn't find that page.</p>
      <Link to="/" className="btn btn-primary">
        Back to shop
      </Link>
    </div>
  );
}
