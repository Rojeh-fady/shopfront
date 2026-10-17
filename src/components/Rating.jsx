export default function Rating({ rate = 0, count = 0 }) {
  return (
    <div className="rating" title={`${rate} out of 5`}>
      <span className="stars" style={{ '--rating': rate }} aria-hidden="true">
        ★★★★★
      </span>
      <span className="rating-text">
        {rate.toFixed(1)} <span className="muted">({count})</span>
      </span>
      <span className="sr-only">Rated {rate} out of 5 from {count} reviews</span>
    </div>
  );
}
