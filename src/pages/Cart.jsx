import { Link, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary.jsx';
import QtyControl from '../components/QtyControl.jsx';
import { money } from '../lib/pricing.js';
import { useCartStore } from '../store/cartStore.js';

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="center-state">
        <h1>Your cart is empty</h1>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Shopping cart</h1>
        <button className="link-btn" onClick={clear}>
          Clear cart
        </button>
      </div>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li className="cart-item card" key={item.id}>
              <Link to={`/product/${item.id}`} className="cart-img">
                <img src={item.image} alt={item.title} />
              </Link>
              <div className="cart-info">
                <Link to={`/product/${item.id}`} className="cart-title">
                  {item.title}
                </Link>
                <span className="muted">{money(item.price)} each</span>
                <div className="cart-controls">
                  <QtyControl value={item.qty} onChange={(n) => setQty(item.id, n)} label={`Quantity for ${item.title}`} />
                  <button className="link-btn danger" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
              <strong className="cart-line-total">{money(item.price * item.qty)}</strong>
            </li>
          ))}
        </ul>

        <OrderSummary items={items}>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
          <Link to="/" className="btn btn-ghost btn-block">
            Continue shopping
          </Link>
        </OrderSummary>
      </div>
    </>
  );
}
