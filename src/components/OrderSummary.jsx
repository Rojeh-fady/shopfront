import { FREE_SHIPPING_THRESHOLD, money, orderTotals } from '../lib/pricing.js';

export default function OrderSummary({ items, method = 'standard', showItems = false, children }) {
  const { subtotal, shipping, total } = orderTotals(items, method);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <aside className="summary card">
      <h2>Order summary</h2>

      {showItems && (
        <ul className="summary-items">
          {items.map((i) => (
            <li key={i.id}>
              <img src={i.image} alt="" />
              <span className="summary-item-title">
                {i.title} <span className="muted">× {i.qty}</span>
              </span>
              <span>{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="summary-rows">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div>
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? 'Free' : money(shipping)}</dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>

      {method === 'standard' && remaining > 0 && subtotal > 0 && (
        <p className="free-ship">
          Add <strong>{money(remaining)}</strong> more for free standard shipping.
        </p>
      )}

      {children}
    </aside>
  );
}
