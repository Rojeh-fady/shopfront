import { Link, Navigate } from 'react-router-dom';
import { SHIPPING_METHODS, money } from '../lib/pricing.js';
import { useCheckoutStore } from '../store/checkoutStore.js';

export default function OrderSuccess() {
  const order = useCheckoutStore((s) => s.lastOrder);

  if (!order) return <Navigate to="/" replace />;

  const method = SHIPPING_METHODS.find((m) => m.id === order.shippingMethod);

  return (
    <div className="success">
      <div className="success-icon" aria-hidden="true">
        ✓
      </div>
      <h1>Thank you, {order.customer.fullName.split(' ')[0]}!</h1>
      <p className="muted">
        Your order <strong>{order.orderNumber}</strong> has been placed. A confirmation was sent to {order.customer.email}.
      </p>

      <div className="card success-card">
        <ul className="summary-items">
          {order.items.map((i) => (
            <li key={i.id}>
              <img src={i.image} alt="" />
              <span className="summary-item-title">
                {i.title} <span className="muted">× {i.qty}</span>
              </span>
              <span>{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="summary-rows">
          <div>
            <dt>Subtotal</dt>
            <dd>{money(order.subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping ({method.label})</dt>
            <dd>{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd>
          </div>
          <div className="summary-total">
            <dt>Total</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
        <p className="muted small">
          Paying by {order.paymentMethod === 'cod' ? 'cash on delivery' : `card ending in ${order.cardLast4}`} · Estimated delivery: {method.eta}
        </p>
      </div>

      <Link to="/" className="btn btn-primary">
        Continue shopping
      </Link>
    </div>
  );
}
