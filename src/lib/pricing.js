export const FREE_SHIPPING_THRESHOLD = 100;

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', eta: '3-5 business days', price: 4.99 },
  { id: 'express', label: 'Express', eta: '1-2 business days', price: 14.99 },
];

export const round2 = (n) => Math.round(n * 100) / 100;

export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const cartCount = (items) => items.reduce((sum, i) => sum + i.qty, 0);

export const cartSubtotal = (items) =>
  round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));

export function shippingCost(subtotal, methodId = 'standard') {
  if (subtotal <= 0) return 0;
  if (methodId === 'express') return SHIPPING_METHODS[1].price;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_METHODS[0].price;
}

export function orderTotals(items, methodId = 'standard') {
  const subtotal = cartSubtotal(items);
  const shipping = shippingCost(subtotal, methodId);
  return { subtotal, shipping, total: round2(subtotal + shipping) };
}

export const capitalize = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
