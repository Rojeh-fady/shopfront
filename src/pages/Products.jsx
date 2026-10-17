import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorState, ProductGridSkeleton } from '../components/States.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { getCategories, getProducts } from '../lib/api.js';
import { capitalize } from '../lib/pricing.js';

const SORTS = {
  featured: { label: 'Featured', fn: null },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  rating: { label: 'Top rated', fn: (a, b) => b.rating.rate - a.rating.rate },
  name: { label: 'Name: A to Z', fn: (a, b) => a.title.localeCompare(b.title) },
};

export default function Products() {
  // Filters live in the URL, so a filtered view can be shared / bookmarked / used with the back button
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const cat = params.get('cat') || 'all';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured';
  const min = params.get('min') || '';
  const max = params.get('max') || '';

  const [search, setSearch] = useState(q);
  const debouncedSearch = useDebounce(search, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setParam = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value == null || value === 'all' || value === 'featured') next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  useEffect(() => {
    if (debouncedSearch !== q) setParam('q', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // keep the input in sync when the URL changes from outside (back button, clear filters)
  useEffect(() => {
    setSearch(q);
  }, [q]);

  const products = useAsync((signal) => getProducts(signal), []);
  const categories = useAsync((signal) => getCategories(signal), []);

  const filtered = useMemo(() => {
    if (!products.data) return [];
    const term = q.trim().toLowerCase();
    const lo = min === '' ? -Infinity : Number(min);
    const hi = max === '' ? Infinity : Number(max);

    const list = products.data.filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (!term || p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)) &&
        p.price >= lo &&
        p.price <= hi,
    );
    const cmp = SORTS[sort].fn;
    return cmp ? [...list].sort(cmp) : list;
  }, [products.data, q, cat, min, max, sort]);

  const hasFilters = q || cat !== 'all' || min || max || sort !== 'featured';
  const clearAll = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  return (
    <>
      <section className="hero">
        <h1>Everything you need, nicely sorted.</h1>
        <p className="muted">Browse the catalog, search by name, and filter by category or price.</p>
        <div className="search">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
        </div>
      </section>

      <div className="toolbar">
        <button className="btn btn-ghost filters-toggle" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
          Filters {filtersOpen ? '▴' : '▾'}
        </button>
        <p className="muted results-count" aria-live="polite">
          {products.loading ? 'Loading...' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}
        </p>
        <label className="sort">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="shop-layout">
        <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
          <div className="filter-group">
            <h2>Category</h2>
            <div className="chips">
              <button className={`chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setParam('cat', 'all')}>
                All
              </button>
              {(categories.data || []).map((c) => (
                <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setParam('cat', c)}>
                  {capitalize(c)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h2>Price</h2>
            <div className="price-inputs">
              <input type="number" min="0" inputMode="decimal" placeholder="Min" value={min} onChange={(e) => setParam('min', e.target.value)} aria-label="Minimum price" />
              <span className="muted">–</span>
              <input type="number" min="0" inputMode="decimal" placeholder="Max" value={max} onChange={(e) => setParam('max', e.target.value)} aria-label="Maximum price" />
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost" onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        <section className="results">
          {products.loading && <ProductGridSkeleton />}
          {products.error && <ErrorState error={products.error} onRetry={products.retry} />}
          {!products.loading && !products.error && filtered.length === 0 && (
            <div className="center-state">
              <h2>No products found</h2>
              <p className="muted">Try a different search or loosen your filters.</p>
              <button className="btn btn-primary" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          )}
          {!products.loading && !products.error && filtered.length > 0 && (
            <div className="grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
