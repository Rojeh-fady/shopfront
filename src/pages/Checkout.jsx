import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary.jsx';
import { createOrder } from '../lib/api.js';
import { SHIPPING_METHODS, money, orderTotals } from '../lib/pricing.js';
import {
  formatCardNumber,
  formatExpiry,
  validatePayment,
  validateShipping,
} from '../lib/validators.js';
import { useCartStore } from '../store/cartStore.js';
import { useCheckoutStore } from '../store/checkoutStore.js';

const STEPS = ['Shipping', 'Payment', 'Review'];

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small className="error-text">{error}</small>}
    </label>
  );
}

function Stepper({ step }) {
  return (
    <ol className="stepper" aria-label="Checkout progress">
      {STEPS.map((name, i) => (
        <li key={name} className={i === step ? 'current' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
          <span className="step-dot">{i < step ? '✓' : i + 1}</span>
          <span className="step-name">{name}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const { shipping, shippingMethod, payment, setShipping, setShippingMethod, setPayment, setLastOrder, resetForm } =
    useCheckoutStore();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const placed = useRef(false); // stops the "empty cart" redirect from firing after a successful order

  if (items.length === 0 && !placed.current) return <Navigate to="/cart" replace />;

  const updateShipping = (key) => (e) => setShipping({ ...shipping, [key]: e.target.value });

  const updatePayment = (key, format) => (e) =>
    setPayment({ ...payment, [key]: format ? format(e.target.value) : e.target.value });

  const goNext = () => {
    const found = step === 0 ? validateShipping(shipping) : validatePayment(payment);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await createOrder(items); // Fake Store API just echoes back an id
      const totals = orderTotals(items, shippingMethod);
      const orderNumber = `SF-${String(res?.id ?? Date.now()).padStart(6, '0')}`;

      placed.current = true;
      setLastOrder({
        orderNumber,
        items,
        customer: shipping,
        shippingMethod,
        paymentMethod: payment.method,
        cardLast4: payment.method === 'card' ? payment.cardNumber.replace(/\s/g, '').slice(-4) : null,
        ...totals,
        createdAt: new Date().toISOString(),
      });
      clearCart();
      resetForm();
      navigate('/order-success', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'We could not place your order. Please try again.');
      setSubmitting(false);
    }
  };

  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod);

  return (
    <>
      <h1>Checkout</h1>
      <Stepper step={step} />

      <div className="cart-layout">
        <div className="card checkout-card">
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
              noValidate
            >
              <h2>Shipping details</h2>
              <div className="form-grid">
                <Field label="Full name" error={errors.fullName}>
                  <input value={shipping.fullName} onChange={updateShipping('fullName')} autoComplete="name" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={shipping.email} onChange={updateShipping('email')} autoComplete="email" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input type="tel" value={shipping.phone} onChange={updateShipping('phone')} autoComplete="tel" />
                </Field>
                <Field label="Street address" error={errors.address}>
                  <input value={shipping.address} onChange={updateShipping('address')} autoComplete="street-address" />
                </Field>
                <Field label="City" error={errors.city}>
                  <input value={shipping.city} onChange={updateShipping('city')} autoComplete="address-level2" />
                </Field>
                <Field label="Postal code" error={errors.zip}>
                  <input value={shipping.zip} onChange={updateShipping('zip')} autoComplete="postal-code" />
                </Field>
              </div>

              <h3>Delivery method</h3>
              <div className="options">
                {SHIPPING_METHODS.map((m) => (
                  <label key={m.id} className={`option ${shippingMethod === m.id ? 'selected' : ''}`}>
                    <input type="radio" name="shipping-method" checked={shippingMethod === m.id} onChange={() => setShippingMethod(m.id)} />
                    <span>
                      <strong>{m.label}</strong>
                      <small className="muted">{m.eta}</small>
                    </span>
                    <span className="option-price">
                      {m.id === 'standard' ? `Free over $100 / ${money(m.price)}` : money(m.price)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  Continue to payment
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
              noValidate
            >
              <h2>Payment</h2>
              <div className="options">
                <label className={`option ${payment.method === 'card' ? 'selected' : ''}`}>
                  <input type="radio" name="pay" checked={payment.method === 'card'} onChange={() => { setErrors({}); setPayment({ ...payment, method: 'card' }); }} />
                  <span>
                    <strong>Credit / debit card</strong>
                    <small className="muted">Demo only - nothing is charged</small>
                  </span>
                </label>
                <label className={`option ${payment.method === 'cod' ? 'selected' : ''}`}>
                  <input type="radio" name="pay" checked={payment.method === 'cod'} onChange={() => { setErrors({}); setPayment({ ...payment, method: 'cod' }); }} />
                  <span>
                    <strong>Cash on delivery</strong>
                    <small className="muted">Pay when your order arrives</small>
                  </span>
                </label>
              </div>

              {payment.method === 'card' && (
                <div className="form-grid">
                  <Field label="Name on card" error={errors.cardName}>
                    <input value={payment.cardName} onChange={updatePayment('cardName')} autoComplete="cc-name" />
                  </Field>
                  <Field label="Card number" error={errors.cardNumber}>
                    <input
                      value={payment.cardNumber}
                      onChange={updatePayment('cardNumber', formatCardNumber)}
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      autoComplete="cc-number"
                    />
                  </Field>
                  <Field label="Expiry (MM/YY)" error={errors.expiry}>
                    <input value={payment.expiry} onChange={updatePayment('expiry', formatExpiry)} inputMode="numeric" placeholder="12/30" autoComplete="cc-exp" />
                  </Field>
                  <Field label="CVC" error={errors.cvc}>
                    <input
                      value={payment.cvc}
                      onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      inputMode="numeric"
                      placeholder="123"
                      autoComplete="cc-csc"
                    />
                  </Field>
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-ghost" type="button" onClick={goBack}>
                  Back
                </button>
                <button className="btn btn-primary" type="submit">
                  Review order
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2>Review your order</h2>
              <div className="review-grid">
                <section>
                  <h3>Ship to</h3>
                  <p>
                    {shipping.fullName}
                    <br />
                    {shipping.address}, {shipping.city} {shipping.zip}
                    <br />
                    {shipping.email} · {shipping.phone}
                  </p>
                  <button className="link-btn" onClick={() => setStep(0)}>
                    Edit
                  </button>
                </section>
                <section>
                  <h3>Delivery</h3>
                  <p>
                    {method.label}
                    <br />
                    <span className="muted">{method.eta}</span>
                  </p>
                  <button className="link-btn" onClick={() => setStep(0)}>
                    Edit
                  </button>
                </section>
                <section>
                  <h3>Payment</h3>
                  <p>
                    {payment.method === 'cod'
                      ? 'Cash on delivery'
                      : `Card ending in ${payment.cardNumber.replace(/\s/g, '').slice(-4)}`}
                  </p>
                  <button className="link-btn" onClick={() => setStep(1)}>
                    Edit
                  </button>
                </section>
              </div>

              {submitError && (
                <p className="error-banner" role="alert">
                  {submitError}
                </p>
              )}

              <div className="form-actions">
                <button className="btn btn-ghost" onClick={goBack} disabled={submitting}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={placeOrder} disabled={submitting}>
                  {submitting ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary items={items} method={shippingMethod} showItems />
      </div>
    </>
  );
}
