import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { cartCount } from '../lib/pricing.js';

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
    </svg>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Toast() {
  const message = useToastStore((s) => s.message);
  return (
    <div className={`toast ${message ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default function Layout() {
  const count = useCartStore((s) => cartCount(s.items));

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            Shop<span>front</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>
              Shop
            </NavLink>
          </nav>
          <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          Demo store powered by{' '}
          <a href="https://fakestoreapi.com" target="_blank" rel="noreferrer">
            Fake Store API
          </a>
          . No real payments are made.
        </div>
      </footer>
      <Toast />
    </>
  );
}
