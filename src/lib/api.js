const BASE = 'https://fakestoreapi.com';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }
  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status})`, res.status);
  }
  // Fake Store API returns an empty body for unknown ids
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Simple in-memory cache so navigating between pages doesn't refetch everything
let productsCache = null;
let categoriesCache = null;

export async function getProducts(signal) {
  if (productsCache) return productsCache;
  productsCache = await request('/products', { signal });
  return productsCache;
}

export async function getCategories(signal) {
  if (categoriesCache) return categoriesCache;
  categoriesCache = await request('/products/categories', { signal });
  return categoriesCache;
}

export async function getProduct(id, signal) {
  const cached = productsCache?.find((p) => String(p.id) === String(id));
  if (cached) return cached;
  const data = await request(`/products/${id}`, { signal });
  if (!data) throw new ApiError('Product not found', 404);
  return data;
}

// Fake Store API accepts the order but doesn't persist it - it just echoes an id back.
export async function createOrder(items) {
  return request('/carts', {
    method: 'POST',
    body: JSON.stringify({
      userId: 1,
      date: new Date().toISOString(),
      products: items.map((i) => ({ productId: i.id, quantity: i.qty })),
    }),
  });
}
