export function Spinner({ label = 'Loading' }) {
  return (
    <div className="center-state" role="status">
      <div className="spinner" />
      <p className="muted">{label}...</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="center-state" role="alert">
      <h2>Something went wrong</h2>
      <p className="muted">{error?.message || 'Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton skeleton-img" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
