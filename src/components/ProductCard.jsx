import { Link } from 'react-router-dom';
import Rating from './Rating.jsx';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { capitalize, money } from '../lib/pricing.js';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  const handleAdd = () => {
    addItem(product, 1);
    showToast('Added to cart');
  };

  return (
    <article className="card product-card">
      <Link to={`/product/${product.id}`} className="product-img-wrap">
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-body">
        <span className="eyebrow">{capitalize(product.category)}</span>
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <Rating rate={product.rating.rate} count={product.rating.count} />
        <div className="product-footer">
          <span className="price">{money(product.price)}</span>
          <button className="btn btn-small" onClick={handleAdd}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
