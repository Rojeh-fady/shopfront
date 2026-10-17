import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import QtyControl from '../components/QtyControl.jsx';
import Rating from '../components/Rating.jsx';
import { ErrorState, Spinner } from '../components/States.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getProduct, getProducts } from '../lib/api.js';
import { capitalize, money } from '../lib/pricing.js';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const [qty, setQty] = useState(1);

  const { data: product, loading, error, retry } = useAsync((signal) => getProduct(id, signal), [id]);
  const { data: all } = useAsync((signal) => getProducts(signal), []);

  useEffect(() => {
    setQty(1);
  }, [id]);

  if (loading) return <Spinner label="Loading product" />;

  if (error?.status === 404) {
    return (
      <div className="center-state">
        <h2>Product not found</h2>
        <p className="muted">This product doesn't exist or was removed.</p>
        <Link className="btn btn-primary" to="/">
          Back to shop
        </Link>
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={retry} />;

  const related = (all || []).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addItem(product, qty);
    showToast(`Added ${qty} to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/checkout');
  };

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Shop</Link>
        <span>/</span>
        <Link to={`/?cat=${encodeURIComponent(product.category)}`}>{capitalize(product.category)}</Link>
      </nav>

      <section className="details">
        <div className="details-img card">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="details-info">
          <span className="eyebrow">{capitalize(product.category)}</span>
          <h1>{product.title}</h1>
          <Rating rate={product.rating.rate} count={product.rating.count} />
          <p className="details-price">{money(product.price)}</p>
          <p className="details-desc">{product.description}</p>

          <div className="details-actions">
            <QtyControl value={qty} onChange={setQty} />
            <button className="btn btn-primary" onClick={handleAdd}>
              Add to cart
            </button>
            <button className="btn btn-outline" onClick={handleBuyNow}>
              Buy now
            </button>
          </div>
          <ul className="perks muted">
            <li>Free standard shipping on orders over $100</li>
            <li>Cash on delivery available</li>
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <h2>You might also like</h2>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
